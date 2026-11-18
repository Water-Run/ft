// 第 03 章 增：4096 个用户里的第 2050 个 → 驱动补 _id → 编成 47 字节的 BSON（13 字节是字段名）→ 还缺一个键：RecordId 2050
// → 三棵树的三项（两个索引都指回 2050）→ 一个事务、提交。
// 事实：A01 A03 A04 A05 B05 B06 B07 I06 B09 H04 I07。
scene('insert', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov2 = overlay(world);
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');

  // ── 第一站：4096 个用户按注册先后写进来；Alice 是第 2050 个；她的资料 → BSON ──
  const gridBox = h('div', 'panel', world); px(gridBox, 140, 110, 700, 760);
  const gt = h('div', 'abs', gridBox, 'users · 4096 个用户'); css(gt, { left: '30px', top: '22px', font: '600 34px "Sans SC"' });
  const reveal = h('div', 'abs', gridBox); px(reveal, 30, 86, 640, 640);
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 640; css(cv, { position: 'absolute', left: '0px', top: '0px', width: '640px', height: '640px' });
  reveal.appendChild(cv);
  const g = cv.getContext('2d');
  for (let i = 0; i < 4096; i++) { g.fillStyle = '#889397'; g.fillRect((i % 64) * 10 + 1, Math.floor(i / 64) * 10 + 1, 8, 8); }
  freeze(cv);
  show(gridBox, c0, { y: 20 });
  // 按注册的先后：一行一行写进来
  tl.fromTo(reveal, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: Math.max(2, Tend('b1') - T('b1', '4096') - 0.2), ease: 'none', immediateRender: true }, T('b1', '4096'));
  const ax = 30 + (2049 % 64) * 10, ay = 86 + Math.floor(2049 / 64) * 10;
  const row = h('div', 'abs', gridBox); px(row, 30, ay - 1, 640, 12); css(row, { background: '#00ED6488' });
  const ac = h('div', 'abs', gridBox); px(ac, ax - 5, ay - 5, 20, 20); css(ac, { background: '#00ED64', borderRadius: '3px', border: '3px solid #00684A', boxSizing: 'border-box' });
  const al = xl(world, 520, 110 + ay - 86, '第 2050 个：Alice', 'on');
  show(row, T('b2', '2050') - 0.3, { y: 0 }); show(ac, T('b2', '2050') - 0.3, { y: 0, s: 2 }); show(al, T('b2', '2050'), { y: 10 }); sfx('pop', T('b2', '2050'));

  const card = codeCard(world, 900, 110, 880, '驱动程序 → MongoDB', 420);
  card.line('{');
  const lid = card.line('  <span class="k">_id</span>: ObjectId(<span class="s">\'6afa6ca26f27506cfb0a4e81\'</span>),');
  card.line('  <span class="k">name</span>: <span class="s">"Alice"</span>,'); card.line('  <span class="k">age</span>: <span class="n">42</span>'); card.line('}');
  show(card.c, T('b3'), { y: 20 }); css(lid, { overflow: 'hidden' }); set(lid, s.start, { autoAlpha: 0, height: 0 }); to(lid, T('b4', '_id'), { autoAlpha: 1, height: 46, duration: 0.5 });
  const lidBox = h('div', 'abs', world); px(lidBox, 912, 234, 860, 48); css(lidBox, { background: '#00ED6433', border: '3px solid #00ED64', borderRadius: '8px' });
  show(lidBox, T('b4', '_id') + 0.5, { y: 0 }); fadeOut(lidBox, T('b6') - 0.2);
  const oid = xl(world, 900, 560, 'ObjectId · 12 字节，驱动程序替她生成'); show(oid, T('b5') + 0.3, { y: 10 }); fadeOut(oid, T('b6') + 0.8);
  // BSON 字节阵（A04）：47 格，四种颜色；用户格子退场，给字节让出整行
  fadeOut([gridBox, al], T('b6') - 0.3);
  const bx = 140, by = 720;
  const bytes = byteRow(world, bx, by);
  const bsonL = gloss(label(world, bx, by - 70, 'BSON · 47 字节：一种二进制格式', 'eyebrow'), 'BSON');
  show(bsonL, T('b6', 'BSON') - 0.3, { x: -10, y: 0 }); show(bytes.all, T('b6', '编码成') - 0.2, { y: 12, stagger: 0.02, d: 0.35 });
  glow(bytes.len, T('b7', '47'), null, { bg: '#023430', bd: '#023430', c: '#FFFFFF' });
  const lenN = label(world, bx, by + 70, '开头 4 个字节：总长 47', 't-note'); show(lenN, T('b7', '47'), { y: 6 });
  glow(bytes.type, T('b8', '一个字段'), null, { bg: '#016BF8', bd: '#016BF8', c: '#FFFFFF' });
  const typN = label(world, bx + 520, by + 70, '每个字段先记类型', 't-note'); show(typN, T('b8', '一个字段'), { y: 6 });
  glow(bytes.name, T('b8', '名字'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  to(bytes.name, T('b9'), { y: -18, duration: 0.45, ease: 'back.out(2)' });
  glow(bytes.end, T('b9', '结尾的 0') - 0.2, null, { bg: '#023430', bd: '#023430', c: '#FFFFFF' });
  const nameN = xl(world, bx + 1000, by + 70, '_id、name、age：13 个字节', 'on'); show(nameN, T('b10', '13'), { y: 10 }); sfx('pop', T('b10', '13'));
  const qN = label(world, bx + 1000, by + 160, '占 47 个里的四分之一还多', 't-note'); show(qN, T('b10', '四分之一'), { y: 6 });

  // ── 第二站：还缺一个键 → RecordId（A05 B05）──
  const X2 = 1920;
  const kvT = label(world, X2 + 160, 120, '交给 WiredTiger 的一项：键 → 值', 'h2'); css(kvT, { fontSize: '44px' });
  const kBox = h('div', 'abs', world); px(kBox, X2 + 160, 220, 520, 170); css(kBox, { border: '4px dashed #889397', borderRadius: '14px', font: '800 96px/162px "Inter"', textAlign: 'center', color: '#889397', boxSizing: 'border-box' });
  kBox.textContent = '?';
  const arr = label(world, X2 + 720, 260, '→', 'h2'); css(arr, { fontSize: '72px', color: '#5C6C75' });
  const vBox = h('div', 'abs', world); px(vBox, X2 + 840, 220, 920, 170); css(vBox, { background: '#023430', borderRadius: '14px' });
  const vt = h('div', 'abs', vBox, 'Alice 的整份文档'); css(vt, { left: '36px', top: '30px', font: '700 40px "Sans SC"', color: '#fff' });
  const vs = h('div', 'abs mono', vBox, '47 字节的 BSON'); css(vs, { left: '36px', top: '96px', font: '600 30px "Mono"', color: '#71F6BA' });
  show(kvT, T('b11') - 0.2, { y: 10 }); show(vBox, T('b11', 'WiredTiger'), { x: 30, y: 0 }); show([kBox, arr], T('b11', '还缺'), { y: 0, s: 1.1 }); sfx('blip', T('b11', '还缺'));
  const rid = gloss(h('div', 'abs', world), 'RecordId'); px(rid, X2 + 160, 440, 900, 230);
  css(rid, { background: '#fff', border: '3px solid #00684A', borderRadius: '14px' });
  const rt = h('div', 'abs', rid, '<b>RecordId</b>：MongoDB 发的内部编号，按写入先后往上加'); css(rt, { left: '30px', top: '24px', font: '500 32px "Sans SC"' });
  const rn = h('div', 'abs num', rid, '1'); css(rn, { left: '30px', top: '80px', fontSize: '110px', color: '#00684A' });
  show(rid, T('b12'), { y: 16 });
  keyed(kBox).at(T('b12', 'RecordId') + 0.2, { html: 'RecordId' }).at(T('b14', '2050'), { html: '2050' });
  to(kBox, T('b12', 'RecordId') + 0.2, { fontSize: '64px', color: '#00684A', borderColor: '#00684A', duration: 0.4 });
  stepTo(rn, [[T('b13', '1'), 2.2, 1, 2050]], (v) => String(Math.round(v)));
  const rbar = h('div', 'abs', rid); px(rbar, 380, 150, 480, 24); css(rbar, { background: '#00ED64', borderRadius: '12px', transformOrigin: '0 50%' });
  fromTo(rbar, T('b13', '1'), { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'none' });
  to(kBox, T('b14', '2050'), { backgroundColor: '#00ED64', borderStyle: 'solid', borderColor: '#00ED64', color: '#023430', fontSize: '96px', duration: 0.4 });
  // b15：它和 _id 是两个编号；查出来的文档里看不到 RecordId
  const shown = codeCard(world, X2 + 1120, 440, 640, '查出来的文档', 300);
  shown.line('{ <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>),'); shown.line('  <span class="k">name</span>: <span class="s">\'Alice\'</span>,'); shown.line('  <span class="k">age</span>: <span class="n">42</span> }');
  const noRid = xl(world, X2 + 1300, 760, '里面没有 RecordId', 'dk');
  show(shown.c, T('b15', '_id'), { x: 30, y: 0 }); show(noRid, T('b15', '看不到'), { y: 0, s: 1.2 });
  fadeOut([kvT, kBox, arr, vBox, shown.c, noRid], T('b16') - 0.2);
  to(rid, T('b16') - 0.2, { y: -320, duration: 0.8, ease: 'power2.inOut' });
  to(rbar, T('b16') - 0.2, { autoAlpha: 0, duration: 0.3 });

  // ── 三棵树里的三项（B05 B06 B07）──
  const rows = [['集合树', '2050', '47 字节的整份文档'], ['_id 索引', 'ObjectId(6afa…4e81)', '2050'], ['姓名索引', '"Alice" + 2050', '（空）']];
  const R = rows.map(([nm, k, v], i) => {
    const y = 400 + i * 140;
    const n = chip(world, X2 + 160, y + 16, nm, 'dk xl');
    const kb = pg(world, X2 + 520, y, 560, 100, k); css(kb, { fontSize: '28px' });
    const ar = label(world, X2 + 1100, y + 26, '→', 'h2');
    const vb = pg(world, X2 + 1170, y, 560, 100, v); css(vb, { fontSize: '28px' });
    return { n, kb, ar, vb };
  });
  const kl = label(world, X2 + 520, 362, '键', 'lab'), vl = label(world, X2 + 1170, 362, '值', 'lab');
  R.forEach((r, i) => show(r.n, T('b16') + 0.4 + i * 0.6, { y: 10 }));
  show([kl, vl], T('b16') + 0.4, { y: 6 });
  [['b17', 0], ['b18', 1], ['b19', 2]].forEach(([id, i]) => { show([R[i].kb, R[i].ar, R[i].vb], T(id), { y: 16, stagger: 0.12 }); sfx('pop', T(id)); });
  const SPR = { bg: '#00ED64', bd: '#00ED64', c: '#023430' };
  glow(R[0].kb, T('b17', '2050') - 0.2, T('b18'), SPR); glow(R[0].vb, T('b17', '47') - 0.3, T('b18'), SPR); glow(R[1].vb, T('b18', '值是') - 0.2, T('b19'), SPR); glow(R[2].kb, T('b19', 'Alice') - 0.2, T('b20'), SPR); glow(R[2].vb, T('b19', '值是空的') - 0.3, T('b20'), SPR);
  glow(R[1].vb, T('b20') + 0.3, T('b21'), SPR);
  glow(R[2].kb, T('b21') + 0.3, T('b22') - 0.4, SPR);
  const dup = label(world, X2 + 520, 830, '同名的人，键里接着不同的编号，也能分开', 't-body'); show(dup, T('b21b'), { y: 8 }); fadeOut(dup, T('b22') - 0.1);
  // b22：两个索引最后都指回 2050：三处 2050 一起亮起
  glow([R[0].kb, R[1].vb, R[2].kb], T('b22', '2050') - 0.2, T('b23') + 0.5, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const ab1 = link(ov2, [[X2 + 1450, 540], [X2 + 1450, 520], [X2 + 800, 520], [X2 + 800, 506]], 'accent', { arrow: true, w: 4 });
  const ab2 = link(ov2, [[X2 + 520, 730], [X2 + 490, 730], [X2 + 490, 450], [X2 + 514, 450]], 'accent', { arrow: true, w: 4 });
  arrowIn(ab1, T('b22', '指回') - 0.2, 0.7); arrowIn(ab2, T('b22', '指回'), 0.7); fadeOut([ab1, ab2], T('b23') + 0.5);
  const back = xl(world, X2 + 1170, 820, '三处都是 2050', 'on'); show(back, T('b22', '2050') - 0.2, { y: 10 }); fadeOut(back, T('b23') - 0.2);
  const late = note(world, X2 + 160, 820, '姓名索引是 4096 人都写完后才建的：Alice 这一项，建索引时补上', ''); css(late, { fontSize: '30px' });
  show(late, T('b23', '后来才建'), { y: 10 }); hide(late, T('b24') - 0.2, { y: 0 });
  const dave = xl(world, X2 + 160, 820, '之后注册的 Dave：三棵树各写一项'); show(dave, T('b24', 'Dave'), { y: 10 });
  const plus = R.map((r, i) => { const p = xl(world, X2 + 1760, 400 + i * 140 + 18, '+1', 'on'); css(p, { padding: '8px 14px' }); return p; });
  plus.forEach((p, i) => show(p, T('b24', '各写一项') + i * 0.2, { x: -20, y: 0 }));
  fadeOut([dave, ...plus], T('b25') - 0.2);
  // b25：文档写进去了、索引还没写，进程就停了？
  const idxEls = [R[1].kb, R[1].vb, R[1].ar, R[2].kb, R[2].vb, R[2].ar];
  to(idxEls, T('b25', '索引还没写'), { autoAlpha: 0.25, duration: 0.5 });
  const stop = xl(world, X2 + 160, 820, '进程停了，索引里还没有她？', 'red'); show(stop, T('b25', '进程'), { y: 0, s: 1.2 }); sfx('error', T('b25', '进程'), { g: 0.5 });
  fadeOut(stop, T('b26') - 0.1);
  to(idxEls, T('b26'), { autoAlpha: 1, duration: 0.5 });
  // 一个事务把三处写入包起来（H04 I07）
  const tx = gloss(h('div', 'abs', world), '事务'); px(tx, X2 + 130, 370, 1720, 430); css(tx, { border: '5px dashed #00684A', borderRadius: '16px' });
  const txl = label(world, X2 + 150, 820, '事务：要么全部生效，要么全部撤回', 'h2'); css(txl, { fontSize: '40px' });
  show(tx, T('b26', '事务') - 0.3, { y: 0, s: 1.02 }); show(txl, T('b27'), { y: 10 }); hide(txl, T('b28') - 0.1, { y: 0 });
  to(tx, T('b28', '提交'), { borderStyle: 'solid', backgroundColor: '#00ED6422', duration: 0.3 });
  const commit = xl(world, X2 + 150, 820, '提交：三处一起生效', 'on'); show(commit, T('b28', '提交'), { y: 0, s: 1.3 }); sfx('thud', T('b28', '提交') + 0.1);
  const never = xl(world, X2 + 760, 820, '不会只写进一半'); show(never, T('b29', '不会发生') - 0.5, { y: 10 });

  // 镜头：两站
  const a = drift(s.start, T('b11') - 0.6, 960, -1), b = drift(T('b11') + 0.8, s.end, X2 + 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }],
    [T('b11') - 0.6, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
  ]);
});
