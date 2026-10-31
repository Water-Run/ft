// 瓶颈：同一条通道、一次只过一个（d1）→ 运算器干等（d2）→ 1977 年的名字（d3）→ 旁边加两块缓存（d4）→ 少挤通道（d5）→ 根基没变（d6）
scene('bottleneck', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const M = machine(world, { rows: 'game', acc: 8, r7: ['00001000', '8'], out: 'game' });

  // 镜头：推近到通道（d1–d3），讲缓存之前退回全图
  const tBack = Q(Tend('d3') + 0.1);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.05, { x: 900, y: 484, z: 1.3 }, 1.0, { g: 0.4 }], [tBack, { x: 960, y: 484, z: 1 }, 1.0, { g: 0.4 }]]);

  // ── 排队：纸带从各格出来，在通道口排成一列；一次只放过一个，队伍往前挪一格 ──
  const tGo = Q(T('d1', '一次')), gap = 0.72, tCacheOn = Q(T('d5')), N = 13, LEN = 5, SL = 104;
  const qx = (slot) => 1090 + slot * SL, qy = G.busY - 12;
  const dep = []; for (let k = 0; k < N; k++) dep.push(tGo + k * gap);
  const arrivals = [];
  M.rows.forEach((r) => { fromTo(r.el, s.start + 0.3, { opacity: 1 }, { opacity: 0.3, duration: 0.5, immediateRender: false }); fromTo(r.el, tBack, { opacity: 0.3 }, { opacity: 1, duration: 0.5, immediateRender: false }); });
  for (let k = 0; k < N; k++) {
    const isI = k % 2 === 0, row = isI ? (k / 2) % 4 + 1 : (k % 4 === 1 ? 8 : 9);
    const bits = isI ? PROG.game[row - 1][0] : DATA[row - 5][0];
    const tp = tape(world, bits, isI ? 'i' : 'd', 0, 0);
    const join = k < LEN ? s.start + 0.4 + k * 0.15 : dep[k - LEN] + 0.1;      // 前面走一个，后面补一个
    const slot0 = k < LEN ? k : LEN - 1;
    const K = [[join, 1146, rowY(row) + 6, { s: 0.92, a: 0.4 }], [join + 0.45, qx(slot0), qy, { s: 0.5 }]];
    let slot = slot0;
    for (let j = 0; j < k; j++) if (dep[j] > join + 0.45 && dep[j] < tCacheOn) { slot--; K.push([dep[j] + 0.02, qx(slot + 1), qy, { s: 0.5 }], [dep[j] + 0.27, qx(slot), qy, { s: 0.5 }]); }
    const tk = dep[k], dest = isI ? [360, 266] : [520, 560];
    if (tk + 0.95 < tCacheOn && slot === 0) {
      K.push([tk, qx(0), qy, { s: 0.5 }], [tk + 0.25, 1060, qy, { s: 0.6 }], [tk + 0.65, 806, qy, { s: 0.6 }], [tk + 0.95, dest[0], dest[1], { s: 0.8 }]);
      mover(tp, K, tk + 0.96);
      arrivals.push([tk + 0.95, isI]);
      sfx('tick', tk + 0.25, { g: 0.4, p: 0.2 });
    } else {
      // 还没轮到的：缓存出现后转进对应的缓存
      const cy = isI ? 300 : 660, tt = tCacheOn + 0.1 + (k % 4) * 0.06;
      K.push([tt, qx(slot), qy, { s: 0.5 }], [tt + 0.5, 846, cy, { s: 0.45, a: 0.2 }]);
      mover(tp, K, tt + 0.52);
    }
  }
  sfx('drive', tCacheOn, { g: 0.5 });
  // 通道下划线：「同一条通道」
  const ulBus = path(ov, `M812,${G.busY + 34} L1068,${G.busY + 34}`, 'red', { w: 5, arrow: false });
  drawIn(ulBus, Q(T('d1', '一条')), 0.35); sfx('tick', Q(T('d1', '一条')), { g: 0.6 });
  to(ulBus, Q(T('d3', '通道')) - 0.1, { autoAlpha: 0, duration: 0.2 });

  // 指针：每到一条指令走一格
  const pk = [[s.start, 2]]; let pc = 2;
  arrivals.filter(([, i]) => i).forEach(([t]) => { pc = pc % 4 + 1; pk.push([t, pc]); });

  // ── 运算器里的齿轮：数据到了才转一下，其余时间停着；缓存接上之后一直转 ──
  const gear = h('div', 'abs', world); px(gear, 650, 610, 110, 110); gear.dataset.name = '运算器的齿轮';
  const gs = svg('svg', { width: 110, height: 110, viewBox: '-55 -55 110 110' }, gear);
  let gd = '';
  for (let k = 0; k < 10; k++) { const a0 = k * Math.PI / 5, a1 = a0 + Math.PI / 10; gd += `${k ? 'L' : 'M'}${(44 * Math.cos(a0 - 0.12)).toFixed(1)},${(44 * Math.sin(a0 - 0.12)).toFixed(1)} L${(52 * Math.cos(a0)).toFixed(1)},${(52 * Math.sin(a0)).toFixed(1)} L${(52 * Math.cos(a1)).toFixed(1)},${(52 * Math.sin(a1)).toFixed(1)} L${(44 * Math.cos(a1 + 0.12)).toFixed(1)},${(44 * Math.sin(a1 + 0.12)).toFixed(1)} `; }
  svg('path', { d: gd + 'Z', fill: 'none', stroke: C.ink, 'stroke-width': 4 }, gs);
  svg('circle', { r: 14, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, gs);
  const work = arrivals.filter(([, i]) => !i).map(([t]) => t);
  const dots = txt(world, 'mono soft', '', 520, 676); css(dots, { font: '700 48px "Mono"' }); dots.dataset.name = '等待';
  F((t) => {
    let a = 0;                                          // 角度 = 已经转过的时间 × 速度；每次到数转 0.3 秒，缓存之后连续转
    for (const w of work) a += clamp(t - w, 0, 0.3) * 900;
    a += Math.max(0, t - (tCacheOn + 0.6)) * 900;
    gear.style.transform = `rotate(${(a % 360).toFixed(1)}deg)`;
    const busy = work.some((w) => t >= w && t < w + 0.3) || t >= tCacheOn + 0.6;
    const v = busy || t < Q(T('d2')) ? '' : '.'.repeat(1 + Math.floor((t * 3) % 3));
    if (dots.textContent !== v) dots.textContent = v;
  });
  appear(gear, s.start);
  const tWait = Q(T('d2'));
  const ringG = pencilRing(ov, 650, 610, 110, 110, tWait + 0.6, 0.4); sfx('error', tWait + 0.6, { g: 0.35, p: -0.5 });
  to(ringG, Tend('d2') + 0.4, { autoAlpha: 0, duration: 0.3 });

  // ── d3：1977 年，这条通道有了名字 ──
  const ringBus = pencilRing(ov, 806, G.busY - 30, 268, 60, Q(T('d3', '通道')), 0.45);
  const stamp = h('div', 'stamp', world, `<div style="font:700 28px 'Mono';letter-spacing:.06em">1977</div><div>${tr('冯·诺伊曼', 'von Neumann')}</div><div>${tr('瓶颈', 'bottleneck')}</div>`);
  px(stamp, 818, 252); css(stamp, { lineHeight: '1.12', textAlign: 'center', width: '244px' }); stamp.dataset.gloss = '冯·诺伊曼瓶颈';
  const src = txt(world, 'type', tr('BACKUS 图灵奖演讲', 'BACKUS · TURING LECTURE'), 816, 552); src.style.fontSize = '24px'; src.dataset.name = '出处';
  const tName = Q(T('d3', '冯'));
  slam(stamp, tName, { from: 1.6, d: 0.3, ease: 'power4.out' }); sfx('thud', tName);
  appear(src, Q(T('d3', '1977'))); sfx('tick', Q(T('d3', '1977')), { g: 0.6 });
  sfx('tick', Q(T('d3', '通道')), { g: 0.6 });
  const tClear = Q(T('d4')) - 0.2;
  exit(stamp, tClear, { y: -20, d: 0.3 }); exit(src, tClear, { y: 10, d: 0.3 }); to(ringBus, tClear, { autoAlpha: 0, duration: 0.3 });
  vanish(M.busLabel, tClear);

  // ── d4：旁边加两块小缓存，一块存指令（蓝），一块存数据（赭）──
  const cbox = (y, col, zh, rows) => {
    const b = h('div', 'abs', world); px(b, 822, y, 236, 150); css(b, { border: `3px solid ${col}`, background: 'var(--paper2)' });
    const t = h('div', 'abs', b, zh); px(t, 14, 8); css(t, { font: '900 32px "Serif SC"', color: col });
    rows.forEach((r, k) => { const e = h('div', 'abs', b, r); px(e, 14, 58 + k * 40); css(e, { font: '600 26px "Serif SC"', color: col }); });
    b.dataset.name = zh;
    return b;
  };
  const cI = cbox(240, 'var(--blue)', tr('指令缓存', 'I-cache'), ['画 棋盘', '读 按键']);
  const cD = cbox(600, 'var(--ochre)', tr('数据缓存', 'D-cache'), ['5', '3']);
  cI.dataset.gloss = '缓存';
  const tC = Q(T('d4', '小缓'));
  const stubs = [path(ov, `M940,390 L940,${G.busY - 22}`, 'blue', { w: 3, arrow: false }), path(ov, `M940,600 L940,${G.busY + 22}`, 'ochre', { w: 3, arrow: false })];
  wipe(cI, tC, { dir: 'l', d: 0.35 }); wipe(cD, tC + 0.12, { dir: 'l', d: 0.35 }); stubs.forEach((p, k) => drawIn(p, tC + 0.3 + k * 0.1, 0.3));
  sfx('thud', tC, { g: 0.6 }); sfx('pop', tC + 0.12, { g: 0.5 });
  const hlI = blk(world, '', 816, 234, 248, 162), hlD = blk(world, '', 816, 594, 248, 162);
  css(hlI, { border: '4px solid var(--red)' }); css(hlD, { border: '4px solid var(--red)' });
  appear(hlI, Q(T('d4', '指令'))); vanish(hlI, Q(T('d4', '数据'))); appear(hlD, Q(T('d4', '数据'))); vanish(hlD, Q(Tend('d4') + 0.3));
  sfx('tick', Q(T('d4', '指令')), { g: 0.6 }); sfx('tick', Q(T('d4', '数据')), { g: 0.6 });

  // ── d5：常用的放在手边：控制器、运算器直接从旁边的缓存拿，通道清静了 ──
  const hop = [];
  for (let k = 0; k < 9; k++) {
    const isI = k % 2 === 0, tk = tCacheOn + 0.7 + k * 0.42;
    const tp = tape(world, isI ? PROG.game[k % 4][0] : DATA[3][0], isI ? 'i' : 'd', 0, 0);
    const from = isI ? [840, 300] : [840, 660], to_ = isI ? [360, 266] : [520, 560];
    mover(tp, [[tk, from[0], from[1], { s: 0.55, a: 0.3 }], [tk + 0.32, to_[0], to_[1], { s: 0.8 }]], tk + 0.33);
    if (isI) { pc = pc % 4 + 1; pk.push([tk + 0.32, pc]); }
    if (k % 2 === 0) sfx('tick', tk + 0.3, { g: 0.35, p: -0.3 });
    hop.push(tp);
  }
  const tSwap = Q(T('d6', '换'));

  // ── d6：根基没变：换用途，还是只换格子里的指令 ──
  const band = blk(world, '', 1084, rowY(1) + 2, 512, 4 * ROW.h - 4); css(band, { background: 'var(--blue9)', border: '3px solid var(--blue)' });
  const pName = txt(world, 't-4 blue', '', 1100, 104); const pK = keyed(pName);
  pK.at(tSwap + 0.7, { html: tr('算账的程序', 'Bookkeeping') });
  wipe(band, tSwap, { dir: 't', d: 0.35 });
  for (let r = 1; r <= 4; r++) {
    const out = tape(world, PROG.game[r - 1][0], 'i', 0, 0), inn = tape(world, PROG.calc[r - 1][0], 'i', 0, 0);
    const a = tSwap + (r - 1) * 0.08;
    mover(out, [[a, 1146, rowY(r) + 6, { s: 0.92 }], [a + 0.35, 1146, rowY(r) - 40 - 70 * (5 - r), { s: 0.92, a: 0 }]], a + 0.36);
    mover(inn, [[a + 0.3, 1146, -60, { s: 0.92, a: 0 }], [a + 0.75, 1146, rowY(r) + 6, { s: 0.92 }]], a + 0.76);
    M.setRow(r, a, '', '', 'i'); M.setRow(r, a + 0.76, PROG.calc[r - 1][0], PROG.calc[r - 1][1], 'i');
  }
  sfx('drive', tSwap, { g: 0.6, p: 0.4 }); sfx('pop', tSwap + 0.7, { g: 0.6, p: 0.4 });
  M.outAt(tSwap + 0.9, '8'); sfx('pop', tSwap + 0.9, { g: 0.5, p: 0.8 });
  const ringR = pencilRing(ov, 1084, rowY(1), 512, 4 * ROW.h, Q(T('d6', '格子里')), 0.45); sfx('tick', Q(T('d6', '格子里')), { g: 0.6, p: 0.5 });
  pk.push([tSwap + 0.8, 1]);
  const tCap0 = Q(Tend('d6') + 0.5);
  [2, 3, 4, 1].forEach((v, k) => { pk.push([tCap0 + 1.0 + k * 0.8, v]); sfx('tick', tCap0 + 1.0 + k * 0.8, { g: 0.45, p: 0.4 }); });
  pcTo(M, pk, s.start, tC - 0.1);

  // 收尾（117–120.5）：图注，像说明书里这张图的标题
  const tCap = Q(Tend('d6') + 0.5);
  const capL = txt(world, 'type', tr('图 1', 'FIG. 1'), 330, 860), capT = txt(world, 't-4', tr('冯·诺伊曼架构：1945 年的报告，沿用至今', 'The von Neumann architecture: from a 1945 report to today'), 430, 846);
  const capR = blk(world, '', 330, 840, 1270, 3); capR.style.background = 'var(--ink)';
  capT.innerHTML = '';
  wipe(capR, tCap, { dir: 'l', d: 0.5 }); appear(capL, tCap + 0.2);
  typeText(capT, tr('冯·诺伊曼架构：1945 年的报告，沿用至今', 'The von Neumann architecture: from a 1945 report to today'), tCap + 0.3, 9, { cursor: false, sfxGain: 0.5 });
  sfx('chime', tCap + 0.25, { g: 0.6 });
  to(ringR, tCap, { autoAlpha: 0, duration: 0.4 });
});
