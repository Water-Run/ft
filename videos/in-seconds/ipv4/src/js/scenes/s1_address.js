// 地址长什么样（a1–a2）：位视图里 32 个零或一逐位打出来；每八个一组括起来，下面各自数成十进制；左边「你的电脑」的四格地址框照着读音一格格填上 192.168.1.10。
// 位视图与「你的电脑」窗口在下一场（网络与设备）原样留在同一位置，换场时不动不闪（经验规则 F29）。
const SRC = [192, 168, 1, 10];
const DST = [203, 0, 113, 80];

// 两场共用的版面。o.filled：地址框与十进制是否已经填好（下一场一开始就是填好的状态）
function addrLayout(world, o = {}) {
  const P = makeWin(world, 60, 120, 560, 380, tr('你的电脑', 'Your computer'));
  pcIcon(P.body, 30, 36, 1.2);
  txt(P.body, 't-b', tr('IP 地址', 'IP address'), 200, 52);
  const ob = octBox(P.body, 24, 210, o.filled ? SRC : [null, null, null, null], { w: 88, prefix: o.prefix ? '/24' : '' });
  if (!o.prefix && ob.pre) ob.pre.textContent = '';
  const V = makeWin(world, 660, 120, 1200, 640, tr('位视图', 'Bit view'));
  const bits = bitRow(V.body, bits32(SRC), 40, 120, { w: 28, hh: 62, gap: 2, group: 22 });
  const brk = [], dec = [], dots = [];
  for (let g = 0; g < 4; g++) {
    const b = h('div', 'abs', V.body); px(b, bits.groupX(g), 196, bits.groupW, 20);
    css(b, { borderLeft: '4px solid #000000', borderRight: '4px solid #000000', borderBottom: '4px solid #000000' });
    brk.push(b);
    const d = txt(V.body, 'px navy', o.filled ? String(SRC[g]) : '0', bits.groupX(g), 222); css(d, { width: bits.groupW + 'px', textAlign: 'center', fontSize: '96px', lineHeight: '96px' });
    dec.push(d);
    if (g < 3) { const dt = txt(V.body, 'px', '.', bits.groupX(g) + bits.groupW + 2, 222); css(dt, { fontSize: '96px', lineHeight: '96px' }); dots.push(dt); }
  }
  const note = txt(V.body, 't-b', tr('8 位最大是 11111111 = 255，所以每段都在 0–255 之间', '8 bits max out at 11111111 = 255, so each part is 0–255'), 40, 334);
  return { P, V, ob, bits, brk, dec, dots, note };
}

scene('address', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const X = addrLayout(world);
  // 从「关于」对话框的「第 4 版」那一行放大出位视图
  zoomFx(s.start, [130, 530, 920, 52], X.V.rect, 0.3); sfx('drive', s.start, { g: 0.6 });
  // 一个 IPv4 地址，是三十二个零或一：逐位打出，计数到 32
  const cnt = txt(X.V.body, 't-b', '', 40, 30);
  const tBits = Q(T('a1', '地址')), step = 0.06;
  X.bits.forEach((b, i) => { vanish(b, 0); appear(b, tBits + i * step); if (i % 4 === 0) sfx('key', tBits + i * step, { g: 0.55, p: -0.2 + i / 60 }); });
  F((t) => { const n = clamp(Math.floor((t - tBits) / step) + 1, 0, 32); const v = n > 0 ? tr(`第 ${n} 位 / 共 32 位`, `bit ${n} of 32`) : ''; if (cnt.textContent !== v) cnt.textContent = v; });
  sfx('pop', tBits + 32 * step, { g: 0.6, p: 0.3 });
  const c32 = txt(X.V.body, 't-m', tr('32 个零或一', '32 zeros or ones'), 40, 200); css(c32, { background: '#000080', color: '#FFFFFF', padding: '0 14px' });
  slam(c32, Q(tBits + 32 * step), { from: 1.3, d: 0.3 }); hide(c32, Q(T('a2', '八')) - 0.1, { d: 0.15 });
  // 每八个一组写成十进制
  const t8 = Q(T('a2', '八'));
  X.brk.forEach((b, g) => { vanish(b, 0); wipe(b, t8 + g * 0.12, { dir: 'l', d: 0.25 }); sfx('tick', t8 + g * 0.12, { g: 0.6, p: -0.2 + g * 0.2 }); });
  X.bits.forEach((b, i) => classAt(b, 'n', t8 + Math.floor(i / 8) * 0.25, t8 + Math.floor(i / 8) * 0.25 + 0.5));   // 每组八位一起亮一下，一组接一组
  const tDec = Q(T('a2', '十进制'));
  X.dec.forEach((d, g) => { vanish(d, 0); appear(d, tDec + g * 0.15); countTo(d, 0, SRC[g], tDec + g * 0.15, 0.6); });
  X.dots.forEach((d, g) => { vanish(d, 0); appear(d, tDec + 0.6 + g * 0.15); });
  sfx('blip', tDec, { g: 0.6 }); sfx('blip', tDec + 0.45, { g: 0.45 });
  // 比如 192.168.1.10：左边的地址框照着读音一格格填上
  const tA = T('a2', '一九二点一六八'), tB = T('a2', '一点一零');
  const fills = [tA, tA + 0.75, tB, tB + 0.35].map((t) => Q(t));
  X.ob.cells.forEach((c, i) => { keyed(c).at(fills[i], { html: String(SRC[i]) }); sfx('tick', fills[i], { g: 0.7, p: -0.6 }); });
  X.dec.forEach((d, i) => classAt(d, 'hl', fills[i], fills[i] + 0.6));
  gauge(s.start + 0.3, tr('你的', 'Yours'), []);
  X.ob.cells.forEach((c, i) => classAt(c, 'hl', Q(Tend('a2') + 0.3) + i * 0.08));   // 这就是你这台电脑的地址：四格一起亮起，留到换场
  sfx('pop', Q(Tend('a2') + 0.3), { g: 0.5, p: -0.6 });
  fills.forEach((f, i) => gauge(f, tr('你的', 'Yours'), SRC.slice(0, i + 1)));
  // 画面补一句：8 位最大是 11111111，即 255
  const tNote = Q(tDec + 1.0);
  vanish(X.note, 0); wipe(X.note, tNote, { dir: 'l', d: 0.35 }); sfx('pop', tNote, { g: 0.5 });
});
