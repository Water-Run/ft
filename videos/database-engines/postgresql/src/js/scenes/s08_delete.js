// 08 删与回收：DELETE 只记 xmax（D1、D2）；Bob 的快照挡住 VACUUM（D3、D6）→ 收回、Dave 复用（D4、D5、D10、D12）→ 读取时清理、自动清理、长事务（U4、D9）→ 回绕与冻结（D7、D8、D11）
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('d9') + 0.5, tC = Tend('d20') + 0.5, tD = Tend('d28b') + 0.5;
  const [A, B, C, Dd] = screens(world, [c0, tB, tC, tD, s.end]);
  drift(world, s, [tB, tC, tD], 1);
  const E = D.delete, [P, LP] = D.alice.ctid;
  const vline = (arr, re) => esc(arr.find((l) => re.test(l)) || '');

  // ── A：删除只记 xmax；VACUUM 被 Bob 挡住 ──
  hdoc(A, 'Alice 注销', 72, 128);
  const tdl = term(A, 72, 196, 900, 2, { fs: 23, lh: 34, name: 'psql 会话' });
  const eD = tdl.type(T('d1') + 0.1, '<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 2050;', 'postgres=#', 40);
  tdl.print(eD + 0.2, '<span class="d">DELETE 1</span>');
  const pg = h('div', 'page', A); px(pg, 72, 340, 900, 150); pg.dataset.name = `第 ${P} 页`;
  const pgl = capt(A, `第 ${P} 页`, 72, 300);
  const row = h('div', 'tup', pg, `第 ${LP} 项　2050  Alice  42　xmax <span id="dx">0</span>`); px(row, 20, 50, 850);
  wipe(pg, T('d1') + 0.3, { dir: 'l' }); show(pgl, T('d1') + 0.3); show(row, T('d1') + 0.5, { y: 8 });
  const keepT = tagEl(A, '这一行不擦掉', 300, 296, 'ok'); css(keepT, { fontSize: '26px' }); show(keepT, T('d2', '不擦掉'), { y: 8 }); sfx('tick', T('d2', '不擦掉')); hide(keepT, T('d3') - 0.1, { d: 0.2 });
  keyed(row.querySelector('#dx')).at(T('d3', 'xmax'), { html: `<b style="color:var(--warn)">${E.xid}</b>` }); sfx('tick', T('d3', 'xmax'));
  const xmT = tagEl(A, `xmax 记上删除它的事务：${E.xid}`, 420, 510, 'warn'); css(xmT, { fontSize: '28px' }); show(xmT, T('d3') + 0.3, { y: 8 });
  const still = tagEl(A, '行还在页里', 72, 510, 'navy'); show(still, T('d4', '还在'), { y: 8 }); sfx('pop', T('d4', '还在'), { g: 0.5 });
  const adm = psqlBox(A, `<span class="p">postgres=#</span> <span class="k">SELECT</span> … <span class="k">WHERE</span> id = 2050;\n<span class="d">(0 rows)</span>`, 1040, 196, 800); css(adm, { fontSize: '23px' });
  show(adm, T('d4'), { x: 20 }); sfx('blip', T('d4'), { g: 0.4, p: 0.4 });
  const bob = psqlBox(A, `<span class="p">bob=*&gt;</span> <span class="k">SELECT</span> name, age … ;\n<span class="hi"> Alice | 42 </span>  <span class="d">（可重复读，删除前开始）</span>`, 1040, 330, 800); css(bob, { fontSize: '23px' });
  show(bob, T('d5b', 'Alice'), { x: 20 }); sfx('blip', T('d5b', 'Alice'), { g: 0.5, p: 0.4 });
  const vg = glossBox(A, 'VACUUM', '<b>VACUUM</b>：收走已经没人需要的旧版本和删掉的行，<br>连同索引里指向它们的项', 1040, 470, 800);
  show(vg, T('d6', 'VACUUM') + 0.1, { x: 20 }); sfx('pop', T('d6', 'VACUUM') + 0.1, { g: 0.5 });
  const rule = noteBox(A, '只要还有快照可能用到，就不能收', 72, 580, 900, 'warn'); show(rule, T('d7'), { y: 10 });
  const vb = E.vacuum['vacuum while bob holds snapshot'];
  const v1 = psqlBox(A, `<span class="p">postgres=#</span> <span class="k">VACUUM</span> (VERBOSE) users;\n<span class="d">${vline(vb, /^tuples/)}\n${vline(vb, /^removable cutoff/)}</span>`, 72, 670, 1500);
  css(v1, { fontSize: '23px' }); wipe(v1, T('d8'), { dir: 'l' }); sfx('blip', T('d8') + 0.3, { g: 0.5 });
  // VACUUM 到了这一行就停手：Bob 的快照还可能读它
  const stop = tagEl(A, '停：Bob 的快照还在', 520, 296, 'warn'); css(stop, { fontSize: '24px' }); show(stop, T('d9', '还不能') - 0.3, { y: 8 });
  const dead = tagEl(A, '已死，但还不能回收：Bob 的快照可能还要读', 72, 850, 'warn'); slam(dead, T('d9', '还不能'), { from: 1.12 }); sfx('error', T('d9', '还不能'), { g: 0.5 });

  // ── B：Bob 结束后收走；Dave 住进来 ──
  hdoc(B, 'Bob 结束后，再做一次 VACUUM', 72, 128);
  const va = E.vacuum['vacuum after bob'];
  const tv = term(B, 72, 196, 1500, 3, { fs: 23, lh: 34, name: 'psql 会话' });
  const eV = tv.type(T('d10') - 0.2, '<span class="k">VACUUM</span> (VERBOSE) users;', 'postgres=#', 45);
  tv.print(Math.max(eV + 0.1, T('d10b') - 0.3), `<span class="d">${vline(va, /^tuples/)}</span>`); tv.print(Math.max(eV + 0.2, T('d11')), `<span class="d">${vline(va, /^index scan needed/)}</span>`);
  const pg2 = h('div', 'page', B); px(pg2, 72, 380, 900, 150); pg2.dataset.name = `第 ${P} 页`;
  const pg2l = capt(B, `第 ${P} 页`, 72, 340);
  const row2 = h('div', 'tup dead', pg2, `第 ${LP} 项　2050  Alice  42　xmax ${E.xid}`); px(row2, 20, 50, 850);
  const empty = h('div', 'tup ghost', pg2, `第 ${LP} 项：空闲`); px(empty, 20, 50, 850);
  show(pg2, tB + 0.1); show(pg2l, tB + 0.1); show(row2, tB + 0.2);
  const sw2 = h('div', 'abs', B); px(sw2, 72, 386, 8, 140); css(sw2, { background: 'var(--navy)' }); sw2.dataset.name = '扫描线';
  set(sw2, 0, { autoAlpha: 0 }); set(sw2, eV, { autoAlpha: 1 }); to(sw2, eV, { x: 890, duration: T('d10b', '收走') + 0.3 - eV, ease: 'none' }); hide(sw2, T('d10b', '收走') + 0.4, { d: 0.2 }); sfx('whoosh', eV, { g: 0.3 });
  tl.to(row2, { autoAlpha: 0, scaleX: 0.2, transformOrigin: '0 50%', duration: 0.4, ease: 'power2.in' }, T('d10b', '收走')); show(empty, T('d10b', '收走') + 0.35, { y: 6 }); sfx('pop', T('d10b', '收走'));
  const idxs = [['主键树', '2050'], ['姓名树', 'Alice'], ['年龄树', '42']].map(([n, k], i) => {
    const e = h('div', 'tup', B, `${n}：${k} → (${P},${LP})`); px(e, 1040 + 0, 380 + i * 54, 760); return e;
  });
  idxs.forEach((e, i) => { show(e, tB + 0.3 + i * 0.05, { x: 10 }); classAt(e, 'dead', T('d11', '删掉') + i * 0.12); hide(e, T('d11', '删掉') + 0.9 + i * 0.1, { d: 0.3 }); });
  sfx('tick', T('d11', '删掉'), { p: 0.4 });
  const fr = h('div', 'big', B, `${E.freeBefore}`); px(fr, 72, 560); css(fr, { fontSize: '80px' });
  const frl = capt(B, '字节空隙', 270, 600);
  show(fr, T('d13', '72'), { x: -20 }); show(frl, T('d13', '72'));
  countTo(fr, E.freeBefore, E.freeAfter, T('d13', '160'), 0.8); sfx('tick', T('d13', '160'));
  const fsm = h('div', 'abs', B); px(fsm, 600, 560, 1240, 150); fsm.dataset.name = '空闲空间图';
  const fsmRows = [['第 22 页', 64], [`第 ${P} 页`, E.fsmAfter], ['……', ''], ['第 46 页', 3744]];
  fsmRows.forEach(([n, v], i) => { const c = h('div', 'abs', fsm, `<div class="cap" style="position:static">${n}</div><div class="mono" style="font:700 30px 'Mono';color:${i === 1 ? 'var(--pg)' : 'var(--ink2)'}">${v}</div>`); px(c, i * 300, 0, 280); css(c, { borderLeft: '6px solid ' + (i === 1 ? 'var(--pg)' : 'var(--line)'), paddingLeft: '12px' }); });
  const fsmT = capt(B, `<b>${D.files.users.node}_fsm</b>　每页还能放多少（字节）`, 600, 520);
  wipe(fsm, T('d14', '小文件'), { dir: 'l' }); show(fsmT, T('d14', '小文件'));
  const fsmG = glossBox(B, '空闲空间图', '<b>空闲空间图</b>：堆旁边的小文件，记着每页还能放多少', 600, 690, 900);
  show(fsmG, T('d15', '空闲空间图') - 0.1, { y: 10 }); sfx('pop', T('d15', '空闲空间图'), { g: 0.5 });
  // Dave
  const td = term(B, 72, 790, 1000, 2, { fs: 23, lh: 34, name: 'Dave 的会话' });
  td.type(T('d16') - 0.1, `<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (2050, 'Dave', 35) <span class="k">RETURNING</span> ctid;`, 'dave=&gt;', 60);
  td.print(T('d18', '23'), `<span class="hi"> (${E.dave[0]},${E.dave[1]}) </span>`); sfx('blip', T('d18', '23'), { g: 0.5 });
  // 插入前先问空闲空间图：哪页放得下 → 第 23 页
  fly(B, 'Dave：哪页放得下？', [500, 800], [900, 590], T('d17', '空闲空间图') - 0.4, { cls: 'navy', fs: 24, d: 0.55, hold: 0.4 });
  const fsmHit = fsm.children[1]; to(fsmHit, T('d17', '放得下'), { backgroundColor: '#dbe8f3', duration: 0.25 });
  fly(B, 'Dave', [900, 590], [600, 430], T('d18') - 0.2, { cls: 'navy', fs: 24, d: 0.5 });
  hide(fsmG, T('d16') - 0.1, { d: 0.25 });
  const drow = h('div', 'tup new', pg2, `第 ${E.dave[1]} 项　2050  Dave  35`); px(drow, 20, 50, 850);
  slide(drow, T('d18', '26'), { y: -30 }); hide(empty, T('d18', '26'), { d: 0.2 }); sfx('thud', T('d18', '26'), { g: 0.6 });
  const same = tagEl(B, '正是 Alice 原来的位置', 1040, 800); slam(same, T('d19', '原来'), { from: 1.15 }); sfx('chime', T('d19', '原来'), { g: 0.6 });
  const inn = noteBox(B, '<b>InnoDB</b>　要等后台的 purge 做完，Dave 才用上这块空间', 1040, 860, 800, 'grey'); show(inn, T('d20'), { y: 10 });

  // ── C：读取时清理；自动清理；长事务 ──
  hdoc(C, '不是每次都要等 VACUUM', 72, 128);
  const U = D.update.users;
  const pg3 = h('div', 'page', C); px(pg3, 72, 260, 900, 200); pg3.dataset.name = `改完年龄后的第 ${P} 页`;
  const pg3l = capt(C, `Alice 改完年龄后的第 ${P} 页`, 72, 220);
  const oldv = h('div', 'tup dead', pg3, `第 ${LP} 项　旧版本 2050 Alice 42`); px(oldv, 20, 40, 850);
  const lpd = h('div', 'tup ghost', pg3, `第 ${LP} 项：只剩指针，标为已死`); px(lpd, 20, 40, 850);
  const fr3 = capt(C, `空隙 <b>${U.freeBefore}</b> 字节`, 40, 120); pg3.appendChild(fr3); px(fr3, 20, 120);
  wipe(pg3, T('d22') + 0.1, { dir: 'l' }); show(pg3l, T('d22') + 0.1); show(oldv, T('d22') + 0.2, { y: 6 }); show(fr3, T('d22') + 0.3);
  const trd = term(C, 1040, 260, 800, 1, { fs: 23, lh: 34, name: '一次查询' });
  trd.type(T('d24', '查询') - 0.3, '<span class="k">SELECT</span> … <span class="k">WHERE</span> id = 2050;', 'postgres=#', 50);
  fly(C, '读到第 23 页', [1100, 320], [500, 300], T('d24', '第 23 页') - 0.2, { cls: 'navy', fs: 24, d: 0.6, hold: 0.3 });
  const tp = T('d24b', '清掉');
  hide(oldv, tp, { d: 0.3 }); show(lpd, tp + 0.25, { y: 6 }); sfx('pop', tp);
  keyed(fr3).at(T('d24b', '160'), { html: `空隙 <b>${U.afterRead.free}</b> 字节` }); sfx('tick', T('d24b', '160'));
  const cond = noteBox(C, '<b>页快满时</b>　空闲不到一成，读到这一页的查询就顺手清理没人要的旧版本', 1040, 360, 800); show(cond, T('d23'), { y: 10 });
  const auto = noteBox(C, '<b>自动清理</b>　默认开着：死行超过「50 + 表里行数的两成」就清一次', 72, 520, 1500); show(auto, T('d26'), { y: 10 }); sfx('tick', T('d26'));
  // 长事务挡住清理：时间轴上一条长长的事务，死行越积越多
  const axis = h('div', 'axis', C); px(axis, 120, 820, 1640);
  const longTx = h('div', 'abs', C); px(longTx, 160, 680, 1500, 46); css(longTx, { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', border: '3px solid var(--warn)' });
  const ltl = h('div', 'abs', longTx, '一个开了很久的事务'); px(ltl, 20, 4); css(ltl, { font: '700 24px "Sans SC"', color: 'var(--warn)' });
  show(axis, T('d28') - 0.2); fromTo(longTx, T('d28'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 1.6, ease: 'none' }); show(ltl, T('d28') + 0.3);
  const t0 = T('d28'), t1 = Tend('d28b');
  for (let i = 0; i < 14; i++) { const d = h('div', 'abs', C); px(d, 180 + i * 104, 770, 80, 34); css(d, { background: '#dfe3e6', border: '2px solid var(--grey)' }); show(d, t0 + (t1 - t0) * i / 14, { y: -10, d: 0.2 }); }
  const pile = tagEl(C, '死行越积越多', 1500, 620, 'warn'); show(pile, T('d28b', '越积越多'), { y: 8 }); sfx('error', T('d28b', '越积越多'), { g: 0.4 });

  // ── D：事务号会绕回；冻结 ──
  hdoc(Dd, '事务号只有 32 位', 72, 128);
  const ring = h('div', 'abs', Dd); px(ring, 160, 230, 520, 520); css(ring, { border: '14px solid var(--sky-lt)', borderRadius: '50%', background: 'var(--wash)' }); ring.dataset.name = '事务号的圈';
  const ovD = overlay(Dd);
  const arc = path(ovD, 'M420,230 A260,260 0 1,1 419,230', 'accent', { w: 14, arrow: false });
  const n0 = capt(Dd, '0', 410, 196); const n42 = capt(Dd, '约 42 亿', 470, 196);
  const now = tagEl(Dd, '现在', 640, 470, 'navy');
  show(ring, T('d29') - 0.2); draw(arc, T('d30', '32'), 1.4); show(n0, T('d30', '32')); show(n42, T('d30', '绕回') - 0.2); sfx('whoosh', T('d30', '绕回'), { g: 0.4 });
  const vt = tagEl(Dd, '只能靠 VACUUM', 300, 466, 'navy'); css(vt, { fontSize: '30px' }); show(vt, T('d29', 'VACUUM'), { y: 8 }); hide(vt, T('d30', '32') - 0.1, { d: 0.1 });
  const cnt = h('div', 'abs mono', Dd, ''); px(cnt, 220, 468, 400); css(cnt, { font: '700 36px "Mono"', color: 'var(--navy)', textAlign: 'center' });
  const tc0 = T('d30', '32');
  F((t) => { const k = clamp((t - tc0) / 1.4, 0, 1); cnt.textContent = t < tc0 ? '' : String(Math.round(k * 4294967295)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); });
  const wrapT = tagEl(Dd, '用完，就回到开头', 720, 230, 'warn'); css(wrapT, { fontSize: '30px' }); show(wrapT, T('d30', '绕回'), { x: -20 });
  const past = tagEl(Dd, '过去的事务，看起来像在未来', 720, 300, 'warn'); show(past, T('d31') + 0.3, { x: -20 }); sfx('error', T('d31') + 0.3, { g: 0.4 });
  show(now, T('d30', '32') + 1.4, { s: 0.5 });
  const rule2 = noteBox(Dd, '<b>所以</b>　每张表至少每 20 亿个事务 VACUUM 一遍', 760, 400, 1080); show(rule2, T('d32', '20'), { y: 10 }); sfx('tick', T('d32', '20'));
  const fz = tableDoc(Dd, ['Dave 那一行', '冻结前', '冻结后'], [['提示位', 'XMAX_INVALID', 'XMIN_COMMITTED + XMIN_INVALID + XMAX_INVALID'], ['表的 relfrozenxid', E.frozen[0], E.frozen[1]]], 760, 520, { mono: [1, 2] });
  css(fz, { fontSize: '23px' }); wipe(fz, T('d33', '冻结'), { dir: 'l' }); sfx('pop', T('d33', '冻结'));
  const fzG = glossBox(Dd, '冻结', '<b>冻结</b>：两个提示位同时记上，表示这一行对所有事务都算「过去」，不再比较事务号', 760, 700, 1080);
  show(fzG, T('d33', '冻结') + 0.4, { y: 10 }); sfx('chime', T('d34', '过去'), { g: 0.5 });
});
