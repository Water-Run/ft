// 网络与设备（p1–p3）：接着上一场的同一版面。地址分两截：一道竖线落在第 24、25 位之间，前 24 位变藏青（网络），后 8 位留白（设备）；
// 左下「同一网络里的设备」三行地址，前一截一样、后一截不同。/24：一个框从第 1 位数到第 24 位，地址框后面接上 /24。
// 假设要去 203.0.113.80：目的地址的 32 位排在下面，前 24 位里和你不同的位描上黑框，弹出「在别的网络」。
scene('prefix', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const X = addrLayout(world, { filled: true, prefix: true });
  const V = X.V.body, bits = X.bits;
  gauge(s.start + 0.3, tr('你的', 'Yours'), SRC);

  // 地址分两截
  const tCut = Q(T('p1', '两'));
  const cutX = bits.groupX(3) - 13;
  const cut = blk(V, 'bg-navy', cutX, 60, 6, 170); wipe(cut, tCut, { dir: 't', d: 0.3 }); sfx('thud', tCut, { g: 0.7, p: 0.2 });
  const tNet = Q(T('p1', '网络'));
  bits.slice(0, 24).forEach((b, i) => { classAt(b, 'n', tNet + i * 0.012); });
  sfx('blip', tNet, { g: 0.6, p: -0.3 });
  const labNet = txt(V, 't-m', tr('网络 · 前一截', 'Network · first part'), bits.groupX(0), 60); css(labNet, { background: '#000080', color: '#FFFFFF', padding: '0 12px' });
  wipe(labNet, tNet, { dir: 'l', d: 0.3 });
  const tDev = Q(T('p1', '设备'));
  const labDev = txt(V, 't-m', tr('设备 · 后一截', 'Device · last part'), bits.groupX(3) + 6, 60); css(labDev, { background: '#FFFFFF', border: '4px solid #000000', padding: '0 10px' });
  wipe(labDev, tDev, { dir: 'l', d: 0.3 }); sfx('pop', tDev, { g: 0.6, p: 0.4 });
  // 同一网络里的设备：前一截一样、后一截不同
  const N = makeWin(world, 60, 530, 560, 410, tr('同一网络里的设备', 'Devices on one network'));
  vanish(N.el, 0);
  openWin(N, Q(T('p1', '前')) - 0.2, [60, 120, 560, 380], { sound: 'pop', g: 0.5, p: -0.6 });
  const rows = [[tr('你的电脑', 'You'), '10'], [tr('手机', 'Phone'), '11'], [tr('电视', 'TV'), '20']];
  rows.forEach(([k, last], i) => {
    const y = 26 + i * 84;
    txt(N.body, 't-b', k, 24, y + 8);
    const a = txt(N.body, 'px', '192.168.1.', 196, y); css(a, { fontSize: '56px', padding: '0 6px' });
    const b = txt(N.body, 'px', last, 196 + 10 * 22.4 + 14, y); css(b, { fontSize: '56px', padding: '0 6px' });
    classAt(a, 'hl', tNet + 0.1 + i * 0.08);
    classAt(b, 'mark', tDev + 0.1 + i * 0.08);
  });
  const nn = txt(N.body, 'note', tr('同一网络：前一截相同，后一截不同', 'Same first part, different last part'), 24, 290);
  wipe(nn, tDev + 0.4, { dir: 'l', d: 0.3 });

  // /24：地址框后面接上 /24，一个框从第 1 位数到第 24 位
  const tSl = Q(T('p2', '斜杠'));
  set(X.ob.pre, 0, { autoAlpha: 0 }); slam(X.ob.pre, tSl, { from: 1.6, d: 0.3 }); sfx('thud', tSl, { g: 0.8, p: -0.6 });
  keyed(X.V.title).at(tSl, { html: tr('位视图 · 192.168.1.10/24', 'Bit view · 192.168.1.10/24') });
  const c24 = txt(V, 'px', '/24', cutX - 46, 2); css(c24, { fontSize: '52px', background: '#000080', color: '#FFFFFF', padding: '2px 12px 0' });
  slam(c24, tSl + 0.1, { from: 1.4, d: 0.3 });
  const t1 = Q(T('p2', '前')), t2 = Q(T('p2', '网络'));
  // 数位：第 1 到第 24 位依次描上黑框，下面的读数跟着数到 24
  const dt = (t2 - t1) / 24;
  const tHold = Q(Tend('p2') + 0.8);
  bits.slice(0, 24).forEach((b, i) => classAt(b, 'mark', t1 + i * dt, tHold));
  for (let k = 0; k < 3; k++) sfx('tick', t1 + (t2 - t1) * (k + 1) / 3, { g: 0.5, p: -0.2 + k * 0.2 });
  wipeOut(X.note, t1 - 0.35, { dir: 'l', d: 0.25 });
  const l24 = txt(V, 't-m navy', '', 40, 334);
  l24.innerHTML = tr('/24 = 前 <span>0</span> 位是网络', '/24 = the first <span>0</span> bits are the network');
  wipe(l24, t1 - 0.1, { dir: 'l', d: 0.25 }); countTo(l24.querySelector('span'), 0, 24, t1, t2 - t1);
  sfx('pop', t2 + 0.1, { g: 0.6 });
  classAt(l24, 'hl', tHold); css(l24, { padding: '0 10px' }); sfx('tick', tHold, { g: 0.5 });   // 数完：框收起，结论这一行亮起

  // 假设要去 203.0.113.80：目的地址排在下面，逐位比较前 24 位
  const tD = Q(T('p3', '二零三'));
  gauge(tD, tr('目的', 'To'), DST);
  const dl = txt(V, 'px', '', 40, 400); css(dl, { fontSize: '52px' });
  dl.innerHTML = `<span class="note" style="font-size:30px">${tr('目的', 'To')}</span> 203.0.113.80`;
  slide(dl, tD - 0.2, { x: -40, d: 0.3 });
  const dbits = bitRow(V, bits32(DST), 40, 470, { w: 28, hh: 62, gap: 2, group: 22 });
  dbits.forEach((b, i) => { vanish(b, 0); appear(b, tD + Math.floor(i / 8) * 0.18); if (i < 24) classAt(b, 'n', tD + Math.floor(i / 8) * 0.18); });
  [0, 1, 2, 3].forEach((g) => sfx('tick', tD + g * 0.18, { g: 0.55, p: 0.1 * g }));
  const tCmp = Q(T('p3', '别的网络')) - 0.25;
  const neq = txt(V, 't-m', tr('前 24 位 ≠', 'first 24 bits ≠'), 470, 404); css(neq, { background: '#000080', color: '#FFFFFF', padding: '0 12px' });
  slam(neq, Q(T('p3', '它')) - 0.1, { from: 1.3, d: 0.3 }); sfx('pop', Q(T('p3', '它')) - 0.1, { g: 0.6, p: 0.2 });
  const sb = bits32(SRC), db = bits32(DST);
  let k = 0;
  for (let i = 0; i < 24; i++) if (sb[i] !== db[i]) { classAt(dbits[i], 'mark', tCmp + k * 0.03); k++; }
  sfx('error', tCmp, { g: 0.6, p: 0.2 });
  // 结论框
  const M = makeWin(world, 1040, 790, 820, 150, tr('送往哪里', 'Where to'));
  vanish(M.el, 0);
  openWin(M, tCmp + 0.4, [700, 650, 1100, 70], { sound: 'beep', g: 0.6, p: 0.3 });
  txt(M.body, 't-m', tr('前 24 位不同：203.0.113.80 在别的网络', 'First 24 bits differ: another network'), 24, 18);
});
