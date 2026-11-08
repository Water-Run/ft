// 01 一块字的工夫。主画面：写每一块字之前立起一摞纸（一片一层，96 层）。墨从底下一层层往上染，染到顶，这一块字才定下来——这是一趟。
// 这一趟里算出的中间结果（纸垛里亮起的短线）只往上走；一趟结束就没了，下一趟看不到；只有写到纸上的字，下一趟才读得到。
// 镜头：先低头看纸上的四块字；抬起来看一摞纸的高度；退开看四摞；纸垛收回纸里，往前走，低头看乘积的每一位。
// 事实：L3 §3（239|473|089|6）；S3 §3；S4（GPT-3 96 层）；S7；乘积各位的算术见 FACTS a12–a13c。片中不断言模型内部算的具体数字，纸垛里的短线只表示「中间结果」。
scene('pass', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, blankCam(0, 92 + TILE));
  chapterHead(W, s, '01', '一块字的工夫', 1, T('a1') - 0.2);
  const off = (a, d = 0.6) => (t) => 1 - ramp(t, a, d);

  const XS = [-510, -170, 170, 510], SY = -250, RW = 300, RD = 190;   // 四块字的位置；纸垛立在字的后面
  const BH = 92, EQY = 196;
  const ANS = ['239', '473', '089', '6'];
  const t1 = T('a1', '一小块');

  // ── 题目（一直在）──
  const eq = W.write('25992 × 92138 =', XS[0], EQY, { fs: 92, align: 'c', t0: T('a1') - 0.2, t1: T('a1') + 0.55, off: off(T('a12') - 0.9) });

  // ── 回顾：它写了四块 ──
  const recapOff = off(T('a3') - 0.5);
  const tR = [t1 - 0.05, T('a2', '三位三位') - 0.1, T('a2', '三位三位') + 0.5, T('a2', '四块') - 0.35];
  ANS.forEach((a, i) => {
    W.box(XS[i] - 118, -BH, XS[i] + 118, BH, { t0: tR[i] + 0.34, t1: tR[i] + 0.62, w: 4.5, off: recapOff });
    const R = W.write(a, XS[i], 0, { fs: 112, align: 'c', t0: tR[i], t1: tR[i] + 0.3, off: recapOff });
    if (i === 1) W.tint(R, 1, 2, RED, (t) => ramp(t, T('a2', '错答案') - 0.2, 0.4));
    sfx('tick', tR[i] + 0.34, { g: 0.14 });
  });
  const gl = W.write('token', -60, EQY - 6, { fs: 100, cls: 'bold', t0: T('a1', 'token') - 0.1, t1: T('a1', 'token') + 0.4, off: recapOff });
  gl.el.dataset.gloss = 'token';
  const glD = W.write('模型一次写出的一小块', gl.x0, EQY + 116, { fs: 62, cls: 'pencil', t0: T('a1', 'token') + 0.45, t1: T('a1', 'token') + 1.1, off: recapOff });

  // ── 四摞纸 ──
  const passes = (list) => (t) => list.reduce((v, [a, b, dr]) => Math.max(v, ramp(t, a, b - a, linear) * (1 - ramp(t, dr, 0.8))), 0);
  const sink = (t) => 1 - ramp(t, T('a12') - 0.95, 0.75);
  const tA8 = T('a8'), tP = T('a8', '标点'), tJ = T('a8', '几位'), tB = T('a8b') + 0.15;
  const tTop = T('a5b', '最顶上') + 0.2, tDrain = T('a9') - 0.55;
  const t9a = T('a9') + 0.05, t9b = T('a9', '往上') + 0.25, tLost = T('a10', '接着用') + 0.2;
  const t11b = T('a11b', '自己那一趟');
  const wr = T('a10b', '写成字') + 0.75, wrEnd = T('a11') - 0.35;
  const fillL = [
    [[T('a4', '最底下'), tTop, tDrain], [t9a, t9b, tLost], [t11b - 0.1, t11b + 0.5, T('a12') - 1.3]],
    [[tA8 + 0.35, tP - 0.05, tDrain], [wr, wrEnd, T('a11') - 0.1], [t11b + 0.15, t11b + 0.75, T('a12') - 1.3]],
    [[tP + 0.55, tJ - 0.05, tDrain], [t11b + 0.4, t11b + 1.0, T('a12') - 1.3]],
    [[tJ + 0.55, tB, tDrain], [t11b + 0.65, t11b + 1.25, T('a12') - 1.3]],
  ];
  const up0 = [T('a3') + 0.05, tA8 - 0.2, tP - 0.25, tJ - 0.25];
  const ST = XS.map((x, i) => {
    const fill = passes(fillL[i]);
    const S = stack(W, x, SY, { w: RW, d: RD, n: 96, gap: 7, rise: (t) => ramp(t, up0[i], i ? 0.8 : 1.7, ease.io3) * sink(t), fill });
    const r_ = seeded(40 + i);   // 中间结果：这一趟算出来的零散笔迹，算到哪层亮到哪层，一趟结束随墨退去
    for (let j = 0; j < 22; j++) { const fr = 0.06 + r_() * 0.88, wd = 14 + r_() * 58, lf = 14 + r_() * (RW - wd - 28); S.note(`<i style="width:${wd.toFixed(0)}px;margin-left:${lf.toFixed(0)}px"></i>`, fr, (t) => clamp((fill(t) - fr) * 26)); }
    return S;
  });
  const H = ST[0].H, S0 = ST[0], x0 = XS[0], xR = x0 + RW / 2 + 42;
  sfx('riser', T('a3') + 0.05, { g: 0.12 });

  // 「每一片，代表一层」：抽出一片
  const LZ = 48 * 7, pl = h('div', 'plate2', W.stage); css(pl, { left: -RW / 2 + 'px', top: -RD / 2 + 'px', width: RW + 'px', height: RD + 'px' });
  const tPl = T('a3b', '每一片') - 0.2, tPb = T('a4') - 0.15;
  place(W, pl, (t) => { const u = ramp(t, tPl, 0.75, ease.out3) * (1 - ramp(t, tPb, 0.7, ease.io3)); return { x: x0 + u * (RW + 60), y: SY, z: LZ + 1, o: clamp(u * 12) }; });
  const onL = (t) => 1 - ramp(t, tA8 - 0.75, 0.5);
  const lLayer = W.write('一片 ＝ 一层', x0 + RW + 60 - RW / 2, SY + 150, { fs: 124, cls: 'bold', t0: T('a3b', '每一片') + 0.1, t1: T('a3b', '一层') + 0.1, off: (t) => 1 - ramp(t, T('a4', '最底下') - 0.5, 0.5) });

  // 题目读进来：一道箭头，绕开第一块字的位置，到纸垛的底
  W.hatch(eq.x0 - 16, EQY - 62, eq.x1 + 16, EQY + 62, { t0: T('a4', '题目') - 0.1, t1: T('a4', '题目') + 0.75, gap: 20, w: 17, op: 0.5, off: off(T('a5b') - 0.2) });
  const tRd = T('a4', '题目') - 0.2;
  W.arrow([[x0 - 128, EQY - 66], [x0 - 136, 40], [x0 - 128, SY + RD / 2 + 6]], { t0: tRd, t1: tRd + 0.8, w: 6, off: off(T('a5b') - 0.3) });
  // 算到顶：笔把这一块写到纸上
  const tW0 = T('a5b', '写') - 0.05;
  const put = (i, t0_) => {
    W.box(XS[i] - 118, -BH, XS[i] + 118, BH, { t0: t0_, t1: t0_ + 0.22, w: 4.5, off: off(T('a12') - 0.9), pen: i === 0 });
    const R = W.write(ANS[i], XS[i], 0, { fs: 112, align: 'c', t0: t0_ + 0.24, t1: t0_ + 0.5, off: off(T('a12') - 0.9), pen: i === 0 || i === 3 });
    if (i === 1) W.tint(R, 1, 2, RED, (t) => ramp(t, t0_ + 0.3, 0.3));
    sfx('pop', t0_ + 0.24, { g: 0.2 });
  };
  put(0, tW0); put(1, tP - 0.02); put(2, tJ - 0.02); put(3, tB + 0.02);

  // 「一趟」与「96 层」
  const a6 = T('a6', '一趟') - 0.5;
  vbar(W, xR - 14, SY + RD / 2, 0, H, { w: 6, draw: (t) => ramp(t, T('a6', '从底到顶') - 0.1, 1.2, ease.io3), op: onL });
  const lUp = W.write('从底到顶', xR + 14, SY - 300, { fs: 112, cls: 'bold', t0: T('a6', '从底到顶') - 0.1, t1: T('a6', '从底到顶') + 0.5, off: onL });
  S0.lid((t) => ramp(t, T('a7', '定了') - 0.35, 0.5) * onL(t));
  const lPass = W.write('一趟', xR + 14, SY - 130, { fs: 150, cls: 'bold', t0: a6 + 0.35, t1: a6 + 0.85, off: onL });
  const lFix = W.write('层数固定', xR + 14, SY + 50, { fs: 98, t0: T('a7', '层数') - 0.05, t1: T('a7', '定了') + 0.1, off: onL });
  const lGpt = W.write('GPT-3：96 层', xR + 14, SY + 210, { fs: 98, t0: T('a7b') + 0.15, t1: T('a7b', '九十六') + 0.4, off: onL });

  // 每一块都只有这一趟
  const each = W.write('不管难易，每一块都只有这一趟', -60, EQY, { fs: 76, cls: 'pencil', t0: T('a8b', '一趟') - 0.35, t1: Tend('a8b') + 0.1, off: off(T('a9') + 0.2) });

  // 只往上走（立在纸垛旁边的箭头）
  const wf = W.wall(SY + RD / 2 + 3);
  const upOff = off(T('a10') - 0.3);
  const xU = x0 - RW / 2 - 40;
  W.stroke([[xU, -10], [xU, -H + 30]], { svg: wf, t0: t9a, t1: t9b, w: 8, pen: false, off: upOff, amp: 2 });
  W.stroke([[xU - 34, -H + 74], [xU, -H + 26], [xU + 34, -H + 74]], { svg: wf, t0: t9b, t1: t9b + 0.2, w: 8, pen: false, off: upOff, amp: 0.6 });
  const onlyUp = W.wallText('只往上走', xU - 30 - 4 * 92, SY + RD / 2 + 3, H * 0.52, 92, (t) => ramp(t, T('a9', '往上') - 0.3, 0.45) * upOff(t), 'bold');

  // 中间结果：下一趟看不到
  const tM = T('a10', '中间结果') - 0.1, tC = T('a10', '接着用') - 0.45, arcOff = off(T('a10b') - 0.25);
  const mL = W.write('中间结果', xU - 30, SY - 40, { fs: 110, align: 'r', cls: 'bold', t0: tM, t1: tM + 0.5, off: off(tLost + 0.1) });
  W.hatch(mL.x0 - 14, SY - 40 - 66, mL.x1 + 14, SY - 40 + 66, { t0: tM - 0.5, t1: tM + 0.3, gap: 20, w: 16, op: 0.5, pen: false, off: off(tLost + 0.1) });
  { const pts = []; for (let i = 0; i <= 30; i++) { const a = -1.7 + i / 30 * 6.283 * 1.05; pts.push([x0 + Math.cos(a) * RW * 0.42, -H * 0.42 + Math.sin(a) * H * 0.3]); } W.stroke(pts, { svg: wf, t0: tM + 0.05, t1: tM + 0.8, w: 10, color: '#f3ecd8', pen: false, amp: 1.2, off: off(tLost + 0.1) }); }
  const X1 = XS[1], arc = []; for (let i = 0; i <= 20; i++) { const u = i / 20; arc.push([lerp(x0 + 60, X1 - 40, u), -(H + 30) + (H + 16) * u * u]); }
  W.stroke(arc, { svg: wf, t0: tC, t1: tC + 0.65, w: 7, color: RED, pen: false, amp: 0.8, off: arcOff });
  const xm = lerp(x0 + 60, X1 - 40, 0.62), zm = (H + 30) - (H + 16) * 0.62 * 0.62, xs = 30;
  W.stroke([[xm - xs, -zm - xs], [xm + xs, -zm + xs]], { svg: wf, t0: tC + 0.65, t1: tC + 0.8, w: 10, color: RED, pen: false, amp: 0.5, off: arcOff });
  W.stroke([[xm + xs, -zm - xs], [xm - xs, -zm + xs]], { svg: wf, t0: tC + 0.82, t1: tC + 0.97, w: 10, color: RED, pen: false, amp: 0.5, off: arcOff });
  const nosee = W.write('下一趟看不到', -60, EQY, { fs: 84, cls: 'red', t0: tC + 0.5, t1: tC + 1.1, off: arcOff });
  sfx('error', tC + 0.65, { g: 0.14 });
  // 写成字，才接得上
  const tZ = T('a10b', '写成字') - 0.3;
  const wOff = off(T('a11') - 0.2);
  const zi = W.write('中间结果，写成字', -60, EQY, { fs: 84, cls: 'bold', t0: tZ, t1: tZ + 0.75, off: wOff });
  W.arrow([[X1 - 20, EQY - 60], [X1 - 146, 40], [X1 - 138, SY + RD / 2 + 6]], { t0: tZ + 0.82, t1: tZ + 1.3, w: 7, off: wOff });
  sfx('tick', tZ, { g: 0.2 });

  // 只许报答案：四块全是答案，中间结果 0 块
  const tQ = T('a11', '答案本身') - 0.3, q0ff = off(T('a12') - 1.0);
  W.line(XS[0] - 118, BH + 18, XS[3] + 118, BH + 18, { t0: tQ, t1: tQ + 0.6, w: 7, off: q0ff });
  const ans4 = W.write('四块全是答案', -60, EQY, { fs: 84, cls: 'bold', t0: tQ + 0.25, t1: tQ + 0.85, off: q0ff });
  const zero = W.write('中间结果：0 块', -60, EQY + 118, { fs: 84, cls: 'red', t0: T('a11b', '一块也没写') - 0.3, t1: T('a11b', '一块也没写') + 0.4, off: q0ff });
  const self = W.write('每一块，只靠自己这一趟', -60, EQY + 236, { fs: 72, t0: t11b - 0.3, t1: t11b + 0.5, off: q0ff });

  // ── 乘积的每一位 ──
  const PY = -1700, F = 190, DIG = '2394850896';
  const pOff = off(T('a14') - 0.7, 0.5);
  const tw = T('a12', '从左往右') - 0.3;
  const dg = W.write(DIG, 0, PY, { fs: F, align: 'c', t0: tw, t1: T('a12', '开头几位') - 0.15, off: pOff });
  W.arrow([[dg.x0, PY - 164], [dg.x1, PY - 164]], { t0: tw, t1: T('a12', '开头几位') - 0.15, w: 5, color: PENCIL, pen: false, off: off(T('a13') - 0.3) });
  W.write('写，从左往右', dg.x0, PY - 228, { fs: 66, cls: 'pencil', t0: tw, t1: tw + 0.5, pen: false, off: off(T('a13') - 0.3) });
  const hband = (a, b, ta, d) => { const [x0_, x1_] = dg.span(a, b); W.hatch(x0_ + 6, PY - 112, x1_ - 6, PY + 112, { t0: ta, t1: ta + d, gap: 26, w: 20, op: 0.26, off: pOff }); return [x0_, x1_]; };
  const [h0] = hband(0, 3, T('a12', '差不多') - 0.75, 0.8); const [, t1_] = hband(6, 9, T('a12b', '算出') - 0.75, 0.8);
  const noteY = PY + 170;
  const hN = W.write('只看开头：2599 × 9214', h0, noteY, { fs: 62, t0: T('a12', '只看') - 0.15, t1: T('a12', '只看') + 0.75, off: pOff });
  const tN = W.write('只看末尾：5992 × 2138', t1_, noteY + 90, { fs: 62, align: 'r', t0: T('a12b', '只看') - 0.15, t1: T('a12b', '只看') + 0.75, off: pOff });
  // 中间两位：各部分乘积一行行压上来
  const [m0, m1] = dg.span(4, 5), DW = (dg.x1 - dg.x0) / 10;
  const tH = T('a13', '最难') - 0.2;
  W.ring((m0 + m1) / 2, PY, (m1 - m0) / 2 + 26, 126, { t0: tH, t1: tH + 0.65, w: 8, off: (t) => pOff(t) * (1 - ramp(t, T('a13c') - 0.3, 0.3)) });
  const RY0 = noteY + 200, tPP = T('a13', '各部分') - 0.1;
  for (let j = 0; j < 5; j++) { const xr = dg.x1 - j * DW, xl = xr - 6 * DW + 14, ty = RY0 + j * 48; W.line(xl, ty, xr - 14, ty, { t0: tPP + j * 0.24, t1: tPP + 0.2 + j * 0.24, w: 16, color: '#8d8f96', op: 0.8, pen: j === 0 || j === 4, amp: 1.2, off: pOff }); sfx('key', tPP + j * 0.24, { g: 0.14 }); }
  W.box(m0 - 6, RY0 - 26, m1 + 6, RY0 + 4 * 48 + 26, { t0: T('a13', '加起来') - 0.25, t1: T('a13', '加起来') + 0.3, w: 6, off: pOff });
  const lSum = W.write('各部分乘出来的数，都要加到这两位上', 0, RY0 + 4 * 48 + 82, { fs: 62, align: 'c', t0: T('a13', '加起来') + 0.05, t1: Tend('a13') + 0.5, pen: false, off: pOff });
  // 进位：从最右一位起，一跳一跳过来
  const tCr = T('a13b', '进位') - 0.15;
  for (let i = 0; i < 4; i++) {
    const xa = dg.x1 - (i + 0.5) * DW, xb = xa - DW, pts = [];
    for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([lerp(xa, xb, u), PY - 136 - Math.sin(u * Math.PI) * 58]); }
    W.stroke(pts, { t0: tCr + i * 0.44, t1: tCr + 0.34 + i * 0.44, w: 6, amp: 0.4, off: (t) => pOff(t) * (1 - ramp(t, T('a13c') - 0.3, 0.3)) });
    sfx('tick', tCr + i * 0.44, { g: 0.12 });
  }
  W.write('进位', dg.x1 - 2.5 * DW, PY - 272, { fs: 70, cls: 'bold', align: 'c', t0: tCr - 0.2, t1: tCr + 0.2, pen: false, off: (t) => pOff(t) * (1 - ramp(t, T('a13c') - 0.3, 0.3)) });
  // 这些都得在写这一块的那一趟里算完
  const tC3 = T('a13c', '四七三') - 0.3, [c0_, c1_] = dg.span(3, 5);
  W.box(c0_ - 12, PY - 124, c1_ + 12, PY + 124, { t0: tC3, t1: tC3 + 0.65, w: 8, off: pOff });
  const lOne = W.write('这些，都挤在写这一块的那一趟里', 0, PY - 272, { fs: 74, cls: 'bold', align: 'c', t0: tC3 + 0.5, t1: Tend('a13c') + 0.45, pen: false, off: pOff });

  // ── 题目越长：要走的步数，超出一趟能走的 ──
  const LY = -3050, BX0 = -560, LIM = 720;
  const barOff = off(T('a15') - 0.7);
  const lNeed = W.write('要走的', BX0 - 34, LY, { fs: 88, align: 'r', t0: T('a14') - 0.05, t1: T('a14') + 0.4, off: barOff });
  const lCan = W.write('一趟能走的', BX0 - 34, LY + 172, { fs: 88, cls: 'pencil', align: 'r', t0: T('a14') + 0.5, t1: T('a14') + 1.0, off: barOff });
  W.line(BX0, LY + 172, BX0 + LIM, LY + 172, { t0: T('a14') + 0.55, t1: T('a14') + 1.15, w: 44, color: '#a7a9ae', amp: 1, off: barOff });
  const tGrow = T('a14', '题目越长') - 0.1;
  W.line(BX0, LY, BX0 + LIM, LY, { t0: tGrow, t1: T('a14b', '超出') - 0.35, w: 44, amp: 1, ease: linear, off: barOff });
  W.line(BX0 + LIM, LY, BX0 + LIM + 560, LY, { t0: T('a14b', '超出') - 0.3, t1: T('a14b', '超出') + 1.0, w: 44, color: RED, amp: 1, ease: linear, off: barOff });
  W.write('示意', BX0 + LIM - 90, LY + 262, { fs: 56, cls: 'pencil', t0: T('a14') + 1.2, pen: false, off: barOff });
  sfx('error', T('a14b', '超出') - 0.1, { g: 0.12 });

  // ── 它错的，正是中间两位；不是不会算，是来不及算 ──
  const EY = -4400;
  const wrong = W.write('2394730896', 0, EY, { fs: 170, align: 'c', t0: T('a15') - 0.3, t1: T('a15', '中间') - 0.1 });
  W.tint(wrong, 4, 5, RED, (t) => ramp(t, T('a15', '中间') - 0.15, 0.3));
  const [w0, w1] = wrong.span(4, 5);
  W.ring((w0 + w1) / 2, EY, (w1 - w0) / 2 + 26, 118, { t0: T('a15', '中间'), t1: T('a15', '中间') + 0.75, w: 8, color: RED });
  sfx('error', T('a15', '中间'), { g: 0.12 });
  const l1 = W.write('不是不会算，', -40, EY + 262, { fs: 112, align: 'r', t0: T('a16', '不是') - 0.1, t1: T('a16', '不是') + 0.75 });
  const l2 = W.write('是来不及算', 0, EY + 262, { fs: 112, cls: 'bold', t0: T('a16', '来不及算') - 0.15, t1: Tend('a16') + 0.1 });

  // ── 镜头 ──
  const row = [[XS[0] - 150, -BH - 40, 0], [XS[3] + 150, BH + 40, 0]];
  const shTok = fitCam(W, [...row, eq, gl, glD], { pitch: 34, kmax: 1.25 });
  const shOne = fitCam(W, [S0.box, eq, lUp, lPass, lFix, lGpt, lLayer, [x0 - RW / 2 - 40, SY, 0], [x0 + RW * 1.7 + 60, SY, LZ]], { pitch: 46, cz: H * 0.42, kmax: 1.15 });
  const shFour = fitCam(W, [...ST.map((q) => q.box), [xU - 30 - 4 * 110, SY, H * 0.52], eq, each, zi, self, zero, nosee], { pitch: 44, cz: H * 0.3 });
  const shPage = fitCam(W, [dg, hN, tN, lSum, lOne, [dg.x0 - 40, PY - 300, 0]], { pitch: 26 });
  const shLim = fitCam(W, [lNeed, lCan, [BX0 + LIM + 620, LY - 40, 0], [BX0, LY + 240, 0]], { pitch: 26, kmax: 1.25 });
  const shErr = fitCam(W, [wrong, l1, l2, [0, EY - 150, 0]], { pitch: 26 });
  W.cam([
    [T('a1') - 1.25, shTok, 2.0],
    [T('a3') - 0.55, shOne, 2.3],
    [T('a8') - 0.9, shFour, 1.9],
    [T('a12') - 0.85, shPage, 2.2],
    [T('a14') - 0.75, shLim, 1.9],
    [T('a15') - 0.85, shErr, 1.9],
    [Tend('a16') + 0.9, blankCam(0, -5760), Math.max(0.9, s.end + 0.35 - Tend('a16') - 0.9)],
  ]);
  [T('a1') - 1.25, T('a8') - 0.9, T('a12') - 0.85, T('a14') - 0.75, T('a15') - 0.85].forEach((a) => sfx('whoosh', a, { g: 0.13 }));
  sfx('riser', T('a3') - 0.5, { g: 0.1 });
  sfx('chime', T('a16', '来不及算'), { g: 0.16 });
});
