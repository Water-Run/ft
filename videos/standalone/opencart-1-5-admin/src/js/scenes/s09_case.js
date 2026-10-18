// 占位场景：case。TODO scene author —— 按 brief/04-storyboard.md 与 js/SCENE-GUIDE.md 整个替换本文件。
scene('case', ({ root, s, c0 }) => {
  /* TODO scene author */
  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const b = ocBox(w, 160, 200, 1600, 600, '场景 case · 待制作', { icon: 'code' });
  h('div', 't-lbl', b.bd, '占位画面：等待正式场景替换');
  stamp(w, 160, 830, 'demo', '占位');
  slideDown(b.el, c0 + 0.1);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[c0 + 0.1, { z: 1.04 }, Math.max(1, s.end - c0 - 0.3), { ease: 'none', sfx: false }]]);
});
