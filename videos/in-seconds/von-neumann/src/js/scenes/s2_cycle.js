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
  [['0001', tr('加', 'ADD')], ['0011', tr('存', 'STORE')], ['1000', tr('回', 'JUMP')]].forEach(([b, w], k) => {
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

  // ── 然后，轮到第 2 格：指针下移；从这一圈起机器接着往下跑，一圈比一圈快，一直快到几十亿圈（c9），最后减速停下 ──
  // 整段是同一个过程逐帧算出来的：每一圈「取」第 r 格的指令进控制器，「拆」出动作和格号，「做」：加的话把数送进运算器，
  // 存的话把运算器里的数送回第 7 格，回的话下一圈回到第 1 格。所有部件跟着动：指针、格子的红框、小环上的红圈、代码表、
  // 控制器里的纸带与读数、运算器里的数、屏幕上的结余，以及通道里的纸带。
  const fr2 = frameBox(world, 1104, rowY(2) + 2, 532, ROW.h - 4); hide0(fr2); appear(fr2, tRow2);
  opK.at(tRow2, { html: '' }); adK.at(tRow2, { html: '' }); vanish(bL, tRow2); vanish(bR, tRow2);
  keyed(bitsL).at(tRow2, { html: '' }); keyed(bitsR).at(tRow2, { html: '' }); vanish(wts, tRow2);
  sfx('beep', tRow2, { g: 0.45, p: 0.4 });
  const tS0 = Q(tRow2 + 0.45), tE = Q(Tend('c9') + 1.2);
  vanish(fr2, tS0);
  // 每一圈的时长：1.5 秒起，每圈乘 0.66 加速到 0.04 秒，结尾 0.75 秒减速
  const decel = [0.06, 0.1, 0.16, 0.25];
  const cyc = []; let t = tS0, P = 1.5;
  while (P > 0.04 && t + P < tE - 1.5) { cyc.push(P); t += P; P *= 0.66; }
  const fast = tE - decel.reduce((x, y) => x + y, 0) - t, nFast = Math.max(1, Math.round(fast / 0.04));
  for (let k = 0; k < nFast; k++) cyc.push(fast / nFast);
  cyc.push(...decel);
  // 逐圈的状态：第几格、开始时刻、执行前的累加数与结余
  const C1 = []; let row = 2, acc = 5, total = 0; t = tS0;
  for (const per of cyc) {
    const [op] = PROG.calc[row - 1];
    C1.push({ t0: t, P: per, row, acc, total });
    if (row === 1) acc += 5; else if (row === 2) acc += 3; else if (row === 3) total = acc;
    row = row === 4 ? 1 : row + 1; t += per;
  }
  const END = { row, acc, total };
  window.CALC_TOTAL = END.total; window.CALC_ACC = END.acc;  // 下一场（瓶颈）里屏幕、第 7 格与运算器接着用这两个数
  const at = (tt) => { if (tt < tS0 || tt >= tE) return null; let k = 0; while (k + 1 < C1.length && C1[k + 1].t0 <= tt) k++; const c = C1[k]; return { ...c, k, u: (tt - c.t0) / c.P }; };
  // 飞转里用的一套元素（与前面单步演示的元素分开，交接时同一位置，不闪）
  const ti = tape(world, '00000000', 'i'), td = tape(world, '00000000', 'd');
  ti.dataset.name = '飞转中的指令'; td.dataset.name = '飞转中的数据';
  const sp = h('div', 'abs', world, M.pc.innerHTML); sp.dataset.name = '飞转中的指针';
  const rf = frameBox(world, 1104, 0, 532, ROW.h - 4); rf.dataset.name = '飞转中的格';
  const bf = frameBox(book, 8, 0, 204, 50);
  const sL = txt(world, 'mono blue', '', xL, 300), sR = txt(world, 'mono blue', '', xR, 300), sOp = txt(world, 'ttl red', '', xL, 346), sAd = txt(world, 'ttl red', '', xR + 116, 330);
  [sL, sR].forEach((e) => css(e, { font: '700 34px "Mono"' })); css(sOp, { fontSize: '64px', lineHeight: '1' }); css(sAd, { fontSize: '50px', lineHeight: '1' });
  const sAcc = txt(world, 'mono', '', 310, 620); css(sAcc, { font: '700 130px "Mono"', lineHeight: '1' }); sAcc.dataset.name = '飞转中的累加数';
  [ti, td, sp, rf, bf, sL, sR, sOp, sAd, sAcc].forEach((e) => { e.style.visibility = 'hidden'; });
  const ops = { 1: [tr('加', 'ADD'), '0001', 0], 2: [tr('加', 'ADD'), '0001', 0], 3: [tr('存', 'STORE'), '0011', 1], 4: [tr('回', 'JUMP'), '1000', 2] };
  const addr = { 1: 8, 2: 9, 3: 7, 4: 1 };
  const bin4 = (n) => n.toString(2).padStart(4, '0');
  let lastKey = '';
  F((tt) => {
    const c = at(tt), on = !!c, tail = tt >= tE && tt < tE + 0.4;         // 结束后指针再留 0.4 秒，与原来的指针交接
    M.acc.style.visibility = on ? 'hidden' : '';
    if (!on) {
      [ti, td, rf, bf, sL, sR, sOp, sAd, sAcc].forEach((e) => { e.style.visibility = 'hidden'; });
      sp.style.visibility = tail ? '' : 'hidden';
      if (tail) sp.style.transform = `translate(1062px,${rowY(END.row) + 14}px)`;
      const scr = tt >= tE ? 'end' : 'start';                // 屏幕内容也只由 t 决定：飞转前 0，停下后是最后的结余
      if (lastKey !== scr) { M.scrCalc.innerHTML = scrTotal(tt >= tE ? END.total : 0); lastKey = scr; }
      return;
    }
    const { row: r, u, P: per, acc: a0, total: tot } = c;
    // 指针：慢的时候滑过去，快的时候直接跳
    const prevRow = r === 1 ? 4 : r - 1, mv = clamp(u / Math.min(0.2, 0.3 / per * 0.2));
    const py = lerp(rowY(prevRow), rowY(r), r === 1 ? 1 : ease.io3(mv)) + 14;
    sp.style.visibility = ''; sp.style.transform = `translate(1062px,${py.toFixed(1)}px)`;
    rf.style.visibility = ''; rf.style.top = (rowY(r) + 2) + 'px';
    // 取：u 0–0.38 纸带从第 r 格走到控制器；之后停在槽里
    const [ix, iy, is] = routeAt(route(r, G.slot.x, G.slot.y, 0, 1), u / 0.38);
    ti.style.visibility = ''; ti.style.transform = `translate(${ix.toFixed(1)}px,${iy.toFixed(1)}px) scale(${is.toFixed(3)})`;
    // 拆：u ≥ 0.38 读出两半，查代码表
    const [opName, opBits, bookRow] = ops[r];
    const showDec = u >= 0.38;
    const key = r + '|' + (showDec ? 1 : 0) + '|' + (u >= 0.95 ? 1 : 0) + '|' + c.k;
    if (key !== lastKey) {
      lastKey = key;
      ti.holes.forEach((h_, i) => h_.classList.toggle('on', PROG.calc[r - 1][0][i] === '1'));
      sL.innerHTML = showDec ? cells(opBits) : ''; sR.innerHTML = showDec ? cells(bin4(addr[r])) : '';
      sOp.textContent = showDec ? opName : ''; sAd.textContent = showDec ? '= ' + tr(`第${addr[r]}格`, `cell ${addr[r]}`) : '';
      bf.style.top = (58 + bookRow * 54) + 'px';
      const accNow = u >= 0.95 && (r === 1 || r === 2) ? a0 + (r === 1 ? 5 : 3) : a0;
      sAcc.textContent = String(accNow);
      if (r === 3 && u >= 0.95) { M.scrCalc.innerHTML = scrTotal(a0); } else { M.scrCalc.innerHTML = scrTotal(tot); }
    }
    [sL, sR, sOp, sAd, sAcc].forEach((e) => { e.style.visibility = ''; });
    bf.style.visibility = showDec ? '' : 'hidden';
    // 做：u 0.55–0.95，加 → 数从第 8/9 格送进运算器；存 → 运算器的数送回第 7 格；回 → 不搬数
    if (r === 4 || u < 0.55) { td.style.visibility = 'hidden'; }
    else {
      const v = clamp((u - 0.55) / 0.4);
      let x, y, sc;
      if (r === 3) { const K = route(7, G.accTape.x, G.accTape.y, 0, 1); [x, y, sc] = routeAt(K, 1 - v); }
      else [x, y, sc] = routeAt(route(r === 1 ? 8 : 9, G.accTape.x, G.accTape.y, 0, 1), v);
      td.style.visibility = ''; td.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    }
  });
  // 第 7 格与运算器在停下后显示最后的结果
  M.setRow(7, tE, bin8(END.total), String(END.total), 'd');
  acK.at(tE, { html: String(END.acc) });
  // 小环上的红圈跟着每一圈的进度走：取（0–0.38）→ 拆（0.38–0.55）→ 做
  stepCursor(M, sched, (tt) => { const c = at(tt); if (!c) return undefined; return c.u < 0.38 ? 0 : c.u < 0.55 ? 1 : 2; });
  // 指针与右上角的读数：每一圈开始时指到第 r 格
  pk.push([tS0, null]); C1.forEach((c) => pcAt(c.t0 + 0.001, c.row)); pk.push([tE, END.row], [tSwap + 0.9, 1]);
  pcTo(M, pk, Q(T('c2')));
  // 音效：慢的几圈每一步一声，快了以后按拍子滴答
  C1.forEach((c) => { if (c.P > 0.3) { sfx('drive', c.t0, { g: 0.35 }); sfx('beep', c.t0 + c.P * 0.38, { g: 0.35, p: -0.4 }); if (c.row !== 4) sfx('tick', c.t0 + c.P * 0.95, { g: 0.4, p: c.row === 3 ? 0.5 : -0.4 }); } });
  // 屏幕从飞转开始就在场：结余跟着第 3 格的「存」一次次更新
  appear(M.screen, tS0); wipe(M.screen, tS0, { dir: 'l', d: 0.4 }); appear(M.screenLab, tS0 + 0.2); drawIn(M.screenLink, tS0, 0.4);
  M.screenAt(tS0, 'calc'); sfx('pop', tS0, { g: 0.5, p: 0.8 });
  const tSpin2 = C1.find((c) => c.P < 0.3).t0;
  const stream = [];
  for (let k = 0; k < 16; k++) { const e = blk(world, '', 0, 0, 40, 18); e.style.background = k % 3 === 1 ? 'var(--blue)' : 'var(--ochre)'; e.dataset.name = '飞过的纸带'; stream.push(e); }
  F((tt) => {
    const on = tt >= tSpin2 && tt < tE - 0.5;
    const u = tt - tSpin2, dist = 400 * u + 700 * u * u;
    stream.forEach((e, k) => {
      if (!on) { e.style.visibility = 'hidden'; return; }
      const dir = k % 2 ? -1 : 1, ph = (dist + k * 41) % 360;
      const x = dir > 0 ? 1100 - ph : 740 + ph, y = G.busY + (dir > 0 ? -18 : 2);
      e.style.visibility = x > 742 && x < 1060 ? '' : 'hidden';
      e.style.transform = `translate(${x.toFixed(0)}px,${y}px)`;
    });
  });
  const counter = h('div', 'sheet', world); px(counter, 470, 24, 980, 104); counter.dataset.name = '圈数';
  const watch = h('div', 'abs', counter); px(watch, 22, 14, 76, 76);
  const ws = svg('svg', { width: 76, height: 76, viewBox: '-38 -38 76 76' }, watch);
  svg('circle', { r: 32, fill: 'none', stroke: C.ink, 'stroke-width': 4 }, ws); svg('path', { d: 'M-6,-40 L6,-40', stroke: C.ink, 'stroke-width': 5 }, ws);
  const hand = svg('path', { d: 'M0,0 L0,-26', stroke: C.red, 'stroke-width': 4 }, ws);
  const wl = txt(counter, 'type', tr('1 秒', '1 S'), 110, 34); wl.style.fontSize = '26px';
  const line = h('div', 'abs', counter); px(line, 190, 14, 760, 76); css(line, { display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '16px' });
  const num = h('span', 'mono', line); css(num, { font: '700 64px "Mono"', letterSpacing: '.02em' }); num.dataset.name = '已转的圈数';
  const unit = h('span', 'ttl', line, tr('圈', 'loops')); css(unit, { fontSize: '52px' });
  hide0(counter); wipe(counter, tSpin, { dir: 't', d: 0.4 }); hide(counter, tE + 0.1, { d: 0.35 });
  const tFull = tSpin + 2.6;                                 // 秒表走完一圈时，计数到几十亿
  let lastN = '';
  F((tt) => {
    const u = clamp((tt - tSpin) / (tFull - tSpin));
    hand.setAttribute('transform', `rotate(${(360 * u).toFixed(1)})`);
    let v = Math.floor(Math.pow(10, 9.6 * Math.pow(u, 1.6))) + 2;
    if (tt > tFull) v += Math.floor((tt - tFull) * 1.3e9);
    const sN = group(v);
    if (sN !== lastN) { num.textContent = sN; lastN = sN; }
  });
  for (let tt = tSpin2; tt < tE - 0.5; tt += BEAT / 2) sfx('tick', tt, { g: 0.32, p: 0.1 });
  sfx('riser', tFull - 1.2, { g: 0.35 });

  // ── 换用途：第 1–4 格整块换成游戏的程序，屏幕跟着换成棋盘 ──
  const band = frameBox(world, 1104, rowY(1) + 2, 532, 4 * ROW.h - 4, 'var(--blue)', 3); band.style.background = 'var(--blue9)'; hide0(band); band.dataset.name = '第1–4格的程序';
  const pName = txt(world, 't-4 blue', '', 1330, 146); const pK = keyed(pName);
  pK.at(tCalc, { html: tr('算账程序', 'Bookkeeping') }).at(tSwap, { html: '' }).at(tSwap + 0.9, { html: tr('游戏程序', 'Game') });
  wipe(band, tCalc, { dir: 't', d: 0.4 }); sfx('pop', tCalc, { g: 0.6, p: 0.4 }); sfx('pop', tSwap + 0.9, { g: 0.6, p: 0.4 });
  // 「装算账的指令」：红框依次扫过第 1–4 格两遍——这四格就是算账的程序
  const sweep = frameBox(world, 1104, 0, 532, ROW.h - 4); sweep.dataset.name = '扫过程序的红框';
  const sk = []; const tsw0 = tCalc + 0.35, step = (tSwap - 0.15 - tsw0) / 8;
  for (let k = 0; k <= 8; k++) { const r = (k % 4) + 1; sk.push([tsw0 + k * step, 1104, rowY(r) + 2, { e: k % 4 === 0 ? (u) => (u < 1 ? 0 : 1) : ease.io3 }]); if (k < 8) sfx('tick', tsw0 + k * step, { g: 0.35, p: 0.5 }); }
  mover(sweep, sk, tSwap - 0.1);
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
const bin8 = (n) => (n & 255).toString(2).padStart(8, '0');
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
