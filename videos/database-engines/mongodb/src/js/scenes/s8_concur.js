// 第 08 章 事务与并发：事务与副本集（单机 mongod 的真实报错；实验用单节点副本集）；时间轴演 Bob 的快照读：Bob 开事务读 42，
// Alice 改 43 提交，Bob 再读仍是 42，事务外是 43，Bob 结束后是 43（右上是实验打印的原样输出）；快照顺着更新链往回找；
// 两人改同一份文档：Carol 收到写冲突、整个事务重来（WriteConflict / TransientTransactionError）。
// 回显抄自 research/lab/out_08_concurrency.txt。事实：G00 G00b G01 G04 G06 G07 G08 D01 H04 V02。
scene('concur', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const arrow = (pts, t, col = 'accent', o = {}) => { const p = link(ov, pts, col, { arrow: true, w: 3, ...o }); arrowIn(p, t, 0.6); return p; };
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const pop = (x, y, txt, t0, t1, cls = 'dk') => { const c = xl(world, x, y, txt, cls); show(c, t0, { y: 10 }); if (t1 != null) fadeOut(c, t1); return c; };

  // ── 一、同一份文档，有人读有人改；事务；副本集 ──
  const doc = tile(world, 700, 250, 520, 150, 'Alice 的资料', 'age 42', 'dk'); show(doc, c0, { y: 14 });
  const bobC = xl(world, 190, 300, 'Bob 在读', 'on'), alC = xl(world, 1430, 300, 'Alice 在改');
  show(bobC, T('g1', '有人在读') - 0.2, { x: -20, y: 0 }); show(alC, T('g1', '有人在改') - 0.2, { x: 20, y: 0 });
  const a1 = arrow([[400, 325], [690, 325]], T('g1', '有人在读')), a2 = arrow([[1420, 325], [1230, 325]], T('g1', '有人在改'));
  const ta = tile(world, 140, 500, 520, 150, '一次写入', 'MongoDB 在内部替它开一个事务', 'dk');
  const tb = tile(world, 700, 500, 520, 150, '应用自己开事务', '把几份文档的读写包在一起', 'sp');
  const tc = tile(world, 1260, 500, 520, 150, '4.0 版加入', '2018 年', 'dk');
  show(ta, T('g2', '事务') - 0.3, { y: 12 });
  const inner = pop(140, 680, '内部事务', T('g2', '一次写入') - 0.2, null, 'dk');
  show(tb, T('g3', '自己开事务') - 0.3, { y: 12 });
  const wrap = pop(700, 680, '几份文档，包在一起', T('g3', '包在一起') - 0.3, null, 'dk');
  show(tc, T('g4', '2018') - 0.3, { y: 12 }); sfx('pop', T('g4', '2018') - 0.3);
  to([ta, inner, wrap], T('g4', '加上的') - 0.2, { autoAlpha: 0.35, duration: 0.5 });
  const err = term(world, 140, 780, 1640, 150, 'mongosh · 单机的 mongod', { fs: 22 });
  show(err.c, T('g5') - 0.1, { y: 12 });
  err.out(T('g5', '不接受') - 0.4, '<span class="r">MongoServerError: Transaction numbers are only allowed on a replica set member or mongos</span>');
  fadeOut([doc, bobC, alC, a1, a2, ta, tb, tc, inner, wrap], T('g5', '副本集') - 0.2);
  // 副本集：几台 mongod 维护同一份数据；这里只有一台
  const rs = gloss(note(world, 300, 290, '<b>副本集</b>：几台 mongod，维护同一份数据', 'dn g'), '副本集'); show(rs, T('g5', '副本集') - 0.3, { y: 8 });
  const sv = [0, 1, 2].map((i) => tile(world, 300 + i * 470, 400, 380, 140, 'mongod', i === 0 ? '这一台' : '另一台', 'dk'));
  show(sv, T('g5a', '几台') - 0.2, { y: 14, stagger: 0.15 });
  to([sv[1], sv[2]], T('g5a', '只用了一台') - 0.3, { autoAlpha: 0.2, duration: 0.5 });
  const only = pop(300, 580, '实验里的副本集，只有一台', T('g5a', '只用了一台'), null, 'on');
  fadeOut([...sv, rs, only, err.c], T('g6') - 0.2);

  // ── 二、快照：时间轴上的五件事；右上是实验的原样输出 ──
  const AX = [300, 640, 980, 1320, 1660];
  pop(140, 96, '还是从刚写完 4096 人开始', T('g6') + 0.2, T('g6', 'Alice') - 0.1, 'dk');
  pop(140, 96, '再看一遍：Alice 过生日', T('g6', 'Alice') - 0.1, T('g7') - 0.1, 'on');
  const ttl = label(world, 460, 190, 'Alice 的这一项 · 更新链', 't-body'); css(ttl, { fontWeight: 700 }); show(ttl, T('g6') + 1.4, { y: 6 });
  const b42 = tile(world, 460, 240, 260, 150, 'age 42', '旧版本', 'g'), b43 = tile(world, 1000, 240, 260, 150, 'age 43', '新版本', 'g');
  const cl = link(ov, [[730, 315], [990, 315]], 'accent', { arrow: true, w: 3 });
  show(b42, T('g6') + 1.8, { y: 12 }); show(b43, T('g8', '43') - 0.2, { x: -30, y: 0 }); arrowIn(cl, T('g8', '43'), 0.5);
  const out = term(world, 1300, 60, 500, 330, 'mongosh · 实验输出', { fs: 22 });
  show(out.c, T('g7') - 0.2, { x: 20, y: 0 });
  const axis = link(ov, [[160, 640], [1780, 640]], 'dim', { arrow: true, w: 3 }); arrowIn(axis, T('g7') - 0.3, 0.8);
  const EV = [['g7', 'Bob 开事务<br>拿到快照', '读到 42', 'Bob 第一次读： <span class="n">42</span>', '42 岁'], ['g8', 'Alice 改成 43<br>并提交', '写入 43', 'Alice 改年龄： <span class="n">1</span> 份', '提交了'],
    ['g9', 'Bob 在同一个<br>事务里再读', '还是 42', 'Bob 在同一个事务里再读： <span class="n">42</span>', '还是 42'], ['g10', '在事务外读', '读到 43', '事务外此刻读： <span class="n">43</span>', '43'], ['g11', 'Bob 结束事务<br>再读', '读到 43', 'Bob 结束事务后再读： <span class="n">43</span>', '才是 43']];
  const TL = [axis, ttl, out.c];
  EV.forEach(([id, lab, res, line, w], i) => {
    const x = AX[i];
    const dot = h('div', 'abs', world); px(dot, x - 13, 627, 26, 26); css(dot, { borderRadius: '50%', background: '#023430' });
    const lb = h('div', 'abs t-note', world, lab); px(lb, x - 150, 672, 300); css(lb, { textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.35', color: '#1C2D38' });
    const rc = xl(world, x - 95, 530, res, i === 1 ? 'dk' : ''); css(rc, { width: '190px', textAlign: 'center', boxSizing: 'border-box', padding: '10px 0' });
    show([dot, lb], T(id), { y: 10, stagger: 0.08 }); show(rc, T(id) + 0.6, { y: 10 }); sfx('pop', T(id));
    out.out(T(id, w) - 0.2, line);
    TL.push(dot, lb, rc);
  });
  const br = link(ov, [[AX[0], 800], [AX[4] - 90, 800]], 'accent', { w: 6 }); draw(br, T('g7') + 0.4, T('g11') - T('g7'), { ease: 'none' });
  const brL = label(world, AX[0], 820, 'Bob 的事务一直开着', 't-note'); show(brL, T('g7') + 0.4, { y: 6 });
  TL.push(br, brL);
  const SPR = { bg: '#00ED64', bd: '#00ED64' };
  glow(b42, T('g7', '42 岁') - 0.3, T('g8'), SPR);
  glow(b43, T('g8', '提交了') - 0.3, T('g9'), SPR);
  glow(b42, T('g9', '还是 42') - 0.3, T('g10'), SPR);
  glow(b43, T('g10', '43') - 0.3, T('g11'), SPR);
  glow(b43, T('g11', '才是 43') - 0.3, T('g12') - 0.3, SPR);
  fadeOut(TL, T('g12') - 0.2);

  // 快照：记下那一刻的状态，读的时候顺着更新链往回找
  pop(560, 470, '事务一开始：拿到快照', T('g12') + 0.2, T('g13') - 0.1, 'dk');
  const sn = tile(world, 560, 600, 800, 140, '快照', '事务开始的那一刻，系统里各事务的状态', 'g'); gloss(sn, '快照');
  show(sn, T('g12', '快照') - 0.3, { y: 12 }); swapAt(sn._s, '事务开始的那一刻，系统里各事务的状态', '哪些修改已经提交，哪些还没有', T('g13'));
  pop(560, 770, '已经提交的：看得见', T('g13', '已经提交') - 0.2, T('g14') - 0.1, 'on');
  pop(1000, 770, '还没提交的：看不见', T('g13', '还没有') - 0.2, T('g14') - 0.1, 'dk');
  const bob2 = xl(world, 700, 470, '读的时候，顺着更新链往回找', 'dk'); show(bob2, T('g14'), { y: 8 });
  const skip = arrow([[1160, 470], [1130, 396]], T('g14', '快照之后') - 0.2, 'red', { dashed: '8 6' });
  const skipL = xl(world, 1290, 420, '快照之后才提交：跳过', 'red'); show(skipL, T('g14', '快照之后') - 0.2, { y: 10 }); to(b43, T('g14', '43') - 0.2, { autoAlpha: 0.4, duration: 0.4 }); to(b43, T('g15'), { autoAlpha: 1, duration: 0.4 });
  const take = arrow([[760, 470], [620, 396]], T('g14', '跳过去') - 0.1, 'accent', { w: 5 });
  glow(b42, T('g14', '跳过去') - 0.2, T('g19a') - 0.2, SPR);
  pop(460, 150, 'Bob 读到的：还是 42', T('g14b') + 0.1, T('g19a') - 0.2, 'on');
  fadeOut(skipL, T('g15'));
  slotNote(world, 560, 790, 'Alice 的修改照样完成，不用等 Bob', T('g15'), T('g19a') - 0.2, 'g');
  glow(b43, T('g15', '不用等') - 0.2, T('g19a') - 0.2, SPR);
  fadeOut([sn, bob2, skip, take], T('g19a') - 0.2);

  // ── 三、两个人改同一份文档：写冲突，整个事务重来 ──
  const t19a = T('g19a');
  fadeOut([b42, b43, cl], t19a - 0.2);
  const wA = xl(world, 140, 330, 'Alice', 'on'), wC = xl(world, 140, 500, 'Carol', 'dk');
  const dA = tile(world, 600, 290, 420, 130, 'Alice 的资料', 'age 42');
  show([wA, wC], t19a + 0.2, { x: -20, y: 0 }); show(dA, t19a + 0.4, { y: 12 });
  const pA = arrow([[290, 355], [590, 355]], t19a + 0.6), pC2 = arrow([[300, 520], [590, 400]], T('g19a', '同一份') - 0.2, 'accent', { w: 4 });
  pop(600, 470, '改的是同一份文档', T('g19a', '同一份') - 0.1, T('g21') - 0.1, 'dk');
  // 事件列表（右侧，一行一件事）
  const row = (t, txt, cls, y) => { const e = tile(world, 1060, y, 740, 84, txt, '', cls); css(e, { padding: '18px 22px' }); show(e, t, { y: 10 }); return e; };
  const r1 = row(T('g21', '改了') - 0.3, 'Alice 的事务：改了它，还没提交', 'dk', 200);
  pop(840, 246, '未提交', T('g21', '还没提交') - 0.2, T('g27') - 0.1, 'dk');
  const r2 = row(T('g22', '也要改') - 0.3, 'Carol 的事务：也要改这份文档', 'dk', 298);
  to(r1, T('g22'), { autoAlpha: 0.55, duration: 0.4 });
  const r3 = row(T('g23', '排队') - 0.3, '排队等 Alice？', 'dk', 396);
  to(r2, T('g23'), { autoAlpha: 0.55, duration: 0.4 });
  pop(600, 470, '等 Alice 提交？', T('g23', '等 Alice') - 0.2, T('g24') - 0.1, 'dk');
  const strike = svg('line', { x1: 1090, y1: 438, x2: 1770, y2: 438, stroke: '#DB3030', 'stroke-width': 6, 'stroke-linecap': 'round' }, ov); draw(strike, T('g23', '没这么做') - 0.2, 0.5);
  to(r3, T('g23', '没这么做') + 0.3, { autoAlpha: 0.4, duration: 0.5 });
  glow(dA, T('g24', '同一份文档') - 0.3, null, { bg: '#FFE9E7', bd: '#DB3030' });
  pop(600, 470, '两人改的是同一份', T('g24', '同一份文档') - 0.3, T('g25', '写冲突') - 0.6, 'red');
  const r4 = row(T('g25', '写冲突') - 0.4, '写冲突：Carol 立刻收到错误', 'rd', 494); gloss(r4, '写冲突');
  to(wC, T('g25', 'Carol'), { backgroundColor: '#DB3030', borderColor: '#DB3030', duration: 0.3 });
  const r5 = row(T('g26', '标签') - 0.3, '错误的标签：整个事务可以重来', 'dk', 592);
  const r6 = row(T('g27', '成功了') - 0.4, 'Alice 提交后，Carol 重做整个事务：成功', 'sp', 690);
  to(wC, T('g27', '重做') - 0.2, { backgroundColor: '#023430', borderColor: '#023430', duration: 0.3 });
  glow(dA, T('g27', '提交以后'), null, { bg: '#C0FAE6', bd: '#00684A' });
  sfx('error', T('g25', '写冲突') - 0.4); sfx('chime', T('g27', '成功了') - 0.4);
  // 实验的原样输出（左下）
  const ce = term(world, 140, 600, 880, 330, 'mongosh · 实验输出', { fs: 22 });
  show(ce.c, T('g25') - 0.2, { y: 12 });
  ce.out(T('g25', '写冲突') - 0.2, "{ <span class=\"k\">'Carol 的错误'</span>: <span class=\"r\">'WriteConflict'</span>,");
  ce.out(T('g26', '标签') - 0.2, "  <span class=\"k\">'错误标签'</span>: [ <span class=\"s\">'TransientTransactionError'</span> ] }");
  ce.out(T('g27', '提交以后') - 0.2, 'Alice 提交之后： <span class="n">44</span>');
  ce.out(T('g27', '成功了') - 0.4, 'Carol 重做一遍事务： <span class="n">45</span>');
  const opt = pop(1060, 800, '先不排队，撞上了再重来：乐观并发', T('g28', '不排队') - 0.2, null, 'on');
  [r1, r2, r3, r4, r5].forEach((r, i) => to(r, T('g28') + 1.4 + i * 0.4, { autoAlpha: 0.25, duration: 0.5 }));
  fadeOut([wA, wC, dA, pA, pC2, r1, r2, r3, r4, r5, r6, strike, ce.c, opt], T('g36') - 0.3);

  // 收尾的设问
  const q = h('div', 'abs h2', world, '可要是 mongod 突然被杀了呢？'); px(q, 260, 420, 1400); css(q, { textAlign: 'center', whiteSpace: 'normal' });
  show(q, T('g36') + 0.1, { y: 16 });
  const qr = h('div', 'abs', world); px(qr, 560, 520, 800, 8); css(qr, { background: '#00ED64', transformOrigin: '0 50%' });
  fromTo(qr, T('g36') + 0.8, { scaleX: 0 }, { scaleX: 1, duration: 3.0, ease: 'power1.inOut' });
  pop(560, 580, '下一章：强制结束 mongod，看丢了什么', T('g36', '被杀了'), null, 'dk');
  pop(560, 680, '还没写进文件的修改呢？', T('g36') + 1.8, null, 'red');

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
