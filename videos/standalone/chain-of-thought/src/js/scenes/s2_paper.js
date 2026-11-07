// 02 草稿纸：镜头一路向右走四站。
//   A 错答案拆成 4 块 token；上面是层数固定的一摞，每块只穿过一次（S3、S4：GPT-3 175B 96 层；L1 n5-03 direct 的 4 个 token）
//   B 乘积的三段：开头估得出、末尾只看末尾、中间要一位一位进位（数学性质；5992 × 2138 = 12,810,896）
//   C 人的草稿纸与模型的回答纸：先写过程那一次（L1 n5-03 think_first），两张纸叠到一起
//   D 一串点的对照（S1 表 6，LaMDA 137B）与本片 100 道题（L1）
scene('paper', ({ root, s, c0 }) => {
  const { desk, rig, board } = makeDesk(root, { x: 1305, y: 520, rx: 26, rz: -2, k: 1.15 });

  // ── A：第一次的纸，答案拆成 4 块 ──
  const S1 = sheet(desk, -1000, -340, 560, 700);
  show(S1, c0 + 0.1, { y: 0, d: 0.5 }); show(S1.shadowEl, c0 + 0.1, { y: 0, d: 0.5, a: 0.7 });
  const h1 = header(S1, '第一次', '只报答案', 560, c0 + 0.15);
  const prob = ln(S1, '25992 × 92138 =', 44, 150, 54); show(prob, c0 + 0.25, { y: 6, d: 0.45 });
  const ans = ln(S1, '2394730896', 44, 236, 60); show(ans, c0 + 0.35, { y: 6, d: 0.45 });
  const tSplit = T('c1', '一小块');
  to(ans, tSplit, { opacity: 0.18, duration: 0.5 });
  const TX = [-380, -200, -20, 160], TY = 10, toks = ['239', '473', '089', '6'];
  const tiles = toks.map((txt, i) => {
    const t = tile(desk, txt, TX[i], TY, 150, 100, 26);
    fromTo(t, tSplit + i * 0.12, { left: -956 + i * 70 + 'px', top: '-110px', autoAlpha: 0 }, { left: TX[i] + 'px', top: TY + 'px', autoAlpha: 1, duration: 0.8, ease: 'power2.inOut' });
    return t;
  });
  sfx('pop', tSplit, { g: 0.3 });
  const gl = board('<div class="gloss" style="position:static">token：模型一次写出的一小块文字<br><span class="g">这道题的回答，一共 4 块</span></div>', -380, 260, 0);
  gl.dataset.gloss = 'token';
  show(gl, Tend('c1') - 0.6, { y: 8, d: 0.5 }); sfx('blip', Tend('c1') - 0.6, { g: 0.3 });
  const nums = tiles.map((t, i) => { const n = board(`<span class="note" style="font-size:26px">${i + 1}</span>`, TX[i] + 64, TY + 150, 0); show(n, T('c2', '四块') - 0.3 + i * 0.1, { y: 6, d: 0.3 }); return n; });
  sfx('tick', T('c2', '四块'), { g: 0.35 });
  hide(gl, T('c4') - 0.2, { y: 0, d: 0.4 });

  // 每写一块，都把前面的读一遍：从第 4 块连回前三块与题目
  const ov = inkLayer(desk, 1, 1);
  const arcs = [0, 1, 2].map((i) => svg('path', { d: `M${TX[3] + 75} ${TY + 104} C ${TX[3] + 40} ${TY + 230}, ${TX[i] + 110} ${TY + 230}, ${TX[i] + 75} ${TY + 104}`, fill: 'none', stroke: '#9a9a9a', 'stroke-width': 2 }, ov));
  const toProb = svg('path', { d: `M${TX[3] + 75} ${TY - 4} C ${TX[3] + 40} ${TY - 200}, -640 -260, -640 -170`, fill: 'none', stroke: '#9a9a9a', 'stroke-width': 2 }, ov);
  [...arcs, toProb].forEach((a, i) => draw(a, T('c3', '前面') - 0.2 + i * 0.12, 0.6));
  [...arcs, toProb].forEach((a) => to(a, T('c4') + 0.3, { opacity: 0.25, duration: 0.6 }));

  // 一层一层的计算：层数固定的一摞，每块只穿过一次
  const N = 32, gap = 12, z0 = 120, Hs = z0 + N * gap + 30;
  const planes = [];
  for (let i = 0; i < N; i++) { const p = h('div', 'plane', desk); px(p, -440, -140, 820, 320); css(p, { transform: `translateZ(${z0 + i * gap}px)` }); if (i === N - 1) css(p, { boxShadow: 'inset 0 0 0 1.5px rgba(28,28,28,.55)' }); planes.push(p); }
  planes.forEach((p, i) => show(p, T('c4', '一层') - 0.3 + i * 0.025, { y: 0, d: 0.3 }));
  const paths = TX.map((x) => { const p = h('div', 'path', desk); px(p, x + 74, TY + 50 - Hs, 2, Hs); css(p, { transform: 'rotateX(-90deg)', transformOrigin: '50% 100%' }); return p; });
  fromTo(paths[3], T('c4', '决定') - 0.4, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power2.inOut' });
  sfx('tick', T('c4', '决定'), { g: 0.3 });
  const l96 = board('<div style="line-height:1.5"><span class="big">96 层</span><br><span class="note">GPT-3（175B）的层数</span></div>', 410, 170, z0 + N * gap - 10);
  show(l96, T('c5', '九十六') - 0.1, { y: 8, d: 0.45 }); sfx('pop', T('c5', '九十六'), { g: 0.3 });
  [0, 1, 2].forEach((i) => fromTo(paths[i], T('c6', '这么多') - 0.5 + i * 0.15, { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'power2.inOut' }));
  const l4 = board('<span class="note" style="color:#1c1c1c;font-size:32px">只报答案：4 块，每块 96 层</span>', -440, 330, 0);
  show(l4, T('c7', '四块') - 0.1, { y: 8, d: 0.45 });
  paths.forEach((p) => to(p, T('c8', '一口气') - 0.2, { backgroundColor: '#a5402d', duration: 0.4 }));
  sfx('tick', T('c8', '一口气'), { g: 0.4 });
  [l96, l4, ...nums].forEach((e) => hide(e, Tend('c8') + 0.2, { y: 0, d: 0.4 }));
  [...planes, ...paths, ...tiles, S1, S1.shadowEl].forEach((e) => to(e, Tend('c8') + 0.3, { opacity: 0.22, duration: 0.6 }));
  [...arcs, toProb].forEach((a_) => to(a_, Tend('c8') + 0.3, { opacity: 0, duration: 0.6 }));

  // ── B：乘积的三段 ──
  const NB = sheet(desk, 620, -360, 820, 760);
  show(NB, Tend('c8') + 0.1, { y: 0, d: 0.5 }); show(NB.shadowEl, Tend('c8') + 0.1, { y: 0, d: 0.5, a: 0.7 });
  const okL = h('div', 'note', NB, '正确'); px(okL, 44, 60); css(okL, { fontSize: '26px' });
  const okN = ln(NB, '', 44, 92, 84); const D0 = [...'2394850896'].map((d) => h('span', '', okN, d));
  const wL = h('div', 'note', NB, '只报答案'); px(wL, 44, 200); css(wL, { fontSize: '26px' });
  const wN = ln(NB, '', 44, 232, 84); const D1 = [...'2394730896'].map((d, i) => h('span', i === 4 || i === 5 ? 'err' : '', wN, d));
  [okL, okN, wL, wN].forEach((e, i) => show(e, Tend('c8') + 0.3 + i * 0.1, { y: 6, d: 0.45 }));
  const seg = (i0, i1, y) => { const b0 = box(D0[i0], NB), b1 = box(D0[i1], NB); const e = h('div', 'abs', NB); px(e, b0.x + 2, y, b1.r - b0.x - 4, 2); css(e, { background: '#1c1c1c', transformOrigin: '0 50%' }); return { e, x0: b0.x, x1: b1.r }; };
  const note = (html, x, y) => { const e = h('div', 'gloss', NB, html); px(e, x, y); css(e, { fontSize: '27px' }); return e; };
  const sH = seg(0, 3, 350), sM = seg(4, 5, 350), sT = seg(6, 9, 350);
  const nH = note('开头：估得出来<br><span class="g">≈ 26000 × 92000 = 2,392,000,000</span>', 44, 392);
  const nT = note('末尾：只看两个数的末尾<br><span class="g">5992 × 2138 = 12,810,896</span>', 44, 498);
  const nM = note('中间：要一位一位地进位', 44, 604);
  [[sH, nH, T('c9', '开头') - 0.1], [sT, nT, T('c10', '末尾') - 0.1], [sM, nM, T('c11', '中间') - 0.1]].forEach(([sg, n, t]) => {
    fromTo(sg.e, t, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out' }); show(n, t + 0.2, { y: 8, d: 0.45 }); sfx('tick', t, { g: 0.3 });
  });
  [D0[4], D0[5]].forEach((d) => to(d, T('c11', '进位') - 0.2, { color: '#1c1c1c', fontWeight: 600, duration: 0.3 }));
  const errBox = h('div', 'abs', NB); const eb0 = box(D1[4], NB), eb1 = box(D1[5], NB);
  px(errBox, eb0.x - 8, eb0.y + 4, eb1.r - eb0.x + 16, eb0.h - 4); css(errBox, { border: '2px solid #a5402d' });
  show(errBox, T('c12', '中间') - 0.15, { y: 0, s: 1.15, d: 0.35 }); sfx('pop', T('c12', '中间'), { g: 0.35 });

  // ── C：人的草稿纸，与模型的回答纸 ──
  const HS = sheet(desk, 1640, -340, 560, 700);
  show(HS, T('c13', '纸') - 0.4, { y: 0, x: 30, d: 0.6 }); show(HS.shadowEl, T('c13', '纸') - 0.4, { y: 0, d: 0.6, a: 0.7 });
  const hl = h('div', 'no', HS, '人打的草稿'); px(hl, 44, 34);
  show(hl, T('c13', '纸') - 0.2, { y: 6, d: 0.4 });
  const scrib = greyLines(HS, 44, 120, [420, 300, 380, 260, 340, 200], 46, 10);
  scrib.forEach((e, i) => fromTo(e, T('c13', '写一写') - 0.3 + i * 0.12, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4, ease: 'power2.out' }));
  const S2 = sheet(desk, 2280, -340, 600, 700);
  show(S2, T('c14', '写进') - 0.5, { y: 0, x: 30, d: 0.6 }); show(S2.shadowEl, T('c14', '写进') - 0.5, { y: 0, d: 0.6, a: 0.7 });
  header(S2, '第二次', '先写过程，再给答案', 600, T('c14', '写进') - 0.3);
  const noPaper = board('<span class="note" style="font-size:30px">模型手边没有纸</span>', 2280, 400, 0);
  show(noPaper, T('c14', '没有纸') - 0.2, { y: 6, d: 0.4 }); hide(noPaper, T('c15') - 0.2, { y: 0, d: 0.3 });
  const rowsC = [];
  const put = (txt, y, t) => { const r = stream(S2, txt, 44, y, 28, t, 40); rowsC.push(r.e); return r; };
  put('92138 = 92000 + 138', 160, T('c15', '拆成') - 0.1);
  put('25992 × 92000 = 2,391,264,000', 224, T('c16', '分别乘') - 0.25);
  const r3 = put('25992 × 138 = 3,586,896', 288, T('c16', '分别乘') + 0.45);
  put('2,391,264,000 + 3,586,896', 352, T('c16', '加起来') - 0.2);
  const r5 = put('　= 2,394,850,896', 416, T('c16', '加起来') + 0.45);
  const rr = h('div', 'hair l', S2); px(rr, 44, 490, 512, 1); fromTo(rr, r5.end + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  const ans2 = ln(S2, '答案　<span class="u">2394850896</span>', 44, 512, 36); show(ans2, r5.end + 0.2, { y: 6, d: 0.4 });
  // 每一步都不大：一行一行轻轻垫灰
  rowsC.forEach((e, i) => { const b = band(S2, 34, 156 + i * 64, 532, 52); show(b, T('c17', '每一步') + i * 0.28, { y: 0, d: 0.25 }); hide(b, T('c17', '每一步') + i * 0.28 + 0.6, { y: 0, d: 0.3 }); });
  // 写下的结果，后面都读得到：最后两行连回前面的部分积
  const ovC = inkLayer(S2, 600, 700);
  const back1 = svg('path', { d: 'M520 368 C 575 340, 575 250, 520 236', fill: 'none', stroke: '#9a9a9a', 'stroke-width': 2 }, ovC);
  const back2 = svg('path', { d: 'M440 362 C 500 336, 505 310, 440 300', fill: 'none', stroke: '#9a9a9a', 'stroke-width': 2 }, ovC);
  draw(back1, T('c18', '读到') - 0.5, 0.6); draw(back2, T('c18', '读到') - 0.3, 0.5);
  // 这些字就是它的草稿纸：人的草稿纸挪过来，叠在回答纸后面
  const tMerge = T('c19', '草稿纸') - 0.6;
  fromTo(HS, tMerge, { left: '1640px', top: '-340px' }, { left: '2262px', top: '-360px', duration: 1.0, ease: 'power2.inOut' });
  fromTo(HS.shadowEl, tMerge, { left: '1658px', opacity: 0.7 }, { left: '2280px', opacity: 0, duration: 1.0, ease: 'power2.inOut' });
  to(HS, tMerge + 0.2, { opacity: 0.5, duration: 0.8 });
  css(HS, { zIndex: 0 }); css(S2, { zIndex: 1 });
  hide(hl, tMerge, { y: 0, d: 0.3 });
  sfx('whoosh', tMerge, { g: 0.2 });

  // ── D：一串点；本片 100 道题 ──
  const D = sheet(desk, 3020, -360, 700, 760);
  show(D, T('c20') + 0.6, { y: 0, d: 0.5 }); show(D.shadowEl, T('c20') + 0.6, { y: 0, d: 0.5, a: 0.7 });
  header(D, 'Wei 等，2022 · 对照', '先写一串点，再给答案', 700, T('c20', '谷歌') - 0.1);
  const dots = stream(D, '· · · · · · · · · · · · · · · · · · · ·', 44, 170, 34, T('c21', '一串点') - 0.2, 30);
  const eqLen = ln(D, '25992 × 92000 = 2,391,264,000', 44, 230, 28, 'g'); show(eqLen, T('c21', '长度') - 0.2, { y: 6, d: 0.4 });
  const lenNote = h('div', 'note', D, '点的个数和算式的长度一样'); px(lenNote, 44, 286); css(lenNote, { fontSize: '24px' }); show(lenNote, T('c21', '一样') - 0.2, { y: 6, d: 0.4 });
  const rowsD = barRows(D, [
    { label: '直接回答', value: 6.5, max: 10, text: '6.5%' },
    { label: '先写一串点', value: 6.4, max: 10, text: '6.4%' },
  ], 44, 360, 300, 56, 190);
  growRows(rowsD, [T('c22', '直接') - 0.3, T('c22', '差不多') - 0.3]);
  const dn = h('div', 'note', D, 'LaMDA 137B · GSM8K'); px(dn, 44, 480); css(dn, { fontSize: '22px', color: '#707070' }); show(dn, T('c22', '差不多'), { y: 0, d: 0.4 });

  const E = sheet(desk, 3820, -360, 820, 760);
  show(E, T('c23') - 0.2, { y: 0, d: 0.5 }); show(E.shadowEl, T('c23') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(E, 'DeepSeek · 2026 年 11 月 3 日', '一百道乘法，每种位数 20 道', 820, T('c23', '一百道') - 0.2);
  const cols = [['只报答案', [20, 16, 3, 0, 0], 'g'], ['先写过程', [20, 20, 20, 20, 19], '']];
  const head = h('div', 'abs', E); px(head, 44, 160, 732, 40);
  ['位数', '只报答案（对几道）', '先写过程（对几道）'].forEach((t, i) => { const e = h('div', 'abs note', head, t); px(e, [0, 140, 440][i], 0); css(e, { fontSize: '28px' }); });
  show(head, T('c23', '三位数') - 0.2, { y: 6, d: 0.4 });
  const cells = [];
  for (let r = 0; r < 5; r++) {
    const y = 214 + r * 78;
    const dl = ln(E, `${r + 3} 位`, 44, y, 28); show(dl, T('c23', '三位数') + r * 0.1, { y: 6, d: 0.35 });
    cols.forEach(([, vals], ci) => {
      const x = 44 + [140, 440][ci], v = vals[r];
      const tr_ = h('div', 'abs', E); px(tr_, x, y + 10, 240, 24); css(tr_, { background: '#f1f1f1' });
      const b = h('div', 'abs', E); px(b, x, y + 10, Math.max(2, 240 * v / 20), 24); css(b, { background: ci === 0 && v < 10 ? '#a5402d' : '#1c1c1c', transformOrigin: '0 50%' });
      const n = ln(E, `${v}`, x + 252, y, 28);
      cells.push({ ci, r, tr_, b, n });
    });
  }
  cells.forEach(({ ci, r, tr_, b, n }) => {
    const t = (ci === 0 ? T('c24', '位数一多') - 0.4 : T('c25', '先写过程') - 0.2) + r * 0.12;
    show(tr_, t, { y: 0, d: 0.3 }); fromTo(b, t + 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); show(n, t + 0.45, { y: 0, d: 0.3 });
  });
  const sum = h('div', 'gloss', E, '只报答案：100 道对 39 道<br>先写过程：100 道对 99 道'); px(sum, 44, 616); css(sum, { fontSize: '28px' });
  show(sum, T('c25', '只错') - 0.2, { y: 8, d: 0.45 }); sfx('tick', T('c25', '只错'), { g: 0.4 });

  // 镜头：A（看 token 与一摞）→ B → C → D → E
  rig.track(s.start, { x: 1305, y: 520, k: 1.15 }, [
    [c0 + 0.1, { x: 1295 }, Math.max(0.5, T('c4') - c0 - 0.6), { ease: 'none' }],
    [T('c4') - 0.4, { x: 990, y: 770, k: 0.95 }, 1.2],                       // 留出上方，看一层一层的一摞
    [null, { x: 982 }, Math.max(0.5, Tend('c8') - T('c4') - 1.0), { ease: 'none' }],
    [Tend('c8') + 0.1, { x: -122, y: 520, k: 1.05 }, 1.2],
    [null, { x: -130 }, Math.max(0.5, T('c13') - Tend('c8') - 1.6), { ease: 'none' }],
    [T('c13') - 0.3, { x: -1300, y: 540, k: 1.0 }, 1.2],
    [null, { x: -1310 }, Math.max(0.5, Tend('c19') - T('c13') - 1.2), { ease: 'none' }],
    [Tend('c19') + 0.15, { x: -2578, y: 520, k: 1.05 }, 1.2],
    [null, { x: -2588 }, Math.max(0.5, T('c23') - Tend('c19') - 1.6), { ease: 'none' }],
    [T('c23') - 0.4, { x: -3270, y: 520, k: 1.0 }, 1.2],
    [null, { x: -3280 }, Math.max(0.5, s.end - T('c23') - 0.8), { ease: 'none' }],
  ]);
  [T('c4') - 0.4, Tend('c8') + 0.1, T('c13') - 0.3, Tend('c19') + 0.15, T('c23') - 0.4].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
