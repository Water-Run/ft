// 存储程序：这就叫存储程序（b1）→ 数据与指令（b2）→ 指令也是 0 和 1（b3）→ 编号的格子（b4）→ 前几格指令、后几格数据（b5）→ 控制器按编号往下读（b6）
scene('program', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const M = machine(world, {});
  M.rows.forEach((r) => hide0(r.el));

  // b1：镜头推近存储器，盖上「存储程序」的章
  const tPush = s.start + 0.05;
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[tPush, { x: 1320, y: 450, z: 1.25 }, 1.0, { g: 0.4 }], [Tend('b5') + 0.12, { x: 960, y: 484, z: 1 }, 1.0, { g: 0.4 }]]);
  const stamp = h('div', 'stamp', world, tr('存储程序', 'STORED PROGRAM')); px(stamp, 1626, 214);
  stamp.dataset.gloss = '存储程序';
  slam(stamp, Q(T('b1', '存储')), { from: 1.6, d: 0.3, ease: 'power4.out' }); sfx('thud', Q(T('b1', '存储')));

  // 纸带：从开场的堆放位置出发。b2 按种类排成两列并标名；b4 收到右半边让出格子；b5 逐条落进各自的格
  const tReg = Q(T('b2')) - 0.1, tSide = Q(T('b4')), tLandI = Q(T('b5', '指令')), tLandD = Q(T('b5', '数据')), tTog = Q(T('b3', '跟'));
  const tapes = PILE.map(([kind, x, y, r], k) => {
    const isI = kind === 'i', j = isI ? k : k - 4, row = isI ? j + 1 : j + 5;
    const bits = isI ? PROG.calc[j][0] : DATA[j][0];
    const tp = tape(world, bits, kind, 0, 0);
    const cx = isI ? 1104 : 1350, cy = 290 + j * 62;
    const sx = 1404, sy = isI ? 282 + j * 50 : 506 + j * 50;
    const tl0 = (isI ? tLandI : tLandD) + j * 0.12;
    const cx2 = isI ? cx + 20 : cx - 20;                   // 「跟数据存一起」：两列各朝对方挪一步
    mover(tp, [[s.start, x, y, { r }], [tReg, x, y, { r }], [tReg + 0.6, cx, cy], [tTog, cx, cy], [tTog + 0.45, cx2, cy], [tSide, cx2, cy], [tSide + 0.6, sx, sy, { s: 0.7 }], [tl0, sx, sy, { s: 0.7 }], [tl0 + 0.45, 1146, rowY(row) + 6, { s: 0.92 }]], tl0 + 0.46);
    M.setRow(row, tl0 + 0.46, bits, isI ? PROG.calc[j][1] : DATA[j][1], kind);
    if (j % 2 === 0) sfx('tick', tl0 + 0.45, { g: 0.55, p: 0.4 });
    return { tp, kind, j };
  });
  sfx('drive', tReg, { g: 0.5, p: 0.3 });
  const labI = txt(world, 't-4 blue', tr('指令', 'Instructions'), 1104, 540), labD = txt(world, 't-4 ochre', tr('数据', 'Data'), 1350, 604);
  labI.dataset.gloss = '指令'; labD.dataset.gloss = '数据';
  slam(labD, Q(T('b2', '数据')), { from: 1.3, d: 0.3 }); sfx('pop', Q(T('b2', '数据')), { g: 0.7, p: 0.5 });
  slam(labI, Q(T('b2', '指令')), { from: 1.3, d: 0.3 }); sfx('pop', Q(T('b2', '指令')), { g: 0.7, p: 0.3 });
  hide(labI, tSide - 0.05, { d: 0.25 }); hide(labD, tSide - 0.05, { d: 0.25 });

  // b3：「加 第8格」和「5」两张标签盖在纸带上，读到「0 和 1」时揭掉，露出同样的孔
  const c1 = PILE[0], c2 = PILE[7];   // 第一条指令、数值 5
  const cover = (x, y, col) => { const e = h('div', 'abs', world, '<span></span>'); px(e, x + 14, y + 3, 216, 42); css(e, { background: '#f6efdc', color: col, font: '700 30px "Serif SC"', textAlign: 'center', lineHeight: '42px', border: `2px solid ${col}` }); return e; };
  const cvI = cover(1104, 290, 'var(--blue)'), cvD = cover(1350, 290 + 3 * 62, 'var(--ochre)');
  cvI.dataset.name = '标签 加第8格'; cvD.dataset.name = '标签 5';
  const tCv = Q(T('b3')), tBits = Q(T('b3', '0'));
  wipe(cvI, tCv, { dir: 'l', d: 0.3 }); wipe(cvD, tCv + 0.15, { dir: 'l', d: 0.3 }); sfx('pop', tCv, { g: 0.6 });
  // 标签上的字用打字机慢慢打出来：先是人读的写法
  const tTyped = typeText(cvI.firstChild, tr('加 第8格', 'ADD cell 8'), tCv + 0.2, 4.5, { cursor: false, sfxGain: 0.6 });
  typeText(cvD.firstChild, '5', tTyped + 0.1, 4, { cursor: false, sfxGain: 0.6 });
  wipeOut(cvI, tBits, { dir: 'r', d: 0.35 }); wipeOut(cvD, tBits + 0.1, { dir: 'r', d: 0.35 }); sfx('beep', tBits, { g: 0.5 });
  const bI = txt(world, 'mono blue', '0001 1000', 1110, 344), bD = txt(world, 'mono ochre', '0000 0101', 1356, 530);
  [bI, bD].forEach((e) => { css(e, { font: '600 30px "Mono"', letterSpacing: '.1em', background: 'var(--veil)' }); });
  appear(bI, tBits + 0.2); appear(bD, tBits + 0.3); vanish(bI, tTog); vanish(bD, tTog);
  const ringB = pencilRing(ov, 1104, 290, 230, 48, tBits + 0.25, 0.35), ringD = pencilRing(ov, 1350, 476, 230, 48, tBits + 0.35, 0.35);
  vanish(ringB, tTog); vanish(ringD, tTog);
  // 挪到一起之后，两列外面围一个框：同一个存储器里
  const both = blk(world, '', 1096, 278, 492, 330); css(both, { border: '3px dashed var(--red)' }); both.dataset.name = '存在一起';
  wipe(both, tTog + 0.45, { dir: 'l', d: 0.4 }); vanish(both, tSide);
  // 「跟数据存一起」：两列各自挪近一步
  sfx('tick', tTog, { g: 0.5 }); sfx('tick', tTog + 0.45, { g: 0.5, p: 0.3 });

  // b4：格子从上往下一格一格画出来，编号先到
  M.rows.forEach((r, k) => { const t = tSide + 0.25 + k * 0.2; appear(r.el, t); fromTo(r.line, t, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power2.out' }); slam(r.n, t, { from: 1.4, d: 0.25 }); if (k % 3 === 0) sfx('tick', t, { g: 0.5, p: 0.5 }); });
  // b5：先把「前几格」「后几格」两块区域标出来，纸带再落进去
  const zI = blk(world, '', 1084, rowY(1) + 2, 512, 4 * ROW.h - 4), zD = blk(world, '', 1084, rowY(5) + 2, 512, 5 * ROW.h - 4);
  css(zI, { background: 'var(--blue9)', border: '3px solid var(--blue)' }); css(zD, { background: 'var(--ochre8)', border: '3px solid var(--ochre)' });
  zI.dataset.name = '前几格'; zD.dataset.name = '后几格';
  wipe(zI, Q(T('b5', '前')), { dir: 't', d: 0.35 }); wipe(zD, Q(T('b5', '后')), { dir: 't', d: 0.35 });
  sfx('tick', Q(T('b5', '前')), { g: 0.5, p: 0.4 }); sfx('tick', Q(T('b5', '后')), { g: 0.5, p: 0.4 });
  hide(zI, Q(Tend('b5') + 0.3), { d: 0.3 }); hide(zD, Q(Tend('b5') + 0.3), { d: 0.3 });

  // b6：指针出现在第 1 格，一格一格往下走到第 4 格，再回到第 1 格
  const tP = Q(T('b6', '控制器')), tStep = Q(T('b6', '一格一格'));
  pcTo(M, [[tP, 1], [tStep, 2], [tStep + 0.35, 3], [tStep + 0.7, 4], [Q(Tend('b6') + 0.4), 1]]);
  sfx('beep', tP, { g: 0.5, p: 0.3 }); [0, 0.35, 0.7].forEach((d) => sfx('tick', tStep + d, { g: 0.6, p: 0.4 })); sfx('beep', Q(Tend('b6') + 0.4), { g: 0.4, p: 0.3 });
  // 停留（55–59.5）：三步的小环依次亮一下，预告下一场
  M.steps.forEach((e, k) => classAt(e, 'hot-step', Q(Tend('b6') + 1.2 + k * BEAT * 2), Q(Tend('b6') + 1.2 + (k + 1) * BEAT * 2)));
  [0, 1, 2].forEach((k) => sfx('tick', Q(Tend('b6') + 1.2 + k * BEAT * 2), { g: 0.4, p: -0.4 }));
});
