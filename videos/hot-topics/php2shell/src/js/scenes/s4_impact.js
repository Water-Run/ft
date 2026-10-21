// 04 影响。
// 主画面：「头条墙」。本章每句旁白变成一张新闻卡，按旁白依次砸上墙；
// 最后三句分成左右两栏，并排摆出互相冲突的说法。卡片文字直接取自已确认的字幕。
scene('impact', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);
  const cap = (id) => L.cues[id].cap.replace(/\*/g, '');

  // 第一站：头条墙
  const top = h('div', 'abs d-3', world, esc(cap('d1'))); px(top, 160, 150);
  slam(top, T('d1') + 0.05, { from: 1.2, d: 0.4 }); sfx('thud', T('d1') + 0.1);
  const wall = [['d2', 160, 300, 1600, 'amber', tr('建议', 'ADVICE')], ['d4', 160, 470, 1600, 'red', 'OFFLINE'],
    ['d5', 160, 640, 1000, 'red', 'PAUSED'], ['d6', 1200, 640, 560, 'red', 'PAUSED'], ['d8', 160, 810, 700, 'red', 'READ-ONLY']];
  wall.forEach(([id, x, y, w, cls, tag], i) => {
    const c = h('div', 'card', world, `<div class="k ${cls}" style="font-weight:700">${tag}</div><div class="v" style="font-size:40px">${esc(cap(id))}</div>`);
    px(c, x, y, w, 150); c.dataset.name = '头条 ' + id; css(c, { borderLeft: `8px solid var(--${cls})` });
    const t = id === 'd8' ? T(id) - 0.3 : T(id) + 0.05;
    slide(c, t, { x: i % 2 ? 80 : -80, d: id === 'd8' ? 0.15 : 0.35 });
    sfx('pop', t, { g: 0.75, p: x > 1000 ? 0.4 : -0.3 });
  });

  // 第二站：说法不一
  const Y = 1300;
  const q = h('div', 'abs d-2', world, esc(cap('d11'))); px(q, 160, Y + 120);
  const left = h('div', 'card', world, `<div class="k">${tr('看到了攻击', 'seen attacks')}</div><div class="v red">${esc(cap('d12'))}</div>`); px(left, 160, Y + 330, 780, 240);
  const right = h('div', 'card', world, `<div class="k">${tr('还没看到', 'not yet')}</div><div class="v amber">${esc(cap('d13'))}</div>`); px(right, 980, Y + 330, 780, 240);
  const toQ = Tend('d8') + 0.6;
  wipe(q, T('d11'), { dir: 'l', d: 0.4 }); sfx('error', T('d11') + 0.1, { g: 0.6 });
  slide(left, T('d12'), { x: -80 }); sfx('pop', T('d12'), { p: -0.4 });
  slide(right, T('d13'), { x: 80 }); sfx('pop', T('d13'), { p: 0.4 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.04 }, toQ - c0 - 0.2, { ease: 'none', sfx: false }],
    [toQ, { y: Y + 420, z: 1 }, 0.7],
    [null, { z: 1.04 }, s.end - toQ - 0.9, { ease: 'none', sfx: false }],
  ]);
});
