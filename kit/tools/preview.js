// 快速预演：缺省 1/4 分辨率、15fps、无运动模糊。检查像素静止，已有有效混音时封装有声样片。
// node kit/tools/preview.js <视频> [--lang zh] [--from 秒 --to 秒] [--mix]
// --mix 先运行 audio.js 刷新混音（不调用 TTS）；--scale 0.5 --fps 30 可看清文字与运动。
// --gpu 1 --encoder auto --workers 2 可用显卡；encoder、gpu、workers 未指定时沿用 project.render。
// 产物固定为 out/<语言>/preview_video.mp4、preview.mp4；区间样片按实际首帧时刻裁音频。每次运行先删掉旧的 preview.mp4。
// --round r3：成功后另存一份 preview-r3.mp4，交给策划者看的是这一份；以后的验证预演不会覆盖它，同名文件已存在时拒绝。
// 预演不写正式交付记录；过期混音、媒体命令失败、片尾持续静止都以非零退出。
const { spawnSync } = require('child_process');
const { needVideo, PROJECT, LANGS, VIDEO, FFMPEG, arg, flag, run, dirs, mkdirp, rel, mmss, layout, sourceState, path, fs } = require('./lib');
const records = require('./artifact-record');
needVideo();
require('./project-files').acquireLock(needVideo());
require('./script-review').assertApproved(needVideo(), PROJECT(), LANGS());
const ff = (args) => {
  const r = spawnSync(FFMPEG(), args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error || r.status !== 0) throw new Error('预演媒体命令失败：' + (r.error?.message || r.stderr || '退出码 ' + r.status));
  return r;
};
async function preview(lang) {
  const d = dirs(lang), limit = +(PROJECT().check.still_seconds || 3), sources = sourceState();
  const v = path.join(mkdirp(d.out), 'preview_video.mp4'), voiced = path.join(d.out, 'preview.mp4');
  const reportPath = path.join(mkdirp(d.build), `preview.${lang}.json`);
  const round = arg('round', null), kept = round && path.join(d.out, `preview-${round}.mp4`);
  if (round && !/^[A-Za-z0-9._-]+$/.test(round)) throw new Error('--round 只能用字母、数字、点、下划线和连字符，如 r3');
  if (kept && fs.existsSync(kept)) throw new Error('已有 ' + rel(kept) + '：交出去的预览不覆盖，换一个轮次名');
  // 旧的有声样片或通过报告不能冒充本次失败后的结果。
  fs.rmSync(voiced, { force: true }); fs.rmSync(reportPath, { force: true });
  if (flag('mix')) run(process.execPath, [path.join(__dirname, 'audio.js'), VIDEO, '--lang', lang]);
  const { L } = layout(lang), au = path.join(d.out, 'audio.wav');
  const hasAudio = fs.existsSync(au);
  if (hasAudio) {
    const problems = await records.audioProblems(VIDEO, PROJECT(), lang, Object.values(L.cues), sources);
    if (problems.length) throw new Error('预演音轨已过期，请加 --mix：' + problems.join('；'));
  }
  const extra = [];
  for (const k of ['from', 'to', 'gpu', 'encoder', 'workers', 'cq', 'threads']) if (arg(k, null) != null) extra.push('--' + k, arg(k));
  run(process.execPath, [path.join(__dirname, 'render.js'), VIDEO, '--lang', lang,
    '--scale', arg('scale', '0.25'), '--fps', arg('fps', '15'), '--mb', '1', '--crf', arg('crf', '30'), '--out', v, ...extra]);
  const rendered = records.readRecord(v + '.json');
  if (!rendered || records.sourceChanges(rendered.sources, sources, lang).length) throw new Error('预演渲染记录缺失或源码已改变');
  const off = rendered.from, duration = rendered.frames / rendered.fps;
  const r = ff(['-hide_banner', '-nostats', '-i', v, '-vf', `crop=iw:ih*0.89:0:0,freezedetect=n=-48dB:d=${Math.max(1, limit - 0.5)}`, '-map', '0:v', '-f', 'null', '-']);
  const txt = r.stderr || '';
  const a = [...txt.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => +m[1]), b = [...txt.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => +m[1]);
  if (a.length > b.length) b.push(Math.max(0, duration - a[b.length]));
  const where = (t) => { const sc = L.scenes.find((x) => t >= x.start && t < x.end); let cue = null; for (const id of L.order) { if (L.cues[id].start <= t + 1e-6) cue = id; else break; } return `${sc ? sc.id : '?'} / ${cue || '—'}`; };
  console.log(`画面基本不动 ≥${Math.max(1, limit - 0.5)} 秒的段落（不含字幕条）：${b.length ? '' : '无'}`);
  for (let i = 0; i < b.length; i++) console.log(`  ${b[i] >= limit ? '✗' : '!'} ${(a[i] + off).toFixed(1)}s（${mmss(a[i] + off)}，${where(a[i] + off)}）起，持续 ${b[i].toFixed(1)}s`);
  const bad = b.filter((x) => x >= limit).length;
  if (hasAudio) {
    // 音轨按首帧量化后的起点 seek；视频时间从零开始，防止非零区间仍接全片开头的旁白。
    const temporary = path.join(d.out, 'preview.pending.mp4');
    try {
      ff(['-y', '-loglevel', 'error', '-i', v, '-ss', String(off), '-i', au, '-t', String(duration),
        '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', temporary]);
      fs.renameSync(temporary, voiced);
    } finally { fs.rmSync(temporary, { force: true }); }
    console.log('带音轨的预演：' + rel(voiced));
  } else console.log('没有混音，本次只有无声画面；生成有声样片可加 --mix');
  if (records.sourceChanges(sources, sourceState(), lang).length) throw new Error('预演期间源码发生变化，请重做');
  fs.writeFileSync(reportPath, JSON.stringify({ preview: true, from: off, to: rendered.to, audio: hasAudio, encoder: rendered.encoder,
    sources, freezes: b.map((x, i) => ({ start: +(a[i] + off).toFixed(2), d: x })) }));
  console.log(bad ? `✗ 有 ${bad} 段静止超过 ${limit} 秒：回到对应场景检查解释与动作` : `✓ 没有超过 ${limit} 秒的静止段`);
  if (kept && !bad) {
    if (!hasAudio) throw new Error('没有混音，不能另存交审的预览：加 --mix');
    fs.copyFileSync(voiced, kept); console.log('交审用的预览：' + rel(kept));
  } else if (kept) console.log('有静止段，没有另存 ' + rel(kept));
  return bad > 0;
}
(async () => {
  let failed = false;
  for (const lang of LANGS()) failed = await preview(lang) || failed;
  process.exitCode = failed ? 1 : 0;
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
