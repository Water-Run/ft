// 第 01 章：从 MyISAM 到 InnoDB。站 A：InnoDB 是 MySQL 的存储引擎（两层：SQL 层与存储引擎）；
// 站 B：时间轴（Innobase、2005.10、2010.07 的 5.5.5、本期演示的 9.7.2；I24、I39）；站 C：SHOW ENGINES 的真实回显（I01）。
scene('s01', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 7000, 1400);
  const XB = 2200, XC = 4400;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;

  // ── 站 A ──
  const word = txt(world, 't-0', 'InnoDB', 110, 200);
  const sub = txt(world, 't-4 dim', 'MySQL 的存储引擎', 120, 380);
  pop(word, at('y1', 'InnoDB') - 0.1, { from: 0.85, origin: '0 50%' }); sfx('thud', at('y1', 'InnoDB'), { g: 0.6 });
  fin(sub, at('y1b', '存储引擎'));
  const M = panel(world, 960, 140, 864, 760, 'MySQL', { name: 'mysql-layers' });
  const top = panel(world, 1000, 230, 784, 160, null, { name: 'sql-layer' });
  const topT = txt(world, 't-4', 'SQL 层', 1036, 252), topS = txt(world, 't-n dim', '解析语句 · 选择执行计划', 1036, 316);
  const bot = panel(world, 1000, 470, 784, 300, null, { cls: 'hot', name: 'engine-layer' });
  const botT = txt(world, 't-4 blue', '存储引擎', 1036, 492);
  const eM = txt(world, '', 'MyISAM', 1040, 570), eI = txt(world, '', 'InnoDB', 1320, 570);
  [eM, eI].forEach((e, i) => css(e, { padding: '10px 26px', borderRadius: '12px', font: '700 38px "Open Sans"', background: i ? C.blue : '#bddcd7', color: i ? '#fff' : C.ink }));
  const disk = [0, 1, 2, 3, 4, 5].map((i) => tile(world, 1050 + i * 118, 690, 100, 50, i % 3 === 1 ? 't2' : 't1'));
  const dl = txt(world, 't-s dim', '磁盘上的数据', 1050, 800);
  const tL = at('y1b');
  showPanel(M, c0 + 0.1); fin(top.el, tL, { y: 12 }); fin(topT, tL + 0.1); fin(topS, tL + 0.2);
  fin(bot.el, at('y1b', '存储引擎') - 0.2, { y: 12 }); fin(botT, at('y1b', '存储引擎')); pop(eM, at('y1b', 'MyISAM')); pop(eI, at('y1b', '存储引擎') + 0.3);
  sfx('pop', at('y1b', '存储引擎') + 0.3, { g: 0.5, p: 0.4 });
  const tDisk = at('y1c', '磁盘');
  disk.forEach((e, i) => pop(e, tDisk + i * 0.05)); fin(dl, tDisk + 0.3);
  const aw = gline(g, 'M1620 600 L1620 680', 'blue', { w: 5, arrow: true }), ar = gline(g, 'M1680 680 L1680 600', 'blue', { w: 5, arrow: true });
  arrowIn(aw, at('y1c', '写进'), 0.3); arrowIn(ar, at('y1c', '读出来'), 0.3); sfx('tick', at('y1c', '读出来'), { g: 0.4 });

  // ── 站 B：时间轴 ──
  const AY = 560;
  const axis = gline(g, `M${XB + 140} ${AY} L${XB + 1800} ${AY}`, 'ink', { w: 4 });
  drawIn(axis, at('y2') - 0.4, 0.9);
  const stops = [
    { x: XB + 220, id: 'y2', yr: null, a: 'Innobase Oy', b: '芬兰的公司，开发了 InnoDB' },
    { x: XB + 640, id: 'y3', yr: '2005.10', a: 'Oracle 宣布收购', b: 'Innobase', wa: 'Oracle', wb: '收购' },
    { x: XB + 1060, id: 'y5', yr: '2010.07', a: 'MySQL 5.5.5 起', b: '取代 MyISAM，成为默认引擎', bid: 'y5b' },
    { x: XB + 1480, id: 'y6', yr: '9.7.2', a: '本期演示的版本', b: 'MySQL 9.7', wa: '演示', wb: '9.7.2' },
  ];
  stops.forEach((st, i) => {
    const dot = tile(world, st.x - 20, AY - 20, 40, 40, 't1');
    const tt = at(st.id) + 0.1;
    // 四个时间点先以浅色一齐排在轴上，讲到哪一个，哪一个变深
    pop(dot, at('y2') + 0.3 + i * 0.2); classAt(dot, i === 3 ? 'blue' : 't4', tt); if (i) beat(dot, tt, 1.3); sfx('pop', tt, { g: 0.45, p: -0.5 + i * 0.3 });
    // 年份先以灰色排好（时间轴的骨架），讲到时变成标志蓝
    if (st.yr) { const yr = txt(world, '', st.yr, st.x - 20, 300); css(yr, { font: '800 76px/1 "Open Sans"' }); fin(yr, at('y2') + 0.5 + i * 0.25); F((t) => { yr.style.color = t >= tt + 0.1 ? C.blue : C.dim; }); }
    const a = txt(world, 't-4', st.a, st.x - 20, st.yr ? 400 : 420); fin(a, st.wa ? at(st.id, st.wa) : tt + 0.25);
    const b = txt(world, 't-n dim wrap', st.b, st.x - 18, AY + 50); css(b, { width: '390px' }); fin(b, st.bid ? at(st.bid) + 0.2 : st.id === 'y2' ? at('y2', '开发') : st.wb ? at(st.id, st.wb) : tt + 0.6);
  });
  const src = txt(world, 't-s dim', '出处：Oracle 新闻（2005-10-07）；MySQL 5.5 发布说明（5.5.5，2010-07-06）', XB + 120, 820);
  fin(src, at('y5b') + 0.8);

  // ── 站 C：SHOW ENGINES ──
  const E_ = panel(world, XC + 96, 140, 1728, 470, 'SHOW ENGINES · MySQL 9.7.2', { tcls: 'mono', name: 'show-engines' });
  const head = ['ENGINE', 'SUPPORT', 'TRANSACTIONS', 'XA', 'SAVEPOINTS'], cols = [300, 280, 400, 160, 300];
  const rowsE = [['InnoDB', 'DEFAULT', 'YES', 'YES', 'YES'], ['MyISAM', 'YES', 'NO', 'NO', 'NO']];
  const cells = [head, ...rowsE].map((r, i) => { let x = XC + 150; return r.map((v, j) => { const e = txt(world, 'mono ' + (i === 0 ? 'dim' : ''), v, x, 240 + i * 90); css(e, { fontSize: i === 0 ? '30px' : '40px', fontWeight: 700 }); x += cols[j]; return e; }); });
  const tTab = at('y7') - 0.5;
  showPanel(E_, tTab - 0.4); cells.forEach((r, i) => r.forEach((e, j) => fin(e, tTab + i * 0.12 + j * 0.03, { y: 8, d: 0.3 })));
  sfx('tick', tTab, { g: 0.4 }); sfx('tick', tTab + 0.24, { g: 0.4 });
  const colRing = gring(g, XC + 150 + 580 - 20, 222, 380, 262, { color: 'blue', name: 'transactions-column' });
  const tTx = at('y7', '支持事务');
  drawIn(colRing, tTx - 0.1, 0.45); classAt(cells[1][2], 'blue', tTx); sfx('pop', tTx, { g: 0.55 });
  const st1 = panel(world, XC + 96, 660, 820, 200, null, { cls: 'hot', name: 'step-1' }), st2 = panel(world, XC + 1004, 660, 820, 200, null, { name: 'step-2' });
  const s1n = txt(world, 't-s blue', '先讲', XC + 136, 690), s1t = txt(world, 't-3', '什么是事务', XC + 136, 740);
  const s2n = txt(world, 't-s dim', '再看', XC + 1044, 690), s2t = txt(world, 't-3', 'InnoDB 怎样做出来', XC + 1044, 740);
  const arr = gline(g, `M${XC + 930} 760 L${XC + 990} 760`, 'ink', { w: 5, arrow: true });
  showPanel(st1, at('y8', '事务') - 0.3); fin(s1n, at('y8', '事务') - 0.2); fin(s1t, at('y8', '事务'));
  arrowIn(arr, at('y8', '再看') - 0.2, 0.3); showPanel(st2, at('y8', '再看') - 0.1); fin(s2n, at('y8', '再看')); fin(s2t, at('y8', 'InnoDB') + 0.1);
  sfx('tick', at('y8', '再看'), { g: 0.4 });

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('y2') - 0.5, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('y7') - 0.9, { x: XC + 960 }, 1.1, { g: 0.4 }],
  ]);
});
