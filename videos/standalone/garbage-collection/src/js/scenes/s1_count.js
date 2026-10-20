// 第 01 章 · 引用计数。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('count', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：引用计数：实时记账，每个对象开头的 8 字节存着计数；归零即释放；环是死穴。
  // 逐句对应（expect.zh.json）：
  //   a1 引用计数
  //   a2 8 字节
  //   a3 1→2→3→2→1
  //   a7 X 与 Y 的环
  //   a9 拆环器报收 2 个
});
