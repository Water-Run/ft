// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式：一块红色斜切进来压住右侧，名单印在纸色上；名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);
  const red = poly(world, [[1300, 0], [1920, 0], [1920, 968], [1000, 968]], 'ac');
  wipe(red, s.start + 0.1, { dir: 'r', d: 0.4 });
  const col = h('div', 'abs credits ink', world); px(col, 120, 160);
  const row = (k, v) => h('div', 'credit-row', col, `<span class="note">${esc(k)}</span><br><span class="say" style="font-size:52px">${esc(v)}</span>`);
  const rows = [row(tr('策划', 'Planning'), C.planner || '')];
  for (const m of [...(C.models || []), ...(C.services || [])]) rows.push(row((m.roles || []).map(label).join(' · '), m.name));
  rows.push(row(tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'));
  rows.push(row(tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')));
  rows.forEach((r, i) => slide(r, s.start + 0.2 + i * 0.12, { y: 30 }));
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 540, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
