// 第 5 场（128–160 秒）：跳过的证明留下记录（sorryAx）→ #print axioms → 这条定理的依赖（DATA.closure：2 565 条）
// → 核心库 66 200 条声明全部重放（DATA.replay）→ 内核的独立实现 → Mathlib 的 29 万条定理（DATA.mathlib）→ 费马大定理的形式化。
// 站 A（纸）：sorry 与两次 #print axioms 的原话。之后是一组连续拉远的画面：一格一条声明，
// 依赖的那一块（51 格见方）是核心库（258 格见方）的左上角，Mathlib 的定理（539 格见方）在它右边。镜头由本场自己按 t 算出，不走补间。
scene('trust', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const camRef = { st: null };
  F((t) => { if (camRef.st) Object.assign(camRef.st, camAt(t)); });                 // 先于镜头自己的帧函数：每一帧把镜头摆到 camAt(t)
  const cam = makeCamera(world, 1920, VH); camRef.st = cam.st;
  const CL = DATA.closure, RP = DATA.replay, ML = DATA.mathlib, bk = CL.byKind;
  console.assert(CL.total === 2565 && RP.total === 66200 && ML.theorems === 290195 && DATA.sorry[1].includes('[sorryAx]') && DATA.axioms.list.length === 3, 'trust: 取证数据与画面不符');
  const P = 14, DC = 10, FX = 3200, FY = 0, cSide = Math.ceil(Math.sqrt(CL.total)), rFull = Math.floor(Math.sqrt(RP.total)), mFull = Math.floor(Math.sqrt(ML.theorems));
  const SC = cSide * P, SR = (rFull + 1) * P, SM = (mFull + 1) * P, MX = FX + SR + 700;

  // ───────── 站 A：跳过的地方会被记录在案 ─────────
  blk(world, 'bg-paper', -600, -700, 2680, 2400);
  const SZ = 52, CW = SZ * 0.6, LX = 150, src = DATA.src.sorry;
  const l0 = codeLines(world, src.slice(0, 2), { x: LX, y: 170, size: SZ, lh: 82, cls: 'ink' });
  const tSkip = Q(T('r1', { zh: '跳', en: 'skipped' })), tRec = Q(T('r1', { zh: '记录', en: 'record' }));
  const sh = hatch(world, LX + 2 * CW - 10, 170 + 82 - 2, 5 * CW + 20, 72, C.ac, 16, 5); wipe(sh, tSkip, { dir: 'l', d: 0.3 }); sfx('tick', tSkip, { g: 0.8, p: -0.5 });
  world.insertBefore(sh, l0[0]);
  const warn = DATA.sorry.map(stripLoc), mw = warn[0].match(/^(warning:) (declaration uses `sorry`)$/);
  console.assert(mw, 'trust: 警告的原文变了');
  const w0 = txt(world, 'mono ink bg-ac', esc(mw[1]), LX, 356), w1 = h('div', 'out ink', world, esc(mw[2])); css(w0, { fontSize: '42px', fontWeight: 800, padding: '4px 14px 8px' }); px(w1, LX + 236, 360); w1.style.fontSize = '42px';
  slam(w0, tRec, { from: 1.2, d: 0.25 }); appear(w1, tRec + 0.08); sfx('error', tRec, { g: 0.6, p: -0.3 });
  // 两次 #print axioms：一次问跳过的那条，一次问证完的那条
  const tCmd = Q(T('r2')), tThm = Q(T('r2', { zh: '定理', en: 'theorem' })) - 0.25, tAll = Q(T('r2', { zh: '全部', en: 'every' }));
  const cmd = (text, y, t) => { const e = h('div', 'ln ink', world); px(e, LX, y); e.style.fontSize = SZ + 'px'; appear(e, t); return typeText(e, esc(text), t, 60, { cursorUntil: t + text.length / 60 + 0.2 }); };
  const t1 = cmd(src[3], 488, tCmd), t2 = cmd('#print axioms sumOdd_eq_sq', 694, tThm);
  const axOut = (line, hot, y, t) => {
    const m = line.match(/^(.* axioms: \[)(.*)(\])$/), names = m[2].split(', ');
    const e = h('div', 'out ink', world, esc(m[1]) + names.map((n) => `<span class="${hot ? 'ink bg-ac' : ''}" style="${hot ? 'padding:2px 10px 6px;font-weight:800' : 'font-weight:800'}">${esc(n)}</span>`).join(', ') + esc(m[3]));
    px(e, LX, y); e.style.fontSize = '38px'; appear(e, t); return e;
  };
  axOut(warn[1], true, 576, t1 + 0.1); sfx('blip', t1 + 0.1, { g: 0.7, p: -0.2 });
  const a2 = axOut(DATA.axioms.line, false, 782, t2 + 0.1); sfx('blip', t2 + 0.1, { g: 0.7, p: -0.2 });
  // 三条公理：各一道朱红的线
  const pre = DATA.axioms.line.indexOf('[') + 1, AW = 38 * 0.6; let off = pre;
  DATA.axioms.list.forEach((n, i) => { const u = blk(world, 'bg-ac', LX + off * AW, 782 + 54, n.length * AW, 8); fromTo(u, tAll + i * 0.125, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out' }); sfx('pop', tAll + i * 0.125, { g: 0.7, p: -0.3 + i * 0.3 }); off += n.length + 2; });

  // ───────── 一格一条声明：依赖、核心库、Mathlib ─────────
  const KC = { t: C.paper, d: C.dim, x: C.ac }, kindOf = (i) => (CL.kinds[i] in KC ? CL.kinds[i] : 'o');
  const core0 = lattice(world, { x: FX, y: FY, max: SR, color: C.dimp, back: true, name: 'core-unchecked' });
  const core1 = lattice(world, { x: FX, y: FY, max: SR, color: C.paper, back: true, name: 'core-checked' });
  blk(world, 'bg-ink', FX - 4, FY - 4, SC + 4, SC + 4).dataset.name = 'closure-ground';
  const clos = dotField(world, CL.total, { x: FX, y: FY, pitch: P, cell: DC, colors: { ...KC, o: C.dimp }, kindOf, name: 'closure' });
  const extra = RP.total - rFull * rFull, ex0 = blk(world, '', FX + rFull * P, FY, DC, extra * P), ex1 = blk(world, 'bg-paper', FX + rFull * P, FY, DC, 0);
  ex0.style.background = C.dimp; console.assert(extra > 0 && extra <= rFull + 1, 'trust: 核心库最外一圈的格数不对');
  const [lxl, lyl] = clos.pos(CL.total - 1), mine = blk(world, '', FX + lxl - 7, FY + lyl - 7, DC + 14, DC + 14); css(mine, { border: `4px solid ${C.ac}` }); mine.dataset.name = 'this-theorem';
  const frame = svg('svg', { class: 'abs', width: SC + 80, height: SC + 80, viewBox: `-40 -40 ${SC + 80} ${SC + 80}` }, world); px(frame, FX - 40, FY - 40); frame.dataset.name = 'closure-frame';
  const fr = svg('path', { d: `M${SC + 12},-12 V${SC + 12} H-12`, fill: 'none', stroke: C.ac, 'stroke-width': 4 }, frame);
  const math = lattice(world, { x: MX, y: FY, max: SM, color: C.paper, back: true, name: 'mathlib' });
  // Mathlib 最外面没填满的一圈：定理数减去 538² 之后剩下的格数，先自上而下排右边一列，再自右而左排下边一行
  const rest = ML.theorems - mFull * mFull, colN = Math.min(rest, mFull + 1), rowN = rest - colN;
  const ring = svg('svg', { class: 'abs', width: SM, height: SM, viewBox: `0 0 ${SM} ${SM}` }, world); px(ring, MX, FY); ring.dataset.name = 'mathlib-growing';
  svg('rect', { x: mFull * P, y: 0, width: P, height: colN * P, fill: C.ac }, ring); svg('rect', { x: (mFull - rowN) * P, y: mFull * P, width: rowN * P, height: P, fill: C.ac }, ring);
  // 费马大定理：Mathlib 外面还没填实的一圈，斜线（厚度是示意）
  const FW = 460, flt = svg('svg', { class: 'abs', width: SM + FW + 60, height: SM + FW + 60, viewBox: `0 0 ${SM + FW + 60} ${SM + FW + 60}` }, world); px(flt, MX, FY); flt.dataset.name = 'flt-ring';
  { let d = ''; const W2 = SM + FW + 60; for (let k = -W2; k < W2; k += 190) d += `M${k},${W2}L${k + W2},0`;
    const cp = svg('clipPath', { id: 'flt-clip' }, flt); svg('path', { d: `M${SM + 60},0 H${W2} V${W2} H0 V${SM + 60} H${SM + 60} Z` }, cp);
    svg('path', { d, stroke: C.dim, 'stroke-width': 54, fill: 'none', 'clip-path': 'url(#flt-clip)' }, flt); }

  // ── 时刻 ──
  const tA1 = Tend('r2') + 0.08, tZ1 = Tend('r3') + 0.05, dZ1 = 1.1, tZ2 = T('r6') - 0.4, dZ2 = 1.3;
  const tBuild = Q(T('r3', { zh: '依赖', en: 'rests' })) - 0.25, dBuild = 1.5;
  const tScan0 = Q(T('r4', { zh: '全部', en: 'can' })) - 0.25, tScan1 = Tend('r4') + 0.75;
  // ── 镜头：各级的画法是「把方点阵的左上角放在屏幕上的 (sx, sy)，倍数 z」──
  const L1 = { sx: 150, sy: 150, z: 1 }, L2 = { sx: 110, sy: 134, z: 0.22 }, L3 = { sx: 90, sy: 134, z: 0.1 };
  const A0 = { x: 960, y: 484, z: 1 }, A1 = { x: 985, y: 484, z: 1.02 };
  const lev = (a, b, k, creep) => { const z = expo(a.z, b.z, k) * creep, sx = lerp(a.sx, b.sx, k), sy = lerp(a.sy, b.sy, k); return { x: FX + (960 - sx) / z, y: FY + (484 - sy) / z, z, r: 0 }; };
  function camAt(t) {
    if (t < tA1) { const k = clamp((t - s.start - WIPE) / (tA1 - s.start - WIPE)); return { x: lerp(A0.x, A1.x, k), y: 484, z: lerp(A0.z, A1.z, k), r: 0 }; }
    if (t < tA1 + 0.9) { const k = ease.io3((t - tA1) / 0.9), b = lev(L1, L1, 0, 1); return { x: lerp(A1.x, b.x, k), y: lerp(A1.y, b.y, k), z: lerp(A1.z, b.z, k), r: 0 }; }
    if (t < tZ1) return lev(L1, L1, 0, 1 + 0.02 * clamp((t - tA1 - 0.9) / (tZ1 - tA1 - 0.9)));          // 站内缓慢推近
    if (t < tZ1 + dZ1) { const k = ease.io3((t - tZ1) / dZ1); return lev(L1, L2, k, lerp(1.02, 1, k)); }
    if (t < tZ2) return lev(L2, L2, 0, 1 - 0.035 * clamp((t - tZ1 - dZ1) / (tZ2 - tZ1 - dZ1)));         // 缓慢拉远
    if (t < tZ2 + dZ2) { const k = ease.io3((t - tZ2) / dZ2); return lev(L2, L3, k, lerp(0.965, 1, k)); }
    return lev(L3, L3, 0, 1 - 0.04 * clamp((t - tZ2 - dZ2) / (s.end + WIPE - tZ2 - dZ2)));
  }
  sfx('whoosh', tA1, { g: 0.6 }); sfx('whoosh', tZ1, { g: 0.9 }); sfx('riser', tZ2 - 0.9, { g: 0.7 }); sfx('whoosh', tZ2, { g: 1 });

  // ── 方点阵的显隐与生长：依赖一圈一圈长出来；镜头拉远时核心库接着往外长；再拉远时 Mathlib 长出来 ──
  const growC = (t) => ease.out3(clamp((t - tBuild) / dBuild)), growR = (t) => clamp((t - tZ1) / (dZ1 * 0.85)), growM = (t) => clamp((t - tZ2 - 0.15) / (dZ2 * 0.8));
  const scanK = (t) => clamp((t - tScan0) / (tScan1 - tScan0));
  const bar = blk(world, 'bg-ac', FX - 60, FY, SR + 120, 30); bar.dataset.name = 'scan';
  appear(bar, tScan0); vanish(bar, tScan1 + 0.03);
  const inset = (el, side, full, extra = '') => { el.style.clipPath = `inset(0px ${(full - side).toFixed(1)}px ${(full - side).toFixed(1)}px 0px${extra})`; };
  F((t) => {
    const z = camRef.st.z, on1 = t >= tBuild - 0.05, on2 = t >= tZ1, on3 = t >= tZ2;
    clos.el.style.visibility = on1 ? 'visible' : 'hidden'; mine.style.visibility = t >= tBuild + dBuild ? 'visible' : 'hidden'; frame.style.visibility = on2 ? 'visible' : 'hidden';
    if (on1) inset(clos.el, Math.ceil(growC(t) * cSide) * P, SC);
    for (const L of [core0, core1]) L.el.style.visibility = on2 ? 'visible' : 'hidden';
    if (!on2) { ex0.style.visibility = 'hidden'; ex1.style.visibility = 'hidden'; }
    if (on2) {
      const side = Math.min(expo(SC, SR, growR(t)), rFull * P), k = scanK(t), full = growR(t) >= 1;
      core0.draw(rFull + 1, SR, side, false, z); core1.draw(rFull + 1, SR, side, false, z);
      ex0.style.visibility = full ? 'visible' : 'hidden'; ex1.style.visibility = full ? 'visible' : 'hidden'; ex1.style.height = Math.min(extra * P, k * SR).toFixed(1) + 'px';
      core1.el.style.clipPath = `inset(0px 0px ${(SR + 70 - 50 - k * SR).toFixed(1)}px 0px)`;                // 方点阵的画布上方有 50 的留边
      bar.style.top = (FY + k * SR - 15).toFixed(1) + 'px';
      fr.setAttribute('stroke-width', (4 / z).toFixed(2));
    }
    for (const e of [math.el, ring]) e.style.visibility = on3 ? 'visible' : 'hidden';
    if (on3) { const side = SM * ease.out3(growM(t)); math.draw(mFull + 1, SM, Math.min(side, mFull * P), false, z); inset(ring, side, SM); }
  });
  for (let i = 0; i < 9; i++) sfx('tick', tBuild + i * 0.14, { g: 0.45 + i * 0.04, p: -0.5 });
  for (let i = 0; i < 10; i++) sfx('tick', tScan0 + (tScan1 - tScan0) * i / 10, { g: 0.5, p: -0.2 });
  wipe(flt, Q(T('r7', { zh: '正在', en: 'being' })), { dir: 'l', d: 0.8, ease: 'power2.out' });
  sfx('whoosh', Q(T('r7', { zh: '正在', en: 'being' })), { g: 0.6, p: 0.3 }); sfx('tick', Q(T('r7', { zh: '正在', en: 'being' })) + 0.9, { g: 0.7, p: 0.5 }); sfx('blip', Q(Tend('r7')) + 0.5, { g: 0.5, p: 0.4 });

  // ───────── 各级的说明：放在不随镜头动的一层上，镜头停稳了才出现，拉远之前收走 ─────────
  const ui = h('div', 'abs', root); px(ui, 0, 0, 1920, VH); ui.style.whiteSpace = 'nowrap';
  const group = (items, tIn, tOut) => items.forEach((e, i) => { const t = tIn + i * 0.08; if (e._slam) slam(e, t, { from: 1.25, d: 0.3 }); else wipe(e, t, { dir: 'l', d: 0.3 }); if (tOut) wipeOut(e, tOut + i * 0.008, { dir: 'l', d: 0.18 }); });
  const bigN = (text, x, y, size) => { const e = txt(ui, 'num', text, x, y); css(e, { fontSize: size + 'px', letterSpacing: '-.04em' }); e._slam = 1; return e; };
  // 第一级：依赖
  const n1 = bigN('', 980, 150, 150); countTo(n1, 0, CL.total, tBuild, dBuild, (v) => group3(Math.round(v)));
  const types = bk.inductive + bk.constructor + bk.recursor + bk.quot + bk.opaque;
  const leg = [[C.paper, tr('定理', 'theorems'), bk.theorem], [C.dim, tr('定义', 'definitions'), bk.def], [C.dimp, tr('类型、构造子、递归子等', 'types, constructors, recursors'), types], [C.ac, tr('公理', 'axioms'), bk.axiom]];
  console.assert(bk.theorem + bk.def + types + bk.axiom === CL.total, 'trust: 各类相加不等于总数');
  const g1 = [n1, txt(ui, 't-3', tr('条声明', 'declarations'), 990, 316), txt(ui, 't-n dim', tr('这条定理的类型与证明里用到的，一路向下', 'Everything its statement and proof depend on'), 992, 392)];
  leg.forEach(([c, name, n], i) => { const y = 478 + i * 62, sw = blk(ui, '', 992, y + 8, 30, 30); sw.style.background = c; const e = txt(ui, 't-b', `${name} <span class="mono" style="font-weight:800">${group3(n)}</span>`, 1042, y); g1.push(sw, e); });
  const mineL = blk(ui, '', 992, 478 + 4 * 62 + 8, 30, 30); css(mineL, { border: `5px solid ${C.ac}` }); g1.push(mineL, txt(ui, 't-b', tr('最后一格：这条定理自己', 'Last cell: the theorem itself'), 1042, 478 + 4 * 62));
  group(g1, tBuild - 0.1, tZ1 - 0.04); sfx('thud', tBuild + dBuild, { g: 0.8, p: 0.3 });
  // 第二级：核心库的重放
  const tIn2 = tZ1 + dZ1 - 0.15, n2 = bigN('', 1010, 150, 150); countTo(n2, CL.total, RP.total, tZ1 + 0.1, dZ1, (v) => group3(Math.round(v)));
  const cmdl = txt(ui, 'mono t-n dim', '$ lake env leanchecker --fresh SumOdd.Proof', 1018, 392); cmdl.style.fontSize = '28px';
  const g2 = [n2, txt(ui, 't-3', tr('条声明', 'declarations'), 1020, 316), cmdl, txt(ui, 't-b', tr('从空环境起，逐条交给内核', 'From an empty environment, one by one'), 1020, 446)];
  group(g2, tIn2, tZ2 - 0.02);
  const ok = tickBlock(ui, 1020, 524, 72), okl = txt(ui, 't-4', tr(`全部通过 · 本机用时 ${RP.seconds} 秒`, `All pass · ${RP.seconds} s on this machine`), 1112, 534);
  slam(ok, tScan1, { from: 1.6, d: 0.25 }); wipe(okl, tScan1 + 0.1, { dir: 'l', d: 0.3 }); sfx('chime', tScan1, { g: 0.8, p: 0.3 });
  for (const e of [ok, okl]) wipeOut(e, tZ2 - 0.02, { dir: 'l', d: 0.2 });
  // 内核的三个实现
  const tI = Q(T('r5', { zh: '独立', en: 'Independent' })), tX = Q(T('r5', { zh: '互相', en: 'cross-check' }));
  const impl = [['C++', tr('官方内核', 'official'), 1], ['Rust', tr('独立实现', 'independent'), 0], ['Lean', tr('独立实现', 'independent'), 0]];
  impl.forEach(([lang, role, main], i) => {
    const x = 1020 + i * tr(284, 270), b = blk(ui, main ? 'bg-ac' : '', x, 668, 110, 110); if (!main) css(b, { border: `8px solid ${C.paper}` });
    const a = txt(ui, 't-4', lang, x + 126, 664), r = txt(ui, 't-n dim', role, x + 126, 720); r.style.fontSize = tr('28px', '26px');
    const t = i === 0 ? Q(T('r5')) : tI + (i - 1) * 0.25;
    slam(b, t, { from: 1.4, d: 0.3 }); wipe(a, t + 0.1, { dir: 'l', d: 0.25 }); wipe(r, t + 0.2, { dir: 'l', d: 0.25 }); sfx(main ? 'thud' : 'pop', t, { g: 0.8, p: 0.2 + i * 0.25 });
    for (const e of [b, a, r]) wipeOut(e, tZ2 - 0.02 + i * 0.02, { dir: 'l', d: 0.2 });
  });
  const xl = blk(ui, 'bg-paper', 1020, 820, 660, 6), xt = txt(ui, 't-n', tr('对同一份证明，结论应当一致', 'On the same proof, they must agree'), 1020, 838); xt.style.fontSize = '28px';
  fromTo(xl, tX, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'power3.out' }); wipe(xt, tX + 0.2, { dir: 'l', d: 0.3 }); sfx('blip', tX, { g: 0.7, p: 0.4 });
  for (const e of [xl, xt]) wipeOut(e, tZ2 - 0.02, { dir: 'l', d: 0.2 });
  // 第三级：Mathlib
  const tIn3 = tZ2 + dZ2 - 0.2, n3 = bigN('', 1404, 250, 100); countTo(n3, RP.total, ML.theorems, tZ2 + 0.2, dZ2 + 0.6, (v) => group3(Math.round(v)));
  const mh = txt(ui, 't-2', 'Mathlib', 1406, 138); mh._slam = 1;
  const g3 = [mh, n3, txt(ui, 't-4', tr('条定理', 'theorems'), 1412, 362), txt(ui, 't-n dim', tr(`官方统计页 · ${ML.date}`, `Mathlib statistics · ${ML.date}`), 1412, 422)];
  g3[3].style.fontSize = '28px';
  group(g3, tIn3, 0); sfx('thud', tIn3, { g: 0.9, p: 0.4 });
  sfx('chime', tZ2 + dZ2 + 0.8, { g: 0.7, p: 0.4 }); sfx('tick', tIn3 + 0.45, { g: 0.6, p: -0.5 }); sfx('pop', Q(Tend('r6')) - 0.25, { g: 0.5, p: 0.4 }); sfx('tick', Q(Tend('r6')) + 0.5, { g: 0.5, p: -0.3 });
  const cL = txt(ui, 't-n', tr('Lean 核心库', 'Lean core library'), 92, 520), cL2 = txt(ui, 'mono t-n dim', group3(RP.total), 92, 560); cL.style.fontSize = '28px'; cL2.style.fontSize = '28px';
  group([cL, cL2], tIn3 + 0.2, 0);
  // 费马大定理
  const tF = Q(T('r7', { zh: '费马', en: 'Fermat' }));
  const fh = txt(ui, 't-3', tr('费马大定理', "Fermat's Last Theorem"), 1410, 560); if (LANG !== 'zh') fh.style.fontSize = '40px';
  const ff = txt(ui, 'num ac', 'x<sup>n</sup> + y<sup>n</sup> = z<sup>n</sup>', 1408, 640); css(ff, { fontSize: '60px', letterSpacing: '-.03em' });
  const fn = txt(ui, 't-n dim', tr('形式化进行中 · 斜线为示意', 'In progress · hatching is schematic'), 1412, 728); fn.style.fontSize = tr('28px', '26px');
  slam(fh, tF, { from: 1.25, d: 0.3 }); wipe(ff, tF + 0.25, { dir: 'l', d: 0.4 }); wipe(fn, tF + 0.6, { dir: 'l', d: 0.3 }); sfx('thud', tF, { g: 0.8, p: 0.5 }); sfx('pop', tF + 0.25, { g: 0.7, p: 0.5 });
  sfx('riser', s.end - 1.25, { g: 0.8 });

  // 常驻元素的字色：站 A 是纸色底；镜头右移时，纸与墨的分界先经过右上角，再经过左上角
  hudGround('L', s.start + WIPE - 0.05, tA1 + 0.5, 'paper'); hudGround('R', s.start + 0.12, tA1 + 0.28, 'paper');
});
