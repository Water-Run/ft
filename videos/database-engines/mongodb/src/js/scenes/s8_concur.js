// 第 08 章 事务与并发：一、内部事务与应用自己开的事务（4.0 加入），单机 mongod 的真实报错，实验用单节点副本集；
// 二、Bob 的快照读：时间轴上三条泳道（Bob、Alice、事务外），播放头逐事件推进，Bob 的事务条随时间生长；快照那一刻竖线，读时顺着更新链跳过 43；
// 三、两人改同一份文档：Alice、Carol 两条泳道，Carol 立刻收到写冲突（不排队），Alice 提交后 Carol 整个事务重来。
// 回显抄自 research/lab/out_08_concurrency.txt。事实：G00 G00b G01 G04 G06 G07 G08 D01 H04 V02。
scene('concur', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '08 事务与并发');
  ch.sec(c0, '事务');

  // ── 一、同一份文档，有人读有人改；事务；副本集 ──
  const doc = tile(world, 760, 150, 400, 140, 'Alice 的资料', 'age 42', 'dk'); show(doc, c0, { y: 14 });
  const bobC = chip(world, 380, 196, 'Bob 在读', 'blue'), alC = chip(world, 1340, 196, 'Alice 在改', 'on');
  [bobC, alC].forEach((e) => css(e, { font: '700 30px "Inter", "Sans SC"' }));
  show(bobC, T('g1', '有人在读') - 0.2, { x: -20, y: 0 }); show(alC, T('g1', '有人在改') - 0.2, { x: 20, y: 0 });
  const a1 = link(ov, [[580, 220], [750, 220]], 'blue', { arrow: true, w: 3 }), a2 = link(ov, [[1330, 220], [1170, 220]], 'accent', { arrow: true, w: 3 });
  arrowIn(a1, T('g1', '有人在读'), 0.5); arrowIn(a2, T('g1', '有人在改'), 0.5);
  glow(doc, T('g1', '有人在改') + 0.1, T('g2') + 0.2, { bg: '#00ED64', bd: '#00ED64', rb: '#F9FBFA', rd: '#C1C7C6' });
  const ta = h('div', 'abs', world); px(ta, 140, 340, 760, 180); css(ta, { border: '4px dashed #00A35C', borderRadius: '16px', background: '#C0FAE6' });
  ta.innerHTML = '<div style="position:absolute;left:26px;top:20px;font:700 30px Inter,\'Sans SC\';color:#00684A">MongoDB 替一次写入开的事务</div><div style="position:absolute;left:26px;top:72px;font:500 26px/1.5 Inter,\'Sans SC\';color:#3D4F58">第 03 章 Dave 注册：集合树、两个索引，三处一起提交</div>';
  show(ta, T('g2') + 0.3, { y: 12 });
  ['集合树', '_id 索引', '姓名索引'].forEach((t, k) => { const c = chip(ta, 26 + k * 200, 120, t, 'sp'); css(c, { fontSize: '26px' }); show(c, T('g2', '一次写入') - 0.2 + k * 0.25, { y: 8 }); });
  const tx = term(world, 960, 340, 820, 250, 'mongosh · 应用自己开事务', { fs: 24 });
  show(tx.c, T('g3') + 0.1, { x: 20, y: 0 });
  tx.out(T('g3', '自己开事务'), 'const s = db.getMongo().startSession();\ns.startTransaction();');
  tx.out(T('g3', '包在一起') - 0.2, '<span class="c">//   …几份文档的读写…</span>\ns.commitTransaction();');
  const txb = h('div', 'abs'); px(txb, 14, 68, 790, 168); css(txb, { background: '#C0FAE6', borderRadius: '10px' }); tx.c.insertBefore(txb, tx.body);
  fromTo(txb, T('g3', '包在一起') - 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  const v4 = chip(world, 1440, 352, 'MongoDB 4.0 · 2018', 'blue'); show(v4, T('g4', '2018') - 0.3, { y: 8 }); sfx('pop', T('g4', '2018') - 0.3);
  to(ta, T('g4') + 0.2, { autoAlpha: 0.35, duration: 0.5 });
  const err = term(world, 140, 640, 1640, 170, 'mongosh · 单机的 mongod', { fs: 22 });
  show(err.c, T('g5') - 0.1, { y: 12 });
  err.cmd(T('g5') + 0.1, 'db.runCommand({ insert: "users", …, startTransaction: true, autocommit: false })');
  err.out(T('g5', '不接受') - 0.3, '<span class="r">MongoServerError: Transaction numbers are only allowed on a replica set member or mongos</span>');
  hide([doc, bobC, alC, a1, a2, ta, tx.c, v4], T('g5', '副本集') - 0.2, { y: -10, d: 0.4 });
  // 副本集：几台 mongod 维护同一份数据；这里只有一台
  const rsL = gloss(label(world, 140, 150, '副本集：几台 mongod，维护同一份数据', 'h2'), '副本集');
  show(rsL, T('g5', '副本集') - 0.2, { y: 8 });
  const sv = [0, 1, 2].map((i) => tile(world, 140 + i * 420, 240, 380, 140, 'mongod', i === 0 ? '实验用的这一台' : '另一台', i === 0 ? 'on' : 'dk'));
  show(sv, T('g5a', '几台') - 0.2, { y: 14, stagger: 0.15 });
  const rsl = [link(ov, [[520, 310], [560, 310]], 'dim', { w: 2, dashed: '6 6' }), link(ov, [[940, 310], [980, 310]], 'dim', { w: 2, dashed: '6 6' })];
  rsl.forEach((p) => arrowIn(p, T('g5a', '几台') + 0.3, 0.4));
  to([sv[1], sv[2], ...rsl], T('g5a', '只用了一台') - 0.3, { autoAlpha: 0.2, duration: 0.5 });
  const only = callout(world, 1420, 240, 'note', '只有一台，也能开事务', '单节点副本集');
  show(only, T('g5a') + 0.3, { x: 20, y: 0 });
  figs(world, 140, 830, 1640, [[T('g5') + 0.3, '图 8-1', '应用自己开的事务，单机的 mongod 不接受', '实测：out_08（MongoDB 9.0.8）']], T('g6') - 0.2);
  hide([...sv, ...rsl, rsL, only, err.c], T('g6') - 0.2, { y: -10, d: 0.4 });

  // ── 二、快照：时间轴上的五件事；右上是实验的原样输出 ──
  ch.sec(T('g6') - 0.1, '快照');
  const fresh = chip(world, 140, 130, '又一份新装的 4096 人 · Alice 过生日', 'dk');
  show(fresh, T('g6') + 0.2, { y: 8 }); fadeOut(fresh, T('g7') - 0.1);
  // 更新链（第 06 章）：42 → 43
  const chT = label(world, 140, 190, 'Alice 这一项的更新链', 'lab'); css(chT, { font: '700 26px "Inter", "Sans SC"', color: '#001E2B' });
  const b42 = tile(world, 140, 236, 260, 130, 'age 42', '旧版本', 'g'), b43 = tile(world, 520, 236, 260, 130, 'age 43', '新版本', 'g');
  const cl = link(ov, [[406, 300], [514, 300]], 'accent', { arrow: true, w: 3 });
  show([chT, b42], T('g6') + 1.4, { y: 12 }); show(b43, T('g8', '43') - 0.2, { x: -30, y: 0 }); arrowIn(cl, T('g8', '43'), 0.5);
  const G = { bg: '#00ED64', bd: '#00ED64', rb: '#E3FCF7', rd: '#00A35C' };
  [b42, b43].forEach((b) => { css(b._t, { color: '#023430' }); css(b._s, { color: '#1C2D38' }); });
  glow(b42, T('g6') + 1.5, T('g7') - 0.2, G); glow(b42, T('g7', '42 岁') - 0.3, T('g8') + 0.1, G); glow(b43, T('g8', '43') - 0.1, T('g9') - 0.1, G);
  glow(b42, T('g9', '还是 42') - 0.3, T('g10') - 0.1, G); glow(b43, T('g10', '43') - 0.3, T('g11') - 0.1, G); glow(b43, T('g11', '才是 43') - 0.3, T('g12'), G);
  const out = term(world, 900, 130, 880, 290, 'mongosh · 实验输出', { fs: 23 });
  show(out.c, T('g7') - 0.2, { x: 20, y: 0 });
  // 时间轴：泳道与播放头
  const X0 = 360, X1 = 1760, LANES = [['Bob', 520], ['Alice', 630], ['事务外', 740]];
  const lanes = LANES.map(([n, y]) => { const l = label(world, 140, y - 20, n, 'lab'); css(l, { font: '700 28px "Inter", "Sans SC"', color: '#001E2B' }); const ln = h('div', 'abs', world); px(ln, X0, y, X1 - X0, 2); css(ln, { background: '#E8EDEB' }); return [l, ln]; });
  const tAx = T('g7') - 0.3;
  lanes.forEach(([l, ln], i) => { show(l, tAx + i * 0.1, { x: -10, y: 0 }); fromTo(ln, tAx + i * 0.1, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }); });
  const AX = [470, 730, 990, 1250, 1560];
  const head = h('div', 'abs', world); px(head, AX[0], 470, 3, 320); css(head, { background: '#00ED64' });
  show(head, tAx + 0.3, { y: 0 });
  const EV = [['g7', 0, 0, '读 42', 'Bob 第一次读： <span class="n">42</span>', '42 岁'], ['g8', 1, 1, '写 43 · 提交', 'Alice 改年龄： <span class="n">1</span> 份', '提交了'],
    ['g9', 2, 0, '还是 42', 'Bob 在同一个事务里再读： <span class="n">42</span>', '还是 42'], ['g10', 3, 2, '读 43', '事务外此刻读： <span class="n">43</span>', '43'], ['g11', 4, 0, '读 43', 'Bob 结束事务后再读： <span class="n">43</span>', '才是 43']];
  let px0 = AX[0];
  const evEls = [];
  EV.forEach(([id, k, lane, txt, line, w]) => {
    const x = AX[k], y = LANES[lane][1];
    if (k > 0) { tl.fromTo(head, { left: px0 + 'px' }, { left: x + 'px', duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T(id) - 0.3); px0 = x; }
    const dot = h('div', 'abs', world); px(dot, x - 13, y - 12, 26, 26); css(dot, { borderRadius: '50%', background: lane === 1 ? '#00ED64' : '#016BF8', border: '3px solid #fff' });
    const tag = chip(world, x - 70, y - 64, txt, lane === 1 ? 'on' : 'blue'); css(tag, { width: '150px', textAlign: 'center', padding: '4px 0', fontSize: '24px' });
    show(dot, T(id), { y: 0, s: 0.4, d: 0.35 }); show(tag, T(id) + 0.2, { y: 8 }); sfx('pop', T(id));
    out.out(T(id, w) - 0.2, line);
    evEls.push(dot, tag);
  });
  // Bob 的事务条：从第一次读开始，随播放头生长，在第三次读之前结束
  const bar = h('div', 'abs', world); px(bar, AX[0] - 40, LANES[0][1] + 18, (AX[3] + AX[4]) / 2 - AX[0] + 40, 26); css(bar, { background: '#E1F7FF', border: '2px solid #016BF8', borderRadius: '8px', transformOrigin: '0 50%' });
  const barL = label(world, AX[0] - 30, LANES[0][1] + 50, 'Bob 的事务', 't-small'); css(barL, { color: '#1254B7' });
  fromTo(bar, T('g7'), { scaleX: 0 }, { scaleX: 1, duration: T('g11') - T('g7') - 0.6, ease: 'none' }); show(barL, T('g7') + 0.4, { y: 6 });
  // g12–g14b：快照那一刻，读的时候顺着更新链往回找，跳过快照之后才提交的 43（G07）
  const snap = h('div', 'abs', world); px(snap, AX[0] - 2, 470, 0, 330); css(snap, { borderLeft: '4px dashed #016BF8' });
  const snapL = gloss(chip(world, AX[0] - 80, 800, '快照：这一刻', 'blue'), '快照');
  show(snap, T('g12', '快照') - 0.3, { y: 0, d: 0.4 }); show(snapL, T('g12', '快照') - 0.1, { y: 8 });
  const snapN = callout(world, 900, 800, 'note', '记下那一刻：哪些修改已经提交，哪些还没有', '快照');
  css(snapN, { zIndex: 3 });
  show(snapN, T('g13') - 0.1, { x: 20, y: 0 }); fadeOut(snapN, T('g15') - 0.1);
  const skip = chip(world, 520, 376, '快照之后才提交 · 跳过', 'red');
  show(skip, T('g14', '跳过去') - 0.5, { y: 8 }); to(b43, T('g14', '跳过去') - 0.4, { autoAlpha: 0.35, duration: 0.4 });
  const back = link(ov, [[514, 342], [406, 342]], 'blue', { arrow: true, w: 4 }); arrowIn(back, T('g14', '往回找') - 0.3, 0.6);
  glow(b42, T('g14b') - 0.2, null, { bg: '#C0FAE6', bd: '#00684A' });
  // g15：Alice 的修改没等 Bob
  const noWait = callout(world, 900, 800, 'tip', '读的人不挡写的人', '不用等');
  css(noWait, { zIndex: 3 });
  show(noWait, T('g15') - 0.1, { x: 20, y: 0 });
  glow(evEls[2], T('g15', '不用等') - 0.3, T('g19a') - 0.2, { bg: '#00ED64', bd: '#00ED64' });
  figs(world, 140, 880, 700, [[T('g7') + 0.4, '图 8-2', 'Bob 的快照读：五件事的先后', '实测：out_08（单节点副本集）']], T('g19a') - 0.3);
  const sec2 = [chT, b42, b43, cl, out.c, head, ...lanes.flat(), ...evEls, bar, barL, snap, snapL, skip, back, noWait];
  hide(sec2, T('g19a') - 0.35, { y: 0, d: 0.45 });

  // ── 三、两人改同一份文档：写冲突，整个事务重来（G04 G06 G08） ──
  ch.sec(T('g19a') - 0.2, '写冲突');
  const doc2 = tile(world, 140, 150, 400, 130, 'Alice 的资料', 'age 42', 'dk'); show(doc2, T('g19a'), { y: 12 });
  glow(doc2, T('g19a') + 0.6, T('g21') + 0.2, { bg: '#00ED64', bd: '#00ED64', rb: '#F9FBFA', rd: '#C1C7C6' });
  const out2 = term(world, 900, 130, 880, 290, 'mongosh · 实验输出', { fs: 23 });
  show(out2.c, T('g21') - 0.2, { x: 20, y: 0 });
  const L2 = [['Alice', 560], ['Carol', 720]];
  const lanes2 = L2.map(([n, y]) => { const l = label(world, 140, y - 20, n, 'lab'); css(l, { font: '700 28px "Inter", "Sans SC"', color: '#001E2B' }); const ln = h('div', 'abs', world); px(ln, X0, y, X1 - X0, 2); css(ln, { background: '#E8EDEB' }); return [l, ln]; });
  show(lanes2.flat(), T('g21') - 0.3, { y: 0, stagger: 0.08 });
  const txBar = (lane, x0, x1, t0, d, cls) => { const e = h('div', 'abs', world); px(e, x0, L2[lane][1] + 18, x1 - x0, 26); css(e, { background: cls === 'g' ? '#E3FCF7' : '#FFF', border: `2px solid ${cls === 'g' ? '#00A35C' : '#889397'}`, borderRadius: '8px', transformOrigin: '0 50%' }); fromTo(e, t0, { scaleX: 0 }, { scaleX: 1, duration: d, ease: 'power2.out' }); return e; };
  const dot2 = (lane, x, t, color, txt, cls) => { const d = h('div', 'abs', world); px(d, x - 13, L2[lane][1] - 12, 26, 26); css(d, { borderRadius: '50%', background: color, border: '3px solid #fff' }); show(d, t, { y: 0, s: 0.4, d: 0.35 }); const c = chip(world, x - 90, L2[lane][1] - 64, txt, cls); css(c, { fontSize: '24px', padding: '4px 14px' }); show(c, t + 0.2, { y: 8 }); return [d, c]; };
  // g21：Alice 在事务里改了，还没提交
  const aBar = txBar(0, 420, 1180, T('g21'), 0.9, 'g');
  const aMod = dot2(0, 560, T('g21', '改了') - 0.1, '#00ED64', '改成 44 · 未提交', 'on');
  keyed(doc2._s).at(T('g21', '改了'), { html: 'age 44 · Alice 还没提交' }).at(T('g27', '提交'), { html: 'age 44' });
  [doc, doc2].forEach((d) => css(d._s, { color: '#1C2D38' }));
  glow(doc2, T('g21', '改了') - 0.1, null, { bg: '#FEF7DB', bd: '#FFC010' });
  const pend = h('div', 'abs', world); px(pend, 560, 490, 620, 280); css(pend, { background: '#FEF7DB', borderLeft: '3px dashed #FFC010', borderRight: '3px dashed #FFC010', zIndex: -1 });
  const pendL = label(world, 760, 500, 'Alice 改了、还没提交的这一段', 't-small'); css(pendL, { color: '#944F01' });
  fromTo(pend, T('g22') - 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }); show(pendL, T('g22') + 0.1, { y: 6 });
  out2.out(T('g21', '改了'), '<span class="c">// Alice：事务里 updateOne → 44，还没提交</span>');
  // g22：Carol 在另一个事务里也要改
  const cBar = txBar(1, 700, 960, T('g22'), 0.6, '');
  const cMod = dot2(1, 900, T('g22', '也要改') - 0.1, '#889397', '也要改', 'dk');
  out2.out(T('g22', '也要改') + 0.1, ['c.startTransaction();  <span class="c">// Carol</span>', 'c.…users.updateOne({ <span class="k">name</span>: <span class="s">"Alice"</span> },', '  { <span class="k">$set</span>: { <span class="k">age</span>: <span class="n">45</span> } })'].join('\n'));
  // g23：可以让 Carol 排队等 Alice 提交 —— MongoDB 没这么做
  const queue = h('div', 'abs', world); px(queue, 920, L2[1][1] - 30, 380, 60); css(queue, { background: '#FFC010', borderRadius: '10px' });
  const qL = label(world, 944, L2[1][1] - 16, '排队，等 Alice 提交？', 'lab'); css(qL, { font: '700 26px "Inter", "Sans SC"', color: '#3D2900' });
  show([queue, qL], T('g23', '排队') - 0.2, { y: 0 });
  const qx = h('div', 'abs', world); px(qx, 920, L2[1][1] - 2, 380, 5); css(qx, { background: '#DB3030', transformOrigin: '0 50%' });
  fromTo(qx, T('g23', '没这么做') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  to([queue, qL], T('g23', '没这么做') + 0.4, { autoAlpha: 0.25, duration: 0.4 });
  // g24–g26：一发现是同一份文档，Carol 直接收到写冲突；错误上带着标签
  glow(cMod[1], T('g25', '错误') - 0.3, null, { bg: '#FFEAE5', bd: '#DB3030', c: '#970606' });
  glow(doc2, T('g24', '同一份') - 0.3, T('g27') - 0.2, { bg: '#FFCDC7', bd: '#DB3030', rb: '#FEF7DB', rd: '#FFC010' });
  to(cMod[0], T('g25', '错误') - 0.3, { backgroundColor: '#DB3030', duration: 0.2 });
  const wc = gloss(chip(world, 820, L2[1][1] + 40, 'WriteConflict', 'red'), '写冲突'); css(wc, { font: '700 28px "Mono"' });
  show(wc, T('g25', '写冲突') - 0.3, { y: 0, s: 1.2 }); sfx('error', T('g25', '写冲突') - 0.2, { g: 0.5 });
  to(cBar, T('g25', '写冲突'), { borderColor: '#DB3030', backgroundColor: '#FFEAE5', duration: 0.3 });
  out2.out(T('g25', '写冲突') - 0.1, "{ <span class=\"k\">'Carol 的错误'</span>: <span class=\"r\">'WriteConflict'</span>,");
  out2.out(T('g26', '标签') - 0.2, "  <span class=\"k\">'错误标签'</span>: [ <span class=\"s\">'TransientTransactionError'</span> ] }");
  const lab = callout(world, 140, 820, 'note', '<code>TransientTransactionError</code>：这一类错误，整个事务重做一遍就行', '错误标签');
  show(lab, T('g26', '标签') - 0.1, { y: 10 }); fadeOut(lab, T('g28') - 0.1);
  // g27：Alice 提交以后，Carol 重做一遍事务，成功了
  const aCom = dot2(0, 1180, T('g27', '提交') - 0.2, '#00684A', '提交 · 44', 'on');
  out2.clear(T('g27', '提交') - 0.4); out2.out(T('g27', '提交') - 0.1, 'Alice 提交之后： <span class="n">44</span>');
  glow(doc2, T('g27', '提交') - 0.1, null, { bg: '#C0FAE6', bd: '#00A35C' }); to([pend, pendL], T('g27', '提交'), { autoAlpha: 0, duration: 0.5 });
  const cBar2 = txBar(1, 1300, 1660, T('g27', '重做') - 0.2, 0.7, 'g');
  const cOk = dot2(1, 1560, T('g27', '成功了') - 0.3, '#00684A', '重做 · 45 提交', 'on');
  out2.out(T('g27', '成功了') - 0.2, 'Carol 重做一遍事务： <span class="n">45</span>');
  // g28：乐观并发
  const opt = callout(world, 140, 820, 'tip', '先不排队，撞上了再让一方整个事务重来', '乐观并发');
  show(opt, T('g28') - 0.1, { y: 10 });
  figs(world, 900, 440, 880, [[T('g21') + 0.4, '图 8-3', '两个事务改同一份文档', '实测：out_08']], null);
  // g36：可要是 mongod 突然被杀了呢？
  glow(cBar2, T('g28') + 0.2, null, { bg: '#00ED64', bd: '#00ED64' });
  to([doc2, out2.c, ...lanes2.flat(), aBar, cBar, cBar2, ...aMod, ...cMod, ...aCom, ...cOk, queue, qL, qx, wc, opt], Tend('g36') - 0.3, { autoAlpha: 0.3, duration: 0.6 });
  nextPage(world, 1260, 820, '09', '出错怎么办', T('g36') - 0.1);

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
