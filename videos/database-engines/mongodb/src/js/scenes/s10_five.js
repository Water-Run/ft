// 第 10 章 五个问题：第一站五行问答；第二站「不要表，换来什么」——文档各有各的字段，代价是字段名跟着每份文档存 4096 遍，
// 分布到多台机器这一集不讲；第三站从 WiredTiger 的键值、键值数据库、内存与磁盘的倒置，引到 Redis。
// 事实：A04 A12 B01 A07 H06 H08 N01 S02 V03。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const X2 = 1920, X3 = 3840;

  // ── 第一站：五个问题 ──
  const hd = label(world, 120, 120, '一个数据库引擎要回答的五个问题', 'eyebrow'); show(hd, c0, { x: -10, y: 0 });
  const R = [
    ['数据怎么放', 190, 130, '文档编成 BSON，按 RecordId 放进集合树', '每个索引另是一棵树，最后都指回 RecordId', 'i1', 'i2'],
    ['怎么找', 335, 104, '在索引里拿到 RecordId，再回集合树取文档', '', 'i3', null],
    ['改和删', 454, 130, '内存里挂新版本、挂删除标记', '检查点时整页写到新地方，旧页不覆盖', 'i4', 'i5'],
    ['怎么并发', 599, 104, '读的人看快照；改同一份文档撞上了，一方重来', '', 'i6', null],
    ['出错怎么办', 718, 130, '回到最后一个检查点，重放日志', '单机上不带 j，进程被杀时，最后一小段可能会丢', 'i8', 'i9'],
  ];
  const q = [];
  R.forEach(([qs, y, hh, a, a2, t1, t2], i) => {
    const qt = tile(world, 120, y, 360, hh, qs, '', 'dk'); css(qt, { padding: hh > 110 ? '40px 24px' : '26px 24px' }); qt.querySelector('.tt').style.cssText = 'font: 700 38px "Serif SC"';
    const at = tile(world, 520, y, 1280, hh, a, a2, i % 2 ? '' : 'g');
    if (hh < 110) css(at, { padding: '26px 24px' });
    if (a2) set(at._s, s.start, { autoAlpha: 0 });
    show(qt, T('i0') + 0.3 + i * 0.4, { x: -20, y: 0 });
    show(at, T(t1), { y: 10 }); if (a2) show(at._s, T(t2), { y: 6 });
    const nxt = R[i + 1] ? T(R[i + 1][5]) : T('j1') - 0.4, mw = (T(t1) + (a2 ? Tend(t2) : Tend(t1))) / 2;
    glow(at, Math.max(T(t1) + 1.2, mw - 0.6), nxt - 0.2, { bg: '#00ED64', bd: '#00ED64', rb: i % 2 ? '#FFFFFF' : '#E3FCF7', rd: i % 2 ? '#C1C7C6' : '#00684A' });
    sfx('pop', T(t1)); q.push(qt, at);
  });
  const how = chip(world, 1100, 100, 'MongoDB 这样答', 'dk xl'); show(how, T('i0', '答案') - 0.3, { y: 10 });
  fadeOut([hd, how, ...q], T('j1') - 0.2);

  // ── 第二站：不要表，换来了什么 ──
  const doc = (x, y, w, name, lines, extra) => {
    const c = codeCard(world, X2 + x, y, w, name, 60 + 46 * (lines.length + 2) + 20);
    c.line('{'); lines.forEach((l, i) => { const e = c.line('  ' + l); if (extra === i) e.dataset.x = '1'; }); c.line('}'); return c;
  };
  const a1 = doc(160, 220, 440, '一份文档', ['<span class="k">name</span>: <span class="s">"Alice"</span>,', '<span class="k">age</span>: <span class="n">42</span>']);
  show(a1.c, T('j1'), { y: 16 });
  const noTbl = chip(world, X2 + 160, 520, '没有建表', 'dk xl'); show(noTbl, T('j1', '没建表') - 0.3, { y: 0, s: 1.2 }); fadeOut(noTbl, T('j2b') - 0.2);
  const nq = h('div', 'abs h2', world, '不要表，换来了什么？'); px(nq, X2 + 700, 280); show(nq, T('j1b'), { x: -20, y: 0 });
  fadeOut([a1.c, nq], T('j2b') - 0.2);
  const cp = h('div', 'panel', world); px(cp, X2 + 120, 130, 1680, 400); show(cp, T('j2b'), { y: 14 });
  const cpt = h('div', 'abs', cp, 'people 集合：不规定文档的样子'); css(cpt, { left: '28px', top: '16px', font: '700 32px "Serif SC"', color: '#061621' });
  const cA = codeCard(cp, 30, 80, 500, 'Alice', 270), cE = codeCard(cp, 590, 80, 500, 'Erin', 270), cF = codeCard(cp, 1150, 80, 500, 'Frank', 270);
  cA.line('{ <span class="k">name</span>: <span class="s">"Alice"</span>,'); cA.line('  <span class="k">age</span>: <span class="n">42</span> }');
  cE.line('{ <span class="k">name</span>: <span class="s">"Erin"</span>,'); cE.line('  <span class="k">email</span>: <span class="s">"…"</span>,'); cE.line('  <span class="k">tags</span>: <span class="s">[…]</span> }');
  cF.line('{ <span class="k">name</span>: <span class="s">"Frank"</span>,'); cF.line('  <span class="k">address</span>: { … } }');
  show(cA.c, T('j2b') + 0.3, { y: 12 }); show(cE.c, T('j3'), { y: 12 }); show(cF.c, T('j3') + 0.4, { y: 12 }); sfx('pop', T('j3'));
  const free = note(world, X2 + 160, 560, '除了 _id，每份文档想有哪些字段，就有哪些', 'dn g'); show(free, T('j2b') + 0.2, { y: 8 }); fadeOut(free, T('j5') - 0.5);
  // 代价：字段名跟着每份文档存一遍
  const cost = note(world, X2 + 160, 560, '代价：字段名跟着每份文档存一遍', 'dn r'); show(cost, T('j5', '代价'), { y: 8 });
  const names = ['_id', 'name', 'age'].map((n, i) => { const c = chip(world, X2 + 160 + i * 150, 680, n, 'on'); css(c, { font: '700 28px "Mono"' }); return c; });
  show(names, T('j6'), { y: 10, stagger: 0.12 });
  const times = h('div', 'abs', world); px(times, X2 + 700, 650); css(times, { font: '800 84px "Inter"', color: '#00684A' });
  times.textContent = '× 0 遍'; show(times, T('j6') + 0.9, { y: 8 });
  stepTo(times, [[T('j6') + 1.2, 1.6, 0, 4096]], (v) => '× ' + Math.round(v).toLocaleString('en-US') + ' 遍');
  const tot = chip(world, X2 + 700, 770, '每份 13 字节 × 4096 = 53,248 字节', 'dk xl'); show(tot, T('j6b') + 0.4, { y: 10 });
  fadeOut([cp, cost, ...names, times, tot], T('j7') - 0.6);
  // 分到很多台机器上：这一集不讲

  // ── 第三站：键值，内存与磁盘，Redis ──
  const kv = [['2050', '47 字节的文档'], ['"Alice" + 2050', '（空）'], ['ObjectId(…)', '2050']];
  const kvl = label(world, X3 + 160, 130, 'WiredTiger 只认：键 → 值', 'eyebrow'); show(kvl, T('j7'), { x: -10, y: 0 });
  const kvs = kv.map(([k, v], i) => {
    const a = pg(world, X3 + 160, 200 + i * 80, 300, 64, k, 'root'), b = pg(world, X3 + 520, 200 + i * 80, 300, 64, v);
    css(a, { fontSize: '24px' }); css(b, { fontSize: '24px' }); return [a, b];
  });
  show(kvs.flat(), T('j7') + 0.3, { y: 10, stagger: 0.08 });
  glow(kvs.map((p) => p[1]), T('j7', '键和值') - 0.3, T('j8'), { bg: '#00ED64', bd: '#00ED64' });
  const kt = tile(world, X3 + 1040, 150, 760, 260, '键值数据库', 'NoSQL 的一类', 'sp'); show(kt, T('j8', '键值数据库') - 0.4, { y: 12 });
  const mini = [0, 1, 2].map((i) => { const c = chip(kt, 26 + i * 240, 160, ['k1 → v1', 'k2 → v2', 'k3 → v3'][i], 'dk xl'); css(c, { fontFamily: '"Mono"', fontSize: '28px' }); return c; });
  show(mini, T('j9', '一个键') - 0.3, { y: 10, stagger: 0.3 });
  keyed(kt._s).at(T('j9'), { html: '一个键，一个值：更简单的一类' });
  const dk = tile(world, X3 + 160, 450, 720, 280, 'MongoDB', ''); show(dk, T('j10'), { y: 12 });
  const dkd = h('div', 'abs', dk, '磁盘 · 数据住在树里'); px(dkd, 30, 90, 660, 90); css(dkd, { background: '#E3FCF7', border: '2px solid #00684A', borderRadius: '8px', font: '600 30px/90px "Sans SC"', textAlign: 'center' });
  const dkm = h('div', 'abs', dk, '内存 · 缓存'); px(dkm, 130, 200, 460, 60); css(dkm, { border: '2px dashed #889397', borderRadius: '8px', font: '500 26px/60px "Sans SC"', textAlign: 'center', color: '#5C6C75' });
  const rv = tile(world, X3 + 1040, 450, 760, 280, '倒过来', ''); show(rv, T('j11'), { y: 12 });
  const rvm = h('div', 'abs', rv, '内存 · 数据全住在这里'); px(rvm, 30, 90, 700, 90); css(rvm, { background: '#C0FAE6', border: '2px solid #00684A', borderRadius: '8px', font: '600 30px/90px "Sans SC"', textAlign: 'center' });
  const rvd = h('div', 'abs', rv, '磁盘 · 只用来保存'); px(rvd, 130, 200, 500, 60); css(rvd, { border: '2px dashed #889397', borderRadius: '8px', font: '500 26px/60px "Sans SC"', textAlign: 'center', color: '#5C6C75' });
  glow(dkd, T('j10', '磁盘上的树') - 0.3, T('j11'), { bg: '#00ED64', bd: '#00ED64' });
  glow(rvm, T('j11', '全住在内存里') - 0.3, null, { bg: '#00ED64', bd: '#00ED64' });
  const dq = slotNote(world, X3 + 520, 780, '进程一死，内存里的数据又靠什么回来？', T('j12'), T('j13') - 0.3, 'r');
  fadeOut([kvl, ...kvs.flat(), kt, dk, rv], T('j13') - 0.3);
  const last = h('div', 'abs h2', world, '这个系列的最后一站：一个更简单的数据库'); px(last, X3 + 160, 330, 1600); css(last, { textAlign: 'center' });
  show(last, T('j13'), { y: 14 });
  const plate = h('div', 'abs', world); px(plate, X3 + 160, 450, 1600, 230); css(plate, { background: '#001E2B', borderRadius: '18px' });
  show(plate, T('j13', '更简单') - 0.3, { y: 0, s: 0.97 });
  const rd = h('div', 'abs big', world, 'Redis'); px(rd, X3 + 160, 480, 1600); css(rd, { textAlign: 'center', color: '#00ED64' });
  slam(rd, T('j14'), { from: 1.3 }); sfx('thud', T('j14'));
  // 下一集预告：集数标识与片头的 PART 6 同一种样式；一句注解与两个下集会讲的词（S02）
  const p7 = h('div', 'abs eyebrow', world, 'PART 7 · REDIS'); px(p7, X3 + 200, 482); css(p7, { color: '#71F6BA', borderLeftColor: '#00ED64' });
  wipe(p7, T('j14') - 0.3, { dir: 'l', d: 0.35 }); sfx('tick', T('j14') - 0.3, { g: 0.4 });
  const rg = gloss(note(world, X3 + 160, 712, '<b>Redis</b>：键值数据库，数据从内存提供，磁盘用来保存', 'g'), 'Redis'); css(rg, { fontSize: '30px' });
  show(rg, T('j14') + 0.5, { y: 10 });
  const rdb = chip(world, X3 + 160, 800, 'RDB：某一刻的快照', 'dk xl'), aof = chip(world, X3 + 560, 800, 'AOF：记下每个写操作，启动时重放', 'dk xl');
  show(rdb, T('j14') + 0.9, { y: 10 }); show(aof, T('j14') + 1.2, { y: 10 });

  // 镜头：三站
  const m1 = T('j1') - 0.9, m2 = T('j7') - 0.9;
  const a = drift(s.start, m1, 960, 1), b = drift(m1 + 1.3, m2, X2 + 960, -1), c = drift(m2 + 1.3, s.end, X3 + 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }],
    [m1, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
    [m2, { x: c.from }, 1.3],
    [null, { x: c.to }, c.d, { ease: 'none', sfx: false }],
  ]);
});
