// 机制一（31.2–40.8 秒）：一排 Token 列，每次只写一个；新块落下时，一个括号罩住前面所有的块。规格：第 3.3 节。
scene('write', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tOut = T('w1', '只能') - 0.3;
  const tNew = T('w2') - 0.2;
  const tN = T('w2', '参考');
  appear(txt(world, 'tag', '提问', COLX(0), 350), c0);
  appear(txt(world, 'tag', '回答', COLX(6), 350), c0);
  IN_TOKENS.forEach((t, i) => { wipe(tokenCol(world, t, COLX(i), ROWY, 'in'), c0 + 0.1 + i * 0.1, { dir: 'l', d: 0.4 }); });
  ['def', 'is_', 'prime'].forEach((t, i) => {
    const tb = tOut + i * 0.3;
    appear(tokenCol(world, t, COLX(6 + i), ROWY, 'out', true), tb); sfx('tick', tb, { g: 0.6 });
  });
  const nw = tokenCol(world, '(', COLX(9), ROWY, 'out', true);
  appear(nw, tNew); classWindow(nw, 'rest', tNew, tNew + 0.4); sfx('pop', tNew, { g: 0.7 });
  wipe(txt(world, 'tag pp', '正在写', COLX(9), 350), tNew, { dir: 'l', d: 0.3 });
  blinkCaret(blk(world, 'caret', COLX(9) + 152, ROWY, 40, 104), tNew + 0.2);
  const bp = brace(world, 'pp', COLX(0), COLX(9) - 20, 560, -1);
  const tB0 = tN - 1.4;
  appear(bp, tB0);
  const bpBar = bp.firstChild; css(bpBar, { top: '-6px', height: '18px' });
  fromTo(bpBar, tB0, { width: '0%' }, { width: '100%', duration: (Tend('w2') - 0.1) - tB0, ease: 'none' });
  // 标签居中于括号（x240→1624）的中点
  const lab = txt(world, 'tag pp', '前面所有的 Token', 932, 590); css(lab, { fontSize: '44px', transform: 'translateX(-50%)' }); wipe(lab, tN + 0.5, { dir: 'l', d: 0.4 });
  const conn = blk(world, 'bg-paper', COLX(9) - 26, 557, 96, 6); wipe(conn, tN + 0.5, { dir: 'l', d: 0.3 });
  const [al, ah] = arrowUp(world, COLX(9) + 70, 524, 560);
  appear(al, tN + 0.5); appear(ah, tN + 0.5);
  appear(txt(world, 'eg', '示意切分', 240, 700), c0 + 0.2);
});
