// 第 02 章 一张表的引擎：建表时的 ENGINE → MySQL 也要挑 → 84 种 → 多数你碰不到 → 存数据几乎都是 MergeTree → 不写也是它 → 合并树。
scene('engine', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const grp = () => { const g = mk(world, '', 0, 0, 1920, 1080); vanish(g, 0); return g; };
  const [A, B, C, D] = [grp(), grp(), grp(), grp()];

  // ── A 建表的最后写上 ENGINE；MySQL 也要挑 ──
  appear(A, c0 + 0.05);
  const tm = termAt(A, 100, 190, 1100, 270);
  const tE = T('e1', '引擎') - 0.1;
  tm.line(0, '<span class="pr">:) </span>CREATE TABLE users', c0 + 0.15, { type: 40, cursor: false });
  tm.line(1, '    (id UInt32, name String, age UInt8)', c0 + 0.9, { type: 46, cursor: false });
  tm.line(2, 'ENGINE = MergeTree', c0 + 1.6, { type: 30, cursor: false });
  tm.line(3, 'ORDER BY id;', c0 + 2.3, { type: 30, cursorUntil: c0 + 3.2 });
  classAt(tm.rows[2], 'y', T('e1', 'engine'), T('e2') + 0.2);
  const lab1 = mk(A, 'lab y', 100, 140, null, null, 'ClickHouse'); appear(lab1, c0 + 0.1);
  const g1 = glossAt(A, 1260, 230, 560, '表引擎', '<b>表引擎</b>　每张表自己的 ENGINE：决定这张表的数据怎样存、存在哪里，怎样读写'); show(g1, T('e1', '表引擎') - 0.1, { y: 16, d: 0.35 });
  // MySQL：要挑一个
  const my = termAt(A, 100, 590, 1100, 130);
  vanish(my.el, 0); appear(my.el, T('e2', 'MySQL') - 0.15);
  const lab2 = mk(A, 'lab', 100, 540, null, null, 'MySQL'); appear(lab2, T('e2', 'MySQL') - 0.1);
  my.line(0, '<span class="pr">mysql&gt; </span>CREATE TABLE t (…)', T('e2', 'MySQL'), { type: 34, cursor: false });
  const eng = my.line(1, '', T('e2'), {});
  const engEl = my.rows[1]; css(engEl, { left: '22px' });
  keyed(engEl).at(T('e2', 'MyISAM'), { html: 'ENGINE = <span class="y">MyISAM</span>;' }).at(T('e2', 'InnoDB'), { html: 'ENGINE = <span class="y">InnoDB</span>;' });
  sfx('tick', T('e2', 'MyISAM'), { g: 0.5 }); sfx('tick', T('e2', 'InnoDB'), { g: 0.5 });
  const mn = noteAt(A, 1260, 600, '存表的两种做法\n要你挑一个'); show(mn, T('e2', 'InnoDB') - 0.2, { y: 14 });
  warm(tm.el, T('e1'), T('e2')); warm(my.el, T('e2'), T('e3') - 0.2);
  const tB = Math.min(T('e3') + 1.0, T('e3', '八十四') - 1.2);
  vanish(A, tB);

  // ── B 84 种表引擎的格子 ──
  appear(B, tB);
  const hdr = mk(B, 'h1', 60, 130, null, null, '26.8 的表引擎'); wipe(hdr, tB + 0.05, { dir: 'l', d: 0.5 });
  const n84 = mk(B, 'big y', 1380, 100, null, null, '0'); css(n84, { fontSize: '150px' }); appear(n84, T('e3', '八十四') - 0.05); countTo(n84, 0, 84, T('e3', '八十四') - 0.05, 0.9);
  const all = ENGINES.mt.map((n) => [n, 1]).concat(ENGINES.other.map((n) => [n, 0]));
  const tiles = [];
  const X0 = 130, Y0 = 250, TW = 128, TH = 76, GX = 8, GY = 8;
  all.forEach(([n, mt], i) => {
    const e = mk(B, 'cell' + (mt ? ' y' : ''), X0 + (i % 12) * (TW + GX), Y0 + Math.floor(i / 12) * (TH + GY), TW, TH, '');
    tiles.push({ e, n, mt }); wipe(e, tB + 0.2 + (i % 12) * 0.04 + Math.floor(i / 12) * 0.09, { dir: 'l', d: 0.3 });
  });
  sfx('riser', T('e3', '八十四') - 1.0, { g: 0.5 }); sfx('thud', T('e3', '八十四') + 0.9, { g: 0.6 });
  const lbl = (name, t, y_) => { const idx = all.findIndex((a) => a[0] === name); const tp = tiles[idx]; const p = mk(B, 'pill y', 130, 886, 300, 56, name); css(p, { left: Math.max(60, Math.min(1560, X0 + (idx % 12) * (TW + GX) - 80)) + 'px' }); appear(p, t); vanish(p, t + 2.4); classAt(tp.e, 'on', t, t + 2.4); sfx('pop', t, { g: 0.5 });
    const cx = X0 + (idx % 12) * (TW + GX) + TW / 2, cb = Y0 + Math.floor(idx / 12) * (TH + GY) + TH; const ln = mk(B, 'abs', cx - 1, cb, 3, 886 - cb); css(ln, { background: 'var(--y)' }); vanish(ln, 0); appear(ln, t); vanish(ln, t + 2.4);
    css(p, { left: Math.max(60, Math.min(1560, cx - 150)) + 'px' }); };
  const mtl = mk(B, 'pill y', 1180, 886, 640, 56, 'MergeTree 家族 16 种'); css(mtl, { left: '60px' }); appear(mtl, T('e4b') - 0.1); vanish(mtl, T('e4b', '分到') - 0.1);
  lbl('Distributed', T('e4b', '分到'), 0); lbl('MySQL', T('e4c', 'My S Q L'), 0); lbl('Kafka', T('e4c', 'Kafka'), 0);
  // 真正存数据的几乎都是 MergeTree：别的淡下去
  const tOnly = T('e5');
  tiles.filter((x) => !x.mt).forEach((x) => to(x.e, tOnly, { opacity: 0.16, duration: 0.5 }));
  const big = mk(B, 'tag', 360, 400, null, null, 'MergeTree'); slam(big, T('e5b', 'Merge Tree'), { from: 1.3 }); sfx('thud', T('e5b', 'Merge Tree') + 0.1);
  const g2 = glossAt(B, 360, 560, 1200, 'MergeTree', '<b>MergeTree</b>　存数据的主力；名字带 MergeTree 的共 16 种'); show(g2, T('e5') + 0.3, { y: 14 });
  const skipN = ['Distributed', 'MySQL', 'Kafka'], sa = tB + 1.0, sb = T('e4b') - 0.1;
  tiles.forEach((x) => { if (x.mt) classAt(x.e, 'on', T('e4b') - 0.1, T('e4b', '分到') - 0.1); });
  const tC = T('e6') + 0.6;
  vanish(B, tC);

  // ── C 建表时不写引擎，给你的就是它 ──
  appear(C, tC); css(C, { top: '90px' });
  const t2 = termAt(C, 60, 230, 1500, 270);
  const tOut = Math.max(T('e6', '给你的'), tC + 1.9);
  t2.line(0, '<span class="pr">:) </span>CREATE TABLE demo.noengine (id UInt32, name String, age UInt8) ORDER BY id;', tC + 0.05, { type: 80, cursor: false });
  t2.line(1, '<span class="pr">:) </span>SELECT engine FROM system.tables WHERE name = \'noengine\';', tC + 1.1, { type: 80, cursorUntil: tOut + 0.5 });
  t2.line(2, '<span class="out">MergeTree</span>', tOut, {});
  const dm = mk(C, 'h2 y', 60, 560, null, null, '不写 ENGINE，缺省就是 MergeTree'); show(dm, tOut + 0.3, { y: 16 }); sfx('chime', tOut + 0.05, { g: 0.6 });
  const dm2 = noteAt(C, 60, 640, '它自己的日志表 query_log、part_log\n也都是 MergeTree'); show(dm2, tOut + 0.4, { y: 16 });
  vanish(C, T('e8') - 0.2);

  // ── D MergeTree = Merge + Tree ──
  appear(D, T('e8') - 0.2);
  const w1 = mk(D, 'huge', 100, 300, null, null, 'Merge'); css(w1, { fontSize: '300px' });
  const w2 = mk(D, 'huge y', 1010, 300, null, null, 'Tree'); css(w2, { fontSize: '300px' });
  slam(w1, T('e8', 'Merge Tree') - 0.1, { from: 1.15 }); slam(w2, T('e8', 'Merge Tree') + 0.3, { from: 1.15 }); sfx('thud', T('e8', 'Merge Tree') + 0.05, { g: 0.7 });
  const z1 = mk(D, 'h1', 130, 640, null, null, '合并'), z2 = mk(D, 'h1 y', 1040, 640, null, null, '树'); css(z1, { fontSize: '88px' }); css(z2, { fontSize: '88px' });
  wipe(z1, T('e8', '合并树'), { dir: 'l', d: 0.5 }); wipe(z2, T('e8', '合并树') + 0.3, { dir: 'l', d: 0.5 });
  const q8 = mk(D, 'q', 130, 800, null, null, '为什么叫这个名字？'); wipe(q8, T('e8b'), { dir: 'l', d: 0.6 });
  drift(cam, s, 1);
});
