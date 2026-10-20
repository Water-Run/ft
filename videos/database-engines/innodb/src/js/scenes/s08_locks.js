// 第 08 章：锁。站 A：上一期的表锁与 InnoDB 加在索引记录上的锁（D05、术语表 record lock）；站 B：记录锁实验（I09；表上的意向锁、互不影响、等待超时）；
// 站 C：间隙锁与幻读（I10、术语表 gap lock、phantom、D05）；站 D：死锁（I11、D13、术语表 deadlock）。
scene('s08', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 9000, 1400);
  const XB = 2200, XC = 4400, XD = 6600;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const R = D.indexes[0].records;
  const sess = (x, y, label, cls = 'ink') => { const e = txt(world, '', label, x, y); css(e, { padding: '8px 18px', borderRadius: '12px', font: '700 30px "Sans SC", "Open Sans"', background: cls === 'ink' ? C.ink : cls === 'blue' ? C.blue : '#bddcd7', color: cls === 'pale' ? C.ink : '#fff' }); return e; };

  // ── 站 A：表锁与记录锁 ──
  const PM = panel(world, 96, 140, 820, 740, '上一期 · MyISAM', { name: 'table-lock' });
  const mr = [0, 1, 2, 3, 4, 5].map((i) => row(world, 140, 240 + i * 74, 732, '', 't1'));
  const mRing = gring(g, 124, 224, 764, 460, { name: 'table-ring' }); const mLk = lockBadge(world, 860, 210); const mT = tag(world, 140, 720, '锁整张表', 'or');
  // 章名只有一个「锁」字，章节标题收起时画面几乎是空的：面板、六行与两个会话在本场淡入之前就位，随本场一起出现
  showPanel(PM, c0 - 0.75); mr.forEach((e, i) => fin(e, c0 - 0.7 + i * 0.03, { y: 6 }));
  // 两个会话想同时改同一行
  const wA = sess(560, 150, '会话 A', 'blue'), wB = sess(740, 150, '会话 B');
  const waA = gline(g, 'M624 206 L600 306', 'ink', { w: 4, arrow: true }), waB = gline(g, 'M806 206 L664 306', 'ink', { w: 4, arrow: true });
  pop(wA, c0 - 0.5); pop(wB, c0 - 0.4); beat(wB, at('f1', '别人'), 1.1); arrowIn(waA, at('f1', '同时改') + 0.1, 0.3); arrowIn(waB, at('f1', '同一行'), 0.3); classAt(mr[1], 'on', at('f1', '同一行'), at('f1b') - 0.1);
  sfx('pop', at('f1', '别人'), { g: 0.4, p: 0.2 }); sfx('pop', at('f1', '同时改'), { g: 0.4, p: 0.4 });
  [wA, wB, waA, waB].forEach((e) => out(e, at('f1b') - 0.1));
  drawIn(mRing, at('f1b', '整张表') - 0.2, 0.5); pop(mLk, at('f1b', '整张表')); pop(mT, at('f1b', '整张表') + 0.2); sfx('pop', at('f1b', '整张表'), { g: 0.5 });
  const PI = panel(world, 1004, 140, 820, 740, 'InnoDB · 主键索引的叶子', { cls: 'hot', name: 'record-lock' });
  const ir = R.slice(0, 6).map((r, i) => row(world, 1048, 240 + i * 74, 732, r.id + sp(3) + pad(r.name, 7) + r.age));
  const iRing = gring(g, 1032, 224 + 74, 764, 88, { name: 'record-ring' }); const iLk = lockBadge(world, 1770, 290);
  const iT = txt(world, 't-n wrap', '锁加在访问到的索引记录上；行就存在这里，锁住一条记录，就是锁住一行', 1048, 720); css(iT, { width: '730px' });
  showPanel(PI, at('f2') - 0.3); ir.forEach((e, i) => fin(e, at('f2') - 0.1 + i * 0.04, { y: 6 }));
  drawIn(iRing, at('f2', '索引记录'), 0.4); pop(iLk, at('f2', '索引记录') + 0.2); fin(iT, at('f2b', '叶子')); classAt(ir[1], 'lk', at('f2b', '一行')); sfx('pop', at('f2b', '一行'), { g: 0.5, p: 0.4 });

  // ── 站 B：记录锁实验 ──
  const PT = panel(world, XB + 96, 140, 640, 740, 'users', { name: 'rows' });
  const br = R.map((r, i) => row(world, XB + 140, 220 + i * 76, 552, r.id + sp(3) + pad(r.name, 7) + r.age));
  const ixT = txt(world, '', '意向锁', XB + 560, 160); css(ixT, { padding: '4px 12px', borderRadius: '9px', background: C.or, color: C.ink, font: '700 28px "Sans SC"' });
  showPanel(PT, at('f3') - 0.4); br.forEach((e, i) => fin(e, at('f3') - 0.2 + i * 0.03, { y: 6, d: 0.3 }));
  const PS = panel(world, XB + 780, 140, 1044, 740, null, { name: 'sessions' });
  const sA = sess(XB + 820, 170, '会话 A', 'blue'), sB = sess(XB + 820, 440, '会话 B');
  const qa = sql(world, XB + 820, 240, 960, 'SELECT id,age FROM users WHERE id=1 FOR UPDATE;');
  const qb1 = sql(world, XB + 820, 510, 960, 'UPDATE users SET age=26 WHERE id=2;'), qb2 = sql(world, XB + 820, 650, 960, 'UPDATE users SET age=34 WHERE id=1;');
  const tA = at('f3', '会话 A');
  showPanel(PS, tA - 0.3); pop(sA, tA); fin(qa, tA, { y: 0, d: 0.2 }); typeSql(qa, tA + 0.1, 60);
  classAt(br[0], 'lk', at('f3', '锁住')); const lk1 = lockBadge(world, XB + 660, 228); pop(lk1, at('f3', '锁住')); sfx('pop', at('f3', '锁住'), { g: 0.55 });
  const ok1 = txt(world, 't-s blue', '锁住了 id = 1', XB + 826, 312); fin(ok1, at('f3', '锁住') + 0.2);
  pop(ixT, at('f4', '意向锁')); const ixN = txt(world, 't-s dim', '表上：意向锁', XB + 826, 352); fin(ixN, at('f4', '意向锁') + 0.2); sfx('pop', at('f4', '意向锁'), { g: 0.45, p: -0.3 });
  pop(sB, at('f5') - 0.1); fin(qb1, at('f5'), { y: 0, d: 0.2 }); typeSql(qb1, at('f5') + 0.1, 60);
  classAt(br[1], 'on', at('f5', '照常')); const done = tag(world, XB + 826, 584, '照常完成', 'blue'); pop(done, at('f5', '照常')); sfx('chime', at('f5', '照常'), { g: 0.35 });
  fin(qb2, at('f6') - 0.1, { y: 0, d: 0.2 }); typeSql(qb2, at('f6'), 60);
  const wbar = gapBox(world, XB + 826, 724, 10, 40); const tW = at('f6', '等');
  F((t) => { const k = clamp((t - tW) / 2.2); wbar.style.width = (10 + 600 * k).toFixed(0) + 'px'; wbar.style.visibility = t >= tW ? 'visible' : 'hidden'; });
  const wT = txt(world, 't-s dim', '等待…', XB + 1450, 730); fin(wT, tW);
  const err = txt(world, 'out', 'ERROR 1205: Lock wait timeout exceeded', XB + 826, 790); fin(err, at('f6', '超时')); sfx('error', at('f6', '超时'), { g: 0.5 });
  const one = tag(world, XB + 140, 830, '按主键查一个值：只锁这一行', 'blue'); css(one, { top: '842px' }); pop(one, at('f7', '一个值'));

  // ── 站 C：间隙锁与幻读 ──
  const hC = txt(world, 't-3', '按范围查：还要锁住行与行之间的空隙', XC + 100, 140); fin(hC, at('f8', '范围') - 0.2);
  const PG = panel(world, XC + 96, 230, 1728, 660, null, { name: 'gap-locks' });
  const qg = sql(world, XC + 140, 260, 1200, 'SELECT id FROM users_gap WHERE id>10 AND id<30 FOR UPDATE;');
  showPanel(PG, at('f8') - 0.1); fin(qg, at('f9') - 0.3, { y: 0, d: 0.2 }); typeSql(qg, at('f9') - 0.2, 70);
  const r20 = txt(world, 'out', '→ 20', XC + 1360, 266); fin(r20, at('f9', '只有 20')); sfx('blip', at('f9', '只有 20'), { g: 0.5 });
  const axis = gline(g, `M${XC + 160} 560 L${XC + 1780} 560`, 'ink', { w: 4 }); drawIn(axis, at('f8') + 0.2, 0.6);
  const XP = { 10: XC + 380, 20: XC + 900, 30: XC + 1420 }, RW = 150;
  const rec = {};
  [10, 20, 30].forEach((v, i) => { const e = tile(world, XP[v], 500, RW, 120, 't4'); const t_ = txt(world, 'mono t-3 white', String(v), XP[v] + 40, 528); rec[v] = e; pop(e, at('f8') + 0.4 + i * 0.1); fin(t_, at('f8') + 0.5 + i * 0.1); });
  const gp1 = gapBox(world, XP[10] + RW + 12, 510, XP[20] - XP[10] - RW - 24, 100), gp2 = gapBox(world, XP[20] + RW + 12, 510, XP[30] - XP[20] - RW - 24, 100);
  const gl = tag(world, XC + 140, 700, '间隙锁：锁住行与行之间的空隙', 'or');
  pop(gl, at('f8b', '间隙锁')); fromTo(gp1, at('f8b') + 0.1, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0 50%', duration: 0.5 }); out(gp1, at('f9') - 0.1, 0.2); out(gl, at('f9') - 0.1, 0.2);
  const ring20 = gring(g, XP[20] - 12, 488, RW + 24, 144, { name: 'lock-20' });
  const tL = at('f10', '这一行');
  drawIn(ring20, tL - 0.1, 0.35); classAt(rec[20], 'or', tL, at('f13b', '释放')); sfx('pop', tL, { g: 0.5 });
  const gp1b = gapBox(world, XP[10] + RW + 12, 510, XP[20] - XP[10] - RW - 24, 100);
  fromTo(gp1b, at('f10', '空隙'), { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '100% 50%', duration: 0.5 });
  fromTo(gp2, at('f10b', '30'), { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0 50%', duration: 0.5 }); sfx('tick', at('f10b', '30'), { g: 0.4 });
  const l1 = txt(world, 't-s', '20 这一行 + 它前面的空隙', XP[10] + RW + 20, 650), l2 = txt(world, 't-s', '30 前面的空隙', XP[20] + RW + 40, 650);
  fin(l1, at('f10', '空隙') + 0.2); fin(l2, at('f10b', '30') + 0.2);
  const ins = tile(world, XC + 700, 330, 140, 100, 'or'); const insT = txt(world, 'mono t-3', '15', XC + 740, 350); const insS = sess(XC + 520, 340, '会话 B');
  const tI = at('f11', '15');
  pop(insS, tI - 0.3); pop(ins, tI); fin(insT, tI + 0.1);
  const wt = tag(world, XC + 860, 360, '落在被锁的空隙里：只能等'); pop(wt, at('f11', '只能等')); sfx('error', at('f11', '只能等'), { g: 0.4 });
  const ph = row(world, XC + 140, 760, 760, 'SELECT … → 20' + sp(2) + '<span style="border:3px dashed var(--dim);border-radius:6px;padding:0 8px">15</span>');
  const phT = tag(world, XC + 940, 768, '多出一行：这就是幻读', 'or');
  fin(ph, at('f12', '再查一次')); pop(phT, at('f12b', '幻读')); sfx('pop', at('f12b', '幻读'), { g: 0.45 });
  const stop = tag(world, XC + 1360, 768, '间隙锁挡住了它', 'blue'); pop(stop, at('f13', '挡住'));
  const tRb = at('f13b', '释放');
  [gp1b, gp2, ring20].forEach((e) => out(e, tRb, 0.25)); out(wt, tRb, 0.2);
  tl.fromTo(ins, { x: 0, y: 0 }, { x: XC + 640 - (XC + 700) - 5, y: 500 - 330 + 10, duration: 0.6, ease: 'back.out(1.4)', immediateRender: false }, at('f13b', '插入成功') - 0.3);
  tl.fromTo(insT, { x: 0, y: 0 }, { x: XC + 640 - (XC + 700) - 5, y: 500 - 330 + 10, duration: 0.6, ease: 'back.out(1.4)', immediateRender: false }, at('f13b', '插入成功') - 0.3);
  sfx('chime', at('f13b', '插入成功'), { g: 0.4 });

  // ── 站 D：死锁 ──
  const PD = panel(world, XD + 96, 140, 1728, 740, '死锁：各锁住一行，又去等对方那一行', { cls: 'warn', name: 'deadlock' });
  const dA = sess(XD + 200, 300, '事务 1', 'blue'), dB = sess(XD + 200, 600, '事务 2');
  const d1 = row(world, XD + 820, 290, 360, 'id 1', 'lk'), d2 = row(world, XD + 820, 590, 360, 'id 2', 'lk');
  showPanel(PD, at('f14') - 0.3); pop(dA, at('f14') + 0.1); pop(dB, at('f14') + 0.2); fin(d1, at('f14', '死锁')); fin(d2, at('f14', '死锁') + 0.1);
  const h1 = gline(g, `M${XD + 380} 318 L${XD + 808} 318`, 'ink', { w: 5, arrow: true }), h2 = gline(g, `M${XD + 380} 618 L${XD + 808} 618`, 'ink', { w: 5, arrow: true });
  const w1 = gline(g, `M${XD + 380} 340 L${XD + 808} 600`, 'or', { w: 5, arrow: true, dashed: '12 8' }), w2 = gline(g, `M${XD + 380} 596 L${XD + 808} 336`, 'or', { w: 5, arrow: true, dashed: '12 8' });
  arrowIn(h1, at('f14b', '各锁住'), 0.35); arrowIn(h2, at('f14b', '各锁住') + 0.2, 0.35);
  arrowIn(w1, at('f14b', '对方') - 0.2, 0.4); arrowIn(w2, at('f14b', '对方'), 0.4); sfx('error', at('f14b', '对方'), { g: 0.4 });
  const det = tag(world, XD + 1260, 300, 'InnoDB 发现死锁', 'blue'); pop(det, at('f15', '发现'));
  const tRb2 = at('f15', '回滚其中一个');
  out(w2, tRb2 + 0.2, 0.2); out(h2, tRb2 + 0.2, 0.2); classAt(dB, 'dimmed', tRb2 + 0.2); classAt(d2, 'old', tRb2 + 0.2);
  const rbT = tag(world, XD + 1260, 600, '回滚事务 2'); pop(rbT, tRb2); const cont = tag(world, XD + 1260, 380, '事务 1 继续', 'blue'); pop(cont, at('f15', '继续'));
  const er2 = txt(world, 'out', 'ERROR 1213: Deadlock found', XD + 200, 760); fin(er2, at('f16', '死锁错误')); sfx('error', at('f16', '死锁错误'), { g: 0.45 });
  const re = tag(world, XD + 820, 760, '由应用重新执行'); pop(re, at('f16', '重新执行'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('f3') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('f8') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('f14') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
  ]);
});
