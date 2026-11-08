// 04 越写越长：先写过程，从人写进提问里的一句话，变成练进模型里的习惯；没人要求，它的思考自己越写越长。
// 一、谷歌的做法要先给几道写好步骤的例题；几个月后发现例题都不用给，提问里一句「Let's think step by step」：应用题正确率 10.4% → 40.7%；那几块字沉进一摞层里（练进模型）。
// 二、o1 回答前先写一大段思考，AIME 2024 上 GPT-4o 9.3%、o1 79.2%；R1-Zero 训练时不看人写的过程，只看答没答对、格式对不对给奖励；
//     训练中思考越写越长（示意），正确率 15.6% → 77.9%，还冒出「Wait, wait. Wait.」；R1 公开发布，79.8% 与 o1 相当；今天主流大模型基本都带思考模式。
// 三、思考模式算开头那道题：算对以后换一种拆法再算一遍。二十五道全对；五根柱子按平均思考块数立起来；
//     柱顶每多一块，就是多走一趟：一摞层立起来、算到顶、压成柱子上的一道接缝。
// 事实：S2（Kojima 等，2022-05-24；GSM8K，text-davinci-002，10.4% → 40.7%）；S11（o1，2024）；S12（R1，2025-01-22；R1-Zero 纯强化学习、
// 奖励为准确性加格式、训练中思考时间稳步增长；表 8 AIME 2024；表 2 aha moment；第 2 节 15.6% → 77.9%）；S16–S19（主流思考模式）；L2（n5-03 的思考：26000 − 8，再 Check alternative 25,000 + 992；25/25；平均思考 93、166、261、412、550 块）。
scene('learn', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const mk = chapterMark(W, s, '03', '越写越长', -1500, 900, T('r1') - 0.2);
  const X0 = -900, LH = 112;
  // 每讲完一段，这一段淡出去，免得留在后面几镜的背景里
  const VA = (t) => 1 - ramp(t, T('r5') - 0.3, 0.7), VB = (t) => 1 - ramp(t, T('r9') - 0.3, 0.7), VC = (t) => 1 - ramp(t, T('r11') - 0.3, 0.7);
  const drop = (k, ta, f) => place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * (f ? f(t) : 1) }));
  const writeAll = (toks, t0, t1, f) => toks.forEach((k, i) => { const ta = lerp(t0, t1, toks.length > 1 ? i / (toks.length - 1) : 0); k.ta = ta; drop(k, ta, f); if (i % 3 === 0) sfx('key', ta, { g: 0.14 }); });

  // ── 一、提问里的一句话 ──
  const AY = 0;
  const qa = block(S, '<span class="g">Q：一道应用题</span>', { w: 560, d: 100, h: 30, fs: 44 });
  place(W, qa.g, (t) => ({ x: X0 + 280, y: AY, z: 40 * (1 - ramp(t, T('r1') + 0.3, 0.5, ease.out3)), o: ramp(t, T('r1') + 0.3, 0.3) * VA(t) }));
  // 谷歌那篇论文：提问里先给几道写好步骤的例题（题目上方两行）；「例题都不用给」时收走
  const exOn = (j) => (t) => ramp(t, T('r1', '例题') - 0.3 + j * 0.25, 0.4) * (1 - ramp(t, T('r1b', '不用给') - 0.3, 0.5));
  const EXW = 1250;
  const exs = [0, 1].map((j) => { const b = block(S, `<span class="g">例题 ${j + 1}：…………　写好的一步步　…………　答案</span>`, { w: EXW, d: 90, h: 22, fs: 38 });
    place(W, b.g, (t) => ({ x: X0 + EXW / 2, y: AY - 270 + j * 120, z: 24 * (1 - ramp(t, T('r1', '例题') - 0.3 + j * 0.25, 0.4, ease.out3)), o: exOn(j)(t) * VA(t) })); return b; });
  const exl = W.board('<div class="lbl g">谷歌 2022：先给几道写好步骤的例题</div>', X0, AY - 400, 30, 0, -40);
  fade(W, exl, (t) => exOn(0)(t) * VA(t));
  sfx('pop', T('r1', '例题') - 0.3, { g: 0.18 });
  const A_ = para(S, X0, AY, ['A：'], { fs: 44, d: 100, h: 30, x1st: X0 + 600 });
  drop(A_[0], T('r1') + 0.6, VA);
  const PH = para(S, X0, AY, ["Let's", 'think', 'step', 'by', 'step.'], { fs: 44, d: 100, h: 30, x1st: A_[0].x1 + 14 });
  const sinkAt = T('r4', '练进') - 0.6;
  PH.forEach((k, i) => {
    const ta = T('r1c', '加一句') - 0.2 + i * 0.16;
    // 先落在答案前面；「练进了模型」时一块块飞进上方那一摞层里，变小、淡去
    place(W, k.b.g, (t) => {
      const m = ramp(t, sinkAt + i * 0.1, 1.0, ease.io3);
      return { x: lerp(k.x, 360, m), y: lerp(k.y, -640, m), z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)) + Math.sin(m * Math.PI) * 260 + m * 200, s: 1 - 0.6 * m, o: ramp(t, ta, 0.2) * (1 - ramp(t, sinkAt + 0.7 + i * 0.1, 0.35)) };
    });
    sfx('key', ta, { g: 0.2 });
  });
  const cite = W.board('<div class="lbl g">2022 年 5 月</div>', PH[0].x0, AY, 40, 0, -150);
  fade(W, cite, (t) => ramp(t, T('r1b', '不用给') + 0.1, 0.4) * (1 - ramp(t, T('r4') - 0.3, 0.4)));
  const zh = W.board('<div class="lbl">「我们一步一步来想」</div>', PH[0].x0, AY, 40, 0, -100);
  fade(W, zh, (t) => ramp(t, T('r1c', '一步一步') - 0.3, 0.4) * (1 - ramp(t, T('r4') - 0.3, 0.4)));
  // 正确率：10.4% → 40.7%（两根立着的方块，高度按百分比）
  const BX = PH[4].x1 + 220, BY_ = AY + 240, PCT = 7, barsL = [], barLabels = [];   // 在这一行的右前方，立起来不挡字
  [[10.4, '直接回答', 0], [40.7, '加这一句', 1]].forEach(([v, lab, i]) => {
    const hh = v * PCT, ta = T('r2', i ? '四成' : '一成') - 0.4;
    const b = block(S, '', { w: 130, d: 100, h: hh, cls: 'cube' });
    place(W, b.g, (t) => ({ x: BX + i * 220, y: BY_, z: 0, o: ramp(t, ta, 0.3) * VA(t) * (1 - ramp(t, T('r4') - 0.6, 0.4)) }));
    barsL.push(b);
    const v_ = W.board(`<div class="lbl l" style="transform:translateX(-50%)">${v}%</div>`, BX + i * 220, BY_, hh + 20, 0, -80);
    const l_ = W.board(`<div class="lbl l" style="transform:translateX(-50%)">${lab}</div>`, BX + i * 220, BY_ + 60, 0, 0, 6);
    fade(W, v_, (t) => ramp(t, ta + 0.2, 0.4) * VA(t) * (1 - ramp(t, T('r4') - 0.6, 0.4))); fade(W, l_, (t) => ramp(t, ta, 0.4) * VA(t) * (1 - ramp(t, T('r4') - 0.6, 0.4))); barLabels.push(v_, l_);
    sfx('tick', ta + 0.2, { g: 0.25 });
  });
  const src = W.board('<div class="lbl g" style="transform:translateX(-50%)">GSM8K 数学应用题 · text-davinci-002</div>', BX + 110, BY_ + 60, 0, 0, 96);
  fade(W, src, (t) => ramp(t, T('r2', '应用题') - 0.2, 0.4) * VA(t) * (1 - ramp(t, T('r4') - 0.6, 0.4)));
  // 人写进提问里的一句话
  rectOf(W, S, PH, 0, 4, (t) => ramp(t, T('r3', '提问里') - 0.3, 0.4) * (1 - ramp(t, sinkAt - 0.2, 0.3)), 'g');
  const hw = W.board('<div class="lbl l g">人写进提问里</div>', PH[0].x0, AY, 30, 0, 50);
  fade(W, hw, (t) => ramp(t, T('r3', '提问里') - 0.2, 0.4) * (1 - ramp(t, sinkAt - 0.2, 0.3)));
  // 模型：一摞层；那几块字沉进去，层从下往上一张张变深
  ream(W, S, 360, -640, { w: 760, d: 300, n: 32, gap: 15, rise: (t) => ramp(t, T('r4') + 0.3, 0.8, ease.out3),
    fill: (t) => ramp(t, sinkAt + 1.0, 1.4, (k) => k), op: VA });
  const ml = W.board('<div class="lbl xl">模型</div>', 360 + 420, -640, 260, 0, -60);
  fade(W, ml, (t) => ramp(t, T('r4') + 0.2, 0.4) * VA(t));
  sfx('riser', sinkAt, { g: 0.15 });

  // ── 二、o1、R1：回答之前先写一大段思考；R1-Zero 不看人写的过程，答对就给奖励；思考越写越长 ──
  const BY = 1000;
  const think = (y, n, ta, tb, f, tq) => {
    const items = []; for (let i = 0; i < n; i++) items.push(1 + (i * 7) % 3);
    const P = para(S, X0, y, ['题目', '\n', ...items, '\n', '答案'], { fs: 46, lh: LH, maxW: 1700 });
    drop(P[0], tq != null ? tq : ta - 0.3, f);
    writeAll(P.slice(1, -1), ta, tb, f);
    drop(P[P.length - 1], tb + 0.2, f);
    return P;
  };
  const tagL = (txt, y, ta, f) => { const e = W.board(`<div class="lbl l" style="transform:translate(-100%,-50%)">${txt}</div>`, X0 - 50, y, 0); fade(W, e, (t) => ramp(t, ta, 0.5) * (f ? f(t) : 1)); return e; };
  const dimB = (t) => (1 - ramp(t, T('r6') - 0.5, 0.5)) * VB(t);   // 讲 R1 时 o1 那一行退开
  const VB2 = (t) => (1 - ramp(t, T('r8') - 0.6, 0.5)) * VB(t);   // 讲训练中越写越长时，上面两行退成淡影
  const VBt = (t) => 1 - ramp(t, T('r8e') - 0.5, 0.5);   // 回到 AIME 柱图时，训练示意收走
  const P1 = think(BY, 36, T('r5', '发布') + 0.2, T('r5', '思考') + 0.3, dimB);
  const tg1 = tagL('o1　2024', BY, T('r5', '发布') - 0.2, dimB);
  const tk = W.board('<div class="lbl g">思考</div>', X0 + 900, BY + LH, 60, 0, -70);
  fade(W, tk, (t) => ramp(t, T('r5', '思考') - 0.2, 0.4) * dimB(t));
  const CY_ = BY + 520;
  const P2 = think(CY_, 22, T('r7b') - 0.6, T('r7b') + 0.1, VB2, T('r6', 'DeepSeek') + 0.4);
  const tg2 = tagL('R1-Zero　2025', CY_, T('r6', 'DeepSeek') - 0.2, VB2);
  const tgd = W.board('<div class="lbl g">论文：2025 年 1 月 22 日</div>', X0 - 50, CY_, 0, 0, 44); tgd.firstElementChild.style.transform = 'translateX(-100%)';
  fade(W, tgd, (t) => ramp(t, T('r6', '一个版本') - 0.3, 0.4) * VB2(t));
  // 人写的解题过程：浮现一下就被拿开（训练时不给它看）
  const HX = X0 + 160, HY = CY_ + 3 * LH + 60;   // 人写的过程放在这一行下面，镜头不必拉宽
  ['92138 = 92000 + 138', '25992 × 92000 = …', '25992 × 138 = …'].forEach((ln, i) => {
    const e = W.print(`<div class="hand s">${ln}</div>`, HX, HY + i * 76);
    place(W, e, (t) => ({ x: HX + 260 * ramp(t, Tend('r6') + 0.2, 0.8), y: HY + i * 76, z: 0.6, o: ramp(t, T('r6', '训练时') - 0.2 + i * 0.12, 0.4) * (1 - ramp(t, Tend('r6') + 0.2, 0.6)) }));
  });
  const nh = W.board('<div class="lbl g">人写的解题过程</div>', HX, HY, 30, 0, -70);
  fade(W, nh, (t) => ramp(t, T('r6', '训练时') - 0.2, 0.4) * (1 - ramp(t, Tend('r6') + 0.2, 0.6)));
  const last2 = P2[P2.length - 1];
  const ck = h('div', 'p3 chk2 big', S); ck.style.transform = `translate3d(${last2.x1 + 40}px, ${last2.y - 26}px, 1px) rotate(40deg)`;
  fade(W, ck, (t) => ramp(t, T('r7b', '答对') - 0.1, 0.3) * VB2(t));
  const rw = W.board('<div class="lbl">答对、格式对　→　奖励</div>', last2.x1 + 110, last2.y, 30, 0, -24);
  fade(W, rw, (t) => ramp(t, T('r7b', '奖励') - 0.2, 0.4) * VB2(t));
  sfx('chime', T('r7b', '奖励'), { g: 0.22 });
  // 训练过程里，每次回答的思考越写越长（示意：一排立着的方块，越往后越高）
  const TY = CY_ + 640, rnd = seeded(404);
  const NB = 16;
  for (let i = 0; i < NB; i++) {
    const hh = 30 + 560 * Math.pow(i / (NB - 1), 1.25) * (0.86 + 0.28 * rnd());
    const b = block(S, '', { w: 70, d: 70, h: hh, cls: 'cube' });
    const ta = T('r8') + 0.3 + i * 0.17;
    place(W, b.g, (t) => ({ x: X0 + 120 + i * 104, y: TY, z: 0, o: ramp(t, ta, 0.3) * VBt(t) }));
  }
  const ar = seg(S, ''); ar.set([X0 + 60, TY + 90, 0.8], [X0 + 120 + NB * 104, TY + 90, 0.8]);
  fade(W, ar.e, (t) => ramp(t, T('r8') - 0.2, 0.4) * VBt(t));
  const trl = W.board('<div class="lbl">训练　→</div>', X0 + 120 + (NB - 2) * 104, TY + 60, 0, 0, 10);
  fade(W, trl, (t) => ramp(t, T('r8') - 0.2, 0.4) * VBt(t));
  const tll = W.board('<div class="lbl g">每次回答里思考的长度（示意）</div>', X0 + 120, TY, 260, 0, -40);
  fade(W, tll, (t) => ramp(t, T('r8') - 0.2, 0.4) * VBt(t));
  sfx('riser', T('r8', '越写') - 1.4, { g: 0.12 });
  // 训练中的正确率（R1-Zero，AIME 2024）：第一根和最后一根上方标出
  const accOn = (t) => ramp(t, T('r8c', '一成半') - 0.3, 0.4) * VBt(t);
  const acc0 = W.board('<div class="lbl l" style="transform:translateX(-50%)">正确率 15.6%</div>', X0 + 120, TY, 120, 0, -40);
  const acc1 = W.board('<div class="lbl l" style="transform:translateX(-50%)">正确率 77.9%</div>', X0 + 120 + (NB - 1) * 104, TY, 680, 0, -40);
  const accL = W.board('<div class="lbl g" style="transform:translateX(-50%)">数学竞赛题 AIME 2024</div>', X0 + 120 + (NB - 1) * 104, TY, 680, 0, -110);
  fade(W, acc0, accOn); fade(W, accL, (t) => ramp(t, T('r8c') - 0.1, 0.4) * VBt(t)); fade(W, acc1, (t) => ramp(t, T('r8c', '将近八成') - 0.3, 0.4) * VBt(t));
  sfx('tick', T('r8c', '一成半') - 0.3, { g: 0.16 }); sfx('chime', T('r8c', '将近八成') - 0.3, { g: 0.16 });
  const wt = W.board('<div class="lbl">「Wait, wait. Wait.」　等等，回头重想</div>', X0 + 120 + 6 * 104, TY, 820, 0, -40);
  fade(W, wt, (t) => ramp(t, T('r8d', '等等') - 0.3, 0.4) * VBt(t));
  sfx('pop', T('r8d', '等等') - 0.3, { g: 0.2 });
  // AIME 2024 柱图：GPT-4o 9.3%、o1 79.2%；讲到 R1 公开发布时再立起 R1 79.8%
  const AX = X0 + 2600, AYc = BY + 260, APCT = 6;
  const win2 = (t, a, b) => ramp(t, a, 0.4) * (1 - ramp(t, b, 0.4));
  const chartOn = (t) => Math.max(win2(t, T('r5b') - 0.4, T('r6') - 0.3), win2(t, T('r8e') - 0.6, T('r8b') - 0.3));
  // [数值, 名字, 立起来, 名字出现, 数值出现]
  const AIME = [[9.3, 'GPT-4o', T('r5b', '只对') - 0.2, T('r5b', '的') + 0.1, T('r5b', '不到一成') - 0.3], [79.2, 'o1', T('r5c') - 0.1, T('r5c') - 0.2, T('r5c', '将近八成') - 0.3], [79.8, 'R1', T('r8f') - 0.1, T('r8e', '发布了') + 0.2, T('r8f', '差不多') - 0.3]];
  const aimeEls = [];
  AIME.forEach(([v, lab, ta, tn, tv], i) => {
    const hh = v * APCT, on = (t) => ramp(t, ta, 0.4) * chartOn(t), onN = (t) => ramp(t, tn, 0.4) * chartOn(t);
    const b = block(S, '', { w: 130, d: 100, h: hh, cls: i === 1 || i === 2 ? 'cube' : 'cube no' });
    place(W, b.g, (t) => ({ x: AX + i * 240, y: AYc, z: 0, o: on(t) }));
    const v_ = W.board(`<div class="lbl l" style="transform:translateX(-50%)">${v}%</div>`, AX + i * 240, AYc, hh + 20, 0, -80);
    const l_ = W.board(`<div class="lbl l" style="transform:translateX(-50%)">${lab}</div>`, AX + i * 240, AYc + 60, 0, 0, 6);
    fade(W, v_, (t) => ramp(t, tv, 0.4) * chartOn(t)); fade(W, l_, onN); aimeEls.push(v_, l_);
    sfx('tick', tv, { g: 0.22 });
  });
  const at = W.board('<div class="lbl g" style="transform:translateX(-50%)">数学竞赛题 AIME 2024 · 正确率</div>', AX + 240, AYc + 60, 0, 0, 96);
  fade(W, at, (t) => ramp(t, T('r5b', '竞赛题') - 0.2, 0.4) * chartOn(t));
  const oai = W.board('<div class="lbl g" style="transform:translateX(-50%)">都是 OpenAI</div>', AX + 120, AYc + 60, 0, 0, 168);
  fade(W, oai, (t) => ramp(t, T('r5b', '同是') - 0.2, 0.4) * win2(t, 0, T('r6') - 0.3));
  const rel = W.board('<div class="lbl">2025 年 1 月　公开发布</div>', AX + 480, AYc, 79.8 * APCT + 20, 0, -150);
  fade(W, rel, (t) => ramp(t, T('r8e', '公开发布') - 0.3, 0.4) * chartOn(t));
  // 今天的主流大模型：几行「模型 → 思考 → 答案」，一行行出现
  const MY0 = AYc + 420;
  const mainOn = (j) => (t) => ramp(t, T('r8b', '主流') - 0.3 + j * 0.22, 0.35) * (1 - ramp(t, T('r9') - 0.3, 0.4));
  const mrows = [];
  for (let j = 0; j < 4; j++) {
    const P = para(S, AX - 160, MY0 + j * 104, ['模型', '思考', 1 + (j % 3), 2, 1 + ((j + 1) % 3), '答案'], { fs: 38, d: 80, h: 18, lh: 104, maxW: 1400 });
    P.forEach((k) => drop(k, T('r8b', '主流') - 0.3 + j * 0.22, mainOn(j))); mrows.push(...P);
    P.slice(1, -1).forEach((k) => glow(W, k.b, (t) => ramp(t, T('r8b', '思考模式') - 0.3 + j * 0.1, 0.3) * mainOn(j)(t)));
  }
  const mainL = W.board('<div class="lbl">今天的主流大模型：回答之前，先写思考</div>', AX - 160, MY0, 30, 0, -80);
  fade(W, mainL, (t) => ramp(t, T('r8b', '思考模式') - 0.3, 0.4) * mainOn(0)(t));
  sfx('riser', T('r8b') - 0.2, { g: 0.12 });

  // ── 三、开头那道题交给思考模式：算对以后，换一种拆法再算一遍 ──
  const DY = 3000;
  const qd = block(S, '25992 × 92138 =', { w: 640, d: 100, h: 30, fs: 52 });
  place(W, qd.g, (t) => ({ x: X0 + 320, y: DY, z: 40 * (1 - ramp(t, T('r9', '开头') - 0.3, 0.5, ease.out3)), o: ramp(t, T('r9', '开头') - 0.3, 0.3) * VC(t) }));
  const tg3 = tagL('思考模式：开', DY, T('r9', '打开') - 0.2, VC);
  const nr = W.board('<div class="lbl g">提问里没让它写过程</div>', X0 + 660, DY, 30, 0, -10);
  fade(W, nr, (t) => ramp(t, T('r9', '不提醒') - 0.2, 0.4) * VC(t));
  const PD = para(S, X0, DY + LH, [
    3, '25992', '=', '26000', '−', '8', 2, '\n',
    '26000', '×', '92138', '−', '8', '×', '92138', 2, '=', '2,394', ',850', ',896', '\n',
    'Check', 'alternative', ':', '25,000', '+', '992', 2, '\n',
    '25,000', '×', '92138', '+', '992', '×', '92138', 2, '=', '2,394', ',850', ',896', '\n',
    'yes', '\n',
    '答案', '：', '239', '485', '089', '6',
  ], { fs: 44, lh: LH, maxW: 1800 });
  const seg1 = PD.filter((k) => k.line <= 1), seg2 = PD.filter((k) => k.line >= 2 && k.line <= 4), segA = PD.filter((k) => k.line === 5);
  writeAll(seg1, T('r9', '思考模式') + 0.1, Tend('r9') + 0.2, VC);
  writeAll(seg2, T('r10') - 0.2, T('r10', '才报出') - 0.3, VC);
  writeAll(segA, T('r10', '报出答案') - 0.2, T('r10', '报出答案') + 0.3, VC);
  const r1 = seg1.slice(-3), r2_ = PD.filter((k) => k.line === 3).slice(-3);
  const ulD = (toks, ta) => { const e = seg(S, 'w'); e.set([toks[0].x0, toks[0].y + 50, 0.8], [toks[toks.length - 1].x1, toks[0].y + 50, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.35) * VC(t)); };
  segA.slice(2).forEach((k, i) => glow(W, k.b, (t) => ramp(t, T('r10', '算对') - 0.2 + i * 0.08, 0.25) * VC(t)));
  sfx('chime', T('r10', '算对'), { g: 0.2 });
  const s1l = W.board('<div class="lbl l g">思考：220 块</div>', PD.filter((k) => k.line === 0).slice(-1)[0].x1 + 40, DY + LH, 30, 0, -26);
  const s2l = W.board('<div class="lbl l">然后才是答案</div>', segA[segA.length - 1].x1 + 40, segA[0].y, 30, 0, -26);
  fade(W, s1l, (t) => ramp(t, T('r10', '一大段思考') - 0.3, 0.4) * VC(t)); fade(W, s2l, (t) => ramp(t, T('r10', '报出答案') - 0.2, 0.4) * VC(t));

  // ── 二十五道全对；五根柱子：三位到七位的平均思考块数 ──
  const GY = DY + 900, GX = X0 + 200, CWd = 72;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const b = block(S, '', { w: 58, d: 58, h: 96, cls: 'cube' });
    const tt = T('r11', '各取') - 0.2 + r * 0.18 + c * 0.05;
    place(W, b.g, (t) => ({ x: GX + c * CWd, y: GY + r * 100, z: 0, o: ramp(t, tt, 0.25) }));
  }
  const g25 = W.board('<div class="lbl l" style="transform:translate(-50%,-100%)">25 / 25</div>', GX + 2 * CWd, GY - 40, 130, 0, 0);
  fade(W, g25, (t) => ramp(t, T('r11', '全对') - 0.2, 0.4));
  const colLabels = [];
  const AVG = [93, 166, 261, 412, 550], SG = 2.4, CX = GX + 700, CS = 230, CY2 = GY + 200;
  const tg = [T('r12b', '三位数') - 0.2, T('r12b', '九十') - 0.6, T('r12b', '九十') + 0.1, T('r12b', '七位数') - 0.6, T('r12b', '七位数') - 0.1];
  const bumps = [0, 1, 2].map((j) => T('r13', '每一块') - 0.05 + j * 0.75);
  AVG.forEach((v, i) => {
    const extra = (t) => (i === 4 ? bumps.reduce((a, b) => a + (t >= b + 0.62 ? 1 : 0), 0) : 0);
    const col = column(W, S, CX + i * CS, CY2, { w: 120, d: 90, seg: SG, n: (t) => v * ramp(t, tg[i], 1.2, ease.out3) + extra(t), op: (t) => (i < 4 ? 1 - ramp(t, T('r13') - 0.2, 0.4) : 1) });
    col.g.classList.add('fine');
    const vl = colLabels[i * 2 + 1] = W.board(`<div class="lbl l" style="transform:${i === 4 ? 'translateX(-100%)' : 'translateX(-50%)'}">${v}</div>`, CX + i * CS + (i === 4 ? -80 : 0), CY2, v * SG + (i === 4 ? -40 : 30), 0, -60);
    fade(W, vl, (t) => ramp(t, tg[i] + 0.8, 0.4) * (i < 4 ? 1 - ramp(t, T('r13') - 0.2, 0.4) : 1));
    const dl = colLabels[i * 2] = W.board(`<div class="lbl xl" style="transform:translateX(-50%)">${'三四五六七'[i]}位</div>`, CX + i * CS, CY2 + 60, 0, 0, 10);
    fade(W, dl, (t) => ramp(t, tg[i], 0.4) * (1 - ramp(t, T('r13') - 0.2, 0.4)));
    sfx('tick', tg[i] + 0.8, { g: 0.18 });
  });
  const al = W.board('<div class="lbl l" style="transform:translateX(-50%)">平均写的思考块数</div>', CX + 2 * CS, CY2, 1500, 0, -40);
  fade(W, al, (t) => ramp(t, T('r12') - 0.2, 0.4) * (1 - ramp(t, T('r13') - 0.8, 0.5)));
  // 柱顶：每多一块，就多走一趟——一摞层立起来、算到顶、压成一道接缝
  const X7 = CX + 4 * CS, top7 = 550 * SG;
  bumps.forEach((b, j) => {
    ream(W, S, X7, CY2, { w: 120, d: 90, n: 48, gap: 10, z: () => top7 + j * SG,
      rise: (t) => ramp(t, b, 0.28, ease.out3) * (1 - ramp(t, b + 0.45, 0.17, (k) => k)), fill: (t) => ramp(t, b + 0.1, 0.32, (k) => k) });
    sfx('tick', b + 0.62, { g: 0.22 });
  });
  const one = W.board('<div class="lbl l">多写一块　＝　多走一趟</div>', X7 + 90, CY2, top7 + 300, 30, -20);
  fade(W, one, (t) => ramp(t, T('r13', '多走') - 0.3, 0.4));

  // ── 镜头：提问里的一句话与正确率（斜俯，不动）｜练进模型（斜俯拉远）｜o1、R1 与人写的过程（纸面）｜训练中越写越长（立面，像一张柱状图）｜
  //    验算两遍（纸面）｜二十五道（斜俯）｜五根柱子（立面）｜多写一块＝多走一趟（升到最高那根的顶上） ──
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const phrase = [B(X0 + 280, AY, 560, 100, 30), ...A_.map((k) => B(k.x, k.y, k.w, 100, 30)), ...PH.map((k) => B(k.x, k.y, k.w, 100, 30))];
  const bars = [B(BX, BY_, 130, 100, 10.4 * PCT + 120), B(BX + 220, BY_, 130, 100, 40.7 * PCT + 120)];
  const exBox = exs.map((b, j) => B(X0 + EXW / 2, AY - 270 + j * 120, EXW, 90, 22));
  const shAskNear = fitCam(W, [...phrase, ...exBox, { el: exl }, { el: cite }, { el: zh }], { pitch: 44, yaw: -4, kmax: 1.5 });
  const shAsk = fitCam(W, [...phrase, ...bars, ...barLabels.map((e) => ({ el: e })), { el: src }, { el: cite }, { el: zh }, { el: hw }], { pitch: 46, yaw: -4, kmax: 1.4 });
  [qa, ...A_.map((k) => k.b), ...PH.map((k) => k.b)].forEach((b, i) => twoFace(W, b, i === 0 ? 'Q：一道应用题' : (i === 1 ? 'A：' : PH[i - 2].txt), 30));
  const shPct = fitCam(W, [...phrase, ...bars, ...barLabels.map((e) => ({ el: e })), { el: src }], { pitch: 80, kmax: 1.4 });
  const shTrain = fitCam(W, [...phrase, B(360, -640, 760, 300, 32 * 15 + 140), { el: ml }], { pitch: 60, yaw: -6 });
  const think2 = [...P1, ...P2].map((k) => B(k.x, k.y, k.w, k.d, 20));
  const shO1 = fitCam(W, [...P1.map((k) => B(k.x, k.y, k.w, k.d, 20)), { el: tg1 }, { el: tk }], { pitch: 30 });
  const shR1 = fitCam(W, [...P2.map((k) => B(k.x, k.y, k.w, k.d, 20)), { el: tg2 }, { el: nh }, { el: rw }, [HX, HY - 80, 0], [HX + 820, HY + 170, 0], { el: tgd }], { pitch: 30 });
  const tbars = []; for (let i = 0; i < NB; i++) tbars.push(B(X0 + 120 + i * 104, TY, 70, 70, 640));
  const shBars = fitCam(W, [...tbars, { el: tll }, { el: trl }, { el: acc0 }, { el: acc1 }, { el: accL }, { el: wt }], { pitch: 84 });
  const shCheck = fitCam(W, [B(X0 + 320, DY, 640, 100, 30), ...PD.map((k) => B(k.x, k.y, k.w, k.d, 20)), { el: tg3 }, { el: nr }, { el: s1l }, { el: s2l }], { pitch: 36 });
  const abars = AIME.map(([v], i) => B(AX + i * 240, AYc, 130, 100, v * APCT + 120));
  const shAime = fitCam(W, [...abars.slice(0, 2), ...aimeEls.slice(0, 4).map((e) => ({ el: e })), { el: at }, { el: oai }], { pitch: 76, kmax: 1.3 });
  const shAime3 = fitCam(W, [...abars, ...aimeEls.map((e) => ({ el: e })), { el: at }, { el: rel }], { pitch: 76, kmax: 1.3 });
  const shMain = fitCam(W, [...mrows.map((k) => B(k.x, k.y, k.w, k.d, 18)), { el: mainL }], { pitch: 40, kmax: 1.3 });
  const shR1b = fitCam(W, [...P2.map((k) => B(k.x, k.y, k.w, k.d, 20)), { el: tg2 }, { el: rw }, { el: tgd }], { pitch: 30, kmax: 1.3 });
  const sh25 = fitCam(W, [B(GX + 2 * CWd, GY + 200, 5 * CWd, 500, 96), { el: g25 }], { pitch: 52, kmax: 1.3 });
  const cols = AVG.map((v, i) => B(CX + i * CS, CY2, 120, 90, v * SG + 90));
  const shCols = fitCam(W, [...cols, { el: al }, ...colLabels.map((e) => ({ el: e }))], { pitch: 84 });
  const shTop = fitCam(W, [[X7 - 70, CY2, top7 - 260], [X7 + 70, CY2, top7 - 260], [X7 - 70, CY2, top7 + 3 * SG + 500], [X7 + 70, CY2, top7 + 3 * SG + 500], { el: one }], { pitch: 88, kmax: 1.1 });
  W.cam([
    [mk.t0, mk.cam, 0.01],
    [T('r1') - 0.9, shAskNear, 1.7],
    [T('r2') - 0.5, shAsk, 1.3],
    [T('r4') - 0.5, shTrain, 1.3],
    [T('r5') - 0.6, shO1, 1.5],
    [T('r5b') - 0.5, shAime, 1.3],
    [T('r6') - 0.4, shR1, 1.3],
    [Tend('r6') + 0.4, shR1b, 1.0],
    [T('r8') - 0.5, shBars, 1.3],
    [T('r8e') - 0.6, shAime3, 1.4],
    [T('r8b') - 0.5, shMain, 1.3],
    [T('r9') - 0.6, shCheck, 1.4],
    [T('r11') - 0.5, sh25, 1.3],
    [T('r12') - 0.5, shCols, 1.4],
    // 「它多写的每一块，都是多走的一趟」：升到最高那根的顶上，看一块一块地加上去
    [T('r13') - 0.9, shTop, 1.6],
    [Tend('r13') + 0.7, blankCam(X7, CY2 + 1700), Math.max(0.8, s.end + 0.35 - Tend('r13') - 0.7)],
  ]);
  sfx('whoosh', T('r4') - 0.5, { g: 0.15 }); sfx('whoosh', T('r5') - 0.6, { g: 0.18 }); sfx('whoosh', T('r8') - 0.5, { g: 0.15 }); sfx('whoosh', T('r9') - 0.6, { g: 0.18 }); sfx('whoosh', T('r12') - 0.5, { g: 0.18 }); sfx('riser', T('r13') - 0.9, { g: 0.14 }); sfx('whoosh', Tend('r13') + 0.7, { g: 0.18 });
});
