// 开场（0–32 秒）。
// 站 A（墨）：1 + 3 + 5 + 7 = 4² → 一圈一圈加下去，总是 n² → 试到一百万 → 没试过的有无穷多个 → 片名卡。
// 站 B（纸）：一页写在纸上的证明，读的人逐行打勾。
// 站 C（纸）：1998 年开普勒猜想的证明：300 页与约四万行程序；审稿人未能确认。
// 出处见 research/FACTS.md。「试到一百万」是 Lean 自己算的（DATA.million）；各站的数都取自 DATA 或在该文件里给了出处。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  // 第 0 帧的镜头：轨迹的各段在建立时依次写入自己的起点，建完后留下的是最后一段的起点，时间线停在 0 时不会重算。
  // 所以在镜头自己的帧函数之前登记一个帧函数，开头这一小段把镜头按起始位置摆好。
  const CAM0 = { x: 960, y: 484, z: 1.06, r: 0 }, camRef = { st: null };
  F((t) => { if (camRef.st && t <= s.start + 0.02) Object.assign(camRef.st, CAM0); });
  const cam = makeCamera(world, 1920, VH); camRef.st = cam.st;
  const XB = 2400, XC = 5000;
  console.assert(DATA.million === true && DATA.first[4] === 16, 'open: 取证数据与画面不符');

  // ───────── 站 A：方点阵 ─────────
  const X0 = 150, Y0 = 176, P0 = 140, S0 = 4 * P0, S1 = 736, TESTED = 1e6;
  const tR = [s.start + 0.06, Q(T('o1', { zh: '三', en: 'three' })), Q(T('o1', { zh: '五', en: 'five' })), Q(T('o1', { zh: '七', en: 'seven' }))];
  const tGen = Q(T('o1', { zh: '前', en: 'first' }));                                   // 从这里起不再一圈一圈地数，n 一直往上加
  const tW0 = T('o2') + 0.05, tW1 = T('o2', { zh: '没有', en: 'never' }) - 0.05;          // 冲到一百万
  const tI0 = T('o3', { zh: '无穷', en: 'infinitely' }) - 0.4;                           // 视野继续放大，试过的那一块缩向角上
  const tCard = Qf(T('oT')), tOut = Q(Tend('oT') - 0.2);
  const Va = 4 + (tW0 - tGen) / 0.25;
  const Vof = (t) => t < tGen ? 4 : t < tW0 ? 4 + (t - tGen) / 0.25 : t < tW1 ? expo(Va, TESTED, ease.io3((t - tW0) / (tW1 - tW0))) : t < tI0 ? TESTED : expo(TESTED, 1e13, Math.pow(clamp((t - tI0) / (tCard + 0.5 - tI0)), 1.8));
  const Sof = (t) => lerp(S0, S1, ease.io3(clamp((t - tGen) / 1.0)));

  // 占位的十六个空格：第 0 帧就在，说到哪一圈哪一圈填实
  const ph = svg('svg', { class: 'abs', width: S0, height: S0, viewBox: `0 0 ${S0} ${S0}` }, world); px(ph, X0, Y0); ph.dataset.name = 'placeholders';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) svg('rect', { x: c * P0 + 3, y: r * P0 + 3, width: 118, height: 118, fill: 'none', stroke: C.dim, 'stroke-width': 4 }, ph);
  vanish(ph, tR[3] + 0.25);
  const dots = dotSquare(world, 4, { x: X0, y: Y0, pitch: P0, cell: 124 });
  dots.rings.forEach((g, r) => {
    [...g.children].forEach((c, j) => appear(c, tR[r] + j * 0.03));
    classAt(g, 'hot', tR[r], r < 3 ? tR[r + 1] : tGen);
    const lab = txt(world, 'num ink', String(2 * r + 1), X0 + r * P0, Y0 + r * P0 + 30); css(lab, { width: '124px', textAlign: 'center', fontSize: '64px' });
    slam(lab, tR[r] + r * 0.03, { from: 1.5, d: Math.min(0.3, Math.max(0.06, tGen - tR[r] - r * 0.03 - 0.04)) }); vanish(lab, tGen);      // 入场要在收走之前做完，否则两个动作抢同一个属性
    sfx('pop', tR[r], { g: 0.8 + r * 0.06, p: -0.5 + r * 0.1 });
  });
  vanish(dots.el, tGen);
  // 一般的 n：会放大视野的方点阵。视野里是 V×V 个方点，屏幕上的边长是 S；V 超过一百万之后，试过的只占角上的一块，其余是斜线
  const lat = lattice(world, { x: X0, y: Y0, max: S1, dec: { max: 12, color: (k) => (k <= 6 ? C.ac : C.dim), label: (k) => (k <= 6 ? group3(10 ** k) : null) } });
  let hd = ''; for (let k = -S1; k < S1; k += 26) hd += `M${Math.max(0, k)},${Math.min(S1, S1 + k)}L${Math.min(S1, k + S1)},${Math.max(0, k)}`;
  const hat = svg('path', { d: hd, stroke: C.dim, 'stroke-width': 5, fill: 'none' }, lat.under);
  appear(lat.el, tGen);
  F((t) => {
    if (t < tGen - 0.1 || t > tCard + 0.6) return;
    const V = Vof(t), S = Sof(t);
    hat.style.display = t >= tI0 ? '' : 'none';
    lat.draw(V, S, S * Math.min(V, TESTED) / V, t >= tW0);
  });
  // 右侧的算式：先是 1 + 3 + 5 + 7 = 4²，再换成一般的 n
  const eq1 = txt(world, 'num', ['1', ' + 3', ' + 5', ' + 7'].map((x) => `<span>${x}</span>`).join(''), 960, 176); css(eq1, { fontSize: '104px', whiteSpace: 'pre', letterSpacing: '-.03em' });
  [...eq1.children].forEach((sp, i) => { sp.style.display = 'inline-block'; sp.style.whiteSpace = 'pre'; slide(sp, tR[i], { x: 50, d: 0.3, ease: 'power3.out' }); classAt(sp, 'ac', tR[i], i < 3 ? tR[i + 1] : tGen); });
  wipeOut(eq1, tGen, { dir: 'l', d: 0.2 });
  const eq1g = txt(world, 'num', '1 + 3 + ⋯ + (2n − 1)', 960, 192); css(eq1g, { fontSize: '72px', letterSpacing: '-.03em' });
  wipe(eq1g, tGen + 0.2, { dir: 'l', d: 0.35 });
  const eq3 = txt(world, 'num', '= <span>4</span><sup class="ac">2</sup>', 948, 424); css(eq3, { fontSize: '330px', letterSpacing: '-.05em' }); eq3.dataset.overlapOk = '1';
  slam(eq3, tR[3] + 0.12, { from: 1.25, d: 0.35 }); sfx('thud', tR[3] + 0.12, { g: 0.9, p: 0.3 });
  swapAt(eq3.querySelector('span'), '4', 'n', tGen);
  const nrow = txt(world, 'num', 'n = <span class="ac"></span>', 960, 296); css(nrow, { fontSize: '104px', letterSpacing: '-.03em' });
  const nval = nrow.querySelector('span'); let lastN = null;
  F((t) => { const v = group3(Math.floor(Math.min(Vof(t), TESTED) + 1e-6)); if (v !== lastN) { nval.textContent = v; lastN = v; } });
  slide(nrow, tGen + 0.05, { x: 60, d: 0.3, ease: 'power3.out' }); sfx('blip', tGen + 0.05, { g: 0.6, p: 0.3 });
  for (let i = 0; tGen + i * 0.25 < tW0 - 0.1; i++) sfx('tick', tGen + i * 0.25, { g: 0.55, p: -0.3 });
  sfx('riser', tW0 - 0.9, { g: 0.7 }); sfx('whoosh', tW0, { g: 0.9 });
  // 试到一百万：Lean 的原话
  const ev = txt(world, 'mono dim', esc('#eval testUpTo 1000001'), 964, 806); css(ev, { fontSize: '30px', fontWeight: 500 });
  const evr = txt(world, 'mono ink bg-ac', 'true', 964 + 23 * 18 + 6, 800); css(evr, { fontSize: '30px', fontWeight: 800, padding: '4px 14px 6px' });
  wipe(ev, tW1 - 0.1, { dir: 'l', d: 0.3 }); slam(evr, tW1 + 0.2, { from: 1.4, d: 0.3 }); sfx('chime', tW1 + 0.2, { g: 0.7, p: 0.3 });
  // 没试过的：斜线。问号落在 n² 旁边
  const qm = txt(world, 'num ac', '?', 1690, 470); qm.style.fontSize = '250px';
  const tNot = Q(T('o3', { zh: '不是', en: 'not' }));
  slam(qm, tNot, { from: 1.5, d: 0.3 }); sfx('error', tNot, { g: 0.7, p: 0.4 });
  const un = txt(world, 't-4 bg-ink', tr('没试过的 n', 'untested n'), X0 + 250, Y0 + 330); css(un, { padding: '8px 22px 12px' });
  slam(un, tI0 + 0.55, { from: 1.3, d: 0.3 }); sfx('pop', tI0 + 0.55, { g: 0.7, p: -0.3 });
  sfx('whoosh', tI0, { g: 0.7 });

  // ───────── 片名卡：朱红整屏，墨色字 ─────────
  const card = h('div', 'abs bg-ac ink', root); px(card, 0, 0, 1920, VH);
  const big = txt(card, 't-0 ink', 'Lean 4', 92, 96);
  const n200 = txt(card, 'num ink', String(TOTAL), 100, 560); n200.style.fontSize = '250px';
  const unit = txt(card, 't-2 ink', tr('秒', 's'), 100 + 3 * 150 + 20, 700);
  const sub = txt(card, 't-3 ink', tr('什么是形式化证明，<br>以及它为什么可靠', 'What formal proof is,<br>and why it can be trusted'), tr(820, 760), 640); css(sub, { whiteSpace: 'normal', width: '1000px', lineHeight: '1.25' });
  [big, n200, unit, sub].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.9 });
  slam(big, tCard + 0.3, { from: 1.3, d: 0.4 }); sfx('thud', tCard + 0.3);
  slide(n200, tCard + 0.45, { x: -120, d: 0.4 }); slide(unit, tCard + 0.52, { x: -120, d: 0.4 }); sfx('pop', tCard + 0.45, { g: 0.6, p: -0.4 });
  wipe(sub, tCard + 0.6, { dir: 'l', d: 0.4 });
  fromTo(big, tCard + 0.8, { scale: 1 }, { scale: 1.035, transformOrigin: '0% 60%', duration: tOut - tCard - 0.8, ease: 'none', immediateRender: false });
  wipeOut(card, tOut, { dir: 'r', d: 0.4 }); sfx('whoosh', tOut, { g: 0.7 });
  hudGround('L', tCard + 0.15, tOut + 0.05, 'ac'); hudGround('R', tCard + 0.3, tOut + 0.3, 'ac');

  // ───────── 站 B：一页写在纸上的证明 ─────────
  blk(world, 'bg-paper', XB - 400, -600, XC + 2600 - XB, 2200);
  blk(world, 'bg-ink', XB + 340, -600, 6, 2200);
  const page = tr(
    [['命题', '1 + 3 + ⋯ + (2n − 1) = n²', 1], ['证', 'n = 0 时，两边都是 0。', 0], ['', '设对 k 成立。', 0], ['', '则 k² + (2k + 1) = (k + 1)²。', 1], ['', '所以对 k + 1 也成立。', 0]],
    [['Claim', '1 + 3 + ⋯ + (2n − 1) = n²', 1], ['Proof', 'For n = 0, both sides are 0.', 0], ['', 'Assume it holds for k.', 0], ['', 'Then k² + (2k + 1) = (k + 1)².', 1], ['', 'So it holds for k + 1.', 0]]);
  const LY = (i) => 112 + i * 152, tL = (i) => Q(T('o4') + 0.1 + i * 0.5), tK = (i) => Q(T('o5') + 0.1) + i * 0.3;
  const headW = tr(200, 250);
  page.forEach(([a, b, m], i) => {
    const no = txt(world, 'mono dimp', String(i + 1).padStart(2, '0'), XB + 136, LY(i) + 16); css(no, { fontSize: '40px', fontWeight: 500 });
    const ha = a ? txt(world, 't-3 ink', a, XB + 400, LY(i)) : null; if (ha) ha.style.fontWeight = 900;
    const tx = txt(world, (m ? 'mono ' : '') + 't-3 ink', b, XB + 400 + headW, LY(i)); css(tx, { fontWeight: i === 0 ? 800 : 500, letterSpacing: m ? '-.02em' : '0' });
    appear(no, tL(i)); if (ha) slam(ha, tL(i), { from: 1.3, d: 0.25 }); wipe(tx, tL(i) + 0.05, { dir: 'l', d: 0.35 });
    sfx('tick', tL(i), { g: 0.8, p: -0.2 });
    const tk = tickBlock(world, XB + 238, LY(i) + 2, 72);
    slam(tk, tK(i), { from: 1.6, d: 0.25 }); sfx('pop', tK(i), { g: 0.75, p: -0.5 });
  });
  // 读的人：一个墨色的方框，逐行往下走
  const reader = blk(world, '', XB + 230, LY(0) - 6, 88, 88); css(reader, { border: `8px solid ${C.ink}` }); reader.dataset.name = 'reader';
  appear(reader, tK(0) - 0.3);
  for (let i = 1; i < 5; i++) fromTo(reader, tK(i) - 0.22, { y: (i - 1) * 152 }, { y: i * 152, duration: 0.2, ease: 'power3.inOut', immediateRender: false });

  // ───────── 站 C：1998 年，开普勒猜想 ─────────
  const tYear = Q(T('k1', '1998')), tPages = Q(T('k1b', { zh: '三百', en: 'Three' })), tCode = Q(T('k1b', { zh: '四万', en: 'forty' })), tNo = Q(T('k2', { zh: '没', en: 'could' }));
  const tProofW = Q(T('k1', { zh: '证明', en: 'proof' }));                               // 说到「证明」，300 页先一行一行铺出来；页数随下一句标上
  const year = txt(world, 'num ink', '1998', XC + 142, 124); css(year, { fontSize: '220px', letterSpacing: '-.04em' });
  slam(year, tYear, { from: 1.25, d: 0.35 }); sfx('thud', tYear, { p: -0.4 });
  const kt = txt(world, 't-3 ink', tr('开普勒猜想的证明', 'A proof of the Kepler conjecture'), XC + 156, 362);
  const kn = txt(world, 't-n dimp', tr('猜想提出于 1611 年 · 证明者 Hales 与 Ferguson', 'Conjectured in 1611 · proved by Hales and Ferguson'), XC + 160, 440);
  wipe(kt, Q(T('k1', { zh: '开普勒', en: 'Kepler' })), { dir: 'l', d: 0.4 }); wipe(kn, Q(T('k1', { zh: '开普勒', en: 'Kepler' })) + 0.3, { dir: 'l', d: 0.4 });
  // 300 页：一页一个小方块，30 列 10 行
  const pg = svg('svg', { class: 'abs', width: 780, height: 330, viewBox: '0 0 780 330' }, world); px(pg, XC + 160, 566); pg.dataset.name = 'pages';
  for (let r = 0; r < 10; r++) { const g = svg('g', {}, pg); for (let c = 0; c < 30; c++) svg('rect', { x: c * 26, y: r * 33, width: 18, height: 25, fill: C.ink }, g); appear(g, tProofW + r * 0.05); }
  const pl = txt(world, 't-4 ink', tr('300 页', '300 pages'), XC + 160, 500);
  slam(pl, tPages, { from: 1.3, d: 0.3 }); sfx('blip', tPages, { g: 0.7, p: -0.4 }); sfx('tick', tProofW, { g: 0.7, p: -0.4 });
  // 约四万行程序：200 × 200 行，一小格 100 行、一大格 10 000 行（与开场的方点阵同一种画法）
  const cf = lattice(world, { x: XC + 1220, y: 250, max: 600, color: C.ink, gap: C.paper, lineW: 4, name: 'code-lines' }); cf.draw(200, 600);
  const cl = txt(world, 't-4 ink', tr('约 40 000 行程序', 'About 40,000 lines of code'), XC + 1220, 176);
  wipe(cf.el, tCode, { dir: 't', d: 0.6, ease: 'power2.out' }); slam(cl, tCode, { from: 1.3, d: 0.3 }); sfx('blip', tCode, { g: 0.7, p: 0.5 });
  // 审稿人未能确认：程序那一块盖上斜线（Hales 2008：审稿人没有仔细检查过程序），左下压一块墨色的结论
  const hx = hatch(world, XC + 1220, 250, 600, 600, C.ac, 30, 8);
  wipe(hx, tNo, { dir: 'l', d: 0.5 }); sfx('error', tNo, { g: 0.8, p: 0.4 });
  const stamp = blk(world, 'bg-ink', XC + 142, 640, tr(1010, 1040), 236);
  const st1 = txt(world, 't-2 paper', tr('未能确认其正确', 'Could not be certified'), XC + 174, 662); if (LANG !== 'zh') st1.style.fontSize = '76px';
  const st2 = txt(world, 't-n dim', tr('《数学年刊》编辑的信，引自 Hales《Formal Proof》(2008)', 'Annals of Mathematics editor, quoted in Hales, “Formal Proof” (2008)'), XC + 180, 800); st2.style.fontSize = '28px';
  wipe(stamp, tNo + 0.1, { dir: 'l', d: 0.35 }); slam(st1, tNo + 0.35, { from: 1.2, d: 0.3 }); wipe(st2, tNo + 0.6, { dir: 'l', d: 0.35 }); sfx('thud', tNo + 0.35, { g: 0.8, p: -0.3 });
  sfx('riser', s.end - 1.25, { g: 0.8 });

  hudGround('L', tOut + 0.05, s.end + WIPE - 0.05, 'paper'); hudGround('R', tOut + 0.3, s.end + 0.12, 'paper');

  // ───────── 镜头 ─────────
  const tB = tCard + 0.45, tC = Tend('o5') + 0.08;
  cam.track(s.start, { x: 960, y: 484, z: 1.06 }, [
    [s.start + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    drift(s.start + 1.0, tW0 - 0.05, { z: 1.035, x: 975 }),
    [tW0, { z: 1, x: 960 }, 0.5, { ease: 'power3.out', sfx: false }],
    drift(tW0 + 0.55, tB - 0.02, { z: 1.03, x: 972 }),
    [tB, { x: XB + 960, z: 1.03 }, 0.01, { ease: 'none', sfx: false }],
    drift(tB + 0.05, tC - 0.03, { x: XB + 990, z: 1 }),
    [tC, { x: XC + 960, z: 1 }, 0.9],
    drift(tC + 0.95, s.end + WIPE, { x: XC + 990, z: 1.02 }),
  ]);
});
