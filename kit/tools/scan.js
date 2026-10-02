// 扫全片：每 0.5 秒取一帧，用文字规则检查版面、空屏、静止、确定性，并核对「每句旁白说完时画面上该有的内容」。
// 用法：node kit/tools/scan.js <视频> [--lang en|all]
//       node kit/tools/scan.js <视频> --from 20 --to 55      只扫一段（写某个场景时用）
//       --json     另存 build/scan.<语言>.json（check.js 用）
// 退出码：有 ✗ 即为 1。各项的含义与处理办法见 docs/review.md。
// 可在 project.json 的 check 段调整：
//   still_seconds（默认 3）  empty_seconds（默认 1）  dense（同屏文字项上限，默认 16）
//   levels: { "STILL": "warn", "DENSE": "off", … }   把某一项改成 error / warn / off
//   expect: "expect.<lang>.json"                       逐句对应表的位置（相对视频目录；缺省即此名）。格式 { 句号: ["该在画面上的字", "甲||乙"] }
const { needVideo, PROJECT, LANGS, VIDEO, layout, startServer, openPage, arg, flag, dirs, mkdirp, mmss, path, fs } = require('./lib');
const { COLLECT, problems, refine, signature, configure, W, CAP_TOP } = require('./inspect');
const STEP = 0.5;
const LEVELS = { CUT: 'warn', CAPZONE: 'warn', MARGIN: 'warn', DENSE: 'warn', SMALL: 'error', CONTRAST: 'error', OVERLAP: 'error', EMPTY: 'error', STILL: 'error', NONDET: 'error', EXPECT: 'error', NOTEXT: 'error', CAPWIDE: 'error', PAGE: 'error' };
async function scan(lang) {
  const C = PROJECT().check; configure(C);
  const level = { ...LEVELS, ...(C.levels || {}) };
  const stillMax = +(C.still_seconds || 3), emptyMax = +(C.empty_seconds || 1), denseMax = +(C.dense || 16);
  const { L } = layout(lang);
  const from = +arg('from', 0), to = +arg('to', L.total);
  const { server, base } = await startServer();
  const { browser, page, logs } = await openPage(base, { lang });
  const paper = await page.evaluate(() => { const m = getComputedStyle(document.getElementById('bg') || document.getElementById('stage')).backgroundColor.match(/[\d.]+/g) || [236, 232, 223]; return '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase(); });
  const times = []; for (let t = from; t < to - 0.01; t += STEP) times.push(+t.toFixed(2));
  const frames = [];
  const pxCache = new Map();
  for (const t of times) { await page.evaluate((x) => window.seek(x), t); const items = await page.evaluate(COLLECT); frames.push({ t, items, ps: await refine(page, problems(items, paper), pxCache) }); }

  const errors = [], warns = [];
  const add = (code, msg) => { const lv = level[code] || 'error'; if (lv === 'off') return; (lv === 'warn' ? warns : errors).push(`[${code}] ${msg}`); };
  const span = (a, b) => `${a.toFixed(1)}–${b.toFixed(1)}s（${mmss(a)}）`;
  // 1 版面问题：同一问题连续出现才算（入场出场途中的瞬时状态不算）
  const need = { CUT: 3, CAPZONE: 2, SMALL: 3, CONTRAST: 3, OVERLAP: 3, MARGIN: 3 };
  const runs = new Map();
  frames.forEach((f, idx) => { for (const p of f.ps) { const r = runs.get(p.key) || { code: p.code, msg: p.msg, hits: [] }; r.hits.push(idx); runs.set(p.key, r); } });
  for (const r of runs.values()) {
    let best = 0, cur = 0, start = 0, bs = 0;
    for (let i = 0; i < r.hits.length; i++) { if (i && r.hits[i] === r.hits[i - 1] + 1) cur++; else { cur = 1; start = r.hits[i]; } if (cur > best) { best = cur; bs = start; } }
    // 特写时画面边缘的次要文字被切掉是正常取景，所以 CUT / CAPZONE 默认只作提示；主体内容是否完整由第 5 项（逐句对应）把关
    if (best >= (need[r.code] || 3)) add(r.code, `${span(frames[bs].t, frames[bs + best - 1].t + STEP)} ${r.msg}`);
  }
  // 2 空屏与静止（不看字幕与常驻角标）。常驻层里的大块内容（整屏的章节卡、转场色块）算内容：盖着它的时候画面不是空的
  const content = (f) => f.items.filter((x) => x.k !== 'cap' && x.scene !== 'hud' && x.scene !== 'caption');
  const bigHud = (f) => f.items.some((x) => x.scene === 'hud' && x.op >= 0.5 && ((x.k === 'block' && x.w * x.h >= W * 1080 * 0.25) || (x.k === 'text' && x.fs >= 60)));
  let emptyFrom = null, stillFrom = null, lastSig = null;
  const flushEmpty = (t) => { if (emptyFrom != null && t - emptyFrom >= emptyMax) add('EMPTY', `${span(emptyFrom, t)} 画面上没有任何内容（空屏 ${(t - emptyFrom).toFixed(1)} 秒）`); emptyFrom = null; };
  const flushStill = (t) => { if (stillFrom != null && t - stillFrom >= stillMax) add('STILL', `${span(stillFrom, t)} 画面 ${(t - stillFrom).toFixed(1)} 秒没有任何变化（除字幕外）。任意 ${stillMax} 秒内应有可见变化：加镜头运动或元素动作`); stillFrom = null; };
  for (const f of frames) {
    const c = content(f);
    if (!c.length && !bigHud(f)) { if (emptyFrom == null) emptyFrom = f.t; } else flushEmpty(f.t);
    const sig = signature(c);
    if (sig === lastSig) { if (stillFrom == null) stillFrom = f.t - STEP; } else flushStill(f.t);
    lastSig = sig;
  }
  flushEmpty(to); flushStill(to);
  // 3 信息量：同时可见的文字项过多
  let dense = null;
  for (const f of frames) { const n = f.items.filter((x) => x.k === 'text' && x.op >= 0.5 && x.scene !== 'hud').length; if (n > denseMax && (!dense || n > dense.n)) dense = { n, t: f.t }; }
  if (dense) add('DENSE', `t=${dense.t.toFixed(1)}s 同时可见 ${dense.n} 段文字（建议 ≤${denseMax}）：考虑分步出现或移出旧内容`);
  // 4 确定性：倒着再 seek 一遍，同一时刻的画面必须相同（并行渲染从任意时刻开始，依赖历史状态的写法会花屏）
  let nondet = 0, firstNd = null;
  for (let i = frames.length - 1; i >= 0; i -= 3) {
    await page.evaluate((x) => window.seek(x), frames[i].t);
    const sig2 = signature(await page.evaluate(COLLECT));
    if (sig2 !== signature(frames[i].items)) { nondet++; if (firstNd == null || frames[i].t < firstNd) firstNd = frames[i].t; }
  }
  if (nondet) add('NONDET', `有 ${nondet} 个时刻「顺着播到这里」和「直接跳到这里」的画面不一样（最早 t=${firstNd.toFixed(1)}s）。画面必须只由 t 决定：检查是否用了 tl.call、定时器、未固定种子的随机数，或在 F() 里累加状态`);
  // 5 逐句对应：expect 表里列出的文字，在该句说完的那一刻必须完整地在画面上
  const expPath = path.join(VIDEO, (C.expect || 'expect.<lang>.json').replace('<lang>', lang));
  const expect = fs.existsSync(expPath) ? JSON.parse(fs.readFileSync(expPath, 'utf8')) : {};
  const norm = (s) => s.replace(/\s+/g, '').toLowerCase();
  const cueRows = [];
  for (const id of L.order) {
    const c = L.cues[id]; const t = c.end - 0.05; if (t < from || t > to) continue;
    await page.evaluate((x) => window.seek(x), t);
    // 只算「完整在画面内」的文字：被画面边缘切掉的、伸进字幕条的都不算数
    const every = await page.evaluate(COLLECT), drawn = every.some((x) => (x.k === 'gfx' || x.k === 'named') && x.scene !== 'hud' && x.op >= 0.5);
    const items = every.filter((x) => x.k === 'text' && x.op >= 0.5 && x.scene !== 'hud' && !x.cutByStage && x.y + x.h <= CAP_TOP + 2 && x.x >= 0 && x.x + x.w <= W);
    // 字幕的实际排版：按渲染结果量，不按字数猜。折成两行、或宽到离画面两侧不足 96px 都算
    const capIt = every.find((x) => x.k === 'cap' && x.text);
    if (capIt && (capIt.h > capIt.fs * 1.9 || capIt.w > W - 192)) add('CAPWIDE', `句 ${id} 的字幕${capIt.h > capIt.fs * 1.9 ? '折成了两行' : `太宽（${capIt.w}px，上限 ${W - 192}px）`}：「${capIt.text.slice(0, 40)}」拆成两句或删字`);
    const all = norm(items.map((x) => x.text).join('|'));
    const wants = expect[id] || [];
    const miss = wants.filter((wd) => !norm(wd).split('||').some((alt) => all.includes(alt)));
    cueRows.push({ id, t, n: items.length, miss, texts: items.map((x) => x.text.slice(0, 22)) });
    if (miss.length) add('EXPECT', `句 ${id}（${c.cap || '停顿'}）说完时（t=${t.toFixed(1)}s）画面上缺少：${miss.map((m) => '「' + m + '」').join(' ')}`);
    else if (!c.silent && !items.length && !drawn) add('NOTEXT', `句 ${id}（${c.cap}）说完时（t=${t.toFixed(1)}s）画面上没有任何文字或图形`);
  }
  // 6 页面日志
  const bad = [...new Set(logs)].filter((l) => /pageerror|no cue|word not in cue|http 4|requestfailed/.test(l));
  for (const l of bad.slice(0, 20)) add('PAGE', l);
  await browser.close(); server.close();

  console.log(`■ ${lang}  扫描 ${from.toFixed(1)}–${to.toFixed(1)}s，共 ${frames.length} 帧${Object.keys(expect).length ? `；逐句对应表 ${Object.keys(expect).length} 句` : '；没有逐句对应表（' + path.basename(expPath) + '）'}`);
  console.log('\n逐句（每句说完那一刻画面上的文字）：');
  for (const r of cueRows) console.log(`  ${r.miss.length ? '✗' : '✓'} ${r.id.padEnd(4)} t=${r.t.toFixed(1).padStart(6)}  ${String(r.n).padStart(2)} 项  ${r.texts.slice(0, 7).join(' | ')}${r.texts.length > 7 ? ' …' : ''}`);
  console.log(`\n错误 ${errors.length} 项：` + (errors.length ? '\n' + errors.map((e) => '  ✗ ' + e).join('\n') : '无'));
  console.log(`提示 ${warns.length} 项：` + (warns.length ? '\n' + warns.map((e) => '  ! ' + e).join('\n') : '无'));
  if (flag('json')) fs.writeFileSync(path.join(mkdirp(dirs(lang).build), `scan.${lang}.json`), JSON.stringify({ lang, from, to, total: L.total, errors, warns }, null, 1));
  return errors.length;
}
(async () => { needVideo(); let n = 0; for (const lang of LANGS()) n += await scan(lang); process.exit(n ? 1 : 0); })();
