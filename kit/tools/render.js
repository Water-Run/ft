// 并行出帧：N 个无头 Chrome 各渲染一段时间线，逐帧截图经管道送入 ffmpeg，最后无损拼接成 out/<语言>/video.mp4（无声）。
// 用法：node kit/tools/render.js <视频> [--lang zh] [--fps 60] [--scale 1] [--workers N] [--from 0] [--to 总长] [--out 文件] [--crf 15]
//       --mb 4        运动模糊：每帧渲染 N 个子帧再平均（耗时 ×N）；--shutter 0.5 快门开角占一帧的比例
//       --gpu 1       启用硬件加速（WebGL 场景需要；先用 glprobe.js 探测）
//       --threads 4   每个编码进程的线程数（不限时每个进程按 CPU 核数开线程，1080p 下各占约 1.6 GB，九路就是 14 GB）
// 省略 --lang 时依次渲染全部语言。缺省值取 project.json 的 render 段（fps、mb、shutter、crf、workers、gpu），命令行优先。workers 缺省为 CPU 线程数的三分之一（2–9）。
// 完整性：每张截图入管道前先验 PNG 的头、尺寸与结尾；每一段编码完数一遍帧数，不符就单独重渲那一段；
//         拼接后再数一遍总帧数。任何一步对不上都以非零退出码结束，不会交出一部悄悄少了帧的片子。日志末行应有 verified frames=<总帧数>。
// 像素格式：截图通常是 RGB，但个别帧会因为合成层边缘的几个透明像素变成 RGBA。图像流的格式中途一变，ffmpeg 就重建滤镜图：
//         若用 setpts=N/… 给帧编号，N 随之归零，其后的帧被当成「迟到」整段丢掉——日志里没有任何报错，成片却短了一截。
//         所以 RGBA 帧在入管道前改写成 RGB（pngfix.js），时间戳由输入时间戳平移得到，不依赖会归零的计数。
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const { needVideo, PROJECT, LANGS, FFMPEG, FFPROBE, arg, dirs, mkdirp, rel, startServer, openPage, sourceState, path, fs } = require('./lib');
const pngfix = require('./pngfix');
needVideo();
const R = PROJECT().render, opt = (k, d) => arg(k, R[k] != null ? R[k] : d);
const FPS = +opt('fps', 60), SCALE = +arg('scale', 1), CRF = String(opt('crf', 15));
const WORKERS = +opt('workers', Math.max(2, Math.min(9, Math.floor(os.cpus().length / 3))));
const MB = Math.max(1, +opt('mb', 1)), SHUTTER = +opt('shutter', 0.5), GPU = !!+opt('gpu', 0), THREADS = String(+arg('threads', 4));
const PW = Math.round(1920 * SCALE), PH = Math.round(1080 * SCALE);
// 缩小出图（低清预演）时显式给出裁剪区与比例：新版 Chrome 的直接截图不理会小于 1 的设备像素比，出来仍是 1920×1080
const SHOT = SCALE !== 1 ? { clip: { x: 0, y: 0, width: 1920, height: 1080, scale: SCALE } } : {};
const IEND = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
const pngOk = (b) => b.length > 64 && b.readUInt32BE(0) === 0x89504e47 && b.readUInt32BE(4) === 0x0d0a1a0a
  && b.readUInt32BE(16) === PW && b.readUInt32BE(20) === PH && b[24] === 8 && (b[25] === 2 || b[25] === 6) && b[28] === 0 && b.subarray(b.length - 8).equals(IEND);
const countFrames = (file) => {
  const r = spawnSync(FFPROBE(), ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return parseInt((r.stdout || '').trim(), 10) || 0;
};

async function worker(f0, f1, ctx, segPath, prog) {
  const { browser, page } = ctx;
  const cdp = await page.createCDPSession();
  // 子帧以 FPS×MB 的帧率送入，tmix 取 MB 帧平均后每 MB 帧留一帧
  const vf = (MB > 1 ? `tmix=frames=${MB},select='not(mod(n+1,${MB}))',setpts=PTS-${MB - 1}/(${FPS * MB}*TB),` : '') + 'scale=in_range=full:out_range=tv:out_color_matrix=bt709';
  const ff = spawn(FFMPEG(), ['-y', '-loglevel', 'error', '-threads', '2', '-f', 'image2pipe', '-framerate', String(FPS * MB), '-c:v', 'png', '-i', '-',
    '-vf', vf, '-c:v', 'libx264', '-threads', THREADS, '-preset', 'medium', '-crf', CRF, '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-g', String(FPS * 2), '-r', String(FPS), segPath], { stdio: ['pipe', 'inherit', 'inherit'] });
  let pipeErr = null; ff.stdin.on('error', (e) => { pipeErr = e; });
  const done = new Promise((r) => ff.on('close', r));
  let bad = 0, rgba = 0;
  try {
    for (let f = f0; f < f1; f++) {
      for (let s = 0; s < MB; s++) {
        // tmix 输出的第 k 帧是「到当前为止的 MB 帧」的平均，所以子帧排在本帧时刻之前的快门区间内
        const t = (f - (MB > 1 ? SHUTTER * (1 - (s + 1) / MB) : 0)) / FPS;
        let buf = null;
        for (let k = 0; k < 6; k++) {
          await page.evaluate((x) => window.seek(Math.max(0, x)), t);
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, ...SHOT });
          const b = Buffer.from(data || '', 'base64');
          if (pngOk(b)) { buf = b; break; }
          bad++; await new Promise((r) => setTimeout(r, 200 * (k + 1)));
        }
        if (!buf) throw new Error(`t=${t.toFixed(3)} 的截图重试后仍不是合法的 ${PW}x${PH} PNG`);
        if (buf[25] === 6) { buf = pngfix.rgbaToRgb(buf).png; rgba++; }
        if (pipeErr) throw pipeErr;
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      prog.n++;
    }
  } finally {
    ff.stdin.end();
    await done;
    await browser.close().catch(() => {});
  }
  if (bad) console.log(`  ${path.basename(segPath)}: ${bad} 张不合法的截图已重试`);
  if (rgba) console.log(`  ${path.basename(segPath)}: ${rgba} 张 RGBA 截图已改写为 RGB`);
}

async function render(lang) {
  const OUT = path.resolve(arg('out', path.join(dirs(lang).out, 'video.mp4')));
  const { server, base } = await startServer();
  const open = () => openPage(base, { lang, scale: SCALE, gpu: GPU });
  const first = await open();
  const total = await first.page.evaluate(() => window.TOTAL);
  const from = +arg('from', 0), to = +arg('to', total);
  const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS), N = F1 - F0;
  const W = Math.min(WORKERS, Math.max(1, Math.floor(N / 30)));
  mkdirp(path.dirname(OUT));
  const segDir = OUT + '.segs'; fs.rmSync(segDir, { recursive: true, force: true }); mkdirp(segDir);
  const ctxs = [first];
  for (let i = 1; i < W; i++) ctxs.push(await open());   // 串行打开
  console.log(`■ ${lang}  页面就绪 ${W} 个  fps=${FPS} mb=${MB} scale=${SCALE} threads=${THREADS}  ${from.toFixed(2)}–${to.toFixed(2)}s 共 ${N} 帧`);
  const prog = { n: 0 }, t0 = Date.now();
  const timer = setInterval(() => { const el = (Date.now() - t0) / 1000; console.log(`frames ${prog.n}/${N}  ${(prog.n / el).toFixed(1)} fps  eta ${((N - prog.n) / Math.max(1, prog.n / el)).toFixed(0)}s`); }, 15000);
  const plan = [];
  for (let i = 0; i < W; i++) plan.push({ a: F0 + Math.floor(N * i / W), b: F0 + Math.floor(N * (i + 1) / W), seg: path.join(segDir, `seg_${String(i).padStart(3, '0')}.mp4`), err: null });
  await Promise.all(plan.map((p, i) => worker(p.a, p.b, ctxs[i], p.seg, prog).catch((e) => { p.err = e; })));
  clearInterval(timer);
  // 逐段核对帧数；不符的段单独重渲（串行，各用一个新页面），最多两次
  let failed = false;
  for (const p of plan) {
    const want = p.b - p.a;
    for (let attempt = 0; ; attempt++) {
      const got = p.err ? -1 : countFrames(p.seg);
      if (got === want) break;
      console.log(`  ${path.basename(p.seg)}: ${p.err ? '出错: ' + p.err.message : `有 ${got} 帧，应为 ${want} 帧`}${attempt < 2 ? ' → 重渲这一段' : ''}`);
      if (attempt >= 2) { failed = true; break; }
      p.err = null;
      try { await worker(p.a, p.b, await open(), p.seg, { n: 0 }); } catch (e) { p.err = e; }
    }
  }
  if (failed) { console.error('渲染失败：有的段无法完整渲染；各段留在 ' + rel(segDir)); server.close(); process.exit(1); }
  const list = path.join(segDir, 'list.txt');
  fs.writeFileSync(list, plan.map((p) => `file '${p.seg.replace(/\\/g, '/')}'`).join('\n'));
  const r = spawnSync(FFMPEG(), ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  const outFrames = countFrames(OUT);
  console.log(`done ${N} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${rel(OUT)} (exit ${r.status}) total=${total.toFixed(2)}s  verified frames=${outFrames}`);
  if (r.status !== 0 || outFrames !== N) { console.error(`渲染失败：成片有 ${outFrames} 帧，应为 ${N} 帧；各段留在 ${rel(segDir)}`); server.close(); process.exit(1); }
  fs.rmSync(segDir, { recursive: true, force: true });
  // 整片、原尺寸、默认位置的渲染：记下这一版画面对应的源码状态，交付前据此判断成片是否过期
  if (F0 === 0 && Math.abs(to - total) < 1e-6 && SCALE === 1 && arg('out', null) == null) fs.writeFileSync(path.join(dirs(lang).out, 'video.json'), JSON.stringify({ lang, frames: N, fps: FPS, mb: MB, total, rendered: new Date().toISOString(), sources: sourceState() }, null, 1));
  server.close();
}
(async () => {
  const langs = LANGS(true);
  if (arg('out', null) != null && langs.length > 1) { console.error('带 --out 时一次只能渲染一种语言：加上 --lang <语言>'); process.exit(2); }
  for (const lang of langs) await render(lang);
})().catch((e) => { console.error(e); process.exit(1); });
