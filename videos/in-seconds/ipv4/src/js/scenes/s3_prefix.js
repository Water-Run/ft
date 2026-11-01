// 地址分两截（p1–p2）：下方的比特在第 24、25 位之间断开（最后一组连同十进制 80 往右挪），前 24 位藏青、标「网络 · 前一截」，
// 后 8 位描框、标「设备 · 后一截」；图上每个地址的前一截一起反白，方框标题补上网络名；说完时三个网络的标题条一起亮。
// p2：「/24」砸出来，前 24 格逐格描一遍，注明「= 前三个数」。
scene('prefix', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { bc, decs, cellX, allLabs, HB, OB, DB } = M;
  const tSw = M.tSwitch;

  // ── 断开 ──
  const tSplit = Q(T('p1', '两'));
  bc.slice(24).forEach((e) => to(e, tSplit, { x: 40, duration: 0.4, ease: 'back.out(1.6)' }));
  to(decs[3], tSplit, { x: 40, duration: 0.4, ease: 'back.out(1.6)' });
  const cut = blk(world, 'bg-black', cellX(24) - 12 + 20 - 2, 752, 4, 116);
  vanish(cut, 0); appear(cut, tSplit + 0.2); span(cut, 0, tSw);
  sfx('pop', tSplit, { g: 0.55, p: 0.2 });

  // ── 前一截 = 网络 ──
  const tNet = Q(T('p1', '前'));
  bc.slice(0, 24).forEach((e) => classOn(e, 'n', tNet, tSw));
  decs.slice(0, 3).forEach((e) => classOn(e, 'hl', tNet, tSw));
  const bN = h('div', 'brk', world); px(bN, cellX(0), 856, cellX(23) + 34 - cellX(0), 12);
  const lN = ctxt(world, 'ilab', tr('网络 · 前一截', 'Network · first part'), (cellX(0) + cellX(23) + 34) / 2, 876); css(lN, { fontSize: '30px', color: 'var(--navy)' });
  [bN, lN].forEach((e) => { vanish(e, 0); appear(e, tNet + 0.1); span(e, 0, tSw); });
  sfx('blip', tNet, { g: 0.6, p: -0.3 });
  const tMap = Q(T('p1', '网络'));
  allLabs.forEach((l) => classOn(l.pre, 'hl', tMap, T('s1')));
  [[HB, '192.168.1'], [OB, '192.0.2'], [DB, '203.0.113']].forEach(([z, p], i) => {
    htmlAt(z.pre, tMap + 0.1 + i * 0.1, p);
    sfx('tick', tMap + 0.1 + i * 0.1, { g: 0.5, p: -0.4 + i * 0.4 });
  });

  // ── 后一截 = 设备 ──
  const tDev = Q(T('p1', '后'));
  bc.slice(24).forEach((e) => classOn(e, 'mark', tDev, tSw));
  const x24 = cellX(24) + 40;
  const bD = h('div', 'brk', world); px(bD, x24, 856, 8 * 36 - 2, 12);
  const lD = ctxt(world, 'ilab', tr('设备 · 后一截', 'Device · last part'), x24 + 143, 876); css(lD, { fontSize: '30px' });
  [bD, lD].forEach((e) => { vanish(e, 0); appear(e, tDev + 0.1); span(e, 0, tSw); });
  sfx('blip', tDev, { g: 0.55, p: 0.3 });
  M.lab.dest.forEach((l, i) => classOn(l.host, 'hl', Q(T('p1', '设备')) + i * 0.06, Q(T('p1', '设备')) + 0.9 + i * 0.06));
  const tZ = Q(Tend('p1')) + 0.2;
  [HB, OB, DB].forEach((z) => classOn(z.el, 'on', tZ, tSw));
  sfx('blip', tZ, { g: 0.4, p: 0.2 });

  // ── p2：/24 表示前二十四位是网络 ──
  const t24 = Q(T('p2', '斜杠'));
  const c24 = h('div', 'chip', world, '<span class="px">/24</span>'); px(c24, 1420, 770); css(c24.firstChild, { fontSize: '64px' });
  c24.dataset.gloss = '/24';
  vanish(c24, 0); slam(c24, t24, { from: 1.6, d: 0.35 }); span(c24, 0, tSw);
  sfx('thud', t24, { g: 0.65, p: 0.4 });
  const tCount = T('p2', '前'), tCountE = T('p2', '位');
  const cnt = h('div', 'chip', world, ''); px(cnt, 1560, 790); css(cnt, { fontSize: '30px' });
  htmlAt(cnt, 0, tr('前 <span class="px">24</span> 位', 'first <span class="px">24</span> bits'));
  vanish(cnt, 0); appear(cnt, Q(T('p2', '前')));
  bc.slice(0, 24).forEach((e, i) => { const t = tCount + (tCountE - tCount) * (i / 23); classOn(e, 'mark', t, tCountE + 0.6); });
  span(cnt, 0, tSw);
  sfx('riser', tCount, { g: 0.3 });
  const l3 = h('div', 'chip', world, tr('= 前三个数', '= the first three numbers')); px(l3, 1420, 874); css(l3, { fontSize: '30px' });
  vanish(l3, 0); appear(l3, Q(T('p2', '位'))); span(l3, 0, tSw);
  sfx('tick', Q(T('p2', '位')), { g: 0.55 });
});
