// 04 一页里有什么：叶页 130 按字节真实比例铺成一条，旁边是文件格式文档那样的「偏移 | 大小 | 内容」表；
// 行号 2050 的指针写着 489，Alice 的 13 个字节；长文本溢出到 11 页的链。事实：J02、J03、J04。
scene('page', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const P = DATA.page130, X0 = 120, SW = 1680, k = SW / 1024, Y = 300, H = 64, bx = (o) => X0 + o * k;
  const title = pageTitle(W, '叶页 130：1024 个字节'); show(title, c0 + 0.1, { y: 8 });

  // p1：叶页 130，1024 字节
  const strip = h('div', 'abs', W); px(strip, X0, Y, SW, H); css(strip, { border: `2px solid ${K.ink}`, boxSizing: 'border-box' }); strip.dataset.name = '叶页 130'; strip.dataset.beat = 'fill';
  const sL = tx(W, '叶页 130 · 1024 字节，按真实比例', X0, Y - 44, { fs: 26 });
  const ticks = [[0, 'start'], [P.cell_content_start, 'middle'], [1024, 'end']].map(([o, a]) => tx(W, String(o), bx(o) - (a === 'end' ? 50 : a === 'middle' ? 16 : 0), Y + H + 8, { fs: 22, mono: true }));
  wipe(strip, T('p1', '130') - 0.2, { dir: 'l', d: 0.5 }); show(sL, T('p1', '130'), { y: 6 }); ticks.forEach((e, i) => show(e, T('p1', '130') + 0.2 + i * 0.1, { y: 6 }));
  const aRow = tx(W, '2050 · Alice · 42 岁', X0, 430, { fs: 28, css: { background: K.wheat, padding: '2px 12px' } }); set(aRow, 0, { autoAlpha: 0 }); show(aRow, T('p1', 'Alice'), { y: 8 }); gone(aRow, T('p2') - 0.3, 0.3);   // 上一章取出的那一行
  const seg = (o, n, fill, dashed) => { const e = h('div', 'abs', W); px(e, bx(o), Y + 2, n * k, H - 4); css(e, { background: fill || 'transparent', borderLeft: `1px solid ${K.ink}`, ...(dashed ? { border: `1.5px dashed ${K.ink}` } : {}), boxSizing: 'border-box' }); return e; };
  const tbl = docTable(W, [['偏移', 140], ['大小', 140], ['内容', 640]], [['0', '8', '页头：这是表的叶页，里面有 17 行'], ['8', '34', '17 个指针，每个 2 字节，按行号排好'], ['83', '941', '行：从页尾往前放'], ['42', '41', '空地']], X0, 420, { fs: 26 });
  tbl.t.dataset.name = '叶页 130 的格式';
  // p2：页头
  const sH = seg(0, P.header_bytes, '#d0d0d0'); set(sH, 0, { autoAlpha: 0 }); wipe(sH, T('p2', '页头') - 0.1, { dir: 'l', d: 0.3 });
  show(tbl.hr, T('p2') - 0.1, { y: 6 }); show(tbl.rs[0], T('p2', '页头'), { x: -10, y: 0 }); sfx('tick', T('p2', '页头'), { g: 0.4 });
  // p3：17 个指针
  const sP = seg(8, P.pointer_array[1] - 8, '#e6e6e6'); set(sP, 0, { autoAlpha: 0 }); wipe(sP, T('p3', '指针') - 0.1, { dir: 'l', d: 0.4 });
  show(tbl.rs[1], T('p3', '指针'), { x: -10, y: 0 }); sfx('tick', T('p3', '指针'), { g: 0.4 });
  // p4：行从页尾往前放
  const cellEls = P.cells.slice().sort((a, b) => b.off - a.off).map((c) => seg(c.off, c.bytes, '#ffffff'));
  cellEls.forEach((e) => { e.dataset.beat = 'fill'; });   // 「行往前长」：17 行一起浅青点亮
  cellEls.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); show(e, T('p4', '页尾') + i * 0.06, { x: 16, y: 0, d: 0.25 }); });
  show(tbl.rs[2], T('p4', '页尾'), { x: -10, y: 0 });
  gone(sL, T('p4') - 0.3, 0.3);
  const grow1 = tx(W, '指针往后长 →', bx(8), Y - 40, { fs: 22, color: K.dim }), grow2 = tx(W, '← 行往前长', bx(700), Y - 40, { fs: 22, color: K.dim });
  show(grow1, T('p4', '指针往后长'), { y: 6 }); show(grow2, T('p4', '行往前长'), { y: 6 }); sfx('whoosh', T('p4', '页尾'), { g: 0.25 });
  // p5：中间剩下的 41 个字节，是空地
  const sF = seg(P.pointer_array[1], P.unallocated_bytes, null, true); set(sF, 0, { autoAlpha: 0 }); show(sF, T('p5', '41'), { y: 0, d: 0.3 });
  show(tbl.rs[3], T('p5', '41'), { x: -10, y: 0 });
  [grow1, grow2].forEach((e) => gone(e, T('p6') - 0.2, 0.3));

  // p6：行号 2050 的指针写着 489
  const slot = P.cells.findIndex((c) => c.rowid === 2050);
  const ptrs = h('div', 'abs', W); px(ptrs, 1130, 420); css(ptrs, { display: 'flex', gap: '3px' }); ptrs.dataset.name = '17 个指针';
  const pEls = P.pointers.map((v, i) => { const e = h('div', '', ptrs); css(e, { width: '36px', height: '44px', border: `1.5px solid ${K.ink}`, background: '#fff' }); return e; });
  const v489 = tx(W, '489', 1130 + slot * 39 + 36, 380, { fs: 24, mono: true, color: K.teal });
  const pL = tx(W, '指针：每个写着一行从第几个字节开始', 1130, 474, { fs: 22, color: K.dim });
  set(ptrs, 0, { autoAlpha: 0 }); wipe(ptrs, T('p6') - 0.1, { dir: 'l', d: 0.45 }); show(pL, T('p6') + 0.2, { y: 6 });
  set(pEls[slot], T('p6', '489'), { backgroundColor: K.wheat }); show(v489, T('p6', '489'), { y: 6 }); sfx('pop', T('p6', '489'), { g: 0.4 });
  const pe = pEls[slot], pX = 1130 + slot * 39 + 18;
  const toCell = path(ov, `M${pX},420 C${pX},360 ${bx(489) + 6},${Y + H + 70} ${bx(489) + 6},${Y + H + 2}`, 'teal', { w: 2.5, arrow: true });
  arrowIn(toCell, T('p6', '489') + 0.1, 0.6);
  // p7：Alice 这一行从第 489 个字节开始，一共 13 个字节
  const aCell = cellEls.find((e, i) => P.cells.slice().sort((a, b) => b.off - a.off)[i].rowid === 2050);
  set(aCell, T('p7', '489'), { backgroundColor: K.wheat });
  const t489 = tx(W, '489', bx(489) - 62, Y + H + 8, { fs: 22, mono: true, color: K.teal }); show(t489, T('p7', '489'), { y: 6 });
  // p8：先是长度和行号，再是 10 个字节的内容：Alice 和 42
  const hex = DATA.aliceCellHex.match(/../g), cw = 70, hx = 120, hy = 724;
  const hEls = hex.map((v, i) => { const e = h('div', 'abs', W, v); px(e, hx + i * cw, hy, cw, 50); css(e, { border: `1.5px solid ${K.ink}`, background: i >= 3 ? K.wheat : '#fff', fontFamily: 'Mono', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }); return e; });
  const hexL = tx(W, '从第 489 个字节起的 13 个字节', hx, hy - 38, { fs: 24, color: K.teal });   // 不画斜着拉下来的两条线：会穿过表格的字
  hEls.forEach((e, i) => show(e, T('p7', '13') + i * 0.04, { y: -10, d: 0.25 })); show(hexL, T('p7', '13') - 0.1, { y: 6 });
  const groups = [[0, 1, '长度'], [1, 3, '行号 2050'], [3, 7, '类型'], [7, 12, 'Alice'], [12, 13, '42']];
  const gEls = groups.map(([a, b, t]) => tx(W, t, hx + a * cw + 2, hy + 58, { fs: 22, color: K.dim }));
  gEls.forEach((e, i) => show(e, T('p8', i < 2 ? '长度' : '内容') + i * 0.1, { y: 6 }));
  [hEls[1], hEls[2]].forEach((e) => set(e, T('p9', '行号'), { borderColor: K.teal }));   // 只换颜色不换粗细：换粗细会把格里的字挤偏，倒着跳时还写不回原样
  const idL = tx(W, '行号就是 id：不必再存一遍', 1080, 734, { fs: 24, color: K.teal }); show(idL, T('p9', '行号'), { y: 6 });

  // p10–p12：一行太长：一万两千个字符的文本，叶页 542 只留开头 785 个字节，其余写进溢出页，串成一条链
  const tO = T('p10') - 0.2;
  [tbl.t, ptrs, pL, toCell, hexL, ...hEls, ...gEls, idL, v489].forEach((e) => gone(e, tO, 0.3));
  // p10：一行比一页还长
  const big = h('div', 'abs', W, '一行'); px(big, X0, 420, 1780, 48); css(big, { background: K.wheat, border: `2px solid ${K.ink}`, fontSize: '26px', display: 'flex', alignItems: 'center', paddingLeft: '14px', boxSizing: 'border-box' }); set(big, 0, { autoAlpha: 0 }); wipe(big, T('p10', '太长') - 0.2, { dir: 'l', d: 0.7 });
  const nofit = errBox(W, '一页放不下', 1380, 490, 26); set(nofit, 0, { autoAlpha: 0 }); slam(nofit, T('p10', '放不下'), { from: 1.3 }); sfx('error', T('p10', '放不下'), { g: 0.3 });
  [big, nofit].forEach((e) => gone(e, T('p11') - 0.2, 0.3));
  const NOTE = DATA.note;
  const lp = h('div', 'abs', W); px(lp, 120, 520, 300, 120); css(lp, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); lp.dataset.name = '叶页 542'; lp.dataset.beat = 'fill';   // 大框用浅青底，不整块涂深青
  const lpT = tx(lp, `叶页 ${NOTE.page}`, 12, 6, { fs: 22, color: K.teal });
  const lpFill = h('div', 'abs', lp); px(lpFill, 10, 44, 280 * NOTE.local / 1024, 60); css(lpFill, { background: K.wheat });
  const lpL = tx(W, `只留开头 ${NOTE.local} 个字节`, 120, 650, { fs: 24 });
  const long = tx(W, `一段 ${NOTE.payload - 5} 个字符的文本（连同记录头 ${NOTE.payload} 字节）`, 120, 460, { fs: 26 });
  show(long, T('p11', '一万两千'), { y: 6 }); wipe(lp, T('p11', '叶页'), { dir: 'l', d: 0.4 }); tl.fromTo(lpFill, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, immediateRender: true }, T('p11', '785')); show(lpL, T('p11', '785'), { y: 6 });
  const chain = NOTE.chain.map((c, i) => { const e = h('div', 'abs', W, String(c.page)); px(e, 480 + i * 120, 550, 90, 60); css(e, { border: `2px solid ${K.ink}`, background: '#fff', fontFamily: 'Mono', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }); return e; });
  const links = NOTE.chain.map((c, i) => line(ov, [[i ? 480 + i * 120 - 30 : 420, 580], [480 + i * 120, 580]], { w: 1.8 }));
  chain.forEach((e, i) => { show(e, T('p12', '溢出页') + i * 0.08, { x: -12, y: 0, d: 0.3 }); arrowIn(links[i], T('p12', '溢出页') - 0.05 + i * 0.08, 0.15); });
  const zero = tx(W, '最后一页写着下一页：0', 1380, 624, { fs: 22, color: K.dim }); show(zero, T('p12', '链') + 0.2, { y: 6 });
  const gO = gloss(W, '溢出页', '放不下的部分一页接一页；每页开头 4 个字节写着下一页的页号', 480, 680, 760); show(gO, T('p12', '溢出页') + 0.3, { y: 8 }); sfx('whoosh', T('p12', '溢出页'), { g: 0.3 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  const zNote = zone(W, 100, 440, 1100, 240);
  beats([[T('p1', '130'), [sL, strip]], [T('p1', 'Alice'), aRow], [T('p1', '怎么放'), strip], [T('p2'), tbl.rs[0]], [T('p2', '17'), tbl.hr], [T('p3'), tbl.rs[1]], [T('p3', '两个字节'), sP], [T('p3', '按行号'), tbl.rs[1].children[2]], [T('p4'), tbl.rs[2]], [T('p4', '行往前长'), [grow2, ...cellEls]], [T('p5'), tbl.rs[3]], [T('p6'), ptrs], [T('p6', '2050'), pEls[slot]], [T('p6', '489'), pL], [T('p7'), strip], [T('p7', '489'), t489], [T('p7', '13'), hEls], [T('p8', '长度'), hEls[0]], [T('p8', '行号'), [hEls[1], hEls[2]]], [T('p8', '内容'), hEls.slice(3)], [T('p8', '42'), hEls[12]], [T('p9'), idL], [T('p10', '放不下'), big], [T('p11', '一万两千'), long], [T('p11', '叶页'), lp], [T('p11', '785'), lpL], [(T('p11') + Tend('p11')) / 2 + 0.4, [lpFill, lpL]], [T('p12'), gO], [T('p2') + 1.17, [strip, tbl.rs[0]], 1], [T('p3') + 3.62, [tbl.t, strip], 1], [T('p8') + 4.33, hEls, 1], [T('p9') + 1.88, [idL, strip], 1], [T('p11') + 4.68, [lp, long], 1], [T('p11') + 4.68, zNote, 1]], Tend('p12'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('p7', '13'), { g: 0.35 });
  sfx('pop', T('p8', '内容'), { g: 0.3 });
  sfx('tick', T('p9', '行号'), { g: 0.3 });
  sfx('whoosh', T('p11', '一万两千'), { g: 0.25 });
  sfx('tick', T('p11', '785'), { g: 0.3 });
  [[T('p6') - 0.2, 'Alice 这一行：13 个字节'], [T('p10') - 0.2, '一行太长：溢出页']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 250, 1840, 900] }]]);
});
