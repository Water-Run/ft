// 03 一页之内：第 23 页的比例与放大（P1–P4），为什么地址记指针（P2），Alice 那一行的 82 字节与行头三样（P5–P8）
scene('page', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('p10') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);
  const G = D.page23, [P, LP] = D.alice.ctid;

  // ── A：一页 8192 字节 ──
  hdoc(A, `第 ${P} 页：8192 字节`, 72, 128);
  const X0 = 120, W = 1680;
  const bar = pageBar(A, X0, 220, W, 86);
  // 行：从页尾往前放，第 k 项在 8192 - 88k
  const k = W / 8192, rowsEls = [];
  for (let i = 1; i <= G.lps; i++) {
    const off = 8192 - i * 88, r = h('div', 'abs', bar.el); px(r, off * k, 0, 88 * k - 1.5, 80);
    css(r, { background: i === LP ? 'var(--pg)' : 'var(--sky-lt)', borderRight: '1px solid #fff' }); rowsEls.push(r);
  }
  const ticks = [[0, '0'], [8192, '8192']];
  ticks.forEach(([b, t], i) => { const l = capt(A, t, X0 + b * k - (i === 1 ? 50 : 12), 312, 'cap mono'); css(l, { fontSize: '23px' }); show(l, T('p1') + 0.3 + i * 0.05); });
  wipe(bar.el, T('p1', '23'), { dir: 'l', d: 0.6 }); sfx('whoosh', T('p1', '23'), { g: 0.4 });
  // 放大：前 448 字节
  const ZX = 120, ZW = 1680, Z = ZW / G.upper;
  const zoom = h('div', 'page', A); px(zoom, ZX, 430, ZW, 110); zoom.dataset.name = '前 448 字节放大';
  const zh = h('div', 'abs', zoom); px(zh, 0, 0, 24 * Z, 104); css(zh, { background: 'var(--navy)' });
  const zhl = h('div', 'abs', zh, '页头'); px(zhl, 14, 34); css(zhl, { font: '700 24px "Sans SC"', color: '#fff' });
  const lpsEls = [];
  for (let i = 0; i < G.lps; i++) { const e = h('div', 'lp' + (i + 1 === LP ? ' hl' : ''), zoom); px(e, (24 + i * 4) * Z + 1.5, 22, 4 * Z - 3, 60); lpsEls.push(e); }
  const zfree = h('div', 'abs', zoom); px(zfree, G.lower * Z, 0, (G.upper - G.lower) * Z, 104); css(zfree, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)' });
  const zfl = h('div', 'abs', zfree, `${G.upper - G.lower} 字节`); px(zfl, 40, 34); css(zfl, { font: '700 26px "Open Sans"', color: 'var(--warn)' });
  const ov = overlay(A);
  const g1 = path(ov, `M${X0},306 L${ZX},430`, 'dim', { w: 1.5, arrow: false }), g2 = path(ov, `M${X0 + G.upper * k},306 L${ZX + ZW},430`, 'dim', { w: 1.5, arrow: false });
  [[0, '0'], [24, '24'], [G.lower, String(G.lower)], [G.upper, String(G.upper)]].forEach(([b, tx], i) => { const l = capt(A, tx, ZX + b * Z - (i === 3 ? 50 : i === 0 ? 0 : 18), 548, 'cap mono'); css(l, { fontSize: '23px' }); show(l, T('p2') + 0.2 + i * 0.05); });
  const zcap = capt(A, `放大：前 ${G.upper} 字节`, ZX, 386); css(zcap, { fontSize: '23px' });
  wipe(zoom, T('p2') - 0.1, { dir: 'l', d: 0.5 }); draw(g1, T('p2') - 0.1, 0.4); draw(g2, T('p2') - 0.1, 0.4); show(zcap, T('p2'));
  slam(zhl, T('p2', '页头'), { from: 1.3 }); sfx('thud', T('p2', '页头'), { g: 0.5 });
  const hnote = noteBox(A, `<b>pd_lower = ${G.lower}</b>　空闲区从这里开始<br><b>pd_upper = ${G.upper}</b>　到这里结束`, 120, 620, 640);
  show(hnote, T('p2b', '空闲区'), { y: 10 });
  lpsEls.forEach((e, i) => show(e, T('p3', '项目指针') + i * 0.008, { y: -8, d: 0.15 })); sfx('tick', T('p3', '项目指针'));
  const lpG = glossBox(A, '项目指针', `<b>项目指针</b>：每个 4 字节，记着一行在页里的<br>起点和长度。${G.lps} 个，排在页头后面`, 820, 620, 660);
  show(lpG, T('p3', '项目指针') + 0.3, { x: 20 }); sfx('pop', T('p3', '项目指针') + 0.3, { g: 0.5 });
  const a1 = link(ov, [[200, 600], [600, 600]], 'accent'); const a1t = capt(A, '指针从前往后', 230, 568); css(a1t, { fontSize: '23px' });
  const a2 = link(ov, [[X0 + W - 10, 352], [X0 + W - 400, 352]], 'accent'); const a2t = capt(A, '行从页尾往前', X0 + W - 380, 360); css(a2t, { fontSize: '23px' });
  arrowIn(a1, T('p5', '从前往后'), 0.5); show(a1t, T('p5', '从前往后') + 0.2);
  rowsEls.forEach((r, i) => show(r, T('p5b') + i * 0.01, { x: 10, d: 0.15 }));
  arrowIn(a2, T('p5b', '往前'), 0.5); show(a2t, T('p5b', '往前') + 0.2); sfx('tick', T('p5b'), { p: 0.4 });
  set(zfl, 0, { opacity: 0 }); show(zfl, T('p6', '72'), { y: 8 });                         // 空隙：讲到时才显出字节数并描边
  to(zfree, T('p6', '72'), { boxShadow: 'inset 0 0 0 4px #b8442f', duration: 0.3 }); sfx('tick', T('p6', '72'));
  const ful = tagEl(A, '一行连指针要 92 字节：放不下', 1260, 606, 'warn'); show(ful, T('p6b'), { y: -8 }); sfx('error', T('p6b') + 0.1, { g: 0.4 });
  hide(hnote, Tend('p6b') + 0.2, { d: 0.3 }); hide(lpG, Tend('p6b') + 0.2, { d: 0.3 });
  // 第 26 个指针 → 5904 字节处的 82 字节
  const ax = (24 + (LP - 1) * 4 + 2) * Z + ZX, rx = X0 + G.aliceOff * k + 8;
  const a3 = curve(ov, [ax, 430], [rx, 306], 'navy', { bend: 380 });
  const aT = tagEl(A, `第 ${LP} 个指针：从 ${G.aliceOff} 字节起，占 ${G.aliceLen} 字节`, 760, 660);
  arrowIn(a3, T('p7', '26'), 0.6); show(aT, T('p7', '5904'), { y: 10 }); sfx('pop', T('p7', '5904'));
  // 为什么记指针：行挪了，指针不动
  const demo = h('div', 'abs', A); px(demo, 120, 740, 1400, 180); demo.dataset.name = '指针不动的演示';
  const dp = h('div', 'node hl', demo, `指针 ${LP}`); px(dp, 0, 60, 150);
  const dr = h('div', 'tup new', demo, '2050  Alice  42'); px(dr, 900, 58, 300);
  const ovd = overlay(demo);
  const da = path(ovd, 'M150,80 L900,80', 'navy', { w: 3 });
  const tD = T('p8');
  hide(aT, tD - 0.2, { d: 0.3 });
  show(dp, tD, { x: -20 }); show(dr, tD + 0.15, { x: 20 }); arrowIn(da, tD + 0.3, 0.4);
  const move = T('p9', '挪动');
  to(dr, move, { x: -380, duration: 0.8, ease: 'power3.inOut' });
  to(da, move, { attr: { d: 'M150,80 L520,80' }, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', move, { g: 0.4 });
  const dt = capt(demo, '行挪了位置，指针还在原处，地址不变', 200, 130); show(dt, T('p10'), { y: 8 }); sfx('chime', T('p10', '找得到'), { g: 0.6 });

  // ── B：Alice 那一行的 82 字节 ──
  hdoc(B, `Alice 这一行：${G.aliceLen} 字节`, 72, 128);
  const F = tupleFields();
  // 两张文档表：行头 24 字节、数据 58 字节；每行是一个字段：字节数、原样字节、换算后的值
  const val = { t_xmin: String(le32(F.head[0][1])), t_xmax: '0', t_cid: '0', t_ctid: `(${P},${LP})`, infomask2: '3 列', infomask: '标志位', t_hoff: '24', 对齐: '—' };
  const hdRows = F.head.map(([n, hex, b]) => [n, String(b), hex, val[n]]);
  const dval = { id: '2050', 长度: '51', name: 'Alice', 对齐: '—', age: '42' };
  const dtRows = F.data.map(([n, hex, b]) => [n, String(b), n === 'name' ? '41 6c 69 63 65 20 …' : hex, n === 'name' ? 'Alice + 45 个空格' : dval[n]]);
  const th = tableDoc(B, ['行头', '字节', '原样', '值'], hdRows, 72, 210, { mono: [0, 1, 2, 3] });
  const td = tableDoc(B, ['数据', '字节', '原样', '值'], dtRows, 1000, 210, { mono: [0, 1, 2] });
  css(th, { fontSize: '23px' }); css(td, { fontSize: '23px' });
  wipe(th, T('p11', '行头'), { dir: 'l', d: 0.5 }); sfx('tick', T('p11', '行头'));
  const rowG = glossBox(B, '行头', '<b>行头</b>：每个行版本前面的 24 字节，<br>记着谁写的、谁作废的、新版本在哪', 1000, 560, 760);
  show(rowG, T('p11', '行头') + 0.4, { x: 20 });
  hide(rowG, T('p12', '数据') - 0.1, { d: 0.25 });
  wipe(td, T('p12', '数据'), { dir: 'r', d: 0.5 }); sfx('tick', T('p12', '数据'), { p: 0.4 });
  const trOf = (t, i) => t.querySelectorAll('tr')[i + 1];
  [[0, '2050'], [2, 'Alice'], [4, '42']].forEach(([i, w]) => classAt(trOf(td, i), 'hl', T('p12b', w), Tend('p12c')));
  const pad = noteBox(B, 'char(50)：不满 50 个字符，后面用空格（20）补齐', 1000, 560, 760); show(pad, T('p12c', '空格'), { y: 10 }); sfx('pop', T('p12c', '空格'), { g: 0.5 });
  hide(pad, Tend('p12c') + 0.4, { d: 0.3 }); hide(td, T('p13') - 0.1, { d: 0.3 });               // 讲行头三样时，数据表先收走
  // 行头三样：xmin、xmax、t_ctid，讲到哪一个亮哪一行
  const xm = glossBox(B, 'xmin', `<b>xmin</b>：写入这一行的事务号。Alice 注册时是 ${D.alice.xmin} 号事务`, 72, 720, 880);
  const xx = glossBox(B, 'xmax', '<b>xmax</b>：作废这一行的事务号。0 表示还没有谁作废它', 72, 800, 880);
  const xc = glossBox(B, 't_ctid', `<b>t_ctid</b>：这一行最新版本的地址。现在是 (${P},${LP})，指着自己`, 1000, 720, 820);
  [[0, 'p14', '事务号', 'p15'], [1, 'p15', '事务号', 'p17'], [3, 'p17', '地址', 'p18']].forEach(([i, cue, w, next]) => {
    classAt(trOf(th, i), 'hl', T(cue, w), T(next)); sfx('tick', T(cue, w), { g: 0.6 });
  });
  show(xm, T('p14', '事务号') + 0.2, { x: -20 }); show(xx, T('p15', '事务号') + 0.2, { x: -20 }); show(xc, T('p17', '地址') + 0.2, { x: 20 });
  const self = tagEl(B, `指着自己：(${P},${LP})`, 1000, 640); show(self, T('p17b', '自己'), { y: 8 }); sfx('pop', T('p17b', '自己'), { g: 0.5 }); hide(self, T('p18') - 0.1, { d: 0.25 });
  const inn = noteBox(B, '<b>InnoDB</b>　行头里是 6 字节的事务号和 7 字节的回滚指针', 1000, 830, 820, 'grey'); show(inn, T('p18'), { y: 10 });
});
