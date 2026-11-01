# 本地审片页：当前稿全文（带句号）、配音候选、3 个配乐小样、关键帧、封面候选，一页里一次选定（新片的固定流程）。
# 先跑 voice_audition.py、music_sketch.py；关键帧与封面截图（kit/tools/look.js --url "/design/keyframes.html?f=N"、"/design/covers.html?c=N"）
# 放在 out/audition/kf/f1–f4.png 与 out/audition/cover/c1–c3.png。
# 用法：python videos/database-engines/sqlite/tools/audition_build.py   → out/audition/index.html（不入库）
import os, json, subprocess, html, glob
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
REV = max(glob.glob(os.path.join(VIDEO, 'review', 'script.zh.*.md')), key=os.path.getmtime)   # 最近导出的交审稿
HASH = os.path.basename(REV).split('.')[2]
DRAFT = '第 5 稿'
MUSIC = [('a', 'A · 页的脉冲', '96 BPM，D 小调。每拍一记低音，八分音符上一声很轻的「读页」短响；每两小节换一次根音。最克制，像文件被一页页读到。'),
         ('b', 'B · 拨弦琶音', '88 BPM，A 小调。钢琴式拨弦的八分音符琶音，低音落在一、三拍。最有旋律感。'),
         ('c', 'C · 木琴固定音型', '104 BPM，E 小调。木琴式短音反复一个四音型，长低音与每小节一记闷鼓。最有推进感。')]
KF = [('f1', '片头：像一页 sqlite.org 文档——页头的版本与斜体标语、圆角深青菜单（章节即菜单项）、常规字重的深青标题、553 页的文件（每页一格，按归属上色）'),
      ('f2', '02 怎么放：users 的整棵 B+ 树，256 个叶页全画出；当前章是菜单里亮蓝的那一项'),
      ('f3', '03 怎么找：文档式的灰底代码块写出查询；姓名索引的 B 树，读到的页麦色底、亮蓝边（文档的悬停色）'),
      ('f4', '04 一页里有什么：叶页 130 按真实比例展开；页头用「已访问链接」的紫褐；Alice 的 13 字节画成文档里的表')]
COVERS = [('c1', '1 · 一个文件：553 页叠成一块立体的文件，顶面每页一格按归属上色，找 Alice 读到的 7 页从格子里升起来'),
          ('c2', '2 · 两棵树：姓名索引与 users 表各是一座三层的塔，蓝线自上而下串起读到的页（262 → 281 → 263，2 → 133 → 130），先读第 1 页文件头'),
          ('c3', '3 · 一字节不差：主文件与回滚日志两叠纸，改到一半被强行终止；重开时从日志抄回原页，整个文件恢复原来的 SHA-256')]
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

def vrow(v):
    return (f"<div class='row'><div class='nm'>{e(v['label'])}<small>{e(v['id'])} · 语速 {e(v['speed'])} · {v['d'] or 0:.1f} 秒</small></div>"
            f"<audio controls preload='none' src='{norm(v['file'], 'v-' + os.path.basename(v['file']))}'></audio></div>")
new5 = [v for v in V['voices'] if v.get('batch') == 2]
old4 = [v for v in V['voices'] if v.get('batch', 1) == 1 and not v.get('male')]
voices = '\n'.join(vrow(v) for v in new5) + "\n<h3>上一批（供对照；原第 3 个「抒情」查明是男声，已去掉）</h3>\n" + '\n'.join(vrow(v) for v in old4)
music = '\n'.join(f"<div class='row'><div class='nm'>{e(t)}<small>{e(d)}</small></div><audio controls preload='none' src='{norm('music/' + k + '.mp3', 'm' + k + '.mp3')}'></audio></div>" for k, t, d in MUSIC)
fig = lambda d, items: '\n'.join(f"<figure><img src='{d}/{k}.png' alt='{e(c)}'><figcaption>{e(c)}</figcaption></figure>" for k, c in items if os.path.exists(os.path.join(A, d, k + '.png')))
kfs, covers = fig('kf', KF), fig('cover', COVERS)
page = f"""<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SQLite 审片页</title>
<style>
:root {{ --ink:#1f1f1f; --teal:#044a64; --blue:#0482c4; --paper:#fff; --dim:#5f6b70; --line:#d6e2e8; }}
body {{ margin:0; background:var(--paper); color:var(--ink); font:16px/1.75 Verdana,"Noto Sans SC","Microsoft YaHei",sans-serif; }}
header {{ background:var(--teal); color:#fff; padding:18px 24px; }} header h1 {{ margin:0; font-size:22px; font-weight:400; }} header p {{ margin:4px 0 0; opacity:.85; font-size:14px; }}
main {{ max-width:1040px; margin:0 auto; padding:8px 16px 64px; }}
h2 {{ border-bottom:2px solid var(--teal); padding-bottom:4px; margin-top:36px; font-weight:400; color:var(--teal); }} h3 {{ margin:22px 0 4px; color:var(--teal); font-weight:400; }} h3 small {{ color:var(--dim); font-size:13px; }}
.c b {{ font:600 11px/1 monospace; color:var(--blue); margin-right:3px; vertical-align:super; }}
.row {{ display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; padding:10px 0; border-bottom:1px solid var(--line); }}
.nm {{ flex:1 1 320px; font-weight:700; }} .nm small {{ display:block; font-weight:400; color:var(--dim); font-size:13px; }}
audio {{ flex:1 1 320px; max-width:100%; }}
figure {{ margin:16px 0; }} img {{ width:100%; border:1px solid var(--line); }} figcaption {{ color:var(--dim); font-size:14px; }}
.ask li {{ margin:6px 0; }} .note {{ background:#eee; border:1px solid #80a796; padding:10px 14px; }}
</style></head><body>
<header><h1>一个数据库引擎是如何实现的？——小而强大：SQLite · 审片页</h1><p>{DRAFT}（内容 SHA-256 {HASH[:8]}…）· 按字数估 {L['total'] / 60:.1f} 分钟（实测语速下约 10–11 分钟）· 2026-11-01 制作方 Claude Opus 5.5</p></header>
<main>
<div class="note">一次选定：文案是否确认（或逐句意见）、配音选哪个、配乐选哪个方向、关键帧方向是否认可、封面选哪张。配音只是试听，全片合成要等文案确认。</div>
<h2>要你决定的事</h2>
<ol class="ask">
<li>{DRAFT}能否确认配音？逐句意见按句号写即可（如「j12 改成……」）。这一稿只改了引子与第 01 章开头：从 MySQL、PostgreSQL 这类服务进程讲到嵌入式，不再用调查排名与「装得最多」。</li>
<li>配音：新的 5 个女声（MiniMax）选一个，上一批的 4 个也可以选（本集 PART 4；上一集 PostgreSQL 是男声）。语速都对齐到约 4.4 字/秒，比的是音色。</li>
<li>配乐：A、B、C 选一个方向（「简洁有力」）。</li>
<li>关键帧：新方向「像一页 sqlite.org 文档」——配色与字形取自它的样式表（深青圆角菜单、亮蓝子菜单、常规字重的编号标题、灰底代码块、已访问链接的紫褐、悬停的麦色）；不放标志，不用标志的羽毛色。是否认可。</li>
<li>封面：3 张预选（立体、有质感，同前三集；配色与正片同一套），选一张，或说要改哪里。</li>
</ol>
<h2>配音候选（同一段文字：第 4 稿的 o4、s14、s22、j9、w11、e12；比音色用，o4 的措辞已在第 5 稿改了）</h2>
{voices}
<h2>配乐小样（各约 32 秒）</h2>
{music}
<h2>关键帧（2026-11-01 按新方向重画；数字取自实测）</h2>
{kfs or '<p>（截图未生成）</p>'}
<h2>封面候选（16:9；数字取自 FACTS：J01、I01、E05）</h2>
{covers or '<p>（截图未生成）</p>'}
<h2>{DRAFT}全文</h2>
<p class="note">改了什么、为什么：见 review/NOTES.md「交审说明」。事实依据只在 research/FACTS.md。</p>
{script_html()}
</main></body></html>"""
open(os.path.join(A, 'index.html'), 'w', encoding='utf-8').write(page)
print(os.path.join(A, 'index.html'))
