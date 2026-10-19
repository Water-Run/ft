// 第 07 章：崩溃以后。站 A：内存、预写日志、数据文件三层；①日志先写进磁盘 ②数据页才能写回；提交只等日志；
// 后台慢慢写回数据页，检查点标出恢复起点。站 B：实测——编号 1 改成 32 并提交，编号 2 改成 77 未提交，进程崩溃；
// 重启后按日志重做：32 回来了，编号 2 仍是 25。
scene('recovery', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 5000, 1100);
  const AR = PH.after_recovery;

  // ── 站 A：三层 ──
  const LX = 160, LW = 1600;
  const lay = (y, hh, name, sub, cls) => { const b = blk(world, LX, y, LW, hh, cls, name); const t_ = txt(world, 't-3', name, LX + 30, y + 22); const s_ = txt(world, 't-s', sub, LX + 30, y + 86); return { b, t_, s_ }; };
  const mem = lay(140, 210, '内存', '共享缓冲区里的数据页', '');
  const wal = lay(400, 200, '预写日志 WAL', '顺序追加，写进磁盘', '');
  const disk = lay(650, 210, '数据文件', '磁盘上的堆页', 'grey');
  css(mem.t_, { color: 'var(--pg)' }); css(wal.t_, { color: 'var(--pg)' });
  const page = blk(world, LX + 700, 180, 260, 130, 'fill', '内存里的数据页'); txt(page, 'lbl w', '页 · 年龄 31', 24, 40);
  const recs = [0, 1, 2, 3].map((i) => { const r = blk(world, LX + 700 + i * 150, 450, 130, 100, 'fill', 'WAL 记录'); txt(r, 'lbl w', 'WAL', 26, 26); return r; });
  const dpage = blk(world, LX + 700, 700, 260, 130, '', '磁盘上的数据页'); txt(dpage, 'lbl', '页 · 年龄 30', 24, 40);
  const a1 = gline(g, `M${LX + 830},310 L${LX + 830},442`, 'pg', { w: 6, arrow: true, name: '① 日志先落盘' });
  const a2 = gline(g, `M${LX + 1000},310 C${LX + 1100},480 ${LX + 1100},600 ${LX + 970},692`, 'lt', { w: 6, arrow: true, dashed: '14 10', name: '② 数据页后写回' });
  const n1 = tag(world, LX + 860, 340, '① 先写日志', 'fill'), n2 = tag(world, LX + 1110, 560, '② 再写数据页', '');
  const commit = tag(world, LX + 1320, 450, '提交 = 日志落盘', 'fill'); css(commit, { fontSize: '34px', padding: '14px 22px' });
  const bg = txt(world, 't-s', '由后台慢慢写回', LX + 1120, 620);
  const ckpt = blk(world, LX + 680, 420, 8, 160, 'fill', '检查点'); css(ckpt, { borderWidth: '0', background: 'var(--caut-bd)' });
  const ckT = tag(world, LX + 540, 600, '检查点：从这里开始恢复', ''); css(ckT, { borderColor: 'var(--caut-bd)', color: 'var(--caut-fg)', background: 'var(--caut-bg)' });
  [mem, wal, disk].forEach((L_, i) => { fin(L_.b, c0 + 0.1 + i * 0.12, { y: 0 }); fin(L_.t_, c0 + 0.2 + i * 0.12); fin(L_.s_, c0 + 0.3 + i * 0.12); });
  fin(dpage, c0 + 0.5, { y: 0 });
  fin(page, T('w2') + 0.2, { y: -20 }); sfx('pop', T('w2') + 0.2);
  drawIn(a1, T('w3', '必') - 0.1, 0.6); fin(n1, T('w3', '必') + 0.2); recs.forEach((r, i) => fin(r, T('w3', '必') + 0.3 + i * 0.12, { x: -20, y: 0 }));
  drawIn(a2, T('w3') + 0.4, 0.5); fin(n2, T('w3') + 0.6);
  sfx('tick', T('w3', '必') + 0.3);
  tl.fromTo(wal.t_, { scale: 1 }, { keyframes: [{ scale: 1.08, duration: 0.2 }, { scale: 1, duration: 0.3 }], immediateRender: false, transformOrigin: '0% 50%' }, T('w4', '预'));
  pop(commit, T('w5') + 0.6); sfx('thud', T('w5') + 0.6, { g: 0.4 });
  fin(bg, T('w6') + 0.2);
  keyed(dpage.firstChild).at(T('w6') + 1.0, { html: '页 · 年龄 31' });
  growY(ckpt, T('w7') + 0.1, { d: 0.5 }); fin(ckT, T('w7') + 0.4); sfx('tick', T('w7') + 0.4);

  // ── 站 B：实测 ──
  const BX = 2960;
  const bHead = heading(world, BX - 800, 140, 1600, '试一下');
  const c1 = psql(world, BX - 800, 240, [PR + 'UPDATE users SET age = 32 WHERE id = 1;', PR + 'COMMIT;'], { w: 1120 });
  const c1T = txt(world, 't-s', '连接 1 · 已提交', BX + 360, 290);
  const c2 = psql(world, BX - 800, 420, [PR + 'BEGIN;', PR + 'UPDATE users SET age = 77 WHERE id = 2;'], { w: 1120 });
  const c2T = txt(world, 't-s', '连接 2 · 未提交', BX + 360, 470);
  const crash = adm(world, BX - 800, 620, 1600, 'warning', '数据库进程直接崩溃', '崩溃');
  const redo = adm(world, BX - 800, 620, 1600, 'note', '重启：从检查点开始，按日志把修改重做一遍', '恢复');
  const res = dtable(world, BX - 800, 260, ['id', 'age', '结果'], [[1, AR[0].age, '已提交 · 回来了'], [2, AR[1].age, '没提交 · 原来的值']], { num: [0, 1] });
  css(res.el, { fontSize: '38px' });
  const inno = adm(world, BX + 260, 260, 540, 'note', 'InnoDB 的 redo 日志：同一个思路', '对照');
  showHeading(bHead, T('w8') - 0.5);
  fin(c1.el, T('w8') - 0.2, { y: 0 }); appear(c1.rows[1], T('w8', '提') - 0.1); fin(c1T, T('w8', '提'));
  fin(c2.el, T('w9') - 0.1, { y: 0 }); fin(c2T, T('w9') + 0.4);
  sfx('blip', T('w8', '提'));
  fin(crash, T('w10', '崩') - 0.3, { y: 0 }); sfx('error', T('w10', '崩'), { g: 0.5 });
  // 崩溃：两段会话变灰
  tl.fromTo([c1.el, c2.el], { opacity: 1 }, { opacity: 0.35, duration: 0.3, immediateRender: false }, T('w10', '崩'));
  out(crash, T('w11') - 0.3, 0.3); fin(redo, T('w11') - 0.1, { y: 0 }); sfx('riser', T('w11') - 1.2, { g: 0.3 });
  tl.fromTo([c1.el, c1T, c2.el, c2T], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, immediateRender: false }, T('w12') - 1.0);
  fin(res.el, T('w12') - 0.3, { y: 0 }); appear(res.trs[0], T('w12') - 0.2); appear(res.trs[1], T('w13') - 0.1);
  sfx('chime', T('w12') + 0.2, { g: 0.45 }); sfx('tick', T('w13'));
  fin(inno, T('w14') - 0.1);

  camTrack(cam, world, { t: s.start, v: { x: 960, y: 540, z: 1 } }, [
    [Tend('w7') + 0.9, { x: BX }, 1.1, { sfx: true }],
  ], { end: s.end });
});
