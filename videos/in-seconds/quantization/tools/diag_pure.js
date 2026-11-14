// 诊断：在某个时刻，用两条 seek 路径分别取整个 DOM 的状态签名，逐元素找出依赖播放历史的那一个。
// 用法：node videos/in-seconds/quantization/tools/diag_pure.js videos/in-seconds/quantization 18.02 16.52
const path = require('path');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
const T = +(process.argv[3] || 18.02), PREV = +(process.argv[4] || 16.52);
(async () => {
  const { server, base } = await lib.startServer();
  const { browser, page } = await lib.openPage(base, { lang: 'zh', scale: 1 });
  const TOTAL = await page.evaluate(() => window.TOTAL);
  const snap = () => page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#scenes *, #hud *, #caption *').forEach((e, i) => {
      const cs = getComputedStyle(e);
      out.push([i, e.tagName, e.className, cs.opacity, cs.visibility, cs.transform, cs.clipPath, e.textContent.slice(0, 24), e.getAttribute('style') || ''].join('|'));
    });
    return out;
  });
  await page.evaluate((p) => window.seek(p), PREV); await page.evaluate((t) => window.seek(t), T);
  const A = await snap();
  await page.evaluate(() => window.seek(0)); await page.evaluate((t) => window.seek(t), T);
  const B = await snap();
  let n = 0;
  for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) { n++; console.log(`#${i}\n  prev→t: ${A[i]}\n  0→t   : ${B[i]}`); }
  console.log(n ? `\n${n} 个元素依赖历史` : 'DOM 状态一致');
  // 像素差异规模：把两条路径的截图画进 canvas 逐像素比，统计差异数与包围盒
  const cdp = await page.createCDPSession();
  const grab = async () => { const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }); return data; };
  await page.evaluate((p) => window.seek(p), PREV); await page.evaluate((t) => window.seek(t), T); const pa = await grab();
  await page.evaluate(() => window.seek(0)); await page.evaluate((t) => window.seek(t), T); const pb = await grab();
  const diff = await page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + src; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = ia.width, h = ia.height;
    const ca = new OffscreenCanvas(w, h), cb = new OffscreenCanvas(w, h);
    const xa = ca.getContext('2d'), xb = cb.getContext('2d');
    xa.drawImage(ia, 0, 0); xb.drawImage(ib, 0, 0);
    const da = xa.getImageData(0, 0, w, h).data, db = xb.getImageData(0, 0, w, h).data;
    let count = 0, maxd = 0, minx = w, miny = h, maxx = 0, maxy = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 12) { count++; maxd = Math.max(maxd, d); const p = i / 4, x = p % w, y = (p / w) | 0; minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); }
    }
    return { w, h, count, maxd, box: count ? [minx, miny, maxx, maxy] : null };
  }, [pa, pb]);
  console.log('像素差异（阈值>12）:', JSON.stringify(diff));
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
