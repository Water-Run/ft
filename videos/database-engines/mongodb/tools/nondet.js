// 找「顺着播到这里」和「倒着跳到这里」不一样的元素：先顺序 seek 记一遍画面，再倒序 seek 比对，打印差异项。
// 用法：node videos/database-engines/mongodb/tools/nondet.js videos/database-engines/mongodb --from 700 --to 790 [--step 1.5]
const lib = require('../../../../kit/tools/lib');
const { COLLECT } = require('../../../../kit/tools/inspect');
const { needVideo, LANGS, startServer, openPage, arg } = lib;
(async () => {
  needVideo();
  const lang = LANGS()[0];
  const from = +arg('from', 0), to = +arg('to', 60), step = +arg('step', 1.5);
  const { server, base } = await startServer();
  const { browser, page } = await openPage(base, { lang });
  const key = (x) => [x.k, x.name, Math.round(x.x / 2), Math.round(x.y / 2), Math.round(x.w / 2), Math.round(x.h / 2), Math.round(x.op * 20), x.text || '', x.col || x.bg || x.sig || ''].join(',');
  const times = []; for (let t = from; t <= to; t += step) times.push(+t.toFixed(2));
  const fwd = new Map();
  for (const t of times) { await page.evaluate((x) => window.seek(x), t); fwd.set(t, (await page.evaluate(COLLECT)).filter((x) => x.k !== 'cap').map(key)); }
  for (const t of [...times].reverse()) {
    await page.evaluate((x) => window.seek(x), t);
    const b = (await page.evaluate(COLLECT)).filter((x) => x.k !== 'cap').map(key), a = fwd.get(t);
    const sa = new Set(a), sb = new Set(b);
    const onlyA = a.filter((x) => !sb.has(x)), onlyB = b.filter((x) => !sa.has(x));
    if (onlyA.length || onlyB.length) { console.log(`t=${t}`); onlyA.forEach((x) => console.log('  顺播  ' + x.slice(0, 150))); onlyB.forEach((x) => console.log('  跳播  ' + x.slice(0, 150))); }
  }
  await browser.close(); server.close();
})();
