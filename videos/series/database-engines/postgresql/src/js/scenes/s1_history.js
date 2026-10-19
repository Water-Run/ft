// 第 01 章：它从哪里来。一条 PostgreSQL 蓝的谱系线贯穿各站（y = 880），每站一个年份刻度。
// 站 A 系统剖面；B 1970 关系模型；C 1973 System R 与 SQL；D 七十年代 Ingres（1988 年两者同获奖）；
// E 1986 POSTGRES 与对象关系；F 1994–2014；G 全线回看；H SQL:2023 核心特性方阵与结论。
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const LY = 780;                                       // 谱系线
  const SX = { A: 960, B: 2960, C: 4960, D: 6960, E: 8960, F: 10960, G: 12960 };
  const g = gsvg(world, 0, 0, 16000, 2400);

  // ── 站 A：PostgreSQL 是整套系统；InnoDB 只是 MySQL 里的存储一层 ──
  const layers = ['解析 SQL', '规划查询', '执行', '事务', '存储'];
  const AX = 760, AY = 230, LW = 760, LH = 104;
  const pgBox = blk(world, AX - 30, AY - 30, LW + 60, layers.length * (LH + 14) + 46, '', 'PostgreSQL 整套系统');
  const pgName = txt(world, 't-3 pg', 'PostgreSQL', AX - 30, AY - 92); css(pgName, { fontFamily: '"Open Sans"', fontWeight: 700 });
  const lay = layers.map((n, i) => { const b = blk(world, AX, AY + i * (LH + 14), LW, LH, 'fill', n); const l = txt(b, 'lbl w', n, 40, LH / 2 - 21); return { b, l }; });
  const ino = blk(world, 160, AY + 4 * (LH + 14) - 16, 440, LH + 32, 'grey', 'InnoDB');
  const inoT = txt(world, 't-3 grey', 'InnoDB', 200, AY + 4 * (LH + 14) + 10); css(inoT, { fontFamily: '"Open Sans"' });
  const inoS = txt(world, 't-s', 'MySQL 里的存储引擎', 160, AY + 4 * (LH + 14) + 140);
  const tA = c0 + 0.15;
  fin(ino, tA); fin(inoT, tA + 0.1); fin(inoS, T('h1') + 0.6);
  fin(pgBox, T('h1') + 0.3, { y: 0 }); fin(pgName, T('h1') + 0.4);
  lay.forEach((L_, i) => { fin(L_.b, T('h1a') + 0.2 + i * 0.32, { x: 30, y: 0 }); });
  sfx('pop', T('h1a') + 0.2);

  // ── 谱系线与年份刻度 ──
  const line = gline(g, `M2000,${LY} L12200,${LY}`, 'pg', { w: 8, name: '谱系线' });
  const ticks = {};
  const tick = (k, x, yr) => { const d = gdot(g, x, LY, 14, 'pg', { name: '年份 ' + yr }); const l = txt(world, 'num t-3 pg', yr, x - 60, LY + 28); css(l, { fontWeight: 700, width: '120px', textAlign: 'center' }); ticks[k] = { d, l }; return ticks[k]; };
  tick('B', SX.B, '1970'); tick('C', SX.C, '1973'); tick('D', SX.D, '1970s'); tick('E', SX.E, '1986'); tick('F', SX.F, '1996');
  css(ticks.D.l, { width: '140px', left: (SX.D - 70) + 'px' });
  drawIn(line, T('h5') - 0.6, 1.0);
  const showTick = (k, t) => { pop(ticks[k].d, t, { origin: 'center' }); fin(ticks[k].l, t + 0.1, { y: 10 }); sfx('tick', t); };

  // ── 站 B：1970，关系模型；两张表靠值关联 ──
  const bYr = txt(world, 'num t-0', '1970', SX.B + 260, 150); css(bYr, { color: 'var(--pg)' });
  const bT = txt(world, 't-1', '关系模型', SX.B - 820, 150);
  const bS = txt(world, 't-4', 'E. F. Codd · IBM', SX.B - 816, 270);
  const tu = dtable(world, SX.B - 820, 400, ['编号', '名字'], [[1, 'alice'], [2, 'bob'], [3, 'carol']], { num: [0] });
  const tn = dtable(world, SX.B + 260, 400, ['编号', '备注'], [[1, 'hello'], [2, 'synthetic note'], [3, 'short']], { num: [0] });
  const uN = txt(world, 't-s', 'users', SX.B - 820, 352), nN = txt(world, 't-s', 'notes', SX.B + 260, 352);
  showTick('B', T('h5')); fin(bYr, T('h5') + 0.3, { y: 20 }); out(bYr, T('h6a') - 0.4, 0.4);
  fin(bT, T('h6')); fin(bS, T('h6') + 0.2);
  showTable(tu, T('h6a') - 0.2); showTable(tn, T('h6a') + 0.1); fin(uN, T('h6a') - 0.1); fin(nN, T('h6a') + 0.2);
  // 同一编号之间连线（在构建后量位置）
  const rel = [];
  window.PENDING.push(Promise.resolve());
  const relDraw = () => {
    tu.trs.forEach((tr, i) => {
      const a = box(tr, world), b = box(tn.trs[i], world);
      const p_ = gline(g, `M${a.r + 4},${a.cy} C${a.r + 120},${a.cy} ${b.x - 120},${b.cy} ${b.x - 4},${b.cy}`, 'pg', { w: 4, arrow: true, name: '按值关联' });
      rel.push(p_); drawIn(p_, T('h6a', '靠') + i * 0.15, 0.6);
    });
  };
  relDraw();

  // ── 站 C：1973，IBM System R；SQL 出自这里 ──
  const qBox = blk(world, SX.C - 700, 220, 1400, 420, 'dash', '怀疑');
  css(qBox, { borderColor: 'var(--grey-lt)' });
  const qT = txt(world, 't-2 grey', '能做出来吗？', SX.C - 210, 360);
  const cT = txt(world, 't-1', 'System R', SX.C - 640, 250); css(cT, { fontFamily: '"Open Sans"' });
  const cS = txt(world, 't-4', 'IBM · 1973', SX.C - 634, 370);
  const cQ = psql(world, SX.C - 640, 470, [''], { w: 1280 });
  const cQl = txt(world, 't-s', '今天写的 SQL，也诞生在 IBM', SX.C - 636, 610);
  fin(qBox, T('h7') - 0.1, { y: 0 }); fin(qT, T('h7') + 0.3, { y: 0 });
  showTick('C', T('h7a') - 0.2);
  out(qT, T('h7a') - 0.3, 0.3);
  tl.fromTo(qBox, { borderColor: '#ced4da' }, { borderColor: '#336791', duration: 0.5, immediateRender: false }, T('h7a'));
  set(qBox, T('h7a'), { borderStyle: 'solid' });
  fin(cT, T('h7a') + 0.1); fin(cS, T('h7a') + 0.3);
  fin(cQ.el, T('h7b') - 0.3, { y: 0 });
  typeText(cQ.rows[0], 'SELECT name FROM users WHERE id = 1;', T('h7b'), 26, { cursor: false, sfxGain: 0.25 });
  fin(cQl, T('h7b') + 1.2);

  // ── 站 D：同一时期，伯克利的 Ingres；1988 年两者同获 ACM 软件系统奖 ──
  const dBox = blk(world, SX.D - 700, 220, 1400, 420, '', 'Ingres');
  const dT = txt(world, 't-1', 'Ingres', SX.D - 640, 250); css(dT, { fontFamily: '"Open Sans"' });
  const dS = txt(world, 't-4', '伯克利 · 斯通布雷克、Eugene Wong 等', SX.D - 634, 370);
  const dSys = blk(world, SX.D - 640, 480, 560, 110, 'grey', 'System R');
  const dSysT = txt(dSys, 'lbl g', 'System R · IBM', 30, 32);
  const dIng = blk(world, SX.D + 80, 480, 560, 110, 'fill', 'Ingres');
  const dIngT = txt(dIng, 'lbl w', 'Ingres · 伯克利', 30, 32);
  const award = tag(world, SX.D - 330, 660, '1988 · ACM 软件系统奖', 'fill'); css(award, { fontSize: '38px', padding: '14px 26px' });
  showTick('D', T('h8') - 0.2);
  fin(dBox, T('h8') + 0.2, { y: 0 }); fin(dT, T('h8a') - 0.1); fin(dS, T('h8') + 0.6);
  fin(dSys, T('h9') - 0.2, { x: -60, y: 0 }); fin(dIng, T('h9'), { x: 60, y: 0 });
  pop(award, T('h9') + 0.7, { from: 0.85 }); sfx('chime', T('h9') + 0.8, { g: 0.45 });
  dim(dS, T('h9'), 0.4);

  // ── 站 E：1986，POSTGRES；对象关系 ──
  const eT1 = txt(world, 't-0', 'POST', SX.E - 640, 170); css(eT1, { color: 'var(--pg)' });
  const eT2 = txt(world, 't-0', 'GRES', SX.E - 640 + 420, 170); css(eT2, { color: 'var(--pg)' });
  const eIng = txt(world, 't-4', '= Ingres 之后', SX.E + 300, 230);
  const eS = txt(world, 't-4', '斯通布雷克 · 伯克利 · 1986', SX.E - 634, 340);
  // 一张表，三种可以自己加的东西插进来
  const tblX = SX.E - 640, tblY = 450;
  const eTab = dtable(world, tblX, tblY, ['编号', '位置', '…'], [[1, '(3, 4)', ''], [2, '(5, 1)', '']], { num: [0] });
  const mods = [['类型', 'point'], ['函数', 'distance()'], ['索引', 'GiST']].map(([a, b], i) => {
    const m = blk(world, SX.E - 80 + i * 290, 470, 260, 150, 'wash', a);
    const ma = txt(m, 'lbl', a, 24, 18); const mb = txt(m, 'lbl mono', b, 24, 78); css(mb, { fontSize: '28px', color: 'var(--ink2)', fontWeight: 500 });
    return m;
  });
  const eOR = tag(world, SX.E - 80, 660, '对象关系', 'fill'); css(eOR, { fontSize: '36px', padding: '12px 24px' });
  const bars = ['主流商业关系数据库'].map((n, i) => { const b = blk(world, SX.E + 240, 660, 520, 66, 'grey', n); txt(b, 'lbl g', n, 24, 12); return b; });
  const eArrow = gline(g, `M${SX.E + 180},${693} L${SX.E + 232},${693}`, 'grey', { w: 4, arrow: true });
  showTick('E', T('h10a') - 0.2);
  const eNext = blk(world, SX.E - 640, 170, 860, 150, 'dash', '下一代'); css(eNext, { borderColor: 'var(--pg-lt)' });
  const eNextT = txt(eNext, 'lbl', '下一代 →', 30, 44); css(eNextT, { fontSize: '44px' });
  fin(eNext, T('h10') + 0.1, { y: 0 }); out(eNext, T('h10a', 'Po') - 0.4, 0.3);
  fin(eS, T('h10') + 0.2);
  fin(eT1, T('h10a', 'Po') - 0.2, { y: 24 }); fin(eT2, T('h10a', 'Po'), { y: 24 });
  fin(eIng, T('h10b') + 0.2, { x: -20, y: 0 });
  tl.fromTo(eT2, { x: 0 }, { x: 40, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, T('h10b'));
  showTable(eTab, T('h10c') - 0.3, 0.1);
  mods.forEach((m, i) => fin(m, T('h10c') + 0.6 + i * 0.45, { y: -30 }));
  sfx('pop', T('h10c') + 0.6); sfx('pop', T('h10c') + 1.05); sfx('pop', T('h10c') + 1.5);
  pop(eOR, T('h10d') + 0.2); sfx('thud', T('h10d') + 0.2, { g: 0.4 });
  drawIn(eArrow, T('h10e') - 0.1, 0.4); bars.forEach((b) => fin(b, T('h10e') + 0.1, { x: -20, y: 0 }));

  // ── 站 F：1994 加上 SQL、1996 改名交给社区、2014 图灵奖 ──
  const fRows = [
    ['1994', '加上 SQL', 'h11'],
    ['1996', '改名 PostgreSQL，交给社区开发', 'h12'],
    ['2014', '斯通布雷克获得图灵奖', 'h13'],
  ];
  const fItems = fRows.map(([yr, text, id], i) => {
    const y = 210 + i * 200;
    const yl = txt(world, 'num t-1', yr, SX.F - 700, y); css(yl, { fontFamily: '"Open Sans"' });
    const tx = txt(world, 't-3', text, SX.F - 360, y + 26);
    const rule = blk(world, SX.F - 700, y + 150, 1400, 3, 'fill'); css(rule, { borderWidth: '0', background: 'var(--rule)' });
    return { yl, tx, rule, id };
  });
  const fLogo = pgLogo(world, false); px(fLogo, SX.F + 470, 360, 150, 155);
  showTick('F', T('h12') - 0.2);
  fItems.forEach((it, i) => { fin(it.yl, T(it.id) - 0.15, { x: -24, y: 0 }); fin(it.tx, T(it.id) + 0.15); grow(it.rule, T(it.id) + 0.2, { d: 0.6 }); });
  pop(fLogo, T('h12') + 0.6, { from: 0.8 }); sfx('pop', T('h12') + 0.6);

  // ── 站 G：回看整条线（独立的大字年表，不缩小细节） ──
  const GX = 14960, GY = 540;
  const gg = gsvg(world, 13600, 0, 2400, 1100, 4);
  const gl = gline(gg, `M${GX - 640},${GY + 120} L${GX + 640},${GY + 120}`, 'pg', { w: 10, cap: 'round', name: '谱系' });
  const gYears = [['1970', '关系模型'], ['1970s', 'Ingres'], ['1986', 'POSTGRES'], ['1996', 'PostgreSQL'], ['2026', '今天']];
  const gEls = gYears.map(([yr, nm], i) => {
    const x = GX - 640 + i * 320;
    const d = gdot(gg, x, GY + 120, 18, 'pg');
    const y_ = txt(world, 'num t-2', yr, x - 100, GY - 20); css(y_, { width: '200px', textAlign: 'center', fontFamily: '"Open Sans"', fontWeight: 700 });
    const n_ = txt(world, 't-4', nm, x - 120, GY + 170); css(n_, { width: '240px', textAlign: 'center' });
    return { d, y_, n_ };
  });
  const gHead = heading(world, GX - 760, 200, 1520, '从最早的关系数据库，一路连到今天');
  showHeading(gHead, T('h14') - 0.3);
  drawIn(gl, T('h14'), 1.6);
  gEls.forEach((e, i) => { pop(e.d, T('h14') + 0.3 * i, { origin: 'center' }); fin(e.y_, T('h14') + 0.3 * i + 0.1); fin(e.n_, T('h14') + 0.3 * i + 0.2); });

  // ── 站 H：SQL:2023 核心特性 177 项，PostgreSQL 18 至少 170 项 ──
  const HY = 1840, HX = GX;
  const hHead = heading(world, HX - 800, HY - 360, 1600, '它也一直贴着 SQL 标准走');
  const COLS = 30, CELL = 38, GAP = 8, gx0 = HX - 800, gy0 = HY - 230;
  const cells = [];
  for (let i = 0; i < 177; i++) {
    const c = blk(world, gx0 + (i % COLS) * (CELL + GAP), gy0 + Math.floor(i / COLS) * (CELL + GAP), CELL, CELL, '', 'SQL:2023 核心特性');
    css(c, { borderWidth: '3px', borderColor: 'var(--pg-lt)', background: 'var(--paper)' });
    cells.push(c);
  }
  const fillCells = cells.slice(0, 170), rest = cells.slice(170);
  const hA = txt(world, 'num t-3', 'SQL:2023 核心标准 · 必选特性 <b class="pg">177</b> 项', HX - 800, gy0 + 6 * (CELL + GAP) + 30);
  const hB = txt(world, 'num t-3', 'PostgreSQL 18 · 至少支持 <b class="pg">170</b> 项', HX - 800, gy0 + 6 * (CELL + GAP) + 100);
  const hC = txt(world, 't-4', '177 项全部做到的：目前还一个都没有', HX - 800, gy0 + 6 * (CELL + GAP) + 176);
  const hEnd = txt(world, 't-1', '关系数据库的正统', HX - 800, HY + 290);
  const hLogo = pgLogo(world, false); px(hLogo, HX + 600, HY + 230, 190, 196);
  showHeading(hHead, Tend('h14') + 1.2);
  cells.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, immediateRender: true }, T('h15a') - 0.4 + i * 0.006));
  fin(hA, T('h15a') + 0.2);
  fillCells.forEach((c, i) => tl.fromTo(c, { backgroundColor: '#ffffff', borderColor: '#699eca' }, { backgroundColor: '#336791', borderColor: '#336791', duration: 0.2, immediateRender: false }, T('h15b') + i * 0.012));
  sfx('tick', T('h15b')); sfx('chime', T('h15b') + 2.05, { g: 0.35 });
  fin(hB, T('h15b') + 0.3);
  rest.forEach((c, i) => tl.fromTo(c, { borderColor: '#699eca' }, { borderColor: '#e2b21f', duration: 0.3, immediateRender: false }, T('h15c') + i * 0.05));
  fin(hC, T('h15c') + 0.2);
  fin(hEnd, T('h16') + 0.2, { y: 24 }); pop(hLogo, T('h16') + 0.4, { from: 0.8 }); sfx('thud', T('h16') + 0.3, { g: 0.5 });

  camTrack(cam, world, { t: s.start, v: { x: SX.A, y: 540, z: 1 } }, [
    [T('h5') - 0.9, { x: SX.B }, 1.2, { sfx: true }],
    [Tend('h6a') + 0.9, { x: SX.C }, 1.1, { sfx: true }],
    [Tend('h7b') + 0.9, { x: SX.D }, 1.1, { sfx: true }],
    [Tend('h9') + 0.9, { x: SX.E }, 1.1, { sfx: true }],
    [Tend('h10e') + 0.9, { x: SX.F }, 1.1, { sfx: true }],
    [Tend('h13') + 0.9, { x: GX, y: 540 }, 1.2, { sfx: true }],
    [Tend('h14') + 0.9, { y: HY + 60 }, 1.1, { sfx: true }],
  ], { end: s.end });
});
