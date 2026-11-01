// 08 五个问题：一页文档的编号列表。每一问的答案用文档的灰色小按钮写出关键词，念到哪个词出哪个按钮（字幕说的整句不再抄上画面）。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const title = pageTitle(W, '五个问题'); show(title, c0 + 0.1, { y: 8 });
  const Q = [
    ['怎么放', 'z2', [['一个文件', 'z2', '一个文件'], ['一样大的页', 'z2', '页'], ['表：B+ 树', 'z2b', 'B 加树'], ['索引：B 树', 'z2b', '索引是']]],
    ['怎么找', 'z3', [['从根页往下', 'z3', '根页'], ['一层层缩小范围', 'z3', '缩小'], ['索引给出行号', 'z3b', '行号'], ['到表里取整行', 'z3b', '取整行']]],
    ['改和删', 'z4', [['先记日志再改', 'z4', '日志'], ['删掉的页进空闲链', 'z4b', '空闲链'], ['留给以后用', 'z4b', '以后']]],
    ['怎么并发', 'z5', [['回滚日志：提交时独占整个文件', 'z5', '独占'], ['WAL：各看各的快照', 'z5b', '快照'], ['写的人只有一个', 'z6', '只能有一个']]],
    ['出错怎么办', 'z7', [['回滚日志：抄回原样', 'z7', '抄回去'], ['WAL：校验和对得上', 'z7b', '校验和'], ['带提交标记的帧才算', 'z7b', '提交标记']]],
  ];
  const heads = [], chipEls = [];
  Q.forEach(([q, cue, chips], i) => {
    const y = 270 + i * 128;
    const no = btn(W, String(i + 1), 120, y + 4, 30); set(no, 0, { autoAlpha: 0 }); slam(no, T('z1') + 0.2 + i * 0.15, { from: 1.2 });
    const hq = h2(W, q, 200, y, 40); show(hq, T('z1') + 0.25 + i * 0.15, { x: -10, y: 0 }); sfx('pop', T(cue), { g: 0.35, p: -0.3 + i * 0.15 }); heads.push([T(cue), hq]);
    let x = 520;
    chips.forEach(([t, c, w], j) => { const b = btn(W, t, x, y + 6, 26); x += [...t].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? 26 : 15.6), 0) + 58; set(b, 0, { autoAlpha: 0 }); slam(b, T(c, w), { from: 1.15 }); sfx('tick', T(c, w), { g: 0.25 }); chipEls.push([T(c, w), b]); });
  });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([...heads, ...chipEls], Tend('z7b'));
  stay(cam, s, c0, -1);
});
