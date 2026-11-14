// 诊断页面启动：打印 goto/ready 是否成功、pageerror、失败请求、>=400 响应。
const path = require('path');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
(async () => {
  const { server, base } = await lib.startServer();
  const puppeteer = require('puppeteer-core');
  const os = require('os'), fs = require('fs');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-boottest-'));
  const browser = await puppeteer.launch({ executablePath: lib.CHROME(), headless: true, userDataDir: profile, args: ['--hide-scrollbars', '--mute-audio', '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('requestfailed', (r) => console.log('REQFAIL', r.url(), r.failure()?.errorText));
  page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
  const t0 = Date.now();
  try {
    await page.goto(base + '/index.html?lang=zh', { waitUntil: 'load', timeout: 60000 });
    console.log('goto load OK', Date.now() - t0, 'ms');
    await page.waitForFunction(() => document.body.dataset.ready === '1', { timeout: 30000 });
    console.log('ready OK', await page.evaluate(() => window.TOTAL));
  } catch (e) { console.log('FAIL', e.message.split('\n')[0]); }
  await browser.close(); server.close();
  fs.rmSync(profile, { recursive: true, force: true });
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
