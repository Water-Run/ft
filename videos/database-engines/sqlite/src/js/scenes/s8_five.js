// 08 五个问题（第 16 稿）：左边五个问题，每答完一问就在下面写一句短答案并留着；右边一张总图——main.db 里两棵树、旁边回滚日志与 WAL 两个文件、下面空闲链；
// 答到哪一问，图上的那一部分就动：页抬一下、找的路线画出来、原页抄进日志、删掉的页进空闲链、锁与快照、第二个写的被挡回、抄回原样、帧逐个打勾。
// 事实：A02、H03、H04、I01、J05、J06、K01、K04、E01、E05。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, 'SQLite 是这样回答五个问题的'); show(title, c0 + 0.1, { y: 8 });
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };

  // ── 左边：五个问题；答到哪一问，下面写上一句短答案并留着，结尾左边就是一张答案清单（WaterRun 看 r7d：「五个答案细节和动画优化一下」）──
  const QS = ['怎么放', '怎么找', '改和删', '怎么并发', '出错怎么办'];
  const qEls = QS.map((q, i) => { const g = h('div', 'abs', W); px(g, 120, 300 + i * 112, 440, 64); btn(g, String(i + 1), 0, 8, 30); tx(g, q, 70, 2, { fs: 42, color: K.teal }); return g; });
  qEls.forEach((g, i) => { set(g, 0, { autoAlpha: 0 }); show(g, c0 + 0.3 + i * 0.15, { x: -14, y: 0, d: 0.5 }); });
  const AN = [['一个文件，一样大的页', T('z2', '一样大')], ['从根页往下，行号回表', T('z3b', '取整行')], ['先记日志；删掉的页进空闲链', T('z4b', '空闲链')], ['写的人只有一个', T('z6', '只能有一个')], ['抄回原样；只认提交了的帧', T('z7b', '提交标记')]];
  const ans = AN.map(([a, t], i) => { const e = tx(W, a, 190, 300 + i * 112 + 62, { fs: 26, color: '#333' }); show(e, t, { x: -10, y: 0 }); return e; });

  // ── 右边：一张总图 ──
  const FILE = panel('main.db', 660, 270, 560, 560);
  const miniTree = (y, label) => {
    const L = tx(W, label, 684, y - 4, { fs: 24, color: K.dim });
    const r = pageCell(W, 880, y + 30, 120, 34, { bw: 2 });
    const ms = [760, 900, 1040].map((x) => pageCell(W, x, y + 100, 90, 30, { bw: 1.5 }));
    const lines = ms.map((m, i) => line(ov, [[900 + i * 40, y + 64], [[805, 945, 1085][i], y + 100]], { arrow: false, w: 1.5 }));
    const lv = []; for (let i = 0; i < 24; i++) lv.push(pageCell(W, 690 + i * 21, y + 170, 18, 40, { bw: 1 }));
    return { L, r, ms, lines, lv, all: [L, r, ...ms, ...lv] };
  };
  const UTr = miniTree(320, 'users 表：B+ 树'), NTr = miniTree(560, '姓名索引：B 树');
  wipe(FILE, c0 + 0.4, { dir: 'l', d: 0.5 });
  [UTr, NTr].forEach((tr, k) => { tr.all.forEach((e, i) => show(e, c0 + 0.7 + k * 0.3 + i * 0.01, { y: 0, d: 0.3 })); tr.lines.forEach((l) => arrowIn(l, c0 + 0.8 + k * 0.3, 0.3)); });
  const JR = panel('main.db-journal', 1290, 270, 520, 250), WALp = panel('main.db-wal', 1290, 570, 520, 260);
  wipe(JR, c0 + 0.9, { dir: 'l', d: 0.45 }); wipe(WALp, c0 + 1.1, { dir: 'l', d: 0.45 });

  // 1 怎么放：一个文件、一样大的页——念到「一样大」时叶页从左到右轻轻抬一下（一次，不来回）
  [...UTr.lv, ...NTr.lv].forEach((e, i) => { const t = T('z2', '一样大') - 0.1 + (i % 24) * 0.025 + (i >= 24 ? 0.1 : 0); tl.fromTo(e, { y: 0 }, { y: -8, duration: 0.2, ease: 'power1.out', immediateRender: false }, t); tl.fromTo(e, { y: -8 }, { y: 0, duration: 0.3, ease: 'power1.inOut', immediateRender: false }, t + 0.2); });

  // 2 怎么找：从根页往下，一层层缩小（姓名索引别的叶页淡下去）；索引给出行号，拿着行号回 users 表，取到 Alice 那一页（麦色）
  const hop = path(ov, `M${690 + 2 * 21 + 9},${560 + 212} L${690 + 2 * 21 + 9},${560 + 236} L674,${560 + 236} L674,${320 + 47} L876,${320 + 47}`, 'teal', { w: 2.5, arrow: true, dashed: '8 6' });
  const route2 = path(ov, `M940,${320 + 64} L945,${320 + 100} M945,${320 + 130} L${690 + 12 * 21 + 9},${320 + 170}`, 'teal', { w: 4, arrow: false });
  arrowIn(hop, T('z3b', '行号') + 0.2, 0.8); arrowIn(route2, T('z3b', '取整行') - 0.2, 0.8); sfx('whoosh', T('z3', '根页'), { g: 0.3 });
  // 一层层缩小（WaterRun 看 r8：「一层层缩小范围 没有一层层的动画」）：念到「根页」根页亮（麦色＝这一路读到的页）；「往下」路线走到中间那一页，它亮、旁边两页淡下去；
  // 「一层层」再走到叶页，它亮、其余叶页淡下去。讲完「改和删」之前淡下去的恢复
  const r1a = path(ov, `M940,${560 + 64} L805,${560 + 100}`, 'teal', { w: 4, arrow: false }), r1b = path(ov, `M805,${560 + 130} L${690 + 2 * 21 + 9},${560 + 170}`, 'teal', { w: 4, arrow: false });
  set(NTr.r, T('z3', '根页') - 0.05, { backgroundColor: K.wheat });
  arrowIn(r1a, T('z3', '根页') + 0.15, 0.45); set(NTr.ms[0], T('z3', '往下') + 0.2, { backgroundColor: K.wheat }); NTr.ms.slice(1).forEach((e) => dim(e, T('z3', '往下') + 0.2, 0.3, 1, 0.4));
  arrowIn(r1b, T('z3', '一层层') - 0.05, 0.45); set(NTr.lv[2], T('z3', '一层层') + 0.38, { backgroundColor: K.wheat });
  const outN = [...NTr.ms.slice(1), ...NTr.lv.filter((e, i) => i !== 2)];
  NTr.lv.forEach((e, i) => { if (i !== 2) dim(e, T('z3', '一层层') + 0.35, 0.3, 1, 0.4); });
  outN.forEach((e) => tl.fromTo(e, { opacity: 0.3 }, { opacity: 1, duration: 0.45, immediateRender: false }, T('z4') - 0.3));
  const rid = tx(W, '行号 2050', 760, 790, { fs: 24, css: { background: '#ffffff', padding: '0 6px' } }); show(rid, T('z3b', '行号'), { y: 6 }); gone(rid, T('z4') - 0.3, 0.45);
  const al = UTr.lv[12]; set(al, T('z3b', '取整行') + 0.4, { backgroundColor: K.wheat });

  // 3 改和删：先把改之前的原页抄进日志，再改（Alice 那页浅红＝改到一半，改完回麦色）；删掉的页（users 表最右三页）变成空闲页，串进空闲链，新数据先用它（浅绿）
  const cp = [0, 1].map((i) => pageCell(JR, 30 + i * 110, 70, 90, 70, { fill: '#eeeeee', bw: 1.5 }));   // 放进日志文件里：日志压淡时跟着压淡
  const cpL = tx(JR, '改之前的原页', 260, 90, { fs: 24, color: K.dim });
  cp.forEach((c, i) => { set(c, 0, { autoAlpha: 0 }); tl.fromTo(c, { autoAlpha: 1, x: -560 }, { x: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('z4', '日志') - 0.3 + i * 0.15); }); show(cpL, T('z4', '日志') + 0.4, { x: -8, y: 0 });
  sfx('whoosh', T('z4', '日志') - 0.3, { g: 0.3 });
  set(al, T('z4', '再改'), { backgroundColor: '#efc6c6' }); sfx('tick', T('z4', '再改'), { g: 0.3 }); set(al, T('z4b') - 0.1, { backgroundColor: K.wheat });
  UTr.lv.slice(21).forEach((e, i) => set(e, T('z4b', '删掉') + i * 0.08, { backgroundColor: '#ffffff', borderStyle: 'dashed' }));
  const free = []; for (let i = 0; i < 5; i++) { const c = pageCell(W, 700 + i * 110, 866, 70, 44, { fill: '#ffffff', bw: 1.5 }); c.style.borderStyle = 'dashed'; free.push(c); }   // 空闲页：白底虚线框，和第 08 章一样
  const fl = free.slice(0, 4).map((c, i) => line(ov, [[770 + i * 110, 888], [808 + i * 110, 888]], { w: 1.5 }));
  const freeL = tx(W, '空闲链', 590, 872, { fs: 26, color: K.dim });
  free.forEach((c, i) => { set(c, 0, { autoAlpha: 0 }); show(c, T('z4b', '空闲链') - 0.3 + i * 0.07, { x: -10, y: 0, d: 0.3 }); });
  fl.forEach((l, i) => arrowIn(l, T('z4b', '空闲链') - 0.2 + i * 0.07, 0.2));
  set(freeL, 0, { autoAlpha: 0 }); show(freeL, T('z4b', '空闲链'), { x: -10, y: 0 });
  set(free[0], T('z4b', '以后'), { backgroundColor: OWN.u, borderStyle: 'solid' }); sfx('pop', T('z4b', '以后'), { g: 0.3 });

  // 4 怎么并发：回滚日志提交时独占整个文件（锁扣在 main.db 上）；WAL 里读的人看自己那一份快照（括到提交帧为止）；写的人只有一个：第二个写的来了被挡回去
  const lockB = btn(W, '独占锁', 1040, 274, 24); set(lockB, 0, { autoAlpha: 0 }); slam(lockB, T('z5', '独占'), { from: 1.25 }); sfx('thud', T('z5', '独占'), { g: 0.4 });
  const FT = ['帧 1 · 第 130 页', '帧 2 · 第 505 页', '帧 5 · 提交'];
  const frs = FT.map((s1, i) => { const f = h('div', 'abs', WALp); px(f, 20, 56 + i * 62, 400, 50); css(f, { border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '22px', fontFamily: 'Mono', display: 'flex', alignItems: 'center', paddingLeft: '10px', boxSizing: 'border-box' }); f.innerHTML = s1; return f; });
  frs.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); show(f, T('z5b', 'W A L') + i * 0.15, { x: -14, y: 0, d: 0.35 }); });
  const br = h('div', 'abs', WALp); px(br, 432, 56, 14, 174); css(br, { borderTop: `3px solid ${K.teal}`, borderRight: `3px solid ${K.teal}`, borderBottom: `3px solid ${K.teal}`, boxSizing: 'border-box', transformOrigin: '50% 0%' }); set(br, 0, { autoAlpha: 0 });
  tl.fromTo(br, { autoAlpha: 0, scaleY: 0.3 }, { autoAlpha: 1, scaleY: 1, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('z5b', '快照') - 0.2);
  const brL = tx(WALp, '快照', 452, 124, { fs: 24, color: K.teal }); show(brL, T('z5b', '快照'), { x: -8, y: 0 });
  const wA = btn(W, '写', 960, 274, 24), wB = btn(W, '写', 1150, 274, 24);
  [wA, wB].forEach((e) => { e.style.background = K.teal; e.style.color = '#ffffff'; set(e, 0, { autoAlpha: 0 }); });
  show(wA, T('z6', '两种') + 0.3, { y: -8 });
  tl.fromTo(wB, { autoAlpha: 0, x: 120 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('z6', '只能有一个') - 0.5);
  tl.fromTo(wB, { x: 0 }, { x: 120, duration: 0.45, ease: 'power2.in', immediateRender: false }, T('z6', '只能有一个') + 0.05);
  gone(wB, T('z6', '只能有一个') + 0.3, 0.45); sfx('thud', T('z6', '只能有一个'), { g: 0.35 });
  gone(lockB, T('z5b') - 0.3, 0.45); gone(wA, T('z7') - 0.3, 0.45);   // 独占锁是回滚日志模式的：讲到 WAL 就收走

  // 5 出错怎么办：回滚日志里的原页抄回 main.db（飞回 Alice 那一页）；WAL 的帧逐个对上校验和（打勾），提交帧被认下
  const cb = [0, 1].map((i) => { const c = pageCell(W, 1320 + i * 110, 340, 90, 70, { fill: '#eeeeee', bw: 1.5 }); c.style.zIndex = '3'; set(c, 0, { autoAlpha: 0 }); return c; });
  cb.forEach((c, i) => { const t = T('z7', '抄回去') - 0.4 + i * 0.15; tl.fromTo(c, { autoAlpha: 1, x: 0, y: 0, scale: 1 }, { x: 690 + 12 * 21 - 1356 - i * 110, y: 490 - 355, scale: 0.3, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, t); tl.set(c, { autoAlpha: 0 }, t + 0.8); });
  sfx('whoosh', T('z7', '抄回去') - 0.4, { g: 0.3 });
  // 打勾：用两条边画出的勾（不用符号字），深青，在帧的右端依次出现
  frs.forEach((f, i) => { const k = h('div', 'abs', f); px(k, 352, 8, 14, 26); css(k, { borderRight: `4px solid ${K.teal}`, borderBottom: `4px solid ${K.teal}`, transform: 'rotate(45deg)', boxSizing: 'border-box' }); k.dataset.name = '校验和对上'; set(k, 0, { autoAlpha: 0 }); tl.fromTo(k, { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, T('z7b', '校验和') + i * 0.15); });
  sfx('tick', T('z7b', '校验和'), { g: 0.35 });

  // 当前模式（WaterRun 看 r8：「五个问题 模式是WAL和joural时要对应高亮体现当前模式」）：讲哪种模式就亮哪个文件——文件名条深青底白字，另一个压淡；
  // 讲「两种模式」两个都亮；讲删页（与模式无关）和讲完时回到平常
  const MODE = [[T('z4') - 0.2, 'j'], [T('z4b') - 0.2, '-'], [T('z5') - 0.2, 'j'], [T('z5b') - 0.2, 'w'], [T('z6') - 0.2, 'jw'], [T('z7') - 0.2, 'j'], [T('z7b') - 0.2, 'w'], [Tend('z7b') + 0.3, '-']];
  const look = (st, k) => (st === '-' ? { o: 1, bg: '#dddddd', c: K.ink } : st.includes(k) ? { o: 1, bg: K.teal, c: '#ffffff' } : { o: 0.35, bg: '#dddddd', c: K.ink });
  [[JR, 'j'], [WALp, 'w']].forEach(([P, k]) => { let pv = look('-', k); MODE.forEach(([t, st]) => { const nx = look(st, k);
    if (nx.o !== pv.o) tl.fromTo(P, { opacity: pv.o }, { opacity: nx.o, duration: 0.4, ease: 'power1.inOut', immediateRender: false }, t);
    if (nx.bg !== pv.bg) tl.fromTo(P.nameEl, { backgroundColor: pv.bg, color: pv.c }, { backgroundColor: nx.bg, color: nx.c, duration: 0.4, ease: 'power1.inOut', immediateRender: false }, t);
    pv = nx; }); });

  // 两个焦点框：左边一个跟着当前这一问往下走；图上一个指这一问对应的部分
  focus(W, [[T('z2'), [qEls[0], ans[0]]], [T('z3'), [qEls[1], ans[1]]], [T('z4'), [qEls[2], ans[2]]], [T('z5'), [qEls[3], ans[3]]], [T('z7'), [qEls[4], ans[4]]]], Tend('z7b') + 0.6);   // 框住问题连同它下面的答案（答案没出来时也留出位置），框线不压字
  focus(W, [[T('z2', '一个文件'), FILE, T('z2', '一样大') - 0.2], [T('z2b'), UTr.all], [T('z2b', '索引是'), NTr.all, Tend('z2b')], [T('z3', '根页'), NTr.r], [T('z3', '往下') + 0.2, NTr.ms[0]], [T('z3', '一层层') + 0.38, NTr.lv[2], Tend('z3')], [T('z3b', '行号'), rid, T('z3b', '取整行') - 0.2], [T('z3b', '取整行'), al, Tend('z3b')], [T('z4b', '空闲链'), free, Tend('z4b')], [T('z5', '独占'), lockB, Tend('z5')], [T('z5b', '快照'), [br, brL], Tend('z5b')], [T('z7b', '提交标记'), frs[2], Tend('z7b')]], Tend('z7b'));
  shots(cam, world, s, [[s.start, null, { rect: [110, 256, 1830, 914], pad: 0 }]]);
});
