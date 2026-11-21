// 第 08 章 事务与并发（第 4 轮重做）。
// 一、两种事务：第 03 章那个由 MongoDB 替一次写入开；应用也能自己开（4.0 起）。单机 mongod 拒绝（真实报错），要用副本集；本章只用一台。
// 二、快照读：三条泳道（Bob、Alice、事务外），一条时间轴；Bob 的事务一开始就拍下快照，读的时候顺着更新链跳过快照之后才提交的 43，读到 42；Alice 不用等。
// 三、写冲突：Alice 的事务改了还没提交，Carol 也改同一份 → 不排队，直接 WriteConflict（TransientTransactionError）→ Alice 提交后 Carol 整个重来，成功（乐观并发）。
// 事实：H04（第 03 章的内部事务）、I07 V02（应用的事务、4.0、2018）、G00 G00b（单机拒绝、副本集）、G01 G07 D01（快照读 42/43、更新链）、
//       G04 G08 G06（WriteConflict、TransientTransactionError、44 与 45、乐观并发）；08 回显。
scene('concur', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '08 事务与并发');

  // ══ 一、两种事务；单机不接受，要用副本集 ══
  const P1 = [];
  const doc = docCard(world, 720, 400, [['name', JS('Alice')], ['age', JN(42)]], { w: 480, fs: 40 }); P1.push(doc.c);
  const pr = person(world, 380, 410, '读', K.blued, 110), pw = person(world, 1380, 410, '改', K.forest, 110); P1.push(pr, pw);
  show(doc.c, c0, { y: 12, d: 0.5 }); show(pr, T('g1', '读') - 0.3, { x: -20, y: 0, d: 0.45 }); show(pw, T('g1', '改') - 0.3, { x: 20, y: 0, d: 0.45 });
  const ar = link(ov, [[560, 470], [710, 470]], 'blue', { w: 4, arrow: true }), aw = link(ov, [[1380, 470], [1210, 470]], 'accent', { w: 4, arrow: true }); P1.push(ar, aw);
  arrowIn(ar, T('g1', '读') - 0.1, 0.4); arrowIn(aw, T('g1', '改') - 0.1, 0.4);
  const tA = T('g2') - 0.2;
  fadeOut([pr, pw, ar, aw], tA, 0.4);
  tl.to(doc.c, { autoAlpha: 0, duration: 0.4 }, tA);
  // 左：MongoDB 替一次写入开的事务（第 03 章：三棵树各写一项）
  const inT = h('div', 'panel', world); px(inT, 150, 230, 760, 330); P1.push(inT);
  inT.innerHTML = `<div style="position:absolute;left:26px;top:20px;font:700 32px 'Sans SC';color:${K.ink}">MongoDB 替一次写入开的</div><div style="position:absolute;left:26px;top:70px;font:500 26px 'Sans SC';color:${K.gd1}">第 03 章：Dave 注册，三棵树各写一项</div>` +
    `<div style="position:absolute;left:26px;top:130px;width:700px;height:150px;border:3px dashed ${K.blue};border-radius:12px"></div>` +
    ['集合树', '_id 索引', '姓名索引'].map((n, i) => `<div style="position:absolute;left:${50 + i * 226}px;top:170px;width:200px;height:70px;background:${K.mint};border:2px solid ${K.g1};border-radius:10px;font:700 26px/66px 'Sans SC';text-align:center;color:${K.forest}">${n}</div>`).join('');
  show(inT, T('g2', '第三章') - 0.3, { y: 14, d: 0.5 });
  const inB = [...inT.children].slice(-3); inB.forEach((e, i) => to(e, T('g2', '替') - 0.2 + i * 0.15, { color: K.ink, backgroundColor: K.spring, duration: 0.35 }));
  // 右：应用自己开的事务，把几份文档的读写包在一起（4.0 · 2018）
  const apT = h('div', 'panel', world); px(apT, 980, 230, 800, 330); css(apT, { borderColor: K.g1, borderWidth: '3px' }); P1.push(apT);
  apT.innerHTML = `<div style="position:absolute;left:26px;top:20px;font:700 32px 'Sans SC';color:${K.forest}">应用自己开的</div>` +
    `<div style="position:absolute;left:26px;top:78px;font:500 27px/1.6 Mono;color:${K.ink};white-space:pre">session.<span style="color:#1254B7">startTransaction</span>()\n  users.findOne(…)   <span style="color:#5C6C75">// 读</span>\n  users.updateOne(…) <span style="color:#5C6C75">// 改</span>\nsession.<span style="color:#1254B7">commitTransaction</span>()</div>`;
  show(apT, T('g3', '应用') - 0.3, { y: 14, d: 0.5 });
  pt(world, 996, 300, 760, 196, T('g3', '几份') - 0.2, T('g4') - 0.1);
  pt(world, 988, 238, 784, 60, T('g4', '加上') - 0.3, T('g5') + 0.2);
  const v4 = chip(world, 1500, 248, 'MongoDB 4.0 · 2018', 'blue'); P1.push(v4); show(v4, T('g4', '2018') - 0.3, { y: 8, d: 0.45 });
  // 单机的 mongod 不接受（G00 的真实报错）
  const err = term(world, 150, 600, 1630, 150, 'mongosh · 单机的 mongod', { fs: 28, lh: 42 }); P1.push(err.c);
  show(err.c, T('g5', '单机') - 0.4, { y: 14, d: 0.5 });
  err.out(T('g5', '不接受') - 0.3, '<span style="color:#970606">MongoServerError: Transaction numbers are only allowed on a replica set member or mongos</span>');
  // 副本集：几台 mongod 维护同一份数据；这里只用一台
  const RS = [0, 1, 2].map((i) => { const e = h('div', 'abs', world); px(e, 560 + i * 300, 790, 260, 120); css(e, { background: '#fff', border: (i === 0 ? '3px solid ' + K.g1 : '3px dashed ' + K.gb), borderRadius: '12px' });
    e.innerHTML = `<div style="position:absolute;left:18px;top:14px;font:700 28px Mono;color:${i === 0 ? K.forest : K.gb}">mongod</div><div style="position:absolute;left:18px;top:62px;font:500 24px 'Sans SC';color:${K.gd1}">同一份数据</div>`; P1.push(e); return e; });
  RS.forEach((e, i) => show(e, T('g5a', '几台') - 0.3 + i * 0.15, { y: 12, d: 0.45 }));
  const glR = gl(world, 150, 800, '副本集', '几台 mongod<br>维护同一份数据'); P1.push(glR);
  show(glR, T('g5', '副本集') - 0.2, { x: 14, y: 0, d: 0.45 });
  fadeOut([RS[1], RS[2]], T('g5a', '一台') - 0.3, 0.45);
  const rs0 = tg(world, 1150, 830, '本章：单节点副本集 <span style="font-family:Mono">rs0</span>', 'g'); css(rs0, { fontSize: '30px' }); P1.push(rs0);
  show(rs0, T('g5a', '一台') - 0.1, { x: 14, y: 0, d: 0.45 });
  pt(world, 552, 782, 276, 136, Tend('g5a') + 0.1, T('g6') - 0.45);
  const tB = T('g6') - 0.4;
  fadeOut(P1, tB, 0.5);

  // ══ 二、快照读：三条泳道 + 时间轴（G01 G07） ══
  const LX0 = 360, LX1 = 1330, LANES = [['Bob', K.blued, 290], ['Alice', K.forest, 450], ['事务外', K.gd2, 610]];
  const lanes = LANES.map(([n, c, y]) => {
    const l = h('div', 'abs', world); px(l, LX0, y + 30, LX1 - LX0, 3); css(l, { background: K.gl1, transformOrigin: '0 50%' });
    const t = tg(world, 150, y + 10, n, 'b'); css(t, { fontSize: '34px', color: c });
    return { l, t, y };
  });
  lanes.forEach((o, i) => { fromTo(o.l, tB + 0.3 + i * 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(o.t, tB + 0.3 + i * 0.1, { x: -14, y: 0, d: 0.45 }); });
  pt(world, 140, 436, 1210, 72, T('g6', '过生日') - 0.3, T('g7') - 0.1);
  // 事件：在泳道上一个个出现（x 是时间先后）
  const ev = (lane, x, html, t, cls = '') => {
    const d = h('div', 'abs', world); px(d, x - 9, lanes[lane].y + 22, 18, 18); css(d, { borderRadius: '50%', background: LANES[lane][1] });
    const b = h('div', 'abs', world, html); px(b, x + 12, lanes[lane].y - 34); css(b, { font: '700 26px "Sans SC"', color: LANES[lane][1], whiteSpace: 'nowrap' });
    show(d, t, { y: 0, s: 0.3, d: 0.35 }); show(b, t + 0.05, { y: 8, d: 0.4 });
    return [d, b];
  };
  // Bob 的事务（一段底色）
  const span = h('div', 'abs', world); px(span, 420, 300 + 12, 660, 54); css(span, { background: K.bluel, border: '2px solid ' + K.blue, borderRadius: '10px', transformOrigin: '0 50%' });
  fromTo(span, T('g7', '开了') - 0.2, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: Math.max(1, T('g11', '结束') - T('g7', '开了')), ease: 'none' });
  const E = [];
  E.push(...ev(0, 440, '开始事务 · 读：42', T('g7', '开了') - 0.2));
  E.push(...ev(1, 640, '改成 43 · 提交', T('g8', '改成') - 0.3));
  E.push(...ev(0, 820, '再读：<span style="font-family:Inter">42</span>', T('g9', '再读') - 0.3));
  E.push(...ev(2, 940, '读：43', T('g10', '读') - 0.3));
  E.push(...ev(0, 1080, '结束事务', T('g11', '结束') - 0.3));
  E.push(...ev(0, 1250, '读：43', T('g11', '才是') - 0.3));
  pt(world, 1180, 262, 220, 90, T('g11', '才是') + 0.2, T('g12', '开始') - 0.3, K.blue);
  // 快照：在 Bob 开始的那一刻，一道竖线穿过三条泳道
  const snap = h('div', 'abs', world); px(snap, 438, 250, 4, 410); css(snap, { background: K.blue, transformOrigin: '50% 0' });
  fromTo(snap, T('g12', '快照') - 0.3, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'power2.out' });
  const snapT = tg(world, 380, 676, '快照', 'b'); css(snapT, { color: K.blued, fontSize: '30px' }); show(snapT, T('g12', '快照') - 0.1, { y: 8, d: 0.4 });
  pt(world, 412, 262, 300, 110, T('g12', '开始') - 0.2, T('g12', '快照') - 0.2, K.blue);
  pt(world, 424, 242, 32, 426, T('g13', '那一刻') - 0.2, T('g13', '还没有') - 0.3, K.blue);
  pt(world, 600, 404, 300, 80, T('g13', '还没有') - 0.2, T('g14') - 0.1, K.red);
  const glS = gl(world, 150, 770, '快照', '事务开始那一刻：哪些修改已经提交，哪些还没有');
  show(glS, T('g12', '快照') - 0.25, { y: 10, d: 0.45 });
  // 右边：Alice 那一项的更新链；Bob 顺着往回找，43 在快照之后提交，跳过；读到 42
  const chT = tg(world, 1440, 250, 'Alice 那一项', 'b'); css(chT, { fontSize: '30px' });
  const c43 = h('div', 'abs', world, '43'); px(c43, 1470, 310, 280, 80); css(c43, { background: K.spring, border: '2px solid ' + K.forest, borderRadius: '12px', font: '800 40px/76px "Mono"', textAlign: 'center' });
  const c42 = h('div', 'abs', world, '42'); px(c42, 1470, 470, 280, 80); css(c42, { background: '#fff', border: '2px solid ' + K.gb, borderRadius: '12px', font: '800 40px/76px "Mono"', textAlign: 'center', color: K.gd2 });
  const c43t = tg(world, 1470, 396, '快照之后才提交', 'm'); css(c43t, { fontSize: '23px' });
  const chA = link(ov, [[1730, 392], [1730, 466]], 'ink', { w: 3, arrow: true });
  show([chT, c43, c42], T('g14', '更新链') - 0.5, { y: 12, d: 0.45 }); arrowIn(chA, T('g14', '更新链') - 0.3, 0.4);
  show(c43t, T('g14', '之后') - 0.3, { y: 6, d: 0.4 });
  to(c43, T('g14', '跳过') - 0.2, { opacity: 0.3, duration: 0.4 });
  to(c42, T('g14b', '42') - 0.4, { backgroundColor: K.bluel, borderColor: K.blue, color: K.blued, duration: 0.4 });
  const bob = h('div', 'abs', world, ico('person', 44, K.blued, 2.8)); px(bob, 1380, 486, 44, 44);
  show(bob, T('g14', '读') - 0.2, { x: -14, y: 0, d: 0.4 });
  // Alice 不用等 Bob：她的提交落在 Bob 的事务中间
  pt(world, 412, 304, 676, 70, T('g15', '开着') - 0.2, T('g15', '不用') - 0.4, K.blue);
  const noWait = tg(world, 560, 506, '不用等 Bob', 'g'); css(noWait, { fontSize: '30px' });
  show(noWait, T('g15', '不用') - 0.3, { y: 8, d: 0.4 });
  const tC = T('g19a') - 0.3;
  fadeOut([...E, span, snap, snapT, glS, chT, c43, c42, c43t, chA, bob, noWait, ...lanes.map((o) => o.l), ...lanes.map((o) => o.t)], tC, 0.5);

  // ══ 三、写冲突：两个事务改同一份（G04 G08 G06） ══
  const L2 = [['Alice', K.forest, 330], ['Carol', K.gd2, 520]];
  const lanes2 = L2.map(([n, c, y]) => {
    const l = h('div', 'abs', world); px(l, LX0, y + 30, 1060, 3); css(l, { background: K.gl1, transformOrigin: '0 50%' });
    const t = tg(world, 150, y + 10, n, 'b'); css(t, { fontSize: '34px', color: c });
    return { l, t, y };
  });
  lanes2.forEach((o, i) => { fromTo(o.l, tC + 0.4 + i * 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(o.t, tC + 0.4 + i * 0.1, { x: -14, y: 0, d: 0.45 }); });
  const same = h('div', 'abs', world, '同一份文档：<span style="font-family:Mono">{ name: "Alice" }</span>'); px(same, 660, 250); css(same, { font: '700 30px "Sans SC"', color: K.ink });
  show(same, T('g19a', '同一份') - 0.2, { y: 10, d: 0.45 }); fadeOut(same, T('g24') - 0.2, 0.4);
  const carolSub = tg(world, 150, 568, '管理员', ''); css(carolSub, { fontSize: '24px' }); show(carolSub, T('g22', '管理员') - 0.2, { y: 6, d: 0.4 });
  // Alice：事务里改了，还没提交（一段虚线底色）
  const aSpan = h('div', 'abs', world); px(aSpan, 420, 342, 520, 54); css(aSpan, { border: '3px dashed ' + K.g1, background: K.mint, borderRadius: '10px', transformOrigin: '0 50%' });
  fromTo(aSpan, T('g21', '改了') - 0.3, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.8, ease: 'power2.out' });
  const aT1 = tg(world, 436, 352, '改 age · 还没提交', 'g'); css(aT1, { fontSize: '26px' }); show(aT1, T('g21', '没提交') - 0.4, { y: 6, d: 0.4 });
  // Carol：也要改这份
  const cSpan = h('div', 'abs', world); px(cSpan, 640, 532, 140, 54); css(cSpan, { border: '3px solid ' + K.gd2, background: K.gl3, borderRadius: '10px' });
  show(cSpan, T('g22', '也要') - 0.3, { x: -20, y: 0, d: 0.4 });
  const cT1 = tg(world, 654, 542, '改 age', 'b'); css(cT1, { fontSize: '26px' }); show(cT1, T('g22', '也要') - 0.1, { y: 6, d: 0.4 });
  // 可以排队等 Alice 提交（虚的一段）——MongoDB 没这么做
  const queue = h('div', 'abs', world); px(queue, 790, 528, 200, 62); css(queue, { border: '3px dashed ' + K.gb, borderRadius: '10px', font: '700 28px/56px "Sans SC"', color: K.gd1, textAlign: 'center' }); queue.textContent = '排队等…';
  show(queue, T('g23', '排队') - 0.2, { x: -14, y: 0, d: 0.4 });
  const qx = h('div', 'abs', world, ico('x', 64, K.gd2, 4)); px(qx, 858, 527, 64, 64); show(qx, T('g23', '没这么做') - 0.3, { y: 0, s: 1.4, d: 0.35 });
  fadeOut([queue, qx], T('g24') - 0.1, 0.35);
  // 一发现是同一份：Carol 立刻收到写冲突（真实回显）
  const bolt = h('div', 'abs', world, ico('bolt', 64, K.red, 3)); px(bolt, 740, 450, 64, 64);
  show(bolt, T('g24', '同一份') - 0.3, { y: -10, s: 0.6, d: 0.35 }); sfx('error', T('g24', '同一份') - 0.1, { g: 0.6 });
  to(cSpan, T('g25', '错误') - 0.3, { borderColor: K.red, backgroundColor: K.redl, duration: 0.35 });
  const ce = term(world, 150, 650, 1270, 150, 'mongosh · Carol', { fs: 26, lh: 40 });
  show(ce.c, T('g25', '收到') - 0.4, { y: 12, d: 0.45 });
  ce.out(T('g25', '错误') - 0.2, '{ <span class="k">\'Carol 的错误\'</span>: <span class="s" style="color:#970606">\'WriteConflict\'</span>, <span class="k">\'错误标签\'</span>: [ <span class="s tl">\'TransientTransactionError\'</span> ] }');
  const glW = gl(world, 1460, 330, '写冲突', '两个事务改同一份文档，<br>后来的那个立刻出错', { cls: 'r' });
  show(glW, T('g25', '写冲突') - 0.3, { x: 14, y: 0, d: 0.45 });
  to(ce.c.querySelector('.tl') || ce.body, T('g26', '标签') - 0.2, { backgroundColor: K.yell, duration: 0.35 });
  const lab = tg(world, 174, 812, '这个标签：整个事务可以重来', 'b'); css(lab, { fontSize: '28px', color: K.yeld }); show(lab, T('g26', '整个') - 0.3, { y: 8, d: 0.4 });
  // Alice 提交（44）；Carol 把整个事务重做一遍（45），成功（G04）
  const aC = h('div', 'abs', world); px(aC, 950, 342, 200, 54); css(aC, { background: K.spring, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/50px "Sans SC"', textAlign: 'center', color: K.ink }); aC.textContent = '提交';
  show(aC, T('g27', '提交') - 0.3, { x: -14, y: 0, d: 0.4 });
  to(aSpan, T('g27', '提交') - 0.2, { borderStyle: 'solid', duration: 0.3 });
  const cR = h('div', 'abs', world); px(cR, 1170, 532, 250, 54); css(cR, { background: K.spring, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/50px "Sans SC"', textAlign: 'center', color: K.ink }); cR.textContent = '重做事务 · 成功';
  show(cR, T('g27', '重做') - 0.2, { x: -14, y: 0, d: 0.4 });
  const ok = h('div', 'abs', world, ico('check', 50, K.forest, 4)); px(ok, 1430, 534, 50, 50); show(ok, T('g27', '成功') - 0.2, { y: 0, s: 1.3, d: 0.35 });
  pt(world, 632, 524, 156, 70, T('g28', '排队') - 0.2, T('g28', '重来') - 0.3, K.red);
  pt(world, 1162, 524, 266, 70, T('g28', '重来') - 0.2, T('g36') - 0.2);
  // 乐观并发：先不排队，撞上了再让一方重来
  fadeOut([ce.c, lab], T('g28') - 0.3, 0.4);
  const opt = h('div', 'abs', world); px(opt, 150, 700, 1650); css(opt, { font: '700 44px "Sans SC"', color: K.ink });
  opt.innerHTML = '乐观并发<span style="font-weight:500;font-size:34px;color:#3D4F58;margin-left:28px">先不排队，撞上了再让一方重来</span>';
  show(opt, T('g28', '乐观') - 0.4, { y: 12, d: 0.5 });
  // 章末：mongod 突然被杀
  const tK = T('g36', '被杀') - 0.3;
  const kill = h('div', 'abs', world); px(kill, 760, 800, 400, 110); css(kill, { background: '#fff', border: '3px solid ' + K.ink, borderRadius: '12px' });
  kill.innerHTML = `<div style="position:absolute;left:24px;top:28px;font:700 40px Mono;color:${K.ink}">mongod</div>`;
  show(kill, T('g36') - 0.1, { y: 12, d: 0.45 });
  const kb = h('div', 'abs', kill, ico('bolt', 60, K.red, 3)); css(kb, { right: '24px', top: '24px' });
  show(kb, tK, { y: -10, s: 0.6, d: 0.35 });
  beat(world, T('g1', '同时') - 0.1, 712, 392, 496, 260, 1.2);
  beat(world, T('g5', '不接受') + 0.2, 166, 670, 1600, 46, 1.0, K.red);
  beat(world, T('g22', 'Carol') - 0.1, 140, 520, 1300, 80, 1.0, K.gb);
  beat(world, T('g27', '提交') - 0.1, 140, 320, 1300, 80, 1.0);
  beat(world, T('g8', '提交') + 0.3, 140, 430, 1210, 80, 1.0);
  beat(world, T('g9', '同一个') - 0.1, 412, 304, 676, 70, 1.0, K.blue);
  beat(world, T('g13', '哪些') - 0.1, 140, 250, 600, 420, 1.0, K.blue);
  beat(world, T('g14', '之后') - 0.1, 1430, 240, 360, 330, 1.0, K.gb);
  beat(world, Tend('g21') + 0.1, 140, 320, 1300, 80, 1.0);
  beat(world, T('g5a', '维护') - 0.1, 552, 782, 876, 136, 1.2);
  beat(world, T('g6', '4096') - 0.1, 140, 270, 1210, 380, 1.2, K.gb);
  beat(world, T('g7', '看') - 0.1, 412, 250, 330, 110, 1.2, K.blue);
  beat(world, T('g8', 'Alice') - 0.1, 612, 410, 300, 100, 1.0);
  beat(world, T('g8', '提交') - 0.1, 612, 410, 300, 100, 1.2);
  beat(world, T('g10', '事务外') - 0.1, 140, 600, 1210, 70, 1.0, K.gb);
  beat(world, T('g10', '43') - 0.1, 900, 570, 300, 100, 1.2);
  beat(world, T('g14', '跳过') - 0.1, 1462, 302, 296, 96, 1.0, K.gb);
  beat(world, T('g14b', '读到') - 0.1, 1462, 462, 296, 96, 1.2, K.blue);
  beat(world, Tend('g19a') + 0.1, 650, 242, 700, 56, 1.2);
  beat(world, T('g21', '改了') + 0.3, 412, 334, 536, 70, 1.2);
  beat(world, T('g22', '也要') - 0.1, 140, 520, 1300, 80, 1.2, K.gb);
  beat(world, T('g23', 'Alice') - 0.1, 412, 334, 536, 70, 1.0);
  beat(world, T('g23', '没这么做') + 0.2, 782, 520, 216, 78, 1.0, K.red);
  beat(world, T('g24', '同一份') - 0.3, 140, 320, 1300, 290, 1.0, K.red);
  beat(world, Tend('g25') + 0.1, 142, 642, 1286, 166, 1.2, K.red);
  beat(world, T('g26', '整个') - 0.1, 166, 712, 1200, 44, 1.0, K.yeld);
  beat(world, T('g27', '一遍') - 0.1, 140, 520, 1300, 80, 1.0);
  beat(world, Tend('g28') + 0.1, 142, 692, 1300, 70, 1.2);
  to(kill, tK + 0.2, { backgroundColor: K.gl2, borderColor: K.gb, duration: 0.4 });
});
