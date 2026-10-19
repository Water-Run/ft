// 第 04 章：改一行，发生了什么。站 A：同一页上，旧版本留在第 1 项（xmax、t_ctid 取自实测），新版本写到第 9 项；
// 站 B：InnoDB 的 undo 与 PostgreSQL 的堆内旧版本；站 C：HOT——索引仍指第 1 项，页内跳到第 9 项；改名字则要写新的索引项。
scene('modify', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 9000, 1100);
  const U = SNAP.uncommitted, r1 = U.rows[0], r9 = U.rows[8];
  const SX = { A: 960, B: 2960, C: 4960 };

  // ── 站 A ──
  const q = psql(world, 160, 150, [''], { w: 1600 });
  const PX = 110, PY = 520;
  const pf = pageFig(world, g, PX, PY, { slots: 9, lpShown: 9, tupShown: 9, w: 1700, rows: U.rows, snap: U });
  const nine = [pf.lps[8].e, pf.lps[8].l, pf.tups[8].e];
  const t1 = pf.tups[0], t9 = pf.tups[8];
  const keep = tag(world, t1.x - 160, PY + 170, '30 原样保留', 'grey');
  const newT = tag(world, t9.x - 80, PY + 170, '新版本 31', 'fill');
  const hdr1 = txt(world, 'mono t-s', `第 1 项 · xmin ${r1.xmin} · xmax ${r1.xmax} · → (0,9)`, PX + 1000, PY + 250);
  const hdr9 = txt(world, 'mono t-s', `第 9 项 · xmin ${r9.xmin}`, PX + 1000, PY + 300);
  const link = gline(g, `M${t1.x},${PY + 132} C${t1.x},${PY + 210} ${t9.x},${PY + 210} ${t9.x},${PY + 132}`, 'pg', { w: 4, arrow: true, name: '旧版本指向新版本' });
  const two = tag(world, PX + 160, PY + 230, '同一条记录 · 两个版本', 'fill'); css(two, { fontSize: '36px', padding: '14px 24px' });
  tl.fromTo(q.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: true }, c0 + 0.1);
  typeText(q.rows[0], PR + 'UPDATE users SET age = 31 WHERE id = 1;', T('u1'), 32, { cursor: false, sfxGain: 0.3 });
  // 页先整体出现（第 9 项除外）
  [pf.fr, pf.hd, pf.hdl, pf.free].forEach((e) => fin(e, c0 + 0.3, { y: 0 })); vanish(pf.fl, 0);
  Object.values(pf.ticks).forEach((tk) => { fin(tk.l, c0 + 0.4, { y: 0 }); fin(tk.m, c0 + 0.4, { y: 0 }); });
  pf.lps.slice(0, 8).forEach((lp) => { fin(lp.e, c0 + 0.4, { y: 0 }); fin(lp.l, c0 + 0.4, { y: 0 }); });
  pf.tups.slice(0, 8).forEach((tp) => fin(tp.e, c0 + 0.4, { y: 0 }));
  css(pf.free, { left: (PX + PG_W.head + 9 * PG_W.lp + 10) + 'px', width: (1700 - PG_W.head - 9 * PG_W.lp - 9 * PG_W.tup - 20) + 'px' });
  css(pf.fl, { left: (PX + PG_W.head + 9 * PG_W.lp + 30) + 'px' });
  tl.fromTo(t1.e, { borderColor: '#336791' }, { borderColor: '#193145', duration: 0.3, immediateRender: false }, T('u2'));
  fin(keep, T('u2') + 0.4);
  fin(pf.lps[8].e, T('u3') + 0.2, { y: -16 }); fin(pf.lps[8].l, T('u3') + 0.2, { y: 0 }); fin(t9.e, T('u3') + 0.4, { y: 16 }); sfx('pop', T('u3') + 0.4);
  fin(newT, T('u4') - 0.1);
  fin(hdr1, T('u5') + 0.1, { y: 0 }); drawIn(link, T('u5') + 0.5, 0.8); fin(hdr9, T('u5') + 0.7, { y: 0 });
  tl.fromTo(t1.e, { backgroundColor: '#e0ecef' }, { backgroundColor: '#f3f5f9', duration: 0.4, immediateRender: false }, T('u6'));
  pop(two, T('u6') + 0.3); sfx('thud', T('u6') + 0.3, { g: 0.4 });

  // ── 站 B：旧值放在哪 ──
  const bHead = heading(world, SX.B - 800, 140, 1600, '旧值放在哪');
  const lx = SX.B - 800, rx = SX.B + 80;
  const inT = txt(world, 't-3 grey', 'InnoDB', lx, 260); css(inT, { fontFamily: '"Open Sans"', fontWeight: 700 });
  const inRow = blk(world, lx, 340, 720, 120, 'grey', 'InnoDB 记录'); txt(inRow, 'lbl g', '1 │ alice │ 31', 30, 34);
  const inUndo = blk(world, lx + 120, 560, 600, 120, 'dash', 'undo 信息'); css(inUndo, { borderColor: 'var(--grey)' }); txt(inUndo, 'lbl g', 'undo 信息：年龄曾是 30', 30, 34);
  const inA = gline(g, `M${lx + 60},460 L${lx + 60},620 L${lx + 112},620`, 'grey', { w: 4, arrow: true });
  const inN = txt(world, 't-4', '需要时，再拼回旧的样子', lx, 720);
  const pgT = txt(world, 't-3 pg', 'PostgreSQL', rx, 260); css(pgT, { fontFamily: '"Open Sans"', fontWeight: 700 });
  const pgOld = blk(world, rx, 340, 340, 120, 'wash', '旧版本'); txt(pgOld, 'lbl', '第 1 项 · 30', 26, 34);
  const pgNew = blk(world, rx + 380, 340, 340, 120, 'fill', '新版本'); txt(pgNew, 'lbl w', '第 9 项 · 31', 26, 34);
  const pgN = txt(world, 't-4', '两个版本都在堆里', rx, 500);
  showHeading(bHead, T('u7') - 0.4);
  fin(inT, T('u7') - 0.1); fin(inRow, T('u7') + 0.1, { y: 0 }); drawIn(inA, T('u7', 'un') - 0.1, 0.5); fin(inUndo, T('u7', 'un'), { y: 0 });
  fin(inN, T('u8') + 0.1);
  fin(pgT, T('u9') - 0.1); fin(pgOld, T('u9') + 0.2, { y: 0 }); fin(pgNew, T('u9') + 0.5, { y: 0 }); fin(pgN, T('u9') + 1.0);
  sfx('tick', T('u7', 'un')); sfx('tick', T('u9') + 0.5);

  // ── 站 C：HOT ──
  const CX = SX.C;
  const cHead = heading(world, CX - 800, 140, 1600, '索引要不要跟着改');
  const ix = CX - 800, iy = 300;
  const idx = blk(world, ix, iy, 360, 160, 'wash', '主键索引项'); txt(idx, 'lbl', '主键 1', 26, 22); const ip = txt(idx, 'lbl mono', '→ (0,1)', 26, 86); css(ip, { fontSize: '32px', fontWeight: 500, color: 'var(--ink2)' });
  const pgx = CX - 260, pgy = 300;
  const page = blk(world, pgx, pgy, 1060, 400, '', '堆页 0');
  const pageT = txt(world, 't-s', '堆页 0', pgx + 20, pgy - 44);
  const lp1 = blk(world, pgx + 40, pgy + 40, 90, 90, 'fill', '指针 1'); txt(lp1, 'lbl w', '1', 34, 22);
  const lp9 = blk(world, pgx + 40, pgy + 245, 90, 90, 'fill', '指针 9'); txt(lp9, 'lbl w', '9', 34, 22);
  const v1 = blk(world, pgx + 640, pgy + 40, 380, 120, 'wash', '旧版本 30'); txt(v1, 'lbl', '第 1 项 · 30', 26, 36); css(v1, { background: 'var(--mist)', borderColor: 'var(--pg-lt)' });
  const v9 = blk(world, pgx + 640, pgy + 230, 380, 120, 'fill', '新版本 31'); txt(v9, 'lbl w', '第 9 项 · 31', 26, 36);
  const aI = gline(g, `M${ix + 360},${iy + 80} L${pgx + 32},${pgy + 85}`, 'pg', { w: 5, arrow: true, name: '索引 → 指针 1' });
  const aP = gline(g, `M${pgx + 130},${pgy + 85} L${pgx + 632},${pgy + 95}`, 'lt', { w: 4, arrow: true });
  const a9 = gline(g, `M${pgx + 130},${pgy + 290} L${pgx + 632},${pgy + 290}`, 'line', { w: 3, dashed: '10 10' });
  const aH = gline(g, `M${pgx + 830},${pgy + 160} L${pgx + 830},${pgy + 222}`, 'pg', { w: 5, arrow: true, name: '页内跳到第 9 项' });
  const cond = adm(world, ix, 520, 520, 'note', '只改了年龄<br>年龄上没有索引<br>新行也在同一页', '条件');
  const hot = tag(world, pgx + 220, pgy + 150, 'HOT 更新', 'fill'); css(hot, { fontSize: '44px', padding: '16px 28px' });
  const nm = adm(world, ix, 820, 1600, 'caution', '改的是名字（名字上有索引）：要写一条新的索引项', '换一种情况');
  css(nm, { padding: '14px 26px 16px' });
  showHeading(cHead, T('u10') - 0.3);
  fin(idx, T('u10') + 0.1, { y: 0 }); fin(page, T('u10') + 0.1, { y: 0 }); fin(pageT, T('u10') + 0.2);
  [lp1, lp9, v1, v9].forEach((e, i) => fin(e, T('u10') + 0.3 + i * 0.08, { y: 0 })); drawIn(a9, T('u10') + 0.6, 0.4);
  drawIn(aI, T('u10') + 0.9, 0.6);
  fin(cond, T('u11') + 0.1);
  tl.fromTo(idx, { borderColor: '#336791' }, { borderColor: '#84c578', duration: 0.4, immediateRender: false }, T('u13'));
  drawIn(aP, T('u14') + 0.2, 0.6); drawIn(aH, T('u14', '跳') - 0.1, 0.5);
  sfx('tick', T('u14') + 0.2); sfx('pop', T('u14', '跳'));
  pop(hot, T('u15') + 0.2); sfx('thud', T('u15') + 0.2, { g: 0.45 });
  fin(nm, T('u16') + 0.1); sfx('tick', T('u17'));

  camTrack(cam, world, { t: s.start, v: { x: SX.A, y: 540, z: 1 } }, [
    [Tend('u6') + 0.9, { x: SX.B }, 1.1, { sfx: true }],
    [Tend('u9') + 0.9, { x: SX.C }, 1.1, { sfx: true }],
  ], { end: s.end });
});
