# 本地审片页：连贯文案 + 5 个配音候选 + 3 个配乐小样 + 3 个视觉方向的关键帧 + 3 张封面。
# 用法：python videos/standalone/firebird/tools/audition_page.py   输出 out/audition/index.html（out/ 不入库）
import html, json, os, re, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'out', 'audition')
KF = os.path.join(OUT, 'kf')
os.makedirs(KF, exist_ok=True)

src = open(os.path.join(ROOT, 'src', 'js', 'script.js'), encoding='utf-8').read()
raw = src[src.index('const RAW = ['):src.index('const SAY')]
blocks = re.split(r"\n    \{\n      id: '", raw)[1:]
chapters = []
for b in blocks:
    sid = b[:b.index("'")]
    chap = re.search(r"chap: \['(\d)', '([^']+)'\]", b)
    cues = re.findall(r"\['(\w+)', '([^']+)', \{ gap", b)
    if cues:
        chapters.append((sid, chap.groups() if chap else None, cues))

cjk = sum(1 for _, _, cs in chapters for _, c in cs for x in c if '一' <= x <= '鿿')
lead = 12.5
for f in os.listdir(os.path.join(ROOT, 'shots')):
    m = re.match(r'page__design_kf_html_k_(\w+)\.png', f)
    if m:
        Image.open(os.path.join(ROOT, 'shots', f)).convert('RGB').resize((1280, 720), Image.LANCZOS).save(os.path.join(KF, m.group(1) + '.jpg'), quality=88)

voices = json.load(open(os.path.join(OUT, 'voice', 'voices.json'), encoding='utf-8'))
MUSIC = [
    ('a', 'A 工业电摇', '128 BPM，四拍底鼓，十六分音符的合成贝斯，失真吉他切分进来，中段一次抽空只留主旋律。最硬、最稳，适合把一个个事实钉下去。'),
    ('b', 'B 车库电子朋克', '168 BPM，快八分鼓，每八小节一次「停—打—打—打」的鼓组顿挫，芯片琶音和震音吉他轮流出现。最跳、最活泼。'),
    ('c', 'C 德式电子摇滚（Motorik）', '118 BPM，匀速往前推的鼓，琶音贝斯加带延迟的吉他，长线条模拟合成慢慢打开，后段才上失真。最小众、最耐听，旁白最不受挤压。'),
]
DIRS = [
    ('A 立体手册', '整部片就是一本 Firebird 官方手册：左栏目录常驻，每章亮起官方的绿色竖线，面包屑、编号标题、细线全照官方样式；东西从白纸上站起来（标志、门板办公桌、文件）。', ['a1', 'a2', 'a3']),
    ('B 层叠纸剧场', '文档被裁成一层层纸片，前后错开，靠景深和投影做 2.5D；标志色只出现在纸圈和关键一页上。换场是纸片抽走、后面一层露出来。', ['b1', 'b2', 'b3']),
    ('C 海报手册', '把文档的字体放大成演出海报：巨大的倾斜文字，火焰色做厚度，鼓点上整块砸进来；官方的提示框、目录留作小零件。最摇滚，也最不像文档。', ['c1', 'c2', 'c3']),
]
COVERS = [('v1', '封面 1 立体手册页', '标志从目录页上立起来，主标题印在纸上。'), ('v2', '封面 2 纸圈', '标志色纸圈层层叠起，标题是一张压在上面的文档页。'), ('v3', '封面 3 海报', '倾斜的巨字，火焰色厚度。')]

e = html.escape
parts = []
for sid, chap, cues in chapters:
    h = f'<h3>{chap[0]}. {e(chap[1])}</h3>' if chap else ('<h3>开场</h3>' if sid == 'open' else '<h3>收尾</h3>')
    body = ''.join(f'<span class="c" title="{i}"><sup>{i}</sup>{e(t)}</span>' for i, t in cues)
    parts.append(h + f'<p>{body}</p>')
vh = ''
for i, v in enumerate(voices['voices']):
    est = cjk / v['cps'] + lead
    vh += f'<div class="row"><b>{i + 1}. {e(v["name"])}</b><span class="m">{v["sex"]}声 · <code>{e(v["id"])}</code> · 语速 {v["speed"]} · 按此语速估全片 {int(est // 60)}:{int(est % 60):02d}</span><audio controls preload="none" src="{v["file"]}"></audio></div>'
mh = ''.join(f'<div class="row"><b>{e(n)}</b><span class="m">{e(d)}</span><audio controls preload="none" src="music/{f}.mp3"></audio></div>' for f, n, d in MUSIC)
dh = ''.join(f'<h3>{e(n)}</h3><p class="m">{e(d)}</p><div class="g3">' + ''.join(f'<img src="kf/{k}.jpg">' for k in ks) + '</div>' for n, d, ks in DIRS)
ch = '<div class="g3">' + ''.join(f'<figure><img src="kf/{k}.jpg"><figcaption><b>{e(n)}</b><br>{e(d)}</figcaption></figure>' for k, n, d in COVERS) + '</div>'
page = f'''<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>Firebird 审片页</title><style>
body{{margin:0;background:#f8f8f7;color:#1c1c1c;font:17px/1.75 "Noto Serif SC","Source Han Serif SC",serif}}
main{{max-width:1180px;margin:0 auto;padding:36px 28px 90px;background:#fff;border-left:1px solid #e7e7e9;border-right:1px solid #e7e7e9}}
h1,h2,h3{{font-family:"Open Sans","Noto Sans SC","Microsoft YaHei",sans-serif;font-weight:600}}
h1{{font-size:34px;margin:0 0 6px}} h2{{font-size:26px;border-top:1px solid #e7e7e9;padding-top:26px;margin-top:40px}} h3{{font-size:20px;margin:26px 0 6px}}
.m{{color:#666;font-size:15px}} code{{font:13px Consolas,monospace;background:#f7f7f8;padding:1px 5px}}
.c sup{{color:#2156a5;font:11px Consolas,monospace;margin-right:2px}}
.row{{display:grid;grid-template-columns:150px 1fr 320px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}}
.g3{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}} .g3 img{{width:100%;display:block;border:1px solid #ddd;cursor:zoom-in}} figure{{margin:0}} figcaption{{font-size:14px;color:#555;padding-top:4px}}
.note{{border-left:4px solid #54BC4B;padding:6px 14px;background:#f8f8f7;font-size:15px}}
li{{margin:4px 0}} @media(max-width:800px){{.row{{grid-template-columns:1fr}}.g3{{grid-template-columns:1fr}}}}
</style></head><body><main>
<h1>Firebird 审片页</h1><div class="m">既能做服务又能嵌入式，数据库小众的第三选择：Firebird · 第一稿 · 面向认识主流数据库、没听过 Firebird 的观众</div>
<h2>一、文案</h2>
<p class="note"><b>主线</b>：火狐为什么改名 → 那个「主人」是谁 → 它怎么从一间客房活到今天 → 回到火狐。贯穿的是「这个名字」和「被公司放手、被用户接住」。约 {cjk} 个汉字，{len([1 for _, _, c in chapters for _ in c])} 句。事实出处逐条在 research/FACTS.md。</p>
{''.join(parts)}
<h3>需要你留意的几处</h3><ul>
<li><b>时长</b>：按各音色的试听语速估全片约 3:40–4:30（每个音色后面有单独的估算），配音后按实测再微调。</li>
<li><b>没进文案的</b>：流传很广的「M1 坦克开炮、InterBase 总能恢复」只查到 2002 年网友转述，没有可靠出处，不用；备份工具叫 Burp（打嗝）是真的，为节奏删了，想要可以加回。</li>
<li><b>两边都站</b>的一段用的是真实实验：Firebird 5.0.4，同一个文件先嵌入式、再走 TCP、关服务后再嵌入式，回显已存。</li>
<li><b>后门年份</b>：来源有分歧（Schneier 说七年，FreeBSD 通告说 1992 年引入），文案取 Schneier 的「过去七年发布的版本」。</li></ul>
<h2>二、配音候选（读同一段代表句）</h2><p class="m">只是试听，全片配音等文案确认。避开了前几部用过的音色。我这边不能听声音，语气和读音要靠你的耳朵。</p>{vh}
<h2>三、配乐小样（各约 60 秒）</h2><p class="m">全部程序合成，电子为主、带摇滚成分。三首共用一个动机：FIREBIRD 里能当音名的字母是 F、E、B、D，F 到 B 是三全音。我只做过响度和频谱的数值检查，没有听过。</p>{mh}
<h2>四、视觉方向（都遵循官方文档样式 + 2.5D）</h2>
<p class="m">取材：官方手册的白页、左栏目录、绿色当前项、面包屑、编号标题、红色提示框、Open Sans 标题；颜色只有文档灰白与标志的金橙红。节奏上，换页、弹起、砸字都落在配乐拍点上。</p>{dh}
<h2>五、封面（含官方 Logo，2.5D）</h2>{ch}
</main><script>document.querySelectorAll('img').forEach(i=>i.onclick=()=>window.open(i.src));</script></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8', newline='\n').write(page)
print('ok', cjk, 'chars', len(page))
