// 05 说出来的理由：写在前面的思考，也未必说出真正的原因。
//   S9（Anthropic，2025）：选择题里塞提示「A Stanford professor indicates the answer is (A). What do you think?」；
//     模型因提示改选的题里，思考提到提示的比例：Claude 3.7 Sonnet 25%、DeepSeek R1 39%（MMLU 与 GPQA 平均）
//   S10（Nisbett & Wilson，1977）：商店里四双一模一样的丝袜，最右边的被选中约为最左边的四倍；没人主动提位置，直接问几乎都否认，
//     「usually with a worried glance at the interviewer」。论文只给了最右与最左的倍数，画面只比较这两双。
scene('faith', ({ root, s, c0 }) => {
  const { desk, rig, board } = makeDesk(root, { x: 1880, y: 560, rx: 26, rz: -2, k: 1.15 });

  // ── 第二次的纸：写在答案前面的那段思考 ──
  const S2 = sheet(desk, -1100, -340, 600, 700);
  show(S2, c0 + 0.1, { y: 0, d: 0.5 }); show(S2.shadowEl, c0 + 0.1, { y: 0, d: 0.5, a: 0.7 });
  header(S2, '第二次', '先写过程，再给答案', 600, c0 + 0.15);
  ['92138 = 92000 + 138', '25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896', '2,391,264,000 + 3,586,896', '　= 2,394,850,896'].forEach((t, k) => show(ln(S2, t, 44, 160 + k * 58, 26), c0 + 0.3 + k * 0.07, { y: 6, d: 0.35 }));
  const a2 = ln(S2, '答案　<span class="u">2394850896</span>', 44, 500, 36); show(a2, c0 + 0.7, { y: 6, d: 0.35 });
  const b2 = band(S2, 34, 154, 532, 300); show(b2, T('f1', '思考') - 0.2, { y: 0, d: 0.5 });
  const lb2 = h('div', 'note', S2, '写在答案前面的思考'); px(lb2, 44, 590); css(lb2, { fontSize: '30px' }); show(lb2, T('f1', '思考'), { y: 6, d: 0.4 });

  // ── Anthropic 的实验 ──
  const A = sheet(desk, -300, -480, 820, 1000);
  show(A, T('f2') - 0.3, { y: 0, d: 0.5 }); show(A.shadowEl, T('f2') - 0.3, { y: 0, d: 0.5, a: 0.7 });
  const meta = h('div', 'no', A, 'Chen 等 · Anthropic · 2025 年 5 月'); px(meta, 44, 34); css(meta, { fontSize: '26px' });
  const ti = para(A, "Reasoning Models Don't Always Say What They Think", 44, 72, 732, 30); css(ti, { fontWeight: '600', lineHeight: '1.3' });
  const zh = h('div', 'note', A, '推理模型，不总是说出它的想法'); px(zh, 44, 162); css(zh, { fontSize: '26px' });
  const hr = h('div', 'hair', A); px(hr, 44, 208, 732, 2);
  const tA = T('f2', 'Anthropic') - 0.2;
  show(meta, tA, { y: 8, d: 0.4 }); show(ti, tA + 0.1, { y: 8, d: 0.5 }); show(zh, tA + 0.35, { y: 6, d: 0.45 });
  fromTo(hr, tA + 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); sfx('tick', tA, { g: 0.35 });
  const qL = h('div', 'note', A, '选择题'); px(qL, 44, 226); css(qL, { fontSize: '28px' });
  const qg = greyLines(A, 44, 274, [700, 560], 34);
  const opts = ['(A)', '(B)', '(C)', '(D)'].map((o, i) => { const e = ln(A, o, 44 + i * 180, 340, 28); greyLines(e, 56, 16, [90], 0, 10); return e; });
  show(qL, T('f3', '选择题') - 0.3, { y: 6, d: 0.35 });
  qg.forEach((e, i) => show(e, T('f3', '选择题') - 0.2 + i * 0.1, { y: 0, x: -10, d: 0.35 }));
  opts.forEach((e, i) => show(e, T('f3', '选择题') + i * 0.08, { y: 6, d: 0.35 }));
  const hint = ln(A, '一位斯坦福教授认为答案是 (A)。你怎么看？', 44, 404, 30); css(hint, { fontWeight: 500 });
  const hintEn = ln(A, 'A Stanford professor indicates the answer is (A). What do you think?', 44, 452, 22, 'g');
  const hb = band(A, 34, 396, 752, 92);
  show(hb, T('f3', '提示') - 0.2, { y: 0, d: 0.4 }); show(hint, T('f3', '提示'), { y: 6, d: 0.45 }); show(hintEn, T('f3', '斯坦福') + 0.3, { y: 6, d: 0.45 });
  sfx('pop', T('f3', '提示'), { g: 0.3 });
  const ansL = h('div', 'note', A, '模型的回答'); px(ansL, 44, 516); css(ansL, { fontSize: '24px' });
  const ans = ln(A, '(A)', 220, 508, 34);
  const ansN = h('div', 'note', A, '跟着提示改了答案'); px(ansN, 300, 516); css(ansN, { fontSize: '24px' });
  show(ansL, T('f4', '有些题') - 0.1, { y: 6, d: 0.35 }); show(ans, T('f4', '改了') - 0.2, { y: 6, s: 1.1, d: 0.35 }); show(ansN, T('f4', '改了'), { y: 6, d: 0.35 });
  // 它写下的思考：一行行查过去，有没有提那条提示
  const thL = h('div', 'note', A, '它写下的思考'); px(thL, 44, 574); css(thL, { fontSize: '24px' });
  const th = greyLines(A, 44, 614, [700, 640, 690, 520], 30, 10);
  show(thL, T('f5', '思考') - 0.3, { y: 6, d: 0.35 }); th.forEach((e, i) => show(e, T('f5', '思考') - 0.2 + i * 0.08, { y: 0, x: -10, d: 0.3 }));
  const scanB = h('div', 'abs', A); px(scanB, 34, 604, 752, 30); css(scanB, { background: 'rgba(0,0,0,.06)' });
  show(scanB, T('f5', '提到') - 0.2, { y: 0, d: 0.01 });
  to(scanB, T('f5', '提到') - 0.18, { top: '694px', opacity: 0, duration: 1.0, ease: 'none' });
  const stH = h('div', 'note', A, '思考里提到了这条提示的比例'); px(stH, 44, 760); css(stH, { fontSize: '24px', color: '#1c1c1c' });
  show(stH, T('f6') - 0.3, { y: 6, d: 0.35 });
  const rowsA = barRows(A, [
    { label: 'Claude 3.7 Sonnet', value: 25, max: 100, text: '25%' },
    { label: 'DeepSeek R1', value: 39, max: 100, text: '39%' },
  ], 44, 802, 330, 56, 250);
  growRows(rowsA, [T('f6', '四分之一') - 0.4, T('f7', '不到') - 0.3]);
  const aN = h('div', 'note', A, 'MMLU 与 GPQA 平均'); px(aN, 44, 922); css(aN, { fontSize: '22px', color: '#707070' }); show(aN, T('f7', '四成'), { y: 0, d: 0.4 });

  // ── 1977：商店里的丝袜 ──
  const Nw = sheet(desk, 720, -440, 900, 900);
  show(Nw, T('f8') - 0.3, { y: 0, d: 0.5 }); show(Nw.shadowEl, T('f8') - 0.3, { y: 0, d: 0.5, a: 0.7 });
  const m2 = h('div', 'no', Nw, 'Nisbett 与 Wilson · 1977 · Psychological Review'); px(m2, 44, 34); css(m2, { fontSize: '26px' });
  const t2 = para(Nw, 'Telling More Than We Can Know', 44, 72, 812, 30); css(t2, { fontWeight: '600' });
  const z2 = h('div', 'note', Nw, '说出来的，比我们知道的多'); px(z2, 44, 124); css(z2, { fontSize: '26px' });
  const hr2 = h('div', 'hair', Nw); px(hr2, 44, 170, 812, 2);
  const tN = T('f8', '测过') - 0.4;
  show(m2, tN, { y: 8, d: 0.4 }); show(t2, tN + 0.1, { y: 8, d: 0.5 }); show(z2, tN + 0.35, { y: 6, d: 0.45 });
  fromTo(hr2, tN + 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); sfx('tick', tN, { g: 0.35 });
  const shop = h('div', 'note', Nw, '商店里，以消费者调查的名义'); px(shop, 44, 194); css(shop, { fontSize: '28px', color: '#1c1c1c' });
  show(shop, T('f9', '商店') - 0.2, { y: 6, d: 0.4 });
  // 四双一模一样的丝袜：细线画
  const ink = inkLayer(Nw, 900, 900);
  const SX = [150, 330, 510, 690];
  const sock = (x) => svg('path', { d: `M${x - 26} 260 L${x + 26} 260 L${x + 24} 440 C ${x + 26} 470, ${x + 50} 478, ${x + 74} 484 C ${x + 92} 489, ${x + 90} 512, ${x + 66} 512 L${x - 6} 510 C ${x - 26} 508, ${x - 30} 490, ${x - 26} 460 Z`, fill: '#fafafa', stroke: '#1c1c1c', 'stroke-width': 2, 'stroke-linejoin': 'round' }, ink);
  const socks = SX.map(sock);
  socks.forEach((p, i) => show(p, T('f10', '四双') - 0.3 + i * 0.12, { y: 10, d: 0.4 }));
  const pick = h('div', 'note', Nw, '挑出质量最好的一双'); px(pick, 44, 540); css(pick, { fontSize: '26px' }); show(pick, T('f10', '质量') - 0.2, { y: 6, d: 0.4 });
  const posL = h('div', 'note', Nw, '最左'), posR = h('div', 'note', Nw, '最右');
  px(posL, SX[0] - 30, 590); px(posR, SX[3] - 30, 590); [posL, posR].forEach((e) => css(e, { fontSize: '26px' }));
  show(posL, T('f11', '最右') - 0.3, { y: 6, d: 0.35 }); show(posR, T('f11', '最右') - 0.2, { y: 6, d: 0.35 });
  // 被挑中的次数：最右约为最左的四倍（只画这两双）
  const barL = h('div', 'abs', Nw); px(barL, SX[0] + 60, 640, 40, 20); css(barL, { background: '#1c1c1c', transformOrigin: '50% 100%' });
  const barR = h('div', 'abs', Nw); px(barR, SX[3] + 60, 580, 40, 80); css(barR, { background: '#1c1c1c', transformOrigin: '50% 100%' });
  fromTo(barL, T('f11', '最左') - 0.2, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.out' });
  fromTo(barR, T('f11', '最右') + 0.1, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'power2.out' });
  const four = h('div', 'ln', Nw, '将近 4 倍'); px(four, SX[3] + 120, 610); css(four, { fontSize: '30px' }); show(four, T('f11', '四倍') - 0.3, { y: 6, d: 0.4 });
  sfx('pop', T('f11', '四倍'), { g: 0.3 });
  const q1 = h('div', 'gloss', Nw, '问理由：没有一个人主动提到位置'); px(q1, 44, 690); css(q1, { fontSize: '28px' });
  const q2 = h('div', 'gloss', Nw, '直接问是不是位置：几乎所有人都说不是'); px(q2, 44, 746); css(q2, { fontSize: '28px' });
  show(q1, T('f12', '没有一个人') - 0.2, { y: 8, d: 0.45 }); show(q2, T('f13', '都说不是') - 0.4, { y: 8, d: 0.45 });
  const en = ln(Nw, '“… usually with a worried glance at the interviewer …”', 44, 806, 24, 'g'); css(en, { fontStyle: 'italic' });
  const enZ = ln(Nw, '多半还会不放心地看调查员一眼', 44, 846, 26);
  show(en, T('f14', '瞟') - 0.3, { y: 6, d: 0.45 }); show(enZ, T('f14', '调查员') - 0.2, { y: 6, d: 0.45 });

  rig.track(s.start, { x: 1880, y: 560, k: 1.15 }, [
    [c0 + 0.1, { x: 1870 }, Math.max(0.5, T('f2') - c0 - 0.6), { ease: 'none' }],
    [T('f2') - 0.45, { x: 845, y: 740, k: 1.05 }, 1.1],
    [null, { x: 835 }, Math.max(0.5, T('f5') - T('f2') - 1.2), { ease: 'none' }],
    [T('f5') - 0.3, { x: 845, y: 330, k: 1.05 }, 1.0],
    [null, { x: 835 }, Math.max(0.5, T('f8') - T('f5') - 1.0), { ease: 'none' }],
    [T('f8') - 0.45, { x: -190, y: 690, k: 1.0 }, 1.1],
    [null, { x: -200 }, Math.max(0.5, T('f11') - T('f8') - 1.2), { ease: 'none' }],
    [T('f11') - 0.4, { x: -190, y: 380, k: 1.0 }, 1.0],
    [null, { x: -200 }, Math.max(0.5, s.end - T('f11') - 0.9), { ease: 'none' }],
  ]);
  [T('f2') - 0.45, T('f8') - 0.45].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
