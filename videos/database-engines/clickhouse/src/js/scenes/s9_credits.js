// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式按本片的视觉系统：一条 SELECT * FROM credits; 的终端语句，名单落在下面；保留三样：策划、全部参与的模型与分工、「开源视频」与完整的仓库地址。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const tm = termAt(world, 100, 140, 1000, 90); vanish(tm.el, 0); appear(tm.el, s.start + 0.15);
  tm.line(0, '<span class="pr">:) </span>SELECT * FROM credits;', s.start + 0.2, { type: 24, cursorUntil: s.start + 1.6 });
  const items = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) items.push([(m.roles || []).map(label).join(' · '), m.name]);
  items.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  items.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  // 名单按行往下排（分工长的一行自动折行）；系列约定：结果末尾给出行数（clickhouse-client 的样子）
  const list = h('div', 'credits-list', world, ''); px(list, 100, 252, 1700);
  items.forEach(([k, v], i) => {
    const e = h('div', 'credit-row', list, `<span class="t-note">${esc(k)}</span><br><span class="t-body">${esc(v)}</span>`);
    slide(e, s.start + 1.4 + i * 0.14, { y: 30 });
  });
  const rows = h('div', 'mono', list, `${items.length} rows in set.`); css(rows, { fontSize: '26px', color: 'var(--g3)', position: 'relative' });
  vanish(rows, 0); appear(rows, s.start + 1.6 + items.length * 0.14);
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);   // 停留：只朝一个方向极慢横移，不缩放
  cam.track(s.start, { x: 960 - dx / 2, y: 540, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
