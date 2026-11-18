// 开场：Alice 存进去、找回来（mongosh 实物）→ 前五集都是表 + SQL → SELECT 收成「SQL」，前面推进一个「No」→ 片名。
// 事实：A01 A12 C07（mongosh 回显）；S04 S01（前五集与 ClickHouse 按列）；N01。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);

  // ── 第一站：mongosh ──
  const ghost = label(world, 1080, 150, 'CREATE TABLE users (name …, age …);', 'mono');
  css(ghost, { font: '500 28px "Mono"', color: '#889397' });
  const strike = h('div', 'abs', world); px(strike, 1072, 170, 0, 4); css(strike, { background: '#DB3030', transformOrigin: '0 50%' });
  const sh = codeCard(world, 120, 120, 900, 'mongosh · users', 760);
  const L1 = sh.line(''), L2 = sh.line(''), L3 = sh.line(''), L4 = sh.line(''), L5 = sh.line('');
  const doc = h('div', '', sh.body, '{\n  <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>),\n  <span class="k">name</span>: <span class="s">\'Alice\'</span>,\n  <span class="k">age</span>: <span class="n">42</span>\n}');
  typeText(L1, '<span class="c">&gt;</span> db.users.insertOne({', T('o1'), 34, { cursorUntil: T('o1') + 0.9 });
  typeText(L2, '    <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span> })', T('o1') + 0.9, 34, { cursorUntil: T('o2') });
  appear(L2, T('o1') + 0.9);
  appear(L3, T('o2', 'MongoDB')); L3.innerHTML = '<span class="c">{ acknowledged: true }</span>';
  // 没有建表：划掉的 CREATE TABLE
  show(ghost, T('o3'), { y: 0 }); fromTo(strike, T('o3') + 0.6, { width: 0 }, { width: 560, duration: 0.5, ease: 'power2.inOut' }); sfx('blip', T('o3') + 0.6);
  typeText(L4, '<span class="c">&gt;</span> db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })', T('o4'), 40, { cursorUntil: T('o4') + 1.6 });
  appear(L4, T('o4'));
  show(doc, T('o4') + 1.6, { y: 10 });
  // 多出来的 _id；查询条件本身是一小份文档
  const idBox = h('div', 'abs', world); px(idBox, 146, 428, 600, 48); css(idBox, { border: '3px solid #00ED64', borderRadius: '8px' });
  show(idBox, T('o4', '_id'), { y: 0, s: 1.04 }); hide(idBox, Tend('o4') + 0.4, { y: 0 });
  const fBox = h('div', 'abs', world); px(fBox, 478, 336, 330, 50); css(fBox, { border: '3px solid #00ED64', borderRadius: '8px' });
  show(fBox, T('o5'), { y: 0, s: 1.04 });
  const fNote = note(world, 1080, 560, '查询条件 <b>{ name: "Alice" }</b> 也是一小份文档', 'g'); css(fNote, { fontSize: '30px' });
  show(fNote, T('o5') + 0.4);
  const sqlGhost = label(world, 1080, 400, "SELECT * FROM users WHERE name = 'Alice';", 'mono');
  css(sqlGhost, { font: '500 28px "Mono"', color: '#889397' });
  const strike2 = h('div', 'abs', world); px(strike2, 1072, 420, 690, 4); css(strike2, { background: '#DB3030', transformOrigin: '0 50%' });
  show(sqlGhost, T('o6'), { y: 0 }); fromTo(strike2, T('o6') + 0.6, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }); sfx('blip', T('o6') + 0.6);

  // ── 第二站：前五集（S04），都是表 + SQL ──
  const X2 = 1920;
  const eps = [['MyISAM', 'PART 1'], ['InnoDB', 'PART 2'], ['PostgreSQL', 'PART 3'], ['SQLite', 'PART 4'], ['ClickHouse', 'PART 5']];
  const tiles = eps.map(([n, p], i) => {
    const t = h('div', 'panel', world); px(t, X2 + 120 + i * 296, 250, 280, 360);
    label(t, 22, 18, p, 'lab'); const nm = h('div', 'abs', t, n); css(nm, { left: '22px', top: '52px', font: '700 34px "Inter"', color: '#061621' });
    const grid = h('div', 'abs', t); css(grid, { left: '22px', top: '120px', width: '236px', height: '170px' });
    const cols = [];
    for (let c = 0; c < 3; c++) {
      const col = h('div', 'abs', grid); css(col, { left: c * 79 + 'px', top: 0, width: '77px', height: '170px' });
      for (let r = 0; r < 5; r++) { const cell = h('div', 'abs', col); css(cell, { left: 0, top: r * 34 + 'px', width: '77px', height: '34px', border: '1.5px solid #C1C7C6', background: r === 0 ? '#E3FCF7' : '#fff' }); }
      cols.push(col);
    }
    const q = h('div', 'abs mono', t, 'SELECT …'); css(q, { left: '22px', top: '305px', font: '500 24px "Mono"', color: '#00684A' });
    return { t, cols };
  });
  tiles.forEach((tt, i) => show(tt.t, T('o7') + 0.2 + i * 0.25, { y: 30 }));
  sfx('pop', T('o7') + 0.2);
  // ClickHouse 的表拆成一列一列（S01），仍是表
  tiles[4].cols.forEach((c, i) => to(c, T('o10'), { x: (i - 1) * 14, duration: 0.6, ease: 'power2.out' }));
  const relTag = h('div', 'abs', world); px(relTag, X2 + 120, 650, 1464, 64);
  css(relTag, { borderTop: '4px solid #00684A', paddingTop: '14px', font: '700 40px "Serif SC"', color: '#00684A', textAlign: 'center' });
  relTag.textContent = '关系数据库：先建表，再用 SQL';
  show(relTag, T('o9'), { y: 16 });
  // MongoDB 不在这一类：一份文档，不是表格
  const mdbTile = h('div', 'panel', world); px(mdbTile, X2 + 1620, 250, 280, 360); css(mdbTile, { borderColor: '#00ED64', borderWidth: '3px', background: '#fff' });
  label(mdbTile, 22, 18, 'PART 6', 'lab'); const mn = h('div', 'abs', mdbTile, 'MongoDB'); css(mn, { left: '22px', top: '52px', font: '700 34px "Inter"', color: '#00684A' });
  const md = h('div', 'abs mono', mdbTile, '{\n  name: "Alice",\n  age: 42\n}'); css(md, { left: '22px', top: '120px', font: '500 26px/40px "Mono"', color: '#061621' });
  show(mdbTile, T('o11'), { x: 60, y: 0 }); sfx('pop', T('o11'));

  // ── 第三站：SELECT 收成「SQL」，前面推进一个「No」 ──
  const X3 = 3840 + 400;
  const sel = h('div', 'abs mono', world, ''); px(sel, X3 + 100, 430);
  css(sel, { font: '700 64px "Mono"', color: '#061621' });
  const parts = ['SELECT * FROM users ', 'WHERE name = \'Alice\'', ' — ', 'SQL'];
  const spA = h('span', '', sel, parts[0]), spB = h('span', '', sel, parts[1]), spSQL = h('span', '', sel, '');
  const big = h('div', 'abs', world); px(big, X3 + 380, 330); css(big, { font: '900 260px "Inter"', color: '#061621', letterSpacing: '-.02em' });
  const no = h('span', '', big, 'No'); css(no, { color: '#00684A', display: 'inline-block' });
  const sq = h('span', '', big, 'SQL'); css(sq, { display: 'inline-block' });
  show(sel, Tend('o11') + 0.2, { y: 0 });
  // o12：语句收缩，只剩 SQL；No 从左边推进来
  const t12 = T('o12');
  hide(sel, t12 + 0.2, { y: 0, d: 0.35 });
  fromTo(big, t12 + 0.3, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
  fromTo(no, T('o12', 'No') - 0.1, { x: -520, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.6)' });
  fromTo(sq, T('o12', 'No') - 0.1, { x: -180 }, { x: 0, duration: 0.55, ease: 'back.out(1.6)' });
  sfx('thud', T('o12', 'No') + 0.25);
  // o13–o14：Alice 的那份资料往下落到磁盘
  const disk = h('div', 'panel', world); px(disk, X3 + 560, 760, 900, 90); css(disk, { background: '#F9FBFA' });
  const dl = h('div', 'abs', disk, '磁盘上：？'); css(dl, { left: '30px', top: '22px', font: '600 34px "Sans SC"', color: '#5C6C75' });
  const dchip = chip(world, X3 + 860, 640, '{ name: "Alice", age: 42 }', 'on');
  show(disk, T('o13'), { y: 20 }); show(dchip, T('o13') + 0.3, { y: -40 });
  to(dchip, T('o14'), { y: 120, duration: 0.9, ease: 'power2.in' });

  // ── 片名（oT）：整屏 ──
  const title = h('div', 'abs', root); css(title, { inset: 0, background: '#FDFFF5', zIndex: 20 });
  const ey = h('div', 'abs eyebrow', title, 'PART 6 · MONGODB · WIREDTIGER'); px(ey, 160, 250);
  const q = h('div', 'abs', title, '一个数据库引擎是如何实现的？'); px(q, 160, 320); css(q, { font: '500 46px "Sans SC"', color: '#3D4F58' });
  const tt = h('div', 'abs', title, '不是 SQL'); px(tt, 152, 390); css(tt, { font: '900 200px/1.1 "Sans SC"', color: '#061621' });
  const st = h('div', 'abs', title, 'MongoDB 的 WiredTiger'); px(st, 160, 640); css(st, { font: '700 96px "Serif SC"', color: '#00684A' });
  const tOT = T('oT');
  appear(title, tOT); wipe(ey, tOT + 0.1, { dir: 'l' }); show(q, tOT + 0.2, { y: 14 }); slam(tt, tOT + 0.35, { from: 1.15 }); show(st, tOT + 0.7, { y: 20 });
  sfx('thud', tOT + 0.45);
  tl.set(world, { autoAlpha: 0 }, tOT);   // 片名整屏盖住后，下面的内容不再算画面
  const rule = h('div', 'abs', title); px(rule, 160, 600, 1600, 6); css(rule, { background: '#00ED64', transformOrigin: '0 50%' });
  fromTo(rule, tOT + 1.2, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' });
  const sub = h('div', 'abs', title, 'PART 6 · 数据库引擎系列'); px(sub, 160, 790); css(sub, { font: '600 34px "Mono"', color: '#5C6C75', letterSpacing: '.1em' });
  show(sub, tOT + 2.3, { y: 10 });

  // 镜头：三站
  const a = drift(s.start, T('o7') - 0.2, 960, 1), b = drift(T('o7') + 1.2, T('o12') - 0.4, X2 + 1010, -1), c = drift(T('o12') + 1, tOT, X3 + 960 - 140, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d - 0.3, { ease: 'none', sfx: false }],
    [T('o7') - 0.2, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
    [Tend('o11') - 0.2, { x: c.from }, 1.3],
    [null, { x: c.to }, Math.max(0.5, tOT - (Tend('o11') + 1.25)), { ease: 'none', sfx: false }],
  ]);
});
