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
    (t) => iv(t, T('o6') - 0.6, T('o11') - 0.7),
    () => 0,
  ];
  // 讲到哪一段，另外两段淡下去（F[0..2] 是三段各自的透明度系数）
  const win = (t, a, b) => ramp(t, a, 0.6) * (1 - ramp(t, b, 0.6));
  const F = [
    (t) => 1 - Math.max(0.97 * win(t, T('o6') - 0.6, T('o11') - 0.7), 0.97 * win(t, T('o12') - 0.4, T('o16') - 0.5)),
    (t) => 1 - 0.8 * win(t, T('o16') - 0.3, s.end + 1),
    () => 0,
  ];

  const question = (y, ta, f, tx, parts) => {
    const q = block(S, parts ? '<span class="tx"><span class="qp">25992</span> <span class="qp">× 92138</span> <span class="qp">=</span></span>' : '<span class="tx">25992 × 92138 =</span>', { w: QW, d: QD, h: 30, fs: 52, cls: 'inv' });
    if (parts) [...q.top.querySelectorAll('.qp')].forEach((e, i) => fade(W, e, (t) => ramp(t, parts[i], 0.3)));
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
  const overview = () => 0;   // 三次对照改在另一张对照图上讲，原文三段不再缩小成全景
  const bigM = [];
  const margin = (txt, y, ta, f) => {
    const e = W.board(`<div class="lbl l k" style="transform:translate(-100%,-50%)">${txt}</div>`, X0 - 50, y, 0, 0, 0); fade(W, e, (t) => ramp(t, ta, 0.5) * f(t) * (1 - overview(t)) * (1 - ramp(t, T('o16') - 0.7, 0.4)));
    const big = W.board(`<div class="lbl xl" style="transform:translate(-100%,-50%)">${txt}</div>`, X0 - 60, y, 0, 0, 0);
    const i = bigM.length; fade(W, big, (t) => overview(t) * ramp(t, T('o11') - 0.1 + i * 0.45, 0.4) * (1 - ramp(t, T('o16') - 0.8, 0.3))); bigM.push(big);
    return e;
  };

  // ── 第一次：只报答案 ──
  question(R1, 0.35, F[0], TX[0], [0.5, T('o1', '乘以') - 0.1, T('o1', '等于') - 0.1]);
  sfx('pop', 0.45, { g: 0.3 });
  // 估个大概：十个空位，只填得出头两位
  const slots = [], SW = 70;
  const estOff = (t) => 1 - ramp(t, T('o3') + 0.3, 0.5);
  const qm = W.board('<div class="lbl xl k">？</div>', X0 + QW + 10, R1, 40, 0, -110); fade(W, qm, (t) => ramp(t, T('o1', '等于多少') - 0.1, 0.3) * (1 - ramp(t, T('o2') + 0.1, 0.4)));
  for (let i = 0; i < 10; i++) {
    const b = block(S, i < 2 ? `<span class="tx">${'23'[i]}</span>` : '', { w: 60, d: 76, h: i < 2 ? 22 : 8, fs: 50, cls: i < 2 ? 'inv' : 'cube dk' });
    const ta = Tend('o1') + 0.1 + i * 0.1, tb = T('o2', '二十三亿') - 0.15 + i * 0.14;
    if (i < 2) place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 40 * (1 - ramp(t, tb, 0.3, ease.out3)), o: ramp(t, tb, 0.2) * estOff(t) }));
    else place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 0, o: ramp(t, ta, 0.25) * estOff(t) }));
    slots.push(b);
  }
  [0, 1].forEach((i) => { const b = block(S, '', { w: 60, d: 76, h: 8, cls: 'cube dk' }); place(W, b.g, (t) => ({ x: XT + 50 + i * SW, y: R1, z: 0, o: ramp(t, Tend('o1') + 0.1 + i * 0.1, 0.25) * (1 - ramp(t, T('o2', '二十三亿') - 0.15 + i * 0.14, 0.2)) })); });
  sfx('tick', T('o2', '二十三亿') - 0.15, { g: 0.2 });
  const est = W.board('<div class="lbl l k">估一估：二十三亿多</div>', XT + 50 + 10 * SW + 20, R1, 30, 0, -40);
  fade(W, est, (t) => ramp(t, T('o2', '二十三亿') - 0.3, 0.4) * estOff(t));
  const mg1 = margin('只报答案', R1, T('o3', '报答案') - 0.3, F[0]);
  // 思考模式：关（两次都关着；03 章才打开）
  const offTag = (y, ta, f) => { const e = W.board('<div class="lbl k" style="transform:translate(-100%,-50%)">思考模式：关</div>', X0 - 50, y, 0, 0, 104); fade(W, e, (t) => ramp(t, ta, 0.4) * f(t) * (1 - ramp(t, T('o16') - 0.7, 0.4))); return e; };
  const off1 = offTag(R1, T('o3', '思考模式') - 0.2, F[0]);
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
  const DW = 48, CX0 = XT + 20, CY1 = R1 + 104, CY2 = R1 + 172;
  const cmpOff = (t) => 1 - ramp(t, T('o16') - 0.7, 0.4);   // 讲「一块一块往下写」时收走逐位比对
  const ANS = '2394730896', OK = '2394850896';
  [...ANS].forEach((c, i) => { const e = W.print(`<div class="digits m${i === 4 || i === 5 ? ' err' : ''}">${c}</div>`, CX0 + i * DW, CY1 - 34); fade(W, e, (t) => ramp(t, T('o4', '十位数') - 0.2 + i * 0.05, 0.3) * F[0](t) * TX[0](t) * cmpOff(t)); });
  [...OK].forEach((c, i) => { const e = W.print(`<div class="digits m g">${c}</div>`, CX0 + i * DW, CY2 - 34); fade(W, e, (t) => ramp(t, T('o4', '十位数') + 0.4 + i * 0.05, 0.3) * F[0](t) * TX[0](t) * cmpOff(t)); });
  const lab = W.print('<div class="lbl">正确的乘积</div>', CX0 + 10 * DW + 30, CY2 - 22); fade(W, lab, (t) => ramp(t, T('o4', '十位数') + 0.6, 0.4) * F[0](t) * TX[0](t) * cmpOff(t));
  const under = (a, b, ta, cls) => { const e = seg(S, cls); e.set([CX0 + a * DW + 4, CY2 + 42, 0.8], [CX0 + b * DW - 6, CY2 + 42, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.4) * F[0](t) * cmpOff(t)); };
  under(0, 4, T('o4', '前四位'), 'w'); under(6, 10, T('o4', '后四位'), 'w');
  [[1.5, '前四位对', T('o4', '前四位') - 0.2], [8.5, '后四位对', T('o4', '后四位') - 0.2]].forEach(([c, txt, ta]) => {
    const e = W.print(`<div class="lbl l k" style="transform:translateX(-50%)">${txt}</div>`, CX0 + c * DW, CY2 + 70);
    fade(W, e, (t) => ramp(t, ta, 0.4) * F[0](t) * TX[0](t) * cmpOff(t) * (1 - ramp(t, T('o5', '两位') - 0.7, 0.3)));
  });
  rect(W, S, CX0 + 4 * DW - 8, CY1 - 44, 2 * DW + 12, CY2 - CY1 + 92, (t) => ramp(t, T('o5') - 0.1, 0.3) * F[0](t) * cmpOff(t), 'e');
  const r85 = W.board('<div class="lbl k"><span class="err">73</span>　应为 85</div>', CX0 + 4 * DW, CY2 + 60, 0, 0, 10); fade(W, r85, (t) => ramp(t, T('o5', '两位') - 0.2, 0.3) * F[0](t) * TX[0](t) * cmpOff(t));
  sfx('tick', T('o5', '中间'), { g: 0.3 });

  // ── 第二次：先写算式，最后写答案（原文 321 块，这里画出骨架） ──
  question(R2, T('o6') + 0.2, F[1], TX[1]);
  const mg2 = margin('先写过程', R2, T('o6', '先写') - 0.2, F[1]);
  const off2 = offTag(R2, T('o6', '还是关着') - 0.2, F[1]);
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
  write(P2, T('o6', '提问里') - 0.1, T('o7') + 0.4, F[1]);
  textFade(P2, TX[1]);
  const ans2 = P2.slice(-4);
  const ck2 = h('div', 'p3 chk2 big', S); ck2.style.transform = `translate3d(${ans2[3].x1 + 40}px, ${ans2[3].y - 26}px, 1px) rotate(40deg)`;
  fade(W, ck2, (t) => ramp(t, T('o7', '对') - 0.2, 0.3) * F[1](t));
  sfx('chime', T('o7', '对'), { g: 0.25 });

  // ── 三次对照：在纸上另画一张对照图。每次回答是一行大块（题目、过程、答案），说到「过程写没写」「写在答案前还是后」时逐项标出 ──
  // 思维链与两个问题都在这张图上讲：不把三段原文缩成看不清的全景
  const KX = X0 + 3100, KY = R2 + 260 + 170, KG = 340;   // 两行：只报答案、先写过程
  const kT = (i) => T('o11') - 0.1 + i * 0.4;
  const kOff = (t) => 1 - ramp(t, T('o16') - 0.7, 0.4);
  const kb = (txt, x, y, w, i, cls) => { const b = block(S, txt, { w, d: 120, h: 30, fs: 54, cls }); place(W, b.g, (t) => ({ x: x + w / 2, y, z: 40 * (1 - ramp(t, kT(i), 0.4, ease.out3)), o: ramp(t, kT(i), 0.3) * kOff(t) })); return { b, x0: x, x1: x + w, x: x + w / 2, y, w }; };
  const rowsK = [
    ['只报答案', [['题目', 240, ''], ['答案', 300, 'err']]],
    ['先写过程', [['题目', 240, ''], ['过程（三百多块）', 620, 'proc'], ['答案', 300, '']]],
  ];
  const K = rowsK.map(([lab, parts], i) => {
    const y = KY + (i - 1) * KG; let x = KX;
    const segs = parts.map(([txt, w, cls]) => { const o = kb(txt, x, y, w, i, cls); x += w + 24; return o; });
    const m = W.board(`<div class="lbl l" style="transform:translate(-100%,-50%)">${lab}</div>`, KX - 40, y, 0, 0, 0); fade(W, m, (t) => ramp(t, kT(i), 0.4) * kOff(t));
    sfx('pop', kT(i), { g: 0.2 });
    return { y, segs, m };
  });
  const kOK = h('div', 'p3 chk2 big', S); kOK.style.transform = `translate3d(${K[1].segs[2].x1 + 40}px, ${K[1].y - 26}px, 1px) rotate(40deg)`;
  fade(W, kOK, (t) => ramp(t, kT(1) + 0.3, 0.3) * kOff(t));
  // 过程写没写：第一行该有过程的地方是空的
  const kGap = rect(W, S, K[0].segs[1].x1 + 24, K[0].y - 60, 620, 120, (t) => ramp(t, T('o11b', '有没有') - 0.4, 0.4) * kOff(t), 'dash');
  const kNo = W.board('<div class="lbl k" style="transform:translateX(-50%)">没写过程</div>', K[0].segs[1].x1 + 24 + 310, K[0].y, 0, 0, -22);
  fade(W, kNo, (t) => ramp(t, T('o11b', '有没有') - 0.4, 0.4) * kOff(t));
  // 写在答案前还是后：第二、三行标出「先」「后」
  // 答案之前：第二行的过程标出「答案之前」
  const before = W.board('<div class="lbl l k" style="transform:translate(-50%,-100%)">答案之前</div>', K[1].segs[1].x, K[1].y - 60, 30, 0, -8);
  fade(W, before, (t) => ramp(t, T('o11b') + 0.3, 0.4) * (1 - ramp(t, T('o12') - 0.3, 0.4)));
  sfx('tick', T('o11b', '答案之前') - 0.3, { g: 0.2 }); sfx('tick', T('o11b', '有没有') - 0.4, { g: 0.2 });
  // 思维链：第二行
  const kRow = (r, fn, cls) => rect(W, S, KX - 20, K[r].y - 80, K[r].segs[K[r].segs.length - 1].x1 - KX + 40, 160, fn, cls);
  kRow(1, (t) => ramp(t, T('o12', '思维链') - 0.3, 0.4) * (1 - ramp(t, T('o14') - 0.4, 0.4)), '');
  const gx = KX, gy = K[0].y - 470;   // 注解放在对照图上方，三行各占一行
  const g1 = W.board('<div class="lbl l"><b>思维链</b>　先写推理，再给答案</div>', gx, gy, 0, 0, 0);
  g1.dataset.gloss = '思维链';
  const g2 = W.board('<div class="lbl l k">Chain of Thought · CoT</div>', gx, gy, 0, 0, 92);
  const g3 = W.board('<div class="lbl k">Google Research，2022 年 1 月</div>', gx, gy, 0, 0, 176);
  const gOff = (t) => 1 - ramp(t, T('o14') - 0.4, 0.4);
  const pR = W.board('<div class="lbl l k">先写推理</div>', K[1].segs[1].x, K[1].y + 70, 0, -120, 10); fade(W, pR, (t) => ramp(t, T('o12', '推理') - 0.3, 0.3) * (1 - ramp(t, T('o12', '思维链') - 0.3, 0.3)));
  const pA = W.board('<div class="lbl l k">再给答案</div>', K[1].segs[2].x, K[1].y + 70, 0, -120, 10); fade(W, pA, (t) => ramp(t, T('o12', '再给答案') - 0.3, 0.3) * (1 - ramp(t, T('o12', '思维链') - 0.3, 0.3)));
  fade(W, g1, (t) => ramp(t, T('o12', '思维链') - 0.1, 0.4) * gOff(t));
  fade(W, g2, (t) => ramp(t, T('o13', 'Chain') - 0.1, 0.4) * gOff(t));
  fade(W, g3, (t) => ramp(t, T('o13b', '谷歌') - 0.1, 0.4) * gOff(t));
  sfx('blip', T('o12', '思维链') - 0.1, { g: 0.2 }); sfx('tick', T('o13', 'Chain') - 0.1, { g: 0.14 }); sfx('tick', T('o13b', '谷歌') - 0.1, { g: 0.14 });
  // 两个问题：先问第二行，再问第三行（第三行的过程最后拱回答案）
  const q1On = (t) => ramp(t, T('o14', '几行字') - 0.3, 0.4) * kOff(t);
  kRow(1, q1On, '');
  const qa1 = W.board('<div class="lbl xl">？</div>', K[1].segs[2].x1 + 110, K[1].y, 40, 0, -70); fade(W, qa1, q1On);
  sfx('tick', T('o14', '几行字') - 0.3, { g: 0.18 });

  // ── 片名：印在纸上；镜头抬成正俯视。片名淡去后只剩一片纸，硬切到 01 的开头（同样的横格位置） ──
  const TC = blankCam(X0 + 900, -1640);
  const tt = T('oT') - 0.1;
  const tc = W.print('<div class="title-cot" style="transform:translate(-50%,-50%)">CoT</div>', TC.cx, TC.cy - 70);
  const tz = W.print('<div class="title-zh" style="transform:translate(-50%,-50%)">先思考，再回答</div>', TC.cx, TC.cy + 120);
  const tOut = (t) => 1 - ramp(t, s.end - 0.15, 0.45);
  fade(W, tc, (t) => ramp(t, tt, 0.7) * tOut(t));
  fade(W, tz, (t) => ramp(t, tt + 0.45, 0.7) * tOut(t));

  // ── 镜头：按内容选镜头，停留时不动 ──
  // 开场从正俯视的空纸倾下来看这道题｜第一次回答、估算与逐位比对在同一个固定画面里｜第二、三次各一镜框住整段，看它写满｜
  // 第三次「加回开头那个数」转斜俯看那道拱回去的弧｜三次对照、思维链与两个问题在一张对照图上讲（一镜不动）｜「一块一块往下写」近看那四块
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const Q = (y) => B(X0 + QW / 2, y, QW, QD, 30);
  const tok = (P, f) => P.filter(f).map((k) => B(k.x, k.y, k.w, k.d, 20));
  const sh1 = fitCam(W, [Q(R1), ...A1.map((o) => B(o.x, R1, 150, QD, 30)), [CX0, CY2 + 60, 0], [CX0 + 10 * DW + 260, CY2 + 60, 0], { el: mg1 }, { el: off1 }, { el: est }], { pitch: 46, yaw: -6 });
  const sh2 = fitCam(W, [Q(R2), ...tok(P2, () => true), { el: mg2 }, { el: off2 }, [ans2[3].x1 + 90, ans2[3].y, 0]], { pitch: 38 });
  const card = [...K.flatMap((r) => r.segs.map((o) => B(o.x, o.y, o.w, 120, 30))), ...K.map((r) => ({ el: r.m })), { el: g1 }, { el: g2 }, { el: g3 }, { el: qa1 }, { el: kNo }, { el: before }];
  const shCard = fitCam(W, card, { pitch: 30, yaw: -3 });
  const sh4 = fitCam(W, [Q(R1), ...A1.map((o) => B(o.x, R1, 150, QD, 30))], { pitch: 62, yaw: -10, kmax: 1.5 });
  const TOP = { cx: X0 + 380, cy: 92 + 96 * Math.round((R1 - 92) / 96), cz: 0, pitch: 0, yaw: 0, k: 1 };
  W.cam([
    [0, TOP, 0.01],
    [0.6, sh1, 4.2, ease.io3],                         // 开场：从正俯视的纸面慢慢倾下来，看清这道题
    [T('o6') - 0.6, sh2, 1.3],
    [T('o11') - 0.7, shCard, 1.7],
    [T('o16') - 0.5, sh4, 1.6],
    [T('oT') - 1.1, TC, 1.9],
  ]);
  sfx('whoosh', T('o6') - 0.5, { g: 0.18 }); sfx('whoosh', T('o16') - 0.3, { g: 0.2 }); sfx('whoosh', T('oT') - 1.1, { g: 0.25 });
});
