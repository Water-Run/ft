// 开场（0–25 秒）：token → 参数 → 每个 token 都要和全部参数相乘 → 参数越多算得越多 → 设问 → 片名卡。
// 站 A：开场字幕本身被黑线切成 token（真实分词器的切分，用的是 Qwen3.8 的分词器）。站 B：一个 270 亿参数稠密模型（Qwen3.8-27B）的真实权重 → 拉远成一面参数格墙。
// 这一部分画面与旁白都不点模型的名字：出处写在 research/FACTS.md。
// 格墙的图形含义贯穿全片：黑线 = 边界，白格 = 存着没用到，红格 = 这个 token 用到，黄块 = token。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const t0 = s.start;
  F((t) => { if (t < t0 + 0.02) Object.assign(cam.st, { x: 960, y: 470, z: 1.08 }); });   // 第 0 帧镜头就在起点（见 docs/pitfalls.md）
  const cam = makeCamera(world, 1920, VH);
  const zh = LANG === 'zh';

  // ── 站 A：一句话被切成 token ──
  const TK = DATA.tok[LANG], P = TK.pieces;
  const split = 4;                                          // 两行，各 4 个 token
  const LW = 18, RH = 184, X0 = 120, Y1 = 214;
  const rows = [P.slice(0, split), P.slice(split)];
  const font = zh ? '900 112px "Sans SC", "Inter"' : '900 104px "Inter"';
  const cells = [], vlines = [];
  rows.forEach((row, ri) => {
    const y = Y1 + LW + ri * (RH + LW);
    let x = X0 + LW;
    row.forEach((p, j) => {
      const label = p.trim();
      const e = h('div', 'tk ink', world, esc(label)); css(e, { font, letterSpacing: '-.02em', padding: '0 16px' });
      px(e, x, y, null, RH);
      const w = label ? Math.max(e.offsetWidth, 96) : 64;
      px(e, x, y, w, RH); e.dataset.name = 'token';
      cells.push(e);
      if (j < row.length - 1) vlines.push(blk(world, 'bg-ink', x + w, y, LW, RH));
      x += w + LW;
    });
    // 每行两端的竖线：先于切分出现，像一句话的边框
    rule(world, X0, y, LW, RH, t0 + 0.15 + ri * 0.1, 't', 0.35);
    rule(world, x - LW, y, LW, RH, t0 + 0.2 + ri * 0.1, 't', 0.35);
  });
  // 三道贯穿画面的水平粗线：第一帧就开始画
  [0, 1, 2].forEach((k) => rule(world, -400, Y1 + k * (RH + LW), 2800, LW, t0 + 0.02 + k * 0.08, 'l', 0.5));
  sfx('whoosh', t0 + 0.02, { g: 0.6 });
  // 整句先作为一句话出现（与旁白同起），读到「切成」时黑线落下，把它切成一个个 token，随后填成黄色
  const tSay = t0 + 0.35;
  cells.forEach((e, i) => appear(e, tSay + i * 0.045));
  sfx('blip', tSay, { g: 0.6, p: -0.3 });
  const tCut = Qf(T('o1', { zh: '切成', en: 'cut' })) - 0.1;
  vlines.forEach((e, i) => { fromTo(e, tCut + i * 0.035, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 0%', duration: 0.18, ease: 'power3.out' }); if (i % 2 === 0) sfx('tick', tCut + i * 0.035, { g: 0.6, p: -0.5 + i / vlines.length }); });
  const tFill = Math.min(Math.max(Q(T('o1', { zh: 'token', en: 'tokens' })), tCut + vlines.length * 0.035 + 0.05), Tend('o1') - 0.45);
  cells.forEach((e, i) => classAt(e, 'bg-yel', tFill + i * 0.02));
  sfx('pop', tFill, { g: 0.7 });
  const nTok = txt(world, 'num', String(TK.n), X0, 676); nTok.style.fontSize = '200px';
  const nLab = txt(world, 't-3', tr('个 token', 'tokens'), X0 + 160, 754);
  const nSrc = txt(world, 't-n dimp', tr('一个大模型的分词器实测切分', 'Split by a real LLM tokenizer'), X0 + 160, 834);
  const tN = Q(Tend('o1') - 0.6);
  slam(nTok, tN, { from: 1.4, d: 0.35 }); sfx('thud', tN, { g: 0.8, p: -0.4 });
  wipe(nLab, tN + 0.12, { dir: 'l', d: 0.3 }); wipe(nSrc, tN + 0.25, { dir: 'l', d: 0.35 });

  // ── 站 B：真实的权重 → 一面参数格墙 ──
  const WX = 2160, WY = 110, CW = 60, CH = 54, LN = 8, BIGC = 40, BIGR = 18, SC = 24, SR = 10;
  const wall = makeWall(world, { x: WX, y: WY, cols: BIGC, rows: BIGR, cw: CW, ch: CH, line: LN, fw: LN + SC * (CW + LN), fh: LN + SR * (CH + LN), name: 'param-wall' });
  // 权重原值：Qwen3.8-27B 第 0 层 up_proj 左上角 6 行 × 8 列（BF16），盖在墙的左上角。画面上只写「一个 270 亿参数的稠密模型」
  const nb = blk(world, 'bg-paper', WX + LN, WY + LN, 11 * (CW + LN) - LN, 3 * (CH + LN) - LN); nb.dataset.name = 'weights';
  const wrows = DATA.w.rows.map((r, i) => {
    const e = txt(world, 'mono ink', r.map(wfmt).join('  '), WX + 26, WY + 22 + i * 29); css(e, { fontSize: '17px', fontWeight: 700 });
    return e;
  });
  const wsrc = txt(world, 'mono dimp', tr('一个 270 亿参数的稠密模型 · 第 0 层 up_proj · 左上角 6×8 个权重（BF16 原值）', 'A 27-billion-parameter dense model · layer 0 up_proj · top-left 6×8 weights (raw BF16)'), WX + 8, WY - 34);
  css(wsrc, { fontSize: '14px', fontWeight: 700 });
  const tB = Tend('o1') + 0.05;
  wrows.forEach((e, i) => { wipe(e, tB + 0.35 + i * 0.07, { dir: 'l', d: 0.25 }); sfx('tick', tB + 0.35 + i * 0.07, { g: 0.45, p: 0.2 }); });
  wipe(wsrc, tB + 0.3, { dir: 'l', d: 0.3 });
  const tPull = Math.max(Q(T('o2', { zh: '数字', en: 'numbers' })) - 0.1, Tend('o1') + 1.2);
  [nb, wsrc, ...wrows].forEach((e) => to(e, tPull + 0.05, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }));
  // 参数个数：从 0 滚到 26 895 998 464（Qwen3.8-27B 的语言模型部分，文件头逐个张量计数）
  const cnt = txt(world, 'num', '0', WX, WY + LN + SR * (CH + LN) + 40); cnt.style.fontSize = '96px';
  const unit = txt(world, 't-3', tr('个参数', 'parameters'), WX, 0);
  const cntSrc = txt(world, 't-n dimp', tr('同一个模型（语言部分）· 按权重文件逐个张量计数', 'The same model (language part) · counted tensor by tensor'), WX, WY + LN + SR * (CH + LN) + 168);
  const tCnt = tPull + 0.2, tUnit = Q(T('o2', { zh: '参数', en: 'parameters' }));
  appear(cnt, tCnt); countTo(cnt, 0, DATA.q27.lm, tCnt, 1.0, (v) => group(Math.round(v)));
  sfx('riser', tCnt - 0.2, { g: 0.35 });
  const cntW = String(group(DATA.q27.lm)).length * 57.6;
  px(unit, WX + cntW + 30, WY + LN + SR * (CH + LN) + 66);
  slam(unit, tUnit, { from: 1.4, d: 0.35 }); sfx('thud', tUnit, { g: 0.8 });
  wipe(cntSrc, tCnt + 0.4, { dir: 'l', d: 0.35 });

  // ── 每个 token 都要和全部参数相乘：黄色的 token 沿墙顶走过，身后的格子一列列涂红 ──
  const TOKA = zh ? '模型' : 'models', TOKB = zh ? '文字' : 'text', TOKC = 'token';
  const tok1 = tokenBlock(world, TOKA, WX - 112, WY + LN + 5 * (CH + LN) - 59, 110, zh ? 40 : 30);   // 从墙的中线穿过去
  const tS1 = Q(T('o3', { zh: '逐一', en: 'multiplied' })) - 0.25, D1 = Math.min(1.9, Tend('o3') + 0.35 - tS1);
  slide(tok1, Q(T('o3', 'token')) - 0.3, { x: -260, d: 0.45 }); sfx('pop', Q(T('o3', 'token')) - 0.3, { g: 0.6 });
  fromTo(tok1, tS1, { x: 0 }, { x: SC * (CW + LN) + 170, duration: D1, ease: 'none', immediateRender: false });
  for (let k = 0; k < 6; k++) sfx('tick', tS1 + k * D1 / 6, { g: 0.5, p: -0.4 + k * 0.16 });
  const tR1 = Q(T('o4')) - 0.05;
  to(tok1, tR1, { autoAlpha: 0, duration: 0.2 });
  wipeOut(cnt, tR1, { dir: 'l', d: 0.3 }); wipeOut(unit, tR1 + 0.04, { dir: 'l', d: 0.3 }); wipeOut(cntSrc, tR1 + 0.08, { dir: 'l', d: 0.3 });

  // ── 参数越多：墙长大，再走一个 token，要涂的格子多得多 ──
  const tG = tR1 + 0.3, DG = 0.8;
  fromTo(wall.frame, tG, { width: wall.frame.offsetWidth, height: wall.frame.offsetHeight }, { width: wall.w, height: wall.h, duration: DG, ease: 'power3.inOut', immediateRender: false });
  sfx('whoosh', tG, { g: 0.7, p: 0.3 }); sfx('thud', tG + DG, { g: 0.6 });
  const tok2 = tokenBlock(world, TOKB, WX - 230, WY + LN + 9 * (CH + LN) - 85, 170, zh ? 64 : 52);
  const tS2 = Math.max(tG + DG + 0.1, Q(T('o4', { zh: '要算', en: 'work' })) - 0.9), D2 = Tend('o4') + 0.45 - tS2;
  appear(tok2, tS2 - 0.25); sfx('pop', tS2 - 0.25, { g: 0.5 });
  fromTo(tok2, tS2, { x: 0 }, { x: BIGC * (CW + LN) + 250, duration: D2, ease: 'none', immediateRender: false });
  for (let k = 0; k < 8; k++) sfx('tick', tS2 + k * D2 / 8, { g: 0.45, p: -0.5 + k * 0.14 });
  const tR2 = Q(T('o5')) - 0.05;
  to(tok2, tR2, { autoAlpha: 0, duration: 0.2 });
  // 三个短语落在墙下
  const LY = WY + wall.h + 60, lab = [];
  [[tr('参数越多', 'More parameters'), { zh: '参数', en: 'parameters' }, 'ink'], [tr('通常越强', 'usually stronger'), { zh: '越强', en: 'stronger' }, 'ink'], [tr('计算越多', 'more compute'), { zh: '要算', en: 'work' }, 'red']]
    .forEach(([s1, w, col], i) => {
      const e = txt(world, (zh ? 't-1 ' : 't-2 ') + col, s1, WX + i * (zh ? 900 : 860), LY + (zh ? 0 : 36));
      const tt = Math.max(Q(T('o4', w)), tG + 0.2 + i * 0.25);
      slam(e, tt, { from: 1.3, d: 0.35 }); sfx(i === 2 ? 'thud' : 'pop', tt, { g: 0.7, p: -0.4 + i * 0.4 }); lab.push(e);
    });
  lab.forEach((e, i) => wipeOut(e, tR2 + i * 0.05, { dir: 'l', d: 0.3 }));

  // ── 能不能只算一小部分：同样大的墙，这次只亮零星几格 ──
  const rnd = seeded(17), sparse = new Map();
  const NSP = Math.round(BIGC * BIGR * DATA.flash.share);                // 亮的比例取第三部分 Flash 的实测激活比例（约 4.8%）
  while (sparse.size < NSP) { const i = Math.floor(rnd() * BIGC * BIGR); if (!sparse.has(i)) sparse.set(i, sparse.size); }
  const tok3 = tokenBlock(world, TOKC, WX - 230, WY + LN + 9 * (CH + LN) - 85, 170, 52);
  const tS3 = Q(T('o5', { zh: '每', en: 'yet' })) - 0.1, D3 = 1.6;
  appear(tok3, tS3 - 0.2);
  fromTo(tok3, tS3, { x: 0 }, { x: BIGC * (CW + LN) + 250, duration: D3, ease: 'none', immediateRender: false });
  to(tok3, tS3 + D3, { autoAlpha: 0, duration: 0.2 });
  const spAt = (i) => tS3 + (i % BIGC) / BIGC * D3;
  [...sparse.keys()].sort((a, b) => spAt(a) - spAt(b)).forEach((i, k) => { if (k % 3 === 0) sfx('blip', spAt(i), { g: 0.4, p: -0.5 + (i % BIGC) / BIGC }); });
  const qm = txt(world, 'ink', '?', WX + wall.w + 110, WY + 120); css(qm, { font: '900 560px "Inter", "Sans SC"', lineHeight: '1' });
  const tQ = Q(T('o5', { zh: '一小部分', en: 'few' }));
  slam(qm, tQ, { from: 1.5, d: 0.4 }); sfx('thud', tQ, { g: 0.9, p: 0.5 });

  // 格墙是原理示意：一格代表一组参数，格数不对应实际参数个数。小墙与大墙各标一次「示意」
  const ill1 = txt(world, 't-n dimp', tr('示意', 'Illustration'), 0, WY + LN + SR * (CH + LN) + 30); px(ill1, WX + LN + SC * (CW + LN) - ill1.offsetWidth, WY + LN + SR * (CH + LN) + 30);
  wipe(ill1, tPull + 0.7, { dir: 'r', d: 0.3 }); wipeOut(ill1, tR1, { dir: 'r', d: 0.2 });
  const ill2 = txt(world, 't-3 dimp', tr('示意', 'Illustration'), 0, LY + 196); px(ill2, WX + wall.w - ill2.offsetWidth, LY + 196);
  wipe(ill2, tG + DG, { dir: 'r', d: 0.3 });
  // 格子的状态：只由 t 算出
  wall.paint((i, c, r, t) => {
    const small = c < SC && r < SR;
    const shown = small || t >= tG + DG * (0.15 + 0.85 * Math.max(c / BIGC, r / BIGR));
    if (!shown) return 'h';
    if (t >= tR2) return sparse.has(i) && t >= spAt(i) ? 'r' : 'p';
    if (t >= tS2) return t >= tS2 + (c / BIGC) * D2 ? 'r' : 'p';
    if (t >= tR1) return small && t < tR1 + 0.25 * (1 - c / SC) ? 'r' : 'p';
    if (t >= tS1 && small) return t >= tS1 + (c / SC) * D1 ? 'r' : 'p';
    return 'p';
  });

  // ── 片名卡：黑线一道道砸下来，构成一幅新造型的构图 ──
  const tC = Q(Tend('o5') + 0.2);
  const card = h('div', 'abs bg-paper', root); px(card, 0, 0, 1920, VH); card.dataset.name = 'title-card';
  wipe(card, tC, { dir: 'l', d: 0.35 }); sfx('whoosh', tC - 0.1, { g: 0.8 });
  const VX = 860, HY = 560, G = 22, EX = 1500;
  const red = blk(card, 'bg-red', 0, 0, VX, HY);
  const yel = blk(card, 'bg-yel', EX + G, HY + G, 1920 - EX - G, VH - HY - G); yel.dataset.name = 'token-plane';
  const lines = [[VX, 0, G, VH, 't'], [0, HY, VX, G, 'l'], [VX + G, HY, 1920 - VX - G, G, 'r'], [EX, HY + G, G, VH - HY - G, 'b']];
  lines.forEach(([x, y, w, hh, d], i) => { const e = blk(card, 'bg-ink', x, y, w, hh); wipe(e, tC + 0.25 + i * 0.125, { dir: d, d: 0.3, ease: 'power3.out' }); sfx('thud', tC + 0.25 + i * 0.125, { g: 0.55, p: -0.5 + (x / 1920) }); });
  // 右下：专家格（2 行 × 4 列，示意），每拍亮两格
  const gx = VX + G, gy = HY + G, gw = EX - gx, gh = VH - gy, ew = (gw - 3 * G) / 4, eh = (gh - G) / 2, ecells = [];
  for (let k = 0; k < 8; k++) {
    const c = k % 4, r = Math.floor(k / 4);
    if (c > 0 && r === 0) { const e = blk(card, 'bg-ink', gx + c * (ew + G) - G, gy, G, gh); wipe(e, tC + 0.85 + c * 0.06, { dir: 't', d: 0.25 }); }
    ecells.push(blk(card, 'bg-paper', gx + c * (ew + G), gy + r * (eh + G), ew, eh));
  }
  const hl = blk(card, 'bg-ink', gx, gy + eh, gw, G); wipe(hl, tC + 0.95, { dir: 'l', d: 0.3 });
  const tPick = tC + 1.25, pr = seeded(5);
  const picks = Array.from({ length: 20 }, () => { const a = Math.floor(pr() * 8); let b = Math.floor(pr() * 7); if (b >= a) b++; return [a, b]; });
  let lastPick = null;
  F((t) => {
    const k = t < tPick ? -1 : Math.floor((t - tPick) / BEAT) % picks.length;
    if (k === lastPick) return; lastPick = k;
    ecells.forEach((e, j) => { e.style.background = k >= 0 && picks[k].includes(j) ? C.red : C.paper; });
  });
  for (let b = 0; b < 6; b++) sfx('tick', tPick + b * BEAT, { g: 0.35, p: 0.3 });
  wipe(red, tC + 0.15, { dir: 't', d: 0.45 });
  wipe(yel, tC + 1.1, { dir: 'b', d: 0.4 }); sfx('pop', tC + 1.1, { g: 0.6, p: 0.7 });
  const dense = txt(card, 'paper', 'Dense', 66, 112); css(dense, { font: '900 250px "Inter"', letterSpacing: '-.045em', lineHeight: '1' });
  const denseZ = txt(card, 'paper', tr('稠密模型', 'Dense models'), 76, 400); css(denseZ, { font: zh ? '900 84px "Sans SC"' : '900 72px "Inter"' });
  const moe = txt(card, 'ink', 'MoE', VX + G + 70, 112); css(moe, { font: '900 250px "Inter"', letterSpacing: '-.045em', lineHeight: '1' });
  const moeZ = txt(card, 'ink', tr('混合专家模型', 'Mixture-of-experts models'), VX + G + 80, 400); css(moeZ, { font: zh ? '900 84px "Sans SC"' : '900 56px "Inter"' });
  const n96 = txt(card, 'num ink', String(TOTAL), 64, HY + G + 60); n96.style.fontSize = '210px';      // 秒数：三位数时 210px，与「秒」「了解 LLM 的」排在同一行
  const sec = txt(card, 'ink', tr('秒', 's'), 0, HY + G + 186); css(sec, { font: zh ? '900 84px "Sans SC"' : '900 84px "Inter"' }); px(sec, 64 + n96.offsetWidth + 8, HY + G + 186);
  const learn = txt(card, 'ink', tr('了解<br>LLM 的', 'LLMs<br>in'), 0, HY + G + 64); css(learn, { font: zh ? '900 64px "Sans SC"' : '900 64px "Inter"', lineHeight: '1.15' }); px(learn, Math.max(560, 64 + n96.offsetWidth + 8 + sec.offsetWidth + 40), HY + G + 64);
  [dense, denseZ, moe, moeZ, n96, sec, learn].forEach((e) => { e.dataset.overlapOk = '1'; });
  slam(dense, tC + 0.5, { from: 1.25, d: 0.4 }); sfx('thud', tC + 0.5, { g: 0.9, p: -0.4 });
  wipe(denseZ, tC + 0.75, { dir: 'l', d: 0.35 });
  slam(moe, tC + 1.0, { from: 1.25, d: 0.4 }); sfx('thud', tC + 1.0, { g: 0.9, p: 0.3 });
  wipe(moeZ, tC + 1.25, { dir: 'l', d: 0.35 });
  slide(n96, tC + 1.5, { y: 80, d: 0.4 }); slide(sec, tC + 1.6, { y: 80, d: 0.4 }); wipe(learn, tC + 1.75, { dir: 't', d: 0.35 }); sfx('pop', tC + 1.5, { g: 0.6, p: -0.5 });
  [dense, moe].forEach((e) => fromTo(e, tC + 1.6, { scale: 1 }, { scale: 1.035, transformOrigin: '0% 60%', duration: s.end + WIPE - tC - 1.6, ease: 'none', immediateRender: false }));
  hudGround('L', tC + 0.2, s.end + 0.1, 'red');                // 换场的黑线扫过左上角（约 0.1 秒）之后就是下一场的纸色

  // ── 镜头 ──
  const sb = { x: WX + 378, y: WY + 100 };                    // 权重原值那一块的中心
  const tA = Tend('o1') + 0.05;
  cam.track(t0, { x: 960, y: 470, z: 1.08 }, [
    [t0 + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [t0 + 0.95, { x: 990, z: 1.035 }, tA - t0 - 1.0, { ease: 'none', sfx: false }],
    [tA, { x: sb.x, y: sb.y, z: 2.35 }, 0.95, { g: 0.7 }],
    [tA + 1.0, { x: sb.x + 40 }, tPull - tA - 1.0, { ease: 'none', sfx: false }],
    [tPull, { x: WX + 820, y: 470, z: 0.95 }, 1.0, { ease: 'power3.inOut', g: 0.5 }],
    [tPull + 1.05, { x: WX + 860, z: 0.98 }, tG - tPull - 1.1, { ease: 'none', sfx: false }],
    [tG - 0.05, { x: WX + 1560, y: 740, z: 0.5 }, DG + 0.1, { ease: 'power3.inOut', sfx: false }],
    [tG + DG + 0.1, { x: WX + 1600, z: 0.515 }, tR2 - tG - DG - 0.15, { ease: 'none', sfx: false }],
    [tR2, { x: WX + 1700, y: 700, z: 0.56 }, tC - tR2 + 0.4, { ease: 'power1.inOut', sfx: false }],
  ]);
});
