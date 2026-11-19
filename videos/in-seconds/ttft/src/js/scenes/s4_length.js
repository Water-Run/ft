// 输入越长越晚（62.5–72.0 秒）：读输入的横条随输入变长，第一个 Token 在读完之后才出现。规格：第 3.5 节（横条的增长对应「读」的过程）。
scene('length', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const t1 = T('l1', '代码');
  const t2 = T('l2', '更晚');
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };

  // 第一行：一句话，读得快；第一个 Token 紧跟着
  const bar1 = h('div', 'stage pre', world); px(bar1, 240, 340, 360, 104); wipe(bar1, c0, { dir: 'l', d: 0.5 });
  wipe(lab('tag', '一句话', 240, 452, 30), c0 + 0.2, { dir: 'l', d: 0.4 });
  appear(tokenCol(world, 'def', 600, 340, 'first', true), c0 + 0.3);
  appear(tokenCol(world, 'is_', 756, 340, 'out', true), c0 + 0.6);
  appear(tokenCol(world, 'prime', 912, 340, 'out', true), c0 + 0.9);
  const br1 = brace(world, 'ac', 240, 600, 304, 1); wipe(br1, c0 + 0.3, { dir: 'l', d: 0.5 });
  wipe(lab('tag ac', '首 Token 延迟', 240, 216, 56), c0 + 0.3, { dir: 'l', d: 0.5 });

  // 第二行：整个代码文件。横条与括号随「读」的过程线性增长（t1→t2）；读完（t2）才出现第一个 Token
  const bar2 = h('div', 'stage pre', world); px(bar2, 240, 660, 1200, 104);
  fromTo(bar2, t1 - 0.2, { width: 0 }, { width: 1200, duration: (t2 + 0.4) - (t1 - 0.2), ease: 'none' });
  const br2 = brace(world, 'ac', 240, 1440, 624, 1);
  wipe(br2, t1 - 0.2, { dir: 'l', d: (t2 + 0.4) - (t1 - 0.2), ease: 'none' });
  wipe(lab('tag ac', '首 Token 延迟', 240, 536, 56), t1 - 0.2, { dir: 'l', d: 0.4 });
  wipe(lab('tag', '整个代码文件', 240, 776, 30), t1 + 0.2, { dir: 'l', d: 0.4 });
  appear(tokenCol(world, 'def', 1440, 660, 'first', true), t2 + 1.0);
  appear(tokenCol(world, 'is_', 1596, 660, 'out', true), t2 + 1.3);
  sfx('thud', t2 + 1.0, { g: 0.6 }); sfx('tick', t2 + 1.3, { g: 0.6 });
  // 读完之后，光标在第二个输出位闪
  blinkCaret(blk(world, 'caret', 1752, 660, 40, 104), t2 + 1.6);

  appear(lab('eg', '示例 · 长度与时间为示意', 1180, 180, 30), c0 + 0.2);
});
