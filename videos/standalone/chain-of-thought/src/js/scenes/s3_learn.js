// 03 学会思考：从提问里的一句话，到练进模型里的习惯。镜头一路向右。
//   S11：OpenAI o1（2024）回答之前先写很长的思考；S12：DeepSeek-R1（2025 年 1 月），R1-Zero 训练时不给人写的解题过程，
//   答对就给奖励（另有格式奖励），思考越写越长，训练中途写下「Wait, wait. Wait. That's an aha moment I can flag here.」（表 2）；
//   L2：思考模式算开头那道题，先按 26000 − 8 算，再换成 25000 + 992 验算；每种位数 5 题，25 道全对，平均思考 token 93 → 550。
scene('learn', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                              // 引擎镜头不动；运动由 rig 完成
  const { desk, rig, board } = makeDesk(world, { x: 1600, y: 540, rx: 26, rz: -2, k: 1.1 });

  // 桌上一条时间线
  const axis = h('div', 'hair l', desk); px(axis, -1120, 330, 4300, 2);
  fromTo(axis, c0 + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 2.5, ease: 'power2.out' });
  const year = (x, txt, t) => { const tk = h('div', 'abs', desk); px(tk, x, 318, 2, 26); css(tk, { background: '#707070' }); const l = h('div', 'note', desk, txt); css(l, { position: 'absolute', left: x - 4 + 'px', top: '352px', fontSize: '30px', color: '#1c1c1c' }); show(tk, t, { y: 0, d: 0.3 }); show(l, t + 0.1, { y: 6, d: 0.4 }); return l; };

  // ── A：提问里的一句话 → 练进模型 ──
  const Q = sheet(desk, -1100, -280, 560, 540);
  show(Q, c0 + 0.1, { y: 0, d: 0.5 }); show(Q.shadowEl, c0 + 0.1, { y: 0, d: 0.5, a: 0.7 });
  header(Q, '2022', '提问', 560, c0 + 0.2);
  const ql = greyLines(Q, 44, 166, [460, 360], 36);
  ql.forEach((e, i) => show(e, c0 + 0.4 + i * 0.1, { y: 0, x: -10, d: 0.4 }));
  const sent = ln(Q, "Let's think step by step.", 44, 262, 34); css(sent, { fontStyle: 'italic' });
  const sentZh = ln(Q, '一步一步来想', 44, 316, 26, 'g');
  show(sent, T('r1', '一步一步') - 0.1, { y: 6, d: 0.45 }); show(sentZh, T('r1', '一步一步') + 0.2, { y: 6, d: 0.4 });
  const sb = band(Q, 34, 254, 492, 104); show(sb, T('r1', '一句话') - 0.1, { y: 0, d: 0.4 });
  year(-1100, '2022', c0 + 0.6);
  const M = tile(desk, '模型', -380, -130, 380, 240, 90); css(M.top, { fontSize: '44px', fontWeight: 500 });
  fromTo(M, T('r2') - 0.1, { autoAlpha: 0, top: '-90px' }, { autoAlpha: 1, top: '-130px', duration: 0.6, ease: 'power2.out' });
  // 那句话滑进模型
  const strip = ln(desk, "Let's think step by step.", -1056, -18, 34); css(strip, { fontStyle: 'italic' });
  const tIn = T('r2', '练进') - 0.3;
  show(strip, tIn, { y: 0, d: 0.01 });
  to(strip, tIn + 0.02, { left: '-330px', top: '-30px', opacity: 0, duration: 1.0, ease: 'power2.in' });
  const mark = h('div', 'note', M.top, '先想，再答'); css(mark, { position: 'absolute', left: '0', right: '0', top: '150px', textAlign: 'center', fontSize: '28px' });
  show(mark, tIn + 0.9, { y: 6, d: 0.4 }); sfx('pop', tIn + 0.9, { g: 0.3 });

  // ── B：2024 o1；2025 DeepSeek-R1 ──
  const O = sheet(desk, 80, -300, 500, 560);
  show(O, T('r3') - 0.2, { y: 0, d: 0.5 }); show(O.shadowEl, T('r3') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(O, 'OpenAI · 2024 年', 'o1 的一次回答', 500, T('r3') + 0.1);
  year(80, '2024', T('r3') + 0.1);
  const thL = h('div', 'note', O, '思考'); px(thL, 44, 146); css(thL, { fontSize: '28px' });
  const th = greyLines(O, 44, 190, [400, 380, 410, 300, 390, 360, 240], 30, 10);
  const anL = h('div', 'note', O, '回答'); px(anL, 44, 416); css(anL, { fontSize: '28px' });
  const an = greyLines(O, 44, 458, [320, 200], 30, 10);
  show(thL, T('r3', '思考') - 0.6, { y: 6, d: 0.3 });
  th.forEach((e, i) => fromTo(e, T('r3', '回答之前') + i * 0.11, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.3 }));
  show(anL, T('r3', '一大段') - 0.3, { y: 6, d: 0.3 });
  an.forEach((e, i) => fromTo(e, T('r3', '一大段') + 0.4 + i * 0.1, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.3 }));

  const R = sheet(desk, 720, -340, 640, 640);
  show(R, T('r4') - 0.2, { y: 0, d: 0.5 }); show(R.shadowEl, T('r4') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(R, 'DeepSeek-AI · 2025 年 1 月', 'DeepSeek-R1 的训练方法', 640, T('r4') + 0.1);
  year(720, '2025', T('r4') + 0.1);
  const zero = h('div', 'lab', R, '其中一个版本：R1-Zero'); px(zero, 44, 160); css(zero, { fontSize: '30px', fontWeight: 500 });
  show(zero, T('r5', '其中') - 0.1, { y: 6, d: 0.4 });
  // 不给人写的解题过程：那一摞放到一边，划掉
  const HS = h('div', 'p3', desk); px(HS, 1440, -260, 300, 380);
  for (let i = 0; i < 14; i++) { const p = h('div', 'ream', HS); px(p, (i * 37) % 5, (i * 53) % 4, 300, 380); css(p, { transform: `translateZ(${i * 3}px)` }); }
  const hsTop = h('div', 'sheet', HS); px(hsTop, 0, 0, 300, 380); css(hsTop, { transform: 'translateZ(44px)' });
  const hsT = para(hsTop, '人写的<br>解题过程', 30, 30, 240, 30); greyLines(hsTop, 30, 160, [220, 180, 200, 140], 34, 9);
  fromTo(HS, T('r5', '不给') - 0.6, { autoAlpha: 0, left: '1440px' }, { autoAlpha: 1, left: '1440px', duration: 0.4 });
  const cross = h('div', 'abs', hsTop); px(cross, 10, 186, 280, 3); css(cross, { background: '#a5402d', transform: 'rotate(-28deg)', transformOrigin: '50% 50%' });
  fromTo(cross, T('r5', '解题过程') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
  to(HS, T('r5', '解题过程') + 0.3, { opacity: 0.7, duration: 0.5 });
  sfx('tick', T('r5', '解题过程'), { g: 0.35 });
  // 答对了，就给奖励
  const loop = ['作答', '判对错', '对了：奖励'].map((t, i) => { const e = h('div', 'ln', R, t); px(e, 44 + i * 190, 236); css(e, { fontSize: '28px' }); return e; });
  const arr = [0, 1].map((i) => { const e = h('div', 'note', R, '→'); px(e, 150 + i * 200, 236); css(e, { fontSize: '28px' }); return e; });
  [loop[0], arr[0], loop[1], arr[1], loop[2]].forEach((e, i) => show(e, T('r6') + i * 0.12, { y: 6, x: -6, d: 0.35 }));
  sfx('pop', T('r6', '奖励'), { g: 0.3 });
  // 思考越写越长：纸上的思考一行行往下长，旁边是训练的进度
  const grL = h('div', 'note', R, '训练中，每次回答里的思考'); px(grL, 44, 314); css(grL, { fontSize: '24px' });
  show(grL, T('r7') - 0.1, { y: 6, d: 0.35 });
  const grow = greyLines(R, 44, 356, [520, 480, 540, 500, 460, 530, 490, 520, 470, 380], 26, 9);
  const tg0 = T('r7', '越写'), tg1 = Tend('r7');
  grow.forEach((e, i) => fromTo(e, tg0 - 1.2 + (tg1 - tg0 + 1.2) * i / grow.length, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.25 }));
  const prog = h('div', 'abs', R); px(prog, 590, 356, 4, 240); css(prog, { background: '#1c1c1c', transformOrigin: '50% 0' });
  fromTo(prog, tg0 - 1.2, { scaleY: 0 }, { scaleY: 1, duration: tg1 - tg0 + 1.2, ease: 'none' });

  // ── D：训练中途的一句 ──
  const Wq = sheet(desk, 2300, -280, 820, 560);
  show(Wq, T('r8') - 0.2, { y: 0, d: 0.5 }); show(Wq.shadowEl, T('r8') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(Wq, 'R1-Zero 训练中途的一个版本 · 论文表 2', '它在思考里写下', 820, T('r8', '中途'));
  const en = ln(Wq, '', 44, 170, 40); css(en, { fontStyle: 'italic' }); appear(en, T('r9'));
  const enParts = [['Wait, ', T('r9')], ['wait. ', T('r9') + 0.6], ['Wait.', T('r9') + 1.25]];
  enParts.forEach(([w, t]) => appear(h('span', 'w', en, w), t));
  const en2 = ln(Wq, "That's an aha moment I can flag here.", 44, 236, 34); css(en2, { fontStyle: 'italic' });
  show(en2, T('r9', '顿悟') - 0.4, { y: 6, d: 0.45 });
  const zhq = para(Wq, '等等，等等。等等。这是个顿悟时刻，可以在这儿标记一下。', 44, 300, 732, 28); css(zhq, { color: '#555' });
  show(zhq, T('r9', '顿悟') + 0.2, { y: 6, d: 0.45 });
  const ul = h('div', 'hair', Wq); px(ul, 44, 222, 330, 2); fromTo(ul, T('r10', '回头检查') - 0.4, { scaleX: 0 }, { scaleX: 1, duration: 0.5 });
  const chkN = h('div', 'gloss', Wq, '停下来，回头检查<br><span class="g">没有人示范过</span>'); px(chkN, 44, 420); css(chkN, { fontSize: '28px' });
  show(chkN, T('r10') + 0.2, { y: 8, d: 0.45 }); sfx('blip', T('r10') + 0.2, { g: 0.3 });

  // ── E：思考模式算开头那道题 ──
  const Th = sheet(desk, 3260, -320, 720, 640);
  show(Th, T('r11') - 0.2, { y: 0, d: 0.5 }); show(Th.shadowEl, T('r11') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  header(Th, 'DeepSeek 思考模式 · 2026 年 11 月 3 日', '25992 × 92138', 720, T('r11', '思考模式') - 0.2);
  const m1 = ln(Th, '按 26000 − 8 来算', 44, 170, 30, 'g'); show(m1, T('r11', '思考模式') + 0.4, { y: 6, d: 0.4 });
  const v1 = stream(Th, '= 2,394,850,896', 44, 220, 36, T('r12', '算对') - 0.3, 30);
  const m2 = ln(Th, '换成 25000 + 992，再算一遍', 44, 320, 30, 'g'); show(m2, T('r12', '换了') - 0.1, { y: 6, d: 0.4 });
  const v2 = stream(Th, '= 2,394,850,896', 44, 370, 36, T('r12', '验算') - 0.4, 30);
  const yes = h('div', 'chk', Th); px(yes, 420, 378); show(yes, T('r12', '验算') - 0.1, { y: 0, d: 0.3 });
  const yesT = ln(Th, '对', 452, 374, 34); show(yesT, T('r12', '验算') - 0.05, { y: 6, d: 0.3 });
  sfx('tick', T('r12', '验算') + 0.3, { g: 0.35 });
  [Th, Th.shadowEl, Wq, Wq.shadowEl].forEach((e) => to(e, T('r13') + 0.2, { opacity: 0.2, duration: 0.6 }));

  // ── F：草稿按位数摞起来 ──
  const Dd = [[3, 93.0, '221 × 427'], [4, 165.6, '7508 × 5120'], [5, 261.2, '25992 × 92138'], [6, 412.2, '903946 × 966305'], [7, 550.2, '1003589 × 8570388']];
  const X0 = 4300, tS = T('r13') + 0.2;
  Dd.forEach(([n, tok, prob], k) => {
    const x = X0 + k * 340, y = -150, sheets = Math.round(tok / 5), hz = 3;
    const grp = h('div', 'p3', desk); px(grp, 0, 0, 0, 0);
    const sh = h('div', 'shadow', grp); px(sh, x + 16, y + 24, 255, 315); css(sh, { opacity: 0.7 });
    for (let i = 0; i < sheets; i++) { const p = h('div', 'ream', grp); px(p, x + ((i * 37) % 5) - 2, y + ((i * 53) % 3) - 1, 270, 330); css(p, { transform: `translateZ(${i * hz}px)` }); }
    const top = h('div', 'sheet', grp); px(top, x, y, 270, 330); css(top, { transform: `translateZ(${sheets * hz + 2}px)` });
    ln(top, prob, 18, 256, prob.length > 13 ? 27 : 32);
    show(grp, tS + k * 0.18, { y: 0, d: 0.5 });
    const lab = board(`<div style="text-align:center;width:300px"><div class="big" style="font-size:58px">${Math.round(tok)}</div><div class="note" style="font-size:36px">${n} 位数</div></div>`, x + 135, y + 60, sheets * hz + 230, -150);
    show(lab, T('r14', '位数越多') - 0.3 + k * 0.15, { y: 8, d: 0.4 });
  });
  const axisN = board('<span class="note" style="font-size:36px">平均思考 token　·　每种位数 5 题，25 道全部答对</span>', X0 - 20, 250, 0);
  show(axisN, T('r14', '全做对') - 0.2, { y: 6, d: 0.4 }); sfx('pop', T('r14', '全做对'), { g: 0.3 });

  rig.track(s.start, { x: 1600, y: 540, k: 1.1 }, [
    [c0 + 0.1, { x: 1590 }, Math.max(0.5, T('r3') - c0 - 0.5), { ease: 'none' }],
    [T('r3') - 0.4, { x: 610, y: 560, k: 1.1 }, 1.1],
    [null, { x: 600 }, Math.max(0.5, T('r4') - T('r3') - 1.0), { ease: 'none' }],
    [T('r4') - 0.35, { x: -180, y: 560, k: 1.0 }, 1.1],
    [null, { x: -190 }, Math.max(0.5, T('r5') - T('r4') - 0.9), { ease: 'none' }],
    [T('r5') + 0.2, { x: -330, y: 560, k: 1.05 }, 1.0],
    [null, { x: -340 }, Math.max(0.5, T('r8') - T('r5') - 1.4), { ease: 'none' }],
    [T('r8') - 0.35, { x: -1870, y: 540, k: 1.05 }, 1.1],
    [null, { x: -1880 }, Math.max(0.5, T('r11') - T('r8') - 0.9), { ease: 'none' }],
    [T('r11') + 0.3, { x: -2830, y: 540, k: 1.05 }, 1.1],
    [null, { x: -2840 }, Math.max(0.5, T('r13') - T('r11') - 0.9), { ease: 'none' }],
    [T('r13') + 0.3, { x: -3233, y: 1160, rx: 50, rz: -14, k: 0.85 }, 1.4],
    [null, { x: -3243 }, Math.max(0.5, s.end - T('r13') - 1.2), { ease: 'none' }],
  ]);
  [T('r3') - 0.4, T('r4') - 0.35, T('r8') - 0.35, T('r11') + 0.3, T('r13') + 0.3].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
