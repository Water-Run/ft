// 01 一块字的工夫：一块 token 是怎样写出来的。
// 纸面上一行：题目、四个空位。每个空位后面立起一摞纸（一张代表一层；画成 48 张，标注 GPT-3 的 96 层），
// 从下往上一张张算到顶，算到顶得出的那一块落进空位——这就是一趟。一趟里的结果只往上走；要交给下一趟，只能写成字落回纸面。
// 事实：L3 §3（错答案四块 239|473|089|6）；S3 §3（逐层堆叠、每层取上一层的输出、自回归、只看前面）；S4 表 2.1（GPT-3 96 层）；
// S7（不写中间步骤时，一步接一步的计算受层数限制）；S5（题目变长，层数固定的模型直接作答有上限）；乘法的进位从低位往高位传（数学）。
scene('pass', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const XS = [-20, 160, 340, 520];                 // 四个空位的 x
  const YB = 0, YR = -150;                         // 方块那一行、纸摞那一行的 y
  const BW = 150, BD = 100;                        // 方块与纸摞的占地
  const NP = 48, GAP = 10, H = NP * GAP;           // 画 48 张，间距 10，高 480
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
    const ta = T('a1', '一小块') + i * 0.2;
    place(W, b.g, (t) => ({ x: XS[i], y: YB, z: 70 * (1 - ramp(t, ta, 0.45, ease.out3)), o: ramp(t, ta, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)) }));
  });
  sfx('pop', T('a1', '一小块'), { g: 0.3 });
  const slot0 = seg(S, 'w'); slot0.set([XS[0] - BW / 2, YB + BD / 2 + 8, 0.8], [XS[0] + BW / 2, YB + BD / 2 + 8, 0.8]);
  fade(W, slot0.e, (t) => ramp(t, T('a4') + 0.1, 0.4) * (1 - ramp(t, T('a5', '最顶上'), 0.5)));
  rect(W, S, QX - QW / 2 - 12, YB - BD / 2 - 12, QW + 24, BD + 24, (t) => ramp(t, T('a4', '题目') - 0.2, 0.4) * (1 - ramp(t, T('a5') - 0.2, 0.5)));
  const gl = W.board('<div class="lbl"><b>token</b>　模型一次写出的一小块</div>', XS[0] - BW / 2, YB + BD / 2 + 30, 0, 0, 0);
  gl.dataset.gloss = 'token';
  rect(W, S, XS[0] - BW / 2 - 12, YB - BD / 2 - 12, BW + 24, BD + 24, (t) => ramp(t, T('a1', 'token') - 0.3, 0.4) * (1 - ramp(t, T('a2', '四块') - 0.3, 0.4)));
  fade(W, gl, (t) => ramp(t, T('a1', 'token') - 0.1, 0.4) * (1 - ramp(t, T('a3') - 0.4, 0.4)));
  const four = W.board('<div class="lbl g">四块</div>', XS[3] + 110, YB, 40, 0, -20);
  fade(W, four, (t) => ramp(t, T('a2', '四块') - 0.1, 0.3) * (1 - ramp(t, T('a3') - 0.4, 0.4)));

  // ── 四摞：起来、从下往上算、到顶得出一块、落进空位 ──
  const plan = [
    { up: T('a3') + 0.1, a: T('a4', '最底下'), b: T('a5', '最顶上') + 0.2 },
    { up: T('a8') - 0.1, a: T('a8') + 0.3, b: T('a8', '逗号') },
    { up: T('a8', '逗号') - 0.3, a: T('a8', '逗号'), b: T('a8', '两位') },
    { up: T('a8', '两位') - 0.3, a: T('a8', '两位'), b: T('a8b') + 0.1 },
  ];
  const inkOn = (t) => (t >= T('a11', '四块') - 0.2 && t < Tend('a11') + 0.5 ? 1 : 0);
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
  for (let i = 4; i < NP; i += 4) { const tk = seg(S, 'w'); tk.set([dimX, dimY, i * GAP], [dimX + 14, dimY, i * GAP]); const tt = lerp(T('a7') + 0.3, T('a7', '九十六') - 0.2, i / NP); fade(W, tk.e, (t) => ramp(t, tt, 0.25) * (1 - ramp(t, T('a8') - 0.2, 0.4))); }   // 层数：刻度一格格出现
  const lb1 = W.board('<div class="lbl">一趟</div>', dimX + 16, dimY, H * 0.55, 0, -22);
  fade(W, lb1, dimOp);
  const ud = W.board('<div class="lbl g">从底到顶　↑</div>', XS[0] - BW / 2 - 30, YR, H * 0.5, 0, 0);
  ud.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, ud, (t) => ramp(t, T('a6', '从底到顶') - 0.2, 0.3) * (1 - ramp(t, T('a8') - 0.2, 0.4)));
  const fx = W.board('<div class="lbl g">层数固定</div>', XS[0] - BW / 2 - 30, YR, H * 0.5, 0, 70);
  fx.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, fx, (t) => ramp(t, T('a7', '定了') - 0.2, 0.3) * (1 - ramp(t, T('a8') - 0.2, 0.4)));
  const lb2 = W.board('<div class="lbl g">GPT-3：96 层</div>', dimX + 16, dimY, H * 0.55, 0, 24);
  fade(W, lb2, (t) => ramp(t, T('a7', '九十六') - 0.3, 0.4) * (1 - ramp(t, T('a8') - 0.2, 0.4)));

  // ── 「画面上每一片，代表一层」：第 24 片的纸边描深，右边标「一层」 ──
  const LZ = 24 * GAP, lyOn = (t) => ramp(t, T('a3b', '每一片') - 0.2, 0.4) * (1 - ramp(t, T('a4', '最底下') - 0.4, 0.4));
  const lyE = seg(S, 'w'); lyE.set([XS[0] - BW / 2, YR + BD / 2 + 1, LZ], [XS[0] + BW / 2, YR + BD / 2 + 1, LZ]); fade(W, lyE.e, lyOn);
  const lyL = seg(S, ''); lyL.set([XS[0] + BW / 2 + 4, YR + BD / 2 + 1, LZ], [XS[0] + BW / 2 + 60, YR + BD / 2 + 1, LZ]); fade(W, lyL.e, lyOn);
  const layer = W.board('<div class="lbl">一层</div>', XS[0] + BW / 2 + 70, YR + BD / 2, LZ, 0, -30); fade(W, layer, lyOn);
  sfx('tick', T('a3b', '每一片'), { g: 0.2 });

  // ── 四摞一样高：顶上一条细线 ──
  const ceil = seg(S, 'g'); ceil.set([XS[0] - 90, YR, H + 3], [XS[3] + 90, YR, H + 3]);
  fade(W, ceil.e, (t) => ramp(t, T('a8b', '工夫') - 0.4, 0.5) * (1 - ramp(t, T('a9') + 0.2, 0.4)));

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
  const relayLen = relay.getTotalLength();
  const probe = svg('path', { d: 'M0 0' }, wl.s);
  const cum = marks.slice(1).map((dd) => { probe.setAttribute('d', dd); return probe.getTotalLength() / relayLen; });
  probe.remove();
  // cum：[第 1 摞顶, 落到第 2 摞底, 第 2 摞顶, 落到第 3 摞底, …]
  relay.style.strokeDasharray = `${relayLen.toFixed(1)} ${(relayLen + 10).toFixed(1)}`;
  const dot = svg('circle', { r: 9, fill: '#1c1c1c' }, wl.s);
  const relayK = (t) => (t < T('a10') ? cum[0] * ramp(t, T('a9') + 0.2, 1.6)
    : (t < T('a11') ? lerp(cum[0], cum[1], ramp(t, T('a10b', '写成字') - 0.9, 1.6)) : lerp(cum[1], 1, ramp(t, T('a11', '能接力') - 0.4, 2.6, (x) => x))));
  W.up((t) => {
    const k = relayK(t), op = ramp(t, T('a9'), 0.3) * (1 - ramp(t, T('a12') - 0.3, 0.5));
    relay.style.strokeDashoffset = (relayLen * (1 - k)).toFixed(1);
    relay.style.opacity = op.toFixed(3);
    const pt = relay.getPointAtLength(Math.max(0.01, relayLen * k));
    dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1)); dot.setAttribute('opacity', (op * (k > 0.002 && k < 0.998 ? 1 : 0)).toFixed(3));
  });
  // 墨点贴着纸面走过的那一段，正好经过刚写下的那一块：那一块描一圈墨线
  outs.forEach((b, i) => {
    if (i > 2) return;
    let last = null;
    W.up((t) => { const k = relayK(t); const on = t >= T('a9') && t < T('a12') && k > cum[2 * i] + (cum[2 * i + 1] - cum[2 * i]) * 0.45 && k <= cum[2 * i + 1] + 0.01; if (on !== last) { b.g.classList.toggle('hot', on); last = on; } });
  });
  const up1 = W.board('<div class="lbl">只往上走</div>', XS[0] - BW / 2 - 20, YR, H * 0.5, -150, -20);
  fade(W, up1, (t) => ramp(t, T('a9', '往上') - 0.2, 0.4) * (1 - ramp(t, T('a10b', '写成字') - 0.4, 0.4)));
  const wr = W.board('<div class="lbl">写成字，才接得上</div>', XS[0], YB + BD / 2, 0, -120, 30);
  fade(W, wr, (t) => ramp(t, T('a10b', '写成字') - 0.1, 0.4) * (1 - ramp(t, T('a11') + 0.4, 0.4)));
  sfx('tick', T('a10b', '写成字'), { g: 0.3 });
  const lb4 = W.board('<div class="lbl">四趟</div>', XS[3] + BW / 2 + 30, YR, H * 0.7, 0, -20);
  fade(W, lb4, (t) => ramp(t, T('a11', '这四趟') - 0.2, 0.4) * (1 - ramp(t, T('a12') - 0.3, 0.4)));

  // ── 乘积：数字从左往右一位位写出来；进位的墨点从最右一位起，一跳一跳往左——两个方向正好相反 ──
  const PY = 330, PX = -380, DW = 74;               // 每位数字一格
  const DIG = '2394850896'.split('');
  const dg = DIG.map((c, i) => { const e = W.print(c, PX + i * DW, PY, 'digits big' + (i === 4 || i === 5 ? ' mid' : '')); return e; });
  const tw = T('a12', '从左往右') - 0.3;
  const pOff = (t) => 1 - ramp(t, T('a15') - 0.7, 0.5);   // 离开纸面那一镜时收走算式
  dg.forEach((e, i) => fade(W, e, (t) => ramp(t, tw + i * 0.14, 0.2) * pOff(t)));
  dg.forEach((e, i) => sfx('key', tw + i * 0.14, { g: 0.25 }));
  const ar1 = seg(S, ''); ar1.set([PX, PY - 30, 0.8], [PX + 10 * DW, PY - 30, 0.8]);
  const lw = W.print('<div class="lbl">写　从左往右　→</div>', PX, PY - 96);
  fade(W, ar1.e, (t) => ramp(t, tw, 0.5) * pOff(t)); fade(W, lw, (t) => ramp(t, tw, 0.5) * pOff(t));
  const ar2 = seg(S, ''); ar2.set([PX + 10 * DW, PY + 236, 0.8], [PX, PY + 236, 0.8]);
  const lc = W.print('<div class="lbl">←　从右往左　进位</div>', PX + 10 * DW - 330, PY + 250);
  const tc = T('a12', '进位') - 0.1;
  fade(W, ar2.e, (t) => ramp(t, tc, 0.5) * pOff(t)); fade(W, lc, (t) => ramp(t, tc, 0.5) * pOff(t));
  // 进位：墨点从最右一位跳到左边一位，一步等一步；跳过的弧线留下
  const pl = h('div', 'p3', S); pl.style.transform = `translate3d(${PX}px, ${PY}px, 1px)`; fade(W, pl, pOff);
  const ps = svg('svg', { width: 10 * DW + 40, height: 260, viewBox: `0 0 ${10 * DW + 40} 260` }, pl); css(ps, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  const hopT = (i) => T('a13', '要等') - 0.2 + i * 0.32;
  const cdot = svg('circle', { r: 8, fill: '#1c1c1c' }, ps);
  const hx = (i) => (9.5 - i) * DW;
  for (let i = 0; i < 9; i++) {
    const xa = hx(i), xb = hx(i + 1);
    const p = svg('path', { d: `M${xa} 214 Q ${(xa + xb) / 2} 176 ${xb} 214`, fill: 'none', stroke: i === 4 || i === 5 ? '#1c1c1c' : '#8a8a8a', 'stroke-width': 2.2 }, ps);
    p.style.strokeDasharray = 100;
    W.up((t) => { const k = ramp(t, hopT(i), 0.3, (x) => x); p.style.strokeDashoffset = (100 * (1 - k)).toFixed(1); p.style.opacity = k > 0 ? 1 : 0; });
    sfx('tick', hopT(i), { g: 0.12 });
  }
  W.up((t) => {
    const u = clamp((t - hopT(0)) / 0.32, 0, 9); const i = Math.min(8, Math.floor(u)), f = u - i;
    const xa = hx(i), xb = hx(i + 1), x = lerp(xa, xb, f), y = 214 - Math.sin(f * Math.PI) * 26;
    cdot.setAttribute('cx', x.toFixed(1)); cdot.setAttribute('cy', y.toFixed(1));
    cdot.setAttribute('opacity', (ramp(t, hopT(0) - 0.2, 0.2) * (1 - ramp(t, T('a14') - 0.2, 0.3))).toFixed(3));
  });
  // 中间两位：一个墨框
  const box = h('div', 'p3 midbox', S); css(box, { width: (2 * DW + 16) + 'px', height: '128px', transform: `translate3d(${PX + 4 * DW - 8}px, ${PY - 6}px, 0.9px)` });
  fade(W, box, (t) => ramp(t, T('a13') - 0.1, 0.4) * pOff(t));
  // 理论上限：题目一长，一步等一步的链越拉越长，「这几趟能走的步数」那道括线不变（示意）
  const LY = PY + 520, RX = PX + 10 * DW, LIM = 420, BX0 = PX + 140;
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
  const limL = W.print('<div class="lbl g" style="transform:translateX(-100%)">能走的</div>', BX0 - 30, LY + 24);
  const chL2 = W.print('<div class="lbl s g">一步等一步的计算　｜　这几趟的步数</div>', BX0, LY + 90); fade(W, chL2, chOn);
  [chL, limL].forEach((e) => fade(W, e, chOn));
  sfx('tick', T('a14', '题目越长'), { g: 0.14 }); sfx('error', T('a14b', '超出') - 0.1, { g: 0.12 });
  // 错答案里错的那一块
  const wrong = W.board('<div class="lbl"><span class="err">473</span>　<span class="g">应为 485</span></div>', XS[1], YB + 60, 34, -80, 30);
  fade(W, wrong, (t) => ramp(t, T('a15', '中间') - 0.3, 0.4));
  sfx('tick', T('a15', '中间'), { g: 0.3 });
  const late = W.board('<div class="lbl l">不是不会算，</div>', XS[0] - BW / 2, YB + 60, 34, 0, 100);
  fade(W, late, (t) => ramp(t, T('a16', '不是') - 0.2, 0.4));
  const late2 = W.board('<div class="lbl l">是来不及算</div>', XS[0] - BW / 2 + 380, YB + 60, 34, 0, 100);
  fade(W, late2, (t) => ramp(t, T('a16', '来不及算') - 0.3, 0.4));

  // ── 镜头：按内容选镜头；停留时不动，只在换镜头时动 ──
  // token：斜俯看一行方块｜层与一趟：侧面立面看一摞（纸摞自己长、自己算，镜头不跟）｜四趟与接力：立面全景｜
  // 乘积与进位：正俯视看纸上的算式｜它错的：斜俯近看那四块。取景由 fitCam 按这一镜要看到的东西算出，留安全边距、不压字幕条
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const row = [B(QX, YB, QW, BD, 30), ...XS.map((x) => B(x, YB, BW, BD, 30))];
  const shTok = fitCam(W, [...row, { el: gl }, { el: four }], { pitch: 50, yaw: -6 });
  const shOne = fitCam(W, [B(QX, YB, QW, BD, 30), B(XS[0], YB, BW, BD, 30), B(XS[0], YR, BW, BD, H + 20), { el: lb1 }, { el: lb2 }, { el: layer }, { el: ud }, { el: fx }], { pitch: 84 });
  const shFour = fitCam(W, [...row, ...XS.map((x) => B(x, YR, BW, BD, H + 20)), { el: up1 }, { el: wr }, { el: lb4 }], { pitch: 84 });
  const shPage = fitCam(W, [[PX - 160, PY - 130, 0], [BX0 + 940, PY - 130, 0], [PX - 160, LY + 150, 0], [BX0 + 940, LY + 150, 0]], { pitch: 8 });
  const shErr = fitCam(W, [B(QX, YB, QW, BD, 30), ...XS.map((x) => B(x, YB, BW, BD, 30)), { el: wrong }, { el: late }, { el: late2 }], { pitch: 52, yaw: -4, kmax: 1.6 });
  W.cam([
    [t0, { cx: CX + 380, cy: CY - 40, cz: 0, pitch: 0, yaw: 0, k: 1 }, 0.01],
    [t0 + 1.3, shTok, c0 - t0 - 0.9],
    [T('a3') - 0.4, shOne, 1.4],
    [T('a8') - 0.6, shFour, 1.3],
    [T('a12') - 0.8, shPage, 1.5],
    [T('a15') - 0.6, shErr, 1.3],
    // 章末：抬成正俯视，看着一片空白的纸（和下一章开头的横格对齐，硬切看不出来）
    [Tend('a16') + 0.6, blankCam(170, 1420), Math.max(0.8, s.end + 0.35 - Tend('a16') - 0.6)],
  ]);
  sfx('whoosh', t0 + 1.3, { g: 0.3 }); sfx('whoosh', T('a3') - 0.4, { g: 0.18 }); sfx('whoosh', T('a8') - 0.6, { g: 0.16 }); sfx('whoosh', T('a12') - 0.8, { g: 0.2 }); sfx('whoosh', T('a15') - 0.6, { g: 0.16 }); sfx('whoosh', Tend('a16') + 0.6, { g: 0.18 });
});
