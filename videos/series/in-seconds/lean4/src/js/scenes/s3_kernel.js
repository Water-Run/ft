// 第 4 场（96–128 秒）：策略不是证明本身 → Lean 生成证明项（按树展开 DATA.term.tree 个节点）→ 内核逐个节点核对类型
// → 内核只有约八千行（DATA.size）→ 策略、自动化、AI 都在内核之外，错的证明项过不了内核（DATA.kernel）→ 三者的分工。
// 站 A（纸）：六行证明，后五行是策略；站 B（墨）：证明项的原文与它的节点，一行朱红的线从上扫到下；
// 站 C（墨）：按行数的比例画的两个正方形；站 D（墨）：人、Lean、内核三者排成一行。
scene('kernel', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const XB = 2300, XC = XB + 2100, YD = 1100, P = DATA.src.proof, TREE = DATA.term.tree, KL = DATA.size.kernel.lines, RL = DATA.size.rest.lines;
  console.assert(TREE === 3347 && KL === 8071 && DATA.kernel[0].includes('(kernel) declaration type mismatch') && P.length === 6, 'kernel: 取证数据与画面不符');

  // ───────── 站 A：这几行叫策略 ─────────
  blk(world, 'bg-paper', -600, -600, 2680, 2200);
  const SZ = 48, LH = 78, LX = 170, LY = 196;
  const pl = codeLines(world, P, { x: LX, y: LY, size: SZ, lh: LH, cls: 'ink' });
  const tTac = Q(T('c1', { zh: '策略', en: 'tactics' }));
  const br = blk(world, 'bg-ac', LX - 44, LY + LH + 2, 12, 5 * LH - 22); fromTo(br, tTac - 0.25, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.35, ease: 'power3.out' });
  const tl1 = txt(world, 't-1 ink', tr('策略', 'tactics'), 1040, 420); slam(tl1, tTac, { from: 1.25, d: 0.35 }); sfx('thud', tTac, { p: 0.2 });
  const tl2 = txt(world, 't-4 dimp', tr('写给 Lean 的做法', 'Instructions for Lean'), 1048, 610); wipe(tl2, tTac + 0.3, { dir: 'l', d: 0.35 });
  const tNot = Q(T('c1', { zh: '不是', en: 'not' }));
  const tl3 = txt(world, 't-4 ink', tr('还不是证明本身', 'Not yet the proof itself'), 1048, 676); wipe(tl3, tNot, { dir: 'l', d: 0.35 }); sfx('tick', tNot, { g: 0.8, p: 0.3 });

  // ───────── 站 B：证明项 ─────────
  const tAB = Tend('c1') + 0.08, tTerm = tAB + 0.5, tExp = Q(T('c2', { zh: '展开', en: 'over' })) - 0.25;
  const head = txt(world, 't-3', tr('证明项', 'Proof term'), XB + 270, 46); wipe(head, tAB + 0.45, { dir: 'l', d: 0.3 });
  const clip = h('div', 'abs', world); px(clip, XB + 112, 150, 1230, 260); css(clip, { overflow: 'hidden' });
  const tls = outLines(clip, DATA.term.lines, { x: 0, y: 0, size: 28, lh: 36 });
  tls.forEach((e, i) => { e.dataset.bleed = '1'; appear(e, tTerm + i * 0.05); if (i % 2 === 0) sfx('blip', tTerm + i * 0.05, { g: 0.5, p: -0.3 }); });
  // 节点：一个节点一个方点，104 列。先是暗的（还没查），内核扫过之后变亮
  const COLS = 104, ROWS = Math.ceil(TREE / COLS), DP = 15, DC = 11, FX = XB + 112, FY = 426;
  const dotsPath = (n) => { let d = ''; for (let i = 0; i < n; i++) d += `M${(i % COLS) * DP},${Math.floor(i / COLS) * DP}h${DC}v${DC}h${-DC}z`; return d; };
  const fld = svg('svg', { class: 'abs', width: COLS * DP, height: ROWS * DP, viewBox: `0 0 ${COLS * DP} ${ROWS * DP}` }, world); px(fld, FX, FY); fld.dataset.name = 'term-nodes';
  svg('path', { d: dotsPath(TREE), fill: C.dimp }, fld);
  const lit = svg('path', { d: dotsPath(TREE), fill: C.paper }, fld), cp = svg('clipPath', { id: 'kn-clip' }, fld), cr1 = svg('rect', { x: 0, y: 0, width: COLS * DP, height: 0 }, cp), cr2 = svg('rect', { x: 0, y: 0, width: 0, height: DP }, cp);
  lit.setAttribute('clip-path', 'url(#kn-clip)');
  wipe(fld, tExp, { dir: 't', d: 0.9, ease: 'power2.out' }); sfx('whoosh', tExp, { g: 0.7 });
  const cnt = txt(world, 'num', '', XB + 1400, 150); css(cnt, { fontSize: '128px', letterSpacing: '-.04em' });
  countTo(cnt, 0, TREE, tExp, 0.9, (v) => group3(Math.round(v))); appear(cnt, tExp);
  const cl1 = txt(world, 't-4', tr('个节点', 'nodes'), XB + 1408, 290), cl2 = txt(world, 't-n dim', tr(`按树展开 · 不同的子项 ${DATA.term.dag} 个`, `As a tree · ${DATA.term.dag} distinct subterms`), XB + 1408, 350); cl2.style.fontSize = '28px';
  wipe(cl1, tExp + 0.5, { dir: 'l', d: 0.3 }); wipe(cl2, tExp + 0.75, { dir: 'l', d: 0.3 }); sfx('thud', tExp + 0.9, { g: 0.8, p: 0.4 });
  // 内核：一个朱红的方块，带着一道线自上而下扫过全部节点
  const tK = Q(T('c3', { zh: '内核', en: 'kernel' })), tScan0 = Q(T('c3', { zh: '逐个', en: 'checks' })), tScan1 = Tend('c3') + 0.7;
  const scanK = (t) => clamp((t - tScan0) / (tScan1 - tScan0));
  const bar = blk(world, 'bg-ac', FX - 8, FY, COLS * DP + 16, 6);
  const KS = 90, kq = blk(world, 'bg-ac', FX + COLS * DP + 22, FY, KS, KS); kq.dataset.name = 'kernel';
  const kql = txt(kq, 't-n ink', tr('内核', 'kernel'), 0, 24); css(kql, { width: KS + 'px', textAlign: 'center', fontSize: tr('30px', '24px'), fontWeight: 800 });
  slam(kq, tK, { from: 1.6, d: 0.3 }); sfx('thud', tK, { p: 0.5 }); appear(bar, tScan0); vanish(bar, tScan1 + 0.05);
  // 方块的位置：先随扫描线下行，再跟着镜头去下一站，停在大正方形的左下角
  const SCL = 0.8, kSide = Math.sqrt(KL * SCL), rSide = Math.sqrt(RL * SCL), BX = XC + 1010, BY = 130, KX = BX - kSide - 40, KY = BY + rSide - kSide;
  const tBC = tScan1 + 0.1, mv = (t) => ease.io3(clamp((t - tBC) / 0.9));
  let lastRow = -1;
  F((t) => {
    const k = scanK(t), n = Math.floor(k * TREE + 1e-6), row = Math.floor(n / COLS), m = mv(t);
    if (n !== lastRow) { cr1.setAttribute('height', row * DP); cr2.setAttribute('y', row * DP); cr2.setAttribute('width', (n % COLS) * DP); lastRow = n; }
    const y = FY + Math.min(ROWS * DP - 6, k * ROWS * DP);
    bar.style.top = y.toFixed(1) + 'px';
    const x0 = FX + COLS * DP + 22, y0 = clamp(y - KS / 2 + 3, FY, FY + ROWS * DP - KS), sz = lerp(KS, kSide, m);
    kq.style.left = lerp(x0, KX, m).toFixed(1) + 'px'; kq.style.top = lerp(y0, KY, m).toFixed(1) + 'px'; kq.style.width = sz.toFixed(1) + 'px'; kq.style.height = sz.toFixed(1) + 'px';
  });
  for (let i = 0; i < 10; i++) sfx('tick', tScan0 + (tScan1 - tScan0) * i / 10, { g: 0.5, p: 0.4 });
  const done = tickBlock(world, XB + 1408 + tr(190, 220), 286, 60); slam(done, tScan1, { from: 1.6, d: 0.25 }); sfx('chime', tScan1, { g: 0.8, p: 0.4 });
  vanish(kql, tBC + 0.3);

  // ───────── 站 C：内核只有约八千行 ─────────
  const t8k = Q(T('c4', { zh: '八千', en: 'eight' })), tOnly = Q(T('c4', { zh: '只有', en: 'only' }));
  const big = blk(world, 'bg-paper', BX, BY, rSide, rSide); big.dataset.name = 'rest-of-lean';
  const kt = txt(world, 't-1', tr('内核', 'Kernel'), XC + 112, 130); slam(kt, Q(T('c4')) + 0.1, { from: 1.2, d: 0.35 }); sfx('pop', Q(T('c4')) + 0.1, { g: 0.8, p: -0.4 });
  const kn = txt(world, 'num ac', group3(KL), XC + 106, 316); css(kn, { fontSize: '150px', letterSpacing: '-.04em' }); slam(kn, t8k, { from: 1.3, d: 0.35 }); sfx('thud', t8k, { p: -0.3 });
  const ku = txt(world, 't-3', tr('行 C++', 'lines of C++'), XC + 116, 476); wipe(ku, t8k + 0.3, { dir: 'l', d: 0.3 });
  const ks = txt(world, 'mono t-n dim', `src/kernel · ${DATA.size.kernel.files} ${tr('个文件', 'files')} · Lean ${DATA.lean.version}`, XC + 118, 556); ks.style.fontSize = '28px'; wipe(ks, t8k + 0.5, { dir: 'l', d: 0.3 });
  const bt = txt(world, 't-3 ink', tr('Lean 4 的其余源码', 'The rest of Lean 4'), BX + 44, BY + 36), bn = txt(world, 'num ink', group3(RL) + tr(' 行', ' lines'), BX + 44, BY + 116), bs = txt(world, 'mono t-n dimp', 'src/Init · Std · Lean · lake', BX + 46, BY + 204);
  bn.style.fontSize = '64px'; bs.style.fontSize = '28px';
  wipe(bt, tOnly, { dir: 'l', d: 0.35 }); wipe(bn, tOnly + 0.2, { dir: 'l', d: 0.35 }); wipe(bs, tOnly + 0.4, { dir: 'l', d: 0.35 }); sfx('blip', tOnly, { g: 0.6, p: 0.5 });
  const sc = txt(world, 't-n dimp', tr('两个正方形的面积与行数成正比', 'Both squares are drawn to scale by line count'), BX + 46, BY + rSide - 60); sc.style.fontSize = '28px'; wipe(sc, t8k + 0.9, { dir: 'l', d: 0.35 });
  // 内核之外：策略与自动化在其余源码里，AI 在 Lean 之外；三条线都通到内核
  const tT = Q(T('c5', { zh: '策略', en: 'Tactics' })), tA = Q(T('c5', { zh: '自动化', en: 'automation' })), tAI = Q(T('c5', 'AI')), tOut = Q(T('c5', { zh: '之外', en: 'outside' }));
  const w1 = txt(world, 't-2 ink', tr('策略', 'Tactics'), BX + 44, BY + 320), w2 = txt(world, 't-2 ink', tr('自动化', 'Automation'), BX + 44, BY + 440);
  slide(w1, tT, { x: 70, d: 0.3, ease: 'power3.out' }); slide(w2, tA, { x: 70, d: 0.3, ease: 'power3.out' }); sfx('pop', tT, { g: 0.7, p: 0.4 }); sfx('pop', tA, { g: 0.7, p: 0.5 });
  const AX = KX + 24 - 60, AYy = 330, ah = hatch(world, AX - 16, AYy + 104, 150, 22, C.ac, 14, 5), w3 = txt(world, 't-2', 'AI', AX, AYy);
  slam(w3, tAI, { from: 1.4, d: 0.3 }); wipe(ah, tAI + 0.15, { dir: 'l', d: 0.3 }); sfx('pop', tAI, { g: 0.8, p: 0 });
  const ov = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: `${XC} 0 1920 968` }, world); px(ov, XC, 0); ov.dataset.name = 'routes';
  const rx = KX + kSide - 16, routes = [
    `M${BX},${BY + 368} H${BX - 20} V${KY - 26} H${rx} V${KY}`,
    `M${BX},${BY + 488} H${BX - 20}`,
    `M${AX + 60},${AYy + 130} V${KY}`,
  ].map((d, i) => svg('path', { d, fill: 'none', stroke: i === 2 ? C.paper : C.dim, 'stroke-width': 6 }, ov));
  routes.forEach((p, i) => draw(p, tOut - 0.1 + i * 0.1, 0.5));
  sfx('whoosh', tOut - 0.1, { g: 0.6 });
  // 出了错：一个打着斜线的方点沿 AI 那条线走到内核，被挡在外面；内核的原话
  const tErr = Q(T('c6', { zh: '错', en: 'wrong' })), tStop = Q(T('c6', { zh: '过', en: 'pass' })) - 0.25;
  const bad = hatch(world, 0, 0, 34, 34, C.ac, 9, 4); css(bad, { border: `4px solid ${C.ac}`, boxSizing: 'content-box' }); bad.dataset.name = 'bad-term';
  appear(bad, tErr);
  F((t) => {
    const k = ease.io3(clamp((t - tErr) / (tStop - tErr))), shake = t > tStop ? Math.exp(-(t - tStop) * 6) * Math.sin((t - tStop) * 34) * 16 : 0;
    bad.style.left = (AX + 60 - 21 + shake).toFixed(1) + 'px'; bad.style.top = lerp(AYy + 150, KY - 50, k).toFixed(1) + 'px';
  });
  const ke = DATA.kernel.map(stripLoc), m0 = ke[0].match(/^error: (\(kernel\) declaration type mismatch), ('fake' has type)$/);
  console.assert(m0, 'kernel: 内核的报错原文变了');
  const eb = txt(world, 'mono ink bg-ac', esc(m0[1]), XC + 112, 640); css(eb, { fontSize: '34px', fontWeight: 800, padding: '6px 18px 10px' });
  const el = outLines(world, [m0[2], ...ke.slice(1)], { x: XC + 130, y: 712, size: 30, lh: 40 }); el.forEach((e, i) => { if (i % 2 === 0) e.classList.add('dim'); });
  slam(eb, tStop, { from: 1.15, d: 0.25 }); el.forEach((e, i) => appear(e, tStop + 0.1 + i * 0.05)); sfx('error', tStop, { p: 0.1 }); sfx('tick', tErr, { g: 0.7 });

  // ───────── 站 D：三者的分工 ─────────
  const tCD = Tend('c6') + 0.1, tP = Q(T('c7', { zh: '人', en: 'People' })), tL = Q(T('c7', 'Lean')), tKr = Q(T('c7', { zh: '内核', en: 'kernel' }));
  const DY = YD + 300, cols = [XC + 112, XC + 700, XC + 1380];
  const who = [tr('人', 'People'), 'Lean', tr('内核', 'Kernel')], what = [tr('写策略', 'write tactics'), tr('生成证明项', 'builds the term'), tr('只看证明项', 'reads only the term')], when = [tP, tL, tKr];
  blk(world, 'bg-paper', cols[0] - 40, DY - 60, 460, 420);
  who.forEach((w, i) => {
    const a = txt(world, 't-1' + (i === 0 ? ' ink' : i === 2 ? ' ac' : ''), w, cols[i], DY), b = txt(world, 't-4' + (i === 0 ? ' ink' : ''), what[i], cols[i] + 6, DY + 210);
    if (LANG !== 'zh') a.style.fontSize = '120px';
    slam(a, when[i], { from: 1.25, d: 0.3 }); wipe(b, when[i] + 0.25, { dir: 'l', d: 0.3 }); sfx(i === 2 ? 'thud' : 'pop', when[i], { g: 0.85, p: -0.5 + i * 0.5 });
  });
  const n1 = txt(world, 'num ink', `${P.length - 1} ${tr('行', 'lines')}`, cols[0] + 6, DY + 280), n2 = txt(world, 'num dim', `${group3(TREE)} ${tr('个节点', 'nodes')}`, cols[1] + 6, DY + 280), n3 = txt(world, 'num dim', `${group3(KL)} ${tr('行', 'lines')}`, cols[2] + 6, DY + 280);
  [n1, n2, n3].forEach((e, i) => { e.style.fontSize = '44px'; wipe(e, when[i] + 0.45, { dir: 'l', d: 0.3 }); });
  const ar1 = blk(world, 'bg-paper', cols[0] + 440, DY + 80, cols[1] - cols[0] - 480, 8), ar2 = blk(world, 'bg-paper', cols[1] + tr(460, 340), DY + 80, cols[2] - cols[1] - tr(500, 380), 8);
  fromTo(ar1, tL - 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' }); fromTo(ar2, tKr - 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' });
  const fin = tickBlock(world, cols[2] + 4, DY - 130, 100); slam(fin, Q(Tend('c7')) - 0.25, { from: 1.6, d: 0.25 }); sfx('chime', Q(Tend('c7')) - 0.25, { g: 0.8, p: 0.5 });
  sfx('riser', s.end - 1.25, { g: 0.8 });

  // 常驻元素的字色：站 A 是纸色底；镜头右移时，纸与墨的分界先经过右上角，再经过左上角
  hudGround('L', s.start + WIPE - 0.05, tAB + 0.6, 'paper'); hudGround('R', s.start + 0.12, tAB + 0.31, 'paper');

  // ───────── 镜头 ─────────
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    drift(s.start + WIPE, tAB - 0.03, { x: 985, z: 1.02 }),
    [tAB, { x: XB + 960, z: 1 }, 0.9],
    drift(tAB + 0.95, tBC - 0.03, { x: XB + 985, z: 1.015 }),
    [tBC, { x: XC + 960, z: 1 }, 0.9],
    drift(tBC + 0.95, tCD - 0.03, { x: XC + 985, z: 1.02 }),
    [tCD, { x: XC + 960, y: YD + 484, z: 1 }, 0.8],
    drift(tCD + 0.85, s.end + WIPE, { x: XC + 990, z: 1.02 }),
  ]);
});
