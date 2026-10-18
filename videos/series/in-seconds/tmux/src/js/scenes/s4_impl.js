// 实现：两条路，分两站走。
// 站 1（按键）：键从终端顺着电缆进机架，先进键表。Ctrl-b 之后的 c 逐行查到 new-window，机架里亮起一个新 window；
//   查不到的 l 扫过每一行都落空，经 window_pane_key() 原样写进当前 pane 的伪终端。
// 站 2（输出）：程序的输出不直接去屏幕（虚线被划掉），先逐格写进 server 里这块 pane 自己的屏幕，再按每个 client 的终端各画一遍；
//   一台终端拔掉，屏幕还在 server 里，插回来就从这块屏幕原样画回去。
scene('impl', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '4200px' });
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh', zt = (o = {}) => ({ zh: ZH, ...o });
  const tI1 = T('i1'), tSrv = T('i1', 'server'), tTab = T('i1', { zh: '键表', en: 'key table' });
  const tI2 = T('i2'), tC = T('i2', { zh: '的 c', en: 'c is' }), tNew = T('i2', { zh: '新开窗口', en: 'new window' });
  const tI3 = T('i3'), tMiss = T('i3', { zh: '查不到', en: 'not in' }), tPty = T('i3', { zh: '伪终端', en: 'pseudo' });
  const tI4 = T('i4'), tNot = T('i4', { zh: '不直接', en: 'does not' });
  const tI5 = T('i5'), tRec = T('i5', { zh: '记进', en: 'records' }), tOwn = T('i5', { zh: '自己的屏幕', en: 'own screen' });
  const tI6 = T('i6'), tEach = T('i6', { zh: '每个', en: 'each' });
  const tI7 = T('i7'), tBack = T('i7', { zh: '原样恢复', en: 'exactly' });
  const ov = svgLayer(world, 4200, 968); ov.style.zIndex = 3;
  const wire = (d, col = C.ink, w = 12, o = {}) => svg('path', { d, fill: 'none', stroke: col, 'stroke-width': w, ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, ov);
  const token = (lbl, w = 84) => { const k = h('div', 'key', world, lbl); px(k, 0, 0, w, 84); css(k, { fontSize: lbl.length > 2 ? '30px' : '40px', borderBottomWidth: '10px', zIndex: 5 }); k.dataset.name = 'key token ' + lbl; return k; };
  // 沿折线匀速走：t0 出发，d 秒走完，t1 消失
  const travel = (el, pts, t0, d, t1) => {
    const w = parseFloat(el.style.width) || 84;
    const segs = []; let L0 = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([L0, l, pts[i - 1], pts[i]]); L0 += l; }
    F((t) => {
      const vis = t >= t0 && t < t1;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      const u = clamp((q12(t) - t0) / d) * L0;
      let p = pts[pts.length - 1];
      for (const [a, l, P, Q2] of segs) if (u >= a && u <= a + l) { const k = (u - a) / l; p = [lerp(P[0], Q2[0], k), lerp(P[1], Q2[1], k)]; break; }
      el.style.left = (p[0] - w / 2).toFixed(0) + 'px'; el.style.top = (p[1] - 42).toFixed(0) + 'px';
    });
  };

  // ════ 站 1：按键 ════
  const ca = crt(world, 80, 300, 420, 300, { bezel: 'cream', screws: 10, name: 'client' });
  const caL = tag(world, 'CLIENT', 80, 248, { size: 28 });
  term(ca, '<span class="dim">$</span> _', 20, 14, { size: 30 });
  appear(ca.el, s.start); appear(caL, s.start);
  const rk = panel(world, 'olive', 640, 130, 1220, 800, { screws: 14, name: 'server inside' });
  const rkl = tag(world, 'SERVER', 664, 150, { size: 28, dark: true });
  appear(rk, s.start); appear(rkl, s.start);
  wire('M500,450 L640,450', C.ink, 16);
  // 键表
  const kt = panel(world, 'black', 690, 220, 650, 420, { name: 'key table' });
  const ktT = txt(kt, 'lab green', tr('键表 KEY TABLE', 'KEY TABLE'), 24, 18); ktT.style.fontSize = '30px'; if (ZH) ktT.style.fontFamily = '"Sans SC", "Mono"';
  const preLed = led(kt, 560, 20, 30, 'off'); const preL = txt(kt, 'lab gdim', 'C-b', 470, 20); preL.style.fontSize = '26px';
  const ROWS = [['C-b c', 'new-window'], ['C-b %', 'split-window'], ['C-b "', 'split-window'], ['C-b d', 'detach-client']];
  const rows = ROWS.map(([k, v], i) => {
    const r = h('div', 'abs', kt); px(r, 14, 84 + i * 76, 616, 66);
    const kk = txt(r, 'mono green', `<span class="amber">${k}</span>  → ${v}`, 12, 12); kk.style.fontSize = '32px';
    const lp = led(r, 560, 18, 28, 'off');
    return { r, lp };
  });
  swipe(kt, tTab - 0.25, 't', 0.42); sfx('pop', tTab - 0.25, { g: 0.6 });
  // 新 window（命中后亮起）
  const nw = crt(world, 1390, 220, 430, 230, { bare: true, pad: 0, lit: false, name: 'new window' });
  term(nw, '<span class="dim">window 1</span><br>bash-5.2$ _', 20, 16, { size: 30 });
  const nwL = tag(world, 'new-window', 1390, 172, { size: 26 });
  // pane 的伪终端（查不到时去这里）
  const pm = panel(world, 'black', 1390, 520, 430, 250, { name: 'pane pty' });
  const pmT = txt(pm, 'lab green', tr('pane 的伪终端', 'PANE PTY'), 22, 16); pmT.style.fontSize = '28px'; if (ZH) pmT.style.fontFamily = '"Sans SC", "Mono"';
  const pmv = txt(pm, 'vt green', '/dev/pts/3', 22, 66); pmv.style.fontSize = '76px';
  const pmIn = txt(pm, 'mono green', '', 22, 160); pmIn.style.fontSize = '34px';
  const pmLed = led(pm, 370, 18, 28, 'off');
  appear(pm, tI2 + 0.2);
  const fn = tag(world, 'window_pane_key()', 1390, 790, { size: 26 });
  // 路线：键表 → 新 window（命中）；键表下方 → pane（落空）
  const hitW = wire('M1340,316 L1390,316', C.green, 8);
  const missW = wire('M1220,640 L1220,700 L1360,700 L1360,645 L1390,645', C.amber, 8);
  draw(hitW, tNew - 0.3, 0.2, { ease: SE(0.2) });
  draw(missW, tMiss + 0.5, 0.33, { ease: SE(0.33) });

  // i1：Ctrl-b 从终端进 server，进键表
  const kPre = token('C-b', 110);
  travel(kPre, [[290, 450], [570, 450], [660, 450], [760, 450], [760, 300]], tI1 + 0.05, 0.9, tTab + 0.5);
  sfx('key', tI1 + 0.05, { p: -0.5 }); sfx('key', tI1 + 0.17, { p: -0.5 }); ca.noise(tI1 + 0.02, 0.17);
  ledAt(preLed, tTab + 0.4, 'a'); sfx('blip', tTab + 0.4, { g: 0.5 });
  const lab1 = tag(world, tr('先送到 server', 'TO THE SERVER FIRST'), 80, 640, zt({ size: 30, dark: true }));
  swipe(lab1, tSrv - 0.1, 'l', 0.33); sfx('pop', tSrv - 0.1, { g: 0.55, p: -0.4 });
  // i2：c 进来，逐行查，第一行命中 → 新 window
  const kC = token('c');
  const tCin = tI2 + 0.05;
  travel(kC, [[290, 450], [570, 450], [660, 450], [760, 450], [760, 300]], tCin, 0.85, tNew + 0.2);
  sfx('key', tCin, { p: -0.4 });
  const scanHit = tCin + 0.9;
  F((t) => { rows[0].r.style.background = t >= scanHit && t < tMiss - 0.1 ? '#1F3A26' : 'transparent'; });
  ledAt(rows[0].lp, scanHit, 'g'); ledAt(rows[0].lp, tMiss - 0.1, 'off'); ledAt(preLed, scanHit + 0.1, 'off');
  sfx('chime', scanHit, { g: 0.45 });
  appear(nw.el, tNew - 0.2); nw.on(tNew); appear(nwL, tNew - 0.1); sfx('blip', tNew + 0.05, { g: 0.55, p: 0.4 });
  gauge(s.start + 0.05, 1, 1, 1); gauge(tNew, 1, 2, 1);
  const lab2 = tag(world, tr('查到 → 执行命令', 'FOUND → RUN THE COMMAND'), 690, 660, zt({ size: 28, dark: true }));
  swipe(lab2, scanHit + 0.1, 'l', 0.33); hide(lab2, tMiss - 0.2, { d: 0.17, ease: SE(0.17) });
  hide(lab1, tI2, { d: 0.17, ease: SE(0.17) });
  // i3：l 进来，每行都落空，原样写进 pane 的伪终端
  const kL = token('l');
  const tLin = tI3 + 0.02;
  travel(kL, [[290, 450], [570, 450], [660, 450], [760, 450], [760, 300]], tLin, 0.75, tLin + 0.75 + 0.6);
  sfx('key', tLin, { p: -0.4 });
  const tScan = tLin + 0.8;
  F((t) => { const f = Math.floor((t - tScan) * FPS12); rows.forEach((r, i) => { r.r.style.outline = f >= i * 2 && f < i * 2 + 2 ? '3px solid #8C8F86' : 'none'; }); });
  for (let i = 0; i < 4; i++) sfx('tick', tScan + i * 2 / FPS12, { g: 0.35, p: 0.2 });
  const kL2 = token('l');
  const tOut = Math.max(tScan + 0.75, tMiss + 0.45);
  travel(kL2, [[1220, 640], [1220, 700], [1360, 700], [1360, 645], [1460, 645]], tOut, 0.7, tOut + 0.85);
  ledAt(pmLed, tOut + 0.75, 'a'); sfx('blip', tOut + 0.75, { g: 0.6, p: 0.5 });
  swapAt(pmIn, '', '$ l<span class="gdim">_</span>', tOut + 0.8);
  const lab3 = tag(world, tr('查不到 → 原样写进 pane', 'NOT FOUND → INTO THE PANE'), 690, 660, zt({ size: 28, dark: true }));
  swipe(lab3, tMiss + 0.2, 'l', 0.33); sfx('error', tMiss + 0.2, { g: 0.22 });
  swipe(fn, tPty - 0.1, 'l', 0.33); sfx('pop', tPty - 0.1, { g: 0.5, p: 0.4 });

  // ════ 站 2：输出 ════
  const X = 2200;
  const cl = [0, 1].map((i) => {
    const c = crt(world, X + 80, 170 + i * 400, 380, 290, { bezel: 'cream', screws: 10, name: 'client ' + 'AB'[i] });
    c.L = tag(world, 'CLIENT ' + 'AB'[i], X + 80, 120 + i * 400, { size: 28 });
    c.pic = term(c, '', 18, 12, { size: 28 });
    c.wait = term(c, '<span class="dim">$</span> _', 18, 12, { size: 28 });
    appear(c.el, tI4 - 0.6); appear(c.L, tI4 - 0.6);
    return c;
  });
  const rk2 = panel(world, 'olive', X + 640, 100, 1240, 840, { screws: 14, name: 'server inside 2' });
  const rk2l = tag(world, 'SERVER', X + 664, 120, { size: 28, dark: true });
  appear(rk2, tI4 - 0.6); appear(rk2l, tI4 - 0.6);
  // 程序（就是开头那个计数）
  const pg = panel(world, 'cream', X + 1420, 170, 410, 170, { screws: 10, name: 'program' });
  const pgT = txt(pg, 'lab ink', tr('程序', 'PROGRAM'), 22, 16); pgT.style.fontSize = '28px'; if (ZH) pgT.style.fontFamily = '"Sans SC", "Mono"';
  const pgN = txt(pg, 'vt ink', 'count', 22, 60); pgN.style.fontSize = '84px';
  appear(pg, tI4 - 0.6);
  F((t) => { const v = 'count ' + COUNT(t); if (pgN.textContent !== v) pgN.textContent = v; });
  // i4：直接去屏幕的路是虚线，被划掉
  const dir = wire(`M${X + 1420},255 L${X + 460},255`, C.cream, 6, { dash: '18 14' });
  appear(dir, tI4 + 0.1);
  const xm = txt(world, '', '×', X + 880, 180); css(xm, { fontFamily: '"Inter"', fontWeight: 800, fontSize: '130px', color: C.red, lineHeight: '1', background: C.paper, padding: '0 18px 8px', zIndex: 4 }); xm.dataset.name = 'blocked';
  const pkt = h('div', 'abs', world); px(pkt, 0, 0, 30, 30); css(pkt, { background: C.amber }); pkt.dataset.name = 'output packet';
  const tShoot = tI4 + 0.25, tBlock = Math.max(tNot + 0.1, tShoot + 0.6);
  F((t) => {
    const on = t >= tShoot && t < tBlock + 0.25;
    pkt.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    const k = clamp((q12(t) - tShoot) / (tBlock - tShoot));
    pkt.style.left = (lerp(X + 1400, X + 960, k) - 15).toFixed(0) + 'px'; pkt.style.top = '240px';
  });
  slam(xm, tBlock, { from: 1.6, d: 0.25, ease: SE(0.25) }); sfx('error', tBlock, { g: 0.5 }); sfx('thud', tBlock + 0.05, { g: 0.6 });
  const lab4 = tag(world, tr('不直接送到屏幕', 'NOT STRAIGHT TO THE SCREEN'), X + 700, 300, zt({ size: 28, dark: true }));
  swipe(lab4, tBlock + 0.15, 'l', 0.33);
  hide(lab4, tRec - 0.2, { d: 0.17, ease: SE(0.17) }); hide(xm, tI6, { d: 0.17, ease: SE(0.17) }); hide(dir, tI6, { d: 0.17, ease: SE(0.17) });
  // i5：server 先把输出逐格写进这块 pane 自己的屏幕
  const G = { x: X + 700, y: 440, cols: 16, rows: 4, cw: 40, ch: 70 };
  const grid = panel(world, 'black', G.x, G.y, G.cols * G.cw + 36, G.rows * G.ch + 30, { name: 'pane screen grid' });
  const gs = svg('svg', { width: G.cols * G.cw, height: G.rows * G.ch, viewBox: `0 0 ${G.cols * G.cw} ${G.rows * G.ch}` }, grid); css(gs, { position: 'absolute', left: '15px', top: '12px' });
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) svg('rect', { x: c * G.cw + 2, y: r * G.ch + 3, width: G.cw - 4, height: G.ch - 6, fill: '#151A14' }, gs);
  const gRows = [0, 1, 2, 3].map((r) => { const e = txt(grid, 'mono green', '', 15 + (G.cw - 21.6) / 2, 12 + r * G.ch + 10); css(e, { fontSize: '36px', letterSpacing: (G.cw - 21.6) + 'px', lineHeight: '50px' }); return e; });
  const gL = tag(world, tr('pane 的屏幕（在 server 里）', "THE PANE'S SCREEN (IN THE SERVER)"), G.x, G.y - 50, zt({ size: 28 }));
  const tW = tRec - 0.1;
  appear(grid, tW - 0.3); swipe(gL, tOwn - 0.15, 'l', 0.33); sfx('pop', tOwn - 0.15, { g: 0.55, p: 0.3 });
  const feed = wire(`M${X + 1625},340 L${X + 1625},${G.y + 160} L${G.x + G.cols * G.cw + 36},${G.y + 160}`, C.amber, 8);
  draw(feed, tW - 0.3, 0.3, { ease: SE(0.3) });
  // 写入事件：从 tW 起，每次计数加一写一行；每格 1/24 秒
  const PER = 1 / 24;
  const W0 = COUNT(tW), ev = [[W0, tW]];
  for (let n = W0 + 1; n < W0 + 30; n++) { const t = countAt(n); if (t > s.end) break; ev.push([n, Math.max(t, tW + 0.2)]); }
  const gridAt = (t) => {     // 这一刻 server 里的屏幕：最近的 4 行，最新一行可能只写了一半
    const out = [];
    for (const [n, t0] of ev) { if (t0 > t) break; const line = 'count ' + n; out.push(line.slice(0, clamp(Math.floor((q12(t) - t0) / PER), 0, line.length))); }
    return out.slice(-G.rows);
  };
  let lastG = null;
  F((t) => { const g = t >= tW ? gridAt(t) : []; const key = g.join('|'); if (key === lastG) return; lastG = key; gRows.forEach((e, i) => { e.textContent = g[i] || ''; }); });
  ev.forEach(([n, t0]) => sfx('tick', t0, { g: 0.3, p: 0.3 }));
  // 写入时的一小格包：从程序沿琥珀线落进屏幕
  const pk2 = h('div', 'abs', world); px(pk2, 0, 0, 26, 26); css(pk2, { background: C.amber }); pk2.dataset.name = 'write packet';
  const feedPts = [[X + 1625, 340], [X + 1625, G.y + 160], [G.x + G.cols * G.cw + 36, G.y + 160]];
  F((t) => {
    let e = null; for (const x of ev) if (x[1] - 0.35 <= t && t < x[1]) e = x;
    pk2.style.visibility = e ? 'visible' : 'hidden'; if (!e) return;
    const k = clamp((q12(t) - (e[1] - 0.35)) / 0.35), L1 = feedPts[1][1] - feedPts[0][1], L2 = feedPts[1][0] - feedPts[2][0], u = k * (L1 + L2);
    const p = u < L1 ? [feedPts[0][0], feedPts[0][1] + u] : [feedPts[1][0] - (u - L1), feedPts[1][1]];
    pk2.style.left = (p[0] - 13).toFixed(0) + 'px'; pk2.style.top = (p[1] - 13).toFixed(0) + 'px';
  });
  // i6：再按每个 client 的终端，从这块屏幕各画一遍
  const cabs = cl.map((c, i) => cableRig(ov, { x: X + 460, y: 380 + i * 400 }, { x: X + 616, y: 380 + i * 400 }, { sag: 30, pull: { x: -70, y: 70 }, tilt: 24, w: 14 }));
  const rw = [0, 1].map((i) => wire(`M${G.x},${G.y + 80 + i * 150} L${X + 680},${G.y + 80 + i * 150} L${X + 680},${380 + i * 400} L${X + 662},${380 + i * 400}`, C.amber, 6));
  const tR = Math.max(tEach - 0.25, tI6 + 0.1);
  rw.forEach((w, i) => draw(w, tR + i * 0.1, 0.3, { ease: SE(0.3) }));
  cabs.forEach((cb, i) => cb.pulse(tR + 0.3 + i * 0.1, tI7 + 0.1 + (i ? 0 : 4), -1));
  // 每个 client 画的是 server 里的屏幕（拔掉时那台黑屏）
  const tOff = tI7 + 0.2, tOn = Math.max(tBack - 0.45, tOff + 1.1);
  cl.forEach((c, i) => {
    const t0 = tR + 0.35 + i * 0.12;
    c.noise(t0 - 0.15, 0.17); sfx('blip', t0, { g: 0.5, p: -0.5 });
    vanish(c.wait, t0);
    let last = null;
    F((t) => { const v = t >= t0 ? gridAt(t).join('<br>') : ''; if (v !== last) { c.pic.innerHTML = v; last = v; } });
  });
  const lab6 = tag(world, tr('按每个 client 的终端重画', "REDRAWN FOR EACH CLIENT'S TERMINAL"), G.x, G.y + G.rows * G.ch + 50, zt({ size: 28, dark: true }));
  swipe(lab6, tR + 0.4, 'l', 0.33); sfx('pop', tR + 0.4, { g: 0.55 });
  hide(lab6, tOff, { d: 0.17, ease: SE(0.17) });
  // i7：B 拔掉，屏幕还在 server 里；插回去，从屏幕原样画回
  cabs[1].move(tOff, 1, 0.34); cl[1].off(tOff + 0.1); sfx('thud', tOff, { g: 0.7, p: -0.4 });
  cabs[1].move(tOn, 0, 0.3); cl[1].on(tOn + 0.3); sfx('thud', tOn + 0.2, { g: 0.6, p: -0.4 });
  cabs[1].pulse(tOn + 0.35, s.end, -1);
  const keep = blk(world, 'transparent', G.x - 8, G.y - 8, G.cols * G.cw + 52, G.rows * G.ch + 46); css(keep, { border: '5px solid ' + C.green }); keep.dataset.name = 'kept frame';
  F((t) => { keep.style.display = t >= tOff + 0.3 && t < tOn + 0.9 ? '' : 'none'; });
  const lab7 = tag(world, tr('屏幕还在 server 里', 'THE SCREEN STAYS IN THE SERVER'), G.x, G.y + G.rows * G.ch + 50, zt({ size: 28, dark: true }));
  swipe(lab7, tOff + 0.35, 'l', 0.33); sfx('pop', tOff + 0.35, { g: 0.55 });
  const lab8 = tag(world, tr('原样画回', 'DRAWN BACK AS IT WAS'), X + 80, 900, zt({ size: 28, dark: true }));
  swipe(lab8, tOn + 0.6, 'l', 0.33); sfx('chime', tOn + 0.6, { g: 0.5, p: -0.3 });

  // ── 镜头：站 1 先看全，再推近键表；站 2 平移过去，推近屏幕，再拉开看两台 client ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.05, { x: 920, y: 490, z: 1.06 }, 0.8, { sfx: false }],
    [null, { z: 1.08 }, Math.max(0.4, tI2 - s.start - 1.2), { ease: 'none', sfx: false }],
    [tI2 + 0.5, { x: 1250, y: 480, z: 1.2 }, 0.9, { sfx: false }],
    [null, { x: 1260, y: 500, z: 1.22 }, Math.max(0.4, tI4 - tI2 - 2.1), { ease: 'none', sfx: false }],
    [tI4 - 0.45, { x: X + 960, y: 470, z: 1 }, 1.0, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.4, tRec - tI4 - 1.1), { ease: 'none', sfx: false }],
    [tRec - 0.3, { x: X + 1180, y: 440, z: 1.3 }, 0.9, { sfx: false }],
    [tR - 0.35, { x: X + 960, y: 484, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.04 }, Math.max(0.4, s.end - tR - 0.5), { ease: 'none', sfx: false }],
  ]);
  sfx('drive', tI4 - 0.4, { g: 0.5 });
});
