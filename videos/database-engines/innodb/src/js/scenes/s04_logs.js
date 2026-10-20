// 第 04 章：崩溃：日志。站 A：Gray 1981 年论文关于 undo、redo、提交记录的三句原文（I27）与日志带；崩溃后重做与撤销；
// 站 B：1992 年 ARIES 的标题（I30）与「日志先写到磁盘、数据晚一点写」（I42）；站 C：OLTP（I38，术语表原句）。
scene('s04', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 7000, 1400);
  const XB = 2200, XC = 4400;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;

  // ── 站 A：日志 ──
  const ht = txt(world, 't-3', '<span class="ib">原子性 · 持久性</span><span class="ib">&nbsp;→ 日志</span>', 100, 140);
  const [ht1, ht2] = ht.querySelectorAll('span'); fin(ht1, at('r1') - 0.35); fin(ht2, at('r1', '日志') - 0.2);
  const PQ = panel(world, 96, 230, 1060, 660, 'Jim Gray，1981', { name: 'gray-quotes' });
  const qs = [
    ['r3b', 'undo', '“…every undoable action must not only do the action but must also leave behind a string, crumb or <span class="k">undo log record</span> which allows the operation to be undone.”'],
    ['r4b', 'redo', '“…every redoable action must not only do the operation but must also generate a <span class="k">redo log record</span> which allows the operations to be redone.”'],
    ['r5', '提交记录', '“In a log-based scheme, transaction commit is signaled by writing the <span class="k">commit record</span> to the log.”'],
  ].map(([id, w, html], i) => { const e = txt(world, 'quote', html, 140, 310 + i * 190); css(e, { width: '980px', fontSize: '30px' }); return [id, w, e]; });
  showPanel(PQ, at('r1') - 0.3);
  qs.forEach(([id, w, e], i) => { fin(e, i === 0 ? at('r2') + 0.3 : at(id === 'r5' ? 'r5' : id.replace('b', '')) - 0.1); classAt(e.querySelector('.k'), 'hl', at(id, w) - 0.1); });
  const PL = panel(world, 1200, 230, 624, 660, '日志', { name: 'log' }); showPanel(PL, at('r1', '持久性')); sfx('tick', at('r1', '日志'), { g: 0.4 });
  const recs = [['r3b', 'undo', 'UNDO', '改之前：age = 30', 'old'], ['r4b', 'redo', 'REDO', '改之后：age = 31', ''], ['r5', '提交记录', 'COMMIT', '提交记录', 'on']].map(([id, w, k, v, cls], i) => {
    const y = 320 + i * 130;
    const r = row(world, 1240, y, 544, `<b>${k}</b>` + sp(2) + `<span style="font:500 28px 'Sans SC'">${v}</span>`, cls);
    css(r, { height: '96px', lineHeight: '96px' }); if (cls === 'old') css(r, { lineHeight: '90px' });
    const tt = at(id, w); fin(r, tt - 0.1, { y: -20 }); sfx(i === 2 ? 'chime' : 'pop', tt, { g: i === 2 ? 0.4 : 0.5, p: 0.4 });
    return r;
  });
  const crash = blk(world, 'bg-or', 1220, 712, 584, 10); crash.style.borderRadius = '5px';
  const tCr = at('r6', '崩溃之后');
  fromTo(crash, tCr, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' }); sfx('thud', tCr, { g: 0.6 });
  const redoA = tag(world, 1240, 750, '已提交 → 按 redo 重做', 'blue'), undoA = tag(world, 1240, 810, '没提交 → 按 undo 撤销');
  pop(redoA, at('r6', '重做')); pop(undoA, at('r6b', '撤销')); sfx('tick', at('r6b', '撤销'), { g: 0.4 });
  beat(recs[1], at('r6', '重做')); beat(recs[0], at('r6b', '撤销'));
  const ok = tag(world, 1560, 810, '回到一致的状态'); pop(ok, at('r6b', '一致'));

  // ── 站 B：ARIES 与预写日志 ──
  const ca = litCard(world, XB + 96, 140, 1728, { year: '1992', title: 'ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using <span class="k">Write-Ahead Logging</span>', meta: 'C. Mohan, D. Haderle, B. Lindsay, H. Pirahesh, P. Schwarz · ACM TODS 17(1), 1992', h: 400, titleH: 116 });
  showCard(ca, at('r7', '1992') - 0.2); classAt(ca.ti.querySelector('.k'), 'hl', at('r7', '预写日志') - 0.1); sfx('pop', at('r7', '预写日志'), { g: 0.5 });
  const wal = txt(world, 't-2', '预写日志：日志写在数据之前', XB + 100, 580); fin(wal, at('r8', '之前') - 0.3);
  const lf = fileIcon(world, XB + 120, 700, 150, 190, { tag: 'LOG' }), df = fileIcon(world, XB + 900, 700, 150, 190, { lines: [0.7, 0.6, 0.8] });
  const n1 = txt(world, '', '1', XB + 300, 720), n2 = txt(world, '', '2', XB + 1080, 720);
  [n1, n2].forEach((e) => css(e, { width: '64px', height: '64px', borderRadius: '16px', background: C.blue, color: '#fff', font: '800 40px/64px "Open Sans"', textAlign: 'center' }));
  const l1 = txt(world, 't-4', '日志先写到磁盘', XB + 300, 800), l2 = txt(world, 't-4 dim', '数据晚一点写', XB + 1080, 800);
  const tW = at('r8b', '磁盘');
  pop(lf.e, tW - 0.3); pop(n1, tW - 0.1); fin(l1, tW); sfx('pop', tW, { g: 0.5 });
  pop(df.e, at('r8b', '晚一点') - 0.2); pop(n2, at('r8b', '晚一点')); fin(l2, at('r8b', '晚一点') + 0.1); sfx('tick', at('r8b', '晚一点'), { g: 0.4 });

  // ── 站 C：OLTP ──
  const PO = panel(world, XC + 96, 140, 900, 740, null, { name: 'oltp' });
  const rnd = seeded(31), GX = XC + 1060, GY = 170;
  const cells = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) { const k = rnd(); const e = tile(world, GX + c * 76, GY + r * 76, 62, 62, k < 0.4 ? 't3' : k < 0.75 ? 't1' : 't0'); cells.push([e, rnd()]); }
  const tO = at('o1') + 0.6;
  cells.forEach(([e, k]) => pop(e, tO - 0.5 + k * 3.0));
  for (let i = 0; i < 7; i++) sfx('tick', tO - 0.5 + i * 0.45, { g: 0.25, p: 0.5 });
  const lgW = tile(world, GX, GY + 630, 34, 34, 't3'), lgWt = txt(world, 't-s dim', '一个短小的事务', GX + 50, GY + 628);
  fin(lgW, at('o1', '短小')); fin(lgWt, at('o1', '短小'));
  const ot = txt(world, '', 'OLTP', XC + 140, 180); css(ot, { font: '800 200px/1 "Open Sans"', color: C.ink, letterSpacing: '-.02em' });
  const oe = txt(world, 't-4', 'Online Transaction Processing', XC + 146, 410), oz = txt(world, 't-3 blue', '联机事务处理', XC + 146, 470);
  showPanel(PO, at('o2') - 0.4); pop(ot, at('o2', 'OLTP') - 0.05, { from: 0.85, origin: '0 50%' }); sfx('thud', at('o2', 'OLTP'), { g: 0.6 }); fin(oe, at('o2', 'OLTP') + 0.3); fin(oz, at('o2', '联机'));
  const tr3 = [['事务多', '事务多'], ['读写都频繁', '读写'], ['每次少量数据', '少量']].map(([t_, w], i) => { const e = tag(world, XC + 146 + [0, 180, 420][i], 580, t_); pop(e, at('o3', w)); sfx('tick', at('o3', w), { g: 0.35, p: -0.3 + i * 0.3 }); return e; });
  const ex = [['航班订座', '航班'], ['银行存款', '银行']].map(([t_, w], i) => { const e = tag(world, XC + 146 + i * 220, 650, t_, 'blue'); pop(e, at('o3b', w)); sfx('pop', at('o3b', w), { g: 0.4 }); return e; });
  const oq = txt(world, 'quote', '“With its <span class="k0">row-level locking</span> and <span class="k1">transactional capability</span>, InnoDB is the ideal storage engine for MySQL tables used in OLTP applications.”', XC + 146, 730);
  css(oq, { width: '800px', fontSize: '28px' });
  fin(oq, at('o4') - 0.1); classAt(oq.querySelector('.k0'), 'hl', at('o4', '行级锁')); classAt(oq.querySelector('.k1'), 'hl', at('o4', '事务'));
  const goT = tag(world, GX, GY + 690, '下面看 InnoDB 具体怎么做 →', 'blue'); pop(goT, at('o5') + 0.2); sfx('whoosh', at('o5') + 0.2, { g: 0.3 });

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('r7') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('o1') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
  ]);
});
