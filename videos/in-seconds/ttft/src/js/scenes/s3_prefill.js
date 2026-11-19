// 机制二（40.8–62.5 秒）：先读完整个输入（同时处理，中间结果存进缓存），之后每个新 Token 只多一格；再换到「重复提问」：开头相同的部分命中缓存。规格：第 3.4 节。
scene('prefill', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tR1 = T('r1', '读完') - 0.1;
  const tR2 = T('r2', '同时');
  const tR3 = T('r3', '之后');
  const tRA = T('r4', '重复') - 0.3;
  const tRB = tRA + 0.5;
  const tRC = T('r4', '命中');
  const tRD = T('r5', '不用');
  const tRE = T('r5', '更短');
  const FILE = ['def', 'if', 'for', 'try'];
  const isCode = (t) => /^[A-Za-z(]/.test(t);
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };
  const bigLab = (x, y, size) => { const e = txt(world, '', '首 Token 延迟', x, y); css(e, { font: '900 ' + size + 'px "Inter", "Sans SC"', color: PALETTE.ac, lineHeight: '1', whiteSpace: 'nowrap' }); return e; };

  // 首排标题与琥珀括号（覆盖六个输入块）
  const lab0 = bigLab(COLX(0), 262, 56); wipe(lab0, c0, { dir: 'l', d: 0.5 });
  const br0 = brace(world, 'ac', COLX(0), COLX(6), 350, 1); wipe(br0, c0, { dir: 'l', d: 0.6 });

  // 输入块：先是 dim（还没读），tR1 同时变纸色（同时处理）
  const inEls = IN_TOKENS.map((t, i) => {
    const e = tokenCol(world, t, COLX(i), ROWY, 'out');
    appear(e, c0 + 0.1 + i * 0.08);
    F((tt) => { e.style.background = tt < tR1 ? PALETTE.dim : ''; });
    fromToLate(e, tR1, { top: ROWY }, { top: ROWY - 8, duration: 0.3, ease: 'power2.out' });
    return e;
  });

  // 每个输入块下的缓存格：tR2 同时从下方升起
  const inCells = IN_TOKENS.map((t, i) => {
    const c = cacheCell(world, COLX(i), 540, 'pp');
    fromTo(c, tR2 - 1.0, { top: 556, autoAlpha: 0 }, { top: 540, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
    return c;
  });
  const note = lab('gloss', '<b>缓存</b>：每个 Token 的中间结果。输入的 Token 同时处理，一次存满', COLX(0), 618, 34);
  css(note, { whiteSpace: 'nowrap' }); note.dataset.gloss = '缓存';
  wipe(note, tR2 - 0.5, { dir: 'l', d: 3.4, ease: 'none' });
  sfx('pop', tR2, { g: 0.7 });
  // 第一个 Token 出现前，光标在第一个输出位闪
  // 第一个输出位是一块纸色的「正在写」块，每拍亮灭一次，直到第一个 Token 出现（tR3）
  blinkCaret(blk(world, 'bg-paper', COLX(6), ROWY, 140, 104), c0 + 0.4, tR3);

  // 第一块 def（琥珀）落到 x1176，下方一格（琥珀）；is_、prime 每 0.3 秒各落一块、各多一格（纸色）
  const outEls = [], outCells = [];
  [['def', 'first'], ['is_', 'out'], ['prime', 'out']].forEach(([t, kind], i) => {
    const x = COLX(6 + i), tb = tR3 + i * 0.3;
    const e = tokenCol(world, t, x, ROWY, kind, true);
    fromTo(e, tb, { top: ROWY - 40, autoAlpha: 0 }, { top: ROWY, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    const c = cacheCell(world, x, 540, kind === 'first' ? 'ac' : 'pp');
    fromTo(c, tb, { top: 500, autoAlpha: 0 }, { top: 540, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    sfx('tick', tb, { g: 0.6 });
    outEls.push(e); outCells.push(c);
  });
  sfx('chime', tR3, { g: 0.6 });
  // 注解：之后每个新 Token 只多一格；数据行只在画面上，旁白不讲
  const n1 = lab('gloss', '之后每个新 Token 只多一格', COLX(6), 690, 34); css(n1, { whiteSpace: 'nowrap' });
  wipe(n1, tR3 + 0.9, { dir: 'l', d: 0.4 });
  const n2 = txt(world, '', '相邻 Token 的间隔：交互场景的目标 10–50 毫秒', 240, 760);
  css(n2, { font: '700 44px "Sans SC"', color: PALETTE.paper, whiteSpace: 'nowrap' });
  wipe(n2, tR3 + 0.2, { dir: 'l', d: 0.5 });
  const n3 = lab('tag', '数据：ClickHouse 指南（2026-07）', 240, 830, 28);
  wipe(n3, tR3 + 1.9, { dir: 'l', d: 0.5 });

  // 换到「重复提问」（tRA 起）：第一排与缓存格一起上移（缓存带过去），旧内容退淡
  inEls.forEach((e) => fromToLate(e, tRA, { top: ROWY - 8, autoAlpha: 1 }, { top: 290, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }));
  outEls.forEach((e) => fromToLate(e, tRA, { top: ROWY, autoAlpha: 1 }, { top: 290, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }));
  inCells.forEach((c) => fromToLate(c, tRA, { top: 540 }, { top: 410, duration: 0.9, ease: 'power3.inOut' }));
  outCells.forEach((c, i) => { if (i === 0) fromToLate(c, tRA, { top: 540 }, { top: 410, duration: 0.9, ease: 'power3.inOut' }); else fadeOut(c, tRA, 0.5); });
  fadeOut(lab0, tRA); fadeOut(br0, tRA); fadeOut(note, tRA); fadeOut(n1, tRA); fadeOut(n2, tRA); fadeOut(n3, tRA);

  // 第一次提问（tRB）：第一排新内容（代码文件四块、怎么、改、琥珀 def），缓存格已在 y410
  const first = FILE.map((t, i) => [t, COLX(i), 'out']).concat([['怎么', COLX(4), 'out'], ['改', COLX(5), 'out'], ['def', COLX(6), 'first']]);
  first.forEach(([t, x, kind], i) => {
    const e = tokenCol(world, t, x, 290, kind, isCode(t));
    fromTo(e, tRB + i * 0.04, { top: 330, autoAlpha: 0 }, { top: 290, autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
  });
  const brA = brace(world, 'ac', COLX(0), COLX(6), 262, 1); wipe(brA, tRB, { dir: 'l', d: 0.5 });
  wipe(lab('tag pp', '第一次提问', COLX(0), 200, 38), tRB, { dir: 'l', d: 0.4 });
  const lbC = bigLab(708, 192, 48); css(lbC, { transform: 'translateX(-50%)' }); wipe(lbC, tRB + 0.2, { dir: 'l', d: 0.4 });   // 居中于第一次提问的括号（x240→1176）中点

  // 再次提问（tRC）：前四块与它们下方的缓存格直接在位（命中缓存，不再从头升起）
  FILE.forEach((t, i) => {
    appear(tokenCol(world, t, COLX(i), 600, 'in', true), tRC - 0.6);
    appear(cacheCell(world, COLX(i), 720, 'pp'), tRC - 0.6);
  });
  wipe(lab('tag pp', '再次提问：命中缓存', COLX(0), 510, 38), tRC, { dir: 'l', d: 0.4 });
  const note2 = lab('gloss', '<b>已缓存</b>：这一段不必重新读，只读新增的部分', COLX(0), 790, 34);
  css(note2, { whiteSpace: 'nowrap' }); wipe(note2, tRC + 0.3, { dir: 'l', d: 0.4 });
  sfx('pop', tRC, { g: 0.7 });

  // 只读新增的两块（tRD）：怎么、测 与各自的缓存格落下；括号只括这一小段
  ['怎么', '测'].forEach((t, i) => {
    const e = tokenCol(world, t, COLX(4 + i), 600, 'out');
    fromTo(e, tRD + i * 0.1, { top: 580, autoAlpha: 0 }, { top: 600, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
    const c = cacheCell(world, COLX(4 + i), 720, 'pp');
    fromTo(c, tRD + i * 0.1, { top: 700, autoAlpha: 0 }, { top: 720, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
  });
  const brB = brace(world, 'ac', COLX(4), COLX(6), 572, 1); wipe(brB, tRD, { dir: 'l', d: 0.5 });
  wipe(bigLab(COLX(4), 502, 48), tRD + 0.2, { dir: 'l', d: 0.4 });
  blinkCaret(blk(world, 'bg-paper', COLX(6), 600, 140, 104), tRD + 0.4, tRE);   // 与第一排一致：纸色的「正在写」块

  // 第一块（tRE）：琥珀 def 落到 x1176，缓存格（琥珀）升起；括号很短（来源行已在 tRD 出现，留足读时）
  const dfB = tokenCol(world, 'def', COLX(6), 600, 'first', true);
  fromTo(dfB, tRE, { top: 580, autoAlpha: 0 }, { top: 600, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
  const cB = cacheCell(world, COLX(6), 720, 'ac');
  fromTo(cB, tRE, { top: 700, autoAlpha: 0 }, { top: 720, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
  sfx('chime', tRE, { g: 0.6 });
  appear(lab('tag', '命中要求开头完全一致；官方文档称首 Token 延迟通常改善，不保证（Anthropic、OpenAI）', 240, 850, 28), tRD);
});
