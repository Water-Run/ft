// 地址（a1–a4）：靠地址——图上每台设备打出自己的地址 → 下方地址框随「写成四个数」一格格填上 203.0.113.80，三个点亮一下，注明每个数 0–255
// → 「关于 IP」窗口：先写「按地址送数据的规则」，读到 IP 时砸出大字 IP 与全称 → 读到 IPv4 时补上 v4，第 4 版、RFC 791、1981 年 9 月，
// 1981 → 今天的年份条随「一直用到今天」走满（片名卡）→ 窗口收回图上。
scene('address', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { lab, allLabs, big, q } = M;

  // ═══ a1：靠地址——每台设备打出地址 ═══
  const tAddr = Q(T('a1', '地址'));
  // 按网络分三批出现（每批一下子出来）：你家、另一个网络、远方的网络
  const tAddr2 = Q(T('a1', '联网')), tAddr3 = Q(T('a1', '设备'));
  [lab.pc, lab.phone].forEach((l) => { vanish(l.el, 0); appear(l.el, tAddr); });
  lab.other.forEach((l) => { vanish(l.el, 0); appear(l.el, tAddr2); });
  lab.dest.forEach((l) => { vanish(l.el, 0); appear(l.el, tAddr3); });
  sfx('key', tAddr2, { g: 0.5, p: 0 }); sfx('key', tAddr3, { g: 0.5, p: 0.5 });
  // 刚出现的一批地址先反白 0.8 秒，把视线引过去
  [[[lab.pc, lab.phone], tAddr], [lab.other, tAddr2], [lab.dest, tAddr3]].forEach(([ls, t]) => ls.forEach((l) => { classOn(l.pre, 'hl', t, t + 0.8); classOn(l.host, 'hl', t, t + 0.8); }));
  [0, 1, 2, 3].forEach((i) => sfx('key', tAddr + i * 0.15, { g: 0.5, p: -0.3 + i * 0.2 }));
  // 「自己的地址」：你的电脑那一个框一下
  const tOwn = Q(T('a1', '自己'));
  classOn(lab.pc.el, 'sel', tOwn, T('a2', '写成'));
  classOn(M.pc, 'sel', tOwn, T('a2', '写成'));

  // ═══ a2：写成四个数，用点隔开 ═══
  const tW = Q(T('a2', '写成'));
  vanish(q, tW);
  const vals = [203, 0, 113, 80];
  const tF = T('a2', '四个');
  vals.forEach((v, i) => {
    const t = Q(tF + i * 0.22, 0.05);
    htmlAt(big.cells[i], t, String(v));
    classOn(big.cells[i], 'hl', t, Q(T('a2', '点')));
    pulse(big.cells[i], t, 1.25, 0.25);
    sfx('key', t, { g: 0.6, p: -0.4 + i * 0.25 });
    gauge(t, tr('要去', 'To'), vals.map((x, j) => (j <= i ? x : '?')));
  });
  classOn(lab.target.el, 'sel', tF, T('p1', '地址'));
  classOn(M.target, 'sel', tF, T('p1', '地址'));
  const tDot = Q(T('a2', '点'));
  big.dots.forEach((d, i) => classOn(d, 'on', tDot + i * 0.1, tDot + 1.4));
  sfx('blip', tDot, { g: 0.5, p: 0.2 });
  const n255 = txt(world, 'inote', tr('每个数：<span class="px">0 – 255</span>', 'Each number: <span class="px">0 – 255</span>'), 1040, 800);
  vanish(n255, 0); wipe(n255, Q(T('a2', '隔开')) + 0.2, { d: 0.4 });
  span(n255, 0, T('p1', '两'));

  // ═══ a3：这套按地址送数据的规则，叫 IP ═══
  const D = makeWin(world, 60, 112, 1800, 560, tr('关于 IP', 'About IP'));
  const tOpen = Q(T('a3') - 0.1);
  vanish(D.el, 0);
  openWin(D, tOpen, [230, 778, 760, 96], { sound: 'drive', g: 0.55 });
  const b = D.body;
  const rule = h('div', 'abs', b); px(rule, 780, 40); rule.dataset.gloss = 'IP';
  const l1 = txt(rule, 't-m', tr('按地址送数据的规则', 'The rules for delivering data by address'), 0, 0); css(l1, { fontSize: '46px' });
  const l2 = txt(rule, 'lat', 'Internet Protocol', 0, 76); css(l2, { font: '500 44px/1 "Inter"' });
  const l3 = txt(rule, 't-b', tr('互联网协议', 'Internet Protocol'), 0, 132); css(l3, { fontSize: '38px' });
  vanish(l1, 0); vanish(l2, 0); vanish(l3, 0);
  wipe(l1, Q(T('a3', '按')), { d: 0.6 });
  classOn(l1, 'hl', Q(T('a3', '规则')), Q(T('a3', 'IP')) - 0.05);
  sfx('tick', Q(T('a3', '规则')), { g: 0.5 });
  const tIP = T('a3', 'IP');
  const ip = txt(b, 't-big', 'IP', 150, 40); css(ip, { fontSize: '250px' });
  slam(ip, Q(tIP, 0.05) - 0.05, { from: 1.6, d: 0.45 }); sfx('thud', Q(tIP, 0.05) - 0.05, { g: 0.8, p: -0.5 });
  wipe(l2, Q(tIP) + 0.35, { d: 0.45 }); wipe(l3, Q(tIP) + 0.6, { d: 0.4 });

  // ═══ a4：IPv4 是它的第四版，一九八一年定下，一直用到今天 ═══
  const tV = Q(T('a4', 'IPv4'), 0.05);
  const v4 = txt(b, 't-big', 'v4', 150 + ip.offsetWidth - 6, 40); css(v4, { fontSize: '250px' });
  slam(v4, tV + 0.2, { from: 1.7, d: 0.4 }); sfx('thud', tV + 0.2, { g: 0.8, p: -0.2 });
  htmlAt(D.title, tV + 0.2, tr('关于 IPv4 · 100 秒速通', 'About IPv4 · in 100 seconds'));
  const ver = h('div', 'abs', b); px(ver, 780, 240); ver.dataset.gloss = 'IPv4';
  const v1 = txt(ver, 't-m', tr('第 4 版 · RFC 791', 'Version 4 · RFC 791'), 0, 0); css(v1, { fontSize: '40px', background: 'var(--navy)', color: 'var(--white)', padding: '2px 14px' });
  const v2 = txt(ver, 't-m', tr('1981 年 9 月定下', 'Set in September 1981'), 0, 56); css(v2, { fontSize: '40px' });
  vanish(v1, 0); vanish(v2, 0);
  appear(v1, Q(T('a4', '第四'))); sfx('tick', Q(T('a4', '第四')), { g: 0.6 });
  appear(v2, Q(T('a4', '一九八一'))); sfx('tick', Q(T('a4', '一九八一')), { g: 0.6 });
  // 1981 → 今天：一年一格
  const yb = h('div', 'abs sunken', b); px(yb, 270, 400, 1250, 44);
  const years = 2026 - 1981 + 1, yw = (1250 - 6 - 3 * (years - 1)) / years;
  const ycells = [];
  for (let i = 0; i < years; i++) { const e = blk(yb, 'bg-navy', 3 + i * (yw + 3), 3, yw, 32); vanish(e, 0); ycells.push(e); }
  const y0 = txt(b, 'px', '1981', 160, 402); css(y0, { fontSize: '36px', color: 'var(--navy)' });
  const y1 = txt(b, 't-b', tr('今天', 'Today'), 1546, 404);
  vanish(yb, 0); vanish(y0, 0); vanish(y1, 0);
  const tY = Q(T('a4', '一直'));
  const tYb = Q(T('a4', '一九八一'));
  appear(yb, tYb); appear(y0, tYb); appear(y1, tYb);
  const tYe = T('a4', '今天') + 0.35;
  ycells.forEach((e, i) => appear(e, i === 0 ? tYb : tY + (tYe - tY) * (i / (years - 1))));
  sfx('riser', tY, { g: 0.4 });
  sfx('chime', tYe, { g: 0.55, p: 0.4 });

  // 收回：外框从对话框缩回网络图
  const tClose = Q(Tend('a4') + 0.55);
  zoomFx(tClose, D.rect, [700, 300, 520, 200], 0.25);
  vanish(D.el, tClose);
  hideWin(M.mapG, tOpen + 0.25, tClose);       // 对话框与网络窗口一样大，开着时底下的图整层藏掉
  sfx('whoosh', tClose, { g: 0.4 });
});
