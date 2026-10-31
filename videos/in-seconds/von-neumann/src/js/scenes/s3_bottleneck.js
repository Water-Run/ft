// 瓶颈：指令和数据挤一条通道、一次只过一个（d1）→ 运算器排队等（d2）→ 1977 年有了名字，停顿（d3）→ 冯·诺伊曼瓶颈（d4）
// → 旁边加两块缓存（d5）→ 常用的就近拿（d6）→ 根基没变：换用途只换格子里的指令（d7）
scene('bottleneck', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const T7 = window.CALC_TOTAL ?? 8;
  const M = machine(world, { rows: 'game', acc: window.CALC_ACC ?? 8, r7: [bin8(T7), String(T7)], screen: 'game', total: T7 });
  M.rows.forEach((r) => { r.el.style.opacity = '0.35'; });
  hide(M.wheel, s.start + 0.2, { d: 0.4 }); M.steps.forEach((e) => hide(e, s.start + 0.2, { d: 0.4 })); hide(M.busLabel, s.start + 0.2, { d: 0.3 });

  // 镜头：接着上一场停在通道上；讲缓存之前退回全图
  const tBack = Q(T('d5')) - 0.35;
  cam.track(s.start, { x: 900, y: 465, z: 1.3 }, [[tBack, { x: 960, y: 484, z: 1 }, 0.9, { g: 0.4 }]]);
  // 讲到最后一句时，格子恢复
  M.rows.forEach((r) => fromTo(r.el, Q(T('d7')), { opacity: 0.35 }, { opacity: 1, duration: 0.5, immediateRender: false }));

  // ── 排队：纸带从各格出来，在通道口排成一列；一次只放过一个，队伍往前挪一格，后面再补一个 ──
  const tI = Q(T('d1', '指令')), tD = Q(T('d1', '数据')), tGo = Q(T('d1', '一次')), tCacheOn = Q(T('d6')), gap = 1.0, N = 16, LEN = 6, SL = 100;
  const qx = (slot) => 1114 + slot * SL, qy = laneY + 12;
  const dep = []; for (let k = 0; k < N; k++) dep.push(tGo + k * gap);
  const depI = [];
  const arrivals = [];
  for (let k = 0; k < N; k++) {
    const isI = k % 2 === 0, row = isI ? (k / 2) % 4 + 1 : (k % 4 === 1 ? 8 : 9);
    const tp = tape(world, isI ? PROG.game[row - 1][0] : DATA[row - 5][0], isI ? 'i' : 'd');
    const join = k < LEN ? (isI ? tI + (k / 2) * 0.2 : tD + ((k - 1) / 2) * 0.2) : dep[k - LEN] + 0.15;
    const [rx, ry] = rowTape(row);
    let slot = k < LEN ? k : LEN - 1;
    const K = [[join, rx, ry, { s: 0.92, a: 0.5 }], [join + 0.5, qx(slot), qy, { s: 0.5 }]];
    for (let j = 0; j < k; j++) if (dep[j] > join + 0.5 && dep[j] < tCacheOn) { K.push([dep[j] + 0.05, qx(slot), qy, { s: 0.5 }], [dep[j] + 0.35, qx(slot - 1), qy, { s: 0.5 }]); slot--; }
    const tk = dep[k];
    if (slot === 0 && tk + 1.0 < tCacheOn) {
      const dest = isI ? [G.slot.x, G.slot.y] : [G.accTape.x, G.accTape.y];
      K.push([tk, qx(0), qy, { s: 0.5 }], [tk + 0.3, 1060, laneY + 12, { s: 0.6 }], [tk + 0.7, 760, laneY + 12, { s: 0.6, e: (u) => u }], [tk + 1.0, dest[0], dest[1], { s: 0.8 }]);
      mover(tp, K, tk + 1.02);
      arrivals.push([tk + 1.0, isI]);
      if (isI) depI.push([tk, row]);                     // 指针在这条指令离开它那一格时指过去
      sfx('tick', tk + 0.3, { g: 0.4, p: 0.2 });
    } else {                                               // 还没轮到的：缓存接上之后转进对应的缓存
      const tt = tCacheOn + 0.1 + (k % 5) * 0.08, cy = isI ? 330 : 540;
      K.push([tt, qx(slot), qy, { s: 0.5 }], [tt + 0.55, 800, cy, { s: 0.45, a: 0.2 }]);
      mover(tp, K, tt + 0.57);
    }
  }
  sfx('drive', tI, { g: 0.45, p: 0.4 }); sfx('drive', tCacheOn, { g: 0.5 });
  const ulBus = path(ov, `M760,${G.busY + 34} L1090,${G.busY + 34}`, 'red', { w: 5, arrow: false });
  drawIn(ulBus, Q(T('d1', '一条')), 0.4); sfx('tick', Q(T('d1', '一条')), { g: 0.6 });

  // ── 运算器里的齿轮：数到了才转一下，其余时间停着，旁边三个点在等；缓存接上之后一直转 ──
  const gear = h('div', 'abs', world); px(gear, 600, 640, 110, 110); gear.dataset.name = '运算器的齿轮';
  const gs = svg('svg', { width: 110, height: 110, viewBox: '-55 -55 110 110' }, gear);
  let gd = '';
  for (let k = 0; k < 10; k++) { const a0 = k * Math.PI / 5, a1 = a0 + Math.PI / 10; gd += `${k ? 'L' : 'M'}${(44 * Math.cos(a0 - 0.12)).toFixed(1)},${(44 * Math.sin(a0 - 0.12)).toFixed(1)} L${(52 * Math.cos(a0)).toFixed(1)},${(52 * Math.sin(a0)).toFixed(1)} L${(52 * Math.cos(a1)).toFixed(1)},${(52 * Math.sin(a1)).toFixed(1)} L${(44 * Math.cos(a1 + 0.12)).toFixed(1)},${(44 * Math.sin(a1 + 0.12)).toFixed(1)} `; }
  svg('path', { d: gd + 'Z', fill: 'none', stroke: C.ink, 'stroke-width': 4 }, gs);
  svg('circle', { r: 14, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, gs);
  const work = arrivals.filter(([, i]) => !i).map(([t]) => t), tFree = tCacheOn + 1.0;
  const dots = txt(world, 'mono soft', '', 470, 690); css(dots, { font: '700 56px "Mono"' }); dots.dataset.name = '等待';
  F((t) => {
    let a = 0;
    for (const w of work) a += clamp(t - w, 0, 0.35) * 900;
    a += Math.max(0, t - tFree) * 700;
    gear.style.transform = `rotate(${(a % 360).toFixed(1)}deg)`;
    const busy = work.some((w) => t >= w && t < w + 0.35) || t >= tFree;
    const v = busy || t < tGo + 1.0 ? '' : '.'.repeat(1 + Math.floor((t * 3) % 3));
    if (dots.textContent !== v) dots.textContent = v;
  });
  const tWait = Q(T('d2', '排队'));
  const ringG = pencilRing(ov, G.CA.x, G.CA.y, G.CA.w, G.CA.h, tWait, 0.5); sfx('error', tWait, { g: 0.35, p: -0.5 });
  to(ringG, Q(Tend('d2') + 0.5), { opacity: 0, duration: 0.3 });

  // ── 1977 年，这条通道有了名字（停顿）── 冯·诺伊曼瓶颈 ──
  const y77 = txt(world, 'mono red', '1977', 836, 196); css(y77, { font: '700 72px "Mono"' });
  slam(y77, Q(T('d3', '1977')), { from: 1.3, d: 0.35 }); sfx('thud', Q(T('d3', '1977')), { g: 0.6 });
  const tNm = Q(T('d3', '名字'));
  const ringBus = pencilRing(ov, 750, G.busY - 30, 350, 60, tNm, 0.5); sfx('tick', tNm, { g: 0.6 });
  vanish(ulBus, tNm);
  const stamp = h('div', 'stamp', world, `<div>${tr('冯·诺伊曼', 'von Neumann')}</div><div>${tr('瓶颈', 'bottleneck')}</div>`);
  px(stamp, 790, 282); css(stamp, { lineHeight: '1.12', textAlign: 'center', width: '262px' }); stamp.dataset.gloss = '冯·诺伊曼瓶颈';
  const src = txt(world, 'type', tr('BACKUS 图灵奖演讲', 'BACKUS · TURING LECTURE'), 790, 512); src.style.fontSize = '24px'; src.dataset.name = '出处';
  const tName = Q(T('d4'));
  slam(stamp, tName, { from: 1.6, d: 0.35, ease: 'power4.out' }); sfx('thud', tName); hide0(src); appear(src, tName + 0.4); sfx('tick', tName + 0.4, { g: 0.5 });
  const tClear = tBack - 0.1;
  [y77, stamp, src].forEach((e) => exit(e, tClear, { y: -20, d: 0.3 })); to(ringBus, tClear, { opacity: 0, duration: 0.3 });

  // ── 旁边加两块小缓存：一块放指令（蓝），一块放数据（赭）──
  const cbox = (y, col, zh) => {
    const b = h('div', 'abs', world); px(b, 770, y, 300, 126); css(b, { border: `3px solid ${col}`, background: 'var(--paper2)' });
    const t = h('div', 'abs', b, zh); px(t, 14, 8); css(t, { font: '900 32px "Serif SC"', color: col });
    b.dataset.name = zh; hide0(b);
    return b;
  };
  const cI = cbox(300, 'var(--blue)', tr('指令缓存', 'I-cache')), cD = cbox(506, 'var(--ochre)', tr('数据缓存', 'D-cache'));
  cI.dataset.gloss = '缓存';
  const tC = Q(T('d5', '小缓'));
  const links = [path(ov, `M920,426 L920,${G.busY - 22}`, 'blue', { w: 3, arrow: false }), path(ov, `M920,506 L920,${G.busY + 22}`, 'ochre', { w: 3, arrow: false }),
    path(ov, 'M770,362 L744,362', 'blue', { w: 4, arrow: true }), path(ov, 'M770,570 L744,570', 'ochre', { w: 4, arrow: true })];
  wipe(cI, tC, { dir: 'l', d: 0.4 }); wipe(cD, tC + 0.15, { dir: 'l', d: 0.4 }); links.forEach((p, k) => drawIn(p, tC + 0.35 + k * 0.08, 0.3));
  sfx('thud', tC, { g: 0.6 }); sfx('pop', tC + 0.15, { g: 0.5 });
  const mini = (b, bits, kind, k) => { const m = tape(b, bits, kind); px(m, 14 + k * 140, 64); css(m, { transform: 'scale(0.55)', transformOrigin: '0 0' }); hide0(m); return m; };
  const tCI = Q(T('d5', '指令')), tCD = Q(T('d5', '数据'));
  [mini(cI, PROG.game[0][0], 'i', 0), mini(cI, PROG.game[1][0], 'i', 1)].forEach((m, k) => appear(m, tCI + k * 0.15));
  [mini(cD, DATA[3][0], 'd', 0), mini(cD, DATA[4][0], 'd', 1)].forEach((m, k) => appear(m, tCD + k * 0.15));
  const fI = frameBox(world, 762, 292, 316, 142), fD = frameBox(world, 762, 498, 316, 142);
  hide0(fI); hide0(fD); appear(fI, tCI); vanish(fI, tCD); appear(fD, tCD); vanish(fD, Q(Tend('d5') + 0.3));
  sfx('tick', tCI, { g: 0.6 }); sfx('tick', tCD, { g: 0.6 });

  // ── 常用的就近拿：控制器、运算器直接从旁边的缓存拿，通道清静了 ──
  const pk = [[s.start, 1]]; let pc = 1;
  depI.forEach(([t, row]) => { if (row !== pc) pk.push([t, row]); pc = row; });
  for (let k = 0; k < 10; k++) {
    const isI = k % 2 === 0, tk = tFree - 0.2 + k * 0.4;
    if (tk + 0.35 > Q(T('d7', '换'))) break;
    const tp = tape(world, isI ? PROG.game[k % 4][0] : DATA[3][0], isI ? 'i' : 'd');
    const from = isI ? [790, 330] : [790, 540], dest = isI ? [G.slot.x, G.slot.y] : [G.accTape.x, G.accTape.y];
    mover(tp, [[tk, from[0], from[1], { s: 0.5, a: 0.4 }], [tk + 0.35, dest[0], dest[1], { s: 0.8 }]], tk + 0.36);
    if (isI) { pc = pc % 4 + 1; pk.push([tk, pc]); }
    if (k % 2 === 0) sfx('tick', tk + 0.3, { g: 0.35, p: -0.3 });
  }

  // ── 根基没变：换用途，还是只换格子里的指令 ──
  const tSwap = Q(T('d7', '换'));
  const band = frameBox(world, 1104, rowY(1) + 2, 532, 4 * ROW.h - 4, 'var(--blue)', 3); band.style.background = 'var(--blue9)'; hide0(band);
  const pName = txt(world, 't-4 blue', '', 1330, 146); keyed(pName).at(tSwap + 0.9, { html: tr('算账程序', 'Bookkeeping') });
  wipe(band, tSwap, { dir: 't', d: 0.4 });
  for (let r = 1; r <= 4; r++) {
    const out = tape(world, PROG.game[r - 1][0], 'i'), inn = tape(world, PROG.calc[r - 1][0], 'i');
    const a = tSwap + (r - 1) * 0.08, [rx, ry] = rowTape(r);
    mover(out, [[a, rx, ry, { s: 0.92 }], [a + 0.45, rx + 520, ry - 30, { s: 0.92, a: 0 }]], a + 0.46);
    mover(inn, [[a + 0.35, rx - 40, -80, { s: 0.92, a: 0 }], [a + 0.85, rx, ry, { s: 0.92 }]], a + 0.86);
    M.setRow(r, a, '', '', 'i'); M.setRow(r, a + 0.86, PROG.calc[r - 1][0], PROG.calc[r - 1][1], 'i');
  }
  sfx('drive', tSwap, { g: 0.6, p: 0.4 }); sfx('pop', tSwap + 0.9, { g: 0.6, p: 0.4 });
  M.screenAt(tSwap + 0.9, 'calc'); sfx('beep', tSwap + 0.9, { g: 0.4, p: 0.8 });
  pk.push([tSwap + 1.0, 1]);
  pcTo(M, pk, s.start);
  const ringR = pencilRing(ov, 1104, rowY(1), 532, 4 * ROW.h, Q(T('d7', '格子里')), 0.5); sfx('tick', Q(T('d7', '格子里')), { g: 0.6, p: 0.5 });
});
