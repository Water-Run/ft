// 第 02 章 一个集合，三棵树（第 4 轮重做）。四段在同一画面里接着变：
// 一、people 集合：三份样子不同的文档放进同一个集合，字段名各带各的（集合的选项是空的）；
// 二、mongod 一个进程两层：上层收下查询、定执行计划，下层是存储引擎（内存与磁盘），名字 WiredTiger；
// 三、WiredTiger 不认识文档：一份文档成了一串字节，按键排好序，存进文件，文件里排成一棵树；
// 四、数据目录里 users 的三个文件，各是一棵树（叶页数照实测），Alice 在三棵树里各占一项。
// 事实：I05 A12（集合、people、options {}）、A04（字段名随文档存）、G00b C02（mongod、IXSCAN）、I01 I02（存储引擎、缺省 WiredTiger）、
//       A13 A03 B01（键与字节、排好序、B 树）、A06（三个 .wt 文件与文件名）、B03 B06 B07（叶页数 4、15、3）、I06（_id 索引自带）。
scene('whole', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '02 一个集合，三棵树');

  // ══ 一、集合 people（A12） ══
  const P1 = [];
  const col = h('div', 'panel gray', world); px(col, 130, 222, 1390, 520); P1.push(col);
  const colT = h('div', 'abs', col, '集合'); css(colT, { left: '34px', top: '24px', font: '700 40px "Sans SC"', color: K.ink });
  const colN = h('div', 'abs', col, 'people'); css(colN, { left: '130px', top: '26px', font: '600 38px "Mono"', color: K.forest });
  const opt = h('div', 'abs', col, '<span class="k">options</span>: {}'); css(opt, { right: '34px', top: '32px', font: '500 28px "Mono"', color: K.gd2, background: '#fff', border: '1.5px solid ' + K.gl2, borderRadius: '6px', padding: '2px 12px' });
  show(col, T('a1') - 0.1, { y: 16, d: 0.6 }); show(colT, T('a1', '集合') - 0.3, { y: 8, d: 0.4 });
  set(colN, s.start, { autoAlpha: 0 }); show(colN, T('a4', 'people') - 0.2, { x: -12, y: 0, d: 0.45 });
  show(opt, T('a3', '不规定') - 0.2, { y: 8, d: 0.45 });
  const glC = gl(world, 1560, 236, '集合', '一份份文档<br>放在一起', { cls: 'lg' }); P1.push(glC);
  show(glC, T('a1', '集合') - 0.2, { x: 16, y: 0, d: 0.5 });
  // 对照：表 ↔ 集合，行 ↔ 文档
  const map = h('div', 'abs', world); px(map, 1560, 420, 300); P1.push(map);
  map.innerHTML = `<div style="font:500 24px 'Sans SC';color:${K.gd1};margin-bottom:10px">关系数据库 → MongoDB</div>` +
    [['表', '集合'], ['行', '文档']].map(([a, b]) => `<div style="font:700 36px/1.6 'Sans SC';color:${K.ink}">${a}<span style="color:${K.gb};margin:0 18px;font-weight:500">→</span><span style="color:${K.forest}">${b}</span></div>`).join('');
  show(map, T('a2', '一张表') - 0.3, { y: 12, d: 0.5 });
  // 三份文档（A12 的回显，原样）：Alice 名字与年龄；Erin 邮箱与标签；Frank 名字与地址
  const dA = docCard(world, 160, 340, [['name', JS('Alice')], ['age', JN(42)]], { w: 300, fs: 28 });
  const dE = docCard(world, 480, 340, [['name', JS('Erin')], ['email', JS('erin@example.com')], ['tags', `[ ${JS('db')}, ${JS('go')} ]`]], { w: 500, fs: 28 });
  const dF = docCard(world, 1000, 340, [['name', JS('Frank')], ['address', `{ <span class="k">city</span>: ${JS('Lisbon')} }`]], { w: 500, fs: 26 });
  P1.push(dA.c, dE.c, dF.c);
  [dA, dE, dF].forEach((d, i) => show(d.c, T('a1', '文档') - 0.2 + i * 0.18, { y: -40, d: 0.6 }));
  glow(dA.c, T('a4b', 'Alice') - 0.2, T('a4b', 'Erin') - 0.2, { bg: K.mint, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  glow(dE.c, T('a4b', 'Erin') - 0.2, T('a6', 'Frank') - 0.3, { bg: K.mint, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  glow(dF.c, T('a6', 'Frank') - 0.2, T('a7') - 0.1, { bg: K.mint, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  [[dA, 160, 300, 198], [dE, 480, 500, 240], [dF, 1000, 500, 198]].forEach(([d, x, w, hh], i) => pt(world, x - 8, 332, w + 16, hh + 16, T('a3', '长什么样') - 0.3 + i * 0.15, T('a4b') - 0.3));
  [dA, dE, dF].forEach((d, i) => to(d.r.name, T('a4', '几种') - 0.2 + i * 0.25, { color: K.forest, duration: 0.35 }));
  [[160, 300, 198], [480, 500, 240], [1000, 500, 198]].forEach(([x, w, hh], i) => pt(world, x - 8, 332, w + 16, hh + 16, T('a7', '每份') - 0.2 + i * 0.15, T('a8') - 0.15));
  // 字段名：每一份里的键一齐亮起
  const keys = [dA, dE, dF].flatMap((d) => [...d.c.querySelectorAll('.k')]);
  to(keys, T('a7', '字段名') - 0.15, { backgroundColor: K.mint2, color: K.forest, duration: 0.4 });
  [[160, 300, 198], [480, 500, 240], [1000, 500, 198]].forEach(([x, w, hh], i) => pt(world, x - 8, 332, w + 16, hh + 16, T('a8') + i * 0.2, T('a8', '写进') - 0.5));
  // 二的开头：这些文档照样要写进文件、再找出来——三份一起落到底部的文件上
  const fileA = h('div', 'abs', world); px(fileA, 820, 820, 280, 96); css(fileA, { background: '#fff', border: '2px solid ' + K.gb, borderRadius: '10px', font: '600 30px/92px "Mono"', color: K.gd2, textAlign: 'center' });
  fileA.textContent = '文件'; P1.push(fileA);
  show(fileA, T('a8', '写进') - 0.6, { y: 12, d: 0.5 });
  [dA, dE, dF].forEach((d, i) => tl.to(d.c, { y: 820 - 340 + 10, x: 820 + 60 - [160, 480, 1000][i], scale: 0.3, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, T('a8', '写进') - 0.4 + i * 0.1));
  to(fileA, T('a8', '文件') - 0.1, { borderColor: K.g1, backgroundColor: K.mint, color: K.forest, duration: 0.4 });
  const upq = code(world, 880, 700, '{ <span class="k">name</span>: <span class="s">"Alice"</span> }'); css(upq, { fontSize: '28px' }); P1.push(upq);
  tl.fromTo(upq, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('a8b', '找') - 0.4);
  const tP1 = T('a9') - 0.35;
  fadeOut([...P1, colT, colN, opt], tP1, 0.5);

  // ══ 二、mongod：一个进程两层（G00b、C02、I01、I02） ══
  const P2 = [];
  const md = h('div', 'panel', world); px(md, 330, 230, 1260, 600); css(md, { borderWidth: '3px', borderColor: K.ink }); P2.push(md);
  const mdT = h('div', 'abs', md, '<span style="font-family:Mono">mongod</span>'); css(mdT, { left: '30px', top: '20px', font: '700 40px "Inter"', color: K.ink });
  const mdS = h('div', 'abs', md, 'MongoDB 的服务端进程'); css(mdS, { left: '220px', top: '30px', font: '500 28px "Sans SC"', color: K.gd1 });
  show(md, T('a9', '服务端') - 0.3, { y: 16, d: 0.6 }); set(mdT, s.start, { autoAlpha: 0 }); show(mdT, T('a9', 'mongod') - 0.2, { y: 8, d: 0.4 }); show(mdS, T('a9', 'mongod') + 0.1, { y: 8, d: 0.4 });
  const ovM = overlay(world);          // 连线层：在 mongod 框之上
  const up = h('div', 'abs', md); css(up, { left: '30px', top: '100px', width: '1194px', height: '200px', background: K.gl3, border: '2px solid ' + K.gl1, borderRadius: '12px' });
  const dn = h('div', 'abs', md); css(dn, { left: '30px', top: '330px', width: '1194px', height: '236px', background: K.gl3, border: '2px solid ' + K.gl1, borderRadius: '12px' });
  const upT = h('div', 'abs', up, '查询层'); css(upT, { left: '26px', top: '18px', font: '700 34px "Sans SC"', color: K.ink });
  const dnT = h('div', 'abs', dn, '存储引擎'); css(dnT, { left: '26px', top: '18px', font: '700 34px "Sans SC"', color: K.ink });
  show(up, T('a9', '两层') - 0.25, { y: 10, d: 0.45 }); show(dn, T('a9', '两层') - 0.05, { y: 10, d: 0.45 });
  set([upT, dnT], s.start, { autoAlpha: 0 });
  show(upT, T('a11', '上层') - 0.1, { y: 8, d: 0.4 }); show(dnT, T('a12', '存储') - 0.2, { y: 8, d: 0.4 });
  // 上层：收下一条查询，定下执行计划（C02 的 planSummary）
  const q = code(world, 120, 424, 'find({ <span class="k">name</span>: <span class="s">"Alice"</span> })'); css(q, { fontSize: '28px' }); P2.push(q);
  tl.fromTo(q, { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: 0.4, immediateRender: true }, T('a11', '收下') - 0.5);
  tl.to(q, { x: 270, duration: 0.7, ease: 'power2.inOut' }, T('a11', '收下') - 0.1);
  const plan = h('div', 'abs', up, '执行计划：<span style="font-family:Mono;color:#00684A;font-weight:600">IXSCAN { name: 1 }</span>'); css(plan, { left: '560px', top: '96px', font: '500 30px "Sans SC"', color: K.gd2 });
  show(plan, T('a11', '决定') - 0.2, { x: -16, y: 0, d: 0.5 });
  const planA = link(ovM, [[830, 446], [880, 446]], 'dim', { w: 2.5, arrow: true }); P2.push(planA); arrowIn(planA, T('a11', '决定') - 0.3, 0.35);
  // 下层：内存与磁盘
  const mem = h('div', 'abs', dn); css(mem, { left: '240px', top: '74px', width: '420px', height: '130px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '10px' });
  mem.innerHTML = `<div style="position:absolute;left:20px;top:34px">${ico('mem', 60, K.gd2, 2.4)}</div><div style="position:absolute;left:100px;top:42px;font:700 34px 'Sans SC';color:${K.ink}">内存</div>`;
  const dsk = h('div', 'abs', dn); css(dsk, { left: '700px', top: '74px', width: '420px', height: '130px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '10px' });
  dsk.innerHTML = `<div style="position:absolute;left:20px;top:34px">${ico('disk', 60, K.gd2, 2.4)}</div><div style="position:absolute;left:100px;top:42px;font:700 34px 'Sans SC';color:${K.ink}">磁盘</div>`;
  show(mem, T('a12', '内存') - 0.2, { y: 10, d: 0.45 }); show(dsk, T('a12', '磁盘') - 0.2, { y: 10, d: 0.45 });
  const downA = link(ovM, [[720, 530], [720, 600]], 'accent', { w: 4, arrow: true }); P2.push(downA); arrowIn(downA, T('a12', '下层') - 0.1, 0.45);
  fadeOut(q, T('a13') - 0.2, 0.4);
  const glS = gl(world, 1620, 560, '存储引擎', '管数据在内存和<br>磁盘上怎样存放', { cls: 'lg' }); P2.push(glS);
  show(glS, T('a12', '存储') - 0.2, { x: 16, y: 0, d: 0.5 });
  // 名字：WiredTiger；9.0 默认用它
  tl.to(dnT, { autoAlpha: 0, duration: 0.25 }, T('a13', 'W') - 0.35);
  swapAt(dnT, '存储引擎', '存储引擎 · <span style="color:#00684A">WiredTiger</span>', T('a13', 'W') - 0.1);
  tl.to(dnT, { autoAlpha: 1, duration: 0.35 }, T('a13', 'W') - 0.08);
  to(dn, T('a13', 'W'), { borderColor: K.g1, backgroundColor: K.mint, duration: 0.45 });
  pt(world, 352, 552, 1210, 252, T('a13') + 0.1, T('a13', 'W') - 0.2);
  const v9 = chip(dn, 820, 18, 'MongoDB 9.0 默认', 'on'); show(v9, T('a15', '默认') - 0.2, { y: 8, d: 0.45 });
  const tP2 = T('a16') - 0.4;
  fadeOut([md, glS, planA], tP2, 0.5);

  // ══ 三、WiredTiger 只认「键 → 一串字节」（A13 A03 B01） ══
  const P3 = [];
  const wt = h('div', 'panel', world); px(wt, 130, 222, 1700, 430); css(wt, { borderColor: K.g1, borderWidth: '3px' }); P3.push(wt);
  const wtT = h('div', 'abs', wt, 'WiredTiger'); css(wtT, { left: '30px', top: '20px', font: '700 40px "Inter"', color: K.forest });
  show(wt, T('a16') - 0.15, { y: 0, d: 0.5 });
  const ovW = overlay(world);          // 连线层：在 WiredTiger 框之上
  // 一份文档进来，变成一串字节（不认识文档）
  const dIn = docCard(world, 200, 320, [['name', JS('Alice')], ['age', JN(42)]], { w: 360, fs: 34 }); P3.push(dIn);
  show(dIn.c, T('a16') + 0.1, { x: -40, y: 0, d: 0.5 });
  const bytes = h('div', 'abs mono', world, '2f000000 07 5f696400 6afa… 02 …'); px(bytes, 200, 370); css(bytes, { font: '500 38px "Mono"', color: K.gd2, background: K.gl3, border: '2px dashed ' + K.gb, borderRadius: '8px', padding: '14px 20px' }); P3.push(bytes);
  tl.to(dIn.c, { autoAlpha: 0, scaleX: 1.4, scaleY: 0.4, duration: 0.45, ease: 'power2.in' }, T('a16', '不认识') - 0.1);
  tl.fromTo(bytes, { autoAlpha: 0, scaleX: 0.5 }, { autoAlpha: 1, scaleX: 1, duration: 0.5, ease: 'power2.out', immediateRender: true }, T('a16', '不认识') + 0.25);
  // 一项一项的键和值：键是一个数，值是一串字节（2050 是 Alice，其余是别人的 92 字节）
  const KV = [['2051', '5c000000 07 5f696400 6afa…'], ['2049', '5c000000 07 5f696400 6afa…'], ['2050', '2f000000 07 5f696400 6afa…']];
  const KX = 200, KY0 = 318, KRH = 84;
  const head2 = h('div', 'abs', world); px(head2, KX, KY0 - 2, 1100, 48); css(head2, { font: '700 30px "Sans SC"', color: K.gd1 }); P3.push(head2);
  head2.innerHTML = `<span style="position:absolute;left:20px">键</span><span style="position:absolute;left:230px">值（一串字节）</span>`;
  const kvRows = KV.map(([k, v], i) => {
    const r = h('div', 'abs', world); px(r, KX, KY0 + 50 + i * KRH, 1100, 70); css(r, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '8px' }); P3.push(r);
    const kk = h('div', 'abs', r, k); css(kk, { left: '20px', top: '12px', font: '700 36px "Mono"', color: K.ink });
    const vv = h('div', 'abs', r, v); css(vv, { left: '230px', top: '14px', font: '500 32px "Mono"', color: K.gd2 });
    return { r, kk, vv };
  });
  fadeOut(bytes, T('a17', '一项') - 0.4, 0.35);
  show(head2, T('a17', '键') - 0.5, { y: 8, d: 0.4 });
  kvRows.forEach((o, i) => show(o.r, T('a17', '一项') - 0.2 + i * 0.15, { x: -30, y: 0, d: 0.45 }));
  // 值：它不过问（value_format=u，不解释的字节串）
  const vRing = h('div', 'abs', world); px(vRing, KX + 210, KY0 + 40, 890, 3 * KRH + 8); css(vRing, { border: '3px dashed ' + K.g1, borderRadius: '10px' }); vRing.dataset.name = 'vring'; P3.push(vRing);
  show(vRing, T('a18', '一串字节') - 0.2, { y: 0, s: 1.02, d: 0.45 });
  const vfmt = tg(world, KX + 1140, KY0 + 130, '<span style="font-family:Mono">value_format=u</span><br>不解释的字节串', 'b'); css(vfmt, { lineHeight: '1.5', fontSize: '28px' }); P3.push(vfmt);
  show(vfmt, T('a18', '不过问') - 0.3, { x: 14, y: 0, d: 0.45 });
  pt(world, KX - 8, KY0 + 42, 200, 3 * KRH + 12, Tend('a18') + 0.1, T('a19', '排好序') - 0.4);
  // 按键排好序：2051 那一行挪到最后
  const tSort = T('a19', '排好序') - 0.35;
  to(kvRows[0].r, tSort, { y: 2 * KRH, duration: 0.7, ease: 'power2.inOut' });
  to([kvRows[1].r, kvRows[2].r], tSort, { y: -KRH, duration: 0.7, ease: 'power2.inOut' });
  fadeOut([vRing, vfmt], tSort - 0.1, 0.35);
  // 存进数据目录里的文件；文件里排成一棵树（B01），找的时候从根往下走
  const dir = h('div', 'panel gray', world); px(dir, 130, 680, 1700, 250); P3.push(dir);
  const dirT = h('div', 'abs', dir, 'db/'); css(dirT, { left: '30px', top: '22px', font: '600 32px "Mono"', color: K.gd2 });
  show(dir, T('a19', '数据目录') - 0.4, { y: 16, d: 0.5 });
  const f1 = h('div', 'abs', dir, 'collection-ccaa…41d.wt'); css(f1, { left: '30px', top: '84px', padding: '12px 22px', background: '#fff', border: '2px solid ' + K.gb, borderRadius: '10px', font: '600 30px "Mono"', color: K.ink });
  show(f1, T('a19', '文件') - 0.3, { y: 10, d: 0.45 });
  tl.to(kvRows.map((o) => o.r), { y: '+=380', scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'power2.in', stagger: 0.06 }, T('a19', '文件') - 0.1);
  fadeOut(head2, T('a19', '文件') - 0.1, 0.4);
  // 文件里是一棵树：根页 + 叶页，找的路线从根往下
  const tr = treeView(world, ovW, { x: 700, y: 300, w: 900, root: { w: 200, h: 56, txt: '根页' }, leaves: [{ txt: '叶页' }, { txt: '叶页' }, { txt: '叶页' }, { txt: '叶页' }], lw: 190, lh: 150, dy: 110 });
  P3.push(...tr.all, ...tr.links);
  showTree(tr, T('a20', '一棵树') - 0.4);
  const tLin = link(ovW, [[420, 764], [700, 520]], 'dim', { w: 2, dashed: '6 6' }); P3.push(tLin);
  arrowIn(tLin, T('a20', '一棵树') - 0.3, 0.5);
  const path = link(ovW, [[tr.cx, 300 + 56], [tr.lx(1) + 95, tr.ly]], 'spring', { w: 7 }); P3.push(path);
  draw(path, T('a20', '不用') - 0.3, 0.5);
  to(tr.leaves[1].c, T('a20', '不用'), { borderColor: K.g1, duration: 0.3 }); to(tr.leaves[1].head, T('a20', '不用'), { backgroundColor: K.mint, color: K.forest, duration: 0.3 });
  const tP3 = T('a21') - 0.4;
  fadeOut([wt, ...tr.all, tLin, path, ...tr.links], tP3, 0.5);
  tl.to(dir, { y: 222 - 680, height: 220, duration: 0.8, ease: 'power2.inOut' }, tP3 + 0.1);

  // ══ 四、users：三个文件，三棵树（A06、B03 B06 B07） ══
  const ov4 = overlay(world);          // 连线层：在数据目录底板之上
  // 文件名与标签（A06 的回显）
  const FL = [['collection-ccaa…41d.wt', 'users 集合'], ['index-2f32…ed9.wt', '_id 索引（_id_）'], ['index-adff…ed7.wt', '姓名索引（name_1）']];
  const fileEls = FL.map(([n, t], i) => {
    const e = h('div', 'abs', world); px(e, 160 + i * 560, 300, 520, 116); css(e, { background: '#fff', border: '2px solid ' + K.gb, borderRadius: '10px' });
    const a = h('div', 'abs', e, n); css(a, { left: '20px', top: '14px', font: '600 28px "Mono"', color: K.ink });
    const b = h('div', 'abs', e, t); css(b, { left: '20px', top: '62px', font: '700 30px "Sans SC"', color: K.forest });
    return { e, a, b };
  });
  fadeOut(f1, tP3 + 0.1, 0.3);
  show(fileEls[0].e, T('a21', 'users') - 0.3, { y: 12, d: 0.5 });
  show(fileEls[1].e, T('a21', '两个') - 0.1, { y: 12, d: 0.5 }); show(fileEls[2].e, T('a21', '两个') + 0.15, { y: 12, d: 0.5 });
  fileEls.forEach((o, i) => pt(world, 152 + i * 560, 292, 536, 132, T('a21b', '各占') - 0.2 + i * 0.25, T('a22') - 0.2));
  pt(world, 712, 292, 536, 132, T('a23', '集合') - 0.2, T('a24') - 0.1);
  pt(world, 1272, 292, 536, 132, T('a24', '名字') - 0.2, T('a24', '建了') - 0.4);
  // 三棵树：叶页数照实测（集合 4、_id 3、姓名 15）
  function mini(i, n, lab) {
    const x0 = 160 + i * 560, W = 520, y0 = 520;
    const r = h('div', 'rootpg', world, '根页'); px(r, x0 + W / 2 - 70, y0, 140, 48); css(r, { fontSize: '22px' });
    const lw = n > 8 ? (W - (n - 1) * 6) / n : (W - (n - 1) * 18) / n, gap = n > 8 ? 6 : 18;
    const lvs = [], lks = [];
    for (let k = 0; k < n; k++) {
      const lx = x0 + k * (lw + gap);
      const l = h('div', 'abs', world); px(l, lx, y0 + 140, lw, 150); css(l, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '6px' });
      for (let j = 0; j < 6; j++) { const ln = h('div', 'abs', l); css(ln, { left: '5px', right: '5px', top: 12 + j * 22 + 'px', height: '8px', background: K.gl2, borderRadius: '3px' }); }
      lvs.push(l);
      const p = link(ov4, [[x0 + W / 2, y0 + 48], [lx + lw / 2, y0 + 140]], 'ink', { w: n > 8 ? 1.5 : 2 }); lks.push(p);
    }
    const t = tg(world, x0, y0 + 310, lab, 'b'); css(t, { fontSize: '30px' });
    return { r, lvs, lks, t, x0, W, y0, lw, gap };
  }
  const TR3 = [mini(0, 4, '集合树 · 4 个叶页'), mini(1, 3, '_id 索引 · 3 个叶页'), mini(2, 15, '姓名索引 · 15 个叶页')];
  const tTree = [T('a22', '集合树') - 0.4, T('a23', '索引') - 0.4, T('a24', '建了') - 0.4];
  TR3.forEach((m, i) => {
    show(m.r, tTree[i], { y: 10, d: 0.45 });
    m.lvs.forEach((l, k) => show(l, tTree[i] + 0.2 + k * (m.lvs.length > 8 ? 0.03 : 0.08), { y: 12, d: 0.4 }));
    m.lks.forEach((p, k) => draw(p, tTree[i] + 0.25 + k * 0.02, 0.5));
    show(m.t, tTree[i] + 0.4, { y: 8, d: 0.4 });
    const lnk = link(ov4, [[m.x0 + m.W / 2, 416], [m.x0 + m.W / 2, 520]], 'dim', { w: 2, dashed: '6 6' }); arrowIn(lnk, tTree[i] - 0.2, 0.4);
    to(fileEls[i].e, tTree[i], { borderColor: K.g1, duration: 0.4 });
  });
  // 索引：注解贴在 _id 那棵树下面
  const glIdx = gl(world, 720, 880, '索引', '按某个字段排好序的另一棵树');
  css(glIdx, { padding: '0 0 0 16px' }); css(glIdx.querySelector('b'), { display: 'inline', fontSize: '28px', marginRight: '14px' }); css(glIdx.querySelector('span'), { display: 'inline', fontSize: '26px' });
  show(glIdx, T('a23', '索引') - 0.1, { y: 8, d: 0.45 });
  fadeOut(TR3[1].t, T('a23', '索引') - 0.15, 0.3);
  const ci = code(world, 1280, 880, 'db.users.createIndex({ <span class="k">name</span>: <span class="n">1</span> })'); css(ci, { fontSize: '24px' });
  show(ci, T('a24', '建了') - 0.2, { y: 8, d: 0.45 });
  fadeOut(TR3[2].t, T('a24', '建了') - 0.25, 0.3);
  // Alice 在三棵树里各占一项：集合树第 2 个叶页、_id 索引某一页、姓名索引第 1 页（B05 B06）
  const tA = T('a25', '三棵') - 0.3;
  const dots = [[0, 1], [1, 1], [2, 0]].map(([i, k], j) => {
    const m = TR3[i], l = m.lvs[k];
    const d = h('div', 'abs', world); px(d, m.x0 + k * (m.lw + m.gap) + m.lw / 2 - 14, m.y0 + 140 + 58, 28, 28); css(d, { borderRadius: '50%', background: K.spring, border: '3px solid ' + K.forest });
    show(d, tA + j * 0.35, { y: 0, s: 0.3, d: 0.4 }); to(l, tA + j * 0.25, { borderColor: K.g1, duration: 0.3 });
    return d;
  });
  [[0, 1], [1, 1], [2, 0]].forEach(([i, k], j) => { const m = TR3[i]; pt(world, m.x0 + k * (m.lw + m.gap) - 8, m.y0 + 132, m.lw + 16, 166, T('a26', '看起') - 0.3 + j * 0.2, s.end - 0.2); });
  beat(world, T('a2', '关系') - 0.1, 1552, 412, 320, 160);
  beat(world, T('a12', '存放') - 0.1, 352, 552, 1210, 252, 1.0, K.gb);
  beat(world, T('a9', 'mongod') - 0.1, 330, 230, 1260, 80, 1.0);
  beat(world, T('a9', '两层') - 0.1, 352, 322, 1210, 500, 1.0, K.gb);
  beat(world, T('a11', '上层') - 0.1, 352, 322, 1210, 212, 1.0);
  beat(world, T('a22', '集合树') - 0.1, 150, 510, 540, 330, 1.2);
  beat(world, T('a3', '集合') - 0.1, 130, 222, 1390, 70, 1.3, K.gb);
  beat(world, T('a4', '几种') - 0.1, 150, 330, 1360, 260, 1.2);
  beat(world, T('a4b', 'Alice') - 0.1, 152, 332, 316, 214);
  beat(world, T('a4b', 'Erin') - 0.1, 472, 332, 516, 256, 1.6);
  beat(world, T('a6', 'Frank') - 0.1, 992, 332, 516, 214, 1.6);
  beat(world, T('a12', '管') - 0.1, 560, 630, 900, 150, 1.4);
  beat(world, T('a15', '默认') - 0.2, 352, 552, 1210, 252, 1.4);
  beat(world, Tend('a16') + 0.1, 192, 362, 900, 80, 1.4, K.gb);
  beat(world, T('a18', '里面') - 0.1, KX + 210, KY0 + 40, 890, 3 * KRH + 8, 1.4);
  [[0, 1], [1, 1], [2, 0]].forEach(([i, k], j) => { const m = TR3[i]; beat(world, T('a25', '各占') - 0.1 + j * 0.1, m.x0 + k * (m.lw + m.gap) - 6, m.y0 + 134, m.lw + 12, 162, 1.4); });
  // 从她注册的那一刻看起：别的叶页淡下去，只留 Alice 那三页
  TR3.forEach((m, i) => m.lvs.forEach((l, k) => { if (!((i === 0 && k === 1) || (i === 1 && k === 1) || (i === 2 && k === 0))) to(l, T('a26', '注册') - 0.2, { opacity: 0.3, duration: 0.5 }); }));
});
