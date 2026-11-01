// 一站站送（r1–r3）：网络路径窗口。同一网络：发往手机的数据包直接到；别的网络：发往 203.0.113.80 的数据包先交给家里的路由器（注解：默认网关，本网的出口）；
// 一路上每台路由器查自己的路由表（下方终端窗口随数据包换成那一台的表，选中的一行反白），交给下一站，最后到达目的地。
// 路由器与表里的地址都是文档示例地址（198.51.100.0/24、203.0.113.0/24），表的内容是示意；查表取最长匹配见 FACTS route 段。
const RT_TABLES = {
  gw: { name: '192.168.1.1', rows: [['192.168.1.0/24', tr('本网直接送', 'deliver here')], ['0.0.0.0/0', '198.51.100.1']], sel: 1 },
  r1: { name: '198.51.100.1', rows: [['0.0.0.0/0', '198.51.100.9'], ['203.0.113.0/24', '198.51.100.2']], sel: 1 },
  r2: { name: '198.51.100.2', rows: [['203.0.113.0/24', tr('直接送达', 'deliver here')]], sel: 0 },
};
const rtHtml = (k, withSel) => {
  const T_ = RT_TABLES[k], pad = (v, n) => v + ' '.repeat(Math.max(1, n - v.length));
  const lines = [tr('目的网络          下一站', 'Network           Next hop')];
  T_.rows.forEach((r, i) => { const l = pad(r[0], 18) + r[1]; lines.push(withSel && i === T_.sel ? `<span class="inv">${l}</span>` : l); });
  return lines.join('\n');
};

scene('route', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const W = makeWin(world, 60, 120, 1800, 560, tr('网络路径', 'Network path'), { sunken: true });
  zoomFx(s.start, [1040, 790, 820, 150], W.rect, 0.3); sfx('drive', s.start, { g: 0.6, p: 0.3 });

  // 你家的内网：电脑、手机，路由器跨在边上
  const lan = h('div', 'abs', world); px(lan, 100, 200, 600, 450); css(lan, { border: '4px dashed #000080' });
  txt(world, 'note navy', tr('你家的内网 · 192.168.1.x', 'Your home network · 192.168.1.x'), 116, 604);
  const pc = pcIcon(world, 330, 230, 1);
  txt(world, 't-b', tr('你的电脑', 'Your computer'), 110, 244); txt(world, 'px', '192.168.1.10', 110, 290).style.fontSize = '40px';
  const ph = phoneIcon(world, 372, 440, 1);
  txt(world, 't-b', tr('手机', 'Phone'), 110, 456); txt(world, 'px', '192.168.1.11', 110, 502).style.fontSize = '40px';
  const gw = routerIcon(world, 560, 330, 1);
  txt(world, 't-b navy', tr('家里的路由器', 'Home router'), 540, 434); txt(world, 'px', '192.168.1.1', 560, 480).style.fontSize = '40px';
  const r1 = routerIcon(world, 900, 330, 1);
  txt(world, 't-b', tr('路由器', 'Router'), 920, 434); txt(world, 'px', '198.51.100.1', 896, 480).style.fontSize = '40px';
  const r2 = routerIcon(world, 1200, 330, 1);
  txt(world, 't-b', tr('路由器', 'Router'), 1220, 434); txt(world, 'px', '198.51.100.2', 1196, 480).style.fontSize = '40px';
  const dst = pcIcon(world, 1580, 310, 1.1);
  txt(world, 't-b', tr('目的地', 'Destination'), 1580, 434); txt(world, 'px', '203.0.113.80', 1556, 480).style.fontSize = '40px';
  const ov = overlay(world);
  const wire = (d) => path(ov, d, 'dgray', { w: 6, arrow: false });
  wire('M 440 282 L 560 372'); wire('M 428 488 L 560 400'); wire('M 385 334 L 400 440');
  wire('M 710 396 L 900 396'); wire('M 1050 396 L 1200 396'); wire('M 1350 396 L 1580 380');
  const note = txt(world, 'note', tr('路由器与目的地的地址都是文档示例地址；路由表为示意', 'Router and destination addresses are documentation examples; tables are illustrative'), 760, 604);
  void note;

  // 下方：本机的判断与路由表
  const D = makeWin(world, 60, 700, 700, 240, tr('本机：送往哪里', 'This computer: where to?'));
  const c1 = h('div', 'chk', D.body, `<span class="box sunken"></span><span>${tr('同一网络：直接送到', 'Same network: deliver directly')}</span>`); px(c1, 30, 22);
  const c2 = h('div', 'chk', D.body, `<span class="box sunken"></span><span>${tr('别的网络：交给家里的路由器', 'Other network: hand to the home router')}</span>`); px(c2, 30, 96);
  // 上一场的结论框原样留在原处，第一次送达之后收起，再在这里打开路由表窗口
  const M = makeWin(world, 1040, 790, 820, 150, tr('送往哪里', 'Where to'));
  txt(M.body, 't-m', tr('前 24 位不同：203.0.113.80 在别的网络', 'First 24 bits differ: another network'), 24, 18);
  const RW = makeWin(world, 800, 700, 1060, 240, tr('路由表', 'Routing table'));
  const con = h('div', 'abs console', RW.body, tr('（等待数据包）', '(waiting for a packet)')); px(con, 0, 0, 1048, 172); css(con, { fontSize: '42px', lineHeight: '50px' });

  // 同一网络，直接送到
  const tA = Q(T('r1')), tA2 = Q(T('r1', '直接'));
  gauge(tA, tr('目的', 'To'), [192, 168, 1, 11]);
  const pa = packet(world, tr('到 192.168.1.11', 'to 192.168.1.11'), { light: true });
  moveAlong(pa, [[tA, 300, 190], [tA + 0.35, 300, 190], [tA2, 300, 400]], tA, tA2 + 0.05);
  sfx('tick', tA, { g: 0.6, p: -0.6 });
  keyed(c1.firstChild).at(tA2, { html: '×' }); classAt(ph, 'hot', tA2); sfx('pop', tA2, { g: 0.8, p: -0.6 });
  const tRW = Q(Tend('r1') + 0.2);
  vanish(M.el, tRW); vanish(RW.el, 0); openWin(RW, tRW, M.rect, { sound: 'pop', g: 0.5, p: 0.5 });

  // 别的网络，先交给家里的路由器
  const tB = Q(T('r2')), tNet = Q(T('r2', '网络')) + 0.2, tGw = Q(T('r2', '家里')), tGw2 = Q(T('r2', '路由器'));
  gauge(tB, tr('目的', 'To'), DST);
  const pb = packet(world, tr('到 203.0.113.80', 'to 203.0.113.80'));
  keyed(c2.firstChild).at(tNet, { html: '×' }); sfx('tick', tNet, { g: 0.7, p: -0.5 });
  const gl = txt(world, 'note', tr('默认网关：本网的出口', 'Default gateway: the exit of this network'), 540, 530);
  css(gl, { background: '#FFFFFF', padding: '0 8px' });
  wipe(gl, tGw2, { dir: 'l', d: 0.3 });
  classAt(gw, 'hot', tGw2 + 0.1, Q(T('r3', '每')));
  // 一路上：每台路由器查表，交给下一站
  const tH1 = Q(T('r3')) + 0.1, tLook = Q(T('r3', '查表')), tH2 = Q(T('r3', '一站')), tH3 = Q(T('r3', '往下'));
  const P = (x) => [x - 110, 266];
  moveAlong(pb, [[tB, 300, 190], [tGw, 300, 190], [tGw2 + 0.05, ...P(635)], [tH1, ...P(635)], [tH1 + 0.5, ...P(975)], [tH2, ...P(975)], [tH2 + 0.45, ...P(1275)], [tH3, ...P(1275)], [tH3 + 0.45, 1490, 250]], tB, tH3 + 0.5);
  sfx('whoosh', tGw, { g: 0.4, p: -0.2 });
  // 路由表随数据包换成那一台的
  const kt = keyed(RW.title), kc = keyed(con);
  kt.at(tGw2 + 0.1, { html: tr('192.168.1.1 的路由表', 'Routing table of 192.168.1.1') });
  kc.at(tGw2 + 0.1, { html: rtHtml('gw', false) }); kc.at(tGw2 + 0.45, { html: rtHtml('gw', true) });
  sfx('blip', tGw2 + 0.1, { g: 0.6, p: 0.3 });
  kt.at(tH1 + 0.5, { html: tr('198.51.100.1 的路由表', 'Routing table of 198.51.100.1') });
  kc.at(tH1 + 0.5, { html: rtHtml('r1', false) }); kc.at(tLook, { html: rtHtml('r1', true) });
  classAt(r1, 'hot', tH1 + 0.5, tH2); sfx('tick', tH1 + 0.5, { g: 0.6 }); sfx('blip', tLook, { g: 0.7, p: 0.3 });
  kt.at(tH2 + 0.45, { html: tr('198.51.100.2 的路由表', 'Routing table of 198.51.100.2') });
  kc.at(tH2 + 0.45, { html: rtHtml('r2', true) });
  classAt(r2, 'hot', tH2 + 0.45, tH3); sfx('blip', tH2 + 0.45, { g: 0.6, p: 0.5 });
  classAt(dst, 'hot', tH3 + 0.5); sfx('chime', tH3 + 0.5, { g: 0.9, p: 0.7 });
});
