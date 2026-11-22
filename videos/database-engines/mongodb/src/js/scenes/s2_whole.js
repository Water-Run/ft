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
  const opt = h('div', 'abs', col, '<span class="k">options</span>: {}'); css(opt, { right: '34px', top: '28px', font: '600 28px "Mono"', color: '#FFFFFF', background: K.ink, border: '1.5px solid ' + K.ink, borderRadius: '6px', padding: '2px 12px' });
  show(col, T('a1') - 0.1, { y: 16, d: 0.6 }); show(colT, T('a1', '集合') - 0.3, { y: 8, d: 0.4 });
  css(colT, { background: K.forest, color: '#FFFFFF', padding: '0 16px', borderRadius: '10px', lineHeight: '56px', top: '18px' }); css(colN, { left: '150px' });
  set(colN, s.start, { autoAlpha: 0 }); show(colN, T('a4') - 0.1, { x: -12, y: 0, d: 0.45 });
  css(colN, { background: K.ink, color: '#FFFFFF', padding: '0 22px', borderRadius: '10px', lineHeight: '60px', top: '16px', fontSize: '40px' });
  css(opt.querySelector('.k'), { color: K.spring });
  show(opt, T('a3', '不规定') - 0.2, { y: 8, d: 0.45 }); to(col, T('a3', '默认') - 0.2, { backgroundColor: K.mint, duration: 0.45 });
  const noVal = tg(col, 1094, 84, '没有校验规则', 'b'); css(noVal, { fontSize: '38px', color: '#FFFFFF', background: K.yeld, padding: '0 40px', borderRadius: '12px', lineHeight: '70px', left: '640px', top: '10px' });
  show(noVal, T('a3', '长什么样') - 0.25, { y: 8, d: 0.4 });
  const glC = gl(world, 1560, 236, '集合', '不用事先创建：<br>第一次往里存文档，<br>集合就自动建出来', { cls: 'lg' }); P1.push(glC);   // I05
  show(glC, T('a1', '集合') - 0.2, { x: 16, y: 0, d: 0.5 });
  // 对照：表 ↔ 集合，行 ↔ 文档
  const map = h('div', 'abs', world); px(map, 1560, 420, 300); css(map, { background: K.ink, borderRadius: '14px', padding: '18px 22px' }); P1.push(map);
  map.innerHTML = `<div style="font:500 24px 'Sans SC';color:#C1C7C6;margin-bottom:10px">关系数据库 → MongoDB</div>` +
    [['表', '集合'], ['行', '文档']].map(([a, b]) => `<div style="font:700 36px/1.6 'Sans SC';color:#FFFFFF">${a}<span style="color:${K.gb};margin:0 18px;font-weight:500">→</span><span style="color:${K.spring}">${b}</span></div>`).join('');
  set(map.children[2], s.start, { autoAlpha: 0 }); show(map.children[2], T('a2', '一张表') - 0.3, { y: 8, d: 0.4 });
  show(map, T('a2', '一张表') - 0.5, { y: 12, d: 0.5 });

  // 三份文档（A12 的回显，原样）：Alice 名字与年龄；Erin 邮箱与标签；Frank 名字与地址
  const dA = docCard(world, 150, 340, [['name', JS('Alice')], ['age', JN(42)]], { w: 330, fs: 26 });
  const dE = docCard(world, 496, 340, [['name', JS('Erin')], ['email', JS('erin@example.com')], ['tags', `[ ${JS('db')}, ${JS('go')} ]`]], { w: 500, fs: 24 });
  const dF = docCard(world, 1010, 340, [['name', JS('Frank')], ['address', `{ <span class="k">city</span>: ${JS('Lisbon')} }`]], { w: 496, fs: 23 });
  P1.push(dA.c, dE.c, dF.c);
  [dA, dE, dF].forEach((d, i) => show(d.c, T('a1', '文档') - 0.2 + i * 0.18, { y: -40, d: 0.6 }));
  glow(dA.c, T('a4b', 'Alice') - 0.2, T('a4b', 'Erin') - 0.2, { bg: K.mint2, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  glow(dE.c, T('a4b', 'Erin') - 0.2, T('a6', 'Frank') - 0.3, { bg: K.mint2, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  glow(dF.c, T('a6', 'Frank') - 0.2, T('a7') - 0.1, { bg: K.mint2, bd: K.g1, rb: '#FFFFFF', rd: K.gl1 });
  [dA, dE, dF].forEach((d) => { to(d.c, T('a3', '不规定') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); });
  [dE, dF].forEach((d) => to(d.c, T('a4b', 'Alice') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.4 }));
  solid(dA.r.age, T('a4b', '年龄') - 0.2, 'new', [T('a4b', 'Erin') - 0.2, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...dA.r.age.querySelectorAll('span')], T('a4b', '年龄') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to([...dA.r.age.querySelectorAll('span')], T('a4b', 'Erin') - 0.2, { clearProps: 'color', duration: 0.01 });
  solid(dE.r.email, T('a4b', '邮箱') - 0.2, 'new', [T('a7') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...dE.r.email.querySelectorAll('span')], T('a4b', '邮箱') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to([...dE.r.email.querySelectorAll('span')], T('a7') - 0.1, { clearProps: 'color', duration: 0.01 });
  solid(dE.r.tags, T('a4b', '标签') - 0.2, 'new', [T('a7') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...dE.r.tags.querySelectorAll('span')], T('a4b', '标签') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to([...dE.r.tags.querySelectorAll('span')], T('a7') - 0.1, { clearProps: 'color', duration: 0.01 });
  solid(dF.r.address, T('a6', '地址') - 0.2, 'new', [T('a7') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...dF.r.address.querySelectorAll('span')], T('a6', '地址') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to([...dF.r.address.querySelectorAll('span')], T('a7') - 0.1, { clearProps: 'color', duration: 0.01 });
  [dA, dE, dF].forEach((d, i) => { const t = T('a4', 'people') - 0.2 + i * 0.2; solid(d.r.name, t, 'new', [T('a4b') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...d.r.name.querySelectorAll('span')], t, { color: '#FFFFFF', duration: 0.35 }); to([...d.r.name.querySelectorAll('span')], T('a4b') - 0.1, { clearProps: 'color', duration: 0.01 }); });
  // 字段名：每一份里的键一齐亮起
  const keys = [dA, dE, dF].flatMap((d) => [...d.c.querySelectorAll('.k')]);
  [dA, dE, dF].forEach((d, i) => to([...d.c.querySelectorAll('.k')], [T('a7', '字段名'), T('a7', '每份'), T('a7', '各带')][i] - 0.15, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.4 }));
  const STR = [[150, 552, [['name', 5], ['age', 4]]], [496, 594, [['name', 5], ['email', 16], ['tags', 9]]], [1000, 552, [['name', 5], ['address', 10]]]].map((r, i) => (i === 2 ? [1010, r[1], r[2]] : r));
  const vSegs = [];
  const strips = STR.map(([x, y, fl], i) => { const g = h('div', 'abs', world); px(g, x, y, 480, 44); let cx = 0;
    fl.forEach(([k, n]) => { const a = h('div', 'abs', g); px(a, cx, 0, k.length * 9 + 8, 44); css(a, { background: K.forest, borderRadius: '4px' }); cx += k.length * 9 + 11; const b = h('div', 'abs', g); vSegs.push(b); px(b, cx, 0, n * 7, 44); css(b, { background: K.gl2, borderRadius: '4px' }); cx += n * 7 + 6; });
    show(g, [T('a7', '字段名'), T('a7', '每份'), T('a7', '各带')][i] + 0.1, { y: -8, d: 0.4 }); return g; });
  P1.push(...strips); fadeOut(strips, T('a8', '写进') - 0.6, 0.35);
  to(vSegs, T('a8') - 0.2, { backgroundColor: K.gd2, duration: 0.4 });
  to(keys, T('a8') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', color: K.blued, duration: 0.4 });   // lint-ok: 取消高亮
  [dA, dE, dF].forEach((d) => to(d.r.name, T('a8') - 0.2, { color: K.ink, duration: 0.4 }));
  // 二的开头：这些文档照样要写进文件、再找出来——三份一起落到底部的文件上
  const fileA = h('div', 'abs', world); px(fileA, 820, 820, 280, 96); css(fileA, { background: '#fff', border: '2px solid ' + K.gb, borderRadius: '10px', font: '600 30px/92px "Mono"', color: K.gd2, textAlign: 'center' });
  fileA.textContent = '文件'; P1.push(fileA);
  show(fileA, T('a8', '写进') - 0.6, { y: 12, d: 0.5 });
  [dA, dE, dF].forEach((d, i) => tl.to(d.c, { y: 820 - 340 + 10, x: 820 + 60 - [150, 496, 1010][i], scale: 0.3, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, T('a8', '写进') - 0.4 + i * 0.1));
  to(fileA, T('a8', '文件') - 0.1, { borderColor: K.g1, backgroundColor: K.mint, color: K.forest, duration: 0.4 });
  const upq = code(world, 880, 700, '{ <span class="k">name</span>: <span class="s">"Alice"</span> }'); css(upq, { fontSize: '28px' }); P1.push(upq);
  tl.fromTo(upq, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('a8b', '找') - 0.4);
  const tP1 = T('a9') - 0.35;
  fadeOut([...P1, colT, colN, opt], tP1, 0.5);

  // ══ 二、mongod：一个进程两层（G00b、C02、I01、I02） ══
  const P2 = [];
  const md = h('div', 'panel', world); px(md, 330, 230, 1260, 600); css(md, { borderWidth: '3px', borderColor: K.ink }); P2.push(md);
  const mdT = h('div', 'abs', md, '<span style="font-family:Mono">mongod</span>'); css(mdT, { left: '24px', top: '16px', font: '700 40px/60px "Inter"', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '0 16px' });
  const mdS = h('div', 'abs', md, 'mongo + d：d 是 daemon，一直在后台跑、处理数据请求的进程'); css(mdS, { left: '220px', top: '30px', font: '500 28px "Sans SC"', color: K.gd1 });   // C10
  show(md, T('a9', '服务端') - 0.3, { y: 16, d: 0.6 }); set(mdT, s.start, { autoAlpha: 0 }); show(mdT, T('a9', 'mongod') - 0.2, { y: 8, d: 0.4 }); show(mdS, T('a9', '服务端') - 0.1, { y: 8, d: 0.4 });
  const ovM = overlay(world);          // 连线层：在 mongod 框之上
  const up = h('div', 'abs', md); css(up, { left: '30px', top: '100px', width: '1194px', height: '200px', background: K.gl3, border: '2px solid ' + K.gl1, borderRadius: '12px' });
  const dn = h('div', 'abs', md); css(dn, { left: '30px', top: '330px', width: '1194px', height: '236px', background: K.gl3, border: '2px solid ' + K.gl1, borderRadius: '12px' });
  const upT = h('div', 'abs', up, '查询层'); css(upT, { left: '26px', top: '18px', font: '700 34px "Sans SC"', color: K.ink });
  const dnT = h('div', 'abs', dn, '存储引擎'); css(dnT, { left: '26px', top: '18px', font: '700 34px "Sans SC"', color: K.ink });
  show(up, T('a9', '两层') - 0.25, { y: 10, d: 0.45 }); show(dn, T('a9', '两层') - 0.05, { y: 10, d: 0.45 });
  set([upT, dnT], s.start, { autoAlpha: 0 });
  show(upT, T('a11', '上层') - 0.1, { y: 8, d: 0.4 });
  to(up, T('a11', '上层') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); to(up, T('a12') - 0.1, { backgroundColor: K.gl3, borderColor: K.gl1, duration: 0.4 });
  to(dn, T('a12', '下层') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); show(dnT, T('a12', '存储') - 0.2, { y: 8, d: 0.4 });
  // 上层：收下一条查询，定下执行计划（C02 的 planSummary）
  const q = code(world, 120, 424, 'find({ <span class="k">name</span>: <span class="s">"Alice"</span> })'); css(q, { fontSize: '28px' }); P2.push(q);
  tl.fromTo(q, { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: 0.4, immediateRender: true }, T('a11', '收下') - 0.5);
  tl.to(q, { x: 270, duration: 0.7, ease: 'power2.inOut' }, T('a11', '收下') - 0.1);
  const plan = h('div', 'abs', up, '执行计划：<span style="color:#00684A;font-weight:700">用不用索引、怎么找</span>'); css(plan, { left: '560px', top: '96px', font: '500 30px "Sans SC"', color: K.gd2 });
  show(plan, T('a11', '决定') - 0.2, { x: -16, y: 0, d: 0.5 });
  const planA = link(ovM, [[830, 446], [880, 446]], 'dim', { w: 2.5, arrow: true }); P2.push(planA); arrowIn(planA, T('a11', '决定') - 0.3, 0.35);
  // 下层：内存与磁盘
  const mem = h('div', 'abs', dn); css(mem, { left: '240px', top: '74px', width: '420px', height: '130px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '10px' });
  mem.innerHTML = `<div style="position:absolute;left:20px;top:34px">${ico('mem', 60, K.gd2, 2.4)}</div><div style="position:absolute;left:100px;top:42px;font:700 34px 'Sans SC';color:${K.ink}">内存</div>`;
  const dsk = h('div', 'abs', dn); css(dsk, { left: '700px', top: '74px', width: '420px', height: '130px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '10px' });
  dsk.innerHTML = `<div style="position:absolute;left:20px;top:34px">${ico('disk', 60, K.gd2, 2.4)}</div><div style="position:absolute;left:100px;top:42px;font:700 34px 'Sans SC';color:${K.ink}">磁盘</div>`;
  show(mem, T('a12', '内存') - 0.2, { y: 10, d: 0.45 }); show(dsk, T('a12', '磁盘') - 0.2, { y: 10, d: 0.45 });
  const downA = link(ovM, [[1500, 532], [1500, 558]], 'accent', { w: 4, arrow: true }); P2.push(downA); arrowIn(downA, T('a12', '下层') - 0.1, 0.45);
  fadeOut([q, planA], T('a13') - 0.2, 0.4);
  const glS = gl(world, 1592, 560, '存储引擎', '这一集后面的文件、<br>缓存、检查点、日志、<br>谁等谁，都归它管'); P2.push(glS); css(glS.querySelector('span'), { fontSize: '24px' });
  // a12b 就和 MySQL 一样：InnoDB、MyISAM 都是 MySQL 的存储引擎（本系列 PART 1、2）
  const my = h('div', 'panel', world); px(my, 62, 540, 250, 290); P2.push(my);
  my.innerHTML = `<div style="position:absolute;left:22px;top:16px;font:700 36px Inter;color:${K.ink}">MySQL</div>` +
    `<div style="position:absolute;left:22px;top:66px;font:600 24px 'Sans SC';color:${K.gd1}">它的存储引擎</div>`;
  const myE = ['InnoDB', 'MyISAM'].map((n, i) => { const e = h('div', 'abs', my, n); css(e, { left: '22px', top: 108 + i * 62 + 'px', font: '700 30px/50px "Inter"', color: '#FFFFFF', background: K.ink, borderRadius: '8px', padding: '0 16px' }); return e; });
  const myP = h('div', 'abs', my, 'PART 1 · PART 2'); css(myP, { left: '22px', top: '238px', font: '500 22px "Mono"', color: K.gd1 });
  const myL = link(ovM, [[314, 690], [358, 690]], 'dim', { w: 2.5, dashed: '6 6' }); P2.push(myL);
  show(my, T('a12b', 'My') - 0.35, { x: -24, y: 0, d: 0.5 });
  myE.forEach((e, i) => show(e, T('a12b', 'My') + 0.1 + i * 0.25, { x: -12, y: 0, d: 0.4 }));
  show(myP, T('a12b', '一样') - 0.1, { y: 6, d: 0.4 }); arrowIn(myL, T('a12b', '一样') - 0.2, 0.4);
  to(dnT, T('a12b', '一样') - 0.1, { color: K.forest, duration: 0.35 });
  show(glS, T('a12', '存储') - 0.2, { x: 16, y: 0, d: 0.5 });
  // a13 WiredTiger：同一条注解换成它的来历（I03）
  textAt(glS, [[0, glS.innerHTML], [T('a13', 'W') - 0.2, '<b>WiredTiger</b><span style="font-size:24px">原是另一家公司的<br>引擎；2014 年<br>MongoDB 把这家<br>公司收购了</span>']]);
  // 名字：WiredTiger；9.0 默认用它
  res(dn, 190, 6, 'WiredTiger', 'new', T('a13', 'W') - 0.15, { fs: 38, lh: 62 });
  to(up, T('a12', '存储') - 0.2, { opacity: 0.5, duration: 0.45 });
  to(dn, T('a13', '存储') - 0.2, { borderColor: K.g1, backgroundColor: '#A6F4C9', duration: 0.45 });
  const v9 = h('div', 'abs', dn, '');
  to([mem, dsk], T('a15', '默认') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 });
  const tP2 = T('a16') - 0.4;
  fadeOut([md, glS, planA, downA, my, myL], tP2, 0.5);

  // ══ 三、WiredTiger 只认「键 → 一串字节」（A13 A03 B01） ══
  const P3 = [];
  const wt = h('div', 'panel', world); px(wt, 130, 222, 1700, 430); css(wt, { borderColor: K.g1, borderWidth: '3px' }); P3.push(wt);
  const wtT = h('div', 'abs', wt, 'WiredTiger'); css(wtT, { left: '30px', top: '20px', font: '700 40px "Inter"', color: K.forest });
  show(wt, T('a16') - 0.15, { y: 0, d: 0.5 });
  const ovW = overlay(world);          // 连线层：在 WiredTiger 框之上
  // 一份文档进来，变成一串字节（不认识文档）
  const dIn = docCard(world, 200, 320, [['name', JS('Alice')], ['age', JN(42)]], { w: 400, fs: 34 }); P3.push(dIn);
  show(dIn.c, T('a16') + 0.1, { x: -40, y: 0, d: 0.5 });
  const bytes = h('div', 'abs mono', world, '2f000000 07 5f696400 6afa… 02 …'); px(bytes, 200, 370); css(bytes, { font: '500 38px "Mono"', color: K.spring, background: K.ink, border: '2px solid ' + K.ink, borderRadius: '8px', padding: '14px 20px' }); P3.push(bytes);
  tl.to(dIn.c, { autoAlpha: 0, scaleX: 1.4, scaleY: 0.4, duration: 0.45, ease: 'power2.in' }, T('a16', '不认识') - 0.1);
  tl.fromTo(bytes, { autoAlpha: 0, scaleX: 0.5 }, { autoAlpha: 1, scaleX: 1, duration: 0.5, ease: 'power2.out', immediateRender: true }, T('a16', '不认识') + 0.25);
  // 一项一项的键和值：键是一个数，值是一串字节（2050 是 Alice，其余是别人的 92 字节）
  const KV = [['2051', '5c000000 07 5f696400 6afa…'], ['2049', '5c000000 07 5f696400 6afa…'], ['2050', '2f000000 07 5f696400 6afa…']];
  const KX = 200, KY0 = 318, KRH = 84;
  const head2 = h('div', 'abs', world); px(head2, KX, KY0 - 2, 1100, 48); css(head2, { font: '700 30px "Sans SC"', color: K.gd1 }); P3.push(head2);
  head2.innerHTML = `<span style="position:absolute;left:20px">键</span><span style="position:absolute;left:230px">值（一串字节）</span>`;
  const kvRows = KV.map(([k, v], i) => {
    const r = h('div', 'abs', world); px(r, KX, KY0 + 50 + i * KRH, 1100, 70); css(r, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '8px' }); P3.push(r);
    const kk = h('div', 'abs', r, k); css(kk, { left: '12px', top: '8px', font: '700 36px/52px "Mono"', color: '#FFFFFF', background: K.ink, borderRadius: '6px', padding: '0 12px' });
    const vv = h('div', 'abs', r, v); css(vv, { left: '230px', top: '14px', font: '500 32px "Mono"', color: K.gd2 });
    return { r, kk, vv };
  });
  fadeOut(bytes, T('a17', '一项') - 0.4, 0.35);
  show(head2, T('a17', '键') - 0.5, { y: 8, d: 0.4 });
  kvRows.forEach((o, i) => show(o.r, T('a17', '一项') - 0.2 + i * 0.15, { x: -30, y: 0, d: 0.45 }));
  // 值：它不过问（value_format=u，不解释的字节串）
  const vRing = h('div', 'abs', world); px(vRing, KX + 210, KY0 + 40, 890, 3 * KRH + 8); css(vRing, { border: '3px dashed ' + K.g1, borderRadius: '10px' }); vRing.dataset.name = 'vring'; P3.push(vRing);
  show(vRing, T('a18', '一串字节') - 0.2, { y: 0, s: 1.02, d: 0.45 });
  kvRows.forEach((o, i) => to(o.r, T('a18', '一串字节') - 0.2 + i * 0.1, { backgroundColor: K.gl2, duration: 0.4 }));
  const vfmt = tg(world, KX + 1140, KY0 + 130, '<span style="font-family:Mono">value_format=u</span><br>不解释的字节串', 'b'); css(vfmt, { lineHeight: '1.5', fontSize: '28px', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '10px 18px' }); P3.push(vfmt);
  show(vfmt, T('a18', '里面') - 0.2, { x: 14, y: 0, d: 0.45 });
  kvRows.forEach((o, i) => to(o.r, T('a18', '不过问') - 0.2 + i * 0.08, { backgroundColor: '#D3DAD8', duration: 0.4 }));
  kvRows.forEach((o) => to(o.r, T('a19') - 0.1, { backgroundColor: '#FFFFFF', duration: 0.4 }));
  to(kvRows.map((o) => o.vv), T('a19') + 0.35, { color: K.gd1, duration: 0.5 });
  // 按键排好序：2051 那一行挪到最后
  const tSort = T('a19', '排好序') - 0.35;
  to(kvRows[0].r, tSort, { y: 2 * KRH, duration: 0.7, ease: 'power2.inOut' });
  to([kvRows[1].r, kvRows[2].r], tSort, { y: -KRH, duration: 0.7, ease: 'power2.inOut' });
  fadeOut([vRing, vfmt], tSort - 0.1, 0.35);
  // 存进数据目录里的文件；文件里排成一棵树（B01），找的时候从根往下走
  const dir = h('div', 'panel gray', world); px(dir, 130, 680, 1700, 250); P3.push(dir);
  const dirT = h('div', 'abs', dir, 'db/'); css(dirT, { left: '30px', top: '22px', font: '600 32px "Mono"', color: K.gd2 });
  const dirG = tg(dir, 110, 28, '数据目录：mongod 存放数据文件的地方，由 dbPath 指定', 'm'); css(dirG, { fontSize: '24px', color: K.gd1 });   // A19
  set(dirG, s.start, { autoAlpha: 0 }); show(dirG, T('a19', '数据目录') - 0.1, { x: 10, y: 0, d: 0.4 }); fadeOut(dirG, T('a21') - 0.5, 0.3);
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
    const b = h('div', 'abs', e, t); css(b, { left: '14px', top: '58px', font: '700 28px/44px "Sans SC"', color: '#FFFFFF', background: i ? K.ink : K.forest, borderRadius: '8px', padding: '0 12px' });
    set(b, s.start, { autoAlpha: 0 }); show(b, (i === 0 ? T('a21', 'users') - 0.2 : T('a21b', '两个') + 0.15 + (i - 1) * 0.25), { y: 6, d: 0.4 });
    return { e, a, b };
  });
  fadeOut(f1, tP3 + 0.1, 0.3);
  show(fileEls[0].e, T('a21', 'Alice') - 0.2, { y: 12, d: 0.5 });
  show(fileEls[1].e, T('a21b', '两个') - 0.1, { y: 12, d: 0.5 }); show(fileEls[2].e, T('a21b', '两个') + 0.15, { y: 12, d: 0.5 });
  // 三棵树：叶页数照实测（集合 4、_id 3、姓名 15）
  function mini(i, n, lab) {
    const x0 = 160 + i * 560, W = 520, y0 = 466;
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
    const t = tg(world, x0, y0 + 302, lab, 'b'); css(t, { fontSize: '28px', lineHeight: '48px', color: '#FFFFFF', background: i ? K.ink : K.forest, borderRadius: '8px', padding: '0 14px' });
    return { r, lvs, lks, t, x0, W, y0, lw, gap };
  }
  const TR3 = [mini(0, 4, '集合树 · 4 个叶页'), mini(1, 3, '_id 索引 · 3 个叶页'), mini(2, 15, '姓名索引 · 15 个叶页')];

  const tTree = [T('a22') + 0.2, T('a23') + 0.2, T('a24', '名字') - 0.3];
  TR3.forEach((m, i) => {
    show(m.r, tTree[i], { y: 10, d: 0.45 });
    m.lvs.forEach((l, k) => show(l, tTree[i] + 0.2 + k * (m.lvs.length > 8 ? 0.03 : 0.08), { y: 12, d: 0.4 }));
    m.lks.forEach((p, k) => draw(p, tTree[i] + 0.25 + k * 0.02, 0.5));
    show(m.t, tTree[i] + 0.4, { y: 8, d: 0.4 });
    const lnk = link(ov4, [[m.x0 + m.W / 2, 416], [m.x0 + m.W / 2, m.y0]], 'dim', { w: 2, dashed: '6 6' }); arrowIn(lnk, tTree[i] - 0.2, 0.4);
    to(fileEls[i].e, [T('a21', 'users') - 0.2, T('a21b', '各占') - 0.2, T('a21b', '各占')][i], { borderColor: K.g1, backgroundColor: '#A6F4C9', duration: 0.4 });
    to(fileEls[i].b, [tTree[0] + 0.1, T('a23', '一建好') - 0.1, T('a24', '名字') - 0.1][i], { backgroundColor: K.spring, color: K.ink, duration: 0.4 });
  });
  // 索引：注解贴在 _id 那棵树下面
  // 树下注解：第一行键和值，第二行为什么叶页数不一样（策划者 r5：「_id索引的独特 和姓名索引长的不一样, 在图注要解释」）
  const CAP = [
    ['键：RecordId　值：整份文档（BSON）', '文档大，一页装 675 到 1224 份：4 页'],
    ['键：ObjectId，不会重复　值：RecordId', '键只有 12 字节，一页装得多：3 页'],
    ['键：名字 + RecordId　值：空', '名字长（约 50 字节），一页约 290 项：15 页'],
  ];
  const capT = [[tTree[0] + 0.7, T('a24', '索引') + 0.3], [tTree[1] + 0.7, T('a24', '索引') + 0.6], [T('a24', '名字') + 0.5, T('a24', '索引') + 0.9]];
  const caps = TR3.map((m, i) => CAP[i].map((txt, j) => {
    const e = h('div', 'abs', world, txt); px(e, m.x0, m.y0 + 360 + j * 34);
    css(e, { font: (j ? '700' : '500') + ' 24px/32px "Inter", "Sans SC"', color: j ? K.forest : K.gd2, whiteSpace: 'nowrap' });
    show(e, capT[i][j], { y: 8, d: 0.45 }); return e;
  }));
  const glIdx = gl(world, 160, 914, '索引', '每个索引单独占一个文件，自己就是一棵树；_id 索引是建集合时自带的');   // A06 I06
  css(glIdx, { padding: '0 0 0 16px' }); css(glIdx.querySelector('b'), { display: 'inline', fontSize: '28px', marginRight: '14px' }); css(glIdx.querySelector('span'), { display: 'inline', fontSize: '26px' });
  show(glIdx, T('a23', '索引') - 0.1, { y: 8, d: 0.45 });
  const ci = code(world, 1270, 910, 'db.users.createIndex({ <span class="k">name</span>: <span class="n">1</span> })<span style="font:600 22px \'Sans SC\';color:#5C6C75;margin-left:12px">1：升序</span>'); css(ci, { fontSize: '24px' });   // C08
  show(ci, T('a24', '建了') - 0.2, { y: 8, d: 0.45 });
  TR3[2].lvs.forEach((l, k) => to(l, T('a24', '索引') - 0.3 + k * 0.02, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }));
  // Alice 在三棵树里各占一项：集合树第 2 个叶页、_id 索引某一页、姓名索引第 1 页（B05 B06）
  const tA = T('a25') - 0.1;
  const dots = [[0, 1], [1, 1], [2, 0]].map(([i, k], j) => {
    const m = TR3[i], l = m.lvs[k];
    const dz = Math.min(28, m.lw - 8); const d = h('div', 'abs', world); px(d, m.x0 + k * (m.lw + m.gap) + m.lw / 2 - dz / 2, m.y0 + 140 + 58, dz, dz); css(d, { borderRadius: '50%', background: K.spring, border: '3px solid ' + K.forest });
    show(d, tA + j * 0.55, { y: 0, s: 0.3, d: 0.4 }); to(l, tA + j * 0.5, { borderColor: K.forest, backgroundColor: K.forest, duration: 0.35 });
    return d;
  });
  // 从她注册的那一刻看起：别的叶页淡下去，只留 Alice 那三页
  TR3.forEach((m, i) => m.lvs.forEach((l, k) => { if (!((i === 0 && k === 1) || (i === 1 && k === 1) || (i === 2 && k === 0))) to(l, T('a26', '注册') - 0.2, { opacity: 0.15, duration: 0.5 }); }));
  TR3.forEach((m) => to(m.r, Tend('a25') + 0.3, { opacity: 0.3, duration: 0.5 }));
  fileEls.forEach((o, i) => { to(o.e, T('a25', '三棵') - 0.2 + i * 0.3, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to(o.e, T('a26') - 0.3, { backgroundColor: '#A6F4C9', borderColor: K.g1, duration: 0.4 }); });   // 三棵树＝三个文件，依次亮起
  to(dots, T('a26', '看起') - 0.2, { scale: 1.35, duration: 0.45, ease: 'back.out(2)' });
});
