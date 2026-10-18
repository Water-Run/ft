// 开场：一台终端接在机架上，里面的程序在计数。数到 4 时插头被拔掉、终端黑屏，机架里的那块屏继续数到 9；插回去，读到 9。
// 然后起名：机架顶上的显示窗亮出 TMUX；四块小 CRT 同一格亮起；人再走开，它们还在。最后是片名铭牌。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const START = { x: 960, y: 484, z: 1.06 };
  let camRef = null;
  F((t) => { if (camRef && t < s.start + 0.03) Object.assign(camRef.st, START); });   // 第 0 帧镜头放回起点（pitfalls：全片第 0 帧）
  const cam = makeCamera(world, 1920, VH); camRef = cam;
  const W = (o) => pick(o);

  // ── 时刻 ──
  const tA = s.start + 0.25;
  const tDis = T('o1', { zh: '断开', en: 'drops' });
  const t9 = T('o2', '9');
  const tRe = Math.max(tDis + 1.6, t9 - 0.5);
  const tO3 = T('o3'), tO3b = T('o3', { zh: '终端', en: 'Only' });
  const tO4 = T('o4'), tName = T('o4', 'tmux'), tKind = T('o4', { zh: '终端复用器', en: 'terminal multiplexer' });
  const tO5 = T('o5'), tLeave = Math.min(T('o5', { zh: '人走了', en: 'after you go' }), Tend('o5') - 1.0);
  const tTitle = T('oT') - 0.12;

  // ── 计数器：1→4（o1 里），断开后机架那块继续 5→9，插回去时读到 9 ──
  Object.assign(CNTX, { a: tA, dis: tDis, re: tRe });
  const cnt = COUNT;
  const ticks = []; for (let k = 2; k <= 9; k++) { let lo = tA, hi = tRe + 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (cnt(m) >= k) hi = m; else lo = m; } ticks.push([k, hi]); }

  // ── 左：终端（client）──
  const tlab = tag(world, tr('终端', 'TERMINAL'), 150, 132, { zh: LANG === 'zh' });
  const cl = crt(world, 150, 190, 640, 470, { bezel: 'cream', screws: 12, name: 'terminal CRT' });
  const kb = panel(world, 'cream', 200, 684, 540, 92, { name: 'keyboard' });
  for (let r = 0; r < 3; r++) for (let i = 0; i < 14 - r; i++) blk(kb, '#B9B096', 18 + r * 16 + i * 36, 12 + r * 24, 28, 16);
  const prompt = term(cl, '<span class="dim">$</span> ./count', 26, 16, { size: 34 });
  const clLines = term(cl, '', 26, 74, { vt: true, size: 66 });
  // ── 右：机架（还没起名）──
  const RX = 1120, RY = 130;
  const rk = rack(world, RX, RY, 660, 800);
  const pwr = led(world, RX + 30, RY + 22, 28, 'g');
  txt(world, 'silk', 'POWER', RX + 72, RY + 24);
  const disp = panel(world, 'black', RX + 28, RY + 84, 598, 270, { name: 'display window' });
  // 显示窗：起名之前是机架自己的计数读数（与下面那块屏同步），起名时换成 TMUX
  const idle = h('div', 'abs', disp); px(idle, 0, 0, 592, 260); idle.dataset.name = 'rack readout';
  const idleK = txt(idle, 'lab gdim', 'RUN', 34, 26); idleK.style.fontSize = '30px';
  const idleLed = led(idle, 120, 30, 24, 'g');
  const idleN = txt(idle, 'vt green', '0000', 34, 60); idleN.style.fontSize = '190px';
  F((t) => { const v = String(COUNT(t)).padStart(4, '0'); if (idleN.textContent !== v) idleN.textContent = v; idleLed.style.visibility = Math.floor(q12(t) * 2) % 2 ? 'hidden' : 'visible'; });
  const rc = crt(world, RX + 28, RY + 376, 598, 230, { bare: true, pad: 0, name: 'rack CRT' });
  const rcLines = term(rc, '', 24, 14, { vt: true, size: 52 });
  const smalls = [0, 1, 2, 3].map((i) => {
    const c = crt(world, RX + 28 + i * 152, RY + 628, 142, 112, { bare: true, pad: 0, lit: false, name: 'small CRT' });
    const l0 = term(c, ['count 9', '$ vim', '$ make', '$ ssh'][i], 10, 8, { size: 24 });
    if (i === 0) F((t) => { const v = 'count ' + COUNT(t); if (l0.textContent !== v) l0.textContent = v; });
    term(c, '<span class="dim">' + ['', '~', '[ok]', '...'][i] + '</span>', 10, 40, { size: 24 });
    return c;
  });
  const warn = led(world, RX - 30, RY + 600, 26, 'off');
  const cab = cableRig(svgLayer(world), { x: 786, y: 600 }, { x: RX - 24, y: RY + 690 }, { sag: 90, pull: { x: -250, y: 40 } });

  // 计数行：两块屏显示同一组行（终端断开时它那块是黑的）
  const linesAt = (n, max) => { const out = []; for (let k = Math.max(1, n - max + 1); k <= n; k++) out.push('count ' + k); return out.join('<br>'); };
  let lastN = -1;
  F((t) => { const n = cnt(t); if (n === lastN) return; lastN = n; clLines.innerHTML = linesAt(n, 5); rcLines.innerHTML = linesAt(n, 3); });
  ticks.forEach(([k, t]) => sfx('tick', t, { g: k <= 4 ? 0.55 : 0.45, p: k <= 4 ? -0.2 : 0.5 }));

  // 第一帧：终端与机架已在，镜头从略近处退开
  appear(cl.el, s.start); appear(rk.el, s.start);
  swipe(tlab, s.start + 0.1, 'l', 0.33);

  // 拔插头：继电器一声，警示灯闪一次，终端断电
  cab.move(tDis, 1, 0.34); sfx('thud', tDis, { g: 0.75, p: -0.1 }); ledBlink(warn, tDis + 0.04, 'r', 1);
  cl.off(tDis + 0.12); sfx('error', tDis + 0.16, { g: 0.35, p: -0.4 });
  // 插回去：终端开机，读到 9
  cab.move(tRe, 0, 0.3); sfx('thud', tRe + 0.2, { g: 0.6, p: -0.1 });
  cl.on(tRe + 0.3); sfx('blip', tRe + 0.34, { g: 0.6, p: -0.4 });

  // o3：走掉的只是终端，程序一直在跑
  const tg1 = tag(world, tr('走掉的：只是终端', 'GONE: ONLY THE TERMINAL'), 150, 132, { zh: LANG === 'zh', dark: true }); hide(tlab, tO3b - 0.2, { d: 0.1, ease: SE(0.1) });
  const tg2 = tag(world, tr('一直在跑：程序', 'KEPT RUNNING: THE PROGRAM'), RX + 28, RY + 316 + 64, { zh: LANG === 'zh' });
  tg2.style.top = (RY + 376 - 44) + 'px';
  swipe(tg1, tO3b - 0.1, 'l', 0.33); sfx('pop', tO3b - 0.1, { g: 0.6, p: -0.4 });
  swipe(tg2, tO3 + 0.1, 'r', 0.33); sfx('pop', tO3 + 0.1, { g: 0.6, p: 0.4 });
  const rcBox = blk(world, 'transparent', RX + 22, RY + 370, 610, 242); css(rcBox, { border: '4px solid ' + C.green }); rcBox.dataset.name = 'running frame';
  F((t) => { const on = t >= tO3 + 0.1 && t < tO4; rcBox.style.display = on ? '' : 'none'; });
  hide(tg1, tO4 - 0.05, { d: 0.17, ease: SE(0.17) });

  // o4：起名。显示窗亮出 TMUX
  vanish(idle, tName - 0.05);
  const big = txt(disp, 'vt green', 'TMUX', 60, 0); big.style.fontSize = '210px'; vanish(big, tTitle + 0.45); big.dataset.name = 'TMUX';
  appear(big, tName); sfx('thud', tName, { g: 0.9, p: 0.4 });
  F((t) => { const f = Math.floor((t - tName) * FPS12); big.style.opacity = f === 1 || f === 3 ? '0.35' : '1'; });
  const kind = tag(disp, tr('终端复用器', 'TERMINAL MULTIPLEXER'), 66, 196, { zh: LANG === 'zh', size: LANG === 'zh' ? 36 : 30 });
  css(kind, { zIndex: 2 });
  swipe(kind, tKind, 'l', 0.42); sfx('pop', tKind, { g: 0.7, p: 0.4 }); vanish(kind, tTitle + 0.45);
  const ver = txt(world, 'silk steel', 'tmux 3.4', RX + 470, RY + 24); ver.style.fontSize = '24px';
  appear(ver, tKind + 0.3);
  hide(tg2, tO4, { d: 0.17, ease: SE(0.17) });

  // o5：同一块屏开好几个终端（四格同一帧亮），人走了它们还在
  const tLit = tO5 + 0.6;
  smalls.forEach((c) => c.on(tLit)); sfx('beep', tLit + 0.02, { g: 0.6, p: 0.5 });
  const quad = h('div', 'abs', cl.inner); px(quad, 0, 0, cl.W, cl.H); css(quad, { background: C.black });
  const qw = (cl.W - 10) / 2, qh = (cl.H - 10) / 2;
  blk(quad, C.charcoal || '#2B2D2A', qw, 0, 10, cl.H); blk(quad, '#2B2D2A', 0, qh, cl.W, 10);
  ['count 9', '$ vim', '$ make', '$ ssh'].forEach((l, i) => { const e = txt(quad, 'mono green', l, (i % 2) * (qw + 10) + 18, Math.floor(i / 2) * (qh + 10) + 14); e.style.fontSize = '30px'; if (!i) F((t) => { const v = 'count ' + COUNT(t); if (e.textContent !== v) e.textContent = v; }); });
  countTicks(tRe + 0.6, tTitle, { g: 0.28 });
  appear(quad, tLit); vanish(prompt, tLit); vanish(clLines, tLit);
  gauge(tLit, 1, 1, 4);
  cab.move(tLeave, 1, 0.34); sfx('thud', tLeave, { g: 0.7, p: -0.1 }); ledBlink(warn, tLeave + 0.04, 'r', 1);
  cl.off(tLeave + 0.12);

  // oT：片名铭牌，一块米色挡板从上落下，压字标签上是完整片名
  const card = panel(root, 'cream', 40, 30, 1840, 900, { screws: 18, name: 'title plate' });
  const win = blk(card, C.black, 70, 120, 1694, 430);
  if (LANG === 'zh') {
    const n = txt(win, 'vt amber', '128', 60, 40); n.style.fontSize = '330px';
    const u = txt(win, 'zh-b amber', '秒关于', 520, 190); u.style.fontSize = '120px';
    const tm = txt(win, 'vt green', 'TMUX', 920, 40); tm.style.fontSize = '330px';
  } else {
    const tm = txt(win, 'vt green', 'TMUX', 60, 40); tm.style.fontSize = '330px';
    const u = txt(win, 'vt amber', 'IN 128 SECONDS', 680, 170); u.style.fontSize = '150px';
  }
  const sub = txt(card, 'zh-b ink', tr('是什么，怎么用，如何实现的', 'What it is, how to use it, how it works'), 76, 610);
  sub.style.fontSize = LANG === 'zh' ? '96px' : '80px';
  const strip = blk(card, '#A8432F', 76, 770, 300, 14);
  fromTo(card, tTitle, { y: -980 }, { y: 0, duration: 0.42, ease: SE(0.42) });
  appear(card, tTitle); sfx('thud', tTitle + 0.4, { g: 0.95 });
  swipe(sub, tTitle + 0.5, 'l', 0.5); sfx('tick', tTitle + 0.5, { g: 0.6 });
  F((t) => { const f = Math.floor((t - tTitle - 0.42) * FPS12); win.style.opacity = f < 0 ? '1' : f === 0 || f === 2 ? '0.25' : '1'; });

  // ── 镜头 ──
  cam.track(s.start, START, [
    [s.start + 0.03, { z: 1 }, 0.75, { ease: 'power3.out', sfx: false }],
    [s.start + 0.9, { x: 990, z: 1.03 }, Math.max(1, tO3 - s.start - 1.2), { ease: 'none', sfx: false }],
    [tO4 - 0.25, { x: 1447, y: 360, z: 1.42 }, 1.0, { sfx: false }],
    [tO5 - 0.15, { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.5, tTitle - tO5 - 0.7), { ease: 'none', sfx: false }],
  ]);
});
