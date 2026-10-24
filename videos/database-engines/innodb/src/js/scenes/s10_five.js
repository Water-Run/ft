// 第 10 章 五个问题：一个数据库引擎必须回答的五个问题（与 MyISAM 一集结尾相同，系列每集都要），InnoDB 的回答。
// 主画面是完整的架构图；下面一排五张卡，讲到哪一问哪一张亮起、写出答案，架构图里对应的部件跟着亮：
// 一 放：.ibd、表就是主键 B+ 树（M1、M3）；二 找：根页到叶子、二级索引再回表（L2、M2）；三 改和删：undo、删除标记与清除（M14、M8）；
// 四 事务与并发（详讲）：一笔事务按 1–6 走一遍——锁行（X5）→ 旧值进 undo（X1）→ 缓冲池里改页成脏页（M27）→ 记 redo（M12）
//    → 提交：redo 落盘、锁放开（S7、X6）→ 脏页稍后经双写缓冲区写回（M31、M16）；这期间别人读旧版本、要改就等锁（M9、X3、X5）；
// 五 出错：先 redo 重做，再 undo 撤销（M12、R3）。
scene('s10', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  const ov = overlay(W);
  const A = D.alice;
  const ON = new Map(), onWin = (el, a, b) => { if (!ON.has(el)) ON.set(el, []); ON.get(el).push([a, b]); };
  const NUM = (txt, x, y, parent = W) => { const e = h('div', 'tag s10n', parent, txt); px(e, x, y); return e; };
  h('style', '', document.head, '.s10n { font: 800 26px Inter !important; padding: 0 10px !important; background: var(--panel) !important; color: var(--main) !important; border: 2px solid var(--main); }'
    + ' .s10n.s10act { background: var(--main) !important; color: #fff !important; } .s10flash { background: var(--main) !important; color: #fff !important; }');

  // ── 架构图 ──
  const ZM = zone(W, 120, 110, 640, 470, '内存', 'In-Memory');
  const ZD = zone(W, 800, 110, 1000, 470, '磁盘', 'On-Disk');
  const bp = boxEl(ZM, 20, 84, 600, 236, '缓冲池');
  const lb = boxEl(ZM, 20, 334, 600, 116, '日志缓冲');
  const ibd = boxEl(ZD, 20, 84, 470, 160, 'users.ibd');
  const undo = boxEl(ZD, 510, 84, 470, 160, 'undo');
  const redo = boxEl(ZD, 20, 258, 960, 90, 'redo 日志');
  const dbw = boxEl(ZD, 20, 360, 960, 90, '双写缓冲区');
  // 缓冲池里放大的页 27，Alice 那一行
  const p27 = h('div', 'abs', bp); px(p27, 24, 54, 552, 160); css(p27, { border: '2px solid var(--mainD)', background: 'var(--pale)' }); p27.dataset.name = '页 ' + A.page;
  const p27t = h('div', 'abs', p27, `页 ${A.page}`); px(p27t, 14, 8); css(p27t, { font: '700 24px "Sans SC"', color: 'var(--mainD)' });
  const row = h('div', 'abs mono', p27, ''); px(row, 70, 70, 400, 54); css(row, { background: 'var(--panel)', border: '2px solid var(--mainD)', fontSize: '28px', padding: '8px 14px' });
  swaps(row, [[0, '2050  Alice   <b>42</b>'], [T('k4', '改') , '2050  Alice   <b style="color:var(--acc)">43</b>'], [T('k6', '提交') + 0.2, '2050  Alice   <b style="color:var(--main)">43</b>']]);
  const lk = lockAt(p27, 500, 88);
  const sq10 = (parent, x, y, label, cls = '') => { const e = h('div', 'sq ' + cls, parent, label != null ? `<div class="l">${label}</div>` : ''); px(e, x, y, 40, 40); const l = e.querySelector('.l'); if (l) css(l, { fontSize: '22px', top: '5px' }); return e; };
  const ibdPages = [D.pk.root, ...PK_LEAVES].slice(0, 18);
  const ibdSq = ibdPages.map((p, i) => sq10(ibd, 18 + (i % 9) * 50, 52 + Math.floor(i / 9) * 50, p, 'on'));
  const i27 = ibdPages.indexOf(A.page);
  const lbSq = Array.from({ length: 9 }, (_, i) => sq10(lb, 22 + i * 64, 58, null));
  const dbwSq = Array.from({ length: 16 }, (_, i) => sq10(dbw, 22 + i * 58, 44, null));
  // undo：Alice 改之前的那一版
  const uRec = h('div', 'abs mono', undo, `2050  Alice   <b>${A.before.age}</b>`); px(uRec, 24, 60); css(uRec, { fontSize: '26px', background: 'var(--pale)', border: '2px solid var(--main)', padding: '6px 12px' });
  const uRec2 = h('div', 'abs mono', undo, '旧版本 …'); px(uRec2, 24, 112); css(uRec2, { fontSize: '22px', color: 'var(--ink2)', border: '1.5px dashed var(--edge)', padding: '2px 10px' });
  // redo 带子
  const tape = h('div', 'abs', redo); px(tape, 200, 52, 740, 26); css(tape, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' });
  const tapeFill = h('div', 'abs', redo); px(tapeFill, 200, 52, 420, 26); css(tapeFill, { background: 'var(--pale)' });
  const tapeNew = h('div', 'abs', redo); px(tapeNew, 620, 52, 0, 26); css(tapeNew, { background: 'var(--main)' });
  W.appendChild(ov);

  wipe(ZM, c0 + 0.1, { dir: 'l', d: 0.6 }); wipe(ZD, c0 + 0.2, { dir: 'l', d: 0.6 }); sfx('whoosh', c0 + 0.1, { g: 0.4 });

  // ── 一次修改：泳道 + 六步 ──
  const GL = h('div', 'abs', W); px(GL, 0, 0);
  const LN = lanes(GL, { x: 120, y: 700, w: 1680, gap: 190, rowH: 120, names: ['Alice'], pts: [[T('k9'), 330], [T('k2'), 420], [T('k6', '提交'), 1240], [Tend('k7'), 1740]] });
  LN.enter(T('k9') + 0.2);
  const evU = LN.event(0, T('k2'), 'UPDATE … age = 43', 'ink', -56);
  const evC = LN.event(0, T('k6', '提交'), 'COMMIT', '', -56);
  const bU = LN.bar(LN.Y(0) - 22, T('k2') + 0.1, T('k6', '提交'), '<span>43</span>', 'unc');
  const bC = LN.bar(LN.Y(0) - 22, T('k6', '提交'), Tend('k7') + 0.5, '43');
  const phL = LN.playhead(T('k9'), Tend('k7'), 630, 760);
  // ① 锁行
  vanish(lk, 0); appear(lk, T('k2', '锁住')); sfx('thud', T('k2', '锁住'), { g: 0.6 });
  vanish(lk, T('k6', '锁随之放开'));
  const n1 = NUM('1', 120 + 20 + 24 + 24, 110 + 84 + 54 + 84);
  // ② 旧值进 undo，回滚指针指向它
  const rp = path(ov, `M${120 + 20 + 24 + 70 + 428},${110 + 84 + 54 + 106} C${720},${352} ${740},${361} ${800},${361} L${1300},${361} L${1300},${282} L${1330},${282}`, 'main', { w: 2.6 });
  const n2 = NUM('2', 1624, 262, W);
  vanish(uRec, 0); slide(uRec, T('k3', 'undo'), { x: -30 });
  arrowIn(rp, T('k3', '回滚指针'), 0.7);
  // ③ 缓冲池里改这一页 → 脏页
  lit(p27, 's10dirty', T('k4', '改'), T('k7', '写回') + 0.6);
  const n3 = NUM('3', 120 + 20 + 24 + 520, 110 + 84 + 54 - 14);
  // ④ 记 redo：日志缓冲进一格
  const lbOn = (i, t) => (i < 3 && t >= T('k5') + 0.2 + i * 0.4 && t < T('k6', 'redo') + 0.4);
  lbSq.forEach((e, i) => { let last = null; F((t) => { const on = lbOn(i, t); if (on === last) return; last = on; e.className = 'sq' + (on ? ' dirty' : ''); }); });
  const n4 = NUM('4', 120 + 20 + 600 - 50, 110 + 334 + 8);
  // ⑤ 提交：日志缓冲 → redo 落盘；锁放开
  const logA = bigArrow(ov, 764, 110 + 258 + 45, 816, 24);
  svgIn(logA, T('k6', 'redo') - 0.2); svgOut(logA, T('k7'));
  fromTo(tapeNew, T('k6', '磁盘'), { width: 0 }, { width: 70, duration: 0.5, ease: 'power2.out' });
  const n5 = NUM('5', 800 + 20 + 960 - 54, 110 + 258 + 6);
  // ⑥ 脏页稍后写回：缓冲池 → doublewrite → users.ibd
  const wbA = bigArrow(ov, 764, 110 + 360 + 45, 816, 24);
  svgIn(wbA, T('k7', '写回') - 0.3); svgOut(wbA, Tend('k7') + 0.6);
  lit(dbwSq[0], 'hot', T('k7', '写回'), Tend('k7') + 0.8);
  lit(ibdSq[i27], 'hot', T('k7', '写回') + 0.5, Tend('k7') + 0.8);
  const n6 = NUM('6', 800 + 20 + 960 - 54, 110 + 360 + 6);
  const st = h('style', '', document.head, '.s10dirty { border-color: var(--acc) !important; background: var(--accL) !important; }');
  // 六个编号在第一句时先按顺序摆出来（空心），走到哪一步哪一个变实心
  [[n1, T('k2', '锁住')], [n2, T('k3', 'undo')], [n3, T('k4', '改')], [n4, T('k5', 'redo')], [n5, T('k6', '磁盘')], [n6, T('k7', '写回')]].forEach(([n, t], i) => {
    vanish(n, 0); appear(n, T('k9') + 0.6 + i * 0.35); sfx('tick', T('k9') + 0.6 + i * 0.35, { g: 0.4 });
    classAt(n, 's10act', t); sfx('pop', t, { g: 0.5 });
  });
  const dTag = h('div', 'tag acc', p27, '脏页'); px(dTag, 100, 8); css(dTag, { fontSize: '22px' });
  vanish(dTag, 0); appear(dTag, T('k4', '脏页')); vanish(dTag, T('k7', '写回') + 0.6);
  // k10：这期间 Bob 来读，读到 undo 里的 42（X3）；Carol 要改同一行，只能等锁（X5）
  const xU = LN.X(T('k3')) + 40;
  const bobR = h('div', 'pill', GL, `Bob 读 → ${A.before.age}`); px(bobR, xU, 792); css(bobR, { fontSize: '24px', borderColor: 'var(--main)', color: 'var(--main)' });
  const carW = h('div', 'vbar wait', GL, '<span style="font:600 22px &quot;Sans SC&quot;">Carol 等锁</span>'); px(carW, xU + 230, 792, LN.X(T('k6', '提交')) - xU - 230, 40);
  vanish(bobR, 0); slam(bobR, T('k10', '读'), { from: 1.3 }); sfx('pop', T('k10', '读'), { g: 0.45 });
  vanish(carW, 0); wipe(carW, T('k10z', '改这一行') - 0.1, { dir: 'l', d: 0.6 }); sfx('tick', T('k10z', '等'), { g: 0.4 });
  const FLk = [[T('k10', '旧版本'), T('k10', '旧版本') + 1.0]]; { let last = null; F((t) => { const on = FLk.some(([a, b]) => t >= a && t < b); if (on === last) return; last = on; uRec.classList.toggle('s10flash', on); }); }
  const lkAgain = lockAt(p27, 500, 88); vanish(lkAgain, 0); appear(lkAgain, T('k10z', '这把锁') - 0.2); vanish(lkAgain, Tend('k10z') + 0.3);
  const out1 = Tend('k10z') + 0.4;
  exit(GL, out1, { y: 16, d: 0.3 });
  [n1, n2, n3, n4, n5, n6].forEach((n) => exit(n, out1, { d: 0.25 }));
  svgOut(rp, out1);


  // ── 五张卡：讲到哪一问哪一张亮起、写出答案；第四问详讲时整排让开，讲完第五问时再摆回来 ──
  const QA = [
    ['数据怎么放', '一个 .ibd 文件<br>表 = 主键 B+ 树', 'k8a'],
    ['怎么找', '根页 → 叶子<br>二级索引 → 回表', 'k8b'],
    ['改和删', '旧值先进 undo<br>删除：先标记，再清除', 'k8c'],
    ['事务与并发', '锁 → undo → 改页<br>→ redo → 提交<br>读旧版本，写要等锁', 'k9'],
    ['出错怎么办', 'redo 重做<br>undo 撤掉没提交的', 'k11'],
  ];
  const st2 = h('style', '', W); st2.textContent = '.s10q { padding: 18px 22px !important; } .s10q .qn { font: 800 30px Inter; color: var(--main); margin-right: 10px; } .s10q .qt { font: 800 30px "Sans SC"; color: var(--ink); }'
    + ' .s10q .qa { font: 500 24px "Sans SC"; color: var(--ink2); margin-top: 12px; line-height: 1.45; } .s10q.done { opacity: 0.55; }';
  const mkCard = (i) => { const c = h('div', 'card s10q', W, `<div><span class="qn">${i + 1}</span><span class="qt">${QA[i][0]}</span></div><div class="qa">${QA[i][1]}</div>`); px(c, 120 + i * 340, 624, 320, 270); return c; };
  // 第一排：k8 摆出五问，1–3 讲到时亮起并写出答案
  const rowA = QA.map((q, i) => mkCard(i));
  const tA0 = T('k8') + 0.3;
  rowA.forEach((c, i) => { slide(c, tA0 + i * 0.15, { y: 30 }); sfx('tick', tA0 + i * 0.15, { g: 0.35 }); });
  rowA.forEach((c, i) => { const a = c.querySelector('.qa'); vanish(a, 0); if (i < 3) show(a, T(QA[i][2]) + 0.3, { y: 8, d: 0.35 }); });
  [0, 1, 2].forEach((i) => lit(rowA[i], 'on', T(QA[i][2]), i < 2 ? T(QA[i + 1][2]) : T('k9') - 0.1));
  rowA.forEach((c, i) => exit(c, T('k9') - 0.1 + i * 0.04, { y: 24, d: 0.3 }));
  // 第一到第三问，架构图里对应的部件亮起
  onWin(ibd, T('k8a'), Tend('k8az') + 0.3); onWin(bp, T('k8b'), Tend('k8bz') + 0.3); onWin(ibd, T('k8bz', '回表'), Tend('k8bz') + 0.3); onWin(undo, T('k8c'), Tend('k8cz') + 0.3);
  // 第二排：讲完事务与并发，五张卡摆回来，前四张已经回答过（淡），第五张亮起
  const rowB = QA.map((q, i) => mkCard(i));
  const tB0 = T('k11') - 0.3;
  rowB.forEach((c, i) => { vanish(c, 0); appear(c, tB0 + i * 0.06); if (i < 4) c.classList.add('done'); });
  const a5 = rowB[4].querySelector('.qa'); vanish(a5, 0); show(a5, T('k11', 'redo') - 0.1, { y: 8, d: 0.35 });
  lit(rowB[4], 'on', T('k11'));
  onWin(redo, T('k11', 'redo'), s.end); onWin(undo, T('k11z', 'undo'), s.end);
  // 重做：redo 带子上扫一遍
  const rscan = h('div', 'abs', redo); px(rscan, 200, 44, 10, 42); css(rscan, { background: 'var(--main)' });
  { const w2 = [T('k11', 'redo'), T('k11', 'redo') + 1.2]; let last = null;
    F((t) => { const on = t >= w2[0] && t < w2[1]; const x = on ? Math.round(lerp(200, 690, ease.io3(clamp((t - w2[0]) / (w2[1] - w2[0]))))) : -1; if (x === last) return; last = x; rscan.style.display = on ? '' : 'none'; rscan.style.left = x + 'px'; }); }

  // 每个框的「亮」只由一个帧函数管：t 落在它的任一段里就亮
  for (const [el, wins] of ON) { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on === last) return; last = on; el.classList.toggle('on', on); }); }
});
