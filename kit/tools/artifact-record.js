// 制作产物的内容记录：只记录项目内的相对路径、大小与 SHA-256。
// 消费者自己给出预期文件集合，不能让报告决定哪些文件可以不检查。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { inside, noLinks, hash, files } = require('./project-files');

function localFile(video, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || path.posix.isAbsolute(relative) || /^[a-z]:/i.test(relative)) throw new Error('产物记录需要项目内的相对路径');
  const absolute = path.resolve(video, relative);
  if (!inside(path.resolve(video), absolute) || path.relative(video, absolute).replaceAll('\\', '/') !== relative) throw new Error('产物路径越界或不规范：' + relative);
  noLinks(absolute);
  return absolute;
}
async function fingerprint(file) {
  noLinks(file);
  const before = fs.statSync(file);
  if (!before.isFile()) throw new Error('产物不是普通文件');
  const sha256 = await hash(file), after = fs.statSync(file);
  if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ino !== after.ino) throw new Error('计算校验和时文件发生变化');
  return { bytes: after.size, sha256 };
}
async function capture(video, paths) {
  const result = {};
  for (const relative of [...new Set(paths)].sort()) result[relative] = await fingerprint(localFile(video, relative));
  return result;
}
async function verify(video, recorded, expected) {
  const problems = [], names = [...new Set(expected)].sort();
  if (!recorded || Array.isArray(recorded) || typeof recorded !== 'object') return ['缺少文件内容记录，须重新生成产物'];
  if (Object.keys(recorded).sort().join('\n') !== names.join('\n')) problems.push('报告记录的文件集合与本次应交付的文件不一致');
  for (const relative of names) {
    const old = recorded[relative];
    if (!old || !Number.isSafeInteger(old.bytes) || old.bytes < 0 || !/^[a-f0-9]{64}$/.test(old.sha256 || '')) { problems.push('缺少有效校验和：' + relative); continue; }
    try {
      const now = await fingerprint(localFile(video, relative));
      if (now.bytes !== old.bytes || now.sha256 !== old.sha256) problems.push('文件与报告不一致：' + relative);
    } catch (error) { problems.push('文件缺失、不可读或发生变化：' + relative); }
  }
  return problems;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]));
  return value;
}
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
function sourceChanges(recorded, current, lang) {
  if (!recorded || typeof recorded !== 'object' || Array.isArray(recorded)) return ['缺少源码快照'];
  return [...new Set([...Object.keys(recorded), ...Object.keys(current)])].filter((f) => !(/^js\/timing\.\w+\.js$/.test(f) && f !== `js/timing.${lang}.js`) && recorded[f] !== current[f]);
}
function audioConfig(project) {
  const audio = { ...(project.audio || {}) };
  delete audio.lufs; // 只改最终响度时重做封装即可。
  return digest(audio);
}
function audioInputs(video, project, lang, cues) {
  const result = cues.filter((c) => !c.silent).map((c) => `audio/${lang}/cues/${c.id}.mp3`);
  const music = project.audio?.music || 'pad';
  if (!['pad', 'pulse', 'chip', 'score', 'none'].includes(music)) {
    localFile(video, music);
    result.push(music);
    // 本片配乐脚本可能引用同目录的辅助代码或素材，一并保存内容状态。
    if (music.endsWith('.py') && fs.existsSync(path.join(video, 'tools'))) result.push(...files(path.join(video, 'tools'), (f) => f.split('/').includes('__pycache__') || /\.py[co]$/.test(f)).map((f) => 'tools/' + f.path));
  }
  return [...new Set(result)].sort();
}
function audioOutputs(project, lang) {
  return ['audio.wav', 'audio_voice.wav', 'stem_music.wav', 'stem_sfx.wav', ...((project.audio?.music || 'pad') === 'none' ? [] : ['audio_nomusic.wav'])].map((f) => `out/${lang}/${f}`);
}
async function audioProblems(video, project, lang, cues, sources) {
  let record;
  try { record = JSON.parse(fs.readFileSync(path.join(video, `build/audio.${lang}.json`), 'utf8')); } catch (e) { return [`缺少有效 build/audio.${lang}.json：先运行 audio.js`]; }
  const problems = [];
  if (record.schema !== 1 || record.lang !== lang || record.config !== audioConfig(project)) problems.push('混音配置或记录版本已改变，须重新混音');
  if (sourceChanges(record.sources, sources, lang).length) problems.push('混音后的源码或时序已改变，须重新混音');
  problems.push(...await verify(video, record.inputs, audioInputs(video, project, lang, cues)), ...await verify(video, record.outputs, audioOutputs(project, lang)));
  return problems;
}
const finishConfig = (p) => digest({ lufs: p.audio?.lufs ?? -16, render: p.render || {}, check: p.check || {}, music: p.audio?.music || 'pad' });
const finalFiles = (p, lang, tag) => [`out/${p.slug}-${lang}-${tag}.mp4`, `out/${p.slug}-${lang}-${tag}-voice-only.mp4`, ...((p.audio?.music || 'pad') === 'none' ? [] : [`out/${p.slug}-${lang}-${tag}-no-music.mp4`]), `out/${p.slug}-${lang}.srt`];
const coverFiles = (lang) => [`out/cover-${lang}-16x9.jpg`, `out/cover-${lang}-4x3.jpg`, `out/cover-${lang}-16x9-3840x2160.png`, `out/cover-${lang}-4x3-3200x2400.png`];
const finishInputs = (p, lang) => [`out/${lang}/video.mp4`, `out/${lang}/video.json`, `build/audio.${lang}.json`, ...['audio.wav', 'audio_voice.wav', ...((p.audio?.music || 'pad') === 'none' ? [] : ['audio_nomusic.wav'])].map((f) => `out/${lang}/${f}`)];
function readRecord(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return null; } }
async function renderProblems(video, p, lang, total, sources) {
  const rec = readRecord(path.join(video, `out/${lang}/video.json`)), fps = p.render?.fps || 60, scale = p.render?.scale || 1;
  if (!rec || rec.schema !== 1 || rec.lang !== lang) return [`缺少有效 out/${lang}/video.json：先重新 render.js`];
  const problems = [];
  if (rec.fps !== fps || rec.scale !== scale || rec.width !== Math.round(1920 * scale) || rec.height !== Math.round(1080 * scale) || rec.frames !== Math.round(total * fps) || !Number.isFinite(rec.total) || Math.abs(rec.total - total) > 0.0001) problems.push('渲染记录的规格或总时长与当前项目不一致');
  const changes = sourceChanges(rec.sources, sources, lang);
  if (changes.length) problems.push('渲染后的源码已改变：' + changes.join('、'));
  const file = `out/${lang}/video.mp4`;
  problems.push(...await verify(video, { [file]: rec.output }, [file]));
  return problems;
}
async function deliveryProblems(video, p, lang, layout, sources) {
  const fps = p.render?.fps || 60, scale = p.render?.scale || 1, width = Math.round(1920 * scale), height = Math.round(1080 * scale), tag = `${height}p${fps}`;
  const problems = [...await renderProblems(video, p, lang, layout.total, sources), ...await audioProblems(video, p, lang, Object.values(layout.cues), sources)];
  const fin = readRecord(path.join(video, `build/finish.${lang}.json`));
  if (!fin || fin.schema !== 2 || fin.lang !== lang) problems.push(`缺少有效 build/finish.${lang}.json：先重新 finish.js`);
  else {
    if (fin.tag !== tag || fin.config !== finishConfig(p) || sourceChanges(fin.sources, sources, lang).length) problems.push('封装后配置或源码已改变，报告过期');
    problems.push(...await verify(video, fin.inputs, finishInputs(p, lang)), ...await verify(video, fin.outputs, finalFiles(p, lang, tag)));
    if (!Number.isFinite(fin.duration) || Math.abs(fin.duration - layout.total) > 0.6 || fin.frames !== Math.round(layout.total * fps)) problems.push('最终文件时长或帧数与时间线不一致');
    const probe = typeof fin.probe === 'string' ? fin.probe : '';
    if (!new RegExp(`^width=${width}\r?$`, 'm').test(probe) || !new RegExp(`^height=${height}\r?$`, 'm').test(probe) || !new RegExp(`^r_frame_rate=${fps}/1\r?$`, 'm').test(probe)) problems.push('最终文件规格不符或缺少实测');
    const loud = fin.loudness, lufs = p.audio?.lufs ?? -16;
    if (!loud || !Number.isFinite(loud.I) || Math.abs(loud.I - lufs) > 1.5 || !Number.isFinite(loud.TP) || loud.TP > -1) problems.push('最终主混音 MP4 的响度或真峰值不符合标准');
    for (const f of finalFiles(p, lang, tag).filter((f) => f.endsWith('.mp4'))) {
      const m = fin.measurements?.[path.posix.basename(f)];
      if (!m || !Number.isFinite(m.I) || !Number.isFinite(m.TP) || m.TP > -1) problems.push('缺少有效的最终音轨测量或真峰值超标：' + f);
    }
    const main = fin.measurements?.[`${p.slug}-${lang}-${tag}.mp4`];
    if (main && (main.I !== loud?.I || main.TP !== loud?.TP)) problems.push('主混音测量记录不一致');
    if (!Array.isArray(fin.freezes) || fin.freezes.some((f) => !Number.isFinite(f.start) || f.start < 0 || !Number.isFinite(f.d) || f.d < 0)) problems.push('缺少完整静止段检查');
    else if ((p.check?.levels?.STILL || 'error') === 'error') for (const f of fin.freezes) problems.push(`成片 ${f.start.toFixed(1)}s 起有 ${f.d.toFixed(1)} 秒画面不动`);
    const validRanges = (xs) => Array.isArray(xs) && xs.every((x) => Array.isArray(x) && x.length === 2 && x.every(Number.isFinite) && x[0] >= 0 && x[1] > x[0]);
    if (!fin.blank || !validRanges(fin.blank.blank) || !validRanges(fin.blank.sparse)) problems.push('缺少完整空画面检查；--no-blank 的结果不能用于最终交付');
    else for (const r of fin.blank.blank) problems.push(`成片 ${r[0]}–${r[1]}s 是空画面`);
  }
  const covers = readRecord(path.join(video, `build/covers.${lang}.json`));
  if (!covers || covers.schema !== 1 || covers.lang !== lang) problems.push(`缺少有效 build/covers.${lang}.json：重新 covers.js`);
  else {
    if (sourceChanges(covers.sources, sources, lang).length) problems.push('封面生成后的源码已改变，须重新生成封面');
    problems.push(...await verify(video, covers.outputs, coverFiles(lang)));
  }
  return problems;
}
module.exports = { localFile, fingerprint, capture, verify, digest, sourceChanges, audioConfig, audioInputs, audioOutputs, audioProblems, finishConfig, finalFiles, coverFiles, finishInputs, readRecord, renderProblems, deliveryProblems };
