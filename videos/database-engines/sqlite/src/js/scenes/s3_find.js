// 03 怎么找：右边 users 表树、左边姓名索引树，同一个画面里走完 Alice 的查询；底部是读页的语法铁路图。
// 事实：I01（读页 1、262、281、263、2、133、130；只取 id 与名字时 4 页；强制扫描 261 页）、I02（再查一次只读文件头偏移 24 的 16 字节）、H04、H05、H06。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, '怎么找'); show(title, c0 + 0.1, { y: 8 });

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
    const lab = tx(W, label, x0, LY + 72, { fs: 26 });
    const all = [r, rl, ...mEls, fan, ...Object.values(lEls), lab];
    return { r, rl, mEls, fan, lEls, lab, lx, pitch, rx, rw, RY, MY, LY, all, mids, leaves,
      enter(t) { wipe(r, t, { dir: 't', d: 0.4 }); show(rl, t + 0.1, { x: -8, y: 0 }); mEls.forEach((e, i) => show(e, t + 0.2 + i * 0.02, { y: -8, d: 0.25 })); set(fan, 0, { autoAlpha: 0 }); show(fan, t + 0.3, { y: 0, d: 0.4 }); Object.values(lEls).forEach((e, i) => show(e, t + 0.35 + i * 0.003, { y: 8, d: 0.2 })); show(lab, t + 0.5, { y: 6 }); } };
  }
  const hot = (e, t) => set(e, t, { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2.5px' });

  // ── f1：查询 ──
  const q = codeBlock(W, [`SELECT <span class="qc">id, name, age</span> FROM users WHERE <span class="qw">name = 'Alice'</span>;`], 120, 262, { fs: 26 });
  const qc = q.querySelector('.qc'), qw = q.querySelector('.qw');
  const ans = tx(W, '？ · Alice · ？ 岁', 120, 336, { fs: 28, css: { background: K.wheat, padding: '2px 12px' } }); set(ans, 0, { autoAlpha: 0 }); show(ans, T('f1', '要她的'), { y: 6 }); gone(ans, T('f2') - 0.2, 0.3);   // 要找的那一行：只知道名字   // 「按名字找」「要她的 id、名字和年龄」各点到一段
  wipe(q, T('f1') - 0.1, { dir: 'l', d: 0.5 }); sfx('tick', T('f1'), { g: 0.4 });
  // ── f2：没有索引：把 users 表整个翻一遍 ──
  const U = tree(DATA.users, 1020, 780, 'users 表');
  U.enter(T('f2') - 0.2); sfx('whoosh', T('f2') - 0.2, { g: 0.3 });
  const tS0 = T('f2', '翻一遍'), tS1 = Tend('f2') - 0.2, n = U.leaves.length;
  const scan = h('div', 'abs', W); css(scan, { border: `3px solid ${K.red}`, boxSizing: 'border-box' }); scan.dataset.name = '一页页翻';
  F((t) => { const k = Math.max(0, Math.min(1, (t - tS0) / (tS1 - tS0))); const i = Math.min(n - 1, Math.floor(k * n)); const x = U.lx[U.leaves[i]]; px(scan, x - 3, U.LY - 4, U.pitch + 6, 68); scan.style.opacity = t < tS0 || t > tS1 + 0.5 ? 0 : 1; });
  const cnt = tx(W, '', 1020, 740, { fs: 28, color: K.red });
  F((t) => { const k = Math.max(0, Math.min(1, (t - tS0) / (tS1 - tS0))); cnt.innerHTML = t < tS0 ? '' : `读了 <b>${Math.round(k * DATA.trace.table_scan_distinct_pages)}</b> 页`; });
  sfx('tick', tS0, { g: 0.4 });
  const tIx = T('f2b') - 0.2;
  dim(cnt, tIx, 0.3);

  // ── f2b–s27：名字上另有一棵树：姓名索引；每一项是名字加行号；内部页上的分界本身就是一项（传统 B 树） ──
  const N = tree(DATA.names, 120, 780, '姓名索引');
  N.enter(tIx + 0.1); sfx('whoosh', tIx + 0.1, { g: 0.3 });
  const ent = docTable(W, [['名字', 330], ['行号', 120]], [['Alice', '2050'], ['User00001-…', '1'], ['User00002-…', '2']], 120, 730, { fs: 24 });
  ent.t.dataset.name = '叶页里的项';
  show(ent.hr, T('s24', '名字') - 0.1, { y: 6 }); ent.rs.forEach((r, i) => show(r, T('s24', '行号') + i * 0.12, { x: -10, y: 0 }));
  ent.rs[0].dataset.beat = 'text'; sfx('pop', T('s25', 'Alice'), { g: 0.4 });
  const sepE = tx(W, '根页的第一个分界：User00306-… · 306，就是一项', N.rx - 40, 334, { fs: 22, color: K.teal });
  show(sepE, T('s26', '分界'), { y: 8 }); set(N.r, T('s26', '分界'), { backgroundColor: K.wheat });
  const gB = gloss(W, 'B 树', '内部页上的分界本身就是索引里的一项；表用的 B+ 树，整行只在叶页', 620, 730, 600); show(gB, T('s26b', 'B 树'), { x: 12, y: 0 }); sfx('pop', T('s26b', 'B 树'), { g: 0.4 });
  const sum = tx(W, `叶页 ${DATA.counts.namesLeaf} 项 ＋ 内部页 ${DATA.counts.namesInterior} 项 <span class="eq">＝ 4096</span>`, 620, 860, { fs: 26 }); show(sum, T('s27', '3869'), { y: 6 });

  // ── f3–f7：从根页 262 往下：281（剩 306 项）→ 叶页 263（剩 18 项）→ Alice，2050 ──
  const tR = T('f3') - 0.2;
  [ent.t, gB, sum, sepE].forEach((e) => gone(e, tR, 0.3));
  set(N.r, tR, { backgroundColor: '#ffffff' });
  hot(N.r, T('f3', '262')); sfx('tick', T('f3', '262'), { g: 0.5 });
  N.r.dataset.beat = 'text'; U.r.dataset.beat = 'text';   // 根页一整条点亮，分界线（灰色小竖条）照样看得见
  const m281 = N.mEls.find((e) => e.p === 281), l263 = N.lEls[263];
  const pth = path(ov, `M${N.rx + 10},${N.RY + 50} L${m281.mx},${N.MY} M${m281.mx},${N.MY + 44} L${N.lx[263] + N.pitch / 2},${N.LY}`, 'teal', { w: 4, arrow: false });
  arrowIn(pth, T('f4', '最左边') - 0.2, 0.9);
  hot(m281, T('f5', '281')); const rg = tx(W, '4096 项', 120, 326, { fs: 30, mono: true });
  show(rg, T('f3', '262') + 0.2, { y: 6 }); keyed(rg).at(T('f5', '306'), { html: '→ 306 项' }).at(T('f6', '18'), { html: '→ 18 项' });
  hot(l263, T('f6', '263'));
  // 范围一步步缩小：走到 281，其余的页退到背景（剩 306 项）；走到 263，281 下面别的叶页也退下（剩 18 项）
  const keep1 = new Set(N.mids.find((m) => m.p === 281).c);
  N.leaves.forEach((p) => { if (!keep1.has(p)) dim(N.lEls[p], T('f5', '281'), 0.2); else if (p !== 263) dim(N.lEls[p], T('f6', '18'), 0.2); });
  N.mEls.forEach((e) => { if (e !== m281) dim(e, T('f5', '281'), 0.2); });
  sfx('tick', T('f5', '281'), { g: 0.4 }); sfx('tick', T('f6', '263'), { g: 0.4 });
  Object.values(N.lEls).forEach((e) => { e.dataset.beat = 'line'; });   // 「再走最左边」：281 下面的叶页一起描框，到 263 时只剩它
  const hit = tx(W, 'Alice · 行号 <b>2050</b>', 120, 740, { fs: 30, color: K.teal, css: { background: K.wheat, padding: '2px 12px' } });
  set(hit, 0, { autoAlpha: 0 }); slam(hit, T('f7'), { from: 1.3 }); sfx('pop', T('f7', '2050'), { g: 0.5 });
  // ── f8–f11：拿着行号回到 users 表：根页 2 → 133 → 叶页 130 ──
  const hop = path(ov, `M380,760 C 700,860 1300,860 ${U.rx + 20},${U.RY + 50}`, 'teal', { w: 2.5, arrow: true, dashed: '8 6' });
  arrowIn(hop, T('f8', '行号') - 0.1, 0.8); sfx('whoosh', T('f8', '行号'), { g: 0.3 });
  goneFrom(cnt, T('f8') - 0.1, 0.3);   // 已压到 30%：从 30% 收起
  hot(U.r, T('f9', '根页 2')); const m133 = U.mEls.find((e) => e.p === 133);
  const pt2 = path(ov, `M${U.rx + U.rw * 0.5},${U.RY + 50} L${m133.mx},${U.MY} M${m133.mx},${U.MY + 44} L${U.lx[130] + U.pitch / 2},${U.LY}`, 'teal', { w: 4, arrow: false });
  arrowIn(pt2, T('f9', '中间') - 0.2, 0.9); hot(m133, T('f10', '133')); hot(U.lEls[130], T('f10', '130'));
  sfx('tick', T('f9', '根页 2'), { g: 0.4 }); sfx('tick', T('f10', '133'), { g: 0.4 }); sfx('tick', T('f10', '130'), { g: 0.4 });
  const keep2 = new Set(U.mids.find((m) => m.p === 133).c);   // 走中间：另外两棵子树退下；到了 133，别的叶页也退下
  U.leaves.forEach((p) => { if (!keep2.has(p)) dim(U.lEls[p], T('f9', '中间'), 0.2); else if (p !== 130) dim(U.lEls[p], T('f10', '130'), 0.2); });
  U.mEls.forEach((e) => { if (e !== m133) dim(e, T('f9', '中间'), 0.2); });
  keep2.forEach((p) => { U.lEls[p].dataset.beat = 'line'; });
  const row = tx(W, '<span>2050</span> · <span>Alice</span> · <span>42 岁</span>', 1020, 740, { fs: 30, css: { background: K.wheat, padding: '2px 12px' } });
  set(row, 0, { autoAlpha: 0 }); slam(row, T('f11'), { from: 1.3 }); sfx('chime', T('f11', '42'), { g: 0.5 });

  // ── f12–f13b：这次查询从文件读了 7 页：铁路图 ──
  const tRR = T('f12') - 0.2;
  [rg, hop].forEach((e) => gone(e, tRR, 0.3));
  const y = 800, read = DATA.trace.index_then_table, caps = ['登记', '根', '中层', '叶', '根', '中层', '叶'];
  const st = h('div', 'abs', W); px(st, 110, y - 8, 16, 16); css(st, { border: `2px solid ${K.ink}`, borderRadius: '50%', background: '#fff' });
  let x = 170; const boxes = [], segs = [];
  read.forEach((p, i) => {
    if (i === 1 || i === 4) x += 50;
    const b = rrBox(W, String(p), x, y - 24, { w: 120, mono: true, fs: 26 }); boxes.push(b);
    const c = tx(W, caps[i], x + 60, y + 34, { fs: 20, color: K.dim, center: true });
    segs.push(line(ov, [[x - (i === 1 || i === 4 ? 90 : 40), y], [x, y]]));
    b.cap = c; x += 160;
  });
  segs.push(line(ov, [[x - 40, y], [x + 10, y]], { arrow: false }));
  const g1 = h('div', 'abs', W); px(g1, boxes[1].offsetLeft - 20, y - 50, 3 * 160 + 0, 120); css(g1, { border: `2px solid ${K.group}` });
  const g2 = h('div', 'abs', W); px(g2, boxes[4].offsetLeft - 20, y - 50, 3 * 160 + 0, 120); css(g2, { border: `2px solid ${K.group}` });
  const g1L = tx(g1, '姓名索引', 3 * 160 - 12, 6, { fs: 20, color: '#888', css: { fontStyle: 'italic', transform: 'translateX(-100%)' } });
  const g2L = tx(g2, 'users 表', 3 * 160 - 12, 6, { fs: 20, color: '#888', css: { fontStyle: 'italic', transform: 'translateX(-100%)' } });
  set(st, 0, { autoAlpha: 0 }); show(st, tRR, { y: 0 });
  boxes.forEach((b, i) => { show(b, T('f12', '7') - 0.3 + i * 0.1, { x: -10, y: 0, d: 0.3 }); show(b.cap, T('f12', '7') - 0.2 + i * 0.1, { y: 6, d: 0.3 }); arrowIn(segs[i], T('f12', '7') - 0.35 + i * 0.1, 0.2); });
  arrowIn(segs[7], T('f12', '7') + 0.4, 0.2); [g1, g2].forEach((g, i) => show(g, T('f12b', i ? '表' : '索引'), { y: 0 })); sfx('tick', T('f12', '7'), { g: 0.5 });
  const seven = tx(W, '读了 7 页', x + 40, y - 20, { fs: 32, color: K.teal }); show(seven, T('f12', '7'), { x: -10, y: 0 });
  // f13–f13b：只要 id 和名字：索引里都有，不用再去 users 表：只读 4 页
  const tCov = T('f13b', 'users') - 0.2;
  [boxes[4], boxes[5], boxes[6], boxes[4].cap, boxes[5].cap, boxes[6].cap, g2, segs[5], segs[6]].forEach((e) => dim(e, tCov, 0.15));
  keyed(seven).at(T('f13b', '4'), { html: '只读 4 页' });
  const q2 = codeBlock(W, ["SELECT id, name FROM users WHERE name = 'Alice';"], 120, 262, { fs: 26 });
  set(q2, 0, { autoAlpha: 0 }); gone(q, T('f13') - 0.1, 0.2); show(q2, T('f13') - 0.05, { y: 0, d: 0.3 });
  // f14–f15：紧接着再查一次：只读文件头里的 16 个字节，确认文件没被改过，就用内存里的页
  const tAg = T('f14') - 0.2;
  const hd = h('div', 'abs', W); px(hd, 1060, 262, 740, 46); css(hd, { display: 'flex', border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); hd.dataset.name = '文件头';
  for (let i = 0; i < 100; i += 4) { const c = h('div', '', hd); css(c, { width: '29.6px', borderLeft: i ? '1px solid #bbb' : 'none', background: i >= 24 && i < 40 ? K.wheat : '#fff' }); }
  const hdL = tx(W, '再查一次：文件读 0 页，只读文件头偏移 24 处的 16 个字节', 1060, 316, { fs: 22 });
  set(hd, 0, { autoAlpha: 0 }); wipe(hd, tAg + 0.1, { dir: 'l', d: 0.4 }); show(hdL, T('f14', '16'), { y: 6 }); sfx('tick', T('f14', '16'), { g: 0.4 });
  const memL = btn(W, '没被改过：直接用内存里的页', 1060, 360, 24); set(memL, 0, { autoAlpha: 0 }); slam(memL, T('f15', '内存'), { from: 1.2 });

  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('f1', '按名字'), qw], [T('f1', '要她的'), qc], [T('f1', '名字和年龄'), ans], [T('f2'), U.lab], [T('f2', '翻一遍') + 1.2, q], [T('f2b', '一棵树'), N.r], [T('f2b', '姓名索引'), N.lab], [T('s24'), Object.values(N.lEls)], [T('s24', '名字'), ent.hr], [T('s24', '行号'), ent.rs], [T('s25'), ent.rs[0]], [T('s25', '2050'), ent.rs[0].children[1]], [T('s26'), N.r], [T('s26', '分界'), sepE], [T('s26b'), gB], [T('s27', '3869'), sum], [T('s27', '内部页'), N.r], [T('s27b'), sum], [T('s27b', '4096'), sum.querySelector('.eq')],
    [T('f3'), N.lab], [T('f4'), N.r], [T('f4', '最左边'), m281], [T('f5'), rg], [T('f5', '4096'), N.r], [T('f5', '306'), [...keep1].map((p) => N.lEls[p])], [T('f6'), rg], [T('f6', '最左边'), [...keep1].map((p) => N.lEls[p])], [T('f6', '263'), l263], [T('f6', '18') + 0.4, rg], [T('f7', 'Alice'), hit], [T('f7', '2050'), hit.querySelector('b')], [T('f8'), hit], [T('f8', '回到'), U.lab], [T('f9'), U.rl], [T('f9', '2050'), U.r], [T('f10'), m133], [T('f10', '分界'), [...keep2].map((p) => U.lEls[p])], [T('f11', '这一行'), row], [T('f11', '42'), row.children[2]],
    [T('f12'), seven], [T('f12b'), q], [T('f13'), q2], [T('f13b', '4'), seven], [T('f14'), hdL], [T('f15'), memL]], Tend('f15'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('f13', '只要'), { g: 0.3 });
  sfx('pop', T('f13b', '4'), { g: 0.35 });
  sfx('tick', T('f14') - 0.1, { g: 0.3 });
  stay(cam, s, c0, 1);
});
