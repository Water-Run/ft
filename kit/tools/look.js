// 用文字看画面：打印若干时刻画面上真正可见的元素（位置、字号、颜色、文字），指出这一帧的版面问题，并存一张 PNG 到 shots/。
// 不能看图的模型靠文字输出判断画面；能看图的再去读 shots/ 里的 PNG。
// 用法：node kit/tools/look.js <视频> 12.5 30             看第 12.5 秒和第 30 秒
//       node kit/tools/look.js <视频> a3 c5               看这两句旁白「说完那一刻」
//       node kit/tools/look.js <视频> a3:0.5 a3+1.2 a3e-0.3    a3 进行到一半；a3 开始后 1.2 秒；a3 结束前 0.3 秒
//       node kit/tools/look.js <视频> --scene s3 [步长]    沿场景 s3 每 2 秒看一帧
//       node kit/tools/look.js <视频> --url "/cover.html?r=169&lang=zh" --size 1920x1080    看封面（或任意静态页）
//       --lang en 换语言；--scale 0.5 存小图；--brief 只列问题与截图，不列元素；--no-shot 不存截图
// 坐标系：画面 1920×1080，左上角为原点；y 在 968–1080 是字幕条。数值是镜头变换之后的最终位置。
const { needVideo, PROJECT, LANGS, layout, parseTimes, without, startServer, openPage, arg, flag, dirs, mkdirp, rel, path } = require('./lib');
const { COLLECT, problems, refine, describe, configure } = require('./inspect');
(async () => {
  needVideo(); configure(PROJECT().check);
  const lang = LANGS()[0], { L } = layout(lang);
  const url = arg('url', null), [w, h] = arg('size', '1920x1080').split('x').map(Number), scale = +arg('scale', 1);
  const times = parseTimes(L, without(['url', 'size', 'scale', 'lang'], ['brief', 'no-shot']));
  if (!url && !times.length) { console.log('用法见文件头注释。例：node kit/tools/look.js <视频> 12.5    或    node kit/tools/look.js <视频> a3'); process.exit(1); }
  const { server, base } = await startServer();
  const { browser, page, logs } = await openPage(base, url ? { url, width: w, height: h, scale, ready: false } : { lang, scale });
  const shots = mkdirp(dirs(lang).shots), brief = flag('brief'), noShot = flag('no-shot');
  const paper = await page.evaluate(() => { const b = document.getElementById('bg') || document.getElementById('stage'); const m = getComputedStyle(b).backgroundColor.match(/[\d.]+/g) || [236, 232, 223]; return '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase(); });
  if (url) {
    await page.waitForFunction(() => document.body.dataset.ready === '1', { timeout: 60000 });
    const items = await page.evaluate(COLLECT);
    const png = path.join(shots, 'page_' + url.replace(/[^\w]+/g, '_') + '.png'); if (!noShot) await page.screenshot({ path: png });
    console.log(`■ ${url}  （${w}×${h}）  截图 ${rel(png)}` + (brief ? '' : '\n' + describe(items)));
    const ps = (await refine(page, problems(items, paper))).filter((p) => p.code !== 'CAPZONE'); console.log(ps.length ? '  问题：\n' + ps.map((p) => '   ✗ ' + p.msg).join('\n') : '  问题：无');
  }
  for (const { t, label } of times) {
    await page.evaluate((x) => window.seek(x), t);
    const items = await page.evaluate(COLLECT);
    const sc = L.scenes.find((s) => t >= s.start && t < s.end);
    const cue = L.order.map((id) => L.cues[id]).find((c) => t >= c.start && t <= c.end);
    const png = path.join(shots, `${lang}_${t.toFixed(2).padStart(7, '0')}.png`); if (!noShot) await page.screenshot({ path: png });
    console.log(`\n■ t=${t.toFixed(2)}s  场景 ${sc ? sc.id : '-'}  ${cue ? '旁白 ' + cue.id : '（句间）'}  ${label}${noShot ? '' : '   截图 ' + rel(png)}`);
    if (!brief) console.log(describe(items) || '  （画面上没有可见元素）');
    const ps = await refine(page, problems(items, paper)), soft = (p) => ['CUT', 'CAPZONE', 'MARGIN'].includes(p.code);
    console.log(ps.some((p) => !soft(p)) ? '  问题：\n' + ps.filter((p) => !soft(p)).map((p) => '   ✗ ' + p.msg).join('\n') : '  问题：无');
    if (ps.some(soft)) console.log('  提示（特写时边缘的次要文字被切属正常；这一刻旁白讲的主体内容不能被切）：\n' + ps.filter(soft).map((p) => '   ! ' + p.msg).join('\n'));
  }
  if (logs.length) console.log('\n页面日志：\n  ' + [...new Set(logs)].slice(0, 30).join('\n  '));
  await browser.close(); server.close();
})();
