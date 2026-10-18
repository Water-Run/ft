// 实现：一个按键顺着电缆进机架，先过键表。命中（C-b 之后的 c）→ 执行 tmux 命令；没命中（普通的 l）→ 送进 pane 的伪终端。
// 输出先写进 server 里的一块屏幕（逐格写入），再分别画给每个 client：两台终端显示同一幅画面。
scene('impl', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh';
  const tI1 = T('i1'), tTab = T('i1', { zh: '键表', en: 'key table' });
  const tI2 = T('i2'), tHit = T('i2', { zh: '命中', en: 'match' }), tMiss = T('i2', { zh: '没命中', en: 'anything else' });
  const tI3 = T('i3'), tScr = T('i3', { zh: '屏幕', en: 'screen' }), tEach = T('i3', { zh: '每个', en: 'each' });

  // ── 两台 client ──
  const ca = crt(world, 80, 200, 440, 310, { bezel: 'cream', screws: 10, name: 'client A' });
  const cb = crt(world, 80, 590, 440, 300, { bezel: 'cream', screws: 10, name: 'client B' });
  const la = tag(world, 'CLIENT A', 80, 150, { size: 26 }), lb = tag(world, 'CLIENT B', 80, 540, { size: 26 });
  [ca, cb].forEach((c) => { c.lines = term(c, '<span class="dim">$</span> _', 20, 14, { size: 30 }); });
  appear(ca.el, s.start); appear(cb.el, s.start); appear(la, s.start); appear(lb, s.start);
  // ── 机架内部 ──
  const rk = panel(world, 'olive', 640, 120, 1220, 800, { screws: 14, name: 'server inside' });
  const rkl = tag(world, 'SERVER', 664, 138, { size: 26, dark: true });
  appear(rk, s.start); appear(rkl, s.start);
  const ov = svgLayer(world);
  const wire = (d, col = C.ink, w = 12) => svg('path', { d, fill: 'none', stroke: col, 'stroke-width': w }, ov);
  wire('M520,330 L640,330'); wire('M520,720 L640,720');
  // 键表
  const kt = panel(world, 'black', 690, 200, 600, 360, { name: 'key table' });
  txt(kt, 'lab green', 'KEY TABLE', 24, 18).style.fontSize = '28px';
  const rows = [['C-b c', 'new-window'], ['C-b %', 'split-window'], ['C-b d', 'detach-client']].map(([k, v], i) => {
    const r = h('div', 'abs', kt); px(r, 16, 80 + i * 86, 560, 70);
    const kk = txt(r, 'mono amber', k, 12, 12); kk.style.fontSize = '34px';
    const vv = txt(r, 'mono green', '→ ' + v, 150, 12); vv.style.fontSize = '34px';
    const lp = led(r, 520, 20, 28, 'off');
    return { r, lp };
  });
  swipe(kt, tTab - 0.2, 't', 0.42); sfx('pop', tTab - 0.2, { g: 0.6 });
  // pane 的伪终端
  const pm = panel(world, 'black', 1340, 200, 480, 200, { name: 'pane pty' });
  txt(pm, 'lab green', 'PANE', 24, 16).style.fontSize = '28px';
  const pmv = txt(pm, 'vt green', '/dev/pts/3', 24, 70); pmv.style.fontSize = '84px';
  const pmLed = led(pm, 420, 20, 28, 'off');
  appear(pm, s.start + 0.1);
  wire(`M1290,${200 + 80 + 2 * 86 + 35} L1340,${300}`, C.steel, 6);
  // server 里的屏幕：格子
  const grid = panel(world, 'black', 690, 620, 600, 270, { name: 'server screen grid' });
  const gl = tag(world, tr('server 里的屏幕', 'SCREEN IN THE SERVER'), 1310, 620, { zh: ZH, size: 26 });
  const COLS = 18, ROWS = 4, CW = 31, CH = 58;
  const lines = ['$ echo PANE-A', 'PANE-A', '/dev/pts/3'];
  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const e = h('div', 'abs mono', grid, ''); px(e, 18 + c * CW, 18 + r * CH, CW - 3, CH - 6);
    css(e, { background: '#151A14', color: C.green, fontSize: '30px', lineHeight: (CH - 6) + 'px', textAlign: 'center' });
    cells.push(e);
  }
  appear(grid, tI3 - 0.4); appear(gl, tI3 - 0.4);
  const order = []; lines.forEach((l, r) => [...l].forEach((ch, c) => order.push([r * COLS + c, ch])));
  const tW = tScr - 0.3, perCell = 1 / 24;
  F((t) => {
    const n = clamp(Math.floor((q12(t) - tW) / perCell), 0, order.length);
    order.forEach(([i, ch], k) => { const v = k < n ? ch : ''; if (cells[i].textContent !== v) cells[i].textContent = v; });
  });
  for (let k = 0; k < 4; k++) sfx('tick', tW + k * 0.25, { g: 0.4 - k * 0.05, p: 0.2 });
  const outW = wire('M1580,400 L1580,600 L1300,600 L1300,620', C.amber, 6);
  draw(outW, tW - 0.35, 0.3, { ease: SE(0.3) });

  // ── 按键 1：C-b c，命中 → 执行 ──
  const token = (lbl) => { const k = h('div', 'key', world, lbl); px(k, 0, 0, 84, 84); css(k, { fontSize: '40px', borderBottomWidth: '10px' }); k.dataset.name = 'key token ' + lbl; return k; };
  const travel = (el, pts, t0, d, t1) => {
    const segs = []; let L0 = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([L0, l, pts[i - 1], pts[i]]); L0 += l; }
    F((t) => {
      const vis = t >= t0 && t < t1;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      const u = clamp((q12(t) - t0) / d) * L0;
      let p = pts[pts.length - 1];
      for (const [a, l, P, Q2] of segs) if (u >= a && u <= a + l) { const k = (u - a) / l; p = [lerp(P[0], Q2[0], k), lerp(P[1], Q2[1], k)]; break; }
      el.style.left = (p[0] - 42).toFixed(0) + 'px'; el.style.top = (p[1] - 42).toFixed(0) + 'px';
    });
  };
  const k1 = token('c');
  const tK1 = tI1 + 0.1;
  travel(k1, [[300, 330], [580, 330], [660, 330], [660, 270]], tK1, 0.75, tHit + 0.45);
  sfx('key', tK1, { p: -0.5 }); sfx('key', tK1 + 0.12, { p: -0.5 });
  // 逐行扫描：第一行命中
  ledAt(rows[0].lp, tHit - 0.05, 'g');
  F((t) => { rows[0].r.style.background = t >= tHit - 0.05 && t < tMiss - 0.2 ? '#1F3A26' : 'transparent'; });
  sfx('chime', tHit, { g: 0.45 });
  const run = tag(world, tr('执行 tmux 命令', 'RUNS A TMUX COMMAND'), 690, 568, { zh: ZH, size: 26, dark: true });
  appear(run, tHit + 0.1); vanish(run, tMiss - 0.2);
  ledAt(rows[0].lp, tMiss - 0.2, 'off');
  // ── 按键 2：普通的 l，没命中 → 送进 pane ──
  const k2 = token('l');
  const tK2 = tMiss - 0.45;
  travel(k2, [[300, 330], [580, 330], [660, 330], [660, 290], [660, 500], [1310, 500], [1310, 300]], tK2, 1.3, tK2 + 1.6);
  sfx('key', tK2, { p: -0.5 });
  F((t) => { const f = Math.floor((t - tK2 - 0.35) * FPS12); rows.forEach((r, i) => { r.r.style.outline = f >= i * 2 && f < i * 2 + 2 ? '3px solid #8C8F86' : 'none'; }); });
  sfx('error', tK2 + 0.6, { g: 0.25 });
  ledAt(pmLed, tK2 + 1.35, 'a'); sfx('blip', tK2 + 1.35, { g: 0.6, p: 0.5 });
  const toPane = tag(world, tr('没命中 → 送进 pane', 'NO MATCH → TO THE PANE'), 1340, 420, { zh: ZH, size: 26 });
  swipe(toPane, tK2 + 1.2, 'l', 0.33);
  hide(toPane, tI3 - 0.3, { d: 0.17, ease: SE(0.17) });

  // ── i3：重画给每个 client ──
  const rA = wire('M690,700 L600,700 L600,400 L520,400', C.amber, 6), rB = wire('M690,800 L560,800 L520,800', C.amber, 6);
  const tR = Math.max(tEach - 0.2, tW + order.length * perCell + 0.1);
  draw(rA, tR, 0.33, { ease: SE(0.33) }); draw(rB, tR + 0.08, 0.33, { ease: SE(0.33) });
  [ca, cb].forEach((c, i) => {
    const pic = term(c, lines.join('<br>'), 20, 14, { size: 30 });
    appear(pic, tR + 0.4 + i * 0.08); vanish(c.lines, tR + 0.4 + i * 0.08);
    c.noise(tR + 0.25 + i * 0.08, 0.17);
    sfx('blip', tR + 0.4 + i * 0.1, { g: 0.5, p: -0.5 });
  });
  const same = tag(world, tr('同一幅画面', 'THE SAME PICTURE'), 290, 150, { zh: ZH, size: 26, dark: true });
  swipe(same, tR + 0.6, 'l', 0.33);

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { x: 860, y: 420, z: 1.16 }, 0.9, { sfx: false }],
    [Math.max(tMiss - 0.6, s.start + 1.2), { x: 1060, y: 420, z: 1.12 }, 0.9, { sfx: false }],
    [Math.max(tI3 - 0.2, tMiss + 0.5), { x: 960, y: 500, z: 1 }, 0.7, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.5, s.end - tI3 - 1.0), { ease: 'none', sfx: false }],
  ]);
});
