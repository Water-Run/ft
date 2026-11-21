// 第 10 章 五个问题：文档页式的表格（问题、MongoDB 的答案、讲在哪一章），念到哪一行，浅绿的选中底色滑到哪一行。
// 第 11 章 不是 SQL：一、不要表换来了什么（people 的三份文档各有各的字段；代价是字段名跟着每份文档存一遍：13 字节 × 4096）；
// 二、WiredTiger 只认键和值 → 键值数据库 → 磁盘与内存倒过来 → 进程一死靠什么回来；三、PART 7：与片名同款的整屏卡，Redis 是系列最终集。
// 事实：A03 A04 A12 B01 A07 H02 H06 H08 N01 S02。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ch = chrome(root, s, '10 五个问题');
  const X = 140, Y = 150, W = 1640, CW = [300, 1060, 280];
  const head = h('div', 'abs', world); px(head, X, Y, W, 64); css(head, { background: '#F9FBFA', borderBottom: '2px solid #C1C7C6', borderRadius: '12px 12px 0 0', font: '700 30px/62px "Inter", "Sans SC"', color: '#001E2B' });
  head.innerHTML = `<span style="position:absolute;left:26px">问题</span><span style="position:absolute;left:${CW[0] + 26}px">MongoDB 的答案</span><span style="position:absolute;left:${CW[0] + CW[1] + 26}px">讲在</span>`;
  show(head, c0, { y: 10 });
  const R = [
    ['数据怎么放', '文档编成 BSON，按 RecordId 放进集合树', '每个索引另是一棵树，最后都指回 RecordId', 'i1', 'i2', ['第 03 章 增', '第 04 章 落盘']],
    ['怎么找', '在索引里拿到 RecordId，再回集合树取文档', '', 'i3', null, ['第 05 章 查']],
    ['改和删', '内存里挂新版本、挂删除标记', '检查点时整页写到新地方，旧页不覆盖', 'i4', 'i5', ['第 06 章 改', '第 07 章 删']],
    ['怎么并发', '读的人看快照；改同一份文档撞上了，一方重来', '', 'i6', null, ['第 08 章']],
    ['出错怎么办', '回到最后一个检查点，重放日志', '单机上不带 j，进程被杀时，最后一小段可能会丢', 'i8', 'i9', ['第 09 章']],
  ];
  const RH = 132, rows = [];
  const sel = h('div', 'abs', world); px(sel, X, Y + 66, W, RH - 4); css(sel, { background: '#E3FCF7', borderLeft: '8px solid #00A35C' });
  R.forEach(([q, a, a2, t1, t2, links], i) => {
    const y = Y + 66 + i * RH;
    const line = h('div', 'abs', world); px(line, X, y + RH - 2, W, 2); css(line, { background: '#E8EDEB' });
    const qe = h('div', 'abs', world, q); px(qe, X + 26, y + 40); css(qe, { font: '500 40px "Serif SC"', color: '#001E2B' });
    const ae = h('div', 'abs', world, a); px(ae, X + CW[0] + 26, y + (a2 ? 26 : 46)); css(ae, { font: '600 32px "Inter", "Sans SC"', color: '#001E2B' });
    const ae2 = a2 ? h('div', 'abs', world, a2) : null; if (ae2) { px(ae2, X + CW[0] + 26, y + 78); css(ae2, { font: '500 27px "Inter", "Sans SC"', color: '#3D4F58' }); }
    const le = h('div', 'abs', world, links.map((l) => `<div>${l}</div>`).join('')); px(le, X + CW[0] + CW[1] + 26, y + (links.length > 1 ? 30 : 48)); css(le, { font: '500 26px/1.6 "Inter", "Sans SC"', color: '#1254B7', textDecoration: 'underline', textUnderlineOffset: '5px' });
    show([qe, line], T('i0') + 0.3 + i * 0.3, { x: -16, y: 0 });
    show(ae, T(t1) - 0.1, { y: 10 }); if (ae2) show(ae2, T(t2) - 0.1, { y: 8 }); show(le, T(t1) + 0.6, { y: 8 });
    sfx('pop', T(t1));
    rows.push(y);
  });
  // 选中底色：念到哪一行，滑到哪一行（一个框在一组里挑一个）
  fromTo(sel, T('i1') - 0.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  ['i3', 'i4', 'i6', 'i8'].forEach((id, k) => to(sel, T(id) - 0.3, { y: (k + 1) * RH, duration: 0.5, ease: 'power3.inOut' }));
  figs(world, X, Y + 66 + 5 * RH + 18, W, [[T('i0') + 0.6, '表 10-1', '一个数据库引擎要回答的五个问题，MongoDB 的答案', '本系列各集同一组问题']], null);
  const ans = chip(world, 1500, Y - 50, 'MongoDB 9.0 · WiredTiger', 'on'); show(ans, T('i0', '答案') - 0.3, { y: 8 });

  const a = drift(s.start, s.end, 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});

scene('trade', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '11 不是 SQL');
  ch.sec(c0, '换来了什么');
  const X2 = 1920;

  // ── 一、不要表，换来了什么（A12 A04 A03） ──
  const coll = h('div', 'panel', world); px(coll, 140, 140, 1640, 400);
  const ct = h('div', 'abs', coll, '集合 <span style="font:700 34px Mono;color:#001E2B">people</span>'); css(ct, { left: '30px', top: '20px', font: '500 40px "Serif SC"', color: '#00684A' });
  const docs = [['Alice', '{\n  <span class="fk">name</span>: "Alice",\n  <span class="fk">age</span>: 42\n}'], ['Erin', '{\n  <span class="fk">name</span>: "Erin",\n  <span class="fk">email</span>: "erin@…",\n  <span class="fk ex">tags</span>: ["db", "go"]\n}'], ['Frank', '{\n  <span class="fk">name</span>: "Frank",\n  <span class="fk ex">address</span>: { city: … }\n}']];
  const dE = docs.map(([n, html], i) => { const d = h('div', 'abs', coll); px(d, 30 + i * 534, 90, 510, 286); css(d, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '12px', padding: '50px 24px 0', font: '500 26px/40px "Mono"', whiteSpace: 'pre', color: '#001E2B' }); d.innerHTML = html; const tg = chip(d, 18, 10, n, 'dk'); return d; });
  show(coll, c0, { y: 14 }); dE.forEach((d, i) => show(d, T('j1') + 0.2 + i * 0.2, { y: 14 }));
  const noTable = callout(world, 140, 570, 'note', '没有 <code>CREATE TABLE</code>，<code>insertOne</code> 一句', '没建表');
  show(noTable, T('j1') + 0.2, { y: 10 }); fadeOut(noTable, T('j2b') - 0.1);
  const fks = [...coll.querySelectorAll('.fk')], exs = [...coll.querySelectorAll('.ex')];
  fks.forEach((e) => css(e, { color: '#1254B7', borderRadius: '4px', padding: '0 3px' }));
  to(fks, T('j2b', '字段') - 0.2, { backgroundColor: '#E3FCF7', duration: 0.4, stagger: 0.05 });
  to(exs, T('j3', '标签') - 0.3, { backgroundColor: '#00ED64', color: '#023430', duration: 0.4, stagger: 0.4 });
  const gain = callout(world, 140, 570, 'tip', 'Erin 的 <code>tags</code>、Frank 的 <code>address</code>：直接写进去，事先不用声明', '换来的');
  show(gain, T('j3') + 0.1, { y: 10 }); fadeOut(gain, T('j5') - 0.1);
  // 代价：字段名跟着每份文档存一遍 —— 13 字节 × 4096
  to(fks, T('j5', '字段名') - 0.2, { backgroundColor: '#FFEAE5', color: '#970606', duration: 0.4 });
  const cost = h('div', 'panel', world); px(cost, 140, 570, 1640, 330); css(cost, { borderColor: '#FFC010', borderWidth: '2px', background: '#FEF7DB' });
  const cT = h('div', 'abs', cost, '付出的：字段名跟着每份文档存一遍'); css(cT, { left: '30px', top: '22px', font: '700 32px "Inter", "Sans SC"', color: '#944F01' });
  show(cost, T('j5') - 0.1, { y: 12 });
  const nm = h('div', 'abs', cost); px(nm, 30, 96, 900, 60); css(nm, { font: '600 34px "Mono"', color: '#001E2B' });
  nm.innerHTML = '<span style="background:#00ED64;padding:2px 10px;border-radius:5px">_id\\0</span>  <span style="background:#00ED64;padding:2px 10px;border-radius:5px">name\\0</span>  <span style="background:#00ED64;padding:2px 10px;border-radius:5px">age\\0</span>  = 13 字节 / 份';
  show(nm, T('j6', '_id') - 0.3, { y: 8 });
  const times = h('div', 'abs', cost, '× 4,096'); px(times, 30, 176); css(times, { font: '700 80px "Inter"', color: '#944F01' });
  show(times, T('j6b', '4096') - 0.3, { x: -20, y: 0, s: 1.2 });
  const total = h('div', 'abs', cost, '= 53,248 字节，只是在重复写名字'); px(total, 360, 206); css(total, { font: '600 34px "Inter", "Sans SC"', color: '#001E2B' });
  show(total, T('j6b', '4096') + 0.4, { y: 8 });
  const ref = h('div', 'abs', cost, '普通文档 92 字节，13 字节是字段名'); px(ref, 30, 280); css(ref, { font: '500 24px "Inter", "Sans SC"', color: '#5C6C75' });
  show(ref, T('j6b') + 0.6, { y: 6 });
  hide([coll, cost], T('j7') + 2.0, { y: -12, d: 0.45 });

  // ── 二、WiredTiger 只认键和值 → 键值数据库 → 磁盘与内存倒过来（B01 N01 A07 S02） ──
  ch.sec(T('j7') - 0.3, '更简单一点');
  const kvP = h('div', 'panel', world); px(kvP, X2 + 140, 140, 780, 380);
  const kvT = h('div', 'abs', kvP, 'WiredTiger 只认：键 → 值'); css(kvT, { left: '28px', top: '20px', font: '700 32px "Inter", "Sans SC"', color: '#001E2B' });
  const KV = [['2050', '47 字节的文档'], ['"Alice" + 2050', '（空）'], ["ObjectId('6afa…')", '2050']];
  const kvR = KV.map(([k, v], i) => { const kk = pg(kvP, 28, 90 + i * 92, 360, 72, k, 'on'); css(kk, { fontSize: '25px' }); const vv = pg(kvP, 420, 90 + i * 92, 330, 72, v); css(vv, { fontSize: '25px' }); return [kk, vv]; });
  show(kvP, T('j7') + 2.9, { y: 14 }); kvR.forEach((r, i) => show(r, T('j7', '键和值') - 0.3 + i * 0.2, { y: 10, stagger: 0.1 }));
  const kdb = h('div', 'panel', world); px(kdb, X2 + 980, 140, 800, 380); css(kdb, { borderColor: '#016BF8', borderWidth: '2px' });
  const kdT = h('div', 'abs', kdb, '键值数据库'); css(kdT, { left: '28px', top: '20px', font: '500 44px "Serif SC"', color: '#001E2B' });
  const kdC = chip(kdb, 300, 28, '第 01 章：NoSQL 的四类之一', 'blue');
  const kdR = ['k1 → v1', 'k2 → v2', 'k3 → v3'].map((t, i) => { const e = code(kdb, 28, 110 + i * 76, t); css(e, { fontSize: '30px' }); return e; });
  show(kdb, T('j8', '键值数据库') - 0.4, { x: 30, y: 0 }); show(kdC, T('j8', '第一章') - 0.1, { y: 8 }); kdR.forEach((e, i) => show(e, T('j9', '一个键') - 0.2 + i * 0.2, { y: 8 }));
  const simp = chip(kdb, 28, 330, '一项 = 一个键 + 一个值：更简单的一类', 'blue'); show(simp, T('j9', '更简单') - 0.3, { y: 8 });
  // j10–j12：磁盘与内存
  const LY = 580;
  const mk = (x, title, sub, solid) => { const e = h('div', 'abs', world); px(e, x, 0, 760, 140); css(e, { background: solid ? '#E3FCF7' : '#fff', border: `3px ${solid ? 'solid' : 'dashed'} ${solid ? '#00A35C' : '#889397'}`, borderRadius: '14px' }); e.innerHTML = `<div style="position:absolute;left:26px;top:22px;font:700 34px Inter,'Sans SC';color:#001E2B">${title}</div><div style="position:absolute;left:26px;top:78px;font:500 26px Inter,'Sans SC';color:#3D4F58">${sub}</div>`; return e; };
  const mL = label(world, X2 + 140, LY - 46, 'MongoDB', 'lab'); css(mL, { font: '700 28px "Inter"', color: '#00684A' });
  const mDisk = mk(X2 + 140, '磁盘：数据住在这里', '集合树、索引树，在 .wt 文件里', true), mMem = mk(X2 + 140, '内存：缓存', '用到的页读进来，改完等检查点写回', false);
  css(mDisk, { top: LY + 170 + 'px' }); css(mMem, { top: LY + 'px' });
  show(mL, T('j10') - 0.2, { y: 8 }); show(mDisk, T('j10', '磁盘') - 0.3, { y: 12 }); show(mMem, T('j10', '缓存') - 0.3, { y: 12 });
  const rL = label(world, X2 + 1020, LY - 46, '倒过来呢？', 'lab'); css(rL, { font: '700 28px "Inter", "Sans SC"', color: '#1254B7' });
  const rMem = mk(X2 + 1020, '内存：数据全住在这里', '读写都在内存里', true), rDisk = mk(X2 + 1020, '磁盘：只用来保存', '留一份，以备重启', false);
  css(rMem, { top: LY + 'px' }); css(rDisk, { top: LY + 170 + 'px' });
  show(rL, T('j11') - 0.2, { y: 8 }); show(rMem, T('j11', '内存里') - 0.3, { y: -20 }); show(rDisk, T('j11', '保存') - 0.3, { y: 20 });
  // j12：进程一死，内存里的数据没了
  to(rMem, T('j12', '一死') - 0.1, { backgroundColor: '#FFEAE5', borderColor: '#DB3030', duration: 0.3 });
  const gone = h('div', 'abs', world, '进程一死，这里就空了'); px(gone, X2 + 1046, LY + 78); css(gone, { font: '600 26px "Inter", "Sans SC"', color: '#970606', background: '#FFEAE5' });
  hide(rMem.children[1], T('j12', '一死') - 0.1, { y: 0, d: 0.25 });
  show(gone, T('j12', '一死') - 0.05, { y: 0, d: 0.3 });
  const qm = h('div', 'abs', world, '?'); px(qm, X2 + 1700, LY + 160); css(qm, { font: '700 110px "Inter"', color: '#1254B7' });
  set(qm, s.start, { autoAlpha: 0 });
  const back = link(ov, [[X2 + 1640, LY + 240], [X2 + 1640, LY + 146]], 'blue', { arrow: true, w: 4, dashed: '8 8' }); arrowIn(back, T('j12', '回来') - 0.3, 0.5);

  // ── 三、PART 7：系列的最后一站（与片名同款的整屏卡） ──
  const t13 = T('j13') - 0.2;
  const P = partCard(root, 7, t13, { from: 6 });
  const cr = h('div', 'crumb2', P.main, '文档<i>/</i>数据库引擎<i>/</i>PART 7'); css(cr, { top: '170px' });
  const badge = h('div', 'abs', P.main, 'PART 7'); px(badge, 0, 250); css(badge, { font: '700 52px "Mono"', color: '#00ED64', background: '#001E2B', padding: '10px 30px', borderRadius: '12px', letterSpacing: '.06em' });
  const fin = chip(P.main, 300, 266, '下一集 · 系列最终集', 'blue'); css(fin, { font: '700 30px "Inter", "Sans SC"' });
  const q = h('div', 'abs', P.main, '一个数据库引擎是如何实现的？'); px(q, 0, 380); css(q, { font: '500 46px "Inter", "Sans SC"', color: '#3D4F58' });
  const lead = h('div', 'abs', P.main, '一个更简单的数据库'); px(lead, 0, 460); css(lead, { font: '500 64px "Serif SC"', color: '#00684A' });
  const rd = h('div', 'abs', P.main, 'Redis'); px(rd, -8, 540); css(rd, { font: '900 200px/1.1 "Inter"', color: '#001E2B', letterSpacing: '-.02em' });
  const rule = h('div', 'abs', P.main); px(rule, 0, 790, 1000, 5); css(rule, { background: '#00ED64', transformOrigin: '0 50%' });
  const sub = h('div', 'abs', P.main, '键值数据库 · 数据从内存提供'); px(sub, 0, 818); css(sub, { font: '500 34px "Inter", "Sans SC"', color: '#3D4F58' });
  wipe(cr, t13 + 0.1, { dir: 'l' }); slam(badge, t13 + 0.3, { from: 1.2 }); show(fin, t13 + 0.9, { x: -16, y: 0 });
  show(q, t13 + 0.5, { y: 12 }); show(lead, T('j13', '更简单') - 0.3, { y: 14 });
  slam(rd, T('j14') - 0.15, { from: 1.15 }); sfx('thud', T('j14'));
  fromTo(rule, T('j14') + 0.4, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' });
  show(sub, T('j14') + 0.05, { y: 10 });
  // 前六集在目录里依次打上勾，留下最后一集
  P.items.slice(0, 6).forEach((it, k) => { const ck = svg('svg', { viewBox: '0 0 24 24', width: 26, height: 26 }, it); css(ck, { marginLeft: '14px', verticalAlign: '-4px' }); svg('path', { d: 'M4 12.5l5 5L20 6.5', fill: 'none', stroke: '#00A35C', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck); show(ck, T('j14') + 1.3 + k * 0.15, { x: -8, y: 0, d: 0.35 }); });
  tl.set([world, ch.c], { autoAlpha: 0 }, t13 + 0.05);
  to(P.sel, T('j14') + 2.0, { backgroundColor: '#71F6BA', duration: 0.5 });

  // 镜头：两站
  const m1 = T('j7') + 2.1;
  const a = drift(s.start, m1, 960, -1), b = drift(m1 + 1.3, t13, X2 + 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d - 0.2, { ease: 'none', sfx: false }],
    [m1, { x: b.from }, 1.3],
    [null, { x: b.to }, Math.max(0.5, b.d - 0.2), { ease: 'none', sfx: false }],
  ]);
});
