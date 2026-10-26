# 把封面、视觉稿截图、配乐小样与配音样本打包成一个自包含的 HTML（图片与音频都以 base64 嵌入，不依赖外部文件与网络），
# 供 WaterRun 拷到远程设备上看、听。用法：python audition_build.py <试听目录> <轮次：r1 | r2>
# 前置（都写进同一个试听目录）：
#   node keyframes_shot.cjs ../review/keyframes-rN.html <目录> <帧前缀>     视觉稿各帧与说明
#   node keyframes_shot.cjs ../review/cover-r1.html <目录> cover_r1          封面（R2 起）
#   python fugue_sketch.py <目录>/fugue.wav  或  python music_sketch.py <目录>/music_r2.wav
#   python voice_audition.py <目录>                                           男声样本与 voices.json
import base64, html, json, os, subprocess, sys

FF = os.environ.get('LVS_FFMPEG') or os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode('ascii')


def ff(*args):
    subprocess.run([FF, '-loglevel', 'error', '-y', *args], check=True)


def at(sec):
    return '%d:%02d' % (int(sec) // 60, int(sec) % 60)


B66, B112 = 60 / 66, 60 / 112
ROUNDS = {
    'r1': {
        'title': '学院派的正统：PostgreSQL · 试听与视觉稿 R1',
        'ask': '要你定的：①三个男声选一个（或都不行）；②配乐小样的方向对不对；③视觉稿的风格对不对。',
        'frames': 'kf', 'cover': None, 'music': 'fugue.wav', 'voices': None,
        'music_head': '配乐 · 赋格小样',
        'music_text': '你说「配乐也是学术派的, 体现Pg的庞大严谨史诗」。写成一首赋格：最讲规矩的作曲形式，主题按规矩一声部一声部进入，对应「学院派的正统」。正片里和内容呼应：写新版本时多进一个声部、织体变厚，VACUUM 时声部依次退出，WAL 是持续的低音踏板，崩溃时全体停一拍、重启后从主题重新进入。下面是约 70 秒的小样，全部由程序合成（本片 <code>tools/fugue_sketch.py</code>）。',
        'marks': [(0, '主题：管风琴单独奏出（D 小调，66 拍/分）'), (12 * B66, '弦乐在属音上回答，管风琴转奏对题'), (24 * B66, '低音声部第三次进入主题，上面两声部对位'),
                  (36 * B66, '嵌段：主题开头向上模进'), (48 * B66, '全声部合奏：合唱式和声、定音鼓'), (56 * B66, '全体停一拍：崩溃'), (57 * B66, '主题从头重新进入'), (64 * B66, '落在 D 大调，长和弦收尾')],
        'visual_head': '视觉稿 · 七帧，一种风格',
    },
    'r2': {
        'title': '学院派的正统：PostgreSQL · 试听与视觉稿 R2',
        'ask': '这一版按你对 R1 的意见改：配音定为沉稳高管；配乐改成表现计算机系统的秩序；视觉更有 Pg 的味道、Pg 蓝用得更足；加了封面。要你看的：①封面；②配乐 R2 的方向；③视觉稿 R2。',
        'frames': 'kf2', 'cover': 'cover_r1.png', 'music': 'music_r2.wav', 'voices': ['Chinese (Mandarin)_Reliable_Executive'],
        'music_head': '配乐 R2 · 数据的秩序',
        'music_text': '你说「配乐更体现计算机 数据库海量数据的井井有条 复杂有序的计算机系统」。改成一层层精确的音型叠起来：D 小调，112 拍/分，十六分音符的网格；一支拨弦走琶音像一路数据流，木琴同一音型错开三个十六分音符跟进（卡农），低音八分音符的脉冲像 WAL 的心跳；上一版的赋格主题留在弦乐上，作学院派的线索；高潮全部合奏，崩溃停一拍后从一支声部重新建起，最后各声部依次退出（像 VACUUM）、落在 D 大调。约 70 秒，全部由程序合成（本片 <code>tools/music_sketch.py</code>）。',
        'marks': [(0, '拨弦琶音单独：一路数据流'), (4 * 4 * B112, '木琴同一音型错开跟进：卡农'), (8 * 4 * B112, '低音八分音符脉冲：WAL 的心跳'), (12 * 4 * B112, '弦乐长和弦，赋格主题在弦乐上'),
                  (18 * 4 * B112, '全部合奏：钟声、定音鼓，主题高八度'), (22 * 4 * B112, '全体停一拍：崩溃'), (22 * 4 * B112 + B112, '数据流从一支声部重新建起，木琴、低音依次回来'), (28 * 4 * B112, '各声部依次退出（VACUUM），落在 D 大调')],
        'visual_head': '视觉稿 R2 · 八帧（加章节卡），Pg 蓝更足',
    },
}

CSS = '''
:root { --pg:#336791; --navy:#193145; --sky:#699eca; --thead:#e0ecef; --rule:#e7eae8; --border:#dee2e6; --ink:#212529; --ink2:#5b6670; }
body { margin:0; background:#eef1f4; color:var(--ink); font-family:"Open Sans","Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif; }
header.top { background:var(--pg); color:#fff; padding:18px 16px; }
header.top div { max-width:1200px; margin:0 auto; }
header.top h1 { font-size:28px; margin:0 0 4px; }
header.top p { margin:0; color:#cfe0ee; font-size:14.5px; }
main { max-width:1200px; margin:0 auto; padding:16px 16px 60px; }
h2 { display:flex; align-items:center; gap:16px; color:var(--pg); font-size:24px; margin:36px 0 12px; }
h2::after { content:""; flex:1; height:2px; background:#cfe0ee; }
p, li { line-height:1.7; font-size:15.5px; }
figure { margin:0 0 22px; background:#fff; border:1px solid var(--border); }
figure img { display:block; width:100%; height:auto; }
figcaption { padding:8px 12px; font-size:14.5px; color:var(--ink2); }
.card { background:#fff; border:1px solid var(--border); border-left:5px solid var(--pg); padding:16px 18px; margin:0 0 14px; }
.card h3 { margin:0 0 4px; font-size:18px; color:var(--navy); }
.card .meta { font-size:13.5px; color:var(--ink2); margin-bottom:8px; }
audio { width:100%; }
table { border-collapse:collapse; width:100%; font-size:14.5px; background:#fff; }
th { background:var(--pg); color:#fff; text-align:left; padding:6px 10px; border:1px solid var(--border); }
td { padding:6px 10px; border:1px solid var(--border); }
.note { border-left:5px solid var(--pg); background:#e6eff7; padding:10px 14px; font-size:14.5px; line-height:1.7; margin-top:16px; }
blockquote { margin:8px 0; padding:10px 14px; background:#f8f9fa; border:1px solid var(--border); font-size:16px; line-height:1.8; }
'''
NUMBERS = '数字说明：调查数字是旧版取证，新版会重核；行版本、事务号、页偏移是旧版在 PostgreSQL 18.4 上的实测（alice 30 → 31），新版在 18.6 上用 Alice（2050，42 → 43）重测；没实测的地方只画了结构。'


def main(d, rnd):
    R = ROUNDS[rnd]
    labels = json.load(open(os.path.join(d, R['frames'] + '.json'), encoding='utf-8'))
    imgs = []
    for i in range(1, len(labels) + 1):
        jpg = os.path.join(d, '%s_%d.jpg' % (R['frames'], i))
        ff('-i', os.path.join(d, '%s_%d.png' % (R['frames'], i)), '-q:v', '3', jpg)
        imgs.append(b64(jpg))
    mp3 = os.path.join(d, os.path.splitext(R['music'])[0] + '.mp3')
    ff('-i', os.path.join(d, R['music']), '-codec:a', 'libmp3lame', '-b:a', '192k', mp3)
    music = b64(mp3)
    vmeta = json.load(open(os.path.join(d, 'voices.json'), encoding='utf-8'))
    voices = [(v, b64(os.path.join(d, v['file']))) for v in vmeta['voices'] if R['voices'] is None or v['voice'] in R['voices']]

    H = ['<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>%s</title><style>%s</style></head><body>' % (html.escape(R['title']), CSS)]
    H.append('<header class="top"><div><h1>%s</h1><p>数据库引擎系列第 3 集（重做版）· 2026-10-26 · 制作方 Claude Opus 5.5 · 本页自包含，图片与音频都嵌在文件里，离线可看可听</p></div></header><main>' % html.escape(R['title']))
    H.append('<div class="note">%s<br>%s</div>' % (html.escape(R['ask']), NUMBERS))
    if R['cover']:
        jpg = os.path.join(d, os.path.splitext(R['cover'])[0] + '.jpg')
        ff('-i', os.path.join(d, R['cover']), '-q:v', '2', jpg)
        H.append('<h2>封面</h2><p>整幅 Pg 蓝，叠一层纸纹与很淡的网格；标题白字面、深蓝立体侧面，缩小后仍清楚；右边是等轴立体的一排 8 KB 堆页，最前一页的顶面上看得见新旧两版行（旧版本标出 xmax），上方一棵小索引树，一根线从叶子落到新版本（ctid）。不放大象标志。源页 <code>review/cover-r1.html</code>。</p>')
        H.append('<figure><img alt="封面" src="data:image/jpeg;base64,%s"><figcaption>封面 16:9（1920×1080）；4:3 版按同一版式排</figcaption></figure>' % b64(jpg))
    H.append('<h2>%s</h2><p>%s</p>' % (html.escape(R['music_head']), R['music_text']))
    H.append('<div class="card"><audio controls preload="metadata" src="data:audio/mpeg;base64,%s"></audio></div>' % music)
    H.append('<table><tr><th>时刻</th><th>听到什么</th></tr>' + ''.join('<tr><td>%s</td><td>%s</td></tr>' % (at(s), html.escape(t)) for s, t in R['marks']) + '</table>')
    if R['voices'] is None:
        H.append('<h2>配音 · 三个男声预选</h2><p>同一段试听文字，语速都对齐到 InnoDB 一集旁白的实际语速（每秒约 %.2f 字），只比音色。试听文字只为试音，不是定稿文案：</p><blockquote>%s</blockquote>' % (vmeta['target_rate'], html.escape(vmeta['text'])))
    else:
        H.append('<h2>配音 · 已选定</h2><p>你在 R1 里选了这一个；这里留着它，方便和配乐一起听。试听文字只为试音，不是定稿文案：</p><blockquote>%s</blockquote>' % html.escape(vmeta['text']))
    for v, data in voices:
        H.append('<div class="card"><h3>%s</h3><div class="meta">MiniMax %s · <code>%s</code> · 语速 %.2f 倍 · 实测每秒 %.2f 字 · %.1f 秒 · %s</div><audio controls preload="metadata" src="data:audio/mpeg;base64,%s"></audio></div>'
                 % (html.escape(v['name']), html.escape(vmeta['model']), html.escape(v['voice']), v['speed'], v['rate'], v['seconds'], html.escape(v['desc']), data))
    H.append('<h2>%s</h2>' % html.escape(R['visual_head']))
    H.append('<p>语汇取自 PostgreSQL 官方文档：Pg 蓝 #336791、深蓝 #193145、浅蓝 #699eca（旧版本、快照）；Open Sans；带横线的标题；「图 n」图注；注解用文档的「注意」框，贴在被解释的东西旁边；所有 SQL 都以 psql 会话出现。不放大象标志。主画面是 PostgreSQL 自己的对象：堆页、两棵独立的 B 树、带 xmin/xmax 的行版本、快照、VACUUM。成片里会动起来，每章一个主画面逐步推进。%s</p>'
             % ('R2：每帧顶上一条 Pg 蓝通栏（名字、版本、章节），页与节点、表头、标签改用 Pg 蓝，纸面加一层很淡的蓝色工程网格；加一帧整屏 Pg 蓝的章节卡。' if rnd == 'r2' else ''))
    for lab, data in zip(labels, imgs):
        H.append('<figure><img alt="%s" src="data:image/jpeg;base64,%s"><figcaption>%s</figcaption></figure>' % (html.escape(lab), data, html.escape(lab)))
    H.append('</main></body></html>')
    outp = os.path.join(d, 'pg-audition-%s.html' % rnd)
    open(outp, 'w', encoding='utf-8').write('\n'.join(H))
    print(outp, round(os.path.getsize(outp) / 1048576, 2), 'MiB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'r1')
