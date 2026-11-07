// 01 一句话：两篇论文像印出来的纸摊在桌上。左边谷歌的思维链论文（S1，图 1 的例题，中文为翻译），右边「Let's think step by step」（S2）。
// 数字：S1 表 2（PaLM 540B，GSM8K 17.9% → 56.9%）；S2 摘要（text-davinci-002，GSM8K 10.4% → 40.7%）。
scene('origin', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                              // 引擎镜头不动；运动由 rig 完成
  const { desk, rig } = makeDesk(world, { x: 1500, y: 560, rx: 26, rz: -2, k: 1.1 });
  const W = 820, H = 960;
  const A = sheet(desk, -900, -470, W, H), B = sheet(desk, 40, -470, W, H);
  show(A, c0 + 0.1, { y: 0, d: 0.5 }); show(A.shadowEl, c0 + 0.1, { y: 0, d: 0.5, a: 0.7 });

  // 论文抬头：作者与时间、英文标题、中文意思
  const paperHead = (sh, meta, title, zh, t) => {
    const m = h('div', 'no', sh, meta); px(m, 44, 34); css(m, { fontSize: '26px' });
    const ti = para(sh, title, 44, 80, W - 88, 30); css(ti, { fontWeight: '600', lineHeight: '1.3' });
    const z = h('div', 'note', sh, zh); px(z, 44, 166); css(z, { fontSize: '26px' });
    const r = h('div', 'hair', sh); px(r, 44, 208, W - 88, 2);
    show(m, t, { y: 8, d: 0.4 }); show(ti, t + 0.1, { y: 8, d: 0.5 }); show(z, t + 0.35, { y: 6, d: 0.45 });
    fromTo(r, t + 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
    sfx('tick', t, { g: 0.35 });
  };
  paperHead(A, 'Wei 等 · Google · 2022 年 1 月', 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', '思维链提示，能引出大模型的推理', T('h1', '谷歌') - 0.1);

  // 例题：步骤写在答案前面
  const exL = h('div', 'note', A, '例题'); px(exL, 44, 220); css(exL, { fontSize: '30px' });
  const exQ = para(A, '罗杰有 5 个网球，又买了 2 罐，每罐 3 个。他现在有几个？', 44, 276, W - 88, 26);
  const exA = para(A, '答：罗杰原来有 5 个。2 罐每罐 3 个，是 6 个。5 + 6 = 11。答案是 11。', 44, 322, W - 88, 26);
  const exBand = band(A, 34, 320, W - 68, 90);
  show(exL, T('h2', '例题') - 0.2, { y: 6, d: 0.4 }); show(exQ, T('h2', '例题'), { y: 6, d: 0.5 });
  show(exA, T('h2', '步骤') - 0.1, { y: 6, d: 0.5 });
  show(exBand, T('h2', '前面') - 0.1, { y: 0, d: 0.5 });
  const exNote = h('div', 'note', A, '步骤在答案前面'); px(exNote, W - 320, 410); css(exNote, { fontSize: '28px' }); show(exNote, T('h2', '前面'), { y: 6, d: 0.4 });

  // 新题：模型照样子，先写步骤
  const nL = h('div', 'note', A, '新题'); px(nL, 44, 444); css(nL, { fontSize: '28px' });
  const nQ = para(A, '食堂有 23 个苹果，用掉 20 个做午饭，又买了 6 个，现在有几个？', 44, 490, W - 88, 26);
  show(nL, T('h3', '新题') - 0.25, { y: 6, d: 0.4 }); show(nQ, T('h3', '新题') - 0.1, { y: 6, d: 0.5 });
  const outL = h('div', 'note', A, '模型写出'); px(outL, 44, 560); css(outL, { fontSize: '28px' }); show(outL, T('h3', '先写') - 0.2, { y: 6, d: 0.4 });
  let tt = T('h3', '先写');
  ['食堂原来有 23 个，用掉 20 个，', '剩 23 − 20 = 3。又买了 6 个，', '3 + 6 = 9。答案是 9。'].forEach((txt, k) => { const r = stream(A, txt, 44, 606 + k * 40, 26, tt, 34); tt = r.end + 0.04; });
  const src1 = h('div', 'note', A, 'Wei 等，2022，图 1（中文为翻译）'); px(src1, 44, 734); css(src1, { fontSize: '26px', color: '#707070' });
  show(src1, T('h3', '先写') + 0.4, { y: 0, d: 0.4 });

  // 正确率：不到两成 → 将近六成
  const rowsA = barRows(A, [
    { label: '标准提示', value: 17.9, max: 60, text: '17.9%' },
    { label: '思维链提示', value: 56.9, max: 60, text: '56.9%' },
  ], 44, 790, 400, 54, 170);
  growRows(rowsA, [T('h4', '两成') - 0.3, T('h4', '六成') - 0.3]);
  const nA = h('div', 'note', A, 'PaLM 540B · GSM8K 数学应用题'); px(nA, 44, 900); css(nA, { fontSize: '26px', color: '#707070' });
  show(nA, T('h4', '数学') - 0.1, { y: 0, d: 0.4 });

  // 右边：不给例题，只加一句
  show(B, Tend('h4') + 0.1, { y: 0, d: 0.5 }); show(B.shadowEl, Tend('h4') + 0.1, { y: 0, d: 0.5, a: 0.7 });
  paperHead(B, 'Kojima 等 · 东京大学与 Google · 2022 年 5 月', 'Large Language Models are Zero-Shot Reasoners', '大模型不用示范，也会推理', T('h5', '另一组') - 0.1);
  const bL = h('div', 'note', B, '例题'); px(bL, 44, 232); css(bL, { fontSize: '30px' });
  const empty = h('div', 'abs', B); px(empty, 44, 266, W - 88, 70); css(empty, { border: '1.5px dashed #c4c4c4' });
  const emptyT = h('div', 'note', empty, '不给'); px(emptyT, 24, 14); css(emptyT, { fontSize: '28px' });
  show(bL, T('h5', '例题') - 0.3, { y: 6, d: 0.4 }); show(empty, T('h5', '例题') - 0.2, { y: 0, d: 0.4 }); show(emptyT, T('h5', '不用'), { y: 6, d: 0.4 });
  const qL = h('div', 'note', B, '问题'); px(qL, 44, 368); css(qL, { fontSize: '28px' });
  const qLines = greyLines(B, 44, 408, [700, 520], 34);
  show(qL, T('h6') - 0.1, { y: 6, d: 0.4 }); qLines.forEach((e, i) => show(e, T('h6') + i * 0.1, { y: 0, x: -10, d: 0.4 }));
  const ansL = h('div', 'note', B, '答'); px(ansL, 44, 478); css(ansL, { fontSize: '28px' }); show(ansL, T('h6', '加一句') - 0.1, { y: 6, d: 0.4 });
  const spell = ln(B, '', 44, 524, 42); css(spell, { fontStyle: 'italic' });
  [["Let's ", 'lets'], ['think ', 'think'], ['step ', 'step'], ['by step.', 'by']].forEach(([w, key]) => appear(h('span', '', spell, w), T('h6', key)));
  appear(spell, T('h6', 'lets'));
  const zh = ln(B, '我们一步一步来想。', 44, 590, 30, 'g'); show(zh, T('h7', '我们') - 0.1, { y: 6, d: 0.45 });
  const sBand = band(B, 34, 518, W - 68, 120);
  const after = greyLines(B, 44, 668, [640, 560, 300], 34);
  after.forEach((e, i) => show(e, Tend('h7') + 0.05 + i * 0.12, { y: 0, x: -10, d: 0.35 }));
  const rowsB = barRows(B, [
    { label: '直接问', value: 10.4, max: 60, text: '10.4%' },
    { label: '加上这一句', value: 40.7, max: 60, text: '40.7%' },
  ], 44, 790, 400, 54, 170);
  growRows(rowsB, [T('h8', '一成') - 0.3, T('h8', '四成') - 0.3]);
  const nB = h('div', 'note', B, 'text-davinci-002 · GSM8K'); px(nB, 44, 900); css(nB, { fontSize: '26px', color: '#707070' });
  show(nB, T('h8', '换一个模型'), { y: 0, d: 0.4 });

  // 模型没改，只多了几行字：两张纸上那几行垫灰
  show(sBand, T('h9', '多了') - 0.1, { y: 0, d: 0.5 });
  [nA, nB].forEach((e) => to(e, T('h9', '没改') - 0.1, { color: '#1c1c1c', duration: 0.4 }));
  sfx('pop', T('h9', '多了'), { g: 0.25 });

  rig.track(s.start, { x: 1500, y: 560, k: 1.1 }, [
    [c0 + 0.1, { x: 1490 }, Math.max(0.5, Tend('h3') - c0 - 0.6), { ease: 'none' }],
    [Tend('h3') - 0.4, { y: 300 }, 1.0],                                   // 往下看：正确率
    [null, { x: 1482 }, Math.max(0.5, Tend('h4') - Tend('h3') - 0.65), { ease: 'none' }],
    [T('h5') + 0.4, { x: 470, y: 560 }, 1.2],
    [null, { x: 462 }, Math.max(0.5, Tend('h7') - Tend('h4') - 1.6), { ease: 'none' }],
    [Tend('h7') + 0.05, { y: 300 }, 1.0],
    [null, { x: 456 }, Math.max(0.5, Tend('h8') - Tend('h7') - 1.2), { ease: 'none' }],
    [Tend('h8') + 0.1, { x: 980, y: 545, k: 0.9 }, 1.3],
    [null, { x: 970 }, Math.max(0.5, s.end - Tend('h8') - 1.6), { ease: 'none' }],
  ]);
  [T('h5') + 0.4, Tend('h8') + 0.1].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
