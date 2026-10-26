// 把视觉稿或封面的 HTML 截成 1920×1080 的图片（供试听页嵌入）。
// 用法：node keyframes_shot.cjs <html> <输出目录> <前缀>
//   视觉稿（含 .frame）：每帧存为 <前缀>_<n>.png，帧的说明存为 <前缀>.json；封面（含 #cv）：存为 <前缀>.png
const path = require('path');
const fs = require('fs');
const lib = require('../../../../kit/tools/lib.js');
const puppeteer = require('../../../../node_modules/puppeteer-core');
(async () => {
  const [html, out, prefix] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: lib.CHROME(), headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1200 });
  await page.goto('file:///' + path.resolve(html).replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const cover = await page.$('#cv');
  if (cover) {
    await cover.screenshot({ path: path.join(out, `${prefix}.png`) });
    console.log('cover');
  } else {
    await page.evaluate(() => { document.querySelector('.grid').style.display = 'block'; document.querySelectorAll('.cell').forEach((c) => { c.style.width = '1920px'; c.style.marginBottom = '40px'; }); document.querySelectorAll('.frame').forEach((f) => { f.style.zoom = '1'; }); });
    const frames = await page.$$('.frame');
    for (let i = 0; i < frames.length; i++) await frames[i].screenshot({ path: path.join(out, `${prefix}_${i + 1}.png`) });
    const labels = await page.$$eval('.cell .lab', (els) => els.map((e) => e.textContent.trim()));
    fs.writeFileSync(path.join(out, `${prefix}.json`), JSON.stringify(labels, null, 1));
    console.log('frames', frames.length);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
