// 片尾：片名与制作名单（只在画面上，不配音）。名单出处见 research/FACTS.md「制作署名」。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const t0 = s.start + 0.4;
  const big = txt(world, 't-0', 'InnoDB', 92, 150);
  const line = txt(world, 't-3 blue', '事务性与现代化', 104, 330);
  const ser = txt(world, 't-n dim', '一个数据库引擎是如何实现的？ · 第 2 集', 108, 410);
  pop(big, t0, { from: 0.85, origin: '0 50%' }); sfx('thud', t0, { g: 0.6, p: -0.3 }); fin(line, t0 + 0.3); fin(ser, t0 + 0.5);
  const shades = ['t1', 't2', 't1', 't3', 't1', 't2', 't4', 't1', 't2', 't1', 't3', 't1'];
  shades.forEach((c, i) => { const e = tile(world, 108 + (i % 4) * 92, 520 + Math.floor(i / 4) * 92, 78, 78, i === 6 ? 'or' : c); pop(e, t0 + 0.6 + i * 0.04); });
  const rows = [
    ['策划', 'WaterRun'],
    ['取证与实验', 'Codex（GPT-6）'],
    ['文案', 'Claude Haiku 5.5 · Claude Opus 5.5'],
    ['补核 · 视觉 · 动画 · 配乐 · 审查', 'Claude Opus 5.5'],
    ['旁白合成', 'Microsoft Edge 在线语音（模型未披露）'],   // lint-ok: 这里的 Microsoft 是服务名，不是字体
    ['读音回听', 'Whisper small'],
    ['网页检索与摘录', 'WebSearch · WebFetch（模型未披露）'],
    ['开源视频', 'github.com/Water-Run/ft'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 96 + i * 104, last = i === rows.length - 1;
    const rule = blk(world, last ? 'bg-blue' : 'bg-t1', 900, y, 920, last ? 5 : 3);
    const a = txt(world, 't-s dim', k, 900, y + 12);
    const b = txt(world, last ? 'mono t-4 blue' : 't-4', v, 900, y + 46); if (last) b.style.fontWeight = 700;
    const tt = t0 + 0.4 + i * 0.22;
    fromTo(rule, tt, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' });
    fin(a, tt + 0.05, { y: 6 }); fin(b, tt + 0.12, { y: 6 });
    sfx(last ? 'chime' : 'tick', tt, { g: last ? 0.5 : 0.35, p: 0.4 });
  });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, []);
});
