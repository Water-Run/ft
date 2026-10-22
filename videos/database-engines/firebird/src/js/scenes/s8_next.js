// 引出下一集：同一套引擎，放进独立服务端，也能装进应用程序；系列的第 5 格是只做嵌入式的 SQLite——小巧，同时又强大？
// 主画面：开场那排系列格子重新出现，第 4 格是火鸟，第 5 格落下 SQLite。
scene('next', ({ root, s }) => {
  const { world, under, over } = stage(root, 3840, 1080);
  const cam = makeCamera(world);
  // ── 站 A：引擎块分别落进服务端与应用 ──
  const core = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:72px;margin-right:20px">Firebird 引擎', 660, 220, 600, 120, { fontSize: '52px', fontWeight: 700, outline: '5px solid ' + C.ink, outlineOffset: '-5px' });
  const srv = blk(world, 'dark', '', 160, 520, 700, 300); tx(srv, 't3', '独立服务端', 30, 24, { color: C.white });
  const app = blk(world, 'panel', '', 1060, 520, 700, 300); tx(app, 't3', '应用程序', 30, 24);
  const e1 = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:52px;margin-right:14px">引擎', 660 + 50, 230, 500, 96, { fontSize: '40px' });
  const e2 = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:52px;margin-right:14px">引擎', 660 + 50, 230, 500, 96, { fontSize: '40px', outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  const t0 = s.start + 0.1, tN1 = T('n1'), tN2 = T('n2');
  slam(core, t0, { from: 1.15, d: 0.45 }); sfx('thud', t0 + 0.05, { g: 0.5 });
  wipe(srv, T('n1', '服务端') - 0.6, { dir: 't', d: 0.45 });
  appear(e1, T('n1', '服务端') - 0.3); tl.fromTo(e1, { x: 0, y: 0 }, { x: 160 + 100 - 710, y: 520 + 130 - 230, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, T('n1', '服务端') - 0.3);
  sfx('thud', T('n1', '服务端') + 0.5, { g: 0.55, p: -0.4 });
  wipe(app, tN2 - 0.5, { dir: 't', d: 0.45 });
  appear(e2, tN2 - 0.2); tl.fromTo(e2, { x: 0, y: 0 }, { x: 1060 + 100 - 710, y: 520 + 130 - 230, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, tN2 - 0.2);
  sfx('thud', tN2 + 0.6, { g: 0.55, p: 0.4 });

  // ── 站 B：系列的格子：01–04，第 5 格是 SQLite ──
  const X = 1920, COLS = [120, 480, 840, 1200, 1560], CW = 300;
  const eps = [['01', 'MyISAM'], ['02', 'InnoDB'], ['03', 'PostgreSQL'], ['04', 'Firebird'], ['05', 'SQLite']];
  const tGo = T('n4') - 0.5;
  const els = eps.map(([n, name], i) => {
    const x = X + COLS[i], last = i === 4;
    const sq = blk(world, last ? '' : 'panel', '', x, 230, CW, 260, last ? { outline: '4px dashed ' + C.g4, outlineOffset: '-4px' } : {});
    sq.dataset.name = '第 ' + n + ' 期';
    const num = i === 3 ? null : tx(world, 'lat', n, x + 24, 246, { fontSize: '140px', fontWeight: 200, color: C.g4, lineHeight: '1' });
    const nm = tx(world, 't3 lat', name, x, 520, { fontWeight: i >= 3 ? 700 : 500 });
    return { sq, num, nm };
  });
  const fbm = blk(world, '', '<img src="img/fb-mark.png" style="width:100%">', X + COLS[3] + 80, 280, 140, 142);
  els.slice(0, 4).forEach((o, i) => { appear(o.sq, tGo + 0.5 + i * 0.06); if (o.num) appear(o.num, tGo + 0.55 + i * 0.06); appear(o.nm, tGo + 0.6 + i * 0.06); });
  appear(fbm, tGo + 0.7);
  const tSq = T('n4', 'S Q') - 0.2;
  wipe(els[4].sq, tSq - 0.3, { dir: 'l', d: 0.4 }); appear(els[4].num, tSq - 0.1); slam(els[4].nm, tSq, { from: 1.3 }); sfx('thud', tSq + 0.05, { g: 0.7, p: 0.6 });
  const only = tx(world, 't4', '只做嵌入式', X + COLS[4], 600, { fontWeight: 500 }); wipe(only, T('n4', '嵌入式') - 0.2, { dir: 'l', d: 0.4 });
  const q = tx(world, '', '小巧，同时又强大？', X + 120, 720, { fontSize: '96px', fontWeight: 700 });
  wipe(q, T('n5', '小巧') - 0.2, { dir: 'l', d: 0.7 }); sfx('riser', T('n5', '强大') - 1.0, { g: 0.3 }); sfx('chime', T('n5', '强大') + 0.2, { g: 0.6 });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [s.start + 0.1, { z: 1.03 }, tGo - s.start - 0.25, { ease: 'none', sfx: false }],
    [tGo, { x: X + 960, z: 1 }, 1.0, { g: 0.4 }],
    [null, { x: X + 980, z: 1.03 }, Math.max(1, s.end - tGo - 1.2), { ease: 'none', sfx: false }],
  ]);
});
