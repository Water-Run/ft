// 低清预演：用 1/4 分辨率、15 帧/秒快速渲染一遍（几分钟的片子约 1–2 分钟），再从像素层面找「画面不动」的段落。
// 用法：node kit/tools/preview.js <视频> [--lang en] [--from 秒 --to 秒]
// 产物：out/<语言>/preview_video.mp4；整片预演且已有 out/<语言>/audio.wav 时，另出带音轨的 out/<语言>/preview.mp4 供试看。
// scan.js 的 STILL 看的是元素有没有变；这里看像素有没有变，两者都要过。检测时不看底部字幕条。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, LANGS, VIDEO, FFMPEG, arg, run, dirs, mkdirp, rel, mmss, path, fs } = require('./lib');
needVideo();
const lang = LANGS()[0], d = dirs(lang), limit = +((PROJECT().check.still_seconds) || 3);
const extra = []; for (const k of ['from', 'to']) if (arg(k, null) != null) extra.push('--' + k, arg(k));
const v = path.join(mkdirp(d.out), 'preview_video.mp4');
run(process.execPath, [path.join(__dirname, 'render.js'), VIDEO, '--lang', lang, '--scale', '0.25', '--fps', '15', '--mb', '1', '--workers', '8', '--crf', '30', '--out', v, ...extra]);
const r = spawnSync(FFMPEG(), ['-hide_banner', '-nostats', '-i', v, '-vf', `crop=iw:ih*0.89:0:0,freezedetect=n=-48dB:d=${Math.max(1, limit - 0.5)}`, '-map', '0:v', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
const txt = (r.stderr || '') + (r.stdout || '');
const a = [...txt.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => +m[1]), b = [...txt.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => +m[1]);
const off = +arg('from', 0);
console.log(`\n画面基本不动 ≥${Math.max(1, limit - 0.5)} 秒的段落（不含字幕条）：${b.length ? '' : '无'}`);
for (let i = 0; i < b.length; i++) console.log(`  ${b[i] >= limit ? '✗' : '!'} ${(a[i] + off).toFixed(1)}s（${mmss(a[i] + off)}）起，持续 ${b[i].toFixed(1)}s`);
const bad = b.filter((x) => x >= limit).length;
fs.writeFileSync(path.join(mkdirp(d.build), `preview.${lang}.json`), JSON.stringify({ from: off, to: arg('to', null), freezes: b.map((x, i) => ({ start: +(a[i] + off).toFixed(2), d: x })) }));
const au = path.join(d.out, 'audio.wav');
if (fs.existsSync(au) && !extra.length) { spawnSync(FFMPEG(), ['-y', '-loglevel', 'error', '-i', v, '-i', au, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', path.join(d.out, 'preview.mp4')], { stdio: 'inherit' }); console.log('带音轨的预演：' + rel(path.join(d.out, 'preview.mp4'))); }
console.log(bad ? `✗ 有 ${bad} 段静止超过 ${limit} 秒：回到对应场景加镜头运动或元素动作` : `✓ 没有超过 ${limit} 秒的静止段`);
process.exit(bad ? 1 : 0);
