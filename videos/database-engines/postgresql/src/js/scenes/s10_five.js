// 10 五个问题：左边一列是五个问题，右边是整张结构图（三棵树、堆、可见性图、空闲空间图、提交状态、WAL——就是顶栏那排文件）；
// 讲到哪一问，结构图上回答它的那一部分动起来；最后五个问题都连到同一处：第 23 页里的两个版本（WaterRun 看 r7：「五个问题优化一下 更多结构 而不是PPT列表」）
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  drift(world, s, [], 1);
  hdoc(world, 'PostgreSQL 的五个回答', 72, 128);
  const ov = overlay(world);
  const [P] = D.alice.ctid;
  // ── 左：五个问题，讲到时写出一句短答 ──
  const QS = [
    ['怎么放', '按到达顺序进堆；<br>索引是 B 树，指向地址', 'z2'],
    ['怎么找', '规划器选路：索引 → 堆，<br>再看版本能不能看见', 'z4'],
    ['改和删', '不覆盖，写新版本；<br>旧的没人要了再回收', 'z6'],
    ['怎么并发', '快照挑版本：读写不挡，<br>写和写排队', 'z8'],
    ['出错怎么办', '先写 WAL，崩溃后重放；<br>没提交的本来就看不见', 'z10'],
  ];
  const chips = QS.map(([q, a, cue], i) => {
    const y = 206 + i * 140;
    const c = h('div', 'abs', world); px(c, 72, y, 380, 124); css(c, { background: '#fff', border: '2px solid var(--line)', borderLeft: '8px solid var(--pg)' }); c.dataset.name = q;
    const ql = h('div', 'abs', c, q); px(ql, 20, 10); css(ql, { font: '800 32px "Sans SC"', color: 'var(--pg)' });
    const al = h('div', 'abs', c, a); px(al, 20, 56); css(al, { font: '500 23px "Sans SC"', color: 'var(--ink)', lineHeight: '1.38', whiteSpace: 'nowrap' });
    wipe(c, T('z1') + 0.1 + i * 0.3, { dir: 'l', d: 0.35 });   // 句首就逐个出来：章节卡收走后不留一段静止
    set(al, 0, { autoAlpha: 0 }); show(al, T(cue) + 0.2, { x: -10 }); sfx('thud', T(cue), { g: 0.4 });
    c.y = y; return c;
  });
  // ── 右：结构图 ──
  const MX = 560, HY = 440, PW = 22;
  // 三棵树：根 + 一排叶子
  const trees = [['主键树', 720], ['姓名树', 1040], ['年龄树', 1360]].map(([name, cx]) => {
    const g = h('div', 'abs', world); px(g, cx - 130, 214, 260, 140); g.dataset.name = name;
    const rt = h('div', 'abs', g); px(rt, 70, 0, 120, 30); css(rt, { background: 'var(--pg)' });
    const lv = []; for (let k = 0; k < 6; k++) { const l = h('div', 'abs', g); px(l, 4 + k * 43, 70, 36, 26); css(l, { background: 'var(--wash)', border: '2px solid var(--pg)' }); lv.push(l); }
    const gv = svg('svg', { viewBox: '0 0 260 140', width: 260, height: 140 }, g); css(gv, { position: 'absolute', left: '0px', top: '0px' });
    for (let k = 0; k < 6; k++) svg('path', { d: `M130,30 L${22 + k * 43},70`, stroke: '#699eca', 'stroke-width': 1.5, fill: 'none' }, gv);
    const lb = h('div', 'abs', g, name); px(lb, 0, 104); css(lb, { width: '260px', textAlign: 'center', font: '600 22px "Sans SC"', color: 'var(--navy)' });
    return { g, rt, lv, cx };
  });
  // 堆：47 页一排；第 23 页
  const heapL = h('div', 'abs', world, '堆'); px(heapL, MX - 50, HY + 16); css(heapL, { font: '800 28px "Sans SC"', color: 'var(--pg)' });
  const pages = [];
  for (let i = 0; i < D.heap.pages; i++) { const p = h('div', 'abs', world); px(p, MX + i * PW, HY, PW - 4, 70); css(p, { background: 'var(--sky-lt)', border: '2px solid var(--pg)' }); pages.push(p); }
  const p23x = MX + P * PW + (PW - 4) / 2;
  const p23l = h('div', 'abs mono', world, String(P)); px(p23l, p23x - 13, HY + 74); css(p23l, { font: '700 22px var(--mono)', color: 'var(--navy)' });
  // 可见性图、空闲空间图、提交状态：小文件
  const small = (x, y, w, txt) => { const e = h('div', 'abs', world, txt); px(e, x, y, w, 40); css(e, { border: '2px solid var(--pg)', background: '#fff', font: '600 22px "Sans SC"', color: 'var(--pg)', textAlign: 'center', lineHeight: '36px' }); return e; };
  const vm = small(1640, HY - 4, 200, '可见性图'), fsm = small(1640, HY + 42, 200, '空闲空间图');
  const xact = small(1640, 230, 200, '提交状态'); const xc = h('div', 'abs', world, '4856 已提交'); px(xc, 1640, 274, 200, 36); css(xc, { background: 'var(--pg)', color: '#fff', font: '700 22px "Mono","Sans SC"', textAlign: 'center', lineHeight: '36px' });
  // 第 23 页放大：两个版本（还有 Carol 没提交的那一版，最后才出现）
  const BX = 860, BY = 590;
  const bub = h('div', 'abs', world); px(bub, BX, BY, 620, 92); css(bub, { border: '3px solid var(--pg)', background: '#fff' }); bub.dataset.name = '第 23 页里的版本';
  const bubL = h('div', 'abs', bub, `第 ${P} 页`); px(bubL, 12, 6); css(bubL, { font: '700 22px "Sans SC"', color: 'var(--pg)' });
  const tupO = h('div', 'abs', bub, '42　xmax 4856'); px(tupO, 110, 22, 220, 50); css(tupO, { background: 'var(--sky-lt)', color: 'var(--navy)', font: '600 22px var(--mono)', textAlign: 'center', lineHeight: '50px' });
  const tupN = h('div', 'abs', bub, '43　新版本'); px(tupN, 350, 22, 160, 50); css(tupN, { background: 'var(--pg)', color: '#fff', font: '600 22px var(--mono)', textAlign: 'center', lineHeight: '50px' });
  const tupX = h('div', 'abs', bub, '99'); px(tupX, 530, 22, 76, 50); css(tupX, { border: '3px dashed var(--warn)', color: 'var(--warn)', font: '700 22px var(--mono)', textAlign: 'center', lineHeight: '44px' });
  const fun = path(ov, `M${p23x - 9},${HY + 100} L${p23x + 9},${HY + 100} L${BX + 620},${BY} L${BX},${BY} Z`, 'dim', { w: 1.5, arrow: false });
  fun.setAttribute('fill', 'rgba(105,158,202,.14)'); fun.setAttribute('stroke', 'rgba(105,158,202,.5)');
  // WAL：一条日志带
  const walL = h('div', 'abs', world, 'WAL'); px(walL, MX - 74, 760); css(walL, { font: '800 28px var(--sans)', color: 'var(--pg)' });
  const recs = []; for (let k = 0; k < 11; k++) { const r = h('div', 'abs', world); px(r, MX + k * 94, 750, 86, 52); css(r, { border: '2px solid var(--pg)', background: 'var(--pg)' }); recs.push(r); }
  // 「这样回答」时先浮出整张结构图的虚线轮廓（三棵树、堆、WAL），讲到哪一问，哪一块变成实的
  const ghost = (x, y, w, hh, bg) => { const g = h('div', 'abs', world); px(g, x, y, w, hh); css(g, { border: '2px dashed rgba(51,103,145,.45)', background: bg || 'none' }); g.dataset.name = '轮廓'; return g; };
  const gTrees = trees.map((t) => ghost(t.cx - 130, 214, 260, 100));
  const gHeap = ghost(MX, HY, D.heap.pages * PW - 4, 70, 'repeating-linear-gradient(90deg,rgba(51,103,145,.22) 0 2px,transparent 2px 22px)');
  const gWal = ghost(MX, 750, 11 * 94 - 8, 52, 'repeating-linear-gradient(90deg,rgba(51,103,145,.22) 0 2px,transparent 2px 94px)');
  const tG = T('z1', '这样回答') - 0.3;
  gTrees.forEach((g, i) => show(g, tG + i * 0.15, { y: -8, d: 0.35 })); show(gHeap, tG + 0.5, { x: -16, d: 0.5 }); show(gWal, tG + 0.9, { x: -16, d: 0.5 });
  sfx('whoosh', tG, { g: 0.3 });
  // ── 按旁白动起来 ──
  // 放：堆一页页从左往右填上；三棵树出现，各连一条线到第 23 页
  const tH = T('z2', '堆') - 0.4;
  show(heapL, tH, { x: -10 }); pages.forEach((p, i) => show(p, tH + i * 0.012, { y: -6, d: 0.15 })); show(p23l, tH + 0.6);
  const tT = T('z3', 'B 树') - 0.2;
  trees.forEach((t, i) => show(t.g, tT + i * 0.12, { y: -10 })); gTrees.forEach((g) => gone(g, tT + 0.3, 0.3)); gone(gHeap, tH + 0.6, 0.3); gone(gWal, T('z10', 'WAL') - 0.1, 0.3);
  const tl3 = trees.map((t) => path(ov, `M${t.cx},${214 + 136} L${p23x},${HY - 4}`, 'accent', { w: 2.5 }));   // 从树名下面出发，不穿过树名
  tl3.forEach((l, i) => arrowIn(l, T('z3', '地址') - 0.2 + i * 0.08, 0.4)); sfx('tick', T('z3', '地址'));
  [vm, fsm, xact, xc].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  // 找：规划器挑姓名树；一个点从根走到叶子，再落到第 23 页；可见性图在旁边亮一下
  const plan = tagEl(world, '规划器选路', 470, 380, 'navy'); css(plan, { fontSize: '22px' });
  show(plan, T('z4', '规划器') - 0.1, { y: 8 }); hide(plan, T('z6') - 0.2, { d: 0.25 });
  tl3.forEach((l) => gone(l, T('z4') - 0.1, 0.25));
  const nt = trees[1];
  const dot = h('div', 'abs', world); px(dot, nt.cx - 10, 214 + 5, 20, 20); css(dot, { borderRadius: '50%', background: 'var(--warn)', zIndex: 3 });
  set(dot, 0, { autoAlpha: 0 });
  const tW = T('z5', '索引') - 0.2;
  tl.fromTo(dot, { autoAlpha: 1, x: 0, y: 0 }, { x: -108, y: 68, duration: 0.45, ease: 'power2.inOut', immediateRender: false }, tW);   // 姓名树最左边的叶子（Alice 在那里）
  tl.fromTo(dot, { x: -108, y: 68 }, { x: p23x - nt.cx, y: HY + 35 - 229, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T('z5', '堆') - 0.2);
  set(pages[P], T('z5', '堆') + 0.3, { background: 'var(--pg)' });
  show(vm, T('z5', '看见') - 0.2, { x: 10 }); fromTo(vm, T('z5', '看见'), { backgroundColor: '#fff' }, { backgroundColor: '#ffe7a6', duration: 0.25 });
  gone(dot, T('z6') - 0.2, 0.25);
  // 改和删：第 23 页放大，旧版本旁边多了新版本；旧的没人要时回收，空闲空间图记下
  tl.fromTo(fun, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, immediateRender: true }, T('z6') - 0.1);
  wipe(bub, T('z6') - 0.05, { dir: 't', d: 0.35 });
  [tupO, tupN, tupX].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  show(tupO, T('z6'), { x: -10 }); show(tupN, T('z6', '新版本') - 0.1, { x: 20 }); sfx('pop', T('z6', '新版本'));
  fromTo(tupO, T('z6', 'xmax'), { boxShadow: 'inset 0 0 0 0px #b8442f' }, { boxShadow: 'inset 0 0 0 4px #b8442f', duration: 0.25 });
  const rec = tagEl(world, '没人要了 → 回收', BX + 110, BY + 100, 'grey'); css(rec, { fontSize: '22px' });
  show(rec, T('z7', '清理回收') - 0.2, { y: -6 }); show(fsm, T('z7', '回收') - 0.1, { x: 10 }); fromTo(fsm, T('z7', '回收'), { backgroundColor: '#fff' }, { backgroundColor: '#ffe7a6', duration: 0.25 });
  hide(rec, T('z8') - 0.2, { d: 0.25 });
  // 并发：Bob 的快照读 42，Alice 写 43；Carol 排在 Alice 后面；提交状态记着谁提交了
  const bob = tagEl(world, 'Bob 的快照 → 读 42', BX + 110, BY + 100, 'navy'), car = tagEl(world, 'Carol 改：排队', BX + 350, BY + 100, 'warn');
  [bob, car].forEach((e) => css(e, { fontSize: '22px' }));
  show(bob, T('z8', '快照'), { y: -6 }); show(xact, T('z8') + 0.2, { x: 10 }); show(xc, T('z8') + 0.4, { x: 10 });
  show(car, T('z9', '排队') - 0.2, { y: -6 }); sfx('tick', T('z9', '排队'));
  [bob, car].forEach((e) => hide(e, T('z10') - 0.2, { d: 0.25 }));
  // 出错：日志带一格格写上；崩溃后从日志重放回堆；没提交的 99 那一版，就在页里，谁都看不见
  show(walL, T('z10', 'WAL') - 0.3, { x: -10 }); recs.forEach((r, i) => show(r, T('z10', 'WAL') - 0.3 + i * 0.05, { x: -8, d: 0.2 }));
  const rp = curve(ov, [MX + 5 * 94 + 43, 748], [p23x - 30, HY + 74], 'warn', { w: 3.5, bend: 640 });
  arrowIn(rp, T('z10', '重放') - 0.2, 0.5);
  const rpl = tagEl(world, '重放', MX + 4 * 94 - 20, 690, 'warn'); css(rpl, { fontSize: '22px' }); show(rpl, T('z10', '重放'), { y: 6 }); sfx('thud', T('z10', '重放'), { g: 0.5 });
  show(tupX, T('z11'), { x: 10 }); const xl = tagEl(world, '没提交：看不见', BX + 440, BY + 100, 'warn'); css(xl, { fontSize: '22px' }); show(xl, T('z11', '看不见'), { y: -6 });
  [rp, rpl].forEach((e) => gone(e, T('z12') - 0.2, 0.25));
  // 五个答案，同一个做法：结构图淡下去，五个问题都连到第 23 页里的那对版本；改一行，就写一个新版本
  const tz = T('z12', '同一个做法');
  const dimEls = [...trees.map((t) => t.g), heapL, ...pages, p23l, vm, fsm, xact, xc, walL, ...recs, tupX];
  hide(xl, tz - 0.3, { d: 0.25 });
  dimEls.forEach((e) => to(e, tz - 0.3, { opacity: 0.25, duration: 0.4 }));
  chips.forEach((c, i) => { const a = [452, c.y + 62], b = [BX, BY + 46]; const l = curve(ov, a, b, 'accent', { w: 3, bend: null }); l.setAttribute('d', `M${a[0]},${a[1]} C${a[0] + 200},${a[1]} ${b[0] - 220},${b[1]} ${b[0]},${b[1]}`); arrowIn(l, tz + i * 0.1, 0.6); });
  sfx('whoosh', tz, { g: 0.4 });
  const core = h('div', 'abs', world); px(core, BX, 828, 620, 70); css(core, { background: 'var(--pg)' }); core.dataset.name = '同一个做法';
  const cl = h('div', 'abs', core, '改一行，就写一个新版本'); px(cl, 24, 12); css(cl, { font: '800 34px "Sans SC"', color: '#fff' });
  wipe(core, T('z13') - 0.1, { dir: 'l', d: 0.5 }); sfx('chime', T('z13', '新版本'), { g: 0.7 });
  fromTo(tupN, T('z13', '新版本'), { boxShadow: '0 0 0 0px rgba(224,161,27,0)' }, { boxShadow: '0 0 0 6px rgba(224,161,27,1)', duration: 0.3 });
  const fz = focusRing(world);
  fz.at(T('z2') + 0.1, chips[0]).at(T('z4') + 0.1, chips[1]).at(T('z6') + 0.1, chips[2]).at(T('z8') + 0.1, chips[3]).at(T('z10') + 0.1, chips[4]).off(tz - 0.2);
});
