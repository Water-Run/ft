// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 系列约定：终端里执行 SELECT * FROM credits;，结果逐行列出分工，末尾给出行数；名单不配旁白。
// 版式照 clickhouse-client 的 PrettyCompact：语句打完，结果整块打出——表头嵌在上框线里，行号在框外，末尾一行「N rows in set.」。
// 这条查询没有实测耗时，所以不写 Elapsed。分工较长的一格在格子里折行（终端里是一行很长的字，这里为了读得完）。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const panel = mk(world, 'term', 100, 120, 1720, 830); vanish(panel, 0); appear(panel, s.start + 0.15);
  const q = h('div', 'mono', panel, ''); css(q, { position: 'absolute', left: '22px', top: '14px', whiteSpace: 'pre' });
  const tEnd = typeText(q, PR + 'SELECT * FROM credits;', s.start + 0.25, 26, { cursorUntil: s.start + 1.3 });
  const items = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) items.push([(m.roles || []).map(label).join(' · '), m.name]);
  items.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  items.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  const tOut = Math.max(tEnd + 0.25, s.start + 1.4);
  const tab = mk(panel, 'ctab', 22, 82, 1650, null); vanish(tab, 0); appear(tab, tOut); sfx('tick', tOut, { g: 0.5 });
  const cell = (cls, html) => h('div', cls, tab, html);
  cell('rn', ''); cell('c2 hd', '<span>role</span>'); cell('c3 hd', '<span>name</span>');
  items.forEach(([k, v], i) => {
    const last = i === items.length - 1 ? ' last' : '';
    cell('rn', (i + 1) + '.'); cell('c2' + last, esc(k)); cell('c3 nm' + last, esc(v));
  });
  const rows = h('div', 'mono foot', tab, `${items.length} rows in set.`); css(rows, { color: 'var(--w)' });
  const PH = 82 + tab.offsetHeight + 34;   // 面板按内容收紧（字体在构建前已载入，量得准），在字幕条之上竖直居中
  css(panel, { height: PH + 'px', top: Math.max(110, Math.round((960 - PH) / 2)) + 'px' });
  // 停留：只朝一个方向极慢横移，不缩放
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 540, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
