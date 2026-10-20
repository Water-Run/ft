// 先后关系与今天的格局（61–102.5 秒）。全片只在这里点名 Qwen3.8 一次（m2）。
// 站 H：一条时间线。1991 年的论文（示意图）→ 2020 年 GPT-3（稠密，整块红）→ GLaM、DeepSeek-V3、Llama 4 Maverick（MoE，白底上一窄条红）。
//       方块的面积按总参数，红条的宽度按每个 token 激活的参数（论文与发布博客原文）。
// 站 S：2026 年 6 月以后发布的开源模型（research/lab/09），条长按模型卡写的总参数，红段 = 激活参数；稠密的两条整条红。
// 站 Q：Qwen3.8 的三个型号，面积按语言模型的参数个数（文件头实测）。
// 站 F：Flash 的方块长成 48 行的参数墙（Qwen3.8-Flash-Next 的文件头计数，每行按实际比例：注意力与共享专家 | 路由器 | 512 个专家）。
// 站 R：墙上的一行放大成一层：512 个专家排成 16 × 32，选中 10 个（位置为示意），另有 1 个共享专家，每个 token 都用。
scene('qwen', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const zh = LANG === 'zh', t0 = s.start, FL = DATA.flash, QM = DATA.qmax, Q27 = DATA.q27;
  const FR = 10;
  // 方块：黑框 + 纸色 + 左侧红条（宽度按激活比例）。底边落在 yb 上
  const square = (x, yb, side, share, name) => {
    const g = h('div', 'abs', world); px(g, x - FR, yb - side - 2 * FR, side + 2 * FR, side + 2 * FR); g.dataset.name = name;
    blk(g, 'bg-ink', 0, 0, side + 2 * FR, side + 2 * FR); blk(g, 'bg-paper', FR, FR, side, side);
    const red = blk(g, 'bg-red', FR, FR, Math.max(3, side * share), side);
    return { g, red };
  };
  // 由一个矩形长成另一个矩形（只用 transform，由 t 直接算出）
  const growFrom = (el, tA, d, from, to_) => {
    let last = null;
    F((t) => {
      const k = ease.io3(clamp((t - tA) / d));
      const v = t < tA ? 'h' : k >= 1 ? 'n' : [(from.x - to_.x) * (1 - k), (from.y - to_.y) * (1 - k), lerp(from.w / to_.w, 1, k), lerp(from.h / to_.h, 1, k)].map((x) => x.toFixed(4)).join(',');
      if (v === last) return; last = v;
      if (v === 'h') { el.style.visibility = 'hidden'; return; }
      el.style.visibility = 'visible';
      if (v === 'n') { el.style.transform = 'none'; return; }
      const [dx, dy, sx, sy] = v.split(',');
      el.style.transformOrigin = '0 0'; el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    });
  };
  const fmtB = (n) => (n >= 1e12 ? +(n / 1e12).toFixed(2) + 'T' : +(n / 1e9).toFixed(1) + 'B');
  const zhNum = (n) => (n >= 1e12 ? +(n / 1e12).toFixed(2) + ' 万亿' : +(n / 1e8).toFixed(0) + ' 亿');
  const tag = (parent, label, x, y, cls = 'bg-ink paper') => { const e = h('div', 'abs t-n ' + cls, parent, label); px(e, x, y); css(e, { padding: '0 12px', fontWeight: 800 }); return e; };

  // ── 站 H：时间线 ──
  const BL = 650;                                                     // 时间线（粗黑线）的上沿
  rule(world, -400, BL, 1800, 18, t0 + 0.15, 'l', 0.6);
  rule(world, 1480, BL, 2000, 18, Q(T('h2')) - 0.3, 'l', 0.7);       // 中间断开：1991 与 2020 之间隔了将近 30 年
  [1416, 1448].forEach((x, i) => rule(world, x, BL - 26, 12, 70, t0 + 0.6 + i * 0.06, 't', 0.25));
  sfx('whoosh', t0 + 0.15, { g: 0.5 });
  // 1991：示意图。token（黄）→ 门控网络 → 四个专家里选一个（红）
  const tY = Q(T('h1', '1991'));
  const y91 = txt(world, '', '1991', 120, BL + 34); css(y91, { font: '900 176px "Inter"', letterSpacing: '-.04em', lineHeight: '1' });
  slam(y91, tY, { from: 1.4, d: 0.4 }); sfx('thud', tY, { g: 0.9, p: -0.4 });
  const GX = 560, GY = 170, EW = 150, EH = 70;
  const gate = blk(world, 'bg-ink', GX, GY + 150, 150, 150); const gIn = blk(world, 'bg-paper', GX + 10, GY + 160, 130, 130);
  const gL = txt(world, 'ink', tr('门控', 'Gate'), GX + 22, GY + 202); css(gL, { font: zh ? '800 40px "Sans SC"' : '800 40px "Inter"' });
  const exps = [0, 1, 2, 3].map((i) => {
    const y = GY + i * (EH + 26), x = GX + 260;
    const f = blk(world, 'bg-ink', x, y, EW, EH), in_ = blk(world, 'bg-paper', x + 8, y + 8, EW - 16, EH - 16);
    const r = i === 2 ? blk(world, 'bg-red', x + 8, y + 8, EW - 16, EH - 16) : null;   // 门控挑中的那一个
    return { f, in_, r, y };
  });
  const wires = exps.map((e) => blk(world, 'bg-ink', GX + 150, e.y + EH / 2 - 3, 110, 6));
  const tok91 = tokenBlock(world, '', GX - 130, GY + 195, 60);
  const tDia = t0 + 0.55;
  wipe(gate, tDia, { dir: 'l', d: 0.3 }); appear(gIn, tDia); wipe(gL, tDia + 0.15, { dir: 'l', d: 0.25 });
  exps.forEach((e, i) => { wipe(e.f, tDia + 0.25 + i * 0.07, { dir: 'l', d: 0.3 }); appear(e.in_, tDia + 0.25 + i * 0.07); sfx('tick', tDia + 0.25 + i * 0.07, { g: 0.4, p: -0.2 + i * 0.15 }); });
  wires.forEach((w, i) => wipe(w, tDia + 0.2 + i * 0.07, { dir: 'l', d: 0.25 }));
  slide(tok91, tDia + 0.6, { x: -120, d: 0.4 }); sfx('pop', tDia + 0.6, { g: 0.5 });
  const tPick = Math.max(tDia + 1.2, Q(T('h1', { zh: '更早', en: 'older' })));
  wipe(exps[2].r, tPick, { dir: 'l', d: 0.25 }); sfx('thud', tPick, { g: 0.6, p: 0.3 });
  [0, 1, 3].forEach((i) => to(wires[i], tPick, { autoAlpha: 0.25, duration: 0.2 }));
  const dia = txt(world, 't-n dimp', tr('示意：门控网络为每个输入挑选专家', 'Illustration: a gating network picks an expert for each input'), GX - 130, GY + 420);
  wipe(dia, tPick + 0.2, { dir: 'l', d: 0.35 });
  const ttl = txt(world, '', 'Adaptive Mixtures of Local Experts', 620, BL + 60); css(ttl, { font: '800 44px "Inter"' });
  const aut = txt(world, 't-n dimp', 'Jacobs, Jordan, Nowlan, Hinton · Neural Computation', 620, BL + 122);
  const tPaper = Q(T('h1', { zh: '论文', en: 'paper' })) - 0.25;
  wipe(ttl, tPaper, { dir: 'l', d: 0.4 }); wipe(aut, tPaper + 0.15, { dir: 'l', d: 0.35 }); sfx('blip', tPaper, { g: 0.5 });

  [y91, gL, dia, ttl, aut].forEach((e, i) => wipeOut(e, T('h2') - 0.3 + i * 0.03, { dir: 'l', d: 0.3 }));   // 镜头移向 2020，1991 的字收走，图形留在画面左缘

  // 2020 → 2025：面积按总参数，红条按激活参数
  const HK = 420 / Math.sqrt(1.2e12), HX = [1580, 1870, 2440, 2900];
  const hist = DATA.history.map(([name, year, total, active], i) => {
    const side = HK * Math.sqrt(total), x = HX[i];
    const sq = square(x, BL, side, active / total, 'history-' + name);
    const yr = txt(world, 't-3', String(year), x - FR, BL + 40);                            // 线下：年份、名字、参数
    const nm = txt(world, 't-4', name, x - FR, BL + 112);
    const sz = txt(world, 't-n', zh ? zhNum(total) + (active < total ? ' · 激活 ' + zhNum(active) : ' · 全部参与') : fmtB(total) + (active < total ? ' · ' + fmtB(active) + ' active' : ' · all used'), x - FR, BL + 166);
    return { sq, nm, sz, yr, side, x };
  });
  if (!zh) hist[3].nm.style.fontSize = '40px';
  // h2：稠密的 GPT-3
  const g3 = hist[0], tDense = Q(T('h2', { zh: '稠密', en: 'dense' }));
  slam(g3.sq.g, tDense, { from: 1.35, d: 0.35 }); sfx('thud', tDense, { g: 0.8, p: -0.5 });
  const dTag = tag(world, tr('稠密', 'Dense'), g3.x - FR, BL - g3.side - 2 * FR - 52);
  wipe(dTag, tDense + 0.1, { dir: 'l', d: 0.25 });
  const tG3 = Q(T('h2', 'GPT-3')) - 0.15, tY20 = Q(T('h2', '2020')) - 0.1;
  wipe(g3.nm, tG3, { dir: 'l', d: 0.3 }); wipe(g3.sz, tG3 + 0.12, { dir: 'l', d: 0.3 }); sfx('pop', tG3, { g: 0.6 });
  slam(g3.yr, tY20, { from: 1.3, d: 0.3 }); sfx('tick', tY20, { g: 0.6 });
  // h3：后来的 MoE
  [['GLaM', 1], ['DeepSeek', 2], ['Llama', 3]].forEach(([w, i]) => {
    const it = hist[i], ta = Q(T('h3', w)) - 0.15;
    fromTo(it.sq.g, ta, { autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'power3.out' });
    sfx('thud', ta + 0.1, { g: 0.7, p: -0.2 + i * 0.2 });
    wipe(it.nm, ta + 0.15, { dir: 'l', d: 0.3 }); wipe(it.sz, ta + 0.25, { dir: 'l', d: 0.3 }); wipe(it.yr, ta + 0.1, { dir: 'l', d: 0.3 });
  });
  const tUse = Q(T('h3', { zh: '用上', en: 'adopted' })) - 0.1;
  hist.slice(1).forEach((it, k) => { const e = tag(world, 'MoE', it.x - FR, BL - it.side - 2 * FR - 52); slam(e, tUse + k * 0.12, { from: 1.4, d: 0.3 }); sfx('pop', tUse + k * 0.12, { g: 0.6, p: 0.2 + k * 0.2 }); });
  const hSrc = txt(world, 't-n dimp', tr('面积 = 总参数，红 = 每个 token 激活的参数 · 出处：各自的论文与发布博客', 'Area = total parameters, red = activated per token · from each paper or launch post'), 1570, 92);
  wipe(hSrc, tUse + 0.4, { dir: 'l', d: 0.4 });

  // ── 站 S：2026 年 6 月以后发布的开源模型 ──
  const SX = 3600, SV = DATA.survey, rows = SV.rows;
  const RY = 300, RP = 52, RH = 34, BX = SX + 590, BW = 1000, maxT = rows[0][1];
  const sh1 = txt(world, 't-3', tr('2026 年 6 月以后发布的开源模型', 'Open models released since June 2026'), SX + 120, 128);
  const sh2 = txt(world, 't-n dimp', tr('按总参数排列（取自各模型卡）· 红 = 每个 token 激活的参数', 'Sorted by total parameters (from each model card) · red = activated per token'), SX + 120, 206);
  const tM1 = T('m1');
  wipe(sh1, tM1 - 0.1, { dir: 'l', d: 0.4 }); wipe(sh2, tM1 + 0.1, { dir: 'l', d: 0.4 }); sfx('blip', tM1 - 0.1, { g: 0.5 });
  rows.forEach(([name, total, active, moe], i) => {
    const y = RY + i * RP, w = Math.max(14, BW * total / maxT);
    const nm = txt(world, 't-n', name, SX + 222, y - 1);
    const g = h('div', 'abs', world); px(g, BX, y, w, RH); g.dataset.name = 'survey-bar';
    blk(g, 'bg-ink', 0, 0, w, RH); blk(g, 'bg-paper', 3, 3, w - 6, RH - 6);
    blk(g, 'bg-red', 3, 3, moe ? Math.max(3, (w - 6) * active / total) : w - 6, RH - 6);
    const v = txt(world, 'mono', moe ? fmtB(total) + ' / ' + fmtB(active) : fmtB(total) + tr(' · 稠密', ' · dense'), BX + w + 16, y); css(v, { fontSize: '28px', fontWeight: 700 });
    const ta = tM1 + 0.35 + i * 0.09;
    wipe(nm, ta, { dir: 'l', d: 0.25 });
    fromTo(g, ta, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0 50%', duration: 0.45, ease: 'power3.out' });
    wipe(v, ta + 0.3, { dir: 'l', d: 0.2 });
    if (i % 2 === 0) sfx('tick', ta, { g: 0.45, p: 0.4 - i * 0.07 });
  });
  const nMoE = rows.filter((r) => r[3]).length;
  const brM = blk(world, 'bg-ink', SX + 186, RY, 14, (nMoE - 1) * RP + RH), lbM = txt(world, 't-4', 'MoE', 0, RY + ((nMoE - 1) * RP + RH) / 2 - 26);
  const brD = blk(world, 'bg-ink', SX + 186, RY + nMoE * RP, 14, (rows.length - nMoE - 1) * RP + RH), lbD = txt(world, 't-4 red', tr('稠密', 'Dense'), 0, RY + nMoE * RP + 18);
  if (!zh) lbD.style.fontSize = '36px';
  [lbM, lbD].forEach((e) => px(e, SX + 170 - e.offsetWidth, parseFloat(e.style.top)));        // 右对齐到括号
  const tMo = Q(T('m1', 'MoE')) - 0.1, tDe = Q(T('m1', { zh: '稠密', en: 'dense' })) - 0.1;
  wipe(brM, tMo, { dir: 't', d: 0.4 }); slam(lbM, tMo + 0.1, { from: 1.4, d: 0.3 }); sfx('thud', tMo + 0.1, { g: 0.8, p: 0.2 });
  wipe(brD, tDe, { dir: 't', d: 0.25 }); slam(lbD, tDe + 0.1, { from: 1.4, d: 0.3 }); sfx('thud', tDe + 0.1, { g: 0.8, p: -0.4 });
  const scan = txt(world, 't-n', tr('另查：6 月以后发布、1000 亿参数以上的新模型<br>共 ' + SV.scanN + ' 个，全部是 MoE', 'Also checked: all ' + SV.scanN + ' new models above<br>100 billion parameters since June are MoE'), SX + 1000, RY + 8 * RP + 6);
  css(scan, { whiteSpace: 'nowrap', lineHeight: '1.35' });
  const scanSrc = txt(world, 't-n dimp', tr('Hugging Face，2026-10-09 查得', 'Hugging Face, checked 2026-10-09'), SX + 1000, RY + 8 * RP + 98);
  const tSc = Math.min(Q(T('m1', { zh: '较小', en: 'smaller' })), Tend('m1') - 0.3);
  wipe(scan, tSc, { dir: 'l', d: 0.4 }); wipe(scanSrc, tSc + 0.2, { dir: 'l', d: 0.3 }); sfx('blip', tSc, { g: 0.5 });

  // ── 站 Q：Qwen3.8 的三个型号（画布上在清单的正下方）──
  const FY = 1100, QB = FY + 820, QK = 560 / Math.sqrt(QM.lm);
  const qs = [['27B', Q27.lm, 1, SX + 200, false], ['Flash', FL.lm, FL.share, SX + 380, true], ['2.4T', QM.lm, QM.share, SX + 640, true]].map(([name, n, share, x, moe]) => {
    const side = QK * Math.sqrt(n), sq = square(x, QB, side, share, 'qwen-' + name);
    const nm = txt(world, 't-3', name, x - FR, QB - side - 2 * FR - 84);
    return { name, side, sq, nm, x, moe };
  });
  const [q27, qF, qM] = qs;
  const qRule = rule(world, SX - 300, QB, 2500, 18, T('m2') - 0.2, 'l', 0.6);
  const qh = txt(world, 't-2', 'Qwen3.8', SX + 120, FY + 120);
  const qNote = txt(world, 't-n dimp', tr('面积 = 语言模型的参数个数（按权重文件逐个张量计数）', 'Area = language-model parameters (counted tensor by tensor)'), SX + 190, QB + 44);
  const tm2 = T('m2');
  wipe(qh, tm2 + 0.1, { dir: 'l', d: 0.4 }); sfx('pop', tm2 + 0.1, { g: 0.6 });
  const tFl = Q(T('m2', 'Flash')) - 0.15, tMx = Q(T('m2', { zh: '二点四', en: 'two point four' })) - 0.15, tMoE = Q(T('m2', 'MoE')) - 0.1;
  [qF.sq.red, qM.sq.red].forEach((r) => vanish(r, t0));
  slam(qF.sq.g, tFl, { from: 1.4, d: 0.35 }); wipe(qF.nm, tFl + 0.1, { dir: 'l', d: 0.3 }); sfx('thud', tFl, { g: 0.7, p: 0.1 });
  fromTo(qM.sq.g, tMx, { autoAlpha: 0, clipPath: 'inset(100% 100% 0% 0%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.out' });
  wipe(qM.nm, tMx + 0.2, { dir: 'l', d: 0.3 }); sfx('whoosh', tMx, { g: 0.5, p: 0.3 }); sfx('thud', tMx + 0.45, { g: 0.8, p: -0.3 });
  const tagF = tag(world, 'MoE', qF.x - FR + qF.nm.offsetWidth + 18, QB - qF.side - 2 * FR - 68), tagM = tag(world, 'MoE', qM.x - FR + qM.nm.offsetWidth + 18, QB - qM.side - 2 * FR - 68);
  [[tagF, qF], [tagM, qM]].forEach(([e, q], k) => { slam(e, tMoE + k * 0.12, { from: 1.4, d: 0.3 }); appear(q.sq.red, tMoE + 0.2 + k * 0.12); sfx('pop', tMoE + k * 0.12, { g: 0.6, p: 0.3 }); });
  const t27 = Q(T('m3')) - 0.15, tDn = Q(T('m3', { zh: '稠密', en: 'dense' })) - 0.1;
  vanish(q27.sq.red, t0);
  slam(q27.sq.g, t27, { from: 1.5, d: 0.3 }); wipe(q27.nm, t27 + 0.1, { dir: 'l', d: 0.3 }); sfx('thud', t27, { g: 0.6, p: -0.4 });
  wipe(q27.sq.red, tDn, { dir: 'l', d: 0.3 }); const tag27 = tag(world, tr('稠密', 'Dense'), q27.x - FR, QB - q27.side - 2 * FR - 146, 'bg-red paper');
  slam(tag27, tDn + 0.1, { from: 1.4, d: 0.3 }); sfx('thud', tDn + 0.1, { g: 0.8, p: -0.5 });
  wipe(qNote, tDn + 0.3, { dir: 'l', d: 0.35 });

  // ── 站 F：Flash 的方块长成参数墙 ──
  const WX = SX + 260, WY = FY + 216, WW = 1400, WH = 500;
  const drawWall = (lit) => {
    const K = 3, cv = h('canvas', 'abs', world); cv.width = WW * K; cv.height = WH * K; px(cv, 0, 0, WW, WH);
    const g = cv.getContext('2d'); g.scale(K, K);
    g.fillStyle = C.paper; g.fillRect(0, 0, WW, WH);
    const rnd = seeded(41), rh = WH / FL.layers, LINE = 4;
    for (let r = 0; r < FL.layers; r++) {
      const att = ((r % 4 === 3 ? FL.attn[0] : FL.attn[1]) + FL.other + FL.shared) / FL.expert, units = att + FL.experts;   // 注意力 + 每层的混合权重 + 共享专家：每个 token 都算
      const u = (WW - LINE) / units, y = r * rh;
      if (lit) {
        g.fillStyle = C.red; g.fillRect(0, y, att * u, rh);
        const pick = new Set(); while (pick.size < FL.topk) pick.add(Math.floor(rnd() * FL.experts));
        for (const e of pick) g.fillRect(att * u + LINE + e * u, y, Math.max(u, 1.6), rh);
      }
      g.fillStyle = C.ink; g.fillRect(att * u, y, LINE, rh);                                     // 路由器
    }
    for (let r = 1; r < FL.layers; r++) { g.fillStyle = C.ink; const th = r % 4 === 0 ? 2.4 : 0.9; g.fillRect(0, r * rh - th / 2, WW, th); }   // 每 4 层一组：3 层线性注意力 + 1 层全注意力
    const img = freeze(cv); img.className = 'abs'; img.dataset.name = lit ? 'flash-wall-lit' : 'flash-wall';
    return img;
  };
  const wallBox = h('div', 'abs', world); px(wallBox, WX - FR, WY - FR, WW + 2 * FR, WH + 2 * FR); wallBox.dataset.name = 'flash-wall-box';
  blk(wallBox, 'bg-ink', 0, 0, WW + 2 * FR, WH + 2 * FR);
  const w0 = drawWall(false), w1 = drawWall(true);
  [w0, w1].forEach((im) => { wallBox.appendChild(im); px(im, FR, FR, WW, WH); });
  const tq3 = T('q3'), tGrow = tq3 - 0.25;
  growFrom(wallBox, tGrow, 0.8, { x: qF.x - FR, y: QB - qF.side - 2 * FR, w: qF.side + 2 * FR, h: qF.side + 2 * FR }, { x: WX - FR, y: WY - FR, w: WW + 2 * FR, h: WH + 2 * FR });
  sfx('whoosh', tGrow, { g: 0.7, p: 0.2 }); sfx('thud', tGrow + 0.8, { g: 0.7 });
  vanish(w1, t0);
  [qh, q27.nm, qF.nm, qM.nm, tagF, tagM, tag27, qNote, qRule].forEach((e, i) => wipeOut(e, tGrow - 0.1 + i * 0.03, { dir: 'l', d: 0.25 }));
  qs.forEach((q) => to(q.sq.g, tGrow + 0.2, { autoAlpha: 0, duration: 0.25 }));   // 墙从 Flash 的方块里长出来，盖住它
  const fh = txt(world, 't-4', tr('Qwen3.8-Flash-Next · 48 层，每层 512 个专家', 'Qwen3.8-Flash-Next · 48 layers, 512 experts each'), WX - FR, FY + 92);
  const fhN = txt(world, 't-n dimp', tr('Flash 是基于它的官方版本（模型卡）', 'Flash is the official version based on it (model card)'), WX - FR, FY + 148);
  wipe(fh, tGrow + 0.6, { dir: 'l', d: 0.35 }); wipe(fhN, tGrow + 0.8, { dir: 'l', d: 0.35 });
  const cy = WY + WH + 34;
  const cF = txt(world, 'num', '0', WX - FR, cy); cF.style.fontSize = '56px';
  const uF = txt(world, 't-n dimp', tr('个参数（语言模型，按权重文件计数）', 'parameters (language model, counted from the weights)'), WX - FR + group(FL.lm).length * 33.6 + 24, cy + 18);
  const tCt = Q(T('q3', { zh: '1250', en: '125' })) - 0.2;
  appear(cF, tCt); countTo(cF, 0, FL.lm, tCt, 0.9, (v) => group(Math.round(v))); sfx('riser', tCt - 0.5, { g: 0.3 }); wipe(uF, tCt + 0.4, { dir: 'l', d: 0.3 });
  const tLit = Q(T('q3', { zh: '激活', en: 'activates' })) - 0.15;
  wipe(w1, tLit, { dir: 't', d: 0.55, ease: 'power2.inOut' }); sfx('whoosh', tLit, { g: 0.6, p: 0.3 });
  for (let k = 0; k < 5; k++) sfx('blip', tLit + 0.05 + k * 0.1, { g: 0.35, p: 0.1 + k * 0.1 });
  const aBox = blk(world, 'bg-red', WX - FR, cy + 80, 40, 40);
  const aN = txt(world, 'num red', group(FL.active), WX - FR + 60, cy + 78); aN.style.fontSize = '44px';
  const aL = txt(world, 't-n', tr('每个 token 激活 · ' + (FL.share * 100).toFixed(2) + '%', 'activated per token · ' + (FL.share * 100).toFixed(2) + '%'), WX - FR + 60 + group(FL.active).length * 26.4 + 24, cy + 84);
  const tAct = Math.min(Q(T('q3', { zh: '60', en: '6 billion' })) - 0.2, Tend('q3') - 0.5);
  wipe(aBox, tAct, { dir: 'l', d: 0.2 }); slam(aN, tAct + 0.05, { from: 1.3, d: 0.3 }); sfx('thud', tAct + 0.05, { g: 0.85, p: 0.2 }); wipe(aL, tAct + 0.3, { dir: 'l', d: 0.3 });
  const card = txt(world, 't-n dimp', tr('模型卡：', 'Model card: ') + '“' + FL.card + '”', WX - FR, cy + 140);
  wipe(card, tAct + 0.5, { dir: 'l', d: 0.45 });

  // ── 站 R：墙上的一行放大成一层 ──
  const tq6 = T('q6'), rh = WH / FL.layers, ROW = 2;                                   // 第 3 行：一层线性注意力
  const rowBox = blk(world, '', WX - 4, WY + ROW * rh - 4, WW + 8, rh + 8); css(rowBox, { border: `4px solid ${C.ink}`, boxSizing: 'border-box' }); rowBox.dataset.name = 'one-layer';
  const tRow = tq6 - 0.35;
  wipe(rowBox, tRow, { dir: 'l', d: 0.3 }); sfx('tick', tRow, { g: 0.6 });
  // 面板里的面积按参数个数：一格 = 一个专家（4 915 200 个参数）；注意力与每层的混合权重合起来约 14.5 格，画成 2 格宽的一块
  const GC = 32, GR = 16, CW2 = 34, CH2 = 24, LN2 = 4, GW = GC * (CW2 + LN2) + LN2, GH = GR * (CH2 + LN2) + LN2;
  const AW = 2 * (CW2 + LN2) - LN2, AU = (FL.attn[1] + FL.other) / FL.expert, AH = AU / 2 * (CH2 + LN2) - LN2;
  const shX = 36 + AW + 92, routerX = shX + CW2 + 52, GX0 = routerX + 16 + 40, PW = GX0 + GW + 36, PH = 500, GY0 = (PH - GH) / 2;
  const PX0 = SX + Math.round((1920 - PW) / 2), PY0 = FY + 226;
  const panel = h('div', 'abs', world); px(panel, PX0, PY0, PW, PH); panel.dataset.name = 'layer-panel';
  blk(panel, 'bg-ink', 0, 0, PW, PH); blk(panel, 'bg-paper', 12, 12, PW - 24, PH - 24);
  blk(panel, 'bg-red', 36, (PH - AH) / 2, AW, AH).dataset.name = 'attention';               // 注意力：每个 token 都算
  const shY = (PH - CH2) / 2;
  blk(panel, 'bg-ink', shX - LN2, shY - LN2, CW2 + 2 * LN2, CH2 + 2 * LN2);
  const shCell = blk(panel, 'bg-paper', shX, shY, CW2, CH2); shCell.dataset.name = 'shared-expert';
  blk(panel, 'bg-ink', routerX, 36, 16, PH - 72);                                           // 路由器：注意力与专家之间的黑线
  blk(panel, 'bg-ink', GX0, GY0, GW, GH);
  const cells = [];
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) cells.push(blk(panel, 'bg-paper', GX0 + LN2 + c * (CW2 + LN2), GY0 + LN2 + r * (CH2 + LN2), CW2, CH2));
  const rnd = seeded(73), picks = new Set(); while (picks.size < FL.topk) picks.add(Math.floor(rnd() * FL.experts));
  growFrom(panel, tq6 - 0.05, 0.7, { x: WX - 4, y: WY + ROW * rh - 4, w: WW + 8, h: rh + 8 }, { x: PX0, y: PY0, w: PW, h: PH });
  sfx('whoosh', tq6 - 0.05, { g: 0.6, p: 0.4 }); sfx('thud', tq6 + 0.65, { g: 0.6 });
  [fh, fhN, cF, uF, aBox, aN, aL, card].forEach((e, i) => wipeOut(e, tq6 - 0.1 + i * 0.03, { dir: 'l', d: 0.25 }));
  to(wallBox, tq6 + 0.2, { opacity: 0, duration: 0.3 }); to(rowBox, tq6 + 0.2, { autoAlpha: 0, duration: 0.3 });   // wallBox 的显隐由 growFrom 管，这里只改不透明度
  const ph = txt(world, 't-3', tr('其中一层', 'One layer'), PX0, FY + 92);
  const phN = txt(world, 't-n dimp', tr('一格 = 一个专家；面积按参数个数', 'One cell = one expert; area by parameter count'), 0, FY + 116);
  wipe(ph, tq6 + 0.5, { dir: 'l', d: 0.35 }); px(phN, PX0 + ph.offsetWidth + 30, FY + 116); wipe(phN, tq6 + 0.7, { dir: 'l', d: 0.35 });
  const LY2 = PY0 + PH + 22;
  const lA = txt(world, 't-n', tr('注意力', 'Attention'), PX0 + 36, PY0 - 44);
  const lR = txt(world, 't-n', tr('路由器', 'Router'), PX0 + routerX - 30, PY0 - 44);
  const lG = txt(world, 't-n', tr('512 个路由专家（选中的位置为示意）', '512 routed experts (positions illustrative)'), PX0 + GX0, LY2);
  [lA, lR, lG].forEach((e, i) => wipe(e, tq6 + 0.7 + i * 0.1, { dir: 'l', d: 0.3 }));
  const t10 = Q(T('q6', '10')) - 0.1;
  [...picks].forEach((e, k) => { classAt(cells[e], 'bg-red', t10 + k * 0.05); sfx('blip', t10 + k * 0.05, { g: 0.35, p: -0.3 + k * 0.08 }); });
  const big10 = txt(world, 't-3 red', tr('512 选 10', '10 of 512'), 0, LY2 + 50); px(big10, PX0 + PW - 36 - big10.offsetWidth, LY2 + 50);
  slam(big10, t10 + 0.55, { from: 1.4, d: 0.3 }); sfx('thud', t10 + 0.55, { g: 0.8, p: 0.3 });
  const tSh = Q(T('q6', { zh: '共享', en: 'shared' })) - 0.1;
  classAt(shCell, 'bg-red', tSh);
  const shL = txt(world, 't-3', tr('+ 1 个共享专家', '+ 1 shared expert'), PX0 + 36, LY2 + 50);
  const shBar = blk(world, 'bg-red', PX0 + shX, PY0 - 16, CW2, 16);
  slam(shL, tSh, { from: 1.4, d: 0.3 }); wipe(shBar, tSh, { dir: 'b', d: 0.2 }); sfx('thud', tSh, { g: 0.8, p: -0.3 });
  const sameN = txt(world, 't-n dimp', tr('共享专家与每个路由专家几乎一样大：' + group(FL.shared) + ' 与 ' + group(FL.expert) + ' 个参数', 'The shared expert is almost exactly as large as each routed one: ' + group(FL.shared) + ' vs ' + group(FL.expert) + ' parameters'), PX0 + 36, LY2 + 130);
  wipe(sameN, tSh + 0.5, { dir: 'l', d: 0.4 });

  // ── 镜头 ──
  const cHist = { x: 2420, y: 470 }, cS = { x: SX + 920, y: 470 }, cQ = { x: SX + 960, y: FY + 470 };
  const tPanS = Tend('h3') + 0.15, tPanQ = T('m2') - 0.35;
  cam.track(t0, { x: 600, y: 470, z: 1.04 }, [
    [t0 + 0.02, { x: 640, z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [t0 + 0.85, { x: 660, z: 0.985 }, T('h2') - 0.3 - t0 - 0.9, { ease: 'none', sfx: false }],
    [T('h2') - 0.3, { x: 1700, y: 470, z: 1.0 }, 0.9, { g: 0.6 }],
    [T('h2') + 0.65, { x: 1715, z: 1.015 }, T('h3') - 0.3 - T('h2') - 0.7, { ease: 'none', sfx: false }],
    [T('h3') - 0.3, { ...cHist, z: 1.0 }, 0.9, { g: 0.6 }],
    [T('h3') + 0.65, { x: cHist.x + 20, z: 0.99 }, tPanS - T('h3') - 0.7, { ease: 'none', sfx: false }],
    [tPanS, { ...cS, z: 1.0 }, 1.0, { g: 0.7 }],
    [tPanS + 1.05, { x: cS.x + 15, z: 1.01 }, tPanQ - tPanS - 1.1, { ease: 'none', sfx: false }],
    [tPanQ, { ...cQ, z: 1.0 }, 0.9, { g: 0.6 }],
    [tPanQ + 0.95, { x: cQ.x + 10, z: 1.015 }, s.end + WIPE - tPanQ - 1.0, { ease: 'none', sfx: false }],
  ]);
});
