// 01 一块字的工夫。每个信息都是动作：一块块落下；纸垛从纸上长起来；抽出一片是一层；题目滑进纸垛底部；一层层往上算；
// 算到顶，那一块从顶上落回纸上；数到 96 层；盖子压住（层数固定）；中间结果想跳到下一摞，被挡住；写成字，才从下一摞的底部接上。
// 镜头：看纸上一排字；抬起来看一摞纸的高度；退开看四摞；推近看相邻两摞；新纸上俯看乘积每一位。
// 事实：L3 §3（239|473|089|6）；S3 §3；S4（GPT-3 96 层）；S7；乘积各位的算术见 FACTS a12–a13c。片中不断言模型内部算的具体数字，纸垛里的短线只表示「中间结果」。
scene('pass', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const pulse = (ta, a = 34, d = 0.38) => (t) => a * Math.sin(Math.PI * clamp((t - ta) / d));
  const drop = (x, y, t, z = 220, d = 0.42) => [[t, x, y, z], [t + d * 1.4, x, y, 0]];
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, Math.max(d, 0.4));
  const ANS = ['239', '4<span class="e">73</span>', '089', '6'];

  // ── 纸 A：它写了四块 ──
  const A = W.sheet({ in: [s.start + 0.25, 'r', 1.1], out: [T('a3') - 0.15, 'l', 0.6] });
  const chap = chapterSheet(W, s, '01', '一块字的工夫', T('a1') - 1.0);
  const XA = [-510, -170, 170, 510];
  A.text('25992 × 92138 =', 0, -300, { fs: 96, align: 'c', t0: T('a1') - 0.5 });
  const t1 = T('a1', '一小块');
  const tR = [t1 - 0.05, T('a2', '错答案') + 0.2, T('a2', '三位三位') + 0.1, T('a2', '四块') - 0.35];
  ANS.forEach((a, i) => { A.tok(a, { keys: drop(XA[i], 10, tR[i]), t0: tR[i], w: 300, d: 180, h: 30, fs: 124, bump: i === 1 ? pulse(T('a2', '错答案') - 0.1, 30) : undefined }); sfx('pop', tR[i], { g: 0.2 }); });
  A.cursor(XA[0] - 148, 10, 120, { t0: T('a1') + 0.1, off: off(tR[0] - 0.25, 0.3) });
  A.cursor(XA[3] + 174, 10, 120, { t0: tR[3] + 0.4 });
  A.line([[XA[0] - 150, 118], [XA[0] + 150, 118]], { t0: T('a1', 'token') - 0.2, d: 0.35, w: 5 });
  const gl = A.text('token', XA[0] - 150, 210, { fs: 104, cls: 'b', t0: T('a1', 'token') - 0.1 });
  gl.el.dataset.gloss = 'token';
  A.text('模型一次写出的一小块', gl.x1 + 44, 214, { fs: 66, cls: 'g', t0: T('a1', 'token') + 0.3 });
  A.line([[XA[0] - 150, 300], [XA[3] + 150, 300]], { t0: T('a2', '四块') - 0.25, d: 0.5, w: 5 });
  A.text('一共四块', 0, 372, { fs: 82, cls: 'b', align: 'c', t0: T('a2', '四块') - 0.05 });

  // ── 纸 B：一摞层 ──
  const B = W.sheet({ in: [T('a3') - 0.85, 'r', 1.0], out: [T('a12') - 0.8, 'l', 1.0], w: 2100, h: 1200 });
  const XS = [-480, -160, 160, 480], SY = -80, RW = 270, RD = 180, SL = 150, EQY = 310;
  const tA8 = T('a8'), tP = T('a8', '标点'), tJ = T('a8', '几位'), tB_ = T('a8b') + 0.15;
  const tTop = T('a5b', '最顶上') + 0.2, tDrain = T('a9') - 0.55;
  const t9a = T('a9') + 0.05, t9b = T('a9', '往上') + 0.25, tLost = T('a10', '接着用') + 1.1;
  const t11b = T('a11b', '自己那一趟'), wr = T('a10b', '写成字') + 0.8, wrEnd = T('a11') - 0.35, endF = T('a12') - 1.3;
  const passes = (list) => (t) => list.reduce((v, [a, b, dr]) => Math.max(v, ramp(t, a, b - a, linear) * (1 - ramp(t, dr, 0.8))), 0);
  const fills = [
    [[T('a4', '最底下'), tTop, tDrain], [t9a, t9b, tLost], [t11b - 0.1, t11b + 0.5, endF]],
    [[tA8 + 0.35, tP - 0.05, tDrain], [wr, wrEnd, T('a11') - 0.1], [t11b + 0.15, t11b + 0.75, endF]],
    [[tP + 0.55, tJ - 0.05, tDrain], [t11b + 0.4, t11b + 1.0, endF]],
    [[tJ + 0.55, tB_, tDrain], [t11b + 0.65, t11b + 1.25, endF]],
  ];
  const up0 = [T('a3') + 0.05, tA8 - 0.2, tP - 0.25, tJ - 0.25];
  const sink = (t) => 1 - ramp(t, T('a12') - 1.05, 0.75);
  const ST = XS.map((x, i) => { const fill = passes(fills[i]); const R = B.stack(x, SY, { w: RW, d: RD, n: 96, gap: 7, rise: (t) => ramp(t, up0[i], i ? 0.8 : 1.7, ease.io3) * sink(t), fill }); return R; });
  const H = ST[0].H, S0 = ST[0], x0 = XS[0], fr0 = S0.front, wf = B.wall(fr0 + 3), LZ = 48 * 7;
  sfx('riser', T('a3') + 0.05, { g: 0.12 });
  // 题目（留在纸上）
  B.text('25992 × 92138 =', x0, EQY, { fs: 54, cls: 'g', align: 'c', t0: T('a3') - 0.2, off: (t) => off(T('a12') - 1.0)(t) * (1 - win(t, T('a5') + 0.1, T('a8') - 0.75, 0.3)) });

  // 每一片，代表一层：抽出一片
  const tPl = T('a3b', '每一片') - 0.25, tPb = T('a4') - 0.25, px = x0 + RW + 70;
  B.tok('', { keys: [[tPl, x0, SY, LZ], [tPl + 0.7, px, SY, LZ], [tPb, px, SY, LZ], [tPb + 0.65, x0, SY, LZ]], t0: tPl, w: RW, d: RD, h: 7, cls: 'pl', off: off(tPb + 0.6, 0.12) });
  B.wtext('一片 ＝ 一层', px - RW / 2, SY + RD / 2 + 6, LZ - 130, 88, (t) => win(t, tPl + 0.45, tPb - 0.05, 0.3), 'b');
  sfx('whoosh', tPl, { g: 0.1 });

  // 题目读进去：一块方块滑到纸垛底部，被吃进去
  const tQ = T('a4', '题目') - 0.1, tQe = T('a4', '读进来') + 0.25;
  B.tok('25992 × 92138 =', { keys: [[tQ, x0, EQY, 0], [tQe, x0, fr0 + 48, 0]], t0: tQ, w: 470, d: 84, h: 16, fs: 48, off: off(tQe + 0.02, 0.25) });
  sfx('whoosh', tQ, { g: 0.12 });

  B.wtext('一层接一层往上算', x0 + RW / 2 + 36, fr0 + 3, H * 0.6, 62, (t) => win(t, T('a5') + 0.15, T('a5b') + 0.6, 0.35));
  // 落回纸上：算到顶，这一块从顶上落下来
  const land = (i, ta, d = 1.0) => {
    const x = XS[i];
    B.tok(ANS[i], { keys: [[ta, x, SY, H + 30], [ta + d * 0.35, x, fr0 + 80, H + 30], [ta + d, x, SL, 0]], t0: ta - 0.1, fadeIn: 0.12, w: 236, d: 136, h: 26, fs: 96, off: off(T('a12') - 1.0) });
    sfx('pop', ta + d, { g: 0.22 });
  };
  land(0, tTop, 1.2); land(1, tP - 0.02, 0.85); land(2, tJ - 0.02, 0.85); land(3, tB_ + 0.05, 0.85);

  // 一趟：一道竖线从底量到顶，一粒点跟着上去
  const xR = x0 + RW / 2 + 36, onL = (t) => 1 - ramp(t, tA8 - 0.75, 0.5), t6 = T('a6', '从底到顶') - 0.1;
  B.line([[xR, -2], [xR, -H]], { svg: wf.svg, t0: t6, d: 1.15, w: 6, ease: linear, off: onL });
  B.line([[xR - 16, -H], [xR + 16, -H]], { svg: wf.svg, t0: t6 + 1.1, d: 0.15, w: 6, off: onL });
  const lPass = B.wtext('一趟', xR + 26, fr0 + 3, H * 0.62, 150, (t) => ramp(t, T('a6', '一趟') - 0.35, 0.4) * onL(t), 'b');
  // 层数固定：盖子压下来
  S0.lid(T('a7', '定了') - 0.42, onL);
  B.wtext('层数', xR + 26, fr0 + 3, H * 0.38, 96, (t) => ramp(t, T('a7') - 0.05, 0.35) * onL(t));
  B.wtext('固定', xR + 26 + 172, fr0 + 3, H * 0.38, 96, (t) => ramp(t, T('a7', '定了') - 0.2, 0.35) * onL(t), 'b');
  B.tok('', { keys: [[t6, xR, fr0 + 3, 0], [t6 + 1.15, xR, fr0 + 3, H - 30]], t0: t6, fadeIn: 0.08, w: 44, d: 44, h: 44, cls: 'cube dk', off: off(t6 + 1.25, 0.2) });
  sfx('pop', T('a7', '定了'), { g: 0.34 });

  // 96 层：一层层数上去
  const t7a = T('a7b') + 0.1, t7b = T('a7b', '九十六') + 0.45;
  S0.scan((t) => ramp(t, t7a, t7b - t7a, linear), (t) => win(t, t7a - 0.1, t7b + 0.2, 0.15));
  const gpt = B.text('GPT-3', xR + 26, SL - 44, { fs: 86, t0: T('a7b') + 0.1, off: onL });
  const cnt = B.count(xR + 26, SL + 62, { from: 1, to: 96, t0: t7a, t1: t7b, fs: 124, cls: 'b', suffix: ' 层', off: onL });
  for (let i = 0; i < 12; i++) sfx('key', lerp(t7a, t7b, i / 11), { g: 0.08 });

  // 都只有这一趟
  B.line([[XS[0] - 170, -H - 26], [XS[3] + 170, -H - 26]], { svg: wf.svg, t0: T('a8b', '工夫') - 0.5, d: 0.5, w: 5, off: off(T('a9') + 0.1) });
  const each = B.text('不管难易，都只有这一趟', -60, EQY, { fs: 74, t0: T('a8b', '一趟') - 0.3, off: off(T('a9') + 0.1) });

  // 一趟里，只往上走
  const xU = x0 - RW / 2 - 44, upOff = off(T('a10') - 0.3);
  B.line([[xU, -8], [xU, -H + 40]], { svg: wf.svg, t0: t9a, d: t9b - t9a, w: 8, ease: linear, off: upOff });
  B.line([[xU - 36, -H + 86], [xU, -H + 34], [xU + 36, -H + 86]], { svg: wf.svg, t0: t9b, d: 0.2, w: 8, off: upOff });
  const onlyUp = B.wtext('只往上走', xU - 30 - 4 * 92, fr0 + 3, H * 0.52, 92, (t) => ramp(t, T('a9', '往上') - 0.3, 0.45) * upOff(t), 'b');

  // 中间结果想跳到下一摞：被挡住，掉下去
  const tM = T('a10', '中间结果') - 0.2, tH = T('a10', '接着用') - 0.05, x1 = XS[1], xW = x1 - RW / 2 - 8;
  const chip = (t0, ks, offf) => B.tok('中间结果', { keys: ks, t0, w: 236, d: 96, h: 16, fs: 48, off: offf });
  chip(tM, [[tM, x0, fr0 + 56, H * 0.56], [tH - 0.55, x0 + 40, fr0 + 70, H * 0.72], [tH, xW - 92, fr0 + 70, H * 0.48], [tH + 0.75, xW - 92, fr0 + 70, H * 0.48], [tH + 1.35, x0 + 20, fr0 + 70, H * 0.5]], off(tH + 1.35, 0.3));
  const cx_ = xW, cz_ = H * 0.48;
  B.line([[cx_ - 34, -cz_ - 34], [cx_ + 34, -cz_ + 34]], { svg: wf.svg, t0: tH, d: 0.14, w: 11, color: RED, off: off(T('a10b') - 0.25) });
  B.line([[cx_ + 34, -cz_ - 34], [cx_ - 34, -cz_ + 34]], { svg: wf.svg, t0: tH + 0.16, d: 0.14, w: 11, color: RED, off: off(T('a10b') - 0.25) });
  const nosee = B.text('下一趟看不到', -60, EQY, { fs: 90, cls: 'e', t0: tH + 0.2, off: off(T('a10b') - 0.25) });
  sfx('error', tH, { g: 0.16 });
  // 写成字：落到纸上，再滑到下一摞的底部
  const tZ = T('a10b', '写成字') - 0.3, x1b = x1 + 30;
  B.tok('中间结果', { keys: [[tZ, x1b, EQY, 150], [tZ + 0.35, x1b, EQY, 0], [wr - 0.1, x1b, EQY, 0], [wr + 0.45, x1b, fr0 + 56, 0]], t0: tZ, w: 236, d: 96, h: 16, fs: 48, off: off(wr + 0.5, 0.25) });
  const zi = B.text('写成字，下一趟才接得上', x1b + 150, EQY, { fs: 66, cls: 'b', t0: tZ + 0.1, off: off(T('a11') - 0.15) });
  sfx('pop', tZ + 0.35, { g: 0.24 }); sfx('whoosh', wr - 0.1, { g: 0.1 });

  // 四块全是答案；中间结果 0 块；每一块只靠自己
  const tQ2 = T('a11', '答案本身') - 0.3;
  B.line([[XS[0] - 130, SL + 86], [XS[3] + 130, SL + 86]], { t0: tQ2, d: 0.55, w: 6, off: off(T('a12') - 1.1) });
  const ans4 = B.text('四块全是答案', -60, EQY, { fs: 86, cls: 'b', t0: tQ2 + 0.2, off: off(T('a12') - 1.1) });
  const t0ms = T('a11b', '一块也没写') - 0.3;
  B.rect(-60, EQY + 76, 500, EQY + 206, { t0: t0ms, d: 0.5, color: GRAY, dash: '16 12', off: off(T('a12') - 1.1) });
  const zero = B.text('中间结果：0 块', -28, EQY + 141, { fs: 76, cls: 'e', t0: t0ms + 0.3, off: off(T('a12') - 1.1) });

  // ── 纸 C：乘积的每一位 ──
  const C = W.sheet({ in: [T('a12') - 0.8, 'r', 1.0], out: [s.end - 0.95, 'l', 0.9] });
  const DW = 142, X0 = -640, PY = -130, DIG = '2394730896', xc = [...Array(10)].map((_, i) => X0 + i * DW);
  const f1 = C.text('25992', -360, -405, { fs: 84, type: [T('a12') - 0.6, T('a12') - 0.55] }), f2 = C.text('92138', 110, -405, { fs: 84, type: [T('a12') - 0.6, T('a12') - 0.55] });
  C.text('×', 0, -405, { fs: 76, align: 'c', t0: T('a12') - 0.6 });
  const tw = T('a12', '从左往右') - 0.2, tH0 = T('a12', '开头几位') - 0.1, tTa = T('a12b', '末尾几位') - 0.1;
  xc.forEach((x, i) => { const ta = lerp(tw, tH0 - 0.1, i / 9); C.tok(i === 4 || i === 5 ? `<span class="e">${DIG[i]}</span>` : DIG[i], { keys: drop(x, PY, ta, 110, 0.24), t0: ta, w: 126, d: 140, h: 22, fs: 98, bump: i < 4 ? pulse(T('a12', '只看') + 0.5 + i * 0.1, 20) : (i > 5 ? pulse(T('a12b', '只看') + 0.5 + (i - 6) * 0.1, 20) : pulse(T('a13', '最难') - 0.1, 26)) }); sfx('key', ta, { g: 0.12 }); });
  C.arrow([[xc[0], PY - 120], [xc[9], PY - 120]], { t0: tw, d: tH0 - tw, w: 5, color: GRAY, off: off(T('a13') - 0.3) });
  C.text('从左往右写', xc[0] - 60, PY - 168, { fs: 54, cls: 'g', t0: tw, off: off(T('a13') - 0.3) });
  const hlOff = off(T('a14') - 0.75, 0.4);
  const mark = (f, a, b, ta, off_) => { const [x_, y_] = f.span(a, b); C.hl(x_ - 6, -456, y_ + 6, -354, { t0: ta, d: 0.35, off: off_ }); };
  const tOn1 = T('a12', '只看') - 0.2, tOn2 = T('a12b', '只看') - 0.2;
  mark(f1, 0, 3, tOn1, off(tOn2 - 0.2)); mark(f2, 0, 3, tOn1 + 0.15, off(tOn2 - 0.2));
  mark(f1, 1, 4, tOn2, off(T('a13') - 0.2)); mark(f2, 1, 4, tOn2 + 0.15, off(T('a13') - 0.2));
  C.hl(xc[0] - 70, PY - 84, xc[3] + 70, PY + 84, { t0: tOn1 + 0.5, off: hlOff });
  C.hl(xc[6] - 70, PY - 84, xc[9] + 70, PY + 84, { t0: tOn2 + 0.5, off: hlOff });
  C.text('开头几位：只看两个数的开头', xc[0] - 64, PY + 138, { fs: 50, t0: tOn1 + 0.3, off: off(T('a13') - 0.35) });
  C.text('末尾几位：只看两个数的末尾', xc[9] + 64, PY + 138, { fs: 50, align: 'r', t0: tOn2 + 0.3, off: off(T('a13') - 0.35) });
  // 中间几位：各部分乘出来的数，一行行滑进来，全压在这两位上
  const tR5 = T('a13', '各部分') - 0.1, RY0 = PY + 170;
  for (let j = 0; j < 5; j++) { const xr = xc[9] + 60 - j * DW, wd = 5.6 * DW, ta = tR5 + j * 0.24; C.tok('', { keys: [[ta, xr - wd / 2 + 1500, RY0 + j * 62, 0], [ta + 0.42, xr - wd / 2, RY0 + j * 62, 0]], t0: ta, w: wd, d: 44, h: 8, cls: 'cube', off: hlOff }); sfx('whoosh', ta, { g: 0.05 }); }
  const mx0 = xc[4] - 76, mx1 = xc[5] + 76;
  C.hl(mx0, PY - 88, mx1, RY0 + 4 * 62 + 32, { t0: T('a13', '加起来') - 0.2, d: 0.55, off: off(T('a13c') - 0.35, 0.35) });
  C.rect(mx0, PY - 88, mx1, PY + 88, { t0: T('a13', '加起来') - 0.2, d: 0.55, w: 5, off: off(T('a13c') - 0.35, 0.35) });
  const lSum = C.text('各部分乘出来的数，都要加到这两位上', 0, RY0 + 4 * 62 + 96, { fs: 60, align: 'c', t0: T('a13', '加起来') + 0.2, off: off(T('a13c') - 0.35, 0.35) });
  // 进位：一粒点从最右一位起，一跳一跳到中间
  const tCr = T('a13b', '进位') - 0.15, hop = 0.42, ks = [[tCr, xc[9], PY - 108, 0]];
  for (let i = 0; i < 4; i++) { const ta = tCr + i * hop, x_ = xc[9 - i], xn = xc[8 - i]; ks.push([ta + hop * 0.5, (x_ + xn) / 2, PY - 108, 36], [ta + hop, xn, PY - 108, 0]); sfx('tick', ta + hop, { g: 0.14 }); }
  C.tok('', { keys: ks, t0: tCr - 0.1, w: 52, d: 52, h: 12, cls: 'cube dk', off: off(T('a13c') - 0.2, 0.3) });
  C.text('进位，一位一位传过来', xc[9] + 64, PY - 190, { fs: 58, cls: 'b', align: 'r', t0: tCr - 0.2, off: off(T('a13c') - 0.2, 0.3) });
  // 这些都得在写这一块的那一趟里算完
  const tC3 = T('a13c', '四七三') - 0.3;
  C.rect(xc[3] - 76, PY - 96, xc[5] + 76, PY + 96, { t0: tC3, d: 0.55, w: 9, off: hlOff });
  const lOne = C.text('这些，都挤在写这一块的那一趟里', -20, PY - 158, { fs: 62, cls: 'b', align: 'c', t0: tC3 + 0.5, off: hlOff });

  // ── 同一张纸：题目越长，要走的步数超出一趟能走的 ──
  const a15off = off(T('a15') - 0.25, 0.4), BX = -300, LIM = 620, Y1 = 130, Y2 = 240, H_ = 48, tGrow = T('a14', '题目越长') - 0.1, tOver = T('a14b', '超出') - 0.3;
  C.text('要走的步数', BX - 36, Y1, { fs: 60, align: 'r', t0: T('a14') + 0.05, off: a15off });
  C.text('一趟能走的步数', BX - 36, Y2, { fs: 60, cls: 'g', align: 'r', t0: T('a14') + 0.5, off: a15off });
  C.bar(BX, Y2, LIM, H_, { t0: T('a14') + 0.55, d: 0.9, color: '#b4bac2', flat: true, off: a15off });
  C.bar(BX, Y1, LIM, H_, { t0: tGrow, d: tOver - tGrow, ease: linear, flat: true, color: '#565c65', off: a15off });
  C.bar(BX + LIM, Y1, 400, H_, { t0: tOver, d: 1.3, color: RED, ease: linear, flat: true, off: a15off });
  C.arrow([[BX, 310], [BX + 1060, 310]], { t0: T('a14') + 0.55, d: 0.7, w: 3, color: GRAY, head: 16, off: a15off });
  C.text('步数（示意）', BX + 1060, 354, { fs: 50, cls: 'g', align: 'r', t0: T('a14') + 1.0, off: a15off });
  sfx('error', T('a14b', '超出') - 0.1, { g: 0.12 });
  // 它错的，正是中间两位：就是这一行上红着的两位
  C.rect(mx0, PY - 92, mx1, PY + 92, { t0: T('a15', '中间') - 0.15, d: 0.7, color: RED, w: 6 });
  sfx('error', T('a15', '中间'), { g: 0.12 });
  C.text('只报答案', 0, 90, { fs: 60, cls: 'g', align: 'c', t0: T('a16') + 0.1 });
  C.text('不是不会算，', 62, 190, { fs: 112, align: 'r', t0: T('a16', '不是') - 0.1, d: 0.5 });
  C.text('是来不及算', 62, 190, { fs: 112, cls: 'b', t0: T('a16', '来不及算') - 0.2, d: 0.55 });

  // ── 正在讲的区域亮起 ──
  A.wash(XA[0] - 190, -110, XA[3] + 190, 140, T('a1', 'token') - 0.4, T('a2', '四块') + 0.3);
  B.wash(XS[0] - 210, fr0 + 10, XS[3] + 210, EQY + 240, T('a11') + 0.3, T('a11') + 2.0);
  B.wash(XS[0] - 210, fr0 + 10, XS[3] + 210, EQY + 240, T('a11b') + 0.2, T('a12') - 1.3);
  C.wash(xc[0] - 110, -470, xc[3] + 110, PY + 180, tOn1, tOn2);
  C.wash(xc[6] - 110, -470, xc[9] + 110, PY + 180, tOn2, T('a13') - 0.3);
  C.wash(xc[0] - 110, PY + 105, xc[9] + 110, RY0 + 4 * 62 + 45, T('a13b') - 0.2, T('a13c') - 0.3);
  C.wash(xc[0] - 110, PY - 115, xc[9] + 110, PY + 115, T('a15') + 0.1, T('a16') - 0.1);

  // ── 镜头 ──
  const shFour = fitCam([...ST.map((q) => q.box), B.p(XS[0] - 560, EQY + 60), B.p(XS[3] + 160, EQY + 230)], { pitch: 42, cz: B.Z + H * 0.3 });
  const shCenter = fitCam([S0.box, B.p(x0 - 720, EQY + 40), B.p(x0 + 720, EQY + 40), B.p(x0, SY, H + 60)], { pitch: 44, cz: B.Z + H * 0.36, kmax: 1.1 });
  W.cam([
    [s.start + 0.02, chap.home(), 1.35, smooth],
    [T('a1') - 1.0, A.home({ cy: 36 }), 1.25, smooth],
    [T('a3') - 0.8, shCenter, 1.25, smooth],
    // 第一块之后才退开看四摞：每一块都是这样一趟
    [T('a8') - 0.75, shFour, 2.0, smooth],
    [T('a12') - 0.8, C.home({ cy: 0 }), 1.25, smooth],
    // 强调：错的正是这两位
    [T('a15') - 0.3, C.home({ cy: -20, k: 1.1 }), 1.6, smooth],
    [s.end - 0.95, HOME, 0.9, smooth],
  ]);
  [T('a3') - 0.8, T('a12') - 0.8, s.end - 0.95].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
  sfx('chime', T('a16', '来不及算'), { g: 0.16 });
});
