// 第 03 章 · 分代。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('gen', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：分代：按年龄分房住，新区小、收得快；老对象指向新对象的问题由卡表解决。
  // 逐句对应（expect.zh.json）：
  //   d1 利伯曼与休伊特 1983
  //   d2 分代
  //   d4 三代 0/1/2
  //   d5 136 次
  //   d8 卡表
  //   d9 悬念
});
