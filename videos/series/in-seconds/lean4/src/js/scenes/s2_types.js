// 第 3 场（64–96 秒）：命题是类型，证明是值，检查证明就是检查类型 → 归纳法：先证 0，再证 k ⇒ k + 1（多出的一圈是 2k + 1）→ 两步覆盖无穷多个 n。
// 站 A：接着上一场的代码（同样的位置），把「证明 : 命题」对到「值 : 类型」；站 B：一个假命题配上 rfl，Lean 报类型不符（DATA.wrong）；
// 站 C：证明一行一行敲出来，右边是 Lean 每一步给出的目标（DATA.goals），左下是 k² 加一圈；最后方点阵一圈一圈铺满全屏。
scene('types', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const E = window.FORMAL_END, XB = 2300, XC = 4600, SZ = E.SZ, LH = E.LH, CW = SZ * 0.6;
  console.assert(DATA.wrong[4].endsWith('error: Type mismatch') && DATA.first[3] === 9 && DATA.goals.length === 3, 'types: 取证数据与画面不符');

  // ───────── 站 A：命题是类型，证明是值 ─────────
  const LX = E.lx, LY0 = E.ly, src = [...DATA.src.def, '', E.thm];
  const lines = codeLines(world, src, { x: LX, y: LY0, size: SZ, lh: LH });
  lines.slice(0, 3).forEach((e) => classAt(e, 'dim', s.start + 0.05));
  const px0 = LX + E.thm.indexOf(E.stmt) * CW;
  blk(world, 'bg-ac', px0, LY0 + 4 * LH + 64, E.stmt.length * CW, 8);
  // 两行大字，冒号对齐：上一行是数学里的说法，下一行是 Lean 里的说法
  const COLX = tr(640, 760), RX = COLX + 110, R1 = 604, R2 = 762, big = 't-1';
  const tProp = Q(T('t1', { zh: '命题', en: 'proposition' })), tType = Q(T('t1', { zh: '类型', en: 'type' })), tProof = Q(T('t2', { zh: '证明', en: 'proof' })), tVal = Q(T('t2', { zh: '值', en: 'value' }));
  const wProp = txt(world, big, tr('命题', 'proposition'), RX, R1), wType = txt(world, big + ' ac', tr('类型', 'type'), RX, R2);
  const wProof = txt(world, big, tr('证明', 'proof'), 0, R1), wVal = txt(world, big + ' ac', tr('值', 'value'), 0, R2);
  for (const e of [wProof, wVal]) css(e, { width: (COLX - 40) + 'px', textAlign: 'right' });
  for (const e of [wProp, wType, wProof, wVal]) e.style.fontSize = '144px';
  const col1 = txt(world, 'num dim', ':', COLX, R1 - 6), col2 = txt(world, 'num dim', ':', COLX, R2 - 6); for (const e of [col1, col2]) e.style.fontSize = '144px';
  // 占位：左边两个空框，说到证明与值再填实
  const phW = tr(330, 500), ph1 = blk(world, '', COLX - 40 - phW, R1 + 14, phW, 122), ph2 = blk(world, '', COLX - 40 - phW, R2 + 14, phW, 122);
  for (const e of [ph1, ph2]) { css(e, { border: `6px solid ${C.dim}` }); e.dataset.name = 'placeholder'; }
  appear(ph1, tProp - 0.1); appear(ph2, tType - 0.1); vanish(ph1, tProof); vanish(ph2, tVal);
  appear(col1, tProp - 0.1); appear(col2, tType - 0.1);
  slide(wProp, tProp, { x: 70, d: 0.3, ease: 'power3.out' }); sfx('pop', tProp, { g: 0.8, p: 0.1 });
  slam(wType, tType, { from: 1.35, d: 0.3 }); sfx('thud', tType, { g: 0.8, p: 0.1 });
  slide(wProof, tProof, { x: -70, d: 0.3, ease: 'power3.out' }); sfx('pop', tProof, { g: 0.8, p: -0.3 });
  slam(wVal, tVal, { from: 1.35, d: 0.3 }); sfx('thud', tVal, { g: 0.8, p: -0.3 });

  // ───────── 站 B：检查证明，就是检查类型 ─────────
  const tB = Tend('t2') + 0.1, tErr = Q(T('t3', { zh: '类型', en: 'type' })) - 0.25;
  const wl = h('div', 'ln', world); px(wl, XB + 120, 200); wl.style.fontSize = SZ + 'px';
  appear(wl, tB + 0.25); typeText(wl, leanHtml(DATA.src.wrong[0]), tB + 0.25, 64, { cursorUntil: tB + 0.9 });
  const wsrc = DATA.src.wrong[0], iT = wsrc.indexOf('sumOdd 3 = 10'), iV = wsrc.lastIndexOf('rfl');
  const uT = blk(world, 'bg-paper', XB + 120 + iT * CW, 200 + 64, 13 * CW, 6), uV = blk(world, 'bg-paper', XB + 120 + iV * CW, 200 + 64, 3 * CW, 6);
  const lT = txt(world, 't-n ac', tr('类型', 'type'), XB + 120 + iT * CW, 280), lV = txt(world, 't-n ac', tr('值', 'value'), XB + 120 + iV * CW, 280);
  [[uT, lT, 1.0], [uV, lV, 1.12]].forEach(([u, l, d]) => { fromTo(u, tB + d, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out' }); wipe(l, tB + d + 0.1, { dir: 'l', d: 0.25 }); });
  sfx('tick', tB + 1.0, { g: 0.7 }); sfx('tick', tB + 1.12, { g: 0.7, p: 0.3 });
  // 实际上前 3 个奇数的和是 9：九个方点，第十个是空的
  const nine = dotSquare(world, 3, { x: XB + 1260, y: 396, pitch: 104, cell: 92 }); wipe(nine.el, tB + 0.5, { dir: 't', d: 0.4 });
  const tenth = blk(world, '', XB + 1260 + 3 * 104, 396 + 2 * 104, 92, 92); css(tenth, { border: `6px solid ${C.ac}` }); tenth.dataset.name = 'missing-tenth'; appear(tenth, tErr);
  const nl = txt(world, 'mono t-n dim', `sumOdd 3 = ${DATA.first[3]}`, XB + 1260, 724); nl.style.fontSize = '38px'; wipe(nl, tB + 0.7, { dir: 'l', d: 0.3 });
  // Lean 的回显：整块出现
  const err = DATA.wrong.slice(4).map(stripLoc);
  const eb = txt(world, 'mono ink bg-ac', esc(err[0]), XB + 120, 396); css(eb, { fontSize: '56px', fontWeight: 800, padding: '6px 22px 12px' });
  const el = outLines(world, err.slice(1), { x: XB + 142, y: 508, size: 44, lh: 68 });
  el.forEach((e, i) => { if (i % 2 === 1) e.classList.add('dim'); });
  slam(eb, tErr, { from: 1.15, d: 0.25 }); el.forEach((e, i) => appear(e, tErr + 0.08 + i * 0.05)); sfx('error', tErr, { p: -0.2 });
  const strike = blk(world, 'bg-ac', XB + 120 + iV * CW - 8, 200 + 24, 3 * CW + 16, 10); fromTo(strike, tErr + 0.1, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.2, ease: 'power3.out' });

  // ───────── 站 C：归纳法 ─────────
  const tC = Tend('t3') + 0.05, S2 = 44, W2 = S2 * 0.6, PY = (i) => 140 + i * 66, P = DATA.src.proof;
  const tInd = Q(T('t4', { zh: '归纳', en: 'induction' })), tZero = Q(T('t4', { zh: '先', en: 'first' })), tSucc = Q(T('t5')), tRw = Q(T('t6')) - 0.25, tGrind = Q(Tend('t6')) - 0.25;
  const tFin = Q(T('t7'));
  const pl = P.map((ln, i) => { const e = h('div', 'ln', world, i === 0 ? leanHtml(ln) : ''); px(e, XC + 120, PY(i)); e.style.fontSize = S2 + 'px'; return e; });
  const typeAt = (i, t, cps = 44) => { appear(pl[i], t); return typeText(pl[i], leanHtml(P[i]), t, cps, { cursorUntil: t + P[i].length / cps + 0.25 }); };
  typeAt(1, tInd); const tZ1 = typeAt(2, tZero); typeAt(3, tSucc); const tR1 = typeAt(4, tRw), tG1 = typeAt(5, tGrind);
  // 右侧：Lean 每一步给出的目标
  const GX = XC + 990, GS = 38, gh = txt(world, 't-n dim', tr('Lean 此刻要证的目标', 'The goal Lean reports'), GX, 232);
  wipe(gh, tC + 0.5, { dir: 'l', d: 0.3 });
  const goal = (g, t0, t1, y) => { const e = h('div', 'out', world, TS + ' ' + esc(g)); px(e, GX, y); e.style.fontSize = GS + 'px'; appear(e, t0); if (t1) vanish(e, t1); return e; };
  const hyp = (hy, t0, y) => { const e = h('div', 'out dim', world, esc(hy)); px(e, GX, y); e.style.fontSize = GS + 'px'; appear(e, t0); return e; };
  const g0 = goal(DATA.goals[0].goal, tInd + 0.5, tSucc, 290); sfx('blip', tInd + 0.5, { g: 0.7, p: 0.4 });
  const tk0 = tickBlock(world, GX + 500, 284, 56); slam(tk0, tZ1 + 0.1, { from: 1.6, d: 0.2 }); vanish(tk0, tSucc); sfx('pop', tZ1 + 0.1, { g: 0.75, p: 0.5 });
  DATA.goals[1].hyps.forEach((hy, i) => hyp(hy, tSucc + 0.1 + i * 0.06, 290 + i * 54));
  goal(DATA.goals[1].goal, tSucc + 0.25, tR1, 398); sfx('blip', tSucc + 0.25, { g: 0.7, p: 0.4 });
  goal(DATA.goals[2].goal, tR1, 0, 398); sfx('blip', tR1, { g: 0.7, p: 0.4 });
  const tk1 = tickBlock(world, GX, 462, 56); slam(tk1, tG1 + 0.15, { from: 1.6, d: 0.2 }); sfx('chime', tG1 + 0.15, { g: 0.7, p: 0.4 });
  // n = 0：没有方点，和是 0，0² 也是 0（DATA.first[0]）
  console.assert(DATA.first[0] === 0, 'types: sumOdd 0 应当是 0');
  const z0 = txt(world, 'num', `sumOdd 0 = ${DATA.first[0]} = 0<sup>2</sup>`, XC + 150, 640); css(z0, { fontSize: '104px', letterSpacing: '-.03em' });
  const z1 = txt(world, 't-n dim', tr('n = 0：一个方点也没有', 'n = 0: no dots at all'), XC + 156, 770);
  slide(z0, tZero - 0.1, { x: -60, d: 0.35, ease: 'power3.out' }); wipe(z1, tZero + 0.25, { dir: 'l', d: 0.3 });
  wipeOut(z0, tSucc + 0.1, { dir: 'l', d: 0.25 }); wipeOut(z1, tSucc + 0.05, { dir: 'l', d: 0.2 });
  // 左下：k² 个方点，再加一圈 2k + 1
  const QX = 150, QY = 560, QP = 56, K = 5, pic = dotSquare(world, K + 1, { x: XC + QX, y: QY, pitch: QP, cell: QP * 124 / 140 });
  const tK = Q(T('t5', { zh: 'k', en: 'for k' })), tK1 = Q(T('t5', { zh: '加', en: 'plus' })) - 0.25, tRing = Q(T('t6', { zh: '圈', en: 'ring' })) - 0.25;
  pic.rings.slice(0, K).forEach((g, r) => appear(g, tK + r * 0.04));
  [...pic.rings[K].children].forEach((c, j) => appear(c, tRing + j * 0.03)); classAt(pic.rings[K], 'hot', tRing, tFin);
  const ol = svg('svg', { class: 'abs', width: 336, height: 336, viewBox: '0 0 336 336' }, world); px(ol, XC + QX, QY); ol.dataset.name = 'ring-placeholder';
  for (const [c, r] of ringCells(K)) svg('rect', { x: c * QP + 2, y: r * QP + 2, width: QP * 124 / 140 - 4, height: QP * 124 / 140 - 4, fill: 'none', stroke: C.dim, 'stroke-width': 4 }, ol);
  appear(ol, tK1); vanish(ol, tRing + 0.33);
  const k2 = txt(world, 'num ink', 'k<sup>2</sup>', XC + QX + 70, QY + 74); k2.style.fontSize = '116px'; k2.dataset.overlapOk = '1';
  slam(k2, tK + 0.2, { from: 1.4, d: 0.3 }); sfx('pop', tK, { g: 0.8, p: -0.5 }); sfx('tick', tK1, { g: 0.7, p: -0.4 });
  const idn = txt(world, 'num', 'k<sup>2</sup> + <span class="ac">(2k + 1)</span> = (k + 1)<sup>2</sup>', XC + 560, QY + 76); css(idn, { fontSize: '72px', letterSpacing: '-.02em' });
  const tExact = Q(T('t6', { zh: '正好', en: 'exactly' }));
  wipe(idn, tExact, { dir: 'l', d: 0.45 }); sfx('thud', tRing, { g: 0.8, p: -0.4 }); sfx('pop', tExact, { g: 0.7, p: 0.1 });
  const rl = txt(world, 't-n dim', tr('多出的一圈：右边一列 k + 1 个，下边一行 k 个', 'The extra ring: k + 1 down the side, k along the bottom'), XC + 564, QY + 186);
  wipe(rl, tExact + 0.4, { dir: 'l', d: 0.4 });

  // ───────── 收束：同一步反复用下去，方点阵一圈一圈铺满全屏 ─────────
  const fin = h('div', 'abs', root); px(fin, 0, 0, 1920, VH); css(fin, { overflow: 'hidden' });
  const SF = 2300, lat = lattice(fin, { x: 0, y: 0, max: SF, name: 'lattice-all', back: true, line: C.dim, lineW: 3, fine: 16, dec: { max: 16, color: () => C.ac, label: null } });
  const tau = (t) => t - tFin, grow = (t) => ease.io3(clamp((tau(t) - 0.35) / 1.7));
  const Vf = (t) => Math.pow(10, Math.log10(K + 1) + 1.15 * Math.max(0, tau(t) - 0.6 * (1 - Math.exp(-2.2 * tau(t)))));
  const geo = (t) => { const g = grow(t); return { x: lerp(QX, -70, g), y: lerp(QY, -70, g), S: expo((K + 1) * QP, SF, g) }; };
  appear(fin, tFin);
  for (const e of [pic.el, k2, ol]) vanish(e, tFin + 0.02);
  F((t) => {
    if (t < tFin - 0.05) return;
    const g = geo(t);
    lat.el.style.left = (g.x - 10).toFixed(2) + 'px'; lat.el.style.top = (g.y - 50).toFixed(2) + 'px';
    lat.draw(Vf(t), g.S, g.S, tau(t) > 0.3);
  });
  const tAll = Q(T('t7', { zh: '全部', en: 'covered' })) - 0.25;
  const fa = txt(fin, 'num ink', '∀ n', 104, 150); css(fa, { fontSize: '400px', letterSpacing: '-.04em' }); fa.dataset.overlapOk = '1';
  const fs = h('div', 'ln ink', fin, esc(E.stmt)); px(fs, 128, 640); css(fs, { fontSize: '96px', fontWeight: 800 }); fs.dataset.overlapOk = '1';
  const ft = tickBlock(fin, 128 + E.stmt.length * 57.6 + 50, 648, 104);
  const fb = blk(fin, 'bg-paper', 80, 130, 1000, 470), fb2 = blk(fin, 'bg-paper', 80, 620, E.stmt.length * 57.6 + 250, 150);
  fin.insertBefore(fb, fa); fin.insertBefore(fb2, fa);                                    // 大字底下垫一块纸色，格线不从字上穿过
  appear(fb, tAll); appear(fb2, tAll + 0.3);
  slam(fa, tAll, { from: 1.25, d: 0.4 }); sfx('thud', tAll, { g: 1 });
  wipe(fs, tAll + 0.3, { dir: 'l', d: 0.45 }); slam(ft, tAll + 0.75, { from: 1.6, d: 0.25 }); sfx('chime', tAll + 0.75, { g: 0.8 });
  sfx('riser', tFin - 0.2, { g: 0.8 }); sfx('whoosh', tFin + 0.35, { g: 0.9 });
  for (let i = 0; i < 6; i++) sfx('tick', tFin + 0.2 + i * 0.125, { g: 0.5 + i * 0.05, p: -0.4 + i * 0.1 });
  // 每隔两道十进刻度线，一声轻的滴答：视野又放大了一百倍
  { let k = 3; for (let t = tFin + 2.4; t < s.end - 1.4; t += 0.05) if (Vf(t) >= Math.pow(10, k)) { sfx('tick', +t.toFixed(2), { g: 0.45, p: 0.5 - (k % 4) * 0.3 }); k += 2; } }
  sfx('riser', s.end - 1.25, { g: 0.8 });
  // 常驻元素的字色：纸色的正方形盖到角上之后换成墨色
  const covers = (px1, py1, px2) => { for (let t = tFin; t < tFin + 3; t += 0.02) { const g = geo(t); if (g.x <= px1 && g.y <= py1 && g.x + g.S >= px2) return t; } return tFin + 3; };
  vanish(world, covers(0, 0, 1920) + 0.3);
  hudGround('L', covers(64, 40, 220), s.end + WIPE - 0.05, 'paper'); hudGround('R', covers(1516, 40, 1870), s.end + 0.12, 'paper');

  // ───────── 镜头 ─────────
  cam.track(s.start, { x: 960 + E.dx, y: 484, z: E.z }, [
    drift(s.start + WIPE, tB - 0.03, { x: 960, z: 1 }),
    [tB, { x: XB + 960 }, 0.9],
    drift(tB + 0.95, tC - 0.03, { x: XB + 985, z: 1.02 }),
    [tC, { x: XC + 935, z: 1.02 }, 0.9],
    drift(tC + 0.95, tFin, { x: XC + 960, z: 1 }),
  ]);
});
