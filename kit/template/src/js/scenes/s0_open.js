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

  // 文案里用 *星号* 标出的术语，第一次出现的那句说完时，画面上要有它的注解：带 data-gloss="术语" 的元素，
  // 交代它是什么、指画面上哪一块、数字或出处，补旁白没说的（docs/guides/scenes.md 第 7 节；scan.js 的 GLOSS 核对它在场）
  const gloss = h('div', 'abs t-body', world, tr('词：T(句号, 词) 取的是它被读到的时刻', 'word: T(cue, word) is the moment it is spoken'));
  px(gloss, 120, 640); gloss.dataset.gloss = tr('词', 'word');
  show(gloss, tw + 0.3, { y: 20 });

  // 镜头写成一条轨迹：起点，然后是各关键帧 [时刻, 去向, 时长, 选项]。动不动、怎么动按本片设计定（docs/guides/scenes.md 第 3 节）。
  // 停在一屏上时不缩放、不推近、不往复；这里只朝一个方向极慢横移（一屏合计不超过 48 像素、每秒不超过 2 像素），可以删
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 540, z: 1 }, [
    [s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }],
  ]);
});
