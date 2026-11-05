// 开场（第 13 稿：SQL 发过去后服务进程到文件取一页再回；「太重」时服务型整排沉到下半屏，轻的嵌入式浮上来；库念到 SQLite 才露名字；强行终止是代码块被掐断塌掉）：前几期的 MySQL、PostgreSQL 属于服务型（程序把 SQL 发给一直开着的服务进程）→ SQLite 属于嵌入式（库编进程序，
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
  const srv = box('<div><span>MySQL</span><span> · PostgreSQL</span></div><div style="font-size:30px;color:#044a64">服务进程</div>', 640, 300, 560, 160); css(srv, { flexDirection: 'column' });
  const [sv1, sv2] = srv.children, [m1, m2] = sv1.children;
  // 念到哪个名字，它从框外飞进服务进程框（MySQL 从左、PostgreSQL 从右）
  [m1, m2].forEach((m) => { m.style.display = 'inline-block'; });
  tl.fromTo(m1, { autoAlpha: 0, x: -380 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('o1', 'My S Q L') - 0.1); sfx('whoosh', T('o1', 'My S Q L'), { g: 0.3 });
  tl.fromTo(m2, { autoAlpha: 0, x: 380 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('o1', 'Postgres') - 0.1); sfx('whoosh', T('o1', 'Postgres'), { g: 0.3, p: 0.3 });
  const tagS = tx(W, '服务型数据库', 640, 246, { fs: 30, css: { background: K.teal, color: '#ffffff', padding: '2px 16px' } });
  const files1 = stack(1400, 310, '数据文件');
  const net = line(ov, [[440, 380], [638, 380]], { dashed: '8 6' });
  const netL = tx(W, '网络连接', 470, 330, { fs: 26, color: '#444444' });
  const disk1 = line(ov, [[1200, 380], [1398, 380]]);
  slam(srv, T('o1') - 0.05, { from: 1.15 }); sfx('thud', T('o1') - 0.05, { g: 0.5 });
  set(sv2, 0, { autoAlpha: 0 }); show(sv2, T('o2', '服务进程'), { y: 8 }); sfx('tick', T('o2', '服务进程'), { g: 0.4 });
  slam(tagS, T('o1b', '服务型') - 0.1, { from: 1.25 });
  const lamp = h('div', 'abs', srv); px(lamp, 524, 14, 16, 16); css(lamp, { borderRadius: '50%', background: K.teal, opacity: 0 });
  const tLamp = T('o2', '一直开着');
  F((t) => { const v = t < tLamp ? 0 : Math.min(1, (t - tLamp) / 0.3) * (0.55 + 0.45 * Math.cos(2 * Math.PI * (t - tLamp) / 1.6)); const x = String(+v.toFixed(3)); if (lamp.style.opacity !== x) lamp.style.opacity = x; });
  sfx('tick', tLamp, { g: 0.3 });
  arrowIn(disk1, T('o2b', 'SQL') + 0.3, 0.4); show(files1, T('o2b', 'SQL') + 0.35, { x: -12, y: 0 });
  wipe(app1, T('o2b') - 0.1, { dir: 'l', d: 0.4 }); arrowIn(net, T('o2b', '连上') , 0.5); show(netL, T('o2b', '连上') + 0.2, { y: 6 });
  // 一条 SQL 发过去；服务进程到数据文件取一页再回来；结果送回程序
  const q = tx(W, 'SELECT …', 450, 392, { fs: 28, mono: true, css: { background: K.code, border: `1.5px solid ${K.codeLine}`, padding: '2px 12px', opacity: 0, visibility: 'hidden' } });
  set(q, 0, { autoAlpha: 0 }); tl.fromTo(q, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: 140, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2b', 'SQL')); sfx('tick', T('o2b', 'SQL'), { g: 0.5 });
  tl.fromTo(q, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T('o2b', 'SQL') + 0.75);
  const token = (x, y) => { const e = h('div', 'abs', W); px(e, x, y, 30, 38); css(e, { background: K.wheat, border: `2px solid ${K.teal}`, boxSizing: 'border-box', opacity: 0, visibility: 'hidden' }); set(e, 0, { autoAlpha: 0 }); return e; };
  const trip = (e, t, dx, d = 0.45) => { tl.fromTo(e, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: dx, duration: d, ease: 'power1.inOut', immediateRender: false }, t); tl.fromTo(e, { x: dx }, { x: 0, duration: d, ease: 'power1.inOut', immediateRender: false }, t + d + 0.1); tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, t + 2 * d + 0.1); };
  const pg1 = token(1210, 361); trip(pg1, T('o2b', 'SQL') + 0.8, 176); sfx('tick', T('o2b', 'SQL') + 1.25, { g: 0.3, p: 0.3 });
  const rs = tx(W, '结果', 560, 392, { fs: 28, css: { background: K.wheat, padding: '2px 12px', opacity: 0, visibility: 'hidden' } });
  set(rs, 0, { autoAlpha: 0 }); tl.fromTo(rs, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: -110, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2b', '结果')); sfx('tick', T('o2b', '结果'), { g: 0.4, p: -0.3 });
  tl.fromTo(rs, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T('o2b', '结果') + 0.8);

  // 好处（o2c）：锁管得更细——服务进程下面是表的几行，一把锁只扣住一行；多人同时用——念到「多人」才来两个程序，三条请求同时进来，各扣各的那一行，谁也不等谁
  const rowsT = [0, 1, 2, 3].map((i) => { const r = h('div', 'abs', W, `${i + 1} · User0000${i + 1}-…`); px(r, 700, 482 + i * 34, 440, 30); css(r, { border: `1.5px solid ${K.greyLine}`, background: '#fff', boxSizing: 'border-box', fontFamily: 'Mono', fontSize: '22px', color: '#555555', paddingLeft: '10px', lineHeight: '26px' }); set(r, 0, { autoAlpha: 0 }); return r; });   // 表里的几行：写上行号，一看就是行
  const padlock = (y) => { const g = h('div', 'abs', W); px(g, 1152, y - 8, 22, 30); g.style.transform = 'scale(1.35)'; g.style.transformOrigin = '0 50%'; const sh = h('div', 'abs', g); px(sh, 4, 0, 14, 14); css(sh, { border: `3px solid ${K.teal}`, borderBottom: 'none', borderRadius: '8px 8px 0 0', boxSizing: 'border-box' });
    const bd = h('div', 'abs', g); px(bd, 0, 12, 22, 17); css(bd, { background: K.teal }); set(g, 0, { autoAlpha: 0 }); return g; };
  const locks = [1, 0, 3].map((i) => padlock(482 + i * 34));
  const lockRow = [1, 0, 3];
  rowsT.forEach((r, i) => show(r, T('o2c', '锁') - 0.35 + i * 0.06, { y: -8, d: 0.3 }));
  const lockAt = (k, t) => { tl.fromTo(locks[k], { autoAlpha: 0, y: -26 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'bounce.out', immediateRender: false }, t); set(rowsT[lockRow[k]], t + 0.15, { borderColor: K.teal }); sfx('tick', t + 0.15, { g: 0.35, p: 0.2 * k }); };
  lockAt(0, T('o2c', '锁'));
  const appB = box('程序', 120, 210, 220, 70, { fs: 28 }), appC = box('程序', 120, 460, 220, 70, { fs: 28 });
  const lnB = line(ov, [[340, 245], [638, 350]], { dashed: '8 6' }), lnC = line(ov, [[340, 495], [638, 410]], { dashed: '8 6' });
  const tMany = T('o2c', '人') - 0.25;   // 「多」的词时间落在逗号后的停顿里：按「人」往前推一点，画面和念到「多人」同时出来
  wipe(appB, tMany, { dir: 'l', d: 0.35 }); wipe(appC, tMany + 0.12, { dir: 'l', d: 0.35 });
  arrowIn(lnB, tMany + 0.1, 0.4); arrowIn(lnC, tMany + 0.2, 0.4); sfx('pop', tMany, { g: 0.35 });
  // 三条 SQL 同时发出：沿各自的连线进服务进程；到了就各扣一行
  const sqlChip = (x, y) => { const e = tx(W, 'SQL', x, y, { fs: 24, mono: true, css: { background: K.code, border: `1.5px solid ${K.codeLine}`, padding: '0 8px', opacity: 0, visibility: 'hidden' } }); set(e, 0, { autoAlpha: 0 }); return e; };
  const tGo = T('o2c', '同时') - 0.05;
  [[sqlChip(346, 228), 230, 88], [sqlChip(450, 362), 120, 0], [sqlChip(346, 470), 230, -70]].forEach(([e, dx, dy], i) => {
    tl.fromTo(e, { autoAlpha: 1, x: 0, y: 0 }, { x: dx, y: dy, duration: 0.65, ease: 'power1.inOut', immediateRender: false }, tGo + i * 0.04);
    tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, tGo + 0.68 + i * 0.04); });
  sfx('whoosh', tGo, { g: 0.3 });
  lockAt(1, T('o2c', '更顺') - 0.15); lockAt(2, T('o2c', '更顺') + 0.05);
  const tOne = T('o2d', '一个程序') - 0.1;
  [appB, appC, ...rowsT, ...locks].forEach((e) => gone(e, tOne, 0.3)); [lnB, lnC].forEach((e) => gone(e, tOne, 0.3));
  // 太重：服务型这一整排沉沉地掉到下半屏（带回弹），落地一声闷响，随后压暗；上半屏让给轻的嵌入式
  const tFall = T('o2d', '太重') - 0.15, DROP = 340;
  const rowS = [tagS, app1, srv, files1, netL], rowSv = [net, disk1];
  // 重重落下、只回弹一次（bounce.out 落地时连弹三下、每下两帧，读起来像闪）
  [...rowS, ...rowSv].forEach((e) => { tl.fromTo(e, { y: 0 }, { y: DROP, duration: 0.6, ease: 'power2.in', immediateRender: false }, tFall); tl.fromTo(e, { y: DROP }, { y: DROP - 26, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, tFall + 0.6); });
  sfx('thud', tFall + 0.6, { g: 0.6 }); sfx('thud', tFall + 0.96, { g: 0.22, p: -0.3 });
  rowS.forEach((e) => dim(e, T('o3') - 0.1, 0.35, 1, 0.5)); rowSv.forEach((e) => dim(e, T('o3') - 0.1, 0.35, 1, 0.5));

  // ── 上半屏：嵌入式（o3–o3d）：程序轻轻浮上来；库先只写「库」，念到 SQLite 才换成名字 ──
  const prog = box('', 120, 250, 1080, 220); prog.dataset.beat = 'fill';
  const progL = tx(W, '应用程序', 150, 264, { fs: 32 });
  const tagE = tx(W, '嵌入式数据库：没有服务进程', 120, 196, { fs: 30, css: { background: K.teal, color: '#ffffff', padding: '2px 16px' } });
  const lib = box('库', 700, 310, 440, 110, { fill: K.wheat, color: K.teal, fs: 40 }); lib.dataset.name = '库';
  const db = stack(1400, 290, 'main.db');
  const call = path(ov, 'M290,318 C 470,318 560,365 694,365', 'teal', { w: 2.5, arrow: true });
  const direct = line(ov, [[1140, 365], [1398, 365]]);
  const directL = tx(W, '自己读写', 1222, 316, { fs: 26, color: K.dim });
  [prog, progL].forEach((e) => { set(e, 0, { autoAlpha: 0 }); tl.fromTo(e, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power2.out', immediateRender: false }, T('o3') - 0.1); });
  slam(tagE, T('o3', '嵌入式') - 0.05, { from: 1.2 }); sfx('whoosh', T('o3') - 0.1, { g: 0.25, p: 0.4 });
  set(lib, T('o3b', '库') - 0.02, { x: 560 }); slam(lib, T('o3b', '库'), { from: 1.2 }); sfx('thud', T('o3b', '库'), { g: 0.4 });
  tl.fromTo(lib, { x: 560 }, { x: 0, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, T('o3b', '编进')); sfx('whoosh', T('o3b', '编进'), { g: 0.3 });
  arrowIn(call, T('o3c', '调用') - 0.1, 0.5); sfx('tick', T('o3c', '调用'), { g: 0.3 });
  arrowIn(direct, T('o3c', '读写') - 0.1, 0.4); show(directL, T('o3c', '读写') + 0.1, { y: 6 }); show(db, T('o3c', '一个文件') - 0.1, { x: -12, y: 0 }); sfx('pop', T('o3c', '一个文件'), { g: 0.4 });
  const pg2 = token(1150, 346); trip(pg2, T('o3c', '一个文件') + 0.35, 240, 0.4); sfx('tick', T('o3c', '一个文件') + 0.8, { g: 0.3, p: 0.3 });
  keyed(lib).at(T('o3d', 'S Q Lite') - 0.05, { html: 'SQLite' }); tl.fromTo(lib, { scale: 1.12 }, { scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, T('o3d', 'S Q Lite') - 0.05); sfx('pop', T('o3d', 'S Q Lite'), { g: 0.45 });

  // ── 还是那张用户表（o5–o5b）：两排收走，表从左边刷出来 ──
  const tT = T('o5') - 0.3;
  const rowsA = [prog, progL, tagE, lib, directL, db];
  rowS.forEach((e) => goneFrom(e, T('o3c') - 0.45, 0.35, 0.3));   // db 也收走（漏了它会一直压在表和文件图后面）
  rowsA.forEach((e) => gone(e, tT, 0.3)); rowSv.forEach((e) => goneFrom(e, T('o3c') - 0.45, 0.35, 0.3)); [direct, call].forEach((e) => gone(e, tT, 0.3));
  const nm = (n) => `User${String(n).padStart(5, '0')}-…`, age = (n) => 18 + n % 63;
  const R = [[1, nm(1), age(1)], [2, nm(2), age(2)], ['⋮', '', ''], [2049, nm(2049), age(2049)], [2050, 'Alice', 42], [2051, nm(2051), age(2051)], ['⋮', '', ''], [4096, nm(4096), age(4096)]];
  const tbl = docTable(W, [['id', 170], ['name', 380], ['age', 120]], R.map((r) => r.map(String)), 160, 300, { fs: 44 });
  tbl.t.dataset.name = 'users 表';
  const tblL = tx(W, 'users　4096 行', 160, 252, { fs: 30, mono: true, color: K.teal });
  wipe(tbl.t, T('o5'), { dir: 't', d: 0.6 }); show(tblL, T('o5'), { y: 6 }); sfx('whoosh', T('o5'), { g: 0.3 });
  const aliceRow = tbl.rs[4];
  set(aliceRow, 0, { backgroundColor: 'rgba(245, 222, 179, 0)' }); set(aliceRow, T('o5b', '2050'), { backgroundColor: K.wheat });   // 麦色是主角：Alice 的那一行
  keyed(title).at(tT + 0.2, { html: '还是那张用户表' });
  // 交给 SQLite：表进了一个文件
  const db2 = stack(1250, 470, 'main.db');
  const toDb = line(ov, [[930, 540], [1246, 540]]);
  const toDbL = tx(W, '交给 SQLite', 980, 490, { fs: 32, color: K.teal });
  arrowIn(toDb, T('o5c', '交给'), 0.5); show(toDbL, T('o5c', '交给') + 0.1, { y: 6 }); show(db2, T('o5c', '一个文件') - 0.1, { x: -12, y: 0 }); sfx('pop', T('o5c', '一个文件'), { g: 0.4 });

  // ── 一个文件，553 页（o5c 553 – o8）：每页一格，按归属上色 ──
  const tG = T('o5c', '553') - 0.2;
  [tbl.t, tblL, toDbL].forEach((e) => gone(e, T('o5c', '一个文件') + 0.3, 0.4)); gone(toDb, T('o5c', '一个文件') + 0.3, 0.4);
  gone(db2, tG + 0.7, 0.4);
  const G = fileGrid(W, 200, 330, 40, 34, 4);
  const FX = 1250 + 135, FY = 470 + 70;
  G.cells.forEach((c, i) => { const q = G.pos(i + 1); tl.fromTo(c, { autoAlpha: 0, x: FX - q.x - 17, y: FY - q.y - 17, scale: 0.5 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.inOut', immediateRender: true }, tG + 0.1 + i * 0.0026); });
  sfx('whoosh', tG + 0.1, { g: 0.4 });
  G.cells.forEach((c) => set(c, 0, { backgroundColor: '#ffffff' }));   // 开场不按归属上色：三份结构到第 02 章念到时才分色
  const fileL = tx(W, 'main.db　553 页', 200, 278, { fs: 30, mono: true });
  show(fileL, T('o5c', '553'), { y: 8 }); sfx('pop', T('o5c', '553'), { g: 0.4 });
  keyed(title).at(tG + 0.1, { html: '一个文件，553 页' });
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
  half.forEach((i, k) => set(G.cells[i], T('o7') + 0.3 + (tKill - T('o7') - 0.4) * k / half.length, { backgroundColor: '#efc6c6' }));
  read.forEach((pg, i) => set(G.cells[pg - 1], T('o7') - 0.1, { backgroundColor: '#ffffff', borderColor: '#444444', borderWidth: '0.8px' }));
  // 进程在跑：代码块下面一条进度条跟着改到的页走；强行终止：代码块边框变红、抖几下、整块塌掉，进度条停在一半变红
  const bar = h('div', 'abs', W); px(bar, 200, 944, 640, 10); css(bar, { background: K.teal, transformOrigin: '0 50%' }); set(bar, 0, { autoAlpha: 0 });
  tl.fromTo(bar, { autoAlpha: 1, scaleX: 0 }, { scaleX: 0.5, duration: Math.max(0.5, tKill - T('o7') - 0.4), ease: 'none', immediateRender: false }, T('o7') + 0.3);
  set(up, tKill, { borderColor: K.red }); set(bar, tKill, { backgroundColor: K.red });
  tl.fromTo(up, { x: 0 }, { x: 14, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, tKill);
  tl.fromTo(up, { scaleY: 1, autoAlpha: 1 }, { scaleY: 0, autoAlpha: 0, duration: 0.35, ease: 'power3.in', immediateRender: false }, tKill + 0.45);
  sfx('error', tKill, { g: 0.6 }); sfx('thud', tKill + 0.6, { g: 0.3 });
  gone(g7, T('o7') - 0.2, 0.3);
  keyed(title).at(T('o7') - 0.1, { html: '改到一半，进程被强行终止' });
  const tRe = T('o8') - 0.1;
  half.forEach((i, k) => set(G.cells[i], tRe + 0.3 + k * 0.5 / half.length, { backgroundColor: '#ffffff' }));
  gone(bar, tRe, 0.3);
  const sha = h('div', 'abs', W, '重新打开：整个文件的 <b>SHA-256</b> 与改之前相同'); px(sha, 200, 884); css(sha, { fontSize: '32px', color: K.body, background: '#f2f2f2', padding: '4px 16px' }); sha.dataset.gloss = '一字节不差';
  set(sha, 0, { autoAlpha: 0 }); wipe(sha, T('o8', '一字节不差') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('o8', '一字节不差'), { g: 0.5 });
  keyed(title).at(tRe, { html: '重新打开：一字节不差' });
  // 主问题（o4、o4b）接封面页：553 格收进右边一摞纸，读到的 7 页像书签抽出来（封面第 1 张的构图）；左边问句、大字 SQLite、小而强大、PART 4
  const tQ = T('o4') - 0.2;
  [sha, fileL].forEach((e) => gone(e, tQ, 0.3));
  keyed(title).at(tQ, { html: '' });
  const SX = 1220, SY = 340, SW = 400, SH = 470;
  const stackEls = [];
  for (let k = 6; k >= 0; k--) { const r = h('div', 'abs pg', W); px(r, SX + k * 12, SY - k * 12, SW, SH); r.style.borderWidth = '2px'; stackEls.push(r); }
  stackEls.forEach((r, k) => { set(r, 0, { autoAlpha: 0 }); show(r, tQ + 0.6 + k * 0.06, { y: 0, s: 0.92, d: 0.5 }); });
  G.cells.forEach((c, i) => tl.fromTo(c, { autoAlpha: 1, x: 0, y: 0, scale: 1 }, { autoAlpha: 0, x: SX + SW / 2 - G.pos(i + 1).x - 17, y: SY + SH / 2 - G.pos(i + 1).y - 17, scale: 0.3, duration: 0.8, ease: 'power3.in', immediateRender: false }, tQ + (i % 40) * 0.006 + Math.floor(i / 40) * 0.02));
  sfx('whoosh', tQ, { g: 0.4 });
  const BX = SX + 6 * 12, BY = SY - 6 * 12;
  const marks = read.map((pg, i) => { const y = BY + 34 + i * Math.floor((SH - 84) / (read.length - 1)); const tab = h('div', 'abs', W); px(tab, BX + SW - 30, y, 68, 30); css(tab, { background: K.wheat, border: `2px solid ${K.teal}`, boxSizing: 'border-box' }); W.insertBefore(tab, stackEls[0]);
    const b = btn(W, String(pg), BX + SW + 50, y - 2, 24); return [tab, b]; });
  marks.forEach(([tab, b], i) => { [tab, b].forEach((e) => { set(e, 0, { autoAlpha: 0 }); show(e, T('o4b', '关系数据库') + i * 0.12, { x: -16, y: 0, d: 0.4 }); }); });
  const q1 = tx(W, '一个库、一个文件，', 150, 300, { fs: 52, color: K.ink }), q2 = tx(W, '怎样装下一个完整的关系数据库？', 150, 372, { fs: 52, color: K.ink });
  show(q1, T('o4'), { y: 10 }); show(q2, T('o4b'), { y: 10 });
  const big = tx(W, 'SQLite', 130, 470, { fs: 220, color: K.teal, lh: 1.0, css: { letterSpacing: '-4px' } });
  const sub = tx(W, '小而强大', 150, 700, { fs: 48, color: K.teal });
  const k1 = tx(W, '一个数据库引擎是如何实现的？', 150, 780, { fs: 34 });
  const part = btn(W, 'PART 4', 150, 840, 30);
  const tC = T('oT');
  slam(big, tC, { from: 1.12 }); show(sub, tC + 0.5, { x: -20, y: 0 }); show(k1, tC + 0.9, { y: 8 }); show(part, tC + 1.4, { x: -16, y: 0 });
  sfx('thud', tC, { g: 0.55 });

  // 镜头：上排 → 两排 → 用户表 → 文件
  shots(cam, world, s, [
    [s.start, null, { rect: [640, 290, 1200, 470], zmax: 1.65 }],
    [T('o1', 'Postgres') - 0.25, null, { rect: [610, 236, 1220, 480], zmax: 1.4, d: 1.4 }],
    [T('o2b') - 0.4, null, { rect: [110, 200, 1690, 540], zmax: 1.35, d: 1.6 }],
    [T('o2d', '太重') - 1.7, null, { rect: [110, 190, 1690, 860], zmax: 1.2, d: 1.5 }],
    [T('o3c') - 0.2, null, { rect: [110, 190, 1690, 500], zmax: 1.2, d: 1.4 }],
    [tT, null, { rect: [140, 240, 1530, 900] }],
    [tG + 0.2, null, { rect: [190, 270, 1730, 950], d: 1.4 }],
    [tQ, null, { rect: [120, 280, 1820, 900] }],
  ]);

  // 焦点框：只在一排里要指出其中一样时用——「再单独跑一个服务」框住服务进程；用户表里先指 4096 这一行，再指 Alice
  focus(W, [[T('o2d', '单独'), srv, tFall], [T('o5', '4096'), tbl.rs[7]], [T('o5b'), aliceRow, T('o5c') - 0.2]], T('oT'));
});
