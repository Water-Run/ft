// 第 02 章 · 标记—清扫。主画面：从根出发的一道「燎原」——标记沿指针一拍一层地烧过去，碰到的方块变黑；
// 随后一道金线扫过整片堆，没被碰到的（包括上一章那对 X、Y）一个不留。
// 之后是 1960 年麦卡锡的空闲表与符号位，最后是 Lua 5.5 的二十万张活表：28 MB 砍到 14 MB，活表一张不少。
scene('trace', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const sv = board(world, -300, -300, 9600, 1800);
  bgHeap(sv, -300, -300, 160, 30, 29, 0.14);
  const esv = board(world, -300, -300, 9600, 1800);      // 指针在下，方块在上
  const nsv = board(world, -300, -300, 9600, 1800);
  const plate = { bg: C.field, pad: '0 18px 8px' };

  // ── 一张对象图：活的从根连得到，死的连不到（X、Y 互相指着，也连不到）──
  const r = seeded(77), COLS = 17, ROWS = 11, X0 = 400, Y0 = 170, G = 72, NS = 44;
  const nodes = [], at = {};
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    if (r() > 0.46) continue;
    const n = { i, j, x: X0 + i * G, y: Y0 + j * G, live: r() < 0.64, out: [], d: -1, id: nodes.length };
    nodes.push(n); at[i + ',' + j] = n;
  }
  // 孤岛 X、Y：放在右下，互相指着
  const isl = [[11, 9], [13, 9]].map(([i, j], k) => { let n = at[i + ',' + j]; if (!n) { n = { i, j, x: X0 + i * G, y: Y0 + j * G, out: [], d: -1, id: nodes.length }; nodes.push(n); at[i + ',' + j] = n; } n.live = false; n.name = k ? 'Y' : 'X'; return n; });
  const ROOTS = [260, 420, 580, 740].map((y, k) => ({ x: 230, y, root: true, out: [], d: 0, id: 'r' + k }));
  const near = (n, cand) => cand.filter((m) => m !== n && m.i > n.i && m.i <= n.i + 3 && Math.abs(m.j - n.j) <= 2);
  const live = nodes.filter((n) => n.live).sort((a, b) => a.i - b.i);
  for (const n of live) {                                  // 每个活对象至少有一条从左边来的路
    const from = n.i <= 1 ? ROOTS.filter((q) => Math.abs((q.y - Y0) / G - n.j) <= 3) : live.filter((m) => m.i < n.i && m.i >= n.i - 3 && Math.abs(m.j - n.j) <= 2 && m.d >= 0);
    if (!from.length) { n.live = false; continue; }
    const p = from[(r() * from.length) | 0]; p.out.push(n); n.d = p.d + 1;
  }
  for (const n of nodes) if (n.live && r() < 0.35) { const c = near(n, nodes.filter((m) => m.live)); if (c.length) n.out.push(c[(r() * c.length) | 0]); }
  for (const n of nodes) if (!n.live && !n.name && r() < 0.6) { const c = near(n, nodes); if (c.length) n.out.push(c[(r() * c.length) | 0]); }
  isl[0].out.push(isl[1]); isl[1].out.push(isl[0]);
  // 广度优先：标记到达每个对象的层数（同一层在同一拍上变黑）
  const q = [...ROOTS]; for (const n of nodes) n.d = -1;
  while (q.length) { const u = q.shift(); for (const v of u.out) if (v.d < 0) { v.d = u.d + 1; q.push(v); } }
  const maxD = Math.max(...nodes.map((n) => n.d));

  const tPop = c0 - 0.3, tRoot = qb(T('b1b', '从') - 0.2);
  const tW0 = qn(T('b2', '顺着')), STEP = BEAT / 2;
  const tGar = qb(T('b2b', '垃圾') - 0.1), tSw = qb(T('b2a', '照收') - 0.1), SWD = 1.3;
  const markT = (n) => (n.d < 0 ? Infinity : tW0 + (n.d - 1) * STEP);
  const sweepAt = (x) => tSw + SWD * clamp((x - 300) / 1560);
  // 「这里藏着第一次优雅的妥协」时图还在，镜头往后拉看全貌；说到「以后用不用」前图才收走
  const tPull = qb(T('b3', '这里') - 0.3), tEnd1 = Math.max(tPull + 1.2, qb(T('b3', '以后') - 0.75));
  // 方块
  nodes.forEach((n) => {
    n.c = cell(nsv, n.x, n.y, NS);
    const t0 = tPop + ((n.i * 7 + n.j * 3) % 23) / 23 * 1.6;
    const tm = markT(n), ts = sweepAt(n.x);
    F((t) => {
      if (t < t0 || t > tEnd1 + 0.4) return n.c.set({ k: 0 });
      const k0 = Math.min(1, (t - t0) / 0.12), out = t > tEnd1 + 0.1 ? 1 - (t - tEnd1 - 0.1) / 0.3 : 1;   // 收走：活的一起缩没
      if (t >= tm) return n.c.set({ fill: t < tm + 0.14 ? C.gold : C.ink, k: (t < tm + 0.14 ? 1.15 : 1) * out });
      if (t < tGar) return n.c.set({ fill: C.white, k: k0 });
      if (t < ts) return n.c.set({ st: C.white, sw: 4, k: 1 });
      const u = (t - ts) / 0.22; n.c.set(u < 1 ? { fill: C.gold, k: 1 - u } : { k: 0 });
    });
  });
  // 指针
  const allEdges = [];
  [...ROOTS, ...nodes].forEach((u) => u.out.forEach((v) => allEdges.push([u, v])));
  allEdges.forEach(([u, v]) => {
    const p = ptr(esv, u.x, u.y, v.x, v.y, { w: 3, head: 13, gap1: u.root ? 34 : NS / 2 + 3, gap2: NS / 2 + 5 });
    const t0 = u.root ? tRoot + 0.4 : tPop + 0.8 + ((u.i * 5 + v.j) % 17) / 17 * 1.2;
    const ta = u.root ? tW0 - STEP : markT(u), tb = markT(v);
    const dead = !(v.d >= 0 && (u.root || u.d >= 0)), ts = sweepAt(Math.min(u.x, v.x));
    F((t) => {
      if (t < t0 || t > tEnd1 + 0.15 || (dead && t > ts + 0.1)) return p.set({ f: 0 });
      const trav = t >= ta && t < tb + 0.2 && isFinite(tb);
      const f = trav && t < tb ? Math.min(1, (t - ta) / Math.max(0.05, tb - ta)) : 1;
      p.set({ f: trav ? 1 : Math.min(1, (t - t0) / 0.3), col: trav ? C.gold : dead && t > tGar ? C.pale : C.white, w: trav ? 5 : 3, op: dead && t > tGar ? 0.7 : 1 });
      if (trav && f < 1) p.set({ f: 1, col: C.gold, w: 5 });
    });
  });
  const marked = nodes.filter((n) => n.d >= 0).length;
  for (let d = 1; d <= maxD; d++) sfx('tick', tW0 + (d - 1) * STEP, { g: 0.35 + 0.02 * d, p: -0.6 + 1.2 * d / maxD });
  // 根
  const rootBar = h('div', 'abs', world); px(rootBar, 196, 220, 16, 580); rootBar.style.background = C.white;
  const rootBlocks = ROOTS.map((q_, k) => { const b = h('div', 'abs', world); px(b, 168, q_.y - 22, 72, 44); b.style.background = C.white; appear(b, tRoot + k * 0.08); return b; });
  const rootL = tx(world, 'ser', '根', 150, 80, { size: 110 });
  const rootS = tx(world, 'note', '栈 · 全局变量', 150, 830, { size: 32, color: C.white });
  wipe(rootBar, tRoot - 0.2, { dir: 't', d: 0.5 }); slam(rootL, qb(Math.min(T('b1b', '根'), Tend('b1') - 0.5)), { from: 1.3, d: 0.4 }); appear(rootS, tRoot + 0.3);
  sfx('thud', qb(Math.min(T('b1b', '根'), Tend('b1') - 0.5)), { g: 0.7 });
  for (let k = 0; k < 6; k++) sfx('pop', tPop + k * 0.27, { g: 0.32, p: -0.5 + k * 0.2 });
  // 追踪：在标记开始的那一拍挂上名字
  const trc = tag(ui, '追踪', 1500, 120, 40), trcE = tx(ui, 'lat', 'tracing', 1652, 136, { size: 34, color: C.pale });
  slam(trc, tW0 - 0.1, { from: 1.3, d: 0.35 }); appear(trcE, tW0 + 0.1); sfx('thud', tW0 - 0.1, { g: 0.6 });
  const liveL = tx(ui, 'sub', '摸得到：活', 1520, 720, { size: 48, ...plate }), deadL = tx(ui, 'sub', '摸不到：垃圾', 1520, 800, { size: 48, ...plate });
  wipe(liveL, qb(T('b2', '活着') - 0.3), { dir: 'l', d: 0.35 }); wipe(deadL, tGar, { dir: 'l', d: 0.35 }); sfx('pop', tGar, { g: 0.5, p: 0.4 });
  const nm = isl.map((n) => { const e = tx(world, 'big', n.name, n.x - 14, n.y + 30, { size: 40 }); appear(e, tPop + 1.2); exit(e, sweepAt(n.x) + 0.05, { y: 30, d: 0.2 }); return e; });
  const ring = h('div', 'abs', world); px(ring, isl[0].x - 50, isl[0].y - 50, isl[1].x - isl[0].x + 100, 100); css(ring, { border: `4px dashed ${C.pale}` });
  wipe(ring, qb(T('b2a', '环') - 0.2), { dir: 'l', d: 0.4 }); sfx('tick', qb(T('b2a', '环') - 0.2), { g: 0.5, p: 0.3 }); vanish(ring, tSw + SWD * 0.7);
  // 一道金线扫过整片
  const bar = h('div', 'abs', world); css(bar, { background: C.gold, width: '28px', height: '860px', top: '110px' });
  FR(tSw - 0.1, tSw + SWD + 0.1, (t) => { vis(bar, t >= tSw && t < tSw + SWD); ss(bar, 'left', (300 + 1560 * clamp((t - tSw) / SWD) - 14).toFixed(1) + 'px'); });
  sfx('whoosh', tSw, { g: 0.6 }); sfx('chime', tSw + SWD, { g: 0.5 });
  for (const e of [rootL, rootS, rootBar, ...rootBlocks, liveL, deadL, trc, trcE]) exit(e, tEnd1, { y: -40, d: 0.3 });

  // ── 妙处：以后用不用，算不准；现在能不能找到，当场算清 ──
  const tB3 = qb(T('b3', '以后') - 0.2), tB3b = qb(T('b3b', '现在') - 0.2), tOut3 = qb(T('b4', '一九六零') - 0.5);
  const fL = tx(ui, 'ser', '以后用不用', 120, 260, { size: 100, color: C.pale });
  const fL2 = tx(ui, 'sub', '算不准', 126, 420, { size: 56, color: C.pale });
  const dash = h('div', 'abs', ui); px(dash, 120, 400, 520, 0); css(dash, { borderTop: `5px dashed ${C.pale}` });
  wipe(fL, tB3, { dir: 'l', d: 0.45 }); wipe(dash, tB3 + 0.3, { dir: 'l', d: 0.4 }); appear(fL2, qb(T('b3b', '算不准') - 0.2));
  const w3 = wonder(ui, '现在能不能找到', 960, 260, tB3b, null, { size: 100, h: 240 });
  const w3b = tx(ui, 'ser', '当场算清', 1008, 384, { size: 100, color: C.gold });
  slam(w3b, qb(T('b3b', '当场') - 0.1), { from: 1.25, d: 0.4 }); sfx('thud', qb(T('b3b', '当场') - 0.1), { g: 0.6 });
  for (const e of [fL, fL2, dash, w3.rule, w3.tt, w3b]) exit(e, tOut3, { y: -60, d: 0.3 });
  sfx('pop', tB3, { g: 0.4 });

  // ── 1960：空闲表、FREE、符号位 ──
  const T2 = 2600;                                        // 这一站的原点（world x）
  const yr = tx(world, 'big', '1960', T2 + 120, 120, { size: 190 });
  const who = tx(world, 'sub', '麦卡锡 · LISP', T2 + 720, 150, { size: 52 });
  const ref = tx(world, 'src', 'McCarthy, CACM 3(4), April 1960', T2 + 724, 230);
  const t60 = qb(T('b4', '一九六零') - 0.1);
  slam(yr, t60, { from: 1.25, d: 0.45 }); wipe(who, t60 + 0.3, { dir: 'l', d: 0.4 }); appear(ref, t60 + 0.5); sfx('thud', t60, { g: 0.9 }); sfx('beep', t60 + 0.5, { g: 0.4 });
  // 一排存储单元（论文里叫 registers）：下排是空闲表，程序要用就从表头取走，挪到上排
  const NC = 12, CW = 112, LX = T2 + 200, UY = 380, FY = 640;
  const cells = [];
  for (let k = 0; k < NC; k++) {
    const x = LX + k * (CW + 18);
    const b = h('div', 'abs', world); px(b, x, FY, CW, 90); b.style.background = C.white;
    const sg = tx(world, 'mono', '+', x + 8, FY + 14, { size: 44, color: C.ink });
    cells.push({ b, sg, x, k, used: true, live: [0, 1, 2, 4, 5, 7].includes(k) });
  }
  const free = wtag(world, 'FREE', LX - 200, FY + 22, 34);
  const freeL = tx(world, 'mono', 'free-storage list', LX, FY + 116, { size: 28, color: C.pale });
  const tBackF = qb(T('b5b', '放回') - 0.1) + 0.4;
  const tFree0 = qb(T('b4', '平时') - 0.2), tFull = qb(T('b4b', '用光') - 0.2), tStop = qb(T('b4b', '停下') - 0.1);
  cells.forEach((c, k) => { appear(c.b, tFree0 - 0.6 + k * 0.03); appear(c.sg, tFree0 - 0.6 + k * 0.03); });
  appear(free, tFree0 - 0.5); appear(freeL, tFree0 - 0.4); sfx('pop', tFree0 - 0.6, { g: 0.45 });
  const takeT = cells.map((c, k) => tFree0 + 0.2 + (tFull - tFree0 - 0.2) * k / (NC - 1));
  cells.forEach((c, k) => {
    tl.fromTo(c.b, { y: 0 }, { y: UY - FY, duration: 0.28, ease: 'back.out(1.6)', immediateRender: false }, takeT[k]);
    tl.fromTo(c.sg, { y: 0 }, { y: UY - FY, duration: 0.28, ease: 'back.out(1.6)', immediateRender: false }, takeT[k]);
    if (k % 2 === 0) sfx('drive', takeT[k], { g: 0.25, p: -0.5 + k / NC });
  });
  F((t) => { let n = 0; while (n < NC && takeT[n] <= t) n++; const back = t >= tBackF; ss(free, 'left', (back ? LX + 3 * (CW + 18) - 200 : n < NC ? LX + n * (CW + 18) - 200 : LX + NC * (CW + 18) - 200) + 'px'); });
  const empty = tx(world, 'sub', '用光了', LX + 1180, FY + 116, { size: 52, color: C.gold });
  slam(empty, tFull, { from: 1.3, d: 0.35 }); sfx('error', tFull, { g: 0.4 });
  const stop = tx(world, 'ser', '停', T2 + 1560, 120, { size: 180, color: C.gold });
  slam(stop, tStop, { from: 1.4, d: 0.4 }); sfx('thud', tStop, { g: 0.9 });
  // 先顺着根走：摸到的单元符号拨成负（−）；再扫一遍：没拨过的放回空闲表，拨过的拨回正
  const tMk = qb(T('b5', '顺着') - 0.1), tSg = qb(Math.min(T('b5', '符号位'), Tend('b5') - 0.8)), tSw2 = qb(T('b5b', '扫一遍') - 0.1), tBack = qb(T('b5b', '放回') - 0.1);
  const base = wtag(world, 'base registers', T2 + 900, UY - 84, 30); slide(base, tMk - 0.3, { x: -40, d: 0.3 });
  const liveCells = cells.filter((c) => c.live), deadCells = cells.filter((c) => !c.live && c.used);
  liveCells.forEach((c, k) => {
    const t = tSg + k * STEP;
    keyed(c.sg).at(t, { html: '−' }).at(tSw2 + 0.12 * c.k + 0.1, { html: '+' });
    pulse(c.sg, t, 1.5); sfx('tick', t, { g: 0.45 });
    // 拨成负 = 标记过：与 02 章的图一样涂黑（黑 = 从根摸得到），清扫经过时拨回正、恢复白
    F((tt) => { const mk = tt >= t && tt < tSw2 + 0.12 * c.k + 0.1; ss(c.b, 'background', mk ? C.ink : C.white); ss(c.sg, 'color', mk ? C.white : C.ink); });
  });
  const sgL = tag(world, '符号位', LX, UY + 108, 36); slam(sgL, tSg - 0.2, { from: 1.3, d: 0.3 });
  const sweep2 = h('div', 'abs', world); css(sweep2, { background: C.gold, width: '18px', height: '420px', top: UY - 30 + 'px' });
  FR(tSw2 - 0.1, tSw2 + 0.12 * NC + 0.2, (t) => { vis(sweep2, t >= tSw2 && t < tSw2 + 0.12 * NC); ss(sweep2, 'left', (LX - 10 + (t - tSw2) / 0.12 * (CW + 18)).toFixed(1) + 'px'); });
  sfx('whoosh', tSw2, { g: 0.45 });
  deadCells.forEach((c) => {
    const t = Math.max(tBack, tSw2 + 0.12 * c.k + 0.05);
    tl.fromTo(c.b, { y: UY - FY }, { y: 0, duration: 0.35, ease: 'back.out(1.5)', immediateRender: false }, t);
    tl.fromTo(c.sg, { y: UY - FY }, { y: 0, duration: 0.35, ease: 'back.out(1.5)', immediateRender: false }, t);
    F((tt) => { if (tt >= t && tt < t + 0.3) ss(c.b, 'outline', `6px solid ${C.gold}`); else ss(c.b, 'outline', 'none'); });
    sfx('pop', t, { g: 0.4 });
  });
  // 当年的机器：这一停就是好几秒
  const tFrz = qb(T('b6', '当年') - 0.2);
  for (const e of [...cells.flatMap((c) => [c.b, c.sg]), free, freeL, empty, base, sgL]) exit(e, tFrz - 0.1, { y: 40, d: 0.3 });
  const pap = paper(world, LX, 400, 820, '<div class="pq" style="font-size:34px;line-height:1.4">… <span class="mk">requires several seconds to execute</span> …</div><div style="font-family:\'Sans SC\';font-weight:500;font-size:30px;margin-top:22px">（译）需要好几秒才能执行</div><div class="pm" style="font-size:24px;margin-top:22px">McCarthy 1960</div>');
  wipe(pap, tFrz, { dir: 't', d: 0.5 }); sfx('drive', tFrz, { g: 0.4 }); sfx('beep', tFrz + 0.6, { g: 0.35 });
  const secs = tx(world, 'ser', '好几秒', LX + 900, 470, { size: 130, color: C.gold });
  slam(secs, qb(T('b6', '好几秒') - 0.1), { from: 1.25, d: 0.4 }); sfx('thud', qb(T('b6', '好几秒') - 0.1), { g: 0.7 });
  const t7 = qb(T('b7', '今天') - 0.35);
  // ── 标记—清扫：两个动作 ──
  const T3 = 5200;
  const mN = tx(world, 'ser', '标记—清扫', T3, 160, { size: 170 });
  const mE = tx(world, 'lat', 'mark-and-sweep', T3 + 8, 380, { size: 44, color: C.pale });
  slam(mN, qb(T('b7', '标记') - 0.1), { from: 1.2, d: 0.45 }); wipe(mE, qb(T('b7', '标记') + 0.3), { dir: 'l', d: 0.4 }); sfx('thud', qb(T('b7', '标记') - 0.1), { g: 0.9 });
  const rowN = 14, rx0 = T3 + 10, ry = 560, mm = [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0];
  const tMark3 = qb(T('b7b', '标记') - 0.1), tSw3 = qb(T('b7b', '清扫') - 0.1);
  const row = mm.map((v, k) => cell(nsv, rx0 + k * 84 + 30, ry + 30, 64));
  const lbM = tag(world, '标记', rx0, ry - 90, 34), lbS = tag(world, '清扫', rx0 + 300, ry + 110, 34);
  F((t) => row.forEach((c, k) => {
    const tin = t7 + 0.2 + k * 0.05, tm = tMark3 + k * BEAT / 4, ts = tSw3 + k * 0.1;
    if (t < tin) return c.set({ k: 0 });
    if (mm[k] && t >= tm) return c.set({ fill: t < tm + 0.12 ? C.gold : C.ink, k: 1 });
    if (!mm[k] && t >= ts) { const u = (t - ts) / 0.2; return c.set(u < 1 ? { fill: C.gold, k: 1 - u } : { k: 0 }); }
    c.set({ fill: C.white, k: Math.min(1, (t - tin) / 0.12) });
  }));
  const sweep3 = h('div', 'abs', world); css(sweep3, { background: C.gold, width: '12px', height: '120px', top: ry - 30 + 'px' });
  FR(tSw3 - 0.1, tSw3 + 1.6, (t) => { vis(sweep3, t >= tSw3 && t < tSw3 + 1.4); ss(sweep3, 'left', (rx0 + (t - tSw3) / 0.1 * 84 - 6).toFixed(1) + 'px'); });
  slide(lbM, tMark3 - 0.1, { y: 20, d: 0.3 }); slide(lbS, tSw3 - 0.1, { y: -20, d: 0.3 });
  sfx('tick', tMark3, { g: 0.4 }); sfx('whoosh', tSw3, { g: 0.4 });
  const every = tx(world, 'note', '清扫要把每个对象都过一遍', rx0, ry + 200, { size: 34, color: C.white });
  appear(every, tSw3 + 0.6);
  const t8 = qb(T('b8', 'Lua') - 0.4);

  // ── Lua：二十万张活表 + 二十万张废表；一轮下来 28 MB 砍到 14 MB ──
  const T4 = 7000, GX = T4, GY = 120, GN = 20, GP = 30;
  const lsv = board(world, GX - 10, GY - 10, GN * GP + 20, GN * GP + 20);
  const lt = [];
  for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) lt.push({ c: cell(lsv, GX + i * GP + GP / 2, GY + j * GP + GP / 2, 24), live: (i + j) % 2 === 0, i, j });
  const tL0 = qb(T('b8b', '造出') - 0.1), tL1 = qb(T('b8b', '废表') - 0.1), tLs = qb(T('b9', '一轮') - 0.05), LSD = 2.6;
  const lsweepAt = (k) => tLs + LSD * (k / (GN * GN));
  F((t) => lt.forEach((o, k) => {
    const tin = (o.live ? tL0 : tL1) + (k % 40) * 0.012 + ((k / 40) | 0) * 0.02;
    if (t < tin) return o.c.set({ k: 0 });
    const ts = lsweepAt(o.j * GN + o.i);
    if (!o.live && t >= ts) { const u = (t - ts) / 0.15; return o.c.set(u < 1 ? { fill: C.gold, k: 1 - u } : { k: 0 }); }
    o.c.set({ fill: o.live ? C.ink : C.white, k: Math.min(1, (t - tin) / 0.1) });
  }));
  const lsw = h('div', 'abs', world); css(lsw, { background: C.gold, height: '8px', width: GN * GP + 40 + 'px', left: GX - 20 + 'px' });
  FR(tLs - 0.1, tLs + LSD + 0.2, (t) => { vis(lsw, t >= tLs && t < tLs + LSD); ss(lsw, 'top', (GY + GN * GP * clamp((t - tLs) / LSD) - 4).toFixed(1) + 'px'); });
  const luaL = tx(world, 'lat', 'Lua 5.5.0', GX + GN * GP + 60, 300, { size: 48 });
  const lab1 = tx(world, 'sub', '二十万张活表', GX + GN * GP + 60, GY + 20, { size: 46 }), lab2 = tx(world, 'sub', '二十万张废表', GX + GN * GP + 60, GY + 100, { size: 46, color: C.pale });
  const k1 = h('div', 'abs', world); px(k1, GX + GN * GP + 60, GY + 38, 0, 0);
  appear(luaL, t8); wipe(lab1, qb(Math.min(T('b8b', '活表'), Tend('b8') - 0.5)), { dir: 'l', d: 0.35 }); wipe(lab2, qb(Math.min(T('b8b', '废表'), Tend('b8') - 0.3)), { dir: 'l', d: 0.35 });
  sfx('pop', tL0, { g: 0.5 }); sfx('pop', tL1, { g: 0.5 }); sfx('whoosh', tLs, { g: 0.5 });
  // 内存柱：28 MB → 14 MB（断崖跟着金线走）
  const MX = GX + GN * GP + 60, MY = 420, MH = 300;
  const mBar = h('div', 'abs', world); px(mBar, MX, MY, 120, MH); mBar.style.background = C.white;
  const mTxt = tx(world, 'big', '28 MB', MX + 150, MY - 6, { size: 96 });
  const mTxt2 = tx(world, 'big', '14 MB', MX + 150, MY + MH / 2 - 6, { size: 96, color: C.gold });
  wipe(mBar, qb(Tend('b8b') - 0.3), { dir: 'b', d: 0.5 }); slam(mTxt, qb(Tend('b8b') - 0.2), { from: 1.2, d: 0.35 });
  tl.fromTo(mBar, { height: MH, top: MY }, { height: MH / 2, top: MY + MH / 2, duration: 0.5, ease: 'power3.in', immediateRender: false }, tLs + LSD - 0.5);
  slam(mTxt2, tLs + LSD - 0.1, { from: 1.3, d: 0.4 }); sfx('thud', tLs + LSD, { g: 0.9 });
  F((t) => ss(mTxt, 'color', t >= tLs + LSD ? C.pale : C.white));
  const lslab = slab(ui, 120, 790, ['before: 28457 KB (200000 live + 200000 unreachable tables)', 'cycle finished after 419 basic steps: <span class="k">14239 KB</span>', 'live[1][1] =\t1\t <span class="g">#live =\t200000</span>'], { size: 26 });
  wipe(lslab.el, tL0 + 0.6, { dir: 'l', d: 0.35 }); appear(lslab.ln[1], tLs + LSD); appear(lslab.ln[2], qb(T('b9b', '活表') - 0.1)); sfx('blip', tLs + LSD, { g: 0.4 }); sfx('chime', qb(T('b9b', '活表')), { g: 0.6 });
  const keep = tag(world, '活表一张没少', MX + 150, MY + MH / 2 + 110, 40); slam(keep, qb(T('b9b', '活表') - 0.05), { from: 1.25, d: 0.35 });

  // ── 镜头 ──
  const tG = tPull - 0.2;
  cam.track(s.start, { x: 1000, y: 520, z: 0.8 }, [
    [s.start + 0.5, { z: 0.88 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { z: 0.9 }, tW0 - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tW0, { x: 1010, z: 0.92 }, tSw - 1.2 - tW0, { ease: 'none', sfx: false }],
    [tSw - 1.1, { x: isl[0].x + 70, y: isl[0].y - 40, z: 1.45 }, 0.9, { ease: 'power3.inOut', g: 0.3 }],
    [tSw - 0.05, { x: 1010, y: 520, z: 0.92 }, 0.8, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.94 }, tG - (tSw + 0.9) - 0.05, { ease: 'none', sfx: false }],
    [tPull, { y: 560, z: 0.8 }, tEnd1 - tPull + 0.2, { ease: 'power2.inOut', sfx: false }],
    [tOut3 - 0.2, { x: T2 + 960, y: 520, z: 1.0 }, 1.2, { ease: 'power3.inOut', g: 0.5 }],
    [null, { x: T2 + 990, z: 1.02 }, t7 - 0.2 - (tOut3 + 1.15), { ease: 'none', sfx: false }],
    [t7 - 0.2, { x: T3 + 760, y: 520, z: 1.0 }, 1.1, { ease: 'power3.inOut', g: 0.5 }],
    [null, { z: 1.04 }, t8 - (t7 + 1.05) - 0.05, { ease: 'none', sfx: false }],
    [t8, { x: T4 + 700, y: 500, z: 1.0 }, 1.1, { ease: 'power3.inOut', g: 0.5 }],
    [null, { z: 1.04 }, s.end - (t8 + 1.25), { ease: 'none', sfx: false }],
  ]);
});
