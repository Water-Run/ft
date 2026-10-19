// 片尾（最后约 8 秒，不配旁白）：黑底。左边是本集的两个词、三块小形状与一句话的概括；右边是制作名单与开源仓库地址。名单出处见 research/FACTS.md「制作署名」。
scene('outro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const t0 = s.start + 0.3, isZh = zh();
  blk(world, 'bg-ink', -200, -200, 2320, 1400);
  hudGround('L', s.start, TOTAL + 1, 'ink');
  // 左：大字与三块小形状（红圆、蓝方、黄三角：知道、拥有、本身）
  const big = word(world, 'Web<br>' + tr('登录', 'Login'), 100, 120, 220, { color: C.paper, lh: '.92', w: 900 });
  slam(big, t0, { from: 1.15, d: 0.35 }); sfx('thud', t0, { g: 0.8, p: -0.4 });
  const marks = [shape(world, 'circle', 110, 600, 88, C.red), shape(world, 'square', 222, 600, 88, C.blue), shape(world, 'tri', 334, 600, 88, C.yel)];
  marks.forEach((e, i) => slide(e, t0 + 0.3 + i * 0.12, { y: -90, d: 0.33, ease: STEP(0.33) }));
  sfx('tick', t0 + 0.3, { g: 0.6, p: -0.5 }); sfx('tick', t0 + 0.42, { g: 0.5, p: -0.5 }); sfx('tick', t0 + 0.54, { g: 0.5, p: -0.5 });
  const line = word(world, tr('服务器认的，是你出示的证据', 'A server knows only the proof you present'), 104, 740, isZh ? 50 : 40, { color: C.yel, w: 800 });
  wipe(line, t0 + 0.7, { dir: 'l', d: 0.4 });
  const ser = word(world, tr('XX 秒速通 · ' + TOTAL + ' 秒了解 Web 登录机制', 'In XX Seconds · Web Login in ' + TOTAL + ' Seconds'), 106, 830, 28, { color: C.dimp, w: 500 });
  wipe(ser, t0 + 0.95, { dir: 'l', d: 0.4 });
  // 右：名单
  const RX = 1010, RW = 820;
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('准备：取证 · 初稿 · 视觉系统 · 任务书', 'Preparation: research · first drafts · visual system · brief'), 'DeepSeek V4.1 Flash 1017'],
    [tr('文案改写 · 英译 · 实验 · 动画 · 配乐 · 审查', 'Rewrite · translation · experiments · animation · score · review'), 'Claude Opus 5.5'],
    [tr('旁白合成', 'Narration voice'), 'MiniMax speech-2.8-hd'],
    [tr('读音回听', 'Read-back check'), 'Whisper small'],
    [tr('网页检索与摘录', 'Web lookup'), tr('Web Fetch（模型未披露）', 'Web Fetch (model undisclosed)')],
    [tr('开源视频', 'Open-source video'), 'github.com/Water-Run/ft'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 96 + i * 116, last = i === rows.length - 1;
    const rule = blk(world, last ? 'bg-yellow' : 'bg-paper', RX, y, RW, last ? 8 : 3);
    const a = word(world, k, RX, y + 14, isZh ? 28 : 24, { color: C.dimp, w: 500 });
    const b = last ? mono(world, v, RX, y + 50, 44, { color: C.yel, w: 800 }) : word(world, v, RX, y + 50, isZh ? 44 : 40, { color: C.paper, w: 700 });
    const tt = t0 + 0.25 + i * 0.1;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.33, ease: STEP(0.33) });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: 0.6, p: 0.4 });
  });
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.025 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
