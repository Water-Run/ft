// 第 04 章 · 三色与写屏障。主画面：一张对象图被三种颜色一层层「涂」过去；
// 然后是全片的戏剧核心——黑牵上白、灰松了手，白的被冤杀；倒带，家规落下，写屏障在指针写下的那一刻把白的涂灰。
// 之后：Lua 源码里的铁律与后退屏障、四十万张表的 419 步、Java G1 的后台标记、.NET 一行赋值背后的四条指令。
scene('tri', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const sv = board(world, -400, -300, 16400, 1700);
  bgHeap(sv, -400, -300, 273, 28, 53, 0.1);
  const esv = board(world, -400, -300, 16400, 1700), nsv = board(world, -400, -300, 16400, 1700);
  const plate = { bg: C.field, pad: '0 18px 8px' };
  const COLOR = { W: C.white, G: C.gray, B: C.ink };

  // ════ S1：1978，别停程序 ════
  const tE2 = qb(T('e2', { zh: '如果', en: 'what if' }) - 0.2), t78 = qb(T('e2b', { zh: '一九七八', en: '1978' }) - 0.1), tSame = qb(T('e2c', { zh: '同时跑', en: 'same time' }) - 0.4);
  // 老区也满了：一块全黑的堆
  const fullT = [];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 20; i++) fullT.push(cell(nsv, 200 + i * 60, 240 + j * 60, 48));
  F((t) => fullT.forEach((c, k) => { const tin = c0 - 0.3 + ((k * 37) % 160) / 160 * 1.0; if (t < tin || t > t78 + 0.6) return c.set({ k: 0 }); c.set({ fill: C.ink, k: Math.min(1, (t - tin) / 0.1) }); }));
  const full = tx(ui, 'ser', tr('老区也满了', 'The old area is full too'), 120, 760, { size: tr(96, 80), ...plate }); wipe(full, tE2, { dir: 'l', d: 0.4 }); exit(full, t78 + 0.9, { y: 60, d: 0.3 });
  sfx('pop', c0 - 0.3, { g: 0.5 }); sfx('thud', tE2 + 0.3, { g: 0.5 });
  const y78 = tx(ui, 'big', '1978', 110, 120, { size: 190, ...plate });
  slam(y78, t78, { from: 1.2, d: 0.45 }); sfx('thud', t78, { g: 0.9 });
  const pap78 = paper(ui, 900, 140, 880, '<div class="pt" style="font-size:42px;line-height:1.22">On-the-fly garbage collection: an exercise in cooperation</div><div class="pq" style="font-size:26px;margin-top:20px">Edsger W. Dijkstra, Leslie Lamport, A. J. Martin, C. S. Scholten, E. F. M. Steffens</div><div class="pm" style="font-size:22px;margin-top:10px">Communications of the ACM 21(11), November 1978</div>');
  slide(pap78, t78 + 0.3, { x: 120, d: 0.45 }); sfx('pop', t78 + 0.3, { g: 0.5 });
  const dj = tx(ui, 'sub', tr('迪杰斯特拉等', 'Dijkstra et al.'), 124, 340, { size: 56, ...plate }); wipe(dj, t78 + 0.4, { dir: 'l', d: 0.35 });
  // 两条跑道：程序（the mutator）与收集器（the collector）同时在跑
  const LX = 260, LW = 1500, lane = (y, lab, en, col) => {
    const bg = h('div', 'abs', ui); px(bg, LX, y, LW, 64); css(bg, { border: `3px solid ${col}` });
    const l1 = tx(ui, 'sub', lab, tr(120, 64), y + tr(4, 12), { size: tr(44, 32), color: col });
    const l2 = tx(ui, 'mono', en, LX + LW - 260, y - 40, { size: 26, color: C.pale });
    return [bg, l1, l2];
  };
  const L1 = lane(560, tr('程序', 'program'), 'the mutator', C.white), L2 = lane(700, tr('收集器', 'collector'), 'the collector', C.gold);
  [...L1, ...L2].forEach((e, k) => wipe(e, tSame - 0.6 + (k % 3) * 0.08 + (k > 2 ? 0.2 : 0), { dir: 'l', d: 0.4 }));
  sfx('whoosh', tSame - 0.6, { g: 0.35 }); sfx('thud', qb(T('e2c', { zh: '别停', en: "don't stop" }) - 0.1), { g: 0.45 });
  // 两条跑道上的「工作」：一块块往前走，互不等待
  const blk = [];
  for (let k = 0; k < 2; k++) for (let m = 0; m < 9; m++) { const b = h('div', 'abs', ui); px(b, 0, (k ? 700 : 560) + 12, k ? 90 : 130, 40); b.style.background = k ? C.gold : C.white; blk.push({ b, k, m }); }
  const tLanes = tSame - 0.3, tLanesEnd = qb(T('e3', { zh: '想在', en: 'To keep' }) - 0.3);
  F((t) => blk.forEach(({ b, k, m }) => {
    const sp = k ? 410 : 330, x = LX + 20 + ((t - tLanes) * sp + m * (k ? 170 : 175)) % (LW - 150);
    vis(b, t >= tLanes + m * 0.05 && t < tLanesEnd); ss(b, 'left', x.toFixed(1) + 'px');
  }));
  sfx('tick', tLanes, { g: 0.4, p: -0.3 }); sfx('tick', tLanes + 0.2, { g: 0.4, p: 0.3 });
  const both = tx(ui, 'ser', tr('别停程序', "Don't stop the program"), 120, 830, { size: 80, ...plate }); wipe(both, qb(T('e2c', { zh: '别停', en: "don't stop" }) - 0.1), { dir: 'l', d: 0.4 });
  for (const e of [y78, pap78, dj, both, ...L1, ...L2]) exit(e, tLanesEnd, { y: -50, d: 0.3 });

  // ════ S2：三色标记 ════
  const X2 = 2400, N2 = {
    1: [560, 260], 2: [560, 590], 3: [800, 160], 4: [800, 380], 5: [800, 650], 6: [1040, 260], 7: [1040, 480], 8: [1040, 700],
    9: [1280, 160], 10: [1280, 380], 11: [1280, 650], 12: [1520, 510],
  };
  const E2 = [['R', 1], ['R', 2], [1, 3], [1, 4], [2, 5], [4, 6], [4, 7], [5, 8], [6, 9], [7, 10], [11, 12], [12, 10]];
  const NS2 = 90, nd = {};
  for (const id in N2) { const [x, y] = N2[id]; nd[id] = { id: +id, x: X2 + x, y, c: cell(nsv, X2 + x, y, NS2) }; }
  nd.R = { id: 'R', x: X2 + 330, y: 425, root: true };
  const rootB = h('div', 'abs', world); px(rootB, X2 + 300, 230, 24, 390); rootB.style.background = C.white;
  const rootL = tx(world, 'ser', tr('根', 'roots'), X2 + tr(268, 250), 640, { size: tr(72, 52) });
  // 第一遍（e5–e6）：按迪杰斯特拉的做法一步一步涂；第二遍（e11b）：同样的图快放，程序一边改指针、写屏障一边拦
  const tE3 = qb(T('e3', { zh: '想在', en: 'To keep' }) - 0.35), tE4w = qb(T('e4', { zh: '白', en: 'White' }) - 0.1), tE4g = qb(T('e4', { zh: '灰', en: 'Gray' }) - 0.1), tE4b = qb(Math.min(T('e4b', { zh: '黑', en: 'Black' }), Tend('e4') - 0.5));
  const tPick1 = qb(T('e5', { zh: '收集器', en: 'collector' }) - 0.1), tShade1 = qb(T('e5b', { zh: '涂灰', en: 'gray' }) - 0.2), tBlack1 = qb(T('e5b', { zh: '升为黑', en: 'turns black' }) - 0.1);
  const order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const kids = { 1: [3, 4], 2: [5], 3: [], 4: [6, 7], 5: [8], 6: [9], 7: [10], 8: [], 9: [], 10: [] };
  const tRun = qb(T('e6', { zh: '等到', en: 'When' }) - 0.1), tGarb = qb(T('e6', { zh: '就是垃圾', en: 'is garbage' }) - 0.2);
  const steps1 = [{ id: 1, pick: tPick1, shade: tShade1, black: tBlack1 }];
  order.slice(1).forEach((id, k) => { const t0 = tRun + k * BEAT / 2; steps1.push({ id, pick: t0, shade: t0 + 0.08, black: t0 + 0.2 }); });
  const tFast = qb(T('e11b', { zh: '高速', en: 'full speed' }) + 0.1), FQ = BEAT / 4;
  const steps2 = order.map((id, k) => ({ id, pick: tFast + 0.2 + k * FQ, shade: tFast + 0.2 + k * FQ + 0.03, black: tFast + 0.2 + k * FQ + 0.1 }));
  const bars2 = [[1, 8, 0], [3, 10, 2], [4, 9, 3]];           // 快放时程序写下的三条指针：[黑, 还是白的活对象, 在第几步之后]
  const tEnd2 = qb(T('e7', { zh: '可惊险', en: 'thrill' }) - 0.3), tMont1 = Tend('e11b') + 1.1;
  const colorAt = (id, t, steps, t0) => {                      // 某一时刻某个节点的颜色（从 t0 开始的一遍）
    if (t < t0) return null;
    let col = 'W';
    if (id === 1 || id === 2) col = 'G';
    for (const st of steps) {
      if (t >= st.black && st.id === id) col = 'B';
      if (t >= st.shade && kids[st.id].includes(id) && col === 'W') col = 'G';
    }
    return col;
  };
  const tPw = qb(T('e4', { zh: '白', en: 'White' }) + 0.1), tPg = qb(T('e4', { zh: '灰', en: 'Gray' }) + 0.1), tPk = qb(T('e4', { zh: '碰过', en: 'touched, its' }) + 0.2);
  const bump = (t, t0) => (t >= t0 && t < t0 + 0.32 ? 1 + 0.35 * Math.sin(Math.PI * (t - t0) / 0.32) : 1);
  F((t) => {
    for (const id in N2) {
      const n = nd[id]; let col = null, ring = false;
      const tin = tE3 + (n.x - X2) / 1520 * 0.6;
      if (t >= tin && t < tEnd2) {
        col = t < tE4g ? 'W' : colorAt(+id, t, steps1, tE4g);
        if (t >= tGarb && col === 'W') { n.c.set({ st: C.white, sw: 5, k: 1 }); continue; }
        ring = steps1.some((st) => st.id === +id && t >= st.pick && t < st.black);
      } else if (t >= tFast && t < tMont1) {
        col = colorAt(+id, t, steps2, tFast);
        for (const [b, w, after] of bars2) if (+id === w && t >= steps2[after].black + 0.04) col = col === 'W' ? 'G' : col;
        ring = steps2.some((st) => st.id === +id && t >= st.pick && t < st.black);
        if (t >= steps2[9].black + 0.15 && col === 'W') { n.c.set({ st: C.white, sw: 5, k: 1 }); continue; }
      } else { n.c.set({ k: 0 }); continue; }
      const kb = t < tEnd2 ? (col === 'W' ? bump(t, tPw) : 1) * (col === 'G' ? bump(t, tPg) : 1) * ([3, 4, 5].includes(+id) ? bump(t, tPk) : 1) : 1;
      n.c.set({ fill: ring ? C.gold : COLOR[col], k: (ring ? 1.12 : Math.min(1, (t - tin) / 0.15)) * kb });
    }
  });
  const e2p = E2.map(([a, b]) => { const A = nd[a], Bn = nd[b]; return { a, b, p: ptr(esv, A.x, A.y, Bn.x, Bn.y, { w: 4, head: 16, gap1: A.root ? 18 : NS2 / 2 + 4, gap2: NS2 / 2 + 6 }) }; });
  F((t) => e2p.forEach(({ a, b, p }) => {
    const on1 = t >= tE3 + 0.3 && t < tEnd2, on2 = t >= tFast && t < tMont1;
    if (!on1 && !on2) return p.set({ f: 0 });
    const steps = on1 ? steps1 : steps2, hot = steps.some((st) => st.id === a && t >= st.pick && t < st.black + 0.05) || (a === 'R' && t >= (on1 ? tE4g - 0.2 : tFast) && t < (on1 ? tE4g + 0.2 : tFast + 0.2));
    p.set({ f: on1 ? Math.min(1, (t - tE3 - 0.3) / 0.4) : 1, col: hot ? C.gold : C.white, w: hot ? 6 : 4 });
  }));
  // 快放时程序写下的指针（黑 → 白）与写屏障的拦截
  const barPtrs = bars2.map(([b, w, after]) => {
    const A = nd[b], W = nd[w], p = ptr(esv, A.x, A.y, W.x, W.y, { w: 6, head: 20, gap1: NS2 / 2 + 4, gap2: NS2 / 2 + 6 });
    const tw = steps2[after].black + 0.02;
    F((t) => p.set(t >= tw && t < tMont1 ? { f: Math.min(1, (t - tw) / 0.08), col: t < tw + 0.18 ? C.gold : C.white } : { f: 0 }));
    sfx('tick', tw, { g: 0.5 });
    return p;
  });
  appear(rootB, tE3); appear(rootL, tE3); exit(rootB, tEnd2, { y: 40, d: 0.3 }); exit(rootL, tEnd2, { y: 40, d: 0.3 });
  F((t) => { const on = (t >= tE3 && t < tEnd2) || (t >= tFast && t < tMont1); ss(rootB, 'visibility', on ? 'visible' : 'hidden'); ss(rootL, 'visibility', on ? 'visible' : 'hidden'); });
  steps1.forEach((st, k) => { sfx(k ? 'tick' : 'pop', st.pick, { g: k ? 0.35 : 0.6 }); });
  sfx('blip', tShade1, { g: 0.5 }); sfx('thud', tBlack1, { g: 0.55 });
  steps2.forEach((st) => sfx('tick', st.pick, { g: 0.22 }));
  sfx('whoosh', tFast - 0.1, { g: 0.35 }); sfx('chime', steps2[9].black + 0.2, { g: 0.55 });
  // 名字与图例
  const tri = tx(ui, 'ser', tr('三色标记', 'Tri-color<br>marking'), 110, 120, { size: tr(120, 92), lh: 1.08, ...plate });
  const triE = tx(ui, 'lat', tr('tri-color marking', ''), 124, 280, { size: 40, color: C.pale, ...plate });
  slam(tri, qb(Math.min(T('e3b', { zh: '三色标记', en: 'tri-color marking' }), Tend('e3') - 0.5)), { from: 1.2, d: 0.45 }); wipe(triE, qb(Math.min(T('e3b', { zh: '三色标记', en: 'tri-color marking' }), Tend('e3') - 0.5)) + 0.3, { dir: 'l', d: 0.35 });
  sfx('thud', qb(Math.min(T('e3b', { zh: '三色标记', en: 'tri-color marking' }), Tend('e3') - 0.5)), { g: 0.85 });
  const LG = [['W', tr('白', 'White'), tr('还没碰', 'not touched'), tE4w], ['G', tr('灰', 'Gray'), tr('碰过，下线还没碰', 'touched, links not yet'), tE4g], ['B', tr('黑', 'Black'), tr('自己和下线全碰完', 'it and its links done'), tE4b]];
  const lgEls = LG.map(([c, n, d, t], k) => {
    const x = 120 + k * 590;
    const sq = h('div', 'abs', ui); px(sq, x, 836, 64, 64); css(sq, { background: COLOR[c], outline: c === 'B' ? `3px solid ${C.white}` : 'none' });
    const nm = tx(ui, 'ser', n, x + 82, tr(826, 840), { size: tr(64, 40) }), ds = tx(ui, 'note', d, x + tr(160, 210), 846, { size: tr(32, 28), color: C.white, ...plate });
    slam(sq, t, { from: 1.4, d: 0.35 }); appear(nm, t + 0.05); wipe(ds, t + 0.1, { dir: 'l', d: 0.35 }); sfx('pop', t, { g: 0.55 });
    return [sq, nm, ds];
  }).flat();
  sfx('tick', qb(T('e4b', { zh: '绝对安全', en: 'Completely safe' }) - 0.1), { g: 0.4 });
  const garb = tx(ui, 'ser', tr('剩下的白：垃圾', 'White left over: garbage'), tr(1180, 960), 120, { size: tr(72, 64), ...plate }); wipe(garb, tGarb, { dir: 'l', d: 0.4 }); sfx('thud', tGarb, { g: 0.6 });
  for (const e of [tri, triE, ...lgEls, garb]) exit(e, tEnd2, { y: -40, d: 0.3 });

  // ════ S3：冤杀，家规，写屏障 ════
  const X3 = 4800, NS3 = 150;
  const nB = { x: X3 + 1100, y: 330 }, nG = { x: X3 + 1100, y: 760 }, nW = { x: X3 + 1620, y: 545 }, nR = { x: X3 + 840, y: 545 };
  const cB = cell(nsv, nB.x, nB.y, NS3), cG = cell(nsv, nG.x, nG.y, NS3), cW = cell(nsv, nW.x, nW.y, NS3);
  const rootB3 = h('div', 'abs', world); px(rootB3, nR.x - 12, 300, 24, 490); rootB3.style.background = C.white;
  const tS3 = tEnd2 + 0.1;
  const tMut = qb(T('e7', { zh: '程序', en: 'program' }) - 0.1);                     // 程序在改指针（提示）
  const tBW = qb(T('e7a', { zh: '牵上', en: 'grabs' }) - 0.15), tGlet = qb(T('e7ab', { zh: '松了手', en: 'lets go' }) - 0.2), tFin = qb(T('e7ac', { zh: '活对象', en: 'live object' }) - 0.1), tKill = qb(T('e7ac', { zh: '冤杀', en: 'wrongly killed' }) - 0.15);
  const tRew = qb(T('e8', { zh: '怎么破局', en: 'way out' }) - 0.1), tRule = qb(T('e8', { zh: '家规', en: 'house rule' }) - 0.2);
  const tBW2 = qb(T('e9', { zh: '改', en: 'changes' }) - 0.1), tGate = qb(T('e9b', { zh: '强行', en: 'forcibly' }) - 0.15), tGlet2 = tGate + 0.9, tPickW = qb(T('e10', { zh: '这段', en: 'This' }) + 0.2);
  const tWB = qb(Tend('e10') - 0.6), tE11 = qb(T('e11', { zh: '三种', en: 'Three colors' }) - 0.25);
  const REW = 0.9;
  // 「一旦违规」：黑刚指上白，到写屏障拦下之前，那个白对象和这根违规的指针一拍一跳——危险还在
  const tVio = qb(T('e9', { zh: '违规', en: 'breaks' }) - 0.1), throb = (t) => (t >= tVio && t < tGate ? Math.max(0, 1 - (((t - tVio) / BEAT) % 1) / 0.35) : 0);
  // 节点颜色：两遍（冤杀一遍；倒带后，写屏障那一遍）
  F((t) => {
    if (t < tS3 || t >= tE11) { cB.set({ k: 0 }); cG.set({ k: 0 }); cW.set({ k: 0 }); return; }
    const kin = Math.min(1, (t - tS3) / 0.2), kinG = clamp((t - tS3 - BEAT) / 0.2), kinW = clamp((t - tS3 - 2 * BEAT) / 0.2);
    const pass2 = t >= tRew + REW;
    cB.set({ fill: C.ink, k: kin });
    if (!pass2) {
      cG.set({ fill: t >= tFin + 0.35 ? C.ink : t >= tFin ? C.gold : C.gray, k: t >= tFin && t < tFin + 0.35 ? 1.1 : kinG });
      if (t < tKill) cW.set({ fill: C.white, k: kinW });
      else if (t < tRew) { const u = (t - tKill) / 0.25; cW.set(u < 1 ? { fill: C.gold, k: 1 - u } : { k: 0 }); }
      else { const u = (t - tRew) / REW; cW.set({ fill: C.white, k: clamp(u * 1.4) }); }             // 倒带：碎掉的又长回来
      if (t >= tRew) cG.set({ fill: C.gray, k: 1 });
    } else {
      const g = t >= tGate ? (t < tGate + 0.25 ? C.gold : t >= tPickW + 0.35 ? C.ink : C.gray) : C.white;
      cW.set({ fill: t >= tPickW && t < tPickW + 0.35 ? C.gold : g, k: 1 + 0.14 * throb(t) });
      cG.set({ fill: t >= tGlet2 + 0.4 ? C.ink : C.gray, k: 1 });
    }
  });
  const pRB = ptr(esv, nR.x, nR.y, nB.x, nB.y, { w: 5, head: 20, gap1: 16, gap2: NS3 / 2 + 6 });
  const pRG = ptr(esv, nR.x, nR.y, nG.x, nG.y, { w: 5, head: 20, gap1: 16, gap2: NS3 / 2 + 6 });
  const pGW = ptr(esv, nG.x, nG.y, nW.x, nW.y, { w: 6, head: 22, gap1: NS3 / 2 + 6, gap2: NS3 / 2 + 8 });
  const pBW = ptr(esv, nB.x, nB.y, nW.x, nW.y, { w: 7, head: 24, gap1: NS3 / 2 + 6, gap2: NS3 / 2 + 8 });
  F((t) => {
    const on = t >= tS3 && t < tE11, pass2 = t >= tRew + REW;
    pRB.set(on ? { f: Math.min(1, (t - tS3) / 0.3) } : { f: 0 }); pRG.set(on ? { f: Math.min(1, (t - tS3) / 0.3) } : { f: 0 });
    // 灰 → 白：第一遍在松手时收回，倒带时长回来；第二遍再收回
    let fg = on ? Math.min(1, (t - tS3 - 0.2) / 0.3) : 0;
    if (!pass2 && t >= tGlet && t < tRew) fg = 1 - clamp((t - tGlet) / 0.3);
    if (!pass2 && t >= tRew) fg = clamp((t - tRew) / REW);
    if (pass2 && t >= tGlet2) fg = 1 - clamp((t - tGlet2) / 0.3);
    pGW.set({ f: fg, col: C.white });
    // 黑 → 白：程序写下的那一条
    let fb = 0, col = C.white;
    if (!pass2 && t >= tBW && t < tRew) fb = Math.min(1, (t - tBW) / 0.35);
    if (!pass2 && t >= tRew) fb = 1 - clamp((t - tRew) / REW);
    if (pass2 && t >= tBW2) { fb = Math.min(1, (t - tBW2) / 0.35); if (t >= tGate - 0.05 && t < tGate + 0.35) col = C.gold; }
    pBW.set({ f: on ? fb : 0, col, w: 7 + 6 * throb(t) });
  });
  appear(rootB3, tS3); exit(rootB3, tE11, { y: 40, d: 0.3 });
  sfx('pop', tS3 + BEAT, { g: 0.4 }); sfx('pop', tS3 + 2 * BEAT, { g: 0.4, p: 0.4 });
  sfx('error', tVio, { g: 0.25 });
  const tCol = qb(T('e7', { zh: '收集器', en: 'collector' }) - 0.1), tPrg = tMut;
  const ringG = cell(nsv, nG.x, nG.y, NS3 + 44), ringB = cell(nsv, nB.x, nB.y, NS3 + 44);
  F((t) => {
    const on = t >= tCol && t < tBW, ph = ((t - tCol) / BEAT) % 1;
    ringG.set(on ? { st: C.gold, sw: 10, k: 1 + 0.08 * (1 - ph) } : { k: 0 });
    const onB = t >= tPrg && t < tBW + 0.4, phB = ((t - tPrg) / BEAT) % 1;
    ringB.set(onB ? { st: C.white, sw: 8, k: 1 + 0.08 * (1 - phB) } : { k: 0 });
  });
  sfx('pop', tS3, { g: 0.5 }); sfx('tick', tBW + 0.2, { g: 0.6, p: 0.3 }); sfx('pop', tGlet, { g: 0.5, p: -0.2 }); sfx('thud', tFin, { g: 0.5 });
  // 节点名、程序之手
  const nl = [[nB, tr('黑', 'black')], [nG, tr('灰', 'gray')], [nW, tr('白', 'white')]].map(([n, l]) => { const e = tx(world, 'ser', l, n.x + NS3 / 2 + 20, n.y - tr(48, 36), { size: tr(64, 44), color: C.pale }); appear(e, tS3 + 0.2); exit(e, tE11, { y: 30, d: 0.3 }); return e; });
  F((t) => ss(nl[2], 'visibility', t >= tKill && t < tRew + REW ? 'hidden' : 'inherit'));
  // 名字跟着颜色走：灰的处理完变「黑」；倒带回「灰」；第二遍白的被涂「灰」、再被处理成「黑」
  keyed(nl[1]).at(tFin + 0.35, { html: tr('黑', 'black') }).at(tRew, { html: tr('灰', 'gray') }).at(tGlet2 + 0.4, { html: tr('黑', 'black') });
  keyed(nl[2]).at(tGate, { html: tr('灰', 'gray') }).at(tPickW + 0.35, { html: tr('黑', 'black') });
  const hand = wtag(world, tr('程序', 'program'), X3 + 1330, 250, 36), hand2 = tag(world, tr('收集器', 'collector'), X3 + 1240, 862, 36);
  slide(hand, tMut, { y: -20, d: 0.3 }); slide(hand2, qb(T('e7', { zh: '收集器', en: 'collector' }) - 0.1), { y: 20, d: 0.3 });
  sfx('pop', qb(T('e7', { zh: '收集器', en: 'collector' }) - 0.1), { g: 0.4, p: 0.2 }); sfx('pop', tMut, { g: 0.4, p: 0.3 });
  exit(hand, tE11, { y: -30, d: 0.3 }); exit(hand2, tRule, { y: 30, d: 0.3 });
  const live = wtag(world, tr('活对象', 'live object'), nW.x - tr(70, 90), nW.y + 92, 32); slide(live, tBW + 0.4, { y: 20, d: 0.3 }); exit(live, tKill, { y: 30, d: 0.2 });
  const kill = tx(world, 'ser', tr('冤杀', 'Wrongly<br>killed'), nW.x - 110, nW.y - tr(70, 110), { size: tr(130, 92), lh: 1.05, color: C.gold });
  slam(kill, tKill + 0.1, { from: 1.4, d: 0.4 }); exit(kill, tRew + 0.45, { y: -40, d: 0.3 });
  shatter(world, nW.x - NS3 / 2, nW.y - NS3 / 2, NS3, NS3, C.gold, tKill, { n: 3, gap: 6, spread: 120, seed: 31 });
  sfx('error', tKill, { g: 0.75 }); sfx('thud', tKill + 0.1, { g: 0.8 });
  // 倒带
  const rew = tx(ui, 'sub', tr('倒带', 'rewind'), 120, 880, { size: 60, color: C.pale, ...plate }); appear(rew, tRew); vanish(rew, tRew + REW + 1.1);   // 放在底部，留够读的时间
  sfx('riser', tRew - 0.2, { g: 0.4 });
  // 家规
  const ruleL = tr(['标记期间，', '黑的绝不许', '直接指向白的'], ['While marking,', 'black must never', 'point at white']).map((l, k) => tx(ui, 'ser', l, 110, 176 + k * 102, { size: tr(88, 72), ...plate }));
  const ruleQ = paper(ui, 120, 560, 610, '<div class="pq" style="font-size:30px;line-height:1.35">no edge points from a black node to a white one</div>' + tr('<div style="font-family:\'Sans SC\';font-weight:500;font-size:28px;margin-top:16px">（译）没有一条边从黑节点指向白节点</div>', '') + '<div class="pm" style="font-size:22px;margin-top:16px">' + tr('Dijkstra 等, CACM 1978 · 不变式 P1', 'Dijkstra et al., CACM 1978 · invariant P1') + '</div>');
  const djk = tag(ui, tr('迪杰斯特拉的家规', "Dijkstra's house rule"), 124, 112, 36);
  slide(djk, qb(Math.min(T('e8', { zh: '迪杰斯特拉', en: 'Dijkstra' }), Tend('e8') - 0.6)), { x: -40, d: 0.3 }); sfx('tick', qb(T('e8b', { zh: '绝不许', en: 'never' }) - 0.1), { g: 0.4 }); sfx('tick', tBW2 + 0.25, { g: 0.55, p: 0.3 });
  const tR2 = qb(Math.max(tRule + 0.5, T('e8b', { zh: '黑的', en: 'black' }) - 0.1)), tR3 = qb(Math.max(tR2 + 0.5, T('e8b', { zh: '直接', en: 'directly' }) - 0.1));
  wipe(ruleL[0], tRule, { dir: 'l', d: 0.4 }); wipe(ruleL[1], tR2, { dir: 'l', d: 0.4 }); wipe(ruleL[2], tR3, { dir: 'l', d: 0.4 });
  wipe(ruleQ, tR3 + 0.6, { dir: 'l', d: 0.4 }); sfx('thud', tRule, { g: 0.8 }); sfx('thud', tR2, { g: 0.8 }); sfx('thud', tR3, { g: 1 }); sfx('chime', tR3 + 0.6, { g: 0.5 });
  // 写屏障：程序写下黑 → 白的一瞬，一道金闸横在指针上，白的被涂灰
  const gate = h('div', 'abs', world); px(gate, (nB.x + nW.x) / 2 - 16, (nB.y + nW.y) / 2 - 90, 32, 180); gate.style.background = C.gold;
  F((t) => { const on = t >= tGate - 0.05 && t < tE11; vis(gate, on); });
  pulse(gate, tGate, 1.6, 0.3); sfx('thud', tGate, { g: 0.9 }); sfx('blip', tGate + 0.05, { g: 0.6 });
  const shd = tag(world, tr('涂灰', 'painted gray'), nW.x - tr(50, 90), nW.y + 92, 34); slam(shd, tGate + 0.1, { from: 1.3, d: 0.3 });
  // 上一章遮住的那个名字：揭开
  const spy = h('div', 'abs', world); px(spy, (nB.x + nW.x) / 2 - 170, 70, 340, 80); spy.style.background = C.gold;
  const spyT = tx(world, 'sub', tr('写屏障', 'write barrier'), (nB.x + nW.x) / 2 - tr(130, 150), tr(74, 82), { size: tr(56, 44), color: C.ink });
  const spyB = h('div', 'abs', world); px(spyB, (nB.x + nW.x) / 2 - 150, 90, 300, 40); spyB.style.background = C.ink;
  const spyE = tx(world, 'lat', tr('write barrier', ''), (nB.x + nW.x) / 2 - 130, 160, { size: 34, color: C.pale });
  slide(spy, tPickW - 0.1, { y: -20, d: 0.3 }); appear(spyT, tPickW - 0.1); appear(spyB, tPickW - 0.1);
  tl.fromTo(spyB, { x: 0, scaleX: 1 }, { x: 160, scaleX: 0, duration: 0.35, ease: 'power3.in', immediateRender: false }, tWB);
  appear(spyE, tWB + 0.2); sfx('thud', tWB + 0.2, { g: 0.9 }); sfx('chime', tWB + 0.3, { g: 0.55 });
  // 金闸的显隐只由上面的帧函数管（同时再挂一个退场补间，两边抢 opacity，正着播和倒着跳结果不同）
  for (const e of [...ruleL, ruleQ, djk, shd, spy, spyT, spyB, spyE]) exit(e, tE11 - 0.1, { y: -40, d: 0.3 });

  // ════ e11：三种颜色，一条家规（回到 S2 的图快放）════
  const w11 = wonder(ui, tr('三种颜色，一条家规', 'Three colors, one rule'), 110, 110, tE11, Tend('e11') + 0.65, { size: tr(104, 96), h: 130, plate: true });
  const sw3 = ['W', 'G', 'B'].map((c, k) => { const e = h('div', 'abs', ui); px(e, 160 + k * 170, 330, 140, 140); css(e, { background: COLOR[c], outline: c === 'B' ? `3px solid ${C.white}` : 'none' }); slam(e, tE11 + 0.3 + k * BEAT / 2, { from: 1.5, d: 0.3 }); sfx('pop', tE11 + 0.3 + k * BEAT / 2, { g: 0.45 }); return e; });
  const ruleMini = tx(ui, 'sub', tr('黑不指白', 'black never points at white'), 700, tr(360, 372), { size: tr(72, 56), ...plate }); wipe(ruleMini, qb(T('e11', { zh: '一条家规', en: 'one house rule' }) - 0.1), { dir: 'l', d: 0.4 });
  const noPre = tx(ui, 'note', tr('无需预判程序要干什么', 'no need to predict the program'), 160, 520, { size: 44, color: C.white, ...plate }); wipe(noPre, qb(T('e11', { zh: '无需', en: 'no need' }) - 0.1), { dir: 'l', d: 0.4 });
  // 收集器的游标：白 → 灰 → 黑，一拍一格，直到这一屏退场
  const cur11 = h('div', 'abs', ui); px(cur11, 160, 330, 140, 140); css(cur11, { outline: `6px solid ${C.gold}`, outlineOffset: '8px' });
  const tCur = qb(T('e11', { zh: '一条家规', en: 'one house rule' }) + 0.2), tCurEnd = Tend('e11') + 0.65;
  F((t) => { const on = t >= tCur && t < tCurEnd; vis(cur11, on); if (on) ss(cur11, 'left', 160 + 170 * (Math.floor((t - tCur) / BEAT) % 3) + 'px'); });
  for (const e of [...sw3, ruleMini, noPre]) exit(e, Tend('e11') + 0.65, { y: -40, d: 0.3 });
  const none = tx(ui, 'ser', tr('活物一个不漏', 'Not one living thing missed'), 110, 830, { size: tr(80, 72), ...plate }); wipe(none, qb(T('e11b', { zh: '活物', en: 'not one' }) - 0.2), { dir: 'l', d: 0.4 }); exit(none, tMont1 + 0.1, { y: 60, d: 0.3 });

  // ════ S4：Lua 源码里的铁律；改表时退回灰 ════
  const X4 = 7200, tE12 = qb(T('e12', { zh: '翻开', en: 'Open' }) - 0.3), tLaw = qb(Math.min(T('e12b', { zh: '黑的', en: 'black' }), Tend('e12') - 0.5));
  const src = slab(ui, 120, 300, [
    '<span class="hd">17</span>  /*',
    '<span class="hd">18</span>  ** Collectable objects may have one of three colors: white, which means',
    '<span class="hd">19</span>  ** the object is not marked; gray, which means the object is marked, but',
    '<span class="hd">20</span>  ** its references may be not marked; and black, which means that the',
    '<span class="hd">21</span>  ** object and all its references are marked.  The main invariant of the',
    '<span class="hd">22</span>  ** garbage collector, while marking objects, is that <span class="lw">a black object can</span>',
    '<span class="hd">23</span>  ** <span class="lw">never point to a white one</span>. <span class="hd">Moreover, any gray object must be in a</span>'], { size: 25 });
  const srcL = tx(ui, 'src', 'Lua 5.5.0 · lgc.h', 124, 262);
  wipe(src.el, tE12 + 0.2, { dir: 't', d: 0.5 }); appear(srcL, tE12 + 0.2); sfx('blip', tE12 + 0.2, { g: 0.5 });
  const lws = src.el.querySelectorAll('.lw'); classAt(lws[0], 'hl', qb(T('e12b', { zh: '黑的', en: 'black' }) - 0.1)); classAt(lws[1], 'hl', qb(T('e12b', { zh: '白的', en: 'white' }) - 0.1));
  sfx('tick', qb(T('e12b', { zh: '黑的', en: 'black' }) - 0.1), { g: 0.45 }); sfx('tick', qb(T('e12b', { zh: '白的', en: 'white' }) - 0.1), { g: 0.45 });
  const law = tx(ui, 'ser', tr('黑的永远不许指向白的', 'Black may never point to white'), 110, 110, { size: tr(100, 84), ...plate });
  wipe(law, tLaw, { dir: 'l', d: 0.5 }); sfx('thud', tLaw, { g: 0.8 });
  const lawT = tx(ui, 'note', tr('（译）……标记期间，垃圾收集器的主要不变式是：黑对象永远不能指向白对象', ''), 124, 640, { size: 30, color: C.white, ...plate });
  slide(lawT, tE12 + 1.0, { y: 30, d: 0.35 });
  const tBack = qb(T('e12a', { zh: '退一步', en: 'steps back' }) - 0.2), tStuff = qb(T('e12a', { zh: '塞入', en: 'new data' }) - 0.1), tGray = qb(T('e12ab', { zh: '退回灰', en: 'back to gray' }) - 0.15), tE13 = qb(T('e13', { zh: '回到', en: 'Back' }) - 0.3);
  for (const e of [src.el, srcL, lawT]) exit(e, tBack - 0.2, { y: 60, d: 0.3 });
  exit(law, tBack - 0.2, { y: -40, d: 0.3 });
  // 一张黑的表，塞进一个指向白对象的新条目：屏障不去涂白的，而是把表自己退回灰
  const TB = { x: X4 + 760, y: 470 }, TW = { x: X4 + 1360, y: 470 };
  const tab = h('div', 'abs', world); px(tab, TB.x - 160, TB.y - 160, 320, 320); tab.style.background = C.ink; tab.style.outline = `4px solid ${C.white}`;
  const slots = []; for (let k = 0; k < 4; k++) { const e = h('div', 'abs', world); px(e, TB.x - 130, TB.y - 130 + k * 66, 260, 50); css(e, { border: `3px solid ${C.pale}` }); slots.push(e); }
  const tabL = tx(world, 'sub', tr('表', 'table'), TB.x - tr(30, 60), TB.y - 250, { size: 64 });
  const cWt = cell(nsv, TW.x, TW.y, 140);
  const pT = ptr(esv, TB.x + 130, TB.y + 70, TW.x, TW.y, { w: 6, head: 22, gap2: 78 });
  slam(tab, tBack, { from: 0.6, d: 0.4 }); slots.forEach((e, k) => appear(e, tBack + 0.1 + k * 0.05)); appear(tabL, tBack + 0.1); sfx('pop', tBack, { g: 0.6 });
  F((t) => { if (t < tBack || t >= tE13) return cWt.set({ k: 0 }); cWt.set({ fill: C.white, k: Math.min(1, (t - tBack - 0.3) / 0.2) }); });
  grow(pT, tStuff, tE13, { d: 0.35, st: (t) => ({ col: C.white }) });
  const newE = h('div', 'abs', world); px(newE, TB.x - 130, TB.y - 130 + 198, 260, 50); newE.style.background = C.white; appear(newE, tStuff); sfx('tick', tStuff, { g: 0.6 });
  F((t) => { ss(tab, 'background', t >= tGray + 0.3 ? C.gray : t >= tGray ? C.gold : C.ink); });
  const back = tag(world, tr('退回灰', 'back to gray'), TB.x - tr(110, 140), TB.y + 190, 40); slam(back, tGray + 0.1, { from: 1.3, d: 0.35 }); sfx('thud', tGray, { g: 0.7 });
  const bsrc = slab(ui, 120, 790, ['** barrier that moves collector backward, that is, mark the black object', '** pointing to a white object as gray again.'], { size: 24 });
  const bsrcL = tx(ui, 'src', 'Lua 5.5.0 · lgc.c · luaC_barrierback_', 124, 752);
  wipe(bsrc.el, tStuff + 0.3, { dir: 'l', d: 0.4 }); appear(bsrcL, tStuff + 0.3); sfx('blip', tStuff + 0.3, { g: 0.4 });
  for (const e of [tab, ...slots, tabL, newE, back, bsrc.el, bsrcL]) exit(e, tE13, { y: 50, d: 0.3 });

  // ════ S5：四十万张表，419 步 ════
  const X5 = 9600, GX = X5 + 100, GY = 220, GN = 20, GP = 26;
  const gsv = board(world, GX - 10, GY - 10, GN * GP + 20, GN * GP + 20);
  const gt = []; for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) gt.push({ c: cell(gsv, GX + i * GP + GP / 2, GY + j * GP + GP / 2, 20), live: (i + j) % 2 === 0, i, j, k: j * GN + i });
  const tS0 = qb(T('e13b', { zh: 'Lua', en: 'Lua' }) - 0.1), tS300 = qb(T('e14b', { zh: '之后', en: 'then' }) - 0.1), tS350 = qb(T('e14b', { zh: '十四兆', en: '14 MB' })), tS1 = qb(Tend('e15') - 0.2);
  const stepAt = (t) => (t < tS300 ? 300 * clamp((t - tS0) / (tS300 - tS0)) : t < tS350 ? 300 + 50 * (t - tS300) / (tS350 - tS300) : 350 + 69 * clamp((t - tS350) / (tS1 - tS350)));
  // L06：第 300 步时 28,458 KB，第 350 步时 14,239 KB，结束 14,239 KB。L09：清扫之后几十步是把活表洗回白色
  F((t) => gt.forEach((o) => {
    if (t < tE13 + 0.1 || t >= s.end - 0.2) return o.c.set({ k: 0 });
    const st = stepAt(t), mk = 300 * ((o.k * 7919) % 400) / 400;      // 标记：每张活表在前 300 步里的某一步变黑
    const sw = 300 + 50 * (o.k / 400), wash = 350 + 69 * (o.k / 400);  // 清扫 300–350 步，洗白 350–419 步
    if (!o.live) return o.c.set(st >= sw ? { k: Math.max(0, 1 - (st - sw) / 3) , fill: C.gold } : { fill: C.white, k: 1 });
    o.c.set({ fill: st >= wash ? C.white : st >= mk ? (st < mk + 4 ? C.gray : C.ink) : C.white, k: 1 });
  }));
  // 内存曲线：横轴步数，纵轴 KB
  const CX0 = X5 + 820, CY0 = 200, CW = 980, CHh = 420, kb = (st) => (st <= 300 ? 28458 : st < 350 ? 28458 - (28458 - 14239) * ((st - 300) / 50) : 14239);
  const ky = (v) => CY0 + CHh - (v - 10000) / (30000 - 10000) * CHh, kx = (st) => CX0 + st / 419 * CW;
  const axis = h('div', 'abs', world); px(axis, CX0, CY0 + CHh, CW, 4); axis.style.background = C.white;
  const axisY = h('div', 'abs', world); px(axisY, CX0, CY0 - 20, 4, CHh + 24); axisY.style.background = C.white;
  const csv = board(world, CX0 - 20, CY0 - 40, CW + 60, CHh + 80);
  const curve = svg('polyline', { points: '', fill: 'none', stroke: C.gold, 'stroke-width': 8, 'stroke-linejoin': 'miter' }, csv);
  FR(tS0, tS1, (t) => { const st = stepAt(t), pts = []; for (let k = 0; k <= Math.floor(st); k += 1) pts.push(kx(k).toFixed(1) + ',' + ky(kb(k)).toFixed(1)); pts.push(kx(st).toFixed(1) + ',' + ky(kb(st)).toFixed(1)); sa(curve, 'points', pts.join(' ')); sa(curve, 'visibility', st > 0 ? 'visible' : 'hidden'); });
  const m300 = h('div', 'abs', world); px(m300, kx(300) - 2, CY0 - 10, 4, CHh + 10); m300.style.background = C.pale;
  const l300 = tx(world, 'big', tr('300 步', '300'), kx(300) - tr(80, 40), CY0 + CHh + 20, { size: 44 }), l419 = tx(world, 'big', tr('419 步', '419 steps'), kx(419) - tr(150, 210), CY0 + CHh + 20, { size: 44, color: C.gold });
  const l28 = tx(world, 'big', '28 MB', CX0 + 20, ky(28458) - 70, { size: 56 }), l14 = tx(world, 'big', '14 MB', kx(350) + 34, ky(14239) - 82, { size: 56, color: C.gold });
  const stepN = tx(world, 'big', '0', CX0 + 40, CY0 + 170, { size: 110 }), stepL = tx(world, 'sub', tr('步', 'steps'), CX0 + 270, CY0 + 200, { size: 56 });
  const t419 = qb(Math.min(T('e13b', { zh: '四百一十九步', en: '419' }), Tend('e13') - 0.5)), t300 = qb(Math.min(T('e14', { zh: '三百步', en: '300 steps' }), Tend('e13b') - 0.2)), t2814 = qb(Math.min(T('e14b', { zh: '二十八兆', en: '28 MB' }), Tend('e14') - 0.6));
  for (const e of [axis, axisY]) wipe(e, tE13 + 0.2, { dir: e === axis ? 'l' : 'b', d: 0.4 });
  slam(l419, t419, { from: 1.3, d: 0.35 }); appear(m300, t300); slide(l300, t300, { y: 20, d: 0.3 }); slam(l28, t2814, { from: 1.25, d: 0.3 }); slam(l14, t2814 + BEAT / 2, { from: 1.25, d: 0.3 });
  appear(stepN, tS0); appear(stepL, tS0);
  F((t) => { const v = String(Math.round(stepAt(t))); if (stepN._v !== v) { stepN._v = v; stepN.textContent = v; } });
  sfx('thud', t419, { g: 0.6 }); sfx('pop', t300, { g: 0.5 }); sfx('thud', t2814, { g: 0.5 }); sfx('thud', t2814 + BEAT / 2, { g: 0.5 });
  const tStep300 = tS300;
  for (let k = 0; k < 16; k++) sfx('tick', tS0 + (tS1 - tS0) * k / 16, { g: 0.2 + 0.02 * k, p: -0.5 + k / 16 });
  sfx('whoosh', tStep300, { g: 0.5 }); sfx('chime', tS1, { g: 0.5 });
  const l40 = tx(world, 'sub', tr('四十万张表', '400,000 tables'), GX, GY - 80, { size: 48 }); appear(l40, tE13 + 0.1);
  const luaS = slab(ui, 120, 800, ['before: 28457 KB (200000 live + 200000 unreachable tables)', '  after step 300:    <span class="k">28458 KB</span>', '  after step 350:    <span class="k">14239 KB</span>', 'cycle finished after <span class="g">419</span> basic steps: 14239 KB'], { size: 22, pad: '14px 24px 16px' });
  wipe(luaS.el, tE13 + 0.3, { dir: 'l', d: 0.35 }); [tE13 + 0.3, tStep300, tS350, tS1].forEach((t, k) => { appear(luaS.ln[k], t); if (k) sfx('blip', t, { g: 0.35 }); });
  // 增量：每一步之间，程序都插进去干一段
  const tInc = qb(Math.min(T('e15b', { zh: '增量', en: 'incremental' }), Tend('e15') - 0.5)), tTrack = qb(T('e15', { zh: '间隙', en: 'between' }) - 0.2);
  const trk = []; for (let k = 0; k < 18; k++) { const b = h('div', 'abs', ui); px(b, 1040 + k * 46, 730, k % 2 ? 30 : 12, 34); b.style.background = k % 2 ? C.white : C.gold; trk.push(b); }
  trk.forEach((b, k) => appear(b, tTrack + k * BEAT / 4));
  const trkL1 = tx(ui, 'mono', tr('收集器一步 · 程序一段', 'one collector step · one program stretch'), 1040, 776, { size: 24, color: C.pale }); appear(trkL1, tTrack + 0.5);
  const inc = tag(ui, tr('增量', 'incremental'), 1040, 830, 48), incE = tx(ui, 'lat', tr('incremental', ''), 1180, 842, { size: 34, color: C.pale });
  slam(inc, tInc, { from: 1.3, d: 0.35 }); appear(incE, tInc + 0.2); sfx('thud', tInc, { g: 0.8 });
  const tE18 = qb(T('e18', { zh: 'Java', en: 'Java' }) - 0.35);
  for (const e of [luaS.el, ...trk, trkL1, inc, incE]) exit(e, tE18, { y: 50, d: 0.3 });

  // ════ S6：Java G1，后台标记 ════
  const X6 = 12000, TX0 = X6 + 180, TW_ = 1560, ms = (v) => TX0 + (v - 0.526) / (0.554 - 0.526) * TW_;
  const lanes = [[300, tr('程序', 'program')], [470, tr('G1 后台标记', 'G1 background marking')]];
  const laneEls = lanes.map(([y, l], k) => { const e = tx(world, 'sub', l, X6 + 180, y - 70, { size: 44, color: k ? C.gold : C.white }); appear(e, tE18 + 0.3 + k * 0.1); return e; });
  // 停顿（毫秒，来自日志）：周期自己的停顿是开头 1 次、收尾 2 次；期间年轻代照常停
  const P6 = [[0.529, 4.899, 'Concurrent Start', 1], [0.540, 8.532, 'GC(8)', 0], [0.543, 1.474, 'Remark', 1], [0.545, 2.183, 'GC(9)', 0], [0.551, 4.376, 'GC(10)', 0], [0.551, 0.030, 'Cleanup', 1]];
  const tLane = qb(T('e18', { zh: '后台', en: 'background' }) - 0.3);
  const progBar = h('div', 'abs', world); px(progBar, TX0, 300, TW_, 60); progBar.style.background = C.white;
  wipe(progBar, tE18 + 0.4, { dir: 'l', d: 0.8, ease: 'none' });
  const pauseEls = P6.map(([at, d, n, cyc], k) => {
    const x = ms(at), w = Math.max(6, ms(at + d / 1000) - x);
    const gap = h('div', 'abs', world); px(gap, x, 296, w, 68); css(gap, { background: cyc ? C.gold : C.field, outline: cyc ? 'none' : `3px solid ${C.pale}` });
    const t = tE18 + 0.4 + 0.8 * (x - TX0) / TW_; appear(gap, t);
    if (cyc) sfx('tick', t, { g: 0.5 });
    return gap;
  });
  const markBar = h('div', 'abs', world); px(markBar, ms(0.529), 470, ms(0.552) - ms(0.529), 60); markBar.style.background = C.gold;
  wipe(markBar, tLane, { dir: 'l', d: 1.2, ease: 'none' }); sfx('whoosh', tLane, { g: 0.4 });
  const head = tag(world, tr('头', 'start'), ms(0.529) - 20, tr(190, 172), 34), tail = tag(world, tr('尾', 'end'), ms(0.551) - tr(40, 60), tr(190, 172), 34);
  const tHT = qb(T('e18b', { zh: '头尾', en: 'start and the end' }) - 0.1);
  slam(head, tHT, { from: 1.3, d: 0.3 }); slam(tail, tHT + BEAT / 2, { from: 1.3, d: 0.3 }); sfx('pop', tHT, { g: 0.5 }); sfx('pop', tHT + BEAT / 2, { g: 0.5 });
  const g1 = tx(world, 'big', 'G1', X6 + 180, 600, { size: 120 }), g1e = tx(world, 'src', 'OpenJDK 27 · -Xmx64m -Xlog:gc', X6 + 190, 730);
  slam(g1, tE18 + 0.1, { from: 1.25, d: 0.4 }); appear(g1e, tE18 + 0.4); sfx('thud', tE18 + 0.1, { g: 0.7 });
  const conc = tag(world, tr('并发', 'concurrent'), X6 + 760, 610, 56), concE = tx(world, 'lat', tr('concurrent', ''), X6 + 950, 628, { size: 40, color: C.pale });
  const tConc = qb(Math.min(T('e18b', { zh: '并发', en: 'concurrent' }), Tend('e18') - 0.5));
  slam(conc, tConc, { from: 1.3, d: 0.35 }); appear(concE, tConc + 0.2); sfx('thud', tConc, { g: 0.8 });
  const glog = slab(ui, 120, 800, [
    '[0.529s][info][gc] GC(6) Pause Young (<span class="g">Concurrent Start</span>) (G1 Humongous Allocation) 15M-&gt;14M(24M) 4.899ms',
    '[0.529s][info][gc] GC(7) Concurrent Mark Cycle',
    '[0.543s][info][gc] GC(7) Pause <span class="g">Remark</span> 22M-&gt;22M(28M) 1.474ms',
    '[0.551s][info][gc] GC(7) Pause <span class="g">Cleanup</span> 25M-&gt;25M(45M) 0.030ms'], { size: 23, pad: '12px 22px 14px' });
  wipe(glog.el, tE18 + 0.5, { dir: 'l', d: 0.35 }); sfx('blip', tE18 + 0.5, { g: 0.4 });
  const tE16 = qb(T('e16', { zh: '再看回', en: 'Back' }) - 0.35);
  for (const e of [glog.el]) exit(e, tE16, { y: 50, d: 0.3 });

  // ════ S7：.NET 一行赋值，四条指令 ════
  const X7 = 14400;
  const csrc = slab(ui, 120, 150, ['<span class="hd">static void</span> Link(Node a, Node b) { <span class="k">a.Next = b</span>; }'], { size: 40, pad: '18px 30px 20px' });
  const csrcL = tx(ui, 'src', 'C# · .NET 10.0.12 · Lab.Link', 124, 112);
  wipe(csrc.el, tE16 + 0.3, { dir: 'l', d: 0.4 }); appear(csrcL, tE16 + 0.3); sfx('blip', tE16 + 0.3, { g: 0.5 });
  const INS = [['lea', 'rcx, bword ptr [rcx+0x08]', tr('算地址', 'address')], ['call', 'CORINFO_HELP_ASSIGN_REF', tr('调写屏障', 'call barrier')], ['nop', '', tr('空一拍对齐', 'align')], ['ret', '', tr('返回', 'return')]];
  const tI = [qb(T('e17', { zh: '算地址', en: 'compute' }) - 0.1), qb(T('e17', { zh: '调写屏障', en: 'call' }) - 0.1), qb(T('e17', { zh: '空一拍', en: 'no-op' }) - 0.1), qb(T('e17', { zh: '返回', en: 'return' }) - 0.1)];
  const insEls = INS.map(([op, arg, zh], k) => {
    const y = 330 + k * 130;
    const ln = tx(world, 'mono', `<span style="color:${C.white};font-weight:700">${op.padEnd(6, ' ').replace(/ /g, '&nbsp;')}</span>${arg}`, X7 + 140, y, { size: 56 });
    const lb = tx(world, 'sub', zh, X7 + 1360, y + 6, { size: 48, color: k === 1 ? C.gold : C.pale });
    slide(ln, tE16 + 1.0 + k * BEAT / 2, { x: -60, d: 0.3 }); sfx('tick', tE16 + 1.0 + k * BEAT / 2, { g: 0.5 });
    wipe(lb, tI[k], { dir: 'l', d: 0.3 }); sfx('tick', tI[k], { g: 0.35, p: -0.3 + k * 0.2 });
    return [ln, lb];
  });
  const brk = h('div', 'abs', world); px(brk, X7 + 100, 300, 10, 500); brk.style.background = C.white;
  tl.fromTo(brk, { height: 0 }, { height: 500, duration: 2.2, ease: 'power1.inOut', immediateRender: false }, tE16 + 1.0); appear(brk, tE16 + 1.0);
  const four = tx(world, 'big', '4', X7 + 140, 860, { size: 90 }), fourL = tx(world, 'sub', tr('条指令 · 11 字节', 'instructions · 11 bytes'), X7 + tr(210, 220), 878, { size: 48 });
  slam(four, qb(T('e16b', { zh: '四条', en: 'four' }) - 0.1), { from: 1.4, d: 0.35 }); appear(fourL, qb(T('e16b', { zh: '四条', en: 'four' }) + 0.1)); sfx('thud', qb(T('e16b', { zh: '四条', en: 'four' }) - 0.1), { g: 0.8 });
  // 屏障里包着的两件事：写入指针、卡表打勾
  const tIn = qb(Math.min(T('e17b', { zh: '指针写入', en: 'pointer write' }), Tend('e17') - 0.6));
  const wrap = h('div', 'abs', world); px(wrap, X7 + 110, 438, 1700, 116); css(wrap, { border: `6px solid ${C.gold}` });
  const in1 = wtag(world, tr('写入 a.Next', 'write a.Next'), X7 + 560, 566, 34), in2 = tag(world, tr('卡表打勾', 'card tick'), X7 + 830, 566, 34);
  wipe(wrap, tI[1], { dir: 'l', d: 0.35 }); slide(in1, tIn, { y: -20, d: 0.3 }); slide(in2, tIn + BEAT / 2, { y: -20, d: 0.3 });
  sfx('pop', tIn, { g: 0.5 }); sfx('pop', tIn + BEAT / 2, { g: 0.5 });
  // 程序员一行屏障都没写
  const tE20 = qb(T('e20', { zh: '程序员', en: 'programmer' }) - 0.2);
  F((t) => insEls.forEach(([ln], k) => { const cur = t >= tI[k] && (k === 3 || t < tI[k + 1]); ss(ln, 'color', t >= tE20 + k * 0.08 || cur ? C.gold : C.pale); }));
  sfx('chime', tE20 + 0.3, { g: 0.55 });
  // 「白得了一个收集器」：屏障那一格的金框亮一下
  const tGot = qb(T('e20b', { zh: '收集器', en: 'collector' }) - 0.1);
  pulse(wrap, tGot, 1.04, 0.35); sfx('pop', tGot, { g: 0.45 });
  const w20 = wonder(ui, tr('程序员一行屏障都没写', 'Not one line of barrier code'), 110, 830, tE20 + 0.1, null, { size: 72, h: 92, plate: true });
  exit(four, tE20 - 0.1, { y: 40, d: 0.25 }); exit(brk, tE20 - 0.1, { y: 40, d: 0.25 }); exit(fourL, tE20 - 0.1, { y: 40, d: 0.25 });
  exit(csrcL, tE20, { y: -30, d: 0.3 });

  // ── 镜头 ──
  const V2 = { x: X2 + 900, y: 470, z: 0.95 }, V3 = { x: X3 + 1060, y: 520, z: 0.95 };
  cam.track(s.start, { x: 800, y: 480, z: 0.9 }, [
    [s.start + 0.5, { z: 1.0 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { x: 940, z: 1.04 }, tE3 - 0.3 - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tE3 - 0.3, V2, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 0.97 }, tE4b + 0.9 - (tE3 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tE4b + 0.9, { x: X2 + 760 }, 1.4, { ease: 'power2.inOut', sfx: false }],
    [null, { x: X2 + 800 }, tRun - 0.5 - (tE4b + 2.45) - 0.05, { ease: 'none', sfx: false }],
    [tRun - 0.5, V2, 1.0, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.98 }, tEnd2 - 0.3 - (tRun + 0.65) - 0.05, { ease: 'none', sfx: false }],
    [tEnd2 - 0.3, V3, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 0.97 }, tBW + 0.6 - (tEnd2 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tBW + 0.6, { x: X3 + 1300, y: 560, z: 1.1 }, 1.4, { ease: 'power2.inOut', sfx: false }],
    [tRew - 0.2, V3, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { x: V3.x + 70, z: 0.97 }, qb(T('e9', { zh: '程序', en: 'program' })) - 0.2 - (tRew + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [qb(T('e9', { zh: '程序', en: 'program' })) - 0.2, { x: X3 + 1000, y: 440, z: 0.95 }, 1.2, { ease: 'power2.inOut', sfx: false }],
    [null, { x: X3 + 1060, z: 0.97 }, Tend('e11') - 0.45 - (qb(T('e9', { zh: '程序', en: 'program' })) + 1.15) - 0.05, { ease: 'none', sfx: false }],
    [Tend('e11') - 0.45, V2, 0.8, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 0.97 }, tE12 - 0.4 - (Tend('e11') + 0.5) - 0.05, { ease: 'none', sfx: false }],
    [tE12 - 0.4, { x: X4 + 960, y: 520, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { x: X4 + 1040, z: 1.03 }, tE13 - 0.3 - (tE12 + 0.75) - 0.05, { ease: 'none', sfx: false }],
    [tE13 - 0.3, { x: X5 + 960, y: 540, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.02 }, tE18 - 0.3 - (tE13 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tE18 - 0.3, { x: X6 + 960, y: 520, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.02 }, tE16 - 0.3 - (tE18 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tE16 - 0.3, { x: X7 + 960, y: 540, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.03 }, s.end - (tE16 + 0.85), { ease: 'none', sfx: false }],
  ]);
});
