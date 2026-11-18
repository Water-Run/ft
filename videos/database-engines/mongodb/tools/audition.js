// 生成本地审片页 out/audition/index.html（out/ 不入库）。
// 第 3 轮（第 2 稿文案）：已选定的配音、配乐与视觉放在前面，第 2 稿全文、改动与对抗迭代记录、待定问题随后；第 1 轮的全部候选折叠留档。
// 文案直接读 src/js/script.js，与导出的校对稿同一来源。音频与关键帧沿用第 1、2 轮的产物（out/audition/ 下）。
// 用法：node videos/database-engines/mongodb/tools/audition.js
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..'), OUT = path.join(DIR, 'out', 'audition');
const S = require(path.join(DIR, 'src', 'js', 'script.js'));
const P = require(path.join(DIR, 'project.json'));
const N = require(path.join(__dirname, 'audition_notes.js'));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const term = (t) => esc(t).replace(/\*([^*]+)\*/g, '<b class="term">$1</b>');
const shaOf = (f) => f.slice(10, 74);
const drafts = fs.readdirSync(path.join(DIR, 'review')).filter((f) => /^script\.zh\.[0-9a-f]{64}\.md$/.test(f));
const sha = shaOf(drafts.find((f) => f.includes(N.draftSha)) || drafts[0] || '');
const L = S.layoutScript();

// 时长：一是工具的字数估算（与 script-review.js 导出同一口径）；二是按第 1 轮 Gentle_Senior（语速 1.15）试听样本实测语速校准：
// 样本 227 字（不计标点）合成 42.9 秒，约 5.29 字/秒，再加上稿里的停顿、章节卡与留白。配音以实测为准。
const RATE = 227 / 42.881;
const spoken = (c) => S.ttsText(c).replace(/[，。：；、？！\s「」]/g, '').length;
const calib = {}; let calibTotal = 0;
for (const sc of S.SCRIPT) {
  let t = (sc.lead || 0) + (sc.tail != null ? sc.tail : 0.6);
  for (const c of sc.cues) { const o = c[2] || {}; t += (o.pause != null ? o.pause : spoken(c) / RATE) + (o.gap != null ? o.gap : 0.3); }
  calib[sc.id] = t; calibTotal += t;
}
const mmss = (s) => `${Math.floor(s / 60)} 分 ${String(Math.round(s % 60)).padStart(2, '0')} 秒`;

const src = fs.readFileSync(path.join(DIR, 'src', 'js', 'script.js'), 'utf8'), refs = {};
for (const m of src.matchAll(/\['([a-z0-9]+)',[^\n]*?\/\/ ([^\n]+)/g)) refs[m[1]] = m[2].trim();

let script = '', toc = '';
for (const sc of S.SCRIPT) {
  const dur = L.scenes.find((x) => x.id === sc.id) || {};
  const name = sc.chap ? `${sc.chap[0]} ${sc.chap[1]}` : (sc.id === 'credits' ? '片尾' : '开场');
  toc += `<tr><td>${esc(name)}</td><td>${sc.chap ? esc(sc.chap[2]) : (sc.id === 'credits' ? '无旁白，名单只上画面' : '片名与 PART 6 只上画面')}</td><td class="num">${Math.round(calib[sc.id])}</td></tr>`;
  if (sc.id === 'credits') { script += `<section class="chap"><h3>片尾 <span class="q">无旁白：名单取自 project.json 的 credits，只上画面（约 8 秒）</span></h3></section>`; continue; }
  const head = sc.chap ? `${sc.chap[0]} ${esc(sc.chap[1])} <span class="q">${esc(sc.chap[2])}</span>` : '开场 <span class="q">片名与 PART 6 只上画面</span>';
  script += `<section class="chap" id="s-${sc.id}"><h3>${head}<span class="dur">约 ${Math.round(calib[sc.id])} 秒</span></h3><p class="flow">`;
  script += sc.cues.filter((c) => c[1]).map((c) => `<span class="cue" title="${c[0]}${refs[c[0]] ? ' · ' + esc(refs[c[0]]) : ''}"><sup>${c[0]}</sup>${term(c[1])}</span>`).join('');
  script += '</p></section>';
}

// 第 1 轮配音试听用的是第 1 稿的 13 句（稿本 79b77f7b），这里照录，与 v1–v5 的音频一致。
const SAMPLE_R1 = '一份文档，三个字段。_id 是一个编号，name 是 Alice，age 是 42。存进 MongoDB，它占 47 个字节。其中 13 个字节，是字段名自己。这个编号叫 RecordId，按写入的顺序一个一个往上加。Alice 是第 2050 个注册的，她的 RecordId 就是 2050。到了检查点，改过的那一页才写回文件。可它不写回原来的位置。整个叶页重新协调，写到文件末尾的新地方。为了一个字节，重写了 24 KB 的一整页。可那 100 毫秒呢？单机上缺省的写法，写进内存就确认，不等日志落盘。写完立刻强制结束，试 5 次，只留下 1 次。';
const voices = JSON.parse(fs.readFileSync(path.join(OUT, 'voices', 'voices.json'), 'utf8'));
const VNOTE = {
  'Chinese (Mandarin)_Gentle_Senior': '女声，温和、像学姐讲题；五个候选里读得最快',
  'Chinese (Mandarin)_Mature_Woman': '女声，成熟沉稳，节奏最慢',
  'male-qn-qingse-jingpin': '男声，年轻、干净（本集应为女声，不该进候选）',
  'Chinese (Mandarin)_Unrestrained_Young_Man': '男声，年轻、松弛（同上）',
  'Chinese (Mandarin)_Straightforward_Boy': '男声，直爽、偏少年（同上）',
};
const chosenVoice = voices.find((v) => v.voice === 'Chinese (Mandarin)_Gentle_Senior');
const voiceRows = voices.map((v, i) => `<div class="pick"><b>${i + 1}. <code>${esc(v.voice)}</code></b>${v === chosenVoice ? ' <span class="tag">已选</span>' : ''}<span class="meta">MiniMax speech-2.8-hd · 语速 ${v.speed} · ${v.seconds.toFixed(1)} 秒 · ${esc(VNOTE[v.voice] || '')}</span><audio controls preload="none" src="voices/${v.key}.mp3"></audio></div>`).join('');

const MUSIC = [
  ['A', '叶脉', '84 拍/分，F 大调（利底亚色彩）', '温暖的木槌拨奏在深沉渐变的铺底上分出枝杈：3+3+2 的不对称琶音。对应「树」。'],
  ['B', '日志脉搏', '104 拍/分，A 小调（多利亚色彩）', '低音脉冲与极轻的十六分嘀嗒，像日志每 100 毫秒落一次盘。'],
  ['C', '档案', '70 拍/分，C 小调', '低音区钢琴动机「C–G–A♭–G」像翻开一页旧档案，弦乐由暗渐亮；最高处弦乐把动机放宽成长音、大提琴低八度齐奏，随后收回钢琴独奏。对应「文档」与不覆盖的旧检查点。'],
];
const musicRows = MUSIC.map(([k, n, tempo, d]) => `<div class="pick"><b>${k}「${n}」</b>${k === 'C' ? ' <span class="tag">已选</span>' : ''}<span class="meta">${tempo} · 约 60 秒</span><p>${esc(d)}</p><audio controls preload="none" src="music-${k}.mp3"></audio></div>`).join('');

const VIS = [['A', '三棵树：跟着一份文档走'], ['B', '文件地图：看块怎样搬家'], ['C', '证据优先：回显与字节在前']];
const visRows = VIS.map(([k, n]) => `<div class="pick"><b>方向 ${k}：${esc(n)}</b><div class="frames">${[1, 2, 3].map((f) => `<figure><a href="keyframes/${k}${f}.png" target="_blank"><img src="keyframes/${k}${f}.png" alt="${k}${f}"></a><figcaption>${k}${f}</figcaption></figure>`).join('')}</div></div>`).join('');
const FUSED = ['标题：官网首页的版式，深色代码卡与 47 个字节', '查：树叠在文件带上，叶页连到它在文件里的那一块', '改：内存里的更新链，检查点把那一页写到文件末尾', '出错：日志落盘的时间轴与崩溃后的日志实物', '章节卡：文档页式的衬线大标题与左侧绿条'];
const fusedRows = FUSED.map((c, i) => `<figure><a href="keyframes/F${i + 1}.png" target="_blank"><img src="keyframes/F${i + 1}.png" alt="${esc(c)}"></a><figcaption>F${i + 1} · ${esc(c)}</figcaption></figure>`).join('');

const coverRows = N.covers.map(([k, n, d]) => `<div class="pick"><b>方向 ${k}：${esc(n)}</b><p>${d}</p><div class="cover"><a href="covers/${k}.png" target="_blank"><img src="covers/${k}.png" alt="封面 ${k}"></a><figure><img class="thumb" src="covers/${k}-360.png" alt="封面 ${k} 缩略图"><figcaption>缩到 360 像素宽时的样子</figcaption></figure></div></div>`).join('');
const list = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const iterRows = N.iterations.map((r) => `<tr><td>${esc(r.round)}</td><td>${esc(r.who)}</td><td>${r.found}</td><td>${r.fixed}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>MongoDB 审片页</title>
<style>
:root{--bg:#FDFFF5;--ink:#061621;--mute:#5C6C75;--line:#E4E8E0;--acc:#00684A;--hi:#00ED64;--card:#fff;--soft:#E3FCF7}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#001E2B;--ink:#E8EDEB;--mute:#889397;--line:#1C2D38;--acc:#71F6BA;--hi:#00ED64;--card:#112733;--soft:#023430}}
:root[data-theme="dark"]{--bg:#001E2B;--ink:#E8EDEB;--mute:#889397;--line:#1C2D38;--acc:#71F6BA;--hi:#00ED64;--card:#112733;--soft:#023430}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.8 "Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif}
main{max-width:1080px;margin:0 auto;padding:32px 16px 80px}h1{font:600 28px/1.35 "Noto Serif SC","Songti SC",serif;margin:0 0 6px;color:var(--acc)}
h2{scroll-margin-top:96px;font:600 22px/1.4 "Noto Serif SC","Songti SC",serif;margin:48px 0 12px;padding-top:14px;border-top:1px solid var(--line)}
h3{scroll-margin-top:96px;font-size:17px;margin:26px 0 6px}.q{color:var(--acc);font-weight:500;margin-left:8px}.dur{float:right;color:var(--mute);font-weight:400;font-size:13px}
.lede{color:var(--mute)}nav{position:sticky;top:0;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line);z-index:2}nav a{color:var(--acc);margin-right:14px;white-space:nowrap}
code{font-family:"JetBrains Mono",Consolas,monospace;font-size:.92em;overflow-wrap:anywhere}
.flow{margin:0}.cue sup{color:var(--mute);font-size:10px;margin:0 2px 0 6px;font-family:Consolas,monospace}.cue:hover{background:var(--soft)}
.term{color:var(--acc)}.pick{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:12px 0}
.meta{display:block;color:var(--mute);font-size:14px}.pick audio{width:100%;margin-top:8px}.tag{background:var(--hi);color:#001E2B;border-radius:4px;padding:0 6px;font-size:13px}
.frames{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.frames.five{grid-template-columns:repeat(2,1fr)}@media (max-width:760px){.frames,.frames.five{grid-template-columns:1fr}}
figure{margin:0}img{width:100%;height:auto;border-radius:6px;border:1px solid var(--line);display:block}figcaption{font-size:13px;color:var(--mute)}
table{border-collapse:collapse;width:100%;font-size:15px}td,th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{color:var(--mute);font-weight:500}.num{text-align:right;white-space:nowrap}
.scroll{overflow-x:auto}ol li,ul li{margin:6px 0}.note{font-size:14px;color:var(--mute)}
.chosen{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:760px){.chosen{grid-template-columns:1fr}}
.sample{background:var(--soft);border-radius:8px;padding:10px 14px;font-size:14px}
details{margin:12px 0}summary{cursor:pointer;color:var(--acc)}
textarea{width:100%;min-height:150px;font:14px/1.6 Consolas,monospace;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:10px}
button{background:var(--acc);color:var(--bg);border:0;border-radius:6px;padding:8px 16px;font-size:15px;cursor:pointer}
.cover{display:grid;grid-template-columns:1fr 360px;gap:14px;align-items:start}.cover .thumb{width:360px}@media (max-width:760px){.cover{grid-template-columns:1fr}.cover .thumb{width:100%;max-width:360px}}
.big{font-size:20px;font-weight:600;color:var(--acc)}
</style></head><body><main>
<h1>${esc(P.titles.zh)}</h1>
<p class="lede">数据库引擎系列 PART 6 · 审片页第 3 轮（第 2 稿最终版，${esc(N.date)}）。配音、配乐、视觉都已选定，放在最前面；这一轮要审的是重写后的文案（最终稿）与封面。</p>
<nav><a href="#chosen">已选定</a><a href="#covers">封面预选</a><a href="#changes">改了什么</a><a href="#iter">对抗迭代</a><a href="#script">全文</a><a href="#questions">待定问题</a><a href="#r1">第 1 轮留档</a><a href="#reply">回复</a></nav>

<h2 id="chosen">已选定的方案</h2>
<div class="chosen">
<div class="pick"><b>配音</b> <span class="tag">已选</span><span class="meta"><code>Chinese (Mandarin)_Gentle_Senior</code> · MiniMax speech-2.8-hd · 语速 1.15 · 女声（系列男女交替，本集女声）</span><audio controls preload="none" src="voices/${chosenVoice.key}.mp3"></audio><p class="note">试听念的是第 1 稿的 13 句，第 2 稿全片等文案确认后再配。</p></div>
<div class="pick"><b>配乐</b> <span class="tag">已选</span><span class="meta">C「档案」· 70 拍/分 · C 小调 · 约 60 秒小样</span><audio controls preload="none" src="music-C.mp3"></audio><p class="note">正式配乐按它写，段落挂在章节与句号上；小样只做过数值自检，没有人耳试听。</p></div>
</div>
<div class="pick"><b>视觉</b> <span class="tag">已选</span><span class="meta">参考 MongoDB 官方的浅色主题，B（文件地图）为主，结合 A（三棵树）与 C（真实字节与回显）</span>
<p class="note">底色、字色、细线取自 mongodb.com 首页（#FDFFF5、#061621、#E4E8E0），标题衬线、森林绿 #00684A；全片常驻的是按真实偏移画的集合文件带，树画在上方，每个叶页用虚线落到它在文件里的那一块；真实回显与字节放在官网式的深色代码卡里，只在要看实物时出现。亮绿 #00ED64 只给正在讲的那一样东西。第 2 稿新增的「03 落盘」一章正好落在文件带上：内存里的页一缩，落成文件里的一格。</p>
<div class="frames five">${fusedRows}</div></div>

<h2 id="covers">封面预选</h2>
<p class="note">${N.coverNote}</p>
${coverRows}

<h2 id="changes">第 2 稿改了什么</h2>
<p><span class="big">${mmss(calibTotal)}</span>　<span class="note">按第 1 轮 Gentle_Senior 试听样本的实测语速（约 ${RATE.toFixed(2)} 字/秒）加上停顿与章节卡推算；工具的字数估算为 ${Math.round(L.total)} 秒。配音后以实测为准。第 1 稿同口径约 ${esc(N.r1Minutes)}。</span></p>
${list(N.changes)}
<div class="scroll"><table><tr><th>章</th><th>章节卡上的问题</th><th class="num">秒</th></tr>${toc}</table></div>

<h2 id="iter">对抗迭代记录</h2>
<p class="note">每轮由互不知情的独立审读者读同一份稿：一位只拿 FACTS 逐句核事实，一位以第一次看的观众兼编辑的身份查认知负担、转场与 AI 腔；我逐条处理后再交下一轮。</p>
<div class="scroll"><table><tr><th>轮次</th><th>谁读</th><th>发现</th><th>怎样处理</th></tr>${iterRows}</table></div>

<h2 id="script">第 2 稿全文</h2>
<p class="note">稿本 <code>review/script.zh.${sha.slice(0, 8)}….md</code>，内容 SHA-256 <code>${sha}</code>。小号编号是句号，鼠标停在句子上可看它依据的 FACTS 编号；绿色字是术语，画面上会有注解。事实依据都在 <code>research/FACTS.md</code>（MongoDB 9.0.8 实测 + 源码 + 官方文档）；这一稿新用到的事实都补在它末尾的「补充取证（2026-11-17）」一节。</p>
${script}

<h2 id="questions">待定问题</h2>
<ol>${N.questions.map((q) => `<li>${q}</li>`).join('')}</ol>

<h2 id="r1">第 1 轮候选（已选定，留档）</h2>
<details><summary>配音 5 个候选</summary><div class="sample">${esc(SAMPLE_R1)}</div>${voiceRows}</details>
<details><summary>配乐 3 个方向</summary>${musicRows}</details>
<details><summary>视觉 3 个方向（第 1 轮）</summary>${visRows}</details>

<h2 id="reply">回复</h2>
<p class="note">写下对文案的意见（句号 + 问题 + 建议，例如「c8：整理这一步还要多讲一句」）和待定问题的回答，点按钮后把下面的文字复制回会话。没有意见、确认这一稿可以配音，也请直接写明。</p>
<textarea id="notes" placeholder="文案意见、待定问题的回答……"></textarea>
<p><button id="gen">生成回复</button></p>
<textarea id="out" readonly></textarea>
</main>
<script>
const KEY = 'mongodb-audition-r3';
try { const s = localStorage.getItem(KEY); if (s) document.getElementById('notes').value = s; } catch (e) {}
document.getElementById('notes').addEventListener('input', (e) => { try { localStorage.setItem(KEY, e.target.value); } catch (x) {} });
document.getElementById('gen').onclick = () => {
  document.getElementById('out').value = 'MongoDB 审片第 3 轮（第 2 稿 ${sha.slice(0, 8)}）\\n意见：\\n' + document.getElementById('notes').value;
  document.getElementById('out').select();
};
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('写好 ' + path.relative(process.cwd(), path.join(OUT, 'index.html')) + ' · ' + mmss(calibTotal) + '（校准）/ ' + Math.round(L.total) + ' 秒（字数估算）');
