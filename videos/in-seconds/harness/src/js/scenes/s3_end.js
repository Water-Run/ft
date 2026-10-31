// 结论：环再走一圈，「模型」一站是想，其余三站是 Harness 在做；替模型动手、把结果交回去的，就是 Agent 的手。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const hold = s.end - s.start - 0.2, dx = 16;
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const cx = 620, cy = 490, R = 290;
  const keys = [[s.start, 0], [T('e1', '想') - 0.2, 90, 0.9], [T('e1', '做') - 0.5, 270, 1.3], [T('e2', '交回') - 0.5, 358, 1.0]];
  const ring = makeRing(world, { cx, cy, R, keys, laps: 0 });
  wipe(ring.S, c0, { dir: 'l', d: 0.5 });
  ring.labels.forEach((e, i) => wipe(e.parentNode, c0 + 0.1 + i * 0.08, { dir: 'l', d: 0.3 }));
  // 想：模型一站；做：Harness 的三站
  const think = centered(world, 'paper', tr('想', 'think'), cx, cy - 150, 300); think.style.font = '900 110px "Sans SC"';
  const doit = centered(world, 'ac', tr('做', 'do'), cx, cy + 20, 300); doit.style.font = '900 110px "Sans SC"';
  slam(think, Q(T('e1', '想')), { from: 1.3, d: 0.4 }); sfx('thud', Q(T('e1', '想')), { g: 0.7 });
  slam(doit, Q(T('e1', '做')), { from: 1.3, d: 0.4 }); sfx('thud', Q(T('e1', '做')));
  const who1 = centered(world, 'dim', tr('模型', 'Model'), cx, cy - 20, 300); who1.style.font = '700 30px "Sans SC"';
  const who2 = centered(world, 'dim', 'Harness', cx, cy + 150, 300); who2.style.font = '700 30px Inter';
  wipe(who1, Q(T('e1', '想')) + 0.2, { dir: 'l', d: 0.3 }); wipe(who2, Q(T('e1', '做')) + 0.2, { dir: 'l', d: 0.3 });
  // 片名的回答
  const a1 = txt(world, 'paper', tr('Agent 的手', "The Agent's hands"), 1160, 300); css(a1, { font: '900 112px "Sans SC"', letterSpacing: '-.02em' });
  const eq = txt(world, 'dim', '=', 1160, 460); css(eq, { font: '900 110px Inter' });
  const a2 = txt(world, 'ink bg-ac', 'Harness', 1250, 460); css(a2, { font: '900 110px Inter', letterSpacing: '-.03em', padding: '0 24px' });
  wipe(a1, Q(T('e2', '动手')) - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', Q(T('e2', '动手')) - 0.1, { g: 0.5 });
  slide(eq, Q(T('e2', 'Agent')) - 0.2, { y: 40, d: 0.35 });
  slam(a2, Q(T('e2', 'Agent')), { from: 1.3, d: 0.45 }); sfx('chime', Q(T('e2', 'Agent')), { g: 0.8 });
  const sub = txt(world, 'dim', tr('替模型动手，再把结果交回去', 'Acts for the model, then hands the result back'), 1164, 640); sub.style.font = '500 34px "Sans SC"';
  wipe(sub, Q(T('e2', 'Agent')) + 0.6, { dir: 'l', d: 0.5 });
});
