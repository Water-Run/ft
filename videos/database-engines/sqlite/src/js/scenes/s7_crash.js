// 07 出错怎么办（第 11 稿）：开头那一幕——全部加一、没提交就写进主文件、强行终止、重开时先看一眼有没有日志、抄回原页（E05、K03、J05）；
// 第 12 稿：两段共用一个画面层，main.db 留在左边，WAL 从右边进来。WAL 模式靠帧头：校验和对不上的帧不算，只认带提交标记的帧（K04、E03）。
scene('crash', ({ root, s, c0 }) => {
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
  mRows.forEach((r) => set(r, 0, { autoAlpha: 0 }));
  // ── j20–j25：出错：全部加一，改动多到内存放不下，一部分已经写进主文件；强行终止，重开抄回 ──
  const tE = T('j20') - 0.2;
  
  const up = codeBlock(W, ['UPDATE users SET age = age + 1;'], 120, 714, { fs: 28 }); wipe(up, T('j20', '加一') - 0.2, { dir: 'l', d: 0.4 });   // 上面留给「还没提交，已经写进主文件的页」
  const mini = []; for (let i = 0; i < 60; i++) mini.push(pageCell(MAIN, 24 + (i % 12) * 46, 60 + Math.floor(i / 12) * 66, 40, 56, { bw: 1 }));
  mini.forEach((c, i) => show(c, tE + 0.3 + i * 0.01, { y: 0, d: 0.2 }));
  const JR2 = panel('main.db-journal', 1200, 250, 600, 420);
  wipe(JR2, T('j21') - 0.1, { dir: 'l', d: 0.4 });
  const jm = []; for (let i = 0; i < 24; i++) jm.push(pageCell(JR2, 24 + (i % 12) * 46, 60 + Math.floor(i / 12) * 66, 40, 56, { bw: 1, fill: '#eeeeee' }));
  jm.forEach((c, i) => show(c, T('j21') + 0.2 + i * 0.03, { y: 0, d: 0.2 }));
  const spill = mini.slice(0, 24);
  spill.forEach((c, i) => set(c, T('j21', '写进了主文件') - 0.3 + i * 0.03, { backgroundColor: '#efc6c6' }));   // 改到一半的页：浅红，和开场同色
  const spL = tx(W, '还没提交，已经写进主文件的页', 120, 680, { fs: 22, color: K.teal }); set(spL, 0, { autoAlpha: 0 }); show(spL, T('j21', '写进了主文件'), { y: 6 });
  // 强行终止：和开场同一个动作——这条 UPDATE 边框变红、抖几下、整块塌掉
  const tK = T('j22', '强行终止');
  set(up, tK, { borderColor: K.red });
  tl.fromTo(up, { x: 0 }, { x: 14, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, tK);
  tl.fromTo(up, { scaleY: 1, autoAlpha: 1 }, { scaleY: 0, autoAlpha: 0, duration: 0.35, ease: 'power3.in', immediateRender: false }, tK + 0.45);
  sfx('error', tK, { g: 0.6 }); sfx('thud', tK + 0.6, { g: 0.3 });
  const left = tx(W, '日志文件留了下来', 1200, 680, { fs: 24, color: K.teal }); show(left, T('j22', '日志文件'), { y: 6 });
  // j23：每次开始读之前，SQLite 都先看一眼：旁边有没有日志
  const look = h('div', 'abs', W); px(look, 1194, 244, 612, 52); css(look, { border: `3px solid ${K.teal}` }); set(look, 0, { autoAlpha: 0 }); show(look, T('j23', '看一眼'), { y: 0, d: 0.3 });
  sfx('tick', T('j23', '看一眼'), { g: 0.4 });
  // j24：有，就把原样的页抄回主文件，再删掉日志
  const back = line(ov, [[1196, 460], [724, 460]], { w: 3 }); arrowIn(back, T('j24', '抄回') - 0.2, 0.6);
  // 日志里的原页真的飞回主文件：一格对一格落到浅红的页上，落下那一刻浅红退成白
  const tB = T('j24', '抄回') - 0.1;
  jm.forEach((c, i) => { tl.fromTo(c, { x: 0 }, { x: -1080, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, tB + i * 0.02); gone(c, tB + 0.7 + i * 0.02, 0.45); });
  spill.forEach((c, i) => set(c, tB + 0.7 + i * 0.02, { backgroundColor: '#ffffff' })); sfx('whoosh', tB, { g: 0.3 });
  const tD2 = T('j24', '删掉');
  [JR2, look, back].forEach((e) => gone(e, tD2, 0.3)); gone(left, tD2, 0.3);
  gone(spL, T('j25') - 0.2, 0.3);
  const same = tx(W, '整个文件的 SHA-256 与改之前相同', 120, 696, { fs: 30, css: { background: '#f2f2f2', padding: '4px 16px' } });
  const a42 = tx(W, 'Alice 仍是 42', 720, 696, { fs: 30, css: { background: K.wheat, padding: '4px 16px' } }); set(a42, 0, { autoAlpha: 0 }); show(a42, T('j25', 'Alice'), { y: 6 }); sfx('tick', T('j25', 'Alice'), { g: 0.3 });
  set(same, 0, { autoAlpha: 0 }); wipe(same, T('j25', '一字节不差') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('j25', '一字节不差'), { g: 0.5 });
  // k1 起：同一个画面层。恢复那段的结果收走，main.db 留在左边（页都抄回了原样），WAL 从右边进来
  [same, a42].forEach((e) => gone(e, T('k1') - 0.35, 0.3));
  // 重新打开时的三步：先看一眼有没有日志 → 有就把原页抄回主文件 → 删掉日志（和第 05 章的四步同一种画法）
  const RY = 770, RX = [120, 700, 1280], RT = ['① 先看一眼：旁边有没有日志', '② 有：原页抄回主文件', '③ 删掉日志'];
  const rst = RT.map((t, i) => rrBox(W, t, RX[i], RY, { w: 500, fs: 28 }));
  const rArr = [0, 1].map((i) => line(ov, [[RX[i] + 504, RY + 26], [RX[i + 1] - 4, RY + 26]], { w: 2 }));
  const tRs = [T('j23', '看一眼') - 0.1, T('j24', '抄回') - 0.2, T('j24', '删掉') - 0.1];
  rst.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); show(e, tRs[i], { x: -12, y: 0, d: 0.4 }); if (i) arrowIn(rArr[i - 1], tRs[i] - 0.25, 0.3); });
  [...rst, ...rArr].forEach((e) => gone(e, T('k1') - 0.35, 0.4));
  focus(W, [[T('j23', '日志'), JR2, Tend('j23')], [tRs[1] + 0.2, rst[1]], [tRs[2] + 0.2, rst[2], Tend('j24') + 0.5]], Tend('j25'));
  [[T('j20') - 0.2, '开头那一幕：改到一半被终止'], [T('j23') - 0.2, '重新打开：先看一眼有没有日志']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  sfx('tick', T('j23', '看一眼'), { g: 0.4 });
  sfx('tick', T('j20', '加一'), { g: 0.3 });
  {
    // k1–k2：WAL 模式下提交只往 WAL 里追加帧，主文件不动；出了事，要分清哪些帧算数——校验和对不上的帧不算，只认校验和对得上、带提交标记的帧（K04、E03）
    const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
    const FR = DATA.wal.frames;
    const WAL = panel('main.db-wal', 960, 250, 860, 470);
    set(WAL, 0, { autoAlpha: 0 }); wipe(WAL, T('k1', 'W A L') - 0.1, { dir: 'l', d: 0.45 }); sfx('whoosh', T('k1', 'W A L') - 0.1, { g: 0.3 });
    const still = tx(MAIN, '主文件不动', 360, 6, { fs: 22, color: K.dim }); show(still, T('k1', '追加') + 0.6, { y: 6 });
    const ask = tx(W, '哪些帧算数？', 980, 742, { fs: 30, color: K.teal }); show(ask, T('k1b', '哪些帧'), { y: 8 }); gone(ask, T('w6') - 0.2, 0.3);
    const frames = FR.map((pg, i) => { const f = h('div', 'abs', WAL); px(f, 20, 56 + i * 68, 756, 56); css(f, { display: 'flex', border: `1.5px solid ${K.ink}`, boxSizing: 'border-box', fontSize: '24px' }); const hd = h('div', '', f, `第 ${pg} 页`); css(hd, { width: '470px', background: '#e6e6e6', borderRight: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', paddingLeft: '10px', fontFamily: 'Mono', fontSize: '24px', whiteSpace: 'nowrap' }); const pb = h('div', '', f, pg === 130 ? 'Alice · <b>43</b>' : '年龄 · 43'); css(pb, { flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '12px', background: pg === 130 ? K.wheat : 'transparent' }); f.hd = hd; return f; });   // 第 130 页（Alice 那一页）的新版：麦色
    frames.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); tl.fromTo(f, { autoAlpha: 1, x: -60 }, { x: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, T('k1', '追加') - 0.1 + i * 0.22); sfx('tick', T('k1', '追加') - 0.1 + i * 0.22, { g: 0.3 }); });
    frames.forEach((f, i) => keyed(f.hd).at(T('w6', '校验和') + i * 0.08, { html: `第 ${FR[i]} 页 · 校验和对得上` }));
    sfx('tick', T('w6', '校验和'), { g: 0.4 });
    const gK = gloss(W, '校验和', '按内容算出的一串数', 980, 742, 820, { terms: '校验和' }); set(gK, 0, { autoAlpha: 0 }); show(gK, T('w6', '校验和') + 0.2, { y: 8 });
    const bad = h('div', 'abs', WAL); px(bad, 20, 56 + 5 * 68, 756, 50); css(bad, { border: `2px dashed ${K.red}`, color: K.red, fontSize: '24px', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }); bad.innerHTML = '第 6 帧 · 内容写坏了 · 校验和对不上';
    set(bad, 0, { autoAlpha: 0 }); show(bad, T('w6b', '坏了') - 0.1, { x: -16, y: 0 }); sfx('error', T('w6b', '对不上'), { g: 0.35 });
    tl.fromTo(bad, { opacity: 1 }, { opacity: 0.35, duration: 0.5, immediateRender: false }, T('w6b', '一律不算'));
    const noC = tx(W, '不算', 870, 250 + 56 + 5 * 68 + 6, { fs: 30, color: K.red }); show(noC, T('w6b', '一律不算'), { x: -10, y: 0 });
    keyed(frames[4].hd).at(T('k2', '提交标记') - 0.2, { html: `第 ${FR[4]} 页 · 提交 · 校验和对得上` });
    const okL = tx(W, '算数', 870, 250 + 56 + 4 * 68 + 8, { fs: 30, color: K.teal }); show(okL, T('k2', '才算数'), { x: -10, y: 0 }); sfx('chime', T('k2', '才算数'), { g: 0.45 });
    gone(gK, T('k2') - 0.2, 0.3);
    frames.forEach((f) => { f.dataset.beat = 'line'; });
    focus(W, [[T('k2', '提交标记'), frames[4].hd, Tend('k2')]], Tend('k2'));   // 焦点框：带提交标记的那一帧的帧头
    shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }], [T('k1') - 0.35, null, { rect: [110, 240, 1830, 880], pad: 0, d: 1.5 }]]);
  }
  }
});
