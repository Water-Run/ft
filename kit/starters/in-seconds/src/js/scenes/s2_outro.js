// 片尾：主题词、一句话的概括、制作名单与开源仓库地址。名单只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写名字。
// TODO: 主题词与概括换成本集的；版式按本集的视觉系统重做，做完删掉这一行。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-ink', -200, -200, 2320, 1400);
  const t0 = s.start + 0.35;
  const big = txt(world, '', tr('主题', 'Topic'), 92, 96); css(big, { font: '900 300px "Inter", "Sans SC"', letterSpacing: '-.04em', lineHeight: '1' });
  const line = txt(world, 't-3 ac', tr('一句话的概括', 'One line to keep'), 108, 452);
  slam(big, t0, { from: 1.2, d: 0.4 }); sfx('thud', t0, { g: 0.8, p: -0.3 });
  wipe(line, t0 + 0.25, { dir: 'l', d: 0.4 });
  const C = (window.PROJECT && window.PROJECT.credits) || {}, label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const rows = [
    [tr('策划', 'Planning'), C.planner || ''],
    ...[...(C.models || []), ...(C.services || [])].map((m) => [(m.roles || []).map(label).join(' · '), m.name]),
    [tr('开源视频', 'Open-source video') + ' · ' + ((window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')],
  ];
  rows.forEach(([k, v], i) => {
    const y = 124 + i * 122, last = i === rows.length - 1;
    const rule = blk(world, last ? 'bg-ac' : 'bg-paper', 980, y, 840, last ? 6 : 3);
    const a = txt(world, 't-n dim', k, 980, y + 14); a.style.fontSize = LANG === 'zh' ? '28px' : '26px';
    const b = txt(world, (last ? 'mono ac' : '') + ' t-4', v, 980, y + 52); if (last) b.style.fontWeight = 700; if (LANG !== 'zh' && v.length > 34) b.style.fontSize = '38px';
    const tt = t0 + 0.2 + i * 0.1;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    wipe(a, tt + 0.05, { dir: 'l', d: 0.3 }); wipe(b, tt + 0.12, { dir: 'l', d: 0.35 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.6 : 0.7, p: 0.4 });
  });
  // 停留：不缩放、不推近，只朝一个方向极慢横移（一屏合计不超过 48 像素、每秒不超过 2 像素；docs/guides/scenes.md 第 3 节）
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
