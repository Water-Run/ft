// 成片封装：核对音画长度 → 响度处理 → 封装（主混音 / 仅旁白 / 无配乐）→ 导出字幕 → 规格、静止段、空画面检查 → 列出交付物。
// 用法：node kit/tools/finish.js <视频> [--lang zh]             省略 --lang 时处理全部语言
//         需要先有 out/<语言>/video.mp4（render.js）与 out/<语言>/audio.wav、audio_voice.wav（audio.js）
//       node kit/tools/finish.js <视频> --audio out/zh/audio_b.wav --name 试听-复古配乐
//         只把另一条混音封装成 out/<slug>-<语言>-<name>.mp4（试听片），不动正片
//       --no-blank   不做空画面检查（它要解码整部片子，约十几秒）
// 成片命名：out/<slug>-<语言>-<高>p<帧率>.mp4（按画面实测，如 1080p60、4K 为 2160p60），另有 -voice-only、-no-music；字幕 out/<slug>-<语言>.srt。检查结果写 build/finish.<语言>.json（check.js --final 读它）。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, LANGS, KIT, FFMPEG, FFPROBE, PY, pythonPath, VIDEO, arg, flag, layout, sourceState, dirs, mkdirp, rel, pyEnv, mmss, path, fs } = require('./lib');
const records = require('./artifact-record');
needVideo();
require('./project-files').acquireLock(needVideo());
require('./script-review').assertApproved(needVideo(), PROJECT(), LANGS(true));
const P = PROJECT(), slug = P.slug, OUT = mkdirp(path.join(VIDEO, 'out')), LUFS = +((P.audio || {}).lufs || -16);
const checked = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 1 << 28, ...options });
  if (result.error || result.status !== 0) throw new Error(`${path.basename(command)} 失败：${result.error?.message || (result.stderr || '').trim().slice(-1500) || '退出码 ' + result.status}`);
  return result;
};
const ff = (args, o = {}) => checked(FFMPEG(), args, o);
// 响度：固定增益 + 限幅（单遍 loudnorm 会抽动，不用）。增益按主混音的实测响度算到目标（project.json 的 audio.lufs，缺省 -16 LUFS），三个版本用同一个增益，旁白电平因此一致
const measure = (f) => {
  const t = ff(['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
  const summary = t.slice(t.lastIndexOf('Summary:')), i = summary.match(/I:\s+(-?[\d.]+) LUFS/), p = summary.match(/Peak:\s+(-?[\d.]+) dBFS/);
  const m = { I: i ? +i[1] : NaN, TP: p ? +p[1] : NaN };
  if (!Number.isFinite(m.I) || !Number.isFinite(m.TP)) throw new Error('没有取得有效的最终响度：' + rel(f));
  return m;
};
const mux = (video, audio, out, meta) => ff(['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', ...meta, '-movflags', '+faststart', out], { stdio: 'inherit' });
const srtTime = (t) => { const ms = Math.round(t * 1000); const p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
let failed = false;
(async () => {
  if (arg('audio', null) && !arg('name', null)) throw new Error('--audio 只用于带 --name 的试听片；正式交付使用当前正式混音');
  for (const lang of LANGS(true)) {
    const d = dirs(lang), o = (f) => path.join(d.out, f), video = o('video.mp4');
    const audio = path.resolve(VIDEO, arg('audio', path.join('out', lang, 'audio.wav')));
    const alt = arg('name', null);
    if (alt && (!/^[\p{L}\p{N}_-]+$/u.test(alt) || alt.length > 80)) throw new Error('--name 只能使用文字、数字、下划线与连字符');
    const audioFiles = ['audio.wav', 'audio_voice.wav', ...((P.audio.music || 'pad') === 'none' ? [] : ['audio_nomusic.wav'])];
    for (const f of [video, audio, ...(alt ? [] : audioFiles.map(o))]) if (!fs.existsSync(f)) throw new Error('缺少 ' + rel(f));
    const meta = ['-metadata', 'title=' + (P.titles[lang] || slug), '-metadata', 'language=' + lang];
    const { L, strip } = layout(lang);
    const sources = sourceState(), config = records.finishConfig(P);
    const videoPath = `out/${lang}/video.mp4`;
    const renderProblems = await records.renderProblems(VIDEO, P, lang, L.total, sources);
    if (renderProblems.length) throw new Error('画面与渲染记录不一致：' + renderProblems.join('；'));
    if (!alt) {
      const mixProblems = await records.audioProblems(VIDEO, P, lang, Object.values(L.cues), sources);
      if (mixProblems.length) throw new Error('正式混音已过期：' + mixProblems.join('；'));
    }
    const inputFiles = alt ? [videoPath, `out/${lang}/video.json`] : records.finishInputs(P, lang);
    const inputs = await records.capture(VIDEO, inputFiles);
    console.log(`■ ${lang}`);
    // 画面与声音的长度必须一致：渲染丢帧时画面会变短，-shortest 会把声音也截掉，成片看上去「正常」却少了一段
    const fps = +(P.render.fps || 60);
    // 文件名里的规格取画面的实测高度与帧率，不按配置推断
    const vs = checked(FFPROBE(), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=height,r_frame_rate', '-of', 'default=nw=1', video]).stdout;
    const vr = (vs.match(/r_frame_rate=(\d+)\/(\d+)/) || [0, fps, 1]), tag = `${(vs.match(/height=(\d+)/) || [0, 1080])[1]}p${Math.round(vr[1] / vr[2])}`;
    const frames = parseInt(checked(FFPROBE(), ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', video]).stdout, 10);
    const adur = +checked(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).stdout;
    if (!Number.isFinite(adur) || adur <= 0 || !Number.isSafeInteger(frames) || frames <= 0 || !vs.includes('height=') || !vs.includes('r_frame_rate=')) throw new Error('音画规格测量不完整');
    console.log(`  画面 ${frames} 帧 = ${(frames / fps).toFixed(2)}s，声音 ${adur.toFixed(2)}s，时间线 ${L.total.toFixed(2)}s`);
    if (Math.abs(frames / fps - adur) > 0.25 || Math.abs(adur - L.total) > 0.6) { console.error(`  ✗ 画面、声音与时间线的长度不一致：脚本或配音改过之后要重新 audio.js 与 render.js；渲染日志末行要有 verified frames。这一版不封装`); failed = true; continue; }
    const m0 = measure(audio);
    const gain = Math.max(-6, Math.min(20, LUFS - m0.I + 0.4));
    let lim = 0.84;
    const afOf = (g) => `volume=${g.toFixed(1)}dB,alimiter=limit=${lim.toFixed(3)}:level=disabled:attack=5:release=80`;
    // 限幅器按采样点限幅（0.84 ≈ -1.5 dBFS），采样之间的峰（真峰值）还会冒出来零点几 dB；增益大时可能超过 -1 dBFS。
    // 做完量一次真峰值，超了就按超出的量压低限幅上限再做一遍（最多三次）；降增益没有用——峰都被压在限幅上限
    const levelled = (src, dst) => {
      let m = null;
      for (let k = 0; k < 3; k++) {
        ff(['-y', '-loglevel', 'error', '-i', src, '-af', afOf(gain), dst], { stdio: 'inherit' });
        m = measure(dst);
        if (!(m.TP > -1)) break;
        const cut = m.TP + 1.2; console.log(`  真峰值 ${m.TP} dBFS 高于 -1：限幅上限再压 ${cut.toFixed(1)} dB 重做`); lim *= Math.pow(10, -cut / 20);
      }
      return m;
    };
    if (alt) {                                   // 试听片：同一画面配另一条混音
      levelled(audio, o('audio_alt_final.wav'));
      const name = `${slug}-${lang}-${alt}.mp4`; mux(video, o('audio_alt_final.wav'), path.join(OUT, name), meta);
      const m = measure(path.join(OUT, name));
      fs.rmSync(o('audio_alt_final.wav'), { force: true });
      console.log(`  试听片 out/${name}   响度 I=${m.I} LUFS  TP=${m.TP} dBFS`);
      continue;
    }
    const versions = [['audio.wav', ''], ['audio_voice.wav', '-voice-only']];
    if ((P.audio.music || 'pad') !== 'none') versions.push(['audio_nomusic.wav', '-no-music']);
    let measurements = {};
    for (let attempt = 0; attempt < 3; attempt++) {
      measurements = {};
      for (const [src, suffix] of versions) {
        const fin = o(src.replace('.wav', '_final.wav'));
        if (!suffix) levelled(audio, fin);
        else ff(['-y', '-loglevel', 'error', '-i', o(src), '-af', afOf(gain), fin], { stdio: 'inherit' });
        const name = `${slug}-${lang}-${tag}${suffix}.mp4`;
        mux(video, fin, path.join(OUT, name), meta);
        measurements[name] = measure(path.join(OUT, name));
        fs.rmSync(fin, { force: true });
      }
      const peak = Math.max(...Object.values(measurements).map((m) => m.TP));
      if (peak <= -1) break;
      if (attempt === 2) throw new Error('最终 MP4 真峰值仍高于 -1 dBFS，未完成封装验收');
      lim *= Math.pow(10, -(peak + 1.3) / 20);
      console.log('  AAC 编码后真峰值超标，降低限幅上限并重做全部音轨版本');
    }
    const m1 = measurements[`${slug}-${lang}-${tag}.mp4`];
    console.log(`  最终 MP4 响度：增益 ${gain.toFixed(1)} dB → I=${m1.I} LUFS  TP=${m1.TP} dBFS（目标 ${LUFS}±1.5 / ≤ -1）`);
    if (Math.abs(m1.I - LUFS) > 1.5) throw new Error('最终主混音 MP4 的响度未达到目标范围');
    // 外挂字幕：与画面内字幕同文同步
    const cues = L.order.map((id) => L.cues[id]).filter((c) => c.cap);
    fs.writeFileSync(path.join(OUT, `${slug}-${lang}.srt`), cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(Math.min(c.end + 0.25, cues[i + 1] ? cues[i + 1].start - 0.05 : c.end + 0.5))}\n${strip(c.cap)}\n`).join('\n'));
    // 规格与静止段（不看底部字幕条）
    const main = path.join(OUT, `${slug}-${lang}-${tag}.mp4`);
    const probe = checked(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height,r_frame_rate', '-of', 'default=nw=1', main]).stdout;
    const dur = +(probe.match(/duration=([\d.]+)/) || [0, 0])[1];
    console.log('  ' + [...new Set(probe.trim().split(/\r?\n/))].join('  '));
    if (!Number.isFinite(dur) || dur <= 0) throw new Error('最终 MP4 时长无效');
    const fr = ff(['-hide_banner', '-nostats', '-i', main, '-vf', 'crop=iw:ih*0.89:0:0,freezedetect=n=-52dB:d=3', '-map', '0:v', '-f', 'null', '-']).stderr;
    const a = [...fr.matchAll(/freeze_start: ([\d.]+)/g)].map((x) => +x[1]), b = [...fr.matchAll(/freeze_duration: ([\d.]+)/g)].map((x) => +x[1]);
    if (a.length > b.length) b.push(dur - a[a.length - 1]);
    console.log(`  画面基本不动 ≥3 秒的段落（不含字幕条）：${b.length ? '' : '无'}`);
    for (let i = 0; i < b.length; i++) console.log(`    ! ${a[i].toFixed(1)}s（${mmss(a[i])}）起，持续 ${b[i].toFixed(1)}s`);
    let blank = null;
    if (!flag('no-blank')) {
      if (!pythonPath()) throw new Error('缺少 Python，无法完成空画面检查');
      const r = checked(PY(), [path.join(KIT, 'tools', 'blank_check.py'), main], { env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ...pyEnv(lang) } });
      const lines = (r.stdout || '').trim().split(/\r?\n/);
      try { blank = JSON.parse(lines[lines.length - 1]); } catch (e) { throw new Error('空画面检查未返回有效 JSON'); }
      if (!Array.isArray(blank.blank) || !Array.isArray(blank.sparse)) throw new Error('空画面检查结果不完整');
      console.log('  ' + lines.slice(0, -1).join('\n  '));
    }
    const changed = [...records.sourceChanges(sources, sourceState(), lang), ...await records.verify(VIDEO, inputs, inputFiles)];
    if (config !== records.finishConfig(records.readRecord(path.join(VIDEO, 'project.json')))) changed.push('project.json 的封装配置');
    if (changed.length) throw new Error('封装期间输入发生变化，须重新制作：' + changed.join('；'));
    fs.writeFileSync(path.join(mkdirp(d.build), `finish.${lang}.json`), JSON.stringify({ schema: 2, lang, duration: dur, expected: L.total, frames, tag, loudness: m1, measurements, gain: +gain.toFixed(1), freezes: b.map((x, i) => ({ start: a[i], d: x })), blank, probe, config, sources, inputs, outputs: await records.capture(VIDEO, records.finalFiles(P, lang, tag)), versions: versions.map((v) => `${slug}-${lang}-${tag}${v[1]}.mp4`) }, null, 1));
  }
  console.log('交付物（out/）：');
  for (const n of fs.readdirSync(OUT).sort()) if (/\.(mp4|srt|jpg|png)$/.test(n)) console.log(`  ${n.padEnd(52)} ${(fs.statSync(path.join(OUT, n)).size / 1048576).toFixed(1).padStart(7)} MB`);
  process.exitCode = failed ? 1 : 0;
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
