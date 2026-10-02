// 诊断：逐时刻截图，只看 PNG 的头（位深、颜色类型）与块列表，找出「截图格式在哪些时刻发生变化」。
// 背景：截图的像素格式中途变化会让 ffmpeg 重建滤镜图，成片悄悄少一段（见 render.js 头部与 docs/pitfalls.md）。
// 用法：node kit/tools/pngprobe.js <视频> <起点秒> <终点秒> [步长=0.1] [--lang en] [--slow]      --slow：不用 optimizeForSpeed
// 颜色类型不是 2（RGB）的前三帧会存到 shots/pngprobe/。
const { needVideo, LANGS, positional, flag, dirs, mkdirp, startServer, openPage, path, fs } = require('./lib');
(async () => {
  needVideo();
  const [a, b, step = 0.1] = positional(['lang']).map(Number), fast = !flag('slow'), lang = LANGS()[0];
  if (!(b > a)) { console.error('用法：node kit/tools/pngprobe.js <视频> <起点秒> <终点秒> [步长]'); process.exit(2); }
  const { server, base } = await startServer();
  const { browser, page } = await openPage(base, { lang });
  const cdp = await page.createCDPSession();
  let last = '', saved = 0;
  for (let t = a; t <= b + 1e-9; t += step) {
    await page.evaluate((x) => window.seek(x), t);
    const { data } = await cdp.send('Page.captureScreenshot', fast ? { format: 'png', optimizeForSpeed: true } : { format: 'png' });
    const buf = Buffer.from(data, 'base64');
    const chunks = []; let p = 8;
    while (p + 8 <= buf.length) { const len = buf.readUInt32BE(p), type = buf.toString('latin1', p + 4, p + 8); if (!chunks.length || chunks[chunks.length - 1] !== type) chunks.push(type); p += 12 + len; }
    const sig = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)} depth=${buf[24]} colorType=${buf[25]} interlace=${buf[28]} chunks=${chunks.join(',')}`;
    if (sig !== last) { console.log(t.toFixed(4), sig, `bytes=${buf.length}`); last = sig; }
    if (buf[25] !== 2 && saved < 3) { const d = mkdirp(path.join(dirs(lang).shots, 'pngprobe')); fs.writeFileSync(path.join(d, `t_${t.toFixed(4)}.png`), buf); saved++; }
  }
  console.log('end', b.toFixed(2));
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
