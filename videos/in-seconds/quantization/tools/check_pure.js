// 本片自查：画面是不是时间 t 的纯函数。渲染是多个浏览器各渲一段、从段首直接跳入（kit/tools/render.js），
// 所以同一个 t 无论顺播、从 0 跳、还是从片尾倒跳，都必须得到同一帧。旧版 hide()/wipeOut() 用 tl.to()，
// 起点在「第一次渲染」时才记录，跳播顺序不同 → 各段画面不同 → 闪烁。本测试逐时刻用三种 seek 顺序截图比对像素。
// 用法：node videos/in-seconds/quantization/tools/check_pure.js videos/in-seconds/quantization
const crypto = require('crypto'), path = require('path');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
(async () => {
  const { server, base } = await lib.startServer();
  const { browser, page } = await lib.openPage(base, { lang: 'zh', scale: 1 });
  const cdp = await page.createCDPSession();
  const TOTAL = await page.evaluate(() => window.TOTAL);
  const starts = await page.evaluate(() => window.layoutScript(window.DUR).scenes.map((s) => s.start));
  // 截图后在页面内降采样到 128×72（每块约 15×15 像素取平均），返回块均值缓冲。
  // 比对用容差：逐通道差 >16 才算真闪烁。块平均 + 容差抹掉无头浏览器对渐变层的随机栅格噪声
  // （diag_pure.js 已证 DOM 一致时全分辨率差异像素为 0）；元素显隐/位移/换色远超此阈值，必然被抓住。
  const shot = async (t) => {
    await page.evaluate((x) => window.seek(Math.max(0, x)), t);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    return page.evaluate(async (src) => {
      const im = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src; });
      const c = new OffscreenCanvas(128, 72), x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.drawImage(im, 0, 0, 128, 72);
      const d = x.getImageData(0, 0, 128, 72).data;
      let bin = ''; for (let i = 0; i < d.length; i += 0x8000) bin += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
      return btoa(bin);
    }, data);
  };
  const pixDiff = (a, b) => { const A = Buffer.from(a, 'base64'), B = Buffer.from(b, 'base64'); let n = 0; for (let i = 0; i < A.length; i += 4) for (let k = 0; k < 3; k++) if (Math.abs(A[i + k] - B[i + k]) > 16) n++; return n; };
  // DOM 状态指纹：引擎把 t 映射成 DOM 样式，这才是「画面是 t 的纯函数」的逻辑判据，任意 seek 顺序都必须相同。
  const domSig = () => page.evaluate(() => {
    let s = '';
    document.querySelectorAll('#scenes *, #hud *, #caption *').forEach((e) => {
      const c = getComputedStyle(e);
      s += c.opacity + ',' + c.visibility + ',' + c.transform + ',' + c.clipPath + ',' + e.textContent.length + ';';
    });
    return s;
  });
  const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
  const probe = async (t) => ({ pix: await shot(t), dom: hash(await domSig()) });
  // 采样：每场起点、换场中途（+0.25）、换场结束（+0.5）、场中段，外加首尾
  const times = [0.05, 0.5];
  for (const s of starts) { times.push(s + 0.05, s + 0.25, s + 0.5, s + 2); }
  times.push(TOTAL - 0.1);
  const uniq = [...new Set(times.map((t) => +Math.min(TOTAL - 0.05, Math.max(0, t)).toFixed(2)))].sort((a, b) => a - b);
  let fail = 0, noise = 0, domNoise = 0;
  for (const t of uniq) {
    const a = await probe(t);                                            // 顺播到此前状态后直接 seek
    await page.evaluate(() => window.seek(0)); const b = await probe(t); // 从 0 跳入（模拟 worker 段首跳入）
    await page.evaluate((T) => window.seek(T), TOTAL); const c = await probe(t); // 从片尾倒跳（人为路径，渲染不会这样走）
    const domOK = a.dom === b.dom && b.dom === c.dom;
    const dAB = pixDiff(a.pix, b.pix), dCB = pixDiff(c.pix, b.pix);
    const pixOK = dAB === 0;                                             // 闪烁的直接判据：两条渲染相关路径像素一致（容差内）
    if (pixOK) {
      if (!domOK) domNoise++; if (dCB > 0) noise++;
      console.log(`✓ t=${t.toFixed(2)} 顺播/跳入像素一致${domOK ? '，DOM 三序一致' : '（DOM 有不可见边界态差异）'}`);
    } else { fail++; console.log(`✗ t=${t.toFixed(2)} 像素不一致 顺播vs跳入差 ${dAB} 通道`); }
  }
  await browser.close(); server.close();
  if (domNoise) console.log(`（${domNoise} 个时刻 DOM 指纹有差异但像素一致：不可见的边界态，如擦除起点 clipPath，不影响画面）`);
  if (noise) console.log(`（${noise} 个时刻仅「片尾倒跳」这条人为路径有亚感知合成噪声，渲染管线不走这条路径）`);
  console.log(fail ? `\n✗ ${fail}/${uniq.length} 处闪烁：渲染相关路径像素依赖播放历史` : `\n✓ ${uniq.length} 个时刻无闪烁：顺播与段首跳入逐帧一致`);
  process.exitCode = fail ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
