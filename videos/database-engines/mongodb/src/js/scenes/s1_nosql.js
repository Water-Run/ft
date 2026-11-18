// 第 01 章 NoSQL：一条贯穿全章的时间线（y = 870），镜头沿线走四站，一站一屏（1920 一格）。
// 0 2000 年代末：数据又多又杂、一台机器扛不住；1 DoubleClick → 10gen；2 2009 年旧金山的聚会、NoSQL 这个名字、MongoDB 第一版；
// 3 名字的两种读法、共同点、非关系型、四类。
// 事实：V03 V01 V04 V02 N01 I04；n5 的三种人取自 A12 的 people 集合（示例）。
scene('nosql', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const Y = 870, X = (k) => k * 1920;

  // 时间线本体：先整条画出来，节点随旁白点亮
  const line = link(ov, [[200, Y], [X(2) + 1800, Y]], 'dim', { w: 3 });
  draw(line, c0, 1.6);
  const tick = (x, txt, t) => {
    const d = h('div', 'abs', world); px(d, x - 11, Y - 11, 22, 22); css(d, { borderRadius: '50%', background: '#00684A' });
    const l = label(world, x - 120, Y + 20, txt); css(l, { width: '240px', textAlign: 'center', font: '700 30px "Mono"', color: '#00684A' });
    show(d, t, { y: 0, s: 0.4 }); show(l, t, { y: 8 }); sfx('blip', t); return d;
  };
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');

  // ── 第 0 站：2000 年代末，数据又多又杂；一台机器扛不住 ──
  tick(300, '2000 年代末', T('n3', '2000 年代末') - 0.2);
  const say = xl(world, 140, 96, '按 MongoDB 的说法', 'dk'); show(say, c0 + 0.1, { x: -10, y: 0 });
  const era = xl(world, 520, 96, '到了 2000 年代末', 'on'); show(era, T('n3', '2000 年代末') - 0.3, { x: -10, y: 0 });
  const why = [['存储便宜了', '存储'], ['数据越来越多', '数据'], ['样子越来越杂', '样子']].map(([t, w], i) => { const c = xl(world, 140 + i * 340, 186, t); show(c, T('n4', w), { y: 12 }); return c; });
  const fix = h('div', 'panel', world); px(fix, 140, 330, 780, 470);
  const ft = h('div', 'abs', fix, '一张先定好的表 · users'); css(ft, { left: '30px', top: '20px', font: '700 34px "Serif SC"', color: '#061621' });
  ['name', 'age'].forEach((c, i) => { const hd = h('div', 'abs mono', fix, c); css(hd, { left: 30 + i * 360 + 'px', top: '80px', width: '350px', height: '60px', lineHeight: '60px', paddingLeft: '14px', boxSizing: 'border-box', background: '#E3FCF7', border: '1.5px solid #C1C7C6', font: '600 30px "Mono"' }); });
  const sqlL = h('div', 'abs mono', fix, 'CREATE TABLE users (name …, age …)'); css(sqlL, { left: '30px', top: '420px', font: '500 24px "Mono"', color: '#5C6C75' });
  show(fix, T('n4', '样子') + 0.4, { y: 20 });
  const ppl = [['Alice', '{ name, age }', ['n5', '年龄'], 0], ['Erin', '{ name, email, tags }', ['n5', '邮箱'], 0], ['Frank', '{ name, address }', ['n5', '标签'], 0.6]];
  const cards = ppl.map(([n, f, at, dt], i) => {
    const c = h('div', 'abs', world, `<b>${n}</b>　<span class="mono" style="font-size:28px;color:#3D4F58">${f}</span>`);
    px(c, 1000, 360 + i * 110); css(c, { background: '#fff', border: '3px solid #C1C7C6', borderRadius: '10px', padding: '16px 22px', font: '700 32px "Sans SC"' });
    show(c, T(at[0], at[1]) + dt, { x: 40, y: 0 }); return c;
  });
  // 装进表里：Erin 与 Frank 的字段对不上
  cards.forEach((c, i) => to(c, T('n6') + i * 0.2, { x: -830, y: 116 - 34 * i, duration: 0.8, ease: 'power2.inOut' }));
  [cards[1], cards[2]].forEach((c, i) => to(c, T('n6', '很难装') + i * 0.2, { borderColor: '#DB3030', backgroundColor: '#FFE9E7', duration: 0.3 }));
  const bad = xl(world, 940, 560, '装不下', 'red'); show(bad, T('n6', '很难装') + 0.3, { y: 0, s: 1.3 }); sfx('thud', T('n6', '很难装') + 0.3, { g: 0.5 });
  fadeOut(bad, T('n7'));
  // 横向：多加几台；纵向：一台换更强
  const outL = label(world, 1020, 360, '横向：多加几台机器', 't-body'); css(outL, { fontWeight: 700 });
  const outs = []; for (let i = 0; i < 5; i++) { const m = h('div', 'abs', world); px(m, 1020 + i * 120, 420, 90, 130); css(m, { background: '#00ED64', borderRadius: '8px' }); outs.push(m); }
  show(outL, T('n7'), { y: 8 }); show(outs, T('n7', '几台机器'), { y: 30, stagger: 0.15 });
  const dataDots = outs.map((m, i) => { const d = h('div', 'abs', world); px(d, 1020 + i * 120 + 25, 520, 40, 14); css(d, { background: '#023430', borderRadius: '7px' }); return d; });
  show(dataDots, T('n7', '分散开') - 0.2, { y: -60, stagger: 0.08, d: 0.5 });
  const upL = label(world, 1020, 588, '纵向：一台换得更强', 't-body'); css(upL, { fontWeight: 700 });
  const up = h('div', 'abs', world); px(up, 1020, 680, 130, 160); css(up, { background: '#3D4F58', borderRadius: '8px', transformOrigin: '50% 100%' });
  show([upL, up], T('n8'), { y: 10 }); to(up, T('n8', '更强'), { scaleY: 1.25, scaleX: 1.3, backgroundColor: '#023430', duration: 0.8 });
  const upN = label(world, 1230, 760, '← 关系数据库主要靠这个', 't-note'); show(upN, T('n8', '关系数据库'), { x: -10, y: 0 });
  to([say, era, ...why, fix, ...cards, outL, ...outs, ...dataDots, upL, up, upN], T('n9') - 0.6, { autoAlpha: 0, duration: 0.4 });

  // ── 第 1 站：DoubleClick → 10gen（2007）──
  const X1 = X(1);
  const who = xl(world, X1 + 140, 96, 'MongoDB 的创始人', 'dk'); show(who, T('n9') + 0.1, { x: -10, y: 0 });
  const dc = h('div', 'panel', world); px(dc, X1 + 140, 190, 1060, 480);
  const folk = [0, 1, 2].map((i) => { const g = h('div', 'abs', world); px(g, X1 + 190 + i * 110, 230, 90, 130); h('div', 'abs', g).style.cssText = 'left:17px;top:0;width:56px;height:56px;border-radius:50%;background:#023430'; h('div', 'abs', g).style.cssText = 'left:0;top:64px;width:90px;height:66px;border-radius:30px 30px 8px 8px;background:#023430'; return g; });
  const dct = h('div', 'abs', dc, 'DoubleClick'); css(dct, { left: '420px', top: '40px', font: '800 60px "Inter"', color: '#061621' });
  const dcs = h('div', 'abs t-note', dc, '他们原先所在的广告公司'); css(dcs, { left: '420px', top: '120px', color: '#1C2D38' });
  show(dc, T('n9', 'DoubleClick') - 0.4, { y: 16 }); show(folk, T('n9', 'DoubleClick') - 0.2, { y: 14, stagger: 0.12 });
  const dcn = h('div', 'abs num', dc, '0'); css(dcn, { left: '40px', top: '210px', fontSize: '110px', color: '#00684A' });
  const dcu = h('div', 'abs', dc, '条广告 / 秒'); css(dcu, { left: '40px', top: '345px', font: '600 34px "Sans SC"', color: '#3D4F58' });
  const trk = h('div', 'abs', dc); px(trk, 40, 410, 980, 36); css(trk, { background: '#E4E8E0', borderRadius: '18px' });
  const fill = h('div', 'abs', dc); px(fill, 40, 410, 980, 36); css(fill, { background: '#00ED64', borderRadius: '18px', transformOrigin: '0 50%' });
  const t11 = T('n11', '四十多万');
  show([dcn, dcu, trk], T('n11') - 0.1, { y: 8 }); countTo(dcn, 0, 400000, t11, 1.4, (v) => Math.round(v).toLocaleString('en-US') + '+');
  fromTo(fill, t11, { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'none' });
  const hard = tile(world, X1 + 140, 700, 1060, 120, '量一上去，关系数据库就很难扩展', '照他们自己的说法', 'rd');
  show(hard, T('n12'), { y: 12 }); to(fill, T('n12', '很难扩展'), { backgroundColor: '#DB3030', duration: 0.4 });
  tick(X1 + 1500, '2007', T('n13'));
  const gen = xl(world, X1 + 1300, 230, '10gen'); css(gen, { font: '800 64px "Inter"', padding: '14px 40px' });
  const genL = label(world, X1 + 1300, 360, '他们办的新公司，后来改叫 MongoDB', 't-note'); css(genL, { color: '#1C2D38' });
  show(gen, T('n13', '10gen') - 0.2, { y: 0, s: 1.3 }); show(genL, T('n13', '10gen') + 0.3, { y: 8 }); sfx('pop', T('n13', '10gen'));
  const arrow10 = link(ov, [[X1 + 1210, 430], [X1 + 1290, 300]], 'accent', { arrow: true, w: 3 }); arrowIn(arrow10, T('n13', '一家公司'), 0.6);
  to([who, dc, ...folk, hard, gen, genL, arrow10], Math.max(T('n15') - 0.6, T('n13', '10gen') + 1.1), { autoAlpha: 0, duration: 0.4 });

  // ── 第 2 站：2009 年 6 月旧金山的聚会 → NoSQL 这个名字；MongoDB 第一版 ──
  const X2 = X(2);
  tick(X2 + 300, '2009.6', T('n15'));
  const sf = xl(world, X2 + 140, 110, '2009 年 6 月 · 旧金山 · 一场新数据库的聚会', 'dk'); show(sf, T('n15', '旧金山') - 0.3, { y: 10 });
  const stage = h('div', 'panel', world); px(stage, X2 + 140, 210, 1060, 410); show(stage, T('n15') + 0.3, { y: 16 });
  const PJ = [['Voldemort', null], ['Cassandra', 'Cassandra'], ['Dynomite', null], ['HBase', 'HBase'], ['Hypertable', null], ['CouchDB', 'CouchDB']];
  const proj = PJ.map(([n, w], i) => { const c = xl(world, X2 + 180 + (i % 3) * 340, 250 + Math.floor(i / 3) * 110, n, w ? 'dk' : ''); css(c, { fontFamily: '"Inter"' }); show(c, w ? T('n16', w) - 0.2 : T('n15', '聚会') + i * 0.1, { y: 14 }); return c; });
  const mdb = xl(world, X2 + 180, 480, 'MongoDB', 'on'); css(mdb, { font: '800 44px "Inter"', padding: '12px 34px' });
  show(mdb, T('n16', 'MongoDB') - 0.2, { y: 0, s: 1.3 }); sfx('pop', T('n16', 'MongoDB'));
  const nsLab = h('div', 'abs', world, 'NoSQL'); px(nsLab, X2 + 140, 640); css(nsLab, { font: '900 120px "Inter"', color: '#061621' });
  const nsN = label(world, X2 + 560, 700, '这个名字从这场聚会传开', 't-note'); css(nsN, { color: '#1C2D38' });
  const brk = h('div', 'abs', world); px(brk, X2 + 140, 630, 1060, 8); css(brk, { background: '#00684A', transformOrigin: '0 50%' });
  fromTo(brk, T('n18') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.6 });
  slam(nsLab, T('n18', 'NoSQL') + 0.1, { from: 1.25 }); show(nsN, T('n18', '传开') - 0.3, { x: -10, y: 0 }); sfx('thud', T('n18', 'NoSQL') + 0.2);
  tick(X2 + 1500, '2009.8', T('n19'));
  const v1 = h('div', 'abs', world); px(v1, X2 + 1260, 230, 540, 330); css(v1, { background: '#023430', borderRadius: '16px' });
  const v1a = h('div', 'abs', v1, '大约两个月后'); css(v1a, { left: '34px', top: '30px', font: '600 30px "Sans SC"', color: '#71F6BA' });
  const v1b = h('div', 'abs', v1, 'MongoDB'); css(v1b, { left: '34px', top: '86px', font: '800 76px "Inter"', color: '#00ED64' });
  const v1c = h('div', 'abs', v1, '发布第一个版本'); css(v1c, { left: '34px', top: '200px', font: '700 40px "Sans SC"', color: '#fff' });
  show(v1, T('n19') + 0.1, { x: 30, y: 0 }); show(v1c, T('n19', '第一个版本') - 0.3, { y: 10 }); sfx('pop', T('n19', '第一个版本'));
  to([sf, stage, ...proj, mdb, nsLab, nsN, brk, v1], T('n21') - 0.6, { autoAlpha: 0, duration: 0.4 });

  // ── 第 3 站：名字的两种读法、共同点、非关系型、四类 ──
  const X3 = X(3);
  const nm = h('div', 'abs', world); px(nm, X3 + 140, 110); css(nm, { font: '900 200px/1 "Inter"', color: '#061621', whiteSpace: 'nowrap' });
  const nNo = h('span', '', nm, 'No'); css(nNo, { color: '#00684A', display: 'inline-block' });
  const nOnly = h('span', '', nm, 't only&nbsp;'); css(nOnly, { color: '#00684A', display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', whiteSpace: 'nowrap' });
  const nSQL = h('span', '', nm, 'SQL'); css(nSQL, { display: 'inline-block' });
  const wOnly = nOnly.getBoundingClientRect().width || 560;
  set(nOnly, s.start, { width: 0 });
  show(nm, T('n21') + 0.1, { y: 20 });
  const two = xl(world, X3 + 140, 360, '这个 No，有两种读法', 'dk'); show(two, T('n21', '两种读法') - 0.3, { y: 10 }); fadeOut(two, T('n22') - 0.1);
  const r1 = xl(world, X3 + 140, 360, 'No ＝ 不用 SQL'), r2 = xl(world, X3 + 640, 360, 'Not only ＝ 不只用 SQL');
  show(r1, T('n22', '不用'), { y: 12 });
  to(nOnly, T('n23', 'Not only') - 0.1, { width: wOnly, duration: 0.7, ease: 'power2.inOut' });
  show(r2, T('n23', '不只用'), { y: 12 });
  fadeOut([r1, r2], T('n24'));
  to(nOnly, T('n24'), { width: 0, duration: 0.6, ease: 'power2.inOut' });   // 两种读法讲完，名字回到 NoSQL
  const comm = xl(world, X3 + 140, 360, '没有统一的定义，通常的共同点', 'on'); css(comm, { fontSize: '26px', padding: '4px 18px' }); show(comm, T('n24', '统一的定义') - 0.3, { x: -10, y: 0 });
  const traits = [['不用关系表和 SQL', ['n24', '关系表']], ['记录可以随时加字段', ['n25', '加字段']], ['为一大群机器设计', ['n25', '一大群']]];
  traits.forEach(([t, at], i) => { const c = xl(world, X3 + 140 + i * 540, 430, t, 'dk'); show(c, T(at[0], at[1]) - 0.3, { y: 12 }); });
  const nonrel = gloss(note(world, X3 + 140, 540, '<b>非关系型数据库</b>：不按关系表（行与列）存数据', 'g'), '非关系型数据库'); css(nonrel, { fontSize: '32px' });
  show(nonrel, T('n27', '非关系型') - 0.3, { y: 10 });
  const cats = [['文档', 'MongoDB', '文档'], ['键值', '系列最后一集', '键值'], ['宽列', '', '宽列'], ['图', '', '图']];
  const tiles = cats.map(([n, sub, w], i) => {
    const t = h('div', 'panel', world); px(t, X3 + 140 + i * 420, 640, 390, 210);
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

  // 镜头：四站，一章之内朝同一个方向极慢横移
  const moves = [T('n9') - 0.5, T('n15') - 0.5, T('n21') - 0.5];
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
