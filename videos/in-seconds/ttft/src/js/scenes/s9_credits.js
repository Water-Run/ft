// 片尾名单（outro，93.0–96.0 秒，约 3 秒，不配旁白）。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 只有约 3 秒（策划者 2026-11-18 的要求）：名单分两组整组出现（0.2 秒、1.4 秒），不逐行入场、不做动画，字号见 style.css 的 .credit-row（不小于 36px）。
scene('outro', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const col = h('div', 'credits', world);
  const row = (k, v, ac) => h('div', 'credit-row', col, `<span class="k">${esc(k)}</span><span class="v${ac ? ' ac' : ''}">${esc(v)}</span>`);
  const first = [row(tr('策划', 'Planning'), C.planner || '')];
  for (const m of [...(C.models || []), ...(C.services || [])]) first.push(row((m.roles || []).map(label).join(' · '), m.name));
  const second = [row(tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, ''), true),
    row(tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later')];
  // 分两组出现：第一组（策划与分工）0.2 秒后整组出现，第二组（开源视频与许可）1.2 秒后整组出现；
  // 这样任意 2.5 秒内都有变化（scan.js 的 STILL），又不是逐行入场（3 秒内要读完）
  first.forEach((r) => appear(r, s.start + 0.2));
  second.forEach((r) => appear(r, s.start + 1.4));
});
