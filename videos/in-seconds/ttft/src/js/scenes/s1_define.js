// 定义（14.4–31.2 秒）：代码 Token 块原地换排法（Token 注解 → 「发出请求」到「第一段」的括号 → 首 Token 延迟）→ TTFT 四个字母展开成 Time To First Token。规格：第 3.2 节。
scene('define', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const d1 = T('d1');
  const tTok = T('d1', '叫一个') - 0.1;   // 注解与示意括号在说「叫一个」时出现，早于术语「托肯」约 0.9 秒，让注解读得完
  const tA = T('d2') + 0.3;   // 排法切换推迟到第一段开始后，注解读满约 1.9 秒
  const tSend = T('d2', '发出');
  const tFirst = T('d2', '第一段');
  const tBig = T('d3', '时间');
  const tS = T('d3', '缩写');
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };

  // 提问（上方）：排法切换时淡出
  const qTag = lab('tag', '提问', 120, 190);
  const qTxt = lab('t-4', '写一个判断质数的 Python 函数', 230, 186);
  appear(qTag, c0 + 0.1); wipe(qTxt, c0, { dir: 'l', d: 0.5 });
  fadeOut(qTag, tA); fadeOut(qTxt, tA);

  // 两排代码 Token（y420、y570），每 0.3 秒一块，依次出现
  const ROW1 = [['def', 120], ['is_', 287], ['prime', 454], ['(', 688], ['n', 788], ['):', 888]];
  const ROW2 = [['for', 120], ['i', 287], ['in', 387], ['range', 520], ['(2,', 754], ['n', 921], ['):', 1021]];
  const r1 = [], r2 = [];
  ROW1.forEach(([text, x], i) => {
    const tb = d1 + 0.2 + i * 0.3;
    const [e, w] = codeTok(world, text, x, 420, 112, 'out');
    appear(e, tb); sfx('tick', tb, { g: 0.5 });
    r1.push({ e, w, x });
  });
  ROW2.forEach(([text, x], j) => {
    const tb = d1 + 0.2 + (ROW1.length + j) * 0.3;
    const [e, w] = codeTok(world, text, x, 570, 112, 'out');
    appear(e, tb); sfx('tick', tb, { g: 0.5 });
    r2.push({ e, w, x });
  });

  // 「prime」上方的括号与 Token 注解；其余第一排块在注解出现时退淡到 55%（prime 保持不变）
  const pr = r1[2];
  const bTok = brace(world, 'pp', pr.x, pr.x + pr.w, 380, 1); wipe(bTok, tTok, { dir: 'l', d: 0.4 });
  const gl = txt(world, 'gloss', '<b>Token</b>：模型输出文字时的一小段', pr.x - 40, 300);
  css(gl, { fontSize: '44px', whiteSpace: 'nowrap' }); gl.dataset.gloss = 'Token';
  wipe(gl, tTok - 0.2, { dir: 'l', d: 0.4 });
  const eg = lab('eg', '示意切分', 120, 760);
  appear(eg, tTok);
  r1.forEach((o, i) => { if (i !== 2) fromToLate(o.e, tTok, { opacity: 1 }, { opacity: 0.55, duration: 0.4 }); });
  fadeOut(bTok, tA); fadeOut(gl, tA); fadeOut(eg, tA);
  r2.forEach((o) => fadeOut(o.e, tA));

  // 排法切换：第一排滑到 x880、y529；def 变琥珀，其余变 rest（还没写出的样子）；不透明度恢复
  let xs = 880;
  r1.forEach((o, i) => {
    move(o.e, tA, o.x, 420, xs, 529, 0.9, 'power3.inOut');
    fromToLate(o.e, tA, { opacity: i === 2 ? 1 : 0.55 }, { opacity: 1, duration: 0.4 });
    if (i === 0) classWindow(o.e, 'first', tA + 0.45);
    else classWindow(o.e, 'rest', tA + 0.45);
    xs += o.w + 10;
  });

  // 「发出请求」竖线与标签；光标在括号里闪到结束
  const mark = h('div', 'mark', world); px(mark, 237, 480, 6, 190); wipe(mark, tSend, { dir: 't', d: 0.4 });
  const sendLab = lab('tag pp', '发出请求', 240, 680); css(sendLab, { transform: 'translateX(-50%)' }); wipe(sendLab, tSend, { dir: 'l', d: 0.4 });   // 以竖线（x237–243）为中心
  blinkCaret(blk(world, 'caret', 290, 535, 40, 84), tSend);
  // 琥珀括号：从发出请求到第一段（x240→880）；标签「第一段」与注解
  const bAc = brace(world, 'ac', 240, 880, 490, 1); wipe(bAc, tFirst - 0.4, { dir: 'l', d: 0.8 });
  wipe(lab('tag ac', '第一段', 880, 645), tFirst, { dir: 'l', d: 0.4 });
  wipe(lab('tag', '一次送来的数据块，可含不止一个 Token', 880, 688), tFirst + 0.4, { dir: 'l', d: 0.4 });

  // 「首 Token 延迟」砸入（配 thud）；TTFT 四个字母逐个出现，0.9 秒后展开成全称
  // 时间带（琥珀）：这段时间从发出请求起逐步填满，直到「缩写」之前；它也让静止段里有可见的变化
  const band = h('div', 'abs', world); px(band, 240, 446, 0, 34); css(band, { background: PALETTE.ac });
  fromTo(band, tBig, { width: 0 }, { width: 640, duration: (tS - 0.2) - tBig, ease: 'none' });
  const big = txt(world, '', '首 Token 延迟', 240, 300);
  css(big, { font: '900 110px "Inter", "Sans SC"', color: PALETTE.ac, lineHeight: '1', whiteSpace: 'nowrap' });
  big.dataset.gloss = '首 Token 延迟';
  slam(big, tBig, { from: 1.25, d: 0.4 }); sfx('thud', tBig, { g: 0.9 });
  const tt = ttftLine(world, 240, 170, 96);
  appear(tt.box, tS - 0.05);
  tt.letters.forEach((e, i) => { appear(e, tS + i * 0.15); sfx('tick', tS + i * 0.15, { g: 0.6 }); });
  const t1 = tS + 1.6;
  F((t) => tt.setK(ease.out3(clamp((t - t1) / 2.0))));
  sfx('whoosh', t1, { g: 0.4 });
});
