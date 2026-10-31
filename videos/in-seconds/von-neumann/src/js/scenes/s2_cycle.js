// 三步循环：三个动作（c1）→ 第一步：取（c2–c3）→ 第二步：拆（c4–c5）→ 第三步：做（c6–c7）→ 第 2 格（c8）→ 越转越快（c9）
// → 换指令就换用途（c10–c11）。每一步先点亮步骤名，停顿里画出这一步要走的路，再走。末态即下一场的初态。
scene('cycle', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const M = machine(world, { rows: 'calc' });

  // ── 时刻 ──
  const tTake = Q(T('c2', '取')), tFetch = Q(T('c3', '取出')), tSplit = Q(T('c4', '拆')), tFront = Q(T('c5', '前')), tOp = Q(T('c5', '加')),
    tBack = Q(T('c5', '后')), tAd = Q(T('c5', '8')), tDo = Q(T('c6', '做')), tGet = Q(T('c7', '第')), tAdd = Q(T('c7', '加进')),
    tRow2 = Q(T('c8', '第 2')), tSpin = Q(T('c9')) + 0.2, tSpinEnd = Q(Tend('c9') + 1.2), tCalc = Q(T('c10', '装算账')), tSwap = Q(T('c10', '换'));
  const tSum = Q(Tend('c7') + 0.2);

  // 镜头：拆的时候推近控制器，拆完退回；最后推近通道，接下一场
  const tPushOut = Q(Tend('c5') + 0.1), tToBus = Q(s.end - 2.4);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[Q(T('c4')) + 0.05, { x: 470, y: 270, z: 1.5 }, 0.9, { g: 0.4 }], [tPushOut, { x: 960, y: 484, z: 1 }, 0.8, { g: 0.4 }], [tToBus, { x: 900, y: 465, z: 1.3 }, 1.4, { g: 0.4 }]]);

  // c1：红圈绕三步转两圈；之后跟着讲到的那一步
  const t1 = Q(T('c1')) + 0.8, sched = [];
  for (let k = 0; k < 6; k++) sched.push([t1 + k * 0.32, k % 3]);
  sched.push([t1 + 6 * 0.32, -1], [tTake, 0], [tSplit, 1], [tDo, 2], [Q(Tend('c7') + 0.5), -1]);
  for (let k = 0; k < 6; k++) sfx('tick', t1 + k * 0.32, { g: 0.35, p: -0.1 });
  // 讲到的步骤名放大一下
  [[tTake, 0], [tSplit, 1], [tDo, 2]].forEach(([t, k]) => { fromTo(M.steps[k], t, { scale: 1 }, { keyframes: [{ scale: 1.35, duration: 0.18, ease: 'power2.out' }, { scale: 1, duration: 0.5, ease: 'power2.inOut' }], immediateRender: false }); sfx('beep', t, { g: 0.5, p: -0.1 }); });

  // 指针与右上角的读数
  const pk = [[Q(T('c2')), 1], [tRow2, 2]];

  // ── 第一步：取。停顿里先画出路线：第 1 格 → 通道 → 控制器 ──
  const routeD = `M1110,${rowY(1) + 34} L1110,${G.busY} L760,${G.busY} C620,${G.busY} 560,330 520,300`;
  const r1 = path(ov, routeD, 'red', { w: 4, dashed: '12 10' }); arrowIn(r1, tTake + 0.35, 0.6); sfx('tick', tTake + 0.35, { g: 0.4 });
  const fr1 = frameBox(world, 1104, rowY(1) + 2, 532, ROW.h - 4); hide0(fr1); appear(fr1, Q(T('c3', '1'))); vanish(fr1, tSplit);
  sfx('tick', Q(T('c3', '1')), { g: 0.6, p: 0.5 });
  const fetched = tape(world, PROG.calc[0][0], 'i'); mover(fetched, route(1, G.slot.x, G.slot.y, tFetch, 1.5), tFront);
  sfx('drive', tFetch, { g: 0.55 });
  to(r1, tFetch + 1.5, { opacity: 0, duration: 0.3 });

  // ── 第二步：拆。前半截：读出 0001，到「代码表」里查到「加」；后半截：读出 1000，按 8 4 2 1 算出是第 8 格 ──
  const halves = (bits, t0, t1) => {
    const a = tape(world, bits.slice(0, 4), 'i'), b = tape(world, bits.slice(4), 'i');
    mover(a, [[t0, G.slot.x, G.slot.y], [t0 + 0.5, G.slot.x - 10, G.slot.y]], t1);
    mover(b, [[t0, G.slot.x + 4 * TAPE_P, G.slot.y], [t0 + 0.5, G.slot.x + 4 * TAPE_P + 70, G.slot.y]], t1);
  };
  halves(PROG.calc[0][0], tFront, tRow2);
  sfx('beep', tFront, { g: 0.5, p: -0.4 });
  const brk = (x, w, t) => { const p = path(ov, `M${x},${G.slot.y + 56} L${x},${G.slot.y + 66} L${x + w},${G.slot.y + 66} L${x + w},${G.slot.y + 56}`, 'red', { w: 4, arrow: false }); drawIn(p, t, 0.3); return p; };
  const bL = brk(G.slot.x - 10, 4 * TAPE_P + 12, tFront + 0.3), bR = brk(G.slot.x + 4 * TAPE_P + 70, 4 * TAPE_P + 12, tBack);
  const xL = G.slot.x - 6, xR = G.slot.x + 4 * TAPE_P + 74;
  // 代码表：控制器左边的一张小表，写着几个动作对应的 0 和 1（本片的玩具机器）
  const book = h('div', 'sheet', world); px(book, 50, 176, 220, 236); book.dataset.name = '代码表';
  const bt = txt(book, 'ttl', tr('代码表', 'Codes'), 18, 10); css(bt, { fontSize: '30px' });
  [['0001', tr('加', 'ADD')], ['0011', tr('存', 'STORE')], ['1111', tr('停', 'HALT')]].forEach(([b, w], k) => {
    const r = h('div', 'abs', book, `<span style="font:600 30px 'Mono'">${b}</span><span style="font:900 32px 'Serif SC';margin-left:24px">${w}</span>`); px(r, 18, 64 + k * 54);
  });
  const tBook = Q(Tend('c4')) + 0.1;
  hide0(book); slide(book, tBook, { x: 120, d: 0.5, ease: 'power3.out' }); sfx('pop', tBook, { g: 0.6, p: -0.7 });
  hide(book, Q(T('c10')) - 0.3, { d: 0.3 });
  const hiBook = (t0, t1) => { const f = frameBox(book, 8, 58, 204, 50); hide0(f); appear(f, t0); vanish(f, t1); };
  // 前半截读出的 0 和 1，红虚线指到表里那一行
  const cells = (b) => [...b].map((c) => `<span style="display:inline-block;width:26px;text-align:center">${c}</span>`).join('');
  const bitsL = txt(world, 'mono blue', cells('0001'), xL, 300), bitsR = txt(world, 'mono blue', cells('1000'), xR, 300);
  [bitsL, bitsR].forEach((e) => { css(e, { font: '700 34px "Mono"' }); hide0(e); });
  bitsL.dataset.name = '前半截的数'; bitsR.dataset.name = '后半截的数';
  appear(bitsL, tFront + 0.5); appear(bitsR, tBack); sfx('tick', tFront + 0.5, { g: 0.5, p: -0.5 }); sfx('tick', tBack, { g: 0.5, p: -0.3 });
  const tLook = Q(T('c5', '做'));
  const look = path(ov, `M${xL - 4},318 C${xL - 30},318 ${xL - 20},${176 + 83} 258,${176 + 83}`, 'red', { w: 3, dashed: '8 6' });
  arrowIn(look, tLook, 0.4); hiBook(tLook + 0.35, tRow2); sfx('tick', tLook + 0.35, { g: 0.5, p: -0.7 });
  vanish(look, tRow2);
  // 后半截：每一位下面标上 8 4 2 1，是 1 的那一位算数：1000 → 8
  const wts = txt(world, 'mono soft', cells('8421'), xR, 340); css(wts, { font: '600 24px "Mono"' }); hide0(wts); wts.dataset.name = '每一位的大小';
  const tW = Q(T('c5', '去'));
  appear(wts, tW); sfx('tick', tW, { g: 0.5, p: -0.3 });
  const ring8 = h('div', 'abs circ', world); px(ring8, xR - 2, 296, 30, 72); css(ring8, { border: '4px solid var(--red)' }); hide0(ring8); appear(ring8, tW + 0.4); vanish(ring8, tRow2);
  const opL = txt(world, 'ttl red', '', xL, 346), adL = txt(world, 'ttl red', '', xR + 116, 330);
  css(opL, { fontSize: '64px', lineHeight: '1' }); css(adL, { fontSize: '50px', lineHeight: '1' }); opL.dataset.name = '动作'; adL.dataset.name = '格号';
  const opK = keyed(opL), adK = keyed(adL);
  opK.at(tOp, { html: tr('加', 'ADD') }); adK.at(tAd, { html: '= ' + tr('第8格', 'cell 8') });
  sfx('pop', tOp, { g: 0.7, p: -0.5 }); sfx('pop', tAd, { g: 0.7, p: -0.3 });
  // 「第 8 格」指过去：镜头退回全图后，虚线从后半截连到第 8 格
  const toR8 = path(ov, `M${G.slot.x + 4 * TAPE_P + 200},${G.slot.y + 24} C900,${G.slot.y + 24} 980,${rowY(8) + 34} 1100,${rowY(8) + 34}`, 'red', { w: 4, dashed: '12 10' });
  arrowIn(toR8, tPushOut + 0.8, 0.6); sfx('tick', tPushOut + 0.8, { g: 0.5, p: 0.4 });
  to(toR8, tSum, { opacity: 0, duration: 0.3 });

  // ── 第三步：做。去第 8 格拿到 5，加进运算器：0 + 5 = 5 ──
  const fr8 = frameBox(world, 1104, rowY(8) + 2, 532, ROW.h - 4); hide0(fr8); appear(fr8, tDo + 0.3); vanish(fr8, tSum); sfx('tick', tDo + 0.3, { g: 0.6, p: 0.5 });
  const five = tape(world, DATA[3][0], 'd'); mover(five, route(8, G.accTape.x, G.accTape.y, tGet, 1.4), tAdd + 0.4);
  sfx('drive', tGet, { g: 0.55, p: 0.2 });
  const fiveLab = txt(world, 'ttl ochre', '5', 0, 0); css(fiveLab, { fontSize: '44px' });
  mover(fiveLab, route(8, G.accTape.x, G.accTape.y, tGet, 1.4).map(([t, x, y]) => [t, x + 205, y - 2]), tAdd + 0.4, Q(T('c7', '5')));
  const exK = keyed(M.expr), acK = keyed(M.acc);
  exK.at(tAdd, { html: '+ 5' }).at(tSum, { html: '' });
  acK.at(tSum, { html: '5' });
  fromTo(M.acc, tSum, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false, transformOrigin: '0% 50%' });
  sfx('thud', tAdd, { g: 0.5, p: -0.4 }); sfx('chime', tSum, { g: 0.7, p: -0.4 });

  // ── 然后，轮到第 2 格：指针下移；停顿里第 2 格「加 第9格」完整走一遍：5 + 3 = 8 ──
  const fr2 = frameBox(world, 1104, rowY(2) + 2, 532, ROW.h - 4); hide0(fr2); appear(fr2, tRow2); vanish(fr2, tSpin);
  opK.at(tRow2, { html: '' }); adK.at(tRow2, { html: '' }); vanish(bL, tRow2); vanish(bR, tRow2);
  keyed(bitsL).at(tRow2, { html: '' }); keyed(bitsR).at(tRow2, { html: '' }); vanish(wts, tRow2);
  sfx('beep', tRow2, { g: 0.45, p: 0.4 });
  const t2 = Q(Tend('c8')) + 0.05;
  const f2 = tape(world, PROG.calc[1][0], 'i'); mover(f2, route(2, G.slot.x, G.slot.y, t2, 0.8), t2 + 0.82);
  halves(PROG.calc[1][0], t2 + 0.8, tSpin);
  keyed(bitsL).at(t2 + 0.85, { html: cells('0001') }).at(tSpin, { html: '' }); keyed(bitsR).at(t2 + 0.85, { html: cells('1001') }).at(tSpin, { html: '' });
  hiBook(t2 + 0.9, tSpin);
  opK.at(t2 + 0.9, { html: tr('加', 'ADD') }).at(tSpin, { html: '' }); adK.at(t2 + 1.0, { html: '= ' + tr('第9格', 'cell 9') }).at(tSpin, { html: '' });
  sched.push([t2, 0], [t2 + 0.8, 1], [t2 + 1.1, 2]);
  const three = tape(world, DATA[4][0], 'd'); mover(three, route(9, G.accTape.x, G.accTape.y, t2 + 1.1, 0.8), t2 + 1.92);
  exK.at(t2 + 1.9, { html: '+ 3' }).at(t2 + 2.3, { html: '' }); acK.at(t2 + 2.3, { html: '8' });
  sfx('drive', t2, { g: 0.45 }); sfx('beep', t2 + 0.8, { g: 0.4, p: -0.4 }); sfx('drive', t2 + 1.1, { g: 0.4, p: 0.2 }); sfx('pop', t2 + 2.3, { g: 0.5, p: -0.4 });

  // ── 越转越快：红圈加速轮转，通道里纸带连成一串，指针飞快地跳；上方的计数器滚到几十亿，秒表走一圈 ──
  stepCursor(M, sched, [tSpin, tSpinEnd]);
  // 飞转讲的是如今的芯片，不是这台玩具机器的某一格：指针先收起；转完回到第 2 格，算账程序接着走第 3 格（存 第7格）、第 4 格（停）
  const tRun = tCalc + 0.5;
  pk.push([tSpin, null], [tSpinEnd, 2], [tRun, 3], [tRun + 1.0, 4], [tSwap + 0.9, 1]);
  pcTo(M, pk, Q(T('c2')));
  const st7 = tape(world, '00001000', 'd'); mover(st7, [[tRun + 0.1, G.accTape.x, G.accTape.y, { s: 0.8 }], [tRun + 0.35, 752, laneY, { s: 0.8 }], [tRun + 0.6, 1112, laneY, { s: 0.8, e: (u) => u }], [tRun + 0.85, ...rowTape(7), { s: 0.92 }]], tRun + 0.86);
  M.setRow(7, tRun + 0.86, '00001000', '8', 'd'); sfx('drive', tRun + 0.1, { g: 0.4, p: 0.3 }); sfx('tick', tRun + 0.85, { g: 0.5, p: 0.5 });
  const stream = [];
  for (let k = 0; k < 16; k++) { const e = blk(world, '', 0, 0, 40, 18); e.style.background = k % 3 === 1 ? 'var(--blue)' : 'var(--ochre)'; e.dataset.name = '飞过的纸带'; stream.push(e); }
  F((t) => {
    const on = t >= tSpin + 0.3 && t < tSpinEnd;
    const u = t - tSpin, dist = 300 * u + 520 * u * u;       // 越走越快
    stream.forEach((e, k) => {
      if (!on) { e.style.visibility = 'hidden'; return; }
      const dir = k % 2 ? -1 : 1, ph = (dist + k * 41) % 360;
      const x = dir > 0 ? 1100 - ph : 740 + ph, y = G.busY + (dir > 0 ? -18 : 2);
      e.style.visibility = x > 742 && x < 1060 ? '' : 'hidden';
      e.style.transform = `translate(${x.toFixed(0)}px,${y}px)`;
    });
  });
  const counter = h('div', 'sheet', world); px(counter, 560, 24, 780, 104); counter.dataset.name = '圈数';
  const watch = h('div', 'abs', counter); px(watch, 22, 14, 76, 76);
  const ws = svg('svg', { width: 76, height: 76, viewBox: '-38 -38 76 76' }, watch);
  svg('circle', { r: 32, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, ws); svg('path', { d: 'M-6,-40 L6,-40', stroke: C.ink, 'stroke-width': 5 }, ws);
  const hand = svg('path', { d: 'M0,0 L0,-26', stroke: C.red, 'stroke-width': 4 }, ws);
  const wl = txt(counter, 'type', tr('1 秒', '1 S'), 110, 34); wl.style.fontSize = '26px';
  const line = h('div', 'abs', counter); px(line, 200, 14, 560, 76); css(line, { display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '16px' });
  const num = h('span', 'mono', line); css(num, { font: '700 64px "Mono"', letterSpacing: '.02em' }); num.dataset.name = '已转的圈数';
  const unit = h('span', 'ttl', line, tr('圈', 'loops')); css(unit, { fontSize: '52px' });
  hide0(counter); wipe(counter, tSpin, { dir: 't', d: 0.4 }); hide(counter, tSpinEnd + 0.1, { d: 0.35 });
  const tFull = tSpin + 2.6;                                 // 秒表走完一圈时，计数到几十亿
  let lastN = '';
  F((t) => {
    const u = clamp((t - tSpin) / (tFull - tSpin));
    hand.setAttribute('transform', `rotate(${(360 * u).toFixed(1)})`);
    let v = Math.floor(Math.pow(10, 9.6 * Math.pow(u, 1.6))) + 2;
    if (t > tFull) v += Math.floor((t - tFull) * 1.3e9);
    const sN = group(v);
    if (sN !== lastN) { num.textContent = sN; lastN = sN; }
  });
  for (let t = tSpin; t < tSpinEnd; t += BEAT / 2) sfx('tick', t, { g: 0.3, p: 0.1 });
  sfx('riser', tFull - 1.2, { g: 0.35 });

  // ── 换用途：屏幕显示算账的结果；第 1–4 格整块换成游戏的程序，屏幕跟着换成棋盘 ──
  const tScr = Q(T('c10'));
  appear(M.screen, tScr); wipe(M.screen, tScr, { dir: 'l', d: 0.4 }); appear(M.screenLab, tScr + 0.2); drawIn(M.screenLink, tScr, 0.4);
  M.screenAt(tScr, 'calc'); sfx('pop', tScr, { g: 0.6, p: 0.8 });
  // 装上算账的程序，它跑一遍：指针走过第 1–4 格，屏幕上一个字一个字打出 5+3=8
  M.scrCalc.textContent = ''; typeText(M.scrCalc, '5+3=8', tRun + 1.0, 4, { cursor: false, sfxGain: 0.5 });
  const band = frameBox(world, 1104, rowY(1) + 2, 532, 4 * ROW.h - 4, 'var(--blue)', 3); band.style.background = 'var(--blue9)'; hide0(band); band.dataset.name = '第1–4格的程序';
  const pName = txt(world, 't-4 blue', '', 1330, 146); const pK = keyed(pName);
  pK.at(tCalc, { html: tr('算账程序', 'Bookkeeping') }).at(tSwap, { html: '' }).at(tSwap + 0.9, { html: tr('游戏程序', 'Game') });
  wipe(band, tCalc, { dir: 't', d: 0.4 }); sfx('pop', tCalc, { g: 0.6, p: 0.4 }); sfx('pop', tSwap + 0.9, { g: 0.6, p: 0.4 });
  for (let r = 1; r <= 4; r++) {
    const out = tape(world, PROG.calc[r - 1][0], 'i'), inn = tape(world, PROG.game[r - 1][0], 'i');
    const a = tSwap + (r - 1) * 0.08, [rx, ry] = rowTape(r);
    mover(out, [[a, rx, ry, { s: 0.92 }], [a + 0.45, rx + 520, ry - 30, { s: 0.92, a: 0 }]], a + 0.46);
    mover(inn, [[a + 0.35, rx - 40, -80, { s: 0.92, a: 0 }], [a + 0.85, rx, ry, { s: 0.92 }]], a + 0.86);
    M.setRow(r, a, '', '', 'i'); M.setRow(r, a + 0.86, PROG.game[r - 1][0], PROG.game[r - 1][1], 'i');
    sfx('tick', a + 0.85, { g: 0.45, p: 0.5 });
  }
  sfx('drive', tSwap, { g: 0.6, p: 0.4 });
  M.screenAt(tSwap + 0.9, 'game');
  M.scrLines.forEach((p, k) => drawIn(p, tSwap + 0.9 + k * 0.1, 0.25)); M.scrMarks.forEach((p, k) => drawIn(p, tSwap + 1.35 + k * 0.15, 0.2));
  sfx('beep', tSwap + 0.9, { g: 0.4, p: 0.8 });

  // ── 电线一根不动：左边整块圈住；变的只是格子里的内容 ──
  const ringL = pencilRing(ov, G.CC.x, G.CC.y, 800, G.CA.y + G.CA.h - G.CC.y, Q(T('c11', '电线')), 0.55);
  const ringR = pencilRing(ov, 1104, rowY(1), 532, 4 * ROW.h, Q(T('c11', '格子里')), 0.5);
  sfx('tick', Q(T('c11', '电线')), { g: 0.6, p: -0.5 }); sfx('tick', Q(T('c11', '格子里')), { g: 0.6, p: 0.5 });
  [ringL, ringR, band].forEach((e) => to(e, tToBus - 0.2, { opacity: 0, duration: 0.4 }));
  pK.at(tToBus - 0.2, { html: '' });
  // 推近通道时，格子变淡：下一场看通道
  M.rows.forEach((r) => fromTo(r.el, tToBus, { opacity: 1 }, { opacity: 0.35, duration: 0.6, immediateRender: false }));
});
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
