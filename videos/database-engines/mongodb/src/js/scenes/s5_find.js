// 第 05 章 查：左边姓名索引（根 + 15 个叶页），右边集合树（根 + 4 个叶页）。先演没有索引时翻遍 4096 份，
// 再演有索引时：姓名索引第一项 → 2050 → 集合树根页的分界 → 第二个叶页 → 47 个字节。最后年龄查询与索引的代价。
// 事实：C01 C02 C04 C05 C06 B03 B05 B06 H04；分界取自检查点写出的树（B03），计数取自 04 实验（C01 C02）。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);

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
  const noIdx = chip(world, 120, 140, '没有姓名索引', 'dk xl'); show(noIdx, T('d1', '没有'), { y: 0, s: 1.2 }); fadeOut(noIdx, T('d5') - 0.2);
  const onlyColl = chip(world, 120, 250, '只能翻集合树', 'dk xl'); show(onlyColl, T('d1', '翻集合树') - 0.3, { y: 10 }); fadeOut(onlyColl, T('d5') - 0.2);
  const bySort = chip(world, 120, 350, '集合树按 RecordId 排序，不按名字', 'dk xl'); show(bySort, T('d2'), { y: 10 }); fadeOut(bySort, T('d5') - 0.2);
  const noName = chip(world, 120, 450, '和名字无关', 'dk xl'); show(noName, T('d2', '无关') - 0.3, { y: 10 }); fadeOut(noName, T('d4') - 0.1);

  // 没有索引：一份份比对（C01）
  const scan = h('div', 'abs', cp); px(scan, 24, 250, 176, 100); css(scan, { border: '4px solid #DB3030', borderRadius: '8px' });
  set(scan, s.start, { autoAlpha: 0 });
  const t3 = T('d3');
  appear(scan, t3); for (let i = 1; i < 4; i++) to(scan, t3 + i * 0.7, { left: 24 + i * 192, duration: 0.6, ease: 'power1.inOut' });
  cl.forEach((l, i) => glow(l, t3 + i * 0.7, t3 + i * 0.7 + 0.65, { bg: '#DB3030', bd: '#DB3030', c: '#FFFFFF', rb: '#FFE9E7', rd: '#DB3030', rc: '#3D4F58' }));
  vanish(scan, Tend('d4') + 0.3);
  const found = chip(world, 120, 650, '看了 4096 份，找到 1 份', 'dk xl'); show(found, T('d4') + 0.5, { y: 10 }); fadeOut(found, T('d5') - 0.2);
  const st = h('div', 'panel', world); px(st, 1000, 610, 800, 160);
  const stT = h('div', 'abs t-note', st, 'MongoDB 的执行统计'); css(stT, { left: '24px', top: '14px' });
  const kN = h('div', 'abs', st, '看过的索引键 <b class="kk">0</b>'); css(kN, { left: '24px', top: '70px', font: '500 32px "Sans SC"' });
  const dN = h('div', 'abs', st, '看过的文档 <b class="dd">0</b>'); css(dN, { left: '400px', top: '70px', font: '500 32px "Sans SC"' });
  show(st, t3, { y: 12 });
  const dd = dN.querySelector('.dd'), kk = kN.querySelector('.kk');
  stepTo(dd, [[t3, 2.6, 0, 4096], [T('d17'), 0.01, 4096, 1], [T('d19', '4096'), 1.2, 1, 4096]]);
  keyed(kk).at(T('d17'), { html: '1' }).at(T('d19', '4096'), { html: '0' });
  // 换成走索引时，上一轮的统计先收起，叶页的红色退掉；走完索引再亮出 1 / 1
  to(st, T('d5') - 0.2, { autoAlpha: 0, duration: 0.4 }); to(st, T('d17') - 0.4, { autoAlpha: 1, duration: 0.4 });
  to(cl, T('d5') - 0.2, { backgroundColor: '#FFFFFF', borderColor: '#C1C7C6', color: '#3D4F58', duration: 0.4 });
  to(st, T('d17'), { borderColor: '#00ED64', duration: 0.3 }); to(st, T('d18'), { borderColor: '#C1C7C6', duration: 0.3 });

  // 姓名索引（左）：15 个叶页（B06），按字节排序，Alice 是第一项（C06）
  const ip = h('div', 'panel', world); px(ip, 120, 110, 840, 470);
  const it = h('div', 'abs', ip, '姓名索引 · 按名字的字节排序'); css(it, { left: '24px', top: '16px', font: '700 32px "Serif SC"', color: '#061621' });
  const iroot = pg(ip, 320, 90, 200, 70, '根页', 'root');
  const il = []; for (let i = 0; i < 15; i++) il.push(pg(ip, 24 + i * 53, 250, 46, 100, ''));
  const isv = svg('svg', { class: 'ov', viewBox: '0 0 840 470' }, ip); css(isv, { width: '840px', height: '470px' });
  il.forEach((l, i) => svg('path', { d: `M420,160 L${24 + i * 53 + 23},250`, stroke: '#C1C7C6', 'stroke-width': 1.6, fill: 'none' }, isv));
  const ent = h('div', 'abs mono', ip, '"Alice" + 2050'); css(ent, { left: '24px', top: '370px', font: '700 30px "Mono"', color: '#00ED64', background: '#023430', border: '2px solid #023430', borderRadius: '8px', padding: '10px 18px' });
  const oth = h('div', 'abs mono', ip, '"User00001-abc…" · "User00002-abc…" · …'); css(oth, { left: '24px', top: '430px', font: '500 22px "Mono"', color: '#5C6C75' });
  show(ip, T('d5'), { x: -40, y: 0 }); set(oth, s.start, { autoAlpha: 0 });
  il.forEach((l, i) => glow(l, T('d6', '字节') - 0.4 + i * 0.06, T('d7') + i * 0.04, { bg: '#00ED64', bd: '#00ED64' }));
  const othC = chip(world, 144, 600, '别人：User00001-…、User00002-…', 'dk xl'); css(othC, { fontSize: '28px' }); show(othC, T('d7', 'User'), { y: 10 }); fadeOut(othC, T('d7b') - 0.1);
  const byteN = chip(world, 144, 600, '字节：A 是 41，U 是 55 → A 在前', 'dk xl'); css(byteN, { fontSize: '28px' }); show(byteN, T('d7b'), { y: 8 }); fadeOut(byteN, T('d8') - 0.1);
  hl(il[0], T('d8'), Infinity, 'on'); sfx('pop', T('d8'));
  const first = chip(world, 640, 600, 'Alice：第一项', 'on xl'); show(first, T('d8', '第一项') - 0.3, { y: 10 }); fadeOut(first, T('d9') - 0.1);
  const down = chip(world, 640, 600, '从根页往下：第一个叶页', 'dk xl'); show(down, T('d9') + 0.2, { y: 10 }); fadeOut(down, T('d10') - 0.1);
  const ip1 = svg('path', { d: 'M420,160 L47,250', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, isv); draw(ip1, T('d9'), 0.7);
  show(ent, T('d10'), { y: 10 });
  const ridC = chip(ip, 360, 372, '2050 就是她的 RecordId', 'on xl'); show(ridC, T('d11') + 0.2, { y: 10 });
  const keyC = chip(world, 640, 600, '这一项的键：名字接编号', 'dk xl'); show(keyC, T('d10') + 0.4, { y: 10 }); fadeOut(keyC, T('d11') - 0.1); fadeOut(ridC, T('d12') + 0.6);
  glow(il[0], T('d9', '找到她') - 0.3, null, { bg: '#00ED64', bd: '#023430' });
  const back2 = chip(world, 1000, 620, '带着 2050，回到集合树', 'dk xl'); show(back2, T('d12', '2050') - 0.2, { y: 10 }); fadeOut(back2, T('d13') - 0.1);
  const thatTree = chip(world, 1000, 620, '上一章检查点写出的那棵树', 'dk xl'); show(thatTree, T('d13', '那棵树') - 0.4, { y: 10 }); fadeOut(thatTree, T('d14') + 0.1);
  glow(cl[1], T('d13b', '1225') - 0.3, T('d14'), { bg: '#C0FAE6', bd: '#00684A' });
  glow(cl[2], T('d14', '2449') - 0.3, T('d14', '3124') - 0.4, { bg: '#C0FAE6', bd: '#00684A' });
  glow(cl[3], T('d14', '3124') - 0.3, T('d15') - 0.1, { bg: '#C0FAE6', bd: '#00684A' });
  const rid = h('span', '', ent, ''); // 2050 的位置由文字给出
  // 拿着 2050 回到集合树（d12）
  const hop = link(ov, [[440, 505], [985, 505], [985, 235], [1214, 235]], 'spring', { w: 5, arrow: true });
  arrowIn(hop, T('d12'), 1.0);
  const cp1 = svg('path', { d: 'M400,160 L304,250', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, csv);
  draw(cp1, T('d15'), 0.7); glow(cl[1], T('d15'), T('d18'), { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const got = h('div', 'abs', cp, '2050 → 47 字节'); css(got, { left: '216px', top: '370px', font: '700 28px "Mono"', color: '#023430', background: '#00ED64', borderRadius: '6px', padding: '8px 14px' });
  show(got, T('d15') + 0.6, { y: 10 }); sfx('pop', T('d15') + 0.6);
  const whole47 = chip(world, 1000, 620, '取出的是 Alice 整份文档：47 字节', 'dk xl'); css(whole47, { fontSize: '28px' }); show(whole47, T('d15', '47') - 0.3, { y: 10 }); fadeOut(whole47, T('d16') - 0.1);
  const cacheN = chip(world, 1000, 610, '路上的页在缓存里：直接用', 'dk xl'), fileN = chip(world, 1000, 700, '不在缓存里：才去读文件', 'on xl');
  show(cacheN, T('d16'), { y: 6 }); show(fileN, T('d16', '不在') - 0.2, { y: 6 }); hide([cacheN, fileN], T('d17') - 0.5, { y: 0 });

  // 年龄没有索引：又翻一遍，返回 66（C04）
  hide([hop], T('d18') - 0.1);
  const scan2 = h('div', 'abs', cp); px(scan2, 24, 250, 176, 100); css(scan2, { border: '4px solid #DB3030', borderRadius: '8px' });
  set(scan2, s.start, { autoAlpha: 0 });
  const t19 = T('d19'); appear(scan2, t19); for (let i = 1; i < 4; i++) to(scan2, t19 + i * 0.6, { left: 24 + i * 192, duration: 0.5 });
  vanish(scan2, Tend('d19') + 0.4);
  const age = h('div', 'abs', st, 'find({ age: 42 }) · 看过 4096 份，返回 66 份'); css(age, { left: '24px', top: '116px', font: '600 26px "Mono"', color: '#DB3030' });
  show(age, t19 + 0.3, { y: 6 });
  // 代价：每多一个索引，每次插入多写一棵树（H04）
  const cost = note(world, 120, 640, '每插入一份文档：集合树 + 每个索引各写一项', ''); css(cost, { left: '120px', top: '700px' });
  show(cost, T('d20'), { y: 10 });

  sfx('blip', T('d12')); sfx('tick', T('d13b')); sfx('pop', T('d17')); sfx('blip', T('d19')); sfx('tick', T('d20'));
  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
