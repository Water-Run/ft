// 第 06 章 稀疏索引：一亿行里找 2050 → B 树每一行一项 → 颗粒、索引只记每个颗粒的第一行（一万两千多项、四十几 K）→ 二分 → 标记 → 读一个颗粒 → 代价与换来的 → 按姓名找帮不上 → 平均年龄根本不用索引
scene('index', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC, gD, gE, gF, gG, gH] = [0, 1, 2, 3, 4, 5, 6, 7].map(() => groupAt(world));
  const IDS = [1, 8193, 16385, 24577, 32769, 40961, 49153, 57345, 65537, 73729, 81921, 90113];
  const fmt = (n) => n.toLocaleString('en-US');
  // 颗粒方块：顶部几条细线表示行，第一条是「第一行」
  const granAt = (parent, x, y, w, hh, label) => { const g = mk(parent, 'gran', x, y, w, hh); for (let i = 0; i < 4; i++) { const r = h('i', i === 0 ? 'f' : '', g); css(r, { top: (14 + i * 16) + 'px' }); } if (label != null) { const l = h('div', 'gl', g, label); } return g; };

  // ── A 一亿行里找 2050 ──
  appear(gA, c0 + 0.05);
  tableTag(world, '表 <b>demo.users</b> · 一亿行', c0 + 0.1, s.end);
  const al = rowAt(gA, 100, 220, ['2050', 'Alice', '42'], [210, 310, 150], 90, 'lg y'); slide(al.row, T('i1', '二〇五〇') - 0.3, { x: -80 }); sfx('pop', T('i1', '二〇五〇'), { g: 0.6 });
  mk(gA, 'lab y', 100, 180, null, null, '要找的人');
  const whole = mk(gA, 'bar', 100, 470, 1720, 72); css(whole, { background: 'var(--g2)' }); wipe(whole, T('i1b') - 0.1, { dir: 'l', d: 0.8 });
  mk(gA, 'lab', 100, 420, null, null, '整张表 · 一亿行');
  const rdd = mk(gA, 'bar y', 100, 470, 1720, 72); const sA = T('i1b', '从头'), sB = Tend('i1b', 0.2);
  F((t) => { const k = clamp((t - sA) / Math.max(0.5, sB - sA)); rdd.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)'; rdd.style.visibility = t >= sA ? 'visible' : 'hidden'; });
  const cnt = mk(gA, 'big y', 100, 620, null, null, '已读 0 行'); css(cnt, { fontSize: '120px' }); appear(cnt, sA); countTo(cnt, 0, 100000000, sA, sB - sA, (v) => '已读 ' + fmt(Math.round(v / 100000) * 100000) + ' 行');
  vanish(gA, T('i2') - 0.1);

  // ── B 传统的索引：B 树，每一行一项 ──
  appear(gB, T('i2') - 0.1);
  const sv = svg('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, gB); css(sv, { position: 'absolute', left: '0px', top: '0px' });
  const line = (x1, y1, x2, y2, t, col = '#A0A0A0') => { const p = svg('path', { d: 'M' + x1 + ',' + y1 + ' L' + x1 + ',' + (y1 + y2) / 2 + ' L' + x2 + ',' + (y1 + y2) / 2 + ' L' + x2 + ',' + y2, fill: 'none', stroke: col, 'stroke-width': 2 }, sv); p.style.opacity = 0; tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: true }, t); return p; };
  const bt = mk(gB, 'tag o', 100, 180, null, null, '传统索引：B 树'); css(bt, { fontSize: '56px' }); wipe(bt, T('i2') - 0.1, { dir: 'l', d: 0.6 });
  const rootN = mk(gB, 'cell y', 825, 270, 300, 64, '<span>根</span>'); vanish(rootN, 0); appear(rootN, T('i2', '索引'));
  const L2 = [405, 975, 1545].map((cx, k) => { const e = mk(gB, 'cell', cx - 180, 390, 360, 64, '<span>中间节点</span>'); vanish(e, 0); appear(e, T('i2') + 1.2 + k * 0.5); classAt(e, 'on', T('i2') + 1.2 + k * 0.5, T('i2') + 1.7 + k * 0.5); line(975, 334, cx, 390, T('i2') + 1.3 + k * 0.5); return e; });
  const leaves = [], rows = [];
  for (let i = 0; i < 9; i++) {
    const x = 130 + i * 190, k = Math.floor(i / 3);
    const lf = mk(gB, 'cell sm', x, 520, 170, 56, '<span>' + (i + 1) + '</span><span>→</span>'); vanish(lf, 0); const tt = T('i2b', '每一行') + i * 0.12; appear(lf, tt); sfx('tick', tt, { g: 0.3 });
    line([405, 975, 1545][k], 454, x + 85, 520, tt + 0.05);
    const rw = mk(gB, 'cell ghost sm', x, 640, 170, 56, '<span>行 ' + (i + 1) + '</span>'); vanish(rw, 0); appear(rw, tt + 0.1);
    leaves.push(lf); rows.push(rw);
  }
  const lw0 = T('i2b', '每一行') + 0.8;
  F((t) => leaves.forEach((lf, i) => { if (i !== 4) lf.classList.toggle('on', t >= lw0 + i * 0.4 && t < lw0 + i * 0.4 + 0.35); }));
  mk(gB, 'lab', 130, 596, null, null, '索引项：每一行一项'); const lr = mk(gB, 'lab', 130, 710, null, null, '表里的行'); css(lr, { fontSize: '24px' });
  const bigN = noteAt(gB, 130, 790, '索引占的地方大'); show(bigN, T('i2c', '占的地方大') - 0.2, { y: 12 });
  const chg = noteAt(gB, 130, 850, '插入一行，路上几项都要改'); show(chg, T('i2c') + 0.6, { y: 12 });
  [rootN, L2[1], leaves[4]].forEach((e, i) => classAt(e, 'on', T('i2c', '要改') + i * 0.3, T('i2c', '要改') + i * 0.3 + 0.6));
  const tBC = T('i3') + 1.2;
  vanish(gB, tBC);

  // ── C 颗粒与稀疏索引 ──
  appear(gC, tBC);
  mk(gC, 'lab', 100, 180, null, null, 'id 这一列：已按编号排好，每 8192 行一个颗粒');
  const gr = IDS.map((id, i) => { const g = granAt(gC, 100 + i * 144, 250, 130, 110, ''); vanish(g, 0); appear(g, T('i3', '就不必') + i * 0.06); return g; });
  const dots = mk(gC, 'big', 100 + 12 * 144 - 10, 280, null, null, '…'); css(dots, { fontSize: '60px', color: 'var(--g3)' });
  const mu = mk(gC, 'badge', 640, 372, null, null, '最小单位'); css(mu, { fontSize: '30px' }); slam(mu, T('i3b2', '最小'), { from: 1.25 }); sfx('thud', T('i3b2', '最小') + 0.1, { g: 0.5 });
  const e8 = mk(gC, 'lab y', 100, 380, null, null, '↑ 8192 行 = 1 个颗粒'); show(e8, T('i3b', '八千'), { y: 10 }); 
  const g1 = glossAt(gC, 100, 880, 1700, '颗粒', '<b>颗粒</b>（granule）　按编号排好后，每连着的 8192 行为一组；读数据、查索引，都以它为最小单位'); show(g1, T('i3b', '颗粒') - 0.1, { y: 14, d: 0.35 }); vanish(g1, T('i5') - 0.2);
  gr.forEach((g, i) => classWins(g, 'y', i === 0 ? [[T('i3b', '八千'), T('i3c')], [T('i3c', '第一行'), 1e9]] : [[T('i3c', '第一行') + i * 0.14, 1e9]]));
  mk(gC, 'lab y', 100, 480, null, null, '索引：只记每个颗粒第一行的编号');
  const idxLab = gC.lastChild; vanish(idxLab, 0); appear(idxLab, T('i3c'));
  const idxC = IDS.map((id, i) => { const c = cellAt(gC, 100 + i * 144, 530, 134, 64, '<span>' + fmt(id) + '</span>', 'y sm'); vanish(c, 0); appear(c, T('i3c', '第一行') + i * 0.14 + 0.1); return c; });
  const n12 = mk(gC, 'big y', 100, 650, null, null, '0'); css(n12, { fontSize: '120px' }); appear(n12, T('i4')); countTo(n12, 0, 12209, T('i4'), 1.0);
  const u12 = mk(gC, 'h2', 600, 700, null, null, '项'); appear(u12, T('i4'));
  const u12n = mk(gC, 'lab', 600, 756, null, null, '颗粒 12,208 个，索引多出结尾一项'); css(u12n, { fontSize: '26px' }); appear(u12n, T('i4') + 0.6); vanish(u12n, T('i5', '稀疏索引') - 0.1);
  const n47 = mk(gC, 'big y', 820, 650, null, null, '47.69 KiB'); css(n47, { fontSize: '120px' }); show(n47, T('i4', '四十几'), { y: 14 }); sfx('chime', T('i4', '四十几') + 0.1, { g: 0.5 });
  vanish(n12, T('i5', '稀疏索引') - 0.1); vanish(u12, T('i5', '稀疏索引') - 0.1); vanish(n47, T('i5', '稀疏索引') - 0.1);
  const g2 = glossAt(gC, 100, 810, 1700, '稀疏索引', '<b>稀疏索引</b>　一个颗粒一项，小到能整个放进内存'); show(g2, T('i5', '稀疏索引') - 0.1, { y: 14, d: 0.35 }); sfx('thud', T('i5', '稀疏索引') + 0.05, { g: 0.5 });
  const t5 = mk(gC, 'tag', 100, 690, null, null, '稀疏索引'); css(t5, { fontSize: '80px' }); vanish(t5, 0); appear(t5, T('i5', '稀疏索引')); vanish(t5, T('i5b', '只找出') - 0.1);
  const n5 = mk(gC, 'h1 y', 100, 690, null, null, '只找出她在哪个颗粒里'); css(n5, { fontSize: '56px' }); wipe(n5, T('i5b', '只找出'), { dir: 'l', d: 0.6 });
  const tCD = T('i6') + 0.4;
  vanish(gC, tCD);

  // ── D 拿 2050 去比索引项；二分 ──
  appear(gD, tCD);
  const qc = mk(gD, 'tag', 100, 190, null, null, '2050'); slam(qc, tCD + 0.05, { from: 1.2 }); sfx('pop', tCD + 0.1, { g: 0.5 });
  const idx2 = IDS.map((id, i) => cellAt(gD, 100 + i * 144, 370, 134, 64, '<span>' + fmt(id) + '</span>', 'sm'));
  mk(gD, 'lab', 100, 322, null, null, '索引项'); idx2.forEach((c, i) => { vanish(c, 0); appear(c, tCD + 0.1 + i * 0.04); });
  classAt(idx2[0], 'on', T('i6a', '最前面'), T('i6a', '下一项')); classAt(idx2[1], 'on', T('i6a', '下一项'), T('i6b') - 0.1);
  const cm = termAt(gD, 100, 470, 760, 130); vanish(cm.el, 0); appear(cm.el, T('i6a') - 0.1);
  cm.line(0, '2050  ≥  1', T('i6a', '最前面'), {}); cm.line(1, '2050  <  8193', T('i6a', '下一项'), {});
  const z0 = mk(gD, 'tag o', 960, 470, null, null, '最前面的颗粒'); css(z0, { fontSize: '64px' }); slam(z0, T('i6b', '最前面'), { from: 1.2 }); sfx('thud', T('i6b', '最前面') + 0.1, { g: 0.5 }); keyed(z0).at(T('i6b', '第零个'), { html: '第 0 个颗粒' });
  classAt(idx2[0], 'y', T('i6b', '第零个'));
  const hb = mk(gD, 'bar', 100, 700, 1720, 56); css(hb, { background: 'var(--g2)' }); vanish(hb, 0); appear(hb, T('i6c') - 0.1);
  const hl_ = mk(gD, '', 100, 694, 1720, 68); css(hl_, { border: '4px solid var(--y)' }); vanish(hl_, 0); appear(hl_, T('i6c', '每次'));
  mk(gD, 'lab', 100, 650, null, null, '12,209 项'); gD.lastChild.style.opacity = 0; const lab12 = gD.lastChild; appear(lab12, T('i6c') - 0.1);
  const h0 = T('i6c', '每次'), h1_ = T('i6d', '二分') + 0.2;
  const hn = mk(gD, 'big y', 100, 790, null, null, '0'); css(hn, { fontSize: '100px' }); appear(hn, h0);
  F((t) => { const k = clamp((t - h0) / Math.max(0.5, h1_ - h0)); const n = Math.round(k * 14); const w = Math.max(6, 1720 / Math.pow(2, n)); hl_.style.width = w + 'px'; hn.textContent = '砍了 ' + n + ' 次'; });
  const tb = mk(gD, 'tag', 1200, 780, null, null, '二分'); slam(tb, T('i6d', '二分'), { from: 1.3 }); sfx('thud', T('i6d', '二分') + 0.1, { g: 0.5 });
  const tDE = T('i7') + 0.5;
  vanish(gD, tDE);

  // ── E 标记文件、读出一个颗粒 ──
  appear(gE, tDE);
  const FIL = [['id.bin', 300], ['name.bin', 440], ['age.bin', 580]];
  const segs = FIL.map(([nm, y], k) => {
    const lb = mk(gE, 'fn', 100, y + 14, null, null, nm); const cs = [];
    for (let i = 0; i < 12; i++) { const c = mk(gE, 'cell sm', 340 + i * 124, y, 120, 56, '<span></span>'); vanish(c, 0); appear(c, tDE + i * 0.03); cs.push(c); }
    appear(lb, tDE); return { lb, cs, y };
  });
  const q7 = segs.map((sg) => { const q = mk(gE, 'h1 y', 340 + 34, sg.y - 4, null, null, '?'); vanish(q, 0); appear(q, Math.max(T('i7', '什么位置'), tDE + 0.4)); vanish(q, T('i7b') + 0.1); return q; });
  segs.forEach((sg) => classAt(sg.cs[0], 'y', tDE + 0.3, T('i7b')));
  // 标记：每个颗粒在列文件里的起点，画成一排黄色竖线
  segs.forEach((sg, k) => { for (let i = 0; i < 12; i++) { const tk = mk(gE, '', 340 + i * 124 - 5, sg.y - 10, 8, 74); css(tk, { background: 'var(--y)' }); vanish(tk, 0); appear(tk, T('i7b', '标记') + 0.3 + k * 0.8); } });
  segs.forEach((sg) => sg.cs.forEach((c, i) => { if (i > 0) classAt(c, 'dead', T('i8b', '挑出') - 0.2); }));
  const g3 = glossAt(gE, 100, 730, 1700, '标记', '<b>标记</b>　每列一个标记文件：记着每个颗粒在列文件里从哪里开始'); show(g3, T('i7b') - 0.1, { y: 14, d: 0.35 });
  segs.forEach((sg, k) => { const mk_ = mk(gE, 'fn y', 340 + 10, sg.y + 70, null, null, ['id.cmrk2', 'name.cmrk2', 'age.cmrk2'][k]); css(mk_, { fontSize: '22px' }); vanish(mk_, 0); appear(mk_, T('i7b', '标记') + 0.3 + k * 0.25); });
  segs.forEach((sg, k) => { const w_ = [T('i8', '编号'), T('i8', '姓名'), T('i8', '年龄')][k]; const tq = T('i7', '什么位置'); classWins(sg.cs[0], 'on', [[Math.max(tDE + 0.4, tq - 1.2) + k * 0.25, Math.max(tDE + 0.4, tq - 1.2) + k * 0.25 + 0.7], [w_ - 0.1, 1e9]]); sfx('tick', w_, { g: 0.5 }); classAt(sg.lb, 'y', T('i8', '三个文件') + k * 0.12); });
  const rd = rowAt(gE, 340, 800, ['2050', 'Alice', '42'], [210, 310, 150], 76, 'lg y'); vanish(rd.row, 0); appear(rd.row, T('i8b') + 0.6); sfx('chime', T('i8b', '挑出') + 0.1, { g: 0.6 });
  const rd0 = mk(gE, 'lab y', 340, 682, null, null, '每个文件，各读出第 0 个颗粒'); show(rd0, T('i8b', '读出'), { y: 10 });
  const rdl = mk(gE, 'lab y', 100, 816, null, null, '从 8192 行里挑出她'); vanish(rdl, 0); appear(rdl, T('i8b') + 0.6);
  const tE9 = T('i9') + 1.0;
  vanish(gE, tE9);

  // ── i9 一万两千多个颗粒只读了一个 ──
  const gI9 = groupAt(world); appear(gI9, tE9);
  mk(gI9, 'lab', 100, 190, null, null, '12,208 个颗粒');
  const bar9 = mk(gI9, 'bar', 100, 250, 1720, 80); css(bar9, { background: 'var(--g2)' }); wipe(bar9, tE9, { dir: 'l', d: 0.6 });
  const rd1 = mk(gI9, 'bar y', 100, 250, 8, 80); appear(rd1, Math.max(T('i9', '只读了一个'), tE9 + 0.5));
  const sub = mk(gI9, 'lab y', 100, 350, null, null, '↑ 只读了这 1 个'); show(sub, T('i9', '只读了一个'), { y: 10 });
  const t12 = mk(gI9, 'huge y', 100, 470, null, null, '1 / 12,208'); css(t12, { fontSize: '200px' }); slam(t12, T('i9', '只读了一个'), { from: 1.2 }); sfx('thud', T('i9', '只读了一个') + 0.1, { g: 0.6 });
  const t2ms = mk(gI9, 'big', 100, 720, null, null, '1–2 ms'); css(t2ms, { fontSize: '140px' }); show(t2ms, T('i9', '一两毫秒'), { y: 14 }); sfx('chime', T('i9', '一两毫秒') + 0.1, { g: 0.5 });
  const t9F = T('i10') + 0.4;
  vanish(gI9, t9F);

  // ── F 代价与换来的 ──
  appear(gF, t9F);
  const pa = mk(gF, 'panel', 100, 230, 840, 520), pb = mk(gF, 'panel y', 980, 230, 840, 520); wipe(pa, t9F, { dir: 'l', d: 0.4 }); appear(pb, T('i10b', '换来'));
  mk(gF, 'lab', 140, 260, null, null, '代价');
  const cost = mk(gF, 'big', 140, 330, null, null, '8192'); css(cost, { fontSize: '200px' }); slam(cost, t9F + 0.2, { from: 1.2 }); sfx('thud', t9F + 0.3, { g: 0.6 });
  const cu = mk(gF, 'h2', 140, 570, null, null, '行：为了找一行，读了这么多'); show(cu, t9F + 0.5, { y: 12 });
  const lb2 = mk(gF, 'lab y', 1020, 260, null, null, '换来'); appear(lb2, T('i10b', '换来'));
  const gain = mk(gF, 'big y', 1020, 330, null, null, '47.69 KiB'); css(gain, { fontSize: '120px' }); slam(gain, T('i10b', '索引小'), { from: 1.2 }); sfx('chime', T('i10b', '索引小') + 0.1, { g: 0.5 });
  const gu = mk(gF, 'h2', 1020, 520, null, null, '的索引，整个放得进内存'); show(gu, T('i10b') - 0.1, { y: 12 });
  const tFG = T('i11') + 0.5;
  vanish(gF, tFG);

  // ── G 按姓名找，索引帮不上 ──
  appear(gG, tFG);
  const qn = mk(gG, 'tag', 100, 190, null, null, "name = 'Alice'"); css(qn, { fontSize: '64px' }); slam(qn, T('i11', '姓名'), { from: 1.2 });
  const gr2 = IDS.map((id, i) => { const g = granAt(gG, 100 + i * 144, 360, 130, 110, ''); vanish(g, 0); appear(g, tFG + i * 0.04); return g; });
  mk(gG, 'lab', 100, 320, null, null, '12,208 个颗粒（数据不按姓名排）');
  gr2.forEach((g, i) => { const q = mk(gG, 'h2 y', 100 + i * 144 + 52, 478, null, null, '?'); vanish(q, 0); appear(q, T('i11b') + i * 0.12); classAt(g, 'y', T('i11b') + i * 0.12); });
  const nh = mk(gG, 'badge', 1100, 210, null, null, '索引帮不上'); css(nh, { fontSize: '40px' }); slam(nh, T('i11', '帮不上'), { from: 1.2 }); sfx('thud', T('i11', '帮不上') + 0.1, { g: 0.5 });
  const nbb = mk(gG, 'bar', 100, 580, 1720, 60); css(nbb, { background: 'var(--g2)' }); vanish(nbb, 0); appear(nbb, T('i12') - 0.1);
  const nb = mk(gG, 'bar y', 100, 580, 1720, 60); const nA = T('i12', '全部'), nB = Tend('i12');
  F((t) => { const k = clamp((t - nA) / Math.max(0.5, nB - nA)); nb.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)'; nb.style.visibility = t >= nA ? 'visible' : 'hidden'; });
  const nbl = mk(gG, 'lab', 100, 650, null, null, 'name.bin：一亿个名字，全部读一遍'); appear(nbl, T('i12') - 0.1);
  const m499 = mk(gG, 'big', 100, 710, null, null, '499 MiB'); css(m499, { fontSize: '100px' }); show(m499, T('i13', '五百兆'), { y: 12 });
  const m240 = mk(gG, 'big y', 760, 710, null, null, '224–246 ms'); css(m240, { fontSize: '100px' }); show(m240, T('i13', '毫秒'), { y: 12 }); sfx('thud', T('i13', '毫秒') + 0.1, { g: 0.5 });
  const m2 = mk(gG, 'big y', 100, 840, null, null, '1–2 ms'); css(m2, { fontSize: '100px' }); show(m2, T('i13a', '一两毫秒'), { y: 12 });
  const m2l = mk(gG, 'lab', 640, 870, null, null, '← 按编号找'); appear(m2l, T('i13a'));
  const tGK = T('i13b') + 0.3;
  vanish(gG, tGK);
  const gK = groupAt(world); appear(gK, tGK);
  const ob = mk(gK, 'tag', 100, 240, null, null, 'ORDER BY id'); css(ob, { fontSize: '80px' }); slam(ob, T('i13b', '排序键'), { from: 1.25 }); sfx('thud', T('i13b', '排序键') + 0.1, { g: 0.5 });
  const obh = mk(gK, 'h1', 100, 440, null, null, '照最常用的查询条件来选'); css(obh, { fontSize: '72px' }); wipe(obh, T('i13b', '最常用') - 0.6, { dir: 'l', d: 0.6 });
  const obn = mk(gK, 'pill', 100, 600, null, null, '常按编号找人 → 按编号排'); css(obn, { fontSize: '32px', height: '68px' }); slam(obn, T('i13b') + 0.3, { from: 1.1 });
  const obn2 = mk(gK, 'pill', 100, 690, null, null, '常按姓名找人 → 按姓名排'); css(obn2, { fontSize: '32px', height: '68px' }); slam(obn2, T('i13b') + 1.3, { from: 1.1 });
  classAt(obn, 'on', T('i14') - 0.2); sfx('pop', T('i13b') + 0.4, { g: 0.4 }); sfx('pop', T('i13b') + 1.4, { g: 0.4 });
  const obn3 = mk(gK, 'lab y', 760, 614, null, null, '← 这张表'); vanish(obn3, 0); appear(obn3, T('i14') - 0.2);
  const tKH = T('i14') + 1.6;
  vanish(gK, tKH);

  // ── H 平均年龄根本用不着索引 ──
  appear(gH, tKH);
  mk(gH, 'lab y', 100, 180, null, null, 'SELECT avg(age) FROM users');
  [['id.bin', 280, 0], ['name.bin', 420, 0], ['age.bin', 560, 1]].forEach(([nm, y, on], i) => {
    const l = mk(gH, 'fn' + (on ? ' y' : ''), 100, y, null, null, nm); wipe(l, tKH + i * 0.2, { dir: 'l', d: 0.4 });
    const b = mk(gH, 'bar', 100, y + 46, 1720, 56); css(b, { background: 'var(--g2)', opacity: on ? 1 : 0.45 }); wipe(b, tKH + i * 0.2, { dir: 'l', d: 0.6 });
    if (on) { const sw = mk(gH, 'bar y', 100, y + 46, 1720, 56); const a0 = Math.max(T('i14', '根本'), tKH + 0.7), a1 = Tend('i14b') + 0.8; F((t) => { const k = clamp((t - a0) / Math.max(0.5, a1 - a0)); sw.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)'; sw.style.visibility = t >= a0 ? 'visible' : 'hidden'; }); }
  });
  const hh = mk(gH, 'h1 y', 100, 740, null, null, '只读 age 这一列，从头读到尾'); css(hh, { fontSize: '64px' }); wipe(hh, T('i14b') - 0.1, { dir: 'l', d: 0.6 });
  const nu = mk(gH, 'badge', 1300, 850, null, null, '用不着索引'); css(nu, { fontSize: '36px' }); slam(nu, Tend('i14b') - 0.6, { from: 1.2 }); sfx('thud', Tend('i14b') - 0.55, { g: 0.5 });
  const n529 = mk(gH, 'big y', 1380, 724, null, null, '529 KiB'); css(n529, { fontSize: '90px' }); show(n529, T('i14b', '只读'), { y: 12 });
  const hn2 = noteAt(gH, 100, 840, '它本来就要看每一个人：用不着索引来挑'); show(hn2, T('i14b', '每一个人') - 0.8, { y: 12 });
  drift(cam, s, -1);
});
