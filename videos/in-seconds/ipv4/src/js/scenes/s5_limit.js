// 不够用了（e1–e6）。
// e1 网络图暗下去，下方 203.0.113.80 的四个数各展开成 8 格 0 和 1，共 32 格，标「32 位」。
// e2 读数滚到 4,294,967,296（2³²），约 43 亿个地址，盖上「不够分」。
// e3 图亮回来，回到你家：电脑与手机各发一个数据包给家里的路由器，出门时「发自」都换成同一个公网地址 198.51.100.7；
//    下方两行对照，注明 192.168 开头是家里用的地址（私有地址），各家都能重复用。
// e4 「全球统一管理的地址池」窗口：256 块（每块 /8）按 IANA 登记表着色（research/lab/out_20_iana_pool.txt），
//    最后 5 块在「分完了」时依次填上，状态栏变成「空闲 0 块 · 地址池已空」（2011 年 2 月）。
// e5 下方 32 格接着长成 128 格（四行），标「IPv6：128 位」。
// e6 先看网络（远方网络的标题条变藏青）→ 再一站站往前送：数据包从你的电脑出发，沿主干线走过三台路由器，进到目的电脑。
// 256 个 /8 的类别，由 research/lab/20_iana_pool.py 的输出抄来：A 已分配，R 保留或特殊用途，L 2011 年 2 月的最后五块
const IANA_KINDS = 'RAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLAAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR';
scene('limit', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { P, LY, HB, DB, hr, R, pc, phone, target, ovLit } = M;
  const tE1 = T('e1'), tE3 = T('e3'), tE5 = T('e5'), tE4 = T('e4');
  gauge(tE1, tr('要去', 'To'), [203, 0, 113, 80]);

  // ═══ e1：网络图暗下去；四个数各展开成 8 位 ═══
  const dim = h('div', 'mapdim', M.mapG); px(dim, 69, 174, 1782, 489);
  fromTo(dim, Q(Tend('s1') + 1.0), { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.4, ease: 'power1.out' });
  fromTo(dim, Q(T('e3', '于是')), { autoAlpha: 0.55 }, { autoAlpha: 0, duration: 0.35, ease: 'power1.in', immediateRender: false });
  const OCT = [203, 0, 113, 80];
  const cellX = (i) => 100 + i * 36 + Math.floor(i / 8) * 22;
  const decs = OCT.map((v, g) => ctxt(world, 'lat', String(v), cellX(g * 8) + (8 * 36 - 2) / 2, 760));
  decs.forEach((e) => css(e, { font: '500 32px/1 "Inter"', color: 'var(--navy)' }));
  const tDec = Q(T('e1', '四'));
  decs.forEach((e, g) => { vanish(e, 0); slam(e, tDec + g * 0.12, { from: 1.4, d: 0.3 }); span(e, 0, tE3); });
  const bits = bits32(OCT);
  const bc = [...bits].map((b, i) => { const e = h('div', 'bit sunken', world, b); px(e, cellX(i), 800, 34, 46); css(e, { font: '400 36px/40px "Pixel"' }); return e; });
  const tBits = Q(T('e1', '电脑'));
  bc.forEach((e, i) => { vanish(e, 0); appear(e, tBits + Math.floor(i / 8) * 0.22 + (i % 8) * 0.02); span(e, 0, tE3); });
  [0, 1, 2, 3].forEach((g) => sfx('key', tBits + g * 0.22, { g: 0.5, p: -0.5 + g * 0.3 }));
  const l32 = txt(world, 'ilab', tr('32 位', '32 bits'), 1340, 760); css(l32, { color: 'var(--navy)' });
  vanish(l32, 0); slam(l32, Q(T('e1', '三十二')), { from: 1.5, d: 0.35 }); span(l32, 0, tE3);
  sfx('thud', Q(T('e1', '三十二')), { g: 0.6, p: 0.4 });
  const tMark = Q(T('e1', '三十二'));
  bc.forEach((e) => classOn(e, 'n', tMark, Q(T('e2', '总共'))));          // 32 格一起变藏青，读到「总共」时放下

  // ═══ e2：2³² = 4,294,967,296，约 43 亿；不够分 ═══
  const tCnt = Q(T('e2', '总共'));
  const pw = txt(world, 'inote', '2<sup>32</sup> =', 1340, 812);
  const cnt = txt(world, 'px', '0', 1450, 802); css(cnt, { fontSize: '58px', color: 'var(--navy)' });
  countTo(cnt, 0, 4294967296, tCnt + 0.1, 1.1);
  classOn(cnt, 'hl', Q(T('e2', '不')), Q(T('e3', '设备')));               // 读到「不够分」时这个数反白
  const yi = txt(world, 'inote', tr('约 43 亿个地址', '≈ 4.3 billion'), 1340, 880);
  const nf = h('div', 'chip', world, tr('不够分', 'Not enough')); px(nf, 1600, 882);
  const tE2x = Q(T('e3', '设备')) - 0.05;          // 读数与「不够分」留到 e3 的说明出现之前
  [pw, cnt].forEach((e) => { vanish(e, 0); appear(e, tCnt); span(e, 0, tE2x); });
  vanish(yi, 0); wipe(yi, Q(T('e2', '四十三亿')), { d: 0.4 }); span(yi, 0, tE2x);
  vanish(nf, 0); slam(nf, Q(T('e2', '不')), { from: 1.5, d: 0.35 }); span(nf, 0, tE2x);
  sfx('riser', tCnt + 0.1, { g: 0.35 }); sfx('thud', Q(T('e2', '不')), { g: 0.7, p: 0.5 });

  // ═══ e3：一家的设备出门时共用一个地址 ═══
  const tHome = Q(T('e3', '一家'));
  classOn(HB.el, 'on', tHome, T('e4'));
  const rowY = [772, 852];
  const rows = [[tr('你的电脑', 'Computer'), '192.168.1.10'], [tr('手机', 'Phone'), '192.168.1.23']].map(([n, a], k) => {
    const g = h('div', 'abs', world);
    txt(g, 'ilab', n, 100, rowY[k] + 8);
    const ad = txt(g, 'px', a, 290, rowY[k]); css(ad, { fontSize: '50px' });
    const ar = txt(g, 'inote', tr('出门时 →', 'out as →'), 620, rowY[k] + 6);
    const pub = h('div', 'chip', g, '<span class="px">198.51.100.7</span>'); px(pub, 790, rowY[k] - 2); css(pub.firstChild, { fontSize: '44px' });
    vanish(g, 0); slide(g, tHome + k * 0.2, { x: -40, d: 0.4 }); span(g, 0, T('e4'));
    return { g, pub, ar };
  });
  const tOut = Q(T('e3', '出门'));
  const tShare = Q(T('e3', '共'));
  rows.forEach((r, k) => { vanish(r.ar, 0); appear(r.ar, tOut + k * 0.2); vanish(r.pub, 0); slam(r.pub, tShare + k * 0.15, { from: 1.4, d: 0.3 }); });
  sfx('thud', tShare, { g: 0.6, p: -0.2 });
  const pn = txt(world, 'inote', tr('<span class="px">192.168</span> 开头：家里用的地址', '<span class="px">192.168…</span>: home addresses'), 1180, 770);
  const pn2 = txt(world, 'inote', tr('（私有地址，各家都能重复用）', '(private, reused by every home)'), 1180, 830);
  [pn, pn2].forEach((e, i) => { vanish(e, 0); wipe(e, Q(T('e3', '设备')) + i * 0.25, { d: 0.45 }); span(e, 0, T('e4')); });
  // 图上：两个数据包到家里的路由器，出门后继续沿主干线走
  const pA = h('div', 'pk light', M.mapG), pB = h('div', 'pk light', M.mapG);
  const outP = [P.hr, [560, LY]];
  glide(pA, [[tOut, tOut + 0.7, [P.pc, P.busTop, P.busMid, P.hr]], [tShare + 0.3, tShare + 0.9, outP]], tOut, tShare + 0.95);
  glide(pB, [[tOut + 0.2, tOut + 0.9, [P.phone, P.busBot, P.busMid, P.hr]], [tShare + 0.5, tShare + 1.1, outP]], tOut + 0.2, tShare + 1.15);
  classOn(hr, 'hot', tOut + 0.7, tShare + 1.2);
  sfx('whoosh', tOut, { g: 0.35 }); sfx('tick', tOut + 0.7, { g: 0.5 }); sfx('tick', tOut + 0.9, { g: 0.5, p: 0.3 });
  const pubMap = h('div', 'chip', M.mapG, '<span class="px">198.51.100.7</span>'); px(pubMap, 312, 502); css(pubMap.firstChild, { fontSize: '28px' });
  vanish(pubMap, 0); slam(pubMap, tShare, { from: 1.4, d: 0.3 }); span(pubMap, 0, T('e4'));
  classOn(pc, 'sel', tHome, T('e4')); classOn(phone, 'sel', tHome, T('e4'));

  // ═══ e4：二〇一一年，全球统一管理的地址池分完了 ═══
  const tPool = Q(T('e4') - 0.2);
  const W = makeWin(world, 60, 112, 1800, 560, tr('全球统一管理的地址池（IANA）· IPv4 共 256 块', 'The global address pool (IANA) · 256 blocks'), { sunken: true });
  vanish(W.el, 0);
  openWin(W, tPool, [100, 760, 1700, 180], { sound: 'drive', g: 0.55 });
  const cells = [];
  [...IANA_KINDS].forEach((k, i) => {
    const e = h('div', 'cell ' + k, W.body); px(e, 123 + (i % 32) * 48, 18 + Math.floor(i / 32) * 46, 42, 38);
    cells.push([e, k]);
  });
  // 已分配与保留的块一行一行出现（一次一整行，是看得见的大步），最后 5 块一开始就以「空闲」显示
  cells.forEach(([e, k], i) => { if (k !== 'L') { vanish(e, 0); appear(e, tPool + 0.3 + Math.floor(i / 32) * 0.28); } });
  for (let r = 0; r < 8; r++) sfx('key', tPool + 0.3 + r * 0.28, { g: 0.35, p: -0.6 + r * 0.17 });
  const last = cells.filter(([, k]) => k === 'L').map(([e]) => e);
  const tDone = Q(T('e4', '分完'));
  last.forEach((e, i) => { classOn(e, 'done', tDone + i * 0.1); sfx('tick', tDone + i * 0.1, { g: 0.6, p: -0.5 + i * 0.25 }); });
  const st = txt(W.body, 't-b', '', 123, 402);
  htmlAt(st, tPool + 0.3, tr('2011 年 2 月 · 空闲 <b>5</b> 块', 'Feb 2011 · <b>5</b> free'));
  const tEmpty = tDone + 0.1 * 4 + 0.2;
  htmlAt(st, tEmpty, tr('2011 年 2 月 · 空闲 <b>0</b> 块', 'Feb 2011 · <b>0</b> free'));
  const empty = h('div', 'chip', W.body, tr('地址池已空', 'Pool empty')); px(empty, 560, 398); css(empty, { fontSize: '30px' });
  vanish(empty, 0); slam(empty, tEmpty, { from: 1.5, d: 0.35 });
  sfx('error', tEmpty, { g: 0.4 });
  // 图例
  const lg = h('div', 'abs', W.body); px(lg, 1000, 404);
  [['A', tr('已分配', 'allocated')], ['R', tr('保留', 'reserved')], ['L', tr('最后 5 块', 'last 5')]].forEach(([k, n], i) => {
    const c = h('div', 'cell ' + k, lg); px(c, i * 230, 2, 30, 30);
    txt(lg, 't-b', n, i * 230 + 44, 0).style.fontSize = '28px';
  });
  const tClose = Q(T('e5', '一百二十八') - 0.25);
  zoomFx(tClose, W.rect, [100, 760, 1700, 180], 0.25);
  vanish(W.el, tClose);
  hideWin(M.mapG, tPool + 0.25, tClose);
  sfx('whoosh', tClose, { g: 0.35 });

  // ═══ e5：接班的 IPv6 有一百二十八位 ═══
  const cx6 = (i) => 100 + i * 36 + Math.floor(i / 8) * 8;
  const r6 = [];
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 32; i++) {
      const e = h('div', 'b6 sunken', world, r === 0 ? bits[i] : ''); px(e, cx6(i), 762 + r * 44, 34, 38);
      if (r === 0) css(e, { font: '400 34px/32px "Pixel"', textAlign: 'center' });
      r6.push(e);
    }
  }
  const t128 = Q(T('e5', '一百二十八'));
  // 读到「接班」时，IPv4 的 32 格整行变藏青（被接班的就是它），长出 128 格时放下
  r6.slice(0, 32).forEach((e) => classOn(e, 'n', Q(T('e5', '接班')), t128));
  sfx('blip', Q(T('e5', '接班')), { g: 0.45, p: -0.2 });
  r6.forEach((e, i) => {
    const r = Math.floor(i / 32);
    vanish(e, 0);
    appear(e, r === 0 ? tE4 + 0.3 + (i % 32) * 0.008 : t128 + (r - 1) * 0.22 + (i % 32) * 0.01);
  });
  [1, 2, 3].forEach((r) => sfx('key', t128 + (r - 1) * 0.22, { g: 0.5, p: -0.3 + r * 0.2 }));
  const l4 = txt(world, 'inote', tr('<b>IPv4</b>：32 位', '<b>IPv4</b>: 32 bits'), 1340, 758);
  vanish(l4, 0); wipe(l4, tE4 + 0.5, { d: 0.35 });
  const l6 = h('div', 'chip', world, tr('IPv6：接班者，128 位', 'IPv6: the successor, 128 bits')); px(l6, 1340, 806); css(l6, { fontSize: '28px' });
  l6.dataset.gloss = 'IPv6';
  vanish(l6, 0); appear(l6, Q(T('e5', 'IPv6')));
  css(l6, { transformOrigin: '0% 50%' });
  const b6 = h('div', 'brk', world); px(b6, 1288, 762, 12, 162); css(b6, { borderTop: '3px solid var(--black)', borderLeft: 'none', height: '160px' });
  vanish(b6, 0); appear(b6, t128 + 0.7);
  sfx('thud', t128, { g: 0.6, p: 0.3 });

  // ═══ e6：找路的办法照旧：先看网络，再一站站往前送 ═══
  const tNet = Q(T('e6', '网络'));
  // 「办法照旧」：三个网络的标题条一起亮——找路仍旧先看网络；读到「先看网络」时只留目的地那个
  const tOld = Q(T('e6', '找路'));
  [HB, M.OB].forEach((z) => classOn(z.el, 'on', tOld, tNet));
  classOn(DB.el, 'on', tOld, Infinity);
  sfx('blip', tOld, { g: 0.45, p: -0.3 });
  const c1 = h('div', 'chip', world, tr('先看网络', 'Network first')); px(c1, 1340, 866);
  const c2 = h('div', 'chip', world, tr('再一站站往前送', 'then hop by hop')); px(c2, 1520, 866);
  vanish(c1, 0); slam(c1, tNet, { from: 1.4, d: 0.3 });
  const tHop = Q(T('e6', '一站'));
  vanish(c2, 0); slam(c2, tHop, { from: 1.4, d: 0.3 });
  sfx('blip', tNet, { g: 0.55 });
  // 数据包从你的电脑出发：先到家里的路由器，再一站站
  const pk2 = h('div', 'pk', M.mapG);
  const tS0 = Q(T('e6', '先'));
  const legs = [[tS0, tS0 + 0.7, [[154, 292], P.pc, P.busTop, P.busMid, P.hr]]];
  litPath(ovLit, [P.pc, P.busTop, P.busMid, P.hr], tS0, tS0 + 0.7);
  const hopT = [tHop, tHop + 0.45, tHop + 0.9];
  const stopsX = [P.hr, ...P.r];
  hopT.forEach((t, i) => {
    legs.push([t, t + 0.4, [stopsX[i], stopsX[i + 1]]]);
    litPath(ovLit, [stopsX[i], stopsX[i + 1]], t, t + 0.4);
    classOn(R[i], 'hot', t + 0.4, i < 2 ? hopT[i + 1] + 0.4 : Infinity);
    sfx('tick', t + 0.4, { g: 0.5, p: -0.2 + i * 0.3 });
  });
  const tIn = hopT[2] + 0.5;
  const finalP = [P.r[2], [P.cols[2], LY], [P.cols[2], 519]];
  legs.push([tIn, tIn + 0.7, finalP]);
  litPath(ovLit, [P.r[2], [P.cols[2], LY], [P.cols[2], 488]], tIn, tIn + 0.6);
  glide(pk2, legs, tS0, tIn + 0.7);
  classOn(target, 'hot', tIn + 0.7, Infinity);
  sfx('chime', tIn + 0.7, { g: 0.6, p: 0.6 });
});
