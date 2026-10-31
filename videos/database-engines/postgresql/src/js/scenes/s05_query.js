// 05 查（第 3 稿）：按名字找 Alice 的完整路径（Q1–Q3），看不看得见用第三章的「范围」→ 全表计数走顺序扫描（Q4）→ 对照 InnoDB（Q9）。
// 整章一个画面：下面那条堆一直留着，数全部时扫的就是这条堆，对照 InnoDB 时地址也落回它（可见性图挪到第八章 VACUUM 之后）
scene('query', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('q10') + 0.5, tC = Tend('q13') + 0.5;
  const S = h('div', 'abs', world); px(S, 0, 0, 1920, 1080); appear(S, c0);
  const [A, B, C] = [0, 1, 2].map(() => { const e = h('div', 'abs', S); px(e, 0, 0, 1920, 1080); return e; });   // 三段内容在同一个画面上交叉淡变；堆放在 S 里不变
  tl.fromTo(A, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, immediateRender: false }, tB - 0.3);
  tl.fromTo(B, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, immediateRender: true }, tB - 0.3); tl.fromTo(B, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, immediateRender: false }, tC - 0.3);
  tl.fromTo(C, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, immediateRender: true }, tC - 0.3);
  drift(world, s, [], -1);
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
  const strip = heapStrip(S, 90, 650, { w: 33, gap: 4, h: 80, labels: [0, P, 46] });
  show(strip, T('q4') - 0.2, { y: 10 });
  const pageX = 90 + P * 37 + 16;
  // 读过的页：根、叶子、堆页，各记一格
  const readL = capt(A, '读过的页', 1090, 560); css(readL, { fontSize: '26px', color: 'var(--ink)', fontWeight: 700 });
  const reads = ['根', '叶子', `第 ${P} 页`].map((t, i) => { const e = tagEl(A, t, 1230 + i * 150, 556, 'navy'); css(e, { fontSize: '24px' }); return e; });
  // 游标
  const cur = tagEl(A, '找 Alice', 960 - 70, 380, 'warn'); css(cur, { fontSize: '24px' }); cur.dataset.name = '游标';
  set(cur, 0, { autoAlpha: 0 });
  const tRoot = T('q4', '根'), tLeaf = T('q4b', '叶子'), tPg = T('q6', '23'), tRow = T('q6b', '这一行');
  set(cur, tRoot - 0.3, { autoAlpha: 1, x: 190, y: 30 });   // 先停在根的右边，不压住「根」字
  classAt(nt.root, 'hl', tRoot); show(readL, tRoot); show(reads[0], tRoot, { y: 8 }); sfx('tick', tRoot);
  to(cur, tLeaf - 0.5, { x: nt.leafX(0) - 960 + 10, y: 76, duration: 0.5, ease: 'power2.inOut' });
  const pathE = path(ov, `M${90 + 870},450 L${nt.leafX(0)},506`, 'accent', { w: 4, arrow: false }); draw(pathE, tLeaf - 0.5, 0.5);
  classAt(nt.leaves[0], 'hl', tLeaf); show(reads[1], tLeaf, { y: 8 }); sfx('tick', tLeaf, { p: -0.6 });
  keyed(cur).at(T('q5', '地址'), { html: `(${P},${LP})` }); sfx('pop', T('q5', '地址'), { p: -0.6 });
  const adr = capt(A, `叶子里：Alice → (${P},${LP})`, 120, 600); css(adr, { fontSize: '26px', color: 'var(--pg)', fontWeight: 700 }); show(adr, T('q5', '地址'), { y: -8 });
  keyed(adr).at(T('q5', '26'), { html: `叶子里：Alice → (${P},${LP})　= 第 ${P} 页 · 第 ${LP} 项` }); sfx('tick', T('q5', '26'), { p: 0.3 });
  const a1 = curve(ov, [nt.leafX(0), 546], [pageX, 650], 'accent', { bend: 600 });
  arrowIn(a1, tPg - 0.6, 0.6); to(cur, tPg - 0.6, { x: pageX - 960 + 30, y: 210, duration: 0.6, ease: 'power2.inOut' });   // 停在堆的上方，不压住页卡
  classAt(strip.pages[P], 'hl', tPg); show(reads[2], tPg, { y: 8 }); sfx('tick', tPg);
  // 第 23 页：第 26 个指针 → 这一行
  const pg = h('div', 'page', A); px(pg, 90, 800, 760, 140); pg.dataset.name = '第 23 页';
  const lpE = h('div', 'node hl', pg, `指针 ${LP}`); px(lpE, 14, 46, 150); css(lpE, { height: '48px', lineHeight: '43px', fontSize: '24px' });
  // 这一行：行头两格（xmin、xmax）+ 数据。行头深色，和第三章的字段条一样
  const row = h('div', 'abs', pg); px(row, 236, 46, 514, 48); row.dataset.name = 'Alice 这一行';
  const rc = (x, w, html, head) => { const c = h('div', 'abs', row, html); px(c, x, 0, w, 48); css(c, { background: head ? 'var(--navy)' : 'var(--pg)', color: '#fff', font: `600 ${head ? 22 : 24}px var(--mono)`, lineHeight: '48px', textAlign: 'center', whiteSpace: 'nowrap' }); return c; };
  const cXmin = rc(0, 150, `xmin ${D.alice.xmin}`, true), cXmax = rc(154, 110, 'xmax 0', true), cData = rc(268, 246, '2050 Alice 42');
  const ovp = overlay(pg); const pa = link(ovp, [[164, 70], [232, 70]], 'navy');
  const pgl = capt(A, `第 ${P} 页`, 90, 766); css(pgl, { fontSize: '24px', color: 'var(--pg)', fontWeight: 700 });
  wipe(pg, T('q6b') - 0.3, { dir: 't' }); show(pgl, T('q6b') - 0.2);
  show(lpE, T('q6b', '26'), { x: -10 }); arrowIn(pa, T('q6b', '26') + 0.2, 0.3); show(row, tRow, { x: 10 }); sfx('tick', tRow);
  to(cur, T('q6b', '26') - 0.2, { x: 110 - 960 + 70, y: 424, duration: 0.45, ease: 'power2.inOut' });
  to(cur, tRow, { x: 330 - 960 + 70, duration: 0.45, ease: 'power2.inOut' });
  // 还没完：看行头，这个版本能不能看见。两条都满足才看得见：① 写入它的事务提交了；② 没有谁作废它（删掉或改出新版本）
  keyed(cur).at(T('q7', '能不能'), { html: '看行头' });
  // 看得见吗：用第三章那条「可见范围」——从 xmin 起，到 xmax 止。xmin 已提交，起点算数；xmax 是 0，没有止点；这次查询落在范围里，看得见
  const chk = h('div', 'abs', A); px(chk, 900, 806, 940, 160); chk.dataset.name = '可见性检查';
  const rk = h('div', 'abs', chk); px(rk, 0, 0, 5, 64); css(rk, { background: 'var(--navy)' });
  const band = h('div', 'abs', chk); px(band, 5, 10, 935, 44); band.dataset.name = '可见范围';
  css(band, { background: 'linear-gradient(90deg, var(--pg) 0%, var(--pg) 62%, rgba(51,103,145,.12) 100%)', overflow: 'hidden' });
  const bl = h('div', 'abs', band, `xmin ${D.alice.xmin}`); px(bl, 16, 0); css(bl, { font: '700 24px var(--mono)', color: '#fff', lineHeight: '44px', whiteSpace: 'nowrap' });
  const br = h('div', 'abs', band, 'xmax 0：没有止点 →'); px(br, 650, 0); css(br, { font: '700 24px "Sans SC"', color: 'var(--pg-dk)', lineHeight: '44px', whiteSpace: 'nowrap' });
  const tXm = T('q8', 'xmin'), tXx = T('q8a', 'xmax');
  show(rk, tXm - 0.1, { y: 0, d: 0.2 });
  tl.fromTo(band, { autoAlpha: 1, width: 0 }, { width: 935 * 0.6, duration: 0.5, ease: 'power2.out', immediateRender: true }, tXm - 0.1);   // 长度用 width 动画，条里的字不被压扁
  tl.fromTo(band, { width: 935 * 0.6 }, { width: 935, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, tXx);
  set(bl, 0, { autoAlpha: 0 }); show(bl, tXm, { y: 0, d: 0.25 }); keyed(bl).at(T('q8', '提交'), { html: `xmin ${D.alice.xmin} 已提交 ✓` });
  set(br, 0, { autoAlpha: 0 }); show(br, tXx + 0.4, { x: -10, d: 0.3 });
  // 这次查询：一枚竖针落进范围里
  const pin = h('div', 'abs', chk); px(pin, 520, -30, 4, 96); css(pin, { background: 'var(--warn)' });
  const pinL = h('div', 'abs', chk, '这次查询'); px(pinL, 450, -66); css(pinL, { font: '700 24px "Sans SC"', color: 'var(--warn)', whiteSpace: 'nowrap' });
  set(pin, 0, { autoAlpha: 0 }); set(pinL, 0, { autoAlpha: 0 });
  tl.fromTo([pin, pinL], { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, T('q8b', '落在') - 0.35);
  const res = tagEl(chk, '看得见', 0, 76, 'ok'); css(res, { fontSize: '26px' }); keyed(res).at(T('q8b', 'Alice'), { html: '看得见 → 查询结果：Alice，42 岁' });
  const chkL = capt(A, '这个版本能不能看见？', 900, 772); css(chkL, { fontSize: '24px', color: 'var(--ink)', fontWeight: 700 });
  show(chkL, T('q7', '能不能'), { y: 8 });
  [[cXmin, T('q8', 'xmin')], [cXmax, T('q8a', 'xmax')]].forEach(([c, t]) => { set(c, t - 0.1, { backgroundColor: '#b8442f' }); set(c, t + 0.9, { backgroundColor: '#2f6b26' }); });
  sfx('tick', T('q8', 'xmin')); sfx('tick', T('q8a', 'xmax'), { g: 0.6 });
  slam(res, T('q8b', '看得见'), { from: 1.15 }); sfx('chime', T('q8b', '看得见'), { g: 0.7 }); hide(cur, T('q8b', '看得见'), { d: 0.25 });
  fly(A, 'Alice，42', [90 + 3 + 236 + 268 + 60, 800 + 3 + 46], [900 + 300, 806 + 76], T('q8b', 'Alice') - 0.6, { cls: 'ok', fs: 24, d: 0.5, sink: true });  A.appendChild(cur);                                                          // 游标压在页面之上
  // 一共三页
  [['树根', '根'], ['叶子', '叶子'], ['堆页', `第 ${P} 页`]].forEach(([w, txt], i) => { keyed(reads[i]).at(T('q10', w), { html: '✓ ' + txt }); sfx('tick', T('q10', w), { g: 0.5, p: i * 0.2 }); });
  keyed(readL).at(T('q10') - 0.3, { html: '一共读了' }).at(T('q10', '三页'), { html: '一共 3 页' }); sfx('pop', T('q10', '三页'));

  // ── B：一共多少人：顺序扫描 ──
  hdoc(B, '一共有多少人？', 72, 128);
  const tq2 = term(B, 72, 196, 1100, 5, { fs: 23, lh: 32, name: 'psql 会话' });
  const e2 = tq2.type(T('q11') + 0.1, '<span class="k">SELECT</span> count(*) <span class="k">FROM</span> users;', 'postgres=#', 40);
  D.plans.count_all.slice(0, 4).map(planLine).forEach((l, i) => tq2.print(Math.max(e2 + 0.1, T('q12')) + i * 0.1, `<span class="d">${l}</span>`)); sfx('blip', T('q12'), { g: 0.5 });
  const sweep = h('div', 'abs', B); px(sweep, 90, 630, 8, 120); css(sweep, { background: 'var(--navy)' }); sweep.dataset.name = '扫描线';
  const tsw = T('q12b');
  set(sweep, 0, { opacity: 0 }); set(sweep, tsw, { opacity: 1 });
  fromTo(sweep, tsw, { x: 0 }, { x: 47 * 37, duration: 2.2, ease: 'none' });
  strip.pages.forEach((p, i) => classAt(p, 'full', tsw + 2.2 * i / 47));
  sfx('whoosh', tsw, { g: 0.3 }); sfx('tick', tsw + 2.2, { g: 0.5 });
  const rd = capt(B, '', 1400, 560); css(rd, { fontSize: '30px', color: 'var(--ink)' });
  F((t) => { const k = clamp((t - tsw) / 2.2); rd.innerHTML = t < tsw ? '' : `已读 <b>${Math.max(1, Math.ceil(k * 47))}</b> / 47 页`; });
  const all = tagEl(B, `顺序扫描：${D.heap.pages} 页全部读一遍`, 90, 780, 'navy'); css(all, { fontSize: '28px' }); show(all, tsw + 2.3, { y: 8 });
  const nidx = noteBox(B, '每一行都要数，索引帮不上忙', 1220, 230, 600); show(nidx, T('q12', '不走索引'), { x: 20 });
  const rule = noteBox(B, '<b>按名字找一个人</b>：走姓名索引，读 3 页　　<b>数全部</b>：47 页从头读到尾', 90, 850, 1100); show(rule, T('q13'), { y: 10 }); sfx('pop', T('q13'), { g: 0.5 });

  // ── C：两种叶子页的实物（上）；只要名字时的仅索引扫描与可见性图（下） ──
  hdoc(C, '叶子里有什么', 72, 128);
  const ovC = overlay(C);
  const leafPage = (x, y, w, title, rows, cls) => {
    const b = h('div', 'abs', C); px(b, x, y, w); css(b, { border: `3px solid ${cls === 'grey' ? '#5f6a73' : 'var(--pg)'}`, background: '#fff' }); b.dataset.name = title;
    const hd = h('div', '', b, title); css(hd, { background: cls === 'grey' ? '#5f6a73' : 'var(--pg)', color: '#fff', font: '700 26px "Sans SC"', padding: '6px 16px' });
    const rs = rows.map(([txt, hi]) => { const r = h('div', '', b, txt); css(r, { font: '600 26px var(--mono)', padding: '8px 16px', borderTop: '1.5px solid var(--line)', color: hi ? '#fff' : 'var(--navy)', background: hi ? (cls === 'grey' ? '#5f6a73' : 'var(--pg)') : '#fff', whiteSpace: 'nowrap' }); return r; });
    return { b, rs };
  };
  // 名字是 User + 五位编号 + 一串字母，其他人 18 + 编号 % 63 岁（取证环境）
  const IL = leafPage(72, 200, 840, 'InnoDB · 主键树的叶子页：整行就在这里', [['2049 · User02049-… · 51'], ['2050 · Alice · 42', true], ['2051 · User02051-… · 53']], 'grey');
  wipe(IL.b, T('q15') - 0.1, { dir: 'l', d: 0.45 }); IL.rs.forEach((r, i) => show(r, T('q15', '整行') - 0.3 + i * 0.12, { x: -10, y: 0, d: 0.3 })); sfx('tick', T('q15', '整行'), { p: -0.4 });
  const PL = leafPage(1000, 200, 400, '姓名树的叶子页', [[`Alice → (${P},${LP})`, true], ['User00001-… → (0,1)'], ['User00002-… → (0,2)']], 'pg');
  wipe(PL.b, T('q16') - 0.1, { dir: 'l', d: 0.45 }); PL.rs.forEach((r, i) => show(r, T('q16', '地址') - 0.2 + i * 0.1, { x: -10, y: 0, d: 0.3 }));
  // 地址落回下面那条堆（第 23 页）：还得再去一趟
  const pa2 = curve(ovC, [1400, 290], [pageX, 646], 'accent', { w: 3.5, bend: 520 }); arrowIn(pa2, T('q16', '堆') - 0.4, 0.5); sfx('tick', T('q16', '堆'), { p: 0.4 });
  fly(C, `(${P},${LP})`, [1300, 300], [pageX - 40, 600], T('q16', '堆') - 0.4, { cls: 'navy', fs: 22, d: 0.5, sink: true });
  const again = tagEl(C, '还得再去一趟堆', pageX + 30, 590, 'warn'); css(again, { fontSize: '24px' }); show(again, T('q16', '再去') - 0.1, { x: -8 });
  const fC = focusRing(C);
  fC.at(T('q15', '整行'), IL.rs[1]).at(T('q16', '地址'), PL.rs[0]).at(T('q16', '堆'), strip.pages[P]).off(s.end - 0.5);
});
