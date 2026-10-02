// 片单：核对 videos/catalog.json 与 videos/ 下的实际目录，并生成 docs/catalog.md。
// 用法：node kit/tools/catalog.js            核对并重写 docs/catalog.md
//       node kit/tools/catalog.js --check    只核对；docs/catalog.md 与片单不一致时以非零码退出（提交前用）
// 片单的写法见 videos/catalog.json 开头的 about。新建视频用 new.js，它会登记片单；手改片单后运行本工具。
// 每个系列在 videos/series/<系列>/README.md 里有一份系列说明（定位与连续性约定，手写）；其中「分集」一节的表格由本工具维护。
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const CAT = path.join(REPO, 'videos', 'catalog.json'), DOC = path.join(REPO, 'docs', 'catalog.md');
const STATUS = { planned: '计划中', 'in-progress': '制作中', delivered: '已成片' };
function load() { return JSON.parse(fs.readFileSync(CAT, 'utf8')); }
// 展开成一张表：[{ series（系列对象或 null）, v, dir（相对仓库）, status, languages }]
function entries(cat) {
  const out = [];
  for (const s of cat.series) for (const v of s.videos) out.push({ series: s, v, dir: `videos/series/${s.slug}/${v.slug}` });
  for (const v of cat.standalone) out.push({ series: null, v, dir: `videos/standalone/${v.slug}` });
  for (const e of out) {
    e.status = e.v.status || 'planned'; e.languages = e.v.languages || ['zh', 'en'];
    // 制作方式：片单里写了就用片单的；已建目录的以 project.json 的 production 为准
    e.mode = e.v.mode || null; e.maker = e.v.maker || null;
    try { const p = JSON.parse(fs.readFileSync(path.join(REPO, e.dir, 'project.json'), 'utf8')); if (p.production) { e.mode = p.production.mode || 'self'; e.maker = p.production.maker || e.maker; } else e.mode = e.mode || 'self'; } catch (err) {}
  }
  return out;
}
function validate(cat) {
  const errs = [], slug = /^[a-z0-9]+(-[a-z0-9]+)*$/, all = entries(cat);
  const seenS = new Set();
  for (const s of cat.series) { if (!slug.test(s.slug)) errs.push(`系列 slug 不合规（小写字母、数字、连字符）：${s.slug}`); if (seenS.has(s.slug)) errs.push(`系列 slug 重复：${s.slug}`); seenS.add(s.slug); if (!s.title || !s.title.zh) errs.push(`系列 ${s.slug} 缺少中文标题`); }
  const seen = new Set();
  for (const e of all) {
    if (!slug.test(e.v.slug)) errs.push(`视频 slug 不合规：${e.dir}`);
    if (seen.has(e.dir)) errs.push(`重复的条目：${e.dir}`); seen.add(e.dir);
    if (!e.v.title || !e.v.title.zh) errs.push(`${e.dir} 缺少中文标题`);
    if (!STATUS[e.status]) errs.push(`${e.dir} 的 status 只能是 ${Object.keys(STATUS).join(' / ')}`);
    const has = fs.existsSync(path.join(REPO, e.dir, 'project.json'));
    if (e.status !== 'planned' && !has) errs.push(`${e.dir} 标为「${STATUS[e.status]}」，但目录里没有 project.json`);
    if (e.status === 'planned' && has) errs.push(`${e.dir} 已经有 project.json，片单里却还是「计划中」`);
    if (e.v.mode && !['self', 'delegated'].includes(e.v.mode)) errs.push(`${e.dir} 的 mode 只能是 self / delegated`);
    if (has) {
      const p = JSON.parse(fs.readFileSync(path.join(REPO, e.dir, 'project.json'), 'utf8')); const langs = p.languages || ['zh'];
      if (langs.join() !== e.languages.join()) errs.push(`${e.dir} 的语言与片单不一致：project.json 是 ${langs.join(', ')}，片单是 ${e.languages.join(', ')}`);
      const pm = (p.production || {}).mode || 'self'; if (e.v.mode && e.v.mode !== pm) errs.push(`${e.dir} 的制作方式与片单不一致：project.json 是 ${pm}，片单是 ${e.v.mode}`);
    }
  }
  // 反过来：videos/ 下每个含 project.json 的目录都要在片单里
  const walk = (d, depth) => { if (!fs.existsSync(d)) return; for (const n of fs.readdirSync(d, { withFileTypes: true })) { if (!n.isDirectory() || n.name.startsWith('_')) continue; const p = path.join(d, n.name); if (fs.existsSync(path.join(p, 'project.json'))) { const rel = path.relative(REPO, p).replace(/\\/g, '/'); if (!seen.has(rel)) errs.push(`${rel} 不在片单里`); } else if (depth > 0) walk(p, depth - 1); } };
  walk(path.join(REPO, 'videos', 'series'), 1); walk(path.join(REPO, 'videos', 'standalone'), 0);
  return errs;
}
function render(cat) {
  const all = entries(cat), n = (st) => all.filter((e) => e.status === st).length;
  const how = (e) => (e.mode === 'delegated' ? '委托' + (e.maker ? '（' + e.maker + '）' : '') : e.mode === 'self' ? '自制' + (e.maker ? '（' + e.maker + '）' : '') : '');
  const row = (e, i) => `| ${i + 1} | ${e.v.title.zh}${e.v.title.en ? '<br>' + e.v.title.en : ''} | ${e.languages.join(' + ')} | ${STATUS[e.status]} | ${how(e)} | ${e.status === 'planned' ? '`' + e.v.slug + '`' : `[\`${e.v.slug}\`](../${e.dir}/)`} | ${e.v.note || ''} |`;
  const head = '| # | 标题 | 语言 | 状态 | 制作 | 目录 | 备注 |\n|---|---|---|---|---|---|---|';
  const L = ['# 片单', '', '<!-- 由 node kit/tools/catalog.js 从 videos/catalog.json 生成，不要手改。 -->', '',
    `本仓库收录的视频分两类：属于某个系列的，目录在 \`videos/series/<系列>/<视频>/\`；独立成篇的，目录在 \`videos/standalone/<视频>/\`。`,
    `目前共 ${all.length} 部：已成片 ${n('delivered')} 部，制作中 ${n('in-progress')} 部，计划中 ${n('planned')} 部。计划中的条目只有标题，标题是工作标题；除另有说明外，每部都出中文与英文两个版本。`,
    '', '「制作」一栏是制作方式：自制指从取证到成片由同一个制作者完成；委托指准备方备好取证、旁白、视觉系统与任务书，由另一个模型完成场景与收尾（见 [delegation.md](delegation.md)）。计划中的条目未定时留空。', '',
    '## 系列', ''];
  for (const s of cat.series) {
    L.push(`### ${s.title.zh}`, '', `目录 [\`videos/series/${s.slug}/\`](../videos/series/${s.slug}/)${s.title.en ? '；英文名 ' + s.title.en : ''}。系列的定位与连续性约定见该目录的 README。${s.sections ? '建议的栏目骨架：' + s.sections.map((x) => x.zh).join(' → ') + '（不强制）。' : ''}`, '');
    if (!s.videos.length) { L.push('分集待定。', ''); continue; }
    L.push(head, ...all.filter((e) => e.series === s).map(row), '');
  }
  L.push('## 独立视频', '', head, ...all.filter((e) => !e.series).map(row), '');
  return L.join('\n');
}
// 系列说明：videos/series/<系列>/README.md。手写部分原样保留，只重写两个标记之间的分集表；文件不存在时生成一份骨架
const BEGIN = '<!-- catalog:begin 由 node kit/tools/catalog.js 生成，不要手改 -->', END = '<!-- catalog:end -->';
function seriesTable(s) {
  if (!s.videos.length) return '分集待定。';
  return ['| # | 标题 | 语言 | 状态 | 目录 |', '|---|---|---|---|---|', ...s.videos.map((v, i) => { const st = v.status || 'planned'; return `| ${i + 1} | ${v.title.zh} | ${(v.languages || ['zh', 'en']).join(' + ')} | ${STATUS[st]} | ${st === 'planned' ? '`' + v.slug + '`' : `[\`${v.slug}\`](${v.slug}/)`} |`; })].join('\n');
}
function seriesReadme(s, cur) {
  const block = `${BEGIN}\n${seriesTable(s)}\n${END}`;
  if (cur && cur.includes(BEGIN) && cur.includes(END)) return cur.slice(0, cur.indexOf(BEGIN)) + block + cur.slice(cur.indexOf(END) + END.length);
  if (cur) return cur.replace(/\s*$/, '') + `\n\n## 分集\n\n${block}\n`;
  return `# ${s.title.zh}\n\n<!-- 一两句话说明这个系列讲什么、给谁看。 -->\n\n## 连续性\n\n同一系列的各集保持一致的做法记在这里：首集制作时定下来，后续各集遵守；要改就先改这里。各项的含义见 [docs/series.md](../../../docs/series.md)。\n\n| 项 | 约定 |\n|---|---|\n| 标题 | 待首集确定 |\n| 结构 | 待首集确定 |\n| 视觉 | 待首集确定 |\n| 声音 | 待首集确定 |\n\n## 分集\n\n${block}\n`;
}
function syncSeries(cat, write) {
  const stale = [];
  for (const s of cat.series) {
    const f = path.join(REPO, 'videos', 'series', s.slug, 'README.md'), cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null, next = seriesReadme(s, cur);
    if (cur === next) continue;
    stale.push(`videos/series/${s.slug}/README.md`);
    if (write) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, next); }
  }
  return stale;
}
// 视频所在的系列（按目录判断）；独立视频返回 null
function seriesOf(cat, videoDir) { const m = path.relative(REPO, videoDir).replace(/\\/g, '/').match(/^videos\/series\/([^/]+)\/[^/]+$/); return m ? cat.series.find((s) => s.slug === m[1]) || null : null; }
module.exports = { load, entries, validate, render, syncSeries, seriesOf, CAT, DOC, STATUS };
if (require.main === module) {
  const cat = load(), errs = validate(cat), md = render(cat), check = process.argv.includes('--check');
  if (errs.length) { console.error('片单有问题：\n  ' + errs.join('\n  ')); process.exit(1); }
  const cur = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
  if (check) { const stale = syncSeries(cat, false); if (cur !== md || stale.length) { console.error('与 videos/catalog.json 不一致：' + [...(cur !== md ? ['docs/catalog.md'] : []), ...stale].join(' ') + '。运行 node kit/tools/catalog.js'); process.exit(1); } console.log('片单一致'); }
  else { fs.mkdirSync(path.dirname(DOC), { recursive: true }); fs.writeFileSync(DOC, md); const stale = syncSeries(cat, true); const all = entries(cat); console.log(`docs/catalog.md 已更新：${cat.series.length} 个系列，${all.length} 部视频（已成片 ${all.filter((e) => e.status === 'delivered').length}）` + (stale.length ? `；系列说明的分集表已更新 ${stale.length} 份` : '')); }
}
