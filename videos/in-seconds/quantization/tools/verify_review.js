// 实测审览页：无头浏览器加载，检查运行时错误、图片加载、对照开关与放大 lightbox，并截图。
const fs = require('fs'), path = require('path');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
const frag = fs.readFileSync(path.join(__dirname, '../.qwen/tmp/qz-review/fragment.html'), 'utf8');
const doc = '<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + frag + '</body></html>';
(async () => {
  const puppeteer = require('puppeteer-core');
  const os = require('os');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-review-'));
  const browser = await puppeteer.launch({ executablePath: lib.CHROME(), headless: true, userDataDir: profile, args: process.platform === 'win32' ? [] : ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.setContent(doc, { waitUntil: 'networkidle0' });
  // 强制解码全部图片（页面用 lazy loading，折叠线以下默认不加载），确认每个 data URI 都有效
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')];
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
  });
  const stats = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('.frame img')];
    return {
      frames: imgs.length,
      imgsLoaded: imgs.filter((i) => i.naturalWidth > 0).length,
      cues: document.querySelectorAll('.cue').length,
      scenes: document.querySelectorAll('.scene').length,
      navLinks: document.querySelectorAll('nav a').length,
      creditBadge: document.querySelector('.credit-badge')?.textContent || '',
      meRow: document.querySelector('.cr-row.me .cr-name')?.textContent || '',
      hasLightbox: !!document.getElementById('lb'),
      hasToggle: !!document.getElementById('cmp'),
    };
  });
  // 对照开关
  await page.click('#cmp');
  const compareOn = await page.evaluate(() => document.body.classList.contains('compare') && getComputedStyle(document.querySelector('.cue .cold')).display !== 'none');
  // 放大 lightbox
  await page.click('.frame');
  const lbOpen = await page.evaluate(() => document.getElementById('lb').classList.contains('open') && document.getElementById('lbimg').naturalWidth > 0);
  await page.keyboard.press('Escape');
  const lbClosed = await page.evaluate(() => !document.getElementById('lb').classList.contains('open'));
  // 导航跳转
  await page.evaluate(() => document.querySelector('nav a[data-target="sc-test"]').click());
  await new Promise((r) => setTimeout(r, 400));
  const scrolled = await page.evaluate(() => window.scrollY > 100);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(__dirname, '../.qwen/tmp/qz-review/top.png') });
  await browser.close();
  fs.rmSync(profile, { recursive: true, force: true });
  console.log(JSON.stringify({ ...stats, compareOn, lbOpen, lbClosed, scrolled, errors }, null, 2));
  const ok = stats.frames === stats.imgsLoaded && stats.frames > 0 && stats.cues >= 36 && compareOn && lbOpen && lbClosed && scrolled && errors.length === 0 && stats.meRow === 'Qwen-4-Max-Preview';
  console.log(ok ? '✓ 审览页实测通过' : '✗ 审览页有问题');
  process.exitCode = ok ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
