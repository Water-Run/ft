// 04 顺序：回到第三次。答案先写下，过程往往去凑它（L1 n5-03 answer_first；L3 §4：答错的 64 次里 38 次凑回第一行的错数）。
// 对照：S1 表 6（LaMDA 137B，GSM8K：直接回答 6.5，答案后写过程 6.1）；本片五位数 20 道：只报答案 3、先写过程 20、先写答案 2。
scene('order', ({ root, s, c0 }) => {
  const { desk, rig, board } = makeDesk(root, { x: 1727, y: 560, rx: 26, rz: -2, k: 1.3 });

  // ── 第三次的纸 ──
  const S3 = sheet(desk, -900, -350, 620, 700);
  show(S3, c0 + 0.1, { y: 0, d: 0.5 }); show(S3.shadowEl, c0 + 0.1, { y: 0, d: 0.5, a: 0.7 });
  header(S3, '第三次', '先写答案，再补过程', 620, c0 + 0.15);
  const first = ln(S3, '答案　<span class="n">2394841296</span>', 44, 158, 36);
  const L3 = ['25992 × 92138', '= 25992 × (92000 + 138)', '= 25992 × 92000 + 25992 × 138', '= 2391264000 + 3586896'];
  const rows = L3.map((t, k) => ln(S3, t, 44, 238 + k * 58, 27));
  const last = ln(S3, '= <span class="n">2394841296</span>', 44, 470, 36);
  [first, ...rows, last].forEach((e, i) => show(e, c0 + 0.3 + i * 0.08, { y: 6, d: 0.35 }));
  const bar = h('div', 'abs', S3); px(bar, 24, 244, 2, 202); css(bar, { background: '#b4b4b4', transformOrigin: '50% 0' });
  fromTo(bar, T('s1', '过程') - 0.2, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power2.out' });
  const procL = h('div', 'note', S3, '过程'); px(procL, 44, 590); css(procL, { fontSize: '30px' }); show(procL, T('s1', '过程'), { y: 6, d: 0.4 });
  const tWrong = T('s1', '错的') - 0.2;
  [first, last].forEach((e) => to(e.querySelector('.n'), tWrong, { color: '#a5402d', duration: 0.35 }));
  // 拆分、乘法都没错：三处铅笔勾
  const ticks = [1, 2, 3].map((k) => { const c = h('div', 'chk', S3); px(c, 540, 244 + k * 58); return c; });
  ticks.forEach((c, i) => show(c, T('s2', '拆分') + i * 0.25, { y: 0, d: 0.3 }));
  sfx('tick', T('s2', '乘法'), { g: 0.3 });
  const ul = h('div', 'hair', S3); const nb = box(last.querySelector('.n'), S3); px(ul, nb.x, nb.b + 4, nb.w, 2); css(ul, { background: '#a5402d' });
  const tBack = T('s2', '加回了') - 0.1;
  fromTo(ul, tBack, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  const ink = inkLayer(S3, 620, 700);
  const arc = svg('path', { d: 'M440 498 C 560 470, 575 230, 452 186', fill: 'none', stroke: '#a5402d', 'stroke-width': 2 }, ink);
  const head = svg('path', { d: 'M466 176 l -16 9 l 14 12', fill: 'none', stroke: '#a5402d', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, ink);
  draw(arc, tBack + 0.1, 0.8); show(head, tBack + 0.85, { y: 0, d: 0.2 });
  sfx('tick', tBack + 0.1, { g: 0.45 });

  // ── 一块接一块：答案先落下，过程接着写 ──
  const NT = 12, TX0 = -160, TW = 88, TG = 104, TYY = -60;
  const tl0 = T('s3', '一块接一块') - 0.2;
  const toks = [];
  for (let i = 0; i < NT; i++) {
    const t = tile(desk, '', TX0 + i * TG, TYY, TW, 70, 16);
    if (i < 4) css(t.top, { boxShadow: 'inset 0 0 0 1.5px #a5402d' });
    const ti = tl0 + i * 0.14;
    fromTo(t, ti, { autoAlpha: 0, z: 60 }, { autoAlpha: 1, z: 0, duration: 0.3, ease: 'power2.in' });
    toks.push(t);
  }
  sfx('tick', tl0, { g: 0.3 }); sfx('tick', tl0 + 0.56, { g: 0.25 });
  const gA = board('<span class="note" style="font-size:30px;color:#a5402d">答案</span>', TX0, TYY + 76, 0);
  const gP = board('<span class="note" style="font-size:30px">过程</span>', TX0 + 4 * TG, TYY + 76, 0);
  show(gA, tl0 + 0.3, { y: 6, d: 0.35 }); show(gP, tl0 + 0.9, { y: 6, d: 0.35 });
  const dir = board('<span class="note" style="font-size:30px">→ 只能往后写</span>', TX0 + NT * TG + 10, TYY + 10, 0);
  show(dir, T('s3', '收不回来') - 0.3, { y: 0, x: -10, d: 0.4 });
  // 往往去凑它：从过程那一头连回答案
  const ov = inkLayer(desk, 1, 1);
  const bend = svg('path', { d: `M${TX0 + 11 * TG + 34} ${TYY - 6} C ${TX0 + 9 * TG} ${TYY - 170}, ${TX0 + 3 * TG} ${TYY - 170}, ${TX0 + 2 * TG + 34} ${TYY - 6}`, fill: 'none', stroke: '#a5402d', 'stroke-width': 2 }, ov);
  draw(bend, T('s4', '摆在') - 0.2, 0.9);
  const stat = board('<div class="gloss" style="position:static">先写答案、答错的 64 次里<br>有 38 次，过程最后凑回了开头那个错数</div>', TX0, TYY + 160, 0);
  show(stat, T('s4', '往往') - 0.15, { y: 8, d: 0.45 }); sfx('blip', T('s4', '往往'), { g: 0.3 });

  // ── 对照：论文与本片 ──
  const P = sheet(desk, 1180, -360, 760, 760);
  show(P, T('s5') - 0.2, { y: 0, d: 0.5 }); show(P.shadowEl, T('s5') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(P, 'Wei 等，2022 · 对照', '过程写在答案后面', 760, T('s5', '谷歌') - 0.1);
  const rowsP = barRows(P, [
    { label: '直接回答', value: 6.5, max: 10, text: '6.5%' },
    { label: '答案后写过程', value: 6.1, max: 10, text: '6.1%' },
  ], 44, 170, 300, 56, 210);
  growRows(rowsP, [T('s5', '这种写法') - 0.2, T('s5', '几乎一样') - 0.4]);
  const pn = h('div', 'note', P, 'LaMDA 137B · GSM8K'); px(pn, 44, 290); css(pn, { fontSize: '22px', color: '#707070' }); show(pn, T('s5', '几乎一样'), { y: 0, d: 0.4 });
  const r2 = h('div', 'hair l', P); px(r2, 44, 350, 672, 1); fromTo(r2, T('s6') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.5 });
  const t6 = h('div', 'lab', P, '本片：五位数 20 道'); px(t6, 44, 376); css(t6, { fontSize: '28px', fontWeight: 500 }); show(t6, T('s6', '五位数') - 0.2, { y: 6, d: 0.4 });
  const rows6 = barRows(P, [
    { label: '只报答案', value: 3, max: 20, text: '3' },
    { label: '先写过程', value: 20, max: 20, text: '20' },
    { label: '先写答案', value: 2, max: 20, text: '2', cls: 'err' },
  ], 44, 440, 300, 56, 210);
  growRows(rows6, [T('s6', '五位数'), T('s6', '这样问') - 0.2, T('s6', '两道') - 0.35]);
  sfx('tick', T('s6', '两道'), { g: 0.35 });

  // 事后补的解释：回到第三次，过程淡成铅灰
  rows.forEach((e) => to(e, T('s7', '事后') - 0.3, { color: '#707070', duration: 0.5 }));

  rig.track(s.start, { x: 1727, y: 560, k: 1.3 }, [
    [c0 + 0.1, { x: 1717 }, Math.max(0.5, T('s3') - c0 - 0.6), { ease: 'none' }],
    [T('s3') - 0.4, { x: 454, y: 560, k: 1.1 }, 1.1],
    [null, { x: 444 }, Math.max(0.5, T('s5') - T('s3') - 1.2), { ease: 'none' }],
    [T('s5') - 0.45, { x: -420, y: 540, k: 1.05 }, 1.1],
    [null, { x: -430 }, Math.max(0.5, T('s7') - T('s5') - 0.9), { ease: 'none' }],
    [T('s7') - 0.4, { x: 1610, y: 540, k: 1.1 }, 1.3],
    [null, { x: 1600 }, Math.max(0.5, s.end - T('s7') - 1.0), { ease: 'none' }],
  ]);
  [T('s3') - 0.4, T('s5') - 0.45, T('s7') - 0.4].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
