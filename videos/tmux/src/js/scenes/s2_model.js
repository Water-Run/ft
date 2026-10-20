// 模型：回到那个计数。机架的前盖抬起 = server（PID 506）；计数程序是它的子进程（PPID 506），用的是 server 造的伪终端；
// 眼前的终端只是 client，经机架侧面的 socket 插孔接进来；拔掉插头，断的只是这条线。然后进到机架里：磁带仓 = session，
// 频道旋钮 = window，被挡板切开的 CRT = pane（实验里的两块：40×24 /dev/pts/3，39×24 /dev/pts/4）。
scene('model', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '4400px' });
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh', zt = (o = {}) => ({ zh: ZH, ...o });
  const tM1 = T('m1'), tQ = T('m1', { zh: '住在哪', en: 'live' });
  const tM2 = T('m2'), tSrv0 = T('m2', 'server'), tBoot = Math.min(T('m2', 'tmux') + 0.25, tSrv0 - 0.6), tBg = Math.min(T('m2', { zh: '后台进程', en: 'background' }), tSrv0 - 0.2), tSrv = tBoot;
  const tM3 = T('m3'), tChild = T('m3', { zh: '子进程', en: 'child' });
  const tM4 = T('m4'), tPty = T('m4', { zh: '伪终端', en: 'pseudo' });
  const tM5 = T('m5'), tCli = T('m5', 'client'), tKeys = T('m5', { zh: '显示和按键', en: 'picture' });
  const tM7 = T('m7'), tSock = T('m7', { zh: '本地连接', en: 'local socket' });
  const tBreak = T('m7', { zh: '关掉终端', en: 'closing' }) + 0.1;
  const tM10 = T('m10'), tThree = T('m10', { zh: '三层', en: 'three layers' }), tSes = T('m10', 'session'), tM9 = tThree - 0.15;
  const tM11 = T('m11'), tWin = T('m11', 'window'), tFull = T('m11', { zh: '占满一屏', en: 'filling' });
  const tM12 = T('m12'), tPane = T('m12', 'pane'), tOwn = T('m12', { zh: '独立的伪终端', en: 'own pseudo' });

  // ── 站 A：终端（client）与机架（server）──
  const cl = crt(world, 90, 230, 480, 360, { bezel: 'cream', screws: 12, name: 'client terminal' });
  const kb = panel(world, 'cream', 130, 610, 400, 74, { name: 'keyboard' });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 10; i++) blk(kb, '#B9B096', 16 + r * 18 + i * 36, 14 + r * 26, 28, 16);
  const cnt = COUNT, linesAt = countLines;
  const clL = term(cl, '', 24, 20, { vt: true, size: 60 });
  appear(cl.el, s.start); appear(kb, s.start);
  const q = txt(world, 'vt amber', '?', 300, 60); q.style.fontSize = '170px'; q.dataset.name = 'question mark';
  slam(q, tQ - 0.1, { from: 1.5, d: 0.25, ease: SE(0.25) }); sfx('pop', tQ - 0.1, { g: 0.7, p: -0.4 });
  hide(q, tM2 + 0.2, { d: 0.17, ease: SE(0.17) });

  const RX = 940, RY = 120;
  const rk = rack(world, RX, RY, 880, 820); appear(rk.el, s.start);
  const pwr = led(world, RX + 30, RY + 40, 30, 'off');
  ledAt(pwr, tSrv - 0.1, 'g');
  const vfd = panel(world, 'black', RX + 80, RY + 20, 560, 96, { name: 'server VFD' });
  const vt = txt(vfd, 'vt green', 'SERVER  PID 506', 22, 6); vt.style.fontSize = '84px';
  appear(vt, tSrv); F((t) => { const f = Math.floor((t - tSrv) * FPS12); vt.style.opacity = f === 1 || f === 3 ? '0.3' : '1'; });
  sfx('beep', tSrv, { g: 0.7, p: 0.3 }); sfx('thud', tSrv - 0.1, { g: 0.6, p: 0.3 });
  const srvTag = tag(world, tr('后台进程', 'BACKGROUND PROCESS'), RX + 660, RY + 48, zt({ size: 24 }));
  swipe(srvTag, tBg, 'l', 0.33);
  // 前盖：m2 之前盖着机架里面，读到 server 时抬起
  const lid = panel(world, 'olive', RX + 20, RY + 140, 840, 660, { screws: 12, name: 'rack lid' });
  const lidQ = txt(lid, 'vt', '? ? ?', 300, 230); css(lidQ, { fontSize: '150px', color: C.cream });
  fromTo(lid, tBg + 0.15, { y: 0 }, { y: -700, duration: 0.5, ease: SE(0.5), immediateRender: false });
  set(lid, tBg + 0.66, { autoAlpha: 0 }); sfx('drive', tBg + 0.15, { g: 0.6, p: 0.3 });
  // 子进程卡
  const card = panel(world, 'cream', RX + 60, RY + 170, 360, 210, { screws: 10, name: 'counter process card' });
  txt(card, 'lab ink', tr('计数程序', 'COUNTER'), 24, 20).style.fontSize = '30px';
  if (ZH) card.lastChild.style.fontFamily = '"Sans SC", "Mono"';
  const pp = txt(card, 'vt ink', 'PPID 506', 22, 76); pp.style.fontSize = '96px';
  sslide(card, tM3 - 0.15, { y: 80 }); sfx('thud', tM3 + 0.15, { g: 0.6, p: 0.2 });
  const childTag = tag(world, tr('server 的子进程', 'CHILD OF THE SERVER'), RX + 60, RY + 384, zt({ dark: true, size: 24 }));
  swipe(childTag, tChild, 'l', 0.33); sfx('pop', tChild, { g: 0.6 });
  const ov = svgLayer(world);
  const tree = svg('path', { d: `M${RX + 200},${RY + 116} L${RX + 200},${RY + 170}`, fill: 'none', stroke: C.amber, 'stroke-width': 8 }, ov);
  draw(tree, tChild - 0.2, 0.25, { ease: SE(0.25) });
  // 伪终端模块
  const pty = panel(world, 'olive', RX + 460, RY + 170, 360, 210, { screws: 10, name: 'pty module' });
  const ptyL = txt(pty, 'lab cream', tr('伪终端', 'PSEUDO TERMINAL'), 24, 20); ptyL.style.fontSize = '28px'; if (ZH) ptyL.style.fontFamily = '"Sans SC", "Mono"';
  const ptyW = blk(pty, C.black, 22, 78, 310, 96);
  const pn = txt(ptyW, 'vt green', '/dev/pts/2', 14, 6); pn.style.fontSize = '78px';
  sslide(pty, tM4 - 0.1, { x: 80 }); sfx('thud', tM4 + 0.2, { g: 0.6, p: 0.4 });
  const rib = svg('path', { d: `M${RX + 420},${RY + 275} L${RX + 460},${RY + 275}`, fill: 'none', stroke: C.ink, 'stroke-width': 26 }, ov);
  draw(rib, tPty - 0.1, 0.2, { ease: SE(0.2) });
  const ptyTag = tag(world, tr('server 造的', 'MADE BY THE SERVER'), RX + 460, RY + 384, zt({ size: 24 }));
  swipe(ptyTag, tPty + 0.1, 'l', 0.33);
  // pane 的屏：程序的输出写在伪终端上，留在机架里
  const pane = crt(world, RX + 60, RY + 440, 760, 230, { bare: true, pad: 0, lit: false, name: 'pane screen' });
  const paL = term(pane, '', 24, 10, { vt: true, size: 56 });
  appear(pane.el, tPty - 0.2); pane.on(tPty + 0.3); sfx('blip', tPty + 0.32, { g: 0.55, p: 0.3 });
  let lastN = -1;
  F((t) => { const n = cnt(t); if (n === lastN) return; lastN = n; clL.innerHTML = linesAt(n, 5); paL.innerHTML = linesAt(n, 3); });
  countTicks(s.start + 0.3, tM10 - 0.3, { g: 0.32, p: 0.4 });
  // client 与 socket
  const cab = cableRig(ov, { x: 566, y: 520 }, { x: RX - 24, y: RY + 720 }, { sag: 70, pull: { x: -230, y: 30 } });
  const warn = led(world, RX - 30, RY + 556, 26, 'off');
  const cliTag = tag(world, 'CLIENT', 90, 170, { size: 30 });
  swipe(cliTag, tCli - 0.05, 'l', 0.33); sfx('pop', tCli - 0.05, { g: 0.7, p: -0.4 });
  const cliSub = tag(world, tr('显示 · 按键', 'PICTURE · KEYS'), 240, 170, zt({ size: 30, dark: true }));
  swipe(cliSub, tKeys, 'l', 0.33); sfx('tick', tKeys, { g: 0.5, p: -0.4 });
  const sockTag = tag(world, '/tmp/tmux-1001/ftlab', 560, 716, { size: 24 });
  const sockSub = txt(world, 'silk steel', tr('本地 socket · mode 660', 'local socket · mode 660'), 562, 762);
  swipe(sockTag, tSock - 0.1, 'l', 0.33); swipe(sockSub, tSock + 0.1, 'l', 0.33); sfx('pop', tSock - 0.1, { g: 0.6 });
  const procA = tag(world, tr('进程 ①', 'PROCESS 1'), 400, 170, zt({ size: 30 }));
  const procB = tag(world, tr('进程 ②', 'PROCESS 2'), RX + 660, RY + 90, zt({ size: 24 }));
  procA.style.left = (ZH ? 430 : 520) + 'px';
  swipe(procA, tM7 + 0.1, 'l', 0.3); swipe(procB, tM7 + 0.3, 'l', 0.3); sfx('tick', tM7 + 0.1, { g: 0.5, p: -0.4 }); sfx('tick', tM7 + 0.3, { g: 0.5, p: 0.4 });
  cab.pulse(tSock, tBreak - 0.05, 1).pulse(tSock + 0.4, tBreak - 0.05, -1);
  // 断开：只有这条线断了
  cab.move(tBreak, 1, 0.34); sfx('thud', tBreak, { g: 0.8, p: -0.1 }); ledBlink(warn, tBreak + 0.04, 'r', 1);
  cl.off(tBreak + 0.12); sfx('error', tBreak + 0.18, { g: 0.3, p: -0.4 });
  const still = tag(world, tr('server 照常运行', 'SERVER KEEPS RUNNING'), RX + 60, RY + 690, zt({ size: 26 }));
  swipe(still, tBreak + 0.5, 'l', 0.33); sfx('pop', tBreak + 0.5, { g: 0.55, p: 0.4 });

  // ── 站 B：机架里面的三层 ──
  gauge(s.start + 0.05, 1, 1, 1);
  const SB = 2300;
  const hdr = tag(world, 'SERVER  PID 506', SB + 80, 150, { size: 30, dark: true });
  swipe(hdr, tM10 - 0.05, 'l', 0.33);
  const slots = [[SB + 80, 300, 440, 270, 'SESSION'], [SB + 600, 260, 380, 340, 'WINDOW'], [SB + 1040, 220, 720, 440, 'PANE']].map(([x, y, w, hh, lb], i) => {
    const g = h('div', 'abs', world); px(g, x, y, w, hh); css(g, { border: '4px dashed ' + C.steel }); g.dataset.name = 'slot ' + lb;
    const l = txt(world, 'lab steel', lb, x, y - 44); l.style.fontSize = '30px';
    const tt = tThree + i * 0.16;
    appear(g, tt); appear(l, tt); sfx('tick', tt, { g: 0.55 - i * 0.08, p: -0.3 + i * 0.3 });
    return { g, l, x, y, w, h: hh };
  });
  // session：磁带仓滑进第一格
  const cart = cartridge(world, SB + 80, 300, 440, 270, { label: 'SESSION  demo' });
  sslide(cart.el, tSes - 0.15, { y: -120, d: 0.42 }); sfx('thud', tSes + 0.25, { g: 0.75, p: -0.3 });
  const sesD = tag(world, tr('一组终端的集合', 'A GROUP OF TERMINALS'), SB + 80, 600, zt({ size: 28 }));
  swipe(sesD, tSes + 0.4, 'l');
  // window：频道旋钮，0:bash → 1:edit
  const kn = knob(world, SB + 790, 450, ['0:bash', '1:edit'], { r: 86, step: 80 });
  appear(kn.svg, tWin - 0.1); kn.cards.forEach((c, i) => sslide(c, tWin - 0.05 + i * 0.12, { y: -30 }));
  sfx('pop', tWin - 0.1, { g: 0.7 });
  const winD = tag(world, tr('每个占满一屏', 'EACH FILLS THE SCREEN'), SB + 600, 640, zt({ size: 28 }));
  swipe(winD, tFull, 'l');
  // pane：CRT 先整屏显示 window 0，旋钮一转换台，再被挡板切成两块
  const big = crt(world, SB + 1040, 220, 720, 440, { bezel: 'char', pad: 20, lit: false, name: 'window CRT' });
  const w0 = term(big, 'bash-5.2$ <span class="dim">_</span>', 22, 16, { size: 34 });
  const w0n = term(big, '<span class="dim">window 0</span>', 22, 340, { size: 28 });
  const w1 = h('div', 'abs', big.inner); px(w1, 0, 0, big.W, big.H); css(w1, { background: C.black });
  const half = (big.W - 16) / 2;
  const pl = txt(w1, 'mono green', 'bash-5.2$ echo PANE-A; tty<br>PANE-A<br>/dev/pts/3', 18, 14); css(pl, { fontSize: '22px', lineHeight: '1.4' });
  const pr = txt(w1, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', half + 34, 14); pr.style.fontSize = '22px';
  const dimL = txt(w1, 'vt amber', '40×24  /dev/pts/3', 18, big.H - 58); dimL.style.fontSize = '44px';
  const dimR = txt(w1, 'vt amber', '39×24  /dev/pts/4', half + 34, big.H - 58); dimR.style.fontSize = '44px';
  const shut = blk(w1, '#3A3C38', half, 0, 16, big.H); css(shut, { borderLeft: '4px solid ' + C.ink, borderRight: '4px solid ' + C.ink }); shut.dataset.name = 'shutter';
  appear(big.el, tWin - 0.3); big.on(tWin - 0.2); sfx('blip', tWin - 0.15, { g: 0.5, p: 0.4 });
  const tSw = tFull + 0.3;
  kn.to(tSw, 1, { p: 0.1 }); big.noise(tSw, 0.5); sfx('blip', tSw + 0.05, { g: 0.4, p: 0.4 });
  appear(w1, tSw + 0.5); vanish(w0, tSw + 0.5); vanish(w0n, tSw + 0.5);
  appear(pl, tSw + 0.5);
  fromTo(shut, tPane - 0.1, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.34, ease: SE(0.34) });
  sfx('thud', tPane + 0.24, { g: 0.75, p: 0.5 });
  appear(pr, tPane + 0.3); appear(dimL, tOwn - 0.1); appear(dimR, tOwn + 0.05); sfx('tick', tOwn - 0.1, { g: 0.5, p: 0.5 }); sfx('tick', tOwn + 0.05, { g: 0.45, p: 0.5 });
  const paneD = tag(world, tr('每块：独立的伪终端', 'EACH: ITS OWN PSEUDO TERMINAL'), SB + 1040, 700, zt({ size: 28 }));
  swipe(paneD, tOwn, 'l'); sfx('chime', tOwn + 0.5, { g: 0.45, p: 0.4 });
  gauge(tSes, 1, 1, 1); gauge(tSw, 1, 2, 1); gauge(tPane + 0.3, 1, 2, 2);

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { z: 1.03 }, Math.max(0.5, tM2 - s.start - 0.4), { ease: 'none', sfx: false }],
    [tM2 + 0.0, { x: 1380, y: 380, z: 1.22 }, 1.0, { sfx: false }],
    [Math.max(tM3 - 0.3, tM2 + 1.15), { x: 1300, y: 420, z: 1.38 }, 0.9, { sfx: false }],
    [Math.max(tM4 - 0.3, tM3 + 0.8), { x: 1500, y: 420, z: 1.38 }, 0.9, { sfx: false }],
    [Math.max(tM5 - 0.3, tM4 + 0.8), { x: 520, y: 440, z: 1.3 }, 1.0, { sfx: false }],
    [Math.max(tM7 - 0.2, tM5 + 1.1), { x: 960, y: 484, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.04 }, Math.max(0.5, tM10 - tM7 - 1.4), { ease: 'none', sfx: false }],
    [tM10 - 0.35, { x: SB + 920, y: 470, z: 1 }, 1.0, { sfx: false }],
    [Math.max(tSes - 0.35, tM10 + 0.8), { x: SB + 520, y: 460, z: 1.25 }, 0.9, { sfx: false }],
    [Math.max(tWin - 0.5, tSes + 0.8), { x: SB + 900, y: 460, z: 1.08 }, 0.9, { sfx: false }],
    [Math.max(tM12 - 0.3, tM11 + 0.8), { x: SB + 1080, y: 460, z: 1.1 }, 0.9, { sfx: false }],
    [null, { z: 1.13 }, Math.max(0.5, s.end - tM12 - 1.0), { ease: 'none', sfx: false }],
  ]);
  sfx('drive', tM10 - 0.3, { g: 0.5 });
});
