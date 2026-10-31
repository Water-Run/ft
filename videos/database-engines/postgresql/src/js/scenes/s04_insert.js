// 04 增：逐行注册，堆一页页长出来（G1）；Alice 注册时落在当时的最后一页，三棵树各插一项（G2）；分裂与长根（G3）；递增编号在最右边分裂、左页只装九成（G4）
scene('insert', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('i9') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], 1);
  const [P, LP] = D.alice.ctid, AT = D.growth.pagesAtAlice;

  // ── A：行一条条放进最后一页，满了接新页；Alice 落进第 23 页；三个索引各插一项 ──
  hdoc(A, '用户一个个注册', 72, 128);
  const tq = term(A, 72, 196, 1000, 2, { name: 'psql 会话' });
  const SX = 96, SY = 360, PW = 72;
  const ghost = h('div', 'abs', A); px(ghost, SX, SY, 24 * PW - 6, 2 * 110 - 30); css(ghost, { background: 'var(--wash)', border: '2px dashed var(--sky)' }); ghost.dataset.name = '空的文件';
  wipe(ghost, T('i1') + 0.1, { dir: 'l', d: 0.6 });
  // 堆：一张张页卡（与第二章同样的画法：页头、指针从左往右、行从页底往上）
  const strip = heapGrid(A, SX, SY, { cols: 24, cw: 66, ch: 80, gx: 6, gy: 30 });
  strip.pages.forEach((pg, i) => { set(pg, 0, { opacity: 0 }); set(pg.rows, 0, { scaleY: 0 }); set(pg.lp, 0, { scaleX: 0 }); if (![0, P].includes(i)) pg.lab.style.display = 'none'; });
  const t0 = T('i2'), t1 = Tend('i3'), nShow = AT.heap;           // 注册到第 2050 行时，堆有 24 页
  const pageAt = (t) => Math.min(nShow - 1, Math.floor(nShow * clamp((t - t0) / (t1 - t0))));
  for (let i = 0; i < nShow; i++) {
    const t = t0 + (t1 - t0) * i / nShow;
    set(strip.pages[i], t, { opacity: 1 });
    const kk = i === nShow - 1 ? 25 / D.heap.rows[i] : 1;
    fromTo(strip.pages[i].rows, t, { scaleY: 0 }, { scaleY: kk, duration: (t1 - t0) / nShow, ease: 'none' }); fromTo(strip.pages[i].lp, t, { scaleX: 0 }, { scaleX: strip.pages[i].k * kk, duration: (t1 - t0) / nShow, ease: 'none' });
  }
  // 命令一条条执行，新行一条条落进当时的最后一页
  tq.type(t0 - 0.3, '<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (1, …);', 'postgres=#', 45);
  tq.clear(t0 + (t1 - t0) * 0.5 - 0.2); tq.type(t0 + (t1 - t0) * 0.5, '<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (1024, …);', 'postgres=#', 45);
  for (let j = 0; j < 10; j++) { const t = t0 + (t1 - t0) * (j + 0.5) / 10; fly(A, '新行', [700, 260], [strip.pos(pageAt(t + 0.4)).x, SY + 30], t, { cls: 'navy', fs: 22, d: 0.35, hold: 0 }); }
  const counter = h('div', 'cap', A, ''); px(counter, 1110, 236); css(counter, { fontSize: '30px', color: 'var(--ink)' });
  F((t) => { const k = clamp((t - t0) / (t1 - t0)); const row = Math.round(1 + k * 2048); counter.innerHTML = t < t0 - 0.05 ? '' : t >= T('i5') ? `第 <b>2050</b> 行 · 堆里 <b>${nShow}</b> 页` : `第 <b>${row}</b> 行 · 堆里 <b>${Math.max(1, Math.ceil(row / 88))}</b> 页`; });
  // 满了就在末尾接一页
  const tN = T('i3', '再接一页'), pN = pageAt(tN);
  const plus = tagEl(A, '末尾 +1 页', strip.pos(pN).x - 30, SY - 52); css(plus, { fontSize: '24px' }); show(plus, tN, { y: 10 }); hide(plus, T('i4') - 0.2, { d: 0.25 }); sfx('pop', tN, { g: 0.5 });
  // 那时表里 24 页
  const br = h('div', 'abs', A); px(br, SX, SY - 16, nShow * PW - 6, 5); css(br, { background: 'var(--navy)' });
  const brl = capt(A, `那时表里 <b>${nShow}</b> 页（第 0–${nShow - 1} 页）`, SX, SY - 56); css(brl, { fontSize: '26px', color: 'var(--navy)' });
  fromTo(br, T('i4', '24'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.5 }); show(brl, T('i4', '24'), { y: 8 }); sfx('tick', T('i4', '24'));
  // Alice：那条 INSERT 敲出来，这一行落进最后一页（第 23 页）
  tq.clear(T('i4') - 0.3);
  tq.type(T('i4'), `<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (2050, 'Alice', 42);`, 'postgres=#', 45);
  const tA = T('i5', '23');
  fly(A, '2050 Alice 42', [700, 260], [strip.pos(P).x - 120, SY + 20], tA - 0.6, { cls: 'navy', fs: 24, d: 0.55 });
  to(strip.pages[P], tA, { borderColor: '#193145', borderWidth: '4px', duration: 0.15 }); sfx('thud', tA, { g: 0.6 });
  const al = tagEl(A, `Alice → 第 ${P} 页第 ${LP} 项`, strip.pos(P).x - 240, SY + 112); css(al, { fontSize: '26px' }); slam(al, tA + 0.1, { from: 1.15 });
  // 三棵树（那时的样子）；三个键从 Alice 那一行分头飞进去
  const ov = overlay(A);
  const tT = T('i6') - 0.2;
  const mk = (x, w, n, name, label) => {
    const t = btree(A, ov, x, 660, w, n, { leafW: Math.min(70, w / n - 4), rootW: 120, dy: 110, name });
    const l = capt(A, label, x, 616); css(l, { fontSize: '26px' });
    slam(t.root, tT, { from: 1.2 }); t.edges.forEach((e, i) => draw(e, tT + 0.1 + i * 0.01, 0.25)); t.leaves.forEach((lf, i) => show(lf, tT + 0.15 + i * 0.01, { y: 8, d: 0.2 })); show(l, tT);
    return t;
  };
  const tpk = mk(90, 520, AT.users_pkey - 2, '主键树', `<b>主键树</b>　${AT.users_pkey - 2} 页叶子`);
  const tnm = mk(700, 760, AT.idx_name - 2, '姓名树', `<b>姓名树</b>　${AT.idx_name - 2} 页叶子`);
  const tag = mk(1540, 300, AT.idx_age - 2, '年龄树', `<b>年龄树</b>　${AT.idx_age - 2} 页叶子`);
  sfx('pop', tT, { g: 0.5 });
  const from = [strip.pos(P).x, SY + 80];
  fly(A, '42', from, [1540 + 150 - 20, 670], T('i6', '各插一项'), { cls: 'navy', fs: 26, d: 0.6 });
  // 2050 比已有的编号都大 → 主键树最右边的叶子
  const rk = tpk.leaves.length - 1;
  const cmp1 = capt(A, '已有：1 … 2049　<b style="color:var(--pg)">2050</b> 最大', 90, 880); css(cmp1, { fontSize: '26px' }); show(cmp1, T('i7', '都大'), { y: 8 });
  fly(A, '2050', from, [tpk.leafX(rk) - 30, 776], T('i7b', '最右边') - 0.6, { cls: 'navy', fs: 26, d: 0.6 });
  classAt(tpk.leaves[rk], 'hl', T('i7b', '最右边')); sfx('tick', T('i7b', '最右边'), { p: -0.4 });
  // Alice 按字母排在所有 User 前面 → 姓名树最左边的叶子
  const cmp2 = capt(A, '<b style="color:var(--pg)">A</b>lice 排在所有 <b>U</b>ser… 前面', 700, 880); css(cmp2, { fontSize: '26px' }); show(cmp2, T('i8', 'User'), { y: 8 });
  fly(A, 'Alice', from, [tnm.leafX(0) - 20, 776], T('i9', '最左边') - 0.6, { cls: 'navy', fs: 26, d: 0.6 });
  classAt(tnm.leaves[0], 'hl', T('i9', '最左边')); sfx('tick', T('i9', '最左边'));

  // ── B：叶子满了一分为二，长出根；编号递增时总在最右边分裂，左页只装九成 ──
  hdoc(B, '叶子放满，就一分为二', 72, 128);
  const ovB = overlay(B);
  const L1 = h('div', 'page', B); px(L1, 200, 500, 520, 120); L1.dataset.name = '一页叶子';
  const fill1 = h('div', 'abs', L1); px(fill1, 6, 6, 0, 102); css(fill1, { background: 'var(--sky-lt)' });
  const full = capt(B, '一页叶子', 200, 460); css(full, { fontSize: '26px' });
  const tS = T('i10');
  wipe(L1, tS - 0.4, { dir: 'l' }); show(full, tS - 0.4);
  to(fill1, tS - 0.1, { width: 502, duration: 0.7, ease: 'power1.in' });
  const fl = capt(B, '满了', 600, 460); css(fl, { fontSize: '26px', color: 'var(--warn)', fontWeight: 700 }); 
  // 一分为二：右半边搬到新的一页
  const Lb = h('div', 'page', B); px(Lb, 780, 500, 520, 120); Lb.dataset.name = '新的一页叶子';
  const half = h('div', 'abs', B); px(half, 200 + 6 + 251, 506, 251, 102); css(half, { background: 'var(--pg)' });
  const tSp = T('i10', '一分为二');
  wipe(Lb, tSp - 0.2, { dir: 'l', d: 0.3 });
  set(half, 0, { autoAlpha: 0 }); set(half, tSp, { autoAlpha: 1 });
  to(fill1, tSp, { width: 251, duration: 0.01 });
  to(half, tSp + 0.05, { x: 780 - 200 - 251, duration: 0.6, ease: 'power3.inOut' }); to(half, tSp + 0.7, { backgroundColor: '#cfe0ee', duration: 0.3 });
  show(fl, tS + 0.6, { y: 8, d: 0.3 }); hide(fl, Math.max(tSp, tS + 1.0), { d: 0.2 }); sfx('thud', tSp + 0.6, { g: 0.6 });
  const rt = h('div', 'node', B, '根'); px(rt, 670, 300, 160); css(rt, { height: '52px', lineHeight: '47px', fontSize: '26px' });
  const e1 = path(ovB, 'M720,352 L460,500', 'dim', { w: 2.5, arrow: false }), e2 = path(ovB, 'M780,352 L1040,500', 'dim', { w: 2.5, arrow: false });
  const tR = T('i11', '根');
  slam(rt, tR, { from: 1.4 }); draw(e1, tR + 0.1, 0.3); draw(e2, tR + 0.1, 0.3); sfx('pop', tR);
  const gr = D.growth.rootAtRow;
  const rows = tableDoc(B, ['树', '长出根，是在插入第几行时'], [['姓名树', `第 ${gr.idx_name} 行`], ['主键树', `第 ${gr.users_pkey} 行`], ['年龄树', `第 ${gr.idx_age} 行`]], 1380, 190);
  css(rows, { fontSize: '24px' }); show(rows, T('i11') + 0.8, { x: 20 });
  // 编号一路递增：最右边那页满了就分裂，左边那页留在九成
  [L1, Lb, fill1, half, rt, e1, e2, full].forEach((e) => gone(e, T('i12') - 0.4, 0.35));
  const row9 = h('div', 'abs', B); px(row9, 120, 520, 1700, 140); row9.dataset.name = '主键树的叶子：最右边分裂';
  const LW = 260, leaves9 = [];
  for (let i = 0; i < 6; i++) {
    const lf = h('div', 'page', row9); px(lf, i * (LW + 20), 0, LW, 100);
    const f = h('div', 'abs', lf); px(f, 5, 5, i < 4 ? (LW - 10) * 0.9 : 0, 84); css(f, { background: 'var(--sky-lt)' });
    lf.f = f; leaves9.push(lf);
    if (i < 4) { const n9i = h('div', 'abs', lf, '九成'); px(n9i, 90, 28); css(n9i, { font: '700 26px "Sans SC"', color: 'var(--pg-dk)' }); }
  }
  const tr9 = T('i12');
  // 这排叶子属于主键树：上面一个根，连线到每一页；最右边分裂出新的一页时，根下多一条线
  const rt9 = h('div', 'node', B, '主键树的根'); px(rt9, 700, 360, 300); css(rt9, { height: '52px', lineHeight: '47px', fontSize: '26px' });
  show(rt9, tr9 - 0.3, { y: -10 });
  const ov9 = overlay(B);
  for (let i = 0; i < 6; i++) { const e9 = path(ov9, `M850,412 L${120 + i * (LW + 20) + LW / 2},520`, 'dim', { w: 2, arrow: false }); draw(e9, i < 5 ? tr9 - 0.2 + i * 0.08 : T('i12', '分裂'), 0.3); }
  leaves9.slice(0, 5).forEach((lf, i) => show(lf, tr9 - 0.2 + i * 0.1, { x: -20, d: 0.25 }));
  set(leaves9[5], 0, { autoAlpha: 0 });
  to(leaves9[4].f, tr9 + 0.6, { width: LW - 10, duration: 1.0, ease: 'none' });                 // 最右边那页装满
  const tSplit = T('i12', '分裂');
  set(leaves9[5], tSplit, { autoAlpha: 1 }); to(leaves9[4].f, tSplit, { width: (LW - 10) * 0.9, duration: 0.4 });
  to(leaves9[5].f, tSplit, { width: (LW - 10) * 0.1, duration: 0.4 }); sfx('thud', tSplit, { g: 0.55 });
  const n9 = h('div', 'abs', leaves9[4], '九成满'); px(n9, 70, 28); css(n9, { font: '700 26px "Sans SC"', color: 'var(--pg-dk)' }); show(n9, T('i13', '九成'), { y: 8 });
  const lt = tagEl(B, '左边那页', 120 + 4 * (LW + 20) + 60, 470, 'navy'); css(lt, { fontSize: '24px' }); show(lt, T('i13', '左边'), { y: 8 });
  // 后来的编号都更大：只往最右边加，不挤回左边
  const tL = T('i14');
  const r9 = focusRing(B); r9.at(T('i12', '分裂'), leaves9[4]).at(T('i13', '左边'), leaves9[4]).at(tL + 0.2, leaves9[5]).off(s.end - 0.4);
  to(leaves9[5].f, tL + 0.3, { width: (LW - 10) * 0.6, duration: Tend('i14') - tL, ease: 'none' });
  [0, 1, 2].forEach((j) => fly(B, '更大的编号', [1500, 860], [120 + 5 * (LW + 20) + 40, 540], tL + 0.2 + j * 0.6, { cls: 'navy', fs: 22, d: 0.45 }));
  const note9 = noteBox(B, '<b>填充因子默认 90</b>　B 树在最右边扩展时，叶子只装到九成', 120, 700, 900); show(note9, T('i13', '九成') + 0.2, { y: 10 });
});
