// 收束：三句话各对应一栏——位置（页与槽、记录号）、版本（记录头与回溯、事务状态）、提交（页面依赖、清单页）。
// 主画面：三栏并排，像官网文档的三个条目，讲到哪栏，哪栏的标题被选中；每栏里是前面各章主画面的缩样。
scene('outro', ({ root, s }) => {
  const { world, under, over } = stage(root, 1920, 1080);
  const cam = makeCamera(world);
  const P = FB.page_map.clean_after.data_page_231;
  const cols = [['位置', 120], ['版本', 700], ['提交', 1280]];
  const heads = cols.map(([t_, x]) => blk(world, 'chip g', `<span class="ar lat" style="font-weight:700;margin-right:16px">→</span>${t_}`, x, 200, 520, 84, { fontSize: '40px', fontWeight: 700, justifyContent: 'flex-start', paddingLeft: '26px' }));
  const panels = cols.map(([, x]) => blk(world, '', '', x, 300, 520, 560, { outline: '3px solid ' + C.g2, outlineOffset: '-3px' }));
  const t0 = s.start + 0.1;
  heads.forEach((e, i) => wipe(e, t0 + i * 0.12, { dir: 'l', d: 0.4 }));
  panels.forEach((e, i) => wipe(e, t0 + 0.1 + i * 0.12, { dir: 't', d: 0.45 }));
  sfx('pop', t0 + 0.1, { g: 0.4, p: -0.5 }); sfx('pop', t0 + 0.34, { g: 0.4, p: 0.5 });
  // 栏 1：索引 → 记录号 0 → 页 231 · 0 号槽
  const a1 = blk(world, 'chip w', '<span class="mono" style="font-size:30px;margin-right:20px">alice</span>→ 记录号 0', 150, 340, 460, 74, { fontSize: '30px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
  const a2 = blk(world, 'chip ink lat', '页 231 · 0 号槽', 150, 470, 460, 74, { fontSize: '32px' });
  const a3 = blk(world, 'chip cur-rec lat', `偏移 ${P.slots[0].offset}`, 150, 600, 460, 74, { fontSize: '32px' });
  const l1 = arrow(over, [[380, 414], [380, 462]], 'ink'), l2 = arrow(over, [[380, 544], [380, 592]], 'ink');
  // 栏 2：记录头（事务 11 · 回溯 231/8）→ 历史版本；事务状态 → 可见性
  const b1 = blk(world, 'chip cur-rec lat', '记录头 · 事务 11', 730, 340, 460, 74, { fontSize: '32px', outline: '4px solid ' + C.fire, outlineOffset: '-4px' });
  const b2 = blk(world, 'chip hist-rec lat', '回溯 → 8 号槽 · 差量', 730, 470, 460, 74, { fontSize: '32px' });
  const b3 = blk(world, 'chip sel', '状态 11：已提交 → 可见', 730, 600, 460, 74, { fontSize: '30px' });
  const m1 = arrow(over, [[960, 414], [960, 462]], 'teal'), m2 = arrow(over, [[960, 544], [960, 592]], 'ink');
  // 栏 3：① 修改的页 ② 指向它的页 / 清单页
  const c1 = blk(world, 'chip w', '<b class="lat" style="margin-right:16px">①</b>先写被指向、被修改的页', 1310, 340, 460, 74, { fontSize: '28px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
  const c2 = blk(world, 'chip w', '<b class="lat" style="margin-right:16px">②</b>再写指针页', 1310, 470, 460, 74, { fontSize: '28px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
  const c3 = blk(world, 'chip ink', '<b class="lat" style="margin-right:16px">③</b>清单页记下已提交', 1310, 600, 460, 74, { fontSize: '28px' });
  const n1 = arrow(over, [[1540, 414], [1540, 462]], 'ink'), n2 = arrow(over, [[1540, 544], [1540, 592]], 'ink');
  const tZ1 = T('z1'), tZ2 = T('z2'), tZ3 = T('z3');
  const step = (els, ars, t) => { els.forEach((e, i) => wipe(e, t + i * 0.35, { dir: 'l', d: 0.35 })); ars.forEach((a, i) => drawIn(a, t + 0.2 + i * 0.35, 0.2)); };
  step([a1, a2, a3], [l1, l2], tZ1 - 0.2); step([b1, b2, b3], [m1, m2], tZ2 - 0.2); step([c1, c2, c3], [n1, n2], tZ3 - 0.2);
  classAt(heads[0], 'sel', tZ1 - 0.2, tZ2 - 0.2); classAt(heads[1], 'sel', tZ2 - 0.2, tZ3 - 0.2); classAt(heads[2], 'sel', tZ3 - 0.2, s.end);
  sfx('tick', tZ1 - 0.2, { g: 0.5, p: -0.6 }); sfx('tick', tZ2 - 0.2, { g: 0.5 }); sfx('tick', tZ3 - 0.2, { g: 0.5, p: 0.6 });
  sfx('chime', T('z3', '提交'), { g: 0.6 });
  cam.track(s.start, { x: 960, y: 540, z: 1.04 }, [[s.start + 0.1, { z: 1 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
