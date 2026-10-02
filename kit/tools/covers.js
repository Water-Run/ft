// 投稿封面：由 src/cover.html 输出 16:9（3840×2160）与 4:3（3200×2400）PNG，另存 1 倍尺寸的 JPG。
// 用法：node kit/tools/covers.js <视频> [--lang zh]             省略 --lang 时出全部语言的封面
//   出图之前先用 look.js 查版面：
//     node kit/tools/look.js <视频> --url "/cover.html?r=169&lang=zh" --size 1920x1080
//     node kit/tools/look.js <视频> --url "/cover.html?r=43&lang=zh"  --size 1600x1200
// cover.html 的约定：?r=169 / ?r=43 切换版式，?lang= 切换语言；就绪后置 document.body.dataset.ready = '1'
// 产物：out/cover-<语言>-16x9.jpg、out/cover-<语言>-4x3.jpg 及对应的 2 倍 PNG。
const { spawnSync } = require('child_process');
const { needVideo, LANGS, FFMPEG, VIDEO, startServer, openPage, mkdirp, path } = require('./lib');
(async () => {
  needVideo();
  const out = mkdirp(path.join(VIDEO, 'out'));
  const { server, base } = await startServer();
  for (const lang of LANGS(true)) for (const [r, w, h, name] of [['169', 1920, 1080, `cover-${lang}-16x9`], ['43', 1600, 1200, `cover-${lang}-4x3`]]) {
    const { browser, page } = await openPage(base, { url: `/cover.html?r=${r}&lang=${lang}`, width: w, height: h, scale: 2, ready: false });
    await page.waitForFunction(() => document.body.dataset.ready === '1', { timeout: 60000 });
    await new Promise((x) => setTimeout(x, 800));
    const png = path.join(out, `${name}-${w * 2}x${h * 2}.png`);
    await page.screenshot({ path: png, type: 'png' });
    spawnSync(FFMPEG(), ['-y', '-loglevel', 'error', '-i', png, '-vf', `scale=${w}:${h}:flags=lanczos`, '-q:v', '2', path.join(out, `${name}.jpg`)], { stdio: 'inherit' });
    await browser.close(); console.log(`out/${name}.jpg  out/${path.basename(png)}`);
  }
  server.close();
})();
