// 结尾（84.1–93.0 秒）：回到 Token 列与开场的光标：先读完整个输入，之后才一个接一个地写。规格：第 3.7 节。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tE1 = T('e1', '慢');
  const tE2 = T('e2', '之后');
  const tRead = T('e1', '读完');             // 输入块同时亮起（呼应 prefill：先读完整个输入）
  // 括号随时间画出来：横线从左向右长，右端的竖线在画满时才出现
  const growBrace = (b, t0, t1) => { appear(b, t0); fromTo(b.firstChild, t0, { width: '0%' }, { width: '100%', duration: t1 - t0, ease: 'none' }); appear(b.children[2], t1); };
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };

  // 「首 Token 延迟」砸入
  const big = txt(world, '', '首 Token 延迟', 240, 200);
  css(big, { font: '900 150px "Inter", "Sans SC"', color: PALETTE.ac, lineHeight: '1', whiteSpace: 'nowrap' });
  slam(big, c0, { from: 1.2, d: 0.5 }); sfx('thud', c0, { g: 0.9 });

  // 输入（纸色）与琥珀括号；光标在第一个输出位闪，直到第一块出现
  IN_TOKENS.forEach((t, i) => {
    const e = tokenCol(world, t, COLX(i), 440, 'out');
    wipe(e, c0 + 0.2 + i * 0.08, { dir: 'l', d: 0.4 });
    F((tt) => { e.style.background = tt < tRead ? PALETTE.dim : ''; });        // 先是 dim（还没读完），读完那一帧同时变纸色
    fromToLate(e, tRead, { top: 440 }, { top: 432, duration: 0.3, ease: 'power2.out' });
  });
  sfx('whoosh', tRead, { g: 0.4 });
  const brA = brace(world, 'ac', COLX(0), COLX(6), 380, 1); growBrace(brA, c0 + 0.2, tE2);       // 等待有多久，括号就画多久，第一块落下时合拢
  blinkCaret(blk(world, 'caret', COLX(6) + 20, 440, 40, 104), c0 + 0.4, tE2);

  // 尚未写出的块（ink2）：is_、prime、(；在第一块之后依次变亮
  ['is_', 'prime', '('].forEach((t, i) => {
    const e = tokenCol(world, t, COLX(7 + i), 440, 'rest', true);
    appear(e, c0 + 0.5);
    classWindow(e, 'rest', c0 + 0.5, tE2 + 0.3 + i * 0.3);
  });
  // 第一块 def（琥珀）
  appear(tokenCol(world, 'def', COLX(6), 440, 'first', true), tE2);
  sfx('chime', tE2, { g: 0.6 });

  // 括号与标题：先读完整个输入（输入下方）
  const brB = brace(world, 'pp', COLX(0), COLX(5) + 140, 600, -1); growBrace(brB, tE1, tRead);   // 随「先读完整个输入」画出，读完时合拢
  wipe(lab('tag pp', '先读完整个输入', 240, 630, 44), tE1 + 0.3, { dir: 'l', d: 0.4 });

  // 之后接着写的代码（与定义一场的第一排连续）：n ): for i in range，每 0.6 秒一块
  let xx = COLX(0);
  ['n', '):', 'for', 'i', 'in', 'range'].forEach((t, k) => {
    const [e, w] = codeTok(world, t, xx, 700, 104, 'out');
    const tb = tE2 + 1.2 + k * 0.6;
    appear(e, tb); sfx('tick', tb, { g: 0.5 });
    xx += w + 10;
  });
});
