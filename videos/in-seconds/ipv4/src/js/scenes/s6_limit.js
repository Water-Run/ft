// 不够用了（e1–e3）。
// e1 网络图暗下去，下方 203.0.113.80 再展开成 32 格（读到「三十二位」时 32 格一起变藏青）；读到「总共」时读数滚到 2³² = 4,294,967,296，约 43 亿。
// e2 顶部年表「1994」亮起，图下标注「1994 提出地址转换」；图亮回来，你家的电脑和手机各发一个数据包给家里的路由器，
//    出门时「发自」都换成同一个公网地址 198.51.100.7（下方两行对照）。
// e3 「全球统一管理的地址池」窗口：256 块（每块 /8）按 IANA 登记表一行行出现（research/lab/out_20_iana_pool.txt），
//    最后 5 块在「分完了」时依次填满，「地址池已空」；顶部年表「2011」亮起。
// 256 个 /8 的类别，由 research/lab/20_iana_pool.py 的输出抄来：A 已分配，R 保留或特殊用途，L 2011 年 2 月的最后五块
const IANA_KINDS = 'RAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLAAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR';
scene('limit', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { P, LY, HB, hr, pc, phone, year } = M;
  const tE1 = T('e1'), tE2 = T('e2'), tE3 = T('e3'), tEnd = T('z0');
  gauge(tE1, tr('要去', 'To'), [203, 0, 113, 80]);

  // ═══ e1：三十二位，总共约四十三亿个地址 ═══
  const dim = h('div', 'mapdim', M.mapG); px(dim, 69, 174, 1782, 489);
  fromTo(dim, Q(Tend('s2') + 0.3), { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.4, ease: 'power1.out' });
  fromTo(dim, Q(T('e2', '一家')), { autoAlpha: 0.55 }, { autoAlpha: 0, duration: 0.35, ease: 'power1.in', immediateRender: false });
  const OCT = [203, 0, 113, 80];
  const cellX = M.cellX, groupC = M.groupC, bits = M.bits;
  const decs = OCT.map((v, g) => { const e = ctxt(world, 'lat', String(v), groupC(g), 752); css(e, { font: '500 36px/1 "Inter"', color: 'var(--navy)' }); return e; });
  const bc = [...bits].map((b, i) => { const e = h('div', 'bit sunken', world, b); px(e, cellX(i), 800, 34, 46); css(e, { font: '400 36px/40px "Pixel"' }); return e; });
  zoomFx(tE1 - 0.25, [1180, 762, 640, 120], [100, 752, 1216, 100], 0.25);
  [...decs, ...bc].forEach((e) => { vanish(e, 0); appear(e, tE1); span(e, 0, tE2); });
  const t32 = Q(T('e1', '三十二'));
  bc.forEach((e) => classOn(e, 'n', t32, Q(T('e1', '总共'))));
  const l32 = txt(world, 'ilab', tr('32 位', '32 bits'), 1350, 760); css(l32, { color: 'var(--navy)' });
  vanish(l32, 0); appear(l32, t32); span(l32, 0, tE2);
  sfx('thud', t32, { g: 0.6, p: 0.4 });
  const tCnt = Q(T('e1', '总共'));
  const pw = txt(world, 'inote', '2<sup>32</sup> =', 1350, 818);
  const cnt = txt(world, 'px', '0', 1450, 808); css(cnt, { fontSize: '58px', color: 'var(--navy)' });
  countTo(cnt, 0, 4294967296, tCnt + 0.1, 0.9);
  const yi = txt(world, 'inote', tr('约 43 亿个地址', '≈ 4.3 billion'), 1350, 884);
  [pw, cnt].forEach((e) => { vanish(e, 0); appear(e, tCnt); span(e, 0, tE2 + 1.1); });
  vanish(yi, 0); appear(yi, Q(T('e1', '四十三亿'))); span(yi, 0, tE2 + 1.1);
  classOn(cnt, 'hl', Q(T('e1', '四十三亿')), tE2 + 1.1);
  sfx('riser', tCnt + 0.1, { g: 0.35 }); sfx('thud', Q(T('e1', '四十三亿')), { g: 0.6, p: 0.5 });

  // ═══ e2：九十年代就担心不够，一家人开始共用一个公网地址 ═══
  const t90 = Q(T('e2', '九十'));
  classOn(year.box[2], 'hl', t90, Infinity);
  pulse(year.box[2], t90, 1.3, 0.35);
  const n94 = h('div', 'chip w', world, tr('1994 年：提出地址转换', '1994: address translation proposed')); px(n94, 160, 120);
  css(n94, { fontSize: '28px' });
  vanish(n94, 0); appear(n94, t90 + 0.15); span(n94, 0, tE3 - 0.3);
  sfx('blip', t90, { g: 0.55 });
  const tHome = Q(T('e2', '一家'));
  classOn(HB.el, 'on', tHome, tE3);
  classOn(pc, 'sel', tHome, tE3); classOn(phone, 'sel', tHome, tE3);
  const rowY = [770, 852];
  const rows = [[tr('你的电脑', 'Computer'), '192.168.1.10'], [tr('手机', 'Phone'), '192.168.1.23']].map(([n, a], k) => {
    const g = h('div', 'abs', world);
    txt(g, 'ilab', n, 100, rowY[k] + 8);
    const ad = txt(g, 'px', a, 290, rowY[k]); css(ad, { fontSize: '50px' });
    const ar = txt(g, 'inote', tr('出门时 →', 'out as →'), 620, rowY[k] + 6);
    const pub = h('div', 'chip', g, '<span class="px">198.51.100.7</span>'); px(pub, 790, rowY[k] - 2); css(pub.firstChild, { fontSize: '44px' });
    vanish(g, 0); appear(g, tHome + k * 0.2); span(g, 0, tE3);
    return { g, pub, ar };
  });
  const tOut = Q(T('e2', '开始'));
  const tShare = Q(T('e2', '共用'));
  rows.forEach((r, k) => { vanish(r.ar, 0); appear(r.ar, tOut + k * 0.15); vanish(r.pub, 0); slam(r.pub, tShare + k * 0.15, { from: 1.4, d: 0.3 }); });
  sfx('thud', tShare, { g: 0.6, p: -0.2 });
  const pA = h('div', 'pk light', M.mapG), pB = h('div', 'pk light', M.mapG);
  const outP = [P.hr, [560, LY]];
  glide(pA, [[tOut, tOut + 0.6, [P.pc, P.busTop, P.busMid, P.hr]], [tShare + 0.3, tShare + 0.85, outP]], tOut, tShare + 0.9);
  glide(pB, [[tOut + 0.15, tOut + 0.75, [P.phone, P.busBot, P.busMid, P.hr]], [tShare + 0.45, tShare + 1.0, outP]], tOut + 0.15, tShare + 1.05);
  classOn(hr, 'hot', tOut + 0.6, tShare + 1.1);
  sfx('whoosh', tOut, { g: 0.35 }); sfx('tick', tOut + 0.6, { g: 0.5 }); sfx('tick', tOut + 0.75, { g: 0.5, p: 0.3 });
  const pubMap = h('div', 'chip', M.mapG, '<span class="px">198.51.100.7</span>'); px(pubMap, 312, 502); css(pubMap.firstChild, { fontSize: '28px' });
  vanish(pubMap, 0); slam(pubMap, tShare, { from: 1.4, d: 0.3 }); span(pubMap, 0, tE3);

  // ═══ e3：二〇一一年，全球统一管理的地址池还是分完了 ═══
  const tPool = Q(tE3 - 0.15);
  const W = makeWin(world, 60, 112, 1800, 560, tr('全球统一管理的地址池（IANA）· IPv4 共 256 块', 'The global address pool (IANA) · 256 blocks'), { sunken: true });
  vanish(W.el, 0);
  openWin(W, tPool, [100, 760, 1700, 180], { sound: 'drive', g: 0.55 });
  const t11 = Q(T('e3', '一一年'));
  classOn(year.box[3], 'hl', t11, Infinity);
  pulse(year.box[3], t11, 1.3, 0.35);
  sfx('blip', t11, { g: 0.5 });
  const cells = [];
  [...IANA_KINDS].forEach((k, i) => {
    const e = h('div', 'cell ' + k, W.body); px(e, 123 + (i % 32) * 48, 18 + Math.floor(i / 32) * 46, 42, 38);
    cells.push([e, k]);
  });
  cells.forEach(([e, k], i) => { if (k !== 'L') { vanish(e, 0); appear(e, tPool + 0.3 + Math.floor(i / 32) * 0.22); } });
  for (let r = 0; r < 8; r++) sfx('key', tPool + 0.3 + r * 0.22, { g: 0.35, p: -0.6 + r * 0.17 });
  const last = cells.filter(([, k]) => k === 'L').map(([e]) => e);
  const tDone = Q(T('e3', '还是'));
  last.forEach((e, i) => { classOn(e, 'done', tDone + i * 0.08); sfx('tick', tDone + i * 0.08, { g: 0.6, p: -0.5 + i * 0.25 }); });
  txt(W.body, 't-b', tr('2011 年 2 月', 'Feb 2011'), 123, 402);
  const st = txt(W.body, 't-b', '', 330, 402);
  htmlAt(st, tPool + 0.3, tr('空闲 <b>5</b> 块', '<b>5</b> free'));
  const tEmpty = tDone + 0.5;
  htmlAt(st, tEmpty, tr('空闲 <b>0</b> 块', '<b>0</b> free'));
  const empty = h('div', 'chip', W.body, tr('地址池已空', 'Pool empty')); px(empty, 560, 398); css(empty, { fontSize: '30px' });
  vanish(empty, 0); slam(empty, tEmpty, { from: 1.5, d: 0.35 });
  sfx('error', tEmpty, { g: 0.4 });
  const lg = h('div', 'abs', W.body); px(lg, 1000, 404);
  [['A', tr('已分配', 'allocated')], ['R', tr('保留', 'reserved')], ['L', tr('最后 5 块', 'last 5')]].forEach(([k, n], i) => {
    const c = h('div', 'cell ' + k, lg); px(c, i * 230, 2, 30, 30);
    txt(lg, 't-b', n, i * 230 + 44, 0).style.fontSize = '28px';
  });
  // 下方：IPv4 的 32 位与「约 43 亿」留在地址窗口里
  const keep = txt(world, 'inote', tr('IPv4：32 位，约 43 亿个', 'IPv4: 32 bits, ≈ 4.3 billion'), 100, 818);
  css(keep, { fontSize: '36px' });
  vanish(keep, 0); appear(keep, tPool + 0.25); span(keep, 0, Q(T('z0', '四')) + 0.25);
  const kc = [...bits].map((b, i) => { const e = h('div', 'bit sunken', world, b); classOn(e, 'n', tPool + 0.25, Q(T('z0', '回到'))); px(e, 700 + i * 34 + Math.floor(i / 8) * 14, 812, 30, 44); css(e, { font: '400 32px/38px "Pixel"' }); return e; });
  kc.forEach((e) => { vanish(e, 0); appear(e, tPool + 0.25); span(e, 0, Q(T('z0', '四')) + 0.25); });
  const tClose = Q(T('z0', '四'));             // 地址池留到收尾第一句，读得完
  zoomFx(tClose, W.rect, [230, 778, 760, 96], 0.25);
  vanish(W.el, tClose);
  hideWin(M.mapG, tPool + 0.25, tClose);
  sfx('whoosh', tClose, { g: 0.35 });
  M.tPoolClose = tClose;
});
