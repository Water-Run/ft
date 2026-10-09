// 各自的长处（102.5–142 秒）：例子只用前面出现过的 Qwen3.8。画布排成两行：上行是账本与成绩，下行依次是示意、显卡、结论。
// 站 L：账本，同一把尺子。红 = 每个 token 算的参数，白 → 蓝 = 要装进内存的参数。长度取 Qwen3.8-Flash-Next 模型卡成绩表表头的数字（125B / 6B，27B / 27B）；
//       字节数是文件头实测（语言模型部分，BF16）。
// 站 S：同一张成绩表里 12 项语言任务，Flash-Next（墨色）与 27B（灰）并排。
// 站 E：参数一样多时，稠密每个参数都用上（示意）。
// 站 G：许多张显卡（2.4T 的 BF16 权重要 24 张 B300）与一张显卡（27B）。出处：vLLM 官方部署指南（research/lab/11）。
// 站 C：结论。左列稠密，右列 MoE；上行内存（蓝），下行计算（红），块长按模型卡的数字。
scene('tradeoff', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const zh = LANG === 'zh', t0 = s.start, FL = DATA.flash, Q27 = DATA.q27, QM = DATA.qmax, RC = DATA.recipe;
  const [pF, p27] = FL.cardParams, [aF, a27] = FL.cardActive;
  const tag = (label, x, y, cls = 'bg-ink paper') => { const e = h('div', 'abs t-n ' + cls, world, label); px(e, x, y); css(e, { padding: '0 12px', fontWeight: 800 }); return e; };
  const grow = (e, t, d = 0.45) => fromTo(e, t, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0 50%', duration: d, ease: 'power3.out' });
  const yi = (n) => (zh ? n / 1e8 + ' 亿' : n / 1e9 + 'B');
  const gb = (b) => (b / 1e9).toFixed(0) + ' GB';
  // 白条：黑框纸色，里面一层蓝色等着刷
  const memBar = (x, y, w, hh, name) => {
    const g = h('div', 'abs', world); px(g, x, y, w, hh); g.dataset.name = name;
    blk(g, 'bg-ink', 0, 0, w, hh); blk(g, 'bg-paper', 6, 6, w - 12, hh - 12);
    const blue = blk(g, 'bg-blue', 6, 6, w - 12, hh - 12);
    return { g, blue };
  };

  // ── 站 L：账本 ──
  const BX = 520, BW = 1260, sc = BW / pF, BH = 64;
  const nF = txt(world, 't-3', 'Flash', 140, 112), tgF = tag('MoE', 140 + nF.offsetWidth + 20, 126);
  const lF1 = txt(world, 't-n', tr('每个 token 算', 'Per token'), 140, 228), lF2 = txt(world, 't-n', tr('要装进内存', 'In memory'), 140, 328);
  const n27 = txt(world, 't-3', '27B', 140, 452), tg27 = tag(tr('稠密', 'Dense'), 140 + n27.offsetWidth + 20, 466, 'bg-red paper');
  const l271 = txt(world, 't-n', tr('每个 token 算', 'Per token'), 140, 568), l272 = txt(world, 't-n', tr('要装进内存', 'In memory'), 140, 668);
  const cF = blk(world, 'bg-red', BX, 212, aF * sc, BH), c27 = blk(world, 'bg-red', BX, 552, a27 * sc, BH);
  cF.dataset.name = 'compute-flash'; c27.dataset.name = 'compute-27b';
  const mF = memBar(BX, 312, pF * sc, BH, 'memory-flash'), m27 = memBar(BX, 652, p27 * sc, BH, 'memory-27b');
  const vF1 = txt(world, 'num red', yi(aF), BX + aF * sc + 24, 222), v271 = txt(world, 'num red', yi(a27), BX + a27 * sc + 24, 562);
  [vF1, v271].forEach((e) => { e.style.fontSize = '48px'; });
  const tA = t0 + 0.1;
  [nF, lF1, n27, l271].forEach((e, i) => wipe(e, tA + i * 0.08, { dir: 'l', d: 0.3 }));
  slam(tgF, tA + 0.3, { from: 1.4, d: 0.3 }); slam(tg27, tA + 0.45, { from: 1.4, d: 0.3 }); sfx('pop', tA + 0.3, { g: 0.6 }); sfx('pop', tA + 0.45, { g: 0.6, p: -0.4 });
  const tC = Q(T('r1', { zh: '60', en: '6 billion' })) - 0.15;
  grow(cF, tC, 0.3); wipe(vF1, tC + 0.15, { dir: 'l', d: 0.25 }); sfx('thud', tC, { g: 0.8, p: 0.3 });
  grow(c27, tC + 0.4, 0.45); wipe(v271, tC + 0.7, { dir: 'l', d: 0.25 }); sfx('thud', tC + 0.45, { g: 0.7, p: -0.4 });

  // ── 站 S：成绩 ──
  const SX = 2200, SC_ = FL.scores, SY = 250, SP = 56, SBX = SX + 580, SBW = 760;
  const sh1 = txt(world, 't-3', tr('成绩：Flash 与 27B', 'Scores: Flash vs 27B'), SX + 120, 112);
  const sh2 = txt(world, 't-n dimp', tr('Qwen3.8-Flash-Next 模型卡 · 语言任务 12 项 · Flash 是基于它的官方版本', 'Qwen3.8-Flash-Next model card · 12 language tasks · Flash is the official version based on it'), SX + 120, 194);
  const tS = Math.min(Q(T('r1', { zh: '成绩', en: 'scores' })) - 0.4, tC + 1.0);           // 两条计算条画完就去看成绩，统计要留够时间读
  wipe(sh1, tS + 0.35, { dir: 'l', d: 0.35 }); wipe(sh2, tS + 0.5, { dir: 'l', d: 0.35 }); sfx('blip', tS + 0.35, { g: 0.5 });
  const lgF = blk(world, 'bg-ink', SX + 1530, 122, 34, 20), lgFt = txt(world, 't-n', 'Flash', SX + 1576, 110);
  const lg2 = blk(world, '', SX + 1530, 156, 34, 20), lg2t = txt(world, 't-n', '27B', SX + 1576, 144); css(lg2, { background: C.dim });
  [lgF, lgFt, lg2, lg2t].forEach((e) => appear(e, tS + 0.5));
  SC_.forEach(([bench, a, b], i) => {
    const y = SY + i * SP, ta = tS + 0.6 + i * 0.05;
    const nm = txt(world, 't-n', bench + (bench === "Agents' Last Exam" ? ' (Pass@1)' : ''), SX + 120, y + 4); css(nm, { fontSize: '28px' });
    const bA = blk(world, 'bg-ink', SBX, y + 2, SBW * a / 100, 20), bB = blk(world, '', SBX, y + 26, SBW * b / 100, 20); css(bB, { background: C.dim });
    const vA = txt(world, 'mono', a.toFixed(1) + ' <span class="dimp">/ ' + b.toFixed(1) + '</span>', SBX + SBW * Math.max(a, b) / 100 + 16, y + 7);   // Flash / 27B
    css(vA, { fontSize: '26px', fontWeight: 700 });
    wipe(nm, ta, { dir: 'l', d: 0.25 }); grow(bA, ta + 0.05, 0.4); grow(bB, ta + 0.1, 0.4); appear(vA, ta + 0.4);
    if (i % 2 === 0) sfx('tick', ta, { g: 0.4, p: -0.3 + i * 0.06 });
  });
  const tal = txt(world, 'num', '12/12', SX + 1500, 520); tal.style.fontSize = '120px';
  const talL = txt(world, 't-4', tr('项 Flash 更高', 'tasks:<br>Flash higher'), SX + 1506, 650); css(talL, { lineHeight: '1.2' });
  const tTal = tS + 0.6 + 12 * 0.05 + 0.3;
  slam(tal, tTal, { from: 1.35, d: 0.35 }); wipe(talL, tTal + 0.15, { dir: 'l', d: 0.3 }); sfx('thud', tTal, { g: 0.9 });

  // ── r2：算得少 → 快、省 ──
  const k2 = Math.max(T('r2') - 0.35, Q(T('r2', { zh: '算得少', en: 'means' })) - (zh ? 0.7 : 0.8));   // 镜头回到账本：成绩表至少停两秒
  const tLess = Math.max(Q(T('r2', { zh: '算得少', en: 'Less' })) - 0.1, k2 + 0.7);
  const rat = txt(world, 't-n', tr('= 27B 的约 1/4.5', '≈ 1/4.5 of 27B'), BX + aF * sc + 200, 232);
  wipe(rat, tLess, { dir: 'l', d: 0.3 }); sfx('pop', tLess, { g: 0.6, p: 0.3 });
  const fast = txt(world, 't-3 red', tr('更快', 'faster'), 1220, 200), cheap = txt(world, 't-3 red', tr('更省钱', 'cheaper'), 1220 + (zh ? 170 : 230), 200);
  const tFa = Q(T('r2', { zh: '快', en: 'faster' })) - 0.1, tCh = Q(T('r2', { zh: '省钱', en: 'cheaper' })) - 0.1;
  slam(fast, tFa, { from: 1.4, d: 0.3 }); sfx('thud', tFa, { g: 0.8, p: 0.4 });
  slam(cheap, tCh, { from: 1.4, d: 0.3 }); sfx('thud', tCh, { g: 0.8, p: 0.5 });

  // ── r3：代价是内存 ──
  const tMem = Q(T('r3', { zh: '内存', en: 'memory' })) - 0.2;
  [lF2, l272].forEach((e, i) => wipe(e, tMem - 0.1 + i * 0.1, { dir: 'l', d: 0.3 }));
  [mF, m27].forEach((m, i) => { vanish(m.blue, t0); grow(m.g, tMem + i * 0.15, i ? 0.4 : 0.7); });
  sfx('whoosh', tMem, { g: 0.6, p: 0.3 }); sfx('thud', tMem + 0.7, { g: 0.7 });
  const t4x = Q(T('r3', { zh: '四倍', en: 'four times' })) - 0.1;
  const x4 = txt(world, 't-3', '× ' + (pF / p27).toFixed(1), BX + p27 * sc + 30, 660);
  const x4n = txt(world, 't-n dimp', tr('模型卡：125B 与 27B', 'Model card: 125B vs 27B'), BX + p27 * sc + 220, 676);
  slam(x4, t4x, { from: 1.4, d: 0.3 }); wipe(x4n, t4x + 0.2, { dir: 'l', d: 0.3 }); sfx('thud', t4x, { g: 0.8, p: -0.2 });
  const tLoad = Q(T('r3', { zh: '装进去', en: 'loaded' })) - 0.35;
  wipe(mF.blue, tLoad, { dir: 'l', d: 0.6, ease: 'power2.inOut' }); wipe(m27.blue, tLoad + 0.1, { dir: 'l', d: 0.25 }); sfx('riser', tLoad - 0.4, { g: 0.3 }); sfx('thud', tLoad + 0.6, { g: 0.7, p: 0.4 });
  const gbF = txt(world, 'paper', gb(FL.bytes), BX + 30, 322), gb27 = txt(world, 'paper', gb(Q27.lmBytes), BX + 24, 662);
  [gbF, gb27].forEach((e) => css(e, { font: '800 40px "Mono"' }));
  appear(gbF, tLoad + 0.5); appear(gb27, tLoad + 0.35);
  const memN = txt(world, 't-n dimp', tr('权重按 BF16 计（语言模型部分，按文件逐个张量计数）；Flash 另有 510 亿 n-gram 嵌入，可卸到主机内存', 'BF16 weights of the language model, counted tensor by tensor; Flash\'s extra 51B n-gram embedding can be offloaded to host memory'), BX, 756);
  css(memN, { whiteSpace: 'normal', width: BW + 'px' });
  wipe(memN, tLoad + 0.7, { dir: 'l', d: 0.45 });

  // ── 站 E：参数一样多（示意）──
  const EY = 1100, EC = 10, ECW = 34, ELN = 6, EWS = ELN + EC * (ECW + ELN);
  const eL = makeWall(world, { x: 340, y: EY + 270, cols: EC, rows: EC, cw: ECW, ch: ECW, line: ELN, name: 'equal-dense' });
  const eR = makeWall(world, { x: 1920 - 340 - EWS, y: EY + 270, cols: EC, rows: EC, cw: ECW, ch: ECW, line: ELN, name: 'equal-moe' });
  const eh = txt(world, 't-2', tr('参数一样多', 'Equal parameters'), 0, EY + 52); px(eh, 960 - eh.offsetWidth / 2, EY + 52);
  const eNL = txt(world, 't-3', tr('稠密', 'Dense'), 340, EY + 190), eNR = txt(world, 't-3', 'MoE', 1920 - 340 - EWS, EY + 190);
  const eq = txt(world, 'ink', '=', 0, EY + 340); css(eq, { font: '900 220px "Inter"', lineHeight: '1' }); px(eq, 960 - eq.offsetWidth / 2, EY + 340);
  const tE = T('r4'), tEq = Q(T('r4', { zh: '一样多', en: 'equal' })) - 0.15, tStr = Q(T('r4', { zh: '稠密更强', en: 'dense is stronger' })) - 0.1, tUse = Q(T('r4', { zh: '派上用场', en: 'every parameter' })) - 0.2;
  [eL, eR].forEach((w, k) => { wipe(w.frame, tE + 0.1 + k * 0.1, { dir: 'l', d: 0.4 }); });
  const eRnd = seeded(5), eLit = new Set(); while (eLit.size < 8) eLit.add(Math.floor(eRnd() * EC * EC));
  eL.paint((i, c, r, t) => (t < tE + 0.35 ? 'h' : t >= tStr + c * 0.04 ? 'r' : 'p'));                // 稠密：读到「稠密更强」时一列列全部涂红
  eR.paint((i, c, r, t) => (t < tE + 0.45 ? 'h' : t >= tStr + 0.3 && eLit.has(i) ? 'r' : 'p'));     // MoE：同样的参数，每个 token 只用几格
  sfx('whoosh', tE + 0.1, { g: 0.5 });
  [eNL, eNR].forEach((e, k) => wipe(e, tE + 0.3 + k * 0.1, { dir: 'l', d: 0.3 }));
  slam(eh, tEq, { from: 1.3, d: 0.35 }); slam(eq, tEq + 0.1, { from: 1.5, d: 0.3 }); sfx('thud', tEq, { g: 0.8 });
  swapAt(eq, '=', '&gt;', tStr); sfx('thud', tStr, { g: 0.9, p: -0.3 });
  for (let c = 0; c < EC; c += 2) sfx('tick', tStr + c * 0.04, { g: 0.4, p: -0.5 + c * 0.08 });
  const eS = txt(world, 't-3 red', tr('更强', 'stronger'), 340, EY + 270 + EWS + 30);
  slam(eS, tStr + 0.1, { from: 1.4, d: 0.3 });
  const eU = txt(world, 't-n', tr('每个参数都派上用场', 'every parameter does work'), 340, EY + 270 + EWS + 110);
  const eU2 = txt(world, 't-n', tr('每个 token 只用其中几格', 'each token uses only a few'), 1920 - 340 - EWS, EY + 270 + EWS + 30);
  wipe(eU, tUse, { dir: 'l', d: 0.35 }); wipe(eU2, tStr + 0.6, { dir: 'l', d: 0.35 }); sfx('pop', tUse, { g: 0.5 });
  const eIll = txt(world, 't-n dimp', tr('示意', 'Illustration'), 0, EY + 104); px(eIll, 1920 - 140 - eIll.offsetWidth, EY + 120);
  wipe(eIll, tE + 0.5, { dir: 'r', d: 0.3 });

  // ── 站 G1：许多张显卡 ──
  const G1 = 2200, GC = 6, GR = 4, CDW = 200, CDH = 130, CG = 30, GX = G1 + 140, GY = EY + 250;
  const gh = txt(world, 't-4', tr('Qwen3.8-2.4T：BF16 权重 ' + RC.maxGB + ' GB', 'Qwen3.8-2.4T: ' + RC.maxGB + ' GB of BF16 weights'), G1 + 140, EY + 96);
  const gs = txt(world, 't-n dimp', tr('要 ' + RC.maxB300 + ' 张 B300 显卡（每张 268 GB）· vLLM 部署指南', 'needs ' + RC.maxB300 + ' B300 GPUs (268 GB each) · vLLM deployment guide'), G1 + 140, EY + 160);
  const tG = T('r5'), tMany = Q(T('r5', { zh: '许多张', en: 'many GPUs' })) - 0.25, tCmp = Q(T('r5', { zh: '算力', en: 'compute' })) - 0.15, tMo = Q(T('r5', 'MoE')) - 0.1;
  wipe(gh, tG + 0.1, { dir: 'l', d: 0.35 }); wipe(gs, tG + 0.3, { dir: 'l', d: 0.35 });
  const fill = (RC.maxGB / RC.maxB300) / 268, gRnd = seeded(11);
  for (let k = 0; k < GC * GR; k++) {
    const x = GX + (k % GC) * (CDW + CG), y = GY + Math.floor(k / GC) * (CDH + CG);
    const f = blk(world, 'bg-ink', x, y, CDW, CDH); f.dataset.name = 'gpu';
    const in_ = blk(world, 'bg-paper', x + 8, y + 8, CDW - 16, CDH - 16);
    const bl = blk(world, 'bg-blue', x + 8, y + 8, (CDW - 16) * fill, CDH - 16);
    const rd = blk(world, 'bg-red', x + 8 + Math.floor(gRnd() * ((CDW - 16) * fill - 20)), y + 8 + Math.floor(gRnd() * (CDH - 16 - 20)), 20, 20);
    const ta = tMany + (k % GC) * 0.05 + Math.floor(k / GC) * 0.08;
    slam(f, ta, { from: 1.25, d: 0.25 }); appear(in_, ta);
    wipe(bl, ta + 0.6, { dir: 'l', d: 0.35 });
    appear(rd, tCmp + 0.2 + (k % GC) * 0.08);
  }
  for (let r = 0; r < GR; r++) sfx('tick', tMany + r * 0.08, { g: 0.5, p: -0.3 + r * 0.2 });
  sfx('whoosh', tMany + 0.6, { g: 0.5, p: 0.3 });
  const gTok = tokenBlock(world, '', GX - 90, GY + 2 * (CDH + CG) - CG / 2 - 30, 60);
  appear(gTok, tCmp); fromTo(gTok, tCmp, { x: 0 }, { x: GC * (CDW + CG) + 60, duration: 0.9, ease: 'none', immediateRender: false }); to(gTok, tCmp + 0.9, { autoAlpha: 0, duration: 0.15 });
  for (let c = 0; c < GC; c++) sfx('blip', tCmp + 0.2 + c * 0.08, { g: 0.35, p: c * 0.1 });
  const RXL = GX + GC * (CDW + CG) + 20;
  const fit = txt(world, 't-3 blue', tr('装得下', 'it fits'), RXL, GY);
  wipe(fit, tMany + 1.0, { dir: 'l', d: 0.3 }); sfx('pop', tMany + 1.0, { g: 0.5 });
  const cmpL = txt(world, 't-4 red', tr('每个 token<br>只算 ' + (QM.share * 100).toFixed(1) + '%', 'each token<br>uses ' + (QM.share * 100).toFixed(1) + '%'), RXL, GY + 150); css(cmpL, { lineHeight: '1.2' });
  wipe(cmpL, tCmp + 0.5, { dir: 'l', d: 0.35 }); sfx('thud', tCmp + 0.5, { g: 0.7 });
  const moeT = h('div', 'abs bg-ink paper t-2', world, 'MoE'); px(moeT, RXL, GY + 330); css(moeT, { padding: '0 22px' });
  slam(moeT, tMo, { from: 1.4, d: 0.3 }); sfx('thud', tMo, { g: 0.9, p: 0.4 });
  const gIll = txt(world, 't-n dimp', tr('红点为示意', 'Red marks illustrative'), GX, GY + GR * (CDH + CG) + 4);
  wipe(gIll, tCmp + 0.8, { dir: 'l', d: 0.3 });

  // ── 站 G2：一张显卡 ──
  const G2 = 4400, CX2 = G2 + 180, CY2 = EY + 260, CW = 760, CH = 460;
  const g2h = txt(world, 't-3', tr('一张显卡', 'One GPU'), CX2, EY + 110);
  const card = blk(world, 'bg-ink', CX2, CY2, CW, CH), cardIn = blk(world, 'bg-paper', CX2 + 14, CY2 + 14, CW - 28, CH - 28); card.dataset.name = 'one-gpu';
  const b27 = blk(world, 'bg-blue', CX2 + 50, CY2 + 50, 300, CH - 100), r27 = blk(world, 'bg-red', CX2 + 50, CY2 + 50, 300, CH - 100);
  const l27 = txt(world, 'paper', '27B', CX2 + 80, CY2 + 80); css(l27, { font: '900 96px "Inter"', letterSpacing: '-.03em', lineHeight: '1' }); l27.dataset.overlapOk = '1';
  const tOne = Q(T('r6', { zh: '一张', en: 'one GPU' })) - 0.2, tM6 = Q(T('r6', { zh: '内存', en: 'memory' })) - 0.15, tD6 = Q(T('r6', { zh: '稠密', en: 'dense' })) - 0.1;
  wipe(g2h, T('r6') + 0.05, { dir: 'l', d: 0.3 });
  slam(card, tOne, { from: 1.3, d: 0.35 }); appear(cardIn, tOne); sfx('thud', tOne, { g: 0.8, p: -0.3 });
  wipe(b27, tM6, { dir: 'b', d: 0.4 }); appear(l27, tM6 + 0.3); sfx('whoosh', tM6, { g: 0.5 });
  vanish(r27, t0); wipe(r27, tD6, { dir: 'l', d: 0.35 }); sfx('thud', tD6 + 0.2, { g: 0.8, p: -0.4 });
  const memL = txt(world, 't-n', tr('显存装得下的参数有限', 'Only so many parameters fit'), CX2 + 380, CY2 + 60); css(memL, { whiteSpace: 'normal', width: '340px' });
  wipe(memL, tM6 + 0.3, { dir: 'l', d: 0.35 });
  const useL = txt(world, 't-n', tr('稠密：装进去的每个参数都派上用场', 'Dense: every parameter loaded does work'), CX2 + 380, CY2 + 200); css(useL, { whiteSpace: 'normal', width: '340px' });
  wipe(useL, tD6 + 0.35, { dir: 'l', d: 0.35 });
  const QX = G2 + 1020, qbar = blk(world, 'bg-ink', QX, CY2, 14, 250);
  const qt = txt(world, 'ink', '“' + RC.fit27 + '”', QX + 40, CY2); css(qt, { font: '800 44px "Inter"', whiteSpace: 'normal', width: '780px', lineHeight: '1.2' });
  const qz = zh ? txt(world, 't-n', '（每种精度都放得进一张 Blackwell 显卡）', QX + 40, CY2 + 130) : null;
  const qs2 = txt(world, 't-n dimp', tr('vLLM 部署指南 · Qwen3.8-27B', 'vLLM deployment guide · Qwen3.8-27B'), QX + 40, CY2 + 190);
  const tQ = Math.max(tOne + 0.4, T('r6') + 0.6);
  wipe(qbar, tQ, { dir: 't', d: 0.3 }); wipe(qt, tQ + 0.1, { dir: 'l', d: 0.5 }); wipe(qs2, tQ + 0.4, { dir: 'l', d: 0.3 }); if (qz) wipe(qz, tQ + 0.3, { dir: 'l', d: 0.35 });
  sfx('blip', tQ + 0.1, { g: 0.5, p: 0.4 });

  // ── 站 C：结论 ──
  const X0 = 6600, Y0 = EY, VL = X0 + 900, HL = Y0 + 500, GL = 24, k = 760 / pF;
  const vl = blk(world, 'bg-ink', VL, Y0 - 200, GL, VH + 400), hl = blk(world, 'bg-ink', X0 - 200, HL, 2320, GL);
  const cDn = txt(world, 't-2', tr('稠密', 'Dense'), X0 + 140, Y0 + 96), cMo = txt(world, 't-2', 'MoE', VL + GL + 80, Y0 + 96);
  const rows = [['mem', HL - 250, 'bg-blue', [p27, pF], tr('内存', 'Memory')], ['cmp', HL + GL + 70, 'bg-red', [a27, aF], tr('计算', 'Compute')]];
  const tGo = Tend('r6') + 0.1, tDS = Math.max(Q(T('r7', { zh: '稠密', en: 'Dense' })), tGo + 1.1), tMS = Math.max(Q(T('r7', 'MoE')) - 0.05, tDS + 0.5), tWh = Q(T('r7', { zh: '哪一样', en: 'which' })) - 0.1;
  wipe(vl, tGo + 0.25, { dir: 't', d: 0.45 }); wipe(hl, tGo + 0.4, { dir: 'l', d: 0.45 }); sfx('thud', tGo + 0.6, { g: 0.7, p: -0.3 });
  wipe(cDn, tGo + 0.5, { dir: 'l', d: 0.3 }); wipe(cMo, tGo + 0.6, { dir: 'l', d: 0.3 });
  const labs = [];
  rows.forEach(([id, y, cls, [vD, vM], lab], r) => {
    [[X0 + 140, vD], [VL + GL + 80, vM]].forEach(([x, v], c) => {
      const b = blk(world, cls, x, y, Math.max(8, v * k), 180); b.dataset.name = 'ccl-' + id + (c ? '-moe' : '-dense');
      const l = txt(world, 't-n ' + (r ? 'red' : 'blue'), lab + ' · ' + yi(v), x, y - 46); css(l, { padding: '0 8px', marginLeft: '-8px' });
      grow(b, tGo + 0.55 + r * 0.15 + c * 0.1, 0.4); wipe(l, tGo + 0.65 + r * 0.15 + c * 0.1, { dir: 'l', d: 0.3 });
      labs.push(l);
    });
  });
  sfx('pop', tGo + 0.55, { g: 0.5 }); sfx('pop', tGo + 0.7, { g: 0.5, p: 0.3 });
  const sD = txt(world, 't-2 blue', tr('省内存', 'saves memory'), X0 + 140 + p27 * k + 40, HL - 220), sM = txt(world, 't-2 red', tr('省计算', 'saves compute'), VL + GL + 80 + aF * k + 40, HL + GL + 100);
  if (!zh) [sD, sM].forEach((e) => { e.style.fontSize = '76px'; });
  slam(sD, tDS, { from: 1.35, d: 0.35 }); sfx('thud', tDS, { g: 0.9, p: -0.4 });
  slam(sM, tMS, { from: 1.35, d: 0.35 }); sfx('thud', tMS, { g: 0.9, p: 0.4 });
  labs.forEach((l, i) => classAt(l, i < 2 ? 'cmem' : 'ccmp', tWh + (i < 2 ? 0 : 0.25)));
  sfx('pop', tWh, { g: 0.6, p: -0.2 }); sfx('pop', tWh + 0.25, { g: 0.6, p: 0.3 });
  const cN = txt(world, 't-n dimp', tr('块长按模型卡：Flash-Next 125B / 激活 6B，27B 27B / 27B', 'Block lengths from the model cards: Flash-Next 125B / 6B active; 27B 27B / 27B'), X0 + 140, Y0 + 830);
  css(cN, { whiteSpace: 'normal', width: (VL - X0 - 180) + 'px' });
  wipe(cN, tGo + 1.2, { dir: 'l', d: 0.4 });

  // ── 镜头 ──
  const cL = { x: 960, y: 470 }, cS = { x: SX + 960, y: 470 }, cE = { x: 960, y: EY + 470 }, cG1 = { x: G1 + 960, y: EY + 470 }, cG2 = { x: G2 + 960, y: EY + 470 }, cC = { x: X0 + 960, y: EY + 470 };
  const k4 = T('r4') - 0.35, k5 = T('r5') - 0.35, k6 = T('r6') - 0.35;
  cam.track(t0, { ...cL, x: 940, z: 1.03 }, [
    [t0 + 0.02, { ...cL, z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [t0 + 0.85, { x: cL.x + 15 }, tS - t0 - 0.9, { ease: 'none', sfx: false }],
    [tS, { ...cS, z: 1 }, 0.9, { g: 0.7 }],
    [tS + 0.95, { x: cS.x + 15, z: 1.01 }, k2 - tS - 1.0, { ease: 'none', sfx: false }],
    [k2, { ...cL, z: 1 }, 0.9, { g: 0.7 }],
    [k2 + 0.95, { x: cL.x + 20, z: 1.012 }, k4 - k2 - 1.0, { ease: 'none', sfx: false }],
    [k4, { ...cE, z: 1 }, 0.9, { g: 0.7 }],
    [k4 + 0.95, { x: cE.x + 15, z: 1.01 }, k5 - k4 - 1.0, { ease: 'none', sfx: false }],
    [k5, { ...cG1, z: 1 }, 0.9, { g: 0.7 }],
    [k5 + 0.95, { x: cG1.x + 15, z: 1.01 }, k6 - k5 - 1.0, { ease: 'none', sfx: false }],
    [k6, { ...cG2, z: 1 }, 0.9, { g: 0.7 }],
    [k6 + 0.95, { x: cG2.x + 15, z: 1.01 }, tGo - k6 - 1.0, { ease: 'none', sfx: false }],
    [tGo, { ...cC, z: 1.03 }, 0.9, { g: 0.8 }],
    [tGo + 0.95, { z: 1.0 }, s.end + WIPE - tGo - 1.0, { ease: 'none', sfx: false }],
  ]);
});
