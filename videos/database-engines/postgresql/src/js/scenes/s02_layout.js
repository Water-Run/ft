// 02 一张表放在哪：文件与堆（T1–T3）→ 三棵 B 树，叶子里是键与地址（T4–T7）→ 对照 InnoDB（T9）
scene('layout', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('l11') + 0.5, tC = Tend('l20b') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);
  const [P, LP] = D.alice.ctid;

  // ── A：一张表就是一个文件，切成 8 KB 的页 ──
  hdoc(A, 'users：一个文件，一页 8 KB', 72, 128);
  const qAsk = `<span class="p">postgres=#</span> <span class="k">SELECT</span> pg_relation_filepath('users');`;
  const q = psqlBox(A, qAsk + '\n\n\n ', 72, 206, 900);
  css(q, { fontSize: '23px' }); wipe(q, T('l1') + 0.2, { dir: 'l' }); sfx('key', T('l1') + 0.4, { g: 0.4 });
  const kq = keyed(q);
  kq.at(T('l2') + 0.2, { html: qAsk + `\n pg_relation_filepath\n----------------------\n ${D.files.users.path}` }); sfx('blip', T('l2') + 0.2, { g: 0.5, p: -0.3 });
  kq.at(T('l2', '文件'), { html: qAsk + `\n pg_relation_filepath\n----------------------\n <span class="hi">${D.files.users.path}</span>` }); sfx('tick', T('l2', '文件'), { p: 0.3 });
  const fcap = capt(A, 'users 表 = 这一个文件', 1010, 260); show(fcap, T('l2', '文件'), { x: 20 });
  keyed(fcap).at(T('l3', '8 KB'), { html: `users 表 = 这一个文件　<b>${D.files.users.sizes[D.files.users.node] / 1024} KB</b> = ${D.heap.pages} × 8 KB` });
  // 讲到「文件」时先是一整条文件，讲到「一页一页」时切成页
  const fileBar = h('div', 'abs', A); px(fileBar, 90, 470, 47 * 37 - 4, 130); css(fileBar, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' }); fileBar.dataset.name = 'users 的数据文件';
  const fileL = h('div', 'abs', fileBar, `users 的数据文件　${D.files.users.path}`); px(fileL, 24, 40); css(fileL, { font: '700 30px "Mono","Sans SC"', color: 'var(--navy)' });
  wipe(fileBar, T('l2', '文件'), { dir: 'l', d: 0.5 }); hide(fileL, T('l3', '一页一页') - 0.05, { d: 0.05 }); hide(fileBar, T('l3', '一页一页') + 0.9, { d: 0.2 });
  const strip = heapStrip(A, 90, 470, { w: 33, gap: 4, h: 130 });
  wipe(strip, T('l3', '一页一页'), { dir: 'l', d: 0.9 }); sfx('whoosh', T('l3', '一页一页'), { g: 0.4 });
  strip.pages.forEach((pg, i) => fromTo(pg.fill, T('l4') + i * 0.05, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.25, ease: 'power1.out' }));
  const c88 = capt(A, `每页 <b>88</b> 行 · 共 <b>${D.heap.pages}</b> 页 · 最后一页 ${D.heap.rows[D.heap.pages - 1]} 行`, 90, 640); show(c88, T('l5', '88'), { y: 10 });
  const heapG = glossBox(A, '堆', '<b>堆</b>：表的数据文件。行按到达的顺序放，<br>不按编号排序，哪页有空放哪页', 1010, 330, 760);
  show(heapG, T('l6', '堆') + 0.1, { x: 20 }); sfx('pop', T('l6', '堆') + 0.1, { g: 0.6 });
  const order = capt(A, '1 号 → 2 号 → … → 4096 号，谁先来谁在前', 90, 690); show(order, T('l6b'), { y: 10 });
  // Alice：第 23 页、第 26 项
  classAt(strip.pages[P], 'hl', T('l8', '23'));
  const zoom = h('div', 'page', A); px(zoom, 1240, 700, 540, 220); zoom.dataset.name = '第 23 页放大';
  const rowsGrid = [];
  for (let r = 0; r < 88; r++) { const c = h('div', 'abs', zoom); px(c, 12 + (r % 22) * 23.5, 14 + Math.floor(r / 22) * 46, 20, 38); css(c, { background: r + 1 === LP ? 'var(--pg)' : 'var(--sky-lt)', border: '1.5px solid var(--pg)' }); rowsGrid.push(c); }
  const zl = capt(A, `第 ${P} 页（${D.heap.first[P]}–${D.heap.first[P] + 87} 号）`, 1240, 654);
  wipe(zoom, T('l8', '23') + 0.2, { dir: 't' }); show(zl, T('l8', '23') + 0.3, { y: 10 }); sfx('tick', T('l8', '23') + 0.2);
  const ov = overlay(A); const sp = rowSpot(strip, P, LP, 130);
  const zarr = curve(ov, [90 + sp.x, 470 + 130], [1240 + 12 + ((LP - 1) % 22) * 23.5 + 10, 700], 'navy', { bend: 680 });
  arrowIn(zarr, T('l9', '26'), 0.5);
  const lp26 = capt(A, `第 ${LP} 项：2050 号 Alice`, 1250, 930); css(lp26, { color: 'var(--pg)', fontWeight: 700 }); show(lp26, T('l9', '26') + 0.3, { y: -6 });
  const ctidG = glossBox(A, 'ctid', `<b>ctid</b>：行的地址 =（页号, 页内第几项）<br><span class="mono" style="font-size:40px;color:var(--pg);font-weight:700">(${P},${LP})</span>`, 90, 760, 760);
  show(ctidG, T('l10', '地址'), { y: 16 }); sfx('pop', T('l11', 'ctid'));

  // ── B：三个索引，三棵 B 树 ──
  hdoc(B, '三个索引：三个文件，各是一棵 B 树', 72, 128);
  const ovB = overlay(B);
  const Tr = D.trees;
  const pk = btree(B, ovB, 120, 250, 1000, Tr.users_pkey.leafCount, { leafW: 70, rootW: 160, name: '主键树' });
  const ag = btree(B, ovB, 1330, 250, 470, Tr.idx_age.leafCount, { leafW: 70, rootW: 140, name: '年龄树' });
  const strip2 = heapStrip(B, 90, 470, { w: 33, gap: 4, h: 100, labels: [0, P, 46] });
  const nm = btree(B, ovB, 90, 720, 1740, Tr.idx_name.leafCount, { leafW: 40, rootW: 160, dy: -110, name: '姓名树' });
  // 姓名树倒过来画（根在下，叶子朝上靠近堆），这里把根挪到叶子下面
  px(nm.root, 90 + 870 - 80, 840, 160); nm.edges.forEach((e) => e.remove());
  const nmEdges = nm.leaves.map((lf, i) => path(ovB, `M${90 + 870 + (i - 19) * 4},${840} L${nm.leafX(i)},${650}`, 'dim', { w: 1.5, arrow: false }));
  const lab = (t, x, y) => { const e = capt(B, t, x, y); return e; };
  const lpk = lab(`<b>主键树</b>　一个根 · ${Tr.users_pkey.leafCount} 页叶子`, 120, 204);
  const lag = lab(`<b>年龄树</b>　${Tr.idx_age.leafCount} 页叶子`, 1330, 204);
  const lnm = lab(`<b>姓名树</b>　一个根 · ${Tr.idx_name.leafCount} 页叶子`, 1100, 850);
  const grow = (tree, t0, edges) => {
    slam(tree.root, t0, { from: 1.3 });
    edges.forEach((e, i) => draw(e, t0 + 0.15 + i * 0.01, 0.3));
    tree.leaves.forEach((lf, i) => show(lf, t0 + 0.2 + i * 0.012, { y: 10, d: 0.2 }));
  };
  wipe(strip2, T('l12'), { dir: 'l', d: 0.6 });
  grow(pk, T('l14'), pk.edges); show(lpk, T('l14'), { x: -10 }); sfx('pop', T('l14'), { g: 0.5 });
  grow(nm, T('l15'), nmEdges); show(lnm, T('l15'), { x: -10 }); sfx('pop', T('l15'), { g: 0.5 });
  const sz = noteBox(B, `<b>一项的大小</b>　编号 ${Tr.users_pkey.aliceItem.len} 字节 · 姓名 ${Tr.idx_name.aliceItem.len} 字节`, 1010, 412, 620); show(sz, T('l15b', '64'), { y: 10 });
  hide(sz, Tend('l16') + 0.2, { d: 0.3 });
  grow(ag, T('l16'), ag.edges); show(lag, T('l16'), { x: -10 }); sfx('pop', T('l16'), { g: 0.5 });
  const post = noteBox(B, `<b>42 岁</b>　一项里装着 ${D.agePosting.count} 个地址`, 1330, 412, 470); show(post, T('l17', '合成一项'), { y: 10 });
  hide(post, T('l18') - 0.15, { d: 0.25 });
  // 叶子里的键与地址，指向第 23 页
  const pkLeaf = pk.leaves[Tr.users_pkey.aliceLeafPos], nmLeaf = nm.leaves[Tr.idx_name.aliceLeafPos];
  classAt(pkLeaf, 'hl', T('l19', '2050')); classAt(nmLeaf, 'hl', T('l20', 'Alice'));
  const pageX = 90 + P * 37 + 16;
  const a1 = curve(ovB, [pk.leafX(Tr.users_pkey.aliceLeafPos), pk.leafY], [pageX, 470], 'accent', { bend: 420 });
  const a2 = curve(ovB, [nm.leafX(Tr.idx_name.aliceLeafPos), 610], [pageX, 574], 'accent', { bend: 590 });
  const k1 = h('div', 'tag', B, `2050 → (${P},${LP})`); px(k1, pk.leafX(Tr.users_pkey.aliceLeafPos) + 40, 414);
  const k2 = h('div', 'tag', B, `Alice → (${P},${LP})`); px(k2, 150, 690);
  classAt(strip2.pages[P], 'hl', T('l19', '23'));
  arrowIn(a1, T('l19', '23'), 0.5); show(k1, T('l19', '23') + 0.2, { y: -8 }); sfx('tick', T('l19', '23'));
  arrowIn(a2, T('l20', '这个地址'), 0.5); show(k2, T('l20', '这个地址') + 0.2, { y: 8 }); sfx('tick', T('l20', '这个地址'));
  const leafNote = noteBox(B, '<b>叶子里</b>　键 → 行的地址', 1330, 412, 470); show(leafNote, T('l18'), { y: 10 });
  const fetch = tagEl(B, '按地址去堆里取行', pageX + 40, 410, 'navy'); show(fetch, T('l20b', '取行'), { x: -10 }); sfx('pop', T('l20b', '取行'), { g: 0.6 });

  // ── C：对照 InnoDB ──
  hdoc(C, '两种做法', 72, 128);
  const ovC = overlay(C);
  // 左：InnoDB（中性灰）：表就是主键树
  const li = tagEl(C, 'InnoDB', 72, 196, 'grey'); css(li, { fontSize: '34px' });
  const DG = { background: '#5f6a73', color: '#fff', borderColor: '#5f6a73', height: '56px', lineHeight: '51px', fontSize: '26px' };
  const ir = h('div', 'node grey', C, '主键树的根'); px(ir, 280, 262, 300); css(ir, DG);
  const il = [];
  for (let i = 0; i < 6; i++) { const e = h('div', 'node grey', C, '整行'); px(e, 90 + i * 128, 400, 112); il.push(e); path(ovC, `M430,310 L${146 + i * 128},400`, 'grey', { w: 2, arrow: false }); }
  const inr = h('div', 'node grey', C, '姓名索引'); px(inr, 110, 596, 240); css(inr, DG);
  const inl = h('div', 'node grey', C, 'Alice → 主键 2050'); px(inl, 90, 700, 340); css(inl, DG);
  const whole = h('div', 'abs', C, '叶子里装着整行：编号 · 姓名 · 年龄'); px(whole, 90, 466, 752); css(whole, { background: '#5f6a73', color: '#fff', font: '700 26px "Sans SC"', padding: '10px 18px' });
  const iarr = curve(ovC, [430, 728], [530, 440], 'grey', { bend: 600 });
  const itxt = tagEl(C, '先拿到主键，再查一遍主键树', 470, 640, 'grey'); css(itxt, { fontSize: '28px' });
  show(li, T('l21'), { x: -20 });
  wipe(ir, T('l22') + 0.4, { dir: 'l' }); il.forEach((e, i) => show(e, T('l22', '主键树') + 0.1 + i * 0.05, { y: 10 }));
  sfx('pop', T('l22b', '整行'), { g: 0.5, p: -0.4 });
  wipe(whole, T('l22b', '整行'), { dir: 'l' });
  wipe(inr, T('l23'), { dir: 'l' }); wipe(inl, T('l23b'), { dir: 'l' });
  arrowIn(iarr, T('l23b', '主键树') - 0.3, 0.5); show(itxt, T('l23b', '主键树') - 0.3, { y: 8 });
  // 右：PostgreSQL：堆与三个独立的索引
  const lpg = tagEl(C, 'PostgreSQL', 1000, 196); css(lpg, { fontSize: '34px' });
  const hp = h('div', 'abs', C); px(hp, 1000, 560, 840, 120); hp.dataset.name = '堆';
  for (let i = 0; i < 20; i++) { const pg = h('div', 'pg-mini', hp); px(pg, i * 42, 0, 36, 120); }
  const hpl = capt(C, '堆：整行都在这里', 1000, 690);
  const idx = [['主键索引', 1010], ['姓名索引', 1290], ['年龄索引', 1570]].map(([n, x]) => { const e = h('div', 'node', C, n); px(e, x, 300, 240); return e; });
  const parr = idx.map((e, i) => curve(ovC, [1130 + i * 280, 340], [1180 + i * 260, 560], 'accent', { bend: 450 }));
  show(lpg, T('l24'), { x: 20 }); wipe(hp, T('l24') + 0.1, { dir: 'r' }); show(hpl, T('l24', '整行'), { y: 8 });
  idx.forEach((e, i) => slam(e, T('l25', '每个索引') + i * 0.12, { from: 1.2 }));
  parr.forEach((a, i) => arrowIn(a, T('l25', '地址') + i * 0.1, 0.4));
  sfx('pop', T('l25', '地址'), { p: 0.4 });
  const same = tagEl(C, '主键索引也一样', 1010, 380); show(same, T('l25', '主键索引'), { y: -8 }); sfx('tick', T('l25', '主键索引'), { p: 0.4 });
});
