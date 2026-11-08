// 01 一块字的工夫：一块 token 是怎样写出来的。
// 纸面上一行：题目、四个空位。每个空位后面立起一摞纸（一张代表一层；GPT-3 是 96 层，就画 96 张），
// 从下往上一张张算到顶，算到顶得出的那一块落进空位——这就是一趟。一趟里的结果只往上走；要交给下一趟，只能写成字落回纸面。
// 事实：L3 §3（错答案四块 239|473|089|6）；S3 §3（逐层堆叠、每层取上一层的输出、自回归、只看前面）；S4（GPT-3 96 层）；
// S7（不写中间步骤时，一步接一步的计算受层数限制）；S5（题目变长，层数固定的模型直接作答有上限）；乘积开头几位由两数开头决定、末尾几位由两数末尾决定、中间几位要把各部分乘积相加并承接进位（数学，见 FACTS a12–a13c）。
scene('pass', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const XS = [-20, 160, 340, 520];                 // 四个空位的 x
  const YB = 0, YR = -150;                         // 方块那一行、纸摞那一行的 y
  const BW = 150, BD = 100;                        // 方块与纸摞的占地
  const NP = 96, GAP = 5, H = NP * GAP;            // 画 96 张（一张一层），间距 5，高 480
  const QX = -420, QW = 640;                       // 题目那一条

  // ── 章名印在纸上：镜头从正上方开始，倾下来，滑到那一行 ──
  const t0 = s.start + 0.45;
  const CX = -1500, CY = 900;                     // 章名印在镜头前方的纸面上，离那一行和远处两行都远
  const cn = W.print('01', CX, CY - 90, 'chap-no');
  const ct = W.print('一块字的工夫', CX, CY, 'chap-ti');
  const cr = seg(S, ''); cr.set([CX, CY - 14, 0.6], [CX + 130, CY - 14, 0.6]);
  const chapOut = (t) => 1 - ramp(t, T('a2'), 0.8);
  fade(W, cn, (t) => ramp(t, t0 + 0.1, 0.5) * chapOut(t));
  fade(W, cr.e, (t) => ramp(t, t0 + 0.25, 0.4) * chapOut(t));
  fade(W, ct, (t) => ramp(t, t0 + 0.35, 0.6) * chapOut(t));

  // ── 远处：开头另外两次回答写下的那两行（淡），纸上不空 ──
  const farRow = (y, lines, op) => {
    lines.forEach((ln, li) => {
      const chunks = ln.match(/.{1,3}/g); let x = -700;
      chunks.forEach((c) => { const w = 34 * c.length + 30; const b = block(S, '', { w, d: 70, h: 18, cls: 'dim' }); const bar = h('div', 'scrib', b.top); css(bar, { width: (w - 34) + 'px' }); b.g.style.transform = `translate3d(${x + w / 2}px, ${y + li * 110}px, 0px)`; fade(W, b.g, (t) => op * (1 - ramp(t, T('a3') - 0.4, 0.6))); x += w + 10; });
    });
  };

  // ── 题目与四个空位 ──
  const q = block(S, '<span class="tx">25992 × 92138 =</span>', { w: QW, d: BD, h: 30, fs: 52 });
  q.g.style.transform = `translate3d(${QX}px, ${YB}px, 0px)`;
  twoFace(W, q, '25992 × 92138 =', 34);
  cast(q.g, QW * 1.08, BD * 1.5);
  XS.forEach((x) => { const e = seg(S, 'g'); e.set([x - BW / 2, YB + BD / 2 + 8, 0.6], [x + BW / 2, YB + BD / 2 + 8, 0.6]); fade(W, e.e, (t) => 0.8 * ramp(t, c0, 0.5)); });

  // 开头的四块（复述）：a1 里依次落下，a3 前收走；下面再一块一块慢慢写
  const ANS = ['239', '473', '089', '6'];
  ANS.forEach((txt, i) => {
    const b = block(S, txt, { w: BW, d: BD, h: 30, fs: 58, cls: i === 1 ? 'err' : '' });
    glow(W, b, (t) => ramp(t, T('a2', '三位三位') - 0.1 + i * 0.22, 0.2) * (1 - ramp(t, T('a2', '四块') - 0.2, 0.3)));
    if (i === 1) inkTop(W, b, txt, (t) => ramp(t, T('a2', '错答案') - 0.2, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)), 'e');
    const ta = T('a1', '一小块') + i * 0.2;
    place(W, b.g, (t) => ({ x: XS[i], y: YB, z: 70 * (1 - ramp(t, ta, 0.45, ease.out3)), o: ramp(t, ta, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)) }));
  });
  sfx('pop', T('a1', '一小块'), { g: 0.3 });
  const slot0 = seg(S, 'w'); slot0.set([XS[0] - BW / 2, YB + BD / 2 + 8, 0.8], [XS[0] + BW / 2, YB + BD / 2 + 8, 0.8]);
  fade(W, slot0.e, (t) => ramp(t, T('a4') + 0.1, 0.4) * (1 - ramp(t, T('a5b', '最顶上'), 0.5)));
  rect(W, S, QX - QW / 2 - 12, YB - BD / 2 - 12, QW + 24, BD + 24, (t) => ramp(t, T('a4', '题目') - 0.2, 0.4) * (1 - ramp(t, T('a5') - 0.2, 0.5)));
  const gl = W.board('<div class="lbl k"><b>token</b></div>', XS[0] - BW / 2, YB + BD / 2 + 30, 0, 0, 0);
  const glD = W.board('<div class="lbl k">模型一次写出的一小块</div>', XS[0] - BW / 2 + 190, YB + BD / 2 + 30, 0, 0, 0);
  gl.dataset.gloss = 'token';
  rect(W, S, XS[0] - BW / 2 - 12, YB - BD / 2 - 12, BW + 24, BD + 24, (t) => ramp(t, T('a1', 'token') - 0.3, 0.4) * (1 - ramp(t, T('a2', '四块') - 0.3, 0.4)));
  fade(W, gl, (t) => ramp(t, T('a1', 'token') - 0.1, 0.4) * (1 - ramp(t, T('a3') - 0.4, 0.4)));
  fade(W, glD, (t) => ramp(t, T('a1', '一小块') - 0.1, 0.4) * (1 - ramp(t, T('a3') - 0.4, 0.4)));
  const tri = W.board('<div class="lbl l k" style="transform:translateX(-50%)">三位三位写</div>', (XS[0] + XS[3]) / 2, YB, 40, 0, -110);
  fade(W, tri, (t) => ramp(t, T('a2', '三位三位') - 0.2, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)));
  const four = W.board('<div class="lbl g">四块</div>', XS[3] + 110, YB, 40, 0, -20);
  fade(W, four, (t) => ramp(t, T('a2', '四块') - 0.1, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)));

  // ── 四摞：起来、从下往上算、到顶得出一块、落进空位 ──
  const plan = [
    { up: T('a3') + 0.1, a: T('a4', '最底下'), b: T('a5b', '最顶上') + 0.2 },
    { up: T('a8') - 0.1, a: T('a8') + 0.3, b: T('a8', '标点') },
    { up: T('a8', '标点') - 0.3, a: T('a8', '标点'), b: T('a8', '几位') },
    { up: T('a8', '几位') - 0.3, a: T('a8', '几位'), b: T('a8b') + 0.1 },
  ];
  const inkOn = (t) => (t >= T('a11', '四块') - 0.2 && t < Tend('a11b') + 0.3 ? 1 : 0);
  plan.forEach((p, i) => ream(W, S, XS[i], YR, { w: BW, d: BD, gap: GAP, n: NP,
    rise: (t) => ramp(t, p.up, i === 0 ? 2.6 : 0.8, i === 0 ? ease.io3 : ease.out3), fill: (t) => ramp(t, p.a, p.b - p.a, (k) => k), ink: inkOn, op: (t) => 1 - ramp(t, T('a15') - 0.7, 0.5) }));
  const outs = plan.map((p, i) => {
    const b = block(S, `<span class="tx">${ANS[i]}</span>`, { w: BW, d: BD, h: 30, fs: 58, cls: i === 1 ? 'err' : '' });
    twoFace(W, b, ANS[i], 34);
    place(W, b.g, (t) => {
      const k = ramp(t, p.b + 0.1, 0.7, ease.io3);
      return { x: XS[i], y: lerp(YR, YB, k), z: lerp(H + 40, 0, k) + Math.sin(k * Math.PI) * 50, o: ramp(t, p.b - 0.1, 0.25) };
    });
    sfx('tick', p.b, { g: 0.3 }); sfx('pop', p.b + 1.1, { g: 0.22 });
    return b;
  });

  // ── 每一层都读前面：正在算的那一张，向题目和前面各摞的同一高度各连一道弧 ──
  const wl = wall(S, -900, YR + BD / 2 + 2, 1700, H + 80);
  const arcs = [0, 1, 2, 3].map(() => svg('path', { fill: 'none', stroke: '#1c1c1c', 'stroke-width': 1.6, opacity: 0 }, wl.s));
  W.up((t) => {
    let act = -1;
    plan.forEach((p, i) => { if (t >= p.a && t < p.b) act = i; });
    if (act < 0) { arcs.forEach((a) => a.setAttribute('opacity', 0)); return; }
    const p = plan[act], f = clamp((t - p.a) / (p.b - p.a)), z = f * H;
    const targets = [[QX + QW / 2 - 40, 0], ...XS.slice(0, act).map((x) => [x + BW / 2 - 8, Math.max(0, z - GAP)])];
    arcs.forEach((a, j) => {
      if (j >= targets.length) { a.setAttribute('opacity', 0); return; }
      const x0 = wl.X(XS[act] - BW / 2 + 6), y0 = wl.Y(z), x1 = wl.X(targets[j][0]), y1 = wl.Y(targets[j][1]);
      const lift = Math.min(110, Math.abs(x0 - x1) * 0.22);
      a.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} Q ${((x0 + x1) / 2).toFixed(1)} ${(Math.min(y0, y1) - lift).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
      a.setAttribute('opacity', (0.7 * Math.min(1, f * 10, (1 - f) * 10)).toFixed(3));
    });
  });

  // ── 「一趟」：第一摞右边一条带端点的竖线；「96 层」：刻度与标注 ──
  const dimX = XS[0] + BW / 2 + 22, dimY = YR + BD / 2;
  const dims = [seg(S, ''), seg(S, ''), seg(S, '')];
  W.up((t) => dims[0].set([dimX, dimY, 0], [dimX, dimY, Math.max(1, H * ramp(t, T('a6', '一趟') - 0.6, 1.0))]));   // 「一趟」：括线从下往上画出来 dims[1].set([dimX - 10, dimY, 0], [dimX + 10, dimY, 0]); dims[2].set([dimX - 10, dimY, H], [dimX + 10, dimY, H]);
  const dimOp = (t) => ramp(t, T('a6', '一趟') - 0.5, 0.4) * (1 - ramp(t, T('a8') - 0.2, 0.4));
  dims.forEach((d) => fade(W, d.e, dimOp));
  for (let i = 8; i < NP; i += 8) { const tk = seg(S, 'w'); tk.set([dimX, dimY, i * GAP], [dimX + 14, dimY, i * GAP]); const tt = lerp(T('a7b') - 0.1, T('a7b', '九十六') - 0.2, i / NP); fade(W, tk.e, (t) => ramp(t, tt, 0.25) * (1 - ramp(t, T('a8') - 0.2, 0.4))); }   // 层数：刻度一格格出现
  const lb1 = W.board('<div class="lbl k">一趟</div>', dimX + 16, dimY, H * 0.55, 0, -22);
  fade(W, lb1, dimOp);
  const ud = W.board('<div class="lbl k">从底到顶　↑</div>', XS[0] - BW / 2 - 30, YR, H * 0.5, 0, 0);
  ud.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, ud, (t) => ramp(t, T('a6', '从底到顶') - 0.2, 0.3) * (1 - ramp(t, T('a8') - 0.2, 0.4)));
  const fx = W.board('<div class="lbl k">层数固定</div>', XS[0] - BW / 2 - 30, YR, H * 0.5, 0, 70);
  fx.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, fx, (t) => ramp(t, T('a7', '层数') - 0.1, 0.3) * (1 - ramp(t, T('a8') - 0.2, 0.4)));
  const lb2 = W.board('<div class="lbl k">GPT-3：96 层</div>', dimX + 16, dimY, H * 0.55, 0, 40);
  fade(W, lb2, (t) => ramp(t, T('a7b') + 0.15, 0.4) * (1 - ramp(t, T('a8') - 0.2, 0.4)));

  // ── 「画面上每一片，代表一层」：第 48 片的纸边描深，右边标「一层」 ──
  const LZ = 48 * GAP, lyOn = (t) => ramp(t, T('a3b', '每一片') - 0.2, 0.4) * (1 - ramp(t, T('a4', '最底下') - 0.4, 0.4));
  const lyE = seg(S, 'w'); lyE.set([XS[0] - BW / 2, YR + BD / 2 + 1, LZ], [XS[0] + BW / 2, YR + BD / 2 + 1, LZ]); fade(W, lyE.e, lyOn);
  const lyL = seg(S, ''); lyL.set([XS[0] + BW / 2 + 4, YR + BD / 2 + 1, LZ], [XS[0] + BW / 2 + 60, YR + BD / 2 + 1, LZ]); fade(W, lyL.e, lyOn);
  const layer = W.board('<div class="lbl k">一层</div>', XS[0] + BW / 2 + 70, YR + BD / 2, LZ, 0, -30); fade(W, layer, lyOn);
  sfx('tick', T('a3b', '每一片'), { g: 0.2 });
  const rdq = W.board('<div class="lbl l k" style="transform:translateX(-50%)">读入题目</div>', QX, YB, 30, 0, -140);
  fade(W, rdq, (t) => ramp(t, T('a4') + 0.2, 0.4) * (1 - ramp(t, T('a5b') - 0.2, 0.4)));
  const nxt = W.board('<div class="lbl k">每层接着下面一层往上算</div>', XS[0] - BW / 2 - 30, YR, H * 0.82, 0, 0);
  nxt.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, nxt, (t) => ramp(t, T('a5', '接着') - 0.2, 0.4) * (1 - ramp(t, T('a6') - 0.3, 0.4)));

  // ── 四摞一样高：顶上一条细线 ──
  const ceil = seg(S, 'g'); ceil.set([XS[0] - 90, YR, H + 3], [XS[3] + 90, YR, H + 3]);
  fade(W, ceil.e, (t) => ramp(t, T('a8b', '工夫') - 0.4, 0.5) * (1 - ramp(t, T('a9') + 0.2, 0.4)));
  const only = W.board('<div class="lbl l k" style="transform:translateX(-50%)">都只有这一趟</div>', (XS[0] + XS[3]) / 2, YR, H + 30, 0, -40);
  fade(W, only, (t) => ramp(t, T('a8b', '一趟') - 0.3, 0.4) * (1 - ramp(t, T('a9') + 0.2, 0.4)));

  // ── 只往上走、写成字才能接力：一条锯齿线——沿一摞往上，到顶落成字，再从下一摞底下往上 ──
  const relay = svg('path', { fill: 'none', stroke: '#1c1c1c', 'stroke-width': 3, 'stroke-linejoin': 'round' }, wl.s);
  // 锯齿线：沿第 i 摞中线往上 → 顶上拐进两摞之间的缝 → 沿缝落到纸面（落成字）→ 贴着纸面走到下一摞 → 再往上
  const top = wl.Y(H + 18), bot = wl.Y(6), parts = [], marks = [0];
  XS.forEach((x, i) => {
    const X = wl.X(x), G = wl.X(x + 90);
    parts.push(i === 0 ? `M${X} ${bot} L${X} ${top + 14}` : ` L${X} ${top + 14}`);
    marks.push(parts.join(''));
    if (i < 3) {
      parts.push(` Q${X} ${top} ${X + 14} ${top} L${G - 14} ${top} Q${G} ${top} ${G} ${top + 14} L${G} ${bot - 14} Q${G} ${bot} ${G + 14} ${bot} L${wl.X(XS[i + 1]) - 14} ${bot} Q${wl.X(XS[i + 1])} ${bot} ${wl.X(XS[i + 1])} ${bot - 14}`);
      marks.push(parts.join(''));
    }
  });
  relay.setAttribute('d', parts.join(''));
  const direct = svg('path', { d: `M${wl.X(XS[0]) + 10} ${top + 10} L${wl.X(XS[1]) - 10} ${bot - 10}`, fill: 'none', stroke: '#8a8a8a', 'stroke-width': 3, 'stroke-dasharray': '10 10' }, wl.s);
  const mx = (wl.X(XS[0]) + wl.X(XS[1])) / 2, my = (top + bot) / 2;
  const xmark = svg('path', { d: `M${mx - 26} ${my - 26} L${mx + 26} ${my + 26} M${mx + 26} ${my - 26} L${mx - 26} ${my + 26}`, fill: 'none', stroke: '#a5402d', 'stroke-width': 5 }, wl.s);
  const dL = direct.getTotalLength(); direct.style.strokeDasharray = `10 10`;
  W.up((t) => { const o = ramp(t, T('a10') + 0.2, 0.3) * (1 - ramp(t, T('a10b') + 0.4, 0.4)), k = ramp(t, T('a10') + 0.2, 0.8, (x) => x);
    direct.setAttribute('d', `M${wl.X(XS[0]) + 10} ${top + 10} L${(wl.X(XS[0]) + 10 + (wl.X(XS[1]) - 20 - wl.X(XS[0])) * k).toFixed(1)} ${(top + 10 + (bot - 20 - top) * k).toFixed(1)}`);
    direct.setAttribute('opacity', o.toFixed(3)); xmark.setAttribute('opacity', (o * ramp(t, T('a10') + 1.0, 0.2)).toFixed(3)); });
  sfx('error', T('a10', '接着用') - 0.1, { g: 0.12 });
  const midR = W.board('<div class="lbl l k" style="transform:translateX(-50%)">中间结果</div>', XS[0], YR, H + 30, 0, -40);
  fade(W, midR, (t) => ramp(t, T('a10', '中间结果') - 0.2, 0.4) * (1 - ramp(t, T('a10', '接着用') - 0.65, 0.3)));
  const noPass = W.board('<div class="lbl l k err" style="transform:translateX(-50%)">传不下去</div>', (XS[0] + XS[1]) / 2, YR, H + 30, 0, -40);
  fade(W, noPass, (t) => ramp(t, T('a10', '接着用') - 0.3, 0.4) * (1 - ramp(t, T('a10b') + 0.4, 0.4)));
  const relayLen = relay.getTotalLength();
  const probe = svg('path', { d: 'M0 0' }, wl.s);
  const cum = marks.slice(1).map((dd) => { probe.setAttribute('d', dd); return probe.getTotalLength() / relayLen; });
  probe.remove();
  // cum：[第 1 摞顶, 落到第 2 摞底, 第 2 摞顶, 落到第 3 摞底, …]
  relay.style.strokeDasharray = `${relayLen.toFixed(1)} ${(relayLen + 10).toFixed(1)}`;
  const dot = svg('circle', { r: 9, fill: '#1c1c1c' }, wl.s);
  const relayK = (t) => (t < T('a10') ? cum[0] * ramp(t, T('a9') + 0.2, 1.6) : lerp(cum[0], cum[1], ramp(t, T('a10b', '写成字') - 0.9, 1.6)));
  W.up((t) => {
    const k = relayK(t), op = ramp(t, T('a9'), 0.3) * (1 - ramp(t, T('a11') - 0.2, 0.5));
    relay.style.strokeDashoffset = (relayLen * (1 - k)).toFixed(1);
    relay.style.opacity = op.toFixed(3);
    const pt = relay.getPointAtLength(Math.max(0.01, relayLen * k));
    dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1)); dot.setAttribute('opacity', (op * (k > 0.002 && k < 0.998 ? 1 : 0)).toFixed(3));
  });
  // 墨点贴着纸面走过的那一段，正好经过刚写下的那一块：那一块描一圈墨线
  outs.forEach((b, i) => {
    if (i > 2) return;
    let last = null;
    W.up((t) => { const k = relayK(t); const on = t >= T('a9') && t < T('a11') - 0.2 && k > cum[2 * i] + (cum[2 * i + 1] - cum[2 * i]) * 0.45 && k <= cum[2 * i + 1] + 0.01; if (on !== last) { b.g.classList.toggle('hot', on); last = on; } });
  });
  const up1 = W.board('<div class="lbl l k" style="transform:translateX(-100%)">只往上走</div>', XS[0] - BW / 2 - 20, YR, H * 0.5, 0, -20);
  fade(W, up1, (t) => ramp(t, T('a9', '往上') - 0.2, 0.4) * (1 - ramp(t, T('a10b', '写成字') - 0.4, 0.4)));
  const wr = W.board('<div class="lbl l k">写成字，才接得上</div>', XS[0], YB + BD / 2, 0, -120, 30);
  fade(W, wr, (t) => ramp(t, T('a10b', '写成字') - 0.1, 0.4) * (1 - ramp(t, T('a11') + 0.4, 0.4)));
  sfx('tick', T('a10b', '写成字'), { g: 0.3 });
  // a11、a11b：四块全是答案本身；中间结果一块也没写；每一块只靠自己那一趟
  const r11Off = (t) => 1 - ramp(t, T('a12') - 0.3, 0.4);
  const lb4 = W.board('<div class="lbl l k">四块全是答案</div>', XS[3] + BW / 2 + 30, YR, H * 0.78, 0, -20);
  fade(W, lb4, (t) => ramp(t, T('a11', '答案本身') - 0.3, 0.4) * r11Off(t));
  const lb5 = W.board('<div class="lbl l k">中间结果：0 块</div>', XS[3] + BW / 2 + 30, YR, H * 0.78, 0, 70);
  fade(W, lb5, (t) => ramp(t, T('a11b', '一块也没写') - 0.3, 0.4) * r11Off(t));
  const lb6 = W.board('<div class="lbl l k">每块只靠自己这一趟</div>', XS[3] + BW / 2 + 30, YR, H * 0.78, 0, 160);
  fade(W, lb6, (t) => ramp(t, T('a11b', '自己那一趟') - 0.3, 0.4) * r11Off(t));
  sfx('tick', T('a11', '答案本身') - 0.3, { g: 0.16 }); sfx('tick', T('a11b', '一块也没写') - 0.3, { g: 0.16 });

  // ── 乘积：数字从左往右写出来。开头几位只看两数开头，末尾几位只看两数末尾（各一道括线）；
  //    中间两位：几行错开的灰条（各部分乘出来的数）都压在这两位上，再加上从右边一位一位跳过来的进位；
  //    这些都得在写那一块（239|473|089|6 的第二块）的一趟里算完 ──
  const PY = 330, PX = -380, DW = 74;               // 每位数字一格；第 i 位占 [PX + i·DW, PX + (i+1)·DW]
  const DIG = '2394850896'.split('');
  const dg = DIG.map((c, i) => W.print(c, PX + i * DW, PY, 'digits big' + (i === 4 || i === 5 ? ' mid' : '')));
  const tw = T('a12', '从左往右') - 0.3;
  const pOff = (t) => 1 - ramp(t, T('a15') - 0.7, 0.5);   // 离开纸面那一镜时收走算式
  const limOff = (t) => (1 - ramp(t, T('a14') - 0.6, 0.4)) * pOff(t);   // 退到下面两道条时，上面的数字与标注收走（会被画面上沿切到）
  dg.forEach((e, i) => fade(W, e, (t) => ramp(t, tw + i * 0.14, 0.2) * limOff(t)));
  dg.forEach((e, i) => sfx('key', tw + i * 0.14, { g: 0.25 }));
  const wOn = (t) => ramp(t, tw, 0.5) * (1 - ramp(t, T('a13b') - 0.6, 0.4));
  const ar1 = seg(S, ''); ar1.set([PX, PY - 30, 0.8], [PX + 10 * DW, PY - 30, 0.8]);
  const lw = W.print('<div class="lbl">写　从左往右　→</div>', PX, PY - 96);
  fade(W, ar1.e, wOn); fade(W, lw, wOn);
  // 开头、末尾：数字下面各一道括线，标出只看哪两段
  const BRY = PY + 134;
  const hOn = (t) => ramp(t, T('a12', '开头几位') - 0.2, 0.4) * pOff(t), tOn = (t) => ramp(t, T('a12b', '末尾几位') - 0.2, 0.4) * pOff(t);
  const digBand = (i0, i1, ta) => { const e = h('div', 'p3', S); css(e, { width: ((i1 - i0) * DW - 4) + 'px', height: '132px', background: '#c9c9c9', borderRadius: '8px', transform: `translate3d(${PX + i0 * DW + 2}px, ${PY - 8}px, 0.1px)` }); fade(W, e, (t) => ramp(t, ta, 0.4) * limOff(t)); return e; };
  digBand(0, 4, T('a12', '差不多') - 0.3); digBand(6, 10, T('a12b', '算出') - 0.3);
  const brHead = seg(S, 'w'); brHead.set([PX + 6, BRY, 0.8], [PX + 4 * DW - 6, BRY, 0.8]); fade(W, brHead.e, hOn);
  const brTail = seg(S, 'w'); brTail.set([PX + 6 * DW + 6, BRY, 0.8], [PX + 10 * DW - 6, BRY, 0.8]); fade(W, brTail.e, tOn);
  const hl = W.print('<div class="lbl k">只看开头：2599 × 9214</div>', PX, PY + 156); fade(W, hl, (t) => ramp(t, T('a12', '只看') - 0.2, 0.4) * limOff(t));
  const hl2 = W.print('<div class="lbl g">→ 2394…</div>', PX + 500, PY + 156); fade(W, hl2, (t) => ramp(t, T('a12', '差不多') - 0.2, 0.4) * limOff(t));
  const tl = W.print('<div class="lbl k" style="transform:translateX(-100%)">只看末尾：5992 × 2138</div>', PX + 10 * DW - 210, PY + 226); fade(W, tl, (t) => ramp(t, T('a12b', '只看') - 0.2, 0.4) * limOff(t));
  const tl2 = W.print('<div class="lbl g" style="transform:translateX(-100%)">→ …0896</div>', PX + 10 * DW, PY + 226); fade(W, tl2, (t) => ramp(t, T('a12b', '算出') - 0.2, 0.4) * limOff(t));
  sfx('tick', T('a12', '开头几位') - 0.2, { g: 0.16 }); sfx('tick', T('a12b', '末尾几位') - 0.2, { g: 0.16 });
  // 中间两位：墨框；下面五行错开的灰条＝各部分乘出来的数，每一行都压在中间这两位上，一行行加进来
  const box = h('div', 'p3 midbox', S); css(box, { width: (2 * DW + 16) + 'px', height: '128px', transform: `translate3d(${PX + 4 * DW - 8}px, ${PY - 6}px, 0.9px)` });
  fade(W, box, (t) => ramp(t, T('a13') - 0.1, 0.4) * (1 - ramp(t, T('a13c') - 0.3, 0.4)) * pOff(t));
  const PPY = PY + 300;
  const ppT = (j) => T('a13', '各部分') - 0.2 + j * 0.22;
  for (let j = 0; j < 5; j++) {
    const e = h('div', 'p3', S); css(e, { width: (6 * DW - 8) + 'px', height: '16px', background: '#9a9a9a', borderRadius: '3px', transform: `translate3d(${PX + (4 - j) * DW + 4}px, ${PPY + j * 30}px, 0.7px)` });
    fade(W, e, (t) => ramp(t, ppT(j), 0.25) * pOff(t));
    sfx('key', ppT(j), { g: 0.14 });
  }
  const band = h('div', 'p3 box3 g', S); css(band, { width: (2 * DW + 16) + 'px', height: (5 * 30 + 26) + 'px', transform: `translate3d(${PX + 4 * DW - 8}px, ${PPY - 14}px, 0.8px)` });
  fade(W, band, (t) => ramp(t, T('a13', '加起来') - 0.3, 0.4) * pOff(t));
  const ppl = W.print('<div class="lbl k">各部分乘出来的数，都要加到中间这两位上</div>', PX, PPY + 168);
  fade(W, ppl, (t) => ramp(t, T('a13', '加起来') - 0.3, 0.4) * pOff(t));
  // 进位：墨点从最右一位起，一跳一跳往左，跳到中间那两位；跳过的弧线留在数字上方
  const lc = W.print('<div class="lbl k" style="transform:translateX(-100%)">←　进位一位一位传过来</div>', PX + 10 * DW, PY - 96);
  const cOn = (t) => ramp(t, T('a13b', '进位') - 0.3, 0.4) * limOff(t);
  fade(W, lc, cOn);
  const pl = h('div', 'p3', S); pl.style.transform = `translate3d(${PX}px, ${PY}px, 1px)`; fade(W, pl, limOff);
  const ps = svg('svg', { width: 10 * DW + 40, height: 80, viewBox: `0 -80 ${10 * DW + 40} 80` }, pl); css(ps, { position: 'absolute', left: 0, top: '-80px', overflow: 'visible' });
  const NH = 5, hopT = (i) => T('a13b', '进位') - 0.1 + i * 0.36;
  const hx = (i) => (9.5 - i) * DW;
  const cdot = svg('circle', { r: 8, fill: '#1c1c1c' }, ps);
  for (let i = 0; i < NH; i++) {
    const xa = hx(i), xb = hx(i + 1);
    const p = svg('path', { d: `M${xa} -16 Q ${(xa + xb) / 2} -56 ${xb} -16`, fill: 'none', stroke: i === NH - 1 ? '#1c1c1c' : '#8a8a8a', 'stroke-width': 2.4 }, ps);
    p.style.strokeDasharray = 120;
    W.up((t) => { const k = ramp(t, hopT(i), 0.32, (x) => x); p.style.strokeDashoffset = (120 * (1 - k)).toFixed(1); p.style.opacity = k > 0 ? 1 : 0; });
    sfx('tick', hopT(i), { g: 0.12 });
  }
  W.up((t) => {
    const u = clamp((t - hopT(0)) / 0.36, 0, NH); const i = Math.min(NH - 1, Math.floor(u)), f = u - i;
    const xa = hx(i), xb = hx(i + 1), x = lerp(xa, xb, f), y = -16 - Math.sin(f * Math.PI) * 30;
    cdot.setAttribute('cx', x.toFixed(1)); cdot.setAttribute('cy', y.toFixed(1));
    cdot.setAttribute('opacity', (ramp(t, hopT(0) - 0.2, 0.2) * (1 - ramp(t, T('a13c') - 0.2, 0.3))).toFixed(3));
  });
  // 这些都得在写这一块的一趟里算完：框住第 4–6 位（正确的是 485，它写成了 473）
  const c3On = (t) => ramp(t, T('a13c', '四七三') - 0.3, 0.4) * pOff(t);
  rect(W, S, PX + 3 * DW - 10, PY - 10, 3 * DW + 20, 136, (t) => ramp(t, T('a13c', '四七三') - 0.3, 0.4) * limOff(t), '');
  const c3l = W.print('<div class="lbl k">这些都得在写这一块的那一趟里算完</div>', PX, PPY + 238); fade(W, c3l, c3On);
  sfx('tick', T('a13c', '四七三') - 0.3, { g: 0.2 });
  // 理论上限：题目一长，一步等一步的链越拉越长，「一趟能算的步数」那道条不变（示意）
  const LY = PPY + 400, LIM = 420, BX0 = PX + 140;
  const chOn = (t) => ramp(t, T('a14') - 0.2, 0.4) * (1 - ramp(t, T('a15') - 0.3, 0.4));
  const bar = (y, hh, bg) => { const e = h('div', 'p3', S); css(e, { height: hh + 'px', background: bg }); return e; };
  const limB = bar(LY + 40, 26, '#b9b9b9'); css(limB, { width: LIM + 'px', transform: `translate3d(${BX0}px, ${LY + 40}px, 0.7px)` }); fade(W, limB, chOn);
  const needB = bar(LY - 30, 26, '#1c1c1c'), overB = bar(LY - 30, 26, '#a5402d');
  const needL = (t) => lerp(120, 400, ramp(t, T('a14', '题目越长') - 0.2, 2.0)) + 520 * ramp(t, T('a14b', '超出') - 0.3, 1.4);
  W.up((t) => {
    const L_ = needL(t), a = Math.min(L_, LIM), o = Math.max(0, L_ - LIM), op = chOn(t);
    needB.style.width = a.toFixed(1) + 'px'; needB.style.transform = `translate3d(${BX0}px, ${LY - 30}px, 0.7px)`;
    overB.style.width = o.toFixed(1) + 'px'; overB.style.transform = `translate3d(${(BX0 + LIM).toFixed(1)}px, ${LY - 30}px, 0.7px)`;
    needB.style.opacity = op.toFixed(3); overB.style.opacity = (op * (o > 0.5 ? 1 : 0)).toFixed(3);
  });
  const chL = W.print('<div class="lbl" style="transform:translateX(-100%)">要走的</div>', BX0 - 30, LY - 46);
  const limL = W.print('<div class="lbl g" style="transform:translateX(-100%)">一趟能走的</div>', BX0 - 30, LY + 24);
  const chL2 = W.print('<div class="lbl s g">一步等一步的计算　｜　一趟的步数（示意）</div>', BX0, LY + 90); fade(W, chL2, chOn);
  [chL, limL].forEach((e) => fade(W, e, chOn));
  sfx('tick', T('a14', '题目越长'), { g: 0.14 }); sfx('error', T('a14b', '超出') - 0.1, { g: 0.12 });
  // 错答案里错的那一块
  const wrong = W.board('<div class="lbl k"><span class="err">473</span>　<span class="g">应为 485</span></div>', XS[1], YB + 60, 34, -80, 30);
  fade(W, wrong, (t) => ramp(t, T('a15', '中间') - 0.3, 0.4));
  sfx('tick', T('a15', '中间'), { g: 0.3 });
  rect(W, S, QX - QW / 2 - 14, YB - BD / 2 - 14, XS[3] + BW / 2 - QX + QW / 2 + 28, BD + 28, (t) => ramp(t, T('a16') - 0.1, 0.4) * (1 - ramp(t, T('a16', '不是') - 0.2, 0.4)), 'g');
  const late = W.board('<div class="lbl l k">不是不会算，</div>', XS[0] - BW / 2, YB + 60, 34, 0, 100);
  fade(W, late, (t) => ramp(t, T('a16', '多半') - 0.2, 0.4));
  const late2 = W.board('<div class="lbl l k">是来不及算</div>', XS[0] - BW / 2 + 470, YB + 60, 34, 0, 100);
  fade(W, late2, (t) => ramp(t, T('a16', '来不及算') - 0.3, 0.4));

  // ── 镜头：按内容选镜头；停留时不动，只在换镜头时动 ──
  // token：斜俯看一行方块｜层与一趟：侧面立面看一摞（纸摞自己长、自己算，镜头不跟）｜四趟与接力：立面全景｜
  // 乘积与进位：正俯视看纸上的算式｜它错的：斜俯近看那四块。取景由 fitCam 按这一镜要看到的东西算出，留安全边距、不压字幕条
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const row = [B(QX, YB, QW, BD, 30), ...XS.map((x) => B(x, YB, BW, BD, 30))];
  const shTok = fitCam(W, [...row, { el: gl }, { el: glD }, { el: four }, { el: tri }], { pitch: 50, yaw: -6 });
  const shOne = fitCam(W, [B(QX, YB, QW, BD, 30), B(XS[0], YB, BW, BD, 30), B(XS[0], YR, BW, BD, H + 20), { el: lb1 }, { el: lb2 }, { el: layer }, { el: ud }, { el: fx }, { el: rdq }, { el: nxt }], { pitch: 84 });
  const shFour = fitCam(W, [...row, ...XS.map((x) => B(x, YR, BW, BD, H + 20)), { el: up1 }, { el: wr }, { el: lb4 }, { el: lb5 }, { el: lb6 }, { el: only }, { el: noPass }, { el: midR }], { pitch: 84 });
  // 乘积页分两镜：先近看数字与几行部分积（a12–a13c），讲「题目越长」时退到下面的两道条
  const shPage = fitCam(W, [[PX - 120, PY - 130, 0], [PX + 10 * DW + 120, PY - 130, 0], [PX - 120, PPY + 290, 0], [PX + 10 * DW + 120, PPY + 290, 0], { el: lw }, { el: lc }, { el: ppl }, { el: c3l }, { el: hl }, { el: hl2 }, { el: tl }, { el: tl2 }], { pitch: 8 });
  const shLim = fitCam(W, [[PX - 160, PPY - 40, 0], [BX0 + 960, PPY - 40, 0], [PX - 160, LY + 150, 0], [BX0 + 960, LY + 150, 0], { el: chL }, { el: limL }, { el: chL2 }, { el: c3l }], { pitch: 8 });
  const shErr = fitCam(W, [B(QX, YB, QW, BD, 30), ...XS.map((x) => B(x, YB, BW, BD, 30)), { el: wrong }, { el: late }, { el: late2 }], { pitch: 52, yaw: -4, kmax: 1.6 });
  W.cam([
    [t0, { cx: CX + 380, cy: CY - 40, cz: 0, pitch: 0, yaw: 0, k: 1 }, 0.01],
    [t0 + 1.3, shTok, c0 - t0 - 0.9],
    [T('a3') - 0.4, shOne, 1.4],
    [T('a8') - 0.6, shFour, 1.3],
    [T('a12') - 0.8, shPage, 1.5],
    [T('a14') - 0.5, shLim, 1.2],
    [T('a15') - 0.6, shErr, 1.3],
    // 章末：抬成正俯视，看着一片空白的纸（和下一章开头的横格对齐，硬切看不出来）
    [Tend('a16') + 0.6, blankCam(170, 1420), Math.max(0.8, s.end + 0.35 - Tend('a16') - 0.6)],
  ]);
  sfx('whoosh', t0 + 1.3, { g: 0.3 }); sfx('whoosh', T('a3') - 0.4, { g: 0.18 }); sfx('whoosh', T('a8') - 0.6, { g: 0.16 }); sfx('whoosh', T('a12') - 0.8, { g: 0.2 }); sfx('whoosh', T('a15') - 0.6, { g: 0.16 }); sfx('whoosh', Tend('a16') + 0.6, { g: 0.18 });
});
