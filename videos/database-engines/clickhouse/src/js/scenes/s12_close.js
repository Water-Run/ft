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
  // 读很多行：表右边一道竖括线罩住所有行；只读其中几列：年龄这一列框起来
  const brR = mk(gA, '', 690, 252, 14, 7 * 70 + 50); css(brR, { borderTop: '4px solid var(--y)', borderRight: '4px solid var(--y)', borderBottom: '4px solid var(--y)' }); vanish(brR, 0); wipe(brR, T('t1b', '读很多行') - 0.1, { dir: 't', d: 0.6 });
  const lr = mk(gA, 'lab y', 720, 252 + 7 * 70 / 2, null, null, '很多行'); vanish(lr, 0); appear(lr, T('t1b', '读很多行') + 0.3);
  tbl.forEach((r, i) => r.c.forEach((c) => classAt(c, 'w', T('t1b', '读很多行') + i * 0.08)));
  const colF = mk(gA, '', 100 + 130 + 300 - 4 - 8, 172, 150 + 16, 8 * 70 + 10); css(colF, { border: '4px solid var(--y)' }); vanish(colF, 0); wipe(colF, T('t1b', '只读') - 0.1, { dir: 't', d: 0.6 });
  const lc = mk(gA, 'lab y', 530, 130, null, null, '只读这一列'); vanish(lc, 0); appear(lc, T('t1b', '只读') + 0.1);
  [hd, ...tbl].forEach((r) => classAt(r.c[2], 'y', T('t1b', '只读')));
  const ms = mk(gA, 'huge y', 860, 300, null, null, '< 10 ms'); css(ms, { fontSize: '200px' }); slam(ms, T('t2', '不到十毫秒'), { from: 1.2 }); sfx('chime', T('t2', '不到十毫秒') + 0.1, { g: 0.6 });
  const ml = mk(gA, 'lab', 870, 540, null, null, '一亿人的平均年龄'); appear(ml, T('t2') + 0.2);
  const sv = mk(gA, 'tag o', 860, 640, null, null, '整张表 约 1/7'); css(sv, { fontSize: '80px' }); slam(sv, T('t2b', '七分之一'), { from: 1.2 }); sfx('thud', T('t2b', '七分之一') + 0.1, { g: 0.6 });
  const sn = mk(gA, 'lab', 870, 780, null, null, '（演示数据上的压缩结果）'); css(sn, { fontSize: '24px' }); appear(sn, T('t2b', '七分之一') - 0.4);
  const tAB = T('t3') + 1.0;
  vanish(gA, tAB);

  // ── B 换来的，与代价放在哪（代价都落在分析不常碰的地方）──
  appear(gB, tAB);
  const hdB = mk(gB, 'h2', 100, 160, null, null, '代价，都放在分析不常碰的地方'); wipe(hdB, tAB, { dir: 'l', d: 0.5 });
  // 四张卡片：左边一张放大的小示意（演出那件事），右边一句「代价」，底下一句「为什么不要紧」
  const LOSE = [['t3a', '改一行，重写一整列', '分析看的多是历史数据，不常改', '分析'], ['t3b', '找一个人，读一整个颗粒', '要快的，是一次扫一大片', '', 't3b2'], ['t3c', '数据得成批地写', '零散的，异步插入替你攒批', '零散'], ['t3d', '多语句事务，默认没有', '那是事务型数据库的日常', '', 't3e']];
  LOSE.forEach(([id, a, b], i) => {
    const x = 100 + (i % 2) * 880, y = 240 + Math.floor(i / 2) * 340, t0 = T(id) - 0.05;
    const card = mk(gB, 'panel', x, y, 840, 310); wipe(card, t0, { dir: 'l', d: 0.45 }); sfx('thud', T(id) + 0.1, { g: 0.5 });
    classAt(card, 'y', T(id), T(id) + 1.2);
    const ti = mk(card, 'h2', 400, 30, 410, null, a); css(ti, { whiteSpace: 'normal', fontSize: '34px' });
    const tw = LOSE[i][4] ? T(LOSE[i][4]) : T(id, LOSE[i][3]);
    const ok = mk(card, '', 400, 190, 410, 90, icoSvg('check', 30, 4) + '<span style="margin-left:10px">' + b + '</span>'); css(ok, { display: 'flex', alignItems: 'flex-start', font: '600 26px/1.4 "Sans SC"', color: 'var(--y)', whiteSpace: 'normal' }); vanish(ok, 0); show(ok, tw - 0.1, { y: 10, d: 0.35 }); sfx('pop', tw, { g: 0.4 });
    const t1 = T(id) + 0.3, at1 = (e, t) => { vanish(e, 0); appear(e, t); return e; };
    if (i === 0) {          // 改一个：一整列八格全部重写
      const one = at1(mk(card, 'cs13', 30, 40, 36, 220, ''), t1); classAt(one, 'fy', t1 + 0.1);
      for (let k = 0; k < 8; k++) { const c = at1(mk(card, 'cs13', 110 + k * 32, 40, 26, 220, ''), t1); classAt(c, 'fy', t1 + 0.5 + k * 0.08); }
    }
    if (i === 1) {          // 要一行：读出一整个颗粒（一摞行里只亮一行）
      for (let k = 0; k < 4; k++) { const c = at1(mk(card, 'gran', 30 + k * 86, 40, 76, 120, ''), t1 + k * 0.05); if (k === 1) classAt(c, 'on', t1 + 0.5); }
      for (let r = 0; r < 8; r++) { const ln = at1(mk(card, '', 116, 178 + r * 13, 76, 8), t1 + 0.6 + r * 0.03); css(ln, { background: r === 3 ? 'var(--y)' : '#5E5E55' }); }
    }
    if (i === 2) {          // 零散的一个个小片段 → 攒成一个
      for (let k = 0; k < 12; k++) { const f = at1(mk(card, 'fold', 30 + (k % 6) * 54, 40 + Math.floor(k / 6) * 54, 44, 44, ''), t1 + k * 0.06); classAt(f, 'gone', tw + 0.2); }
      const bigF = at1(mk(card, 'fold y', 30, 40, 314, 98, ''), tw + 0.2); void bigF;
      const ar = at1(mk(card, 'lab y', 30, 160, null, null, '一个片段'), tw + 0.3); void ar;
    }
    if (i === 3) {          // BEGIN 打不开
      const m = at1(mk(card, 'mono', 30, 60, null, null, ':) BEGIN …'), t1); css(m, { fontSize: '30px', color: 'var(--w)' });
      const xI = ico(card, 'cross', 150, 120, 110, 'w', 4); vanish(xI, 0); slam(xI, t1 + 0.6, { from: 1.6 }); sfx('thud', t1 + 0.65, { g: 0.4 });
    }
  });
  drift(cam, s, -1);
});
