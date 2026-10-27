// 06 改：新版本放不进第 23 页，写到第 46 页；旧版本记 xmax、t_ctid（U1、U11）→ 三个索引各加一项；对照 InnoDB（U2、U9）→ HOT（U6–U8、U10）
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('u11') + 0.5, tC = Tend('u17b') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);
  const U = D.update.users, H = D.update.users_hot;
  const [oP, oL] = U.old, [nP, nL] = U.new;

  // ── A：新版本写到哪里 ──
  hdoc(A, 'Alice 42 → 43', 72, 128);
  const q = psqlBox(A, `<span class="p">postgres=#</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;`, 72, 196, 1000);
  css(q, { fontSize: '23px' }); appear(q, T('u1') + 0.2); sfx('blip', T('u1') + 0.3, { g: 0.5 });
  const pgA = h('div', 'page', A); px(pgA, 120, 320, 720, 340); pgA.dataset.name = `第 ${oP} 页`;
  const pgB = h('div', 'page', A); px(pgB, 1080, 320, 720, 340); pgB.dataset.name = `第 ${nP} 页`;
  const la = capt(A, `<b>第 ${oP} 页</b>　88 行 · 空隙 ${U.freeBefore} 字节`, 120, 276);
  const lb = capt(A, `<b>第 ${nP} 页</b>　${D.heap.rows[nP]} 行 · 还有空`, 1080, 276);
  const gapA = h('div', 'abs', pgA); px(gapA, 6, 6, 702, 30); css(gapA, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)', border: '2px dashed var(--grey)' });
  const gapAl = h('div', 'abs', gapA, `空隙 ${U.freeBefore} 字节`); px(gapAl, 520, 0); css(gapAl, { font: '700 22px "Sans SC"', color: 'var(--ink2)', lineHeight: '26px' });
  for (let i = 0; i < 6; i++) { const r = h('div', 'tup', pgA, i === 4 ? '' : '…'); px(r, 20, 60 + i * 46, 680); if (i === 4) css(r, { opacity: 0 }); }
  const oldv = h('div', 'tup', pgA, `第 ${oL} 项　2050  Alice  42`); px(oldv, 20, 60 + 4 * 46, 680);
  for (let i = 0; i < 3; i++) { const r = h('div', 'tup', pgB, '…'); px(r, 20, 60 + i * 46, 680); }
  const freeB = h('div', 'abs', pgB); px(freeB, 20, 200, 680, 120); css(freeB, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)' });
  wipe(pgA, T('u2') - 0.3, { dir: 'l' }); show(la, T('u2') - 0.2); wipe(pgB, T('u2'), { dir: 'r' }); show(lb, T('u2') + 0.1);
  // 新版本：先试第 23 页，放不下，去第 46 页
  const nv = h('div', 'tup new', A, '2050  Alice  43'); px(nv, 880, 220, 300);
  slam(nv, T('u3', '新版本'), { from: 1.15 }); sfx('pop', T('u3', '新版本'));
  to(nv, T('u4'), { x: -600, y: 106, duration: 0.7, ease: 'power3.inOut' }); sfx('whoosh', T('u4'), { g: 0.35 });
  const need = tagEl(A, '要 92 字节 > 72', 560, 380, 'warn'); show(need, T('u5b', '92'), { y: -8 }); sfx('error', T('u5b', '92') + 0.1, { g: 0.5 });
  to(nv, T('u6', '别的页'), { x: 220, y: 300, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', T('u6', '别的页'), { g: 0.4 });
  hide(need, T('u6', '别的页'), { d: 0.25 });
  const nvl = tagEl(A, `第 ${nP} 页第 ${nL} 项`, 1420, 560); show(nvl, T('u6b', '49'), { y: -8 }); sfx('tick', T('u6b', '49'), { p: 0.4 });
  // 两个版本的行头
  const tb = tableDoc(A, ['', 'xmin', 'xmax', 't_ctid'], [['旧版本', String(D.alice.xmin), '<span id="ux1">0</span>', `<span id="uc1">(${oP},${oL})</span>`], ['新版本', '<span id="un1">—</span>', '0', `(${nP},${nL})`]], 120, 710, { mono: [1, 2, 3] });
  wipe(tb, T('u7'), { dir: 'l' });
  const cell = (id) => tb.querySelector('#' + id);
  keyed(cell('ux1')).at(T('u8', '事务号'), { html: `<b style="color:var(--warn)">${U.xid}</b>` }); sfx('tick', T('u8', '事务号'));
  keyed(cell('uc1')).at(T('u9', '新版本'), { html: `<b style="color:var(--pg)">(${nP},${nL})</b>` }); sfx('tick', T('u9', '新版本'));
  keyed(cell('un1')).at(T('u10', 'xmin'), { html: `<b style="color:var(--pg)">${U.xid}</b>` }); sfx('tick', T('u10', 'xmin'));
  const ov = overlay(A); const ar = curve(ov, [840, 60 + 320 + 4 * 46 + 20], [1100, 640], 'navy', { bend: 560 });
  arrowIn(ar, T('u9', 't_ctid'), 0.5);
  classAt(oldv, 'dead', T('u11'));
  const two = tagEl(A, '同一个 Alice，两个版本', 1180, 760); slam(two, T('u11', '两个版本'), { from: 1.15 }); sfx('thud', T('u11', '两个版本'), { g: 0.6 });

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
  rs.forEach((r, i) => { slide(r.e2, T('u13', '新地址') + i * 0.15, { y: 30 }); sfx('pop', T('u13', '新地址') + i * 0.15, { g: 0.5, p: -0.5 + i * 0.5 }); });
  const same = noteBox(B, '名字、编号都没变，可旧项指着旧地址：每个索引都得再插一项', 72, 530, 1200); show(same, T('u14b'), { y: 10 });
  // InnoDB
  const ib = h('div', 'abs', B); px(ib, 72, 640, 1776, 280); ib.dataset.name = 'InnoDB 的做法';
  const it = capt(ib, 'InnoDB', 0, 0); css(it, { fontSize: '30px', color: 'var(--mute)', fontWeight: 700 });
  const irow = h('div', 'tup grey', ib, '主键树的叶子：2050  Alice  42 → 43（原位改）'); px(irow, 0, 52, 760);
  const iundo = h('div', 'tup grey', ib, 'undo：旧值 42'); px(iundo, 0, 112, 360); css(iundo, { background: '#f1f3f5' });
  const iname = h('div', 'tup grey', ib, '姓名索引：Alice → 主键 2050（不用动）'); px(iname, 860, 52, 700);
  show(it, T('u16')); show(irow, T('u16', '原位改'), { y: 8 }); slide(iundo, T('u16', 'undo'), { y: 20 }); sfx('pop', T('u16', 'undo'), { g: 0.5, p: -0.4 });
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
  // 两次更新写的日志
  const walRows = (arr) => arr.map((w) => [w[0], w[1]]);
  const t1 = tableDoc(C, ['users（年龄有索引）', ''], walRows(U.wal), 72, 606, { mono: [0, 1] });
  const t2 = tableDoc(C, ['users_hot', ''], walRows(H.wal), 760, 606, { mono: [0, 1] });
  css(t1, { fontSize: '23px' }); css(t2, { fontSize: '23px' });
  show(t1, T('u23'), { y: 10 }); show(t2, T('u24', 'HOT'), { y: 10 }); sfx('blip', T('u24', 'HOT'), { g: 0.5 });
  const tlab = capt(C, '各写了哪些日志记录', 72, 566); show(tlab, T('u23'));
  // Alice 这次：两条都不满足
  const x1 = tagEl(C, '✗ 年龄有索引', 1220, 660, 'warn'), x2 = tagEl(C, `✗ 第 ${oP} 页满了`, 1220, 720, 'warn');
  slam(x1, T('u26', '年龄有索引'), { from: 1.2 }); slam(x2, T('u26', '满了'), { from: 1.2 }); sfx('error', T('u26', '年龄有索引'), { g: 0.5 }); sfx('error', T('u26', '满了'), { g: 0.5 });
  const ff = noteBox(C, '<b>填充比例</b>　表默认 100（装满）；改小后，每页留出的空间给更新用', 1180, 790, 660); show(ff, T('u27'), { y: 10 });
});
