// 引子：前面四期都是一个人一行地存的 OLTP → 换一种问法：一亿人的平均年龄，不到十毫秒，读了哪些数据？→ OLAP → 片名。
// 三屏连续的画面：A 四期的小表与一条「一个人一行」的数据带（Alice 被改、被删）；B 那条数据带的第一个人落进一亿行的表，
// 这张表一直留到 C：先整行整行地读（行存），再只看年龄这一列（OLAP）。表里的行都是实验里的真实内容（parts.js 的 U()）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const grp = () => { const g = mk(world, 'abs', 0, 0, 1920, 1080); vanish(g, 0); return g; };
  const gA = grp(), gB = grp(), gC = grp(), gT = grp();

  // ══ A：前面四期，一个人一行 ══
  const tA = s.start + 0.3, tB = T('o6') - 0.35;
  appear(gA, tA);
  // 四张小表先摆在画面中间，讲到「一个人一行地存」时整排上移，给下面的数据带让位
  const tilesBox = mk(gA, 'abs', 0, 0, 1920, 1080);
  tl.fromTo(tilesBox, { y: 200 }, { y: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, T('o2', '一个人一行') - 0.5);
  ['PART 1', 'PART 2', 'PART 3', 'PART 4'].forEach((p, k) => { const b = mk(tilesBox, 'badge', 100 + k * 440, 44, null, null, p); css(b, { fontSize: '28px', padding: '10px 18px' }); wipe(b, T('o1') + 0.1 + k * 0.35, { dir: 'l', d: 0.3 }); sfx('tick', T('o1') + 0.1 + k * 0.35, { g: 0.4 }); });
  const lab1 = mk(tilesBox, 'lab', 1000, 10, null, null, ''); void lab1;
  const ENG = [['MyISAM', 'MySQL 的引擎', T('o1', 'MyISAM')], ['InnoDB', 'MySQL 的引擎', T('o1', 'InnoDB')], ['PostgreSQL', '', T('o1b', 'PostgreSQL')], ['SQLite', '', T('o1b', 'SQLite')]];
  const tiles = [], tRows = [];
  ENG.forEach(([nm, sub, tt], i) => {
    const tile = mk(tilesBox, 'tile', 100 + i * 440, 112, 400, 300); tiles.push(tile);
    mk(tile, 'nm', 28, 24, null, null, nm);
    if (sub) mk(tile, 'sb', 28, 82, null, null, sub);
    const rs = [1, 2, 3].map((n, k) => rowAt(tile, 28, 140 + k * 50, [String(n), NM(n), String(AG(n))], [64, 196, 64], 42, 'sm'));
    tRows.push(rs);
    slide(tile, tt - 0.1, { y: i % 2 ? 40 : -40 }); sfx('pop', tt, { g: 0.7, p: -0.6 + i * 0.4 });
  });
  // 「各不相同」：四张小表依次提亮；「一个人一行」：每张表的第一行亮成黄框
  const tDiff = T('o2', '各不相同'), tOne = T('o2', '一个人一行');
  tiles.forEach((tile, i) => warm(tile, tDiff - 0.2 + i * 0.35, tDiff + 0.9 + i * 0.35));
  tRows.forEach((rs, i) => { for (const c of rs[0].c) classAt(c, 'y', tOne + i * 0.1, T('o3')); });

  // 一条数据带：磁盘上一个人接一个人地放（编号、姓名、年龄挨在一起）
  const lab2 = mk(gA, 'lab', 100, 466, null, null, '在文件里：一个人一行，挨着放'); appear(lab2, tOne);
  const WS = [86, 236, 72], RW = WS[0] + WS[1] + WS[2] - 4;
  const rec = (x, n) => rowAt(gA, x, 520, U(n), WS, 60);
  const rA = rec(100, 1), rB = rec(100 + RW + 18, 2), rC = rec(100 + 2 * (RW + 18), 3);
  const dots1 = mk(gA, 'lab', 100 + 3 * (RW + 18) + 6, 532, null, null, '…');
  const XA = 1340, rAl = rec(XA, 2050);
  const dots2 = mk(gA, 'lab', XA + RW + 16, 532, null, null, '…');
  const hdr = ['编号', '姓名', '年龄'].map((t, k) => mk(gA, 't-note', 100 + [0, WS[0] - 2, WS[0] + WS[1] - 4][k] + 14, 590, null, null, t));
  wipe(rA.row, tOne + 0.2, { dir: 'l', d: 0.5 }); sfx('tick', tOne + 0.3, { g: 0.5 });
  [['编号', 0], ['姓名', 1], ['年龄', 2]].forEach(([w, k]) => { const tw = T('o2b', w); appear(hdr[k], tw - 0.05); classAt(rA.c[k], 'on', tw - 0.05, tw + 0.85); });
  const tNext = T('o2b', '再下一个人');
  [rB, rC].forEach((r, k) => { wipe(r.row, tNext + k * 0.45, { dir: 'l', d: 0.4 }); sfx('tick', tNext + k * 0.45, { g: 0.5 }); });
  appear(dots1, tNext + 1.0);

  // 它们的活儿：找到 Alice 改年龄，Alice 注销。这个终端一直带到下一屏（同一个终端，换一个问题）
  const tmBox = mk(world, 'abs', 0, 0, 1920, 1080);
  const tm = termAt(tmBox, 100, 660, 1120, 132);
  show(tm.el, T('o3'), { y: 20, d: 0.4 });
  const tUp = T('o3b', '找到'), tDel = T('o3b', '注销');
  tm.line(0, '<span class="pr">:) </span>UPDATE users SET age = 43 WHERE id = 2050;', tUp, { type: 36, cursorUntil: tDel - 0.3 });
  tm.line(1, '<span class="pr">:) </span>DELETE FROM users WHERE id = 2050;', tDel - 0.2, { type: 36, cursorUntil: T('o4') });
  slide(rAl.row, tUp - 0.15, { x: 60 }); appear(dots2, tUp);
  for (const c of rAl.c) classAt(c, 'y', tUp, tDel + 0.6);
  classAt(rAl.c[2], 'on', T('o3b', '年龄') - 0.1, T('o3b', '年龄') + 0.9);
  keyed(rAl.c[2].firstChild).at(T('o3b', '年龄') + 0.35, { html: '43' });
  for (const c of rAl.c) classAt(c, 'done', tDel + 0.6);
  sfx('blip', T('o3b', '年龄') + 0.35); sfx('tick', tDel + 0.6, { g: 0.6 });
  // 一次只碰一个人：Alice 那一格上方的黄色括线
  const brk = mk(gA, 'abs', XA, 500, RW, 8); css(brk, { borderTop: '4px solid var(--y)', borderLeft: '4px solid var(--y)', borderRight: '4px solid var(--y)' });
  const brkL = mk(gA, 'lab y', XA, 452, null, null, '一次只碰一个人');
  wipe(brk, T('o4', '一个人') - 0.2, { dir: 'l', d: 0.35 }); appear(brkL, T('o4', '一个人') - 0.1);
  const fastT = mk(gA, 'pill y', 1290, 660, null, null, '要快'); css(fastT, { fontSize: '40px', height: '72px' });
  const safeT = mk(gA, 'pill y', 1480, 660, null, null, '还要不出错'); css(safeT, { fontSize: '40px', height: '72px' });
  slam(fastT, T('o4', '要快'), { from: 1.2 }); slam(safeT, T('o4', '不出错') - 0.2, { from: 1.2 });
  sfx('thud', T('o4', '要快') + 0.1, { g: 0.45 }); sfx('thud', T('o4', '不出错'), { g: 0.45 });
  const oltp = mk(gA, 'tag', 1290, 770, null, null, 'OLTP'); css(oltp, { fontSize: '88px' });
  slam(oltp, T('o4b', 'OLTP'), { from: 1.3 }); sfx('thud', T('o4b', 'OLTP') + 0.1);
  const glT = glossAt(gA, 100, 834, 1120, 'OLTP', '<b>OLTP</b>　联机事务处理：一次只读写少数几行，要快，还要不出错');
  show(glT, T('o4b') - 0.2, { y: 16, d: 0.35 });
  // 「可要是问的，不是哪一个人呢？」：括线收走，数据带上每一个人都亮起
  exit(brk, T('o5') - 0.1, { y: -10 }); exit(brkL, T('o5') - 0.1, { y: -10 });
  [rA, rB, rC].forEach((r, k) => { for (const c of r.c) classAt(c, 'w', T('o5', '哪一个') + k * 0.2); });
  for (const tile of tiles) dimTo(tile, T('o5'), 1, 0.35);
  dimTo(tm.el, T('o5'), 1, 0.35);
  hide(gA, tB, { y: 0, d: 0.35 });

  // ══ B：一亿行的表（之后一直留着） ══
  const tbl = mk(world, 'abs', 0, 0, 1920, 1080); vanish(tbl, 0); appear(tbl, tB + 0.35);
  const IDS = [1, 2, 3, 4, 5, 6, 7, null, 2049, 2050, 2051, null, 99999998, 99999999, 100000000];
  const MW = [180, 280, 80], MX = 100, MY = 176, MH = 44, RX = 706;
  const hd = rowAt(tbl, MX, MY - 54, ['编号', '姓名', '年龄'], MW, 44, 'sm'); for (const c of hd.c) css(c, { background: 'transparent', borderColor: 'transparent', color: 'var(--g3)' });
  const mrows = [];
  IDS.forEach((n, i) => {
    const y = MY + i * MH;
    if (n == null) { const d = mk(tbl, 't-note', MX + 14, y + 4, null, null, '⋮'); mrows.push({ dots: d, y }); wipe(d, tB + 0.4 + i * 0.05, { dir: 't', d: 0.3 }); return; }
    const r = rowAt(tbl, MX, y, U(n), MW, MH + 2, 'sm'); mrows.push({ ...r, n, y });
    wipe(r.row, tB + 0.4 + i * 0.05, { dir: 'l', d: 0.35 });
  });
  const real = mrows.filter((r) => r.c);
  const cnt = mk(tbl, 'lab', MX, MY + IDS.length * MH + 14, null, null, '共 100,000,000 行'); appear(cnt, T('o6', '一亿'));
  const alice = real.find((r) => r.n === 2050);

  // 右侧：一亿个用户，平均年龄？
  const gR1 = mk(gB, 'abs', 0, 0, 1920, 1080);
  appear(gB, tB);
  const counter = mk(gR1, 'big y', RX - 6, 150, null, null, '0'); css(counter, { fontSize: '128px' });
  countTo(counter, 0, 100000000, T('o6', '一亿') + 0.1, 1.5); appear(counter, T('o6', '一亿'));
  const unit = mk(gR1, 't-note', RX, 290, null, null, '个用户，每人一个年龄'); appear(unit, T('o6', '一亿') + 0.3);
  const avgQ = mk(gR1, 'h2', RX, 350, null, null, '平均年龄是多少？'); show(avgQ, T('o6', '平均') - 0.1, { y: 16, d: 0.4 });
  const fm = mk(gR1, 'mono y', RX, 430, null, null, ''); css(fm, { fontSize: '52px' });
  typeText(fm, 'Σ age ÷ 100,000,000', T('o7', '加起来'), 24, { cursor: false });
  // 「所有人的年龄」：年龄这一格从上到下依次亮起
  const tAll = T('o7', '所有人');
  real.forEach((r, i) => classAt(r.c[2], 'y', tAll + i * 0.08, T('o8') + 0.2));
  // 交给 ClickHouse：终端、结果、不到十毫秒
  // 上一屏的终端挪到右边（旧的两行先暗着留下），讲到交给 ClickHouse 时清掉，打新的问题
  for (const r of tm.rows) vanish(r, tB + 0.7);
  dimTo(tm.el, tB + 0.7, 0.35, 1, 0.3);
  const idle = h('div', 'mono', tm.el, ''); css(idle, { position: 'absolute', left: '22px', top: '14px', whiteSpace: 'pre' }); vanish(idle, 0); appear(idle, tB + 0.75); vanish(idle, T('o8') - 0.1);
  typeText(idle, '<span class="pr">:) </span>', tB + 0.75, 60, { sfx: false, cursorUntil: T('o8') - 0.1 });
  tl.fromTo(tmBox, { x: 0, y: 0 }, { x: 600, y: -120, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tB);
  tm.line(0, '<span class="pr">:) </span>SELECT avg(age) FROM users;', T('o8') - 0.1, { type: 40, cursorUntil: T('o8', '不到') });
  tm.line(1, '<span class="out">48.99999546</span>', T('o8', '十毫秒') - 0.1, {});
  hide(tm.el, T('o11') - 0.3, { y: 0, d: 0.3 });
  const ms = mk(gB, 'huge y', 690, 700, null, null, '8 ms'); css(ms, { fontSize: '200px' });
  slam(ms, T('o8', '十毫秒'), { from: 1.3 }); sfx('chime', T('o8', '十毫秒') + 0.1);
  classAt(ms, 'fade45', T('o10') - 0.1);
  const nt = noteAt(gB, 1240, 730, '热缓存 · 一亿行 · 本机\n30 次连跑：7–9 毫秒'); show(nt, T('o8', '十毫秒') + 0.5, { y: 14, d: 0.4 }); classAt(nt, 'fade45', T('o10') - 0.1); classAt(tm.el, 'fade45', T('o10') - 0.1);
  // 这几毫秒里读了哪些数据？右上的一组让位给问题
  hide(gR1, T('o9') - 0.25, { y: -10, d: 0.3 });
  const rq = mk(gB, 'abs h1 y', RX, 170, null, null, '读了哪些数据？'); css(rq, { fontSize: '80px' });
  wipe(rq, T('o9', '读了') - 0.1, { dir: 'l', d: 0.45 }); sfx('pop', T('o9', '读了'));
  for (const r of real) for (const c of r.c) classAt(c, 'ghost', T('o9', '读了') + 0.2, T('o10'));
  // 行存：整行整行地读
  const rl = mk(gB, 'lab', RX, 300, null, null, '交给一行一行存的数据库：'); appear(rl, T('o10') + 0.1);
  const rn = noteAt(gB, RX, 350, '一行的几项挨在一起\n要年龄，也得读整行'); show(rn, T('o10b') - 0.1, { y: 14, d: 0.35 });
  const sA = T('o10b') + 0.1, sB = T('o10b', '一个个') + 0.6;
  const scan = mk(tbl, 'abs', MX - 10, MY - 6, MW[0] + MW[1] + MW[2] + 14, MH + 12); css(scan, { border: '4px solid var(--y)' }); vanish(scan, 0);
  set(scan, sA, { autoAlpha: 1 }); set(scan, T('o11') - 0.2, { autoAlpha: 0 });
  F((t) => {
    const k = clamp((t - sA) / Math.max(0.6, sB - sA)), on = t >= sA && t < T('o11') - 0.2;
    const last = Math.round(k * (real.length - 1));
    scan.style.top = (real[last].y - 6) + 'px';
    real.forEach((r, i) => { const lit = on && i <= last; for (const c of r.c) c.classList.toggle('w', lit); });
  });
  const readCnt = mk(gB, 'lab y', RX, 460, null, null, ''); appear(readCnt, sA);
  F((t) => { const k = clamp((t - sA) / Math.max(0.6, sB - sA)); readCnt.textContent = '已读 ' + Math.round(k * 100000000).toLocaleString('en-US') + ' 行 · 每行三项都读'; });
  hide(gB, T('o11') - 0.3, { y: 0, d: 0.3 });

  // ══ C：同一张表，换一类问题 ══
  appear(gC, T('o11') - 0.3);
  const tOl = T('o11') + 0.1, tMany = T('o11', '很多');
  const lt = mk(gC, 'lab', RX, 170, null, null, 'OLTP：一次一个人'); appear(lt, tOl);
  const chB = mk(gC, 'badge', 1500, 160, null, null, 'ClickHouse'); wipe(chB, T('o11', '另一类') - 0.1, { dir: 'l', d: 0.4 }); sfx('pop', T('o11', '另一类'), { g: 0.5 });
  for (const c of alice.c.slice(0, 2)) classAt(c, 'on', tOl, tMany - 0.2);
  const la = mk(gC, 'h2 y', RX, 230, null, null, '一次看很多人：年龄这一列，从头到尾'); wipe(la, tMany - 0.1, { dir: 'l', d: 0.5 });
  real.forEach((r, i) => classWins(r.c[2], 'on', r === alice ? [[tOl, tMany - 0.2], [tMany + i * 0.07, T('oT') - 0.1]] : [[tMany + i * 0.07, T('oT') - 0.1]]));
  const colBox = mk(tbl, 'abs', MX + MW[0] + MW[1] - 4 - 10, MY - 8, MW[2] + 20, IDS.length * MH + 14); css(colBox, { border: '4px solid var(--y)' });
  vanish(colBox, 0); wipe(colBox, tMany + 0.2, { dir: 't', d: 0.9 }); vanish(colBox, T('oT') - 0.1);
  const chips = [['报表', T('o11b', '报表')], ['统计', T('o11b', '统计')]].map(([t, tt], k) => { const p = mk(gC, 'pill', RX + k * 170, 320, null, null, t); slam(p, tt - 0.1, { from: 1.15 }); sfx('pop', tt, { g: 0.5 }); return p; });
  void chips;
  const olap = mk(gC, 'tag', RX, 430, null, null, 'OLAP'); css(olap, { fontSize: '88px' }); slam(olap, T('o12', 'OLAP'), { from: 1.3 }); sfx('thud', T('o12', 'OLAP') + 0.1);
  const glA = glossAt(gC, RX, 580, 1000, 'OLAP', '<b>OLAP</b>　联机分析处理：一次扫过很多行，做报表、做统计');
  show(glA, T('o12') - 0.2, { y: 14, d: 0.35 });
  const q1 = mk(gC, 'h1', RX, 720, null, null, '它是怎么做到的？'); const q2 = mk(gC, 'h1 y', RX, 800, null, null, '为此，又放弃了什么？');
  wipe(q1, T('o13', '怎么') - 0.1, { dir: 'l', d: 0.5 }); wipe(q2, T('o13', '放弃') - 0.1, { dir: 'l', d: 0.5 });
  sfx('thud', T('o13', '怎么') + 0.2, { g: 0.5 }); sfx('thud', T('o13', '放弃') + 0.2, { g: 0.5 });
  hide(gC, T('oT') + 1.5, { y: 0, d: 0.3 }); hide(tbl, T('oT') + 1.5, { y: 0, d: 0.3 });

  // ══ 片名 ══
  const tTi = T('oT') + 1.8;
  appear(gT, tTi - 0.05);
  const bd = mk(gT, 'badge', 160, 230, null, null, 'PART 5'); wipe(bd, tTi, { dir: 'l', d: 0.4 });
  const tq = mk(gT, 'h1', 160, 320, null, null, '一个数据库引擎是如何实现的？'); css(tq, { fontSize: '62px' }); wipe(tq, tTi + 0.15, { dir: 'l', d: 0.5 });
  const tt = mk(gT, 'huge', 150, 410, null, null, 'ClickHouse'); css(tt, { fontSize: '300px' }); slam(tt, tTi + 0.4, { from: 1.15 }); sfx('thud', tTi + 0.5);
  const ts = mk(gT, 'h1 y', 160, 760, null, null, 'OLAP的MergeTree和列式存储'); css(ts, { fontSize: '72px' }); wipe(ts, tTi + 0.8, { dir: 'l', d: 0.6 });
  // 数据库引擎系列的七集（系列说明里的片单），本集是第 5 集
  ['MyISAM', 'InnoDB', 'PostgreSQL', 'SQLite', 'ClickHouse', 'MongoDB', 'Redis'].forEach((n, k) => {
    const p = mk(gT, 'pill' + (k === 4 ? '' : ' ghost'), 160 + k * 238, 880, 222, 56, n); css(p, { fontSize: '24px', justifyContent: 'center' });
    appear(p, tTi + 1.8 + k * 0.12); if (k === 4) classAt(p, 'on', tTi + 2.9);
  });

  drift(cam, s, 1);
});
