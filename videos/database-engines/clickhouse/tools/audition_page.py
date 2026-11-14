# 生成本地审片页 out/audition/index.html（不入库）：文案全文（由 src/js/script.js 生成，不另写一份；与上一稿对照标出改动）、
# 自对抗审查记录、策划者已选定的配音（温润青年，读新引子、来历与结尾的试听）、配乐（B×C 融合小样）、视觉（平面关键帧 D1–D4）、封面（A），
# 以及待策划者决定的事项。先运行 voice_demo.py、music_sketch.py BC，并截好关键帧与封面。
# 用法：python videos/database-engines/clickhouse/tools/audition_page.py
import html, json, os, re, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OUT = os.path.join(FILM, 'out', 'audition')
SCRIPT_JS = os.path.join(FILM, 'src', 'js', 'script.js')
DRAFT = 4

def node(expr):
    return subprocess.run(['node', '-e', expr, SCRIPT_JS], capture_output=True, text=True, encoding='utf-8', check=True).stdout
SCRIPT = json.loads(node('const s=require(process.argv[1]);console.log(JSON.stringify(s.SCRIPT))'))
EST = float(node('const s=require(process.argv[1]);console.log(s.layoutScript({}).total/60)'))
src = open(SCRIPT_JS, encoding='utf-8').read()
FACT = {m.group(1): m.group(2).strip() for m in re.finditer(r"\['([a-z]+\d+[a-z]?)',[^\n]*?//\s*([A-Z]\d{2}(?:[ ，、][A-Z]\d{2})*)", src)}
TITLE = json.load(open(os.path.join(FILM, 'project.json'), encoding='utf-8'))['titles']['zh']
prev = json.load(open(os.path.join(FILM, 'review', 'prev-captions.zh.json'), encoding='utf-8'))
PREV = {c for _, c in prev['captions']}; PREV_N = prev['draft']
E = html.escape

def term(t): return re.sub(r'\*([^*]+)\*', r'<b class="term">\1</b>', E(t))
def plain(t): return t.replace('*', '')
cur = {c[0]: plain(c[1]) for sc in SCRIPT for c in sc['cues'] if c[1]}
CUR = set(cur.values())
chapters, total, nnew = [], 0, 0
for sc in SCRIPT:
    cues = [c for c in sc['cues'] if c[1]]
    if not cues: continue
    parts = []
    for i, (cid, cap, o) in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else ''
        cont = bool(re.fullmatch(re.escape(re.sub(r'[a-g]\d?$', '', cid)) + r'[a-g]\d?', nxt)) or bool(re.fullmatch(re.escape(cid) + r'[a-g]\d?', nxt))
        end = '' if cap.endswith(('？', '：')) else ('，' if cont else '。')
        f = FACT.get(cid)
        chg = plain(cap) not in PREV
        nnew += chg
        parts.append(f'<span class="cue{" chg" if chg else ""}" title="{cid}"><sup>{cid}</sup>{term(cap)}{end}{f"<em>{E(f)}</em>" if f else ""}</span>')
        total += len(re.sub(r'[*，。：；、？！\s]', '', cap))
    head = f"{sc['chap'][0]} · {E(sc['chap'][1])}" if sc['chap'] else '引子（片名之前，无章节卡）'
    ask = f'<span class="ask">章节卡问句：{E(sc["ask"])}</span>' if sc.get('ask') else ''
    chapters.append(f'<section class="chap"><h3>{head}{ask}</h3><p>{"".join(parts)}</p></section>')
gone = [c for _, c in prev['captions'] if c not in CUR]
gone_html = ''.join(f'<li>{E(c)}</li>' for c in gone)
old_voices = json.load(open(os.path.join(OUT, 'voices.json'), encoding='utf-8'))
chosen = next(v for v in old_voices['voices'] if v['id'].endswith('Gentle_Youth'))
n_open = len([c for c in next(sc for sc in SCRIPT if sc['id'] == 'open')['cues'] if c[1]])
REAL_LO = (EST - 0.8) * 0.85 + 0.8; REAL_HI = (EST - 0.8) * 0.95 + 0.8      # 估算偏保守：实测引子与结尾比估算短约 16%，来历短约 5%；0.8 分钟是章节卡、片名与片尾的固定时间
n_hist = len([c for c in next(sc for sc in SCRIPT if sc['id'] == 'history')['cues'] if c[1]])

KD = [
    ('kf-d4.png', '第 01 章「来历」', '上面是 Yandex.Metrica 的时间线（先汇总 → 2009 年起的 OLAPServer → ClickHouse 去掉限制 → 2014 年的量 → 2016 年开源 → 今天）；下面是分析型数据库的年代（早期装在自家机房 → 二〇一〇年代初的云数据仓库 → ClickHouse）。名字只在画面上。'),
    ('kf-d1.png', '第 03 章「一列挨一列」', '左边传统数据库的一行挨一行，右边三个列文件，age.bin 是焦点；注解是 age.bin 的真实字节。'),
    ('kf-d2.png', '第 05 章「合并」', '八个人分三批到的三个片段并成一个：归并走到一半，1、2、3 号已拿下，各摞最上面剩下 5、4、6，最小的 4 号是下一张；右边是 part_log 的真实回显与查询要看的片段数 3/3 → 1/1。'),
    ('kf-d3.png', '第 06 章「稀疏索引」', '一个片段里的颗粒（每 8192 行一个）、每个颗粒第一行的编号组成的索引、2050 去比索引项落进第 0 个颗粒、三个列文件里的标记把颗粒对到文件里的位置。'),
]
kdrows = ''.join(f'<figure><img src="{f}" alt="{E(t)}"><figcaption><b>{E(t)}</b>　{E(d)}</figcaption></figure>' for f, t, d in KD)
KA = [('kf-ab1.png', '上一轮 A×B 融合 1'), ('kf-ab2.png', '上一轮 A×B 融合 2'), ('kf-ab3.png', '上一轮 A×B 融合 3')]
karows = ''.join(f'<figure><img src="{f}" alt="{E(t)}"><figcaption><b>{E(t)}</b></figcaption></figure>' for f, t in KA)

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
.box ol,.box ul{{margin:6px 0;padding-left:22px}} .box li{{margin:4px 0}}
.cue sup{{color:#6d6d64;font-size:10px;margin-right:2px}} .cue em{{font-style:normal;color:#7d7d40;font-size:11px;margin-left:2px}}
.cue.chg{{background:rgba(250,255,105,.13);border-bottom:1px solid rgba(250,255,105,.5)}}
.term{{color:var(--y);font-weight:600}} .chap p{{margin:0}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}}
.card{{background:var(--k2);padding:14px 16px;border-radius:4px}} .card .row{{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}}
.card audio{{width:100%;margin:8px 0 4px}} .meta{{color:var(--g);font-size:14px}}
figure{{margin:0 0 26px}} figure img{{width:100%;display:block;border:1px solid var(--line)}} figcaption{{color:var(--g);font-size:14px;margin-top:6px}} figcaption b{{color:var(--w)}}
.sample{{color:var(--g);font-size:14px}} details{{margin:10px 0}} summary{{cursor:pointer;color:var(--y)}} details ul{{columns:2;font-size:14px;color:var(--g)}}
.tag{{display:inline-block;background:var(--y);color:var(--k);font-weight:700;font-size:12px;padding:0 7px;border-radius:2px;margin-right:6px}}
.pick{{border-left-color:#6dd58c}} .pick .tag{{background:#6dd58c}}
</style></head><body><main>
<h1>{E(TITLE)}</h1>
<div class="lead">PART 5 · 审片页 · <b style="color:var(--y)">第 {DRAFT} 稿</b> · 2026-11-08 · 交审稿，尚未经人工确认 · 文案约 {total} 字，按字数估算 {EST:.1f} 分钟（含片尾 8 秒；你给的上限是 19 分钟）；用选定的音色、语速 1.18 实测：引子 69 秒、来历 125 秒、结尾转场 55 秒，比估算短 5–16%，全片预计约 {REAL_LO:.1f}–{REAL_HI:.1f} 分钟（第 3 稿估算 16.5 分钟）</div>

<div class="box pick"><b><span class="tag">已定</span>你上一轮定的，仍然有效：</b><ul>
<li><b>配音：温润青年</b>（MiniMax <code>Chinese (Mandarin)_Gentle_Youth</code>）——第 04 节用第 {DRAFT} 稿的引子、来历和结尾转场读了一遍。</li>
<li><b>配乐：小样 B「列」与 C「合并」的融合</b>——第 05 节。</li>
<li><b>封面：A「只读一列」</b>——第 07 节。</li>
<li><b>视觉：</b>你说「画面不用为立体而立体，效果也还行，参考前面几期的」——这一版改回<b>平面</b>，按前几集的做法（各取自己引擎官方材料的样子、常驻引擎标识、整套结构画真实比例、注解贴在被解释的东西旁边），立体只留在封面。第 06 节是四个新关键帧，上一轮的融合帧折叠在下面备查。</li>
</ul></div>
<div class="box"><b>请你做的：</b>通读第 03 节文案，按句号给意见（如 <code>h7</code>）；<span style="background:rgba(250,255,105,.13);border-bottom:1px solid rgba(250,255,105,.5)">黄底的句子</span>是相对第 {PREV_N} 稿新增或改写的（共 {nnew} 句）。确认之前不配全片。</div>

<h2><span>01</span> 这一稿做了什么</h2>
<div class="box"><b><span class="tag">你的要求</span></b>「时长可以给到 19 分钟，你有自主权。引子重写，不是 SQLite 这么一个例子，而是前面所有的 OLTP 行存。文案继续对抗迭代，和各期一样要有历史部分。画面不用为立体而立体哈……另外 ClickHouse 很省空间，也要提一句至少。」</div>
<div class="box"><b><span class="tag">引子</span>重写成「前面所有的 OLTP 行存」（{n_open} 句，约 1 分半）</b><ul>
<li>开头不再是 SQLite 一个例子：<b>前面四期——MySQL 的 MyISAM 和 InnoDB、PostgreSQL、SQLite——存法各不相同，但都是一个人一行地存</b>（MyISAM 的数据文件是一行接一行，InnoDB 的表叶子里是整行，PostgreSQL 是堆里的行，SQLite 是 B+ 树叶页里的整条记录），因为它们的活儿是：找到 Alice，改她的年龄，Alice 注销了把她删掉——一次只碰一个人，要快，还要不出错。这样的数据库叫 <b>OLTP</b>（联机事务处理）。</li>
<li>然后转折：「可要是问的，不是哪一个人呢？」一家公司一亿个用户，老板问平均年龄；交给 ClickHouse，不到十毫秒；<b>这几毫秒里，它读了哪些数据？</b>要是交给前面那样一行一行存的数据库，就得把一亿个人连姓名带编号一个个读一遍。ClickHouse 是为另一类问题造的：一次要看很多人的数据，做报表、做统计，叫 <b>OLAP</b>。结尾一句问：它是怎么做到的？为此又放弃了什么？</li>
</ul></div>
<div class="box"><b><span class="tag">历史</span>新增第 01 章「来历」（{n_hist} 句，约 2 分钟）——和各期一样，先交代这个引擎从哪来、为什么是这样</b><ul>
<li><b>故事线（出处是官方文档 <code>history.md</code> 与 VLDB 2024 论文）：</b>ClickHouse 是 Yandex 为网站统计 Metrica 造的（官方文档说 Metrica 是全球第二大的网站统计平台）。用户自己划分人群、自己选条件，<b>现场生成报表</b> → 当时通行的办法是<b>先汇总，再存汇总的结果</b>（比如每个页面每天的访问量），活儿大半在后台做完，这就是 Metrica 大多数报表的做法 → 可汇总有代价：报表得事先想到，用户想自己组合条件就做不到；网址这种取值极多的字段，汇总完数据量几乎没变小 → 二〇〇九年起，Metrica 又用上一个专门存<b>没汇总过的原始数据</b>的分析库，叫 OLAPServer，它好用，但只认数字、新数据加不进去、要每天整个重写一遍 → <b>ClickHouse 最初的目标，就是去掉这些限制，让所有报表都直接从原始数据算</b> → 到二〇一四年一天记约一百二十亿次浏览和点击，一次查询要在几百毫秒里扫过几百万行；用户在等，所以现场算、要算得极快 → 二〇一六年开源，后来长成通用的分析型数据库（官方文档说，现在 Metrica 的库里已有十三万亿条以上的记录）。</li>
<li><b>年代：</b>分析型数据库不是 ClickHouse 才有——更早的那些（Teradata、Vertica、Sybase IQ、Greenplum）又贵，又装在自家的机房里，数据得靠批量导入；二〇一〇年代初，云上的分析型数据库（Snowflake、BigQuery、Redshift）出现，分析才便宜了下来。（论文的概述性说法；名字只在画面上。）</li>
<li>这一章结尾回扣开头：<b>「回到开头那几毫秒。它是怎么存数据的？先看建表时的一个词」</b>，接第 02 章的表引擎。后面所有做法都从这条因果出发：用户在等，数据不汇总，要读很多行，还要算得快。</li>
</ul></div>
<div class="box"><b><span class="tag">省空间</span>补了一处，并且说准</b>：第 03 章在「一列里的值类型相同、挨在一起，容易压缩」之后加了——<b>「所以按列存，还很省空间」，整张表原本有六个多 G，压缩之后只有八百八十多兆，约七分之一</b>；随后讲年龄这一列九十五兆压到五百多 K，并明说「年龄是按规律排的，压得格外狠，真实数据没这么夸张」（这些数都是演示数据上的实测；编号那一列几乎压不动，片中不讲）。取舍一章也回扣：「整张表也压到了原来的七分之一，省地方」。</div>
<div class="box"><b><span class="tag">自对抗</span>这一轮</b><ul>
<li><b>独立编辑（只看朴素全文）</b>：AI 味 5/10；引子 6/10（原话：「七毫秒」——现已按重跑改为「不到十毫秒」——的钩子到第 10 句才出现，前面像清单回顾，转折生硬）；来历 6/10（「因果清楚，是好故事」，但时间线乱、名字太多）。采纳并已改：①引子压成短句、去掉「这叫一条查询」、转折改成「可要是问的，不是哪一个人呢」；②<b>来历按时间顺序重排</b>（原来 2014 → 2009 → 2009 来回跳，现在是：这个活儿 → 先汇总 → 汇总的局限 → 2009 OLAPServer → ClickHouse 的初衷 → 2014 的量 → 2016 开源 → 今天）；③删去再不出现的名字 Metrage，OLAPServer 只念一次；④Teradata、Vertica 等六个厂商名从口播里拿掉，只留在画面上；⑤三连改两条（汇总的局限只留「报表得事先想到」和「取值极多的字段」）；⑥OLAPServer「是 OLAP 数据库」与「不是真正的 DBMS」自相矛盾，统一叫「专门的分析库」；⑦「有的……有的」「一扇门」等对仗改平实；⑧历史结尾的点题清单改成回扣开头那几毫秒；⑨「所以排序键得照最常用的查询条件来选」等几处点题改成更准的说法。</li>
<li><b>观众诘问（外行 + 内行，逐句过一遍，并做 MergeTree 测验）</b>：外行答得出「片段是什么」「片段多了有什么坏处」（900 个一行的片段那一段「很好」）「合并怎么做」（卡片那一段「很好」）；答不上名字——「倒过来看像棵树」全靠画面，已改成「最下面是九百个小片段，往上一层层并」再「倒过来看，像一棵树」。引子里外行在第 25 秒前像听清单、直到「可要是问的，不是哪一个人呢」才被抓住 → 回顾前四期压成短句。<b>对历史的诘问</b>：外行——Yandex、Metrica 没说是什么 → 补「有搜索、电商、广告等服务」「统计服务叫 Metrica」；「取值极多为何缩不小」没听懂 → 改成「比如网址，几乎每个都不一样，汇总完，数据量几乎没变小」；「只认数字」是什么意思、ClickHouse 新在哪 → 补「什么类型的数据都能存，新数据随时能加」；h9「几百毫秒扫几百万行」与开头「一亿行不到十毫秒」打架 → 加「那时的要求是」；通史一段「无名字无年份、没接回 ClickHouse」→ 压到四句并接回「ClickHouse 走的是另一条路：开源，一个程序就能跑」。内行——「第二大」「十三万亿」是官方文档自述且无年份，却用现在时 → 全部改成「官方文档说／写道」；「OLAPServer 也存原始数据，ClickHouse 新在哪」已补；「叫 LSM 树」过头（没有内存表、没有日志）→ 改成「和一九九六年提出的 LSM 树很像」。</li>
<li><b>「省空间」测验</b>：外行与内行都认为稿子让人明白了「按列存省空间」（c10、c12）；内行指出会误导——没说比什么（是比未压缩的原始大小，不是别家占用）、「七分之一」出自合成表而 c13b 只为年龄道歉，取舍里却当结论 → 现在是「这张表原本有六个多 G，压缩之后八百八十多兆，约七分之一」「这是演示数据，压得格外狠；真实数据，没这么夸张」，取舍里也加了「演示数据上」。</li>
<li><b>取舍与开头不配</b>（内行最不满意的一处）：开头问「为此，又放弃了什么？」，原来第 12 章只收回「改」，漏了点查、小批写、事务。→ 现在逐条收回：<b>改一个字节要重写一整列，表越大越慢；找一个人要读一个颗粒，八千多行；一次只插几行太浪费，得成批地写；要几条语句一起成败的事务，默认没有</b>，并接「这一切都有个前提：数据得是一张表的样子」再转到 SQL 之外。结尾两句「不当成表，也就不用 SQL 去问了」因果不成立 → 改成「下一个数据库，就是这么做的：MongoDB。它存的是文档，问法也不再是 SQL」。</li>
<li><b>两位读者都说「啰嗦」但我保留的</b>：c4c（修正「每列一个文件」与八个人小表的矛盾）、m11d–m11e（「并到了底」的如实交代）、i6c–i6d（二分的解释）。</li>
</ul></div>
<details><summary>相对第 {PREV_N} 稿被改写或删去的 {len(gone)} 句（点开对照；改写后的句子在全文里是黄底）</summary><ul>{gone_html}</ul></details>

<h2><span>02</span> 待你决定或留意的</h2>
<div class="box"><ol>
<li><b>时长：</b>估算 {EST:.1f} 分钟，按选定音色的实测比例推算全片约 {REAL_LO:.1f}–{REAL_HI:.1f} 分钟，在你给的 19 分钟之内（估算偏保守，不会超）。新增的主要是第 01 章「来历」（约 2 分钟）。如果觉得历史偏长，可以压的是：h4–h6d（先汇总的办法与局限，可压成两三句）、h11–h11e（更早的分析型数据库）。</li>
<li><b>历史里两个单一出处的说法</b>（官方文档）：「Metrica 是全球第二大的网站统计平台」「库里已有十三万亿条以上的记录」。旁白都说了「官方文档说」，画面也注出处；不放心的话可以删。ClickHouse 自己的起步年份（论文说 2009 年）旁白没讲——文档里 OLAPServer 与 ClickHouse 都出现 2009，先后关系没写清。</li>
<li>引子里「前四期都是行存的 OLTP」是按各期已核的事实转录的（FACTS S07）；MyISAM 与 InnoDB 是 MySQL 的两种引擎，旁白已写成「MySQL 的 MyISAM 和 InnoDB」。</li>
<li>开场的「七毫秒」是热缓存下的实测，第 03 章明说「当时，数据已经在内存缓存里」；「约七分之一」与「五百多 K」都是演示数据上的数，旁白坦白了一句。</li>
<li>崩溃一章如实说「写一亿行的这条语句并没有整个撤回，写完的 42 个片段留下了」，保留还是改写。</li>
<li>删除一章只讲了缺省的 <code>DELETE FROM</code>，<code>ALTER TABLE … DELETE</code>（重写所有列）没讲；第 07、08 章（改、删）外行读者觉得最干，我没有删，它们回答的是五问里的两问。</li>
<li><b>实验已从空数据卷完整重跑两次</b>（<code>research/lab/run_all.sh --fresh</code>，回显是 <code>out_*.txt</code>）：第一次发现 05 的三个异步插入被分成 1 + 2 两个片段，改脚本后再跑；另补了 13 号实验（开场那条查询连跑 30 次）。<b>因此片中几个数字变了</b>：「七毫秒」→「不到十毫秒」（30 次：最短 7、中位数 8、最长 9 毫秒；封面同改）；写入「十五秒」→「二十几秒」；变更「零点四秒」→「半秒上下」；按姓名找「零点三秒」→「两三百毫秒」；强杀留下「四十二个片段、两个临时目录」→「四十三个、一个」；Carol 的插入「两毫秒」→「几毫秒」。随机器负载变化的数字，三次运行的范围都记在 FACTS 里。机器是共用的，别的容器会让个别次数变慢——所以「三次取一个数」改成了「三十次取中位数」。</li>
<li><b>还没查清的一件事：</b>09 强杀时 4 秒写出 43 个片段（约 11 个/秒），03 里 90 个片段用了 20.8 秒（约 4 个/秒），两次写的是不同的表，原因没有查；旁白不并列这两个速度。</li>
<li>读音：<code>OLAP</code>、<code>OLTP</code> 按字母读，〇 一律读「零」，<code>all_1_3_1</code> 读成「all 一 三 一」；英文名词（Yandex、Metrica、OLAPServer、MySQL 等）等你确认文案后用代表段回听。</li>
</ol></div>

<h2><span>03</span> 文案全文</h2>
<div class="lead">由 <code>src/js/script.js</code> 生成；灰色小字是句号，黄绿小字是 <code>research/FACTS.md</code> 里的事实编号；黄底是相对第 {PREV_N} 稿新增或改写的句子。逗号、句号是按句子拆分补上的，配音的停顿另按读法规则调。片尾 <code>SELECT * FROM credits;</code> 只上画面，不配旁白。</div>
{"".join(chapters)}

<h2><span>04</span> 配音：温润青年（已选定）</h2>
<div class="lead">用第 {DRAFT} 稿新写的引子、来历和结尾转场读一遍，逐句合成、句间停顿取各句的 gap，与正式制作的做法一致；语速 1.18（约每秒 4.9 字，定稿前按实测定）。只是试听，不是全片配音。我没法实际去听，听感请以你的耳朵为准。</div>
<div class="grid">
<div class="card"><div class="row"><b>引子</b><code>{E(chosen["id"])}</code></div><audio controls preload="none" src="demo-intro.mp3"></audio><div class="meta">MiniMax speech-2.8-hd · 片名之前的全部旁白</div></div>
<div class="card"><div class="row"><b>来历</b><code>{E(chosen["id"])}</code></div><audio controls preload="none" src="demo-history.mp3"></audio><div class="meta">MiniMax speech-2.8-hd · 第 01 章「来历」全部旁白</div></div>
<div class="card"><div class="row"><b>结尾转场</b><code>{E(chosen["id"])}</code></div><audio controls preload="none" src="demo-ending.mp3"></audio><div class="meta">MiniMax speech-2.8-hd · 第 13 章「SQL 之外」全部旁白</div></div>
</div>

<h2><span>05</span> 配乐：B「列」× C「合并」（已选定）</h2>
<div class="lead">96 拍/分，D 多利亚落到 D 小。<b>B 的八个金属槌音</b>一小节加一列、各占固定的位置，像八列数据；中段进 <b>C 的三条旋律线</b>，先错开；然后八个槌音的位置与三条线一起向小节头收拢——合并；最高处八个音叠成一个和弦、一声低沉的重击——八列并成一个片段；最后回到单音。约 67 秒；正式配乐按全片时长另行铺排。我只核对了合成成功、响度归一和每小节的能量曲线，没法实际去听。</div>
<div class="grid"><div class="card"><div class="row"><b>小样 BC「列→合并」</b></div><audio controls preload="none" src="music-BC.mp3"></audio><div class="meta">tools/music_sketch.py BC · 不用任何采样</div></div>
<div class="card"><div class="row"><b>对照：小样 B「列」</b></div><audio controls preload="none" src="music-B.mp3"></audio><div class="meta">100 拍/分</div></div>
<div class="card"><div class="row"><b>对照：小样 C「合并」</b></div><audio controls preload="none" src="music-C.mp3"></audio><div class="meta">88 拍/分</div></div></div>

<h2><span>06</span> 视觉：平面，参照前几集</h2>
<div class="lead">前四集各取自己引擎官方材料的样子（MyISAM 的 mysql 终端、InnoDB 的手册架构图、PostgreSQL 的文档页、SQLite 的文档页），全片平面，左上角常驻引擎身份标识，整套结构按真实比例画出来，注解贴在被解释的东西旁边，立体只在封面。本集照做：官网的黄 <code>#FAFF69</code> 与近黑 <code>#151515</code>、细网格、等宽的 clickhouse-client 终端与文档部件，左上角常驻 ClickHouse 与版本（26.8 LTS），不放产品标志。画面里的数据全部来自实测回显。</div>
{kdrows}
<details><summary>上一轮「A 与 B 融合」的三帧（真 CSS 3D 把平面面板贴到有厚度的板上；你说效果还行，但不用为立体而立体——留作备选）</summary>{karows}</details>

<h2><span>07</span> 封面：A「只读一列」（已选定）</h2>
<figure><img src="cover-a.png" alt="封面 A"><figcaption><b>A「只读一列」</b>　三根黑色的列（id、name、age），只有 age 通体发光，列脚标着压缩后的大小：383 MiB、499 MiB、529 KiB；左边「一亿行求平均，只读一列 · < 10 ms · 热缓存」。三根等宽，宽度不表示大小。真透视的立体、拉丝纹理、荧光与地面倒影，底部约 15% 不放字。这是系列对封面的要求（有质感、立体），所以封面保留立体。正式出图要等文案确认之后（<code>covers.js</code> 在确认前拒绝运行），那时再按 16:9 与 4:3 各出一版。</figcaption></figure>
</main></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
print(os.path.join(OUT, 'index.html'), total, nnew, len(gone), round(EST, 1))
