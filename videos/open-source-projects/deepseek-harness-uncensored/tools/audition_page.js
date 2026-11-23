// 本地审片页：out/audition/index.html（不入库）。文案取自 src/js/script.js（唯一源稿），音色清单取自 out/audition/voice/voices.json。
// 用法：node tools/audition_page.js（在本片目录或仓库根运行都可以）
const fs = require('fs'), path = require('path');
const HERE = path.resolve(__dirname, '..');
const S = require(path.join(HERE, 'src', 'js', 'script.js'));
const L = S.layoutScript();
const V = JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'audition', 'voice', 'voices.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const NAMES = { open: '开场', box: '01 开箱即用', modes: '02 四种模式', default: '　缺省', security: '　网安', reverse: '　逆向', writing: '　写作', asides: '03 通用增强 · 旁问与随问', spend: '　余额与额度', memory: '　记忆', outro: '结尾', credits: '片尾名单（无旁白）' };
const flow = S.SCRIPT.filter((sc) => sc.id !== 'credits').map((sc) => {
  const sp = L.scenes.find((x) => x.id === sc.id);
  const txt = sc.cues.filter((c) => c[1]).map((c) => `<span title="${c[0]}">${esc(S.strip(c[1]))}</span>`).join('。') + '。';
  return `<h4>${NAMES[sc.id]} <small>${mmss(sp.start)} · 约 ${Math.round(sp.end - sp.start)} 秒</small></h4><p>${txt}</p>`;
}).join('');
const rows = S.SCRIPT.flatMap((sc) => sc.cues.map((c) => `<tr><td>${c[0]}</td><td>${c[1] ? esc(c[1]).replace(/\*(.+?)\*/g, '<b>$1</b>') : '<i>（无旁白，' + c[2].pause + ' 秒）</i>'}</td><td class="mu">${c[1] ? esc(S.ttsText(c)) : ''}</td></tr>`)).join('');
const PICK = 'Chinese (Mandarin)_Warm_Bestie';
const voices = V.voices.map((v) => `<div class="v${v.id === PICK ? ' pick' : ''}"><b>${v.n}</b><span class="g ${v.gender === '男' ? 'm' : 'f'}">${v.gender}</span><div><div>${esc(v.name)}</div><code>${esc(v.id)}</code></div>${v.ok ? `<audio controls preload="none" src="${v.file}"></audio><span class="mu">${v.d.toFixed(1)} 秒</span>` : '<span>不可用</span>'}</div>`).join('');
const MUSIC = [
  ['a.wav', 'A 深潜', '76 BPM，D 小调（Dm9 → B♭maj9 → Gm9 → A7sus）。宽阔的七声部锯齿铺底，滤波在半分钟里慢慢打开，带一点共振；高两个八度的正弦泛音层与带呼吸的空气噪声给出「空」的那一层。第 2 组和弦起，FM 玻璃钟动机走附点乒乓延迟，第 5–6 组上翻八度；第 9 小节起一记很轻的底鼓，侧链让铺底跟着呼吸。混响 7 秒，低频长、高频短。最暗、最安静，贴「黑化」与深色界面。'],
  ['b.wav', 'B 冰原', '92 BPM，F♯ 小调 / A 大调（F♯m9 → Dmaj9 → Amaj9 → E）。水晶般的 FM 拨奏八分音符琶音，附点延迟在左右之间来回；同一组铺底另削出一层「啊」元音的共振峰，像远处的人声。第 9–20 小节进半速的轻拍、远处的军鼓和十六分沙锤。最「空灵」、最透亮。'],
  ['c.wav', 'C 流明', '112 BPM，E 小调（Em9 → Cmaj9 → D6/9 → Bm7）。四分侧链呼吸的铺底，十六分 FM 琶音的滤波在 40 秒里逐渐打开，第 15 小节起后半拍上翻八度；第 9 小节进温暖的反拍次低音，第 11–24 小节进轻底鼓与镲，之后整体退回空间。节奏感最强，适合功能逐项点亮。'],
].map(([f, t, d]) => `<div class="mus"><h4>${t}</h4><audio controls preload="none" src="music/${f}"></audio><p>${d}</p></div>`).join('');
const DIRS0 = [
  ['A', '整机巡览', '全片是一扇全屏的 DSHU 窗口，镜头在窗口里推拉、平移，讲到哪里，聚焦框和一句短注就落在哪里；其余部分压暗。最贴近「虚拟页面展示」，观众始终知道自己在界面的哪个位置。缺点是画面变化靠镜头，节奏偏平。'],
  ['B', '拆件讲解', '窗口在 3D 透视里退到一侧，讲到的部件（旁问面板、额度卡片、模式菜单）被抽出来、正面放大，旁边配大号注解。比较、列举（六档额度、四种模式）最清楚，有发布会式的质感；代价是每个部件都要单独重画成大号版本。'],
  ['C', '模式换肤', '主题色驱动整个画面：标志在白黑分界线上翻转，四种模式各占一块自己颜色的场地，同一个窗口随模式换色；概念部分（旁问与随问能看到多少主线）用深色底的示意图。最强调「破甲」与「四种模式」，色彩冲击最大；界面细节要靠后续推近才能读清。'],
];
const DIRS = `<div class="dir"><h4>方向 A · 整机巡览（已选）</h4><p>开场：同一枚标志在原位「黑化」——浅底白标（DSH）被一道蓝线自上而下漫过，变成深底黑标白鲸（DSHU），角上贴「黑化版」，下方小字「非 DeepSeek 官方项目 · 源码基于 DeepSeek Harness 0.2.2-rc.5」。之后全片是一扇全屏窗口，镜头推近到讲的地方。</p><div class="keys">${[['A1-t0', 'o1 · DSH'], ['A1-t0.33', 'o2 · 黑化中'], ['A1-t1', 'o3–o6 · DSHU'], ['A2', '信息最密'], ['A3', '图解：模式菜单']].map(([k, l]) => `<a href="keys/${k}.png" target="_blank"><img src="keys/${k}.png"><span>${l}</span></a>`).join('')}</div></div>`;
const DIRS_OLD = DIRS0.map(([d, t, desc]) => `<div class="dir"><h4>方向 ${d} · ${t}</h4><p>${desc}</p><div class="keys">${[1, 2, 3].map((k) => `<a href="keys/${d}${k}.png" target="_blank"><img src="keys/${d}${k}.png"><span>${['标题', '信息最密', '图解'][k - 1]}</span></a>`).join('')}</div></div>`).join('');
const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>DSHU 审片页</title><style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#1f2329;--mu:#6b707a;--line:#e3e5ea;--blue:#2563EB}
body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.7 'Inter','Noto Sans SC','Microsoft YaHei',sans-serif}
main{max-width:1180px;margin:0 auto;padding:32px 24px 80px}h1{font-size:30px;margin:0 0 4px}h2{margin:48px 0 12px;font-size:22px;border-bottom:2px solid var(--tx);padding-bottom:6px}h4{margin:20px 0 6px}
small,.mu{color:var(--mu)}section.card,.dir,.mus{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 22px;margin:12px 0}
.q li{margin:6px 0}code{font:13px 'JetBrains Mono',monospace;background:#f0f1f4;padding:1px 5px;border-radius:4px}
.v{display:grid;grid-template-columns:28px 34px 1fr 320px 70px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.v audio{width:320px}
.g{font-size:13px;border-radius:6px;padding:1px 0;text-align:center;color:#fff}.g.m{background:#334155}.g.f{background:#9d174d}
.keys{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.keys a{color:var(--mu);text-decoration:none;font-size:14px}.keys img{width:100%;border-radius:8px;border:1px solid var(--line);display:block}
table{border-collapse:collapse;width:100%;font-size:14.5px}td{border-bottom:1px solid var(--line);padding:6px 8px;vertical-align:top}td:first-child{color:var(--mu);font-family:monospace;width:44px}
.flow p{margin:0 0 6px}.flow span:hover{background:#fff3c4}details summary{cursor:pointer;color:var(--blue)}
.mus audio{width:100%}.v.pick{background:#eef3fe;border-radius:8px}
</style></head><body><main>
<h1>DeepSeek Harness Uncensored：更自由的探索未至之境</h1>
<div class="mu">审片页 · 第 2 稿 · ${new Date().toISOString().slice(0, 10)} · 预估总长 ${mmss(L.total)}（未配音前的估算，按每秒 5.2 字；实际以配音后的实测为准，再用语速落进 5:00–5:59）</div>

<h2>已定</h2>
<section class="card q"><ul>
<li>标题与全片用「DeepSeek」；开场加「非 DeepSeek 官方项目」小字。</li>
<li>配音：<b>温暖闺蜜</b> <code>Chinese (Mandarin)_Warm_Bestie</code>。实测 1.0 倍时每秒 4.84 字，全片用 <b>1.1 倍</b>，按此推算总长约 5:36。</li>
<li>视觉：<b>方向 A</b>，标志原位变化，文案「黑化版」。</li>
<li>开场取你的原话，标语「更自由的探索未至之境」放在开头（o6）与结尾（f6）。</li>
<li>网安写作「安全审计和渗透测试」（s1，界面仿制里的模式说明同步）；结尾列四个平台（f2–f4）；b5、b6 讲 dsh-purge 与它的 MIT 版本。</li>
</ul></section>

<h2>这一轮要你看的</h2>
<section class="card q"><ol>
<li><b>配乐</b>：三段按「更有质感，电子，空灵」重做，选一个。</li>
<li><b>文案第 2 稿</b>：通读下方全文；没有意见请明确说「确认」，确认后合成全片配音、实现方向 A、出预览。</li>
<li><b>DSHU 仓库的 README</b>：「网络安全审计和攻击」在 DSHU 仓库里出现在 README 第 32、64 行（图片 alt 与正文）、使用手册第 81 行的标题，以及 <code>modes-overview</code>、模式说明的截图里，应用界面里大概率也有。要我去改 DSHU 仓库并推送，还是你自己改？只改 README 的话，截图和界面上还是原话。</li>
</ol></section>

<details><summary>第 1 稿的待定问题（都已处理，结果见「已定」）</summary><section class="card q"><ol>
<li><b>标题拼写</b>：你写的是「Deepseek」，项目 README 与上游都写「DeepSeek」。片中暂按「DeepSeek」。</li>
<li><b>「非官方」字样</b>：上游品牌规范要求不要让人误以为有官方背书。片中称原版为「官方 DeepSeek Harness」，DSHU 是「源码基于」它的项目；开场按你的要求用了原版标志做「黑化」对照。要不要在开场或片尾再加一行小字「非 DeepSeek 官方项目」？</li>
<li><b>Release 那一句</b>（f3「安装包在 GitHub 的 Release 页面」）：今天 Release 还都是 Draft，按你说的片子随 Release 一起发，这句保留；发布前我再核对一次。</li>
<li><b>网安的措辞</b>：「用于网络安全审计和攻击」是 README 原话，后面紧跟授权提醒（s7–s9）。保留原话，还是改成「审计与渗透测试」？</li>
<li><b>不深入的部分</b>：破甲只说「内置、开箱即用、不用找提示词改配置」，不解释原理；两个手册只报类数，不列名目。</li>
</ol></section></details>

<h2>配音候选</h2>
<section class="card"><div class="mu" style="margin-bottom:8px">speech-2.8-hd，语速 1.0（只比音色；正式配音会按实测总长微调语速）。代表句：<br>${esc(V.text)}</div>${voices}
<p class="mu">读法已用 Whisper 回听两段（1、6 号），英文专名、斜杠命令、DSHU 与版本号都读出来了。多音字请留意：缺省（shěng）、更新（gēng）与更自由（gèng）、长任务（cháng）、只读（zhǐ）、落到（luò）、文风卡（kǎ）。我听不到声音，音色的听感只能由你判断。</p></section>

<h2>配乐小样（第 2 版）</h2>${MUSIC}
<p class="mu">三段都由本片的配乐脚本合成（tools/music_demo.py，只用 numpy，没有采样素材）：滤波在 STFT 域按帧做，混响是按频率衰减、左右去相关的卷积，延迟每一跳更暗。自检做了：电平曲线（每段从约 −23 dB 起，高处约 −12 dB，再回落）、削波（无）、频段占比、左右相关性（0.37–0.50，避免单声道塌陷）、频谱图（<a href="music/spectro.png" target="_blank">spectro.png</a>，自上而下 A、B、C）。我没有听过，听感请你判断。</p>

<h2>视觉</h2>
<p class="mu">三个方向都是「虚拟页面」：界面按 DSHU 的截图在 HTML 里重画，不贴截图；主题色、侧栏色条、UNCENSORED 标签、余额卡都照原样。标志是同一条鲸鱼路径，白底深鲸（原版）与黑底白鲸（DSHU）之间可以连续过渡，开场做成「黑化」动画。仿制界面里的次要小字（输入框占位符等）在 1:1 下不到 22px，正式片里镜头推近后会放大。</p>
${DIRS}
<details><summary>第 1 稿的三个方向（存档）</summary>${DIRS_OLD}</details>

<h2>文案全文（第 2 稿）</h2>
<section class="card flow">${flow}</section>
<details><summary>逐句表（句号 · 字幕 · 送去合成的读法）</summary><table>${rows}</table></details>
</main></body></html>`;
fs.writeFileSync(path.join(HERE, 'out', 'audition', 'index.html'), html);
console.log('out/audition/index.html', mmss(L.total));
