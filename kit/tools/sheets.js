// 总览图：把若干时刻的画面缩小后拼在一起，一次看十几帧。给能看图的制作者和审片的人用。
// 用法：node kit/tools/sheets.js <视频> cue             每句旁白说完那一刻（带句号标签）
//       node kit/tools/sheets.js <视频> every 4         沿时间线每 4 秒一帧
//       node kit/tools/sheets.js <视频> at 12.5 a3 c5+1  指定的时刻（写法同 look.js）
//       --name 名字   输出文件名里的标识（at 模式默认 at）；--cols 3 --rows 3 每张的格数；--workers 4 并行的浏览器数
//       --frames      同时保留每一帧的单张小图（shots/sheets/<语言>-<名字>/f_NNNN.jpg），供脚本分析
// 产物：shots/sheets/<语言>-<名字>_NN.jpg（每格 640×360）
const { needVideo, LANGS, layout, parseTimes, without, startServer, openPage, arg, flag, dirs, mkdirp, rel, tile, path, fs } = require('./lib');
(async () => {
  needVideo();
  const rest = without(['name', 'cols', 'rows', 'workers', 'lang'], ['frames']);
  const mode = rest[0] || 'cue', cols = +arg('cols', 3), rows = +arg('rows', 3), W = Math.max(1, +arg('workers', 4));
  for (const lang of LANGS()) {
    const { L } = layout(lang);
    const items = mode === 'cue' ? L.order.map((id) => L.cues[id]).filter((c) => !c.silent).map((c) => ({ t: +(c.end - 0.05).toFixed(3), label: c.id + '  ' + c.end.toFixed(1) + 's' }))
      : mode === 'every' ? parseTimes(L, ['--every', rest[1] || '4']).map((x) => ({ t: x.t, label: x.t.toFixed(1) + 's' }))
      : mode === 'at' ? parseTimes(L, rest.slice(1)).map((x) => ({ t: x.t, label: x.t.toFixed(2) + 's' }))
      : (console.error('模式只能是 cue / every <秒> / at <时刻…>'), process.exit(2));
    const name = arg('name', mode), dir = mkdirp(path.join(dirs(lang).shots, 'sheets')), tmp = path.join(dir, `${lang}-${name}`);
    fs.rmSync(tmp, { recursive: true, force: true }); mkdirp(tmp);
    const { server, base } = await startServer();
    const pages = [];
    for (let i = 0; i < Math.min(W, items.length); i++) {                    // 串行打开
      const ctx = await openPage(base, { lang, scale: 640 / 1920 });
      await ctx.page.evaluate(() => { const d = document.createElement('div'); d.id = 'dbg'; d.style.cssText = 'position:absolute;left:50%;top:6px;transform:translateX(-50%);z-index:99;font:600 30px monospace;color:#fff;background:#b00;padding:2px 14px'; document.getElementById('stage').appendChild(d); });
      pages.push(ctx);
    }
    let next = 0;
    await Promise.all(pages.map(async ({ browser, page }) => {
      for (;;) { const i = next++; if (i >= items.length) break;
        await page.evaluate((t, l) => { window.seek(t); document.getElementById('dbg').textContent = l; }, items[i].t, items[i].label);
        await page.screenshot({ path: path.join(tmp, `f_${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 88 }); }
      await browser.close();
    }));
    server.close();
    for (const f of fs.readdirSync(dir)) if (f.startsWith(`${lang}-${name}_`) && f.endsWith('.jpg')) fs.rmSync(path.join(dir, f));
    const files = items.map((_, i) => path.join(tmp, `f_${String(i).padStart(4, '0')}.jpg`));
    const out = await tile(files, path.join(dir, `${lang}-${name}_%02d.jpg`), { cols, rows });
    fs.writeFileSync(path.join(tmp, 'times.json'), JSON.stringify(items));
    if (!flag('frames')) fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`${lang}：${items.length} 帧 → ${out.map(rel).join(' ')}`);
  }
})();
