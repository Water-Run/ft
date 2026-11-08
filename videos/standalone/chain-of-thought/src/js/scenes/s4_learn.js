// 03 越写越长。这个做法从「人写的几道例题」变成「人写的一句话」，再被练进模型，最后成为今天的缺省。
// 动作：例题卡片一张张放上来，又被抽走；一句话落进提问；这句话滑进纸垛，纸垛被它灌满；条形一路长过去，镜头跟着退；
// 开关一个个拨开；回到开头那道题，思考一行行印出来；一块对应一趟，纸垛从每块上立起来。
// 事实：S1、S2（10.4→40.7）；S5–S13（o1、R1、AIME 9.3/79.2/79.8、R1-Zero 15.6→77.9、「Wait」）；S16–S19（主流带思考模式，不列举型号）；L2（220 token、25/25、93/166/261/412/550）。
scene('learn', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const pulse = (ta, a = 30, d = 0.38) => (t) => a * Math.sin(Math.PI * clamp((t - ta) / d));
  const drop = (x, y, t, z = 200, d = 0.36) => [[t, x, y, z], [t + d, x, y, 0]];
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, d);
  const LGREY = '#9b9b9b';

  // ── 例题：放上来，又被抽走 ──
  const A = W.sheet({ in: [s.start + 0.25, 'r', 1.1], out: [T('r2') - 0.75, 't', 1.0] });
  const chap = chapterSheet(W, s, '03', '越写越长', T('r1') - 1.0);
  A.text('提问', -800, -430, { fs: 72, cls: 'g', t0: T('r1') - 0.7 });
  A.text('先给例题，再问新题', 800, -430, { fs: 56, cls: 'g', align: 'r', t0: Tend('r1') + 0.45 });
  A.line([[-800, -384], [800, -384]], { t0: T('r1') - 0.7, d: 0.6, w: 4, color: GRAY });
  const tE = T('r1') + 1.7, tEo = T('r1b', '不用给') - 0.25, CX = [-540, 0, 540];
  CX.forEach((x, i) => {
    const ta = tE + i * 0.32, tb = tEo + i * 0.12;
    A.tok(`<div class="cardt">例题 ${i + 1}<small>写好的步骤</small><small>答案</small></div>`, { keys: [[ta, x, -190, 220], [ta + 0.36, x, -190, 0], [tb, x, -190, 0], [tb + 0.65, x + 200, -1300, 240]], t0: ta, w: 480, d: 320, h: 22, fs: 66, bump: pulse(T('r1', '写好') + i * 0.18, 34, 0.7) });
    sfx('pop', ta + 0.36, { g: 0.2 }); sfx('whoosh', tb, { g: 0.08 });
  });
  const tQ = T('r1') - 0.35;
  A.tok('一道新题', { keys: drop(0, 110, tQ, 180, 0.36), t0: tQ, w: 1120, d: 112, h: 20, fs: 76 });
  const tAdd = T('r1c', '加一句') - 0.3;
  A.tok('「我们一步一步来想」', { keys: [[tAdd, 0, 260, 260], [tAdd + 0.42, 0, 260, 0]], t0: tAdd, w: 1120, d: 132, h: 26, fs: 92, bump: pulse(T('r1c', '一步一步') + 0.6, 20) });
  A.text("Let's think step by step", 0, 382, { fs: 58, cls: 'g', align: 'c', t0: T('r1c', '一步一步') + 0.1 });
  sfx('pop', tAdd + 0.42, { g: 0.28 });

  // ── 就这一句：四倍 ──
  const tB = T('r2') - 0.75, BX = -420, BS = 19;
  const B = W.sheet({ in: [tB, 'b', 1.0], out: [T('r3') - 0.75, 'l', 1.0] });
  B.text('一套数学应用题', 0, -340, { fs: 76, cls: 'g', align: 'c', t0: T('r2', '应用题') - 0.2 });
  const t1 = T('r2', '一成') - 0.5, t4 = T('r2', '四成') - 0.5;
  B.text('直接答', BX - 36, -130, { fs: 76, align: 'r', t0: t1 - 0.1 });
  B.bar(BX, -130, 10.4 * BS, 96, { t0: t1, d: 0.55, color: LGREY });
  B.count(BX + 10.4 * BS + 30, -130, { from: 0, to: 10.4, dec: 1, t0: t1, t1: t1 + 0.55, fs: 88, suffix: '%' });
  B.text('加了这句', BX - 36, 90, { fs: 76, cls: 'b', align: 'r', t0: t4 - 0.1 });
  B.bar(BX, 90, 40.7 * BS, 96, { t0: t4, d: 1.1, color: INK });
  B.count(BX + 40.7 * BS + 30, 90, { from: 10.4, to: 40.7, dec: 1, t0: t4, t1: t4 + 1.1, fs: 120, cls: 'b', suffix: '%' });
  for (let i = 0; i < 8; i++) sfx('key', lerp(t4, t4 + 1.1, i / 7), { g: 0.08 });

  // ── 这句话被练进模型 ──
  const tC = T('r3') - 0.75;
  const C = W.sheet({ in: [tC, 'r', 1.0], out: [T('r5') - 0.8, 'r', 1.0] });
  const Sx = 520, Sy = -30, N = 76, GP = 7, H = N * GP, tInto = T('r4', '练进') - 0.55, tFull = tInto + 1.25;
  C.text('人写进提问里的一句话', -440, -370, { fs: 82, cls: 'b', align: 'c', t0: T('r3', '提问里') - 0.25 });
  C.tok('「我们一步一步来想」', { keys: [[tC + 0.6, -440, -30, 0], [tInto, -440, -30, 0], [tInto + 0.8, Sx - 40, Sy + 138, 0]], t0: tC + 0.6, w: 800, d: 150, h: 26, fs: 72, off: off(tInto + 0.78, 0.22) });
  C.text('人写的', -440, 100, { fs: 66, cls: 'g', align: 'c', t0: T('r3', '提问里') - 0.1, off: off(T('r4') + 0.3) });
  const tNoP = T('r4') + 0.05;
  C.line([[-560, 100], [-320, 100]], { t0: tNoP, d: 0.3, w: 7, color: RED, off: off(T('r4') + 0.75) });
  C.text('不用人提醒', -440, 100, { fs: 70, cls: 'b', align: 'c', t0: T('r4') + 0.75, off: off(T('r5') - 0.9) });
  const Mdl = C.stack(Sx, Sy, { w: 360, d: 210, n: N, gap: GP, rise: (t) => ramp(t, T('r4') + 0.25, 1.0, ease.io3), fill: (t) => ramp(t, tInto + 0.82, tFull - tInto, linear) });
  Mdl.marks(77, 28); sfx('riser', T('r4') + 0.25, { g: 0.1 });
  C.text('模型', Sx, Sy + 196, { fs: 84, cls: 'b', align: 'c', t0: T('r4') + 0.9 });
  sfx('whoosh', tInto, { g: 0.12 }); sfx('chime', tFull, { g: 0.14 });

  // ── o1：回答之前先写一大段思考 ──
  const tD = T('r5') - 0.8;
  const D = W.sheet({ in: [tD, 'r', 1.0], out: [T('r6') - 0.75, 'l', 1.0], w: 2200, h: 1300 });
  D.text('2024', -950, -510, { fs: 150, cls: 'b', t0: T('r5') + 0.02 });
  const tRl = T('r5', '发布') - 0.3;
  D.tok('o1', { keys: drop(-130, -510, tRl, 200), t0: tRl, w: 260, d: 130, h: 30, fs: 118 });
  D.text('OpenAI', -310, -510, { fs: 72, cls: 'g', align: 'r', t0: tRl - 0.2 });
  sfx('pop', tRl + 0.36, { g: 0.26 });
  const tTh = T('r5', '思考') - 0.25, tThE = Tend('r5') + 0.25, RTX = -950, RTN = 56;
  D.text('思考', RTX, -310, { fs: 70, cls: 'b', t0: tTh - 0.15 });
  for (let i = 0; i < RTN; i++) { const ta = lerp(tTh, tThE, i / (RTN - 1)); D.bar(RTX + 170 + i * 26, -310, 20, 60, { t0: ta, d: 0.08, color: '#6f6f6f', ease: linear, r: 2 }); }
  for (let i = 0; i < 10; i++) sfx('key', lerp(tTh, tThE, i / 9), { g: 0.07 });
  D.tok('答案', { keys: drop(RTX + 170 + RTN * 26 + 130, -310, tThE + 0.05, 150), t0: tThE + 0.05, w: 220, d: 104, h: 20, fs: 66 });
  // AIME
  const BS2 = 15, BXo = -640, Yg = 30, Yo = 210;
  D.text('一套数学竞赛题', RTX, -120, { fs: 76, cls: 'g', t0: T('r5b', '竞赛题') - 0.2 });
  const tG = T('r5b', '只对') - 0.3, tO = T('r5c', '将近八成') - 0.75;
  D.text('GPT-4o', BXo - 36, Yg, { fs: 80, align: 'r', t0: T('r5b', '同是') - 0.1 });
  D.bar(BXo, Yg, 9.3 * BS2, 104, { t0: tG, d: 0.5, color: LGREY });
  D.count(BXo + 9.3 * BS2 + 30, Yg, { from: 0, to: 9.3, dec: 1, t0: tG, t1: tG + 0.5, fs: 94, suffix: '%' });
  D.text('o1', BXo - 36, Yo, { fs: 104, cls: 'b', align: 'r', t0: tO - 0.2 });
  D.bar(BXo, Yo, 79.2 * BS2, 104, { t0: tO, d: 1.15, color: INK });
  D.count(BXo + 79.2 * BS2 + 30, Yo, { from: 9.3, to: 79.2, dec: 1, t0: tO, t1: tO + 1.15, fs: 138, cls: 'b', suffix: '%' });
  for (let i = 0; i < 8; i++) sfx('key', lerp(tO, tO + 1.15, i / 7), { g: 0.08 });
  sfx('chime', tO + 1.15, { g: 0.16 });

  // ── R1：不看解题过程，只看答没答对 ──
  const tE0 = T('r6') - 0.75;
  const E = W.sheet({ in: [tE0, 'l', 1.0], out: [T('r8') - 0.75, 'b', 1.0] });
  const logoH = 112;
  E.logo(-740, -370, logoH, (t) => ramp(t, T('r6', 'DeepSeek') - 0.3, 0.4));
  E.text('R1 的一个版本', 60, -370, { fs: 86, cls: 'b', t0: T('r6', '一个版本') - 0.2 });
  E.text('训练时', -740, -180, { fs: 76, cls: 'g', t0: T('r6', '训练时') - 0.2 });
  const tCard = T('r6', '解题过程') - 0.75, tNoS = T('r6', '不看') - 0.1;
  const tOut = Tend('r6') + 0.15;
  E.tok('人写的解题过程', { keys: [[tCard - 0.3, 1700, -40, 0], [tCard + 0.3, 0, -40, 0], [tOut, 0, -40, 0], [tOut + 0.7, 2200, -40, 300]], t0: tCard - 0.3, w: 980, d: 150, h: 26, fs: 88 });
  const strike = E.tok('', { keys: [[tNoS, 0, -40, 48], [tOut, 0, -40, 48], [tOut + 0.7, 2200, -40, 348]], t0: tNoS, fadeIn: 0.1, w: 980, d: 150, h: 1, cls: 'ghost' });
  strike.top.innerHTML = '<svg width="980" height="150" style="position:absolute;left:0;top:0"><path d="M20 12 L960 138 M960 12 L20 138" stroke="#a5402d" stroke-width="12" fill="none"/></svg>';
  sfx('error', tNoS + 0.05, { g: 0.12 }); sfx('whoosh', tOut, { g: 0.14 });
  const tOk = T('r7b', '答没答对') - 0.3, tFm = T('r7b', '格式') - 0.3, tRw = T('r7b', '奖励') - 0.25;
  const tEnd2 = T('r8') - 0.9;
  E.tok('答没答对', { keys: [[tOk, -440, 140, 200], [tOk + 0.34, -440, 140, 0], [tRw, -440, 140, 0]], t0: tOk, w: 480, d: 130, h: 22, fs: 80 });
  E.tok('格式对不对', { keys: [[tFm, 440, 140, 200], [tFm + 0.34, 440, 140, 0], [tRw, 440, 140, 0]], t0: tFm, w: 520, d: 130, h: 22, fs: 80 });
  E.arrow([[-440, 214], [-440, 370], [-176, 370]], { t0: tRw, d: 0.45, w: 7 });
  E.arrow([[440, 214], [440, 370], [176, 370]], { t0: tRw, d: 0.45, w: 7 });
  E.tok('奖励', { keys: drop(0, 370, tRw + 0.45, 220, 0.3), t0: tRw + 0.45, w: 320, d: 130, h: 36, fs: 104, bump: pulse(tRw + 0.8, 30) });
  sfx('pop', tOk + 0.34, { g: 0.2 }); sfx('pop', tFm + 0.34, { g: 0.2 }); sfx('chime', tRw + 0.75, { g: 0.14 });

  // ── 思考越写越长 ──
  const tF = T('r8') - 0.75;
  const F = W.sheet({ in: [tF, 'b', 1.0], out: [T('r8e') - 0.8, 'r', 1.0], w: 2300, h: 1420 });
  F.text('没人要求它想得更长', 0, -570, { fs: 74, cls: 'g', align: 'c', t0: T('r8', '没人要求') - 0.2 });
  const Lens = [160, 260, 390, 590, 860, 1240], Y0 = -440, RH = 70, RGAP = 98, Xa = -760;
  const tLn = T('r8', '想得更长') - 0.3, tLe = T('r8', '越写') + 1.1;
  Lens.forEach((ln, i) => {
    const ta = lerp(tLn, tLe, i / 5);
    F.text('训练', Xa - 44, Y0 + i * RGAP, { fs: 52, cls: 'g', align: 'r', t0: ta - 0.2, off: i ? () => 0 : undefined });
    F.bar(Xa, Y0 + i * RGAP, ln, RH, { t0: ta, d: 0.6, color: i === 5 ? INK : '#8a8a8a', ease: linear });
  });
  F.arrow([[Xa - 56, Y0 + 40], [Xa - 56, Y0 + 5 * RGAP + 40]], { t0: tLn, d: tLe - tLn, w: 5, color: GRAY, head: 20 });
  F.text('示意', Xa + 1290, Y0 + 5 * RGAP + 66, { fs: 46, cls: 'g', align: 'r', t0: tLe });
  for (let i = 0; i < 6; i++) sfx('key', lerp(tLn, tLe, i / 5) + 0.3, { g: 0.1 });
  // 正确率
  const tC1 = T('r8c', '一成半') - 0.4, tC2 = T('r8c', '将近八成') - 0.4;
  F.text('那套竞赛题的正确率', 720, -300, { fs: 56, cls: 'g', align: 'c', t0: tC1 - 0.2 });
  F.count(720, -160, { from: 15.6, to: 77.9, dec: 1, t0: tC2 - 1.2, t1: tC2 + 0.5, fs: 184, cls: 'b', align: 'c', suffix: '%', });
  F.text('训练中', 720, -24, { fs: 52, cls: 'g', align: 'c', t0: tC1 });
  // 等等
  const tWt = T('r8d', '等等') - 0.3, tBk = T('r8d', '回头') - 0.2, yW = Y0 + 5 * RGAP + RH + 90;
  F.tok('Wait, wait. Wait.', { keys: drop(Xa + 980, yW, tWt, 200), t0: tWt, w: 620, d: 118, h: 26, fs: 76, bump: pulse(tWt + 0.5, 22) });
  F.line([[Xa + 1000, Y0 + 5 * RGAP + 36], [Xa + 980, yW - 60]], { t0: tWt + 0.2, d: 0.3, w: 5 });
  F.arrow([[Xa + 660, yW], [Xa + 200, yW], [Xa + 200, Y0 + 5 * RGAP + 44]], { t0: tBk, d: 0.8, w: 9, head: 30, color: RED });
  F.text('回头重想', Xa + 220, yW + 66, { fs: 70, cls: 'e', t0: tBk + 0.45 });
  sfx('pop', tWt + 0.36, { g: 0.24 }); sfx('whoosh', tBk, { g: 0.1 });

  // ── 公开发布 ──
  const tG0 = T('r8e') - 0.8;
  const G = W.sheet({ in: [tG0, 'r', 1.0], out: [T('r8b') - 0.75, 't', 1.0] });
  G.text('2025 年 1 月', -780, -360, { fs: 100, t0: T('r8e') + 0.02 });
  const tLg = T('r8e', 'DeepSeek') - 0.25, tSt = T('r8e', '发布了') - 0.25;
  G.logo(-760, -160, 120, (t) => ramp(t, tLg, 0.4));
  G.text('R1', 0, -160, { fs: 140, cls: 'b', t0: tLg + 0.3 });
  G.rect(250, -252, 820, -68, { t0: tSt - 0.1, d: 0.45, w: 8, color: INK });
  G.text('公开发布', 535, -160, { fs: 104, cls: 'b', align: 'c', t0: tSt + 0.15, d: 0.2, rise: 30 });
  sfx('pop', tSt + 0.3, { g: 0.3 });
  const tF0 = T('r8f') - 0.2, BS3 = 13, BX3 = -520;
  G.text('o1', BX3 - 36, 90, { fs: 88, align: 'r', t0: tF0 });
  G.bar(BX3, 90, 79.2 * BS3, 90, { t0: tF0, d: 0.75, color: LGREY });
  G.count(BX3 + 79.2 * BS3 + 28, 90, { from: 0, to: 79.2, dec: 1, t0: tF0, t1: tF0 + 0.75, fs: 88, suffix: '%' });
  G.text('R1', BX3 - 36, 235, { fs: 88, cls: 'b', align: 'r', t0: tF0 });
  G.bar(BX3, 235, 79.8 * BS3, 90, { t0: tF0 + 0.1, d: 0.75, color: INK });
  G.count(BX3 + 79.8 * BS3 + 28, 235, { from: 0, to: 79.8, dec: 1, t0: tF0 + 0.1, t1: tF0 + 0.85, fs: 88, cls: 'b', suffix: '%' });

  // ── 今天：一个个开关拨开 ──
  const tH = T('r8b') - 0.75, tMn = T('r8b', '主流') - 0.3, tSw = T('r8b', '思考模式') - 0.5;
  const M = W.sheet({ in: [tH, 't', 1.0], out: [T('r9') - 0.85, 'l', 1.0], h: 1100 });
  M.text('今天的主流大模型', 0, -430, { fs: 92, cls: 'b', align: 'c', t0: tMn });
  for (let j = 0; j < 5; j++) {
    const y = -290 + j * 118, tSj = tSw + j * 0.32, ta = tMn + j * 0.14;
    M.text('思考模式', -720, y, { fs: 72, t0: ta });
    M.toggle(-370, y, { t0: ta, on: (t) => ramp(t, tSj, 0.28) });
    M.bar(-200, y, 760, 62, { t0: tSj + 0.2, d: 0.65, color: '#8a8a8a', ease: linear });
    M.tok('答案', { keys: drop(690, y, tSj + 0.82, 130, 0.28), t0: tSj + 0.82, w: 190, d: 92, h: 18, fs: 60 });
    sfx('tick', tSj, { g: 0.2 });
  }

  // ── 打开思考模式，再问开头那道题 ──
  const tI = T('r9') - 0.85;
  const I = W.sheet({ in: [tI, 'r', 1.0], out: [T('r11') - 0.8, 'b', 1.0], w: 2100, h: 1240 });
  const tOn = T('r9', '打开') - 0.2;
  I.logo(-920, -510, 96, (t) => ramp(t, tI + 0.8, 0.4));
  I.text('思考模式', -350, -510, { fs: 72, t0: tI + 0.85 });
  I.toggle(0, -510, { t0: tI + 0.85, on: (t) => ramp(t, tOn, 0.3) });
  sfx('tick', tOn, { g: 0.28 });
  I.text('开', 170, -510, { fs: 66, cls: 'b', t0: tOn + 0.2 });
  I.text('25992 × 92138 =', 0, -340, { fs: 108, align: 'c', t0: T('r9', '开头') - 0.2 });
  I.text('不提醒它写过程', 880, -510, { fs: 64, cls: 'g', align: 'r', t0: T('r9', '不提醒') - 0.2 });
  const tTh2 = T('r10', '一大段思考') - 0.4, tAns = T('r10', '才报出') + 0.05, TX = -880;
  const TL = ['25992 = 26000 - 8', '26000 × 92138 - 8 × 92138 = 2,394,850,896', 'Check: 25000 + 992', '25000 × 92138 + 992 × 92138 = 2,394,850,896'];
  I.text('思考', TX, -205, { fs: 60, cls: 'b', t0: tTh2 - 0.1 });
  I.line([[TX, -162], [880, -162]], { t0: tTh2 - 0.1, d: 0.5, w: 3, color: GRAY });
  TL.forEach((l, i) => I.text(l, TX, -92 + i * 82, { fs: 62, type: [lerp(tTh2, tAns - 0.25, i / 4), lerp(tTh2, tAns - 0.25, (i + 1) / 4)] }));
  I.count(880, -205, { from: 0, to: 220, t0: tTh2, t1: tAns - 0.2, fs: 92, cls: 'b', align: 'r', suffix: ' 块' });
  for (let i = 0; i < 14; i++) sfx('key', lerp(tTh2, tAns - 0.2, i / 13), { g: 0.07 });
  I.line([[TX, 240], [880, 240]], { t0: tAns - 0.05, d: 0.45, w: 5 });
  ['239', '485', '089', '6'].forEach((a, i) => { const ta = T('r10', '报出答案') - 0.1 + i * 0.13; I.tok(a, { keys: drop(-360 + i * 258, 365, ta, 150), t0: ta, w: 234, d: 118, h: 22, fs: 90 }); sfx('pop', ta + 0.36, { g: 0.18 }); });
  I.text('答案', TX, 365, { fs: 82, t0: T('r10', '报出答案') - 0.2 });
  I.check(610, 365, 80, { t0: T('r10', '算对') - 0.1, w: 11 });
  sfx('chime', T('r10', '算对'), { g: 0.16 });

  // ── 二十五道全对 ──
  const tJ = T('r11') - 0.8;
  const J = W.sheet({ in: [tJ, 'b', 1.0], out: [T('r12') - 0.75, 'l', 1.0] });
  const DIG = ['三位', '四位', '五位', '六位', '七位'], GX = -320, GP2 = 150, GY = -300, tAq = T('r11', '各取') - 0.2, tOk2 = T('r11', '全对') - 1.35;
  DIG.forEach((d, r) => J.text(d, GX - 80, GY + r * 130, { fs: 62, align: 'r', t0: tAq + r * 0.08 }));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const ta = tAq + (r * 5 + c) * 0.024, tc = tOk2 + (r * 5 + c) * 0.052;
    J.rect(GX + c * GP2 - 54, GY + r * 130 - 50, GX + c * GP2 + 54, GY + r * 130 + 50, { t0: ta, d: 0.3, w: 3, color: GRAY });
    J.check(GX + c * GP2, GY + r * 130, 38, { t0: tc, w: 8 });
    if (r === 4) sfx('tick', tc, { g: 0.1 });
  }
  J.count(620, -40, { from: 0, to: 25, t0: tOk2, t1: tOk2 + 24 * 0.052 + 0.1, fs: 240, cls: 'b', align: 'c' });
  J.text('全对', 620, 170, { fs: 110, cls: 'b', align: 'c', t0: T('r11', '全对') - 0.15 });

  // ── 位数越多，写得越长 ──
  const tK = T('r12') - 0.75;
  const K = W.sheet({ in: [tK, 'l', 1.0], out: [T('r13') - 0.75, 'r', 1.0], h: 1200 });
  const VAL = [93, 166, 261, 412, 550], VX = (i) => -640 + i * 280, BASE = 310, SCL = 1.1, VW = 180;
  const tV = T('r12') + 0.05, tVe = Tend('r12') + 0.1;
  VAL.forEach((v, i) => {
    const ta = i === 0 ? T('r12b', '三位数') - 0.2 : (i === 4 ? T('r12b', '七位数') - 0.55 : lerp(tV, tVe, i / 3)), d = i === 4 ? 1.0 : 0.65;
    K.bar(VX(i) - VW / 2, BASE, VW, v * SCL, { t0: ta, d, axis: 'y', color: i === 4 ? INK : (i === 0 ? '#555' : '#9a9a9a') });
    K.count(VX(i), BASE - v * SCL - 56, { from: 0, to: v, t0: ta, t1: ta + d, fs: i === 4 || i === 0 ? 92 : 76, cls: i === 4 || i === 0 ? 'b' : '', align: 'c' });
    K.text(DIG[i], VX(i), BASE + 58, { fs: 62, align: 'c', t0: ta - 0.15 });
    sfx('pop', ta + d, { g: 0.14 });
  });
  K.text('平均的思考长度（块）', -760, -470, { fs: 62, cls: 'g', t0: tV });

  // ── 每一块，一趟 ──
  const tL = T('r13') - 0.75;
  const L = W.sheet({ in: [tL, 'r', 1.0], out: [s.end - 0.95, 't', 0.9], w: 2500, h: 1300 });
  const LN = 8, LXs = (i) => -1050 + i * 300, SR = 240, SLH = 56 * 7, LT = T('r13', '每一块') - 0.3, LT2 = T('r13', '多走') + 0.3;
  const LST = [];
  for (let i = 0; i < LN; i++) {
    const ta = lerp(LT, LT2, i / (LN - 1));
    L.tok('', { keys: drop(LXs(i), 240, tL + 0.55 + i * 0.05, 120, 0.28), t0: tL + 0.55 + i * 0.05, w: 200, d: 92, h: 18, cls: 'cube' });
    LST.push(L.stack(LXs(i), 40, { w: SR, d: 170, n: 56, gap: 7, rise: (t) => ramp(t, ta, 0.42, ease.out3), fill: (t) => ramp(t, ta + 0.2, 0.55, linear) }));
    sfx('pop', ta + 0.42, { g: 0.12 });
  }
  L.text('多写一块，多走一趟', 0, 430, { fs: 118, cls: 'b', align: 'c', t0: T('r13', '多走') + 0.2, d: 0.5 });

  // ── 镜头 ──
  const shM = fitCam([Mdl.box, C.p(-880, -420), C.p(Sx + 300, Sy + 260)], { pitch: 32, cz: C.Z + H * 0.3, kmax: 1.0 });
  const shL = fitCam([...LST.map((q) => q.box), L.p(-1200, 460), L.p(1200, 460)], { pitch: 34, cz: L.Z + SLH * 0.3 });
  W.cam([
    [s.start, chap.home(), 0.01],
    [s.start + 1.15, chap.home({ k: 1.07 }), Math.min(2.9, T('r1') - 1.0 - s.start - 1.15), linear],
    [T('r1') - 1.0, A.home({ cy: -60, pitch: 14 }), 1.0],
    [T('r1') + 1.5, A.home({ cy: -110, pitch: 14, k: 1.06 }), 1.0],
    [T('r1b') - 0.2, A.home({ cy: -60, pitch: 14 }), 0.9],
    [T('r1c') - 0.3, A.home({ cy: 40, pitch: 10, k: 0.98 }), 1.0],
    [tB, B.home({ cx: -90, pitch: 16, k: 1.06 }), 1.0],
    [tC, C.home({ cx: -440, cy: -110, pitch: 14, k: 1.3 }), 1.0],
    [T('r4') + 0.1, shM, 1.2],
    [tD, D.home({ cx: -280, cy: -400, pitch: 16, k: 1.06 }), 1.0],
    [T('r5', '发布') + 0.2, D.home({ cx: -160, cy: -300, pitch: 16, k: 0.9 }), 1.0],
    [tTh, D.home({ cx: 60, cy: -300, pitch: 16, k: 0.9 }), Math.max(0.9, tThE - tTh), linear],
    [T('r5b') - 0.35, D.home({ cx: 30, cy: -80, pitch: 8, k: 0.84 }), 1.1],
    [T('r5b', '同是') - 0.2, D.home({ cx: -100, cy: -90, pitch: 8, k: 0.92 }), 0.9],
    [T('r5b', '只对') - 0.35, D.home({ cx: -80, cy: -60, pitch: 8, k: 1.0 }), 1.0],
    [T('r5c') - 0.35, D.home({ cx: 30, cy: -80, pitch: 8, k: 0.84 }), 1.0],
    [tE0, E.home({ cy: -130, pitch: 12, k: 0.96 }), 1.0],
    [T('r7b') - 0.3, E.home({ cy: 110, pitch: 16, k: 1.02 }), 1.0],
    [tF, F.home({ cx: -100, cy: -60, pitch: 12, k: 0.84 }), 1.0],
    [T('r8c') - 0.3, F.home({ cx: 90, cy: -60, pitch: 8, k: 0.84 }), 1.0],
    [T('r8d') - 0.3, F.home({ cx: 0, cy: -20, pitch: 10, k: 0.84 }), 1.0],
    [tG0, G.home({ cy: -90, pitch: 12 }), 1.0],
    [T('r8f') - 0.3, G.home({ cy: 40, pitch: 8 }), 0.9],
    [tH, M.home({ pitch: 18, cy: -130, k: 1.05 }), 1.0],
    [tSw + 0.6, M.home({ pitch: 12, cy: 0, k: 0.94 }), 1.5, smooth],
    [tI, I.home({ pitch: 10, cy: -160, k: 0.92 }), 1.0],
    [T('r10') - 0.3, I.home({ pitch: 8, cy: 40, k: 0.9 }), 1.2, smooth],
    [tJ, J.home({ pitch: 14, cy: -40 }), 1.0],
    [tK, K.home({ pitch: 12, cy: -40, k: 0.92 }), 1.0],
    [T('r12b', '三位数') - 0.3, K.home({ pitch: 12, cx: -120, cy: -40, k: 0.98 }), 0.9],
    [T('r12b', '七位数') - 0.5, K.home({ pitch: 12, cx: 120, cy: -40, k: 0.98 }), 0.9],
    [tL, shL, 1.0],
    [s.end - 0.9, L.home({ pitch: 20, cy: -20, k: 0.8 }), 0.9],
  ]);
  [tB, tC, tD, tE0, tF, tG0, tH, tI, tJ, tK, tL, s.end - 0.95].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
});
