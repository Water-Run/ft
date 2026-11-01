// 历史（h1–h2）：接着开场的「关于 IPv4」窗口往下排——1981 年 RFC 791 定稿（读到「三十二位」时，窗口里排出 32 格、标「地址 32 位」），
// 1983 年 1 月 1 日全面改用，一直到「今天」；说完窗口收进顶部的年表（1981、1983、今天亮着，1994、2011 留到后面）。
scene('history', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { D, nodes, year } = M;
  const b = D.body;

  // ── h1：一九八一年，IPv4 定稿，地址定为三十二位 ──
  const t81 = Q(T('h1', '一九八一'));
  appear(nodes[4].el, t81); sfx('thud', t81, { g: 0.6, p: 0.2 });
  M.flowK.push([t81, M.flowTo(3), M.flowTo(4), 0.5]);
  classOn(nodes[4].el, 'hl', Q(T('h1', '定稿')), Infinity);
  sfx('tick', Q(T('h1', '定稿')), { g: 0.5 });
  const t32 = Q(T('h1', '三十二'));
  const strip = h('div', 'abs', b); px(strip, 660, 186);
  const cells = [];
  for (let i = 0; i < 32; i++) { const e = h('div', 'b6 sunken', strip); px(e, i * 28 + Math.floor(i / 8) * 12, 0, 24, 34); cells.push(e); }
  const l32 = txt(b, 't-m', tr('地址 32 位', '32-bit address'), 1606, 184); css(l32, { fontSize: '32px', color: 'var(--navy)' });
  [strip, l32].forEach((e) => { vanish(e, 0); appear(e, t32); });
  cells.forEach((e) => classOn(e, 'n', t32, Q(T('h2', '一九八三'))));
  classOn(nodes[4].el, 'mk', t32, Infinity);
  sfx('key', t32, { g: 0.6 });

  // ── h2：一九八三年，互联网的前身全面改用它，一直用到今天 ──
  const t83 = Q(T('h2', '一九八三'));
  appear(nodes[5].el, t83); sfx('thud', t83, { g: 0.6, p: 0.4 });
  M.flowK.push([t83, M.flowTo(4), M.flowTo(5), 0.5]);
  classOn(nodes[5].el, 'hl', Q(T('h2', '全面')), Infinity);
  sfx('tick', Q(T('h2', '全面')), { g: 0.5 });
  const tNow = Q(T('h2', '一直') - 0.5);
  appear(nodes[6].el, tNow); sfx('chime', tNow + 0.6, { g: 0.45, p: 0.6 });
  M.flowK.push([tNow, M.flowTo(5), M.flowTo(6), 0.9]);
  classOn(nodes[6].el, 'hl', tNow + 0.6, Infinity);

  // ── 收起：窗口缩进顶部的年表 ──
  const tClose = Q(Tend('h2') + 0.7);
  zoomFx(tClose, D.rect, year.rect, 0.3);
  vanish(D.el, tClose);
  hideWin(M.mapG, M.tDOpen + 0.25, tClose);       // 窗口与网络窗口一样大，开着时底下的图整层藏掉
  sfx('whoosh', tClose, { g: 0.45 });
  vanish(year.el, 0); appear(year.el, tClose + 0.3);
  [0, 1, 4].forEach((i) => classOn(year.box[i], 'hl', tClose + 0.3, Infinity));
});
