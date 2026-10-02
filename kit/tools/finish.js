// 成片封装：核对音画长度 → 响度处理 → 封装（主混音 / 仅旁白 / 无配乐）→ 导出字幕 → 规格、静止段、空画面检查 → 列出交付物。
// 用法：node kit/tools/finish.js <视频> [--lang zh]             省略 --lang 时处理全部语言
//         需要先有 out/<语言>/video.mp4（render.js）与 out/<语言>/audio.wav、audio_voice.wav（audio.js）
//       node kit/tools/finish.js <视频> --audio out/zh/audio_b.wav --name 试听-复古配乐
//         只把另一条混音封装成 out/<slug>-<语言>-<name>.mp4（试听片），不动正片
//       --no-blank   不做空画面检查（它要解码整部片子，约十几秒）
// 成片命名：out/<slug>-<语言>-1080p60.mp4，另有 -voice-only、-no-music；字幕 out/<slug>-<语言>.srt。检查结果写 build/finish.<语言>.json（check.js --final 读它）。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, LANGS, KIT, FFMPEG, FFPROBE, PY, pythonPath, VIDEO, arg, flag, layout, dirs, mkdirp, rel, pyEnv, mmss, path, fs } = require('./lib');
needVideo();
const P = PROJECT(), slug = P.slug, OUT = mkdirp(path.join(VIDEO, 'out'));
const ff = (args, o = {}) => spawnSync(FFMPEG(), args, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
// 响度：固定增益 + 限幅（单遍 loudnorm 会抽动，不用）。增益按主混音的实测响度算到约 -16 LUFS，三个版本用同一个增益，旁白电平因此一致
const measure = (f) => { const t = ff(['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr; const i = [...t.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(), p = [...t.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop(); return { I: i ? +i[1] : NaN, TP: p ? +p[1] : NaN }; };
const mux = (video, audio, out, meta) => ff(['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', ...meta, '-movflags', '+faststart', out], { stdio: 'inherit' });
const srtTime = (t) => { const ms = Math.round(t * 1000); const p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
let failed = false;
for (const lang of LANGS(true)) {
  const d = dirs(lang), o = (f) => path.join(d.out, f), video = o('video.mp4');
  const audio = path.resolve(VIDEO, arg('audio', path.join('out', lang, 'audio.wav')));
  for (const f of [video, audio, o('audio_voice.wav')]) if (!fs.existsSync(f)) { console.error('缺少 ' + rel(f)); process.exit(1); }
  const meta = ['-metadata', 'title=' + (P.titles[lang] || slug), '-metadata', 'language=' + lang];
  const { L, strip } = layout(lang);
  console.log(`■ ${lang}`);
  // 画面与声音的长度必须一致：渲染丢帧时画面会变短，-shortest 会把声音也截掉，成片看上去「正常」却少了一段
  const fps = +(P.render.fps || 60);
  const frames = parseInt(spawnSync(FFPROBE(), ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', video], { encoding: 'utf8' }).stdout, 10) || 0;
  const adur = +spawnSync(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio], { encoding: 'utf8' }).stdout || 0;
  console.log(`  画面 ${frames} 帧 = ${(frames / fps).toFixed(2)}s，声音 ${adur.toFixed(2)}s，时间线 ${L.total.toFixed(2)}s`);
  if (Math.abs(frames / fps - adur) > 0.25 || Math.abs(adur - L.total) > 0.6) { console.error(`  ✗ 画面、声音与时间线的长度不一致：脚本或配音改过之后要重新 audio.js 与 render.js；渲染日志末行要有 verified frames。这一版不封装`); failed = true; continue; }
  const m0 = measure(audio), gain = Math.max(-6, Math.min(20, -16 - m0.I + 0.4));
  const af = `volume=${gain.toFixed(1)}dB,alimiter=limit=0.84:level=disabled:attack=5:release=80`;
  const alt = arg('name', null);
  if (alt) {                                   // 试听片：同一画面配另一条混音
    ff(['-y', '-loglevel', 'error', '-i', audio, '-af', af, o('audio_alt_final.wav')], { stdio: 'inherit' });
    const name = `${slug}-${lang}-${alt}.mp4`; mux(video, o('audio_alt_final.wav'), path.join(OUT, name), meta);
    const m = measure(o('audio_alt_final.wav')); fs.rmSync(o('audio_alt_final.wav'), { force: true });
    console.log(`  试听片 out/${name}   响度 I=${m.I} LUFS  TP=${m.TP} dBFS`);
    continue;
  }
  const versions = [['audio.wav', ''], ['audio_voice.wav', '-voice-only']];
  if (fs.existsSync(o('audio_nomusic.wav')) && (P.audio.music || 'pad') !== 'none') versions.push(['audio_nomusic.wav', '-no-music']);
  let m1 = null;
  for (const [src, suffix] of versions) {
    const fin = o(src.replace('.wav', '_final.wav'));
    ff(['-y', '-loglevel', 'error', '-i', suffix ? o(src) : audio, '-af', af, fin], { stdio: 'inherit' });
    if (!suffix) m1 = measure(fin);
    mux(video, fin, path.join(OUT, `${slug}-${lang}-1080p60${suffix}.mp4`), meta);
    fs.rmSync(fin, { force: true });
  }
  console.log(`  响度：增益 ${gain.toFixed(1)} dB → I=${m1.I} LUFS  TP=${m1.TP} dBFS（目标 -16±1.5 / ≤ -1）`);
  // 外挂字幕：与画面内字幕同文同步
  const cues = L.order.map((id) => L.cues[id]).filter((c) => c.cap);
  fs.writeFileSync(path.join(OUT, `${slug}-${lang}.srt`), cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(Math.min(c.end + 0.25, cues[i + 1] ? cues[i + 1].start - 0.05 : c.end + 0.5))}\n${strip(c.cap)}\n`).join('\n'));
  // 规格与静止段（不看底部字幕条）
  const main = path.join(OUT, `${slug}-${lang}-1080p60.mp4`);
  const probe = spawnSync(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height,r_frame_rate', '-of', 'default=nw=1', main], { encoding: 'utf8' }).stdout;
  const dur = +(probe.match(/duration=([\d.]+)/) || [0, 0])[1];
  console.log('  ' + [...new Set(probe.trim().split(/\r?\n/))].join('  '));
  const fr = ff(['-hide_banner', '-nostats', '-i', video, '-vf', 'crop=iw:ih*0.89:0:0,freezedetect=n=-52dB:d=3', '-map', '0:v', '-f', 'null', '-']).stderr;
  const a = [...fr.matchAll(/freeze_start: ([\d.]+)/g)].map((x) => +x[1]), b = [...fr.matchAll(/freeze_duration: ([\d.]+)/g)].map((x) => +x[1]);
  console.log(`  画面基本不动 ≥3 秒的段落（不含字幕条）：${b.length ? '' : '无'}`);
  for (let i = 0; i < b.length; i++) console.log(`    ! ${a[i].toFixed(1)}s（${mmss(a[i])}）起，持续 ${b[i].toFixed(1)}s`);
  let blank = null;
  if (!flag('no-blank') && pythonPath()) {
    const r = spawnSync(PY(), [path.join(KIT, 'tools', 'blank_check.py')], { encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ...pyEnv(lang) } });
    const lines = (r.stdout || '').trim().split(/\r?\n/);
    try { blank = JSON.parse(lines[lines.length - 1]); console.log('  ' + lines.slice(0, -1).join('\n  ')); } catch (e) { console.log('  空画面检查没有跑成：' + ((r.stderr || '').trim().split(/\r?\n/).pop() || '未知原因')); }
  }
  fs.writeFileSync(path.join(mkdirp(d.build), `finish.${lang}.json`), JSON.stringify({ lang, duration: dur, expected: L.total, frames, loudness: m1, gain: +gain.toFixed(1), freezes: b.map((x, i) => ({ start: a[i], d: x })), blank, probe, versions: versions.map((v) => `${slug}-${lang}-1080p60${v[1]}.mp4`) }, null, 1));
}
console.log('交付物（out/）：');
for (const n of fs.readdirSync(OUT).sort()) if (/\.(mp4|srt|jpg|png)$/.test(n)) console.log(`  ${n.padEnd(52)} ${(fs.statSync(path.join(OUT, n)).size / 1048576).toFixed(1).padStart(7)} MB`);
process.exit(failed ? 1 : 0);
