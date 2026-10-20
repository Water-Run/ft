// 怎么用：快捷键分两步。左边是键帽台：① 先按 Ctrl-b（前缀灯亮），② 再按一个键（空槽里换上 c / % / " / d）。
// 右边是同一台终端（client）与机架（server）：c 换台到新 window，% 左右切开，" 把右半上下切开，d 拔掉插头回到外面的 shell，
// 机架里的计数照走；敲 tmux attach，插头插回，同样的布局原样回来。左下角的「已学会」逐条记下学过的键。
scene('use', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh', zt = (o = {}) => ({ zh: ZH, ...o });
  const tU1 = T('u1'), tPre = T('u1', 'Ctrl-b'), tOne = T('u1', { zh: '再按', en: 'then' });
  const tU2 = T('u2'), tU3 = T('u3'), tU4 = T('u4'), tU5 = T('u5'), tU6 = T('u6');
  const tDet = T('u5', 'detach'), tGo = T('u5', { zh: '终端走', en: 'The terminal goes' });
  const tBack = T('u6', { zh: '一切原样', en: 'Everything' });
  // 每条命令：前缀按在句首的「Ctrl-b」，命令键按在「再按 / then」之后
  const CMD = [
    { cue: 'u2', lb: 'c', key: T('u2', { zh: '再按', en: 'then' }) + 0.32 },
    { cue: 'u3', lb: '%', key: T('u3', { zh: '再按', en: 'then' }) + 0.32 },
    { cue: 'u4', lb: '"', key: T('u4', { zh: '再按', en: 'then' }) + 0.32 },
    { cue: 'u5', lb: 'd', key: T('u5', { zh: '再按', en: 'then' }) + 0.3 },
  ].map((c) => ({ ...c, pre: T(c.cue) + 0.02 }));

  // ── 键帽台：① 前缀　② 一个键 ──
  const deck = panel(world, 'char', 60, 290, 760, 410, { screws: 14, name: 'key deck' });
  const s1 = tag(world, tr('① 先按 Ctrl-b', '① FIRST Ctrl-b'), 100, 330, zt({ size: 28 }));
  const s2 = tag(world, tr('② 再按一个键', '② THEN ONE KEY'), ZH ? 560 : 540, 330, zt({ size: ZH ? 28 : 25 }));
  const ctrl = keycap(world, 'Ctrl', 100, 410, 200, 170, { dark: true, size: 56 });
  const kb = keycap(world, 'b', 320, 410, 150, 170, { size: 84 });
  const arr = txt(world, 'vt cream', '→', 488, 420); arr.style.fontSize = '120px';
  const ghost = keycap(world, '?', 600, 410, 170, 170, { ghost: true, size: 84 });
  const preLed = led(world, 100, 632, 34, 'off');
  const preL = txt(world, 'silk', tr('前缀灯 PREFIX', 'PREFIX'), 150, 634); preL.style.fontSize = '28px';
  const waitL = txt(world, 'silk steel', tr('等第二个键…', 'waiting for the key…'), 480, 634); waitL.style.fontSize = '26px';
  sslide(deck, s.start + 0.1, { y: 60 }); sslide(ctrl, s.start + 0.2, { y: 50 }); sslide(kb, s.start + 0.26, { y: 50 });
  appear(preLed, s.start + 0.3); appear(preL, s.start + 0.3);
  swipe(s1, tPre - 0.25, 'l', 0.33); sfx('pop', tPre - 0.25, { g: 0.55, p: -0.4 });
  appear(arr, tOne - 0.15); swipe(s2, tOne - 0.1, 'l', 0.33); sfx('pop', tOne - 0.1, { g: 0.55, p: -0.2 });
  appear(ghost, tOne);
  // 槽里的命令键：每个只在自己那一句里出现；u1 里是闪烁的空槽
  const keys = CMD.map((c) => keycap(world, c.lb, 600, 410, 170, 170, { size: 84 }));
  CMD.forEach((c, i) => { c.t0 = c.pre + 0.25; c.t1 = i < CMD.length - 1 ? CMD[i + 1].pre + 0.2 : Tend('u5') + 0.1; });
  F((t) => {
    const g = t >= tOne && t < CMD[0].t0;
    ghost.style.visibility = g ? 'visible' : 'hidden';
    ghost.style.borderColor = g && Math.floor(q12(t - tOne) * 3) % 2 ? C.amber : '';
    ghost.style.color = g && Math.floor(q12(t - tOne) * 3) % 2 ? C.amber : '';
    keys.forEach((k, i) => { k.style.visibility = t >= CMD[i].t0 && t < CMD[i].t1 ? 'visible' : 'hidden'; });
    waitL.style.visibility = (t >= tOne && t < Tend('u1') - 0.1) ? 'visible' : 'hidden';
  });
  // 前缀：Ctrl 按下、b 按下、灯亮；命令键按下、灯灭
  const prefixAt = (t) => { ctrl.press(t, { p: -0.5 }); kb.press(t + 0.17, { p: -0.4 }); ledAt(preLed, t + 0.22, 'a'); };
  prefixAt(tPre - 0.05); ledAt(preLed, Tend('u1') - 0.1, 'off');
  CMD.forEach((c, i) => { prefixAt(c.pre); keys[i].press(c.key, { p: -0.2 }); ledAt(preLed, c.key + 0.06, 'off'); });

  // attach 不是前缀键：敲命令时键帽台收起，只留「已学会」
  [s1, s2, ctrl, kb, arr, preLed, preL, deck].forEach((e, i) => hide(e, tU6 + 0.05 + i * 0.03, { d: 0.25, y: 0, ease: SE(0.25) }));
  sfx('drive', tU6 + 0.05, { g: 0.4 });
  // ── 已学会：逐条记下 ──
  const lg = panel(world, 'black', 60, 726, 760, 214, { name: 'learned legend' });
  const lgT = txt(lg, 'lab gdim', tr('已学会', 'LEARNED'), 20, 12); lgT.style.fontSize = '24px'; if (ZH) lgT.style.fontFamily = '"Sans SC", "Mono"';
  appear(lg, tU2 - 0.4);
  fromTo(lg, tU6 + 0.35, { y: 0 }, { y: -300, duration: 0.42, ease: SE(0.42), immediateRender: false });   // 键帽台收起后，「已学会」升到正中
  // 每条一个小键帽：上面是键，下面是作用（一个元素）
  const chip = (i, key, label, t) => {
    const x = 16 + i * 148;
    const k = h('div', 'key', lg, `<span style="font-size:${key.length > 2 ? 28 : 44}px;line-height:1">${key}</span><span style="font:${ZH ? '700 24px &quot;Sans SC&quot;' : '700 24px &quot;Mono&quot;'};margin-top:8px">${label}</span>`);
    px(k, x, 52, 136, 134); css(k, { flexDirection: 'column', borderBottomWidth: '10px' }); k.dataset.name = 'learned ' + key;
    slam(k, t, { from: 1.4, d: 0.25, ease: SE(0.25) }); sfx('tick', t, { g: 0.55, p: -0.3 });
  };

  // ── 终端（client）与机架（server）──
  const cr = crt(world, 860, 160, 700, 500, { bezel: 'cream', screws: 12, name: 'client CRT' });
  const crL = tag(world, tr('终端 client', 'TERMINAL (CLIENT)'), 860, 680, zt({ size: 26 }));
  const rk = rack(world, 1610, 150, 250, 780);
  const pwr = led(world, 1636, 186, 28, 'g');
  const sl = txt(world, 'silk', 'SERVER', 1678, 188); sl.style.fontSize = '26px';
  const cv = panel(world, 'black', 1632, 250, 206, 130, { name: 'rack counter' });
  const cvK = txt(cv, 'lab gdim', 'count', 16, 10); cvK.style.fontSize = '24px';
  const cvN = txt(cv, 'vt green', '0', 16, 40); cvN.style.fontSize = '84px';
  F((t) => { const v = String(COUNT(t)); if (cvN.textContent !== v) cvN.textContent = v; });
  const kn = knob(world, 1735, 590, ['0', '1'], { r: 52, step: 80 });
  const knL = txt(world, 'silk', 'WINDOW', 1682, 656); knL.style.fontSize = '26px';
  const warn = led(world, 1650, 772, 26, 'off');
  const cab = cableRig(svgLayer(world), { x: 1556, y: 600 }, { x: 1586, y: 720 }, { sag: 60, pull: { x: -170, y: 30 }, tilt: 10 });
  sslide(cr.el, s.start + 0.1, { x: 80 }); sslide(rk.el, s.start + 0.18, { x: 80 }); appear(crL, s.start + 0.3);
  appear(kn.svg, s.start + 0.3); kn.cards.forEach((c) => appear(c, s.start + 0.3)); appear(knL, s.start + 0.3);
  countTicks(tU2 - 0.5, s.end, { g: 0.26, p: 0.5 });

  const W = cr.W, H = cr.H, SH = 44, PH = H - SH;
  const view = h('div', 'abs', cr.inner); px(view, 0, 0, W, H);           // tmux 的画面（接着时可见）
  const status = blk(view, C.green, 0, PH, W, SH);
  const stx = txt(status, 'mono ink', '[demo] 0:bash*', 14, 4); css(stx, { fontSize: '28px', fontWeight: 700 });
  const p0 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">count</span>', 18, 14); p0.style.fontSize = '30px';
  const p0b = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', 18, 14); p0b.style.fontSize = '30px';
  const hx = Math.round((W - 14) / 2), hy = Math.round((PH - 14) / 2);
  const vbar = blk(view, '#3A3C38', hx, 0, 14, PH); css(vbar, { borderLeft: '3px solid ' + C.ink, borderRight: '3px solid ' + C.ink }); vbar.dataset.name = 'shutter %';
  const hbar = blk(view, '#3A3C38', hx + 14, hy, W - hx - 14, 14); css(hbar, { borderTop: '3px solid ' + C.ink, borderBottom: '3px solid ' + C.ink }); hbar.dataset.name = 'shutter "';
  const p1 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', hx + 30, 14); p1.style.fontSize = '26px';
  const p2 = txt(view, 'mono green', 'bash-5.2$ <span class="gdim">_</span>', hx + 30, hy + 30); p2.style.fontSize = '26px';
  const shell = h('div', 'abs', cr.inner); px(shell, 0, 0, W, H); css(shell, { background: C.black }); // 外面的 shell（离开时）
  const sh0 = txt(shell, 'mono green', '$ ', 18, 14); sh0.style.fontSize = '36px';
  const cmd = txt(shell, 'mono green', '', 70, 14); cmd.style.fontSize = '36px';
  vanish(p0b, 0);

  // 头顶的结果标签：每条一块，换下一条时收走上一条
  const heads = [];
  const head = (text, t, o = {}) => {
    const e = tag(world, text, 860, 88, zt({ size: 34, dark: !!o.dark }));
    swipe(e, t, 'l', 0.33); sfx('pop', t, { g: 0.6, p: 0.3 });
    if (heads.length) hide(heads[heads.length - 1], t - 0.12, { d: 0.12, ease: SE(0.12) });
    heads.push(e); return e;
  };

  // c：新 window。旋钮跳到 1，换台雪花，状态栏多出 1:bash
  const tC = CMD[0].key;
  kn.to(tC + 0.1, 1, { p: -0.3 }); cr.noise(tC + 0.1, 0.42); sfx('blip', tC + 0.12, { g: 0.45, p: 0.3 });
  appear(p0b, tC + 0.52); vanish(p0, tC + 0.52);
  keyed(stx).at(tC + 0.52, { html: '[demo] 0:bash <span style="background:#151713;color:#74FF9A;padding:0 6px">1:bash*</span>' });
  gauge(s.start + 0.05, 1, 1, 1); gauge(tC + 0.52, 1, 2, 1);
  head(tr('c：新开一个 window', 'c: NEW WINDOW'), tC + 0.45);
  chip(0, 'c', tr('新窗口', 'NEW WIN'), tC + 0.6);
  // %：竖挡板落下，左右两块
  const tP = CMD[1].key;
  fromTo(vbar, tP + 0.05, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.34, ease: SE(0.34) }); sfx('thud', tP + 0.38, { g: 0.7, p: 0.3 });
  appear(p1, tP + 0.42); gauge(tP + 0.4, 1, 2, 2);
  head(tr('%：左右一分为二', '%: LEFT | RIGHT'), tP + 0.4);
  chip(1, '%', tr('左右切', 'L | R'), tP + 0.55);
  // "：右半的横挡板推进，上下两块
  const tQ = CMD[2].key;
  fromTo(hbar, tQ + 0.05, { scaleX: 0 }, { scaleX: 1, transformOrigin: '100% 50%', duration: 0.34, ease: SE(0.34) }); sfx('thud', tQ + 0.38, { g: 0.65, p: 0.4 });
  appear(p2, tQ + 0.42); gauge(tQ + 0.4, 1, 2, 3);
  head(tr('"：上下一分为二', '": TOP / BOTTOM'), tQ + 0.4);
  chip(2, '"', tr('上下切', 'TOP/BOT'), tQ + 0.55);
  // 切出来的每一块短暂标号，看清是哪一刀
  // 新切出来的那一块闪两下边框，看清是哪一刀
  const flashBox = (t, x, y, w, hh) => {
    const b = blk(view, 'transparent', x, y, w, hh); css(b, { border: '4px solid ' + C.amber }); b.dataset.name = 'new pane frame';
    F((tt) => { const k = Math.floor((q12(tt) - t) * FPS12); b.style.display = k >= 0 && k < 14 && k % 4 < 2 ? '' : 'none'; });
  };
  flashBox(tP + 0.42, hx + 14, 0, W - hx - 14, PH);
  flashBox(tQ + 0.42, hx + 14, hy + 14, W - hx - 14, PH - hy - 14);
  // d：detach。插头拔出，终端回到外面的 shell；机架里的计数照走
  const tD = Math.max(CMD[3].key + 0.15, tDet - 0.05);
  cab.move(tD, 1, 0.34); sfx('thud', tD, { g: 0.8, p: 0.4 }); ledBlink(warn, tD + 0.04, 'r', 1);
  cr.noise(tD + 0.1, 0.33);
  head('detach', tD + 0.15, { dark: true });
  chip(3, 'd', tr('离开', 'DETACH'), tD + 0.3);
  const goTag = tag(world, tr('终端走，程序留', 'TERMINAL GOES, PROGRAM STAYS'), 860, 760, zt({ size: 34, dark: true }));
  swipe(goTag, tGo, 'l', 0.33); sfx('pop', tGo, { g: 0.6, p: 0.2 });
  const runBox = blk(world, 'transparent', 1624, 242, 222, 146); css(runBox, { border: '5px solid ' + C.green }); runBox.dataset.name = 'still counting frame';
  const runTag = tag(world, tr('还在数', 'STILL COUNTING'), 1632, 394, zt({ size: 26 }));
  F((t) => { const on = t >= tGo + 0.2 && t < tAtt; runBox.style.display = on && Math.floor(q12(t - tGo) * 2) % 4 !== 3 ? '' : 'none'; });
  swipe(runTag, tGo + 0.25, 'r', 0.33);
  // attach：敲命令，插头插回，同样的布局原样回来
  const tTy = Math.max(tU6 + 0.2, Tend('u5') + 0.1);
  const tDone = typeText(cmd, 'tmux attach', tTy, 15, { cursor: true, cursorUntil: tTy + 1.6 });
  const tAtt = Math.min(tDone + 0.15, tBack - 0.35);
  cab.move(tAtt, 0, 0.3); sfx('thud', tAtt + 0.22, { g: 0.7, p: 0.4 }); cr.noise(tAtt + 0.3, 0.25);
  F((t) => { const det = t >= tD + 0.43 && t < tAtt + 0.55; shell.style.visibility = det ? 'visible' : 'hidden'; view.style.visibility = det ? 'hidden' : 'visible'; });
  hide(goTag, tAtt, { d: 0.17, ease: SE(0.17) }); hide(runTag, tAtt, { d: 0.17, ease: SE(0.17) });
  head(tr('一切原样', 'EVERYTHING AS IT WAS'), tAtt + 0.6);
  chip(4, 'attach', tr('接回', 'BACK'), tAtt + 0.75);
  sfx('chime', tAtt + 0.65, { g: 0.5, p: 0.3 });
  const okBox = blk(world, 'transparent', 874, 174, 672, 462); css(okBox, { border: '5px solid ' + C.green }); okBox.dataset.name = 'restored frame';
  F((t) => { const k = Math.floor((q12(t) - tAtt - 0.6) * FPS12); okBox.style.display = k >= 0 && k < 14 && k % 4 < 2 ? '' : 'none'; });

  // ── 镜头：先近看键帽台讲两步，再拉开看同一台终端；detach 时推近终端与机架，接回后拉开 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { x: 720, y: 495, z: 1.24 }, 0.9, { sfx: false }],
    [null, { z: 1.28 }, Math.max(0.5, tU2 - s.start - 1.6), { ease: 'none', sfx: false }],
    [tU2 - 0.4, { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.035 }, Math.max(0.5, tDet - tU2 - 0.9), { ease: 'none', sfx: false }],
    [tDet - 0.35, { x: 1200, y: 500, z: 1.1 }, 0.9, { sfx: false }],
    [null, { x: 1210, z: 1.125 }, Math.max(0.4, tAtt + 0.3 - tDet - 0.75), { ease: 'none', sfx: false }],
    [tAtt + 0.35, { x: 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.5, s.end - tAtt - 1.2), { ease: 'none', sfx: false }],
  ]);
});
