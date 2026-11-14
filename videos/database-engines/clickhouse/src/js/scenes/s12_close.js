// 第 12 章 取舍：专为「读很多行、只读几列」设计（不到十毫秒、七分之一）→ 放弃的四样
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB] = [0, 1].map(() => groupAt(world));

  // ── A 一类查询：读很多行，只读几列 ──
  appear(gA, c0 + 0.05);
  const hd = rowAt(gA, 100, 180, ['编号', '姓名', '年龄'], [130, 300, 150], 62, 'w lg');
  const tbl = [0, 1, 2, 3, 4, 5, 6].map((i) => rowAt(gA, 100, 252 + i * 70, P8[i], [130, 300, 150], 62, 'lg')); wipe(hd.row, c0 + 0.1, { dir: 'l', d: 0.5 }); tbl.forEach((r, i) => wipe(r.row, T('t1') + i * 0.08, { dir: 'l', d: 0.4 }));
  const dots = mk(gA, 'big', 100, 740, null, null, '⋮'); css(dots, { fontSize: '60px', color: 'var(--g3)' }); appear(dots, T('t1'));
  const lr = mk(gA, 'h2 y', 720, 250, null, null, '读很多行'); show(lr, T('t1b', '读很多行'), { y: 12 });
  tbl.forEach((r, i) => r.c.forEach((c) => classAt(c, 'w', T('t1b', '读很多行') + i * 0.08)));
  const lc = mk(gA, 'h2 y', 720, 330, null, null, '只读其中几列'); show(lc, T('t1b', '只读'), { y: 12 });
  [hd, ...tbl].forEach((r) => classAt(r.c[2], 'y', T('t1b', '只读')));
  const ms = mk(gA, 'huge y', 720, 440, null, null, '< 10 ms'); css(ms, { fontSize: '200px' }); slam(ms, T('t2', '不到十毫秒'), { from: 1.2 }); sfx('chime', T('t2', '不到十毫秒') + 0.1, { g: 0.6 });
  const ml = mk(gA, 'lab', 720, 680, null, null, '一亿人的平均年龄'); appear(ml, T('t2') + 0.2);
  const sv = mk(gA, 'tag o', 720, 760, null, null, '整张表 约 1/7'); css(sv, { fontSize: '80px' }); slam(sv, T('t2b', '七分之一'), { from: 1.2 }); sfx('thud', T('t2b', '七分之一') + 0.1, { g: 0.6 });
  const sn = mk(gA, 'lab', 720, 880, null, null, '（演示数据上的压缩结果）'); css(sn, { fontSize: '24px' }); appear(sn, T('t2b', '七分之一') - 0.2);
  const tAB = T('t3') + 1.0;
  vanish(gA, tAB);

  // ── B 得到的，与放弃的 ──
  appear(gB, tAB);
  const pa = mk(gB, 'panel y', 100, 200, 640, 620), pb = mk(gB, 'panel', 800, 200, 1020, 620); wipe(pa, tAB, { dir: 'l', d: 0.4 }); wipe(pb, tAB + 0.1, { dir: 'l', d: 0.4 });
  mk(gB, 'lab y', 140, 224, null, null, '换来的'); mk(gB, 'lab', 840, 224, null, null, '放弃的');
  const g1 = mk(gB, 'big y', 140, 300, null, null, '< 10 ms'); css(g1, { fontSize: '110px' }); appear(g1, tAB + 0.2);
  const g1l = mk(gB, 'h2', 140, 440, null, null, '一亿人求平均年龄'); appear(g1l, tAB + 0.2);
  const g2 = mk(gB, 'big y', 140, 540, null, null, '约 1/7'); css(g2, { fontSize: '110px' }); appear(g2, tAB + 0.4);
  const g2l = mk(gB, 'h2', 140, 680, null, null, '整张表占的地方'); appear(g2l, tAB + 0.4);
  const LOSE = [['t3a', '改一个字节，要重写一整列', '表越大越慢'], ['t3b', '找一个人，要读一个颗粒', '八千多行'], ['t3c', '一次只插几行，太浪费', '得成批地写'], ['t3d', '要几条语句一起成败', '事务默认没有']];
  LOSE.forEach(([id, a, b], i) => {
    const y = 290 + i * 128;
    const row = mk(gB, 'cell lg', 840, y, 940, 108, '<span>' + a + '</span>'); css(row, { fontSize: '36px' }); wipe(row, T(id) - 0.05, { dir: 'l', d: 0.5 });
    const bd = mk(gB, 'badge', 1500, y + 28, null, null, b); css(bd, { fontSize: '28px', letterSpacing: '0.04em' }); vanish(bd, 0); appear(bd, T(id) + 0.6);
    sfx('thud', T(id) + 0.1, { g: 0.5 });
    classAt(row, 'y', T(id), T(id) + 1.0);
    // 每一条配一个小示意：整列重写 / 读整整一个颗粒 / 一次一个小片段 / 事务打不开
    const t1 = T(id) + 0.3, at1 = (e, t) => { vanish(e, 0); appear(e, t); return e; };
    if (i === 0) for (let k = 0; k < 8; k++) { const c = at1(mk(gB, 'cs13', 1330 + k * 20, y + 32, 16, 44, ''), t1); classAt(c, 'fy', t1 + 0.2 + k * 0.08); }
    if (i === 1) for (let k = 0; k < 6; k++) { const c = at1(mk(gB, 'gran', 1330 + k * 26, y + 30, 22, 48, ''), t1 + k * 0.04); if (k === 2) classAt(c, 'on', t1 + 0.5); }
    if (i === 2) for (let k = 0; k < 8; k++) at1(mk(gB, 'fold', 1330 + (k % 4) * 30, y + 26 + Math.floor(k / 4) * 30, 24, 24, ''), t1 + k * 0.1);
    if (i === 3) { const m = at1(mk(gB, 'mono', 1330, y + 38, null, null, ':) BEGIN'), t1); css(m, { fontSize: '24px', color: 'var(--g3)' }); classAt(m, 'strike', t1 + 0.6); }
  });
  drift(cam, s, -1);
});
