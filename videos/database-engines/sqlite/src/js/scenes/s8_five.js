// 08 五个问题（第 11 稿）：左边五个问题，右边一张总图——main.db 里两棵树、旁边回滚日志与 WAL 两个文件、下面空闲链；
// 答到哪一问，图上的那一部分就动：页与两棵树点亮、找的路线画出来、原页抄进日志、空闲链亮起、锁与快照、抄回原样、校验和与提交标记。
// 事实：A02、H03、H04、I01、J05、J06、K01、K04、E01、E05。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, 'SQLite 是这样回答五个问题的'); show(title, c0 + 0.1, { y: 8 });
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };

  // ── 左边：五个问题 ──
  const QS = ['怎么放', '怎么找', '改和删', '怎么并发', '出错怎么办'], QC = ['z2', 'z3', 'z4', 'z5', 'z7'];
  const qEls = QS.map((q, i) => { const g = h('div', 'abs', W); px(g, 120, 300 + i * 112, 440, 64); const no = btn(g, String(i + 1), 0, 8, 30); tx(g, q, 70, 2, { fs: 42, color: K.teal }); return g; });
  qEls.forEach((g, i) => { set(g, 0, { autoAlpha: 0 }); show(g, c0 + 0.3 + i * 0.15, { x: -14, y: 0, d: 0.5 }); });

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
  const free = []; for (let i = 0; i < 5; i++) free.push(pageCell(W, 700 + i * 110, 866, 70, 44, { fill: K.wheat, bw: 1.5 }));
  const fl = free.slice(0, 4).map((c, i) => line(ov, [[770 + i * 110, 888], [808 + i * 110, 888]], { w: 1.5 }));
  const freeL = tx(W, '空闲链', 590, 872, { fs: 26, color: K.dim });
  free.forEach((c, i) => show(c, c0 + 1.2 + i * 0.05, { y: 0, d: 0.3 })); fl.forEach((l, i) => arrowIn(l, c0 + 1.3 + i * 0.05, 0.2)); show(freeL, c0 + 1.4, { y: 0 });

  // 1 怎么放：一个文件、一样大的页；表是 B+ 树，索引是 B 树
  const pages = [...UTr.lv, ...NTr.lv, UTr.r, NTr.r, ...UTr.ms, ...NTr.ms];
  pages.forEach((e) => { e.dataset.beat = 'line'; });
  // 2 怎么找：从根页往下，一层层缩小；索引给出行号，再到表里取整行——路线一段段画出来
  const route1 = path(ov, `M940,${560 + 64} L805,${560 + 100} M805,${560 + 130} L${690 + 2 * 21 + 9},${560 + 170}`, 'teal', { w: 4, arrow: false });
  const hop = path(ov, `M${690 + 2 * 21 + 9},${560 + 212} L${690 + 2 * 21 + 9},${560 + 236} L674,${560 + 236} L674,${320 + 47} L876,${320 + 47}`, 'teal', { w: 2.5, arrow: true, dashed: '8 6' });
  const route2 = path(ov, `M940,${320 + 64} L945,${320 + 100} M945,${320 + 130} L${690 + 12 * 21 + 9},${320 + 170}`, 'teal', { w: 4, arrow: false });
  arrowIn(route1, T('z3', '根页'), 0.8); arrowIn(hop, T('z3b', '行号'), 0.8); arrowIn(route2, T('z3b', '取整行') - 0.2, 0.8); sfx('whoosh', T('z3', '根页'), { g: 0.3 });
  // 3 改和删：先记日志再改——原页抄进日志；删掉的页串进空闲链
  const cp = [0, 1].map((i) => pageCell(W, 1320 + i * 110, 340, 90, 70, { fill: '#eeeeee', bw: 1.5 }));
  const cpL = tx(W, '改之前的原页', 1550, 360, { fs: 24, color: K.dim });
  cp.forEach((c, i) => { set(c, 0, { autoAlpha: 0 }); tl.fromTo(c, { autoAlpha: 1, x: -560 }, { x: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('z4', '日志') + i * 0.15); }); show(cpL, T('z4', '日志') + 0.6, { x: -8, y: 0 });
  sfx('whoosh', T('z4', '日志'), { g: 0.3 });
  // 4 怎么并发：回滚日志提交时独占整个文件；WAL 各看各的快照；写的人都只有一个
  const lockB = btn(W, '独占锁', 1040, 274, 24); set(lockB, 0, { autoAlpha: 0 }); slam(lockB, T('z5', '独占'), { from: 1.25 }); sfx('thud', T('z5', '独占'), { g: 0.4 });
  const frs = [0, 1, 2].map((i) => { const f = h('div', 'abs', WALp); px(f, 20, 56 + i * 62, 476, 50); css(f, { border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '22px', fontFamily: 'Mono', display: 'flex', alignItems: 'center', paddingLeft: '10px', boxSizing: 'border-box' }); f.innerHTML = ['帧 1 · 第 130 页', '帧 2 · 第 505 页', '帧 5 · 提交'][i]; return f; });
  frs.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); show(f, T('z5b', 'W A L') + i * 0.15, { x: -14, y: 0, d: 0.35 }); });
  const snap = tx(W, '读的人：各看各的快照', 1300, 846, { fs: 24, color: K.teal }); show(snap, T('z5b', '快照'), { y: 6 });
  const one = tx(W, '写的人：只有一个', 1550, 846, { fs: 24, color: K.red }); show(one, T('z6', '只能有一个'), { y: 6 }); sfx('tick', T('z6', '只能有一个'), { g: 0.35 });
  gone(lockB, T('z7') - 0.2, 0.3);
  // 5 出错怎么办：回滚日志存着原样，出事就抄回去；WAL 只认校验和对得上、带提交标记的帧
  const back = line(ov, [[1288, 450], [1224, 450]], { w: 3, color: 'teal' }); arrowIn(back, T('z7', '抄回去') - 0.2, 0.5);
  const backL = tx(W, '抄回原样', 1228, 530, { fs: 24, color: K.teal }); show(backL, T('z7', '抄回去'), { y: 6 }); sfx('whoosh', T('z7', '抄回去'), { g: 0.3 });
  frs.forEach((f, i) => keyed(f).at(T('z7b', '校验和') + i * 0.1, { html: ['帧 1 · 第 130 页 · 校验和对得上', '帧 2 · 第 505 页 · 校验和对得上', '帧 5 · 提交 · 校验和对得上'][i] }));
  sfx('tick', T('z7b', '校验和'), { g: 0.35 });

  // 「当前在讲谁」：左边当前那一问，和图上正在动的那一部分
  frs.forEach((f) => { f.dataset.beat = 'line'; });
  beats([[T('z1', '五个问题'), qEls],
    [T('z2'), qEls[0]], [T('z2', '一个文件'), FILE.nameEl], [T('z2', '页'), pages], [T('z2b'), UTr.all], [T('z2b', '索引是'), NTr.all],
    [T('z3'), qEls[1]], [T('z3', '根页'), NTr.r], [T('z3b', '行号'), NTr.lv[2]], [T('z3b', '取整行'), UTr.lv[12]],
    [T('z4'), qEls[2]], [T('z4', '日志'), JR.nameEl], [T('z4b', '空闲链'), free],
    [T('z5'), qEls[3]], [T('z5', '独占'), lockB], [T('z5b', '快照'), snap], [T('z6', '只能有一个'), one],
    [T('z7'), qEls[4]], [T('z7', '抄回去'), backL], [T('z7b', '校验和'), frs], [T('z7b', '提交标记'), frs[2]]], Tend('z7b'));
  shots(cam, world, s, [[s.start, null, { rect: [110, 256, 1830, 914], pad: 0 }]]);
});
