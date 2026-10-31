// 02 一张表放在哪：一个文件、47 页，页里行从页底往上放（T1–T3）→ 第 23 页第 26 项 = ctid → 建表时的三个索引，各是一棵 B 树，叶子里是键与地址（T4–T7）→ 对照 InnoDB（T9）
scene('layout', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('l11') + 0.5, tC = Tend('l20b') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);
  const [P, LP] = D.alice.ctid;

  // ── A：users 表在磁盘上是一个文件 → 切成 47 个 8 KB 的页 → 每页里行从页底往上放 → Alice 在第 23 页第 26 项 ──
  hdoc(A, 'users 表在磁盘上：一个文件，一页 8 KB', 72, 128);
  const ta = term(A, 72, 196, 1100, 3, { name: 'psql 会话' });
  const GX = 100, GY = 400, GW = 16 * 108 - 8;
  const tblChip = tagEl(A, 'users 表 · 4096 行', GX, GY + 30, 'navy'); css(tblChip, { fontSize: '34px', padding: '10px 26px' });
  show(tblChip, T('l1', '这张表') - 0.2, { y: 16 }); sfx('pop', T('l1', '这张表'), { g: 0.4 });
  const e0 = ta.type(T('l1', '磁盘') - 0.2, `<span class="k">SELECT</span> pg_relation_filepath('users');`, 'postgres=#', 45);
  const tRes = Math.max(e0 + 0.1, T('l2') + 0.1);
  ta.print(tRes, ' pg_relation_filepath'); ta.print(tRes + 0.12, ` <span class="hi">${D.files.users.path}</span>`); sfx('blip', tRes, { g: 0.5, p: -0.3 });
  // 结果里的路径落下来，变成一整条文件
  const tFile = T('l2', '文件');
  hide(tblChip, tFile - 0.7, { d: 0.25 });
  fly(A, D.files.users.path, [130, 290], [GX + 24, GY + 40], tFile - 0.5, { cls: 'navy', fs: 28, d: 0.5 });
  const fileBar = h('div', 'abs', A); px(fileBar, GX, GY, GW, 112); css(fileBar, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' }); fileBar.dataset.name = 'users 的数据文件';
  const fileL = h('div', 'abs', fileBar, `users 的数据文件　${D.files.users.path}`); px(fileL, 24, 36); css(fileL, { font: '700 32px "Mono","Sans SC"', color: 'var(--navy)' });
  wipe(fileBar, tFile + 0.05, { dir: 'l', d: 0.5 }); sfx('thud', tFile + 0.05, { g: 0.4 });
  // 切成 47 页：一张张页卡按文件里的先后排开（满一行接下一行）
  const tCut = T('l3', '一页一页');
  hide(fileL, tCut - 0.1, { d: 0.1 }); hide(fileBar, tCut + 0.1, { d: 0.3 });
  const grid = heapGrid(A, GX, GY);
  grid.pages.forEach((pg, i) => { show(pg, tCut + i * 0.025, { y: 0, s: 0.85, d: 0.25 }); set(pg.rows, 0, { scaleY: 0 }); set(pg.lp, 0, { scaleX: 0 }); });
  grid.pages.forEach((pg, i) => { if (![0, 16, 23, 32, 46].includes(i)) pg.lab.style.display = 'none'; else show(pg.lab, tCut + i * 0.025 + 0.2, { y: 0 }); });
  sfx('whoosh', tCut, { g: 0.4 });
  const kb = capt(A, '<b>8 KB</b>', GX, GY - 42); css(kb, { fontSize: '28px', color: 'var(--navy)' }); show(kb, T('l3', '8 KB'), { y: 8 }); sfx('tick', T('l3', '8 KB'));
  const tot = capt(A, `共 <b>${D.files.users.sizes[D.files.users.node] / 1024} KB</b> = ${D.heap.pages} × 8 KB`, 1240, 336); css(tot, { fontSize: '28px' });
  show(tot, T('l3', '8 KB') + 0.3, { y: 8 });
  // 行一行接一行地放：每页的行从页底往上长，指针从左往右长；放满一页换下一页
  const tF0 = T('l4'), tF1 = T('l5', '47') + 0.2, rowsTotal = D.heap.rows.reduce((a, b) => a + b, 0);
  let acc = 0;
  grid.pages.forEach((pg, i) => {
    const a = tF0 + (tF1 - tF0) * acc / rowsTotal; acc += D.heap.rows[i]; const b = tF0 + (tF1 - tF0) * acc / rowsTotal;
    to(pg.rows, a, { scaleY: 1, duration: Math.max(0.05, b - a), ease: 'none' }); to(pg.lp, a, { scaleX: pg.k, duration: Math.max(0.05, b - a), ease: 'none' });
  });
  const tAll = T('l5b', '4096') + 0.2;
  const cnt = capt(A, '', 1240, 336); css(cnt, { fontSize: '28px', color: 'var(--ink)' });
  hide(tot, tF0 - 0.1, { d: 0.2 });
  F((t) => { const k = clamp((t - tF0) / (tF1 - tF0)); const r = Math.round(k * rowsTotal); cnt.innerHTML = t < tF0 ? '' : t >= tAll ? `<b>${rowsTotal}</b> 个用户，都在这 <b>${D.heap.pages}</b> 页里` : `已放 <b>${r}</b> 行 · <b>${Math.max(1, Math.ceil(r / 88))}</b> 页`; });
  sfx('tick', tF0, { g: 0.4 });
  keyed(kb).at(T('l5', '88'), { html: '<b>8 KB · 88 行</b>' });
  const p46 = grid.pos(46);
  const lastL = capt(A, `最后一页 <b>${D.heap.rows[46]}</b> 行`, p46.x + p46.w + 14, p46.y + 40); css(lastL, { fontSize: '26px', color: 'var(--navy)' }); show(lastL, T('l5', '47'), { x: -10 });
  // 这样的文件叫堆
  const frame = h('div', 'abs', A); px(frame, GX - 12, GY - 12, GW + 24, 3 * 146 - 10); css(frame, { border: '4px solid var(--navy)' }); frame.dataset.name = '堆';
  show(frame, T('l6', '堆') - 0.1, { y: 0, s: 1.02, d: 0.4 });
  const heapG = glossBox(A, '堆', '<b>堆</b>：表的数据文件。行按到达的顺序放，不按编号排序，哪页有空放哪页', GX, 862, 1100);
  show(heapG, T('l6', '堆'), { y: 10 }); sfx('pop', T('l6', '堆'), { g: 0.6 });
  // 谁先来谁在前：每一行页卡的第一页上，写着从几号起
  [kb, lastL].forEach((e) => hide(e, T('l6b') - 0.1, { d: 0.25 }));
  [0, 16, 32].forEach((i, j) => { const q = grid.pos(i); const l = tagEl(A, `${D.heap.first[i]} 号起`, q.x + 2, q.y + 40, 'navy'); css(l, { fontSize: '22px' }); show(l, T('l6b', '谁先来') + j * 0.35, { x: -10 }); hide(l, T('l7') + 0.1, { d: 0.2 }); });
  sfx('tick', T('l6b', '谁先来'), { g: 0.4 });
  // Alice 是第 2050 个：标记沿着页卡走到第 23 页
  const p0 = grid.pos(0), p15 = grid.pos(15), p16 = grid.pos(16), pA = grid.pos(P);
  const mk = tagEl(A, '2050 号 Alice', p0.x, p0.y - 46, 'warn'); css(mk, { fontSize: '24px' });
  const tM = T('l7') + 0.15, dM = Math.max(1.2, Tend('l7') - tM);
  set(mk, 0, { autoAlpha: 0 }); set(mk, tM, { autoAlpha: 1 });
  to(mk, tM, { x: p15.x - p0.x, duration: dM * 0.55, ease: 'none' });
  to(mk, tM + dM * 0.55, { x: p16.x - p0.x, y: p16.y - p0.y, duration: dM * 0.15, ease: 'power1.inOut' });
  to(mk, tM + dM * 0.7, { x: pA.x - p0.x, y: pA.y - p0.y, duration: dM * 0.3, ease: 'power1.out' });
  sfx('whoosh', tM, { g: 0.3 });
  const tP = T('l8', '23');
  to(grid.pages[P], tP, { borderColor: '#193145', borderWidth: '4px', duration: 0.15 }); sfx('tick', tP);
  // 第 23 页拿出来放大：和真的页一样，上面是页头和 88 个指针，下面是 88 行（第 1 项在页尾）
  [grid, frame].forEach((e) => to(e, tP + 0.3, { opacity: 0.15, duration: 0.4 })); [heapG, cnt, mk].forEach((e) => hide(e, tP + 0.2, { d: 0.3 })); wipeOut(ta.el, tP + 0.1, { dir: 'r', d: 0.35 });
  const BX = 300, BY = 330, BW = 22 * 36 + 24;
  const big = h('div', 'abs', A); px(big, BX, BY, BW, 540); css(big, { border: '4px solid var(--navy)', background: '#fff' }); big.dataset.name = '第 23 页放大';
  const bt = capt(A, `<b>第 ${P} 页</b>（${D.heap.first[P]}–${D.heap.first[P] + 87} 号）`, BX, BY - 44); css(bt, { fontSize: '28px', color: 'var(--navy)' });
  const bh = h('div', 'abs', big, '页头'); px(bh, 0, 0, BW - 8, 34); css(bh, { background: 'var(--navy)', color: '#fff', font: '700 22px "Sans SC"', lineHeight: '34px', paddingLeft: '12px' });
  const lps = [], rws = [];
  for (let i = 0; i < 88; i++) { const c = h('div', 'abs', big); px(c, 12 + (i % 22) * 36, 44 + Math.floor(i / 22) * 24, 32, 20); css(c, { background: 'var(--sky)' }); lps.push(c); }
  const gp = h('div', 'abs', big, '空隙'); px(gp, 12, 146, BW - 32, 40); css(gp, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)', font: '600 22px "Sans SC"', color: 'var(--mute)', lineHeight: '40px', textAlign: 'center' });
  for (let k = 1; k <= 88; k++) { const j = 88 - k; const c = h('div', 'abs', big); px(c, 12 + (j % 22) * 36, 196 + Math.floor(j / 22) * 82, 32, 76); css(c, { background: 'var(--sky-lt)', border: '1.5px solid var(--pg)' }); rws[k] = c; }
  const lpsL = capt(big, '88 个指针', BW - 160, 4); css(lpsL, { color: '#fff', fontSize: '22px' });
  tl.fromTo(big, { autoAlpha: 0, x: pA.x - BX, y: pA.y - BY, scale: 0.13, transformOrigin: '0 0' }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.inOut', immediateRender: true }, tP + 0.2);
  show(bt, tP + 0.7, { y: 8 }); sfx('whoosh', tP + 0.2, { g: 0.35 });
  const rowsL = capt(A, '行从页尾往前放：第 1 项在最后', BX + BW + 24, BY + 470); css(rowsL, { fontSize: '24px' }); show(rowsL, tP + 0.9, { x: -10 });
  // 第 26 项：第 26 个指针 → 那一行
  const t26 = T('l9', '26');
  set(lps[LP - 1], t26, { backgroundColor: '#193145' }); set(rws[LP], t26 + 0.2, { backgroundColor: '#336791' }); sfx('pop', t26);
  const ovA = overlay(A);
  const lx = BX + 4 + 12 + ((LP - 1) % 22) * 36 + 16, ly = BY + 4 + 44 + Math.floor((LP - 1) / 22) * 24 + 20;
  const j26 = 88 - LP, rx = BX + 4 + 12 + (j26 % 22) * 36 + 16, ry = BY + 4 + 196 + Math.floor(j26 / 22) * 82;
  const a26 = curve(ovA, [lx, ly], [rx, ry], 'warn', { w: 4, bend: (ly + ry) / 2 }); arrowIn(a26, t26 + 0.1, 0.5);
  const l26 = tagEl(A, `第 ${LP} 项：Alice`, BX + BW + 24, ry - 10, 'warn'); css(l26, { fontSize: '26px' }); show(l26, t26 + 0.4, { x: -10 });
  // 第几页、第几项 = 地址：两个数字各自飞过来拼成 (23,26)
  const AX = 1260, AY = 420;
  const par = h('div', 'abs', A, `(<span style="opacity:0">${P}</span>,<span style="opacity:0">${LP}</span>)`); px(par, AX, AY); css(par, { font: '700 80px "Mono"', color: 'var(--pg)' });
  show(par, T('l10') - 0.1, { y: 0, d: 0.3 });
  const [dP, dL] = par.querySelectorAll('span');
  fly(A, String(P), [BX + 80, BY - 44], [AX + 40, AY + 6], T('l10') + 0.1, { fs: 56, d: 0.6 }); set(dP, T('l10') + 0.85, { opacity: 1 });
  fly(A, String(LP), [lx - 20, ly - 10], [AX + 200, AY + 6], T('l10') + 0.6, { fs: 56, d: 0.6 }); set(dL, T('l10') + 1.35, { opacity: 1 });
  sfx('pop', T('l10') + 0.75); sfx('pop', T('l10') + 1.25, { p: 0.3 });
  const pl = capt(A, '第几页　　第几项', AX + 30, AY + 110); css(pl, { fontSize: '26px', color: 'var(--ink2)' }); show(pl, T('l10', '地址'), { y: -6 });
  const ctT = tagEl(A, 'ctid', AX, AY - 60, 'navy'); css(ctT, { fontSize: '32px' }); slam(ctT, T('l11', 'ctid'), { from: 1.3 }); sfx('thud', T('l11', 'ctid'), { g: 0.6 });
  const ctidG = glossBox(A, 'ctid', '<b>ctid</b>：一行的地址 =（页号, 页内第几项）', AX, AY + 170, 560);
  show(ctidG, T('l10', '地址'), { y: 12 });

  // ── B：建表时的三个索引；每个是另一个文件、一棵 B 树；叶子里是「键 → 行的地址」 ──
  hdoc(B, '三个索引：各是一个文件，一棵 B 树', 72, 128);
  const tdd = term(B, 72, 196, 1776, 3, { fs: 22, lh: 36, name: '建表时的语句' });
  const tL = T('l12') - 0.5;
  let e = tdd.type(tL, '<span class="k">CREATE TABLE</span> users (id int NOT NULL <span class="hi">PRIMARY KEY</span>, name char(50) NOT NULL, age smallint NOT NULL);', 'postgres=#', 110);
  e = tdd.type(Math.max(e + 0.05, T('l12', '姓名') - 0.4), '<span class="k">CREATE INDEX</span> idx_name <span class="k">ON</span> users (name);', 'postgres=#', 80);
  tdd.type(Math.max(e + 0.05, T('l12', '年龄') - 0.4), '<span class="k">CREATE INDEX</span> idx_age <span class="k">ON</span> users (age);', 'postgres=#', 80);
  const FL = D.files;
  const chipDef = [['主键索引', 'users_pkey', '主键自带', 120, T('l12', '主键')], ['姓名索引', 'idx_name', '另外建的', 700, T('l12', '姓名')], ['年龄索引', 'idx_age', '另外建的', 1280, T('l12', '年龄')]];
  const chips = chipDef.map(([n, k, how, x, t]) => { const c = tagEl(B, `${n} · ${how}`, x, 350, k === 'users_pkey' ? '' : 'navy'); css(c, { fontSize: '28px' }); show(c, t, { y: 10 }); keyed(c).at(T('l13', '文件') + 0.1, { html: `${n} · ${FL[k].path}` }); return c; });
  sfx('tick', T('l12', '主键')); sfx('tick', T('l12', '姓名'), { p: 0.2 }); sfx('tick', T('l12', '年龄'), { p: 0.4 });
  wipeOut(tdd.el, T('l13b') - 0.1, { dir: 'r', d: 0.35 });
  // 三棵树：根里写分隔键，叶子里写键从几起
  const ovB = overlay(B);
  const Tr = D.trees, pkK = Tr.users_pkey.keyInts, ageK = [null, 32, 46, 60, 74];
  const pk = btree(B, ovB, 96, 220, 1000, Tr.users_pkey.leafCount, { leafW: 76, rootW: 520, dy: 90, name: '主键树', rootText: '根：367 · 733 · 1099 · … · 4027', leafText: (i) => String(pkK[i] || 1) });
  const ag = btree(B, ovB, 1300, 220, 520, Tr.idx_age.leafCount, { leafW: 96, rootW: 300, dy: 90, name: '年龄树', rootText: '根：32 · 46 · 60 · 74', leafText: (i) => ['&lt;32', '32–45', '46–59', '60–73', '74+'][i] });
  const strip = heapStrip(B, 90, 456, { w: 33, gap: 4, h: 90, labels: [0, P, 46] });
  const stripL = capt(B, '<b>堆</b>', 90, 418); css(stripL, { fontSize: '26px' });
  const nm = btree(B, ovB, 90, 720, 1740, Tr.idx_name.leafCount, { leafW: 40, rootW: 520, dy: -96, name: '姓名树', rootText: '根：User00108 · User00215 · …' });
  px(nm.root, 90 + 870 - 260, 760, 520); nm.edges.forEach((x) => x.remove());
  const nmEdges = nm.leaves.map((lf, i) => path(ovB, `M${90 + 870 + (i - 19) * 10},760 L${nm.leafX(i)},666`, 'dim', { w: 1.5, arrow: false }));
  [pk, ag].forEach((tr) => tr.leaves.forEach((lf) => css(lf, { fontSize: '22px', color: 'var(--navy)' })));
  [pk.root, ag.root, nm.root].forEach((r) => css(r, { fontSize: '22px', height: '44px', lineHeight: '39px' }));
  const lpk = capt(B, `<b>主键树</b> · ${Tr.users_pkey.leafCount} 页叶子`, 96, 228), lag = capt(B, `<b>年龄树</b> · ${Tr.idx_age.leafCount} 页叶子`, 1300, 356), lnm = capt(B, `<b>姓名树</b> · ${Tr.idx_name.leafCount} 页叶子`, 1240, 768);
  [lpk, lag, lnm].forEach((x) => css(x, { fontSize: '24px' }));
  const grow = (tree, t0, edges) => { slam(tree.root, t0, { from: 1.3 }); edges.forEach((x, i) => draw(x, t0 + 0.15 + i * 0.01, 0.3)); tree.leaves.forEach((lf, i) => show(lf, t0 + 0.2 + i * 0.012, { y: 10, d: 0.2 })); };
  chips.forEach((c, i) => { const rb = { x: [96 + 240, 90 + 610, 1300 + 110][i], y: [220, 760, 220][i] }; to(c, T('l13b') + i * 0.1, { x: rb.x - chipDef[i][3], y: rb.y - 350, autoAlpha: 0, scale: 0.6, duration: 0.6, ease: 'power2.in' }); });
  wipe(strip, T('l13b'), { dir: 'l', d: 0.5 }); show(stripL, T('l13b'));
  sfx('whoosh', T('l13b'), { g: 0.35 });
  grow(pk, T('l14'), pk.edges); show(lpk, T('l14'), { x: -10 }); sfx('pop', T('l14'), { g: 0.5 });
  grow(nm, T('l15'), nmEdges); show(lnm, T('l15'), { x: -10 }); sfx('pop', T('l15'), { g: 0.5 });
  const sz = noteBox(B, `<b>一项多大</b>　编号 ${Tr.users_pkey.aliceItem.len} 字节 · 姓名 ${Tr.idx_name.aliceItem.len} 字节：姓名一页放得少，叶子就多`, 96, 830, 1100); show(sz, T('l15b', '64'), { y: 10 });
  hide(sz, Tend('l16') + 0.2, { d: 0.3 });
  grow(ag, T('l16'), ag.edges); show(lag, T('l16'), { x: -10 }); sfx('pop', T('l16'), { g: 0.5 });
  classAt(ag.leaves[1], 'hl', T('l17') - 0.1, T('l18'));
  const post = tagEl(B, `42 岁这一项：装着 ${D.agePosting.count} 个地址`, 1300, 394, 'navy'); css(post, { fontSize: '24px' }); show(post, T('l17', '合成一项'), { y: 10 });
  hide(post, T('l18') - 0.15, { d: 0.25 });
  // 叶子里存的是「键 → 地址」：主键树 1831 起那页叶子放大
  [ag.root, ...ag.leaves, ...ag.edges, lag].forEach((x) => hide(x, T('l18') - 0.2, { d: 0.3 }));
  const pkLeaf = pk.leaves[Tr.users_pkey.aliceLeafPos], nmLeaf = nm.leaves[Tr.idx_name.aliceLeafPos];
  const zoom = (x, y, title, items, hlIdx, t) => {
    const b = h('div', 'abs', B); px(b, x, y, 560); css(b, { border: '3px solid var(--pg)', background: '#fff' }); b.dataset.name = title;
    const hd = h('div', '', b, title); css(hd, { background: 'var(--pg)', color: '#fff', font: '700 24px "Sans SC"', padding: '6px 16px' });
    const rows = items.map((it) => { const r = h('div', '', b, it); css(r, { font: '600 26px var(--mono)', padding: '6px 16px', color: 'var(--navy)', borderTop: '1.5px solid var(--line)' }); return r; });
    wipe(b, t, { dir: 'l', d: 0.4 }); return { b, rows };
  };
  const zp = zoom(1270, 196, `主键树：${pkK[Tr.users_pkey.aliceLeafPos]} 起的那页叶子`, [`2049 → (${P},${LP - 1})`, `2050 → (${P},${LP})`, `2051 → (${P},${LP + 1})`], 1, T('l18', '键'));
  classAt(pkLeaf, 'hl', T('l18', '键'));
  const zl1 = curve(ovB, [pk.leafX(Tr.users_pkey.aliceLeafPos), 352], [1270, 300], 'accent', { bend: 330, arrow: false }); draw(zl1, T('l18', '键'), 0.4);
  const tK = T('l19', '2050');
  set(zp.rows[1], tK, { backgroundColor: '#336791', color: '#fff' }); sfx('tick', tK, { p: -0.4 });
  const pageX = 90 + P * 37 + 16;
  const a1 = curve(ovB, [1270, 305], [pageX, 456], 'warn', { w: 4, bend: 400 }); arrowIn(a1, T('l19', '23') - 0.2, 0.5);
  classAt(strip.pages[P], 'hl', T('l19', '23')); sfx('tick', T('l19', '23'));
  // 姓名树最左那页叶子：Alice 旁边也是这个地址
  const zn = zoom(1240, 820, '姓名树：最左边那页叶子', [`Alice → (${P},${LP})`, 'User00001 → (0,1)'], 0, T('l20') - 0.2);
  classAt(nmLeaf, 'hl', T('l20') - 0.2);
  const zl2 = curve(ovB, [nm.leafX(0), 666], [1240, 860], 'accent', { bend: 760, arrow: false }); draw(zl2, T('l20') - 0.2, 0.4);
  hide(lnm, T('l20') - 0.3, { d: 0.2 });
  set(zn.rows[0], T('l20', 'Alice'), { backgroundColor: '#336791', color: '#fff' }); sfx('tick', T('l20', 'Alice'));
  const a2 = curve(ovB, [1240, 880], [pageX + 8, 546], 'warn', { w: 4, bend: 640 }); arrowIn(a2, T('l20', '这个地址') - 0.2, 0.5); sfx('tick', T('l20', '这个地址'));
  // 按地址去堆里取行
  fly(B, `(${P},${LP})`, [1300, 800], [pageX - 50, 520], T('l20b', '地址') - 0.2, { cls: 'navy', fs: 24, d: 0.6 });
  const got = h('div', 'tup new', B, '取出：2050  Alice  42'); px(got, pageX - 190, 390, 380); css(got, { height: '48px', lineHeight: '44px', fontSize: '26px' });
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
