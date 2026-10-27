// 04 增：逐行注册，堆一页页长出来（G1）；Alice 注册时落在当时的最后一页，三棵树各插一项（G2）；分裂与长根（G3）；递增编号在最右边分裂、左页只装九成（G4）
scene('insert', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('i9') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], 1);
  const [P, LP] = D.alice.ctid, AT = D.growth.pagesAtAlice;

  // ── A：堆一页页长出来；Alice 落在第 23 页；三棵树各插一项 ──
  hdoc(A, '用户一个个注册', 72, 128);
  const q = psqlBox(A, '', 72, 200, 820); css(q, { fontSize: '23px' });
  const ghost = h('div', 'abs', A); px(ghost, 90, 330, 47 * 37 - 4, 120); css(ghost, { background: 'var(--wash)', border: '2px dashed var(--sky)' }); ghost.dataset.name = '空的文件';
  wipe(ghost, T('i1') + 0.1, { dir: 'l', d: 0.6 });
  const strip = heapStrip(A, 90, 330, { w: 33, gap: 4, h: 120, labels: [0, P] });
  strip.pages.forEach((pg) => set(pg, 0, { opacity: 0 }));
  const t0 = T('i2'), t1 = Tend('i3'), nShow = AT.heap;           // 注册到第 2050 行时，堆有 24 页
  for (let i = 0; i < nShow; i++) {
    const t = t0 + (t1 - t0) * i / nShow;
    set(strip.pages[i], t, { opacity: 1 });
    fromTo(strip.pages[i].fill, t, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: i === nShow - 1 ? 26 / D.heap.rows[i] : 1, duration: (t1 - t0) / nShow, ease: 'none' });
  }
  sfx('tick', t0, { g: 0.4 }); sfx('tick', (t0 + t1) / 2, { g: 0.35 }); sfx('tick', t1, { g: 0.3 });
  const counter = h('div', 'cap', A, ''); px(counter, 90, 490); css(counter, { fontSize: '28px' });
  F((t) => { const k = clamp((t - t0) / (t1 - t0), 0, 1); const row = Math.round(1 + k * 2049); counter.innerHTML = t < t0 - 0.05 ? '' : `第 <b>${row}</b> 行 · 堆里 <b>${Math.max(1, Math.ceil(row / 88))}</b> 页`; });
  const kq = keyed(q);
  kq.at(t0, { html: '<span class="p">postgres=#</span> <span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (1, …);\n<span class="d">INSERT 0 1</span>' });
  kq.at(t0 + (t1 - t0) * 0.5, { html: '<span class="p">postgres=#</span> <span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (1024, …);\n<span class="d">INSERT 0 1</span>' });
  kq.at(T('i4'), { html: `<span class="p">postgres=#</span> <span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (2050, 'Alice', 42);\n<span class="d">INSERT 0 1</span>` });
  const nl = noteBox(A, '最后一页满了，就在文件末尾再接一页', 960, 210, 700); show(nl, T('i3', '再接一页'), { x: 20 }); sfx('pop', T('i3', '再接一页'), { g: 0.5 });
  hide(nl, T('i4') - 0.2, { d: 0.3 });
  // Alice：第 23 页
  const tA = T('i5', '23');
  classAt(strip.pages[P], 'hl', tA); sfx('thud', tA, { g: 0.6 });
  const al = tagEl(A, `Alice → 第 ${P} 页第 ${LP} 项`, 90 + P * 37 - 120, 500); slam(al, tA + 0.1, { from: 1.15 });
  const pg24 = capt(A, `那时表里 ${AT.heap} 页：第 0–${AT.heap - 1} 页`, 960, 220); show(pg24, T('i4', '24'), { x: 20 });
  // 三棵树（当时的形状）各插一项
  const ov = overlay(A);
  const mk = (x, w, n, name, label, hl) => {
    const t = btree(A, ov, x, 600, w, n, { leafW: Math.min(70, w / n - 4), rootW: 120, dy: 100, name });
    const l = capt(A, label, x, 560);
    const tt = T('i6');
    slam(t.root, tt, { from: 1.2 }); t.edges.forEach((e, i) => draw(e, tt + 0.1 + i * 0.01, 0.25)); t.leaves.forEach((lf, i) => show(lf, tt + 0.15 + i * 0.01, { y: 8, d: 0.2 })); show(l, tt);
    return t;
  };
  const tpk = mk(90, 500, AT.users_pkey - 2, '主键树', `<b>主键树</b>　当时 ${AT.users_pkey - 2} 页叶子`);
  const tnm = mk(660, 760, AT.idx_name - 2, '姓名树', `<b>姓名树</b>　${AT.idx_name - 2} 页叶子`);
  const tag = mk(1490, 300, AT.idx_age - 2, '年龄树', `<b>年龄树</b>　${AT.idx_age - 2} 页`);
  sfx('pop', T('i6'), { g: 0.5 });
  const rk = tpk.leaves.length - 1;
  classAt(tpk.leaves[rk], 'hl', T('i7b', '最右边'));
  const k1 = tagEl(A, '2050 插在最右边', 300, 780); show(k1, T('i7b', '最右边') + 0.1, { y: -8 }); sfx('tick', T('i7b', '最右边'), { p: -0.4 });
  classAt(tnm.leaves[0], 'hl', T('i9', '最左边'));
  const k2 = tagEl(A, 'Alice 插在最左边', 660, 780); show(k2, T('i9', '最左边') + 0.1, { y: -8 }); sfx('tick', T('i9', '最左边'));
  const nm1 = capt(A, 'A 在所有 U（User…）前面', 960, 840); show(nm1, T('i8', 'User'), { y: 8 });
  classAt(tag.leaves[0], 'hl', T('i6') + 0.6);

  // ── B：叶子满了一分为二，长出根；最右边分裂只装九成 ──
  hdoc(B, '叶子放满，就一分为二', 72, 128);
  const ovB = overlay(B);
  const L1 = h('div', 'page', B); px(L1, 200, 520, 520, 120); L1.dataset.name = '一页叶子';
  const fill1 = h('div', 'abs', L1); px(fill1, 6, 6, 0, 102); css(fill1, { background: 'var(--sky-lt)' });
  const full = capt(B, '一页叶子', 200, 480);
  const tS = T('i10');
  wipe(L1, tS - 0.3, { dir: 'l' }); show(full, tS - 0.3);
  to(fill1, tS, { width: 502, duration: 0.6, ease: 'power1.in' });
  const Lb = h('div', 'page', B); px(Lb, 760, 520, 520, 120);
  const fillB = h('div', 'abs', Lb); px(fillB, 6, 6, 250, 102); css(fillB, { background: 'var(--sky-lt)' });
  const tSp = T('i10', '一分为二');
  wipe(Lb, tSp, { dir: 'l', d: 0.4 }); to(fill1, tSp, { width: 250, duration: 0.4 }); sfx('thud', tSp, { g: 0.6 });
  const rt = h('div', 'node', B, '根'); px(rt, 620, 300, 160);
  const e1 = path(ovB, 'M680,340 L460,520', 'dim', { w: 2.5, arrow: false }), e2 = path(ovB, 'M720,340 L1020,520', 'dim', { w: 2.5, arrow: false });
  const tR = T('i11', '根');
  slam(rt, tR, { from: 1.4 }); draw(e1, tR + 0.1, 0.3); draw(e2, tR + 0.1, 0.3); sfx('pop', tR);
  const gr = D.growth.rootAtRow;
  const rows = tableDoc(B, ['树', '长出根的时候'], [['姓名树', `第 ${gr.idx_name} 行`], ['主键树', `第 ${gr.users_pkey} 行`], ['年龄树', `第 ${gr.idx_age} 行`]], 1360, 300);
  show(rows, T('i11') + 0.8, { x: 20 });
  // 递增编号：总在最右边分裂，左页只装九成
  const tr9 = T('i12');
  const row9 = h('div', 'abs', B); px(row9, 200, 720, 1500, 140); row9.dataset.name = '主键树的叶子：最右边分裂';
  const leaves9 = [];
  for (let i = 0; i < 5; i++) {
    const lf = h('div', 'page', row9); px(lf, i * 300, 0, 280, 100);
    const f = h('div', 'abs', lf); px(f, 5, 5, i < 4 ? 243 : 0, 84); css(f, { background: i < 4 ? 'var(--wash)' : 'var(--sky-lt)' });
    if (i < 4) { const l = h('div', 'abs', lf, '九成满'); px(l, 70, 26); css(l, { font: '700 24px "Sans SC"', color: 'var(--pg-dk)' }); }
    lf.f = f; leaves9.push(lf);
  }
  leaves9.forEach((lf, i) => show(lf, tr9 + i * 0.12, { x: -20, d: 0.25 }));
  to(leaves9[4].f, T('i13'), { width: 120, duration: 0.8 }); sfx('tick', T('i13'), { p: 0.4 });
  const nx = link(ovB, [[1650, 700], [1700, 700]], 'accent');
  const later = capt(B, '后来的编号都更大，只往最右边加', 1080, 880); show(later, T('i14'), { y: 8 }); arrowIn(nx, T('i14'), 0.4);
  const note9 = noteBox(B, `<b>B 树的填充因子默认 90</b>　在最右边扩展时，叶子只装到九成`, 200, 880, 840); show(note9, T('i13', '九成'), { y: 10 });
});
