// 第 10 章 五个问题、第 11 章 不是 SQL（第 4 轮重做）。
// 10：一页五行，每行一个问题、一幅从那一章缩下来的小图、一句短答案；念到哪一行，绿条落到哪一行。
// 11：换来的（三份字段各异的文档）↔ 付出的（13 字节字段名 × 4096 份）→ 再往下一层，WiredTiger 只认键和值 → 键值数据库，更简单的一类 →
//     MongoDB 的数据住在磁盘的树里、内存是缓存；倒过来，数据全住在内存里 → 进程一死靠什么回来 → PART 7 · Redis（整屏卡，与片名同款）。
// 事实：A04 B05 B06 B07 C02 D01 D04 F02 G07 G04 H02 H06（五问的答案，见各章）；A12 I06（字段自由，_id 必有）、A04 A03（字段名 13 字节，4096 份）；
//       A13 B01（键与字节）、N01（键值数据库更简单，Redis 是例子）、S02（Redis 数据在内存）。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  chrome(root, s, '10 五个问题');
  const X = 140, Y = 222, RH = 138, W = 1660;
  const bar = h('div', 'abs', world); px(bar, X - 10, Y - 6, W + 20, RH - 12); css(bar, { background: K.mint2, borderLeft: '8px solid ' + K.g1, borderRadius: '10px' });
  // 小图：用 SVG 画，颜色同各章
  const mini = [
    // 放：47 字节 → 集合树（键 RecordId）
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m0a">${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 11}" y="38" width="9" height="20" rx="2" fill="${[1, 2, 5, 6].includes(i) ? K.spring : '#fff'}" stroke="${K.gb}"/>`).join('')}</g><rect class="m0p" x="52" y="42" width="16" height="12" rx="2" fill="${K.forest}"/><g class="m0b"><path d="M120 48h22" stroke="${K.ink}" stroke-width="2.5"/><rect x="170" y="6" width="44" height="16" rx="3" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<rect class="${i === 1 ? 'm0c' : ''}" x="${150 + i * 22}" y="56" width="18" height="34" rx="3" fill="#fff" stroke="${i === 1 ? K.g1 : K.gl1}" stroke-width="2"/><path d="M192 22L${159 + i * 22} 56" stroke="${K.ink}" stroke-width="1.5"/>`).join('')}</g></svg>`,
    // 找：索引 → RecordId → 集合树
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m1a"><rect x="30" y="6" width="40" height="14" rx="3" fill="${K.ink}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${4 + i * 12}" y="50" width="10" height="34" rx="2" fill="#fff" stroke="${i === 0 ? K.g1 : K.gl1}" stroke-width="2"/>`).join('')}<path d="M50 20L9 50" stroke="${K.spring}" stroke-width="4"/></g><g class="m1b"><path d="M104 66h40" stroke="${K.g1}" stroke-width="3"/><path d="M138 60l8 6-8 6" stroke="${K.g1}" stroke-width="3"/></g><g class="m1c"><rect x="176" y="6" width="44" height="14" rx="3" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<rect x="${154 + i * 22}" y="50" width="18" height="34" rx="3" fill="${i === 1 ? K.mint : '#fff'}" stroke="${i === 1 ? K.g1 : K.gl1}" stroke-width="2"/>`).join('')}<path d="M198 20L185 50" stroke="${K.spring}" stroke-width="4"/></g><circle class="m1d" cx="50" cy="13" r="6" fill="${K.spring}" stroke="${K.forest}" stroke-width="2"/></svg>`,
    // 改和删：挂新版本、删除标记；文件末尾一块新的
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m2a"><rect x="4" y="8" width="44" height="26" rx="5" fill="#fff" stroke="${K.gb}" stroke-width="2"/><path d="M50 21h12" stroke="${K.ink}" stroke-width="2"/></g><g class="m2b"><rect x="64" y="8" width="44" height="26" rx="5" fill="${K.spring}"/></g><g class="m2c"><rect x="120" y="8" width="64" height="26" rx="5" fill="${K.ink}"/></g><g class="m2d"><rect x="4" y="58" width="232" height="30" rx="4" fill="${K.gl3}" stroke="${K.gl1}" stroke-width="2"/>${[[8, 40], [96, 30], [130, 36]].map(([x, w]) => `<rect x="${x}" y="62" width="${w}" height="22" rx="3" fill="#fff" stroke="${K.gb}" stroke-width="2"/>`).join('')}</g><g class="m2f"><rect x="52" y="62" width="40" height="22" rx="3" fill="none" stroke="${K.gb}" stroke-width="2" stroke-dasharray="4 3"/></g><g class="m2e"><rect x="190" y="62" width="42" height="22" rx="3" fill="${K.mint2}" stroke="${K.g1}" stroke-width="2"/></g></svg>`,
    // 并发：三条泳道，快照竖线，写冲突
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m3a">${[16, 48, 80].map((y) => `<path d="M10 ${y}h220" stroke="${K.gl1}" stroke-width="2"/>`).join('')}</g><g class="m3b"><rect x="40" y="8" width="140" height="16" rx="4" fill="${K.bluel}" stroke="${K.blue}" stroke-width="2"/><path d="M42 4v88" stroke="${K.blue}" stroke-width="3"/></g><g class="m3c"><circle cx="110" cy="48" r="6" fill="${K.forest}"/></g><g class="m3d"><path d="M168 56l-10 14h10l-4 14 14-18h-10l4-10z" fill="${K.red}"/></g></svg>`,
    // 出错：检查点 + 日志重放
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m4a"><path d="M10 30h220" stroke="${K.gb}" stroke-width="2"/><rect x="24" y="12" width="5" height="36" fill="${K.forest}"/></g><g class="m4b">${[60, 90, 120].map((x) => `<circle cx="${x}" cy="30" r="5" fill="${K.g1}"/>`).join('')}<circle class="m4e" cx="150" cy="30" r="5" fill="${K.g1}"/></g><g class="m4d"><path d="M196 16l-8 12h8l-3 12 12-16h-8l3-8z" fill="${K.red}"/></g><g class="m4c">${[0, 1, 2, 3].map((i) => `<rect x="${40 + i * 40}" y="62" width="34" height="22" rx="3" fill="${K.blue}"/>`).join('')}</g></svg>`,
  ];
  const QS = [['放', ['文档编成 BSON，按 RecordId 放进集合树', '每个索引另是一棵树，指回 RecordId'], T('i1') - 0.2, [T('i1', 'RecordId') - 0.2, T('i2', '指回') - 0.2], [T('i2'), T('i3')]],
    ['找', ['在索引里拿到 RecordId，再回集合树取文档'], T('i3') - 0.2, [T('i3', '集合') - 0.2], [T('i4')]],
    ['改和删', ['内存里挂新版本、挂删除标记', '检查点把整页写到新地方，旧页不覆盖'], T('i4') - 0.2, [T('i4', '新版本') - 0.2, T('i5', '新地方') - 0.2], [T('i5'), T('i6')]],
    ['并发', ['读的人看快照；改同一份撞上了，一方整个重来'], T('i6') - 0.2, [T('i6', '撞上') - 0.2], [T('i8')]],
    ['出错', ['回到最后一个检查点，重放日志', '单机不带 j，最后一小段可能丢'], T('i8') - 0.2, [T('i8', '检查点') - 0.2, T('i9', '被杀') - 0.2], [T('i9'), Tend('i9') + 0.2]]];
  const MINI_ON = [T('i1', '集合树'), T('i3', 'RecordId'), T('i5', '旧页'), T('i6', '撞上'), T('i9', '一小段')];
  const rows = QS.map(([k, a, t], i) => {
    const g = h('div', 'abs', world); px(g, X, Y + i * RH, W, RH - 24);
    g.innerHTML = `<div style="position:absolute;left:10px;top:28px;width:52px;height:52px;border-radius:50%;background:${K.ink};color:#fff;font:700 28px/52px Inter;text-align:center">${i + 1}</div>` +
      `<div style="position:absolute;left:86px;top:26px;font:800 44px 'Sans SC';color:${K.ink}">${k}</div>` +
      `<div class="mw" style="position:absolute;left:290px;top:-6px;transform:scale(1.35);transform-origin:0 0;border-radius:8px">${mini[i]}</div>` +
      a.map((p, j) => `<div class="ans" style="position:absolute;left:640px;border-radius:8px;padding:0 14px;top:${a.length > 1 ? 10 + j * 48 : 34}px;width:1000px;box-sizing:border-box;font:500 32px/1.45 'Sans SC';color:${K.gd2};white-space:nowrap">${p}</div>`).join('');
    return g;
  });
  rows.forEach((g, i) => show(g, T('i0') + 0.2 + i * 0.18, { y: 16, d: 0.5 }));
  fromTo(bar, QS[0][2] - 0.1, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.4 });
  for (let i = 1; i < 5; i++) tl.fromTo(bar, { y: (i - 1) * RH }, { y: i * RH, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, QS[i][2] - 0.2);
  QS.forEach((q, i) => sfx('tick', q[2] - (i ? 0.2 : 0.1), { g: 0.4 }));   // 选中条落到哪一行，轻轻一声
  rows.forEach((g, i) => [...g.querySelectorAll('.ans')].forEach((e, j) => { to(e, QS[i][3][j], { color: '#FFFFFF', backgroundColor: K.forest, duration: 0.35 }); to(e, QS[i][4][j] - 0.2, { color: K.ink, backgroundColor: K.mint2, duration: 0.35 }); }));
  [[0, 0, T('i1', 'BSON') - 0.2], [0, 1, T('i2', '索引') - 0.2], [1, 0, T('i3', '索引') - 0.2], [3, 0, T('i6', '快照') - 0.2]].forEach(([i, j, t]) => to(rows[i].querySelectorAll('.ans')[j], t, { backgroundColor: K.mint2, color: K.forest, duration: 0.35 }));
  rows.forEach((g, i) => to(g.querySelector('.mw'), MINI_ON[i] - 0.2, { backgroundColor: '#A6F4C9', duration: 0.35 }));
  // 小图一部分一部分画出来：念到哪一部分，哪一部分出现（每一部分开头都是空的）
  const G = (c) => world.querySelector('.' + c);
  const PARTS = [['m0a', T('i1', 'BSON')], ['m0b', T('i1', '集合树')], ['m1a', T('i3', '索引')], ['m1b', T('i3', 'RecordId')], ['m1c', T('i3', '集合树')],
    ['m2a', T('i4', '内存')], ['m2b', T('i4', '新版本')], ['m2c', T('i4', '删除标记')], ['m2d', T('i5', '检查点')], ['m2e', T('i5', '新地方')], ['m2f', T('i5', '旧页')],
    ['m3a', T('i6', '读')], ['m3b', T('i6', '快照')], ['m3c', T('i6', '同一份')], ['m3d', T('i6', '撞上')], ['m4a', T('i8', '检查点')], ['m4b', T('i8', '重放')], ['m4c', T('i8', '重放') + 0.3], ['m4d', T('i9', '被杀')]];
  PARTS.forEach(([c, t]) => { const e = G(c); set(e, s.start, { opacity: 0 }); to(e, t - 0.2, { opacity: 1, duration: 0.4 }); });
  to(G('m0c'), T('i2', '指回') - 0.2, { fill: K.spring, duration: 0.35 });
  to(G('m4e'), T('i9', '一小段') - 0.2, { fill: K.red, duration: 0.35 });
  // 放：47 个字节打成一包，顺着树落进第二个叶页
  const m0p = G('m0p'); set(m0p, s.start, { opacity: 0 });
  to(m0p, T('i1', 'RecordId') - 0.2, { opacity: 1, duration: 0.3 });
  tl.fromTo(m0p, { x: 0, y: 0 }, { x: 128, y: -36, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, T('i1', '集合树') - 0.1);
  tl.to(m0p, { x: 122, y: 24, duration: 0.4, ease: 'power2.in' }, T('i1', '集合树') + 0.4);
  to(m0p, T('i1', '集合树') + 0.8, { opacity: 0, duration: 0.2 }); to(G('m0c'), T('i1', '集合树') + 0.8, { fill: K.mint, duration: 0.3 });
  // 找：一个点从索引的根走到叶页，顺着箭头过去，再从集合树的根走到第二个叶页
  const m1d = G('m1d'); set(m1d, s.start, { opacity: 0 });
  to(m1d, T('i3', '索引') - 0.1, { opacity: 1, duration: 0.25 });
  tl.fromTo(m1d, { x: 0, y: 0 }, { x: -41, y: 54, duration: 0.45, ease: 'power2.inOut', immediateRender: false }, T('i3', '索引') + 0.15);
  tl.to(m1d, { x: 96, y: 53, duration: 0.6, ease: 'power2.inOut' }, T('i3', 'RecordId') - 0.1);
  tl.to(m1d, { x: 148, y: 0, duration: 0.4, ease: 'power2.inOut' }, T('i3', '集合树') - 0.3);
  tl.to(m1d, { x: 135, y: 54, duration: 0.4, ease: 'power2.in' }, T('i3', '集合树') + 0.15);
  to(m1d, T('i3', '文档') + 0.3, { opacity: 0, duration: 0.3 });
  // 改和删：新版本、删除标记一个个挂上去；整页从旧位置飞到文件末尾
  tl.fromTo(G('m2b'), { x: -40 }, { x: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('i4', '新版本') - 0.2);
  tl.fromTo(G('m2c'), { x: -50 }, { x: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('i4', '删除标记') - 0.2);
  tl.fromTo(G('m2e'), { x: -138 }, { x: 0, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, T('i5', '新地方') - 0.2);
  // 并发：读的人沿着自己那条线走；撞上时闪电弹出，一方退回去重来
  tl.fromTo(G('m3c'), { x: -60 }, { x: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, T('i6', '同一份') - 0.2);
  tl.fromTo(G('m3d'), { scale: 0.3, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)', immediateRender: false }, T('i6', '撞上') - 0.2);
  tl.to(G('m3c'), { x: -50, duration: 0.35, ease: 'power2.out' }, T('i6', '重来') - 0.3); tl.to(G('m3c'), { x: 0, duration: 0.5, ease: 'power2.inOut' }, T('i6', '重来') + 0.15);
  // 出错：日志一条条从检查点往后重放；闪电之后，最后一小段丢掉
  [...G('m4b').querySelectorAll('circle')].forEach((c, k) => tl.fromTo(c, { x: 26 - +c.getAttribute('cx') }, { x: 0, duration: 0.4, ease: 'power2.out', immediateRender: true }, T('i8', '重放') - 0.2 + k * 0.18));   // 轮到之前停在起点
  [...G('m4c').querySelectorAll('rect')].forEach((r, k) => tl.fromTo(r, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.3, ease: 'power2.out', immediateRender: true }, T('i8', '重放') + 0.3 + k * 0.18));   // 轮到之前是空的
  tl.fromTo(G('m4d'), { scale: 0.3, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)', immediateRender: false }, T('i9', '被杀') - 0.2);
  to(G('m4e'), T('i9', '丢') - 0.1, { opacity: 0.2, duration: 0.4 });
  fadeOut(bar, Tend('i9') + 0.1, 0.45);
});

scene('trade', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '11 不是 SQL');

  // 开头那一句：没建表就存进去
  const ins = h('div', 'abs mono', world, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span> })'); px(ins, 140, 228); css(ins, { font: '500 30px "Mono"', color: K.ink, background: K.gl3, border: '1.5px solid ' + K.gl2, borderRadius: '8px', padding: '6px 16px' });
  const noCT = h('div', 'abs mono', world, 'CREATE TABLE …'); px(noCT, 1100, 226); css(noCT, { font: '600 30px/54px "Mono"', color: K.gd2, background: K.gl2, borderRadius: '8px', padding: '0 16px' });
  const st = h('div', 'abs', world); px(st, 1092, 252, 270, 4); css(st, { background: K.gd2, transformOrigin: '0 50%' });
  show(ins, T('j1') - 0.1, { y: 10, d: 0.45 }); show(noCT, T('j1', '没建表') - 0.3, { y: 8, d: 0.4 }); fromTo(st, T('j1', '没建表') + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' });
  // ══ 换来的：同一批人，左边是集合里的文档，右边是关系数据库的一张表 ══
  // 三份文档竖排：每份最后都是 5 行（{、_id、两个字段、}），按 22 号字一行 33 像素排开，彼此不叠
  const DFS = 22, DLH = DFS * 1.5;
  const dA = docCard(world, 140, 326, [['name', JS('Alice')], ['age', JN(42)]], { w: 480, fs: DFS });
  const dE = docCard(world, 140, 538, [['name', JS('Erin')]], { w: 480, fs: DFS });
  const dF = docCard(world, 140, 750, [['name', JS('Frank')]], { w: 480, fs: DFS });
  show(dA.c, T('j1', '存了') - 0.3, { y: 14, d: 0.45 }); css(ins, { borderRadius: '8px', padding: '0 14px', marginLeft: '-14px' }); to(ins, T('j1', '存了') - 0.3, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 }); to([...ins.querySelectorAll('span')], T('j1', '存了') - 0.3, { color: '#FFFFFF', duration: 0.35 }); to(ins, T('j1b', '换来') - 0.2, { backgroundColor: K.gl3, color: K.ink, duration: 0.35 }); to([...ins.querySelectorAll('span')], T('j1b', '换来') - 0.2, { color: K.ink, duration: 0.35 }); [dE, dF].forEach((d, i) => show(d.c, T('j1b', '换来') - 0.2 + i * 0.12, { y: 14, d: 0.45 }));
  // 关系表：name、age 两列；Erin、Frank 没有年龄也得留一格
  const TBX = 1000, TBY = 340, TCW = [200, 120], TRH = 56;
  const tbl = h('div', 'abs', world); px(tbl, TBX, TBY, 560, TRH * 4);
  const tcell = (x, y, w, txt, hd, extra) => { const e = h('div', 'mt' + (hd ? ' h' : ''), tbl, txt); px(e, x, y, w, TRH); css(e, { font: (hd ? '700' : '500') + ' 26px/53px "Mono"', paddingLeft: '14px', ...(extra || {}) }); return e; };
  tcell(0, 0, TCW[0], 'name', 1); tcell(TCW[0], 0, TCW[1], 'age', 1);
  [['Alice', '42'], ['Erin', 'NULL'], ['Frank', 'NULL']].forEach(([n, a], r) => { tcell(0, TRH * (r + 1), TCW[0], n); tcell(TCW[0], TRH * (r + 1), TCW[1], a, 0, a === 'NULL' ? { color: K.gb } : {}); });
  const tblT = tg(world, TBX, TBY - 44, 'users 表 · 列事先定好', 'm'); css(tblT, { fontSize: '24px', color: K.gd1 });
  show([tblT, tbl], T('j1b', '换来') + 0.2, { y: 14, d: 0.5 });
  // j2b：除了 _id，想有哪些字段就有哪些——每份文档按自己的需要长出字段
  const addRow = (d, k, v, t) => { const close = d.c.lastChild; const r = h('div', 'dl', d.c, `<span class="k">${k}</span>: <span class="dv">${v}</span>`); d.c.insertBefore(r, close); tl.fromTo(r, { height: 0, autoAlpha: 0 }, { height: DLH, autoAlpha: 1, duration: 0.45, ease: 'power2.out', immediateRender: true }, t); css(r, { overflow: 'hidden' }); return r; };
  [dA, dE, dF].forEach((d, i) => { const r = h('div', 'dl', d.c, `<span class="k" style="color:#889397">_id</span>: <span style="color:#889397">ObjectId(…)</span>`); d.c.insertBefore(r, d.c.children[1]); tl.fromTo(r, { height: 0, autoAlpha: 0 }, { height: DLH, autoAlpha: 1, duration: 0.4, ease: 'power2.out', immediateRender: true }, T('j2b', '除了') - 0.2 + i * 0.12); css(r, { overflow: 'hidden', borderRadius: '6px' }); r.classList.add('idr'); to(r, T('j2b', '每份') - 0.2, { opacity: 0.3, duration: 0.4 }); to(r, T('j4') - 0.3, { opacity: 1, duration: 0.4 }); });   // 「除了 _id」：每份文档都有 _id，它不在「想有哪些就有哪些」里，所以退淡
  const rE = addRow(dE, 'tags', `[ ${JS('db')}, ${JS('go')} ]`, T('j3', '标签') - 0.25);
  const rF = addRow(dF, 'address', `{ <span class="k">city</span>: ${JS('Lisbon')} }`, T('j3', '地址') - 0.25);
  [[rE, T('j3', '标签')], [rF, T('j3', '地址')]].forEach(([r, t]) => { solid(r, t, 'new', [T('j4') - 0.3, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...r.querySelectorAll('span')], t, { color: '#FFFFFF', duration: 0.3 }); to([...r.querySelectorAll('.dv, .dv span')], T('j4') - 0.3, { clearProps: 'color', duration: 0.01 }); });   // 讲完「换来什么」，新字段退回普通的一行
  to(dA.c, T('j2b', '每份') - 0.2, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.4 }); to([dE.c, dF.c], T('j2b', '每份') - 0.1, { borderColor: K.g1, duration: 0.4 }); to([dE.c, dF.c], T('j2b', '字段') - 0.3, { backgroundColor: K.mint, duration: 0.4 });   // 「每份文档」：三份一起框出来；说到「字段」，另两份也亮起
  [dA, dE, dF].forEach((d, i) => { const ks = [...d.c.querySelectorAll('.k')].filter((k) => !k.closest('.idr')); ks.forEach((k) => css(k, { borderRadius: '4px', padding: '0 4px' })); to(ks, T('j2b', '字段') - 0.2 + i * 0.15, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.3 }); to(ks, T('j4') - 0.3, { backgroundColor: 'rgba(0,0,0,0)', color: K.blued, duration: 0.3 }); });   // lint-ok: 取消高亮
  // j3b：关系表要装下 tags、address，得先改表：整列加出来，没有的人一格格填 NULL
  const alter = h('div', 'abs mono', world, 'ALTER TABLE users ADD tags …, ADD address …'); px(alter, TBX, TBY + TRH * 4 + 24); css(alter, { font: '500 24px "Mono"', color: K.gd2, background: K.gl3, border: '1.5px solid ' + K.gl2, borderRadius: '8px', padding: '4px 12px' });
  show(alter, T('j3b', '传统') - 0.3, { y: 8, d: 0.4 }); css(alter, { background: K.ink, color: '#FFFFFF', borderColor: K.ink });
  to([...tbl.querySelectorAll('.mt.h')], T('j3', '声明') - 0.2, { color: '#FFFFFF', backgroundColor: K.ink, duration: 0.3 });   // 表的列是事先声明好的
  const newCols = [['tags', 220, ['NULL', '[…]', 'NULL']], ['address', 220, ['NULL', 'NULL', '{…}']]].map(([hd, w, vals], j) => {
    const x0 = TCW[0] + TCW[1] + j * 220;
    const col = h('div', 'abs', tbl); px(col, x0, 0, w, TRH * 4); css(col, { transformOrigin: '0 50%' });
    const hc = h('div', 'mt h', col, hd); px(hc, 0, 0, w, TRH); css(hc, { font: '700 26px/53px "Mono"', paddingLeft: '14px', background: K.yeld, color: '#FFFFFF' });
    vals.forEach((v, r) => { const c = h('div', 'mt', col, v); px(c, 0, TRH * (r + 1), w, TRH); css(c, { font: '500 26px/53px "Mono"', paddingLeft: '14px', color: v === 'NULL' ? K.gb : K.ink }); });
    fromTo(col, T('j3b', '灵活') - 0.4 + j * 0.25, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'power2.out' });
    return col;
  });
  css(tbl, { width: TCW[0] + TCW[1] + 440 + 'px' });
  // ══ 付出的：三条，一条一个画面 ══
  const tP = T('j4') - 0.3;
  fadeOut([ins, noCT, st, tbl, tblT, alter], tP, 0.45);
  tl.to([dA.c, dE.c, dF.c], { opacity: 0.35, duration: 0.45 }, tP);
  const num = (n, x, y, t, tOut) => { const e = h('div', 'abs', world, String(n)); px(e, x, y, 56, 56); css(e, { borderRadius: '50%', background: K.ink, color: '#FFFFFF', font: '800 32px/56px "Inter"', textAlign: 'center' }); show(e, t, { y: 0, s: 0.5, d: 0.35 }); if (tOut != null) fadeOut(e, tOut, 0.35); return e; };
  // 1：字段名跟着每份文档存一遍（13 字节 × 4096）
  const strip = (y, o) => { const e = h('div', 'abs', world); px(e, 1000, y, 760, 50); css(e, { opacity: o });
    e.innerHTML = MDB.BSON.map(([hex, k]) => `<span style="display:inline-block;height:44px;margin-right:2px;border-radius:4px;vertical-align:top;width:${hex.length / 2 * 15}px;background:${k === 'name' ? K.spring : '#fff'};border:1.5px solid ${k === 'name' ? K.forest : K.gl1}"></span>`).join(''); return e; };
  const n1 = num(1, 920, 336, T('j5', '第一') - 0.2, T('j6e') - 0.3);
  const S0 = strip(340, 1); show(S0, T('j5', '字段名') - 0.3, { y: 10, d: 0.45 });
  const sLab = tg(world, 1000, 398, '<span style="background:#00ED64;color:#001E2B;padding:0 8px">_id</span> <span style="background:#00ED64;color:#001E2B;padding:0 8px">name</span> <span style="background:#00ED64;color:#001E2B;padding:0 8px">age</span>　字段名 13 字节', 'm'); css(sLab, { fontSize: '24px', lineHeight: '40px' });
  show(sLab, T('j5', '每份') - 0.3, { y: 8, d: 0.4 });
  const dKeys = [dA, dE, dF].flatMap((d) => [...d.c.querySelectorAll('.k')]); dKeys.forEach((k) => css(k, { borderRadius: '4px', padding: '0 4px' }));
  tl.to([dA.c, dE.c, dF.c], { opacity: 1, duration: 0.4 }, T('j5', '字段名') - 0.3); to(dKeys, T('j5', '字段名') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });
  tl.to([dA.c, dE.c, dF.c], { opacity: 0.35, duration: 0.45 }, T('j6', 'name') - 0.2); to(sLab, T('j6', '名字') - 0.2, { color: K.forest, duration: 0.3 });   // 再看右边的字节
  const stack = [1, 2, 3, 4, 5, 6].map((k) => { const e = strip(450 + k * 16, 0.9 - k * 0.12); e.dataset.name = 'strip'; return e; });
  stack.forEach((e, k) => tl.fromTo(e, { autoAlpha: 0, y: -20 }, { autoAlpha: 0.9 - k * 0.12, y: 0, duration: 0.35, immediateRender: true }, T('j6', '四千') - 0.2 + k * 0.45));   // 一份份叠上去，跟着数到 4096
  const mul = h('div', 'abs', world); px(mul, 1000, 590); css(mul, { font: '800 56px/84px "Inter", "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '14px', padding: '0 24px' });
  mul.innerHTML = '13 字节 × <span class="n4">0</span> 份';
  show(mul, T('j6', '四千') - 0.3, { y: 10, d: 0.45 });
  stepTo(mul.querySelector('.n4'), [[T('j6', '四千') - 0.2, 2.4, 0, 4096]], (v) => Math.round(v).toLocaleString('en-US'));
  const tot = tg(world, 1000, 694, '= 53,248 字节', 'b'); css(tot, { fontSize: '34px', lineHeight: '60px', color: K.ink });   // A04
  show(tot, T('j6b', '存了') - 0.2, { y: 10, d: 0.45 }); to(mul, T('j6b', '存了') - 0.2, { backgroundColor: K.forest, duration: 0.35 });
  css(tot, { borderRadius: '10px', padding: '0 16px' }); to(tot, Tend('j6b') + 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 }); to([S0, sLab, ...stack], Tend('j6b') + 0.2, { opacity: 0.25, duration: 0.4 });
  const glFN = gl(world, 1000, 782, '小贴士：字段名会压缩吗？', '会，但不是专门压：落盘时整页用 snappy 压缩，<br>字段名跟着一起压。文档很小时，<br>官方建议把字段名起短一点', { key: '字段名压缩', w: 800 }); [glFN.querySelector('span'), ...glFN.querySelectorAll('.gr')].forEach((e) => css(e, { fontSize: '24px', lineHeight: '35px' }));   // U09 标题在上，三行装下，不伸进字幕条
  show(glFN, T('j5', '每份') - 0.1, { x: 12, y: 0, d: 0.45 }); fadeOut(glFN, T('j6e') - 0.4, 0.4);
  const tP2 = T('j6e') - 0.3;
  fadeOut([S0, sLab, ...stack, mul, tot], tP2, 0.4);
  // 2：没有表替你把关——三份文档都被收下；加上校验规则以后，两份不合格的被挡回去（A17）
  const n2 = num(2, 920, 336, T('j6e', '第二') + 0.1, T('j6h') - 0.3);
  const colB = h('div', 'panel', world); px(colB, 1000, 330, 800, 470); css(colB, { background: K.gl3 });
  colB.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:600 26px Mono;color:${K.gd2}">users 集合</div>`;
  show(colB, T('j6e') - 0.1, { y: 12, d: 0.45 });
  const IN = [[[['name', JS('Dave')], ['age', JN(19)]], 0, null], [[['Name', JS('Erin')], ['age', JN(30)]], 1, 'Name'], [[['name', JS('Frank')], ['age', JS('四十二')]], 2, 'age']];
  const inDocs = IN.map(([rows, i, bad]) => {
    const d = docCard(world, 1030 + i * 252, 410, rows, { w: 244, fs: 22 });
    if (bad) { const r = d.r[bad]; css(r, { background: K.red, borderRadius: '6px' }); [...r.querySelectorAll('span')].forEach((sp) => css(sp, { color: '#FFFFFF' })); }
    tl.fromTo(d.c, { autoAlpha: 0, y: -120 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', immediateRender: true }, [T('j6e') - 0.1, T('j6f', '拼错') - 0.3, T('j6f', '文字') - 0.3][i]);
    return d;
  });
  to(colB, T('j6f', '拼错') - 0.2, { backgroundColor: '#FFF1C2', borderColor: K.yeld, duration: 0.4 }); to(colB, T('j6f', '收下') - 0.3, { backgroundColor: '#C9F2E2', borderColor: K.g1, duration: 0.4 }); to(colB, T('j6g', '规则') - 0.1, { backgroundColor: K.gl3, borderColor: K.gl2, duration: 0.4 });   // 三份都进了集合
  const ticks = inDocs.map((d, i) => { const e = h('div', 'abs', world, ico('check', 40, K.forest, 4)); px(e, 1040 + i * 250 + 95, 620, 40, 40); show(e, T('j6f', '收下') - 0.2 + i * 0.12, { y: 0, s: 1.3, d: 0.3 }); return e; });
  // j6g：入口加一道校验规则；后两份被挡回去
  const gate = h('div', 'abs', world); px(gate, 1000, 262, 800, 60); css(gate, { background: K.ink, borderRadius: '12px', font: '700 26px/60px "Sans SC"', color: '#FFFFFF', paddingLeft: '24px', boxSizing: 'border-box' });
  gate.textContent = '校验规则';
  show(gate, T('j6g', '校验') - 0.3, { y: -10, d: 0.4 });
  [1, 2].forEach((i) => { tl.to(inDocs[i].c, { y: -160, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, T('j6g', '规则') + i * 0.15); fadeOut(ticks[i], T('j6g', '规则'), 0.25);
    const x = h('div', 'abs', world, ico('x', 40, K.red, 4)); px(x, 1040 + i * 250 + 95, 620, 40, 40); show(x, T('j6g', '规则') + 0.1 + i * 0.15, { y: 0, s: 1.3, d: 0.3 }); fadeOut(x, T('j6h') - 0.3, 0.3); });
  const tP3 = T('j6h') - 0.3;
  fadeOut([colB, gate, ...inDocs.map((d) => d.c), ...ticks], tP3, 0.4);
  // 3：一份文档之内的修改天生是原子的；跨两份要事务、要副本集（A18 G00b）
  const n3 = num(3, 920, 336, T('j6h', '第三') + 0.1, T('j6c') - 0.3);
  const one = docCard(world, 1000, 360, [['name', JS('Alice')], ['age', `${JN(42)} → ${JN(43)}`], ['email', JS('a@…')]], { w: 360, fs: 24 });
  const oneF = h('div', 'abs', world); px(oneF, 990, 350, one.c.offsetWidth + 20, one.c.offsetHeight + 20); css(oneF, { border: '4px solid ' + K.forest, borderRadius: '16px' }); oneF.dataset.name = 'atom';   // 外框按文档卡的实际大小
  show(one.c, T('j6h', '一份') - 0.3, { y: 12, d: 0.45 }); show(oneF, T('j6h', '原子') - 0.3, { y: 0, s: 1.04, d: 0.4 }); to(one.c, T('j6h', '原子') - 0.3, { backgroundColor: '#A6F4C9', borderColor: K.g1, duration: 0.35 });
  [one.r.age, one.r.email].forEach((r) => solid(r, T('j6h', '修改') - 0.2, 'new'));
  [one.r.age, one.r.email].forEach((r) => to([...r.querySelectorAll('span')], T('j6h', '修改') - 0.2, { color: '#FFFFFF', duration: 0.3 }));
  const okO = h('div', 'abs', world, ico('check', 40, K.forest, 4)); px(okO, 1384, 430, 40, 40); show(okO, T('j6h', '原子') - 0.1, { y: 0, s: 1.3, d: 0.3 });
  const two = [['Alice', 'age 42 → 43'], ['Dave', 'age 19 → 20']].map(([n, c], i) => { const d = docCard(world, 1000 + i * 400, 600, [['name', JS(n)], ['age', JN(i ? 19 : 42)]], { w: 340, fs: 24 }); show(d.c, T('j6i', '几份') - 0.3 + i * 0.15, { y: 12, d: 0.45 }); return d; });
  const span2 = link(ov, [[1170, 590], [1170, 570], [1570, 570], [1570, 590]], 'ink', { w: 3 }); arrowIn(span2, T('j6i', '一起') - 0.3, 0.4);
  solid(two[0].r.age, T('j6i', '生效') - 0.2, 'new'); to([...two[0].r.age.querySelectorAll('span')], T('j6i', '生效') - 0.2, { color: '#FFFFFF', duration: 0.3 });
  const bolt2 = h('div', 'abs', world, ico('bolt', 48, K.red, 3)); px(bolt2, 1350, 650, 48, 48); show(bolt2, T('j6i', '生效') + 0.1, { y: -8, s: 0.6, d: 0.3 });
  const TWH = Math.max(...two.map((d) => d.c.offsetHeight)); const txF = h('div', 'abs', world); px(txF, 986, 586, 768, TWH + 28); css(txF, { border: '3px dashed ' + K.blue, borderRadius: '16px' });   // 虚线框包住两张卡，不从卡中间穿过
  show(txF, T('j6i', '事务') - 0.3, { y: 0, s: 1.03, d: 0.4 }); fadeOut(span2, T('j6i', '事务') - 0.3, 0.3); fadeOut(bolt2, T('j6i', '事务') - 0.1, 0.3);   // 虚线框代替上面那道连线
  solid(two[1].r.age, T('j6i', '事务') + 0.1, 'new'); to([...two[1].r.age.querySelectorAll('span')], T('j6i', '事务') + 0.1, { color: '#FFFFFF', duration: 0.3 });
  const rsI = h('div', 'abs', world); px(rsI, 1604, 586 + TWH + 28 + 12, 150, 60);   // 放在虚线框外的右下 rsI.innerHTML = [0, 1, 2].map((i) => `<div style="position:absolute;left:${i * 50}px;top:0">${ico('server', 44, i ? K.gb : K.forest, 2.4)}</div>`).join('');
  show(rsI, T('j6i', '副本集') - 0.3, { y: 8, d: 0.4 });
  const tL = T('j6c') - 0.35;
  fadeOut([one.c, oneF, okO, ...two.map((d) => d.c), span2, txF, rsI, dA.c, dE.c, dF.c], tL, 0.45);
  // 没有表的，只是上面这一层；往下走，照样是 B 树、检查点和日志（回扣第 02 章 mongod 的两层）
  const up = h('div', 'panel', world); px(up, 360, 236, 1200, 200);
  up.innerHTML = `<div style="position:absolute;left:28px;top:22px;font:700 34px 'Sans SC';color:${K.forest}">上层</div>` +
    [['name age', 2], ['name email tags', 3], ['name address', 2]].map(([n, k], i) => `<div style="position:absolute;left:${28 + i * 190}px;top:84px;width:170px;height:${22 + k * 28}px;background:#fff;border:2px solid ${K.gb};border-radius:8px;font:600 22px/28px Mono;color:${K.blued};padding:10px 12px;box-sizing:border-box;white-space:pre-line">${n.split(' ').join('\n')}</div>`).join('');
  const noTs = h('div', 'abs', up); css(noTs, { left: '700px', top: '50px', width: '100px', height: '100px' }); noTs.innerHTML = ico('table', 100, K.gb, 2.4);
  const noTx = h('div', 'abs', up); css(noTx, { left: '690px', top: '96px', width: '120px', height: '6px', background: K.gd2, transformOrigin: '0 50%', transform: 'rotate(-30deg)' });
  const dn = h('div', 'panel', world); px(dn, 360, 540, 1200, 300); css(dn, { borderColor: K.g1, borderWidth: '3px', background: K.mint });
  dn.innerHTML = `<div style="position:absolute;left:28px;top:22px;font:700 34px 'Sans SC';color:${K.forest}">下层 · WiredTiger</div>`;
  const TREE = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none"><rect x="50" y="4" width="50" height="18" rx="4" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<path d="M75 22L${17 + i * 38} 58" stroke="${K.ink}" stroke-width="2"/><rect x="${4 + i * 38}" y="58" width="26" height="32" rx="3" fill="#fff" stroke="${K.ink}" stroke-width="2"/>`).join('')}</svg>`;
  const CKPT = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none"><path d="M6 48h138" stroke="${K.gb}" stroke-width="3"/>${[30, 100].map((x) => `<rect x="${x}" y="22" width="8" height="52" rx="2" fill="${K.forest}"/>`).join('')}</svg>`;
  const LOG = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none">${[0, 1, 2, 3].map((i) => `<rect x="${6 + i * 36}" y="34" width="30" height="28" rx="4" fill="${K.blue}"/>`).join('')}</svg>`;
  [[TREE, 'B 树', 'B 树'], [CKPT, '检查点', '检查点'], [LOG, '日志', '日志']].forEach(([svg, lab, w], i) => {
    const e = h('div', 'abs', dn); css(e, { left: 30 + i * 390 + 'px', top: '82px', width: '360px', height: '196px', background: K.mint2, border: '2px solid ' + K.g1, borderRadius: '12px' });
    e.innerHTML = `<div style="position:absolute;left:20px;top:16px">${svg}</div><div style="position:absolute;left:24px;top:124px;font:700 36px 'Sans SC';color:${K.ink}">${lab}</div>`;
    show(e, T('j6d', w) - 0.25, { y: 12, d: 0.45 });
  });
  show(up, tL + 0.35, { y: -12, d: 0.5 }); show(noTs, T('j6c', '没有表') - 0.2, { y: 0, s: 0.8, d: 0.4 }); fromTo(noTx, T('j6c', '没有表') + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.inOut' });
  to(up, T('j6c', '上面') - 0.2, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 });
  const dnA = link(ov, [[960, 436], [960, 536]], 'spring', { w: 6, arrow: true });
  arrowIn(dnA, T('j6d', '往下走') - 0.25, 0.45);
  show(dn, T('j6d', '往下走') - 0.05, { y: 14, d: 0.5 });
  // 键和值：下层这几棵树里，存的都是一项项键和值（A13）；NoSQL 里键值数据库那一类就是这个样子（N01 N02）
  const tK = T('j7') - 0.35;
  fadeOut([up, dn, dnA], tK, 0.5);
  const kv = h('div', 'panel', world); px(kv, 140, 240, 820, 420); css(kv, { borderColor: K.g1, borderWidth: '3px' });
  const KVR = [['2049', '5c000000 07 5f69…'], ['2050', '2f000000 07 5f69…'], ['2051', '5c000000 07 5f69…']];
  kv.innerHTML = `<div style="position:absolute;left:28px;top:20px;font:700 36px Inter;color:${K.forest}">WiredTiger</div>` + KVR.map(([k, v], i) => `<div class="kvr" style="position:absolute;left:28px;top:${100 + i * 96}px;width:764px;height:76px;border-radius:10px;background:${K.gl3}"><span class="kk" style="position:absolute;left:16px;top:12px;font:700 36px/52px Mono;color:${K.ink};padding:0 10px;border-radius:6px">${k}</span><span style="position:absolute;left:170px;top:12px;font:600 30px/52px Inter;color:${K.gd1}">→</span><span class="kvv" style="position:absolute;left:230px;top:12px;font:500 30px/52px Mono;color:${K.gd1}">${v}</span></div>`).join('');
  show(kv, tK + 0.3, { y: 14, d: 0.5 });
  const kvr = [...kv.querySelectorAll('.kvr')]; set(kvr, s.start, { autoAlpha: 0 });
  kvr.forEach((e, i) => show(e, T('j7', '一项') - 0.3 + i * 0.25, { x: -14, y: 0, d: 0.4 }));
  to([...kv.querySelectorAll('.kk')], T('j7', '键和值') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });
  const cats = ['文档', '键值', '宽列', '图'].map((n, i) => { const e = h('div', 'abs', world, n); px(e, 1040 + (i % 2) * 380, 250 + Math.floor(i / 2) * 200, 340, 170); css(e, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px', font: '700 46px/166px "Sans SC"', textAlign: 'center', color: K.gd2 }); return e; });
  cats.forEach((e, i) => show(e, T('j8') + 0.1 + i * 0.12, { y: 14, d: 0.45 }));
  cats.forEach((e) => css(e, { background: K.gl2 }));
  to(cats[1], T('j8', '一类') - 0.2, { borderColor: K.forest, backgroundColor: K.forest, color: '#FFFFFF', duration: 0.4 });
  // j9：WiredTiger 的这三项，原样飞进「键值」那一格：每一项就是一个键、一个值
  const flyKV = KVR.map(([k], i) => { const e = h('div', 'abs', world, `<b>${k}</b> → …`); px(e, 168, 340 + i * 96); css(e, { font: '700 36px/52px "Mono"', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '0 14px', opacity: 0 }); return e; });
  flyKV.forEach((e, i) => { tl.fromTo(e, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, T('j9', '每一项') - 0.3 + i * 0.12); tl.to(e, { x: 1460 - 168, y: 316 + i * 34 - (340 + i * 96), scale: 0.62, transformOrigin: '0 0', duration: 0.8, ease: 'power2.inOut' }, T('j9', '每一项') - 0.1 + i * 0.12); });
  to(cats[1], T('j9', '每一项') - 0.3, { lineHeight: '72px', duration: 0.4, ease: 'power2.inOut' });   // 「键值」两个字让到格子上沿，下面放飞进来的三项
  // 「更简单的一类」：另外三类退下，键值那一格留在原处
  to([cats[0], cats[2], cats[3], kv], T('j9', '更简单') - 0.2, { opacity: 0.2, duration: 0.45 });
  to(cats[1], T('j9', '更简单') - 0.2, { borderColor: K.forest, borderWidth: '4px', duration: 0.3 });
  // 数据住在哪里：MongoDB 住在磁盘的树里，内存里只是几页缓存 → 倒过来：内存装下全部，磁盘只留一份存档
  const tH = T('j10') - 0.3;
  fadeOut([kv, ...cats, ...flyKV], tH, 0.5);
  const mem = h('div', 'abs', world); px(mem, 360, 250, 1200, 160); css(mem, { background: K.gl3, border: '3px solid ' + K.gb, borderRadius: '14px' });
  mem.innerHTML = `<div style="position:absolute;left:24px;top:20px">${ico('mem', 48, K.gd2, 2.4)}</div><div style="position:absolute;left:92px;top:26px;font:700 36px 'Sans SC';color:${K.ink}">内存</div>`;
  const cache = h('div', 'abs', mem); css(cache, { left: '92px', top: '86px', display: 'flex', gap: '12px' }); cache.innerHTML = Array.from({ length: 7 }, () => `<span style="width:64px;height:48px;background:${K.forest};border:2px solid ${K.forest};border-radius:5px"></span>`).join('');
  const dsk = h('div', 'abs', world); px(dsk, 360, 470, 1200, 330); css(dsk, { background: '#fff', border: '3px solid ' + K.forest, borderRadius: '14px' });
  dsk.innerHTML = `<div style="position:absolute;left:24px;top:20px">${ico('disk', 48, K.forest, 2.4)}</div><div style="position:absolute;left:92px;top:26px;font:700 36px 'Sans SC';color:${K.forest}">磁盘</div>` +
    `<div class="tr_" style="position:absolute;left:420px;top:100px"><div style="width:120px;height:30px;margin-left:150px;background:${K.ink};border-radius:5px"></div><div style="display:flex;gap:16px;margin-top:60px">${[0, 1, 2, 3].map(() => `<div style="width:90px;height:90px;background:${K.forest};border:2px solid ${K.forest};border-radius:6px"></div>`).join('')}</div></div>`;
  show(mem, tH + 0.3, { y: -14, d: 0.5 }); show(dsk, tH + 0.45, { y: 14, d: 0.5 });
  show(cache, T('j10', '缓存') - 0.3, { y: 8, d: 0.4 }); to(mem, T('j10', '缓存') - 0.3, { borderColor: K.forest, duration: 0.3 }); to(dsk, T('j10', '磁盘') - 0.2, { backgroundColor: '#C9F2E2', duration: 0.4 });
  const tF = T('j11', '倒过来') - 0.3;
  to(mem, tF, { height: 380, borderColor: K.forest, backgroundColor: K.mint, duration: 0.9, ease: 'power2.inOut' });
  to(dsk, tF, { y: 240, height: 120, backgroundColor: '#FFFFFF', borderColor: K.gb, duration: 0.9, ease: 'power2.inOut' });
  fadeOut([dsk.querySelector('.tr_'), cache], tF, 0.3);
  const arch = h('div', 'abs', dsk); css(arch, { left: '420px', top: '24px', display: 'flex', gap: '8px' }); arch.innerHTML = `<span style="width:200px;height:56px;background:${K.gl2};border:2px solid ${K.gb};border-radius:6px;font:700 26px/52px 'Sans SC';color:${K.gd2};text-align:center">存档</span>`;
  show(arch, T('j11', '保存') - 0.2, { y: 8, d: 0.4 });
  const allD = h('div', 'abs', mem); css(allD, { left: '92px', top: '100px', display: 'flex', gap: '12px', flexWrap: 'wrap', width: '1000px' });
  allD.innerHTML = Array.from({ length: 30 }, () => `<span style="width:52px;height:40px;background:${K.forest};border:2px solid ${K.forest};border-radius:5px"></span>`).join('');
  show(allD, T('j11', '内存') - 0.2, { y: 10, d: 0.5 });
  // 进程一死：内存熄掉，靠什么回来？
  const tD = T('j12', '一死') - 0.3;
  const kb = h('div', 'abs', world, ico('bolt', 80, K.red, 3)); px(kb, 1450, 268, 80, 80);
  show(kb, tD, { y: -12, s: 0.6, d: 0.35 }); sfx('error', tD + 0.05, { g: 0.6 });
  to(mem, tD + 0.2, { backgroundColor: K.gl2, borderColor: K.gb, duration: 0.45 });
  to(allD, tD + 0.2, { opacity: 0.25, duration: 0.45 });
  const qm = h('div', 'abs', world, '?'); px(qm, 900, 330, 130); css(qm, { font: '800 120px/170px "Inter"', color: '#FFFFFF', background: K.yeld, borderRadius: '16px', textAlign: 'center' });
  show(qm, T('j12', '靠什么') - 0.3, { y: 14, s: 0.8, d: 0.5 });
  // 最后一站：PART 7 · Redis（与片名同款的整屏卡；目录选中条从 6 滑到 7）
  const t13 = T('j13', '最后') - 0.2;
  const P = partCard(root, 7, t13, { from: 6, cascade: false });
  const cr = h('div', 'crumb2', P.main, '文档<i>/</i>数据库引擎<i>/</i>PART 7'); css(cr, { top: '190px' });
  const badge = h('div', 'abs', P.main, 'PART 7'); px(badge, 0, 268); css(badge, { font: '700 52px "Mono"', color: K.spring, background: K.ink, padding: '10px 30px', borderRadius: '12px', letterSpacing: '.06em' });
  const nx = h('div', 'abs', P.main, '系列最终集'); px(nx, 0, 400); css(nx, { font: '500 46px "Inter", "Sans SC"', color: K.gd2 });
  const tt = h('div', 'abs', P.main, 'Redis'); px(tt, -8, 470); css(tt, { font: '900 220px/1.1 "Inter"', color: K.ink });
  const rule = h('div', 'abs', P.main); px(rule, 0, 740, 760, 5); css(rule, { background: K.spring, transformOrigin: '0 50%' });
  const sub = h('div', 'abs', P.main, '一个更简单的数据库'); px(sub, 0, 772); css(sub, { font: '500 60px "Serif SC"', color: K.forest });
  show(cr, t13 + 0.3, { x: -16, y: 0, d: 0.5 }); slam(badge, t13 + 0.5, { from: 1.2 }); show(nx, t13 + 0.7, { y: 12, d: 0.5 });
  show(sub, T('j13', '更简单') - 0.2, { y: 16, d: 0.55 });
  slam(tt, T('j14') - 0.1, { from: 1.12 }); sfx('thud', T('j14'));
  fromTo(rule, T('j14') + 0.2, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' });
  tl.set([world, ch.c], { autoAlpha: 0 }, t13 + 0.45);
  // PART 7 那一项换深绿：叠一个深绿的副本淡入（不补间原元素的字色，倒着 seek 也确定）
  // PART 7 那一项由 partCard 的 now 类标出，不再另外改色（另改会和类名打架）
  // 片尾名单之前，卡片淡出（不硬切）
  fadeOut(P.el, s.end + 0.12, 0.3);
});
