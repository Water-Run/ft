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
  chrome(root, s, '07 事务与并发');

  // ══ 一、两种事务；单机不接受，要用副本集 ══
  const P1 = [];
  const doc = docCard(world, 720, 400, [['name', JS('Alice')], ['age', JN(42)]], { w: 480, fs: 40 }); P1.push(doc.c);
  const pr = person(world, 380, 410, '读', K.blued, 110), pw = person(world, 1380, 410, '改', K.forest, 110); P1.push(pr, pw);
  show(doc.c, c0, { y: 12, d: 0.5 }); show(pr, T('g1', '读') - 0.3, { x: -20, y: 0, d: 0.45 }); show(pw, T('g1', '改') - 0.3, { x: 20, y: 0, d: 0.45 });
  const ar = link(ov, [[560, 470], [710, 470]], 'blue', { w: 4, arrow: true }), aw = link(ov, [[1380, 470], [1210, 470]], 'accent', { w: 4, arrow: true }); P1.push(ar, aw);
  arrowIn(ar, T('g1', '读') - 0.1, 0.4); arrowIn(aw, T('g1', '改') - 0.1, 0.4);
  to(doc.c, T('g1', '同一份') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); to(doc.c, T('g1', '同时') - 0.1, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.4 });
  P1.push(res(world, 340, 590, '在读', 'read', T('g1', '读') - 0.1, { fs: 34, lh: 60, out: T('g2') - 0.2 }), res(world, 1340, 590, '在改', 'new', T('g1', '改') - 0.1, { fs: 34, lh: 60, out: T('g2') - 0.2 }));
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
    ['session.<span style="color:#1254B7">startTransaction</span>()', '  users.findOne(…)   <span style="color:#5C6C75">// 读</span>', '  users.updateOne(…) <span style="color:#5C6C75">// 改</span>', 'session.<span style="color:#1254B7">commitTransaction</span>()'].map((x, i) => `<div class="cl" style="position:absolute;left:26px;top:${78 + i * 43}px;font:500 27px Mono;color:${K.ink};white-space:pre">${x}</div>`).join('');
  show(apT, T('g3', '应用') - 0.3, { y: 14, d: 0.5 });
  const cls = [...apT.querySelectorAll('.cl')]; set(cls, s.start, { autoAlpha: 0 });
  to(apT, T('g3', '应用') - 0.2, { backgroundColor: K.mint2, duration: 0.4 }); to(apT, T('g4', '加上') - 0.2, { backgroundColor: '#FFFFFF', duration: 0.4 });
  [cls[0], cls[3]].forEach((e, k) => { css(e, { borderRadius: '8px', padding: '0 10px', marginLeft: '-10px' }); solid(e, (k ? T('g3', '包在') : T('g3', '开事务')) + 0.1, 'new'); to([...e.querySelectorAll('span')], (k ? T('g3', '包在') : T('g3', '开事务')) + 0.1, { color: K.spring, duration: 0.35 }); });
  [T('g3', '开事务'), T('g3', '读写'), T('g3', '读写') + 0.3, T('g3', '包在')].forEach((t, i) => show(cls[i], t - 0.25, { x: -12, y: 0, d: 0.35 }));
  const v4 = res(world, 1400, 244, '2018 年', 'ink', T('g4', '2018') - 0.3, { fs: 34, lh: 60 }); P1.push(v4); to(v4, T('g4', '4.0') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); textAt(v4, [[0, '2018 年'], [T('g4', '4.0') - 0.2, '2018 年 · 4.0 版']]);
  textAt(v4, [[0, '2018'], [T('g4', '4.0') - 0.2, 'MongoDB 4.0 · 2018']]);
  // 单机的 mongod 不接受（G00 的真实报错）
  const err = term(world, 150, 600, 1630, 150, 'mongosh · 单机的 mongod', { fs: 28, lh: 42 }); P1.push(err.c);
  show(err.c, T('g5', '单机') - 0.4, { y: 14, d: 0.5 });
  const errL = err.out(T('g5', '不接受') - 0.3, '<span style="color:#FFFFFF">MongoServerError: Transaction numbers are only allowed on a replica set member or mongos</span>'); css(errL, { background: K.red, borderRadius: '6px', padding: '0 10px' });
  // 副本集：几台 mongod 维护同一份数据；这里只用一台
  const RS = [0, 1, 2].map((i) => { const e = h('div', 'abs', world); px(e, 560 + i * 300, 790, 260, 120); css(e, { background: i === 0 ? K.ink : K.gd1, border: '3px solid ' + (i === 0 ? K.ink : K.gd1), borderRadius: '12px' });
    e.innerHTML = `<div style="position:absolute;left:18px;top:14px;font:700 28px Mono;color:#FFFFFF">mongod</div><div style="position:absolute;left:18px;top:62px;font:500 24px 'Sans SC';color:#E8EDEB">同一份数据</div>`; P1.push(e); return e; });
  RS.forEach((e, i) => show(e, T('g5a', '几台') - 0.3 + i * 0.15, { y: 12, d: 0.45 }));
  const glR = gl(world, 150, 800, '副本集', '几台 mongod<br>维护同一份数据'); P1.push(glR);
  show(glR, T('g5', '副本集') - 0.2, { x: 14, y: 0, d: 0.45 });
  fadeOut([RS[1], RS[2]], T('g5a', '一台') - 0.3, 0.45);
  const rs0 = tg(world, 1150, 830, '本章：单节点副本集 <span style="font-family:Mono">rs0</span>', 'g'); css(rs0, { fontSize: '30px', lineHeight: '56px', color: '#FFFFFF', background: K.forest, borderRadius: '10px', padding: '0 18px' }); P1.push(rs0);
  show(rs0, T('g5a', '这里') - 0.1, { x: 14, y: 0, d: 0.45 });
  to(RS[0], Tend('g5a') + 0.6, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.4 });
  const tB = T('g6') - 0.4;
  fadeOut(P1, tB, 0.5);

  // ══ 二、快照读：三条泳道 + 时间轴（G01 G07） ══
  const LX0 = 360, LX1 = 1330, LANES = [['Bob', K.blued, 290], ['Alice', K.forest, 470], ['事务外', K.gd2, 650]];
  const lanes = LANES.map(([n, c, y]) => {
    const l = h('div', 'abs', world); px(l, LX0, y + 28, LX1 - LX0, 8); css(l, { background: c, opacity: 0.35, borderRadius: '4px', transformOrigin: '0 50%' });
    const t = tg(world, 140, y + 6, n, 'b'); css(t, { fontSize: '32px', lineHeight: '56px', color: '#FFFFFF', background: c, borderRadius: '10px', padding: '0 16px' });
    return { l, t, y };
  });
  // 泳道跟着旁白出现：先是过生日的 Alice，再是旁边的 Bob；「事务外」等到 g10 才用上
  const tLane = [T('g6', 'Bob') - 0.3, T('g6', 'Alice') - 0.2, T('g10') - 0.2];
  lanes.forEach((o, i) => { fromTo(o.l, tLane[i], { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(o.t, tLane[i], { x: -14, y: 0, d: 0.45 }); });
  // 事件：在泳道上一个个出现（x 是时间先后）
  const ev = (lane, x, html, t, cls = '') => {
    const d = h('div', 'abs', world); px(d, x - 9, lanes[lane].y + 22, 18, 18); css(d, { borderRadius: '50%', background: LANES[lane][1] });
    const b = h('div', 'abs', world, html); px(b, x + 12, lanes[lane].y - 34); css(b, { font: '700 30px/50px "Sans SC"', color: '#FFFFFF', background: LANES[lane][1], borderRadius: '8px', padding: '0 12px', whiteSpace: 'nowrap' });
    show(d, t, { y: 0, s: 0.3, d: 0.35 }); show(b, t + 0.05, { y: 8, d: 0.4 });
    return [d, b];
  };
  // Bob 的事务（一段底色）
  const span = h('div', 'abs', world); px(span, 420, 300 + 12, 660, 54); css(span, { background: '#9CCBFF', border: '2px solid ' + K.blue, borderRadius: '10px', transformOrigin: '0 50%' });
  fromTo(span, T('g7', '开了') - 0.2, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: Math.max(1, T('g11', '结束') - T('g7', '开了')), ease: 'none' });
  const E = [];
  E.push(...ev(0, 440, '开始事务 · 读：42', T('g7', '开了') - 0.2));
  E.push(...ev(1, 640, '改成 43 · 提交', T('g8', 'Alice') - 0.1));
  E.push(...ev(0, 820, '再读：<span style="font-family:Inter">42</span>', T('g9', '同一个') - 0.2)); to(span, T('g9', '同一个') - 0.2, { backgroundColor: K.blue, duration: 0.35 }); to(lanes[0].l, T('g9') - 0.1, { opacity: 0.9, duration: 0.4 });
  E.push(...ev(2, 940, '读：43', T('g10', '事务外')));
  E.push(...ev(0, 1080, '结束事务', T('g11', '结束') - 0.3));
  E.push(...ev(0, 1250, '读：43', T('g11', '才是') - 0.3));
  to(span, T('g11') - 0.1, { opacity: 0.35, duration: 0.45 }); to(span, T('g12', '一开始') - 0.2, { opacity: 1, duration: 0.45 });
  // 快照：在 Bob 开始的那一刻，一道竖线穿过三条泳道
  const snap = h('div', 'abs', world); px(snap, 438, 250, 4, 450); css(snap, { background: K.blue, transformOrigin: '50% 0' });
  fromTo(snap, T('g12', '快照') - 0.3, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'power2.out' });
  to(E[3], T('g15', '完成') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  const later = E.slice(2); to(later, T('g12', '一开始') - 0.2, { opacity: 0.3, duration: 0.45 }); to(later, T('g15') - 0.2, { opacity: 1, duration: 0.45 });
  res(world, 1440, 250, 'Alice：age 42 → 43', 'new', T('g6', '过生日') - 0.2, { fs: 28, lh: 54, out: T('g7', '42') - 0.5 });
  res(world, 1440, 322, '旁边：Bob 在读', 'read', T('g6', 'Bob') - 0.2, { fs: 28, lh: 54, out: T('g7', '42') - 0.5 });
  const READS = [['Bob 读：42', 'read', T('g7', '42')], ['Bob 再读：还是 42', 'read', T('g9', '再读') + 0.2], ['事务外：已经是 43', K.gd1, T('g10', '已经') - 0.1], ['Bob 之后：才是 43', 'read', T('g11', '43')]];
  const cmt = res(world, 1440, 250 + 4 * 72, 'Alice 提交：43', 'new', T('g8', '改成') - 0.2, { fs: 28, lh: 54, out: T('g12', '快照') - 0.6 });
  const rds = READS.map(([txt, kind, t], k) => res(world, 1440, 250 + k * 72, txt, kind, t - 0.2, { fs: 28, lh: 54, out: T('g12', '快照') - 0.6 }));
  const snapT = tg(world, 380, 712, '快照', 'b'); css(snapT, { color: '#FFFFFF', background: K.blue, borderRadius: '10px', padding: '0 16px', lineHeight: '52px', fontSize: '30px' }); show(snapT, T('g12', '快照') - 0.1, { y: 8, d: 0.4 });
  const glS = gl(world, 150, 770, '快照', '事务开始那一刻：哪些修改已经提交，哪些还没有');
  show(glS, T('g12', '快照') - 0.25, { y: 10, d: 0.45 });
  // 右边：Alice 那一项的更新链；Bob 顺着往回找，43 在快照之后提交，跳过；读到 42
  const chT = tg(world, 1440, 250, 'Alice 那一项', 'b'); css(chT, { fontSize: '30px' });
  const c43 = h('div', 'abs', world, '43'); px(c43, 1470, 310, 280, 80); css(c43, { background: K.spring, border: '2px solid ' + K.forest, borderRadius: '12px', font: '800 40px/76px "Mono"', textAlign: 'center' });
  const c42 = h('div', 'abs', world, '42'); px(c42, 1470, 470, 280, 80); css(c42, { background: K.forest, border: '2px solid ' + K.forest, borderRadius: '12px', font: '800 40px/76px "Mono"', textAlign: 'center', color: '#FFFFFF' });
  const c43t = tg(world, 1470, 396, '快照之后才提交', 'm'); css(c43t, { fontSize: '23px', lineHeight: '38px', color: '#FFFFFF', background: K.gd1, borderRadius: '8px', padding: '0 10px' });
  const chA = link(ov, [[1730, 392], [1730, 466]], 'ink', { w: 3, arrow: true });
  const chBg = h('div', 'abs', world); px(chBg, 1452, 296, 316, 268); css(chBg, { background: '#9CCBFF', borderRadius: '14px' }); world.insertBefore(chBg, c43);
  show(chBg, T('g14', '更新链') - 0.2, { y: 0, s: 1.02, d: 0.4 }); fadeOut(chBg, T('g19a') - 0.3, 0.5);
  show([chT, c42], T('g13', '哪些') - 0.2, { y: 12, d: 0.45 }); show(c43, T('g13', '还没有') - 0.3, { y: 12, d: 0.45 }); arrowIn(chA, T('g14', '更新链') - 0.3, 0.4);
  show(c43t, T('g13', '还没有') - 0.1, { y: 6, d: 0.4 });
  to(c43t, T('g14', '之后') - 0.2, { backgroundColor: K.blue, duration: 0.35 });
  to(c43, T('g14', '43') - 0.2, { backgroundColor: K.gl1, borderColor: K.gb, color: K.gd2, duration: 0.35 }); to(c43, T('g14', '跳过') - 0.2, { opacity: 0.15, duration: 0.4 });
  to(span, T('g15') - 0.1, { backgroundColor: K.blue, duration: 0.4 });   // Bob 的事务还开着
  to(c42, T('g14b', '42') - 0.4, { backgroundColor: K.blue, borderColor: K.blue, color: '#FFFFFF', duration: 0.4 });
  const bob = res(world, 1080, 346, 'Bob 顺着链往回找', 'read', null, { fs: 28, lh: 52 });
  to(bob, T('g14', '往回') - 0.2, { top: '420px', duration: 0.9, ease: 'power2.inOut' });
  res(world, 1470, 570, 'Bob 读到 42', 'read', T('g14b', '读到') - 0.2, { fs: 30, lh: 56, out: T('g19a') - 0.3 });
  show(bob, T('g14', '读') - 0.1, { x: -14, y: 0, d: 0.4 });
  // Alice 不用等 Bob：她的提交落在 Bob 的事务中间
  const noWait = tg(world, 560, 556, '不用等 Bob', 'g'); css(noWait, { fontSize: '34px', lineHeight: '62px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 22px' });
  show(noWait, T('g15', '照样') - 0.2, { y: 8, d: 0.4 });
  const tC = T('g19a') - 0.3;
  fadeOut([...E, span, snap, snapT, glS, chT, c43, c42, c43t, chA, bob, noWait, ...lanes.map((o) => o.l), ...lanes.map((o) => o.t)], tC, 0.5);

  // ══ 三、写冲突：两个事务改同一份（G04 G08 G06） ══
  const L2 = [['Alice', K.forest, 330], ['Carol', K.gd2, 520]];
  const lanes2 = L2.map(([n, c, y]) => {
    const l = h('div', 'abs', world); px(l, LX0, y + 28, 1060, 8); css(l, { background: c, opacity: 0.3, borderRadius: '4px', transformOrigin: '0 50%' });
    const t = tg(world, 140, y + 6, n, 'b'); css(t, { fontSize: '32px', lineHeight: '56px', color: '#FFFFFF', background: c, borderRadius: '10px', padding: '0 16px' });
    return { l, t, y };
  });
  to(lanes2[1].l, T('g22', 'Carol') - 0.2, { opacity: 0.9, duration: 0.4 });
  lanes2.forEach((o, i) => { fromTo(o.l, tC + 0.4 + i * 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(o.t, tC + 0.4 + i * 0.1, { x: -14, y: 0, d: 0.45 }); });
  const same = h('div', 'abs', world, '同一份文档：<span style="font-family:Mono">{ name: "Alice" }</span>'); px(same, 660, 244); css(same, { font: '700 30px/56px "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '0 18px' });
  show(same, T('g19a', '同一份') - 0.2, { y: 10, d: 0.45 }); fadeOut(same, T('g24') - 0.2, 0.4);
  const carolSub = tg(world, 150, 568, '管理员', ''); css(carolSub, { fontSize: '30px', lineHeight: '52px', color: '#FFFFFF', background: K.gd1, borderRadius: '8px', padding: '0 12px', top: '578px' }); show(carolSub, T('g22', '管理员') - 0.2, { y: 6, d: 0.4 });
  // Alice：事务里改了，还没提交（一段虚线底色）
  const aSpan = h('div', 'abs', world); px(aSpan, 420, 342, 520, 54); css(aSpan, { border: '3px solid ' + K.forest, background: K.forest, borderRadius: '10px', transformOrigin: '0 50%' });
  fromTo(aSpan, T('g21', '改了') - 0.3, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.8, ease: 'power2.out' });
  const aT1 = tg(world, 436, 352, '改 age · 还没提交', 'g'); css(aT1, { fontSize: '26px', color: '#FFFFFF' }); show(aT1, T('g21', '没提交') - 0.4, { y: 6, d: 0.4 }); to(aSpan, T('g21', '没提交') - 0.2, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 }); to(aT1, T('g21', '没提交') - 0.2, { color: K.ink, duration: 0.35 });
  // Carol：也要改这份
  const cSpan = h('div', 'abs', world); px(cSpan, 520, 532, 340, 54); css(cSpan, { border: '3px solid ' + K.gd2, background: K.gd2, borderRadius: '10px' });
  show(cSpan, T('g22', '另一个') - 0.2, { x: -20, y: 0, d: 0.4 });
  const cT1 = tg(world, 654, 542, '改 age', 'b'); css(cT1, { fontSize: '26px', color: '#FFFFFF' }); show(cT1, T('g22', '也要') - 0.1, { y: 6, d: 0.4 });
  res(world, 980, 614, '两个事务，同一份文档', 'ink', T('g22', '这份') - 0.1, { fs: 28, lh: 54, out: T('g24') - 0.2 });
  // 可以排队等 Alice 提交（虚的一段）——MongoDB 没这么做
  const queue = h('div', 'abs', world); px(queue, 790, 524, 300, 70); css(queue, { border: '3px solid ' + K.yeld, background: K.yeld, borderRadius: '10px', font: '700 30px/64px "Sans SC"', color: '#FFFFFF', textAlign: 'center' });
  to(queue, T('g23', '没这么做') - 0.3, { backgroundColor: K.red, borderColor: K.red, duration: 0.35 });
  res(world, 1060, 526, 'MongoDB 没这么做', 'del', T('g23', 'MongoDB') - 0.2, { fs: 34, lh: 62, pad: 24, out: T('g24') - 0.1 }); queue.textContent = '排队等 Alice';
  show(queue, T('g23', 'Carol') - 0.2, { x: -14, y: 0, d: 0.4 });
  const qx = h('div', 'abs', world, ico('x', 64, K.gd2, 4)); px(qx, 858, 527, 64, 64); show(qx, T('g23', '没这么做') - 0.3, { y: 0, s: 1.4, d: 0.35 });
  fadeOut([queue, qx], T('g24') - 0.1, 0.35);
  // 一发现是同一份：Carol 立刻收到写冲突（真实回显）
  const bolt = h('div', 'abs', world, ico('bolt', 64, K.red, 3)); px(bolt, 740, 450, 64, 64);
  show(bolt, T('g24', '同一份') - 0.3, { y: -10, s: 0.6, d: 0.35 }); sfx('error', T('g24', '同一份') - 0.1, { g: 0.6 });
  to(cSpan, T('g24', '同一份') - 0.2, { borderColor: K.red, backgroundColor: K.red, duration: 0.35 });
  res(world, 830, 444, '撞上了：同一份文档', 'del', T('g24', '同一份') - 0.1, { fs: 28, lh: 54, out: T('g26') - 0.2 });
  const ce = term(world, 150, 650, 1270, 150, 'mongosh · Carol · 摘录，键名译成中文', { fs: 26, lh: 40 });
  show(ce.c, T('g25', '收到') - 0.4, { y: 12, d: 0.45 });
  const ceL = ce.out(T('g25', '错误') - 0.2, '{ <span class="k" style="color:#FFFFFF">\'Carol 的错误\'</span>: <span class="s" style="color:#FFFFFF">\'WriteConflict\'</span>, <span class="k" style="color:#FFFFFF">\'错误标签\'</span>: [ <span class="s tl" style="color:#FFFFFF">\'TransientTransactionError\'</span> ] }');
  css(ceL, { background: K.red, color: '#FFFFFF', borderRadius: '6px', padding: '0 10px' });
  const glW = gl(world, 1460, 330, '写冲突', '两个事务改同一份文档，<br>后来的那个立刻出错', { cls: 'r' });
  show(glW, T('g25', '写冲突') - 0.3, { x: 14, y: 0, d: 0.45 });
  to(ce.c.querySelector('.tl') || ce.body, T('g26', '标签') - 0.2, { backgroundColor: K.yell, color: K.ink, duration: 0.35 });
  const lab = tg(world, 174, 812, '这个标签：整个事务可以重来', 'b'); css(lab, { fontSize: '28px', lineHeight: '52px', color: '#FFFFFF', background: K.yeld, borderRadius: '10px', padding: '0 16px' }); show(lab, T('g26', '整个') - 0.3, { y: 8, d: 0.4 });
  // Alice 提交（44）；Carol 把整个事务重做一遍（45），成功（G04）
  const aC = h('div', 'abs', world); px(aC, 950, 342, 200, 54); css(aC, { background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/50px "Sans SC"', textAlign: 'center', color: '#FFFFFF' }); aC.textContent = '提交';
  show(aC, T('g27', '提交') - 0.3, { x: -14, y: 0, d: 0.4 });
  to(aSpan, T('g27', '提交') - 0.2, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to(aT1, T('g27', '提交') - 0.2, { color: K.ink, duration: 0.35 });
  to(aSpan, T('g27', '提交') - 0.2, { borderStyle: 'solid', duration: 0.3 });
  const cR = h('div', 'abs', world); px(cR, 1170, 532, 250, 54); css(cR, { background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/50px "Sans SC"', textAlign: 'center', color: '#FFFFFF' }); cR.textContent = '重做事务'; textAt(cR, [[0, '重做事务'], [T('g27', '成功') - 0.2, '重做事务 · 成功']]); to(cR, T('g27', '成功') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 });
  show(cR, T('g27', '重做') - 0.2, { x: -14, y: 0, d: 0.4 }); to(cSpan, T('g27', '重做') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  const ok = h('div', 'abs', world, ico('check', 50, K.forest, 4)); px(ok, 1430, 534, 50, 50); show(ok, T('g27', '成功') - 0.2, { y: 0, s: 1.3, d: 0.35 });
  // 乐观并发：先不排队，撞上了再让一方重来
  fadeOut([ce.c, lab], T('g28') - 0.3, 0.4);
  const opt = h('div', 'abs', world); px(opt, 150, 700, 1650); css(opt, { font: '700 44px "Sans SC"', color: K.ink });
  const optN = h('div', 'abs', opt, '乐观并发'); css(optN, { left: 0, top: '-8px', color: '#FFFFFF', background: K.forest, borderRadius: '12px', padding: '0 18px', lineHeight: '68px' });
  const optD = h('div', 'abs', opt, '先不排队，'); css(optD, { left: '236px', top: '0px', fontWeight: 600, fontSize: '32px', lineHeight: '58px', color: '#FFFFFF', background: K.gd1, borderRadius: '10px', padding: '0 14px', whiteSpace: 'nowrap' });
  const optD2 = h('div', 'abs', opt, '撞上了再让一方重来'); css(optD2, { left: '452px', top: '0px', fontWeight: 600, fontSize: '32px', lineHeight: '58px', color: '#FFFFFF', background: K.gd2, borderRadius: '10px', padding: '0 14px', whiteSpace: 'nowrap' });
  to([optD, optD2], T('g28', '这叫') - 0.2, { backgroundColor: K.mint2, color: K.forest, duration: 0.35 });
  show(optD, T('g28', '先不') - 0.25, { y: 10, d: 0.45 }); show(optD2, T('g28', '撞上') - 0.25, { y: 10, d: 0.45 }); show(optN, T('g28', '乐观') - 0.4, { y: 12, d: 0.5 });
  // 章末：mongod 突然被杀
  const tK = T('g36', '被杀') - 0.3;
  fadeOut(opt, T('g36', 'mongo') - 0.2, 0.45);
  const kill = h('div', 'abs', world); px(kill, 760, 800, 400, 110); css(kill, { background: K.ink, border: '3px solid ' + K.ink, borderRadius: '12px' });
  kill.innerHTML = `<div style="position:absolute;left:24px;top:28px;font:700 40px Mono;color:#FFFFFF">mongod</div>`;
  show(kill, T('g36') - 0.1, { y: 12, d: 0.45 });
  const kb = h('div', 'abs', kill, ico('bolt', 60, '#FFFFFF', 3)); css(kb, { right: '24px', top: '24px' });
  show(kb, tK, { y: -10, s: 0.6, d: 0.35 });
  to(kill, tK + 0.2, { backgroundColor: K.red, borderColor: K.red, duration: 0.4 });
});
