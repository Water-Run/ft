// 片单：核对 videos/catalog.json、各片 project.json 与 videos/ 下的实际目录，生成片单索引 videos/README.md 与各系列说明 videos/<系列>/README.md 的分集表。
// 用法：node kit/tools/catalog.js            核对并重新生成
//       node kit/tools/catalog.js --check    只核对；生成物与源头不一致时以非零码退出（提交前用，repo-check 会调用）
// 片单的写法见 videos/catalog.json 开头的 about。新建视频用 new.js，它会登记片单；手改片单后运行本工具。
// 目录分两层：系列里的一集在 videos/<系列>/<slug>/，独立视频在 videos/standalone/<slug>/。slug 全仓库唯一；归属以条目的 series 字段为准，目录与它一致。
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const CAT = path.join(REPO, 'videos', 'catalog.json'), INDEX = path.join(REPO, 'videos', 'README.md');
const STANDALONE = 'standalone';
const groupOf = (v) => v.series || STANDALONE;                                 // 第一层目录：系列 slug，或 standalone
const dirOf = (v) => `videos/${groupOf(v)}/${v.slug}`;
const STATUS = { planned: '计划中', 'in-progress': '制作中', delivered: '已成片' };
const STAGES = { brief: '立项', research: '取证', script: '文案', review: '审稿', voice: '配音', design: '设计', build: '实现', sound: '声音', render: '成片', accept: '验收', delivered: '已交付', released: '已发布' };
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// 语言：条目自己的 languages ＞ 所属系列的 languages ＞ 缺省的中英双语
const DEFAULT_LANGS = ['zh', 'en'];
const langsOk = (l) => Array.isArray(l) && l.length && new Set(l).size === l.length && l.every((x) => ['zh', 'en'].includes(x));
// 署名里不能代替模型名的写法：客户端、运行框架、平台名，以及不带版本的系列名（见 docs/roles.md 第 5 节）
const NOT_MODELS = [/^codex\b/i, /^claude code\b/i, /^cursor\b/i, /^opencode\b/i, /^chatgpt\b/i, /^copilot\b/i, /^(claude|gpt|gemini|deepseek|kimi|qwen|grok|opus|sonnet|haiku)\s*-?\d*$/i, /主会话/];
function load() { return JSON.parse(fs.readFileSync(CAT, 'utf8')); }
const readJSON = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
function lessonsVersion() { return (readJSON(path.join(REPO, 'docs', 'lessons.json')) || {}).version || null; }
// 展开成一张表：[{ v, series（系列对象或 null）, no（系列内序号）, dir（相对仓库）, status, languages, project }]
function entries(cat) {
  const count = {};
  return cat.videos.map((v) => {
    const series = v.series ? cat.series.find((s) => s.slug === v.series) || null : null;
    const dir = dirOf(v), project = readJSON(path.join(REPO, dir, 'project.json'));
    return { v, series, no: v.series ? (count[v.series] = (count[v.series] || 0) + 1) : null, dir, status: v.status || 'planned', languages: v.languages || (series && series.languages) || DEFAULT_LANGS, project };
  });
}
// 署名的模型名：新片取 credits.models，旧片退回 production.maker / prepared_by
function makers(p) {
  if (!p) return [];
  if (p.credits && Array.isArray(p.credits.models)) return p.credits.models.map((m) => m.name);
  const pr = p.production || {};
  return [pr.prepared_by, pr.maker].filter(Boolean).flatMap((x) => String(x).split(/[、,，]\s*/));
}
function creditProblems(p, where) {
  const errs = [];
  if (!p || !p.credits) return errs;
  const c = p.credits;
  if (!Array.isArray(c.models)) return [`${where}：credits.models 必须是数组`];
  for (const m of [...c.models, ...(c.services || [])]) {
    if (!m || typeof m.name !== 'string' || !m.name.trim()) { errs.push(`${where}：credits 里有缺少 name 的条目`); continue; }
    if (!Array.isArray(m.roles) || !m.roles.length) errs.push(`${where}：${m.name} 缺少 roles（实际分工）`);
  }
  for (const m of c.models) if (m && typeof m.name === 'string' && NOT_MODELS.some((re) => re.test(m.name.trim()))) errs.push(`${where}：「${m.name}」不是模型的真实名称（写提供方公布的型号与版本，见 docs/roles.md 第 5 节）`);
  return errs;
}
function validate(cat) {
  const errs = [];
  if (!Array.isArray(cat.series) || !Array.isArray(cat.videos)) return ['videos/catalog.json 须有 series 与 videos 两个数组'];
  const seenS = new Set();
  for (const s of cat.series) {
    if (!SLUG.test(s.slug || '')) errs.push(`系列 slug 不合规（小写字母、数字、连字符）：${s.slug}`);
    if (s.slug === STANDALONE) errs.push('系列 slug 不能叫 standalone（它是独立视频的目录）');
    if (seenS.has(s.slug)) errs.push(`系列 slug 重复：${s.slug}`); seenS.add(s.slug);
    if (!s.title || !s.title.zh) errs.push(`系列 ${s.slug} 缺少中文标题`);
    if (s.languages && !langsOk(s.languages)) errs.push(`系列 ${s.slug} 的 languages 只能是 zh、en 的不重复组合`);
    if (s.starter && !fs.existsSync(path.join(REPO, 'kit', 'starters', s.starter))) errs.push(`系列 ${s.slug} 的起点 kit/starters/${s.starter}/ 不存在`);
    const ids = new Set(['open']);
    for (const x of s.sections || []) { if (!/^[a-z][a-z0-9_-]*$/.test(x.id || '') || ids.has(x.id) || !x.zh) errs.push(`系列 ${s.slug} 的栏目须有唯一且安全的 id（不能用 open）和中文标题：${x.id}`); ids.add(x.id); }
  }
  const seen = new Set();
  for (const e of entries(cat)) {
    const { v } = e;
    if (!SLUG.test(v.slug || '')) errs.push(`视频 slug 不合规：${v.slug}`);
    if (seen.has(v.slug)) errs.push(`视频 slug 重复：${v.slug}（全仓库唯一）`); seen.add(v.slug);
    if (v.series && !e.series) errs.push(`${e.dir}：片单里没有系列 ${v.series}`);
    if (!v.title || !v.title.zh) errs.push(`${e.dir} 缺少中文标题`);
    if (v.languages && !langsOk(v.languages)) errs.push(`${e.dir} 的 languages 只能是 zh、en 的不重复组合`);
    if (v.languages && e.series && e.series.languages && v.languages.join() === e.series.languages.join()) errs.push(`${e.dir} 的 languages 与系列的缺省相同，删掉这一项（由系列继承）`);
    if (!STATUS[e.status]) errs.push(`${e.dir} 的 status 只能是 ${Object.keys(STATUS).join(' / ')}`);
    const has = fs.existsSync(path.join(REPO, e.dir, 'project.json'));
    if (e.status !== 'planned' && !has) errs.push(`${e.dir} 标为「${STATUS[e.status]}」，但目录里没有 project.json`);
    if (e.status === 'planned' && has) errs.push(`${e.dir} 已经有 project.json，片单里却还是「计划中」`);
    if (has && !e.project) errs.push(`${e.dir}/project.json 不是合法的 JSON`);
    if (!e.project) continue;
    const p = e.project, langs = p.languages || ['zh'];
    if (p.slug !== v.slug) errs.push(`${e.dir}/project.json 的 slug 是 ${p.slug}，与目录名不一致`);
    if (langs.join() !== e.languages.join()) errs.push(`${e.dir} 的语言与片单不一致：project.json 是 ${langs.join(', ')}，片单是 ${e.languages.join(', ')}`);
    if (p.stage != null && !STAGES[p.stage]) errs.push(`${e.dir}/project.json 的 stage 只能是 ${Object.keys(STAGES).join(' / ')}`);
    errs.push(...creditProblems(p, e.dir + '/project.json'));
  }
  // 反过来：videos/ 下第一层只有系列与 standalone，第二层只有片单里属于它的视频
  const groups = new Set([STANDALONE, ...cat.series.map((x) => x.slug)]);
  for (const g of fs.readdirSync(path.join(REPO, 'videos'), { withFileTypes: true })) {
    if (!g.isDirectory()) continue;
    if (!groups.has(g.name)) { errs.push(`videos/${g.name} 既不是片单里的系列，也不是 standalone`); continue; }
    for (const n of fs.readdirSync(path.join(REPO, 'videos', g.name), { withFileTypes: true })) {
      if (!n.isDirectory()) continue;
      const v = cat.videos.find((x) => x.slug === n.name);
      if (!v) errs.push(`videos/${g.name}/${n.name} 不在片单里`);
      else if (groupOf(v) !== g.name) errs.push(`videos/${g.name}/${n.name} 放错了位置：片单里它属于 ${groupOf(v)}`);
    }
  }
  return errs;
}
// ── 生成：片单索引 videos/README.md ──
const mmss = (s) => { const seconds = Math.round(s); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
const inIndex = (e) => `${groupOf(e.v)}/${e.v.slug}/`;   // 从 videos/README.md 到本片目录
const cellText = (x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
function link(e, from) { return e.status === 'planned' ? '`' + e.v.slug + '`' : `[\`${e.v.slug}\`](${from}${e.v.slug}/)`; }
function render(cat) {
  const all = entries(cat), n = (st) => all.filter((e) => e.status === st).length, current = lessonsVersion();
  const seriesName = (e) => (e.series ? `[${e.series.title.zh}](${e.series.slug}/README.md)` : '—');
  const L = ['# 片单', '', '<!-- 由 node kit/tools/catalog.js 从 videos/catalog.json 与各片 project.json 生成，不要手改。 -->', '',
    `共 ${all.length} 部：已成片 ${n('delivered')}，制作中 ${n('in-progress')}，计划中 ${n('planned')}。系列里的一集在 \`videos/<系列>/<片>/\`，独立视频在 \`videos/standalone/<片>/\`；系列说明是各系列目录下的 README。计划中的标题是工作标题；除另有说明外，每部出中文与英文两个版本。`, ''];
  // 已成片：按交付日期倒序
  const done = all.filter((e) => e.status === 'delivered').sort((a, b) => String(b.project?.delivery?.date || '').localeCompare(String(a.project?.delivery?.date || '')));
  L.push('## 已成片', '', '时长是成片的容器时长；评分是策划者给的分数（满分 10），记录在各片 `project.json` 的 `reception`。', '',
    '| 片 | 系列 | 语言 · 时长 | 交付 | 发布 | 评分 | 参与模型 |', '|---|---|---|---|---|---|---|');
  for (const e of done) {
    const p = e.project || {}, d = p.delivery || {}, dur = d.duration || {};
    const durs = e.languages.map((l) => l + (dur[l] ? ' ' + mmss(dur[l]) : '')).join('、');
    const rel = (p.release || []).map((r) => `[${r.platform}${e.languages.length > 1 && r.lang ? ' ' + r.lang : ''}](${r.url})`).join('、') || '未登记';
    const score = (p.reception || []).filter((r) => r.score != null).map((r) => `${r.score}（${r.date}）`).join('、') || '—';
    L.push(`| [${cellText(e.v.title.zh)}](${inIndex(e)}) | ${seriesName(e)} | ${durs} | ${d.date || '—'} | ${rel} | ${score} | ${cellText(makers(p).join('、')) || '未记录'} |`);
  }
  L.push('', '## 制作中', '', `阶段与下一步取自各片 \`project.json\` 的 \`stage\`、\`next\`；「规则」一栏是本片复核记录对应的经验规则版本（当前 ${current || '—'}），落后时运行 \`node kit/tools/lessons.js <片> sync\`。`, '',
    '| 片 | 系列 | 阶段 | 下一步 | 规则 |', '|---|---|---|---|---|');
  for (const e of all.filter((x) => x.status === 'in-progress')) {
    const p = e.project || {}, rec = readJSON(path.join(REPO, e.dir, 'review', 'lessons.json'));
    const ver = !rec ? '未接入' : rec.version === current ? '最新' : '待同步';
    L.push(`| [${cellText(e.v.title.zh)}](${inIndex(e)}) | ${seriesName(e)} | ${STAGES[p.stage] || '未记录'} | ${cellText(p.next || '')} | ${ver} |`);
  }
  L.push('', '## 全部选题', '', '按系列列出，系列内的顺序即集数。', '');
  const head = '| # | 标题 | 语言 | 状态 | 目录 | 备注 |\n|---|---|---|---|---|---|';
  const row = (e, i) => `| ${i} | ${cellText(e.v.title.zh)}${e.v.title.en ? '<br>' + cellText(e.v.title.en) : ''} | ${e.languages.join(' + ')} | ${STATUS[e.status]} | ${link(e, groupOf(e.v) + '/')} | ${cellText(e.v.note || '')} |`;
  for (const s of cat.series) {
    const eps = all.filter((e) => e.series === s);
    L.push(`### ${s.title.zh}`, '', `[系列说明](${s.slug}/README.md)${s.title.en ? '；英文名 ' + s.title.en : ''}。缺省语言：${(s.languages || DEFAULT_LANGS).join(' + ')}。`, '');
    L.push(...(eps.length ? [head, ...eps.map((e) => row(e, e.no))] : ['分集待定。']), '');
  }
  const solo = all.filter((e) => !e.series);
  L.push('### 独立视频', '', head, ...solo.map((e, i) => row(e, i + 1)), '');
  return L.join('\n');
}
// ── 生成：videos/<系列>/README.md 的分集表。手写部分原样保留，只重写两个标记之间；文件不存在时生成骨架 ──
const BEGIN = '<!-- catalog:begin 由 node kit/tools/catalog.js 生成，不要手改 -->', END = '<!-- catalog:end -->';
function seriesTable(cat, s) {
  const eps = entries(cat).filter((e) => e.series === s);
  if (!eps.length) return '分集待定。';
  return ['| # | 标题 | 语言 | 状态 | 目录 |', '|---|---|---|---|---|', ...eps.map((e) => `| ${e.no} | ${cellText(e.v.title.zh)} | ${e.languages.join(' + ')} | ${STATUS[e.status]} | ${link(e, '')} |`)].join('\n');
}
function seriesDoc(cat, s, cur) {
  const block = `${BEGIN}\n${seriesTable(cat, s)}\n${END}`;
  if (cur && cur.includes(BEGIN) && cur.includes(END)) return cur.slice(0, cur.indexOf(BEGIN)) + block + cur.slice(cur.indexOf(END) + END.length);
  if (cur) return cur.replace(/\s*$/, '') + `\n\n## 分集\n\n${block}\n`;
  return `# ${s.title.zh}\n\n<!-- 一两句话：这个系列讲什么、给谁看。写法见仓库的 docs/guides/series.md。 -->\n\n## 定位\n\n| | |\n|---|---|\n| 讲什么 | |\n| 面向谁 | |\n| 怎么讲 | |\n| 每集多长 | |\n\n## 共同约定\n\n<!-- 只写各集真正共享的：标题格式、时长规则、结构骨架、常驻元素的位置。视觉与配乐默认每集按自己的对象重新设计，不写在这里。 -->\n\n| 项 | 约定 |\n|---|---|\n| 标题 | 待首集确定 |\n\n## 分集\n\n${block}\n`;
}
function syncSeries(cat, write) {
  const stale = [];
  for (const s of cat.series) {
    const f = path.join(REPO, 'videos', s.slug, 'README.md'), cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null, next = seriesDoc(cat, s, cur);
    if (cur === next) continue;
    stale.push(`videos/${s.slug}/README.md`);
    if (write) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, next); }
  }
  return stale;
}
// 写回片单：保持「每个视频一行」，便于并行编辑时少冲突
function save(cat) {
  const compact = (v) => (Array.isArray(v) ? '[' + v.map(compact).join(', ') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).map((k) => JSON.stringify(k) + ': ' + compact(v[k])).join(', ') + '}' : JSON.stringify(v));
  const out = ['{', '  "about": ' + JSON.stringify(cat.about) + ',', '  "series": ['];
  cat.series.forEach((s, i) => out.push('    ' + compact(s) + (i < cat.series.length - 1 ? ',' : '')));
  out.push('  ],', '  "videos": [');
  cat.videos.forEach((v, i) => out.push('    ' + compact(v) + (i < cat.videos.length - 1 ? ',' : '')));
  out.push('  ]', '}');
  fs.writeFileSync(CAT, out.join('\n') + '\n');
}
function regenerate(cat = load()) { fs.writeFileSync(INDEX, render(cat)); return syncSeries(cat, true); }
// 视频所在的系列；独立视频返回 null
function seriesOf(cat, videoDir) { if (!Array.isArray(cat.videos)) return null; const slug = path.basename(path.resolve(videoDir)), v = cat.videos.find((x) => x.slug === slug); return v && v.series ? cat.series.find((s) => s.slug === v.series) || null : null; }
module.exports = { DEFAULT_LANGS, STANDALONE, groupOf, dirOf, load, save, entries, validate, render, regenerate, syncSeries, seriesOf, creditProblems, makers, CAT, INDEX, STATUS, STAGES, SLUG };
if (require.main === module) {
  const cat = load(), errs = validate(cat), check = process.argv.includes('--check');
  if (errs.length) { console.error('片单有问题：\n  ' + errs.join('\n  ')); process.exit(1); }
  const md = render(cat), cur = fs.existsSync(INDEX) ? fs.readFileSync(INDEX, 'utf8') : '';
  if (check) { const stale = syncSeries(cat, false); if (cur !== md || stale.length) { console.error('生成物与源头不一致：' + [...(cur !== md ? ['videos/README.md'] : []), ...stale].join(' ') + '。运行 node kit/tools/catalog.js'); process.exit(1); } console.log('片单一致'); }
  else { const stale = regenerate(cat); const all = entries(cat); console.log(`videos/README.md 已更新：${cat.series.length} 个系列，${all.length} 部视频（已成片 ${all.filter((e) => e.status === 'delivered').length}）` + (stale.length ? `；系列说明更新 ${stale.length} 份` : '')); }
}
