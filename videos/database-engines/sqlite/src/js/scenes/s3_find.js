// 04 怎么找（第 14 稿 r7c：users 表先出场放左边、姓名索引放右边；剩下多少项标在走到的那一页旁边并留着；最后两棵树退场，七步路线图放大摆在中间）：同一个画面里走完 Alice 的查询。
// 事实：I01（读页 1、262、281、263、2、133、130；只取 id 与名字时 4 页；强制扫描 261 页）、I02（再查一次只读文件头偏移 24 的 16 字节）、H04、H05、H06。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, '按名字找 Alice'); show(title, c0 + 0.1, { y: 8 });

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
  const hot = (e, t) => { tl.fromTo(e, { backgroundColor: '#ffffff', borderColor: e.style.borderColor || '#444444', borderWidth: e.style.borderWidth || '2px' }, { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '2.5px', duration: 0.3, immediateRender: true }, t); };

  // ── f1：查询 ──
  const q = codeBlock(W, [`SELECT <span class="qc">id, name, <span class="qa">age</span></span> FROM users WHERE <span class="qw">name = 'Alice'</span>;`], 120, 262, { fs: 26 });
  const qc = q.querySelector('.qc'), qw = q.querySelector('.qw'), qa = q.querySelector('.qa');
  const ans = tx(W, '？ · Alice · ？ 岁', 120, 336, { fs: 28, css: { background: K.wheat, padding: '2px 12px' } }); set(ans, 0, { autoAlpha: 0 }); show(ans, T('f1', '要她的'), { y: 6 }); gone(ans, T('f2') - 0.2, 0.3);   // 要找的那一行：只知道名字   // 「按名字找」「要她的 id、名字和年龄」各点到一段
  wipe(q, T('f1') - 0.1, { dir: 'l', d: 0.5 }); sfx('tick', T('f1'), { g: 0.4 });
  // ── f2：没有索引：把 users 表整个翻一遍 ──
  const U = tree(DATA.users, 120, 780, 'users 表');
  U.enter(c0 + 0.3); sfx('whoosh', c0 + 0.3, { g: 0.3 });
  const N = tree(DATA.names, 1020, 780, '姓名索引');
  N.enter(c0 + 0.5);
  N.all.forEach((e) => dim(e, T('f2') - 0.2, 0.25)); N.all.forEach((e) => dim(e, T('f3') - 0.3, 1, 0.25));
  const tS0 = T('f2', 'users') - 0.1, tS1 = Tend('f2') - 0.2, n = U.leaves.length;
  const scan = h('div', 'abs', W); css(scan, { border: `3px solid ${K.red}`, boxSizing: 'border-box' }); scan.dataset.name = '一页页翻';
  F((t) => { const k = Math.max(0, Math.min(1, (t - tS0) / (tS1 - tS0))); const i = Math.min(n - 1, Math.floor(k * n)); const x = U.lx[U.leaves[i]]; px(scan, x - 3, U.LY - 4, U.pitch + 6, 68); scan.style.opacity = t < tS0 || t > tS1 + 0.5 ? 0 : 1; });
  // 读过的叶页一页页刷成麦色（读到的页全片都是麦色），扫完、换姓名索引那条路时退掉
  const L0 = U.lx[U.leaves[0]], LW = U.lx[U.leaves[n - 1]] + U.pitch - L0, tOff = T('f3') - 0.3;
  const rd = h('div', 'abs', W); px(rd, L0, U.LY, 0, 60); css(rd, { background: K.wheat, opacity: '0.75', pointerEvents: 'none' });
  F((t) => { const k = t < tS0 ? 0 : Math.min(1, (t - tS0) / (tS1 - tS0)), a = t < tS0 ? 0 : t < tOff ? 0.75 : Math.max(0, 0.75 * (1 - (t - tOff) / 0.4)); const w = Math.round(k * LW) + 'px', o = String(+a.toFixed(3)); if (rd.style.width !== w) rd.style.width = w; if (rd.style.opacity !== o) rd.style.opacity = o; });
  const cnt = tx(W, '', 340, 770, { fs: 28, color: K.red });
  F((t) => { const k = Math.max(0, Math.min(1, (t - tS0) / (tS1 - tS0))); cnt.innerHTML = t < tS0 ? '' : `读了 <b>${Math.round(k * DATA.trace.table_scan_distinct_pages)}</b> 页`; });
  sfx('tick', tS0, { g: 0.4 });
  dim(cnt, T('f3') - 0.3, 0.3);

  // ── f3–f7：从根页 262 往下：281（剩 306 项）→ 叶页 263（剩 18 项）→ Alice，2050 ──
  const tR = T('f3') - 0.2;
  hot(N.r, T('f3', '262')); sfx('tick', T('f3', '262'), { g: 0.5 });
  N.r.dataset.beat = 'text'; U.r.dataset.beat = 'text';   // 根页一整条点亮，分界线（灰色小竖条）照样看得见
  const m281 = N.mEls.find((e) => e.p === 281), l263 = N.lEls[263];
  // 路线分两段画：f4「走最左边」到 281，f6「再走最左边」才到叶页 263
  const pth = path(ov, `M${N.rx + 10},${N.RY + 50} L${m281.mx},${N.MY}`, 'teal', { w: 4, arrow: false }), pth2 = path(ov, `M${m281.mx},${N.MY + 44} L${N.lx[263] + N.pitch / 2},${N.LY}`, 'teal', { w: 4, arrow: false });
  arrowIn(pth, T('f4', '最左边') - 0.2, 0.7); arrowIn(pth2, T('f6', '最左边') - 0.1, 0.7);
  hot(m281, T('f5', '281'));
  // 剩下多少项：标在走到的那一页旁边，一路留着（WaterRun 看 r7b：「多少项可以放在节点旁边并保留」）
  const cntL = (html, x, y, right) => { const e = tx(W, html, x, y, { fs: 26, mono: true, color: K.teal }); if (right) { e.style.left = 'auto'; e.style.right = (1920 - x) + 'px'; } set(e, 0, { autoAlpha: 0 }); return e; };
  const n4096 = cntL('4096 项', N.rx + N.rw + 12, N.RY + 40), n306 = cntL('306 项', m281.offsetLeft - 12, N.MY + 8, true), n18 = cntL('18 项', N.lx[263] - 12, N.LY + 16, true);
  show(n4096, T('f3', '262') + 0.2, { y: 6 }); show(n306, T('f5', '306') - 0.1, { x: 10, y: 0 }); show(n18, T('f6', '18') - 0.1, { x: 10, y: 0 });
  hot(l263, T('f6', '263'));
  // 范围一步步缩小：走到 281，其余的页退到背景（剩 306 项）；走到 263，281 下面别的叶页也退下（剩 18 项）
  const keep1 = new Set(N.mids.find((m) => m.p === 281).c);
  // 「只剩 306 项」：281 以外的叶页从右往左一页页淡下去
  const outL = N.leaves.filter((p) => !keep1.has(p)), tO5 = T('f5', '306') - 0.2;
  N.leaves.forEach((p) => { if (!keep1.has(p)) dim(N.lEls[p], tO5 + 1.8 * (1 - outL.indexOf(p) / outL.length), 0.2, 1, 0.4); else if (p !== 263) dim(N.lEls[p], T('f6', '263') - 0.1, 0.2, 1, 0.45); });   // 到了叶页 263，旁边那些叶页就不走了：此刻压淡
  N.mEls.forEach((e) => { if (e !== m281) dim(e, T('f5', '281'), 0.2); });
  sfx('tick', T('f5', '281'), { g: 0.4 }); sfx('tick', T('f6', '263'), { g: 0.4 });
  Object.values(N.lEls).forEach((e) => { e.dataset.beat = 'line'; });   // 「再走最左边」：281 下面的叶页一起描框，到 263 时只剩它
  const hit = tx(W, 'Alice · 行号 <b>2050</b>', 1020, 770, { fs: 40, color: K.teal, css: { background: K.wheat, padding: '2px 12px' } });
  set(hit, 0, { autoAlpha: 0 }); slam(hit, T('f7'), { from: 1.3 }); sfx('pop', T('f7', '2050'), { g: 0.5 });
  // ── f8–f11：拿着行号回到 users 表：根页 2 → 133 → 叶页 130 ──
  const hb = box(hit, world), hy = Math.round(hb.y + hb.h / 2), gx = 915;
  const ux = Math.round(U.rx + U.rw / 2), uy = U.RY - 26;
  const hop = path(ov, `M${Math.round(hb.x - 8)},${hy} L${gx},${hy} L${gx},${uy} L${ux},${uy} L${ux},${U.RY - 4}`, 'teal', { w: 2.5, arrow: true, dashed: '8 6' });
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
  const row = tx(W, '<span>2050</span> · <span>Alice</span> · <span>42 岁</span>', 120, 770, { fs: 40, css: { background: K.wheat, padding: '2px 12px' } });
  set(row, 0, { autoAlpha: 0 }); slam(row, T('f11'), { from: 1.3 }); sfx('chime', T('f11', '42'), { g: 0.5 });

  const sepU = tx(W, '1560 < 2050 < 3081', U.rx - 300, U.RY + 8, { fs: 26, mono: true, color: K.teal }); show(sepU, T('f9', '2050'), { y: 6 });
  const u4096 = cntL('4096 项', U.rx + U.rw + 12, U.RY + 40), u1521 = cntL('1521 项', m133.offsetLeft + m133.offsetWidth + 12, U.MY + 8), u17 = cntL('17 项', U.lx[130] - 30, U.LY + 64);
  show(u4096, T('f9', '根页 2') + 0.1, { y: 6 }); show(u1521, T('f10', '133') + 0.1, { x: -10, y: 0 }); show(u17, T('f10', '130') + 0.1, { y: 6 });
  // ── f12–f13b：这次查询从文件读了 7 页：铁路图 ──
  const tRR = T('f12') - 0.2;
  // 「开头说的 7 页」：两棵树和路上的标注都退场，七步路线图放大摆在中间（WaterRun 看 r7b：「七步指示位置优化」）
  [hop, hit, row, sepU, n4096, n306, n18, u4096, u1521, u17, pth, pth2, pt2, ...U.all, ...N.all].forEach((e) => gone(e, tRR, 0.4));
  const y = 580, read = DATA.trace.index_then_table, caps = ['登记', '根', '中层', '叶', '根', '中层', '叶'];
  const st = h('div', 'abs', W); px(st, 110, y - 8, 16, 16); css(st, { border: `2px solid ${K.ink}`, borderRadius: '50%', background: '#fff' });
  let x = 170; const boxes = [], segs = [];
  read.forEach((p, i) => {
    if (i === 1 || i === 4) x += 50;
    const b = rrBox(W, String(p), x, y - 28, { w: 130, mono: true, fs: 30 }); boxes.push(b);
    const c = tx(W, caps[i], x + 65, y + 40, { fs: 24, color: '#333333', center: true });
    segs.push(line(ov, [[x - (i === 1 || i === 4 ? 90 : 40), y], [x, y]]));
    b.cap = c; x += 160;
  });
  segs.push(line(ov, [[x - 40, y], [x + 10, y]], { arrow: false }));
  // 两组铺上页的归属色：姓名索引的三页浅蓝、users 表的三页浅绿；第 1 页（登记）灰——和第 02 章页图里同色
  const g1 = h('div', 'abs', W); px(g1, boxes[1].offsetLeft - 20, y - 56, 3 * 160 + 10, 140); css(g1, { border: `2px solid ${K.group}`, background: OWN.n });
  const g2 = h('div', 'abs', W); px(g2, boxes[4].offsetLeft - 20, y - 56, 3 * 160 + 10, 140); css(g2, { border: `2px solid ${K.group}`, background: OWN.u });
  W.insertBefore(g1, boxes[0]); W.insertBefore(g2, boxes[0]);
  const g0 = h('div', 'abs', W); px(g0, boxes[0].offsetLeft - 16, y - 46, 162, 120); css(g0, { background: OWN.s }); W.insertBefore(g0, boxes[0]); set(g0, 0, { autoAlpha: 0 }); show(g0, T('f12b', '登记') - 0.1, { y: 0, d: 0.4 });
  const g1L = tx(g1, '姓名索引', 0, 150, { fs: 26, color: K.dim }), g2L = tx(g2, 'users 表', 0, 150, { fs: 26, color: K.dim });
  set(st, 0, { autoAlpha: 0 }); show(st, tRR, { y: 0 });
  // 7 页从树上各自的位置飞进路线图（第 1 页从查询那里来）；落下后连线接上
  const srcEl = [q, N.r, m281, l263, U.r, m133, U.lEls[130]];
  boxes.forEach((b, i) => { const sb = box(srcEl[i], world), tb = box(b, world); set(b, 0, { autoAlpha: 0 }); tl.fromTo(b, { autoAlpha: 0, x: sb.x + sb.w / 2 - (tb.x + tb.w / 2), y: sb.y + sb.h / 2 - (tb.y + tb.h / 2), scale: 0.6 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, tRR + 0.1 + i * 0.12); show(b.cap, T('f12', '7') + 0.4 + i * 0.08, { y: 6, d: 0.3 }); arrowIn(segs[i], T('f12', '7') + 0.3 + i * 0.08, 0.2); });
  sfx('whoosh', tRR + 0.1, { g: 0.35 });
  arrowIn(segs[7], T('f12', '7') + 0.4, 0.2); [g1, g2].forEach((g, i) => show(g, T('f12b', i ? '表' : '索引'), { y: 0 })); sfx('tick', T('f12', '7'), { g: 0.5 });
  const seven = tx(W, '读了 7 页', x + 40, y - 24, { fs: 36, color: K.teal }); show(seven, T('f12', '7'), { x: -10, y: 0 });

  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  // 焦点框：查询里先指条件、再指要的列；路线上指根页、计数、叶页 263、分界、第 133 页、年龄；最后 7 页按「登记、索引三页、表三页」分组指
  focus(W, [[T('f1', '按名字'), qw], [T('f1', '要她的'), qc, Tend('f1')], [T('f3', '262'), N.r], [T('f4', '最左边'), m281, Tend('f4')], [T('f6', '263'), l263, Tend('f6')],
    [T('f8', '年龄'), qa, T('f8', '行号')], [T('f9', '分界'), sepU, Tend('f9')], [T('f10', '133'), m133], [T('f10', '130'), U.lEls[130], Tend('f10')], [T('f11', '42'), row.children[2], Tend('f11')],
    [T('f12', '7'), boxes, Tend('f12')], [T('f12b', '登记'), boxes[0]], [T('f12b', '索引'), boxes.slice(1, 4)], [T('f12b', '表三页'), boxes.slice(4, 7)]], Tend('f12b'));
  // 补音效（check.js 报的长空档）
  keyed(title).at(T('f2') - 0.2, { html: '没有索引：把整个表翻一遍' });
  keyed(title).at(T('f3') - 0.2, { html: '从姓名索引的根页 262 往下走' });
  keyed(title).at(T('f8') - 0.2, { html: '拿着行号 2050，回到 users 表' });
  keyed(title).at(T('f12') - 0.2, { html: '开头说的 7 页' });
  // 镜头：两棵树与底下的铁路图都在内容区里
  shots(cam, world, s, [[s.start, null, { rect: [110, 250, 1840, 900] }], [T('f6', '最左边') - 0.2, null, { rect: [110, 330, 1840, 980], d: 1.2 }], [T('f8') - 0.2, null, { rect: [110, 250, 1840, 900], d: 1.2 }]]);   // 沿路线往下走到叶页时镜头跟着下移，回 users 表时移回
});
