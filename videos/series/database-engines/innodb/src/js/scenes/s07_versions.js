// 第 07 章：怎么改：回滚与版本。站 A：原地更新、undo、回滚指针、回滚（D03、D08、I16、I06）；
// 站 B：另一个会话的一致性读与读视图（术语表 consistent read、D04、I07）；站 C：可重复读与读已提交的实验时序（I08，按先后排列）；站 D：多版本（术语表 MVCC）。
scene('s07', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 9000, 1400);
  const XB = 2200, XC = 4400, XD = 6600;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const hv = (v, bg) => `<span style="background:${bg || C.blue};color:#fff;border-radius:6px;padding:0 8px">${v}</span>`;
  const sess = (x, y, label, cls = 'ink') => { const e = txt(world, '', label, x, y); css(e, { padding: '8px 18px', borderRadius: '12px', font: '700 30px "Sans SC", "Open Sans"', background: cls === 'ink' ? C.ink : cls === 'blue' ? C.blue : '#bddcd7', color: cls === 'pale' ? C.ink : '#fff' }); return e; };

  // ── 站 A：改数据 ──
  const q1 = txt(world, 't-n dim', '上一期的第三个问题：怎么并发', 104, 130), q2 = txt(world, 't-2', '先看：怎么改数据', 100, 170);
  fin(q1, at('e1') - 0.35); fin(q2, at('e1') - 0.2);
  const goal1 = tag(world, 1100, 200, '能回滚', 'blue'), goal2 = tag(world, 1290, 200, '不挡住别人读', 'blue');
  pop(goal1, at('e2', '回滚')); pop(goal2, at('e2', '别人读'));
  const PG = panel(world, 96, 320, 900, 400, '第 4 页 · users', { name: 'page' });
  const ra = row(world, 140, 420, 812, '1' + sp(3) + 'alice' + sp(3) + '30'), rn = txt(world, 't-s dim', 'notes 第 1 行：hello', 140, 520);
  showPanel(PG, at('e1') + 2.6); fin(ra, at('e1') + 2.9); fin(rn, at('e1') + 3.1);
  const t31 = at('e3', '31'), tBack = at('e6', '写回去');
  keyed(ra).at(at('e2') + 0.1, { cls: 'row dk' }).at(t31, { cls: 'row' });   // 要改的这一行先压暗（keyed 会整体重设类名，所以类名也交给它管）
  keyed(ra).at(t31, { html: '1' + sp(3) + 'alice' + sp(3) + hv('31') }).at(tBack, { html: '1' + sp(3) + 'alice' + sp(3) + '30' });
  keyed(rn).at(t31, { html: 'notes 第 1 行：' + hv('birthday') }).at(at('e7', 'hello'), { html: 'notes 第 1 行：hello' });
  sfx('pop', t31, { g: 0.55 });
  const inP = tag(world, 140, 600, '新值直接写在原来的位置'); fin(inP, at('e3', '原来的位置'));
  const PU = panel(world, 1040, 320, 784, 400, 'undo 日志', { name: 'undo-log' });
  const ur = row(world, 1084, 420, 696, 'age = 30（改之前）', 'old');
  showPanel(PU, at('e4', 'undo') - 0.4); fin(ur, at('e4', '30'), { y: -20 }); sfx('pop', at('e4', '30'), { g: 0.5, p: 0.4 });
  const rp = gline(g, 'M560 448 C 700 360, 900 340, 1076 440', 'or', { w: 5, arrow: true, dashed: '12 8' });
  const rpT = txt(world, 't-s', '回滚指针', 760, 330); css(rpT, { color: C.ink, background: C.or, padding: '4px 10px', borderRadius: '8px' });
  arrowIn(rp, at('e5', '回滚指针') - 0.1, 0.5); pop(rpT, at('e5', '回滚指针') + 0.2); sfx('tick', at('e5', '回滚指针'), { g: 0.4 });
  const rb = gline(g, 'M1080 470 C 900 560, 700 560, 560 484', 'blue', { w: 5, arrow: true });
  const rbT = tag(world, 700, 640, 'ROLLBACK：按 undo 写回 30', 'blue');
  arrowIn(rb, at('e6', '回滚') - 0.1, 0.6); pop(rbT, at('e6', '回滚')); sfx('chime', tBack, { g: 0.35 });
  const both = tag(world, 1084, 600, '两张表都回到 30 和 hello'); pop(both, at('e7', 'hello'));

  // ── 站 B：别人来读 ──
  const PR = panel(world, XB + 96, 140, 1100, 740, '修改还没提交，别人来读', { name: 'reader' });
  const sA = sess(XB + 140, 240, '会话 A：在改，没提交', 'blue'), sB = sess(XB + 140, 520, '会话 B：来读 alice', 'ink');
  const cur = row(world, XB + 640, 240, 520, '1' + sp(2) + 'alice' + sp(2) + '31', 'on');
  const old = row(world, XB + 640, 400, 520, 'undo：age = 30', 'old');
  const tR = at('e8', '另一个会话');
  showPanel(PR, at('e8') - 0.3); pop(sA, at('e8') + 0.1); fin(cur, at('e8') + 0.2); fin(old, at('e8') + 0.3); pop(sB, tR);
  const sess8 = tag(world, XB + 140, 620, '会话：一条连到数据库的连接，各自执行自己的事务'); css(sess8, { whiteSpace: 'normal', width: '980px', lineHeight: '1.3' }); fin(sess8, at('e8b', '连接') - 0.2);
  out(sess8, at('e9') - 0.1);
  const no31 = gline(g, `M${XB + 520} 548 L${XB + 630} 290`, 'dim', { w: 4, dashed: '8 8' }); const noX = tag(world, XB + 540, 330, '看不到没提交的 31', 'or');
  arrowIn(no31, at('e9') - 0.1, 0.3); pop(noX, at('e9', '31'));
  const via = gline(g, `M${XB + 900} 300 L${XB + 900} 392`, 'or', { w: 5, arrow: true, dashed: '10 7' }); const got = gline(g, `M${XB + 520} 560 L${XB + 632} 440`, 'blue', { w: 5, arrow: true });
  arrowIn(via, at('e9b', '回滚指针') - 0.1, 0.35); arrowIn(got, at('e9b', '30') - 0.2, 0.35);
  const res30 = txt(world, '', '读到 30', XB + 140, 700); css(res30, { font: '800 64px/1 "Sans SC"', color: C.blue }); pop(res30, at('e9b', '30'), { from: 0.8, origin: '0 50%' }); sfx('blip', at('e9b', '30'), { g: 0.55 });
  const cr = tag(world, XB + 640, 520, '一致性读：不加锁，读某一时刻的数据', 'blue'); css(cr, { top: '500px' }); pop(cr, at('e10', '一致性读'));
  const PV = panel(world, XB + 1240, 140, 584, 740, '读视图', { cls: 'hot', name: 'read-view' });
  const v1 = txt(world, 't-n wrap', '记下开始读的那一刻：', XB + 1280, 230), v2 = txt(world, 't-4', '还没提交的事务', XB + 1280, 300);
  const v3 = txt(world, '', '会话 A', XB + 1280, 380); css(v3, { padding: '8px 18px', borderRadius: '12px', font: '700 34px "Sans SC"', background: C.blue, color: '#fff' });
  const v4 = txt(world, 't-4 wrap', '它们的修改：都看不见', XB + 1280, 480); css(v4, { width: '500px' });
  const v5 = txt(world, 't-n dim wrap', '于是这次读，取的是旧版本', XB + 1280, 620); css(v5, { width: '500px' });
  showPanel(PV, at('e11', '读视图') - 0.2); fin(v1, at('e12', '那一刻') - 0.3); fin(v2, at('e12b', '没提交') - 0.2); pop(v3, at('e12b', '没提交')); fin(v4, at('e12b', '看不见')); fin(v5, at('e12b', '看不见') + 0.5);
  sfx('pop', at('e12b', '没提交'), { g: 0.5 });

  // ── 站 C：可重复读与读已提交 ──
  const hC = txt(world, 't-3', '可重复读：第一次读时建立读视图，之后一直用它', XC + 100, 140); fin(hC, at('e13', '可重复读') - 0.2);
  const PT = panel(world, XC + 96, 230, 1180, 660, null, { name: 'rr-timeline' });
  const lane = blk(world, 'bg-t0', XC + 116, 250, 568, 620); lane.style.borderRadius = '14px'; fin(lane, at('e13b') + 0.1, { y: 0, d: 0.5 });   // 这个事务这一列：同一个读视图
  const la = txt(world, 't-4', '这个事务', XC + 140, 270), lb = txt(world, 't-4 dim', '另一个会话', XC + 760, 270);
  const sep = blk(world, 'bg-t1', XC + 700, 270, 4, 590);
  showPanel(PT, at('e13') + 0.1); fin(la, at('e13') + 0.5); fin(lb, at('e13') + 0.8);
  const rvLine = gline(g, `M${XC + 122} 440 L${XC + 122} 710`, 'blue', { w: 5, dashed: '10 8' }); drawIn(rvLine, at('e13b', '一直'), 0.6, { dash: '10 8' }); fromTo(sep, at('e13b'), { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0', duration: 0.5 });
  const ev = (x, y, html, cls) => { const e = row(world, x, y, 500, html, cls); css(e, { fontSize: '28px' }); return e; };
  const b1 = ev(XC + 760, 360, 'UPDATE … age=31 · 提交', 'dk'), a1 = ev(XC + 140, 450, 'SELECT age → 31', 'on'), b2 = ev(XC + 760, 560, 'UPDATE … age=32 · 提交', 'dk'), a2 = ev(XC + 140, 650, 'SELECT age → 31', 'on');
  const a3 = ev(XC + 140, 780, 'SELECT … FOR UPDATE → 32', 'lk');
  const rvM = tag(world, XC + 140, 520, '← 读视图在这里建立'); css(rvM, { top: '516px', fontSize: '28px' });
  fin(b1, at('e14') + 0.2); fin(a1, at('e14', '读到 31')); pop(rvM, at('e14', '第一次'));
  fin(b2, at('e15', '32') - 0.2); fin(a2, at('e15', '还是 31')); sfx('blip', at('e15', '还是 31'), { g: 0.5 });
  const same = tag(world, XC + 140, 716, '同一个读视图', 'blue'); css(same, { top: '712px', fontSize: '28px' }); pop(same, at('e15', '还是 31') + 0.3);
  fin(a3, at('e16b', '32') - 0.3); const lk3 = lockBadge(world, XC + 600, 790); pop(lk3, at('e16b', '32')); sfx('pop', at('e16b', '32'), { g: 0.5 });
  const fu = txt(world, 't-n', '← 加锁读：读最新的值，并且不让别人改', XC + 730, 790); css(fu, { zIndex: 6 }); fin(fu, at('e16', '最新'));
  const PC = panel(world, XC + 1320, 230, 504, 660, '读已提交', { name: 'rc' });
  const rc1 = txt(world, 't-n wrap', '每次读都建立新的读视图', XC + 1360, 310); css(rc1, { width: '430px' });
  const rr = [ev(XC + 1360, 430, 'SELECT → 32', 'on'), ev(XC + 1360, 520, '另一会话改成 33 · 提交', ''), ev(XC + 1360, 610, 'SELECT → 33', 'on')];
  rr.forEach((e) => css(e, { width: '430px' }));
  showPanel(PC, at('e17') - 0.2); fin(rc1, at('e17', '新的读视图') - 0.2); rr.forEach((e, i) => fin(e, at('e17', '新的读视图') + i * 0.5));
  const fresh = tag(world, XC + 1360, 720, '能读到刚提交的值', 'blue'); pop(fresh, at('e17b', '刚提交'));

  // ── 站 D：多版本 ──
  const PD = panel(world, XD + 96, 140, 1728, 740, '同一行，不同的事务看到不同的版本', { name: 'versions' });
  const vs = [['1  alice  32', 'on', '最新'], ['1  alice  31', 'old', '旧版本'], ['1  alice  30', 'old', '更旧的版本']].map(([t_, cls, l], i) => {
    const e = row(world, XD + 700, 260 + i * 170, 600, t_.replace(/ /g, '&nbsp;'), cls); const lab = txt(world, 't-s dim', l, XD + 1320, 274 + i * 170);
    return [e, lab];
  });
  const tD = at('e18', '不同的版本');
  showPanel(PD, at('e18') - 0.3); vs.forEach(([e, l], i) => { fin(e, tD - 0.6 + i * 0.15); fin(l, tD - 0.5 + i * 0.15); });
  [0, 1].forEach((i) => { const l = gline(g, `M${XD + 1000} ${316 + i * 170} L${XD + 1000} ${424 + i * 170}`, 'or', { w: 4, arrow: true, dashed: '10 7' }); arrowIn(l, tD - 0.3 + i * 0.15, 0.3); });
  const rd = [['加锁读', 'lk', 0], ['这个事务（可重复读）', 'pale', 1]].map(([t_, cls, k]) => { const e = sess(XD + 160, 260 + k * 170, t_, cls === 'lk' ? 'blue' : 'pale'); const l = gline(g, `M${XD + 560} ${290 + k * 170} L${XD + 690} ${290 + k * 170}`, 'ink', { w: 4, arrow: true }); pop(e, tD + 0.2 + k * 0.2); arrowIn(l, tD + 0.3 + k * 0.2, 0.3); return e; });
  const mvT = txt(world, 't-2 blue', '这就是多版本', XD + 160, 760); fin(mvT, at('e18', '多版本')); sfx('chime', at('e18', '多版本'), { g: 0.35 });

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('e8') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('e13') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('e18') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
  ]);
});
