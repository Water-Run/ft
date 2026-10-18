// 怎么用：大键帽。先按前缀 Ctrl-b，再按命令键：c 新建 window（旋钮咔哒换台）、% 与引号切 pane（挡板落下）、
// d 断开 client（插头拔出，终端回到外面的 shell），最后敲 tmux attach，插头插回，画面原样接上。
scene('use', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh';
  const tU1 = T('u1'), tPre = T('u1', 'Ctrl-b'), tCmd = T('u1', { zh: '命令键', en: 'command key' });
  const tU2 = T('u2'), tU3 = T('u3'), tPct = T('u3', { zh: '百分号', en: 'Percent' }), tQuo = T('u3', { zh: '引号', en: 'double quote' });
  const tU5 = T('u5'), tDet = T('u5', { zh: '断开', en: 'disconnects' });
  const tU6 = T('u6');

  // ── 键帽台 ──
  const deck = panel(world, 'char', 70, 520, 830, 380, { screws: 14, name: 'key deck' });
  const ctrl = keycap(world, 'Ctrl', 110, 640, 240, 170, { dark: true, size: 60 });
  const kb = keycap(world, 'b', 380, 640, 170, 170, { size: 84 });
  const arr = txt(world, 'vt cream', '→', 572, 650); arr.style.fontSize = '130px';
  const ghost = keycap(world, '?', 680, 640, 170, 170, { ghost: true, size: 84 });
  const preLed = led(world, 110, 566, 30, 'off');
  const preL = txt(world, 'silk', tr('前缀 PREFIX', 'PREFIX'), 156, 566); preL.style.fontSize = '26px';
  sslide(deck, s.start + 0.1, { y: 60 }); sslide(ctrl, s.start + 0.2, { y: 50 }); sslide(kb, s.start + 0.28, { y: 50 });
  appear(preLed, s.start + 0.3); appear(preL, s.start + 0.3);
  appear(arr, tCmd - 0.2); appear(ghost, tCmd - 0.1); sfx('pop', tCmd - 0.1, { g: 0.6, p: -0.3 });
  // 命令键：同一格里轮换（每个只在自己的区间里出现）
  const cmdKeys = [['c', tU2 - 0.05], ['%', tPct - 0.25], ['"', tQuo - 0.25], ['d', tU5 - 0.05]].map(([lb, t0]) => ({ k: keycap(world, lb, 680, 640, 170, 170, { size: 84 }), t0 }));
  cmdKeys.forEach((ck, i) => { ck.t1 = i < cmdKeys.length - 1 ? cmdKeys[i + 1].t0 : Infinity; });
  F((t) => {
    ghost.style.visibility = t >= tCmd - 0.1 && t < cmdKeys[0].t0 ? 'visible' : 'hidden';
    cmdKeys.forEach((ck) => { ck.k.style.visibility = t >= ck.t0 && t < ck.t1 ? 'visible' : 'hidden'; });
  });
  // 每次命令：前缀两下，灯亮，命令键按下，灯灭
  const prefixAt = (t) => { ctrl.press(t, { p: -0.5 }); kb.press(t + 0.17, { p: -0.4 }); ledAt(preLed, t + 0.2, 'a'); };
  prefixAt(tPre - 0.1);
  const cmdAt = (ck, t) => { ck.k.press(t, { p: -0.3 }); ledAt(preLed, t + 0.05, 'off'); };
  prefixAt(cmdKeys[0].t0 - 0.45); cmdAt(cmdKeys[0], cmdKeys[0].t0 + 0.12);
  prefixAt(cmdKeys[1].t0 - 0.45); cmdAt(cmdKeys[1], cmdKeys[1].t0 + 0.12);
  prefixAt(cmdKeys[2].t0 - 0.45); cmdAt(cmdKeys[2], cmdKeys[2].t0 + 0.12);
  prefixAt(cmdKeys[3].t0 - 0.45); cmdAt(cmdKeys[3], cmdKeys[3].t0 + 0.12);
  // 窗口旋钮
  const kn = knob(world, 420, 330, ['0', '1'], { r: 70, step: 70 });
  const knL = txt(world, 'lab steel', 'WINDOW', 100, 190); knL.style.fontSize = '30px';
  appear(kn.svg, s.start + 0.35); kn.cards.forEach((c) => appear(c, s.start + 0.4)); appear(knL, s.start + 0.35);

  // ── 终端 CRT 与机架插孔 ──
  const cr = crt(world, 940, 150, 660, 490, { bezel: 'cream', screws: 12, name: 'client CRT' });
  const rk = rack(world, 1700, 150, 170, 760);
  const pwr = led(world, 1730, 196, 28, 'g');
  const sl = txt(world, 'silk', 'SERVER', 1726, 240); sl.style.fontSize = '26px';
  const warn = led(world, 1730, 560, 26, 'off');
  const cab = cableRig(svgLayer(world), { x: 1600, y: 560 }, { x: 1676, y: 760 }, { sag: 70, pull: { x: -140, y: 40 }, tilt: 10 });
  sslide(cr.el, s.start + 0.1, { x: 80 }); sslide(rk.el, s.start + 0.18, { x: 80 });
  const W = cr.W, H = cr.H, SH = 42, PH = H - SH;
  const view = h('div', 'abs', cr.inner); px(view, 0, 0, W, H);           // tmux 的画面（接着时可见）
  const status = blk(view, C.green, 0, PH, W, SH);
  const stx = txt(status, 'mono ink', '[demo] 0:bash*', 14, 4); css(stx, { fontSize: '26px', fontWeight: 700 });
  const p0 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', 18, 14); p0.style.fontSize = '30px';
  // 切开：竖挡板（%）、右半的横挡板（"）
  const hx = (W - 14) / 2, hy = (PH - 14) / 2;
  const vbar = blk(view, '#3A3C38', hx, 0, 14, PH); css(vbar, { borderLeft: '3px solid ' + C.ink, borderRight: '3px solid ' + C.ink }); vbar.dataset.name = 'shutter %';
  const hbar = blk(view, '#3A3C38', hx + 14, hy, W - hx - 14, 14); css(hbar, { borderTop: '3px solid ' + C.ink, borderBottom: '3px solid ' + C.ink }); hbar.dataset.name = 'shutter "';
  const p1 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', hx + 30, 14); p1.style.fontSize = '26px';
  const p2 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', hx + 30, hy + 30); p2.style.fontSize = '26px';
  const shell = h('div', 'abs', cr.inner); px(shell, 0, 0, W, H); css(shell, { background: C.black }); // 外面的 shell（断开时）
  const sh0 = txt(shell, 'mono green', '$ ', 18, 14); sh0.style.fontSize = '36px';
  const cmd = txt(shell, 'mono green', '', 70, 14); cmd.style.fontSize = '36px';

  // c：新窗口，旋钮跳到 1，换台雪花
  const tC = cmdKeys[0].t0 + 0.12;
  kn.to(tC + 0.1, 1, { p: -0.3 }); cr.noise(tC + 0.12, 0.5); sfx('blip', tC + 0.15, { g: 0.45, p: 0.3 });
  keyed(stx).at(tC + 0.62, { html: '[demo] 0:bash 1:bash*' });
  gauge(s.start + 0.05, 1, 1, 1); gauge(tC + 0.62, 1, 2, 1);
  const tagC = tag(world, tr('新 window', 'NEW WINDOW'), 940, 92, { zh: ZH, size: 28 });
  swipe(tagC, tC + 0.5, 'l', 0.33);
  // %：竖挡板落下
  const tP = cmdKeys[1].t0 + 0.12;
  fromTo(vbar, tP + 0.05, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.34, ease: SE(0.34) }); sfx('thud', tP + 0.38, { g: 0.7, p: 0.3 });
  appear(p1, tP + 0.42); gauge(tP + 0.4, 1, 2, 2);
  // "：右半的横挡板推进
  const tQ = cmdKeys[2].t0 + 0.12;
  fromTo(hbar, tQ + 0.05, { scaleX: 0 }, { scaleX: 1, transformOrigin: '100% 50%', duration: 0.34, ease: SE(0.34) }); sfx('thud', tQ + 0.38, { g: 0.65, p: 0.4 });
  appear(p2, tQ + 0.42); gauge(tQ + 0.4, 1, 2, 3);
  const tagS = tag(world, tr('% 左右　" 上下', '%  LEFT|RIGHT    "  TOP/BOTTOM'), 1240, 92, { zh: ZH, size: 28 });
  swipe(tagS, tP + 0.4, 'l', 0.33); hide(tagC, tP + 0.3, { d: 0.17, ease: SE(0.17) });
  // d：插头拔出，终端回到外面的 shell
  const tD = Math.max(cmdKeys[3].t0 + 0.2, tDet - 0.1);
  cab.move(tD, 1, 0.34); sfx('thud', tD, { g: 0.8, p: 0.4 }); ledBlink(warn, tD + 0.04, 'r', 1);
  cr.noise(tD + 0.1, 0.33);
  const tagD = tag(world, 'detach', 1240, 92, { size: 30, dark: true });
  hide(tagS, tD - 0.05, { d: 0.17, ease: SE(0.17) }); swipe(tagD, tD + 0.2, 'l', 0.33); sfx('pop', tD + 0.2, { g: 0.6, p: 0.3 });
  // attach：敲命令，插头插回，画面原样
  const tTy = tU6 + 0.25;
  const tDone = typeText(cmd, 'tmux attach', tTy, 16, { cursor: true, cursorUntil: tTy + 2.2 });
  const tAtt = tDone + 0.2;
  cab.move(tAtt, 0, 0.3); sfx('thud', tAtt + 0.22, { g: 0.7, p: 0.4 }); cr.noise(tAtt + 0.3, 0.25);
  F((t) => { const det = t >= tD + 0.43 && t < tAtt + 0.55; shell.style.visibility = det ? 'visible' : 'hidden'; view.style.visibility = det ? 'hidden' : 'visible'; });
  const tagA = tag(world, tr('原样接上', 'RESTORED AS IT WAS'), 1240, 92, { zh: ZH, size: 28 });
  hide(tagD, tAtt + 0.3, { d: 0.17, ease: SE(0.17) }); swipe(tagA, tAtt + 0.6, 'l', 0.33); sfx('chime', tAtt + 0.6, { g: 0.5, p: 0.3 });

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { x: 470, y: 600, z: 1.3 }, 0.9, { sfx: false }],
    [null, { z: 1.33 }, Math.max(0.5, tU2 - s.start - 1.4), { ease: 'none', sfx: false }],
    [tU2 - 0.4, { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [Math.max(tU3 - 0.2, tU2 + 0.5), { x: 1180, y: 430, z: 1.12 }, 0.9, { sfx: false }],
    [Math.max(tU5 - 0.3, tU3 + 0.9), { x: 1100, y: 470, z: 1.04 }, 0.7, { sfx: false }],
    [Math.max(tU6 - 0.1, tU5 + 0.8), { x: 1290, y: 420, z: 1.22 }, 0.9, { sfx: false }],
    [null, { z: 1.25 }, Math.max(0.5, s.end - tU6 - 1.0), { ease: 'none', sfx: false }],
  ]);
});
