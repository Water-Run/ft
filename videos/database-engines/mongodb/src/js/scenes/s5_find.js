// 第 05 章 查：左边姓名索引（根 + 15 个叶页），右边集合树（根 + 4 个叶页），右下是真实的 mongosh 回显（out_04）。
// 先演没有索引时翻遍 4096 份（COLLSCAN），再建姓名索引（name_1）：索引第一项 → 2050 → 集合树根页的分界 → 第二个叶页 → 47 个字节（FETCH ← IXSCAN，1 / 1）。
// 事实：C01 C02 C05 C06 B03 B05 B06；分界取自检查点写出的树（B03），回显抄自 research/lab/out_04_find.txt。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const pop = (x, y, txt, t0, t1, cls = 'dk') => { const c = xl(world, x, y, txt, cls); show(c, t0, { y: 10 }); if (t1 != null) fadeOut(c, t1); return c; };

  // 集合树（右）
  const cp = h('div', 'panel', world); px(cp, 1000, 110, 800, 470);
  const ct = h('div', 'abs', cp, '集合树 · 按 RecordId 排序'); css(ct, { left: '24px', top: '16px', font: '700 32px "Serif SC"', color: '#061621' });
  const croot = pg(cp, 220, 90, 360, 70, '1 · 1225 · 2449 · 3124', 'root'); css(croot, { fontSize: '22px' });
  const RNG = ['1–1224', '1225–2448', '2449–3123', '3124–4096'];
  const cl = RNG.map((r, i) => pg(cp, 24 + i * 192, 250, 176, 100, r));
  const csv = svg('svg', { class: 'ov', viewBox: '0 0 800 470' }, cp); css(csv, { width: '800px', height: '470px' });
  cl.forEach((l, i) => svg('path', { d: `M400,160 L${24 + i * 192 + 88},250`, stroke: '#C1C7C6', 'stroke-width': 2, fill: 'none' }, csv));
  show(cp, c0, { y: 16 });
  glow(cp, T('d2', 'RecordId'), T('d3'), { bg: '#E3FCF7', bd: '#00684A', rb: '#F9FBFA', rd: '#C1C7C6' });
  pop(120, 140, '没有姓名索引', T('d1', '没有'), T('d5') - 0.2);
  pop(120, 250, '只能翻集合树', T('d1', '翻集合树') - 0.3, T('d5') - 0.2);
  pop(120, 350, '集合树按 RecordId 排序，不按名字', T('d2'), T('d5') - 0.2);
  pop(120, 450, '和名字无关', T('d2', '无关') - 0.3, T('d4') - 0.1);

  // 真实回显（out_04）：右下的 mongosh
  const sh = term(world, 1000, 600, 800, 340, 'mongosh · lab', { fs: 22 });
  show(sh.c, T('d3') - 0.3, { y: 12 });
  sh.cmd(T('d3') - 0.1, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> }).explain(…)');
  sh.out(T('d4', 'MongoDB') - 0.2, "{ <span class=\"k\">'计划'</span>: <span class=\"s\">'COLLSCAN'</span>, <span class=\"k\">'返回'</span>: <span class=\"n\">1</span>,\n  <span class=\"k\">'看过的索引键'</span>: <span class=\"n\">0</span>, <span class=\"k\">'看过的文档'</span>: <span class=\"n\">4096</span> }");
  sh.cmd(T('d5') + 0.1, 'db.users.createIndex({ <span class="k">name</span>: <span class="n">1</span> })');
  sh.out(T('d5') + 1.3, '<span class="s">name_1</span>');
  sh.cmd(T('d17') - 0.3, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> }).explain(…)');
  sh.out(T('d17', '1 个索引键') - 0.3, "{ <span class=\"k\">'计划'</span>: <span class=\"s\">'FETCH ← IXSCAN'</span>, <span class=\"k\">'返回'</span>: <span class=\"n\">1</span>,\n  <span class=\"k\">'看过的索引键'</span>: <span class=\"n\">1</span>, <span class=\"k\">'看过的文档'</span>: <span class=\"n\">1</span> }");
  const hi4096 = h('div', 'abs', world); px(hi4096, 1012, 732, 776, 72); css(hi4096, { background: '#DB303044', border: '3px solid #DB3030', borderRadius: '8px' });
  show(hi4096, T('d4', '4096') - 0.2, { y: 0 }); fadeOut(hi4096, T('d5') - 0.1);

  // 没有索引：一份份比对（C01）
  const scan = h('div', 'abs', cp); px(scan, 24, 250, 176, 100); css(scan, { border: '4px solid #DB3030', borderRadius: '8px' });
  set(scan, s.start, { autoAlpha: 0 });
  const t3 = T('d3');
  appear(scan, t3); for (let i = 1; i < 4; i++) to(scan, t3 + i * 0.7, { left: 24 + i * 192, duration: 0.6, ease: 'power1.inOut' });
  cl.forEach((l, i) => glow(l, t3 + i * 0.7, t3 + i * 0.7 + 0.65, { bg: '#DB3030', bd: '#DB3030', c: '#FFFFFF', rb: '#FFE9E7', rd: '#DB3030', rc: '#3D4F58' }));
  vanish(scan, Tend('d4') + 0.3);
  pop(120, 650, '看了 4096 份，找到 1 份', T('d4') + 0.5, T('d5') - 0.2, 'red');
  // 换成走索引时，叶页的红色退掉
  to(cl, T('d5') - 0.2, { backgroundColor: '#FFFFFF', borderColor: '#C1C7C6', color: '#3D4F58', duration: 0.4 });

  // 姓名索引（左）：15 个叶页（B06），按字节排序，Alice 是第一项（C06）
  const ip = h('div', 'panel', world); px(ip, 120, 110, 840, 470);
  const it = h('div', 'abs', ip, '姓名索引 name_1 · 按名字的字节排序'); css(it, { left: '24px', top: '16px', font: '700 32px "Serif SC"', color: '#061621' });
  const iroot = pg(ip, 320, 90, 200, 70, '根页', 'root');
  const il = []; for (let i = 0; i < 15; i++) il.push(pg(ip, 24 + i * 53, 250, 46, 100, ''));
  const isv = svg('svg', { class: 'ov', viewBox: '0 0 840 470' }, ip); css(isv, { width: '840px', height: '470px' });
  il.forEach((l, i) => svg('path', { d: `M420,160 L${24 + i * 53 + 23},250`, stroke: '#C1C7C6', 'stroke-width': 1.6, fill: 'none' }, isv));
  const ent = h('div', 'abs mono', ip, '"Alice" + 2050'); css(ent, { left: '24px', top: '370px', font: '700 30px "Mono"', color: '#00ED64', background: '#023430', border: '2px solid #023430', borderRadius: '8px', padding: '10px 18px' });
  show(ip, T('d5'), { x: -40, y: 0 });
  il.forEach((l, i) => glow(l, T('d6', '字节') - 0.4 + i * 0.06, T('d7') + i * 0.04, { bg: '#00ED64', bd: '#00ED64' }));
  pop(144, 600, '别人：User00001-…、User00002-…', T('d7', 'User') - 0.2, T('d7b') - 0.1);
  pop(144, 600, '字节：A 是 41，U 是 55 → A 在前', T('d7b') + 0.1, T('d7b', '第一项') - 0.4);
  hl(il[0], T('d7b', '第一项') - 0.3, Infinity, 'on'); sfx('pop', T('d7b', '第一项') - 0.3);
  pop(640, 600, 'Alice：第一项', T('d7b', '第一项') - 0.3, T('d9') - 0.1, 'on');
  const ip1 = svg('path', { d: 'M420,160 L47,250', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, isv); draw(ip1, T('d9'), 0.7);
  glow(iroot, T('d9') + 0.1, T('d10'), { bg: '#00684A', bd: '#00ED64', rb: '#023430', rd: '#023430' });
  pop(144, 600, '从根页往下：第一个叶页', T('d9') + 0.2, T('d10') - 0.1);
  glow(il[0], T('d9', '找到她') - 0.3, null, { bg: '#00ED64', bd: '#023430' });
  show(ent, T('d10') + 0.1, { y: 10 });
  const ridC = xl(ip, 360, 372, '2050 就是她的 RecordId', 'on'); show(ridC, T('d10', 'RecordId') - 0.3, { y: 10 }); fadeOut(ridC, T('d12') + 0.6);
  pop(144, 600, '这一项的键：名字接编号', T('d10') + 0.4, T('d10', 'RecordId') - 0.4);
  // 拿着 2050 回到集合树（d12）
  const hop = link(ov, [[440, 505], [985, 505], [985, 235], [1214, 235]], 'spring', { w: 5, arrow: true });
  arrowIn(hop, T('d12'), 1.0); hide([hop], T('d17') - 0.1);
  pop(120, 720, '带着 2050，回到集合树', T('d12', '2050') - 0.2, T('d12', '上一章') - 0.1);
  pop(120, 720, '上一章检查点写出的那棵树', T('d12', '上一章') - 0.1, T('d13b') - 0.1);
  glow(croot, T('d13', '根页') - 0.2, T('d13b'), { bg: '#00684A', bd: '#00ED64', rb: '#023430', rd: '#023430' });
  glow(cl[1], T('d13b', '1225') - 0.3, T('d13b', '2449') - 0.4, { bg: '#C0FAE6', bd: '#00684A' });
  glow(cl[2], T('d13b', '2449') - 0.3, T('d13c') - 0.1, { bg: '#C0FAE6', bd: '#00684A' });
  glow(cl[3], T('d13c', '3124') - 0.3, T('d15') - 0.1, { bg: '#C0FAE6', bd: '#00684A' });
  const cp1 = svg('path', { d: 'M400,160 L304,250', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, csv);
  draw(cp1, T('d15'), 0.7); glow(cl[1], T('d15'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const got = h('div', 'abs', cp, '2050 → 47 字节'); css(got, { left: '216px', top: '370px', font: '700 28px "Mono"', color: '#023430', background: '#00ED64', borderRadius: '6px', padding: '8px 14px' });
  show(got, T('d15') + 0.6, { y: 10 }); sfx('pop', T('d15') + 0.6);
  pop(120, 720, '取出的是 Alice 整份文档：47 字节', T('d15', '47') - 0.3, T('d17') - 0.1);
  pop(120, 720, '1 个索引键、1 份文档', T('d17', '1 个索引键') - 0.2, null, 'on');
  sfx('blip', T('d12')); sfx('pop', T('d17'));

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
