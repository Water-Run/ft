// 结尾：回到纸。人算不过来时拿一张纸（正俯视看一张手写的草稿）；模型没有别的纸，只有它自己写下的字（旁边一行方块）。
// 它能想多远，看答案之前写下了多少：只报答案是一薄片（四块），先写过程是一座柱子（三百多块），镜头沿柱子升上去。
// 我们常让它先给结论、再讲理由：结论那一趟只读得到问题；后面的理由读得到结论，却没有参与得出它——理由淡下去，结论还在。
// 静场，片名印在纸上。
// 事实：S14、S3（b1–b3 的依据）；L3 §3（先写过程三百多块）；S3 §3.2.3（后写的字影响不了先写的字）；e4 是对使用习惯的说法。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const VE = (t) => 1 - 0.8 * ramp(t, T('e4') - 0.6, 0.8);   // 讲「先给结论」时，前面的纸和柱子退成淡影

  // ── 人的草稿：正俯视，一行一行写出来 ──
  const HX = -1180, HY = -400, HL = 172;
  const HAND = ['92138 = 92000 + 138', '25992 × 92000 = <u>2391264000</u>', '25992 × 138 = <u>3586896</u>', '<u>2391264000</u> + <u>3586896</u> = 2394850896'];
  HAND.forEach((txt, i) => {
    const e = W.print(`<div class="hand">${txt}</div>`, HX, HY + i * HL);
    const ta = T('e1', '纸') - 0.9 + i * 0.45;
    fade(W, e, (t) => ramp(t, ta, 0.4) * VE(t));
    sfx('key', ta, { g: 0.2 });
  });
  const hp = W.board('<div class="lbl g">人的纸</div>', HX, HY, 0, 0, -120);
  fade(W, hp, (t) => ramp(t, T('e2') - 0.3, 0.4) * VE(t));

  // ── 模型写下的字：一行方块 ──
  const MX = 260, MY = -180;
  const M = para(S, MX, MY, ['92138', '=', '92000', '+', '138', 2, '25992', '×', '92000', '=', '2,391', ',264', ',000', 3, '\n',
    '25992', '×', '138', '=', '3,586', ',896', 2, '…'], { fs: 46, lh: 112, maxW: 1500 });
  M.forEach((k, i) => {
    const ta = lerp(T('e2', '自己') - 0.4, T('e2', '写下') + 0.6, i / (M.length - 1));
    place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * VE(t) }));
    if (i % 3 === 0) sfx('key', ta, { g: 0.14 });
    if (k.b.top.firstChild) fade(W, k.b.top.firstChild, (t) => 1 - ramp(t, T('e3') - 0.4, 0.5));
  });
  const mp = W.board('<div class="lbl g">它写下的字</div>', MX, MY, 30, 0, -110);
  fade(W, mp, (t) => ramp(t, T('e2', '写下') - 0.2, 0.4) * VE(t));

  // ── 答案之前写下了多少：一薄片（四块）与一座柱子（三百多块）；每块一道淡纹 ──
  const SG = 3, CYc = MY - 330, XS1 = MX + 240, XS2 = MX + 900;
  const c1 = column(W, S, XS1, CYc, { w: 150, d: 100, seg: SG, n: (t) => 4 * ramp(t, T('e3') + 0.2, 0.5), op: VE });
  const c2 = column(W, S, XS2, CYc, { w: 150, d: 100, seg: SG, n: (t) => 321 * ramp(t, T('e3') + 0.4, 2.8, ease.io3), op: VE });
  c1.g.classList.add('fine'); c2.g.classList.add('fine');
  const l1 = W.board('<div class="lbl" style="transform:translateX(-50%)">四块</div>', XS1, CYc, 40, 0, -80);
  const l2 = W.board('<div class="lbl" style="transform:translateX(-50%)">三百多块</div>', XS2, CYc, 321 * SG + 40, 0, -80);
  fade(W, l1, (t) => ramp(t, T('e3') + 0.5, 0.4) * VE(t)); fade(W, l2, (t) => ramp(t, T('e3', '一步一步') + 0.2, 0.4) * VE(t));
  sfx('riser', T('e3', '答案之前') - 0.2, { g: 0.12 });

  // ── 先给结论，再讲理由 ──
  const RX = -700, RY = 520;
  const qb = block(S, '问题', { w: 200, d: 100, h: 30, fs: 44 });
  place(W, qb.g, (t) => ({ x: RX + 100, y: RY, z: 40 * (1 - ramp(t, T('e4') - 0.5, 0.4, ease.out3)), o: ramp(t, T('e4') - 0.5, 0.3) }));
  const R = para(S, RX, RY, ['结论', '因为', 3, 2, 3, '所以', 2, 3], { fs: 44, d: 100, h: 30, x1st: RX + 230 });
  const con = R[0], why = R.slice(1);
  const tCon = T('e4', '结论') - 0.2;
  place(W, con.b.g, (t) => ({ x: con.x, y: con.y, z: 40 * (1 - ramp(t, tCon + 0.9, 0.4, ease.out3)), o: ramp(t, tCon + 0.9, 0.25) }));
  // 结论那一趟：立起一摞层，算到顶；每一层只读得到前面的问题
  const YR = RY - 120, NP = 40, GP = 10, HH = NP * GP;
  ream(W, S, con.x, YR, { w: con.w * 0.7, d: 60, gap: GP, n: NP, rise: (t) => ramp(t, tCon - 0.3, 0.4, ease.out3), fill: (t) => ramp(t, tCon, 0.8, (k) => k) });
  const wl = wall(S, RX - 40, YR + 31, 1600, HH + 60);
  const ra = svg('path', { fill: 'none', stroke: '#1c1c1c', 'stroke-width': 1.8, opacity: 0 }, wl.s);
  W.up((t) => {
    const f = clamp((t - tCon) / 0.8);
    if (t < tCon || f >= 1) { ra.setAttribute('opacity', 0); return; }
    const x0 = wl.X(con.x0 + 10), y0 = wl.Y(f * HH), x1 = wl.X(RX + 180), y1 = wl.Y(0);
    ra.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} Q ${((x0 + x1) / 2).toFixed(1)} ${(Math.min(y0, y1) - 60).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    ra.setAttribute('opacity', (0.75 * Math.min(1, f * 10, (1 - f) * 10)).toFixed(3));
  });
  sfx('tick', tCon + 0.9, { g: 0.25 });
  // 理由：结论之后才写；读得到结论（弧线落回结论），却没有参与得出它——淡下去
  const tWhy = T('e4', '理由') - 0.5;
  const whyOp = (t) => 1 - 0.78 * ramp(t, T('e5', '没有参与') - 0.1, 0.9);
  why.forEach((k, i) => {
    const ta = tWhy + i * 0.13;
    place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * whyOp(t) }));
    sfx('key', ta, { g: 0.12 });
  });
  [why[2], why[4], why[6]].forEach((k, i) => arc3(W, S, [k.x, k.y - 20, 34], [con.x + 20, con.y - 10, 34], 110 + i * 30, { n: 24,
    draw: (t) => ramp(t, T('e5', '理由') - 0.2 + i * 0.12, 0.6), op: (t) => 1 - ramp(t, T('e5', '没有参与') + 0.2, 0.7) }));
  arc3(W, S, [con.x + 30, con.y + 20, 34], [why[3].x, why[3].y + 20, 34], 150, { n: 28, cls: 'g w',
    draw: (t) => 0.4 * ramp(t, T('e5', '没有参与') - 0.3, 0.5) * (1 - ramp(t, T('e5', '那个结论') - 0.1, 0.5)) });
  rectOf(W, S, R, 0, 0, (t) => ramp(t, T('e5', '那个结论') - 0.2, 0.4));
  const lc = W.board('<div class="lbl">结论</div>', con.x, RY, 40, -40, -120);
  const lw = W.board('<div class="lbl g">理由</div>', why[3].x, RY, 40, -40, -120);
  fade(W, lc, (t) => ramp(t, tCon + 0.9, 0.4)); fade(W, lw, (t) => ramp(t, tWhy + 0.4, 0.4) * whyOp(t));

  // ── 片名 ──
  const TC = blankCam(-200, 2000);
  const tt = T('eT') - 0.2;
  const tc = W.print('<div class="title-cot" style="transform:translate(-50%,-50%)">CoT</div>', TC.cx, TC.cy - 70);
  const tr_ = seg(S, ''); tr_.set([TC.cx - 66, TC.cy + 46, 0.6], [TC.cx + 66, TC.cy + 46, 0.6]);
  const tz = W.print('<div class="title-zh" style="transform:translate(-50%,-50%)">先思考，再回答</div>', TC.cx, TC.cy + 120);
  fade(W, tc, (t) => ramp(t, tt, 0.9)); fade(W, tr_.e, (t) => ramp(t, tt + 0.4, 0.6)); fade(W, tz, (t) => ramp(t, tt + 0.6, 0.9));

  // ── 镜头：从正俯视的空纸开始（和上一章末尾一样），看着草稿写出来，再倾下来 ──
  const B0 = blankCam(HX + 640, HY + 160);
  const hold = (a, b) => Math.max(0.5, b - a);
  W.cam([
    [s.start, B0, 0.01],
    [T('e1') - 0.3, { ...B0, cy: B0.cy + 20, pitch: 14, yaw: -2, k: 1.0 }, hold(T('e1') - 0.3, T('e2') - 0.4), (k) => smooth(k)],
    [T('e2') - 0.4, { cx: -120, cy: -150, cz: 40, pitch: 34, yaw: -8, k: 0.84 }, 2.0],
    [T('e3') - 0.2, { cx: XS2 - 200, cy: CYc + 60, cz: 300, pitch: 74, yaw: -18, k: 0.7 }, 1.8],
    [T('e3', '一步一步') - 0.6, { cx: XS2 - 160, cy: CYc, cz: 321 * SG - 120, pitch: 80, yaw: -10, k: 0.82 }, hold(T('e3', '一步一步') - 0.6, Tend('e3') + 0.6), (k) => smooth(k)],
    [T('e4') - 0.6, { cx: RX + 440, cy: RY - 70, cz: 60, pitch: 60, yaw: -12, k: 1.05 }, 1.8],
    [null, { cx: RX + 470, cy: RY - 70, cz: 60, pitch: 61, yaw: -6, k: 1.05 }, hold(T('e4') + 1.3, Tend('e5') + 0.3), (k) => k],
    [T('eT') - 1.0, TC, 1.9],
    [null, { ...TC, cy: TC.cy + 18 }, hold(T('eT') + 1.0, s.end + 0.5), (k) => k],
  ]);
  sfx('whoosh', T('e2') - 0.4, { g: 0.18 }); sfx('whoosh', T('e4') - 0.6, { g: 0.18 }); sfx('whoosh', T('eT') - 1.0, { g: 0.22 });
});
