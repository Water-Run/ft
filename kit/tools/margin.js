// 越界自检（按像素量）：取每句旁白说完那一刻的画面，量出内容的外接范围，列出贴近画面左右边缘或顶边的句子。
// 用法：node kit/tools/margin.js <视频> [--lang en|all] [--safe 60]      安全边距的单位是 1080p 下的像素
// scan.js 的 MARGIN 只看 DOM 里的文字；这里看的是像素，画在 SVG、canvas 里的图形和转动、长出标签的图也量得到。
// 整屏的底色块、出血的大图形会被当成「贴边」：这类句子写进 project.json 的 check.margin_skip（{ 句号: 原因 }）。需要 Python 的 numpy 与 pillow。
const { needVideo, LANGS, VIDEO, KIT, PY, arg, run, pyEnv, path } = require('./lib');
needVideo();
let bad = 0;
for (const lang of LANGS()) {
  run(process.execPath, [path.join(__dirname, 'sheets.js'), VIDEO, 'cue', '--lang', lang, '--name', 'margin', '--frames'], { stdio: ['ignore', 'ignore', 'inherit'] });
  const r = run(PY(), [path.join(KIT, 'tools', 'margin_audit.py'), String(arg('safe', 60))], { env: pyEnv(lang), allowFail: true });
  if (r.status) bad++;
}
process.exit(bad ? 1 : 0);
