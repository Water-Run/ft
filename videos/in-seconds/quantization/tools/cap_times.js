// 截取指定时刻帧供目视检查。用法：node tools/cap_times.js <视频> t1 t2 ...
const path = require('path'), fs = require('fs');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
const times = process.argv.slice(3).map(Number);
(async () => {
  const { server, base } = await lib.startServer();
  const { browser, page } = await lib.openPage(base, { lang: 'zh', scale: 0.5 });
  const cdp = await page.createCDPSession();
  const out = path.join(__dirname, '../.qwen/tmp/qz-review');
  fs.mkdirSync(out, { recursive: true });
  for (const t of times) {
    await page.evaluate((x) => window.seek(x), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(out, 't' + t + '.png'), Buffer.from(data, 'base64'));
    console.log('saved t' + t);
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
