# 本地审片页的配音试听：5 个候选音色读同一组代表句，各拼成一段，并按实测语速估算全片时长。
# 只是试听，不是全片配音：不写 timing 文件，不碰 audio/；全片配音等文案确认后用 kit/tools/tts.js。
# 用法：python videos/standalone/chain-of-thought/tools/audition.py voices      合成并拼接（需要 MiniMax 密钥，见 kit/tools/minimax_tts.py）
#       python videos/standalone/chain-of-thought/tools/audition.py estimate    只按已合成的试听估算全片时长
# 输出：out/audition/voices/<音色>.mp3、out/audition/voices/report.json（out/ 不入库）
import json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(VIDEO, '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'kit', 'tools'))
os.environ.setdefault('LVS_REPO', REPO)
for host in ('api.minimaxi.com', 'minimaxi.com', '.aliyuncs.com'):
    os.environ['NO_PROXY'] = ','.join(x for x in (os.environ.get('NO_PROXY', ''), host) if x)
os.environ['no_proxy'] = os.environ['NO_PROXY']
FFMPEG = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
OUT = os.path.join(VIDEO, 'out', 'audition', 'voices')
MODEL = 'speech-2.8-hd'
SPEED = 1.2
# 候选：都没在近期成片里用过；性别取自 MiniMax get_voice 的 voice_name 与 description（2026-11-03 列出）
VOICES = [
    ('Chinese (Mandarin)_Gentle_Youth', '温润青年', '男', '一位温柔的青年男性声音'),
    ('lengdan_xiongzhang', '冷淡学长', '男', '冷淡学长音色'),
    ('Chinese (Mandarin)_Sincere_Adult', '真诚青年', '男', '一位真诚、富有鼓励性的青年男性声音'),
    ('Chinese (Mandarin)_Gentle_Senior', '温柔学姐', '女', '一位温暖温柔的青年学姐声音'),
    ('Chinese (Mandarin)_Warm_Bestie', '温暖闺蜜', '女', '一位温暖清脆的青年女性闺蜜声音'),
]
# 代表句：开场的问题与反差、专名与英文、百分数、年份、术语、结论句、故事与引文
CUES = ['o1', 'o4', 'o8', 'o9', 'h4', 'h6', 'h7', 'c6', 'c13', 's12', 's13', 'f17', 'r11', 'e5']
GAP = 0.55


def script():
    code = "const s=require(process.argv[1]);const L=s.layoutScript({});console.log(JSON.stringify({order:L.order,cues:L.cues,scenes:L.scenes,SCRIPT:s.SCRIPT}))"
    return json.loads(subprocess.check_output(['node', '-e', code, os.path.join(VIDEO, 'src', 'js', 'script.js')], encoding='utf-8'))


def fname(vid):
    return re.sub(r'[^A-Za-z0-9_-]+', '_', vid).strip('_')


def chars(text):
    return len(re.sub(r'[，。：；、？！“”‘’（）\s,.:;?!\'"()]', '', text))


def voices():
    import minimax_tts
    sc = script()
    os.makedirs(OUT, exist_ok=True)
    report = []
    for vid, name, sex, desc in VOICES:
        parts, rows = [], []
        for cid in CUES:
            text = sc['cues'][cid]['tts']
            path = os.path.join(OUT, 'parts', '%s__%s__%s.mp3' % (fname(vid), SPEED, cid))
            os.makedirs(os.path.dirname(path), exist_ok=True)
            meta = path + '.json'
            if os.path.exists(meta):
                d = json.load(open(meta, encoding='utf-8'))['d']
            else:
                for k in range(6):
                    try:
                        d, words = minimax_tts.synth(text, 'zh', MODEL, vid, SPEED, path)
                        break
                    except Exception as e:
                        print('  retry', vid, cid, e)
                        time.sleep(4 * (k + 1))
                else:
                    raise SystemExit('合成失败：%s %s' % (vid, cid))
                json.dump({'text': text, 'd': d}, open(meta, 'w', encoding='utf-8'), ensure_ascii=False)
            parts.append((path, d))
            rows.append({'cue': cid, 'text': text, 'd': d, 'chars': chars(text)})
            print(name, cid, d)
        # 拼接：每句截到实测时长 d，句间留 GAP 秒
        args = [FFMPEG, '-y', '-loglevel', 'error']
        for p, d in parts:
            args += ['-t', '%.3f' % d, '-i', p]
        filt = ''.join('[%d:a]aresample=44100,apad=pad_dur=%.2f[a%d];' % (i, GAP, i) for i in range(len(parts)))
        filt += ''.join('[a%d]' % i for i in range(len(parts))) + 'concat=n=%d:v=0:a=1[out]' % len(parts)
        dst = os.path.join(OUT, fname(vid) + '.mp3')
        subprocess.check_call(args + ['-filter_complex', filt, '-map', '[out]', '-ac', '1', '-b:a', '160k', dst])
        rate = sum(r['chars'] for r in rows) / sum(r['d'] for r in rows)
        report.append({'id': vid, 'name': name, 'sex': sex, 'desc': desc, 'speed': SPEED, 'file': fname(vid) + '.mp3', 'rate': round(rate, 2), 'rows': rows})
    json.dump(report, open(os.path.join(OUT, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    estimate()


def estimate():
    sc = script()
    report = json.load(open(os.path.join(OUT, 'report.json'), encoding='utf-8'))
    for v in report:
        dur = {}
        for cid in sc['order']:
            c = sc['cues'][cid]
            if not c['silent']:
                dur[cid] = {'d': 0.12 + chars(c['tts']) / v['rate'], 'words': None}
        code = "const s=require(process.argv[1]);console.log(JSON.stringify(s.layoutScript(JSON.parse(process.argv[2])).total))"
        total = json.loads(subprocess.check_output(['node', '-e', code, os.path.join(VIDEO, 'src', 'js', 'script.js'), json.dumps(dur)], encoding='utf-8'))
        v['total'] = round(total, 1)
        print('%-36s %s %.2f 字/秒  全片约 %d:%02d' % (v['id'], v['sex'], v['rate'], total // 60, total % 60))
    json.dump(report, open(os.path.join(OUT, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def music():
    # 三个配乐方向的小样，各约 60 秒：tools/music.py 的 demo_a / demo_b / demo_c
    import wave
    import numpy as np
    sys.path.insert(0, HERE)
    import music as mu
    out = os.path.join(VIDEO, 'out', 'audition', 'music')
    os.makedirs(out, exist_ok=True)
    for key, (name, fn) in mu.DEMOS.items():
        t0 = time.time()
        x = fn(60.0)
        pcm = (np.clip(x.T, -1, 1) * 32767).astype('<i2')
        wav = os.path.join(out, key + '.wav')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(mu.SR); w.writeframes(pcm.tobytes())
        subprocess.check_call([FFMPEG, '-y', '-loglevel', 'error', '-i', wav, '-b:a', '192k', os.path.join(out, key + '.mp3')])
        os.remove(wav)
        print(key, name, '%.1fs' % (time.time() - t0))


MUSIC_NOTES = {
    'A': ('落字', '毡音钢琴，76 拍/分。一拍一个音，像 token 一块一块落下；推进时加低音与铺底，最高处加一条高声部，收束回到单音。安静、贴近，适合「思考」的私密感。'),
    'B': ('运算', '柔和的拨弦脉冲，104 拍/分。两条长度不同的音型错开相位，慢慢咬合，像在一步一步算；低音落在小节头，最高处加钢片琴旋律。节奏感最强。'),
    'C': ('长句', '弦乐长音与钢片琴，66 拍/分。两小节换一个和弦，四个音的动机像一句问话、停在没有解决的音上；渐强到最高处再收回。最有「哲学」与纪录片的质感。'),
}
VISUAL_NOTES = {
    'A': ('生成', '跟着一次生成走：画面就是模型正在写的那一页，token 一块块排出来，思考用紫色、回答用墨色。比较的是「写在前面」和「写在后面」。最贴近大模型的界面感。'),
    'B': ('草稿纸', '同一道题的三种问法并排摊开，像桌上的三张草稿；错的位数用荧光笔标出，数据用并列的小图。比较的是三条路径本身。最有纸面的质感。'),
    'C': ('剖面', '剖开模型看一个 token 怎样被算出来：层的堆叠是一块立体的切片，往回读用连线画出来。比较的是模型内部的结构。最有技术感，最抽象。'),
}
OPEN = [
    '片长：按 1.2 倍速实测语速估算，五个音色的全片在 6:47–7:24 之间（见配音一节）。选了偏慢的音色时，是提一点语速，还是再删字？可删的候选：第 04 章丝袜实验压到三句；第 02 章「理论研究也证明」两句。',
    '第 04 章用 1977 年的丝袜实验说明「人也一样」，这是本片哲学意味的落点，但离大模型最远。保留还是删去？',
    '实验用的是 DeepSeek 开放平台（接口返回的型号是 deepseek-flash）。开场只说「一个大模型」，第 05 章才点名「DeepSeek 的思考模式」。开场要不要就点名？',
    '开场的乘法 25992 × 92138 按「两万五千九百九十二」读；后面画面上的十位数不念，只说「前四位对、后四位也对」。',
]


def page():
    import html, shutil
    esc = html.escape
    sc = script()
    au = os.path.join(VIDEO, 'out', 'audition')
    kf = os.path.join(au, 'keyframes')
    os.makedirs(kf, exist_ok=True)
    for d in 'ABC':
        for f in '123':
            src = os.path.join(VIDEO, 'shots', 'page__design_keyframes_html_d_%s_f_%s.png' % (d, f))
            shutil.copyfile(src, os.path.join(kf, '%s%s.png' % (d, f)))
    report = json.load(open(os.path.join(OUT, 'report.json'), encoding='utf-8'))
    exports = sorted((x for x in os.listdir(os.path.join(VIDEO, 'review')) if x.startswith('script.zh.')), key=lambda x: os.path.getmtime(os.path.join(VIDEO, 'review', x)))
    cur = exports[-1].split('.')[2] if exports else '未导出'
    P = []
    P.append('<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>CoT：先思考，再回答 · 审片页</title><style>')
    P.append('''body{margin:0;background:#f6f6f3;color:#18181b;font:17px/1.75 "Noto Sans SC","Microsoft YaHei",sans-serif}
main{max-width:1180px;margin:0 auto;padding:48px 40px 120px}h1{font-size:34px;margin:0 0 6px}h2{font-size:24px;margin:56px 0 14px;padding-top:18px;border-top:1px solid #ddd}
h3{font-size:19px;margin:28px 0 6px}.meta{color:#666;font-size:15px}.box{background:#fff;border:1px solid #e3e3df;border-radius:10px;padding:18px 22px;margin:12px 0}
.cue{display:inline}.cid{font:12px monospace;color:#9a9aa3;vertical-align:super;margin:0 2px 0 6px}.chap{font-weight:700;color:#5a4fcf}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #eee;padding:8px 10px;text-align:left;vertical-align:top;font-size:15px}
audio{width:100%;margin-top:6px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.grid img{width:100%;border:1px solid #ddd;border-radius:6px;cursor:zoom-in}
.ask{background:#fffbe9;border-color:#f0dc9a}ol li{margin:6px 0}.sil{color:#9a9aa3}''')
    P.append('</style></head><body><main>')
    P.append('<h1>CoT：先思考，再回答 · 审片页</h1><div class="meta">第 1 稿 · 2026-11-03 · 内容哈希 <code>%s</code> · 只有中文 · 目标 6–7 分钟</div>' % esc(cur[:16]))
    P.append('<div class="box ask"><b>请一次选定四样</b>：①文案意见或确认（按句号说即可，例如「c9：……」）；②配音 5 选 1；③配乐 3 选 1；④视觉方向 3 选 1。配音只是试听，全片配音等文案确认后再做。</div>')
    P.append('<div class="box">核心问题：为什么让模型「先思考，再回答」，它就能答对？它写下的「思考」又是什么？<br>贯穿例子：一道真实的乘法 25992 × 92138，同一个模型三种问法（只许说答案 / 先写过程 / 先写答案再写过程），数据来自本片实验（DeepSeek 开放平台，2026-11-03）。事实出处见 <code>research/FACTS.md</code>。</div>')
    P.append('<h2>一、文案（第 1 稿）</h2>')
    for s in sc['SCRIPT']:
        head = ('<span class="chap">%s %s</span>' % (s['chap'][0], esc(s['chap'][1]))) if s['chap'] else ('<span class="chap">%s</span>' % {'open': '开场', 'end': '结尾', 'credits': '片尾'}.get(s['id'], s['id']))
        body = []
        for cid, cap, o in s['cues']:
            if cap is None:
                body.append('<span class="sil">（%s：无旁白，%s 秒）</span>' % ('片名' if cid == 'oT' else '片尾名单', o.get('pause')))
                continue
            body.append('<span class="cue"><span class="cid">%s</span>%s</span>' % (cid, esc(cap.replace('*', ''))))
        P.append('<div class="box">%s<p>%s</p></div>' % (head, '。'.join(body).replace('？。', '？').replace('</span>。<span class="sil">', '</span> <span class="sil">')))
    P.append('<h3>待定的问题</h3><ol>' + ''.join('<li>%s</li>' % esc(x) for x in OPEN) + '</ol>')
    P.append('<h2>二、配音（5 选 1，MiniMax speech-2.8-hd，语速 1.2）</h2><p class="meta">同一组 14 句代表句：%s。都没在近期成片里用过；性别取自 MiniMax 的音色说明。全片时长按各自实测语速估算。</p>' % '、'.join(CUES))
    P.append('<table><tr><th>音色</th><th>说明</th><th>语速</th><th>全片约</th></tr>')
    for v in report:
        P.append('<tr><td><b>%s</b>（%s）<br><code>%s</code><audio controls preload="none" src="voices/%s"></audio></td><td>%s</td><td>%.2f 字/秒</td><td>%d:%02d</td></tr>' % (esc(v['name']), v['sex'], esc(v['id']), esc(v['file']), esc(v['desc']), v['rate'], v['total'] // 60, v['total'] % 60))
    P.append('</table>')
    P.append('<h2>三、配乐（3 选 1，各约 60 秒：引子、推进、最高处、收束）</h2>')
    for k, (n, d) in MUSIC_NOTES.items():
        P.append('<div class="box"><b>%s「%s」</b><br>%s<audio controls preload="none" src="music/%s.mp3"></audio></div>' % (k, n, esc(d), k))
    P.append('<p class="meta">三段都由本片的 tools/music.py 合成，不用鼓、铜管和合唱，也不用速通系列 120 拍/分的时钟音型。选定后按章节编排进出，揭示处减配器或留白。</p>')
    P.append('<h2>四、视觉方向（3 选 1，白底；每个方向三张：片名、信息最密的一屏、图解）</h2>')
    for k, (n, d) in VISUAL_NOTES.items():
        P.append('<h3>%s「%s」</h3><p>%s</p><div class="grid">%s</div>' % (k, n, esc(d), ''.join('<a href="keyframes/%s%s.png" target="_blank"><img src="keyframes/%s%s.png"></a>' % (k, f, k, f) for f in '123')))
    P.append('<p class="meta">关键帧是静帧；成片里同一个主对象（那道乘法与它的 token）会一直留在画面上变化，镜头跟着正在写的那一块走。所有数字取自 research/lab/out_03_check.txt。</p>')
    P.append('</main></body></html>')
    open(os.path.join(au, 'index.html'), 'w', encoding='utf-8', newline='\n').write('\n'.join(P))
    print(os.path.join(au, 'index.html'))


CHANGES2 = [
    '按「AI 味还是较重，不够自然」重写成口播的说法：去掉成语堆砌（有板有眼、不偏不倚、全军覆没……）、对仗金句、每章靠自问自答过渡和章末收一句道理的套路，「却」「其实」少用。',
    '对抗审读两轮：一个只读稿子的审读代理专挑 AI 味，第一轮评 6 分（10 分为一眼 AI），改后第二轮评 4 分；它指出的指代不清、句式重复、结尾空泛都已改掉。',
    '结尾不再念道理和片名：模型每写一块能算的有限，想多算只能多写；那几行「思考」就是草稿纸，开头那道题就是在这张纸上算对的；人也会打草稿，只是写下来的、说出口的都不一定是真正的原因；最后落在挑丝袜的那群人身上。',
    '结构沿用第 2 稿：开场三种问法，「学会思考」在「说出来的理由」之前。第 03 章不再复述开场，压成两句；「强化学习」不再点名，全片新名词只剩思维链、token、层三个。',
    '第 01 章「同一套题，一成到四成」改成「换一个模型、同一套题」，免得观众奇怪为什么起点从两成变成一成（两组实验用的不是同一个模型）。',
]
OPEN2 = [
    '结尾最后一句落在丝袜实验（「那些挑丝袜的人，谁也没说是因为位置」），不再念「先思考，再回答」，片名只在画面上出现。这样收可以吗？',
    '第 04 章不再说「强化学习」这个词，只说「训练时不给它看人写的解题过程，答对了，就给奖励」。可以吗？',
    '片长：按真诚青年实测语速估约 6:41。',
    '视觉：立体版 B 已按「背景更白、更论文一点的质感、有一些 OpenAI 风格」改过（第二节）。实现时本片 project.json 的 check.style.flat 改成 false；之后新建的独立片 new.js 已缺省如此。',
]
VISUAL3D = [
    ('FIG. 1 · 开场 o9', '三张纸像论文里的子图 (a)(b)(c) 摊在白色桌面上，第三张抬起：它的最后一步加回了第一行的错数。衬线排版、细黑线，镜头在三张纸之间推移。'),
    ('FIG. 2 · 第 02 章 c7', '模型画成一摞层数固定的玻璃层，带一点淡彩；四块 token 各穿过一次，这就是「只报答案」能用的全部计算。先写过程时，这一摞会被穿过三百多次。'),
    ('FIG. 3 · 第 04 章 r14', '思考模式写下的草稿按位数摞起来：每摞顶上是那一位数的一道真题，位数越多摞得越高（高度按平均思考 token）。'),
]


def page2():
    import html, shutil
    esc = html.escape
    sc = script()
    au = os.path.join(VIDEO, 'out', 'audition')
    kf = os.path.join(au, 'keyframes')
    os.makedirs(kf, exist_ok=True)
    for f in '123':
        shutil.copyfile(os.path.join(VIDEO, 'shots', 'page__design_keyframes3d_html_f_%s.png' % f), os.path.join(kf, 'B3d%s.png' % f))
    exports = sorted((x for x in os.listdir(os.path.join(VIDEO, 'review')) if x.startswith('script.zh.')), key=lambda x: os.path.getmtime(os.path.join(VIDEO, 'review', x)))
    cur = exports[-1].split('.')[2]
    # 按选定音色的试听实测语速估算各章时长（与 estimate() 同一口径）
    rate = next(v['rate'] for v in json.load(open(os.path.join(OUT, 'report.json'), encoding='utf-8')) if v['id'] == 'Chinese (Mandarin)_Sincere_Adult')
    dur = {cid: {'d': 0.12 + chars(c['tts']) / rate, 'words': None} for cid, c in sc['cues'].items() if not c['silent']}
    code = "const s=require(process.argv[1]);console.log(JSON.stringify(s.layoutScript(JSON.parse(process.argv[2]))))"
    L = json.loads(subprocess.check_output(['node', '-e', code, os.path.join(VIDEO, 'src', 'js', 'script.js'), json.dumps(dur)], encoding='utf-8'))
    mmss = lambda x: '%d:%02d' % (x // 60, round(x % 60))
    names = {'open': '开场', 'end': '结尾', 'credits': '片尾名单'}
    est = '\n'.join('%-10s %s – %s（%.0f 秒）' % ((s['chap'][0] + ' ' + s['chap'][1]) if s['chap'] else names.get(s['id'], s['id']), mmss(s['start']), mmss(s['end']), s['end'] - s['start']) for s in L['scenes']) + '\n合计 %s（%.2f 字/秒）' % (mmss(L['total']), rate)
    P = ['<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>CoT：先思考，再回答 · 审片页（第 3 稿）</title><style>']
    P.append('''body{margin:0;background:#f6f6f3;color:#18181b;font:17px/1.8 "Noto Sans SC","Microsoft YaHei",sans-serif}
main{max-width:1180px;margin:0 auto;padding:48px 40px 120px}h1{font-size:34px;margin:0 0 6px}h2{font-size:24px;margin:56px 0 14px;padding-top:18px;border-top:1px solid #ddd}
h3{font-size:19px;margin:28px 0 6px}.meta{color:#666;font-size:15px}.box{background:#fff;border:1px solid #e3e3df;border-radius:10px;padding:18px 22px;margin:12px 0}
.cid{font:12px monospace;color:#9a9aa3;vertical-align:super;margin:0 2px 0 6px}.chap{font-weight:700;color:#0b6e57}
.ask{background:#fffbe9;border-color:#f0dc9a}ol li,ul li{margin:6px 0}.sil{color:#9a9aa3}pre{font-size:13px;color:#555}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.grid img{width:100%;border:1px solid #ddd;border-radius:6px}.cap{font-size:14px;color:#555}
audio{width:100%;margin-top:6px}''')
    P.append('</style></head><body><main>')
    P.append('<h1>CoT：先思考，再回答 · 审片页（第 3 稿）</h1><div class="meta">2026-11-07 · 内容哈希 <code>%s</code> · 只有中文 · 估约 6:41（真诚青年、语速 1.2 的实测语速）</div>' % esc(cur[:16]))
    P.append('<div class="box ask"><b>请看两样</b>：①第 3 稿文案：意见按句号说（例如「c7：……」），或明确确认这一稿；②视觉 B 的立体版关键帧。配音（真诚青年）与配乐（A「落字」）已在 11-03 选定，下面附上供回忆。确认之前不配全片。</div>')
    P.append('<h2>本稿改了什么（相对第 2 稿）</h2><div class="box"><ul>%s</ul></div>' % ''.join('<li>%s</li>' % esc(x) for x in CHANGES2))
    P.append('<h2>一、文案（第 3 稿）</h2>')
    for s in sc['SCRIPT']:
        head = ('<span class="chap">%s %s</span>' % (s['chap'][0], esc(s['chap'][1]))) if s['chap'] else ('<span class="chap">%s</span>' % {'open': '开场', 'end': '结尾', 'credits': '片尾'}.get(s['id'], s['id']))
        body = []
        for cid, cap, o in s['cues']:
            if cap is None:
                body.append('<span class="sil">（%s：无旁白，%s 秒）</span>' % ('片名' if cid == 'oT' else '片尾名单', o.get('pause')))
                continue
            c = cap.replace('*', '')
            body.append('<span class="cid">%s</span>%s%s' % (cid, esc(c), '' if c[-1] in '？！。' else '。'))
        P.append('<div class="box">%s<p>%s</p></div>' % (head, ''.join(body)))
    if est:
        P.append('<p class="meta">各章估时（按 5.10 字/秒加停顿与章节卡）：</p><pre>%s</pre>' % esc(est))
    P.append('<h3>待定的问题</h3><ol>' + ''.join('<li>%s</li>' % esc(x) for x in OPEN2) + '</ol>')
    P.append('<h2>二、视觉 B「草稿纸」· 立体版</h2><p>按 11-07 的要求（「可以有 3D 元素，而不是纯 2D」「背景更白更论文一点的质感，有一些 OpenAI 风格」）做的三张关键帧：纯白底、浅点阵，纸面是论文式的衬线排版，主体下方一团淡彩光晕；纸、模型的层和草稿堆都是立体的。用 CSS 3D 搭建，镜头可以在其中推移。</p><div class="grid">%s</div>' % ''.join('<div><a href="keyframes/B3d%d.png" target="_blank"><img src="keyframes/B3d%d.png"></a><div class="cap"><b>%s</b>　%s</div></div>' % (i + 1, i + 1, esc(t), esc(d)) for i, (t, d) in enumerate(VISUAL3D)))
    P.append('<h3>对照：11-03 选定的平面版 B</h3><div class="grid">%s</div>' % ''.join('<a href="keyframes/B%s.png" target="_blank"><img src="keyframes/B%s.png"></a>' % (f, f) for f in '123'))
    P.append('<h2>三、已选定</h2><div class="box"><b>配音：真诚青年</b> <code>Chinese (Mandarin)_Sincere_Adult</code>，MiniMax speech-2.8-hd，语速 1.2（试听读的是第 1 稿的代表句）<audio controls preload="none" src="voices/Chinese_Mandarin__Sincere_Adult.mp3"></audio></div>')
    P.append('<div class="box"><b>配乐：A「落字」</b>　%s<audio controls preload="none" src="music/A.mp3"></audio></div>' % esc(MUSIC_NOTES['A'][1]))
    P.append('</main></body></html>')
    open(os.path.join(au, 'index.html'), 'w', encoding='utf-8', newline='\n').write('\n'.join(P))
    print(os.path.join(au, 'index.html'))


if __name__ == '__main__':
    {'voices': voices, 'estimate': estimate, 'music': music, 'page': page, 'page2': page2}[sys.argv[1] if len(sys.argv) > 1 else 'voices']()
