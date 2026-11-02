// 开场（第 10 稿）：前几期的 MySQL、PostgreSQL 属于服务型（程序把 SQL 发给一直开着的服务进程）→ SQLite 属于嵌入式（库编进程序，
// 程序自己读写一个文件）→ 还是那张用户表（4096 个用户、2050 号 Alice）→ 交给 SQLite 就是一个 553 页的文件 → 主问题 →
// 找 Alice 只读 7 页、改到一半强行终止、重开一字节不差 → 沿着 Alice 一页页翻开。事实：G10、G16、G01、J01、I01、E05。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const box = (html, x, y, w, hh, o = {}) => { const e = h('div', 'abs obox', W, html); px(e, x, y, w, hh); css(e, { border: `2px solid ${o.color || K.ink}`, background: o.fill || '#fff', fontSize: (o.fs || 34) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.3 }); return e; };
  const stack = (x, y, name) => { const g = h('div', 'abs', W); px(g, x, y, 270, 172); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', g); px(r, i * 12, i * 12, 230, 100); } tx(g, name, 0, 122, { fs: 30, mono: true }); return g; };
  const title = pageTitle(W, '服务型数据库'); show(title, c0 + 0.1, { y: 8 });

  // ── 上排：服务型（o1–o2b） ──
  const app1 = box('应用程序', 120, 320, 320, 120);
  const srv = box('<div><span>MySQL</span> · <span>PostgreSQL</span></div><div style="font-size:30px;color:#044a64">服务进程</div>', 640, 300, 560, 160); css(srv, { flexDirection: 'column' });
  const [sv1, sv2] = srv.children, [m1, m2] = sv1.children;
  const eps = [btn(W, 'PART 1–2　MySQL（MyISAM、InnoDB）', 640, 478, 26), btn(W, 'PART 3　PostgreSQL', 1190, 478, 26)];   // 「前几期」：系列前三集
  eps.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); slam(e, T('o1', '前几期') + 0.2 + i * 0.5, { from: 1.15 }); }); sfx('pop', T('o1', '前几期') + 0.2, { g: 0.35 });
  const tagS = tx(W, '服务型数据库', 640, 252, { fs: 30, color: K.teal });
  const files1 = stack(1400, 310, '数据文件');
  const net = line(ov, [[440, 380], [638, 380]], { dashed: '8 6' });
  const netL = tx(W, '网络连接', 470, 330, { fs: 26, color: K.dim });
  const disk1 = line(ov, [[1200, 380], [1398, 380]]);
  slam(srv, c0 + 0.15, { from: 1.15 }); sfx('thud', c0 + 0.15, { g: 0.5 });
  set(sv2, 0, { autoAlpha: 0 }); show(sv2, T('o2', '服务进程'), { y: 8 }); sfx('tick', T('o2', '服务进程'), { g: 0.4 });
  show(tagS, T('o1b', '服务型'), { y: 8 });
  arrowIn(disk1, T('o2', '一直开着') - 0.1, 0.4); show(files1, T('o2', '一直开着'), { x: -12, y: 0 });
  wipe(app1, T('o2b') - 0.1, { dir: 'l', d: 0.4 }); arrowIn(net, T('o2b', '连上') , 0.5); show(netL, T('o2b', '连上') + 0.2, { y: 6 });
  // 一条 SQL 发过去，结果送回来
  const q = tx(W, 'SELECT …', 450, 392, { fs: 28, mono: true, css: { background: K.code, border: `1.5px solid ${K.codeLine}`, padding: '2px 12px', opacity: 0, visibility: 'hidden' } });   // 建时就藏起来：落在 0 秒的 set 第一帧不执行
  set(q, 0, { autoAlpha: 0 }); tl.fromTo(q, { autoAlpha: 1, x: 0 }, { x: 140, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2b', 'SQL')); sfx('tick', T('o2b', 'SQL'), { g: 0.5 });
  tl.fromTo(q, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, T('o2b', 'SQL') + 0.75);
  const rs = tx(W, '结果', 560, 392, { fs: 28, css: { background: K.wheat, padding: '2px 12px', opacity: 0, visibility: 'hidden' } });
  set(rs, 0, { autoAlpha: 0 }); tl.fromTo(rs, { autoAlpha: 1, x: 0 }, { x: -110, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2b', '结果')); sfx('tick', T('o2b', '结果'), { g: 0.4, p: -0.3 });
  tl.fromTo(rs, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, T('o2b', '结果') + 0.8);

  // ── 下排：嵌入式（o3–o3c） ──
  const prog = box('', 120, 600, 1080, 220); prog.dataset.beat = 'fill';
  const progL = tx(W, '应用程序', 150, 614, { fs: 32 });
  const tagE = tx(W, '嵌入式数据库：没有服务进程', 120, 552, { fs: 30, color: K.teal });
  const lib = box('SQLite 库', 700, 660, 440, 110, { fill: K.wheat, color: K.teal, fs: 36 });
  const db = stack(1400, 640, 'main.db');
  const direct = line(ov, [[1200, 710], [1398, 710]]);
  const directL = tx(W, '直接读写', 1222, 662, { fs: 26, color: K.dim });
  wipe(prog, T('o3') - 0.05, { dir: 'l', d: 0.45 }); show(progL, T('o3'), { y: 6 }); show(tagE, T('o3', '嵌入式'), { x: 10, y: 0 });
  set(lib, T('o3b', '库') - 0.02, { x: 560 }); slam(lib, T('o3b', '库'), { from: 1.2 }); sfx('thud', T('o3b', '库'), { g: 0.5 });   // 库先出现在程序外面，「编进程序里」时移进去
  tl.fromTo(lib, { x: 560 }, { x: 0, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, T('o3b', '编进')); sfx('whoosh', T('o3b', '编进'), { g: 0.3 });
  arrowIn(direct, T('o3c', '读写'), 0.5); show(directL, T('o3c', '读写') + 0.2, { y: 6 }); show(db, T('o3c', '一个文件'), { x: -12, y: 0 }); sfx('pop', T('o3c', '一个文件'), { g: 0.4 });
  keyed(title).at(T('o3') - 0.1, { html: '嵌入式数据库' });

  // ── 还是那张用户表（o5–o5b）：两排收走，表从左边刷出来 ──
  const tT = T('o5') - 0.3;
  const rowsA = [app1, srv, tagS, files1, netL, prog, progL, tagE, lib, directL, db, ...eps];   // db 也收走（漏了它会一直压在表和文件图后面）
  rowsA.forEach((e) => gone(e, tT, 0.3)); [net, disk1, direct].forEach((e) => gone(e, tT, 0.3));
  const nm = (n) => `User${String(n).padStart(5, '0')}-…`, age = (n) => 18 + n % 63;
  const R = [[1, nm(1), age(1)], [2, nm(2), age(2)], ['⋮', '', ''], [2049, nm(2049), age(2049)], [2050, 'Alice', 42], [2051, nm(2051), age(2051)], ['⋮', '', ''], [4096, nm(4096), age(4096)]];
  const tbl = docTable(W, [['id', 170], ['name', 380], ['age', 120]], R.map((r) => r.map(String)), 160, 300, { fs: 44 });
  tbl.t.dataset.name = 'users 表';
  const tblL = tx(W, 'users　4096 行', 160, 252, { fs: 30, mono: true, color: K.teal });
  wipe(tbl.t, T('o5'), { dir: 't', d: 0.6 }); show(tblL, T('o5'), { y: 6 }); sfx('whoosh', T('o5'), { g: 0.3 });
  const aliceRow = tbl.rs[4]; aliceRow.dataset.beat = 'text';
  keyed(title).at(tT + 0.2, { html: '还是那张用户表' });
  // 交给 SQLite：表进了一个文件
  const db2 = stack(1250, 470, 'main.db');
  const toDb = line(ov, [[930, 540], [1246, 540]]);
  const toDbL = tx(W, '交给 SQLite', 980, 490, { fs: 32, color: K.teal });
  arrowIn(toDb, T('o5c', '交给'), 0.5); show(toDbL, T('o5c', '交给') + 0.1, { y: 6 }); show(db2, T('o5c', '一个文件') - 0.1, { x: -12, y: 0 }); sfx('pop', T('o5c', '一个文件'), { g: 0.4 });

  // ── 一个文件，553 页（o5c 553 – o8）：每页一格，按归属上色 ──
  const tG = T('o5c', '553') - 0.2;
  [tbl.t, tblL, db2, toDbL].forEach((e) => gone(e, tG, 0.3)); gone(toDb, tG, 0.3);
  const G = fileGrid(W, 200, 330, 40, 34, 4);
  G.cells.forEach((c, i) => show(c, tG + 0.25 + (i % 40) * 0.008 + Math.floor(i / 40) * 0.03, { y: 0, d: 0.2 }));
  const fileL = tx(W, 'main.db　553 页 · 一页 1024 字节', 200, 278, { fs: 30, mono: true });
  show(fileL, T('o5c', '553'), { y: 8 }); sfx('pop', T('o5c', '553'), { g: 0.4 });
  const legend = tx(W, `<span class="mb" style="background:${OWN.u}">　</span> users 表　<span class="mb" style="background:${OWN.n}">　</span> 姓名索引　<span class="mb" style="background:${OWN.a}">　</span> 年龄索引`, 1190, 280, { fs: 26, color: K.dim });   // 直接定位：show() 的位移会盖掉 CSS 的 translateX
  show(legend, T('o5c', '553') + 0.4, { y: 6 });
  keyed(title).at(tG + 0.1, { html: '一个文件，553 页' });
  keyed(title).at(T('o4') - 0.1, { html: '一个库、一个文件，怎样装下一个关系数据库？' });
  // 找 Alice：读了其中 7 页
  const read = DATA.trace.index_then_table;
  read.forEach((pg, i) => set(G.cells[pg - 1], T('o6', '7') - 0.4 + i * 0.12, { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '3px' }));
  sfx('tick', T('o6', '7') - 0.4, { g: 0.5 });
  const g7 = gloss(W, '7 页', '找 Alice 读到的页：' + read.join('、'), 1036, 880, 680, { terms: '7 页' });
  show(g7, T('o6', '7'), { x: 12, y: 0 });
  keyed(title).at(T('o6') - 0.1, { html: '按名字找 Alice：只读 7 页' });
  // 年龄加一，改到一半强行终止；重开以后一字节不差
  const up = codeBlock(W, ['UPDATE users SET age = age + 1;'], 200, 880, { fs: 30 });
  wipe(up, T('o7') - 0.1, { dir: 'l', d: 0.4 });
  const tKill = T('o7', '强行终止');
  const users = [...DATA.file.owner].map((o, i) => (o === 'u' || o === 'a' ? i : -1)).filter((i) => i >= 0 && !read.includes(i + 1));
  const half = users.slice(0, Math.floor(users.length * 0.5));
  half.forEach((i, k) => set(G.cells[i], T('o7') + 0.3 + (tKill - T('o7') - 0.4) * k / half.length, { backgroundColor: '#f2d9a8' }));
  const kill = errBox(W, '强行终止', 1036, 884, 32); set(kill, 0, { autoAlpha: 0 }); slam(kill, tKill, { from: 1.3 }); sfx('error', tKill, { g: 0.6 });
  gone(g7, T('o7') - 0.2, 0.3);
  keyed(title).at(T('o7') - 0.1, { html: '改到一半，进程被强行终止' });
  const tRe = T('o8') - 0.1;
  half.forEach((i) => set(G.cells[i], tRe + 0.3, { backgroundColor: OWN[DATA.file.owner[i]] }));
  [up, kill].forEach((e) => gone(e, tRe, 0.3));
  const sha = h('div', 'abs', W, '重新打开：整个文件的 <b>SHA-256</b> 与改之前相同'); px(sha, 200, 884); css(sha, { fontSize: '32px', color: K.body, background: K.wheat, padding: '4px 16px' }); sha.dataset.gloss = '一字节不差';
  set(sha, 0, { autoAlpha: 0 }); wipe(sha, T('o8', '一字节不差') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('o8', '一字节不差'), { g: 0.5 });
  keyed(title).at(tRe, { html: '重新打开：一字节不差' });
  // 沿着 Alice：她这一行所在的叶页 130 先亮出来
  const tA = T('o10') - 0.1;
  gone(sha, tA, 0.3);
  const p130 = G.pos(130);
  const alice = tx(W, '2050 · Alice · 42 岁', 200, 884, { fs: 32, css: { background: K.wheat, padding: '4px 16px' } });
  const toLeaf = line(ov, [[560, 884], [p130.x + 17, p130.y + 36]], { color: 'teal' });
  show(alice, T('o10', 'Alice'), { x: 10, y: 0 }); arrowIn(toLeaf, T('o10', 'Alice') + 0.3, 0.6);
  set(G.cells[129], T('o10', '一页页') , { backgroundColor: K.teal, borderColor: K.teal });
  keyed(title).at(tA, { html: '沿着 Alice，把这个文件一页页翻开' });

  // 镜头：上排 → 两排 → 用户表 → 文件
  shots(cam, world, s, [
    [s.start, [app1, srv, tagS, files1], { rect: [110, 240, 1680, 470], zmax: 1.35 }],
    [T('o3') - 0.35, null, { rect: [110, 240, 1680, 830], zmax: 1.2 }],
    [tT, null, { rect: [140, 240, 1530, 900] }],
    [tG, null, { rect: [190, 270, 1730, 950] }],
  ]);

  // 「当前在讲谁」
  beats([[T('o1', '前几期'), eps], [T('o1', 'My S Q L'), m1], [T('o1', 'Postgres'), m2], [T('o1b', '服务型'), tagS], [T('o2'), srv], [T('o2', '一直开着'), files1], [T('o2b'), app1], [T('o2b', '连上'), netL], [T('o2b', '结果'), app1],
    [T('o3'), tagE], [T('o3b', '库'), lib], [T('o3c'), progL], [T('o3c', '一个文件'), db],
    [T('o5'), tblL], [T('o5', '4096'), tbl.t], [T('o5b'), aliceRow], [T('o5c'), toDbL], [T('o5c', '一个文件'), db2], [T('o5c', '553'), fileL],
    [T('o4', '一个库'), fileL], [T('o4b'), legend], [T('o6'), g7], [T('o7'), up], [T('o7', '强行终止'), kill], [T('o8', '一字节不差'), sha], [T('o10', 'Alice'), alice]], T('oT') + 2.8);
});
