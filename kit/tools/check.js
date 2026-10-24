// 总闸门：一条命令跑完全部自动检查，逐项给出 通过 / 不通过。任何一项不通过都不能交付。
// 用法：node kit/tools/check.js <视频>            制作期：源码规则、场景齐全、时长节奏、全片扫描（scan.js）、音效覆盖
//       node kit/tools/check.js <视频> --final    交付前：再加成片、响度、静止段、空画面、封面、是否过期
//       node kit/tools/check.js <视频> --handoff  准备方交给制作方之前：事实、确认有效的文案、简报与交接说明是否齐备（docs/process.md 第 4 节）
//       --lang en 只查一种语言（缺省查 project.json 里的全部语言）
// 各项的含义、阈值与处理办法见 docs/guides/acceptance.md；阈值与风格规则在 project.json 的 check 段，写法见 docs/reference/tools.md。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, VIDEO, ARGS, arg, flag, LANGS: selectLanguages, layout, loadedSources, sourceState, startServer, openPage, dirs, mmss, path, fs } = require('./lib');
needVideo();
require('./project-files').acquireLock(needVideo());
const P = PROJECT(), C = P.check, LANGS = selectLanguages(true);
const rows = [];
const add = (name, ok, detail) => rows.push({ name, ok, detail: [].concat(detail || []) });
const read = (f) => fs.readFileSync(path.join(VIDEO, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(VIDEO, f));
if (flag('handoff') && flag('final')) { console.error('--handoff 与 --final 是不同阶段，不能同时使用'); process.exit(2); }
const credits = require('./credits');
const creditIssues = credits.problems(P, 'project.json', { final: flag('final') });
if (creditIssues.length) { console.error('✗ 署名登记：\n  ' + creditIssues.join('\n  ')); process.exit(1); }
if (flag('final')) add('署名登记', true, ['字段齐全；仍须对照本片参与记录和最终 MP4 核对，不能由工具推断漏登者。']);
else {
  const pending = credits.problems(P, 'project.json', { final: true });
  if (pending.length) rows.push({ name: '（署名待补，交付前须处理）', ok: true, detail: pending });
}

// ── 交接检查（--handoff）：准备方交给制作方之前 ──
if (flag('handoff')) {
  const readme = exists('README.md') ? read('README.md') : '';
  const section = (name) => { const lines = readme.split(/\r?\n/), i = lines.findIndex((l) => l.trim() === '## ' + name); if (i < 0) return null; const j = lines.findIndex((l, k) => k > i && /^## /.test(l)); return lines.slice(i + 1, j < 0 ? undefined : j).join('\n').replace(/<!--[\s\S]*?-->/g, '').trim(); };
  const mat = [];
  const facts = exists('research/FACTS.md') ? read('research/FACTS.md').replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```/g, '') : '';
  if (P.layout >= 2) {
    // 查事实表是否真的填写，不用字数冒充取证质量；事实是否成立仍由逐项复核决定。
    let columns = null, count = 0;
    const filled = (x) => typeof x === 'string' && !!x.trim() && !/^(待填|TODO|—|-|\.{3})$/i.test(x.trim());
    for (const line of facts.split(/\r?\n/)) {
      if (!line.trim().startsWith('|')) { columns = null; continue; }
      const cells = line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((x) => x.trim());
      const claim = cells.findIndex((x) => /陈述/.test(x)), source = cells.findIndex((x) => /出处|依据/.test(x)), status = cells.findIndex((x) => /核查|状态/.test(x));
      if (claim >= 0 && source >= 0 && status >= 0) { columns = { claim, source, status }; continue; }
      if (columns && filled(cells[columns.claim]) && filled(cells[columns.source]) && /已核|已验证|verified/i.test(cells[columns.status] || '')) count++;
    }
    if (!count) mat.push('research/FACTS.md 没有已填写的事实记录：按模板列出陈述、可定位的出处与核查状态；模板说明和字数不算证据');
  } else if (facts.length < 800) mat.push('research/FACTS.md 不存在或旧格式记录内容过少：取证要在交接之前做完');
  if (!C.duration) mat.push('project.json 的 check.duration 未设：给出总长的允许范围');
  add('取证与约束', !mat.length, mat);
  const br = [];
  if (P.layout >= 2) {
    const brief = section('简报');
    if (!brief || /核心问题：\s*$/m.test(brief)) br.push('README 的「简报」没有写完：至少写明核心问题、逐章答案、时长与语言');
    if (!section('交接')) br.push('README 的「交接」是空的：写明做完了什么、在哪里、还有什么没解决');
  } else if (!exists('brief/01-mission.md') && !section('简报')) br.push('缺少简报：旧片在 brief/01-mission.md，新片写在 README 的「简报」');
  add('简报与交接说明', !br.length, br);
  const sr = require('./script-review'), first = sr.status(VIDEO, P, [P.languages[0]]);
  add(`文案确认（${P.languages[0]}）`, first.ok, first.problems);
  if (P.languages.length > 1) { const rest = sr.status(VIDEO, P, P.languages.slice(1)); if (!rest.ok) rows.push({ name: '（其他语言尚未确认：可由制作方接着翻译、交审）', ok: true, detail: rest.problems }); }
  console.log('');
  for (const x of rows) { console.log(`${x.ok ? '✓ 通过  ' : '✗ 不通过'}  ${x.name}`); for (const d of x.detail) console.log('      ' + d); }
  const bad = rows.filter((x) => !x.ok).length;
  console.log(`\n${bad ? `结论：有 ${bad} 项不通过，补齐后再交接` : '结论：可以交接。制作方从本片 README 的「简报」「交接」读起'}`);
  process.exit(bad ? 1 : 0);
}

const review = require('./script-review').status(VIDEO, P, LANGS);
if (!review.ok) { console.error('✗ 文案校对：\n  ' + review.problems.join('\n  ')); process.exit(1); }
add('文案校对', true, review.legacy ? review.details : ['人工记录与当前内容一致；确认真实性按 docs/guides/script-review.md 核对。']);
// 经验规则：制作期只提示记录是否跟上当前规则；交付前每条都要有结论（docs/lessons.md）
const lessonState = require('./lessons').status(VIDEO, P, { final: flag('final') });
if (flag('final')) {
  if (!lessonState.ok) { console.error('✗ 经验规则复核（review/lessons.json）：\n  ' + lessonState.problems.join('\n  ') + '\n逐条写结论，再运行 node kit/tools/lessons.js <视频> check --final'); process.exit(1); }
  add('经验规则复核', true, lessonState.legacy ? ['旧项目没有复核记录。'] : lessonState.open.length ? ['以下记为 open，交付时写进 README「交付」：', ...lessonState.open] : ['每条规则都有结论；结论是否属实，按实际看、听的范围判断。']);
} else if (!lessonState.ok) rows.push({ name: '（经验规则复核记录的提示，交付前须处理）', ok: true, detail: lessonState.problems });

// ── 1 源码规则 ──
// 通用规则保证「画面只由 t 决定」，对所有视频恒开；风格规则由 check.style 按本片的视觉系统开关。
// 确有理由的一行，在行尾写注释 lint-ok: <原因> 即可豁免。
const RULES = [
  [/\btransition\s*:|\banimation(-name)?\s*:|@keyframes/, '不能用 CSS transition / animation（画面必须由 t 决定，用引擎的补间）'],
  [/setTimeout|setInterval|requestAnimationFrame|Date\.now|new Date\(|performance\.now/, '不能用定时器或系统时间'],
  [/\btl\.call\(|\.eventCallback\(|onComplete\s*:|onStart\s*:|onUpdate\s*:/, '不能用时间线回调（跳到任意时刻时不会按顺序触发）；用 F()、keyed()、classAt()'],
  [/Math\.random/, '不能用未固定种子的随机数（用 util.js 的 seeded(种子)）'],
];
const S = C.style || {};
if (S.flat) RULES.push([/box-shadow|boxShadow|text-shadow|textShadow|drop-shadow/, '本片不用阴影（平涂）'], [/gradient\(/, '本片不用渐变（平涂）'], [/blur\(|backdrop-filter|backdropFilter/, '本片不用模糊滤镜']);
if (S.no_radius) RULES.push([/border-radius\s*:(?!\s*50%)|borderRadius\s*:\s*['"`]?(?!\s*50%)/, '本片不用圆角（圆形 50% 除外）']);
if (S.palette) RULES.push([/rgba?\(|hsla?\(/, '颜色只用样式表里的变量，不写 rgb()/rgba()/hsl()']);
if (S.fonts) RULES.push([/Arial|Helvetica|sans-serif|monospace|Microsoft|PingFang|system-ui|SimHei|SimSun|Consolas|Segoe/, '字体只用 ' + S.fonts.map((f) => `"${f}"`).join(' / ') + '（系统字体与通用族名在不同机器上渲染结果不同）']);
if (S.no_emoji) RULES.push([/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u, '本片不用 emoji 与装饰符号']);
const PALETTE = (S.palette || []).map((c) => c.replace('#', '').toUpperCase());
const loaded = loadedSources(), lintFiles = [...loaded, ...(exists('src/cover.html') ? ['cover.html'] : [])];
const lint = [];
for (const f of lintFiles) {
  read('src/' + f).split(/\r?\n/).forEach((line, i) => {
    if (/lint-ok/.test(line)) return;
    const code = line.replace(/(^|[^:"'])\/\/.*$/, '$1').replace(/\/\*.*?\*\//g, '');
    for (const [re, why] of RULES) if (re.test(code)) lint.push(`src/${f}:${i + 1}  ${why}\n        ${line.trim().slice(0, 110)}`);
    if (PALETTE.length) for (const m of code.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) { const hx = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]; if (!PALETTE.includes(hx.toUpperCase())) lint.push(`src/${f}:${i + 1}  颜色 #${m[1]} 不在本片的调色板里（check.style.palette）\n        ${line.trim().slice(0, 110)}`); }
  });
}
add(`源码规则（${lintFiles.length} 个文件）`, !lint.length, lint.slice(0, 40).concat(lint.length > 40 ? [`…… 另有 ${lint.length - 40} 处`] : []));

// ── 2 场景齐全 ──
const first = layout(LANGS[0]);
const sceneSrc = loaded.filter((f) => /\.js$/.test(f)).map((f) => ({ f, src: read('src/' + f) }));
const st = [];
for (const sc of first.SCRIPT) {
  const hit = sceneSrc.find((x) => new RegExp(`scene\\(\\s*['"\`]${sc.id}['"\`]`).test(x.src));
  if (!hit) { st.push(`场景 ${sc.id} 没有实现：src/index.html 加载的脚本里没有 scene('${sc.id}', …)`); continue; }
  if (C.camera && !/makeCamera\(/.test(hit.src)) st.push(`src/${hit.f} 没有用镜头（makeCamera）：本片要求每个场景都建镜头（镜头可以不动，见 docs/guides/scenes.md 第 3 节）`);
}
for (const f of lintFiles) if (/TODO/.test(read('src/' + f))) st.push(`src/${f} 里还有 TODO（模板占位或未完成的部分）`);
add(`场景齐全（${first.SCRIPT.length} 个场景）`, !st.length, st);
// 系列的建议栏目：只提示，不判不通过（栏目是起点，每集可按题目增删调整）
{
  const cat = require('./catalog'), series = cat.seriesOf(cat.load(), VIDEO);
  if (series && series.sections) {
    const zh = layout(P.languages.includes('zh') ? 'zh' : LANGS[0]).SCRIPT.map((sc) => (sc.chap ? sc.chap[1] : null)).filter(Boolean);
    const want = series.sections.map((x) => x.zh), kept = want.filter((n) => zh.includes(n)), miss = want.filter((n) => !zh.includes(n));
    const order = zh.filter((n) => want.includes(n)), hints = [];
    if (miss.length) hints.push(`本集没有系列建议的栏目：${miss.join('、')}（有意省略时不必处理）`);
    if (order.join('|') !== kept.join('|')) hints.push(`保留的栏目先后与系列的约定不同：本集是 ${order.join(' → ')}，系列是 ${kept.join(' → ')}`);
    if (hints.length) rows.push({ name: `（系列「${series.title.zh}」的栏目提示，不计入通过与否）`, ok: true, detail: hints });
  }
}
// 每部片子自成一体（经验规则 F21）：样式表与配乐脚本和模板、系列起点或另一部片子完全相同，说明还没有为本片设计。
// 新版目录的片子在交付前不通过；其余只提示。
{
  const REPO = path.resolve(__dirname, '..', '..'), crypto = require('crypto');
  const sum = (f) => { try { return crypto.createHash('sha1').update(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); } catch (e) { return null; } };
  const others = (rel) => {
    const list = [[path.join(REPO, 'kit', 'template', rel), 'kit/template/' + rel]];
    const starters = path.join(REPO, 'kit', 'starters');
    if (fs.existsSync(starters)) for (const n of fs.readdirSync(starters)) list.push([path.join(starters, n, rel), `kit/starters/${n}/${rel}`]);
    for (const g of fs.readdirSync(path.join(REPO, 'videos'))) { const gd = path.join(REPO, 'videos', g); if (!fs.statSync(gd).isDirectory()) continue; for (const n of fs.readdirSync(gd)) if (path.join(gd, n) !== path.resolve(VIDEO)) list.push([path.join(gd, n, rel), `videos/${g}/${n}/${rel}`]); }
    return list;
  };
  const same = [];
  for (const rel of ['src/css/style.css', 'tools/music.py']) {
    const mine = sum(path.join(VIDEO, rel)); if (!mine) continue;
    const hit = others(rel).find(([f]) => sum(f) === mine);
    if (hit) same.push(`${rel} 与 ${hit[1]} 完全相同：按本片的对象重新设计（F21）`);
  }
  if (same.length) { if (flag('final') && P.layout >= 2) add('自成一体（F21）', false, same); else rows.push({ name: '（与模板、系列起点或其他片子雷同的提示，F21）', ok: true, detail: same }); }
}

// ── 3 时长与节奏 ──
const CAPW = { zh: 26, en: 44 }, tm = [], totals = {};
for (const lang of LANGS) {
  const { L, strip, measured } = layout(lang); totals[lang] = L.total;
  if (!measured) tm.push(`${lang}：还没有实测时长，先运行 node kit/tools/tts.js`);
  for (const p of L.problems || []) tm.push(`${lang}：${p}`);            // 脚本自己报的时间线问题（例如定长的片子里某一场的旁白超出了定点）
  const range = C.duration && (Array.isArray(C.duration) ? C.duration : C.duration[lang]);
  if (range && (L.total < range[0] || L.total > range[1])) tm.push(`${lang}：总长 ${L.total.toFixed(1)}s（${mmss(L.total)}）不在 ${range[0]}–${range[1]} 秒之间`);
  const cw = C.caption_width == null ? (CAPW[lang] != null ? CAPW[lang] : 44) : (typeof C.caption_width === 'object' ? C.caption_width[lang] : C.caption_width);
  const maxCue = C.max_cue_seconds == null ? 6 : +C.max_cue_seconds;
  const width = (s) => [...strip(s)].reduce((a, ch) => a + (ch.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);
  for (const id of L.order) { const c = L.cues[id]; if (c.silent) continue; if (cw && width(c.cap) > cw) tm.push(`${lang}：句 ${id} 字幕超过一行（${width(c.cap)} 字宽 > ${cw}）`); if (maxCue && c.d > maxCue) tm.push(`${lang}：句 ${id} 太长（${c.d.toFixed(1)}s > ${maxCue}s）`); }
}
add(`时长与节奏（${LANGS.map((l) => l + ' ' + mmss(totals[l])).join('，')}）`, !tm.length, tm);

(async () => {
  for (const lang of LANGS) {
    // ── 4 全片扫描 ──
    const r = spawnSync(process.execPath, [path.join(__dirname, 'scan.js'), VIDEO, '--lang', lang, '--json'], { encoding: 'utf8', maxBuffer: 1 << 28 });
    let scan = null; try { scan = JSON.parse(read(`build/scan.${lang}.json`)); } catch (e) {}
    if (!scan || (r.status !== 0 && !scan.errors.length)) add(`全片扫描（${lang}）`, false, ['scan.js 没能跑完：', ...(r.stdout + r.stderr).trim().split(/\r?\n/).slice(-12)]);
    else { add(`全片扫描（${lang}）`, !scan.errors.length, scan.errors.slice(0, 60)); if (scan.warns.length) rows.push({ name: `（${lang} 的提示，不计入通过与否）`, ok: true, detail: scan.warns.slice(0, 30) }); }

    // ── 5 音效覆盖 ──
    const { L } = layout(lang);
    const X = { per_seconds: 6, kinds: 4, scene_per_seconds: 0, max_gap: 20, ...(C.sfx || {}) };
    const { server, base } = await startServer();
    const { browser, page } = await openPage(base, { lang });
    const ev = await page.evaluate(() => (window.SFX || []).slice().sort((a, b) => a.t - b.t));
    // 新旧目录均查片尾：静默 cue 中，名字、实际分工与开源标记须完整出现在画面内。
    let creditGaps = null;
    if (flag('final')) {
      const script = layout(lang).SCRIPT;
      creditGaps = credits.cueProblems(script);
      if (!creditGaps.length) {
        const ids = script.flatMap((sc) => sc.cues).filter((c) => c[2] && c[2].credits).map((c) => c[0]);
        const { COLLECT } = require('./inspect'), frames = [];
        for (const id of ids) { const c = L.cues[id]; for (const k of [0.3, 0.55, 0.8, 0.97]) { await page.evaluate((x) => window.seek(x), c.start + c.d * k); frames.push(await page.evaluate(COLLECT)); } }
        creditGaps = credits.screenProblems(P, lang, frames);
      }
    }
    await browser.close(); server.close();
    if (creditGaps) add(`片尾名单（${lang}）`, !creditGaps.length, creditGaps);
    const KNOWN = ['tick', 'key', 'blip', 'pop', 'whoosh', 'thud', 'chime', 'error', 'riser', 'beep', 'drive'];
    const sx = [], main = ev.filter((e) => e.n !== 'key');
    const unknown = [...new Set(ev.map((e) => e.n).filter((n) => !KNOWN.includes(n)))];
    if (unknown.length) sx.push('未知的音效名：' + unknown.join(' ') + '（可用：' + KNOWN.join(' ') + '）');
    if (X.per_seconds && main.length < L.total / X.per_seconds) sx.push(`音效事件太少：${main.length} 个（不含打字声），至少要 ${Math.ceil(L.total / X.per_seconds)} 个（平均每 ${X.per_seconds} 秒一个）`);
    const kinds = new Set(main.map((e) => e.n)); if (X.kinds && kinds.size < X.kinds) sx.push(`音效种类太少：只用了 ${[...kinds].join(' ') || '无'}，至少用 ${X.kinds} 种（不同动作用不同的声音）`);
    if (X.scene_per_seconds) for (const s of L.scenes) { const n = main.filter((e) => e.t >= s.start && e.t < s.end).length; if (n < (s.end - s.start) / X.scene_per_seconds) sx.push(`场景 ${s.id} 的音效太少：${n} 个，至少 ${Math.ceil((s.end - s.start) / X.scene_per_seconds)} 个`); }
    if (X.max_gap) { let last = 0; for (const e of [...ev, { t: L.total }]) { if (e.t - last > X.max_gap) sx.push(`${last.toFixed(1)}–${e.t.toFixed(1)}s 之间 ${(e.t - last).toFixed(1)} 秒没有任何音效`); last = Math.max(last, e.t); } }
    if (ev.some((e) => e.t < 0 || e.t > L.total)) sx.push('有音效的时刻在片长之外');
    add(`音效覆盖（${lang}：${main.length} 个事件，${kinds.size} 种）`, !sx.length, sx);

    // ── 6 交付前 ──
    if (flag('final')) {
      const fx = await require('./artifact-record').deliveryProblems(VIDEO, P, lang, L, sourceState());
      if (!exists('README.md')) fx.push('缺少本片的 README.md');
      else if (P.layout >= 2) {
        const rd = read('README.md').split(/\r?\n/), i = rd.findIndex((l) => l.trim() === '## 交付'), j = rd.findIndex((l, k) => k > i && /^## /.test(l));
        if (i < 0 || !rd.slice(i + 1, j < 0 ? undefined : j).join('\n').replace(/<!--[\s\S]*?-->/g, '').trim()) fx.push('README 的「交付」是空的：写成片规格、闸门结论、open 的规则、实际看过听过的范围（docs/guides/acceptance.md 第 6 节）');
      } else if ((P.production || {}).mode === 'delegated') {
        // 旧版委托片的交付说明
        if (!exists('DELIVERY.md')) fx.push('委托制作的旧片要有交付说明 DELIVERY.md');
        else if (read('DELIVERY.md').length < 600) fx.push('DELIVERY.md 内容过少');
      }
      add(`交付物（${lang}）`, !fx.length, fx);
    }
  }
  console.log('');
  for (const x of rows) { console.log(`${x.ok ? '✓ 通过  ' : '✗ 不通过'}  ${x.name}`); for (const d of x.detail) console.log('      ' + d); }
  const bad = rows.filter((x) => !x.ok).length;
  console.log(`\n${bad ? `结论：有 ${bad} 项不通过。逐项修正后重新运行 node kit/tools/check.js${flag('final') ? ' --final' : ''}` : '结论：自动检查通过；内容、叙事、实际视听与开源交付仍按验收记录核对，策划者明确同意后才交付。'}`);
  process.exit(bad ? 1 : 0);
})();
