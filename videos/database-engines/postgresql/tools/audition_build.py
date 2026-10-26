# 把视觉稿截图、配乐小样与男声预选打包成一个自包含的 HTML（图片与音频都以 base64 嵌入，不依赖外部文件与网络），
# 供 WaterRun 拷到远程设备上看、听。用法：python audition_build.py <试听目录>
# 前置：node keyframes_shot.cjs <目录>（kf_*.png、keyframes.json）；python fugue_sketch.py <目录>/fugue.wav；python voice_audition.py <目录>
import base64, html, json, os, subprocess, sys

FF = os.environ.get('LVS_FFMPEG') or os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
BEAT = 60 / 66


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode('ascii')


def ff(*args):
    subprocess.run([FF, '-loglevel', 'error', '-y', *args], check=True)


def mmss(beat):
    s = beat * BEAT
    return '%d:%02d' % (int(s) // 60, int(s) % 60)


def main(d):
    labels = json.load(open(os.path.join(d, 'keyframes.json'), encoding='utf-8'))
    imgs = []
    for i in range(1, len(labels) + 1):
        jpg = os.path.join(d, 'kf_%d.jpg' % i)
        ff('-i', os.path.join(d, 'kf_%d.png' % i), '-q:v', '3', jpg)
        imgs.append(b64(jpg))
    mp3 = os.path.join(d, 'fugue.mp3')
    ff('-i', os.path.join(d, 'fugue.wav'), '-codec:a', 'libmp3lame', '-b:a', '192k', mp3)
    music = b64(mp3)
    vmeta = json.load(open(os.path.join(d, 'voices.json'), encoding='utf-8'))
    voices = [(v, b64(os.path.join(d, v['file']))) for v in vmeta['voices']]

    marks = [(0, '主题：管风琴单独奏出（D 小调，66 拍/分）'), (12, '弦乐在属音上回答，管风琴转奏对题'), (24, '低音声部第三次进入主题，上面两声部对位'),
             (36, '嵌段：主题开头向上模进'), (48, '全声部合奏：合唱式和声、定音鼓'), (56, '全体停一拍：崩溃'), (57, '主题从头重新进入'), (64, '落在 D 大调，长和弦收尾')]
    H = []
    H.append('''<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>PostgreSQL 试听与视觉稿 R1</title>
<style>
:root { --pg:#336791; --navy:#193145; --sky:#699eca; --thead:#e0ecef; --rule:#e7eae8; --border:#dee2e6; --ink:#212529; --ink2:#5b6670; }
body { margin:0; background:#eef1f4; color:var(--ink); font-family:"Open Sans","Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif; }
main { max-width:1200px; margin:0 auto; padding:24px 16px 60px; }
h1 { font-size:28px; color:var(--navy); margin:8px 0 4px; }
h2 { display:flex; align-items:center; gap:16px; color:var(--pg); font-size:24px; margin:36px 0 12px; }
h2::after { content:""; flex:1; height:2px; background:var(--rule); }
p, li { line-height:1.7; font-size:15.5px; }
.sub { color:var(--ink2); }
figure { margin:0 0 22px; background:#fff; border:1px solid var(--border); }
figure img { display:block; width:100%; height:auto; }
figcaption { padding:8px 12px; font-size:14.5px; color:var(--ink2); }
.card { background:#fff; border:1px solid var(--border); padding:16px 18px; margin:0 0 14px; }
.card h3 { margin:0 0 4px; font-size:18px; color:var(--navy); }
.card .meta { font-size:13.5px; color:var(--ink2); margin-bottom:8px; }
audio { width:100%; }
table { border-collapse:collapse; width:100%; font-size:14.5px; background:#fff; }
th { background:var(--thead); color:var(--pg); text-align:left; padding:6px 10px; border:1px solid var(--border); }
td { padding:6px 10px; border:1px solid var(--border); }
.note { border-left:5px solid var(--pg); background:#eef4f9; padding:10px 14px; font-size:14.5px; line-height:1.7; }
blockquote { margin:8px 0; padding:10px 14px; background:#f8f9fa; border:1px solid var(--border); font-size:16px; line-height:1.8; }
</style></head><body><main>''')
    H.append('<h1>学院派的正统：PostgreSQL · 试听与视觉稿 R1</h1><p class="sub">数据库引擎系列第 3 集（重做版）· 2026-10-26 · 制作方 Claude Opus 5.5 · 本页自包含，图片与音频都嵌在文件里，离线可看可听</p>')
    H.append('<div class="note">要你定的：①三个男声选一个（或都不行）；②配乐小样的方向对不对；③视觉稿的风格对不对。数字说明：调查数字是旧版取证，新版会重核；行版本、事务号、页偏移是旧版在 PostgreSQL 18.4 上的实测（alice 30 → 31），新版在 18.6 上用 Alice（2050，42 → 43）重测；没实测的地方只画了结构。</div>')

    H.append('<h2>配音 · 三个男声预选</h2>')
    H.append('<p>同一段试听文字，语速都对齐到 InnoDB 一集旁白的实际语速（每秒约 %.2f 字），只比音色。试听文字只为试音，不是定稿文案：</p><blockquote>%s</blockquote>' % (vmeta['target_rate'], html.escape(vmeta['text'])))
    for v, data in voices:
        H.append('<div class="card"><h3>%s</h3><div class="meta">MiniMax %s · <code>%s</code> · 语速 %.2f 倍 · 实测每秒 %.2f 字 · %.1f 秒 · %s</div><audio controls preload="metadata" src="data:audio/mpeg;base64,%s"></audio></div>'
                 % (html.escape(v['name']), html.escape(vmeta['model']), html.escape(v['voice']), v['speed'], v['rate'], v['seconds'], html.escape(v['desc']), data))

    H.append('<h2>配乐 · 赋格小样</h2>')
    H.append('<p>你说「配乐也是学术派的, 体现Pg的庞大严谨史诗」。写成一首赋格：最讲规矩的作曲形式，主题按规矩一声部一声部进入，对应「学院派的正统」。正片里和内容呼应：写新版本时多进一个声部、织体变厚，VACUUM 时声部依次退出，WAL 是持续的低音踏板，崩溃时全体停一拍、重启后从主题重新进入。下面是约 70 秒的小样，全部由程序合成（本片 <code>tools/fugue_sketch.py</code>）。</p>')
    H.append('<div class="card"><audio controls preload="metadata" src="data:audio/mpeg;base64,%s"></audio></div>' % music)
    H.append('<table><tr><th>时刻</th><th>听到什么</th></tr>' + ''.join('<tr><td>%s</td><td>%s</td></tr>' % (mmss(b), html.escape(t)) for b, t in marks) + '</table>')

    H.append('<h2>视觉稿 · 七帧，一种风格</h2>')
    H.append('<p>语汇取自 PostgreSQL 官方文档：Pg 蓝 #336791、深蓝 #193145、浅蓝 #699eca（旧版本、快照）、文档表头 #e0ecef；Open Sans；带横线的标题；「图 n」图注；注解用文档的「注意」框，贴在被解释的东西旁边；所有 SQL 都以 psql 会话出现。不放大象标志。主画面是 PostgreSQL 自己的对象：堆页、两棵独立的 B 树、带 xmin/xmax 的行版本、快照、VACUUM。成片里会动起来，每章一个主画面逐步推进。</p>')
    for lab, data in zip(labels, imgs):
        H.append('<figure><img alt="%s" src="data:image/jpeg;base64,%s"><figcaption>%s</figcaption></figure>' % (html.escape(lab), data, html.escape(lab)))
    H.append('</main></body></html>')
    outp = os.path.join(d, 'pg-audition-r1.html')
    open(outp, 'w', encoding='utf-8').write('\n'.join(H))
    print(outp, round(os.path.getsize(outp) / 1048576, 2), 'MiB')


if __name__ == '__main__':
    main(sys.argv[1])
