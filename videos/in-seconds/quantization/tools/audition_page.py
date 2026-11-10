#!/usr/bin/env python3
"""生成本地审片页 out/audition/index.html：文案、配音候选、配乐小样、关键帧，一次选定。

用法：python tools/audition_page.py
依赖：out/audition/ 里的 voice-*.mp3、voices.json、music-*.mp3，shots/ 里的关键帧截图
（node kit/tools/look.js <本片> --url "/design/keyframes.html?f=1" --size 1920x1080，f 取 1、2、3）。
"""
import html
import json
import os
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "audition")
js = """const s=require(process.argv[1]);
let fixed=0;for(const sc of s.SCRIPT){if(sc.id==='outro')continue;fixed+=(sc.lead||0)+(sc.tail==null?.6:sc.tail);for(const c of sc.cues)fixed+=c[2].gap==null?.3:c[2].gap}
console.log(JSON.stringify({scenes:s.SCRIPT.map(sc=>({id:sc.id,cues:sc.cues.filter(c=>c[1]).map(c=>({id:c[0],cap:s.strip(c[1]),tts:s.ttsText(c)}))})),fixed}))"""
env = {**os.environ, "VLANG": "zh"}
D = json.loads(subprocess.run(["node", "-e", js, os.path.join(ROOT, "src", "js", "script.js")], capture_output=True, text=True, encoding="utf-8", env=env, check=True).stdout)
V = json.load(open(os.path.join(OUT, "voices.json"), encoding="utf-8"))
budget = 112.5 - D["fixed"]
os.makedirs(os.path.join(OUT, "kf"), exist_ok=True)
for f in (1, 2, 3):
    shutil.copy(os.path.join(ROOT, "shots", f"page__design_keyframes_html_f_{f}.png"), os.path.join(OUT, "kf", f"p{f}.png"))

e = html.escape
SCENE = {"open": "引子", "what": "文件里是什么", "how": "怎么变小", "cost": "丢了什么", "hist": "历史", "test": "五个版本做同一份卷子", "close": "名字与收尾"}
text = ""
table = ""
for sc in D["scenes"]:
    if not sc["cues"]:
        continue
    text += f'<h3>{SCENE[sc["id"]]}</h3><p>' + "".join(f'<span class="s"><sup>{c["id"]}</sup>{e(c["cap"])}{"" if c["cap"][-1] in "？！" else "。"}</span>' for c in sc["cues"]) + "</p>"
    for c in sc["cues"]:
        table += f'<tr><td class="m">{c["id"]}</td><td>{e(c["cap"])}</td><td class="r">{e(c["tts"])}</td></tr>'

voices = ""
for v in V["voices"]:
    need = v["speed"] * v["full"] / budget
    fit = "放得下" if v["full"] <= budget else f"要提到约 {need:.2f} 倍速"
    voices += f'''<div class="card"><div class="h"><b>{v["n"]}. {e(v["name"])}</b><span class="tag">{v["sex"]}</span></div>
<audio controls preload="none" src="voice-{v["n"]}.mp3"></audio>
<div class="meta">{v["speed"]} 倍速 · {v["rate"]} 字/秒 · 全稿约 {v["full"]:.0f} 秒（可用 {budget:.0f} 秒）· {fit}</div><code>{e(v["id"])}</code></div>'''

MUSIC = [
    ("a", "A 一档档变粗", "D 小调，电钢琴加拨弦。音色被真的量化：16 → 8 → 5 → 3 → 1.5 位，一段比一段粗，最后崩成噪声，然后干净的和弦回来。"),
    ("b", "B 刻度", "两台马林巴反复同一短句，一个 12 步，一个 16 步，错开又对齐。最有节拍感。"),
    ("c", "C 毛毡钢琴", "E 小调，半速的毛毡钢琴加低音弦，最安静，给旁白让路最多。"),
]
music = "".join(f'<div class="card"><div class="h"><b>{e(n)}</b></div><audio controls preload="none" src="music-{k}.mp3"></audio><div class="meta">{e(d)}</div></div>' for k, n, d in MUSIC)

KF = [
    (1, "开头：两个文件，一条 24 GB 的线"),
    (2, "中段：钻进文件，32 个真实的数换成 16 个值里最近的一个"),
    (3, "结尾：五个版本并排，体积和分数"),
]
kf = '<div class="grid">' + "".join(f'<a href="kf/p{f}.png" target="_blank"><img loading="lazy" src="kf/p{f}.png" alt="{e(n)}"><span class="meta">{e(n)}</span></a>' for f, n in KF) + "</div>"

page = f"""<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>量化 · 审片页</title>
<style>
:root{{--bg:#f7f6fb;--fg:#17181b;--dim:#5d616b;--line:#dfe0e4;--card:#fff;--acc:#6d28d9}}
@media (prefers-color-scheme:dark){{:root{{--bg:#131417;--fg:#ececef;--dim:#a2a6b1;--line:#2c2e35;--card:#1c1e23;--acc:#b79bff}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.75 system-ui,"Microsoft YaHei",sans-serif}}
main{{max-width:1120px;margin:0 auto;padding:40px 24px 90px}}h1{{font-size:30px;margin:0 0 4px}}h2{{font-size:22px;margin:48px 0 14px;padding-top:18px;border-top:1px solid var(--line)}}h3{{font-size:17px;margin:20px 0 6px}}
.meta{{color:var(--dim);font-size:14px}}.s sup{{color:var(--dim);font-size:11px;margin-right:2px;font-family:ui-monospace,monospace}}
.read p{{font-size:18px;margin:4px 0}}.card{{background:var(--card);border:1px solid var(--line);padding:14px 16px;margin:10px 0}}.h{{display:flex;gap:10px;align-items:center;margin-bottom:6px}}.tag{{font-size:12px;border:1px solid var(--line);padding:0 7px;color:var(--dim)}}
audio{{width:100%;height:38px}}code{{font-size:12px;color:var(--dim)}}.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}}.grid a{{text-decoration:none}}.grid img{{width:100%;display:block;border:1px solid var(--line)}}
@media (max-width:760px){{.grid{{grid-template-columns:1fr}}}}table{{width:100%;border-collapse:collapse;font-size:14px}}td{{border-bottom:1px solid var(--line);padding:5px 8px;vertical-align:top}}td.m{{font-family:ui-monospace,monospace;color:var(--dim);white-space:nowrap}}td.r{{color:var(--dim)}}
.ask{{background:var(--card);border-left:4px solid var(--acc);padding:12px 18px}}.ask li{{margin:3px 0}}details{{margin-top:14px}}summary{{cursor:pointer;color:var(--acc)}}
</style></head><body><main>
<h1>120 秒了解量化：让模型变小的方式和代价</h1><div class="meta">审片页 · 第二稿（重写）· 2026-11-10 · 片长 120 秒，仅中文</div>
<h2 style="border:0;margin-top:26px">需要你选的</h2>
<div class="ask"><ol><li><b>文案</b>：通过，或者给意见（按句号说就行）。确认之后才配全片。</li><li><b>配音</b>：5 选 1。</li><li><b>配乐</b>：A / B / C（上一轮的小样，没有重做）。</li><li><b>视觉</b>：紫色这一个方向行不行。</li></ol></div>

<h2>文案</h2><div class="read">{text}</div>
<p class="meta">全稿 {V["chars"]} 字（读法口径）。旁白可用约 {budget:.0f} 秒，其余是停顿和片尾名单。</p>
<details><summary>逐句表（含读法）</summary>{"<table>" + table + "</table>"}</details>

<h3>和上一稿比，改了什么</h3>
<ul>
<li><b>开头换成一件具体的事</b>：55 GB 的模型，24 GB 的显卡装不下；17 GB 的版本装得下，分数几乎一样。结尾回到这块显卡。</li>
<li><b>嘴上的名词减到最少</b>：模型名 Qwen3.8 27B 只上画面，不进旁白；「位」用「16 个 0 或 1」带出来；尺子、刻度、编号这些比方都去掉了，直接说「先定 16 个值，每个数换成最近的那个」。</li>
<li><b>名词混眼熟</b>：旁白只念 BF16、Q8、Q4、NVFP4 四个，放在结尾，接在五个版本的表后面；FP8、AWQ、GPTQ、MLX 等只铺在画面上。</li>
<li><b>分数说成数</b>：九成、八成五、一成；精确的 89.9%、90.4% 在画面上。「只多对了一道题」不进旁白。</li>
<li><b>删掉了速度那一句</b>（NVFP4 两倍半）：它是另一份测试、另一台机器，和主线岔开。想留的话可以只上画面。</li>
<li><b>说法的口径</b>：「8 位的、4 位的、1 位的」跟的是评测原文的叫法；1 位那个文件实际平均约 1.8 位，所以结尾说「大致」。讲机制用的是 Q4_0，分数表里 4 位的是 Q4_K_M，画面上标各自的真名。</li>
</ul>

<h2>配音（同一组代表句）</h2><p class="meta">这是试听，不是全片配音。请留意「量化」的「量」要读 liàng（第 4 句）。放不下的音色要提速或再删句。</p>{voices}

<h2>配乐小样（各 60 秒）</h2><p class="meta">上一轮做的三条，原样保留。我听不到声音，听感由你判断；都不合适就说想要的方向。</p>{music}

<h2>视觉（紫色，点开看大图）</h2><p class="meta">主对象是「文件」这根横条：开头两根，中段钻进去看里面的数，结尾五根并排。紫色是体积，白色是分数，黄色只给那条线和出问题的地方。图上的数字全部来自实验数据。</p>{kf}

<h2>自查记录</h2>
<ul class="meta"><li>事实：沿用 FACTS.md，逐句对过编号；这一稿没有新增事实。</li><li>文案：一轮独立审读（只看稿子，分外行观众和挑剔编辑两个身份），按意见改了 o3、b2、b4、b5、c2、历史段的衔接和结尾；AI 味评 3/10。记录在 review/NOTES.md。</li><li>长度：五个音色按 1.25 倍速实测都放得下，各场定点等选定音色后按实测重排。</li><li>关键帧：三张都看过，版面检查无问题。</li><li>没做的：配音与配乐没有人耳听过；画面只是静帧，没有动画。</li></ul>
</main></body></html>"""
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
print("写出", os.path.join("out", "audition", "index.html"))
