// 第 02 章：什么是事务。站 A：users 与 notes 两处修改、停在一半、事务、提交与回滚；站 B：MyISAM 表做同样的事（I06）；
// 站 C：Gray 1981 年的论文与摘要原文（I27）；站 D：ACID 四个字母与手册术语表的释义（I38）；站 E：1998 年图灵奖（I27）。
scene('s02', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 11000, 1400);
  const XB = 2200, XC = 4400, XD = 6600, XE = 8800;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const hv = (v) => `<span style="background:${C.blue};color:#fff;border-radius:6px;padding:0 8px">${v}</span>`;

  // ── 站 A：两处修改 ──
  const PU = panel(world, 96, 140, 820, 330, 'users'), PN = panel(world, 1004, 140, 820, 330, 'notes');
  const hU = txt(world, 'mono t-s dim', 'id' + sp(3) + 'name' + sp(5) + 'age', 162, 208), hN = txt(world, 'mono t-s dim', 'id' + sp(3) + 'body', 1070, 208);
  const rU = row(world, 140, 296, 730, '1' + sp(4) + 'alice' + sp(5) + '30'), rN = row(world, 1048, 296, 730, '1' + sp(4) + 'hello');
  const tA = at('t1') - 0.35;
  const tNt = at('t1', '两') - 0.1; showPanel(PU, tA);   // notes 表在读到「两张表」时出现，不等到 notes 这个词（中间约 3 秒没有成块的变化） showPanel(PN, tNt); fin(hU, tA); fin(hN, tNt + 0.25); fin(rU, tA + 0.1); fin(rN, tNt + 0.45);
  sfx('tick', tA, { g: 0.4, p: -0.4 }); sfx('tick', tNt, { g: 0.4, p: 0.4 });
  const t31 = at('t2', '31'), tBd = at('t2b', 'birthday'), tHalf = at('t3b', '漏了'), tTx = at('t4', '整体'), tCm = at('t5', '提交'), tRb = at('t5b', '撤销');
  keyed(rU).at(t31, { html: '1' + sp(4) + 'alice' + sp(5) + hv('31') }).at(tRb, { html: '1' + sp(4) + 'alice' + sp(5) + '30' });
  keyed(rN).at(tBd, { html: '1' + sp(4) + hv('birthday') }).at(tHalf, { html: '1' + sp(4) + 'hello' }).at(tCm, { html: '1' + sp(4) + hv('birthday') }).at(tRb, { html: '1' + sp(4) + 'hello' });
  keyed(rU).at(tCm, { html: '1' + sp(4) + 'alice' + sp(5) + hv('31') });
  // 读到表名时，那张表的这一行用标志蓝标出（此刻讲到的东西），下一句开始时撤掉（浅色面板入场在低清预演里几乎测不出变化）
  keyed(rU).at(at('t1', 'users'), { cls: 'row on' }).at(at('t1', 'notes'), { cls: 'row' });
  keyed(rN).at(at('t1', 'notes'), { cls: 'row on' }).at(at('t2'), { cls: 'row' });
  keyed(rU).at(at('t2') + 0.1, { cls: 'row dk' }).at(t31, { cls: 'row' }); keyed(rN).at(at('t2b') + 0.1, { cls: 'row dk' }).at(tBd, { cls: 'row' });   // 正要改的那一行先压暗（类名交给 keyed 管）
  sfx('pop', t31, { g: 0.55, p: -0.4 }); sfx('pop', tBd, { g: 0.55, p: 0.4 });
  // 两处修改各是一条 UPDATE
  const qU = sql(world, 120, 480, 760, 'UPDATE users SET age=31 WHERE id=1'), qN = sql(world, 1030, 480, 780, "UPDATE notes SET body='birthday' WHERE id=1");
  css(qU, { fontSize: '28px' }); css(qN, { fontSize: '28px' });
  fin(qU, at('t2') + 0.1, { y: 0, d: 0.2 }); typeSql(qU, at('t2') + 0.2, 40); fin(qN, at('t2b') + 0.1, { y: 0, d: 0.2 }); typeSql(qN, at('t2b') + 0.2, 40);
  out(qU, tCm - 0.3); out(qN, tCm - 0.3);
  const link = gring(g, 120, 276, 1680, 96, { color: 'blue', w: 4, name: 'together' }); link.setAttribute('stroke-dasharray', '14 10');
  drawIn(link, at('t3', '一起') - 0.2, 0.6, { dash: '14 10' });
  // 漏了一处：那一侧的框与「一起」的虚线框转成橙色
  classAt(PN.el, 'warn', tHalf, tTx); F((t) => link.setAttribute('stroke', t >= tHalf && t < tTx ? C.or : C.blue));
  const half = tag(world, 1340, 402, '漏了一处 · 停在一半', 'or'); pop(half, tHalf + 0.1); sfx('error', tHalf, { g: 0.45 });
  out(half, tTx - 0.1);
  const ring = gring(g, 100, 260, 1720, 128, { color: 'blue', w: 7, name: 'transaction' });
  drawIn(ring, tTx - 0.15, 0.5); sfx('thud', tTx, { g: 0.55 });
  const tl1 = tag(world, 120, 402, '事务：一组修改，当成一个整体', 'blue'); pop(tl1, tTx + 0.2);
  const CM = panel(world, 96, 540, 820, 330, null, { cls: 'hot', name: 'commit' }), RB = panel(world, 1004, 540, 820, 330, null, { name: 'rollback' });
  const cmA = txt(world, 't-2 blue', '提交', 140, 570), cmB = txt(world, 'mono t-s dim', 'COMMIT', 146, 660), cmC = txt(world, 't-4', '全部完成：31 · birthday', 140, 740);
  const rbA = txt(world, 't-2', '回滚', 1048, 570), rbB = txt(world, 'mono t-s dim', 'ROLLBACK', 1054, 660), rbC = txt(world, 't-4', '全部撤销：30 · hello', 1048, 740);
  showPanel(CM, tCm - 0.2); pop(cmA, tCm, { from: 0.8, origin: '0 50%' }); fin(cmB, tCm + 0.2); fin(cmC, tCm + 0.4); sfx('chime', tCm, { g: 0.4 });
  showPanel(RB, at('t5b') + 0.1); pop(rbA, at('t5b', '回滚') - 0.1, { from: 0.8, origin: '0 50%' }); fin(rbB, at('t5b', '回滚') + 0.1); fin(rbC, tRb); sfx('pop', tRb, { g: 0.5 });

  // ── 站 B：MyISAM 表 ──
  const PM = panel(world, XB + 96, 140, 1728, 740, 'MyISAM 表 · users_myisam', { name: 'myisam-control' });
  const q = [sql(world, XB + 150, 230, 900, 'START TRANSACTION;'), sql(world, XB + 150, 310, 1100, 'UPDATE users_myisam SET age=31 WHERE id=1;'), sql(world, XB + 150, 390, 900, 'ROLLBACK;'), sql(world, XB + 150, 560, 1100, 'SELECT age FROM users_myisam WHERE id=1;')];
  const tB = at('t6');
  showPanel(PM, tB - 0.3); q.forEach((e) => fin(e, tB - 0.2, { y: 0, d: 0.2 }));
  let te = typeSql(q[0], tB, 34); te = typeSql(q[1], te + 0.1, 46); typeSql(q[2], Math.max(te + 0.1, at('t6', '回滚') - 0.3), 30);
  const w1 = txt(world, 'out', 'Warning 1196', XB + 156, 470), w2 = txt(world, 'out dim', "Some non-transactional changed tables couldn't be rolled back", XB + 410, 470);
  css(w2, { color: C.dim, fontSize: '28px', top: '474px' });
  typeSql(q[3], at('t7') - 0.2, 60);
  const v31 = txt(world, 'mono', '31', XB + 156, 640); css(v31, { font: '800 72px/1 "Mono"', color: C.ink, background: C.or, borderRadius: '12px', padding: '6px 18px' });
  pop(v31, at('t7', '31')); sfx('blip', at('t7', '31'), { g: 0.6 });
  fin(w1, at('t7', '一一九六') - 0.1); fin(w2, at('t7', '一一九六')); sfx('error', at('t7', '一一九六'), { g: 0.5 });
  const nb = txt(world, 't-3', 'MyISAM：修改撤不回来', XB + 156, 770); fin(nb, at('t7b', '撤不回来') - 0.2);

  // ── 站 C：Gray 1981 ──
  const card = litCard(world, XC + 96, 140, 900, { year: '1981', title: 'The Transaction Concept: Virtues and Limitations', meta: 'Jim Gray · Tandem Computers · VLDB 1981', h: 440, titleH: 120 });
  showCard(card, at('t8') - 0.4);
  const QP = panel(world, XC + 1040, 140, 784, 740, '摘要原文', { name: 'abstract' });
  const qt = txt(world, 'quote', 'A transaction is a <span class="k0">transformation of state</span> which has the properties of <span class="k1">atomicity (all or nothing)</span>, <span class="k2">durability (effects survive failures)</span> and <span class="k3">consistency (a correct transformation)</span>.', XC + 1080, 220);
  css(qt, { width: '700px' });
  showPanel(QP, at('t9') - 0.4); fin(qt, at('t9'), { y: 10 });
  classAt(qt.querySelector('.k0'), 'hl', at('t9', '状态变换') - 0.1, at('t9b'));
  const props = [['原子性', 'k1'], ['持久性', 'k2'], ['一致性', 'k3']].map(([w, k], i) => {
    const e = tag(world, XC + 140 + i * 280, 640, w, 'blue'); css(e, { fontSize: '40px', padding: '12px 22px' });
    const tt = at('t9b', w); pop(e, tt - 0.05); classAt(qt.querySelector('.' + k), 'hl', tt - 0.05, at('q1')); sfx('pop', tt, { g: 0.45, p: -0.3 + i * 0.3 });
    return e;
  });

  // ── 站 D：ACID ──
  const letters = ['A', 'C', 'I', 'D'];
  const defs = [['q2', '原子性', '提交时全部生效，回滚时全部撤销'], ['q3', '一致性', '几张表同时修改，只见全旧或全新'], ['q4', '隔离性', '互不干扰，看不到对方未提交的数据'], ['q5', '持久性', '提交成功之后，不怕崩溃与断电（手册）']];
  const tI = at('q1', '隔离性');
  const tilesL = letters.map((L_, i) => {
    const x = XD + 96 + i * 440;
    const t_ = tile(world, x, 150, 400, 230, i === 2 ? 'blue' : 't4');
    const l = txt(world, '', L_, x + 40, 166); css(l, { font: '800 170px/1 "Open Sans"', color: '#fff' });
    const [id, nm, df] = defs[i];
    const n = txt(world, 't-3', nm, x + 4, 410), d = txt(world, 't-n dim wrap', df, x + 6, 480); css(d, { width: '390px' });
    const tIn = i === 2 ? tI : at('q1') - 0.2 + [0, 0.12, 0, 0.24][i];
    pop(t_, tIn); pop(l, tIn + 0.1); sfx(i === 2 ? 'chime' : 'pop', tIn, { g: 0.45, p: -0.5 + i * 0.33 });
    const tt = at(id) + 0.1;
    const idB = L.cues[id + 'b'] ? id + 'b' : id;
    fin(n, tt); fin(d, idB !== id ? at(idB) - 0.1 : tt + 0.8); sfx('tick', tt, { g: 0.35, p: -0.3 + i * 0.2 });
    tl.fromTo(t_, { y: 0 }, { y: -14, duration: 0.3, ease: 'power2.out', immediateRender: false }, tt);
    tl.fromTo(t_, { y: -14 }, { y: 0, duration: 0.4, ease: 'power2.inOut', immediateRender: false }, Q(Tend(idB)));
    return t_;
  });
  const src = txt(world, 't-s dim', '释义：MySQL 9.7 参考手册术语表「ACID」', XD + 100, 820); fin(src, at('q2') + 1.2);

  // ── 站 E：1998 年图灵奖 ──
  const tc = litCard(world, XE + 96, 140, 1728, { year: '1998', title: 'ACM A.M. Turing Award · Jim Gray', meta: '“For seminal contributions to database and transaction processing research and technical leadership in system implementation.”', h: 560, titleH: 80 });
  css(tc.me, { fontSize: '38px', color: C.ink, lineHeight: '1.38' });
  showCard(tc, at('q7') - 0.2);
  classAt(tc.yr, 'blue', at('q7', '图灵奖'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('t6') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('t8') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('q1') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
    [at('q7') - 0.6, { x: XE + 960 }, 1.1, { g: 0.4 }],
  ]);
});
