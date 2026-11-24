// 第 03 章 增（第 4 轮重做）：4096 个人按注册的先后填满一张格子，Alice 是第 2050 格 → 驱动替她加上 _id（ObjectId）→
// 整份编码成 47 个字节，一个字段接一个字段，字段名占 13 个 → 还缺一个键：RecordId 从 1 往上数到 2050 →
// 三棵树各写一项（键与值各是什么），两个索引都指回 2050 → Dave 注册：三处写入，中途停掉会留下缺口；放进一个事务，一起生效。
// 事实：环境与版本、A05（4096 份按写入顺序，Alice 第 2050）、A01 I06（驱动生成 ObjectId）、A03 A04（47 字节逐段，字段名 13 字节）、
//       A05 02 回显（showRecordId）、B05 B06 B07（三棵树里的项）、B09 H04（索引建好后一次插入写三棵树、同一个事务）、I07（事务、提交）。
scene('insert', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '03 增');

  // ══ 一、4096 个人：一人一格，按注册的先后填满（A05） ══
  const P1 = [];
  const GX = 170, GY = 222, CELL = 11, N = 64, GW = CELL * N;
  const grid = h('div', 'abs', world); px(grid, GX, GY, GW, GW); css(grid, { background: K.gl3, border: '2px solid ' + K.gl1 }); P1.push(grid);
  const rows = [];
  for (let r = 0; r < N; r++) { const b = h('div', 'abs', grid); css(b, { left: 0, top: r * CELL + 'px', height: CELL + 'px', width: '0px', background: K.gb }); rows.push(b); }
  grid.insertAdjacentHTML('beforeend', `<svg class="abs" style="left:0;top:0" width="${GW}" height="${GW}"><defs><pattern id="gp" width="${CELL}" height="${CELL}" patternUnits="userSpaceOnUse"><path d="M${CELL} 0V${CELL}H0" fill="none" stroke="#F9FBFA" stroke-width="1.6"/></pattern></defs><rect width="${GW}" height="${GW}" fill="url(#gp)"/></svg>`);
  show(grid, T('b1') - 0.1, { y: 12, d: 0.5 });
  const tF0 = T('b1', '一共') - 0.1, tF1 = T('b1', '个') + 0.1;   // 数字念到哪，格子就填到哪
  rows.forEach((b, r) => fromTo(b, tF0 + (tF1 - tF0) * r / N, { width: 0 }, { width: GW, duration: (tF1 - tF0) / N + 0.02, ease: 'none' }));
  const cnt = h('div', 'abs', world, '0'); px(cnt, 930, 300); css(cnt, { font: '800 120px "Inter"', color: K.ink }); P1.push(cnt);
  const cntT = tg(world, 936, 450, '个用户 · users', 'b'); css(cntT, { fontSize: '34px' }); P1.push(cntT);
  show([cnt, cntT], T('b1', '一共') - 0.3, { y: 12, d: 0.5 });
  stepTo(cnt, [[tF0, tF1 - tF0, 0, 4096]], (v) => String(Math.round(v)));
  // 按注册的先后：第 1 个在左上，第 4096 个在右下；一道亮条按顺序扫过
  const oA = tg(world, GX + GW + 16, GY - 6, '← 第 1 个', 'b'), oZ = tg(world, GX + GW + 16, GY + GW - 38, '← 第 4096 个', 'b'); P1.push(oA, oZ);
  [oA, oZ].forEach((e) => css(e, { fontSize: '26px', color: K.forest }));
  show(oA, T('b1', '按') - 0.2, { x: 10, y: 0, d: 0.35 }); show(oZ, T('b1', '先后') - 0.2, { x: 10, y: 0, d: 0.35 });
  const sweep = h('div', 'abs', grid); css(sweep, { left: 0, top: 0, width: GW + 'px', height: CELL + 'px', background: K.spring, opacity: 0 });
  const sw0 = T('b1', '注') - 0.1, sw1 = T('b1', '来') + 0.1;   // 位置与透明度只由 t 算出
  F((t) => { if (t < sw0 || t > sw1 + 0.3) { sweep.style.opacity = '0'; return; } const ph = Math.min(1, (t - sw0) / (sw1 - sw0)); sweep.style.opacity = String(t > sw1 ? 0.85 * (1 - (t - sw1) / 0.3) : 0.85); sweep.style.transform = `translateY(${ph * (GW - CELL)}px)`; });
  // Alice：第 2050 个 → 第 33 行第 2 格（从 0 数是第 2049 格）
  const ar = Math.floor(2049 / N), ac = 2049 % N;
  const aCell = h('div', 'abs', world); px(aCell, GX + 2 + ac * CELL - 6, GY + 2 + ar * CELL - 6, CELL + 12, CELL + 12); css(aCell, { background: K.spring, border: '3px solid ' + K.forest, borderRadius: '3px' }); P1.push(aCell);
  show(aCell, T('b2', 'Alice') - 0.2, { y: 0, s: 2.5, d: 0.5 });
  const ovG = overlay(world);
  const aL = lead(ovG, [[GX + ac * CELL + 20, GY + ar * CELL + 8], [930, GY + ar * CELL + 8]], { color: 'accent', w: 2.5 }); P1.push(aL);
  const aT = tg(world, 940, GY + ar * CELL - 26, 'Alice · 第 2050 个', 'g'); css(aT, { fontSize: '40px', lineHeight: '64px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 20px' }); P1.push(aT);
  draw(aL, T('b2', 'Alice'), 0.5); show(aT, T('b2', '第') - 0.3, { x: 16, y: 0, d: 0.5 });
  const tP1 = T('b3') - 0.4;
  fadeOut(P1, tP1, 0.5);

  // ══ 二、应用递过来的只有名字和年龄；驱动生成 _id（A01 I06） ══
  const P2 = [];
  const app = h('div', 'panel', world); px(app, 150, 240, 740, 470); P2.push(app);
  icon(app, 26, 24, 'doc', 48, K.gd2, 2.4);
  const appT = h('div', 'abs', app, '应用'); css(appT, { left: '88px', top: '28px', font: '700 38px "Sans SC"', color: K.ink });
  const drv = h('div', 'abs', app, '驱动程序'); css(drv, { left: '480px', top: '20px', padding: '8px 20px', font: '700 30px "Sans SC"', color: K.forest, background: K.mint, border: '2px solid ' + K.g1, borderRadius: '10px' });
  show(app, T('b3') - 0.2, { y: 16, d: 0.55 }); to(app, T('b5') - 0.1, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 });
  set(drv, s.start, { autoAlpha: 0, backgroundColor: K.ink, borderColor: K.ink, color: '#FFFFFF' }); show(drv, T('b4', '_id') - 0.2, { y: 10, d: 0.45 });
  const glDrv = gl(world, 150, 744, '驱动程序', '某一种编程语言里和 MongoDB 交互用的客户端库', { key: '驱动程序' }); P2.push(glDrv);   // I08
  show(glDrv, T('b5', '驱动') - 0.1, { x: 12, y: 0, d: 0.4 });
  to(drv, T('b5', '驱动') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.4 });
  const D = docCard(world, 180, 340, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 680, fs: 32 });
  const idr = D.r._id; css(idr, { overflow: 'hidden' }); P2.push(D.c);
  show(D.c, T('b3', '名字') - 0.4, { y: 12, d: 0.5 });
  solid(D.r.name, T('b3', '名字') - 0.1, 'new', [T('b4', '这时候') - 0.3, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...D.r.name.querySelectorAll('span')], T('b3', '名字') - 0.1, { color: '#FFFFFF', duration: 0.35 }); to([...D.r.name.querySelectorAll('span')], T('b4', '这时候') - 0.3, { clearProps: 'color', duration: 0.01 });
  solid(D.r.age, T('b3', '年龄') - 0.1, 'new', [T('b4', '这时候') - 0.3, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); to([...D.r.age.querySelectorAll('span')], T('b3', '年龄') - 0.1, { color: '#FFFFFF', duration: 0.35 }); to([...D.r.age.querySelectorAll('span')], T('b4', '这时候') - 0.3, { clearProps: 'color', duration: 0.01 });
  to(D.c, T('b4', '那项') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(D.c, T('b5', '生成') + 0.4, { backgroundColor: '#FFFFFF', duration: 0.35 });
  tl.fromTo(idr, { height: 0, autoAlpha: 0 }, { height: 48, autoAlpha: 1, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('b5', '生成') - 0.1);
  to(idr, T('b5', 'Object') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.4 }); classAt(idr, 'inv', T('b5', 'Object') - 0.2, T('b6') - 0.35);
  // 右边：ObjectId 的 12 个字节（A04 里的那一份）
  const oidB = h('div', 'abs', world); px(oidB, 960, 330, 860); P2.push(oidB);
  oidB.innerHTML = `<div style="font:700 34px 'Inter';color:${K.ink};margin-bottom:18px">ObjectId · 12 个字节</div><div style="display:flex;gap:8px">${'6a fa 6c a2 6f 27 50 6c fb 0a 4e 81'.split(' ').map((b) => `<span style="width:62px;height:66px;border-radius:8px;background:${K.mint};border:2px solid ${K.g1};font:600 30px/62px Mono;text-align:center;color:${K.ink}">${b}</span>`).join('')}</div>`;
  show(oidB, T('b5', 'Object') - 0.2, { x: 20, y: 0, d: 0.5 });
  // 12 个字节分三段：时间戳 4、随机值 5、计数器 3（策划者 r5：「ObjectID要有图注」）
  const OSEG = [[0, 4, '时间戳 · 4 字节', '生成的那一秒'], [4, 9, '随机值 · 5 字节', '每个客户端进程一个'], [9, 12, '计数器 · 3 字节', '同一进程里逐个加 1']];
  const oSegs = OSEG.map(([a, b, t1, t2], k) => {
    const g = h('div', 'abs', world); px(g, 960 + a * 70, 330 + 136, (b - a) * 70 - 8);
    g.innerHTML = `<div style="height:10px;border:2.5px solid ${K.forest};border-top:none;border-radius:0 0 4px 4px"></div><div style="margin-top:6px;font:700 24px/32px Inter,'Sans SC';color:${K.forest}">${t1}</div><div style="font:500 22px/30px 'Sans SC';color:${K.gd2}">${t2}</div>`;
    show(g, T('b5', 'Object') + 0.4 + k * 0.4, { y: 8, d: 0.4 }); P2.push(g); return g;
  });
  const glO = gl(world, 960, 598, 'ObjectId', '12 字节的 BSON 类型，<br>默认用作 _id', { key: 'ObjectId' });   // T10 A15 A15b
  show(glO, T('b5', 'Object') - 0.2, { x: 14, y: 0, d: 0.45 }); fadeOut(glO, T('b6') - 0.35, 0.5);   // 跟旁边的 12 字节图一起退场
  const tP2 = T('b6') - 0.35;
  fadeOut([app, oidB, ...oSegs, glDrv], tP2, 0.5);
  tl.to(D.c, { x: 640 - 180, y: 222 - 340, scale: 0.85, transformOrigin: '0 0', duration: 0.8, ease: 'power2.inOut' }, tP2);
  to(idr, tP2, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 });   // lint-ok: 取消高亮

  // ══ 三、BSON：47 个字节，一个字段接一个字段（A03 A04） ══
  const BX = 128, BY = 560, BW2 = 32, BG = 4;
  const by = byteRow(world, BX, BY, 47, BG, BW2);
  by.all.forEach((e, i) => { css(e, { height: '72px', lineHeight: '70px', fontSize: '22px' }); show(e, T('b6', '编码') - 0.1 + i * 0.025, { y: -40, d: 0.35 }); });
  const xB = (i) => BX + i * (BW2 + BG);
  const bsonT = h('div', 'abs', world, 'BSON'); px(bsonT, BX, 474); css(bsonT, { font: '800 48px "Inter"', color: K.forest });   // 收小一号，不贴右边 _id\\0 的标签
  show(bsonT, T('b6', 'B') - 0.2, { y: 10, d: 0.45 }); css(bsonT, { borderRadius: '12px', padding: '0 18px', marginLeft: '-18px' }); to(bsonT, T('b6b', '缩写') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });   // 「缩写」：BSON 这个词成为实心块
  const glB = gl(world, BX, 236, 'BSON', 'MongoDB 存文档、收发数据用的<br>二进制格式，名字来自 Binary JSON：<br>像 JSON 的文档编成一个个字节，<br>还多了日期等 JSON 没有的类型');   // T09 A14
  show(glB, T('b6', 'B') + 0.1, { x: 14, y: 0, d: 0.45 });
  // b6b：BSON = Binary JSON（A14）
  const bj = h('div', 'abs', world); px(bj, BX + 200, 474); css(bj, { font: '700 42px/68px "Inter"', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 24px', whiteSpace: 'nowrap' });
  bj.innerHTML = '= <b style="color:#FFFFFF">B</b>inary <b style="color:#FFFFFF">JSON</b>'; to([...bj.querySelectorAll('b')], T('b6b', 'Binary') - 0.2, { color: K.spring, duration: 0.35 });
  show(bj, T('b6b') - 0.1, { x: 16, y: 0, d: 0.45 });
  const bjZh = tg(world, BX + 690, 474, '二进制的 JSON', 'b'); css(bjZh, { fontSize: '38px', lineHeight: '68px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 24px' });
  show(bjZh, T('b6b', '二进制') - 0.2, { x: 12, y: 0, d: 0.4 });
  // b6c：上面那份像 JSON 的写法，存下来是下面这一排字节
  const likeJ = tg(world, 1250, 236, '像 JSON 的写法', 'g'); css(likeJ, { fontSize: '34px', lineHeight: '62px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 22px' });
  show(likeJ, T('b6c', 'JSON') - 0.25, { x: 12, y: 0, d: 0.4 });
  to(D.c, T('b6c', 'JSON') - 0.25, { borderColor: K.g1, duration: 0.35 });
  const toB = link(ov, [[1150, 456], [1150, 548]], 'ink', { w: 3, arrow: true });
  arrowIn(toB, T('b6c', '存下来') - 0.2, 0.45); to(D.c, T('b6c', '存下来') - 0.2, { backgroundColor: K.mint2, duration: 0.4 });
  to(by.all, T('b6c', '一个个') - 0.2, { color: K.ink, backgroundColor: K.gl1, duration: 0.4 });
  // b6d：每个值的类型（一个字节）和长度也记在里面（A04：07 ObjectId、02 字符串、10 int32；总长 4 字节、字符串长度 4 字节）
  const TYP = [4, 21, 37], LEN = [0, 1, 2, 3, 27, 28, 29, 30];
  const tTy = T('b6d', '类型') - 0.25, tLe = T('b6d', '多长') - 0.25;
  TYP.forEach((i, k) => to(by.all[i], tTy + k * 0.12, { backgroundColor: K.ink, borderColor: K.ink, color: '#FFFFFF', duration: 0.35 }));
  LEN.forEach((i, k) => to(by.all[i], tLe + (i > 4 ? 0.2 : 0) + (k % 4) * 0.04, { backgroundColor: K.gd2, borderColor: K.gd2, color: '#FFFFFF', duration: 0.35 }));
  const tyTags = TYP.map((i) => { const e = tg(world, xB(i) - 10, BY + 84, '类型', 'm'); css(e, { fontSize: '24px', fontWeight: 700, color: K.ink }); show(e, tTy + 0.1, { y: 8, d: 0.35 }); return e; });
  const leTags = [0, 27].map((i) => { const e = tg(world, xB(i), BY + 84, '长度', 'm'); css(e, { fontSize: '24px', fontWeight: 700, color: K.gd2 }); show(e, tLe + 0.1 + (i ? 0.2 : 0), { y: 8, d: 0.35 }); return e; });
  const tB7 = T('b7') - 0.3;
  fadeOut([bj, bjZh, likeJ, toB, ...tyTags, ...leTags], tB7, 0.4);
  to(D.c, tB7, { borderColor: K.gl1, backgroundColor: '#FFFFFF', duration: 0.35 });
  [...TYP, ...LEN].forEach((i) => to(by.all[i], T('b8', '里面') - 0.3, { backgroundColor: K.gl1, borderColor: K.gl1, color: K.ink, duration: 0.4 }));
  const n47 = tg(world, 1620, 462, '47 字节', 'big'); css(n47, { fontSize: '56px' });
  show(n47, T('b7', '47') - 0.2, { y: 10, d: 0.45 });
  fadeOut(D.c, T('b10') - 0.3, 0.4);
  [D.r._id, D.r.name, D.r.age].forEach((r, k) => { to(r, T('b8', '字段') - 0.2 + k * 0.45, { color: K.forest, duration: 0.3 }); });
  // 逐段：总长 | _id | name | age | 结尾（字节下方一道括号一个名字）
  const SEG = [[0, 4, '总长'], [4, 21, '_id'], [21, 37, 'name'], [37, 46, 'age'], [46, 47, '0']];
  const segEls = SEG.map(([a, b, n], k) => {
    const br = h('div', 'abs', world); px(br, xB(a) + 2, BY + 82, xB(b) - xB(a) - BG - 4, 14); css(br, { borderLeft: '3px solid ' + K.gd2, borderRight: '3px solid ' + K.gd2, borderBottom: '3px solid ' + K.gd2 });
    const t = tg(world, xB(a), BY + 106, n, 'm'); css(t, { width: xB(b) - xB(a) - 4 + 'px', textAlign: 'center', fontSize: '26px', fontWeight: 700, color: '#FFFFFF', background: K.ink, borderRadius: '6px', lineHeight: '40px' });
    return [br, t];
  });
  segEls.forEach(([br, t], k) => { const tt = k === 0 ? T('b8', '里面') - 0.2 : T('b8', '字段') - 0.2 + (k - 1) * 0.45; show([br, t], tt, { y: 8, d: 0.4 });
    const [a, b] = SEG[k]; to(by.all.slice(a, b), tt, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(by.all.slice(a, b), T('b9') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 }); });
  // 字段名：_id\0、name\0、age\0 三段变绿（13 个字节）
  const tName = T('b9', 'name') - 0.6;
  [D.r._id, D.r.name, D.r.age].forEach((r, k) => { solid(r, T('b9', '名字') - 0.2 + k * 0.12, 'new'); to([...r.querySelectorAll('span')], T('b9', '名字') - 0.2 + k * 0.12, { color: '#FFFFFF', duration: 0.35 }); });
  by.name.forEach((e, i) => to(e, tName + i * 0.03, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 }));
  to(by.name, T('b8', '名字') - 0.2, { color: K.forest, duration: 0.35 });
  const nameTags = [[5, '_id\\0'], [22, 'name\\0'], [38, 'age\\0']].map(([i, t]) => { const e = tg(world, xB(i) - 6, BY - 46, t, 'm'); css(e, { color: '#FFFFFF', background: K.forest, borderRadius: '6px', padding: '0 8px', fontWeight: 700, fontSize: '26px' }); return e; });
  nameTags.forEach((e, k) => show(e, tName + 0.2 + k * 0.35, { y: 8, d: 0.4 }));
  [8, 26, 41].forEach((i, k) => to(by.all[i], T('b9', '结尾') - 0.3 + k * 0.12, { color: '#FFFFFF', backgroundColor: K.red, borderColor: K.red, duration: 0.35 }));
  // 这些 0 是干什么的（策划者 r5：「结尾的0的作用和最后的0都没有简单图注」）
  const z1 = h('div', 'abs', world, '<b style="color:#DB3030">字段名后面的 0</b>：名字到此为止，字段名不另记长度'); px(z1, 960, 712);
  const z2 = h('div', 'abs', world, '<b style="color:#001E2B">最后一个 0</b>：整份文档的字段到这里为止'); px(z2, 960, 752);
  [z1, z2].forEach((e) => css(e, { font: '500 25px/36px "Inter", "Sans SC"', color: K.gd2, whiteSpace: 'nowrap' }));
  show(z1, T('b9', '结尾') + 0.1, { y: 8, d: 0.45 }); show(z2, Tend('b9') + 0.2, { y: 8, d: 0.45 });
  to(by.all[46], Tend('b9') + 0.1, { color: '#FFFFFF', backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 });
  to(segEls[4][1], Tend('b9') + 0.1, { backgroundColor: K.forest, duration: 0.35 });
  // 13 / 47：一根比例条
  const bar = h('div', 'abs', world); px(bar, BX, 800, 1692, 44); css(bar, { background: K.gl2, borderRadius: '6px' });
  const barF = h('div', 'abs', bar); css(barF, { left: 0, top: 0, bottom: 0, width: (13 / 47 * 100) + '%', background: K.spring, borderRadius: '6px 0 0 6px', transformOrigin: '0 50%' });
  const barT = tg(world, BX + 1692 * 13 / 47 + 20, 802, '字段名 13 字节 / 共 47 字节', 'b'); css(barT, { fontSize: '32px' });
  show(bar, T('b10', '13') - 0.4, { y: 8, d: 0.4 }); fromTo(barF, T('b10', '13') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' });
  show(barT, T('b10', '13') + 0.2, { x: 14, y: 0, d: 0.45 });
  const q4 = h('div', 'abs', world); px(q4, BX + 1692 / 4 - 2, 786, 0, 72); css(q4, { borderLeft: '8px solid ' + K.ink }); q4.dataset.name = '四分之一';
  const q4T = tg(world, BX + 1692 / 4 - 30, 744, '1/4', 'm'); css(q4T, { fontSize: '28px', fontWeight: 700, color: '#FFFFFF', background: K.ink, borderRadius: '8px', lineHeight: '42px', width: '72px', textAlign: 'center' });
  show([q4, q4T], T('b10', '四分之一') - 0.2, { y: -6, d: 0.4 }); to(barF, T('b10', '还多') - 0.2, { backgroundColor: K.forest, duration: 0.35 });
  fadeOut([q4, q4T], T('b11') - 0.4, 0.5);
  const tP3 = T('b11') - 0.4;
  fadeOut([glB, bsonT, n47, ...segEls.flat(), ...nameTags, bar, barT, z1, z2], tP3, 0.5);
  // 47 个字节收拢成一个「值」块
  by.all.forEach((e, i) => tl.to(e, { x: (i - 23) * -BW2 * 0.82 + 0, duration: 0.7, ease: 'power2.inOut' }, tP3 + 0.1));

  // ══ 四、还缺一个键：RecordId（A05） ══
  const P4 = [];
  const valB = h('div', 'abs', world); px(valB, 760, 520, 900, 120); css(valB, { background: K.mint, border: '3px solid ' + K.g1, borderRadius: '12px' }); P4.push(valB);
  valB.innerHTML = `<div style="position:absolute;left:28px;top:16px;font:600 26px 'Sans SC';color:${K.forest}">值</div><div style="position:absolute;left:28px;top:54px;font:600 34px Mono;color:${K.ink}">Alice 的 BSON · 47 字节</div>`;
  const keyB = h('div', 'abs', world); px(keyB, 300, 520, 400, 120); css(keyB, { background: '#fff', border: '3px dashed ' + K.gb, borderRadius: '12px' }); P4.push(keyB);
  const keyL = h('div', 'abs', keyB, '键'); css(keyL, { left: '28px', top: '16px', font: '600 26px "Sans SC"', color: K.gd1 });
  const keyV = h('div', 'abs', keyB, '?'); css(keyV, { left: '28px', top: '48px', font: '800 48px "Mono"', color: K.gd1 });
  show(valB, tP3 + 0.6, { y: 0, d: 0.5 });
  fadeOut(by.all, tP3 + 0.65, 0.35);
  show(keyB, T('b11', '缺') - 0.2, { x: -30, y: 0, d: 0.5 }); to(keyB, T('b14', 'Re') - 0.2, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to([keyL, keyV], T('b14', 'Re') - 0.2, { color: K.ink, duration: 0.35 });
  const oidTry = h('div', 'abs', world, "ObjectId · 12 字节"); px(oidTry, 330, 420); css(oidTry, { font: '700 34px/72px "Mono", "Sans SC"', color: '#FFFFFF', background: K.gd2, borderRadius: '10px', padding: '0 40px' }); oidTry.dataset.name = 'oid-try';
  tl.fromTo(oidTry, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: true }, T('b11b', '集合树') - 0.2);
  tl.to(oidTry, { y: 120, duration: 0.5, ease: 'power2.in' }, T('b11b', '键'));
  tl.to(oidTry, { x: 10, duration: 0.08, yoyo: true, repeat: 3 }, T('b11b', '键') + 0.5);
  to(oidTry, T('b11b', '键') + 0.45, { backgroundColor: K.red, duration: 0.25 });   // 塞不进：变红再弹回
  tl.to(oidTry, { y: -10, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, T('b11b', '整数') - 0.1);
  textAt(keyV, [[0, '?'], [T('b11b', '整数') - 0.1, '整数']]); to(keyV, T('b11b', '整数') - 0.1, { color: K.ink, duration: 0.3 });
  // 发号器：从 1 往上数，数到 2050 落进键
  const disp = h('div', 'panel', world); px(disp, 300, 236, 560, 200); css(disp, { background: K.ink, borderColor: K.ink }); P4.push(disp);
  const dispT = h('div', 'abs', disp, 'RecordId'); css(dispT, { left: '28px', top: '22px', font: '700 36px "Mono"', color: K.spring });
  const dispS = h('div', 'abs', disp, '按写入的先后发'); css(dispS, { left: '28px', top: '78px', font: '500 26px "Sans SC"', color: K.gl1 });
  const dispN = h('div', 'abs', disp, '1'); css(dispN, { right: '32px', top: '60px', font: '800 96px "Mono"', color: '#FFFFFF' });
  show(disp, T('b12', '另发') - 0.3, { y: 14, d: 0.5 });
  to(disp, T('b12', '编号') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.4 }); to(dispT, T('b12', '编号') - 0.2, { color: '#FFFFFF', duration: 0.4 }); to(dispS, T('b12', '编号') - 0.2, { color: K.mint2, duration: 0.4 });
  stepTo(dispN, [[T('b13', '从') - 0.1, 2.4, 1, 2050]], (v) => String(Math.round(v)));
  const dKids = [...disp.querySelectorAll('div')], dCol = dKids.map((e) => e.style.color || '#FFFFFF');
  to(disp, T('b13', '从') - 0.25, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to(dKids, T('b13', '从') - 0.25, { color: K.ink, duration: 0.35 });   // 往上数的这一段，编号那块亮起来
  to(disp, T('b14') - 0.3, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 }); dKids.forEach((e, i) => to(e, T('b14') - 0.3, { color: dCol[i], duration: 0.35 }));   // 从 1 开始往上数到 2050
  to(keyB, T('b13', '按') - 0.1, { backgroundColor: '#A6F4C9', borderColor: K.g1, duration: 0.4 }); to([keyL, keyV], T('b13', '按') - 0.1, { color: K.ink, duration: 0.4 });   // 这个编号要填进键位
  const seqC = h('div', 'abs', world, ''); P4.push(seqC);
  const glR = gl(world, 920, 244, 'RecordId', 'MongoDB 给每份文档的内部编号：<br>64 位整数，按写入先后从 1 往上加', { cls: 'lg' }); P4.push(glR);   // A05 A13 B06 B07
  css(glR.querySelector('span'), { fontSize: '28px' });
  show(glR, T('b12', 'Re') - 0.2, { x: 16, y: 0, d: 0.5 });
  const fly = h('div', 'abs', world, '2050'); px(fly, 690, 296); css(fly, { font: '800 56px "Mono"', color: K.forest }); P4.push(fly);
  tl.fromTo(fly, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: true }, T('b14', '是') - 0.3);
  tl.to(fly, { x: 330 - 690, y: 566 - 296, duration: 0.7, ease: 'power2.inOut' }, T('b14', '是') - 0.05);
  to(keyB, T('b14', '是') + 0.6, { borderStyle: 'solid', borderColor: K.forest, backgroundColor: K.forest, duration: 0.4 }); to(keyL, T('b14', '是') + 0.6, { color: '#FFFFFF', duration: 0.4 }); to(fly, T('b14', '是') + 0.65, { color: K.spring, duration: 0.3 });
  fadeOut(keyV, T('b14', '是') - 0.05, 0.3);   // 2050 飞到之前，「整数」先退
  // 两个编号：_id 在文档里，RecordId 不在（showRecordId 才看得到，02 回显）
  const tCmp = T('b15') - 0.2;
  fadeOut([disp, glR], tCmp - 0.2, 0.4);
  const c1 = term(world, 300, 690, 1520, 250, 'mongosh', { fs: 26, lh: 40 }); P4.push(c1.c);
  show(c1.c, tCmp, { y: 14, d: 0.5 });
  c1.cmd(tCmp + 0.3, 'db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })', 'lab&gt; ', 60);
  const o1 = c1.out(tCmp + 1.2, '{ <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>), <span class="k">name</span>: <span class="s">\'Alice\'</span>, <span class="k">age</span>: <span class="n">42</span> }   <span style="color:#5C6C75">// 没有 RecordId</span>');
  c1.cmd(T('b15', '平时') - 0.3, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> }).<span class="k">showRecordId</span>()', 'lab&gt; ', 70);
  const o2b = c1.out(T('b15', '看不到') - 0.2, '{ <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>), <span class="k">name</span>: <span class="s">\'Alice\'</span>, <span class="k">age</span>: <span class="n">42</span>, <span class="k" style="background:#C0FAE6">\'$recordId\'</span>: Long(<span class="s">\'2050\'</span>) }');
  to(o1, Tend('b15') + 0.2, { opacity: 0.45, duration: 0.45 }); to(o2b.querySelector('span[style]'), Tend('b15') + 0.3, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });   // 上一条回显（没有 RecordId）退淡，留下带 $recordId 的这一条
  to([keyB, fly], T('b15', '平时') - 0.2, { opacity: 0.3, duration: 0.4 }); to([keyB, fly], T('b15', '看不到') + 0.3, { opacity: 1, duration: 0.4 });   // 平时的结果里没有它；showRecordId 回显出来，键位再亮
  const nums = [];
  const hid = h('div', 'abs', world, '');
  const tP4 = T('b16') - 0.4;
  fadeOut([...nums, hid], tP4, 0.5);
  fadeOut([valB, keyB, fly, c1.c], tP4, 0.5);

  // ══ 五、三棵树里各一项（B05 B06 B07） ══
  const TX3 = [150, 700, 1250], TW3 = 520;
  const NAMES = ['集合树', '_id 索引', '姓名索引'];
  const ent = TX3.map((x, i) => {
    const g = h('div', 'abs', world); px(g, x, 236, TW3, 580);
    const hd = h('div', 'abs', g, NAMES[i]); css(hd, { left: 0, top: 4, font: '700 36px/62px "Sans SC"', color: '#FFFFFF', background: i ? K.ink : K.forest, borderRadius: '12px', padding: '0 22px' });
    const box = h('div', 'abs', g); css(box, { left: 0, top: '80px', width: TW3 + 'px', height: '300px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '12px' });
    const kL = h('div', 'abs', box, '键'); css(kL, { left: '24px', top: '20px', font: '600 28px "Sans SC"', color: K.gd2 });
    const vL = h('div', 'abs', box, '值'); css(vL, { left: '24px', top: '156px', font: '600 28px "Sans SC"', color: K.gd2 });
    const kV = h('div', 'abs', box, ''); css(kV, { left: '24px', top: '62px', font: '700 38px "Mono"', color: K.ink, whiteSpace: 'nowrap' });
    const vV = h('div', 'abs', box, ''); css(vV, { left: '24px', top: '198px', font: '600 36px "Mono"', color: K.ink, whiteSpace: 'nowrap' });
    return { g, hd, box, kV, vV, kL, vL };
  });
  ent.forEach((e, i) => show(e.g, T('b16', '三棵') - 0.2 + i * 0.45, { y: 16, d: 0.5 }));
  const USE = ['拿 RecordId → 取出整份文档', '拿 ObjectId → 查到 RecordId', '拿名字 → 查到 RecordId'];
  const uses = ent.map((e, i) => { const u = h('div', 'abs', e.box, '用途：' + USE[i]); css(u, { left: '24px', top: '254px', font: '600 24px "Inter", "Sans SC"', color: K.ink, whiteSpace: 'nowrap' }); show(u, Tend(['b17', 'b18', 'b19'][i]) - 0.2, { y: 6, d: 0.4 }); return u; });
  // 集合树：键 2050，值整份 47 字节
  ent[0].kV.innerHTML = '2050'; ent[0].vV.innerHTML = 'BSON · <span class="n47">47 字节</span>';
  ent[1].kV.innerHTML = "ObjectId('6afa…4e81')"; ent[1].vV.innerHTML = '2050';
  css(ent[1].kV, { fontSize: '32px' });   // 框里留出右边的空
  ent[2].kV.innerHTML = '<span class="nm">"Alice"</span> <span class="r50">2050</span>'; ent[2].vV.innerHTML = '（空）';
  css(ent[2].kV.querySelector('.r50'), { marginLeft: '14px' });   // 名字与 RecordId 是键的两段，中间留空
  const r50 = [ent[0].kV, ent[1].vV, ent[2].kV.querySelector('.r50')];
  const fillT = [T('b17', '键'), T('b18', '键'), T('b19', '键')];
  const tU = T('b16', '用上');
  const kT = [tU, T('b18', '键'), tU + 0.3], vT = [T('b17', '值'), tU + 0.15, T('b19', '值')];
  ent.forEach((e, i) => { set([e.kV, e.vV], s.start, { autoAlpha: 0 }); show(e.kV, kT[i] - 0.1, { y: 8, d: 0.4 }); show(e.vV, vT[i] - 0.1, { y: 8, d: 0.4 }); to(e.box, fillT[i] - 0.1, { borderColor: K.g1, duration: 0.4 });
    to(e.kL, fillT[i] - 0.15, { color: K.forest, duration: 0.3 }); to(e.vL, [T('b17', '值'), T('b18', '值'), T('b19', '值')][i] - 0.15, { color: K.forest, duration: 0.3 }); });
  ent.forEach((e) => to([e.kL, e.vL], T('b20') - 0.2, { color: K.gd2, duration: 0.3 }));
  const boxOn = [[0, T('b17')], [1, T('b18')], [2, T('b19')], [1, T('b20')], [2, T('b21')]];
  boxOn.forEach(([i, t], k) => { to(ent[i].box, t - 0.1, { backgroundColor: '#A6F4C9', duration: 0.35 }); to(ent[i].box, (k + 1 < boxOn.length ? boxOn[k + 1][1] : T('b22')) - 0.15, { backgroundColor: '#FFFFFF', duration: 0.35 }); });
  const cellS = (e, t, kind) => { css(e, { borderRadius: '8px', padding: '0 12px', marginLeft: '-12px' }); solid(e, t, kind); };
  cellS(ent[0].kV, T('b17', '键') - 0.1, 'new'); cellS(ent[0].vV, T('b17', '值') - 0.1, 'ink');
  cellS(ent[1].kV, T('b18', '键') - 0.1, 'ink'); cellS(ent[1].vV, T('b18', '值') - 0.1, 'new'); to(ent[1].kV, T('b18', '值') - 0.2, { opacity: 0.35, duration: 0.35 }); to(ent[1].kV, T('b19') - 0.2, { opacity: 1, duration: 0.35 });   // 说到值时，键那一块退后
  to([ent[0].g, ent[2].g], T('b18', '她') - 0.1, { opacity: 0.4, duration: 0.4 }); to([ent[0].g, ent[2].g], T('b19') - 0.25, { opacity: 1, duration: 0.4 });   // 讲 _id 索引这一项：另外两棵退后
  cellS(ent[2].kV, T('b19', '键') - 0.1, 'ink'); to(ent[2].kV.querySelector('.r50'), T('b19', '再接') - 0.25, { color: K.spring, duration: 0.3 }); to(ent[2].kV.querySelector('.r50'), T('b19', '键') - 0.1, { color: K.spring, duration: 0.35 }); cellS(ent[2].vV, T('b19', '值') - 0.1, K.gd2); css(ent[2].kV.querySelector('.r50'), { borderRadius: '6px', padding: '0 6px' }); to(ent[2].kV.querySelector('.r50'), T('b19', '二零') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  // 键的两段：名字、RecordId；值是空的，因为要找的 2050 已经在键里
  const kPart = (el, txt) => { const e = h('div', 'abs', ent[2].box, txt); css(e, { left: 12 + el.offsetLeft + el.offsetWidth / 2 + 'px', top: '116px', transform: 'translateX(-50%)', font: '600 22px "Inter", "Sans SC"', color: K.forest, whiteSpace: 'nowrap' }); return e; };
  const kpN = kPart(ent[2].kV.querySelector('.nm'), '名字'), kpR = kPart(ent[2].kV.querySelector('.r50'), 'RecordId');
  show(kpN, T('b19', 'Alice') - 0.1, { y: -6, d: 0.35 }); show(kpR, T('b19', '再接') + 0.2, { y: -6, d: 0.35 });
  const vWhy = h('div', 'abs', ent[2].box, '← 要找的 2050 已经在键里'); css(vWhy, { left: 12 + ent[2].vV.offsetWidth + 18 + 'px', top: '204px', font: '600 22px/36px "Inter", "Sans SC"', color: K.forest, whiteSpace: 'nowrap' });
  show(vWhy, T('b19', '空') - 0.1, { x: -8, y: 0, d: 0.35 });
  to(ent[0].vV, T('b17', '47') - 0.15, { color: K.spring, duration: 0.35 }); to(ent[0].box, T('b17', '整份') - 0.2, { backgroundColor: '#7DEBB0', duration: 0.35 });
  to(ent[2].hd, T('b19', 'Alice') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); to(ent[2].box, T('b19', '二零') - 0.2, { backgroundColor: '#7DEBB0', duration: 0.35 });
  // 为什么不一样：_id 不会重复 → 放在值里；名字会重名 → 接在键后面
  r50.forEach((e, i) => to(e, T('b16', '用上') - 0.2 + i * 0.15, { color: K.forest, duration: 0.35 }));
  const vR = h('div', 'abs', world, '');

  const uq = h('div', 'abs', world, '');
  const one = h('div', 'abs', world, '');
  const dup = h('div', 'abs', world); px(dup, TX3[2], 650, TW3, 200); css(dup, { font: '600 30px/1.6 "Mono"', color: K.gd2 });
  dup.innerHTML = `<div style="padding:4px 14px;border:2px solid ${K.forest};border-radius:8px;background:${K.forest};color:#FFFFFF;display:inline-block">"Alice" 2050</div><br><div style="padding:4px 14px;border:2px solid ${K.gd1};border-radius:8px;background:${K.gd1};color:#FFFFFF;display:inline-block;margin-top:10px">"Alice" 3001</div><span style="font:500 22px 'Sans SC';color:${K.gd1};margin-left:14px">假如另有一个 Alice</span>`
    + `<div style="font:600 24px/1.45 'Inter','Sans SC';color:${K.ink};margin-top:10px;white-space:normal">同一个键只能有一项，接上编号就分开</div>`;   // U06
  show(dup, T('b21', '重名') - 0.2, { y: 10, d: 0.5 });
  const dup2 = dup.children[2], dupH = dup.children[3], dupN = dup.children[4]; set([dup2, dupH, dupN], s.start, { autoAlpha: 0 }); show([dup2, dupH], T('b21', '同名') - 0.25, { y: 8, d: 0.4 }); show(dupN, T('b21', '重名') - 0.2, { y: 8, d: 0.4 });
  to(ent[1].hd, T('b20', '_id 索引') - 0.2, { color: K.spring, duration: 0.35 }); to(ent[1].kV, T('b20', '_id 索引') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  to(ent[1].vL, T('b20', '值里') - 0.2, { color: K.forest, duration: 0.35 });
  to(ent[1].vV, T('b20', '2050') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 });
  [0, 2].forEach((i) => { to(ent[i].g, T('b20', '索引') - 0.2, { opacity: 0.3, duration: 0.4 }); to(ent[i].g, T('b21') - 0.2, { opacity: 1, duration: 0.4 }); });   // 只看 _id 索引这一项
  to(ent[2].kL, T('b21', '接在') - 0.2, { color: K.forest, duration: 0.35 });
  // 两个索引都指回 2050：从下面绕回集合树
  const back1 = link(ov, [[TX3[1] + 60, 618], [TX3[1] + 60, 770], [TX3[0] + 160, 770], [TX3[0] + 160, 620]], 'accent', { w: 4, arrow: true });
  const back2 = link(ov, [[TX3[2] + 260, 618], [TX3[2] + 260, 820], [TX3[0] + 100, 820], [TX3[0] + 100, 620]], 'accent', { w: 4, arrow: true });
  fadeOut([uq, vR, one], T('b22') - 0.3, 0.4); fadeOut(dup, T('b22', '指回') - 0.65, 0.3);   // 同名的例子多留一会儿，绕回来的箭头出来之前收掉
  arrowIn(back1, T('b22', '指回') - 0.4, 0.7); arrowIn(back2, T('b22', '指回') - 0.2, 0.8);
  to(ent[0].box, T('b22', '2050') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); to(ent[0].box, T('b24') - 0.4, { backgroundColor: '#FFFFFF', duration: 0.4 });
  const tP5 = T('b24') - 0.4;
  fadeOut([back1, back2], tP5, 0.4); fadeOut([kpN, kpR, vWhy], tP5, 0.4);
  ent.forEach((e) => { to(e.box, tP5, { borderColor: K.gl1, duration: 0.4 }); fadeOut([e.kV, e.vV], tP5, 0.4); });
  fadeOut(uses, tP5, 0.4);

  // ══ 六、Dave：三处写入；中途停掉留下缺口；放进一个事务（B09 H04 I07） ══
  const dave = chip(world, 840, 880, 'Dave 注册 · RecordId 4097', 'dk'); css(dave, { fontSize: '30px' });
  show(dave, T('b24', 'D') - 0.3, { y: 10, d: 0.45 });
  const W3 = [['4097', 'BSON'], ["ObjectId('…')", '4097'], ['"Dave" 4097', '']];
  const tok = ent.map((e, i) => { const t = h('div', 'abs', world, `<b style="font-family:Mono">${W3[i][0]}</b>`); px(t, 960 - 140, 700, 280); css(t, { textAlign: 'center', font: '600 30px "Mono"', color: '#FFFFFF', background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', padding: '8px 0' }); return t; });
  const tgt = (i) => ({ x: TX3[i] + 20 - (960 - 140), y: 236 + 80 + 70 - 700 });
  // 第一遍：一处一处写，写完两处进程停了
  const tW = T('b24', '各写') - 0.3;
  tok.forEach((t, i) => { tl.fromTo(t, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tW + i * 0.45); tl.to(t, { ...tgt(i), duration: 0.55, ease: 'power2.inOut' }, tW + 0.1 + i * 0.45); });
  const tTx = T('b26', '同一个') - 0.4, tTxPre = () => tTx - 0.1;
  // 回放：重来一遍，第三处还没写进程就停了
  const tR = T('b25') - 0.1;
  tok.forEach((t) => fadeOut(t, tR - 0.3, 0.3));
  const tok2 = tok.map((t) => { const c = t.cloneNode(true); world.appendChild(c); return c; });
  tok2.forEach((t, i) => { if (i < 2) { tl.fromTo(t, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tR + 0.2 + i * 0.5); tl.to(t, { ...tgt(i), duration: 0.5, ease: 'power2.inOut' }, tR + 0.3 + i * 0.5); } else set(t, s.start, { autoAlpha: 0 }); });
  const stop = h('div', 'abs', world, ico('bolt', 72, K.red, 3)); px(stop, 1440, 860, 72, 72);
  show(stop, T('b25', '停') - 0.25, { y: -12, s: 0.6, d: 0.4 }); sfx('error', T('b25', '停'), { g: 0.6 });
  const gap = h('div', 'abs', world); px(gap, TX3[2], 316, TW3, 300); css(gap, { border: '4px dashed ' + K.red, borderRadius: '12px', background: K.redl });
  const gapT = h('div', 'abs', gap, '这里没有 Dave'); css(gapT, { left: '24px', top: '120px', font: '700 36px "Sans SC"', color: K.redd });
  show(gap, T('b25', '停') - 0.05, { y: 0, d: 0.4 });
  to([ent[2].kL, ent[2].vL], T('b25', '停') - 0.1, { opacity: 0, duration: 0.3 }); to([ent[2].kL, ent[2].vL], tTxPre(), { opacity: 1, duration: 0.3 });
  to(tok2.slice(0, 2), T('b26') + 0.1, { opacity: 0.5, duration: 0.45 });   // 已经写进去的两处也说不准了
  // 放进同一个事务：三处一起生效或一起撤回
  fadeOut([gap, stop, ...tok2], tTx - 0.1, 0.4);
  const txBox = h('div', 'abs', world); px(txBox, 760 - 260, 744, 920, 96); css(txBox, { border: '4px dashed ' + K.blue, borderRadius: '14px', background: K.bluel });
  show(txBox, tTx, { y: 0, s: 1.03, d: 0.5 });   // 名字由左边的注解给出，框上不再重复写「事务」
  const glTx = gl(world, 150, 734, '事务', '一组读写操作：要么全部<br>生效，要么全部撤回；全部<br>生效的那一下叫提交'); css(glTx.querySelector('span'), { fontSize: '24px' });   // T11 I07
  show(glTx, T('b26', '事务') - 0.2, { x: 14, y: 0, d: 0.45 });
  fadeOut(dave, tTx, 0.3);
  const tok3 = W3.map((w, i) => { const t = h('div', 'abs', world, `<b style="font-family:Mono">${w[0]}</b>`); px(t, 540 + i * 290, 760, 260); css(t, { textAlign: 'center', font: '600 28px "Mono"', color: '#FFFFFF', background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', padding: '8px 0' }); return t; });
  tok3.forEach((t, i) => show(t, tTx + 0.3 + i * 0.12, { y: 10, d: 0.4 }));
  // b27、b28 删去（策划者：事务前几集讲过，不再下定义）：说完「放进同一个事务」，三处一起提交，一起飞进三棵树
  const tC = Tend('b26') + 0.35;
  to(txBox, tC - 0.3, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(tok3, tC - 0.3, { backgroundColor: K.spring, borderColor: K.forest, color: K.ink, duration: 0.35 });
  tok3.forEach((t, i) => tl.to(t, { x: TX3[i] + 20 - (540 + i * 290), y: 236 + 80 + 70 - 760, duration: 0.6, ease: 'power2.inOut' }, tC + 0.5));
  ent.forEach((e) => to(e.box, tC + 1.05, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 }));
  const cm = chip(world, 1450, 768, '提交', 'sp'); css(cm, { fontSize: '34px', padding: '8px 30px' });
  show(cm, tC, { y: 0, s: 1.3, d: 0.4 }); sfx('chime', tC + 0.1, { g: 0.5 });
  // 不会出现：文档进去了、索引里找不到
  const never = h('div', 'abs', world); px(never, TX3[2], 632, TW3, 92); css(never, { border: '3px solid ' + K.red, borderRadius: '12px', background: K.red });
  const neverT = h('div', 'abs', never, '文档进去了、索引里却没有'); css(neverT, { left: '22px', top: '26px', font: '700 30px "Sans SC"', color: '#FFFFFF' });
  const nx = h('div', 'abs', never, ico('x', 80, '#FFFFFF', 4)); css(nx, { right: '18px', top: '6px' });
  show(never, T('b29', '找不到') - 0.3, { y: 10, d: 0.45 });
  show(nx, T('b29', '不会') - 0.2, { y: 0, s: 1.4, d: 0.4 });
  ent.forEach((e, i) => to(e.box, Tend('b29') + 0.2 + i * 0.1, { backgroundColor: K.mint2, duration: 0.4 }));
});
