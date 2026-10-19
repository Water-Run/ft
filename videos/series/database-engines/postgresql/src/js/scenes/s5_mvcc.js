// 第 05 章：同时读写。站 A：三条连接各一条时间线（修改、读已提交、可重复读），每次查询拍下的快照是一道竖向截面，
// 截面与行头事务号对照后选出 30 或 31（实测：未提交读到 30、读已提交的新查询读到 31、早先开始的可重复读仍读到 30）。
// 站 B：两个连接同时改同一行，后来的那个要等。
scene('mvcc', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const g = gsvg(world, 0, 0, 5000, 1100);
  const U = SNAP.uncommitted, r1 = U.rows[0], r9 = U.rows[8];

  // 两个版本（右上）
  const vx = 1300, vy = 150;
  const vT = txt(world, 't-s', '堆里的两个版本', vx, vy - 44);
  const v30 = h('div', 'tup', world); px(v30, vx, vy); v30.dataset.name = '版本 30';
  h('div', 'hdr', v30, `xmin ${r1.xmin} · xmax ${r1.xmax}`); h('div', 'f', v30, '30');
  const v31 = h('div', 'tup', world); px(v31, vx, vy + 90); v31.dataset.name = '版本 31';
  h('div', 'hdr', v31, `xmin ${r9.xmin}`); h('div', 'f', v31, '31');
  const ask = tag(world, vx, vy + 190, '该给谁读哪一个？', 'fill');
  fin(vT, c0 + 0.1); fin(v30, T('m1') + 0.3, { y: 0 }); fin(v31, T('m1', '和') + 0.1, { y: 0 });
  pop(ask, T('m2') + 0.2); out(ask, T('m5'), 0.4);

  // 三条时间线
  const X0 = 420, X1 = 1180;
  const lanes = [
    { y: 300, name: '连接 A<br>修改' },
    { y: 520, name: '连接 B<br>读已提交' },
    { y: 740, name: '连接 C<br>可重复读' },
  ].map((ln) => {
    const l = gline(g, `M${X0},${ln.y} L${X1},${ln.y}`, 'line', { w: 4 });
    const t_ = txt(world, 't-s', ln.name, 150, ln.y - 38); css(t_, { color: 'var(--ink2)' });
    return { ...ln, l, t_ };
  });
  const mk = (x, y, text, cls = '') => { const e = tag(world, x, y - 22, text, cls); return e; };
  // A：UPDATE（未提交）……COMMIT
  const aUpd = blk(world, 460, lanes[0].y - 26, 260, 52, 'fill', 'UPDATE 未提交'); txt(aUpd, 'lbl w', 'UPDATE', 20, 6); css(aUpd.lastChild, { fontSize: '28px' });
  const aCom = mk(740, lanes[0].y, 'COMMIT', 'fill');
  // B：提交前读一次、提交后再读一次
  const bQ1 = mk(500, lanes[1].y, 'SELECT', ''), bR1 = mk(500, lanes[1].y + 60, '30', 'grey');
  const noWait = txt(world, 't-s', '不用等', 640, lanes[1].y + 44);
  const bQ2 = mk(900, lanes[1].y, 'SELECT', ''), bR2 = mk(900, lanes[1].y + 60, '31', 'fill');
  // C：可重复读，提交前就开始读
  const cQ1 = mk(462, lanes[2].y, 'SELECT', ''), cQ2 = mk(960, lanes[2].y, 'SELECT', ''), cR2 = mk(960, lanes[2].y + 60, '30', 'grey');
  // 快照：竖向截面
  const snap = (x, y0, y1, name) => { const r = blk(world, x - 10, y0, 20, y1 - y0, 'fill', name); css(r, { borderWidth: '0', background: 'var(--pg-lt)', opacity: 0.55 }); return r; };
  const sB2 = snap(890, 210, lanes[1].y + 30, '读已提交的新快照');
  const sC1 = snap(440, 210, lanes[2].y + 30, '可重复读的快照');
  const reuse = gline(g, `M480,${lanes[2].y + 40} C480,${lanes[2].y + 110} 960,${lanes[2].y + 110} 960,${lanes[2].y + 40}`, 'lt', { w: 4, dashed: '12 10' });
  const reuseT = txt(world, 't-s', '沿用同一张快照', 600, lanes[2].y + 100);
  const sLab = tag(world, 860, 160, '快照', '');
  lanes.forEach((ln, i) => { const t_ = i < 2 ? c0 + 0.3 + i * 0.12 : T('m9') - 0.2; drawIn(ln.l, t_, 0.6); fin(ln.t_, t_); });
  fin(aUpd, T('m3'), { x: -20, y: 0 }); fin(bQ1, T('m3', '别') - 0.2, { y: 0 }); pop(bR1, T('m3', '读')); fin(noWait, T('m4', '等') - 0.1);
  sfx('tick', T('m3', '读'));
  pop(aCom, T('m5') + 0.1); sfx('thud', T('m5') + 0.1, { g: 0.4 });
  fin(bQ2, T('m7') - 0.2, { y: 0 }); growY(sB2, T('m7', '拍') - 0.1, { d: 0.5 }); fin(sLab, T('m7', '拍') + 0.3, { y: 0 }); sfx('pop', T('m7', '拍'));
  pop(bR2, T('m8', '读') - 0.1); sfx('tick', T('m8', '读'));
  fin(cQ1, T('m10') - 0.1, { y: 0 }); growY(sC1, T('m10', '第') - 0.1, { d: 0.5 });
  fin(cQ2, T('m11') + 0.2, { y: 0 }); drawIn(reuse, T('m11') + 0.6, 0.6); fin(reuseT, T('m11') + 0.9);
  pop(cR2, T('m11a') + 0.1); sfx('tick', T('m11a') + 0.1);
  // 快照与事务号对照
  const cmp = adm(world, 1300, 420, 520, 'note', `快照：哪些事务已提交<br>行头：xmin ${r9.xmin}<br>对上了，就读这个版本`, '怎么选');
  fin(cmp, T('m13') + 0.1);
  const mvcc = tag(world, 1300, 760, 'MVCC · 多版本并发控制', 'fill'); css(mvcc, { fontSize: '38px', padding: '16px 26px' });
  pop(mvcc, T('m14') + 0.3); sfx('chime', T('m14') + 0.4, { g: 0.4 });

  // ── 站 B：写和写要排队 ──
  const BX = 2960;
  const bHead = heading(world, BX - 800, 140, 1600, '写和写，仍然要排队');
  const wLanes = [{ y: 380, n: '连接 A · UPDATE id = 1' }, { y: 580, n: '连接 D · UPDATE id = 1' }, { y: 780, n: '连接 B · SELECT' }].map((ln) => {
    const l = gline(g, `M${BX - 360},${ln.y} L${BX + 760},${ln.y}`, 'line', { w: 4 });
    const t_ = txt(world, 't-s', ln.n, BX - 800, ln.y - 22); css(t_, { color: 'var(--ink2)' });
    return { ...ln, l, t_ };
  });
  const wA = blk(world, BX - 320, 354, 700, 52, 'fill', '持有这一行'); txt(wA, 'lbl w', '修改中 · 持有这一行', 20, 6); css(wA.lastChild, { fontSize: '28px' });
  const wD = blk(world, BX - 200, 554, 580, 52, '', '等待'); css(wD, { borderColor: 'var(--warn-bd)', background: 'var(--warn-bg)' }); txt(wD, 'lbl warn', '等待', 20, 6); css(wD.lastChild, { fontSize: '28px', color: 'var(--warn-fg)' });
  const wB = mk(BX - 100, 780, 'SELECT → 30', 'grey');
  const wOk = txt(world, 't-s', '读不用等写', BX + 200, 800);
  const warn = adm(world, BX + 380, 500, 460, 'warning', '同一行正在被修改，后来的写入要等它结束', '等待');
  showHeading(bHead, T('m15') - 0.6);
  wLanes.forEach((ln, i) => { drawIn(ln.l, T('m15') - 0.4, 0.6); fin(ln.t_, T('m15') - 0.4 + i * 0.1); });
  fin(wA, T('m15') - 0.2, { x: -20, y: 0 });
  pop(wB, T('m15') + 0.3); fin(wOk, T('m15') + 0.6); sfx('tick', T('m15') + 0.3);
  fin(wD, T('m16', '后') - 0.1, { x: -20, y: 0 }); fin(warn, T('m16', '等') - 0.2); sfx('error', T('m16', '等'), { g: 0.35 });

  camTrack(cam, world, { t: s.start, v: { x: 960, y: 540, z: 1 } }, [
    [Tend('m14') + 0.9, { x: BX }, 1.1, { sfx: true }],
  ], { end: s.end });
});
