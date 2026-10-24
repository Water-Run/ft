// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// D1 的版式：在终端里查一张「名单」，一条分工一行。保留三样：策划、全部参与的模型与分工、「开源视频」与完整的仓库地址。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const rows = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) for (const r of m.roles || []) rows.push([label(r), m.name]);
  rows.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  rows.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  const t = term(world, 120, 128, 1680, 800, '<b>mysql</b>  myisam_demo');
  appear(t.el, s.start + 0.05);
  t.cmd('<span class="k">SELECT</span> * <span class="k">FROM</span> credits;', s.start + 0.2, { cps: 60 });
  const t0 = s.start + 0.9, Y0 = 66 + 58;
  rows.forEach(([k, v], i) => {
    const kE = h('div', 'abs', t.el, esc(k)); px(kE, 26, Y0 + i * 58); css(kE, { font: '500 30px "Sans SC"', color: '#8a8a8a', lineHeight: '50px' });
    const vE = h('div', 'abs mono', t.el, esc(v)); px(vE, 760, Y0 + i * 58); css(vE, { fontSize: '32px', lineHeight: '50px', color: i === 0 ? '#F29111' : '#d9d9d9' });
    appear(kE, t0 + i * 0.06); appear(vE, t0 + i * 0.06);
  });
  sfx('blip', t0, { g: 0.4 });
  const n = h('div', 'abs mono', t.el, `${rows.length} rows in set`); px(n, 26, Y0 + rows.length * 58 + 10); css(n, { fontSize: '30px', color: '#808080' });
  appear(n, t0 + rows.length * 0.06 + 0.1); sfx('tick', t0 + rows.length * 0.06 + 0.1, { g: 0.4 });
  track(cam, s.start, { x: 960, y: 540, z: 1 }, [[s.start + 0.1, { z: 1.02 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
