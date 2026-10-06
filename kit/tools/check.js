// 总闸门：一条命令跑完全部自动检查，逐项给出 通过 / 不通过。任何一项不通过都不能交付。
// 用法：node kit/tools/check.js <视频>            制作期：源码规则、场景齐全、时长节奏、全片扫描（scan.js）、音效覆盖
//       node kit/tools/check.js <视频> --final    交付前：再加成片、响度、静止段、空画面、封面、是否过期
//       node kit/tools/check.js <视频> --handoff  委托制作：准备方交给受托模型之前，查任务书与素材是否齐备（见 docs/delegation.md）
//       --lang en 只查一种语言（缺省查 project.json 里的全部语言）
// 各项的含义、阈值与处理办法见 docs/review.md；阈值与风格规则在 project.json 的 check 段，写法见 docs/tools.md。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, VIDEO, ARGS, arg, flag, layout, loadedSources, sourceState, startServer, openPage, dirs, mmss, path, fs } = require('./lib');
needVideo();
const P = PROJECT(), C = P.check, LANGS = arg('lang', null) ? arg('lang').split(',') : P.languages;
const rows = [];
const add = (name, ok, detail) => rows.push({ name, ok, detail: [].concat(detail || []) });
const read = (f) => fs.readFileSync(path.join(VIDEO, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(VIDEO, f));

// ── 交接检查（--handoff）：准备方交给受托模型之前 ──
if (flag('handoff')) {
  const blank = (f) => { const t = read(f); return [/待填/.test(t) ? '还有「待填」' : '', /<!--\s*准备方/.test(t) ? '还有给准备方看的注释（<!-- 准备方… -->）' : '', /\{\{[A-Z0-9_]+\}\}/.test(t) ? '还有没替换的占位符 {{…}}' : ''].filter(Boolean); };
  add('制作方式', P.production.mode === 'delegated', P.production.mode === 'delegated' ? [] : ['project.json 的 production.mode 不是 delegated：这部片子不是委托制作']);
  const br = [];
  for (const f of ['AGENTS.md', 'brief/01-mission.md', 'brief/02-script.md', 'brief/03-visual.md', 'brief/04-storyboard.md', 'brief/05-motion-sound.md', 'brief/06-acceptance.md']) { if (!exists(f)) br.push('缺少 ' + f); else for (const w of blank(f)) br.push(`${f} ${w}`); }
  add('任务入口与任务书', !br.length, br);
  const mat = [];
  if (!exists('research/FACTS.md') || read('research/FACTS.md').length < 800) mat.push('research/FACTS.md 不存在或内容过少：取证要在交接之前做完');
  if (/TODO/.test(read('src/css/style.css'))) mat.push('src/css/style.css 里还有 TODO：视觉系统由准备方定好');
  const design = exists('src/design') ? fs.readdirSync(path.join(VIDEO, 'src', 'design')).filter((n) => !n.startsWith('.')) : [];
  if (!design.length) mat.push('src/design/ 里没有参考关键帧或示范场景');
  if (!C.duration) mat.push('project.json 的 check.duration 未设：给出总长的允许范围');
  add('取证、视觉系统与范例', !mat.length, mat);
  const vo = [];
  for (const lang of LANGS) {
    const { L, measured } = layout(lang), ids = L.order.filter((id) => !L.cues[id].silent);
    if (!measured) { vo.push(`${lang}：旁白还没有合成（node kit/tools/tts.js）`); continue; }
    const cached = ids.filter((id) => exists(`audio/${lang}/cues/${id}.mp3`)).length;
    if (cached < ids.length) rows.push({ name: `（${lang}：这台机器上的旁白音频 ${cached}/${ids.length} 句。受托模型在没有音频缓存的机器上开工时，需要联网重新合成）`, ok: true, detail: [] });
    const ef = (C.expect || 'expect.<lang>.json').replace('<lang>', lang);
    if (!exists(ef)) { vo.push(`缺少逐句对应表 ${ef}`); continue; }
    const ex = JSON.parse(read(ef)), keys = Object.keys(ex), bad = keys.filter((k) => !L.cues[k]);
    if (!keys.length) vo.push(`${ef} 是空的：写明每句说完时画面上必须有的文字`);
    if (bad.length) vo.push(`${ef} 里有脚本中不存在的句号：${bad.join(' ')}`);
    if (keys.length) rows.push({ name: `（${lang}：逐句对应表覆盖 ${keys.filter((k) => L.cues[k]).length}/${L.order.length} 句，含无旁白的停顿）`, ok: true, detail: [] });
  }
  add('旁白与逐句对应表', !vo.length, vo);
  const sc = layout(LANGS[0]).SCRIPT.filter((x) => !loadedSources().some((f) => /\.js$/.test(f) && new RegExp(`scene\\(\\s*['"\`]${x.id}['"\`]`).test(read('src/' + f)))).map((x) => x.id);
  add('场景文件', !sc.length, sc.length ? ['这些场景还没有对应的场景文件（空壳即可，受托模型来实现）：' + sc.join(' ')] : []);
  console.log('');
  for (const x of rows) { console.log(`${x.ok ? '✓ 通过  ' : '✗ 不通过'}  ${x.name}`); for (const d of x.detail) console.log('      ' + d); }
  const bad = rows.filter((x) => !x.ok).length;
  console.log(`\n${bad ? `结论：有 ${bad} 项不通过，补齐后再交接` : '结论：可以交接。受托模型的入口是本片目录的 AGENTS.md'}`);
  process.exit(bad ? 1 : 0);
}

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
  if (C.camera && !/makeCamera\(/.test(hit.src)) st.push(`src/${hit.f} 没有用镜头（makeCamera）：本片要求每个场景都有镜头运动`);
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
    await browser.close(); server.close();
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
      const fx = [], slug = P.slug, fps = +(P.render.fps || 60);
      const wantFiles = [`out/${slug}-${lang}-1080p60.mp4`, `out/${slug}-${lang}-1080p60-voice-only.mp4`, `out/${slug}-${lang}.srt`, `out/cover-${lang}-16x9.jpg`, `out/cover-${lang}-4x3.jpg`, `out/cover-${lang}-16x9-3840x2160.png`, `out/cover-${lang}-4x3-3200x2400.png`];
      for (const f of wantFiles) if (!exists(f)) fx.push('缺少 ' + f);
      let fin = null; try { fin = JSON.parse(read(`build/finish.${lang}.json`)); } catch (e) { fx.push(`缺少 build/finish.${lang}.json：先运行 node kit/tools/finish.js`); }
      if (fin) {
        if (Math.abs(fin.duration - L.total) > 0.6) fx.push(`成片时长 ${fin.duration.toFixed(1)}s 与时间线 ${L.total.toFixed(1)}s 不一致：脚本或配音改过之后没有重新渲染`);
        if (!/width=1920/.test(fin.probe) || !/height=1080/.test(fin.probe) || !new RegExp(`r_frame_rate=${fps}/1`).test(fin.probe)) fx.push(`成片规格不是 1920×1080 ${fps} 帧/秒`);
        if (!(fin.loudness.I >= -17.5 && fin.loudness.I <= -14.5)) fx.push(`响度 ${fin.loudness.I} LUFS 不在 -16±1.5`);
        if (!(fin.loudness.TP <= -1)) fx.push(`峰值 ${fin.loudness.TP} dBFS 高于 -1`);
        if (((C.levels || {}).STILL || 'error') === 'error') for (const z of fin.freezes) fx.push(`成片 ${z.start.toFixed(1)}s 起有 ${z.d.toFixed(1)} 秒画面不动`);
        if (fin.blank) for (const z of fin.blank.blank) fx.push(`成片 ${z[0]}–${z[1]}s 是空画面`);
      }
      let rec = null; try { rec = JSON.parse(read(`out/${lang}/video.json`)); } catch (e) { fx.push(`缺少 out/${lang}/video.json：成片不是由 render.js 整片渲染得到的`); }
      if (rec) { const now = sourceState(); const changed = [...new Set([...Object.keys(now), ...Object.keys(rec.sources)])].filter((f) => now[f] !== rec.sources[f] && !(/^js\/timing\.\w+\.js$/.test(f) && f !== `js/timing.${lang}.js`)); if (changed.length) fx.push('这些源文件在渲染之后改过，成片已过期，要重新渲染：' + changed.map((f) => 'src/' + f).join(' ')); }
      if (!exists('README.md')) fx.push('缺少本片的 README.md（内容、结构、取证方式、复现命令）');
      if (P.production.mode === 'delegated') {
        if (!exists('DELIVERY.md')) fx.push('委托制作的片子要有交付说明 DELIVERY.md（写法见 docs/delegation.md）');
        else if (read('DELIVERY.md').length < 600) fx.push('DELIVERY.md 内容过少：按 docs/delegation.md 的清单写全');
      }
      add(`交付物（${lang}）`, !fx.length, fx);
    }
  }
  console.log('');
  for (const x of rows) { console.log(`${x.ok ? '✓ 通过  ' : '✗ 不通过'}  ${x.name}`); for (const d of x.detail) console.log('      ' + d); }
  const bad = rows.filter((x) => !x.ok).length;
  console.log(`\n${bad ? `结论：有 ${bad} 项不通过。逐项修正后重新运行 node kit/tools/check.js${flag('final') ? ' --final' : ''}` : '结论：全部通过'}`);
  process.exit(bad ? 1 : 0);
})();
