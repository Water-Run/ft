// 开场：你让 AI 修测试 → 它读、跑、改、通过 → 可模型只会写出文字 → 谁的手？→ 片名卡 → 包在模型外面的 Harness → Model + Harness = Agent。
// 项目与代码取自实验的演示项目（research/lab/demo，data.js）；Agent 的公式出自 LangChain（FACTS D3），画面署名。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  // 第 0 帧镜头就要在起点（docs/reference/pitfalls.md「全片的第 0 帧」）
  const hold = s.end - s.start - 0.2, dx = 16, cam0 = { x: 960 - dx / 2, y: 484, z: 1 };
  F((t) => { if (t < s.start + 0.1 && window._camOpen) Object.assign(window._camOpen.st, cam0); });
  const cam = makeCamera(world, 1920, VH); window._camOpen = cam;
  cam.track(s.start, cam0, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);

  // ── 第一屏：你的话、AI、项目（整组下移 70px，让画面上下居中） ──
  const g1 = h('div', 'abs', world); px(g1, 0, 70, 1920, 900);
  const you = h('div', 'row say', g1, `<span class="role">${tr('你', 'You')}</span><span class="tx"></span>`); px(you, 120, 170, 780, 88); you.querySelector('.tx').style.fontSize = '36px';
  wipe(you, s.start + 0.05, { dir: 'l', d: 0.5 }); sfx('whoosh', s.start + 0.05, { g: 0.4 });
  typeText(you.querySelector('.tx'), esc(D.task), T('o1', '测'), 9, { cursorUntil: Tend('o1') + 0.3 });

  const ai = blk(g1, 'bg-paper', 120, 330, 380, 360); ai.dataset.name = 'AI';
  const aiName = centered(ai, 'ink', 'AI', 190, 100, 380); css(aiName, { font: '900 130px Inter' });
  keyed(aiName).at(T('o3', '模型') - 0.1, { html: tr('模型', 'Model') });
  const aiSub = centered(ai, 'dimp', '', 190, 270, 380); css(aiSub, { font: '500 30px "Sans SC"' });
  keyed(aiSub).at(T('o3', '文字') - 0.2, { html: tr('只会写出文字', 'only writes text') });
  slam(ai, Q(T('o1', '说')), { from: 1.15, d: 0.4 }); sfx('thud', Q(T('o1', '说')), { g: 0.6 });

  const card = codeCard(g1, 'cart.py', D.cart_before.split('\n').map(esc), 1000, 170, 840, 40, 66);
  wipe(card.card, s.start + 0.3, { dir: 'r', d: 0.6 });
  const line3 = card.ls[2];
  line3.innerHTML = `<span class="ln">3</span>    return sum(prices<span class="hl">[1:]</span>)`;
  keyed(line3).at(T('o2', '改掉') + 0.25, { html: `<span class="ln">3</span>    return sum(prices<span class="strike">[1:]</span>)` })
    .at(T('o2', '改掉') + 0.75, { html: `<span class="ln">3</span>${esc(D.cart_after.split('\n')[2])}` });
  sfx('pop', T('o2', '改掉') + 0.25, { g: 0.6, p: 0.4 });
  // 读：一条朱红的扫描线从第 1 行扫到第 3 行
  const scan = blk(card.card, 'bg-ac', 0, 66, 10, 60);
  F((t) => { const k = clamp((t - T('o2', '读')) / 0.9); scan.style.top = (66 + k * 132).toFixed(1) + 'px'; scan.style.visibility = k > 0 && k < 1 ? 'visible' : 'hidden'; });

  const test = h('div', 'abs', g1); px(test, 1000, 480, 840, 110); css(test, { border: '3px solid var(--paper)', boxSizing: 'border-box' });
  txt(test, 'mono paper', 'test_cart.py', 26, 30).style.font = '700 36px Mono';
  const st = txt(test, 'ink bg-ac', tr('失败', 'FAIL'), 620, 16); css(st, { font: '900 46px "Sans SC"', padding: '4px 24px' });
  keyed(st).at(T('o2', '通过') - 0.05, { html: tr('通过', 'PASS'), cls: 'abs ink bg-paper' });
  const detail = txt(g1, 'mono dim', '', 1000, 616); detail.style.font = '600 32px Mono, "Sans SC"';
  keyed(detail).at(s.start + 0.6, { html: esc('失败：total([3, 5, 2]) 应为 10，实际得到 7') })
    .at(T('o2', '通过') - 0.05, { html: esc('通过：total([3, 5, 2]) = 10') });
  wipe(test, s.start + 0.45, { dir: 'r', d: 0.6 }); wipe(detail, s.start + 0.6, { dir: 'l', d: 0.5 });
  sfx('blip', T('o2', '跑'), { g: 0.6 }); sfx('chime', T('o2', '通过'), { g: 0.7 });

  // AI 的「手」：读、跑、改三下，各指向被动的那一块；到 o3 变成虚线、退成灰色
  const ov = overlay(g1);
  const hands = [
    [T('o2', '读'), 'M 500 400 C 700 400, 780 300, 990 300', tr('读', 'read'), 700, 296],
    [T('o2', '跑'), 'M 500 520 C 700 520, 800 535, 990 535', tr('跑', 'run'), 730, 470],
    [T('o2', '改掉'), 'M 500 640 C 720 680, 880 430, 990 404', tr('改', 'edit'), 760, 620],
  ].map(([t0, d, word, lx, ly]) => {
    const p = path(ov, d, 'paper', { w: 4 }); arrowIn(p, t0 - 0.1, 0.45);
    const l = txt(g1, 'paper', word, lx, ly); css(l, { font: '700 36px "Sans SC"' }); wipe(l, t0, { dir: 'l', d: 0.3 });
    return [p, l];
  });
  const tGone = T('o3', '不会') - 0.1;
  hands.forEach(([p, l], i) => { to(p, tGone + i * 0.06, { opacity: 0.18, duration: 0.4 }); to(l, tGone + i * 0.06, { opacity: 0.25, duration: 0.4 }); });

  // 模型写出的文字：一段约定格式的文字，不是动作
  const outLab = txt(g1, 'dim', tr('模型写出的', 'What the model writes'), 120, 730); outLab.style.font = '700 30px "Sans SC"';
  wipe(outLab, T('o3', '输出') - 0.2, { dir: 'l', d: 0.3 });
  const c1 = D.rounds[0].calls[0];
  const outTxt = txt(g1, 'mono ac', '', 120, 780); outTxt.style.font = '700 42px Mono';
  appear(outTxt, T('o3', '输出'));
  typeText(outTxt, esc(`${c1.name} ${JSON.stringify(c1.args)}`), T('o3', '输出'), 16, { cursorUntil: Tend('o4') });

  // 谁的手？
  const qm = blk(g1, 'bg-ac', 880, 690, 150, 150); qm.dataset.name = '?';
  centered(qm, 'ink', '?', 75, 6, 150).style.font = '900 130px Inter';
  slam(qm, Q(T('o4', '谁')), { from: 1.4, d: 0.4 }); sfx('thud', Q(T('o4', '谁')));
  const qp = path(ov, 'M 955 684 C 955 640, 965 600, 994 560', 'ac', { w: 4, dashed: '10 12', arrow: false }); arrowIn(qp, T('o4', '读'), 0.5);
  const qp2 = path(ov, 'M 790 806 L 872 790', 'ac', { w: 4, dashed: '10 12', arrow: false }); arrowIn(qp2, T('o4', '读') + 0.1, 0.5);

  // ── 片名卡：朱红整屏，墨色字 ──
  const tCard = Qf(T('oT') - 0.15), tOut = Q(Tend('oT') - 0.1);
  const cardT = h('div', 'abs bg-ac ink', root); px(cardT, 0, 0, 1920, VH);
  const k1 = txt(cardT, 'ink', tr('150 秒了解', 'In 150 s'), 120, 170); css(k1, { font: '900 72px "Sans SC"' });
  const k2 = txt(cardT, 't-1 ink', tr('Agent 的手', "The Agent's hands"), 112, 270);
  const k3 = txt(cardT, 'ink', 'Harness', 108, 470); css(k3, { font: '900 250px Inter', letterSpacing: '-.04em', lineHeight: '1' });
  [k1, k2, k3].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(cardT, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
  slide(k1, tCard + 0.2, { x: -80, d: 0.45 }); slam(k2, tCard + 0.3, { from: 1.2, d: 0.4 }); sfx('thud', tCard + 0.3);
  wipe(k3, tCard + 0.55, { dir: 'l', d: 0.5 }); sfx('pop', tCard + 0.55, { g: 0.6 });
  wipeOut(cardT, tOut, { dir: 'r', d: 0.4 }); sfx('whoosh', tOut, { g: 0.7 });
  hudGround('L', tCard + 0.15, tOut + 0.2, 'ac'); hudGround('R', tCard + 0.35, tOut + 0.05, 'ac');
  // 第一屏在片名卡盖满之后收起
  [you, ai, card.card, test, detail, outLab, outTxt, qm, ov].forEach((e) => vanish(e, tCard + 0.45));
  hands.forEach(([, l]) => vanish(l, tCard + 0.45));

  // ── 第二屏：Harness 包在模型外面；Model + Harness = Agent（整组下移 50px） ──
  const g2 = h('div', 'abs', world); px(g2, 0, 50, 1920, 918);
  const t2 = tOut + 0.05;
  const model = blk(g2, 'bg-paper', 680, 250, 400, 270); model.dataset.name = tr('模型', 'model');
  centered(model, 'ink', tr('模型', 'Model'), 200, 56, 400).style.font = '900 104px "Sans SC"';
  centered(model, 'dimp', tr('只收发文字', 'text in, text out'), 200, 190, 400).style.font = '500 30px "Sans SC"';
  wipe(model, t2, { dir: 'l', d: 0.4 });
  const frame = h('div', 'abs', g2); px(frame, 600, 170, 560, 430); css(frame, { border: '10px solid var(--paper)', boxSizing: 'border-box' });
  frame.dataset.name = 'Harness';
  wipe(frame, Q(T('o5', '包')), { dir: 'l', d: 0.6 }); sfx('whoosh', Q(T('o5', '包')), { g: 0.5 });
  const tab = txt(g2, 'ink bg-paper', 'Harness', 600, 108); css(tab, { font: '900 44px Inter', padding: '2px 18px' });
  slam(tab, Q(T('o5', 'Harness')), { from: 1.3, d: 0.4 }); sfx('thud', Q(T('o5', 'Harness')));
  // 它的手：这个 Harness 给模型的三个工具，挂在外框上
  const tools = D.tools.map((name, i) => {
    const y = 222 + i * 104;
    const ln = blk(g2, 'bg-paper', 1160, y + 30, 70, 6);
    const chip = txt(g2, 'mono ink bg-ac', name, 1230, y); css(chip, { font: '800 38px Mono', padding: '6px 20px' });
    const tt = T('o5', 'Harness') + 0.3 + i * 0.14;
    fromTo(ln, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' });
    slide(chip, tt + 0.08, { x: -40, d: 0.4 }); sfx('pop', tt + 0.08, { g: 0.45, p: 0.5 });
    return chip;
  });
  const youB = h('div', 'row say', g2, `<span class="role">${tr('你', 'You')}</span><span class="tx">${esc(D.task)}</span>`); px(youB, 90, 340, 460, 80);
  youB.querySelector('.tx').style.fontSize = '28px'; youB.querySelector('.role').style.width = '70px';
  wipe(youB, t2 + 0.1, { dir: 'l', d: 0.4 });
  const ov2 = overlay(g2);
  const inA = path(ov2, 'M 556 380 L 676 380', 'paper', { w: 5 }); arrowIn(inA, Q(T('o5', '包')) + 0.3, 0.4);
  const proj = h('div', 'abs', g2); px(proj, 1540, 170, 300, 330); css(proj, { border: '3px dashed var(--dim)', boxSizing: 'border-box' });
  proj.dataset.name = tr('项目', 'project');
  const pl = txt(g2, 'dim', tr('项目', 'Project'), 1560, 186); pl.style.font = '700 28px "Sans SC"';
  const PI = [['cart.py', 240], ['test_cart.py', 316], [tr('终端', 'terminal'), 392]].map(([n, y]) => { const e = h('div', 'abs file mono', g2, n); px(e, 1564, y, 252, 52); css(e, { fontSize: '28px', lineHeight: '46px' }); return e; });
  wipe(proj, T('o5', 'Harness') + 0.2, { dir: 'l', d: 0.4 }); wipe(pl, T('o5', 'Harness') + 0.25, { dir: 'l', d: 0.3 });
  PI.forEach((e, i) => wipe(e, T('o5', 'Harness') + 0.3 + i * 0.08, { dir: 'l', d: 0.3 }));
  // read_file → cart.py，edit_file → cart.py，run_tests → 终端
  [[0, 0], [1, 0], [2, 2]].forEach(([ci, pi], j) => {
    const y1 = 222 + ci * 104 + 30, y2 = [240, 316, 392][pi] + 26;
    const p2 = path(ov2, `M 1484 ${y1} C 1515 ${y1}, 1525 ${y2}, 1558 ${y2}`, 'ac', { w: 4 });
    arrowIn(p2, T('o5', 'Harness') + 0.55 + j * 0.15, 0.4);
    classAt(PI[pi], 'hit', T('o5', 'Harness') + 0.8 + j * 0.15);
  });
  const gH = txt(g2, 'gloss', tr('<b>Harness</b>：模型以外的那层程序。它把对话和工具清单发给模型，照模型写的去读文件、跑测试、改代码，再把结果交回', '<b>Harness</b>: the program around the model'), 1230, 548);
  css(gH, { width: '620px' }); gH.dataset.gloss = 'Harness';
  wipe(gH, Tend('o5') - 0.6, { dir: 'l', d: 0.5 });

  const fy = 690;
  const f1 = txt(g2, 'paper', 'Model', 380, fy); css(f1, { font: '900 88px Inter' });
  const f2 = txt(g2, 'dim', '+', 680, fy); css(f2, { font: '900 88px Inter' });
  const f3 = txt(g2, 'paper', 'Harness', 770, fy); css(f3, { font: '900 88px Inter' });
  const f4 = txt(g2, 'dim', '=', 1150, fy); css(f4, { font: '900 88px Inter' });
  const f5 = txt(g2, 'ink bg-ac', 'Agent', 1250, fy); css(f5, { font: '900 88px Inter', padding: '0 24px' });
  const tf = T('o6', 'Model');
  slide(f1, tf - 0.1, { y: 40, d: 0.4 }); slide(f2, T('o6', 'Harness') - 0.25, { y: 40, d: 0.3 });
  slide(f3, T('o6', 'Harness') - 0.1, { y: 40, d: 0.4 }); slide(f4, T('o6', 'Agent') - 0.3, { y: 40, d: 0.3 });
  slam(f5, Q(T('o6', 'Agent')), { from: 1.3, d: 0.4 }); sfx('thud', Q(T('o6', 'Agent')));
  const gA = txt(g2, 'gloss', tr('<b>Agent</b>：模型加上替它动手的程序，能自己把一件事做完　· 公式出自 LangChain', '<b>Agent</b>: model plus the program that acts for it · formula from LangChain'), 380, 820);
  gA.dataset.gloss = 'Agent';
  wipe(gA, Q(T('o6', 'Agent')) - 0.2, { dir: 'l', d: 0.5 });
});
