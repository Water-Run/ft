// 两种特别的地址（s1–s3）：127.0.0.1——发往它的数据包出门就掉头回到本机，碰不到路由器；localhost 只作画面上的标签（策划者要求）。
// 192.168 开头的私有地址：你家和邻居家的内网都用 192.168.1.x，两家都有 192.168.1.10，互不冲突。
// 上公网时：两台设备发出的数据包经过你家的路由器，「发自」一栏都改写成同一个公网地址 198.51.100.7；邻居家的改写成 198.51.100.23（文档示例地址）。
scene('special', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);

  // ── 本机：127.0.0.1 ──
  const H = makeWin(world, 60, 120, 1800, 500, tr('本机', 'This computer'));
  zoomFx(s.start, [60, 120, 1800, 560], H.rect, 0.3); sfx('drive', s.start, { g: 0.6, p: -0.4 });
  const pc = pcIcon(world, 110, 220, 1.3);
  txt(world, 'note', tr('你的电脑', 'Your computer'), 110, 362);
  // 对照：别的地址要经过家里的路由器出去；127.0.0.1 出门就掉头
  const rt = routerIcon(world, 980, 183, 0.8);
  const rl = txt(world, 'note', tr('家里的路由器', 'Home router'), 958, 262);
  const net = h('div', 'abs raised', world); px(net, 1400, 196, 420, 80); css(net, { font: "700 32px/74px 'Sans SC'", textAlign: 'center' });
  net.textContent = tr('公网（互联网）', 'The Internet');
  const ov = overlay(world);
  const outL = path(ov, 'M 262 236 L 980 236 M 1100 236 L 1400 236', 'dgray', { w: 6, arrow: false });
  const loop = path(ov, 'M 262 268 L 470 268 L 470 356 L 268 356', 'navy', { w: 6, arrow: true });
  const t127 = Q(T('s1', '一二'));
  gauge(t127, tr('目的', 'To'), [127, 0, 0, 1]);
  vanish(loop, 0); arrowIn(loop, t127 + 0.1, 0.9);
  const pk = packet(world, tr('到 127.0.0.1', 'to 127.0.0.1'));
  moveAlong(pk, [[t127, 160, 214], [t127 + 0.4, 300, 214], [t127 + 0.7, 300, 214], [t127 + 1.0, 300, 302], [t127 + 1.4, 160, 302]], t127, t127 + 1.45);
  sfx('tick', t127, { g: 0.6, p: -0.6 }); sfx('pop', t127 + 1.4, { g: 0.7, p: -0.6 });
  classAt(pc, 'hot', t127 + 1.4);
  const big = txt(world, 'px navy', '127.0.0.1', 110, 404); big.style.fontSize = '76px';
  const lh = txt(world, 'px sunken', 'localhost', 470, 420); css(lh, { fontSize: '44px', padding: '4px 14px 0' });
  slam(big, t127, { from: 1.3, d: 0.3 }); sfx('thud', t127 + 0.05, { g: 0.7, p: -0.5 });
  slide(lh, Q(T('s1', '指')), { x: 40, d: 0.3 });
  const n1 = txt(world, 'note', tr('发给 127.0.0.1 的数据不出本机，碰不到路由器', 'Data sent to 127.0.0.1 never leaves; the router never sees it'), 110, 506);
  const n2 = txt(world, 'note', tr('127 开头的地址都绕回本机；localhost 是它的名字', 'Every 127.x address loops back; localhost is its name'), 110, 552);
  wipe(n1, Q(T('s1', '你')), { dir: 'l', d: 0.3 }); wipe(n2, Q(Tend('s1') + 0.2), { dir: 'l', d: 0.3 });
  sfx('tick', Q(Tend('s1') + 0.2), { g: 0.5, p: -0.5 });
  const tOut = Q(T('s1', '指'));
  const po = packet(world, tr('到 203.0.113.80', 'to 203.0.113.80'));
  moveAlong(po, [[tOut, 262, 186], [tOut + 0.7, 860, 186], [tOut + 0.9, 860, 186], [tOut + 1.5, 1380, 186]], tOut, tOut + 1.55);
  sfx('whoosh', tOut, { g: 0.4, p: 0.3 }); classAt(rt, 'hot', tOut + 0.7, tOut + 1.2); sfx('tick', tOut + 0.7, { g: 0.5, p: 0.3 });
  const n3 = txt(world, 'note', tr('其他地址：经路由器出去', 'Other addresses go out via the router'), 900, 330);
  wipe(n3, tOut + 0.1, { dir: 'l', d: 0.3 });
  const right = [rt, rl, net, outL, n3];

  // ── 私有地址表 ──
  const tPre = Q(T('s2', '开头'));
  const PL = makeWin(world, 60, 650, 700, 290, tr('私有地址', 'Private addresses'), { idle: true });
  vanish(PL.el, 0); openWin(PL, tPre - 0.25, [60, 120, 700, 500], { sound: 'pop', g: 0.5, p: -0.5 });
  const list = h('div', 'abs sunken list', PL.body); px(list, 0, 0, 688, 222);
  list.dataset.gloss = tr('私有地址', 'private address');
  const lr1 = listRow(list, '192.168.x.x', tr('家里、公司的内网都能用', 'usable in any home or office network'));
  listRow(list, '10.x.x.x', tr('同样是私有地址', 'also private'));
  listRow(list, '172.16–31.x.x', tr('同样是私有地址', 'also private'));
  const tPriv = Q(T('s2', '私有'));
  classAt(lr1, 'sel', tPriv); sfx('tick', tPriv, { g: 0.6, p: -0.5 });

  // ── 内网与公网 ──
  const t2 = Q(T('s2')) - 0.35;
  const N = makeWin(world, 800, 120, 1060, 818, tr('内网与公网', 'Home networks and the Internet'), { sunken: true });
  vanish(N.el, 0);
  const X0 = 809, Y0 = 185;                                     // 白色内容区的左上角
  const items = [N.el];
  const at = (x, y) => [X0 + x, Y0 + y];
  const bar = h('div', 'abs raised', world); px(bar, ...at(30, 20), 1000, 100);
  const barL = txt(bar, 'note', tr('公网（互联网）', 'The Internet'), 14, 4); void barL;
  const node = (x, title, addr, hot) => {
    const e = h('div', 'abs raised', world); px(e, ...at(x, 160), 380, 150); if (hot) css(e, { borderColor: '#000080', borderWidth: '6px' });
    txt(e, 't-b' + (hot ? ' navy' : ''), title, 18, 14); txt(e, 'px', addr, 18, 70).style.fontSize = '48px';
    return e;
  };
  const myR = node(70, tr('你家的路由器 · 公网', 'Your router · public'), '198.51.100.7', true);
  const nbR = node(578, tr('邻居家的路由器 · 公网', "Neighbor's router · public"), '198.51.100.23', false);
  const w1 = blk(world, 'bg-dgray', ...at(257, 120), 6, 40), w2 = blk(world, 'bg-dgray', ...at(765, 120), 6, 40);
  const w3 = blk(world, 'bg-navy', ...at(255, 310), 10, 50), w4 = blk(world, 'bg-dgray', ...at(765, 310), 6, 50);
  const lanBox = (x, title, rows, navy) => {
    const e = h('div', 'abs', world); px(e, ...at(x, 360), 460, 280); css(e, { border: `4px dashed ${navy ? '#000080' : '#808080'}` });
    txt(e, 't-b' + (navy ? ' navy' : ''), title, 18, 12);
    const out = rows.map(([k, a], i) => {
      const r = txt(e, 'px', '', 18, 64 + i * 80); css(r, { fontSize: '46px' });
      r.innerHTML = `<span style="font-family:'Sans SC';font-size:34px">${k}</span> <span class="p1">192.168</span>.1.${a}`;
      return r;
    });
    return { e, out };
  };
  const myL = lanBox(30, tr('你家的内网', 'Your home network'), [[tr('电脑', 'PC'), '10'], [tr('手机', 'Phone'), '11']], true);
  const nbL = lanBox(538, tr('邻居家的内网', "Neighbor's network"), [[tr('电脑', 'PC'), '10'], [tr('电视', 'TV'), '20']], false);
  items.push(bar, myR, nbR, w1, w2, w3, w4, myL.e, nbL.e);
  items.forEach((e) => vanish(e, 0));
  zoomFx(t2, H.rect, N.rect, 0.3); sfx('drive', t2, { g: 0.6, p: 0.5 });
  set(H.el, t2 + 0.3, { width: 700 }); right.forEach((e) => vanish(e, t2 + 0.3));
  items.forEach((e) => appear(e, t2 + 0.3));
  // 192.168 开头：四台设备地址的前两段一起反白；各家都能用：两家的 192.168.1.10 描框
  const t168 = Q(T('s2', '一九二点一六八')) + 0.1;
  [...myL.out, ...nbL.out].forEach((r, i) => classAt(r.querySelector('.p1'), 'hl', t168 + i * 0.06));
  sfx('blip', t168, { g: 0.6, p: 0.5 });
  const tEach = Q(T('s2', '各'));
  const tBoth = Q(T('s2', '都'));
  [[myL.out[0], tEach], [nbL.out[0], tBoth]].forEach(([r, t]) => { classAt(r, 'mark', t); classAt(r, 'hl', t); });   // 先你家的，再邻居家的
  sfx('pop', tEach, { g: 0.6, p: 0.3 }); sfx('pop', tBoth, { g: 0.6, p: 0.7 });
  const nd = txt(world, 'note', tr('两家都有 192.168.1.10，互不冲突', 'Both homes have 192.168.1.10 — no conflict'), ...at(30, 656));
  wipe(nd, Q(Tend('s2')), { dir: 'l', d: 0.3 });
  const ne = txt(world, 'note', tr('198.51.100.x 为文档专用的示例地址', '198.51.100.x are documentation addresses'), ...at(30, 702));
  wipe(ne, Q(T('s3')) , { dir: 'l', d: 0.3 });

  // 上公网时：数据包经过路由器，「发自」改写成同一个公网地址
  const tUp = Q(T('s3', '公网')), tSwap = Q(T('s3', '共')), tTop = Q(T('s3', '一个'));
  const pa = packet(world, tr('发自 192.168.1.10', 'from 192.168.1.10'));
  const pb = packet(world, tr('发自 192.168.1.11', 'from 192.168.1.11'));
  const pc2 = packet(world, tr('发自 192.168.1.10', 'from 192.168.1.10'));
  const top = Y0 + 64;
  moveAlong(pa, [[tUp, ...at(200, 420)], [tUp + 0.3, ...at(200, 420)], [tSwap, ...at(60, 250)], [tTop, X0 + 40, top]], tUp, 1e9);
  moveAlong(pb, [[tUp + 0.25, ...at(200, 500)], [tUp + 0.55, ...at(200, 500)], [tSwap + 0.25, ...at(160, 250)], [tTop + 0.25, X0 + 356, top]], tUp + 0.25, 1e9);
  moveAlong(pc2, [[tUp + 0.5, ...at(708, 420)], [tUp + 0.8, ...at(708, 420)], [tSwap + 0.5, ...at(600, 250)], [tTop + 0.5, X0 + 690, top]], tUp + 0.5, 1e9);
  keyed(pa).at(tSwap, { html: tr('发自 198.51.100.7', 'from 198.51.100.7') });
  keyed(pb).at(tSwap + 0.25, { html: tr('发自 198.51.100.7', 'from 198.51.100.7') });
  keyed(pc2).at(tSwap + 0.5, { html: tr('发自 198.51.100.23', 'from 198.51.100.23') });
  [pa, pb, pc2].forEach((p, i) => classAt(p, 'light', 0, tSwap + i * 0.25));
  sfx('tick', tUp, { g: 0.5, p: 0.3 }); sfx('blip', tSwap, { g: 0.7, p: 0.2 }); sfx('blip', tSwap + 0.25, { g: 0.6, p: 0.3 }); sfx('blip', tSwap + 0.5, { g: 0.5, p: 0.7 });
  gauge(tSwap, tr('公网', 'Public'), [198, 51, 100, 7]);
  sfx('chime', tTop + 0.3, { g: 0.7, p: 0.4 });
  classAt(myR, 'nodehot', Q(Tend('s3') + 0.05)); sfx('pop', Q(Tend('s3') + 0.05), { g: 0.5, p: 0.3 });   // 改写发自地址的就是你家的路由器
});
