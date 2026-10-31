// 片尾：主题词、一句话的概括、制作名单与开源仓库地址。名单只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写名字。不配旁白。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const t0 = s.start + 0.35;
  const big = txt(world, '', 'Harness', 92, 150); css(big, { font: '900 210px Inter', letterSpacing: '-.04em', lineHeight: '1' });
  const line = txt(world, 't-3 ac', tr('模型负责想，Harness 负责做', 'The model thinks; the harness acts'), 104, 400);
  // 一个小环：本片的母题，转完一圈停在「模型」一站
  const S = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, world); px(S, 0, 0); S.dataset.name = tr('环', 'ring');
  const ringC = svg('circle', { cx: 300, cy: 700, r: 120, fill: 'none', stroke: C.ac, 'stroke-width': 10 }, S);
  draw(ringC, t0 + 0.3, 1.2);
  F((t) => { const v = t >= t0 + 0.3 ? '' : 'none'; if (ringC.style.display !== v) ringC.style.display = v; });
  slam(big, t0, { from: 1.2, d: 0.4 }); sfx('thud', t0, { g: 0.8, p: -0.3 });
  wipe(line, t0 + 0.25, { dir: 'l', d: 0.4 });
  const C2 = (window.PROJECT && window.PROJECT.credits) || {}, label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const rows = [
    [tr('策划', 'Planning'), C2.planner || ''],
    ...[...(C2.models || []), ...(C2.services || [])].map((m) => [(m.roles || []).map(label).join(' · '), m.name]),
    [tr('开源视频', 'Open-source video') + ' · ' + ((window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'), String(C2.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')],
  ];
  rows.forEach(([k, v], i) => {
    const y = 110 + i * (rows.length > 5 ? 128 : 150), last = i === rows.length - 1;
    const rule = blk(world, last ? 'bg-ac' : 'bg-paper', 1000, y, 820, last ? 6 : 3);
    const a = txt(world, 'credits-k', k, 1000, y + 14);
    const b = txt(world, (last ? 'mono ac' : '') + ' t-4', v, 1000, y + 54); css(b, { width: '820px', whiteSpace: 'normal', fontSize: v.length > 26 ? '30px' : '44px' }); if (last) b.style.fontWeight = 700;
    const tt = t0 + 0.2 + i * 0.1;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.6 : 0.7, p: 0.4 });
  });
  // 停留：不缩放、不推近，只朝一个方向极慢横移
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
