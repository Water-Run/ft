// 06 改：新版本放不进第 23 页，写到第 46 页；旧版本记 xmax、t_ctid（U1、U11）→ 三个索引各加一项；对照 InnoDB（U2、U9）→ HOT（U6–U8、U10）
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('u11') + 0.5, tC = Tend('u17b') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);
  const U = D.update.users, H = D.update.users_hot;
  const [oP, oL] = U.old, [nP, nL] = U.new;

  // ── A：新版本从旧版本复制出来，先试第 23 页、放不下，写到第 46 页；旧版本行头里改两处 ──
  hdoc(A, 'Alice 42 → 43', 72, 128);
  const tu = term(A, 72, 196, 1100, 2, { name: 'psql 会话' });
  tu.type(T('u1') + 0.2, '<span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;', 'postgres=#', 40);
  // 两页
  const pgA = h('div', 'page', A); px(pgA, 72, 420, 860, 300); pgA.dataset.name = `第 ${oP} 页`;
  const pgB = h('div', 'page', A); px(pgB, 988, 420, 860, 300); pgB.dataset.name = `第 ${nP} 页`;
  const la = capt(A, `<b>第 ${oP} 页</b>　88 行 · 空隙 ${U.freeBefore} 字节`, 72, 384), lb = capt(A, `<b>第 ${nP} 页</b>　${D.heap.rows[nP]} 行 · 还有空`, 988, 384);
  [la, lb].forEach((e) => css(e, { fontSize: '26px' }));
  const gapA = h('div', 'abs', pgA); px(gapA, 6, 6, 842, 44); css(gapA, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)', border: '2px dashed var(--grey)' }); gapA.dataset.name = '空隙';
  const gapAl = h('div', 'abs', gapA, `空隙 ${U.freeBefore} 字节`); px(gapAl, 600, 4); css(gapAl, { font: '700 26px "Sans SC"', color: 'var(--ink2)' });
  for (let i = 0; i < 2; i++) { const r = h('div', 'tup', pgA, '…'); px(r, 20, 70 + i * 46, 820); }
  for (let i = 0; i < 2; i++) { const r = h('div', 'tup', pgB, '…'); px(r, 20, 70 + i * 46, 820); }
  wipe(pgA, T('u1') + 0.3, { dir: 'l' }); show(la, T('u1') + 0.4); wipe(pgB, T('u1') + 0.5, { dir: 'r' }); show(lb, T('u1') + 0.6);
  // 一行版本 = 行头三格 + 数据
  const ver = (x, y, v, cls = '') => {
    const e = h('div', 'abs', A); px(e, x, y, 820, 52); e.dataset.name = '行版本';
    const cell = (cx, w, html, head) => { const c = h('div', 'abs', e, html); px(c, cx, 0, w, 52); css(c, { background: head ? 'var(--navy)' : (cls === 'new' ? 'var(--pg)' : 'var(--sky-lt)'), color: head || cls === 'new' ? '#fff' : 'var(--navy)', font: `600 ${head ? 22 : 26}px var(--mono)`, lineHeight: '52px', textAlign: 'center', whiteSpace: 'nowrap' }); return c; };
    return { e, xmin: cell(0, 170, v.xmin, true), xmax: cell(174, 150, v.xmax, true), ctid: cell(328, 210, v.ctid, true), data: cell(542, 278, v.data) };
  };
  const old = ver(92, 620, { xmin: `xmin ${D.alice.xmin}`, xmax: 'xmax 0', ctid: `t_ctid (${oP},${oL})`, data: '2050 Alice 42' });
  show(old.e, T('u2') - 0.2, { y: 10 });
  const oldL = tagEl(A, '旧版本', 92, 678, 'grey'); css(oldL, { fontSize: '24px' }); show(oldL, T('u2', '不覆盖'), { y: -8 });
  // 新版本：从旧版本复制出来，年龄改成 43
  const nv = ver(92, 620, { xmin: 'xmin —', xmax: 'xmax 0', ctid: 't_ctid —', data: '2050 Alice 42' }, 'new');
  set(nv.e, 0, { autoAlpha: 0 }); set(nv.e, T('u3', '新版本') - 0.1, { autoAlpha: 1 });
  to(nv.e, T('u3', '新版本'), { y: -304, duration: 0.7, ease: 'power3.out' }); sfx('whoosh', T('u3', '新版本'), { g: 0.35 });
  keyed(nv.data).at(T('u3', '43'), { html: '2050 Alice <b>43</b>' }); sfx('tick', T('u3', '43'));
  const nvL = tagEl(A, '新版本 · 连同指针要 92 字节', 940, 322); css(nvL, { fontSize: '24px' }); show(nvL, T('u3', '新版本') + 0.5, { x: -10 });
  // 先试原来那一页：空隙只有 72 字节，放不下
  to(nv.e, T('u4', '放不放得下') - 0.3, { y: -194, duration: 0.5, ease: 'power2.inOut' });
  hide(gapAl, T('u4', '放不放得下') - 0.35, { d: 0.15 }); show(gapAl, T('u6', '别的页') + 0.5, { y: 0 });
  to(gapA, T('u5', '72'), { boxShadow: 'inset 0 0 0 4px #b8442f', duration: 0.3 }); keyed(la).at(T('u5', '72'), { html: `<b>第 ${oP} 页</b>　88 行 · 空隙 <b style="color:var(--warn)">${U.freeBefore} 字节</b>` }); sfx('tick', T('u5', '72'));
  keyed(nvL).at(T('u5b', '92'), { html: '要 92 字节 &gt; 72' }); set(nvL, T('u5b', '92'), { backgroundColor: '#b8442f' }); sfx('error', T('u5b', '92') + 0.1, { g: 0.5 });
  to(nv.e, T('u5b', '92') + 0.2, { y: -310, duration: 0.3, ease: 'power2.out' });
  // 只好写到别的页：第 46 页第 49 项
  to(nv.e, T('u6', '别的页'), { x: 936, y: -34, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', T('u6', '别的页'), { g: 0.4 });
  hide(nvL, T('u6', '别的页'), { d: 0.25 });
  keyed(nv.ctid).at(T('u6b', '49'), { html: `t_ctid (${nP},${nL})` });
  const nvl = tagEl(A, `第 ${nP} 页第 ${nL} 项`, 1028, 646); css(nvl, { fontSize: '24px' }); show(nvl, T('u6b', '49'), { y: -8 }); sfx('tick', T('u6b', '49'), { p: 0.4 });
  // 旧版本：数据不动，行头里改两处
  const keep = tagEl(A, '数据不动', 92 + 560, 678, 'ok'); css(keep, { fontSize: '24px' }); show(keep, T('u7', '不动'), { y: -8 });
  to(old.data, T('u7', '不动'), { boxShadow: 'inset 0 0 0 4px #2f6b26', duration: 0.3 });
  [old.xmax, old.ctid].forEach((c, i) => to(c, T('u7b', '两处') + i * 0.15, { backgroundColor: '#336791', duration: 0.2 }));
  keyed(old.xmax).at(T('u8', '事务号'), { html: `xmax <b>${U.xid}</b>` }); set(old.xmax, T('u8', '事务号'), { backgroundColor: '#b8442f' }); sfx('tick', T('u8', '事务号'));
  keyed(old.ctid).at(T('u9', '新版本'), { html: `t_ctid (${nP},${nL})` }); sfx('tick', T('u9', '新版本'));
  const ov = overlay(A); const ar = curve(ov, [92 + 328 + 105, 620], [1028 + 255, 586], 'navy', { bend: 500 }); arrowIn(ar, T('u9', '新版本') - 0.2, 0.6);
  keyed(nv.xmin).at(T('u10', 'xmin'), { html: `xmin <b>${U.xid}</b>` }); set(nv.xmin, T('u10', 'xmin'), { backgroundColor: '#b8442f' }); sfx('tick', T('u10', 'xmin'));
  // 同一个 Alice，两个版本
  const two = tagEl(A, '同一个 Alice，两个版本', 760, 760); css(two, { fontSize: '30px' }); slam(two, T('u11', '两个版本'), { from: 1.15 }); sfx('thud', T('u11', '两个版本'), { g: 0.6 });
  [oldL, keep].forEach((e) => hide(e, T('u11') - 0.1, { d: 0.2 }));

  // ── B：三个索引各加一项；对照 InnoDB ──
  hdoc(B, '三个索引，各插一项', 72, 128);
  const leafRow = (x, y, name, ent) => {
    const box = h('div', 'page', B); px(box, x, y, 520, 220); box.dataset.name = name + '的叶子';
    const l = capt(B, `<b>${name}</b>　叶子 ${ent[0][0]}`, x, y - 42);
    const keyOf = { 主键树: '2050', 姓名树: 'Alice', 年龄树: '42 / 43' }[name];
    const e1 = h('div', 'tup', box, `第 ${ent[0][1]} 项　${name === '年龄树' ? '42' : keyOf} → ${ent[0][2]}`); px(e1, 14, 40, 490);
    const e2 = h('div', 'tup new', box, `第 ${ent[1][1]} 项　${name === '年龄树' ? '43' : keyOf} → ${ent[1][2]}`); px(e2, 14, 120, 490);
    return { box, l, e1, e2 };
  };
  const ix = U.index;
  const rs = [leafRow(72, 260, '主键树', ix.users_pkey), leafRow(700, 260, '姓名树', ix.idx_name), leafRow(1328, 260, '年龄树', ix.idx_age)];
  rs.forEach((r, i) => { wipe(r.box, T('u12') + i * 0.1, { dir: 'l' }); show(r.l, T('u12') + i * 0.1); show(r.e1, T('u12', '旧地址') + i * 0.08, { y: 8 }); });
  rs.forEach((r, i) => { fly(B, `(${nP},${nL})`, [900, 190], [72 + i * 628 + 300, 260 + 120], T('u13', '新地址') - 0.6 + i * 0.15, { cls: 'navy', fs: 24, d: 0.55 }); slide(r.e2, T('u13', '新地址') + i * 0.15, { y: 30 }); sfx('pop', T('u13', '新地址') + i * 0.15, { g: 0.5, p: -0.5 + i * 0.5 }); });
  const src = tagEl(B, `新版本在 (${nP},${nL})`, 760, 180, 'navy'); css(src, { fontSize: '24px' }); show(src, T('u13') - 0.2, { y: -8 }); hide(src, T('u14b'), { d: 0.25 });
  const same = noteBox(B, '名字、编号都没变，可旧项指着旧地址：每个索引都得再插一项', 72, 530, 1200); show(same, T('u14b'), { y: 10 });
  // InnoDB
  const ib = h('div', 'abs', B); px(ib, 72, 640, 1776, 280); ib.dataset.name = 'InnoDB 的做法';
  const it = capt(ib, 'InnoDB', 0, 0); css(it, { fontSize: '30px', color: 'var(--mute)', fontWeight: 700 });
  const irow = h('div', 'tup grey', ib, '主键树的叶子：2050  Alice  42'); px(irow, 0, 52, 760); keyed(irow).at(T('u16', '原位改'), { html: '主键树的叶子：2050  Alice  <b>43</b>（原位改）' });
  const iundo = h('div', 'tup grey', ib, 'undo：旧值 42'); px(iundo, 0, 112, 360); css(iundo, { background: '#f1f3f5' });
  const iname = h('div', 'tup grey', ib, '姓名索引：Alice → 主键 2050（不用动）'); px(iname, 860, 52, 700);
  show(it, T('u16') - 0.2); show(irow, T('u16') - 0.1, { y: 8 }); slide(iundo, T('u16', 'undo'), { y: 20 }); sfx('pop', T('u16', 'undo'), { g: 0.5, p: -0.4 });
  show(iname, T('u17', '主键'), { x: 20 }); sfx('tick', T('u17b', '不用动'), { p: 0.3 });
  const ok = tagEl(ib, '主键没变，姓名索引就不用动', 860, 120, 'grey'); show(ok, T('u17b', '不用动'), { y: 8 });

  // ── C：HOT ──
  hdoc(C, 'HOT：新版本留在本页，索引一项都不加', 72, 128);
  const hotG = glossBox(C, 'HOT', '<b>HOT</b>（Heap-Only Tuple）：只在堆里的新版本，<br>不给索引加项', 1180, 196, 660);
  show(hotG, T('u18', 'HOT') + 0.1, { x: 20 }); sfx('pop', T('u18', 'HOT') + 0.1, { g: 0.5 });
  const cond1 = noteBox(C, '<b>条件一</b>　改的列上没有索引', 72, 200, 520); const cond2 = noteBox(C, '<b>条件二</b>　新版本放得进原来那一页', 620, 200, 520);
  show(cond1, T('u19', '一是'), { y: 10 }); show(cond2, T('u20', '二是'), { y: 10 }); sfx('tick', T('u19', '一是')); sfx('tick', T('u20', '二是'));
  // 页内：旧项 → 新项；索引只指旧项
  const [hP, hL] = H.old, [, hN] = H.new;
  const pgH = h('div', 'page', C); px(pgH, 520, 330, 900, 220); pgH.dataset.name = `users_hot 第 ${hP} 页`;
  const pl = capt(C, `留一成空位、年龄不建索引的表 · 第 ${hP} 页`, 520, 290);
  const hold = h('div', 'tup', pgH, `第 ${hL} 项　2050  Alice  42`); px(hold, 20, 40, 400);
  const hnew = h('div', 'tup new', pgH, `第 ${hN} 项　2050  Alice  43`); px(hnew, 470, 130, 400);
  const ovH = overlay(C);
  const hidx = h('div', 'node', C, `索引：Alice → (${hP},${hL})`); px(hidx, 72, 400, 400);
  const ia = link(ovH, [[472, 420], [540, 390]], 'accent');
  const ja = curve(ovH, [940, 390], [990, 460], 'navy', { bend: 380 });
  wipe(pgH, T('u21') - 0.2, { dir: 'l' }); show(pl, T('u21') - 0.1); show(hold, T('u21'), { y: 8 });
  slide(hnew, T('u21', '本页'), { x: 30 }); sfx('pop', T('u21', '本页')); arrowIn(ja, T('u21', '指向它'), 0.4);
  show(hidx, T('u21b'), { x: -20 }); arrowIn(ia, T('u21b') + 0.2, 0.3);
  const zero = tagEl(C, '索引：0 项新增', 72, 470, 'ok'); show(zero, T('u21b', '不加'), { y: 8 }); sfx('tick', T('u21b', '不加'));
  const jump = capt(C, '查询先到第 ' + hL + ' 项，再在页内跳到第 ' + hN + ' 项', 520, 560); show(jump, T('u22', '跳过去'), { y: 8 });
  fly(C, '查询', [330, 360], [560, 344], T('u22') + 0.1, { cls: 'warn', fs: 24, d: 0.5, hold: 0.3 });
  fly(C, '查询', [560, 344], [1010, 434], T('u22', '跳过去') - 0.3, { cls: 'warn', fs: 24, d: 0.5, hold: 0.4 });
  // 两次更新写的日志
  const walRows = (arr) => arr.map((w) => [w[0], w[1]]);
  const t1 = tableDoc(C, ['users（年龄有索引）', ''], walRows(U.wal), 72, 606, { mono: [0, 1] });
  const t2 = tableDoc(C, ['users_hot', ''], walRows(H.wal), 760, 606, { mono: [0, 1] });
  css(t1, { fontSize: '23px' }); css(t2, { fontSize: '23px' });
  set(t1, 0, { autoAlpha: 0 }); set(t1, T('u23') + 0.2, { autoAlpha: 1 }); set(t2, 0, { autoAlpha: 0 }); set(t2, T('u24', 'HOT') - 0.4, { autoAlpha: 1 });
  [...t1.querySelectorAll('tr')].forEach((r, i) => show(r, T('u23') + 0.2 + i * 0.3, { x: -10, y: 0, d: 0.3 }));
  [...t2.querySelectorAll('tr')].forEach((r, i) => show(r, T('u24', 'HOT') - 0.4 + i * 0.3, { x: -10, y: 0, d: 0.3 })); sfx('blip', T('u24', 'HOT'), { g: 0.5 });
  const tlab = capt(C, '各写了哪些日志记录', 72, 566); show(tlab, T('u23'));
  // Alice 这次：两条都不满足
  const x1 = tagEl(C, '✗ 年龄有索引', 1220, 660, 'warn'), x2 = tagEl(C, `✗ 第 ${oP} 页满了`, 1220, 720, 'warn');
  slam(x1, T('u26', '年龄有索引'), { from: 1.2 }); slam(x2, T('u26', '满了'), { from: 1.2 }); sfx('error', T('u26', '年龄有索引'), { g: 0.5 }); sfx('error', T('u26', '满了'), { g: 0.5 });
  const ff = noteBox(C, '<b>填充比例</b>　表默认 100（装满）；改小后，每页留出的空间给更新用', 1180, 780, 660); show(ff, T('u27'), { y: 10 });
  const ffb = h('div', 'page', C); px(ffb, 1180, 884, 660, 56); ffb.dataset.name = '留一成空位的页';
  const ffa = h('div', 'abs', ffb); px(ffa, 4, 4, 0, 42); css(ffa, { background: 'var(--sky-lt)' });
  const ffr = h('div', 'abs', ffb, '留给更新'); px(ffr, 590, 4, 62, 42); css(ffr, { background: 'repeating-linear-gradient(135deg,#fff 0 6px,#dbe8f3 6px 12px)', font: '700 22px "Sans SC"', color: 'var(--navy)', lineHeight: '42px', whiteSpace: 'nowrap', overflow: 'visible', textAlign: 'right' });
  wipe(ffb, T('u28') - 0.2, { dir: 'l', d: 0.3 }); to(ffa, T('u28'), { width: 584, duration: 0.8 }); show(ffr, T('u28', '改小'), { y: 0 });
});
