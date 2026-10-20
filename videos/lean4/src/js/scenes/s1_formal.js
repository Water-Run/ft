// 第 2 场（32–64 秒）：形式化证明是什么 → 一条时间轴（1968 Automath、1998 与 2003–2014 开普勒猜想、2013 Lean、2023 Lean 4）→ 开头的命题写成 Lean。
// 站 A：纸上的五行与它们各自的式子（式子取自 Lean 的回显 DATA.goals），程序逐行检查；站 B：时间轴，镜头沿轴向右；站 C：在 2023 的正下方敲出定义与命题。
// 历史节点的出处见 research/FACTS.md。
scene('formal', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const XB = 2400, AY = 700, X = (y) => XB + 200 + (y - 1960) * 52;

  // ───────── 站 A：每一步都写成式子，交给程序检查 ─────────
  const title = txt(world, 't-1', tr('形式化证明', 'Formal proof'), 112, 136);
  fromTo(title, Q(T('f1')), { scale: 1.06 }, { scale: 1, transformOrigin: '0% 60%', duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }); sfx('thud', Q(T('f1')), { p: -0.3 });   // 标题在换场之前就在：换场的那一圈把它带出来
  const stmt = DATA.src.proof[0].match(/: (sumOdd n = n \^ 2) :=/)[1], ih = DATA.goals[1].hyps[1].replace(/^ih : /, '');
  console.assert(stmt && DATA.goals[1].hyps[1].startsWith('ih : '), 'formal: 目标数据的形状变了');
  const informal = tr(['命题', 'n = 0 时成立', '设对 k 成立', '则 k² + (2k + 1) = (k + 1)²', '所以对 k + 1 成立'],
    ['The claim', 'True for n = 0', 'Assume true for k', 'Then k² + (2k + 1) = (k + 1)²', 'So true for k + 1']);
  const formal = [stmt, DATA.goals[0].goal, ih, DATA.goals[2].goal, DATA.goals[1].goal];
  const RY = (i) => 436 + i * 100, tWrite = Q(T('f1', { zh: '写', en: 'writes' })), tProg = Q(T('f1', { zh: '程序', en: 'program' }));
  informal.forEach((a, i) => {
    const l = txt(world, (i === 3 ? 'mono ' : '') + 't-b dim', a, 120, RY(i) + 4); if (i === 3 && LANG !== 'zh') l.style.fontSize = '33px'; wipe(l, s.start + 0.3 + i * 0.07, { dir: 'l', d: 0.3 });
    const bar = blk(world, 'bg-paper', 770, RY(i) + 26, 90, 4); fromTo(bar, tWrite + i * 0.125, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.2, ease: 'power3.out' });
    const f = h('div', 'ln', world, esc(formal[i])); px(f, 890, RY(i) + 2); f.style.fontSize = '40px';
    wipe(f, tWrite + 0.08 + i * 0.125, { dir: 'l', d: 0.3 }); sfx('tick', tWrite + i * 0.125, { g: 0.8, p: 0.2 });
    const tk = tickBlock(world, 1740, RY(i) - 2, 60);
    slam(tk, tProg + 0.1 + i * 0.125, { from: 1.6, d: 0.2 }); sfx('pop', tProg + 0.1 + i * 0.125, { g: 0.7, p: 0.5 });
  });
  // 程序：一个朱红的方框，一拍半走完五行
  const prog = blk(world, '', 1732, RY(0) - 10, 76, 76); css(prog, { border: `8px solid ${C.ac}` }); prog.dataset.name = 'checker';
  appear(prog, tProg - 0.15);
  for (let i = 1; i < 5; i++) fromTo(prog, tProg + 0.02 + i * 0.125, { y: (i - 1) * 100 }, { y: i * 100, duration: 0.1, ease: 'power2.inOut', immediateRender: false });

  // ───────── 站 B：时间轴 ─────────
  const ax = svg('svg', { class: 'abs', width: 3900, height: 90, viewBox: `${XB} ${AY - 20} 3900 90` }, world); px(ax, XB, AY - 20); ax.dataset.name = 'time-axis';
  svg('rect', { x: X(1960) - 60, y: AY - 2, width: X(2026) - X(1960) + 120, height: 4, fill: C.paper }, ax);
  for (let y = 1960; y <= 2026; y++) svg('rect', { x: X(y) - 1, y: AY, width: y % 10 === 0 ? 4 : 2, height: y % 10 === 0 ? 30 : 12, fill: C.paper }, ax);
  for (let y = 1970; y <= 2020; y += 10) { const e = txt(world, 'mono dim', String(y), X(y) - 60, AY + 40); css(e, { fontSize: '28px', fontWeight: 500, width: '120px', textAlign: 'center' }); }
  // 一个节点：年份、一行主标注、一行出处标注、一根立在轴上的线。side: 'r' 文字在线的右侧，'l' 在左侧（右对齐）
  const mark = (year, t, o) => {
    const x = X(year), top = o.hi ? 196 : 446, W = 620, left = o.side === 'r' ? x + 14 : x - 14 - W, al = o.side === 'r' ? 'left' : 'right';
    const stem = blk(world, 'bg-paper', x - 2, top + (o.cap2 ? 206 : 160), 4, AY - top - (o.cap2 ? 206 : 160)), dot = blk(world, o.ac ? 'bg-ac' : 'bg-paper', x - 9, AY - 9, 18, 18);
    const yr = txt(world, 'num' + (o.dimYear ? ' dim' : ''), String(year), left, top); css(yr, { fontSize: '96px', width: W + 'px', textAlign: al });
    const c1 = txt(world, 't-4', o.cap, left, top + 104); css(c1, { width: W + 'px', textAlign: al });
    const c2 = o.cap2 ? txt(world, 't-n dim', o.cap2, left, top + 162) : null; if (c2) css(c2, { width: W + 'px', textAlign: al, fontSize: '28px' });
    fromTo(stem, t, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.25, ease: 'power3.out' }); appear(dot, t);
    slam(yr, t + 0.05, { from: 1.4, d: 0.3 }); wipe(c1, t + 0.2, { dir: o.side === 'r' ? 'l' : 'r', d: 0.3 }); if (c2) wipe(c2, t + 0.35, { dir: o.side === 'r' ? 'l' : 'r', d: 0.3 });
    sfx(o.heavy ? 'thud' : 'tick', t, { g: o.heavy ? 0.8 : 0.9, p: o.p || 0 });
    return { yr, c1, c2 };
  };
  const t68 = Q(T('f2', '1968')), t14 = Q(T('f3', '2014')), t13 = Q(T('f4', '2013')), t23 = Q(T('f5', '2023'));
  const tArr3 = T('f3') - 0.45;
  mark(1968, t68, { hi: 1, side: 'r', cap: 'Automath', cap2: tr('N. G. de Bruijn · 埃因霍温', 'N. G. de Bruijn · Eindhoven'), heavy: 1, p: -0.3 });
  mark(1998, tArr3 + 0.5, { side: 'r', cap: tr('开普勒猜想的证明', 'Kepler proof'), dimYear: 1, p: -0.5 });
  // Flyspeck：2003 年宣布，2014 年完成。一条朱红的线压在轴上
  const fb = blk(world, 'bg-ac', X(2003), AY - 16, X(2014) - X(2003), 14);
  fromTo(fb, t14 - 0.75, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.75, ease: 'power2.in' }); sfx('riser', t14 - 1.2, { g: 0.5 });
  const fl = txt(world, 't-n', tr('Flyspeck：把这份证明写成形式化证明', 'Flyspeck: the same proof, made formal'), X(2003), AY + 86); fl.style.fontSize = '28px';
  wipe(fl, t14 - 0.7, { dir: 'l', d: 0.4 });
  mark(2014, t14, { hi: 1, side: 'l', cap: tr('全部通过机器检查', 'Fully machine-checked'), cap2: 'HOL Light · Isabelle', heavy: 1, p: 0.3 });
  mark(2013, t13, { side: 'l', cap: tr('Lean 立项', 'Lean begins'), cap2: tr('微软研究院 · Leonardo de Moura', 'Microsoft Research · Leonardo de Moura'), ac: 1, heavy: 1, p: 0.2 });   // lint-ok: Microsoft Research 是机构名，不是字体
  const m23 = mark(2023, t23, { hi: 1, side: 'l', cap: tr('Lean 4.0 发布', 'Lean 4.0 released'), ac: 1, heavy: 1, p: 0.4 });
  // 项目自己的标志把 E 与 A 写成 ∃ 与 ∀：这里用本片的字体照这个写法排一遍
  const wm = txt(world, 'num', 'L<span class="ac">∃∀</span>N', X(2013) + 96, 96); css(wm, { fontSize: '80px', letterSpacing: '.04em' });
  const tLean = Q(T('f4', 'Lean'));
  slam(wm, tLean, { from: 1.3, d: 0.35 }); sfx('pop', tLean, { g: 0.8, p: 0.3 });
  const tagA = txt(world, tr('t-3', 't-4'), tr('证明助手', 'Proof assistant'), X(2023) + 18, 452), tagB = txt(world, tr('t-3', 't-4'), tr('编程语言', 'Programming language'), X(2023) + 18, 530);
  const tTa = Q(T('f5', { zh: '证明助手', en: 'proof assistant' })), tTb = Q(T('f5', { zh: '编程', en: 'programming' }));
  slide(tagA, tTa, { x: -60, d: 0.3, ease: 'power3.out' }); slide(tagB, tTb, { x: -60, d: 0.3, ease: 'power3.out' }); sfx('pop', tTa, { g: 0.7, p: 0.4 }); sfx('pop', tTb, { g: 0.7, p: 0.5 });

  // ───────── 站 C：开头的命题，写成 Lean ─────────
  const CXc = XB + 3100, CYc = 1100, LX = CXc - 840, LY0 = CYc + 214, SZ = 48, LH = 72, CW = SZ * 0.6;
  const thm = DATA.src.proof[0].replace(/ := by$/, '');
  console.assert(thm !== DATA.src.proof[0] && DATA.src.def.length === 3, 'formal: 源码的形状变了');
  const src = [...DATA.src.def, '', thm];
  let tt = Math.min(Q(T('f6', { zh: '写', en: 'written' })) - 0.5, Tend('f5') + 0.12 + 0.65);      // 镜头落到这一站时已经开始敲
  const lines = src.map((ln, i) => {
    const e = h('div', 'ln', world); px(e, LX, LY0 + i * LH); e.style.fontSize = SZ + 'px';
    if (!ln) return e;
    appear(e, tt); const t1 = typeText(e, leanHtml(ln), tt, i === 4 ? 30 : 42, { cursorUntil: i === 4 ? s.end + 1 : tt + ln.length / 42 + 0.1 });
    tt = t1 + (i === 2 ? 0.35 : 0.12);
    return e;
  });
  const tDone = tt;
  // 两行注解：这是定义，这是命题。定义的最后一项 2n + 1，就是加上去的那一圈
  const n1 = txt(world, 't-n dim', tr('定义：前 n 个奇数的和', 'Definition: the sum of the first n odd numbers'), LX + 4, LY0 - 62);
  const n2 = txt(world, 't-n dim', tr('命题：它等于 n²', 'Claim: it equals n²'), LX + 4, LY0 + 4 * LH - 58);
  wipe(n1, Tend('f5') + 0.12 + 0.4, { dir: 'l', d: 0.3 }); wipe(n2, tDone - 1.6, { dir: 'l', d: 0.3 });
  const kx = LX + DATA.src.def[2].indexOf('(2 * n + 1)') * CW, ring = blk(world, 'bg-ac', kx, LY0 + 2 * LH + 62, 11 * CW, 8);
  fromTo(ring, tDone + 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' }); sfx('blip', tDone + 0.3, { g: 0.6, p: -0.2 });
  const gi = svg('svg', { class: 'abs', width: 150, height: 150, viewBox: '0 0 150 150' }, world); px(gi, LX + 1180, LY0 + 60); gi.dataset.name = 'ring-icon';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) svg('rect', { x: c * 38, y: r * 38, width: 32, height: 32, fill: C.paper }, gi);
  const gl = svg('g', {}, gi); for (const [c, r] of ringCells(3)) svg('rect', { x: c * 38, y: r * 38, width: 32, height: 32, fill: C.ac }, gl);
  wipe(gi, tDone + 0.45, { dir: 'l', d: 0.35 });
  const gt = txt(world, 'num ac', '2n + 1', LX + 1350, LY0 + 150); gt.style.fontSize = '44px';
  slide(gt, tDone + 0.7, { x: -40, d: 0.3, ease: 'power3.out' }); sfx('pop', tDone + 0.7, { g: 0.7, p: 0.4 });
  // 命题那一半：一道朱红的线，下一场从这里讲起
  const px0 = LX + thm.indexOf(stmt) * CW, ul = blk(world, 'bg-ac', px0, LY0 + 4 * LH + 64, stmt.length * CW, 8);
  fromTo(ul, s.end - 1.5, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'power3.out' }); sfx('blip', s.end - 1.5, { g: 0.6 });
  sfx('riser', s.end - 1.25, { g: 0.8 });

  // ───────── 镜头 ─────────
  const tAB = Tend('f1') + 0.1, tDown = Tend('f5') + 0.12;
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    drift(s.start + 0.5, tAB - 0.03, { z: 1.03, x: 980 }),
    [tAB, { x: XB + 1100, z: 1 }, 0.9],
    drift(tAB + 0.95, tArr3 - 0.03, { x: XB + 1180 }),
    [tArr3, { x: XB + 2440 }, 1.0],
    drift(tArr3 + 1.05, tDown - 0.03, { x: CXc }),
    [tDown, { y: CYc + 484 }, 0.9],
    drift(tDown + 0.95, s.end, { x: CXc + 30, z: 1.02 }),
  ]);
  window.FORMAL_END = { dx: 30, z: 1.02, lx: LX - CXc + 960, ly: LY0 - CYc, SZ, LH, thm, stmt };     // 下一场的第一个画面接着这里：同样的代码、同样的屏幕位置
});
