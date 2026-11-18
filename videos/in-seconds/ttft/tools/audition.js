// 生成第二版审片页 out/audition/index.html。旁白始终读取 script.js；关键帧与封面由 src/design/keyframes.html、src/cover.html 经 look.js 截成 PNG 放在 out/audition/frames/；
// 配音小样 voice-v2.mp3 与实测 cal/durations.json 由 tools/voice_sample.py 生成；配乐小样 music-1.wav 由 tools/audition_audio.py 生成（已选 01）。
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const S = require(path.join(base, 'src/js/script.js'));
const { SCRIPT } = S;
const L = S.layoutScript({});
const out = path.join(base, 'out/audition');
fs.mkdirSync(out, { recursive: true });
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const star = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
let cal = {}; try { cal = JSON.parse(fs.readFileSync(path.join(out, 'cal/durations.json'), 'utf8')); } catch (e) { /* 没跑 voice_sample.py 时略过实测表 */ }
const mm = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const sc = Object.fromEntries(L.scenes.map((s) => [s.id, s]));
const img = (n, alt, cls = '') => `<img class="${cls}" src="frames/${n}.png" alt="${esc(alt)}" loading="lazy">`;

// ── 场景卡：每一场的画面方案 ──
const SCENES = [
  { id: 'open', name: '光标在等', q: '这是个什么现象，为什么重要？', main: '对话面板里的光标，与一个真的在走的读数', carry: '琥珀（光标、读数、第一段）从这里开始就是「首 Token 延迟」的颜色', frames: [['wait', '按下回车后：光标闪，读数实时走'], ['title', '片名卡：琥珀满铺，TTFT 落字']],
    beats: ['面板刷入，光标按拍闪；提问块「写一个判断质数的 Python 函数」从右滑入（旁白：向 LLM 提问之后）', '读数从 0.00 实时走到 2.00，到点琥珀第一段 def 取代光标，其后 is_、prime…… 一个接一个冒出来', '琥珀满铺一刷换成片名卡，TTFT 砸入；常驻元素变墨色'], mute: '关掉声音：提问 → 光标等待 → 第一个 Token 出现后代码一个接一个冒出来 → 片名。' },
  { id: 'define', name: '名字：首 Token 延迟 = TTFT', q: '名字是什么？', main: '同一批代码 Token 块：先排成回答，再原地换成「发出请求 → 第一段」的排法；最后 TTFT 四个字母展开成全称', carry: 'Token 块是全片的「数据」：实心方块；琥珀块 = 第一个', frames: [['tokens', '回答是一小段一小段写出来的（示意切分）'], ['bracket', '首 Token 延迟 = 发出请求到第一段之间；上方是展开后的全称'], ['ttft', 'TTFT 展开到一半：四个首字母留在原处，右边长出 ime / o / irst / oken']],
    beats: ['十几块代码 Token 依次到位；「prime」上方括号 + 注解「Token：一小段」', '换排法：首块 def 变琥珀落到右侧，其余退成 dim；左边出现「发出请求」竖线与闪烁的光标；琥珀括号括起空白', '「首 Token 延迟」落字；上方 T T F T 四个琥珀字母逐个出现，随后各自展开成 Time / To / First / Token（由时间纯函数驱动）', '展开后停留 1.5 秒以上，让观众读完全称'], mute: '关掉声音：回答被切成块；从发出请求到第一块之间的空白被琥珀括号括起，写着首 Token 延迟；四个字母长成「Time To First Token」。' },
  { id: 'write', name: '每次只写一个', q: '模型是怎么写回答的？', main: '一排 Token 列：6 个输入块 + 已写出的输出块，新块落下时，一个括号罩住前面所有块', carry: '这排列的几何（列距 156，y400）后面几场继续用', frames: [['write', '写每一个新 Token，都要参考前面所有的 Token']],
    beats: ['输入块（dim）依次亮起，标签「提问」', '输出块 def、is_、prime 逐个落下', '新块「(n」落下，paper 括号从左刷过所有前面的块，箭头指向新块'], mute: '关掉声音：一个新块出现时，一个括号罩住它前面的所有块。' },
  { id: 'prefill', name: '先读完整个输入；重复提问命中缓存', q: '为什么第一个最慢，之后却快？重复提问时缓存命中会怎样？', main: '同一排 Token 列 + 缓存格：6 个输入块同时亮起、缓存同时存满；第一块琥珀落下；之后每个新块只多一格；最后换成「第一次提问 / 再次提问」上下对照：再次提问时开头相同的部分命中缓存，琥珀括号变短', carry: '上一场的列原位不动；命中缓存一幕沿用同一套列与缓存格', frames: [['prefill', '输入同时处理，缓存存满；之后每个新 Token 只多一格'], ['reuse', '重复提问：第一次整段要读（括号长），再次提问时开头相同的部分命中缓存（括号短）']],
    beats: ['琥珀括号与「首 Token 延迟」在输入块上方出现', '6 个输入块在同一帧从 dim 变 paper（同时处理），下方 6 格缓存同时升起', '第一块琥珀落到括号右端，只多一格缓存；后面的块每 0.3 秒一块，各多一格；出处标明的一行：相邻 Token 间隔的目标 10–50 毫秒（旁白不讲）', '换到重复提问：上方是第一次提问（4 块代码文件 + 问题，括号长）；下方再次提问时，前 4 块和它们的缓存格直接在位（命中缓存），只读新增的 2 块，琥珀括号短得多；出处一行「命中要求开头完全一致；官方文档称通常改善，不保证」，不写命中率与数字'], mute: '关掉声音：一大批输入同时变亮、缓存一次存满，然后才出现琥珀第一块；重复提问一幕里，第二行前几块的缓存已经在，括号比第一行短得多。' },
  { id: 'length', name: '输入越长越晚', q: '什么会让第一个更晚？', main: '「读完输入」横条：一句话短，一整个代码文件长；琥珀第一块跟在横条后面', carry: '括号与琥珀块沿用', frames: [['length', '同样的问题，附上整个代码文件']],
    beats: ['第一行：短横条，琥珀块在 x600', '第二行：横条向右长到 1200 像素，琥珀块落在 x1440', '两行的后续输出块间隔相同'], mute: '关掉声音：横条越长，琥珀块越靠右。' },
  { id: 'scale', name: '多长算快', q: '主流是多长？', main: '对数刻度的尺度尺：0.1 到 1000 秒', carry: '琥珀块沿用：首 Token 延迟的颜色', frames: [['scale', '聊天一秒以内算快；长输入几秒（只在画面上）；深度思考几十秒以上']],
    beats: ['轴与标题；paper 括号「聊天：一秒以内算快」', '琥珀块 0.2–0.5 秒（调得好的部署）', 'dim 块：长输入几秒（旁白不讲）；深度思考 40–360 秒（榜单快照，含思考时间）；出处一行', '「继续生成」的长条从琥珀块后长出：这只是整段回答的开头'], mute: '关掉声音：同一把尺子上，琥珀块最左，几秒的块居中，深度思考的块远在右端。' },
  { id: 'close', name: '先读完，再一个接一个', q: '回到开头：为什么等？', main: '同一排 Token 列，回到开场的光标', carry: '光标与开场呼应', frames: [['close', '第一个慢，是因为要先读完整个输入']],
    beats: ['「首 Token 延迟」大字落下；输入块与琥珀括号在位', '「先读完整个输入」括号；光标在输出起点闪', '光标让位给琥珀第一块，后面的块一个接一个落下'], mute: '关掉声音：输入块被括起来，等待之后，输出一个接一个地出现。' },
];

const sceneCards = SCENES.map((s, i) => {
  const t = sc[s.id];
  const cues = SCRIPT.find((x) => x.id === s.id).cues.filter((c) => c[1]).map((c) => `<span><b>${esc(c[0])}</b>${star(c[1])}</span>`).join('');
  return `<article class="scene" id="s-${s.id}"><div class="scene-head"><span class="no">0${i + 1}</span><div><h3>${esc(s.name)}</h3><p class="when">${mm(t.start)}–${mm(t.end)} · ${(t.end - t.start).toFixed(1)} 秒 · 回答：${esc(s.q)}</p></div></div>
  <div class="frames n${s.frames.length}">${s.frames.map(([n, c]) => `<figure>${img(n, c)}<figcaption>${esc(c)}</figcaption></figure>`).join('')}</div>
  <div class="scene-body"><div><h4>主画面</h4><p>${esc(s.main)}</p><h4>带过去的东西</h4><p>${esc(s.carry)}</p><h4>${esc(s.mute.split('：')[0])}</h4><p>${esc(s.mute.split('：').slice(1).join('：'))}</p></div><div><h4>动作</h4><ol>${s.beats.map((b) => `<li>${esc(b)}</li>`).join('')}</ol></div><div><h4>这一场的旁白</h4><div class="cues">${cues}</div></div></div></article>`;
}).join('');

// ── 旁白：连贯阅读 + 逐句表（含预估时刻） ──
const chapName = { open: '开场', define: '名字', write: '模型怎么写', prefill: '为什么第一个慢；缓存', length: '输入越长越晚', scale: '多长算快', close: '收束' };
const prose = SCRIPT.filter((s) => s.id !== 'outro').map((scene) => `<section class="chapter"><div class="chapter-number">${esc(scene.id)}</div><div><h3>${chapName[scene.id]} <small>${mm(sc[scene.id].start)}–${mm(sc[scene.id].end)}</small></h3><p>${scene.cues.filter((c) => c[1]).map((c) => `<span title="${esc(c[0])}">${star(c[1])}${/[，。：；！？]$/.test(c[1]) ? '' : (c[2] && c[2].tts && /，$/.test(c[2].tts) ? '，' : '。')}</span>`).join('')}</p></div></section>`).join('');
const rows = L.order.map((id) => { const c = L.cues[id]; if (c.silent) return `<tr class="mute"><td>${id}</td><td>${mm(c.start)}</td><td colspan="3">${id === 'z1' ? '（片尾名单，无旁白）' : '（片名卡停留，无旁白）'}</td></tr>`; const m = cal[id]; return `<tr><td>${id}</td><td>${mm(c.start)}</td><td>${star(c.cap)}</td><td class="num">${c.d.toFixed(1)}</td><td class="num">${m ? m.d.toFixed(1) : ''}</td></tr>`; }).join('');
const calRows = Object.entries(cal).map(([id, m]) => `<tr><td>${id}</td><td>${esc(m.text)}</td><td class="num">${m.chars}</td><td class="num">${m.d.toFixed(2)}</td><td class="num">${L.cues[id].d.toFixed(2)}</td></tr>`).join('');
const totalChars = SCRIPT.flatMap((s) => s.cues).filter((c) => c[1]).reduce((n, c) => n + c[1].replace(/[，。：；、\s*]/g, '').length, 0);

// ── 时间条 ──
const bar = L.scenes.map((s) => `<div class="seg" style="flex:${(s.end - s.start).toFixed(2)}"><b>${esc({ open: '开场', define: '名字', write: '写法', prefill: '先读输入', length: '输入长', scale: '尺度', close: '收束', outro: '片尾' }[s.id])}</b><small>${(s.end - s.start).toFixed(1)}s</small></div>`).join('');

const css = `:root{--ink:#0b1210;--ink2:#16211d;--paper:#f4f2ea;--card:#fff;--line:#d9d6c9;--ac:#ffb000;--acd:#a86d00;--dim:#5d6b64;--mute:#8e9a94}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:#17211d;font:16px/1.7 'Microsoft YaHei','Noto Sans SC',sans-serif}a{color:#0d5a49}
header{background:var(--ink);color:#ece8dc;padding:44px max(5vw,20px) 40px}header .eyebrow{font:700 12px/1.4 Consolas,monospace;letter-spacing:.16em;color:var(--ac)}
.hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;align-items:center;max-width:1280px;margin:18px auto 0}.hero img{display:block;width:100%;height:auto}.hero .c43{max-width:320px;margin-top:14px}
h1{font-size:clamp(34px,5.5vw,64px);line-height:1.1;margin:10px 0 14px}header p{margin:0 0 10px;max-width:760px;color:#c9d3cd}.badge{display:inline-block;margin:10px 10px 0 0;padding:4px 12px;border:1px solid var(--ac);color:var(--ac);font-size:13px}
nav{position:sticky;top:0;z-index:5;display:flex;gap:20px;flex-wrap:wrap;padding:12px max(5vw,20px);background:#fff;border-bottom:1px solid var(--line)}nav a{font-weight:700;font-size:14px;text-decoration:none;color:#17211d}nav a:hover{color:var(--acd)}
main{max-width:1280px;margin:auto;padding:12px 20px 90px}section.blk{margin-top:54px}.intro{display:flex;justify-content:space-between;gap:24px;align-items:end;border-bottom:2px solid var(--ink);padding-bottom:12px;margin-bottom:18px}.intro h2{font-size:27px;margin:0}.intro p{margin:0;color:var(--dim);max-width:560px;font-size:14px}
.note{border-left:4px solid var(--ac);background:#fff;padding:14px 18px;margin:16px 0;color:#33433c}.note b{color:var(--ink)}
.cmp{width:100%;border-collapse:collapse;background:#fff;font-size:15px}.cmp th,.cmp td{border:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top}.cmp th{background:#ece8dc}.cmp td.num{font-family:Consolas,monospace;text-align:right;white-space:nowrap}.cmp tr.mute td{color:var(--mute)}
.spine{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}.spine div{background:#fff;border:1px solid var(--line);padding:16px 18px}.spine b{display:block;font:700 13px Consolas,monospace;color:var(--acd);margin-bottom:4px}.spine p{margin:0}
.strip{display:flex;gap:3px;margin:18px 0 4px}.seg{background:var(--ink);color:#ece8dc;padding:8px 8px 6px;min-width:0;overflow:hidden}.seg:nth-child(3),.seg:nth-child(4){background:#2d3f38}.seg:nth-child(8){background:#c78900;color:#0b1210}.seg b{display:block;font-size:14px;white-space:nowrap}.seg small{font:12px Consolas,monospace;color:var(--mute)}.seg:nth-child(8) small{color:#0b1210}
.chapter{display:grid;grid-template-columns:84px 1fr;gap:18px;padding:20px 0;border-bottom:1px solid var(--line)}.chapter-number{font:700 16px Consolas,monospace;color:var(--acd)}.chapter h3{margin:0 0 6px;font-size:18px}.chapter h3 small{font:13px Consolas,monospace;color:var(--dim);margin-left:8px}.chapter p{font-size:19px;line-height:2;margin:0;max-width:900px}em{font-style:normal;font-weight:700;border-bottom:3px solid var(--ac)}
.scene{background:#fff;border:1px solid var(--line);margin:22px 0;padding:22px}.scene-head{display:flex;gap:16px;align-items:baseline}.scene .no{font:700 30px Consolas,monospace;color:var(--acd)}.scene h3{margin:0;font-size:22px}.when{margin:0;color:var(--dim);font-size:14px}
.frames{display:grid;gap:12px;margin:14px 0}.frames.n1{grid-template-columns:minmax(0,1fr)}.frames.n2{grid-template-columns:repeat(2,minmax(0,1fr))}.frames.n3{grid-template-columns:repeat(3,minmax(0,1fr))}figure{margin:0}figure img,.hero img{background:var(--ink)}figure img{display:block;width:100%;height:auto}figcaption{font:13px Consolas,'Microsoft YaHei',monospace;color:var(--dim);padding:6px 0}
.scene-body{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:22px}.scene-body h4{margin:0 0 2px;font-size:13px;font-family:Consolas,monospace;letter-spacing:.06em;color:var(--acd)}.scene-body p,.scene-body ol{margin:0 0 12px;font-size:15px}.scene-body ol{padding-left:20px}
.cues{display:flex;flex-direction:column;gap:6px}.cues span{font-size:14px;background:#f0eee5;padding:3px 9px}.cues b{font:12px Consolas,monospace;color:var(--acd);margin-right:8px}
.audio-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.audio{background:#fff;border:1px solid var(--line);padding:16px}.audio strong{display:block;margin-bottom:6px}.audio small{display:block;color:var(--dim);margin-bottom:8px}audio{width:100%;height:38px}
.palette{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.sw{padding:12px 10px;font:12px/1.4 Consolas,monospace;min-height:92px;display:flex;flex-direction:column;justify-content:flex-end}.sw b{font-size:14px}
.lang{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.lang div{background:#fff;border:1px solid var(--line);padding:12px 14px;font-size:14px}.lang b{display:block;margin-bottom:4px}
.cover-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}.cover-grid>div>img{display:block;width:100%;height:auto}.thumb{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-top:12px}.thumb img{display:block;height:auto;max-width:100%}
.steps{counter-reset:s;list-style:none;padding:0;margin:0}.steps li{counter-increment:s;background:#fff;border:1px solid var(--line);margin:8px 0;padding:12px 16px 12px 58px;position:relative}.steps li::before{content:counter(s);position:absolute;left:16px;top:10px;font:700 22px Consolas,monospace;color:var(--acd)}.steps b{font-weight:700}
.decide li{margin:6px 0}code{font:14px Consolas,monospace;background:#ece8dc;padding:1px 5px}footer{margin-top:48px;color:var(--dim);font-size:13px}
@media(max-width:900px){.cmp{display:block;overflow-x:auto}.hero,.cover-grid,.audio-grid,.spine,.scene-body{grid-template-columns:1fr}.frames.n2,.frames.n3{grid-template-columns:1fr}.palette{grid-template-columns:repeat(3,1fr)}.lang{grid-template-columns:1fr 1fr}.chapter{grid-template-columns:1fr}.intro{display:block}.intro p{margin-top:6px}.seg small{display:none}}`;

const swatch = (n, hex, fg, use) => `<div class="sw" style="background:${hex};color:${fg}"><b>${n}</b>${hex}<br>${use}</div>`;
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>96 秒了解 TTFT · 审片页 第二版</title><style>${css}</style></head><body>
<header><div class="eyebrow">IN SECONDS / REVIEW 02 · 最终审片页（文案第三稿）</div><div class="hero"><div><h1>96 秒了解 TTFT</h1><p>首 Token 延迟：为什么第一个 Token 来得慢，之后却一个接一个。这一版把叙事改成大模型的工作方式，加入行业尺度与缓存，例子换成程序员的场景，并让 TTFT 展开成全称；附封面、画面计划与预览的实现计划。</p><p>已选定（策划者 2026-11-17）：配音 02 · Xiaoyi，配乐 01 · 脉冲，画面方向 01 · 沿一条时间线跟随请求。本版在这个方向上重新设计。</p><span class="badge">文案待确认</span><span class="badge">无全片配音 · 无正式场景</span><span class="badge">下一步：确认文案 → 预览 r1</span></div><div>${img('cover169', '封面 16:9')}${img('cover43', '封面 4:3', 'c43')}</div></div></header>
<nav><a href="#why">00 改了什么</a><a href="#story">01 叙事</a><a href="#script">02 文案</a><a href="#visual">03 画面计划</a><a href="#system">04 视觉系统</a><a href="#cover">05 封面</a><a href="#voice">06 配音</a><a href="#music">07 配乐</a><a href="#plan">08 预览实现计划</a><a href="#decide">09 待你决定</a></nav>
<main>
<section class="blk" id="why"><div class="intro"><h2>00 / 前几稿的问题与这一稿的改法</h2><p>策划者的意见：定义五个字就说清了，96 秒要讲大模型的原理；要有主流多长、多快算快；例子不要光合作用，用程序员的；这是实时场景的主要问题，提一嘴缓存；优化文案。</p></div>
<table class="cmp"><tr><th></th><th>初版 / 第二稿</th><th>本稿（文案第三稿，二次修订）</th></tr>
<tr><td>叙事</td><td>反复讲「它量什么、里面有网络和排队」，是定义的延伸，没有原理</td><td>核心问题：<b>为什么第一个 Token 来得慢，之后却一个接一个？</b>先说它是对话里体感延迟的主要来源；名字压在 define 一场，其余讲机制、缓存与尺度</td></tr>
<tr><td>原理</td><td>没有：模型是个黑盒</td><td>每次只写一个、每个都参考前面所有 → 先读完整个输入（同时处理，中间结果存进缓存）→ 之后每个新 Token 只在缓存上续一小步 → 重复提问时开头相同的部分会命中缓存、首 Token 延迟通常更短 → 输入越长第一个越晚</td></tr>
<tr><td>例子</td><td>光合作用（与观众无关的通用例子）</td><td>程序员的场景：「写一个判断质数的 Python 函数」，输出 <code>def</code>、<code>is_</code>、<code>prime</code>……；长输入是整个代码文件；命中缓存的是上次读过的代码文件</td></tr>
<tr><td>术语</td><td>TTFT 与首 Token 延迟混用</td><td>旁白统一说「首 Token 延迟」，d3 后面带「缩写 TTFT」，画面上 T T F T 四个字母展开成 Time To First Token</td></tr>
<tr><td>信息量</td><td>只有概念与虚构数字</td><td>尺度（聊天一秒以内算快、调得好 0.2–0.5 秒、长输入几秒、深度思考几十秒以上）、Token 间隔目标 10–50 毫秒、缓存复用的条件，全部有出处；长输入的「几秒」与间隔数字放在画面上，不占旁白</td></tr>
<tr><td>证据</td><td>NVIDIA NIM：提示越长 TTFT 越大；端到端 = TTFT + 生成时间</td><td>再加：NVIDIA 技术博客（预填充并行、自回归、KV 缓存）；ClickHouse 指南（2026-07；体感响应、尺度、前缀缓存）；Anthropic 与 OpenAI 的提示缓存文档；Artificial Analysis 方法与榜单。全部写进 FACTS，2026-11-18 阅读</td></tr></table></section>

<section class="blk" id="story"><div class="intro"><h2>01 / 叙事主线</h2><p>核心问题：为什么第一个 Token 来得慢，之后却一个接一个？听众：用过聊天式 AI、不了解推理系统的入门观众（例子偏程序员）。</p></div>
<div class="spine"><div><b>第一步 · 现象、名字与为什么重要</b><p>提问后光标闪一会儿，第一个字才出现，之后文字一个接一个冒出来。这段等待是对话里体感延迟的主要来源。它叫首 Token 延迟，缩写 TTFT：从发出请求到收到第一段有内容的输出。</p></div><div><b>第二步 · 原理与缓存</b><p>模型每次只写一个 Token，写每一个都要参考前面所有的 Token。所以写第一个之前，要先读完整个输入：输入的 Token 同时处理，中间结果存进缓存。之后每个新 Token 只在缓存上续一小步。重复提问时，开头相同的部分会命中缓存、不用重新读，首 Token 延迟通常更短。输入越长，第一个来得越晚。</p></div><div><b>第三步 · 尺度与边界</b><p>聊天里一秒以内算快，开着深度思考的要几十秒以上；它只量开头的等待，不说明整段回答写多久。</p></div></div>
<div class="strip">${bar}</div><p style="color:var(--dim);font-size:13px;margin:0">各场按 100 BPM 的小节线定点（2.4 秒一小节，全片 40 小节）。</p>
<div class="note"><b>新名词只有三个：</b>Token（d1，先说一小段一小段写出来，再起名）、首 Token 延迟（d3）、TTFT（d3，作为缩写，画面展开成全称）。「缓存」在旁白里出现：r2 讲存进缓存，r4、r5 各一句讲重复提问时的缓存命中及其对首 Token 延迟的影响；画面上带注解。顺序：现象与重要性 → 名字 → 写法 → 为什么第一个慢（含缓存命中）→ 输入越长越晚 → 尺度 → 回到开头。</div>
<div class="note"><b>刻意不讲：</b>缓存命中率、有效期、价格与各家 API 用法；推理架构（算力瓶颈、批处理）；具体厂商与模型的性能；服务端与客户端起点的差别；网络与排队（FACTS 与封面保留）。</div></section>

<section class="blk" id="script"><div class="intro"><h2>02 / 旁白全文（第三稿）</h2><p>先通读，再按句号给意见。共 ${L.order.filter((i) => !L.cues[i].silent).length} 句，约 ${totalChars} 字。末列为 Xiaoyi +6% 实测时长（${Object.keys(cal).length} 句有实测）。</p></div>${prose}
<div class="note"><b>请特别看这几处：</b>① o1 加了「向 LLM」（读作「L L M」）；o3 改为「这段等待，是对话里体感延迟的主要来源」：依据是 ClickHouse 指南「首 Token 延迟主导流式界面的体感响应」，限定在对话（对非交互的 agent 几乎不重要）。② r4、r5 讲重复提问时的缓存命中：重复提问时，开头相同的部分会命中缓存、不用重新读，首 Token 延迟「通常」更短；依据 Anthropic 文档「长文档的首 Token 延迟通常改善」，OpenAI 文档明确不保证每次更快，所以写「通常」，不写命中率与数字。③ r3「只在缓存上续一小步」是对缓存机制的概括（FACTS 已标明）。④ 尺度与间隔的数字是行业目标与榜单快照，不是实测，出处标在画面上。⑤ d1、d2 的连读与 d3「缩写 TTFT」的读法（「T T F T」）。⑥ 删去了「输入很长，几秒也属正常」与每个 Token 间隔几十毫秒的旁白（只在画面上），给缓存命中与 TTFT 展开腾时间。</div>
<h3 style="margin-top:26px">逐句表与时间预估</h3><table class="cmp"><tr><th>句号</th><th>预估起点</th><th>字幕</th><th>预估秒</th><th>实测秒</th></tr>${rows}</table>
<p style="color:var(--dim);font-size:13px">预估 = 0.55 秒 + 字数 / 5.2（用下表 10 句实测拟合，误差约 ±0.4 秒/句）。时间线已无超出（<code>layoutScript().problems</code> 为空）；估算余量 open 0.1、scale 0.7 秒，其余较宽（define 3.1 秒用来给 TTFT 展开动画留停留，prefill 2.5、close 2.1 秒）；片尾名单已按要求压到 3 秒。配音后仍可能要调停顿。</p>
<details><summary>10 句实测对比（Xiaoyi，+6%，口径同 tts.py：末词结束 + 0.12 秒）</summary><table class="cmp"><tr><th>句号</th><th>合成文本（读法）</th><th>字数</th><th>实测</th><th>预估</th></tr>${calRows}</table></details></section>

<section class="blk" id="visual"><div class="intro"><h2>03 / 画面计划：各场的主要部分</h2><p>关键帧都是 1920×1080 的真实页面截图（真字体、真样式），不是示意草图。下面每场写明主画面、动作、带到下一场的东西。</p></div>${sceneCards}
<article class="scene"><div class="scene-head"><span class="no">06</span><div><h3>片尾名单</h3><p class="when">${mm(sc.outro.start)}–${mm(sc.outro.end)} · ${(sc.outro.end - sc.outro.start).toFixed(1)} 秒 · 不配旁白（策划者要求压到 2–3 秒，名单整屏一次出现）</p></div></div><p>名单来自 <code>project.json</code> 的 <code>credits</code>（策划 WaterRun；模型：GPT-6.1-Terra 取证、首版文案；Claude Sonnet 5.5 文案第二稿、画面方案、封面与审片页）；<code>GPL-3.0-or-later</code> 与 <code>github.com/Water-Run/ft</code> 可见。GPT-6.1-Terra 的型号取自策划者在会话中的说法，尚待核实。</p></article></section>

<section class="blk" id="system"><div class="intro"><h2>04 / 视觉系统：光标与轨迹</h2><p>平涂；无阴影、渐变、圆角、模糊。字体：Sans SC（中文）、Inter（拉丁）、Mono（数字与读数）。</p></div>
<div class="palette">${swatch('ink', '#0B1210', '#ECE8DC', '底')}${swatch('ink2', '#16211D', '#ECE8DC', '面板、继续生成')}${swatch('paper', '#ECE8DC', '#0B1210', '正文、实心块')}${swatch('ac 琥珀', '#FFB000', '#0B1210', 'TTFT 相关')}${swatch('dim', '#8E9A94', '#0B1210', '次要文字、网络')}${swatch('line', '#2B3A34', '#ECE8DC', '仅网格线')}</div>
<p style="font-size:13px;color:var(--dim)">对比度（实测）：paper/ink 15.5，琥珀/ink 10.3，dim/ink 6.5，dim/ink2 5.7，ink/琥珀 10.3。琥珀不压在 paper 上，琥珀块上的字用 ink。</p>
<div class="lang"><div><b>琥珀</b>只给首 Token 延迟相关：光标、计时读数、第一个 Token、括号</div><div><b>实心方块</b>一个 Token：dim = 输入，paper = 已处理或已写出，琥珀 = 收到的第一个，ink2 = 还没写出</div><div><b>缓存格</b>每个 Token 的中间结果：输入每列一格、同时存满；之后每个新 Token 多一格</div><div><b>括号与横条</b>括号 = 被计入某指标的时间；横条 = 一段耗时（读完输入），长度随输入变化</div></div>
<div class="note"><b>与前几部区别（F21）：</b>起点模板是墨黑 + 纸色 + 朱红的「计时盘」与 120 拍秒针；本片换成墨绿黑 + 琥珀、100 拍，图形语言完全另起，起点的占位样式与封面已全部替换。</div>
<div class="note"><b>数字的来历：</b>光标等待的 2.00 秒、各块与横条的长短是人为设定的示例，画面带「示例」「示意」标记；尺度一场的数字来自 FACTS 的出处（ClickHouse 指南 2026-07，Artificial Analysis 榜单快照 2026-11-18），画面上标出处一行，是目标与快照，不是实测。「光合作用」只是示例对话。</div></section>

<section class="blk" id="cover"><div class="intro"><h2>05 / 封面</h2><p>16:9 与 4:3 两版，由 <code>src/cover.html</code> 生成；4:3 重新排布，不是裁切；底部约 15% 不放字。</p></div>
<div class="cover-grid"><div>${img('cover169', '封面 16:9')}<p style="font-size:14px;color:var(--dim)">16:9（1920×1080）。「TTFT」是纸色大字，后面跟一块琥珀光标；底部一条请求轨迹，琥珀括号括起的就是 TTFT。左上琥珀块写秒数。</p></div><div>${img('cover43', '封面 4:3')}<div class="thumb"><img src="frames/cover169.png" width="180" alt="360 像素宽缩略（半尺寸示意）"><img src="frames/cover169.png" width="360" alt="360 像素宽缩略"></div><p style="font-size:14px;color:var(--dim)">4:3（1600×1200）。下方两张是缩小后的 16:9（180 / 360 像素宽），主标题仍读得清。</p></div></div></section>

<section class="blk" id="voice"><div class="intro"><h2>06 / 配音</h2><p>已选 02 · <code>zh-CN-XiaoyiNeural</code>，Microsoft neural TTS，语速 +6%（沿用策划者选择）。这里用新稿的 10 句重新试听，尤其听读法。</p></div>
<div class="audio-grid"><div class="audio"><strong>新稿代表句 · 10 句连读</strong><small>${Object.keys(cal).join(' · ')}。每句之间插入 0.4 秒空白。这不是全片配音。</small><audio controls preload="none" src="voice-v2.mp3"></audio></div><div class="audio"><strong>读法与待听项</strong><small>TTFT → 「T T F T」；Token → 「托肯」（SAY 表）。请听：「TTFT」是否清晰逐字母；「托肯」是否可接受；「指标」「处理输入」的断句；「，」连读处是否自然。未经 ASR 回听，也未经人耳核对。</small></div></div></section>

<section class="blk" id="music"><div class="intro"><h2>07 / 配乐</h2><p>已选 01 · 脉冲 · 清晰节拍，100 BPM。正式配乐尚未写（<code>tools/music.py</code> 仍是起点占位），下面是小样与编排。</p></div>
<div class="audio-grid"><div class="audio"><strong>01 · 脉冲 · 清晰节拍（已选）</strong><small>100 BPM；约 60 秒小样，不是正式配乐</small><audio controls preload="none" src="music-1.wav"></audio></div><div class="audio"><strong>为什么选它适合本片</strong><small>一拍 0.6 秒，96 秒恰好 40 小节；每拍一声的滴答像计时器，片名与第一段到达落在小节线上；不是舞曲，不抢旁白。</small></div></div>
<table class="cmp" style="margin-top:14px"><tr><th>小节（时刻）</th><th>场</th><th>编排</th></tr><tr><td>0–4 · 0–12 秒</td><td>open</td><td>每拍一声很轻的滴答（像计时器）+ 极低的持续音；第 4 小节起每小节一个单音，悬着</td></tr><tr><td>5 · 12.0 秒</td><td>片名</td><td>满和弦 + 轻底鼓（与 thud 同拍），然后起拍</td></tr><tr><td>6–12 · 14.4–31.2</td><td>define</td><td>脉冲琶音（八分音符）+ 滴答，平稳；TTFT 展开那一拍加一个上行的短音</td></tr><tr><td>13–16 · 31.2–40.8</td><td>write</td><td>保持脉冲，每个新 Token 落下的重音落在拍上</td></tr><tr><td>17–25 · 40.8–62.4</td><td>prefill</td><td>读完输入那段铺一层缓慢上升的滤波；所有输入块同时亮起那一拍抬起；第一块琥珀落下处释放；重复提问换幕那一拍略收，第二次琥珀落下处（r5）再抬一次</td></tr><tr><td>26–29 · 62.4–72.0</td><td>length</td><td>低音走动，随横条变宽再拉长一拍，第二行琥珀块落下处落一个低音</td></tr><tr><td>30–34 · 72.0–84.0</td><td>scale</td><td>变疏，留脉冲与长音；每个新读数一个高音</td></tr><tr><td>35–38 · 84.0–93.0</td><td>close</td><td>落回主和弦；e2 的落点所在拍抬起；其后只留铺底 + 滴答，最后一小节滴答停在小节线上（计时停了）</td></tr><tr><td>38.75–40 · 93.0–96</td><td>片尾</td><td>主和弦铺底，最后 3 秒淡出，无滴答</td></tr></table></section>

<section class="blk" id="plan"><div class="intro"><h2>08 / Preview 的实现计划</h2><p>由 Haiku 接手以节省用量。施工图是 <code>src/design/scenes.md</code>（每场的元素坐标、动作落点、读数表、配乐编排），几何以 <code>src/design/keyframes.html</code> 为准。</p></div>
<ol class="steps">
<li><b>闸门 0（人）：文案确认。</b>校对者（WaterRun）明确确认当前稿本，写入 <code>review/NOTES.md</code> 与 <code>approval.json</code>。之前不配音、不铺场景，Haiku 先核对这一条，仍是 pending 就停下。</li>
<li><b>配音。</b><code>node kit/tools/tts.js videos/in-seconds/ttft</code> → <code>timing.zh.js</code>；看 <code>problems</code>，超出只调 gap / lead / tail；ASR 回听 + 对着多音字清单听。</li>
<li><b>配置与部件。</b><code>config.js</code>（100 BPM 拍子、右上读数 <code>METER(t)</code>、换场）、<code>parts.js</code>（<code>tokenCol</code>、<code>codeTok</code>、<code>cacheCell</code>、<code>brace</code>、<code>arrowUp</code>、<code>ttftLine</code>）、<code>style.css</code> 已完成。</li>
<li><b>有声代表段。</b>先做 prefill 一场（输入同时亮起、缓存同时升起、第一块琥珀落下、缓存复用），再做 define 的 TTFT 展开，用区间预演对旁白与动作；通过再铺开。</li>
<li><b>其余各场。</b>open → define → write → prefill → length → scale → close → credits；每场写完 <code>node --check</code>、<code>look.js</code> 对照 keyframes 帧、<code>scan.js</code>。</li>
<li><b>配乐与音效。</b>按本页 07 的编排重写 <code>tools/music.py</code>；音效按场景落点登记；<code>audio.js</code> 数值自检。</li>
<li><b>预览与自对抗审查。</b><code>sheets.js every 3</code> 通看，<code>check.js</code>，<code>preview.js --round r1</code>；按 <code>docs/process.md</code> 第 2 节审查，并在 NOTES 如实写没看、没听的范围。</li></ol>
<table class="cmp" style="margin-top:16px"><tr><th>风险</th><th>处理</th></tr><tr><td>旁白时长余量小（open 估算 0.1、scale 0.7 秒，估算偏保守）</td><td>只调 gap / lead / tail（不改含义，不需重新确认）；不够就停下报告，不删句</td></tr><tr><td>「同时亮起、同时存满」必须在同一帧发生</td><td>错开就讲成了「逐个处理」，规格第 7 节写明</td></tr><tr><td>命中缓存只用两句，不写数字</td><td>画面不写命中率、延迟减少的数字；出处一行标「命中要求开头完全一致；官方通常改善、不保证」，旁白说「通常」</td></tr><tr><td>TTFT 展开动画必须是时间的纯函数</td><td>用 <code>F()</code> 每帧由 t 算 k，不累加状态；帧 <code>ttft</code> 是 k=0.45 的参照</td></tr><tr><td>尺度一场的数字是目标与榜单快照</td><td>画面标出处，不点名模型或厂商，不写成实测</td></tr><tr><td>Token 读成「托肯」，显式 tts 的句子不走 SAY 表</td><td>d2、e1 的 tts 已处理；回听重点听</td></tr></table>
<div class="note"><b>刻意不在本轮做的：</b>全片配音、场景代码、正式配乐、预览视频。它们都要等文案确认，按规则不能先做。</div></section>

<section class="blk" id="decide"><div class="intro"><h2>09 / 请你决定</h2><p>直接回复「句号 + 问题 + 建议」即可；全部没问题就回复确认。</p></div>
<ol class="decide"><li><b>文案：</b>叙事主线（现象与重要性 → 名字 → 模型怎么写 → 为什么第一个慢、缓存 → 输入越长越晚 → 尺度）是否成立？确认哪一稿本（内容 SHA-256 见校对稿，文件 <code>review/script.zh.c4f55bb1…md</code>）。</li><li><b>待定句：</b>o3 对「主要问题」的说法（现为「对话里体感延迟的主要来源」）；r4、r5 对重复提问时缓存命中的两句是否够；「深度思考」是否改称「推理」；尺度一场的两个来源（厂商指南、榜单快照）是否采用；r3 的概括是否准确。</li><li><b>视觉：</b>墨绿黑 + 琥珀 与「光标与轨迹」是否接受；封面 16:9 / 4:3 是否通过。</li><li><b>署名：</b>GPT-6.1-Terra 型号请确认（目前只来自你的说法）。</li></ol>
<div class="note"><b>自查记录：</b>已做——文案时间线无超出（<code>layoutScript().problems</code> 为空）；字幕宽度全量计算，无超过 26 个字宽；12 句真实合成并测时长；11 帧关键帧与 2 张封面逐张看图、<code>look.js</code> 版面检查无问题；调色盘对比度实算；FACTS 逐句对照，机制、缓存、实时场景与尺度的每个说法都有出处与阅读日期；页面用无头 Chrome 查过 1280 与 390 宽度，无横向溢出、无坏图。<b>没做——</b>没有听过合成样音与配乐小样（读法、尤其是「托肯」「首 Token 延迟，缩写 T T F T」的听感未核对）；没有全片配音、场景代码与动态预览，运动中的构图、节奏与 TTFT 展开动画的观感未验证；尺度一场的来源（厂商指南、榜单快照）不是同行评审；没有在其他浏览器里看本页。</div></section>
<footer>审片页由 <code>tools/audition.js</code> 生成，旁白读取 <code>src/js/script.js</code>。生成物在 <code>out/audition/</code>，不入库。当前没有全片配音、正式场景或成片验收。</footer></main></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');
console.log('审片页：' + path.join(out, 'index.html'));
