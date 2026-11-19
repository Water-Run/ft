// 预检：给接手实现的会话（含较小的模型）在每次改动后跑一遍，抓最常见的错误。不改任何文件，只读与报告。
// 用法：node videos/in-seconds/ttft/tools/preflight.js        （从仓库根目录）
// 检查：① 文案确认状态与内容哈希 ② 时间线（旁白超出定点）③ 每个场景文件的语法 ④ 场景号与文案的场景一一对应
//       ⑤ 场景里每个 T('句号','词') / Tend('句号') 的句号与词都找得到（词在合成文本里找；TTFT 被读成「T T F T」不能当词）
//       ⑥ 禁用写法（CSS 动画、定时器、随机数、渐变、阴影、圆角、回调）⑦ 源码里的颜色只许用 project.json 的 check.style.palette ⑧ 还有几个场景是骨架
// 退出码：有「✗」时为 1。「!」是提示，不算失败。
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const repo = path.resolve(base, '../../..');
const proj = JSON.parse(fs.readFileSync(path.join(base, 'project.json'), 'utf8'));
let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const no = (m) => { bad++; console.log('  ✗ ' + m); };
const warn = (m) => console.log('  ! ' + m);
const head = (m) => console.log('\n' + m);

// ── ① 文案确认 ──
head('① 文案确认');
const approval = JSON.parse(fs.readFileSync(path.join(base, 'review/approval.json'), 'utf8')).languages.zh;
const r = cp.spawnSync(process.execPath, [path.join(repo, 'kit/tools/script-review.js'), 'videos/in-seconds/ttft', 'check', '--lang', 'zh'], { cwd: repo, encoding: 'utf8' });
const out = (r.stdout + r.stderr).trim().split('\n').pop();
if (approval.status === 'approved' && r.status === 0) ok('校对者已确认，稿本哈希与当前 script.js 一致：可以配音、铺开场景');
else { warn(`approval 状态：${approval.status}；script-review 说：${out}。确认之前不配音、不按稿铺开场景（只能做基建）`); }

// ── ② 时间线 ──
head('② 时间线');
const S = require(path.join(base, 'src/js/script.js'));
let DUR = {};
try { const win = {}; new vm.Script(fs.readFileSync(path.join(base, 'src/js/timing.zh.js'), 'utf8')).runInNewContext({ window: win }); DUR = (win.DUR_ALL || {}).zh || {}; } catch (e) { /* 没有实测 */ }
const measured = Object.keys(DUR).length;
const L = S.layoutScript(DUR);
console.log(`  时长来源：${measured ? `实测 ${measured} 句` : '估算（还没有 tts.js 的实测）'}；总长 ${L.total.toFixed(2)} 秒`);
if (L.problems.length) L.problems.forEach((p) => no(p)); else ok('没有场景的旁白超出定点');
console.log('  各场余量（秒）：' + L.scenes.map((s) => `${s.id} ${s.slack.toFixed(2)}`).join('  '));

// ── ③ 语法与 ④ 场景号 ──
head('③ 语法  ④ 场景号');
const dir = path.join(base, 'src/js');
const scenesDir = path.join(dir, 'scenes');
const files = [...['config.js', 'parts.js'].map((f) => path.join(dir, f)), ...fs.readdirSync(scenesDir).filter((f) => f.endsWith('.js')).sort().map((f) => path.join(scenesDir, f))];
for (const f of files) {
  const c = cp.spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (c.status !== 0) no(`${path.relative(base, f)} 语法错误：${(c.stderr.split('\n').find((l) => /Error/.test(l)) || '').trim()}`);
}
if (!bad) ok(`${files.length} 个文件语法通过`);
const reg = {};
let skeleton = 0;
for (const f of files.filter((x) => x.includes('scenes'))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/scene\(\s*'([^']+)'/g)) reg[m[1]] = path.basename(f);
  if (/dataset\.skeleton/.test(src)) skeleton++;
}
const want = S.SCRIPT.map((s) => s.id);
const missing = want.filter((id) => !reg[id]), extra = Object.keys(reg).filter((id) => !want.includes(id));
if (missing.length) no('文案里有、但没有场景文件注册的场景号：' + missing.join('、')); else ok('每个文案场景都有场景文件注册');
if (extra.length) no('注册了、但文案里没有的场景号：' + extra.join('、'));
const html = fs.readFileSync(path.join(base, 'src/index.html'), 'utf8');
for (const f of Object.values(reg)) if (!html.includes('js/scenes/' + f)) no(`index.html 没有加载 ${f}`);

// ── ⑤ T() 的句号与词 ──
head('⑤ T() / Tend() 的句号与词');
let nT = 0;
for (const f of files.filter((x) => x.includes('scenes'))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b(T|Tend)\(\s*'([A-Za-z0-9_]+)'(?:\s*,\s*'([^']*)')?/g)) {
    nT++;
    const id = m[2], word = m[1] === 'T' ? m[3] : null, c = L.cues[id];
    if (!c) { no(`${path.basename(f)}：${m[0]} 的句号不存在`); continue; }
    if (word) {
      const tts = c.tts || '';
      if (!tts.includes(word.startsWith('=') ? word.slice(1) : S.ttsNorm(word))) no(`${path.basename(f)}：${m[0]}') 的词不在 ${id} 的合成文本里（合成文本：${tts}）`);
    }
  }
}
if (!nT) console.log('  （场景里还没有 T() 调用）'); else if (!bad) ok(`${nT} 处时刻引用都找得到`);
// Tr('句号','词')：不吸附的原始词时刻（词的规则同 T()，「=词」不经 SAY）；Tnth('句号','词边界',n)：词边界恰好等于该串的第 n 个（从 0 起）——两者找不到时会悄悄退回句首，所以也要查
let nR = 0;
for (const f of files.filter((x) => x.includes('scenes'))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bTr\(\s*'([A-Za-z0-9_]+)'\s*,\s*'([^']*)'/g)) {
    nR++;
    const c = L.cues[m[1]], word = m[2];
    if (!c) { no(`${path.basename(f)}：${m[0]}') 的句号不存在`); continue; }
    if (!(c.tts || '').includes(word.startsWith('=') ? word.slice(1) : S.ttsNorm(word))) no(`${path.basename(f)}：${m[0]}') 的词不在 ${m[1]} 的合成文本里（合成文本：${c.tts}）`);
  }
  for (const m of src.matchAll(/\bTnth\(\s*'([A-Za-z0-9_]+)'\s*,\s*'([^']*)'(?:\s*,\s*(\d+))?\s*\)/g)) {
    nR++;
    const c = L.cues[m[1]], n = +(m[3] || 0);
    if (!c) { no(`${path.basename(f)}：${m[0]} 的句号不存在`); continue; }
    if (!c.words) { warn(`${path.basename(f)}：${m[0]} 没有实测词边界，无法核对`); continue; }
    if (c.words.filter((w) => w[2] === m[2]).length <= n) no(`${path.basename(f)}：${m[0]} 在 ${m[1]} 的词边界里找不到第 ${n + 1} 个「${m[2]}」（词边界：${c.words.map((w) => w[2]).join('|')}）`);
  }
}
if (nR && !bad) ok(`${nR} 处 Tr() / Tnth() 引用都找得到`);
// 旁白里的 Token 读成「偷啃」、TTFT 读成「T T F T」：提醒常见错写
for (const f of files.filter((x) => x.includes('scenes'))) {
  const src = fs.readFileSync(f, 'utf8');
  if (/T\(\s*'[a-z]\d+'\s*,\s*'(Token|TTFT)'/.test(src)) no(`${path.basename(f)}：T() 不能用 'Token' 或 'TTFT' 当词（读成「偷啃」「T T F T」），用旁边的汉字词；d4 里的英文 Token 写 '=Token'`);
}

// ── ⑥ 禁用写法 与 ⑦ 颜色 ──
head('⑥ 禁用写法  ⑦ 颜色');
const FORBID = [[/setTimeout|setInterval|requestAnimationFrame/, '定时器或 rAF'], [/Math\.random/, 'Math.random（用 seeded()）'], [/@keyframes|\banimation\s*:|\btransition\s*:/, 'CSS 动画或 transition'],
  [/\.call\(|onComplete|onUpdate|onStart/, 'tl.call 或时间线回调'], [/gradient\(/, '渐变'], [/box-shadow|text-shadow|drop-shadow|boxShadow|textShadow/, '阴影'], [/border-radius|borderRadius/, '圆角'], [/blur\(|backdrop-filter/, '模糊']];
const checkFiles = [...files, path.join(base, 'src/css/style.css'), path.join(base, 'src/cover.html')];
for (const f of checkFiles) {
  const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  for (const [re, what] of FORBID) if (re.test(code)) no(`${path.relative(base, f)}：出现 ${what}`);
}
const pal = new Set((proj.check.style.palette || []).map((x) => x.toLowerCase()));
for (const f of checkFiles) {
  const code = fs.readFileSync(f, 'utf8');
  for (const m of code.matchAll(/#([0-9a-fA-F]{6})\b/g)) if (!pal.has(m[1].toLowerCase())) no(`${path.relative(base, f)}：颜色 #${m[1]} 不在 palette 里`);
}
if (!bad) ok('没有禁用写法，颜色都在 palette 里');

// ── ⑧ 进度 ──
head('⑧ 进度');
const total = Object.keys(reg).length;
console.log(`  场景文件 ${total} 个，其中仍是骨架（dataset.skeleton）的 ${skeleton} 个（片尾名单已实现，不算）`);
console.log(`\n${bad ? '预检未通过：' + bad + ' 项 ✗' : '预检通过（上面的「!」仅为提示）'}`);
process.exit(bad ? 1 : 0);
