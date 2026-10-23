// 完整媒体工具的隔离集成验证：真实渲染、混音、封装与封面，不联网配音、不碰片单或实际影片。
// node kit/tools/media-smoke.js；需 Chrome、ffmpeg/ffprobe、Python 与 NumPy。
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..'), runtime = require('./lib'), records = require('./artifact-record'), review = require('./script-review');
const slug = 'media-smoke-' + crypto.randomBytes(4).toString('hex'), relative = 'out/sandbox/' + slug, video = path.join(root, relative);
function run(tool, args = [], { env = {}, success = true } = {}) {
  const r = spawnSync(process.execPath, [path.join(root, 'kit/tools', tool + '.js'), ...args], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 24, env: { ...process.env, FT_PROJECT_LOCK: '', ...env }, timeout: 120000 });
  if (r.error) throw r.error;
  if (success && r.status !== 0) throw new Error(tool + '：' + (r.stdout + r.stderr).slice(-5000));
  console.log(tool + ': exit=' + r.status);
  return r;
}
function write(relative, text) { const file = path.join(video, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
async function main() {
  run('new', [slug, '--scratch', '--langs', 'zh', '--title', 'Synthetic media integration fixture']);
  const project = JSON.parse(fs.readFileSync(path.join(video, 'project.json'), 'utf8'));
  project.review.reviewer = 'Synthetic fixture reviewer';
  project.render = { fps: 30, mb: 1, workers: 1, scale: 1 };
  project.audio = { music: 'tools/music.py', music_db: -30, duck_db: 7, sfx: false };
  write('project.json', JSON.stringify(project, null, 2));
  const total = 4.2, L = { total, order: ['tone'], cues: { tone: { id: 'tone', start: 0, end: total, d: total, cap: '合成音画管线验证。', silent: false } }, scenes: [{ id: 'fixture', start: 0, end: total }], problems: [] };
  write('src/js/script.js', `module.exports = { SCRIPT: [{ id: 'fixture', chap: null, cues: [['tone', '合成音画管线验证。']] }], layoutScript: () => (${JSON.stringify(L)}), strip: s => s };\n`);
  write('src/js/timing.zh.js', `window.DUR_ALL = {zh: {tone: {d: ${total}}}};\n`);
  write('src/index.html', `<!doctype html><body style="margin:0;background:#fff"><canvas id="c" width="1920" height="1080"></canvas><script>const g=document.querySelector('canvas').getContext('2d');window.TOTAL=${total};window.SFX=[];window.seek=t=>{g.fillStyle='#ffffff';g.fillRect(0,0,1920,1080);g.fillStyle='#174b72';g.fillRect(100+t*200,100,500,650);g.fillStyle='#d05020';g.fillRect(1200-t*100,300,400,450);g.fillStyle='#111111';g.font='50px sans-serif';g.fillText('SYNTHETIC MEDIA TEST',100,950)};window.READY=Promise.resolve();seek(0);</script></body>`);
  write('src/cover.html', '<!doctype html><body style="margin:0;background:#eee"><h1 style="font:100px sans-serif;color:#174b72">Synthetic fixture cover</h1><script>document.body.dataset.ready="1"</script></body>');
  write('tools/music.py', 'import numpy as np\nFADE=(0.1,0.1)\ndef compose(ctx):\n    t=np.arange(ctx["n"])/ctx["sr"]\n    return np.stack([np.sin(2*np.pi*110*t)]*2)\n');
  // 只在这个忽略的练习目录中使用虚构确认；它不代表任何真人审定了实际作品。
  write('review/approval.json', JSON.stringify({ schema: 1, languages: { zh: { status: 'approved', content_sha256: review.snapshot(video, project, 'zh').hash, reviewer: project.review.reviewer, confirmed_at: '2026-10-23T12:00:00+08:00', evidence: 'Synthetic integration fixture only; not a human approval of a real film.' } } }));
  fs.mkdirSync(path.join(video, 'audio/zh/cues'), { recursive: true });
  const tone = spawnSync(runtime.FFMPEG(), ['-y', '-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${total}`, '-c:a', 'libmp3lame', path.join(video, 'audio/zh/cues/tone.mp3')], { encoding: 'utf8' });
  assert.equal(tone.status, 0, tone.stderr);
  run('render', [relative, '--workers', '1']);
  run('audio', [relative]);
  run('finish', [relative]);
  run('covers', [relative]);
  const render = records.readRecord(path.join(video, 'out/zh/video.json'));
  assert.deepEqual(await records.deliveryProblems(video, project, 'zh', L, render.sources), []);
  console.log('Verified: real final MP4s, audio, captions and covers match their records.');
  const mainFile = path.join(video, `out/${slug}-zh-1080p30.mp4`), old = fs.readFileSync(mainFile);
  fs.appendFileSync(mainFile, Buffer.from('changed'));
  assert.ok((await records.deliveryProblems(video, project, 'zh', L, render.sources)).some((x) => /不一致/.test(x)));
  fs.writeFileSync(mainFile, old);
  const report = fs.readFileSync(path.join(video, 'build/finish.zh.json'));
  const fail = run('finish', [relative], { env: { FFMPEG: process.execPath }, success: false });
  assert.notEqual(fail.status, 0, '媒体命令失败必须失败退出');
  assert.deepEqual(fs.readFileSync(path.join(video, 'build/finish.zh.json')), report, '失败不能写入成功报告');
  run('finish', [relative, '--no-blank']);
  assert.ok((await records.deliveryProblems(video, project, 'zh', L, render.sources)).some((x) => /空画面/.test(x)));
  run('finish', [relative]);
  assert.deepEqual(await records.deliveryProblems(video, project, 'zh', L, render.sources), []);
  console.log('Verified: replacement, failed ffmpeg and skipped blank inspection cannot pass final delivery.');
  // 故意制造一直静止到片尾的画面，确认没有 freeze_end 也会被计入失败。
  const html = fs.readFileSync(path.join(video, 'src/index.html'), 'utf8');
  write('src/index.html', html.replace('window.seek=t=>{', 'window.seek=t=>{t=0;'));
  run('render', [relative, '--workers', '1']);
  run('audio', [relative]);
  run('finish', [relative]);
  const staticRender = records.readRecord(path.join(video, 'out/zh/video.json'));
  const staticReport = records.readRecord(path.join(video, 'build/finish.zh.json'));
  assert.ok(staticReport.freezes.some((f) => f.d >= 3));
  assert.ok((await records.deliveryProblems(video, project, 'zh', L, staticRender.sources)).some((x) => /画面不动/.test(x)));
  console.log('Verified: a freeze continuing through the last frame cannot pass final delivery.');
  console.log('媒体集成验证完成：' + relative + '（含故意不合格的静止案例；未验证真实影片内容、语气或观感）');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
