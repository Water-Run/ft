// 第 05 章 查（第 4 轮重做）：左边姓名索引（15 个叶页），右边集合树（4 个叶页），下面是 explain 的两行实测。
// 没有索引：一条扫描线把集合树的叶页从头扫到尾，看过的文档数涨到 4096（COLLSCAN）→ 有了索引：索引里的键按字节排序，
// Alice 的 41 排在别人的 55 前面，是第一项；从根页走到第一个叶页，键里接着 2050 → 拿着 2050 回到集合树：根页的分界一个个比过，
// 落在第二个叶页，取出 47 个字节（FETCH ← IXSCAN：1 个键、1 份文档）。
// 事实：C01（COLLSCAN 4096 → 1）、B05（集合树按 RecordId）、C06（键按字节比较：3c 41… / 3c 55…）、B06（姓名索引 15 个叶页，Alice 第一项，键末尾 2050）、
//       B03（分界 1225 2449 3124）、C02（FETCH ← IXSCAN，1、1）、C05（从根页往下找）。
scene('find', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '05 查');

  // ── 右：集合树（B03） ──
  const CR = { x: 1010, w: 790 };
  const cTitle = tg(world, CR.x, 214, '集合树 · 按 RecordId 排', 'b'); css(cTitle, { fontSize: '32px' });
  const cRoot = h('div', 'abs', world); px(cRoot, 1130, 270, 560, 84); css(cRoot, { background: K.ink, borderRadius: '10px' });
  const SEP = ['1', '1225', '2449', '3124'];
  const sepEls = SEP.map((k, i) => { const e = h('div', 'abs', cRoot, k); css(e, { left: 18 + i * 136 + 'px', top: '18px', width: '124px', height: '48px', borderRadius: '6px', font: '700 30px/48px "Mono"', color: '#fff', textAlign: 'center' }); return e; });
  const LV = ['1–1224', '1225–2448', '2449–3123', '3124–4096'];
  const CLX = (i) => CR.x + i * 200, CLW = 186, CLY = 450, CLH = 200;
  const cLeaves = LV.map((r, i) => pageBox(world, CLX(i), CLY, CLW, CLH, r, { n: 6, rh: 14, gap: 12 }));
  const cLinks = cLeaves.map((p, i) => link(ov, [[1130 + 18 + i * 136 + 62, 354], [CLX(i) + CLW / 2, CLY]], 'ink', { w: 2 }));
  show(cTitle, c0, { y: 8, d: 0.45 }); show(cRoot, c0 + 0.1, { y: 10, d: 0.45 });
  cLeaves.forEach((p, i) => show(p.c, c0 + 0.3 + i * 0.08, { y: 12, d: 0.45 })); cLinks.forEach((p, i) => draw(p, c0 + 0.4 + i * 0.06, 0.5));
  to(cLeaves.map((p) => p.head), T('d2', 'RecordId') - 0.2, { backgroundColor: K.mint, color: K.forest, duration: 0.35 });
  to(cLeaves.map((p) => p.head), T('d3') - 0.1, { backgroundColor: K.gl3, color: K.gd2, duration: 0.35 });

  // ── 左：姓名索引（先是「没有」） ──
  const IR = { x: 140, w: 780 };
  const iTitle = tg(world, IR.x, 214, '姓名索引', 'b'); css(iTitle, { fontSize: '32px' });
  const none = h('div', 'abs', world); px(none, IR.x, 270, IR.w, 380); css(none, { border: '3px dashed ' + K.gb, borderRadius: '14px' });
  const noneT = h('div', 'abs', none, '还没有建'); css(noneT, { left: 0, top: '160px', width: IR.w + 'px', textAlign: 'center', font: '700 40px "Sans SC"', color: K.gd1 });
  show([iTitle, none], T('d1', '没有') - 0.2, { y: 10, d: 0.45 });

  pt(world, 1000, 258, 808, 404, T('d1', '集合树') - 0.2, T('d2') + 0.3);
  to(noneT, T('d2', '无关') - 0.2, { color: K.gd2, duration: 0.35 });
  // ══ 没有索引：一份份翻（C01） ══
  const tS0 = T('d3', '从头') - 0.2, tS1 = T('d3', '名字') + 0.3;
  const scan = h('div', 'abs', world); px(scan, CLX(0) - 6, CLY + 46, CLW + 12, 22); css(scan, { border: '3px solid ' + K.blue, borderRadius: '6px', background: K.bluel, opacity: 0 });
  F((t) => {
    if (t < tS0 - 0.2 || t > tS1 + 0.5) { scan.style.opacity = 0; return; }
    const p = clamp((t - tS0) / (tS1 - tS0)), step = Math.min(23, Math.floor(p * 24)), li = Math.floor(step / 6), ri = step % 6;
    scan.style.opacity = t > tS1 ? String(Math.max(0, 1 - (t - tS1) / 0.5)) : '1';
    scan.style.transform = `translate(${li * 200}px, ${ri * 26}px)`;
  });
  const exN = h('div', 'abs', world, '0'); px(exN, CR.x, 690); css(exN, { font: '800 80px "Inter"', color: K.blued });
  const exT = tg(world, CR.x + 250, 716, '份文档看过', 'b'); css(exT, { fontSize: '32px', color: K.blued });
  show([exN, exT], tS0 - 0.3, { y: 10, d: 0.4 });
  stepTo(exN, [[tS0, tS1 - tS0, 0, 4096]], (v) => Math.round(v).toLocaleString('en-US'));
  // 找到：她在第二个叶页里
  const hit1 = h('div', 'abs', cLeaves[1].c); css(hit1, { left: '10px', right: '10px', top: 40 + 10 + 2 * 26 - 4 + 'px', height: '22px', borderRadius: '5px', background: K.spring });
  show(hit1, T('d4', '找到') - 0.2, { y: 0, d: 0.35 });
  // explain 的两行实测（下面）
  const ex = term(world, 140, 790, 1660, 160, 'mongosh · explain("executionStats")', { fs: 26, lh: 40 });
  show(ex.c, T('d4') - 0.2, { y: 14, d: 0.5 });
  ex.out(T('d4', '看了') - 0.1, '没有索引：{ <span class="k">计划</span>: <span class="s">\'COLLSCAN\'</span>, <span class="k">返回</span>: <span class="n">1</span>, <span class="k">看过的索引键</span>: <span class="n">0</span>, <span class="k">看过的文档</span>: <span class="n">4096</span> }');
  const tB = T('d5') - 0.2;
  fadeOut([exN, exT, hit1], tB, 0.4);

  // ══ 有了姓名索引（B06）：根页 + 15 个叶页；第一个叶页里 Alice 排第一（C06） ══
  fadeOut(none, tB, 0.4);
  const iRoot = h('div', 'rootpg', world, '根页'); px(iRoot, IR.x + IR.w / 2 - 90, 270, 180, 64); css(iRoot, { fontSize: '26px' });
  const ILW = (IR.w - 14 * 6) / 15, ILY = 450;
  const iLeaves = [], iLinks = [];
  for (let k = 0; k < 15; k++) {
    const lx = IR.x + k * (ILW + 6);
    const l = h('div', 'abs', world); px(l, lx, ILY, ILW, 200); css(l, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '6px' });
    for (let j = 0; j < 7; j++) { const ln = h('div', 'abs', l); css(ln, { left: '6px', right: '6px', top: 14 + j * 25 + 'px', height: '9px', background: K.gl2, borderRadius: '3px' }); }
    iLeaves.push(l); iLinks.push(link(ov, [[IR.x + IR.w / 2, 334], [lx + ILW / 2, ILY]], 'ink', { w: 1.6 }));
  }
  show(iRoot, tB + 0.2, { y: 10, d: 0.45 });
  iLeaves.forEach((l, k) => show(l, tB + 0.35 + k * 0.03, { y: 12, d: 0.4 })); iLinks.forEach((p, k) => draw(p, tB + 0.4 + k * 0.02, 0.5));
  // 第一个叶页放大：键按字节排；Alice 的第一个字节是 41（A），别人是 55（U）
  const KEYS = [['41', 'Alice', '2050', 1], ['55', 'User00001-…', '1', 0], ['55', 'User00002-…', '2', 0]];
  // 放大的那一页叠在集合树上方（集合树这时还不用）
  const zP = h('div', 'panel', world); px(zP, 140, 214, 780, 214); css(zP, { borderColor: K.g1, borderWidth: '3px' });
  const zT = h('div', 'abs', zP, '第 1 个叶页 · 键按字节排'); css(zT, { left: '22px', top: '14px', font: '700 26px "Sans SC"', color: K.forest });
  const zRows = KEYS.map(([b, n, r, a], i) => {
    const e = h('div', 'abs', zP); css(e, { left: '22px', top: 58 + i * 50 + 'px', font: '600 28px/44px "Mono"', color: K.ink, whiteSpace: 'nowrap', padding: '0 10px', borderRadius: '6px' });
    e.innerHTML = `<span style="color:${K.gb}">3c</span> <span class="b1" style="padding:0 6px;border-radius:4px">${b}</span>…  "${n}"  <span class="rid" style="padding:0 6px;border-radius:4px">${r}</span>`;
    return e;
  });
  css(zP, { transformOrigin: '50% 100%' });
  tl.fromTo(zP, { autoAlpha: 0, scaleY: 0.2, y: 236 }, { autoAlpha: 1, scaleY: 1, y: 0, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('d6', '字节') - 0.5);
  fadeOut([iTitle, iRoot], T('d6', '字节') - 0.5, 0.3);
  to(iLeaves[0], T('d6', '字节') - 0.4, { borderColor: K.g1, duration: 0.3 });
  const zl = lead(ov, [[160, 428], [IR.x + ILW / 2, ILY]], { color: 'accent', w: 2.5 }); draw(zl, T('d6', '字节') - 0.2, 0.4);
  // 别人：User…，大写 U，55
  to([zRows[1], zRows[2]].map((e) => e.querySelector('.b1')), T('d7', 'U') - 0.2, { backgroundColor: K.bluel, color: K.blued, duration: 0.35 });
  to(zRows[0].querySelector('.b1'), T('d7b', 'A') - 0.2, { backgroundColor: K.mint2, color: K.forest, duration: 0.35 });
  const cmp = tg(world, 700, 236, '<span style="font-family:Mono">41 &lt; 55</span><br>A 排在 U 前面', 'b'); css(cmp, { fontSize: '30px', lineHeight: '1.4' });
  show(cmp, T('d7b', '前面') - 0.3, { x: 14, y: 0, d: 0.45 });
  to(zRows[0], T('d7b', '第一项') - 0.2, { backgroundColor: K.mint, color: K.forest, duration: 0.35 });
  pt(world, 152, 316, 620, 104, T('d7', 'User') - 0.2, T('d7b') - 0.1, K.blue);
  pt(world, 152, 266, 620, 52, T('d7b', 'A') - 0.2, T('d9') - 0.3);
  // 从根页走到第一个叶页
  const ipath = link(ov, [[IR.x + IR.w / 2, 334], [IR.x + ILW / 2, ILY]], 'spring', { w: 7 });
  fadeOut([zP, cmp, zl], T('d9') - 0.2, 0.4);
  tl.to([iTitle, iRoot], { autoAlpha: 1, duration: 0.4 }, T('d9') - 0.1);
  draw(ipath, T('d9', '根页') - 0.1, 0.6);
  to(iLeaves[0], T('d9', '第一个') - 0.1, { backgroundColor: K.mint, duration: 0.35 });
  // 这一项：键是 Alice 接 2050
  const ent = h('div', 'abs', world); px(ent, 140, 690); css(ent, { font: '700 40px "Mono"', color: K.ink, background: '#fff', border: '3px solid ' + K.g1, borderRadius: '10px', padding: '10px 24px' });
  ent.innerHTML = '键：<span style="color:#1254B7">"Alice"</span> <span class="rid" style="padding:0 8px;margin-left:8px;border-radius:6px">2050</span>';
  show(ent, T('d10', '键') - 0.3, { y: 12, d: 0.5 });
  const entL = lead(ov, [[IR.x + ILW / 2, ILY + 200], [IR.x + ILW / 2, 690]], { color: 'accent', w: 2.5 }); draw(entL, T('d10', '键') - 0.4, 0.4);
  to(ent.querySelector('.rid'), T('d10', 'RecordId') - 0.2, { backgroundColor: K.spring, duration: 0.4 });
  fadeOut(ex.c, T('d10') - 0.2, 0.4);
  pt(world, 236, 694, 200, 66, T('d10', 'Alice') - 0.2, T('d10', 'RecordId') - 0.3, K.blue);
  pt(world, 428, 694, 120, 66, T('d10', 'RecordId') - 0.2, T('d12') + 0.3);
  pt(world, 1122, 262, 576, 100, T('d12', '集合树') - 0.2, T('d13', '开始') - 0.3);
  pt(world, 1000, 444, 800, 50, T('d13', '每个') - 0.2, T('d13b') - 0.1);

  // ══ 拿着 2050 回到集合树（B03）：分界一个个比过，落在第二个叶页 ══
  const tok = h('div', 'abs', world, '2050'); px(tok, 390, 700); css(tok, { font: '800 44px "Mono"', color: K.forest, background: K.mint2, border: '3px solid ' + K.g1, borderRadius: '10px', padding: '2px 16px' });
  tl.fromTo(tok, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, T('d12', '2050') - 0.3);
  tl.to(tok, { x: 990 - 390, y: 290 - 700, duration: 0.9, ease: 'power2.inOut' }, T('d12', '回到') - 0.1);
  const sepT = [T('d13', '开始') - 0.3, T('d13b', '1225') - 0.2, T('d13b', '2449') - 0.2, T('d13c', '3124') - 0.2];
  sepEls.forEach((e, i) => to(e, sepT[i], { backgroundColor: i === 1 ? K.forest : '#3D4F58', color: i === 1 ? '#FFFFFF' : K.spring, duration: 0.3 }));
  sepEls.forEach((e, i) => { if (i !== 1) to(e, T('d15') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', color: '#FFFFFF', duration: 0.35 }); });   // lint-ok: 取消高亮
  const rule = tg(world, 1420, 368, '1225 ≤ 2050 &lt; 2449', 'g'); css(rule, { fontSize: '30px', fontFamily: 'Mono' });
  show(rule, T('d15', '落在') - 0.3, { y: 8, d: 0.4 });
  const cpath = link(ov, [[1130 + 18 + 136 + 62, 354], [CLX(1) + CLW / 2, CLY]], 'spring', { w: 7 }); draw(cpath, T('d15', '落在'), 0.5);
  tl.to(tok, { x: CLX(1) + 20 - 390, y: CLY + 60 - 700, scale: 0.8, duration: 0.6, ease: 'power2.inOut' }, T('d15', '第二个') - 0.1);
  to(cLeaves[1].c, T('d15', '第二个') + 0.3, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 });
  // 取出 47 个字节：变回她的文档
  const out = docCard(world, 1010, 680, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 620, fs: 28, cls: 'on' });
  show(out.c, T('d15', '47') - 0.3, { y: -30, d: 0.55 });
  const o47 = tg(world, 1660, 720, '47 字节', 'big'); css(o47, { fontSize: '40px' }); show(o47, T('d15', '47') - 0.1, { y: 8, d: 0.4 });
  // 第二行实测：FETCH ← IXSCAN，1 个键、1 份文档；与上一次并排
  const tE = T('d17') - 0.3;
  fadeOut([out.c, o47, ent, entL], tE - 0.1, 0.4);
  const ex2 = term(world, 140, 750, 1660, 200, 'mongosh · explain("executionStats")', { fs: 26, lh: 44 });
  show(ex2.c, tE, { y: 14, d: 0.5 });
  ex2.out(tE + 0.1, '<span style="color:#5C6C75">没有索引：{ 计划: \'COLLSCAN\', 返回: 1, 看过的索引键: 0, 看过的文档: 4096 }</span>');
  pt(world, 156, 860, 1420, 50, T('d17', '文档') - 0.2, Tend('d17') + 0.2);
  pt(world, 156, 860, 1420, 50, T('d17', '索引键') - 0.2, T('d17', '文档') - 0.3);
  pt(world, 156, 818, 1420, 50, Tend('d17') + 0.3, Tend('d17') + 1.8, K.blue);
  pt(world, 156, 860, 1420, 50, Tend('d17') + 2.0, s.end - 0.3);
  beat(world, T('d3', '从头') - 0.1, 1000, 444, 800, 212, 1.5, K.blue);
  beat(world, T('d2', 'RecordId') - 0.1, 1000, 444, 800, 50, 1.0);
  beat(world, T('d7b', '第一项') - 0.1, 140, 214, 780, 214, 1.0);
  [[1, T('d13b', '1225')], [2, T('d13b', '2449')], [3, T('d13c', '3124') + 0.2]].forEach(([i, t]) => beat(world, t - 0.1, CLX(i) - 6, CLY - 6, CLW + 12, CLH + 12, 0.9));
  beat(world, T('d4', '看了') - 0.1, 1000, 682, 600, 100, 1.3, K.blue);
  beat(world, T('d4', '找到') + 0.2, 156, 856, 1600, 50, 1.2);
  beat(world, T('d9', '根页') - 0.1, 130, 262, 800, 400, 1.2);
  beat(world, T('d10', '键') + 0.05, 132, 682, 520, 80, 1.2);
  beat(world, Tend('d10') + 0.2, 1000, 258, 808, 404, 1.2, K.gb);
  beat(world, T('d13c', '3124') - 0.1, 1122, 262, 576, 100, 1.2);
  ex2.out(T('d17') + 0.2, '有了索引：{ <span class="k">计划</span>: <span class="s">\'FETCH ← IXSCAN\'</span>, <span class="k">返回</span>: <span class="n">1</span>, <span class="k">看过的索引键</span>: <span class="n">1</span>, <span class="k">看过的文档</span>: <span class="n">1</span> }');
});
