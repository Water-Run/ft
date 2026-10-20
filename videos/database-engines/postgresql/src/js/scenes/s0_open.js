// 开场：Stack Overflow 调查 2018–2026 的两条折线（数据来自 research/lab/out_10_trend.json），
// 2023 年交叉；然后 MyISAM、InnoDB 收进 MySQL；镜头转向上升的那条线，落到片名。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const TR = D.trend.years;
  const t0 = s.start + 0.1;

  // ── 站 A：折线图 ──
  const PX0 = 300, PX1 = 1590, PY0 = 860, PY1 = 250;            // 绘图区：横轴 2018–2026，纵轴 0–70%
  const xOf = (yr) => PX0 + (yr - 2018) / 8 * (PX1 - PX0);
  const yOf = (v) => PY0 - v / 70 * (PY0 - PY1);
  const hd = heading(world, 160, 120, 1600, '开发者用得最多的数据库');
  const g = gsvg(world, 0, 0, 1920, 1080);
  // 网格与刻度
  const grid = [];
  for (const v of [0, 20, 40, 60]) {
    grid.push(gline(g, `M${PX0},${yOf(v)} L${PX1},${yOf(v)}`, v === 0 ? 'grey' : 'line', { w: v === 0 ? 3 : 2 }));
    const l = txt(world, 'num t-s', v + '%', PX0 - 92, yOf(v) - 20); grid.push(l);
  }
  const yrs = TR.map((r) => { const l = txt(world, 'num t-s', String(r.year), xOf(r.year) - 34, PY0 + 18); return l; });
  // 两条线：按年份分三段画（2018–2022、2022–2023、2023–2026）
  const pts = (key, a, b) => TR.filter((r) => r.year >= a && r.year <= b).map((r, i) => `${i ? 'L' : 'M'}${xOf(r.year).toFixed(1)},${yOf(r[key]).toFixed(1)}`).join(' ');
  const seg = (key, color) => [[2018, 2022], [2022, 2023], [2023, 2026]].map(([a, b]) => gline(g, pts(key, a, b), color, { w: key === 'PostgreSQL' ? 8 : 6, cap: 'round', name: key + ' 折线' }));
  const myL = seg('MySQL', 'grey'), pgL = seg('PostgreSQL', 'pg');
  const first = TR[0], last = TR[TR.length - 1];
  const dMy0 = gdot(g, xOf(2018), yOf(first.MySQL), 11, 'grey'), dPg0 = gdot(g, xOf(2018), yOf(first.PostgreSQL), 12, 'pg');
  const vMy0 = txt(world, 'num t-3 mute', `MySQL <b>${first.MySQL}%</b>`, xOf(2018) + 24, yOf(first.MySQL) - 76);
  const vPg0 = txt(world, 'num t-3 pg', `PostgreSQL <b>${first.PostgreSQL}%</b>`, xOf(2018) + 24, yOf(first.PostgreSQL) + 18);
  // 交叉点：2022 与 2023 两段线的交点（按数据求出）
  const r22 = TR.find((r) => r.year === 2022), r23 = TR.find((r) => r.year === 2023);
  const kx = (r22.MySQL - r22.PostgreSQL) / ((r22.MySQL - r22.PostgreSQL) - (r23.MySQL - r23.PostgreSQL));
  const cross = gdot(g, xOf(2022 + kx), yOf(r22.PostgreSQL + kx * (r23.PostgreSQL - r22.PostgreSQL)), 24, 'pg', { hollow: true, w: 5, name: '交叉点' });
  const crossT = tag(world, xOf(2023) - 140, yOf(52) - 150, '2023 · PostgreSQL 反超', 'fill');
  const dPg1 = gdot(g, xOf(2026), yOf(last.PostgreSQL), 13, 'pg'), dMy1 = gdot(g, xOf(2026), yOf(last.MySQL), 11, 'grey');
  const vPg1 = txt(world, 'num t-2', `${last.PostgreSQL}%`, xOf(2026) + 30, yOf(last.PostgreSQL) - 44);
  const vMy1 = txt(world, 'num t-3 mute', `${last.MySQL}%`, xOf(2026) + 30, yOf(last.MySQL) - 28);
  const src = txt(world, 't-s', '数据：Stack Overflow 开发者调查', 1290, 206);

  // 第一句：标题与坐标轴先到
  showHeading(hd, t0);
  grid.forEach((e, i) => (e.tagName === 'path' ? drawIn(e, t0 + 0.2 + i * 0.05, 0.6) : fin(e, t0 + 0.25 + i * 0.05, { y: 0 })));
  yrs.forEach((e, i) => fin(e, T('o1') + 0.6 + i * 0.06, { y: 8 }));
  fin(src, T('o1a'), { y: 0 });
  // 2018 两个起点
  const tMy = T('o2', '回'), tPg = T('o3');
  pop(dMy0, tMy, { origin: 'center' }); fin(vMy0, tMy + 0.1); sfx('tick', tMy);
  pop(dPg0, tPg, { origin: 'center' }); fin(vPg0, tPg + 0.1); sfx('tick', tPg);
  // 逐年靠近，2023 交叉，一直画到 2026
  const tA = T('o4'); drawIn(myL[0], tA, 2.2); drawIn(pgL[0], tA, 2.2);
  const tX = T('o5') + 0.2; drawIn(myL[1], tX, 0.7); drawIn(pgL[1], tX, 0.7);
  pop(cross, tX + 0.6, { origin: 'center' }); fin(crossT, tX + 0.8, { y: 10 }); sfx('pop', tX + 0.7);
  const tB = T('o6'); drawIn(myL[2], tB, 1.6); drawIn(pgL[2], tB, 1.6);
  pop(dPg1, tB + 1.5, { origin: 'center' }); fin(vPg1, T('o6', '百') - 0.3 > tB + 1.4 ? T('o6', '百') - 0.3 : tB + 1.5); sfx('thud', tB + 1.5, { g: 0.5 });
  pop(dMy1, T('o6a') - 0.1, { origin: 'center' }); fin(vMy1, T('o6a'));
  out(vMy0, T('o6'), 0.5); out(vPg0, T('o6'), 0.5);

  // ── 站 B：MySQL 与它的两个存储引擎（右侧 x 2000–3900） ──
  const BX = 2120;
  const box_ = blk(world, BX, 300, 1640, 520, 'grey', 'MySQL');
  const bt = txt(world, 't-1', 'MySQL', BX + 60, 340); css(bt, { color: 'var(--mute)', fontFamily: '"Open Sans"' });
  const sub = txt(world, 't-4', '存储引擎', BX + 64, 480);
  const e1 = blk(world, BX + 70, 570, 690, 190, '', 'MyISAM'); css(e1, { borderColor: 'var(--grey)' });
  const e1t = txt(world, 't-2', 'MyISAM', BX + 110, 590); css(e1t, { color: 'var(--ink2)', fontFamily: '"Open Sans"' });
  const e1s = txt(world, 't-s', '系列第 1 集', BX + 114, 680);
  const e2 = blk(world, BX + 860, 570, 690, 190, '', 'InnoDB'); css(e2, { borderColor: 'var(--grey)' });
  const e2t = txt(world, 't-2', 'InnoDB', BX + 900, 590); css(e2t, { color: 'var(--ink2)', fontFamily: '"Open Sans"' });
  const e2s = txt(world, 't-s', '系列第 2 集', BX + 904, 680);
  const tE = T('o7') - 0.5;
  fin(e1, T('o7', 'My') - 0.1); fin(e1t, T('o7', 'My')); fin(e1s, T('o7', 'My') + 0.15);
  fin(e2, T('o7', 'In') - 0.1); fin(e2t, T('o7', 'In')); fin(e2s, T('o7', 'In') + 0.15);
  fin(box_, Tend('o6a') + 0.9, { y: 0 }); fin(bt, Tend('o6a') + 1.1); fin(sub, T('o8', '存')); sfx('thud', T('o8', 'My'), { g: 0.45 });

  // ── 站 C：片名（x 4000–5900） ──
  const CX = 4000;
  const logo = pgLogo(world, false); px(logo, CX + 160, 240, 420, 433);
  const k1 = txt(world, 't-4', '一个数据库引擎是如何实现的？', CX + 700, 330);
  const k2 = txt(world, 't-0', 'PostgreSQL', CX + 690, 400);
  const k3 = txt(world, 't-3', '开源巅峰', CX + 700, 580); css(k3, { color: 'var(--pg-dk)' });
  const kl = blk(world, CX + 700, 660, 980, 4, 'fill'); css(kl, { borderWidth: '0', background: 'var(--rule)' });
  const k4 = txt(world, 't-s', 'PostgreSQL 18.4 · 存储、查询、并发与恢复', CX + 700, 690);
  const tC = T('o9', 'Po') - 0.2;
  pop(logo, Tend('o8') + 1.0, { from: 0.85 }); fin(k1, Tend('o8') + 1.3); fin(k2, tC + 0.15, { y: 24 }); fin(k3, tC + 0.5); grow(kl, tC + 0.6, { d: 0.8 }); fin(k4, tC + 0.9);
  sfx('chime', tC + 0.2, { g: 0.5 });

  camTrack(cam, world, { t: s.start, v: { x: 960, y: 540, z: 1 } }, [
    [Tend('o6a') + 0.9, { x: 2940, y: 560, z: 1 }, 1.2, { sfx: true }],
    [Tend('o8') + 0.9, { x: 4960, y: 520, z: 1 }, 1.3, { sfx: true }],
  ], { end: s.end });
});
