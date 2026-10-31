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
  const brl = capt(A, `那时表里 <b>${nShow}</b> 页：页号从 0 数起，0、1、2 … ${nShow - 1}`, SX, SY - 56); css(brl, { fontSize: '26px', color: 'var(--navy)' });
  fromTo(br, T('i4', '24'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.5 }); show(brl, T('i4', '24'), { y: 8 }); sfx('tick', T('i4', '24'));
  // 第 24 页的页号是 23：讲「最后一页」时直接标出来
  const lastT = tagEl(A, `最后一页 · 页号 ${P}`, strip.pos(P).x + 66 - 236, SY - 104, 'navy'); css(lastT, { fontSize: '26px' }); show(lastT, T('i5', '最后一页'), { y: 8 }); sfx('tick', T('i5', '最后一页'), { p: 0.4 });
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
  // 插进去的键留在叶子下面，不飞走
  fly(A, '42', from, [1540 + 150 - 24, 826], T('i6', '各插一项'), { cls: 'navy', fs: 26, d: 0.6, stay: true });
  // 2050 比已有的编号都大 → 主键树最右边的叶子
  const rk = tpk.leaves.length - 1;
  const cmp1 = capt(A, '已有：1 … 2049　<b style="color:var(--pg)">2050</b> 最大', 90, 880); css(cmp1, { fontSize: '26px' }); show(cmp1, T('i7', '都大'), { y: 8 });
  fly(A, '2050', from, [tpk.leafX(rk) - 36, 826], T('i7b', '最右边') - 0.6, { cls: 'navy', fs: 26, d: 0.6, stay: true });
  classAt(tpk.leaves[rk], 'hl', T('i7b', '最右边')); sfx('tick', T('i7b', '最右边'), { p: -0.4 });
  // Alice 按字母排在所有 User 前面 → 姓名树最左边的叶子
  const cmp2 = capt(A, '<b style="color:var(--pg)">A</b>lice 排在所有 <b>U</b>ser… 前面', 700, 880); css(cmp2, { fontSize: '26px' }); show(cmp2, T('i8', 'User'), { y: 8 });
  fly(A, 'Alice', from, [tnm.leafX(0) - 20, 826], T('i9', '最左边') - 0.6, { cls: 'navy', fs: 26, d: 0.6, stay: true });
  classAt(tnm.leaves[0], 'hl', T('i9', '最左边')); sfx('tick', T('i9', '最左边'));

  // ── B：叶子满了一分为二，长出根；编号递增时总在最右边分裂，左页只装九成 ──
  hdoc(B, '叶子放满，就一分为二', 72, 128);
  const ovB = overlay(B);
  const L1 = h('div', 'page', B); px(L1, 200, 500, 520, 120); L1.dataset.name = '一页叶子';
  const fill1 = h('div', 'abs', L1); px(fill1, 6, 6, 0, 102); css(fill1, { background: 'var(--sky-lt)' });
  const full = capt(B, '一页叶子', 200, 460); css(full, { fontSize: '26px' });
  const tS = T('i10');
  slam(L1, tS - 0.4, { from: 1.25 }); show(full, tS - 0.4);
  // 装满与对半分都写明起点：画面提前量加大后，两段可能挨得很近，不能让后一段从前一段的中途接手（跳播会不一样）
  fromTo(fill1, tS - 0.1, { width: 0 }, { width: 502, duration: Math.max(0.5, T('i10', '一分为二') - tS - 0.05), ease: 'power1.in' });   // 一路装到满，满的那一刻正好分裂
  const fl = capt(B, '满了', 600, 460); css(fl, { fontSize: '26px', color: 'var(--warn)', fontWeight: 700 }); 
  // 一分为二：右半边搬到新的一页
  const Lb = h('div', 'page', B); px(Lb, 780, 500, 520, 120); Lb.dataset.name = '新的一页叶子';
  const half = h('div', 'abs', B); px(half, 200 + 6 + 251, 506, 251, 102); css(half, { background: 'var(--pg)' });
  const tSp = T('i10', '一分为二');
  wipe(Lb, tSp - 0.2, { dir: 'l', d: 0.3 });
  set(half, 0, { autoAlpha: 0 }); set(half, tSp, { autoAlpha: 1 });
  fromTo(fill1, tSp, { width: 502 }, { width: 251, duration: 0.01, immediateRender: false });
  to(half, tSp + 0.05, { x: 780 - 200 - 251, duration: 0.6, ease: 'power3.inOut' }); to(half, tSp + 0.7, { backgroundColor: '#cfe0ee', duration: 0.3 });
  const halfL = capt(B, '对半分：两页各装五成', 560, 640); css(halfL, { fontSize: '26px', color: 'var(--pg-dk)', fontWeight: 700 }); show(halfL, tSp + 0.7, { y: -8 });
  // 「各装一半」：分开的两页一起亮起
  const hl2 = h('div', 'abs', B); px(hl2, 196, 496, 1108, 128); css(hl2, { background: 'rgba(255,200,60,.35)', border: '3px solid #e0a11b' }); set(hl2, 0, { autoAlpha: 0 }); set(hl2, T('i10', '各装一半') - 0.1, { autoAlpha: 1 }); set(hl2, T('i11') - 0.1, { autoAlpha: 0 });
  show(fl, tS + 0.6, { y: 8, d: 0.3 }); hide(fl, Math.max(tSp, tS + 1.0), { d: 0.2 }); sfx('thud', tSp + 0.6, { g: 0.6 });
  const rt = h('div', 'node', B, '根'); px(rt, 670, 300, 160); css(rt, { height: '52px', lineHeight: '47px', fontSize: '26px' });
  const e1 = path(ovB, 'M720,352 L460,500', 'dim', { w: 2.5, arrow: false }), e2 = path(ovB, 'M780,352 L1040,500', 'dim', { w: 2.5, arrow: false });
  const tR = T('i11', '上面');
  slam(rt, tR, { from: 1.4 }); draw(e1, tR + 0.1, 0.3); draw(e2, tR + 0.1, 0.3); sfx('pop', tR);
  const gr = D.growth.rootAtRow;
  const rows = tableDoc(B, ['树', '长出根，是在插入第几行时'], [['姓名树', `第 ${gr.idx_name} 行`], ['主键树', `第 ${gr.users_pkey} 行`], ['年龄树', `第 ${gr.idx_age} 行`]], 1380, 190);
  css(rows, { fontSize: '24px' }); show(rows, T('i11') + 0.8, { x: 20 });
  // 编号一路递增：最右边那页满了就分裂。先演「要是对半分」：左边那页以后不进新编号，永远一半；所以装到九成就停；也不装满；最后才起名「填充比例」（G4、G6）
  // 根出来以后停一停，再换到主键树的那一排叶子
  const tOut = Math.max(tR + 2.4, T('i12', '递增') - 0.2);
  [L1, Lb, half, rt, e1, e2, full, halfL].forEach((e) => gone(e, tOut, 0.35));   // fill1 在 L1 里，随 L1 一起淡出；单独给它一个淡出，倒着跳回来时它会留在隐藏状态
  const row9 = h('div', 'abs', B); px(row9, 120, 520, 1700, 140); row9.dataset.name = '主键树的叶子：最右边分裂';
  const LW = 260, FW = LW - 10, leaves9 = [];
  for (let i = 0; i < 6; i++) {
    const lf = h('div', 'page', row9); px(lf, i * (LW + 20), 0, LW, 100);
    const f = h('div', 'abs', lf); px(f, 5, 5, i < 4 ? FW * 0.9 : 0, 84); css(f, { background: 'var(--sky-lt)' });
    const lab = h('div', 'abs', lf, ''); px(lab, 70, 28); css(lab, { font: '700 26px "Sans SC"', color: 'var(--pg-dk)', whiteSpace: 'nowrap' });
    lf.f = f; lf.lab = lab; leaves9.push(lf);
  }
  const tr9 = tOut + 0.4;
  // 这排叶子属于主键树：上面一个根，连线到每一页；最右边分裂出新的一页时，根下多一条线
  const rt9 = h('div', 'node', B, '主键树的根'); px(rt9, 700, 360, 300); css(rt9, { height: '52px', lineHeight: '47px', fontSize: '26px' });
  show(rt9, tr9 - 0.2, { y: -10 });
  const ov9 = overlay(B);
  const tSplit = T('i12', '分裂');
  for (let i = 0; i < 6; i++) { const e9 = path(ov9, `M850,412 L${120 + i * (LW + 20) + LW / 2},520`, 'dim', { w: 2, arrow: false }); draw(e9, i < 5 ? tr9 - 0.2 + i * 0.08 : tSplit, 0.3); }
  leaves9.slice(0, 5).forEach((lf, i) => show(lf, tr9 - 0.2 + i * 0.1, { x: -20, d: 0.25 }));
  set(leaves9[5], 0, { autoAlpha: 0 });
  fromTo(leaves9[4].f, tr9 + 0.6, { width: 0 }, { width: FW, duration: Math.max(0.4, tSplit - tr9 - 0.7), ease: 'none' });   // 最右边那页装满
  // 先按一般的分裂对半分：左右各一半
  set(leaves9[5], tSplit, { autoAlpha: 1 });
  fromTo(leaves9[4].f, tSplit, { width: FW }, { width: FW * 0.5, duration: 0.4, immediateRender: false }); fromTo(leaves9[5].f, tSplit, { width: 0 }, { width: FW * 0.5, duration: 0.4 }); sfx('thud', tSplit, { g: 0.55 });
  // 可后来的编号都更大，只进最右边：左边那页再也进不来
  const tB2 = T('i12b', '左边') - 0.2;
  [0, 1, 2].forEach((j) => fly(B, '更大的编号', [1500, 880], [120 + 5 * (LW + 20) + 60, 540], tB2 + j * 0.5, { cls: 'navy', fs: 22, d: 0.45, sink: true }));
  fromTo(leaves9[5].f, tB2 + 0.6, { width: FW * 0.5 }, { width: FW * 0.85, duration: 1.2, ease: 'none', immediateRender: false });
  const lt = tagEl(B, '左边那页：以后不会再进新编号', 120 + 4 * (LW + 20) - 120, 640, 'navy'); css(lt, { fontSize: '24px' }); show(lt, T('i12b', '左边') - 0.1, { y: 8 }); hide(lt, T('i13') - 0.2, { d: 0.25 });
  // 要是对半分：它就永远半空（左边几页都画成一半，空着的一半打上红色虚线）
  const tC2 = T('i12c', '对半分') - 0.2, t13 = T('i13', '九成') - 0.2;
  leaves9.slice(0, 4).forEach((lf) => fromTo(lf.f, tC2, { width: FW * 0.9 }, { width: FW * 0.5, duration: 0.4 }));
  leaves9.slice(0, 5).forEach((lf) => { const e = h('div', 'abs', lf); px(e, 5 + FW * 0.5, 5, FW * 0.5, 84); css(e, { border: '3px dashed var(--warn)', background: 'rgba(184,68,47,.06)' }); set(e, 0, { autoAlpha: 0 }); show(e, tC2 + 0.3, { y: 0, d: 0.25 }); hide(e, t13, { d: 0.25 }); });
  const halfT = tagEl(B, '要是对半分：左边这些页永远只装一半', 120, 640, 'warn'); css(halfT, { fontSize: '24px' }); show(halfT, tC2 + 0.3, { y: 8 }); hide(halfT, t13, { d: 0.25 }); sfx('error', tC2 + 0.3, { g: 0.35 });
  // 所以左边那页装到九成就停；右边新页只拿走一成
  leaves9.slice(0, 5).forEach((lf, i) => { fromTo(lf.f, t13, { width: FW * 0.5 }, { width: FW * 0.9, duration: 0.5, immediateRender: false }); keyed(lf.lab).at(t13 + 0.4, { html: i === 4 ? '九成就停' : '九成' }); });
  fromTo(leaves9[5].f, t13, { width: FW * 0.85 }, { width: FW * 0.1, duration: 0.5, immediateRender: false }); sfx('pop', t13 + 0.3, { g: 0.5 });
  const r9 = focusRing(B); r9.at(tSplit, leaves9[4]).at(tB2, leaves9[4]).at(t13, [120, 520, 5 * (LW + 20) - 20, 100]).off(T('i14b') - 0.1);
  // 也不装满：左边几页都留着一成（黄色斜纹）；要是装满，之后改一行、叶子里多一项，这页就得再分裂（右下的小图）
  const tW = T('i14b', '不装满'), tF = T('i14b', '装满的页'), tM = T('i14b', '改几行'), tQ = T('i14b', '分裂');
  const RW = FW * 0.1;
  const rooms = leaves9.slice(0, 5).map((lf, i) => {
    const r = h('div', 'abs', lf); px(r, 5 + FW * 0.9, 5, RW, 84); css(r, { background: 'repeating-linear-gradient(135deg,#ffd36b 0 6px,#fff 6px 12px)' });
    set(r, 0, { autoAlpha: 0 }); show(r, tW + i * 0.06, { y: 0, d: 0.3 }); return r;
  });
  const roomL = capt(B, '每页留着一成空位', 120, 640); css(roomL, { fontSize: '24px', color: '#7d5500', fontWeight: 700 }); show(roomL, tW + 0.2, { y: -6 });
  sfx('tick', tW, { g: 0.5 });
  const cf = h('div', 'abs', B); px(cf, 1300, 700, 560, 190); cf.dataset.name = '要是装满';
  const cfl = h('div', 'abs', cf, '要是装满：'); px(cfl, 0, 0); css(cfl, { font: '700 24px "Sans SC"', color: 'var(--warn)' });
  const fp = h('div', 'page', cf); px(fp, 0, 40, LW, 100); const ff = h('div', 'abs', fp); px(ff, 5, 5, FW, 84); css(ff, { background: 'var(--sky-lt)' });
  const fp2 = h('div', 'page', cf); px(fp2, 0, 40, LW, 100); const ff2 = h('div', 'abs', fp2); px(ff2, 5, 5, FW / 2, 84); css(ff2, { background: 'var(--sky-lt)' });
  set(cf, 0, { autoAlpha: 0 }); tl.fromTo(cf, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, immediateRender: false }, tF);
  set(fp2, 0, { autoAlpha: 0 });
  fly(B, '多一项', [1500, 900], [1300 + LW / 2 - 40, 760], tM, { cls: 'navy', fs: 22, d: 0.45, sink: true });
  fromTo(fp, tQ, { borderColor: '#336791' }, { borderColor: '#b8442f', duration: 0.15 });
  fromTo(ff, tQ + 0.05, { width: FW }, { width: FW / 2, duration: 0.35, ease: 'power2.inOut' });
  tl.fromTo(fp2, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: LW + 20, duration: 0.45, ease: 'power3.out', immediateRender: false }, tQ + 0.05);
  const spl = h('div', 'tag warn', cf, '又要分裂'); px(spl, 0, 152); css(spl, { fontSize: '24px' }); set(spl, 0, { autoAlpha: 0 }); show(spl, tQ + 0.3, { y: -6 });
  sfx('thud', tQ + 0.05, { g: 0.55 });
  // 留了一成的页：多一项落进空位，不用分裂
  const tE = Tend('i14b') + 0.05, lx2 = 120 + 2 * (LW + 20);
  fly(B, '多一项', [lx2 + 40, 860], [lx2 + LW - 70, 540], tE, { cls: 'navy', fs: 22, d: 0.45, sink: true });
  fromTo(leaves9[2].f, tE + 0.55, { width: FW * 0.9 }, { width: FW * 0.95, duration: 0.25 });
  fromTo(rooms[2], tE + 0.55, { width: RW, x: 0 }, { width: RW / 2, x: RW / 2, duration: 0.25 });
  hide(roomL, tE + 0.5, { d: 0.2 });
  const okL = h('div', 'tag ok', B, '留了一成：放得下，不用分裂'); px(okL, 120, 640); css(okL, { fontSize: '24px' }); set(okL, 0, { autoAlpha: 0 }); show(okL, tE + 0.7, { y: -6 });
  sfx('pop', tE + 0.6, { g: 0.5 });
  // 起名：一页装到几成就停，叫填充比例；索引默认 90
  const ffN = h('div', 'abs', B, '<b>填充比例</b>：一页装到几成就停　·　索引默认 <b>90</b>'); ffN.dataset.gloss = '填充比例'; px(ffN, 120, 440); css(ffN, { font: '500 30px "Sans SC"', color: 'var(--ink)', background: '#fff', padding: '6px 16px', borderLeft: '8px solid #e0a11b' });
  set(ffN, 0, { autoAlpha: 0 }); show(ffN, T('i15', '填充比例') - 0.2, { x: -12 }); sfx('pop', T('i15', '填充比例'), { g: 0.5 });
  fromTo(rt9, T('i15', '填充比例') - 0.3, { opacity: 1 }, { opacity: 0.25, duration: 0.3 });
});
