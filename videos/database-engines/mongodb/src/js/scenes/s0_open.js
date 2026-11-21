// 开场：Alice 存进去、找回来（mongosh 实物，旁边是「同一件事用 SQL 要写的」对照）→ 前五集都是表 + SQL → 「SQL」前面推进一个「No」→
// Alice 的资料落进数据目录（三个「?」文件，留到第 02 章揭晓）→ 片名：文档左栏式的系列目录，PART 6 选中。
// 事实：A01 A12 C07（mongosh 回显）；S04 S01（前五集与 ClickHouse 按列）；N01；环境与版本（9.0.8、mongosh 2.14.2）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, 'PART 6');

  // ── 第一站：mongosh 代码块；右边是同一件事用 SQL 要写的三句 ──
  const sh = codeCard(world, 120, 150, 1000, 'mongosh', 500);
  css(sh.body, { font: '400 28px/50px "Mono"', paddingTop: '20px' });
  const L1 = sh.line(''), L2 = sh.line(''), L3 = sh.line(''), L4 = sh.line('');
  show(sh.c, s.start, { y: 14 });
  typeText(L1, '<span class="p">lab&gt;</span> db.users.insertOne({ <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span> })', T('o1'), 36, { cursorUntil: T('o1') + 1.6 });
  appear(L1, T('o1'));
  L2.innerHTML = '{\n  <span class="k">acknowledged</span>: <span class="n">true</span>,\n  <span class="k">insertedId</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>)\n}';
  show(L2, T('o2', 'MongoDB') + 0.2, { y: 8, d: 0.4 });
  typeText(L3, '<span class="p">lab&gt;</span> db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })', T('o4'), 40, { cursorUntil: T('o4') + 1.3 });
  appear(L3, T('o4'));
  L4.innerHTML = '{ <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>), <span class="k">name</span>: <span class="s">\'Alice\'</span>, <span class="k">age</span>: <span class="n">42</span> }';
  show(L4, T('o5') + 0.1, { y: 8, d: 0.4 });
  figs(world, 120, 676, 1000, [[T('o2') + 0.3, '图 0-1', '在 mongosh 里存进、找回 Alice', '实测：MongoDB 9.0.8 · mongosh 2.14.2']], T('o7') - 0.3);
  // o4：两处花括号是同一种格式（存进去的资料、查询条件）
  ring(world, 546, 228, 449, 54, T('o4', '同样的格式') - 0.2, T('o5') - 0.1);
  ring(world, 513, 478, 298, 54, T('o4', '同样的格式') - 0.1, T('o5') - 0.1);
  // o5：多出来的 _id
  ring(world, 176, 528, 444, 54, T('o5', '_id') - 0.2, Tend('o6') + 0.2, '#00ED64');

  // 右边：同一件事用 SQL 要写的
  const SX = 1180;
  const sqlH = label(world, SX, 160, '同一件事，用 SQL 要写', 'lab'); css(sqlH, { font: '700 30px "Inter", "Sans SC"', color: '#001E2B' });
  const rows = [
    ["CREATE TABLE users (", "  name VARCHAR(50), age INT);"],
    ["INSERT INTO users", "  VALUES ('Alice', 42);"],
    ["SELECT * FROM users", "  WHERE name = 'Alice';"],
  ].map(([a, b], i) => { const e = h('div', 'card', world); px(e, SX, 220 + i * 150, 620, 128); css(e, { padding: '14px 22px', font: '500 26px/44px "Mono"', whiteSpace: 'pre', color: '#3D4F58' }); e.innerHTML = a + '\n' + b; return e; });
  show(sqlH, T('o1') + 0.8, { y: 8 });
  show(rows[1], T('o1') + 1.1, { x: 30, y: 0 });
  // o3：事先没有建表 —— CREATE TABLE 这一句根本用不上
  show(rows[0], T('o3'), { x: 30, y: 0 });
  const strike0 = [254, 298].map((y) => { const e = h('div', 'abs', world); px(e, SX + 16, y, 580, 4); css(e, { background: '#DB3030', transformOrigin: '0 50%' }); return e; });
  fromTo(strike0, T('o3', '建表') + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }); sfx('blip', T('o3', '建表') + 0.1);
  const noNeed = chip(world, SX + 420, 196, '用不上', 'red'); show(noNeed, T('o3', '建表') + 0.5, { y: 8 });
  to(rows[0], T('o4') - 0.2, { opacity: 0.45, duration: 0.4 });
  show(rows[2], T('o4'), { x: 30, y: 0 });
  // o6：一句 SQL 都没写
  const zero = chip(world, SX, 700, 'SQL：0 句', 'sp'); css(zero, { font: '700 32px "Inter", "Sans SC"', padding: '10px 26px' });
  to([rows[1], rows[2]], T('o6', 'SQL') - 0.3, { opacity: 0.45, duration: 0.5 });
  show(zero, T('o6', 'SQL') - 0.1, { y: 10 }); sfx('pop', T('o6', 'SQL'));

  // ── 第二站：前五集（S04），都是表 + SQL；ClickHouse 拆成一列一列（S01）也还是表 ──
  const X2 = 1920;
  const eps = [['MyISAM', 'PART 1'], ['InnoDB', 'PART 2'], ['PostgreSQL', 'PART 3'], ['SQLite', 'PART 4'], ['ClickHouse', 'PART 5']];
  const CW = 240, GAP = 22, CX = X2 + 110;
  const tiles = eps.map(([n, p], i) => {
    const t = h('div', 'panel', world); px(t, CX + i * (CW + GAP), 250, CW, 430);
    label(t, 24, 22, p, 'lab'); const nm = h('div', 'abs', t, n); css(nm, { left: '24px', top: '62px', font: '700 30px "Inter"', color: '#001E2B' });
    const grid = h('div', 'abs', t); css(grid, { left: '24px', top: '134px', width: '206px', height: '180px' });
    const cols = [];
    for (let c = 0; c < 3; c++) {
      const col = h('div', 'abs', grid); css(col, { left: c * 69 + 'px', top: 0, width: '68px', height: '180px' });
      for (let r = 0; r < 5; r++) { const cell = h('div', 'abs', col); css(cell, { left: 0, top: r * 36 + 'px', width: '68px', height: '36px', border: '1.5px solid #C1C7C6', background: r === 0 ? '#E8EDEB' : '#fff' }); }
      cols.push(col);
    }
    const q = chip(t, 24, 350, 'SQL', 'blue');
    return { t, cols };
  });
  tiles.forEach((tt, i) => show(tt.t, T('o7') + 0.2 + i * 0.22, { y: 30 }));
  sfx('pop', T('o7') + 0.2);
  // 念到名字时，那一张亮一下（淡入淡出，不跳）
  [['o8', 'MyISAM', 0], ['o8', 'InnoDB', 1], ['o8', 'PostgreSQL', 2], ['o8b', 'SQLite', 3], ['o8b', 'ClickHouse', 4]].forEach(([id, w, i]) => glow(tiles[i].t, T(id, w) - 0.1, T(id, w) + 0.9, { bg: '#E3FCF7', bd: '#00A35C', rd: '#E8EDEB' }));
  tiles[4].cols.forEach((c, i) => to(c, T('o10', '一列一列') - 0.2, { x: (i - 1) * 16, duration: 0.6, ease: 'power2.out' }));
  const colTag = chip(world, CX + 4 * (CW + GAP) + 24, 196, '按列存放', 'on'); show(colTag, T('o10', '一列一列') - 0.1, { y: 8 });
  // 括号：五张卡都是关系数据库
  const brace = h('div', 'abs', world); px(brace, CX, 716, 5 * CW + 4 * GAP, 14); css(brace, { borderLeft: '3px solid #00684A', borderRight: '3px solid #00684A', borderBottom: '3px solid #00684A' });
  const relTag = h('div', 'abs', world, '关系数据库：先建表，再写 SQL'); px(relTag, CX, 750, 5 * CW + 4 * GAP);
  css(relTag, { font: '500 44px "Serif SC"', color: '#00684A', textAlign: 'center' });
  show(brace, T('o9', '关系数据库') - 0.3, { y: 0, d: 0.4 }); show(relTag, T('o9', '关系数据库') - 0.1, { y: 12 });
  // MongoDB：一份文档，不是表格
  const mdbTile = h('div', 'panel', world); px(mdbTile, CX + 5 * (CW + GAP) + 40, 250, 300, 430); css(mdbTile, { borderColor: '#00ED64', borderWidth: '3px' });
  label(mdbTile, 24, 22, 'PART 6', 'lab'); const mn = h('div', 'abs', mdbTile, 'MongoDB'); css(mn, { left: '24px', top: '62px', font: '700 32px "Inter"', color: '#00684A' });
  const md = h('div', 'abs mono', mdbTile, '{\n  <span class="k">name</span>: <span class="s">"Alice"</span>,\n  <span class="k">age</span>: <span class="n">42</span>\n}'); css(md, { left: '24px', top: '134px', font: '500 28px/44px "Mono"', color: '#001E2B' });
  const noT = chip(mdbTile, 24, 350, '不建表', 'on'), noS = chip(mdbTile, 150, 350, '不写 SQL', 'on');
  show(mdbTile, T('o11'), { x: 60, y: 0 }); sfx('pop', T('o11'));
  show(noT, T('o11') + 0.2, { y: 8 }); show(noS, T('o11') + 0.5, { y: 8 });

  // ── 第三站：「SQL」，前面推进一个「No」；Alice 的资料落进数据目录 ──
  const X3 = 3840 + 400;
  const big = h('div', 'abs', world); px(big, X3 + 960 - 560, 180, 1120); css(big, { font: '800 250px/1.1 "Inter"', color: '#001E2B', letterSpacing: '-.02em', textAlign: 'center' });
  const no = h('span', '', big, 'No'); css(no, { color: '#00684A', display: 'inline-block' });
  const sq = h('span', '', big, 'SQL'); css(sq, { display: 'inline-block' });
  const t12 = T('o12');
  fromTo(big, t12, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  fromTo(no, T('o12', 'No') - 0.1, { x: -480, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.6)' });
  fromTo(sq, T('o12', 'No') - 0.1, { x: -150 }, { x: 0, duration: 0.55, ease: 'back.out(1.6)' });
  sfx('thud', T('o12', 'No') + 0.25);
  const ul = h('div', 'abs', world); px(ul, X3 + 960 - 560, 470, 1120, 5); css(ul, { background: '#E8EDEB' }); show(ul, T('o12', 'No') + 0.4, { y: 0 });
  // o13：资料往下落进数据目录；三个文件先是问号（第 02 章揭晓）
  const docC = code(world, X3 + 960 - 230, 520, '{ name: "Alice", age: 42 }'); css(docC, { fontSize: '32px', background: '#E3FCF7', borderColor: '#00A35C' });
  const dir = h('div', 'panel gray', world); px(dir, X3 + 960 - 450, 690, 900, 200);
  const dl = h('div', 'abs mono', dir, 'db/'); css(dl, { left: '28px', top: '20px', font: '600 28px "Mono"', color: '#3D4F58' });
  const files = [0, 1, 2].map((i) => { const f = h('div', 'abs', dir); css(f, { left: 150 + i * 240 + 'px', top: '64px', width: '170px', height: '110px', background: '#fff', border: '2px solid #C1C7C6', borderRadius: '10px', font: '600 40px/106px "Mono"', color: '#5C6C75', textAlign: 'center' }); f.textContent = '?.wt'; return f; });
  show(docC, T('o13'), { y: -20 });
  show(dir, T('o13', '磁盘') - 0.3, { y: 20 });
  to(docC, T('o13', '磁盘') + 0.1, { y: 120, autoAlpha: 0, duration: 0.8, ease: 'power2.in' });
  files.forEach((f, i) => show(f, T('o13', '磁盘') + 0.7 + i * 0.12, { y: 10, d: 0.4 }));
  // o14：又怎样被找出来 —— 一条查询从文件里取回她
  const back = code(world, X3 + 960 - 230, 560, 'find({ name: "Alice" })'); css(back, { fontSize: '30px' });
  show(back, T('o14') - 0.3, { y: 16 });
  const up = link(ov, [[X3 + 960, 690], [X3 + 960, 620]], 'accent', { arrow: true, w: 3 }); arrowIn(up, T('o14') + 0.4, 0.5);

  // ── 片名（oT）：文档左栏式的系列目录，PART 6 选中 ──
  const tOT = T('oT');
  const P = partCard(root, 6, tOT);
  const cr = h('div', 'crumb2', P.main, '文档<i>/</i>数据库引擎<i>/</i>PART 6'); css(cr, { top: '170px' });
  const badge = h('div', 'abs', P.main, 'PART 6'); px(badge, 0, 250); css(badge, { font: '700 52px "Mono"', color: '#00ED64', background: '#001E2B', padding: '10px 30px', borderRadius: '12px', letterSpacing: '.06em' });
  const q = h('div', 'abs', P.main, '一个数据库引擎是如何实现的？'); px(q, 0, 380); css(q, { font: '500 46px "Inter", "Sans SC"', color: '#3D4F58' });
  const tt = h('div', 'abs', P.main, '不是 SQL'); px(tt, -6, 450); css(tt, { font: '900 190px/1.1 "Sans SC"', color: '#001E2B' });
  const rule = h('div', 'abs', P.main); px(rule, 0, 676, 1000, 5); css(rule, { background: '#00ED64', transformOrigin: '0 50%' });
  const st = h('div', 'abs', P.main, 'MongoDB 的 WiredTiger'); px(st, 0, 712); css(st, { font: '500 80px "Serif SC"', color: '#00684A' });
  const vv = chip(P.main, 0, 850, 'MongoDB 9.0.8 · 存储引擎 WiredTiger', '');
  wipe(cr, tOT + 0.1, { dir: 'l' }); slam(badge, tOT + 0.3, { from: 1.2 }); show(q, tOT + 0.2, { y: 14 }); slam(tt, tOT + 0.55, { from: 1.12 }); show(st, tOT + 0.9, { y: 20 });
  fromTo(rule, tOT + 1.0, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' });
  show(vv, tOT + 1.2, { y: 10 });
  sfx('thud', tOT + 0.6);
  tl.set([world, ch.c], { autoAlpha: 0 }, tOT + 0.05);   // 片名整屏盖住后，下面的内容不再算画面

  // 镜头：三站
  const a = drift(s.start, T('o7') - 0.2, 960, 1), b = drift(T('o7') + 1.2, Tend('o11') - 0.2, X2 + 960, -1), c = drift(Tend('o11') + 1.1, tOT, X3 + 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d - 0.3, { ease: 'none', sfx: false }],
    [T('o7') - 0.2, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
    [Tend('o11') - 0.2, { x: c.from }, 1.3],
    [null, { x: c.to }, Math.max(0.5, tOT - (Tend('o11') + 1.25)), { ease: 'none', sfx: false }],
  ]);
});
