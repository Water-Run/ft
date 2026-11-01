// 06 WAL：左 main.db 不动，右 main.db-wal 一帧帧追加；中间上方是内存里的目录（哪些页在 WAL 里）；下方是会话。
// 事实：K04（帧：24 字节帧头 + 一整页，提交帧记提交后页数，校验和）、E01–E04（快照、写者只有一个、检查点被旧读者挡住）、K05（目录在共享内存，同一台机器）、05 的 5 帧。
scene('wal', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, 'WAL'); show(title, c0 + 0.1, { y: 8 });
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
  const FR = DATA.wal.frames;
  // w0：能不能让读和写互不等待？
  const q = tx(W, '读和写，能不能互不等待？', 960, 330, { fs: 40, color: K.teal, center: true }); show(q, T('w0') - 0.1, { y: 10 }); sfx('pop', T('w0'), { g: 0.35 });
  // w1–w2：主文件先不动，改过的页整页追加到另一个文件末尾：WAL
  const MAIN = panel('main.db', 120, 250, 560, 420), WAL = panel('main.db-wal', 1240, 250, 560, 420);
  const tW = T('w1') - 0.2; gone(q, tW, 0.3);
  wipe(MAIN, tW + 0.1, { dir: 'l', d: 0.4 });
  const mRow = h('div', 'abs', MAIN, '<span style="font-family:Mono">第 130 页</span>　Alice · 42'); px(mRow, 20, 70, 516, 56);  css(mRow, { border: `1.5px solid ${K.ink}`, fontSize: '24px', display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box' });
  show(mRow, tW + 0.3, { x: -10, y: 0 });
  const still = tx(MAIN, '主文件先不动', 20, 140, { fs: 22, color: K.dim }); show(still, T('w1', '不动'), { y: 6 });
  wipe(WAL, T('w1b', '另一个文件') - 0.3, { dir: 'l', d: 0.4 }); sfx('whoosh', T('w1b', '另一个文件') - 0.3, { g: 0.3 });
  const gW = gloss(W, 'WAL', '预写日志：改过的页整页追加在这个文件末尾，主文件先不动', 720, 690, 560); show(gW, T('w2', 'W A L'), { y: 8 }); sfx('pop', T('w2', 'W A L'), { g: 0.4 });
  // w3–w5b：一帧 = 24 字节帧头 + 一整页；Alice 改成 43，追加了 5 帧；最后一帧写着提交后 553 页：提交标记
  const frames = FR.map((pg, i) => { const f = h('div', 'abs', WAL); px(f, 20, 56 + i * 68, 516, 56); css(f, { display: 'flex', border: `1.5px solid ${K.ink}`, boxSizing: 'border-box', fontSize: '22px' }); const hd = h('div', '', f, `第 ${pg} 页`); css(hd, { width: '370px', background: '#e6e6e6', borderRight: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', paddingLeft: '10px', fontFamily: 'Mono', fontSize: '24px', whiteSpace: 'nowrap' }); const pb = h('div', '', f, pg === 130 ? 'Alice · <b>43</b>' : '年龄 · 43'); css(pb, { flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '12px' }); f.hd = hd; return f; });
  const gF = gloss(W, '帧', '24 个字节的帧头，加一整页', 720, 690, 560);
  set(gF, 0, { autoAlpha: 0 }); show(gF, T('w3', '帧'), { y: 8 }); gone(gW, T('w3', '帧') - 0.1, 0.2);
  frames.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); tl.fromTo(f, { autoAlpha: 1, x: -40 }, { x: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, T('w4b', '130') - 0.3 + i * 0.25); sfx('tick', T('w4b', '130') - 0.3 + i * 0.25, { g: 0.35 }); });
  const n5 = tx(WAL, '5 帧', 470, 6, { fs: 22, color: K.teal }); show(n5, T('w4', '5'), { y: 6 });
  keyed(frames[4].hd).at(T('w5', '553'), { html: `第 ${FR[4]} 页 · 提交后 553 页` }); frames.forEach((f) => { f.dataset.beat = 'line'; }); sfx('thud', T('w5', '553'), { g: 0.45 });   // 提交标记写在最后一帧的帧头里
  const gM = gloss(W, '提交标记', '最后一帧的帧头记着提交后文件共几页', 720, 690, 560); set(gM, 0, { autoAlpha: 0 }); show(gM, T('w5b', '提交标记'), { y: 8 }); gone(gF, T('w5b', '提交标记') - 0.1, 0.2);
  // w6–w6b：帧头还带着校验和：对不上的帧一律不算
  frames.forEach((f, i) => keyed(f.hd).at(T('w6', '校验和') + i * 0.05, { html: i === 4 ? `第 ${FR[i]} 页 · 提交 · 校验和` : `第 ${FR[i]} 页 · 校验和` }));
  const bad = h('div', 'abs', WAL); px(bad, 20, 56 + 5 * 68, 516, 46); css(bad, { border: `1.5px dashed ${K.red}`, color: K.red, fontSize: '24px', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }); bad.innerHTML = '校验和对不上的帧：不算';
  set(bad, 0, { autoAlpha: 0 }); show(bad, T('w6b', '一律不算') - 0.2, { y: 6 }); sfx('error', T('w6b', '一律不算'), { g: 0.3 });
  gone(gM, T('w6') - 0.1, 0.2);
  const gK = gloss(W, '校验和', '按内容算出的一串数；内容坏了就对不上', 720, 690, 560, { terms: '校验和' }); set(gK, 0, { autoAlpha: 0 }); show(gK, T('w6', '校验和'), { y: 8 });
  // w7：提交之后，主文件里的 Alice 仍是 42
  set(mRow, T('w7', '42'), { backgroundColor: K.wheat }); const st42 = tx(MAIN, '提交之后，这里仍是 42', 20, 140, { fs: 22, color: K.teal });
  gone(still, T('w7') - 0.1, 0.2); show(st42, T('w7', '42'), { y: 6 }); gone(bad, T('w7') - 0.1, 0.2);
  // w8–w8b：读的时候先查 WAL；哪些页在 WAL 里，记在内存里的一份目录上
  gone(gK, T('w8') - 0.1, 0.2);
  const dir = h('div', 'abs', W); px(dir, 720, 268, 480, 150); css(dir, { border: `2px solid ${K.ink}`, background: K.wheat, padding: '8px 14px', boxSizing: 'border-box' }); dir.dataset.name = '内存里的目录';   // 让开页标题
  dir.innerHTML = '<div style="font-size:22px;color:#044a64">内存里的目录：哪些页在 WAL 里</div>' + FR.map((pg, i) => `<span style="font-family:Mono;font-size:24px;margin-right:16px">${pg}→帧${i + 1}</span>`).join('');
  set(dir, 0, { autoAlpha: 0 }); wipe(dir, T('w8b', '内存') - 0.2, { dir: 't', d: 0.4 });
  const r1 = line(ov, [[960, 560], [1236, 400]]), r2 = line(ov, [[960, 560], [684, 400]], { dashed: '7 6' });
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
  const snap = gloss(W, '快照', '读的人看的是自己开始时的那一版', 720, 430, 480); show(snap, T('w11b', '快照'), { x: 12, y: 0 }); sfx('pop', T('w11b', '快照'), { g: 0.4 });
  const fresh = btn(W, '之后开始的读者：看到 43', 120, 640, 24); set(fresh, 0, { autoAlpha: 0 }); slam(fresh, T('w12', '43'), { from: 1.2 });
  const both = tx(W, '读不挡写，写也不挡读', 720, 640, { fs: 26, color: K.teal }); show(both, T('w12', '读不挡写'), { y: 6 });
  // w13–w14：Carol 这时也要写：数据库已锁；写的人仍然只能有一个
  gone(snap, T('w13') - 0.2, 0.3);
  wipe(car, T('w13', 'Carol') - 0.2, { dir: 'l', d: 0.35 });
  keyed(car.l1).at(T('w13', 'Carol'), { html: 'sqlite> BEGIN IMMEDIATE;' });
  keyed(car.l2).at(T('w13', '已锁') - 0.1, { html: '<span style="color:#aa3333">' + DATA.wal.lockedError + '</span>' }); sfx('error', T('w13', '已锁'), { g: 0.5 });
  const one = tx(W, '写的人只能有一个', 1280, 640, { fs: 26, color: K.red }); show(one, T('w14', '只能有一个'), { y: 6 });
  // w15–w17：检查点：新页写回主文件；Bob 还在用旧页，5 页一页也没写回；Bob 结束后完成，主文件变成 43，WAL 清空
  const tC = T('w15') - 0.2;
  [fresh, both, one, car].forEach((e) => gone(e, tC, 0.3));
  const cp = line(ov, [[1236, 460], [684, 460]], { w: 3 }); const cpL = tx(W, '写回主文件', 860, 420, { fs: 24 });
  arrowIn(cp, T('w15', '写回') - 0.2, 0.6); show(cpL, T('w15', '写回'), { y: 6 });
  const gC = gloss(W, '检查点', '把 WAL 里的新页写回主文件', 720, 268, 480); set(gC, 0, { autoAlpha: 0 }); gone(dir, T('w15b', '检查点') - 0.2, 0.2); show(gC, T('w15b', '检查点'), { y: 8 }); sfx('pop', T('w15b', '检查点'), { g: 0.4 });
  set(bob, T('w16', 'Bob'), { borderColor: K.teal });
  const blocked = errBox(W, '0 页写回：Bob 还在用旧页', 760, 500, 24); set(blocked, 0, { autoAlpha: 0 }); slam(blocked, T('w16b', '没写回'), { from: 1.2 }); sfx('error', T('w16b', '没写回'), { g: 0.4 });
  const tDone = T('w17b', '43');
  set(bob, T('w17', '结束'), { opacity: 0.35 }); gone(blocked, tDone - 0.2, 0.2);
  keyed(mRow).at(tDone, { html: '<span style="font-family:Mono">第 130 页</span>　Alice · <b>43</b>' }); set(mRow, tDone, { backgroundColor: K.wheat });
  frames.forEach((f, i) => gone(f, T('w17b', '清空') + i * 0.05, 0.25)); gone(n5, T('w17b', '清空'), 0.2); sfx('whoosh', T('w17b', '清空'), { g: 0.3 });
  // w18–w19：代价：这份目录放在共享内存里，同一台机器上的进程才看得到
  const tX = T('w18') - 0.2;
  [cp, cpL, gC, ali].forEach((e) => gone(e, tX, 0.3)); goneFrom(bob, tX, 0.35);
  const host = h('div', 'abs', W); px(host, 120, 700, 1080, 200); css(host, { border: `2px dashed ${K.ink}`, boxSizing: 'border-box' });
  const hostL = tx(host, '同一台机器', 16, 8, { fs: 24, color: K.dim });
  const shm = h('div', 'abs', host, '共享内存：WAL 的目录'); px(shm, 300, 60, 480, 70); css(shm, { border: `2px solid ${K.ink}`, background: K.wheat, fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); shm.dataset.gloss = '共享内存';
  const procs = [0, 1, 2].map((i) => { const p = h('div', 'abs btn', host, `进程 ${i + 1}`); px(p, 40 + i * 340, 150); p.style.fontSize = '22px'; return p; });
  wipe(host, T('w18', '目录') - 0.2, { dir: 'l', d: 0.45 }); sfx('whoosh', T('w18', '目录') - 0.2, { g: 0.3 });   // 说到「这份目录」框就进来，「共享内存」时点亮它
  const other = h('div', 'abs', W, '另一台机器的进程：看不到'); px(other, 1260, 760); css(other, { border: `1.5px dashed ${K.red}`, color: K.red, fontSize: '24px', padding: '8px 16px' });
  set(other, 0, { autoAlpha: 0 }); show(other, T('w19', '同一台机器'), { x: 10, y: 0 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('w0'), q], [T('w1'), MAIN.nameEl], [T('w1', '不动'), mRow], [T('w1b'), WAL.nameEl], [T('w2'), gW], [T('w3'), WAL.nameEl], [T('w3', '一整页'), gF], [T('w4'), n5], [T('w4b', '130'), frames[0]], [T('w4b', '4'), frames.slice(1)], [T('w5', '最后一帧'), frames[4]], [T('w5', '553'), frames[4].hd], [T('w5b'), gM], [T('w6'), gK], [T('w6b'), WAL.nameEl], [T('w7'), mRow], [T('w8'), MAIN.nameEl], [T('w8', '主文件'), mRow], [T('w8b'), frames], [T('w8b', '目录'), dir],
    [T('w9'), bob.l2], [T('w10'), ali.l2], [T('w11'), bob.l2], [T('w11b'), snap], [T('w12'), fresh], [T('w13'), car.l2], [T('w14'), one], [T('w15'), cpL], [T('w15b'), gC], [T('w16'), bob.l2], [T('w16', '旧页'), mRow], [T('w16b', '没写回'), blocked], [T('w17'), bob.l2], [T('w17b'), mRow], [T('w18', '代价'), WAL.nameEl], [T('w18', '共享内存'), shm], [T('w18b'), host], [T('w18b', '进程'), procs], [T('w19'), other]], Tend('w19'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('w7', '42'), { g: 0.35 });
  sfx('pop', T('w8', '先查'), { g: 0.3 });
  sfx('whoosh', T('w8b', '目录') - 0.2, { g: 0.25 });
  sfx('tick', T('w9', '42'), { g: 0.3 });
  stay(cam, s, c0, -1);
});
