// 第 03 章 一列挨一列：八个人的小表 → 行存的样子 → 每列一个文件（按顺序对齐、按编号排好）→ 好压缩 → 一亿人的大小 → 只读五百多 K → 新来一个人呢？
scene('column', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [A, C, D, E, G] = [0, 1, 2, 3, 4].map(() => groupAt(world));
  const WS = [130, 300, 150];

  // ── A 八个人的小表（A 与 B 同屏：左边是表，右边是行存的样子）──
  appear(A, c0 + 0.05);
  tableTag(A, '表 <b>demo.users8</b> · 8 行', c0 + 0.1);
  const hd = rowAt(A, 100, 170, ['编号', '姓名', '年龄'], WS, 68, 'w lg'); wipe(hd.row, c0 + 0.15, { dir: 'l', d: 0.5 });
  const tbl = P8.map((r, i) => rowAt(A, 100, 250 + i * 78, r, WS, 68, 'lg')); tbl.forEach((r, i) => wipe(r.row, T('c1') + 0.1 + i * 0.07, { dir: 'l', d: 0.4 }));
  sfx('whoosh', T('c1'), { g: 0.5 });
  // 一行是一个人
  const tRow = T('c1b', '一行'), tCol = T('c1b', '一列'), tName = T('c1b', '姓名'), tAge = T('c1b', '年龄');
  const lr = mk(A, 'lab y', 740, 250 + 2 * 78 + 18, null, null, '一行 = 一个人'); show(lr, tRow, { x: -16, y: 0 }); vanish(lr, Tend('c1b', 0.5));
  const colSet = (k, t0, t1) => { classAt(hd.c[k], 'y', t0, t1); };
  const tId = T('c1b', '编号') - 0.15, tNm = tName - 0.15, tAg = tAge - 0.15;
  const colWin = [[tId, tNm], [tNm, tAg], [tAg, Tend('c1b', 0.5)]];
  F((t) => tbl.forEach((r, ri) => r.c.forEach((c, ci) => c.classList.toggle('on', (ri === 2 && t >= tRow && t < tCol - 0.1) || (t >= colWin[ci][0] && t < colWin[ci][1])))));
  colSet(0, tId, tNm); colSet(1, tNm, tAg); colSet(2, tAg, Tend('c1b', 0.5));
  const lc = mk(A, 'lab y', 740, 180, null, null, '一列 = 一项'); show(lc, tCol, { x: -16, y: 0 }); vanish(lc, Tend('c1b', 0.5));
  sfx('tick', tRow, { g: 0.5 }); sfx('tick', tCol, { g: 0.5 }); sfx('tick', tName, { g: 0.4 }); sfx('tick', tAge, { g: 0.4 });

  // ── B 行存：一行的几项挨着放，要算平均年龄得一行一行读 ──
  const rsP = mk(A, 'panel', 780, 160, 1100, 450); vanish(rsP, 0); appear(rsP, T('c2')); warm(rsP, T('c2'), T('c3') - 0.2);
  const lb = mk(A, 'lab', 800, 180, null, null, '行存：磁盘上的样子（一行的几项挨着）'); appear(lb, T('c2'));
  const BW = [70, 170, 100], blocks = [];
  P8.forEach((r, i) => {
    const bl = rowAt(A, 800 + (i % 3) * 366, 250 + Math.floor(i / 3) * 96, r, BW, 76); blocks.push(bl);
    vanish(bl.row, 0);
    const t0 = i === 0 ? T('c2', '几项') : T('c2b', '再下一行') + (i - 1) * 0.2;
    appear(bl.row, t0); sfx('tick', t0, { g: 0.4 });
  });
  // 前三格依次出现：编号、姓名、年龄
  blocks[0].c.forEach((c, k) => { vanish(c, 0); appear(c, T('c2', '几项') + k * 0.45); classAt(c, 'on', [T('c2b', '编号'), T('c2b', '姓名'), T('c2b', '年龄')][k], [T('c2b', '姓名'), T('c2b', '年龄'), T('c2b', '再下一行')][k]); });
  // 一行一行读过去：编号、姓名是白的（也被读了），年龄是黄的
  const sA = T('c3', '读过去'), sB = T('c3', '姓名') + 0.2;
  F((t) => { const k = clamp((t - sA) / Math.max(0.5, sB - sA)) * 8; blocks.forEach((b, i) => { const on = t >= sA && i < k + 0.5; b.c[0].classList.toggle('w', on); b.c[1].classList.toggle('w', on); b.c[2].classList.toggle('y', on); }); });
  blocks.forEach((b) => { classAt(b.c[0], 'dead', T('c4') - 0.1); classAt(b.c[1], 'dead', T('c4') - 0.1); });
  const rdn = mk(A, 'lab', 800, 560, null, null, ''); css(rdn, { fontSize: '30px' }); vanish(rdn, 0); appear(rdn, sA);
  F((t) => { const n = Math.min(8, Math.round(clamp((t - sA) / Math.max(0.5, sB - sA)) * 8)); const v = `读了 <span class="y">${n * 3}</span> 项，用到的只有 <span class="y">${n}</span> 项（年龄）`; if (rdn._v !== v) { rdn.innerHTML = v; rdn._v = v; } });
  const tFly = T('c4', '反过来') - 0.1, OFF = [0, 68, 236], FYS = [280, 400, 520];
  for (const e of [rsP, lb, rdn]) hide(e, tFly, { y: 0, d: 0.35 });
  blocks.forEach((b, i) => b.c.forEach((c, k) => {
    const sx = 800 + (i % 3) * 366 + OFF[k], sy = 250 + Math.floor(i / 3) * 96, tx = 870 + i * 122, ty = FYS[k], t0 = tFly + k * 0.12 + i * 0.03;
    motion(c, [[0, { x: 0, y: 0 }], [t0, { x: 0, y: 0 }], [t0 + 0.8, { x: tx - sx, y: ty - sy }]], ease.io3);
  }));
  sfx('whoosh', tFly, { g: 0.5 });
  const tAC = tFly + 1.25;
  vanish(A, tAC);

  // ── C 每一列一个文件（左边的表与上一段同一个位置、同一个样子，换段时不动）──
  appear(C, tAC);
  tableTag(C, '表 <b>demo.users8</b> · 8 行', tAC);
  const tb2 = rowAt(C, 100, 170, ['编号', '姓名', '年龄'], WS, 68, 'w lg');
  const tbl2 = P8.map((r, i) => rowAt(C, 100, 250 + i * 78, r, WS, 68, 'lg'));
  const FILES = [['id.bin', P8.map((r) => r[0]), 280], ['name.bin', P8.map((r) => r[1]), 400], ['age.bin', P8.map((r) => r[2]), 520]];
  const CW = 124, FX = 870;
  const strips = FILES.map(([nm, vals, y], k) => {
    const lbl = mk(C, 'fn', 710, y + 22, null, null, nm);
    const cells = stripAt(C, FX, y, vals, CW, 76);
    const t0 = T('c4', '每一列') + k * 0.35;
    wipe(lbl, tAC - 0.1 + k * 0.12, { dir: 'l', d: 0.4 }); cells.forEach((c) => { vanish(c, 0); appear(c, tAC - 0.15); });
    void t0;
    return { lbl, cells };
  });
  // 一列一个文件：对应的表列也亮一下
  const colHi = (k, t0, t1) => { classAt(tb2.c[k], 'y', t0, t1); tbl2.forEach((r) => classAt(r.c[k], 'y', t0, t1)); strips[k].cells.forEach((c) => classAt(c, 'y', t0, t1)); classAt(strips[k].lbl, 'y', t0, t1); };
  colHi(0, T('c4', '每一列'), T('c4', '每一列') + 0.9); colHi(1, T('c4', '每一列') + 0.35, T('c4', '每一列') + 1.25); colHi(2, T('c4', '每一列') + 0.7, T('c4', '每一列') + 1.6);
  [tb2].concat(tbl2).forEach((r) => classAt(r.row, 'dim55', T('c4b') - 0.2, T('c7') - 0.2));
  const g1 = glossAt(C, 710, 690, 1150, '列式存储', '<b>列式存储</b>　按列存放：同一列的值挨在一起，一列一个文件；查询用到哪几列，就只读那几列'); show(g1, T('c4b', '列式存储') - 0.1, { y: 14, d: 0.35 }); vanish(g1, T('c7') - 0.2);
  const sf = mk(C, 'frame-d', FX - 14, 266, 8 * (CW - 2) + 30, 352, ''); vanish(sf, 0); wipe(sf, T('c4c') - 0.1, { dir: 'l', d: 0.5 }); vanish(sf, T('c5') + 0.2);
  strips.forEach((st, k) => st.cells.forEach((c, i) => classAt(c, 'w', T('c4c') + 0.2 + k * 0.6 + i * 0.08, T('c5'))));
  // c5：年龄这一列，只有八个字节，一人一个——十进制换成真实的字节（十六进制）；标注收走时换回十进制，后面「第三个值 = carol」对得上 41
  const ageCells = strips[2].cells;
  classAt(strips[2].lbl, 'y', T('c5') + 0.1, T('c6'));
  ageCells.forEach((c, i) => classAt(c, 'y', T('c5') + 0.1 + i * 0.05, T('c5', '八个字节') + i * 0.1));
  strips[2].cells.forEach((c, i) => { classAt(c, 'on', T('c5', '八个字节') + i * 0.1, T('c5', '一人一个') + 0.9); const b1 = mk(C, 't-note', FX + i * (CW - 2) + 26, 600, null, null, '1 字节'); css(b1, { fontSize: '22px' }); vanish(b1, 0); appear(b1, T('c5', '八个字节') + i * 0.1); vanish(b1, T('c6') + 0.2); sfx('tick', T('c5', '八个字节') + i * 0.1, { g: 0.3 }); });
  // c6：编号、姓名在另一个文件
  colHi(0, T('c6', '编号'), T('c6', '姓名')); colHi(1, T('c6', '姓名'), Tend('c6', 0.3));
  // c7：第三个值属于同一个人
  const tThird = T('c7b', '第三个');
  const lineUp = mk(C, '', FX + 2 * (CW - 2) - 8, 268, CW + 14, 342); css(lineUp, { border: '4px solid var(--y)', pointerEvents: 'none' }); vanish(lineUp, 0); appear(lineUp, tThird); vanish(lineUp, Tend('c7b', 0.4));
  tbl2[2].c.forEach((c) => classAt(c, 'on', tThird, Tend('c7b', 0.4)));
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => { const n = mk(C, 'mono', FX + i * (CW - 2), 232, CW, null, '第 ' + (i + 1) + ' 个'); css(n, { fontSize: '22px', textAlign: 'center', color: i === 2 ? 'var(--y)' : 'var(--g3)' }); vanish(n, 0); appear(n, T('c7', '靠顺序') + i * 0.05); vanish(n, T('c8') - 0.2); });
  // c8：排序键
  // 「这里是编号」：编号那条文件整条亮起（排序键就是它）
  strips[0].cells.forEach((c, i) => classAt(c, 'on', T('c8', '编号') - 0.1 + i * 0.04, T('c9') + 0.3));
  const ob = mk(C, 'mono y', 710, 680, null, null, 'ORDER BY id'); css(ob, { fontSize: '40px' }); appear(ob, T('c8', '排序键')); vanish(ob, T('c10') - 0.2);
  const g2 = glossAt(C, 710, 770, 1150, '排序键', '<b>排序键</b>　建表时用 ORDER BY 指定：各行在文件里按它排好先后'); show(g2, T('c8', '排序键') - 0.1, { y: 14, d: 0.35 });
  // c9：乱序插入，落到文件里已经排好
  const ordered = [5, 2, 8, 1, 7, 4, 6, 3];
  const lo = mk(C, 'lab', 710, 190, null, null, '插入顺序'); appear(lo, T('c9', '乱序') - 0.2);
  const insCells = stripAt(C, FX, 176, ordered, CW, 68, 'w'); insCells.forEach((c, i) => wipe(c, T('c9', '乱序') - 0.2 + i * 0.07, { dir: 'l', d: 0.3 }));
  const tSort = T('c9', '排好') - 0.6;
  insCells.forEach((c, i) => { const v = ordered[i], dx = (v - 1 - i) * (CW - 2), dy = 280 - 176; motion(c, [[0, { x: 0, y: 0 }], [tSort, { x: 0, y: 0 }], [tSort + 0.8, { x: dx, y: dy }]]); classAt(c, 'gone', tSort + 0.85); });
  sfx('whoosh', tSort, { g: 0.45 });
  strips[0].cells.forEach((c, i) => classAt(c, 'on', tSort + 0.8, Tend('c9', 0.8)));
  sfx('chime', T('c9', '排好') + 0.2, { g: 0.5 });
  vanish(C, T('c10') - 0.1);

  // ── D 同一类型挨在一起，容易压缩 ──
  appear(D, T('c10') - 0.1);
  const lD = mk(D, 'lab y', 100, 180, null, null, 'age 这一列：同一种类型的值挨在一起'); wipe(lD, T('c10') - 0.1, { dir: 'l', d: 0.5 });
  const ages = [30, 25, 41, 19, 33, 52, 28, 36, 30, 25, 41, 19, 33, 52, 28, 36];
  const row16 = stripAt(D, 100, 250, ages, 108, 76); row16.forEach((c, i) => wipe(c, T('c10') + i * 0.05, { dir: 'l', d: 0.3 }));
  const tZ = T('c10', '容易压缩') - 0.2, ZW = 16 * 106 + 2;
  const rowBox = mk(D, '', 100, 250, ZW, 76); for (const c of row16) rowBox.appendChild(c);
  row16.forEach((c, i) => { c.style.left = (i * 106) + 'px'; c.style.top = '0px'; });
  const plL = mk(D, '', 70, 230, 22, 116), plR = mk(D, '', 100 + ZW + 8, 230, 22, 116); for (const pl of [plL, plR]) css(pl, { background: 'var(--w)' });
  motion(plL, [[0, { a: 0 }], [tZ - 0.3, { a: 0 }], [tZ - 0.2, { a: 1 }], [tZ + 0.9, { x: 0 }]]);
  motion(plR, [[0, { a: 0 }], [tZ - 0.3, { a: 0 }], [tZ - 0.2, { a: 1 }], [tZ + 0.2, { x: 0 }], [tZ + 0.9, { x: -(ZW - 400) - 8 }]]);
  tl.fromTo(rowBox, { scaleX: 1 }, { scaleX: 400 / ZW, duration: 0.7, ease: 'power2.inOut', immediateRender: false, transformOrigin: '0 50%' }, tZ + 0.2);
  sfx('thud', tZ + 0.9, { g: 0.55 });
  const lz = mk(D, 'tag', 100, 250, 400, 76, 'LZ4'); css(lz, { fontSize: '44px', padding: '0' }); vanish(lz, 0); appear(lz, tZ + 0.95); vanish(rowBox, tZ + 0.95);
  for (const pl of [plL, plR]) vanish(pl, tZ + 1.3);
  const zl = mk(D, 'lab', 540, 270, null, null, '压缩后：一长条，挤成一小块'); vanish(zl, 0); show(zl, tZ + 1.1, { x: -16, y: 0 });
  const gz = glossAt(D, 100, 560, 1300, 'LZ4', '<b>LZ4</b>　一种压缩算法，ClickHouse 默认用它压列文件'); show(gz, tZ + 0.95, { y: 12, d: 0.35 });
  const sv = mk(D, 'tag', 100, 420, null, null, '省空间'); slam(sv, T('c10b', '省空间'), { from: 1.3 }); sfx('thud', T('c10b', '省空间') + 0.1);
  const tDE = T('c12') + 0.6;
  vanish(D, tDE);

  // ── E 一亿人：上一排整张表 6.14 GiB → 882 MiB；下一排 age 这一列 95.37 MiB → 529 KiB（同一屏，两排各用自己的比例）──
  appear(E, tDE);
  tableTag(E, '表 <b>demo.users</b> · 一亿行', tDE);
  const lE1 = mk(E, 'lab', 100, 150, null, null, '整张表 · 原本'); appear(lE1, tDE);
  const bg1 = mk(E, 'bar', 100, 188, 1700, 52); css(bg1, { background: 'var(--g2)' }); wipe(bg1, tDE + 0.1, { dir: 'l', d: 0.9 });
  const n1 = mk(E, 'big', 100, 256, null, null, '6.14 GiB'); css(n1, { fontSize: '92px' }); appear(n1, tDE + 0.1); countTo(n1, 0, 6.14, tDE + 0.1, Math.max(0.9, T('c12', '六个多') - tDE), (v) => v.toFixed(2) + ' GiB');
  const lE2 = mk(E, 'lab y', 100, 366, null, null, '压缩后 · 落在磁盘上'); appear(lE2, T('c12b') - 0.1);
  const bg2 = mk(E, 'bar y', 100, 404, 239, 52); wipe(bg2, T('c12b') - 0.05, { dir: 'l', d: 0.5 });
  const n2 = mk(E, 'big y', 370, 392, null, null, '882 MiB'); css(n2, { fontSize: '72px' }); show(n2, T('c12b', '八百八十多兆') - 0.3, { y: 10 }); sfx('chime', T('c12b', '八百八十多兆'), { g: 0.5 });
  const sev = mk(E, 'tag o', 760, 384, null, null, '约 1/7'); css(sev, { fontSize: '64px' }); slam(sev, T('c12b', '七分之一') - 0.1, { from: 1.25 }); sfx('thud', T('c12b', '七分之一'));
  const tEG = T('c13') - 0.1;
  for (const e of [lE1, bg1, n1, lE2, bg2, n2, sev]) dimTo(e, tEG, 1, 0.45, 0.5);
  const lF1 = mk(E, 'lab', 100, 500, null, null, 'age 这一列 · 一人一个字节 · 原本'); appear(lF1, tEG);
  const af1 = mk(E, 'bar', 100, 538, 1700, 52); css(af1, { background: 'var(--g2)' }); wipe(af1, tEG + 0.1, { dir: 'l', d: 0.9 });
  const m1 = mk(E, 'big', 100, 604, null, null, '95.37 MiB'); css(m1, { fontSize: '92px' }); show(m1, Math.max(tEG + 1.4, T('c13', '九十五兆') - 0.2), { y: 10 });
  const perB = mk(E, 'badge', 900, 612, null, null, '1 字节 × 1 亿人'); css(perB, { fontSize: '30px', padding: '10px 18px' }); slam(perB, Math.max(tEG + 0.6, T('c13', '一人一个字节') - 0.1), { from: 1.2 }); vanish(perB, T('c13a') - 0.2);
  const lF2 = mk(E, 'lab y', 100, 714, null, null, '压缩后'); appear(lF2, T('c13a2') - 0.1);
  const af2 = mk(E, 'bar y', 100, 752, 10, 52); wipe(af2, T('c13a2') - 0.05, { dir: 'l', d: 0.3 });
  const m2 = mk(E, 'big y', 140, 740, null, null, '529 KiB'); css(m2, { fontSize: '72px' }); show(m2, T('c13a2', '五百多') - 0.3, { y: 10 }); sfx('chime', T('c13a2', '五百多'), { g: 0.5 });
  const cav = noteAt(E, 900, 600, '演示数据：年龄只有几十种取值，压得格外狠'); show(cav, T('c13a') + 0.2, { y: 10 });
  const demoB = mk(E, 'badge', 1000, 748, null, null, '演示数据'); css(demoB, { fontSize: '28px', padding: '10px 16px' }); slam(demoB, T('c13a2', '演示数据') - 0.1, { from: 1.2 }); vanish(demoB, T('c14') + 1.0);
  // c14：求平均年龄，只读这五百多 K（这一小条描上黄框）
  const hl = mk(E, '', 92, 744, 26, 68); css(hl, { border: '4px solid var(--y)' }); vanish(hl, 0); appear(hl, T('c14') - 1.4);
  const pt = mk(E, 'lab y', 470, 758, null, null, '← 求平均年龄，只读这一小条'); show(pt, T('c14') - 1.4, { x: -16, y: 0 });
  vanish(E, T('c15') - 0.1);

  // ── H 读下来、解压、求平均 = 开头那几毫秒 ──
  const H = groupAt(world); appear(H, T('c15') - 0.1);
  tableTag(H, '表 <b>demo.users</b> · 一亿行', T('c15') - 0.1);
  const lH = mk(H, 'lab', 100, 180, null, null, '一亿行 · 求平均年龄'); appear(lH, T('c15') - 0.1);
  const tm = termAt(H, 100, 240, 1060, 268); vanish(tm.el, 0); appear(tm.el, T('c15') - 0.1);
  tm.line(0, '<span class="pr">:) </span>SELECT avg(age) FROM users;', T('c15') - 0.05, { type: 38, cursorUntil: T('c15', '几毫秒') + 0.2 });
  printAt(tm, 1, pretty([{ name: 'avg(age)', values: ['48.99999546'], right: true }]), T('c15', '几毫秒') - 0.1);
  tm.line(4, '<span class="out">1 row in set. Elapsed: 0.008 sec.</span>', T('c15', '几毫秒') - 0.1, {});
  const ms = mk(H, 'huge y', 1230, 220, null, null, '8 ms'); css(ms, { fontSize: '230px' }); slam(ms, T('c15', '几毫秒'), { from: 1.3 }); sfx('chime', T('c15', '几毫秒') + 0.1);
  const tR = T('c15', '读下来'), tU = T('c15', '解压'), tAv = T('c15', '求平均');
  const mem = mk(H, 'tile', 100, 580, 260, 200); const memI = ico(mem, 'server', 24, 22, 64, '', 3); void memI;
  const memL = mk(mem, 'lab', 100, 36, null, null, '内存'); void memL; show(mem, tR - 0.4, { y: 14, d: 0.35 });
  classAt(mem, 'y', T('c15b', '内存缓存') - 0.2, T('c16') - 0.1);
  const memN = mk(mem, 't-note', 24, 130, null, null, '已经缓存着 age.bin'); css(memN, { fontSize: '22px' }); vanish(memN, 0); appear(memN, T('c15b') - 0.4);
  const blk = mk(H, 'cell on', 140, 690, 180, 56, '<span>529 KiB</span>'); css(blk, { justifyContent: 'center', fontSize: '26px' });
  motion(blk, [[0, { a: 0 }], [tR - 0.3, { a: 0, x: 0 }], [tR - 0.25, { a: 1 }], [tR + 0.6, { x: 380 }], [tU + 0.2, { x: 380, a: 1 }], [tU + 0.25, { a: 0 }]]);
  sfx('whoosh', tR, { g: 0.4 });
  const unz = stripAt(H, 520, 690, [30, 25, 41, 19, 33, 52, 28, 36, '…'], 76, 56, 'sm');
  unz.forEach((c, i) => { vanish(c, 0); wipe(c, tU + 0.2 + i * 0.05, { dir: 'l', d: 0.25 }); });
  sfx('pop', tU + 0.2, { g: 0.5 });
  const sig = mk(H, 'tile', 1260, 640, 300, 150); const sigL = mk(sig, 'h1', 26, 30, null, null, 'Σ ÷'); css(sigL, { fontSize: '64px' }); show(sig, tAv - 0.4, { y: 14, d: 0.35 });
  const res = mk(sig, 'mono y', 150, 56, null, null, ''); css(res, { fontSize: '30px' });
  unz.slice(0, 8).forEach((c, i) => { const ghost = mk(H, 'cell y sm', 520 + i * 74, 690, 76, 56, '<span>' + [30, 25, 41, 19, 33, 52, 28, 36][i] + '</span>'); motion(ghost, [[0, { a: 0 }], [tAv + i * 0.08, { a: 0, x: 0, y: 0 }], [tAv + i * 0.08 + 0.02, { a: 1 }], [tAv + i * 0.08 + 0.5, { x: 1290 - (520 + i * 74), y: 0, s: 0.4, a: 0 }]]); });
  keyed(res).at(tAv + 1.1, { html: '48.99…' });
  sfx('chime', tAv + 1.1, { g: 0.4 });
  vanish(H, T('c16') - 0.1);

  // ── 新来一个人呢？ ──
  const Q = groupAt(world); appear(Q, T('c16') - 0.1);
  tableTag(Q, '表 <b>demo.users</b> · 一亿行', T('c16') - 0.1);
  const FQ = [['id.bin', SL5, 280], ['name.bin', SL5.map(NMS), 400], ['age.bin', SL5.map(AG), 520]];
  const files3 = FQ.map(([nm, vals, y], k) => { const l = mk(Q, 'fn', 470, y + 22, null, null, nm); const cs = stripAt(Q, 640, y, vals, 190, 76, 'sm'); wipe(l, T('c16') + k * 0.4, { dir: 'l', d: 0.4 }); cs.forEach((c, i) => wipe(c, T('c16') + k * 0.4 + i * 0.03, { dir: 'l', d: 0.3 })); classAt(l, 'y', T('c16', '对齐'), T('c16b') - 0.1); return { l, cs }; });
  files3.forEach(({ cs }) => cs.forEach((c) => classAt(c, 'y', T('c16', '对齐'), T('c16b') - 0.1)));
  const lq = mk(Q, 'lab', 640, 190, null, null, '整张表（这里画 2048–2052 号）：按编号排好，各列对齐'); appear(lq, T('c16') - 0.1);
  const bq = mk(Q, 'huge y', 70, 350, null, null, '？'); css(bq, { fontSize: '330px' }); slam(bq, T('c16b', '新来') + 0.3, { from: 1.3 }); sfx('thud', T('c16b', '新来') + 0.4, { g: 0.6 });
  const ln = mk(Q, 'lab y', 640, 608, null, null, '新来的人'); appear(ln, T('c16b', '新来') - 0.1);
  const nw = rowAt(Q, 640, 648, ['?', '?', '?'], [190, 190, 190], 76, 'ghost'); slide(nw.row, T('c16b', '新来') - 0.1, { x: -120 }); sfx('pop', T('c16b', '新来'));
  drift(cam, s, -1);
});
