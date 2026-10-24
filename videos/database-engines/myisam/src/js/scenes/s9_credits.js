// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式按本片的视觉系统重做；保留三样：策划、全部参与的模型与分工、「开源视频」与完整的仓库地址。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const col = h('div', 'abs credits', world); px(col, 120, 180);
  const row = (k, v) => h('div', 'credit-row', col, `<span class="t-note">${esc(k)}</span><br><span class="t-body">${esc(v)}</span>`);
  const rows = [row(tr('策划', 'Planning'), C.planner || '')];
  for (const m of [...(C.models || []), ...(C.services || [])]) rows.push(row((m.roles || []).map(label).join(' · '), m.name));
  rows.push(row(tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'));
  rows.push(row(tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')));
  rows.forEach((r, i) => slide(r, s.start + 0.2 + i * 0.12, { y: 30 }));
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[s.start + 0.1, { z: 1.03 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
