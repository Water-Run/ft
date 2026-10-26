// 把视觉稿 review/keyframes-r1.html 的每一帧按 1920×1080 截成图片（供试听页嵌入）。用法：node keyframes_shot.cjs <输出目录>
const path = require('path');
const lib = require('../../../../kit/tools/lib.js');
const puppeteer = require('../../../../node_modules/puppeteer-core');
(async () => {
  const out = process.argv[2];
  const browser = await puppeteer.launch({ executablePath: lib.CHROME(), headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1200 });
  await page.goto('file:///' + path.resolve(__dirname, '../review/keyframes-r1.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { document.querySelector('.grid').style.display = 'block'; document.querySelectorAll('.cell').forEach((c) => { c.style.width = '1920px'; c.style.marginBottom = '40px'; }); document.querySelectorAll('.frame').forEach((f) => { f.style.zoom = '1'; }); });
  await page.evaluate(() => document.fonts.ready);
  const frames = await page.$$('.frame');
  for (let i = 0; i < frames.length; i++) await frames[i].screenshot({ path: path.join(out, `kf_${i + 1}.png`) });
  const labels = await page.$$eval('.cell .lab', (els) => els.map((e) => e.textContent.trim()));
  require('fs').writeFileSync(path.join(out, 'keyframes.json'), JSON.stringify(labels, null, 1));
  console.log('frames', frames.length);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
