// 地址长什么样（a1–a2）：下方的 203.0.113.80 展开成 32 格 0 和 1（读到「三十二」一组组出现，读到「零或一」时 1 反白），
// 读到「每八位一组」时四组依次亮起、下面画括号；读到「写成」时每组上面落下十进制的数，注明每个数 0–255（8 位：00000000–11111111）。
// 这一排十进制与比特留给下一场（地址分两截、/24）接着用。
scene('address', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { big, ilab } = M;
  const tA = T('a1'), tSw = L.scenes.find((x) => x.id === 'route').start + 0.6;
  M.tSwitch = tSw;
  const OCT = [203, 0, 113, 80];
  const bits = bits32(OCT);
  const cellX = (i) => 100 + i * 36 + Math.floor(i / 8) * 22;
  const groupC = (g) => cellX(g * 8) + (8 * 36 - 2) / 2;
  M.cellX = cellX; M.groupC = groupC;

  // ── 大号地址框收起，换成十进制 + 比特两排 ──
  vanish(big.el, tA); vanish(ilab, tA);
  zoomFx(tA - 0.25, [230, 778, 760, 96], [100, 752, 1216, 100], 0.25);
  const bc = [...bits].map((b, i) => { const e = h('div', 'bit sunken', world, b); px(e, cellX(i), 800, 34, 46); css(e, { font: '400 36px/40px "Pixel"' }); return e; });
  const decs = OCT.map((v, g) => { const e = ctxt(world, 'lat', String(v), groupC(g), 752); css(e, { font: '500 36px/1 "Inter"', color: 'var(--navy)' }); return e; });
  const t32 = Q(T('a1', '三十二'));
  bc.forEach((e, i) => { vanish(e, 0); appear(e, t32 + Math.floor(i / 8) * 0.15); span(e, 0, tSw); });
  [0, 1, 2, 3].forEach((g) => sfx('key', t32 + g * 0.15, { g: 0.5, p: -0.5 + g * 0.3 }));
  // 零或一：是 1 的格子反白一下
  const t01 = Q(T('a1', '零或一'));
  bc.forEach((e, i) => { if (bits[i] === '1') classOn(e, 'n', t01, Q(T('a1', '八位'))); });
  sfx('blip', t01, { g: 0.45 });
  // 每八位一组：四组依次亮起，下面画括号
  const t8 = Q(T('a1', '八位'));
  const brks = [0, 1, 2, 3].map((g) => { const e = h('div', 'brk', world); px(e, cellX(g * 8), 852, 8 * 36 - 2, 12); return e; });
  brks.forEach((e, g) => { vanish(e, 0); appear(e, t8 + g * 0.2); span(e, 0, Q(T('p1', '两'))); });
  bc.forEach((e, i) => { const g = Math.floor(i / 8); classOn(e, 'n', t8 + g * 0.2, t8 + g * 0.2 + 0.2); });
  [0, 1, 2, 3].forEach((g) => sfx('tick', t8 + g * 0.2, { g: 0.5, p: -0.5 + g * 0.3 }));
  const l8 = txt(world, 'inote', tr('每组 8 位', '8 bits each'), 1350, 758);
  vanish(l8, 0); appear(l8, t8 + 0.1); span(l8, 0, Q(T('p1', '两')));

  // ── a2：写成四个零到二百五十五的数 ──
  const tW = Q(T('a2', '写成'));
  decs.forEach((e, g) => { vanish(e, 0); slam(e, tW + g * 0.2, { from: 1.5, d: 0.3 }); span(e, 0, tSw); });
  [0, 1, 2, 3].forEach((g) => sfx('key', tW + g * 0.2, { g: 0.55, p: -0.5 + g * 0.3 }));
  bc.forEach((e, i) => { const g = Math.floor(i / 8); classOn(e, 'n', tW + g * 0.2, tW + g * 0.2 + 0.35); });
  const t255 = Q(T('a2', '零'));
  const n1 = txt(world, 'inote', tr('每个数：<span class="px">0 – 255</span>', 'each number: <span class="px">0 – 255</span>'), 1350, 806);
  const n2 = txt(world, 'inote', '<span class="px">00000000 – 11111111</span>', 1350, 852);
  css(n2, { lineHeight: '1.1' });
  [n1, n2].forEach((e, i) => { vanish(e, 0); appear(e, t255 + i * 0.3); span(e, 0, Q(T('p1', '两'))); });
  sfx('tick', t255, { g: 0.5 });
  // 说完：4 个数 × 8 位 = 32 位
  const t48 = Q(Tend('a2')) + 0.2;
  const c48 = h('div', 'chip', world, tr('4 个数 × 8 位 = 32 位', '4 numbers × 8 bits = 32 bits')); px(c48, 1350, 898);
  vanish(c48, 0); appear(c48, t48); span(c48, 0, Q(T('p1', '后')));
  sfx('blip', t48, { g: 0.45 });
  M.bc = bc; M.decs = decs; M.bits = bits;
});
