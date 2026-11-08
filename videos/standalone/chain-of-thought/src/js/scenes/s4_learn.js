// 03 越写越长。这个做法从「人写的几道例题」变成「人写的一句话」，再被练进模型，最后成为今天的缺省。
// 动作：例题卡片一张张放上来，又被抽走；一句话落进提问；这句话滑进纸垛，纸垛被它灌满；条形一路长过去，镜头跟着退；
// 开关一个个拨开；回到开头那道题，思考一行行印出来；一块对应一趟，纸垛从每块上立起来。
// 事实：S1、S2（10.4→40.7）；S5–S13（o1、R1、AIME 9.3/79.2/79.8、R1-Zero 15.6→77.9、「Wait」）；S16–S19（主流带思考模式，不列举型号）；L2（220 token、25/25、93/166/261/412/550）。
scene('learn', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const pulse = (ta, a = 30, d = 0.38) => (t) => a * Math.sin(Math.PI * clamp((t - ta) / d));
  const drop = (x, y, t, z = 200, d = 0.36) => [[t, x, y, z], [t + d * 1.45, x, y, 0]];
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, Math.max(d, 0.4));
  const LGREY = '#b4bac2';

  // ── 例题：放上来，又被抽走 ──
  const A = W.sheet({ in: [s.start + 0.25, 'r', 1.1], out: [T('r5') - 0.8, 'l', 1.0] });
  const chap = chapterSheet(W, s, '03', '越写越长', T('r1') - 1.0);
  A.text('提问', -800, -430, { fs: 48, cls: 'sec', t0: T('r1') - 0.7, off: off(T('r3') - 0.3, 0.5) });
  A.text('先给例题，再问新题', 800, -430, { fs: 56, cls: 'g', align: 'r', t0: Tend('r1') + 0.45, off: off(T('r1b') - 0.1) });
  A.text('几个月后：例题都不用给', 800, -430, { fs: 56, cls: 'b', align: 'r', t0: T('r1b', '几个月后') + 0.2, off: off(T('r3') - 0.3, 0.5) });
  A.line([[-800, -384], [800, -384]], { t0: T('r1') - 0.7, d: 0.6, w: 4, color: GRAY, off: off(T('r3') - 0.3, 0.5) });
  const tE = T('r1') + 1.7, tEo = T('r1b', '不用给') - 0.25, CX = [-540, 0, 540];
  CX.forEach((x, i) => {
    const ta = tE + i * 0.32, tb = tEo + i * 0.12;
    A.tok(`<div class="cardt">例题 ${i + 1}<small>写好的步骤</small><small>答案</small></div>`, { keys: [[ta, x, -190, 220], [ta + 0.36, x, -190, 0], [tb, x, -190, 0], [tb + 0.65, x + 200, -1300, 240]], t0: ta, w: 480, d: 320, h: 22, fs: 66 });
    sfx('pop', ta + 0.36, { g: 0.2 }); sfx('whoosh', tb, { g: 0.08 });
  });
  const tQ = T('r1') - 0.35;
  A.tok('一道新题', { keys: drop(0, 110, tQ, 180, 0.36), t0: tQ, w: 1120, d: 112, h: 20, fs: 76, off: off(T('r4') + 0.1, 0.5) });
  const tAdd = T('r1c', '加一句') - 0.3;
  A.tok('「我们一步一步来想」', { keys: [[tAdd, 0, 260, 260], [tAdd + 0.42, 0, 260, 0]], t0: tAdd, w: 1120, d: 132, h: 26, fs: 92, bump: pulse(T('r1c', '一步一步') + 0.6, 20), off: off(T('r4', '练进') - 1.05, 0.4) });
  A.text("Let's think step by step", 0, 382, { fs: 58, cls: 'g', align: 'c', t0: T('r1c', '一步一步') + 0.1, off: off(T('r3') - 0.3) });
  sfx('pop', tAdd + 0.42, { g: 0.28 });

  // ── 同一张纸：这句话让正确率翻了四倍，又被练进模型 ──
  const tC = T('r3') - 0.75, tB = T('r2') - 0.75, BX = -420, BS = 19, cOff = off(T('r3') - 0.3, 0.5);
  A.text('一套数学应用题的正确率', 0, -340, { fs: 76, cls: 'g', align: 'c', t0: T('r2', '应用题') - 0.2, off: cOff });
  const t1 = T('r2', '一成') - 0.5, t4 = T('r2', '四成') - 0.5;
  A.text('直接答', BX - 36, -240, { fs: 76, align: 'r', t0: t1 - 0.1, off: cOff });
  A.bar(BX, -240, 10.4 * BS, 96, { t0: t1, d: 0.8, color: LGREY, off: cOff });
  A.count(BX + 10.4 * BS + 30, -240, { follow: (t) => [-(1 - ramp(t, t1, 0.8, ease.out3)) * 10.4 * BS, 0], from: 0, to: 10.4, dec: 1, t0: t1, t1: t1 + 0.8, fs: 88, suffix: '%', off: cOff });
  A.text('加了这句', BX - 36, -90, { fs: 76, cls: 'b', align: 'r', t0: t4 - 0.1, off: cOff });
  A.bar(BX, -90, 40.7 * BS, 96, { t0: t4, d: 1.4, color: INK, off: cOff });
  A.count(BX + 40.7 * BS + 30, -90, { follow: (t) => [-(1 - ramp(t, t4, 1.4, ease.out3)) * 40.7 * BS, 0], from: 10.4, to: 40.7, dec: 1, t0: t4, t1: t4 + 1.4, fs: 120, cls: 'b', suffix: '%', off: cOff });
  for (let i = 0; i < 8; i++) sfx('key', lerp(t4, t4 + 1.4, i / 7), { g: 0.08 });
  const Sx = 520, Sy = -110, N = 60, GP = 7, H = N * GP, tInto = T('r4', '练进') - 1.0, tFull = tInto + 1.45;
  A.text('人写进提问里的一句话', -320, -140, { fs: 82, cls: 'b', align: 'c', t0: T('r3', '提问里') - 0.25, off: off(T('r5') - 1.1) });
  A.text('人写的', 0, 382, { fs: 66, cls: 'g', align: 'c', t0: T('r3', '提问里') - 0.1, off: off(T('r4') + 0.3) });
  A.line([[-120, 382], [120, 382]], { t0: T('r4') + 0.05, d: 0.35, w: 7, color: RED, off: off(T('r4') + 0.75) });
  A.text('不用人提醒', 0, 382, { fs: 70, cls: 'b', align: 'c', t0: T('r4') + 0.85, off: off(T('r5') - 1.1) });
  A.tok('一步一步来想', { keys: [[tInto - 0.1, 0, 260, 0], [tInto + 0.95, Sx - 40, Sy + 105 + 56, 0]], t0: tInto - 0.1, w: 460, d: 100, h: 16, fs: 60, off: off(tInto + 0.95, 0.3) });
  const Mdl = A.stack(Sx, Sy, { w: 340, d: 210, n: N, gap: GP, rise: (t) => ramp(t, T('r4') + 0.25, 1.1, ease.io3), fill: (t) => ramp(t, tInto + 1.0, tFull - tInto - 0.2, linear) }); sfx('riser', T('r4') + 0.25, { g: 0.1 });
  A.text('模型', Sx + 260, Sy + 40, { fs: 84, cls: 'b', t0: T('r4') + 1.0, off: off(T('r5') - 1.1) });
  sfx('whoosh', tInto, { g: 0.12 }); sfx('chime', tFull, { g: 0.14 });

  // ── o1：回答之前先写一大段思考 ──
  const tD = T('r5') - 0.8;
  const D = W.sheet({ in: [tD, 'r', 1.0], out: [T('r6') - 0.75, 'l', 1.0], w: 2200, h: 1300 });
  D.text('2024', -950, -510, { fs: 150, cls: 'b', t0: T('r5') + 0.02 });
  const tRl = T('r5', '发布') - 0.3;
  D.tok('o1', { keys: drop(-30, -510, tRl, 200), t0: tRl, w: 260, d: 130, h: 30, fs: 118 });
  D.img('assets/chatgpt-logo.svg', -570, -510, 100, (t) => ramp(t, tRl - 0.2, 0.5));
  D.text('OpenAI', -456, -510, { fs: 72, cls: 'sans', t0: tRl - 0.2 });
  sfx('pop', tRl + 0.36, { g: 0.26 });
  const tTh = T('r5', '思考') - 0.25, tThE = Tend('r5') + 0.25, RTX = -950, RTN = 56;
  D.text('思考', RTX, -310, { fs: 70, cls: 'b', t0: tTh - 0.15 });
  for (let i = 0; i < RTN; i++) { const ta = lerp(tTh, tThE, i / (RTN - 1)); D.bar(RTX + 170 + i * 26, -310, 20, 60, { t0: ta, d: 0.08, color: '#8a8f96', ease: linear, r: 2 }); }
  for (let i = 0; i < 10; i++) sfx('key', lerp(tTh, tThE, i / 9), { g: 0.07 });
  D.tok('答案', { keys: drop(RTX + 170 + RTN * 26 + 130, -310, tThE + 0.05, 150), t0: tThE + 0.05, w: 220, d: 104, h: 20, fs: 66 });
  // AIME
  const BS2 = 15, BXo = -640, Yg = 30, Yo = 210;
  D.text('一套数学竞赛题的正确率', RTX, -120, { fs: 76, cls: 'g', t0: T('r5b', '竞赛题') - 0.2 });
  const tG = T('r5b', '只对') - 0.3, tO = T('r5c', '将近八成') - 0.75;
  D.text('GPT-4o', BXo - 36, Yg, { fs: 80, align: 'r', t0: T('r5b', '同是') - 0.1 });
  D.bar(BXo, Yg, 9.3 * BS2, 104, { t0: tG, d: 0.5, color: LGREY });
  D.count(BXo + 9.3 * BS2 + 30, Yg, { follow: (t) => [-(1 - ramp(t, tG, 0.5, ease.out3)) * 9.3 * BS2, 0], from: 0, to: 9.3, dec: 1, t0: tG, t1: tG + 0.5, fs: 94, suffix: '%' });
  D.text('o1', BXo - 36, Yo, { fs: 104, cls: 'b', align: 'r', t0: tO - 0.2 });
  D.img('assets/chatgpt-logo.svg', BXo - 36 - 120 - 30 - 100, Yo, 100, (t) => ramp(t, tO - 0.2, 0.4));
  D.bar(BXo, Yo, 79.2 * BS2, 104, { t0: tO, d: 1.15, color: INK });
  D.count(BXo + 79.2 * BS2 + 30, Yo, { follow: (t) => [-(1 - ramp(t, tO, 1.15, ease.out3)) * 79.2 * BS2, 0], from: 9.3, to: 79.2, dec: 1, t0: tO, t1: tO + 1.15, fs: 138, cls: 'b', suffix: '%' });
  for (let i = 0; i < 8; i++) sfx('key', lerp(tO, tO + 1.15, i / 7), { g: 0.08 });
  sfx('chime', tO + 1.15, { g: 0.16 });

  // ── R1：一张纸讲到底——训练规则、越写越长、公开发布，同一张纸上淡入淡出 ──
  const tE0 = T('r6') - 0.75;
  const E = W.sheet({ in: [tE0, 'r', 1.0], out: [T('r8b') - 0.75, 'l', 1.0], w: 2300, h: 1420 });
  const eOff = off(T('r8') - 0.45, 0.6), fOff = off(T('r8e') - 0.45, 0.6);
  E.logo(-960, -620, 112, (t) => ramp(t, T('r6', 'DeepSeek') - 0.3, 0.4));
  E.text('R1 的一个版本', -360, -620, { fs: 86, cls: 'b', t0: T('r6', '一个版本') - 0.2 });
  E.text('训练时', -960, -470, { fs: 76, cls: 'g', t0: T('r6', '训练时') - 0.2, off: eOff });
  const tCard = T('r6', '解题过程') - 0.75, tNoS = T('r6', '不看') - 0.1, tOut = Tend('r6') + 0.15, yC = -280;
  E.tok('人写的解题过程', { keys: [[tCard - 0.3, 1700, yC, 0], [tCard + 0.3, 0, yC, 0], [tOut, 0, yC, 0]], t0: tCard - 0.3, w: 980, d: 150, h: 26, fs: 88, off: off(tOut, 0.5) });
  const strike = E.tok('', { keys: [[tNoS, 0, yC, 48]], t0: tNoS, fadeIn: 0.1, w: 980, d: 150, h: 1, cls: 'ghost', off: off(tOut, 0.5) });
  strike.top.innerHTML = '<svg width="980" height="150" style="position:absolute;left:0;top:0"><path d="M20 12 L960 138 M960 12 L20 138" stroke="#a5402d" stroke-width="12" fill="none"/></svg>';
  sfx('error', tNoS + 0.05, { g: 0.12 });
  const tOk = T('r7b', '答没答对') - 0.3, tFm = T('r7b', '格式') - 0.3, tRw = T('r7b', '奖励') - 0.25;
  E.tok('答没答对', { keys: [[tOk, -440, -100, 200], [tOk + 0.45, -440, -100, 0]], t0: tOk, w: 480, d: 130, h: 22, fs: 80, off: eOff });
  E.tok('格式对不对', { keys: [[tFm, 440, -100, 200], [tFm + 0.45, 440, -100, 0]], t0: tFm, w: 520, d: 130, h: 22, fs: 80, off: eOff });
  E.arrow([[-440, -26], [-440, 130], [-176, 130]], { t0: tRw, d: 0.6, w: 7, off: eOff });
  E.arrow([[440, -26], [440, 130], [176, 130]], { t0: tRw, d: 0.6, w: 7, off: eOff });
  E.tok('奖励', { keys: drop(0, 130, tRw + 0.55, 200, 0.34), t0: tRw + 0.55, w: 320, d: 130, h: 36, fs: 104, off: eOff });
  sfx('pop', tOk + 0.45, { g: 0.2 }); sfx('pop', tFm + 0.45, { g: 0.2 }); sfx('chime', tRw + 0.95, { g: 0.14 });
  // 思考越写越长
  E.text('没人要求它想得更长', 0, -510, { fs: 74, cls: 'g', align: 'c', t0: T('r8', '没人要求') - 0.2, off: fOff });
  const Lens = [160, 260, 390, 590, 860, 1240], Y0 = -370, RH = 70, RGAP = 98, Xa = -760;
  const tLn = T('r8', '想得更长') - 0.3, tLe = T('r8', '越写') + 1.1;
  Lens.forEach((ln, i) => {
    const ta = lerp(tLn, tLe, i / 5);
    if (!i) E.text('训练', Xa - 44, Y0, { fs: 52, cls: 'g', align: 'r', t0: ta - 0.2, off: fOff });
    E.bar(Xa, Y0 + i * RGAP, ln, RH, { t0: ta, d: 0.6, color: i === 5 ? INK : '#aeb4bc', ease: linear, off: fOff });
  });
  E.arrow([[Xa - 56, Y0 + 40], [Xa - 56, Y0 + 5 * RGAP + 40]], { t0: tLn, d: tLe - tLn, w: 3, color: GRAY, head: 16, off: fOff });
  E.arrow([[Xa, Y0 - 56], [Xa + 1320, Y0 - 56]], { t0: tLn, d: 0.8, w: 3, color: GRAY, head: 16, off: fOff });
  E.text('思考长度', Xa + 1336, Y0 - 56, { fs: 50, cls: 'g', t0: tLn + 0.4, off: fOff });
  E.text('示意', Xa + 1240, Y0 + 5 * RGAP + 54, { fs: 46, cls: 'g', align: 'r', t0: tLe, off: fOff });
  for (let i = 0; i < 6; i++) sfx('key', lerp(tLn, tLe, i / 5) + 0.3, { g: 0.1 });
  const tC1 = T('r8c', '一成半') - 0.4, tC2 = T('r8c', '将近八成') - 0.4;
  E.text('那套竞赛题的正确率', 720, -230, { fs: 56, cls: 'g', align: 'c', t0: tC1 - 0.2, off: fOff });
  E.count(720, -90, { from: 15.6, to: 77.9, dec: 1, t0: tC2 - 1.2, t1: tC2 + 0.5, fs: 184, cls: 'b', align: 'c', suffix: '%', off: fOff });
  E.text('训练中', 720, 46, { fs: 52, cls: 'g', align: 'c', t0: tC1, off: fOff });
  const tWt = T('r8d', '等等') - 0.3, tBk = T('r8d', '回头') - 0.2, yW = Y0 + 5 * RGAP + RH + 90;
  E.tok('Wait, wait. Wait.', { keys: drop(Xa + 980, yW, tWt, 200), t0: tWt, w: 620, d: 118, h: 26, fs: 76, off: fOff });
  E.line([[Xa + 1000, Y0 + 5 * RGAP + 36], [Xa + 980, yW - 60]], { t0: tWt + 0.2, d: 0.3, w: 5, off: fOff });
  E.arrow([[Xa + 660, yW], [Xa + 200, yW], [Xa + 200, Y0 + 5 * RGAP + 44]], { t0: tBk, d: 0.8, w: 9, head: 30, color: RED, off: fOff });
  E.text('回头重想', Xa + 220, yW + 66, { fs: 70, cls: 'e', t0: tBk + 0.45, off: fOff });
  sfx('pop', tWt + 0.36, { g: 0.24 }); sfx('whoosh', tBk, { g: 0.1 });
  // 公开发布；和 o1 差不多
  const tSt = T('r8e', '发布了') - 0.25;
  E.text('2025 年 1 月', 20, -310, { fs: 120, align: 'r', t0: T('r8e') + 0.05 });
  E.rect(70, -395, 470, -225, { t0: tSt - 0.1, d: 0.5, w: 7, color: INK });
  E.text('公开发布', 270, -310, { fs: 100, cls: 'b', align: 'c', t0: tSt + 0.2, d: 0.5 });
  sfx('pop', tSt + 0.3, { g: 0.3 });
  const tF0 = T('r8f') - 0.2, BS3 = 13, BX3 = -400;
  E.text('同一套竞赛题的正确率', 0, -110, { fs: 62, cls: 'g', align: 'c', t0: tF0 });
  E.text('o1', BX3 - 36, 40, { fs: 88, align: 'r', t0: tF0 });
  E.img('assets/chatgpt-logo.svg', BX3 - 36 - 100 - 26 - 84, 40, 84, (t) => ramp(t, tF0, 0.5));
  E.bar(BX3, 40, 79.2 * BS3, 90, { t0: tF0, d: 0.9, color: LGREY });
  E.count(BX3 + 79.2 * BS3 + 28, 40, { follow: (t) => [-(1 - ramp(t, tF0, 0.9, ease.out3)) * 79.2 * BS3, 0], from: 0, to: 79.2, dec: 1, t0: tF0, t1: tF0 + 0.9, fs: 88, suffix: '%' });
  E.text('R1', BX3 - 36, 200, { fs: 88, cls: 'b', align: 'r', t0: tF0 });
  E.logoMark(BX3 - 36 - 100 - 26 - 84 * 1.05, 200, 72, (t) => ramp(t, tF0, 0.5));
  E.bar(BX3, 200, 79.8 * BS3, 90, { t0: tF0 + 0.1, d: 0.9, color: INK });
  E.count(BX3 + 79.8 * BS3 + 28, 200, { follow: (t) => [-(1 - ramp(t, tF0 + 0.1, 0.9, ease.out3)) * 79.8 * BS3, 0], from: 0, to: 79.8, dec: 1, t0: tF0 + 0.1, t1: tF0 + 1.0, fs: 88, cls: 'b', suffix: '%' });

  // ── 今天：一个个开关拨开 ──
  const tH = T('r8b') - 0.75, tMn = T('r8b', '主流') - 0.3, tSw = T('r8b', '思考模式') - 0.5;
  const M = W.sheet({ in: [tH, 'r', 1.0], out: [T('r9') - 0.85, 'l', 1.0], h: 1100 });
  M.text('今天的主流大模型', 0, -430, { fs: 92, cls: 'b', align: 'c', t0: tMn });
  for (let j = 0; j < 5; j++) {
    const y = -290 + j * 118, tSj = tSw + j * 0.2, ta = tMn + j * 0.14;
    M.text('思考模式', -720, y, { fs: 72, t0: ta });
    M.toggle(-370, y, { t0: ta, on: (t) => ramp(t, tSj, 0.28) });
    M.bar(-200, y, 760, 62, { t0: tSj + 0.2, d: 0.55, color: '#aeb4bc', ease: linear });
    M.tok('答案', { keys: drop(690, y, tSj + 0.72, 130, 0.28), t0: tSj + 0.72, w: 190, d: 92, h: 18, fs: 60 });
    sfx('tick', tSj, { g: 0.2 });
  }

  // ── 打开思考模式，再问开头那道题 ──
  const tI = T('r9') - 0.85;
  const I = W.sheet({ in: [tI, 'r', 1.0], out: [T('r11') - 0.8, 'l', 1.0], w: 2100, h: 1240 });
  const tOn = T('r9', '打开') - 0.2;
  I.logo(-560, -510, 96, (t) => ramp(t, tI + 0.8, 0.4));
  I.text('思考模式', -50, -510, { fs: 72, t0: tI + 0.85 });
  I.toggle(310, -510, { t0: tI + 0.85, on: (t) => ramp(t, tOn, 0.3) });
  sfx('tick', tOn, { g: 0.28 });
  I.text('开', 470, -510, { fs: 66, cls: 'b', t0: tOn + 0.2 });
  I.text('25992 × 92138 =', 0, -340, { fs: 108, align: 'c', t0: T('r9', '开头') - 0.2 });
  I.text('不提醒它写过程', 0, -230, { fs: 60, align: 'c', t0: T('r9', '不提醒') - 0.2, off: off(T('r10', '一大段思考') - 0.75, 0.3) });
  const tTh2 = T('r10', '一大段思考') - 0.4, tAns = T('r10', '才报出') + 0.05, TX = -880;
  const TL = ['25992 = 26000 - 8', '26000 × 92138 - 8 × 92138 = 2,394,850,896', 'Check: 25000 + 992', '25000 × 92138 + 992 × 92138 = 2,394,850,896'];
  I.text('思考', TX, -205, { fs: 46, cls: 'sec', t0: tTh2 - 0.1 });
  I.line([[TX, -162], [880, -162]], { t0: tTh2 - 0.1, d: 0.5, w: 3, color: GRAY });
  TL.forEach((l, i) => I.text(l, TX, -92 + i * 82, { fs: 62, type: [lerp(tTh2, tAns - 0.25, i / 4), lerp(tTh2, tAns - 0.25, (i + 1) / 4)] }));
  I.count(880, -205, { from: 0, to: 220, t0: tTh2, t1: tAns - 0.2, fs: 92, cls: 'b', align: 'r', suffix: ' 块' });
  for (let i = 0; i < 14; i++) sfx('key', lerp(tTh2, tAns - 0.2, i / 13), { g: 0.07 });
  I.line([[TX, 240], [880, 240]], { t0: tAns - 0.05, d: 0.45, w: 5 });
  ['239', '485', '089', '6'].forEach((a, i) => { const ta = T('r10', '报出答案') - 0.1 + i * 0.13; I.tok(a, { keys: drop(-360 + i * 258, 365, ta, 150), t0: ta, w: 234, d: 118, h: 22, fs: 90 }); sfx('pop', ta + 0.36, { g: 0.18 }); });
  I.text('答案', TX, 365, { fs: 82, t0: T('r10', '报出答案') - 0.2 });
  I.cursor(538, 365, 96, { t0: T('r10', '报出答案') + 0.55 });
  I.check(650, 365, 80, { t0: T('r10', '算对') - 0.1, w: 11 });
  sfx('chime', T('r10', '算对'), { g: 0.16 });

  // ── 同一个实验的结果放在一张纸上：左边二十五道全对，右边位数越多写得越长 ──
  const tJ = T('r11') - 0.8;
  const J = W.sheet({ in: [tJ, 'r', 1.0], out: [s.end - 0.95, 'l', 0.9], h: 1100 });
  const jOff = off(T('r13') - 0.5, 0.6);
  const DIG = ['三位', '四位', '五位', '六位', '七位'], GX = -680, GP2 = 112, GY = -280, tAq = T('r11') + 0.05, tOk2 = T('r11', '全对') - 1.35;
  J.text('每种位数取 5 道', GX - 46, -390, { fs: 50, cls: 'g', t0: tAq });
  DIG.forEach((d, r) => J.text(d, GX - 70, GY + r * GP2, { fs: 50, align: 'r', t0: tAq + r * 0.08 }));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const ta = tAq + (r * 5 + c) * 0.024, tc = tOk2 + (r * 5 + c) * 0.052;
    J.rect(GX + c * GP2 - 46, GY + r * GP2 - 46, GX + c * GP2 + 46, GY + r * GP2 + 46, { t0: ta, d: 0.3, w: 2.5, color: '#b9bfc7' });
    J.check(GX + c * GP2, GY + r * GP2, 32, { t0: tc, w: 6 });
    if (r === 4) sfx('tick', tc, { g: 0.1 });
  }
  J.count(GX + 224, GY + 5 * GP2 + 8, { from: 0, to: 25, t0: tOk2, t1: tOk2 + 24 * 0.052 + 0.1, fs: 100, cls: 'b', align: 'c', suffix: ' 道全对' });
  const VAL = [93, 166, 261, 412, 550], VX = (i) => 60 + i * 165, BASE = 270, SCL = 0.95, VW = 110;
  const tV = T('r12') + 0.05, tVe = Tend('r12') + 0.1;
  J.text('平均的思考长度（块）', -30, -380, { fs: 54, cls: 'g', off: jOff, t0: tV });
  J.line([[-40, BASE], [800, BASE]], { off: jOff, t0: tV, d: 0.6, w: 3, color: GRAY });
  J.text('位数', 815, BASE, { fs: 50, cls: 'g', off: jOff, t0: tV + 0.3 });
  VAL.forEach((v, i) => {
    const ta = i === 0 ? T('r12b', '三位数') - 0.2 : (i === 4 ? T('r12b', '七位数') - 0.55 : lerp(tV, tVe, i / 3)), d = i === 4 ? 1.1 : 0.8;
    J.bar(VX(i) - VW / 2, BASE, VW, v * SCL, { off: jOff, t0: ta, d, axis: 'y', color: i === 4 ? '#565c65' : (i === 0 ? '#6f757d' : '#b4bac2') });
    J.count(VX(i), BASE - v * SCL - 48, { follow: (t) => [0, (1 - ramp(t, ta, d, ease.out3)) * v * SCL], from: 0, to: v, off: jOff, t0: ta, t1: ta + d, fs: i === 4 || i === 0 ? 84 : 70, cls: i === 4 || i === 0 ? 'b' : '', align: 'c' });
    J.text(DIG[i], VX(i), BASE + 50, { fs: 52, align: 'c', off: jOff, t0: ta - 0.15 });
    sfx('pop', ta + d, { g: 0.14 });
  });

  // ── 同一张纸：多写一块，多走一趟（右边的条形退下去，纸垛从每一块上立起来）──
  const LN = 6, LXs = (i) => 90 + i * 150, LY = -30, SLH = 44 * 7, LT = T('r13', '每一块') - 0.2, LT2 = T('r13', '多走') + 0.4, tLt = T('r13') - 0.3;
  const LST = [];
  for (let i = 0; i < LN; i++) {
    const ta = lerp(LT, LT2, i / (LN - 1));
    J.tok('', { keys: drop(LXs(i), 170, tLt + i * 0.05, 100, 0.28), t0: tLt + i * 0.05, w: 120, d: 70, h: 14, cls: 'cube' });
    LST.push(J.stack(LXs(i), LY, { w: 126, d: 100, n: 44, gap: 7, rise: (t) => ramp(t, ta, 0.55, ease.out3), fill: (t) => ramp(t, ta + 0.3, 0.6, linear) }));
    sfx('pop', ta + 0.55, { g: 0.12 });
  }
  J.text('多写一块，多走一趟', 465, 320, { fs: 90, cls: 'b', align: 'c', t0: T('r13', '多走') + 0.3, d: 0.6 });

  // ── 正在讲的区域亮起 ──
  A.wash(-810, -370, 810, -20, tE + 0.5, T('r1b') - 0.2);
  D.wash(-1060, -610, 1060, -240, tTh - 0.2, Tend('r5') + 0.5);
  D.wash(-1060, 80, 1060, 320, tO - 0.2, tO + 1.8);
  I.wash(-900, -570, 900, -170, T('r9', '开头') - 0.2, T('r10') - 0.4);

  // ── 镜头 ──
  const shM = fitCam([Mdl.box, A.p(-900, -440), A.p(900, 430)], { pitch: 26, cz: A.Z + H * 0.25, kmax: 1.0 });
  const shJ = fitCam([...LST.map((q) => q.box), J.p(-880, -400), J.p(860, 400)], { pitch: 22, cz: J.Z + SLH * 0.2, kmax: 1.0 });
  W.cam([
    [s.start + 0.02, chap.home(), 1.35, smooth],
    [T('r1') - 1.0, A.home({ cy: 20 }), 1.25, smooth],
    // 纸垛立起来，要看得出高度
    [T('r4') + 0.1, shM, 1.4, smooth],
    [tD, D.home({ cy: -80, k: 0.84 }), 1.25, smooth],
    [tE0, E.home({ cy: -90, k: 0.84 }), 1.25, smooth],
    [tH, M.home({ cy: -70 }), 1.25, smooth],
    [tI, I.home({ cy: -10, k: 0.9 }), 1.25, smooth],
    [tJ, J.home({ cx: 15, cy: -20 }), 1.25, smooth],
    [T('r13') - 0.35, shJ, 1.4, smooth],
    [s.end - 0.95, HOME, 0.9, smooth],
  ]);
  [tD, tE0, tH, tI, tJ, s.end - 0.95].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
});
