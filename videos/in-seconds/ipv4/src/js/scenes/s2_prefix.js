// 地址分两截（p1）：下方地址框在第三、四格之间断开 → 前三格变藏青、下面标「网络 · 前一截」→ 图上每个地址的前一截一起反白，
// 同一个方框里的前一截都一样，方框标题补上这一截（192.168.1、192.0.2、203.0.113）→ 第四格描框、标「设备 · 后一截」→ 注明本例 /24。
scene('prefix', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { big, allLabs, HB, OB, DB } = M;
  // 下方地址窗口在 route 场开头（旁白 r1 之前）换成两行比较；本场标在地址框上的东西留到那一刻
  const tSw = M.tSwitch = L.scenes.find((x) => x.id === 'route').start + 0.05;

  // ── 断开 ──
  const tSplit = Q(T('p1', '两'));
  to(big.cells[3], tSplit, { x: 56, duration: 0.45, ease: 'back.out(1.6)' });
  to(big.dots[2], tSplit, { x: 28, duration: 0.45, ease: 'back.out(1.6)' });
  sfx('pop', tSplit, { g: 0.55, p: 0.2 });

  // ── 前一截 = 网络 ──
  const tNet = Q(T('p1', '前'));
  const tNetEnd = tSw;
  big.cells.slice(0, 3).forEach((c, i) => classOn(c, 'hl', tNet + i * 0.08, tNetEnd));
  const bN = h('div', 'brk', world); px(bN, 236, 880, 556, 12);
  const lN = ctxt(world, 'ilab', tr('网络 · 前一截', 'Network · first part'), 514, 900); css(lN, { fontSize: '30px', color: 'var(--navy)' });
  [bN, lN].forEach((e) => { vanish(e, 0); wipe(e, tNet + 0.15, { d: 0.4 }); span(e, 0, tNetEnd); });
  sfx('blip', tNet, { g: 0.6, p: -0.3 });
  // 图上：每个地址的前一截反白；方框标题补上这一截
  const tMap = Q(T('p1', '网络'));
  allLabs.forEach((l, i) => classOn(l.pre, 'hl', tMap + i * 0.03, T('s1')));
  [[HB, '192.168.1'], [OB, '192.0.2'], [DB, '203.0.113']].forEach(([z, p], i) => {
    htmlAt(z.pre, tMap + 0.1 + i * 0.1, p);
    sfx('tick', tMap + 0.1 + i * 0.1, { g: 0.5, p: -0.4 + i * 0.4 });
  });

  // ── 后一截 = 设备 ──
  const tDev = Q(T('p1', '后'));
  classOn(big.cells[3], 'mark', tDev, tSw);
  const bD = h('div', 'brk', world); px(bD, 862, 880, 144, 12);
  const lD = ctxt(world, 'ilab', tr('设备 · 后一截', 'Device · last part'), 934, 900); css(lD, { fontSize: '30px' });
  [bD, lD].forEach((e) => { vanish(e, 0); wipe(e, tDev + 0.15, { d: 0.4 }); span(e, 0, tSw); });
  sfx('blip', tDev, { g: 0.55, p: 0.3 });
  // 图上：远方网络里的后一截各不相同——依次描一下
  M.lab.dest.forEach((l, i) => classOn(l.host, 'hl', Q(T('p1', '设备')) + i * 0.08, Q(T('p1', '设备')) + 1.2 + i * 0.08));

  // ── 说完：三个网络的标题条一起变藏青——每个方框是一个网络，名字就是那一截 ──
  const tZ = Q(Tend('p1')) + 0.3;
  [HB, OB, DB].forEach((z) => classOn(z.el, 'on', tZ, tSw));
  sfx('blip', tZ, { g: 0.45, p: 0.2 });

  // ── 注明本例：/24 ──
  const n24 = txt(world, 'inote', tr('本例 <span class="px">/24</span>：前 24 位（前三个数）是网络', 'Here <span class="px">/24</span>: the first 24 bits are the network'), 1100, 790);
  vanish(n24, 0); wipe(n24, Q(T('p1', '前')) + 0.4, { d: 0.45 });
  span(n24, 0, tSw);
  sfx('tick', Q(T('p1', '前')) + 0.4, { g: 0.5 });
});
