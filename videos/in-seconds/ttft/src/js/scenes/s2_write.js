// 机制一（31.2–40.8 秒）：一排 Token 列，每次只写一个（光标一格一格往后跳）；新块落下后，括号从左向右扫过前面所有的块，扫到哪个块、哪个块就弹一下。规格：第 3.3 节。
scene('write', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tOut = T('w1', '每次') + 0.1;        // 三个输出块一个一个写出来：「每次只能写一个」，每 0.6 秒一块
  const tNew = T('w2', '一个');              // 第四块在「每一个新 Token」说到时落下
  const tRef = T('w2', '都要');              // 括号从「都要参考」开始扫过前面所有的块
  const tPrev = T('w2', '前面');             // 「前面所有的 Token」标签与指向新块的箭头
  const tEndB = Tend('w2') - 0.15;
  appear(txt(world, 'tag', '提问', COLX(0), 350), c0);
  appear(txt(world, 'tag', '回答', COLX(6), 350), c0);
  const toks = [];                           // 括号要扫过的块：六个输入块 + 三个已写出的输出块
  IN_TOKENS.forEach((t, i) => {
    const e = tokenCol(world, t, COLX(i), ROWY, 'in');
    wipe(e, c0 + 0.1 + i * 0.1, { dir: 'l', d: 0.4 }); toks.push(e);
  });
  const written = [];                        // 每个输出块落下的时刻（光标据此往后跳）
  ['def', 'is_', 'prime'].forEach((t, i) => {
    const tb = tOut + i * 0.6;
    const e = tokenCol(world, t, COLX(6 + i), ROWY, 'out', true);
    rise(e, tb, { dy: 26, d: 0.3 }); sfx('tick', tb, { g: 0.6 });
    toks.push(e); written.push(tb);
  });
  const nw = tokenCol(world, '(', COLX(9), ROWY, 'out', true);
  rise(nw, tNew, { dy: 26, d: 0.3 }); classWindow(nw, 'rest', tNew, tNew + 0.4); sfx('pop', tNew, { g: 0.7 });
  written.push(tNew);
  wipe(txt(world, 'tag pp', '正在写', COLX(9), 350), tNew, { dir: 'l', d: 0.3 });
  // 光标：永远停在下一个空位上，写出一个就往后跳一格（由 t 算位置，不累加状态）
  const caret = blk(world, 'caret', COLX(6) - 4, ROWY, 40, 104);
  F((t) => {
    const n = written.filter((x) => x <= t + 1e-6).length;
    caret.style.left = (COLX(6 + n) - 4) + 'px';
    caret.style.opacity = (t >= c0 + 0.3 && Math.floor(t / BEAT + 1e-6) % 2 === 0) ? '1' : '0';
  });
  // 括号（向上的竖线）：罩住前面所有的块，宽度随「参考」线性增长
  const xL = COLX(0), xR = COLX(9) - 20;
  const bp = brace(world, 'pp', xL, xR, 560, -1);
  appear(bp, tRef);
  const bpBar = bp.firstChild; css(bpBar, { top: '-6px', height: '18px' });
  fromTo(bpBar, tRef, { width: '0%' }, { width: '100%', duration: tEndB - tRef, ease: 'none' });
  toks.forEach((e, j) => { pulse(e, tRef + ((COLX(j) + 70 - xL) / (xR - xL)) * (tEndB - tRef), { k: 1.1 }); });
  // 标签居中于括号（x240→1624）的中点
  const lab = txt(world, 'tag pp', '前面所有的 Token', 932, 590); css(lab, { fontSize: '44px', transform: 'translateX(-50%)' }); wipe(lab, tPrev, { dir: 'l', d: 0.4 });
  const conn = blk(world, 'bg-paper', COLX(9) - 26, 557, 96, 6); wipe(conn, tPrev, { dir: 'l', d: 0.3 });
  const [al, ah] = arrowUp(world, COLX(9) + 70, 524, 560);
  appear(al, tPrev); appear(ah, tPrev);
  // 扫完之后：前面所有的块与新块一起弹一下（「所有」都参与了），箭头随之一闪；然后停留
  const tAll = Tend('w2') + 0.35;
  toks.forEach((e) => pulse(e, tAll, { k: 1.08 }));
  pulse(nw, tAll, { k: 1.08 }); sfx('pop', tAll, { g: 0.5 });
  appear(txt(world, 'eg', '示意切分', 240, 700), c0 + 0.2);
});
