// 它怎么工作。TODO: 系列基座的示例场景，整个文件换成本集的内容：把真实数据一步步算出来或拆开来，一句一个动作。
scene('demo', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const head = txt(world, 't-3', tr('一组真实的字节', 'Real bytes'), 120, 190);
  wipe(head, s.start + 0.15, { dir: 'l', d: 0.4 });
  const cells = byteCells(world, ['61', '7c', '67', '3a', '48', '6a', 'b2', 'ed'], { x: 120, y: 330, pitch: 110, w: 100, h: 104, size: 56, idx: true });
  cells.forEach((c, i) => { slide(c, Q(T('a1')) + i * 0.0625, { x: -70, d: 0.3, ease: 'power3.out' }); appear(cells.idx[i], Q(T('a1')) + i * 0.0625 + 0.1); if (i % 2 === 0) sfx('tick', Q(T('a1')) + i * 0.0625, { g: 0.7 }); });
  const tEnd = Math.round((T('a2') + 0.2) / BEAT) * BEAT;       // 结论的大字落在整拍上，配乐在这一拍抬起（tools/music.py 的 lift_cue）
  const say = txt(world, 't-1 ac', tr('结论', 'So'), 112, 560);
  slam(say, tEnd, { from: 1.2, d: 0.4 }); sfx('thud', tEnd);
  sfx('pop', Q(Tend('a1')), { g: 0.6 }); sfx('blip', s.start + 0.15, { g: 0.6 }); sfx('chime', tEnd + 0.5, { g: 0.6 });
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [s.start + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [s.start + 1.0, { z: 1.04 }, s.end - s.start - 1.1, { ease: 'none', sfx: false }],
  ]);
});
