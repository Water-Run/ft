# 本地审片页（第 3 轮）：文案第 3 稿逐句、云健全文试读、选定的 B 方向关键帧与 CRT 终端配乐，只待确认文案。
# 用法：python tools/build_audition.py   （先跑 tools/readthrough_demo.py；关键帧截图见 README「设计」）
import hashlib
import html
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "audition"
HASH = "2db510f6c3a9964605c2801fbba5cf0a5bd8675258b755dc18127d594a414f75"
SCRIPT = ROOT / "review" / f"script.zh.{HASH}.md"
FRAMES = [("title", "开场 · IP 与第四版（o4）"), ("dense", "地址与前缀（p3）"), ("diagram", "路由（r3）"),
          ("special", "127.0.0.1 与 192.168（s3）· localhost 只在画面上"), ("ending", "结尾 · 地址池分完与 IPv6（e3）")]
TITLES = {"open": "开场", "address": "地址长什么样", "prefix": "网络与设备", "route": "一站站送", "special": "两种特别的地址", "limit": "不够用了"}
DUMP = r"""
const S = require(process.argv[1]);
console.log(JSON.stringify(S.SCRIPT.filter((s) => s.id !== 'outro').map((s) => ({ id: s.id, cues: s.cues.map((c) => [c[0], S.strip(c[1])]) }))));
"""


def esc(v):
    return html.escape(str(v), quote=True)


def main():
    if not SCRIPT.is_file():
        raise FileNotFoundError(f"交审稿不存在：{SCRIPT}（先运行 script-review.js export）")
    scenes = json.loads(subprocess.run(["node", "-e", DUMP, str(ROOT / "src" / "js" / "script.js")], capture_output=True, text=True, encoding="utf-8", check=True).stdout)
    dur = json.loads((OUT / "readthrough" / "durations.json").read_text(encoding="utf-8"))
    music = {m["id"]: m for m in json.loads((OUT / "music-manifest.json").read_text(encoding="utf-8"))}["crt-terminal"]
    for f in ["audio/readthrough-yunjian.mp3", music["file"]] + [f"images/desktop-{k}.png" for k, _ in FRAMES]:
        if not (OUT / f).is_file():
            raise FileNotFoundError(OUT / f)
    speech = sum(dur.values())

    script_html = ""
    for i, sc in enumerate(scenes, 1):
        rows = "".join(f'<li><span class="cid">{esc(cid)}</span><span class="cap">{esc(cap)}</span><span class="dur">{dur[cid]:.1f}s</span></li>' for cid, cap in sc["cues"])
        script_html += f'<article class="chap"><h3><span>{i:02d}</span>{esc(TITLES.get(sc["id"], sc["id"]))}</h3><ol>{rows}</ol></article>'
    frames_html = "".join(
        f'<figure class="win"><div class="tb">{esc(label)}</div><a href="images/desktop-{k}.png" target="_blank" rel="noopener"><img src="images/desktop-{k}.png" width="1920" height="1080" alt="{esc(label)}"></a></figure>'
        for k, label in FRAMES)

    page = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>100 秒速通 IPv4 · 审片页第 3 轮</title>
<style>
:root{{--teal:#008080;--silver:#c0c0c0;--white:#fff;--dgray:#808080;--black:#000;--navy:#000080}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--teal);color:var(--black);font:16px/1.7 "Microsoft YaHei","PingFang SC",system-ui,sans-serif}}
.shell{{width:min(1320px,calc(100% - 40px));margin:24px auto 0}}
.win{{background:var(--silver);border:3px solid;border-color:var(--white) var(--black) var(--black) var(--white);margin:0 0 24px;padding:0 0 4px}}
.tb{{background:var(--navy);color:var(--white);font-weight:700;padding:6px 14px;margin:3px}}
.body{{padding:18px 22px}}
.sunken{{background:var(--white);border:3px solid;border-color:var(--dgray) var(--white) var(--white) var(--dgray);padding:14px 18px}}
h1{{font:400 64px/1.1 Consolas,monospace;margin:6px 0 4px;color:var(--navy)}}h1 small{{display:block;font:700 22px/1.6 "Microsoft YaHei",sans-serif;color:var(--black)}}
.grid2{{display:grid;grid-template-columns:1.3fr 1fr;gap:20px}}dl{{margin:0;font-size:14px}}dt{{color:#333;margin-top:8px}}dd{{margin:0;font-weight:700;overflow-wrap:anywhere}}
ul.chg{{margin:0;padding-left:20px}}ul.chg li{{margin:4px 0}}
.chap{{margin:0 0 14px}}.chap h3{{margin:0 0 6px;font-size:18px}}.chap h3 span{{display:inline-block;background:var(--navy);color:var(--white);font:700 14px Consolas,monospace;padding:1px 8px;margin-right:10px}}
.chap ol{{list-style:none;margin:0;padding:0}}.chap li{{display:grid;grid-template-columns:44px 1fr 56px;gap:10px;padding:5px 0;border-bottom:1px solid var(--silver);font-size:18px}}
.cid{{font:700 14px/2 Consolas,monospace;color:var(--navy)}}.dur{{font:13px/2.2 Consolas,monospace;color:#333;text-align:right}}
audio{{width:100%;margin:8px 0}}.note{{font-size:14px;color:#222}}
.frames{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}.frames figure{{margin:0}}.frames img{{display:block;width:100%;height:auto}}
.choice{{display:flex;gap:10px;align-items:center;margin:8px 0;font-size:16px;cursor:pointer}}
textarea{{width:100%;min-height:90px;font:15px/1.6 Consolas,monospace;border:3px solid;border-color:var(--dgray) var(--white) var(--white) var(--dgray);padding:10px}}
button{{font:700 16px "Microsoft YaHei",sans-serif;background:var(--silver);border:3px solid;border-color:var(--white) var(--black) var(--black) var(--white);padding:8px 28px;cursor:pointer}}
button:active{{border-color:var(--black) var(--white) var(--white) var(--black)}}
footer{{color:var(--white);font:12px Consolas,monospace;padding:6px 0 30px}}
@media(max-width:860px){{.grid2,.frames{{grid-template-columns:1fr}}h1{{font-size:44px}}}}
</style></head><body><main class="shell">

<section class="win"><div class="tb">IPV4 · 审片页 第 3 轮</div><div class="body grid2">
<div><h1>100 秒速通 IPv4<small>第 3 稿：从「不知道什么是 IP」讲起</small></h1>
<div class="sunken"><b>本轮按你的意见改了：</b><ul class="chg">
<li>文案从零重写：先由打开网站问「设备那么多，靠什么找？」，答「靠地址」，再起名 IP，最后交代第四版定于一九八一年、一直用到今天。<b>阿帕网删掉了</b>，旁白和画面都不再出现。</li>
<li><b>127.0.0.1 直接说</b>：「127.0.0.1 指的是你自己这台电脑」；localhost 只在画面上当标签。</li>
<li>默认网关改说「家里的路由器」，网络前缀改说「地址分两截：前一截是网络，后一截是设备」，这两个术语只留在画面上。</li>
<li>已定：<b>风格 B、配音 03 云健、配乐 CRT 终端</b>。B 的关键帧已对上新稿，并新加一张「127.0.0.1 与 192.168」。</li>
<li>时长按云健逐句实测：第一版要 106 秒，删去「每段零到二百五十五」（改由画面注明）、「数据不出本机」（并进 127.0.0.1 那一帧的画面）、「设备越来越多」，现在旁白 {speech:.1f} 秒，加停顿 91.4 秒，再加 7.5 秒片尾正好 100 秒。各段余量只有 0.05–0.34 秒。</li>
</ul></div></div>
<div class="sunken"><dl><dt>状态</dt><dd>文案待 WaterRun 确认</dd><dt>文案内容 SHA-256</dt><dd>{HASH}</dd>
<dt>时长</dt><dd>云健 +6% 逐句实测：旁白 {speech:.1f} 秒 · 全片 100 秒</dd><dt>已选</dt><dd>视觉 B 九十年代桌面 · 配音 03 云健 · 配乐 CRT 终端</dd>
<dt>制作记录</dt><dd>第 1 轮 Kimi K3.1 Pro · 第 2、3 轮 Claude Opus 5.5</dd></dl>
<p class="note">页面上的选择只用来生成回复，不会自动批准文案。试读只是审稿用的逐句合成，不是正式配音；我没有人耳听过。</p></div>
</div></section>

<section class="win"><div class="tb">01 · 文案第 3 稿（每句后面是云健实测时长）</div><div class="body sunken">{script_html}</div></section>

<section class="win"><div class="tb">02 · 云健试读全文（按新稿时间线摆好，100 秒，含 7.5 秒无声片尾）</div><div class="body">
<audio controls preload="metadata" src="audio/readthrough-yunjian.mp3"></audio>
<p class="note">zh-CN-YunjianNeural，+6%。听的时候请顺带留意读音：「二〇一一」「IPv6」「/24（斜杠二十四）」与几个地址的读法。</p></div></section>

<section class="win"><div class="tb">03 · 画面：B 九十年代桌面 · 5 张关键帧（点击看原图）</div><div class="body"><div class="frames">{frames_html}</div>
<p class="note">底部任务栏就是字幕条，上沿分格进度条是 100 格秒尺；左上剩余秒数，右上四格 IP 地址框显示此刻在讲的地址。203.0.113.x、198.51.100.x 是文档专用的示例地址，画面上已注明。</p></div></section>

<section class="win"><div class="tb">04 · 配乐：CRT 终端（小样，60 秒）</div><div class="body">
<audio controls preload="metadata" src="{esc(music["file"])}"></audio><p class="note">{esc(music["design"])} 正式配乐会按 100 秒的段落重写。</p></div></section>

<section class="win"><div class="tb">05 · 反馈</div><div class="body grid2"><form id="f">
<label class="choice"><input type="radio" name="a" value="确认文案 {HASH[:8]}">确认第 3 稿（{HASH[:8]}），可以配音</label>
<label class="choice"><input type="radio" name="a" value="文案需修改">文案还要改（在下面补充意见）</label>
<textarea id="extra" placeholder="修改意见（可留空）"></textarea></form>
<div><textarea id="reply" readonly>文案待确认</textarea><p><button type="button" id="copy">复制反馈</button> <span id="st" class="note"></span></p></div></div></section>
</main><footer class="shell">100 秒速通 IPv4 · 本地审片页 / 非成片 · GPL-3.0-or-later · 离线可用</footer>
<script>
const f=document.getElementById('f'),r=document.getElementById('reply'),x=document.getElementById('extra'),st=document.getElementById('st');
function up(){{const c=f.querySelector('input[name=a]:checked');r.value=(c?c.value:'文案待确认')+(x.value.trim()?'：'+x.value.trim():'')}}
f.addEventListener('change',up);x.addEventListener('input',up);
document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(o=>{{if(o!==a)o.pause()}})));
document.getElementById('copy').addEventListener('click',async()=>{{try{{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(r.value);else{{r.select();if(!document.execCommand('copy'))throw 0}}st.textContent='已复制，请粘贴到对话里。'}}catch(e){{r.select();st.textContent='请手动复制选中的文字。'}}}});
</script></body></html>'''
    (OUT / "index.html").write_text(page, encoding="utf-8")
    print("已生成", OUT / "index.html", f"· 旁白 {speech:.1f} 秒 · 关键帧 {len(FRAMES)} 张")


if __name__ == "__main__":
    main()
