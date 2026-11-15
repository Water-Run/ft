// 第 09 章 同时读写：Bob 的慢查询（3.2 秒）拿到快照 → 一秒后 Carol 注册、再一秒后改年龄 → Bob 仍读旧片段 → 写入不挡读取 → 片段整个出现或不出现 → 事务默认没有
scene('concur', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC] = [0, 1, 2].map(() => groupAt(world));

  // 轴：画面里的时间 → 实验里的秒（0 秒 = 查询开始，1 秒 = Carol 注册，2 秒 = Carol 改年龄，3.2 秒 = Bob 读完）
  const P = [[T('b2'), 0], [T('b3', '一秒后'), 1], [T('b4', '又过一秒'), 2], [T('b6', '下一次'), 3.2]];
  const tau = (t) => { if (t <= P[0][0]) return 0; for (let i = 1; i < P.length; i++) if (t <= P[i][0]) return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P[P.length - 1][1]; };
  const XA = (sec) => 200 + 400 * sec;

  appear(gA, c0 + 0.05);
  const lane = mk(gA, 'panel', 80, 118, 1800, 474); vanish(lane, 0); appear(lane, c0 + 0.1);
  [0, 1, 2, 3].forEach((k) => { const tk = mk(gA, 'fn', XA(k) - 18, 128, null, null, k + ' s'); css(tk, { fontSize: '22px' }); appear(tk, c0 + 0.2); const ln = mk(gA, 'tick', XA(k), 230, null, 366); css(ln, { background: 'var(--k3)' }); appear(ln, c0 + 0.2); });
  // Bob
  const bl = mk(gA, 'lab y', 100, 188, null, null, icoSvg('person', 30, 3.4) + '<span style="margin-left:10px">Bob 的慢查询</span>'); css(bl, { fontSize: '26px', display: 'flex', alignItems: 'center' }); wipe(bl, c0 + 0.2, { dir: 'l', d: 0.6 });
  const bGhost = mk(gA, 'bar', XA(0), 232, 1280, 56); css(bGhost, { background: 'var(--k2)', border: '2px dashed var(--g2)' }); wipe(bGhost, T('b1') + 0.1, { dir: 'l', d: 0.8 });
  const bBar = mk(gA, 'bar y', XA(0), 232, 1, 56); vanish(bBar, 0);
  F((t) => { const k = tau(t); bBar.style.width = Math.max(1, 400 * k) + 'px'; bBar.style.visibility = t >= P[0][0] ? 'visible' : 'hidden'; bBar.style.opacity = t >= P[0][0] ? 1 : 0; });
  ['SELECT count(), avg(age) FROM users', ' WHERE NOT ignore(sipHash128(name))', ' SETTINGS max_threads = 1'].forEach((ln, k) => { const e = mk(gA, 'mono', 1000, 420 + k * 40, null, null, ln); css(e, { fontSize: '28px', color: 'var(--g3)' }); vanish(e, 0); wipe(e, T('b1') + 0.3 + k * 1.0, { dir: 'l', d: 0.9 }); vanish(e, T('b4') - 0.3); if (k === 2) classAt(e, 'y', T('b1b', '一个线程') - 0.2); if (k === 1) classAt(e, 'y', T('b1', '一个个') - 0.2, T('b1b') - 0.1); });
  // 一亿个名字一个个过：名字从右边流进 Bob 的条（一条道，一个接一个）
  const NMQ = ['User00001-…', 'User00002-…', 'User00003-…', 'User00004-…'];
  const nmq = NMQ.map((n) => { const c = mk(gA, 'chip', 0, 330, null, null, n); css(c, { fontSize: '22px', height: '40px' }); c.style.visibility = 'hidden'; return c; });
  const q0 = T('b1', '一亿个名字') - 0.2, q1 = T('b3') - 0.3;
  F((t) => nmq.forEach((c, i) => { const ph = ((t - q0) * 0.45 + 1 - i / 4) % 1; const on = t >= q0 + i * 0.55 && t < q1; c.style.visibility = on ? 'visible' : 'hidden'; if (on) c.style.left = (1100 - ph * 900).toFixed(1) + 'px'; }));
  sfx('thud', T('b1', '一亿个名字'), { g: 0.45 });
  sfx('thud', T('b1b', '一个线程') + 0.1, { g: 0.5 });
  const b32 = mk(gA, 'big y', XA(3.2) + 20, 218, null, null, '3.2 s'); css(b32, { fontSize: '80px' }); show(b32, T('b1b', '三秒多'), { y: 12 }); sfx('thud', T('b1b', '三秒多') + 0.1, { g: 0.5 });
  // 快照
  const lp = foldAt(gA, 100, 596, 800, 290, 'Bob 的快照（查询开始那一刻）', 'y'); vanish(lp, 0); appear(lp, T('b2b', '快照') - 0.6);
  tableTag(gA, '表 <b>demo.users</b> · 一亿行', c0 + 0.1);
  const SN = [fileAt(lp, 0, 'all_1_91_4_93', 'y')]; SN.forEach((e, i) => { vanish(e, 0); appear(e, T('b2b', '快照') - 0.4 + i * 0.25); sfx('tick', T('b2b', '快照') - 0.4 + i * 0.25, { g: 0.4 }); });
  const g1 = glossAt(gA, 100, 900, 1720, '快照', '<b>快照</b>　查询开始那一刻，活动片段的清单'); show(g1, T('b2b') + 0.2, { y: 10, d: 0.35 }); vanish(g1, T('b5b') - 0.1);
  // 磁盘上现在的片段
  const rp = foldAt(gA, 1000, 596, 820, 290, '磁盘上现在的片段', ''); wipe(rp, T('b2') - 0.2, { dir: 'l', d: 0.5 });
  const R0 = fileAt(rp, 0, 'all_1_91_4_93', ''), R1 = R0;
  const R2 = fileAt(rp, 1, 'all_94_94_0　← Carol 的新片段', 'y'); vanish(R2, 0); appear(R2, T('b3', '新片段')); sfx('pop', T('b3', '新片段'), { g: 0.5 });
  const R3 = fileAt(rp, 2, 'all_1_91_4_95　← 新版本', 'y'), R4 = fileAt(rp, 3, 'all_94_94_0_95　← 新版本', 'y');
  [R3, R4].forEach((e, i) => { vanish(e, 0); appear(e, T('b4', '新版本') + i * 0.25); sfx('pop', T('b4', '新版本') + i * 0.25, { g: 0.4 }); });
  [R0, R2].forEach((e) => classAt(e, 'inact', T('b4', '新版本') + 0.9));
  // Carol：注册、改年龄
  const cl1 = mk(gA, 'lab', 100, 300, null, null, 'Carol：注册（写入）'); css(cl1, { fontSize: '26px' }); vanish(cl1, 0); appear(cl1, T('b3') - 0.1);
  const c1 = mk(gA, 'bar y', XA(1), 342, 14, 56); wipe(c1, T('b3', '新片段') - 0.2, { dir: 'l', d: 0.2 }); const c1l = mk(gA, 'big y', XA(1) + 34, 330, null, null, '4 ms'); css(c1l, { fontSize: '64px' }); show(c1l, T('b3', '几毫秒'), { y: 10 });
  const m1 = mk(gA, 'tick y', XA(1), 230, null, 366); vanish(m1, 0); appear(m1, T('b3', '一秒后'));
  const cl2 = mk(gA, 'lab', 100, 420, null, null, 'Carol：改自己的年龄（变更）'); css(cl2, { fontSize: '26px' }); vanish(cl2, 0); appear(cl2, T('b4') - 0.1);
  const c2 = mk(gA, 'bar y', XA(2), 462, 14, 56); wipe(c2, T('b4', '新版本') - 0.4, { dir: 'l', d: 0.2 }); const c2l = mk(gA, 'big y', XA(2) + 34, 450, null, null, '5 ms'); css(c2l, { fontSize: '64px' }); show(c2l, T('b4', '新版本') - 0.3, { y: 10 });
  const m2 = mk(gA, 'tick y', XA(2), 230, null, 366); vanish(m2, 0); appear(m2, T('b4', '又过一秒'));
  // Bob 不知道：仍读旧片段
  const ovA = overlay(gA);
  const ub = path(ovA, `M ${XA(2.3)} 290 C ${XA(2.3)} 520 640 560 560 660`, 'accent', { w: 4, dashed: '10 10' }); vanish(ub, 0); arrowIn(ub, T('b5', '旧片段') - 0.3, 0.6);
  const ubI = ico(gA, 'search', 570, 640, 52, 'y', 3.6); vanish(ubI, 0); appear(ubI, T('b5', '旧片段'));
  classAt(R0, 'y', T('b5b', '还被他用着') - 0.2, T('b6') - 0.1);
  const ppl = (x, t, withC, lab) => {
    const l = mk(gA, 'lab', x, 908, null, null, lab); css(l, { fontSize: '24px' }); vanish(l, 0); appear(l, t);
    for (let i = 0; i < 6; i++) { const pI = ico(gA, 'person', x + 130 + i * 52, 896, 46, 'w', 3.4); vanish(pI, 0); appear(pI, t + i * 0.04); }
    const cI = ico(gA, 'person', x + 130 + 6 * 52, 896, 46, withC ? 'y' : '', 3.4); vanish(cI, 0); appear(cI, t + 0.3); if (!withC) css(cI, { opacity: 0.35 });
    const cL = mk(gA, withC ? 'lab y' : 'lab', x + 130 + 7 * 52 + 6, 908, null, null, withC ? '有 Carol' : '没有 Carol'); css(cL, { fontSize: '24px' }); vanish(cL, 0); appear(cL, t + 0.35);
  };
  ppl(100, T('b6', '没有') - 0.2, false, '这一次'); ppl(1000, T('b6', '下一次'), true, '下一次'); sfx('chime', T('b6', '下一次') + 0.1, { g: 0.5 });
  hide(ub, T('b6') - 0.1, { y: 0, d: 0.3 }); hide(ubI, T('b6') - 0.1, { y: 0, d: 0.3 }); vanish(g1, T('b6') - 0.3);
  const tAB = T('b8') + 1.0;
  vanish(gA, tAB);

  // ── B 片段要么整个出现，要么不出现 ──
  appear(gB, tAB);
  const f1 = foldAt(gB, 100, 230, 760, 340, 'all_94_94_0', 'y'); wipe(f1, tAB, { dir: 'l', d: 0.4 }); ['id.bin', 'name.bin', 'age.bin', '…'].forEach((t, i) => fileAt(f1, i, t));
  const f2 = foldAt(gB, 1060, 230, 760, 340, 'tmp_insert_…', 'ghost'); appear(f2, Math.max(T('b8', '不出现') - 0.6, tAB + 0.3)); ['id.bin', 'name.bin'].forEach((t, i) => fileAt(f2, i, t));
  const ok = ico(gB, 'check', 380, 600, 120, 'y', 4); const okL = mk(gB, 'lab y', 520, 640, null, null, '看得见'); vanish(okL, 0); appear(okL, Math.max(T('b8', '整个出现'), tAB + 0.2) + 0.1); slam(ok, Math.max(T('b8', '整个出现'), tAB + 0.2), { from: 1.2 }); sfx('thud', Math.max(T('b8', '整个出现'), tAB + 0.2) + 0.1, { g: 0.5 });
  const no = ico(gB, 'cross', 1340, 600, 120, 'w', 4); const noL = mk(gB, 'lab', 1480, 640, null, null, '看不见'); vanish(noL, 0); appear(noL, T('b8', '不出现') + 0.1); slam(no, T('b8', '不出现'), { from: 1.2 }); sfx('thud', T('b8', '不出现') + 0.1, { g: 0.5 });
  const sn = mk(gB, 'lab', 1060, 760, null, null, '写到一半的片段'); appear(sn, Math.max(T('b8', '不出现') - 0.3, tAB + 0.4));
  const tBC = T('b9') + 1.6;
  vanish(gB, tBC);

  // ── C 事务：默认没有 ──
  appear(gC, tBC);
  const tm = termAt(gC, 100, 230, 1720, 200);
  tm.line(0, '<span class="pr">:) </span>BEGIN TRANSACTION;', T('b9', '事务') - 0.1, { type: 22, cursorUntil: T('b9', '默认') });
  tm.line(1, '<span class="err">Code: 48. DB::Exception: Transactions are not supported. (NOT_IMPLEMENTED)</span>', T('b9', '默认'), {});
  sfx('thud', T('b9', '默认') + 0.05, { g: 0.5 });
  const tg = T('b9', '一起成败') - 0.4, grp = mk(gC, '', 100, 500, 1060, 200); css(grp, { border: '3px dashed var(--y)' }); vanish(grp, 0); wipe(grp, tg, { dir: 'l', d: 0.5 });
  ['INSERT INTO orders VALUES (…);', 'UPDATE users SET … WHERE id = 3;'].forEach((ln, k) => { const e = mk(gC, 'mono', 140, 540 + k * 70, null, null, ln); css(e, { fontSize: '36px' }); vanish(e, 0); wipe(e, tg + 0.3 + k * 0.4, { dir: 'l', d: 0.5 }); });
  const br = mk(gC, 'h1 y', 1180, 470, null, null, '}'); css(br, { fontSize: '220px', fontWeight: '300' }); vanish(br, 0); appear(br, tg + 1.0);
  const brl = mk(gC, 'tag', 1300, 560, null, null, '一个事务'); css(brl, { fontSize: '56px' }); slam(brl, tg + 1.1, { from: 1.2 }); sfx('pop', tg + 1.1, { g: 0.5 });
  for (const e of [grp, br, brl]) classAt(e, 'fade45', T('b9', '默认') + 0.1);
  drift(cam, s, 1);
});
