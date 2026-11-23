// 本地改稿页：out/rewrite/index.html（不入库）。策划者在页面里逐句改写文案，导出 JSON 交回制作方；制作方据此改 src/js/script.js（唯一源稿），核对 FACTS 后重新导出校对稿。
// 文案取自 src/js/script.js，事实取自 research/FACTS.md，当前稿本哈希取自 review/approval.json。页面不改任何源文件。
// 用法：node tools/rewrite_page.js（在本片目录或仓库根运行都可以）
const fs = require('fs'), path = require('path');
const HERE = path.resolve(__dirname, '..');
const S = require(path.join(HERE, 'src', 'js', 'script.js'));
const P = JSON.parse(fs.readFileSync(path.join(HERE, 'project.json'), 'utf8'));
const A = JSON.parse(fs.readFileSync(path.join(HERE, 'review', 'approval.json'), 'utf8'));
const FACTS_MD = fs.readFileSync(path.join(HERE, 'research', 'FACTS.md'), 'utf8');
const RAW = require(path.join(HERE, 'src', 'js', 'script.js')).SCRIPT;

const NAMES = { open: '开场', box: '01 开箱即用', modes: '02 四种模式', default: '缺省模式', security: '网安模式', reverse: '逆向模式', writing: '写作模式', asides: '03 通用增强 · 旁问与随问', spend: '余额与额度', memory: '记忆', outro: '结尾', credits: '片尾名单' };

// FACTS 表格：| F12 | s4、s5 | 陈述 | 出处 | 适用 | 核查 |；句号列里的 b1–b3 展开成 b1 b2 b3
const order = RAW.flatMap((sc) => sc.cues.map((c) => c[0]));
const expand = (spec) => {
  const out = [];
  for (const part of spec.split(/[、,，\s]+/).filter(Boolean)) {
    const m = part.match(/^([a-z]+\d+[a-z]?)[–-]([a-z]+\d+[a-z]?)$/);
    if (m && order.includes(m[1]) && order.includes(m[2])) { const i = order.indexOf(m[1]), j = order.indexOf(m[2]); out.push(...order.slice(i, j + 1)); }
    else if (order.includes(part)) out.push(part);
  }
  return out;
};
const facts = [];
for (const line of FACTS_MD.split(/\r?\n/)) {
  const m = line.match(/^\|\s*(F\d+[a-z]?)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/);
  if (!m) continue;
  facts.push({ id: m[1], where: m[2].trim(), text: m[3].trim(), src: m[4].trim(), scope: m[5].trim(), check: m[6].trim(), cues: expand(m[2]) });
}
const notIn = (() => { const i = FACTS_MD.indexOf('## 取证中发现、没有进入成片的事实'), j = FACTS_MD.indexOf('## 复核'); return i < 0 ? [] : FACTS_MD.slice(i, j < 0 ? undefined : j).split(/\r?\n/).filter((l) => l.startsWith('- ')).map((l) => l.slice(2)); })();

const SAY = [
  ['GPL-3\\.0-or-later', 'G P L 三点零或更新版本'], ['0\\.2\\.2-rc\\.5', '零点二点二 R C 五'], ['REA 6\\.9\\.0', 'R E A 六点九点零'],
  ['DSHU', 'D S H U'], ['\\bDSH\\b', 'D S H'], ['dsh-purge', 'D S H purge'], ['Windows x64', 'Windows x 六十四'], ['Linux x64', 'Linux x 六十四'],
  ['ARM64', 'ARM 六十四'], ['macOS', 'mac O S'], ['MIT', 'M I T'], ['\\/side', '斜杠 side'], ['\\/btw', '斜杠 B T W'], ['IDA', 'I D A'], ['5 小时', '五小时'],
];

const DATA = {
  title: P.titles.zh, base: A.languages.zh.content_sha256, duration: P.check.duration, capw: P.check.caption_width.zh, maxCue: P.check.max_cue_seconds,
  scenes: RAW.map((sc) => ({ id: sc.id, name: NAMES[sc.id] || sc.id, chap: sc.chap, lead: sc.lead || 0, tail: sc.tail == null ? 0.6 : sc.tail,
    cues: sc.cues.map(([id, text, o = {}]) => ({ id, text: text == null ? null : text, gap: o.gap == null ? 0.3 : o.gap, pause: o.pause == null ? null : o.pause, credits: !!o.credits })) })),
  facts, notIn, say: SAY,
};
const json = JSON.stringify(DATA).replace(/</g, '\\u003c');

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DSHU 改稿</title><style>
:root{--bg:#f5f6f8;--card:#fff;--tx:#1d2027;--mu:#6a707c;--line:#e2e5ea;--soft:#f0f2f5;--acc:#2563EB;--red:#c62828;--amb:#a15c00;--grn:#1e7b3a;--chg:#fff7e0;--new:#e9f5ec;--del:#fbeaea}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0f1115;--card:#171a21;--tx:#e6e8ec;--mu:#9097a3;--line:#2a2f3a;--soft:#1f232c;--acc:#6b9cff;--red:#ff7a7a;--amb:#f0b552;--grn:#6fd18a;--chg:#2b2615;--new:#16281c;--del:#2e1a1a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.65 'Inter','Noto Sans SC','Microsoft YaHei',sans-serif}
main{max-width:1100px;margin:0 auto;padding:20px 16px 120px}h1{font-size:24px;margin:8px 0 2px}h2{font-size:18px;margin:0}
.mu{color:var(--mu)}code{font:12.5px 'JetBrains Mono',Consolas,monospace;background:var(--soft);padding:1px 5px;border-radius:4px}
.bar{position:sticky;top:0;z-index:5;background:var(--card);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
.bar .stat b{font-size:17px}.bar .sp{flex:1}.ok{color:var(--grn)}.bad{color:var(--red)}.warn{color:var(--amb)}
button{font:inherit;font-size:13.5px;border:1px solid var(--line);background:var(--soft);color:var(--tx);border-radius:7px;padding:4px 10px;cursor:pointer}button:hover{border-color:var(--acc)}
button.pri{background:var(--acc);color:#fff;border-color:var(--acc)}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:14px 0}
details.card>summary{cursor:pointer;font-weight:600}
.scene-h{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline;margin-bottom:8px}.scene-h input{font:inherit;font-weight:600;width:9em;border:1px solid var(--line);border-radius:6px;padding:2px 6px;background:var(--soft);color:var(--tx)}
.cue{display:grid;grid-template-columns:52px 1fr auto;gap:4px 10px;padding:8px 6px;border-top:1px solid var(--line);border-radius:6px}
.cue.chg{background:var(--chg)}.cue.new{background:var(--new)}.cue.del{background:var(--del)}.cue.del textarea{text-decoration:line-through;opacity:.6}
.cid{font:13px Consolas,monospace;color:var(--mu);padding-top:6px}
textarea{width:100%;font:16px/1.55 'Noto Sans SC','Microsoft YaHei',sans-serif;border:1px solid var(--line);border-radius:7px;padding:5px 8px;background:var(--card);color:var(--tx);resize:vertical;min-height:36px}
textarea:focus,input:focus{outline:2px solid var(--acc);outline-offset:-1px}
.note{font-size:13.5px;min-height:30px;margin-top:4px;background:var(--soft)}
.meta{font-size:12.5px;color:var(--mu);display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px;align-items:center}
.orig{font-size:13px;color:var(--mu);margin-top:3px}.orig s{opacity:.8}
.ops{display:flex;flex-direction:column;gap:4px}.ops button{padding:2px 8px;font-size:12.5px}
.gap{width:4.2em;font:12.5px Consolas,monospace;border:1px solid var(--line);border-radius:5px;padding:1px 4px;background:var(--card);color:var(--tx)}
.chip{font:12px Consolas,monospace;border:1px solid var(--line);border-radius:10px;padding:0 7px;cursor:pointer;background:var(--soft)}.chip.on{border-color:var(--acc);color:var(--acc)}
.fact{font-size:13px;background:var(--soft);border-left:3px solid var(--acc);padding:6px 10px;margin-top:6px;border-radius:0 6px 6px 0}
.silent{grid-column:2/3;color:var(--mu);font-size:13.5px;padding-top:6px}
.read p{margin:4px 0 14px;font-size:16.5px;line-height:1.9}.read h4{margin:14px 0 0}
.read .c{border-bottom:1px dashed transparent}.read .c.chg{background:var(--chg)}.read .c.new{background:var(--new)}
ul.tight li{margin:3px 0}table{border-collapse:collapse;width:100%;font-size:13.5px}td{border-top:1px solid var(--line);padding:5px 6px;vertical-align:top}td:first-child{font-family:Consolas,monospace;white-space:nowrap}
.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--tx);color:var(--bg);padding:8px 16px;border-radius:8px;display:none;z-index:9}
@media (max-width:640px){.cue{grid-template-columns:1fr}.cid{padding:0}.ops{flex-direction:row;flex-wrap:wrap}}
</style></head><body>
<div class="bar" id="bar"></div>
<main>
<h1>DSHU 改稿</h1>
<div class="mu">${P.titles.zh.replace(/</g, '&lt;')} · 基于第 4 稿 <code>${A.languages.zh.content_sha256.slice(0, 12)}</code> · 改动自动存在本浏览器里</div>

<details class="card" open><summary>怎么用</summary><ul class="tight">
<li>每句一个输入框，直接改。灰字是第 4 稿原句；改过的句子标黄，新加的标绿，删掉的标红（可以恢复）。</li>
<li>一句话对应一条字幕：字宽上限 <b>${P.check.caption_width.zh}</b>（汉字算 1，字母数字符号算 0.5），单句上限 <b>${P.check.max_cue_seconds} 秒</b>。超了会标红，我配音前会拆句，你也可以自己用「下方加一句」拆。</li>
<li>时长按第 3 稿「温暖闺蜜」×1.1 的实测配音拟合估算（平均误差约 0.25 秒/句），含每场的前后留白与句间停顿。全片要落在 <b>5:00–5:59</b>。</li>
<li>「停」是这句说完到下一句的停顿秒数，一般不用动。<code>*词*</code> 标出术语，画面会在这句给注解；不需要可以去掉星号。</li>
<li>句子旁的 <code>F12</code> 是 FACTS 里支撑这句的事实，点开看原文。新写的内容超出 FACTS 的，我会补取证或回头跟你商量，不会凭印象放进片子。</li>
<li>每句和每场都有「备注」，写给制作方的话（为什么这么改、画面上想看到什么）放那里，不进文案。</li>
<li>改完点顶栏 <b>下载 JSON</b>，告诉我文件在哪；或者点 <b>复制文本</b> 直接贴回会话。</li>
</ul></details>

<details class="card"><summary>简报（README）：这片要回答什么、不讲什么</summary><ul class="tight">
<li>核心问题：DSHU 比官方 DeepSeek Harness 多了什么，值不值得装一个？</li>
<li>贯穿例子：同一个应用窗口——标志反相引出名字，新会话首页 → 模式菜单 → 四种模式各自的会话 → 旁问、随问、余额、额度、记忆。</li>
<li>开场：原版白底标志加上 Uncensored，翻成黑底；01 开箱即用：破甲内置、dsh-purge（MIT 版）、与官方版并存；02 四种模式：共用破甲、各带工具与手册、主题色、发出后锁定，网安附授权提醒；03 通用增强：旁问、随问、输入预测、余额、额度、对话费用、删除对话、记忆（简单提）；结尾：许可、平台、Release、标语。</li>
<li>不讲：破甲提示词与网安、逆向手册的具体内容；手册名目；目标保护、独立代理覆盖范围的细节；版本号；内部实现。</li>
<li>片尾名单只上画面，不配旁白。</li>
</ul></details>

<div id="scenes"></div>

<details class="card"><summary>FACTS 里的全部事实（可据此加句）</summary><table id="facts"></table>
<h4>取证中发现、没有进入成片的事实</h4><ul class="tight" id="notin"></ul></details>

<details class="card" id="readbox"><summary>连贯阅读（当前改稿，黄 = 改过，绿 = 新加）</summary><div class="read" id="read"></div></details>
</main>
<div class="toast" id="toast"></div>
<script>
const D = ${json};
const KEY = 'dshu-rewrite:' + D.base;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mmss = (t) => Math.floor(t / 60) + ':' + String(Math.round(t % 60)).padStart(2, '0');
const SAY = D.say.map(([a, b]) => [new RegExp(a, 'g'), b]);
const said = (s) => { s = s.replace(/\\*/g, ''); for (const [re, to] of SAY) s = s.replace(re, to); return s; };
// 第 3 稿实测拟合：0.358 + 0.157×汉字 + 0.113×字母（每个英文词最多计 6）+ 0.322×逗号顿号
const est = (s) => { const t = said(s); const cj = (t.match(/[\\u4e00-\\u9fff]/g) || []).length; const lc = (t.match(/[A-Za-z]+/g) || []).reduce((a, x) => a + Math.min(x.length, 6), 0); const pu = (t.match(/[，、：；,]/g) || []).length; const dg = (t.match(/[0-9]/g) || []).length; return 0.358 + 0.157 * (cj + dg) + 0.113 * lc + 0.322 * pu; };
const width = (s) => [...s.replace(/\\*/g, '')].reduce((a, ch) => a + (ch.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);
const FBY = {}; for (const f of D.facts) for (const c of f.cues) (FBY[c] = FBY[c] || []).push(f);
const FID = Object.fromEntries(D.facts.map((f) => [f.id, f]));

function fresh() {
  return { scenes: D.scenes.map((sc) => ({ id: sc.id, chapTitle: sc.chap ? sc.chap[1] : null, note: '', cues: sc.cues.map((c) => ({ ...c, orig: c.text, origGap: c.gap, origPause: c.pause, note: '', deleted: false, isNew: false })) })) };
}
let ST = null;
try { const s = localStorage.getItem(KEY); if (s) ST = JSON.parse(s); } catch (e) {}
if (!ST || !ST.scenes) ST = fresh();
let saveT = 0;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} };
const SC = (id) => D.scenes.find((s) => s.id === id);
const status = (c) => c.deleted ? 'del' : c.isNew ? 'new' : (c.text !== c.orig || c.gap !== c.origGap || c.pause !== c.origPause) ? 'chg' : '';

function newId(sc, after) {
  const ids = new Set(ST.scenes.flatMap((s) => s.cues.map((c) => c.id)));
  for (let i = 0; i < 26; i++) { const id = after + String.fromCharCode(97 + i); if (!ids.has(id)) return id; }
  let n = 1; while (ids.has(sc.id + '_n' + n)) n++; return sc.id + '_n' + n;
}

function totals() {
  let t = 0, per = {}, warn = 0, chg = 0, nw = 0, del = 0;
  for (const sc of ST.scenes) {
    const base = SC(sc.id), s0 = t; t += base.lead;
    for (const c of sc.cues) {
      const st = status(c); if (st === 'chg') chg++; if (st === 'new') nw++; if (st === 'del') { del++; continue; }
      if (c.pause != null) { t += c.pause + (c.gap || 0); continue; }
      const d = est(c.text || ''); t += d + (c.gap == null ? 0.3 : c.gap);
      if (d > D.maxCue || width(c.text || '') > D.capw || !(c.text || '').trim()) warn++;
    }
    t += base.tail; per[sc.id] = t - s0;
  }
  return { t, per, warn, chg, nw, del };
}
const T0 = (() => { const keep = ST; ST = fresh(); const r = totals(); ST = keep; return r.t; })();

function bar() {
  const r = totals(), [lo, hi] = D.duration, cls = r.t < lo || r.t > hi ? 'bad' : 'ok';
  document.getElementById('bar').innerHTML =
    '<span class="stat">估算 <b class="' + cls + '">' + mmss(r.t) + '</b> <span class="mu">/ 5:00–5:59 · 第 4 稿 ' + mmss(T0) + '</span></span>' +
    '<span class="stat">改 <b>' + r.chg + '</b> · 加 <b>' + r.nw + '</b> · 删 <b>' + r.del + '</b></span>' +
    '<span class="stat ' + (r.warn ? 'warn' : 'mu') + '">' + (r.warn ? r.warn + ' 句超长或为空' : '没有超长句') + '</span><span class="sp"></span>' +
    '<button onclick="readView()">连贯阅读</button><button onclick="copyText()">复制文本</button><button class="pri" onclick="download()">下载 JSON</button><button onclick="resetAll()">全部重置</button>';
  for (const sc of ST.scenes) { const el = document.getElementById('dur-' + sc.id); if (el) el.textContent = '约 ' + Math.round(r.per[sc.id]) + ' 秒'; }
}

function cueMeta(c) {
  if (c.pause != null) return '';
  const d = est(c.text || ''), w = width(c.text || '');
  const fs = (FBY[c.id] || []).map((f) => '<span class="chip" data-f="' + f.id + '" onclick="toggleFact(this)">' + f.id + '</span>').join(' ');
  return '<span class="' + (d > D.maxCue ? 'bad' : '') + '">估 ' + d.toFixed(1) + ' 秒</span><span class="' + (w > D.capw ? 'bad' : '') + '">字宽 ' + w + '/' + D.capw + '</span>' +
    '<span>停 <input class="gap" type="number" step="0.1" min="0" value="' + c.gap + '" data-k="gap"></span>' + (fs ? '<span>' + fs + '</span>' : (c.isNew ? '<span class="warn">新句：说明依据或我来补取证</span>' : ''));
}
function cueHTML(sc, c, i) {
  const st = status(c);
  if (c.pause != null) {
    return '<div class="cue ' + st + '" data-s="' + sc.id + '" data-i="' + i + '"><div class="cid">' + esc(c.id) + '</div><div class="silent">' + (c.credits ? '片尾名单，只上画面，' + c.pause + ' 秒' : '无旁白停顿 <input class="gap" type="number" step="0.1" min="0" value="' + c.pause + '" data-k="pause"> 秒（画面停留）') + '</div><div></div></div>';
  }
  const orig = st === 'chg' && c.text !== c.orig ? '<div class="orig">原：' + esc(c.orig) + '</div>' : st === 'del' ? '<div class="orig">已删除</div>' : '';
  return '<div class="cue ' + st + '" data-s="' + sc.id + '" data-i="' + i + '"><div class="cid">' + esc(c.id) + '</div><div>' +
    '<textarea rows="1" data-k="text"' + (c.deleted ? ' disabled' : '') + '>' + esc(c.text || '') + '</textarea>' + orig +
    '<div class="meta">' + cueMeta(c) + '</div><div class="facts"></div>' +
    '<textarea class="note" rows="1" placeholder="备注（不进文案）" data-k="note"' + (c.note ? '' : ' style="display:none"') + '>' + esc(c.note) + '</textarea></div>' +
    '<div class="ops"><button onclick="addAfter(this)">下方加一句</button><button onclick="toggleDel(this)">' + (c.deleted ? '恢复' : '删除') + '</button>' +
    (st === 'chg' ? '<button onclick="revert(this)">还原</button>' : '') + '<button onclick="showNote(this)">备注</button></div></div>';
}
function sceneHTML(sc) {
  const base = SC(sc.id);
  const chap = base.chap ? '<span>章节卡 <code>' + base.chap[0] + '</code> <input data-chap="' + sc.id + '" value="' + esc(sc.chapTitle) + '"></span>' : '';
  return '<section class="card" id="sc-' + sc.id + '"><div class="scene-h"><h2>' + esc(base.name) + '</h2>' + chap + '<span class="mu" id="dur-' + sc.id + '"></span></div>' +
    '<div class="list">' + sc.cues.map((c, i) => cueHTML(sc, c, i)).join('') + '</div>' +
    '<textarea class="note" rows="1" placeholder="这一场的备注（不进文案）" data-scnote="' + sc.id + '">' + esc(sc.note) + '</textarea></section>';
}
function renderScene(id) {
  const sc = ST.scenes.find((s) => s.id === id), el = document.getElementById('sc-' + id);
  el.outerHTML = sceneHTML(sc); fit(document.getElementById('sc-' + id)); bar(); save();
}
function renderAll() { document.getElementById('scenes').innerHTML = ST.scenes.map(sceneHTML).join(''); fit(document); bar(); }
const fit = (root) => root.querySelectorAll('textarea').forEach((t) => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; });
const where = (el) => { const row = el.closest('.cue'); const sc = ST.scenes.find((s) => s.id === row.dataset.s); return { row, sc, c: sc.cues[+row.dataset.i], i: +row.dataset.i }; };

document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.chap) { ST.scenes.find((s) => s.id === t.dataset.chap).chapTitle = t.value; save(); return; }
  if (t.dataset.scnote) { ST.scenes.find((s) => s.id === t.dataset.scnote).note = t.value; fit(t.parentNode); save(); return; }
  const k = t.dataset.k; if (!k) return;
  const { row, c } = where(t);
  if (k === 'text') c.text = t.value.replace(/\\n/g, '');
  else if (k === 'note') c.note = t.value;
  else if (k === 'gap') c.gap = t.value === '' ? 0.3 : +t.value;
  else if (k === 'pause') c.pause = t.value === '' ? c.origPause : +t.value;
  if (t.tagName === 'TEXTAREA') { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  if (k === 'text' || k === 'gap' || k === 'pause') {
    const st = status(c); row.className = 'cue ' + st;
    if (k === 'text') { const meta = row.querySelector('.meta'); const keepGap = meta.querySelector('.gap'); meta.innerHTML = cueMeta(c);
      let o = row.querySelector('.orig'); const want = st === 'chg' && c.text !== c.orig;
      if (want && !o) { o = document.createElement('div'); o.className = 'orig'; t.after(o); } if (o) { if (want) o.textContent = '原：' + c.orig; else o.remove(); } }
    bar();
  }
  save();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.k === 'text') { e.preventDefault(); addAfter(e.target); } });

function addAfter(el) { const { sc, c, i } = where(el); sc.cues.splice(i + 1, 0, { id: newId(sc, c.id), text: '', gap: 0.3, pause: null, credits: false, orig: null, origGap: 0.3, origPause: null, note: '', deleted: false, isNew: true }); renderScene(sc.id); const ta = document.querySelector('#sc-' + sc.id + ' .cue[data-i="' + (i + 1) + '"] textarea'); if (ta) ta.focus(); }
function toggleDel(el) { const { sc, c, i } = where(el); if (c.isNew) sc.cues.splice(i, 1); else c.deleted = !c.deleted; renderScene(sc.id); }
function revert(el) { const { sc, c } = where(el); c.text = c.orig; c.gap = c.origGap; renderScene(sc.id); }
function showNote(el) { const n = el.closest('.cue').querySelector('textarea.note'); n.style.display = ''; n.focus(); }
function toggleFact(chip) {
  const box = chip.closest('.cue').querySelector('.facts'), id = chip.dataset.f, f = FID[id], ex = box.querySelector('[data-f="' + id + '"]');
  if (ex) { ex.remove(); chip.classList.remove('on'); return; }
  chip.classList.add('on'); const d = document.createElement('div'); d.className = 'fact'; d.dataset.f = id;
  d.innerHTML = '<b>' + id + '</b>（' + esc(f.where) + '）' + esc(f.text) + '<div class="mu">出处：' + esc(f.src) + '　核查：' + esc(f.check) + '</div>'; box.appendChild(d);
}
function resetAll() { if (!confirm('丢弃全部改动，回到第 4 稿？')) return; ST = fresh(); save(); renderAll(); }

function exportObj() {
  return { schema: 'dshu-rewrite/1', base_sha256: D.base, author: 'WaterRun', exported_at: new Date().toISOString(), estimate_seconds: +totals().t.toFixed(1),
    scenes: ST.scenes.map((sc) => { const base = SC(sc.id); return { id: sc.id, chap: base.chap ? [base.chap[0], sc.chapTitle] : null, chap_changed: !!(base.chap && sc.chapTitle !== base.chap[1]), note: sc.note,
      cues: sc.cues.map((c) => ({ id: c.id, status: status(c) || 'same', text: c.text, orig: c.orig, gap: c.gap, pause: c.pause, credits: c.credits || undefined, note: c.note || undefined })) }; }) };
}
function textOut() {
  const L = ['# DSHU 改稿（基于第 4 稿 ' + D.base.slice(0, 12) + '，估算 ' + mmss(totals().t) + '）', ''];
  for (const sc of ST.scenes) {
    const base = SC(sc.id); L.push('## ' + sc.id + (base.chap ? ' · ' + base.chap[0] + ' ' + sc.chapTitle + (sc.chapTitle !== base.chap[1] ? '（原：' + base.chap[1] + '）' : '') : ''));
    if (sc.note) L.push('> 备注：' + sc.note);
    for (const c of sc.cues) {
      if (c.pause != null) { L.push(c.id + '｜（无旁白 ' + c.pause + ' 秒）'); continue; }
      const st = status(c), tag = { chg: '［改］', new: '［新］', del: '［删］' }[st] || '';
      L.push(c.id + '｜' + tag + (c.deleted ? c.orig : c.text) + (c.gap !== 0.3 ? '　｛停 ' + c.gap + '｝' : '') + (st === 'chg' && c.text !== c.orig ? '　〔原：' + c.orig + '〕' : '') + (c.note ? '　// ' + c.note : ''));
    }
    L.push('');
  }
  return L.join('\\n');
}
function toast(s) { const t = document.getElementById('toast'); t.textContent = s; t.style.display = 'block'; clearTimeout(saveT); saveT = setTimeout(() => (t.style.display = 'none'), 2600); }
function download() {
  const blob = new Blob([JSON.stringify(exportObj(), null, 1)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'dshu-rewrite-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '') + '.json'; a.click(); toast('已下载：' + a.download);
}
function copyText() {
  const s = textOut();
  (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(() => toast('已复制，贴回会话即可'), () => { const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('已复制'); });
}
function readView() {
  document.getElementById('read').innerHTML = ST.scenes.filter((sc) => sc.id !== 'credits').map((sc) => { const base = SC(sc.id);
    const p = sc.cues.filter((c) => c.pause == null && !c.deleted && (c.text || '').trim()).map((c) => '<span class="c ' + status(c) + '" title="' + esc(c.id) + '">' + esc(c.text.replace(/\\*/g, '')) + '</span>').join('。');
    return '<h4>' + esc(base.chap ? base.chap[0] + ' ' + sc.chapTitle : base.name) + '</h4><p>' + p + (p ? '。' : '') + '</p>'; }).join('');
  const box = document.getElementById('readbox'); box.open = true; box.scrollIntoView({ behavior: 'smooth' });
}
document.getElementById('facts').innerHTML = D.facts.map((f) => '<tr><td>' + f.id + '</td><td class="mu">' + esc(f.where) + '</td><td>' + esc(f.text) + '</td></tr>').join('');
document.getElementById('notin').innerHTML = D.notIn.map((s) => '<li>' + esc(s) + '</li>').join('');
renderAll();
</script></body></html>`;
const out = path.join(HERE, 'out', 'rewrite');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(path.relative(process.cwd(), path.join(out, 'index.html')), `· ${facts.length} 条事实，${order.length} 句`);
