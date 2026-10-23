// 编码后端：浏览器 GPU 出帧与视频硬件编码是两个独立开关。
// node kit/tools/encoder.js [--encoder auto|libx264|h264_nvenc]：实际编码三帧探测，不凭编码器列表判断驱动可用。
// auto 优先 NVENC，初始化失败时回退 libx264；显式指定的后端失败则报错。当前只支持这两个后端。
const { spawnSync } = require('node:child_process');

function encodingArgs(encoder, { crf = 15, cq = 19, threads = 4 } = {}) {
  if (encoder === 'libx264') return ['-c:v', encoder, '-threads', String(threads), '-preset', 'medium', '-crf', String(crf)];
  if (encoder === 'h264_nvenc') return ['-c:v', encoder, '-preset', 'p5', '-tune', 'hq', '-rc', 'vbr', '-cq', String(cq), '-b:v', '0'];
  throw new Error('不支持的编码器：' + encoder);
}
function selectEncoder(ffmpeg, requested = 'libx264', options = {}, execute = spawnSync) {
  if (!['auto', 'libx264', 'h264_nvenc'].includes(requested)) throw new Error('encoder 只能是 auto、libx264 或 h264_nvenc');
  const attempts = [];
  for (const name of requested === 'auto' ? ['h264_nvenc', 'libx264'] : [requested]) {
    const args = encodingArgs(name, options);
    const r = execute(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=black:s=${options.width || 1920}x${options.height || 1080}:r=${options.fps || 60}`,
      '-frames:v', '3', ...args, '-pix_fmt', 'yuv420p', '-f', 'null', '-'], { encoding: 'utf8', timeout: 20000, windowsHide: true });
    const ok = !r.error && r.status === 0;
    attempts.push({ encoder: name, ok, reason: ok ? null : (r.error?.message || r.stderr || '退出码 ' + r.status).trim().slice(-800) });
    if (ok) return { name, args, attempts };
  }
  throw new Error('编码器不可用：' + attempts.map((x) => `${x.encoder}: ${x.reason}`).join('\n'));
}
module.exports = { encodingArgs, selectEncoder };
if (require.main === module) {
  try {
    const { FFMPEG, arg } = require('./lib');
    const result = selectEncoder(FFMPEG(), arg('encoder', 'auto'));
    console.log(JSON.stringify(result, null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
