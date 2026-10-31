// 03 一页之内（第 3 稿）：整章一个画面，不换屏。第 23 页的 8192 个字节摊成一张表（一行 128 个）：页头 → 88 个指针从前往后 → 行从页尾往前 →
// 两头之间的空闲空间（72 字节，从一行末尾接到下一行开头）→ 页头记着它的两头 → 再来一行放不下 → 第 26 个指针指到 Alice（P1–P4）；
// 然后 Alice 那一行从表里升起来，摊成两行十六进制（行头 24、数据 58），逐个字段标上名字和读出来的值（P5、P6）；
// 最后一条事务号的数轴：xmin 是起点，xmax 是终点，xmax 为 0 就一直延续到右边（WaterRun：「xmin -> xmax隶属事务范围 xmax =0 -> 正无穷」）
scene('page', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  drift(world, s, [], -1);
  const G = D.page23, [P, LP] = D.alice.ctid;
  const A = h('div', 'abs', world); px(A, 0, 0, 1920, 1080);
  const head1 = hdoc(A, `第 ${P} 页：8192 个字节，一行 128 个`, 72, 128);
  // ── 页的字节表 ──
  const GX = 128, GY = 236, bg = byteGrid(A, GX, GY), cw = bg.cw, lh = bg.lh;
  const all = (arr) => arr.flat();
  // 打开第 23 页：一张页卡从左下角放大成整张表的外框；8192 个字节一行行铺开
  // 章节一开头：第二章那排堆（47 页）在画面中间，第 23 页亮起；讲「打开第 23 页」时，它放大成整张字节表的外框
  const hs = heapStrip(A, 90, 470, { w: 33, gap: 4, h: 90, labels: [0, P, 46] }); appear(hs, s.start); sfx('tick', s.start + 0.8, { g: 0.4 });
  tl.fromTo(hs.pages[P], { backgroundColor: '#ffffff' }, { backgroundColor: '#336791', duration: 0.4, immediateRender: true }, s.start + 0.8);
  tl.fromTo(hs, { y: 0 }, { y: -12, duration: 2.2, ease: 'sine.inOut', immediateRender: true }, s.start + 0.2);
  gone(hs, T('p1') - 0.1, 0.4);
  const frm = h('div', 'abs', A); px(frm, GX - 6, GY - 6, 128 * cw + 12, 64 * lh + 12); css(frm, { border: '3px solid var(--pg)', transformOrigin: '0 0' }); frm.dataset.name = '第 23 页';
  const s23 = (33 + 6) / (128 * cw + 12), x23 = 90 + P * 37 - 3, y23 = 470 - 12 - 3;
  tl.fromTo(frm, { autoAlpha: 0, x: x23 - (GX - 6), y: y23 - (GY - 6), scale: s23 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, T('p1') - 0.3); sfx('whoosh', T('p1') - 0.3, { g: 0.35 });
  tl.fromTo(bg.el.firstChild, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: Math.max(1.2, T('p1b', '128') - T('p1') - 0.5), ease: 'none', immediateRender: true }, T('p1') + 0.5);   // 外框一落定就开始一行行铺开，铺到「一行 128 个」
  const tFill = T('p1') + 0.5, dFill = Math.max(1.2, T('p1b', '128') - T('p1') - 0.5);
  const lineN = capt(A, '', GX + 128 * cw + 8, GY + 10, 'cap mono'); css(lineN, { fontSize: '22px', color: 'var(--ink2)' });
  F((t) => { const k = clamp((t - tFill) / dFill); lineN.innerHTML = t < tFill || t > tFill + dFill ? '' : `${Math.max(1, Math.round(k * 64))} 行`; lineN.style.top = (GY + Math.max(0, Math.round(k * 64) - 1) * lh - 8) + 'px'; });
  const ruler = capt(A, '一行 128 个字节', GX + 128 * cw - 190, GY - 34); css(ruler, { fontSize: '22px' }); show(ruler, T('p1b', '128') - 0.1, { y: 6 });
  const off0 = capt(A, '0', GX - 30, GY - 4, 'cap mono'), off1 = capt(A, '8192', GX + 128 * cw + 8, GY + 64 * lh - 26, 'cap mono');   // 8192 标在表的右下角外侧，下面那根「行从页尾往前」的箭头不穿过它
  [off0, off1].forEach((e, i) => { css(e, { fontSize: '22px' }); show(e, i ? tFill + dFill + 0.1 : T('p1b', '摊开') + 0.3, { y: 0 }); });   // 8192 在铺满之后才标，不和行数计数叠在一起
  const ov = overlay(A);   // 箭头层放在字节表之上（字节表的底是白的，放在它下面会被盖住）
  [...bg.head, ...all(bg.ptrs), ...all(bg.rows.slice(1)), ...bg.gap].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  // 页头 24 字节
  const tH = T('p2', '页头') - 0.1;
  bg.head.forEach((e) => tl.fromTo(e, { autoAlpha: 0, scaleX: 0, transformOrigin: '0 50%' }, { autoAlpha: 1, scaleX: 1, duration: 0.35, immediateRender: false }, tH));
  const hL = tagEl(A, '页头 · 24 字节', GX, GY - 40, 'navy'); css(hL, { fontSize: '22px' }); show(hL, tH, { y: 6 }); sfx('tick', tH);
  // 88 个指针，从前往后一个个排开
  const tPt = T('p3', '项目指针') - 0.2;
  bg.ptrs.forEach((s4, i) => s4.forEach((e) => show(e, tPt + i * 0.014, { y: -4, d: 0.12 })));
  const pL = tagEl(A, '项目指针 · 每个 4 字节', GX + 24 * cw + 10, GY - 40); css(pL, { fontSize: '22px' }); pL.dataset.gloss = '项目指针'; show(pL, tPt, { x: -10 }); sfx('tick', tPt, { g: 0.5 });
  // 一个指针记着一行从第几字节开始、多长：第 1 个指针 → 页尾那一行
  const p1x = GX + 24 * cw + 2 * cw, p1y = GY + lh;
  const r1 = bg.rows[1], r1x = GX + (8104 % 128) * cw + 44 * cw, r1y = GY + Math.floor(8104 / 128) * lh;
  const a1 = curve(ov, [p1x, p1y], [r1x, r1y], 'accent', { w: 3, bend: GY + 330 });
  arrowIn(a1, T('p3b', '一行') - 0.2, 0.6);
  r1.forEach((e) => show(e, T('p3b', '一行') + 0.3, { y: 0, d: 0.2 }));
  bg.ptrs[0].forEach((e) => fromTo(e, T('p3b', '一行') - 0.2, { backgroundColor: '#699eca' }, { backgroundColor: '#193145', duration: 0.2 }));
  const p3L = capt(A, '一个指针 → 一行：从第几字节开始，有多长', GX + 360, GY + 330); css(p3L, { fontSize: '24px', color: 'var(--pg-dk)', fontWeight: 700 }); p3L.classList.add('ko');
  show(p3L, T('p3b', '记着') - 0.1, { y: 8 }); hide(p3L, T('p5') - 0.2, { d: 0.25 }); gone(a1, T('p5') - 0.2, 0.25);
  bg.ptrs[0].forEach((e) => fromTo(e, T('p5') - 0.2, { backgroundColor: '#193145' }, { backgroundColor: '#699eca', duration: 0.2, immediateRender: false }));
  keyed(pL).at(T('p3c', '88'), { html: `项目指针 · 每个 4 字节 · <b>${G.lps} 个</b>` });
  // 指针从前往后；行从页尾往前（一行行从右下角往回放）
  const arF = link(ov, [[GX + 30 * cw, GY + 3 * lh + 14], [GX + 80 * cw, GY + 3 * lh + 14]], 'accent'); arrowIn(arF, T('p5', '从前往后') - 0.2, 0.5);
  const arFL = capt(A, '指针从前往后 →', GX + 30 * cw, GY + 3 * lh + 22); css(arFL, { fontSize: '22px' }); arFL.classList.add('ko'); show(arFL, T('p5', '从前往后'), { y: 6 });
  const tR0 = T('p5b', '页尾') - 0.2;
  bg.rows.forEach((segs, i) => { if (i > 1) segs.forEach((e) => show(e, tR0 + (i - 2) * 0.016, { y: 0, d: 0.12 })); });
  const arB = link(ov, [[GX + 128 * cw - 20, GY + 64 * lh + 22], [GX + 128 * cw - 520, GY + 64 * lh + 22]], 'accent'); arrowIn(arB, T('p5b', '往前') - 0.2, 0.5);
  const arBL = capt(A, '← 行从页尾往前', GX + 128 * cw - 510, GY + 64 * lh + 28); css(arBL, { fontSize: '22px' }); show(arBL, T('p5b', '往前'), { y: -6 }); sfx('tick', tR0, { g: 0.4, p: 0.4 });
  [arF, arB].forEach((e) => gone(e, T('p6a') - 0.2, 0.25)); [arFL, arBL].forEach((e) => hide(e, T('p6a') - 0.2, { d: 0.25 }));
  // 两头往中间长：中间剩下的空闲空间——从第 2 行末尾接到第 3 行开头
  const tG = T('p6', '中间剩下') - 0.1;
  bg.gap.forEach((e) => tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, immediateRender: false }, tG)); sfx('pop', tG, { g: 0.5 });
  const gq = bg.pos(G.lower + 8);
  const gL = tagEl(A, '空闲空间', gq.x + 8, gq.y + 16, ''); css(gL, { fontSize: '24px', background: '#7d5500' }); show(gL, tG + 0.1, { y: 6 });
  keyed(gL).at(T('p6a', '72'), { html: `空闲空间：只剩 <b>${G.upper - G.lower}</b> 字节` }); sfx('tick', T('p6a', '72'));
  // 页头记着两个位置：空闲空间从哪开始（pd_lower 376），到哪结束（pd_upper 448）
  const hdF = (a, n) => { const d = h('div', 'abs', A); px(d, GX + a * cw - 1, GY - 2, n * cw + 2, lh + 2); css(d, { outline: '3px solid #e0a11b' }); set(d, 0, { autoAlpha: 0 }); return d; };
  const fLo = hdF(12, 2), fUp = hdF(14, 2);
  const lo = bg.pos(G.lower), up = bg.pos(G.upper);
  const aLo = curve(ov, [GX + 13 * cw, GY + lh], [lo.x + 2, lo.y + 2], 'navy', { w: 3, bend: GY + 120 }), aUp = curve(ov, [GX + 15 * cw, GY + lh], [up.x - 2, up.y + lh - 2], 'navy', { w: 3, bend: GY + 150 });
  const tPd = T('p2b', '两个位置') - 0.1;
  show(fLo, tPd, { y: 0, d: 0.2 }); show(fUp, tPd + 0.15, { y: 0, d: 0.2 });
  arrowIn(aLo, T('p2b', '开始') - 0.2, 0.5); arrowIn(aUp, T('p2b', '结束') - 0.2, 0.5);
  const loL = capt(A, `<b>pd_lower = ${G.lower}</b>　从这里开始`, GX + 200, GY + 120); const upL = capt(A, `<b>pd_upper = ${G.upper}</b>　到这里结束`, GX + 200, GY + 156);
  [loL, upL].forEach((e, i) => { css(e, { fontSize: '24px', color: '#7d5500' }); e.classList.add('ko'); show(e, T('p2b', i ? '结束' : '开始'), { x: -8 }); });
  [fLo, fUp, loL, upL].forEach((e) => hide(e, T('p6b') - 0.2, { d: 0.25 })); [aLo, aUp].forEach((e) => gone(e, T('p6b') - 0.2, 0.25));
  // 再来一行 88 字节 + 指针 4 字节 = 92：比空闲空间长，放不下
  const nr = h('div', 'abs', A, '新的一行 88 + 指针 4 = 92 字节'); px(nr, GX + 8 * cw, GY + 5 * lh, 92 * cw, 40);   // 压在空闲空间下面几行上，不挡页头、指针的说明 nr.dataset.name = '新的一行';
  css(nr, { background: 'var(--pg)', color: '#fff', font: '700 22px "Sans SC"', lineHeight: '40px', textAlign: 'center', whiteSpace: 'nowrap' });
  const tNo = T('p6b', '88') - 0.2;
  set(nr, 0, { autoAlpha: 0 }); tl.fromTo(nr, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.35, immediateRender: false }, tNo);
  tl.fromTo(nr, { backgroundColor: '#336791' }, { backgroundColor: '#b8442f', duration: 0.3, immediateRender: false }, T('p6b', '放不下') - 0.2); sfx('error', T('p6b', '放不下'), { g: 0.5 });
  keyed(nr).at(T('p6b', '放不下') - 0.1, { html: `92 字节 &gt; ${G.upper - G.lower} 字节：放不下` });
  hide(nr, T('p7') - 0.2, { d: 0.3 }); keyed(gL).at(T('p7') - 0.2, { html: `空闲空间 ${G.upper - G.lower} 字节` });
  // 第 26 个指针 → Alice：第 5904 字节起，82 字节
  const p26 = bg.ptrs[LP - 1], rA = bg.rows[LP], pq = bg.pos(24 + (LP - 1) * 4), rq = bg.pos(G.aliceOff);
  const t26 = T('p7', '26') - 0.1;
  p26.forEach((e) => fromTo(e, t26, { backgroundColor: '#699eca' }, { backgroundColor: '#193145', duration: 0.2 }));
  const l26 = tagEl(A, `第 ${LP} 个指针`, pq.x - 60, pq.y - 74, 'navy'); css(l26, { fontSize: '22px' }); show(l26, t26, { y: 6 }); sfx('tick', t26);
  const a26 = curve(ov, [pq.x + 2 * cw, pq.y + lh], [rq.x + 44 * cw, rq.y], 'navy', { w: 3.5, bend: GY + 380 }); arrowIn(a26, T('p7', '5904') - 0.4, 0.6);
  rA.forEach((e) => fromTo(e, T('p7', '5904') - 0.1, { backgroundColor: '#cfe0ee' }, { backgroundColor: '#336791', duration: 0.25 }));
  const aL = tagEl(A, `Alice：第 ${G.aliceOff} 字节起`, rq.x, rq.y + 22, 'warn'); css(aL, { fontSize: '22px' }); show(aL, T('p7', '5904'), { y: -6 }); sfx('pop', T('p7', '5904'));
  keyed(aL).at(T('p7b', '82') - 0.1, { html: `Alice：第 ${G.aliceOff} 字节起，占 ${G.aliceLen} 字节` });
  // 地址记的是第几个指针：行在页里挪了，指针不动，箭头跟过去
  const adr = capt(A, `地址 (${P}, ${LP})：第 ${LP} 个指针，不是第 ${G.aliceOff} 字节`, GX + 560, GY + 64 * lh + 16); css(adr, { fontSize: '26px', color: 'var(--navy)', fontWeight: 700 }); show(adr, T('p8', '第几个指针') - 0.1, { y: -6 });
  const tMv = T('p9', '挪动') - 0.2, tBk = Tend('p10') + 0.2;
  [...rA, aL].forEach((e) => { tl.fromTo(e, { x: 0, y: 0 }, { x: 30 * cw, y: -3 * lh, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tMv); tl.fromTo(e, { x: 30 * cw, y: -3 * lh }, { x: 0, y: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tBk); });
  const dA = `M${pq.x + 2 * cw},${pq.y + lh} C${pq.x + 2 * cw},${GY + 380} ${rq.x + 44 * cw},${GY + 380} ${rq.x + 44 * cw},${rq.y}`, dB = `M${pq.x + 2 * cw},${pq.y + lh} C${pq.x + 2 * cw},${GY + 380} ${rq.x + 74 * cw},${GY + 380} ${rq.x + 74 * cw},${rq.y - 3 * lh}`;
  tl.fromTo(a26, { attr: { d: dA } }, { attr: { d: dB }, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tMv); tl.fromTo(a26, { attr: { d: dB } }, { attr: { d: dA }, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tBk);
  sfx('whoosh', tMv, { g: 0.35 });
  const stay = tagEl(A, '指针还在原处', pq.x - 140, pq.y - 74, 'ok'); css(stay, { fontSize: '22px' }); show(stay, T('p9', '指针不会'), { y: 6 }); hide(stay, tBk, { d: 0.25 });
  hide(l26, T('p9', '指针不会') - 0.1, { d: 0.2 }); show(l26, tBk + 0.1, { y: 0 });
  const found = tagEl(A, '还是找得到', rq.x + 74 * cw - 60, rq.y - 3 * lh - 46, 'ok'); css(found, { fontSize: '22px' }); show(found, T('p10', '找得到'), { y: 6 }); hide(found, tBk, { d: 0.2 }); sfx('chime', T('p10', '找得到'), { g: 0.5 });
  // ── Alice 这一行从表里升起来，摊成两行十六进制：上面行头 24 字节，下面数据 58 字节 ──
  const tUp = Tend('p10') + 0.9;
  [bg.el, frm].forEach((e) => gone(e, tUp, 0.5));   // 字节表整张收起：留一层淡影，它的细条会穿过上面的十六进制和标注
  [l26, a26, adr, aL, gL, hL, pL, ruler, head1, off0, off1].forEach((e) => gone(e, tUp, 0.3));
  const head2 = hdoc(A, `Alice 这一行：${G.aliceLen} 字节`, 72, 128); set(head2, 0, { autoAlpha: 0 }); tl.fromTo(head2, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, tUp + 0.3);
  const HX = 90, HY0 = 300, HY1 = 520, CW = 30, CH = 52;
  const ghost = h('div', 'abs', A); px(ghost, rq.x, rq.y, 88 * cw, lh - 2); css(ghost, { background: 'var(--pg)', transformOrigin: '0 0' });
  set(ghost, 0, { autoAlpha: 0 });
  tl.fromTo(ghost, { autoAlpha: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 }, { x: HX - rq.x, y: HY1 - rq.y, scaleX: (58 * CW) / (88 * cw), scaleY: CH / (lh - 2), duration: 0.8, ease: 'power3.inOut', immediateRender: false }, tUp);
  gone(ghost, tUp + 0.85, 0.25); sfx('whoosh', tUp, { g: 0.4 });
  const hh = G.headerHex.match(/../g), dh = G.dataHex.match(/../g);
  const byteCell = (x, y, hex, bgc, fg) => { const c = h('div', 'abs', A, hex); px(c, x, y, CW - 3, CH); css(c, { background: bgc, color: fg, font: '700 22px var(--mono)', lineHeight: CH + 'px', textAlign: 'center' }); return c; };
  const hc = hh.map((b, i) => byteCell(HX + i * CW, HY0, b, 'var(--navy)', '#fff'));
  const dc = dh.map((b, i) => byteCell(HX + i * CW, HY1, b, 'var(--sky-lt)', 'var(--navy)'));
  [...hc, ...dc].forEach((c) => set(c, 0, { autoAlpha: 0 }));
  dc.forEach((c, i) => show(c, tUp + 0.75 + i * 0.006, { y: 0, d: 0.15 })); hc.forEach((c, i) => show(c, tUp + 0.85 + i * 0.012, { y: 8, d: 0.2 }));
  // 字段：括号 + 名字（在字节上方），读出来的值（在字节下方）
  const field = (y0, a, n, name, color, tName) => {
    const br = h('div', 'abs', A); px(br, HX + a * CW, y0 - 10, n * CW - 3, 5); css(br, { background: color, transformOrigin: '0 50%' });
    const lb = h('div', 'abs', A, name); px(lb, HX + a * CW, y0 - 42); css(lb, { font: '700 22px "Mono","Sans SC"', color, whiteSpace: 'nowrap' });
    tl.fromTo(br, { scaleX: 0 }, { scaleX: 1, duration: 0.4, immediateRender: true }, tName); set(lb, 0, { autoAlpha: 0 }); show(lb, tName + 0.1, { y: 6 });
    lb.dataset.gloss = name.split(' ')[0];   // 字段名就是这个术语的注解：名字标在它的字节上方，读出来的值在下方
    return { br, lb };
  };
  const val = (y0, a, html, t, color = 'var(--ink)') => { const v = h('div', 'abs', A, html); px(v, HX + a * CW, y0 + CH + 10); css(v, { font: '700 26px "Mono","Sans SC"', color, whiteSpace: 'nowrap' }); set(v, 0, { autoAlpha: 0 }); show(v, t, { y: -6 }); return v; };
  const tHd = T('p11', '行头') - 0.2, tDa = T('p12', '数据') - 0.2;
  const fH = field(HY0, 0, 24, '行头 · 24 字节', 'var(--navy)', tHd); sfx('thud', tHd, { g: 0.5 });
  const fD = field(HY1, 0, 58, '数据 · 58 字节', 'var(--pg)', tDa); sfx('thud', tDa, { g: 0.5, p: 0.3 });
  // 选区：讲到哪几个字节，选中哪几个（半透明黄底），在字节之间滑过去——观众的眼睛跟着字节走
  const sel = h('div', 'abs', A); css(sel, { background: 'rgba(255,200,60,.28)', border: '2px solid #e0a11b', pointerEvents: 'none', zIndex: 2 }); sel.dataset.name = '选区';
  const selAt = (line, a, n) => ({ x: HX + a * CW - 4, y: (line ? HY1 : HY0) - 4, width: n * CW + 5, height: CH + 8 });
  const selSteps = [[T('p11', '行头') - 0.3, 0, 0, 24], [T('p12', '数据') - 0.3, 1, 0, 58], [T('p12b', '2050') - 0.25, 1, 0, 4], [T('p12b', 'Alice') - 0.25, 1, 5, 5], [T('p12b', '42') - 0.25, 1, 56, 2],
    [T('p12c', '名字') - 0.2, 1, 10, 1], [T('p12c', '空格') - 0.3, 1, 10, 45], [T('p13', '两个事务号') - 0.25, 0, 0, 8], [T('p14', 'xmin') - 0.25, 0, 0, 4], [T('p15', 'xmax') - 0.25, 0, 4, 4],
    [T('p16c', '离不开') - 0.25, 0, 0, 8], [T('p17', 't_ctid') - 0.25, 0, 12, 6]];
  px(sel, 0, 0, 0, 0); set(sel, 0, { autoAlpha: 0 });
  selSteps.forEach(([t, line, a, n], i) => {
    const to2 = selAt(line, a, n);
    if (i === 0) { set(sel, t, { ...to2, autoAlpha: 1 }); return; }
    const [, l0, a0, n0] = selSteps[i - 1];
    tl.fromTo(sel, selAt(l0, a0, n0), { ...to2, duration: i === 6 ? 1.6 : 0.5, ease: i === 6 ? 'none' : 'power2.inOut', immediateRender: false }, t);
  });
  gone(sel, T('p17b') - 0.1, 0.3);
  [fH, fD].forEach((f, i) => { f.lb.style.fontSize = '26px'; hide(f.lb, (i ? T('p12b') : T('p14')) - 0.25, { d: 0.2 }); });
  // 数据：编号 2050（小端序 02 08 00 00）、名字 Alice（41 6c 69 63 65）、年龄 42（2a 00）
  const tId = T('p12b', '2050') - 0.1, tNm = T('p12b', 'Alice') - 0.1, tAg = T('p12b', '42') - 0.1;
  field(HY1, 0, 4, 'id', 'var(--pg)', tId); val(HY1, 0, '2050', tId);
  field(HY1, 5, 50, 'name', 'var(--pg)', tNm); val(HY1, 5, 'Alice', tNm);
  field(HY1, 56, 2, 'age', 'var(--pg)', tAg); val(HY1, 56, '42', tAg);
  [[0, 4, tId], [5, 5, tNm], [56, 2, tAg]].forEach(([a, n, t]) => { for (let i = a; i < a + n; i++) fromTo(dc[i], t, { backgroundColor: '#cfe0ee' }, { backgroundColor: '#ffe7a6', duration: 0.2 }); sfx('tick', t, { g: 0.5 }); });
  // 读出来的一行：每讲一列，就从字节里解出一格（像 MyISAM 一集右边的那列解码）
  const decL = capt(A, '读出来：', HX, HY1 + CH + 54); css(decL, { fontSize: '26px', fontWeight: 700, color: 'var(--navy)' }); set(decL, 0, { autoAlpha: 0 }); show(decL, tId - 0.1, { x: -8 });
  [['2050', tId, 'id'], ['Alice', tNm, 'name'], ['42', tAg, 'age']].forEach(([v, t, k], i) => {
    const c = h('div', 'abs', A, `<span style="font:600 20px var(--mono);color:#cfe0ee;margin-right:12px">${k}</span>${v}`); px(c, HX + 120 + i * 250, HY1 + CH + 44, 230, 60);
    css(c, { background: 'var(--pg)', color: '#fff', font: '800 34px var(--mono)', lineHeight: '60px', textAlign: 'center' }); c.dataset.name = '读出来的 ' + k;
    set(c, 0, { autoAlpha: 0 }); slam(c, t, { from: 1.35 });
  });
  const tSp = T('p12c', '空格') - 0.1;
  for (let i = 10; i < 55; i++) fromTo(dc[i], tSp + (i - 10) * 0.01, { backgroundColor: '#cfe0ee', color: '#193145' }, { backgroundColor: '#eef2f5', color: '#7c8790', duration: 0.2 });
  val(HY1, 20, '45 个空格：char(50) 补齐', tSp + 0.2, 'var(--ink2)');
  // 行头里最要紧的两个事务号：xmin、xmax
  const tX = T('p13', '两个事务号') - 0.1;
  for (let i = 8; i < 24; i++) fromTo(hc[i], tX, { opacity: 1 }, { opacity: 0.35, duration: 0.3 });
  for (let i = 0; i < 8; i++) fromTo(hc[i], tX, { backgroundColor: '#193145' }, { backgroundColor: '#b8442f', duration: 0.25 });
  sfx('tick', tX);
  field(HY0, 0, 4, 'xmin', '#b8442f', T('p14', 'xmin') - 0.2); field(HY0, 4, 4, 'xmax', '#b8442f', T('p15', 'xmax') - 0.2);
  val(HY0, 0, String(le32(hh.slice(0, 4).join(' '))), T('p14b', '2809') - 0.1, '#b8442f'); val(HY0, 4, '0', T('p15b', '0') - 0.1, '#b8442f');
  const n14 = capt(A, 'Alice 注册时的事务', HX, HY0 + CH + 46); css(n14, { fontSize: '22px', color: 'var(--ink2)' }); show(n14, T('p14b', '注册') - 0.1, { y: -6 });
  const n15 = capt(A, '还没有谁作废它', HX + 4 * CW + 150, HY0 + CH + 46); css(n15, { fontSize: '22px', color: 'var(--ink2)' }); show(n15, T('p15b', '还没有') - 0.1, { y: -6 });
  // 行头里的三样，各一张卡：从它的字节处升起，停在行头右边
  const hCard = (name, a, x, t, lines) => {
    const c = h('div', 'abs', A); px(c, x, 196, 300, 150); css(c, { background: '#fff', border: '3px solid #b8442f', borderLeft: '10px solid #b8442f' }); c.dataset.name = name + ' 卡';
    c.innerHTML = `<div style="position:absolute;left:16px;top:8px;font:800 30px var(--mono);color:#b8442f">${name}</div>` + lines.map((l, i) => `<div class="ln${i}" style="position:absolute;left:16px;top:${52 + i * 44}px;font:600 ${i ? 22 : 32}px 'Mono','Sans SC';color:var(--ink);white-space:nowrap">${l}</div>`).join('');
    const sx = HX + a * CW;
    tl.fromTo(c, { autoAlpha: 0, x: sx - x, y: HY0 - 196, scale: 0.35, transformOrigin: '0 0' }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', immediateRender: true }, t);
    return c;
  };
  const cXmin = hCard('xmin', 0, 880, T('p14', 'xmin') - 0.25, ['', '写入这个版本的事务']), cXmax = hCard('xmax', 4, 1200, T('p15', 'xmax') - 0.25, ['', '让这个版本作废的事务']);
  const v1 = cXmin.querySelector('.ln0'), v2 = cXmax.querySelector('.ln0');
  keyed(v1).at(T('p14b', '2809') - 0.1, { html: '2809' }); keyed(v2).at(T('p15b', '0') - 0.1, { html: '0（还没有）' });
  tl.fromTo(v1, { scale: 1.4, transformOrigin: '0 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, T('p14b', '2809') - 0.1);
  tl.fromTo(v2, { scale: 1.4, transformOrigin: '0 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, T('p15b', '0') - 0.1);
  // 事务号的数轴：号一个比一个大；xmin 2809 是起点，xmax 为 0 就没有终点，范围一直延到右边
  const AXY = 820, AX0 = 120, AX1 = 1800, X2809 = 560;
  const endMk = h('div', 'abs', A); px(endMk, AX1 - 260, AXY - 52, 24, 24); css(endMk, { border: '4px dashed #b8442f', borderRadius: '50%' }); const endL = capt(A, 'xmax：终点（还没有）', AX1 - 230, AXY - 54); css(endL, { fontSize: '22px', color: '#b8442f' });
  [endMk, endL].forEach((e) => { set(e, 0, { autoAlpha: 0 }); show(e, T('p15', '作废') - 0.2, { y: -6 }); hide(e, T('p16') - 0.1, { d: 0.25 }); });
  fly(A, 'xmax = 0', [HX + 4 * CW, HY0 + CH + 10], [AX1 - 300, AXY - 56], T('p15b', '0') - 0.3, { cls: 'warn', fs: 24, d: 0.7, sink: true });   // xmax 的 0 落到终点标记上：终点还没有
  const axis = h('div', 'abs', A); px(axis, AX0, AXY, AX1 - AX0, 4); css(axis, { background: 'var(--ink2)', transformOrigin: '0 50%' }); axis.dataset.name = '事务号的数轴';
  const ah = h('div', 'abs', A); px(ah, AX1 - 2, AXY - 8, 0, 0); css(ah, { borderLeft: '16px solid var(--ink2)', borderTop: '10px solid transparent', borderBottom: '10px solid transparent' });
  const axL = capt(A, '事务号：每个改数据的事务领一个，一个比一个大 →', AX0, AXY + 16); css(axL, { fontSize: '24px' });
  const ticks = [[220, '1'], [360, '2'], [X2809, '2809'], [900, '…'], [1240, '…']].map(([x, t]) => { const k = h('div', 'abs', A); px(k, x - 1, AXY - 8, 3, 20); css(k, { background: 'var(--ink2)' }); const l = capt(A, t, x - 14, AXY - 48, 'cap mono'); css(l, { fontSize: '22px' }); return [k, l]; });
  const tAx = T('p13b') - 0.1;
  tl.fromTo(axis, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', immediateRender: true }, tAx); set(ah, 0, { autoAlpha: 0 }); show(ah, tAx + 0.8, { x: -10, d: 0.2 }); show(axL, tAx + 0.3, { y: -6 });
  ticks.forEach(([k, l], i) => { set(k, 0, { autoAlpha: 0 }); set(l, 0, { autoAlpha: 0 }); if (i === 2) return; show(k, tAx + 0.5 + i * 0.5, { y: 0, d: 0.2 }); slam(l, tAx + 0.55 + i * 0.5, { from: 1.6 }); });
  fly(A, '事务号', [HX + 4 * CW - 40, HY0 + CH + 6], [AX0 + 60, AXY - 60], T('p13b', '领一个号') - 0.5, { cls: 'navy', fs: 24, d: 0.7, sink: true });
  const runner = h('div', 'abs', A); px(runner, AX0, AXY - 7, 18, 18); css(runner, { borderRadius: '50%', background: 'var(--pg)' }); set(runner, 0, { autoAlpha: 0 });
  tl.fromTo(runner, { autoAlpha: 1, x: 0 }, { x: AX1 - AX0 - 30, duration: Math.max(1.5, Tend('p13b') - tAx), ease: 'none', immediateRender: false }, tAx + 0.3); gone(runner, Tend('p13b') + 0.3, 0.3);
  const tMk = T('p14b', '2809') - 0.1;
  fly(A, '2809', [HX + 4, HY0 + CH + 10], [X2809 - 34, AXY - 50], tMk - 0.7, { cls: 'warn', fs: 24, d: 0.6, sink: true });   // xmin 的值落到数轴上，成为起点
  show(ticks[2][0], tMk, { y: 0, d: 0.2 }); show(ticks[2][1], tMk, { y: 0 }); css(ticks[2][1], { color: '#b8442f', fontWeight: 700 });
  // 范围：从 xmin 起，到 xmax 止；xmax 为 0，一直延到右边
  const band = h('div', 'abs', A); px(band, X2809, AXY - 92, AX1 - X2809, 40); band.dataset.name = '可见范围';
  css(band, { background: 'linear-gradient(90deg, var(--pg) 0%, var(--pg) 72%, rgba(51,103,145,.12) 100%)', overflow: 'hidden' });
  const bandT = h('div', 'abs', band, '这一版能被看见的范围'); px(bandT, 18, 0); css(bandT, { font: '700 24px "Sans SC"', color: '#fff', lineHeight: '40px', whiteSpace: 'nowrap' });
  const inf = h('div', 'abs', A, 'xmax = 0：没有尽头 → ∞'); px(inf, AX1 - 330, AXY - 132); css(inf, { font: '700 24px "Sans SC"', color: 'var(--pg-dk)', whiteSpace: 'nowrap' });
  const BW = AX1 - X2809;   // 长度用 width 动画，不用 scaleX（scaleX 会把条里的字一起压扁）
  tl.fromTo(band, { autoAlpha: 1, width: 0 }, { width: BW * 0.45, duration: Math.max(0.6, T('p16b') - T('p16', 'xmin')), ease: 'power1.out', immediateRender: true }, T('p16', 'xmin') - 0.1);   // 整句都在长
  tl.fromTo(band, { width: BW * 0.45 }, { width: BW, duration: Math.max(1.5, T('p16b', '没有尽头') - T('p16b') - 0.2), ease: 'power1.inOut', immediateRender: false }, T('p16b') + 0.1);
  set(bandT, 0, { autoAlpha: 0 }); slam(bandT, T('p16', '范围') - 0.2, { from: 1.3 }); set(inf, 0, { autoAlpha: 0 }); slam(inf, T('p16b', '没有尽头') - 0.2, { from: 1.35 });
  sfx('whoosh', T('p16b') + 0.1, { g: 0.3 });
  const infG = h('div', 'abs', A, '∞'); px(infG, AX1 + 14, AXY - 58); css(infG, { font: '800 64px "Open Sans"', color: 'var(--pg)' }); set(infG, 0, { autoAlpha: 0 }); slam(infG, T('p16b', '延续') - 0.2, { from: 1.6 });
  const uses = tagEl(A, '改、删、并发：都看这两个数', HX + 12 * CW + 20, HY0 + CH + 40, 'navy'); css(uses, { fontSize: '22px' }); slam(uses, T('p16c', '离不开') - 0.2, { from: 1.3 }); hide(uses, T('p17') - 0.1, { d: 0.25 });
  // t_ctid：这一行最新版本的地址；没改过，指着自己
  const tCt = T('p17', 't_ctid') - 0.2;
  for (let i = 12; i < 18; i++) { fromTo(hc[i], tCt, { opacity: 0.35 }, { opacity: 1, duration: 0.2, immediateRender: false }); fromTo(hc[i], tCt, { backgroundColor: '#193145' }, { backgroundColor: '#336791', duration: 0.2 }); }
  field(HY0, 12, 6, 't_ctid', 'var(--pg)', tCt);
  const cCt = hCard('t_ctid', 12, 1520, tCt, [`(${P},${LP})`, '最新版本的地址']); css(cCt, { borderColor: '#336791' }); val(HY0, 12, `(${P},${LP})`, T('p17', '地址') - 0.1, 'var(--pg)');
  const self = path(ov, `M${HX + 15 * CW},${HY0 + CH + 46} C${HX + 15 * CW + 240},${HY0 + CH + 140} ${HX + 26 * CW},${HY0 + CH + 40} ${HX + 24.5 * CW},${HY0 + CH / 2}`, 'navy', { w: 3 }); arrowIn(self, T('p17b', '自己') - 0.3, 0.6);
  const selfL = tagEl(A, '指着自己', HX + 24 * CW + 30, HY0 + CH + 30, 'navy'); css(selfL, { fontSize: '22px' }); show(selfL, T('p17b', '自己'), { y: -6 }); sfx('pop', T('p17b', '自己'), { g: 0.5 });
  // InnoDB 的行头：事务号与回滚指针（右上一条对照）
  const inn = h('div', 'abs', A); px(inn, 1060, 300, 760, 64); inn.dataset.name = 'InnoDB 的行头';
  inn.innerHTML = '<div style="position:absolute;left:0;top:0;height:64px;line-height:64px;font:700 24px var(--sans);color:var(--mute)">InnoDB 的行头</div>' +
    '<div class="s1" style="position:absolute;left:190px;top:6px;width:250px;height:52px;line-height:52px;background:#4f5c67;color:#fff;font:700 24px var(--sans);text-align:center">事务号 · 6 字节</div>' +
    '<div class="s2" style="position:absolute;left:450px;top:6px;width:300px;height:52px;line-height:52px;background:#5f6a73;color:#fff;font:700 24px var(--sans);text-align:center">回滚指针 · 7 字节</div>';
  [cXmin, cXmax, cCt].forEach((c) => gone(c, T('p18') - 0.3, 0.3));
  wipe(inn, T('p18') - 0.1, { dir: 'l', d: 0.5 });
  const s1 = inn.querySelector('.s1'), s2 = inn.querySelector('.s2'); set(s1, 0, { autoAlpha: 0 }); set(s2, 0, { autoAlpha: 0 });
  show(s1, T('p18', '事务号') - 0.1, { x: -20, y: 0 });
  // 章末收成一张页卡淡去，下一章从堆说起
  css(A, { transformOrigin: '960px 520px' }); tl.fromTo(A, { scale: 1, autoAlpha: 1 }, { scale: 0.2, autoAlpha: 0, duration: 1.4, ease: 'power2.in', immediateRender: false }, Tend('p18') + 0.4); sfx('whoosh', Tend('p18') + 0.5, { g: 0.3 });
  show(s2, T('p18', '回滚指针') - 0.1, { x: -20, y: 0 }); sfx('pop', T('p18', '回滚'), { g: 0.5, p: -0.4 });
});
