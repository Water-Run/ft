import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "audition"
HASH = "a8f4112465a1f32a3b1b5e7705f3cc4f21024a40555c56f3cabc3f537e5eb6d7"
SCRIPT = ROOT / "review" / f"script.zh.{HASH}.md"


def esc(value):
    return html.escape(str(value), quote=True)


def load_chapters():
    text = SCRIPT.read_text(encoding="utf-8")
    match = re.search(r"## 连贯阅读\n(.*?)\n## 逐句校对", text, re.S)
    if not match:
        raise ValueError("找不到连贯阅读正文")
    chapters = []
    reading = "### " + match.group(1).split("### ", 1)[1]
    for block in re.split(r"\n(?=### )", reading.strip()):
        lines = block.strip().splitlines()
        title = lines[0].removeprefix("### ").split(" · ")[0]
        body = " ".join(line.strip() for line in lines[1:] if line.strip())
        body = body.replace("*", "")
        if not body:
            raise ValueError(f"章节 {title} 没有正文")
        chapters.append((title, body))
    if len(chapters) != 6:
        raise ValueError(f"应有 6 个旁白章节，实际为 {len(chapters)}")
    return chapters


def validate_assets(items):
    for item in items:
        path = OUT / item["file"]
        if not path.is_file() or path.stat().st_size == 0:
            raise FileNotFoundError(f"缺失或空音频：{path}")


def main():
    chapters = load_chapters()
    voices = json.loads((OUT / "voice-manifest.json").read_text(encoding="utf-8"))
    music = json.loads((OUT / "music-manifest.json").read_text(encoding="utf-8"))
    if len(voices) != 5 or len(music) != 3:
        raise ValueError("配音或配乐候选数量不符")
    validate_assets(voices)
    validate_assets(music)

    directions = [
        {
            "key": "A",
            "id": "dos",
            "name": "DOS 蓝屏 · RFC 文本模式",
            "description": "九十年代 PC 的文本模式：VGA 蓝底、灰字、亮黄与青，双线窗框和实心黑影，中文片名用点阵字。主画面直接用 IPv4 自己的原始材料——RFC 791 首页、3.1 节头部图的逐位刻度尺、IANA 的 256 个 /8 登记表。讲法是「摊开来拆」：地址在头部图里逐位展开、对比、查表。",
        },
        {
            "key": "B",
            "id": "desktop",
            "name": "九十年代桌面 · 窗口与对话框",
            "description": "九十年代图形桌面：青色桌面、银灰立体窗口、藏青标题栏，任务栏就是字幕带，秒尺是分格进度条。讲法是「在那台电脑上动手」：属性框里填地址、位视图里反白前 24 位、弹框给结论、路由表选中一行、地址池整理图全满。不用任何产品标志与产品名。",
        },
    ]
    frames = [("title", "开场 · 历史与片名（o3）"), ("dense", "地址与前缀（p3）"), ("diagram", "路由（r3）"), ("ending", "结尾 · 地址池见底与 IPv6（e4）")]
    for direction in directions:
        for frame, _ in frames:
            path = OUT / "images" / f"{direction['id']}-{frame}.png"
            if not path.is_file() or path.stat().st_size == 0:
                raise FileNotFoundError(f"缺失或空关键帧：{path}")

    chapter_html = "\n".join(
        f'''<article class="script-chapter" id="chapter-{esc(title)}">
<div class="chapter-index">{index:02d}</div>
<div><h3>{esc(title)}</h3><p>{esc(body)}</p></div>
</article>'''
        for index, (title, body) in enumerate(chapters, 1)
    )
    direction_html = ""
    for direction in directions:
        shots = "\n".join(
            f'''<figure>
<a href="images/{direction['id']}-{frame}.png" target="_blank" rel="noopener">
<img src="images/{direction['id']}-{frame}.png" width="1920" height="1080" alt="方向 {direction['key']}：{esc(label)}">
</a><figcaption><span>{esc(label)}</span><span>1920 × 1080</span></figcaption>
</figure>'''
            for frame, label in frames
        )
        direction_html += f'''<article class="direction" id="visual-{direction['key']}">
<header class="direction-heading"><div class="direction-letter">{direction['key']}</div><div><h3>{esc(direction['name'])}</h3><p>{esc(direction['description'])}</p></div></header>
<div class="frame-grid">{shots}</div>
</article>'''
    voice_html = "\n".join(
        f'''<article class="audio-card">
<div class="audio-number">{voice['index']:02d}</div>
<div class="audio-info"><h3>{esc(voice['display_name'])}</h3><p>{esc(voice['voice_id'])}</p><audio controls preload="none" src="{esc(voice['file'])}">浏览器不支持音频播放。</audio><div class="audio-meta"><span>{voice['duration_seconds']:.3f} 秒</span><span>edge-tts · {esc(voice['rate'])}</span></div></div>
</article>'''
        for voice in voices
    )
    music_html = "\n".join(
        f'''<article class="audio-card music-card">
<div class="audio-number">{index:02d}</div>
<div class="audio-info"><h3>{esc(track['name'])}</h3><p class="track-id">{esc(track['id'])}</p><audio controls preload="none" src="{esc(track['file'])}">浏览器不支持音频播放。</audio><p class="track-design">{esc(track['design'])}</p><div class="audio-meta"><span>{track['duration']:.1f} 秒</span><span>120 BPM · 48 kHz · 上一轮小样</span></div></div>
</article>'''
        for index, track in enumerate(music, 1)
    )

    page = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>100 秒速通 IPv4 · 本地审片台</title>
<style>
:root{--ink:#000000;--panel:#0000aa;--paper:#ffffff;--muted:#aaaaaa;--line:#5555ff;--accent:#ffff55;--green:#55ffff}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:92px}body{margin:0;background:var(--ink);color:var(--paper);font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;line-height:1.7;}a{color:inherit}button,input{font:inherit}.shell{width:min(1440px,calc(100% - 64px));margin:auto}.topbar{border-bottom:3px solid var(--muted);background:#aaaaaa;color:#000;position:sticky;top:0;z-index:5}.topbar-inner{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{font:700 15px/1.2 Consolas,monospace;letter-spacing:.12em}.brand b{background:#000;color:var(--accent);padding:2px 8px}nav{display:flex;gap:24px;flex-wrap:wrap}nav a{text-decoration:none;font-size:14px;color:#000}nav a:hover,nav a:focus{background:#000;color:#ffff55}.hero{padding:80px 0 56px;display:grid;grid-template-columns:1.5fr 1fr;gap:64px;align-items:end}.eyebrow{font:700 12px/1.4 Consolas,monospace;color:var(--accent);letter-spacing:.16em;text-transform:uppercase}.hero h1{font-size:clamp(48px,7vw,104px);line-height:.98;letter-spacing:-.055em;margin:20px 0 28px;max-width:900px}.hero h1 span{display:block;font:400 .29em/1.4 Consolas,monospace;letter-spacing:.03em;margin-top:24px;color:var(--muted)}.hero-intro{max-width:660px;color:var(--muted);font-size:16px}.status-card{border:6px double var(--paper);padding:26px;background:var(--panel);box-shadow:16px 16px 0 #333}.status-label{font:700 12px Consolas,monospace;color:var(--accent);letter-spacing:.1em}.status-card strong{display:block;font-size:28px;margin:10px 0 18px}.status-card dl{margin:0;font:12px/1.7 Consolas,monospace}.status-card dt{color:var(--muted);margin-top:10px}.status-card dd{margin:0;overflow-wrap:anywhere}.notice{border-left:6px solid var(--accent);padding:14px 20px;background:#111;color:var(--muted);font-size:14px;margin-bottom:24px}.changes{border:6px double var(--muted);background:var(--panel);padding:22px 28px;margin-bottom:64px}.changes h3{margin:0 0 10px;color:var(--accent);font:700 15px Consolas,monospace;letter-spacing:.08em}.changes ul{margin:0;padding-left:20px;font-size:15px;line-height:1.9}.changes b{color:var(--accent)}.notice b{color:var(--paper)}section{padding:54px 0 72px;border-top:1px solid var(--line)}.section-heading{display:grid;grid-template-columns:150px 1fr;gap:24px;margin-bottom:38px}.section-number{font:700 13px Consolas,monospace;color:var(--accent)}h2{font-size:36px;line-height:1.2;margin:0 0 12px;letter-spacing:-.02em}.section-heading p{margin:0;color:var(--muted);max-width:760px}.script-layout{display:grid;grid-template-columns:150px 1fr;gap:24px}.script-meta{font:12px/1.8 Consolas,monospace;color:var(--muted)}.script-meta span{display:block;color:var(--paper);font-size:26px}.script-chapters{border-top:1px solid var(--line)}.script-chapter{display:grid;grid-template-columns:50px 1fr;gap:20px;padding:24px 0;border-bottom:1px solid var(--line)}.chapter-index{font:14px Consolas,monospace;color:var(--accent);padding-top:4px}.script-chapter h3,.direction h3,.audio-card h3{margin:0 0 10px;font-size:18px}.script-chapter p{margin:0;font-size:17px;line-height:1.95;max-width:1020px}.direction{margin:0 0 60px}.direction:last-child{margin-bottom:0}.direction-heading{display:flex;gap:20px;align-items:flex-start;margin-bottom:24px}.direction-letter{width:58px;height:58px;flex:0 0 auto;display:grid;place-items:center;background:var(--accent);color:var(--ink);font:700 30px Consolas,monospace}.direction-heading p{margin:0;color:var(--muted);font-size:14px}.frame-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}figure{margin:0;border:1px solid var(--line);background:var(--panel)}figure a{display:block;overflow:hidden}img{display:block;width:100%;height:auto}figcaption{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;font:11px Consolas,monospace;color:var(--muted)}.audio-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.audio-card{border:1px solid var(--line);background:var(--panel);display:grid;grid-template-columns:58px 1fr;min-width:0}.audio-number{padding:20px 0;text-align:center;border-right:1px solid var(--line);font:700 24px Consolas,monospace;color:var(--accent)}.audio-info{padding:20px;min-width:0}.audio-info h3{margin-bottom:3px}.audio-info>p{font:12px Consolas,monospace;color:var(--muted);margin:0 0 15px;overflow-wrap:anywhere}audio{width:100%;height:36px;display:block}.audio-meta{display:flex;justify-content:space-between;gap:12px;margin-top:10px;font:11px Consolas,monospace;color:var(--muted)}.music-grid{grid-template-columns:1fr}.music-card{grid-template-columns:70px 1fr}.music-card .audio-info{display:grid;grid-template-columns:1fr 1.4fr;column-gap:28px}.music-card .audio-number{grid-row:1}.music-card h3,.music-card .track-id,.music-card audio,.music-card .audio-meta{grid-column:1}.music-card .track-design{grid-column:2;grid-row:1/5;font:14px/1.8 "Microsoft YaHei",sans-serif;margin:0;align-self:center}.selection{display:grid;grid-template-columns:1.2fr .8fr;gap:32px}.choice-group{border:1px solid var(--line);padding:24px;background:var(--panel)}.choice-group h3{margin:0 0 18px}.choices{display:grid;gap:12px}.choice{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:10px;cursor:pointer;font-size:14px}.choice:last-child{border-bottom:0;padding-bottom:0}.choice input{accent-color:var(--accent);width:17px;height:17px;flex:0 0 auto}.reply-box{border:6px double var(--ink);padding:24px;background:#aaaaaa;color:var(--ink);align-self:start;position:sticky;top:104px}.reply-box h3{margin:0 0 12px}.reply-box p{font-size:13px;color:#000}.reply-output{width:100%;min-height:120px;resize:vertical;background:var(--ink);color:var(--paper);border:0;padding:16px;font:14px/1.7 Consolas,monospace}.copy-button{width:100%;border:0;background:var(--accent);color:var(--ink);font-weight:700;padding:13px 18px;margin-top:12px;cursor:pointer}.copy-button:disabled{background:#b6b0a4;cursor:not-allowed}.copy-status{min-height:24px;font-size:12px;margin:10px 0 0}.reply-box .credit{margin-top:24px;padding-top:20px;border-top:2px solid #000;color:#000;font-size:13px}.reply-box .credit b{color:var(--ink)}footer{padding:30px 0 44px;border-top:1px solid var(--line);font:11px/1.8 Consolas,monospace;color:var(--muted);display:flex;justify-content:space-between;gap:24px}@media(max-width:900px){.shell{width:min(100% - 32px,1440px)}.topbar-inner{padding:16px 0;align-items:flex-start}.brand{white-space:nowrap}nav{gap:8px 16px;justify-content:flex-end}.hero{grid-template-columns:1fr;gap:32px;padding-top:52px}.section-heading,.script-layout{grid-template-columns:1fr}.frame-grid{grid-template-columns:1fr}.audio-grid{grid-template-columns:1fr}.selection{grid-template-columns:1fr}.reply-box{position:static}.music-card .audio-info{display:block}.music-card .track-design{margin-top:18px}.script-meta span{display:inline;margin-right:10px}}@media(max-width:560px){nav{display:none}.hero h1{font-size:48px}.shell{width:calc(100% - 24px)}.audio-card{grid-template-columns:42px 1fr}.audio-info{padding:16px}.audio-number{font-size:18px}.audio-meta{display:block}.audio-meta span{display:block}.music-card{grid-template-columns:42px 1fr}.script-chapter{grid-template-columns:32px 1fr;gap:10px}footer{display:block}.direction-letter{width:44px;height:44px;font-size:24px}}
</style>
</head>
<body>
<header class="topbar"><div class="shell topbar-inner"><div class="brand"><b>FT /</b> IPV4_REVIEW</div><nav aria-label="页内导航"><a href="#script">01 文案</a><a href="#visual">02 视觉</a><a href="#voice">03 配音</a><a href="#music">04 配乐</a><a href="#decision">05 反馈</a></nav></div></header>
<main class="shell">
<section class="hero"><div><div class="eyebrow">Local audition · r2 · 90s PC</div><h1>100 秒速通<br>IPv4<span>第 2 轮：九十年代电脑质感 · 开头历史 · 结尾引出 IPv6</span></h1><p class="hero-intro">这是一页离线审片台，不是成片。改后的完整文案、两组九十年代电脑风格的关键帧（各 4 张）、用新开头与结尾重配的五个配音候选、三条配乐小样集中在这里；点击图片可查看原始尺寸。</p></div><aside class="status-card"><div class="status-label">REVIEW STATUS</div><strong>待 WaterRun 确认</strong><dl><dt>文案内容 SHA-256</dt><dd>__HASH__</dd><dt>当前估算</dt><dd>不超 100 秒（字数估算）· 尚未全片配音实测</dd><dt>制作记录</dt><dd>第 1 轮 Kimi K3.1 Pro · 第 2 轮 Claude Opus 5.5</dd></dl></aside></section>
<div class="notice"><b>人工闸门仍在：</b>当前稿尚未确认；页面中的选择只供反馈，不会自动批准文案或启动全片制作。配音与配乐小样仅做技术核验，尚未完成人耳试听与读音确认。</div>
<div class="changes"><h3>本轮改了什么（2026-11-01）</h3><ul>
<li><b>开头带一小段历史：</b>一九八一年 IPv4 的规范（RFC 791）发布 → 一九八三年元旦阿帕网整网改用 TCP/IP → 「今天，数据怎样靠它找到正确的设备？」再进片名。</li>
<li><b>结尾由局限引出 IPv6：</b>接住「整个内网共用一个公网地址」——共用是因为 32 位只有约 43 亿个地址；私有地址和地址转换都是九十年代为省地址想的办法；二〇一一年总地址池见底；接班的 IPv6 把地址加长到 128 位；最后一句「找路的办法没变：地址、前缀、下一站」收回全片。</li>
<li><b>为腾出时间删掉的：</b>「数据包写着源地址和目的地址」改由画面（RFC 791 头部图 / 位视图）承担；原来的总结段由结尾最后一句代替；前缀、路由、特殊地址几句压短。100 秒总长与 7.5 秒片尾不变。</li>
<li><b>新增史实都有出处：</b>RFC 791/801/1631/1918/1883/8200/4291/4861、NRO 2011-02-03 公告与 IANA 登记表交叉印证，写进 research/FACTS.md；结尾的 256 格地址图由 research/lab/20_iana_pool.py 从 IANA 登记表算出。</li>
<li><b>画面与主题色：</b>上一轮黑底橙色的两组方向作废，换成两组九十年代电脑质感：A 是 DOS 蓝屏文本模式（VGA 蓝/灰/黄/青），B 是九十年代桌面窗口（青色桌面/银灰/藏青）。</li>
</ul></div>
<section id="script"><div class="section-heading"><div class="section-number">01 / SCRIPT</div><div><h2>连贯全文</h2><p>保留交审稿原文、顺序和标点；不含无旁白片尾。按字数估算各段都在定点内，最紧的是开头与前缀段（余量约 0.1 秒）；正式时长须等全片配音实测，溢出就继续删字。</p></div></div><div class="script-layout"><aside class="script-meta"><span>6</span>个旁白段<br><span>21</span>句<br><span>7.5s</span>无旁白片尾<br><br>203.0.113.80<br>为文档示例地址，<br>非真实服务器。</aside><div class="script-chapters">__CHAPTERS__</div></div></section>
<section id="visual"><div class="section-heading"><div class="section-number">02 / VISUAL</div><div><h2>两组九十年代电脑质感</h2><p>两组都取九十年代电脑的真实语汇与配色，差别在解释方法：A 把 IPv4 的原始文档摊开逐位拆，B 在那个年代的桌面上动手设置、弹框给结论。每组 4 张静帧：开场、地址与前缀、路由、结尾；尚未制作动画。底部是字幕带与 100 格秒尺，左上是剩余秒数，右上是全片都在走的「此刻的地址」读数。</p></div></div>__DIRECTIONS__</section>
<section id="voice"><div class="section-heading"><div class="section-number">03 / VOICE</div><div><h2>五个配音候选</h2><p>本轮重配：代表文本换成新稿的开头三句与结尾五句（年份、阿帕网、二〇一一、IPv6 的读法都在里面），同为 +6% 语速。按这段实测，云扬、云希放得进 100 秒；晓晓、云健偏慢，选它们要再删几个字。</p></div></div><div class="audio-grid">__VOICES__</div></section>
<section id="music"><div class="section-heading"><div class="section-number">04 / MUSIC</div><div><h2>三条配乐小样</h2><p>沿用上一轮的三条 60 秒、120 BPM 程序化方向稿，本轮未改。若想让声音也更像九十年代电脑（例如声卡 FM 合成或 tracker 音色），告诉我再出一组。</p></div></div><div class="audio-grid music-grid">__MUSIC__</div></section>
<section id="decision"><div class="section-heading"><div class="section-number">05 / DECISION</div><div><h2>你的四项反馈</h2><p>选择后生成一行回复，再复制发回对话。只有收到你的明确确认，才会更新文案审批状态。</p></div></div><div class="selection"><form id="review-form"><div class="choice-group"><h3>当前文案是否确认？</h3><div class="choices"><label class="choice"><input type="radio" name="approval" value="确认文案" required>确认当前全文（__SHORT_HASH__）</label><label class="choice"><input type="radio" name="approval" value="文案需修改">文案需修改，我会另附意见</label></div></div><div class="choice-group"><h3>视觉方向</h3><div class="choices"><label class="choice"><input type="radio" name="visual" value="A" required>A · DOS 蓝屏 · RFC 文本模式</label><label class="choice"><input type="radio" name="visual" value="B">B · 九十年代桌面 · 窗口与对话框</label></div></div><div class="choice-group"><h3>配音编号</h3><div class="choices">__VOICE_CHOICES__</div></div><div class="choice-group"><h3>配乐编号</h3><div class="choices">__MUSIC_CHOICES__</div></div></form><aside class="reply-box"><h3>复制反馈</h3><p>未选择的项目会保留为「待选」，不会替你预选。</p><textarea class="reply-output" id="reply" readonly aria-label="反馈文本">文案待确认；视觉待选；配音待选；配乐待选</textarea><button class="copy-button" id="copy" type="button">复制反馈</button><p class="copy-status" id="copy-status" aria-live="polite"></p><div class="credit">第 1 轮简报、取证、实验、初稿、配乐小样：<b>Kimi K3.1 Pro</b><br>第 2 轮文案修订、补证、关键帧、配音试听重配、审片页：<b>Claude Opus 5.5</b></div></aside></div></section>
</main>
<footer class="shell"><span>100 秒速通 IPv4 · 本地审片页 / 非成片</span><span>GPL-3.0-or-later · 无需网络 · 不提交选择</span></footer>
<script>
const form=document.querySelector('#review-form');const reply=document.querySelector('#reply');const status=document.querySelector('#copy-status');function selected(name,fallback){const input=form.querySelector(`input[name="${name}"]:checked`);return input?input.value:fallback}function updateReply(){const approval=selected('approval','文案待确认');const script=approval==='确认文案'?'确认文案 __SHORT_HASH__':approval;reply.value=`${script}；视觉 ${selected('visual','待选')}；配音 ${selected('voice','待选')}；配乐 ${selected('music','待选')}`}form.addEventListener('change',updateReply);document.querySelectorAll('audio').forEach(audio=>audio.addEventListener('play',()=>document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause()})));document.querySelector('#copy').addEventListener('click',async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(reply.value)}else{reply.focus();reply.select();if(!document.execCommand('copy'))throw new Error('copy unavailable')}status.textContent='已复制，请粘贴到对话中。'}catch(error){reply.focus();reply.select();status.textContent='请手动复制已选中的反馈文本。'}});
</script>
</body>
</html>'''
    page = page.replace("__HASH__", HASH)
    page = page.replace("__SHORT_HASH__", HASH[:8])
    page = page.replace("__CHAPTERS__", chapter_html)
    page = page.replace("__DIRECTIONS__", direction_html)
    page = page.replace("__VOICES__", voice_html)
    page = page.replace("__MUSIC__", music_html)
    page = page.replace("__VOICE_CHOICES__", "\n".join(
        f'<label class="choice"><input type="radio" name="voice" value="{voice["index"]}" required>{voice["index"]:02d} · {esc(voice["display_name"])}</label>'
        for voice in voices
    ))
    page = page.replace("__MUSIC_CHOICES__", "\n".join(
        f'<label class="choice"><input type="radio" name="music" value="{index}" required>{index:02d} · {esc(track["name"])}</label>'
        for index, track in enumerate(music, 1)
    ))
    target = OUT / "index.html"
    target.write_text(page, encoding="utf-8")
    print(f"已生成：{target}")
    print(f"正文 {len(chapters)} 段；关键帧 {len(directions) * len(frames)} 张；配音 {len(voices)} 个；配乐 {len(music)} 条")


if __name__ == "__main__":
    main()
