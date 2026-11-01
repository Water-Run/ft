// 片尾名单（无旁白）。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式：一个「制作名单」窗口，旁边一个小「关于」窗口收住片名。保留三样：策划、全部参与的模型与分工、「开源视频」与完整的仓库地址。
scene('outro', ({ root, s }) => {
  const C0 = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const Wc = makeWin(world, 60, 120, 1200, 818, tr('制作名单', 'Credits'), { sunken: true });
  zoomFx(s.start, [940, 478, 920, 460], Wc.rect, 0.3); sfx('drive', s.start, { g: 0.6 });
  const col = h('div', 'abs credits', world); px(col, 69, 185, 1182, 744);
  const rows = [[tr('策划', 'Planning'), C0.planner || '']];
  for (const m of [...(C0.models || []), ...(C0.services || [])]) rows.push([(m.roles || []).map(label).join(' · '), m.name]);
  rows.push([tr('开源视频', 'Open-source video') + ' · ' + ((window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'), String(C0.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  rows.forEach(([k, v], i) => {
    const r = h('div', 'crow', col, `<div class="ck">${esc(k)}</div><div class="cv${i === rows.length - 1 ? ' px navy' : ''}">${esc(v)}</div>`);
    px(r, 40, 40 + i * 150);
    if (i === rows.length - 1) css(r.lastChild, { fontSize: '56px' });
    slide(r, s.start + 0.45 + i * 1.2, { y: 24, d: 0.3 });
    sfx(i === rows.length - 1 ? 'chime' : 'tick', s.start + 0.45 + i * 1.2, { g: i === rows.length - 1 ? 0.6 : 0.6, p: -0.3 });
  });
  const A = makeWin(world, 1300, 120, 560, 420, tr('关于 IPv4', 'About IPv4'), { idle: true });
  vanish(A.el, 0);
  openWin(A, s.start + 0.45 + rows.length * 1.2, Wc.rect, { sound: 'pop', g: 0.5, p: 0.5 });
  txt(A.body, 't-big', 'IPv4', 30, 0).style.fontSize = '200px';
  txt(A.body, 't-h', tr('100 秒速通', 'in 100 s'), 34, 220).style.fontSize = '64px';
});
