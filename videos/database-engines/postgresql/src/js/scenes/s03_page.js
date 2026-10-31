// 03 一页之内：第 23 页的整页与开头放大（P1–P4）；新行放不下；地址为什么记指针（P2）→ Alice 那一行的 82 个字节，行头三样（P5–P8）
scene('page', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('p10') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);
  const G = D.page23, [P, LP] = D.alice.ctid;
  const ov = overlay(A);

  // ── A：开头 448 字节的放大（上：页头、指针、空隙，页的前面）与整页 8192 字节（下：行在后面）。指针的箭头从指针本身往下指到那一行 ──
  hdoc(A, `第 ${P} 页：8192 字节`, 72, 128);
  const X0 = 120, W = 1680, BY = 600, BH = 100, k = W / 8192;
  const bar = h('div', 'page', A); px(bar, X0, BY, W, BH); bar.dataset.name = '第 23 页';
  const rowsEls = [];
  for (let i = 1; i <= G.lps; i++) {   // 第 i 项在 8192 − 88i（82 字节补齐到 88）
    const off = 8192 - i * 88, r = h('div', 'abs', bar); px(r, off * k, 0, 88 * k - 1.5, BH - 6);
    css(r, { background: i === LP ? 'var(--pg)' : 'var(--sky-lt)' }); rowsEls.push(r);
  }
  const bl0 = capt(A, '0', X0, BY + BH + 6, 'cap mono'), bl1 = capt(A, '8192', X0 + W - 60, BY + BH + 6, 'cap mono');
  wipe(bar, T('p1') - 0.2, { dir: 'l', d: 0.6 }); show(bl0, T('p1')); show(bl1, T('p1') + 0.1); sfx('whoosh', T('p1') - 0.2, { g: 0.4 });
  rowsEls.forEach((r) => set(r, 0, { autoAlpha: 0 }));
  // 放大：前 448 字节（页头 + 项目指针 + 空隙）
  const ZX = 120, ZY = 300, ZW = 1680, ZH = 120, Z = ZW / G.upper;
  // 放大的来处：整页条上开头这一段描上框，从它向上张开一块实心的淡蓝漏斗，接到放大条的整个底边（原先两条细斜线，看着像空隙连到下面；WaterRun 看 r7：「空隙不是跨上下的? 或者你可以用U型之类的」）
  const funnel = path(ov, `M${X0},${BY} L${X0 + G.upper * k},${BY} L${ZX + ZW},${ZY + ZH} L${ZX},${ZY + ZH} Z`, 'dim', { w: 1.5, arrow: false });
  funnel.setAttribute('fill', 'rgba(105,158,202,.16)'); funnel.setAttribute('stroke', 'rgba(105,158,202,.55)');
  const seg = h('div', 'abs', A); px(seg, X0 - 3, BY - 3, G.upper * k + 6, BH); css(seg, { border: '3px solid var(--pg)', zIndex: 2 }); seg.dataset.name = '开头这一段';
  const zoom = h('div', 'page', A); px(zoom, ZX, ZY, ZW, ZH); zoom.dataset.name = '前 448 字节放大';
  const zcap = capt(A, `放大：开头 ${G.upper} 字节`, ZX + 600, ZY - 44); css(zcap, { fontSize: '24px' });
  const tZ = T('p2') - 0.4;
  show(seg, tZ - 0.2, { y: 0, d: 0.25 });
  tl.fromTo(funnel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, immediateRender: true }, tZ);
  wipe(zoom, tZ + 0.1, { dir: 'l', d: 0.5 }); show(zcap, tZ + 0.1);
  // 页头 24 字节
  const zh = h('div', 'abs', zoom); px(zh, 0, 0, 24 * Z, ZH - 6); css(zh, { background: 'var(--navy)' }); zh.dataset.name = '页头';
  const zhl = h('div', 'abs', zh, '页头'); px(zhl, 12, 38); css(zhl, { font: '700 26px "Sans SC"', color: '#fff' });
  slam(zh, T('p2', '页头'), { from: 1.4 }); sfx('thud', T('p2', '页头'), { g: 0.5 });
  const hf = h('div', 'abs', A); px(hf, 120, 760, 1440, 170); hf.dataset.name = '页头的字段';
  const hft = capt(hf, '<b>页头里的 24 字节</b>（手册《Database Page Layout》表 66.3）', 0, 0); css(hft, { fontSize: '24px', color: 'var(--navy)' });
  [['日志位置', 8], ['校验和', 2], ['标志', 2], ['pd_lower', 2, G.lower], ['pd_upper', 2, G.upper], ['特殊区', 2], ['版本', 2], ['清理提示', 4]].reduce((x, [nm, nb, v], i) => {
    const c = h('div', 'abs', hf); px(c, x, 44, nb * 60 - 4, 56); css(c, { background: i === 3 || i === 4 ? 'var(--pg)' : 'var(--navy)', color: '#fff', font: '600 23px var(--mono)', textAlign: 'center', lineHeight: '56px', whiteSpace: 'nowrap', overflow: 'hidden' }); c.textContent = nm;
    const lb = h('div', 'abs', hf, `${nb} 字节` + (v != null ? `<br><b style="color:var(--pg)">${v}</b>` : '')); px(lb, x, 108); css(lb, { font: '500 23px var(--sans)', color: 'var(--ink2)', whiteSpace: 'nowrap', lineHeight: '1.3' });
    show(c, T('p2', '页头') + 0.3 + i * 0.06, { y: 8, d: 0.25 }); show(lb, T('p2', '页头') + 0.4 + i * 0.06, { y: 0, d: 0.25 }); return x + nb * 60;
  }, 0);
  show(hft, T('p2', '页头') + 0.2, { y: 8 }); gone(hf, T('p3') - 0.3, 0.3);
  const t24 = capt(A, '24 字节', ZX + 12, ZY + ZH + 8); css(t24, { fontSize: '24px', color: 'var(--navy)', fontWeight: 700 }); show(t24, T('p2', '24'));
  // 页头记着空闲区的两头：pd_lower、pd_upper
  const pdl = capt(A, `<b>pd_lower = ${G.lower}</b>　空闲区从这里起`, ZX + (12 + G.lower) / 2 * Z - 190, ZY + ZH + 54, 'cap ko'); const pdu = capt(A, `<b>pd_upper = ${G.upper}</b>　到这里止`, ZX + (12 + G.upper) / 2 * Z - 150, ZY - 94, 'cap ko');
  [pdl, pdu].forEach((e) => css(e, { fontSize: '24px', color: 'var(--navy)' }));
  const pa1 = curve(ov, [ZX + 12 * Z, ZY + ZH], [ZX + G.lower * Z, ZY + ZH + 2], 'navy', { bend: ZY + ZH + 60 }), pa2 = curve(ov, [ZX + 12 * Z, ZY], [ZX + G.upper * Z - 4, ZY], 'navy', { bend: ZY - 70 });
  const tP2b = T('p2b', '空闲区');
  arrowIn(pa1, tP2b - 0.3, 0.6); show(pdl, tP2b, { y: -8 }); arrowIn(pa2, tP2b + 0.2, 0.6); show(pdu, tP2b + 0.4, { y: 8 }); sfx('tick', tP2b);
  [pa1, pa2, pdl, pdu].forEach((e) => hide(e, T('p3') - 0.1, { d: 0.3 })); hide(zcap, T('p2b') - 0.2, { d: 0.2 });
  // 88 个项目指针，从前往后一个个排开
  const lpsEls = [];
  for (let i = 0; i < G.lps; i++) { const e = h('div', 'lp', zoom); px(e, (24 + i * 4) * Z + 1.5, 24, 4 * Z - 3, 66); lpsEls.push(e); }
  const tLP = T('p3', '项目指针') - 0.3;
  lpsEls.forEach((e, i) => show(e, tLP + i * 0.012, { y: -8, d: 0.15 })); sfx('tick', tLP);
  const lpG = glossBox(A, '项目指针', `<b>项目指针</b>：每个 4 字节，记着一行在页里的起点和长度。<br>${G.lps} 个，排在页头后面`, 120, 760, 820);
  show(lpG, tLP + 0.3, { x: 20 }); sfx('pop', tLP + 0.3, { g: 0.5 });
  // 每个指针指向页里的一行：第 1 个指针 → 页尾那一行
  const lp1x = ZX + 24 * Z + 2 * Z;
  const pp1 = curve(ov, [lp1x, ZY + 93], [X0 + (8192 - 44) * k, BY + 3], 'accent', { bend: (ZY + 93 + BY) / 2 });
  set(lpsEls[0], T('p3b', '一行'), { backgroundColor: 'var(--navy)' }); arrowIn(pp1, T('p3b', '指向'), 0.6); set(rowsEls[0], T('p3b', '一行'), { autoAlpha: 1 });
  hide(pp1, T('p5', '从前往后') - 0.3, { d: 0.25 }); set(lpsEls[0], T('p5', '从前往后') - 0.3, { backgroundColor: '' });
  // 指针从前往后，行从页尾往前
  const ar1 = link(ov, [[ZX + 40 * Z, ZY + ZH + 26], [ZX + 300 * Z, ZY + ZH + 26]], 'accent'); const ar1t = capt(A, '指针从前往后', ZX + 120 * Z, ZY + ZH + 34); css(ar1t, { fontSize: '24px' });
  arrowIn(ar1, T('p5', '从前往后'), 0.6); show(ar1t, T('p5', '从前往后') + 0.2);
  rowsEls.forEach((r, i) => set(r, T('p5b') + i * 0.012, { autoAlpha: 1 })); sfx('tick', T('p5b'), { p: 0.4 });
  const ar2 = link(ov, [[X0 + W - 20, BY - 20], [X0 + W - 500, BY - 20]], 'accent'); const ar2t = capt(A, '行从页尾往前', X0 + W - 470, BY - 58); css(ar2t, { fontSize: '24px' });
  arrowIn(ar2, T('p5b', '往前'), 0.6); show(ar2t, T('p5b', '往前') + 0.2);
  [ar1, ar1t].forEach((e) => hide(e, T('p6') - 0.1, { d: 0.25 }));
  // 中间的空隙只剩 72 字节；一行连指针要 92 字节：放不下
  const zfree = h('div', 'abs', zoom); px(zfree, G.lower * Z, 0, (G.upper - G.lower) * Z, ZH - 6); css(zfree, { background: 'repeating-linear-gradient(90deg,#fff 0 10px,#eef3f7 10px 12px)' }); zfree.dataset.name = '空隙';
  const zfl = h('div', 'abs', zfree, `${G.upper - G.lower} 字节`); px(zfl, 60, 36); css(zfl, { font: '700 30px "Open Sans","Sans SC"', color: 'var(--warn)' });
  set(zfl, 0, { autoAlpha: 0 }); show(zfl, T('p6', '72'), { y: 8 });
  to(zfree, T('p6', '72'), { boxShadow: 'inset 0 0 0 5px #b8442f', duration: 0.3 }); sfx('tick', T('p6', '72'));
  const nr = h('div', 'abs', A, '下一行 88 + 指针 4 = 92 字节'); px(nr, ZX + G.lower * Z - 40, ZY - 84, 92 * Z, 64); nr.dataset.name = '下一行';
  css(nr, { background: 'var(--pg)', color: '#fff', font: '700 24px "Sans SC"', lineHeight: '64px', textAlign: 'center', whiteSpace: 'nowrap' });
  const tNo = T('p6b') - 0.3;
  set(nr, 0, { autoAlpha: 0 }); tl.fromTo(nr, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, tNo);
  tl.to(nr, { y: 80, duration: 0.35, ease: 'power2.in' }, tNo + 0.35);
  tl.to(nr, { y: -10, backgroundColor: '#b8442f', duration: 0.4, ease: 'power2.out' }, tNo + 0.72); sfx('error', tNo + 0.72, { g: 0.5 });
  const nf = tagEl(A, '放不下', ZX + G.lower * Z - 150, ZY - 74, 'warn'); css(nf, { fontSize: '28px' }); show(nf, tNo + 0.8, { x: 10, y: 0 });
  [nr, nf, ar2, ar2t].forEach((e) => hide(e, T('p7') - 0.1, { d: 0.3 }));
  hide(bl1, tNo - 0.3, { d: 0.2 }); show(bl1, T('p7'), { y: 0 });
  // 第 26 个指针：Alice 从第 5904 字节开始，占 82 字节
  hide(lpG, T('p7') - 0.1, { d: 0.3 });
  const lp26 = lpsEls[LP - 1], lp26x = ZX + (24 + (LP - 1) * 4 + 2) * Z, rx = X0 + G.aliceOff * k + 9;
  set(lp26, T('p7', '26'), { backgroundColor: 'var(--navy)' });
  const p26t = tagEl(A, `第 ${LP} 个指针`, lp26x - 70, ZY - 50, 'navy'); css(p26t, { fontSize: '24px' }); show(p26t, T('p7', '26'), { y: -8 });
  const a3 = curve(ov, [lp26x, ZY + 93], [rx, BY + 3], 'navy', { bend: (ZY + 93 + BY) / 2 }); arrowIn(a3, T('p7', '5904') - 0.4, 0.6);
  const offT = tagEl(A, `从第 ${G.aliceOff} 字节开始`, rx - 120, BY + BH + 40); css(offT, { fontSize: '24px' }); show(offT, T('p7', '5904'), { y: -8 }); sfx('pop', T('p7', '5904'));
  keyed(offT).at(T('p7b', '82'), { html: `从第 ${G.aliceOff} 字节开始 · 占 ${G.aliceLen} 字节` }); sfx('tick', T('p7b', '82'));
  // 为什么地址记的是第几个指针：行挪了，指针不动
  const demo = h('div', 'abs', A); px(demo, 120, 750, 1680, 230); demo.dataset.name = '指针不动的演示';
  const ct = h('div', 'abs mono', demo, `(${P},<b style="color:var(--navy)">${LP}</b>)`); px(ct, 0, 70); css(ct, { font: '700 48px "Mono"', color: 'var(--pg)' });
  const dp = h('div', 'node hl', demo, `指针 ${LP}`); px(dp, 300, 80, 170); css(dp, { height: '52px', lineHeight: '47px', fontSize: '26px' });
  const dr = h('div', 'tup new', demo, '2050  Alice  42'); px(dr, 1200, 80, 330); css(dr, { height: '52px', lineHeight: '48px', fontSize: '26px' });
  const ovd = overlay(demo); const dc = link(ovd, [[200, 106], [296, 106]], 'navy'); const da = path(ovd, 'M470,106 L1200,106', 'navy', { w: 3 });
  const not = h('div', 'abs', demo, `不是「第 ${G.aliceOff} 字节」`); px(not, 300, 156); css(not, { font: '600 26px "Sans SC"', color: 'var(--mute)', textDecoration: 'line-through' });
  const tD = T('p8');
  show(ct, tD, { x: -20 }); arrowIn(dc, T('p8', '指针'), 0.3); show(dp, T('p8', '指针'), { x: -20 }); show(dr, T('p8', '指针') + 0.15, { x: 20 }); arrowIn(da, T('p8', '指针') + 0.3, 0.4);
  show(not, T('p8', '字节'), { y: 8 }); sfx('tick', T('p8', '字节'));
  const move = T('p9', '挪动');
  to(dr, move, { x: -420, duration: 0.8, ease: 'power3.inOut' }); to(da, move, { attr: { d: 'M470,106 L780,106' }, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', move, { g: 0.4 });
  const stay = tagEl(demo, '指针还在原处', 300, 10, 'ok'); css(stay, { fontSize: '26px' }); show(stay, T('p9', '指针不会'), { y: 8 });
  const mem = tagEl(demo, `记住：第 ${LP} 个`, 0, 150, 'navy'); css(mem, { fontSize: '26px' }); show(mem, T('p10', '第几个'), { y: 8 }); sfx('tick', T('p10', '第几个'), { g: 0.4 });
  const found = tagEl(demo, '还是找得到', 790, 10, 'ok'); css(found, { fontSize: '26px' }); show(found, T('p10', '找得到'), { y: 8 }); sfx('chime', T('p10', '找得到'), { g: 0.6 });
  hide(offT, tD - 0.1, { d: 0.25 });

  // ── B：Alice 这一行的 82 个字节：行头 24 + 数据 58 ──
  hdoc(B, `Alice 这一行：${G.aliceLen} 字节`, 72, 128);
  const TF = tupleFields(), CW = 21, CX = 96, CY = 300, CH = 64;
  const segs = [['xmin', 4, 'h'], ['xmax', 4, 'h'], ['cid', 4, 'h'], ['t_ctid', 6, 'h'], ['标志', 6, 'h'], ['id', 4, 'd'], ['', 1, 'd'], ['name', 50, 'd'], ['', 1, 'd'], ['age', 2, 'd']];
  const strip = h('div', 'abs', B); px(strip, CX, CY, 82 * CW, CH); strip.dataset.name = 'Alice 的 82 字节';
  const cells = [];
  for (let i = 0; i < 82; i++) { const c = h('div', 'abs', strip); px(c, i * CW, 0, CW - 2, CH); css(c, { background: i < 24 ? 'var(--navy)' : 'var(--sky-lt)', border: i < 24 ? 'none' : '1.5px solid var(--pg)' }); cells.push(c); }
  const tS = T('p11') - 0.2;
  cells.forEach((c, i) => show(c, tS + i * 0.008, { y: -10, d: 0.2 })); sfx('whoosh', tS, { g: 0.3 });
  // 上方：两道括号；字段名
  const brace = (a, n, label, color, t) => { const b = h('div', 'abs', B); px(b, CX + a * CW, CY - 66, n * CW - 4, 5); css(b, { background: color }); const l = capt(B, label, CX + a * CW, CY - 108); css(l, { fontSize: '28px', color, fontWeight: 700 }); fromTo(b, t, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.5 }); show(l, t + 0.1, { y: 8 }); };
  brace(0, 24, '行头 · 24 字节', 'var(--navy)', T('p11', '行头')); sfx('thud', T('p11', '行头'), { g: 0.5 });
  brace(24, 58, '数据 · 58 字节', 'var(--pg)', T('p12', '数据')); sfx('thud', T('p12', '数据'), { g: 0.5, p: 0.3 });
  const rowG = glossBox(B, '行头', '<b>行头</b>：每个行版本前面的 24 字节，记着谁写的、谁作废的、新版本在哪', 96, 540, 1100);
  show(rowG, T('p11', '行头') + 0.3, { y: 10 }); hide(rowG, T('p12b') - 0.2, { d: 0.25 });
  let a = 0; const segX = {};
  segs.forEach(([name, n]) => { segX[name || ('_' + a)] = [CX + a * CW, n * CW]; if (name) { const l = capt(B, name, CX + a * CW + 2, CY - 40, 'cap mono'); css(l, { fontSize: '22px', color: a < 24 ? 'var(--navy)' : 'var(--pg)' }); show(l, a < 24 ? T('p11', '行头') + 0.4 : T('p12', '数据') + 0.4, { y: 6 }); } a += n; });
  // 数据：编号 2050、名字 Alice（加 45 个空格）、年龄 42，讲到哪个亮哪段
  const val = (name, html, t, dy = 0) => { const [x] = segX[name]; const v = capt(B, html, x, CY + CH + 12 + dy); css(v, { fontSize: '28px', color: 'var(--ink)' }); show(v, t, { y: -8 }); return v; };
  const nameLetters = 'Alice'.split('');
  nameLetters.forEach((ch, i) => { const c = cells[24 + 5 + i]; c.innerHTML = `<div style="font:700 24px var(--mono);color:var(--navy);text-align:center;line-height:${CH}px">${ch}</div>`; });
  // 编号、年龄也写进它们的格子（整数按字节存，数字横跨这几格），和名字的字母一样一眼看得到
  [[24, 4, '2050'], [80, 2, '42']].forEach(([f, n, v]) => { const d = h('div', 'abs', strip, v); px(d, f * CW, 0, n * CW - 2, CH); css(d, { font: '700 22px var(--mono)', color: 'var(--navy)', textAlign: 'center', lineHeight: (CH - 3) + 'px', zIndex: 2, background: 'var(--sky-lt)', border: '1.5px solid var(--pg)', boxSizing: 'border-box' }); d.dataset.name = v; set(d, T('p12b', v), { backgroundColor: '#dbe8f3' }); set(d, 0, { autoAlpha: 0 }); show(d, tS + f * 0.008 + 0.2, { y: 0, d: 0.2 }); });
  const tId = T('p12b', '2050'), tNm = T('p12b', 'Alice'), tAg = T('p12b', '42');
  val('id', '<b>2050</b>', tId); val('name', '<b>Alice</b>', tNm); val('age', '<b>42</b>', tAg);
  [[24, 4, tId], [29, 50, tNm], [80, 2, tAg]].forEach(([f, n, t]) => { for (let i = f; i < f + n; i++) set(cells[i], t, { backgroundColor: 'var(--hi)' }); sfx('tick', t, { g: 0.5 }); });
  // 名字不满 50 个字符：后面 45 个是空格
  for (let i = 24 + 5 + 5; i < 24 + 5 + 50; i++) set(cells[i], T('p12c', '空格'), { background: 'repeating-linear-gradient(135deg,#fff 0 6px,#dbe8f3 6px 12px)' });
  const pad = tagEl(B, '45 个空格（char(50) 补齐）', CX + 39 * CW, CY + CH + 56); css(pad, { fontSize: '26px' }); show(pad, T('p12c', '空格'), { y: -8 }); sfx('pop', T('p12c', '空格'), { g: 0.5 });
  // 行头三样：从格子里拿出来，做成三张卡
  const cards = [
    ['xmin', String(le32(TF.head[0][1])), TF.head[0][1], '写入这一行的事务号：Alice 注册时是 2809 号事务', 'p14', '事务号'],
    ['xmax', '0', TF.head[1][1], '作废这一行的事务号：谁删掉它、或改出新版本，就写谁；0 = 还没有谁作废', 'p15', '事务号'],
    ['t_ctid', `(${P},${LP})`, TF.head[3][1], '这一行最新版本的地址；没改过时，指着自己', 'p17', '地址'],
  ].map(([name, v, hex, desc, cue, w], i) => {
    const x = 96 + i * 580, c = h('div', 'abs', B); px(c, x, 560, 540, 240); css(c, { background: '#fff', border: '3px solid var(--navy)', borderLeft: '10px solid var(--navy)' });
    c.dataset.gloss = name; c.dataset.name = name + ' 卡';
    c.innerHTML = `<div style="position:absolute;left:24px;top:14px;font:700 32px var(--mono);color:var(--navy)">${name}</div>` +
      `<div style="position:absolute;left:24px;top:62px;font:700 56px var(--mono);color:var(--pg)">${v}</div>` +
      `<div class="hex" style="position:absolute;right:20px;top:24px;font:500 22px var(--mono);color:var(--ink2)">原样 ${hex}</div>` +
      `<div class="desc" style="position:absolute;left:24px;right:20px;top:140px;font:500 24px var(--sans);line-height:1.35;color:var(--ink)">${desc}</div>`;
    const [sx] = segX[name];
    tl.fromTo(c, { autoAlpha: 0, x: sx - x, y: CY - 560, scale: 0.3, transformOrigin: '0 0' }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('p13') + 0.2 + i * 0.25);
    to(c, T(cue, w), { borderColor: 'var(--pg)', duration: 0.2 }); sfx('tick', T(cue, w), { g: 0.6 });
    const dsc = c.querySelector('.desc'); set(dsc, 0, { autoAlpha: 0 }); show(dsc, T(cue) + 0.3, { y: 8, d: 0.4 });
    const hx = c.querySelector('.hex'); set(hx, 0, { autoAlpha: 0 }); show(hx, T(cue, w), { y: -6, d: 0.4 });
    const [a0, n0] = { xmin: [0, 4], xmax: [4, 4], t_ctid: [12, 6] }[name];
    for (let q = a0; q < a0 + n0; q++) set(cells[q], T(cue), { backgroundColor: '#b8442f' });
    if (i === 0) { const lead3 = tagEl(B, '行头里的三样', 96, 520, 'navy'); css(lead3, { fontSize: '24px' }); show(lead3, T('p13', '三样'), { y: 8 }); hide(lead3, T('p14') - 0.1, { d: 0.2 }); }
    return c;
  });
  sfx('whoosh', T('p13') + 0.2, { g: 0.35 });
  const n14 = tagEl(B, 'Alice 注册时的事务', 120, 810); css(n14, { fontSize: '26px' }); show(n14, T('p14b', '2809'), { y: -8 });
  const n15 = tagEl(B, '还没有谁作废它', 700, 810); css(n15, { fontSize: '26px' }); show(n15, T('p15b', '0'), { y: -8 });
  hide(pad, T('p13') - 0.1, { d: 0.25 });
  // 可见范围：一条事务号的区间，从 xmin 起、到 xmax 止；xmax 还是 0，就没有止点。第五到第八章沿用同一个画法（WaterRun 看 r7：「xmin和xmax是可见事务范围 min max 这个表述更好理解」）
  const RX0 = 214, RX1 = 1216, RY0 = 466, xminV = le32(TF.head[0][1]);
  const rk = h('div', 'abs', B); px(rk, RX0 - 2, RY0 - 12, 5, 68); css(rk, { background: 'var(--navy)' });
  const rkl = capt(B, `从 <b>xmin ${xminV}</b> 起`, 96, RY0 - 50); css(rkl, { fontSize: '24px' });
  const band = h('div', 'abs', B); px(band, RX0 + 3, RY0, RX1 - RX0 - 3, 44); band.dataset.name = '可见范围';
  css(band, { background: 'linear-gradient(90deg, var(--pg) 0%, var(--pg) 62%, rgba(51,103,145,.12) 100%)', transformOrigin: '0 50%' });
  const bandT = h('div', 'abs', band, '这一版能被看见的范围'); px(bandT, 300, 0); css(bandT, { font: '700 24px "Sans SC"', color: '#fff', lineHeight: '44px', whiteSpace: 'nowrap' });   // 左边留空：t_ctid 指回自己的那条线从这里穿过色带
  const bandR = h('div', 'abs', band, 'xmax = 0：没有止点 →'); px(bandR, RX1 - RX0 - 290, 0); css(bandR, { font: '700 24px "Sans SC"', color: 'var(--pg-dk)', lineHeight: '44px', whiteSpace: 'nowrap' });
  const tR0 = T('p16', 'xmin'), tR1 = T('p16', 'xmax');
  show(rk, tR0, { y: 0, d: 0.2 }); show(rkl, tR0, { y: 6 }); sfx('tick', tR0, { g: 0.5 });
  tl.fromTo(band, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: true }, tR1 - 0.1);
  show(bandT, T('p16', '范围') - 0.2, { y: 0, d: 0.3 }); show(bandR, tR1 + 0.5, { x: -10, d: 0.3 }); sfx('whoosh', tR1 - 0.1, { g: 0.3 });
  [rk, rkl, band].forEach((e) => to(e, Tend('p18') + 0.1, { opacity: 0.45, duration: 0.4 }));
  // t_ctid 指着自己：从卡片绕回这一行
  const ovB = overlay(B);
  const self = path(ovB, `M1290,558 C1290,535 440,548 440,${CY + CH + 2}`, 'navy', { w: 3 }); arrowIn(self, T('p17b', '自己') - 0.3, 0.7);   // 从 t_ctid 卡片走到行头的 t_ctid 字段下面，压在色带和卡片之间，不穿过字
  const selfT = tagEl(B, '指着自己', 1280, 810, 'navy'); css(selfT, { fontSize: '26px' }); show(selfT, T('p17b', '自己'), { y: -8 }); sfx('pop', T('p17b', '自己'), { g: 0.5 });
  // InnoDB 的行头：事务号与回滚指针
  const inn = h('div', 'abs', B); px(inn, 96, 860, 1400, 64); inn.dataset.name = 'InnoDB 的行头';
  inn.innerHTML = '<div style="position:absolute;left:0;top:0;height:64px;line-height:64px;padding:0 20px;font:700 26px var(--sans);color:var(--mute)">InnoDB 的行头</div>' +
    '<div class="s1" style="position:absolute;left:230px;top:4px;width:330px;height:56px;line-height:56px;background:#4f5c67;color:#fff;font:700 26px var(--sans);text-align:center">事务号 · 6 字节</div>' +
    '<div class="s2" style="position:absolute;left:570px;top:4px;width:400px;height:56px;line-height:56px;background:#5f6a73;color:#fff;font:700 26px var(--sans);text-align:center">回滚指针 · 7 字节</div>';
  wipe(inn, T('p18'), { dir: 'l', d: 0.5 }); sfx('pop', T('p18', '回滚'), { g: 0.5, p: -0.4 });
  const s1 = inn.querySelector('.s1'), s2 = inn.querySelector('.s2'); set(s1, 0, { autoAlpha: 0 }); set(s2, 0, { autoAlpha: 0 });
  show(s1, T('p18', '事务号'), { x: -20, y: 0 }); show(s2, T('p18', '回滚指针'), { x: -20, y: 0 });
  cards.forEach((c) => to(c, Tend('p18') + 0.1, { opacity: 0.45, duration: 0.4 }));
  [n14, n15, selfT].forEach((e) => hide(e, T('p18') - 0.1, { d: 0.25 }));
});
