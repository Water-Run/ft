// 第 03 章：并发：锁与版本。站 A：两个难题；站 B：加锁、共享锁与排他锁（术语表）；站 C：粒度、1975 年的多粒度加锁（I28）、意向锁（D05）、等待；
// 站 D：多版本（MVCC，术语表）与 1983 年（I31）；站 E：三种读错（术语表 dirty read、non-repeatable read、phantom）；
// 站 F：SQL:1992 的四个级别（1995 年论文表 1，I41）；站 G：快照隔离（I41）与 InnoDB 默认的可重复读（D18）。
scene('s03', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 16000, 1400);
  const XB = 2200, XC = 4400, XD = 6600, XE = 8800, XF = 11000, XG = 13200;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const sess = (x, y, label, cls = 't4') => { const e = txt(world, '', label, x, y); css(e, { padding: '8px 18px', borderRadius: '12px', font: '700 30px "Sans SC", "Open Sans"', background: cls === 't4' ? C.ink : cls === 'dim' ? '#bddcd7' : C.blue, color: cls === 'dim' ? C.ink : '#fff' }); return e; };

  // ── 站 A：两个难题 ──
  const PA = panel(world, 96, 160, 820, 620, '并发', { name: 'concurrency' }), PB = panel(world, 1004, 160, 820, 620, '崩溃', { name: 'crash' });
  const tA = at('l1', '两件事');
  showPanel(PA, at('l1') - 0.35); showPanel(PB, at('l1') - 0.2);
  const sa = ['事务 1', '事务 2', '事务 3'].map((n, i) => sess(150 + i * 230, 300, n));
  const dr = row(world, 200, 560, 600, '1' + sp(3) + 'alice' + sp(3) + '30');
  sa.forEach((e, i) => { pop(e, at('l1', '并发') + 0.2 + i * 0.1); const l = gline(g, `M${210 + i * 230} 350 L${330 + i * 100} 552`, 'ink', { w: 4, arrow: true }); arrowIn(l, at('l1b', '同时') + i * 0.1, 0.4); });
  fin(dr, at('l1', '并发') + 0.5);
  const cf = fileIcon(world, 1100, 300, 200, 260, { inpanel: true, lines: [0.7, 0.6, 0.8] });
  const bolt = gline(g, 'M1420 300 L1370 430 L1450 430 L1390 580', 'or', { w: 9 });
  const cl = txt(world, 't-4 wrap', '随时可能中断', 1100, 640);
  pop(cf.e, at('l1', '崩溃') + 0.2); drawIn(bolt, at('l1', '崩溃') + 0.3, 0.35); fin(cl, at('l1', '崩溃') + 0.5); sfx('error', at('l1', '崩溃') + 0.3, { g: 0.35 });
  const ca = txt(world, 't-4 wrap', '许多事务同时读写同一批数据', 150, 660); fin(ca, at('l1b', '同时'));
  tl.fromTo(PA.el, { borderColor: '#cdc6be' }, { borderColor: C.blue, duration: 0.3, immediateRender: false }, at('l1b'));

  // ── 站 B：加锁；共享锁与排他锁 ──
  const L1 = panel(world, XB + 96, 140, 1728, 330, '加锁：要用的数据先锁住，别人等你用完', { name: 'lock-basic' });
  const lr = row(world, XB + 760, 290, 520, '1' + sp(3) + 'alice' + sp(3) + '30');
  const sA = sess(XB + 200, 290, '事务 1', 'blue'), sB = sess(XB + 1420, 250, '事务 2'), sCc = sess(XB + 1420, 340, '事务 3');
  const tl2 = at('l2', '加锁');
  showPanel(L1, at('l2') - 0.3); fin(lr, tl2 - 0.2); pop(sA, tl2); pop(sB, tl2 + 0.15); pop(sCc, tl2 + 0.25);
  const ringB = gring(g, XB + 744, 276, 552, 84, { name: 'row-lock' }); drawIn(ringB, tl2 + 0.3, 0.4); const lkB = lockBadge(world, XB + 1270, 262); pop(lkB, tl2 + 0.5); sfx('pop', tl2 + 0.5, { g: 0.55 });
  const aA = gline(g, `M${XB + 360} 318 L${XB + 736} 318`, 'blue', { w: 5, arrow: true }); arrowIn(aA, tl2 + 0.1, 0.4);
  const wB = tag(world, XB + 1420, 400, '等你用完'); fin(wB, at('l2', '等你用完') - 0.1);
  [sB, sCc].forEach((e) => classAt(e, 'dimmed', at('l2', '等你用完')));
  const LS = panel(world, XB + 96, 520, 846, 380, '共享锁 S', { name: 'shared' }), LX = panel(world, XB + 978, 520, 846, 380, '排他锁 X', { cls: 'warn', name: 'exclusive' });
  const sr = row(world, XB + 380, 690, 300, 'alice' + sp(1) + '30'), xr = row(world, XB + 1262, 690, 300, 'alice' + sp(1) + '30');
  const readers = [0, 1, 2].map((i) => sess(XB + 140, 600 + i * 90, '读'));
  const writer = sess(XB + 1022, 690, '写', 'blue'), others = [0, 1].map((i) => sess(XB + 1680, 620 + i * 140, '等', 'dim'));
  const tS = at('l3', '共享锁'), tX = at('l3b', '排他锁');
  showPanel(LS, tS - 0.3); fin(sr, tS); readers.forEach((e, i) => { pop(e, tS + 0.2 + i * 0.1); const l = gline(g, `M${XB + 220} ${620 + i * 90} L${XB + 372} 718`, 'ink', { w: 4, arrow: true }); arrowIn(l, at('l3', '同时读') - 0.1 + i * 0.1, 0.35); });
  const lsT = txt(world, 't-n dim', '大家可以同时读', XB + 380, 790); fin(lsT, at('l3', '同时读'));
  showPanel(LX, tX - 0.3); fin(xr, tX); pop(writer, tX + 0.2); const lw = gline(g, `M${XB + 1100} 718 L${XB + 1254} 718`, 'blue', { w: 5, arrow: true }); arrowIn(lw, tX + 0.3, 0.35);
  others.forEach((e, i) => pop(e, at('l3b', '一个人') + i * 0.12)); sfx('error', at('l3b', '一个人'), { g: 0.3 });
  const lxT = txt(world, 't-n dim', '同一时间只有一个人能写', XB + 1262, 790); fin(lxT, at('l3b', '一个人'));

  // ── 站 C：粒度、意向锁、等待 ──
  const PT = panel(world, XC + 96, 140, 900, 600, 'users 表', { name: 'granularity' });
  const trs = [0, 1, 2, 3, 4, 5].map((i) => row(world, XC + 140, 230 + i * 74, 812, String(i + 1) + sp(3) + ['alice', 'bob', 'carol', 'dave', 'erin', 'frank'][i]));
  const tG = at('l4', '粒度');
  showPanel(PT, at('l4') - 0.3); trs.forEach((e, i) => fin(e, at('l4') + i * 0.05, { y: 8 }));
  const gT = gring(g, XC + 120, 212, 852, 470, { name: 'table-ring' }), gR = gring(g, XC + 124, 216 + 74 * 2, 844, 66, { name: 'row-ring' });
  const g1 = tag(world, XC + 140, 690, '锁整张表', 'or'), g2 = tag(world, XC + 420, 690, '只锁一行', 'or');
  drawIn(gT, at('l4b', '整张表') - 0.1, 0.45); pop(g1, at('l4b', '整张表')); drawIn(gR, at('l4b', '一行') - 0.1, 0.35); pop(g2, at('l4b', '一行')); sfx('pop', at('l4b', '一行'), { g: 0.5 });
  out(gT, at('l7') - 0.2); out(g1, at('l7') - 0.2);
  const c75 = litCard(world, XC + 1040, 140, 784, { year: '1975', title: 'Granularity of Locks in a Large Shared Data Base', meta: 'Gray, Lorie, Putzolu, Traiger · VLDB 1975', h: 360, titleH: 110 });
  css(c75.ti, { fontSize: '38px' });
  showCard(c75, at('l5', '1975') - 0.2);
  const c75b = txt(world, 't-n wrap', '同一个系统里，大锁小锁可以同时用；为此要另加锁模式', XC + 1084, 530); css(c75b, { width: '700px' }); fin(c75b, at('l5b', '大小不同'));
  const ix = txt(world, '', '意向锁', XC + 800, 158); css(ix, { padding: '6px 14px', borderRadius: '10px', background: C.or, color: C.ink, font: '700 30px "Sans SC"' });
  const ixL = lockBadge(world, XC + 760, 170);
  const ixT = txt(world, 't-n wrap', '锁一行之前，先在表上记一笔：「这张表里有行要锁」', XC + 1084, 630); css(ixT, { width: '700px' });
  const tI = at('l7', '意向锁');
  pop(ix, tI); pop(ixL, tI + 0.1); sfx('pop', tI, { g: 0.55, p: 0.3 }); fin(ixT, at('l7b', '先在表上'));
  beat(ix, at('l7b', '有行要锁'));
  const wr = sess(XC + 1084, 740, '读', 'dim'), wbar = gapBox(world, XC + 1180, 746, 10, 44);
  const wL = txt(world, 't-n dim', '别人在写这一行：读也要等', XC + 1084, 810);
  const tW = at('l8', '等待');
  pop(wr, tW); fin(wL, at('l8', '连读'));
  F((t) => { const k = clamp((t - tW) / 3); wbar.style.width = (10 + 520 * k).toFixed(0) + 'px'; wbar.style.visibility = t >= tW && t < at('m1') ? 'visible' : 'hidden'; });

  // ── 站 D：多版本 ──
  const PV = panel(world, XD + 96, 140, 1100, 740, '另一种思路：多版本', { name: 'mvcc' });
  const vW = sess(XD + 150, 260, '写的人', 'blue'), vR = sess(XD + 150, 520, '读的人');
  const vNew = row(world, XD + 520, 260, 560, '1' + sp(3) + 'alice' + sp(3) + '31', 'on'), vOld = row(world, XD + 520, 520, 560, '1' + sp(3) + 'alice' + sp(3) + '30', 'old');
  const nL = txt(world, 't-s blue', '新版本', XD + 520, 330), oL = txt(world, 't-s dim', '旧版本', XD + 520, 590);
  const tm1 = at('m1', '新版本'), tm2 = at('m1b', '旧版本');
  showPanel(PV, at('m1') - 0.3); pop(vW, at('m1') + 0.1); fin(vNew, tm1 - 0.1); fin(nL, tm1 + 0.1); sfx('pop', tm1, { g: 0.5 });
  const aw2 = gline(g, `M${XD + 320} 288 L${XD + 510} 288`, 'blue', { w: 5, arrow: true }); arrowIn(aw2, tm1 - 0.2, 0.35);
  pop(vR, tm2 - 0.3); fin(vOld, tm2 - 0.1); fin(oL, tm2 + 0.1);
  const ar2 = gline(g, `M${XD + 320} 548 L${XD + 510} 548`, 'ink', { w: 5, arrow: true }); arrowIn(ar2, tm2, 0.35);
  const nw = tag(world, XD + 520, 690, '谁也不用等谁', 'blue'); pop(nw, at('m1b', '不用等')); sfx('chime', at('m1b', '不用等'), { g: 0.35 });
  const mv = txt(world, 't-1', 'MVCC', XD + 1260, 200), mvf = txt(world, 't-n dim wrap', 'Multiversion Concurrency Control · 多版本并发控制', XD + 1264, 320);
  css(mvf, { width: '560px' }); pop(mv, at('m2', '多版本') - 0.2, { from: 0.8, origin: '0 50%' }); fin(mvf, at('m2', '多版本')); sfx('thud', at('m2', '多版本'), { g: 0.5 });
  const c83 = litCard(world, XD + 1240, 460, 584, { year: '1983', title: 'Multiversion Concurrency Control—Theory and Algorithms', meta: 'Bernstein, Goodman · ACM TODS', h: 420, titleH: 132 });
  css(c83.ti, { fontSize: '32px' }); css(c83.yr, { fontSize: '90px' });
  showCard(c83, at('m3', '1983') - 0.2);
  const ctT = tag(world, XD + 1284, 820, '多版本并发控制的正确性理论'); fin(ctT, at('m3b', '正确性理论'));

  // ── 站 E：三种读错 ──
  const hE = txt(world, 't-3', '隔离级别：事务之间能互相看到多少', XE + 100, 140); fin(hE, at('p0') + 0.2);
  const hE2 = txt(world, 't-n dim', '看到得太多，就会读错', XE + 104, 214); fin(hE2, at('p1', '读错'));
  const mini = (k, x, title, id, ev) => {
    const P_ = panel(world, x, 280, 540, 600, title, { name: 'anomaly' });
    const l1 = txt(world, 't-s dim', '事务 1', x + 30, 370), l2 = txt(world, 't-s dim', '事务 2', x + 30, 560);
    const ax1 = gline(g, `M${x + 150} 388 L${x + 510} 388`, 'line', { w: 3 }), ax2 = gline(g, `M${x + 150} 578 L${x + 510} 578`, 'line', { w: 3 });
    const tt = at(id, title.slice(0, 2)) - 0.2;
    const tP = at('p0', '隔离级别') + k * 0.2; fin(P_.el, tP, { y: 24, d: 0.55 }); fin(P_.tt, at('p1', '三种') + k * 0.2, { y: 10 }); sfx('tick', tP, { g: 0.35 }); fin(l1, tt + 0.1); fin(l2, tt + 0.15); drawIn(ax1, tt + 0.1, 0.4); drawIn(ax2, tt + 0.15, 0.4);
    ev.forEach(([lane, xo, text, cls, cid, w]) => { const e = txt(world, '', text, x + xo, lane === 1 ? 362 : 552); css(e, { padding: '6px 12px', borderRadius: '9px', font: '700 28px/1.2 "Sans SC", "Mono"', background: cls === 'blue' ? C.blue : cls === 'or' ? C.or : '#e4efee', color: cls === 'blue' ? '#fff' : C.ink, zIndex: 6 }); pop(e, at(cid, w)); sfx(cls === 'or' ? 'blip' : 'pop', at(cid, w), { g: 0.35, p: lane === 1 ? 0.3 : -0.3 }); });
    return P_;
  };
  mini(0, XE + 96, '脏读', 'p2', [[1, 150, '改成 31', 'blue', 'p2', '没提交'], [2, 260, '读到 31', 'or', 'p2', '读到'], [1, 370, '回滚', '', 'p2', '回滚']]);
  const d2 = txt(world, 't-n wrap', '读到了别人没提交的数据', XE + 126, 680); css(d2, { width: '480px' }); fin(d2, at('p2', '回滚') + 0.2);
  mini(1, XE + 690, '不可重复读', 'p3', [[2, 150, '读：30', '', 'p3', '读两次'], [1, 250, '改成 31 · 提交', 'blue', 'p3b', '提交'], [2, 400, '读：31', 'or', 'p3b', '不同']]);
  const d3 = txt(world, 't-n wrap', '同一事务里两次读，结果不同', XE + 720, 680); css(d3, { width: '480px' }); fin(d3, at('p3b', '不同') + 0.2);
  mini(2, XE + 1284, '幻读', 'p4', [[2, 150, '查到 2 行', '', 'p4', '做两次'], [1, 250, '插入 · 提交', 'blue', 'p4', '新插入'], [2, 380, '查到 3 行', 'or', 'p4', '多出']]);
  const d4 = txt(world, 't-n wrap', '第二次多出了别人新插入的行', XE + 1314, 680); css(d4, { width: '480px' }); fin(d4, at('p4', '多出') + 0.2);

  // ── 站 F：四个隔离级别（1995 年论文表 1） ──
  const hF = txt(world, 't-3', 'SQL:1992 · 四个隔离级别', XF + 100, 140); fin(hF, at('p5', '1992'));
  const PF = panel(world, XF + 96, 230, 1728, 610, null, { name: 'levels' });
  const cols = ['脏读', '不可重复读', '幻读'];
  const hd = cols.map((c, j) => { const e = txt(world, 't-4', c, XF + 760 + j * 330, 260); return e; });
  showPanel(PF, at('p5') + 0.2); hd.forEach((e, j) => fin(e, at('p5', '三种现象') + j * 0.15));
  const levels = [['读未提交', 'p6', '读未提交', [1, 1, 1]], ['读已提交', 'p6', '读已提交', [0, 1, 1]], ['可重复读', 'p7', '可重复读', [0, 0, 1]], ['可串行化', 'p7b', '可串行化', [0, 0, 0]]];
  levels.forEach(([nm, id, w, v], i) => {
    const y = 350 + i * 118;
    const n = txt(world, 't-4', nm, XF + 150, y + 10);
    const tt = at(id, w);
    fin(n, tt - 0.1);
    v.forEach((poss, j) => { const c = txt(world, '', poss ? '可能' : '不会', XF + 760 + j * 330, y); css(c, { width: '240px', height: '76px', borderRadius: '12px', font: '700 34px/76px "Sans SC"', textAlign: 'center', background: poss ? C.or : C.blue, color: poss ? C.ink : '#fff' }); pop(c, tt + 0.15 + j * 0.08); });
    sfx('tick', tt, { g: 0.45, p: -0.4 + i * 0.25 });
  });
  const sF = txt(world, 't-s dim', '依据：Berenson 等，A Critique of ANSI SQL Isolation Levels（1995），表 1', XF + 100, 870); fin(sF, at('p6') + 1.0);

  // ── 站 G：快照隔离与 InnoDB 的默认 ──
  const c95 = litCard(world, XG + 96, 140, 900, { year: '1995', title: 'A Critique of ANSI SQL Isolation Levels', meta: 'Berenson, Bernstein, Gray, Melton, O’Neil, O’Neil · SIGMOD 1995', h: 400, titleH: 120 });
  showCard(c95, at('p9', '1995') - 0.2);
  const si = txt(world, 't-2 blue', '快照隔离', XG + 120, 580); pop(si, at('p9', '快照隔离'), { from: 0.85, origin: '0 50%' }); sfx('chime', at('p9', '快照隔离'), { g: 0.35 });
  const snap = panel(world, XG + 1040, 140, 784, 380, '某一时刻的快照', { cls: 'hot', name: 'snapshot' });
  const snapT = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => tile(world, XG + 1090 + (i % 4) * 176, 230 + Math.floor(i / 4) * 120, 156, 96, i === 5 ? 't0' : 't2'));
  const sq = txt(world, 'quote', '“…reads data from a snapshot of the (committed) data as of the time the transaction started”', XG + 120, 680); css(sq, { width: '880px', fontSize: '30px' });
  showPanel(snap, at('p9b') - 0.2); snapT.forEach((e, i) => pop(e, at('p9b', '快照') + i * 0.04)); fin(sq, at('p9b'));
  const PI = panel(world, XG + 1040, 560, 784, 320, 'InnoDB 默认：可重复读', { cls: 'hot', name: 'innodb-rr' });
  const r1 = txt(world, 't-3', '读', XG + 1090, 650), r1b = txt(world, 't-3 blue', '→ 版本', XG + 1180, 650), w1 = txt(world, 't-3', '改', XG + 1090, 760), w1b = txt(world, 't-3', '→ 锁', XG + 1180, 760);
  const w1l = lockBadge(world, XG + 1330, 776);
  showPanel(PI, at('p10', '可重复读') - 0.2); fin(r1, at('p10b', '读')); fin(r1b, at('p10b', '版本')); fin(w1, at('p10b', '修改')); fin(w1b, at('p10b', '锁')); pop(w1l, at('p10b', '锁') + 0.2);
  sfx('pop', at('p10b', '锁'), { g: 0.5 });

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('l2') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('l4') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('m1') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
    [at('p0') - 0.6, { x: XE + 960 }, 1.1, { g: 0.4 }],
    [at('p5') - 0.6, { x: XF + 960 }, 1.1, { g: 0.4 }],
    [at('p9') - 0.6, { x: XG + 960 }, 1.1, { g: 0.4 }],
  ]);
});
