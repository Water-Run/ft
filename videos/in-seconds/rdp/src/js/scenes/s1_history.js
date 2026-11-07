// 历史：1998 年，一台服务器分给很多人用（代号 Hydra）；2001 年 Windows XP 专业版也带上了它。事实见 FACTS H1–H6。
// 常驻：顶上一排年份磁贴；中间一台服务器，分出九个桌面，连到九台便宜的终端。
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── 年份磁贴：1997 Hydra · 1998 终端服务器版 · 2001 Windows XP · 今天 ──
  const years = [
    ['line', '1997', tr('Hydra 项目', 'Project Hydra')],
    ['rdp', '1998', tr('NT 4.0 终端服务器版', 'NT 4.0 Terminal Server')],
    ['line', '2001', 'Windows XP'],
    ['line', tr('今天', 'Today'), tr('Windows 11 · mstsc', 'Windows 11 · mstsc')],
  ];
  const yt = years.map(([c, y, l], i) => { const e = tile(world, c, 120 + i * 430, 120, 410, 120, l, y); return e; });
  yt.forEach((e, i) => slide(e, c0 + 0.05 + i * 0.1, { x: 80, d: 0.45 }));
  sfx('pop', c0 + 0.05, { g: 0.5 });
  // h1：1998 这一格砸一下、点亮
  const t98 = Qf(T('h1', '一九九八'));
  const glow98 = blk(world, 'c-rdpl', 120 + 430, 240, 410, 8); glow98.style.background = 'var(--rdpl)';
  wipe(glow98, t98, { dir: 'l', d: 0.4 }); sfx('thud', t98);
  const big98 = txt(world, 't-0', '1998', 690, 380); big98.dataset.name = '1998';
  slam(big98, t98, { from: 1.25, d: 0.4 }); hide(big98, Qf(T('h2', '电脑')) - 0.3, { d: 0.35 });
  // 「那时电脑贵」：一排灰色的电脑先占住下面的位置；到「便宜的终端」时换成小终端
  const tPc = Qf(T('h2', '电脑'));
  const pcs = [];
  for (let i = 0; i < 9; i++) { const e = tile(world, 'vid', 150 + i * 180, 640, 160, 170, tr('电脑', 'PC')); e.dataset.name = '电脑'; pcs.push(e); slide(e, tPc + i * 0.05, { y: 60, d: 0.4 }); }
  sfx('thud', tPc, { g: 0.5 });
  // ── h2：一台服务器 → 分给很多人 ──
  const srv = tile(world, 'tile', 760, 300, 400, 260, tr('服务器', 'Server'));
  srv.style.outline = '4px solid var(--rdp)'; srv.style.outlineOffset = '-4px';
  const tSrv = Qf(T('h2', '一台服务器')), tMany = Qf(T('h2', '很多人'));
  slam(srv, tSrv, { from: 1.15, d: 0.4 }); sfx('thud', tSrv, { g: 0.8 });
  // 服务器里的九个桌面（会话）：小方格 3×3
  const sess = [];
  for (let i = 0; i < 9; i++) { const e = blk(srv, 'c-rdp', 70 + (i % 3) * 92, 60 + Math.floor(i / 3) * 62, 80, 50); e.dataset.name = '桌面'; sess.push(e); }
  sess.forEach((e, i) => show(e, tMany + i * 0.06, { s: 0.6, d: 0.3 }));
  sfx('pop', tMany, { g: 0.6 });
  // ── h3：每人一台便宜的终端；程序全在服务器上跑 ──
  const tTerm = Qf(T('h3', '终端')), tRun = Qf(T('h3', '程序'));
  const terms = [], wires = overlay(world);
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 180, y = 690;
    const tm = h('div', 'abs', world); px(tm, x, y, 150, 120);
    const sc0 = blk(tm, 'c-tile', 0, 0, 150, 96); blk(sc0, 'c-rdp', 10, 10, 130, 76);
    blk(tm, 'c-line', 55, 96, 40, 12); blk(tm, 'c-line', 30, 108, 90, 10);
    tm.dataset.name = '终端'; terms.push(tm);
  }
  const tLab = txt(world, 't-n dim', tr('便宜的终端', 'Cheap terminals'), 150, 840);
  pcs.forEach((e, i) => to(e, tTerm - 0.3 + i * 0.03, { opacity: 0, scale: 0.6, duration: 0.35 }));
  terms.forEach((e, i) => slide(e, tTerm + i * 0.05, { y: 60, d: 0.4 }));
  wipe(tLab, tTerm + 0.3, { dir: 'l', d: 0.4 }); sfx('pop', tTerm, { g: 0.6 });
  // 程序：服务器里的几块磁贴，跑起来（在服务器里来回挪）
  const apps = [['fill', 0], ['glyph', 1], ['move', 2]].map(([c, i]) => { const e = blk(srv, 'c-' + c, 342, 60 + i * 62, 50, 50); e.dataset.name = '程序'; return e; });
  apps.forEach((e, i) => slide(e, tRun + i * 0.08, { x: 40, d: 0.35 }));
  sfx('blip', tRun, { g: 0.5 });
  const appLab = txt(srv, 't-s', tr('程序', 'Programs'), 330, 12);
  wipe(appLab, tRun + 0.2, { dir: 'l', d: 0.4 });
  // ── h4：项目代号 Hydra，九头蛇：九条线从服务器连到九台终端 ──
  const tHy = Qf(T('h4', '海德拉')), tNine = Qf(T('h4', '九头蛇'));
  const hy = txt(world, 't-2', 'Hydra', 330, 380); hy.dataset.name = 'Hydra';
  slam(hy, tHy, { from: 1.3, d: 0.4 }); sfx('thud', tHy);
  const lines = terms.map((tm, i) => path(wires, `M ${960} ${560} L ${225 + i * 180} ${690}`, 'rdpl', { w: 3, arrow: false }));
  lines.forEach((p, i) => drawIn(p, tNine + i * 0.05, 0.45));
  sfx('tick', tNine, { g: 0.6 });
  // ── h5：2001 年，Windows XP 专业版也带上了它 ──
  const t01 = Qf(T('h5', '二零零一')), tXp = Qf(T('h5', '专业版'));
  const glow01 = blk(world, 'c-rdpl', 120 + 2 * 430, 240, 410, 8); glow01.style.background = 'var(--rdpl)';
  wipe(glow01, t01, { dir: 'l', d: 0.4 }); sfx('pop', t01, { g: 0.7 });
  fromTo(yt[2], t01, { backgroundColor: '#3a3a3a' }, { backgroundColor: C.rdp, duration: 0.4, immediateRender: false });
  const xp = tile(world, 'rdp', 1300, 300, 500, 260, tr('Windows XP 专业版', 'Windows XP Professional'));
  const sw = h('div', 'abs', xp); px(sw, 30, 150, 440, 70); css(sw, { background: 'var(--bg)' });
  const swl = txt(sw, 't-n', tr('远程桌面', 'Remote Desktop'), 20, 14);
  const knob = blk(sw, 'c-line', 330, 15, 90, 40); const dot = blk(knob, 'c-paper', 4, 4, 32, 32);
  slide(xp, tXp - 0.2, { x: 120, d: 0.45 }); sfx('whoosh', tXp - 0.25, { g: 0.4 });
  fromTo(knob, tXp + 0.5, { backgroundColor: '#3a3a3a' }, { backgroundColor: C.you, duration: 0.25, immediateRender: false }); fromTo(dot, tXp + 0.5, { x: 0 }, { x: 50, duration: 0.25, immediateRender: false }); sfx('tick', tXp + 0.5, { g: 0.8 });
  [swl, knob, dot].forEach((e) => { e.dataset.overlapOk = '1'; });
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { x: 976 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
