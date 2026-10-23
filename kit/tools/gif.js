// 把一个以 t 为唯一输入的页面录成循环 GIF（根 README 的动图等）。不需要视频目录，不配音。
// 用法：node kit/tools/gif.js <页面.html> [--out <文件.gif>] [--fps 25] [--scale 1] [--dither none]，命令行优先于页面给出的值
// 页面约定：window.GIF = { width, height, fps, dur, scale } 给出画幅、帧率、时长与出图倍率（缺省 1）；window.seek(t) 画出时刻 t 的一帧；
//          可选 window.READY（Promise，字体等就绪后兑现）。画面同样是 t 的纯函数，规则与视频相同。
// 页面经本地服务器打开：仓库根目录映射到 /，assets/fonts/ 映射到 /fonts/（与引擎的 base.css 一致）。
// 输出缺省与页面同名、扩展名为 .gif。全部帧先汇总生成一张 256 色调色板再编码，循环播放。
// fps 宜整除 100（25、50）：GIF 的帧间隔以 1/100 秒计，其他帧率会被取整，播放速度不准。
const http = require('node:http');
const { spawn } = require('node:child_process');
const { REPO, ASSETS, FFMPEG, arg, positional, openPage, path, fs } = require('./lib');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

function serve() {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const p = path.resolve(u.startsWith('/fonts/') ? path.join(ASSETS, 'fonts', u.slice(7)) : path.join(REPO, u));
    if (!p.startsWith(REPO + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(p, (err, buf) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(buf);
    });
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

async function main() {
  const [page0] = positional(['out', 'fps', 'scale', 'dither']);
  if (!page0) { console.error('用法：node kit/tools/gif.js <页面.html> [--out <文件.gif>] [--fps 25] [--scale 1]'); process.exit(2); }
  const file = path.resolve(page0);
  if (!file.startsWith(REPO + path.sep) || !fs.existsSync(file)) { console.error('页面须是仓库里存在的文件：' + page0); process.exit(2); }
  const out = path.resolve(arg('out', file.replace(/\.html?$/i, '') + '.gif'));
  const { server, base } = await serve();
  const url = '/' + path.relative(REPO, file).split(path.sep).join('/');
  const { browser, page, logs } = await openPage(base, { url, lang: 'zh' });
  try {
    const spec = await page.evaluate(() => window.GIF);
    if (!spec || !(spec.width > 0) || !(spec.height > 0) || !(spec.dur > 0)) throw new Error('页面没有给出 window.GIF = { width, height, fps, dur }');
    const fps = +arg('fps', spec.fps || 25), scale = +arg('scale', spec.scale || 1), frames = Math.round(spec.dur * fps);
    if (!Number.isSafeInteger(fps) || fps < 1 || !(scale > 0)) throw new Error('fps 须是正整数，scale 须为正数');
    await page.setViewport({ width: spec.width, height: spec.height, deviceScaleFactor: scale });
    const cdp = await page.createCDPSession();
    const dither = arg('dither', 'none');
    const ff = spawn(FFMPEG(), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-vf', `split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=${dither}:diff_mode=rectangle`, '-loop', '0', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((resolve, reject) => { ff.on('error', reject); ff.on('close', resolve); });
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.seek(t), f / fps);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: spec.width, height: spec.height, scale } });
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % fps === 0) process.stdout.write(`\r  ${f}/${frames}`);
    }
    ff.stdin.end();
    const code = await done;
    if (code !== 0) throw new Error('ffmpeg 退出码 ' + code);
    if (logs.length) console.warn('\n页面日志：\n  ' + logs.join('\n  '));
    console.log(`\r  ${frames} 帧，${spec.width * scale}×${spec.height * scale}，${fps} 帧/秒 → ${path.relative(REPO, out).split(path.sep).join('/')}（${(fs.statSync(out).size / 1048576).toFixed(2)} MB）`);
  } finally { await browser.close(); server.close(); }
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });
