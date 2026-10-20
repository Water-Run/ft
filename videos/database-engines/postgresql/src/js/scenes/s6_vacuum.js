// 第 06 章：旧版本去哪了。同一页（实测 committed_pinned → vacuum_released）：快照还在时 VACUUM 留下 30；
// 事务结束后再 VACUUM，30 被清掉，其余行版本向页尾挪一格（upper 7760 → 7808），第 1 项变成指向第 9 项的重定向。
scene('maintenance', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 5000, 1100);
  const P0 = SNAP.vacuum_pinned, P1 = SNAP.vacuum_released;
  const PX = 110, PY = 470;
  const pf = pageFig(world, g, PX, PY, { slots: 9, lpShown: 9, tupShown: 9, w: 1700, rows: P0.rows, snap: P0 });
  vanish(pf.fl, 0);
  css(pf.free, { left: (PX + PG_W.head + 9 * PG_W.lp + 10) + 'px', width: (1700 - PG_W.head - 9 * PG_W.lp - 9 * PG_W.tup - 20) + 'px' });
  const t1 = pf.tups[0];
  const q = psql(world, 160, 150, [''], { w: 900 });
  const cost = tag(world, t1.x - 230, PY + 170, '旧版本占着空间', 'grey');
  // 本页全部先到
  [pf.fr, pf.hd, pf.hdl, pf.free].forEach((e) => fin(e, c0 + 0.1, { y: 0 }));
  Object.values(pf.ticks).forEach((tk) => { fin(tk.l, c0 + 0.2, { y: 0 }); fin(tk.m, c0 + 0.2, { y: 0 }); });
  pf.lps.forEach((lp) => { fin(lp.e, c0 + 0.2, { y: 0 }); fin(lp.l, c0 + 0.2, { y: 0 }); });
  pf.tups.forEach((tp) => fin(tp.e, c0 + 0.2, { y: 0 }));
  css(t1.e, { background: 'var(--mist)', borderColor: 'var(--pg-lt)' });
  fin(cost, T('v1') + 0.4); sfx('tick', T('v1') + 0.4);
  tl.fromTo(q.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: true }, T('v2') - 0.3);
  typeText(q.rows[0], PR + 'VACUUM users;', T('v2', 'v') - 0.1, 20, { cursor: false, sfxGain: 0.3 });
  // 快照仍要用 30
  const band = blk(world, t1.x - 72, PY - 26, 144, 184, '', '可重复读的快照还在'); css(band, { background: 'transparent', borderColor: 'var(--pg-lt)', borderWidth: '6px' });
  const bandT = tag(world, t1.x - 520, PY - 110, '可重复读事务的快照还要用它', '');
  growY(band, T('v3') + 0.1, { d: 0.5 }); fin(bandT, T('v3') + 0.4); sfx('pop', T('v3') + 0.1);
  // 第一次 VACUUM：扫过，30 留下
  const sweep = (t, name) => { const b = blk(world, PX, PY - 20, 14, 172, 'fill', name); css(b, { borderWidth: '0', background: 'var(--pg-dk)' }); tl.fromTo(b, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: 0, duration: 0.01, immediateRender: true }, t); tl.fromTo(b, { x: 0 }, { x: 1686, duration: 1.6, ease: 'power1.inOut', immediateRender: false }, t); out(b, t + 1.7, 0.3); return b; };
  sweep(T('v4', 'v') - 0.1, '第一次 VACUUM');
  const stay = tag(world, t1.x - 300, PY + 240, '30 没有被清掉', 'warn');
  fin(stay, T('v5') + 0.1); sfx('error', T('v5') + 0.1, { g: 0.25 });
  // 事务结束，再来一次
  out(band, T('v6') + 0.1, 0.4); out(bandT, T('v6') + 0.1, 0.4); out(stay, T('v6') + 0.1, 0.4); out(cost, T('v6') + 0.1, 0.4);
  const s2 = T('v6', '再') - 0.1; sweep(s2, '第二次 VACUUM');
  tl.fromTo(t1.e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, immediateRender: false }, s2 + 1.4);
  pf.tups.slice(1).forEach((tp) => tl.fromTo(tp.e, { x: 0 }, { x: PG_W.tup, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, s2 + 1.8));
  keyed(pf.ticks.upper.l).at(s2 + 1.8, { html: String(P1.upper) });
  tl.fromTo(pf.ticks.upper.l, { x: 0 }, { x: PG_W.tup, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, s2 + 1.8);
  tl.fromTo(pf.ticks.upper.m, { x: 0 }, { x: PG_W.tup, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, s2 + 1.8);
  tl.fromTo(pf.free, { width: 1700 - PG_W.head - 9 * PG_W.lp - 9 * PG_W.tup - 20 }, { width: 1700 - PG_W.head - 9 * PG_W.lp - 8 * PG_W.tup - 20, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, s2 + 1.8);
  sfx('thud', s2 + 1.5, { g: 0.4 }); sfx('chime', T('v7'), { g: 0.35 });
  // 第 1 项成为重定向，指向第 9 项
  const lp1 = pf.lps[0], lp9 = pf.lps[8], t9x = pf.tups[8].x + PG_W.tup;
  tl.fromTo(lp1.e, { backgroundColor: '#336791' }, { backgroundColor: '#699eca', duration: 0.4, immediateRender: false }, T('v7') + 0.2);
  const redir = gline(g, `M${lp1.x},${PY + 132} C${lp1.x},${PY + 230} ${lp9.x},${PY + 230} ${lp9.x},${PY + 140}`, 'pg', { w: 5, arrow: true, name: '第 1 项 → 第 9 项' });
  drawIn(redir, T('v7') + 0.4, 0.7);
  const rT = tag(world, lp1.x - 40, PY + 240, '第 1 项 → 第 9 项', 'fill');
  fin(rT, T('v7') + 0.9);
  const idx = blk(world, PX + 60, 230, 360, 110, 'wash', '索引项 主键 1'); txt(idx, 'lbl', '索引：主键 1 → (0,1)', 20, 30); css(idx.lastChild, { fontSize: '28px' });
  const idxA = gline(g, `M${PX + 240},340 L${lp1.x},${PY + 10}`, 'pg', { w: 4, arrow: true });
  fin(idx, T('v8') - 0.1, { y: 0 }); drawIn(idxA, T('v8') + 0.3, 0.6); sfx('tick', T('v8') + 0.3);
  const reuse = adm(world, 1060, 140, 760, 'tip', '腾出的空间留给这张表以后再用', '复用');
  fin(reuse, T('v9') + 0.2); sfx('pop', T('v9') + 0.2);
  const care = adm(world, 110, 780, 1700, 'caution', '更新很频繁的表，或者开了很久的事务：留意清理跟不跟得上', '小心');
  fin(care, T('v11') + 0.3); sfx('tick', T('v11') + 0.3);
  out(q.el, T('v9'), 0.3);

  camTrack(cam, world, { t: s.start, v: { x: 960, y: 540, z: 1 } }, [], { end: s.end });
});
