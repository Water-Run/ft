// 收尾。一摞被盖子压住，头顶一条线：层数定死了。摞一摞接一摞往右长出去，高度都顶着那条线，镜头退开看长度：
// 能想多远没有定死，看中间写下了多少字。最后另一张纸插进来，落在片名上。
// 事实：a7 层数固定；b6–b8 写下来才接得上；r13。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, HOME);
  const off = (a, d = 0.5) => (t) => 1 - ramp(t, a, d);
  const A = W.sheet({ in: [s.start + 0.05, 'r', 1.0], out: [T('e6') - 0.55, 'l', 1.0], w: 5400, h: 1400, x: 1500, y: -30 });
  const NS = 8, GP = 430, SX = (i) => -1650 + i * GP, SY = -40, RW = 300, RD = 190, LAY = 70, SEP = 7, H = LAY * SEP, SL = 250;
  const tE3 = T('e3'), tFix = T('e3', '定了') - 0.42, tE4 = T('e4'), tNo = T('e4', '没有定死') - 0.2, tE5 = T('e5'), tB5 = T('e5', '回答之前') - 0.2, tMid = T('e5', '中间步骤') - 0.2, tE5e = Tend('e5');
  const start = [tE3 + 0.1];
  for (let i = 1; i < NS; i++) start.push(lerp(tNo + 0.05, tE5e - 0.4, (i - 1) / (NS - 2)));
  const ST = start.map((ta, i) => {
    const R = A.stack(SX(i), SY, { w: RW, d: RD, n: LAY, gap: SEP, rise: (t) => ramp(t, i ? ta - 0.32 : ta, i ? 0.42 : 0.9, ease.out3), fill: (t) => ramp(t, ta + (i ? 0.06 : 0.75), 0.55, linear) });
    R.marks(90 + i, 14); return R;
  });
  sfx('riser', tE3 + 0.1, { g: 0.1 });
  ST[0].lid(tFix, () => 1); sfx('pop', T('e3', '定了'), { g: 0.34 });
  // 顶上的线：层数定死的高度，一路画过去，摞摞都顶着它
  const wf = A.wall(SY - RD / 2 - 2);
  const cx1 = SX(0) - RW / 2 - 60, cx2 = (t0) => SX(NS - 1) + RW / 2 + 90;
  A.line([[cx1, -H - 26], [cx1 + RW + 130, -H - 26]], { svg: wf.svg, t0: tFix + 0.25, d: 0.45, w: 6, color: RED });
  A.line([[cx1 + RW + 130, -H - 26], [cx2(), -H - 26]], { svg: wf.svg, t0: tNo - 0.1, d: tE5e - tNo, w: 6, color: RED, ease: linear });
  A.wtext('层数：定死了', SX(0) + RW / 2 + 40, SY - RD / 2, H - 130, 82, (t) => ramp(t, tFix + 0.25, 0.4) * off(tNo - 0.1, 0.4)(t), 'e');
  // 摞与摞之间：写下来的字
  for (let i = 0; i < NS - 1; i++) {
    const xa = (SX(i) + SX(i + 1)) / 2, ta = i === 0 ? tB5 : Math.max(tB5, start[i + 1] - 0.4), zt = H * 0.8;
    A.tok(i === 0 ? '写下来' : '', { keys: i === 0 ? [[ta, xa, SL, 120], [ta + 0.32, xa, SL, 0]] : [[ta, SX(i), SY, H + 20], [ta + 0.36, xa, SL, 0]], t0: ta, fadeIn: 0.1, w: i === 0 ? 260 : 150, d: 96, h: 16, fs: 64, cls: i === 0 ? undefined : 'cube dk' });
    sfx('pop', ta + 0.34, { g: 0.12 });
  }
  A.arrow([[SX(0) - RW / 2, SL + 150], [SX(NS - 1) + RW / 2 + 40, SL + 150]], { t0: tNo, d: tE5e + 0.4 - tNo, w: 15, head: 60, ease: linear });
  A.text('能想多远，并没有定死', SX(0) - 150, SL + 60, { fs: 96, cls: 'b', t0: tNo + 0.05, d: 0.4, off: off(tMid - 0.3, 0.35) });
  A.text('能想多远，看写下了多少', SX(0) + 1520, SL + 340, { fs: 180, cls: 'b', align: 'c', t0: tMid + 0.1, d: 0.6, off: off(T('e6') - 0.2) });

  // ── 思考就是写下来 ──
  const tB = T('e6') - 0.55;
  const B = W.sheet({ in: [tB, 'b', 1.0], out: [T('e7') - 0.95, 't', 1.0], w: 1640, h: 860 });
  B.text('对它来说', 0, -180, { fs: 82, cls: 'g', align: 'c', t0: T('e6') + 0.05 });
  const tThink = T('e6', '思考') - 0.2, tWr = T('e6', '写下来') - 0.25;
  B.text('思考', -150, 60, { fs: 200, cls: 'b', align: 'r', t0: tThink, d: 0.35 });
  B.line([[-120, 34], [20, 34]], { t0: tWr - 0.25, d: 0.25, w: 10 });
  B.line([[-120, 90], [20, 90]], { t0: tWr - 0.1, d: 0.25, w: 10 });
  B.text('写下来', 50, 60, { fs: 200, cls: 'b', t0: tWr, d: 0.4 });

  // ── 片名 ──
  const tC = T('e7') - 0.95;
  const C = W.sheet({ in: [tC, 'r', 1.0], w: 1560, h: 880 });
  const tSi = T('e7') + 0.05, mid = T('e7', '再回答') ? T('e7', '再回答') - 0.2 : T('e7') + 1;
  C.text('先思考，', 95, 2, { fs: 190, cls: 'b', align: 'r', t0: tSi, d: 0.5 });
  C.text('再回答', 95, 2, { fs: 190, cls: 'b', t0: mid, d: 0.5 });
  C.bar(-480, 170, 960, 7, { t0: mid + 0.5, d: 3.0, color: INK, ease: linear, r: 0 });
  sfx('chime', T('e7') + 0.1, { g: 0.2 });

  const box0 = ST[0].box, boxN = ST[NS - 1].box;
  const shOne = fitCam([box0, A.p(SX(0), SY, H + 150), A.p(SX(0) - 300, SL + 130), A.p(SX(0) + 900, SL + 130), A.p(SX(0) + 900, SY, H)], { pitch: 42, cz: A.Z + H * 0.34, kmax: 1.0 });
  const shAll = fitCam([box0, boxN, A.p(SX(0) - 240, SL + 450), A.p(SX(NS - 1) + 300, SL + 450)], { pitch: 26, cz: A.Z + H * 0.2 });
  W.cam([
    [s.start, shOne, 0.9],
    [tNo - 0.05, shAll, Math.max(2.5, tE5e + 0.3 - tNo), smooth],
    [tB, B.home({ pitch: 12, k: 1.02 }), 1.0],
    [tC, C.home({ k: 1.0 }), 1.0],
    [tC + 1.05, C.home({ k: 1.06 }), 2.9, linear],
  ]);
  [s.start + 0.05, tB, tC].forEach((a) => sfx('whoosh', a, { g: 0.14 }));
});
