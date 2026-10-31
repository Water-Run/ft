# 本地审片页：第 4 稿全文（带句号）、5 个配音候选、3 个配乐小样、关键帧，一页里一次选定（新片的固定流程）。
# 先跑 voice_audition.py、music_sketch.py，关键帧截图放在 out/audition/kf/f1–f4.png（kit/tools/look.js --url "/design/keyframes.html?f=N"）。
# 用法：python videos/database-engines/sqlite/tools/audition_build.py   → out/audition/index.html（不入库）
import os, json, subprocess, html
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(os.path.dirname(VIDEO)))
FF = os.path.join(REPO, 'assets', 'ffmpeg', 'bin', 'ffmpeg.exe')
A = os.path.join(VIDEO, 'out', 'audition'); NORM = os.path.join(A, 'norm'); os.makedirs(NORM, exist_ok=True)

def norm(src, name):   # 试听时音量对齐到 -20 LUFS，比的是音色与曲风，不是响度
    dst = os.path.join(NORM, name)
    if not os.path.exists(dst):
        subprocess.run([FF, '-v', 'quiet', '-y', '-i', os.path.join(A, src), '-af', 'loudnorm=I=-20:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '160k', dst], check=True)
    return 'norm/' + name

env = dict(os.environ, VLANG='zh')
dump = subprocess.run(['node', '-e', "const s=require(process.argv[1]);process.stdout.write(JSON.stringify({S:s.SCRIPT,L:s.layoutScript({})}))", os.path.join(VIDEO, 'src', 'js', 'script.js')], capture_output=True, text=True, encoding='utf-8', env=env, check=True).stdout
D = json.loads(dump); S, L = D['S'], D['L']
V = json.load(open(os.path.join(A, 'voices', 'voices.json'), encoding='utf-8'))
MUSIC = [('a', 'A · 页的脉冲', '96 BPM，D 小调。每拍一记低音，八分音符上一声很轻的「读页」短响；每两小节换一次根音。最克制，像文件被一页页读到。'),
         ('b', 'B · 拨弦琶音', '88 BPM，A 小调。钢琴式拨弦的八分音符琶音，低音落在一、三拍。最有旋律感。'),
         ('c', 'C · 木琴固定音型', '104 BPM，E 小调。木琴式短音反复一个四音型，长低音与每小节一记闷鼓。最有推进感。')]
KF = [('f1', '片头：PART 4、标题、553 页的文件（每页一格，按归属上色）'), ('f2', '02 怎么放：users 的整棵 B+ 树，256 个叶页全画出'),
      ('f3', '03 怎么找：姓名索引的 B 树与 Alice 的两条路线'), ('f4', '04 一页里有什么：叶页 130 按真实比例展开，Alice 的 13 字节')]
e = html.escape

def script_html():
    out = []
    for sc in S:
        ch = sc.get('chap'); title = f"{ch[0]} · {ch[1]}" if ch else {'open': '开场', 'end': '收束', 'credits': '片尾名单'}.get(sc['id'], sc['id'])
        dur = next(x for x in L['scenes'] if x['id'] == sc['id']); out.append(f"<h3>{e(title)} <small>约 {dur['end'] - dur['start']:.0f} 秒</small></h3><p>")
        for cid, cap, o in sc['cues']:
            if cap: out.append(f"<span class='c'><b>{e(cid)}</b>{e(cap).replace('*', '')}</span> ")
        out.append('</p>')
    return '\n'.join(out)

voices = '\n'.join(f"<div class='row'><div class='nm'>{i + 1}. {e(v['label'])}<small>{e(v['id'])} · 语速 {e(v['speed'])} · {v['d'] or 0:.1f} 秒</small></div><audio controls preload='none' src='{norm(v['file'], 'v%d.mp3' % (i + 1))}'></audio></div>" for i, v in enumerate(V['voices']))
music = '\n'.join(f"<div class='row'><div class='nm'>{e(t)}<small>{e(d)}</small></div><audio controls preload='none' src='{norm('music/' + k + '.mp3', 'm' + k + '.mp3')}'></audio></div>" for k, t, d in MUSIC)
kfs = '\n'.join(f"<figure><img src='kf/{k}.png' alt='{e(c)}'><figcaption>{e(c)}</figcaption></figure>" for k, c in KF if os.path.exists(os.path.join(A, 'kf', k + '.png')))
page = f"""<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SQLite 审片页</title>
<style>
:root {{ --ink:#003b57; --teal:#044a64; --blue:#0f80cc; --paper:#fff; --dim:#5b6b74; --line:#d6e2e8; }}
body {{ margin:0; background:var(--paper); color:var(--ink); font:16px/1.75 "Noto Sans SC","Microsoft YaHei",sans-serif; }}
header {{ background:var(--teal); color:#fff; padding:18px 24px; }} header h1 {{ margin:0; font-size:22px; }} header p {{ margin:4px 0 0; opacity:.85; font-size:14px; }}
main {{ max-width:1040px; margin:0 auto; padding:8px 16px 64px; }}
h2 {{ border-bottom:3px solid var(--teal); padding-bottom:4px; margin-top:36px; }} h3 {{ margin:22px 0 4px; color:var(--teal); }} h3 small {{ color:var(--dim); font-weight:400; font-size:13px; }}
.c b {{ font:600 11px/1 monospace; color:var(--blue); margin-right:3px; vertical-align:super; }}
.row {{ display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; padding:10px 0; border-bottom:1px solid var(--line); }}
.nm {{ flex:1 1 320px; font-weight:700; }} .nm small {{ display:block; font-weight:400; color:var(--dim); font-size:13px; }}
audio {{ flex:1 1 320px; max-width:100%; }}
figure {{ margin:16px 0; }} img {{ width:100%; border:1px solid var(--line); }} figcaption {{ color:var(--dim); font-size:14px; }}
.ask li {{ margin:6px 0; }} .note {{ background:#eef5f8; border-left:4px solid var(--blue); padding:10px 14px; }}
</style></head><body>
<header><h1>一个数据库引擎是如何实现的？——小而强大：SQLite · 审片页</h1><p>第 4 稿（内容 SHA-256 717818f5…）· 按字数估 {L['total'] / 60:.1f} 分钟（实测语速下约 10–11 分钟）· 2026-11-01 制作方 Claude Opus 5.5</p></header>
<main>
<div class="note">一次选定：文案是否确认（或逐句意见）、配音选哪个、配乐选哪个方向、关键帧方向是否认可。配音只是试听，全片合成要等文案确认。</div>
<h2>要你决定的事</h2>
<ol class="ask">
<li>第 4 稿能否确认配音？逐句意见按句号写即可（如「j12 改成……」）。</li>
<li>配音：下面 5 个女声选一个（本集 PART 4；上一集 PostgreSQL 是男声）。语速已对齐到约 4.4 字/秒，比的是音色。</li>
<li>配乐：A、B、C 选一个方向（「简洁有力」）。</li>
<li>关键帧：沿用「一个文件，一片纸」——sqlite.org 文档的白纸、深青与墨蓝；左上角的官方标志已按系列约定换成纯文字。是否认可。</li>
</ol>
<h2>配音候选（同一段：o4、s14、s22、j9、w11、e12）</h2>
{voices}
<h2>配乐小样（各约 32 秒）</h2>
{music}
<h2>关键帧（第 3 稿时做的，已去掉标志；数字取自实测）</h2>
{kfs or '<p>（截图未生成）</p>'}
<h2>第 4 稿全文</h2>
<p class="note">改了什么、为什么：见 review/NOTES.md「交审说明」。事实依据只在 research/FACTS.md。</p>
{script_html()}
</main></body></html>"""
open(os.path.join(A, 'index.html'), 'w', encoding='utf-8').write(page)
print(os.path.join(A, 'index.html'))
