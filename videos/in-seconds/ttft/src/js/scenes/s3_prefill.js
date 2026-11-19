// 机制二（40.8–62.4 秒）：先读完整个输入（同时处理，中间结果存进缓存），之后每个新 Token 只多一格；再换到「重复提问」：开头相同的部分接上上次已存的缓存，命中。规格：第 3.4 节。
// 2026-11-19 r2：琥珀括号随等待逐步画满（第一块落下时合拢）；第一块之后几块连续冒出，每块伴一次「读缓存」的涟漪；
// 重复提问：第一次与再次的括号按同一速度画，一长一短；前四块用连线接到已存的缓存格，命中那一帧同时变亮；只读新增的两块。
scene('prefill', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tR1 = T('r1', '读完') - 0.1;           // 输入块同时亮起
  const tR2 = T('r2', '同时');                 // 缓存格同时升起
  const tR3 = T('r3', '之后');                 // 第一块（琥珀）落下
  const tRA = T('r4', '重复') - 0.3;           // 换到重复提问
  const tRB = tRA + 0.5;                       // 第一次提问一行就位
  const tRS = T('r4', '开头');                 // 再次提问一行出现
  const tRP = T('r4', '相同');                 // 开头相同：连线画出来
  const tRC = T('r4', '命中');                 // 命中缓存
  const tRD = T('r5', '不用');                 // 只读新增的两块
  const tRE = T('r5', '首偷');                 // 第一块落下（等待很短）
  const tRF = T('r5', '更短');
  const SPEED = 520;                           // 括号画出的速度（像素/秒）：第一次与再次共用，长短才可比
  const FILE = ['def', 'if', 'for', 'try'];
  const isCode = (t) => /^[A-Za-z(]/.test(t);
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };
  const bigLab = (x, y, size) => { const e = txt(world, '', '首 Token 延迟', x, y); css(e, { font: '900 ' + size + 'px "Inter", "Sans SC"', color: PALETTE.ac, lineHeight: '1', whiteSpace: 'nowrap' }); return e; };
  // 括号随时间画出来：横线从左向右长（宽度补间），右端的竖线在画满时才出现
  const growBrace = (b, t0, t1) => { appear(b, t0); fromTo(b.firstChild, t0, { width: '0%' }, { width: '100%', duration: t1 - t0, ease: 'none' }); appear(b.children[2], t1); };

  // ── 一、读完输入、存进缓存、第一块落下 ──
  const lab0 = bigLab(COLX(0), 262, 56); wipe(lab0, c0, { dir: 'l', d: 0.5 });
  const br0 = brace(world, 'ac', COLX(0), COLX(6), 350, 1);
  growBrace(br0, c0 + 0.3, tR3);               // 等待有多久，括号就画多久，第一块落下时合拢

  // 输入块：先是 dim（还没读），tR1 同时变纸色（同时处理）
  const inEls = IN_TOKENS.map((t, i) => {
    const e = tokenCol(world, t, COLX(i), ROWY, 'out');
    rise(e, c0 + 0.1 + i * 0.08, { dy: 20 });
    F((tt) => { e.style.background = tt < tR1 ? PALETTE.dim : ''; });
    fromToLate(e, tR1, { top: ROWY }, { top: ROWY - 8, duration: 0.3, ease: 'power2.out' });
    return e;
  });
  // 每个输入块下的缓存格：tR2 同一帧从下方升起
  const inCells = IN_TOKENS.map((t, i) => {
    const c = cacheCell(world, COLX(i), 540, 'pp');
    fromTo(c, tR2, { top: 560, autoAlpha: 0 }, { top: 540, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
    return c;
  });
  const note = lab('gloss', '<b>缓存</b>：每个 Token 的中间结果。输入的 Token 同时处理，一次存满', COLX(0), 618, 34);
  css(note, { whiteSpace: 'nowrap' }); note.dataset.gloss = '缓存';
  wipe(note, tR2 - 0.5, { dir: 'l', d: 2.0, ease: 'none' });      // 2 秒刷满（旁白说到「存进缓存」前就读得到），之后留足阅读时间
  sfx('pop', tR2, { g: 0.7 });
  // 第一个输出位是一块纸色的「正在写」块，每拍亮灭一次，直到第一个 Token 出现（tR3）
  blinkCaret(blk(world, 'bg-paper', COLX(6), ROWY, 140, 104), c0 + 0.4, tR3);

  // 第一块 def（琥珀）落到 x1176，之后 is_、prime、( 每 0.25 秒冒出一块，各多一格缓存（落得很快：这就是「续一小步」）
  const OUTS = [['def', 'first'], ['is_', 'out'], ['prime', 'out'], ['(', 'out']];
  const outEls = [], outCells = [], burst = [];
  OUTS.forEach(([t, kind], i) => {
    const x = COLX(6 + i), tb = tR3 + (i === 0 ? 0 : 0.1 + i * 0.25);
    const e = tokenCol(world, t, x, ROWY, kind, true);
    fromTo(e, tb, { top: ROWY - 40, autoAlpha: 0 }, { top: ROWY, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    const c = cacheCell(world, x, 540, kind === 'first' ? 'ac' : 'pp');
    fromTo(c, tb, { top: 500, autoAlpha: 0 }, { top: 540, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    sfx('tick', tb, { g: 0.6 });
    outEls.push(e); outCells.push(c); if (i > 0) burst.push(tb);
  });
  sfx('chime', tR3, { g: 0.6 });
  // 每冒出一块，已有的缓存格从左到右各「读」一下（短暂变暗），再多出新的一格
  const cells = inCells.concat(outCells), bases = cells.map((c, i) => (i === 6 ? PALETTE.ac : PALETTE.paper));
  F((tt) => {
    cells.forEach((c, i) => {
      let hot = false;
      for (const ts of burst) { const a = ts + 0.02 * i; if (tt >= a && tt < a + 0.12) hot = true; }
      c.style.background = hot ? PALETTE.dim : bases[i];
    });
  });
  // 注解：之后每个新 Token 只多一格；数据行只在画面上，旁白不讲
  const n1 = lab('gloss', '之后每个新 Token 只多一格', COLX(6), 690, 34); css(n1, { whiteSpace: 'nowrap' });
  wipe(n1, tR3 + 0.5, { dir: 'l', d: 0.4 });
  const n2 = txt(world, '', '相邻 Token 的间隔：交互场景的目标 10–50 毫秒', 240, 760);
  css(n2, { font: '700 44px "Sans SC"', color: PALETTE.paper, whiteSpace: 'nowrap' });
  rise(n2, tR3 - 0.4, { dy: 22, d: 0.4 });          // 第一块落下之前就出现：这行字多，要读得完（旁白不讲，只在画面上）
  // 「一小步」：最新的一格缓存下面一个小括号，与上面长长的琥珀括号对照；这一格弹一下
  const tStep = tR3 + 0.9;                       // 最新一格（第四块）落下之后就出现，跟着缓存格一起收走：留给它的时间够读，也不会剩下一个指着空处的括号
  const brS = brace(world, 'pp', COLX(9), COLX(9) + 140, 612, -1); wipe(brS, tStep, { dir: 'l', d: 0.3 });
  const lbS = lab('tag pp', '一小步', COLX(9), 626, 38); wipe(lbS, tStep + 0.1, { dir: 'l', d: 0.3 });
  pulse(outCells[3], tStep, { k: 1.15 }); sfx('pop', tStep, { g: 0.5 });

  // ── 二、换到「重复提问」（tRA 起）：第一排与缓存格一起上移（缓存带过去），旧内容退淡 ──
  inEls.forEach((e) => fromToLate(e, tRA, { top: ROWY - 8, autoAlpha: 1 }, { top: 290, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }));
  outEls.forEach((e) => fromToLate(e, tRA, { top: ROWY, autoAlpha: 1 }, { top: 290, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }));
  inCells.forEach((c) => fromToLate(c, tRA, { top: 540 }, { top: 410, duration: 0.9, ease: 'power3.inOut' }));
  outCells.forEach((c) => fadeOut(c, tRA, 0.5));
  // 标题与括号随换幕收走；下面几行注解再留约 1 秒，到再次提问的第二行（y600）出现之前才淡出（F04：这些字多，需要读得完）
  fadeOut(lab0, tRA); fadeOut(br0, tRA);
  const tOld = tRS - 0.5;
  [note, n1, n2].forEach((e) => fadeOut(e, tOld));
  fadeOut(brS, tRA); fadeOut(lbS, tRA);          // 「一小步」跟着缓存格一起收走

  // 第一次提问（tRB）：代码文件四块、怎么、改（纸色，缓存格已在 y410）；括号按 SPEED 慢慢画，画满时琥珀 def 落下
  const first = FILE.map((t, i) => [t, COLX(i)]).concat([['怎么', COLX(4)], ['改', COLX(5)]]);
  first.forEach(([t, x], i) => {
    const e = tokenCol(world, t, x, 290, 'out', isCode(t));
    fromTo(e, tRB + i * 0.04, { top: 330, autoAlpha: 0 }, { top: 290, autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
  });
  const tG = tRB + (COLX(6) - COLX(0)) / SPEED;
  const brA = brace(world, 'ac', COLX(0), COLX(6), 262, 1); growBrace(brA, tRB, tG);
  wipe(lab('tag pp', '第一次提问', COLX(0), 200, 38), tRB, { dir: 'l', d: 0.4 });
  const lbA = bigLab(708, 192, 48); css(lbA, { transform: 'translateX(-50%)' }); wipe(lbA, tRB + 0.2, { dir: 'l', d: 0.4 });   // 居中于括号（x240→1176）
  blinkCaret(blk(world, 'bg-paper', COLX(6), 290, 140, 104), tRB + 0.3, tG);
  const dfA = tokenCol(world, 'def', COLX(6), 290, 'first', true);
  fromTo(dfA, tG, { top: 250, autoAlpha: 0 }, { top: 290, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
  const cA = cacheCell(world, COLX(6), 410, 'ac');
  fromTo(cA, tG, { top: 380, autoAlpha: 0 }, { top: 410, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
  sfx('chime', tG, { g: 0.5 });

  // ── 三、再次提问（tRS 起）：一行新的（y600）。前四块是刚送来的输入（dim），命中缓存那一帧同时变纸色 ──
  const ROW2 = 600;
  FILE.forEach((t, i) => {
    const e = tokenCol(world, t, COLX(i), ROW2, 'out', true);
    rise(e, tRS + i * 0.1, { dy: 22 });
    F((tt) => { e.style.background = tt < tRC ? PALETTE.dim : ''; });
    // 连线：从第一次提问已存的缓存格（y462 下沿）接到这一块；先是 dim（开头相同），命中那一帧变纸色并弹一下
    const l = h('div', 'abs', world); px(l, COLX(i) + 67, 464, 6, 134);
    wipe(l, tRP, { dir: 't', d: 0.25 });
    F((tt) => { l.style.background = tt < tRC ? PALETTE.dim : PALETTE.paper; });
    pulse(l, tRC, { prop: 'scaleX', k: 2.4 });
  });
  sfx('pop', tRP, { g: 0.5 }); sfx('pop', tRC, { g: 0.8 });
  // 标签「再次提问：命中缓存」放在没有缓存格的那一段下面（缓存在上面，是第一次提问的）：先出前半「再次提问：」，命中时补全
  const lb2 = lab('tag pp', '再次提问：命中缓存', COLX(0), 724, 38);
  tl.fromTo(lb2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, tRS);
  tl.fromTo(lb2, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 44% 0% 0%)', duration: 0.35, ease: 'power3.out', immediateRender: true }, tRS);
  tl.fromTo(lb2, { clipPath: 'inset(0% 44% 0% 0%)' }, { clipPath: 'inset(-30% -2% -30% -2%)', duration: 0.35, ease: 'power3.inOut', immediateRender: false }, tRC);
  const note2 = lab('gloss', '<b>已缓存</b>：这一段不必重新读，只读新增的部分', COLX(0), 790, 34);
  css(note2, { whiteSpace: 'nowrap' }); wipe(note2, tRC + 0.3, { dir: 'l', d: 0.4 });

  // 只读新增的两块（tRD 起）：先是 dim，括号只画这一小段（同样的速度，很快画满），读完变纸色、缓存格升起，然后第一块落下
  const tRG = tRE - 0.2;
  ['怎么', '测'].forEach((t, i) => {
    const e = tokenCol(world, t, COLX(4 + i), ROW2, 'out');
    fromTo(e, tRD + i * 0.12, { top: ROW2 - 26, autoAlpha: 0 }, { top: ROW2, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    F((tt) => { e.style.background = tt < tRG ? PALETTE.dim : ''; });
    const c = cacheCell(world, COLX(4 + i), 720, 'pp');
    fromTo(c, tRG, { top: 744, autoAlpha: 0 }, { top: 720, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
  });
  const tB0 = tRE - (COLX(6) - COLX(4)) / SPEED;
  const brB = brace(world, 'ac', COLX(4), COLX(6), 572, 1); growBrace(brB, tB0, tRE);
  const lbB = bigLab(COLX(4), 502, 48); wipe(lbB, tRD + 0.2, { dir: 'l', d: 0.4 });
  blinkCaret(blk(world, 'bg-paper', COLX(6), ROW2, 140, 104), tRD + 0.4, tRE);   // 与第一排一致：纸色的「正在写」块
  appear(lab('tag', '命中要求开头完全一致；官方文档称首 Token 延迟通常改善，不保证（Anthropic、OpenAI）', 240, 850, 28), tRC + 0.3);   // 随「命中」出现：这行字多，要读得完

  // 第一块（tRE）落下：琥珀 def、琥珀缓存格；随后 is_、prime、( 连续冒出
  let defB = null;
  [['def', 'first'], ['is_', 'out'], ['prime', 'out'], ['(', 'out']].forEach(([t, kind], i) => {
    const tb = tRE + (i === 0 ? 0 : 0.1 + i * 0.25), x = COLX(6 + i);
    const e = tokenCol(world, t, x, ROW2, kind, true);
    if (i === 0) defB = e;
    fromTo(e, tb, { top: ROW2 - 36, autoAlpha: 0 }, { top: ROW2, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    const c = cacheCell(world, x, 720, kind === 'first' ? 'ac' : 'pp');
    fromTo(c, tb, { top: 744, autoAlpha: 0 }, { top: 720, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    sfx(i === 0 ? 'chime' : 'tick', tb, { g: i === 0 ? 0.6 : 0.5 });
  });
  // 「更短」：短括号与它的标签弹一下，与上面第一次提问的长括号对照
  pulse(brB.firstChild, tRF, { prop: 'scaleY', k: 2.2, origin: '0% 50%' });
  pulse(lbB, tRF, { k: 1.08, origin: '0% 50%' });
  // 之后光标停在下一个空位上闪，到场景末
  blinkCaret(blk(world, 'caret', COLX(10) - 4, ROW2, 40, 104), tRE + 1.3);
  // 旁白说完后的静默尾段：两次提问「同时开始计时」做一次对照：同一速度，再次提问的先画满（琥珀 def 弹一下），第一次提问的后画满
  const tCmp = Tend('r5') + 0.1, dA = (COLX(6) - COLX(0)) / SPEED, dB = (COLX(6) - COLX(4)) / SPEED;
  const bandA = blk(world, 'bg-ac', COLX(0), 268, 0, 16), bandB = blk(world, 'bg-ac', COLX(4), 578, 0, 16);
  fromTo(bandA, tCmp, { width: 0 }, { width: COLX(6) - COLX(0), duration: dA, ease: 'none' });
  fromTo(bandB, tCmp, { width: 0 }, { width: COLX(6) - COLX(4), duration: dB, ease: 'none' });
  pulse(defB, tCmp + dB, { k: 1.14 }); sfx('chime', tCmp + dB, { g: 0.4 });
  pulse(dfA, tCmp + dA, { k: 1.14 }); sfx('thud', tCmp + dA, { g: 0.4 });
  appear(lab('eg', '对照：同时开始计时', 1348, 326, 30), tCmp - 0.5);
});
