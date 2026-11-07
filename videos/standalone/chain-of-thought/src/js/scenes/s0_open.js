// 开场：同一道乘法、同一个模型，三次回答写在同一张纸上。
// 第一次只报答案（四块，错在中间两位）；第二次先写算式、最后写答案（对）；第三次先写答案、再补过程（过程最后加回了开头那个错数）。
// 退远看三段：差别只在过程写没写、写在答案前还是后。这叫思维链。两个问题，然后片名印在纸上。
// 事实：L1 n5-03（三种问法的回复原文）、L3 §3（逐位比对、第三次的最后一行等于第一行）；S1（Chain of Thought，Google Research，2022 年 1 月）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const X0 = -900, MAXW = 1800, LH = 112;          // 每段回答的左边界、行宽、行距
  const QW = 640, QD = 100;                        // 题目方块
  const R1 = -940, R2 = -400, R3 = 780;            // 三段回答的第一行
  const XT = X0 + QW + 40;                         // 题目后面第一块的左边

  // 远近：退远看三段时，方块上的字太小，先淡去；走近再显出来
  // 方块上的字只在镜头对着那一段时显出来；不在讲的那段只剩方块（远处的字小到看不清，不如不显）
  const iv = (t, a, b) => ramp(t, a, 0.5) * (1 - ramp(t, b, 0.5));
  const TX = [
    (t) => Math.max(1 - ramp(t, T('o6') - 0.2, 0.5), ramp(t, T('o16') - 0.6, 0.6)),
    (t) => Math.max(iv(t, T('o6') - 0.6, T('o8') - 0.3), iv(t, T('o12') - 0.4, T('o15') - 0.3)),
    (t) => Math.max(iv(t, T('o8') - 0.6, T('o11') - 0.7), iv(t, T('o15') - 0.5, T('o16') - 0.4)),
  ];
  // 讲到哪一段，另外两段淡下去（F[0..2] 是三段各自的透明度系数）
  const win = (t, a, b) => ramp(t, a, 0.6) * (1 - ramp(t, b, 0.6));
  const F = [
    (t) => 1 - 0.72 * win(t, T('o12') - 0.3, T('o16') - 0.5),
    (t) => 1 - 0.72 * win(t, T('o15') - 0.3, s.end + 1),
    (t) => 1 - 0.72 * Math.max(win(t, T('o12') - 0.3, T('o15') - 0.5), win(t, T('o16') - 0.3, s.end + 1)),
  ];

  const question = (y, ta, f, tx) => {
    const q = block(S, '<span class="tx">25992 × 92138 =</span>', { w: QW, d: QD, h: 30, fs: 52 });
    cast(q.g, QW * 1.06, QD * 1.5);
    place(W, q.g, (t) => ({ x: X0 + QW / 2, y, z: 50 * (1 - ramp(t, ta, 0.5, ease.out3)), o: ramp(t, ta, 0.3) * f(t) }));
    fade(W, q.top.firstChild, tx);
    return q;
  };
  const write = (toks, t0, t1, f, g = 0.16) => toks.forEach((k, i) => {
    const ta = lerp(t0, t1, toks.length > 1 ? i / (toks.length - 1) : 0);
    k.ta = ta;
    place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 36 * (1 - ramp(t, ta, 0.28, ease.out3)), o: ramp(t, ta, 0.18) * f(t) }));
    if (i % 2 === 0) sfx('key', ta, { g });
  });
  const textFade = (toks, tx) => toks.forEach((k) => { if (k.b.top.firstChild && k.b.top.firstChild.nodeType === 1) fade(W, k.b.top.firstChild, tx); });
  // 页边的标签：面向镜头，右对齐在每段左边
  const margin = (txt, y, ta, f) => { const e = W.board(`<div class="lbl l" style="transform:translate(-100%,-50%)">${txt}</div>`, X0 - 50, y, 0, 0, 0); fade(W, e, (t) => ramp(t, ta, 0.5) * f(t)); return e; };

  // ── 第一次：只报答案 ──
  question(R1, 0.35, F[0], TX[0]);
  sfx('pop', 0.45, { g: 0.3 });
  // 估个大概：十个空位，只填得出头两位
  const slots = [], SW = 70;
  const estOff = (t) => 1 - ramp(t, T('o3') + 0.3, 0.5);
  for (let i = 0; i < 10; i++) {
    const b = block(S, i < 2 ? `<span class="tx">${'23'[i]}</span>` : '', { w: 60, d: 76, h: i < 2 ? 22 : 8, fs: 50, cls: i < 2 ? '' : 'cube no' });
    const ta = T('o2', '估个大概') - 0.4 + i * 0.07, tb = T('o2', '二十三亿') - 0.15 + i * 0.14;
    if (i < 2) place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 40 * (1 - ramp(t, tb, 0.3, ease.out3)), o: ramp(t, tb, 0.2) * estOff(t) }));
    else place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 0, o: ramp(t, ta, 0.25) * estOff(t) }));
    slots.push(b);
  }
  [0, 1].forEach((i) => { const b = block(S, '', { w: 60, d: 76, h: 8, cls: 'cube no' }); place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 0, o: ramp(t, T('o2', '估个大概') - 0.4 + i * 0.07, 0.25) * (1 - ramp(t, T('o2', '二十三亿') - 0.15 + i * 0.14, 0.2)) })); });
  sfx('tick', T('o2', '二十三亿') - 0.15, { g: 0.2 });
  margin('只报答案', R1, T('o3') + 0.6, F[0]);
  const A1 = ['239', '473', '089', '6'].map((txt, i) => {
    const b = block(S, `<span class="tx">${txt}</span>`, { w: 150, d: QD, h: 30, fs: 58, cls: i === 1 ? 'err' : '' });
    fade(W, b.top.firstChild, TX[0]);
    const x = XT + 75 + i * 168, ta = T('o3', '报答案') + 0.1 + i * 0.16;
    place(W, b.g, (t) => {
      const th = T('o16', '一块一块') - 0.1 + i * 0.22, kk = ramp(t, th, 0.36, (u) => u);
      return { x, y: R1, z: 60 * (1 - ramp(t, ta, 0.4, ease.out3)) + Math.sin(kk * Math.PI) * 46, o: ramp(t, ta, 0.25) * F[0](t) };
    });
    sfx('pop', ta, { g: 0.22 }); sfx('tick', T('o16', '一块一块') - 0.1 + i * 0.22, { g: 0.18 });
    return { b, x };
  });
  // 逐位比对：上一行是它的答案，下一行是正确的乘积；对的位上画线，错的两位圈起来
  const DW = 44, CX0 = XT + 20, CY1 = R1 + 104, CY2 = R1 + 172;
  const ANS = '2394730896', OK = '2394850896';
  [...ANS].forEach((c, i) => { const e = W.print(`<div class="digits m${i === 4 || i === 5 ? ' err' : ''}">${c}</div>`, CX0 + i * DW, CY1 - 34); fade(W, e, (t) => ramp(t, T('o4', '十位数') - 0.2 + i * 0.05, 0.3) * F[0](t) * TX[0](t)); });
  [...OK].forEach((c, i) => { const e = W.print(`<div class="digits m g">${c}</div>`, CX0 + i * DW, CY2 - 34); fade(W, e, (t) => ramp(t, T('o4', '十位数') + 0.4 + i * 0.05, 0.3) * F[0](t) * TX[0](t)); });
  const lab = W.print('<div class="lbl">正确的乘积</div>', CX0 + 10 * DW + 30, CY2 - 22); fade(W, lab, (t) => ramp(t, T('o4', '十位数') + 0.6, 0.4) * F[0](t) * TX[0](t));
  const under = (a, b, ta, cls) => { const e = seg(S, cls); e.set([CX0 + a * DW + 4, CY2 + 42, 0.8], [CX0 + b * DW - 6, CY2 + 42, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.4) * F[0](t)); };
  under(0, 4, T('o4', '前四位'), 'w'); under(6, 10, T('o4', '后四位'), 'w');
  rect(W, S, CX0 + 4 * DW - 8, CY1 - 44, 2 * DW + 12, CY2 - CY1 + 92, (t) => ramp(t, T('o5', '中间') - 0.2, 0.4) * F[0](t), 'e');
  sfx('tick', T('o5', '中间'), { g: 0.3 });

  // ── 第二次：先写算式，最后写答案（原文 321 块，这里画出骨架） ──
  question(R2, T('o6') + 0.2, F[1], TX[1]);
  margin('先写过程', R2, T('o6', '先把') - 0.2, F[1]);
  const P2 = para(S, X0, R2, [
    4, '25992', '×', '92138', 2, '\n',
    4, '92138', '=', '92000', '+', '138', 3, '\n',
    '25992', '×', '92', '=', '2391264', 2, '×', '1000', '=', '2,391', ',264', ',000', '\n',
    '25992', '×', '138', '=', '2,599', ',200', '+', '779', ',760', '+', '207', ',936', '\n',
    '=', '3,586', ',896', 5, '\n',
    '2,391', ',264', ',000', '+', '3,586', ',896', '=', '2,394', ',850', ',896', '\n',
    3, '≈', '2,392', ',000', ',000', 4, '\n',
    '答案', '：', '239', '485', '089', '6',
  ], { fs: 42, lh: LH, maxW: MAXW, x1st: XT });
  write(P2, T('o6', '算式') - 0.3, Tend('o6') + 0.1, F[1]);
  textFade(P2, TX[1]);
  const ans2 = P2.slice(-4);
  const ck2 = h('div', 'p3 chk2 big', S); ck2.style.transform = `translate3d(${ans2[3].x1 + 40}px, ${ans2[3].y - 26}px, 1px) rotate(40deg)`;
  fade(W, ck2, (t) => ramp(t, T('o7', '对') - 0.2, 0.3) * F[1](t));
  sfx('chime', T('o7', '对'), { g: 0.25 });

  // ── 第三次：先写答案，再补过程；过程最后一步加回了开头那个数 ──
  question(R3, T('o8') + 0.2, F[2], TX[2]);
  margin('先写答案', R3, T('o8', '先写答案') - 0.2, F[2]);
  const P3 = para(S, X0, R3, [
    '答案', '：', '239', '484', '129', '6', '\n',
    4, '\n',
    '25992', '×', '92138', '\n',
    '=', '25992', '×', '(', '92000', '+', '138', ')', '\n',
    '=', '25992', '×', '92000', '+', '25992', '×', '138', '\n',
    '=', '239', '126', '400', '0', '+', '358', '689', '6', '\n',
    '=', '239', '484', '129', '6',
  ], { fs: 42, lh: LH, maxW: MAXW, x1st: XT });
  write(P3.slice(0, 6), T('o8', '先写答案') - 0.2, T('o8', '先写答案') + 0.6, F[2]);
  write(P3.slice(6), T('o8', '再补过程') - 0.1, T('o9') + 0.6, F[2]);
  textFade(P3, TX[2]);
  const ans3 = P3.slice(2, 6), fin3 = P3.slice(-4);
  const line3 = (n) => P3.filter((k) => k.line === n);
  [[3, T('o9', '拆分')], [5, T('o9', '乘法')]].forEach(([n, ta]) => {
    const L_ = line3(n), last = L_[L_.length - 1];
    const ck = h('div', 'p3 chk2', S); ck.style.transform = `translate3d(${last.x1 + 34}px, ${last.y - 20}px, 1px) rotate(40deg)`;
    fade(W, ck, (t) => ramp(t, ta - 0.1, 0.3) * F[2](t));
    sfx('tick', ta, { g: 0.2 });
  });
  const ul = (toks, ta) => { const e = seg(S, 'e w'); e.set([toks[0].x0, toks[0].y + 50, 0.8], [toks[toks.length - 1].x1, toks[0].y + 50, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.35) * F[2](t)); };
  ul(fin3, T('o10', '加错了') - 0.1);
  ul(ans3, T('o10', '开头') - 0.2);
  arc3(W, S, [fin3[1].x, fin3[1].y - 10, 24], [ans3[1].x, ans3[1].y + 10, 24], 300, { cls: 'e w', n: 40,
    draw: (t) => ramp(t, T('o10', '正好是') - 0.3, 1.3, ease.io3), op: F[2] });
  sfx('tick', T('o10', '加错了'), { g: 0.3 });

  // ── 退远：三段并排。差别只在过程写没写（圈出两段过程）、写在答案前还是后（圈出两处答案） ──
  const procOn = (t) => ramp(t, T('o11b', '写没写') - 0.5, 0.4) * (1 - ramp(t, T('o12') - 0.3, 0.5));
  const ansOn = (t) => ramp(t, T('o11b', '前还是后') - 0.4, 0.4) * (1 - ramp(t, T('o12') - 0.3, 0.5));
  rect(W, S, X0 - 18, R2 + LH - 58, MAXW + 36, 5 * LH + 116, procOn, 'g');
  rect(W, S, X0 - 18, R3 + LH - 58, MAXW + 36, 5 * LH + 116, procOn, 'g');
  rectOf(W, S, P2, P2.length - 6, P2.length - 1, ansOn);
  rectOf(W, S, P3, 0, 5, ansOn);
  sfx('whoosh', T('o11') - 0.6, { g: 0.22 });
  sfx('tick', T('o11b', '写没写') - 0.5, { g: 0.2 }); sfx('tick', T('o11b', '前还是后') - 0.4, { g: 0.2 });
  sfx('blip', T('o12', '思维链') - 0.1, { g: 0.2 }); sfx('tick', T('o13', 'Chain') - 0.1, { g: 0.14 }); sfx('tick', T('o13b', '谷歌') - 0.1, { g: 0.14 });
  sfx('tick', T('o14', '几行字') - 0.3, { g: 0.18 }); sfx('tick', T('o15', '不对') - 0.4, { g: 0.2 });

  // ── 思维链 ──
  const gx = X0 + MAXW - 520, gy = R2 + LH;
  const g1 = W.board('<div class="lbl"><b>思维链</b>　先写推理，再给答案</div>', gx, gy, 140, 0, -60);
  g1.dataset.gloss = '思维链';
  const g2 = W.board('<div class="lbl">Chain of Thought · CoT</div>', gx, gy, 140, 0, 2);
  const g3 = W.board('<div class="lbl s g">Google Research，2022 年 1 月</div>', gx, gy, 140, 0, 66);
  const gOff = (t) => 1 - ramp(t, T('o14') - 0.4, 0.4);
  fade(W, g1, (t) => ramp(t, T('o12', '思维链') - 0.1, 0.4) * gOff(t));
  fade(W, g2, (t) => ramp(t, T('o13', 'Chain') - 0.1, 0.4) * gOff(t));
  fade(W, g3, (t) => ramp(t, T('o13b', '谷歌') - 0.1, 0.4) * gOff(t));
  // 两个问题：先圈第二段的过程与答案，再圈第三段开头的答案与最后一步
  rect(W, S, X0 - 18, R2 + LH - 58, MAXW + 36, 5 * LH + 116, (t) => ramp(t, T('o14', '几行字') - 0.3, 0.4) * (1 - ramp(t, T('o15') - 0.2, 0.4)));
  rectOf(W, S, P2, P2.length - 4, P2.length - 1, (t) => ramp(t, T('o14', '算对') - 0.3, 0.4) * (1 - ramp(t, T('o15') - 0.2, 0.4)));
  rectOf(W, S, P3, 2, 5, (t) => ramp(t, T('o15', '不对') - 0.4, 0.4) * (1 - ramp(t, T('o16') - 0.2, 0.4)), 'e');
  rectOf(W, S, P3, P3.length - 4, P3.length - 1, (t) => ramp(t, T('o15', '不对') - 0.4, 0.4) * (1 - ramp(t, T('o16') - 0.2, 0.4)), 'e');

  // ── 片名：印在纸上；镜头抬成正俯视。片名淡去后只剩一片纸，硬切到 01 的开头（同样的横格位置） ──
  const TC = blankCam(X0 + 900, -1640);
  const tt = T('oT') - 0.1;
  const tc = W.print('<div class="title-cot" style="transform:translate(-50%,-50%)">CoT</div>', TC.cx, TC.cy - 70);
  const tr_ = seg(S, ''); tr_.set([TC.cx - 66, TC.cy + 46, 0.6], [TC.cx + 66, TC.cy + 46, 0.6]);
  const tz = W.print('<div class="title-zh" style="transform:translate(-50%,-50%)">先思考，再回答</div>', TC.cx, TC.cy + 120);
  const tOut = (t) => 1 - ramp(t, s.end - 0.15, 0.45);
  fade(W, tc, (t) => ramp(t, tt, 0.7) * tOut(t));
  fade(W, tr_.e, (t) => ramp(t, tt + 0.3, 0.5) * tOut(t));
  fade(W, tz, (t) => ramp(t, tt + 0.45, 0.7) * tOut(t));

  // ── 镜头 ──
  const hold = (a, b) => Math.max(0.5, b - a);
  W.cam([
    [0, { cx: X0 + 330, cy: R1, cz: 20, pitch: 30, yaw: -34, k: 1.5 }, 0.01],
    [0.2, { cx: X0 + 380, cy: R1 - 10, cz: 20, pitch: 56, yaw: -12, k: 1.28 }, 5.6, (k) => smooth(k)],
    [T('o2') - 0.3, { cx: X0 + 560, cy: R1 + 40, cz: 20, pitch: 50, yaw: -6, k: 1.0 }, 1.8],
    [null, { cx: X0 + 620, cy: R1 + 50, cz: 20, pitch: 50, yaw: -2, k: 1.0 }, Math.max(0.5, T('o4') - 0.5 - (T('o2') + 1.6)), (k) => k],
    [T('o4') - 0.4, { cx: X0 + 540, cy: R1 + 100, cz: 10, pitch: 44, yaw: -3, k: 1.0 }, 1.4],
    [null, { cx: X0 + 560, cy: R1 + 104, pitch: 45, yaw: 0, k: 0.99 }, hold(T('o4') + 1.1, T('o6') - 0.6), (k) => k],
    // 第二段：跟着写下去
    [T('o6') - 0.5, { cx: X0 + 600, cy: R2 + 80, cz: 0, pitch: 42, yaw: -6, k: 0.94 }, 1.4],
    [null, { cx: X0 + 620, cy: R2 + 6 * LH - 40, pitch: 40, yaw: -3, k: 0.92 }, hold(T('o6') + 1.0, Tend('o6') + 0.1), (k) => smooth(k)],
    [T('o7') - 0.2, { cx: X0 + 600, cy: R2 + 4 * LH, pitch: 40, yaw: 0, k: 0.92 }, 1.0],
    // 第三段：先看第一行的答案，再跟着过程往下
    [T('o8') - 0.4, { cx: X0 + 560, cy: R3 + 60, pitch: 44, yaw: -6, k: 0.92 }, 1.4],
    [T('o8', '再补过程'), { cx: X0 + 600, cy: R3 + 4 * LH, pitch: 42, yaw: -4, k: 0.96 }, hold(T('o8', '再补过程'), T('o9') + 0.8), (k) => smooth(k)],
    [T('o10') + 0.4, { cx: X0 + 560, cy: R3 + 3 * LH, cz: 40, pitch: 40, yaw: -12, k: 0.86 }, 1.8],
    [null, { cx: X0 + 580, cy: R3 + 3 * LH, cz: 40, pitch: 42, yaw: -8, k: 0.86 }, hold(T('o10') + 2.3, T('o11') - 0.8), (k) => k],
    // 退远：三段并排
    [T('o11') - 0.7, { cx: -330, cy: 250, cz: 0, pitch: 24, yaw: 0, k: 0.52 }, 2.0],
    [null, { cx: -330, cy: 260, pitch: 26, yaw: 2, k: 0.52 }, hold(T('o11') + 1.4, T('o12') - 0.3), (k) => k],
    // 思维链：第二段
    [T('o12') - 0.3, { cx: X0 + 820, cy: R2 + 3 * LH, cz: 40, pitch: 42, yaw: -10, k: 0.9 }, 2.0],
    [null, { cx: X0 + 840, cy: R2 + 3 * LH, cz: 40, pitch: 43, yaw: -4, k: 0.9 }, hold(T('o12') + 1.8, T('o14') - 0.4), (k) => k],
    [T('o14') - 0.4, { cx: X0 + 620, cy: R2 + 4 * LH, cz: 0, pitch: 38, yaw: 6, k: 0.84 }, 1.6],
    [T('o15') - 0.3, { cx: X0 + 600, cy: R3 + 3 * LH, cz: 0, pitch: 38, yaw: -6, k: 0.84 }, 1.6],
    // 回到第一段：一块一块
    [T('o16') - 0.3, { cx: XT + 300, cy: R1 - 60, cz: 30, pitch: 60, yaw: -16, k: 1.36 }, 2.2],
    [null, { cx: XT + 320, cy: R1 - 60, cz: 30, pitch: 62, yaw: -10, k: 1.4 }, hold(T('o16') + 2.0, T('oT') - 1.1), (k) => k],
    [T('oT') - 1.1, TC, 1.9],
  ]);
  sfx('whoosh', T('o6') - 0.5, { g: 0.18 }); sfx('whoosh', T('o8') - 0.4, { g: 0.18 }); sfx('whoosh', T('o16') - 0.3, { g: 0.2 }); sfx('whoosh', T('oT') - 1.1, { g: 0.25 });
});
