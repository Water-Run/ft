// 开场：前三期（MyISAM、InnoDB、PostgreSQL）→ 第 4 格落进火鸟 → 小众：2024 使用率 → 同一套引擎，独立服务或嵌进应用 → 本片路线指向导航页签
// 主画面：火鸟标志落进系列的第 4 格，镜头推进去接到大标志；引擎块从服务端里分出一份，落进应用程序。
scene('open', ({ root, s }) => {
  const { world, under, over } = stage(root, 5760, 1080);
  const cam = makeCamera(world);

  // ── 站 A：系列的前三期，像官网的新闻列表一样排开 ──
  const COLS = [120, 560, 1000, 1440], CW = 360;
  const eps = [['01', 'MyISAM', 'MySQL'], ['02', 'InnoDB', 'MySQL'], ['03', 'PostgreSQL', '']];
  const tA = s.start + 0.15;
  const head = tx(world, 't3', '数据库引擎是如何实现的', 120, 150);
  wipe(head, tA, { dir: 'l', d: 0.6 });
  const epEls = eps.map(([n, name, grp], i) => {
    const x = COLS[i];
    const sq = blk(world, 'panel', '', x, 250, CW, 300); sq.dataset.name = '第 ' + n + ' 期';
    const num = tx(world, 'lat', n, x + 30, 270, { fontSize: '180px', fontWeight: 200, color: C.g4, lineHeight: '1' });
    const nm = tx(world, 't2 lat', name, x, 580, { fontWeight: 500 });
    return { sq, num, nm };
  });
  const tMy = T('o1', 'My'), tPg = T('o2', 'Postgres');
  [0, 1].forEach((i) => { slide(epEls[i].sq, tA + 0.25 + i * 0.16, { x: -60, d: 0.6, ease: 'power3.out' }); appear(epEls[i].num, tA + 0.35 + i * 0.16); wipe(epEls[i].nm, tA + 0.45 + i * 0.16, { dir: 'l' }); });
  sfx('pop', tA + 0.3, { g: 0.5, p: -0.6 }); sfx('pop', tA + 0.46, { g: 0.45, p: -0.3 });
  // MySQL 的括线：前两期同属 MySQL
  const brMy = blk(world, '', '', 120, 690, 800, 4, { background: C.ink });
  const brMyL = tx(world, 't4 lat', 'MySQL', 120, 708, { fontWeight: 500 });
  wipe(brMy, tMy - 0.1, { dir: 'l', d: 0.5 }); wipe(brMyL, tMy, { dir: 'l', d: 0.4 }); sfx('tick', tMy, { g: 0.6, p: -0.4 });
  slide(epEls[2].sq, tPg - 0.35, { x: -60, d: 0.6, ease: 'power3.out' }); appear(epEls[2].num, tPg - 0.25); wipe(epEls[2].nm, tPg - 0.15, { dir: 'l' });
  sfx('pop', tPg - 0.3, { g: 0.55, p: 0.1 });
  // 第 4 格：空着的位置，虚线框
  const slot4 = blk(world, '', '', COLS[3], 250, CW, 300, { outline: '4px dashed ' + C.g3, outlineOffset: '-4px' }); slot4.dataset.name = '第 4 格';
  const num4 = tx(world, 'lat', '04', COLS[3] + 30, 270, { fontSize: '180px', fontWeight: 200, color: C.g4, lineHeight: '1' });
  const tO5 = T('o5', '这一集');
  wipe(slot4, tO5, { dir: 'l', d: 0.5 }); appear(num4, tO5 + 0.2); sfx('tick', tO5 + 0.1, { g: 0.5, p: 0.5 });
  // 两个开源巨头：括住 MySQL 与 PostgreSQL 两组
  const brBig = blk(world, '', '', 120, 800, 1240, 4, { background: C.g4 });
  const brBigL = tx(world, 't4', '两个开源巨头', 120, 818, { fontWeight: 500 });
  const tGiant = T('o5', '巨头');
  wipe(brBig, tGiant - 0.5, { dir: 'l', d: 0.6 }); wipe(brBigL, tGiant - 0.2, { dir: 'l', d: 0.4 });

  // 火鸟落进第 4 格
  const tO6 = T('o6'), tFb = T('o6', 'Fire');
  const small = blk(world, '', '<img src="img/fb-mark.png" style="width:100%">', COLS[3] + 100, 319, 160, 162);
  small.dataset.name = 'Firebird 标志';
  slam(small, tO6 + 0.05, { from: 2.2, d: 0.55 }); sfx('thud', tO6 + 0.1, { p: 0.5 }); vanish(num4, tO6 + 0.12);

  // ── 站 K：大标志、标题与 2024 使用率（背景数据）──
  const KX = 1920;
  const big = blk(world, '', '<img src="img/fb-mark.png" style="width:100%">', KX + 140, 196, 470, 476);
  big.dataset.name = 'Firebird 标志（大）';
  const kTitle = tx(world, '', '一个小众的第三选择', KX + 760, 150, { fontSize: '80px', fontWeight: 700 });
  const hero = tx(world, 'hero', 'Firebird', KX + 752, 250);
  const tag = tx(world, 'lat', 'The true open-source relational database', KX + 762, 470, { fontSize: '36px', color: C.g4 });
  const tagZh = tx(world, 't5', '官网标语：真正开源的关系数据库', KX + 762, 518);
  const rule = blk(world, 'rule', '', KX + 760, 580, 1040, 0);
  const U = FB.dbengines_2026, x0 = KX + 1010, k = 450 / U.rows[0].score;
  const rows = U.rows.map((r, i) => {
    const y = 610 + i * 84, fb = r.database === 'Firebird', w = Math.max(10, r.score * k);
    const lb = tx(world, 'lat', r.database, KX + 760, y, { fontSize: '38px', fontWeight: fb ? 700 : 400, color: fb ? C.ink : C.g4 });
    const bar = blk(world, '', '', x0, y + 4, w, 44, { background: fb ? C.flame : C.g2 }); bar.dataset.name = r.database + ' 流行度得分';
    const v = tx(world, 'lat', '0.00', x0 + w + 20, y, { fontSize: '38px', fontWeight: fb ? 700 : 400 });
    const rk = tx(world, '', `第 ${r.rank} 名`, KX + 1690, y + 2, { fontSize: '34px', fontWeight: fb ? 700 : 400, color: fb ? C.ink : C.g4 });
    return { lb, bar, v, rk, r, fb, w };
  });
  const note = tx(world, 't5', `${U.source.replace('Ranking of relational DBMS', '')}关系数据库流行度排名 · 2026 年 10 月 · 共 ${U.systems_in_ranking} 个系统<br>得分是相对值，不是装机量或市场份额`, KX + 760, 852, { fontSize: '28px', whiteSpace: 'nowrap', lineHeight: '1.45' });

  // 镜头：站 A 慢推 → 推进第 4 格的标志 → 切到站 K（大标志与小标志在画面上同位同大）
  const zSmall = 470 / 160;                                   // 小标志放大到大标志的尺寸
  const scx = COLS[3] + 100 + 80, scy = 319 + 81;            // 小标志中心（world）
  const bcx = KX + 140 + 235, bcy = 196 + 238;               // 大标志中心
  const camK = { x: KX + 960, y: 540, z: 1 };                 // 站 K 的机位：大标志落在屏幕 (375, 434)
  const zoomTo = { x: scx + (960 - (bcx - KX)) / zSmall, y: scy + (540 - bcy) / zSmall, z: zSmall };
  const tZoom = tO6 + 0.55, tCut = tZoom + 0.75;
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [s.start + 0.2, { z: 1.035 }, tZoom - s.start - 0.3, { ease: 'none', sfx: false }],
    [tZoom, zoomTo, 0.75, { ease: 'power2.in', g: 0.5 }],
  ]);
  pin(cam, world, s.start + 0.2, { x: 960, y: 540, z: 1 });
  cam.cut(tCut, camK);
  appear(big, tCut);
  wipe(kTitle, tCut + 0.05, { dir: 'l', d: 0.5 });
  slam(hero, Math.max(tCut + 0.2, tFb - 0.1), { from: 1.15, d: 0.5 }); sfx('thud', Math.max(tCut + 0.2, tFb - 0.1) + 0.05, { g: 0.7, p: 0.3 });
  const tBars = Math.max(tCut + 0.5, Tend('o6') - 0.6);
  wipe(rule, tBars - 0.2, { dir: 'l', d: 0.6 });
  rows.forEach((o, i) => {
    const t = tBars + i * 0.18;
    appear(o.lb, t);
    tl.fromTo(o.bar, { width: 0 }, { width: o.w, duration: 0.9, ease: 'power3.out', immediateRender: true }, t);
    appear(o.v, t + 0.1); appear(o.rk, t + 0.3);
    countTo(o.v, 0, o.r.score, t, 0.9, (v) => v.toFixed(2));
    sfx(o.fb ? 'pop' : 'tick', t + (o.fb ? 0.2 : 0), { g: o.fb ? 0.75 : 0.4, p: 0.4 });
  });
  appear(note, tBars + 0.6);
  const tO7 = T('o7', '开源');
  wipe(tag, tO7 - 0.3, { dir: 'l', d: 0.7 }); wipe(tagZh, tO7, { dir: 'l', d: 0.5 });
  // 站 K 的慢推（向标题方向），到 o8 前离开
  const tK2 = Tend('o7') + 0.1;
  cam.track(tCut + 0.01, camK, [[tCut + 0.05, { z: 1.03, x: camK.x + 40 }, tK2 - tCut - 0.1, { ease: 'none', sfx: false }]]);

  // ── 站 B：独立服务 → 引擎嵌进应用 ──
  const BX = 3840;
  const srv = blk(world, 'dark', '', BX + 620, 190, 560, 300); srv.dataset.name = '服务端进程';
  const srvT = tx(world, 't3', '独立服务', BX + 650, 210, { color: C.white });
  const srvRef = tx(world, 'lat', 'MySQL · PostgreSQL · Firebird', BX + 650, 278, { fontSize: '30px', color: C.g3 });
  const eng = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:56px;margin-right:16px">引擎', BX + 660, 360, 480, 96, { fontSize: '40px' });
  eng.dataset.name = '引擎';
  const apps = [0, 1].map((i) => { const a = blk(world, 'panel', '', BX + 120, 200 + i * 170, 300, 120); a.dataset.name = '应用'; tx(a, 't4', '应用', 28, 34); return a; });
  const fileB = fileIcon(world, BX + 1420, 330, 300, 380, 'users.fdb');
  const appE = blk(world, 'panel', '', BX + 120, 640, 1060, 220); appE.dataset.name = '应用程序（嵌入）';
  const appET = tx(world, 't4', '应用程序', BX + 150, 660);
  const linesB = [0, 1].map((i) => arrow(over, [[BX + 420, 260 + i * 170], [BX + 620, 260 + i * 170]], 'ink'));
  const srvFile = arrow(over, [[BX + 1180, 400], [BX + 1420, 400]], 'ink');
  const embFile = arrow(over, [[BX + 1180, 760], [BX + 1300, 760], [BX + 1300, 640], [BX + 1420, 640]], 'ink');
  const tO8 = T('o8'), tO9 = T('o9'), tO10 = T('o10'), tO11 = T('o11');
  const tMove = Tend('o7') + 0.15;
  cam.track(tMove, { x: camK.x + 40, y: 540, z: 1.03 }, [[tMove, { x: BX + 960, y: 540, z: 1 }, 1.0, { g: 0.45 }], [null, { z: 1.03 }, Math.max(1, T('o12') - tMove - 1.4), { ease: 'none', sfx: false }]]);
  wipe(srv, tMove + 0.35, { dir: 't', d: 0.5 }); appear(srvT, tMove + 0.6); wipe(srvRef, T('o8', 'My') - 0.1, { dir: 'l', d: 0.6 });
  slam(eng, tO8 + 0.2, { from: 1.2 }); sfx('thud', tO8 + 0.25, { g: 0.6 });
  wipe(fileB, tO8 + 0.5, { dir: 't', d: 0.5 });
  apps.forEach((a, i) => slide(a, tO9 + 0.1 + i * 0.15, { x: -80, d: 0.55, ease: 'power3.out' }));
  linesB.forEach((p, i) => { drawIn(p, T('o9', '连接') - 0.2 + i * 0.15, 0.45); sfx('tick', T('o9', '连接') + i * 0.15, { g: 0.5, p: -0.5 }); });
  drawIn(srvFile, tO9 + 0.6, 0.4);
  // 嵌入：从服务端的引擎里分出一份，落进下方的应用程序
  wipe(appE, tO10 - 0.1, { dir: 'l', d: 0.6 }); appear(appET, tO10 + 0.2);
  const eng2 = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:56px;margin-right:16px">引擎', BX + 660, 360, 480, 96, { fontSize: '40px', outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  eng2.dataset.name = '引擎（嵌入）';
  const tDrop = T('o10', '嵌进') - 0.3;
  appear(eng2, tDrop);
  tl.fromTo(eng2, { y: 0 }, { y: 380, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, tDrop);
  sfx('thud', tDrop + 0.78, { g: 0.7 });
  drawIn(embFile, T('o11', '读写') - 0.1, 0.6); sfx('blip', T('o11', '读写') + 0.3, { g: 0.5, p: 0.5 });
  // 不必另开服务：服务端收起，只留虚线外框
  const ghost = blk(world, '', '', BX + 620, 190, 560, 300, { outline: '4px dashed ' + C.g3, outlineOffset: '-4px' }); ghost.dataset.name = '不必另开的服务';
  const ghostL = tx(world, 't4', '不必另开服务', BX + 660, 310, { color: C.g4 });
  const tNo = T('o11', '不必');
  [srvRef, srvT, eng].forEach((e) => vanish(e, tNo + 0.42));
  wipeOut(srv, tNo, { dir: 't', d: 0.42 }); appear(ghost, tNo + 0.1); wipe(ghostL, tNo + 0.35, { dir: 'l', d: 0.4 });
  to(srvFile, tNo, { opacity: 0.15, duration: 0.5 }); linesB.forEach((p) => to(p, tNo, { opacity: 0.15, duration: 0.5 }));
  sfx('tick', tNo + 0.1, { g: 0.5 });

  // ── o12：路线——来自哪里（01）、怎样实现（02–06），箭头指向导航页签 ──
  const tO12 = T('o12');
  const veil = blk(world, '', '', BX - 100, 84, 2120, 900, { background: C.page, zIndex: 7 }); veil.dataset.overlapOk = '1';
  const core = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:84px;margin-right:24px">Firebird 引擎', BX + 560, 400, 800, 150,
    { fontSize: '64px', fontWeight: 700, outline: '5px solid ' + C.ink, outlineOffset: '-5px', zIndex: 8 });
  core.dataset.name = '引擎';
  const q1 = tx(world, 't2', '来自哪里', BX + 300, 690, { fontWeight: 700, zIndex: 8 });
  const q2 = tx(world, 't2', '怎样实现', BX + 1400, 690, { fontWeight: 700, zIndex: 8 });
  const top = layer(world, 5760, 1080, 9);
  cam.track(tO12 - 0.2, { x: BX + 960, y: 540, z: 1.03 }, [[tO12 - 0.2, { z: 1 }, 0.6, { sfx: false }], [null, { y: 548 }, Math.max(1, s.end - tO12 - 0.6), { ease: 'none', sfx: false }]]);
  tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.45, immediateRender: true }, tO12 - 0.15);
  slam(core, tO12 + 0.25, { from: 1.12, d: 0.45 }); sfx('thud', tO12 + 0.3, { g: 0.6 });
  const tb = (window.BAR ? window.BAR.tabs : []).map((e) => box(e));
  const tQ1 = T('o12', '来自'), tQ2 = T('o12', '怎样');
  wipe(q1, tQ1 - 0.25, { dir: 'l', d: 0.45 }); wipe(q2, tQ2 - 0.25, { dir: 'l', d: 0.45 });
  if (tb.length > 6) {
    const t1x = tb[1].x + tb[1].w / 2, a0 = tb[2].x + 12, a1 = tb[6].x + tb[6].w - 12, am = (a0 + a1) / 2;
    const ar1 = arrow(top, [[BX + 420, 680], [BX + 420, 250], [BX + t1x, 250], [BX + t1x, 100]], 'teal');
    const brk = arrow(top, [[BX + a0, 100], [BX + a0, 124], [BX + a1, 124], [BX + a1, 100]], 'teal', { head: false });
    const ar2 = arrow(top, [[BX + 1520, 680], [BX + 1520, 250], [BX + am, 250], [BX + am, 130]], 'teal');
    drawIn(ar1, tQ1 - 0.05, 0.6); drawIn(brk, tQ2 - 0.15, 0.45); drawIn(ar2, tQ2, 0.6);
    sfx('tick', tQ1 + 0.1, { g: 0.6, p: -0.5 }); sfx('tick', tQ2 + 0.15, { g: 0.6, p: 0.3 });
  }
});
