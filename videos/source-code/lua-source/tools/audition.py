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
ROUND = 2
# (引擎, 音色 id, 名称, 性别, 听感, 以前用在哪里)
VOICES = [
    ('minimax', 'Chinese (Mandarin)_Male_Announcer', '播报男声', '男', '中年男声，清晰、有分量', 'PostgreSQL 中文（2026-10）'),
    ('minimax', 'lengdan_xiongzhang', '冷淡学长', '男', '平静克制的青年男声', 'Pando'),
    ('minimax', 'male-qn-jingying-jingpin', '精英青年', '男', '利落的青年男声', '量化（in-seconds）'),
    ('minimax', 'Chinese (Mandarin)_Sincere_Adult', '真诚青年', '男', '平实的青年男声', '思维链'),
    ('edge', 'zh-CN-YunyangNeural', 'Yunyang', '男', '微软新闻播音男声', '早期几部的缺省音色'),
    ('minimax', 'Chinese (Mandarin)_News_Anchor', '新闻女声', '女', '标准播音腔的中年女声', 'HTTP 状态码、php2shell'),
    ('minimax', 'female-chengshu-jingpin', '成熟女性', '女', '沉稳的成年女声', 'InnoDB'),
    ('minimax', 'Chinese (Mandarin)_Wise_Women', '阅历姐姐', '女', '知性的中年女声', 'MyISAM 新版试听（未选）'),
    ('minimax', 'Chinese (Mandarin)_Warm_Bestie', '温暖闺蜜', '女', '清晰友好的青年女声', '未用过'),
    ('edge', 'zh-CN-XiaoxiaoNeural', 'Xiaoxiao', '女', '微软通用女声', '未用过'),
]
SPEED = 1.0                       # MiniMax 语速；微软在线语音用 +0%
MODEL = 'speech-2.8-hd'
# 代表句：协程的语言层面说明、编译一行源码、C 调用层数、结尾的总结
SAMPLE_TEXTS = [
    '普通的函数调用有严格的先后',
    '调用方停下来，被调用的函数一直运行到返回',
    '控制才回到调用方',
    '协程打破了这一点',
    '它可以在中途暂停，把控制交还给调用方',
    '之后再从暂停的地方继续',
    '读到加号时，加法要求左边的操作数已经在寄存器里',
    '编译器这才生成第一条指令 GETTABUP',
    '从上值所指的表里取出字段',
    '放进下一个空闲的寄存器，也就是 1 号',
    '一个函数通过 pcall 调用自己，到第 198 层就会报错',
    '错误信息是 C stack overflow',
    '其一，同一种机制往往用在好几处',
    '字符串驻留让比较变成比较指针',
    '也让识别保留字只需要看一个字节',
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


def page():
    data = script_data()
    meta = json.loads((VIDEO / 'src' / 'design' / 'fusion.json').read_text(encoding='utf-8'))
    frames = shots([('fusion.html', len(meta['frames']))])
    vj = json.loads((OUT / 'voices.json').read_text(encoding='utf-8')) if (OUT / 'voices.json').exists() else {'voices': [], 'texts': []}
    esc = html.escape
    cap = lambda s: re.sub(r'\*(.+?)\*', r'<b>\1</b>', esc(s))
    n_cues = sum(1 for sc in data['scenes'] for c in sc['cues'] if c['cap'])
    body = []
    body.append(f'<h1><img src="lua-logo.svg" alt="Lua">Lua源码全解析 · 审片页 · 第 {ROUND} 版</h1>')
    body.append(f'<p class="lead">文案第 2 稿 {n_cues} 句旁白，按估算语速约 {data["total"] / 60:.0f} 分钟（配音后以实测为准）；'
                '视觉为融合方案；配音 5 男 5 女；配乐一首。每节末尾的淡紫框是需要选定的事项。</p>')
    body.append('<h2>0. 第 1 版意见与处理</h2><table class="v">')
    for said, done in meta['feedback']:
        body.append(f'<tr><td class="q">{esc(said)}</td><td>{done}</td></tr>')
    body.append('</table>')
    body.append('<h2>1. 视觉：按内容选形式</h2>')
    body.append(f'<p>{esc(meta["principle"])}</p><table class="v map"><tr><th>内容</th><th>形式</th><th>理由</th></tr>')
    for c, form, why in meta['mapping']:
        body.append(f'<tr><td>{esc(c)}</td><td>{esc(form)}</td><td>{esc(why)}</td></tr>')
    body.append('</table><div class="frames2">')
    for i, f in enumerate(frames):
        body.append(f'<figure><a href="{f}"><img src="{f}"></a><figcaption>{esc(meta["frames"][i])}</figcaption></figure>')
    body.append('</div><p class="ask">这一套是否可以作为全片的视觉方案；哪一帧、哪种内容的形式要换。</p>')
    body.append('<h2>2. 配音候选（5 男 5 女）</h2>')
    body.append(f'<p>MiniMax {esc(vj.get("model", ""))} 语速 {vj.get("speed", "")}，微软在线语音 +0%。都读下面这组句子（取自第 14、6、9 章与结语），'
                '按本片的读法表与停顿逐句合成，切分方式与正式配音相同。可用的中文音色有限，按「尽量不同」挑选，以前的用处写在旁边。</p>')
    body.append('<ol class="sample">' + ''.join(f'<li>{cap(t)}</li>' for t in vj.get('texts', [])) + '</ol>')
    for sex in ('男', '女'):
        body.append(f'<h3>{sex}声</h3><table class="v">')
        for v in [x for x in vj.get('voices', []) if x['sex'] == sex]:
            film = v.get('film_minutes')
            body.append(f'<tr><td><b>{esc(v["name"])}</b><br><code>{esc(v["voice"])}</code><br>{esc(v["desc"])}<br><span class="dim">以前：{esc(v["prior"])}</span></td>'
                        f'<td><audio controls preload="none" src="{v["file"]}"></audio><br>{v["seconds"]} 秒' +
                        (f' · 按此语速全片约 {film:.0f} 分钟' if film else '') + '</td></tr>')
        body.append('</table>')
    body.append('<p class="ask">请选一个音色（可同时给语速）。都不合适，也请说明想要的方向：年龄、语速、播音腔或讲课腔。</p>')
    body.append('<h2>3. 配乐</h2>')
    body.append(f'<table class="v"><tr><td><b>{esc(MUSIC[1])}</b><br>{esc(MUSIC[2])}</td><td><audio controls preload="none" src="music-{MUSIC[0]}.mp3"></audio>'
                '<br>约 84 秒：引子、推进、最高处、收束</td></tr></table>')
    body.append('<p class="ask">是否采用。正式配乐按章节排段落：讲机制的段落只留铺底与拨弦，章节之间与结语让钟片动机出现；旁白出现时自动压低。</p>')
    body.append('<h2>4. 文案第 2 稿</h2>')
    body.append('<p>结构分四部分；每个机制章先在语言层面讲清这个特性是什么，再看实现。鼠标停在句子上可看到句号；<b>粗体</b>是术语第一次出现处。</p>')
    body.append('<table class="v map"><tr><th>部分</th><th>章</th><th>估算</th><th>这一章回答</th></tr>')
    secs = {sc['id']: sc['seconds'] for sc in data['scenes']}
    for part, sid, q in meta['outline']:
        sc = next(x for x in data['scenes'] if x['id'] == sid)
        title = f'{sc["chap"][0]} {sc["chap"][1]}' if sc['chap'] else '开场'
        m, s = divmod(round(secs[sid]), 60)
        body.append(f'<tr><td>{esc(part)}</td><td>{esc(title)}</td><td>{m}:{s:02d}</td><td>{esc(q)}</td></tr>')
    body.append('</table>')
    for sc in data['scenes']:
        if sc['id'] == 'credits':
            continue
        title = f'{sc["chap"][0]} {sc["chap"][1]}' if sc['chap'] else '开场'
        paras, cur = [], ''
        for c in sc['cues']:
            if not c['cap']:
                continue
            cur += f'<span title="{c["id"]}">{cap(c["cap"])}{"，" if c["cont"] else "。"}</span>'
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
           'audio{width:400px}.ask{background:#D0D0FF;padding:8px 12px}.lead{color:#333}.text span:hover{background:#D0D0FF}'
           'ol.sample{color:#333;font-size:15px;columns:2}code{font-family:"JetBrains Mono",monospace;font-size:14px}')
    doc = f'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>Lua源码全解析 · 审片页 v{ROUND}</title><style>{css}</style><body>{"".join(body)}</body></html>'
    shutil.copyfile(VIDEO / 'src' / 'img' / 'lua-logo.svg', OUT / 'lua-logo.svg')
    (OUT / 'index.html').write_text(doc, encoding='utf-8')
    print('wrote', (OUT / 'index.html').relative_to(REPO))


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    {'voices': voices, 'music': music, 'page': page}[sys.argv[1]]()
