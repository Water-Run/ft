// 开场：一条请求发出去，回来的是一个三位数。左边是发请求的终端（屏上是实验的原样回显），右边是回来的码。
// o1 请求出去、码回来 → o2 404 与 500 并排，各带一句释义 → o3 推近状态行，码被框出来，叫「状态码」→ oT 片名卡。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const st0 = { x: 960, y: 484, z: 1.04 };
  let cam = null;
  F((t) => { if (cam && t < s.start + 0.02) Object.assign(cam.st, st0); });   // 第 0 帧镜头也在起点（见 docs/reference/pitfalls.md）
  cam = makeCamera(world, 1920, VH);

  // ── 发请求的终端：第一帧就在 ──
  const SX = 100, SY = 150, scr = screen(world, SX, SY, 860, 660, tr('终端', 'terminal'));
  const e4 = E('404'), e5 = E('500');
  const cmd1 = addLine(scr, '', 40, 34, 28);
  const tType = s.start + 0.08;
  const tTyped = typeText(cmd1, '<span class="dima">$ </span>' + esc(e4.cmd), tType, 46, { cursorUntil: s.start + 1.2 });
  // 状态行拆成三段，好在 o3 把码框出来
  const [v4, c4, ...r4] = e4.status[0].split(' ');
  const st1 = addLine(scr, `${v4} <span class="sc">${c4}</span> ${r4.join(' ')}`, 40, 82, 40);
  const hd1 = e4.head.map((x, i) => addLine(scr, esc(x), 40, 140 + i * 36, 28, 'dim'));
  const bd1 = addLine(scr, esc(e4.body[0]), 40, 140 + hd1.length * 36 + 14, 28);
  const cmd2 = addLine(scr, '', 40, 400, 28);
  const st2 = addLine(scr, esc(e5.status[0]), 40, 450, 36, 'err');
  const hd2 = e5.head.slice(0, 3).map((x, i) => addLine(scr, esc(x), 40, 506 + i * 36, 28, 'dim'));

  // ── 线缆：从终端往右通到画外的服务器 ──
  const CY = 172, cab = cable(world, 960, CY, 1100, { name: tr('连接', 'connection') });
  // 请求包与回来的码
  const tOut1 = Math.max(tTyped + 0.05, T('o1', { zh: '请求', en: 'goes' }) - 0.1);
  const pk1 = packet(world, 'GET /missing', 980, CY - 14, 260, 58, 30);
  const tBack1 = Math.max(tOut1 + 0.65, T('o1', { zh: '三位数', en: 'three' }) - 0.15);
  appear(pk1, tOut1); fromTo(pk1, tOut1, { x: 0 }, { x: 980, duration: tBack1 - tOut1 - 0.05, ease: 'power1.in', immediateRender: false });
  set(pk1, tBack1 - 0.05, { autoAlpha: 0 });
  sfx('blip', tOut1, { g: 0.7, p: 0.2 });

  const D = 26, DX = 1250, big4 = dots(world, '404', DX, 240, D, C.red, { name: '404' });
  scanIn(big4, tBack1, 0.035); appear(big4.el, tBack1);
  sfx('error', tBack1, { g: 0.8, p: 0.5 });
  meter(tBack1, '404');
  // 回显在终端里整行出现
  const tEcho1 = tBack1 + 0.1;
  [st1, ...hd1, bd1].forEach((e) => appear(e, tEcho1));
  sfx('tick', tEcho1, { g: 0.5, p: -0.4 });

  // o2：两个码各带一句释义
  const lab4 = txt(world, 't-3', tr('没找到', 'not found'), DX + 2, 440);
  const sub4 = txt(world, 'mono mute', 'Not Found', DX + 6, 512); sub4.style.fontSize = '34px';
  const t404 = Q(T('o2', '404'));
  wipe(lab4, t404, { dir: 'l', d: 0.35 }); wipe(sub4, t404 + 0.12, { dir: 'l', d: 0.35 });
  sfx('pop', t404, { g: 0.6, p: 0.4 });

  const tCmd2 = Math.max(tEcho1 + 0.4, T('o2', '500') - 1.05);
  appear(cmd2, tCmd2);
  const tTyped2 = typeText(cmd2, '<span class="dima">$ </span>' + esc(e5.cmd), tCmd2, 70, { cursorUntil: tCmd2 + 0.65, sfxGain: 0.6 });
  const pk2 = packet(world, 'GET /boom', 980, CY - 14, 260, 58, 30);
  const tOut2 = tTyped2 + 0.02, tBack2 = Math.max(tOut2 + 0.5, T('o2', '500') - 0.05);
  appear(pk2, tOut2); fromTo(pk2, tOut2, { x: 0 }, { x: 980, duration: 0.45, ease: 'power2.in', immediateRender: false });
  set(pk2, tOut2 + 0.45, { autoAlpha: 0 });
  sfx('blip', tOut2, { g: 0.6, p: 0.2 });
  const big5 = dots(world, '500', DX, 600, D, C.red, { name: '500' });
  scanIn(big5, tBack2, 0.035); appear(big5.el, tBack2);
  sfx('error', tBack2, { g: 0.8, p: 0.5 });
  meter(tBack2, '500');
  [st2, ...hd2].forEach((e) => appear(e, tBack2 + 0.1));
  const lab5 = txt(world, 't-3', tr('服务器崩了', 'server broke'), DX + 2, 800);
  const sub5 = txt(world, 'mono mute', 'Internal Server Error', DX + 6, 872); sub5.style.fontSize = '34px';
  wipe(lab5, tBack2 + 0.3, { dir: 'l', d: 0.35 }); wipe(sub5, tBack2 + 0.42, { dir: 'l', d: 0.35 });

  // o3：推近终端里 404 那一行，码被框成琥珀底；右边标「状态码」
  const tZ = T('o3') + 0.35;
  const sc = st1.querySelector('.sc');
  classAt(sc, 'hotc', T('o3', { zh: 'H T T P', en: 'H T T P' }) - 0.1);
  const tag = txt(world, '', `<span class="amber">←</span> ${tr('状态码', 'status code')}`, SX + 598, SY + 82);
  css(tag, { font: `800 ${LANG === 'zh' ? 40 : 34}px "Inter", "Sans SC"`, color: C.amber, lineHeight: '52px' });
  const tTag = Q(T('o3') + 0.3);
  wipe(tag, tTag, { dir: 'l', d: 0.3 }); sfx('tick', tTag, { g: 0.8 });
  meter(tTag, '404');

  // ── 片名卡：一道竖着的三色线缆从左扫到右，后面就是片名 ──
  const tT = Math.max(Tend('o3') + 0.05, tTag + 1.95);
  const card = h('div', 'abs', root); px(card, 0, 0, 1920, VH); css(card, { background: C.case });
  card.dataset.name = tr('片名卡', 'title card');
  const tsc = screen(card, 120, 130, 980, 700);
  addLine(tsc, '<span class="dima">$ </span>' + esc(e4.cmd), 52, 40, 28, 'dim');
  const n96 = dots(tsc, String(TOTAL), 70, 150, 52, C.amber, { name: String(TOTAL) });
  const sec = addLine(tsc, tr('秒', 'seconds'), 70 + n96.w + 36, 150 + n96.h - 80, 64);
  css(sec, { fontFamily: '"Sans SC", "Inter"', fontWeight: 800 });
  addLine(tsc, esc(e4.status[0]), 52, 610, 40);
  const tl1 = txt(card, 'mute', tr('了解', 'in ' + TOTAL + ' seconds'), 1180, 150);
  css(tl1, { font: '700 52px "Sans SC", "Inter"' });
  const tl2 = txt(card, 'ink', 'HTTP', 1172, 226); css(tl2, { font: '900 168px/1 "Inter"' });
  const tl3 = txt(card, 'ink', tr('状态码', 'Status<br>Codes'), 1170, 404);
  css(tl3, LANG === 'zh' ? { font: '900 150px/1 "Sans SC"' } : { font: '900 112px/1 "Inter"', whiteSpace: 'nowrap' });
  const tcab = cable(card, 1180, LANG === 'zh' ? 616 : 650, 620);
  const tchips = ['1xx', '2xx', '3xx', '4xx', '5xx'].map((k, i) => chip(card, k, 1180 + i * 124, LANG === 'zh' ? 680 : 714, 110, 76, 64));
  const seamV = cable(root, -40, 0, VH, { vertical: true, name: 'seam' });
  wipe(card, tT, { dir: 'l', d: 0.45 });
  appear(seamV, tT); fromTo(seamV, tT, { x: 0 }, { x: 1990, duration: 0.45, ease: 'power3.inOut', immediateRender: false });
  set(seamV, tT + 0.46, { autoAlpha: 0 });
  sfx('riser', tT - 1.0, { g: 0.5 }); sfx('thud', tT + 0.2);
  scanIn(n96, tT + 0.25, 0.04);
  slam(tl2, tT + 0.3, { from: 1.25, d: 0.4 });
  slide(tl3, tT + 0.38, { x: 80, d: 0.45 });
  wipe(tl1, tT + 0.45, { dir: 'l', d: 0.3 });
  wipe(tcab, tT + 0.25, { dir: 'l', d: 0.4 });
  tchips.forEach((e, i) => { slam(e, tT + 0.3 + i * 0.04, { from: 1.3, d: 0.25 }); });
  sfx('beep', tT + 0.3, { g: 0.5, p: 0.3 });
  meter(tT, '');
  vanish(world, tT + 0.5);                                  // 片名卡盖满之后，底下的终端不再参与画面
  fromTo(tsc, tT + 0.5, { scale: 1 }, { scale: 1.025, transformOrigin: '50% 50%', duration: s.end + 0.3 - tT - 0.5, ease: 'none', immediateRender: false });

  cam.track(s.start, st0, [
    [s.start + 0.02, { z: 1 }, 1.0, { ease: 'power3.out', sfx: false }],
    [s.start + 1.1, { x: 990, z: 1.02 }, Math.max(0.5, tZ - s.start - 1.2), { ease: 'none', sfx: false }],
    [tZ, { x: 560, y: 330, z: 1.55 }, 0.9, { g: 0.4 }],
    [tZ + 1.0, { x: 600, z: 1.6 }, 1.6, { ease: 'none', sfx: false }],
  ]);
});
