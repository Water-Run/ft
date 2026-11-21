// 第 05 章 查：右边集合树（根 + 4 个叶页），右下是真实的 mongosh 回显（out_04）。左边先是集合树里按 RecordId 的顺序：
// 没有姓名索引时一行行比对 4096 份（COLLSCAN）；建姓名索引（name_1）后，左边原地换成索引树：Alice 是第一项 → 2050 → 集合树根页的分界 → 第二个叶页 → 47 个字节（FETCH ← IXSCAN，1 / 1）。
// 事实：C01 C02 C05 C06 B03 B05 B06；分界取自检查点写出的树（B03），回显抄自 research/lab/out_04_find.txt；其他人的名字是 UserNNNNN-abc… 的演示串（环境与版本）。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '05 查');
  ch.sec(c0, '没有索引');

  // ── 右：集合树 ──
  const cp = h('div', 'panel', world); px(cp, 1000, 130, 780, 460);
  const ct = h('div', 'abs', cp, '集合树 · 键是 RecordId'); css(ct, { left: '26px', top: '18px', font: '500 34px "Serif SC"', color: '#001E2B' });
  const croot = pg(cp, 210, 92, 360, 70, '1 · 1225 · 2449 · 3124', 'root'); css(croot, { fontSize: '23px' });
  const RNG = ['1–1224', '1225–2448', '2449–3123', '3124–4096'];
  const cl = RNG.map((r, i) => pg(cp, 22 + i * 188, 250, 172, 96, r));
  const csv = svg('svg', { class: 'ov', viewBox: '0 0 780 460' }, cp); css(csv, { width: '780px', height: '460px' });
  cl.forEach((l, i) => svg('path', { d: `M390,162 L${22 + i * 188 + 86},250`, stroke: '#889397', 'stroke-width': 2, fill: 'none' }, csv));
  show(cp, c0, { y: 16 });
  figs(world, 1000, 604, 780, [[c0 + 0.5, '图 5-2', '集合树：根页记着三个分界', '实测：wt verify']], null);

  // ── 左：集合树里的顺序（按 RecordId），名字不在顺序里 ──
  const lp = h('div', 'panel', world); px(lp, 140, 130, 820, 460);
  const lt = h('div', 'abs', lp, '集合树里的顺序'); css(lt, { left: '26px', top: '18px', font: '500 34px "Serif SC"', color: '#001E2B' });
  const ROWS = [['1', 'User00001-abc…'], ['2', 'User00002-abc…'], ['3', 'User00003-abc…'], ['⋮', ''], ['2050', 'Alice'], ['⋮', ''], ['4096', 'User04096-abc…']];
  const head = h('div', 'abs', lp); px(head, 26, 80, 768, 46); css(head, { background: '#F9FBFA', borderBottom: '2px solid #C1C7C6', font: '700 26px/44px "Inter", "Sans SC"', color: '#001E2B' });
  head.innerHTML = '<span style="position:absolute;left:18px">RecordId</span><span style="position:absolute;left:220px">name</span>';
  const rowE = ROWS.map(([k, n], i) => { const e = h('div', 'abs', lp); px(e, 26, 128 + i * 46, 768, 46); css(e, { borderBottom: '1.5px solid #E8EDEB', font: '500 26px/44px "Mono"', color: '#001E2B' }); e.innerHTML = `<span style="position:absolute;left:18px">${k}</span><span style="position:absolute;left:220px">${n}</span>`; return e; });
  show(lp, c0, { y: 16 }); show(head, c0 + 0.2, { y: 8 }); rowE.forEach((e, i) => show(e, c0 + 0.3 + i * 0.06, { y: 8, d: 0.35 }));
  const keyN = callout(world, 140, 676, 'note', '集合树的键是 1, 2, 3 … 4096；名字不在键里，排序帮不上忙', '按 RecordId 排序');
  show(keyN, T('d2', 'RecordId') - 0.2, { y: 10 }); fadeOut(keyN, T('d5') - 0.2);
  // d3：一份份比对：扫描框一行行往下，计数到 4096；右边叶页依次被翻
  const t3 = T('d3');
  const scan = h('div', 'abs', lp); px(scan, 24, 126, 772, 50); css(scan, { border: '4px solid #DB3030', borderRadius: '6px' });
  set(scan, s.start, { autoAlpha: 0 }); appear(scan, t3);
  const ys = [0, 1, 2, 3, 4, 5, 6].map((i) => i * 46);
  ys.slice(1).forEach((y, i) => to(scan, t3 + (i + 1) * 0.4, { y, duration: 0.35, ease: 'power1.inOut' }));
  const cnt = h('div', 'abs', lp, ''); px(cnt, 480, 26); css(cnt, { font: '700 28px "Mono", "Sans SC"', color: '#DB3030' });
  set(cnt, s.start, { autoAlpha: 0 }); appear(cnt, t3);
  stepTo(cnt, [[t3, 2.6, 0, 4096]], (v) => `比对了 ${Math.round(v)} 份`);
  cl.forEach((l, i) => glow(l, t3 + i * 0.65, t3 + i * 0.65 + 0.6, { bg: '#FFEAE5', bd: '#DB3030', c: '#970606', rb: '#FFEAE5', rd: '#DB3030', rc: '#970606' }));
  glow(rowE[4], t3 + 1.6, null, { bg: '#E3FCF7', bd: '#E8EDEB' });
  vanish(scan, Tend('d4') + 0.4);
  figs(world, 140, 604, 820, [[T('d1') + 0.3, '图 5-1', '没有姓名索引：从头到尾一份份比对', '实测：explain()']], T('d5') - 0.3);

  // 真实回显（out_04）：右下的 mongosh
  const sh = term(world, 1000, 670, 780, 270, 'mongosh', { fs: 22 });
  show(sh.c, T('d3') - 0.3, { y: 12 });
  sh.cmd(T('d3') - 0.1, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> }).explain(…)');
  sh.out(T('d4', 'MongoDB') - 0.45, "{ <span class=\"k\">'计划'</span>: <span class=\"s\">'COLLSCAN'</span>, <span class=\"k\">'返回'</span>: <span class=\"n\">1</span>,\n  <span class=\"k\">'看过的索引键'</span>: <span class=\"n\">0</span>, <span class=\"k\">'看过的文档'</span>: <span class=\"n\">4096</span> }");
  const r4096 = ring(world, 1012, 780, 756, 68, T('d4', '4096') - 0.2, T('d5') - 0.1, '#DB3030');
  to(cl, T('d5') - 0.2, { backgroundColor: '#FFFFFF', borderColor: '#C1C7C6', color: '#3D4F58', duration: 0.4 });
  sh.clear(T('d5') - 0.1);
  sh.cmd(T('d5') + 0.1, 'db.users.createIndex({ <span class="k">name</span>: <span class="n">1</span> })');
  sh.out(T('d5') + 1.3, "<span class=\"s\">'name_1'</span>");

  // ── 建了姓名索引：左边原地换成索引树（B06），按字节排序，Alice 是第一项（C06） ──
  ch.sec(T('d5') - 0.1, '走姓名索引');
  hide([lt, head, ...rowE, cnt], T('d5') - 0.2, { y: -8, d: 0.4 });
  const it = h('div', 'abs', lp, '姓名索引 name_1 · 键按字节排序'); css(it, { left: '26px', top: '18px', font: '500 34px "Serif SC"', color: '#001E2B' });
  const iroot = pg(lp, 310, 84, 200, 64, '根页', 'root');
  const il = []; for (let i = 0; i < 15; i++) il.push(pg(lp, 26 + i * 51, 200, 44, 84, ''));
  const isv = svg('svg', { class: 'ov', viewBox: '0 0 820 460' }, lp); css(isv, { width: '820px', height: '460px' });
  const iln = il.map((l, i) => svg('path', { d: `M410,148 L${26 + i * 51 + 22},200`, stroke: '#889397', 'stroke-width': 1.6, fill: 'none' }, isv));
  show([it, iroot], T('d5') + 0.2, { y: 10 }); il.forEach((l, i) => show(l, T('d5') + 0.4 + i * 0.03, { y: 10, d: 0.35 }));
  iln.forEach((p, i) => draw(p, T('d5') + 0.6 + i * 0.02, 0.4));
  const lc = label(lp, 26, 294, '1 个根页 · 15 个叶页', 't-small'); show(lc, T('d5') + 1.0, { y: 6 });
  il.forEach((l, i) => glow(l, T('d6', '字节') - 0.4 + i * 0.05, T('d7') + i * 0.03, { bg: '#E3FCF7', bd: '#00A35C' }));
  // 第一个叶页的头几项（03 姓名索引的前几项）
  const zoom = h('div', 'abs', lp); px(zoom, 26, 330, 768, 112); css(zoom, { background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '10px' });
  const ents = [['"Alice" + 2050', '3c 41 6c 69 …'], ['"User00001-abc…" + 1', '3c 55 73 65 …']].map(([k, b], i) => { const e = h('div', 'abs', zoom); px(e, 16, 10 + i * 48, 736, 44); css(e, { font: '500 25px/44px "Mono"', color: '#001E2B', borderRadius: '6px', paddingLeft: '10px' }); e.innerHTML = `${k}<span style="position:absolute;left:470px;color:#5C6C75">${b}</span>`; return e; });
  const zl = link(isv, [[48, 284], [48, 330]], 'dim', { w: 2 });
  show(zoom, T('d7', 'User') - 0.3, { y: 10 }); show(ents[1], T('d7', 'User') - 0.1, { y: 8 }); show(ents[0], T('d7b', '第一项') - 0.4, { y: -8 });
  arrowIn(zl, T('d7', 'User') - 0.3, 0.3);
  const byt = callout(world, 140, 676, 'tip', '键按字节比较：<code>A</code> 是 0x41，<code>U</code> 是 0x55，A 在前', 'Alice 排第一');
  show(byt, T('d7b') - 0.1, { y: 10 }); fadeOut(byt, T('d10') - 0.1);
  hl(il[0], T('d7b', '第一项') - 0.3, Infinity, 'on'); sfx('pop', T('d7b', '第一项') - 0.3);
  const ip1 = svg('path', { d: 'M410,148 L48,200', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, isv); draw(ip1, T('d9'), 0.7);
  glow(iroot, T('d9') + 0.1, T('d10'), { bg: '#00684A', bd: '#00ED64', rb: '#001E2B', rd: '#001E2B' });
  glow(ents[0], T('d9', '找到她') - 0.3, null, { bg: '#00ED64', bd: '#00ED64' });
  const ridN = callout(world, 140, 676, 'note', '键的末尾 3 个字节 <code>20 40 11</code> 就是 RecordId 2050', '名字后面接着编号');
  show(ridN, T('d10', 'RecordId') - 0.4, { y: 10 }); fadeOut(ridN, T('d15') - 0.1);
  figs(world, 140, 604, 820, [[T('d5') + 0.6, '图 5-1', '姓名索引：第一项是 Alice', '实测：dump_pages']], null);

  // 拿着 2050 回到集合树（d12）
  ch.sec(T('d12') - 0.1, '回集合树');
  const hop = link(ov, [[956, 497], [978, 497], [978, 257], [1210, 257]], 'spring', { w: 5, arrow: true });
  arrowIn(hop, T('d12', '2050') - 0.1, 1.0); hide(hop, T('d17') - 0.1);
  glow(croot, T('d13', '根页') - 0.2, T('d13b'), { bg: '#00684A', bd: '#00ED64', rb: '#001E2B', rd: '#001E2B' });
  glow(cl[1], T('d13b', '1225') - 0.3, T('d13b', '2449') - 0.4, { bg: '#E3FCF7', bd: '#00A35C' });
  glow(cl[2], T('d13b', '2449') - 0.3, T('d13c') - 0.1, { bg: '#E3FCF7', bd: '#00A35C' });
  glow(cl[3], T('d13c', '3124') - 0.3, T('d15') - 0.1, { bg: '#E3FCF7', bd: '#00A35C' });
  const cmpE = h('div', 'abs mono', cp, '1225 ≤ 2050 < 2449'); css(cmpE, { left: '200px', top: '356px', font: '600 28px "Mono"', color: '#00684A' });
  show(cmpE, T('d15') - 0.2, { y: 8 });
  const cp1 = svg('path', { d: 'M390,162 L296,250', stroke: '#00ED64', 'stroke-width': 6, fill: 'none' }, csv);
  draw(cp1, T('d15'), 0.7); glow(cl[1], T('d15'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const got = chip(world, 1220, 534, '2050 → 47 字节的文档', 'sp'); css(got, { fontFamily: '"Mono", "Sans SC"' });
  show(got, T('d15', '47') - 0.3, { y: 10 }); sfx('pop', T('d15', '47') - 0.3);
  sh.clear(T('d15') + 0.6);
  sh.cmd(T('d15') + 0.7, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> }).explain(…)');
  sh.out(T('d17') + 0.1, "{ <span class=\"k\">'计划'</span>: <span class=\"s\">'FETCH ← IXSCAN'</span>, <span class=\"k\">'返回'</span>: <span class=\"n\">1</span>,\n  <span class=\"k\">'看过的索引键'</span>: <span class=\"n\">1</span>, <span class=\"k\">'看过的文档'</span>: <span class=\"n\">1</span> }");
  ring(world, 1012, 780, 756, 68, T('d17') + 0.5, null, '#00A35C');
  const cmpT = callout(world, 140, 676, 'tip', '没有索引：4096 份<br>走姓名索引：1 键、1 份', '两次查找');
  show(cmpT, T('d17') + 0.2, { y: 10 });
  sfx('blip', T('d12')); sfx('pop', T('d17'));

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
