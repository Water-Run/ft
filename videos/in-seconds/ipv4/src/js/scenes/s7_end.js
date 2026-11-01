// 收尾（z0、z3）与结尾的引子（z2）。
// z0 回到开头这四个数：下方又是「要去 203.0.113.80」，读到「前一截」时前三格反白、标「网络」，图上目的网络亮起；
//    数据包从你的电脑出发，先到家里的路由器。
// z3 路由器一站站接力（路由器 1、2、3 依次亮起），读到「后一截」时第四格反白、标「设备」，数据包沿网线进到那台电脑。
// z2 读到「不够」时地址旁标出「地址不够」；读到「留给」时打开「接班者：IPv6」窗口——大字 IPv6，128 格一行行长出，
//    第一行（32 格）标作 IPv4 的长度；只露出名字与长度，不展开（策划者：「ipv6作为最后的引子就行」）。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { P, LY, R, hr, target, lab, DB, ovLit } = M;
  const tIn = M.tPoolClose + 0.25, tOut = L.scenes.find((x) => x.id === 'outro').start + 0.3;

  // ═══ z0：回到这四个数：前一截找网络 ═══
  const il = txt(world, 'ilab', tr('要去', 'To'), 100, 812);
  const ad = bigAddr(world, 230, 778, [203, 0, 113, 80]);
  [il, ad.el].forEach((e) => { vanish(e, 0); appear(e, tIn); span(e, 0, tOut); });
  const tFour = Q(T('z0', '四'));
  ad.cells.forEach((c, i) => pulse(c, tFour + 0.3 + i * 0.08, 1.2, 0.25));
  sfx('key', tFour, { g: 0.5 });
  const tNet = Q(T('z0', '前'));
  ad.cells.slice(0, 3).forEach((c) => classOn(c, 'hl', tNet, tOut));
  const bN = h('div', 'brk', world); px(bN, 236, 880, 524, 12);
  const lN = ctxt(world, 'ilab', tr('网络', 'Network'), 498, 900); css(lN, { fontSize: '30px', color: 'var(--navy)' });
  [bN, lN].forEach((e) => { vanish(e, 0); appear(e, tNet); span(e, 0, tOut); });
  const tNetMap = Q(T('z0', '网络'));
  classOn(DB.el, 'on', tNetMap, tOut);
  lab.dest.forEach((l) => classOn(l.pre, 'hl', tNetMap, tOut));
  sfx('blip', tNet, { g: 0.55 });

  // ═══ z3：路由器接力，后一截找设备 ═══
  const pk = h('div', 'pk', M.mapG);
  const legs = [[tNet, tNet + 0.6, [[154, 292], P.pc, P.busTop, P.busMid, P.hr]]];
  litPath(ovLit, [P.pc, P.busTop, P.busMid, P.hr], tNet, tNet + 0.6, tOut);
  classOn(hr, 'hot', tNet + 0.6, Q(T('z3', '路由')));
  const tR = Q(T('z3', '路由'));
  const hopT = [tR, tR + 0.35, tR + 0.7];
  const stops = [P.hr, ...P.r];
  hopT.forEach((t, i) => {
    legs.push([t, t + 0.3, [stops[i], stops[i + 1]]]);
    litPath(ovLit, [stops[i], stops[i + 1]], t, t + 0.3, tOut);
    classOn(R[i], 'hot', t + 0.3, i < 2 ? hopT[i + 1] + 0.3 : tOut);
    sfx('tick', t + 0.3, { g: 0.5, p: -0.2 + i * 0.3 });
  });
  const tHost = Q(T('z3', '后'));
  classOn(ad.cells[3], 'hl', tHost, tOut);
  const bD = h('div', 'brk', world); px(bD, 806, 880, 144, 12);
  const lD = ctxt(world, 'ilab', tr('设备', 'Device'), 878, 900); css(lD, { fontSize: '30px' });
  [bD, lD].forEach((e) => { vanish(e, 0); appear(e, tHost); span(e, 0, tOut); });
  const fin = [P.r[2], [P.cols[2], LY], [P.cols[2], 519]];
  legs.push([tHost, tHost + 0.7, fin]);
  litPath(ovLit, [P.r[2], [P.cols[2], LY], [P.cols[2], 488]], tHost, tHost + 0.6, tOut);
  glide(pk, legs, tNet, tHost + 0.7);
  classOn(target, 'hot', tHost + 0.7, tOut);
  classOn(lab.target.host, 'hl', tHost + 0.7, tOut);
  classOn(lab.target.el, 'sel', tHost + 0.7, tOut);
  sfx('blip', tHost, { g: 0.5 }); sfx('chime', tHost + 0.7, { g: 0.6, p: 0.6 });

  // ═══ z2：地址不够的问题，留给了接班的 IPv6 ═══
  const tNo = Q(T('z2', '不够'));
  const nf = h('div', 'chip', world, tr('32 位，约 43 亿个：地址不够', '32 bits, ≈ 4.3 billion: not enough')); px(nf, 1040, 810);
  vanish(nf, 0); slam(nf, tNo, { from: 1.3, d: 0.3 }); span(nf, 0, tOut);
  sfx('thud', tNo, { g: 0.55, p: 0.3 });
  const tWin = Q(T('z2', '不够'));
  const W = makeWin(world, 60, 112, 1800, 560, tr('接班者：IPv6', 'The successor: IPv6'));
  vanish(W.el, 0);
  openWin(W, tWin, [1040, 810, 560, 44], { sound: 'drive', g: 0.55 });
  hideWin(M.mapG, tWin + 0.25, 1e9);
  const b = W.body;
  const big6 = txt(b, 't-big', 'IPv6', 54, 6); css(big6, { fontSize: '210px' });
  classOn(big6, 'hl', Q(T('z2', 'IPv6')), Infinity);
  const g6 = txt(b, 't-m', tr('IPv4 的接班者，地址 128 位', 'IPv4\'s successor, 128-bit addresses'), 660, 40); css(g6, { fontSize: '40px' });
  g6.dataset.gloss = 'IPv6';
  const cells = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 32; i++) { const e = h('div', 'b6 sunken', b); px(e, 660 + i * 34, 120 + r * 44, 28, 34); cells.push(e); }
  const t128 = Q(T('z2', '留给'));
  cells.forEach((e, i) => { const r = Math.floor(i / 32); vanish(e, 0); appear(e, r === 0 ? tWin + 0.3 : t128 + (r - 1) * 0.22); });
  cells.slice(0, 32).forEach((e) => classOn(e, 'n', tWin + 0.3, Infinity));
  [1, 2, 3].forEach((r) => sfx('key', t128 + (r - 1) * 0.22, { g: 0.5, p: -0.3 + r * 0.2 }));
  const k4 = txt(b, 't-b', tr('第一行：IPv4 的 32 位', 'row 1: IPv4\'s 32 bits'), 660, 308);
  const k6 = txt(b, 't-b', tr('四行：IPv6 的 128 位', 'all four rows: IPv6\'s 128 bits'), 1160, 308);
  vanish(k4, 0); appear(k4, tWin + 0.4); vanish(k6, 0); appear(k6, t128);
  sfx('thud', t128, { g: 0.5, p: 0.4 });
});
