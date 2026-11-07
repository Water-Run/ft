// 收尾：录像的办法看到的是结果；RDP 知道每一笔是怎么画上去的，所以能照着你的屏幕重新画一遍。
// 一张画面贯穿：左边是录下来的结果（一格一格的像素），中间是它的画法（一条条指令），右边你的屏幕照着画法重画。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── e1：录像的办法，看到的是结果 ──
  const tRes = Qf(T('e1', '结果'));
  const L1 = txt(world, 't-n dim', tr('录像：结果', 'Video: the result'), 120, 300);
  const frame = h('div', 'abs', world); px(frame, 120, 350, 560, 350); frame.dataset.name = '录下来的结果';
  // 结果是一格一格的颜色：白纸、两块磁贴、几行字的灰
  for (let r = 0; r < 14; r++) for (let c = 0; c < 22; c++) {
    let cl = 'c-tile';
    if (c >= 1 && c <= 13 && r >= 1 && r <= 11) cl = (r === 3 || r === 5 || r === 9) && c >= 2 && c <= 10 ? 'c-vid2' : 'c-paper';
    if (c >= 15 && c <= 20 && r >= 1 && r <= 5) cl = 'c-rdp';
    if (c >= 15 && c <= 20 && r >= 7 && r <= 11) cl = 'c-you';
    blk(frame, cl, c * 25, r * 25, 24, 24);
  }
  wipe(L1, c0 + 0.05, { dir: 'l', d: 0.3 }); wipe(frame, c0 + 0.1, { dir: 'l', d: 0.6 }); sfx('pop', c0 + 0.1, { g: 0.5 });
  const rRing = h('div', 'abs', world); px(rRing, 120, 350, 560, 350); css(rRing, { outline: '3px solid var(--dim)', outlineOffset: '4px' });
  show(rRing, tRes, { d: 0.3 }); sfx('tick', tRes, { g: 0.5 });
  // ── e2：RDP 知道每一笔是怎么画上去的 ──
  const tKnow = Qf(T('e2', '每一笔'));
  const L2 = txt(world, 't-n rdpl', tr('RDP：画法', 'RDP: how it was drawn'), 740, 300);
  wipe(L2, Qf(T('e2', 'R D P')), { dir: 'l', d: 0.3 });
  const steps = [
    ['fill', tr('填色 · 白纸', 'Fill · paper')], ['glyph', tr('写字 · 第 1 行', 'Text · line 1')], ['glyph', tr('写字 · 第 2 行', 'Text · line 2')],
    ['fill', tr('填色 · 蓝色磁贴', 'Fill · blue tile')], ['fill', tr('填色 · 绿色磁贴', 'Fill · green tile')], ['glyph', tr('写字 · 第 3 行', 'Text · line 3')],
  ];
  const st = steps.map(([c, lab], i) => {
    const e = tile(world, c, 740, 350 + i * 60, 380, 52); h('div', 'abs', e, lab); css(e.lastChild, { left: '14px', top: '8px', fontSize: '28px' });
    slide(e, tKnow - 0.2 + i * 0.22, { x: -50, d: 0.3 }); return e;
  });
  sfx('blip', tKnow - 0.2, { g: 0.5 });
  // ── e3：所以它能照着你的屏幕，重新画一遍（你的屏幕是 16:10，排法按你的来）──
  const tRedo = Qf(T('e3', '重新画'));
  const Y = screen(world, 1180, 340, 620, 388, tr('你的电脑', 'Your PC'));
  wipe(Y.el, Qf(T('e3', '你的屏幕')) - 0.2, { dir: 'r', d: 0.4 });
  const D = Y.desk;   // 592 × 360
  const parts = [
    blk(D, 'c-paper', 16, 16, 360, 328),
    blk(D, 'c-vid2', 36, 70, 260, 18), blk(D, 'c-vid2', 36, 120, 220, 18),
    blk(D, 'c-rdp', 396, 16, 180, 156), blk(D, 'c-you', 396, 188, 180, 156),
    blk(D, 'c-vid2', 36, 220, 240, 18),
  ];
  parts.forEach((e, i) => {
    const t0 = tRedo - 0.3 + i * 0.22;
    wipe(e, t0, { dir: i === 0 ? 't' : 'l', d: 0.3 });
    // 中间那一条指令跟着亮一下：正在照它画
    fromTo(st[i], t0, { x: 0 }, { keyframes: [{ x: 24, duration: 0.12 }, { x: 0, duration: 0.25 }], immediateRender: false });
  });
  sfx('tick', tRedo - 0.3, { g: 0.5 }); sfx('chime', tRedo + 1.2, { g: 0.7 });
  cam.track(s.start, { x: 952, y: 484, z: 1 }, [[s.start + 0.1, { x: 968 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
