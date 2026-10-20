// 第 05 章 · 谁来买单。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('cost', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：谁买单：引用计数、追踪回收、所有权与手动管理，各自有账要付。
  // 逐句对应（expect.zh.json）：
  //   g1 精妙不等于免费
  //   g3 Nim
  //   g4 ARC
  //   g5 Rust 所有权
  //   g7 C 与 Zig
  //   g9 两种账单
  //   g10 账单交给谁
});
