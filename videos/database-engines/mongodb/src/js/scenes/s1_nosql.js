// 第 01 章 NoSQL：一条贯穿全章的时间线（y = 870），镜头沿线走五站，一站一屏（1920 一格）。
// 0 关系数据库与 Bigtable；1 2000 年代末：数据又多又杂、一台机器扛不住；2 DoubleClick → 10gen → 一批新数据库；
// 3 2009 年旧金山的聚会、NoSQL 这个名字、更早的同名、MongoDB 第一版；4 名字的两种读法、共同点、非关系型、四类。
// 事实：S09 V06 V03 V01 V04 V02 N01 V05 I04；n5 的三种人取自 A12 的 people 集合（示例）。
scene('nosql', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const Y = 870, X = (k) => k * 1920;

  // 时间线本体：先整条画出来，节点随旁白点亮
  const line = link(ov, [[200, Y], [X(3) + 1800, Y]], 'dim', { w: 3 });
  draw(line, c0, 1.6);
  const tick = (x, txt, t) => {
    const d = h('div', 'abs', world); px(d, x - 11, Y - 11, 22, 22); css(d, { borderRadius: '50%', background: '#00684A' });
    const l = label(world, x - 120, Y + 20, txt); css(l, { width: '240px', textAlign: 'center', font: '700 30px "Mono"', color: '#00684A' });
    show(d, t, { y: 0, s: 0.4 }); show(l, t, { y: 8 }); sfx('blip', t); return d;
  };
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');

  // ── 第 0 站：关系数据库的规矩；2000 年代初的 Bigtable ──
  const tbl = h('div', 'panel', world); px(tbl, 140, 120, 1000, 640);
  const tt = h('div', 'abs', tbl, '关系数据库'); css(tt, { left: '36px', top: '26px', font: '700 48px "Serif SC"', color: '#00684A' });
  ['name', 'age', 'email'].forEach((c, i) => { const hd = h('div', 'abs mono', tbl, c); css(hd, { left: 36 + i * 310 + 'px', top: '112px', width: '300px', height: '64px', lineHeight: '64px', paddingLeft: '16px', boxSizing: 'border-box', background: '#E3FCF7', border: '1.5px solid #C1C7C6', font: '600 30px "Mono"' }); });
  const rows = [];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) { const cell = h('div', 'abs', tbl); css(cell, { left: 36 + i * 310 + 'px', top: 176 + r * 64 + 'px', width: '300px', height: '64px', boxSizing: 'border-box', border: '1.5px solid #E4E8E0', background: '#fff' }); rows.push(cell); }
  const pipe = ['CREATE TABLE', 'INSERT', 'SELECT'].map((t, i) => { const c = xl(tbl, 36 + i * 320, 470, t); css(c, { fontFamily: '"Mono"' }); return c; });
  show(tbl, c0, { y: 20 }); show(rows, T('n1') + 0.2, { stagger: 0.03, y: 6, d: 0.3 });
  show(pipe[0], T('n1', '定好表'), { y: 12 }); show(pipe[1], T('n1', '定好表') + 0.7, { y: 12 }); show(pipe[2], T('n1', '去查'), { y: 12 });
  const relL = label(tbl, 36, 570, '先定表，再按表写、按表查', 't-note'); show(relL, T('n1', '关系数据库'), { y: 8 });
  tick(1500, '2000 年代初', T('n2'));
  const paper = h('div', 'abs', world); px(paper, 1220, 230, 580, 330); css(paper, { background: '#023430', borderRadius: '16px' });
  const pk = h('div', 'abs', paper, 'Google 发表的论文'); css(pk, { left: '36px', top: '34px', font: '600 30px "Sans SC"', color: '#71F6BA' });
  const pt = h('div', 'abs', paper, 'Bigtable'); css(pt, { left: '36px', top: '96px', font: '800 84px "Inter"', color: '#fff' });
  const ps = h('div', 'abs', paper, '一个分布式存储系统'); css(ps, { left: '36px', top: '230px', font: '500 32px "Sans SC"', color: '#C0FAE6' });
  show(paper, T('n2', '论文'), { x: 30, y: 0 }); show(pt, T('n2b') + 0.1, { y: 14 }); show(ps, T('n2b') + 0.5, { y: 8 });

  // ── 第 1 站：2000 年代末，数据又多又杂；一台机器扛不住 ──
  const X1 = X(1);
  tick(X1 + 200, '2000 年代末', T('n3'));
  const say = xl(world, X1 + 140, 96, '按 MongoDB 的说法', 'dk'); show(say, T('n3') + 0.3, { x: -10, y: 0 });
  const era = xl(world, X1 + 520, 96, '到了 2000 年代末', 'on'); show(era, T('n3', '2000 年代末') - 0.3, { x: -10, y: 0 });
  const why = [['存储便宜了', '存储'], ['数据越来越多', '数据'], ['样子越来越杂', '样子']].map(([t, w], i) => { const c = xl(world, X1 + 140 + i * 340, 186, t); show(c, T('n4', w), { y: 12 }); return c; });
  const fix = h('div', 'panel', world); px(fix, X1 + 140, 330, 780, 400);
  const ft = h('div', 'abs', fix, '一张先定好的表'); css(ft, { left: '30px', top: '20px', font: '700 34px "Serif SC"', color: '#061621' });
  ['name', 'age'].forEach((c, i) => { const hd = h('div', 'abs mono', fix, c); css(hd, { left: 30 + i * 360 + 'px', top: '80px', width: '350px', height: '60px', lineHeight: '60px', paddingLeft: '14px', boxSizing: 'border-box', background: '#E3FCF7', border: '1.5px solid #C1C7C6', font: '600 30px "Mono"' }); });
  show(fix, T('n4', '样子') + 0.6, { y: 20 });
  const ppl = [['Alice', '{ name, age }', ['n5', '年龄']], ['Erin', '{ name, email, tags }', ['n5', '邮箱']], ['Frank', '{ name, address }', ['n5b', '地址']]];
  const cards = ppl.map(([n, f, at], i) => {
    const c = h('div', 'abs', world, `<b>${n}</b>　<span class="mono" style="font-size:28px;color:#3D4F58">${f}</span>`);
    px(c, X1 + 1000, 360 + i * 110); css(c, { background: '#fff', border: '3px solid #C1C7C6', borderRadius: '10px', padding: '16px 22px', font: '700 32px "Sans SC"' });
    show(c, T(at[0], at[1]), { x: 40, y: 0 }); return c;
  });
  // 装进表里：Erin 与 Frank 的字段对不上
  cards.forEach((c, i) => to(c, T('n6') + i * 0.2, { x: -830, y: 116 - 34 * i, duration: 0.8, ease: 'power2.inOut' }));
  [cards[1], cards[2]].forEach((c, i) => to(c, T('n6', '很难装') + i * 0.2, { borderColor: '#DB3030', backgroundColor: '#FFE9E7', duration: 0.3 }));
  const bad = xl(world, X1 + 940, 560, '装不下', 'red'); show(bad, T('n6', '很难装') + 0.3, { y: 0, s: 1.3 }); sfx('thud', T('n6', '很难装') + 0.3, { g: 0.5 });
  fadeOut(bad, T('n7'));
  // 横向：多加几台；纵向：一台换更强
  const outL = label(world, X1 + 1020, 360, '横向：多加几台机器', 't-body'); css(outL, { fontWeight: 700 });
  const outs = []; for (let i = 0; i < 5; i++) { const m = h('div', 'abs', world); px(m, X1 + 1020 + i * 120, 420, 90, 130); css(m, { background: '#00ED64', borderRadius: '8px' }); outs.push(m); }
  show(outL, T('n7'), { y: 8 }); show(outs, T('n7', '几台机器'), { y: 30, stagger: 0.15 });
  const upL = label(world, X1 + 1020, 588, '纵向：一台换得更强', 't-body'); css(upL, { fontWeight: 700 });
  const up = h('div', 'abs', world); px(up, X1 + 1020, 680, 130, 160); css(up, { background: '#3D4F58', borderRadius: '8px', transformOrigin: '50% 100%' });
  show([upL, up], T('n8'), { y: 10 }); to(up, T('n8', '更强'), { scaleY: 1.25, scaleX: 1.3, backgroundColor: '#023430', duration: 0.8 });
  const upN = label(world, X1 + 1230, 760, '← 关系数据库主要靠这个', 't-note'); show(upN, T('n8', '关系数据库'), { x: -10, y: 0 });
  // 离开这一站
  to([say, era, ...why, fix, ...cards, outL, ...outs, upL, up, upN], T('n9') - 1.0, { autoAlpha: 0, duration: 0.5 });

  // ── 第 2 站：DoubleClick → 10gen（2007）→ 一批新的数据库 ──
  const X2 = X(2);
  const who = label(world, X2 + 140, 120, '做 MongoDB 的人', 'eyebrow'); show(who, T('n9'), { x: -10, y: 0 });
  const hard0 = xl(world, X2 + 560, 230, '碰上过这样的难处', 'red'); show(hard0, T('n9', '难处') - 0.3, { y: 0, s: 1.2 }); fadeOut(hard0, T('n10') + 0.4);
  const dc = h('div', 'panel', world); px(dc, X2 + 140, 190, 1060, 480);
  const folk = [0, 1, 2].map((i) => { const g = h('div', 'abs', world); px(g, X2 + 190 + i * 110, 230, 90, 130); h('div', 'abs', g).style.cssText = 'left:17px;top:0;width:56px;height:56px;border-radius:50%;background:#023430'; h('div', 'abs', g).style.cssText = 'left:0;top:64px;width:90px;height:66px;border-radius:30px 30px 8px 8px;background:#023430'; return g; });
  show(folk, T('n9') + 0.3, { y: 14, stagger: 0.15 });
  const dct = h('div', 'abs', dc, 'DoubleClick'); css(dct, { left: '420px', top: '40px', font: '800 60px "Inter"', color: '#061621' });
  const dcs = h('div', 'abs t-note', dc, '他们原来所在的广告公司'); css(dcs, { left: '420px', top: '120px' });
  show(dc, T('n10', 'DoubleClick') - 0.2, { y: 16 });
  const dcn = h('div', 'abs num', dc, '0'); css(dcn, { left: '40px', top: '210px', fontSize: '110px', color: '#00684A' });
  const dcu = h('div', 'abs', dc, '条广告 / 秒'); css(dcu, { left: '40px', top: '345px', font: '600 34px "Sans SC"', color: '#3D4F58' });
  const trk = h('div', 'abs', dc); px(trk, 40, 410, 980, 36); css(trk, { background: '#E4E8E0', borderRadius: '18px' });
  const fill = h('div', 'abs', dc); px(fill, 40, 410, 980, 36); css(fill, { background: '#00ED64', borderRadius: '18px', transformOrigin: '0 50%' });
  const t11 = T('n11', '四十多万');
  show([dcn, dcu, trk], T('n11') - 0.1, { y: 8 }); countTo(dcn, 0, 400000, t11, 1.4, (v) => Math.round(v).toLocaleString('en-US') + '+');
  fromTo(fill, t11, { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'none' });
  const hard = tile(world, X2 + 140, 700, 1060, 120, '量一上去，关系数据库就很难扩展', '照他们自己的说法', 'r');
  show(hard, T('n12'), { y: 12 }); to(fill, T('n12', '很难扩展'), { backgroundColor: '#DB3030', duration: 0.4 });
  tick(X2 + 1500, '2007', T('n13'));
  const gen = xl(world, X2 + 1300, 230, '10gen'); css(gen, { font: '800 64px "Inter"', padding: '14px 40px' });
  const genL = label(world, X2 + 1300, 360, '他们办的新公司', 't-note');
  show(gen, T('n13', '10gen'), { y: 0, s: 1.3 }); show(genL, T('n13', '10gen') + 0.3, { y: 8 }); sfx('pop', T('n13', '10gen'));
  const newL = label(world, X2 + 1300, 450, '一批新的数据库', 't-body'); css(newL, { fontWeight: 700 });
  const FAN = [[1300, 520], [1560, 500], [1380, 610], [1640, 600], [1320, 700], [1580, 710]];
  const newdb = FAN.map(([x, y]) => { const b = h('div', 'abs', world); px(b, X2 + 1440, 600, 130, 56); css(b, { background: '#3D4F58', borderRadius: '10px' }); b._to = [x - 1440, y - 600]; return b; });
  show(newL, T('n14', '新的数据库'), { y: 8 }); show(newdb, T('n14', '各走各的路') - 0.15, { y: 0, s: 0.5, stagger: 0.04, d: 0.3 });
  newdb.forEach((b, i) => to(b, T('n14', '各走各的路') + i * 0.06, { x: b._to[0], y: b._to[1], duration: 1.0, ease: 'power2.out' }));
  to([who, dc, ...folk, hard, gen, genL, newL, ...newdb], T('n15') - 1.0, { autoAlpha: 0, duration: 0.5 });

  // ── 第 3 站：2009 年 6 月旧金山的聚会 → NoSQL 这个名字；更早的同名；MongoDB 第一版 ──
  const X3 = X(3);
  tick(X3 + 300, '2009.6', T('n15'));
  const sf = xl(world, X3 + 140, 110, '2009 年 6 月 · 旧金山 · 一场聚会', 'dk'); show(sf, T('n15', '旧金山') - 0.3, { y: 10 });
  const stage = h('div', 'panel', world); px(stage, X3 + 140, 210, 1060, 410); show(stage, T('n15') + 0.3, { y: 16 });
  const PJ = [['Voldemort', null], ['Cassandra', 'Cassandra'], ['Dynomite', null], ['HBase', 'HBase'], ['Hypertable', null], ['CouchDB', 'CouchDB']];
  const proj = PJ.map(([n, w], i) => { const c = xl(world, X3 + 180 + (i % 3) * 340, 250 + Math.floor(i / 3) * 110, n, w ? 'dk' : ''); css(c, { fontFamily: '"Inter"' }); show(c, w ? T('n16', w) : T('n16') + i * 0.1, { y: 14 }); return c; });
  const mdb = xl(world, X3 + 180, 480, 'MongoDB', 'on'); css(mdb, { font: '800 44px "Inter"', padding: '12px 34px' });
  show(mdb, T('n17', 'MongoDB'), { y: 0, s: 1.3 }); sfx('pop', T('n17', 'MongoDB'));
  const nsLab = h('div', 'abs', world, 'NoSQL'); px(nsLab, X3 + 140, 640); css(nsLab, { font: '900 120px "Inter"', color: '#061621' });
  const nsN = label(world, X3 + 560, 700, '这个名字从这场聚会传开', 't-note');
  slam(nsLab, T('n18', 'NoSQL') + 0.1, { from: 1.25 }); show(nsN, T('n18', '传开'), { x: -10, y: 0 }); sfx('thud', T('n18', 'NoSQL') + 0.2);
  const zz = h('div', 'abs', world); px(zz, X3 + 1260, 210, 540, 300); css(zz, { background: '#fff', border: '2px dashed #5C6C75', borderRadius: '12px', whiteSpace: 'normal' });
  const zk = h('div', 'abs', zz, '更早 · 90 年代末'); css(zk, { left: '30px', top: '26px', font: '600 30px "Mono"', color: '#5C6C75' });
  const zb = h('div', 'abs', zz, 'NoSQL 也是一个开源<b>关系</b>数据库的名字，作者 Carlo Strozzi'); css(zb, { left: '30px', top: '90px', width: '480px', font: '500 32px/1.5 "Sans SC"', color: '#061621' });
  show(zz, T('n18b', '90'), { x: 30, y: 0 }); show(zb, T('n18c'), { y: 8 });
  tick(X3 + 1500, '2009.8', T('n19'));
  const v1 = xl(world, X3 + 1260, 560, 'MongoDB 第一版', 'on'); show(v1, T('n19', '第一个版本'), { y: 14 }); sfx('pop', T('n19', '第一个版本'));
  const hum = note(world, X3 + 1260, 660, '<b>humongous</b>：巨大', 'g'); css(hum, { fontSize: '32px' }); show(hum, T('n20', 'humongous'), { y: 10 });
  const ren = xl(world, X3 + 1260, 750, '公司：10gen → MongoDB'); css(ren, { fontSize: '30px' }); show(ren, T('n20b'), { y: 10 });
  to([sf, stage, ...proj, mdb, nsLab, nsN, zz, v1, hum, ren], T('n21') - 1.0, { autoAlpha: 0, duration: 0.5 });

  // ── 第 4 站：名字的两种读法、共同点、非关系型、四类 ──
  const X4 = X(4);
  const nm = h('div', 'abs', world); px(nm, X4 + 140, 110); css(nm, { font: '900 200px/1 "Inter"', color: '#061621', whiteSpace: 'nowrap' });
  const nNo = h('span', '', nm, 'No'); css(nNo, { color: '#00684A', display: 'inline-block' });
  const nOnly = h('span', '', nm, 't only&nbsp;'); css(nOnly, { color: '#00684A', display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', whiteSpace: 'nowrap' });
  const nSQL = h('span', '', nm, 'SQL'); css(nSQL, { display: 'inline-block' });
  const wOnly = nOnly.getBoundingClientRect().width || 560;
  appear(nm, T('n21') - 0.2);
  set(nOnly, s.start, { width: 0 });
  const again = xl(world, X4 + 140, 380, '再看这个名字', 'dk'); show(again, T('n21') + 0.2, { y: 10 }); fadeOut(again, T('n22') - 0.1);
  show(nSQL, T('n21', 'SQL 前面') - 0.3, { y: 20 });
  fromTo(nNo, T('n21', '加一个') - 0.1, { x: -420, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.5)' }); sfx('thud', T('n21', '加一个') + 0.4);
  const r1 = xl(world, X4 + 140, 360, 'No ＝ 不用 SQL'), r2 = xl(world, X4 + 640, 360, 'Not only ＝ 不只用 SQL');
  show(r1, T('n22', '不用'), { y: 12 });
  to(nOnly, T('n23', 'Not only') - 0.1, { width: wOnly, duration: 0.7, ease: 'power2.inOut' });
  show(r2, T('n23', '不只用'), { y: 12 });
  fadeOut([r1, r2], T('n24'));
  to(nOnly, T('n24'), { width: 0, duration: 0.6, ease: 'power2.inOut' });   // 两种读法讲完，名字回到 NoSQL
  const comm = xl(world, X4 + 140, 360, '没有统一的定义，只有几个常见的共同点', 'on'); css(comm, { fontSize: '26px', padding: '4px 18px' }); show(comm, T('n24', '共同点') - 0.3, { x: -10, y: 0 });
  const traits = [['不用关系表和 SQL', ['n25', '关系表']], ['记录可以随时加字段', ['n25', '记录']], ['为一大群机器设计', ['n26', '一大群']]];
  traits.forEach(([t, at], i) => { const c = xl(world, X4 + 140 + i * 540, 430, t, 'dk'); show(c, T(at[0], at[1]), { y: 12 }); });
  const nonrel = gloss(note(world, X4 + 140, 540, '<b>非关系型数据库</b>：不按关系表（行与列）存数据', 'g'), '非关系型数据库'); css(nonrel, { fontSize: '32px' });
  show(nonrel, T('n27', '非关系型'), { y: 10 });
  const cats = [['文档', 'MongoDB', '文档'], ['键值', '系列最后一集', '键值'], ['宽列', '', '宽列'], ['图', '', '图']];
  const tiles = cats.map(([n, sub, w], i) => {
    const t = h('div', 'panel', world); px(t, X4 + 140 + i * 420, 640, 390, 210);
    const tn = h('div', 'abs', t, n); css(tn, { left: '28px', top: '22px', font: '700 52px "Serif SC"', color: '#061621' });
    if (sub) { const ts = h('div', 'abs t-note', t, sub); css(ts, { left: '28px', top: '100px', color: '#1C2D38' }); }
    show(t, T('n28', w), { y: 20 }); return t;
  });
  glow(tiles[1], T('n29', '键值'), T('n30') - 0.1, { bg: '#E8F0FE', bd: '#016BF8' });
  glow(tiles[0], T('n30', '文档'), null, { bg: '#00ED64', bd: '#00ED64' });
  to([tiles[2], tiles[3]], T('n30', '文档'), { autoAlpha: 0.35, duration: 0.5 });
  const adoc = gloss(h('div', 'abs mono', tiles[0], '{ name: "Alice", age: 42 }'), '文档');
  css(adoc, { left: '28px', top: '150px', font: '600 22px "Mono"', color: '#023430' });
  show(adoc, T('n31', '文档') - 0.3, { y: 8 });

  // 镜头：五站，一章之内朝同一个方向极慢横移
  const moves = [T('n3') - 0.9, T('n9') - 0.9, T('n15') - 0.9, T('n21') - 0.9];
  const bounds = [s.start, ...moves, s.end];
  const keys = [];
  bounds.slice(0, -1).forEach((a, k) => {
    const b = bounds[k + 1], from = k === 0 ? a : a + 1.3, dd = drift(from, b, 960 + X(k), -1);
    if (k > 0) keys.push([a, { x: dd.from }, 1.3]);
    keys.push([k > 0 ? null : a + 0.1, { x: dd.to }, Math.max(0.5, b - from - 0.2), { ease: 'none', sfx: false }]);
  });
  const d0 = drift(s.start, moves[0], 960, -1);
  cam.track(s.start, { x: d0.from, y: 540, z: 1 }, keys);
});
