// 场景 s4：04 读入即替换。
// 站点一（x=0）：expand6.bat —— %n% 在「语句被读入」的那一刻就被换成 1，所以块里输出的是 1。
// 站点二（x=+2400）：delayed.bat —— Windows 2000 加入延迟展开（!n!），默认关闭。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('s4', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点一：expand6.bat 与「读入后的样子」 ══════════
  const sheet = h('div', 'sheet', world); px(sheet, 96, 130, 820);
  h('div', 'name', sheet, 'expand6.bat');
  const code = ['@echo off', 'set n=1', '(', '  set n=2', '  echo <span class="hl">%n%</span>', ')'];
  const ln = code.map((c, i) => { const e = h('div', 'ln', sheet, c); e.dataset.n = i + 1; return e; });
  const spanN = ln[4].querySelector('span');

  // 「读入后的样子」：小一号的纸，%n% 已经变成 1
  const mini = h('div', 'sheet mini', world); px(mini, 950, 250, 260);
  const miniLn = ['(', '  set n=2', '  echo <span class="hl">1</span>', ')'].map((c) => h('div', 'ln', mini, c));
  const miniOne = miniLn[2].querySelector('span');
  const fly = h('div', 'blk', world); px(fly, 0, 0, 30, 44);          // 从 %n% 飞到 1 的那块琥珀

  // 今天的屏幕
  const slab = h('div', 'slab now', world); px(slab, 1240, 130, 584);
  h('div', 'hd', slab, 'Windows 11 · cmd.exe');
  const row = [0, 1].map(() => h('div', 'row', slab));
  row[0].innerHTML = '<span class="in"></span>';
  row[1].innerHTML = '<span class="hi">1</span>';

  // 两个标签与把标签连到「读入后的样子」的折线
  const tagStmt = tagAt(world, 'amber', '一条语句', 560, box(ln[2], world).y + 4);
  const tagN = tagAt(world, 'amber', '读入时 n = 1', 560, box(ln[1], world).y + 4);
  const hx = h('div', 'blk', world); px(hx, 880, box(ln[1], world).y + 22, 74, 8);
  const vx = h('div', 'blk', world); px(vx, 946, box(ln[1], world).y + 22, 8, box(miniOne, world).y + 20 - box(ln[1], world).y - 22);
  const hx2 = h('div', 'blk', world); px(hx2, 946, box(miniOne, world).y + 20, 40, 12);

  // ── 站点一编排 ──
  wipe(sheet, c0 - 0.15, { dir: 't', d: 0.5 }); sfx('whoosh', c0 - 0.15);
  wipe(slab, c0 + 0.05, { dir: 'b', d: 0.5 }); sfx('thud', c0 + 0.35, { g: 0.5, p: 0.3 });
  typeText(row[0].firstChild, 'D:\\batlab&gt;expand6.bat', T('d1') - 0.3, 26, { cursorUntil: T('d1', '变量') });
  for (const e of [fly, hx, vx, hx2]) vanish(e, 0);
  vanish(mini, 0); vanish(tagStmt, 0); vanish(tagN, 0); vanish(row[1], 0);

  // d1：%n% 被读到 —— 给它琥珀底
  classAt(spanN, 'hl', T('d1', '百分号') - 0.1, Infinity);
  sfx('tick', T('d1', '百分号') - 0.1, { p: -0.3 });

  // d2：括号里的四行算作一条语句
  const tD2 = T('d2', '代码') - 0.15;
  for (const i of [2, 3, 4, 5]) classAt(ln[i], 'on', tD2, T('d4') - 0.2);
  sfx('tick', tD2, { p: -0.3 }); sfx('tick', tD2 + 0.18, { g: 0.6, p: -0.3 });
  slam(tagStmt, T('d2', '一条') - 0.1); sfx('pop', T('d2', '一条') - 0.1, { p: -0.3 });

  // d3：读入后的样子出现，1 从 %n% 的位置飞过来，屏幕输出 1
  const tFly = T('d3', '输出') - 0.55;
  wipe(mini, tFly - 0.35, { dir: 'l', d: 0.4 }); sfx('whoosh', tFly - 0.35, { g: 0.4 });
  appear(fly, tFly);
  fromTo(fly, tFly, { left: box(spanN, world).x + 'px', top: box(spanN, world).y + 'px' }, { left: box(miniOne, world).x + 'px', top: box(miniOne, world).y + 'px', duration: 0.45, ease: 'power2.inOut' });
  sfx('pop', tFly);
  vanish(fly, tFly + 0.5);
  appear(row[1], T('d3', '输出') + 0.15); sfx('error', T('d3', '输出') + 0.15, { p: 0.4 });
  sfx('chime', T('d3', '却') + 0.1, { g: 0.7 });

  // d4：读入这个块的时候，n 还是 1
  const tD4 = T('d4', '读入') - 0.1;
  slam(tagN, tD4); sfx('pop', tD4, { p: -0.3 });
  appear(hx, tD4 + 0.2); appear(vx, tD4 + 0.35); appear(hx2, tD4 + 0.5);
  sfx('tick', tD4 + 0.2, { g: 0.5, p: -0.3 }); sfx('tick', tD4 + 0.5, { g: 0.5, p: -0.3 });

  // ══════════ 站点二：delayed.bat ══════════
  const DX = 2400;
  const sheet2 = h('div', 'sheet', world); px(sheet2, 96 + DX, 130, 880);
  h('div', 'name', sheet2, 'delayed.bat');
  const code2 = ['@echo off', 'setlocal enabledelayedexpansion', 'set n=1', '(', '  set n=2', '  echo <span class="hl">!n!</span>', ')'];
  const ln2 = code2.map((c, i) => { const e = h('div', 'ln', sheet2, c); e.dataset.n = i + 1; return e; });
  const slab2 = h('div', 'slab now', world); px(slab2, 3440, 130, 600);
  h('div', 'hd', slab2, 'Windows 11 · cmd.exe');
  const row2 = [0, 1].map(() => h('div', 'row', slab2));
  row2[0].innerHTML = '<span class="in">D:\\batlab&gt;delayed.bat</span>';
  row2[1].innerHTML = '<span class="hi">2</span>';
  const h2 = h('div', 't-h2 nowrap abs', world, 'Windows 2000：延迟展开'); px(h2, 96 + DX, 700);
  const claim = h('div', 't-h1 nowrap abs', world, '默认关闭'); px(claim, 3440, 440);
  const inp = h('div', 'mono-note nowrap abs', world, 'This support is always disabled by default'); px(inp, 3440, 620);
  const inpSrc = h('div', 't-note nowrap abs', world, 'set /?，Windows 11'); px(inp, 3440, 690);

  // ── 站点二编排 ──
  wipe(sheet2, T('d5', 'Windows') + 0.15, { dir: 't', d: 0.5 }); sfx('whoosh', T('d5', 'Windows') + 0.15, { p: 0.3 });
  wipe(slab2, T('d5', 'Windows') + 0.25, { dir: 'b', d: 0.5 }); sfx('thud', T('d5', 'Windows') + 0.55, { g: 0.5, p: 0.3 });
  wipe(h2, T('d5', '两千') - 0.3, { dir: 'l', d: 0.5 }); sfx('tick', T('d5', '两千') - 0.3, { p: -0.3 });
  vanish(row2[1], 0); vanish(claim, 0); vanish(inp, 0); vanish(inpSrc, 0);
  classAt(ln2[1], 'on', T('d5', '两千') + 0.2, T('d6') - 0.3);
  classAt(ln2[5].querySelector('span'), 'hl', T('d5', '感叹号') - 0.2, Infinity);
  sfx('tick', T('d5', '感叹号') - 0.2, { p: -0.3 });
  appear(row2[1], T('d5', '感叹号') + 0.1); sfx('blip', T('d5', '感叹号') + 0.1, { p: 0.4 });
  slam(claim, T('d6', '默认') - 0.1); sfx('thud', T('d6', '默认') - 0.1);
  appear(inp, T('d6', '默认') + 0.55); sfx('pop', T('d6', '默认') + 0.55, { g: 0.5, p: 0.3 });
  appear(inpSrc, T('d6', '默认') + 0.8); sfx('tick', T('d6', '默认') + 0.8, { g: 0.5, p: 0.3 });

  // ── 镜头：跨站点与推近锚在词上，缓慢漂移用 null。每段首尾相接、互不重叠 ──
  camTrack(cam, s.start, { x: 960, y: 484, z: 1 }, [
    [T('d1') - 0.26, { x: 980, y: 460, z: 1.05 }, 2.6, { ease: 'none', sfx: false }],
    [T('d1', '读入') - 0.20, { x: 940, y: 430, z: 1.08 }, 1.0],
    [null, { x: 960, y: 425, z: 1.1 }, 1.4, { ease: 'none', sfx: false }],
    [T('d2', '代码') - 0.99, { x: 1010, y: 430, z: 1.11 }, 0.9],
    [null, { x: 1060, y: 430, z: 1.11 }, 2.7, { ease: 'none', sfx: false }],
    [T('d3', '输出') - 1.50, { x: 1080, y: 410, z: 1.11 }, 0.9],
    [null, { x: 1000, y: 410, z: 1.12 }, 2.0, { ease: 'none', sfx: false }],
    [T('d4', '读入') - 1.10, { x: 1000, y: 420, z: 1.1 }, 0.9],
    [null, { x: 1000, y: 420, z: 1.11 }, 2.3, { ease: 'none', sfx: false }],
    [T('d5', 'Windows') - 0.62, { x: 960 + DX, y: 430, z: 1 }, 0.85],
    [null, { x: 980 + DX, y: 420, z: 1.05 }, 3.2, { ease: 'none', sfx: false }],
    [T('d6', '默认') - 1.00, { x: 1020 + DX, y: 435, z: 1.06 }, 0.9],
    [null, { x: 950 + DX, y: 445, z: 1.08 }, 2.4, { ease: 'none', sfx: false }],
  ]);
});
