// 第 02 章 一张表的引擎：建表时的 ENGINE → MySQL 也要挑 → 84 种 → 多数你碰不到 → 存数据几乎都是 MergeTree → 不写也是它 → 合并树。
scene('engine', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const grp = () => { const g = mk(world, '', 0, 0, 1920, 1080); vanish(g, 0); return g; };
  const [A, B, C, D] = [grp(), grp(), grp(), grp()];

  // ── A 建表的最后写上 ENGINE；MySQL 也要挑 ──
  appear(A, c0 + 0.05);
  const tm = termAt(A, 100, 190, 1100, 290);
  const tE = T('e1', '引擎') - 0.1;
  tm.line(0, '<span class="pr">:) </span>CREATE TABLE users', c0 + 0.15, { type: 40, cursor: false });
  tm.line(1, PR2 + '(id UInt32, name String, age UInt8)', c0 + 0.9, { type: 46, cursor: false });
  tm.line(2, PR2 + 'ENGINE = MergeTree', c0 + 1.6, { type: 30, cursor: false });
  tm.line(3, PR2 + 'ORDER BY id;', c0 + 2.3, { type: 30, cursorUntil: c0 + 3.0 });
  tm.line(4, '<span class="out">Ok.</span>', c0 + 3.1, {}); tm.line(5, '<span class="out">0 rows in set.</span>', c0 + 3.1, {});
  classAt(tm.rows[2], 'y', T('e1', 'engine'), T('e2') + 0.2);
  const lab1 = mk(A, 'lab y', 100, 140, null, null, 'ClickHouse'); appear(lab1, c0 + 0.1);
  const fadeIn2 = (e, t) => show(e, t, { y: 12, d: 0.4 });
  const g1 = glossAt(A, 1260, 230, 560, '表引擎', '<b>表引擎</b>　每张表自己的 ENGINE：决定这张表的数据怎样存、存在哪里，怎样读写'); show(g1, T('e1', '表引擎') - 0.1, { y: 16, d: 0.35 });
  // MySQL：要挑一个
  const my = termAt(A, 100, 590, 1100, 130);
  vanish(my.el, 0); appear(my.el, T('e2', 'MySQL') - 0.15);
  const lab2 = mk(A, 'lab', 100, 540, null, null, 'MySQL'); appear(lab2, T('e2', 'MySQL') - 0.1);
  my.line(0, '<span class="pr">mysql&gt; </span>CREATE TABLE t (…)', T('e2', 'MySQL'), { type: 34, cursor: false });
  const eng = my.line(1, '', T('e2'), {});
  const engEl = my.rows[1]; css(engEl, { left: '22px' });
  keyed(engEl).at(T('e2', 'MyISAM'), { html: '<span class="pr">    -&gt; </span>ENGINE = <span class="y">MyISAM</span>;' }).at(T('e2', 'InnoDB'), { html: '<span class="pr">    -&gt; </span>ENGINE = <span class="y">InnoDB</span>;' });
  sfx('tick', T('e2', 'MyISAM'), { g: 0.5 }); sfx('tick', T('e2', 'InnoDB'), { g: 0.5 });
  // MyISAM、InnoDB 两张小卡片并排：各自出现后都留着（两种存法摆在一起比）
  [['MyISAM', '索引、数据各一个文件', 0, 'MyISAM'], ['InnoDB', '按主键排好的一棵树', 1, 'InnoDB']].forEach(([nm, sub, k, w], i) => {
    const t0 = T('e2', w) - 0.2, bx = mk(A, 'tile', 1260 + i * 290, 500, 270, 360); vanish(bx, 0); show(bx, t0, { y: 14, d: 0.35 });
    mk(bx, 'nm', 20, 18, null, null, nm).style.fontSize = '36px';
    const st = mk(bx, 't-note', 20, 66, 236, null, sub); css(st, { fontSize: '24px', whiteSpace: 'normal', lineHeight: '1.35' });
    const sw = mk(bx, '', 54, 134, 320, 380); css(sw, { transform: 'scale(0.5)', transformOrigin: '0 0' }); engineStruct(sw, k, t0 + 0.2, { labels: false });
    classAt(bx, 'y', T('e2', w) - 0.1, T('e2', w) + 1.2);
  });
  const stT = mk(A, 'lab y', 1260, 876, null, null, '存表的两种做法'); fadeIn2(stT, T('e2b') - 0.2);
  warm(tm.el, T('e1'), T('e2')); warm(my.el, T('e2'), T('e3') - 0.2);
  const tB = Math.min(T('e3') + 1.0, T('e3', '八十四') - 1.2);
  vanish(A, tB);

  // ── B 84 种表引擎的格子 ──
  appear(B, tB);
  const hdr = mk(B, 'h1', 100, 130, null, null, '26.8 的表引擎'); wipe(hdr, tB + 0.05, { dir: 'l', d: 0.5 });
  const n84 = mk(B, 'big y', 1380, 100, null, null, '0'); css(n84, { fontSize: '150px' }); appear(n84, T('e3', '八十四') - 0.05); countTo(n84, 0, 84, T('e3', '八十四') - 0.05, 0.9);
  const all = ENGINES.mt.map((n) => [n, 1]).concat(ENGINES.other.map((n) => [n, 0]));
  const tiles = [];
  const X0 = 130, Y0 = 250, TW = 128, TH = 76, GX = 8, GY = 8;
  all.forEach(([n, mt], i) => {
    const e = mk(B, 'cell' + (mt ? ' y' : ''), X0 + (i % 12) * (TW + GX), Y0 + Math.floor(i / 12) * (TH + GY), TW, TH, '');
    tiles.push({ e, n, mt }); wipe(e, tB + 0.2 + (i % 12) * 0.04 + Math.floor(i / 12) * 0.09, { dir: 'l', d: 0.3 });
  });
  sfx('riser', T('e3', '八十四') - 1.0, { g: 0.5 }); sfx('thud', T('e3', '八十四') + 0.9, { g: 0.6 });
  const lbl = (name, t, extra = '') => { const idx = all.findIndex((a) => a[0] === name); const tp = tiles[idx]; const p = mk(B, 'pill y', 130, 886, null, 56, name + extra); css(p, { gap: '10px' }); css(p, { left: Math.max(60, Math.min(1560, X0 + (idx % 12) * (TW + GX) - 80)) + 'px' }); const tEnd = T('e5') - 0.1; /* 三个标签都留到「真正存数据的」那一句（位置不冲突，不必先撤） */ appear(p, t); vanish(p, tEnd); classAt(tp.e, 'on', t, tEnd); sfx('pop', t, { g: 0.5 });
    const cx = X0 + (idx % 12) * (TW + GX) + TW / 2, cb = Y0 + Math.floor(idx / 12) * (TH + GY) + TH; const ln = mk(B, '', cx - 1, cb, 3, 886 - cb); css(ln, { background: 'var(--y)' }); vanish(ln, 0); appear(ln, t); vanish(ln, tEnd);
    css(p, { left: Math.max(60, Math.min(1380, cx - 150)) + 'px' }); };
  const mtl = mk(B, 'pill y', 1180, 886, null, 56, 'MergeTree 家族 16 种'); css(mtl, { left: '60px' }); appear(mtl, T('e4b') - 0.1); vanish(mtl, T('e4b', '帮着') - 0.1);
  const SV3 = ' →' + [0, 1, 2].map(() => icoSvg('server', 30, 3.4)).join('');
  lbl('Distributed', T('e4b', '帮着'), SV3); lbl('MySQL', T('e4c', 'My S Q L'), ' →' + icoSvg('db', 30, 3.4) + '<span style="font-size:22px;margin-left:16px">数据在那边</span>'); lbl('Kafka', T('e4c', 'Kafka'), ' →' + icoSvg('log', 30, 3.4) + '<span style="font-size:22px;margin-left:16px">数据在那边</span>');
  // 真正存数据的几乎都是 MergeTree：别的淡下去
  const tOnly = T('e5');
  tiles.filter((x) => !x.mt).forEach((x, i) => tl.to(x.e, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: 'power2.in' }, tOnly + (i % 12) * 0.02 + Math.floor(i / 12) * 0.05));
  const big = mk(B, 'tag', X0, 470, null, null, 'MergeTree'); css(big, { fontSize: '64px' }); vanish(big, 0); slam(big, T('e5b', 'Merge Tree'), { from: 1.3 }); sfx('thud', T('e5b', 'Merge Tree') + 0.1);
  const g2 = glossAt(B, X0, 620, 1100, 'MergeTree', '<b>MergeTree</b>　ClickHouse 把数据存进自己磁盘、拿来分析的表引擎；留下的这 16 种都是它的变体'); show(g2, T('e5') + 0.4, { y: 14 });
  const skipN = ['Distributed', 'MySQL', 'Kafka'], sa = tB + 1.0, sb = T('e4b') - 0.1;
  const onA = T('e4b') - 0.1, onB = T('e4b', '帮着') - 0.1, onC = T('e5b', 'Merge Tree') - 0.1;
  tiles.forEach((x) => { if (x.mt) F((t) => x.e.classList.toggle('on', (t >= onA && t < onB) || t >= onC)); });
  const tC = T('e6') - 0.1;
  vanish(B, tC);

  // ── C 建表时不写引擎，给你的就是它 ──
  appear(C, tC);
  const t2 = termAt(C, 100, 200, 1500, 372);
  const tOut = Math.max(T('e6', '给你的'), tC + 1.5);
  t2.line(0, '<span class="pr">:) </span>CREATE TABLE demo.noengine (id UInt32, name String, age UInt8) ORDER BY id;', tC + 0.05, { type: 170, cursor: false });
  t2.line(1, '<span class="out">Ok.</span>', tC + 0.6, {}); t2.line(2, '<span class="out">0 rows in set.</span>', tC + 0.6, {});
  t2.line(3, '<span class="pr">:) </span>SELECT engine FROM system.tables WHERE name = \'noengine\';', tC + 0.7, { type: 170, cursorUntil: tOut });
  printAt(t2, 4, pretty([{ name: 'engine', values: ['MergeTree'] }]), tOut); t2.line(7, '<span class="out">1 row in set.</span>', tOut, {});
  sfx('chime', tOut + 0.05, { g: 0.6 });
  const outV = t2.rows[5].querySelector('.out'); F((t) => { const c = t >= tOut + 0.2 ? 'var(--y)' : ''; if (outV.style.color !== c) outV.style.color = c; });
  // 看 MergeTree 就够了：它的几个部分，就是后面几章
  const mtT = mk(C, 'tag', 100, 640, null, null, 'MergeTree'); css(mtT, { fontSize: '56px' }); vanish(mtT, 0); slam(mtT, T('e7') + 0.1, { from: 1.2 });
  [['03', '一列挨一列'], ['04', '片段'], ['05', '合并'], ['06', '稀疏索引'], ['07', '改'], ['08', '删'], ['09', '同时读写'], ['10', '出错怎么办']].forEach(([no, ti], i) => {
    const c = mk(C, 'chip', 100 + (i % 4) * 380, 770 + Math.floor(i / 4) * 64, 360, 50, `<span class="mono dim" style="position:static;margin-right:12px">${no}</span>${ti}`); css(c, { fontSize: '26px' });
    vanish(c, 0); show(c, T('e7') + 0.5 + i * 0.1, { y: 12, d: 0.3 });
  });
  vanish(C, T('e8') - 0.2);

  // ── D MergeTree = Merge + Tree ──
  appear(D, T('e8') - 0.2);
  const w1 = mk(D, 'huge', 100, 300, null, null, 'Merge'); css(w1, { fontSize: '300px' });
  const w2 = mk(D, 'huge y', 1010, 300, null, null, 'Tree'); css(w2, { fontSize: '300px' });
  slam(w1, T('e8', 'Merge Tree') - 0.1, { from: 1.15 }); slam(w2, T('e8', 'Merge Tree') + 0.3, { from: 1.15 }); sfx('thud', T('e8', 'Merge Tree') + 0.05, { g: 0.7 });
  const z1 = mk(D, 'h1', 130, 640, null, null, '合并'), z2 = mk(D, 'h1 y', 1040, 640, null, null, '树'); css(z1, { fontSize: '88px' }); css(z2, { fontSize: '88px' });
  wipe(z1, T('e8', '合并树'), { dir: 'l', d: 0.5 }); wipe(z2, T('e8', '合并树') + 0.3, { dir: 'l', d: 0.5 });
  const tMg = T('e8b') - 0.2;
  [0, 1, 2].forEach((k) => { const b = mk(D, 'cell w', 360 + k * 130, 800, 110, 50, ''); motion(b, [[0, { a: 0 }], [tMg, { a: 0 }], [tMg + 0.05, { a: 1 }], [tMg + 0.6, { a: 1 }], [tMg + 1.4, { x: (1 - k) * 130 * 0.92, a: 1 }], [tMg + 1.5, { a: k === 1 ? 1 : 0 }]]); });
  const mgd = mk(D, 'cell on', 360 + 130 - 20, 800, 150, 50, ''); vanish(mgd, 0); slam(mgd, tMg + 1.45, { from: 1.3 }); sfx('thud', tMg + 1.45, { g: 0.4 });
  const ovD = overlay(D);
  const TR = [[1180, 790, 1120, 850], [1180, 790, 1240, 850], [1120, 850, 1090, 910], [1120, 850, 1150, 910], [1240, 850, 1210, 910], [1240, 850, 1270, 910]];
  TR.forEach(([x1, y1, x2, y2], k) => { const pth = path(ovD, `M ${x1} ${y1} L ${x2} ${y2}`, 'accent', { w: 4, arrow: false }); vanish(pth, 0); arrowIn(pth, tMg + 0.4 + (k >> 1) * 0.35, 0.3); });
  [[1180, 790], [1120, 850], [1240, 850], [1090, 910], [1150, 910], [1210, 910], [1270, 910]].forEach(([x, y], k) => { const n = mk(D, '', x - 9, y - 9, 18, 18); css(n, { background: 'var(--y)' }); vanish(n, 0); appear(n, tMg + 0.4 + (k === 0 ? 0 : k < 3 ? 0.35 : 0.7)); });
  drift(cam, s, 1);
});
