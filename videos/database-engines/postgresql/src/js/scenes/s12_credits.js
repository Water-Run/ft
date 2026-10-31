// 片尾：在 psql 里查名单（系列约定）。名字只取自 project.json 的 credits，这里不手写任何名字；不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  drift(world, s, [], 1);
  const rows = [['策划', C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) for (const r of m.roles || []) rows.push([label(r), m.name]);
  rows.push(['许可', (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  rows.push(['开源视频', String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  const box = psqlBox(world, '', 240, 130, 1440); css(box, { fontSize: '32px', padding: '30px 46px', whiteSpace: 'normal', height: '780px' });
  // 查询逐字敲出，结果一行行出来，最后整张名单停住留够时间读（WaterRun：「片尾的credit查询要动画」）
  const head = h('div', '', box, '<span class="p">postgres=#</span> '); const cmd = h('span', '', head);
  const grid = h('div', '', box); css(grid, { marginTop: '14px', display: 'grid', gridTemplateColumns: '260px 34px 1fr', lineHeight: '1.55' });
  const cell = (t, st = '') => { const e = h('span', '', grid, esc(t)); e.style.cssText = st; return e; };
  const line = [cell(' role', 'text-align:center'), cell('|'), cell(' name', 'padding-left:12px'), cell('', 'border-top:2px solid var(--ink2);margin-top:24px'), cell('+', 'text-align:center;color:var(--ink2)'), cell('', 'border-top:2px solid var(--ink2);margin-top:24px')];
  const rowEls = rows.map(([r, n]) => [cell(r, 'padding-left:14px'), cell('|'), cell(n, 'padding-left:12px')]);
  const foot = h('div', '', box, `(${rows.length} rows)`); css(foot, { marginTop: '8px' });
  wipe(box, s.start + 0.2, { dir: 't', d: 0.5 });
  const e = typeText(cmd, '<span class="k">SELECT</span> * <span class="k">FROM</span> credits;', s.start + 0.7, 28, { cursorUntil: s.start + 2.2 });
  line.forEach((c) => show(c, e + 0.2, { y: 0, d: 0.2 }));
  const gapR = Math.min(1.0, (s.end - e - 2.6) / (rows.length + 1));
  rowEls.forEach((cs, i) => cs.forEach((c) => show(c, e + 0.45 + i * gapR, { x: -14, y: 0, d: 0.3 })));
  show(foot, e + 0.55 + rows.length * gapR, { y: 0, d: 0.3 });
  sfx('blip', e + 0.2, { g: 0.4 });
});
