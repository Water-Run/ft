// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 本片的版式：白底、衬线、灰色的小标签；名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const title = h('div', 'abs', world, '<span style="font:300 64px \'Serif SC\'">CoT</span><span style="font:500 34px \'Serif SC\';letter-spacing:.12em;margin-left:28px;color:#22252a">先思考，再回答</span>');
  px(title, 160, 150);
  const rule = h('div', 'abs', world); px(rule, 160, 250, 96, 2); css(rule, { background: '#1c1c1c', transformOrigin: '0 50%' });
  const col = h('div', 'abs credits', world); px(col, 160, 300);
  const row = (k, v) => h('div', 'credit-row', col, `<div class="k">${esc(k)}</div><div class="v">${esc(v)}</div>`);
  const rows = [row(tr('策划', 'Planning'), C.planner || '')];
  for (const m of [...(C.models || []), ...(C.services || [])]) rows.push(row((m.roles || []).map(label).join(' · '), m.name));
  rows.push(row(tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'));
  rows.push(row(tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')));
  show(title, s.start + 0.15, { y: 8, d: 0.6 });
  fromTo(rule, s.start + 0.35, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' });
  rows.forEach((r, i) => show(r, s.start + 0.4 + i * 0.12, { y: 12, d: 0.5 }));
  const hold = s.end - s.start - 0.2, dx = Math.min(40, 2 * hold);   // 停留：只朝一个方向极慢横移，不缩放
  cam.track(s.start, { x: 960 - dx / 2, y: 540, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
