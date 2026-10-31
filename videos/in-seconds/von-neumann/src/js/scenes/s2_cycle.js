// 三步循环：取（c2）→ 拆（c3）→ 做（c4）→ 下一格，几十亿圈（c5）→ 换指令就换用途（c6、c7）。末态即下一场的初态。
scene('cycle', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const M = machine(world, { rows: 'calc', out: null });
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const arrows = ringArrows(M);
  arrows.forEach((a) => appear(a, Q(T('c1')) + 0.3));
  sfx('pop', Q(T('c1')) + 0.3, { g: 0.5, p: -0.4 });

  // 小环上的红圈：c1 先转两圈示意，之后跟着讲到的那一步
  const t1 = T('c1') + 0.9, sched = [];
  for (let k = 0; k < 6; k++) sched.push([t1 + k * 0.32, k % 3]);
  sched.push([t1 + 6 * 0.32, -1]);
  const tTake = Q(T('c2', '取')), tSplit = Q(T('c3', '拆')), tDo = Q(T('c4', '做'));
  sched.push([tTake, 0], [tSplit, 1], [tDo, 2]);
  for (let k = 0; k < 6; k++) sfx('tick', t1 + k * 0.32, { g: 0.35, p: -0.4 });
  [tTake, tSplit, tDo].forEach((t) => sfx('beep', t, { g: 0.45, p: -0.4 }));

  // 纸带从第 r 格经通道送到 (x, y)
  const path3 = (r, x, y, t0, d = 1.2) => [[t0, 1146, rowY(r) + 6, { s: 0.92 }], [t0 + d * 0.25, 1090, G.busY - 22, { s: 0.8 }], [t0 + d * 0.62, 812, G.busY - 22, { s: 0.8 }], [t0 + d, x, y, { s: 0.92 }]];
  const send = (bits, kind, r, x, y, t0, until, d) => { const tp = tape(world, bits, kind, 0, 0); mover(tp, path3(r, x, y, t0, d), until); return tp; };
  const halves = (bits, t0, t1) => {
    const a = tape(world, bits.slice(0, 4), 'i', 0, 0), b = tape(world, bits.slice(4), 'i', 0, 0);
    mover(a, [[t0, 360, 266], [t0 + 0.35, 350, 266]], t1);
    mover(b, [[t0, 360 + 4 * TAPE_P, 266], [t0 + 0.35, 380 + 4 * TAPE_P + 30, 266]], t1);
    return [a, b];
  };

  // ── c2 取：第 1 格的指令沿通道进控制器 ──
  const ulR1 = path(ov, `M1100,${rowY(1) + 54} L1560,${rowY(1) + 54}`, 'red', { w: 4, arrow: false });
  drawIn(ulR1, Q(T('c2', '1')), 0.3); sfx('tick', Q(T('c2', '1')), { g: 0.6, p: 0.4 });
  const tF = Q(T('c2', '取出')), tArr = tF + 1.2;
  sfx('drive', tF, { g: 0.55 });
  vanish(M.slotLab, tArr);

  // ── c3 拆：纸带分成两半，前半截「加」，后半截「第 8 格」──
  const tCut = Q(T('c3', '前'));
  const full = tape(world, PROG.calc[0][0], 'i', 0, 0); mover(full, path3(1, 360, 266, tF, 1.2), tCut);
  const t2 = Q(T('c5', '第 2')) + 0.05;
  halves(PROG.calc[0][0], tCut, t2);
  sfx('beep', tCut, { g: 0.5 });
  const opL = txt(world, 'ttl red', '', 352, 334), adL = txt(world, 'ttl red', '', 532, 340);
  css(opL, { fontSize: '64px', lineHeight: '1' }); css(adL, { fontSize: '50px', lineHeight: '1' });
  opL.dataset.name = '动作'; adL.dataset.name = '格号';
  const opK = keyed(opL), adK = keyed(adL);
  const tOp = Q(T('c3', '加')), tAd = Q(T('c3', '8'));
  opK.at(tOp, { html: tr('加', 'ADD') }); adK.at(tAd, { html: tr('第8格', 'cell 8') });
  sfx('pop', tOp, { g: 0.7, p: -0.5 }); sfx('pop', tAd, { g: 0.7, p: -0.3 });
  const brk = (x, w, t) => { const p = path(ov, `M${x},322 L${x},330 L${x + w},330 L${x + w},322`, 'red', { w: 3, arrow: false }); drawIn(p, t, 0.25); return p; };
  const bL = brk(352, 4 * TAPE_P + 10, tOp - 0.1), bR = brk(380 + 4 * TAPE_P + 30, 4 * TAPE_P + 10, tAd - 0.1);
  // 「第 8 格」指过去：红铅笔虚线从后半截连到第 8 格
  const toR8 = path(ov, `M650,300 C860,300 900,${rowY(8) + 30} 1092,${rowY(8) + 30}`, 'red', { w: 3, dashed: '10 8' });
  arrowIn(toR8, tAd + 0.2, 0.5);
  to(toR8, Tend('c4') - 0.4, { autoAlpha: 0, duration: 0.3 });
  vanish(ulR1, tCut);

  // ── c4 做：取出第 8 格的数，送进运算器相加 ──
  const ring8 = pencilRing(ov, 1100, rowY(8) + 6, 460, 48, Q(T('c4', '8')), 0.4); sfx('tick', Q(T('c4', '8')), { g: 0.6, p: 0.4 });
  const tD = Q(T('c4', '取出')), tAdd = Q(T('c4', '相加'));
  send(DATA[3][0], 'd', 8, 520, 560, tD, tAdd, 1.3);
  sfx('drive', tD, { g: 0.55, p: 0.2 });
  const exK = keyed(M.expr), acK = keyed(M.acc);
  const tSum = Q(Tend('c4') + 0.3);
  exK.at(tAdd, { html: '+ 5' }).at(tSum, { html: '' });
  acK.at(tSum, { html: '5' });
  sfx('thud', tAdd, { g: 0.5, p: -0.4 }); sfx('chime', tSum, { g: 0.7, p: -0.4 });
  vanish(ring8, Tend('c4') + 0.2);

  // ── c5 下一格：第 2 格「加 第9格」快走一遍；然后整套循环飞快地转（几十亿圈）──
  pcAt(s.start, 1);
  const tS = Q(T('c5', '转')) - 0.4, tE = Q(Tend('c5') + 0.25);
  send(PROG.calc[1][0], 'i', 2, 360, 266, t2, t2 + 0.62, 0.55);
  halves(PROG.calc[1][0], t2 + 0.6, tS);
  opK.at(t2 + 0.6, { html: tr('加', 'ADD') }); adK.at(t2 + 0.6, { html: tr('第9格', 'cell 9') });
  send(DATA[4][0], 'd', 9, 520, 560, t2 + 0.75, t2 + 1.4, 0.6);
  exK.at(t2 + 1.4, { html: '+ 3' }).at(t2 + 1.75, { html: '' }); acK.at(t2 + 1.75, { html: '8' });
  sfx('drive', t2, { g: 0.45 }); sfx('beep', t2 + 0.6, { g: 0.4, p: -0.4 }); sfx('thud', t2 + 1.4, { g: 0.4, p: -0.4 });
  // 飞转：红圈飞快轮转，通道里纸带连成一串，指针 1→4 来回跳，第 7 格写进结果 8
  opK.at(tS, { html: '' }); adK.at(tS, { html: '' });
  vanish(bL, tS); vanish(bR, tS);
  const pk = [[s.start, 1], [Q(T('c5', '第 2')), 2]];
  for (let t = tS, k = 0; t < tE - 0.05; t += 0.18, k++) pk.push([t, (k % 4) + 1]);
  pk.push([tE, 4]);
  const tG = Q(Tend('c7') + 0.8);
  pk.push([tG, 1], [tG + 2.2, 2]);
  pcTo(M, pk, s.start);
  sfx('beep', Q(T('c5', '第 2')), { g: 0.45, p: 0.3 });
  M.setRow(7, tS + 0.5, '00001000', '8', 'd');
  const stream = [];
  for (let k = 0; k < 14; k++) { const e = blk(world, '', 0, 0, 38, 18); e.style.background = k % 3 === 1 ? 'var(--blue)' : 'var(--ochre)'; e.dataset.name = '飞过的纸带'; stream.push(e); }
  F((t) => {
    const on = t >= tS && t < tE;
    stream.forEach((e, k) => {
      if (!on) { e.style.visibility = 'hidden'; return; }
      const dir = k % 2 ? -1 : 1, ph = ((t - tS) * 1400 + k * 41) % 300;
      const x = dir > 0 ? 1080 - ph : 790 + ph, y = G.busY + (dir > 0 ? -17 : 1);
      e.style.visibility = x > 786 && x < 1060 ? '' : 'hidden';
      e.style.transform = `translate(${x.toFixed(0)}px,${y}px)`;
    });
  });
  for (let t = tS; t < tE; t += BEAT / 2) sfx('tick', t, { g: 0.3, p: 0.1 });

  // ── c6 换用途：第 1–4 格先是算账的程序，换成游戏的程序 ──
  const band = blk(world, '', 1084, rowY(1) + 2, 512, 4 * ROW.h - 4); css(band, { background: 'var(--blue9)', border: '3px solid var(--blue)' });
  band.dataset.name = '第1–4格的程序';
  const pName = txt(world, 't-4 blue', '', 1100, 104); const pK = keyed(pName);
  const tCalc = Q(T('c6', '想算账')), tSwap = Q(T('c6', '换'));
  pK.at(tCalc, { html: tr('算账的程序', 'Bookkeeping') }).at(tSwap, { html: '' }).at(tSwap + 0.7, { html: tr('游戏的程序', 'Game') });
  wipe(band, tCalc, { dir: 't', d: 0.4 }); sfx('pop', tCalc, { g: 0.6, p: 0.4 }); sfx('pop', tSwap + 0.7, { g: 0.6, p: 0.4 });
  for (let r = 1; r <= 4; r++) {
    const out = tape(world, PROG.calc[r - 1][0], 'i', 0, 0), inn = tape(world, PROG.game[r - 1][0], 'i', 0, 0);
    const a = tSwap + (r - 1) * 0.08;
    mover(out, [[a, 1146, rowY(r) + 6, { s: 0.92 }], [a + 0.35, 1146, rowY(r) - 40 - 70 * (5 - r), { s: 0.92, a: 0 }]], a + 0.36);
    mover(inn, [[a + 0.3, 1146, -60, { s: 0.92, a: 0 }], [a + 0.75, 1146, rowY(r) + 6, { s: 0.92 }]], a + 0.76);
    M.setRow(r, a, '', '', 'i'); M.setRow(r, a + 0.76, PROG.game[r - 1][0], PROG.game[r - 1][1], 'i');
    sfx('tick', a + 0.75, { g: 0.5, p: 0.5 });
  }
  sfx('drive', tSwap, { g: 0.6, p: 0.4 });
  // 算账的程序：红线从第 1 格扫到第 4 格，输出框里出现结果 8；换成游戏之后，输出框里画出棋盘
  const sweep = blk(world, '', 0, 0, 470, 4); sweep.style.background = 'var(--red)'; sweep.dataset.name = '扫过的红线';
  const tLoadC = Q(T('c6', '装算账'));
  mover(sweep, [[tLoadC, 1104, rowY(1) + 54], [tLoadC + 1.0, 1104, rowY(4) + 54]], tLoadC + 1.15);
  M.outAt(tLoadC + 1.0, '8'); slam(M.out, tLoadC + 1.0, { from: 1.4, d: 0.3 }); sfx('pop', tLoadC + 1.0, { g: 0.6, p: 0.8 });
  M.outAt(tSwap + 0.85, 'game');
  M.outLines.forEach((p, k) => drawIn(p, tSwap + 0.85 + k * 0.1, 0.25)); M.outMarks.forEach((p, k) => drawIn(p, tSwap + 1.3 + k * 0.15, 0.2));
  sfx('beep', tSwap + 0.85, { g: 0.4, p: 0.8 });

  // ── c7 电线一根不动：左边整块圈住不变；变的只是格子里的内容 ──
  const ringL = pencilRing(ov, G.CC.x, G.CC.y, G.CC.w, G.CA.y + G.CA.h - G.CC.y, Q(T('c7', '电线')), 0.5);
  const ringR = pencilRing(ov, 1084, rowY(1), 512, 4 * ROW.h, Q(T('c7', '格子里')), 0.45);
  sfx('tick', Q(T('c7', '电线')), { g: 0.6, p: -0.5 }); sfx('tick', Q(T('c7', '格子里')), { g: 0.6, p: 0.5 });
  to(ringL, Tend('c7') + 0.6, { autoAlpha: 0, duration: 0.4 }); to(ringR, Tend('c7') + 0.6, { autoAlpha: 0, duration: 0.4 });

  // 停留（88–92）：换上的游戏程序照样按同一套循环跑：指针回到第 1 格，取出「画 棋盘」
  stepCursor(M, sched.concat([[tS, 0], [tE, -1], [tG + 0.1, 0], [tG + 1.2, 1], [tG + 2.0, 2], [s.end - 0.2, -1]]), [tS, tE, 0.11]);
  send(PROG.game[0][0], 'i', 1, 360, 266, tG + 0.1, tG + 1.25, 1.0);
  halves(PROG.game[0][0], tG + 1.2, s.end - 0.3);
  opK.at(tG + 1.4, { html: tr('画', 'DRAW') }).at(s.end - 0.3, { html: '' });
  adK.at(tG + 1.5, { html: tr('棋盘', 'board') }).at(s.end - 0.3, { html: '' });
  sfx('beep', tG, { g: 0.4, p: 0.3 }); sfx('drive', tG + 0.1, { g: 0.4 }); sfx('pop', tG + 1.4, { g: 0.5, p: -0.4 }); sfx('beep', tG + 2.2, { g: 0.4, p: 0.3 });
});
