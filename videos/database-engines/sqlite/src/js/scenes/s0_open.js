// 开场：服务型数据库（程序把 SQL 发给单独运行的服务进程）→ SQLite（库编进程序，程序自己读写一个文件）→ 主问题 →
// 一个文件 553 页、找 Alice 只读 7 页、改到一半强行终止、重开一字节不差 → 五个问题。事实：G10、G01、J01、I01、E05。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const box = (html, x, y, w, hh, o = {}) => { const e = h('div', 'abs obox', W, html); px(e, x, y, w, hh); css(e, { border: `2px solid ${o.color || K.ink}`, background: o.fill || '#fff', fontSize: (o.fs || 30) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.3 }); return e; };
  const stack = (x, y, name) => { const g = h('div', 'abs', W); px(g, x, y, 240, 110); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', g); px(r, i * 10, i * 10, 200, 80); } const n = tx(g, name, 0, 96, { fs: 26, mono: true }); return g; };

  // ── 上排：服务型 ──
  const app1 = box('应用程序', 120, 260, 300, 100);
  const srv = box('<div>MySQL · PostgreSQL</div><div>服务进程</div>', 600, 250, 480, 120, { fs: 30 }); css(srv, { flexDirection: 'column' });
  const [sv1, sv2] = srv.children;
  const files1 = stack(1260, 255, '数据文件');
  const net = line(ov, [[420, 310], [600, 310]], { dashed: '8 6' });
  const netL = tx(W, '网络连接', 430, 268, { fs: 22, color: K.dim });
  const disk1 = line(ov, [[1080, 310], [1258, 310]]);
  wipe(app1, T('o2') - 0.25, { dir: 'l', d: 0.4 }); slam(srv, c0 + 0.15, { from: 1.15 }); sfx('thud', c0 + 0.15, { g: 0.5 });
  set(sv2, 0, { autoAlpha: 0 }); show(sv2, T('o1', '服务进程'), { y: 8 }); sfx('tick', T('o1', '服务进程'), { g: 0.4 });
  arrowIn(net, T('o2') + 0.1, 0.5); show(netL, T('o2') + 0.3, { y: 6 }); arrowIn(disk1, T('o1', '服务进程') + 0.4, 0.4); show(files1, T('o1', '服务进程') + 0.5, { x: -12, y: 0 });
  // 一条 SQL 发过去，结果送回来
  const q = tx(W, 'SELECT …', 430, 320, { fs: 24, mono: true, css: { background: K.code, border: `1.5px solid ${K.codeLine}`, padding: '2px 10px', opacity: 0, visibility: 'hidden' } });   // 建时就藏起来：落在 0 秒的 set 第一帧不执行
  set(q, 0, { autoAlpha: 0 }); tl.fromTo(q, { autoAlpha: 1, x: 0 }, { x: 150, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2', 'SQL')); sfx('tick', T('o2', 'SQL'), { g: 0.5 });
  tl.fromTo(q, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, T('o2', 'SQL') + 0.75);
  const rs = tx(W, '结果', 560, 320, { fs: 24, css: { background: K.wheat, padding: '2px 10px', opacity: 0, visibility: 'hidden' } });
  set(rs, 0, { autoAlpha: 0 }); tl.fromTo(rs, { autoAlpha: 1, x: 0 }, { x: -140, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, T('o2', '结果')); sfx('tick', T('o2', '结果'), { g: 0.4, p: -0.3 });
  tl.fromTo(rs, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, T('o2', '结果') + 0.8);

  // ── 下排：SQLite ──
  const prog = box('', 120, 520, 960, 190);
  const progL = tx(W, '应用程序', 146, 532, { fs: 26 }); prog.dataset.beat = 'fill';   // 名字是叠在框上的另一个元素：框用淡黄底，不用深青底
  const lib = box('SQLite 库', 640, 575, 400, 100, { fill: K.wheat, color: K.teal, fs: 32 }); 
  const db = stack(1260, 560, 'main.db');
  const direct = line(ov, [[1080, 615], [1258, 615]]);
  const noSrv = tx(W, '没有服务进程', 760, 470, { fs: 24, color: K.dim });
  wipe(prog, T('o3') - 0.05, { dir: 'l', d: 0.45 }); show(progL, T('o3'), { y: 6 }); show(noSrv, T('o3', '没有') , { y: 6 });
  set(lib, T('o3', '库') - 0.02, { x: 520 }); slam(lib, T('o3', '库'), { from: 1.2 }); sfx('thud', T('o3', '库'), { g: 0.5 });   // 库先出现在程序外面，「编进程序里」时移进去
  tl.fromTo(lib, { x: 520 }, { x: 0, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, T('o3', '编进')); sfx('whoosh', T('o3', '编进'), { g: 0.3 });
  arrowIn(direct, T('o3b'), 0.5); show(db, T('o3b', '一个文件'), { x: -12, y: 0 }); sfx('pop', T('o3b', '一个文件'), { g: 0.4 });

  // ── 主问题：上排退场，下排上移，文件铺开 ──
  const top = [app1, srv, files1, netL];
  top.forEach((e) => dim(e, T('o4') - 0.1, 0.2));
  [net, disk1].forEach((e) => tl.fromTo(e, { opacity: 1 }, { opacity: 0.2, duration: 0.3, immediateRender: false }, T('o4') - 0.1));
  tl.fromTo(lib, { backgroundColor: K.wheat }, { backgroundColor: '#ffffff', duration: 0.3, immediateRender: false }, T('o4b', '关系数据库') + 0.6);
  const tUp = T('o5') - 0.2;
  [...top, net, disk1].forEach((e) => goneFrom(e, tUp, 0.2));   // 已经调暗到 0.2，从 0.2 收起，不先跳回 1
  [prog, progL, lib, db, direct, noSrv].forEach((e) => tl.fromTo(e, { y: 0 }, { y: -250, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tUp));
  gone(noSrv, tUp + 0.7, 0.2);
  sfx('whoosh', tUp, { g: 0.3 });

  // 553 页：每页一格（表白、姓名索引浅灰、年龄索引更浅）
  const G = fileGrid(W, 130, 500, 79, 18, 3);
  G.cells.forEach((c, i) => show(c, T('o5') + 0.2 + (i % 79) * 0.006 + Math.floor(i / 79) * 0.05, { y: 0, d: 0.2 }));
  const fileL = tx(W, 'main.db　553 页 · 4096 个用户', 130, 660, { fs: 28, mono: true });
  show(fileL, T('o5', '553'), { y: 8 }); sfx('pop', T('o5', '553'), { g: 0.4 });
  // 找 Alice：读了其中 7 页
  const read = DATA.trace.index_then_table;
  read.forEach((pg, i) => set(G.cells[pg - 1], T('o6', '7') - 0.4 + i * 0.12, { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2.5px' }));
  sfx('tick', T('o6', '7') - 0.4, { g: 0.5 });
  const g7 = gloss(W, '7 页', '找 Alice 读到的页：' + read.join('、'), 1150, 660, 680, { terms: '7 页' }); g7.style.fontSize = '26px';
  show(g7, T('o6', '7'), { x: 12, y: 0 });

  // 年龄加一，改到一半强行终止；重开以后一字节不差
  const up = codeBlock(W, ['UPDATE users SET age = age + 1;'], 130, 740, { fs: 28 });
  wipe(up, T('o7') - 0.1, { dir: 'l', d: 0.4 });
  const tKill = T('o7', '强行终止');
  const users = [...DATA.file.owner].map((o, i) => (o === 'u' || o === 'a' ? i : -1)).filter((i) => i >= 0 && !read.includes(i + 1));
  const half = users.slice(0, Math.floor(users.length * 0.5));
  half.forEach((i, k) => set(G.cells[i], T('o7') + 0.3 + (tKill - T('o7') - 0.4) * k / half.length, { backgroundColor: '#f7e6c4' }));
  const kill = errBox(W, '强行终止', 760, 744, 30); set(kill, 0, { autoAlpha: 0 }); slam(kill, tKill, { from: 1.3 }); sfx('error', tKill, { g: 0.6 });
  [g7, fileL].forEach((e) => dim(e, T('o7') - 0.1, 0.3));
  const tRe = T('o8') - 0.1;
  half.forEach((i) => set(G.cells[i], tRe + 0.3, { backgroundColor: OWN[DATA.file.owner[i]] }));
  [up, kill].forEach((e) => gone(e, tRe, 0.3));
  const sha = h('div', 'abs', W, '重新打开：整个文件的 <b>SHA-256</b> 与改之前相同'); px(sha, 130, 744); css(sha, { fontSize: '30px', color: K.body, background: K.wheat, padding: '4px 16px' }); sha.dataset.gloss = '一字节不差';
  set(sha, 0, { autoAlpha: 0 }); wipe(sha, T('o8', '一字节不差') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('o8', '一字节不差'), { g: 0.5 });

  // 五个问题：跟着念到的词逐个出现
  const tQ = T('o10') - 0.1;
  [sha].forEach((e) => gone(e, tQ, 0.3)); dim(g7, tQ, 0.15, 0.3); dim(fileL, tQ, 0.15, 0.3);
  const qs = [['怎么放', '怎么放'], ['怎么找', '怎么找'], ['改和删', '改和删'], ['怎么并发', '怎么并发'], ['出错怎么办', '出错']];
  let qx = 130;
  const qBtns = []; qs.forEach(([s0, w], i) => { const b = btn(W, `${i + 1}. ${s0}`, qx, 760, 30); qx += [...s0].length * 30 + 110; set(b, 0, { autoAlpha: 0 }); slam(b, T('o10b', w), { from: 1.2 }); sfx('pop', T('o10b', w), { g: 0.35, p: -0.4 + i * 0.2 }); qBtns.push(b); });
  const alice = tx(W, '沿着 <b>Alice</b>：id 2050 · 42 岁', 130, 850, { fs: 28 }); show(alice, T('o10', 'Alice'), { x: 10, y: 0 });

  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('o1'), sv1], [T('o1', '这类'), srv], [T('o1', '服务进程'), sv2], [T('o2'), app1], [T('o2', '网络'), netL], [T('o2', '结果'), app1], [T('o3'), prog], [T('o3', '库'), lib], [T('o3b'), progL], [T('o3b', '一个文件'), db], [T('o4', '一个库'), lib], [T('o4', '一个文件'), db], [T('o4b', '关系数据库'), lib], [T('o4b', '不出错'), db], [T('o5', '4096'), fileL], [T('o6', '7'), g7], [T('o7'), up], [T('o8', '一字节不差'), sha], [T('o10'), alice],
    ...qBtns.map((b, i) => [T('oT') + i * 0.5, b])], T('oT') + 2.8);
  stay(cam, s, c0, 1);
});
