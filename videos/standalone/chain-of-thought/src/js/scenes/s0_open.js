// 开场。一道题落在纸上，十个问号等着答案；关掉思考模式，只报答案，中间两位错了。
// 另一张纸插进来：同样关着，先写计算过程，一块块写下去，算对了。两张并排对照；「思维链」是一张标题页；最后抛出问题。
// 镜头：斜着看纸上的方块；对答案时推近到错的两位；第二张纸跟着写下去的行往下移；对照时拉远。
// 事实：L1、L3 §3（n5-03）；S1（Google Research，2022）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const pulse = (ta, a = 34, d = 0.38) => (t) => a * Math.sin(Math.PI * clamp((t - ta) / d));
  const drop = (x, y, t, z = 220, d = 0.42) => [[t, x, y, z], [t + d * 1.4, x, y, 0]];

  // ── 一、只报答案 ──
  const S1 = W.sheet({ out: [T('o6') - 0.6, 'l', 1.0] });
  const EY = -290, RY = -60, CY_ = 130, DX = 136, X0 = -612;
  const tCh = T('o1', '乘以'), tEq = T('o1', '等于');
  const eqOff = (t) => 1 - ramp(t, T('o5') - 0.55, 0.4);
  const q1 = S1.tok('25992', { keys: drop(-560, EY, T('o1') + 0.05), t0: T('o1') + 0.05, off: eqOff, w: 400, d: 140, h: 30, fs: 104 });
  const qx = S1.text('×', -300, EY, { fs: 92, align: 'c', t0: tCh - 0.1, off: eqOff });
  const q2 = S1.tok('92138', { keys: drop(-40, EY, tCh + 0.1), t0: tCh + 0.1, off: eqOff, w: 400, d: 140, h: 30, fs: 104 });
  const qe = S1.text('=', 230, EY, { fs: 92, align: 'c', t0: tEq, off: eqOff });
  const ANS = '2394730896', OK = '2394850896';
  const xs = [...Array(10)].map((_, i) => X0 + i * DX);
  const tA = T('o3', '报答案') + 0.05, chunkT = (i) => tA + [0, 0, 0, 0.42, 0.42, 0.42, 0.84, 0.84, 0.84, 1.26][i];
  const tEst = T('o2', '二十三亿');
  const CU = xs.map((x, i) => {
    const ta = tEq + 0.45 + i * 0.09;
    const swaps = []; if (i < 2) swaps.push([tEst + (i ? 0.25 : 0), '23'[i]]); swaps.push([chunkT(i), ANS[i]]);
    return S1.tok('?', { keys: drop(x, RY, ta, 180, 0.34), t0: ta, w: 120, d: 124, h: 22, fs: 84, swap: swaps,
      bump: (t) => pulse(i < 2 ? tEst + (i ? 0.25 : 0) : 1e9)(t) + pulse(chunkT(i))(t) + (i === 4 || i === 5 ? 10 * Math.sin((t - T('o5')) * 26) * win(t, T('o5') - 0.05, T('o5') + 0.5, 0.1) : 0),
      tint: [RED, (t) => (i === 4 || i === 5 ? ramp(t, T('o5', '中间') - 0.1, 0.5) : 0)] });
  });
  sfx('pop', T('o1') + 0.05, { g: 0.2 }); sfx('pop', tCh + 0.1, { g: 0.2 }); xs.forEach((_, i) => sfx('key', tEq + 0.45 + i * 0.09, { g: 0.14 }));
  const est = S1.text('估一估：', -40, CY_ + 20, { fs: 84, align: 'r', cls: 'g', t0: T('o2') + 1.0, off: (t) => 1 - ramp(t, T('o3') + 0.1, 0.4) });
  S1.text('二十三亿多', -30, CY_ + 20, { fs: 84, cls: 'g', t0: tEst + 0.4, off: (t) => 1 - ramp(t, T('o3') + 0.1, 0.4) });
  // 关掉思考模式
  const lg1 = S1.logo(-700, -440, 66, (t) => ramp(t, T('o3', 'DeepSeek') - 0.1, 0.4));
  const tgl = S1.text('思考模式', lg1.x1 + 60, -440, { fs: 60, t0: T('o3', '思考模式') - 0.1 });
  const sw1 = S1.toggle(tgl.x1 + 36, -440, { t0: T('o3', '思考模式') - 0.1, on: (t) => 1 - ramp(t, T('o3', '思考模式') + 0.35, 0.35) });
  const tOff = S1.text('关', tgl.x1 + 186, -440, { fs: 60, cls: 'b', t0: T('o3', '思考模式') + 0.5 });
  sfx('tick', T('o3', '思考模式') + 0.35, { g: 0.2 });
  // 正确的乘积：一条纸带从右边滑进来，对齐每一位
  const tC = T('o4', '十位数') + 0.15;
  OK.split('').forEach((c, i) => S1.tok(`<span style="color:#666b72">${c}</span>`, { keys: [[tC + i * 0.04, xs[i] + 1700, CY_, 0], [tC + 0.55 + i * 0.04, xs[i], CY_, 0]], t0: tC + i * 0.04, w: 120, d: 112, h: 8, fs: 78, cls: 'dim' }));
  const lc = S1.text('正确的乘积', xs[0] - 60, CY_ + 104, { fs: 60, cls: 'g', t0: tC + 0.9 });
  sfx('whoosh', tC, { g: 0.14 });
  S1.cursor(xs[9] + 76, RY, 96, { t0: chunkT(9) + 0.3, off: (t) => 1 - ramp(t, T('o4') + 0.2, 0.2) });
  const tick = (i, ta) => { S1.check(xs[i], RY - 112, 34, { t0: ta, d: 0.22 }); sfx('tick', ta, { g: 0.12 }); };
  const t4a = T('o4', '前四位'), t4b = T('o4', '后四位');
  [0, 1, 2, 3].forEach((i) => tick(i, t4a + 0.05 + i * 0.12));
  [6, 7, 8, 9].forEach((i, j) => tick(i, t4b + 0.05 + j * 0.12));
  // 错在中间两位
  const t5 = T('o5', '中间');
  const ring5 = S1.rect(xs[4] - 76, RY - 92, xs[5] + 76, CY_ + 88, { t0: t5, d: 0.7, color: RED, w: 5 });
  sfx('error', t5, { g: 0.14 });

  // ── 二、另一张纸：还是关着，先写计算过程 ──
  const S2 = W.sheet({ in: [T('o6') - 0.6, 'r', 1.0], out: [T('o11') - 0.8, 'l', 1.0] });
  const lg2 = S2.logo(-760, -430, 60, (t) => ramp(t, T('o6') - 0.2, 0.3));
  const tg2 = S2.text('思考模式', lg2.x1 + 56, -430, { fs: 56, t0: T('o6') + 0.2 });
  S2.toggle(tg2.x1 + 34, -430, { t0: T('o6') + 0.2, on: () => 0 });
  S2.text('还是关着', tg2.x1 + 182, -430, { fs: 56, cls: 'b', t0: T('o6', '还是关着') });
  const q3 = S2.text('25992 × 92138 =', -760, -310, { fs: 92, t0: T('o6') + 0.5 });
  // 过程：一块一块落在纸上，一行行往下写
  const LINES = [['92138', '=', '92000', '+', '138'], ['25992', '×', '92000', '=', '2,391', ',264', ',000'], ['25992', '×', '138', '=', '3,586', ',896'], ['2,391', ',264', ',000', '+', '3,586', ',896'], ['=', '2,394', ',850', ',896']];
  const FS = 62, chipW = (s_) => Math.max(68, s_.length * FS * 0.58 + 34);
  const tP0 = T('o6', '提问里') - 0.1, tP1 = T('o7') + 0.15, tot = LINES.reduce((a, l) => a + l.length, 0);
  let n_ = 0; const LY = (i) => -200 + i * 112, chips = [];
  LINES.forEach((ln, i) => { let x = -760; ln.forEach((c) => { const w = chipW(c), ta = lerp(tP0, tP1, n_ / tot); n_ += 1; chips.push(S2.tok(c, { keys: drop(x + w / 2, LY(i), ta, 90, 0.2), t0: ta, w, d: 88, h: 12, fs: FS, cls: 'soft' })); if (n_ % 3 === 0) sfx('key', ta, { g: 0.12 }); x += w + 12; }); });
  const tAns = T('o7', '这回') + 0.25;
  const a0 = S2.text('答案', -760, LY(5) + 44, { fs: 92, cls: 'b', t0: tAns - 0.2 });
  const ansX = a0.x1 + 90;
  ['239', '485', '089', '6'].forEach((c, i) => { const w = c.length * 74 + 34, x = ansX + [0, 256, 512, 768][i] - 70; S2.tok(c, { keys: drop(x + w / 2, LY(5) + 44, tAns + i * 0.16, 120, 0.26), t0: tAns + i * 0.16, w: Math.max(100, w), d: 112, h: 20, fs: 92 }); sfx('pop', tAns + i * 0.16, { g: 0.16 }); });
  const ck2 = S2.check(ansX + 950, LY(5) + 44, 72, { t0: T('o7', '对') + 0.1, d: 0.4, w: 12 });
  sfx('chime', T('o7', '对') + 0.1, { g: 0.22 });

  // ── 三、对照：同一个模型，同一道题；差别只在答案之前 ──
  const S3 = W.sheet({ in: [T('o11') - 0.8, 'r', 1.0], out: [T('o12', '思维链') - 1.0, 'l', 0.95] });
  const R1 = -150, R2 = 110, BH = 96, QW = 300, GAPW = 760, AW = 320, LX = -760, C2X = LX + QW + 30;
  const k0 = T('o11') + 0.15;
  const lg3 = S3.logo(-170, -400, 80, (t) => ramp(t, T('o11') - 0.05, 0.4));
  S3.text('只报答案', -640 - 200, R1 - 138, { fs: 66, cls: 'g', t0: k0 });
  S3.text('先写过程', -640 - 200, R2 + 126, { fs: 66, cls: 'g', t0: k0 + 0.55 });
  const cell = (txt, x, y, w, ta, cls) => S3.tok(txt, { keys: drop(x + w / 2, y, ta, 130, 0.3), t0: ta, w, d: BH * 2, h: 24, fs: 68, cls });
  cell('题目', LX, R1, QW, k0 + 0.1); cell('答案', C2X + GAPW + 30, R1, AW, k0 + 0.3, 'err');
  cell('题目', LX, R2, QW, k0 + 0.65);
  // 过程：很多小块从左往右铺满
  const NT = 22; for (let i = 0; i < NT; i++) { const w = (GAPW - (NT - 1) * 6) / NT, ta = k0 + 0.95 + i * 0.04; S3.tok('', { keys: drop(C2X + i * (w + 6) + w / 2, R2, ta, 80, 0.18), t0: ta, w, d: BH * 2 - 30, h: 12, cls: 'cube' }); }
  cell('答案', C2X + GAPW + 30, R2, AW, k0 + 1.95);
  S3.check(C2X + GAPW + 30 + AW + 58, R2, 44, { t0: k0 + 2.3, d: 0.28, w: 8 });
  const tBf = T('o11b', '答案之前');
  S3.hl(C2X - 12, R1 - BH - 18, C2X + GAPW + 12, R2 + BH + 18, { t0: tBf - 0.1, d: 0.4, color: '#e6e9ed', off: (t) => 1 - ramp(t, T('o12') + 0.25, 0.6) });
  const tN = T('o11b', '有没有');
  S3.rect(C2X, R1 - BH, C2X + GAPW, R1 + BH, { t0: tN - 0.1, d: 0.5, color: GRAY, dash: '16 12', w: 4 });
  S3.text('这里什么都没写', C2X + GAPW / 2, R1, { fs: 62, cls: 'g', align: 'c', t0: tN + 0.3 });
  S3.bar(C2X, R2 + BH + 34, GAPW, 18, { t0: T('o12', '推理') - 0.1, d: 0.9, color: INK, ease: linear, r: 0 });
  S3.text('先写推理', C2X + GAPW / 2, R2 + BH + 82, { fs: 52, cls: 'b', align: 'c', t0: T('o12', '推理') - 0.1 });
  S3.text('差别只在这里', C2X + GAPW / 2, (R1 + R2) / 2, { fs: 46, cls: 'b', align: 'c', t0: T('o11b') + 0.4 });
  sfx('tick', tN, { g: 0.2 });

  // ── 思维链、问题、片名：同一张纸上依次淡入淡出，不换页 ──
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, Math.max(d, 0.4));
  const tG = T('o12', '思维链'), defOff = off(T('o14') - 0.55, 0.6), qOff = off(T('oT') - 0.45, 0.6);
  const S4 = W.sheet({ in: [tG - 1.0, 'r', 1.0], out: [s.end - 0.95, 'l', 0.9], w: 1500, h: 860 });
  const g1 = S4.text('思维链', 0, -130, { fs: 150, cls: 'ti', align: 'c', t0: tG - 0.1, d: 0.5, off: defOff });
  g1.el.dataset.gloss = '思维链';
  S4.text('先写推理，', -324, 50, { fs: 72, cls: 'g', t0: tG + 0.35, off: defOff });
  S4.text('再给答案', 36, 50, { fs: 72, cls: 'g', t0: tG + 0.85, off: defOff });
  S4.line([[-160, 136], [160, 136]], { t0: tG + 0.5, d: 0.5, w: 3, off: defOff });
  S4.text('英文', -600, 214, { fs: 56, cls: 'g', t0: T('o13') - 0.1, off: defOff });
  S4.text('Chain of Thought', -60, 214, { fs: 84, align: 'c', t0: T('o13', 'Chain') - 0.1, off: defOff });
  S4.tok('CoT', { keys: drop(520, 214, Tend('o13') - 0.55, 180, 0.34), t0: Tend('o13') - 0.55, w: 220, d: 110, h: 22, fs: 76, off: defOff });
  S4.text('Google Research，2022 年 1 月', 0, 320, { fs: 60, cls: 'g', align: 'c', t0: T('o13b', '谷歌') - 0.1, off: defOff });
  sfx('whoosh', tG - 1.0, { g: 0.14 }); sfx('tick', tG, { g: 0.2 });
  // 问题
  S4.text('多写几行字，为什么就算对了？', 0, -190, { fs: 108, cls: 'b', align: 'c', t0: T('o14') + 0.15, d: 0.6, off: qOff });
  S4.text('25992 × 92138', 0, -310, { fs: 60, cls: 'g', align: 'c', t0: Tend('o14') + 0.35, off: qOff });
  S4.text('先看它是怎么一块一块往下写的', 0, -50, { fs: 62, cls: 'g', align: 'c', t0: T('o16') + 0.05, off: qOff });
  const tB = T('o16', '一块一块');
  ['239', '473', '089', '6'].forEach((c, i) => { S4.tok(c, { keys: drop(-510 + i * 340, 150, tB + i * 0.34, 170, 0.32), t0: tB + i * 0.34, w: 290, d: 170, h: 30, fs: 118, cls: i === 1 ? 'err' : '', off: qOff }); sfx('pop', tB + i * 0.34, { g: 0.18 }); });
  // 片名：同一张纸上淡出来
  S4.text('CoT', 0, -130, { fs: 280, cls: 'lt', align: 'c', t0: T('oT') + 0.1, d: 0.7 });
  S4.line([[-66, 62], [66, 62]], { t0: T('oT') + 0.4, d: 0.5, w: 2 });
  S4.text('先思考，再回答', 0, 170, { fs: 96, cls: 'ti', align: 'c', t0: T('oT') + 0.6, d: 0.7 });

  // ── 正在讲的区域亮起 ──
  S1.wash(-820, EY - 120, 340, EY + 120, tCh - 0.3, tEq + 0.5);
  S1.wash(xs[0] - 110, RY - 110, xs[9] + 110, RY + 110, T('o2') + 0.2, T('o2') + 2.0);
  S1.wash(xs[0] - 110, CY_ - 90, xs[9] + 110, CY_ + 130, tEst - 0.2, T('o3') - 0.1);
  S4.wash(-700, 120, 700, 400, T('o13', 'Chain') - 0.3, T('o13b', '谷歌') - 0.2);
  S3.wash(LX - 30, R2 - BH - 30, C2X + GAPW + AW + 70, R2 + BH + 30, T('o11b', '有没有') - 0.1, T('o12') + 0.3);
  S4.wash(-720, -370, 720, -90, T('o14') + 1.2, T('o16', '一块一块') - 0.3);

  // ── 镜头 ──
  W.cam([
    [0, S1.home({ cy: -110 }), 0.01],
    // 强调：错的就是这两位，慢慢推近
    [T('o5') - 0.3, S1.home({ cy: -20, k: 1.1 }), 1.6, smooth],
    [T('o6') - 0.6, S2.home({ cy: 30, k: 0.94 }), 1.25, smooth],
    [T('o11') - 0.8, S3.home({ k: 0.96 }), 1.25, smooth],
    [T('o12', '思维链') - 1.0, S4.home({ cy: 20 }), 1.25, smooth],
    [s.end - 0.95, HOME, 0.9, smooth],
  ]);
  [T('o6') - 0.6, T('o11') - 0.8, T('o14') - 0.85, T('oT') - 0.75].forEach((a) => sfx('whoosh', a, { g: 0.15 }));
  sfx('chime', T('oT') + 0.5, { g: 0.2 });
});
