// 审片页的本地媒体、桌面和窄屏布局核查。
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');
(async () => {
  const file = path.resolve(__dirname, '../out/audition/index.html');
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  let failed = false;
  for (const width of [1280, 390]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    const result = await page.evaluate(async () => {
      const media = await Promise.all([...document.querySelectorAll('audio')].map(a => new Promise(resolve => {
        const timer = setTimeout(() => resolve({ src: a.getAttribute('src'), error: 'timeout' }), 10000);
        a.onloadedmetadata = () => { clearTimeout(timer); resolve({ src: a.getAttribute('src'), duration: a.duration }); };
        a.onerror = () => { clearTimeout(timer); resolve({ src: a.getAttribute('src'), error: 'load failed' }); };
        a.preload = 'metadata'; a.load();
      })));
      const overflow = [...document.querySelectorAll('svg text')].filter(el => { const b = el.getBBox(); return b.x < 0 || b.y < 0 || b.x + b.width > 600 || b.y + b.height > 260; }).map(el => el.textContent);
      return { pageWidth: document.documentElement.scrollWidth, viewport: innerWidth, overflow, media };
    });
    if (result.pageWidth > width || result.overflow.length || result.media.some(m => m.error)) failed = true;
    console.log(JSON.stringify({ width, ...result }, null, 2));
    if (width === 1280) await page.screenshot({ path: path.resolve(__dirname, '../out/audition/page.png'), fullPage: true });
    await page.close();
  }
  await browser.close();
  if (failed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
