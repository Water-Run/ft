// 04 越写越长：先写过程，从人写进提问里的一句话，变成练进模型里的习惯；没人要求，它的思考自己越写越长。
// 一、提问里的一句「Let's think step by step」：应用题正确率 10.4% → 40.7%；那几块字沉进一摞层里（练进模型）。
// 二、o1 回答前先写一大段思考；R1-Zero 训练时不看人写的过程，答对就给奖励；训练中思考越写越长（示意）。
// 三、思考模式算开头那道题：算对以后换一种拆法再算一遍。二十五道全对；五根柱子按平均思考块数立起来；
//     柱顶每多一块，就是多走一趟：一摞层立起来、算到顶、压成柱子上的一道接缝。
// 事实：S2（Kojima 等，2022-05-24；GSM8K，text-davinci-002，10.4% → 40.7%）；S11（o1，2024）；S12（R1，2025-01-22；R1-Zero 纯强化学习、
// 奖励为准确性加格式、训练中思考时间稳步增长）；L2（n5-03 的思考：26000 − 8，再 Check alternative 25,000 + 992；25/25；平均思考 93、166、261、412、550 块）。
scene('learn', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const mk = chapterMark(W, s, '04', '越写越长', -1500, 900, T('r1') - 0.2);
  const X0 = -900, LH = 112;
  // 每讲完一段，这一段淡出去，免得留在后面几镜的背景里
  const VA = (t) => 1 - ramp(t, T('r5') - 0.3, 0.7), VB = (t) => 1 - ramp(t, T('r9') - 0.3, 0.7), VC = (t) => 1 - ramp(t, T('r11') - 0.3, 0.7);
  const drop = (k, ta, f) => place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * (f ? f(t) : 1) }));
  const writeAll = (toks, t0, t1, f) => toks.forEach((k, i) => { const ta = lerp(t0, t1, toks.length > 1 ? i / (toks.length - 1) : 0); k.ta = ta; drop(k, ta, f); if (i % 3 === 0) sfx('key', ta, { g: 0.14 }); });

  // ── 一、提问里的一句话 ──
  const AY = 0;
  const qa = block(S, '<span class="g">Q：一道应用题</span>', { w: 560, d: 100, h: 30, fs: 44 });
  place(W, qa.g, (t) => ({ x: X0 + 280, y: AY, z: 40 * (1 - ramp(t, T('r1') + 0.3, 0.5, ease.out3)), o: ramp(t, T('r1') + 0.3, 0.3) * VA(t) }));
  const A_ = para(S, X0, AY, ['A：'], { fs: 44, d: 100, h: 30, x1st: X0 + 600 });
  drop(A_[0], T('r1') + 0.6, VA);
  const PH = para(S, X0, AY, ["Let's", 'think', 'step', 'by', 'step.'], { fs: 44, d: 100, h: 30, x1st: A_[0].x1 + 14 });
  const sinkAt = T('r4', '练进') - 0.6;
  PH.forEach((k, i) => {
    const ta = T('r1b', '加一句') - 0.2 + i * 0.16;
    // 先落在答案前面；「练进了模型」时一块块飞进上方那一摞层里，变小、淡去
    place(W, k.b.g, (t) => {
      const m = ramp(t, sinkAt + i * 0.1, 1.0, ease.io3);
      return { x: lerp(k.x, 360, m), y: lerp(k.y, -640, m), z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)) + Math.sin(m * Math.PI) * 260 + m * 200, s: 1 - 0.6 * m, o: ramp(t, ta, 0.2) * (1 - ramp(t, sinkAt + 0.7 + i * 0.1, 0.35)) };
    });
    sfx('key', ta, { g: 0.2 });
  });
  const cite = W.board('<div class="lbl g">2022 年 5 月</div>', PH[0].x0, AY, 40, 0, -150);
  fade(W, cite, (t) => ramp(t, T('r1', '几个月后') - 0.2, 0.4) * (1 - ramp(t, T('r4') - 0.3, 0.4)));
  const zh = W.board('<div class="lbl">「我们一步一步来想」</div>', PH[0].x0, AY, 40, 0, -100);
  fade(W, zh, (t) => ramp(t, T('r1b', '一步一步') - 0.3, 0.4) * (1 - ramp(t, T('r4') - 0.3, 0.4)));
  // 正确率：10.4% → 40.7%（两根立着的方块，高度按百分比）
  const BX = PH[4].x1 + 260, PCT = 7;
  [[10.4, '直接回答', 0], [40.7, '加这一句', 1]].forEach(([v, lab, i]) => {
    const hh = v * PCT, ta = T('r2', i ? '四成' : '一成') - 0.4;
    const b = block(S, '', { w: 130, d: 100, h: hh, cls: 'cube' });
    place(W, b.g, (t) => ({ x: BX + i * 220, y: AY, z: 0, o: ramp(t, ta, 0.3) * VA(t) }));
    const v_ = W.board(`<div class="lbl" style="transform:translateX(-50%)">${v}%</div>`, BX + i * 220, AY, hh + 20, 0, -60);
    const l_ = W.board(`<div class="lbl" style="transform:translateX(-50%)">${lab}</div>`, BX + i * 220, AY + 60, 0, 0, 6);
    fade(W, v_, (t) => ramp(t, ta + 0.2, 0.4) * VA(t)); fade(W, l_, (t) => ramp(t, ta, 0.4) * VA(t));
    sfx('tick', ta + 0.2, { g: 0.25 });
  });
  const src = W.board('<div class="lbl g" style="transform:translateX(-50%)">GSM8K 数学应用题 · text-davinci-002</div>', BX + 110, AY + 60, 0, 0, 70);
  fade(W, src, (t) => ramp(t, T('r2', '应用题') - 0.2, 0.4) * VA(t));
  // 人写进提问里的一句话
  rectOf(W, S, PH, 0, 4, (t) => ramp(t, T('r3', '提问里') - 0.3, 0.4) * (1 - ramp(t, sinkAt - 0.2, 0.3)), 'g');
  const hw = W.board('<div class="lbl g">人写进提问里</div>', PH[0].x0, AY, 40, 0, 46);
  fade(W, hw, (t) => ramp(t, T('r3', '提问里') - 0.2, 0.4) * (1 - ramp(t, sinkAt - 0.2, 0.3)));
  // 模型：一摞层；那几块字沉进去，层从下往上一张张变深
  ream(W, S, 360, -640, { w: 760, d: 300, n: 32, gap: 15, rise: (t) => ramp(t, T('r4') - 0.4, 0.8, ease.out3),
    fill: (t) => ramp(t, sinkAt + 1.0, 1.4, (k) => k), op: VA });
  const ml = W.board('<div class="lbl">模型</div>', 360 + 400, -640, 300, 0, -20);
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
  const dimB = (t) => (1 - 0.65 * ramp(t, T('r7') - 0.3, 0.5)) * VB(t);
  const VB2 = (t) => (1 - 0.7 * ramp(t, T('r8') - 0.4, 0.5)) * VB(t);   // 讲训练中越写越长时，上面两行退成淡影
  const P1 = think(BY, 36, T('r5', '发布') + 0.2, T('r5', '思考') + 0.3, dimB);
  tagL('o1　2024', BY, T('r5', '发布') - 0.2, dimB);
  const tk = W.board('<div class="lbl g">思考</div>', X0 + 900, BY + LH, 60, 0, -70);
  fade(W, tk, (t) => ramp(t, T('r5', '思考') - 0.2, 0.4) * dimB(t));
  const CY_ = BY + 520;
  const P2 = think(CY_, 22, T('r7b') - 0.6, T('r7b') + 0.1, VB2, T('r6', 'DeepSeek') + 0.4);
  tagL('R1-Zero　2025', CY_, T('r6', 'DeepSeek') - 0.2, VB2);
  // 人写的解题过程：浮现一下就被拿开（训练时不给它看）
  const HX = 700, HY = CY_ - 20;
  ['92138 = 92000 + 138', '25992 × 92000 = …', '25992 × 138 = …'].forEach((ln, i) => {
    const e = W.print(`<div class="hand s">${ln}</div>`, HX, HY + i * 76);
    place(W, e, (t) => ({ x: HX + 260 * ramp(t, Tend('r7') - 0.4, 0.8), y: HY + i * 76, z: 0.6, o: ramp(t, T('r7') + 0.4 + i * 0.12, 0.4) * (1 - ramp(t, Tend('r7') - 0.4, 0.6)) }));
  });
  const nh = W.board('<div class="lbl g">人写的解题过程</div>', HX, HY, 30, 0, -70);
  fade(W, nh, (t) => ramp(t, T('r7') + 0.4, 0.4) * (1 - ramp(t, Tend('r7') - 0.4, 0.6)));
  const last2 = P2[P2.length - 1];
  const ck = h('div', 'p3 chk2 big', S); ck.style.transform = `translate3d(${last2.x1 + 40}px, ${last2.y - 26}px, 1px) rotate(40deg)`;
  fade(W, ck, (t) => ramp(t, T('r7b', '答对') - 0.1, 0.3) * VB2(t));
  const rw = W.board('<div class="lbl">答对了　→　奖励</div>', last2.x1 + 110, last2.y, 30, 0, -24);
  fade(W, rw, (t) => ramp(t, T('r7b', '奖励') - 0.2, 0.4) * VB2(t));
  sfx('chime', T('r7b', '奖励'), { g: 0.22 });
  // 训练过程里，每次回答的思考越写越长（示意：一排立着的方块，越往后越高）
  const TY = CY_ + 640, rnd = seeded(404);
  const NB = 16;
  for (let i = 0; i < NB; i++) {
    const hh = 30 + 560 * Math.pow(i / (NB - 1), 1.25) * (0.86 + 0.28 * rnd());
    const b = block(S, '', { w: 70, d: 70, h: hh, cls: 'cube' });
    const ta = T('r8') + 0.3 + i * 0.17;
    place(W, b.g, (t) => ({ x: X0 + 120 + i * 104, y: TY, z: 0, o: ramp(t, ta, 0.3) * VB(t) }));
  }
  const ar = seg(S, ''); ar.set([X0 + 60, TY + 90, 0.8], [X0 + 120 + NB * 104, TY + 90, 0.8]);
  fade(W, ar.e, (t) => ramp(t, T('r8') - 0.2, 0.4) * VB(t));
  const trl = W.print('<div class="lbl">训练　→</div>', X0 + 120 + (NB - 2) * 104, TY + 110);
  fade(W, trl, (t) => ramp(t, T('r8') - 0.2, 0.4) * VB(t));
  const tll = W.board('<div class="lbl g">每次回答里思考的长度（示意）</div>', X0 + 120, TY, 260, 0, -40);
  fade(W, tll, (t) => ramp(t, T('r8') - 0.2, 0.4) * VB(t));
  sfx('riser', T('r8', '越写') - 1.4, { g: 0.12 });

  // ── 三、开头那道题交给思考模式：算对以后，换一种拆法再算一遍 ──
  const DY = 3000;
  const qd = block(S, '25992 × 92138 =', { w: 640, d: 100, h: 30, fs: 52 });
  place(W, qd.g, (t) => ({ x: X0 + 320, y: DY, z: 40 * (1 - ramp(t, T('r9', '开头') - 0.3, 0.5, ease.out3)), o: ramp(t, T('r9', '开头') - 0.3, 0.3) * VC(t) }));
  tagL('思考模式', DY, T('r9', '思考模式') - 0.2, VC);
  const PD = para(S, X0, DY + LH, [
    3, '25992', '=', '26000', '−', '8', 2, '\n',
    '26000', '×', '92138', '−', '8', '×', '92138', 2, '=', '2,394', ',850', ',896', '\n',
    'Check', 'alternative', ':', '25,000', '+', '992', 2, '\n',
    '25,000', '×', '92138', '+', '992', '×', '92138', 2, '=', '2,394', ',850', ',896', '\n',
    'yes',
  ], { fs: 44, lh: LH, maxW: 1800 });
  const seg1 = PD.filter((k) => k.line <= 1), seg2 = PD.filter((k) => k.line >= 2);
  writeAll(seg1, T('r9', '思考模式') + 0.1, Tend('r9') + 0.2, VC);
  writeAll(seg2, T('r10', '换了') - 0.2, T('r10', '再算') + 0.5, VC);
  const r1 = seg1.slice(-3), r2_ = PD.filter((k) => k.line === 3).slice(-3);
  const ulD = (toks, ta) => { const e = seg(S, 'w'); e.set([toks[0].x0, toks[0].y + 50, 0.8], [toks[toks.length - 1].x1, toks[0].y + 50, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.35) * VC(t)); };
  ulD(r1, T('r10', '算对') - 0.2); ulD(r2_, T('r10', '一遍') - 0.1);
  arc3(W, S, [r2_[1].x, r2_[1].y - 30, 22], [r1[1].x, r1[1].y + 30, 22], 140, { n: 24, draw: (t) => ramp(t, T('r10', '一遍'), 0.7), op: VC });
  const s1l = W.board('<div class="lbl g">先这样算</div>', r1[2].x1 + 40, r1[2].y, 30, 0, -26);
  const s2l = W.board('<div class="lbl g">换一种拆法</div>', r2_[2].x1 + 40, r2_[2].y, 30, 0, -26);
  fade(W, s1l, (t) => ramp(t, T('r9', '思考模式') + 0.2, 0.4) * VC(t)); fade(W, s2l, (t) => ramp(t, T('r10', '换了') - 0.2, 0.4) * VC(t));

  // ── 二十五道全对；五根柱子：三位到七位的平均思考块数 ──
  const GY = DY + 900, GX = X0 + 200, CWd = 72;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const b = block(S, '', { w: 58, d: 58, h: 96, cls: 'cube' });
    const tt = T('r11', '各取') - 0.2 + r * 0.18 + c * 0.05;
    place(W, b.g, (t) => ({ x: GX + c * CWd, y: GY + r * 100, z: 0, o: ramp(t, tt, 0.25) }));
  }
  const g25 = W.board('<div class="lbl l" style="transform:translate(-50%,-100%)">25 / 25</div>', GX + 2 * CWd, GY - 40, 130, 0, 0);
  fade(W, g25, (t) => ramp(t, T('r11', '全对') - 0.2, 0.4));
  const AVG = [93, 166, 261, 412, 550], SG = 2.4, CX = GX + 700, CS = 230, CY2 = GY + 200;
  const tg = [T('r12', '三位数') - 0.2, T('r12', '九十') - 0.6, T('r12', '九十') + 0.1, T('r12', '七位数') - 0.6, T('r12', '七位数') - 0.1];
  const bumps = [0, 1, 2].map((j) => T('r13', '每一块') - 0.05 + j * 0.75);
  AVG.forEach((v, i) => {
    const extra = (t) => (i === 4 ? bumps.reduce((a, b) => a + (t >= b + 0.62 ? 1 : 0), 0) : 0);
    const col = column(W, S, CX + i * CS, CY2, { w: 120, d: 90, seg: SG, n: (t) => v * ramp(t, tg[i], 1.2, ease.out3) + extra(t) });
    col.g.classList.add('fine');
    const vl = W.board(`<div class="lbl" style="transform:translateX(-50%)">${v}</div>`, CX + i * CS, CY2, v * SG + 30, 0, -60);
    fade(W, vl, (t) => ramp(t, tg[i] + 0.8, 0.4));
    const dl = W.board(`<div class="lbl" style="transform:translateX(-50%)">${'三四五六七'[i]}位</div>`, CX + i * CS, CY2 + 60, 0, 0, 10);
    fade(W, dl, (t) => ramp(t, tg[i], 0.4));
    sfx('tick', tg[i] + 0.8, { g: 0.18 });
  });
  const al = W.board('<div class="lbl l g" style="transform:translateX(-50%)">平均写的思考块数</div>', CX + 2 * CS, CY2, 1500, 0, -40);
  fade(W, al, (t) => ramp(t, T('r12') - 0.2, 0.4) * (1 - ramp(t, T('r13') - 0.8, 0.5)));
  // 柱顶：每多一块，就多走一趟——一摞层立起来、算到顶、压成一道接缝
  const X7 = CX + 4 * CS, top7 = 550 * SG;
  bumps.forEach((b, j) => {
    ream(W, S, X7, CY2, { w: 120, d: 90, n: 48, gap: 10, z: () => top7 + j * SG,
      rise: (t) => ramp(t, b, 0.28, ease.out3) * (1 - ramp(t, b + 0.45, 0.17, (k) => k)), fill: (t) => ramp(t, b + 0.1, 0.32, (k) => k) });
    sfx('tick', b + 0.62, { g: 0.22 });
  });
  const one = W.board('<div class="lbl">多写一块　＝　多走一趟</div>', X7 + 90, CY2, top7 + 300, 30, -20);
  fade(W, one, (t) => ramp(t, T('r13', '多走') - 0.3, 0.4));

  // ── 镜头 ──
  const hold = (a, b) => Math.max(0.5, b - a);
  W.cam([
    [mk.t0, mk.cam, 0.01],
    [T('r1') - 0.9, { cx: -280, cy: AY + 20, cz: 40, pitch: 50, yaw: -8, k: 1.12 }, 1.8],
    [null, { cx: -240, cy: AY + 20, cz: 40, pitch: 52, yaw: -4, k: 1.12 }, hold(T('r1') + 1.0, T('r2') - 0.4), (k) => k],
    [T('r2') - 0.4, { cx: 240, cy: AY + 20, cz: 120, pitch: 60, yaw: -10, k: 0.88 }, 1.6],
    [T('r3') - 0.2, { cx: -60, cy: AY + 30, cz: 70, pitch: 56, yaw: -6, k: 0.94 }, 1.4],
    [T('r4') - 0.3, { cx: 260, cy: -320, cz: 260, pitch: 66, yaw: -16, k: 0.76 }, 1.8],
    [null, { cx: 280, cy: -340, cz: 280, pitch: 68, yaw: -10, k: 0.7 }, hold(T('r4') + 1.6, T('r5') - 0.4), (k) => k],
    [T('r5') - 0.5, { cx: -260, cy: BY + 170, cz: 30, pitch: 46, yaw: -6, k: 0.88 }, 1.8],
    [T('r6') - 0.3, { cx: -260, cy: CY_ - 60, cz: 30, pitch: 46, yaw: -4, k: 0.84 }, 1.6],
    [T('r7') - 0.2, { cx: 100, cy: CY_ + 80, cz: 30, pitch: 48, yaw: -8, k: 0.86 }, 1.4],
    [T('r7b') - 0.6, { cx: -220, cy: CY_ + 150, cz: 30, pitch: 46, yaw: -4, k: 0.88 }, 1.2],
    [T('r8') - 0.4, { cx: -100, cy: TY - 40, cz: 220, pitch: 66, yaw: -12, k: 0.86 }, 1.8],
    [null, { cx: -60, cy: TY - 40, cz: 240, pitch: 68, yaw: -6, k: 0.86 }, hold(T('r8') + 1.5, T('r9') - 0.4), (k) => k],
    [T('r9') - 0.5, { cx: -80, cy: DY + 220, cz: 30, pitch: 46, yaw: -8, k: 0.88 }, 1.8],
    [null, { cx: -60, cy: DY + 260, cz: 30, pitch: 47, yaw: -3, k: 0.88 }, hold(T('r9') + 1.4, T('r11') - 0.5), (k) => k],
    [T('r11') - 0.5, { cx: GX + 150, cy: GY + 200, cz: 60, pitch: 58, yaw: -14, k: 1.0 }, 1.6],
    [T('r12') - 0.3, { cx: CX + 2 * CS - 60, cy: CY2, cz: 560, pitch: 78, yaw: -10, k: 0.62 }, 2.0],
    [null, { cx: CX + 2 * CS - 20, cy: CY2, cz: 600, pitch: 80, yaw: -4, k: 0.6 }, hold(T('r12') + 1.8, T('r13') - 0.7), (k) => k],
    [T('r13') - 1.0, { cx: X7 - 60, cy: CY2, cz: top7 + 160, pitch: 80, yaw: -18, k: 1.05 }, 1.5],
    [null, { cx: X7 - 40, cy: CY2, cz: top7 + 330, pitch: 81, yaw: -10, k: 1.05 }, hold(T('r13') + 0.6, Tend('r13') + 0.6), (k) => k],
    [Tend('r13') + 0.7, blankCam(X7, CY2 + 1700), Math.max(0.8, s.end + 0.35 - Tend('r13') - 0.7)],
  ]);
  sfx('whoosh', T('r5') - 0.5, { g: 0.2 }); sfx('whoosh', T('r9') - 0.5, { g: 0.2 }); sfx('whoosh', T('r12') - 0.3, { g: 0.2 }); sfx('whoosh', Tend('r13') + 0.7, { g: 0.2 });
});
