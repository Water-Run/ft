# 生成本地审片页 out/audition/index.html（不入库）：文案全文（由 src/js/script.js 生成，不另写一份）、5 个配音候选、
# 3 段配乐小样、关键帧与立体封面候选，以及待策划者决定的事项。先运行 audition_voices.py、music_sketch.py 并截好图。
# 用法：python videos/database-engines/clickhouse/tools/audition_page.py
import html, json, os, re, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OUT = os.path.join(FILM, 'out', 'audition')
dump = subprocess.run(['node', '-e', 'const s=require(process.argv[1]);console.log(JSON.stringify(s.SCRIPT))', os.path.join(FILM, 'src', 'js', 'script.js')],
                      capture_output=True, text=True, encoding='utf-8', check=True).stdout
SCRIPT = json.loads(dump)
src = open(os.path.join(FILM, 'src', 'js', 'script.js'), encoding='utf-8').read()
FACT = {m.group(1): m.group(2).strip() for m in re.finditer(r"\['([a-z]+\d+)',[^\n]*?//\s*([A-Z]\d{2}(?:[ ，、][A-Z]\d{2})*)", src)}
voices = json.load(open(os.path.join(OUT, 'voices.json'), encoding='utf-8'))
E = html.escape

def term(t): return re.sub(r'\*([^*]+)\*', r'<b class="term">\1</b>', E(t))
chapters, total = [], 0
for sc in SCRIPT:
    cues = [c for c in sc['cues'] if c[1]]
    if not cues: continue
    parts = []
    for i, (cid, cap, o) in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else ''
        cont = bool(re.fullmatch(re.escape(re.sub(r'[b-g]$', '', cid)) + r'[b-g]', nxt))
        end = '' if cap.endswith(('？', '：')) else ('，' if cont else '。')
        f = FACT.get(cid)
        parts.append(f'<span class="cue" title="{cid}"><sup>{cid}</sup>{term(cap)}{end}{f"<em>{E(f)}</em>" if f else ""}</span>')
        total += len(re.sub(r'[*，。：；、？！\s]', '', cap))
    head = f"{sc['chap'][0]} · {E(sc['chap'][1])}" if sc['chap'] else '开场（无章节卡）'
    ask = f'<span class="ask">章节卡问句：{E(sc["ask"])}</span>' if sc.get('ask') else ''
    chapters.append(f'<section class="chap"><h3>{head}{ask}</h3><p>{"".join(parts)}</p></section>')

vrows = []
for i, v in enumerate(voices['voices'], 1):
    if v.get('error'): vrows.append(f'<div class="card"><b>{i}. {E(v["label"])}</b> <code>{E(v["id"])}</code> · 不可用：{E(v["error"])}</div>'); continue
    vrows.append(f'<div class="card"><div class="row"><b>{i}. {E(v["label"])}</b><code>{E(v["id"])}</code></div>'
                 f'<audio controls preload="none" src="{E(v["file"])}"></audio><div class="meta">MiniMax {E(voices["model"])} · 语速 {v["speed"]} · {v["seconds"]} 秒 · 每秒 {v["rate"]} 字</div></div>')
MUSIC = [
    ('A', '秒级', '124 拍/分，E 小调。十六分音符的拨弦琶音像一路列数据流过，低音八分音符推着走，最高处进底鼓与一句短旋律。讲「快」，最现代、最有冲劲。'),
    ('B', '列', '100 拍/分，D 多利亚。八个金属槌音各占一小节里固定的位置，像八列数据，一列一列加进来，中段有低音脉冲，再一列一列退出。冷、准、克制，最贴「按列存放」。'),
    ('C', '合并', '88 拍/分，A 小调落到 C 大调。三条旋律线各奏同一个动机的片段、彼此错开，越往后越齐，最高处合成一条齐奏，一声低沉的重击。讲 MergeTree 的合并，史诗感收着用。'),
]
mrows = ''.join(f'<div class="card"><div class="row"><b>小样 {k}「{t}」</b></div><audio controls preload="none" src="music-{k}.mp3"></audio><div class="meta">{E(d)}</div></div>' for k, t, d in MUSIC)
KF = [
    ('kf-a.png', 'A 黄黑·平面', '近黑底 #151515，黄 #FAFF69 是唯一的强调色；等宽数据、细网格，像 clickhouse-client 的终端。画面：8 行小表，一行挨一行 → 三个列文件，age.bin 的 8 个字节亮起。最清楚，信息密度高。'),
    ('kf-b.png', 'B 立体·质感', '黑底带细颗粒，片段画成立体的黄色板，厚度按行数；合并时一摞摞薄板叠成一整块。画面：90 个片段 → 15 → 3 → all_1_90_3。最有分量，适合片段与合并这条主线。'),
    ('kf-c.png', 'C 黄底·海报', '反过来用黄做底、黑做字与块，大数字压住画面。画面：12,209 个索引项、二分的括号收窄到第 0 个颗粒。冲击力最强，适合作章节高潮或数字揭示。'),
]
krows = ''.join(f'<figure><img src="{f}" alt="{E(t)}"><figcaption><b>{E(t)}</b>　{E(d)}</figcaption></figure>' for f, t, d in KF)
COV = [
    ('cover-a.png', 'A「只读一列」', '三块等宽的立体列，只有 age 亮着；数据「一亿行求平均，只读一列 · 529 KiB / 882 MiB · 7 ms」。直接对着开场的问题。'),
    ('cover-b.png', 'B「片段合并」', '左边 90 块薄板（写入时的片段，三摞），右边并成的一整块 all_1_90_3，厚度同一比例；副题点出 MergeTree。'),
    ('cover-c.png', 'C「稀疏索引」', '黄底黑字。一亿行立成一根黑色长条，第 0 个颗粒（Alice 在里面）被抽出来；数据「12,209 个索引项管一亿行」。'),
]
crows = ''.join(f'<figure><img src="{f}" alt="{E(t)}"><figcaption><b>{E(t)}</b>　{E(d)}</figcaption></figure>' for f, t, d in COV)

page = f'''<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ClickHouse 审片页</title>
<style>
:root{{--y:#FAFF69;--k:#151515;--k2:#1F1F1C;--g:#A0A0A0;--w:#F4F4F0;--line:#33332e}}
body{{margin:0;background:var(--k);color:var(--w);font:16px/1.75 "Noto Sans SC","Microsoft YaHei",system-ui,sans-serif}}
main{{max-width:1180px;margin:0 auto;padding:40px 24px 120px}}
h1{{font-size:30px;margin:0 0 4px}} h2{{font-size:22px;margin:56px 0 14px;padding-top:18px;border-top:1px solid var(--line)}} h2 span{{color:var(--y)}}
h3{{font-size:17px;margin:26px 0 6px;color:var(--y)}} .ask{{color:var(--g);font-weight:400;font-size:14px;margin-left:12px}}
.lead{{color:var(--g)}} code{{background:var(--k2);padding:1px 6px;border-radius:3px;font-size:13px}}
.box{{background:var(--k2);border-left:3px solid var(--y);padding:12px 18px;margin:14px 0}}
.box ol,.box ul{{margin:6px 0;padding-left:22px}}
.cue sup{{color:#6d6d64;font-size:10px;margin-right:2px}} .cue em{{font-style:normal;color:#7d7d40;font-size:11px;margin-left:2px}}
.term{{color:var(--y);font-weight:600}} .chap p{{margin:0}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}}
.card{{background:var(--k2);padding:14px 16px;border-radius:4px}} .card .row{{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}}
.card audio{{width:100%;margin:8px 0 4px}} .meta{{color:var(--g);font-size:14px}}
figure{{margin:0 0 26px}} figure img{{width:100%;display:block;border:1px solid var(--line)}} figcaption{{color:var(--g);font-size:14px;margin-top:6px}} figcaption b{{color:var(--w)}}
.strip img{{width:100%;border:1px solid var(--line)}}
.sample{{color:var(--g);font-size:14px}}
</style></head><body><main>
<h1>一个数据库引擎是如何实现的？——OLAP与列式存储：ClickHouse</h1>
<div class="lead">PART 5 · 审片页 · 第 1 稿 · 2026-11-07 · 交审稿，尚未经人工确认 · 文案约 {total} 字，按字数估算约 11.8 分钟（系列给本集的预期约 12 分钟）</div>

<div class="box"><b>请在这一页选定：</b><ol>
<li>文案：通读后给意见（句号标在每句前，如 <code>e6</code>）；确认后才配全片。</li>
<li>配音：5 个男声选一个（本系列一集男声、一集女声交替，上一集 SQLite 是女声）。</li>
<li>配乐：3 段小样选一个方向。</li>
<li>视觉：3 个关键帧方向选一个，或指出要混合的部分。</li>
<li>封面：3 张立体封面选一张。</li>
</ol></div>

<h2><span>01</span> 这一稿怎样处理「多引擎」与 MergeTree 的难点</h2>
<div class="box"><ul>
<li><b>标题照你的意见保持「ClickHouse」</b>，片中先交代表引擎：建表最后一行写 <code>ENGINE</code>，这个版本有 <b>84</b> 种（实测 <code>system.table_engines</code>）。</li>
<li><b>和 MySQL 的区别直接说出来</b>：MySQL 的引擎是同一件事的几种做法、要你挑；ClickHouse 的其他引擎大多不是来替代谁的——有的是同一种存法的变体，有的分发查询，有的只是通往 MySQL、Kafka 的门（三类的分法出自官方的 VLDB 2024 论文）。</li>
<li><b>「基本只有 MergeTree」用两个实测来证明</b>：建表不写引擎，缺省就是 MergeTree；ClickHouse 自己记的 <code>query_log</code>、<code>part_log</code> 也都是 MergeTree 表。由此一句「讲 ClickHouse 怎样存数据，讲的就是 MergeTree」，之后专注 MergeTree。</li>
<li><b>名字是理解的抓手</b>：Tree 不是 B 树（全片没有一棵 B 树，前几集都有）；思路来自 1996 年的 LSM 树；Merge 就是合并。家族里的其他成员（Replacing、Summing…）放到「合并」讲完之后才出现：存法一样，只是合并时对排序键相同的行做的事不同——这时观众已经知道合并是什么。</li>
<li><b>一个贯穿的主角：片段</b>。它由一次插入写成（临时目录 → 改名）、被合并、被稀疏索引和标记读取、被变更换成新版本（硬链接）、被删除标记、被 Bob 的快照留住、在崩溃后被清理或退回。每章回答上一章留下的问题。</li>
<li><b>新名词控制在这几个</b>：表引擎、排序键、片段、合并、颗粒、稀疏索引、标记、变更、快照（另有异步插入、硬链接两个一句带过）。</li>
</ul></div>

<h2><span>02</span> 待你决定或留意的</h2>
<div class="box"><ol>
<li>开场的「零点零零七秒」是热缓存下的实测（机器页缓存无权限清空）。画面会注明「热缓存」；如果你希望开场用冷读的数字，需要在那台机器上用 root 清一次页缓存再测。</li>
<li>演示数据的年龄按本系列的规则 <code>18 + id % 63</code> 循环，规律极强，age 列压缩到 529 KiB 远比真实数据夸张。旁白只说「五百多 K」不说倍数，画面注明；也可以改用不循环的年龄重新实测（会偏离系列共用的数据）。</li>
<li>轻量更新（补丁片段，新版本才有）现在只用一句带过（<code>u7</code>）；要不要删掉，或者展开？</li>
<li>崩溃一章如实说明「一条写一亿行的语句没有整个撤回，写完的 42 个片段留下了」（<code>r5</code>）——和前几集「全成或全不成」的事务对照很鲜明，但也可能让人以为是缺陷。保留还是改写，请定。</li>
<li>定稿前我会从空数据卷按顺序把 11 个实验完整重跑一遍（第一次并发实验中途卡住，留下一行多余的 Carol），数字以重跑为准；目前文案里的数字都已与回显核对。</li>
</ol></div>

<h2><span>03</span> 文案全文</h2>
<div class="lead">由 <code>src/js/script.js</code> 生成；灰色小字是句号，黄绿小字是 <code>research/FACTS.md</code> 里的事实编号。逗号、句号是按句子拆分补上的，配音的停顿另按读法规则调。片尾 <code>SELECT * FROM credits;</code> 只上画面，不配旁白。</div>
{"".join(chapters)}

<h2><span>04</span> 配音候选（男声，5 选 1）</h2>
<div class="lead">读同一段代表句；先用语速 1.0 量出每秒字数，再调到每秒约 4.9 字左右重合成，好比较音色本身。都没有在本系列用过。只是试听，全片配音等文案确认。</div>
<p class="sample">代表句：{E(voices["text"])}</p>
<div class="grid">{"".join(vrows)}</div>

<h2><span>05</span> 配乐小样（3 选 1，各约 60 秒）</h2>
<div class="lead">用 numpy 加法合成（<code>tools/music_sketch.py</code>），不用任何采样；都与前几集（MyISAM 终端电子、InnoDB「两个事务」、PostgreSQL 56 拍沉稳、SQLite「页的脉冲」）区分开。说明：我能核对的只有合成成功与响度归一（-18 LUFS），没有办法实际去听，听感请以你的耳朵为准。</div>
<div class="grid">{mrows}</div>

<h2><span>06</span> 视觉方向（关键帧，3 选 1）</h2>
<div class="lead">色值与字体取自官网（<code>research/MATERIALS.md</code>）：黄 #FAFF69、近黑 #151515，Inter 与等宽字体；不放产品标志，竖条是「列」本身，不复刻标志的根数与比例。画面里的数据全部来自实测回显。</div>
{krows}

<h2><span>07</span> 立体封面（3 选 1）</h2>
<div class="lead">版式与系列各集同分量：PART 5、问句、大标题、一幅讲清要点的立体图、实测数据。下面先看缩略图尺寸下是否读得清。</div>
<div class="strip"><img src="covers-strip.png" alt="三张封面的缩略图"></div><br>
{crows}
</main></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
print(os.path.join(OUT, 'index.html'), total)
