// 新建一部视频：从 kit/template 生成骨架，拷入引擎的一份快照，登记到片单。
// 用法：node kit/tools/new.js standalone/<视频>                 独立视频
//       node kit/tools/new.js series/<系列>/<视频>              系列里的一集
//   片单（videos/catalog.json）里已有这一条时，标题与语言取自片单；没有时用下面的参数登记：
//       --title "中文标题"  [--title-en "English title"]  [--langs zh,en]  [--series-title "系列的中文名"]（系列不存在时）
//   制作方式（见 docs/workflow.md、docs/delegation.md）：
//       缺省是自制：从取证到成片由同一个制作者完成。--maker "<制作者>" 记下是谁
//       --delegate "<受托模型>"：委托制作。另外生成任务入口 AGENTS.md 与任务书 brief/ 的骨架，由准备方填写后交给受托模型
// 语言缺省为中文与英文两种（--langs zh 表示只做中文）。slug 用小写字母、数字、连字符。
// 系列里的一集另外做两件事（见 docs/series.md）：
//   片单里该系列带有建议栏目（sections）时，按栏目生成章节草稿（脚本里每栏一章、每章一个场景文件），之后可随题目增删调整；
//   系列目录下有系列基座 _base/ 时，把它盖在模板之上（系列共用的样式、部件、章节卡、封面版式）。
// 引擎文件（engine.js、util.js、boot.js、base.css）是拷进视频目录的快照：之后工具包怎么改，都不影响已经做完的片子。
// --scratch：生成到 out/sandbox/<视频>，不改片单，供首次练习与模板验证。
const fs = require('fs'), path = require('path');
const { parseArgs } = require('node:util');
const { load, validate, render, syncSeries, CAT, DOC } = require('./catalog');
const REPO = path.resolve(__dirname, '..', '..'), KIT = path.join(REPO, 'kit');
const feedback = require('./feedback'), feedbackRules = feedback.registry();
let parsed;
try { parsed = parseArgs({ allowPositionals: true, options: Object.fromEntries(['title', 'title-en', 'langs', 'series-title', 'maker', 'delegate'].map(key => [key, { type: 'string' }]).concat([['scratch', { type: 'boolean' }], ['help', { type: 'boolean' }]])) }); }
catch (error) { console.error(error.message); process.exit(2); }
const opt = (key, fallback) => parsed.values[key] ?? fallback, scratch = !!opt('scratch');
if (opt('help')) { console.log('node kit/tools/new.js standalone/<slug> | series/<series>/<slug>\n  --title 标题 --title-en "English title" --langs zh,en --maker 模型 --delegate 模型 --series-title 系列名\n  --scratch：写入 out/sandbox/<slug>，不改片单。策划、校对者与仓库取 kit/studio.json。'); process.exit(0); }
const where = (parsed.positionals[0] || '').replace(/\\/g, '/').replace(/^videos\//, '').replace(/\/$/, '');
const slugPattern = '[a-z0-9]+(?:-[a-z0-9]+)*';
const m = where.match(new RegExp(`^(?:standalone/(${slugPattern})|series/(${slugPattern})/(${slugPattern}))$`));
if (parsed.positionals.length !== 1) { console.error('须提供且只提供一个视频位置'); process.exit(2); }
if (!m) { console.error('用法：node kit/tools/new.js standalone/<视频>   或   node kit/tools/new.js series/<系列>/<视频>   [--title … --title-en … --langs zh,en]'); process.exit(2); }
const seriesSlug = m[2] || null, slug = m[1] || m[3], relative = scratch ? 'out/sandbox/' + slug : 'videos/' + where, dir = path.join(REPO, relative);
if (scratch && seriesSlug) { console.error('--scratch 只用于 standalone/<slug>'); process.exit(2); }
require('./project-files').noLinks(dir);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`目录已存在且不为空：${relative}`); process.exit(1); }
const studio = JSON.parse(fs.readFileSync(path.join(KIT, 'studio.json'), 'utf8'));
if (![studio.planner, studio.reviewer].every(value => typeof value === 'string' && value.trim()) || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(studio.repository || '')) { console.error('kit/studio.json 须填写 planner、reviewer 与公开的 GitHub repository 地址'); process.exit(2); }

// ── 片单 ──
const cat = scratch ? { about: '', series: [], standalone: [] } : load();
if (!scratch) { const errors = validate(cat); if (errors.length) { console.error('现有片单有错误，未新建：\n' + errors.join('\n')); process.exit(1); } }
let series = null;
if (seriesSlug) {
  series = cat.series.find((s) => s.slug === seriesSlug);
  if (!series) { const st = opt('series-title'); if (!st) { console.error(`片单里没有系列 ${seriesSlug}。新系列要给出中文名：--series-title "…"`); process.exit(1); } series = { slug: seriesSlug, title: { zh: st }, videos: [] }; cat.series.push(series); }
}
const list = series ? series.videos : cat.standalone;
let entry = list.find((v) => v.slug === slug);
if (!entry) { const t = opt('title'); if (!t) { console.error(`片单里没有 ${where}。新条目要给出标题：--title "…"`); process.exit(1); } entry = { slug, title: { zh: t } }; list.push(entry); }
if (opt('title')) entry.title.zh = opt('title');
if (opt('title-en')) entry.title.en = opt('title-en');
if (opt('langs')) entry.languages = opt('langs').split(',');
const langs = entry.languages || ['zh', 'en'];
if (!langs.length || new Set(langs).size !== langs.length || langs.some(lang => !['zh', 'en'].includes(lang))) { console.error('当前模板支持 zh、en，语言不能重复；扩展其他语言需先适配模板。'); process.exit(2); }
entry.status = 'in-progress';
const delegated = opt('delegate') != null || entry.mode === 'delegated';
const production = delegated ? { mode: 'delegated', maker: opt('delegate') || entry.maker || '', prepared_by: opt('maker') || '' } : { mode: 'self', maker: opt('maker') || entry.maker || '' };
Object.assign(production, { planner: studio.planner, repository: studio.repository });
for (const k of Object.keys(production)) if (!production[k]) delete production[k];
if (delegated) { entry.mode = 'delegated'; if (production.maker) entry.maker = production.maker; }
if (series?.sections) {
  const seen = new Set(['open']);
  for (const section of series.sections) {
    if (!/^[a-z][a-z0-9_-]*$/.test(section.id) || seen.has(section.id) || typeof section.zh !== 'string' || !section.zh.trim()) { console.error('系列栏目须有唯一且安全的 id 和中文标题，不能使用 open'); process.exit(2); }
    seen.add(section.id);
  }
}
const baseDir = series ? path.join(REPO, 'videos', 'series', series.slug, '_base') : null;
if (baseDir && fs.existsSync(baseDir)) {
  require('./project-files').noLinks(baseDir);
  if (fs.readdirSync(baseDir).some(name => !['src', 'README.md'].includes(name))) { console.error('系列基座只放 src/ 与说明 README.md，不能复用上一集的配置、校对或事实记录'); process.exit(2); }
}

// ── 骨架 ──
const VOICES = { zh: 'zh-CN-YunyangNeural', en: 'en-US-AndrewNeural' }, PROMPTS = { zh: '以下是普通话的讲解。', en: 'A narration.' };
const obj = (f) => '{ ' + langs.map((l) => `${JSON.stringify(l)}: ${JSON.stringify(f(l))}`).join(', ') + ' }';
const vars = {
  SLUG: slug, TITLE: entry.title.zh, TITLE_HTML: entry.title.zh.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'), PATH: relative,
  PLANNER: studio.planner, REVIEWER: studio.reviewer, REPOSITORY: studio.repository, REPOSITORY_DISPLAY: studio.repository.replace(/^https:\/\//, ''),
  REVIEW_JSON: JSON.stringify({ required: true, reviewer: studio.reviewer }),
  FEEDBACK_VERSION: feedbackRules.version,
  FEEDBACK_STATE_JSON: JSON.stringify(feedback.initial(feedbackRules), null, 2),
  FEEDBACK_START_ROWS: feedbackRules.rules.map(rule => `| ${rule.id} ${rule.title} | | ${rule.plan} | ${rule.verify} |`).join('\n'),
  FEEDBACK_END_ROWS: feedbackRules.rules.map(rule => `| ${rule.id} | | | |`).join('\n'),
  LANGS_JSON: JSON.stringify(langs).replace(/,/g, ', '),
  TITLES_JSON: obj((l) => entry.title[l] || (l === 'zh' ? entry.title.zh : '')),
  VOICES_JSON: obj((l) => VOICES[l] || ''), RATES_JSON: obj(() => '+0%'), PROMPTS_JSON: obj((l) => PROMPTS[l] || ''),
  PRODUCTION_JSON: '{ ' + Object.keys(production).map((k) => `${JSON.stringify(k)}: ${JSON.stringify(production[k])}`).join(', ') + ' }',
  MAKER: production.maker || '受托模型', LANGS: langs.join('、'), LANG1: langs[0],
  TIMING_TAGS: langs.map((l) => `<script src="js/timing.${l}.js"></script>`).join('\n'),
};
const copy = (src, dst) => {
  for (const n of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, n.name), b = path.join(dst, n.name);
    if (n.isSymbolicLink()) throw new Error('模板或基座不能包含符号链接：' + n.name);
    if (n.isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); }
    else if (/\.(js|css|html|md|json|txt|yml|yaml)$/.test(n.name)) fs.writeFileSync(b, fs.readFileSync(a, 'utf8').replace(/\{\{([A-Z0-9_]+)\}\}/g, (x, k) => (vars[k] != null ? vars[k] : x)));
    else fs.copyFileSync(a, b);
  }
};
fs.mkdirSync(dir, { recursive: true });
copy(path.join(KIT, 'template'), dir);
for (const [f, to] of [['engine.js', 'src/js'], ['util.js', 'src/js'], ['boot.js', 'src/js'], ['base.css', 'src/css']]) fs.copyFileSync(path.join(KIT, 'engine', f), path.join(dir, to, f));
for (const l of langs) fs.writeFileSync(path.join(dir, 'src', 'js', `timing.${l}.js`), `// 由 kit/tools/tts.js 生成：每句旁白的实测时长与词边界。还没有合成时是空的，时间线按字数估算。\nwindow.DUR_ALL = window.DUR_ALL || {};\nwindow.DUR_ALL[${JSON.stringify(l)}] = {};\nwindow.DUR = window.DUR || window.DUR_ALL[${JSON.stringify(l)}];\n`);
const scriptFile = path.join(dir, 'src', 'js', 'script.js');
let script = fs.readFileSync(scriptFile, 'utf8');
if (series && series.sections && series.sections.length) {
  // 按系列的建议栏目生成章节草稿：脚本里每栏一章，每章一个场景文件
  const two = (n) => String(n).padStart(2, '0'), q = (x) => JSON.stringify(x);
  const chapters = series.sections.map((sec, i) => { const k = i < 26 ? String.fromCharCode(97 + i) : 'chapter' + (i + 1) + '_';
    return `    {\n      id: ${q(sec.id)}, chap: ['${two(i + 1)}', { zh: ${q(sec.zh)}, en: ${q(sec.en || sec.zh)} }], lead: 2.3, tail: 0.6,\n      cues: [\n        ['${k}1', { zh: ${q('「' + sec.zh + '」的第一句旁白')}, en: 'First line of this chapter.' }, { gap: 0.4 }],\n      ],\n    },\n`; }).join('');
  script = script.replace(/    \/\/ <chapters>\n[\s\S]*?    \/\/ <\/chapters>\n/, chapters);
  fs.rmSync(path.join(dir, 'src', 'js', 'scenes', 's1_demo.js'));
  const tags = series.sections.map((sec, i) => { const f = `s${i + 1}_${sec.id}.js`;
    fs.writeFileSync(path.join(dir, 'src', 'js', 'scenes', f), `// 第 ${two(i + 1)} 章：${sec.zh}。TODO: 按系列的建议栏目生成的章节草稿，换成本片的内容；不需要这一栏就连同脚本里的这一章一起删掉。\nscene('${sec.id}', ({ root, s, c0 }) => {\n  const world = h('div', 'world', root);\n  const cam = makeCamera(world);\n  const head = h('div', 'abs d-2', world, tr(${q(sec.zh)}, ${q(sec.en || sec.zh)})); px(head, 120, 160);\n  wipe(head, c0 + 0.1, { dir: 'l' }); sfx('whoosh', c0 + 0.1, { g: 0.5 });\n  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[c0 + 0.1, { z: 1.04 }, s.end - c0 - 0.2, { ease: 'none', sfx: false }]]);\n});\n`);
    return `<script src="js/scenes/${f}"></script>`; }).join('\n');
  const html = path.join(dir, 'src', 'index.html');
  fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('<script src="js/scenes/s1_demo.js"></script>', tags));
} else script = script.replace(/    \/\/ <\/?chapters>\n/g, '');
fs.writeFileSync(scriptFile, script);
if (baseDir && fs.existsSync(path.join(baseDir, 'src'))) { copy(path.join(baseDir, 'src'), path.join(dir, 'src')); console.log(`已套用系列基座 videos/series/${series.slug}/_base/src/`); }
const projectFile = path.join(dir, 'project.json'), project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
project.production = production; project.review = { required: true, reviewer: studio.reviewer };
project.feedback = { required: true };
fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');
if (delegated) { copy(path.join(KIT, 'delegation'), dir); for (const l of langs) fs.writeFileSync(path.join(dir, `expect.${l}.json`), '{\n}\n'); }
if (!langs.includes('en')) console.log('提示：模板的脚本与场景是按中英双语写的；只做一种语言时，把 script.js 里的 { zh, en } 改成字符串即可。');

// ── 落盘片单 ──
if (!scratch) {
const errs = validate(cat);
if (errs.length) { console.error('片单核对未通过（骨架保留，片单未改）：\n  ' + errs.join('\n  ')); process.exit(1); }
// 保持「每个视频一行」的写法
const compact = (v) => (Array.isArray(v) ? '[' + v.map(compact).join(', ') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).map((k) => JSON.stringify(k) + ': ' + compact(v[k])).join(', ') + '}' : JSON.stringify(v));
const line = (v, pad, last) => pad + compact(v) + (last ? '' : ',');
const out = ['{', '  "about": ' + JSON.stringify(cat.about) + ',', '  "series": ['];
cat.series.forEach((s, i) => {
  out.push('    {');
  for (const k of Object.keys(s)) if (k !== 'videos') out.push(`      ${JSON.stringify(k)}: ${compact(s[k])},`);
  if (s.videos.length) { out.push('      "videos": ['); s.videos.forEach((v, j) => out.push(line(v, '        ', j === s.videos.length - 1))); out.push('      ]'); } else out.push('      "videos": []');
  out.push('    }' + (i < cat.series.length - 1 ? ',' : ''));
});
out.push('  ],', '  "standalone": ['); cat.standalone.forEach((v, j) => out.push(line(v, '    ', j === cat.standalone.length - 1))); out.push('  ]', '}');
fs.writeFileSync(CAT, out.join('\n') + '\n');
if (!errs.length) { fs.writeFileSync(DOC, render(load())); syncSeries(load(), true); }
}
console.log(`已建立 ${relative}（语言：${langs.join(', ')}）${scratch ? '，练习目录不登记片单' : '并登记到片单'}。接下来：
  1. 读 docs/workflow.md，填写本片 README 的开工反馈应用、research/FACTS.md 与 review/NOTES.md${series ? `\n     本片属于系列「${series.title.zh}」：先读 videos/series/${series.slug}/README.md 的连续性约定` : ''}
  2. 写 src/js/script.js，导出校对稿：node kit/tools/script-review.js ${relative} export
     交 ${studio.reviewer} 人工审查，依据真实确认填写 review/approval.json；通过 check 后再运行 tts.js
  3. 看画面：node kit/tools/look.js ${relative} o1    总闸门：node kit/tools/check.js ${relative}${delegated ? `
  委托制作：准备方先做完取证、旁白与视觉系统，再填写 ${relative}/AGENTS.md 与 brief/（做法见 docs/delegation.md），然后交给受托模型` : ''}`);
