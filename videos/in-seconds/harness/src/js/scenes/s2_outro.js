// 片尾：主题词、一句话的概括、制作名单与开源仓库地址。名单与 research/FACTS.md 的「制作署名」一致。旁白尚未合成，不列语音模型。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-ink', -200, -200, 2320, 1400);
  const t0 = s.start + 0.35;
  const big = txt(world, '', tr('执行', 'RUN'), 92, 96); css(big, { font: '900 300px "Inter", "Sans SC"', letterSpacing: '-.04em', lineHeight: '1' });
  const line = txt(world, 't-3 ac', tr('模型提出，程序执行', 'The model asks. The program runs.'), 108, 452);
  slam(big, t0, { from: 1.2, d: 0.4 }); sfx('thud', t0, { g: 0.8, p: -0.3 });
  wipe(line, t0 + 0.25, { dir: 'l', d: 0.4 });
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun'],
    [tr('取证 · 文案 · 视觉方案', 'Research · script · visual plan'), 'Grok 4.7'],
    [tr('开源视频', 'Open-source video'), 'github.com/Water-Run/ft'],
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
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.03 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
