// 量「看得完」：画面上每一段文字从完整可读到开始退场（或被遮、被裁、变淡）的时长，对照经验规则 F04 的下限。
// 用法：node kit/tools/readable.js <视频> [--lang en] [--from 秒 --to 秒 | --scene 场景号] [--step 0.1] [--all] [--numbers] [--json]
//   下限：1.5 秒 + 字数 ÷ 5（字数 = 汉字数 + 拉丁词数，一串数字算一个词）。只是读完文字的下限：一步机制做完之后另留看懂的时间，要连续观看判断。
//   「完整可读」：不透明度 ≥ 0.5，整块在画面内，左右没有被裁（擦除还在进行）。字幕条不算。
//   打字机逐字打出的中间状态、计数中的数字（--numbers 才列出）不计；落在扫描范围两端、量不全的不计。
//   --all 列出全部段落；缺省只列不够的。--json 另存 build/readable.<语言>.json。
// 思路与第一版实现来自《垃圾回收的艺术》一片的制作（Claude Opus 5.5），收进工具包时改为自动找出全部文字。
const { needVideo, LANGS, layout, startServer, openPage, arg, flag, dirs, mkdirp, mmss, path, fs } = require('./lib');
const { COLLECT, CAP_TOP } = require('./inspect');
needVideo();
const lang = LANGS()[0], { L } = layout(lang), step = +arg('step', 0.1);
let from = +arg('from', 0), to = +arg('to', L.total);
if (arg('scene', null)) { const sc = L.scenes.find((s) => s.id === arg('scene')); if (!sc) { console.error('没有这个场景：' + arg('scene')); process.exit(2); } from = sc.start; to = sc.end; }
const words = (s) => (s.match(/[⺀-鿿豈-﫿]/g) || []).length + (s.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*|\d+(?:[.,:]\d+)*/g) || []).length;
const need = (s) => 1.5 + words(s) / 5;
const cueAt = (t) => { let hit = null; for (const id of L.order) { if (L.cues[id].start <= t + 1e-6) hit = id; else break; } return hit; };
const sceneAt = (t) => (L.scenes.find((s) => t >= s.start && t < s.end) || {}).id;
(async () => {
  const { server, base } = await startServer();
  const { browser, page } = await openPage(base, { lang });
  const open = new Map(), spans = [];
  const close = (key, end) => { const r = open.get(key); open.delete(key); spans.push({ text: r.text, start: r.start, end, x: r.x, y: r.y, fs: r.fs, cutStart: r.start <= from + 1e-6, cutEnd: end >= to - 1e-6 }); };
  for (let t = from; t <= to + 1e-6; t += step) {
    await page.evaluate((x) => window.seek(x), t);
    const items = await page.evaluate(COLLECT), now = new Set();
    for (const x of items) {
      if (x.k !== 'text' || x.scene === 'caption' || x.op < 0.5 || /[LR]/.test(x.cut || '')) continue;
      if (x.x < -1 || x.x + x.w > 1921 || x.y < -2 || x.y + x.h > CAP_TOP + 2) continue;
      const key = x.text.replace(/\s+/g, '');
      if (!key || now.has(key)) continue;
      now.add(key);
      if (!open.has(key)) open.set(key, { text: x.text.trim(), start: t, x: x.x, y: x.y, fs: x.fs });
    }
    for (const key of [...open.keys()]) if (!now.has(key)) close(key, t);
  }
  for (const key of [...open.keys()]) close(key, to);
  await browser.close(); server.close();
  // 打字机的中间状态：紧接着出现了以它开头的更长文字
  const typing = (s) => spans.some((o) => o !== s && o.text.length > s.text.length && o.text.replace(/\s+/g, '').startsWith(s.text.replace(/\s+/g, '')) && Math.abs(o.start - s.end) <= step * 2.5);
  const rows = spans.filter((s) => words(s.text) && !s.cutStart && !s.cutEnd && !typing(s) && (flag('numbers') || /[^\d\s.,:%+\-−×/]/.test(s.text)))
    .map((s) => ({ ...s, dur: +(s.end - s.start).toFixed(2), need: +need(s.text).toFixed(2), cue: cueAt(s.start), scene: sceneAt(s.start) }))
    .sort((a, b) => a.start - b.start);
  const short = rows.filter((r) => r.dur + 1e-6 < r.need);
  const show = flag('all') ? rows : short;
  console.log(`${lang}：${mmss(from)}–${mmss(to)} 每 ${step} 秒取一帧，量到 ${rows.length} 段文字，${short.length} 段不够 F04 的下限。`);
  for (const r of show) console.log(`${r.dur + 1e-6 < r.need ? '✗' : '✓'} ${r.start.toFixed(1)}–${r.end.toFixed(1)}s（${mmss(r.start)}，${r.scene} / ${r.cue}）稳定 ${r.dur.toFixed(1)}s，需 ${r.need.toFixed(1)}s　${r.fs}px「${r.text.slice(0, 50)}」`);
  if (flag('json')) { mkdirp(dirs(lang).build); fs.writeFileSync(path.join(dirs(lang).build, `readable.${lang}.json`), JSON.stringify({ lang, from, to, step, rows }, null, 1)); }
  console.log('\n下限只保证读完文字。看懂一步机制要另留时间，以正常速度连续观看为准（docs/lessons.md F04）。');
  process.exitCode = short.length ? 1 : 0;
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
