// 01 学院出身：年代线，名字随旁白一路变（H1–H6）→ SQL:2023 的 177 项里至少 170，各家公布的情况（H7、H10）→ 事务里的 DDL 回滚、约束把关（H8、H9）
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('h10') + 0.5, tC = Tend('h15') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);

  // ── A：年代线。一个标记沿轴走到讲到的年份；上方的名字只有一个，说到新名字的那一刻就变 ──
  hdoc(A, '从伯克利的研究项目，到今天的 PostgreSQL 18', 72, 128);
  const Y = 680, X = (yr) => 160 + (yr - 1984) * 37;                // 1984–2027 映射到 160–1751
  const axis = h('div', 'axis', A); px(axis, 120, Y, 1680); css(axis, { height: '4px', background: 'var(--pg)' });
  fromTo(axis, c0 + 0.1, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' });
  // 标记：三角 + 竖线
  const mk = h('div', 'abs', A); px(mk, X(1986) - 14, Y - 58, 28, 58); mk.dataset.name = '年代标记';
  mk.innerHTML = '<div style="position:absolute;left:0;top:0;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:20px solid var(--navy)"></div><div style="position:absolute;left:12px;top:18px;width:4px;height:40px;background:var(--navy)"></div>';
  show(mk, T('h1'), { y: -16, d: 0.4 });
  const goto = (yr, t) => { to(mk, t, { x: X(yr) - X(1986), duration: 0.7, ease: 'power2.inOut' }); sfx('whoosh', t, { g: 0.25 }); };
  const node = (yr, label, t, up = true, dx = -60) => {
    const dot = h('div', 'abs', A); px(dot, X(yr) - 11, Y - 9, 22, 22); css(dot, { background: '#fff', border: '5px solid var(--pg)', borderRadius: '50%' });
    const y = h('div', 'lbl', A, String(yr)); px(y, X(yr) - 34, up ? Y - 110 : Y + 30); css(y, { fontSize: '30px' });
    const l = h('div', 'cap', A, label); px(l, X(yr) + dx, up ? Y - 186 : Y + 76); css(l, { fontSize: '26px', lineHeight: '1.4' });
    slam(dot, t + 0.5, { from: 1.6 }); show(y, t + 0.55, { y: up ? 10 : -10 }); show(l, t + 0.65, { y: up ? 10 : -10 });
    sfx('tick', t + 0.5, { g: 0.6 });
    return { dot, y, l };
  };
  // 1986：伯克利
  const n86 = node(1986, '伯克利开始实现', T('h1') - 0.5, true, -40);
  keyed(n86.l).at(T('h1', '研究系统'), { html: '伯克利开始实现<br>一个研究系统' }); sfx('tick', T('h1', '研究系统'), { g: 0.4 });
  // 斯通布雷克与 Ingres
  const sb = tagEl(A, 'Michael Stonebraker 教授', 72, 214, 'navy'); css(sb, { fontSize: '30px' }); show(sb, T('h2', '斯通布雷克'), { x: -20 });
  const ing = glossBox(A, 'Ingres', '<b>Ingres</b>：斯通布雷克之前<br>在伯克利做的关系数据库', 72, 290, 500);
  show(ing, T('h2', 'Ingres') - 0.2, { x: -20 }); sfx('pop', T('h2', 'Ingres'), { g: 0.6 });
  // 名字：INGRES 先出现（灰），POST 从左边进来，IN 退出，GRES 合上去 = POSTGRES
  const NX = 700, NY = 196, NF = { font: '800 110px "Open Sans"', letterSpacing: '2px', whiteSpace: 'nowrap' };
  const mkw = (txt, color) => { const e = h('div', 'abs', A, txt); css(e, { ...NF, color }); return e; };
  const post = mkw('POST', 'var(--pg)'), inn = mkw('IN', '#8a949c'), gres = mkw('GRES', '#8a949c');
  const wP = post.offsetWidth, wI = inn.offsetWidth, wG = gres.offsetWidth;
  px(post, NX, NY); px(inn, NX + wP, NY); px(gres, NX + wP + wI, NY);
  [post, inn, gres].forEach((e) => { e.dataset.name = '名字'; });
  const tIng = T('h2', 'Ingres');
  show(inn, tIng, { y: 16 }); show(gres, tIng + 0.05, { y: 16 });
  const tPG = T('h4', 'POSTGRES');
  show(post, tPG, { x: -40, y: 0 }); sfx('pop', tPG);
  set(gres, tPG, { color: 'var(--pg)' });
  const tAfter = T('h4', '之后');
  to(inn, tAfter, { y: -50, autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
  to(gres, tAfter + 0.25, { x: -wI, duration: 0.5, ease: 'power3.inOut' });
  const meaning = capt(A, '<b style="color:var(--pg)">POST</b> + <span style="color:#8a949c">IN</span>GRES：Ingres 之后', NX, NY + 150); css(meaning, { fontSize: '28px' });
  show(meaning, tAfter + 0.2, { y: 10 });
  // 1994：加上 SQL；名字旁边挂上一块「+ SQL」
  node(1994, 'Andrew Yu、Jolly Chen<br>加上 SQL', T('h6') - 0.5, false, -110);
  goto(1994, T('h6') - 0.5);
  hide(meaning, T('h6'), { d: 0.3 }); hide(ing, T('h6'), { d: 0.3 });
  const plus = tagEl(A, '+ SQL', NX + wP + wG + 36, NY + 26, 'navy'); css(plus, { fontSize: '54px', padding: '6px 22px' });
  slam(plus, T('h6', 'SQL'), { from: 1.3 }); sfx('pop', T('h6', 'SQL'));
  const open = tagEl(A, '开源发布', X(1994) - 70, Y + 170, 'ok'); css(open, { fontSize: '26px' }); slam(open, T('h7', '开源'), { from: 1.2 }); sfx('pop', T('h7', '开源'), { g: 0.6 });
  // 名字随后的几次变化：交叉淡变，不闪
  const t95 = T('h7', 'Postgres95'), tPQ = T('h8', 'PostgreSQL'), t18 = T('h9', '18');
  [post, gres].forEach((e) => to(e, t95 - 0.05, { autoAlpha: 0, duration: 0.3 }));
  const names = morphText(A, NX, NY, { ...NF, color: 'var(--pg)' }, [
    [t95, 'Postgres<span style="color:var(--navy)">95</span>'],
    [tPQ, '<span class="a">Postgre</span><span class="b">SQL</span>'],
    [t18, 'PostgreSQL<span style="color:var(--navy)"> 18</span>'],
  ]);
  names.forEach((e) => { e.dataset.name = '名字'; });
  // 「+ SQL」跟着名字挪，定名时并进名字里
  to(plus, t95, { x: names[0].offsetWidth - wP - wG + 10, duration: 0.4, ease: 'power2.inOut' });
  const sqlSpan = names[1].querySelector('.b'), pgSpan = names[1].querySelector('.a');
  to(plus, tPQ - 0.1, { x: NX + sqlSpan.offsetLeft - (NX + wP + wG + 36), y: -26, autoAlpha: 0, duration: 0.45, ease: 'power2.inOut' });
  node(1996, '定名 PostgreSQL<br>版本号从 6.0 起', T('h8') - 0.5, true, -40);
  goto(1996, T('h8') - 0.5);
  // 就是 POSTGRES 加上 SQL：两段下面各划一道
  const under = (x, w, label, t) => { const bar = h('div', 'abs', A); px(bar, x, NY + 136, w, 6); css(bar, { background: 'var(--navy)' }); const l = capt(A, label, x, NY + 150); css(l, { fontSize: '28px', color: 'var(--navy)', fontWeight: 700 }); fromTo(bar, t, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4 }); show(l, t + 0.1, { y: 8 }); hide(bar, t18 - 0.1, { d: 0.25 }); hide(l, t18 - 0.1, { d: 0.25 }); };
  under(NX, pgSpan.offsetWidth, 'POSTGRES', T('h8b', 'POSTGRES')); under(NX + sqlSpan.offsetLeft, sqlSpan.offsetWidth, 'SQL', T('h8b', 'SQL')); sfx('tick', T('h8b', 'SQL'));
  // 今天：18
  node(2025, 'PostgreSQL 18<br>2025 年 9 月发布', T('h9') - 0.4, true, -250);
  goto(2025, T('h9') - 0.4);
  // 2014：图灵奖，奖章飞到斯通布雷克名下
  node(2014, '图灵奖<br>（2014 年度）', T('h10') - 0.5, false, -50);
  goto(2014, T('h10') - 0.5);
  const medal = fly(A, '2014 年度图灵奖', [X(2014) - 90, Y + 160], [72, 290], T('h10', '授给'), { cls: 'warn', fs: 30, d: 0.9, stay: true });
  sfx('chime', T('h10', '授给') + 1.0, { g: 0.6 });

  // ── B：SQL:2023 的核心部分 177 项；PostgreSQL 至少 170；各家公布的情况 ──
  hdoc(B, 'SQL:2023 的核心部分：177 项必选特性', 72, 128);
  const grid = h('div', 'abs', B); px(grid, 96, 236, 780, 528); grid.dataset.name = '177 个格子';
  const cells = [];
  for (let i = 0; i < 177; i++) { const c = h('div', 'abs', grid); px(c, (i % 15) * 52, Math.floor(i / 15) * 44, 46, 38); css(c, { border: '2.5px solid var(--pg)', background: '#fff' }); cells.push(c); }
  const tg = T('h12', '核心') - 0.2, tg1 = Tend('h12') - 0.3;
  cells.forEach((c, i) => show(c, tg + (tg1 - tg) * Math.floor(i / 15) / 12 + (i % 15) * 0.01, { s: 0.6, d: 0.2 }));
  sfx('tick', tg, { g: 0.5 });
  // 170 格依次涂满，计数跟着走
  const tf = T('h13') + 0.1, dur = Math.max(1.2, T('h13', '170') + 0.3 - tf);
  cells.forEach((c, i) => { if (i < 170) set(c, tf + dur * i / 170, { background: 'var(--pg)' }); });
  const cnt = h('div', 'big', B, ''); px(cnt, 960, 236); css(cnt, { fontSize: '96px' });
  const t177 = T('h12', '177') + 0.3;
  F((t) => { const k = clamp((t - tf) / dur); cnt.innerHTML = t < t177 ? '' : t < tf ? '0<span style="font-size:48px;color:var(--ink2)"> / 177</span>' : `${Math.round(k * 170)}<span style="font-size:48px;color:var(--ink2)"> / 177</span>`; });
  sfx('whoosh', tf, { g: 0.3 }); sfx('thud', tf + dur, { g: 0.6 });
  const cntL = capt(B, 'PostgreSQL 18 至少符合的项数', 966, 372); show(cntL, tf + dur, { y: 10 });
  // 没涂的 7 格：没有哪个数据库声称全部符合
  cells.forEach((c, i) => { if (i >= 170) set(c, T('h15') + 0.1, { borderColor: 'var(--warn)', borderStyle: 'dashed', background: 'var(--warn-lt)' }); });
  // 各家公布的符合情况（FACTS H10；口径不同，不排名次）
  const cmpT = capt(B, '<b>各家手册里怎样写标准符合情况</b>', 960, 452); css(cmpT, { fontSize: '28px', color: 'var(--ink)' });
  const cmp = tableDoc(B, ['数据库', '公布的情况'], [
    ['<b style="color:var(--pg)">PostgreSQL 18</b>', '按 <b>SQL:2023</b> 逐项列出：177 项里至少 170'],
    ['Oracle 23ai', '按 SQL:2011 逐项列出，有写明不支持的项'],
    ['SQL Server', '官方文档只覆盖到 2012 版'],
    ['MySQL 8.4', '只有总体说明，没有逐项清单'],
  ], 960, 500, { hl: [0] });
  css(cmp, { fontSize: '24px' });
  show(cmpT, T('h15') + 0.3, { y: 10 });
  [...cmp.querySelectorAll('tr')].forEach((r, i) => show(r, T('h15') + 0.4 + i * 0.3, { x: 20, y: 0, d: 0.35 }));
  sfx('tick', T('h15') + 0.5, { g: 0.4 });
  const srcB = capt(B, '出处：各家手册（PostgreSQL《SQL Conformance》、Oracle《Compliance to Core SQL》、MS-TSQLISO02、MySQL §1.7）', 96, 900, 'src'); show(srcB, T('h15') + 1.6);

  // ── C：事务里的 DDL 能回滚；约束由数据库把关。左边敲命令，右边是数据库里的表 ──
  hdoc(C, '结构改动也能回滚，约束由数据库把关', 72, 128);
  const O = D.orthodox, er = O['2_constraints'];
  const tc = term(C, 72, 200, 900, 10, { fs: 22, lh: 36, name: 'psql 会话' });
  // 右边：users 表（3 列），在事务里会多出 email 列和 orders 表
  const sch = h('div', 'abs', C); px(sch, 1040, 200, 808, 720); sch.dataset.name = '数据库里的表';
  const tbl = (x, y, name, cols, o = {}) => {
    const b = h('div', 'abs', sch); px(b, x, y, 370); css(b, { border: `3px ${o.dashed ? 'dashed' : 'solid'} var(--pg)`, background: '#fff' });
    const hd = h('div', '', b, name); css(hd, { background: o.dashed ? 'var(--sky-lt)' : 'var(--pg)', color: o.dashed ? 'var(--navy)' : '#fff', font: '700 32px var(--mono)', padding: '10px 18px' });
    const rows = cols.map((c) => { const r = h('div', '', b, c); css(r, { font: '500 30px var(--mono)', padding: '10px 18px', borderTop: '1.5px solid var(--line)', color: 'var(--ink)' }); return r; });
    return { b, hd, rows };
  };
  const users = tbl(30, 150, 'users', ['id', 'name', 'age']);
  show(users.b, T('h16') - 0.6, { y: 12 });
  const email = h('div', '', users.b, 'email'); css(email, { font: '500 30px var(--mono)', padding: '10px 18px', borderTop: '1.5px dashed var(--pg)', background: 'var(--sky-lt)', color: 'var(--navy)' });
  const orders = tbl(430, 150, 'orders', ['id', 'user_id', 'total'], { dashed: true });
  set(email, 0, { autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0 }); set(orders.b, 0, { autoAlpha: 0 });
  const txf = h('div', 'abs', sch); px(txf, 0, 110, 808, 380); css(txf, { border: '3px dashed var(--navy)' }); txf.dataset.name = '事务';
  const txl = tagEl(sch, '事务里', 0, 86, 'navy'); css(txl, { fontSize: '24px' });
  // BEGIN → CREATE TABLE → ALTER TABLE
  const P1 = 'postgres=*#';
  let e = tc.type(T('h16') - 0.4, '<span class="k">BEGIN</span>;', 'postgres=#', 40);
  wipe(txf, e, { dir: 'l', d: 0.35 }); show(txl, e, { y: 6 });
  e = tc.type(Math.max(e + 0.1, T('h16', '建表') - 0.3), '<span class="k">CREATE TABLE</span> orders (…);', P1, 48);
  tl.fromTo(orders.b, { autoAlpha: 0, scale: 0.6, transformOrigin: '0 0' }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)', immediateRender: false }, e); sfx('pop', e, { g: 0.5 });
  e = tc.type(Math.max(e + 0.1, T('h16', '加列') - 0.3), '<span class="k">ALTER TABLE</span> users <span class="k">ADD</span> email text;', P1, 48);
  tl.to(email, { autoAlpha: 1, height: 'auto', paddingTop: 10, paddingBottom: 10, duration: 0.4, ease: 'power2.out' }, e); sfx('pop', e, { g: 0.5, p: 0.3 });
  const in4 = tc.print(e + 0.5, `<span class="d">-- 事务里：users 有 ${O['1_ddl_rollback'].columns_inside_tx} 列，orders 已建好</span>`);
  // ROLLBACK：新列、新表一起褪掉，事务框收走
  e = tc.type(T('h17', '回滚') - 0.3, '<span class="k">ROLLBACK</span>;', P1, 40);
  tl.to(email, { autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.5, ease: 'power2.in' }, e + 0.1);
  tl.to(orders.b, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: 'power2.in' }, e + 0.1); sfx('whoosh', e + 0.1, { g: 0.4 });
  wipeOut(txf, e + 0.5, { dir: 'r', d: 0.35 }); hide(txl, e + 0.5, { d: 0.3 });
  tc.print(e + 0.7, `<span class="ok">-- 回滚后：users 回到 ${O['1_ddl_rollback'].columns_after} 列，orders 不存在</span>`);
  // 约束：年龄 0–150 的检查约束、指向 users 的外键，都挂在表上
  const tK = T('h18');
  tc.clear(tK - 0.2);
  const badge = (row, txt) => { const b = tagEl(row, txt, 150, 10, 'navy'); css(b, { fontSize: '22px', position: 'absolute', padding: '2px 10px' }); row.style.position = 'relative'; return b; };
  const bAge = badge(users.rows[2], 'CHECK 0–150'), bId = badge(users.rows[0], '主键');
  slam(bAge, tK + 0.3, { from: 1.3 }); slam(bId, tK + 0.6, { from: 1.3 }); sfx('tick', tK + 0.3); sfx('tick', tK + 0.6, { p: 0.3 });
  // 200 岁的一行：送到表前，被检查约束弹回
  let t1 = T('h19', '年龄') - 0.6;
  e = tc.type(t1, `<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (5001, 'Judy', 200);`, 'postgres=#', 60);
  const r1 = fly(C, '5001 · Judy · 200', [1060, 900], [1060, 580], e, { cls: 'grey', fs: 26, d: 0.5, stay: true });
  tl.to(r1, { y: '+=110', backgroundColor: '#b8442f', duration: 0.35, ease: 'power2.out' }, e + 0.7); sfx('error', e + 0.7, { g: 0.6 });
  tl.to(r1, { autoAlpha: 0, duration: 0.3 }, e + 1.5);
  tc.print(e + 0.7, `<span class="er">ERROR:  new row … violates check constraint "age_range"</span>`);
  const n1 = tagEl(C, '年龄 200 不在 0–150：拒绝', 1370, 700, 'warn'); css(n1, { fontSize: '26px' }); show(n1, e + 0.8, { y: 8 });
  // 用户 9999 的订单：去 users 里找这个用户，找不到，弹回
  e = tc.type(Math.max(e + 1.0, T('h19', '用户') - 0.4), `<span class="k">INSERT INTO</span> orders <span class="k">VALUES</span> (1, 9999, 9.90);`, 'postgres=#', 60);
  const r2 = fly(C, '订单 · 用户 9999', [1060, 900], [1060, 580], e, { cls: 'grey', fs: 26, d: 0.5, stay: true });
  tl.to(r2, { y: '+=110', backgroundColor: '#b8442f', duration: 0.35, ease: 'power2.out' }, e + 0.7); sfx('error', e + 0.7, { g: 0.6 });
  tc.print(e + 0.7, `<span class="er">ERROR:  … violates foreign key constraint</span>`);
  tc.print(e + 0.8, `<span class="er">DETAIL:  ${esc(er.foreign_key.detail)}</span>`);
  const n2 = tagEl(C, '用户 9999 不存在：拒绝', 1370, 770, 'warn'); css(n2, { fontSize: '26px' }); show(n2, e + 0.8, { y: 8 });
});
