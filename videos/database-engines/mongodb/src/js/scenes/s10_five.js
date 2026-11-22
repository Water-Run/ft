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
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m0a">${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 11}" y="38" width="9" height="20" rx="2" fill="${[1, 2, 5, 6].includes(i) ? K.spring : '#fff'}" stroke="${K.gb}"/>`).join('')}</g><g class="m0b"><path d="M120 48h22" stroke="${K.ink}" stroke-width="2.5"/><rect x="170" y="6" width="44" height="16" rx="3" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<rect class="${i === 1 ? 'm0c' : ''}" x="${150 + i * 22}" y="56" width="18" height="34" rx="3" fill="#fff" stroke="${i === 1 ? K.g1 : K.gl1}" stroke-width="2"/><path d="M192 22L${159 + i * 22} 56" stroke="${K.ink}" stroke-width="1.5"/>`).join('')}</g></svg>`,
    // 找：索引 → RecordId → 集合树
    `<svg width="240" height="96" viewBox="0 0 240 96" fill="none"><g class="m1a"><rect x="30" y="6" width="40" height="14" rx="3" fill="${K.ink}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${4 + i * 12}" y="50" width="10" height="34" rx="2" fill="#fff" stroke="${i === 0 ? K.g1 : K.gl1}" stroke-width="2"/>`).join('')}<path d="M50 20L9 50" stroke="${K.spring}" stroke-width="4"/></g><g class="m1b"><path d="M104 66h40" stroke="${K.g1}" stroke-width="3"/><path d="M138 60l8 6-8 6" stroke="${K.g1}" stroke-width="3"/></g><g class="m1c"><rect x="176" y="6" width="44" height="14" rx="3" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<rect x="${154 + i * 22}" y="50" width="18" height="34" rx="3" fill="${i === 1 ? K.mint : '#fff'}" stroke="${i === 1 ? K.g1 : K.gl1}" stroke-width="2"/>`).join('')}<path d="M198 20L185 50" stroke="${K.spring}" stroke-width="4"/></g></svg>`,
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
      a.map((p, j) => `<div class="ans" style="position:absolute;left:640px;border-radius:8px;padding:0 14px;top:${a.length > 1 ? 10 + j * 48 : 34}px;width:1060px;font:500 32px/1.45 'Sans SC';color:${K.gd2};white-space:nowrap">${p}</div>`).join('');
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
  fadeOut(bar, Tend('i9') + 0.1, 0.45);
});

scene('trade', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '11 不是 SQL');

  // 开头那一句：没建表就存进去
  const ins = h('div', 'abs mono', world, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span> })'); px(ins, 140, 228); css(ins, { font: '500 30px "Mono"', color: K.ink, background: K.gl3, border: '2px solid ' + K.gl2, borderRadius: '10px', padding: '10px 20px' });
  const noCT = h('div', 'abs mono', world, 'CREATE TABLE …'); px(noCT, 1100, 236); css(noCT, { font: '600 30px/54px "Mono"', color: '#FFFFFF', background: K.red, borderRadius: '8px', padding: '0 16px', top: '226px' });
  const st = h('div', 'abs', world); px(st, 1092, 254, 260, 4); css(st, { background: K.red, transformOrigin: '0 50%' });
  show(ins, T('j1') - 0.1, { y: 10, d: 0.45 }); to(ins, T('j1b') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); show(noCT, T('j1', '没建表') - 0.3, { y: 8, d: 0.4 }); fromTo(st, T('j1', '没建表') + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  // 两栏：换来的 ↔ 付出的
  const colL = h('div', 'abs', world); px(colL, 140, 320, 800, 600); const colR = h('div', 'abs', world); px(colR, 1000, 320, 800, 600);
  const hl_ = tg(world, 140, 320, '换来的', 'big'); css(hl_, { fontSize: '40px', lineHeight: '64px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 20px' });
  const hr_ = tg(world, 1000, 320, '付出的', 'big'); css(hr_, { fontSize: '40px', lineHeight: '64px', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 20px' });
  show(hl_, T('j1b', '换来') - 0.3, { y: 10, d: 0.45 });
  // 换来的：字段想有哪些就有哪些（A12）
  const dA = docCard(world, 140, 400, [['_id', '…'], ['name', JS('Alice')], ['age', JN(42)]], { w: 330, fs: 26 });
  const dE = docCard(world, 490, 400, [['_id', '…'], ['name', JS('Erin')], ['tags', `[ ${JS('db')}, ${JS('go')} ]`]], { w: 430, fs: 26 });
  const dF = docCard(world, 140, 640, [['_id', '…'], ['name', JS('Frank')], ['address', `{ <span class="k">city</span>: ${JS('Lisbon')} }`]], { w: 600, fs: 26 });
  [dA, dE, dF].forEach((d, i) => show(d.c, T('j2b') - 0.45 + i * 0.12, { y: 14, d: 0.45 }));
  to([dA.r._id, dE.r._id, dF.r._id], T('j2b', '除了') - 0.1, { backgroundColor: K.gd1, color: '#FFFFFF', duration: 0.35 }); to([dA.r._id, dE.r._id, dF.r._id].flatMap((r) => [...r.querySelectorAll('span')]), T('j2b', '除了') - 0.1, { color: '#FFFFFF', duration: 0.35 });
  [dA, dE, dF].forEach((d, i) => to(d.c, T('j2b', '哪些') - 0.2 + i * 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }));
  solid(dA.r.age, T('j2b', '想有') - 0.2, 'new'); to([...dA.r.age.querySelectorAll('span')], T('j2b', '想有') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  solid(dE.r.tags, T('j3', '标签') - 0.2, 'new'); to([...dE.r.tags.querySelectorAll('span')], T('j3', '标签') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  solid(dF.r.address, T('j3', '地址') - 0.2, 'new'); to([...dF.r.address.querySelectorAll('span')], T('j3', '地址') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  const noDecl = tg(world, 760, 690, '事先不用声明', 'g'); css(noDecl, { fontSize: '34px', lineHeight: '62px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 24px' });
  [dA, dE, dF].forEach((d, i) => to(d.c, T('j3', '直接') - 0.2 + i * 0.1, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.4 })); show(noDecl, T('j3', '声明') - 0.3, { x: 10, y: 0, d: 0.4 });
  // 付出的：字段名跟着每份文档存一遍；13 字节 × 4096 份（A04）
  show(hr_, T('j4', '付出') - 0.3, { y: 10, d: 0.45 }); to([dA.c, dE.c, dF.c, noDecl, hl_], T('j4') - 0.1, { opacity: 0.4, duration: 0.45 });
  const strip = (y, o) => { const e = h('div', 'abs', world); px(e, 1000, y, 760, 50); css(e, { opacity: o });
    e.innerHTML = MDB.BSON.map(([hex, k]) => `<span style="display:inline-block;height:44px;margin-right:2px;border-radius:4px;vertical-align:top;width:${hex.length / 2 * 15}px;background:${k === 'name' ? K.spring : '#fff'};border:1.5px solid ${k === 'name' ? K.forest : K.gl1}"></span>`).join(''); return e; };
  const S0 = strip(400, 1);
  show(S0, T('j5', '字段名') - 0.3, { y: 10, d: 0.45 });
  const sLab = tg(world, 1000, 458, '<span style="background:#00ED64;color:#001E2B;padding:0 8px">_id</span> <span style="background:#00ED64;color:#001E2B;padding:0 8px">name</span> <span style="background:#00ED64;color:#001E2B;padding:0 8px">age</span>　字段名 13 字节', 'b'); css(sLab, { fontSize: '28px' });
  show(sLab, T('j5', '每份') - 0.3, { y: 8, d: 0.4 });
  css(sLab, { borderRadius: '10px', padding: '4px 12px', marginLeft: '-12px' }); to(sLab, T('j6', 'name') - 0.2, { backgroundColor: K.ink, color: '#FFFFFF', duration: 0.35 });
  const stack = [1, 2, 3, 4, 5, 6].map((k) => { const e = strip(520 + k * 16, 0.9 - k * 0.12); return e; });
  stack.forEach((e, k) => tl.fromTo(e, { autoAlpha: 0, y: -20 }, { autoAlpha: 0.9 - k * 0.12, y: 0, duration: 0.35, immediateRender: true }, k ? T('j6', '四千') - 0.2 + k * 0.1 : T('j5', '存') - 0.2));
  const mul = h('div', 'abs', world); px(mul, 1000, 680, 800); css(mul, { font: '800 60px/88px "Inter", "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '14px', padding: '0 24px', width: 'auto' });
  mul.innerHTML = '13 字节 × <span class="n4">0</span> 份';
  show(mul, T('j6', '四千') - 0.3, { y: 10, d: 0.45 });
  to(mul, T('j6', '_id') - 0.2, { backgroundColor: K.forest, duration: 0.35 });
  stepTo(mul.querySelector('.n4'), [[T('j6', '四千') - 0.2, 1.4, 0, 4096]], (v) => Math.round(v).toLocaleString('en-US'));
  const tot = tg(world, 1000, 780, '= 53,248 字节，全是重复的字段名', 'b'); css(tot, { fontSize: '32px', lineHeight: '58px', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 18px', top: '792px' });
  show(tot, T('j6b', '存了') - 0.2, { y: 10, d: 0.45 });
  to(tot, Tend('j6b') + 0.3, { backgroundColor: K.spring, color: K.ink, duration: 0.4 });
  // 没有表的，只是上面这一层；往下走，照样是 B 树、检查点和日志（j6c j6d，回扣第 02 章 mongod 的两层）
  const tL = T('j6c') - 0.35;
  fadeOut([ins, noCT, st, hl_, hr_, dA.c, dE.c, dF.c, noDecl, S0, sLab, ...stack, mul, tot], tL, 0.5);
  const up = h('div', 'panel', world); px(up, 360, 236, 1200, 200);
  up.innerHTML = `<div style="position:absolute;left:28px;top:22px;font:700 34px 'Sans SC';color:${K.forest}">上层 · 收下查询</div>` +
    [['name age', 2], ['name email tags', 3], ['name address', 2]].map(([n, k], i) => `<div style="position:absolute;left:${28 + i * 190}px;top:84px;width:170px;height:${22 + k * 28}px;background:#fff;border:2px solid ${K.gb};border-radius:8px;font:600 22px/28px Mono;color:${K.blued};padding:8px 12px;box-sizing:border-box;white-space:pre">${n.split(' ').join('\n')}</div>`).join('');
  const noT = h('div', 'abs', up, '没有表'); css(noT, { left: '724px', top: '84px', font: '800 60px "Sans SC"', color: K.ink });
  const noTs = h('div', 'abs', up); css(noTs, { left: '640px', top: '60px', width: '64px', height: '64px' }); noTs.innerHTML = ico('table', 64, K.gb, 2.4);
  const dn = h('div', 'panel', world); px(dn, 360, 540, 1200, 300); css(dn, { borderColor: K.g1, borderWidth: '3px', background: K.mint });
  dn.innerHTML = `<div style="position:absolute;left:28px;top:22px;font:700 34px 'Sans SC';color:${K.forest}">下层 · WiredTiger</div>`;
  const TREE = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none"><rect x="50" y="4" width="50" height="18" rx="4" fill="${K.ink}"/>${[0, 1, 2, 3].map((i) => `<path d="M75 22L${17 + i * 38} 58" stroke="${K.ink}" stroke-width="2"/><rect x="${4 + i * 38}" y="58" width="28" height="34" rx="4" fill="#fff" stroke="${K.g1}" stroke-width="2"/>`).join('')}</svg>`;
  const CKPT = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none"><path d="M6 48h138" stroke="${K.gb}" stroke-width="3"/>${[30, 100].map((x) => `<rect x="${x}" y="22" width="8" height="52" rx="2" fill="${K.forest}"/>`).join('')}</svg>`;
  const LOG = `<svg width="150" height="96" viewBox="0 0 150 96" fill="none">${[0, 1, 2, 3].map((i) => `<rect x="${6 + i * 36}" y="34" width="30" height="28" rx="4" fill="${K.blue}"/>`).join('')}</svg>`;
  const parts = [[TREE, 'B 树', 'B 树'], [CKPT, '检查点', '检查点'], [LOG, '日志', '日志']].map(([svg, lab, w], i) => {
    const e = h('div', 'abs', dn); css(e, { left: 30 + i * 390 + 'px', top: '82px', width: '360px', height: '196px', background: K.mint2, border: '2px solid ' + K.g1, borderRadius: '12px', padding: '10px 14px', boxSizing: 'border-box' });
    e.innerHTML = `<div style="position:absolute;left:0;top:0">${svg}</div><div style="position:absolute;left:0;top:112px;font:700 36px 'Sans SC';color:${K.ink}">${lab}</div>`;
    show(e, T('j6d', w) - 0.25, { y: 12, d: 0.45 });
    return e;
  });
  show(up, tL + 0.35, { y: -12, d: 0.5 });
  show(noT, T('j6c', '没有表') - 0.15, { x: 14, y: 0, d: 0.45 }); to(up, T('j6c', '上面') - 0.2, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 }); show(noTs, T('j6c', '没有表') - 0.15, { y: 0, s: 0.8, d: 0.4 });
  const dnA = link(ov, [[960, 436], [960, 536]], 'spring', { w: 6, arrow: true });
  arrowIn(dnA, T('j6d', '往下走') - 0.25, 0.45);
  show(dn, T('j6d', '往下走') - 0.05, { y: 14, d: 0.5 });
  // 键和值：下层这几棵树里，存的都是一项项键和值（A13）
  const tK = T('j7') - 0.35;
  fadeOut([up, dn, dnA], tK, 0.5);
  const kv = h('div', 'panel', world); px(kv, 140, 240, 820, 420); css(kv, { borderColor: K.g1, borderWidth: '3px' });
  kv.innerHTML = `<div style="position:absolute;left:28px;top:20px;font:700 36px Inter;color:${K.forest}">WiredTiger</div>` + [['2049', '5c000000 07 5f69…'], ['2050', '2f000000 07 5f69…'], ['2051', '5c000000 07 5f69…']].map(([k, v], i) => `<div class="kvr" style="position:absolute;left:28px;top:${100 + i * 92}px;width:760px;height:72px;border:2px solid ${K.gl1};border-radius:8px;background:#fff"><span class="kk" style="position:absolute;left:20px;top:14px;font:700 34px Mono;color:${K.ink}">${k}</span><span style="position:absolute;left:140px;top:16px;font:600 30px Inter;color:${K.gd1}">→</span><span class="kvv" style="position:absolute;left:200px;top:16px;font:500 30px Mono;color:${K.gd2}">${v}</span></div>`).join('');
  show(kv, tK + 0.3, { y: 14, d: 0.5 });
  const kvr = [...kv.querySelectorAll('.kvr')]; set(kvr, s.start, { autoAlpha: 0 });
  kvr.forEach((e, i) => show(e, T('j7', '一项') - 0.3 + i * 0.25, { x: -14, y: 0, d: 0.4 }));
  kv.querySelectorAll('.kk').forEach((e) => css(e, { borderRadius: '6px', padding: '0 10px', marginLeft: '-10px' })); to([...kv.querySelectorAll('.kk')], T('j7', '键和值') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 }); to(kvr, T('j7', '键和值') + 0.1, { backgroundColor: K.gl2, duration: 0.35 });
  to([...kv.querySelectorAll('.kk')], T('j9', '键') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  to([...kv.querySelectorAll('.kvv')], T('j9', '值') - 0.2, { color: K.ink, duration: 0.35 });
  // 键值数据库：NoSQL 四类里的一类，更简单（N01）
  const cats = ['文档', '键值', '宽列', '图'].map((n, i) => { const e = h('div', 'abs', world, n); px(e, 1040 + (i % 2) * 380, 250 + Math.floor(i / 2) * 200, 340, 170); css(e, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px', font: '700 46px/166px "Sans SC"', textAlign: 'center', color: K.gd2 }); return e; });
  cats.forEach((e, i) => show(e, T('j8') + 0.1 + i * 0.12, { y: 14, d: 0.45 }));
  to(cats[1], T('j8', '一类') - 0.2, { borderColor: K.forest, backgroundColor: K.forest, color: '#FFFFFF', duration: 0.4 });
  const simple = tg(world, 1040, 670, '每一项：一个键、一个值', 'g'); css(simple, { fontSize: '30px', lineHeight: '54px', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '0 16px' });
  show(simple, T('j9', '每一项') - 0.3, { y: 10, d: 0.45 });
  const simple2 = tg(world, 1420, 670, '更简单的一类', 'g'); css(simple2, { fontSize: '34px', lineHeight: '62px', color: '#FFFFFF', background: K.forest, padding: '0 24px', borderRadius: '10px', padding: '0 16px' });
  show(simple2, T('j9', '更简单') - 0.3, { x: 10, y: 0, d: 0.45 });
  const inMemI = h('div', 'abs', world, ico('mem', 40, K.forest, 2.4)); px(inMemI, 1040, 732, 40, 40);
  const inMem = h('div', 'abs', world, '常把数据放在内存里，读写很快'); px(inMem, 1094, 734); css(inMem, { font: '700 30px/54px "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '0 16px', top: '730px' });
  show(inMemI, T('j9b', '这一类') - 0.2, { y: 0, s: 0.7, d: 0.4 }); show(inMem, T('j9b', '这一类') - 0.1, { y: 10, d: 0.45 });   // N01
  to(inMem, T('j9b', '很快') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  to(cats[1], T('j9', '数据库') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  to([kv, cats[0], cats[2], cats[3]], Tend('j9b') + 0.5, { opacity: 0.35, duration: 0.45 });
  // 数据住在哪里：MongoDB 住在磁盘的树里，内存是缓存 → 倒过来
  const tH = T('j10') - 0.3;
  fadeOut([kv, ...cats, simple, simple2, inMem, inMemI], tH, 0.5);
  const mem = h('div', 'abs', world); px(mem, 360, 260, 1200, 150); css(mem, { background: K.gl3, border: '3px solid ' + K.gb, borderRadius: '14px', transformOrigin: '50% 0' });
  mem.innerHTML = `<div style="position:absolute;left:24px;top:20px">${ico('mem', 48, K.gd2, 2.4)}</div><div class="mt_" style="position:absolute;left:92px;top:26px;font:700 36px 'Sans SC';color:${K.ink}">内存 · 只是缓存</div>`;
  const dsk = h('div', 'abs', world); px(dsk, 360, 470, 1200, 330); css(dsk, { background: '#fff', border: '3px solid ' + K.forest, borderRadius: '14px', transformOrigin: '50% 100%' });
  dsk.innerHTML = `<div style="position:absolute;left:24px;top:20px">${ico('disk', 48, K.forest, 2.4)}</div><div class="dt_" style="position:absolute;left:92px;top:26px;font:700 36px 'Sans SC';color:${K.forest}">磁盘 · 数据住在这里的树里</div>` +
    `<div class="tr_" style="position:absolute;left:420px;top:110px"><div style="width:120px;height:30px;margin-left:150px;background:${K.ink};border-radius:5px"></div><div style="display:flex;gap:16px;margin-top:60px">${[0, 1, 2, 3].map(() => `<div style="width:90px;height:90px;background:#fff;border:2px solid ${K.gl1};border-radius:6px"></div>`).join('')}</div></div>`;
  show(mem, tH + 0.3, { y: -14, d: 0.5 }); show(dsk, tH + 0.45, { y: 14, d: 0.5 });
  to(dsk, T('j10', '树') - 0.2, { backgroundColor: K.mint, duration: 0.35 });
  to(mem.querySelector('.mt_'), T('j10', '缓存') - 0.2, { color: K.gd1, duration: 0.35 });
  to(mem.querySelector('.mt_'), T('j11', '倒过来') + 0.0, { color: K.ink, duration: 0.35 });
  // 倒过来：内存变大装下全部数据，磁盘缩成「保存一份」
  const tF = T('j11', '倒过来') - 0.3;
  to(mem, tF, { height: 380, borderColor: K.forest, backgroundColor: K.mint, duration: 0.9, ease: 'power2.inOut' });
  to(dsk, tF, { y: 240, height: 120, backgroundColor: '#FFFFFF', borderColor: K.gb, duration: 0.9, ease: 'power2.inOut' });
  textAt(mem.querySelector('.mt_'), [[0, '内存 · 只是缓存'], [tF + 0.3, '内存 · 数据全住在这里']]);
  textAt(dsk.querySelector('.dt_'), [[0, '磁盘 · 数据住在这里的树里'], [tF + 0.3, '磁盘 · 只用来保存一份']]);
  fadeOut(dsk.querySelector('.tr_'), tF, 0.3);
  const allD = h('div', 'abs', mem); css(allD, { left: '92px', top: '100px', display: 'flex', gap: '12px', flexWrap: 'wrap', width: '1000px' });
  allD.innerHTML = Array.from({ length: 30 }, () => `<span style="width:52px;height:40px;background:${K.forest};border:2px solid ${K.forest};border-radius:5px"></span>`).join('');
  show(allD, T('j11', '内存') - 0.2, { y: 10, d: 0.5 });
  to(mem, T('j11', '内存') - 0.2, { color: K.forest, duration: 0.3 });
  // 进程一死：内存熄掉，靠什么回来？
  const tD = T('j12', '一死') - 0.3;
  const kb = h('div', 'abs', world, ico('bolt', 80, K.red, 3)); px(kb, 1460, 236, 80, 80);
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
  const nx = h('div', 'abs', P.main, '下一集 · 系列最终集'); px(nx, 0, 400); css(nx, { font: '500 46px "Inter", "Sans SC"', color: K.gd2 });
  const tt = h('div', 'abs', P.main, 'Redis'); px(tt, -8, 470); css(tt, { font: '900 220px/1.1 "Inter"', color: K.ink });
  const rule = h('div', 'abs', P.main); px(rule, 0, 740, 760, 5); css(rule, { background: K.spring, transformOrigin: '0 50%' });
  const sub = h('div', 'abs', P.main, '一个更简单的数据库'); px(sub, 0, 772); css(sub, { font: '500 60px "Serif SC"', color: K.forest });
  show(cr, t13 + 0.3, { x: -16, y: 0, d: 0.5 }); slam(badge, t13 + 0.5, { from: 1.2 }); show(nx, t13 + 0.7, { y: 12, d: 0.5 });
  show(sub, T('j13', '更简单') - 0.2, { y: 16, d: 0.55 });
  slam(tt, T('j14') - 0.1, { from: 1.12 }); sfx('thud', T('j14'));
  fromTo(rule, T('j14') + 0.2, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' });
  tl.set([world, ch.c], { autoAlpha: 0 }, t13 + 0.45);
  // PART 7 那一项换深绿：叠一个深绿的副本淡入（不补间原元素的字色，倒着 seek 也确定）
  const it7 = P.items[6].cloneNode(true); P.items[6].parentNode.appendChild(it7); css(it7, { color: K.forest, opacity: 0 }); fromTo(it7, Tend('j14') + 0.8, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
  // 片尾名单之前，卡片淡出（不硬切）
  fadeOut(P.el, s.end + 0.12, 0.3);
});
