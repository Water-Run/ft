// 05 回滚日志：左 main.db、右 main.db-journal 两张「文件」，下方是会话与锁。改一行（事务、抄原页、写稳、删日志即提交）→
// 有人在读（共享锁、保留锁、独占锁，实测的 database is locked）→ 出错（全部加一、没提交就写进主文件、强行终止、重开抄回）。
// 事实：J05、I03、K01、K02、K03、E05。
scene('journal', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, '改年龄：要动不止一页'); show(title, c0 + 0.1, { y: 8 });
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
  const PAGES = DATA.wal.frames;                       // 改年龄要动的页：叶页 130 与年龄索引的 4 页
  const MAIN = panel('main.db', 120, 250, 600, 420);
  wipe(MAIN, c0 + 0.15, { dir: 'l', d: 0.45 });
  const rowEl = (p, pg, i, val) => { const r = h('div', 'abs', p); px(r, 20, 56 + i * 68, 556, 56); css(r, { border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '20px', boxSizing: 'border-box' }); const a = h('span', '', r, `第 ${pg} 页`); a.style.fontFamily = 'Mono'; const b = h('span', '', r, val); r.val = b; return r; };
  const mRows = PAGES.map((pg, i) => rowEl(MAIN, pg, i, pg === 130 ? 'Alice · 42' : '年龄索引 · 42 岁'));
  mRows.forEach((r, i) => show(r, c0 + 0.4 + i * 0.08, { x: -10, y: 0, d: 0.3 }));
  // j1–j2：42 改成 43；要改的不止一页
  const chg = tx(W, '42 → 43', 760, 300, { fs: 30, color: K.teal }); show(chg, T('j1', '43'), { x: -10, y: 0 });
  mRows.forEach((r, i) => set(r, T('j2', '不止一页') + i * 0.1, { borderColor: K.teal })); sfx('tick', T('j2', '不止一页'), { g: 0.4 });
  // j3：只写进去一部分就断电：新旧混杂
  const tCut = T('j3', '断电');
  keyed(mRows[0].val).at(T('j3', '一部分') , { html: 'Alice · <b>43</b>' }).at(T('j4b', '从没发生过'), { html: 'Alice · 42' });
  const mix = errBox(W, '断电：新旧混杂', 760, 380, 28); set(mix, 0, { autoAlpha: 0 }); slam(mix, tCut, { from: 1.3 }); sfx('error', tCut, { g: 0.5 });
  // j4–j4b：事务
  const gTx = gloss(W, '事务', '一次修改要么全部生效，要么像从没发生过', 760, 470, 420); show(gTx, T('j4', '事务'), { x: 12, y: 0 }); sfx('pop', T('j4', '事务'), { g: 0.4 });
  gone(mix, T('j4b') - 0.1, 0.3);
  // j6–j5：改主文件之前，先把要改的页原样抄进旁边一个文件：回滚日志
  const JR = panel('main.db-journal', 1200, 250, 600, 420);
  const tCp = T('j6', '抄进') - 0.2;
  [chg, gTx].forEach((e) => gone(e, tCp - 0.2, 0.3));
  wipe(JR, tCp, { dir: 'l', d: 0.45 }); sfx('whoosh', tCp, { g: 0.3 });
  const jRows = PAGES.map((pg, i) => rowEl(JR, pg, i, pg === 130 ? 'Alice · 42' : '年龄索引 · 42 岁'));
  jRows.forEach((r, i) => { set(r, 0, { autoAlpha: 0 }); tl.fromTo(r, { autoAlpha: 1, x: -1080 }, { x: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tCp + 0.3 + i * 0.12); });
  const gJ = gloss(W, '回滚日志', '改之前的原页，原样抄在旁边；SQLite 默认就用它', 760, 690, 560); show(gJ, T('j5', '回滚日志'), { y: 8 }); sfx('pop', T('j5', '回滚日志'), { g: 0.4 });
  // j7：每页带着页号；日志开头记着原来的文件有 553 页
  const jh = tx(JR, '日志头：原来 553 页', 330, 6, { fs: 22, color: K.teal }); show(jh, T('j7', '原来'), { y: 6 });
  jRows.forEach((r, i) => set(r.firstChild, T('j7', '页号') + i * 0.06, { color: K.teal, fontWeight: 700 }));
  jRows.forEach((r) => { r.dataset.beat = 'line'; });   // 选中只描外框：页号同时在变色，不能让 .bt 的白字盖过去（set 会记下白字）
  // j8：日志先写稳到磁盘，再动主文件
  const sync = btn(JR, '已写到磁盘上', 380, 370, 24); set(sync, 0, { autoAlpha: 0 }); slam(sync, T('j8', '磁盘'), { from: 1.2 }); sfx('thud', T('j8', '磁盘'), { g: 0.4 });
  // j9：主文件写好，删掉日志：删掉的那一刻，就是提交
  mRows.forEach((r, i) => keyed(r.val).at(T('j9', '写好') + i * 0.1, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' }));
  sfx('tick', T('j9', '写好'), { g: 0.4 });
  const tDel = T('j9', '删掉');
  wipeOut(JR, tDel, { dir: 'r', d: 0.4 }); sfx('whoosh', tDel, { g: 0.35 });
  const gC = gloss(W, '提交', '回滚日志删掉的那一刻，修改就算生效', 1200, 450, 560); show(gC, T('j9', '提交'), { x: 12, y: 0 }); sfx('chime', T('j9', '提交'), { g: 0.45 });
  gone(gJ, tDel, 0.3);

  // ── j10–j19：有人在读：三把锁 ──
  const tL = T('j10') - 0.2;
  gone(gC, tL, 0.3);
  const card = (name, x) => { const c = h('div', 'abs', W); px(c, x, 700, 520, 190); css(c, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = tx(c, name, 16, 8, { fs: 28, fw: 600 }); const l1 = tx(c, '', 16, 56, { fs: 24, mono: true }); const l2 = tx(c, '', 16, 100, { fs: 24 }); const lk = h('div', 'abs btn', c, ''); px(lk, 16, 140); lk.style.fontSize = '22px'; c.l1 = l1; c.l2 = l2; c.lk = lk; return c; };
  const scope = docTable(W, [['', 210], ['一把锁管多大', 400]], [['MyISAM', '整张表'], ['InnoDB', '要改的那一行'], ['SQLite', '整个数据库文件']], 1200, 290, { fs: 32 });
  scope.t.dataset.name = '锁的范围';
  show(scope.hr, T('j10b') - 0.1, { y: 6 }); show(scope.rs[0], T('j10b', 'My ISAM'), { x: -10, y: 0 }); show(scope.rs[1], T('j10b', 'Inno D B'), { x: -10, y: 0 }); show(scope.rs[2], T('j10c'), { x: -10, y: 0 });
  sfx('tick', T('j10b', 'My ISAM'), { g: 0.35 }); sfx('tick', T('j10b', 'Inno D B'), { g: 0.35 }); sfx('pop', T('j10c'), { g: 0.4 });
  gone(scope.t, T('j11', '共享锁') - 0.2, 0.3);
  const bob = card('Bob（读）', 120), ali = card('Alice（写）', 700), rdr = card('又来一个读者', 1280);
  wipe(bob, tL + 0.1, { dir: 'l', d: 0.35 });
  keyed(bob.l1).at(T('j11', '开始读') - 0.1, { html: 'sqlite> SELECT age …' });
  keyed(bob.l2).at(T('j11', '42') - 0.1, { html: '看到 <b>42</b>' }).at(T('j19', '43') , { html: '结束' });
  set(bob.lk, 0, { autoAlpha: 0 }); keyed(bob.lk).at(0, { html: '共享锁' }); slam(bob.lk, T('j11', '共享锁'), { from: 1.3 }); sfx('pop', T('j11', '共享锁'), { g: 0.4 });
  const gS = gloss(W, '共享锁', '读的人拿；可以同时有很多', 1280, 250, 520, { terms: '共享锁' });
  wipe(ali, T('j12') - 0.2, { dir: 'l', d: 0.35 });
  keyed(ali.l1).at(T('j12') - 0.1, { html: 'sqlite> UPDATE … age = 43' }).at(T('j16', '提交'), { html: 'sqlite> COMMIT;' });
  keyed(ali.l2).at(T('j15', '还没提交'), { html: '改成 43，还没提交' }).at(T('j16', '已锁') - 0.1, { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }).at(T('j18', '排队'), { html: '排队等独占锁' }).at(T('j19', '提交成功'), { html: '提交成功' });
  set(ali.lk, 0, { autoAlpha: 0 }); keyed(ali.lk).at(0, { html: '保留锁' }).at(T('j19', '提交成功'), { html: '独占锁 → 提交' }); slam(ali.lk, T('j12', '保留锁'), { from: 1.3 }); sfx('pop', T('j12', '保留锁'), { g: 0.4 });
  const gR = gloss(W, '保留锁', '要写的人先拿；别人照常能读，写的只能有一个', 1280, 250, 520);
  const gX = gloss(W, '独占锁', '动主文件时要拿；要等读的人都离开', 1280, 250, 520);
  set(gS, 0, { autoAlpha: 0 }); show(gS, T('j11', '共享锁') + 0.1, { y: 6 }); gone(gS, T('j12', '保留锁') - 0.1, 0.2);
  set(gR, 0, { autoAlpha: 0 }); show(gR, T('j12', '保留锁') + 0.1, { y: 6 }); gone(gR, T('j13', '独占锁') - 0.1, 0.2);
  set(gX, 0, { autoAlpha: 0 }); show(gX, T('j13', '独占锁') + 0.1, { y: 6 });
  keyed(mRows[0].val).at(T('j12') - 0.2, { html: 'Alice · 42' });
  wipe(rdr, T('j15b', '读者') - 0.2, { dir: 'l', d: 0.35 });
  keyed(rdr.l1).at(T('j15b', '读者'), { html: 'sqlite> SELECT age …' });
  keyed(rdr.l2).at(T('j15b', '42'), { html: '照样看到 <b>42</b>' }).at(T('j18', '挡在外面'), { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }).at(T('j19', '43'), { html: '看到 <b>43</b>' });
  set(rdr.lk, 0, { autoAlpha: 0 }); keyed(rdr.lk).at(0, { html: '共享锁' }).at(T('j18', '挡在外面'), { html: '被挡在外面' }); slam(rdr.lk, T('j15b', '42'), { from: 1.2 });
  set(bob, T('j17', 'Bob'), { borderColor: K.teal }); sfx('error', T('j16', '已锁'), { g: 0.5 }); sfx('error', T('j18', '挡在外面'), { g: 0.4 });
  set(bob, T('j19', 'Bob 结束'), { opacity: 0.35 });
  mRows.forEach((r, i) => keyed(r.val).at(T('j19', '43') + i * 0.05, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' })); sfx('chime', T('j19', '提交成功'), { g: 0.45 });

  // ── j20–j25：出错：全部加一，改动多到内存放不下，一部分已经写进主文件；强行终止，重开抄回 ──
  const tE = T('j20') - 0.2;
  [bob, ali, rdr, gX].forEach((e) => (e === bob ? goneFrom(e, tE, 0.35) : gone(e, tE, 0.3)));
  mRows.forEach((r) => gone(r, tE, 0.3));
  const up = codeBlock(W, ['UPDATE users SET age = age + 1;'], 120, 714, { fs: 28 }); wipe(up, T('j20', '加一') - 0.2, { dir: 'l', d: 0.4 });   // 上面留给「还没提交，已经写进主文件的页」
  const mini = []; for (let i = 0; i < 60; i++) mini.push(pageCell(MAIN, 24 + (i % 12) * 46, 60 + Math.floor(i / 12) * 66, 40, 56, { bw: 1 }));
  mini.forEach((c, i) => show(c, tE + 0.3 + i * 0.01, { y: 0, d: 0.2 }));
  const JR2 = panel('main.db-journal', 1200, 250, 600, 420);
  wipe(JR2, T('j21') - 0.1, { dir: 'l', d: 0.4 });
  const jm = []; for (let i = 0; i < 24; i++) jm.push(pageCell(JR2, 24 + (i % 12) * 46, 60 + Math.floor(i / 12) * 66, 40, 56, { bw: 1, fill: '#eeeeee' }));
  jm.forEach((c, i) => show(c, T('j21') + 0.2 + i * 0.03, { y: 0, d: 0.2 }));
  const spill = mini.slice(0, 24);
  spill.forEach((c, i) => set(c, T('j21', '写进了主文件') - 0.3 + i * 0.03, { backgroundColor: K.wheat }));
  const spL = tx(W, '还没提交，已经写进主文件的页', 120, 680, { fs: 22, color: K.teal }); set(spL, 0, { autoAlpha: 0 }); show(spL, T('j21', '写进了主文件'), { y: 6 });
  const kill = errBox(W, '强行终止', 760, 712, 30); set(kill, 0, { autoAlpha: 0 }); slam(kill, T('j22', '强行终止'), { from: 1.3 }); sfx('error', T('j22', '强行终止'), { g: 0.6 });
  const left = tx(W, '日志文件留了下来', 1200, 680, { fs: 24, color: K.teal }); show(left, T('j22', '日志文件'), { y: 6 });
  // j23：每次开始读之前，SQLite 都先看一眼：旁边有没有日志
  const look = h('div', 'abs', W); px(look, 1194, 244, 612, 52); css(look, { border: `3px solid ${K.teal}` }); set(look, 0, { autoAlpha: 0 }); show(look, T('j23', '看一眼'), { y: 0, d: 0.3 });
  sfx('tick', T('j23', '看一眼'), { g: 0.4 });
  // j24：有，就把原样的页抄回主文件，再删掉日志
  const back = line(ov, [[1196, 460], [724, 460]], { w: 3 }); arrowIn(back, T('j24', '抄回') - 0.2, 0.6);
  spill.forEach((c, i) => set(c, T('j24', '抄回') + 0.3 + i * 0.02, { backgroundColor: '#ffffff' })); sfx('whoosh', T('j24', '抄回'), { g: 0.3 });
  const tD2 = T('j24', '删掉');
  [JR2, look, back].forEach((e) => gone(e, tD2, 0.3)); jm.forEach((c) => gone(c, tD2, 0.3)); gone(left, tD2, 0.3);
  [up, kill, spL].forEach((e) => gone(e, T('j25') - 0.2, 0.3));
  const same = tx(W, '整个文件的 SHA-256 与改之前相同', 120, 700, { fs: 30, css: { background: K.wheat, padding: '4px 16px' } });
  const a42 = tx(W, 'Alice 仍是 42', 120, 770, { fs: 30, css: { background: K.wheat, padding: '4px 16px' } }); set(a42, 0, { autoAlpha: 0 }); show(a42, T('j25', 'Alice'), { y: 6 }); sfx('tick', T('j25', 'Alice'), { g: 0.3 });
  set(same, 0, { autoAlpha: 0 }); wipe(same, T('j25', '一字节不差') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('j25', '一字节不差'), { g: 0.5 });
  // j26–j26b：代价
  const cost = gloss(W, '代价', '<span class="c1" style="opacity:0;visibility:hidden">提交要等读的人都离开</span><span class="c2" style="opacity:0;visibility:hidden">；提交时谁也不能读</span>', 760, 800, 640, { terms: '代价' }); show(cost, T('j26', '代价'), { y: 8 });
  mini.forEach((c) => dim(c, T('j26', '代价'), 0.3));   // 出错的例子讲完，主文件里的页退到背景
  show(cost.querySelector('.c1'), T('j26', '提交要等'), { y: 0 }); show(cost.querySelector('.c2'), T('j26b') - 0.1, { y: 0 });   // 释义跟着旁白分两段出来
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('j1'), chg], [T('j2'), MAIN.nameEl], [T('j2', '叶页'), mRows[0]], [T('j2', '年龄索引'), mRows.slice(1)], [T('j3'), mRows[0]], [T('j3', '断电'), mix], [T('j3', '混杂'), mRows.slice(1)], [T('j4'), gTx], [T('j4b', '全部生效'), mRows], [T('j4b', '从没发生过'), mRows[0]], [T('j6'), MAIN.nameEl], [T('j6', '抄进'), jRows], [T('j5'), JR.nameEl], [T('j7', '页号'), jRows], [T('j7', '原来'), jh], [T('j8'), sync], [T('j9'), MAIN.nameEl],
    [T('j7', '日志开头'), JR.nameEl], [T('j10'), MAIN.nameEl], [T('j10', '有人在读'), bob], [T('j10b'), scope.rs[0]], [T('j10b', 'Inno D B'), scope.rs[1]], [T('j10c'), scope.rs[2]], [T('j10c', '整个数据库文件'), MAIN], [T('j11'), bob.l1], [T('j11b'), bob.l2], [T('j12'), ali.l1], [T('j12b'), bob], [T('j12b', '写的'), ali], [T('j15'), ali.l1], [T('j15', '还没提交'), ali.l2], [T('j15b'), rdr.l1], [T('j13'), ali.lk], [T('j16'), ali.l1], [T('j17'), bob.l2], [T('j18'), rdr.l2], [T('j19'), ali.l2],
    [T('j20'), up], [T('j21'), JR2.nameEl], [T('j22'), up], [T('j22', '日志文件'), left], [T('j23'), MAIN.nameEl], [T('j23', '有没有'), JR2.nameEl], [T('j24'), jm], [T('j24', '主文件'), MAIN.nameEl], [T('j25', '一字节不差'), same], [T('j25', 'Alice'), a42], [T('j26', '都离开'), cost], [T('j26b'), MAIN.nameEl]], Tend('j26b'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('j12b', '照常能读'), { g: 0.3 });
  sfx('tick', T('j15', '43'), { g: 0.3 });
  sfx('pop', T('j15b', '42'), { g: 0.3 });
  sfx('tick', T('j13', '独占锁'), { g: 0.35 });
  sfx('tick', T('j20', '加一'), { g: 0.3 });
  [[T('j4') - 0.2, '事务：要么全部生效，要么像从没发生过'], [T('j6') - 0.2, '回滚日志：先把原页抄在旁边'], [T('j9') - 0.2, '删掉日志的那一刻：提交'], [T('j10') - 0.2, '这时有人在读'],
   [T('j10b') - 0.2, '一把锁管多大'], [T('j11') - 0.2, '共享锁、保留锁、独占锁'], [T('j16') - 0.2, '提交被挡住：Bob 还没走'], [T('j20') - 0.2, '开头那一幕：改到一半被终止'], [T('j23') - 0.2, '重新打开：先看一眼有没有日志'], [T('j26') - 0.2, '回滚日志的代价']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }]]);   // 不缩小：缩到 1 倍以下，24 号字就小于 22
});
