// 第 08 章 事务与并发：先交代事务与副本集（实验用单节点副本集）；再用时间轴演 Bob 的快照读：Bob 开事务读 42，Alice 改 43 提交，
// Bob 再读仍是 42，事务外是 43，Bob 结束后是 43；快照与历史存储；改不同文档可以同时进行；同一份文档写冲突、整个事务重来；
// 不开事务时服务端自己重试。事实：G00 G00b G01 G02 G03 G04 G05 G06 G07 G08 D01 H04 V02。
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
  const inner = pop(140, 680, '内部事务', T('g2', '内部') - 0.2, null, 'dk');
  show(tb, T('g3', '自己开事务') - 0.3, { y: 12 });
  const wrap = pop(700, 680, '几份文档，包在一起', T('g3', '包在一起') - 0.3, null, 'dk');
  show(tc, T('g4', '2018') - 0.3, { y: 12 }); sfx('pop', T('g4', '2018') - 0.3);
  to([ta, inner, wrap], T('g4', '加上的') - 0.2, { autoAlpha: 0.35, duration: 0.5 });
  const nS = slotNote(world, 700, 820, '单机的 mongod 不接受这样的事务', T('g5'), null, 'r');
  fadeOut([doc, bobC, alC, a1, a2, ta, tb, tc, inner, wrap, nS], T('g5a') - 0.1);
  // 副本集：几台 mongod 维护同一份数据；这里只有一台
  const sv = [0, 1, 2].map((i) => tile(world, 300 + i * 470, 420, 380, 140, 'mongod', i === 0 ? '这一台' : '另一台', 'dk'));
  show(sv, T('g5a', '几台') - 0.2, { y: 14, stagger: 0.15 });
  const rs = gloss(note(world, 300, 290, '<b>副本集</b>：几台 mongod，维护同一份数据', 'dn g'), '副本集'); show(rs, T('g5a', '副本集') - 0.3, { y: 8 });
  to([sv[1], sv[2]], T('g5b', '只有一台') - 0.3, { autoAlpha: 0.2, duration: 0.5 });
  const only = pop(300, 620, '实验里的副本集，只有一台', T('g5b', '只有一台'), null, 'on');
  fadeOut([...sv, rs, only], T('g6') - 0.2);

  // ── 二、快照：时间轴上的五件事 ──
  const AX = [300, 640, 980, 1320, 1660];
  const fresh = pop(1000, 110, '又从刚写完 4096 人开始', T('g6') + 0.2, T('g6b') - 0.1, 'dk');
  pop(1000, 110, '再看一遍：Alice 过生日', T('g6b') + 0.1, T('g7') - 0.1, 'on');
  const ttl = label(world, 460, 150, 'Alice 的这一项 · 更新链', 't-body'); css(ttl, { fontWeight: 700 }); show(ttl, T('g6b', 'Alice'), { y: 6 });
  const b42 = tile(world, 460, 240, 260, 150, 'age 42', '旧版本', 'g'), b43 = tile(world, 1000, 240, 260, 150, 'age 43', '新版本', 'g');
  const cl = link(ov, [[730, 315], [990, 315]], 'accent', { arrow: true, w: 3 });
  show(b42, T('g6', '开始') - 0.2, { y: 12 }); show(b43, T('g8', '43') - 0.2, { x: -30, y: 0 }); arrowIn(cl, T('g8', '43'), 0.5);
  const axis = link(ov, [[160, 640], [1780, 640]], 'dim', { arrow: true, w: 3 }); arrowIn(axis, T('g7') - 0.3, 0.8);
  const EV = [['g7', 'Bob 开事务<br>拿到快照', '读到 42'], ['g8', 'Alice 改成 43<br>并提交', '写入 43'], ['g9', 'Bob 在同一个<br>事务里再读', '还是 42'], ['g10', '在事务外读', '读到 43'], ['g11', 'Bob 结束事务<br>再读', '读到 43']];
  const TL = [axis, ttl];
  EV.forEach(([id, lab, res], i) => {
    const x = AX[i];
    const dot = h('div', 'abs', world); px(dot, x - 13, 627, 26, 26); css(dot, { borderRadius: '50%', background: '#023430' });
    const lb = h('div', 'abs t-note', world, lab); px(lb, x - 150, 672, 300); css(lb, { textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.35', color: '#1C2D38' });
    const rc = xl(world, x - 95, 530, res, i === 1 ? 'dk' : ''); css(rc, { width: '190px', textAlign: 'center', boxSizing: 'border-box', padding: '10px 0' });
    show([dot, lb], T(id), { y: 10, stagger: 0.08 }); show(rc, T(id) + 0.6, { y: 10 }); sfx('pop', T(id));
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

  // 快照：记下那一刻的状态，顺着更新链往回找
  const sn = tile(world, 560, 600, 800, 140, '快照', '事务开始的那一刻，系统里各事务的状态', 'g'); gloss(sn, '快照');
  pop(560, 470, '事务一开始：拿到快照', T('g12') + 0.2, T('g13') - 0.1, 'dk');
  show(sn, T('g12', '快照') - 0.3, { y: 12 }); swapAt(sn._s, '事务开始的那一刻，系统里各事务的状态', '哪些修改已经提交，哪些还没有', T('g13'));
  const seen = pop(560, 770, '已经提交的：看得见', T('g13', '哪些修改已经提交') - 0.2, T('g14') - 0.1, 'on');
  const unseen = pop(1000, 770, '还没提交的：看不见', T('g13', '还没有') - 0.2, T('g14') - 0.1, 'dk');
  const bob2 = xl(world, 800, 470, 'Bob 的快照', 'dk'); show(bob2, T('g14'), { y: 8 });
  pop(560, 770, '顺着更新链往回找', T('g14') + 0.6, T('g14b') - 0.1, 'dk');
  const skip = arrow([[1010, 470], [1100, 396]], T('g14', '43') - 0.2, 'red', { dashed: '8 6' });
  const skipL = xl(world, 1290, 420, '快照之后才提交：跳过', 'red'); show(skipL, T('g14', '跳过去') - 0.3, { y: 10 });
  const take = arrow([[860, 470], [620, 396]], T('g14b'), 'accent', { w: 5 });
  glow(b42, T('g14b', '42') - 0.2, T('g16') - 0.2, SPR);
  fadeOut(skipL, T('g15'));
  slotNote(world, 560, 790, 'Alice 的修改照样完成，不用等 Bob', T('g15'), T('g16') - 0.2, 'g');
  glow(b43, T('g15', '不用等') - 0.2, T('g16') - 0.2, SPR);
  fadeOut([sn, bob2, skip, skipL, take], T('g16') - 0.2);

  // 旧版本写到历史存储
  slotNote(world, 560, 790, '这些旧版本，也不会一直挂在内存里', T('g16'), T('g17') - 0.1);
  const hs = tile(world, 330, 560, 520, 150, '历史存储', '更旧、还有读者要用的：42', 'dk');
  const cf = tile(world, 870, 560, 520, 150, '集合文件', '只放每一项最新的：43', 'sp');
  const h2 = arrow([[1130, 396], [1130, 550]], T('g17', '最新的版本') - 0.4), h1 = arrow([[590, 396], [590, 550]], T('g18', '另一个文件') - 0.3);
  show(cf, T('g17', '最新的版本') - 0.4, { y: 12 }); show(hs, T('g18', '另一个文件') - 0.3, { y: 12 }); sfx('pop', T('g17', '最新的版本')); sfx('pop', T('g18', '另一个文件'));
  const hsf = pop(330, 730, 'WiredTigerHS.wt', T('g18', '历史存储') - 0.3, T('g19a') - 0.2, 'dk'); css(hsf, { fontFamily: '"Mono"' });
  glow(b43, T('g17'), T('g18'), SPR);

  // ── 三、改不同的文档可以同时；改同一份撞上写冲突 ──
  const t19a = T('g19a');
  fadeOut([b42, b43, cl, hs, cf, h1, h2], t19a - 0.2);
  const nb1 = pop(600, 120, '读的人不挡改的人', t19a, T('g19') - 0.1, 'on');
  const nb2 = pop(1000, 120, '两个人都在改呢？', T('g19a', '两个人') - 0.2, T('g19') - 0.1, 'dk');
  const wA = xl(world, 140, 330, 'Alice', 'on'), wC = xl(world, 140, 500, 'Carol', 'dk');
  const dA = tile(world, 600, 290, 420, 130, 'Alice 的资料', 'age 42'), dB = tile(world, 600, 480, 420, 130, '另一份文档', '另一个人的资料');
  const T19 = T('g19');
  show([wA, wC], T19, { x: -20, y: 0 }); show([dA, dB], T19, { y: 12, stagger: 0.1 });
  const pA = arrow([[290, 355], [590, 355]], T19 + 0.4), pC = arrow([[300, 525], [590, 545]], T19 + 0.6);
  pop(1080, 400, '改不同的文档：同时进行', T('g19', '不同的文档') - 0.2, T('g20') - 0.1, 'on');
  glow([dA, dB], T('g19', '同时进行') - 0.3, T('g20') - 0.2, SPR);
  fadeOut([pC, dB], T('g20', '同一份') - 0.2);
  const pC2 = arrow([[300, 520], [590, 400]], T('g20', '同一份') + 0.3, 'accent', { w: 4 });
  pop(1080, 400, '同一份：不能各改各的', T('g20', '不能') - 0.2, T('g21') - 0.1, 'red');
  // 事件列表（右侧，一行一件事）
  const row = (t, txt, cls, y) => { const e = tile(world, 1060, y, 740, 84, txt, '', cls); css(e, { padding: '18px 22px' }); show(e, t, { y: 10 }); return e; };
  const r1 = row(T('g21', '改了') - 0.3, 'Alice 的事务：改了它，还没提交', 'dk', 200);
  const unc = pop(840, 246, '未提交', T('g21', '还没提交') - 0.2, T('g27') - 0.1, 'dk');
  const r2 = row(T('g22', '也要改') - 0.3, 'Carol 的事务：也要改这份文档', 'dk', 298);
  to(r1, T('g22'), { autoAlpha: 0.55, duration: 0.4 });
  const r3 = row(T('g23', '排队') - 0.3, '排队等 Alice？', 'dk', 396);
  to(r2, T('g23'), { autoAlpha: 0.55, duration: 0.4 });
  pop(600, 640, '等 Alice 提交？', T('g23', '等 Alice') - 0.2, T('g24') - 0.1, 'dk');
  const strike = svg('line', { x1: 1090, y1: 438, x2: 1770, y2: 438, stroke: '#023430', 'stroke-width': 6, 'stroke-linecap': 'round' }, ov); draw(strike, T('g23', '没这么做') - 0.2, 0.5);
  to(r3, T('g23', '没这么做') + 0.3, { autoAlpha: 0.4, duration: 0.5 });
  glow(dA, T('g24', '同一份文档') - 0.3, null, { bg: '#FFE9E7', bd: '#DB3030' });
  const hit = pop(600, 640, 'WiredTiger：两人改的是同一份', T('g24', '同一份文档') - 0.3, T('g26') - 0.1, 'red');
  const r4 = row(T('g25', '写冲突') - 0.4, '写冲突：Carol 立刻收到错误', 'rd', 494); gloss(r4, '写冲突');
  to(wC, T('g25', 'Carol'), { backgroundColor: '#DB3030', borderColor: '#DB3030', duration: 0.3 });
  const r5 = row(T('g26', '标签') - 0.3, '错误的标签：整个事务可以重来', 'dk', 592);
  const lab = pop(600, 640, 'TransientTransactionError', T('g26', '重来') - 0.3, T('g27') - 0.1, 'dk'); css(lab, { fontFamily: '"Mono"', fontSize: '28px' });
  const r6 = row(T('g27', '成功了') - 0.4, 'Alice 提交后，Carol 重做整个事务：成功', 'sp', 690);
  to(wC, T('g27', '重做') - 0.2, { backgroundColor: '#023430', borderColor: '#023430', duration: 0.3 });
  glow(dA, T('g27', '提交以后'), null, { bg: '#C0FAE6', bd: '#00684A' });
  sfx('error', T('g25', '写冲突') - 0.4); sfx('chime', T('g27', '成功了') - 0.4);
  pop(600, 640, '先不排队', T('g28', '不排队') - 0.2, T('g29') - 0.1, 'dk');
  slotNote(world, 560, 840, '先不排队，撞上了再让一方重来：乐观并发', T('g28'), T('g29') - 0.1, 'g');
  slotNote(world, 560, 840, '按 MongoDB 的文档，多数读写都这样处理', T('g29'), T('g30') - 0.1);
  [r1, r2, r3, r4, r5].forEach((r, i) => to(r, T('g29') + i * 0.6, { autoAlpha: 0.25, duration: 0.5 }));
  const G3 = [wA, wC, dA, pA, pC2, r1, r2, r3, r4, r5, r6, strike];
  fadeOut(G3, T('g30') - 0.2);

  // 没开事务：服务端替 Carol 重试
  const wC2 = xl(world, 200, 200, 'Carol', 'dk'); show(wC2, T('g30'), { x: -20, y: 0 });
  const c1 = tile(world, 200, 300, 520, 150, 'Carol 没开事务', '只改这一份文档', 'dk'); show(c1, T('g30', '没开事务') - 0.3, { y: 12 });
  pop(200, 470, '只改 Alice 这一份', T('g30') + 1.4, T('g31') - 0.1, 'dk');
  const c2 = tile(world, 1200, 300, 520, 150, 'MongoDB 服务端', '替她一遍遍重试', 'sp');
  const noErr = pop(200, 480, '她看不到错误', T('g31', '看不到错误') - 0.3, null, 'on');
  show(c2, T('g31', '服务端') - 0.3, { y: 12 });
  const rt = arrow([[730, 375], [1190, 375]], T('g31', '服务端'));
  const cnt = tile(world, 560, 560, 800, 150, '写冲突重试 123 次 · 约 1.1 秒', '一次实测的数字（次数每次不同）', 'dk');
  show(cnt, T('g31', '一遍遍') - 0.3, { y: 12 });
  const aliceDone = pop(1200, 480, 'Alice 提交了', T('g32', '一秒后') - 0.2, null, 'on');
  const done = tile(world, 560, 740, 800, 96, 'Carol 的修改：成了', '', 'sp'); css(done, { padding: '18px 22px' });
  show(done, T('g32', '成了') - 0.5, { y: 10 }); sfx('chime', T('g32', '成了') - 0.5);
  fadeOut([wC2, c1, c2, noErr, rt, cnt, aliceDone, done], T('g36') - 0.1);
  const q = h('div', 'abs h2', world, 'mongod 自己被杀了，<br>还没写进文件的修改呢？'); px(q, 260, 400, 1400); css(q, { textAlign: 'center', whiteSpace: 'normal' });
  show(q, T('g36') + 0.1, { y: 16 });
  const qr = h('div', 'abs', world); px(qr, 560, 590, 800, 8); css(qr, { background: '#00ED64', transformOrigin: '0 50%' });
  fromTo(qr, T('g36') + 0.8, { scaleX: 0 }, { scaleX: 1, duration: 3.0, ease: 'power1.inOut' });
  const qs = pop(560, 640, '下一章：强制结束 mongod，看丢了什么', T('g36', '被杀了'), null, 'dk');
  pop(560, 740, '还没写进文件的修改', T('g36', '还没写进文件') - 0.3, null, 'red');

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
