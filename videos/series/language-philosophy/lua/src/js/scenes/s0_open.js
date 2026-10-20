// 开场。TODO: 模板示例场景，整个文件换成本片的内容。
// 一个场景 = scene(场景号, ({ root, s, c0 }) => { … })：root 是本场的容器，s 是时间线上的这一场（start / end / lead），
// c0 是内容可以开始出现的时刻（有章节卡时在章节卡之后）。所有时刻都由 T(句号, 词) 推出，不写死秒数。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);

  // 第一帧就要有东西：一条横线先画出来，标题随第一句旁白落下
  const rule = h('div', 'rule', world); px(rule, 120, 270, 900);
  const title = h('div', 'abs d-1', world, tr('标题', 'Title')); px(title, 112, 300);
  const sub = h('div', 'abs t-body', world, tr('一句话说清这部片子讲什么', 'One line on what this film is about')); px(sub, 120, 530);

  fromTo(rule, s.start + 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }); sfx('whoosh', s.start + 0.05, { g: 0.5 });
  slam(title, T('o1'), { from: 1.2 }); sfx('thud', T('o1') + 0.12);
  const tw = T('o2', { zh: '词', en: 'word' });                 // 「词」这个字被读到的时刻
  slide(sub, tw, { x: -60 }); sfx('pop', tw);

  // 镜头始终在动：站内用极慢的推近保持画面不死。镜头写成一条轨迹：起点，然后是各关键帧 [时刻, 去向, 时长, 选项]
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [s.start + 0.1, { z: 1.05 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }],
  ]);
});
