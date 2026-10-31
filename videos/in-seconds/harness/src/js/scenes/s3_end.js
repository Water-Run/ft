// 结论：同一个环再走一圈。「模型」一站是想，「Harness 执行」「结果交回」是 Harness 在做；替模型动手、把结果交回去的，就是 Agent 的手。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const hold = s.end - s.start - 0.2, dx = 16;
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const cx = 560, cy = 515, R = 250;
  const tThink = T('e1', '想'), tDo = T('e1', '做');
  const keys = [[s.start, 0], [tDo - 0.5, 180, 1.0], [T('e2', '交回') - 0.5, 360, 1.0]];
  const loop = makeLoop(world, {
    cx, cy, R, keys, from: Infinity,
    cards: { model: [cx - 200, 175, 400, 120], call: [790, 455, 280, 120], exec: [cx - 200, 705, 400, 120], back: [90, 455, 280, 120] },
    bodies: { model: tr('读对话，决定下一步', 'reads, decides'), call: tr('写出要做的事', 'writes what to do'), exec: tr('读、改、跑', 'read, edit, run'), back: tr('结果放回对话', 'result back in') },
  });
  const K = loop.cards;
  wipe(loop.S, c0, { dir: 'l', d: 0.5 });
  ['model', 'call', 'exec', 'back'].forEach((k, i) => wipe(K[k].box, c0 + 0.1 + i * 0.08, { dir: 'l', d: 0.3 }));
  classAt(K.model.box, 'lit', Q(tThink) - 0.05);
  classAt(K.exec.box, 'lit', Q(tDo) - 0.05); classAt(K.back.box, 'lit', Q(tDo) + 0.1);
  // 环心：想 / 做
  const think = centered(world, 'paper', tr('想', 'think'), cx, cy - 150, 300); think.style.font = '900 110px "Sans SC"';
  const doit = centered(world, 'ac', tr('做', 'do'), cx, cy + 10, 300); doit.style.font = '900 110px "Sans SC"';
  slam(think, Q(tThink), { from: 1.3, d: 0.4 }); sfx('thud', Q(tThink), { g: 0.7 });
  slam(doit, Q(tDo), { from: 1.3, d: 0.4 }); sfx('thud', Q(tDo));
  const who1 = centered(world, 'dim', tr('模型', 'Model'), cx, cy - 20, 300); who1.style.font = '700 30px "Sans SC"';
  const who2 = centered(world, 'dim', 'Harness', cx, cy + 140, 300); who2.style.font = '700 30px Inter';
  wipe(who1, Q(tThink) + 0.2, { dir: 'l', d: 0.3 }); wipe(who2, Q(tDo) + 0.2, { dir: 'l', d: 0.3 });
  // 片名的回答
  const a1 = txt(world, 'paper', tr('Agent 的手', "The Agent's hands"), 1160, 300); css(a1, { font: '900 112px "Sans SC"', letterSpacing: '-.02em' });
  const eq = txt(world, 'dim', '=', 1160, 460); css(eq, { font: '900 110px Inter' });
  const a2 = txt(world, 'ink bg-ac', 'Harness', 1250, 460); css(a2, { font: '900 110px Inter', letterSpacing: '-.03em', padding: '0 24px' });
  wipe(a1, Q(T('e2', '动手')) - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', Q(T('e2', '动手')) - 0.1, { g: 0.5 });
  slide(eq, Q(T('e2', 'Agent')) - 0.2, { y: 40, d: 0.35 });
  slam(a2, Q(T('e2', 'Agent')), { from: 1.3, d: 0.45 }); sfx('chime', Q(T('e2', 'Agent')), { g: 0.8 });
  const sub = txt(world, 'dim', tr('替模型动手，再把结果交回去', 'Acts for the model, then hands the result back'), 1164, 640); sub.style.font = '500 34px "Sans SC"';
  wipe(sub, Q(T('e2', 'Agent')) + 0.6, { dir: 'l', d: 0.5 });
  const nm = txt(world, 'dim', 'Agent Loop', 1164, 210); nm.style.font = '700 32px Inter';
  wipe(nm, c0 + 0.4, { dir: 'l', d: 0.4 });
});
