// 02 怎么放（第 12 稿）：先是和开场一样的 553 页大网格；讲到「先从一张空表看起」时整张收成顶上一条细带（参照物），下方从「一张空表」长出 B+ 树，再换成整棵 users 树。
// 事实：I01（读写以页为单位）、J01（文件头、页大小、页数）、02 归属（260/243/37）、第 1 页登记根页、split（17 行分裂）、H01–H03、C02（4096 字节页两层）。
scene('store', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  // 一棵紧凑的树：根页一条（分界格）、中层若干页、叶页一排细格
  function tree(T0, x0, w, label) {
    const by = Object.fromEntries(T0.nodes.map((n) => [n.p, n])), rt = by[T0.root], mids = rt.c.map((p) => by[p]);
    const leaves = mids.flatMap((m) => m.c), pitch = w / leaves.length, lx = Object.fromEntries(leaves.map((p, i) => [p, x0 + i * pitch]));
    const RY = 380, MY = 500, LY = 620, rw = Math.min(w * 0.55, 60 + rt.n * 26), rx = x0 + w / 2 - rw / 2;
    const r = h('div', 'abs', W); px(r, rx, RY, rw, 50); css(r, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); r.dataset.name = `根页 ${T0.root}`;
    for (let i = 1; i <= rt.n; i++) { const d = h('div', 'abs', r); px(d, (rw - 4) * i / (rt.n + 1), 6, 1.5, 36); css(d, { background: '#888' }); }
    const rl = tx(W, `根页 ${T0.root}`, rx + rw + 12, RY + 8, { fs: 24 });
    const mEls = mids.map((m, i) => { const xs = m.c.map((p) => lx[p]), mx = (xs[0] + xs[xs.length - 1] + pitch) / 2, mw = Math.max(18, Math.min(110, (xs[xs.length - 1] - xs[0]) * 0.8)); const e = pageCell(W, mx - mw / 2, MY, mw, 44, { bw: 1.5 }); e.mx = mx; e.p = m.p; return e; });
    const fan = h('div', 'abs', W); px(fan, 0, 0, 1920, 1080); const fs = overlay(fan);
    mEls.forEach((e, i) => path(fs, `M${rx + (rw * (i + 0.5)) / mids.length},${RY + 50} L${e.mx},${MY}`, 'grey', { w: 1, arrow: false }));
    mids.forEach((m, j) => m.c.forEach((p) => path(fs, `M${mEls[j].mx},${MY + 44} L${lx[p] + pitch / 2},${LY}`, 'grey', { w: 0.5, arrow: false })));
    const lEls = Object.fromEntries(leaves.map((p) => [p, pageCell(W, lx[p] + 0.3, LY, Math.max(1, pitch - 0.6), 60, { bw: 0.5 })]));
    const lab = tx(W, label, x0, LY + 88, { fs: 26 });   // 让出叶页下面那条「剩下的范围」
    const all = [r, rl, ...mEls, fan, ...Object.values(lEls), lab];
    return { r, rl, mEls, fan, lEls, lab, lx, pitch, rx, rw, RY, MY, LY, all, mids, leaves,
      enter(t) { wipe(r, t, { dir: 't', d: 0.4 }); show(rl, t + 0.1, { x: -8, y: 0 }); mEls.forEach((e, i) => show(e, t + 0.2 + i * 0.02, { y: -8, d: 0.25 })); set(fan, 0, { autoAlpha: 0 }); show(fan, t + 0.3, { y: 0, d: 0.4 }); Object.values(lEls).forEach((e, i) => show(e, t + 0.35 + i * 0.003, { y: 8, d: 0.2 })); show(lab, t + 0.5, { y: 6 }); } };
  }
  // 点亮一页：起点在构建时就渲染（immediateRender）。不这样做，GSAP 第一次播到才记下当时的计算样式；那一刻若挂着选中样式（.bt 的深青底），倒跳回去就写回深青
  const title = pageTitle(W, '一个文件，切成一页一页'); show(title, c0 + 0.1, { y: 8 });

  // ── s0–s1：一个文件，每次只动一小块；这一小块叫页 ──
  // 文件图：先是和开场一样的 40 列大网格（填满左边），s7 时整张收成顶上一条 79 列的细带（SX、SY），镜头下移去长树
  const GX = 130, GY = 300, CELL = 22, GAP = 3, COLS = 40, GW = COLS * (CELL + GAP) - GAP, GH = 14 * (CELL + GAP) - GAP;
  const SX = 130, SY = 262, SC = 18, SG = 3, spos = (pg) => ({ x: SX + ((pg - 1) % 79) * (SC + SG), y: SY + Math.floor((pg - 1) / 79) * (SC + SG) });
  const bar = h('div', 'abs', W); px(bar, GX, GY, GW, GH); css(bar, { border: `2px solid ${K.ink}`, background: '#fff' });
  const barL = tx(W, 'main.db', GX + 40, GY - 46, { fs: 26, mono: true });
  wipe(bar, c0 + 0.15, { dir: 'l', d: 0.5 }); show(barL, c0 + 0.2, { y: 6 });
  const blk = h('div', 'abs', W); px(blk, GX, GY, CELL, CELL); css(blk, { background: K.wheat, border: `2px solid ${K.teal}`, boxSizing: 'border-box' });
  set(blk, 0, { autoAlpha: 0 }); slam(blk, T('s0', '一小块'), { from: 2 }); set(bar, T('s0', '一小块') - 0.1, { backgroundColor: '#e6e6e6' });   // 其余的页这次不碰：整条变灰，只剩那一小块
  sfx('pop', T('s0', '一小块'), { g: 0.4 });
  const G = fileGrid(W, GX, GY, COLS, CELL, GAP);
  G.cells.forEach((c, i) => { c.style.transformOrigin = '0 0'; show(c, T('s1', '页') + (i % COLS) * 0.008 + Math.floor(i / COLS) * 0.03, { y: 0, d: 0.2 }); });
  gone(bar, T('s1', '页') + 0.5, 0.3); gone(blk, T('s1', '页') + 0.2, 0.2);
  const pg = gloss(W, '页', '文件切成一样大的块，读写都以页为单位，从 1 开始编号', 1200, GY, 600); show(pg, T('s1', '页') + 0.2, { x: 12, y: 0 });
  sfx('whoosh', T('s1', '页'), { g: 0.3 });
  const n1 = tx(W, '1', GX + 4, GY - 38, { fs: 20, mono: true }), n553 = tx(W, '553', G.pos(553).x + 30, G.pos(553).y - 6, { fs: 20, mono: true });
  show(n1, T('s1', '1') , { y: 6 }); show(n553, T('s1', '1') + 0.2, { y: 6 });

  // s3：一页 1024 字节，553 页
  const sz = tx(W, '一页 1024 字节 · 553 页', GX, GY + GH + 90, { fs: 28 }); show(sz, T('s3', '1024'), { y: 6 });
  const gridHi = h('div', 'abs', W); px(gridHi, GX - 6, GY - 6, GW + 12, GH + 12); css(gridHi, { background: 'rgba(4, 74, 100, 0.16)', border: `3px solid ${K.teal}`, boxSizing: 'border-box' });
  set(gridHi, 0, { autoAlpha: 0 }); show(gridHi, T('s3', '553'), { y: 0, d: 0.3 }); gone(gridHi, T('s4', '归属'), 0.3);   // 「一共 553 页」：整个文件的页一起亮
  // s4–s4c：每一页都有归属
  G.cells.forEach((c, i) => set(c, 0, { backgroundColor: '#ffffff' }));
  const own = DATA.file.owner;
  [...own].forEach((o, i) => { if (o === 'n' || o === 'a' || o === 's' || o === 't' || o === 'o') set(G.cells[i], T('s4b', o === 'n' ? '名字' : o === 'a' ? '年龄' : '索引') + (i % COLS) * 0.004, { backgroundColor: OWN[o] }); });
  const lg = [['#ffffff', 'users 表 260 页', 's4', '260'], ['#d9d9d9', '姓名索引 243 页', 's4b', '名字'], ['#eeeeee', '年龄索引 37 页', 's4b', '年龄']];
  const lgs = lg.map(([f, t, c, w], i) => { const g = h('div', 'abs', W); g.dataset.beat = 'text'; px(g, 1200, GY + 150 + i * 48, 400, 36); const sw = h('div', 'abs', g); px(sw, 0, 6, 24, 24); css(sw, { background: f, border: '1px solid #444' }); tx(g, t, 36, 0, { fs: 26 }); set(g, 0, { autoAlpha: 0 }); show(g, T(c, w), { y: 6 }); return g; });
  const ix = gloss(W, '索引', '另外按名字、按年龄排好的目录，为了找得快', 1200, GY, 600); show(ix, T('s4b', '索引') + 0.1, { x: 12, y: 0 });
  gone(pg, T('s4b') - 0.2, 0.3);
  // s5–s6：第 1 页登记着每张表、每个索引从哪一页开始找
  const reg = docTable(W, [['第 1 页登记的', 300], ['从第几页开始', 230]], [['users 表', '2'], ['姓名索引', '262']], 1200, GY + 320, { fs: 28 });
  reg.t.dataset.name = '第 1 页的登记';
  gone(sz, T('s5') - 0.2, 0.3);
  set(G.cells[0], T('s5'), { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2.5px' });
  show(reg.hr, T('s5') + 0.1, { y: 6 }); show(reg.rs[0], T('s6'), { x: -10, y: 0 }); show(reg.rs[1], T('s6', '262'), { x: -10, y: 0 });
  [1, 261].forEach((i, k) => set(G.cells[i], T('s6', k ? '262' : '2'), { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2.5px' }));
  sfx('tick', T('s6', '2'), { g: 0.4 }); sfx('tick', T('s6', '262'), { g: 0.4 });

  keyed(title).at(T('s4') - 0.2, { html: '每一页都有归属' });
  keyed(title).at(T('s5') - 0.2, { html: '第 1 页登记：每棵树从哪一页开始' });
  keyed(title).at(T('s7') - 0.2, { html: 'Alice 这一行，放到哪里？' });
  keyed(title).at(T('s10') - 0.2, { html: '第 18 行来了：一页放不下' });
  keyed(title).at(T('s14') - 0.2, { html: '内部页、叶页、根页' });
  keyed(title).at(T('s16') - 0.2, { html: '插满 4096 行：users 表长成三层' });
  keyed(title).at(T('s21') - 0.2, { html: '整行只放在叶页里：B+ 树' });
  keyed(title).at(T('x0') - 0.3, { html: '姓名索引：也是一棵树' });
  keyed(title).at(T('s26') - 0.2, { html: '分界本身就是一项：B 树' });
  // ── s7–s15b：从一张空表长出 B+ 树（本片这个文件的实测：17 行放满第 2 页，第 18 行来了就分裂） ──
  const tD = T('s7') - 0.2;
  [ix, ...lgs, reg.t].forEach((e) => gone(e, tD, 0.3));
  G.cells.forEach((c, i) => { const a = G.pos(i + 1), b = spos(i + 1); dim(c, tD + 0.3, 0.25, 1, 0.6); tl.fromTo(c, { x: 0, y: 0, scale: 1 }, { x: b.x - a.x, y: b.y - a.y, scale: SC / CELL, duration: 1.0, ease: 'power3.inOut', immediateRender: false }, tD + Math.floor(i / COLS) * 0.02); });   // 大网格原地收成顶上的细带
  sfx('whoosh', tD, { g: 0.3 });
  [n1, n553, barL].forEach((e) => gone(e, tD, 0.3));   // 进树以后镜头下移，文件名会躲到页头底下：一起收走
  const pbox = (label, x, y, w) => { const b = h('div', 'abs', W); px(b, x, y, w, 120); css(b, { border: `2px solid ${K.ink}`, background: '#fff' }); const l = tx(b, label, 10, 6, { fs: 22, color: K.teal }); return b; };
  const P2 = pbox('第 2 页', 745, 480, 450), P3 = pbox('第 3 页', 380, 760, 450), P4 = pbox('第 4 页', 1090, 760, 450);
  const chip = tx(W, 'Alice 这一行', 1240, 520, { fs: 26, css: { background: K.wheat, border: `1.5px solid ${K.ink}`, padding: '4px 12px' } }); set(chip, 0, { autoAlpha: 0 }); slam(chip, T('s7', 'Alice'), { from: 1.2 }); sfx('pop', T('s7', 'Alice'), { g: 0.35 });
  const ask = tx(W, '放哪一页？', 1240, 580, { fs: 26, color: K.teal }); show(ask, T('s7', '哪里'), { y: 6 });
  const pk = codeBlock(W, ['id INTEGER PRIMARY KEY'], 1240, 640, { fs: 24 }); pk.dataset.beat = 'text'; set(pk, 0, { autoAlpha: 0 }); show(pk, T('s8') - 0.1, { y: 6 });
  [chip, ask, pk].forEach((e) => gone(e, T('s9', '17') - 0.4, 0.3));
  wipe(P2, T('s7', '空表') - 0.1, { dir: 'l', d: 0.4 }); sfx('whoosh', T('s7', '空表') - 0.1, { g: 0.3 });
  const rid = gloss(W, '行号', 'id 声明成整数主键，就拿它当行号；页里按行号排', 120, 470, 560); show(rid, T('s8', '行号'), { x: -12, y: 0 });
  const slot = (p, i) => { const e = h('div', 'abs', p); px(e, 10 + i * 25, 46, 22, 56); css(e, { border: `1.5px solid ${K.ink}`, background: K.paper, boxSizing: 'border-box' }); return e; };
  const rows = []; for (let i = 0; i < 17; i++) rows.push(slot(P2, i));
  const r1L = tx(P2, '1', 14, 104, { fs: 24, mono: true }), r17L = tx(P2, '17', 10 + 16 * 25 - 4, 104, { fs: 24, mono: true });
  [r1L, r17L].forEach((e) => show(e, T('s9', '17'), { y: 6 }));
  rows.forEach((r, i) => show(r, T('s9', '17') - 0.3 + i * 0.07, { y: -14, d: 0.25 })); sfx('tick', T('s9', '17'), { g: 0.4 });
  rows.forEach((r, i) => tl.fromTo(r, { y: 0 }, { y: -10, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, T('s9', '按行号') + i * 0.05));
  const r18 = slot(W, 0); px(r18, 1230, 526, 22, 56); const r18L = tx(r18, '18', 28, 12, { fs: 24, mono: true }); set(r18, 0, { autoAlpha: 0 }); slide(r18, T('s10', '18'), { x: 120, y: 0 });
  // 放不下：第 18 行往第 2 页里挤，撞到满了的页边被弹回来；第 2 页晃一下、边框变红
  const tFull = T('s10', '放不下') - 0.2;
  tl.fromTo(r18, { x: 0 }, { x: -34, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, tFull);
  tl.fromTo(P2, { x: 0 }, { x: 6, duration: 0.05, yoyo: true, repeat: 5, ease: 'none', immediateRender: false }, tFull + 0.15);
  tl.fromTo(P2, { borderColor: '#000000' }, { borderColor: K.red, duration: 0.15, immediateRender: false }, tFull + 0.15);
  tl.fromTo(P2, { borderColor: K.red }, { borderColor: '#000000', duration: 0.3, immediateRender: false }, T('s11') - 0.2);
  sfx('error', tFull + 0.15, { g: 0.45 });
  // s11：17 行挪到新的第 3 页，新行放进第 4 页
  const tMv = T('s11') - 0.1;
  wipe(P3, tMv, { dir: 'l', d: 0.35 }); wipe(P4, tMv + 0.1, { dir: 'l', d: 0.35 });
  rows.forEach((r, i) => tl.fromTo(r, { x: 0, y: 0 }, { x: 380 - 745, y: 280, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tMv + 0.3 + i * 0.02));
  tl.fromTo(r18, { x: 0, y: 0 }, { x: 1100 - 1230, y: 280, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tMv + 0.5);
  sfx('whoosh', tMv + 0.3, { g: 0.35 });
  // s12–s13：第 2 页只留一个分界 17：不超过 17 的去第 3 页，更大的去第 4 页
  const sep = h('div', 'abs', P2, '17'); px(sep, 190, 46, 70, 56); css(sep, { border: `2px solid ${K.ink}`, background: K.wheat, fontSize: '30px', fontFamily: 'Mono', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' });
  set(sep, 0, { autoAlpha: 0 }); slam(sep, T('s12', '17'), { from: 1.4 }); sfx('thud', T('s12', '17'), { g: 0.45 });
  const lA = line(ov, [[930, 600], [605, 760]]), lB = line(ov, [[1010, 600], [1315, 760]]);
  const la = tx(W, '≤ 17', 690, 650, { fs: 28, mono: true }), lb = tx(W, '> 17', 1180, 650, { fs: 28, mono: true });
  arrowIn(lA, T('s13', '不超过') - 0.1, 0.4); show(la, T('s13', '不超过'), { y: 6 }); arrowIn(lB, T('s13', '更大') - 0.1, 0.4); show(lb, T('s13', '更大'), { y: 6 });
  // s14：内部页、叶页；s15：根页
  const gIn = gloss(W, '内部页', '只存分界和子页的页号', 1240, 480, 480); const gLf = gloss(W, '叶页', '存数据的页', 380, 900, 300);
  show(gIn, T('s14', '内部页'), { x: 12, y: 0 }); show(gLf, T('s14', '叶页'), { y: 8 }); sfx('pop', T('s14', '内部页'), { g: 0.35 });
  gone(rid, T('s10') - 0.5, 0.3);
  const gRt = gloss(W, '根页', '树最顶上的那一页；第 1 页登记的就是它', 120, 470, 560); show(gRt, T('s15c', '根页'), { x: -12, y: 0 }); sfx('pop', T('s15c', '根页'), { g: 0.35 });
  const regC = tx(W, '第 1 页登记：users 表 → 第 2 页', 160, 410, { fs: 24, color: K.teal }); set(regC, 0, { autoAlpha: 0 }); show(regC, T('s15b') - 0.1, { y: 6 });
  // 第 1 页登记的线：从细带上第 1 页的左边绕出来，不穿过页格
  const rLine = line(ov, [[SX - 2, SY + 9], [SX - 22, SY + 9], [SX - 22, 452], [705, 452], [745, 520]], { dashed: '7 6' }); arrowIn(rLine, T('s15b'), 0.6);
  set(G.cells[0], T('s15b'), { opacity: 1, backgroundColor: K.wheat }); set(G.cells[1], T('s15b') + 0.3, { opacity: 1, backgroundColor: K.wheat });

  // ── s16–s22b：插满 4096 行，users 表长成三层：整棵树 ──
  const tF = T('s16') - 0.2;
  [P2, P3, P4, r18, lA, lB, la, lb, gIn, gLf, gRt, rLine, regC].forEach((e) => gone(e, tF, 0.3));
  const ins = codeBlock(W, ['INSERT INTO users …　× 4096'], 130, 470, { fs: 26 }); ins.dataset.beat = 'text'; set(ins, 0, { autoAlpha: 0 }); show(ins, T('s16') + 0.1, { y: 6 }); gone(ins, T('s17') - 0.2, 0.3);   // 「插满 4096 行」
  rows.forEach((r) => gone(r, tF, 0.3));
  const U = DATA.users, by = Object.fromEntries(U.nodes.map((n) => [n.p, n])), rt = by[U.root], mids = rt.c.map((p) => by[p]);
  const leaves = mids.flatMap((m) => m.c), LX0 = 130, LW = 1660, pitch = LW / leaves.length, leafX = Object.fromEntries(leaves.map((p, i) => [p, LX0 + i * pitch]));
  const RY = 470, MY = 640, LY = 830;
  // 根页：一行格子（指针格夹着分界格）
  const keyW = 120, slotW = 36, rw = slotW * 3 + keyW * 2, rx = 960 - rw / 2;
  const rootEl = h('div', 'abs', W); px(rootEl, rx, RY, rw, 60); css(rootEl, { display: 'flex', border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); rootEl.dataset.name = '根页 2';
  const kEls = [];
  ['', rt.s[0], '', rt.s[1], ''].forEach((k, i) => { const c = h('div', '', rootEl, k === '' ? '•' : String(k)); css(c, { width: (k === '' ? slotW : keyW) + 'px', borderLeft: i ? `1.5px solid ${K.ink}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Mono', fontSize: k === '' ? '20px' : '30px' }); if (k !== '') kEls.push(c); });
  const rootL = tx(W, '根页 2', rx + rw + 16, RY + 12, { fs: 26 });
  wipe(rootEl, T('s16', '三层') - 0.3, { dir: 't', d: 0.4 }); show(rootL, T('s16', '三层'), { x: -8, y: 0 });
  const midEls = mids.map((m, i) => { const xs = m.c.map((p) => leafX[p]), mx = (xs[0] + xs[xs.length - 1] + pitch) / 2; const e = h('div', 'abs', W, `第 ${m.p} 页`); px(e, mx - 100, MY, 200, 54); css(e, { border: `2px solid ${K.ink}`, background: '#fff', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }); e.mx = mx; return e; });
  const midLines = midEls.map((e, i) => line(ov, [[rx + slotW / 2 + i * (slotW + keyW), RY + 60], [e.mx, MY]], { arrow: false, w: 1.5 }));
  midEls.forEach((e, i) => wipe(e, T('s16', '三层') + 0.1 + i * 0.1, { dir: 'l', d: 0.35 })); midLines.forEach((l, i) => arrowIn(l, T('s16', '三层') + i * 0.1, 0.4));
  const fan = h('div', 'abs', W); px(fan, 0, 0, 1920, 1080);
  const fanSvg = overlay(fan);
  for (const m of mids) { const e = midEls[mids.indexOf(m)]; for (const p of m.c) path(fanSvg, `M${e.mx},${MY + 54} L${leafX[p] + pitch / 2},${LY}`, 'grey', { w: 0.6, arrow: false }); }
  const leafEls = leaves.map((p) => pageCell(W, leafX[p] + 0.5, LY, Math.max(1, pitch - 1), 70, { bw: 0.6 }));
  set(fan, 0, { autoAlpha: 0 }); show(fan, T('s16', '三层') + 0.4, { y: 0, d: 0.4 });
  leafEls.forEach((e, i) => show(e, T('s16', '三层') + 0.4 + i * 0.004, { y: 8, d: 0.2 })); sfx('whoosh', T('s16', '三层'), { g: 0.35 });
  // s17：根页 2 有两个分界，1560 和 3081
  kEls.forEach((k, i) => set(k, T('s17', i ? '3081' : '1560'), { backgroundColor: K.wheat }));
  // s18：一个内部页能指向近百个子页，所以树又宽又矮
  const kids = midEls.map((e, i) => tx(W, `${mids[i].c.length} 个子页`, e.mx + 110, MY + 12, { fs: 22, color: K.dim }));
  kids.forEach((e, i) => show(e, T('s18', '近百个') + i * 0.12, { y: 6 }));
  // s19：256 个叶页，全在同一层
  const band = h('div', 'abs', W); px(band, LX0 - 8, LY - 8, LW + 16, 86); css(band, { border: `2.5px solid ${K.teal}` });
  const bandL = tx(W, `${leaves.length} 个叶页，全在第三层`, LX0, LY + 90, { fs: 26 });
  set(band, 0, { autoAlpha: 0 }); wipe(band, T('s19', '同一层') - 0.3, { dir: 'l', d: 0.5 }); show(bandL, T('s19', '256'), { y: 6 });
  // s20：Alice 是 2050 号，在叶页 130
  const a130 = leafEls[leaves.indexOf(130)];
  set(a130, T('s20', '130'), { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2px' });
  const aL = tx(W, '↑ Alice · 2050：叶页 130', leafX[130] - 20, LY + 92, { fs: 26, color: K.teal }); show(aL, T('s20', '130'), { y: 8 }); sfx('pop', T('s20', '130'), { g: 0.4 });
  // s21：整行只放在叶页里；根页上的 1560 只是路标，完整的第 1560 行在叶页 99
  const k0 = rx + slotW + keyW / 2;
  const sign = path(ov, `M${k0},${RY + 60} C${k0},${RY + 220} ${leafX[99] + pitch / 2},${LY - 160} ${leafX[99] + pitch / 2},${LY - 4}`, 'teal', { w: 2, arrow: true, dashed: '8 6' });
  arrowIn(sign, T('s21', '路标') - 0.3, 0.7);
  const signL = tx(W, '1560 只是路标：第 1560 行在叶页 99', 130, 566, { fs: 24, color: K.teal }); show(signL, T('s21', '路标'), { y: 6 });
  // s22–s22b：只在叶页存数据的树，叫 B+ 树
  const gB = gloss(W, 'B+ 树', '整行只放在叶页里，内部页只当路标；SQLite 的每张表都是这样', 1240, 400, 600); show(gB, T('s22', 'B 加树'), { x: 12, y: 0 }); sfx('pop', T('s22', 'B 加树'), { g: 0.4 });
  const cmp = docTable(W, [['', 200], ['表本身', 360]], [['SQLite', '按行号排好的 B+ 树'], ['InnoDB', '按主键排好的 B+ 树'], ['PostgreSQL', '堆：谁先来谁在前']], 1290, 350, { fs: 28 });   // 右上：不压树的连线；白底盖住压暗的文件图
  cmp.t.dataset.name = '三种引擎的表'; css(cmp.t, { background: '#ffffff', padding: '4px 10px' }); set(cmp.t, 0, { autoAlpha: 0 }); set(cmp.t, T('s22b') + 0.25, { autoAlpha: 1 });
  gone(gB, T('s22b') + 0.3, 0.3);
  show(cmp.hr, T('s22b') + 0.3, { y: 6 }); show(cmp.rs[0], T('s22b') + 0.4, { x: -10, y: 0 }); show(cmp.rs[1], T('s23', 'Inno D B'), { x: -10, y: 0 }); show(cmp.rs[2], T('s23b', 'Postgres-QL'), { x: -10, y: 0 });
  sfx('tick', T('s23', 'Inno D B'), { g: 0.35 }); sfx('tick', T('s23b', 'Postgres-QL'), { g: 0.35 });
  // ── x0–s27b：Alice 注册时，姓名索引这棵树里也多了一项；每一项是名字加行号；内部页上的分界本身就是一项（传统 B 树）──
  const tX = T('x0') - 0.3;
  [rootEl, rootL, ...midEls, fan, ...leafEls, ...kids, band, bandL, aL, signL, cmp.t].forEach((e) => gone(e, tX, 0.3)); [...midLines, sign].forEach((e) => gone(e, tX, 0.3));
  G.cells.forEach((c) => goneFrom(c, tX, 0.25));
  const UT = tree(DATA.users, 1020, 780, 'users 表'); UT.enter(tX + 0.2); sfx('whoosh', tX + 0.2, { g: 0.3 });
  const N = tree(DATA.names, 120, 780, '姓名索引');
  N.enter(T('x0', '姓名索引') - 0.2); sfx('whoosh', T('x0', '姓名索引') - 0.2, { g: 0.3 });
  const aIdx = tx(W, 'Alice · 2050', 260, 700, { fs: 28, color: K.teal, css: { background: K.wheat, padding: '2px 12px' } }); show(aIdx, T('x0', '多了一项'), { y: 8 }); gone(aIdx, T('s24') - 0.1, 0.3);
  const ent = docTable(W, [['名字', 330], ['行号', 120]], [['Alice', '2050'], ['User00001-…', '1'], ['User00002-…', '2']], 120, 756, { fs: 24 });
  ent.t.dataset.name = '叶页里的项';
  show(ent.hr, T('s24', '名字') - 0.1, { y: 6 }); ent.rs.forEach((r, i) => show(r, T('s24', '行号') + i * 0.12, { x: -10, y: 0 }));
  ent.rs[0].dataset.beat = 'text'; sfx('pop', T('s25', 'Alice'), { g: 0.4 });
  const sepE = tx(W, '根页的第一个分界：User00306-… · 306，就是一项', N.rx - 40, 334, { fs: 22, color: K.teal });
  show(sepE, T('s26', '分界'), { y: 8 }); set(N.r, T('s26', '分界'), { backgroundColor: K.wheat });
  const gBi = gloss(W, 'B 树', '内部页上的分界本身就是索引里的一项；表用的 B+ 树，整行只在叶页', 620, 756, 600); show(gBi, T('s26b', 'B 树'), { x: 12, y: 0 }); sfx('pop', T('s26b', 'B 树'), { g: 0.4 });
  const sum = tx(W, `<span class="sa">叶页 ${DATA.counts.namesLeaf} 项</span> ＋ <span class="sb">内部页 ${DATA.counts.namesInterior} 项</span> <span class="eq">＝ 4096</span>`, 620, 884, { fs: 26 }); show(sum, T('s26', '不再重复'), { y: 6 });


  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  const zP2 = zone(W, 720, 450, 980, 200), zEnt = zone(W, 100, 736, 500, 200), zTree = zone(W, 350, 466, 1220, 430);
  beats([[T('s0', '这个文件'), barL], [T('s1', '页') + 0.9, pg], [T('s3'), sz], [T('s4', '260'), lgs[0]], [T('s4b', '索引'), ix], [T('s4b', '名字'), lgs[1]], [T('s4b', '年龄'), lgs[2]], [T('s5', '每张表'), reg.hr.children[0]], [T('s5', '从哪一页'), reg.hr.children[1]], [T('s6'), reg.rs[0]], [T('s6', '262'), reg.rs[1]],
    [T('s7', 'Alice'), chip], [T('s7', '哪里'), ask], [T('s7', '空表'), P2], [T('s8', '整数主键'), pk], [T('s8', '拿它'), chip], [T('s8', '行号'), [rid, P2]], [T('s9'), P2], [T('s9', '按行号'), rows], [T('s11'), rows], [T('s11', '第 3 页'), P3], [T('s11', '第 4 页'), P4], [T('s12'), P2], [T('s12', '17'), sep], [T('s13'), P3], [T('s13', '更大'), P4], [T('s14'), gIn], [T('s14', '叶页'), gLf], [T('s15'), [P3, P4]], [T('s15', '最顶上'), P2], [T('s15', '第 2 页'), P2.firstElementChild], [T('s15c'), P2], [T('s15c', '根页'), gRt], [T('s15b', '登记'), regC], [T('s15b', '根页'), P2],
    [T('s16', '4096'), ins], [T('s16', '三层'), rootL], [T('s17'), rootEl], [T('s18'), kids[1]], [T('s19'), bandL], [T('s20'), aL], [T('s21', '路标'), signL], [T('s22'), gB], [T('s22b'), cmp.rs[0]], [T('s23'), cmp.rs[1]], [T('s23b'), cmp.rs[2]], [T('x0'), UT.lab], [T('x0', '姓名索引'), N.lab], [T('x0', '多了一项'), aIdx], [T('s24'), Object.values(N.lEls)], [T('s24', '名字'), ent.hr], [T('s25', 'Alice'), ent.rs[0]], [T('s26'), N.r], [T('s26', '分界'), sepE], [T('s26b', 'B 树'), gBi], [T('s7') + 2.18, [P2, chip, ask], 1], [T('s9') + 3.0, P2, 1], [T('s12') + 0.2, zTree, 1], [T('s8') + 3.05, [pk, P2], 1], [T('s10') + 1.74, P2, 1], [T('s17') + 3.50, [rootEl, ...midEls], 1], [T('s24') + 4.58, ent.t, 1], [T('s25') + 2.72, [ent.rs[0], N.r], 1], [T('s26') + 4.67, [N.r, ...N.mEls, sepE], 1], [T('s26b') + 1.6, [...N.mEls, N.r, sum], 1], [T('s7') + 2.18, zP2, 1], [T('x0') + 3.35, [...N.mEls, N.r], 1], [T('s25') + 2.72, zEnt, 1], [T('s17b') + 0.33, [...midEls, ...kids], 1]], Tend('s26b'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('s3', '1024'), { g: 0.35 });
  sfx('pop', T('s4', '260'), { g: 0.3 });
  sfx('whoosh', T('s4b', '索引'), { g: 0.2 });
  sfx('tick', T('s4b', '年龄'), { g: 0.3 });
  sfx('pop', T('s5'), { g: 0.3 });
  sfx('tick', T('s17', '1560'), { g: 0.35 });
  sfx('tick', T('s17b', '三个'), { g: 0.3 });
  sfx('pop', T('s18', '近百个'), { g: 0.3 });
  sfx('whoosh', T('s19', '同一层') - 0.3, { g: 0.25 });
  // 镜头：文件 → 一张空表长成树 → 连回第 1 页的登记 → 整棵树
  shots(cam, world, s, [
    [s.start, null, { rect: [110, 250, 1840, 780] }],
    [T('s7') - 0.2, null, { rect: [110, 390, 1840, 1010] }],
    [T('s10') - 0.3, null, { rect: [700, 440, 1520, 640], zmax: 1.6, d: 1.3 }],
    [T('s11') - 0.2, null, { rect: [110, 390, 1840, 1010], d: 1.3 }],
    [T('s16') - 0.2, null, { rect: [110, 360, 1850, 960] }],
  ]);
});
