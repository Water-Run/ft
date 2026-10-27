// 05 查：按名字找 Alice 的完整路径（Q1–Q3）→ 全表计数走顺序扫描（Q4）→ 对照 InnoDB（Q9）与可见性图（T8、Q8）
scene('query', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('q10') + 0.5, tC = Tend('q13') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);
  const [P, LP] = D.alice.ctid, Tn = D.trees.idx_name;
  const planLine = (l) => esc(l.replace(/\s*\(cost=[^)]*\)/, '').replace(/\s*\(actual[^)]*\)/, ''));

  // ── A：按名字找 Alice ──
  hdoc(A, '按名字找 Alice', 72, 128);
  const q = psqlBox(A, '', 72, 196, 1060); css(q, { fontSize: '23px', height: '178px' });
  const kq = keyed(q);
  const sql = `<span class="p">postgres=#</span> <span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> name = 'Alice';`;
  const plan = D.plans.by_name.slice(0, 4).map(planLine).join('\n');
  kq.at(T('q1'), { html: sql });
  kq.at(T('q3', '姓名索引'), { html: sql + '\n<span class="d">' + plan + '</span>' }); sfx('blip', T('q3', '姓名索引'), { g: 0.5 });
  appear(q, T('q1') - 0.1);
  const plg = glossBox(A, '规划器', '<b>规划器</b>：先估一估要找多少行、<br>有哪些索引能用，再定下执行计划', 1170, 196, 640);
  show(plg, T('q2', '规划器') + 0.1, { x: 20 }); sfx('pop', T('q2', '规划器') + 0.1, { g: 0.5 });
  const ov = overlay(A);
  // 规划器：条件进来，在两条路里选一条
  const sqlN = tagEl(A, "name = 'Alice'", 72, 432, 'navy'); css(sqlN, { fontSize: '30px' });
  const plN = tagEl(A, '规划器', 520, 432); css(plN, { fontSize: '30px' });
  const opS = h('div', 'node grey', A, `顺序扫描：${D.heap.pages} 页全读`); px(opS, 900, 404, 400);
  const opI = h('div', 'node', A, '走姓名索引'); px(opI, 900, 474, 400);
  const pl1 = link(ov, [[372, 456], [510, 456]], 'accent'), pl2 = link(ov, [[660, 456], [890, 425]], 'accent'), pl3 = link(ov, [[660, 456], [890, 495]], 'accent');
  show(sqlN, T('q1', 'Alice'), { x: -20 }); slam(plN, T('q2', '规划器'), { from: 1.2 }); arrowIn(pl1, T('q2', '规划器') - 0.2, 0.3);
  show(opS, T('q3'), { x: 20 }); show(opI, T('q3') + 0.15, { x: 20 }); arrowIn(pl2, T('q3'), 0.3); arrowIn(pl3, T('q3') + 0.15, 0.3);
  classAt(opI, 'hl', T('q3', '姓名索引')); sfx('tick', T('q3', '姓名索引'), { p: 0.3 });
  [sqlN, plN, opS, opI, pl1, pl2, pl3].forEach((e) => hide(e, T('q4') - 0.7, { d: 0.25 }));
  const nt = btree(A, ov, 90, 410, 1740, Tn.leafCount, { leafW: 40, rootW: 160, dy: 96, name: '姓名树' });
  const nl = capt(A, `<b>姓名树</b>　${Tn.leafCount} 页叶子`, 1300, 404);
  const tT = T('q4') - 0.4;
  show(nl, tT); slam(nt.root, tT, { from: 1.2 }); nt.edges.forEach((e, i) => draw(e, tT + 0.05 + i * 0.005, 0.2)); nt.leaves.forEach((lf, i) => show(lf, tT + 0.1 + i * 0.006, { y: 6, d: 0.15 }));
  classAt(nt.root, 'hl', T('q4', '根'), T('q4b') + 0.3); sfx('tick', T('q4', '根'));
  const pathE = path(ov, `M${90 + 870},450 L${nt.leafX(0)},506`, 'accent', { w: 4, arrow: false });
  draw(pathE, T('q4b', '叶子') - 0.2, 0.4);
  classAt(nt.leaves[0], 'hl', T('q4b', '叶子')); sfx('tick', T('q4b', '叶子'), { p: -0.6 });
  const adr = tagEl(A, `Alice → (${P},${LP})`, 70, 560); show(adr, T('q5', '地址'), { y: -8 }); sfx('pop', T('q5', '地址'), { p: -0.6 });
  const strip = heapStrip(A, 90, 640, { w: 33, gap: 4, h: 80, labels: [0, P, 46] });
  show(strip, T('q4') - 0.2, { y: 10 });
  const pageX = 90 + P * 37 + 16;
  const a1 = curve(ov, [nt.leafX(0), 546], [pageX, 640], 'accent', { bend: 600 });
  arrowIn(a1, T('q6', '23'), 0.5); classAt(strip.pages[P], 'hl', T('q6', '23')); sfx('tick', T('q6', '23'));
  // 第 23 页：第 26 个指针 → 行 → 行头
  const pg = h('div', 'page', A); px(pg, 90, 770, 760, 150); pg.dataset.name = '第 23 页';
  const lpE = h('div', 'node hl', pg, `指针 ${LP}`); px(lpE, 14, 50, 130);
  const row = h('div', 'tup new', pg, '2050  Alice  42'); px(row, 430, 50, 300);
  const ovp = overlay(pg); const pa = path(ovp, 'M144,70 L430,70', 'navy', { w: 3 });
  const pgl = capt(A, `第 ${P} 页`, 860, 790);
  wipe(pg, T('q6b') - 0.2, { dir: 't' }); show(pgl, T('q6b') - 0.1); show(lpE, T('q6b', '26'), { x: -10 }); arrowIn(pa, T('q6b', '26') + 0.2, 0.4); show(row, T('q6b', '这一行'), { x: 10 }); sfx('tick', T('q6b', '这一行'));
  const chk = h('div', 'abs', A); px(chk, 1000, 770, 840, 160); chk.dataset.name = '可见性检查';
  const c1 = h('div', 'note', chk, `<b>xmin ${D.alice.xmin}</b>　已提交　✓`); px(c1, 0, 0, 400);
  const c2 = h('div', 'note', chk, '<b>xmax 0</b>　没有谁作废　✓'); px(c2, 430, 0, 400);
  const res = tagEl(chk, '看得见：Alice，42 岁', 0, 96, 'ok');
  show(c1, T('q8', 'xmin'), { y: 10 }); show(c2, T('q8', 'xmax'), { y: 10 }); sfx('tick', T('q8', 'xmin')); sfx('tick', T('q8', 'xmax'), { g: 0.6 });
  slam(res, T('q8b', '看得见'), { from: 1.15 }); sfx('chime', T('q8b', '看得见'), { g: 0.7 });
  const three = tagEl(A, `读了 3 页：树根 · 叶子 · 第 ${P} 页`, 1400, 866, 'navy'); show(three, T('q10', '三页'), { x: 20 }); sfx('pop', T('q10', '三页'));

  // ── B：一共多少人：顺序扫描 ──
  hdoc(B, '一共有多少人？', 72, 128);
  const q2 = psqlBox(B, `<span class="p">postgres=#</span> <span class="k">SELECT</span> count(*) <span class="k">FROM</span> users;\n<span class="d">${D.plans.count_all.slice(0, 4).map(planLine).join('\n')}</span>`, 72, 196, 1100);
  css(q2, { fontSize: '23px' }); appear(q2, T('q11') + 0.2); sfx('blip', T('q11') + 0.2, { g: 0.5 });
  const strip2 = heapStrip(B, 90, 520, { w: 33, gap: 4, h: 150 });
  show(strip2, T('q11') + 0.3, { y: 10 });
  const sweep = h('div', 'abs', B); px(sweep, 90, 500, 8, 200); css(sweep, { background: 'var(--navy)' }); sweep.dataset.name = '扫描线';
  const tsw = T('q12b');
  set(sweep, 0, { opacity: 0 }); set(sweep, tsw, { opacity: 1 });
  fromTo(sweep, tsw, { x: 0 }, { x: 47 * 37, duration: 2.2, ease: 'none' });
  strip2.pages.forEach((p, i) => classAt(p, 'full', tsw + 2.2 * i / 47));
  sfx('whoosh', tsw, { g: 0.3 }); sfx('tick', tsw + 2.2, { g: 0.5 });
  const all = tagEl(B, `顺序扫描：${D.heap.pages} 页全部读一遍`, 90, 720, 'navy'); show(all, tsw + 2.3, { y: 8 });
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
  show(ri, T('q16'), { x: 20 }); show(pleaf, T('q16', '地址'), { y: 10 }); arrowIn(pa2, T('q16', '堆') - 0.2, 0.4); show(pheap, T('q16', '堆'), { x: 10 }); sfx('tick', T('q16', '堆'), { p: 0.4 });
  // 只要名字：仅索引扫描，但要确认可见
  const ios = psqlBox(C, '', 72, 380, 1000); css(ios, { fontSize: '23px', height: '230px' });
  const ioq = `<span class="p">postgres=#</span> <span class="k">SELECT</span> name <span class="k">FROM</span> users <span class="k">WHERE</span> name = 'Alice';`;
  const pick = (arr) => arr.filter((l) => /Index Only Scan|Heap Fetches/.test(l)).map(planLine).join('\n');
  const kio = keyed(ios);
  kio.at(T('q18'), { html: ioq + '\n<span class="d">' + pick(D.ios.before_vacuum) + '</span>' });
  kio.at(T('q22', '不必'), { html: ioq + '\n<span class="d">' + pick(D.ios.after_vacuum).replace('Heap Fetches: 0', '<span class="ok">Heap Fetches: 0</span>') + '</span>' });
  appear(ios, T('q18') - 0.1); sfx('blip', T('q18'), { g: 0.5 });
  const hf = noteBox(C, '<b>Heap Fetches: 1</b>　还要回堆一次：看行头才知道这一行能不能看见', 72, 640, 1000); show(hf, T('q19', '行头'), { y: 10 });
  hide(hf, T('q22', '不必') - 0.2, { d: 0.3 });
  const vm = h('div', 'abs', C); px(vm, 1150, 380, 690, 300); vm.dataset.name = '可见性图';
  const vmt = h('div', 'cap mono', vm, `${D.files.users.node}_vm`); px(vmt, 0, 0); css(vmt, { color: 'var(--pg)', fontWeight: 700 });
  const bits = [];
  for (let i = 0; i < D.heap.pages; i++) { const b = h('div', 'abs', vm); px(b, (i % 16) * 42, 50 + Math.floor(i / 16) * 52, 34, 40); css(b, { border: '2px solid var(--pg)', background: '#fff' }); bits.push(b); }
  const vmG = glossBox(C, '可见性图', `<b>可见性图</b>：堆旁边的小文件，每页一格。<br>格子记上，表示这页的行对所有事务都可见`, 1150, 600, 690);
  wipe(vm, T('q20', '小文件'), { dir: 'r' }); show(vmG, T('q20', '可见性图') + 0.1, { y: 10 }); sfx('pop', T('q20', '可见性图') + 0.1, { g: 0.5 });
  bits.forEach((b, i) => set(b, T('q21', '记一笔') + i * 0.02, { background: 'var(--pg)' })); sfx('tick', T('q21', '记一笔'), { p: 0.4 });
  const hf0 = tagEl(C, 'Heap Fetches: 0：不再回堆', 72, 650, 'ok'); show(hf0, T('q22', '不必') + 0.2, { y: 8 }); sfx('chime', T('q22', '不必') + 0.2, { g: 0.6 });
  const byv = tagEl(C, '格子由 VACUUM 记上', 1150, 790, 'navy'); show(byv, T('q23', 'VACUUM'), { y: 8 });
});
