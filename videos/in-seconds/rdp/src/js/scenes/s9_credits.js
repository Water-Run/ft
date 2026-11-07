// 片尾名单（磁贴）。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 保留三样：策划、全部参与的模型与服务及分工、「开源视频」与完整的仓库地址。名单不配旁白。
scene('outro', ({ root, s }) => {
  const P = window.PROJECT || {}, C = P.credits || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const col = h('div', 'abs credits', world); px(col, 0, 0, 1920, 968);
  const items = [[tr('策划', 'Planning'), C.planner || '', 'rdp']];
  for (const m of [...(C.models || []), ...(C.services || [])]) items.push([(m.roles || []).map(label).join(' · '), m.name, 'tile']);
  items.push([tr('许可', 'License'), P.license || 'GPL-3.0-or-later', 'tile']);
  items.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, ''), 'you']);
  const tiles = items.map(([k, v, c], i) => {
    const e = h('div', 'tile c-' + c + ' credit-row', col); px(e, 120, 130 + i * 128, 1680, 116);
    h('div', 'abs t-note', e, esc(k)); css(e.children[0], { left: '22px', top: '10px', color: c === 'tile' ? 'var(--dim)' : '#f2f2f2' });
    h('div', 'abs t-body', e, esc(v)); css(e.children[1], { left: '22px', top: '50px' });
    slide(e, s.start + 0.2 + i * 0.12, { x: 80, d: 0.4 });
    return e;
  });
  sfx('pop', s.start + 0.2, { g: 0.5 });
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
