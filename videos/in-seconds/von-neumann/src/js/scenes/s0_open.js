// 开场：同一块芯片算账、打游戏，怎么做到的（o1–o2）→ 一张蓝图，停顿，片名（o3–o4）
// → ENIAC：一道题的步骤是接出来的，换题要拔了重插好几天（p1–p2）→ 1945 年的报告（a1）→ 核心三样（a2）
// → 步骤不再靠接线，变成纸带存进存储器（a3）。末态即下一场的初态。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);

  // ── 1. 芯片与它驱动的屏幕 ──
  const chip = h('div', 'abs', world); px(chip, 0, 0, 1920, 968);
  const cs = overlay(chip);
  const CX = 960, CY = 640, CS = 280;
  const body = svg('rect', { x: CX - CS / 2, y: CY - CS / 2, width: CS, height: CS, fill: '#f6efdc', stroke: C.ink, 'stroke-width': 4 }, cs);
  const pins = [];
  for (let k = 0; k < 8; k++) {
    const o = -CS / 2 + 35 + k * 30;
    for (const [x1, y1, x2, y2] of [[CX + o, CY - CS / 2, CX + o, CY - CS / 2 - 24], [CX + o, CY + CS / 2, CX + o, CY + CS / 2 + 24], [CX - CS / 2, CY + o, CX - CS / 2 - 24, CY + o], [CX + CS / 2, CY + o, CX + CS / 2 + 24, CY + o]])
      pins.push(path(cs, `M${x1},${y1} L${x2},${y2}`, 'ink', { w: 4, arrow: false }));
  }
  const rnd = seeded(1945), traces = [];
  for (let k = 0; k < 12; k++) {
    let x = CX - 110 + rnd() * 220, y = CY - 110 + rnd() * 220, d = `M${x.toFixed(0)},${y.toFixed(0)}`;
    for (let j = 0; j < 4; j++) { if (j % 2) x = clamp(x + (rnd() - 0.5) * 150, CX - 118, CX + 118); else y = clamp(y + (rnd() - 0.5) * 150, CY - 118, CY + 118); d += ` L${x.toFixed(0)},${y.toFixed(0)}`; }
    traces.push(path(cs, d, 'blue', { w: 4, arrow: false }));
  }
  const lead = path(cs, `M${CX},${CY - CS / 2 - 24} L${CX},400`, 'ink', { w: 3, arrow: false, dashed: '8 8' });
  const scr = h('div', 'sheet', chip); px(scr, 750, 150, 420, 250); scr.dataset.name = '屏幕';
  const ledger = h('div', 'abs', scr, [['收入', '1200'], ['支出', '-350'], ['结余', '850']].map(([a, b], k) => `<div style="display:flex;width:300px;justify-content:space-between;${k === 2 ? 'border-top:3px solid #1c2633' : ''}"><span style="font:700 42px 'Serif SC'">${a}</span><span style="font:600 46px 'Mono'">${b}</span></div>`).join(''));
  px(ledger, 60, 30); css(ledger, { lineHeight: '1.28' }); ledger.dataset.name = '账本';
  const game = h('div', 'abs', scr); px(game, 130, 22, 160, 206); game.dataset.name = '井字棋';
  const gs = svg('svg', { width: 160, height: 206, viewBox: '0 0 200 206' }, game);
  const gLines = ['M67,8 L67,198', 'M133,8 L133,198', 'M8,70 L192,70', 'M8,136 L192,136'].map((d) => svg('path', { d, stroke: C.ink, 'stroke-width': 6, fill: 'none' }, gs));
  const gMarks = [[34, 38, 'x'], [100, 104, 'o'], [166, 104, 'x'], [34, 170, 'o'], [100, 170, 'x']].map(([x, y, k]) => k === 'x'
    ? svg('path', { d: `M${x - 18},${y - 18} L${x + 18},${y + 18} M${x + 18},${y - 18} L${x - 18},${y + 18}`, stroke: C.red, 'stroke-width': 7, fill: 'none' }, gs)
    : svg('circle', { cx: x, cy: y, r: 20, stroke: C.blue, 'stroke-width': 7, fill: 'none' }, gs));
  const chipLab = txt(chip, 'type', tr('芯片', 'CHIP'), CX + CS / 2 + 44, CY - 14); chipLab.style.fontSize = '24px';

  drawIn(body, s.start + 0.02, 0.5);
  pins.forEach((p, k) => drawIn(p, s.start + 0.15 + (k % 8) * 0.025, 0.25));
  drawIn(lead, s.start + 0.45, 0.3); appear(chipLab, s.start + 0.5);
  wipe(scr, s.start + 0.4, { dir: 't', d: 0.45 });
  sfx('drive', s.start + 0.1, { g: 0.5 });
  // 屏幕：先是账本（算账），读到「打游戏」换成井字棋，线一笔笔画出来
  const tGame = Q(T('o1', '打'));
  [...ledger.children].forEach((row, k) => { const t = s.start + 0.7 + k * 0.6; wipe(row, t, { dir: 'l', d: 0.45 }); sfx('tick', t, { g: 0.5, p: 0.2 }); });
  vanish(ledger, tGame);
  gLines.forEach((p, k) => drawIn(p, tGame + k * 0.08, 0.25)); gMarks.forEach((p, k) => drawIn(p, tGame + 0.35 + k * 0.1, 0.2));
  sfx('beep', tGame, { g: 0.5, p: 0.2 });
  // o2：镜头推近芯片，里面的电路画出来，一根都不动；读到「怎么做到的」打一个大问号
  const tIn = T('o2') + 0.05;
  traces.forEach((p, k) => drawIn(p, tIn + 0.5 + k * 0.05, 0.6));
  const ringT = pencilRing(ov, CX - 120, CY - 120, 240, 240, Q(T('o2', '没')), 0.5); sfx('tick', Q(T('o2', '没')), { g: 0.6 });
  const qm = txt(world, 'ttl red', '?', CX - CS / 2 - 230, CY - 170); css(qm, { fontSize: '200px', lineHeight: '1' }); qm.dataset.name = '问号';
  slam(qm, Q(T('o2', '怎么')), { from: 1.5, d: 0.4 }); sfx('thud', Q(T('o2', '怎么')), { g: 0.7 });
  const tOut = Q(Tend('o2') + 0.3);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[tIn, { x: 980, y: 600, z: 1.45 }, 1.0, { g: 0.4 }], [tOut, { x: 960, y: 484, z: 1 }, 0.8, { g: 0.4 }]]);
  Object.assign(cam.st, { x: 960, y: 484, z: 1 });          // 轨迹里的 fromTo 构建时会先写入后段的起点；t=0 那一帧 tl.set 不生效，这里直接放回起点

  // ── 2. 一张蓝图（先描出线框），停顿，片名 ──
  const tCard = Q(T('o3')) + 0.05, tName = Q(T('o4')), tCardOut = Q(Tend('o4') + 0.75);
  const card = h('div', 'abs', root); px(card, 0, 0, 1920, VH);
  css(card, { background: 'linear-gradient(var(--rule) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, var(--rule) 1px, transparent 1px) 0 0 / 40px 40px, var(--paper)' });
  const fig = txt(card, 'type', tr('图 1 · 存储程序计算机', 'FIG. 1 · STORED-PROGRAM COMPUTER'), 124, 212);
  const bov = overlay(card);
  const sketch = [`M1180,330 h240 v150 h-240 Z`, `M1180,520 h240 v150 h-240 Z`, `M1560,300 h240 v400 h-240 Z`, `M1420,490 L1560,490`, `M1420,510 L1560,510`].map((d) => path(bov, d, 'blue', { w: 3, arrow: false }));
  const ttl = txt(card, 'ttl', tr('冯·诺伊曼<br>架构', 'von Neumann<br>Architecture'), 116, 268); css(ttl, { fontSize: '150px', lineHeight: '1.06' });
  const n128 = txt(card, 'mono red', String(TOTAL) + `<span style="font:900 64px 'Serif SC'"> ${tr('秒', 's')}</span>`, 124, 640); css(n128, { font: '700 150px "Mono"', lineHeight: '1' });
  [fig, ttl, n128].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tCard, { dir: 'l', d: 0.5 }); sfx('whoosh', tCard - 0.05, { g: 0.5 });
  appear(fig, tCard + 0.35);
  sketch.forEach((p, k) => drawIn(p, tCard + 0.4 + k * 0.18, 0.5)); sfx('tick', tCard + 0.4, { g: 0.5, p: 0.5 }); sfx('tick', tCard + 0.76, { g: 0.5, p: 0.6 });
  slam(ttl, tName, { from: 1.15, d: 0.45 }); sfx('thud', tName);
  slide(n128, tName + 0.3, { x: -60, d: 0.5 }); sfx('pop', tName + 0.3, { g: 0.6 });
  wipeOut(card, tCardOut, { dir: 'l', d: 0.45 });
  vanish(chip, tCard + 0.6); vanish(ringT, tCard + 0.6); vanish(qm, tCard + 0.6);

  // ── 3. ENIAC：一道题的步骤靠接线；换一道题，拔了重插，日夜交替 ──
  const panel = h('div', 'sheet', world); px(panel, 230, 150, 1460, 650); panel.dataset.name = '接线板';
  const pl = txt(world, 'type', 'ENIAC · 1945', 260, 168);
  const pov = overlay(world);
  const jx = (c) => 310 + c * 86, jy = (r) => 290 + r * 70;
  const jacks = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 15; c++) jacks.push(svg('circle', { cx: jx(c), cy: jy(r), r: 9, fill: '#f6efdc', stroke: C.ink, 'stroke-width': 3 }, pov));
  const cable = (seed, color) => {
    const R = seeded(seed), out = [];
    while (out.length < 14) {
      const a = [Math.floor(R() * 15), Math.floor(R() * 7)], b = [Math.floor(R() * 15), Math.floor(R() * 7)];
      if (a[0] === b[0]) continue;
      const x1 = jx(a[0]), y1 = jy(a[1]), x2 = jx(b[0]), y2 = jy(b[1]), sag = 60 + R() * 110;
      out.push(path(pov, `M${x1},${y1} C${x1},${y1 + sag} ${x2},${y2 + sag} ${x2},${y2}`, color, { w: 6, arrow: false }));
    }
    return out;
  };
  const cabA = cable(11, 'ink'), cabB = cable(29, 'blue');
  const tP = Qf(Tend('o4') + 0.6);
  hide0(pov); appear(pov, tP);
  wipe(panel, tP, { dir: 'b', d: 0.45 }); appear(pl, tP + 0.3); sfx('thud', tP + 0.1, { g: 0.5 });
  jacks.forEach((j) => appear(j, tP));
  // 题目卡：题 A（炮弹轨迹），换题时换成题 B
  const qcard = (label) => { const e = h('div', 'sheet', world); px(e, 1250, 176, 400, 76); const t = h('div', 'abs', e, label); px(t, 22, 12); css(t, { font: '900 40px "Serif SC"' }); e.dataset.name = '题目卡'; return e; };
  const qA = qcard(tr('题 A：算炮弹轨迹', 'Problem A: shell trajectories')), qB = qcard(tr('题 B：另一道题', 'Problem B: another one'));
  const tQ = Q(T('p1', '题')), tSteps = Q(T('p1', '步骤'));
  slide(qA, tQ, { y: -40, d: 0.5, ease: 'power3.out' }); sfx('pop', tQ, { g: 0.6, p: 0.5 });
  cabA.forEach((p, k) => { drawIn(p, tSteps + k * 0.07, 0.55); if (k % 3 === 0) sfx('tick', tSteps + k * 0.07, { g: 0.45, p: -0.5 + k / 14 }); });
  const tSwapQ = Q(T('p2', '换')), tPull = Q(T('p2', '拔掉')), tPlug = Q(T('p2', '重'));
  exit(qA, tSwapQ, { y: -40, d: 0.35 }); slide(qB, tSwapQ + 0.3, { y: -40, d: 0.5, ease: 'power3.out' }); sfx('pop', tSwapQ + 0.3, { g: 0.6, p: 0.5 });
  cabA.forEach((p, k) => { const len = p.getTotalLength(); to(p, tPull + k * 0.025, { strokeDashoffset: len, duration: 0.45, ease: 'power2.in' }); vanish(p, tPull + k * 0.025 + 0.46); });
  sfx('drive', tPull, { g: 0.6 });
  cabB.forEach((p, k) => { drawIn(p, tPlug + 0.2 + k * 0.17, 0.55); if (k % 3 === 0) sfx('tick', tPlug + 0.2 + k * 0.17, { g: 0.45, p: 0.3 }); });
  // 日夜交替：太阳与月牙轮流，表示时间一天天过去
  const sky = h('div', 'abs', world); px(sky, 1120, 178, 72, 72); sky.dataset.name = '日夜';
  const ss = svg('svg', { width: 72, height: 72, viewBox: '0 0 60 60' }, sky);
  const sunG = svg('g', {}, ss), moonG = svg('g', {}, ss);
  svg('circle', { cx: 30, cy: 30, r: 11, fill: 'none', stroke: C.ochre, 'stroke-width': 4 }, sunG);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; svg('path', { d: `M${30 + 17 * Math.cos(a)},${30 + 17 * Math.sin(a)} L${30 + 25 * Math.cos(a)},${30 + 25 * Math.sin(a)}`, stroke: C.ochre, 'stroke-width': 4 }, sunG); }
  svg('path', { d: 'M38,8 A22,22 0 1,0 52,40 A17,17 0 1,1 38,8 Z', fill: C.blue }, moonG);
  const tGone = Q(T('a1')) - 0.2;
  const days = []; for (let t = tPlug + 0.2; t < tGone - 0.3; t += 0.42) days.push(t);
  F((t) => { let v = ''; days.forEach((a, k) => { if (t >= a) v = k % 2 ? 'm' : 's'; }); if (t >= tGone) v = ''; sunG.style.display = v === 's' ? '' : 'none'; moonG.style.display = v === 'm' ? '' : 'none'; });
  days.forEach((a) => sfx('tick', a, { g: 0.3, p: 0.6 }));
  hide0(sky); appear(sky, tPlug); vanish(sky, tGone);
  [panel, pl, qB].forEach((e) => exit(e, tGone, { y: 40, d: 0.35 }));
  to(pov, tGone, { autoAlpha: 0, duration: 0.3 });

  // ── 4. 1945 年的报告：打字机把封面打完，停一下，再缩到角上当出处 ──
  const cover = h('div', 'sheet', world); px(cover, 0, 0, 720, 600); cover.dataset.name = 'EDVAC 报告封面';
  const cl = ['FIRST DRAFT OF A REPORT', 'ON THE EDVAC', '', 'BY JOHN VON NEUMANN', '', 'MOORE SCHOOL OF ELECTRICAL ENGINEERING', 'UNIVERSITY OF PENNSYLVANIA', 'JUNE 30, 1945'];
  const ct = h('div', 'abs', cover); px(ct, 0, 46, 720); css(ct, { font: '500 28px "Mono"', textAlign: 'center', letterSpacing: '.06em' });
  const lines = cl.map((l) => { const d = h('div', '', ct); d.style.height = (l ? 46 : 22) + 'px'; return d; });
  const cz = txt(cover, 't-n', tr('《EDVAC 报告初稿》<br>冯·诺伊曼　1945 年 6 月 30 日', ''), 0, 440); css(cz, { width: '720px', textAlign: 'center', color: 'var(--soft)', whiteSpace: 'normal' });
  const tA1 = Q(T('a1')), tShrink = Q(T('a2')) + 0.1;
  mover(cover, [[tA1, 600, 230, { a: 0 }], [tA1 + 0.5, 600, 170], [tShrink, 600, 170], [tShrink + 0.5, 600, 260, { a: 0 }]], tShrink + 0.5);
  sfx('pop', tA1, { g: 0.6 });
  const y45 = txt(world, 'mono red', '1945', 1360, 210); css(y45, { font: '700 96px "Mono"' });
  slam(y45, Q(T('a1', '1945')) + 0.05, { from: 1.3, d: 0.35 }); sfx('thud', Q(T('a1', '1945')) + 0.05, { g: 0.6 });
  let tt = tA1 + 0.4;
  cl.forEach((l, k) => { if (l) tt = typeText(lines[k], l, tt, 52, { cursor: false, sfxGain: 0.45 }) + 0.06; });
  hide0(cz); wipe(cz, tt + 0.1, { dir: 'l', d: 0.45 });
  exit(y45, tShrink, { x: 80, d: 0.3 });
  const src = txt(world, 'type', tr('出处：EDVAC 报告初稿 · 1945', 'SOURCE: FIRST DRAFT · 1945'), 280, 836); src.style.fontSize = '24px';
  hide0(src); appear(src, tShrink + 0.5); hide(src, Q(Tend('a3') + 0.4), { d: 0.4 });

  // ── 5. 核心三样：讲到哪个部件，哪个部件画出来 ──
  const M = machine(world, {});
  const inner = [M.CC, M.CA, M.M, M.busLabel, M.slot, M.wheel, ...M.steps, M.ops, M.acc, M.expr, M.pc, ...M.rows.map((r) => r.el)];
  inner.forEach(hide0); M.bus.forEach(hide0);
  const tCC = Q(T('a2', '控制器')), tCA = Q(T('a2', '运算器')), tM = Q(T('a2', '存储'));
  wipe(M.CC, tCC, { dir: 'l', d: 0.5 }); sfx('thud', tCC, { g: 0.6, p: -0.4 });
  wipe(M.slot, tCC + 0.3, { dir: 'l', d: 0.4 });
  const tWheel = Q(T('a2', '指挥'));
  appear(M.wheel, tWheel); M.steps.forEach((e, k) => slam(e, tWheel + k * 0.12, { from: 0.5, d: 0.3 })); [0, 1, 2].forEach((k) => sfx('pop', tWheel + k * 0.12, { g: 0.45, p: -0.1 }));
  wipe(M.CA, tCA, { dir: 'l', d: 0.5 }); sfx('thud', tCA, { g: 0.6, p: -0.4 });
  M.ops.textContent = ''; appear(M.ops, Q(T('a2', '算数'))); typeText(M.ops, '+ − × ÷', Q(T('a2', '算数')), 14, { cursor: false, sfxGain: 0.4 });
  slam(M.acc, Q(T('a2', '算数')) + 0.3, { from: 1.3, d: 0.35 });
  wipe(M.M, tM, { dir: 'l', d: 0.5 }); sfx('thud', tM, { g: 0.6, p: 0.4 });
  const tBus = Q(T('a2', '东西'));
  M.bus.forEach((p) => drawIn(p, tBus, 0.6)); appear(M.busLabel, tBus + 0.5); sfx('tick', tBus, { g: 0.5 });
  // 讲到的部件框一圈红线
  const hl = (g, t0, t1) => { const r = frameBox(world, g.x - 8, g.y - 8, g.w + 16, g.h + 16); hide0(r); appear(r, t0); vanish(r, t1); };
  hl(G.CC, tCC, tCA - 0.05); hl(G.CA, tCA, tM - 0.05); hl(G.M, tM, Q(Tend('a2') + 0.3));

  // ── 6. 关键一步：几根接线（步骤）被划掉，拉直变成蓝纸带，和赭色的数一起送进存储器 ──
  const tCab = Q(T('a3', '步骤')), tX = Q(T('a3', '接线')), tStore = Q(T('a3', '存进'));
  const cov2 = overlay(world);
  const curls = [0, 1, 2, 3].map((k) => { const y = 70 + k * 22; return path(cov2, `M770,${y} C820,${y - 30} 860,${y + 34} 910,${y} S1000,${y - 30} 1050,${y}`, 'blue', { w: 5, arrow: false }); });
  curls.forEach((p, k) => drawIn(p, tCab + k * 0.08, 0.45)); sfx('tick', tCab, { g: 0.5 });
  const strike = path(cov2, 'M760,150 L1060,56', 'red', { w: 6, arrow: false }); drawIn(strike, tX, 0.3); sfx('tick', tX, { g: 0.6 });
  curls.forEach((p) => to(p, tStore, { opacity: 0, duration: 0.3 })); to(strike, tStore, { opacity: 0, duration: 0.3 });
  PILE.forEach(([kind, x, y, r], k) => {
    const isI = kind === 'i', j = isI ? k : k - 4;
    const tp = tape(world, isI ? PROG.calc[j][0] : DATA[j][0], kind);
    let tLand;
    if (isI) {                                             // 从接线的位置变出来，落进存储器
      const t0 = tStore + j * 0.12; tLand = t0 + 1.1;
      mover(tp, [[t0, 790 + j * 50, 64 + j * 22, { s: 0.7, a: 0 }], [t0 + 0.3, 790 + j * 50, 64 + j * 22, { s: 0.7 }], [tLand, x, y, { r }]]);
    } else {                                               // 要算的数从上方落进来
      const t0 = tStore + 0.6 + j * 0.12; tLand = t0 + 0.8;
      mover(tp, [[t0, x, 40, { s: 0.8, a: 0 }], [tLand, x, y, { r }]]);
    }
    if (k % 2 === 0) sfx('tick', tLand, { g: 0.4, p: 0.5 });
  });
  sfx('drive', tStore, { g: 0.55 });
  const ringM = pencilRing(ov, G.M.x, G.M.y, G.M.w, G.M.h, Q(T('a3', '存储器')) + 0.2, 0.55); sfx('tick', Q(T('a3', '存储器')) + 0.2, { g: 0.6, p: 0.4 });
  to(ringM, s.end - 0.5, { autoAlpha: 0, duration: 0.4 });
  cam.cut(s.end - 0.01, { x: 960, y: 484, z: 1 });
});

// 开场时纸带落进存储器后堆放的位置（下一场从这里接着整理）：[种类, x, y, 旋转]
const PILE = [['i', 1130, 240, -4], ['i', 1360, 262, 5], ['i', 1150, 342, 3], ['i', 1370, 374, -6],
  ['d', 1120, 500, 6], ['d', 1350, 530, -3], ['d', 1150, 622, -5], ['d', 1370, 652, 4], ['d', 1250, 742, -2]];
