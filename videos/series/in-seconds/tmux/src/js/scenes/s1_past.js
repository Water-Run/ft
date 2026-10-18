// 来历：一条打孔纸带从左往右走，镜头跟着打孔头。2007 → 当时在用的 screen（另一台机器，不画成父子）→ 不是要复制 →
// 一个窗口接到多个终端、其他窗口各自独立 → 2009 年进入 OpenBSD 的基本系统。
scene('past', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '6600px' });
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh';
  const tP1 = T('p1'), tY7 = T('p1', '2007');
  const tP2 = T('p2'), tScr = T('p2', 'screen'), tHeavy = T('p2', { zh: '重度用户', en: 'heavy user' });
  const tP3 = T('p3'), tCopy = T('p3', { zh: '复制', en: 'copy' });
  const tP4 = T('p4'), tSev = T('p4', { zh: '多个终端', en: 'several terminals' }), tRest = T('p4', { zh: '其他窗口', en: 'the rest' });
  const tP6 = T('p6'), tY9 = T('p6', '2009'), tBase = T('p6', 'OpenBSD');

  // ── 纸带：两排链孔、两排数据孔；打孔头跟着镜头走，右边还没打的孔被纸盖住 ──
  const TY = 640, TH = 240;
  const tape = blk(world, C.paper, -200, TY, 7600, TH); tape.dataset.name = 'paper tape';
  const ts = svgLayer(world, 7600, TH, -200, TY);
  for (let x = -190; x < 7400; x += 32) { svg('rect', { x, y: TY + 10, width: 12, height: 12, fill: C.ink }, ts); svg('rect', { x, y: TY + TH - 22, width: 12, height: 12, fill: C.ink }, ts); }
  const rnd = seeded(7);
  for (let x = -180; x < 7400; x += 22) for (let r = 0; r < 2; r++) if (rnd() < 0.55) svg('rect', { x, y: TY + 34 + r * 18, width: 10, height: 10, fill: C.ink }, ts);
  svg('rect', { x: -200, y: TY + TH - 6, width: 7600, height: 6, fill: '#B0A88F' }, ts);
  const cover = svg('rect', { x: 0, y: TY + 30, width: 8000, height: 34, fill: C.paper }, ts);
  const head = h('div', 'abs', world); px(head, 0, TY - 40, 64, 120); css(head, { background: C.charcoal || '#2B2D2A', borderBottom: '8px solid #151713' }); head.dataset.name = 'punch head';
  const headLed = led(head, 19, 14, 22, 'a');
  F(() => { const x = Math.round(cam.st.x + 240); cover.setAttribute('x', x); head.style.left = (x - 32) + 'px'; });
  // 年份打在纸带上
  const year = (x, y, t, label) => {
    const e = txt(world, 'vt ink', label, x, TY + 66); e.style.fontSize = '170px'; e.dataset.name = 'year ' + label;
    slam(e, t, { from: 1.25, d: 0.33, ease: SE(0.33) }); sfx('drive', t - 0.05, { g: 0.9 }); sfx('thud', t + 0.25, { g: 0.7 });
    return e;
  };

  // ── 站 1：2007 ──
  const y7 = year(560, 0, tY7, '2007');
  const box1 = crt(world, 520, 190, 440, 330, { bezel: 'cream', screws: 12, name: 'tmux box 2007' });
  term(box1, 'tmux', 34, 18, { vt: true, size: 120 });
  term(box1, '<span class="dim">detach / reattach<br>new session · list</span>', 34, 160, { size: 30 });
  sslide(box1.el, s.start + 0.12, { y: -40 }); box1.on(s.start + 0.2); sfx('blip', s.start + 0.3, { g: 0.5 });
  const d1 = tag(world, tr('2007-07-09　首次提交', '2007-07-09  FIRST COMMIT'), 1010, 230, { zh: ZH });
  const d2 = tag(world, tr('2007-11-20　0.1 发布', '2007-11-20  0.1 RELEASED'), 1010, 300, { zh: ZH });
  swipe(d1, tY7 + 0.2, 'l'); swipe(d2, tY7 + 0.35, 'l'); sfx('tick', tY7 + 0.2, { g: 0.5, p: 0.3 }); sfx('tick', tY7 + 0.35, { g: 0.45, p: 0.3 });

  // ── 站 2：screen（另一台更老的机器），作者是它的重度用户 ──
  const X2 = 2475;
  const scr = crt(world, X2 - 520, 200, 420, 310, { bezel: 'char', screws: 12, name: 'screen box' });
  term(scr, 'screen', 30, 30, { vt: true, size: 120, color: C.amber });
  term(scr, '<span style="color:#9A7A3E">C-a</span>', 30, 170, { size: 32 });
  sslide(scr.el, tP2 - 0.2, { x: -60 });
  const who = tag(world, tr('作者：screen 的重度用户', 'AUTHOR: HEAVY SCREEN USER'), X2 - 520, 140, { zh: ZH });
  swipe(who, tHeavy - 0.1, 'l'); sfx('pop', tHeavy - 0.1, { g: 0.6, p: -0.3 });
  const vu = h('div', 'abs', world); px(vu, X2 - 520, 540, 420, 52); css(vu, { background: C.black }); vu.dataset.name = 'usage meter';
  const segs = []; for (let i = 0; i < 12; i++) { const g = blk(vu, i < 10 ? C.amber : '#5A3F1E', 10 + i * 34, 10, 26, 32); segs.push(g); }
  appear(vu, tHeavy - 0.15);
  F((t) => { const n = clamp(Math.floor((q12(t) - tHeavy) * 24), 0, 10); segs.forEach((g, i) => { g.style.visibility = i < n ? 'visible' : 'hidden'; }); });
  sfx('tick', tScr, { g: 0.6, p: -0.3 });

  // ── 站 2（续）：tmux 不是要复制 screen ──
  const box2 = crt(world, X2 + 100, 200, 420, 310, { bezel: 'cream', screws: 12, name: 'tmux box' });
  term(box2, 'tmux', 34, 30, { vt: true, size: 120 });
  sslide(box2.el, tP3 - 0.1, { x: 60 }); sfx('thud', tP3, { g: 0.55, p: 0.3 });
  const neq = txt(world, 'vt cream', '≠', X2 - 66, 250); neq.style.fontSize = '200px';
  slam(neq, tCopy - 0.05, { from: 1.4, d: 0.25, ease: SE(0.25) });
  const stamp = h('div', 'abs zh-b', world, tr('不是要复制', 'NOT A COPY')); px(stamp, X2 + 170, 410);
  css(stamp, { fontSize: ZH ? '64px' : '56px', color: C.ink, background: C.paper, border: '6px solid ' + C.ink, padding: '4px 22px', transform: 'rotate(-6deg)' });
  stamp.dataset.overlapOk = '1';
  slam(stamp, tCopy + 0.05, { from: 1.6, d: 0.25, ease: SE(0.25) }); sfx('thud', tCopy + 0.05, { g: 0.9, p: 0.3 });
  const src = txt(world, 'silk steel', tr('作者 · 2009 年采访（大意）', 'the author, 2009 interview (paraphrased)'), X2 + 100, 560);
  src.style.fontSize = '26px';
  swipe(src, tCopy + 0.4, 'l', 0.33);

  // ── 站 3：一个窗口接到多个终端，其他窗口各自独立 ──
  const X3 = 4100;
  const w1 = panel(world, 'black', X3 - 760, 230, 400, 250, { name: 'window 1' });
  txt(w1, 'lab green', 'WINDOW 1', 22, 16).style.fontSize = '28px';
  const w1t = txt(w1, 'mono green', '$ make<br><span class="gdim">[ok] build</span>', 22, 76); w1t.style.fontSize = '34px'; w1t.style.lineHeight = '1.3';
  swipe(w1, tP4 - 0.15, 't', 0.42); sfx('pop', tP4 - 0.15, { g: 0.6, p: -0.2 });
  const pl = svgLayer(world);
  const terms3 = [0, 1, 2].map((i) => {
    const y = 160 + i * 150;
    const c = crt(world, X3 - 120, y, 230, 132, { bezel: 'cream', pad: 12, lit: false, name: 'terminal ' + (i + 1) });
    const tt = txt(c.inner, 'mono green', '$ make<br><span class="gdim">[ok] build</span>', 12, 8); tt.style.fontSize = '24px'; tt.style.lineHeight = '1.25';
    const p = svg('path', { d: `M${X3 - 360},${355} C${X3 - 250},${355} ${X3 - 240},${y + 66} ${X3 - 120},${y + 66}`, fill: 'none', stroke: C.ink, 'stroke-width': 10 }, pl);
    const p2 = svg('path', { d: p.getAttribute('d'), fill: 'none', stroke: C.amber, 'stroke-width': 3 }, pl);
    const tt0 = tSev - 0.2 + i * 0.14;
    draw(p, tt0, 0.3, { ease: SE(0.3) }); draw(p2, tt0, 0.3, { ease: SE(0.3) });
    appear(c.el, tt0 - 0.25); c.on(tt0 + 0.3); sfx('pop', tt0 + 0.3, { g: 0.55 - i * 0.08, p: 0.1 });
    return c;
  });
  const lw = tag(world, tr('同一个窗口 → 多个终端', 'ONE WINDOW → SEVERAL TERMINALS'), X3 - 760, 170, { zh: ZH });
  swipe(lw, tSev - 0.3, 'l');
  const others = [0, 1].map((i) => {
    const p = panel(world, 'black', X3 + 260, 200 + i * 190, 340, 160, { name: 'window ' + (i + 2) });
    txt(p, 'lab gdim', 'WINDOW ' + (i + 2), 20, 14).style.fontSize = '26px';
    const l = txt(p, 'mono', i ? '$ ssh' : '$ vim', 20, 70); l.style.fontSize = '30px'; l.style.color = C.amber;
    swipe(p, tRest - 0.1 + i * 0.12, 'r', 0.33);
    return p;
  });
  sfx('tick', tRest - 0.1, { g: 0.6, p: 0.5 }); sfx('tick', tRest + 0.02, { g: 0.5, p: 0.5 });
  const li = tag(world, tr('其他窗口：各自独立', 'OTHER WINDOWS: INDEPENDENT'), X3 + 260, 580, { zh: ZH });
  li.style.top = (TY - 60) + 'px';
  swipe(li, tRest + 0.2, 'r');

  // ── 站 4：2009，进入 OpenBSD 的基本系统 ──
  const X4 = 5700;
  const y9 = year(X4 - 560, 0, tY9, '2009');
  const shelf = panel(world, 'cream', X4 - 240, 150, 700, 440, { screws: 14, name: 'OpenBSD base shelf' });
  const sl = tag(shelf, tr('OpenBSD 基本系统', 'OpenBSD BASE SYSTEM'), 26, 24, { zh: ZH, dark: true });
  for (let i = 0; i < 3; i++) { const slot = blk(shelf, C.black, 26, 100 + i * 100, 640, 80); slot.dataset.name = 'slot'; }
  const cart = h('div', 'abs', shelf); px(cart, 36, 312, 620, 60); css(cart, { background: C.olive || '#4A4F3A', borderBottom: '6px solid #262A1D' });
  const ct = txt(cart, 'vt green', 'tmux', 20, 4); ct.style.fontSize = '54px';
  const cw = txt(cart, 'lab cream', tr('2009-07-07 导入', 'IMPORTED 2009-07-07'), 170, 14); cw.style.fontSize = '26px';
  if (ZH) cw.style.fontFamily = '"Sans SC", "Mono"';
  swipe(shelf, tP6 - 0.3, 'b', 0.42);
  fromTo(cart, tBase, { x: 760 }, { x: 0, duration: 0.42, ease: SE(0.42) }); appear(cart, tBase);
  sfx('thud', tBase + 0.42, { g: 0.8, p: 0.4 }); sfx('chime', tBase + 0.6, { g: 0.5, p: 0.4 });

  // ── 镜头：沿纸带向右 ──
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.1, { z: 1.03 }, Math.max(1, tP2 - s.start - 0.6), { ease: 'none', sfx: false }],
    [tP2 - 0.4, { x: X2, z: 1 }, 1.0, { sfx: false }],
    [null, { z: 1.05 }, Math.max(0.6, tP4 - tP2 - 1.6), { ease: 'none', sfx: false }],
    [tP4 - 0.35, { x: X3, z: 1 }, 1.0, { sfx: false }],
    [null, { z: 1.03 }, Math.max(0.5, tP6 - tP4 - 1.5), { ease: 'none', sfx: false }],
    [tP6 - 0.4, { x: X4, z: 1 }, 1.0, { sfx: false }],
    [null, { z: 1.04 }, Math.max(0.5, s.end - tP6 - 0.8), { ease: 'none', sfx: false }],
  ]);
  sfx('drive', tP2 - 0.35, { g: 0.55 }); sfx('drive', tP4 - 0.3, { g: 0.55 }); sfx('drive', tP6 - 0.35, { g: 0.55 });
});
