// 02 一张表放在哪：一个文件、47 页，页里行从页底往上放（T1–T3）→ 第 23 页第 26 项 = ctid → 建表时的三个索引，各是一棵 B 树，叶子里是键与地址（T4–T7）→ 对照 InnoDB（T9）
scene('layout', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('l11') + 0.5, tB2 = Tend('l17') + 0.5, tC = Tend('l20b') + 0.5;
  const [A, B, B2, C] = screens(world, [c0, tB, tB2, tC, s.end]);
  drift(world, s, [tB, tB2, tC], 1);
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
  const lastL = capt(A, `最后一页 <b>${D.heap.rows[46]}</b> 行`, p46.x - 70, p46.y - 34); css(lastL, { fontSize: '26px', color: 'var(--navy)' }); show(lastL, T('l5', '47'), { y: 8 });
  const all47 = h('div', 'abs', A); px(all47, GX, GY + 3 * 146 - 20, GW, 6); css(all47, { background: 'var(--navy)' });
  const all47L = capt(A, '<b>全部 47 页</b>', GX + GW / 2 - 80, GY + 3 * 146 - 8); css(all47L, { fontSize: '26px', color: 'var(--navy)' });
  fromTo(all47, T('l5b', '47') - 0.2, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6 }); show(all47L, T('l5b', '47'), { y: -8 }); sfx('whoosh', T('l5b', '47'), { g: 0.25 });
  [all47, all47L].forEach((x) => hide(x, T('l6', '堆') - 0.2, { d: 0.25 }));
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
  [grid, frame].forEach((e) => to(e, tP + 0.3, { opacity: 0.15, duration: 0.4 })); [heapG, cnt, mk].forEach((e) => hide(e, tP + 0.2, { d: 0.3 })); gone(ta.el, tP + 0.1);
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

  // ── B：建表时的三个索引；每个索引是一个文件（物理：一排页），页飞起来排成一棵 B 树（逻辑） ──
  hdoc(B, '三个索引：各是一个文件，一棵 B 树', 72, 128);
  const tdd = term(B, 72, 196, 1776, 3, { fs: 22, lh: 36, name: '建表时的语句' });
  let e = tdd.type(T('l12') - 0.5, '<span class="k">CREATE TABLE</span> users (id int NOT NULL <span class="hi">PRIMARY KEY</span>, name char(50) NOT NULL, age smallint NOT NULL);', 'postgres=#', 110);
  e = tdd.type(Math.max(e + 0.05, T('l12', '姓名') - 0.4), '<span class="k">CREATE INDEX</span> idx_name <span class="k">ON</span> users (name);', 'postgres=#', 80);
  tdd.type(Math.max(e + 0.05, T('l12', '年龄') - 0.4), '<span class="k">CREATE INDEX</span> idx_age <span class="k">ON</span> users (age);', 'postgres=#', 80);
  const Tr = D.trees, FL = D.files, ovB = overlay(B);
  // 三列：主键、姓名、年龄。每列下面是索引文件（一排页），上面是树
  const COL = [
    { key: 'users_pkey', name: '主键索引', how: '主键自带', x: 72, w: 600, tw: 40, word: '主键' },
    { key: 'idx_name', name: '姓名索引', how: '另外建的', x: 712, w: 600, tw: 0, word: '姓名' },
    { key: 'idx_age', name: '年龄索引', how: '另外建的', x: 1352, w: 496, tw: 64, word: '年龄' },
  ];
  const FY = 760, FH = 60, RY = 420, LY = 560;
  COL.forEach((c, ci) => {
    const t = Tr[c.key], n = t.pages, tw = c.tw || (c.w / n), gap = c.tw ? 4 : 1;
    c.t = t; c.tw = tw;
    // 文件：一排页（第 0 页元数据，第 3 页根，其余是叶子）
    const lab = tagEl(B, `${c.name} · ${c.how}`, c.x, FY + FH + 16, ci === 0 ? '' : 'navy'); css(lab, { fontSize: '26px' });
    show(lab, T('l12', c.word), { y: 10 }); keyed(lab).at(T('l13', '文件') + ci * 0.1, { html: `${c.name} · ${FL[c.key].path} · ${n} 页` });
    const tiles = [];
    for (let k = 0; k < n; k++) {
      const g = h('div', 'abs', B); px(g, c.x + k * tw, FY, tw - gap, FH); css(g, { border: '1.5px dashed var(--sky)', background: '#fff' });
      const tile = h('div', 'abs', B); px(tile, c.x + k * tw, FY, tw - gap, FH);
      css(tile, { background: k === 0 ? 'var(--navy)' : k === t.root ? 'var(--pg)' : 'var(--wash)', border: '2px solid var(--pg)' });
      [g, tile].forEach((x) => tl.fromTo(x, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: true }, T('l13', '文件') - 0.1 + k * 0.01));
      tiles.push(tile);
    }
    const meta = capt(B, ci === 1 ? '第 0 页元数据 · 第 3 页根' : '0 = 元数据　3 = 根', c.x, FY - 62); css(meta, { fontSize: '22px', color: 'var(--navy)' }); show(meta, T('l13', '文件') + 0.3);
    c.tiles = tiles; c.meta = meta;
  });
  sfx('tick', T('l13', '文件'), { g: 0.5 });
  gone(tdd.el, T('l13b') - 0.4);
  // 都是一棵 B 树：根页、叶子页从文件里飞起来，按键的顺序排成树；文件里留下原位，用细线连着
  const tFly = T('l13b') - 0.1;
  COL.forEach((c) => {
    const t = c.t, nl = t.leafCount, lw = Math.min(64, (c.w - (nl - 1) * 3) / nl), lg = (c.w - nl * lw) / Math.max(1, nl - 1);
    const rootW = 220, rx = c.x + c.w / 2 - rootW / 2;
    const rootT = c.tiles[t.root];
    fromTo(rootT, tFly, { x: 0, y: 0, width: c.tw - (c.tw >= 40 ? 4 : 1), height: FH }, { x: rx - (c.x + t.root * c.tw), y: RY - FY, width: rootW, height: 46, duration: 0.8, ease: 'power3.inOut' });
    c.leafPos = [];
    t.leaves.forEach((pg, i) => {
      const lx = c.x + i * (lw + lg), tile = c.tiles[pg];
      fromTo(tile, tFly + 0.05 + i * 0.008, { x: 0, y: 0, width: c.tw - (c.tw >= 40 ? 4 : 1), height: FH }, { x: lx - (c.x + pg * c.tw), y: LY - FY, width: lw, height: 46, duration: 0.8, ease: 'power3.inOut' });
      c.leafPos.push(lx + lw / 2);
      const ln = path(ovB, `M${lx + lw / 2},${LY + 46} L${c.x + pg * c.tw + (c.tw - 1) / 2},${FY}`, 'dim', { w: 1, arrow: false, opacity: 0.6 }); draw(ln, tFly + 0.8, 0.4);
    });
    const rl = path(ovB, `M${rx + rootW / 2},${RY + 46} C${rx + rootW / 2},${(RY + FY) / 2} ${c.x + t.root * c.tw + c.tw / 2},${(RY + FY) / 2} ${c.x + t.root * c.tw + c.tw / 2},${FY}`, 'dim', { w: 1, arrow: false, opacity: 0.6 }); draw(rl, tFly + 0.8, 0.4);
    t.leaves.forEach((pg, i) => { const ed = path(ovB, `M${rx + rootW / 2 + (i - (nl - 1) / 2) * Math.min(8, rootW / nl)},${RY + 46} L${c.leafPos[i]},${LY}`, 'accent', { w: 1.5, arrow: false }); draw(ed, tFly + 0.9 + i * 0.005, 0.3); });
    c.rx = rx; c.lw = lw;
  });
  sfx('whoosh', tFly, { g: 0.45 }); sfx('thud', tFly + 0.85, { g: 0.45 });
  // 逐棵讲：根里写分隔键，叶子写键从几起；讲到哪棵，哪一列亮
  const keyText = (x, y, html, t) => { const l = h('div', 'abs', B, html); px(l, x, y); css(l, { font: '600 22px var(--mono)', color: '#fff', whiteSpace: 'nowrap' }); show(l, t, { y: 0, d: 0.3 }); return l; };
  const colFrame = (c, t0, t1) => { const f = h('div', 'abs', B); px(f, c.x - 14, RY - 70, c.w + 28, FY + FH - RY + 76); css(f, { border: '3px solid var(--navy)' }); show(f, t0, { y: 0, d: 0.3 }); hide(f, t1, { d: 0.25 }); };
  const [cP, cN, cA] = COL, pkK = Tr.users_pkey.keyInts;
  const head = (c, html, t) => { const l = capt(B, html, c.x, RY - 60); css(l, { fontSize: '26px', color: 'var(--ink)' }); show(l, t, { y: 8 }); return l; };
  colFrame(cP, T('l14'), T('l15') - 0.1); head(cP, `<b>主键树</b>：一个根 · ${Tr.users_pkey.leafCount} 页叶子`, T('l14'));
  keyText(cP.rx + 16, RY + 10, '367 · 733 · …', T('l14', '根'));
  [[0, '1'], [5, '1831'], [11, '4027']].forEach(([i, k]) => { const l = capt(B, k, cP.leafPos[i] - 26, LY + 52, 'cap mono'); css(l, { fontSize: '22px', color: 'var(--navy)' }); show(l, T('l14', '叶子'), { y: -6 }); });
  colFrame(cN, T('l15'), T('l16') - 0.1); head(cN, `<b>姓名树</b>：一个根 · ${Tr.idx_name.leafCount} 页叶子`, T('l15'));
  keyText(cN.rx + 16, RY + 10, 'User00108 · …', T('l15', '根'));
  const nAl = capt(B, 'Alice…', cN.x, LY + 52, 'cap mono'); css(nAl, { fontSize: '22px', color: 'var(--navy)' }); show(nAl, T('l15', '叶子'), { y: -6 });
  const sz = tagEl(B, `一项姓名 ${Tr.idx_name.aliceItem.len} 字节（编号只要 ${Tr.users_pkey.aliceItem.len}）：一页放得少`, cN.x, LY + 86, 'navy'); css(sz, { fontSize: '24px' }); show(sz, T('l15b', '64'), { y: 8 }); hide(sz, T('l16') - 0.1, { d: 0.25 });
  colFrame(cA, T('l16'), Tend('l17') + 0.2); head(cA, `<b>年龄树</b>：一个根 · ${Tr.idx_age.leafCount} 页叶子`, T('l16'));
  keyText(cA.rx + 16, RY + 10, '32 · 46 · 60 · 74', T('l16', '根'));
  ['&lt;32', '32–45', '46–59', '60–73', '74+'].forEach((k, i) => { const l = capt(B, k, cA.leafPos[i] - 30, LY + 52, 'cap mono'); css(l, { fontSize: '22px', color: 'var(--navy)' }); show(l, T('l16', '叶子') + i * 0.06, { y: -6 }); });
  const order = tagEl(B, '叶子按键排：第 1、5、4、6、2 页', cA.x, LY + 86, 'navy'); css(order, { fontSize: '24px' }); show(order, T('l16', '叶子'), { y: 8 }); hide(order, Math.max(T('l16', '叶子') + 1.2, T('l17', '合成一项') - 0.3), { d: 0.25 });
  const ag1 = cA.tiles[Tr.idx_age.leaves[1]]; to(ag1, T('l17') - 0.1, { backgroundColor: '#336791', duration: 0.2 });
  const post = tagEl(B, `42 岁这一项：装着 ${D.agePosting.count} 个地址`, cA.x, LY + 86, 'navy'); css(post, { fontSize: '24px' }); show(post, Math.max(T('l16', '叶子') + 1.5, T('l17', '合成一项')), { y: 8 });
  sfx('pop', T('l14'), { g: 0.5 }); sfx('pop', T('l15'), { g: 0.5 }); sfx('pop', T('l16'), { g: 0.5 }); sfx('tick', T('l17', '合成一项'));

  // ── B2：叶子里存的是「键 → 行的地址」；按地址去堆里取行 ──
  hdoc(B2, '叶子里：键 → 行的地址', 72, 128);
  const [P2, L2] = [P, LP], pkK2 = Tr.users_pkey.keyInts;
  const strip = heapStrip(B2, 90, 640, { w: 33, gap: 4, h: 110, labels: [0, P2, 46] });
  const stripL = capt(B2, `<b>堆</b>（users 的文件）`, 90, 600); css(stripL, { fontSize: '26px' });
  show(strip, T('l18') - 0.2, { y: 10 }); show(stripL, T('l18') - 0.2);
  const zoom = (x, y, title, items, t) => {
    const b = h('div', 'abs', B2); px(b, x, y, 680); css(b, { border: '3px solid var(--pg)', background: '#fff' }); b.dataset.name = title;
    const hd = h('div', '', b, title); css(hd, { background: 'var(--pg)', color: '#fff', font: '700 26px "Sans SC"', padding: '8px 18px' });
    const rows = items.map((it) => { const r = h('div', '', b, it); css(r, { font: '600 28px var(--mono)', padding: '8px 18px', color: 'var(--navy)', borderTop: '1.5px solid var(--line)' }); return r; });
    wipe(b, t, { dir: 'l', d: 0.4 }); return { b, rows };
  };
  const zp = zoom(90, 210, `主键树：${pkK2[Tr.users_pkey.aliceLeafPos]} 起的那页叶子`, [`2049 → (${P2},${L2 - 1})`, `2050 → (${P2},${L2})`, `2051 → (${P2},${L2 + 1})`], T('l18', '键') - 0.1);
  const tK = T('l19', '2050');
  set(zp.rows[1], tK, { backgroundColor: '#336791', color: '#fff' }); sfx('tick', tK, { p: -0.4 });
  const pageX = 90 + P2 * 37 + 16;
  const ovB2 = overlay(B2);
  const a1 = curve(ovB2, [770, 330], [pageX, 640], 'warn', { w: 4, bend: 470 }); arrowIn(a1, T('l19', '23') - 0.2, 0.5);
  classAt(strip.pages[P2], 'hl', T('l19', '23')); sfx('tick', T('l19', '23'));
  const zn = zoom(1080, 210, '姓名树：最左边那页叶子', [`Alice → (${P2},${L2})`, 'User00001 → (0,1)', 'User00002 → (0,2)'], T('l20') - 0.3);
  set(zn.rows[0], T('l20', 'Alice'), { backgroundColor: '#336791', color: '#fff' }); sfx('tick', T('l20', 'Alice'));
  const a2 = curve(ovB2, [1080, 288], [pageX + 10, 640], 'warn', { w: 4, bend: 520 }); arrowIn(a2, T('l20', '这个地址') - 0.2, 0.5); sfx('tick', T('l20', '这个地址'));
  const sameB = tagEl(B2, '两棵树，同一个地址', 800, 470, 'warn'); css(sameB, { fontSize: '28px' }); show(sameB, T('l20', '这个地址') + 0.2, { y: 8 });
  // 按地址去堆里取行
  fly(B2, `(${P2},${L2})`, [820, 520], [pageX - 50, 600], T('l20b', '地址') - 0.2, { cls: 'navy', fs: 26, d: 0.6 });
  const got = h('div', 'tup new', B2, '取出：2050  Alice  42'); px(got, pageX - 190, 800, 400); css(got, { height: '52px', lineHeight: '48px', fontSize: '28px' });
  show(got, T('l20b', '取行'), { y: -30, d: 0.5 }); sfx('pop', T('l20b', '取行'), { g: 0.6 });
  const up = link(ovB2, [[pageX, 756], [pageX, 796]], 'navy'); arrowIn(up, T('l20b', '取行') - 0.1, 0.3);

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
  wipe(whole, T('l22b', '整行'), { dir: 'l' }); const ex = tagEl(C, '例：2050 Alice 42 就在一页叶子里', 90, 530, 'grey'); css(ex, { fontSize: '24px' }); show(ex, T('l22b', '叶子') - 0.2, { y: 8 }); hide(ex, T('l23') - 0.1, { d: 0.2 });
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
