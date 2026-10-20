// 第 00 章 · 开场。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：格子纸：内存是一张纸，程序每造一个对象就占掉一格。先让观众看见「占格」这件事，再抛出「它怎么知道自己没用了」。
  // 逐句对应（expect.zh.json）：
  //   o1 格子纸
  //   o2 六千七百万
  //   o3 64 MB
  //   o5 11 MB
  //   o6 136 次
  //   o7 垃圾回收
  //   o10 妥协与权衡
});
