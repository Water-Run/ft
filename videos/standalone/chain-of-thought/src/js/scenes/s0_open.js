// 开场：笔在纸上写下一道题。关掉思考模式，只报答案，中间两位错了；同样关着，先写计算过程，算对了。
// 镜头：低头看纸，沿着稿纸往前走，一段一个位置（纸上越往前，时间越往后）。
// 事实：L1、L3 §3（n5-03）；S1（Google Research，2022）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, blankCam(0, 0));
  const off = (a, d = 0.6) => (t) => 1 - ramp(t, a, d);

  // ── 一、只报答案 ──
  const X = -640, FS = 132, QY = 0, AY = 200, CY_ = 372;
  const tCh = T('o1', '乘以'), tEq = T('o1', '等于');
  const q = W.write('25992 × 92138 =', X, QY, { fs: FS, seg: [[5, T('o1') + 0.05, tCh - 0.2], [6, tCh, tEq - 0.2], [1, tEq, tEq]] });
  const qm = W.write('？', q.x1 + 46, QY, { fs: 150, t0: T('o1', '多少'), off: off(T('o3') - 0.3) });
  sfx('tick', T('o1', '多少'), { g: 0.2 });
  // 答案的十个位置：先是十条空线（不知道），估一估只填得出头两位
  const tA = T('o3', '报答案') + 0.1;
  const A = W.write('2394730896', X, AY, { fs: FS, seg: [[3, tA, tA + 0.3], [3, tA + 0.42, tA + 0.72], [3, tA + 0.84, tA + 1.14], [1, tA + 1.26, tA + 1.26]] });
  const estOff = off(T('o3') + 0.2);
  A.chars.forEach((c, i) => W.line(c.x0 + 8, AY + 74, c.x1 - 8, AY + 74, { t0: Tend('o1') + 0.2 + i * 0.13, t1: Tend('o1') + 0.3 + i * 0.13, color: PENCIL, w: 5, off: estOff, amp: 1 }));
  const tE = T('o2', '二十三亿');
  W.write('23', A.chars[0].x0, AY, { fs: FS, cls: 'pencil', seg: [[1, tE - 0.15, tE - 0.15], [1, tE + 0.15, tE + 0.15]], off: estOff });
  const est = W.write('二十三亿多', A.x1 + 50, AY, { fs: 74, cls: 'pencil', t0: tE + 0.45, t1: tE + 1.05, off: estOff });
  // 关掉思考模式
  const lg1 = W.logo(X, QY - 196, 78, (t) => ramp(t, T('o3', 'DeepSeek') - 0.1, 0.5));
  const md1 = W.write('思考模式：关', X + 78 * 780 / 165 + 54, QY - 196, { fs: 66, cls: 'pencil', t0: T('o3', '思考模式') - 0.05, t1: T('o3', '思考模式') + 0.75 });
  sfx('pop', T('o3', 'DeepSeek') - 0.1, { g: 0.2 });
  // 对照：正确的乘积
  const tC = T('o4', '十位数');
  W.under_(A, 0, 9, { t0: tC - 0.25, t1: tC + 0.25, w: 5 });
  const C = W.write('2394850896', X, CY_, { fs: FS, cls: 'pencil', t0: tC + 0.4, t1: tC + 1.1, pen: false });
  const lc = W.write('正确的乘积', C.x1 + 50, CY_, { fs: 66, cls: 'pencil', t0: tC + 0.6, t1: tC + 1.1, pen: false });
  const brk = (a, b, ta) => { const [x0, x1] = C.span(a, b); W.line(x0 + 4, CY_ + 92, x1 - 4, CY_ + 92, { t0: ta - 0.05, t1: ta + 0.4, w: 7 }); W.check((x0 + x1) / 2, CY_ + 150, 36, { t0: ta + 0.5, t1: ta + 0.8 }); };
  brk(0, 3, T('o4', '前四位')); brk(6, 9, T('o4', '后四位'));
  // 错在中间两位：字变红，红笔圈起来（连同下面正确的两位）
  const t5 = T('o5', '中间');
  W.tint(A, 4, 5, RED, (t) => ramp(t, t5 - 0.15, 0.3));
  const [mx0, mx1] = A.span(4, 5);
  W.ring((mx0 + mx1) / 2, (AY + CY_) / 2, (mx1 - mx0) / 2 + 34, 182, { t0: t5 - 0.05, t1: t5 + 0.75, color: RED, w: 7 });
  sfx('error', t5, { g: 0.14 });

  // ── 二、还是关着，先写计算过程 ──
  const RY = -1560, XB = -760, F2 = 76, LH = 118;
  const q2 = W.write('25992 × 92138 =', XB, RY, { fs: 100, t0: T('o6') + 0.3, t1: T('o6') + 1.1 });
  const lg2 = W.logo(XB, RY - 158, 66, (t) => ramp(t, T('o6') - 0.1, 0.5));
  const md2 = W.write('思考模式：关', XB + 66 * 780 / 165 + 46, RY - 158, { fs: 58, cls: 'pencil', t0: T('o6', '还是关着'), t1: T('o6', '还是关着') + 0.75 });
  const steps = ['92138 = 92000 + 138', '25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896', '2,391,264,000 + 3,586,896', '= 2,394,850,896'];
  const t60 = T('o6', '提问里') - 0.05, t61 = T('o7') + 0.2, tot = steps.reduce((a, l) => a + l.length, 0); let acc = 0;
  const ST = steps.map((l, i) => { const a = lerp(t60, t61, acc / tot); acc += l.length; const b = lerp(t60, t61, acc / tot) - 0.08; return W.write(l, XB, RY + 150 + i * LH, { fs: F2, t0: a, t1: b }); });
  const ans2 = W.write('答案：2394850896', XB, RY + 150 + 5 * LH + 26, { fs: 104, cls: 'bold', t0: T('o7', '这回') + 0.25, t1: T('o7', '对') });
  W.check(ans2.x1 + 70, ans2.y, 56, { t0: T('o7', '对') + 0.1, t1: T('o7', '对') + 0.45, w: 9 });
  sfx('chime', T('o7', '对') + 0.1, { g: 0.22 });

  // ── 三、并排对照：同一个模型，同一道题；差别只在答案之前 ──
  const KY = -3300, R1 = KY - 110, R2 = KY + 100, BH = 80, C1 = [-560, -280], C2 = [-240, 500], C3 = [540, 860];
  const k0 = T('o11') - 0.2;
  const lg3 = W.logo(-200, KY - 330, 74, (t) => ramp(t, T('o11', '模型') - 0.3, 0.5));
  const cell = (r, c, txt, t0, cls) => { W.box(c[0], r - BH, c[1], r + BH, { t0, t1: t0 + 0.32, w: 4.5 }); return W.write(txt, (c[0] + c[1]) / 2, r, { fs: 66, align: 'c', cls, t0: t0 + 0.36, t1: t0 + 0.56 }); };
  const lab1 = W.write('只报答案', C1[0] - 46, R1, { fs: 76, align: 'r', t0: k0, t1: k0 + 0.35 });
  cell(R1, C1, '题目', k0 + 0.3); cell(R1, C3, '答案', k0 + 0.95, 'red');
  const lab2 = W.write('先写过程', C1[0] - 46, R2, { fs: 76, align: 'r', t0: k0 + 1.6, t1: k0 + 1.95 });
  cell(R2, C1, '题目', k0 + 1.9); cell(R2, C2, '过程（三百多块）', k0 + 2.45); cell(R2, C3, '答案', k0 + 3.1);
  W.check(C3[1] + 58, R2, 46, { t0: k0 + 3.75, t1: k0 + 4.05 });
  const tN = T('o11b', '有没有');
  W.hatch(C2[0] + 10, R2 - BH + 10, C2[1] - 10, R2 + BH - 10, { t0: T('o11b', '答案之前') - 0.1, t1: T('o11b', '答案之前') + 0.9, gap: 22, w: 15, op: 0.3 });
  W.box(C2[0], R1 - BH, C2[1], R1 + BH, { t0: tN - 0.1, t1: tN + 0.45, color: PENCIL, w: 3.5 });
  W.write('没写过程', (C2[0] + C2[1]) / 2, R1, { fs: 62, cls: 'pencil', align: 'c', t0: tN + 0.5, t1: tN + 0.9 });
  // 这种做法叫思维链
  const KX = -560, GY = R2 + 230;
  const tG = T('o12', '思维链');
  W.line(C2[0] + 20, R2 + BH + 12, C2[1] - 20, R2 + BH + 12, { t0: T('o12', '推理') - 0.2, t1: T('o12', '推理') + 0.3, w: 7 });
  W.line(C3[0] + 16, R2 + BH + 12, C3[1] - 16, R2 + BH + 12, { t0: T('o12', '再给答案') - 0.15, t1: T('o12', '再给答案') + 0.3, w: 7 });
  const g1 = W.write('思维链', KX, GY, { fs: 132, cls: 'bold', t0: tG - 0.1, t1: tG + 0.6 });
  g1.el.dataset.gloss = '思维链';
  const g1b = W.write('先写推理，再给答案', g1.x1 + 48, GY + 10, { fs: 70, cls: 'pencil', t0: tG + 0.65, t1: tG + 1.2 });
  const g2 = W.write('Chain of Thought · CoT', KX, GY + 146, { fs: 80, t0: T('o13', 'Chain') - 0.1, t1: T('o13', 'Chain') + 1.5 });
  const g3 = W.write('Google Research，2022 年 1 月', KX, GY + 250, { fs: 62, cls: 'pencil', t0: T('o13b', '谷歌'), t1: T('o13b', '谷歌') + 1.2 });

  // ── 四、问题：多写几行字，为什么就算对了？得先看它是怎么一块一块往下写的 ──
  const DY = -5000;
  const dq = W.write('多写几行字，为什么就算对了？', 0, DY, { fs: 118, align: 'c', cls: 'bold', t0: T('o14') + 0.05, t1: Tend('o14') - 0.05 });
  const A4 = W.write('239 473 089 6', 0, DY + 230, { fs: 120, align: 'c', t0: T('o16') + 0.1, t1: T('o16') + 1.0, cls: 'pencil' });
  const tB = T('o16', '一块一块');
  [[0, 2], [4, 6], [8, 10], [12, 12]].forEach(([a, b], i) => { const [x0, x1] = A4.span(a, b); W.box(x0 - 8, DY + 230 - 88, x1 + 8, DY + 230 + 88, { t0: tB + i * 0.34, t1: tB + 0.26 + i * 0.34, w: 5.5 }); sfx('tick', tB + i * 0.34, { g: 0.16 }); });

  // ── 片名 ──
  const TY = -6700, tT = T('oT') + 0.1;
  const tt1 = W.write('CoT', 0, TY - 90, { fs: 320, align: 'c', cls: 'bold', t0: tT, t1: tT + 0.7 });
  const tt2 = W.write('先思考，再回答', 0, TY + 170, { fs: 112, align: 'c', t0: tT + 0.85, t1: tT + 1.8 });

  // ── 镜头：低头看纸，一段一个位置，沿着纸往前走 ──
  const shA = fitCam(W, [q, qm, A, C, lc, est, md1, lg1, [X, CY_ + 180, 0]], { pitch: 32 });
  const shB = fitCam(W, [q2, lg2, md2, ...ST, ans2, [ans2.x1 + 130, ans2.y, 0]], { pitch: 30 });
  const shC = fitCam(W, [lab1, lab2, lg3, g1, g1b, g2, g3, [C3[1] + 110, R1 - BH, 0], [C3[1] + 110, R2 + BH, 0]], { pitch: 28 });
  const shD = fitCam(W, [dq, A4, [0, DY + 340, 0]], { pitch: 26 });
  const shE = fitCam(W, [tt1, tt2], { pitch: 22, kmax: 1.1, safe: { l: 300, r: 1620, t: 170, b: 900 } });
  W.cam([
    [0, shA, 0.01],
    [T('o6') - 0.8, shB, 2.0],
    [T('o11') - 0.9, shC, 2.0],
    [T('o14') - 0.9, shD, 2.0],
    [T('oT') - 0.9, shE, 2.0],
    [s.end - 1.0, blankCam(0, -7680), 1.35],
  ]);
  [T('o6') - 0.8, T('o11') - 0.9, T('o14') - 0.9, T('oT') - 0.9].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
  sfx('chime', tT + 0.7, { g: 0.2 });
});
