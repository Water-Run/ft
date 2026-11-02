// 07 出错怎么办（第 11 稿）：开头那一幕——全部加一、没提交就写进主文件、强行终止、重开时先看一眼有没有日志、抄回原页（E05、K03、J05）；
// WAL 模式靠帧头：校验和对不上的帧不算，只认带提交标记的帧（K04、E03）。
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
  gone(world, T('k1') - 0.35, 0.3); gone(title, T('k1') - 0.35, 0.25);
  beats([[T('j20'), up], [T('j21'), JR2.nameEl], [T('j22'), up], [T('j22', '日志文件'), left], [T('j23'), MAIN.nameEl], [T('j23', '有没有'), JR2.nameEl], [T('j24'), jm], [T('j24', '主文件'), MAIN.nameEl], [T('j25', '一字节不差'), same], [T('j25', 'Alice'), a42], [T('j25') + 3.39, [MAIN, same, a42], 1]], Tend('j25'));
  [[T('j20') - 0.2, '开头那一幕：改到一半被终止'], [T('j23') - 0.2, '重新打开：先看一眼有没有日志']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  sfx('tick', T('j23', '看一眼'), { g: 0.4 });
  sfx('tick', T('j20', '加一'), { g: 0.3 });
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }]]);
  }
  {
    // k1–k2：WAL 模式靠帧头——每帧带校验和，对不上的帧不算；只认校验和对得上、带提交标记的帧（K04、E03）
    const world = h('div', 'world', root);
    const cam = makeCamera(world);
    const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
    const title = pageTitle(W, 'WAL 模式：靠帧头'); set(title, 0, { autoAlpha: 0 }); show(title, T('k1') - 0.2, { y: 8 });
    const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
    const FR = DATA.wal.frames;
    const WAL = panel('main.db-wal', 560, 250, 800, 470);
    set(WAL, 0, { autoAlpha: 0 }); wipe(WAL, T('k1') - 0.1, { dir: 'l', d: 0.45 }); sfx('whoosh', T('k1') - 0.1, { g: 0.3 });
    const frames = FR.map((pg, i) => { const f = h('div', 'abs', WAL); px(f, 20, 56 + i * 68, 756, 56); css(f, { display: 'flex', border: `1.5px solid ${K.ink}`, boxSizing: 'border-box', fontSize: '24px' }); const hd = h('div', '', f, `第 ${pg} 页`); css(hd, { width: '470px', background: '#e6e6e6', borderRight: `1.5px solid ${K.ink}`, display: 'flex', alignItems: 'center', paddingLeft: '10px', fontFamily: 'Mono', fontSize: '24px', whiteSpace: 'nowrap' }); const pb = h('div', '', f, pg === 130 ? 'Alice · <b>43</b>' : '年龄 · 43'); css(pb, { flex: '1', display: 'flex', alignItems: 'center', paddingLeft: '12px' }); f.hd = hd; return f; });
    frames.forEach((f, i) => { set(f, 0, { autoAlpha: 0 }); show(f, T('k1') + 0.3 + i * 0.12, { x: -16, y: 0, d: 0.35 }); });
    frames.forEach((f, i) => keyed(f.hd).at(T('w6', '校验和') + i * 0.08, { html: `第 ${FR[i]} 页 · 校验和对得上` }));
    sfx('tick', T('w6', '校验和'), { g: 0.4 });
    const gK = gloss(W, '校验和', '按内容算出的一串数；内容坏了就对不上', 560, 750, 800, { terms: '校验和' }); set(gK, 0, { autoAlpha: 0 }); show(gK, T('w6', '校验和') + 0.2, { y: 8 });
    const bad = h('div', 'abs', WAL); px(bad, 20, 56 + 5 * 68, 756, 50); css(bad, { border: `2px dashed ${K.red}`, color: K.red, fontSize: '24px', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }); bad.innerHTML = '第 6 帧 · 内容写坏了 · 校验和对不上';
    set(bad, 0, { autoAlpha: 0 }); show(bad, T('w6b', '坏了') - 0.1, { x: -16, y: 0 }); sfx('error', T('w6b', '对不上'), { g: 0.35 });
    tl.fromTo(bad, { opacity: 1 }, { opacity: 0.35, duration: 0.5, immediateRender: false }, T('w6b', '一律不算'));
    const noC = tx(W, '不算', 1380, 250 + 56 + 5 * 68 + 6, { fs: 30, color: K.red }); show(noC, T('w6b', '一律不算'), { x: -10, y: 0 });
    keyed(frames[4].hd).at(T('k2', '提交标记') - 0.2, { html: `第 ${FR[4]} 页 · 提交 · 校验和对得上` });
    const okL = tx(W, '算数', 1380, 250 + 56 + 4 * 68 + 8, { fs: 30, color: K.teal }); show(okL, T('k2', '才算数'), { x: -10, y: 0 }); sfx('chime', T('k2', '才算数'), { g: 0.45 });
    gone(gK, T('k2') - 0.2, 0.3);
    frames.forEach((f) => { f.dataset.beat = 'line'; });
    beats([[T('k1'), WAL.nameEl], [T('k1', '帧头'), frames.map((f) => f.hd)], [T('w6', '校验和'), gK], [T('w6b'), bad], [T('k2'), frames], [T('k2', '提交标记'), frames[4].hd], [T('k2', '才算数'), okL], [T('k2') + 3.77, [WAL, okL], 1]], Tend('k2'));
    shots(cam, world, s, [[s.start, null, { rect: [540, 240, 1460, 860], zmax: 1.2 }]]);
  }
});
