// 02 一张表放在哪：文件与堆（T1–T3）→ 三棵 B 树，叶子里是键与地址（T4–T7）→ 对照 InnoDB（T9）
scene('layout', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('l11') + 0.5, tC = Tend('l20b') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);
  const [P, LP] = D.alice.ctid;

  // ── A：一张表就是一个文件 → 切成 8 KB 的页 → 行按到达顺序一页页填满 → Alice 在 (23,26) ──
  hdoc(A, 'users：一个文件，一页 8 KB', 72, 128);
  const ta = term(A, 72, 196, 1100, 3, { name: 'psql 会话' });
  const e0 = ta.type(T('l1') + 0.1, `<span class="k">SELECT</span> pg_relation_filepath('users');`);
  const tRes = Math.max(e0 + 0.1, T('l2') + 0.2);
  ta.print(tRes, ' pg_relation_filepath'); ta.print(tRes + 0.12, ` <span class="hi">${D.files.users.path}</span>`); sfx('blip', tRes, { g: 0.5, p: -0.3 });
  const SX = 92, SY = 430, SW = 47 * 37 - 4, SH = 150;
  const tblChip = tagEl(A, 'users 表 · 4096 行', SX, SY + 40, 'navy'); css(tblChip, { fontSize: '34px', padding: '10px 26px' });
  show(tblChip, T('l1', '这张表') - 0.2, { y: 16 }); sfx('pop', T('l1', '这张表'), { g: 0.4 });
  to(tblChip, T('l1', '磁盘'), { y: 30, duration: 0.5, ease: 'power2.inOut' });
  hide(tblChip, T('l2', '文件') - 0.7, { d: 0.25 });
  // 结果里的路径落下来，变成一整条文件
  const tFile = T('l2', '文件');
  fly(A, D.files.users.path, [130, 296], [SX + 24, SY + 50], tFile - 0.5, { cls: 'navy', fs: 28, d: 0.5 });
  const fileBar = h('div', 'abs', A); px(fileBar, SX, SY, SW, SH); css(fileBar, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' }); fileBar.dataset.name = 'users 的数据文件';
  const fileL = h('div', 'abs', fileBar, `users 的数据文件　${D.files.users.path}`); px(fileL, 24, 50); css(fileL, { font: '700 32px "Mono","Sans SC"', color: 'var(--navy)' });
  wipe(fileBar, tFile + 0.1, { dir: 'l', d: 0.5 }); sfx('thud', tFile + 0.1, { g: 0.4 });
  // 切成页
  const tCut = T('l3', '一页一页');
  hide(fileL, tCut - 0.05, { d: 0.05 }); hide(fileBar, tCut + 0.9, { d: 0.2 });
  const strip = heapStrip(A, SX, SY, { w: 33, gap: 4, h: SH });
  wipe(strip, tCut, { dir: 'l', d: 0.9 }); sfx('whoosh', tCut, { g: 0.4 });
  const top0 = h('div', 'abs', A); px(top0, SX, SY - 16, 33, 6); css(top0, { background: 'var(--navy)' });
  const kb = capt(A, '<b>8 KB</b>', SX, SY - 58); css(kb, { fontSize: '28px', color: 'var(--navy)' });
  fromTo(top0, T('l3', '8 KB'), { scaleX: 0 }, { scaleX: 1, duration: 0.3 }); show(kb, T('l3', '8 KB'), { y: 8 }); sfx('tick', T('l3', '8 KB'));
  const tot = capt(A, `共 <b>${D.files.users.sizes[D.files.users.node] / 1024} KB</b> = ${D.heap.pages} × 8 KB`, SX + SW - 330, SY - 58); css(tot, { fontSize: '28px' });
  show(tot, T('l3', '8 KB') + 0.4, { y: 8 });
  // 行一行接一行地放进去：页一页页涂满，计数跟着走
  const tF0 = T('l4'), tF1 = T('l5', '47') + 0.2, rowsTotal = D.heap.rows.reduce((a, b) => a + b, 0);
  let acc = 0;
  strip.pages.forEach((pg, i) => { const a = tF0 + (tF1 - tF0) * acc / rowsTotal; acc += D.heap.rows[i]; const b = tF0 + (tF1 - tF0) * acc / rowsTotal; fromTo(pg.fill, a, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: Math.max(0.05, b - a), ease: 'none' }); });
  const cnt = capt(A, '', SX + SW - 330, SY + SH + 46); css(cnt, { fontSize: '28px', color: 'var(--ink)' });
  const tAll = T('l5b', '4096') + 0.3;
  F((t) => { const k = clamp((t - tF0) / (tF1 - tF0)); const r = Math.round(k * rowsTotal); cnt.innerHTML = t < tF0 - 0.05 ? '' : t >= tAll ? `<b>${rowsTotal}</b> 个用户 · <b>${D.heap.pages}</b> 页` : `已放 <b>${r}</b> 行 · <b>${Math.max(1, Math.ceil(r / 88))}</b> 页`; });
  sfx('tick', tF0, { g: 0.4 }); sfx('tick', tF1, { g: 0.5 });
  keyed(kb).at(T('l5', '88'), { html: '<b>8 KB · 88 行</b>' });
  const lastL = capt(A, `最后一页 <b>${D.heap.rows[D.heap.pages - 1]}</b> 行`, SX + SW - 520, SY - 58); css(lastL, { fontSize: '28px', color: 'var(--navy)' });
  hide(tot, T('l5', '47') - 0.2, { d: 0.2 }); show(lastL, T('l5', '47'), { y: 8 });
  // 4096 个用户都在这 47 页里：底下一道括住全部的线
  const brace = h('div', 'abs', A); px(brace, SX, SY + SH + 34, SW, 5); css(brace, { background: 'var(--pg)' });
  fromTo(brace, T('l5b', '4096'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); sfx('whoosh', T('l5b', '4096'), { g: 0.3 });
  // 这样的文件叫堆：框住整条，给出注解
  const frame = h('div', 'abs', A); px(frame, SX - 10, SY - 10, SW + 20, SH + 20); css(frame, { border: '4px solid var(--navy)' }); frame.dataset.name = '堆';
  show(frame, T('l6', '堆'), { y: 0, s: 1.02, d: 0.4 });
  const heapG = glossBox(A, '堆', '<b>堆</b>：表的数据文件。行按到达的顺序放，<br>不按编号排序，哪页有空放哪页', 1220, 690, 628);
  show(heapG, T('l6', '堆') + 0.1, { x: 20 }); sfx('pop', T('l6', '堆') + 0.1, { g: 0.6 });
  // 谁先来谁在前：上方一道从 1 号到 4096 号的箭头
  const ov = overlay(A);
  [kb, top0, lastL].forEach((e) => hide(e, T('l6b') - 0.1, { d: 0.25 }));
  const order = link(ov, [[SX + 40, SY - 30], [SX + SW - 20, SY - 30]], 'navy', { w: 4 });
  const o1 = capt(A, '1 号', SX, SY - 74), o2 = capt(A, `${rowsTotal} 号`, SX + SW - 110, SY - 74);
  [o1, o2].forEach((e) => css(e, { fontSize: '26px', color: 'var(--navy)', fontWeight: 700 }));
  arrowIn(order, T('l6b', '谁先来'), 1.0); show(o1, T('l6b', '谁先来'), { y: 8 }); show(o2, T('l6b', '谁先来') + 0.9, { y: 8 });
  // Alice 是第 2050 个：一块「2050」沿箭头走到第 23 页
  const pgX = (i) => SX + i * 37 + 16;
  const al = tagEl(A, '2050 号 Alice', SX, SY - 82, 'navy'); css(al, { fontSize: '26px' });
  set(al, 0, { autoAlpha: 0 }); set(al, T('l7') + 0.1, { autoAlpha: 1 });
  [o1, o2].forEach((e) => hide(e, T('l7'), { d: 0.2 }));
  to(al, T('l7') + 0.2, { x: pgX(P) - SX - 90, duration: Tend('l7') - T('l7'), ease: 'power1.inOut' }); sfx('whoosh', T('l7') + 0.2, { g: 0.3 });
  classAt(strip.pages[P], 'hl', T('l8', '23'));
  // 第 23 页放大：88 个位置，第 26 个是 Alice
  const zoom = h('div', 'page', A); px(zoom, SX, 700, 600, 220); zoom.dataset.name = '第 23 页放大';
  const slots = [];
  for (let r = 0; r < 88; r++) { const c = h('div', 'abs', zoom); px(c, 14 + (r % 22) * 26, 16 + Math.floor(r / 22) * 48, 22, 40); css(c, { background: 'var(--sky-lt)', border: '1.5px solid var(--pg)' }); slots.push(c); }
  const zl = capt(A, `第 ${P} 页（${D.heap.first[P]}–${D.heap.first[P] + 87} 号）`, SX, 656); css(zl, { fontSize: '26px', color: 'var(--pg)', fontWeight: 700 });
  wipe(zoom, T('l8', '23') + 0.15, { dir: 't', d: 0.45 }); show(zl, T('l8', '23') + 0.25, { y: 10 }); sfx('tick', T('l8', '23') + 0.15);
  const zarr = curve(ov, [pgX(P), SY + SH], [SX + 300, 700], 'navy', { bend: 640 }); arrowIn(zarr, T('l8', '23') + 0.1, 0.4);
  const s26 = slots[LP - 1];
  set(s26, T('l9', '26'), { background: 'var(--pg)' }); sfx('pop', T('l9', '26'));
  const sx26 = SX + 14 + ((LP - 1) % 22) * 26, sy26 = 700 + 16 + Math.floor((LP - 1) / 22) * 48;
  const l26 = tagEl(A, `第 ${LP} 项`, SX + 612, sy26); css(l26, { fontSize: '24px' }); show(l26, T('l9', '26') + 0.1, { x: -10, y: 0 });
  // 第几页、第几项 = 地址：两个数字各自飞过来拼成 (23,26)
  const AX = 850, AY = 760;
  const par = h('div', 'abs', A, `(<span style="opacity:0">${P}</span>,<span style="opacity:0">${LP}</span>)`); px(par, AX, AY); css(par, { font: '700 72px "Mono"', color: 'var(--pg)' });
  show(par, T('l10') + 0.1, { y: 0, d: 0.3 });
  const [dP, dL] = par.querySelectorAll('span');
  fly(A, String(P), [pgX(P) - 20, SY + SH + 6], [AX + 30, AY + 4], T('l10') + 0.2, { fs: 52, d: 0.6 }); set(dP, T('l10') + 0.95, { opacity: 1 });
  fly(A, String(LP), [sx26 - 10, sy26], [AX + 170, AY + 4], T('l10') + 0.7, { fs: 52, d: 0.6 }); set(dL, T('l10') + 1.45, { opacity: 1 });
  sfx('pop', T('l10') + 0.85); sfx('pop', T('l10') + 1.35, { p: 0.3 });
  const ctT = tagEl(A, 'ctid', AX, AY - 54, 'navy'); css(ctT, { fontSize: '30px' }); slam(ctT, T('l11', 'ctid'), { from: 1.3 }); sfx('thud', T('l11', 'ctid'), { g: 0.6 });
  const ctidG = glossBox(A, 'ctid', '<b>ctid</b>：行的地址 =（页号, 页内第几项）', AX, AY + 100, 500);
  show(ctidG, T('l10', '地址'), { y: 12 });

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
  // 三个索引：先是三个文件，再各自长成一棵树
  const FL = D.files, roots = [[pk.root, 120 + 500 - 80, 250], [nm.root, 90 + 870 - 80, 840], [ag.root, 1330 + 235 - 70, 250]];
  const chips = [['主键', 'users_pkey', 120], ['姓名', 'idx_name', 720], ['年龄', 'idx_age', 1320]].map(([w, k, x], i) => {
    const c = tagEl(B, `${w}索引`, x, 196, 'navy'); css(c, { fontSize: '28px' });
    show(c, T('l12', w), { y: 10 }); keyed(c).at(T('l13', '文件') + i * 0.1, { html: `${w}索引 · ${FL[k].path}` });
    to(c, T('l13b') + i * 0.1, { x: roots[i][1] - x, y: roots[i][2] - 196, autoAlpha: 0, scale: 0.6, duration: 0.6, ease: 'power2.in' });
    return c;
  });
  sfx('tick', T('l13', '文件'), { g: 0.5 }); sfx('whoosh', T('l13b'), { g: 0.35 });
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
  const leafNote = noteBox(B, '<b>叶子里</b>　键 → 行的地址', 1330, 412, 470); show(leafNote, T('l18'), { y: 10 }); hide(leafNote, T('l20b') - 0.3, { d: 0.25 });
  // 按地址去堆里取行：地址沿箭头走到第 23 页，整行从页里取出来
  fly(B, `(${P},${LP})`, [pk.leafX(Tr.users_pkey.aliceLeafPos) - 50, pk.leafY], [pageX - 50, 420], T('l20b', '地址'), { cls: 'navy', fs: 26, d: 0.7 });
  const got = h('div', 'tup new', B, '取出：2050  Alice  42'); px(got, pageX + 40, 404, 380); css(got, { height: '48px', lineHeight: '44px', fontSize: '26px' });
  show(got, T('l20b', '取行'), { y: 30, d: 0.5 }); sfx('pop', T('l20b', '取行'), { g: 0.6 });

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
  // 先拿到主键 2050，再从主键树的根走到叶子
  const pkTok = tagEl(C, '主键 2050', 300, 760, 'navy'); css(pkTok, { fontSize: '26px' });
  const tTok = T('l23b', '主键');
  set(pkTok, 0, { autoAlpha: 0 }); set(pkTok, tTok, { autoAlpha: 1 });
  to(pkTok, tTok + 0.1, { x: 120, y: -490, duration: 0.6, ease: 'power2.inOut' }); to(pkTok, tTok + 0.9, { x: 90, y: -360, duration: 0.45, ease: 'power2.inOut' });
  classAt(il[3], 'hl', tTok + 1.35); sfx('whoosh', tTok + 0.1, { g: 0.3 }); sfx('tick', tTok + 1.35);
  to(pkTok, Tend('l23b') + 0.2, { autoAlpha: 0, duration: 0.3 });
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
  idx.forEach((e, i) => fly(C, `(${P},${LP})`, [1110 + i * 280, 360], [1140 + i * 260, 520], T('l25', '地址') + 0.4 + i * 0.15, { cls: 'navy', fs: 22, d: 0.6 }));
  const same = tagEl(C, '主键索引也一样', 1010, 380); show(same, T('l25', '主键索引'), { y: -8 }); sfx('tick', T('l25', '主键索引'), { p: 0.4 });
});
