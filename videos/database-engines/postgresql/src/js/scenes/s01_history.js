// 01 学院出身：年代线（H1–H6）→ SQL 标准 177 项至少 170（H7、H10）→ 事务里的 DDL 回滚与约束（H8、H9）
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('h10') + 0.5, tC = Tend('h15') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);

  // ── A：年代线 ──
  hdoc(A, '从伯克利的研究项目，到今天的 PostgreSQL 18', 72, 128);
  const Y = 560, X = (yr) => 160 + (yr - 1984) * 37;                // 1984–2027 映射到 160–1751
  const line = h('div', 'axis', A); px(line, 120, Y, 1680); css(line, { height: '4px', background: 'var(--pg)' });
  fromTo(line, c0 + 0.1, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' });
  const node = (yr, label, t, up = true, dx = -60) => {
    const dot = h('div', 'abs', A); px(dot, X(yr) - 11, Y - 9, 22, 22); css(dot, { background: '#fff', border: '5px solid var(--pg)', borderRadius: '50%' });
    const y = h('div', 'lbl', A, String(yr)); px(y, X(yr) - 34, up ? Y - 64 : Y + 30); css(y, { fontSize: '30px' });
    const l = h('div', 'cap', A, label); px(l, X(yr) + dx, up ? Y - 130 : Y + 76);
    slam(dot, t, { from: 1.6 }); show(y, t + 0.08, { y: up ? 10 : -10 }); show(l, t + 0.16, { y: up ? 10 : -10 });
    sfx('tick', t, { g: 0.6 });
    return { dot, y, l };
  };
  node(1986, '伯克利开始实现 <b>POSTGRES</b>', T('h1', '伯克利'));
  // 斯通布雷克与 Ingres：Ingres 的注解贴在名字旁边
  const sb = tagEl(A, 'Michael Stonebraker 教授', 120, 222, 'navy'); css(sb, { fontSize: '30px' }); show(sb, T('h2', '斯通布雷克'), { y: -10 });
  const ing = glossBox(A, 'Ingres', '<b>Ingres</b>：斯通布雷克之前<br>在伯克利做的关系数据库', 120, 284, 470);
  css(ing, { background: 'var(--hi)' }); show(ing, T('h2', '之前'), { x: -20 }); sfx('pop', T('h2', '之前'), { g: 0.6 });
  const ingT = tagEl(A, 'Ingres', 620, 300, 'navy'); css(ingT, { fontSize: '36px' }); slam(ingT, T('h2', 'Ingres'), { from: 1.2 }); hide(ingT, T('h4', 'POSTGRES') - 0.15, { d: 0.15 });
  // 拆字：POSTGRES = POST + (IN)GRES
  const nm = h('div', 'abs', A); px(nm, 640, 210, 1100, 140);
  const post = h('div', 'abs', nm, 'POST'); px(post, 0, 0); css(post, { font: '800 110px "Open Sans"', color: 'var(--pg)', letterSpacing: '2px' });
  const inn = h('div', 'abs', nm, '(IN)'); px(inn, 310, 0); css(inn, { font: '800 110px "Open Sans"', color: '#5f6a73' });
  const gres = h('div', 'abs', nm, 'GRES'); px(gres, 560, 0); css(gres, { font: '800 110px "Open Sans"', color: 'var(--pg)', letterSpacing: '2px' });
  const ingLbl = h('div', 'cap', nm, 'Ingres 之后'); px(ingLbl, 320, 136); css(ingLbl, { color: '#5f6a73' });
  const tN = T('h4', 'POSTGRES');
  show(post, tN, { x: -30 }); show(gres, tN + 0.1, { x: 30 });
  show(inn, T('h4', 'Ingres'), { y: -20 }); show(ingLbl, T('h4', 'Ingres') + 0.15, { y: 8 }); sfx('pop', T('h4', 'Ingres'));
  hide(inn, Tend('h4') + 0.5, { y: -20, d: 0.3 }); hide(ingLbl, Tend('h4') + 0.5, { d: 0.3 });
  to(gres, Tend('h4') + 0.6, { x: -250, duration: 0.6, ease: 'power3.inOut' });            // 合回 POSTGRES
  node(1994, 'Andrew Yu、Jolly Chen<br>加上 <b>SQL</b>，改名 Postgres95', T('h6') + 0.3, false, -120);
  const os = tagEl(A, '开源', X(1994) - 30, Y + 182, 'ok'); slam(os, T('h7', '开源'), { from: 1.2 }); sfx('pop', T('h7', '开源'));
  node(1996, '定名 <b>PostgreSQL</b><br>版本号从 6.0 起', T('h8') + 0.3);
  // POSTGRES + SQL → PostgreSQL（在拆字的位置上）
  const tM = Tend('h4') + 1.3;
  const name = h('div', 'abs', nm, 'POSTGRES'); px(name, 0, 0); css(name, { font: '800 110px "Open Sans"', color: 'var(--pg)', letterSpacing: '2px', whiteSpace: 'nowrap' });
  set(name, 0, { opacity: 0 }); set(name, tM, { opacity: 1 }); [post, gres].forEach((e) => hide(e, tM, { d: 0.01 }));
  const kn = keyed(name), nv = (s) => `<span style="color:var(--navy)">${s}</span>`;
  kn.at(T('h6', '改名'), { html: 'Postgres' + nv('95') }); sfx('pop', T('h6', '改名'));
  kn.at(T('h8b', 'SQL'), { html: 'POSTGRES' + nv(' + SQL') }); sfx('pop', T('h8b', 'SQL'));
  kn.at(Tend('h8b') + 0.2, { html: 'PostgreSQL' }); sfx('tick', Tend('h8b') + 0.2);
  kn.at(T('h9', '18'), { html: 'PostgreSQL ' + nv('18') });
  node(2014, '斯通布雷克获<br><b>图灵奖</b>（2014 年度）', T('h10', '图灵奖'), false);
  node(2025, '<b>PostgreSQL 18</b><br>2025 年 9 月发布', T('h9', '18'), true, -230);

  // ── B：SQL 标准 ──
  hdoc(B, 'SQL:2023 的核心部分：177 项必选特性', 72, 128);
  const grid = h('div', 'abs', B); px(grid, 120, 240, 1000, 560); grid.dataset.name = '177 个格子';
  const cells = [];
  for (let i = 0; i < 177; i++) {
    const c = h('div', 'abs', grid); px(c, (i % 15) * 64, Math.floor(i / 15) * 46, 56, 38);
    css(c, { border: '2.5px solid var(--pg)', background: '#fff' });
    cells.push(c);
  }
  const tg = T('h12', '177');
  cells.forEach((c, i) => show(c, tg + (i % 15) * 0.012 + Math.floor(i / 15) * 0.03, { s: 0.6, d: 0.2 }));
  sfx('tick', tg, { g: 0.5 });
  const tf = T('h13', '170');
  cells.forEach((c, i) => { if (i < 170) set(c, tf + i * 0.006, { background: 'var(--pg)' }); });
  sfx('pop', tf + 0.3);
  const n170 = h('div', 'big', B, '170 / 177'); px(n170, 1180, 330); slam(n170, tf + 0.5, { from: 1.15 }); sfx('thud', tf + 0.5);
  const n170c = capt(B, 'PostgreSQL 18 至少符合 170 项', 1190, 480); show(n170c, tf + 0.7, { y: 10 });
  const none = noteBox(B, '<b>还没有哪个数据库</b>声称 177 项全部符合', 1180, 560, 640); show(none, T('h15'), { y: 10 });
  const foot = h('div', 'abs', B); px(foot, 120, 830, 1700);
  foot.innerHTML = '<div class="src" style="position:static;white-space:normal;line-height:1.55;">其他数据库公布的情况：Oracle 23ai 按 SQL:2011 的核心部分逐项说明，写明有不支持的项；SQL Server 的官方文档只覆盖到 2012 版；MySQL 手册没有逐项清单。口径各不相同，不能排名次。</div>';
  show(foot, T('h15') + 0.6, { y: 10 });
  const srcB = capt(B, 'PostgreSQL 18 手册《SQL Conformance》', 120, 905, 'src'); show(srcB, tg + 0.5);

  // ── C：事务里的 DDL、约束 ──
  hdoc(C, '结构改动也能回滚，约束由数据库把关', 72, 128);
  const O = D.orthodox;
  const q1 = psqlBox(C, '', 72, 210, 860); css(q1, { fontSize: '23px', height: '520px' });
  const lines1 = [
    [T('h16'), '<span class="p">postgres=#</span> <span class="k">BEGIN</span>;'],
    [T('h16', '建表'), '<span class="p">postgres=*#</span> <span class="k">CREATE TABLE</span> orders (…);'],
    [T('h16', '加列'), '<span class="p">postgres=*#</span> <span class="k">ALTER TABLE</span> users\n             <span class="k">ADD COLUMN</span> email text;'],
    [Tend('h16') - 0.2, `<span class="d">-- 事务里：users 有 ${O['1_ddl_rollback'].columns_inside_tx} 列</span>`],
    [T('h17', '回滚'), '<span class="p">postgres=*#</span> <span class="k">ROLLBACK</span>;'],
    [T('h17', '没建过') - 0.1, `<span class="ok">-- 回滚后：users 回到 ${O['1_ddl_rollback'].columns_after} 列，orders 不存在</span>`],
  ];
  const k1 = keyed(q1); let acc = '';
  lines1.forEach(([t, ln], i) => { acc += (i ? '\n' : '') + ln; k1.at(t, { html: acc }); sfx('blip', t, { g: 0.4, p: -0.3 }); });
  appear(q1, T('h16') - 0.3);
  const er = O['2_constraints'];
  const q2 = psqlBox(C, '', 980, 210, 868); css(q2, { fontSize: '23px', height: '520px', whiteSpace: 'pre-wrap' });
  const k2 = keyed(q2);
  const e1 = `<span class="p">postgres=#</span> <span class="k">INSERT INTO</span> users\n           <span class="k">VALUES</span> (5001, 'Judy', 200);\n<span class="er">ERROR:  ${esc(er.check.message)}</span>`;
  const e2 = `\n\n<span class="p">postgres=#</span> <span class="k">INSERT INTO</span> orders\n           <span class="k">VALUES</span> (1, 9999, 9.90);\n<span class="er">ERROR:  ${esc(er.foreign_key.message)}</span>`;
  appear(q2, T('h18') - 0.2);
  k2.at(T('h19', '年龄'), { html: e1 }); sfx('error', T('h19', '年龄') + 0.2, { g: 0.6 });
  k2.at(T('h19', '用户'), { html: e1 + e2 }); sfx('error', T('h19', '用户') + 0.2, { g: 0.6 });
  const n1 = noteBox(C, '<b>CHECK</b>　年龄在 0 到 150 之间', 980, 760, 420); show(n1, T('h19', '年龄') + 0.4, { y: 10 });
  const n2 = noteBox(C, '<b>外键</b>　订单必须指向已有的用户', 1420, 760, 428); show(n2, T('h19', '用户') + 0.4, { y: 10 });
});
