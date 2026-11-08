// 02 草稿。人有一张草稿纸；模型没有，只能写进回答里。三百多块小方格一行行铺开（镜头从第一行退到全貌）；
// 92138 真的拆开；结果写成字、落到纸上，滑到下一摞底部接着算；一摞接一摞，镜头一路退开看长度。
// 一百道题一格格变黑；一串点铺得和算式一样长却什么也传不过去；答案跳到过程前面，过程变成空框。
// 事实：L1（think_first 321 token；39/99/36）；S1（一串点）；算式见 FACTS b5–b5b；先答后写的例子 2394841296 见 FACTS b16。摞里的短线只表示「中间结果」。
scene('draft', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const pulse = (ta, a = 30, d = 0.38) => (t) => a * Math.sin(Math.PI * clamp((t - ta) / d));
  const drop = (x, y, t, z = 200, d = 0.36) => [[t, x, y, z], [t + d, x, y, 0]];
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, d);
  const tOf = (c, w, e) => T(c, w) + (e || 0);

  // ── 底纸：这道题 ──
  const tPaper0 = T('b1', '纸') - 0.75;
  const Z0 = W.sheet({ in: [s.start + 0.25, 'r', 1.1], out: [T('b3', '打草稿') - 0.55, 'l', 1.0] });
  const chap = chapterSheet(W, s, '02', '草稿', T('b1') - 1.0);
  Z0.text('25992 × 92138', 0, -30, { fs: 150, align: 'c', t0: T('b1') - 0.9, off: off(tPaper0 + 0.55, 0.3) });

  // ── 人的草稿纸：从下面递上来 ──
  const tPaper = T('b1', '纸') - 0.75;
  const A = W.sheet({ w: 1500, h: 900, y: 10, in: [tPaper, 'b', 1.0], out: [T('b3', '打草稿') - 0.55, 'b', 0.9] });
  const tW = T('b2', '写下来') - 0.5, tN = T('b2', '下一步') - 0.15, tJ = T('b2', '接着算') - 0.1;
  A.text('草稿', -640, -350, { fs: 58, cls: 'g', t0: tPaper + 0.8 });
  A.text('25992 × 92138', 640, -350, { fs: 58, cls: 'g', align: 'r', t0: tPaper + 1.6 });
  A.line([[-640, -304], [640, -304]], { t0: tPaper + 0.8, d: 0.5, w: 3, color: GRAY });
  A.text('25992 × 92000 =', 60, -190, { fs: 76, align: 'r', t0: T('b2') - 0.2 });
  A.text('25992 × 138 =', 60, -70, { fs: 76, align: 'r', t0: T('b2') + 0.3 });
  A.tok('2391264000', { keys: [[tW - 0.1, 330, -190, 150], [tW + 0.25, 330, -190, 0], [tN, 330, -190, 0], [tN + 0.5, -330, 130, 0]], t0: tW - 0.1, w: 470, d: 92, h: 14, fs: 72 });
  A.tok('3586896', { keys: [[tW + 0.25, 330, -70, 150], [tW + 0.6, 330, -70, 0], [tN + 0.15, 330, -70, 0], [tN + 0.65, 240, 130, 0]], t0: tW + 0.25, w: 360, d: 92, h: 14, fs: 72 });
  A.text('+', -30, 128, { fs: 72, align: 'c', t0: tN + 0.5 });
  A.line([[-640, 216], [640, 216]], { t0: tJ, d: 0.4, w: 5 });
  A.text('=  2394850896', 0, 300, { fs: 92, cls: 'b', align: 'c', t0: Tend('b2') + 0.35 });
  sfx('pop', tW + 0.25, { g: 0.2 }); sfx('pop', tW + 0.6, { g: 0.2 }); sfx('whoosh', tN, { g: 0.1 });
  // 模型没有别的纸
  const tNo = T('b3', '没有别的纸') - 0.2;
  A.line([[-660, -400], [660, 400]], { t0: tNo, d: 0.3, w: 12, color: RED });
  A.line([[660, -400], [-660, 400]], { t0: tNo + 0.25, d: 0.3, w: 12, color: RED });
  sfx('error', tNo, { g: 0.14 });

  // ── 回答：三百多块 ──
  const tR = T('b3', '打草稿') - 0.55;
  const R = W.sheet({ w: 2100, h: 1240, in: [tR, 't', 1.0], out: [T('b5') - 0.75, 'l', 1.0] });
  R.text('回答', -880, -520, { fs: 92, cls: 'b', t0: tR + 0.7 });
  R.line([[-880, -456], [880, -456]], { t0: tR + 0.7, d: 0.6, w: 5 });
  const CW = 54, CH = 44, X0 = -30 * CW / 2, Y0 = -370, N = 321;
  const t4a = T('b3', '回答里') - 0.25, t4b = T('b4', '三百多块') + 0.1;
  for (let i = 0; i < N; i++) { const c = i % 30, r = Math.floor(i / 30), ta = lerp(t4a, t4b, Math.pow(i / (N - 1), 1.35)); R.bar(X0 + c * CW, Y0 + r * (CH + 8), CW - 8, CH, { t0: ta, d: 0.1, color: i < 8 ? INK : '#8f8f8f', ease: linear, r: 3 }); }
  for (let i = 0; i < 14; i++) sfx('key', lerp(t4a, t4b, i / 13), { g: 0.07 });
  R.text('先打草稿', X0, Y0 - 62, { fs: 52, cls: 'g', t0: t4a - 0.1 });
  R.count(X0 + 30 * CW - 8, Y0 + 11 * 52 + 96, { from: 0, to: 321, t0: t4a, t1: t4b, fs: 128, cls: 'b', align: 'r', suffix: ' 块' });
  const ANS = ['239', '485', '089', '6'], tA = T('b4', '三百多块') + 0.3;
  R.text('答案', X0, Y0 + 11 * 52 + 96, { fs: 80, t0: tA });
  ANS.forEach((a, i) => { R.tok(a, { keys: drop(X0 + 290 + i * 226, Y0 + 11 * 52 + 96, tA + i * 0.12, 120), t0: tA + i * 0.12, w: 206, d: 104, h: 18, fs: 78 }); sfx('pop', tA + i * 0.12 + 0.3, { g: 0.16 }); });

  // ── 过程：92138 拆开 ──
  const tP = T('b5') - 0.75;
  const P = W.sheet({ in: [tP, 'r', 1.0], out: [T('b6') - 0.7, 'b', 1.0] });
  const Ycut = T('b5', '拆成') - 0.1, tPlus = T('b5', '加一百') - 0.25;
  P.tok('92138', { keys: [[tP, 0, -340, 0], [Ycut + 0.3, 0, -340, 0]], t0: tP + 0.5, w: 390, d: 118, h: 26, fs: 112, off: off(Ycut + 0.3, 0.05) });
  const pR = [[-1, '92000'], [1, '138']];
  P.text('92138  ＝', -420, -340, { fs: 92, cls: 'g', align: 'r', t0: Ycut + 0.25 });
  const pieceK = (v) => [[Ycut + 0.3, 0, -340, 40], [Ycut + 0.85, v, -340, 0]];
  P.tok('92000', { keys: pieceK(-160), t0: Ycut + 0.3, fadeIn: 0.02, w: 340, d: 118, h: 26, fs: 112 });
  P.tok('138', { keys: pieceK(360), t0: Ycut + 0.3, fadeIn: 0.02, w: 240, d: 118, h: 26, fs: 112 });
  P.text('+', 120, -340, { fs: 100, align: 'c', t0: tPlus });
  sfx('pop', Ycut + 0.85, { g: 0.2 });
  // 两边分别乘
  const tM = T('b5b', '分别跟') - 0.15, tMul = T('b5b', '相乘') - 0.15, tSum = T('b5b', '加起来') - 0.15;
  const RY = [-150, 20], PX = -690;
  const row = (y, b, res, wr, ta) => {
    P.tok('25992', { keys: drop(PX, y, ta, 130), t0: ta, w: 290, d: 106, h: 20, fs: 86 });
    P.text('×', PX + 200, y, { fs: 80, align: 'c', t0: ta + 0.12 });
    P.tok(b, { keys: [[ta, b === '92000' ? -160 : 360, -340, 0], [ta + 0.55, PX + 410, y, 0]], t0: ta, w: 290, d: 106, h: 20, fs: 86 });
    P.text('=', PX + 640, y, { fs: 80, align: 'c', t0: tMul });
    return P.count(PX + 700, y, { from: 0, to: res, t0: tMul, t1: tMul + 0.65, fs: 96, cls: 'b' });
  };
  row(RY[0], '92000', 2391264000, 0, tM); row(RY[1], '138', 3586896, 0, tM + 0.22);
  for (let i = 0; i < 6; i++) sfx('key', lerp(tMul, tMul + 0.65, i / 5), { g: 0.07 });
  P.line([[PX - 150, 110], [760, 110]], { t0: tSum, d: 0.4, w: 6 });
  P.text('加起来', PX - 150, 210, { fs: 70, cls: 'g', t0: tSum });
  P.tok('2394850896', { keys: drop(170, 210, tSum + 0.35, 170, 0.32), t0: tSum + 0.35, w: 720, d: 130, h: 30, fs: 122 });
  sfx('pop', tSum + 0.67, { g: 0.26 });

  // ── 接力：写成字，从下一摞底部接上 ──
  const tD = T('b6') - 0.7;
  const D = W.sheet({ w: 5200, h: 1400, x: 1100, y: -40, in: [tD, 'b', 1.0], out: [T('b12') - 0.85, 'b', 1.0] });
  const NS = 9, GAP = 400, SX = (i) => -1500 + i * GAP, SY = -60, RW = 270, RD = 180, LAY = 56, SEP = 7, SL = 205;
  const H = LAY * SEP, Wr = T('b6', '写成字'), Rd = T('b7', '读到') - 0.1, Up = T('b7', '往上') - 0.1;
  const t8 = T('b8'), t8a = T('b8', '很多趟') - 0.3, t8b = T('b8', '接起来') + 0.1;
  const tB = T('b8b'), tBe = Tend('b8b');
  // 每一摞什么时候开始、什么时候算到顶
  const span = [
    [T('b6') + 0.05, Wr - 0.55],
    [Up - 0.05, Up + 1.3],
    [t8 - 0.15, t8 + 1.05],
    [t8a + 0.75, t8b],
  ];
  for (let i = 4; i < NS; i++) { const a = lerp(tB + 0.15, tBe + 2.6, (i - 4) / (NS - 4)); span.push([a, a + 0.72]); }
  const ST = span.map((sp, i) => {
    const R2 = D.stack(SX(i), SY, { w: RW, d: RD, n: LAY, gap: SEP, rise: (t) => ramp(t, sp[0] - 0.5, 0.5, ease.out3), fill: (t) => { const f0 = ramp(t, sp[0], sp[1] - sp[0], linear); if (i >= 4) return f0; return Math.max(f0 * (1 - ramp(t, sp[1] + 0.55, 0.55)), ramp(t, tB - 0.2 + i * 0.14, 0.55, linear)); } });
    R2.marks(60 + i, 14); sfx('riser', sp[0] - 0.4, { g: 0.05 }); return R2;
  });
  const fr0 = SY + RD / 2;
  // 中间结果：从顶上落到纸上，滑到下一摞底部
  const CHIP = ['2391264000', '3586896', '2394850896'];
  const chipKey = (i, ta, t2, d = 0.7) => { const xa = SX(i), xb = SX(i + 1), xm = (xa + xb) / 2 - 20; return [[ta, xa, SY, H + 26], [ta + d * 0.5, lerp(xa, xm, 0.5), lerp(SY, SL, 0.5), H * 0.55], [ta + d, xm, SL, 0], [t2 - 0.02, xm, SL, 0], [t2 + 0.55, xb - 30, fr0 + 32, 0]]; };
  const WRAP = span.map((sp) => sp[1]);
  const tH = [Rd, t8 - 0.55, t8a + 0.35];
  CHIP.forEach((c, i) => {
    const ta = WRAP[i] - 0.05;
    D.tok(c, { keys: chipKey(i, ta, tH[i]), t0: ta - 0.1, fadeIn: 0.12, w: 300, d: 98, h: 16, fs: 58, off: off(tH[i] + 0.56, 0.2) });
    D.text(c, (SX(i) + SX(i + 1)) / 2 - 20 - 150, SL + 92, { fs: 44, cls: 'g', t0: tH[i] + 0.3, off: off(tB - 0.5, 0.45) });
    sfx('pop', ta + 0.7, { g: 0.22 }); sfx('whoosh', tH[i], { g: 0.08 });
  });
  const lb = D.text('写成字', SX(0) + 190, SL + 200, { fs: 96, cls: 'b', t0: Wr + 0.15, off: off(T('b7', '读到') - 0.2) });
  lb.el.dataset.mark = '1';
  D.text('下一趟从底下读到它，接着往上算', SX(0) - 150, SL + 200, { fs: 68, t0: T('b7', '读到') - 0.1, off: off(t8 - 0.2) });
  // 后面的摞用没字的小方块接力
  for (let i = 3; i < NS - 1; i++) {
    const ta = Math.max(WRAP[i] - 0.05, span[i + 1][0] - 1.0), t2 = span[i + 1][0] - 0.48;
    D.tok('', { keys: chipKey(i, ta, t2, 0.42), t0: ta - 0.1, fadeIn: 0.1, w: 110, d: 76, h: 14, cls: 'cube dk', off: off(t2 + 0.5, 0.15) });
  }
  // 量一量连起来有多长
  const tLn = tB + 0.2;
  D.arrow([[SX(0) - RW / 2, SL + 210], [SX(NS - 1) + RW / 2 + 40, SL + 210]], { t0: tLn, d: tBe + 3.2 - tLn, w: 14, head: 56, color: INK, ease: linear });
  D.text('写下的中间步骤越多，连着算下去的就越长', SX(0) + 1600, SL + 370, { fs: 172, cls: 'b', align: 'c', t0: tBe - 0.45, d: 0.5 });

  // ── 一百道题 ──
  const tG = T('b12') - 0.85;
  const G = W.sheet({ in: [tG, 'l', 1.0], out: [T('b9') - 0.75, 'r', 1.0], h: 1100 });
  const TW = 32, PW = 38, TH = 62, RY0 = -150, RGAP = 80, Bx = [-760, 60], DIG = ['三位', '四位', '五位', '六位', '七位'];
  const D1 = [20, 16, 3, 0, 0], D2 = [20, 20, 20, 20, 19];
  const tL0 = T('b12', '三位') - 0.3, tL1 = T('b12', '七位') + 0.35;
  const b13a = T('b13', '对了') - 0.15, b13b = T('b13', '三十九') + 0.1, b2a = T('b13b', '对了') - 0.4, b2b = T('b13b', '九十九') + 0.1;
  DIG.forEach((d, r) => { G.text(d, Bx[0] - 30, RY0 + r * RGAP, { fs: 54, align: 'r', t0: lerp(tL0, tL1, r / 4) - 0.1 }); });
  const grid = (bx, tGrey, dur, list, ta, tb) => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {
      const a = tGrey + (r * 20 + c) / 100 * dur;
      G.bar(bx + c * PW, RY0 + r * RGAP, TW, TH, { t0: a, d: 0.08, color: '#dedede', ease: linear, r: 3 });
      if (c < list[r]) { const idx = list.slice(0, r).reduce((x, y) => x + y, 0) + c, n_ = list.reduce((x, y) => x + y, 0); G.bar(bx + c * PW, RY0 + r * RGAP, TW, TH, { t0: lerp(ta, tb, idx / Math.max(1, n_ - 1)), d: 0.08, color: INK, ease: linear, r: 3 }); }
    }
  };
  grid(Bx[0], tL0, tL1 - tL0, D1, b13a, b13b); grid(Bx[1], b2a - 0.6, 0.55, D2, b2a, b2b);
  G.count(Bx[0] + 380, -420, { from: 0, to: 100, t0: T('b12', '一百道') - 0.25, t1: T('b12', '一百道') + 0.55, fs: 130, cls: 'b', align: 'c', suffix: ' 道乘法', off: off(T('b13') - 0.2) });
  G.text('只报答案', Bx[0], -320, { fs: 72, t0: T('b13') - 0.1 });
  G.count(Bx[0] + 760, -320, { from: 0, to: 39, t0: b13a, t1: b13b, fs: 118, cls: 'b', align: 'r', suffix: ' 道' });
  G.text('先写过程', Bx[1], -320, { fs: 72, t0: b2a - 0.5 });
  G.count(Bx[1] + 760, -320, { from: 0, to: 99, t0: b2a, t1: b2b, fs: 118, cls: 'b', align: 'r', suffix: ' 道' });
  for (let i = 0; i < 10; i++) { sfx('key', lerp(b13a, b13b, i / 9), { g: 0.08 }); sfx('key', lerp(b2a, b2b, i / 9), { g: 0.08 }); }
  const tNone = T('b13', '一道没对') - 0.2;
  G.rect(Bx[0] - 12, RY0 + 3 * RGAP - 44, Bx[0] + 772, RY0 + 4 * RGAP + 44, { t0: tNone, d: 0.55, color: RED, w: 7, off: off(T('b13b') - 0.5) });
  G.text('一道没对', Bx[0] + 380, RY0 + 5 * RGAP + 10, { fs: 74, cls: 'e', align: 'c', t0: tNone + 0.3, off: off(T('b13b') - 0.5) });
  sfx('chime', b2b, { g: 0.14 });

  // ── 写点别的：一串点 ──
  const tH0 = T('b9') - 0.75;
  const Q = W.sheet({ in: [tH0, 't', 1.0], out: [T('b11') - 0.7, 'l', 1.0] });
  Q.text('多写点别的，行不行？', 0, 0, { fs: 138, cls: 'b', align: 'c', t0: T('b9') - 0.05, off: off(T('b9b') - 0.2, 0.35) });
  const LX0 = -620, LX1 = 620, tAl = T('b9b', '谷歌') - 0.1, tDot = T('b9b', '一串点') - 0.1, tSame = T('b9b', '一样长') - 0.15;
  Q.text('谷歌，2022', 0, -360, { fs: 64, cls: 'g', align: 'c', t0: tAl });
  Q.text('解题算式', LX0 + 24, -220, { fs: 64, cls: 'g', t0: tAl + 0.1 });
  Q.tok('算式', { keys: [[tAl + 0.1, 2000, -120, 0], [tAl + 0.75, 0, -120, 0]], t0: tAl + 0.1, w: LX1 - LX0, d: 90, h: 16, fs: 60 });
  Q.text('一串点', LX0 + 24, 40, { fs: 64, cls: 'g', t0: tDot });
  const DN = 46;
  for (let i = 0; i < DN; i++) { const x = lerp(LX0 + 12, LX1 - 12, i / (DN - 1)), ta = lerp(tDot, tSame - 0.1, i / (DN - 1)); Q.bar(x - 11, 136, 22, 22, { t0: ta, d: 0.1, color: INK, ease: linear, r: 11 }); }
  for (let i = 0; i < 12; i++) sfx('key', lerp(tDot, tSame, i / 11), { g: 0.07 });
  [LX0, LX1].forEach((x, i) => Q.line([[x, -180], [x, 180]], { t0: tSame + i * 0.12, d: 0.35, color: RED, dash: '14 12', w: 5 }));
  Q.line([[LX0, 208], [LX1, 208]], { t0: tSame + 0.25, d: 0.5, color: RED, w: 5 });
  Q.text('一样长', 0, 262, { fs: 70, cls: 'e', align: 'c', t0: tSame + 0.35, off: off(T('b10') - 0.2) });
  const tEq = T('b10') + 0.05;
  Q.bar(LX0, 300, 760, 54, { t0: tEq + 0.1, d: 0.8, color: '#9b9b9b' });
  Q.bar(LX0, 380, 770, 54, { t0: tEq + 0.1, d: 0.8, color: INK });
  Q.text('直接回答', LX0 + 800, 300, { fs: 54, cls: 'g', t0: tEq + 0.7 });
  Q.text('先输出一串点', LX0 + 800, 380, { fs: 54, t0: tEq + 0.7 });

  // ── 没东西可接 ──
  const tE = T('b11') - 0.7;
  const E = W.sheet({ in: [tE, 'r', 1.0], out: [T('b14') - 0.8, 't', 1.0] });
  const EX = [-420, 420], EY = -60, ER = 340, EH = 52 * 7;
  const E0 = E.stack(EX[0], EY, { w: ER, d: 190, n: 52, gap: 7, rise: (t) => ramp(t, tE + 0.4, 0.6, ease.out3), fill: (t) => ramp(t, tE + 0.8, 0.9, linear) }); E0.marks(71, 16);
  const E1 = E.stack(EX[1], EY, { w: ER, d: 190, n: 52, gap: 7, rise: (t) => ramp(t, tE + 0.4, 0.6, ease.out3) });
  const tAl2 = T('b11', '全是点') - 0.3, tNo2 = T('b11', '没东西可接') - 0.25;
  E.tok('. . . . . .', { keys: [[tAl2, EX[0], EY + 200, 0], [tNo2 - 0.25, EX[0], EY + 200, 0], [tNo2 + 0.5, EX[1] - 30, EY + 142, 0]], t0: tAl2, w: 420, d: 110, h: 16, fs: 90, off: off(tNo2 + 0.55, 0.2) });
  E.text('写的全是点', EX[0], EY + 330, { fs: 70, align: 'c', t0: tAl2 + 0.1 });
  E.text('没有中间结果', EX[0], EY + 420, { fs: 76, cls: 'b', align: 'c', t0: T('b11', '中间结果') - 0.15 });
  E.text('下一趟没东西可接', EX[1], EY + 330, { fs: 86, cls: 'e', align: 'c', t0: tNo2 + 0.45 });
  E.cross(EX[1], EY + 145, 34, { t0: tNo2 + 0.55 });
  sfx('error', tNo2 + 0.55, { g: 0.14 });

  // ── 把过程挪到答案后面 ──
  const tI = T('b14') - 0.8;
  const I = W.sheet({ in: [tI, 'b', 1.0], out: [T('b16') - 0.8, 'r', 1.0] });
  const tSw = T('b14', '挪到') - 0.1, xP = [-210, 240], xAl = [510, -520];
  I.tok('过程', { keys: [[tSw, xP[0], -240, 0], [tSw + 0.8, xP[1], -240, 0]], t0: tI + 0.7, w: 780, d: 130, h: 26, fs: 96, off: off(T('b15', '答案写下') - 0.25, 0.3) });
  I.tok('答案', { keys: [[tSw, xAl[0], -240, 0], [tSw + 0.4, 150, -240, 280], [tSw + 0.8, xAl[1], -240, 0]], t0: tI + 0.7, w: 300, d: 130, h: 26, fs: 96 });
  sfx('whoosh', tSw, { g: 0.12 }); sfx('pop', tSw + 0.8, { g: 0.22 });
  // 一百道的结果
  const tB14 = T('b14b') - 0.15, BX = -290, BS = 11, Bo = off(T('b15') - 0.15);
  [['只报答案', 39, '#9b9b9b', 'g'], ['先写过程', 99, '#9b9b9b', 'g'], ['过程放在答案后面', 36, INK, 'b']].forEach(([lb_, v, c, cl], j) => {
    const y = 0 + j * 112, ta = j === 2 ? T('b14b', '只对') - 0.15 : tB14 + j * 0.3, d = j === 2 ? 0.9 : 0.55;
    I.text(lb_, BX - 34, y, { fs: j === 2 ? 66 : 58, cls: cl, align: 'r', t0: ta - 0.1, off: Bo });
    I.bar(BX, y, v * BS, 66, { t0: ta, d, color: c, off: Bo });
    I.count(BX + v * BS + 24, y, { from: 0, to: v, t0: ta, t1: ta + d, fs: j === 2 ? 92 : 70, cls: cl, off: Bo });
  });
  // 答案写下的时候，后面的过程还没写
  const tGh = T('b15', '答案写下') - 0.15, tNl = T('b15', '接不上') - 0.25;
  I.rect(xP[1] - 390, -305, xP[1] + 390, -175, { t0: tGh, d: 0.5, color: GRAY, dash: '18 14', w: 5 });
  I.text('还没写', xP[1], -240, { fs: 88, cls: 'g', align: 'c', t0: T('b15', '还没写') - 0.2 });
  I.arrow([[xP[1] - 120, -165], [xP[1] - 120, -40], [xAl[1], -40], [xAl[1], -160]], { t0: tNl - 0.45, d: 0.55, w: 8, color: RED, head: 28 });
  I.cross(-190, -40, 42, { t0: tNl + 0.05 });
  I.text('答案写下时，后面的过程还没写，接不上', 0, 160, { fs: 78, cls: 'e', align: 'c', t0: tNl + 0.2 });
  sfx('error', tNl + 0.05, { g: 0.14 });

  // ── 凑回去 ──
  const tJ0 = T('b16') - 0.8;
  const J = W.sheet({ w: 1800, h: 1100, in: [tJ0, 'r', 1.0], out: [s.end - 0.95, 'l', 0.9] });
  const LY = [-360, -210, -90, 30], TX = -450;
  const tWr = T('b16', '错了的') - 0.2, tBk = T('b16', '凑回') - 0.3, tBa = T('b16', '错数') - 0.05;
  J.text('答案', TX - 30, LY[0], { fs: 78, cls: 'g', align: 'r', t0: tWr });
  J.tok('2394841296', { keys: drop(TX + 310, LY[0], tWr + 0.05, 150, 0.3), t0: tWr + 0.05, w: 620, d: 118, h: 26, fs: 104, tint: [RED, (t) => ramp(t, tBa, 0.1)] });
  J.text('25992 × (92000 + 138)', TX, LY[1], { fs: 78, type: [tWr + 0.5, tBk - 0.8] });
  J.text('= 2391264000 + 3586896', TX, LY[2], { fs: 78, type: [tBk - 0.7, tBk] });
  J.text('=', TX, LY[3], { fs: 78, t0: tBk + 0.05 });
  J.tok('2394841296', { keys: drop(TX + 370, LY[3], tBk + 0.1, 150, 0.3), t0: tBk + 0.1, w: 620, d: 118, h: 26, fs: 104, tint: [RED, (t) => ramp(t, tBa, 0.1)] });
  sfx('pop', tBk + 0.4, { g: 0.22 });
  J.arrow([[TX + 700, LY[3]], [TX + 950, LY[3]], [TX + 950, LY[0]], [TX + 700, LY[0]]], { t0: tBa, d: 0.7, w: 8, color: RED, head: 28 });
  J.text('真正的和是', TX, 180, { fs: 62, cls: 'g', t0: Tend('b16') - 0.25 });
  J.text('2394850896', TX + 320, 180, { fs: 78, t0: Tend('b16') - 0.05 });
  J.text('有点像人的脑补', 0, 330, { fs: 118, cls: 'b', align: 'c', t0: T('b16b') + 0.05, d: 0.5 });
  sfx('error', tBa, { g: 0.12 });

  // ── 镜头 ──
  const stk = (i) => ST[i].box;
  const shPair = fitCam([stk(0), stk(1), D.p(SX(0) - 150, SL + 240), D.p(SX(1) + 180, SL + 250)], { pitch: 38, cz: D.Z + H * 0.3, kmax: 1.18 });
  const shFour = fitCam([stk(0), stk(3), D.p(SX(0) - 150, SL + 230), D.p(SX(3) + 170, SL + 260)], { pitch: 36, cz: D.Z + H * 0.28 });
  const shAll = fitCam([stk(0), stk(NS - 1), D.p(SX(0) - 150, SL + 450), D.p(SX(NS - 1) + 220, SL + 450)], { pitch: 30, cz: D.Z + H * 0.2 });
  const shStack = fitCam([E0.box, E1.box, E.p(EX[0] - 300, EY + 470), E.p(EX[1] + 300, EY + 470)], { pitch: 30, cz: E.Z + EH * 0.25, kmax: 1.1 });
  W.cam([
    [s.start, chap.home(), 0.01],
    [s.start + 1.15, chap.home({ k: 1.07 }), Math.min(2.9, T('b1') - 1.0 - s.start - 1.15), linear],
    [T('b1') - 1.0, Z0.home({ k: 1.0 }), 1.0],
    [tPaper, A.home({ pitch: 18, cy: 20, k: 1.02 }), 1.0],
    [tR, R.home({ pitch: 22, cx: X0 + 340, cy: Y0 + 60, k: 1.5 }), 1.0],
    [t4a + 0.8, R.home({ pitch: 12, cy: 10, k: 0.86 }), Math.max(1.6, t4b - t4a), smooth],
    [tP, P.home({ pitch: 14, cy: -40, k: 1.0 }), 1.0],
    [T('b5b') - 0.3, P.home({ pitch: 8, cy: 20, k: 1.0 }), 0.9],
    [tD, shPair, 1.1],
    [t8 - 0.5, shFour, 1.4],
    [tB - 0.1, shAll, Math.max(2.4, tBe - 0.55 - tB), smooth],
    [tG, G.home({ cx: -280, pitch: 16, cy: -90, k: 1.04 }), 1.1],
    [b2a - 0.75, G.home({ pitch: 14, cy: -30, k: 0.97 }), 1.0],
    [tH0, Q.home({ k: 1.02 }), 1.0],
    [T('b9b') - 0.1, Q.home({ pitch: 14, cy: 0 }), 0.9],
    [tE, shStack, 1.0],
    [tI, I.home({ pitch: 18, cy: -70, k: 1.0 }), 1.0],
    [T('b15') - 0.35, I.home({ pitch: 12, cy: -40, k: 1.05 }), 0.9],
    [tJ0, J.home({ pitch: 12, cy: -60, k: 1.0 }), 1.0],
    [T('b16b') - 0.1, J.home({ pitch: 4, cy: 0, k: 0.98 }), 0.9],
  ]);
  [tR, tP, tD, tG, tH0, tE, tI, tJ0, s.end - 0.95].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
});
