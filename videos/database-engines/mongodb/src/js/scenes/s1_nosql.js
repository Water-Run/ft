// 第 01 章 NoSQL：底部一条常驻的时间轴（2000 年代末 → 2007 → 2009.6 → 2009.8），上面依次是
// 定死的表装不下各长各样的记录、两种扩展 → DoubleClick 与 10gen → 旧金山的聚会、第一个版本 → NoSQL 的两种读法与共同点 → 四类，MongoDB 是文档数据库。
// 事实：V01 V02 V03 V04 N01 A12。数字、日期只用 FACTS 里有的；时间轴不按比例，刻度上写明日期。
scene('nosql', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '01 NoSQL');
  const TY = 870;   // 时间轴

  // ── 时间轴 ──
  const axis = h('div', 'abs', world); px(axis, 140, TY, 1640, 3); css(axis, { background: '#C1C7C6', transformOrigin: '0 50%' });
  fromTo(axis, c0, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' });
  const ticks = [[360, '2000 年代末', 'n3'], [820, '2007', 'n13'], [1300, '2009.6', 'n15'], [1640, '2009.8', 'n19']].map(([x, t, id]) => {
    const d = h('div', 'abs', world); px(d, x - 9, TY - 8, 18, 18); css(d, { borderRadius: '50%', background: '#fff', border: '3px solid #00684A' });
    const l = label(world, x - 80, TY + 22, t, 'lab'); css(l, { width: '160px', textAlign: 'center', font: '600 24px "Mono"', color: '#00684A' });
    show([d, l], T(id) + 0.1, { y: 8 });
    d._l = l; return d;
  });
  const head = h('div', 'abs', world); px(head, 347, TY - 12, 26, 26); css(head, { borderRadius: '50%', background: '#00ED64', border: '3px solid #00684A' });
  show(head, T('n3') + 0.3, { y: 0, s: 0.5 });
  [[807, 'n13'], [1287, 'n15'], [1627, 'n19']].reduce((px0, [x, id]) => { tl.fromTo(head, { left: px0 + 'px' }, { left: x + 'px', duration: 0.9, ease: 'power2.inOut', immediateRender: false }, T(id) - 0.2); return x; }, 347);
  ticks.forEach((d, i) => to(d, T(['n3', 'n13', 'n15', 'n19'][i]) + 0.4, { backgroundColor: '#00684A', duration: 0.3 }));

  // ── 一、2000 年代末：定死的表，装不下各长各样的记录（V03、A12） ──
  const tb = h('div', 'panel', world); px(tb, 140, 150, 640, 470);
  const tbt = label(tb, 28, 22, 'users（事先定好的表）', 'lab'); css(tbt, { font: '700 30px "Inter", "Sans SC"', color: '#001E2B' });
  const ddl = code(tb, 28, 76, 'CREATE TABLE users (name, age)'); css(ddl, { fontSize: '24px' });
  const grid = h('div', 'abs', tb); css(grid, { left: '28px', top: '150px', width: '584px', height: '290px' });
  const cell = (c, r, txt = '') => { const e = h('div', 'abs', grid, txt); css(e, { left: c * 292 + 'px', top: r * 58 + 'px', width: '292px', height: '58px', border: '1.5px solid #C1C7C6', background: r === 0 ? '#F9FBFA' : '#fff', font: (r === 0 ? '700' : '500') + ' 26px/56px "Mono"', paddingLeft: '18px', color: '#001E2B' }); return e; };
  cell(0, 0, 'name'); cell(1, 0, 'age'); for (let r = 1; r < 5; r++) { cell(0, r); cell(1, r); }
  show(tb, c0, { y: 16 });
  const vend = callout(world, 940, 500, 'note', 'mongodb.com「What is NoSQL?」', '这是 MongoDB 自己的说法');
  show(vend, T('n3', '说法') - 0.2, { x: 20, y: 0 }); fadeOut(vend, T('n5') - 0.2);
  const hdrRow = h('div', 'abs', tb); px(hdrRow, 28, 150, 584, 58); css(hdrRow, { background: '#00ED64', borderRadius: '4px', opacity: 0 });
  fromTo(hdrRow, T('n3') + 1.3, { opacity: 0 }, { opacity: 0.55, duration: 0.4 }); to(hdrRow, T('n4') + 0.6, { opacity: 0, duration: 0.6 });
  // 越来越多、越来越杂的记录从右边涌进来
  const recs = [['Alice', '{ name, age }'], ['Erin', '{ name, email, tags }'], ['Frank', '{ name, address }'], ['…', '{ name, phone, avatar }'], ['…', '{ name, age, city }'], ['…', '{ name, tags, likes }']];
  const RX = 940;
  const recE = recs.map(([n, f], i) => { const e = code(world, RX + (i % 2) * 420, 180 + Math.floor(i / 2) * 92, `<b>${n}</b>  ${f}`); css(e, { fontSize: '26px' }); return e; });
  recE.forEach((e, i) => show(e, T('n4', '数据') + i * 0.28, { x: 40, y: 0, d: 0.45 }));
  // n5：Alice 正好放进去；Erin 的 email、tags 没有列
  to(recE[0], T('n5', '年龄') - 0.2, { x: -RX + 180, y: 32, autoAlpha: 0, duration: 0.7, ease: 'power2.in' });
  const aliceRow = [cell(0, 1, 'Alice'), cell(1, 1, '42')]; show(aliceRow, T('n5', '年龄') + 0.4, { y: 0, d: 0.3 });
  glow(recE[1], T('n5', '邮箱') - 0.2, null, { bg: '#FFEAE5', bd: '#DB3030' });
  glow(recE[2], T('n6') + 0.2, null, { bg: '#FFEAE5', bd: '#DB3030' });
  const noCol = callout(world, RX, 480, 'warn', 'email、tags、address 都没有对应的列', '装不下');
  show(noCol, T('n6') + 0.1, { y: 10 });
  fadeOut([recE[3], recE[4], recE[5]], T('n6') + 0.1);
  // n7–n8：两种扩展（V03）
  const t7 = T('n7');
  fadeOut([recE[0], recE[1], recE[2]], t7 - 0.1); fadeOut(noCol, T('n7', '多加几台') + 0.6);
  const so = label(world, RX, 170, '横向扩展：多加几台机器，把数据分散开', 'lab'); css(so, { font: '600 28px "Inter", "Sans SC"', color: '#00684A' });
  const srv = [0, 1, 2, 3, 4].map((i) => { const e = h('div', 'abs', world); px(e, RX + i * 150, 230, 120, 150); css(e, { background: '#E3FCF7', border: '2px solid #00A35C', borderRadius: '10px' });
    for (let k = 0; k < 3; k++) { const d = h('div', 'abs', e); css(d, { left: '18px', top: 24 + k * 40 + 'px', width: '80px', height: '14px', background: '#00A35C', borderRadius: '3px', opacity: 0.55 }); } return e; });
  show(so, T('n7', '多加几台') - 0.3, { y: 8 });
  srv.forEach((e, i) => show(e, T('n7', '多加几台') + i * 0.2, { y: 20, d: 0.4 }));
  const su = label(world, RX, 440, '纵向扩展：把一台机器换得更强', 'lab'); css(su, { font: '600 28px "Inter", "Sans SC"', color: '#3D4F58' });
  const big1 = h('div', 'abs', world); px(big1, RX + 560, 470, 120, 150); css(big1, { background: '#F9FBFA', border: '2px solid #5C6C75', borderRadius: '10px', transformOrigin: '50% 100%' });
  show(su, T('n8') - 0.1, { y: 8 }); show(big1, T('n8'), { y: 10 });
  fromTo(big1, T('n8', '更强') - 0.2, { width: 120, height: 150, y: 0 }, { width: 240, height: 200, y: -50, duration: 0.9, ease: 'power2.inOut', immediateRender: false });
  const relN = chip(world, RX, 510, '关系数据库主要靠这一种', 'dk'); show(relN, T('n8', '关系数据库') + 0.2, { y: 8 });
  figs(world, 140, 660, 1640, [[T('n4') + 0.5, '图 1-1', '数据越来越多，样子越来越杂，事先定死的表很难装下', '出处：mongodb.com「What is NoSQL?」'],
    [T('n7') + 0.4, '图 1-2', '两种扩展：横向（scale out）与纵向（scale up）', '出处：mongodb.com「What is NoSQL?」']], T('n9') - 0.3);
  const secA = [tb, so, ...srv, su, big1, relN];
  hide(secA, T('n9') - 0.35, { y: -16, d: 0.45, stagger: 0.02 });

  // ── 二、DoubleClick → 10gen（V01） ──
  const dc = h('div', 'panel', world); px(dc, 140, 150, 820, 470);
  const dct = h('div', 'abs', dc, 'DoubleClick'); css(dct, { left: '36px', top: '30px', font: '700 54px "Inter"', color: '#001E2B' });
  const dcs = h('div', 'abs', dc, '网络广告公司 · 三位创始人的老东家'); css(dcs, { left: '36px', top: '108px', font: '500 28px "Inter", "Sans SC"', color: '#5C6C75' });
  const ppl = [0, 1, 2].map((i) => { const e = h('div', 'abs', dc); css(e, { left: 36 + i * 76 + 'px', top: '170px', width: '60px', height: '60px', borderRadius: '50%', background: '#001E2B' }); return e; });
  const ppn = h('div', 'abs', dc, 'Dwight Merriman · Eliot Horowitz · Kevin Ryan'); css(ppn, { left: '280px', top: '182px', font: '500 24px "Inter"', color: '#3D4F58' });
  const cnt = h('div', 'abs', dc, '0'); css(cnt, { left: '36px', top: '262px', font: '700 104px "Inter"', color: '#00684A' });
  const cntU = h('div', 'abs', dc, '条广告 / 秒，还要再多'); css(cntU, { left: '40px', top: '392px', font: '600 30px "Inter", "Sans SC"', color: '#001E2B' });
  show(dc, T('n9'), { y: 16 }); show([dct, dcs], T('n9', 'DoubleClick') - 0.4, { y: 10, stagger: 0.1 }); show(ppl, T('n9') + 0.2, { y: 10, stagger: 0.12 }); show(ppn, T('n9') + 0.6, { y: 0 });
  show([cnt, cntU], T('n11') - 0.1, { y: 8 }); countTo(cnt, 0, 400000, T('n11'), 1.6, (v) => Math.round(v).toLocaleString('en-US') + (v >= 399999 ? '+' : ''));
  const quote = callout(world, 1020, 170, 'note', '“quickly learned the limitations of<br>relational databases when scaling …”<br><span style="font:500 22px Mono;color:#5C6C75">mongodb.com/company</span>', '他们自己的说法');
  css(quote, { whiteSpace: 'nowrap' });
  show(quote, T('n12') - 0.1, { x: 30, y: 0 });
  const gen = h('div', 'panel', world); px(gen, 1020, 440, 520, 180); css(gen, { borderColor: '#00A35C', borderWidth: '2px' });
  const gt = h('div', 'abs', gen, '10gen'); css(gt, { left: '30px', top: '24px', font: '700 60px "Inter"', color: '#00684A' });
  const gs = h('div', 'abs', gen, '2007 年创立 · 即后来的 MongoDB 公司'); css(gs, { left: '32px', top: '112px', font: '500 26px "Inter", "Sans SC"', color: '#3D4F58' });
  show(gen, T('n13') - 0.1, { x: 40, y: 0 }); sfx('pop', T('n13'));
  const ar = link(ov, [[960, 540], [1010, 540]], 'accent', { arrow: true, w: 3 }); arrowIn(ar, T('n13') + 0.1, 0.4);
  figs(world, 140, 660, 1640, [[T('n9') + 0.6, '图 1-3', '创始人在 DoubleClick 遇到的扩展问题', '出处：mongodb.com/company']], T('n15') - 0.3);
  hide([dc, quote, gen, ar], T('n15') + 0.1, { y: -16, d: 0.45 });

  // ── 三、2009 年 6 月，旧金山的聚会；8 月，第一个版本（V04、V02） ──
  const mt = h('div', 'panel', world); px(mt, 140, 150, 1000, 470);
  const mtt = h('div', 'abs', mt, '2009 年 6 月 11 日 · 旧金山'); css(mtt, { left: '36px', top: '28px', font: '700 40px "Inter", "Sans SC"', color: '#001E2B' });
  const mts = h('div', 'abs', mt, '一场介绍新数据库的非正式聚会（Johan Oskarsson 组织）'); css(mts, { left: '38px', top: '88px', font: '500 26px "Inter", "Sans SC"', color: '#5C6C75' });
  const projs = ['Voldemort', 'Cassandra', 'Dynomite', 'HBase', 'Hypertable', 'CouchDB', 'MongoDB'];
  const pc = projs.map((p, i) => { const e = chip(mt, 38 + (i % 4) * 236, 170 + Math.floor(i / 4) * 80, p, ''); css(e, { font: '600 28px "Inter"', padding: '10px 22px' }); return e; });
  show(mt, T('n15') + 0.45, { y: 16 }); pc.forEach((e, i) => show(e, T('n15', '聚会') - 0.3 + i * 0.1, { y: 10, d: 0.35 }));
  [['Cassandra', 1], ['HBase', 3], ['CouchDB', 5], ['MongoDB', 6]].forEach(([w, i]) => glow(pc[i], T('n16', w) - 0.15, null, i === 6 ? { bg: '#00ED64', bd: '#00ED64', c: '#023430' } : { bg: '#E3FCF7', bd: '#00A35C', c: '#00684A' }));
  const nameT = h('div', 'abs', mt, 'NoSQL'); css(nameT, { left: '38px', top: '340px', font: '800 96px "Inter"', color: '#00684A' });
  const nameS = h('div', 'abs', mt, '这一批新数据库，从此有了一个统称'); css(nameS, { left: '360px', top: '378px', font: '500 28px "Inter", "Sans SC"', color: '#3D4F58' });
  show(nameT, T('n18') - 0.1, { y: 20 }); show(nameS, T('n18', '传开') - 0.4, { x: -20, y: 0 });
  const rel = h('div', 'panel', world); px(rel, 1200, 150, 580, 300); css(rel, { borderColor: '#00A35C', borderWidth: '2px' });
  const rt = h('div', 'abs', rel, '2009 年 8 月'); css(rt, { left: '30px', top: '28px', font: '700 40px "Inter", "Sans SC"', color: '#00684A' });
  const rs = h('div', 'abs', rel, 'MongoDB 第一个版本发布'); css(rs, { left: '30px', top: '92px', font: '600 32px "Inter", "Sans SC"', color: '#001E2B' });
  const rc = h('div', 'abs', rel, '“The first version of the MongoDB<br>database shipped in August 2009.”'); css(rc, { left: '30px', top: '160px', font: '500 24px/1.5 "Inter"', color: '#5C6C75', whiteSpace: 'nowrap' });
  show(rel, T('n19') - 0.1, { x: 40, y: 0 }); show(rc, T('n19') + 0.2, { y: 8 });
  figs(world, 140, 660, 1640, [[T('n15') + 0.6, '图 1-4', '「NoSQL」这个名字从这场聚会传开', '出处：Martin Fowler「NosqlDefinition」 · mongodb.com 版本史']], T('n21') - 0.3);
  hide([mt, rel, axis, head, ...ticks, ...ticks.map((d) => d._l)], T('n21') - 0.35, { y: 0, d: 0.45 });

  // ── 四、NoSQL 这个名字：两种读法、共同点、非关系型（N01、V04） ──
  const word = h('div', 'abs', world); px(word, 140, 130, 1640); css(word, { font: '800 170px/1.15 "Inter"', color: '#001E2B', textAlign: 'center' });
  const wNo = h('span', '', word, 'No'); css(wNo, { color: '#00684A' }); const wNot = h('span', '', word, ''); h('span', '', word, 'SQL');
  show(word, T('n21'), { y: 20 });
  const bNo = box(wNo, world); const noBar = h('div', 'abs', world); px(noBar, bNo.x - 10, bNo.y + 10, 0, bNo.h - 20); css(noBar, { background: '#00ED64', borderRadius: '14px', zIndex: -1 }); css(word, { zIndex: 1 });
  fromTo(noBar, T('n21', '两种读法') - 0.3, { width: 0 }, { width: bNo.w + 20, duration: 0.6, ease: 'power2.out' }); hide(noBar, T('n23', 'Not only') - 0.3, { y: 0, d: 0.25 });
  const r1 = h('div', 'panel', world); px(r1, 260, 380, 640, 120);
  r1.innerHTML = '<div style="position:absolute;left:30px;top:22px;font:800 52px Inter;color:#00684A">No</div><div style="position:absolute;left:150px;top:30px;font:600 34px Inter,\'Sans SC\';color:#001E2B">= 不用 SQL<span style="font:500 26px Mono;color:#5C6C75;margin-left:16px">non-SQL</span></div>';
  const r2 = h('div', 'panel', world); px(r2, 1020, 380, 640, 120);
  r2.innerHTML = '<div style="position:absolute;left:30px;top:22px;font:800 52px Inter;color:#00684A">Not only</div><div style="position:absolute;left:300px;top:30px;font:600 34px Inter,\'Sans SC\';color:#001E2B">= 不只用 SQL</div>';
  show(r1, T('n22', '不用') - 0.3, { y: 12 }); show(r2, T('n23', 'Not only') - 0.2, { y: 12 });
  // 读到 Not only 时，大字里的 No 原地补成 Not only，读完再收回
  keyed(wNot).at(T('n23', 'Not only') - 0.1, { html: 't only ' }).at(T('n24') - 0.1, { html: '' });
  hide([r1, r2], T('n24') - 0.2, { y: -10, d: 0.4 });
  // 共同点：一节里出现过的三样东西缩成三张卡（没有一条是定义性的）
  const traits = [['不用关系表和 SQL', 'tbl'], ['记录随时加字段', 'rec'], ['为一大群机器设计', 'srv']].map(([t, k], i) => {
    const e = h('div', 'panel', world); px(e, 140 + i * 556, 400, 528, 220);
    const g = h('div', 'abs', e); css(g, { left: '30px', top: '30px', width: '140px', height: '110px' });
    if (k === 'tbl') { for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) { const q = h('div', 'abs', g); css(q, { left: c * 66 + 'px', top: r * 34 + 'px', width: '64px', height: '32px', border: '1.5px solid #C1C7C6', background: r ? '#fff' : '#F9FBFA' }); } const x = h('div', 'abs', g); css(x, { left: '-6px', top: '50px', width: '150px', height: '4px', background: '#DB3030', transform: 'rotate(-24deg)' }); }
    if (k === 'rec') ['{ a, b }', '{ a, c, d }', '{ e }'].forEach((t2, j) => { const q = h('div', 'abs', g, t2); css(q, { left: j * 8 + 'px', top: j * 36 + 'px', font: '500 22px Mono', color: '#001E2B', background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '5px', padding: '0 8px' }); });
    if (k === 'srv') for (let j = 0; j < 4; j++) { const q = h('div', 'abs', g); css(q, { left: j * 36 + 'px', top: '20px', width: '30px', height: '70px', background: '#E3FCF7', border: '2px solid #00A35C', borderRadius: '6px' }); }
    const tt = h('div', 'abs', e, t); css(tt, { left: '30px', top: '160px', font: '700 32px "Inter", "Sans SC"', color: '#001E2B' });
    return e;
  });
  show(traits[0], T('n24', '关系表') - 0.4, { y: 16 }); show(traits[1], T('n25', '加字段') - 0.4, { y: 16 }); show(traits[2], T('n25', '机器') - 0.4, { y: 16 });
  [[0, T('n24', '关系表')], [1, T('n25', '加字段')], [2, T('n25', '机器')]].forEach(([i, t]) => glow(traits[i], t - 0.1, t + 1.3, { bg: '#C0FAE6', bd: '#00A35C', rb: '#FFFFFF', rd: '#E8EDEB' }));
  const fig5 = figs(world, 140, 650, 1640, [[T('n24') + 0.3, '图 1-5', '这批数据库常见的共同点，没有一条是定义性的', '出处：Martin Fowler「NosqlDefinition」']], T('n28') - 0.3);
  const nonRel = gloss(callout(world, 140, 720, 'note', '不按关系表（行与列）存数据', '非关系型数据库'), '非关系型数据库');
  show(nonRel, T('n27', '非关系型') - 0.3, { y: 10 });
  hide([...traits, nonRel], T('n28', '文档') - 0.5, { y: -12, d: 0.35 });

  // ── 五、四类：文档、键值、宽列、图（N01） ──
  const kinds = [['文档', 'doc'], ['键值', 'kv'], ['宽列', 'wc'], ['图', 'gr']].map(([t, k], i) => {
    const e = h('div', 'panel', world); px(e, 140 + i * 417, 400, 390, 400);
    const tt = h('div', 'abs', e, t); css(tt, { left: '30px', top: '24px', font: '500 50px "Serif SC"', color: '#001E2B' });
    const g = h('div', 'abs', e); css(g, { left: '30px', top: '120px', width: '330px', height: '170px' });
    if (k === 'doc') { const q = h('div', 'abs mono', g, '{\n  <span class="k">name</span>: …,\n  <span class="k">tags</span>: […]\n}'); css(q, { font: '500 26px/40px Mono', color: '#001E2B' }); e._g = q; }
    if (k === 'kv') ['k1 → v1', 'k2 → v2', 'k3 → v3'].forEach((t2, j) => { const q = h('div', 'abs', g, t2); css(q, { top: j * 50 + 'px', font: '500 28px Mono', color: '#001E2B', background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '6px', padding: '2px 12px' }); });
    if (k === 'wc') for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { if ((r + c) % 3 === 2) continue; const q = h('div', 'abs', g); css(q, { left: c * 62 + 'px', top: r * 52 + 'px', width: '56px', height: '44px', background: c < 2 ? '#E3FCF7' : '#F9FBFA', border: '1.5px solid #C1C7C6', borderRadius: '4px' }); }
    if (k === 'gr') { const P2 = [[30, 30], [220, 10], [130, 120], [290, 140], [20, 150]]; const sv = svg('svg', { width: 330, height: 180, style: 'position:absolute;left:0;top:0' }, g); [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [1, 3]].forEach(([a, b]) => svg('line', { x1: P2[a][0] + 14, y1: P2[a][1] + 14, x2: P2[b][0] + 14, y2: P2[b][1] + 14, stroke: '#889397', 'stroke-width': 2.5 }, sv)); P2.forEach(([x, y]) => svg('circle', { cx: x + 14, cy: y + 14, r: 14, fill: '#fff', stroke: '#00684A', 'stroke-width': 3 }, sv)); }
    return e;
  });
  const kw = ['文档', '键值', '宽列', '图'];
  kinds.forEach((e, i) => show(e, T('n28', kw[i]) - 0.35, { y: 20, d: 0.5 }));
  const kvTag = chip(kinds[1], 30, 320, '系列的最后一集', 'blue'); show(kvTag, T('n29', '最后') - 0.3, { y: 8 });
  glow(kinds[1], T('n29') - 0.1, T('n30') - 0.1, { bg: '#C3E7FE', bd: '#016BF8', rd: '#E8EDEB' });
  const mTag = chip(kinds[0], 30, 320, 'MongoDB', 'dk'); show(mTag, T('n30', 'MongoDB') - 0.2, { y: 8 });
  glow(kinds[0], T('n30') - 0.1, null, { bg: '#C0FAE6', bd: '#00A35C', rd: '#E8EDEB' });
  glow(kinds[0], T('n31', '文档') - 0.3, null, { bg: '#00ED64', bd: '#00ED64' });
  // n31：开头 Alice 那份资料，就是一份文档
  const ad = code(world, 162, 504, ['{', '  <span class="k">name</span>: <span class="s">"Alice"</span>,', '  <span class="k">age</span>: <span class="n">42</span>', '}'].join('\n')); css(ad, { font: '500 28px/42px Mono', whiteSpace: 'pre', background: '#fff', borderColor: '#00A35C', padding: '8px 16px' });
  show(ad, T('n31', 'Alice') - 0.3, { y: 16 });
  to(kinds[0]._g, T('n31', 'Alice') + 0.2, { autoAlpha: 0, duration: 0.4 });
  const docG = gloss(callout(world, 560, 830, 'tip', '字段与值组成的一条记录', '文档'), '文档');
  show(docG, T('n31', 'Alice') + 0.3, { y: 10 });
  figs(world, 140, 830, 1640, [[T('n28') + 0.4, '图 1-6', 'NoSQL 常见的四类', '出处：mongodb.com「What is NoSQL?」']], T('n31', 'Alice') - 0.4);

  const a = drift(s.start, s.end, 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
