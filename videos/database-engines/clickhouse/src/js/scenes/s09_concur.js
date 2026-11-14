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
  const lane = mk(gA, 'panel', 80, 118, 1800, 474); vanish(lane, 0); appear(lane, c0 + 0.1); warm(lane, c0 + 0.2, T('b2'));
  [0, 1, 2, 3].forEach((k) => { const tk = mk(gA, 'fn', XA(k) - 18, 128, null, null, k + ' s'); css(tk, { fontSize: '22px' }); appear(tk, c0 + 0.2); const ln = mk(gA, 'tick', XA(k), 230, null, 366); css(ln, { background: 'var(--k3)' }); appear(ln, c0 + 0.2); });
  // Bob
  const bl = mk(gA, 'lab y', 100, 188, null, null, 'Bob：把一亿个名字，一个个算一遍（只用一个线程）'); css(bl, { fontSize: '26px' }); wipe(bl, c0 + 0.2, { dir: 'l', d: 0.6 });
  const bGhost = mk(gA, 'bar', XA(0), 232, 1280, 56); css(bGhost, { background: 'var(--k2)', border: '2px dashed var(--g2)' }); wipe(bGhost, T('b1') + 0.1, { dir: 'l', d: 0.8 });
  const bBar = mk(gA, 'bar y', XA(0), 232, 1, 56); vanish(bBar, 0);
  F((t) => { const k = tau(t); bBar.style.width = Math.max(1, 400 * k) + 'px'; bBar.style.visibility = t >= P[0][0] ? 'visible' : 'hidden'; bBar.style.opacity = t >= P[0][0] ? 1 : 0; });
  warm(bGhost, T('b1'), T('b2'), '#1F1F1C', '#414141');
  const bq = mk(gA, 'mono', 1000, 440, null, null, 'SELECT count(), avg(age) FROM users\n WHERE NOT ignore(sipHash128(name))\n SETTINGS max_threads = 1'); css(bq, { fontSize: '24px', color: 'var(--g3)', lineHeight: '1.45' }); vanish(bq, 0); show(bq, T('b1') + 0.6, { y: 8 }); vanish(bq, T('b4') - 0.3);
  const thr = mk(gA, 'badge', 1000, 330, null, null, '只用一个线程'); css(thr, { fontSize: '36px' }); slam(thr, T('b1b', '一个线程'), { from: 1.25 }); vanish(thr, T('b3', '一秒后') - 0.2); sfx('thud', T('b1b', '一个线程') + 0.1, { g: 0.5 });
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
  [R0, R2].forEach((e) => classAt(e, 'dead', T('b4', '新版本') + 0.9));
  // Carol：注册、改年龄
  const cl1 = mk(gA, 'lab', 100, 300, null, null, 'Carol：注册（写入）'); css(cl1, { fontSize: '26px' }); vanish(cl1, 0); appear(cl1, T('b3') - 0.1);
  const c1 = mk(gA, 'bar y', XA(1), 342, 14, 56); wipe(c1, T('b3', '新片段') - 0.2, { dir: 'l', d: 0.2 }); const c1l = mk(gA, 'big y', XA(1) + 34, 330, null, null, '4 ms'); css(c1l, { fontSize: '64px' }); show(c1l, T('b3', '几毫秒'), { y: 10 });
  const m1 = mk(gA, 'tick y', XA(1), 230, null, 366); vanish(m1, 0); appear(m1, T('b3', '一秒后'));
  const cl2 = mk(gA, 'lab', 100, 420, null, null, 'Carol：改自己的年龄（变更）'); css(cl2, { fontSize: '26px' }); vanish(cl2, 0); appear(cl2, T('b4') - 0.1);
  const c2 = mk(gA, 'bar y', XA(2), 462, 14, 56); wipe(c2, T('b4', '新版本') - 0.4, { dir: 'l', d: 0.2 }); const c2l = mk(gA, 'big y', XA(2) + 34, 450, null, null, '5 ms'); css(c2l, { fontSize: '64px' }); show(c2l, T('b4', '新版本') - 0.3, { y: 10 });
  const m2 = mk(gA, 'tick y', XA(2), 230, null, 366); vanish(m2, 0); appear(m2, T('b4', '又过一秒'));
  // Bob 不知道：仍读旧片段
  const ub = mk(gA, 'badge', 1440, 604, null, null, '旧片段还被他用着'); css(ub, { fontSize: '22px', padding: '6px 12px' }); show(ub, T('b5', '旧片段') - 0.2, { y: 10 });
  const ch1 = mk(gA, 'pill', 100, 900, 800, 52, 'Bob 这次算出的人数：不含 Carol'); css(ch1, { fontSize: '28px' }); show(ch1, T('b6', '没有') - 0.2, { y: 10 });
  const ch2 = mk(gA, 'pill y', 1000, 900, 820, 52, '下一次再查：有了 Carol'); css(ch2, { fontSize: '28px' }); show(ch2, T('b6', '下一次'), { y: 10 }); sfx('chime', T('b6', '下一次') + 0.1, { g: 0.5 });
  vanish(ub, T('b6') - 0.1);
  // b7：写入不挡着读取（压在两个面板上方的横幅）
  
  const t7 = mk(gA, 'tag', 1010, 524, null, null, '写入不挡着读取：谁也不用等谁'); css(t7, { fontSize: '32px', padding: '8px 20px' }); slam(t7, T('b7') - 0.1, { from: 1.2 }); sfx('thud', T('b7'), { g: 0.6 });
  const tAB = T('b8') + 1.0;
  vanish(gA, tAB);

  // ── B 片段要么整个出现，要么不出现 ──
  appear(gB, tAB);
  const f1 = foldAt(gB, 100, 230, 760, 340, 'all_94_94_0', 'y'); wipe(f1, tAB, { dir: 'l', d: 0.4 }); ['id.bin', 'name.bin', 'age.bin', '…'].forEach((t, i) => fileAt(f1, i, t));
  const f2 = foldAt(gB, 1060, 230, 760, 340, 'tmp_insert_…', 'ghost'); appear(f2, Math.max(T('b8', '不出现') - 0.6, tAB + 0.3)); ['id.bin', 'name.bin'].forEach((t, i) => fileAt(f2, i, t));
  const ok = mk(gB, 'tag', 100, 620, null, null, '整个出现'); css(ok, { fontSize: '72px' }); slam(ok, Math.max(T('b8', '整个出现'), tAB + 0.2), { from: 1.2 }); sfx('thud', Math.max(T('b8', '整个出现'), tAB + 0.2) + 0.1, { g: 0.5 });
  const no = mk(gB, 'tag o', 1060, 620, null, null, '不出现'); css(no, { fontSize: '72px' }); slam(no, T('b8', '不出现'), { from: 1.2 }); sfx('thud', T('b8', '不出现') + 0.1, { g: 0.5 });
  const sn = mk(gB, 'lab', 1060, 740, null, null, '写到一半的，别人看不见'); appear(sn, Math.max(T('b8', '不出现') - 0.3, tAB + 0.4));
  const tBC = T('b9') + 1.6;
  vanish(gB, tBC);

  // ── C 事务：默认没有 ──
  appear(gC, tBC);
  const tm = termAt(gC, 100, 230, 1720, 200);
  tm.line(0, '<span class="pr">:) </span>BEGIN TRANSACTION;', T('b9', '事务') - 0.1, { type: 22, cursorUntil: T('b9', '默认') });
  tm.line(1, '<span class="out">DB::Exception: Transactions are not supported</span>', T('b9', '默认'), {});
  sfx('thud', T('b9', '默认') + 0.05, { g: 0.5 });
  const tn = mk(gC, 'h1', 100, 520, null, null, '几条语句一起成败：得用事务'); css(tn, { fontSize: '72px' }); wipe(tn, T('b9', '一起成败') - 0.4, { dir: 'l', d: 0.7 });
  const tn2 = mk(gC, 'h1 y', 100, 650, null, null, '这个版本，默认没有打开'); css(tn2, { fontSize: '72px' }); wipe(tn2, T('b9', '默认') - 0.3, { dir: 'l', d: 0.6 });
  drift(cam, s, 1);
});
