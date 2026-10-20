// 经验规则：docs/lessons.json 是从反馈提炼出的通用规则；每部片子在 review/lessons.json 记录逐条的复核结论。
// node kit/tools/lessons.js show [--stage 文案|script…] [--id F04]   打印规则（开工前读这一阶段的几条）
// node kit/tools/lessons.js render [--check]                         由 lessons.json 重新生成 docs/lessons.md 的规则表
// node kit/tools/lessons.js <视频> sync                               带入新增或改变了要求的规则（rev 变化），旧结论移入 history
// node kit/tools/lessons.js <视频> check [--final]                    核对复核记录；--final 要求每条都有结论
// 结论：pass（附 evidence：成片的语言与时段、用什么方法查的）、n/a（附 note：为什么不适用）、open（附 note：已知未解决，交付时写进 README）。
// pending 表示还没考虑过，交付前不能留。工具只核对记录是否完整，判断仍靠实际的看、听与读稿。
const fs = require('node:fs'), path = require('node:path');
const REPO = path.resolve(__dirname, '../..');
const RESULTS = ['pending', 'pass', 'n/a', 'open'];
function registry(root = REPO) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'docs/lessons.json'), 'utf8'));
  if (data.schema !== 2 || !data.version || !data.stages || !Array.isArray(data.rules) || !data.rules.length) throw new Error('经验规则表格式错误（docs/lessons.json）');
  const seen = new Set();
  for (const r of data.rules) {
    if (!/^F\d{2,}$/.test(r.id) || seen.has(r.id)) throw new Error('经验规则编号不合规或重复：' + r.id);
    if (!Number.isInteger(r.rev) || r.rev < 1 || !r.title || !r.rule || !r.check || !Array.isArray(r.stages) || !r.stages.length) throw new Error(r.id + ' 缺少 rev、title、rule、check 或 stages');
    for (const s of r.stages) if (!data.stages[s]) throw new Error(r.id + ' 的阶段不存在：' + s);
    seen.add(r.id);
  }
  return data;
}
const fresh = (rule) => ({ rev: rule.rev, result: 'pending', note: '', evidence: '' });
function initial(data = registry()) { return { schema: 2, version: data.version, items: Object.fromEntries(data.rules.map((r) => [r.id, fresh(r)])), history: [] }; }
const FILE = (video) => path.join(video, 'review', 'lessons.json');
function read(video) { try { return JSON.parse(fs.readFileSync(FILE(video), 'utf8')); } catch (e) { return null; } }
const filled = (value) => typeof value === 'string' && value.trim().length >= 4 && !/^(待填|待定|TODO|pending|未做|未检查)$/i.test(value.trim());
// 新片（project.json 的 layout 为 2）必须有记录；旧片没有记录时不强求，有记录就按记录核对
function status(video, project, { final = false } = {}, data = registry()) {
  const rec = read(video);
  if (!rec) return project.layout >= 2 ? { ok: false, problems: ['缺少 review/lessons.json；运行 node kit/tools/lessons.js <视频> sync'], open: [] } : { ok: true, legacy: true, problems: [], open: [] };
  if (rec.schema !== 2 || !rec.items || typeof rec.items !== 'object') return { ok: false, problems: ['review/lessons.json 格式错误'], open: [] };
  const problems = [], open = [];
  if (rec.version !== data.version) problems.push(`规则已更新到 ${data.version}（本片记录是 ${rec.version}）；运行 lessons.js sync`);
  for (const r of data.rules) {
    const it = rec.items[r.id];
    if (!it) { problems.push(r.id + ' 未带入本片'); continue; }
    if (it.rev !== r.rev) { problems.push(r.id + ' 的要求已改变（rev ' + it.rev + ' → ' + r.rev + '），须重新复核'); continue; }
    if (!RESULTS.includes(it.result)) { problems.push(r.id + ' 的 result 只能是 ' + RESULTS.join(' / ')); continue; }
    if (!final) continue;
    if (it.result === 'pending') problems.push(`${r.id} ${r.title}：还没有结论`);
    else if (it.result === 'pass' && !filled(it.evidence)) problems.push(r.id + ' 记为 pass，缺少 evidence（成片的语言、时段与检查方法）');
    else if (it.result === 'n/a' && !filled(it.note)) problems.push(r.id + ' 记为 n/a，缺少 note（本片不适用的具体原因）');
    else if (it.result === 'open') { if (!filled(it.note)) problems.push(r.id + ' 记为 open，缺少 note（问题是什么、为什么交付时仍未解决）'); else open.push(`${r.id} ${r.title}：${it.note}`); }
  }
  return { ok: problems.length === 0, problems, open };
}
function sync(video, data = registry()) {
  const { noLinks, acquireLock } = require('./project-files');
  acquireLock(video);
  const file = FILE(video);
  noLinks(file); fs.mkdirSync(path.dirname(file), { recursive: true });
  const rec = read(video) || initial(data);
  if (rec.schema !== 2 || !rec.items) throw new Error('已有记录格式错误，未覆盖：' + file);
  rec.history ||= [];
  const changed = [];
  for (const r of data.rules) {
    const it = rec.items[r.id];
    if (!it) { rec.items[r.id] = fresh(r); changed.push(r.id + '（新增）'); }
    else if (it.rev !== r.rev) { rec.history.push({ version: rec.version, id: r.id, item: it }); rec.items[r.id] = fresh(r); changed.push(r.id + '（要求改变）'); }
  }
  rec.version = data.version;
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
  return changed;
}
// ── 打印与生成 ──
function describe(r, data, { brief = false } = {}) {
  const lines = [`${r.id} ${r.title}　[${r.stages.map((s) => data.stages[s]).join('、')}]`, '  ' + r.rule];
  if (!brief) {
    if (r.why) lines.push('  为什么：' + r.why);
    lines.push('  怎样查：' + r.check + (r.auto ? `（工具：${r.auto}）` : ''));
    const c = r.cases || {};
    if ((c.good || []).length || (c.bad || []).length) lines.push('  案例：' + [c.good?.length ? '正面 ' + c.good.join('、') : '', c.bad?.length ? '反面 ' + c.bad.join('、') : ''].filter(Boolean).join('；'));
  }
  return lines.join('\n');
}
function pickStage(data, value) { if (!value) return null; if (data.stages[value]) return value; const hit = Object.keys(data.stages).find((k) => data.stages[k] === value); if (!hit) throw new Error('没有这个阶段：' + value + '（可用：' + Object.entries(data.stages).map(([k, v]) => k + '/' + v).join(' ') + '）'); return hit; }
const BEGIN = '<!-- lessons:begin 由 node kit/tools/lessons.js render 从 docs/lessons.json 生成，不要手改 -->', END = '<!-- lessons:end -->';
const cell = (x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
function table(data) {
  const L = [`当前版本 ${data.version}，共 ${data.rules.length} 条。`, ''];
  for (const [stage, name] of Object.entries(data.stages)) {
    const rs = data.rules.filter((r) => r.stages[0] === stage);
    if (!rs.length) continue;
    L.push(`### ${name}`, '');
    for (const r of rs) {
      const c = r.cases || {}, links = (xs) => xs.map((s) => `[${s}](../videos/${s}/)`).join('、');
      L.push(`#### ${r.id} ${r.title}`, '', r.rule, '');
      if (r.why) L.push(`- **为什么**：${r.why}`);
      L.push(`- **怎样查**：${r.check}${r.auto ? `（工具：${r.auto}）` : ''}`);
      if (r.stages.length > 1) L.push(`- **也用于**：${r.stages.slice(1).map((s) => data.stages[s]).join('、')}`);
      if ((c.good || []).length || (c.bad || []).length) L.push(`- **案例**：${[c.good?.length ? '正面 ' + links(c.good) : '', c.bad?.length ? '反面 ' + links(c.bad) : ''].filter(Boolean).join('；')}`);
      if ((r.sources || []).length) L.push(`- **来源**：${r.sources.join('、')}（见 [反馈记录](log/feedback.md)）`);
      L.push('');
    }
  }
  return L.join('\n').replace(/\n+$/, '');
}
function renderDoc(cur, data) {
  const block = `${BEGIN}\n${table(data)}\n${END}`;
  if (!cur.includes(BEGIN) || !cur.includes(END)) throw new Error('docs/lessons.md 缺少生成标记');
  return cur.slice(0, cur.indexOf(BEGIN)) + block + cur.slice(cur.indexOf(END) + END.length);
}
module.exports = { registry, initial, status, sync, describe, renderDoc, RESULTS };
if (require.main === module) {
  try {
    const argv = process.argv.slice(2), data = registry();
    const flagVal = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
    if (argv[0] === 'show') {
      const stage = pickStage(data, flagVal('stage')), id = flagVal('id');
      const rs = data.rules.filter((r) => (!stage || r.stages.includes(stage)) && (!id || r.id === id));
      console.log(`经验规则 ${data.version}${stage ? ' · ' + data.stages[stage] : ''}：${rs.length} 条。全文见 docs/lessons.md。\n`);
      console.log(rs.map((r) => describe(r, data, { brief: !!stage && !id && argv.includes('--brief') })).join('\n\n'));
    } else if (argv[0] === 'render') {
      const doc = path.join(REPO, 'docs/lessons.md'), cur = fs.readFileSync(doc, 'utf8'), next = renderDoc(cur, data);
      if (argv.includes('--check')) { if (cur !== next) { console.error('docs/lessons.md 与 docs/lessons.json 不一致；运行 node kit/tools/lessons.js render'); process.exitCode = 1; } else console.log('经验规则文档一致'); }
      else { fs.writeFileSync(doc, next); console.log('docs/lessons.md 已更新：' + data.rules.length + ' 条'); }
    } else {
      const { needVideo, PROJECT, positional } = require('./lib');
      const video = needVideo(), command = positional([])[0];
      if (command === 'sync') { const changed = sync(video, data); console.log(`已同步到 ${data.version}` + (changed.length ? '；待复核：' + changed.join('、') : '；没有新增或改变的规则') + '。逐条结论写在 review/lessons.json。'); }
      else if (command === 'check') {
        const result = status(video, PROJECT(), { final: argv.includes('--final') }, data);
        if (result.legacy) console.log('旧项目没有复核记录；接续制作时先运行 sync。');
        else { console.log(result.ok ? '复核记录完整。内容与观感仍按实际看、听的范围判断。' : result.problems.join('\n')); if (result.open.length) console.log('\n交付时仍未解决（写进 README「交付」）：\n  ' + result.open.join('\n  ')); }
        process.exitCode = result.ok ? 0 : 1;
      } else throw new Error('用法：lessons.js show [--stage 阶段] [--id 编号] | render [--check] | <视频> sync | <视频> check [--final]');
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
