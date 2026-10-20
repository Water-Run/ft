// 第 02 章：数据怎么放。站 A：psql 与八行数据；B：堆文件与主键索引两个文件；C：一页 8192 字节（手册「页布局」画法，
// 刻度与指针数取自实测页）；D：一个行版本的行头与字段（事务号取自实测）。
scene('storage', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 9000, 1100);
  const B = SNAP.before, rows = B.rows;
  const SX = { A: 960, B: 2960, C: 5160, D: 7560 };

  // ── 站 A ──
  const ps = psql(world, 140, 150, [PR + 'SELECT version();', '<span class="o"> PostgreSQL 18.4 …</span>'], { w: 760 });
  const ut = dtable(world, 1000, 150, ['id', 'name', 'age'], rows.map((r) => [r.id, r.name.trim(), r.age]), { num: [0, 2] });
  const un = txt(world, 't-s', 'users · 8 行', 1000, 104);
  fin(ps.el, c0 + 0.1, { y: 0 }); appear(ps.rows[1], T('d0') + 0.9); sfx('blip', T('d0') + 0.9);
  tl.fromTo(ps.rows[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, c0 + 0.1);
  showTable(ut, T('d0') + 1.6, 0.1); fin(un, T('d0') + 1.8);

  // ── 站 B：堆文件与主键索引 ──
  const hx = SX.B - 820, hy = 200;
  const heap = blk(world, hx, hy, 820, 560, '', '堆文件');
  const heapT = txt(world, 't-2', '堆', hx, hy - 100);
  const heapS = txt(world, 't-s', 'users 的主文件 · 8192 字节', hx + 120, hy - 70);
  const order = [0, 1, 2, 3, 4, 5, 6, 7];
  const slots = order.map((ri, i) => {
    const r = rows[ri];
    const b = blk(world, hx + 40 + (i % 3) * 252, hy + 40 + Math.floor(i / 3) * 170, 232, 140, 'wash', '行 ' + r.id);
    const t_ = txt(b, 'lbl', `${r.id} · ${r.name.trim()}`, 18, 16); css(t_, { fontSize: '30px' });
    const a_ = txt(b, 'lbl num', String(r.age), 18, 70); css(a_, { fontSize: '30px', color: 'var(--ink)' });
    return b;
  });
  const hole = blk(world, hx + 40 + 2 * 252, hy + 40 + 2 * 170, 232, 140, 'dash', '空位'); css(hole, { borderColor: 'var(--grey-lt)' });
  const holeT = txt(hole, 'lbl g', '空位', 70, 44);
  const heapNote = tag(world, hx, hy + 600, '哪里有空位，就放在哪里', '');
  const ix = SX.B + 160, iy = 200;
  const idx = blk(world, ix, iy, 640, 560, '', '主键索引文件');
  const idxT = txt(world, 't-2', '主键索引', ix, iy - 100);
  const idxS = txt(world, 't-s', 'users_pkey · 另一个文件', ix + 270, iy - 70);
  const keys = rows.map((r, i) => { const k = txt(world, 'num t-4', `${r.id}`, ix + 40, iy + 30 + i * 64); css(k, { color: 'var(--pg)', fontWeight: 700 }); const p_ = txt(world, 'mono t-s', `→ (0,${r.lp})`, ix + 110, iy + 36 + i * 64); return [k, p_]; });
  const myi = adm(world, ix, iy + 590, 640, 'note', 'MyISAM 同样分开放', '对照');
  fin(heap, Tend('d1') + 0.9, { y: 0 }); fin(heapT, T('d2', '叫')); fin(heapS, T('d2', '叫') + 0.2);
  slots.forEach((b, i) => fin(b, T('d2') + 0.3 + i * 0.12, { x: -40, y: 0 }));
  fin(hole, T('d3') - 0.1, { y: 0 }); fin(heapNote, T('d3') + 0.6);
  fin(idx, T('d4') - 0.2, { y: 0 }); fin(idxT, T('d4')); fin(idxS, T('d4') + 0.2);
  keys.forEach(([k, p_], i) => { fin(k, T('d4') + 0.4 + i * 0.08, { y: 0 }); fin(p_, T('d4') + 0.5 + i * 0.08, { y: 0 }); });
  fin(myi, T('d5') + 0.2);
  sfx('pop', T('d2') + 0.3); sfx('tick', T('d4') + 0.4); sfx('tick', T('d5') + 0.2);

  // ── 站 C：一页 8192 字节 ──
  const PX = SX.C - 850, PY = 470;
  const pTitle = heading(world, PX + 50, 160, 1650, '堆页 · 8192 字节');
  const pf = pageFig(world, g, PX, PY, { slots: 8, lpShown: 8, tupShown: 8, w: 1700 });
  // 指针到行版本的连线（在页上方弯过去）
  const arcs = pf.lps.map((lp, i) => {
    const tx = pf.tups[i].x, y0 = PY + 18, top = PY - 70 - i * 10;
    return gline(g, `M${lp.x},${y0} C${lp.x},${top} ${tx},${top} ${tx},${PY + 10}`, 'lt', { w: 3, arrow: true, name: '指针 → 行版本' });
  });
  const growL = tag(world, PX + 160, PY + 200, '指针 →', ''); const growR = tag(world, PX + 1700 - 1000, PY + 200, '← 行版本', '');
  const pfAll = [pf.fr, pf.free, pf.fl];
  showHeading(pTitle, Tend('d5') + 0.9);
  fin(pf.fr, Tend('d5') + 1.0, { y: 0 });
  Object.values(pf.ticks).forEach((tk) => { fin(tk.l, T('d6') + 0.5, { y: 0 }); fin(tk.m, T('d6') + 0.5, { y: 0 }); });
  fin(pf.hd, T('d7') + 0.3, { x: -20, y: 0 }); fin(pf.hdl, T('d7') + 0.4);
  pf.lps.forEach((lp, i) => { fin(lp.e, T('d8', '八') + i * 0.08, { y: -16 }); fin(lp.l, T('d8', '八') + i * 0.08 + 0.05, { y: 0 }); });
  sfx('tick', T('d8', '八'));
  arcs.forEach((a, i) => drawIn(a, T('d10') + 0.1 + i * 0.12, 0.6));
  pf.tups.forEach((tp, i) => fin(tp.e, T('d10') + 0.2 + i * 0.12, { y: 16 }));
  tl.fromTo(pf.tups.map((tp) => tp.e), { borderColor: '#336791' }, { borderColor: '#193145', duration: 0.3, immediateRender: false }, T('d11'));
  fin(pf.free, T('d12') - 0.1, { y: 0 }); fin(pf.fl, T('d12')); sfx('tick', T('d12'));
  fin(growL, T('d13'), { x: -30, y: 0 }); fin(growR, T('d13', '航') , { x: 30, y: 0 });
  sfx('pop', T('d13'));

  // ── 站 D：一个行版本：行头 + 三个字段 ──
  const r1 = rows[0];
  const DX = SX.D - 760, DY = 380;
  const dHead = heading(world, DX, 160, 1520, '一个行版本里装了什么');
  const tp = h('div', 'tup', world); px(tp, DX, DY); css(tp, { height: '120px', fontSize: '44px', lineHeight: '112px' });
  tp.dataset.name = '行版本 alice';
  const hdr = h('div', 'hdr', tp, `xmin ${r1.xmin} · xmax ${r1.xmax}`); css(hdr, { fontSize: '36px', padding: '0 28px' });
  ['1', r1.name.trim(), String(r1.age)].forEach((v) => h('div', 'f', tp, v));
  const hl = txt(world, 't-s', '行头', DX + 20, DY + 140);
  const fl = txt(world, 't-s', '编号 · 名字 · 年龄', DX + 560, DY + 140);
  const xm = adm(world, DX, DY + 230, 1100, 'note', `xmin = ${r1.xmin}：写下这一行的事务`, '行头');
  const vis = tag(world, DX + 1150, DY + 270, '谁能读到它？', 'fill'); css(vis, { fontSize: '36px', padding: '14px 24px' });
  showHeading(dHead, T('d15') - 0.6);
  fin(tp, T('d15') - 0.2, { y: 20 }); fin(fl, T('d15') + 0.3);
  tl.fromTo(hdr, { backgroundColor: '#e0ecef' }, { backgroundColor: '#336791', color: '#ffffff', duration: 0.4, immediateRender: false }, T('d15', '航'));
  fin(hl, T('d15', '航'));
  fin(xm, T('d16') + 0.2); sfx('tick', T('d16') + 0.2);
  pop(vis, T('d17') + 0.4); sfx('pop', T('d17') + 0.4);

  camTrack(cam, world, { t: s.start, v: { x: SX.A, y: 540, z: 1 } }, [
    [Tend('d1') + 0.9, { x: SX.B }, 1.1, { sfx: true }],
    [Tend('d5') + 0.9, { x: SX.C }, 1.1, { sfx: true }],
    [Tend('d13') + 0.9, { x: SX.D }, 1.1, { sfx: true }],
  ], { end: s.end });
});
