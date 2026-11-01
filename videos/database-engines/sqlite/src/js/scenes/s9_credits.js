// 片尾名单（系列约定：用数据库查询列出名单）：sqlite> SELECT * FROM credits;
// 名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const box = h('div', 'abs codeblock', world); px(box, 360, 200, 1200); css(box, { fontSize: '30px', padding: '22px 34px' });
  const cmd = h('div', '', box, '<span style="color:#044a64">sqlite&gt;</span> SELECT * FROM credits;');
  const rows = [['role', 'name']];
  rows.push([tr('策划', 'Planning'), C.planner || '']);
  for (const m of [...(C.models || []), ...(C.services || [])]) for (const r of m.roles || []) rows.push([label(r), m.name]);
  rows.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  rows.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  const tbl = h('div', '', box); css(tbl, { marginTop: '14px', fontSize: '28px' });
  const els = rows.map((r, i) => { const e = h('div', '', tbl); css(e, { display: 'flex', borderBottom: i === 0 ? `1.5px solid ${K.rule}` : 'none', fontWeight: i === 0 ? 700 : 400, padding: '3px 0' }); const a = h('div', '', e, esc(r[0])); a.style.width = '300px'; const b = h('div', '', e, esc(r[1])); b.style.fontFamily = '"Mono", "Sans SC"'; return e; });
  const n = h('div', '', box, `(${rows.length - 1} rows)`); css(n, { marginTop: '10px', color: K.dim, fontSize: '24px' });
  wipe(box, s.start + 0.1, { dir: 't', d: 0.4 });
  els.forEach((e, i) => appear(e, s.start + 0.5 + i * 0.06)); appear(n, s.start + 0.5 + els.length * 0.06);
  // 补音效（check.js 报的长空档）
  sfx('whoosh', s.start + 0.1, { g: 0.3 });
  sfx('tick', s.start + 0.6, { g: 0.3 });
  sfx('tick', s.start + 1.0, { g: 0.25 });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[s.start + 0.1, { x: 972 }, Math.max(1, s.end - s.start - 0.3), { ease: 'none', sfx: false }]]);
});
