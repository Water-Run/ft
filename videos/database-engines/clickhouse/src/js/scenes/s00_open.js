// 引子：前面四期都是一个人一行地存的 OLTP → 换一种问法：一亿人的平均年龄，不到十毫秒，读了哪些数据？→ OLAP → 片名。
// 三屏连续的画面：A 四期的小表与一条「一个人一行」的数据带（Alice 被改、被删）；B 那条数据带的第一个人落进一亿行的表，
// 这张表一直留到 C：先整行整行地读（行存），再只看年龄这一列（OLAP）。表里的行都是实验里的真实内容（parts.js 的 U()）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const at0 = (e, t) => { vanish(e, 0); appear(e, t); return e; };
  const fadeIn0 = (e, t) => show(e, t, { y: 12, d: 0.4 });
  const grp = () => { const g = mk(world, '', 0, 0, 1920, 1080); vanish(g, 0); return g; };
  const gA = grp(), gB = grp(), gC = grp(), gT = grp();

  // ══ A：前面四期，一个人一行 ══
  const tA = s.start + 0.3, tB = T('o6') - 0.35;
  appear(gA, tA);
  // 四张小表先摆在画面中间，讲到「一个人一行地存」时整排上移，给下面的数据带让位
  const tilesBox = mk(gA, '', 0, 0, 1920, 1080);
  tl.fromTo(tilesBox, { y: 170 }, { y: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, T('o2', '一个人一行') - 0.5);
  ['PART 1', 'PART 2', 'PART 3', 'PART 4'].forEach((p, k) => { const b = mk(tilesBox, 'badge', 100 + k * 440, 44, null, null, p); css(b, { fontSize: '28px', padding: '10px 18px' }); wipe(b, T('o1') + 0.1 + k * 0.35, { dir: 'l', d: 0.3 }); sfx('tick', T('o1') + 0.1 + k * 0.35, { g: 0.4 }); });
  const lab1 = mk(tilesBox, 'lab', 1000, 10, null, null, ''); void lab1;
  const ENG = [['MyISAM', 'MySQL 的引擎', T('o1', 'MyISAM'), '索引、数据各一个文件'], ['InnoDB', 'MySQL 的引擎', T('o1', 'InnoDB'), '按主键排好的 B+ 树'], ['PostgreSQL', '', T('o1b', 'PostgreSQL'), '堆，加另一个文件的索引'], ['SQLite', '', T('o1b', 'SQLite'), '一个文件里的 B+ 树']];
  const tiles = [], tRows = [];
  ENG.forEach(([nm, sub, tt, how], i) => {
    const tile = mk(tilesBox, 'tile', 100 + i * 440, 112, 400, 360); tiles.push(tile);
    mk(tile, 'nm', 28, 24, null, null, nm);
    // 各自的存法：缩小的结构示意（与第 13 章同一套画法，不带文字）
    const hw = mk(tile, 't-note', 28, 80, null, null, how); css(hw, { fontSize: '24px' });   // 一句话说出这个引擎存法的特点
    const w = mk(tile, '', 96, 118, 320, 380); css(w, { transform: 'scale(0.63)', transformOrigin: '0 0' });
    tRows.push(engineStruct(w, i, tt + 0.1, { labels: false }).rows);
    slide(tile, tt - 0.1, { y: i % 2 ? 40 : -40 }); sfx('pop', tt, { g: 0.7, p: -0.6 + i * 0.4 });
  });
  // 「各不相同」：四张卡片依次提亮；「一个人一行」：每个结构里都有一行亮起（存法不同，都是整行放在一起）
  const tDiff = T('o2', '各不相同'), tOne = T('o2', '一个人一行');
  tiles.forEach((tile, i) => warm(tile, tDiff - 0.2 + i * 0.35, tDiff + 0.9 + i * 0.35));
  tRows.forEach((rs, i) => classAt(rs[[3, 0, 3, 0][i]], 'hl', tOne + i * 0.1, T('o3')));

  // 一条数据带：磁盘上一个人接一个人地放（编号、姓名、年龄挨在一起）
  const lab2 = mk(gA, 'lab', 100, 526, null, null, '在文件里：一个人一行，挨着放'); appear(lab2, tOne);
  const WS = [104, 218, 72], RW = WS[0] + WS[1] + WS[2] - 4;
  const rec = (x, n) => rowAt(gA, x, 580, U(n), WS, 60);
  const rA = rec(100, 1), rB = rec(100 + RW + 18, 2), rC = rec(100 + 2 * (RW + 18), 3);
  const dots1 = mk(gA, 'lab', 100 + 3 * (RW + 18) + 6, 592, null, null, '…');
  const XA = 1380, rAl = rec(XA, 2050);
  const dots2 = mk(gA, 'lab', XA + RW + 16, 592, null, null, '…');
  const hdr = ['编号', '姓名', '年龄'].map((t, k) => mk(gA, 't-note', 100 + [0, WS[0] - 2, WS[0] + WS[1] - 4][k] + 14, 650, null, null, t));
  wipe(rA.row, tOne + 0.2, { dir: 'l', d: 0.5 }); sfx('tick', tOne + 0.3, { g: 0.5 });
  const tWs = ['编号', '姓名', '年龄'].map((w) => T('o2b', w) - 0.05);
  tWs.forEach((tw, k) => { appear(hdr[k], tw); classAt(rA.c[k], 'on', tw, k < 2 ? tWs[k + 1] : tw + 0.8); });
  const tNext = T('o2b', '再下一个人');
  [rB, rC].forEach((r, k) => { wipe(r.row, tNext + k * 0.45, { dir: 'l', d: 0.4 }); sfx('tick', tNext + k * 0.45, { g: 0.5 }); });
  appear(dots1, tNext + 1.0);

  // 它们的活儿：找到 Alice 改年龄，Alice 注销。这个终端一直带到下一屏（同一个终端，换一个问题）
  const tmBox = mk(world, '', 0, 0, 1920, 1080);
  const tm = termAt(tmBox, 100, 720, 1120, 132);
  show(tm.el, T('o3b', '找到') - 0.35, { y: 20, d: 0.3 });
  const tUp = T('o3b', '找到'), tDel = T('o3b', '注销');
  tm.line(0, '<span class="pr">mysql&gt; </span>UPDATE users SET age = 43 WHERE id = 2050;', tUp, { type: 36, cursorUntil: tDel - 0.3 });
  tm.line(1, '<span class="pr">mysql&gt; </span>DELETE FROM users WHERE id = 2050;', tDel - 0.2, { type: 36, cursorUntil: T('o4') });
  wipe(rAl.row, tNext + 1.2, { dir: 'l', d: 0.4 }); appear(dots2, tNext + 1.5);
  for (const c of rAl.c) classAt(c, 'y', tUp, tDel + 0.6);
  const tAge = T('o3b', '年龄') + 0.35;
  keyed(rAl.c[2].firstChild).at(tAge, { html: '43' });
  flashClone(rAl.c[2], tAge - 0.05, 0.9, 0.7, 'on', '<span>43</span>');
  tl.fromTo(rAl.c[2], { scale: 1 }, { scale: 1.25, duration: 0.15, immediateRender: false }, tAge); tl.to(rAl.c[2], { scale: 1, duration: 0.3 }, tAge + 0.15);
  const p1 = mk(gA, 'tag', XA + WS[0] + WS[1] - 4, 520, null, null, '+1'); css(p1, { fontSize: '28px', padding: '2px 12px' });
  motion(p1, [[0, { a: 0, y: 10 }], [tAge, { a: 0, y: 10 }], [tAge + 0.1, { a: 1 }], [tAge + 0.6, { y: -18, a: 1 }], [tAge + 1.2, { y: -30, a: 0 }]]);
  // 删掉：一道删除线划过这一行，随后整行暗下去（留在原处，下一句的括线还指着她）
  const tStrike = tDel + 0.45;
  const strike = mk(gA, '', XA - 8, 580 + 28, RW + 16, 5); css(strike, { background: 'var(--w)' }); vanish(strike, 0); wipe(strike, tStrike, { dir: 'l', d: 0.35 });
  for (const c of rAl.c) classAt(c, 'dead', tStrike + 0.4);
  classAt(strike, 'fade45', tStrike + 0.4);
  sfx('blip', T('o3b', '年龄') + 0.35); sfx('tick', tDel + 0.5, { g: 0.6 });
  // 一次只碰一个人：Alice 那一格上方的黄色括线
  const brk = mk(gA, '', XA, 560, RW, 8); css(brk, { borderTop: '4px solid var(--y)', borderLeft: '4px solid var(--y)', borderRight: '4px solid var(--y)' });
  wipe(brk, T('o4', '一个人') - 0.2, { dir: 'l', d: 0.35 });
  const oneU = ico(gA, 'person', XA + RW / 2 - 30, 470, 60, 'y', 3.2); vanish(oneU, 0); show(oneU, T('o4', '一个人') - 0.2, { y: -14, d: 0.35 });
  const fastI = ico(gA, 'bolt', 1300, 712, 84, 'y', 3.4), fastL = mk(gA, 'lab y', 1396, 736, null, null, '快');
  const safeI = ico(gA, 'check', 1520, 712, 84, 'y', 4), safeL = mk(gA, 'lab y', 1616, 736, null, null, '不出错');
  vanish(fastI, 0); vanish(safeI, 0); slam(fastI, T('o4', '要快') - 0.05, { from: 1.6 }); slam(safeI, T('o4', '不出错') - 0.15, { from: 1.6 });
  at0(fastL, T('o4', '要快') + 0.1); at0(safeL, T('o4', '不出错'));
  sfx('thud', T('o4', '要快') + 0.1, { g: 0.45 }); sfx('thud', T('o4', '不出错'), { g: 0.45 });
  const oltp = mk(gA, 'tag', 1240, 812, null, null, '事务型数据库'); css(oltp, { fontSize: '60px', padding: '12px 30px' });
  const oltpE = mk(gA, 'tag o', 1690, 822, null, null, 'OLTP'); css(oltpE, { fontSize: '40px', padding: '10px 18px' });
  slam(oltp, T('o4b', '事务型') - 0.05, { from: 1.25 }); sfx('thud', T('o4b', '事务型') + 0.05); wipe(oltpE, T('o4b', '数据库') + 0.1, { dir: 'l', d: 0.3 });
  const glT = glossAt(gA, 100, 884, 1120, '事务型数据库', '<b>OLTP</b>（Online Transactional Processing，联机事务处理）　事务型数据库的工作方式：源源不断的小事务，每次读写几行，要快、不出错');
  show(glT, T('o4') + 0.3, { y: 16, d: 0.35 });   /* 讲「要快，还要不出错」时就出来，o4b 说出名字时已在屏上 */
  // 「可要是问的，不是哪一个人呢？」：括线收走，数据带上每一个人都亮起
  exit(brk, T('o5') - 0.1, { y: -10 }); hide(oneU, T('o5') - 0.1, { y: -10, d: 0.3 });
  [rA, rB, rC].forEach((r, k) => { for (const c of r.c) classAt(c, 'w', T('o5', '哪一个') + k * 0.2); });
  for (const tile of tiles) dimTo(tile, T('o5'), 1, 0.35);
  dimTo(tm.el, T('o5'), 1, 0.35);
  hide(gA, tB, { y: 0, d: 0.35 });

  // ══ B：一亿行的表（之后一直留着） ══
  const tbl = mk(world, '', 0, 0, 1920, 1080); vanish(tbl, 0); appear(tbl, tB + 0.15);
  const IDS = [1, 2, 3, 4, 5, 6, 7, null, 2049, 2050, 2051, null, 99999998, 99999999, 100000000];
  const MW = [180, 280, 80], MX = 100, MY = 176, MH = 44, RX = 706;
  const hd = rowAt(tbl, MX, MY - 54, ['编号', '姓名', '年龄'], MW, 44, 'sm'); for (const c of hd.c) css(c, { background: 'transparent', borderColor: 'transparent', color: 'var(--g3)' });
  const mrows = [];
  IDS.forEach((n, i) => {
    const y = MY + i * MH;
    if (n == null) { const d = mk(tbl, 't-note', MX + 14, y + 4, null, null, '⋮'); mrows.push({ dots: d, y }); wipe(d, tB + 0.2 + i * 0.05, { dir: 't', d: 0.3 }); return; }
    const r = rowAt(tbl, MX, y, U(n), MW, MH + 2, 'sm'); mrows.push({ ...r, n, y });
    wipe(r.row, tB + 0.2 + i * 0.05, { dir: 'l', d: 0.35 });
  });
  const real = mrows.filter((r) => r.c);
  const cnt = mk(tbl, 'lab', MX, MY + IDS.length * MH + 14, null, null, '共 100,000,000 行'); appear(cnt, T('o6', '一亿'));
  const alice = real.find((r) => r.n === 2050);

  // 右侧：一亿个用户，平均年龄？
  const gR1 = mk(gB, '', 0, 0, 1920, 1080);
  appear(gB, tB);
  const counter = mk(gR1, 'big y', RX - 6, 150, null, null, '0'); css(counter, { fontSize: '128px' });
  countTo(counter, 0, 100000000, T('o6', '一亿') + 0.1, 1.5); appear(counter, T('o6', '一亿'));
  const crowd = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 30; c++) { const k = r * 30 + c; const p = ico(gR1, 'person', RX + c * 36, 296 + r * 38, 30, '', 3.6); vanish(p, 0); appear(p, T('o6', '一亿') + 0.1 + ((k * 37) % 90) / 90 * 1.3); crowd.push([p, c]); }
  const boss = ico(gR1, 'person', RX, 418, 84, 'w', 3); vanish(boss, 0); show(boss, T('o6', '老板') - 0.2, { y: 14, d: 0.35 });
  const bub = mk(gR1, '', RX + 110, 418, 980, 96); css(bub, { border: '3px solid var(--w)', background: 'var(--k2)' }); vanish(bub, 0); wipe(bub, T('o6', '老板') + 0.1, { dir: 'l', d: 0.4 });
  const avgQ = mk(bub, 'h2', 30, 18, null, null, '平均年龄是多少？'); vanish(avgQ, 0); appear(avgQ, T('o6', '平均') - 0.1);
  const fm = mk(bub, 'mono y', 30, 14, null, null, ''); css(fm, { fontSize: '52px' });
  vanish(avgQ, T('o7', '加起来') - 0.05);
  typeText(fm, 'Σ age ÷ 100,000,000', T('o7', '加起来'), 24, { cursor: false });
  // 所有人的年龄：这一片小人从左到右亮起来（和表里的年龄一格格亮起同时）
  crowd.forEach(([p, c]) => classAt(p, 'y', T('o7') + 0.2 + c * 0.04, T('o8') + 0.2));
  // 「所有人的年龄」：年龄这一格从上到下依次亮起
  const tAll = T('o7') + 0.2;
  real.forEach((r, i) => classAt(r.c[2], 'y', tAll + i * 0.08, T('o8') + 0.2));
  // 交给 ClickHouse：终端、结果、不到十毫秒
  // 上一屏的终端挪到右边（旧的两行先暗着留下），讲到交给 ClickHouse 时清掉，打新的问题
  for (const r of tm.rows) vanish(r, tB + 0.7);
  dimTo(tm.el, tB + 0.7, 0.35, 1, 0.3);
  classAt(tmBox, 'gone', tB + 0.2, T('o8') - 0.35);   // 挪到右边的途中收起，交给 ClickHouse 时再出来
  tl.fromTo(tmBox, { x: 0, y: 0 }, { x: 600, y: -180, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tB);
  tl.fromTo(tm.el, { width: 1120, height: 132 }, { width: 640, height: 268, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tB);
  tm.line(0, '<span class="pr">:) </span>SELECT avg(age) FROM users;', T('o8') - 0.1, { type: 40, cursorUntil: T('o8', '不到') });
  printAt(tm, 1, pretty([{ name: 'avg(age)', values: ['48.99999546'], right: true }]), T('o8', '十毫秒') - 0.15);
  tm.line(4, '<span class="out">1 row in set. Elapsed: 0.008 sec.</span>', T('o8', '十毫秒') - 0.15, {});
  hide(tm.el, T('o11') - 0.3, { y: 0, d: 0.3 });
  const ms = mk(gB, 'huge y', 1380, 560, null, null, '8 ms'); css(ms, { fontSize: '180px' });
  slam(ms, T('o8', '十毫秒'), { from: 1.3 }); sfx('chime', T('o8', '十毫秒') + 0.1);
  classAt(ms, 'fade45', T('o10') - 0.1);
  const nt = noteAt(gB, 1386, 770, '热缓存 · 一亿行 · 本机\n30 次连跑：7–9 毫秒'); show(nt, T('o8', '十毫秒') + 0.5, { y: 14, d: 0.4 }); classAt(nt, 'fade45', T('o10') - 0.1); classAt(tm.el, 'fade45', T('o10') - 0.1);
  // 这几毫秒里读了哪些数据？右上的一组让位给问题
  hide(gR1, T('o9') - 0.25, { y: -10, d: 0.3 });
  sfx('pop', T('o9', '读了'));
  for (const r of real) for (const c of r.c) classAt(c, 'ghost', T('o9', '读了') + 0.2, T('o10'));
  // 行存：整行整行地读
  const rsBox = mk(gB, 'tile', RX, 160, 300, 330); slide(rsBox, T('o10') - 0.1, { x: 40 });
  mk(rsBox, 'nm', 24, 18, null, null, 'InnoDB'); const rsT = mk(rsBox, 't-note', 24, 70, null, null, '一行的几项挨在一起'); css(rsT, { fontSize: '22px' });
  const rsW = mk(rsBox, '', 40, 112, 320, 380); css(rsW, { transform: 'scale(0.6)', transformOrigin: '0 0' });
  const rsRows = engineStruct(rsW, 1, T('o10') + 0.1, { labels: false }).rows;
  const sA = T('o10b') + 0.1, sB = T('o10b', '一个个') + 0.6;
  const scan = mk(tbl, '', MX - 10, MY - 6, MW[0] + MW[1] + MW[2] + 14, MH + 12); css(scan, { border: '4px solid var(--y)' }); vanish(scan, 0);
  set(scan, sA, { autoAlpha: 1 }); set(scan, T('o11') - 0.2, { autoAlpha: 0 });
  F((t) => {
    const k = clamp((t - sA) / Math.max(0.6, sB - sA)), on = t >= sA && t < T('o11') - 0.2;
    const last = Math.round(k * (real.length - 1));
    scan.style.top = (real[last].y - 6) + 'px';
    real.forEach((r, i) => { const lit = on && i <= last; for (const c of r.c) c.classList.toggle('w', lit); });
  });
  rsRows.forEach((r, i) => classAt(r, 'hl', sA + (sB - sA) * i / rsRows.length, T('o11') - 0.2));
  const readCnt = mk(gB, 'lab y', RX + 330, 200, null, null, ''); appear(readCnt, sA);
  const readSub = mk(gB, 'lab', RX + 330, 246, null, null, '每行的编号、姓名、年龄都读'); appear(readSub, sA);
  F((t) => { const k = clamp((t - sA) / Math.max(0.6, sB - sA)); readCnt.textContent = '已读 ' + Math.round(k * 100000000).toLocaleString('en-US') + ' 行'; });
  hide(gB, T('o11') - 0.3, { y: 0, d: 0.3 });

  // ══ C：同一张表，换一类问题 ══
  appear(gC, T('o11') - 0.3);
  const tOl = T('o11') + 0.1, tMany = T('o11', '很多');
  const chB = mk(gC, 'badge', 1500, 160, null, null, 'ClickHouse'); wipe(chB, T('o11', '另一类') - 0.1, { dir: 'l', d: 0.4 }); sfx('pop', T('o11', '另一类'), { g: 0.5 });
  for (const c of alice.c.slice(0, 2)) classAt(c, 'on', tOl, tMany - 0.2);
  const many = ico(gC, 'person', RX, 190, 64, 'y', 3.2); const many2 = ico(gC, 'person', RX + 46, 190, 64, 'y', 3.2); const many3 = ico(gC, 'person', RX + 92, 190, 64, 'y', 3.2);
  [many, many2, many3].forEach((e, k) => { vanish(e, 0); show(e, tMany - 0.1 + k * 0.1, { y: 12, d: 0.3 }); });
  const manyL = mk(gC, 'lab y', RX + 180, 206, null, null, '很多人 · 只要年龄这一列'); fadeIn0(manyL, tMany + 0.2);
  real.forEach((r, i) => classWins(r.c[2], 'on', r === alice ? [[tOl, tMany - 0.2], [tMany + i * 0.07, T('oT') - 0.1]] : [[tMany + i * 0.07, T('oT') - 0.1]]));
  const colBox = mk(tbl, '', MX + MW[0] + MW[1] - 4 - 10, MY - 8, MW[2] + 20, IDS.length * MH + 14); css(colBox, { border: '4px solid var(--y)' });
  vanish(colBox, 0); wipe(colBox, tMany + 0.2, { dir: 't', d: 0.9 }); vanish(colBox, T('oT') - 0.1);
  [['doc', '报表', T('o11b', '报表')], ['chart', '统计', T('o11b', '统计')]].forEach(([ic, t, tt], k) => {
    const b = mk(gC, 'tile', RX + k * 190, 290, 170, 120); const i = ico(b, ic, 18, 22, 72, 'w', 3); void i;
    const l = mk(b, 'lab', 96, 42, null, null, t); void l; slide(b, tt - 0.15, { y: 20 }); sfx('pop', tt, { g: 0.5 });
  });
  const olap = mk(gC, 'tag', RX, 450, null, null, '分析型数据库'); css(olap, { fontSize: '72px', padding: '12px 32px' }); slam(olap, T('o12', '分析型') - 0.05, { from: 1.25 }); sfx('thud', T('o12', '分析型') + 0.05);
  const olapE = mk(gC, 'tag o', RX + 560, 460, null, null, 'OLAP'); css(olapE, { fontSize: '48px', padding: '10px 20px' }); wipe(olapE, T('o12', '数据库') + 0.1, { dir: 'l', d: 0.3 });
  const glA = glossAt(gC, RX, 590, 1080, '分析型数据库', '<b>OLAP</b>（Online Analytical Processing，联机分析处理）　分析型数据库的工作方式：拿大量历史数据做报表，一次扫很多行、只看几列');
  show(glA, T('o11b') - 0.1, { y: 14, d: 0.35 });
  const q1 = mk(gC, 'h1', RX, 720, null, null, '它是怎么做到的？'); const q2 = mk(gC, 'h1 y', RX, 800, null, null, '代价放在了哪里？');
  wipe(q1, T('o13', '怎么') - 0.1, { dir: 'l', d: 0.5 }); wipe(q2, T('o13', '放在') - 0.35, { dir: 'l', d: 0.5 });
  sfx('thud', T('o13', '怎么') + 0.2, { g: 0.5 }); sfx('thud', T('o13', '放在') - 0.15, { g: 0.5 });
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
