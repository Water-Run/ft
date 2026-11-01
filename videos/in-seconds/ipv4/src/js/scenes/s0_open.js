// 开场（o1–o4）：打开网站 → 数据要找远方那台电脑 → 设备一下子铺满，靠什么找 → 每台设备亮出地址，数据包写上目的地址，对上的那一台亮起，数据包飞过去
// → 这套规则叫 IP（注解：全称与一句话的作用）→ 「关于 IPv4」对话框放大出来当片名卡：第 4 版、1981 年 9 月、RFC 791，一直用到今天。
// 图里的设备地址全部取自文档专用的三个示例网段（192.0.2.0/24、198.51.100.0/24、203.0.113.0/24，RFC 5737），画面上注明。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const tWin = s.start + 0.05;

  // ── 网络窗口：左边你的电脑，右边一片设备 ──
  const W = makeWin(world, 60, 120, 1800, 828, tr('网络', 'Network'), { sunken: true });
  vanish(W.el, 0);
  openWin(W, tWin, [180, 470, 160, 150], { sound: 'drive', g: 0.6 });
  const pc = pcIcon(world, 150, 470, 1.4); vanish(pc, 0); appear(pc, tWin + 0.25);
  const pcLab = txt(world, 't-b', tr('你的电脑', 'Your computer'), 150, 630); vanish(pcLab, 0); appear(pcLab, tWin + 0.25);

  // 「打开网站」：一个小窗口，进度条随这句话走
  const tSite = Q(T('o1', '网站'));
  const B = makeWin(world, 110, 210, 470, 210, tr('网页', 'Web page'));
  const bTxt = txt(B.body, 't-b', tr('正在打开网站……', 'Opening the site…'), 24, 22);
  const bar = h('div', 'abs sunken', B.body); px(bar, 24, 82, 412, 44);
  const bsegs = []; for (let i = 0; i < 16; i++) { const e = blk(bar, 'bg-navy', 3 + i * 25.4, 3, 22, 32); bsegs.push(e); vanish(e, 0); }
  openWin(B, tSite - 0.15, [150, 470, 154, 146], { sound: 'pop', g: 0.6, p: -0.6 });
  bsegs.forEach((e, i) => appear(e, tSite + 0.3 + i * 0.16));

  // 数据包出发，停在半路
  const tData = Q(T('o1', '数据'));
  const pk = packet(world, tr('请求', 'Request'));
  const hold = 500, py = 520;
  sfx('tick', tData, { g: 0.7, p: -0.5 });

  // 远方的另一台：一台设备，上面一个问号，一条虚线
  const COLS = 6, ROWS = 5, X0 = 820, Y0 = 250, DX = 170, DY = 136, tc = 5, tr_ = 2;
  const target = pcIcon(world, X0 + tc * DX, Y0 + tr_ * DY, 0.6);
  const tFar = Q(T('o1', '另'));
  slam(target, tFar, { from: 1.4, d: 0.35 }); sfx('thud', tFar, { g: 0.8, p: 0.6 });
  const q = txt(world, 'tag on', '?', X0 + tc * DX + 14, Y0 + tr_ * DY - 52); css(q, { fontSize: '44px' });
  slam(q, tFar + 0.2, { from: 1.6, d: 0.3 });
  const ov = overlay(world);
  const dash = path(ov, `M ${hold + 210} ${py + 24} L ${X0 + tc * DX - 14} ${Y0 + tr_ * DY + 30}`, 'dgray', { w: 5, dashed: true, arrow: true });
  vanish(dash, 0); arrowIn(dash, tFar + 0.1, 0.5);

  // 设备那么多：其余 29 台从右往左一列列铺开
  const rng = seeded(1981);
  const nets = ['192.0.2.', '198.51.100.', '203.0.113.'];
  const devs = [], labs = [];
  const tMany = Q(T('o2', '设备'));
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const isT = c === tc && r === tr_;
    let addr = '203.0.113.80';
    if (!isT) { do { addr = nets[Math.floor(rng() * 3)] + (2 + Math.floor(rng() * 250)); } while (addr === '203.0.113.80'); }
    const x = X0 + c * DX, y = Y0 + r * DY;
    const d = isT ? target : pcIcon(world, x, y, 0.6);
    const lab = txt(world, 'tag px', addr, x - 42, y + 66); css(lab, { width: '150px', textAlign: 'center', padding: '2px 0 0' });
    devs.push(d); labs.push({ lab, c, r, isT });
    if (!isT) { const k = (COLS - 1 - c) * ROWS + r; slide(d, tMany + k * 0.03, { y: 30, d: 0.25 }); if (k % 5 === 0) sfx('tick', tMany + k * 0.03, { g: 0.45, p: 0.5 }); }
  }
  hide(q, tMany, { d: 0.15 }); hide(dash, tMany, { d: 0.15 });
  keyed(pk).at(tMany + 0.3, { html: tr('请求 → ?', 'Request → ?') });

  // 靠地址：每台设备亮出地址（一列列），数据包写上目的地址，对上的那一台亮起，数据包飞过去
  const tAddr = Q(T('o2', '地址')) - 0.1;
  labs.forEach(({ lab, c }) => { wipe(lab, tAddr + c * 0.05, { dir: 'l', d: 0.2 }); });
  sfx('blip', tAddr, { g: 0.7, p: 0.3 }); sfx('blip', tAddr + 0.25, { g: 0.5, p: 0.6 });
  const tDst = tAddr + 0.15;
  keyed(pk).at(tDst, { html: tr('到 203.0.113.80', 'to 203.0.113.80') });
  gauge(tDst, tr('目的', 'To'), [203, 0, 113, 80]);
  const tLab = labs.find((l) => l.isT).lab;
  const tMatch = Q(Tend('o2') + 0.05);
  classAt(tLab, 'on', tMatch); sfx('pop', tMatch, { g: 0.8, p: 0.6 });
  const tx = X0 + tc * DX, ty = Y0 + tr_ * DY;
  const link = path(ov, `M ${hold + 260} ${py + 24} L ${tx - 10} ${ty + 80}`, 'navy', { w: 6, arrow: true });
  vanish(link, 0); arrowIn(link, tMatch + 0.05, 0.4);
  const tFly = tMatch + 0.5, tLand = tFly + 0.6;
  moveAlong(pk, [[tData, 320, py], [tData + 0.7, hold, py], [tFly, hold, py], [tLand, tx - 60, ty + 6]], tData, tLand);
  hide(link, tLand - 0.1, { d: 0.2 });
  sfx('whoosh', tFly, { g: 0.5, p: 0.3 });
  classAt(target, 'hot', tLand); sfx('chime', tLand, { g: 0.9, p: 0.6 });
  keyed(bTxt).at(tLand, { html: tr('找到了：203.0.113.80', 'Found: 203.0.113.80') });
  const docNote = txt(world, 'note', tr('图中地址都是文档专用的示例地址', 'All addresses shown are documentation examples'), 820, 902);
  wipe(docNote, tAddr + 0.4, { dir: 'l', d: 0.3 });

  // 这套规则叫 IP：注解框，数据包前面贴上 IP
  const tRule = Q(T('o3', '规则'));
  const G = h('div', 'abs sunken', world); px(G, 110, 690, 640, 236);
  G.dataset.gloss = 'IP';
  const gIP = txt(G, 'px navy', 'IP', 22, 6); gIP.style.fontSize = '96px';
  txt(G, 'px', 'Internet Protocol', 150, 30).style.fontSize = '52px';
  txt(G, 't-m', tr('互联网协议', 'Internet Protocol'), 150, 82);
  txt(G, 'note', tr('给设备编地址，按地址把数据送到', 'Give devices addresses; deliver data by address'), 24, 160);
  wipe(G, tRule, { dir: 't', d: 0.3 }); sfx('pop', tRule, { g: 0.7, p: -0.5 });
  const tIP = Q(T('o3', 'I'));
  to(gIP, tIP, { keyframes: [{ scale: 1.35, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 60%' });
  sfx('tick', tIP, { g: 0.8, p: -0.5 });

  // 片名卡：「关于 IPv4」对话框从注解框放大出来
  const tAbout = Q(T('o4')) - 0.1;
  // 对话框出现的那一刻，网络窗口连同里面的东西收起，桌面上只留两个对话框
  [W.el, pc, pcLab, B.el, target, ...devs, ...labs.map((l) => l.lab), docNote, G, ov].forEach((e) => vanish(e, tAbout + 0.25));
  const A = makeWin(world, 100, 150, 1000, 772, tr('关于 IPv4', 'About IPv4'));
  vanish(A.el, 0);
  openWin(A, tAbout, [110, 690, 640, 236], { sound: 'drive', g: 0.7 });
  const big = txt(A.body, 't-big', 'IP', 36, 14);
  const v4 = txt(A.body, 't-big', 'v4', 36 + 2 * 104, 14);
  const tV = Q(T('o4', 'V'));
  slam(v4, tV, { from: 1.5, d: 0.35 }); sfx('thud', tV, { g: 0.9, p: -0.3 });
  void big;
  const ttl = txt(A.body, 't-h', tr('100 秒速通', 'IPv4 in 100 s'), 520, 70);
  const sub = txt(A.body, 't-b', tr('互联网协议 第 4 版', 'Internet Protocol, version 4'), 524, 176);
  slam(ttl, tV + 0.25, { from: 1.3, d: 0.35 }); sfx('pop', tV + 0.25, { g: 0.7 });
  wipe(sub, tV + 0.45, { dir: 'l', d: 0.3 });
  blk(A.body, 'bg-dgray', 30, 290, 928, 3); blk(A.body, 'bg-white', 30, 293, 928, 3);
  const list = h('div', 'abs sunken list', A.body); px(list, 30, 320, 928, 220);
  const r1 = listRow(list, 'IP', tr('Internet Protocol · 互联网协议', 'Internet Protocol'));
  const r2 = listRow(list, 'v4', tr('第 4 版 · 1981 年 9 月 · RFC 791', 'version 4 · September 1981 · RFC 791'));
  const r3 = listRow(list, tr('今天', 'now'), tr('仍在使用', 'still in use'));
  r3.firstChild.style.fontFamily = '"Sans SC"'; r3.firstChild.style.fontSize = '32px'; r3.firstChild.style.fontWeight = '700';
  r2.dataset.gloss = 'IPv4';
  void r1;
  const t4 = Q(T('o4', '第四')), t81 = Q(T('o4', '一九八一年')), tNow = Q(T('o4', '今天'));
  vanish(r2, 0); vanish(r3, 0);
  appear(r2, t4); classAt(r2, 'sel', t81, tNow); sfx('tick', t4, { g: 0.6, p: -0.4 });
  appear(r3, tNow); classAt(r3, 'sel', tNow); sfx('tick', tNow, { g: 0.7, p: -0.4 });
  const ok = h('div', 'btn raised', A.body, tr('确定', 'OK')); px(ok, 780, 572, 170, 58);

  // RFC 791 的首页
  const R = makeWin(world, 1140, 140, 720, 560, 'RFC791.TXT', { idle: true, sunken: true });
  vanish(R.el, 0);
  openWin(R, t81 + 0.1, [130, 530, 920, 52], { sound: 'drive', g: 0.5, p: 0.5 });
  const rfc = h('div', 'abs px', R.body, ['RFC:  791', '', '      INTERNET PROTOCOL', '', '   DARPA INTERNET PROGRAM', '   PROTOCOL SPECIFICATION', '', '       <span class="tag on" style="position:static;font-size:44px">September 1981</span>'].join('<br>'));
  px(rfc, 24, 18); css(rfc, { fontSize: '44px', lineHeight: '52px', whiteSpace: 'pre' });

  // 1981 → 今天：一年一格，从规范发布填到今天
  const Y = makeWin(world, 1140, 730, 720, 200, tr('1981 → 今天', '1981 → today'), { idle: true });
  vanish(Y.el, 0);
  openWin(Y, t81 + 0.35, [1140, 140, 720, 560], { sound: 'pop', g: 0.4, p: 0.5 });
  txt(Y.body, 'px navy', '1981', 24, 10).style.fontSize = '56px';
  txt(Y.body, 'px navy', '2026', 600, 10).style.fontSize = '56px';
  const ytrack = h('div', 'abs sunken', Y.body); px(ytrack, 24, 66, 660, 34);
  const ys = []; for (let i = 0; i < 45; i++) { const e = blk(ytrack, 'bg-navy', 3 + i * 14.4, 3, 11, 22); vanish(e, 0); ys.push(e); }
  const tYE = Q(Tend('o4') + 0.2);
  ys.forEach((e, i) => appear(e, t81 + 0.7 + i * ((tYE - t81 - 0.7) / 45)));
  const yl = txt(Y.body, 'note', tr('四十五年', '45 years'), 296, 14); vanish(yl, 0); appear(yl, tYE); sfx('tick', tYE, { g: 0.5, p: 0.5 });
});
