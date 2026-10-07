// 第 6 场（160–192 秒）：边界与结论。
// 站 A（纸）：名字叫黎曼猜想、命题却是 1 + 1 = 2 的一条定理，内核照样通过（DATA.name）：命题说的是不是原意，仍要人来读。
// 站 B（墨）：2024 年 AlphaProof 用 Lean 证出三道国际数学奥林匹克试题；不论谁写的证明，过的是同一个内核。
// 站 C（墨）：右上角逐个去试，到片尾也只试到 200；那一份证明对所有的 n 成立。最后是结论卡（朱红整屏）。
scene('edge', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const XB = 2300, YC = 1100, SZ = 48, CW = SZ * 0.6, src = DATA.src.name[0];
  console.assert(src === 'theorem riemann_hypothesis : 1 + 1 = 2 := rfl' && DATA.name[0].includes('does not depend on any axioms'), 'edge: 取证数据与画面不符');

  // ───────── 站 A：命题本身写得对不对，内核不管 ─────────
  blk(world, 'bg-paper', -600, -700, 2680, 2400);
  const LX = 170, LY = 190, line = h('div', 'ln ink', world); px(line, LX, LY); line.style.fontSize = SZ + 'px';
  const tType = s.start + 0.3, tTyped = typeText(line, leanHtml(src), tType, 56, { cursorUntil: tType + src.length / 56 + 0.2 }); appear(line, tType);
  const tKer = Q(T('e1', { zh: '内核', en: 'kernel' })) + 0.25, tProp = Q(T('e1', { zh: '命题', en: 'statement' }));
  const ok = tickBlock(world, LX, LY + 92, 64), okl = h('div', 'out ink', world, esc(DATA.name[0])); px(okl, LX + 84, LY + 100); okl.style.fontSize = '36px';
  slam(ok, Math.max(tKer, tTyped + 0.1), { from: 1.6, d: 0.25 }); appear(okl, Math.max(tKer, tTyped + 0.1) + 0.1); sfx('chime', Math.max(tKer, tTyped + 0.1), { g: 0.7, p: -0.3 });
  // 两行大字：名字（斜线：内核不看）与命题（内核只核对这一条）
  const iN = src.indexOf('riemann_hypothesis'), iP = src.indexOf('1 + 1 = 2'), R1 = 470, R2 = 668, VX = tr(470, 690);
  const nh = hatch(world, LX + iN * CW - 8, LY - 4, 18 * CW + 16, 66, C.ac, 16, 5); world.insertBefore(nh, line);
  const pu = blk(world, 'bg-ac', LX + iP * CW, LY + 62, 9 * CW, 8);
  const a1 = txt(world, 't-2 ink', tr('名字', 'The name'), LX - 6, R1), a2 = txt(world, 't-2 ink', tr('命题', 'The statement'), LX - 6, R2);
  if (LANG !== 'zh') for (const e of [a1, a2]) e.style.fontSize = '64px';
  const v1 = h('div', 'ln ink', world, 'riemann_hypothesis'), v2 = h('div', 'ln ink', world, '1 + 1 = 2'); px(v1, VX, R1 + 14); px(v2, VX, R2 + 14); for (const e of [v1, v2]) css(e, { fontSize: '64px', fontWeight: 800 });
  const vh = hatch(world, VX - 10, R1 + 8, 18 * 38.4 + 20, 88, C.ac, 18, 6); world.insertBefore(vh, v1);
  const d1 = txt(world, 't-n dimp', tr('内核不看', 'The kernel does not read it'), VX + 2, R1 + 106), d2 = txt(world, 't-n dimp', tr('内核核对的只有这一条', 'This is all the kernel checks'), VX + 2, R2 + 106);
  const tName = tProp - 0.5;
  wipe(nh, tName, { dir: 'l', d: 0.3 }); fromTo(a1, tName, { scale: 1.08 }, { scale: 1, transformOrigin: '0% 60%', duration: 0.3, ease: 'back.out(2.2)', immediateRender: false }); wipe(v1, tName + 0.1, { dir: 'l', d: 0.3 }); wipe(vh, tName + 0.3, { dir: 'l', d: 0.3 }); wipe(d1, tName + 0.45, { dir: 'l', d: 0.3 }); sfx('pop', tName, { g: 0.8, p: -0.4 });
  fromTo(pu, tProp, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out' }); fromTo(a2, tProp, { scale: 1.08 }, { scale: 1, transformOrigin: '0% 60%', duration: 0.3, ease: 'back.out(2.2)', immediateRender: false }); wipe(v2, tProp + 0.1, { dir: 'l', d: 0.3 }); wipe(d2, tProp + 0.45, { dir: 'l', d: 0.3 }); sfx('thud', tProp, { g: 0.8, p: -0.4 });
  // 读的人：开场那个墨色的方框回来了，这一回只框住命题
  const tRead = Q(T('e2', { zh: '人', en: 'human' })) - 0.25;
  const reader = blk(world, '', VX - 26, R2 - 4, 9 * 38.4 + 52, 112); css(reader, { border: `10px solid ${C.ink}` }); reader.dataset.name = 'reader';
  slam(reader, tRead, { from: 1.3, d: 0.3 }); sfx('thud', tRead, { g: 0.8, p: 0.1 });
  const rl = txt(world, 't-3 ink', tr('要人来读', 'Read by a person'), VX + 9 * 38.4 + 70, R2 + 20); wipe(rl, tRead + 0.2, { dir: 'l', d: 0.35 });
  const tMean = Q(T('e2', { zh: '原意', en: 'meaning' }));
  const ql = txt(world, 't-n dimp', tr('它说的，是不是想证的那件事', 'Does it say what was meant to be proved'), VX + 9 * 38.4 + 74, R2 + 106); wipe(ql, tMean, { dir: 'l', d: 0.35 }); sfx('tick', tMean, { g: 0.7, p: 0.3 });

  // ───────── 站 B：2024 年，AlphaProof ─────────
  const tAB = Tend('e2') + 0.08, tYear = Q(T('e3', '2024')), tAP = Q(T('e3', 'AlphaProof')), tThree = Q(T('e3', { zh: '三', en: 'three' }));
  const year = txt(world, 'num', '2024', XB + 142, 124); css(year, { fontSize: '220px', letterSpacing: '-.04em' }); slam(year, tYear, { from: 1.25, d: 0.35 }); sfx('thud', tYear, { p: -0.4 });
  const ap = txt(world, 't-2', 'AlphaProof', XB + 152, 372), an = txt(world, 't-n dim', tr('Google DeepMind · 国际数学奥林匹克 2024 的六道题', 'Google DeepMind · the six problems of the 2024 International Mathematical Olympiad'), XB + 158, 484);
  if (LANG !== 'zh') an.style.fontSize = '28px';
  wipe(ap, tAP, { dir: 'l', d: 0.35 }); wipe(an, tAP + 0.3, { dir: 'l', d: 0.35 }); sfx('pop', tAP, { g: 0.8, p: -0.3 });
  // 六道题：AlphaProof 用 Lean 证出代数两道、数论一道；几何一道由 AlphaGeometry 2 证出；组合两道没有解出
  const probs = [[tr('代数', 'Algebra'), 2], [tr('代数', 'Algebra'), 2], [tr('数论', 'Number theory'), 2], [tr('几何', 'Geometry'), 1], [tr('组合', 'Combinatorics'), 0], [tr('组合', 'Combinatorics'), 0]];
  const BX = XB + 156, BY = 640, BS = 150, BP = 186, GX = [0, 1, 2, 3, 4, 5].map((i) => BX + i * BP + (i >= 3 ? 80 : 0) + (i >= 4 ? 150 : 0));
  probs.forEach(([name, st], i) => {
    const x = GX[i], b = blk(world, st === 2 ? 'bg-paper' : '', x, BY, BS, BS), t = st === 2 ? tThree + i * 0.125 : tThree + 0.6 + (i - 3) * 0.08;
    if (st === 1) b.style.background = C.dimp; if (st === 0) css(b, { border: `6px solid ${C.dim}` });
    if (st) { const ph = blk(world, '', x, BY, BS, BS); css(ph, { border: `6px solid ${C.dim}` }); ph.dataset.name = 'problem-placeholder'; appear(ph, tAB + 0.5 + i * 0.04); vanish(ph, t + 0.05); }
    const l = txt(world, 't-n' + (st === 2 ? '' : ' dim'), name, x, BY + BS + 16); l.style.fontSize = tr('30px', '24px');
    if (st === 0) appear(b, tAB + 0.5 + i * 0.04); else if (st === 2) { slam(b, t, { from: 1.4, d: 0.3 }); const k = tickBlock(world, x + BS - 56, BY + BS - 56, 56); slam(k, t + 0.2, { from: 1.6, d: 0.2 }); sfx('pop', t, { g: 0.8, p: -0.4 + i * 0.2 }); } else if (st === 1) appear(b, t);
    wipe(l, t + 0.1, { dir: 'l', d: 0.25 });
  });
  const cap = (text, x, w, t, cls) => { const bar = blk(world, cls === 'ac' ? 'bg-ac' : 'bg-paper', x, BY - 26, w, 6), e = txt(world, 't-n' + (cls === 'dim' ? ' dim' : ''), text, x, BY - 76); e.style.fontSize = '28px'; if (cls === 'dim') bar.style.background = C.dim; fromTo(bar, t, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' }); wipe(e, t + 0.1, { dir: 'l', d: 0.3 }); };
  cap(tr('AlphaProof · 用 Lean 证出', 'AlphaProof · proved in Lean'), GX[0], 2 * BP + BS, tThree - 0.1, 'ac'); cap('AlphaGeometry 2', GX[3], 236, tThree + 0.6, 'dim'); cap(tr('未解出', 'Unsolved'), GX[4], BP + BS, tThree + 0.7, 'dim');
  // 人与 AI，同一个内核
  const tHum = Q(T('e4', { zh: '人', en: 'Human' })), tAI = Q(T('e4', 'AI')), tSame = Q(T('e4', { zh: '同', en: 'same' }));
  const KXc = XB + 1620, KS = 150, kq = blk(world, 'bg-ac', KXc, 256, KS, KS); kq.dataset.name = 'kernel';
  const kl = txt(world, 't-4 ink', tr('内核', 'Kernel'), KXc, 256 + 48); css(kl, { width: KS + 'px', textAlign: 'center', fontSize: tr('44px', '36px') });
  const hb = blk(world, 'bg-paper', XB + 1290, 150, 170, 110), hl = txt(world, 't-3 ink', tr('人', 'Human'), XB + 1290, tr(170, 180)); css(hl, { width: '170px', textAlign: 'center', fontSize: tr('60px', '40px') });
  const ab = hatch(world, XB + 1290, 400, 170, 110, C.ac, 16, 5), al = txt(world, 't-3 bg-ink', 'AI', XB + 1335, 420); css(al, { padding: '0 12px 4px' });
  const ov = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: `${XB} 0 1920 968` }, world); px(ov, XB, 0); ov.dataset.name = 'routes';
  const ra = svg('path', { d: `M${XB + 1460},205 H${KXc + 40} V256`, fill: 'none', stroke: C.paper, 'stroke-width': 6 }, ov), rb = svg('path', { d: `M${XB + 1460},455 H${KXc + 40} V${256 + KS}`, fill: 'none', stroke: C.paper, 'stroke-width': 6 }, ov);
  slam(hb, tHum, { from: 1.3, d: 0.3 }); appear(hl, tHum + 0.05); sfx('pop', tHum, { g: 0.8, p: 0.3 });
  wipe(ab, tAI, { dir: 'l', d: 0.3 }); slam(al, tAI + 0.05, { from: 1.3, d: 0.3 }); sfx('pop', tAI, { g: 0.8, p: 0.3 });
  draw(ra, tSame - 0.3, 0.4); draw(rb, tSame - 0.2, 0.4); slam(kq, tSame, { from: 1.4, d: 0.3 }); appear(kl, tSame + 0.1); sfx('thud', tSame, { p: 0.5 });

  // ───────── 站 C：逐个去试，只试到 200；证明对所有的 n 成立 ─────────
  const tBC = Tend('e4') + 0.08, tTry = Q(T('e5')), t200 = Q(T('e5', { zh: '只', en: 'only' })), tAll = Q(T('e6', { zh: '所有', en: 'every' })) - 0.25;
  const CX0 = XB + 120, c1 = txt(world, 't-3 dim', tr('逐个去试', 'Trying one by one'), CX0 + 4, YC + 130); wipe(c1, tBC + 0.5, { dir: 'l', d: 0.3 });
  const live = txt(world, 'num', '', CX0, YC + 214); css(live, { fontSize: '150px', letterSpacing: '-.04em' });
  let lastL = null; F((t) => { const n = nAt(t), v = `${n}<sup>2</sup> = <span class="ac">${group3(SUMS[n])}</span>`; if (v !== lastL) { live.innerHTML = v; lastL = v; } });
  slam(live, tTry, { from: 1.2, d: 0.35 }); sfx('thud', tTry, { p: -0.3 });
  // 200 格：一秒一格，试过的变实；200 之后是斜线
  const TW = 6.2, TG = 7.2, ty = YC + 452, strip = svg('svg', { class: 'abs', width: 200 * TG, height: 64, viewBox: `0 0 ${200 * TG} 64` }, world); px(strip, CX0, ty); strip.dataset.name = 'tested-strip';
  const cells = []; for (let i = 0; i < 200; i++) cells.push(svg('rect', { x: i * TG, y: 0, width: TW, height: 64, fill: C.dimp }, strip));
  let lastT = -1; F((t) => { const n = nAt(t); if (n === lastT) return; for (let i = 0; i < 200; i++) cells[i].setAttribute('fill', i < n - 1 ? C.paper : i === n - 1 ? C.ac : C.dimp); lastT = n; });
  wipe(strip, tBC + 0.5, { dir: 'l', d: 0.6, ease: 'power2.out' }); sfx('whoosh', t200 - 0.2, { g: 0.6 });
  const beyond = hatch(world, CX0 + 200 * TG + 6, ty, 3200, 64, C.dim, 22, 6); wipe(beyond, t200 + 0.3, { dir: 'l', d: 0.5 });
  const s1 = txt(world, 'mono t-n', '1', CX0, ty + 78), s2 = txt(world, 'mono t-n', '200', CX0 + 200 * TG - 54, ty + 78), s3 = txt(world, 't-n dim', tr('没试过的 n', 'untested n'), CX0 + 200 * TG + 40, ty + 78);
  for (const e of [s1, s2, s3]) appear(e, t200 + 0.35); sfx('tick', t200 + 0.35, { g: 0.7, p: 0.4 });
  // 那一份证明：一道纸色从左刷到右，盖过斜线
  const allBar = blk(world, 'bg-paper', CX0 - 40, YC + 620, 3400, 250); allBar.dataset.name = 'for-all';
  const fa = txt(world, 'num ink', '∀ n', CX0, YC + 640); css(fa, { fontSize: '200px', letterSpacing: '-.04em' }); fa.dataset.overlapOk = '1';
  const fst = h('div', 'ln ink', world, esc(window.FORMAL_END.stmt)); px(fst, CX0 + 470, YC + 694); css(fst, { fontSize: '76px', fontWeight: 800 });
  const ftk = tickBlock(world, CX0 + 470 + 16 * 45.6 + 40, YC + 692, 96);
  wipe(allBar, tAll, { dir: 'l', d: 0.5, ease: 'power3.inOut' }); slam(fa, tAll + 0.25, { from: 1.25, d: 0.35 }); wipe(fst, tAll + 0.45, { dir: 'l', d: 0.4 }); slam(ftk, tAll + 0.8, { from: 1.6, d: 0.25 });
  sfx('whoosh', tAll, { g: 0.9 }); sfx('thud', tAll + 0.25, { g: 0.9 }); sfx('chime', tAll + 0.8, { g: 0.8, p: 0.3 });

  // ───────── 结论卡：朱红整屏，墨色字。大字落在配乐抬起的那一拍 ─────────
  const tLift = Math.round((T('e7') + 0.2) / BEAT) * BEAT, tCard = tLift - 0.4, tSwap = Q(T('e7', { zh: '换成', en: 'with' })), tChk = Q(T('e7', { zh: '每', en: 'check' }));
  const card = h('div', 'abs bg-ac ink', root); px(card, 0, 0, 1920, VH);
  const big = LANG === 'zh' ? 200 : 136;
  const k0 = txt(card, 't-3 ink', tr('形式化证明', 'Formal proof'), 124, 130);
  const k1 = txt(card, 't-1 ink', tr('对作者的信任', 'Trust in the author'), 116, 226), k2 = txt(card, 't-4 ink', tr('换成', 'is replaced by'), 126, 468), k3 = txt(card, 't-1 ink', tr('对每一步的检查', 'a check of every step'), 116, 540);
  for (const e of [k1, k3]) e.style.fontSize = big + 'px';
  [k0, k1, k2, k3].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.9 }); vanish(world, tCard + 0.45);
  wipe(k0, tCard + 0.3, { dir: 'l', d: 0.3 }); slam(k1, tLift, { from: 1.2, d: 0.4 }); sfx('thud', tLift);
  const strike = blk(card, 'bg-ink', 104, 226 + big * 0.5, tr(1230, 1250), 20); fromTo(strike, tSwap - 0.1, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.inOut' }); sfx('whoosh', tSwap - 0.1, { g: 0.6 });
  wipe(k2, tSwap, { dir: 'l', d: 0.3 }); slam(k3, tChk, { from: 1.2, d: 0.4 }); sfx('thud', tChk, { g: 1 }); sfx('chime', tChk + 0.5, { g: 0.7 });
  fromTo(k3, tChk + 0.5, { scale: 1 }, { scale: 1.03, transformOrigin: '0% 60%', duration: s.end - tChk - 0.5, ease: 'none', immediateRender: false });

  // 常驻元素的字色
  hudGround('L', s.start + WIPE - 0.05, tAB + 0.6, 'paper'); hudGround('R', s.start + 0.12, tAB + 0.31, 'paper');
  hudGround('L', tCard + 0.15, s.end + 0.05, 'ac'); hudGround('R', tCard + 0.32, s.end + WIPE - 0.05, 'ac');

  // ───────── 镜头 ─────────
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    drift(s.start + WIPE, tAB - 0.03, { x: 985, z: 1.02 }),
    [tAB, { x: XB + 960, z: 1 }, 0.9],
    drift(tAB + 0.95, tBC - 0.03, { x: XB + 985, z: 1.02 }),
    [tBC, { x: XB + 960, y: YC + 484, z: 1 }, 0.8],
    drift(tBC + 0.85, tCard + 0.45, { x: XB + 990, z: 1.02 }),
  ]);
});
