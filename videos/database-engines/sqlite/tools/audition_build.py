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
DRAFT = '第 6 稿'
MUSIC = [('a', 'A · 页的脉冲', '96 BPM，D 小调。每拍一记低音，八分音符上一声很轻的「读页」短响；每两小节换一次根音。最克制，像文件被一页页读到。'),
         ('b', 'B · 拨弦琶音', '88 BPM，A 小调。钢琴式拨弦的八分音符琶音，低音落在一、三拍。最有旋律感。'),
         ('c', 'C · 木琴固定音型', '104 BPM，E 小调。木琴式短音反复一个四音型，长低音与每小节一记闷鼓。最有推进感。')]
KF = [('f1', '片头：一页 sqlite.org 首页——页头的两行斜体标语、深青主菜单（章节即菜单项）、居中的页标题、术语画成链接、「本集目录」侧栏盒、553 页的文件（读到的 7 页是文档的悬停麦色）'),
      ('f2', '02 怎么放：编号小节「2.1. B+ 树」；整棵树用文档的黑细线白框，根页画成一行表格，256 个叶页全画出'),
      ('f3', '03 怎么找：文档代码块写出查询；读到的 7 页画成官网的语法铁路图（圆头框、实心箭头、浅灰分组框）；下面一张文档表格'),
      ('f4', '04 一页里有什么：叶页 130 写成文件格式文档那样的「偏移 | 大小 | 内容」表；整页按字节真实比例；Alice 的 13 字节')]
COVERS = [('c1', '1 · 一个文件：553 页叠成一摞文档纸（第 1 页在最上面），找 Alice 读到的 7 页像书签一样抽出来，页号写在官网的灰色小按钮上'),
          ('c2', '2 · 立体的铁路图：读页路线画成铺在地面上的语法铁路图，每一页是一个有厚度的方框，页号印在顶面；姓名索引一组、users 表一组'),
          ('c3', '3 · 热日志：主文件与回滚日志两摞纸；「强行终止」用官网 TODO 的红色斜体框；重开时沿黑线从日志抄回原页，整个文件的 SHA-256 与改之前相同')]
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
voices = '\n'.join(vrow(v) for v in V['voices'] if not v.get('male'))   # 全部普通话女声，只去掉前三期用过的；第一批误列的男声不上页
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
<li>{DRAFT}能否确认配音？逐句意见按句号写即可（如「j12 改成……」）。和第 4 稿比：引子从 MySQL、PostgreSQL 这类服务进程讲到嵌入式（不再用调查排名与「装得最多」）；第 01 章开头加 SQLite 的来历（作者 Richard Hipp、军舰上的软件与 Informix 服务器、「为什么非要一个服务器」，据他本人访谈；起初是 Tcl 扩展；版本年表）；结尾先做全系列总结（MySQL、PostgreSQL、SQLite 都是事务型 OLTP，另一端是分析型 OLAP 与 ClickHouse），最后以公有领域与祝福收束。</li>
<li>配音：MiniMax 全部普通话女声，只去掉前三期用过的（InnoDB 的成熟女性-beta；MyISAM、PostgreSQL 是男声），共 26 个，选一个。语速都对齐到约 4.4 字/秒，比的是音色。</li>
<li>配乐：A、B、C 选一个方向（「简洁有力」）。</li>
<li>关键帧：按 sqlite.org 实际页面重画——页头两行斜体标语、深青主菜单（白色小字菜单项）、居中页标题、编号小节、黑色正文、术语画成链接、侧栏盒、文档代码块与表格、语法铁路图；强调只用文档的悬停麦色；不放标志。是否认可。</li>
<li>封面：3 张预选，也是一页文档，立体做在文档的「纸」上（纸堆、立起来的铁路图方框），选一张，或说要改哪里。</li>
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
