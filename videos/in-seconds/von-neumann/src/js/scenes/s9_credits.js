// 片尾名单：说明书的版权页。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；名单不配旁白。
scene('credits', ({ root, s }) => {
  css(root, { background: 'var(--paper)' });
  const grid = h('div', 'abs', root); px(grid, 0, 0, 1920, VH);
  css(grid, { background: 'linear-gradient(var(--rule) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, var(--rule) 1px, transparent 1px) 0 0 / 40px 40px' });
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const C_ = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const t0 = s.start + 0.45;
  const fig = txt(world, 'type', tr('版权页', 'COLOPHON'), 124, 150);
  const big = txt(world, 'ttl', tr('冯·诺伊曼<br>架构', 'von Neumann<br>Architecture'), 116, 200); css(big, { fontSize: '128px', lineHeight: '1.08', whiteSpace: 'nowrap' });
  const n = txt(world, 'mono red', String(TOTAL) + ' ' + tr('秒', 's'), 124, 500); css(n, { font: '700 72px "Mono"' });
  appear(fig, t0); slide(big, t0, { x: -40, d: 0.5, ease: 'power3.out' }); appear(n, t0 + 0.3);
  const rows = [
    [tr('策划', 'Planning'), C_.planner || ''],
    ...[...(C_.models || []), ...(C_.services || [])].map((m) => [(m.roles || []).map(label).join(' · '), m.name]),
    [tr('开源视频', 'Open-source video') + ' · ' + ((window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'), String(C_.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')],
  ];
  rows.forEach(([k, v], i) => {
    const y = 140 + i * 132, last = i === rows.length - 1;
    const rule = blk(world, '', 900, y, 900, last ? 5 : 2); rule.style.background = last ? 'var(--red)' : 'var(--ink)';
    const a = txt(world, 'soft', k, 900, y + 14); css(a, { font: '500 28px "Serif SC"' });
    const b = txt(world, last ? 'mono red' : '', v, 900, y + 54); css(b, { font: last ? '700 40px "Mono"' : '700 44px "Serif SC"' });
    const tt = t0 + 0.2 + i * 0.12;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.5 : 0.6, p: 0.4 });
  });
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
