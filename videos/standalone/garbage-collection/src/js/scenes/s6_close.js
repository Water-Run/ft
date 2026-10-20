// 收束。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：回到最初的问题：它不知道，只是还找不找得到；六十多年从一停好几秒到一秒上百次。
  // 逐句对应（expect.zh.json）：
  //   h1 找不找得到
  //   h4 1960 回收
  //   h5 脚注原文
  //   h6 脚注原文
  //   h7 六十多年
});
