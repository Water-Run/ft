// 回答开头：程序住在 server 里。终端拔了又插，机架的绿灯一直亮着；敲 tmux kill-server，灯变红，所有 CRT 断电收成一点，
// 再问一次，回答是 no server running on /tmp/tmux-1001/ftlab（实验第 10 节的原样回显）。
scene('edge', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh';
  const tE1 = T('e1'), tAns = T('e1', 'server');
  const tE2 = T('e2'), tStay = T('e2', { zh: 'server 不走', en: 'while' });
  const tE3 = T('e3'), tE4 = T('e4'), tEnd = T('e4', { zh: '一起结束', en: 'ends' });

  // ── 机架 ──
  const RX = 1000, RY = 130;
  const rk = rack(world, RX, RY, 820, 790); appear(rk.el, s.start);
  const pwr = led(world, RX + 34, RY + 330, 44, 'g'); pwr.dataset.name = 'server power LED';
  const vfd = panel(world, 'black', RX + 100, RY + 314, 560, 84, { name: 'server VFD' });
  const vt = txt(vfd, 'vt green', 'SERVER  PID 506', 20, 4); vt.style.fontSize = '76px';
  const panes = [0, 1, 2].map((i) => {
    const c = crt(world, RX + 34 + i * 254, RY + 430, 240, 170, { bare: true, pad: 0, name: 'pane ' + i });
    c.t = term(c, '', 14, 10, { vt: true, size: 44 });
    return c;
  });
  const sesTag = tag(world, 'SESSION  demo', RX + 34, RY + 620, { size: 26 });
  appear(sesTag, s.start);
  const tKill = tE4 - 0.05;
  const cnt = (t) => 9 + Math.floor((Math.min(t, tKill) - s.start) / 1.2);
  let lastN = -1;
  F((t) => {
    const n = cnt(t); if (n === lastN) return; lastN = n;
    panes[0].t.innerHTML = 'count ' + n; panes[1].t.innerHTML = '$ vim'; panes[2].t.innerHTML = '$ make';
  });
  // ── 两台终端 ──
  const tm = [0, 1].map((i) => {
    const c = crt(world, 80, 170 + i * 400, 840, 330, { bezel: 'cream', screws: 10, name: 'terminal ' + (i + 1) });
    c.view = h('div', 'abs', c.inner); px(c.view, 0, 0, c.W, c.H);
    const st = blk(c.view, C.green, 0, c.H - 40, c.W, 40);
    txt(st, 'mono ink', '[demo] 0:bash*', 12, 3).style.cssText += 'font-size:26px;font-weight:700';
    c.cl = txt(c.view, 'vt green', '', 20, 14); c.cl.style.fontSize = '64px';
    appear(c.el, s.start);
    return c;
  });
  F((t) => { const n = 'count ' + cnt(t); tm.forEach((c) => { if (c.cl.textContent !== n) c.cl.textContent = n; }); });
  const ov = svgLayer(world);
  const cabs = tm.map((c, i) => cableRig(ov, { x: 920, y: 300 + i * 400 }, { x: RX - 24, y: RY + 200 + i * 400 }, { sag: 40, pull: { x: -40, y: 120 }, tilt: 30 }));

  // e1：答案铭牌
  const ans = h('div', 'abs zh-b', world, tr('程序住在 server 里', 'The program lives in the server')); px(ans, RX + 34, RY + 60);
  css(ans, { background: C.paper, color: C.ink, fontSize: ZH ? '80px' : '50px', padding: ZH ? '22px 34px' : '30px 30px', borderBottom: '8px solid #B0A88F', lineHeight: '1.1' });
  ans.dataset.name = 'answer plate';
  slam(ans, tAns - 0.1, { from: 1.3, d: 0.33, ease: SE(0.33) }); sfx('thud', tAns - 0.1, { g: 0.9, p: 0.4 }); sfx('chime', tAns + 0.25, { g: 0.5, p: 0.4 });
  // e2：终端拔了又插，绿灯一直亮
  const pulls = [[0, tE2 + 0.1], [1, tE2 + 0.55]], backs = [[0, Math.max(tStay, tE2 + 1.2)], [1, Math.max(tStay + 0.45, tE2 + 1.65)]];
  pulls.forEach(([i, t]) => { cabs[i].move(t, 1, 0.3); tm[i].off(t + 0.1); sfx('thud', t, { g: 0.6, p: -0.4 }); });
  backs.forEach(([i, t]) => { cabs[i].move(t, 0, 0.3); tm[i].on(t + 0.28); sfx('thud', t + 0.2, { g: 0.5, p: -0.4 }); sfx('blip', t + 0.3, { g: 0.4, p: -0.4 }); });
  const stays = tag(world, tr('终端走了又来，灯一直绿', 'TERMINALS COME AND GO; THE LIGHT STAYS GREEN'), RX + 100, RY + 260, { zh: ZH, size: 26, dark: true });
  swipe(stays, tStay, 'l', 0.33); hide(stays, tE3, { d: 0.17, ease: SE(0.17) });
  // e3：tmux kill-server
  const sh = h('div', 'abs', tm[0].inner); px(sh, 0, 0, tm[0].W, tm[0].H); css(sh, { background: C.black });
  const l1 = txt(sh, 'mono green', '', 20, 16); l1.style.fontSize = '34px';
  const tTy = tE3 + 0.15;
  F((t) => { const on = t >= tTy - 0.1; sh.style.visibility = on ? 'visible' : 'hidden'; tm[0].view.style.visibility = on ? 'hidden' : 'visible'; });
  typeText(l1, '$ tmux kill-server', tTy, 16, { cursorUntil: tKill - 0.1 });
  // e4：server 一停，灯变红，CRT 全部收成一点；客户端被断开
  ledAt(pwr, tKill, 'r'); sfx('error', tKill, { g: 0.8 }); sfx('thud', tKill + 0.05, { g: 0.9 });
  F((t) => { const f = Math.floor((t - tKill) * FPS12); vt.style.visibility = f < 0 || f === 1 ? 'visible' : 'hidden'; });
  panes.forEach((c, i) => c.off(tKill + 0.1 + i * 0.08));
  cabs.forEach((cb, i) => cb.move(tKill + 0.2 + i * 0.1, 1, 0.3));
  tm[1].off(tKill + 0.35);
  const l2 = txt(sh, 'mono green', '$ tmux list-sessions', 20, 66); l2.style.fontSize = '34px';
  const l3 = txt(sh, 'mono amber', 'no server running on /tmp/tmux-1001/ftlab', 20, 116); l3.style.fontSize = '30px';
  appear(l2, tKill + 0.7); appear(l3, tKill + 1.0); sfx('blip', tKill + 0.7, { g: 0.5, p: -0.4 }); sfx('beep', tKill + 1.0, { g: 0.6, p: -0.4 });
  const endTag = tag(world, tr('所有会话和程序一起结束', 'EVERY SESSION AND PROGRAM ENDS'), RX + 34, RY + 690, { zh: ZH, size: 28, dark: true });
  swipe(endTag, Math.max(tEnd - 0.2, tKill + 0.5), 'l', 0.33); sfx('pop', Math.max(tEnd - 0.2, tKill + 0.5), { g: 0.6, p: 0.4 });
  const l4 = txt(sh, 'mono green', '$ <span class="cur"></span>', 20, 166); l4.style.fontSize = '34px';
  const tL4 = Math.max(T('eT') + 0.3, tKill + 1.5); appear(l4, tL4); sfx('blip', tL4, { g: 0.45, p: -0.4 }); sfx('tick', tL4 + 1.0, { g: 0.4, p: -0.4 });
  gauge(s.start + 0.05, 1, 1, 3); gauge(tKill + 0.15, 0, 0, 0);

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { x: 1400, y: 420, z: 1.25 }, 0.9, { sfx: false }],
    [Math.max(tE2 - 0.3, s.start + 1.2), { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [Math.max(tE3 - 0.3, tE2 + 0.8), { x: 640, y: 380, z: 1.22 }, 0.9, { sfx: false }],
    [Math.max(tE4 - 0.4, tE3 + 1.0), { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.5, s.end - tE4 - 1.0), { ease: 'none', sfx: false }],
  ]);
});
