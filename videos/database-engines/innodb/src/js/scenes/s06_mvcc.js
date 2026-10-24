// 第 06 章 同时读写：多版本。
// 主画面：上方一条小架构带——缓冲池里叶页 27 的 Alice 这一行（当前版本），回滚指针连到磁盘上的 undo（改之前的版本）；
// 下方是「2050 这一行」的版本轨，和 Alice、Bob 两条泳道，播放头从左往右走。Bob 读的时候拿着快照：
// 行上的事务号不在快照的「已提交」里，就顺着回滚指针去 undo 取旧版本。再看可重复读、锁定读与读已提交的不同。
// 事务号 6175 取自 FACTS G5（「Alice 先改、Bob 后读」那一次的 innodb_trx）；读到的值取自 D.mvcc（X3、X4）。
scene('s6', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  drift3(makeCamera(W), s, 1);            // 缓慢漂移（parts.js）
  const st = h('style', null, root);
  const drift = (e, t0, t1, k = 1.025) => tl.fromTo(e, { scale: 1 }, { scale: k, duration: Math.max(0.5, t1 - t0), ease: 'none', immediateRender: false }, t0);   // 读卡片时慢慢推近
  st.textContent = `
.s6-unc { background-color: #F3DCD5; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Cpath d='M-2,2 l4,-4 M0,14 L14,0 M12,16 l4,-4' stroke='%23B5452E' stroke-width='3'/%3E%3C/svg%3E"); border-color: var(--acc) !important; border-width: 3px !important; }
.s6-unc .v { color: var(--acc) !important; background: var(--panel); display: inline-block; padding: 0 6px; }
.s6-unc .k { background: var(--panel); display: inline-block; padding: 0 4px; }
.s6-val { position: absolute; font: 700 30px "Inter"; color: var(--main); border: 2px solid var(--main); background: var(--panel); padding: 2px 12px; }
.s6-val.acc { color: var(--acc); border-color: var(--acc); }
.s6-mark { position: absolute; font: 800 44px "Inter"; line-height: 1; }
.s6-iso { position: absolute; width: 284px; border: 1.5px solid var(--edge); background: var(--panel); padding: 8px 14px 9px; opacity: .5; }
.s6-iso .en { font: 600 22px "Mono"; color: var(--ink2); }
.s6-iso .zh { font: 700 26px "Sans SC"; color: var(--ink); margin-top: 2px; }
.s6-iso.on { opacity: 1; border-color: var(--main); border-width: 3px; }
.s6-iso.full { opacity: 1; }
.s6-trk { position: absolute; font: 700 28px "Mono"; color: var(--ink2); }
.s6-ring { outline: 4px solid var(--main); outline-offset: 4px; }
.s6-sweep { border-color: var(--main) !important; border-width: 3px !important; }
`;
  const M = D.mvcc['REPEATABLE READ'], RC = D.mvcc['READ COMMITTED'];
  const TRX = '6175';                                                     // FACTS G5

  // ── 上方：架构带 ──
  const zm = zone(W, 120, 110, 820, 278, '内存', 'In-Memory');
  const zd = zone(W, 980, 110, 820, 278, '磁盘', 'On-Disk');
  const pg = boxEl(zm, 20, 90, 780, 172, '缓冲池 · 叶页 27');
  const row = byteStrip(pg, 30, 52, [
    { k: '编号', v: '2050', w: 120 }, { k: '事务号', v: '建表时', w: 150 }, { k: '回滚指针', v: '●', w: 140 }, { k: '名字', v: 'Alice', w: 150 }, { k: '年龄', v: '42', w: 110 },
  ]);
  const [fId, fTrx, fRp, fName, fAge] = row.f;
  const ub = boxEl(zd, 20, 90, 780, 172, 'undo · 改之前的版本');
  const ust = byteStrip(ub, 30, 52, [{ k: '编号', v: '2050', w: 120 }, { k: '名字', v: 'Alice', w: 150 }, { k: '年龄', v: '42', w: 110 }]);
  const [uId, uName, uAge] = ust.f;
  css(fTrx.querySelector('.v'), { color: 'var(--ink2)', fontSize: '26px', lineHeight: '36px' });

  // ── 下方：版本轨与泳道 ──
  const tU = T('f2', '43'), tB1 = T('f3', '读'), tR1 = T('f4', '42');
  const tC = T('f13', '提交'), tR2 = T('f13', '再读'), tFS = T('f16', '锁定读'), tFSv = T('f16b', '43');
  const tEnd = Tend('f18');
  const xU = 470, xB1 = 640, xC = 980, xR2 = 1130, xFS = 1480;
  const LN = lanes(W, {
    x: 120, y: 690, w: 1680, gap: 200, rowH: 105, names: ['Alice', 'Bob', ''],
    pts: [[c0, 330], [tU, xU], [tB1, xB1], [Tend('f4'), 700], [T('f12'), 780], [tC, xC], [tR2, xR2], [tFSv, xFS], [tEnd, 1760]],
  });
  const trkL = h('div', 's6-trk', W, '2050'); px(trkL, 120, 572);
  const trkL2 = h('div', 'abs t-small', W, '这一行'); px(trkL2, 210, 578);
  const trkLine = h('div', 'lane-line', W); px(trkLine, 320, 589, 1480);
  const yT = 568;
  LN.bar(yT, c0 + 0.2, tU, '42');
  const vUnc = LN.bar(yT, tU, tC, `<span>43 · 事务 ${TRX}</span>`, 'unc');
  LN.bar(yT, tC, tEnd + 2, '43', '', { until: tEnd });
  // 入场：架构带先在，再是轨与泳道（讲解对象带着内容在场）
  wipe(zm, c0 + 0.1, { dir: 'b', d: 0.5 }); wipe(zd, c0 + 0.2, { dir: 'b', d: 0.5 });
  slide(trkL, c0 + 0.35, { x: -30 }); slide(trkL2, c0 + 0.4, { x: -30 }); wipe(trkLine, c0 + 0.35, { dir: 'l', d: 0.6 });
  [0, 1].forEach((i) => { slide(LN.els.names[i], c0 + 0.45 + i * 0.1, { x: -40 }); wipe(LN.els.lines[i], c0 + 0.45 + i * 0.1, { dir: 'l', d: 0.7 }); });
  vanish(LN.els.lines[2], 0);
  LN.playhead(c0 + 0.3, tEnd, 548, 930);
  sfx('whoosh', c0 + 0.1, { g: 0.4 });

  const ov = overlay(W);
  const pillAt = (x, y, text, cls, t) => { const e = h('div', 'pill ' + cls, W, text); const w = e.offsetWidth, hh = e.offsetHeight; px(e, x - w / 2, y - hh / 2); slam(e, t, { from: 1.25, d: 0.35 }); return e; };
  const valAt = (x, y, text, cls, t) => { const e = h('div', 's6-val ' + cls, W, text); const hh = e.offsetHeight; px(e, x, y - hh / 2); slam(e, t, { from: 1.4, d: 0.35 }); sfx('pop', t, { g: 0.55 }); return e; };
  const mark = (x, y, ch, cls, t) => { const e = h('div', 's6-mark ' + cls, W, ch); px(e, x, y); slam(e, t, { from: 1.6, d: 0.35 }); return e; };

  // f2：Alice 改成 43——旧值进 undo，行上换成她的事务号，回滚指针指过去；这个版本还没提交（斜纹）
  LN.event(0, tU, 'UPDATE 43', 'fill acc');
  swaps(fTrx.querySelector('.v'), [[tU, `<span style="font-size:30px;color:var(--ink)">${TRX}</span>`]]);
  swaps(fAge.querySelector('.v'), [[tU, '43']]);
  lit(fAge, 's6-unc', tU, tC); lit(fTrx, 'unc', tU, tC);
  vanish(ust, 0); wipe(ust, tU - 0.25, { dir: 'l', d: 0.4 });
  const rp = path(ov, 'M530,334 L530,368 L1090,368 L1090,336', 'mainD', { w: 2.4 });
  arrowIn(rp, tU + 0.15, 0.6); sfx('blip', tU, { g: 0.6 });

  // f3–f4：Bob 读，读到 42
  const bRead1 = LN.event(1, tB1, '读');
  const v1 = valAt(xB1 + 40, LN.Y(1), M.bob_while_alice_uncommitted, '', tR1);

  // f5：脏读——若是直接读这个没提交的 43
  const dirty = path(ov, `M${xB1 - 6},${LN.Y(1) - 22} C${xB1 - 6},560 825,560 825,337`, 'acc', { w: 2.2, dashed: '8 7' });
  arrowIn(dirty, T('f5', '脏读') - 0.3, 0.5);
  const dX = mark(752, 455, '✗', 'c-acc', T('f5', '脏读') + 0.15);
  const dTag = h('div', 'tag acc', W, '脏读'); px(dTag, 800, 460); slam(dTag, T('f5', '脏读'), { from: 1.3 });
  [dirty].forEach((p) => svgOut(p, T('f6') - 0.1, 0.3));
  [dX, dTag].forEach((e) => exit(e, T('f6') - 0.1, { y: -10, d: 0.3 }));

  // f6–f8：Bob 的快照：拍下那一刻已经提交的事务看得见；6175 还没提交，不在里面
  const card = h('div', 'card', W, `<div class="ct" style="font-size:32px">Bob 的快照<span class="s6-first" style="font:500 22px 'Sans SC';color:var(--ink2);margin-left:12px">· 第一次读时拍下</span></div>
    <div class="cs" style="font-size:26px;margin-top:6px"><span class="c-main" style="font-weight:800">✓</span> 拍下之前已提交的事务</div>
    <div class="cs" style="font-size:26px;margin-top:2px"><span class="c-acc" style="font-weight:800">✗</span> <span class="num">${TRX}</span>：拍下时还没提交</div>`);
  px(card, 1340, 398, 460); css(card, { padding: '12px 22px' });
  const [cl1, cl2] = [card.children[1], card.children[2]];
  slide(card, T('f6', '快照'), { x: 40 }); sfx('thud', T('f6', '快照') + 0.1, { g: 0.5 });
  vanish(cl1, 0); vanish(cl2, 0);
  show(cl1, T('f7', '已经提交'), { y: 8, d: 0.35 });
  const snapLink = path(ov, `M${xB1 + 30},${LN.Y(1) - 22} C${xB1 + 30},620 1300,560 1338,470`, 'mute', { w: 1.8, dashed: '4 6', arrow: false });
  arrowIn(snapLink, T('f6', '快照') + 0.2, 0.5);
  show(cl2, T('f8', '事务号'), { y: 8, d: 0.35 });
  // Bob 的读先到这一行：行上的事务号 6175 不在快照的已提交里
  const toRow = path(ov, `M${xB1},${LN.Y(1) - 22} C${xB1},540 375,540 375,337`, 'main', { w: 2.2, dashed: '8 7' });
  arrowIn(toRow, T('f8', '事务号') - 0.4, 0.6);
  const tX = mark(353, 200, '✗', 'c-acc', T('f8', '不在'));
  // f9：这个版本 Bob 不能看
  const aX = mark(803, 200, '✗', 'c-acc', T('f9', '不能看'));
  sfx('error', T('f9', '不能看'), { g: 0.35 });
  // f10：顺着回滚指针去 undo，取回 42
  const rp2 = path(ov, 'M530,334 L530,368 L1090,368 L1090,336', 'main', { w: 4.5 });
  arrowIn(rp2, T('f10', '回滚指针') - 0.1, 0.7);
  lit(uAge, 'hot', T('f10', 'undo'));
  const uOk = mark(1445, 268, '✓', 'c-main', T('f10', '42'));
  const back = path(ov, `M1375,337 C1375,520 ${xB1 + 140},560 ${xB1 + 80},${LN.Y(1) - 24}`, 'main', { w: 2.2 });
  arrowIn(back, T('f10', '42') - 0.1, 0.7);
  lit(v1, 's6-ring', T('f10', '42') + 0.5, T('f10', '42') + 1.5);
  // 讲完机制，引导线收起，留下结果
  const outM = T('f12a') - 0.2;
  [toRow, rp2, back, snapLink].forEach((p) => svgOut(p, outM, 0.35));
  [tX, aX, uOk].forEach((e) => exit(e, outM, { d: 0.3 }));
  // f11：两人都没等——两条泳道一齐亮一下
  [0, 1].forEach((i) => lit(LN.els.lines[i], 's6-go', T('f11'), Tend('f11')));
  st.textContent += '.s6-go { background: var(--main) !important; height: 4px !important; }';

  // ── 隔离级别：四个，按 SQL 标准 ──
  const ISO = [['READ UNCOMMITTED', '读未提交'], ['READ COMMITTED', '读已提交'], ['REPEATABLE READ', '可重复读'], ['SERIALIZABLE', '可串行化']];
  const iso = ISO.map(([en, zh], i) => { const e = h('div', 's6-iso', W, `<div class="en">${en}</div><div class="zh">${zh}</div>`); px(e, 120 + i * 300, 398); return e; });
  iso.forEach((e, i) => slide(e, T('f12a', '隔离级别') + i * 0.1, { y: 20 }));
  const dflt = h('span', null, iso[2].querySelector('.zh'), '默认');
  css(dflt, { font: '700 22px "Sans SC"', color: '#fff', background: 'var(--mainD)', padding: '2px 8px', marginLeft: '12px', display: 'inline-block' });
  vanish(dflt, 0); slam(dflt, T('f12', '可重复读'), { from: 1.4 });
  lit(iso[2], 'on', T('f12', '可重复读'), T('f17'));
  lit(iso[1], 'on', T('f17', '读已提交'), T('f19'));
  iso.forEach((e, i) => { lit(e, 'full', T('f19', '四个'), Infinity); lit(e, 's6-sweep', T('f19', '四个') + i * 0.7, T('f19', '四个') + i * 0.7 + 0.9); });
  const sqlStd = h('div', 'abs t-small', W, 'SQL:1992 标准的四个级别'); px(sqlStd, 120, 484);
  vanish(sqlStd, 0); show(sqlStd, T('f19', 'S Q L'), { y: 6, d: 0.4 });

  // 快照卡的标题旁补一句：第一次读时拍下
  const firstRead = card.querySelector('.s6-first'); vanish(firstRead, 0);
  show(firstRead, T('f12z', '第一次读'), { y: 6, d: 0.4 });

  // f13：Alice 提交；Bob 再读，还是 42（快照没变）
  LN.event(0, tC, 'COMMIT', 'fill');
  sfx('chime', tC, { g: 0.45 });
  LN.event(1, tR2, '读');
  const v2 = valAt(xR2 + 40, LN.Y(1), M.bob_after_alice_commit, '', T('f13', '42'));
  // f14：快照里 6175 仍然算没提交
  lit(cl2, 's6-pulse', T('f14', '没提交') - 0.2, Tend('f14'));
  st.textContent += '.s6-pulse { color: var(--acc) !important; font-weight: 700 !important; }';
  // f15：两次读一样——一条弧连起两个 42
  const same = path(ov, `M${xB1 + 70},${LN.Y(1) + 26} C${xB1 + 200},${LN.Y(1) + 70} ${xR2 - 60},${LN.Y(1) + 70} ${xR2 + 60},${LN.Y(1) + 26}`, 'main', { w: 2, arrow: false });
  arrowIn(same, T('f15', '不同的值') - 0.2, 0.6);
  const eq = h('div', 'abs t-h c-main', W, '='); px(eq, (xB1 + xR2) / 2 + 14, LN.Y(1) + 40); css(eq, { fontSize: '36px', lineHeight: '1', background: 'var(--bg)', padding: '0 8px' });
  slam(eq, T('f15', '挡住'), { from: 1.5 });
  // f16：锁定读，直接读最新提交的版本：43
  const fs = LN.event(1, tFS, 'FOR SHARE', 'ink');
  const lk = lockAt(W, 0, 0); px(lk, xFS - 100, LN.Y(1) - 70); vanish(lk, 0); show(lk, tFS + 0.3, { y: -10, d: 0.4 });
  const vFS = valAt(xFS + 90, LN.Y(1), M.bob_locking_read, '', tFSv);
  const toCur = path(ov, `M${xFS},${LN.Y(1) - 22} C${xFS},520 825,520 825,337`, 'main', { w: 2.2, dashed: '8 7' });
  arrowIn(toCur, tFSv - 0.5, 0.6); svgOut(toCur, T('f17') - 0.1, 0.3);

  // f17–f18：读已提交——每读一次拍一张新快照，提交后读到 43
  const rcName = h('div', 'lane-name', W, 'Bob'); px(rcName, 120, LN.Y(2) - 20);
  const rcTag = h('div', 'tag', W, '读已提交'); px(rcTag, 205, LN.Y(2) - 16);
  slide(rcName, T('f17', '读已提交'), { x: -30 }); slide(rcTag, T('f17', '读已提交') + 0.1, { x: -30 });
  wipe(LN.els.lines[2], T('f17', '读已提交'), { dir: 'l', d: 0.7 });
  pillAt(xB1, LN.Y(2), '读 · 新快照', '', T('f17', '新快照'));
  valAt(xB1 + 100, LN.Y(2), RC.bob_while_alice_uncommitted, '', T('f17', '新快照') + 0.4);
  pillAt(xR2, LN.Y(2), '读 · 新快照', '', T('f18', '一提交') - 0.1);
  valAt(xR2 + 100, LN.Y(2), RC.bob_after_alice_commit, '', T('f18', '43'));
  const rcTag2 = h('div', 'abs t-small', W, '可重复读'); px(rcTag2, 205, LN.Y(1) + 14);
  slide(rcTag2, T('f17', '读已提交') + 0.2, { x: -20 });

  // f20–f21：同一行，不同的事务看到不同的版本：42 在 undo，43 在页里
  const see42 = h('div', 'tag', W, '可重复读的 Bob 看到'); px(see42, 1520, 164);
  const see43 = h('div', 'tag', W, '锁定读、读已提交看到'); px(see43, 670, 164);
  [see42, see43].forEach((e, i) => slide(e, T('f20', '不同的版本') + i * 0.15, { y: 10 }));
  lit(fAge, 'hot', T('f20'), Infinity);
  // 四个级别讲完就收起，给 MVCC 腾出位置
  [...iso, sqlStd].forEach((e, i) => exit(e, T('f20') - 0.1 + i * 0.04, { y: -10, d: 0.3 }));
  exit(card, T('f21') - 0.3, { x: 40, d: 0.35 });
  const mv = h('div', 'abs', W, '<span style="font:800 72px Inter;color:var(--mainD)">MVCC</span><span style="font:700 34px \'Sans SC\';color:var(--ink);margin-left:18px">多版本并发控制</span>');
  px(mv, 120, 410); wipe(mv, T('f21', '多版本'), { dir: 'l', d: 0.6 }); sfx('thud', T('f21', '多版本') + 0.1, { g: 0.6 });
  // 脚注（K8）：多版本并发控制的正确性理论出自 1983 年 Bernstein 与 Goodman；不配旁白，作 MVCC 标题的脚注
  const fnote = h('div', 'abs t-small', W, '注：多版本并发控制的正确性理论，见 Bernstein 与 Goodman，1983 年'); px(fnote, 124, 508);   // 落在 MVCC 标题下面，不压右边 Bob 的快照卡
  vanish(fnote, 0); show(fnote, T('f20') + 0.3, { y: 6, d: 0.4 });
  // 收尾：泳道一带慢慢淡下去，只留两个版本与 MVCC（整组放进一个容器，只对容器补间）
  const dimBox = h('div', 'abs', W); px(dimBox, 0, 0, 1920, 1080);
  [...W.querySelectorAll('.pill, .s6-val, .vbar, .playhead, .lane-name, .lane-line, .s6-trk, .lock'), trkL2, eq, rcTag, rcTag2].forEach((e) => dimBox.appendChild(e));
  fromTo(dimBox, T('f21', '多版本') + 0.7, { opacity: 1 }, { opacity: 0.3, duration: 2.4, ease: 'power1.inOut' });
  svgOut(same, T('f21', '多版本') + 0.7, 2.4);

  W.appendChild(ov);
});
