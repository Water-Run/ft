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
  keyed(nvL).at(T('u4', '放不放得下') + 0.3, { html: '新版本 · 放得下吗？' });
  hide(gapAl, T('u4', '放不放得下') - 0.35, { d: 0.15 }); show(gapAl, T('u6', '别的页') + 0.5, { y: 0 });
  tl.fromTo(gapA, { boxShadow: 'inset 0 0 0 0px #b8442f' }, { boxShadow: 'inset 0 0 0 4px #b8442f', duration: 0.3, immediateRender: false }, T('u5', '72')); keyed(la).at(T('u5', '72'), { html: `<b>第 ${oP} 页</b>　88 行 · 空隙 <b style="color:var(--warn)">${U.freeBefore} 字节</b>` }); sfx('tick', T('u5', '72'));
  keyed(nvL).at(T('u5b', '92'), { html: '要 92 字节 &gt; 72' }); set(nvL, T('u5b', '92'), { backgroundColor: '#b8442f' }); sfx('error', T('u5b', '92') + 0.1, { g: 0.5 });
  to(nv.e, T('u5b', '92') + 0.2, { y: -310, duration: 0.3, ease: 'power2.out' });
  // 92 字节怎么来的：新版本一行 88 字节（82 字节补齐到 88），再加一个 4 字节的指针；空隙只有 72
  // 按旁白一段段出来：「新版本」→ 88 字节那段，「指针」→ 接上 4 字节，「92」→ 下面摆出 72 字节的空隙对比
  const bd = h('div', 'abs', A); px(bd, 72, 742, 860, 116); bd.dataset.name = '92 字节的来历';
  const bdCell = (x, y, w, html, st) => { const c = h('div', 'abs', bd, html); px(c, x, y, w, 50); css(c, { font: '700 24px var(--sans)', lineHeight: '50px', textAlign: 'center', whiteSpace: 'nowrap', ...st }); return c; };
  const bdRow = bdCell(0, 0, 616, '新版本一行：88 字节', { background: 'var(--pg)', color: '#fff' });
  const bdPtr = bdCell(620, 0, 120, '指针 4', { background: 'var(--navy)', color: '#fff' });
  const bdGap = bdCell(0, 62, 504, '第 23 页的空隙：72 字节', { border: '3px dashed var(--warn)', color: 'var(--warn)', lineHeight: '44px' });
  const bdSum = bdCell(750, 0, 110, '= 92', { color: 'var(--warn)', textAlign: 'left', fontSize: '28px' });
  wipe(bdRow, T('u5b', '新版本') - 0.1, { dir: 'l', d: 0.45 }); wipe(bdPtr, T('u5b', '指针') - 0.1, { dir: 'l', d: 0.3 });
  show(bdSum, T('u5b', '92') - 0.1, { x: -10 }); wipe(bdGap, T('u5b', '92') + 0.25, { dir: 'l', d: 0.4 }); sfx('tick', T('u5b', '指针'), { p: 0.3 });
  gone(bd, T('u7') - 0.2, 0.3); tl.fromTo(gapA, { boxShadow: 'inset 0 0 0 4px #b8442f' }, { boxShadow: 'inset 0 0 0 0px #b8442f', duration: 0.3, immediateRender: false }, T('u7') - 0.2);
  // 只好写到别的页：第 46 页第 49 项
  to(nv.e, T('u6', '别的页'), { x: 936, y: -34, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', T('u6', '别的页'), { g: 0.4 });
  hide(nvL, T('u6', '别的页'), { d: 0.25 });
  keyed(nv.ctid).at(T('u6b', '49'), { html: `t_ctid (${nP},${nL})` });
  const nvl = tagEl(A, `第 ${nP} 页第 ${nL} 项`, 1028, 646); css(nvl, { fontSize: '24px' }); show(nvl, T('u6b', '49'), { y: -8 }); sfx('tick', T('u6b', '49'), { p: 0.4 });
  // 旧版本：数据不动，行头里改两处
  const keep = tagEl(A, '数据不动', 92 + 560, 678, 'ok'); css(keep, { fontSize: '24px' }); show(keep, T('u7', '不动'), { y: -8 });
  to(old.data, T('u7', '不动'), { boxShadow: 'inset 0 0 0 4px #2f6b26', duration: 0.3 });
  [old.xmax, old.ctid].forEach((c, i) => to(c, T('u7b', '两处') + i * 0.15, { backgroundColor: '#336791', duration: 0.2 }));
  // 不写更新实验的事务号：第七章讲的是并发实验的 4856，两处数字不同会让人疑惑
  keyed(old.xmax).at(T('u8', '事务号'), { html: 'xmax <b>本次事务</b>' }); set(old.xmax, T('u8', '事务号'), { backgroundColor: '#b8442f' }); sfx('tick', T('u8', '事务号'));
  keyed(old.ctid).at(T('u9', '新版本'), { html: `t_ctid (${nP},${nL})` }); sfx('tick', T('u9', '新版本'));
  const ov = overlay(A); const ar = curve(ov, [92 + 328 + 105, 620], [1028 + 255, 586], 'navy', { bend: 500 }); arrowIn(ar, T('u9', '新版本') - 0.2, 0.6);
  keyed(nv.xmin).at(T('u10', 'xmin'), { html: 'xmin <b>本次事务</b>' }); set(nv.xmin, T('u10', 'xmin'), { backgroundColor: '#b8442f' }); sfx('tick', T('u10', 'xmin'));
  // 视线框：跟着旁白指到正在讲的那一处
  const rA = focusRing(A);
  rA.at(T('u4', '原来那一页'), pgA).at(T('u5', '72'), gapA).at(T('u5b', '新版本'), [72, 742, 616, 50]).at(T('u5b', '指针'), [692, 742, 120, 50]).at(T('u5b', '92') + 0.25, [72, 742, 860, 112]).at(T('u6b', '49'), [1028, 586, 820, 52])
    .at(T('u7', '数据'), [92 + 542, 620, 278, 52]).at(T('u7b', '两处'), [92 + 174, 620, 364, 52]).at(T('u8', 'xmax'), [92 + 174, 620, 150, 52])
    .at(T('u9', 't_ctid'), [92 + 328, 620, 210, 52]).at(T('u10', 'xmin'), [1028, 586, 170, 52]).off(T('u11') - 0.1);
  // 同一个 Alice，两个版本
  const two = tagEl(A, '同一个 Alice，两个版本', 760, 760); css(two, { fontSize: '30px' }); slam(two, T('u11', '两个版本'), { from: 1.15 }); sfx('thud', T('u11', '两个版本'), { g: 0.6 });
  [oldL, keep].forEach((e) => hide(e, T('u11') - 0.1, { d: 0.2 }));
  // 两个版本，两段可见范围（第三章的画法）：旧版本到这个事务号止，新版本从它起，首尾相接
  const RX = 72, RM = 420, RE = 730, RY2 = 806;
  const rb = (x0, x1, html, bg, fg) => { const b = h('div', 'abs', A, html); px(b, x0, RY2, x1 - x0, 42); css(b, { background: bg, color: fg, font: '700 22px "Sans SC"', lineHeight: '42px', padding: '0 12px', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' }); return b; };
  const rOld = rb(RX, RM, `旧版本：${D.alice.xmin} → 本次事务`, 'var(--sky-lt)', 'var(--navy)'), rNew = rb(RM, RE, '新版本：本次事务 →', 'linear-gradient(90deg,var(--pg) 70%,rgba(51,103,145,.15))', '#fff');
  const rTk = h('div', 'abs', A); px(rTk, RM - 2, RY2 - 12, 4, 66); css(rTk, { background: 'var(--warn)' });
  const rLb = capt(A, '可见范围', RX, RY2 - 36); css(rLb, { fontSize: '22px', color: 'var(--ink2)' });
  [rOld, rNew, rTk, rLb].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  // 旁白 u10b：旧版本的范围到这个事务为止，新版本从这里开始（长度用 width 动画，条里的字不被压扁）
  tl.fromTo(rOld, { autoAlpha: 1, width: 0 }, { width: RM - RX, duration: 0.5, immediateRender: false }, T('u10b', '旧版本') - 0.2);
  tl.fromTo(rNew, { autoAlpha: 1, width: 0 }, { width: RE - RM, duration: 0.5, immediateRender: false }, T('u10b', '新版本') - 0.2);
  show(rTk, T('u10b', '为止') - 0.2, { y: 0, d: 0.2 }); show(rLb, T('u10b') - 0.3, { y: 6 });

  // ── B：三个索引各加一项；对照 InnoDB ──
  hdoc(B, '三个索引，各插一项', 72, 128);
  // 上：三棵树的叶子，各有一项指着旧版本；下：堆里的两个版本（接着 A 屏）。先看旧项都指向旧地址，再从新版本那里取地址、每个叶子插一项
  const LY = 236, HY = 500;
  const leafRow = (x, name, ent) => {
    const box = h('div', 'page', B); px(box, x, LY, 520, 170); box.dataset.name = name + '的叶子';
    const l = capt(B, `<b>${name}</b>　叶子 ${ent[0][0]}`, x, LY - 42);
    const keyOf = { 主键树: '2050', 姓名树: 'Alice', 年龄树: '42 / 43' }[name];
    const e1 = h('div', 'tup', box, `第 ${ent[0][1]} 项　${name === '年龄树' ? '42' : keyOf} → ${ent[0][2]}`); px(e1, 14, 24, 490);
    const e2 = h('div', 'tup new', box, `第 ${ent[1][1]} 项　${name === '年龄树' ? '43' : keyOf} → ${ent[1][2]}`); px(e2, 14, 96, 490);
    return { box, l, e1, e2, x };
  };
  const ix = U.index;
  const rs = [leafRow(72, '主键树', ix.users_pkey), leafRow(700, '姓名树', ix.idx_name), leafRow(1328, '年龄树', ix.idx_age)];
  const heapCard = (x, html, cls, name) => { const c = h('div', 'page', B); px(c, x, HY, 560, 64); c.dataset.name = name; const r = h('div', 'tup ' + cls, c, html); px(r, 10, 9, 534); return c; };
  const hOld = heapCard(330, `第 ${oP} 页 第 ${oL} 项　2050 Alice 42`, '', '旧版本'), hNew = heapCard(1030, `第 ${nP} 页 第 ${nL} 项　2050 Alice 43`, 'new', '新版本');
  const hl = capt(B, '堆里的两个版本', 72, HY + 16); css(hl, { fontSize: '24px', color: 'var(--mute)' });
  wipe(hOld, tB + 0.2, { dir: 'l', d: 0.4 }); wipe(hNew, tB + 0.35, { dir: 'l', d: 0.4 }); show(hl, tB + 0.4);
  rs.forEach((r, i) => { wipe(r.box, T('u12') + i * 0.1, { dir: 'l' }); show(r.l, T('u12') + i * 0.1); show(r.e1, T('u12', '项') + i * 0.1, { y: 8 }); });
  // 旧项 → 旧地址；新项 → 新地址（箭头从叶子底边出发，落在版本行的上沿）
  const ovB = overlay(B);
  const oldAr = rs.map((r, i) => curve(ovB, [r.x + 150, LY + 170], [490 + i * 120, HY], 'navy'));
  const newAr = rs.map((r, i) => curve(ovB, [r.x + 370, LY + 170], [1190 + i * 120, HY], 'accent'));
  oldAr.forEach((a, i) => arrowIn(a, T('u12', '旧地址') + i * 0.12, 0.4)); sfx('tick', T('u12', '旧地址'), { p: -0.3 });
  oldAr.forEach((a) => tl.fromTo(a, { opacity: 1 }, { opacity: 0.3, duration: 0.3, immediateRender: false }, T('u13', '新地址') - 0.2));
  rs.forEach((r, i) => {
    const tt = T('u13', '新地址') + i * 0.18;
    fly(B, `(${nP},${nL})`, [1250, HY - 52], [r.x + 330, LY + 100], tt - 0.65, { cls: 'navy', fs: 24, d: 0.55, sink: true });
    slide(r.e2, tt, { y: 30 }); arrowIn(newAr[i], tt + 0.1, 0.35); sfx('pop', tt, { g: 0.5, p: -0.5 + i * 0.5 });
  });
  const same = noteBox(B, '名字、编号都没变，可旧项指着旧地址：每个索引都得再插一项', 72, 594, 1200); show(same, T('u14b'), { y: 10 });
  // InnoDB
  const IBY = 700;
  const ib = h('div', 'abs', B); px(ib, 72, IBY, 1776, 230); ib.dataset.name = 'InnoDB 的做法';
  const it = capt(ib, 'InnoDB', 0, 0); css(it, { fontSize: '30px', color: 'var(--mute)', fontWeight: 700 });
  const irow = h('div', 'tup grey', ib, '主键树的叶子：2050  Alice  42'); px(irow, 0, 52, 760); keyed(irow).at(T('u16', '原位改'), { html: '主键树的叶子：2050  Alice  <b>43</b>（原位改）' });
  const iundo = h('div', 'tup grey', ib, 'undo：旧值 42'); px(iundo, 0, 112, 360); css(iundo, { background: '#f1f3f5' });
  const iname = h('div', 'tup grey', ib, '姓名索引：Alice → 主键 2050（不用动）'); px(iname, 860, 52, 700);
  show(it, T('u16') - 0.2); show(irow, T('u16') - 0.1, { y: 8 }); slide(iundo, T('u16', 'undo'), { y: 20 }); sfx('pop', T('u16', 'undo'), { g: 0.5, p: -0.4 });
  // 旧值 42 从叶子里那一行掉进 undo；姓名索引按主键指回那一行
  fly(B, '42', [392, IBY + 50], [72 + 150, IBY + 110], T('u16', 'undo') - 0.55, { cls: 'grey', fs: 22, d: 0.45, sink: true });
  to(irow, T('u16', '原位改'), { backgroundColor: '#d5dade', duration: 0.25 });
  const iar = link(ovB, [[72 + 856, IBY + 72], [72 + 766, IBY + 72]], 'grey'); arrowIn(iar, T('u17', '主键') + 0.3, 0.3);
  show(iname, T('u17', '主键'), { x: 20 }); sfx('tick', T('u17b', '不用动'), { p: 0.3 });
  const ok = tagEl(ib, '主键没变，姓名索引就不用动', 860, 120, 'grey'); show(ok, T('u17b', '不用动'), { y: 8 });
  const rB = focusRing(B);
  rB.at(T('u12', '项') + 0.2, [72, LY, 1776, 170]).at(T('u12', '旧地址') + 0.2, hOld).at(T('u13', '新地址') - 0.6, hNew).at(T('u13', '新地址') + 0.7, [72, LY + 90, 1776, 60])
    .at(T('u14b', '名字'), [700 + 14, LY + 96, 494, 46]).at(T('u14b', '编号'), [72 + 14, LY + 96, 494, 46]).at(T('u14b', '也一样'), [72, LY + 90, 1776, 60])
    .at(T('u16', '原位改'), [72, IBY + 52, 760, 40]).at(T('u16', 'undo'), [72, IBY + 112, 360, 40]).at(T('u17', '姓名索引'), [72 + 860, IBY + 52, 700, 40]).off(tC - 0.4);

  // ── C：HOT ──
  hdoc(C, 'HOT：新版本留在本页，索引一项都不加', 72, 128);
  const hotG = glossBox(C, 'HOT', '<b>HOT</b>（Heap-Only Tuple）：只在堆里的新版本，<br>不给索引加项', 1180, 196, 660);
  show(hotG, T('u18', 'HOT') + 0.1, { x: 20 }); sfx('pop', T('u18', 'HOT') + 0.1, { g: 0.5 });
  const goal = tagEl(C, '目标：索引一项都不加', 1180, 306, 'ok'); css(goal, { fontSize: '28px' }); show(goal, T('u18', '少动索引'), { y: 10 }); hide(goal, T('u21') - 0.3, { d: 0.25 });
  const cond1 = noteBox(C, '<b>条件一</b>　改的列上没有索引', 72, 200, 520); const cond2 = noteBox(C, '<b>条件二</b>　新版本放得进原来那一页', 620, 200, 520);
  show(cond1, T('u19', '一是'), { y: 10 }); show(cond2, T('u20', '二是'), { y: 10 }); sfx('tick', T('u19', '一是')); sfx('tick', T('u20', '二是'));
  // 每个条件下面记两张表的结果：users_hot 两条都满足（u23），Alice 的 users 两条都不满足（u26）
  const mk = (txt, x, cls) => { const e = tagEl(C, txt, x, 278, cls); css(e, { fontSize: '24px' }); return e; };
  const ok1 = mk('✓ users_hot', 72, 'ok'), ok2 = mk('✓ users_hot', 620, 'ok');
  const x1 = mk('✗ users：年龄有索引', 270, 'warn'), x2 = mk(`✗ users：第 ${oP} 页满了`, 818, 'warn');
  show(ok1, T('u23', '年龄不建索引'), { y: 8 }); show(ok2, T('u23', '90'), { y: 8 }); sfx('tick', T('u23', '90'), { p: 0.3 });
  slam(x1, T('u26', '年龄有索引'), { from: 1.2 }); slam(x2, T('u26', '满了'), { from: 1.2 }); sfx('error', T('u26', '年龄有索引'), { g: 0.5 }); sfx('error', T('u26', '满了'), { g: 0.5 });
  // 页内：旧项 → 新项；索引只指旧项。页一开始就在：旧版本、留着的空位、指向旧版本的索引
  const [hP, hL] = H.old, [, hN] = H.new;
  const PY = 372;
  const pgH = h('div', 'page', C); px(pgH, 520, PY, 900, 170); pgH.dataset.name = `users_hot 第 ${hP} 页`;
  const pl = capt(C, `一页里：旧版本，和留着的空位`, 520, PY - 38);
  keyed(pl).at(T('u23', '换一张'), { html: `users_hot：每页留一成空位、年龄不建索引 · 第 ${hP} 页` });
  const hold = h('div', 'tup', pgH, `第 ${hL} 项　2050  Alice  42`); px(hold, 20, 24, 400);
  const hgap = h('div', 'abs', pgH, '留着的空位'); px(hgap, 460, 92, 420, 56); css(hgap, { background: 'repeating-linear-gradient(135deg,#fff 0 7px,#dbe8f3 7px 14px)', border: '2px dashed var(--pg)', font: '700 22px "Sans SC"', color: 'var(--pg)', lineHeight: '52px', textAlign: 'center' }); hgap.dataset.name = '空位';
  const hnew = h('div', 'tup new', pgH, `第 ${hN} 项　2050  Alice  43`); px(hnew, 470, 100, 400);
  const ovH = overlay(C);
  const hidx = h('div', 'node', C, `索引：Alice → (${hP},${hL})`); px(hidx, 72, PY + 20, 400);
  const ia = link(ovH, [[472, PY + 44], [540, PY + 44]], 'accent');
  const ja = curve(ovH, [900, PY + 64], [990, PY + 100], 'navy', { bend: PY + 90 });
  const t0 = T('u18') + 0.3;
  wipe(pgH, t0, { dir: 'l' }); show(pl, t0 + 0.1); show(hold, t0 + 0.3, { y: 8 }); show(hgap, t0 + 0.45, { y: 0 });
  show(hidx, t0 + 0.6, { x: -20 }); arrowIn(ia, t0 + 0.8, 0.3);
  slide(hnew, T('u21', '本页'), { x: 30 }); gone(hgap, T('u21', '本页') + 0.1, 0.3); sfx('pop', T('u21', '本页')); arrowIn(ja, T('u21', '指向它'), 0.4);
  const zero = tagEl(C, '索引：0 项新增', 72, PY + 86, 'ok'); show(zero, T('u21b', '不加'), { y: 8 }); sfx('tick', T('u21b', '不加'));
  to(hidx, T('u21b', '不加'), { boxShadow: '0 0 0 4px #2f6b26', duration: 0.3 });
  const jump = capt(C, '查询先到第 ' + hL + ' 项，再在页内跳到第 ' + hN + ' 项', 520, PY + 180); show(jump, T('u22', '跳过去'), { y: 8 });
  fly(C, '查询', [330, PY - 6], [560, PY - 14], T('u22') + 0.1, { cls: 'warn', fs: 24, d: 0.5, hold: 0.3 });
  fly(C, '查询', [560, PY - 14], [1010, PY + 66], T('u22', '跳过去') - 0.3, { cls: 'warn', fs: 24, d: 0.5, hold: 0.4 });
  // 两次更新写的日志
  // 两张表各改一次年龄：索引加了几项（U2、U6）。不列日志记录：日志第九章才讲
  const TY = 640;
  const cmpRow = (y, name, res, cls) => { const r = h('div', 'abs', C); px(r, 72, y, 1300, 56); const n = h('div', 'abs', r, name); px(n, 0, 0, 520, 56); css(n, { background: '#fff', border: '2px solid var(--line)', font: '600 26px "Sans SC"', lineHeight: '52px', paddingLeft: '18px', color: 'var(--ink)' }); const v = tagEl(r, res, 540, 8, cls); css(v, { fontSize: '26px' }); return r; };
  const t1 = cmpRow(TY, 'users（年龄有索引、页装满）', '三个索引各加一项', 'warn'), t2 = cmpRow(TY + 72, 'users_hot（年龄不建索引、留一成）', 'HOT：索引一项都没加', 'ok');
  set(t1, 0, { autoAlpha: 0 }); set(t2, 0, { autoAlpha: 0 });
  show(t1, T('u24') - 0.1, { x: -10 }); show(t2, T('u24', 'HOT') - 0.2, { x: -10 }); sfx('blip', T('u24', 'HOT'), { g: 0.5 });
  // 旁白顺序（2026-10-31 调）：条件 → Alice 两条都不满足 → 表默认装满、可以改小 → 换一张留一成的表验证
  // 填充比例接上第四章：左边是主键树那页叶子（留一成，同样的黄色斜纹），右边是表的页（默认装满）；改小以后，表的页也留出一成
  const FY2 = 690;
  const lfL = capt(C, '索引的叶子：填充比例 90（第 4 章）', 72, FY2 - 44); css(lfL, { fontSize: '24px', color: 'var(--navy)', fontWeight: 700 });
  const lf = h('div', 'page', C); px(lf, 72, FY2, 380, 76); lf.dataset.name = '主键树的叶子';
  const lff = h('div', 'abs', lf); px(lff, 4, 4, 372 * 0.9 - 4, 62); css(lff, { background: 'var(--sky-lt)' });
  const lfr = h('div', 'abs', lf); px(lfr, 372 * 0.9, 4, 372 * 0.1, 62); css(lfr, { background: 'repeating-linear-gradient(135deg,#ffd36b 0 6px,#fff 6px 12px)' });
  const tpL = capt(C, '表的页：填充比例默认 100', 540, FY2 - 44); css(tpL, { fontSize: '24px', color: 'var(--navy)', fontWeight: 700 });
  const tp = h('div', 'page', C); px(tp, 540, FY2, 860, 76); tp.dataset.name = '表的页';
  const tpf = h('div', 'abs', tp); px(tpf, 4, 4, 0, 62); css(tpf, { background: 'var(--sky-lt)' });
  const tpr = h('div', 'abs', tp); px(tpr, 852 * 0.9, 4, 852 * 0.1, 62); css(tpr, { background: 'repeating-linear-gradient(135deg,#ffd36b 0 6px,#fff 6px 12px)' });
  const tprL = capt(C, '留给更新', 1420, FY2 + 20); css(tprL, { fontSize: '26px', color: '#7d5500', fontWeight: 700 });
  const ffN = capt(C, '<b>填充比例</b>（fillfactor）：表默认 100，把页装满；改成 90，每页留出一成给更新', 72, FY2 + 100); css(ffN, { fontSize: '24px' });
  const tLf = T('u27', '表也有') - 0.4, tTb = T('u27', '100'), tSm = T('u28', '改小');
  show(lfL, tLf - 0.1, { y: 8 }); wipe(lf, tLf, { dir: 'l', d: 0.35 }); set(lfr, 0, { autoAlpha: 0 }); show(lfr, tLf + 0.4, { y: 0, d: 0.3 }); sfx('tick', tLf + 0.4, { g: 0.5 });
  show(tpL, tTb - 0.1, { y: 8 }); wipe(tp, tTb, { dir: 'l', d: 0.3 }); tl.fromTo(tpf, { width: 0 }, { width: 844, duration: 0.7, immediateRender: false }, T('u27b', '装满') - 0.4);
  set(tpr, 0, { autoAlpha: 0 }); tl.fromTo(tpf, { width: 844 }, { width: 852 * 0.9 - 4, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tSm - 0.3);
  show(tpr, tSm, { y: 0, d: 0.3 }); show(tprL, tSm + 0.1, { x: -8 }); show(ffN, tSm + 0.3, { y: 8 });
  keyed(tpL).at(tSm, { html: '表的页：填充比例改成 90' }); sfx('pop', tSm, { g: 0.5 });
  [lfL, lf, tpL, tp, tprL, ffN].forEach((e) => gone(e, T('u24') - 0.35, 0.3));
  const rC = focusRing(C);
  rC.at(T('u19', '一是'), cond1).at(T('u20', '二是'), cond2).at(T('u20', '原来那一页'), [980, PY + 92, 420, 56]).at(T('u21', '本页') + 0.4, [990, PY + 100, 400, 40]).at(T('u21b'), hidx)
    .at(T('u25') - 0.2, [72, 200, 1068, 120]).at(T('u26', '年龄有索引'), x1).at(T('u26', '满了'), x2).at(tLf, lf).at(tTb, tp)
    .at(T('u23', '换一张'), [520, PY - 40, 900, 210]).at(T('u24', 'HOT'), t2).at(T('u24', '一项都没加'), t2).off(s.end - 0.5);
  gone(jump, T('u24') - 0.35, 0.25);
});
