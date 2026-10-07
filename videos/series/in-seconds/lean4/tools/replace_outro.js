// 本次交接的局部重渲：原片 0–192 秒 + 新片尾 192–200 秒。
// 在仓库根运行：node videos/series/in-seconds/lean4/tools/replace_outro.js <视频目录> --lang zh
// 仅允许片尾源码变化；保留原片、来源清单和合成记录。正常从头复现仍使用 render.js。
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const { VIDEO, LANGS, FFMPEG, FFPROBE, sourceState, fs, path } = require('../../../../../kit/tools/lib');
const original = JSON.parse(fs.readFileSync(path.join(VIDEO, 'build/original-sources.json'), 'utf8'));
const sources = sourceState();
const changed = [...new Set([...Object.keys(original.sources), ...Object.keys(sources)])].filter(k => original.sources[k] !== sources[k]);
if (changed.length !== 1 || changed[0] !== 'js/scenes/s6_outro.js') throw Error('Only the outro may change: ' + changed);
const run = (exe, args) => { const r = spawnSync(exe, args, { encoding: 'utf8', maxBuffer: 16 << 20 }); if (r.status !== 0) throw Error(r.stderr || 'Command failed'); return r.stdout; };
const frames = file => +run(FFPROBE(), ['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','csv=p=0',file]).trim();
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for (const lang of LANGS()) {
  const video = path.join(VIDEO, 'out', lang, 'video.mp4');
  const tail = path.join(VIDEO, 'build', `outro-${lang}.mp4`);
  const output = path.join(VIDEO, 'build', `assembled-${lang}.mp4`);
  const backup = path.join(VIDEO, 'build', `original-${lang}.mp4`);
  if (fs.existsSync(backup)) throw Error('Backup already exists; refusing to replace twice');
  if (frames(video) !== 12000 || frames(tail) !== 480) throw Error('Input frame count mismatch');
  const provenance = { original: hash(video), tail: hash(tail), originalSources: original.sources, sources, range: [192,200] };
  console.log(`${lang}: verified input frames=12000+480; replacing final 480 frames`);
  run(FFMPEG(), ['-y','-loglevel','error','-threads','2','-i',video,'-threads','2','-i',tail,
    '-filter_complex','[0:v]trim=end_frame=11520,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]',
    '-map','[v]','-an','-c:v','libx264','-threads','6','-preset','fast','-crf','12','-pix_fmt','yuv420p',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-r','60','-g','120','-movflags','+faststart',output]);
  const n = frames(output);
  if (n !== 12000) throw Error('Assembled frame count mismatch: ' + n);
  if (JSON.stringify(sourceState()) !== JSON.stringify(sources)) throw Error('Sources changed during assembly');
  fs.renameSync(video, backup);
  fs.renameSync(output, video);
  const rendered = new Date().toISOString();
  fs.writeFileSync(path.join(VIDEO,'build',`assembly.${lang}.json`), JSON.stringify({...provenance, output:hash(video), frames:n, rendered, encoding:'libx264 fast CRF 12; source render 60fps mb8'},null,2));
  fs.writeFileSync(path.join(VIDEO,'out',lang,'video.json'), JSON.stringify({lang,frames:n,fps:60,mb:8,total:200,rendered,sources,assembly:`build/assembly.${lang}.json`},null,1));
  console.log(`${lang}: assembled 200 seconds; verified frames=${n}`);
}
