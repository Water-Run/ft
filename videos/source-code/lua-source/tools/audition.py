"""本片的审片页：文案全文、配音候选、配乐小样、视觉关键帧，汇总到 out/audition/index.html（out/ 不入库）。

用法（在仓库根目录）：
  python videos/source-code/lua-source/tools/audition.py voices     合成配音候选（MiniMax 与微软在线语音，需联网；MiniMax 需密钥）
  python videos/source-code/lua-source/tools/audition.py music      生成配乐小样（tools/music.py）
  python videos/source-code/lua-source/tools/audition.py page       截关键帧、写 index.html
配音候选读的是本片文案里的同一组句子，按脚本的读法表与停顿逐句合成（与正式配音相同的切分方式）；只是试听，不是全片配音。
"""
import asyncio
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

VIDEO = Path(__file__).resolve().parent.parent
REPO = VIDEO.parent.parent.parent
OUT = VIDEO / 'out' / 'audition'
ROUND = 4
# 只试听已选定的音色：Harness 一期的 Crisp_Girl，语速 1.15（2026-11-16 策划者点名沿用）。
# 第 2 版的 5 男 5 女候选见 git 历史。
# (引擎, 音色 id, 名称, 性别, 听感, 以前用在哪里)
VOICES = [
    ('minimax', 'Chinese (Mandarin)_Crisp_Girl', '清脆女声', '女', '2026-11-16 策划者点名沿用', '《150 秒了解 Agent 的手：Harness》（语速 1.15）'),
]
SPEED = 1.15                      # MiniMax 语速；微软在线语音用 +0%
MODEL = 'speech-2.8-hd'
# 代表句（第 4 稿原句）：解释循环一章开头的现象与原因、调用一章的三种结果、结语
SAMPLE_TEXTS = [
    '字符串 "10" 加 1 呢',
    '在 Lua 5.5.1 里，结果是整数 11',
    '在 Lua 5.3 里，结果却是浮点数 11.0',
    '"10" 是字符串，快路不成立，执行落到 MMBIN',
    '一个函数递归调用自己十万层，每层都等下一层返回',
    '程序正常结束',
    '换一种写法，经过 pcall 调用自己',
    '不到 200 层就报错，这次是 C stack overflow',
    '走了一千万层，什么事也没有',
    '三种写法，三种结果',
    '一种机制，往往用在好几处',
    '字符串驻留让比较变成比较指针',
    '也让识别保留字只需要看一个字节',
]
# 上一轮交审的稿本：审片页把这一稿里新增或改写的字幕标出来
PREV_EXPORT = 'review/script.zh.57452d1da2d15af9ad594dfe81d638c3312ff7bc7928696351777651315009b4.md'
PREV_NAME = '第 3 稿'
# 第 3 版审片页之后的意见与处理（原话见 review/NOTES.md「意见与处理」）
FEEDBACK = [
    ('「整片的叙事很多问题, 不应该只有一个例子, 这个就很Claude了抓着一个例子一直说. 不同的地方给出合适的程序, 动态一点的文稿」（2026-11-21）',
     '各章换用自己的程序，开头先给现象再进源码；28 行计数器只留在开场与源码地图（追问后策划者选定）。见第 4 节'),
    ('「本片以 5.5.1 为准，更早的版本，只在说明某处为什么这样实现时才提到。像这种, 人写的只会画面体现, 老版本的时候说老版本」（2026-11-21）',
     '删去讲片子自身安排的句子，交给画面；旧版本处直接说「Lua 5.3」「5.4」'),
    ('「另外还有变更记得推送」（2026-11-21）', '第 3 稿与审片页第 3 版已提交推送（1546dba）；第 4 稿随本版提交推送'),
]
# 这一稿的写法与审查（详见 review/NOTES.md「交审说明」第 4 稿）
ROUNDS = [
    ('写', '每章先写一段能直接运行的程序，在 5.5.1 上跑出结果；涉及版本差异的另在 5.3.6、5.4.9 上跑；回显与源码写成 FACTS Q01–Q16',
     '两处结果和预想不同：互相引用的表加上 __gc 以后，终结器的时机受分代回收影响、不稳定，改成只演示回收；带空洞的表在 5.4 和 5.5 长度不同，正好放进表一章',
     '只把稳定、可复现的结果写进稿子'),
    ('审', '一个独立代理对照 FACTS、各章回显与源码核事实并查叙事',
     '查元方法的顺序说反了；「一共 10 条」漏讲第一条 VARARGPREP；3 == 3.0、t[1.0] 只提出没解释；pcall、「协程」抢先出现；残留讲片子安排的话；画面输出没有旁白对应；两段程序不在章节文件里；章间缺过渡',
     '补 Q13–Q16 并逐条改正；补两段程序并重跑'),
    ('读', '制作方通读；按字幕原文重建术语表与事实对照',
     '每条字幕都有依据，每个术语先有问题再起名', '—'),
]
MUSIC = ('moon', '月下', '按优先级：月、简洁、巴西。72 拍/分，D 大调的 maj9 与 m11 和弦，长而暗的混响留出夜里的空间；'
         '一把尼龙弦式的拨弦按波萨诺瓦的切分轻轻扫弦，低音只在每小节的第一、三拍落下；钟片式的高音动机由四个下行的音组成，'
         '只在推进与最高处出现。全曲只有铺底、拨弦、低音、钟片四层，不用鼓。')


def ffmpeg(name='ffmpeg'):
    # 与 kit/tools/lib.js 相同的查找顺序：仓库 assets/ffmpeg/bin/，再找 PATH
    local = REPO / 'assets' / 'ffmpeg' / 'bin' / (name + ('.exe' if os.name == 'nt' else ''))
    return str(local) if local.exists() else (shutil.which(name) or name)


def script_data():
    js = (
        "const s=require(process.argv[1]);const L=s.layoutScript({});"
        "console.log(JSON.stringify({total:L.total,scenes:s.SCRIPT.map(sc=>{const x=L.scenes.find(q=>q.id===sc.id);"
        "return {id:sc.id,chap:sc.chap,seconds:x.end-x.start,cues:sc.cues.map(c=>({id:c[0],cap:c[1],gap:(c[2]||{}).gap,cont:!!(c[2]||{}).cont,tts:c[1]?s.ttsText(c):null}))}})}))"
    )
    out = subprocess.run(['node', '-e', js, str(VIDEO / 'src' / 'js' / 'script.js')], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(out.stdout)


def probe(path):
    r = subprocess.run([ffmpeg('ffprobe'), '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def synth_edge(text, voice, path):
    import edge_tts

    async def go():
        await edge_tts.Communicate(text, voice, rate='+0%').save(str(path))
    asyncio.run(go())


def voices():
    sys.path.insert(0, str(REPO / 'kit' / 'tools'))
    os.environ.setdefault('LVS_REPO', str(REPO))
    cfg = json.loads((REPO / 'kit' / 'config.local.json').read_text(encoding='utf-8')) if (REPO / 'kit' / 'config.local.json').exists() else {}
    if cfg.get('minimax_base'):
        os.environ.setdefault('LVS_MINIMAX_BASE', cfg['minimax_base'])
    import minimax_tts
    data = script_data()
    bycap = {c['cap']: c for sc in data['scenes'] for c in sc['cues'] if c['cap']}
    cues = [bycap[t] for t in SAMPLE_TEXTS]
    cache = OUT / 'voice-cache'
    cache.mkdir(parents=True, exist_ok=True)
    report = []
    for engine, vid, name, sex, desc, prior in VOICES:
        safe = re.sub(r'[^A-Za-z0-9_-]+', '_', vid)
        parts = []
        for c in cues:
            key = hashlib.sha1(f'{engine}|{vid}|{SPEED}|{c["tts"]}'.encode('utf-8')).hexdigest()[:10]   # 文本或语速变了就重合成
            mp3 = cache / f'{safe}-{key}.mp3'
            if not mp3.exists():
                for attempt in range(4):
                    try:
                        if engine == 'minimax':
                            minimax_tts.synth(c['tts'], 'zh', MODEL, vid, SPEED, str(mp3))
                        else:
                            synth_edge(c['tts'], vid, mp3)
                        break
                    except Exception as error:
                        if attempt == 3:
                            raise
                        print('retry', vid, c['id'], error)
            parts.append((mp3, c.get('gap') if c.get('gap') is not None else 0.3))
        inputs, filters = [], []
        for i, (mp3, gap) in enumerate(parts):
            inputs += ['-i', str(mp3)]
            filters.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=mono,apad=pad_dur={gap:.2f}[a{i}]')
        filt = ';'.join(filters) + ';' + ''.join(f'[a{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=0:a=1[out]'
        dest = OUT / f'voice-{safe}.mp3'
        subprocess.run([ffmpeg(), '-y', '-v', 'error', *inputs, '-filter_complex', filt, '-map', '[out]', '-b:a', '160k', str(dest)], check=True)
        dur = probe(dest)
        report.append({'engine': engine, 'voice': vid, 'name': name, 'sex': sex, 'desc': desc, 'prior': prior, 'file': dest.name, 'seconds': round(dur, 1)})
        print(vid, f'{dur:.1f}s')
    # 全片时长：同一组句子的估算值与实测值之比，换算全片旁白（估算公式同 script.js 的 estimate）
    est = lambda t: 0.35 + len(re.sub(r'[，。：；、\s]', '', t)) / 5.2
    e = sum(est(c['tts']) for c in cues)
    g = sum((c.get('gap') if c.get('gap') is not None else 0.3) for c in cues)
    speech = sum(est(c['tts']) for sc in data['scenes'] for c in sc['cues'] if c['cap'])
    for r in report:
        k = (r['seconds'] - g) / e
        r['film_minutes'] = round((data['total'] - speech + speech * k) / 60, 1)
    (OUT / 'voices.json').write_text(json.dumps({'speed': SPEED, 'model': MODEL, 'texts': SAMPLE_TEXTS, 'voices': report}, ensure_ascii=False, indent=1), encoding='utf-8')


def music():
    key = MUSIC[0]
    wav = OUT / f'music-{key}.wav'
    subprocess.run([sys.executable, '-I', str(VIDEO / 'tools' / 'music.py'), 'demo', key, str(wav), '84'], check=True)
    subprocess.run([ffmpeg(), '-y', '-v', 'error', '-i', str(wav), '-b:a', '192k', str(OUT / f'music-{key}.mp3')], check=True)
    wav.unlink()


def shots(pages):
    """关键帧：src/design/<页>.html?f=1..n，用 look.js 截图后拷到审片页目录。"""
    frames = []
    env = dict(os.environ, MSYS_NO_PATHCONV='1')
    for page, n in pages:
        for f in range(1, n + 1):
            url = f'/design/{page}?f={f}'
            subprocess.run(['node', str(REPO / 'kit' / 'tools' / 'look.js'), str(VIDEO.relative_to(REPO)).replace('\\', '/'),
                            '--url', url, '--size', '1920x1080', '--brief'], cwd=REPO, env=env, check=True, capture_output=True)
            src = VIDEO / 'shots' / ('page_' + re.sub(r'[^\w]+', '_', url) + '.png')
            dst = OUT / f'key-{Path(page).stem}-{f}.png'
            shutil.copyfile(src, dst)
            frames.append(dst.name)
    return frames


def loudness(path):
    """整合响度（EBU R128），读不到时返回 None。"""
    if not path.exists():
        return None
    r = subprocess.run([ffmpeg(), '-hide_banner', '-nostats', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    found = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)
    return float(found[-1]) if found else None


def prev_captions():
    path = VIDEO / PREV_EXPORT
    if not path.exists():
        return None
    caps = set()
    for line in path.read_text(encoding='utf-8').splitlines():
        m = re.match(r'^\| ([a-z]+\d+) \| (.*?) \|$', line)
        if m:
            caps.add(m.group(2))
    return caps


def page():
    data = script_data()
    meta = json.loads((VIDEO / 'src' / 'design' / 'fusion.json').read_text(encoding='utf-8'))
    frames = shots([('fusion.html', len(meta['frames']))])
    vj = json.loads((OUT / 'voices.json').read_text(encoding='utf-8')) if (OUT / 'voices.json').exists() else {'voices': [], 'texts': []}
    chosen = {x[1] for x in VOICES}
    vj['voices'] = [v for v in vj.get('voices', []) if v['voice'] in chosen]
    prev = prev_captions()
    esc = html.escape
    cap = lambda s: re.sub(r'\*(.+?)\*', r'<b>\1</b>', esc(s))
    caps = [c['cap'] for sc in data['scenes'] for c in sc['cues'] if c['cap']]
    n_new = sum(1 for c in caps if prev is not None and c not in prev)
    body = []
    body.append(f'<h1><img src="lua-logo.svg" alt="Lua">Lua源码全解析 · 审片页 · 第 {ROUND} 版</h1>')
    body.append(f'<p class="lead">文案第 4 稿，{len(caps)} 条字幕，按估算语速约 {data["total"] / 60:.0f} 分钟（配音后以实测为准）。'
                '视觉融合方案与配乐「月下」已采用，音色已定；这一版要审定的是文案。淡紫框是需要回复的事项。</p>')
    body.append('<h2>0. 第 3 版之后的意见与处理</h2><table class="v">')
    for said, done in FEEDBACK:
        body.append(f'<tr><td class="q">{esc(said)}</td><td>{done}</td></tr>')
    body.append('</table>')
    body.append('<h2>1. 视觉：按内容选形式（已采用）</h2>')
    body.append(f'<p>{esc(meta["principle"])}</p><table class="v map"><tr><th>内容</th><th>形式</th><th>理由</th></tr>')
    for c, form, why in meta['mapping']:
        body.append(f'<tr><td>{esc(c)}</td><td>{esc(form)}</td><td>{esc(why)}</td></tr>')
    body.append('</table><div class="frames2">')
    for i, f in enumerate(frames):
        body.append(f'<figure><a href="{f}"><img src="{f}"></a><figcaption>{esc(meta["frames"][i])}</figcaption></figure>')
    body.append('</div><p class="done">2026-11-21 策划者：「两样都采用」。场景按这一套实现。关键帧画的还是第 3 稿的例子（整数 40、next_value 的调用帧）；形式不变，正式场景换成第 4 稿各章的程序。</p>')
    body.append('<h2>2. 配音（已选定）</h2>')
    body.append(f'<p>MiniMax {esc(vj.get("model", ""))}，语速 {vj.get("speed", "")}。读下面这组第 4 稿原句（取自解释循环、调用两章与结语），'
                '按本片的读法表与停顿逐句合成，切分方式与正式配音相同。这只是试听；全片等文案确认后再合成。</p>')
    body.append('<ol class="sample">' + ''.join(f'<li>{cap(t)}</li>' for t in vj.get('texts', [])) + '</ol><table class="v">')
    for v in vj['voices']:
        film = v.get('film_minutes')
        lufs = loudness(OUT / v['file'])
        body.append(f'<tr><td><b>{esc(v["name"])}</b><br><code>{esc(v["voice"])}</code><br>{esc(v["desc"])}<br><span class="dim">以前：{esc(v["prior"])}</span></td>'
                    f'<td><audio controls preload="none" src="{v["file"]}"></audio><br>{v["seconds"]} 秒' +
                    (f' · 按此语速全片约 {film:.0f} 分钟' if film else '') +
                    (f'<br><span class="dim">试听段整合响度 {lufs:.1f} LUFS，是合成的原始电平；混音把旁白按 rms 对齐，成片按 -16 LUFS 交付，'
                     '所以正式片的音量不取决于这里</span>' if lufs is not None else '') + '</td></tr>')
    if not vj['voices']:
        body.append('<tr><td colspan="2">（试听尚未合成：先运行 <code>audition.py voices</code>）</td></tr>')
    body.append('</table><p class="ask">这个音色在长片里的语速与精神是否合适（经验规则 F17）；第 7 句的 pcall 按「P call」合成，是否清楚。'
                '制作方没有听过这段音频，只用 Whisper 不带提示转写核对过：没有漏读；MMBIN 听成「MM 冰」，即读作 M M bin；'
                'pcall 被转写成「pico」，可能连读得太紧，请以人耳为准。</p>')
    body.append('<h2>3. 配乐（已采用）</h2>')
    body.append(f'<table class="v"><tr><td><b>{esc(MUSIC[1])}</b><br>{esc(MUSIC[2])}</td><td><audio controls preload="none" src="music-{MUSIC[0]}.mp3"></audio>'
                '<br>约 84 秒：引子、推进、最高处、收束</td></tr></table>')
    body.append('<p class="done">2026-11-21 策划者：「两样都采用」。正式配乐按章节排段落：讲机制的段落只留铺底与拨弦，章节之间与结语让钟片动机出现；旁白出现时自动压低。</p>')
    body.append('<h2>4. 文案第 4 稿</h2>')
    body.append('<p>这一稿不再用一段程序贯穿全片：各章先摆出一段程序和它的结果，再到源码里找原因。写、审、读三步：</p>')
    body.append('<table class="v map"><tr><th>轮次</th><th>方式</th><th>发现</th><th>处理</th></tr>')
    for r in ROUNDS:
        body.append('<tr>' + ''.join(f'<td>{esc(x)}</td>' for x in r) + '</tr>')
    body.append('</table>')
    body.append('<p>28 行计数器只在开场与源码地图里出现；原来逐段讲这段程序的第 2 章删去，结尾不再逐行回放。'
                '各章用到的程序在 <code>research/lab/chapters/</code>，回显在 <code>out_14_chapter_runs.txt</code>。'
                '请特别看：各章程序是否合适；第 5 章的密度；结尾两句概括性的说法。详见 <code>review/NOTES.md</code>「交审说明」第 4 稿。</p>')
    body.append('<table class="v map"><tr><th>部分</th><th>章</th><th>估算</th><th>这一章回答</th></tr>')
    secs = {sc['id']: sc['seconds'] for sc in data['scenes']}
    for part, sid, q in meta['outline']:
        sc = next(x for x in data['scenes'] if x['id'] == sid)
        title = f'{sc["chap"][0]} {sc["chap"][1]}' if sc['chap'] else '开场'
        m, s = divmod(round(secs[sid]), 60)
        body.append(f'<tr><td>{esc(part)}</td><td>{esc(title)}</td><td>{m}:{s:02d}</td><td>{esc(q)}</td></tr>')
    body.append('</table>')
    note = '鼠标停在句子上可看到句号；<b>粗体</b>是术语第一次出现处'
    if prev is not None:
        note += f'；<span class="new">带下划线的</span>是这一稿新增或改写的字幕（{n_new} / {len(caps)} 条），其余与{PREV_NAME}逐字相同'
    body.append(f'<p>全文如下。{note}。</p>')
    for sc in data['scenes']:
        if sc['id'] == 'credits':
            continue
        title = f'{sc["chap"][0]} {sc["chap"][1]}' if sc['chap'] else '开场'
        paras, cur = [], ''
        for c in sc['cues']:
            if not c['cap']:
                continue
            cls = ' class="new"' if prev is not None and c['cap'] not in prev else ''
            cur += f'<span title="{c["id"]}"{cls}>{cap(c["cap"])}</span>{"，" if c["cont"] else "。"}'
            if not c['cont'] and (c.get('gap') or 0) >= 0.8:
                paras.append(cur)
                cur = ''
        if cur:
            paras.append(cur)
        body.append(f'<h3>{esc(title)}</h3>' + ''.join(f'<p class="text">{p}</p>' for p in paras))
    body.append('<p class="ask">文案请按「句号 + 问题 + 建议」给意见；明确确认后才合成全片配音。</p>')
    css = ('body{font:17px/1.75 "Noto Sans SC",sans-serif;max-width:1120px;margin:32px auto;padding:0 24px;color:#000;background:#fff}'
           'h1{color:#000080;font-weight:normal;font-size:32px}h1 img{height:64px;vertical-align:middle;margin-right:16px}'
           'h2{color:#000080;font-weight:normal;margin-top:52px;border-bottom:1px solid #ccc}h2:before{content:"\\2756";padding-right:.5em}'
           'h3{color:#000080;font-weight:normal;margin-top:28px}.frames2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}'
           'figure{margin:0}figure img{width:100%;border:1px solid #ccc}figcaption{font-size:14px;color:#555}'
           'table.v{border-collapse:collapse;width:100%}table.v td,table.v th{border-top:1px solid #ccc;padding:9px 10px;vertical-align:top;text-align:left}'
           'table.map th{color:#000080;font-weight:normal}td.q{width:34%;color:#333}.dim{color:#666;font-size:14px}'
           'audio{width:400px;max-width:100%}.ask{background:#D0D0FF;padding:8px 12px}'
           '.done{background:#F8F8F8;border-left:3px solid #000080;padding:8px 12px}.lead{color:#333}'
           '.text span:hover{background:#D0D0FF}.new{text-decoration:underline;text-decoration-color:#000080;text-underline-offset:4px}'
           'ol.sample{color:#333;font-size:15px;columns:2}code{font-family:"JetBrains Mono",monospace;font-size:14px}'
           '@media (max-width:700px){.frames2{grid-template-columns:1fr}ol.sample{columns:1}body{overflow-wrap:anywhere}'
           'table.v td,table.v th{padding:6px 4px}td.q{width:40%}}')
    doc = (f'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           f'<title>Lua源码全解析 · 审片页 v{ROUND}</title><style>{css}</style><body>{"".join(body)}</body></html>')
    shutil.copyfile(VIDEO / 'src' / 'img' / 'lua-logo.svg', OUT / 'lua-logo.svg')
    (OUT / 'index.html').write_text(doc, encoding='utf-8')
    print('wrote', (OUT / 'index.html').relative_to(REPO))


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    {'voices': voices, 'music': music, 'page': page}[sys.argv[1]]()
