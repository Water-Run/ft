// 开场（0–14.4 秒）：对话面板里的光标与示例读数 → 第一个 Token 出现 → 琥珀满铺的片名卡（停留时整张卡极慢地推近一次）。规格：src/design/scenes.md 第 3.1 节。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const k = CLK();                                    // k.ts：读数开始走；k.tf：第一个 Token（def）到达
  const tPrompt = T('o1', '提问');                     // 提问块从右滑入
  const tCard = T('o3', '等待') - 0.2;                // 片名卡从左刷入

  // 对话面板（左）。子元素用面板内坐标，随面板一起刷入
  const panel = h('div', 'node', world); px(panel, 120, 160, 900, 770);
  wipe(panel, s.start, { dir: 'l', d: 0.5 });          // 从第 0 秒起就开始刷入：成片 0–0.3 秒不能是空画面（finish.js 的空画面检查，占比低于 0.6% 持续 0.3 秒报错）
  const q1 = h('div', 'bg-paper', panel, '写一个判断质数的 Python 函数');
  px(q1, 100, 40, 760, 120);
  css(q1, { display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 44px "Sans SC"' });
  slide(q1, tPrompt, { x: 120, d: 0.45 }); sfx('pop', tPrompt, { g: 0.7 });
  appear(txt(panel, 'tag', '回答', 40, 250), s.start + 0.1);
  blinkCaret(blk(panel, 'caret', 40, 310, 40, 84), c0 + 0.3, k.tf);
  const inp = blk(panel, '', 40, 630, 820, 96);
  css(inp, { background: PALETTE.ink, color: PALETTE.dim, font: '500 38px/96px "Sans SC"', paddingLeft: '30px' });
  inp.textContent = '输入消息';

  // 示例读数（与右上角读数同一时钟 METER(t)）；第一个 Token 到达时反白 0.3 秒
  const tm = txt(world, 'tm', '0.00', 1040, 330);
  appear(tm, s.start);                                  // 大读数第 0 秒就在场
  F((t) => { if (t >= c0) tm.textContent = METER(t).toFixed(2); });
  classWindow(tm, 'inv', k.tf, k.tf + 0.3);
  appear(txt(world, 'eg', '示例', 1040, 230), s.start);
  const unit = txt(world, 'tag', '秒', 1050, 660); css(unit, { font: '700 60px "Sans SC"' }); appear(unit, s.start);

  // 第一个 Token（def，琥珀）出现在光标的位置；其后每 0.3 秒一个，新块先是「未完成」的 ink2，0.15 秒后变纸色
  const toks = [['def', 40, 310, 'first'], ['is_', 207, 310, 'out'], ['prime', 374, 310, 'out'], ['(', 608, 310, 'out'], ['n', 40, 420, 'out'], ['):', 140, 420, 'out']];
  toks.forEach(([text, x, y, kind], i) => {
    const tb = k.tf + i * 0.3;
    const [e] = codeTok(panel, text, x, y, 104, kind);
    appear(e, tb); sfx('tick', tb, { g: 0.6 });
    if (i > 0) classWindow(e, 'rest', tb, tb + 0.15);
  });
  sfx('chime', k.tf, { g: 0.6 });

  // 片名卡：琥珀满铺。刷入后 TTFT 砸入，「首 Token 延迟」滑入，注解刷入；之后整张卡极慢地推近 3%，直到下一场刷入
  const card = blk(root, 'bg-ac', 0, 0, 1920, VH);
  css(card, { transformOrigin: '50% 50%' });
  wipe(card, tCard, { dir: 'l', d: 0.6 }); sfx('whoosh', tCard, { g: 0.7 });
  set(world, tCard + 0.6, { autoAlpha: 0 });   // 卡片已完全盖住之后，底层的对话与读数隐藏
  txt(card, 't-2 ink', '96 秒了解', 120, 150);
  const big = txt(card, 't-0 ink', 'TTFT', 110, 250);   // 与「96 秒了解」「首 Token 延迟」的字形左缘对齐（大字的左侧留白约 14 像素）
  const zh = txt(card, 't-2 ink', '首 Token 延迟', 120, 770);
  const gl = txt(card, 't-b ink', 'Time To First Token：回答开始出现之前的等待时长', 120, 886);
  gl.dataset.gloss = 'TTFT';
  slam(big, tCard + 0.5, { from: 1.2, d: 0.4 }); sfx('thud', tCard + 0.5, { g: 0.9 });
  slide(zh, tCard + 0.9, { y: 40, d: 0.5 });
  wipe(gl, tCard + 1.3, { dir: 'l', d: 0.5 });
  const zs = tCard + 1.8;
  fromTo(card, zs, { scale: 1 }, { scale: 1.03, duration: s.end - zs - 0.2, ease: 'none' });
  // 常驻元素（左上秒数、右上读数）压在琥珀上时改墨色；右侧晚于左侧退出琥珀
  hudGround('L', tCard, s.end + 0.2, 'ac'); hudGround('R', tCard, s.end + 0.45, 'ac');
});
