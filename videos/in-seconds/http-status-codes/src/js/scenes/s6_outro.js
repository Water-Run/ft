// 片尾名单（不配旁白，约 3.3 秒）：排成一次「200 OK」的响应——第一行是状态行，下面每一行是一条「字段: 值」。
// 名单与 project.json 的 credits 一致（docs/roles.md 第 5 节）；check.js --final 逐个核对。整屏一次到位，留足读的时间。
const CREDITS = [
  [tr('策划', 'Planning'), 'WaterRun'],
  ['Claude Opus 5.5', tr('视觉 · 动画 · 配乐与音效 · 读法 · 封面 · 渲染与验收', 'visuals · animation · sound · readings · cover · review')],
  ['Gemini 4 Argon', tr('文案', 'script')],
  ['MiniMax M3.1 Flash', tr('取证 · 实验 · 事实表', 'research · experiments · fact sheet')],
  ['MiniMax speech-2.8-hd', tr('配音', 'narration')],
  ['Whisper small', tr('读音回听', 'pronunciation check')],
];
scene('outro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const scr = screen(world, 80, 70, 1760, 830, tr('片尾名单', 'credits'));
  const t0 = s.start + 0.05;
  const st = addLine(scr, 'HTTP/1.1 200 OK', 60, 48, 64);
  appear(st, t0); sfx('chime', t0 + 0.1, { g: 0.55 });
  CREDITS.forEach(([a, b], i) => {
    const y = 160 + i * 84;
    const ka = addLine(scr, esc(a) + ':', 60, y, 40); css(ka, { fontWeight: 800 });
    const vb = addLine(scr, esc(b), 640, y + 4, 34, 'dim'); css(vb, { fontFamily: '"Sans SC", "Inter"', color: C.case, fontWeight: 500 });
    appear(ka, t0 + 0.08 + i * 0.05); appear(vb, t0 + 0.1 + i * 0.05);
  });
  sfx('blip', t0 + 0.12, { g: 0.4 });
  const os = addLine(scr, tr('开源视频', 'Open-source video') + ':', 60, 690, 40); css(os, { fontFamily: '"Sans SC", "Inter"', fontWeight: 800 });
  const url = addLine(scr, 'github.com/Water-Run/ft', 640, 678, 58, 'hot');
  appear(os, t0 + 0.4); appear(url, t0 + 0.45); sfx('beep', t0 + 0.45, { g: 0.5 });
  cam.track(s.start, { x: 960, y: 484, z: 1.03 }, [[s.start + 0.05, { z: 1.0 }, s.end - s.start - 0.1, { ease: 'power1.out', sfx: false }]]);
});
