// 03 越写越长。从人写进提问里的一句话，到练进模型；o1、R1 的分量；今天的主流模型；再回到开头那道题。
// 柱状对比都用一摞摞纸（高度就是数值），数字写在纸上。镜头沿着稿纸往前走，看高度时抬起来。
// 事实：S1、S2；S11；S12（表 2、表 8、第 2 节）；S16–S19；L2（n5-03 的思考、25/25、平均思考 93–550 块）。
scene('learn', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, blankCam(0, 92 + TILE));
  chapterHead(W, s, '03', '越写越长', 1, T('r1') - 0.2);
  const off = (a, d = 0.6) => (t) => 1 - ramp(t, a, d);

  // ── 一、例题 → 一句话 ──
  const AY = 0, X0 = -760;
  const aOff = off(T('r4') + 0.35, 0.4);
  const exOff = off(T('r1b', '不用给') + 0.55);
  const tE = T('r1', '例题') - 0.7;
  const e1 = W.write('例题：  ……………  写好的一步一步  ……………  答案', X0, AY - 300, { fs: 66, cls: 'pencil', t0: tE, t1: tE + 0.5, off: exOff, pen: false });
  const e2 = W.write('例题：  ……………  写好的一步一步  ……………  答案', X0, AY - 190, { fs: 66, cls: 'pencil', t0: tE + 0.3, t1: tE + 0.8, off: exOff, pen: false });
  const exT = W.write('谷歌 2022', X0, AY - 416, { fs: 80, cls: 'bold', t0: T('r1') + 0.1, t1: T('r1') + 0.55, off: exOff });
  W.hatch(e1.x0, AY - 346, e1.x1, AY - 142, { t0: T('r1', '写好') - 0.1, t1: T('r1', '例题') + 0.3, gap: 22, w: 17, op: 0.42, off: exOff });
  const tX = T('r1b', '不用给') - 0.6;
  W.line(e1.x0 - 10, e1.y, e1.x1 + 10, e1.y, { t0: tX, t1: tX + 0.32, w: 7, color: RED, off: exOff });
  W.line(e2.x0 - 10, e2.y, e2.x1 + 10, e2.y, { t0: tX + 0.36, t1: tX + 0.68, w: 7, color: RED, off: exOff });
  const qa = W.write('Q：一道应用题', X0, AY, { fs: 84, t0: T('r1') + 0.5, t1: T('r1') + 1.2, off: aOff });
  const qb = W.write('A：', X0 + 660, AY, { fs: 84, t0: T('r1') + 1.3, t1: T('r1') + 1.45, off: aOff });
  const ph = W.write("Let's think step by step.", qb.x1 + 12, AY, { fs: 96, cls: 'bold', t0: T('r1c', '加一句') - 0.25, t1: T('r1c', '一步一步') + 0.45, off: aOff });
  const zh = W.write('「我们一步一步来想」', ph.x0, AY + 118, { fs: 70, cls: 'pencil', t0: T('r1c', '一步一步') - 0.1, t1: T('r1c', '一步一步') + 0.5, off: (t) => aOff(t) * (1 - ramp(t, T('r3') - 0.4, 0.4)), pen: false });
  const cite = W.write('2022 年 5 月', qa.x0, AY + 118, { fs: 66, cls: 'pencil', t0: T('r1b', '几个月后') - 0.1, t1: T('r1b', '几个月后') + 0.4, off: aOff, pen: false });
  sfx('tick', T('r1c', '加一句') - 0.25, { g: 0.16 });
  // 正确率：两道墨条，长度就是百分比
  const BX = -480, BYs = [AY - 560, AY - 400], tA = [T('r2', '一成') - 0.5, T('r2', '四成') - 0.55], SC = 22;
  const gs = W.write('GSM8K 数学应用题，正确率', -780, AY - 690, { fs: 62, cls: 'pencil', t0: T('r2', '应用题') - 0.3, t1: T('r2', '应用题') + 0.3, off: aOff, pen: false });
  const barsR = [[10.4, '直接回答'], [40.7, '加这一句']].map(([v, n_], i) => {
    const y = BYs[i], a = W.write(n_, BX - 34, y, { fs: 84, align: 'r', t0: tA[i] - 0.1, t1: tA[i] + 0.2, off: aOff, pen: false });
    W.line(BX, y, BX + v * SC, y, { t0: tA[i], t1: tA[i] + 0.7, w: 62, amp: 1, ease: smooth, off: aOff });
    const b = W.write(v + '%', BX + v * SC + 46, y, { fs: 110, cls: 'bold', t0: tA[i] + 0.65, t1: tA[i] + 0.9, off: aOff, pen: false });
    sfx('tick', tA[i] + 0.65, { g: 0.2 }); return [a, b];
  }).flat();
  // 人写进提问里的一句话
  const tR3 = T('r3', '提问里') - 0.4;
  W.box(ph.x0 - 22, AY - 72, ph.x1 + 22, AY + 72, { t0: tR3, t1: tR3 + 0.6, w: 6, off: aOff });
  const hw = W.write('人写进提问里的一句话', ph.x1 - 40, AY + 118, { fs: 76, align: 'r', t0: T('r3') + 0.15, t1: T('r3', '提问里') - 0.45, off: aOff });
  // 练进模型：这句话沉进一摞纸
  const MY = -2150, tM = T('r4', '练进') - 0.15;
  const ms = stack(W, 0, MY, { w: 520, d: 260, n: 96, gap: 6, rise: (t) => ramp(t, T('r4') - 0.5, 1.0, ease.out3), fill: (t) => ramp(t, tM, 1.4, smooth), op: off(T('r5') - 0.55) });
  const train = W.write('不用人提醒，练进了模型', 0, MY + 300, { fs: 100, cls: 'bold', align: 'c', t0: tM - 0.7, t1: tM + 0.35, off: off(T('r5') - 0.6) });

  // ── 二、o1 ──
  const OY = -3800, tO = T('r5', '发布');
  const o1T = W.write('2024  OpenAI o1', -760, OY - 260, { fs: 112, cls: 'bold', t0: tO - 0.3, t1: tO + 0.55 });
  const o1Q = W.write('题目', -760, OY - 110, { fs: 76, t0: tO + 0.4, t1: tO + 0.6, pen: false });
  const r4_ = seeded(91), thinkT0 = T('r5', '思考') - 0.6, thinkT1 = Tend('r5') + 0.1;
  for (let j = 0; j < 4; j++) { let x = -760; const y = OY + j * 86; const parts = 6; for (let k = 0; k < parts; k++) { const w = 130 + r4_() * 140; const a = lerp(thinkT0, thinkT1, (j + k / parts) / 4), b = lerp(thinkT0, thinkT1, (j + (k + 0.85) / parts) / 4); W.line(x, y, x + w, y, { t0: a, t1: b, w: 12, color: '#7e8088', op: 0.75, amp: 3, pen: k === 0 }); x += w + 28; } }
  const o1A = W.write('思考', -760 + 560, OY - 110, { fs: 76, cls: 'pencil', t0: thinkT0 - 0.15, pen: false });
  const o1B = W.write('答案', -760, OY + 4 * 86 + 40, { fs: 90, cls: 'bold', t0: thinkT1 + 0.1, t1: thinkT1 + 0.3 });

  // AIME：墨条（两次用到）
  const aime = (cy, rows, f) => rows.map(([name, v, ta, tv], j) => {
    const X = -500, y = cy + j * 190, a = W.write(name, X - 34, y, { fs: 100, align: 'r', t0: ta - 0.2, t1: ta + 0.05, off: f, pen: false });
    W.line(X, y, X + v * 14, y, { t0: ta, t1: ta + 0.75, w: 72, amp: 1, off: f, ease: smooth });
    const b = W.write(v + '%', X + v * 14 + 46, y, { fs: 118, cls: 'bold', t0: tv, t1: tv + 0.3, off: f, pen: false });
    sfx('tick', tv, { g: 0.2 }); return [a, b];
  }).flat();
  const AY1 = -5400, f1 = off(T('r6') - 0.55);
  const am1 = aime(AY1, [['GPT-4o', 9.3, T('r5b', '的') + 0.1, T('r5b', '不到一成') - 0.3], ['o1', 79.2, T('r5c') - 0.15, T('r5c', '将近八成') - 0.25]], f1);
  const at1 = W.write('数学竞赛题 AIME 2024，正确率', -760, AY1 - 190, { fs: 84, cls: 'pencil', t0: T('r5b', '竞赛题') - 0.25, t1: T('r5b', '竞赛题') + 0.5, off: f1, pen: false });

  // ── R1-Zero：不看人写的过程，只看答对没有；思考却越写越长 ──
  const CY = -7000, r1Off = off(T('r8') - 0.65);
  const r1T = W.write('2025  DeepSeek R1 的一个版本（R1-Zero）', -780, CY - 240, { fs: 88, cls: 'bold', t0: T('r6', 'DeepSeek') - 0.1, t1: T('r6', '一个版本') + 0.65, off: r1Off });
  const hw2 = ['92138 = 92000 + 138', '25992 × 92000 = …', '25992 × 138 = …'].map((l, i) => W.write(l, -780, CY - 100 + i * 96, { fs: 66, cls: 'pencil', t0: T('r6', '训练时') + i * 0.2, t1: T('r6', '训练时') + 0.45 + i * 0.2, pen: false, off: r1Off }));
  const hwT = W.write('人写的解题过程', hw2[0].x1 + 110, CY - 56, { fs: 76, cls: 'pencil', t0: T('r6', '解题过程') - 0.4, t1: T('r6', '解题过程') + 0.2, pen: false, off: r1Off });
  const tNo = T('r6', '不看') - 0.1;
  W.cross(-160, CY + 0, 90, { t0: tNo, t1: tNo + 0.55, off: r1Off, w: 12 });
  const tRw = T('r7b', '答没答对') - 0.1, tRg = T('r7b', '格式') - 0.1, tRj = T('r7b', '奖励') - 0.15, RWY = CY + 280;
  const rw1 = W.write('答没答对', -780, RWY, { fs: 88, cls: 'bold', t0: tRw, t1: tRw + 0.4, off: r1Off });
  W.check(rw1.x1 + 58, RWY, 46, { t0: tRw + 0.42, t1: tRw + 0.68, w: 8, off: r1Off });
  const rw2 = W.write('格式对不对', rw1.x1 + 150, RWY, { fs: 88, cls: 'bold', t0: tRg, t1: tRg + 0.45, off: r1Off });
  W.check(rw2.x1 + 58, RWY, 46, { t0: tRg + 0.47, t1: tRg + 0.72, w: 8, off: r1Off });
  W.arrow([[rw2.x1 + 130, RWY], [rw2.x1 + 300, RWY]], { t0: tRj - 0.32, t1: tRj, w: 7, off: r1Off });
  const rw = W.write('奖励', rw2.x1 + 330, RWY, { fs: 100, cls: 'bold', t0: tRj + 0.02, t1: tRj + 0.3, off: r1Off });
  sfx('chime', T('r7b', '奖励'), { g: 0.18 });

  // 训练：思考越写越长（一行就是一次回答里的思考，越往上越靠后）
  const TY = -8200, NB = 9, r5_ = seeded(404), t8 = T('r8') + 0.2, trOff = off(T('r8e') - 0.65), TX0 = -740;
  const lens = []; for (let i = 0; i < NB; i++) lens.push(230 + 1180 * Math.pow(i / (NB - 1), 1.3) * (0.9 + 0.18 * r5_()));
  lens.forEach((L_, i) => { const ta = t8 + i * 0.36, y = TY - i * 76; let x = TX0; const r_ = seeded(500 + i); let k = 0, n_ = Math.max(1, Math.round(L_ / 190)); while (k < n_) { const w = L_ / n_ - 22; W.line(x, y, x + w, y, { t0: ta + k * 0.3 / n_, t1: ta + (k + 0.9) * 0.3 / n_, w: 22, color: '#565962', op: 0.92, amp: 3, pen: k === 0, off: trOff }); x += w + 22; k++; } });
  W.arrow([[TX0 - 70, TY + 30], [TX0 - 70, TY - (NB - 1) * 76 - 30]], { t0: t8 - 0.5, t1: t8 + 0.3, w: 6, color: PENCIL, pen: false, off: trOff });
  const trN = W.write('训练', TX0 - 100, TY - 300, { fs: 82, cls: 'pencil', align: 'r', t0: t8 - 0.4, t1: t8, pen: false, off: trOff });
  const trL = W.write('思考越写越长（示意）', TX0, TY + 110, { fs: 72, cls: 'pencil', t0: T('r8', '越写') - 0.5, t1: T('r8', '越写') + 0.2, pen: false, off: trOff });
  const noAsk = W.write('没人要求它写长', 180, TY - 230, { fs: 104, cls: 'bold', t0: T('r8', '没人要求') - 0.1, t1: T('r8', '没人要求') + 0.75, off: off(T('r8c') - 0.35) });
  W.hatch(noAsk.x0 - 14, TY - 230 - 66, noAsk.x1 + 14, TY - 230 + 66, { t0: T('r8', '想得更长') - 0.2, t1: T('r8', '想得更长') + 0.5, gap: 20, w: 16, op: 0.5, pen: false, off: off(T('r8c') - 0.35) });
  const acL = W.write('AIME 正确率', 120, TY + 110, { fs: 72, cls: 'pencil', t0: T('r8c') - 0.1, t1: T('r8c') + 0.45, pen: false, off: trOff });
  const ac0 = W.write('15.6%', TX0 + lens[0] + 50, TY, { fs: 118, cls: 'bold', t0: T('r8c', '一成半') - 0.2, t1: T('r8c', '一成半') + 0.25, off: trOff });
  const ac1 = W.write('77.9%', TX0 + lens[NB - 1] + 50, TY - (NB - 1) * 76, { fs: 118, cls: 'bold', t0: T('r8c', '将近八成') - 0.25, t1: T('r8c', '将近八成') + 0.3, off: trOff });
  const wt = W.write('Wait, wait. Wait.', 180, TY - 170, { fs: 104, cls: 'bold', t0: T('r8d', '等等') - 0.35, t1: T('r8d', '等等') + 0.45, off: trOff });
  const wt2 = W.write('等等，回头重想', 180, TY - 40, { fs: 84, cls: 'pencil', t0: T('r8d', '回头') - 0.2, t1: T('r8d', '回头') + 0.35, pen: false, off: trOff });
  sfx('tick', T('r8d', '等等') - 0.3, { g: 0.2 });

  // R1 公开发布，和 o1 差不多
  const AY2 = -10000, f2 = off(T('r8b') - 0.65);
  const am2 = aime(AY2, [['GPT-4o', 9.3, T('r8e') - 0.45, T('r8e') - 0.2], ['o1', 79.2, T('r8e') - 0.2, T('r8e') + 0.1], ['R1', 79.8, T('r8f') - 0.15, T('r8f', '差不多') - 0.3]], f2);
  const at2 = W.write('数学竞赛题 AIME 2024，正确率', -760, AY2 - 190, { fs: 84, cls: 'pencil', t0: T('r8e') - 0.5, t1: T('r8e') - 0.1, off: f2, pen: false });
  const lg = W.logo(-500, AY2 + 590, 92, (t) => ramp(t, T('r8e', 'DeepSeek') - 0.1, 0.5) * f2(t));
  const rel = W.write('2025 年 1 月，公开发布了 R1', -500 + 92 * 780 / 165 + 50, AY2 + 590, { fs: 88, cls: 'bold', t0: T('r8e', '公开发布') - 0.3, t1: T('r8e', '公开发布') + 0.5, off: f2 });

  // 今天的主流大模型
  const MY2 = -12000, tMn = T('r8b', '主流') - 0.2;
  const mT = W.write('今天的主流大模型：回答之前，先写思考', 0, MY2 - 300, { fs: 92, cls: 'bold', align: 'c', t0: T('r8b', '思考模式') - 0.5, t1: Tend('r8b') + 0.3 });
  const mRows = [];
  for (let j = 0; j < 4; j++) {
    const y = MY2 - 140 + j * 118, ta = tMn + j * 0.32;
    const a = W.write('模型', -760, y, { fs: 74, t0: ta, t1: ta + 0.2 });
    W.line(-580, y, 340, y, { t0: ta + 0.2, t1: ta + 0.75, w: 15, color: '#7e8088', op: 0.75, amp: 3 });
    const b = W.write('答案', 400, y, { fs: 74, cls: 'bold', t0: ta + 0.8, t1: ta + 1.0, pen: j === 3 });
    W.write('思考', -180, y - 52, { fs: 56, cls: 'pencil', align: 'c', t0: ta + 0.25, pen: false });
    mRows.push(a, b);
  }

  // ── 三、打开思考模式，再问开头那道题 ──
  const DY = -13700, DX = -780, LH = 112;
  const lg9 = W.logo(DX, DY - 300, 74, (t) => ramp(t, T('r9') - 0.2, 0.5));
  const md = W.write('思考模式：开', DX + 74 * 780 / 165 + 50, DY - 300, { fs: 74, cls: 'bold', t0: T('r9', '打开') - 0.05, t1: T('r9', '打开') + 0.65 });
  const q9 = W.write('25992 × 92138 =', DX, DY - 165, { fs: 96, t0: T('r9', '开头') - 0.25, t1: T('r9', '开头') + 0.45 });
  const nr = W.write('提问里没让它写过程', q9.x1 + 60, DY - 165, { fs: 66, cls: 'pencil', t0: T('r9', '不提醒') - 0.15, t1: T('r9', '不提醒') + 0.45, pen: false });
  const TH = ['25992 = 26000 − 8', '26000 × 92138 − 8 × 92138 = 2,394,850,896', 'Check alternative: 25,000 + 992', '25,000 × 92138 + 992 × 92138 = 2,394,850,896', 'yes'];
  const t90 = Tend('r9') - 0.5, t91 = T('r10', '才报出') - 0.1, tt = TH.reduce((a, l) => a + l.length, 0); let acc = 0;
  const TR = TH.map((l, i) => { const a = lerp(t90, t91, acc / tt); acc += l.length; const b = lerp(t90, t91, acc / tt) - 0.05; return W.write(l, DX, DY - 40 + i * LH, { fs: 66, t0: a, t1: b }); });
  const ans = W.write('答案：2394850896', DX, DY - 40 + 5 * LH + 30, { fs: 104, cls: 'bold', t0: T('r10', '报出答案') - 0.1, t1: T('r10', '报出答案') + 0.4 });
  W.check(ans.x1 + 70, ans.y, 56, { t0: T('r10', '算对') - 0.1, t1: T('r10', '算对') + 0.25, w: 9 });
  sfx('chime', T('r10', '算对'), { g: 0.2 });
  const n220 = W.write('思考：220 块', TR[0].x1 + 110, TR[0].y, { fs: 88, cls: 'pencil', t0: T('r10', '一大段思考') - 0.1, t1: T('r10', '一大段思考') + 0.45, pen: false });

  // ── 二十五道；五摞纸 ──
  const GY = -15400, tG = T('r11', '各取');
  const cell = 92;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const ta = tG + r * 0.18 + c * 0.05; W.check(-860 + c * cell, GY - 200 + r * cell, 28, { t0: ta, t1: ta + 0.14, w: 8, pen: c === 4 && r === 0, amp: 0.5, off: off(T('r12') - 0.6) }); }
  const g25 = W.write('25 / 25', -860 - 40, GY + 300, { fs: 148, cls: 'bold', t0: T('r11', '全对') - 0.2, t1: T('r11', '全对') + 0.3, off: off(T('r12') - 0.6) });
  const AVG = [93, 166, 261, 412, 550], RX_ = -480, RY0 = -16900, tg = [T('r12b', '三位数') - 0.25, T('r12b', '三位数') + 0.5, T('r12b', '九十') + 0.35, T('r12b', '七位数') + 0.5, T('r12b', '七位数') + 1.0];
  const avgL = W.write('平均写的思考块数', -760, RY0 - 170, { fs: 96, cls: 'bold', t0: T('r12') - 0.1, t1: T('r12') + 0.75 });
  const clb = AVG.map((v, i) => { const y = RY0 + i * 130, a = W.write('三四五六七'[i] + '位', RX_ - 34, y, { fs: 84, align: 'r', t0: T('r12') + 0.5 + i * 0.16, pen: false }); W.line(RX_, y, RX_ + v * 2.1, y, { t0: tg[i], t1: tg[i] + 0.65, w: 58, amp: 1, ease: smooth }); const b = W.write(String(v), RX_ + v * 2.1 + 40, y, { fs: 96, cls: 'bold', t0: tg[i] + 0.55, t1: tg[i] + 0.8, pen: false }); sfx('tick', tg[i] + 0.55, { g: 0.16 }); return [a, b]; }).flat();
  const oneT = W.write('多写一块 ＝ 多走一趟', 0, RY0 + 5 * 130 + 40, { fs: 104, cls: 'bold', align: 'c', t0: T('r13', '多走') - 0.45, t1: T('r13', '多走') + 0.35 });

  // ── 镜头 ──
  const shAsk = fitCam(W, [e1, e2, exT, qa, ph, zh, cite], { pitch: 28 });
  const shBars = fitCam(W, [gs, ...barsR, qa, ph, zh, hw], { pitch: 30 });
  const shTrain = fitCam(W, [ms.box, train], { pitch: 42, cz: 200, kmax: 1.0 });
  const shO1 = fitCam(W, [o1T, o1Q, o1B, [960, OY + 200, 0], [-800, OY + 3 * 86, 0]], { pitch: 28 });
  const shA1 = fitCam(W, [at1, ...am1, [760, AY1 + 260, 0]], { pitch: 28, kmax: 1.15 });
  const shR1 = fitCam(W, [r1T, ...hw2, hwT, rw], { pitch: 28 });
  const shT = fitCam(W, [trN, trL, acL, ac0, ac1, wt, wt2, [TX0 + lens[NB - 1] + 340, TY - (NB - 1) * 76 - 70, 0]], { pitch: 28 });
  const shA2 = fitCam(W, [at2, ...am2, rel, lg], { pitch: 28, kmax: 1.15 });
  const shM = fitCam(W, [mT, ...mRows, [-780, MY2 + 240, 0]], { pitch: 28, kmax: 1.15 });
  const shQ = fitCam(W, [lg9, md, q9, nr, ...TR, n220, ans], { pitch: 28, kmax: 1.1 });
  const sh25 = fitCam(W, [g25, [-910, GY - 260, 0], [-500, GY + 340, 0]], { pitch: 30, kmax: 1.15 });
  const shCols = fitCam(W, [avgL, ...clb, oneT], { pitch: 28, kmax: 1.15 });
  W.cam([
    [T('r1') - 1.25, shAsk, 2.0],
    [T('r2') - 0.65, shBars, 1.8],
    [T('r4') - 0.9, shTrain, 2.0],
    [T('r5') - 0.8, shO1, 1.9],
    [T('r5b') - 0.75, shA1, 1.8],
    [T('r6') - 0.7, shR1, 1.9],
    [T('r8') - 0.75, shT, 1.9],
    [T('r8e') - 0.8, shA2, 1.9],
    [T('r8b') - 0.75, shM, 1.8],
    [T('r9') - 0.85, shQ, 1.9],
    [T('r11') - 0.75, sh25, 1.8],
    [T('r12') - 0.55, shCols, 1.5],
    [Tend('r13') + 1.0, blankCam(0, -17280), Math.max(0.9, s.end + 0.35 - Tend('r13') - 1.0)],
  ]);
  [T('r1') - 1.25, T('r4') - 0.9, T('r5') - 0.8, T('r5b') - 0.75, T('r6') - 0.7, T('r8') - 0.75, T('r8e') - 0.8, T('r8b') - 0.75, T('r9') - 0.85, T('r11') - 0.75, T('r12') - 0.55].forEach((a) => sfx('whoosh', a, { g: 0.12 }));
  sfx('riser', t8, { g: 0.12 });
});
