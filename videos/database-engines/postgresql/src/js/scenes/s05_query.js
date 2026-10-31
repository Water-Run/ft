// 05 查：按名字找 Alice 的完整路径（Q1–Q3）→ 全表计数走顺序扫描（Q4）→ 对照 InnoDB（Q9）与可见性图（T8、Q8）
scene('query', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('q10') + 0.5, tC = Tend('q13') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);
  const [P, LP] = D.alice.ctid, Tn = D.trees.idx_name;
  const planLine = (l) => esc(l.replace(/\s*\(cost=[^)]*\)/, '').replace(/\s*\(actual[^)]*\)/, ''));

  // ── A：按名字找 Alice：规划器选路 → 一个游标从树根走到叶子、再到堆页、再到那一行，一路数着读了几页 ──
  hdoc(A, '按名字找 Alice', 72, 128);
  const tq = term(A, 72, 196, 1060, 5, { fs: 23, lh: 32, name: 'psql 会话' });
  const e1 = tq.type(T('q1') - 0.2, `<span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> name = 'Alice';`, 'postgres=#', 40);
  const plan = D.plans.by_name.slice(0, 4).map(planLine);
  plan.forEach((l, i) => tq.print(Math.max(e1 + 0.1, T('q3', '姓名索引')) + i * 0.1, `<span class="d">${l}</span>`)); sfx('blip', T('q3', '姓名索引'), { g: 0.5 });
  const plg = glossBox(A, '规划器', '<b>规划器</b>：先估一估要找多少行、<br>有哪些索引能用，再定下执行计划', 1170, 196, 640);
  show(plg, T('q2', '规划器') + 0.1, { x: 20 }); sfx('pop', T('q2', '规划器') + 0.1, { g: 0.5 });
  const ov = overlay(A);
  // 规划器：条件进来，在两条路里选一条
  const sqlN = tagEl(A, "name = 'Alice'", 72, 432, 'navy'); css(sqlN, { fontSize: '30px' });
  const plN = tagEl(A, '规划器', 520, 432); css(plN, { fontSize: '30px' });
  const opS = h('div', 'node grey', A, `顺序扫描：${D.heap.pages} 页全读`); px(opS, 900, 404, 400); css(opS, { height: '50px', lineHeight: '45px', fontSize: '26px' });
  const opI = h('div', 'node', A, '走姓名索引：只找一行'); px(opI, 900, 474, 400); css(opI, { height: '50px', lineHeight: '45px', fontSize: '26px' });
  const pl1 = link(ov, [[372, 456], [510, 456]], 'accent'), pl2 = link(ov, [[660, 456], [890, 428]], 'accent'), pl3 = link(ov, [[660, 456], [890, 498]], 'accent');
  show(sqlN, T('q1', 'Alice'), { x: -20 }); slam(plN, T('q2', '规划器'), { from: 1.2 }); arrowIn(pl1, T('q2', '规划器') - 0.2, 0.3);
  show(opS, T('q2b', '怎么找'), { x: 20 }); show(opI, T('q2b', '怎么找') + 0.15, { x: 20 }); arrowIn(pl2, T('q2b', '怎么找'), 0.3); arrowIn(pl3, T('q2b', '怎么找') + 0.15, 0.3);
  classAt(opI, 'hl', T('q3', '姓名索引')); to(opS, T('q3', '姓名索引'), { opacity: 0.45, duration: 0.3 }); sfx('tick', T('q3', '姓名索引'), { p: 0.3 });
  [sqlN, plN, opS, opI, pl1, pl2, pl3].forEach((e) => hide(e, T('q4') - 0.7, { d: 0.25 }));
  // 姓名树、堆
  const nt = btree(A, ov, 90, 410, 1740, Tn.leafCount, { leafW: 40, rootW: 160, dy: 96, name: '姓名树' });
  const nl = capt(A, `<b>姓名树</b>　${Tn.leafCount} 页叶子`, 1300, 404);
  const tT = T('q4') - 0.4;
  show(nl, tT); slam(nt.root, tT, { from: 1.2 }); nt.edges.forEach((e, i) => draw(e, tT + 0.05 + i * 0.005, 0.2)); nt.leaves.forEach((lf, i) => show(lf, tT + 0.1 + i * 0.006, { y: 6, d: 0.15 }));
  const strip = heapStrip(A, 90, 650, { w: 33, gap: 4, h: 80, labels: [0, P, 46] });
  show(strip, T('q4') - 0.2, { y: 10 });
  const pageX = 90 + P * 37 + 16;
  // 读过的页：根、叶子、堆页，各记一格
  const readL = capt(A, '读过的页', 1090, 560); css(readL, { fontSize: '26px', color: 'var(--ink)', fontWeight: 700 });
  const reads = ['根', '叶子', `第 ${P} 页`].map((t, i) => { const e = tagEl(A, t, 1230 + i * 150, 556, 'navy'); css(e, { fontSize: '24px' }); return e; });
  // 游标
  const cur = tagEl(A, '找 Alice', 960 - 70, 380, 'warn'); css(cur, { fontSize: '24px' }); cur.dataset.name = '游标';
  set(cur, 0, { autoAlpha: 0 });
  const tRoot = T('q4', '根'), tLeaf = T('q4b', '叶子'), tPg = T('q6', '23'), tRow = T('q6b', '这一行');
  set(cur, tRoot - 0.3, { autoAlpha: 1 });
  classAt(nt.root, 'hl', tRoot); show(readL, tRoot); show(reads[0], tRoot, { y: 8 }); sfx('tick', tRoot);
  to(cur, tLeaf - 0.5, { x: nt.leafX(0) - 960 + 10, y: 76, duration: 0.5, ease: 'power2.inOut' });
  const pathE = path(ov, `M${90 + 870},450 L${nt.leafX(0)},506`, 'accent', { w: 4, arrow: false }); draw(pathE, tLeaf - 0.5, 0.5);
  classAt(nt.leaves[0], 'hl', tLeaf); show(reads[1], tLeaf, { y: 8 }); sfx('tick', tLeaf, { p: -0.6 });
  keyed(cur).at(T('q5', '地址'), { html: `(${P},${LP})` }); sfx('pop', T('q5', '地址'), { p: -0.6 });
  const adr = capt(A, `叶子里：Alice → (${P},${LP})`, 120, 600); css(adr, { fontSize: '26px', color: 'var(--pg)', fontWeight: 700 }); show(adr, T('q5', '地址'), { y: -8 });
  keyed(adr).at(T('q5', '26'), { html: `叶子里：Alice → (${P},${LP})　= 第 ${P} 页 · 第 ${LP} 项` }); sfx('tick', T('q5', '26'), { p: 0.3 });
  const a1 = curve(ov, [nt.leafX(0), 546], [pageX, 650], 'accent', { bend: 600 });
  arrowIn(a1, tPg - 0.6, 0.6); to(cur, tPg - 0.6, { x: pageX - 960 + 30, y: 280, duration: 0.6, ease: 'power2.inOut' });
  classAt(strip.pages[P], 'hl', tPg); show(reads[2], tPg, { y: 8 }); sfx('tick', tPg);
  // 第 23 页：第 26 个指针 → 这一行
  const pg = h('div', 'page', A); px(pg, 90, 800, 760, 140); pg.dataset.name = '第 23 页';
  const lpE = h('div', 'node hl', pg, `指针 ${LP}`); px(lpE, 14, 46, 150); css(lpE, { height: '48px', lineHeight: '43px', fontSize: '24px' });
  const row = h('div', 'tup new', pg, '2050  Alice  42'); px(row, 420, 46, 320); css(row, { height: '48px', lineHeight: '44px', fontSize: '26px' });
  const ovp = overlay(pg); const pa = link(ovp, [[164, 70], [416, 70]], 'navy');
  const pgl = capt(A, `第 ${P} 页`, 90, 766); css(pgl, { fontSize: '24px', color: 'var(--pg)', fontWeight: 700 });
  wipe(pg, T('q6b') - 0.3, { dir: 't' }); show(pgl, T('q6b') - 0.2);
  show(lpE, T('q6b', '26'), { x: -10 }); arrowIn(pa, T('q6b', '26') + 0.2, 0.4); show(row, tRow, { x: 10 }); sfx('tick', tRow);
  to(cur, T('q6b', '26') - 0.2, { x: 110 - 960 + 70, y: 424, duration: 0.45, ease: 'power2.inOut' });
  to(cur, tRow, { x: 520 - 960 + 70, duration: 0.45, ease: 'power2.inOut' });
  // 还没完：看行头，这个版本能不能看见
  keyed(cur).at(T('q7', '行头'), { html: '看行头' });
  const chk = h('div', 'abs', A); px(chk, 940, 800, 900, 150); chk.dataset.name = '可见性检查';
  const c1 = h('div', 'note', chk, `<b>xmin ${D.alice.xmin}</b>　已经提交　✓`); px(c1, 0, 0, 430);
  const c2 = h('div', 'note', chk, '<b>xmax 0</b>　没有谁作废　✓'); px(c2, 460, 0, 430);
  const res = tagEl(chk, '看得见', 0, 96, 'ok'); css(res, { fontSize: '28px' }); keyed(res).at(T('q8b', 'Alice'), { html: '看得见：Alice，42 岁' });
  const chkL = capt(A, '这个版本能不能看见？', 940, 766); css(chkL, { fontSize: '24px', color: 'var(--ink)', fontWeight: 700 });
  show(chkL, T('q7', '能不能'), { y: 8 });
  show(c1, T('q8', 'xmin'), { y: 10 }); show(c2, T('q8', 'xmax'), { y: 10 }); sfx('tick', T('q8', 'xmin')); sfx('tick', T('q8', 'xmax'), { g: 0.6 });
  slam(res, T('q8b', '看得见'), { from: 1.15 }); sfx('chime', T('q8b', '看得见'), { g: 0.7 }); hide(cur, T('q8b', '看得见'), { d: 0.25 });
  A.appendChild(cur);                                                          // 游标压在页面之上
  // 一共三页
  [['树根', '根'], ['叶子', '叶子'], ['堆页', `第 ${P} 页`]].forEach(([w, txt], i) => { keyed(reads[i]).at(T('q10', w), { html: '✓ ' + txt }); sfx('tick', T('q10', w), { g: 0.5, p: i * 0.2 }); });
  keyed(readL).at(T('q10') - 0.3, { html: '一共读了' }).at(T('q10', '三页'), { html: '一共 3 页' }); sfx('pop', T('q10', '三页'));

  // ── B：一共多少人：顺序扫描 ──
  hdoc(B, '一共有多少人？', 72, 128);
  const tq2 = term(B, 72, 196, 1100, 5, { fs: 23, lh: 32, name: 'psql 会话' });
  const e2 = tq2.type(T('q11') + 0.1, '<span class="k">SELECT</span> count(*) <span class="k">FROM</span> users;', 'postgres=#', 40);
  D.plans.count_all.slice(0, 4).map(planLine).forEach((l, i) => tq2.print(Math.max(e2 + 0.1, T('q12')) + i * 0.1, `<span class="d">${l}</span>`)); sfx('blip', T('q12'), { g: 0.5 });
  const strip2 = heapStrip(B, 90, 520, { w: 33, gap: 4, h: 150 });
  show(strip2, T('q11') + 0.3, { y: 10 });
  const sweep = h('div', 'abs', B); px(sweep, 90, 500, 8, 200); css(sweep, { background: 'var(--navy)' }); sweep.dataset.name = '扫描线';
  const tsw = T('q12b');
  set(sweep, 0, { opacity: 0 }); set(sweep, tsw, { opacity: 1 });
  fromTo(sweep, tsw, { x: 0 }, { x: 47 * 37, duration: 2.2, ease: 'none' });
  strip2.pages.forEach((p, i) => classAt(p, 'full', tsw + 2.2 * i / 47));
  sfx('whoosh', tsw, { g: 0.3 }); sfx('tick', tsw + 2.2, { g: 0.5 });
  const rd = capt(B, '', 1400, 700); css(rd, { fontSize: '30px', color: 'var(--ink)' });
  F((t) => { const k = clamp((t - tsw) / 2.2); rd.innerHTML = t < tsw ? '' : `已读 <b>${Math.max(1, Math.ceil(k * 47))}</b> / 47 页`; });
  const all = tagEl(B, `顺序扫描：${D.heap.pages} 页全部读一遍`, 90, 720, 'navy'); css(all, { fontSize: '28px' }); show(all, tsw + 2.3, { y: 8 });
  const nidx = noteBox(B, '每一行都要数，索引帮不上忙', 1220, 230, 600); show(nidx, T('q12', '不走索引'), { x: 20 });
  const rule = noteBox(B, '<b>找一行</b>：走索引　　<b>找全部</b>：从头读到尾', 90, 820, 980); show(rule, T('q13'), { y: 10 }); sfx('pop', T('q13'), { g: 0.5 });

  // ── C：对照 InnoDB；可见性图 ──
  hdoc(C, '叶子里有什么', 72, 128);
  const ovC = overlay(C);
  const li = tagEl(C, 'InnoDB · 主键树的叶子', 72, 192, 'grey'); css(li, { fontSize: '28px' });
  const ileaf = h('div', 'tup grey', C, '2050  Alice  42（整行）'); px(ileaf, 72, 250, 640); css(ileaf, { background: '#5f6a73', color: '#fff', borderColor: '#5f6a73', height: '52px', lineHeight: '48px', fontSize: '26px' });
  const ri = tagEl(C, 'PostgreSQL · 姓名树的叶子', 820, 192); css(ri, { fontSize: '28px' });
  const pleaf = h('div', 'tup', C, `Alice → (${P},${LP})`); px(pleaf, 820, 250, 380);
  const pheap = h('div', 'tup new', C, '堆里：2050  Alice  42'); px(pheap, 1360, 250, 470);
  const pa2 = link(ovC, [[1200, 270], [1360, 270]], 'accent');
  show(li, T('q15'), { x: -20 }); show(ileaf, T('q15', '整行'), { y: 10 }); sfx('tick', T('q15', '整行'), { p: -0.4 });
  show(ri, T('q16'), { x: 20 }); show(pleaf, T('q16', '地址'), { y: 10 }); arrowIn(pa2, T('q16', '堆') - 0.6, 0.4); show(pheap, T('q16', '堆'), { x: 10 }); sfx('tick', T('q16', '堆'), { p: 0.4 });
  fly(C, `(${P},${LP})`, [1110, 200], [1380, 200], T('q16', '堆') - 0.6, { cls: 'navy', fs: 22, d: 0.5 });
  fly(C, `(${P},${LP})`, [1110, 200], [1380, 200], T('q17'), { cls: 'navy', fs: 22, d: 0.5 });
  // 只要名字：仅索引扫描，但要确认可见
  const tio = term(C, 72, 380, 1000, 4, { fs: 23, lh: 36, name: 'psql 会话' });
  const pick = (arr) => arr.filter((l) => /Index Only Scan|Heap Fetches/.test(l)).map(planLine);
  const e3 = tio.type(T('q18') - 0.2, `<span class="k">SELECT</span> name <span class="k">FROM</span> users <span class="k">WHERE</span> name = 'Alice';`, 'postgres=#', 40);
  pick(D.ios.before_vacuum).forEach((l, i) => tio.print(Math.max(e3 + 0.1, T('q18', '不去堆')) + i * 0.15, `<span class="d">${l}</span>`)); sfx('blip', T('q18', '不去堆'), { g: 0.5 });
  tio.print(T('q22', '不必'), `<span class="ok">${esc(pick(D.ios.after_vacuum).find((l) => /Heap Fetches/.test(l)).trim())}</span><span class="d">　（VACUUM 之后再查）</span>`);
  // 只要名字也得回堆一趟：看行头才知道看不看得见
  fly(C, `(${P},${LP})`, [1110, 200], [1380, 200], T('q19', '行头'), { cls: 'warn', fs: 22, d: 0.5 });
  const hf = noteBox(C, '<b>Heap Fetches: 1</b>　还要回堆一次：看行头才知道这一行能不能看见', 72, 640, 1000); show(hf, T('q19', '行头'), { y: 10 });
  hide(hf, T('q22', '不必') - 0.2, { d: 0.3 });
  const vm = h('div', 'abs', C); px(vm, 1150, 380, 690, 300); vm.dataset.name = '可见性图';
  const vmt = h('div', 'cap mono', vm, `${D.files.users.node}_vm`); px(vmt, 0, 0); css(vmt, { color: 'var(--pg)', fontWeight: 700 });
  const bits = [];
  for (let i = 0; i < D.heap.pages; i++) { const b = h('div', 'abs', vm); px(b, (i % 16) * 42, 50 + Math.floor(i / 16) * 52, 34, 40); css(b, { border: '2px solid var(--pg)', background: '#fff' }); bits.push(b); }
  const vmG = glossBox(C, '可见性图', `<b>可见性图</b>：堆旁边的小文件，每页一格。<br>格子记上，表示这页的行对所有事务都可见`, 1150, 600, 690);
  wipe(vm, T('q20', '小文件'), { dir: 'r' }); show(vmG, T('q20', '可见性图') + 0.1, { y: 10 }); sfx('pop', T('q20', '可见性图') + 0.1, { g: 0.5 });
  const tb0 = T('q21'), tb1 = Math.max(tb0 + 1.2, T('q21', '记一笔'));
  bits.forEach((b, i) => set(b, tb0 + (tb1 - tb0) * i / 47, { background: 'var(--pg)' })); sfx('tick', tb0, { p: 0.4 }); sfx('tick', tb1, { p: 0.6 });
  // 记过的页不必回堆：地址停在可见性图上那一格
  const bx = 1150 + (P % 16) * 42, by = 380 + 50 + Math.floor(P / 16) * 52;
  fly(C, `(${P},${LP})`, [1110, 200], [bx - 30, by - 4], T('q22', '记过') - 0.3, { cls: 'navy', fs: 22, d: 0.6 });
  to(bits[P], T('q22', '记过') + 0.4, { backgroundColor: '#193145', duration: 0.2 });
  const hf0 = tagEl(C, 'Heap Fetches: 0：不再回堆', 72, 650, 'ok'); css(hf0, { fontSize: '28px' }); show(hf0, T('q22', '不必') + 0.2, { y: 8 }); sfx('chime', T('q22', '不必') + 0.2, { g: 0.6 });
  const byv = tagEl(C, '格子由 VACUUM 记上', 1150, 790, 'navy'); show(byv, T('q23', 'VACUUM'), { y: 8 });
  fly(C, 'VACUUM', [1500, 880], [1300, 520], T('q23', 'VACUUM') + 0.1, { cls: 'navy', fs: 24, d: 0.9, hold: 0.4 }); sfx('whoosh', T('q23', 'VACUUM') + 0.1, { g: 0.3 });
});
