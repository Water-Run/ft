// 开场：同一块芯片算账、打游戏（o1–o2）→ 片名（o3）→ ENIAC 靠接线定步骤，换题要重插好几天（p1–p2）
// → 1945 年报告的五部分（a1–a3）→ 步骤和数一起从输入送进同一个存储器（a4）。末态即下一场的初态。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);

  // ── 1. 芯片与它驱动的屏幕 ──
  const chip = h('div', 'abs', world); px(chip, 0, 0, 1920, 968);
  const cs = overlay(chip);
  const CX = 960, CY = 640, CS = 300;
  const body = svg('rect', { x: CX - CS / 2, y: CY - CS / 2, width: CS, height: CS, fill: '#f6efdc', stroke: C.ink, 'stroke-width': 4 }, cs);
  const pins = [];
  for (let k = 0; k < 9; k++) {
    const o = -CS / 2 + 30 + k * 30;
    for (const [x1, y1, x2, y2] of [[CX + o, CY - CS / 2, CX + o, CY - CS / 2 - 26], [CX + o, CY + CS / 2, CX + o, CY + CS / 2 + 26], [CX - CS / 2, CY + o, CX - CS / 2 - 26, CY + o], [CX + CS / 2, CY + o, CX + CS / 2 + 26, CY + o]])
      pins.push(path(cs, `M${x1},${y1} L${x2},${y2}`, 'ink', { w: 4, arrow: false }));
  }
  // 芯片里的电路：几条折线，自始至终不动
  const rnd = seeded(1945), traces = [];
  for (let k = 0; k < 11; k++) {
    let x = CX - 120 + rnd() * 240, y = CY - 120 + rnd() * 240, d = `M${x.toFixed(0)},${y.toFixed(0)}`;
    for (let j = 0; j < 4; j++) { if (j % 2) x = clamp(x + (rnd() - 0.5) * 160, CX - 128, CX + 128); else y = clamp(y + (rnd() - 0.5) * 160, CY - 128, CY + 128); d += ` L${x.toFixed(0)},${y.toFixed(0)}`; }
    traces.push(path(cs, d, 'soft', { w: 3, arrow: false, opacity: 0.85 }));
  }
  const core = svg('rect', { x: CX - 40, y: CY - 40, width: 80, height: 80, fill: 'none', stroke: C.ink, 'stroke-width': 3 }, cs);
  const lead = path(cs, `M${CX},${CY - CS / 2 - 26} L${CX},400`, 'ink', { w: 3, arrow: false, dashed: '8 8' });
  // 屏幕：一张纸样的显示面，内容在「账本」与「井字棋」之间切换
  const scr = h('div', 'sheet', chip); px(scr, 730, 150, 460, 250);
  const ledger = h('div', 'abs', scr, [['收入', '1200'], ['支出', '-350'], ['结余', '850']].map(([a, b], k) => `<div style="display:flex;width:320px;justify-content:space-between;${k === 2 ? 'border-top:3px solid #1c2633' : ''}"><span style="font:700 42px 'Serif SC'">${a}</span><span style="font:600 46px 'Mono'">${b}</span></div>`).join(''));
  px(ledger, 70, 30); css(ledger, { lineHeight: '1.28' }); ledger.dataset.name = '账本';
  const game = h('div', 'abs', scr); px(game, 150, 22, 160, 206); game.dataset.name = '井字棋';
  const gs = svg('svg', { width: 200, height: 206, viewBox: '0 0 200 206' }, game);
  for (const d of ['M67,8 L67,198', 'M133,8 L133,198', 'M8,70 L192,70', 'M8,136 L192,136']) svg('path', { d, stroke: C.ink, 'stroke-width': 5, fill: 'none' }, gs);
  for (const [x, y] of [[34, 38], [166, 104], [100, 170]]) svg('path', { d: `M${x - 18},${y - 18} L${x + 18},${y + 18} M${x + 18},${y - 18} L${x - 18},${y + 18}`, stroke: C.red, 'stroke-width': 6, fill: 'none' }, gs);
  for (const [x, y] of [[100, 104], [34, 170]]) svg('circle', { cx: x, cy: y, r: 20, stroke: C.blue, 'stroke-width': 6, fill: 'none' }, gs);
  const scrLab = txt(chip, 'type', tr('屏幕', 'SCREEN'), 736, 112); scrLab.style.fontSize = '24px';
  const chipLab = txt(chip, 'type', tr('芯片', 'CHIP'), CX + CS / 2 + 50, CY - 12); chipLab.style.fontSize = '24px';

  // 入场：芯片先画出来，屏幕跟着刷出（第一帧就在动）
  drawIn(body, s.start + 0.02, 0.6);
  pins.forEach((p, k) => drawIn(p, s.start + 0.2 + (k % 9) * 0.02, 0.25));
  traces.forEach((p, k) => drawIn(p, s.start + 0.35 + k * 0.03, 0.5)); drawIn(core, s.start + 0.4, 0.4);
  drawIn(lead, s.start + 0.5, 0.3);
  wipe(scr, s.start + 0.45, { dir: 't', d: 0.45 }); appear(scrLab, s.start + 0.55); appear(chipLab, s.start + 0.6);
  sfx('drive', s.start + 0.1, { g: 0.5 });
  // 内容切换：算账 → 打游戏 →（o2 里电线不动的同时）再来回切两次
  const flips = [[s.start, 'L'], [Q(T('o1', '打游戏')), 'G'], [Q(T('o2', '一')), 'L'], [Q(T('o2', '没')), 'G']];
  F((t) => { let v = 'L'; for (const [a, b] of flips) if (t >= a) v = b; ledger.style.visibility = v === 'L' ? '' : 'hidden'; game.style.visibility = v === 'G' ? '' : 'hidden'; });
  wipe(ledger, s.start + 0.6, { dir: 'l', d: 0.5 });
  flips.slice(1).forEach(([t]) => sfx('beep', t, { g: 0.45, p: 0.2 }));
  sfx('tick', Q(T('o1', '算账')), { g: 0.6 });
  // o2：电路被红铅笔圈住，屏幕照切
  const ring0 = pencilRing(ov, CX - 128, CY - 128, 256, 256, Q(T('o2', '电线')), 0.5); sfx('tick', Q(T('o2', '电线')), { g: 0.6, p: -0.2 });
  exit(chip, Tend('o2') + 0.15, { y: -30, d: 0.35 }); vanish(ring0, Tend('o2') + 0.2);

  // ── 2. 片名：一页说明书的扉页 ──
  const tIn = Qf(T('o3')), tOut = Q(Tend('o3') + 0.65);
  const card = h('div', 'abs', root); px(card, 0, 0, 1920, VH); css(card, { background: 'var(--paper)' });
  const cg = h('div', 'abs', card); px(cg, 0, 0, 1920, VH);
  css(cg, { background: 'linear-gradient(var(--rule) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, var(--rule) 1px, transparent 1px) 0 0 / 40px 40px' });
  const fig = txt(card, 'type', tr('图 1 · 存储程序计算机', 'FIG. 1 · STORED-PROGRAM COMPUTER'), 124, 212);
  const ttl = txt(card, 'ttl', tr('冯·诺伊曼架构', 'The von Neumann Architecture'), 116, 276); css(ttl, { fontSize: '148px', lineHeight: '1.06' });
  const rule = blk(card, '', 124, 470, 1060, 4); rule.style.background = 'var(--ink)';
  const sub = txt(card, 't-b soft', tr('不改一根电线，机器为什么能换着干活', 'Same wires, different jobs: how?'), 124, 506);
  const n128 = txt(card, 'mono red', String(TOTAL), 1290, 214); css(n128, { font: '700 280px "Mono"', letterSpacing: '-.04em', lineHeight: '1' });
  const sec = txt(card, 'type', tr('秒', 'SECONDS'), 1300, 506); sec.style.fontSize = '30px';
  [fig, ttl, n128, sec, sub].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tIn, { dir: 'l', d: 0.45 }); sfx('whoosh', tIn - 0.05, { g: 0.6 });
  appear(fig, tIn + 0.3); slam(ttl, Q(T('o3', '冯')), { from: 1.12, d: 0.45 }); sfx('thud', Q(T('o3', '冯')));
  wipe(rule, tIn + 0.4, { dir: 'l', d: 0.5 }); wipe(sub, tIn + 0.7, { dir: 'l', d: 0.5 });
  slide(n128, tIn + 0.25, { x: 120, d: 0.5 }); appear(sec, tIn + 0.5); sfx('pop', tIn + 0.25, { g: 0.6, p: 0.4 });
  fromTo(card, tIn, { scale: 1 }, { scale: 1.02, duration: tOut - tIn, ease: 'none', transformOrigin: '30% 40%', immediateRender: false });
  wipeOut(card, tOut, { dir: 'l', d: 0.45 });

  // ── 3. ENIAC：步骤靠接线；换一道题，拔了重插，好几天 ──
  const panel = h('div', 'sheet', world); px(panel, 230, 150, 1460, 650); panel.dataset.name = '接线板';
  const pl = txt(world, 'type', 'ENIAC · 1945', 260, 168);
  const pov = overlay(world);
  const jx = (c) => 300 + c * 88, jy = (r) => 260 + r * 74;
  const jacks = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 15; c++) jacks.push(svg('circle', { cx: jx(c), cy: jy(r), r: 9, fill: '#f6efdc', stroke: C.ink, 'stroke-width': 3 }, pov));
  const cable = (seed, color) => {
    const R = seeded(seed), out = [];
    for (let k = 0; k < 16; k++) {
      const a = [Math.floor(R() * 15), Math.floor(R() * 7)], b = [Math.floor(R() * 15), Math.floor(R() * 7)];
      if (a[0] === b[0] && a[1] === b[1]) continue;
      const x1 = jx(a[0]), y1 = jy(a[1]), x2 = jx(b[0]), y2 = jy(b[1]), sag = 70 + R() * 120;
      out.push(path(pov, `M${x1},${y1} C${x1},${y1 + sag} ${x2},${y2 + sag} ${x2},${y2}`, color, { w: 5, arrow: false }));
    }
    return out;
  };
  const cabA = cable(11, 'ink'), cabB = cable(29, 'blue');
  const tP = s.start + 0; const tP1 = T('p1');
  wipe(panel, Q(tP1) - 0.15, { dir: 'b', d: 0.45 }); appear(pl, Q(tP1) + 0.2); sfx('thud', Q(tP1) - 0.1, { g: 0.6 });
  jacks.forEach((j) => appear(j, Q(tP1) + 0.1));
  cabA.forEach((p, k) => { drawIn(p, T('p1', '电线') - 0.3 + k * 0.08, 0.5); if (k % 3 === 0) sfx('tick', T('p1', '电线') - 0.3 + k * 0.08, { g: 0.5, p: -0.5 + k / 16 }); });
  // 拔线：旧线反向收回；插线：另一组线描出。日夜交替表示时间在过去
  const tPull = Q(T('p2', '重新')), tPlug = tPull + 0.9;
  cabA.forEach((p, k) => { const len = p.getTotalLength(); to(p, tPull + k * 0.03, { strokeDashoffset: len, duration: 0.45, ease: 'power2.in' }); vanish(p, tPull + k * 0.03 + 0.46); });
  cabB.forEach((p, k) => { drawIn(p, tPlug + k * 0.07, 0.45); if (k % 4 === 0) sfx('tick', tPlug + k * 0.07, { g: 0.5, p: 0.3 }); });
  sfx('drive', tPull, { g: 0.6 });
  // 日夜交替：太阳（圆加光芒）与月牙轮流出现
  const sky = h('div', 'abs', world); px(sky, 1560, 166, 60, 60); sky.dataset.name = '日夜';
  const ss = svg('svg', { width: 60, height: 60, viewBox: '0 0 60 60' }, sky);
  const sunG = svg('g', {}, ss), moonG = svg('g', {}, ss);
  svg('circle', { cx: 30, cy: 30, r: 11, fill: 'none', stroke: C.ochre, 'stroke-width': 4 }, sunG);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; svg('path', { d: `M${30 + 17 * Math.cos(a)},${30 + 17 * Math.sin(a)} L${30 + 25 * Math.cos(a)},${30 + 25 * Math.sin(a)}`, stroke: C.ochre, 'stroke-width': 4 }, sunG); }
  svg('path', { d: 'M38,8 A22,22 0 1,0 52,40 A17,17 0 1,1 38,8 Z', fill: C.blue }, moonG);
  const days = [];
  for (let k = 0; k < 6; k++) days.push(T('p2') + k * 0.42);
  F((t) => { let v = ''; days.forEach((a, k) => { if (t >= a) v = k % 2 ? 'm' : 's'; }); if (t >= Tend('p2') + 0.6) v = ''; sunG.style.display = v === 's' ? '' : 'none'; moonG.style.display = v === 'm' ? '' : 'none'; });
  days.forEach((a, k) => sfx('tick', a, { g: 0.35, p: 0.6 }));
  const tGone = Q(T('a1')) - 0.1;
  [panel, pl].forEach((e) => exit(e, tGone, { y: 40, d: 0.35 }));
  to(pov, tGone, { autoAlpha: 0, duration: 0.3 });

  // ── 4. 1945 年的报告 → 五部分的方框图 ──
  const cover = h('div', 'sheet', world); px(cover, 600, 190, 720, 560); cover.dataset.name = 'EDVAC 报告封面';
  const cl = ['FIRST DRAFT OF A REPORT', 'ON THE EDVAC', '', 'BY JOHN VON NEUMANN', '', 'MOORE SCHOOL OF ELECTRICAL ENGINEERING', 'UNIVERSITY OF PENNSYLVANIA', 'JUNE 30, 1945'];
  const ct = h('div', 'abs', cover); px(ct, 0, 44, 720);
  css(ct, { font: '500 28px "Mono"', textAlign: 'center', letterSpacing: '.06em' });
  const lines = cl.map((l) => { const d = h('div', '', ct); d.style.height = (l ? 46 : 22) + 'px'; return d; });
  const cz = txt(cover, 't-n', tr('《EDVAC 报告初稿》<br>冯·诺伊曼　1945 年 6 月 30 日', ''), 0, 430); css(cz, { width: '720px', textAlign: 'center', color: 'var(--soft)', whiteSpace: 'normal' });
  const tA1 = Q(T('a1'));
  slide(cover, tA1, { y: 60, d: 0.5, ease: 'power3.out' }); sfx('pop', tA1, { g: 0.6 });
  // 打字机把封面一行行打出来
  let tt = tA1 + 0.35;
  cl.forEach((l, k) => { if (l) tt = typeText(lines[k], l, tt, 46, { cursor: false, sfxGain: 0.5 }) + 0.08; });
  hide0(cz); wipe(cz, Math.min(tt, Q(T('a1', '五')) - 0.6), { dir: 'l', d: 0.4 });
  const y45 = txt(world, 'mono red', '1945', 1350, 220); css(y45, { font: '700 96px "Mono"' });
  slam(y45, tA1 + 0.05, { from: 1.3, d: 0.35 }); sfx('thud', tA1 + 0.05, { g: 0.7 });
  const tFive = Q(T('a1', '五'));
  exit(cover, tFive - 0.35, { x: -60, d: 0.35 }); exit(y45, tFive - 0.35, { x: 60, d: 0.35 });

  const M = machine(world, {});
  const parts = [M.I, M.CC, M.CA, M.M, M.O];
  parts.forEach((e, k) => { wipe(e, tFive + k * 0.09, { dir: k % 2 ? 't' : 'l', d: 0.4 }); });
  sfx('thud', tFive, { g: 0.7 }); sfx('tick', tFive + 0.18, { g: 0.5 }); sfx('tick', tFive + 0.36, { g: 0.5, p: 0.4 });
  // 机器里的细部：先藏着，讲到哪个部件再出来
  const inner = [M.head, M.rule, M.slot, M.slotLab, M.ring, M.acc, M.accLab, M.expr, M.busLabel, ...M.rows.map((r) => r.el)];
  inner.forEach(hide0);
  hide0(M.pc);
  [...M.bus, ...M.io].forEach((p) => { p.style.opacity = 0; });
  // a2：两头的输入、输出
  const tIO = Q(T('a2', '输入'));
  M.io.forEach((p, k) => arrowIn(p, tIO + k * 0.5, 0.4));
  const ulI = path(ov, `M${G.I.x + 20},${G.I.y + G.I.h + 18} L${G.I.x + G.I.w - 20},${G.I.y + G.I.h + 18}`, 'red', { w: 5, arrow: false });
  const ulO = path(ov, `M${G.O.x + 20},${G.O.y + G.O.h + 18} L${G.O.x + G.O.w - 20},${G.O.y + G.O.h + 18}`, 'red', { w: 5, arrow: false });
  drawIn(ulI, tIO, 0.3); drawIn(ulO, Q(T('a2', '输出')), 0.3); sfx('tick', tIO, { g: 0.6, p: -0.7 }); sfx('tick', Q(T('a2', '输出')), { g: 0.6, p: 0.7 });
  to(ulI, Tend('a2') + 0.2, { autoAlpha: 0, duration: 0.3 }); to(ulO, Tend('a2') + 0.2, { autoAlpha: 0, duration: 0.3 });
  // a3：控制器（三步的小环）、运算器（里面的数）、存储器（编号的表头）与中间的通道
  const tCC = Q(T('a3', '控制器')), tCA = Q(T('a3', '运算器')), tM = Q(T('a3', '存储'));
  appear(M.ring, tCC); M.steps.forEach((e, k) => slam(e, tCC + k * 0.08, { from: 0.6, d: 0.3 })); wipe(M.slot, tCC + 0.2, { dir: 'l', d: 0.3 }); appear(M.slotLab, tCC + 0.3);
  sfx('pop', tCC, { g: 0.6, p: -0.4 });
  slam(M.acc, tCA, { from: 1.3, d: 0.35 }); appear(M.accLab, tCA + 0.15); appear(M.expr, tCA); sfx('pop', tCA, { g: 0.6, p: -0.4 });
  wipe(M.head, tM, { dir: 'l', d: 0.35 }); wipe(M.rule, tM + 0.05, { dir: 'l', d: 0.4 }); sfx('pop', tM, { g: 0.6, p: 0.4 });
  M.bus.forEach((p) => drawIn(p, tM + 0.3, 0.5)); appear(M.busLabel, tM + 0.6); sfx('tick', tM + 0.3, { g: 0.5 });
  const hl = (g, t0, t1) => { const r = blk(world, '', g.x - 6, g.y - 6, g.w + 12, g.h + 12); css(r, { border: '4px solid var(--red)' }); appear(r, t0); vanish(r, t1); };
  hl(G.CC, tCC, tCA - 0.05); hl(G.CA, tCA, tM - 0.05); hl(G.M, tM, Tend('a3') + 0.2);

  // a4：步骤（蓝）和数（赭）从输入出来，越过上方，落进同一个存储器
  const tSteps = Q(T('a4', '步骤')), tNums = Q(T('a4', '数'));
  // 先在输入框里排好（a4 一开口就在场），讲到「步骤」「数」时依次飞出
  const tLoad = Q(T('a4'));
  const ringI = blk(world, '', G.I.x - 6, G.I.y - 6, G.I.w + 12, G.I.h + 12); css(ringI, { border: '4px solid var(--red)' }); appear(ringI, tLoad); vanish(ringI, tNums + 1.2);
  sfx('pop', tLoad, { g: 0.6, p: -0.7 });
  PILE.forEach(([kind, x, y, r], k) => {
    const bits = kind === 'i' ? PROG.calc[k][0] : DATA[k - 4][0];
    const tp = tape(world, bits, kind, 0, 0);
    const t0 = (kind === 'i' ? tSteps : tNums) + (kind === 'i' ? k : k - 4) * 0.12;
    const iy = G.I.y + 98 + k * 9;
    mover(tp, [[tLoad + k * 0.05, G.I.x + 22, iy + 30, { s: 0.6, a: 0 }], [tLoad + k * 0.05 + 0.3, G.I.x + 22, iy, { s: 0.6 }], [t0, G.I.x + 22, iy, { s: 0.6 }], [t0 + 0.3, G.I.x + 22, 128, { s: 0.8 }], [t0 + 0.9, x, 128, { s: 0.9, r: r / 2 }], [t0 + 1.25, x, y, { r }]]);
    if (k % 2 === 0) sfx('tick', t0 + 1.2, { g: 0.45, p: 0.5 });
  });
  sfx('drive', tSteps, { g: 0.5, p: -0.6 }); sfx('drive', tNums, { g: 0.5, p: -0.6 });
  const tSame = Q(T('a4', '同'));
  const ringM = pencilRing(ov, G.M.x, G.M.y, G.M.w, G.M.h, tSame, 0.55); sfx('tick', tSame, { g: 0.7, p: 0.4 });
  to(ringM, s.end - 0.6, { autoAlpha: 0, duration: 0.4 });
  // 镜头：全程不动，内容在原地替换
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
});
