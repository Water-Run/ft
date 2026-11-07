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
      chunks.forEach((c) => { const w = 34 * c.length + 30; const b = block(S, '', { w, d: 70, h: 18, cls: 'dim' }); const bar = h('div', 'scrib', b.top); css(bar, { width: (w - 34) + 'px' }); b.g.style.transform = `translate3d(${x + w / 2}px, ${y + li * 110}px, 0px)`; b.g.style.opacity = op; x += w + 10; });
    });
  };
  farRow(-820, ['92138=92000+138', '25992×92000=2391264000', '25992×138=3586896', '答案 2394850896'], 0.5);
  farRow(-1420, ['答案 2394841296', '25992×92138', '=25992×(92000+138)'], 0.4);

  // ── 题目与四个空位 ──
  const q = block(S, '25992 × 92138 =', { w: QW, d: BD, h: 30, fs: 52 });
  q.g.style.transform = `translate3d(${QX}px, ${YB}px, 0px)`;
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
    { up: T('a7') - 0.2, a: T('a7') + 0.3, b: Tend('a7') - 0.3 },
    { up: T('a8') - 0.1, a: T('a8') + 0.3, b: T('a8', '逗号') + 0.3 },
    { up: T('a8', '逗号') - 0.2, a: T('a8', '逗号') + 0.3, b: T('a8b', '工夫') },
  ];
  const inkOn = (t) => (t >= T('a11', '这四块') - 0.2 && t < Tend('a11') + 0.5 ? 1 : 0);
  plan.forEach((p, i) => ream(W, S, XS[i], YR, { w: BW, d: BD, gap: GAP, n: NP,
    rise: (t) => ramp(t, p.up, i === 0 ? 2.6 : 0.8, i === 0 ? ease.io3 : ease.out3), fill: (t) => ramp(t, p.a, p.b - p.a, (k) => k), ink: inkOn }));
  const outs = plan.map((p, i) => {
    const b = block(S, ANS[i], { w: BW, d: BD, h: 30, fs: 58, cls: i === 1 ? 'err' : '' });
    place(W, b.g, (t) => {
      const k = ramp(t, p.b + 0.1, 1.0, ease.io3);
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
  dims[0].set([dimX, dimY, 0], [dimX, dimY, H]); dims[1].set([dimX - 10, dimY, 0], [dimX + 10, dimY, 0]); dims[2].set([dimX - 10, dimY, H], [dimX + 10, dimY, H]);
  const dimOp = (t) => ramp(t, T('a6', '一趟') - 0.5, 0.4) * (1 - ramp(t, T('a8') - 0.2, 0.4));
  dims.forEach((d) => fade(W, d.e, dimOp));
  for (let i = 4; i < NP; i += 4) { const tk = seg(S, 'g'); tk.set([dimX, dimY, i * GAP], [dimX + 7, dimY, i * GAP]); fade(W, tk.e, (t) => ramp(t, T('a7', '九十六') - 0.4, 0.5) * (1 - ramp(t, T('a8') - 0.2, 0.4))); }
  const lb1 = W.board('<div class="lbl">一趟</div>', dimX + 16, dimY, H * 0.55, 0, -22);
  fade(W, lb1, dimOp);
  const lb2 = W.board('<div class="lbl s g">GPT-3：96 层</div>', dimX + 16, dimY, H * 0.55, 0, 24);
  fade(W, lb2, (t) => ramp(t, T('a7', '九十六') - 0.3, 0.4) * (1 - ramp(t, T('a8') - 0.2, 0.4)));

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
  const relayLen = relay.getTotalLength();
  const probe = svg('path', { d: 'M0 0' }, wl.s);
  const cum = marks.slice(1).map((dd) => { probe.setAttribute('d', dd); return probe.getTotalLength() / relayLen; });
  probe.remove();
  // cum：[第 1 摞顶, 落到第 2 摞底, 第 2 摞顶, 落到第 3 摞底, …]
  relay.style.strokeDasharray = `${relayLen.toFixed(1)} ${(relayLen + 10).toFixed(1)}`;
  const dot = svg('circle', { r: 9, fill: '#1c1c1c' }, wl.s);
  const relayK = (t) => (t < T('a10') ? cum[0] * ramp(t, T('a9') + 0.2, 1.6)
    : (t < T('a11') ? lerp(cum[0], cum[1], ramp(t, T('a10b', '写成字') - 0.9, 1.6)) : lerp(cum[1], 1, ramp(t, T('a11', '这四块') - 0.4, 2.6, (x) => x))));
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
  fade(W, lb4, (t) => ramp(t, T('a11', '这四块') - 0.2, 0.4) * (1 - ramp(t, T('a12') - 0.3, 0.4)));

  // ── 乘积：数字从左往右一位位写出来；进位的墨点从最右一位起，一跳一跳往左——两个方向正好相反 ──
  const PY = 330, PX = -380, DW = 74;               // 每位数字一格
  const DIG = '2394850896'.split('');
  const dg = DIG.map((c, i) => { const e = W.print(c, PX + i * DW, PY, 'digits big' + (i === 4 || i === 5 ? ' mid' : '')); return e; });
  const tw = T('a12', '从左往右') - 0.3;
  dg.forEach((e, i) => fade(W, e, (t) => ramp(t, tw + i * 0.14, 0.2)));
  dg.forEach((e, i) => sfx('key', tw + i * 0.14, { g: 0.25 }));
  const ar1 = seg(S, ''); ar1.set([PX, PY - 30, 0.8], [PX + 10 * DW, PY - 30, 0.8]);
  const lw = W.print('<div class="lbl">写　从左往右　→</div>', PX, PY - 96);
  fade(W, ar1.e, (t) => ramp(t, tw, 0.5)); fade(W, lw, (t) => ramp(t, tw, 0.5));
  const ar2 = seg(S, ''); ar2.set([PX + 10 * DW, PY + 236, 0.8], [PX, PY + 236, 0.8]);
  const lc = W.print('<div class="lbl">←　从右往左　进位</div>', PX + 10 * DW - 330, PY + 250);
  const tc = T('a12', '进位') - 0.1;
  fade(W, ar2.e, (t) => ramp(t, tc, 0.5)); fade(W, lc, (t) => ramp(t, tc, 0.5));
  // 进位：墨点从最右一位跳到左边一位，一步等一步；跳过的弧线留下
  const pl = h('div', 'p3', S); pl.style.transform = `translate3d(${PX}px, ${PY}px, 1px)`;
  const ps = svg('svg', { width: 10 * DW + 40, height: 260, viewBox: `0 0 ${10 * DW + 40} 260` }, pl); css(ps, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  const hopT = (i) => T('a13', '一位一位') - 0.6 + i * 0.32;
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
  fade(W, box, (t) => ramp(t, T('a13', '中间') - 0.2, 0.4));
  // 理论上限：题目一长，一步等一步的链越拉越长，「这几趟能走的步数」那道括线不变（示意）
  const LY = PY + 520;
  const lim = seg(S, ''); lim.set([PX + 10 * DW, LY, 0.8], [PX + 10 * DW - 420, LY, 0.8]);
  const limA = seg(S, ''); limA.set([PX + 10 * DW - 420, LY - 12, 0.8], [PX + 10 * DW - 420, LY + 12, 0.8]);
  const limL = W.print('<div class="lbl g">这几趟能走的步数</div>', PX + 10 * DW - 420, LY + 18);
  const chL = W.print('<div class="lbl">一步等一步的计算</div>', PX + 10 * DW - 420, LY - 140);
  const chOff = (t) => 1 - ramp(t, T('a15') - 0.2, 0.4);
  for (let i = 0; i < 20; i++) {
    const over = i >= 10, b = block(S, '', { w: 34, d: 34, h: 18, cls: over ? 'cube e' : 'cube' });
    const ta = i < 6 ? T('a14', '题目越长') - 0.2 + i * 0.32 : (i < 10 ? T('a14', '计算') - 0.4 + (i - 6) * 0.3 : T('a14b', '超出') - 0.4 + (i - 10) * 0.16);
    place(W, b.g, (t) => ({ x: PX + 10 * DW - 21 - i * 42, y: LY - 22, z: 24 * (1 - ramp(t, ta, 0.25, ease.out3)), o: ramp(t, ta, 0.18) * chOff(t) }));
    if (i % 2 === 0) sfx('tick', ta, { g: over ? 0.14 : 0.1 });
  }
  [lim.e, limA.e, limL, chL].forEach((e) => fade(W, e, (t) => ramp(t, T('a14') - 0.2, 0.4) * (1 - ramp(t, T('a15') - 0.2, 0.4))));
  // 错答案里错的那一块
  const wrong = W.board('<div class="lbl"><span class="err">473</span>　<span class="g">应为 485</span></div>', XS[1], YB + 60, 34, -80, 30);
  fade(W, wrong, (t) => ramp(t, T('a15', '中间') - 0.3, 0.4));
  sfx('tick', T('a15', '中间'), { g: 0.3 });

  // ── 镜头 ──
  const fill0 = plan[0];
  W.cam([
    [t0, { cx: CX + 380, cy: CY - 40, cz: 0, pitch: 0, yaw: 0, k: 1 }, 0.01],
    [t0 + 1.3, { cx: 120, cy: -20, cz: 60, pitch: 56, yaw: -8, k: 1.05 }, c0 - t0 - 0.9],
    [null, { cx: 170, cy: -20, cz: 60, pitch: 57, yaw: -4, k: 1.05 }, Math.max(0.5, T('a2') - 0.2 - (c0 + 0.5)), (k) => k],
    [T('a2'), { cx: 190, cy: -10, cz: 50, pitch: 58, yaw: -4, k: 1.14 }, 2.0, (k) => smooth(k)],
    [T('a3'), { cx: 20, cy: -100, cz: 200, pitch: 72, yaw: -22, k: 1.1 }, 1.8],
    // 跟着算到的那一张往上走，到顶后跟着那一块落下来
    [fill0.a, { cx: 10, cy: -130, cz: 80, pitch: 76, yaw: -26, k: 1.45 }, 0.8],
    [fill0.a + 0.85, { cz: H - 20 }, fill0.b - fill0.a - 0.75, (k) => smooth(k)],
    [fill0.b + 0.15, { cx: 20, cy: -50, cz: 80, pitch: 64, yaw: -12, k: 1.3 }, 1.1],
    // 「一趟」：绕到侧面，看清这一摞的层
    [T('a6'), { cx: 40, cy: -110, cz: 250, pitch: 74, yaw: 28, k: 1.3 }, 2.6, (k) => smooth(k)],
    [T('a7'), { cx: 110, cy: -110, cz: 250, pitch: 74, yaw: 20, k: 1.26 }, Math.max(1, Tend('a7') - T('a7')), (k) => smooth(k)],
    // 四摞：退远、放低，一样高
    [T('a8'), { cx: 220, cy: -80, cz: 200, pitch: 76, yaw: 4, k: 1.08 }, 2.4],
    [T('a9') - 0.2, { cx: 230, cy: -90, cz: 230, pitch: 70, yaw: -6, k: 0.98 }, 1.6],
    [null, { cx: 250, cy: -90, cz: 230, pitch: 70, yaw: -2, k: 0.96 }, Math.max(0.5, T('a12') - T('a9') - 2.2), (k) => k],
    // 乘积
    [T('a12') - 0.5, { cx: -20, cy: 420, cz: 30, pitch: 40, yaw: 0, k: 1.2 }, 1.6],
    [null, { cx: 0, cy: 450, cz: 30, pitch: 42, yaw: 2, k: 1.16 }, Math.max(0.5, T('a14') - T('a12') - 1.8), (k) => k],
    [T('a14') - 0.1, { cx: -40, cy: PY + 470, cz: 20, pitch: 38, yaw: 2, k: 1.4 }, 1.4],
    [null, { cx: 30, cy: PY + 470, cz: 20, pitch: 38, yaw: 2, k: 1.4 }, Math.max(0.5, T('a15') - 0.5 - (T('a14') + 1.4)), (k) => k],
    [T('a15') - 0.4, { cx: 160, cy: -30, cz: 170, pitch: 64, yaw: -4, k: 1.0 }, 1.4],
    [null, { cx: 170, cy: -30, cz: 170, pitch: 65, yaw: -6, k: 0.99 }, Math.max(0.5, Tend('a15') + 0.5 - T('a15') - 1.1), (k) => k],
    // 章末：抬成正俯视，看着一片空白的纸（和下一章开头的横格对齐，硬切看不出来）
    [Tend('a15') + 0.6, blankCam(170, 1420), Math.max(0.8, s.end + 0.35 - Tend('a15') - 0.6)],
  ]);
  sfx('whoosh', t0 + 1.3, { g: 0.3 }); sfx('whoosh', T('a3'), { g: 0.2 }); sfx('whoosh', T('a12') - 0.5, { g: 0.2 }); sfx('whoosh', Tend('a15') + 0.6, { g: 0.18 });
});
