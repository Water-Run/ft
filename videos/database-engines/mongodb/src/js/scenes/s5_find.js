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
  const cTitle = tg(world, CR.x, 214, '集合树 · 按 RecordId 排', 'b'); css(cTitle, { fontSize: '32px', borderRadius: '10px', padding: '0 14px', lineHeight: '50px', marginTop: '-8px' });
  solid(cTitle, T('d1', '集合树') - 0.2, 'ink'); to(cTitle, T('d12', '集合树') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  const cRoot = h('div', 'abs', world); px(cRoot, 1130, 270, 560, 84); css(cRoot, { background: K.ink, borderRadius: '10px' });
  const SEP = ['1', '1225', '2449', '3124'];
  const sepEls = SEP.map((k, i) => { const e = h('div', 'abs', cRoot, k); css(e, { left: 18 + i * 136 + 'px', top: '18px', width: '124px', height: '48px', borderRadius: '6px', font: '700 30px/48px "Mono"', color: '#fff', textAlign: 'center' }); return e; });
  const LV = ['1–1224', '1225–2448', '2449–3123', '3124–4096'];
  const CLX = (i) => CR.x + i * 200, CLW = 186, CLY = 450, CLH = 200;
  const cLeaves = LV.map((r, i) => pageBox(world, CLX(i), CLY, CLW, CLH, r, { n: 6, rh: 14, gap: 12 }));
  const cLinks = cLeaves.map((p, i) => link(ov, [[1130 + 18 + i * 136 + 62, 354], [CLX(i) + CLW / 2, CLY]], 'ink', { w: 2 }));
  show(cTitle, c0, { y: 8, d: 0.45 }); show(cRoot, c0 + 0.1, { y: 10, d: 0.45 });
  cLeaves.forEach((p, i) => show(p.c, c0 + 0.3 + i * 0.08, { y: 12, d: 0.45 })); cLinks.forEach((p, i) => draw(p, c0 + 0.4 + i * 0.06, 0.5));
  to(cLeaves.map((p) => p.head), T('d2', 'RecordId') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });
  to(cLeaves.map((p) => p.head), T('d3') - 0.1, { backgroundColor: K.gl3, color: K.gd2, duration: 0.35 });

  // ── 左：姓名索引（先是「没有」） ──
  const IR = { x: 140, w: 780 };
  const iTitle = tg(world, IR.x, 214, '姓名索引', 'b'); css(iTitle, { fontSize: '32px' });
  const none = h('div', 'abs', world); px(none, IR.x, 270, IR.w, 380); css(none, { border: '3px dashed ' + K.gb, borderRadius: '14px', background: K.gl2 });
  const noneT = h('div', 'abs', none, '还没有建'); css(noneT, { left: IR.w / 2 - 130 + 'px', top: '156px', width: '260px', textAlign: 'center', font: '700 40px/70px "Sans SC"', color: '#FFFFFF', background: K.gd1, borderRadius: '12px' });
  set(noneT, s.start, { autoAlpha: 0 }); show(noneT, T('d1', '没有') + 0.5, { y: 8, d: 0.4 });
  show([iTitle, none], T('d1', '没有') - 0.2, { y: 10, d: 0.45 });

  to(noneT, T('d2', '无关') - 0.2, { backgroundColor: K.gl1, color: K.gd2, duration: 0.35 });
  // ══ 没有索引：一份份翻（C01） ══
  const tS0 = T('d3', '从头') - 0.2, tS1 = T('d3', '名字') + 0.3;
  const scan = h('div', 'abs', world); px(scan, CLX(0) - 6, CLY + 46, CLW + 12, 22); css(scan, { border: '3px solid ' + K.blue, borderRadius: '6px', background: K.bluel, opacity: 0 });
  F((t) => {
    if (t < tS0 - 0.2 || t > tS1 + 0.5) { scan.style.opacity = 0; return; }
    const p = clamp((t - tS0) / (tS1 - tS0)), step = Math.min(23, Math.floor(p * 24)), li = Math.floor(step / 6), ri = step % 6;
    scan.style.opacity = t > tS1 ? String(Math.max(0, 1 - (t - tS1) / 0.5)) : '1';
    scan.style.transform = `translate(${li * 200}px, ${ri * 26}px)`;
  });
  cLeaves.forEach((p, i) => { to(p.c, T('d3', '从头') - 0.2 + (T('d3', '名字') + 0.3 - T('d3', '从头')) * i / 4, { backgroundColor: K.bluel, borderColor: K.blue, duration: 0.3 }); to(p.c, T('d5') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 }); });
  const exN = h('div', 'abs', world, '0'); px(exN, CR.x, 682); css(exN, { font: '800 80px/100px "Inter"', color: K.blued, borderRadius: '14px', padding: '0 18px', marginLeft: '-18px' });
  to(exN, T('d4', '看了') - 0.2, { backgroundColor: K.blue, color: '#FFFFFF', duration: 0.35 });
  cLeaves.forEach((p, i) => to(p.c, T('d4', '四千') - 0.2 + i * 0.08, { backgroundColor: '#9CCBFF', borderColor: K.blue, duration: 0.35 }));
  const exT = tg(world, CR.x + 250, 708, '份文档看过', 'b'); css(exT, { fontSize: '32px', color: K.blued });
  show([exN, exT], tS0 - 0.3, { y: 10, d: 0.4 });
  const CN = [1224, 1224, 675, 973];
  let lastN = -1;
  F((t) => { let n = 0; if (t >= tS0) { const p = clamp((t - tS0) / (tS1 - tS0)), step = Math.min(23, Math.floor(p * 24)), li = Math.floor(step / 6), ri = step % 6; n = p >= 1 ? 4096 : CN.slice(0, li).reduce((a, b) => a + b, 0) + Math.round(CN[li] * (ri + 1) / 6); } if (n !== lastN) { exN.textContent = n.toLocaleString('en-US'); lastN = n; } });   // 跟扫描线同一个 step
  // 找到：她在第二个叶页里
  const hit1 = h('div', 'abs', cLeaves[1].c); css(hit1, { left: '10px', right: '10px', top: 40 + 10 + 2 * 26 - 4 + 'px', height: '22px', borderRadius: '5px', background: K.spring });
  show(hit1, T('d4', '找到') - 0.2, { y: 0, d: 0.35 });
  [0, 2, 3].forEach((i) => { to(cLeaves[i].c, T('d4', '找到') + 0.1, { opacity: 0.3, duration: 0.4 }); to(cLeaves[i].c, T('d5') - 0.2, { opacity: 1, duration: 0.4 }); });   // 只有这一页里有她
  // explain 的两行实测（下面）
  const ex = term(world, 140, 808, 1660, 150, 'mongosh · explain("executionStats") 摘录 · 键名译成中文', { fs: 26, lh: 40 });
  show(ex.c, T('d4') - 0.2, { y: 14, d: 0.5 });
  const f1 = h('div', 'abs', world, '');
  ex.out(T('d4', '看了') - 0.1, '没有索引：{ <span class="k">计划</span>: <span class="s">\'COLLSCAN\'</span>, <span class="k">返回</span>: <span class="n">1</span>, <span class="k">看过的索引键</span>: <span class="n">0</span>, <span class="k">看过的文档</span>: <span class="n">4096</span> }');
  const tB = T('d5') - 0.2;

  const glCS = h('div', 'abs', world, '<b style="color:#00684A;font-family:Mono;margin-right:14px">COLLSCAN</b>集合扫描：从头到尾看一遍'); px(glCS, 140, 736);   // C09
  css(glCS, { font: '500 26px "Inter", "Sans SC"', color: K.gd2, borderLeft: '5px solid ' + K.g1, paddingLeft: '16px', whiteSpace: 'nowrap' });
  show(glCS, T('d4', '看了') + 0.3, { x: 12, y: 0, d: 0.45 }); fadeOut(glCS, tB, 0.4);
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
  const sTok = h('div', 'abs', world, '"Alice"'); px(sTok, 700, 272); css(sTok, { font: '700 34px/60px "Mono"', color: '#FFFFFF', background: K.blue, borderRadius: '10px', padding: '0 20px' }); sTok.dataset.name = 'stok';
  tl.fromTo(sTok, { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out', immediateRender: true }, T('d5', '再找') - 0.3);
  tl.to(sTok, { x: -170, scale: 0.8, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, T('d5', '一次') + 0.1);
  to(iRoot, T('d5', '一次') + 0.45, { backgroundColor: K.blue, duration: 0.3 });   // 要找的键进了根页
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
  iLinks.forEach((p) => tl.to(p, { autoAlpha: 0, duration: 0.3 }, T('d6', '字节') - 0.5));
  iLinks.forEach((p) => tl.to(p, { autoAlpha: 1, duration: 0.4 }, T('d9') - 0.1));
  to(iLeaves[0], T('d6', '字节') - 0.4, { borderColor: K.g1, duration: 0.3 });
  const zl = lead(ov, [[160, 428], [IR.x + ILW / 2, ILY]], { color: 'accent', w: 2.5 }); draw(zl, T('d6', '字节') - 0.2, 0.4);
  // 别人：User…，大写 U，55
  to([zRows[1], zRows[2]], T('d7', '别人') - 0.2, { color: '#FFFFFF', backgroundColor: K.gd1, duration: 0.35 }); to([zRows[1], zRows[2]].map((e) => e.firstChild), T('d7', '别人') - 0.2, { color: K.gl2, duration: 0.35 });
  iLeaves.slice(1).forEach((l) => { to(l, T('d7', 'User') - 0.2, { backgroundColor: '#9CCBFF', borderColor: K.blue, duration: 0.35 }); to(l, T('d7b', '第一项') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 }); });   // 后面这些叶页里全是 User…
  to([zRows[1], zRows[2]].map((e) => e.querySelector('.b1')), T('d7', 'U') - 0.2, { backgroundColor: K.bluel, color: K.blued, duration: 0.35 });
  const u55 = tg(world, 670, 340, '<span style="font-family:Mono">55</span> 就是 U', 'b'); css(u55, { fontSize: '36px', lineHeight: '62px', color: '#FFFFFF', background: K.blue, borderRadius: '10px', padding: '0 16px' });
  show(u55, T('d7', '大写') - 0.1, { x: 12, y: 0, d: 0.4 }); to([zRows[1], zRows[2]].map((e) => e.querySelector('.b1')), T('d7', '大写') - 0.2, { backgroundColor: K.blue, color: '#FFFFFF', duration: 0.35 });
  to(zRows[0].querySelector('.b1'), T('d7b', 'A') - 0.2, { backgroundColor: K.mint2, color: K.forest, duration: 0.35 });
  to(zRows[0], T('d7b', 'A') - 0.2, { color: '#FFFFFF', backgroundColor: K.forest, duration: 0.35 }); to(zRows[0].firstChild, T('d7b', 'A') - 0.2, { color: K.gl2, duration: 0.35 });
  const cmp = tg(world, 660, 236, '<span style="font-family:Mono">41 &lt; 55</span><br>A 排在 U 前面', 'b'); css(cmp, { fontSize: '30px', lineHeight: '1.4', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '8px 16px' });
  show(cmp, T('d7b', '前面') - 0.3, { x: 14, y: 0, d: 0.45 });
  const glA = gl(world, 140, 676, '41、55 是什么', 'A、U 的 ASCII 码（十六进制）。名字按 UTF-8 存：英文字母 1 字节，即 ASCII 码；<br>汉字 3 字节，每字节都不小于十六进制 80，排在英文名后面', { key: 'ASCII 与 UTF-8' }); glInline(glA);   // U05 C06
  show(glA, T('d6', '字节') - 0.3, { x: 12, y: 0, d: 0.4 }); fadeOut(glA, T('d9', '找到') - 0.6, 0.35);   // 下面那一项出来之前收掉
  to(zRows[0], T('d7b', '第一项') - 0.2, { backgroundColor: K.mint, color: K.forest, duration: 0.35 }); to(zRows[0].firstChild, T('d7b', '第一项') - 0.2, { color: K.gd1, duration: 0.35 });
  to(iLeaves[0], T('d7b', '第一项') - 0.2, { backgroundColor: K.mint, duration: 0.35 });
  // 从根页走到第一个叶页
  const ipath = link(ov, [[IR.x + IR.w / 2, 334], [IR.x + ILW / 2, ILY]], 'spring', { w: 7 });
  fadeOut([zP, cmp, zl, u55], T('d9') - 0.2, 0.4);
  tl.to([iTitle, iRoot], { autoAlpha: 1, duration: 0.4 }, T('d9') - 0.1);
  draw(ipath, T('d9', '根页') - 0.1, 0.6);
  to(iLeaves[0], T('d9', '第一个') - 0.1, { backgroundColor: K.g1, borderColor: K.g1, duration: 0.35 });
  // 这一项：键是 Alice 接 2050
  const ent = h('div', 'abs', world); px(ent, 140, 690); css(ent, { font: '700 40px "Mono"', color: K.ink, background: K.mint2, border: '3px solid ' + K.g1, borderRadius: '10px', padding: '10px 24px' });
  ent.innerHTML = '键：<span style="color:#1254B7">"Alice"</span> <span class="rid" style="padding:0 8px;margin-left:8px;border-radius:6px">2050</span>';
  show(ent, T('d9', '找到') - 0.2, { y: 12, d: 0.5 });
  solid(ent, T('d10', '2050') - 0.2, 'new'); to(ent.querySelector('span'), T('d10', '2050') - 0.2, { color: K.spring, duration: 0.35 });
  const entL = lead(ov, [[IR.x + ILW / 2, ILY + 200], [IR.x + ILW / 2, 690]], { color: 'accent', w: 2.5 }); draw(entL, T('d10', '键') - 0.4, 0.4);
  to(ent.querySelector('.rid'), T('d10', 'RecordId') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.4 });
  const ridX = 140 + 3 + 24 + (ent.querySelector('.rid').offsetLeft || 300);
  const ridT = tg(world, ridX - 20, 792, '↑ RecordId', 'm'); css(ridT, { fontSize: '28px', fontWeight: 700, color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '0 12px', lineHeight: '44px' });   // 放在键那一块的下面，不跨框边
  show(ridT, T('d10', 'RecordId') - 0.15, { y: -6, d: 0.4 });
  to([iRoot, ...iLeaves, ...iLinks, ipath], T('d10', 'RecordId') - 0.2, { opacity: 0.3, duration: 0.45 }); to([iRoot, ...iLeaves, ...iLinks, ipath], T('d12') - 0.2, { opacity: 1, duration: 0.45 });   // 只看找到的这一项
  // d11：这条路和 InnoDB、SQLite 一样（S12）：三家各自的「索引 → 编号 → 存数据的树」并排
  const same = h('div', 'panel', world); px(same, 1000, 690, 820, 176);
  same.innerHTML = [['InnoDB · PART 2', '姓名索引 → 主键 → 聚簇索引'], ['SQLite · PART 4', '姓名索引 → 行号 → 表的 B 树'], ['MongoDB', '姓名索引 → RecordId → 集合树']].map(([a, b], k) => `<div class="sm" style="position:absolute;left:22px;top:${16 + k * 52}px;font:600 26px/44px 'Sans SC';color:${k === 2 ? K.forest : K.gd2};white-space:nowrap"><b style="display:inline-block;width:250px;font-family:Inter">${a}</b>${b}</div>`).join('');
  const sms = [...same.querySelectorAll('.sm')]; set(sms, s.start, { autoAlpha: 0 });
  css(same, { background: K.ink, borderColor: K.ink }); sms.forEach((e, k) => { css(e, { color: k === 2 ? K.spring : '#C1C7C6', borderRadius: '8px', padding: '0 12px', marginLeft: '-12px' }); [...e.querySelectorAll('b')].forEach((b) => css(b, { color: '#FFFFFF' })); });
  to(sms[2], T('d11', '回去') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 }); to([...sms[2].querySelectorAll('b')], T('d11', '回去') - 0.2, { color: K.ink, duration: 0.35 });
  show(same, T('d11', 'Inno') - 0.45, { y: 10, d: 0.4 }); show(sms[0], T('d11', 'Inno') - 0.2, { x: -10, y: 0, d: 0.35 }); show(sms[1], T('d11', 'S') - 0.1, { x: -10, y: 0, d: 0.35 }); show(sms[2], T('d11', '先查') - 0.2, { x: -10, y: 0, d: 0.35 });   // 框出来紧跟着第一行，不空着停一下
  fadeOut(same, T('d13') - 0.2, 0.4);
  fadeOut(ex.c, T('d10') - 0.2, 0.4);

  // ══ 拿着 2050 回到集合树（B03）：分界一个个比过，落在第二个叶页 ══
  const tok = h('div', 'abs', world, '2050'); px(tok, 390, 624); css(tok, { font: '800 44px "Mono"', color: '#FFFFFF', background: K.forest, border: '3px solid ' + K.forest, borderRadius: '10px', padding: '2px 16px' });
  fadeOut(ridT, T('d12', '2050') - 0.35, 0.3);
  tl.fromTo(tok, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, T('d12') - 0.1);
  tl.to(tok, { x: 960 - 390, y: 290 - 624, duration: 0.9, ease: 'power2.inOut' }, T('d12', '回到') - 0.1);   // 停在根页左边，留出空
  to(cLeaves.map((p) => p.head), T('d13', '每个') - 0.2, { color: '#FFFFFF', backgroundColor: K.forest, duration: 0.35 });
  to(cRoot, T('d13', '开始') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); to(cRoot, T('d15') - 0.2, { backgroundColor: K.ink, duration: 0.35 });
  [[0, T('d13', '开始')], [1, T('d13b', '1225')], [2, T('d13b', '2449')], [3, T('d13c', '3124')]].forEach(([i, t]) => { to(cLeaves[i].c, t - 0.1, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); to(cLeaves[i].rows, t - 0.1, { backgroundColor: K.g1, duration: 0.35 }); to(cLeaves[i].rows, i !== 1 ? T('d15') - 0.2 : T('d15', '第二个') + 0.3, { backgroundColor: K.gl2, duration: 0.35 }); if (i !== 1) to(cLeaves[i].c, T('d15') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 }); });
  cLeaves.forEach((p, i) => { if (i !== 1) to(p.head, T('d15') - 0.2, { color: K.gd2, backgroundColor: K.gl3, duration: 0.35 }); });
  const sepT = [T('d13', '开始') - 0.3, T('d13b', '1225') - 0.2, T('d13b', '2449') - 0.2, T('d13c', '3124') - 0.2];
  sepEls.forEach((e, i) => to(e, sepT[i], { backgroundColor: i === 1 ? K.forest : '#3D4F58', color: i === 1 ? K.mint : K.spring, duration: 0.3 }));
  sepEls.forEach((e, i) => { if (i !== 1) to(e, T('d15') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', color: '#FFFFFF', duration: 0.35 }); });   // lint-ok: 取消高亮
  const rule = tg(world, 1450, 206, '1225 ≤ 2050 &lt; 2449', 'g'); css(rule, { fontSize: '30px', fontFamily: 'Mono' });   // 根页上方留出空，不伸出根页右边
  show(rule, T('d15', '落在') - 0.3, { y: 8, d: 0.4 });
  const cpath = link(ov, [[1130 + 18 + 136 + 62, 354], [CLX(1) + CLW / 2, CLY]], 'spring', { w: 7 }); draw(cpath, T('d15', '落在'), 0.5);
  tl.to(tok, { x: CLX(1) + 20 - 390, y: CLY + 60 - 624, scale: 0.8, duration: 0.6, ease: 'power2.inOut' }, T('d15', '第二个') - 0.1);
  to(cLeaves[1].c, T('d15', '第二个') + 0.3, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 });
  // 取出 47 个字节：变回她的文档
  const out = docCard(world, 1010, 680, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 620, fs: 28, cls: 'on' });
  show(out.c, T('d15', '47') - 0.3, { y: -30, d: 0.55 });
  const o47 = tg(world, 1660, 720, '47 字节', 'big'); css(o47, { fontSize: '40px' }); show(o47, T('d15', '47') - 0.1, { y: 8, d: 0.4 });
  // 第二行实测：FETCH ← IXSCAN，1 个键、1 份文档；与上一次并排
  const tE = T('d17') - 0.3;
  fadeOut([out.c, o47, ent, entL, ridT], tE - 0.1, 0.4);
  const ex2 = term(world, 140, 754, 1660, 196, 'mongosh · explain("executionStats") 摘录 · 键名译成中文', { fs: 26, lh: 44 });
  show(ex2.c, tE, { y: 14, d: 0.5 });
  ex2.out(tE + 0.1, '<span style="color:#5C6C75">没有索引：{ 计划: \'COLLSCAN\', 返回: 1, 看过的索引键: 0, 看过的文档: 4096 }</span>');
  const exA = ex2.body.children[0];
  const exB = ex2.out(T('d17') + 0.2, '有了索引：{ <span class="k">计划</span>: <span class="s">\'FETCH ← IXSCAN\'</span>, <span class="k">返回</span>: <span class="n">1</span>, <span class="k">看过的索引键</span>: <span class="n">1</span>, <span class="k">看过的文档</span>: <span class="n">1</span> }');
  to(exB, T('d17', '索引键') - 0.2, { color: K.forest, duration: 0.35 });

  const glIX = h('div', 'abs', world, '<b style="color:#00684A;font-family:Mono;margin-right:12px">IXSCAN</b>扫描索引键　<b style="color:#00684A;font-family:Mono;margin:0 12px 0 10px">FETCH</b>按 RecordId 取出文档'); px(glIX, 860, 680);   // C09
  css(glIX, { font: '500 26px "Inter", "Sans SC"', color: K.gd2, borderLeft: '5px solid ' + K.g1, paddingLeft: '16px', whiteSpace: 'nowrap' });
  show(glIX, T('d17') + 0.5, { x: 12, y: 0, d: 0.45 });
  const d41 = h('div', 'abs', world); px(d41, 140, 670); css(d41, { font: '800 40px/62px "Inter", "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 24px' }); d41.innerHTML = '看过的文档 <span style="color:#C1C7C6">4096</span> → 1';
  show(d41, T('d17', '文档') - 0.1, { y: 10, d: 0.45 }); to(d41, Tend('d17') + 0.2, { backgroundColor: K.forest, duration: 0.4 }); to(d41.firstElementChild, Tend('d17') + 0.2, { color: K.mint2, duration: 0.4 });
});
