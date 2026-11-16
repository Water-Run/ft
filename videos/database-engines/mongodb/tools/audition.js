// 生成本地审片页 out/audition/index.html（out/ 不入库）：文案全文与待定问题、5 个配音候选、3 个配乐小样、3 个视觉方向的关键帧。
// 文案直接读 src/js/script.js，与导出的校对稿同一来源；关键帧由 look.js 截图后拷进 out/audition/keyframes/。
// 用法：node videos/database-engines/mongodb/tools/audition.js
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..'), OUT = path.join(DIR, 'out', 'audition');
const S = require(path.join(DIR, 'src', 'js', 'script.js'));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const term = (t) => esc(t).replace(/\*([^*]+)\*/g, '<b class="term">$1</b>');
const sha = (fs.readdirSync(path.join(DIR, 'review')).find((f) => /^script\.zh\.[0-9a-f]{64}\.md$/.test(f)) || '').slice(10, 74);
const L = S.layoutScript();

// 行尾注释里的 FACTS 编号
const src = fs.readFileSync(path.join(DIR, 'src', 'js', 'script.js'), 'utf8'), refs = {};
for (const m of src.matchAll(/\['([a-z0-9]+)',[^\n]*?\/\/ ([^\n]+)/g)) refs[m[1]] = m[2].trim();

let script = '';
for (const sc of S.SCRIPT) {
  if (sc.id === 'credits') { script += `<section class="chap"><h3>片尾 <span class="q">无旁白：名单取自 project.json 的 credits，只上画面（约 8 秒）</span></h3></section>`; continue; }
  const head = sc.chap ? `${sc.chap[0]} ${esc(sc.chap[1])} <span class="q">${esc(sc.chap[2])}</span>` : '开场 <span class="q">片名与 PART 6 只上画面</span>';
  const dur = (L.scenes.find((x) => x.id === sc.id) || {});
  script += `<section class="chap"><h3>${head}<span class="dur">约 ${Math.round(dur.end - dur.start)} 秒</span></h3><p class="flow">`;
  script += sc.cues.filter((c) => c[1]).map((c) => `<span class="cue" title="${c[0]}${refs[c[0]] ? ' · ' + esc(refs[c[0]]) : ''}"><sup>${c[0]}</sup>${term(c[1])}</span>`).join('');
  script += '</p></section>';
}

const voices = JSON.parse(fs.readFileSync(path.join(OUT, 'voices', 'voices.json'), 'utf8'));
const VNOTE = {
  'Chinese (Mandarin)_Gentle_Senior': '女声，温和、像学姐讲题；五个候选里读得最快',
  'Chinese (Mandarin)_Mature_Woman': '女声，成熟沉稳，节奏最慢',
  'male-qn-qingse-jingpin': '男声，年轻、干净',
  'Chinese (Mandarin)_Unrestrained_Young_Man': '男声，年轻、松弛',
  'Chinese (Mandarin)_Straightforward_Boy': '男声，直爽、偏少年',
};
const SAMPLE_IDS = ['o1', 'o2', 'o3', 'o4', 'b10', 'b11', 'd10', 'd11', 'd12', 'd13', 'g13', 'g14', 'g15'];   // 与 tools/voice_demo.js 相同
const capOf = {}; for (const sc of S.SCRIPT) for (const c of sc.cues) capOf[c[0]] = c[1];
const sample = SAMPLE_IDS.map((i) => S.strip(capOf[i])).join('。') + '。';
const voiceRows = voices.map((v, i) => `<div class="pick"><label><input type="radio" name="voice" value="${esc(v.voice)}"> <b>${i + 1}. <code>${esc(v.voice)}</code></b></label><span class="meta">MiniMax speech-2.8-hd · 语速 ${v.speed} · ${v.seconds.toFixed(1)} 秒 · ${esc(VNOTE[v.voice] || '')}</span><audio controls preload="none" src="voices/${v.key}.mp3"></audio></div>`).join('');

const music = JSON.parse(fs.readFileSync(path.join(OUT, 'music-demo.json'), 'utf8'));
const MUSIC = [
  ['A', '叶脉', '84 拍/分，F 大调（利底亚色彩）', '温暖的木槌拨奏在深沉渐变的铺底上分出枝杈：3+3+2 的不对称琶音，动机「C–F–G–A–G–C」上扬又回到主干；最高处铺底开亮，低音木槌与毡头鼓同走 3+3+2。对应「树」：三棵树、叶页、分出去的路径。'],
  ['B', '日志脉搏', '104 拍/分，A 小调（多利亚色彩）', '一只「提交的时钟」：低音脉冲由四分走到八分，极轻的十六分嘀嗒像日志落盘，玻璃钟动机「E–E–A–B / C–B–A–E」带附点八分回声；克制的纪录片电子感。对应「日志每 100 毫秒、检查点每 60 秒」。'],
  ['C', '档案', '70 拍/分，C 小调', '低音区钢琴动机「C–G–A♭–G」像翻开一页旧档案，弦乐由暗渐亮；最高处弦乐把动机放宽成长音、大提琴低八度齐奏、低沉大鼓每小节两记，随后收回钢琴独奏。对应「文档」与不覆盖的旧检查点。'],
];
const musicRows = MUSIC.map(([k, n, tempo, d]) => `<div class="pick"><label><input type="radio" name="music" value="${k} ${n}"> <b>${k}「${n}」</b></label><span class="meta">${tempo} · 约 60 秒 · 引子→推进→最高处→收束</span><p>${esc(d)}</p><audio controls preload="none" src="music-${k}.mp3"></audio></div>`).join('');

const VIS = [
  ['A', '三棵树：跟着一份文档走', '深常青底，亮绿只给 Alice 正在走的那条路。三棵树按实测画（集合 4 个叶页、_id 索引 3 个、姓名索引 15 个），找、改、删都在同一组树上推进。', ['标题', '查：从姓名索引回到集合树', '改：更新链与 Bob 的快照']],
  ['B', '文件地图：看块怎样搬家', '浅底，集合文件按真实偏移画成 4 KB 一格的带子，按时间往下排；日志与检查点画成时间轴。不覆盖写、空出与复用、100 毫秒窗口都是「位置」本身。', ['标题', '改与删：页搬到末尾、Dave 用上空出的位置', '出错：日志落盘与 kill -9']],
  ['C', '证据优先：回显与字节在前', '终端深底，mongosh 与 wt 的真实回显、Alice 的 47 个真实字节先上屏，图形做注解。', ['标题', '增：47 字节逐段', '出错：日志里一次插入写三棵树']],
];
fs.mkdirSync(path.join(OUT, 'keyframes'), { recursive: true });
const visRows = VIS.map(([k, n, d, caps]) => {
  const imgs = [1, 2, 3].map((f) => { const from = path.join(DIR, 'shots', `page__design_keyframes_html_d_${k}_f_${f}.png`), to = `keyframes/${k}${f}.png`; fs.copyFileSync(from, path.join(OUT, to)); return `<figure><a href="${to}" target="_blank"><img src="${to}" alt="${esc(caps[f - 1])}"></a><figcaption>${k}${f} · ${esc(caps[f - 1])}</figcaption></figure>`; }).join('');
  return `<div class="pick vis"><label><input type="radio" name="visual" value="${k} ${n}"> <b>方向 ${k}：${esc(n)}</b></label><p>${esc(d)}</p><div class="frames">${imgs}</div></div>`;
}).join('');

// 第 2 轮：策划者 2026-11-16 选定音色 Gentle_Senior、配乐 C、视觉「参考官方，浅色，B 为主结合 A、C」→ 融合方向关键帧
const FUSED = [['标题：官网首页的版式，深色代码卡与 47 个字节'], ['查：树叠在文件带上，叶页连到它在文件里的那一块'], ['改：内存里的更新链，检查点把那一页写到文件末尾'], ['出错：日志落盘的时间轴与崩溃后的日志实物'], ['章节卡：文档页式的衬线大标题与左侧绿条']];
const fusedRows = FUSED.map(([c], i) => { const f = i + 1, to = `keyframes/F${f}.png`; fs.copyFileSync(path.join(DIR, 'shots', `page__design_keyframes2_html_f_${f}.png`), path.join(OUT, to)); return `<figure><a href="${to}" target="_blank"><img src="${to}" alt="${esc(c)}"></a><figcaption>F${f} · ${esc(c)}</figcaption></figure>`; }).join('');
const QUESTIONS = [
  '时长：系列参照 11 分钟，本稿按往集语速预计 11–12 分钟（字数估算约 13 分钟），没有删减任何一问。要不要压？',
  'reconcile 的译名：稿里叫「协调」（b22 起），画面注解给英文与一句定义；也可以只说「整理成磁盘格式」不起名字。',
  '片尾查询：系列约定是 SELECT * FROM credits;。本集标题是「不是 SQL」，拟改用 mongosh 的 db.credits.find()，逐份文档列出分工。按约定照做，还是改？',
  '开场 o5 用 ClickHouse 做系列衔接（单集仍独立可懂），保留吗？',
  'g15「试 5 次，只留下 1 次」：同日两次完整重做分别是 0 次、1 次；稿里用入库回显的 1 次。也可以说「5 次里最多留下 1 次」。',
];

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>MongoDB 审片页</title>
<style>
:root{--bg:#F9FBFA;--ink:#001E2B;--mute:#5C6C75;--line:#E8EDEB;--acc:#00684A;--hi:#00ED64;--card:#fff;--term:#C0FAE6}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#001E2B;--ink:#E8EDEB;--mute:#889397;--line:#1C2D38;--acc:#71F6BA;--hi:#00ED64;--card:#112733;--term:#023430}}
:root[data-theme="dark"]{--bg:#001E2B;--ink:#E8EDEB;--mute:#889397;--line:#1C2D38;--acc:#71F6BA;--hi:#00ED64;--card:#112733;--term:#023430}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.75 "Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif}
main{max-width:1180px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;line-height:1.3;margin:0 0 6px}h2{font-size:22px;margin:48px 0 12px;padding-top:12px;border-top:2px solid var(--line)}
h3{font-size:17px;margin:22px 0 6px}.q{color:var(--acc);font-weight:500;margin-left:8px}.dur{float:right;color:var(--mute);font-weight:400;font-size:13px}
.lede{color:var(--mute)}nav a{color:var(--acc);margin-right:14px}code{font-family:"JetBrains Mono",Consolas,monospace;font-size:.92em}
.flow{margin:0}.cue sup{color:var(--mute);font-size:10px;margin:0 2px 0 6px;font-family:Consolas,monospace}.cue:hover{background:var(--term)}
.term{color:var(--acc)}.pick{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:12px 0}
.pick label{cursor:pointer}.meta{display:block;color:var(--mute);font-size:14px}.pick audio{width:100%;margin-top:8px}
.frames{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}@media (max-width:760px){.frames{grid-template-columns:1fr}}
figure{margin:0}img{width:100%;height:auto;border-radius:6px;border:1px solid var(--line);display:block}figcaption{font-size:13px;color:var(--mute)}
ol li{margin:6px 0}textarea{width:100%;min-height:150px;font:14px/1.6 Consolas,monospace;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:10px}
.note{font-size:14px;color:var(--mute)}button{background:var(--acc);color:var(--bg);border:0;border-radius:6px;padding:8px 16px;font-size:15px;cursor:pointer}
.sample{background:var(--term);border-radius:8px;padding:10px 14px;font-size:15px}
</style></head><body><main>
<h1>${esc(S.SCRIPT && require(path.join(DIR, 'project.json')).titles.zh)}</h1>
<p class="lede">数据库引擎系列 PART 6 · 审片页（第 1 稿；第 2 轮关键帧，2026-11-16）。在一处看完、一次选定：文案、配音、配乐、视觉方向。选好后点最后的「生成回复」，把文字贴回会话即可。</p>
<nav><a href="#round2">第 2 轮</a><a href="#script">文案</a><a href="#questions">待定问题</a><a href="#voice">配音</a><a href="#music">配乐</a><a href="#visual">视觉</a><a href="#reply">回复</a></nav>

<h2 id="round2">第 2 轮（2026-11-16）：已定的与新的关键帧</h2>
<p>已定：配音 <code>Chinese (Mandarin)_Gentle_Senior</code>（语速 1.15；本集按系列男女交替应为女声，第 1 轮混进男声候选是我的失误，这条已补进系列说明）；配乐 C「档案」；视觉按官方浅色主题、B 为主结合 A 与 C。</p>
<p class="note">融合方向：底色、字色、细线取自 mongodb.com 首页（暖白 #FDFFF5、近黑 #061621、细线 #E4E8E0），标题用衬线、森林绿 #00684A，代码块是文档页的浅灰细边样式；亮绿 #00ED64 只给正在讲的那一样东西。主对象是 B 的文件带（集合文件按真实偏移，4 KB 一格）；A 的树画在文件带上方，每个叶页用虚线落到它在文件里的那一块；C 的真实回显与字节放进官网式的深色代码卡，只在需要实物时出现。官网的衬线字体不能用，以 Noto Serif SC 代替。仍未定：文案与下面的 5 个待定问题。</p>
<div class="frames">${fusedRows}</div>

<h2 id="script">1. 文案（连贯全文）</h2>
<p class="note">稿本 <code>review/script.zh.${sha.slice(0, 8)}….md</code>，内容 SHA-256 <code>${sha}</code>。全部为新写的句子。小号编号是句号（如 b22），鼠标停在句子上可看它依据的 FACTS 编号；绿色字是术语，画面上会有注解。事实依据都在 <code>research/FACTS.md</code>（MongoDB 9.0.8 实测 + 源码 + 官方文档）。估算总长 ${Math.round(L.total)} 秒（按字数），按往集语速合成约 11–12 分钟。</p>
${script}

<h2 id="questions">2. 待定问题</h2>
<ol>${QUESTIONS.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>

<h2 id="voice">3. 配音候选（第 1 轮，已选 Gentle_Senior）</h2>
<p class="note">同一段代表句（开场 47 字节、RecordId 2050、检查点写新页、100 毫秒），避开本系列与近期各片用过的音色。Whisper 回听 5 段都没有漏词、英文没有被逐字母拼读；多音字（「协调」「重写」「还」等）回听查不出，我没有用耳朵听过，请以您的听感为准。这只是试听，全片配音等文案确认后再做。</p>
<div class="sample">${esc(sample.replace(/？。/g, '？').replace(/。/g, '。 '))}</div>
${voiceRows}

<h2 id="music">4. 配乐方向（第 1 轮，已选 C「档案」）</h2>
<p class="note">各约 60 秒，为本片新写（numpy 合成，<code>tools/music_demo.py</code>）。响度都约 −16 LUFS、无削波、引子到最高处逐段变响再收回；只做了数值自检，<b>没有人耳试听</b>。B 的十六分嘀嗒是有意的轻声「落盘」，若听起来像毛刺请指出。音色是合成的，C 的「弦乐」「钢琴」是替身。</p>
${musicRows}

<h2 id="visual">5. 视觉方向（第 1 轮，已选：B 为主结合 A、C，见页首）</h2>
<p class="note">三个方向比较的是解释方法，不只是配色。颜色取自 MongoDB 官网品牌色（#00ED64、#00684A、#023430、#001E2B）与官方设计系统 LeafyGreen；按系列约定不放产品标志。图上的数字全部取自实测。点图看原尺寸。制作方倾向：A 的三棵树做全片常驻主画面，第 04、05、07 章在树下加 B 的文件地图一层，C 的真实字节与回显只在第 02、07 章做特写。</p>
${visRows}

<h2 id="reply">6. 生成回复</h2>
<p class="note">选好上面三项，写下对文案的意见（句号 + 问题 + 建议，例如「b22：协调不好懂，直接说整理」），再点按钮，把下面的文字复制回会话。</p>
<textarea id="notes" placeholder="文案意见、待定问题的回答……"></textarea>
<p><button id="gen">生成回复</button></p>
<textarea id="out" readonly></textarea>
</main>
<script>
const KEY = 'mongodb-audition-r1';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ notes: document.getElementById('notes').value, picks: [...document.querySelectorAll('input:checked')].map((i) => i.name + '=' + i.value) })); } catch (e) {} };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) { document.getElementById('notes').value = s.notes || ''; for (const p of s.picks || []) { const [n, v] = p.split('='); const i = [...document.querySelectorAll('input[name="' + n + '"]')].find((x) => x.value === v); if (i) i.checked = true; } } } catch (e) {}
document.addEventListener('change', save); document.getElementById('notes').addEventListener('input', save);
document.getElementById('gen').onclick = () => {
  const v = (n) => (document.querySelector('input[name="' + n + '"]:checked') || {}).value || '（未选）';
  document.getElementById('out').value = 'MongoDB 审片（第 1 稿 ${sha.slice(0, 8)}）\\n音色：' + v('voice') + '\\n配乐：' + v('music') + '\\n视觉：' + v('visual') + '\\n意见：\\n' + document.getElementById('notes').value;
  document.getElementById('out').select();
};
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('写好 ' + path.relative(process.cwd(), path.join(OUT, 'index.html')));
