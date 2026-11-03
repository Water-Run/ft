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

  // j26–j26b：代价
  const cost = gloss(W, '代价', '<span class="c1" style="opacity:0;visibility:hidden">提交要等读的人都离开</span><span class="c2" style="opacity:0;visibility:hidden">；提交时谁也不能读</span>', 1280, 430, 520, { terms: '代价' }); show(cost, T('j26', '代价'), { y: 8 });
  show(cost.querySelector('.c1'), T('j26', '提交要等'), { y: 0 }); show(cost.querySelector('.c2'), T('j26b') - 0.1, { y: 0 });   // 释义跟着旁白分两段出来
  // w0：锁那段收走，main.db 和它的五页留在原处，接着讲 WAL；换一种做法从头再来，五页的值回到 42
  const tW0 = T('w0') - 0.35;
  [gX, cost, ali, rdr].forEach((e) => gone(e, tW0, 0.3)); goneFrom(bob, tW0, 0.35);
  mRows.forEach((r, i) => keyed(r.val).at(tW0 + 0.25 + i * 0.05, { html: i === 0 ? 'Alice · 42' : '年龄索引 · 42 岁' }));
  beats([[T('j10'), MAIN.nameEl], [T('j10', '有人在读'), bob], [T('j10b'), scope.rs[0].children[0]], [T('j10b', '整张表'), scope.rs[0].children[1]], [T('j10d'), scope.rs[1].children[0]], [T('j10d', '要改的'), scope.rs[1].children[1]], [T('j10c'), scope.rs[2].children[0]], [T('j10c', '整个数据库文件'), scope.rs[2].children[1]], [T('j10c', '整个数据库文件'), MAIN], [T('j11'), bob.l1], [T('j11b'), bob.l2], [T('j12'), ali.l1], [T('j12b'), bob], [T('j12b', '写的'), ali], [T('j15'), ali.l1], [T('j15', '还没提交'), ali.l2], [T('j15b'), rdr.l1], [T('j13'), ali.lk], [T('j16'), ali.l1], [T('j16', '已锁'), ali], [T('j17'), bob], [T('j17', '独占锁'), ali.lk], [T('j18'), rdr.l2], [T('j19'), ali.l2], [T('j26', '都离开'), cost], [T('j26b'), MAIN.nameEl], [T('j10d') + 0.25, [scope.t], 1], [T('j10c') + 1.78, [MAIN, scope.rs[2]], 1], [T('j11b') + 0.34, bob, 1], [T('j15') + 1.78, [ali, MAIN], 1], [T('j13') + 3.31, [ali, gX], 1], [T('j16') + 1.33, [ali, rdr], 1], [T('j19') + 1.75, [bob, ali, rdr], 1], [T('j26b') + 0.36, [MAIN, cost], 1], [T('j10b') + 2.93, MAIN, 1], [T('j11b') + 0.34, [MAIN, bob.lk], 1], [T('j19') + 3.48, [MAIN, ...mRows], 1]], Tend('j26b'));
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
  const q = tx(W, '读和写，能不能互不等待？', 960, 330, { fs: 40, color: K.teal, center: true }); show(q, T('w0') - 0.1, { y: 10 }); sfx('pop', T('w0'), { g: 0.35 });
  // w1–w2：主文件先不动，改过的页整页追加到另一个文件末尾：WAL
  const WAL = panel('main.db-wal', 1240, 250, 560, 420);
  WAL.nameEl.innerHTML = ''; keyed(WAL.nameEl).at(T('w2', 'W A L') - 0.1, { html: 'main.db-wal' });
  const tW = T('w1') - 0.2; gone(q, tW, 0.3);
  const mRow = mRows[0];
  const still = tx(MAIN, '主文件先不动', 330, 6, { fs: 22, color: K.dim }); show(still, T('w1', '不动'), { y: 6 });
  const hold = h('div', 'abs', W); px(hold, 110, 240, 620, 440); css(hold, { border: `2px dashed ${K.teal}`, boxSizing: 'border-box' }); hold.dataset.name = '主文件不动';
  set(hold, 0, { autoAlpha: 0 }); wipe(hold, T('w1', '主文件') - 0.1, { dir: 'l', d: 0.6 }); sfx('tick', T('w1', '主文件'), { g: 0.3 });
  gone(hold, T('w15', '写回') - 0.2, 0.3);
  wipe(WAL, T('w1b') - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', T('w1b') - 0.1, { g: 0.3 });
  const gW = gloss(W, 'WAL', '预写日志：改过的页整页追加在这个文件末尾，主文件先不动', 750, 690, 560); show(gW, T('w2', 'W A L'), { y: 8 }); sfx('pop', T('w2', 'W A L'), { g: 0.4 });
  // w3–w5b：一帧 = 24 字节帧头 + 一整页；Alice 改成 43，追加了 5 帧；最后一帧写着提交后 553 页：提交标记
  const frames = FR.map((pg, i) => { const f = h('div', 'abs', WAL); px(f, 20, 56 + i * 68, 516, 56); css(f, { display: 'flex', border: `1.5px solid ${K.ink}`, boxSizing: 'border-box', fontSize: '22px' }); const hd = h('div', '', f, `第 ${pg} 页`); css(hd, { width: '370px', background: '#e6e6e6', borderRight: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', paddingLeft: '10px', fontFamily: 'Mono', fontSize: '24px', whiteSpace: 'nowrap' }); const pb = h('div', '', f, pg === 130 ? 'Alice · <b>43</b>' : '年龄 · 43'); css(pb, { flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '12px' }); f.hd = hd; return f; });
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
  const gM = gloss(W, '提交标记', '提交的那一帧，帧头里多记一个数：提交后文件共几页', 750, 690, 560); set(gM, 0, { autoAlpha: 0 }); show(gM, T('w5b', '提交标记'), { y: 8 }); gone(gF, T('w5b', '提交标记') - 0.1, 0.2);
  // w6–w6b：帧头还带着校验和：对不上的帧一律不算
  frames.forEach((f, i) => keyed(f.hd).at(T('w6', '校验和') + i * 0.05, { html: i === 4 ? `第 ${FR[i]} 页 · 提交 · 校验和` : `第 ${FR[i]} 页 · 校验和` }));
  const bad = h('div', 'abs', WAL); px(bad, 20, 56 + 5 * 68, 516, 46); css(bad, { border: `1.5px dashed ${K.red}`, color: K.red, fontSize: '24px', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }); bad.innerHTML = '校验和对不上的帧：不算';
  set(bad, 0, { autoAlpha: 0 }); show(bad, T('w6b', '一律不算') - 0.2, { y: 6 }); sfx('error', T('w6b', '一律不算'), { g: 0.3 });
  gone(gM, T('w7') - 0.1, 0.2);
  const gK = gloss(W, '校验和', '按内容算出的一串数；内容坏了就对不上', 720, 690, 560, { terms: '校验和' }); set(gK, 0, { autoAlpha: 0 }); show(gK, T('w6', '校验和'), { y: 8 });
  // w7：提交之后，主文件里的 Alice 仍是 42
  set(mRow, T('w7', '42'), { backgroundColor: K.wheat }); const st42 = tx(MAIN, '提交之后，仍是 42', 330, 6, { fs: 22, color: K.teal });
  gone(still, T('w7') - 0.1, 0.2); show(st42, T('w7', '42'), { y: 6 }); 
  // w8–w8b：读的时候先查 WAL；哪些页在 WAL 里，记在内存里的一份目录上
  
  const dir = h('div', 'abs', W); px(dir, 750, 268, 480, 150); css(dir, { border: `2px solid ${K.ink}`, background: K.wheat, padding: '8px 14px', boxSizing: 'border-box', whiteSpace: 'normal', lineHeight: 1.5 });   // 五项一行放不下：允许换行（r1 第 5 项被框切掉） dir.dataset.name = '内存里的对照表';   // 让开页标题
  dir.innerHTML = '<div style="font-size:22px;color:#044a64">内存里的对照表：哪一页在第几帧</div>' + FR.map((pg, i) => `<span style="display:inline-block;font-family:Mono;font-size:24px;margin-right:16px">${pg}→帧${i + 1}</span>`).join('');
  set(dir, 0, { autoAlpha: 0 }); wipe(dir, T('w8b', '内存') - 0.2, { dir: 't', d: 0.4 });   // 「记在内存里的一张对照表上」
  const r1 = line(ov, [[960, 560], [1236, 400]]), r2 = line(ov, [[960, 560], [726, 420]], { dashed: '7 6' });
  const rd = tx(W, '读', 940, 566, { fs: 26 }); show(rd, T('w8', '先查'), { y: 6 }); arrowIn(r1, T('w8', '新版'), 0.4); arrowIn(r2, T('w8', '主文件'), 0.4);
  // w9–w12：同样的顺序：Bob 先读 42；Alice 提交直接成功；Bob 仍是 42（快照）；之后的读者看到 43
  const tS = T('w9') - 0.2;
  [rd, r1, r2, st42].forEach((e) => gone(e, tS, 0.3)); set(mRow, tS, { backgroundColor: '#ffffff' });
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
  [fresh, both, one, car].forEach((e) => gone(e, tC, 0.3));
  const cp = line(ov, [[1236, 460], [726, 460]], { w: 3 }); const cpL = tx(W, '写回主文件', 860, 420, { fs: 24 });
  arrowIn(cp, T('w15', '写回') - 0.2, 0.6); show(cpL, T('w15', '写回'), { y: 6 });
  const gC = gloss(W, '检查点', '把 WAL 里的新页写回主文件', 750, 268, 480); set(gC, 0, { autoAlpha: 0 }); gone(dir, T('w15b', '检查点') - 0.2, 0.2); show(gC, T('w15b', '检查点'), { y: 8 }); sfx('pop', T('w15b', '检查点'), { g: 0.4 });
  set(bob, T('w16', 'Bob'), { borderColor: K.teal });
  // 不能覆盖：写回的箭头变红，主文件边上落下一道挡板；Bob 结束后挡板收起
  const blocked = h('div', 'abs', W); px(blocked, 732, 410, 14, 110); css(blocked, { background: K.red, transformOrigin: '50% 0%' }); blocked.dataset.name = '挡板';
  set(blocked, 0, { autoAlpha: 0 }); tl.fromTo(blocked, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'bounce.out', immediateRender: false }, T('w16', '不能覆盖') - 0.1); sfx('error', T('w16', '不能覆盖'), { g: 0.4 });
  tl.fromTo(cp, { stroke: '#000000' }, { stroke: K.red, duration: 0.3, immediateRender: false }, T('w16', '不能覆盖') - 0.1);
  const tDone = T('w17b', '43');
  set(bob, T('w17', '结束'), { opacity: 0.35 }); gone(blocked, T('w17', '完成') - 0.1, 0.3); tl.fromTo(cp, { stroke: K.red }, { stroke: '#000000', duration: 0.3, immediateRender: false }, T('w17', '完成') - 0.1);
  mRows.forEach((r, i) => keyed(r.val).at(tDone + i * 0.05, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' })); set(mRow, tDone, { backgroundColor: K.wheat });
  frames.forEach((f, i) => gone(f, T('w17b', '清空') + i * 0.05, 0.25)); gone(n5, T('w17b', '清空'), 0.2); sfx('whoosh', T('w17b', '清空'), { g: 0.3 });
  // w18–w19：代价：这份目录放在共享内存里，同一台机器上的进程才看得到
  const tX = T('w18') - 0.2;
  [cp, cpL, gC, ali].forEach((e) => gone(e, tX, 0.3)); goneFrom(bob, tX, 0.35);
  const host = h('div', 'abs', W); px(host, 120, 700, 1080, 200); css(host, { border: `2px dashed ${K.ink}`, boxSizing: 'border-box' });
  const hostL = tx(host, '同一台机器', 16, 8, { fs: 24, color: '#444444' });
  const shm = h('div', 'abs', host, '共享内存：WAL 的对照表'); px(shm, 300, 60, 480, 70); css(shm, { border: `2px solid ${K.ink}`, background: K.wheat, fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); shm.dataset.gloss = '共享内存';
  const procs = [0, 1, 2].map((i) => { const p = h('div', 'abs btn', host, `进程 ${i + 1}`); px(p, 40 + i * 340, 150); p.style.fontSize = '22px'; return p; });
  wipe(host, T('w18', '对照表') - 0.2, { dir: 'l', d: 0.45 }); sfx('whoosh', T('w18', '对照表') - 0.2, { g: 0.3 });   // 说到「这份目录」框就进来，「共享内存」时点亮它
  const other = h('div', 'abs', W, '另一台机器的进程：看不到'); px(other, 1260, 760); css(other, { border: `1.5px dashed ${K.red}`, color: K.red, fontSize: '24px', padding: '8px 16px' });
  set(other, 0, { autoAlpha: 0 }); show(other, T('w19', '同一台机器'), { x: 10, y: 0 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('w0'), q], [T('w1'), MAIN.nameEl], [T('w1', '主文件'), MAIN, 1], [T('w1', '不动'), MAIN, 1], [T('w1', '不动'), mRow], [T('w1b'), WAL.nameEl], [T('w2'), gW], [T('w3'), WAL.nameEl], [T('w3', '帧头'), gHd, 1], [T('w3', '一整页'), [gPg, gF], 1], [T('w4', '43'), WAL.nameEl], [T('w4', '5'), n5], [T('w4b', '130'), frames[0]], [T('w4b', '4'), frames.slice(1)], [T('w5', '提交的那一帧'), frames[4]], [T('w5', '帧头'), frames.map((f) => f.hd)], [T('w5', '提交后'), frames[4]], [T('w5', '553'), frames[4].hd], [T('w5b'), gM], [T('w6'), frames.map((f) => f.hd)], [T('w6', '校验和'), gK], [T('w6b'), frames], [T('w6b', '一律不算'), bad], [T('w7'), MAIN.nameEl], [T('w7', 'Alice'), mRow], [T('w8'), MAIN.nameEl], [T('w8', 'W A L'), frames], [T('w8', '新版'), frames[0]], [T('w8', '主文件'), mRow], [T('w8b'), frames], [T('w8b', '对照表'), dir],
    [T('w9'), bob.l2], [T('w10'), ali.l2], [T('w11'), bob.l2], [T('w11b'), snap], [T('w12'), fresh], [T('w13'), car.l2], [T('w14'), one], [T('w15'), cpL], [T('w15b'), gC], [T('w16'), bob.l2], [T('w16', '旧页'), mRow], [T('w17'), bob.l2], [T('w17b'), mRow], [T('w18', '代价'), WAL.nameEl], [T('w18', '共享内存'), shm], [T('w18b'), host], [T('w18b', '进程'), procs], [T('w19'), other], [T('w1') + 2.92, MAIN, 1], [T('w3') + 1.55, WAL, 1], [T('w5') + 5.32, [WAL, gM], 1], [T('w8') + 0.50, [MAIN, WAL], 1], [T('w8b') + 0.72, [dir, WAL], 1], [T('w11b') + 0.62, [snap, bob], 1], [T('w13') + 1.71, [car, one], 1], [T('w16') + 3.11, [MAIN, bob], 1], [T('w17') + 1.66, [MAIN, WAL], 1], [T('w18b') + 1.55, host, 1], [T('w19') + 2.93, [host, other], 1], [T('w1b') + 1.22, WAL, 1], [T('w5') + 5.32, frames, 1], [T('w10') + 4.13, ali, 1], [T('w18b') + 1.55, [shm, other], 1], [T('w19') + 4.50, [MAIN, WAL], 1], [T('w5b') + 1.24, [WAL, frames[4]], 1], [T('w19') + 0.79, [host, MAIN], 1]], Tend('w19'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('w7', '42'), { g: 0.35 });
  sfx('pop', T('w8', '先查'), { g: 0.3 });
  sfx('whoosh', T('w8b', '对照表') - 0.2, { g: 0.25 });
  sfx('tick', T('w9', '42'), { g: 0.3 });
  [[T('w1') - 0.2, '主文件先不动：改过的页追加到 WAL'], [T('w3') - 0.2, '帧：24 字节帧头，加一整页'], [T('w7') - 0.2, '读的时候先查 WAL'], [T('w9') - 0.2, '同样的顺序，再试一次'], [T('w13') - 0.2, '写的人，仍然只能有一个'],
   [T('w15') - 0.2, '检查点：把新页写回主文件'], [T('w18') - 0.2, 'WAL 的代价']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }], [T('w0') - 0.35, null, { rect: [110, 250, 1810, 900], pad: 0, d: 1.5 }]]);
  }
  }
});
