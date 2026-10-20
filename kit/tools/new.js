// 新建一部视频：从 kit/template 生成骨架，拷入引擎的一份快照，登记到片单。
// 用法：node kit/tools/new.js <slug>                     独立视频
//       node kit/tools/new.js <slug> --series <系列>      系列里的一集
//   片单（videos/catalog.json）里已有这一条时，标题与语言取自片单；没有时用下面的参数登记：
//       --title "中文标题"  [--title-en "English title"]  [--langs zh,en]  [--series-title "系列的中文名"]（系列不存在时）
// 目录一律是 videos/<slug>/，slug 全仓库唯一，用小写字母、数字、连字符。
// 语言：片单条目的 languages ＞ 系列的 languages ＞ 中文与英文。--langs zh 只做中文（与系列缺省不同时记在条目上）。
// 系列里的一集另外做两件事（见 docs/guides/series.md）：
//   系列带有建议栏目（sections）时，按栏目生成章节草稿；系列指定了起点（starter）时，把 kit/starters/<起点>/ 盖在模板之上。
//   起点里的样式与配乐只是能跑的占位，正式制作时按本片的对象重新设计（经验规则 F21）；check.js 会提示原样未改的文件。
// 引擎文件（engine.js、util.js、boot.js、base.css）是拷进视频目录的快照：之后工具包怎么改，都不影响已经做完的片子。
// 策划、校对者与源码仓库取 kit/studio.json；参与的模型在制作中如实补进 project.json 的 credits（docs/roles.md 第 5 节）。
// --scratch：生成到 out/sandbox/<slug>，不改片单，供首次练习与模板验证。
const fs = require('fs'), path = require('path');
const { parseArgs } = require('node:util');
const catalog = require('./catalog');
const lessons = require('./lessons');
const REPO = path.resolve(__dirname, '..', '..'), KIT = path.join(REPO, 'kit');
let parsed;
try { parsed = parseArgs({ allowPositionals: true, options: Object.fromEntries(['title', 'title-en', 'langs', 'series', 'series-title'].map((key) => [key, { type: 'string' }]).concat([['scratch', { type: 'boolean' }], ['help', { type: 'boolean' }]])) }); }
catch (error) { console.error(error.message); process.exit(2); }
const opt = (key, fallback) => parsed.values[key] ?? fallback, scratch = !!opt('scratch');
const usage = 'node kit/tools/new.js <slug> [--series <系列>] [--title 标题 --title-en "English title" --langs zh,en --series-title 系列名] [--scratch]';
if (opt('help')) { console.log(usage + '\n  策划、校对者与仓库取 kit/studio.json；--scratch 写入 out/sandbox/<slug>，不改片单。'); process.exit(0); }
if (parsed.positionals.length !== 1) { console.error('须提供且只提供一个 slug。用法：' + usage); process.exit(2); }
const slug = parsed.positionals[0].replace(/\\/g, '/').replace(/^videos\//, '').replace(/\/$/, '');
if (/^(standalone|series)\//.test(slug)) { console.error('目录已拍平：写 slug 本身，系列用 --series。用法：' + usage); process.exit(2); }
if (!catalog.SLUG.test(slug)) { console.error('slug 只能用小写字母、数字、连字符：' + slug); process.exit(2); }
const seriesSlug = opt('series') || null, relative = scratch ? 'out/sandbox/' + slug : 'videos/' + slug, dir = path.join(REPO, relative);
if (scratch && seriesSlug) { console.error('--scratch 不用于系列分集'); process.exit(2); }
require('./project-files').noLinks(dir);
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`目录已存在且不为空：${relative}`); process.exit(1); }
const studio = JSON.parse(fs.readFileSync(path.join(KIT, 'studio.json'), 'utf8'));
if (![studio.planner, studio.reviewer].every((value) => typeof value === 'string' && value.trim()) || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(studio.repository || '')) { console.error('kit/studio.json 须填写 planner、reviewer 与公开的 GitHub repository 地址'); process.exit(2); }

// ── 片单 ──
const cat = scratch ? { about: '', series: [], videos: [] } : catalog.load();
if (!scratch) { const errors = catalog.validate(cat); if (errors.length) { console.error('现有片单有错误，未新建：\n' + errors.join('\n')); process.exit(1); } }
let entry = cat.videos.find((v) => v.slug === slug);
if (entry && entry.series && seriesSlug && entry.series !== seriesSlug) { console.error(`片单里 ${slug} 属于系列 ${entry.series}，不是 ${seriesSlug}`); process.exit(1); }
const wantSeries = seriesSlug || (entry && entry.series) || null;
let series = null;
if (wantSeries) {
  series = cat.series.find((s) => s.slug === wantSeries);
  if (!series) { const st = opt('series-title'); if (!st) { console.error(`片单里没有系列 ${wantSeries}。新系列要给出中文名：--series-title "…"`); process.exit(1); } series = { slug: wantSeries, title: { zh: st } }; cat.series.push(series); }
}
if (!entry) { const t = opt('title'); if (!t) { console.error(`片单里没有 ${slug}。新条目要给出标题：--title "…"`); process.exit(1); } entry = { slug, ...(series ? { series: series.slug } : {}), title: { zh: t } }; cat.videos.push(entry); }
if (opt('title')) entry.title.zh = opt('title');
if (opt('title-en')) entry.title.en = opt('title-en');
const seriesLangs = (series && series.languages) || catalog.DEFAULT_LANGS;
if (opt('langs')) { entry.languages = opt('langs').split(','); if (entry.languages.join() === seriesLangs.join()) delete entry.languages; }   // 与系列缺省相同就不写，由系列继承
const langs = entry.languages || seriesLangs;
if (!langs.length || new Set(langs).size !== langs.length || langs.some((lang) => !['zh', 'en'].includes(lang))) { console.error('当前模板支持 zh、en，语言不能重复；扩展其他语言需先适配模板。'); process.exit(2); }
entry.status = 'in-progress';
const starterDir = series && series.starter ? path.join(KIT, 'starters', series.starter) : null;
// 起点只带可复用的骨架：src/、project.json（阈值与占位符）、tools/、README.md 说明。校对、确认与事实记录属于某一集的历史，不许进起点。
const STARTER_ALLOWED = ['src', 'tools', 'README.md', 'project.json'];
if (starterDir) {
  if (!fs.existsSync(starterDir)) { console.error(`系列 ${series.slug} 的起点 kit/starters/${series.starter}/ 不存在`); process.exit(1); }
  require('./project-files').noLinks(starterDir);
  const stray = fs.readdirSync(starterDir).filter((name) => !STARTER_ALLOWED.includes(name));
  if (stray.length) { console.error(`起点只放 ${STARTER_ALLOWED.join('、')}，不能带某一集的配置、校对或事实记录；多出：${stray.join('、')}`); process.exit(2); }
}

// ── 骨架 ──
const VOICES = { zh: 'zh-CN-YunyangNeural', en: 'en-US-AndrewNeural' }, PROMPTS = { zh: '以下是普通话的讲解。', en: 'A narration.' };
const obj = (f) => '{ ' + langs.map((l) => `${JSON.stringify(l)}: ${JSON.stringify(f(l))}`).join(', ') + ' }';
const rules = lessons.registry();
const vars = {
  SLUG: slug, TITLE: entry.title.zh, TITLE_HTML: entry.title.zh.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'), PATH: relative,
  PLANNER: studio.planner, REVIEWER: studio.reviewer, REPOSITORY: studio.repository, REPOSITORY_DISPLAY: studio.repository.replace(/^https:\/\//, '').replace(/\/$/, ''),
  LESSONS_VERSION: rules.version, LESSONS_STATE_JSON: JSON.stringify(lessons.initial(rules), null, 2),
  SERIES_LINE: series ? `系列：[${series.title.zh}](../../series/${series.slug}.md)。只遵守系列说明里写明的共同约定，其余按本片的对象设计。` : '独立视频。',
  LANGS_JSON: JSON.stringify(langs).replace(/,/g, ', '),
  TITLES_JSON: obj((l) => entry.title[l] || (l === 'zh' ? entry.title.zh : '')),
  VOICES_JSON: obj((l) => VOICES[l] || ''), RATES_JSON: obj(() => '+0%'), PROMPTS_JSON: obj((l) => PROMPTS[l] || ''),
  LANGS: langs.join('、'), LANG1: langs[0],
  TIMING_TAGS: langs.map((l) => `<script src="js/timing.${l}.js"></script>`).join('\n'),
};
const copyOne = (src, dst) => {
  if (fs.lstatSync(src).isSymbolicLink()) throw new Error('模板或起点不能包含符号链接：' + path.basename(src));
  if (/\.(js|css|html|md|json|txt|yml|yaml)$/.test(src)) fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace(/\{\{([A-Z0-9_]+)\}\}/g, (x, k) => (vars[k] != null ? vars[k] : x)));
  else fs.copyFileSync(src, dst);
};
const copy = (src, dst) => {
  for (const n of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, n.name), b = path.join(dst, n.name);
    if (n.isSymbolicLink()) throw new Error('模板或起点不能包含符号链接：' + n.name);
    if (n.isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); }
    else copyOne(a, b);
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
    fs.writeFileSync(path.join(dir, 'src', 'js', 'scenes', f), `// 第 ${two(i + 1)} 章：${sec.zh}。TODO: 按系列的建议栏目生成的章节草稿，换成本片的内容；不需要这一栏就连同脚本里的这一章一起删掉。\nscene('${sec.id}', ({ root, s, c0 }) => {\n  const world = h('div', 'world', root);\n  const cam = makeCamera(world);\n  const head = h('div', 'abs d-2', world, tr(${q(sec.zh)}, ${q(sec.en || sec.zh)})); px(head, 120, 160);\n  wipe(head, c0 + 0.1, { dir: 'l' });\n  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[c0 + 0.1, { z: 1.04 }, s.end - c0 - 0.2, { ease: 'none', sfx: false }]]);\n});\n`);
    return `<script src="js/scenes/${f}"></script>`; }).join('\n');
  const html = path.join(dir, 'src', 'index.html');
  fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('<script src="js/scenes/s1_demo.js"></script>', tags));
} else script = script.replace(/    \/\/ <\/?chapters>\n/g, '');
fs.writeFileSync(scriptFile, script);
if (starterDir) {
  // 先铺 src/，再铺 project.json（带占位符，走同一套替换）与 tools/：起点的 project.json 覆盖模板的，系列的语速、阈值与配乐脚本随之带来，随后再补本片的身份字段。
  for (const name of ['src', 'project.json', 'tools']) {
    const from = path.join(starterDir, name);
    if (!fs.existsSync(from)) continue;
    const to = path.join(dir, name);
    if (fs.statSync(from).isDirectory()) { fs.mkdirSync(to, { recursive: true }); copy(from, to); }
    else copyOne(from, to);
  }
  console.log(`已套用系列起点 kit/starters/${series.starter}/（样式与配乐是占位，按本片的对象重做）`);
}
const projectFile = path.join(dir, 'project.json'), project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
delete project.production; delete project.feedback;
Object.assign(project, { slug, languages: langs, layout: 2, stage: 'brief', next: '写简报（受众、核心问题、时长），开始取证' });
project.credits = { planner: studio.planner, models: [], services: [], repository: studio.repository };
project.review = { required: true, reviewer: studio.reviewer };
fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');
if (!langs.includes('en')) console.log('提示：模板的脚本与场景是按中英双语写的；只做一种语言时，把 script.js 里的 { zh, en } 改成字符串即可。');

// ── 落盘片单 ──
if (!scratch) {
  const errs = catalog.validate(cat);
  if (errs.length) { console.error('片单核对未通过（骨架保留，片单未改）：\n  ' + errs.join('\n  ')); process.exit(1); }
  catalog.save(cat);
  catalog.regenerate(catalog.load());
}
console.log(`已建立 ${relative}（语言：${langs.join(', ')}）${scratch ? '，练习目录不登记片单' : '并登记到片单'}。接下来：
  1. 读 docs/roles.md 与 docs/process.md；在本片 README 写「简报」${series ? `\n     本片属于系列「${series.title.zh}」：读 series/${series.slug}.md 的共同约定` : ''}
  2. 取证写 research/FACTS.md；写 src/js/script.js，导出校对稿：node kit/tools/script-review.js ${relative} export
     交 ${studio.reviewer} 人工审查，依据真实确认填写 review/approval.json；确认后才能配音
  3. 每个阶段开工前：node kit/tools/lessons.js show --stage <阶段>`);
