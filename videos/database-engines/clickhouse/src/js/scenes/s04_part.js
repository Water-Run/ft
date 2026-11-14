// 第 04 章 片段：往排好序的文件里插一行太麻烦 → 写好的文件不改，另写一份 → 一次插入 = 一个片段（先临时名、写完改名）→ 一行也是一整个文件夹 → 一行一个太浪费，成批写 / 异步插入 → 一亿人写成九十个片段
scene('part', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [A, B, C, D, E, K, G, H] = [0, 1, 2, 3, 4, 5, 6, 7].map(() => groupAt(world));
  const WS = [130, 300, 150];
  const CW = 190, FX = 640;
  const FILES = [['id.bin', SL5, 260], ['name.bin', SL5.map(NMS), 370], ['age.bin', SL5.map(AG), 480]];

  // ── A 往排好序的文件里插一行，每一列的文件都得重写 ──
  appear(A, c0 + 0.05);
  tableTag(A, '表 <b>demo.users</b> · 一亿行', c0 + 0.1);
  const strips = FILES.map(([nm, vals, y]) => {
    const l = mk(A, 'fn', 470, y + 22, null, null, nm);
    const cs = stripAt(A, FX, y, vals, CW, 76, 'sm');
    cs.forEach((c, i) => wipe(c, c0 + 0.2 + i * 0.04, { dir: 'l', d: 0.35 }));
    wipe(l, c0 + 0.2, { dir: 'l', d: 0.4 });
    return { l, cs };
  });
  const ln = mk(A, 'lab y', FX, 576, null, null, '新来的人'); appear(ln, T('p1') + 0.1);
  const nw = rowAt(A, FX, 616, ['?', '?', '?'], WS, 68, 'ghost lg'); slide(nw.row, T('p1') + 0.1, { x: -100 }); sfx('pop', T('p1') + 0.1, { g: 0.5 });
  const lq = mk(A, 'lab', FX, 190, null, null, '已经排好序、压缩好的列文件'); appear(lq, c0 + 0.3);
  const tIns = T('p1', '该在的位置'), STEP = CW - 2;
  strips.forEach(({ cs }, k) => {
    cs.forEach((c, i) => { if (i >= 2) tl.fromTo(c, { x: 0 }, { x: STEP, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tIns + k * 0.08); });
    const g = mk(A, 'cell ghost', FX + 2 * STEP, FILES[k][2], CW, 76, '<span>?</span>'); appear(g, tIns + k * 0.08 + 0.2);
  });
  sfx('whoosh', tIns, { g: 0.5 });
  const sw0 = T('p1') + 0.2;
  F((t) => { strips[0].cs.forEach((c, i) => c.classList.toggle('on', t >= sw0 + i * 0.28 && t < sw0 + (i + 1) * 0.28 && t < tIns)); });
  const tRe = T('p1b', '每一列');
  strips.forEach(({ l, cs }, k) => { classAt(l, 'y', tRe + k * 0.3, Tend('p1b', 0.4)); cs.forEach((c, i) => { if (i >= 2) classAt(c, 'y', tRe + k * 0.3 + (i - 2) * 0.06, Tend('p1b', 0.4)); }); sfx('tick', tRe + k * 0.3, { g: 0.5 }); });
  const rw = mk(A, 'badge', 1290, 626, null, null, '三个文件都得重写'); slam(rw, T('p1b', '每一列') + 0.3, { from: 1.2 }); sfx('thud', T('p1b', '每一列') + 0.4, { g: 0.6 });
  const tAB = T('p2', '写好') - 0.3;
  vanish(A, tAB);

  // ── B–E 一个连续的画面：左边是写好、不再改动的旧片段；右边是新片段——Dave 那一行写成的文件夹，
  //    先用临时名字，写完改名；它只有一行，也是一整个文件夹。下一段它缩成「一次插一行」那排小文件夹里的第一个。
  appear(B, tAB);
  tableTag(B, '表 <b>demo.users</b> · 一亿行', tAB);
  const f1 = foldAt(B, 100, 250, 800, 290, 'all_1_1_0', ''); wipe(f1, tAB + 0.05, { dir: 'l', d: 0.5 });
  ['id.bin', 'name.bin', 'age.bin', '…'].forEach((t, i) => fileAt(f1, i, t));
  const lock = mk(B, 'badge', 100, 570, null, null, '写好之后，不再改动'); slam(lock, T('p2', '一律不改'), { from: 1.2 }); sfx('thud', T('p2', '一律不改') + 0.1, { g: 0.6 });
  classAt(f1, 'y', T('p2', '一律不改'), T('p2b') - 0.2);
  // 新片段：一个文件夹（一直留到下一段）
  const FX3 = 1020, FY3 = 320;
  const f3 = foldAt(world, FX3, FY3, 800, 570, '', 'ghost'); vanish(f3, 0); appear(f3, T('p2b', '另写'));
  f3.nm.remove();
  const f3in = mk(f3, 'abs', 0, 0, 800, 570);
  const f3n = mk(f3in, 'fn', 22, 18, null, null, '新的片段'); css(f3n, { fontSize: '30px' });
  const f3f = ['id.bin', 'name.bin', 'age.bin', '…'].map((t, i) => { const e = fileAt(f3in, i, t); css(e, { top: (104 + i * 40) + 'px' }); return e; });
  sfx('pop', T('p2b', '另写'), { g: 0.6 });
  const nl = mk(B, 'lab y', FX3, FY3 + 586, null, null, '新来的数据：另写一份新的'); show(nl, T('p2b', '另写') - 0.1, { y: 12 }); vanish(nl, T('p3b') - 0.2);
  // Dave 注册：终端、这一行、三步
  const tBC = T('p3') - 0.1;
  hide(f1, tBC, { y: 0, d: 0.3 }); hide(lock, tBC, { y: 0, d: 0.3 });
  const tm = termAt(B, 100, 140, 1720, 164);
  show(tm.el, tBC, { y: 12, d: 0.3 });
  tm.line(0, '<span class="pr">:) </span>INSERT INTO users VALUES (100000001, \'Dave\', 29);', T('p3') - 0.05, { type: 44, cursorUntil: T('p3', '排好序') });
  tm.line(1, '<span class="out">Ok.</span>', T('p3', '排好序'), {}); tm.line(2, '<span class="out">1 row in set.</span>', T('p3', '排好序'), {});
  const dv = rowAt(B, 100, 330, ['100000001', 'Dave', '29'], [270, 220, 130], 68, 'lg'); slide(dv.row, T('p3', '这一行') - 0.1, { y: 40 }); for (const c of dv.c) classAt(c, 'y', T('p3', '这一行'));
  [['排好序', '排序'], ['拆成列', '拆成列'], ['压缩', '压缩']].forEach(([w, nm], i) => {
    const p = mk(B, 'pill', 100 + i * 300, 440, 270, 68, nm); css(p, { fontSize: '32px' }); show(p, T('p3', w) - 0.1, { y: 16 }); classAt(p, 'on', T('p3', w), T('p3', w) + 0.8); classAt(p, 'y', T('p3', w) + 0.8); sfx('tick', T('p3', w), { g: 0.5 });
  });
  // 写进新文件夹：先是临时名字（虚线框），写完改名（黄框）
  const tNew = T('p3b', '新文件夹'), tRen = T('p4', '改成');
  keyed(f3n).at(tNew - 0.1, { html: 'tmp_insert_all_91_91_0', cls: 'abs fn' }).at(tRen, { html: 'all_91_91_0', cls: 'abs fn y' });
  const n91 = mk(f3in, 'abs lab y', 22, 62, null, null, '91 号：这张表前面已经写过 90 次（下面讲到）'); css(n91, { fontSize: '24px' }); vanish(n91, 0); show(n91, tRen + 0.3, { y: 6 });
  classAt(f3, 'ghost', 0, tRen); classAt(f3, 'y', tRen);
  const fill = mk(f3in, 'abs', 0, 0, 800, 570); css(fill, { background: 'rgba(250,255,105,.10)', transformOrigin: '0 50%' }); vanish(fill, 0); f3in.insertBefore(fill, f3in.firstChild);
  tl.fromTo(fill, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: Math.max(0.8, tRen - tNew - 0.4), ease: 'none', immediateRender: false }, tNew);
  set(fill, tRen, { autoAlpha: 0 });
  sfx('pop', tNew, { g: 0.6 }); sfx('chime', tRen + 0.2, { g: 0.6 });
  const g1 = glossAt(B, 100, 550, 860, '片段', '<b>片段</b>（part）　一次插入写成的一个文件夹：里面是各列的文件，写好后不再改'); show(g1, T('p3b', '片段') - 0.1, { y: 14, d: 0.35 });
  const tg = mk(B, 'tag o', 100, 668, null, null, '一次插入 = 一个片段'); css(tg, { fontSize: '60px' }); slam(tg, T('p3c'), { from: 1.2 }); sfx('thud', T('p3c') + 0.1, { g: 0.6 });
  // 临时名字：文件夹名字上的提示与服务端日志
  const tmpL = mk(B, 'lab', FX3, FY3 + 586, null, null, '写的时候：临时名字'); appear(tmpL, T('p4') - 0.1);
  keyed(tmpL).at(tRen, { html: '<span class="y">写完：改成正式的名字</span>' });
  const logN = mk(f3in, 'note', 22, 274, null, null, '服务端日志：\nRenaming temporary part\n  tmp_insert_all_91_91_0 to all_91_91_0'); css(logN, { fontSize: '24px' }); show(logN, tRen + 0.2, { y: 12 });
  // 只有一行，也是一整个文件夹：1 行 · 11 个文件 · 947 字节
  [['1', '行'], ['11', '个文件'], ['947', '字节']].forEach(([n, u], i) => {
    const t0 = T('p5') + i * 0.3;
    const nm = mk(f3in, 'big y', 22 + i * 260, 404, null, null, n); css(nm, { fontSize: '120px' }); slam(nm, t0, { from: 1.2 }); sfx('thud', t0 + 0.05, { g: 0.45 });
    const ul = mk(f3in, 'lab', 26 + i * 260, 528, null, null, u); show(ul, t0 + 0.2, { y: 10 });
  });
  const only = mk(B, 'lab y', 100, 824, null, null, '只有 Dave 一行');
  const dvN = noteAt(B, 100, 868, 'Dave 的编号正好最大，也不往旧文件后面接：照样另写一个片段'); css(dvN, { fontSize: '24px' }); show(dvN, T('p3c') - 0.1, { y: 8 }); show(only, T('p5') - 0.1, { y: 10 });
  const tBK = T('p6') + 0.5;
  hide(B, tBK, { y: 0, d: 0.3 });
  // 这个文件夹缩成下一段的第一个小文件夹
  tl.fromTo(f3, { x: 0, y: 0, scale: 1 }, { x: 100 - FX3, y: 250 - FY3, scale: 0.2, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, tBK);
  css(f3, { transformOrigin: '0 0' });
  tl.fromTo(f3in, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, ease: 'none', immediateRender: false }, tBK - 0.1);
  vanish(f3, tBK + 0.85);

  // ── F 一行一个文件夹太浪费；成批写 ──
  appear(K, tBK);
  const lF = mk(K, 'lab y', 100, 180, null, null, '一次插一行'); appear(lF, tBK + 0.1);
  const mini = [];
  for (let i = 0; i < 40; i++) {                      // 第 0 个接住上一段缩过来的 Dave 那个文件夹
    const m = foldAt(K, 100 + (i % 10) * 176, 250 + Math.floor(i / 10) * 120, 160, 100, 'all_' + (91 + i), '');
    css(m.nm, { fontSize: '22px', left: '14px', top: '14px' }); vanish(m, 0); appear(m, i === 0 ? tBK + 0.85 : Math.max(T('p6', '一行') + 0.1 + i * ((Tend('p6') - T('p6', '一行') - 0.3) / 40), tBK + 0.9)); if (i === 0) classAt(m, 'y', tBK + 0.85); mini.push(m);
  }
  const wf = mk(K, 'h2 y', 100, 760, null, null, '每插一行，建一个文件夹'); appear(wf, T('p6', '每次'));
  mini.forEach((m, j) => { if (j) sfx('tick', Math.max(T('p6', '一行') + 0.1 + j * ((Tend('p6') - T('p6', '一行') - 0.3) / 40), tBK + 0.9), { g: 0.15 }); });
  mini.forEach((m) => vanish(m, T('p6b', '成批'))); vanish(wf, T('p6b', '成批'));
  const bigF = foldAt(K, 100, 250, 1200, 520, '新片段 · 一次插入', 'y'); wipe(bigF, T('p6b', '成批') - 0.05, { dir: 'l', d: 0.5 });
  const bn = mk(K, 'big y', 150, 360, null, null, '20,000'); css(bn, { fontSize: '200px' }); slam(bn, T('p6b', '两万行') - 0.2, { from: 1.2 });
  const bu = mk(K, 'h1', 150, 600, null, null, '行，一次写进一个片段'); show(bu, T('p6b', '两万行') - 0.4, { y: 12 }); sfx('thud', T('p6b', '两万行'), { g: 0.6 });
  const bnote = noteAt(K, 150, 690, '官方文档的建议'); css(bnote, { fontSize: '24px' }); show(bnote, T('p6b', '两万行') - 0.2, { y: 12 });
  const tKG = T('p6c') + 1.2;
  vanish(K, tKG);

  // ── G 异步插入 ──
  appear(G, tKG);
  tableTag(G, '表 <b>demo.signup</b>', tKG);
  const dk = mk(G, 'tag o', 100, 270, null, null, '默认开着'); css(dk, { fontSize: '64px' }); slam(dk, T('p6c', '默认开着'), { from: 1.25 }); vanish(dk, T('p7', 'Judy')); sfx('thud', T('p6c', '默认开着') + 0.1, { g: 0.5 });
  const g2 = glossAt(G, 100, 190, 1700, '异步插入', '<b>异步插入</b>　服务端先攒几次插入，再一起写成一个片段'); show(g2, T('p6c', '异步插入') - 0.1, { y: 14, d: 0.35 });
  const bufB = foldAt(G, 760, 330, 500, 320, '缓冲', 'ghost'); appear(bufB, T('p6c') + 0.2); warm(bufB, T('p6c') + 0.4, T('p7') + 1.0, '#151515', '#33332A'); classAt(bufB, 'y', T('p7b', '攒'), T('p7b', '合成') + 0.5);
  const chips = [['9', 'ivan', '27'], ['10', 'judy', '31'], ['11', 'mallory', '45']];
  chips.forEach((r, i) => {
    const wd = [90, 230, 90];
    const rw_ = rowAt(G, 100, 380 + i * 110, r, wd, 68, 'lg'); vanish(rw_.row, 0);
    const tt = [T('p7', 'Ivan'), T('p7', 'Judy'), T('p7', 'Mallory')][i];
    slide(rw_.row, tt - 0.1, { x: -80 }); sfx('pop', tt, { g: 0.5 });
    const inb = rowAt(G, 760 + 24, 400 + i * 74, r, wd, 56, ''); css(inb.row, { left: '784px' }); vanish(inb.row, 0); appear(inb.row, T('p7b', '攒') + i * 0.3);
  });
  const f4 = foldAt(G, 1380, 330, 440, 320, 'all_4_4_0', 'y'); wipe(f4, T('p7b', '合成'), { dir: 'l', d: 0.5 }); sfx('chime', T('p7b', '合成') + 0.3, { g: 0.6 });
  const f4n = mk(G, 'big y', 1420, 440, null, null, '3 行'); css(f4n, { fontSize: '110px' }); show(f4n, T('p7b', '合成') + 0.3, { y: 14 });
  const f4l = mk(G, 'lab', 1380, 680, null, null, '一个片段'); appear(f4l, T('p7b', '合成') + 0.4);
  const tGH = T('p8') + 1.0;
  vanish(G, tGH);

  // ── H 一亿人：二十几秒，九十个片段 ──
  appear(H, tGH);
  tableTag(H, '表 <b>demo.users</b> · 一亿行', tGH);
  const tm2 = termAt(H, 100, 190, 1100, 172); tm2.line(1, '<span class="out">Ok.</span>', Tend('p8') - 0.05, {}); tm2.line(2, '<span class="out">0 rows in set.</span>', Tend('p8') - 0.05, {}); tm2.line(0, '<span class="pr">:) </span>INSERT INTO users SELECT … ;  <span class="dim">-- 一亿行</span>', tGH, { type: 50, cursorUntil: T('p8', '二十几秒') });
  const sec = mk(H, 'huge y', 1280, 170, null, null, '0.0 s'); css(sec, { fontSize: '170px' }); const tRun = Math.max(T('p8', '一条语句'), tGH + 0.9); appear(sec, tRun); countTo(sec, 0, 25.5, tRun, Math.max(1.0, Tend('p8') - tRun - 0.1), (v) => v.toFixed(1) + ' s');
  const GX0 = 100, GY0 = 380, GW = 108, GH = 70;
  const grid = [];
  for (let i = 0; i < 90; i++) {
    const m = mk(H, 'fold', GX0 + (i % 15) * (GW + 8), GY0 + Math.floor(i / 15) * (GH + 8), GW, GH); vanish(m, 0);
    appear(m, T('p8b', '每一百一十多万行') - 0.1 + i * 0.03); grid.push(m);
  }
  const lg = mk(H, 'lab y', 100, 860, null, null, '90 个片段 · 每个 1,111,953 行（最后一个少一些）'); appear(lg, T('p8b', '九十个'));
  sfx('riser', T('p8b', '每一百一十多万行') - 0.6, { g: 0.4 }); sfx('thud', T('p8b', '九十个') + 0.05, { g: 0.6 });
  const l9 = mk(H, 'h1', 1100, 852, null, null, '每个文件夹里：各自排好序'); css(l9, { fontSize: '44px' }); show(l9, T('p9') - 0.05, { y: 12 });
  const sA = T('p9b', '九十个') - 0.2, sB = Tend('p9b', 0.2);
  F((t) => { const k = clamp((t - sA) / Math.max(0.5, sB - sA)) * 90; grid.forEach((m, i) => m.classList.toggle('y', t >= sA && i < k)); });
  vanish(sec, T('p9b') - 0.1);
  const qq = mk(H, 'huge y', 1500, 160, null, null, '？'); css(qq, { fontSize: '200px' }); slam(qq, T('p9b') - 0.05, { from: 1.3 }); sfx('thud', T('p9b'), { g: 0.6 });
  drift(cam, s, 1);
});
