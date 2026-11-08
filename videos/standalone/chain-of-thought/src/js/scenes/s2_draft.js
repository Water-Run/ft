// 02 草稿。人打草稿拿一张纸；模型没有别的纸，草稿只能写进回答里。
// 主画面：一趟算完，纸垛退色，只有写到纸上的字留下；下一趟从这个字接着算。写下的步骤越多，能连着算的就越长——一座塔，镜头沿着它升上去，再退开看全貌。
// 然后是三组对照：一百道题；只写点；先写答案再写过程。
// 事实：L1、L3 §1、§3、§4；S1 第 3.3 节（只输出点、推理放在答案之后）；S7；S10。
scene('draft', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, blankCam(0, 92 + TILE));
  chapterHead(W, s, '02', '草稿', 1, T('b1') - 0.2);
  const off = (a, d = 0.6) => (t) => 1 - ramp(t, a, d);

  // ── 人的草稿：一张纸落下来，一步步写，下一步从纸上的数接着算 ──
  const HY = -60, HX = -700, HL = 136, hOff = off(T('b3', '打草稿') - 0.55, 0.6);
  const sh = h('div', 'sheet2', W.shadowL); css(sh, { left: '-860px', top: (HY - 250) + 'px', width: '1720px', height: (4 * HL + 290) + 'px' });
  const tS = T('b1', '纸') - 0.25;
  place(W, sh, (t) => ({ x: 0, y: -90 * (1 - ramp(t, tS, 0.6, ease.out3)) + 1500 * ramp(t, T('b3', '打草稿') - 0.55, 1.0, ease.io3), o: ramp(t, tS, 0.3) * (1 - ramp(t, T('b3', '打草稿') + 0.05, 0.5)) }));
  const hq = W.write('25992 × 92138 =', HX, HY - 130, { fs: 78, cls: 'bold', t0: T('b1') + 0.1, t1: T('b1') + 0.85, off: hOff });
  const tL = T('b1', '纸') + 0.35, tL2 = T('b2', '下一步') - 0.15;
  const HA = [['92138 = 92000 + 138', tL, tL + 0.75], ['25992 × 92000 = 2391264000', tL + 0.9, T('b2', '写下来') + 0.1], ['25992 × 138 = 3586896', T('b2', '写下来') + 0.25, tL2 + 0.25], ['2391264000 + 3586896 = 2394850896', tL2 + 0.4, T('b2', '接着算') + 0.2]];
  const hw = HA.map(([txt, a, b], i) => W.write(txt, HX, HY + i * HL, { fs: 78, t0: a, t1: b, off: hOff }));
  const [ru0, ru1] = hw[1].span(16, 25);
  W.line(ru0, hw[1].y + 50, ru1, hw[1].y + 50, { t0: T('b2', '写下来') - 0.05, t1: T('b2', '写下来') + 0.2, w: 6, off: hOff, pen: false });
  const [nu0, nu1] = hw[3].span(0, 9);
  W.arrow([[ru1 - 20, hw[1].y + 60], [ru1 + 10, hw[2].y + 66], [nu0 + 180, hw[2].y + 68], [(nu0 + nu1) / 2, hw[3].y - 46]], { t0: T('b2', '接着算') + 0.25, t1: T('b2', '接着算') + 1.05, w: 6, off: hOff });
  sfx('pop', tS, { g: 0.2 });
  W.cross(0, HY + 200, 150, { t0: T('b3', '没有别的纸') - 0.1, t1: T('b3', '没有别的纸') + 0.5, off: hOff, w: 14 });

  // ── 模型：草稿只能写进回答里；三百多块 ──
  const RY = -1500, RX = -780, F2 = 70, L2 = 108;
  const rOff = off(T('b6') - 0.5);
  const q = W.write('25992 × 92138 =', RX, RY - 120, { fs: 86, t0: T('b3', '打草稿') + 0.25, t1: T('b3', '打草稿') + 1.0, off: rOff });
  const rl = W.write('草稿只能写进回答里', q.x1 + 60, RY - 120, { fs: 70, cls: 'pencil', t0: T('b3', '回答里') - 0.35, t1: T('b3', '回答里') + 0.3, pen: false, off: rOff });
  const tW0 = T('b4', '三百多块') - 1.0, lines = ['92138 = 92000 + 138', '25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896'];
  const RL = lines.map((l, i) => W.write(l, RX, RY + i * L2, { fs: F2, t0: tW0 + i * 0.42, t1: tW0 + 0.38 + i * 0.42, off: rOff }));
  // 后面的一大片：草草写下去（三百多块）；每一行是一段笔迹
  const r3 = seeded(77), NR = 14, scrOff = off(T('b5') - 0.3, 0.5);
  const scrB = RY + 3 * L2 + 8, scrT0 = tW0 + 1.3, scrT1 = T('b5') - 0.25;
  for (let j = 0; j < NR; j++) { let x = RX; const y = scrB + j * 74, a = lerp(scrT0, scrT1, j / NR), b = lerp(scrT0, scrT1, (j + 0.92) / NR); const parts = 4 + Math.floor(r3() * 2); let k = 0; while (k < parts) { const w = 90 + r3() * 130; W.line(x, y, x + w, y, { t0: lerp(a, b, k / parts), t1: lerp(a, b, (k + 0.85) / parts), w: 12, color: '#7e8088', op: 0.75, amp: 3, pen: k === 0 && j % 3 === 0, off: scrOff }); x += w + 26; k++; } }
  const count = W.write('三百多块', 340, scrB + 470, { fs: 170, cls: 'bold', t0: T('b4', '三百多块') - 0.1, t1: T('b4', '三百多块') + 0.5, off: scrOff });
  sfx('riser', scrT0, { g: 0.1 });
  // 看前几行：拆开，分别乘，再加起来
  W.hatch(RL[0].x0 - 12, RL[0].y - 46, RL[0].x1 + 12, RL[0].y + 46, { t0: T('b5', '拆成') - 0.15, t1: T('b5', '拆成') + 0.7, gap: 18, w: 15, op: 0.5, off: off(T('b5b') - 0.1) });
  W.under_(RL[0], 8, 18, { t0: T('b5', '加一百') - 0.3, t1: T('b5', '加一百') + 0.3, w: 6, off: rOff });
  const tM = T('b5b', '相乘') - 0.1;
  W.ring(RL[1].x0 + 150, RL[1].y, 190, 52, { t0: tM - 0.6, t1: tM - 0.1, w: 5, off: rOff });
  W.ring(RL[2].x0 + 150, RL[2].y, 190, 52, { t0: tM, t1: tM + 0.5, w: 5, off: rOff });
  W.write('分别乘', RL[1].x1 + 60, RL[1].y, { fs: 74, cls: 'pencil', t0: tM - 0.5, t1: tM, pen: false, off: rOff });
  const addT = W.write('再加起来', RL[2].x1 + 60, RL[2].y, { fs: 74, cls: 'pencil', t0: T('b5b', '加起来') - 0.15, t1: T('b5b', '加起来') + 0.4, pen: false, off: rOff });

  // ── 接力：一趟算完退色，写在纸上的留下，下一趟从它接着算 ──
  const XS = [-540, 0, 540], SY = -3250, AY = SY + 310;
  const sink = (t) => 1 - ramp(t, T('b8b') - 0.7, 0.75);
  const passes = (list) => (t) => list.reduce((v, [a, b, dr]) => Math.max(v, ramp(t, a, b - a, linear) * (1 - ramp(t, dr, 0.8))), 0);
  const t60 = T('b6') - 0.1, tW = T('b6', '写成字') + 0.05, t70 = T('b7', '读到') + 0.1, t8w = T('b7', '往上') + 0.25, t80 = T('b8', '很多趟') - 0.5, t8e = T('b8', '接起来');
  const F = [passes([[t60, tW, T('b7') - 0.2]]), passes([[t70, t8w, T('b8') - 0.2]]), passes([[t80 + 0.15, t8e + 0.3, T('b8b') - 0.9]])];
  const ST = XS.map((x, i) => { const r_ = seeded(60 + i); const S = stack(W, x, SY, { w: 340, d: 190, n: 96, gap: 6, rise: (t) => ramp(t, T('b6') - 0.7, 0.9, ease.out3) * sink(t), fill: F[i] }); for (let j = 0; j < 22; j++) { const fr = 0.06 + r_() * 0.88, wd = 14 + r_() * 62, lf = 14 + r_() * 250; S.note(`<i style="width:${wd.toFixed(0)}px;margin-left:${lf.toFixed(0)}px"></i>`, fr, (t) => clamp((F[i](t) - fr) * 26)); } return S; });
  const H3 = ST[0].H;
  const zOff = off(T('b8b') - 0.5);
  const put = (i, txt, a) => W.write(txt, XS[i], AY, { fs: 78, align: 'c', cls: 'bold', t0: a, t1: a + 0.65, off: zOff });
  const W0 = put(0, '2,391,264,000', tW - 0.1), W1 = put(1, '3,586,896', t8w - 0.1);
  const arrowTo = (i, a) => W.arrow([[XS[i] - 80, AY - 58], [XS[i + 1] - 200, AY - 96], [XS[i + 1] - 130, SY + 104]], { t0: a, t1: a + 0.55, w: 6.5, off: zOff });
  arrowTo(0, T('b7', '读到') - 0.55); arrowTo(1, t80 - 0.55);
  sfx('tick', tW, { g: 0.2 }); sfx('tick', t8w, { g: 0.2 });
  const W2 = put(2, '2,394,850,896', t8e + 0.3);

  // ── 一座塔：写下的步骤越多，能连着算的就越长 ──
  const TX = 0, TY = -5000, G10 = 60;
  const t8b = T('b8b') - 0.45, tTop = Tend('b8b') + 0.55;
  const tOff = off(T('b12') - 0.95, 0.7), rise = (t) => ramp(t, t8b, tTop - t8b, smooth);
  const tower = stack(W, TX, TY, { w: 460, d: 240, n: 32, gap: G10, rise: (t) => 1 - (1 - rise(t)) * 1, fill: rise, op: tOff }); tower.g.classList.add('seams');
  const stub = stack(W, TX - 680, TY, { w: 460, d: 240, n: 4, gap: 14, rise: (t) => ramp(t, t8b, 0.5, ease.out3), fill: (t) => ramp(t, t8b + 0.2, 0.5), op: tOff });
  const TH = tower.H;
  const l1 = W.write('只报答案：四趟', TX - 680, TY + 330, { fs: 120, align: 'c', cls: 'pencil', t0: tTop - 0.6, t1: tTop + 0.1, off: tOff, pen: false });
  const l2 = W.write('先写过程：三百多趟', TX - 180, TY + 330, { fs: 132, cls: 'bold', t0: tTop + 0.2, t1: tTop + 0.9, off: tOff, pen: false });
  [[50, 1], [120, -1], [200, 1], [300, -1]].forEach(([n, sd]) => { const z = n / 320 * 1920; const lab = `第 ${n} 趟`; const tl = W.wallText(lab, sd > 0 ? 290 : -290 - lab.length * 50, TY + 124, z, 92, (t) => ramp(t, lerp(t8b, tTop, (n / 320) * 0.95), 0.4) * (1 - ramp(t, tTop, 0.5)), 'bold'); });

  // ── 一百道题 ──
  const GY0 = -7000, CW = 62, RH = 74, GX = -560, gOff = off(T('b9') - 0.75);
  const dA = [20, 16, 3, 0, 0], dT = [20, 20, 20, 20, 19], rows = ['三位', '四位', '五位', '六位', '七位'];
  const t12 = T('b12', '一百道') - 0.1, t13 = T('b13', '对了') - 0.3, t13b = T('b13b', '对了') - 0.3;
  const t100 = W.write('一百道乘法', GX + 10 * CW, GY0 - 262, { fs: 104, cls: 'bold', align: 'c', t0: T('b12', '一百道') - 0.15, t1: T('b12', '乘法') + 0.25, off: gOff });
  const title1 = W.write('只报答案', GX - 230, GY0 - 100, { fs: 100, align: 'r', t0: T('b13') - 0.15, t1: T('b13') + 0.3, off: gOff });
  const n39 = W.write('39', GX - 230, GY0 + 52, { fs: 150, align: 'r', cls: 'bold', t0: T('b13', '三十九') - 0.2, t1: T('b13', '三十九') + 0.2, off: gOff });
  const title2 = W.write('先写过程', GX - 230, GY0 + 410, { fs: 100, align: 'r', t0: T('b13b') - 0.15, t1: T('b13b') + 0.3, off: gOff });
  const n99 = W.write('99', GX - 230, GY0 + 562, { fs: 150, align: 'r', cls: 'bold', t0: T('b13b', '九十九') - 0.2, t1: T('b13b', '九十九') + 0.2, off: gOff });
  const grid = (ox, oy, ok, tMark, showWrong, tLine) => {
    for (let r = 0; r < 5; r++) {
      if (showWrong === 1) { const ta_ = lerp(T('b12', '三位') - 0.3, T('b12', '七位'), r / 4); W.hatch(ox, oy + r * RH - 28, ox + 20 * CW, oy + r * RH + 28, { t0: ta_, t1: ta_ + 0.5, gap: 22, w: 14, op: 0.32, pen: false, off: off(T('b13') - 0.25, 0.5) }); }
      W.line(ox, oy + r * RH + 34, ox + 20 * CW, oy + r * RH + 34, { t0: tLine + r * 0.12, t1: tLine + 0.3 + r * 0.12, w: 3, color: '#a3a6ac', pen: false, off: gOff });
      for (let c = 0; c < 20; c++) {
        const x = ox + (c + 0.5) * CW, y = oy + r * RH, ta = tMark + r * 0.2 + c * 0.016;
        if (c < ok[r]) W.check(x, y, 19, { t0: ta, t1: ta + 0.14, w: 6, pen: c === 0 && r === 0, off: gOff, amp: 0.5 });
        else if (showWrong) { const tw_ = r >= 3 ? T('b13', '一道没对') - 0.4 + (r - 3) * 0.3 + c * 0.012 : ta; W.line(x - 15, y + 15, x + 15, y - 15, { t0: tw_, t1: tw_ + 0.14, w: 6, color: RED, pen: false, amp: 0.5, off: gOff }); }
      }
    }
  };
  grid(GX, GY0 - 118, dA, t13, 1, t12); grid(GX, GY0 + 392, dT, t13b, 2, T('b13b') - 0.6);
  rows.forEach((d, r) => W.write(d, GX - 30, GY0 - 118 + r * RH, { fs: 54, align: 'r', cls: 'pencil', t0: lerp(T('b12', '三位'), T('b12', '七位'), r / 4) - 0.1, pen: false, off: gOff }));
  const nope = W.write('六位、七位，一道没对', GX + 20 * CW, GY0 + 308, { fs: 66, align: 'r', cls: 'red', t0: T('b13', '一道没对') - 0.2, t1: T('b13', '一道没对') + 0.45, pen: false, off: gOff });

  // ── 多写点别的，行不行？只写点 ──
  const DY = -8700;
  const dq = W.write('那多写点别的，行不行？', 0, DY, { fs: 120, align: 'c', cls: 'bold', t0: T('b9') - 0.1, t1: Tend('b9') });
  const dqOff = off(T('b14') - 0.75);
  const gg = W.write('谷歌那篇论文（2022）', 0, DY + 180, { fs: 92, align: 'c', cls: 'bold', t0: T('b9b', '谷歌') - 0.05, t1: T('b9b', '谷歌') + 0.8 });
  const eq3 = W.write('25992 × 92138 =', -880, DY + 340, { fs: 92, t0: T('b9b', '一串点') - 0.9, t1: T('b9b', '一串点') - 0.35 });
  W.hatch(eq3.x0 - 12, DY + 340 - 52, eq3.x1 + 12, DY + 340 + 52, { t0: T('b9b', '一串点') - 0.95, t1: T('b9b', '一串点') - 0.25, gap: 18, w: 15, op: 0.5, pen: false });
  const dotStr = '· · · · · · · · · · · · · · · · · · · · · · · · · · · ·';
  const dots = W.write(dotStr, eq3.x1 + 30, DY + 340, { fs: 92, t0: T('b9b', '一串点') - 0.3, t1: T('b9b', '一样长') + 0.2 });
  W.write('和解题算式一样长', dots.x0, DY + 472, { fs: 68, cls: 'pencil', t0: T('b9b', '一样长') - 0.1, t1: T('b9b', '一样长') + 0.5, pen: false });
  W.hatch(dots.x0, DY + 340 - 46, dots.x1, DY + 340 + 46, { t0: T('b9b', '一样长') - 0.2, t1: T('b9b', '一样长') + 0.65, gap: 20, w: 15, op: 0.5 });
  const res = W.write('结果和直接回答差不多', dots.x0, DY + 590, { fs: 84, cls: 'bold', t0: T('b10') - 0.1, t1: Tend('b10') });
  const nn = W.write('写的全是点，下一趟没东西可接', -880, DY + 720, { fs: 88, cls: 'red', t0: T('b11', '全是点') - 0.1, t1: T('b11', '没东西可接') + 0.4 });
  W.ring((dots.x0 + dots.x1) / 2, DY + 340, (dots.x1 - dots.x0) / 2 + 24, 76, { t0: T('b11', '全是点') - 0.2, t1: T('b11', '全是点') + 0.6, color: RED, w: 7 });

  // ── 先写答案，再写过程 ──
  const VY = -10500, VX = -640, VL = 122;
  const vq = W.write('25992 × 92138 =', VX, VY - 150, { fs: 86, t0: T('b14') - 0.25, t1: T('b14') + 0.35 });
  const va = W.write('答案：2394841296', VX, VY, { fs: 108, cls: 'bold', t0: T('b14') + 0.45, t1: T('b14', '答案') + 0.45 });
  W.line(VX, VY + 78, va.x1 + 40, VY + 78, { t0: T('b15') - 0.05, t1: T('b15', '答案') + 0.15, w: 11, color: RED });
  const procs = ['25992 × (92000 + 138)', '= 2391264000 + 3586896', '= 2394841296'];
  const PR = procs.map((l, i) => W.write(l, VX, VY + 170 + i * VL, { fs: 84, t0: T('b14', '后面') + 0.05 + i * 0.55, t1: T('b14', '后面') + 0.5 + i * 0.55 }));
  const stat = W.write('一百道，只对 36 道', VX + 790, VY - 150, { fs: 92, cls: 'bold', t0: T('b14b', '三十六') - 0.4, t1: T('b14b', '三十六') + 0.25, pen: false });
  // 接不上：过程想往上够答案，被红线挡住
  const axv = va.x0 + 150;
  W.arrow([[VX - 54, lerp(VY + 170, VY + 414, 0.5)], [VX - 54, VY + 96]], { t0: T('b15', '后面') - 0.05, t1: T('b15', '后面') + 0.5, w: 8, head: 24 });
  W.hatch(VX, VY + 118, PR[1].x1 + 10, VY + 170 + 2 * VL + 56, { t0: T('b15', '还没写') - 0.5, t1: T('b15', '还没写') + 0.4, gap: 24, w: 18, op: 0.42, off: off(T('b16') - 0.3) });
  const no = W.write('接不上', Math.max(PR[1].x1, va.x1) + 280, VY + 78, { fs: 104, cls: 'red', t0: T('b15', '接不上') - 0.2, t1: T('b15', '接不上') + 0.25 });
  sfx('error', T('b15', '接不上') - 0.1, { g: 0.14 });
  // 错了的：过程算到最后，又凑回开头那个错数
  const lastY = PR[2].y, xR = Math.max(PR[1].x1, va.x1) + 40;
  W.ring((PR[2].x0 + PR[2].x1) / 2 + 30, lastY, (PR[2].x1 - PR[2].x0) / 2 + 10, 62, { t0: T('b16', '错了的') - 0.1, t1: T('b16', '错了的') + 0.5, color: RED, w: 6 });
  W.arrow([[PR[2].x1 + 34, lastY], [xR + 200, lastY - 40], [xR + 200, VY + 30], [va.x1 + 14, VY - 12]], { t0: T('b16', '凑回') - 0.55, t1: T('b16', '凑回') + 0.5, color: RED, w: 7, head: 30 });
  const back = W.write('又凑回错数', xR + 230, lastY - 110, { fs: 84, cls: 'red', t0: T('b16', '错数') - 0.4, t1: T('b16', '错数') + 0.25, pen: false });
  const nb = W.write('有点像人的脑补', xR + 230, lastY + 26, { fs: 84, cls: 'bold', t0: T('b16b') - 0.1, t1: Tend('b16b') + 0.15 });

  // ── 镜头：每一段内容居中、填满画面；沿着纸往前走；一座塔时升上去再退开 ──
  const shHand = fitCam(W, [...hw, hq, [HX - 160, HY - 250, 0], [960, HY + 3 * HL + 150, 0], [-960, HY - 260, 0]], { pitch: 30, kmax: 1.15 });
  const shRead = fitCam(W, [q, rl, ...RL, addT, [RX, RY + 2 * L2 + 80, 0]], { pitch: 28, kmax: 1.15 });
  const shMany = fitCam(W, [q, [RX - 40, scrB + NR * 74 + 30, 0], [1000, scrB + NR * 74 + 30, 0], count], { pitch: 26 });
  const shRelay = fitCam(W, [...ST.map((q_) => q_.box), W0, W1, W2], { pitch: 44, cz: H3 * 0.3 });
  const rise0 = fitCam(W, [{ box: [TX, TY, 1360, 240, 500] }], { pitch: 46, cz: 250, kmax: 0.95 });
  const shAll = fitCam(W, [tower.box, stub.box, l1, l2], { pitch: 46, cz: TH * 0.44 });
  const shGrid = fitCam(W, [t100, title1, title2, n99, nope, [GX + 20 * CW + 60, GY0 - 150, 0], [GX + 20 * CW + 60, GY0 + 392 + 5 * RH, 0]], { pitch: 24 });
  const shDots = fitCam(W, [dq, eq3, dots, nn, res], { pitch: 26 });
  const shVig = fitCam(W, [vq, stat, va, ...PR, no, back, nb, [xR + 620, lastY - 120, 0]], { pitch: 28 });
  W.cam([
    [T('b1') - 1.25, shHand, 2.0],
    [T('b3', '打草稿') - 0.6, shRead, 1.7],
    [T('b4') - 0.2, shMany, 1.6],
    [T('b5') - 0.3, shRead, 1.4],
    [T('b6') - 0.85, shRelay, 2.0],
    [T('b8b') - 0.75, rise0, 1.1],
    [T('b8b') + 0.4, { ...rise0, cz: TH - 480 }, tTop - T('b8b') - 0.4, smooth],
    [tTop + 0.02, shAll, 1.7],
    [T('b12') - 0.9, shGrid, 2.0],
    [T('b9') - 0.9, shDots, 2.0],
    [T('b14') - 0.9, shVig, 2.0],
    [Tend('b16b') + 1.0, blankCam(0, -12480), Math.max(0.9, s.end + 0.35 - Tend('b16b') - 1.0)],
  ]);
  [T('b1') - 1.25, T('b3', '打草稿') - 0.6, T('b6') - 0.85, T('b12') - 0.9, T('b9') - 0.9, T('b14') - 0.9].forEach((a) => sfx('whoosh', a, { g: 0.13 }));
  sfx('riser', T('b8b'), { g: 0.16 });
});
