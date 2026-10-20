// 第 08 章：为什么选它。站 A：源头年代（POSTGRES 1986、MySQL 首版 1995）与开场折线的回响；站 B：存储层各有得失，差别在上面一层；
// 站 C：部分索引（实测 20000 行中 200 行、索引 16 KB 对主键 456 KB）、JSONB + GIN（206 行）、预约不能重叠（实测拒绝 09:30–10:30）；
// 站 D：扩展接口、许可与社区、采用路径；站 E：老底子 + 新能力，以及代价。
scene('compare', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 11000, 1100);
  const CP = D.compare, TR = D.trend.years;
  const SX = { A: 960, B: 2960, C: 4960, D: 6960, E: 8960 };

  // ── 站 A：老前辈 ──
  const ax0 = 260, ax1 = 1660, yrX = (y) => ax0 + (y - 1984) / (2028 - 1984) * (ax1 - ax0), AY = 470;
  const axis = gline(g, `M${ax0},${AY} L${ax1},${AY}`, 'line', { w: 4 });
  const pgD = gdot(g, yrX(1986), AY, 18, 'pg'), myD = gdot(g, yrX(1995), AY, 15, 'grey');
  const pgL = txt(world, 'num t-2', '1986', yrX(1986) - 70, AY - 160), pgS = txt(world, 't-4 pg', 'POSTGRES', yrX(1986) - 70, AY - 84);
  const myL = txt(world, 'num t-3 mute', '1995', yrX(1995) - 50, AY + 30), myS = txt(world, 't-s', 'MySQL 第一版', yrX(1995) - 50, AY + 96);
  const gap = gline(g, `M${yrX(1986)},${AY - 190} L${yrX(1995)},${AY - 190}`, 'pg', { w: 4, arrow: true });
  const gapT = tag(world, yrX(1986) + 110, AY - 270, '早了将近十年', 'fill');
  const nowD = gdot(g, yrX(2026), AY, 18, 'pg'), nowL = txt(world, 'num t-2', '2026', yrX(2026) - 70, AY - 160);
  const nowS = txt(world, 't-4 pg', '使用比例 ' + TR[TR.length - 1].PostgreSQL + '%，居首', yrX(2026) - 420, AY + 40);
  const qH = heading(world, 160, 740, 1600, '一个老牌数据库，为什么会在今天复兴');
  const aLogo = pgLogo(world, false); px(aLogo, 860, 130, 190, 196);
  drawIn(axis, c0 + 0.1, 0.8); pop(aLogo, T('b1') - 0.2, { from: 0.8 });
  pop(pgD, T('b1') + 0.3, { origin: 'center' }); fin(pgL, T('b1') + 0.4); fin(pgS, T('b1') + 0.5);
  pop(myD, T('b1a', '比') + 0.1, { origin: 'center' }); fin(myL, T('b1a', '比') + 0.2); fin(myS, T('b1a', '比') + 0.3);
  drawIn(gap, T('b1a', '早') - 0.2, 0.6); pop(gapT, T('b1a', '早') + 0.3); sfx('pop', T('b1a', '早') + 0.3);
  pop(nowD, T('b1b') + 0.2, { origin: 'center' }); fin(nowL, T('b1b') + 0.3); fin(nowS, T('b1b') + 0.6); sfx('thud', T('b1b') + 0.3, { g: 0.4 });
  showHeading(qH, T('b1c') - 0.1); sfx('tick', T('b1c'));

  // ── 站 B：存储层各有得失，差别在上面一层 ──
  const BX = SX.B;
  const top = blk(world, BX - 800, 300, 1600, 220, 'fill', '存储之上的功能'); txt(top, 'lbl w', '存储之上的功能 · 差别更大', 40, 30); css(top.lastChild, { fontSize: '44px' });
  const topS = txt(top, 'lbl w', '索引 · 类型 · 约束 · 扩展', 40, 120); css(topS, { fontSize: '34px', fontWeight: 500, color: '#e0ecef' });
  const bot = blk(world, BX - 800, 560, 1600, 200, 'grey', '存储层'); txt(bot, 'lbl g', '底层存储 · 两边各有得失', 40, 30); css(bot.lastChild, { fontSize: '40px' });
  const botS = txt(bot, 'lbl g', 'InnoDB 主键直达整行 · PostgreSQL 索引不背主键 · 都要清理旧版本', 40, 110); css(botS, { fontSize: '30px', fontWeight: 500 });
  fin(bot, Tend('b1c') + 0.9, { y: 30 }); fin(top, T('b6', '差') - 0.1, { y: -30 }); sfx('tick', T('b6')); sfx('pop', T('b6', '差'));

  // ── 站 C：三个具体用途 ──
  const CX = SX.C;
  const cards = [];
  const card = (x, title, ttl) => { const b = blk(world, x, 170, 500, 700, '', title); const t_ = txt(world, 't-3 pg', title, x + 30, 196); cards.push(b); return { b, t_ }; };
  const k1 = card(CX - 800, '部分索引'), k2 = card(CX - 250, 'JSONB + GIN'), k3 = card(CX + 300, '排他约束');
  // 部分索引：200 / 20000，索引大小实测
  const idxOpen = CP.indexes.find((x) => x.relname === 'jobs_open_idx'), idxPk = CP.indexes.find((x) => x.relname === 'jobs_pkey');
  const bar = blk(world, CX - 770, 330, 440, 46, 'grey', '20000 行'); const barHot = blk(world, CX - 770, 330, Math.max(6, 440 * CP.counts.open / CP.counts.total), 46, 'fill', '200 行');
  const k1a = txt(world, 'num t-4', `${CP.counts.total} 个任务`, CX - 770, 390);
  const k1b = txt(world, 'num t-4 pg', `未完成 ${CP.counts.open} 个`, CX - 770, 440);
  const k1c = psql(world, CX - 770, 520, ['CREATE INDEX …', "  WHERE status = 'open';"], { w: 440 }); css(k1c.el, { fontSize: '26px', padding: '14px 18px' });
  const k1d = txt(world, 'num t-s', `部分索引 ${Math.round(idxOpen.bytes / 1024)} KB`, CX - 770, 680);
  const k1e = txt(world, 'num t-s', `主键索引 ${Math.round(idxPk.bytes / 1024)} KB`, CX - 770, 724);
  // JSONB
  const k2a = psql(world, CX - 220, 330, ['{"kind": "alert",', ' "…": …}'], { w: 440 }); css(k2a.el, { fontSize: '28px', padding: '14px 18px' });
  const k2b = blk(world, CX - 220, 480, 440, 90, 'wash', 'GIN 索引'); txt(k2b, 'lbl mono', 'GIN：kind → alert', 22, 22); css(k2b.lastChild, { fontSize: '28px' });
  const k2c = txt(world, 'num t-4 pg', `命中 ${CP.counts.alert} 行`, CX - 220, 600);
  const k2d = txt(world, 't-s', '按文档里的字段查', CX - 220, 660);
  // 预约
  const slotX = (hh) => CX + 330 + (hh - 9) * 200;
  const sA = blk(world, slotX(9), 400, 200, 70, 'fill', '09:00–10:00'); txt(sA, 'lbl w', '09–10', 40, 12);
  const sC = blk(world, slotX(10), 400, 200, 70, 'fill', '10:00–11:00'); txt(sC, 'lbl w', '10–11', 40, 12);
  const sB = blk(world, slotX(9.5), 500, 200, 70, '', '09:30–10:30'); css(sB, { borderColor: 'var(--warn-bd)', background: 'var(--warn-bg)' }); txt(sB, 'lbl warn', '09:30–10:30', 14, 14); css(sB.lastChild, { fontSize: '28px' });
  const sT = txt(world, 't-s', '同一台设备', CX + 330, 340);
  const rej = adm(world, CX + 330, 620, 440, 'warning', '与已有预约重叠，写不进去', '拒绝');
  [k1, k2, k3].forEach((k, i) => { tl.set(k.b, { autoAlpha: 0 }, 0); });
  fin(k1.b, T('b7') - 0.3, { y: 0 }); fin(k1.t_, T('b7') - 0.2);
  fin(bar, T('b7') + 0.2, { y: 0 }); fin(k1a, T('b7') + 0.3); grow(barHot, T('b7', '未') - 0.1); fin(k1b, T('b7', '未'));
  fin(k1c.el, T('b7', '部') - 0.2, { y: 0 }); fin(k1d, T('b7', '部') + 0.6); fin(k1e, T('b7', '部') + 0.9); sfx('tick', T('b7', '部'));
  fin(k2.b, T('b8') - 0.3, { y: 0 }); fin(k2.t_, T('b8') - 0.2); fin(k2a.el, T('b8') + 0.2, { y: 0 }); fin(k2b, T('b8', 'gin') - 0.1, { y: 0 }); fin(k2c, T('b8', '按') - 0.1); fin(k2d, T('b8', '按') + 0.3); sfx('tick', T('b8', 'gin'));
  fin(k3.b, T('b9') - 0.3, { y: 0 }); fin(k3.t_, T('b9') - 0.2); fin(sT, T('b9')); fin(sA, T('b9') + 0.3, { y: 0 }); fin(sC, T('b9') + 0.6, { y: 0 });
  fin(sB, T('b9', '不') - 0.1, { y: 20 }); fin(rej, T('b10', '冲') - 0.1); sfx('error', T('b10', '冲'), { g: 0.35 });

  // ── 站 D：扩展、许可、采用路径 ──
  const DX = SX.D;
  const core = blk(world, DX - 800, 200, 700, 300, 'fill', 'PostgreSQL 内核'); txt(core, 'lbl w', 'PostgreSQL', 30, 26); css(core.lastChild, { fontSize: '48px', fontFamily: '"Open Sans"' });
  const coreS = txt(core, 'lbl w', '类型 · 运算 · 索引规则', 30, 110); css(coreS, { fontSize: '32px', fontWeight: 500, color: '#e0ecef' });
  const sockets = [0, 1, 2].map((i) => { const b = blk(world, DX - 100, 220 + i * 95, 40, 70, 'wash', '扩展接口'); return b; });
  const ext1 = blk(world, DX - 40, 215, 420, 80, 'wash', 'PostGIS'); txt(ext1, 'lbl', 'PostGIS · 地理空间', 20, 18);
  const ext2 = blk(world, DX - 40, 310, 420, 80, 'wash', 'pgvector'); txt(ext2, 'lbl', 'pgvector · 向量检索', 20, 18);
  const ext3 = blk(world, DX - 40, 405, 420, 80, 'dash', '下一个扩展'); txt(ext3, 'lbl', '……', 20, 18);
  const myNote = adm(world, DX + 420, 200, 440, 'note', 'MySQL 也支持 JSON 和空间数据', 'MySQL');
  const lic = tag(world, DX - 800, 560, 'PostgreSQL License · 宽松许可', 'fill'); const com = tag(world, DX - 380, 560, '社区维护', '');
  const dj = blk(world, DX - 800, 660, 760, 150, '', 'Django 官方教程'); txt(dj, 'lbl', 'Django 官方教程', 26, 20); const djS = txt(dj, 'lbl g', '正式项目，建议考虑 PostgreSQL', 26, 82); css(djS, { fontSize: '30px' });
  const sb = blk(world, DX + 40, 660, 760, 150, '', 'Supabase'); txt(sb, 'lbl', 'Supabase', 26, 20); const sbS = txt(sb, 'lbl g', '每个项目一个完整的 Postgres', 26, 82); css(sbS, { fontSize: '30px' });
  fin(core, Tend('b10') + 1.0, { y: 0 }); sockets.forEach((b, i) => fin(b, T('b11') + 0.3 + i * 0.1, { x: -10, y: 0 }));
  const origin = tag(world, DX - 800, 130, '1986 年的设计目标 → 今天', 'fill'); css(origin, { fontSize: '34px', padding: '12px 22px' });
  fin(origin, T('b11', '延') - 0.2, { y: -16 }); sfx('pop', T('b11', '延'));
  tl.fromTo(coreS, { color: '#e0ecef' }, { color: '#ffffff', duration: 0.4, immediateRender: false }, T('b11', '延'));
  fin(ext1, T('b13') - 0.1, { x: 60, y: 0 }); fin(ext2, T('b14') - 0.1, { x: 60, y: 0 }); sfx('pop', T('b13')); sfx('pop', T('b14'));
  fin(myNote, T('b15') - 0.1);
  fin(ext3, T('b16', '开') + 0.3, { x: 60, y: 0 });
  fin(lic, T('b17') - 0.1, { y: 0 }); sfx('tick', T('b17')); fin(com, T('b17', '社') - 0.1, { y: 0 });
  fin(dj, T('b18') - 0.1, { y: 0 }); fin(sb, T('b19') - 0.1, { y: 0 }); sfx('tick', T('b18')); sfx('tick', T('b19'));

  // ── 站 E：老底子 + 新能力；代价 ──
  const EX = SX.E;
  const old = blk(world, EX - 800, 200, 760, 300, 'grey', '老底子'); txt(old, 'lbl', '扎实的老底子', 30, 24); const oldS = txt(old, 'lbl g', '事务 · 多版本 · 预写日志', 30, 110); css(oldS, { fontSize: '34px', fontWeight: 500 });
  css(old, { borderColor: 'var(--pg)', background: 'var(--paper)' });
  const plus = txt(world, 't-1', '+', EX - 20, 290);
  const neu = blk(world, EX + 60, 200, 740, 300, 'fill', '新能力'); txt(neu, 'lbl w', '不断长出来的新能力', 30, 24); const neuS = txt(neu, 'lbl w', '索引 · 类型 · 约束 · 扩展', 30, 110); css(neuS, { fontSize: '34px', fontWeight: 500, color: '#e0ecef' });
  const why = txt(world, 't-2', '这就是很多人选择它的理由', EX - 800, 560);
  const costA = adm(world, EX - 800, 680, 760, 'caution', '代价：更新频繁的表，要管好清理', '小心');
  const costB = adm(world, EX + 40, 680, 760, 'note', '已经在用 MySQL：换之前要实际测过', '迁移');
  fin(old, Tend('b19a') + 0.9, { y: 0 }); fin(plus, T('b20', '加') - 0.1); fin(neu, T('b20', '加'), { y: 0 });
  fin(why, T('b20a') + 0.1); sfx('chime', T('b20a') + 0.2, { g: 0.4 });
  fin(costA, T('b22') + 0.1); fin(costB, T('b23') + 0.1); sfx('tick', T('b22') + 0.1);

  camTrack(cam, world, { t: s.start, v: { x: SX.A, y: 540, z: 1 } }, [
    [Tend('b1c') + 0.9, { x: SX.B }, 1.1, { sfx: true }],
    [Tend('b6') + 0.9, { x: SX.C }, 1.1, { sfx: true }],
    [Tend('b10') + 0.9, { x: SX.D }, 1.1, { sfx: true }],
    [Tend('b19a') + 0.9, { x: SX.E }, 1.1, { sfx: true }],
  ], { end: s.end });
});
