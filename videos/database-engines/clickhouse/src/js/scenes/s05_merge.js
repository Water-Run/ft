// 第 05 章 合并：九百个片段慢 → 片段数有上限 → 后台合并 → 三摞卡片并成一摞（all_1_3_1）→ 一层层并成一棵树（all_1_900_3，MergeTree 名字的来历，LSM 树）→ 一亿人并成一个 → MergeTree 家族 → 一亿人排得整整齐齐
scene('merge', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gB2, gC, gD, gE, gF, gG, gH] = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(() => groupAt(world));

  // ── A 九百个一行的片段：求一次平均年龄要十几毫秒 ──
  appear(gA, c0 + 0.05);
  tableTag(gA, '表 <b>demo.many</b> · 900 行', c0 + 0.1);
  const gridEl = mk(gA, '', 100, 190, 1080, 480); const sq = [];
  for (let i = 0; i < 900; i++) { const e = h('div', 'sq', gridEl); css(e, { left: (i % 45) * 24 + 'px', top: Math.floor(i / 45) * 24 + 'px', width: '18px', height: '18px' }); sq.push(e); }
  wipe(gridEl, T('m2', '一行一行') - 0.1, { dir: 'l', d: 1.6 });
  const n900 = mk(gA, 'big y', 1420, 180, null, null, '0'); css(n900, { fontSize: '150px' }); appear(n900, T('m2', '一行一行') - 0.1); countTo(n900, 0, 900, T('m2', '一行一行') - 0.1, Math.max(1.6, T('m2b', '九百个') - T('m2', '一行一行')));
  mk(gA, 'lab', 1420, 340, null, null, '个片段');
  const tmA = termAt(gA, 100, 690, 1080, 268); vanish(tmA.el, 0); appear(tmA.el, T('m3') - 0.1);
  tmA.line(0, '<span class="pr">:) </span>SELECT avg(age) FROM demo.many;', T('m3') - 0.05, { type: 38, cursorUntil: T('m3', '十几毫秒') });
  printAt(tmA, 1, pretty([{ name: 'avg(age)', values: ['48.57'], right: true }]), T('m3', '十几毫秒') - 0.1);
  tmA.line(4, '<span class="out">1 row in set. Elapsed: 0.011 sec.</span>', T('m3', '十几毫秒') - 0.1, {});
  const t13 = mk(gA, 'huge y', 1420, 400, null, null, '11 ms'); css(t13, { fontSize: '130px' }); slam(t13, T('m3', '十几毫秒'), { from: 1.2 }); sfx('thud', T('m3', '十几毫秒') + 0.1, { g: 0.6 });
  const tl13 = mk(gA, 'lab', 1420, 545, null, null, '五次：15 11 11 32 11'); appear(tl13, T('m3', '十几毫秒') + 0.2);
  const t8 = mk(gA, 'lab y', 1420, 610, null, null, '开头那一亿行：8 ms'); css(t8, { fontSize: '26px' }); show(t8, T('m3a', '差不多'), { y: 12 });
  const t1 = mk(gA, 'huge', 1420, 680, null, null, '1 ms'); css(t1, { fontSize: '130px' }); slam(t1, T('m3b', '一毫秒'), { from: 1.2 }); sfx('chime', T('m3b', '一毫秒') + 0.1, { g: 0.6 });
  const tl1 = mk(gA, 'lab', 1420, 825, null, null, '并成一个片段后：五次都是 1'); appear(tl1, T('m3b', '并成') + 0.1);
  const sw0 = T('m4', '每一个') - 0.2, sw1 = Tend('m4', 0.3);
  F((t) => { const k = clamp((t - sw0) / Math.max(0.5, sw1 - sw0)) * 900; for (let i = 0; i < 900; i++) { const on = t >= sw0 && i < k; if (sq[i]._on !== on) { sq[i]._on = on; sq[i].classList.toggle('y', on); } } });
  const lsw = mk(gA, 'lab y', 1420, 870, null, null, '← 每个片段都翻一遍'); show(lsw, T('m4') - 0.1, { y: 12 });
  const tAB = T('m5') + 0.5;
  vanish(gA, tAB);

  // ── B 片段数上限：一千个放慢，三千个报错；报错信息本身说的就是「合并没有插入快」 ──
  appear(gB, tAB);
  const X0 = 100, PX = 1600 / 3000;
  const bar1 = mk(gB, 'bar', X0, 380, 1000 * PX, 48); css(bar1, { background: 'var(--g2)' }); wipe(bar1, tAB, { dir: 'l', d: 0.6 });
  const bar2 = mk(gB, 'bar y', X0 + 1000 * PX, 380, 2000 * PX, 48); wipe(bar2, T('m5', '放慢'), { dir: 'l', d: 0.8 });
  const tk1 = mk(gB, 'tick y', X0 + 1000 * PX - 1, 330, null, 140); const tk2 = mk(gB, 'tick y', X0 + 3000 * PX - 1, 330, null, 140); appear(tk1, T('m5', '放慢')); appear(tk2, T('m5', '拒绝'));
  const pl1 = mk(gB, 'pill y', X0 + 1000 * PX - 160, 250, 320, 64, '先放慢插入'); show(pl1, T('m5', '放慢'), { y: 14 }); sfx('pop', T('m5', '放慢'), { g: 0.5 });
  const pl2 = mk(gB, 'pill on', X0 + 3000 * PX - 400, 250, 400, 64, '再直接拒绝（报错）'); show(pl2, T('m5', '拒绝'), { y: 14 }); sfx('pop', T('m5', '拒绝'), { g: 0.5 });
  const nm1 = mk(gB, 'big y', X0 + 1000 * PX - 130, 480, null, null, '1000'); css(nm1, { fontSize: '90px' }); slam(nm1, T('m5b', '一千'), { from: 1.2 });
  const nm2 = mk(gB, 'big y', X0 + 3000 * PX - 260, 480, null, null, '3000'); css(nm2, { fontSize: '90px' }); slam(nm2, T('m5b', '三千'), { from: 1.2 }); sfx('thud', T('m5b', '三千') + 0.1, { g: 0.6 });
  const z0 = mk(gB, 'fn', X0, 335, null, null, '0'); css(z0, { fontSize: '24px' }); appear(z0, tAB);
  const pa = mk(gB, 'fn', X0 + 1000 * PX - 130, 590, null, null, 'parts_to_delay_insert'); css(pa, { fontSize: '24px' }); show(pa, T('m5b', '一千'), { y: 10 });
  const pb = mk(gB, 'fn', X0 + 3000 * PX - 420, 590, null, null, 'parts_to_throw_insert'); css(pb, { fontSize: '24px' }); show(pb, T('m5b', '三千'), { y: 10 });
  const tmB = termAt(gB, 100, 690, 1720, 182); vanish(tmB.el, 0); appear(tmB.el, T('m5b', '三千'));
  tmB.line(0, '<span class="err">Code: 252. DB::Exception: Too many parts (20 with average size of 458.00 B)</span>', T('m5b', '三千') + 0.2, {});
  tmB.line(1, '<span class="err">in table \'demo.few (…)\'. </span><span class="slow">Merges are processing significantly slower than inserts.</span>', T('m5b', '三千') + 0.2, {});
  tmB.line(2, '<span class="err">(TOO_MANY_PARTS)</span>', T('m5b', '三千') + 0.2, {});
  const slowEl = tmB.rows[1].querySelector('.slow');
  const fewN = mk(gB, 'pill on', 1000, 880, null, null, '实验：上限调成 20，第 21 次插入就报错'); css(fewN, { fontSize: '28px', height: '60px' }); slam(fewN, T('m5b', '三千') + 0.5, { from: 1.1 });
  tableTag(gB, '表 <b>demo.few</b>', T('m5b', '三千') + 0.2); classAt(slowEl, 'y', T('m5c', '没有') - 0.2);
  const slowN = mk(gB, 'h2 y', 100, 884, null, null, '后台合并，跟不上插入'); show(slowN, T('m5c') - 0.1, { y: 12 });
  const tBC = T('m6') + 0.5;
  vanish(gB, tBC);

  // ── C 写入只管写，整理交给后台：合并 ──
  appear(gC, tBC);
  const pf = mk(gC, 'panel', 100, 220, 800, 440); const pb_ = mk(gC, 'panel y', 1020, 220, 800, 440); wipe(pf, tBC, { dir: 'l', d: 0.4 }); appear(pb_, T('m6b', '后台') - 0.3);
  mk(gC, 'lab', 130, 245, null, null, '写入'); const lb_ = mk(gC, 'lab y', 1050, 245, null, null, '后台'); appear(lb_, T('m6b', '后台') - 0.3);
  for (let i = 0; i < 12; i++) { const e = mk(gC, 'sq-l', 130 + (i % 6) * 120, 330 + Math.floor(i / 6) * 110, 100, 80); vanish(e, 0); appear(e, tBC + 0.2 + i * 0.28); sfx('tick', tBC + 0.2 + i * 0.28, { g: 0.25 }); }
  const wn = mk(gC, 'h2', 130, 590, null, null, '只管写新的片段'); show(wn, T('m6b', '写入') - 0.1, { y: 12 });
  const mA = [0, 1, 2, 3].map((i) => { const e = mk(gC, 'sq-l', 1050 + i * 120, 340, 100, 80); vanish(e, 0); appear(e, T('m6b', '后台') - 0.1 + i * 0.1); return e; });
  const mBig = mk(gC, 'sq-l y', 1050, 480, 460, 80); wipe(mBig, T('m6c', '并成'), { dir: 'l', d: 0.6 }); sfx('thud', T('m6c', '并成') + 0.3, { g: 0.6 });
  const wm = mk(gC, 'h2 y', 1050, 590, null, null, '把小的并成大的'); show(wm, T('m6c', '并成'), { y: 12 });
  const g6 = glossAt(gC, 100, 720, 1300, '合并', '<b>合并</b>（merge）　几个小片段 → 一个大片段'); show(g6, T('m6c') - 0.2, { y: 14, d: 0.35 });
  const tag6 = mk(gC, 'tag', 1450, 740, null, null, '合并'); slam(tag6, T('m6c', '合并'), { from: 1.3 }); sfx('thud', T('m6c', '合并') + 0.1, { g: 0.6 });
  warm(pf, tBC + 0.4, T('m6b')); warm(pb_, T('m6b'), T('m7') - 0.2);
  const tCD = T('m7') + 0.6;
  vanish(gC, tCD);

  // ── D 三摞卡片并成一摞 ──
  appear(gD, tCD);
  tableTag(gD, '表 <b>demo.mp</b> · 8 行', tCD);
  const STACKS = [[[2, 'bob', 25], [5, 'erin', 33], [8, 'heidi', 36]], [[1, 'alice', 30], [4, 'dave', 19], [7, 'grace', 28]], [[3, 'carol', 41], [6, 'frank', 52]]];
  const SX = [100, 520, 940], CWS = [60, 170, 100], NAMES = ['all_1_1_0', 'all_2_2_0', 'all_3_3_0'];
  const stepT = [T('m8c', '一号'), T('m8c', '二号'), T('m8c', '三号')];
  const u0 = Tend('m8c') + 0.15, u1 = T('m8d', '一趟') - 0.1; for (let k = 0; k < 5; k++) stepT.push(u0 + k * (u1 - u0) / 4);
  const cards = [], flashT = {};
  STACKS.forEach((st, si) => {
    const nm = mk(gD, 'fn', SX[si], 200, null, null, NAMES[si]); const tt_ = tCD + 0.2 + si * 0.7; vanish(nm, 0); appear(nm, tt_ - 0.1);
    const lst = [];
    st.forEach((r, j) => {
      const rw = rowAt(gD, SX[si], 275 + j * 76, r, CWS, 64); vanish(rw.row, 0); appear(rw.row, tt_ + j * 0.12); sfx('tick', tt_ + j * 0.12, { g: 0.35 });
      lst.push({ id: r[0], cells: rw.c, row: rw });
    });
    cards.push(lst);
  });
  const arrS = mk(gD, 'lab y', 100, 560, null, null, '每一摞：编号由小到大'); show(arrS, T('m7b', '排好') - 0.2, { y: 12 }); vanish(arrS, T('m8') + 0.4);
  STACKS.forEach((st, si) => st.forEach((r) => { flashT[r[0]] = T('m7b', '交错') + (r[0] - 1) * 0.2; }));
  const tHead = T('m8b', '最上面') - 0.1;
  const WIN = [0, 1, 2].map((si) => [[tCD + 0.2 + si * 0.7, tCD + 0.8 + si * 0.7], [T('m7b') + 0.2 + si * 0.9, T('m7b') + 0.8 + si * 0.9], [T('m8a', '每一摞') + si * 0.5, T('m8a', '每一摞') + si * 0.5 + 0.5], [T('m8d', '一趟') + 0.1 + si * 0.4, T('m8d', '一趟') + 0.1 + si * 0.4 + 0.5], [T('m10', '三个') + si * 0.35, T('m10', '三个') + si * 0.35 + 0.5], [T('m9b', '一到三'), T('m9b', '末尾的一') - 0.1]]);
  F((t) => {
    cards.forEach((lst, si) => { let hs = false; const sf = WIN[si].some(([a, b]) => t >= a && t < b); lst.forEach((c) => {
      const taken = t >= stepT[c.id - 1], flash = t >= flashT[c.id] && t < flashT[c.id] + 0.3;
      const head = !taken && !hs && t >= tHead; if (!taken) hs = true;
      for (const e of c.cells) { e.classList.toggle('dead', taken && !sf); e.classList.toggle('on', head || sf || flash); }
    }); });
  });
  const arrM = mk(gD, 'h1 y', 1270, 520, null, null, '→'); css(arrM, { fontSize: '90px' }); vanish(arrM, 0); appear(arrM, T('m8', '并成一摞') - 0.2);
  const outT = mk(gD, 'fn', 1370, 200, null, null, '新的一摞'); vanish(outT, 0); appear(outT, T('m8') - 0.1); keyed(outT).at(T('m9'), { cls: 'abs fn y' }).at(T('m9', 'all'), { html: 'all_1_3_1', cls: 'abs fn y' });
  const outBox = mk(gD, '', 1360, 262, 470, 660); css(outBox, { border: '2px dashed var(--g2)', background: '#151515' }); vanish(outBox, 0); appear(outBox, T('m8') - 0.1);
  F((t) => { outBox.style.borderColor = t >= T('m9') ? '#FAFF69' : '#414141'; });
  warm(outBox, T('m8'), T('m8c', '一号'), '#151515', '#33332A');
  const outCells = P8.map((r, i) => { const rw = rowAt(gD, 1380, 275 + i * 76, r, CWS, 64); vanish(rw.row, 0); appear(rw.row, stepT[i]); sfx('pop', stepT[i], { g: 0.35 }); return rw; });
  const OW = outCells.map((rw, i) => [[stepT[i], stepT[i] + 0.55], [T('m9', '排好序') + i * 0.1, T('m9', '排好序') + i * 0.1 + 0.4], [T('m10b', '一趟') - 0.5 + i * 0.12, T('m10b', '一趟') - 0.5 + i * 0.12 + 0.3]]);
  F((t) => { outCells.forEach((rw, i) => { const on = OW[i].some(([a, b]) => t >= a && t < b); rw.c.forEach((c) => c.classList.toggle('on', on)); }); });
  // m8a：每一摞就是一个片段（依次描一下）
  [0, 1, 2].forEach((si) => { const o = mk(gD, '', SX[si] - 10, 264, 350, 3 * 76 + 6); css(o, { border: '4px solid var(--y)', pointerEvents: 'none' }); vanish(o, 0); appear(o, T('m8a', '每一摞') + si * 0.5); vanish(o, T('m8a', '每一摞') + si * 0.5 + 0.55); });
  // m9：名字
  const bk = mk(gD, 'fn', 100, 690, null, null, ''); css(bk, { fontSize: '68px' }); vanish(bk, 0); appear(bk, T('m9', 'all'));
  h('span', 'dim', bk, 'all_'); const sp1 = h('span', '', bk, '1_3'); h('span', 'dim', bk, '_'); const sp2 = h('span', '', bk, '1');
  classAt(sp1, 'y', T('m9b', '一到三'), T('m9b', '末尾的一') - 0.05); classAt(sp2, 'y', T('m9b', '末尾的一'));
  const bn_ = mk(gD, 'lab', 100, 790, null, null, ''); vanish(bn_, 0); appear(bn_, T('m9b', '一到三')); keyed(bn_).at(T('m9b', '一到三'), { html: '1_3：并进来的三次写入' });
  const bn2 = mk(gD, 'lab', 100, 830, null, null, '末尾的 1：并过 1 次'); show(bn2, T('m9b', '末尾的一') - 0.1, { y: 8 });
  // m10：旧的先标成不活动
  [0, 1, 2].forEach((si) => { const b = mk(gD, 'badge', SX[si], 560, null, null, '不活动'); css(b, { fontSize: '30px' }); show(b, T('m10', '不活动') + si * 0.2, { y: 10 }); sfx('tick', T('m10', '不活动') + si * 0.2, { g: 0.5 }); });
  const q1 = mk(gD, 'lab y', 1380, 900, null, null, '查询：只看新的这一摞'); show(q1, T('m10b') - 0.1, { y: 12 });
  vanish(gD, T('m11') - 0.1);

  // ── E 一层层并成一棵树 ──
  appear(gE, T('m11') - 0.1);
  tableTag(gE, '表 <b>demo.many</b> · 900 行', T('m11') - 0.1);
  const LX0 = 220, LP = 90, LW = 80, NH = 52, Y1 = [650, 510, 370, 230];
  const tr = mk(gE, '', 0, 0, 1920, 1080); tl.set(tr, { transformOrigin: '1025px 466px' }, 0);
  const lines = svg('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, tr); css(lines, { position: 'absolute', left: '0px', top: '0px' });
  const NODES = [];
  const counts = [18, 6, 2, 1];
  for (let lv = 0; lv < 4; lv++) {
    const cover = lv === 3 ? 18 : Math.pow(3, lv);
    for (let k = 0; k < counts[lv]; k++) {
      const el = mk(tr, 'cell' + (lv === 3 ? ' y' : ''), LX0 + k * cover * LP, Y1[lv], cover * LP - 10, NH, '');
      vanish(el, 0); NODES.push({ lv, k, el, cx: LX0 + (k * cover + cover / 2) * LP - 5 });
    }
  }
  const pathOf = (n) => { const p = svg('path', { d: '', fill: 'none', stroke: '#A0A0A0', 'stroke-width': 2 }, lines); const par = NODES.find((m) => m.lv === n.lv + 1 && m.k === Math.floor(n.k / 3)); p.setAttribute('d', `M${par.cx},${Y1[par.lv] + NH} L${par.cx},${(Y1[par.lv] + NH + Y1[n.lv]) / 2} L${n.cx},${(Y1[par.lv] + NH + Y1[n.lv]) / 2} L${n.cx},${Y1[n.lv]}`); p.style.opacity = 0; n.path = p; return p; };
  NODES.filter((n) => n.lv < 3).forEach((n) => pathOf(n));
  const showNode = (n, t) => { appear(n.el, t); if (n.path) tl.fromTo(n.path, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: true }, t + 0.1); };
  NODES.filter((n) => n.lv === 0).forEach((n, i) => showNode(n, T('m11') + i * 0.04));
  NODES.filter((n) => n.lv === 1).forEach((n, i) => { showNode(n, T('m11', '再并') + i * 0.14); sfx('pop', T('m11', '再并') + i * 0.14, { g: 0.35 }); });
  NODES.filter((n) => n.lv === 2).forEach((n, i) => { showNode(n, T('m11b', '再并') - 0.6 + i * 0.25); sfx('pop', T('m11b', '再并') - 0.6 + i * 0.25, { g: 0.45 }); });
  NODES.filter((n) => n.lv === 3).forEach((n) => { showNode(n, T('m11b', '再并') + 0.05); sfx('thud', T('m11b', '再并') + 0.15, { g: 0.6 }); });
  const lvLab = [0, 1, 2, 3].map((lv) => { const e = mk(gE, 'big', 100, Y1[lv] - 6, null, null, String(lv)); css(e, { fontSize: '64px', color: 'var(--g3)' }); vanish(e, 0); appear(e, T('m11c', '每并一层') + lv * 0.4); return e; });
  const lvT = mk(gE, 'lab', 100, 170, null, null, '层'); css(lvT, { fontSize: '24px' }); appear(lvT, T('m11c', '每并一层'));
  const rootL = mk(gE, 'fn y', 560, Y1[3] - 50, null, null, 'all_1_900_3'); css(rootL, { fontSize: '40px' }); vanish(rootL, 0); appear(rootL, T('m11c', 'all'));
  const l900 = mk(gE, 'lab', 220, Y1[0] + 70, null, null, '最下面：900 个一行的片段（示意）'); css(l900, { fontSize: '24px' }); appear(l900, T('m11b', '九百个'));
  const cap = mk(gE, 'lab y', 1000, Y1[3] - 44, null, null, ''); css(cap, { fontSize: '26px' }); vanish(cap, 0); appear(cap, T('m11d', '一百五十'));
  keyed(cap).at(T('m11d', '一百五十'), { html: '上限约 150 GB（压缩后）' }).at(T('m11e', '只剩'), { html: '只剩一个' });
  // m12：从最下面一层层往上
  const W1 = (a, d = 0.6) => [a, a + d];
  const LWIN = [0, 1, 2, 3].map((lv) => [W1(T('m11c', '每并一层') + lv * 0.8, 0.7), W1(T('m12', '往上') - 1.4 + lv * 0.5, 0.45), W1(T('m12d') + lv * 0.5, 0.45)].concat(lv === 0 ? [W1(T('m11') + 0.1), W1(T('m11b', '九百个'))] : lv === 1 ? [W1(T('m11', '再并')), W1(T('m11b', '一组一组'))] : lv === 2 ? [W1(T('m11b', '再并') - 0.6, 0.7)] : []).concat(lv < 3 ? [W1(T('m11d') + 0.2 + lv * 0.9, 0.6)] : []));
  F((t) => { NODES.forEach((n) => { if (n.lv < 3) n.el.classList.toggle('on', LWIN[n.lv].some(([a, b]) => t >= a && t < b)); }); });
  NODES.filter((n) => n.lv < 3).forEach((n) => classAt(n.el, 'dead', T('m11e', '只剩') - 0.1, T('m12') - 0.2));   // 只剩一个：下面各层退暗，下一句再亮回来讲来历
  const rootN2 = NODES[NODES.length - 1].el; classWins(rootN2, 'on', [[T('m11e') + 0.2, T('m12') - 0.2], [T('m12', '往上') + 0.6, T('m12b') - 0.2]]);
  // m12b：倒过来看（整体转 180 度；文字另外淡出再回来）
  const tF = T('m12b', '倒过来'), FD = 1.5;
  tl.fromTo(tr, { scaleY: 1 }, { scaleY: -1, duration: FD, ease: 'power2.inOut', immediateRender: false }, tF);   // 上下翻过来（不旋转：旋转时两端会扫进字幕条）
  [rootL, cap, l900, lvT, ...lvLab].forEach((e) => { vanish(e, tF - 0.05); });
  const lvLab2 = [0, 1, 2, 3].map((lv) => { const e = mk(gE, 'big', 100, 932 - (Y1[lv] + NH) - 6, null, null, String(lv)); css(e, { fontSize: '64px', color: 'var(--g3)' }); vanish(e, 0); appear(e, tF + FD + 0.05); return e; });
  const rootL2 = mk(gE, 'fn y', 560, 932 - (Y1[3] + NH) + 8, null, null, 'all_1_900_3 ← 树根'); css(rootL2, { fontSize: '40px' }); vanish(rootL2, 0); appear(rootL2, tF + FD + 0.05);
  const l9002 = mk(gE, 'lab', 220, 932 - (Y1[0] + NH) - 56, null, null, '树梢：900 个小片段'); css(l9002, { fontSize: '24px' }); vanish(l9002, 0); appear(l9002, tF + FD + 0.05);
  sfx('whoosh', tF, { g: 0.6 });
  const mt = mk(gE, 'h1', 100, 790, null, null, 'MergeTree  =  合并（Merge）+ 树（Tree）'); css(mt, { fontSize: '52px' }); wipe(mt, T('m12c', 'MergeTree') - 0.1, { dir: 'l', d: 0.7 });
  const lsm = mk(gE, 'tag o', 1260, 780, null, null, 'LSM 树 · 1996'); css(lsm, { fontSize: '56px' }); slam(lsm, T('m12e', 'LSM'), { from: 1.25 }); sfx('thud', T('m12e', 'LSM') + 0.1, { g: 0.5 });
  const src = mk(gE, 'lab', 100, 880, null, null, '出处：ClickHouse 官方文档'); css(src, { fontSize: '24px' }); appear(src, T('m12c', '官方文档'));
  const tEF = T('m13') + 0.3;
  vanish(gE, tEF);

  // ── F 一亿人的九十个片段，并成一个 ──
  appear(gF, tEF);
  tableTag(gF, '表 <b>demo.users</b> · 一亿行', tEF);
  const tmF = termAt(gF, 100, 170, 1060, 174); tmF.line(1, '<span class="out">Ok.</span>', Tend('m13b') - 0.2, {}); tmF.line(2, '<span class="out">0 rows in set. Elapsed: 10.549 sec.</span>', Tend('m13b') - 0.2, {}); vanish(tmF.el, 0); appear(tmF.el, tEF);
  tmF.line(0, '<span class="pr">:) </span>OPTIMIZE TABLE users FINAL;', T('m13', '并成') - 0.1, { type: 36, cursorUntil: T('m13', 'all') });
  const g90 = [];
  for (let i = 0; i < 90; i++) { const e = mk(gF, 'sq-l', 100 + (i % 15) * 60, 370 + Math.floor(i / 15) * 60, 50, 50); vanish(e, 0); appear(e, tEF + i * 0.015); g90.push(e); }
  const big90 = foldAt(gF, 1100, 370, 700, 350, 'all_1_90_3', 'y'); ['id.bin', 'name.bin', 'age.bin', '…'].forEach((t, i) => fileAt(big90, i, t)); wipe(big90, T('m13', 'all'), { dir: 'l', d: 0.6 }); sfx('chime', T('m13', 'all') + 0.3, { g: 0.6 });
  g90.forEach((e, i) => { classAt(e, 'y', T('m13', '并成') + i * 0.012, T('m13', 'all') + 0.1); vanish(e, T('m13', 'all') + 0.25); });
  const sec10 = mk(gF, 'huge y', 100, 760, null, null, '0.0 s'); css(sec10, { fontSize: '150px' }); appear(sec10, T('m13b') - 0.05); countTo(sec10, 0, 10.5, T('m13b') - 0.05, Tend('m13b') - T('m13b') - 0.2, (v) => v.toFixed(1) + ' s');
  const l10 = mk(gF, 'h2', 760, 820, null, null, '把一亿行重新写了一遍'); show(l10, T('m13b', '重新'), { y: 12 });
  const tFG = T('m14') + 1.8;
  vanish(gF, tFG);

  // ── G MergeTree 家族 ──
  appear(gG, tFG);
  const fam = ['MergeTree', 'ReplacingMergeTree', 'SummingMergeTree', 'AggregatingMergeTree', 'CollapsingMergeTree', 'VersionedCollapsingMergeTree', 'CoalescingMergeTree', 'GraphiteMergeTree'];
  const pf0 = mk(gG, 'lab', 100, 180, null, null, 'MergeTree 家族（还有各自的 Replicated 版本，一共 16 种）'); appear(pf0, tFG);
  fam.forEach((nm, i) => { const p = mk(gG, 'pill' + (i === 0 ? ' y' : ''), 100 + (i % 2) * 880, 250 + Math.floor(i / 2) * 84, 840, 68, nm); css(p, { fontSize: '30px' }); show(p, tFG + 0.2 + i * 0.3, { y: 14 }); sfx('tick', tFG + 0.2 + i * 0.3, { g: 0.3 }); if (i === 1 || i === 2) classAt(p, 'on', T('m14b') + 0.8 + (i - 1) * 0.6, T('m16')); });
  const dif = mk(gG, 'h1 y', 100, 640, null, null, '区别只在一处：合并的时候'); css(dif, { fontSize: '56px' }); wipe(dif, T('m14b') - 0.1, { dir: 'l', d: 0.6 });
  const dif2 = mk(gG, 'h2', 100, 730, null, null, '排序键相同的几行，怎么处理'); wipe(dif2, T('m14b') + 0.4, { dir: 'l', d: 0.6 });
  const e1 = noteAt(gG, 100, 810, 'ReplacingMergeTree　相同的只留一行\nSummingMergeTree　相同的数值相加'); css(e1, { fontSize: '26px' }); show(e1, T('m14b') + 0.8, { y: 14 });
  const tGH = T('m16') + 0.8;
  hide(gG, T('m16') - 0.1, { y: -12, d: 0.8 });

  // ── H 一亿人排得整整齐齐，在一个片段里 ──
  appear(gH, tGH);
  tableTag(gH, '表 <b>demo.users</b> · 一亿行', tGH);
  const dvH = noteAt(gH, 100, 868, 'Dave 后来那一行，另在 all_91_91_0 里'); css(dvH, { fontSize: '26px' }); show(dvH, tGH + 1.2, { y: 8 });
  const lh = mk(gH, 'lab y', 100, 170, null, null, 'all_1_90_3 · 一亿行 · 三个列文件（压缩后）'); wipe(lh, tGH, { dir: 'l', d: 0.5 });
  [['id.bin', 383.12, '383 MiB'], ['name.bin', 498.66, '499 MiB'], ['age.bin', 0.529, '529 KiB']].forEach(([nm, v, lab], i) => {
    const y = 270 + i * 190, w = Math.max(8, 1300 * v / 498.66);
    const l = mk(gH, 'fn', 100, y, null, null, nm); wipe(l, tGH + i * 0.35, { dir: 'l', d: 0.4 });
    const b = mk(gH, 'bar' + (i === 2 ? ' y' : ''), 100, y + 50, w, 64); if (i < 2) css(b, { background: 'var(--g2)' }); wipe(b, tGH + i * 0.35 + 0.1, { dir: 'l', d: 0.8 }); if (i < 2) warm(b, tGH + 0.9 + i * 0.6, tGH + 2.3 + i * 0.5, '#414141', '#8C8C82');
    const n = mk(gH, 'big' + (i === 2 ? ' y' : ''), 100 + w + 30, y + 40, null, null, lab); css(n, { fontSize: '72px' }); show(n, tGH + i * 0.35 + 0.5, { y: 12 }); sfx('thud', tGH + i * 0.35 + 0.5, { g: 0.4 });
  });
  drift(cam, s, 1);
});
