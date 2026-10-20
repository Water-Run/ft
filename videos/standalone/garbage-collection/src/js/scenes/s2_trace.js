// 第 02 章 · 标记—清扫。场景骨架：受托模型按 brief/04-storyboard.md 实现本场。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
// 视觉系统：src/css/style.css 与 research/STYLE.md。逐句对应表：expect.zh.json。
scene('trace', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  // 本场要让观众明白：标记—清扫：从根出发走一遍，走得到的活着，走不到的是垃圾；McCarthy 1960 的空闲表。
  // 逐句对应（expect.zh.json）：
  //   b1 根
  //   b2 追踪
  //   b4 McCarthy 1960
  //   b5 符号位拨成负
  //   b7 标记—清扫
  //   b8 二十万张活表
  //   b9 28 MB → 14 MB
});
