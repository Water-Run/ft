// 第 03 章：怎么找到一行。站 A：SQL 交给规划器，八行走顺序扫描、两万行走索引扫描（实测计划）；
// 站 B：索引项里的位置 (0,1) → 堆页第 1 项 → 可见性检查 → psql 回显；站 C：主键路径与 InnoDB 对照；站 D：二级索引与主键宽度。
scene('query', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 9000, 1100);
  const B = SNAP.before, rows = B.rows;
  const SX = { A: 960, B: 2960, C: 4960, D: 6960 };

  // ── 站 A：规划器 ──
  const q = psql(world, 160, 170, [''], { w: 1600 });
  const qText = 'SELECT name, age FROM users WHERE id = 1;';
  const pl = blk(world, 760, 400, 400, 150, 'fill', '规划器'); txt(pl, 'lbl w', '规划器', 128, 50);
  const plS = txt(world, 't-s', '依据统计信息估算代价', 790, 566);
  const p1 = blk(world, 160, 700, 680, 150, '', '顺序扫描'); const p1a = txt(p1, 'lbl', 'Seq Scan · 从头扫一遍', 30, 22); const p1b = txt(p1, 'lbl g', 'users · 8 行', 30, 82); css(p1b, { fontSize: '28px' });
  const p2 = blk(world, 1080, 700, 680, 150, '', '索引扫描'); const p2a = txt(p2, 'lbl', 'Index Scan · 走主键索引', 30, 22); const p2b = txt(p2, 'lbl g', '对照表 · 20000 行', 30, 82); css(p2b, { fontSize: '28px' });
  const e1 = gline(g, 'M900,550 L560,690', 'lt', { w: 4, arrow: true }), e2 = gline(g, 'M1020,550 L1360,690', 'lt', { w: 4, arrow: true });
  tl.fromTo(q.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: true }, c0 + 0.1);
  typeText(q.rows[0], PR + esc(qText), T('q1'), 34, { cursor: false, sfxGain: 0.3 });
  fin(pl, T('q2') + 0.1, { y: -20 }); fin(plS, T('q2') + 0.6);
  drawIn(e1, T('q3') - 0.2, 0.5); fin(p1, T('q3'), { y: 20 });
  tl.fromTo(p1, { backgroundColor: '#ffffff' }, { backgroundColor: '#e0ecef', duration: 0.4, immediateRender: false }, T('q3') + 1.2);
  drawIn(e2, T('q4') - 0.2, 0.5); fin(p2, T('q4'), { y: 20 });
  tl.fromTo(p2, { backgroundColor: '#ffffff' }, { backgroundColor: '#e0ecef', duration: 0.4, immediateRender: false }, T('q4') + 1.2);
  sfx('tick', T('q3')); sfx('tick', T('q4'));

  // ── 站 B：索引项 → 堆页第 1 项 → 可见 → 结果 ──
  const ix = SX.B - 820, iy = 170;
  const idx = blk(world, ix, iy, 420, 620, '', '主键索引');
  const idxT = txt(world, 't-3 pg', '主键索引', ix, iy - 70);
  const keys = rows.map((r, i) => {
    const row_ = blk(world, ix + 24, iy + 24 + i * 72, 372, 60, i === 0 ? 'wash' : '', '索引项 ' + r.id);
    css(row_, { borderWidth: '2px', borderColor: 'var(--line)' });
    const k = txt(row_, 'lbl num', String(r.id), 18, 8); const p_ = txt(row_, 'lbl mono', `(0,${r.lp})`, 150, 10); css(p_, { fontSize: '30px', color: 'var(--ink2)', fontWeight: 500 });
    return { row_, p_ };
  });
  const pos = tag(world, ix + 460, iy + 10, '第 0 页 · 第 1 项', 'fill'); css(pos, { fontSize: '40px', padding: '14px 24px' });
  const hpX = SX.B - 120, hpY = 380;
  const heapRows = rows.map((r, i) => {
    const b = blk(world, hpX + (i % 4) * 225, hpY + Math.floor(i / 4) * 130, 205, 110, 'wash', '堆页 第 ' + r.lp + ' 项');
    txt(b, 'lbl', `${r.lp} · ${r.name.trim()}`, 16, 12); const a_ = txt(b, 'lbl num', String(r.age), 16, 58); css(a_, { color: 'var(--ink)' });
    return b;
  });
  const hpT = txt(world, 't-3 pg', '堆页 0', hpX, hpY - 70);
  const arrow = gline(g, `M${ix + 396},${iy + 54} C${ix + 600},${iy + 54} ${hpX - 120},${hpY + 55} ${hpX - 6},${hpY + 55}`, 'pg', { w: 5, arrow: true, name: '按位置取行' });
  const okT = tag(world, hpX, hpY + 280, '可见性检查：通过', 'ok'); css(okT, { fontSize: '32px' });
  const res = psql(world, hpX + 300, hpY + 270, [' name  | age', '-------+-----', ' alice |  30', '<span class="c">(1 row)</span>'], { w: 400 });
  css(res.el, { fontSize: '30px', padding: '14px 22px' });
  fin(idx, T('q5') - 0.3, { y: 0 }); fin(idxT, T('q5') - 0.2);
  keys.forEach((k, i) => fin(k.row_, T('q5') - 0.2 + i * 0.05, { y: 0 }));
  tl.fromTo(keys[0].row_, { backgroundColor: '#e0ecef' }, { backgroundColor: '#336791', color: '#ffffff', duration: 0.3, immediateRender: false }, T('q5') + 0.6);
  tl.fromTo(keys[0].row_.children, { color: '#336791' }, { color: '#ffffff', duration: 0.3, immediateRender: false }, T('q5') + 0.6);
  pop(pos, T('q6') - 0.1); sfx('pop', T('q6'));
  fin(hpT, T('q7') - 0.4); heapRows.forEach((b, i) => fin(b, T('q7') - 0.4 + i * 0.04, { y: 0 }));
  drawIn(arrow, T('q7') + 0.2, 0.7);
  tl.fromTo(heapRows[0], { backgroundColor: '#e0ecef' }, { backgroundColor: '#336791', duration: 0.3, immediateRender: false }, T('q7') + 0.9);
  tl.fromTo(heapRows[0].children, { color: '#336791' }, { color: '#ffffff', duration: 0.3, immediateRender: false }, T('q7') + 0.9);
  fin(okT, T('q8') + 0.2); sfx('tick', T('q8') + 0.2);
  fin(res.el, T('q8a') - 0.2, { y: 0 }); sfx('chime', T('q8a'), { g: 0.4 });

  // ── 站 C：主键路径，对照 InnoDB ──
  const CX = SX.C;
  const cHead = heading(world, CX - 800, 140, 1600, '按主键找到一行');
  const lx = CX - 800, rx = CX + 80;
  const inT = txt(world, 't-3 grey', 'InnoDB', lx, 260); css(inT, { fontFamily: '"Open Sans"', fontWeight: 700 });
  const inLeaf = blk(world, lx, 340, 720, 130, 'grey', 'InnoDB 主键叶子');
  const inLeafT = txt(inLeaf, 'lbl g', '主键 1 │ alice │ 30', 30, 38);
  const inNote = txt(world, 't-4', '叶子里就是整行', lx, 500);
  const pgT = txt(world, 't-3 pg', 'PostgreSQL', rx, 260); css(pgT, { fontFamily: '"Open Sans"', fontWeight: 700 });
  const pgLeaf = blk(world, rx, 340, 340, 130, 'wash', 'PostgreSQL 索引项');
  const pgLeafT = txt(pgLeaf, 'lbl', '1 → (0,1)', 30, 38);
  const pgHeap = blk(world, rx + 420, 340, 300, 130, 'wash', '堆里的行'); const pgHeapT = txt(pgHeap, 'lbl', 'alice │ 30', 30, 38);
  const pgA = gline(g, `M${rx + 340},405 L${rx + 412},405`, 'pg', { w: 5, arrow: true });
  const pgNote = txt(world, 't-4', '索引只存位置，再去堆里取一次', rx, 500);
  showHeading(cHead, Tend('q8a') + 0.9);
  fin(inT, T('q9') + 0.2); fin(pgT, T('q9') + 0.5); sfx('tick', T('q10') + 0.1); sfx('tick', T('q12') + 0.1); sfx('pop', T('q13')); fin(inLeaf, T('q10') + 0.1, { y: 0 }); fin(inNote, T('q11') + 0.1);
   fin(pgLeaf, T('q12') + 0.1, { y: 0 }); drawIn(pgA, T('q12') + 0.8, 0.4); fin(pgHeap, T('q12') + 1.1, { x: -20, y: 0 }); fin(pgNote, T('q12') + 1.4);
  // 二级索引
  const sHead = txt(world, 't-3', '二级索引（名字）', CX - 800, 630);
  const sIn = blk(world, lx, 720, 720, 100, 'grey', 'InnoDB 二级索引项');
  const sInT = txt(sIn, 'lbl g', 'InnoDB：alice → 主键 1', 30, 28);
  const sPg = blk(world, lx, 850, 720, 100, 'wash', 'PostgreSQL 二级索引项');
  const sPgT = txt(sPg, 'lbl', 'PostgreSQL：alice → (0,1)', 30, 24);
  fin(sHead, T('q13'));
  fin(sIn, T('q14') - 0.1, { y: 0 });
  // 主键变长：InnoDB 二级索引项跟着变宽
  const wide = txt(sIn, 'lbl g', 'InnoDB：alice → 主键 3f2a…c9e1（很长）', 30, 28);
  tl.fromTo(wide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: true }, T('q14', '主') + 1.2);
  tl.fromTo(sInT, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T('q14', '主') + 1.2);
  tl.fromTo(sIn, { width: 720 }, { width: 1000, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T('q14', '主') + 1.2);
  fin(sPg, T('q16') - 0.1, { y: 0 });
  const fixed = tag(world, lx + 750, 876, '位置宽度固定', '');

  fin(fixed, T('q16') + 1.2);
  sfx('pop', T('q14', '主') + 1.2); sfx('tick', T('q16') + 1.2);
  // InnoDB 二级索引变宽时，把 PostgreSQL 的那一行往右让开

  camTrack(cam, world, { t: s.start, v: { x: SX.A, y: 540, z: 1 } }, [
    [Tend('q4') + 0.9, { x: SX.B }, 1.1, { sfx: true }],
    [Tend('q8a') + 0.9, { x: SX.C }, 1.1, { sfx: true }],
  ], { end: s.end });
});
