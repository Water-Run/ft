// 02 一张表放在哪（第 3 稿）：整章一个连续的画面，不换屏（WaterRun 看 r8：「画面缺乏连续性」「视频是运动的画面和语句的有机结合」）。
// users 的文件切成 47 页、一页页填满 → 堆 → Alice 在第 23 页第 26 项 = ctid；堆缩到下方，姓名索引从另一个文件长成一棵 B 树，
// 最左边那页叶子在原地展开（名字 | 行的地址），按地址落回第 23 页；再长出主键树、年龄树，三棵树都指向第 23 页；
// 最后整张结构图缩到右半边，左边建起 InnoDB 的做法对照（T1–T9）
scene('layout', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  drift(world, s, [], 1);
  const [P, LP] = D.alice.ctid;
  const A = h('div', 'abs', world); px(A, 0, 0, 1920, 1080);
  const pgS = h('div', 'abs', A); px(pgS, 0, 0, 1920, 1080); css(pgS, { transformOrigin: '0 0' }); pgS.dataset.name = 'PostgreSQL 的结构';
  const hw = h('div', 'abs', pgS); px(hw, 0, 0, 1920, 1080); css(hw, { transformOrigin: '0 0' }); hw.dataset.name = '堆';
  // ── A：users 表在磁盘上是一个文件 → 切成 47 个 8 KB 的页 → 每页里行从页底往上放 → Alice 在第 23 页第 26 项 ──
  const head0 = hdoc(A, 'users 表在磁盘上：一个文件，一页 8 KB', 72, 128);
  const ta = term(A, 72, 196, 1100, 3, { name: 'psql 会话' });
  const GX = 100, GY = 400, GW = 16 * 108 - 8;
  const tblChip = tagEl(A, 'users 表 · 4096 行', GX, GY + 30, 'navy'); css(tblChip, { fontSize: '34px', padding: '10px 26px' });
  show(tblChip, T('l1', '这张表') - 0.2, { y: 16 }); sfx('pop', T('l1', '这张表'), { g: 0.4 });
  // 表慢慢沉到磁盘那一层（文件出现的位置），一直沉到文件出现前：不在 l1、l2 之间留一段只有终端打字的静止
  fromTo(tblChip, T('l1', '磁盘'), { y: 0 }, { y: 70, duration: Math.max(0.6, T('l2', '文件') - 0.8 - T('l1', '磁盘')), ease: 'sine.inOut', immediateRender: false }); sfx('whoosh', T('l1', '磁盘'), { g: 0.3 });
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
  const grid = heapGrid(hw, GX, GY);
  grid.pages.forEach((pg, i) => { show(pg, tCut + i * 0.025, { y: 0, s: 0.85, d: 0.25 }); set(pg.rows, 0, { scaleY: 0 }); set(pg.lp, 0, { scaleX: 0 }); });
  grid.pages.forEach((pg, i) => { if (![0, 16, 23, 32, 46].includes(i)) pg.lab.style.display = 'none'; else show(pg.lab, tCut + i * 0.025 + 0.2, { y: 0 }); });
  sfx('whoosh', tCut, { g: 0.4 });
  const kb = capt(A, '<b>8 KB</b>', GX, GY - 42); css(kb, { fontSize: '28px', color: 'var(--navy)' }); show(kb, T('l3', '8 KB'), { y: 8 }); sfx('tick', T('l3', '8 KB'));
  const tot = capt(A, `共 <b>${D.files.users.sizes[D.files.users.node] / 1024} KB</b> = ${D.heap.pages} × 8 KB`, 1240, 336); css(tot, { fontSize: '28px' });
  show(tot, T('l3', '8 KB') + 0.3, { y: 8 });
  // 行一行接一行地放：每页的行从页底往上长，指针从左往右长；放满一页换下一页
  const tF0 = T('l4'), tF1 = T('l5b', '47') + 0.2, rowsTotal = D.heap.rows.reduce((a, b) => a + b, 0);
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
  const lastL = capt(A, `最后一页 <b>${D.heap.rows[46]}</b> 行`, p46.x - 70, p46.y - 34); css(lastL, { fontSize: '26px', color: 'var(--navy)' }); show(lastL, T('l5b', '47'), { y: 8 });
  const all47 = h('div', 'abs', A); px(all47, GX, GY + 3 * 146 + 2, GW, 6); css(all47, { background: 'var(--navy)' });
  const all47L = capt(A, '<b>全部 47 页</b>', GX + GW / 2 - 80, GY + 3 * 146 + 14); css(all47L, { fontSize: '26px', color: 'var(--navy)' });
  fromTo(all47, T('l5b', '47') - 0.2, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6 }); show(all47L, T('l5b', '47'), { y: -8 }); sfx('whoosh', T('l5b', '47'), { g: 0.25 });
  [all47, all47L].forEach((x) => hide(x, T('l6', '堆') - 0.2, { d: 0.25 }));
  // 这样的文件叫堆
  const frame = h('div', 'abs', hw); px(frame, GX - 12, GY - 12, GW + 24, 3 * 146 + 36); css(frame, { border: '4px solid var(--navy)' }); frame.dataset.name = '堆';
  show(frame, T('l6', '堆') - 0.1, { y: 0, s: 1.02, d: 0.4 });
  const heapG = glossBox(A, '堆', '<b>堆</b>：表的数据文件。行按到达的顺序放，不按编号排序，哪页有空放哪页', GX, 862, 1100);
  show(heapG, T('l6', '堆'), { y: 10 }); sfx('pop', T('l6', '堆'), { g: 0.6 });
  // 谁先来谁在前：每一行页卡的第一页上，写着从几号起
  hide(kb, T('l6', '堆') - 0.3, { d: 0.2 }); hide(lastL, T('l6b') - 0.1, { d: 0.25 });
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
  [grid, frame].forEach((e) => to(e, tP + 0.3, { opacity: 0.07, duration: 0.4 })); [heapG, cnt, mk].forEach((e) => hide(e, tP + 0.2, { d: 0.3 })); gone(ta.el, tP + 0.1);
  const BX = 300, BY = 330, BW = 22 * 36 + 24;
  const big = h('div', 'abs', A); px(big, BX, BY, BW, 540); css(big, { border: '4px solid var(--navy)', background: '#fff' }); big.dataset.name = '第 23 页放大';
  const bt = capt(A, `<b>第 ${P} 页</b>（${D.heap.first[P]}–${D.heap.first[P] + 87} 号）`, BX, BY - 44); css(bt, { fontSize: '28px', color: 'var(--navy)' });
  const bh = h('div', 'abs', big, '页头'); px(bh, 0, 0, BW - 8, 34); css(bh, { background: 'var(--navy)', color: '#fff', font: '700 22px "Sans SC"', lineHeight: '34px', paddingLeft: '12px' });
  const lps = [], rws = [];
  for (let i = 0; i < 88; i++) { const c = h('div', 'abs', big); px(c, 12 + (i % 22) * 36, 44 + Math.floor(i / 22) * 24, 32, 20); css(c, { background: 'var(--sky)' }); lps.push(c); }
  const gp = h('div', 'abs', big, '空隙'); px(gp, 12, 146, BW - 32, 40); css(gp, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)', font: '600 22px "Sans SC"', color: 'var(--mute)', lineHeight: '40px', textAlign: 'center' });
  for (let k = 1; k <= 88; k++) { const j = 88 - k; const c = h('div', 'abs', big); px(c, 12 + (j % 22) * 36, 196 + Math.floor(j / 22) * 82, 32, 76); css(c, { background: 'var(--sky-lt)', border: '1.5px solid var(--pg)' }); rws[k] = c; }
  const lpsL = capt(big, '88 个指针', BW - 160, 2); css(lpsL, { color: '#fff', fontSize: '22px', lineHeight: '30px' });
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

  // ── 堆缩到下方，留出上面给索引：第 23 页的放大收回到页卡，地址 (23,26) 跟着落到第 23 页旁边 ──
  const tS = Tend('l11') + 0.35;
  const M = (x, y) => [384 + 0.6 * x, 400 + 0.6 * y];          // 缩小后的堆：原坐标 → 画面坐标
  [big, bt, rowsL, l26, par, pl, ctT, ctidG].forEach((e) => gone(e, tS, 0.3)); gone(a26, tS, 0.3);
  [grid, frame].forEach((e) => fromTo(e, tS, { opacity: 0.07 }, { opacity: 1, duration: 0.5, immediateRender: false }));
  fromTo(hw, tS + 0.1, { x: 0, y: 0, scale: 1 }, { x: 384, y: 400, scale: 0.6, duration: 0.9, ease: 'power3.inOut', immediateRender: false });
  sfx('whoosh', tS + 0.1, { g: 0.35 });
  const c23 = grid.pos(P), [p23x, p23y] = M(c23.x + c23.w / 2, c23.y);   // 第 23 页页卡的上沿中点（缩小后）
  grid.pages.forEach((pg) => { if (pg.lab.style.display !== 'none') gone(pg.lab, tS + 0.1, 0.2); });   // 缩小后的页号太小：收起，按正常字号另标
  const smallLabs = [[0, -1], [16, -1], [32, -1], [46, 1]].map(([i, side]) => { const q = grid.pos(i), [x, y] = M(side < 0 ? q.x : q.x + q.w, q.y + q.h / 2); const l = capt(pgS, String(i), side < 0 ? x - 44 : x + 10, y - 15, 'cap mono'); css(l, { fontSize: '22px', color: 'var(--ink2)' }); show(l, tS + 0.9, { y: 0 }); return l; });   // 页号放在每排左边和最后一页右边，不放进两排之间的窄缝
  const ctidTag = tagEl(pgS, `ctid (${P},${LP})`, p23x - 70, p23y - 44, 'navy'); css(ctidTag, { fontSize: '22px' }); show(ctidTag, tS + 0.9, { y: 8 });
  const pgTexts = [ctidTag, ...smallLabs];
  gone(ctidTag, T('l13e') - 0.3, 0.25);                                         // 结构图里的字：最后整张图缩到右半边时先收起，免得字太小
  const heads = [[tS + 0.5, '要按名字找，就要一个索引'], [T('l14') - 0.2, '三个索引：各是一个文件，一棵 B 树'], [T('l21') - 0.3, '两种做法']];
  heads.forEach(([t, txt], i) => { const e = hdoc(A, txt, 72, 128); set(e, 0, { autoAlpha: 0 }); tl.fromTo(e, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, t); if (i < heads.length - 1) gone(e, heads[i + 1][0] - 0.3, 0.3); });
  gone(head0, tS + 0.2, 0.3);
  // 没有索引：只能一页页翻。一道扫描框从第 0 页走到第 46 页
  const scan = h('div', 'abs', pgS); css(scan, { border: '4px solid var(--warn)', pointerEvents: 'none' }); scan.dataset.name = '一页页翻';
  const tSc0 = T('l12') + 0.2, tSc1 = T('l12b') + 0.3;   // 整句都在翻
  F((t) => { const k = clamp((t - tSc0) / (tSc1 - tSc0)), i = Math.min(46, Math.floor(k * 47)), q = grid.pos(i), [x0, y0] = M(q.x, q.y); px(scan, x0 - 4, y0 - 4, 0.6 * q.w + 8, 0.6 * q.h + 8); scan.style.opacity = t < tSc0 || t > tSc1 + 0.3 ? 0 : 1; });
  const scanL = tagEl(pgS, '找 Alice：47 页一页页翻？', 444, 584, 'warn'); css(scanL, { fontSize: '28px', padding: '6px 18px' }); set(scanL, 0, { autoAlpha: 0 }); slam(scanL, T('l12', '找') - 0.1, { from: 1.3 });
  // 「47 页从头翻到尾」：整块堆罩上一层浅红——这些页都得翻
  const [ax0, ay0] = M(GX - 12, GY - 12), [ax1, ay1] = M(GX + GW + 12, GY + 3 * 146 + 24);
  const allP = h('div', 'abs', pgS); px(allP, ax0, ay0, ax1 - ax0, ay1 - ay0); css(allP, { background: 'rgba(184,68,47,.22)', border: '4px solid var(--warn)' }); allP.dataset.name = '47 页都得翻';
  set(allP, 0, { autoAlpha: 0 }); set(allP, T('l12', '47') - 0.1, { autoAlpha: 1 }); set(allP, T('l12b') - 0.1, { autoAlpha: 0 }); hide(scanL, T('l12b') + 0.2, { d: 0.25 });
  sfx('tick', tSc0, { g: 0.4 });
  // 三棵树的位置：左主键、中姓名、右年龄。每棵先是一排页（文件），页飞起来排成树：根在上，叶子一排
  const Tr = D.trees, FL = D.files;
  const RY = 252, LY = 356, FY = 472;
  const COL = { users_pkey: { x: 72, w: 560, name: '主键索引' }, idx_name: { x: 672, w: 560, name: '姓名索引' }, idx_age: { x: 1272, w: 560, name: '年龄索引' } };
  const ovT = overlay(pgS);
  const grow = (key, tFile, tFly, keyTxt) => {
    const c = COL[key], t = Tr[key], n = t.pages, tw = c.w / n, nl = t.leafCount;
    const lw = Math.min(46, (c.w - (nl - 1) * 3) / nl), lg = (c.w - nl * lw) / Math.max(1, nl - 1), rootW = nl <= 6 ? 280 : 220, rx = c.x + c.w / 2 - rootW / 2;
    const tiles = [];
    for (let k = 0; k < n; k++) {
      const tile = h('div', 'abs', pgS); px(tile, c.x + k * tw, FY, Math.max(2, tw - (tw > 8 ? 3 : 1)), 46);
      css(tile, { background: k === 0 ? 'var(--navy)' : k === t.root ? 'var(--pg)' : 'var(--wash)', border: tw > 8 ? '2px solid var(--pg)' : 'none' });
      tl.fromTo(tile, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.25, immediateRender: true }, tFile + k * 0.012);
      tiles.push(tile);
    }
    const fl = capt(pgS, `<b>${c.name}</b>：另一个文件 · ${FL[key].path} · ${n} 页`, c.x, FY + 54); if (key === 'idx_name') { fl.innerHTML = `<b>索引</b>：另一个文件 · 姓名索引 ${FL[key].path} · ${n} 页`; fl.dataset.gloss = '索引'; } css(fl, { fontSize: '22px' }); show(fl, tFile + 0.2, { y: -6 }); pgTexts.push(fl);
    // 页飞起来：第 0 页是元数据，留在原处淡掉；根页飞到上面，叶子页排成一排
    fromTo(tiles[t.root], tFly, { x: 0, y: 0, width: Math.max(2, tw - 3), height: 46 }, { x: rx - (c.x + t.root * tw), y: RY - FY, width: rootW, height: 46, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
    const leafX = [];
    t.leaves.forEach((pg, i) => {
      const lx = c.x + i * (lw + lg); leafX.push(lx + lw / 2);
      fromTo(tiles[pg], tFly + 0.05 + i * 0.008, { x: 0, y: 0, width: Math.max(2, tw - 3), height: 46 }, { x: lx - (c.x + pg * tw), y: LY - FY, width: lw, height: 46, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
    });
    gone(tiles[0], tFly, 0.3);
    t.leaves.forEach((pg, i) => { const e = path(ovT, `M${rx + rootW / 2 + (i - (nl - 1) / 2) * Math.min(8, rootW / nl)},${RY + 46} L${leafX[i]},${LY}`, 'accent', { w: 1.5, arrow: false }); draw(e, tFly + 0.85 + i * 0.005, 0.3); });
    const kt = h('div', 'abs', pgS, keyTxt); px(kt, rx + 14, RY + 10); css(kt, { font: '600 22px var(--mono)', color: '#fff', whiteSpace: 'nowrap' }); show(kt, tFly + 0.9, { y: 0, d: 0.3 }); pgTexts.push(kt);
    const hd = capt(pgS, '', c.x, RY - 50); css(hd, { fontSize: '24px', color: 'var(--ink)' }); pgTexts.push(hd);
    sfx('whoosh', tFly, { g: 0.4 }); sfx('thud', tFly + 0.85, { g: 0.4 });
    return { c, t, tiles, leafX, lw, rootW, rx, fl, hd, root: tiles[t.root], leaf: (i) => tiles[t.leaves[i]] };
  };
  // 姓名树：先只讲它一棵
  const tNF = T('l12b', '索引') - 0.2, tNT = T('l13b', 'B 树') - 0.2;
  const nT = grow('idx_name', tNF, tNT, 'User00108 · …');
  fromTo(nT.fl, T('l13', '另外一个文件'), { color: '#4f5c67' }, { color: '#b8442f', duration: 0.2 }); gone(nT.fl, T('l13e') - 0.3, 0.25);
  // 叶子在原地展开：最左边那页叶子拉出一张「名字 | 行的地址」的表，放在树的左边
  const lf0 = nT.leaf(0), lfx = nT.leafX[0];
  const panel = h('div', 'abs', pgS); px(panel, 72, 300, 560, 268); css(panel, { border: '3px solid var(--pg)', background: '#fff', transformOrigin: `560px ${LY + 23 - 300}px` }); panel.dataset.name = '姓名树最左边那页叶子';
  const ph = h('div', '', panel, '姓名树最左边那页叶子'); css(ph, { background: 'var(--pg)', color: '#fff', font: '700 26px "Sans SC"', padding: '6px 18px' });
  const cell = (r, html, w, f) => { const e = h('div', '', r, html); css(e, { width: w + 'px', font: f, padding: '5px 18px' }); return e; };
  const sh = h('div', '', panel); css(sh, { display: 'flex', background: 'var(--wash)', color: 'var(--ink2)' });
  const hK = cell(sh, '名字', 230, '600 24px "Sans SC"'), hA = cell(sh, '行的地址（页, 项）', 290, '600 24px "Sans SC"'); css(hA, { borderLeft: '1.5px solid var(--line)' });
  const prow = [['Alice', `(${P}, ${LP})`], ['User00001', '(0, 1)'], ['User00002', '(0, 2)'], ['…', '…']].map(([k, a]) => {
    const r = h('div', '', panel); css(r, { display: 'flex', color: 'var(--navy)', borderTop: '1.5px solid var(--line)' });
    cell(r, k, 230, '600 30px var(--mono)'); const ac = cell(r, a, 290, '600 30px var(--mono)'); css(ac, { borderLeft: '1.5px solid var(--line)' }); r.ac = ac; return r;
  });
  const ovP = overlay(pgS); const pl0 = path(ovP, `M${lfx - 8},${LY + 23} L634,${LY + 23}`, 'pg', { w: 2, arrow: false, dashed: '6 6' });   // 叶子与展开的表之间的虚线
  tl.fromTo(panel, { autoAlpha: 0, scale: 0.15 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'power3.out', immediateRender: true }, T('l13c') - 0.2); arrowIn(pl0, T('l13c') - 0.2, 0.3);
  to(lf0, T('l13c') - 0.2, { backgroundColor: '#336791', duration: 0.2 }); sfx('whoosh', T('l13c') - 0.2, { g: 0.3 });
  fromTo(hK, T('l13c', '名字'), { backgroundColor: 'rgba(255,211,107,0)' }, { backgroundColor: 'rgba(255,211,107,1)', duration: 0.2 });
  fromTo(hK, T('l13c', '地址'), { backgroundColor: 'rgba(255,211,107,1)' }, { backgroundColor: 'rgba(255,211,107,0)', duration: 0.2, immediateRender: false });
  fromTo(hA, T('l13c', '地址'), { backgroundColor: 'rgba(255,211,107,0)' }, { backgroundColor: 'rgba(255,211,107,1)', duration: 0.2 });
  fromTo(hA, T('l13d'), { backgroundColor: 'rgba(255,211,107,1)' }, { backgroundColor: 'rgba(255,211,107,0)', duration: 0.2, immediateRender: false });
  set(prow[0], T('l13d', 'Alice'), { backgroundColor: '#336791', color: '#fff' }); sfx('tick', T('l13d', 'Alice'));
  // 按名字找：一个点从根走到这页叶子；地址落到堆的第 23 页，取出这一行
  const dot = h('div', 'abs', pgS); px(dot, nT.rx + nT.rootW / 2 - 11, RY + 12, 22, 22); css(dot, { borderRadius: '50%', background: 'var(--warn)', zIndex: 3 }); set(dot, 0, { autoAlpha: 0 });
  const tW1 = T('l13e', '从根') - 0.1;
  tl.fromTo(dot, { autoAlpha: 1, x: 0, y: 0 }, { x: lfx - (nT.rx + nT.rootW / 2), y: LY - RY + 2, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, tW1);
  gone(dot, T('l13e', '地址') + 0.1, 0.25);
  const toHeap = curve(ovP, [632, 400], [p23x, p23y - 4], 'warn', { w: 4, bend: 640 }); arrowIn(toHeap, T('l13e', '堆里') - 0.3, 0.6);
  set(grid.pages[P], T('l13e', '取'), { backgroundColor: '#ffe7a6' }); sfx('pop', T('l13e', '取'), { g: 0.5 });
  const got = tagEl(pgS, '取出：2050  Alice  42', p23x + 60, p23y - 46, 'ok'); css(got, { fontSize: '22px' }); show(got, T('l13e', '这一行') - 0.1, { x: -8 }); pgTexts.push(got);
  [got, toHeap].forEach((e) => gone(e, T('l14') - 0.2, 0.3)); gone(panel, T('l14') - 0.2, 0.3); gone(pl0, T('l14') - 0.2, 0.3);
  set(grid.pages[P], T('l14') - 0.2, { backgroundColor: '#fff' });
  // 三个索引：主键树、年龄树也从各自的文件长出来
  const pT = grow('users_pkey', T('l14', '主键') - 0.1, T('l14b', 'B 树') - 0.3, '367 · 733 · …');
  const aT = grow('idx_age', T('l14', '年龄') - 0.1, T('l14b', 'B 树') - 0.15, '32 · 46 · 60 · 74');
  [pT, nT, aT].forEach((tt) => [...tt.tiles, tt.fl].forEach((e) => { if (!tt.t.leaves.includes(tt.tiles.indexOf(e)) && e !== tt.root) gone(e, T('l15') - 0.2, 0.3); }));
  // 逐棵报数：讲到哪棵，那一列框起来、写上「一个根 · 几页叶子」
  const colFrame = (tt, t0, t1) => { const f = h('div', 'abs', pgS); px(f, tt.c.x - 12, RY - 60, tt.c.w + 24, LY + 64 - RY + 60); css(f, { border: '3px solid var(--navy)' }); show(f, t0, { y: 0, d: 0.3 }); hide(f, t1, { d: 0.25 }); };
  [[pT, 'l15', '<b>主键树</b>：一个根 · 12 页叶子'], [nT, 'l15b', '<b>姓名树</b>：一个根 · 39 页叶子'], [aT, 'l16', '<b>年龄树</b>：一个根 · 5 页叶子']].forEach(([tt, cue, html], i, arr) => {
    tt.hd.innerHTML = html; show(tt.hd, T(cue) - 0.1, { y: 8 });
    colFrame(tt, T(cue) - 0.1, i < 2 ? T(arr[i + 1][1]) - 0.15 : Tend('l17') + 0.2); sfx('pop', T(cue), { g: 0.5 });
  });
  // 为什么姓名树叶子多：一项多大，按比例画（每字节 4 像素）；一页约装多少项 = 4096 ÷ 叶子页数
  const szB = h('div', 'abs', pgS); px(szB, 420, 462, 1080, 110); szB.dataset.name = '一项多大';
  const nPk = Tr.users_pkey.leafCount, nNm = Tr.idx_name.leafCount, bPk = Tr.users_pkey.aliceItem.len, bNm = Tr.idx_name.aliceItem.len;
  [[`<b>编号</b>一项 ${bPk} 字节`, bPk, '', `一页约 ${Math.round(4096 / nPk)} 项 → ${nPk} 页叶子`, 'l15c', '16'], [`<b>姓名</b>一项 ${bNm} 字节`, bNm, '名字 50 字符＋地址', `一页约 ${Math.round(4096 / nNm)} 项 → ${nNm} 页叶子`, 'l15c', '64']].forEach(([lab, by, inner, res, cue, w], i) => {
    const y = i * 56, l = capt(szB, lab, 0, y + 6); css(l, { fontSize: '26px' });
    const blk = h('div', 'abs', szB, inner); px(blk, 210, y, by * 4, 46); css(blk, { background: i ? 'var(--pg)' : 'var(--sky)', color: '#fff', font: '600 22px "Sans SC"', lineHeight: '46px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', transformOrigin: '0 50%' });
    const r = capt(szB, res, 210 + by * 4 + 20, y + 6); css(r, { fontSize: '26px', color: 'var(--navy)' });
    const t0 = T(cue, w) - 0.15;
    tl.fromTo(blk, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out', immediateRender: true }, t0); show(l, t0, { y: 6 }); show(r, T('l15d', '装得下') + i * 0.5, { x: -8 });
  });
  pgTexts.push(szB); hide(szB, T('l16') + 0.3, { d: 0.3 });
  // 年龄树：同一个年龄的地址合成一项
  const ag1 = aT.leaf(Tr.idx_age.leaves.indexOf(Tr.idx_age.leaves[1]));
  to(ag1, T('l17', '合成一项') - 0.2, { backgroundColor: '#336791', duration: 0.2 });
  const post = tagEl(pgS, `42 岁这一项：装着 ${D.agePosting.count} 个地址`, 1272, LY + 70, 'navy'); css(post, { fontSize: '22px' }); show(post, T('l17', '合成一项'), { y: -6 }); hide(post, T('l19') - 0.1, { d: 0.25 }); pgTexts.push(post);
  // 主键树里 2050 那一项，也指向第 23 页第 26 项；三棵树最后都落到同一页
  const pkLeaf = pT.leaf(Tr.users_pkey.aliceLeafPos), pkx = pT.leafX[Tr.users_pkey.aliceLeafPos];
  to(pkLeaf, T('l19', '2050') - 0.1, { backgroundColor: '#336791', duration: 0.2 }); sfx('tick', T('l19', '2050'));
  const pkTag = tagEl(pgS, `2050 → (${P}, ${LP})`, pkx - 90, LY + 70, 'navy'); css(pkTag, { fontSize: '22px' }); show(pkTag, T('l19', '2050'), { y: -6 }); pgTexts.push(pkTag);
  const ovL = overlay(pgS);
  const toP = [[pkx, LY + 112], [lfx, LY + 50], [aT.leafX[1], LY + 50]].map(([x, y]) => curve(ovL, [x, y], [p23x, p23y - 4], 'warn', { w: 3.5, bend: (y + p23y) / 2 + 40 }));
  arrowIn(toP[0], T('l19', '第 23 页') - 0.2, 0.5);
  to(lf0, T('l20b') - 0.1, { backgroundColor: '#336791', duration: 0.2 }); to(ag1, T('l20b') - 0.1, { backgroundColor: '#336791', duration: 0.2 });
  arrowIn(toP[1], T('l20b', '哪棵树') - 0.1, 0.5); arrowIn(toP[2], T('l20b', '哪棵树') + 0.1, 0.5);
  fromTo(grid.pages[P], T('l20b', '取行'), { backgroundColor: '#ffffff' }, { backgroundColor: '#ffe7a6', duration: 0.25 }); sfx('pop', T('l20b', '取行'), { g: 0.5 });
  // ── 两种做法：PostgreSQL 的整张结构图缩到右半边，左边建起 InnoDB 的做法 ──
  const tSh = T('l21') - 0.3;
  pgTexts.forEach((e) => gone(e, tSh - 0.1, 0.25)); [pT, nT, aT].forEach((tt) => gone(tt.hd, tSh - 0.1, 0.25)); 
  toP.forEach((e) => gone(e, tSh - 0.1, 0.25));
  fromTo(pgS, tSh, { x: 0, y: 0, scale: 1 }, { x: 1010, y: 300, scale: 0.44, duration: 0.9, ease: 'power3.inOut', immediateRender: false }); sfx('whoosh', tSh, { g: 0.4 });
  const S2 = (x, y) => [1010 + 0.44 * x, 300 + 0.44 * y];
  // 左：InnoDB
  const ovC = overlay(A);
  const GR = { background: '#5f6a73', color: '#fff', borderColor: '#5f6a73' };
  // 左：InnoDB
  const li = tagEl(A, 'InnoDB · 表就是主键树', 72, 196, 'grey'); css(li, { fontSize: '30px' });
  show(li, T('l21') - 0.1, { x: -20 });
  const tTree = Math.min(T('l22') + 0.1, T('l21') + 0.5);
  const ir = h('div', 'node grey', A, '主键树的根'); px(ir, 330, 290, 280); css(ir, { ...GR, height: '56px', lineHeight: '51px', fontSize: '26px' });
  const il = [];
  for (let i = 0; i < 6; i++) {
    const lf = h('div', 'abs', A); px(lf, 90 + i * 132, 420, 120, 150); css(lf, { border: '2.5px solid #5f6a73', background: '#eef0f2' }); lf.dataset.name = '主键树的叶子';
    for (let k = 0; k < 4; k++) { const r = h('div', 'abs', lf); px(r, 8, 12 + k * 32, 100, 22); css(r, { background: '#8a949c' }); }
    il.push(lf); const e = path(ovC, `M470,346 L${150 + i * 132},420`, 'grey', { w: 2, arrow: false }); draw(e, T('l22', '表本身') + i * 0.12, 0.3);
  }
  wipe(ir, tTree, { dir: 'l' }); il.forEach((x, i) => show(x, T('l22', '表本身') + i * 0.12, { y: 10 }));
  sfx('pop', tTree + 0.2, { g: 0.5, p: -0.4 });
  // 叶子里装着整行：第 4 页叶子展开，露出 Alice 那一行
  const rowL = capt(A, '每格是一整行', 90, 580); css(rowL, { fontSize: '24px', color: '#4f5c67' }); show(rowL, T('l22b', '整行'), { y: -8 });
  const bigRow = h('div', 'abs', A, '2050 · Alice · 42'); px(bigRow, 90 + 3 * 132 - 70, 430, 300, 56); css(bigRow, { ...GR, font: '700 28px var(--mono)', lineHeight: '56px', textAlign: 'center' });
  tl.fromTo(bigRow, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)', immediateRender: true }, T('l22b', '叶子')); sfx('pop', T('l22b', '叶子'), { g: 0.5 });
  hide(bigRow, T('l23') - 0.1, { d: 0.25 }); hide(rowL, T('l23') - 0.1, { d: 0.25 });
  // 姓名索引：叶子里存的是主键
  const inr = h('div', 'node grey', A, '姓名索引'); px(inr, 150, 650, 240); css(inr, { ...GR, height: '52px', lineHeight: '47px', fontSize: '26px' });
  const inl = h('div', 'node grey', A, 'Alice → 主键 2050'); px(inl, 90, 760, 360); css(inl, { ...GR, height: '52px', lineHeight: '47px', fontSize: '26px' });
  const ie = path(ovC, 'M270,702 L270,760', 'grey', { w: 2, arrow: false });
  slam(inr, T('l23') - 0.1, { from: 1.3 }); draw(ie, T('l23'), 0.3); slam(inl, T('l23', '主键') - 0.1, { from: 1.3 }); sfx('tick', T('l23', '主键'), { p: -0.3 });
  // 按名字找：先拿到主键 2050，再从主键树的根走到叶子 —— 两棵树
  const tok = tagEl(A, 'Alice', 120, 830, 'warn'); css(tok, { fontSize: '26px' });
  const t0 = T('l23b') - 0.1;
  set(tok, 0, { autoAlpha: 0 }); set(tok, t0, { autoAlpha: 1 });
  keyed(tok).at(T('l23b', '主键') - 0.1, { html: '主键 2050' });
  tl.fromTo(tok, { x: 0, y: 0 }, { x: 300, y: -560, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, T('l23b', '主键树') - 0.6);
  tl.fromTo(tok, { x: 300, y: -560 }, { x: 330, y: -400, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, T('l23b', '主键树') + 0.2);
  tl.fromTo(il[3], { borderColor: '#5f6a73' }, { borderColor: '#b8442f', duration: 0.2, immediateRender: false }, T('l23b', '主键树') + 0.7);
  const two = tagEl(A, '按名字找：查了两棵树', 480, 760, 'grey'); css(two, { fontSize: '26px' }); show(two, T('l23b', '主键树') + 0.6, { x: -10 }); sfx('tick', T('l23b', '主键树') + 0.7);
  // 「再查主键树」：整棵主键树（根和六页叶子）一下亮起，第二趟查找落在它身上
  [ir, ...il].forEach((e) => { set(e, T('l23b', '主键树') - 0.1, { backgroundColor: '#ffe7a6', ...(e === ir ? { color: '#193145' } : {}) }); set(e, T('l24') - 0.2, { backgroundColor: e === ir ? '#5f6a73' : '#eef0f2', ...(e === ir ? { color: '#ffffff' } : {}) }); });
  hide(tok, T('l24') - 0.1, { d: 0.25 });
  // 右：PostgreSQL —— 刚才那张结构图缩在右半边：整行都在堆里，三个索引都直接指向堆
  const lpg = tagEl(A, 'PostgreSQL · 堆 + 三个索引', 1010, 196); css(lpg, { fontSize: '30px' }); show(lpg, T('l24') - 0.1, { x: 20 });
  const [hx0, hy1] = S2(...M(GX - 12, GY + 3 * 146 + 24)), [hx1] = S2(...M(GX + GW + 12, 0));
  const hpl = capt(A, '堆：整行都在这里', hx0, hy1 + 14); css(hpl, { fontSize: '26px', color: 'var(--pg)', fontWeight: 700 }); show(hpl, T('l24', '整行'), { y: 8 });
  const [q23x, q23y] = S2(p23x, p23y), ovR = overlay(A);
  const fromT = [pkx, lfx, aT.leafX[1]].map((x) => S2(x, LY + 46));
  const arR = fromT.map(([x, y]) => curve(ovR, [x, y], [q23x, q23y - 2], 'accent', { w: 3.5, bend: (y + q23y) / 2 }));
  arR.forEach((a, i) => arrowIn(a, T('l25', '每个索引') + i * 0.15, 0.5)); sfx('pop', T('l25', '地址'), { p: 0.4 });
  const same = tagEl(A, '主键索引也一样', fromT[0][0] - 60, fromT[0][1] + 40, 'navy'); css(same, { fontSize: '24px' }); show(same, T('l25', '主键索引'), { y: -8 }); sfx('tick', T('l25', '主键索引'), { p: 0.4 });
  fromTo(arR[0], T('l25', '主键索引'), { strokeWidth: 3.5 }, { strokeWidth: 7, duration: 0.25 });
  // InnoDB 的叶子讲「表本身就是主键树」时一格格装上整行
  const tFill0 = T('l22', '表本身'), tFill1 = Math.max(tFill0 + 1.2, T('l22b') + 0.6);
  il.forEach((lf, i) => [...lf.children].forEach((r, k) => show(r, tFill0 + (tFill1 - tFill0) * (i * 4 + k) / 24, { y: 0, d: 0.15 })));
  // 章末：InnoDB 那半边淡去，PostgreSQL 的结构图放回整屏——下一章从堆里的第 23 页接着讲
  const tEnd = Tend('l25') + 0.4;
  const cW = h('div', 'abs', A); px(cW, 0, 0, 1920, 1080);
  [...A.children].forEach((e) => { if (e !== pgS && e !== cW) cW.appendChild(e); });
  gone(cW, tEnd, 0.5);
  fromTo(pgS, tEnd + 0.1, { x: 1010, y: 300, scale: 0.44 }, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'power3.inOut', immediateRender: false }); sfx('whoosh', tEnd + 0.1, { g: 0.3 });
});
