// 第 08 章 出错怎么办：日志。
// 主画面：手册式架构图（内存里的缓冲池、日志缓冲；磁盘上的 users.ibd、doublewrite、redo 日志带子）+ 下方的泳道。
// 一、改数据改的是缓冲池里的页（脏页），提交时等 redo 落盘；redo 只往后追加，检查点记下写回到哪里（M27、M31、S7、M32、R2）。
// 二、实验：Alice 提交了 43，管理员的全表更新改到 258 行时强行结束（R1）。
// 三、重启：从检查点读 redo、重放 187 条，再撤销事务 1563 的 274 次行操作（R3）；Alice 43，其余 4095 行原值（R4）。
// 四、doublewrite：一页先写进 doublewrite 再写回原位，写坏了从那里取回完整的一份（M16、M33）。
// 同一个属性只由一个帧函数或一串首尾相接的补间改写，画面只由 t 决定。
scene('s8', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, 1);              // 镜头只极慢横移（parts.js）
  const ov = overlay(W);
  const C = D.crash;
  const fmt = (n) => n.toLocaleString('en-US').replace(/,/g, ' ');

  // ── 架构图 ──
  const ZM = zone(W, 120, 110, 560, 450, '内存', 'In-Memory');
  const ZD = zone(W, 720, 110, 1080, 450, '磁盘', 'On-Disk');
  const bp = boxEl(ZM, 20, 84, 520, 200, '缓冲池');
  const lb = boxEl(ZM, 20, 300, 520, 130, '日志缓冲');
  const ibd = boxEl(ZD, 20, 84, 640, 200, 'users.ibd');
  const dbw = boxEl(ZD, 680, 84, 380, 200, '双写缓冲区');
  const redo = boxEl(ZD, 20, 300, 1040, 130, 'redo 日志');
  // 页方块（44px，页号 22px）
  const sq8 = (parent, x, y, label) => { const e = h('div', 'sq', parent, label != null ? `<div class="l">${label}</div>` : ''); px(e, x, y, 44, 44); const l = e.querySelector('.l'); if (l) css(l, { fontSize: '22px', top: '7px' }); e.dataset.name = '页' + (label != null ? label : ''); return e; };
  const PAGES = [D.pk.root, ...PK_LEAVES];                       // T1：主键根页 4 + 21 页叶子
  const BP = [4, 7, 8, 11, 13, 15, 16, 18, 27, 20, 24, 25, 29, 31, 32, 34].filter((p) => PAGES.includes(p));   // 缓冲池里的页不按页号排；27 放在左下角，好让泳道的连线不穿过字
  const bpSq = BP.map((p, i) => sq8(bp, 22 + (i % 8) * 62, 58 + Math.floor(i / 8) * 64, p));
  const ibdSq = PAGES.slice(0, 20).map((p, i) => sq8(ibd, 22 + (i % 10) * 62, 58 + Math.floor(i / 10) * 64, p));   // 磁盘上的页也标页号，和缓冲池里同号的那一页对得上
  ibdSq.forEach((e) => e.classList.add('on'));
  const dbwSq = Array.from({ length: 10 }, (_, i) => sq8(dbw, 26 + (i % 5) * 68, 58 + Math.floor(i / 5) * 64, null));
  const lbSq = Array.from({ length: 8 }, (_, i) => sq8(lb, 22 + i * 62, 60, null));
  const i27 = BP.indexOf(D.alice.page);

  // redo 带子：横轴是日志序号（LSN），区间按本次实验的数（R2、R3）
  const TX = 24, TW = 990, TY = 58, L0 = 18950000, L1 = 20400000;
  const lx = (lsn) => TX + (lsn - L0) / (L1 - L0) * TW;
  const tape = h('div', 'abs', redo); px(tape, TX, TY, TW, 30); css(tape, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' });
  const tapeFill = h('div', 'abs', redo); px(tapeFill, TX, TY, 0, 30); css(tapeFill, { background: 'var(--pale)', borderRight: '3px solid var(--mainD)' });
  const tapeDone = h('div', 'abs', redo); px(tapeDone, TX, TY, 0, 30); css(tapeDone, { background: 'var(--teal)' });
  const head = h('div', 'abs num', redo, ''); css(head, { font: '600 22px Inter', color: 'var(--mainD)', top: '12px' });
  const ck = h('div', 'abs', redo); px(ck, lx(C.checkpoint) - 1, TY - 8, 3, 46); css(ck, { background: 'var(--ink)' });
  const ckL = h('div', 'abs num', redo, `检查点 ${fmt(C.checkpoint)}`); px(ckL, lx(C.checkpoint) - 4, TY + 38); css(ckL, { font: '600 22px "Inter", "Sans SC"', color: 'var(--ink)' });
  const lsnName = h('div', 'abs', redo, '日志序号（LSN）'); px(lsnName, TX, 12); css(lsnName, { font: '500 22px "Sans SC"', color: 'var(--ink2)' });
  W.appendChild(ov);

  wipe(ZM, c0 + 0.1, { dir: 'l', d: 0.6 }); wipe(ZD, c0 + 0.2, { dir: 'l', d: 0.6 }); sfx('whoosh', c0 + 0.1, { g: 0.4 });

  // 关键时刻
  const tKill = T('j14', '强行结束');
  const tDirtyA = T('j3') + 0.1;                          // Alice 那一页变脏
  const tFlushOther = T('j4', '安排');                            // 另一张脏页先写回
  const tUpd2 = T('j13');                                         // 管理员开始改：一页页变脏
  const tLogIn = T('j6'), tLogOut = T('j7', '磁盘');
  const tR = T('j15');
  const tFlush2 = Tend('j4') + 0.2;                               // 第二张脏页也写回
  const tRisk = T('j5') + 0.3;                                    // 「会不会丢」：Alice 那一页闪几下，内存那一块套上虚框
  const tFill = T('j16');                                         // 重启后重放 redo：页又读回缓冲池
  // 缓冲池里的页：on（缓存着、干净）、dirty（改过还没写回）、空（崩溃后内存一格格没了，重放时一格格读回）
  const DIRTY = { [i27]: [[tDirtyA, Infinity]], 13: [[T('j4') + 0.3, tFlushOther + 0.8]], 5: [[T('j4') + 1.2, tFlush2 + 0.8]] };
  const bpState = (i, t) => {
    if (t >= tFill + i * 0.12) return i === i27 && t >= T('j21') - 0.4 ? 'dirty' : (i % 3 === 1 ? '' : 'on');
    if (t >= tKill + i * 0.12) return '';
    if (t >= tUpd2) { const k = Math.floor(clamp((t - tUpd2) / (Tend('j13') - tUpd2)) * 6); if (i < k + 2 || i === i27) return 'dirty'; }
    if (i === i27 && t >= tRisk && t < tRisk + 3.2 && Math.floor((t - tRisk) / 0.4) % 2 === 1) return '';
    if ((DIRTY[i] || []).some(([a, b]) => t >= a && t < b)) return 'dirty';
    return i % 3 === 1 ? '' : 'on';
  };
  bpSq.forEach((e, i) => { let last = null; F((t) => { const st = bpState(i, t); if (st === last) return; last = st; e.className = 'sq ' + st; }); });
  // 日志缓冲：修改一条条记进来（j6），提交时写到磁盘、清空（j7）；实验里又满起来；崩溃时一格格丢掉
  lbSq.forEach((e, i) => {
    let last = null;
    F((t) => {
      let on = false;
      if (t >= tLogIn + 0.3 + i * 0.75 && t < tLogOut + i * 0.06) on = i < 5;
      if (t >= tUpd2 && t < tKill + i * 0.12) on = i < 2 + Math.floor(clamp((t - tUpd2) / (Tend('j13') - tUpd2)) * 6);
      const st = on ? 'sq dirty' : 'sq'; if (st === last) return; last = st; e.className = st;
    });
  });
  // 「脏页」这个名字标在 Alice 那一页下面
  const dTag = h('div', 'abs', bp, '脏页'); px(dTag, 22 + (i27 % 8) * 62 + 28, 58 + Math.floor(i27 / 8) * 64 + 44); css(dTag, { font: '700 22px "Sans SC"', color: 'var(--acc)' });   // 写在页格右下，不压竖着进来的那根红线
  vanish(dTag, 0); appear(dTag, T('j3', '脏页')); vanish(dTag, Tend('j8') + 0.3);
  // 「会不会丢」：内存那一块套上砖红虚框
  const risk = h('div', 'abs', W); px(risk, 116, 106, 568, 458); css(risk, { border: '4px dashed var(--acc)' }); risk.dataset.name = '内存会丢';
  vanish(risk, 0); appear(risk, tRisk); vanish(risk, Tend('j5') + 0.3);
  // 沿折线移动的小块：一次修改从泳道送到缓冲池的页、送进日志缓冲
  const packet = (pts, t0, dur, label) => {
    const e = h('div', 'abs', W, label); css(e, { font: '700 22px Inter', color: '#fff', background: 'var(--acc)', padding: '2px 8px' }); e.dataset.name = '修改';
    const segs = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([L, d, pts[i - 1], pts[i]]); L += d; }
    let last = null;
    F((t) => {
      const on = t >= t0 && t < t0 + dur;
      let x = -100, y = -100;
      if (on) { const s0 = ease.io3(clamp((t - t0) / dur)) * L; const g = segs.find(([a, d]) => s0 <= a + d) || segs[segs.length - 1]; const k = clamp((s0 - g[0]) / g[1]); x = lerp(g[2][0], g[3][0], k); y = lerp(g[2][1], g[3][1], k); }
      const key = on ? Math.round(x) + ',' + Math.round(y) : 'off'; if (key === last) return; last = key;
      e.style.display = on ? '' : 'none'; e.style.left = Math.round(x - 20) + 'px'; e.style.top = Math.round(y - 16) + 'px';
    });
    return e;
  };
  // 带子：写到了哪里（日志只往后追加）
  const lsnAt = (t) => {
    if (t < tLogOut) return 20200000;
    if (t < T('j8')) return lerp(20200000, 20300000, ease.out3(clamp((t - tLogOut) / 0.8)));
    return lerp(20300000, C.lsn, clamp((t - T('j8')) / Math.max(0.5, Tend('j8') - T('j8') - 0.5)));
  };
  let lastL = -1;
  F((t) => {
    const v = Math.round(lsnAt(t));
    if (v === lastL) return; lastL = v;
    const x = lx(v);
    tapeFill.style.width = Math.max(0, x - TX) + 'px';
    head.textContent = fmt(v); head.style.left = (x - 120) + 'px';
  });
  // 已经写回数据文件的那一段：检查点之前（j10）；重启时扫描重放到哪里，就青到哪里（R3）
  const tS0 = T('j15', '检查点'), tS1 = T('j16', '重做') + 0.6;
  const scanX = (t) => lx(lerp(C.checkpoint, C.scanned, ease.io3(clamp((t - tS0) / (tS1 - tS0)))));
  const xCk = lx(C.checkpoint);
  let lastD = -1;
  F((t) => {
    let w = 0;
    if (t >= T('j10')) w = (xCk - TX) * ease.out3(clamp((t - T('j10')) / 0.8));
    if (t >= tS0 && t < T('j21')) w = Math.max(xCk - TX, scanX(t) - TX);
    const fl = t >= T('j19', '不丢') && t < T('j19', '不丢') + 0.9;                    // 提交了的不丢：重放过的那段亮一下
    w = Math.round(w); const key = w + ':' + fl; if (key === lastD) return; lastD = key; tapeDone.style.width = w + 'px'; tapeDone.style.background = fl ? 'var(--main)' : 'var(--teal)';
  });
  const scan = h('div', 'abs', redo); px(scan, 0, TY - 10, 8, 50); css(scan, { background: 'var(--main)' });
  let lastS = null;
  F((t) => { const on = t >= tS0 && t < Tend('j19'); const k = on ? Math.round(scanX(t)) : -1; if (k === lastS) return; lastS = k; scan.style.visibility = on ? 'visible' : 'hidden'; scan.style.left = k + 'px'; });
  vanish(head, 0); appear(head, c0 + 0.7);
  wipe(ck, T('j9', '检查点'), { dir: 't', d: 0.3 }); slide(ckL, T('j9', '检查点') + 0.1, { y: 10 }); sfx('thud', T('j9', '检查点'), { g: 0.6 });
  lit(ibd, 'on', T('j10', '数据文件'), Tend('j10') + 0.3);

  // 手册式粗箭头：缓冲池 → users.ibd（写回脏页），日志缓冲 → redo（提交时落盘）
  const flushA = bigArrow(ov, 664, 290, 736, 26);
  const logA = bigArrow(ov, 664, 485, 736, 26);
  svgIn(flushA, tFlushOther - 0.3); svgOut(flushA, tFlush2 + 1.2);
  svgIn(logA, tLogOut - 0.3); svgOut(logA, Tend('j8'));
  lit(ibdSq[13], 'hot', tFlushOther + 0.3, tFlushOther + 1.4);                       // 写回的是页 31
  { const i27d = PAGES.indexOf(D.alice.page), d27 = ibdSq[i27d];
    const stale = h('div', 'abs', ibd); px(stale, 22 + (i27d % 10) * 62 - 5, 58 + Math.floor(i27d / 10) * 64 - 5, 54, 54); css(stale, { border: '3px dashed var(--acc)' });
    const staleL = h('div', 'abs', W, `页 ${D.alice.page}：内存里改过了，磁盘上这份还是旧的`); px(staleL, 740, 556); css(staleL, { font: '600 22px "Sans SC"', color: 'var(--acc)' });
    [stale, staleL].forEach((e) => { vanish(e, 0); show(e, tDirtyA + 0.4, { y: 0, d: 0.3 }); exit(e, Tend('j5') + 0.2, { d: 0.3 }); }); }
  const flushL = h('div', 'abs t-small', W, '写回：先存进双写缓冲区，再写到原位'); px(flushL, 1240, 556);
  vanish(flushL, 0); show(flushL, tFlushOther - 0.2, { y: 6, d: 0.3 }); exit(flushL, tDirtyA + 0.3 > tFlushOther ? tFlushOther + 1.6 : tFlush2 + 1.2, { d: 0.3 });
  lit(ibdSq[PAGES.indexOf(BP[5])], 'hot', tFlush2 + 0.3, tFlush2 + 1.4);            // 再写回页 15

  // ── 泳道一：Alice 一次普通的修改（j2–j8） ──
  const GA = h('div', 'abs', W); px(GA, 0, 0);                  // 泳道一整组进出：组上用补间，组里的条与播放头由帧函数管
  const LA = lanes(GA, { x: 120, y: 690, w: 1680, gap: 200, rowH: 150, names: ['Alice'], pts: [[T('j2') - 0.2, 360], [T('j7', '提交'), 980], [Tend('j8'), 1500]] });
  LA.enter(T('j2') - 0.4);
  const xUpd = LA.X(T('j2', '改数据'));
  const upd = LA.event(0, T('j2', '改数据'), 'UPDATE', 'ink', -60);
  const com = LA.event(0, T('j7', '提交'), 'COMMIT', '', -60);
  const uncA = LA.bar(LA.Y(0) - 22, T('j2', '改数据') + 0.1, T('j7', '提交'), '<span>43</span>', 'unc');
  const waitB = LA.bar(LA.Y(0) - 22, T('j7', '提交') + 0.1, tLogOut + 0.2, '', 'wait');
  const okA = h('div', 'pill fill', GA, MARK.ok(24, '#fff')); px(okA, LA.X(tLogOut + 0.2) + 10, LA.Y(0) - 20); slam(okA, tLogOut + 0.25, { from: 1.4 }); sfx('pop', tLogOut + 0.25);
  const phA = LA.playhead(T('j2') - 0.2, Tend('j8'), 620, 740);
  const x27 = 120 + 20 + 22 + (i27 % 8) * 62 + 22, y27 = 110 + 84 + 58 + Math.floor(i27 / 8) * 64 + 46;
  const upTo27 = path(ov, `M${xUpd},${LA.Y(0) - 84} L${xUpd},${580} L${x27},${580} L${x27},${y27 + 4}`, 'acc', { w: 2.2 });
  arrowIn(upTo27, T('j2', '缓冲池') - 0.2, 0.7);
  const upToLog = path(ov, `M${xUpd + 70},${LA.Y(0) - 84} L${xUpd + 70},${548}`, 'mainD', { w: 2.2 });
  arrowIn(upToLog, tLogIn - 0.2, 0.5);
  packet([[xUpd, LA.Y(0) - 84], [xUpd, 580], [x27, 580], [x27, y27 + 18]], T('j2', '缓冲池') - 0.4, 1.1, '43');   // 这次修改送进缓冲池里的页
  packet([[xUpd + 70, LA.Y(0) - 84], [xUpd + 70, 556]], tLogIn, 0.7, '');
  // 这一段的动作各配一声：改数据、页进缓冲池、变脏、另一张脏页写回、记 redo、redo 落盘
  sfx('pop', T('j2', '改数据'), { g: 0.45 }); sfx('tick', T('j2', '缓冲池') + 0.7, { g: 0.4 }); sfx('blip', tDirtyA, { g: 0.45 });
  sfx('whoosh', tFlushOther, { g: 0.35 }); sfx('tick', tLogIn + 0.6, { g: 0.4 }); sfx('thud', tLogOut, { g: 0.45 });                                  // 同时记一条 redo 进日志缓冲
  const sA = Tend('j8') + 0.3;
  [upTo27, upToLog].forEach((p) => svgOut(p, sA));
  exit(GA, sA, { y: 20, d: 0.35 });

  // ── 泳道二：实验（j11–j14） ──
  const xK = 1000;
  const GB = h('div', 'abs', W); px(GB, 0, 0);
  const LB = lanes(GB, { x: 120, y: 660, w: 900, gap: 200, rowH: 150, names: ['Alice', '管理员'], pts: [[T('j11') + 0.4, 360], [T('j12', '43') - 0.3, 430], [T('j12', '提交'), 610], [T('j13'), 680], [Tend('j13'), 960], [tKill, xK]] });
  LB.enter(T('j11'));
  const eB = [
    LB.event(0, T('j12', '43') - 0.3, 'UPDATE 43', 'ink', -60),
    LB.event(0, T('j12', '提交'), 'COMMIT', '', -60),
    LB.bar(LB.Y(0) - 22, T('j12', '43') - 0.2, T('j12', '提交'), '<span>43</span>', 'unc'),
    LB.event(1, T('j13') + 0.1, 'age = age + 1', 'acc', -60),
  ];
  const a43 = LB.bar(LB.Y(0) - 22, T('j12', '提交'), tKill, '43');
  // 管理员那根斜纹条：随播放头长到强行结束为止，重启后从右往左收回（撤销）。条内计数涨到 258（R1）
  const adm = h('div', 'vbar unc', GB, ''); px(adm, 0, LB.Y(1) - 22);
  const xa0 = LB.X(T('j13') + 0.2), xa1 = LB.X(tKill);
  const tU0 = T('j17') + 0.2, tU1 = Tend('j17');
  let lastAdm = '';
  F((t) => {
    let w = 0;
    if (t >= T('j13') + 0.2) w = Math.min(t, tKill) >= T('j13') + 0.2 ? LB.X(Math.min(t, tKill)) - xa0 : 0;
    if (t >= tU0) w = (xa1 - xa0) * (1 - ease.io3(clamp((t - tU0) / (tU1 - tU0))));
    const n = t < T('j13') + 0.2 ? 0 : Math.round(C.rowsAtKill * ease.out3(clamp((t - T('j13') - 0.2) / (T('j13', '258') - T('j13') + 0.2))));
    const key = Math.round(w) + ':' + n + ':' + (t >= tU0 ? 1 : 0);
    if (key === lastAdm) return; lastAdm = key;
    adm.style.left = Math.round(xa0) + 'px'; adm.style.width = Math.max(0, Math.round(w)) + 'px';
    adm.style.visibility = w > 2 && t < T('j21') - 0.4 ? 'visible' : 'hidden';
    adm.innerHTML = t >= tU0 ? '' : (w > 150 ? `<span class="num">${n}</span>` : '');
  });
  const phB = LB.playhead(T('j11') + 0.4, tKill, 590, 830);
  // 「撤销中」单独一个标签（不随条子变短而消失）
  const undoTag = h('div', 'tag acc', GB, '撤销中'); px(undoTag, xa0 + 10, LB.Y(1) + 34); css(undoTag, { fontSize: '24px' });
  vanish(undoTag, 0); slam(undoTag, tU0, { from: 1.3 }); exit(undoTag, T('j18') - 0.1, { d: 0.25 });
  // 强行结束：一条砖红竖线劈过架构图与泳道，内存那一块空了
  const kill = h('div', 'abs', W); px(kill, xK + 20, 572, 6, 290); css(kill, { background: 'var(--acc)' }); kill.dataset.name = '强行结束';
  const lost = h('div', 'abs', W); px(lost, 116, 106, 568, 458); css(lost, { border: '4px solid var(--acc)' }); lost.dataset.name = '进程内存丢失';
  wipe(kill, tKill, { dir: 't', d: 0.25 }); appear(lost, tKill + 0.05); sfx('error', tKill); sfx('thud', tKill + 0.05);
  exit(kill, tR - 0.1, { d: 0.3 }); exit(lost, tR - 0.1, { d: 0.3 });

  // ── 重启：恢复日志（原文 + 中文） ──
  const LOG = [
    [C.log[0].replace(/ in redo log file.*$/, ''), '找到最近的检查点', T('j15', '检查点')],
    [C.log[1], '开始崩溃恢复', T('j15', 'redo')],
    [C.log[2], '扫描到日志序号 ' + fmt(C.scanned), T('j16') - 0.2],
    [C.log[3], '重放 ' + C.redo + ' 条 redo 记录', T('j16', '重做')],
    [C.log[4].replace(/^1 transaction\(s\) which must be rolled back or cleaned up in total /, '1 transaction(s) … in total '), '1 笔事务，共要撤销 ' + C.undo + ' 次行操作', T('j17', 'undo')],
    [C.log[6], '事务 ' + C.trx + ' 回滚完成', Tend('j17') - 0.4],
  ];
  // j7b：预写日志——先写日志，后写数据（K7）
  // j7b：先写日志（①，redo），后写数据（②，users.ibd）
  const st1 = h('div', 'tag', W, '① 先'); px(st1, 1100, 424); css(st1, { fontSize: '24px' });
  const st2 = h('div', 'tag', W, '② 后'); px(st2, 900, 208); css(st2, { fontSize: '24px', background: 'var(--main)' });
  vanish(st1, 0); slam(st1, T('j7b', '先写日志'), { from: 1.3 }); vanish(st2, 0); slam(st2, T('j7b', '后写数据'), { from: 1.3 });
  [st1, st2].forEach((e) => exit(e, T('j9') - 0.1, { d: 0.3 }));
  sfx('pop', T('j7b', '预写日志'), { g: 0.5 });
  const GL8 = [['脏页', '<b>脏页</b>：缓冲池里改过、还没写回磁盘的页', 'MySQL 9.7 手册（M31）', T('j3', '脏页'), T('j6') - 0.1],
    ['redo', '<b>redo</b> 日志：磁盘上的一份修改记录，只往后追加；崩溃恢复时靠它把修改重做出来', 'MySQL 9.7 手册（M12）', T('j6', 'redo'), T('j7b') - 0.1],
    ['预写日志', '<b>预写日志</b>（write-ahead logging）：先把日志写到磁盘，数据页晚点再写', 'ARIES（K7）', T('j7b', '预写日志'), T('j9') - 0.1],
    ['检查点', '<b>检查点</b>：日志里的一个位置；它之前的修改都已写进数据文件，重启时从这里往后重做', 'MySQL 9.7 手册（M12）；本片实验（R2、R3）', T('j9', '检查点'), Tend('j10') + 0.4]];
  GL8.forEach(([term, html, src, a, b]) => { const g = gloss(W, 120, 880, term, html, { w: 1100, src }); vanish(g, 0); show(g, a + 0.15, { y: 8, d: 0.35 }); exit(g, b, { y: 8, d: 0.3 }); });
  const logBox = h('div', 'box', W); px(logBox, 1050, 570, 800, 384);
  const logHead = h('div', 'abs t-small', logBox, 'mysqld 重启后的日志'); px(logHead, 20, 10);
  slide(logBox, tR - 0.2, { x: 40 }); sfx('whoosh', tR - 0.2, { g: 0.4 });
  LOG.forEach(([en, zh, t], i) => {
    const e = h('div', 'abs mono', logBox, esc(en)); px(e, 16, 46 + i * 56); css(e, { fontSize: '22px', color: 'var(--ink)' });
    const z = h('div', 'abs gloss', logBox, zh); px(z, 16, 46 + i * 56 + 25); css(z, { fontSize: '22px', color: 'var(--mainD)' });
    appear(e, t); show(z, t + 0.15, { y: 6, d: 0.3 }); sfx('key', t, { g: 0.5 });
  });
  // 结果（R4）
  const r1 = h('div', 'tag', GB, 'Alice：43'); px(r1, 780, LB.Y(0) - 76); css(r1, { fontSize: '26px' });
  const r2 = h('div', 'tag', GB, `其余 ${fmt(C.unchanged)} 行：原值`); px(r2, 640, LB.Y(1) + 34); css(r2, { fontSize: '26px' });
  slam(r1, T('j18', '43'), { from: 1.3 }); slam(r2, T('j18', '一个都没变') - 0.2, { from: 1.3 }); sfx('pop', T('j18', '43'));
  { const w43 = [[T('j18', '43'), Tend('j19')], [T('j19c', '先重做'), T('j20') - 0.3]]; let l43 = null; F((t) => { const on = w43.some(([a, b]) => t >= a && t < b); if (on !== l43) { a43.classList.toggle('hl', on); l43 = on; } }); }   // 两段高亮写成一个帧函数
  // 没提交的不留：管理员改过的那段只剩一个虚框
  const ghostAdm = h('div', 'abs', GB); px(ghostAdm, xa0, LB.Y(1) - 22, xa1 - xa0, 44); css(ghostAdm, { border: '2px dashed var(--acc)' }); ghostAdm.dataset.name = '撤掉的修改';
  vanish(ghostAdm, 0); appear(ghostAdm, T('j19', '不留'));

  // 第二章的问题：4096 格里改过的 258 格全部退回（R1、R4）
  const tG = T('j20');
  exit(logBox, T('j19b') - 0.2, { x: 30, d: 0.35 });
  // j19b–j19c：1992 年的 ARIES：先重演历史、重做缺失的修改，再回滚没完成的事务（K7，原文）
  const ar = h('div', 'card', W, '<div class="t-small" style="font-family:Inter">ACM TODS 17(1) · March 1992</div>'
    + '<div style="font:700 26px Inter;color:var(--ink);margin-top:6px;line-height:1.3">ARIES: A Transaction Recovery Method … Using <span class="s8-wal">Write-Ahead Logging</span></div>'
    + '<div class="t-note" style="font-family:Inter;margin-top:4px"><span class="s8-who">C. Mohan 等 · IBM</span></div>'
    + '<div class="mono" style="font-size:23px;color:var(--ink2);margin-top:12px;line-height:1.45;white-space:normal">"… the paradigm of repeating history to <span class="s8-r">redo all missing updates</span> before performing the <span class="s8-u">rollbacks</span> of the loser transactions during restart …"</div>'
    + '<div class="gloss" style="position:static;margin-top:8px;white-space:normal">重启时先重做缺的修改，再回滚没完成的事务</div>');
  px(ar, 1050, 560, 800);
  const st8 = h('style', '', W); st8.textContent = '.s8-r.on { color: var(--main); font-weight: 800; background: #DCEFF1; } .s8-u.on { color: var(--acc); font-weight: 800; background: var(--accL); } .s8-wal.on { color: var(--main); background: #DCEFF1; } .s8-who.on { background: #DCEFF1; color: var(--mainD); }';
  lit(ar.querySelector('.s8-who'), 'on', T('j19b', 'Mohan'));
  slide(ar, T('j19b') + 0.1, { x: 40 }); sfx('pop', T('j19b') + 0.2, { g: 0.5 });
  lit(ar.querySelector('.s8-wal'), 'on', T('j19b', 'ARIES')); lit(ar.querySelector('.s8-r'), 'on', T('j19c', '先重做')); lit(ar.querySelector('.s8-u'), 'on', T('j19c', '再撤销'));
  tl.fromTo(ar, { scale: 1 }, { scale: 1.02, duration: Math.max(0.5, tG - 0.3 - T('j19b') - 0.6), ease: 'none', immediateRender: false }, T('j19b') + 0.6);   // 读卡片时慢慢推近
  // j19c：「先重做」指回泳道上 Alice 重做回来的 43，「再撤销」指回管理员那段撤掉的修改
  st8.textContent += ' .s8-gh { background: var(--accL); }';
  lit(ghostAdm, 's8-gh', T('j19c', '再撤销'), tG - 0.3);
  exit(ar, tG - 0.3, { x: 30, d: 0.35 });
  const gridW = 64, cell = 5;
  const grid = svg('svg', { width: gridW * cell, height: gridW * cell, viewBox: `0 0 ${gridW * cell} ${gridW * cell}` }, W);
  css(grid, { position: 'absolute', left: '1360px', top: '612px' }); grid.dataset.name = '4096 行';
  grid.innerHTML = `<defs><pattern id="s8cell" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><rect width="${cell - 1}" height="${cell - 1}" fill="#AED9D7"/></pattern></defs>`
    + `<rect width="${gridW * cell}" height="${gridW * cell}" fill="url(#s8cell)"/>`;
  const g1 = svg('rect', { x: 0, y: 0, width: gridW * cell, height: 0, fill: '#B5452E' }, grid);
  const g2 = svg('rect', { x: 0, y: 0, width: 0, height: cell, fill: '#B5452E' }, grid);
  const gL = h('div', 'abs t-small num', W, `4096 行，改过的 ${C.rowsAtKill} 行`); px(gL, 1360, 576);
  vanish(grid, 0); appear(grid, tG); show(gL, tG, { y: 8, d: 0.4 });
  const tB0 = T('j20z', '整个撤回'), tB1 = Tend('j20z');
  let lastG = -1;
  F((t) => {
    // 先把「改到第 258 行」重演一遍（4 整行 + 2 格），再整个撤回
    const up = ease.out3(clamp((t - tG - 0.3) / 1.4));
    const n = Math.round(C.rowsAtKill * (t < tB0 ? up : 1 - ease.io3(clamp((t - tB0) / (tB1 - tB0)))));
    if (n === lastG) return; lastG = n;
    const f = Math.floor(n / gridW), r = n % gridW;
    g1.setAttribute('height', f * cell); g2.setAttribute('y', f * cell); g2.setAttribute('width', r * cell);
  });
  sfx('riser', tB0, { g: 0.4 });

  // ── doublewrite（j21–j24）：下方三张大页，上方架构图里对应的框亮起 ──
  const tD = T('j21') - 0.4;
  [GB, gL, grid].forEach((e) => exit(e, tD, { y: 20, d: 0.35 }));
  const big = (x, title) => {
    const p = h('div', 'abs', W); px(p, x, 640, 240, 240); css(p, { border: '2px solid var(--mainD)', background: 'var(--panel)' }); p.dataset.name = title;
    const old = h('div', 'abs', p); px(old, 0, 0, 236, 236); css(old, { background: 'var(--pale)' });
    const fill = h('div', 'abs', p); px(fill, 0, 0, 236, 0); css(fill, { background: 'var(--teal)' });
    const t = h('div', 'abs t-note', W, title); px(t, x, 596); css(t, { color: 'var(--ink)', fontWeight: 700 });
    return { p, t, old, fill };
  };
  const P1 = big(220, `缓冲池 · 页 ${D.alice.page}`);
  const P2 = big(840, '双写缓冲区');
  const P3 = big(1460, `users.ibd · 页 ${D.alice.page}`);
  P1.fill.style.height = '236px';
  P2.old.style.background = 'var(--panel)';
  [P1, P2, P3].forEach((B, i) => { wipe(B.p, tD + 0.3 + i * 0.1, { dir: 'b', d: 0.5 }); wipe(B.t, tD + 0.35 + i * 0.1, { dir: 'l', d: 0.4 }); });
  const tWrite = T('j21', '写到一半') - 0.3, tTorn = T('j21', '断电');
  const tTwice = T('j22') + 0.3, tW2 = T('j23', '双写缓冲区'), tW3 = T('j23', '原位');
  const tBad = T('j24', '写坏'), tFix = T('j24', '完整') - 0.1;
  // 页里写进去了多少：P3 从上往下写；j21 写到一半断电；j23 两步都写完；j24 原位那份坏了半页，再从 doublewrite 补全
  const p3Fill = (t) => {
    if (t >= tFix) return 0.5 + 0.5 * ease.out3(clamp((t - tFix) / 0.6));
    if (t >= tBad) return 0.5;
    if (t >= tW3) return ease.io3(clamp((t - tW3) / 0.9));
    if (t >= tTwice - 0.3) return 0;
    if (t >= tWrite) return 0.5 * clamp((t - tWrite) / Math.max(0.3, tTorn - tWrite));
    return 0;
  };
  const p2Fill = (t) => (t >= tW2 ? ease.io3(clamp((t - tW2) / 0.9)) : 0);
  const torn = h('div', 'abs', P3.p); px(torn, -12, 114, 260, 6); css(torn, { background: 'var(--acc)' }); torn.dataset.name = '写坏的页';
  let lastP = '';
  F((t) => {
    const a = Math.round(236 * p3Fill(t)), b = Math.round(236 * p2Fill(t));
    const tornOn = (t >= tTorn && t < tTwice - 0.3) || (t >= tBad && t < tFix);
    const key = a + ':' + b + ':' + tornOn; if (key === lastP) return; lastP = key;
    P3.fill.style.height = a + 'px'; P2.fill.style.height = b + 'px'; torn.style.visibility = tornOn ? 'visible' : 'hidden';
    P3.p.style.borderColor = tornOn ? 'var(--acc)' : 'var(--mainD)'; P3.p.style.borderWidth = tornOn ? '4px' : '2px';
  });
  sfx('error', tTorn, { g: 0.6 }); sfx('error', tBad, { g: 0.5 });
  // j21：直接写回原位（虚线）；j22 起改成写两次：①先进 doublewrite，②再回原位
  const direct = path(ov, `M${340},${886} C${800},${960} ${1120},${960} ${1574},${888}`, 'ink', { w: 2.4, dashed: '8 8' });
  arrowIn(direct, tWrite - 0.2, 0.5); svgOut(direct, tTwice - 0.4);
  const a1 = bigArrow(ov, 472, 760, 828, 24, '#00758F');
  const a2 = bigArrow(ov, 1092, 760, 1448, 24, '#00758F');
  const n1 = h('div', 'tag', W, '①'); px(n1, 636, 692); const n2 = h('div', 'tag', W, '②'); px(n2, 1256, 692);
  svgIn(a1, tTwice); slam(n1, tTwice); svgIn(a2, tTwice + 0.5); slam(n2, tTwice + 0.5);
  lit(dbw, 'on', tW2, Tend('j24') + 0.5);
  // j23b：双写缓冲区是磁盘上单独的一块存储区，写出的页先在这里完整地存一份（M16）
  const dwNote = gloss(W, 220, 900, '双写缓冲区', '<b>双写缓冲区</b>：磁盘上单独的一块存储区；写出的页先在这里完整地存一份，再写到原位<span class="gl-src" style="display:inline;margin-left:12px">手册 M16</span>', { w: 1300 });
  vanish(dwNote, 0); show(dwNote, T('j23', '双写缓冲区') + 0.2, { y: 8, d: 0.4 }); exit(dwNote, T('j24') - 0.1, { d: 0.3 }); sfx('pop', T('j23b', '单独'), { g: 0.45 });
  const tornL = h('div', 'abs', W, '写到一半断电：上半是新的，下半还是旧的'); px(tornL, 1240, 930); css(tornL, { font: '600 22px "Sans SC"', color: 'var(--acc)' });
  vanish(tornL, 0); show(tornL, tTorn + 0.1, { y: 6, d: 0.3 }); exit(tornL, tTwice - 0.3, { d: 0.3 });
  const n1L = h('div', 'abs t-small', W, '先整页存一份'), n2L = h('div', 'abs t-small', W, '存好了，再写到原位');
  px(n1L, 600, 802); px(n2L, 1180, 802);
  [[n1L, tTwice], [n2L, tTwice + 0.5]].forEach(([e, t]) => { vanish(e, 0); show(e, t + 0.1, { y: 6, d: 0.3 }); exit(e, T('j24') - 0.1, { d: 0.3 }); });
  const fixL = h('div', 'abs', W, '恢复时：原位这一页校验不过 → 从双写缓冲区取回完整的一份 → 再在上面重做 redo'); px(fixL, 220, 556); css(fixL, { font: '600 24px "Sans SC"', color: 'var(--main)' });
  vanish(fixL, 0); show(fixL, T('j24', '找回') - 0.2, { y: 8, d: 0.4 });
  lit(P2.p, 's8-dwhl', T('j23bz', '完整') - 0.2, T('j24') - 0.1);
  [1, 2, 3, 4].forEach((i) => lit(dbwSq[i], 'hot', T('j23bz') + 0.2 + (i - 1) * 0.6, Tend('j24') + 0.5));   // 写出的页一页页先存进双写缓冲区
  st8.textContent += ' .s8-dwhl { outline: 4px solid var(--main); outline-offset: 4px; }';
  lit(dbwSq[0], 'hot', tW2 + 0.4, Tend('j24') + 0.5);
  lit(ibdSq[PAGES.indexOf(D.alice.page)], 'hot', tW3 + 0.4, Tend('j24') + 0.5);
  // j24：从 doublewrite 取回完整的一份
  const back = path(ov, `M${960},${886} C${1040},${950} ${1500},${950} ${1580},${886}`, 'main', { w: 3 });
  arrowIn(back, T('j24', '找回') - 0.3, 0.6);
  sfx('chime', T('j24', '完整'), { g: 0.5 });
});
