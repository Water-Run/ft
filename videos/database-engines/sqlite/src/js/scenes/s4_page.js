// 04 一页里有什么：叶页 130 按字节真实比例铺成一条，旁边是文件格式文档那样的「偏移 | 大小 | 内容」表；
// 行号 2050 的指针写着 489，Alice 的 13 个字节；长文本溢出到 11 页的链。事实：J02、J03、J04。
scene('page', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const P = DATA.page130, X0 = 120, SW = 1680, k = SW / 1024, Y = 300, H = 110, bx = (o) => X0 + o * k;
  const title = pageTitle(W, '叶页 130：1024 个字节'); show(title, c0 + 0.1, { y: 8 });

  // p1：叶页 130，1024 字节
  const strip = h('div', 'abs', W); px(strip, X0, Y, SW, H); css(strip, { border: `2px solid ${K.ink}`, boxSizing: 'border-box' }); strip.dataset.name = '叶页 130'; strip.dataset.beat = 'fill';
  const sL = tx(W, '叶页 130 · 1024 字节，按真实比例', X0, Y - 44, { fs: 26 });
  const ticks = [[0, 'start'], [P.cell_content_start, 'middle'], [1024, 'end']].map(([o, a]) => tx(W, String(o), bx(o) - (a === 'end' ? 50 : a === 'middle' ? 16 : 0), Y + H + 8, { fs: 22, mono: true }));
  set(strip, 0, { autoAlpha: 0 }); tl.fromTo(strip, { autoAlpha: 1, scaleX: 0.08, scaleY: 1.4 }, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, T('p1', '130') - 0.3); sfx('whoosh', T('p1', '130') - 0.3, { g: 0.3 }); show(sL, T('p1', 'Alice') + 0.7, { y: 6 }); ticks.forEach((e, i) => show(e, T('p1', 'Alice') + 0.8 + i * 0.1, { y: 6 }));   // 一页小纸展开成按真实比例的长条
  const aRow = tx(W, '2050 · Alice · 42 岁', X0, 476, { fs: 28, css: { background: K.wheat, padding: '2px 12px' } }); set(aRow, 0, { autoAlpha: 0 }); show(aRow, T('p1', 'Alice'), { y: 8 });
  tl.fromTo(aRow, { x: 0, y: 0, scale: 1 }, { x: bx(489) - X0, y: Y + 30 - 476, scale: 0.45, duration: 0.8, ease: 'power2.in', immediateRender: false }, T('p1', '怎么放') - 0.4); gone(aRow, T('p1', '怎么放') + 0.4, 0.25);   // 飞进页里它住的位置（第 489 个字节）   // 上一章取出的那一行
  const seg = (o, n, fill, dashed) => { const e = h('div', 'abs', W); px(e, bx(o), Y + 2, n * k, H - 4); css(e, { background: fill || 'transparent', borderLeft: `1px solid ${K.ink}`, ...(dashed ? { border: `1.5px dashed ${K.ink}` } : {}), boxSizing: 'border-box' }); return e; };
  const tbl = docTable(W, [['偏移', 140], ['大小', 140], ['内容', 640]], [['0', '8', '页头：这是表的叶页，里面有 17 行'], ['8', '34', '17 个指针，每个 2 字节，按行号排好'], ['83', '941', '行：从页尾往前放'], ['42', '41', '空地']], X0, 466, { fs: 28 });
  tbl.t.dataset.name = '叶页 130 的格式';
  // p2：页头
  const sH = seg(0, P.header_bytes, '#d0d0d0'); set(sH, 0, { autoAlpha: 0 }); wipe(sH, T('p2', '页头') - 0.1, { dir: 'l', d: 0.3 });
  show(tbl.hr, T('p2') - 0.1, { y: 6 }); show(tbl.rs[0], T('p2', '页头'), { x: -10, y: 0 }); sfx('tick', T('p2', '页头'), { g: 0.4 });
  // p3：17 个指针
  const sP = seg(8, P.pointer_array[1] - 8, '#e6e6e6'); set(sP, 0, { autoAlpha: 0 }); wipe(sP, T('p3', '指针') - 0.1, { dir: 'l', d: 0.4 });
  show(tbl.rs[1], T('p3', '指针'), { x: -10, y: 0 }); sfx('tick', T('p3', '指针'), { g: 0.4 });
  // p4：行从页尾往前放
  const cellEls = P.cells.slice().sort((a, b) => b.off - a.off).map((c) => seg(c.off, c.bytes, OWN.u));
  // 页里的 17 行是 users 表的行：浅绿（和页图里 users 表的颜色一样）；Alice 那一行讲到 489 时变麦色
  cellEls.forEach((e) => { e.dataset.beat = 'fill'; });   // 「行往前长」：17 行一起浅青点亮
  // 「行从页尾往前放……行往前长」：17 行从页尾一行行往前长，一直长到这句念完
  const tC0 = T('p4', '页尾'), tC1 = T('p4', '行往前长') + 0.4;
  cellEls.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); show(e, tC0 + (tC1 - tC0) * i / (cellEls.length - 1), { x: 16, y: 0, d: 0.25 }); });
  show(tbl.rs[2], T('p4', '页尾'), { x: -10, y: 0 });
  gone(sL, T('p4') - 0.3, 0.3);
  // 「指针往后长，行往前长」：两支箭头各从自己那一头长出来——指针从页头往后，行从页尾往前（WaterRun 看 r7b：「指针 行往前长」要有动画）
  const grow1 = tx(W, '指针往后长', bx(8), Y - 62, { fs: 24, color: K.teal }), grow2 = tx(W, '行往前长', bx(1024), Y - 62, { fs: 24, color: K.teal });
  grow2.style.left = 'auto'; grow2.style.right = (1920 - bx(1024)) + 'px';
  const ga1 = line(ov, [[bx(8), Y - 18], [bx(330), Y - 18]], { w: 3, color: 'teal' }), ga2 = line(ov, [[bx(1024), Y - 18], [bx(520), Y - 18]], { w: 3, color: 'teal' });
  show(grow1, T('p4', '指针往后长') - 0.1, { y: 6 }); arrowIn(ga1, T('p4', '指针往后长'), 1.0); show(grow2, T('p4', '行往前长') - 0.1, { y: 6 }); arrowIn(ga2, T('p4', '行往前长'), 1.2);
  sfx('whoosh', T('p4', '页尾'), { g: 0.25 }); sfx('whoosh', T('p4', '指针往后长'), { g: 0.2 }); sfx('whoosh', T('p4', '行往前长'), { g: 0.2, p: -0.2 });
  // p5：中间剩下的 41 个字节，是空地
  const sF = seg(P.pointer_array[1], P.unallocated_bytes, null, true); set(sF, 0, { autoAlpha: 0 }); show(sF, T('p5', '空地'), { y: 0, d: 0.3 });
  show(tbl.rs[3], T('p5', '空地'), { x: -10, y: 0 });
  [grow1, grow2, ga1, ga2].forEach((e) => gone(e, T('p6') - 0.2, 0.3));

  // p6：行号 2050 的指针写着 489
  const slot = P.cells.findIndex((c) => c.rowid === 2050);
  const ptrs = h('div', 'abs', W); px(ptrs, 1130, 466); css(ptrs, { display: 'flex', gap: '3px' }); ptrs.dataset.name = '17 个指针';
  const pEls = P.pointers.map((v, i) => { const e = h('div', '', ptrs); css(e, { width: '36px', height: '44px', border: `1.5px solid ${K.ink}`, background: '#fff' }); return e; });
  const v489 = tx(W, '489', 1130 + slot * 39 + 36, 426, { fs: 24, mono: true, color: K.teal });
  const pL = tx(W, '指针：每个写着一行从第几个字节开始', 1130, 520, { fs: 22, color: K.dim });
  set(ptrs, 0, { autoAlpha: 0 }); wipe(ptrs, T('p6') - 0.1, { dir: 'l', d: 0.45 }); show(pL, T('p6') + 0.2, { y: 6 });
  set(pEls[slot], T('p6', '489'), { backgroundColor: K.wheat }); show(v489, T('p6', '489'), { y: 6 }); sfx('pop', T('p6', '489'), { g: 0.4 });
  const pe = pEls[slot], pX = 1130 + slot * 39 + 18;
  const toCell = path(ov, `M${pX},466 C${pX},406 ${bx(489) + 6},${Y + H + 70} ${bx(489) + 6},${Y + H + 2}`, 'teal', { w: 2.5, arrow: true });
  arrowIn(toCell, T('p6', '489') + 0.1, 0.6);
  // p7：Alice 这一行从第 489 个字节开始，一共 13 个字节
  const aCell = cellEls.find((e, i) => P.cells.slice().sort((a, b) => b.off - a.off)[i].rowid === 2050);
  set(aCell, T('p7', '489'), { backgroundColor: K.wheat });
  const t489 = tx(W, '489', bx(489) - 62, Y + H + 8, { fs: 22, mono: true, color: K.teal }); show(t489, T('p7', '489'), { y: 6 });
  // p8：先是长度和行号，再是 10 个字节的内容：Alice 和 42
  const hex = DATA.aliceCellHex.match(/../g), cw = 70, hx = 120, hy = 770;
  const hEls = hex.map((v, i) => { const e = h('div', 'abs', W, v); px(e, hx + i * cw, hy, cw, 50); css(e, { border: `1.5px solid ${K.ink}`, background: i >= 3 ? K.wheat : '#fff', fontFamily: 'Mono', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }); return e; });
  const hexL = tx(W, '从第 489 个字节起的 13 个字节', hx, hy - 38, { fs: 24, color: K.teal });   // 不画斜着拉下来的两条线：会穿过表格的字
  hEls.forEach((e, i) => show(e, T('p7', '13') + i * 0.04, { y: -10, d: 0.25 })); show(hexL, T('p7', '13') - 0.1, { y: 6 });
  const groups = [[0, 1, '长度'], [1, 3, '行号 2050'], [3, 7, '类型'], [7, 12, 'Alice'], [12, 13, '42']];
  const gEls = groups.map(([a, b, t]) => tx(W, t, hx + a * cw + 2, hy + 58, { fs: 22, color: K.dim }));
  gEls.forEach((e, i) => show(e, T('p8', i < 2 ? '长度' : '内容') + i * 0.1, { y: 6 }));
  [hEls[1], hEls[2]].forEach((e) => set(e, T('p9', '行号'), { borderColor: K.teal }));   // 只换颜色不换粗细：换粗细会把格里的字挤偏，倒着跳时还写不回原样
  const idL = tx(W, '行号就是 id：不必再存一遍', 1080, 780, { fs: 24, color: K.teal }); show(idL, T('p9', '行号'), { y: 6 });

  // p10–p12：一行太长：一万两千个字符的文本，叶页 542 只留开头 785 个字节，其余写进溢出页，串成一条链
  const tO = T('p10') - 0.2;
  dim(tbl.t, T('p7', '13') + 0.2, 0.25, 1, 0.5);
  [ptrs, pL, toCell, hexL, ...hEls, ...gEls, idL, v489].forEach((e) => gone(e, tO, 0.3)); goneFrom(tbl.t, tO, 0.25);
  // p10：一行比一页还长
  const big = h('div', 'abs', W, '一行'); px(big, X0, 466, SW, 48); css(big, { background: '#eeeeee', border: `2px solid ${K.ink}`, fontSize: '26px', display: 'flex', alignItems: 'center', paddingLeft: '14px', boxSizing: 'border-box' }); set(big, 0, { autoAlpha: 0 }); wipe(big, T('p10', '太长') - 0.2, { dir: 'l', d: 0.7 });
  // 放不下：这一行先铺满整页宽，再续出一截红色虚框——装不下的那部分（接下一句的溢出页）
  const nofit = h('div', 'abs', W, '……'); px(nofit, X0, 522, 760, 48); css(nofit, { background: '#fbeaea', border: `2px dashed ${K.red}`, fontSize: '26px', display: 'flex', alignItems: 'center', paddingLeft: '14px', boxSizing: 'border-box', color: K.red }); nofit.dataset.name = '装不下的部分';
  set(nofit, 0, { autoAlpha: 0 }); wipe(nofit, T('p10', '放不下') - 0.2, { dir: 'l', d: 0.6 }); sfx('error', T('p10', '放不下'), { g: 0.3 });
  // 放不下：这一行往页里挤，撞上页的下边被弹回来，页晃一下（和第 02 章第 18 行撞第 2 页同一个动作）
  tl.fromTo(big, { y: 0 }, { y: -100, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.in', immediateRender: false }, T('p10', '放不下') - 0.4);
  tl.fromTo(strip, { x: 0 }, { x: 10, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, T('p10', '放不下') - 0.15);
  // p11：装不下的那截先往下挪到溢出页那一排；整行收成一小段落进叶页 542（只留开头一小段）
  tl.fromTo(nofit, { x: 0, y: 0 }, { x: 360, y: 74, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T('p11', '叶页') - 0.4);
  tl.fromTo(big, { x: 0, y: 0, scaleX: 1, scaleY: 1 }, { x: 10, y: 144, scaleX: 214 / SW, scaleY: 1.25, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, T('p11', '一小段') - 0.35);
  big.style.transformOrigin = '0 0'; gone(big, T('p11', '一小段') + 0.4, 0.25); gone(nofit, T('p12', '溢出页') - 0.1, 0.3);
  const NOTE = DATA.note;
  const lp = h('div', 'abs', W); px(lp, 120, 566, 300, 120); css(lp, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); lp.dataset.name = '叶页 542'; lp.dataset.beat = 'fill';   // 大框用浅青底，不整块涂深青
  const lpT = tx(lp, `叶页 ${NOTE.page}`, 12, 6, { fs: 22, color: K.teal });
  const lpFill = h('div', 'abs', lp); px(lpFill, 10, 44, 280 * NOTE.local / 1024, 60); css(lpFill, { background: '#dddddd' });   // 这一段不是 Alice 的数据：灰，不用麦色
  const lpL = tx(W, `只留开头 ${NOTE.local} 个字节`, 120, 696, { fs: 24 });
  const long = tx(W, `一段 ${NOTE.payload - 5} 个字符的文本（连同记录头 ${NOTE.payload} 字节）`, 920, 526, { fs: 26 });
  show(long, T('p11', '一万两千'), { y: 6 }); wipe(lp, T('p11', '叶页'), { dir: 'l', d: 0.4 }); tl.fromTo(lpFill, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, immediateRender: true }, T('p11', '一小段')); show(lpL, T('p11', '一小段'), { y: 6 });
  const chain = NOTE.chain.map((c, i) => { const e = h('div', 'abs', W, String(c.page)); px(e, 480 + i * 120, 596, 90, 60); css(e, { border: `2px solid ${K.ink}`, background: '#fff', fontFamily: 'Mono', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }); return e; });
  const links = NOTE.chain.map((c, i) => line(ov, [[i ? 480 + i * 120 - 30 : 420, 626], [480 + i * 120, 626]], { w: 1.8 }));
  chain.forEach((e, i) => { show(e, T('p12', '溢出页') + i * 0.08, { x: -12, y: 0, d: 0.3 }); arrowIn(links[i], T('p12', '溢出页') - 0.05 + i * 0.08, 0.15); });
  const zero = tx(W, '最后一页写着下一页：0', 1380, 670, { fs: 22, color: K.dim }); show(zero, T('p12', '链') + 0.2, { y: 6 });
  const gO = gloss(W, '溢出页', '放不下的部分；每页开头写着下一页', 480, 726, 760); show(gO, T('p12', '溢出页') + 0.3, { y: 8 }); sfx('whoosh', T('p12', '溢出页'), { g: 0.3 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  // 焦点框：页头那 8 个字节、指针数组、空地；2050 的指针；Alice 这一行的 13 个字节，再逐段指长度、行号、内容、42
  focus(W, [[T('p2', '8'), sH, Tend('p2')], [T('p3', '指针'), sP, Tend('p3')], [T('p5', '空地'), sF, Tend('p5')], [T('p6', '2050'), pEls[slot], Tend('p6')], [T('p7', '489'), aCell], [T('p7', '13'), hEls, Tend('p7')],
    [T('p8', '长度'), hEls[0]], [T('p8', '行号'), [hEls[1], hEls[2]]], [T('p8', '内容'), hEls.slice(3)], [T('p8', '42'), hEls[12], Tend('p8')], [T('p9', '行号'), [hEls[1], hEls[2]], Tend('p9')], [T('p11', '一小段'), lpFill, Tend('p11')]], Tend('p12'));
  // 补音效（check.js 报的长空档）
  sfx('tick', T('p7', '13'), { g: 0.35 });
  sfx('pop', T('p8', '内容'), { g: 0.3 });
  sfx('tick', T('p9', '行号'), { g: 0.3 });
  sfx('whoosh', T('p11', '一万两千'), { g: 0.25 });
  sfx('tick', T('p11', '一小段'), { g: 0.3 });
  [[T('p6') - 0.2, 'Alice 这一行：13 个字节'], [T('p10') - 0.2, '一行太长：溢出页']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [760, 250, 1160, 420], zmax: 1.7 }], [T('p1', 'Alice') - 0.3, null, { rect: [110, 250, 1840, 900], d: 1.3 }], [T('p2') - 0.2, null, { rect: [110, 250, 1060, 720], d: 1.5 }], [T('p4') - 0.3, null, { rect: [110, 250, 1840, 900], d: 1.5 }], [T('p10') - 0.2, null, { rect: [110, 250, 1840, 600], d: 1.3 }], [T('p11', '叶页') - 0.6, null, { rect: [110, 250, 1840, 900], d: 1.3 }]]);
});
