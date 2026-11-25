/* SPDX-License-Identifier: GPL-3.0-or-later */
// 把 src/design/frame.html 里的关键帧逐张截成 1920×1080 PNG。审片页与定稿陈列页共用。
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');
const { CHROME } = require('../../../../kit/tools/lib');

const design = path.resolve(__dirname, '../src/design');

// shots: [{ id, left }]，left 为该帧左上角显示的剩余秒数。
async function captureFrames(shots, outDir) {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME(), headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 1920, height: 1080 });
    for (const shot of shots) {
      const url = pathToFileURL(path.join(design, 'frame.html'));
      url.searchParams.set('id', shot.id);
      url.searchParams.set('left', shot.left);
      await page.goto(url.href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      assert.deepEqual(errors, [], `${shot.id} 脚本出错`);
      const problems = await page.evaluate(() => {
        const out = [];
        for (const node of document.querySelectorAll('#frame h1,#frame h2,#frame p,#frame li,#frame span,#frame strong,#frame code,#frame b')) {
          const rect = node.getBoundingClientRect();
          if (!rect.width || !node.textContent.trim()) continue;
          if (rect.left < 116 || rect.right > 1804 || rect.top < 44 || rect.bottom > 968) out.push('越界 ' + node.textContent.trim());
          // 文字被自己的盒子截断或折行溢出
          if (node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).overflow !== 'visible') out.push('裁切 ' + node.textContent.trim());
        }
        // 方框与连线也不能压到底部秒尺（y = 968 起）上。
        for (const node of document.querySelectorAll('#frame > :not(.hud):not(.runtime) *')) {
          const rect = node.getBoundingClientRect();
          if (rect.width && rect.bottom > 960) out.push('压到秒尺 ' + (node.className || node.tagName));
        }
        return [...new Set(out)];
      });
      assert.deepEqual(problems, [], `${shot.id} 内容越出安全区`);
      await page.screenshot({ path: path.join(outDir, shot.id + '.png') });
    }
  } finally {
    await browser.close();
  }
}

module.exports = { captureFrames };
