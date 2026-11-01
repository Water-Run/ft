// 不够用了（e1–e4）：IPv4 地址总数窗口——32 格填满，读数滚到 4,294,967,296，约 43 亿；地址空间窗口——256 块（每块 /8 约 1678 万个），
// 按 IANA 登记表着色（research/lab/out_20_iana_pool.txt），最后 5 块在「分完了」时依次填上，弹出「地址池已空」（2011 年 2 月 3 日）。
// IPv6 窗口：32 格对 128 格（一格一位，标明是位数）；最后一条小流程：先看网络 → 再交给下一站，数据包走过去。
const IANA_KINDS = 'RAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLAAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR';

scene('limit', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);

  // ── IPv4 地址总数 ──
  const Cw = makeWin(world, 940, 120, 920, 330, tr('IPv4 地址总数', 'How many IPv4 addresses'));
  zoomFx(s.start, [849, 249, 990, 50], Cw.rect, 0.3); sfx('drive', s.start, { g: 0.6, p: 0.4 });
  const segs = [];
  for (let i = 0; i < 32; i++) { const e = blk(Cw.body, 'sunken', 34 + i * 26, 26, 22, 34); segs.push(e); }
  const t32 = Q(T('e1', '三十二'));
  segs.forEach((e, i) => classAt(e, 'bg-navy', t32 + i * 0.02));
  sfx('blip', t32, { g: 0.6, p: 0.4 });
  const lab32 = txt(Cw.body, 'note', tr('32 位', '32 bits'), 34, 70); void lab32;
  const cnt = txt(Cw.body, 'px navy', '0', 34, 100); cnt.style.fontSize = '96px';
  const tCnt = Q(T('e1', '只有'));
  countTo(cnt, 0, 4294967296, tCnt, 1.0, (v) => group3(Math.round(v)));
  sfx('tick', tCnt, { g: 0.5 }); sfx('tick', tCnt + 0.5, { g: 0.5 });
  const yi = txt(Cw.body, 't-m', '', 34, 206);
  yi.innerHTML = tr('= 2<sup>32</sup> ≈ 43 亿个', '= 2<sup>32</sup> ≈ 4.3 billion');
  const t43 = Q(T('e1', '四十三亿'));
  slam(yi, t43, { from: 1.3, d: 0.3 }); sfx('thud', t43 + 0.05, { g: 0.8, p: 0.4 });
  gauge(t32 + 0.7, tr('最大', 'Max'), [255, 255, 255, 255]);

  // ── 地址空间：256 块 ──
  const Gw = makeWin(world, 60, 120, 840, 818, tr('IPv4 地址空间 · 256 块，每块约 1678 万个', 'IPv4 space · 256 blocks of ~16.78 M'));
  vanish(Gw.el, 0);
  const tG = Q(Tend('e1') - 0.2);
  openWin(Gw, tG, Cw.rect, { sound: 'drive', g: 0.5, p: -0.4 });
  const area = h('div', 'abs sunken', Gw.body); px(area, 24, 16, 720, 640);
  const cells = [];
  [...IANA_KINDS].forEach((k, i) => { const e = h('div', 'cell ' + k, area); px(e, 74 + (i % 16) * 38, 14 + Math.floor(i / 16) * 38, 32, 32); cells.push([e, k]); });
  for (let r = 0; r < 16; r++) { const a = txt(area, 'px', String(r * 16), 4, 14 + r * 38); css(a, { fontSize: '30px', width: '56px', textAlign: 'right', lineHeight: '32px' }); }
  const lg = h('div', 'abs', Gw.body); px(lg, 24, 668);
  lg.innerHTML = `<span class="note"><span class="cell A" style="position:relative;display:inline-block;width:26px;height:26px;vertical-align:-4px"></span> ${tr('已分配', 'allocated')} &nbsp; <span class="cell R" style="position:relative;display:inline-block;width:26px;height:26px;vertical-align:-4px"></span> ${tr('保留', 'reserved')} &nbsp; <span class="cell L" style="position:relative;display:inline-block;width:26px;height:26px;vertical-align:-4px"></span> ${tr('最后 5 块', 'last 5')}</span>`;
  // 状态栏：二〇一一年 · 还剩几块空闲；「全球统一管理」处贴上 IANA
  const stb = h('div', 'abs sunken', Gw.body); px(stb, 456, 664, 356, 44); css(stb, { font: "500 28px/38px 'Sans SC'", padding: '0 12px' });
  const tYr = Q(T('e2')) + 0.05;
  vanish(stb, 0); wipe(stb, tYr, { dir: 'l', d: 0.25 }); sfx('tick', tYr, { g: 0.6, p: -0.4 });
  const tUni = Q(T('e2', '统一'));
  const iana = txt(Gw.body, 'tag on', tr('IANA · 全球统一管理（数据：IANA 登记表）', 'IANA · global registry (data: IANA registry)'), 24, 712); css(iana, { fontSize: '30px', fontFamily: "'Sans SC'", fontWeight: '700' });
  slam(iana, tUni, { from: 1.3, d: 0.3 }); sfx('pop', tUni, { g: 0.6, p: -0.3 });
  // 二〇一一年，全球统一管理的地址池分完了：最后 5 块依次填上
  const tDone = Q(T('e2', '分完')) - 0.2;
  cells.filter(([, k]) => k === 'L').forEach(([e], i) => { classAt(e, 'done', tDone + i * 0.12); sfx('tick', tDone + i * 0.12, { g: 0.6 - i * 0.05, p: -0.4 }); });
  const free = (n) => tr(`2011 年 · 空闲 ${n} 块`, `2011 · ${n} blocks free`);
  const kst = keyed(stb); kst.at(tYr, { html: free(5) }); [4, 3, 2, 1, 0].forEach((n, i) => kst.at(tDone + i * 0.12, { html: free(n) }));
  const I = makeWin(world, 960, 150, 880, 290, tr('IANA 总地址池', 'IANA free pool'));
  vanish(I.el, 0);
  const tI = Q(Tend('e2')) - 0.1;
  openWin(I, tI, [74 + 60, 120 + 62 + 16, 720, 640], { sound: 'beep', g: 0.7, p: 0.4 });
  vanish(Cw.el, tI + 0.25);                                     // 提示框盖住总数窗口：总数窗口随之收起
  txt(I.body, 't-m', tr('地址池已空。', 'The pool is empty.'), 30, 18);
  txt(I.body, 'note', tr('2011 年 2 月 3 日：最后 5 块分给了 5 个地区注册机构', 'Feb 3, 2011: the last 5 blocks went to the 5 regional registries'), 30, 78);
  const prog = h('div', 'abs sunken', I.body); px(prog, 30, 134, 640, 44);
  for (let i = 0; i < 20; i++) blk(prog, 'bg-navy', 3 + i * 31.6, 3, 28, 32);
  const ok = h('div', 'btn raised', I.body, tr('确定', 'OK')); px(ok, 690, 128, 150, 58); void ok;

  // ── IPv6：128 位 ──
  const tV6 = Q(T('e3')) - 0.3;
  const V6 = makeWin(world, 940, 478, 920, 460, tr('IPv6 · 接班者', 'IPv6 · the successor'));
  vanish(V6.el, 0);
  openWin(V6, tV6, I.rect, { sound: 'drive', g: 0.6, p: 0.4 });
  const l4 = txt(V6.body, 'px', '', 30, 14); css(l4, { fontSize: '48px' });
  l4.innerHTML = `IPv4 32 <span style="font:500 34px 'Sans SC'">${tr('位', 'bits')}</span>`;
  for (let i = 0; i < 32; i++) blk(V6.body, 'bg-dgray', 30 + i * 26, 70, 22, 22);
  const l6 = txt(V6.body, 'px navy', '', 30, 108); css(l6, { fontSize: '48px' });
  l6.innerHTML = `IPv6 128 <span style="font:500 34px 'Sans SC'">${tr('位', 'bits')}</span> <span class="note" style="font-size:28px">${tr('一格一位', 'one cell = one bit')}</span>`;
  l6.dataset.gloss = 'IPv6';
  const tV = Q(T('e3', 'V'));
  slide(l6, tV - 0.1, { x: -40, d: 0.3 }); sfx('pop', tV, { g: 0.7, p: 0.4 });
  const t128 = Q(T('e3', '一百二十八'));
  for (let i = 0; i < 128; i++) {
    const e = blk(V6.body, 'bg-navy', 30 + (i % 32) * 26, 164 + Math.floor(i / 32) * 28, 22, 22);
    vanish(e, 0); appear(e, t128 + Math.floor(i / 32) * 0.18 + (i % 32) * 0.004);
  }
  [0, 1, 2, 3].forEach((r) => sfx('tick', t128 + r * 0.18, { g: 0.55, p: 0.4 }));
  sfx('chime', t128 + 0.8, { g: 0.8, p: 0.4 });

  // 找路的办法照旧：先看网络，再交给下一站
  const st = h('div', 'abs', V6.body); px(st, 30, 300, 860, 80);
  const s1 = h('div', 'abs raised', st, tr('先看网络', 'Check the network')); px(s1, 0, 6, 230, 60); css(s1, { font: "700 30px/54px 'Sans SC'", textAlign: 'center', background: '#FFFFFF' });
  const ar = blk(st, 'bg-black', 244, 34, 50, 6);
  const s2 = h('div', 'abs raised', st, tr('再交给下一站', 'Then the next hop')); px(s2, 308, 6, 270, 60); css(s2, { font: "700 30px/54px 'Sans SC'", textAlign: 'center', background: '#FFFFFF' });
  const line = blk(st, 'bg-dgray', 600, 34, 200, 6);
  const rr = routerIcon(st, 790, 10, 0.45);
  const tSt = Q(Tend('e3') + 0.3);
  [s1, ar, s2, line, rr].forEach((e, i) => { vanish(e, 0); appear(e, tSt + i * 0.06); });
  sfx('tick', tSt, { g: 0.5, p: 0.4 });
  const tFirst = Q(T('e4', '先')), tThen = Q(T('e4', '再'));
  classAt(s1, 'hl', tFirst); classAt(s2, 'hl', tThen);
  sfx('pop', tFirst, { g: 0.6, p: 0.3 }); sfx('pop', tThen, { g: 0.6, p: 0.5 });
  const mp = blk(st, 'bg-navy', 0, 0, 34, 24); css(mp, { border: '3px solid #FFFFFF' }); mp.dataset.name = '数据包';
  moveAlong(mp, [[tThen + 0.2, 600, 24], [Q(T('e4', '站')) + 0.1, 772, 24]], tThen + 0.2, 1e9);
  classAt(rr, 'hot', Q(T('e4', '站')) + 0.1); sfx('blip', Q(T('e4', '站')) + 0.1, { g: 0.6, p: 0.6 });
  // 收尾：按下「确定」关掉「地址池已空」，下面的总数窗口重新露出来
  const tClose = Q(Tend('e4') + 0.2);
  zoomFx(tClose - 0.25, I.rect, [960 + 6 + 690, 150 + 62 + 128, 150, 58], 0.25);
  vanish(I.el, tClose); set(Cw.el, tClose, { autoAlpha: 1 }); sfx('tick', tClose - 0.25, { g: 0.6, p: 0.4 });
});
