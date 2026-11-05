// 06 怎么并发（第 11 稿）：前一段是回滚日志模式的三把锁——一把锁管多大、Bob 读时 Alice 改、提交被挡、代价（K01、K02、G17）；
// 第 12 稿：两段共用一个画面层，main.db 和它的五页、三张人物卡的位置都接着用。后一段是 WAL：反过来追加帧、提交标记、读时先查对照表、快照、写者只有一个、检查点、代价（K04、K05、E01–E04）。
scene('concur', ({ root, s, c0 }) => {
  {
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
  mRows[0].style.background = K.wheat;   // Alice 所在的叶页 130：麦色，全章不变
  mRows.forEach((r, i) => show(r, c0 + 0.4 + i * 0.08, { x: -10, y: 0, d: 0.3 }));
  keyed(mRows[0].val).at(0, { html: 'Alice · 42' });
  // ── j10–j19：有人在读：三把锁 ──
  const tL = T('j10') - 0.2;
  const card = (name, x) => { const c = h('div', 'abs', W); px(c, x, 700, 520, 190); css(c, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = tx(c, name, 16, 8, { fs: 28, fw: 600 }); const l1 = tx(c, '', 16, 56, { fs: 24, mono: true }); const l2 = tx(c, '', 16, 100, { fs: 24 }); const lk = h('div', 'abs btn', c, ''); px(lk, 16, 140); lk.style.fontSize = '22px'; c.l1 = l1; c.l2 = l2; c.lk = lk; return c; };
  const scope = docTable(W, [['', 210], ['一把锁管多大', 400]], [['MyISAM', '整张表'], ['InnoDB', '要改的那一行'], ['SQLite', '整个数据库文件']], 1200, 290, { fs: 32 });
  scope.t.dataset.name = '锁的范围';
  show(scope.hr, T('j10b') - 0.1, { y: 6 }); show(scope.rs[0], T('j10b', 'My ISAM'), { x: -10, y: 0 }); show(scope.rs[1], T('j10d'), { x: -10, y: 0 }); show(scope.rs[2], T('j10c'), { x: -10, y: 0 });
  sfx('tick', T('j10b', 'My ISAM'), { g: 0.35 }); sfx('tick', T('j10d'), { g: 0.35 }); sfx('pop', T('j10c'), { g: 0.4 });
  gone(scope.t, T('j11', '共享锁') - 0.2, 0.3);
  const bob = card('Bob（读）', 120), ali = card('Alice（写）', 700), rdr = card('又来一个读者', 1280);
  wipe(bob, T('j10', '有人在读') - 0.1, { dir: 'l', d: 0.35 });
  keyed(bob.l1).at(T('j10', '有人在读'), { html: 'sqlite> SELECT age …' });
  keyed(bob.l2).at(T('j11', '42') - 0.1, { html: '看到 <b>42</b>' }).at(T('j19', '43') , { html: '结束' });
  set(bob.lk, 0, { autoAlpha: 0 }); keyed(bob.lk).at(0, { html: '共享锁' }); slam(bob.lk, T('j11', '共享锁'), { from: 1.3 }); sfx('pop', T('j11', '共享锁'), { g: 0.4 });
  const gS = gloss(W, '共享锁', '读的人拿；可以同时有很多', 1280, 250, 520, { terms: '共享锁' });
  wipe(ali, T('j12') - 0.2, { dir: 'l', d: 0.35 });
  keyed(ali.l1).at(T('j12') - 0.1, { html: 'sqlite> UPDATE … age = 43' }).at(T('j16', '提交'), { html: 'sqlite> COMMIT;' });
  keyed(ali.l2).at(T('j15', '还没提交'), { html: '改成 43，还没提交' }).at(T('j16', '已锁') - 0.1, { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }).at(T('j18', '排队'), { html: '排队等独占锁' }).at(T('j19', '提交成功'), { html: '提交成功' });
  set(ali.lk, 0, { autoAlpha: 0 }); keyed(ali.lk).at(0, { html: '保留锁' }).at(T('j19', '提交成功'), { html: '独占锁 → 提交' }); slam(ali.lk, T('j12', '保留锁'), { from: 1.3 }); sfx('pop', T('j12', '保留锁'), { g: 0.4 });
  const gR = gloss(W, '保留锁', '要写的人先拿；只有一把', 1280, 250, 520);
  const gX = gloss(W, '独占锁', '改主文件时要拿；读的人得先走', 1280, 250, 520);
  set(gS, 0, { autoAlpha: 0 }); show(gS, T('j11', '共享锁') + 0.1, { y: 6 }); gone(gS, T('j12', '保留锁') - 0.1, 0.2);
  set(gR, 0, { autoAlpha: 0 }); show(gR, T('j12', '保留锁') + 0.1, { y: 6 }); gone(gR, T('j13', '独占锁') - 0.1, 0.2);
  set(gX, 0, { autoAlpha: 0 }); show(gX, T('j13', '独占锁') + 0.1, { y: 6 });
  keyed(mRows[0].val).at(T('j12') - 0.2, { html: 'Alice · 42' });
  wipe(rdr, T('j15b', '读者') - 0.2, { dir: 'l', d: 0.35 });
  keyed(rdr.l1).at(T('j15b', '读者'), { html: 'sqlite> SELECT age …' });
  keyed(rdr.l2).at(T('j15b', '42'), { html: '照样看到 <b>42</b>' }).at(T('j18', '挡在外面'), { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }).at(T('j19', '43'), { html: '看到 <b>43</b>' });
  set(rdr.lk, 0, { autoAlpha: 0 }); keyed(rdr.lk).at(0, { html: '共享锁' }).at(T('j18', '挡在外面'), { html: '被挡在外面' }); slam(rdr.lk, T('j15b', '42'), { from: 1.2 });
  sfx('error', T('j16', '已锁'), { g: 0.5 }); sfx('error', T('j18', '挡在外面'), { g: 0.4 });
  set(bob, T('j19', 'Bob 结束'), { opacity: 0.35 });
  mRows.forEach((r, i) => keyed(r.val).at(T('j19', '43') + i * 0.05, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' })); sfx('chime', T('j19', '提交成功'), { g: 0.45 });

  // 锁落在文件上（WaterRun 看 r5b 开场：「锁能管的更细没有动画」——这一章的三把锁原来也只是卡片上的灰字）：
  // 每把锁是一把锁，挂在 main.db 标题栏右边一排——共享锁白底、保留锁麦色、独占锁深青；念到「整个数据库文件」先砸下一把大锁、整个文件框变深青。
  // Alice 提交时独占锁往下落、被 Bob 的共享锁顶回去；Bob 走了，独占锁才落下，提交完才拿走
  const LK = { S: '#ffffff', R: K.wheat, X: K.teal };
  const padlock = (x, kind, sc = 2) => { const g = h('div', 'abs', W); px(g, x, 298 - 30 * sc, 22 * sc, 30 * sc); const sh = h('div', 'abs', g); px(sh, 4 * sc, 0, 14 * sc, 14 * sc); css(sh, { border: `${3 * sc}px solid ${K.teal}`, borderBottom: 'none', borderRadius: `${8 * sc}px ${8 * sc}px 0 0`, boxSizing: 'border-box' });
    const bd = h('div', 'abs', g); px(bd, 0, 12 * sc, 22 * sc, 17 * sc); css(bd, { background: LK[kind], border: `${2.5 * sc}px solid ${K.teal}`, boxSizing: 'border-box' }); set(g, 0, { autoAlpha: 0 }); return g; };
  const drop = (e, t) => { tl.fromTo(e, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'bounce.out', immediateRender: false }, t); sfx('tick', t + 0.2, { g: 0.3, p: 0.2 }); };
  const lift = (e, t) => tl.fromTo(e, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: 0.35, ease: 'power2.in', immediateRender: false }, t);
  const bounceOff = (e, t) => { tl.fromTo(e, { autoAlpha: 0, y: -46 }, { autoAlpha: 1, y: -6, duration: 0.25, ease: 'power2.in', immediateRender: false }, t - 0.25); tl.fromTo(e, { autoAlpha: 1, y: -6 }, { autoAlpha: 0, y: -50, duration: 0.45, ease: 'power2.out', immediateRender: false }, t); };
  [[bob.lk, 'S'], [rdr.lk, 'S'], [ali.lk, 'R']].forEach(([c, k]) => css(c, { background: LK[k], borderColor: K.teal }));   // 卡片上的锁名与文件上的锁同色
  const big = padlock(736, 'X', 2.4);
  drop(big, T('j10c', '整个数据库文件') - 0.1); lift(big, T('j11') - 0.3);
  tl.fromTo(MAIN, { borderColor: '#000000' }, { borderColor: K.teal, duration: 0.2, immediateRender: false }, T('j10c', '整个数据库文件'));
  tl.fromTo(MAIN, { borderColor: K.teal }, { borderColor: '#000000', duration: 0.3, immediateRender: false }, T('j11') - 0.3);
  const lkB = padlock(736, 'S'), lkA = padlock(792, 'R'), lkC = padlock(848, 'S'), lkC2 = padlock(848, 'S'), lkX1 = padlock(904, 'X'), lkX = padlock(904, 'X');
  drop(lkB, T('j11', '共享锁')); drop(lkA, T('j12', '保留锁')); drop(lkC, T('j15b', '42'));
  bounceOff(lkX1, T('j16', '已锁'));                                            // 独占锁落不下来：Bob 的共享锁还在
  tl.fromTo(lkB, { scale: 1 }, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, T('j17', 'Bob'));
  lift(lkC, T('j18') - 0.1); bounceOff(lkC2, T('j18', '挡在外面'));             // 后来的读者：共享锁也扣不上了
  lift(lkB, T('j19', 'Bob 结束'));
  drop(lkX, T('j19', '提交成功') - 0.35); lift(lkA, T('j19', '提交成功') - 0.2);
  tl.fromTo(MAIN, { borderColor: '#000000' }, { borderColor: K.teal, duration: 0.2, immediateRender: false }, T('j19', '提交成功') - 0.2);
  tl.fromTo(MAIN, { borderColor: K.teal }, { borderColor: '#000000', duration: 0.3, immediateRender: false }, T('j26') - 0.3);
  lift(lkX, T('j26') - 0.3);
  // j26–j26b：代价
  const cost = gloss(W, '代价', '<span class="c1" style="opacity:0;visibility:hidden">提交要等读的人都离开</span>', 1280, 430, 520, { terms: '代价' }); show(cost, T('j26', '代价'), { y: 8 });
  show(cost.querySelector('.c1'), T('j26', '提交要等'), { y: 0 });
  // w0：锁那段收走，main.db 和它的五页留在原处，接着讲 WAL；换一种做法从头再来，五页的值回到 42
  const tW0 = T('w0') - 0.35;
  [gX, cost, ali, rdr].forEach((e) => gone(e, tW0, 0.3)); goneFrom(bob, tW0, 0.35);
  mRows.forEach((r, i) => keyed(r.val).at(tW0 + 0.25 + i * 0.05, { html: i === 0 ? 'Alice · 42' : '年龄索引 · 42 岁' }));
  // 焦点框：「别人照常能读」指 Bob、「写的只能有一个」指 Alice；「Bob 还没走」指 Bob；「她已经在排队」指 Alice、「后来的读者」指第三张卡
  focus(W, [[T('j12b', '照常能读'), bob], [T('j12b', '写的'), ali, Tend('j12b')], [T('j17', 'Bob'), bob, Tend('j17')], [T('j18', '排队'), ali], [T('j18', '读者'), rdr, Tend('j18')]], Tend('j26'));
  [[T('j10') - 0.2, '这时有人在读'], [T('j10b') - 0.2, '一把锁管多大'], [T('j11') - 0.2, '共享锁、保留锁、独占锁'], [T('j16') - 0.2, '提交被挡住：Bob 还没走'], [T('j26') - 0.2, '回滚日志的代价']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  sfx('tick', T('j10b', 'My ISAM'), { g: 0.35 }); sfx('tick', T('j10d'), { g: 0.35 }); sfx('pop', T('j10c'), { g: 0.4 });
  sfx('tick', T('j12b', '照常能读'), { g: 0.3 });
  sfx('tick', T('j15', '43'), { g: 0.3 });
  sfx('pop', T('j15b', '42'), { g: 0.3 });
  sfx('tick', T('j13', '独占锁'), { g: 0.35 });
  {
  const title = pageTitle(W, '');
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
  const FR = DATA.wal.frames;
  // w0：能不能让读和写互不等待？
  const q = tx(W, '读和写，能不能互不等待？', 1270, 330, { fs: 40, color: K.teal, center: true }); show(q, T('w0') - 0.1, { y: 10 }); sfx('pop', T('w0'), { g: 0.35 });   // 放在主文件右边的空处，不贴着框
  // w1–w2：主文件先不动，改过的页整页追加到另一个文件末尾：WAL
  const WAL = panel('main.db-wal', 1240, 250, 560, 420);
  WAL.nameEl.innerHTML = ''; keyed(WAL.nameEl).at(T('w2', 'W A L') - 0.1, { html: 'main.db-wal' });
  // 「读和写互不等待」：一个「读」一个「写」从两边相向走来，不停下，错身而过
  const rdC = tx(W, '读', 1040, 410, { fs: 34, css: { background: K.teal, color: '#ffffff', padding: '2px 16px' } }), wrC = tx(W, '写', 1450, 474, { fs: 34, css: { background: K.teal, color: '#ffffff', padding: '2px 16px' } });
  [[rdC, 330], [wrC, -330]].forEach(([e, dx]) => { set(e, 0, { autoAlpha: 0 }); show(e, T('w0') + 0.3, { y: 8, d: 0.35 }); tl.fromTo(e, { x: 0 }, { x: dx, duration: 1.1, ease: 'power1.inOut', immediateRender: false }, T('w0', '互不等待') - 0.3); });
  sfx('whoosh', T('w0', '互不等待') - 0.2, { g: 0.3 });
  const tW = T('w1') - 0.2; gone(q, tW, 0.3); [rdC, wrC].forEach((e) => gone(e, tW, 0.3));
  const mRow = mRows[0];
  const still = tx(MAIN, '主文件先不动', 330, 6, { fs: 22, color: K.dim }); show(still, T('w1', '不动'), { y: 6 });
  const hold = h('div', 'abs', W); px(hold, 110, 240, 620, 440); css(hold, { border: `2px dashed ${K.teal}`, boxSizing: 'border-box' }); hold.dataset.name = '主文件不动';
  set(hold, 0, { autoAlpha: 0 }); wipe(hold, T('w1', '主文件') - 0.1, { dir: 'l', d: 0.6 }); sfx('tick', T('w1', '主文件'), { g: 0.3 });
  gone(hold, T('w15', '写回') - 0.2, 0.3);
  slide(WAL, T('w1b') - 0.1, { x: 520, y: 0, d: 0.7, ease: 'power3.out' }); sfx('whoosh', T('w1b') - 0.1, { g: 0.3 });
  // 「整页追加到另一个文件末尾」：一页从主文件里飞出来，落在 WAL（此刻还是空的）的末尾，也就是开头那一格
  const pgFly = tx(W, '改过的页', 470, 314, { fs: 22, css: { background: K.wheat, border: `1.5px solid ${K.teal}`, padding: '4px 12px', opacity: 0, visibility: 'hidden' } }); set(pgFly, 0, { autoAlpha: 0 });
  tl.fromTo(pgFly, { autoAlpha: 1, x: 0, y: 0 }, { x: 800, y: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('w1b', '追加') - 0.1); sfx('whoosh', T('w1b', '追加'), { g: 0.3, p: 0.3 });
  tl.fromTo(pgFly, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T('w2', 'W A L') - 0.1);
  const endL = tx(W, '← 末尾', 1420, 318, { fs: 26, color: K.teal }); set(endL, 0, { autoAlpha: 0 }); show(endL, T('w1b', '末尾') - 0.1, { x: 10, y: 0 }); gone(endL, T('w2', 'W A L') - 0.1, 0.3);
  const gW = gloss(W, 'WAL', '预写日志：改过的页追加在末尾', 860, 300, 360); show(gW, T('w2', 'W A L'), { y: 8 }); sfx('pop', T('w2', 'W A L'), { g: 0.4 });
  // w3–w5b：一帧 = 24 字节帧头 + 一整页；Alice 改成 43，追加了 5 帧；最后一帧写着提交后 553 页：提交标记
  const frames = FR.map((pg, i) => { const f = h('div', 'abs', WAL); px(f, 20, 56 + i * 68, 516, 56); css(f, { display: 'flex', border: `1.5px solid ${K.ink}`, boxSizing: 'border-box', fontSize: '22px' }); const hd = h('div', '', f, `第 ${pg} 页`); css(hd, { width: '370px', background: '#e6e6e6', borderRight: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', paddingLeft: '10px', fontFamily: 'Mono', fontSize: '24px', whiteSpace: 'nowrap' }); const pb = h('div', '', f, pg === 130 ? 'Alice · <b>43</b>' : '年龄 · 43'); css(pb, { flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '12px', background: pg === 130 ? K.wheat : 'transparent' }); f.hd = hd; return f; });   // 第 130 页（Alice 那一页）的新版：麦色
  const gF = gloss(W, '帧', '24 个字节的帧头，加一整页', 750, 690, 560);
  set(gF, 0, { autoAlpha: 0 }); show(gF, T('w3', '帧'), { y: 8 }); gone(gW, T('w3', '帧') - 0.1, 0.2);
  const ghost = h('div', 'abs', WAL); px(ghost, 20, 56, 516, 56); css(ghost, { display: 'flex', boxSizing: 'border-box', fontSize: '22px' });
  const gHd = h('div', '', ghost, '帧头 · 24 字节'); css(gHd, { width: '170px', background: '#e6e6e6', border: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', whiteSpace: 'nowrap' });
  const gPg = h('div', '', ghost, '一整页 · 1024 字节'); css(gPg, { flex: '1', border: `1.5px solid ${K.ink}`, borderLeft: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', whiteSpace: 'nowrap' });
  set(gHd, 0, { autoAlpha: 0 }); wipe(gHd, T('w3', '帧头') - 0.1, { dir: 'l', d: 0.35 }); set(gPg, 0, { autoAlpha: 0 }); wipe(gPg, T('w3', '一整页') - 0.1, { dir: 'l', d: 0.5 });
  sfx('tick', T('w3', '帧头'), { g: 0.35 }); sfx('tick', T('w3', '一整页'), { g: 0.3 });
  gone(ghost, T('w4b', '130') - 0.5, 0.3);
  frames.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); tl.fromTo(f, { autoAlpha: 1, x: -40 }, { x: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, T('w4b', '130') - 0.3 + i * 0.25); sfx('tick', T('w4b', '130') - 0.3 + i * 0.25, { g: 0.35 }); });
  const n5 = tx(WAL, '5 帧', 470, 6, { fs: 22, color: K.teal }); show(n5, T('w4', '5'), { y: 6 });
  keyed(frames[4].hd).at(T('w5', '553'), { html: `第 ${FR[4]} 页 · 提交后 553 页` }); frames.forEach((f) => { f.dataset.beat = 'line'; }); sfx('thud', T('w5', '553'), { g: 0.45 });   // 提交标记写在最后一帧的帧头里
  const gM = gloss(W, '提交标记', '帧头里记着提交后的页数', 750, 690, 560); set(gM, 0, { autoAlpha: 0 }); show(gM, T('w5b', '提交标记'), { y: 8 }); gone(gF, T('w5b', '提交标记') - 0.1, 0.2);
  // w6–w6b：帧头还带着校验和：对不上的帧一律不算
  frames.forEach((f, i) => keyed(f.hd).at(T('w6', '校验和') + i * 0.05, { html: i === 4 ? `第 ${FR[i]} 页 · 提交 · 校验和` : `第 ${FR[i]} 页 · 校验和` }));
  const bad = h('div', 'abs', WAL); px(bad, 20, 56 + 5 * 68, 516, 46); css(bad, { border: `1.5px dashed ${K.red}`, color: K.red, fontSize: '24px', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }); bad.innerHTML = '校验和对不上的帧：不算';
  set(bad, 0, { autoAlpha: 0 }); show(bad, T('w6b', '一律不算') - 0.2, { y: 6 }); sfx('error', T('w6b', '一律不算'), { g: 0.3 });
  gone(gM, T('w7') - 0.1, 0.2);
  const gK = gloss(W, '校验和', '按内容算出的一串数', 720, 690, 560, { terms: '校验和' }); set(gK, 0, { autoAlpha: 0 }); show(gK, T('w6', '校验和'), { y: 8 });
  // w7：提交之后，主文件里的 Alice 仍是 42
  const st42 = tx(MAIN, '提交之后，仍是 42', 330, 6, { fs: 22, color: K.teal });
  gone(still, T('w7') - 0.1, 0.2); show(st42, T('w7', '42'), { y: 6 }); 
  // w8–w8b：读的时候先查 WAL；哪些页在 WAL 里，记在内存里的一份目录上
  
  const dir = h('div', 'abs', W); px(dir, 750, 268, 480, 150); css(dir, { border: `2px solid ${K.ink}`, background: '#f2f2f2', padding: '8px 14px', boxSizing: 'border-box', whiteSpace: 'normal', lineHeight: 1.5 });   // 五项一行放不下：允许换行（r1 第 5 项被框切掉） dir.dataset.name = '内存里的对照表';   // 让开页标题
  dir.innerHTML = '<div style="font-size:22px;color:#044a64">内存里的对照表：哪一页在第几帧</div>' + FR.map((pg, i) => `<span style="display:inline-block;font-family:Mono;font-size:24px;margin-right:16px">${pg}→帧${i + 1}</span>`).join('');
  set(dir, 0, { autoAlpha: 0 }); wipe(dir, T('w8b', '内存') - 0.2, { dir: 't', d: 0.4 });   // 「记在内存里的一张对照表上」
  const r1 = line(ov, [[960, 560], [1236, 400]]), r2 = line(ov, [[960, 560], [726, 420]], { dashed: '7 6' });
  const rd = tx(W, '读', 940, 566, { fs: 26 }); show(rd, T('w8', '先查'), { y: 6 }); arrowIn(r1, T('w8', '新版'), 0.4); arrowIn(r2, T('w8', '主文件'), 0.4);
  // w9–w12：同样的顺序：Bob 先读 42；Alice 提交直接成功；Bob 仍是 42（快照）；之后的读者看到 43
  const tS = T('w9') - 0.2;
  [rd, r1, r2, st42].forEach((e) => gone(e, tS, 0.3));
  dim(dir, tS, 0.3);   // 人物卡这一段不讲对照表：压淡，画面上同时可读的字少一些（check 的 DENSE 提示）
  const card = (name, x) => { const c = h('div', 'abs', W); px(c, x, 700, 520, 190); css(c, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); tx(c, name, 16, 8, { fs: 28, fw: 600 }); c.l1 = tx(c, '', 16, 60, { fs: 24, mono: true }); c.l2 = tx(c, '', 16, 108, { fs: 26 }); return c; };
  const bob = card('Bob（读）', 120), ali = card('Alice（写）', 700), car = card('Carol（也要写）', 1280);
  wipe(bob, tS + 0.1, { dir: 'l', d: 0.35 });
  keyed(bob.l1).at(T('w9', '开始读'), { html: 'sqlite> SELECT age …' });
  keyed(bob.l2).at(T('w9', '42'), { html: '看到 <b>42</b>' }).at(T('w11', '42'), { html: '再看，仍是 <b>42</b>' }).at(T('w17', '结束'), { html: '结束' });
  wipe(ali, T('w10') - 0.2, { dir: 'l', d: 0.35 });
  keyed(ali.l1).at(T('w10') - 0.1, { html: 'sqlite> UPDATE …; COMMIT;' });
  keyed(ali.l2).at(T('w10', '直接成功'), { html: '提交：<b>直接成功</b>' }); sfx('chime', T('w10', '直接成功'), { g: 0.45 });
  const snap = gloss(W, '快照', '读的人看的是自己开始时的那一版', 750, 430, 480); show(snap, T('w11b', '快照'), { x: 12, y: 0 }); sfx('pop', T('w11b', '快照'), { g: 0.4 });
  const fresh = btn(W, '之后开始的读者：看到 43', 750, 566, 24); set(fresh, 0, { autoAlpha: 0 }); slam(fresh, T('w12', '43'), { from: 1.2 });
  const both = tx(W, '读不挡写，写也不挡读', 750, 640, { fs: 26, color: K.teal }); show(both, T('w12', '读不挡写'), { y: 6 });
  // w13–w14：Carol 这时也要写：数据库已锁；写的人仍然只能有一个
  gone(snap, T('w13') - 0.2, 0.3);
  wipe(car, T('w13', 'Carol') - 0.2, { dir: 'l', d: 0.35 });
  keyed(car.l1).at(T('w13', 'Carol'), { html: 'sqlite> BEGIN IMMEDIATE;' });
  keyed(car.l2).at(T('w13', '已锁') - 0.1, { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }); sfx('error', T('w13', '已锁'), { g: 0.5 });
  const one = tx(car, '写的人只能有一个', 16, 146, { fs: 26, color: K.red }); show(one, T('w14', '只能有一个'), { y: 6 });
  // w15–w17：检查点：新页写回主文件；Bob 还在用旧页，5 页一页也没写回；Bob 结束后完成，主文件变成 43，WAL 清空
  const tC = T('w15') - 0.2;
  [one, car].forEach((e) => gone(e, tC, 0.3));
  [fresh, both].forEach((e) => gone(e, T('w13') - 0.2, 0.4));
  const cp = line(ov, [[1236, 460], [726, 460]], { w: 3 }); const cpL = tx(W, '写回主文件', 860, 420, { fs: 24 });
  arrowIn(cp, T('w15', '写回') - 0.2, 0.6); show(cpL, T('w15', '写回'), { y: 6 });
  const gC = gloss(W, '检查点', '把 WAL 里的新页写回主文件', 750, 268, 480); set(gC, 0, { autoAlpha: 0 }); goneFrom(dir, T('w15b', '检查点') - 0.2, 0.3, 0.2); show(gC, T('w15b', '检查点'), { y: 8 }); sfx('pop', T('w15b', '检查点'), { g: 0.4 });
  // 不能覆盖：写回的箭头变红，主文件边上落下一道挡板；Bob 结束后挡板收起
  const blocked = h('div', 'abs', W); px(blocked, 732, 410, 14, 110); css(blocked, { background: K.red, transformOrigin: '50% 0%' }); blocked.dataset.name = '挡板';
  set(blocked, 0, { autoAlpha: 0 }); tl.fromTo(blocked, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'bounce.out', immediateRender: false }, T('w16', '不能覆盖') - 0.1); sfx('error', T('w16', '不能覆盖'), { g: 0.4 });
  tl.fromTo(cp, { stroke: '#000000' }, { stroke: K.red, duration: 0.3, immediateRender: false }, T('w16', '不能覆盖') - 0.1);
  const tDone = T('w17b', '43');
  set(bob, T('w17', '结束'), { opacity: 0.35 }); gone(blocked, T('w17', '完成') - 0.1, 0.3); tl.fromTo(cp, { stroke: K.red }, { stroke: '#000000', duration: 0.3, immediateRender: false }, T('w17', '完成') - 0.1);
  mRows.forEach((r, i) => keyed(r.val).at(tDone + i * 0.05, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' }));
  frames.forEach((f, i) => gone(f, T('w17b', '清空') + i * 0.05, 0.25)); gone(n5, T('w17b', '清空'), 0.2); sfx('whoosh', T('w17b', '清空'), { g: 0.3 });
  // w18–w19：代价：这份目录放在共享内存里，同一台机器上的进程才看得到
  const tX = T('w18') - 0.2;
  [cp, cpL, gC, ali].forEach((e) => gone(e, tX, 0.3)); goneFrom(bob, tX, 0.35);
  const host = h('div', 'abs', W); px(host, 120, 700, 1080, 200); css(host, { border: `2px dashed ${K.ink}`, boxSizing: 'border-box' });
  const hostL = tx(host, '同一台机器', 16, 8, { fs: 24, color: '#444444' });
  const shm = h('div', 'abs', host, '共享内存：WAL 的对照表'); px(shm, 300, 60, 480, 70); css(shm, { border: `2px solid ${K.teal}`, background: K.teal, color: '#ffffff', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); shm.dataset.gloss = '共享内存'; set(shm, 0, { autoAlpha: 0 }); slam(shm, T('w18', '共享内存') - 0.1, { from: 1.2 }); sfx('thud', T('w18', '共享内存'), { g: 0.35 });
  const procs = [0, 1, 2].map((i) => { const p = h('div', 'abs btn', host, `进程 ${i + 1}`); px(p, 40 + i * 340, 150); p.style.fontSize = '22px'; return p; });
  wipe(host, T('w18', '对照表') - 0.2, { dir: 'l', d: 0.45 }); sfx('whoosh', T('w18', '对照表') - 0.2, { g: 0.3 });   // 说到「这份目录」框就进来，「共享内存」时点亮它
  // 同一台机器上的三个进程各连一条线到共享内存；另一台机器上的进程 4 也伸一条线过来，到了机器的边界就被挡住、变红
  // 讲代价时上面两个文件退场：这一段只看机器、进程与共享内存，镜头随后移下来
  [MAIN, WAL].forEach((e) => gone(e, T('w18', '共享内存') - 0.4, 0.4));
  const pLines = [[215, 440], [555, 600], [895, 880]].map(([x0, x1]) => line(ov, [[x0, 848], [x1, 834]], { w: 2 }));
  pLines.forEach((l, i) => arrowIn(l, T('w18b', '进程') + i * 0.12, 0.35)); sfx('tick', T('w18b', '进程'), { g: 0.3 });
  const other = h('div', 'abs', W); px(other, 1260, 700, 440, 200); css(other, { border: `2px dashed ${K.ink}`, boxSizing: 'border-box' });
  tx(other, '另一台机器', 16, 8, { fs: 24, color: '#444444' }); const p4 = h('div', 'abs btn', other, '进程 4'); px(p4, 40, 150); p4.style.fontSize = '22px';
  set(other, 0, { autoAlpha: 0 }); slide(other, T('w19') - 0.1, { x: 520, y: 0, d: 0.8, ease: 'power3.out' });
  const reach = line(ov, [[1298, 868], [1210, 868]], { w: 2.5 }); arrowIn(reach, T('w19', '进程') + 0.5, 0.5);
  const wall = h('div', 'abs', W); px(wall, 1196, 830, 10, 76); css(wall, { background: K.red, transformOrigin: '50% 0%' }); set(wall, 0, { autoAlpha: 0 });
  tl.fromTo(wall, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'bounce.out', immediateRender: false }, T('w19', '同一台机器') - 0.1);
  tl.fromTo(reach, { stroke: '#000000' }, { stroke: K.red, duration: 0.2, immediateRender: false }, T('w19', '同一台机器') - 0.1); sfx('error', T('w19', '同一台机器'), { g: 0.4 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  // 焦点框：提交的那一帧；主文件里仍是 42 的 Alice；「Bob 还在用主文件里的旧页」指 Bob
  focus(W, [[T('w5', '提交的那一帧'), frames[4], Tend('w5b')], [T('w7', 'Alice'), mRow, Tend('w7')], [T('w16', 'Bob'), bob, Tend('w16')]], Tend('w19'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('w7', '42'), { g: 0.35 });
  sfx('pop', T('w8', '先查'), { g: 0.3 });
  sfx('whoosh', T('w8b', '对照表') - 0.2, { g: 0.25 });
  sfx('tick', T('w9', '42'), { g: 0.3 });
  [[T('w1') - 0.2, '主文件先不动：改过的页追加到 WAL'], [T('w3') - 0.2, '帧：24 字节帧头，加一整页'], [T('w7') - 0.2, '读的时候先查 WAL'], [T('w9') - 0.2, '同样的顺序，再试一次'], [T('w13') - 0.2, '写的人，仍然只能有一个'],
   [T('w15') - 0.2, '检查点：把新页写回主文件'], [T('w18') - 0.2, 'WAL 的代价']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }], [T('w0') - 0.35, null, { rect: [110, 250, 1810, 900], pad: 0, d: 1.5 }],
    [T('w1', '主文件') - 0.3, null, { rect: [110, 240, 740, 690], zmax: 1.45, d: 1.2 }], [T('w1b', '追加') - 0.2, null, { rect: [1230, 240, 1810, 680], zmax: 1.45, d: 1.3 }], [T('w3') - 0.2, null, { rect: [110, 250, 1810, 900], pad: 0, d: 1.3 }],
    [T('w18', '共享内存') - 0.3, null, { rect: [110, 690, 1720, 910], d: 1.3 }], [T('w18b', '进程') - 0.3, null, { rect: [10, 690, 1620, 910], d: 1.1 }], [T('w19') - 0.1, null, { rect: [110, 690, 1720, 910], d: 1.1 }]]);
  }
  }
});
