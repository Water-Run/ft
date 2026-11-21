// 第 03 章 增：4096 个用户里的第 2050 个 → 驱动补 _id → 编成 47 字节的 BSON（13 字节是字段名）→ 还缺一个键：RecordId 2050
// → 三棵树的三项（文档页式的表格：树、键、值、文件里的字节；两个索引都指回 2050）→ Dave 的三处写入放进一个事务、提交。
// 事实：A01 A03 A04 A05 B05 B06 B07 I06 B09 H04 I07。
scene('insert', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov2 = overlay(world);
  const ch = chrome(root, s, '03 增');
  ch.sec(c0, 'BSON');

  // ── 第一站：4096 个用户按注册先后写进来；Alice 是第 2050 个；她的资料 → BSON ──
  const gridBox = h('div', 'panel', world); px(gridBox, 140, 140, 700, 760);
  const gt = h('div', 'abs', gridBox, 'users 集合 · 4096 份文档'); css(gt, { left: '30px', top: '22px', font: '700 32px "Inter", "Sans SC"' });
  const reveal = h('div', 'abs', gridBox); px(reveal, 30, 86, 640, 640);
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 640; css(cv, { position: 'absolute', left: '0px', top: '0px', width: '640px', height: '640px' });
  reveal.appendChild(cv);
  const g = cv.getContext('2d');
  for (let i = 0; i < 4096; i++) { g.fillStyle = '#C1C7C6'; g.fillRect((i % 64) * 10 + 1, Math.floor(i / 64) * 10 + 1, 8, 8); }
  freeze(cv);
  show(gridBox, c0, { y: 20 });
  tl.fromTo(reveal, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: Math.max(2, Tend('b1') - T('b1', '4096') - 0.2), ease: 'none', immediateRender: true }, T('b1', '4096'));
  const ax = 30 + (2049 % 64) * 10, ay = 86 + Math.floor(2049 / 64) * 10;
  const row = h('div', 'abs', gridBox); px(row, 30, ay - 1, 640, 12); css(row, { background: '#C0FAE6' });
  const ac = h('div', 'abs', gridBox); px(ac, ax - 5, ay - 5, 20, 20); css(ac, { background: '#00ED64', borderRadius: '3px', border: '3px solid #00684A' });
  const al = chip(world, 880, 140 + ay - 20, '第 2050 个 · Alice', 'sp'); css(al, { font: '700 30px "Inter", "Sans SC"' });
  const alL = link(ov2, [[140 + ax + 16, 140 + ay + 5], [876, 140 + ay + 5]], 'accent', { w: 2.5 });
  show(row, T('b2', '2050') - 0.3, { y: 0 }); show(ac, T('b2', '2050') - 0.3, { y: 0, s: 2 }); draw(alL, T('b2', '2050') - 0.1, 0.4); show(al, T('b2', '2050'), { x: -10, y: 0 }); sfx('pop', T('b2', '2050'));
  const regN = figs(world, 140, 916, 700, [[T('b1') + 0.6, '图 3-1', '按注册先后写进来，一格一份文档', '实测：4096 份']], T('b6') - 0.3);
  fadeOut([al, alL], T('b3') + 0.3);

  const card = codeCard(world, 900, 140, 880, '驱动程序 → mongod', 300);
  css(card.body, { font: '400 30px/46px "Mono"' });
  card.line('{');
  const lid = card.line('  <span class="k">_id</span>: ObjectId(<span class="s">\'6afa6ca26f27506cfb0a4e81\'</span>),');
  card.line('  <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span>'); card.line('}');
  show(card.c, T('b3'), { y: 20 }); css(lid, { overflow: 'hidden' }); set(lid, s.start, { autoAlpha: 0, height: 0 });
  to(lid, T('b4', '_id'), { autoAlpha: 1, height: 46, duration: 0.5 }); to(card.c, T('b4', '_id'), { height: 346, duration: 0.5 });
  classAt(lid, 'hl', T('b4', '_id') + 0.5, T('b6') - 0.2);
  const oid = callout(world, 900, 510, 'note', '12 字节，驱动程序生成', 'ObjectId');
  show(oid, T('b5') - 0.1, { y: 10 }); fadeOut(oid, T('b6') + 0.6);
  // BSON 字节阵（A04）：47 格，按含义着色；用户格子退场，给字节让出整行
  fadeOut(gridBox, T('b6') - 0.3);
  const bx = 112, by = 690;
  const bytes = byteRow(world, bx, by);
  const bsonL = gloss(label(world, bx, by - 66, 'BSON · 二进制的文档格式', 'eyebrow'), 'BSON');
  show(bsonL, T('b6', 'BSON') - 0.3, { x: -10, y: 0 }); show(bytes.all, T('b6', '编码成') - 0.2, { y: 12, stagger: 0.02, d: 0.35 });
  const sizeN = chip(world, bx + 1430, by - 70, '长度 2f：共 47 字节', ''); show(sizeN, T('b7', '47') - 0.2, { y: 8 });
  glow(bytes.len, T('b7', '47'), null, { bg: '#001E2B', bd: '#001E2B', c: '#FFFFFF' });
  const ann = (i0, txt, t, w = 280) => { const x = bx + i0 * 36; const tk = h('div', 'abs', world); px(tk, x + 4, by + 60, 3, 22); css(tk, { background: '#5C6C75' }); const l = label(world, x, by + 88, txt, 't-small'); css(l, { color: '#3D4F58' }); show([tk, l], t, { y: 6 }); return [tk, l]; };
  glow(bytes.type, T('b8', '一个字段'), null, { bg: '#016BF8', bd: '#016BF8', c: '#FFFFFF' });
  ann(4, '类型 07：ObjectId', T('b8', '一个字段') + 0.1); ann(21, '02：字符串', T('b8', '一个字段') + 0.3); ann(37, '10：整数', T('b8', '一个字段') + 0.5);
  glow(bytes.name, T('b8', '名字'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  to(bytes.name, T('b9'), { y: -18, duration: 0.45, ease: 'back.out(2)' });
  glow(bytes.end, T('b9', '结尾的 0') - 0.2, null, { bg: '#001E2B', bd: '#001E2B', c: '#FFFFFF' });
  // 图例（文档页的图注）
  const legend = h('div', 'abs', world); px(legend, bx, by + 150, 1700, 40); css(legend, { display: 'flex', gap: '30px', font: '500 24px "Inter", "Sans SC"', color: '#3D4F58', alignItems: 'center' });
  [['#001E2B', '长度 / 结尾'], ['#016BF8', '类型'], ['#00ED64', '字段名'], ['#FFFFFF', '值']].forEach(([c, t]) => { const it = h('span', '', legend, `<i style="display:inline-block;width:26px;height:26px;border-radius:4px;background:${c};border:1.5px solid #C1C7C6;vertical-align:-6px;margin-right:10px"></i>${t}`); });
  show(legend, T('b8', '名字') + 0.4, { y: 8 });
  const nameN = callout(world, 900, 490, 'tip', '三个名字 + 三个 0 = 13 字节，占 28%', '字段名');
  show(nameN, T('b10') - 0.45, { y: 10 }); sfx('pop', T('b10', '13'));
  figs(world, bx, by + 210, 1700, [[T('b7') + 0.3, '图 3-2', 'Alice 这份文档的 BSON，逐字节', '实测：bsonsize() = 47 · wt 读出的值']], T('b11') - 0.7);

  // ── 第二站：还缺一个键 → RecordId（A05 B05）──
  const X2 = 1920;
  ch.sec(T('b11') - 0.4, 'RecordId');
  const kvT = label(world, X2 + 160, 140, '交给 WiredTiger 的一项：键 → 值', 'h2');
  const kBox = h('div', 'abs', world); px(kBox, X2 + 160, 230, 520, 170); css(kBox, { border: '4px dashed #889397', borderRadius: '14px', font: '700 96px/162px "Inter"', textAlign: 'center', color: '#5C6C75' });
  kBox.textContent = '?';
  const arr = label(world, X2 + 720, 270, '→', 'h2'); css(arr, { fontSize: '72px', color: '#5C6C75' });
  const vBox = h('div', 'abs', world); px(vBox, X2 + 840, 230, 920, 170); css(vBox, { background: '#F9FBFA', border: '2px solid #C1C7C6', borderRadius: '14px' });
  const vt = h('div', 'abs', vBox, 'Alice 的整份文档'); css(vt, { left: '36px', top: '30px', font: '700 40px "Inter", "Sans SC"', color: '#001E2B' });
  const vs = h('div', 'abs mono', vBox, '47 字节的 BSON：2f 00 00 00 07 5f 69 64 …'); css(vs, { left: '36px', top: '98px', font: '500 28px "Mono", "Sans SC"', color: '#3D4F58' });
  show(kvT, T('b11') - 0.2, { y: 10 }); show(vBox, T('b11', 'WiredTiger'), { x: 30, y: 0 }); show([kBox, arr], T('b11', '还缺'), { y: 0, s: 1.1 }); sfx('blip', T('b11', '还缺'));
  const rid = gloss(h('div', 'panel', world), 'RecordId'); px(rid, X2 + 160, 450, 900, 250); css(rid, { borderColor: '#00A35C', borderWidth: '2px' });
  const rt = h('div', 'abs', rid, '<b>RecordId</b>：MongoDB 发的内部编号，按写入先后往上加'); css(rt, { left: '30px', top: '24px', font: '500 30px "Inter", "Sans SC"' });
  const rn = h('div', 'abs num', rid, '1'); css(rn, { left: '30px', top: '84px', fontSize: '110px', color: '#00684A' });
  show(rid, T('b12'), { y: 16 });
  keyed(kBox).at(T('b12', 'RecordId') + 0.2, { html: 'RecordId' }).at(T('b14', '2050'), { html: '2050' });
  to(kBox, T('b12', 'RecordId') + 0.2, { fontSize: '64px', color: '#00684A', borderColor: '#00A35C', duration: 0.4 });
  stepTo(rn, [[T('b13', '1'), 2.2, 1, 2050]], (v) => String(Math.round(v)));
  const rbar = h('div', 'abs', rid); px(rbar, 380, 156, 480, 24); css(rbar, { background: '#00ED64', borderRadius: '12px', transformOrigin: '0 50%' });
  fromTo(rbar, T('b13', '1'), { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'none' });
  const rbl = label(rid, 380, 196, '写入的先后：第 1 个 … 第 2050 个', 't-small'); show(rbl, T('b13', '1') + 0.3, { y: 6 });
  to(kBox, T('b14', '2050'), { backgroundColor: '#00ED64', borderStyle: 'solid', borderColor: '#00ED64', color: '#023430', fontSize: '96px', duration: 0.4 });
  // b15：它和 _id 是两个编号；查出来的文档里看不到 RecordId
  const sh = term(world, X2 + 1100, 450, 680, 400, 'mongosh', { fs: 24 });
  sh.cmd(T('b15') + 0.1, 'db.users.find({ <span class="k">name</span>: <span class="s">"Alice"</span> })');
  sh.out(T('b15', '_id') + 0.2, "[ { <span class=\"k\">_id</span>: ObjectId(<span class=\"s\">'6afa…'</span>),\n    <span class=\"k\">name</span>: <span class=\"s\">'Alice'</span>, <span class=\"k\">age</span>: <span class=\"n\">42</span> } ]");
  sh.out(T('b15', '两个编号') + 0.3, "<span class=\"c\">// 加上 .showRecordId() 才看得到：</span>\n<span class=\"k\">'$recordId'</span>: Long(<span class=\"s\">'2050'</span>)");
  show(sh.c, T('b15') - 0.2, { x: 30, y: 0 });
  const two = callout(world, X2 + 160, 730, 'note', '<code>_id</code> 在文档里；RecordId 只在存储引擎里', '两个编号');
  show(two, T('b15') + 0.1, { y: 10 });
  fadeOut([kvT, kBox, arr, vBox, sh.c, two], T('b16') - 0.2);
  to(rid, T('b16') - 0.2, { autoAlpha: 0, y: -30, duration: 0.5 });

  // ── 第三站：三棵树里的三项（B05 B06 B07），文档页式的表格 ──
  ch.sec(T('b16') - 0.1, '三棵树各一项');
  const TX = X2 + 140, TY = 260, CW = [250, 470, 420, 500], RH = 150;
  const colX = CW.reduce((a, w, i) => (a.push((a[i - 1] || 0) + (i ? CW[i - 1] : 0)), a), []);
  const head = h('div', 'abs', world); px(head, TX, TY - 72, 1640, 68); css(head, { background: '#F9FBFA', borderBottom: '2px solid #C1C7C6', borderRadius: '10px 10px 0 0' });
  ['树', '键', '值', '文件里的字节'].forEach((t, i) => { const e = h('div', 'abs', head, t); css(e, { left: colX[i] + 26 + 'px', top: '16px', font: '700 30px "Inter", "Sans SC"', color: '#001E2B' }); });
  show(head, T('b16') + 0.2, { y: 8 });
  const rows = [['集合树', '2050', '整份文档 · 47 字节', '键 c7 c2<br>值 2f 00 00 00 07 5f 69 …'], ['_id 索引', "ObjectId('6afa…4e81')", '2050', '键 64 6a fa 6c … 04<br>值 20 40 11'], ['姓名索引', '"Alice" + 2050', '（空）', '键 3c 41 6c 69 63 65 00<br>　 04 20 40 11　值（空）']];
  const R = rows.map(([nm, k, v, by_], i) => {
    const y = TY + i * RH;
    const line = h('div', 'abs', world); px(line, TX, y + RH - 2, 1640, 2); css(line, { background: '#E8EDEB' });
    const n = h('div', 'abs', world, nm); px(n, TX + 26, y + 50); css(n, { font: '500 38px "Serif SC"', color: '#001E2B' });
    const kb = pg(world, TX + colX[1] + 16, y + 30, CW[1] - 40, 90, k); css(kb, { fontSize: '28px' });
    const vb = pg(world, TX + colX[2] + 16, y + 30, CW[2] - 40, 90, v); css(vb, { fontSize: '28px', fontFamily: '"Mono", "Sans SC"' });
    const bt = h('div', 'abs mono', world, by_); px(bt, TX + colX[3] + 20, y + 36); css(bt, { font: '500 23px/38px "Mono", "Sans SC"', color: '#3D4F58' });
    return { n, kb, vb, bt, line, y };
  });
  // b16：三项里的 2050 先出来（集合树的键、_id 索引的值、姓名索引的键），其余的格子到 b17–b19 再填
  const first = [R[0].kb, R[1].vb, R[2].kb], rest = [[R[0].vb], [R[1].kb], [R[2].vb]];
  show([...first, ...R.map((r) => r.line)], T('b16', '2050') - 0.3, { y: 12, stagger: 0.12 }); glow(first, T('b16', '2050'), T('b17') - 0.1, { bg: '#00ED64', bd: '#00ED64' });
  [['b17', 0], ['b18', 1], ['b19', 2]].forEach(([id, i]) => { show(rest[i], T(id) - 0.1, { y: 16 }); show(R[i].bt, T(id) + 0.9, { y: 6 }); sfx('pop', T(id)); });
  R.forEach((r, i) => show(r.n, T('b16', '三棵树') + i * 0.25, { x: -16, y: 0 }));
  const SPR = { bg: '#00ED64', bd: '#00ED64', c: '#023430' };
  glow(R[0].kb, T('b17', '2050') - 0.2, T('b18'), SPR); glow(R[0].vb, T('b17', '47') - 0.3, T('b18'), SPR); glow(R[1].vb, T('b18', '值是') - 0.2, T('b19'), SPR); glow(R[2].kb, T('b19', 'Alice') - 0.2, T('b20'), SPR); glow(R[2].vb, T('b19', '值是空的') - 0.3, T('b20'), SPR);
  // b20：_id 不会重复，值里放 2050 就够；b21：名字可能重名，2050 接在名字后面
  glow(R[1].kb, T('b20') + 0.1, T('b21'), { bg: '#E3FCF7', bd: '#00A35C', c: '#00684A' }); glow(R[1].vb, T('b20', '值里') - 0.2, T('b21'), SPR);
  const uq = chip(world, TX + colX[1] + 30, R[1].y + 4, 'unique', 'blue'); show(uq, T('b20', '不会重复') - 0.2, { y: 6 }); fadeOut(uq, T('b21') - 0.1);
  glow(R[2].kb, T('b21') + 0.3, T('b22') - 0.4, SPR);
  const dupN = callout(world, TX, TY + 3 * RH + 30, 'note', '键 = 名字 + 2050：同名也不重复', '为什么接上 2050');
  show(dupN, T('b21') + 0.1, { y: 10 }); fadeOut(dupN, T('b24') - 0.4);
  // b22：两个索引最后都指回 2050：三处 2050 一起亮起，两条箭头指回集合树
  glow([R[0].kb, R[1].vb, R[2].kb], T('b22', '2050') - 0.2, T('b24') - 0.2, SPR);
  const ab1 = link(ov2, [[TX + colX[2] + 210, R[1].y + 30], [TX + colX[2] + 210, R[0].y + 134], [TX + colX[1] + 300, R[0].y + 134], [TX + colX[1] + 300, R[0].y + 124]], 'accent', { arrow: true, w: 4 });
  const ab2 = link(ov2, [[TX + colX[1] + 16, R[2].y + 75], [TX + colX[1] - 8, R[2].y + 75], [TX + colX[1] - 8, R[0].y + 75], [TX + colX[1] + 10, R[0].y + 75]], 'accent', { arrow: true, w: 4 });
  arrowIn(ab1, T('b22', '指回') - 0.2, 0.7); arrowIn(ab2, T('b22', '指回'), 0.7); fadeOut([ab1, ab2], T('b24') - 0.2);
  // b24：Dave（姓名索引建好之后注册）：三棵树各写一项
  const dave = chip(world, TX, TY + 3 * RH + 40, 'Dave 注册', 'dk'); css(dave, { font: '700 30px "Inter", "Sans SC"' });
  show(dave, T('b24', 'Dave') - 0.2, { y: 10 });
  const plus = R.map((r, i) => { const p = chip(world, TX + 1640 - 110, r.y + 52, '+1 项', 'on'); return p; });
  plus.forEach((p, i) => show(p, T('b24', '各写一项') + i * 0.2, { x: -20, y: 0 }));
  fadeOut(plus, T('b25') + 0.4);
  // b25：文档写进去了，索引还没写，进程就停了？
  const idxEls = [R[1].kb, R[1].vb, R[1].bt, R[2].kb, R[2].vb, R[2].bt];
  to(idxEls, T('b25', '索引还没写'), { autoAlpha: 0.2, duration: 0.5 });
  const stop = callout(world, TX + 700, TY + 3 * RH + 30, 'warn', '集合树有 Dave，索引里没有', '要是停在这里');
  show(stop, T('b25') + 0.2, { y: 10 }); sfx('error', T('b25', '进程'), { g: 0.5 });
  fadeOut(stop, T('b26') + 0.1);
  to(idxEls, T('b26'), { autoAlpha: 1, duration: 0.5 });
  // b26–b29：一个事务把三处写入包起来（H04 I07）
  const tx = h('div', 'abs', world); px(tx, TX - 20, TY - 92, 1680, 3 * RH + 112); css(tx, { border: '5px dashed #00A35C', borderRadius: '18px' });
  show(tx, T('b26', '事务') - 0.3, { y: 0, s: 1.02 });
  const txN = gloss(callout(world, TX + 700, TY + 3 * RH + 40, 'tip', '里面的修改要么全部生效，要么全部撤回', '事务'), '事务');
  show(txN, T('b26', '事务') + 0.3, { y: 10 });
  to(tx, T('b28', '提交') - 0.1, { borderStyle: 'solid', backgroundColor: '#E3FCF755', duration: 0.3 });
  const commit = chip(world, TX + 1640 - 200, TY - 116, '已提交', 'sp'); css(commit, { font: '700 30px "Inter", "Sans SC"' });
  show(commit, T('b28', '提交'), { y: 0, s: 1.3 }); sfx('thud', T('b28', '提交') + 0.1);
  hide(txN, T('b29') - 0.1, { y: 0, d: 0.3 });
  const ok3 = callout(world, TX + 700, TY + 3 * RH + 40, 'tip', '提交之后三处都在；提交之前出事，三处都不算', '不会只写一半');
  show(ok3, T('b29') + 0.1, { y: 10 });

  // 镜头：两站
  const a = drift(s.start, T('b11') - 0.6, 960, -1), b = drift(T('b11') + 0.8, s.end, X2 + 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }],
    [T('b11') - 0.6, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
  ]);
});
