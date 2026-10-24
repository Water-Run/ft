// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式沿用本片手册架构图的语汇：暖灰的大块里放白色小框，每框一项分工；底部是许可与「开源视频」的完整仓库地址。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const W = h('div', 'world', root);
  drift3(makeCamera(W), s, 1);            // 缓慢漂移（parts.js）
  const items = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) items.push([(m.roles || []).map(label).join(' · '), m.name]);
  // 两列排开；行数多时压低行高，大块的高度随行数定，整组在画面里竖直居中
  const cols = 2, rows = Math.ceil(items.length / cols);
  const bw = 780, bh = Math.min(120, Math.floor((700 - 110 - (rows - 1) * 18) / Math.max(1, rows)));
  const zh = 100 + rows * (bh + 18) + 22, zy = Math.max(110, Math.round((940 - zh - 90) / 2));
  const zoneEl = zone(W, 120, zy, 1680, zh, '制作', 'Credits');
  const boxes = items.map(([k, v], i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const b = h('div', 'box', zoneEl); px(b, 40 + c * (bw + 40), 100 + r * (bh + 18), bw, bh);
    b.innerHTML = `<div class="t-note" style="position:absolute;left:24px;top:${Math.max(8, bh / 2 - 44)}px;white-space:normal;width:${bw - 48}px">${esc(k)}</div>`
      + `<div class="t-body" style="position:absolute;left:24px;top:${Math.max(40, bh / 2 - 6)}px;font-weight:700">${esc(v)}</div>`;
    return b;
  });
  const lic = h('div', 'abs', W, `<span class="t-note">${tr('许可', 'License')}</span><span class="t-body" style="margin-left:18px">${esc((window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later')}</span>`);
  px(lic, 120, zy + zh + 40);
  const repo = h('div', 'abs', W, `<span class="t-note">${tr('开源视频', 'Open-source video')}</span><span class="mono" style="margin-left:18px;font-size:34px;color:var(--mainD);font-weight:700">${esc(String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, ''))}</span>`);
  px(repo, 760, zy + zh + 36);
  const t0 = s.start + 0.15;
  wipe(zoneEl, t0, { dir: 'l', d: 0.6 }); sfx('whoosh', t0, { g: 0.4 });
  boxes.forEach((b, i) => slide(b, t0 + 0.4 + i * 0.1, { y: 24 }));
  slide(lic, t0 + 0.6 + boxes.length * 0.1, { y: 16 }); slide(repo, t0 + 0.7 + boxes.length * 0.1, { y: 16 });
  // 一排页小方块随名单停留一格格填满（章节卡用的同一个母题），到片尾正好填完
  const row = h('div', 'abs', W); px(row, 120, zy + zh + 120); css(row, { display: 'flex', gap: '10px' });
  const N = 24, cells = Array.from({ length: N }, () => { const c = h('i', '', row); css(c, { display: 'block', width: '40px', height: '40px', border: '2px solid var(--mainD)', background: 'var(--panel)' }); return c; });
  let last = -1;
  F((t) => { const k = Math.round(clamp((t - t0 - 1.0) / Math.max(1, s.end - t0 - 1.6)) * N); if (k === last) return; last = k; cells.forEach((c, i) => { c.style.background = i < k ? 'var(--teal)' : 'var(--panel)'; }); });
  vanish(row, 0); appear(row, t0 + 0.9);
});
