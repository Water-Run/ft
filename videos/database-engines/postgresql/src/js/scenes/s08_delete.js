// 08 删与回收：DELETE 只记 xmax（D1、D2）；Bob 的快照挡住 VACUUM（D3、D6）→ 收回、Dave 复用（D4、D5、D10、D12）→ 读取时清理、自动清理、长事务（U4、D9）→ 回绕与冻结（D7、D8、D11）
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('d9') + 0.5, tC = Tend('d20') + 0.5, tD = Tend('d28b') + 0.5;
  const [A, B, C, Dd] = screens(world, [c0, tB, tC, tD, s.end]);
  drift(world, s, [tB, tC, tD], 1);
  const E = D.delete, [P, LP] = D.alice.ctid;
  const vline = (arr, re) => esc(arr.find((l) => re.test(l)) || '');
  // 第 23 页的实物：页头、一排行指针（第 26 个高亮）、指针和行之间的空隙、页底的行。三屏都用它，讲的始终是同一个位置
  const page23 = (p, x, y, title) => {
    const box = h('div', 'page', p); px(box, x, y, 900, 190); box.dataset.name = title;
    const cap = capt(p, title, x, y - 40); css(cap, { fontSize: '26px' });
    const hd = h('div', 'abs', box, '页头'); px(hd, 0, 0, 894, 28); css(hd, { background: '#dfe9f2', font: '700 22px "Sans SC"', color: 'var(--navy)', lineHeight: '28px', paddingLeft: '12px' });
    const ptrs = ['1', '2', '…', '25', String(LP), '27', '…'].map((n, i) => { const c = h('div', 'abs', box, n); px(c, 14 + i * 70, 34, 64, 36); css(c, { border: '2px solid var(--pg)', background: i === 4 ? 'var(--pg)' : '#fff', color: i === 4 ? '#fff' : 'var(--navy)', font: '700 22px var(--mono)', lineHeight: '32px', textAlign: 'center' }); return c; });
    const pl = h('div', 'abs', box, '行指针'); px(pl, 14 + 7 * 70 + 8, 38); css(pl, { font: '700 22px "Sans SC"', color: 'var(--mute)' });
    const gap = h('div', 'abs', box); px(gap, 14, 76, 866, 40); css(gap, { background: 'repeating-linear-gradient(135deg,#fff 0 7px,#e3edf5 7px 14px)', border: '2px dashed #9db6cc' }); gap.dataset.name = '空隙';
    const gl = h('div', 'abs', box, ''); px(gl, 540, 80); css(gl, { font: '700 24px "Sans SC"', color: 'var(--pg)', whiteSpace: 'nowrap' });
    const ax = x + 3 + 14 + 4 * 70 + 32, ar = link(overlay(p), [[ax, y + 73], [ax, y + 131]], 'accent');
    return { box, cap, p26: ptrs[4], gap, gl, ar, gapBox: (hh) => [x + 3 + 14, y + 3 + 76, 866, hh] };
  };
  // 页底的一行：若干格，行头的格用深色
  const rowCells = (box, cls, cells) => {
    const r = h('div', 'abs', box); px(r, 14, 130, 866, 44); r.dataset.name = '行'; let cx = 0;
    cells.forEach(([w, html, head]) => {
      const c = h('div', 'abs', r, html); px(c, cx, 0, w, 44); cx += w + 4;
      css(c, { background: head ? 'var(--navy)' : { new: 'var(--pg)', dead: 'repeating-linear-gradient(135deg,#eceff1 0 8px,#dfe3e6 8px 16px)' }[cls] || 'var(--sky-lt)', color: head || cls === 'new' ? '#fff' : cls === 'dead' ? '#46505a' : 'var(--navy)', font: `600 ${head ? 22 : 24}px var(--mono)`, lineHeight: '44px', textAlign: 'center', whiteSpace: 'nowrap' });
    });
    return r;
  };
  const collapse = (r, t) => tl.fromTo(r, { autoAlpha: 1, scaleX: 1 }, { autoAlpha: 0, scaleX: 0.2, transformOrigin: '0 50%', duration: 0.4, ease: 'power2.in', immediateRender: false }, t);
  const PTR = { full: { backgroundColor: '#336791', color: '#ffffff', borderColor: '#336791', borderStyle: 'solid' }, free: { backgroundColor: '#ffffff', color: '#336791', borderColor: '#336791', borderStyle: 'dashed' }, dead: { backgroundColor: '#dfe3e6', color: '#46505a', borderColor: '#8a949c', borderStyle: 'solid' } };

  // ── A：删除只记 xmax；VACUUM 被 Bob 挡住 ──
  hdoc(A, 'Alice 注销', 72, 128);
  const tdl = term(A, 72, 196, 900, 2, { fs: 23, lh: 34, name: 'psql 会话' });
  const eD = tdl.type(T('d1') + 0.1, '<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 2050;', 'postgres=#', 40);
  tdl.print(eD + 0.2, '<span class="d">DELETE 1</span>');
  const pa = page23(A, 72, 376, `第 ${P} 页`);
  const rowA = rowCells(pa.box, '', [[200, 'xmax 0', true], [662, '2050  Alice  42']]), xmc = rowA.children[0];
  wipe(pa.box, T('d1') + 0.3, { dir: 'l' }); show(pa.cap, T('d1') + 0.3); show(rowA, T('d1') + 0.6, { y: 8 }); arrowIn(pa.ar, T('d1') + 0.8, 0.3);
  const keepT = tagEl(A, '这一行不擦掉', 260, 330, 'ok'); css(keepT, { fontSize: '26px' }); show(keepT, T('d2', '不擦掉'), { y: 8 }); sfx('tick', T('d2', '不擦掉')); hide(keepT, T('d3') - 0.1, { d: 0.2 });
  keyed(xmc).at(T('d3', 'xmax'), { html: `xmax <b>${E.xid}</b>` }); set(xmc, T('d3', 'xmax'), { backgroundColor: '#b8442f' }); sfx('tick', T('d3', 'xmax'));
  const xmT = tagEl(A, `xmax 记上删除它的事务：${E.xid}`, 260, 590, 'warn'); css(xmT, { fontSize: '26px' }); show(xmT, T('d3') + 0.3, { y: 8 });
  const still = tagEl(A, '行还在页里', 72, 590, 'navy'); show(still, T('d4', '还在'), { y: 8 }); sfx('pop', T('d4', '还在'), { g: 0.5 });
  const adm = psqlBox(A, `<span class="p">postgres=#</span> <span class="k">SELECT</span> … <span class="k">WHERE</span> id = 2050;\n<span class="d">(0 rows)</span>`, 1040, 196, 800); css(adm, { fontSize: '23px' });
  show(adm, T('d4'), { x: 20 }); sfx('blip', T('d4'), { g: 0.4, p: 0.4 });
  const bob = psqlBox(A, `<span class="p">bob=*&gt;</span> <span class="k">SELECT</span> name, age … ;\n<span class="hi"> Alice | 42 </span>  <span class="d">（可重复读，删除前开始）</span>`, 1040, 330, 800); css(bob, { fontSize: '23px' });
  show(bob, T('d5', 'Bob'), { x: 20 }); sfx('blip', T('d5', 'Bob'), { g: 0.5, p: 0.4 });
  const vg = glossBox(A, 'VACUUM', '<b>VACUUM</b>：收走已经没人需要的旧版本和删掉的行，<br>连同索引里指向它们的项', 1040, 470, 800);
  show(vg, T('d6') + 0.6, { x: 20 }); sfx('pop', T('d6') + 0.6, { g: 0.5 });
  const rule = noteBox(A, '只要还有快照可能用到，就不能收', 72, 650, 900, 'warn'); show(rule, T('d7'), { y: 10 });
  const vb = E.vacuum['vacuum while bob holds snapshot'];
  const v1 = psqlBox(A, `<span class="p">postgres=#</span> <span class="k">VACUUM</span> (VERBOSE) users;\n<span class="d">${vline(vb, /^tuples/)}\n${vline(vb, /^removable cutoff/)}</span>`, 72, 740, 1500);
  css(v1, { fontSize: '23px' }); wipe(v1, T('d8'), { dir: 'l' }); sfx('blip', T('d8') + 0.3, { g: 0.5 });
  // VACUUM 沿行指针一个个看过去，到第 26 个停手：Bob 的快照还可能读这一行
  const swA = h('div', 'abs', pa.box); px(swA, 10, 30, 6, 44); css(swA, { background: 'var(--navy)' }); swA.dataset.name = '扫描线';
  const ts0 = T('d8') + 0.3, ts1 = Math.max(ts0 + 1, T('d9', '还不能') - 0.5);
  set(swA, 0, { autoAlpha: 0 }); set(swA, ts0, { autoAlpha: 1 }); tl.fromTo(swA, { x: 0 }, { x: 4 * 70 + 30, duration: ts1 - ts0, ease: 'power1.inOut', immediateRender: false }, ts0); sfx('whoosh', ts0, { g: 0.25 });
  tl.fromTo(pa.p26, { boxShadow: '0 0 0 0px #b8442f' }, { boxShadow: '0 0 0 5px #b8442f', duration: 0.2, immediateRender: false }, ts1);
  const stop = tagEl(A, '停：Bob 的快照还在', 420, 330, 'warn'); css(stop, { fontSize: '24px' }); show(stop, ts1, { y: 8 });
  const dead = tagEl(A, '已死，但还不能回收：Bob 的快照可能还要读', 72, 868, 'warn'); slam(dead, T('d9', '还不能'), { from: 1.12 }); sfx('error', T('d9', '还不能'), { g: 0.5 });
  const fA = focusRing(A);
  fA.at(T('d3', 'xmax'), xmc).at(T('d4', '查不到'), adm).at(T('d4', '还在'), rowA).at(T('d5', 'Bob'), bob).at(T('d5', '开着'), [1040, 366, 800, 44]).at(T('d5b', 'Alice'), rowA).at(T('d6', '旧版本'), rowA).at(T('d7', '快照'), rule).at(T('d8', '做一次'), v1).at(T('d9', '还不能') + 0.1, dead).off(tB - 0.4);
  // ── B：Bob 结束后收走；Dave 住进来 ──
  hdoc(B, 'Bob 结束后，再做一次 VACUUM', 72, 128);
  const va = E.vacuum['vacuum after bob'];
  const tv = term(B, 72, 196, 1500, 3, { fs: 23, lh: 34, name: 'psql 会话' });
  const eV = tv.type(T('d10') - 0.2, '<span class="k">VACUUM</span> (VERBOSE) users;', 'postgres=#', 45);
  tv.print(Math.max(eV + 0.1, T('d10b') - 0.3), `<span class="d">${vline(va, /^tuples/)}</span>`); tv.print(Math.max(eV + 0.2, T('d11')), `<span class="d">${vline(va, /^index scan needed/)}</span>`);
  const pb = page23(B, 72, 400, `第 ${P} 页`);
  const rowB = rowCells(pb.box, 'dead', [[200, `xmax ${E.xid}`, true], [662, '2050  Alice  42']]);
  show(pb.box, tB + 0.1); show(pb.cap, tB + 0.1); show(rowB, tB + 0.2); arrowIn(pb.ar, tB + 0.3, 0.2);
  // VACUUM 沿行指针扫过去，这回过了第 26 个也不停：那一行收走，指针空出来
  const sw2 = h('div', 'abs', pb.box); px(sw2, 10, 30, 6, 44); css(sw2, { background: 'var(--navy)' }); sw2.dataset.name = '扫描线';
  const tk = T('d10b', '收走');
  set(sw2, 0, { autoAlpha: 0 }); set(sw2, eV, { autoAlpha: 1 }); tl.fromTo(sw2, { x: 0 }, { x: 4 * 70 + 30, duration: Math.max(0.6, tk - eV), ease: 'none', immediateRender: false }, eV);
  tl.fromTo(sw2, { x: 4 * 70 + 30 }, { x: 6 * 70 + 30, duration: 0.4, ease: 'none', immediateRender: false }, Math.max(eV + 0.6, tk)); hide(sw2, Math.max(eV + 0.6, tk) + 0.45, { d: 0.2 }); sfx('whoosh', eV, { g: 0.3 });
  collapse(rowB, tk); gone(pb.ar, tk + 0.1, 0.25); sfx('pop', tk);
  const idxs = [['主键树', '2050'], ['姓名树', 'Alice'], ['年龄树', '42']].map(([n, k], i) => {
    const e = h('div', 'tup', B, `${n}：${k} → (${P},${LP})`); px(e, 1040 + 0, 380 + i * 54, 760); return e;
  });
  idxs.forEach((e, i) => { show(e, tB + 0.3 + i * 0.05, { x: 10 }); classAt(e, 'dead', T('d11', '删掉') + i * 0.12); hide(e, T('d11', '删掉') + 0.9 + i * 0.1, { d: 0.3 }); });
  sfx('tick', T('d11', '删掉'), { p: 0.4 });
  // 第 26 个指针空出来；行原来占的地方并进空隙：72 → 160
  set(pb.p26, T('d12', '26'), PTR.free); sfx('tick', T('d12', '26'), { p: 0.3 });
  pb.gl.innerHTML = `空隙 <b>${E.freeBefore}</b> 字节`; show(pb.gl, T('d13', '空隙'), { y: 6 });
  countTo(pb.gl.querySelector('b'), E.freeBefore, E.freeAfter, T('d13', '160'), 0.8); sfx('tick', T('d13', '160'));
  tl.fromTo(pb.gap, { height: 40 }, { height: 98, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('d13', '160'));
  // 空闲空间图：每页还能放多少
  const fsm = h('div', 'abs', B); px(fsm, 72, 664, 900, 90); fsm.dataset.name = '空闲空间图';
  const fsmRows = [['第 22 页', 64], [`第 ${P} 页`, E.fsmAfter], ['……', ''], ['第 46 页', 3744]];
  fsmRows.forEach(([n, v], i) => { const c = h('div', 'abs', fsm, `<div class="cap" style="position:static">${n}</div><div class="mono" style="font:700 30px 'Mono';color:${i === 1 ? 'var(--pg)' : 'var(--ink2)'}">${v}</div>`); px(c, i * 225, 0, 210); css(c, { borderLeft: '6px solid ' + (i === 1 ? 'var(--pg)' : 'var(--line)'), paddingLeft: '12px' }); });
  const fsmT = capt(B, `<b>${D.files.users.node}_fsm</b>　每页还能放多少（字节）`, 72, 624);
  wipe(fsm, T('d14', '小文件'), { dir: 'l' }); show(fsmT, T('d14', '小文件'));
  const fsmG = glossBox(B, '空闲空间图', '<b>空闲空间图</b>：堆旁边的小文件，记着每页还能放多少', 1040, 640, 800);
  show(fsmG, T('d15', '空闲空间图') - 0.1, { y: 10 }); sfx('pop', T('d15', '空闲空间图'), { g: 0.5 });
  // Dave
  const td = term(B, 72, 800, 940, 2, { fs: 23, lh: 34, name: 'Dave 的会话' });
  td.type(T('d16') - 0.1, `<span class="k">INSERT INTO</span> users <span class="k">VALUES</span> (2050, 'Dave', 35) <span class="k">RETURNING</span> ctid;`, 'dave=&gt;', 60);
  td.print(T('d18', '23'), `<span class="hi"> (${E.dave[0]},${E.dave[1]}) </span>`); sfx('blip', T('d18', '23'), { g: 0.5 });
  // 插入前先问空闲空间图：哪页放得下 → 第 23 页 → 第 26 个指针
  fly(B, 'Dave：哪页放得下？', [300, 806], [300, 700], T('d17', '空闲空间图') - 0.4, { cls: 'navy', fs: 24, d: 0.55, hold: 0.4 });
  const fsmHit = fsm.children[1]; to(fsmHit, T('d17', '放得下'), { backgroundColor: '#dbe8f3', duration: 0.25 });
  fly(B, 'Dave', [300, 690], [72 + 3 + 14 + 4 * 70 - 10, 400 + 40], T('d18') - 0.2, { cls: 'navy', fs: 24, d: 0.5, sink: true });
  hide(fsmG, T('d16') - 0.1, { d: 0.25 });
  const drow = rowCells(pb.box, 'new', [[866, '2050  Dave  35']]);
  const td18 = T('d18', '26');
  slide(drow, td18, { y: -30 }); set(pb.p26, td18, PTR.full); tl.fromTo(pb.ar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, td18 + 0.1); sfx('thud', td18, { g: 0.6 });
  tl.fromTo(pb.gap, { height: 98 }, { height: 40, duration: 0.4, ease: 'power2.out', immediateRender: false }, td18 - 0.1); hide(pb.gl, td18 - 0.1, { d: 0.2 });
  const same = tagEl(B, '正是 Alice 原来的位置', 1000, 526); slam(same, T('d19', '原来'), { from: 1.15 }); sfx('chime', T('d19', '原来'), { g: 0.6 });
  const inn = noteBox(B, '<b>InnoDB</b>　要等后台的 purge 做完，Dave 才用上这块空间', 1040, 860, 800, 'grey'); show(inn, T('d20'), { y: 10 });
  const fB = focusRing(B);
  fB.at(T('d11', '索引'), [1040, 380, 760, 150]).at(T('d12', '26'), pb.p26).at(T('d13', '空隙'), pb.gapBox(40)).at(T('d13', '160') + 0.6, pb.gapBox(98)).at(T('d14', '小文件'), fsm).at(T('d17', '放得下'), fsm.children[1]).at(T('d18', '26'), drow).at(T('d19', '原来'), same).at(T('d20', 'purge'), inn).at(T('d20', '空间'), drow).off(tC - 0.4);
  // ── C：读取时清理；自动清理；长事务 ──
  hdoc(C, '不是每次都要等 VACUUM', 72, 128);
  const U = D.update.users;
  const pc = page23(C, 72, 260, `Alice 改完年龄后的第 ${P} 页`);
  const rowC = rowCells(pc.box, 'dead', [[866, '旧版本　2050  Alice  42']]);
  pc.gl.innerHTML = `空隙 <b>${U.freeBefore}</b> 字节`;
  wipe(pc.box, T('d22') + 0.1, { dir: 'l' }); show(pc.cap, T('d22') + 0.1); show(rowC, T('d22') + 0.2, { y: 6 }); arrowIn(pc.ar, T('d22') + 0.4, 0.3); show(pc.gl, T('d22') + 0.3);
  const trd = term(C, 1040, 260, 800, 1, { fs: 23, lh: 34, name: '一次查询' });
  trd.type(T('d24', '查询') - 0.3, '<span class="k">SELECT</span> … <span class="k">WHERE</span> id = 2050;', 'postgres=#', 50);
  fly(C, '读到第 23 页', [1100, 320], [500, 300], T('d24', '第 23 页') - 0.2, { cls: 'navy', fs: 24, d: 0.6, hold: 0.3 });
  // 读到这一页时顺手清理：旧版本收走，第 26 个指针只剩一个「已死」标记，空隙 72 → 160
  const tp = T('d24b', '清掉');
  collapse(rowC, tp); gone(pc.ar, tp + 0.1, 0.25); set(pc.p26, tp + 0.25, PTR.dead); sfx('pop', tp);
  const lpd = tagEl(C, `第 ${LP} 个指针：只剩指针，标为已死`, 72, 462, 'grey'); css(lpd, { fontSize: '24px' }); show(lpd, tp + 0.3, { y: 6 });
  countTo(pc.gl.querySelector('b'), U.freeBefore, U.afterRead.free, T('d24b', '160'), 0.8); sfx('tick', T('d24b', '160'));
  tl.fromTo(pc.gap, { height: 40 }, { height: 98, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('d24b', '160'));
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
  const fC = focusRing(C);
  fC.at(T('d22'), pc.box).at(T('d23', '顺手清理'), cond).at(T('d24', '查询'), trd.el).at(T('d24b', '清掉'), pc.p26).at(T('d24b', '160'), pc.gapBox(98)).at(T('d26', '自动清理'), auto).at(T('d28', '事务'), longTx).off(tD - 0.4);

  // ── D：事务号会绕回；冻结 ──
  hdoc(Dd, '事务号只有 32 位', 72, 128);
  const ring = h('div', 'abs', Dd); px(ring, 160, 230, 520, 520); css(ring, { border: '14px solid var(--sky-lt)', borderRadius: '50%', background: 'var(--wash)' }); ring.dataset.name = '事务号的圈';
  // 圈分两半（D13）：从「现在」往回约 20 亿个是过去（上半），往前约 20 亿个是未来（下半）
  const halves = h('div', 'abs', Dd); px(halves, 174, 244, 492, 492); css(halves, { borderRadius: '50%', background: 'conic-gradient(rgba(51,103,145,0.20) 0deg 90deg, rgba(184,68,47,0.14) 90deg 270deg, rgba(51,103,145,0.20) 270deg 360deg)' }); halves.dataset.name = '过去与未来';
  const ovD = overlay(Dd);  const arc = path(ovD, 'M420,230 A260,260 0 1,1 419,230', 'accent', { w: 14, arrow: false });
  const n0 = capt(Dd, '0', 410, 196); const n42 = capt(Dd, '约 42 亿', 470, 196);
  const now = tagEl(Dd, '现在', 640, 470, 'navy');
  show(ring, T('d29') - 0.2); draw(arc, T('d30', '32'), 1.4); show(n0, T('d30', '32')); show(n42, T('d30', '绕回') - 0.2); sfx('whoosh', T('d30', '绕回'), { g: 0.4 });
  const vt = tagEl(Dd, '只能靠 VACUUM', 300, 466, 'navy'); css(vt, { fontSize: '30px' }); show(vt, T('d29', 'VACUUM'), { y: 8 }); hide(vt, T('d30', '32') - 0.1, { d: 0.1 });
  const cnt = h('div', 'abs mono', Dd, ''); px(cnt, 220, 468, 400); css(cnt, { font: '700 36px "Mono"', color: 'var(--navy)', textAlign: 'center' });
  const tc0 = T('d30', '32');
  F((t) => { const k = clamp((t - tc0) / 1.4, 0, 1); cnt.textContent = t < tc0 ? '' : String(Math.round(k * 4294967295)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); });
  const wrapT = tagEl(Dd, '用完，就回到开头', 720, 230, 'warn'); css(wrapT, { fontSize: '30px' }); show(wrapT, T('d30', '绕回'), { x: -20 });
  const pastH = capt(Dd, '过去 · 约 20 亿个', 330, 316), futH = capt(Dd, '未来 · 约 20 亿个', 330, 640);
  css(pastH, { fontSize: '26px', color: 'var(--navy)', fontWeight: 700 }); css(futH, { fontSize: '26px', color: '#7a2a1c', fontWeight: 700 });
  const th = T('d31') - 0.2; show(halves, th, { y: 0, d: 0.4 }); show(pastH, th + 0.1, { y: 8 }); show(futH, th + 0.2, { y: -8 });
  // 一行旧数据的事务号不变，「现在」一直往前走：它从过去那半边退到 9 点钟，再过去就落进了未来那半边
  const dot = h('div', 'abs', Dd); px(dot, 0, 0, 30, 30); css(dot, { borderRadius: '50%', border: '4px solid #fff' }); dot.dataset.name = '一行旧数据';
  const dotL = tagEl(Dd, '一行旧数据', 642, 312, 'navy'); css(dotL, { fontSize: '24px' });
  const tm0 = T('d31') + 0.5, tm1 = Math.max(tm0 + 1.2, T('d31', '未来') + 0.1), tf0 = T('d34', '过去') - 0.4, tf1 = tf0 + 0.8;
  const ez = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2), seg = (t, a, b) => ez(clamp((t - a) / (b - a), 0, 1));
  const angAt = (t) => 50 - 175 * seg(t, tm0, tm1) + 95 * seg(t, tf0, tf1);
  F((t) => {
    const a = angAt(t) * Math.PI / 180, on = t >= T('d31') ? clamp((t - T('d31')) / 0.25, 0, 1) : 0;
    const future = angAt(t) < -90, frozen = t >= tf0;
    dot.style.left = (420 + 253 * Math.sin(a) - 15) + 'px'; dot.style.top = (490 - 253 * Math.cos(a) - 15) + 'px';
    dot.style.opacity = on; dot.style.visibility = on > 0 ? 'visible' : 'hidden';
    dot.style.background = future && !frozen ? '#b8442f' : '#193145';
    dot.style.boxShadow = frozen ? '0 0 0 5px #9db6cc' : 'none';
  });
  show(dotL, T('d31'), { y: 8 }); hide(dotL, tm0 + 0.1, { d: 0.2 });
  const past = tagEl(Dd, '过去的事务，看起来像在未来', 150, 772, 'warn'); show(past, tm1 - 0.2, { y: 8 }); sfx('error', tm1 - 0.2, { g: 0.4 });
  const pastAr = link(ovD, [[230, 770], [212, 660]], 'accent'); arrowIn(pastAr, tm1 - 0.1, 0.3); gone(pastAr, tf0, 0.2); gone(past, tf0, 0.2);
  const frzL = tagEl(Dd, '冻结：对谁都算过去', 80, 196, 'navy'); css(frzL, { fontSize: '24px' }); show(frzL, tf1 - 0.2, { y: 8 }); sfx('chime', tf1 - 0.2, { g: 0.4 });  show(now, T('d30', '32') + 1.4, { s: 0.5 });
  const rule2 = noteBox(Dd, '<b>所以</b>　每张表至少每 20 亿个事务 VACUUM 一遍', 760, 400, 1080); show(rule2, T('d32', '20'), { y: 10 }); sfx('tick', T('d32', '20'));
  const fz = tableDoc(Dd, ['Dave 那一行', '冻结前', '冻结后'], [['提示位', 'XMAX_INVALID', 'XMIN_COMMITTED + XMIN_INVALID + XMAX_INVALID'], ['表的 relfrozenxid', E.frozen[0], E.frozen[1]]], 760, 520, { mono: [1, 2] });
  css(fz, { fontSize: '23px' }); wipe(fz, T('d33', '冻结'), { dir: 'l' }); sfx('pop', T('d33', '冻结'));
  const fzG = glossBox(Dd, '冻结', '<b>冻结</b>：两个提示位同时记上，表示这一行对所有事务都算「过去」，不再比较事务号', 760, 700, 1080);
  show(fzG, T('d33', '冻结') + 0.4, { y: 10 });
  const fD = focusRing(Dd);
  fD.at(T('d30', '32'), [160, 230, 520, 520]).at(T('d31', '未来'), past).at(T('d32', '20'), rule2).at(T('d32', 'VACUUM'), [160, 230, 520, 520]).at(T('d33', '冻结'), fz).at(T('d34', '对谁都'), fzG).at(tf1, frzL).off(Tend('d34') + 0.6);
});
