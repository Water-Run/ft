// 第 04 章 · 三色与写屏障。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('tri', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：三色标记与写屏障：不中断程序地标记；黑的不能指向白的；写屏障是拦截活。
  // 逐句对应（expect.zh.json）：
  //   e3 三色标记
  //   e4 白灰黑
  //   e7a 冤杀
  //   e8 家规
  //   e10 写屏障
  //   e13 419 步
  //   e16 a.Next = b
  //   e18 G1 并发
});
