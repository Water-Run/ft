// 场景 end：结尾（无章节卡）。整屏墨色底。
// 站点一（x=0）：1981 与 2026 之间的琥珀条 + 45 年；软盘；开场那张 hello.bat 与它的输出。
// 站点二（x=+2400）：片尾帧（片名的版式 + 两行说明）。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);
  const INK = 'var(--paper)';

  // ══════════ 站点一：45 年 ══════════
  const bg = h('div', 'blk ink', world); px(bg, 0, 0, 1920, 968);
  const y81 = h('div', 'y-pixel nowrap abs', world, '1981'); px(y81, 96, 560); css(y81, { fontSize: '150px', color: INK });
  const y26 = h('div', 'y-grot nowrap abs', world, '2026'); px(y26, 1450, 560); css(y26, { fontSize: '150px', color: INK });
  const bar = h('div', 'blk', world); px(bar, 420, 620, 0, 30);
  const n45 = h('div', 'n-grot abs', world, '45'); px(n45, 700, 230); css(n45, { fontSize: '220px', color: INK });
  const yr = h('div', 't-h2 nowrap abs', world, '年'); px(yr, 1000, 420); css(yr, { color: INK });
  const fl = h('div', 'floppy paper', world); fl.dataset.name = '软盘'; px(fl, 96, 110, 200, 200);
  h('div', 'hub', fl); h('div', 'slot', fl);
  const flCap = h('div', 't-h2 nowrap abs', world, '为软盘时代设计'); px(flCap, 96, 360); css(flCap, { color: INK });
  const sh = h('div', 'sheet', world); px(sh, 1240, 120, 580);
  h('div', 'name', sh, 'hello.bat');
  h('div', 'ln', sh, 'echo hello').dataset.n = 1;
  const sl = h('div', 'slab now', world); px(sl, 1240, 360, 580);
  h('div', 'hd', sl, 'Windows 11 · cmd.exe');
  const hRow = h('div', 'row', sl, 'hello');

  appear(bg, T('f1') - 0.39); sfx('whoosh', T('f1') - 0.39, { g: 0.5 });
  growTo(bar, [[T('f1') - 0.19, 0], [T('f1') + 0.51, 1100]]);
  slam(y81, T('f1') - 0.19); sfx('thud', T('f1') - 0.19, { p: -0.4 });
  slam(y26, T('f1') - 0.04); sfx('thud', T('f1') - 0.04, { g: 0.8, p: 0.4 });
  slam(n45, T('f1', '四十五') - 0.1); sfx('thud', T('f1', '四十五') - 0.1);
  wipe(yr, T('f1', '四十五') + 0.25, { dir: 'l', d: 0.4 }); sfx('tick', T('f1', '四十五') + 0.25, { g: 0.5, p: -0.3 });
  slide(fl, T('f2', '软盘') - 0.25, { x: -900, d: 0.6 }); sfx('drive', T('f2', '软盘') - 0.25, { p: -0.4 });
  wipe(flCap, T('f2', '软盘') + 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('f2', '软盘') + 0.2, { p: -0.3 });
  wipe(sh, T('f3') - 0.5, { dir: 't', d: 0.5 }); sfx('whoosh', T('f3') - 0.5, { g: 0.5, p: 0.3 });
  wipe(sl, T('f3') - 0.35, { dir: 'b', d: 0.5 }); sfx('thud', T('f3') - 0.05, { g: 0.5, p: 0.3 });
  appear(hRow, T('f3', '双击') - 0.05); sfx('chime', T('f3', '双击') - 0.05, { g: 0.8, p: 0.4 });
  for (const e of [y81, y26, bar, n45, yr, fl, flCap, sh, sl, hRow]) vanish(e, 0);

  // ══════════ 站点二：片尾帧 ══════════
  const DX = 2400;
  const bg2 = h('div', 'blk ink', world); px(bg2, DX, 0, 1920, 968);
  const t1 = h('div', 't-hero nowrap abs', world, '古代来的'); px(t1, 96 + DX, 128); css(t1, { fontSize: '200px', color: INK });
  const t2 = h('div', 'abs', world, 'Shell'); px(t2, 88 + DX, 356); css(t2, { font: '900 270px/1 "Grot", "Sans SC"', letterSpacing: '-.045em', color: INK });
  const tl = h('div', 'blk', world); px(tl, 96 + DX, 690, 0, 8);
  const t3 = h('div', 't-h2 nowrap abs', world, 'Windows 批处理（.bat）'); px(t3, 96 + DX, 728); css(t3, { color: INK });
  const pr = h('div', 'n-pixel c-amber abs', world, 'A&gt;'); px(pr, 1080 + DX, 120); css(pr, { fontSize: '760px' }); pr.setAttribute('data-bleed', '');
  const ca = h('div', 'blk', world); px(ca, 1668 + DX, 208, 230, 420);
  F((t) => { const on = t >= T('fT') + 0.1 && Math.floor(t * 2) % 2 === 1; ca.style.opacity = on ? '1' : '0'; ca.style.visibility = on ? 'visible' : 'hidden'; });
  const ft2 = h('div', 't-note nowrap abs c-paper', world, '旁白为合成语音'); px(ft2, 96 + DX, 840);
  wipe(bg2, T('fT') - 0.35, { dir: 'b', d: 0.5 }); sfx('whoosh', T('fT') - 0.35);
  slam(t1, T('fT') + 0.15); sfx('thud', T('fT') + 0.15);
  slam(t2, T('fT') + 0.4); sfx('thud', T('fT') + 0.4, { g: 0.7 });
  fromTo(tl, T('fT') + 0.6, { width: '0px' }, { width: '520px', duration: 0.4, ease: 'power3.out' });
  appear(tl, T('fT') + 0.6); sfx('tick', T('fT') + 0.6, { g: 0.5 });
  wipe(t3, T('fT') + 0.75, { dir: 'l', d: 0.45 }); sfx('tick', T('fT') + 0.75, { g: 0.5 });
  slam(pr, T('fT') + 0.05, { from: 1.15 }); sfx('thud', T('fT') + 0.05, { g: 0.6, p: 0.4 });
  appear(ft2, T('fT') + 1.25); sfx('pop', T('fT') + 1.25, { g: 0.5, p: -0.3 });
  for (const e of [t1, t2, tl, t3, pr, ft2]) vanish(e, 0);

  // ── 镜头：站点一内三段慢移 → 片尾帧。每段首尾相接 ──
  camTrack(cam, s.start, { x: 960, y: 484, z: 1 }, [
    [T('f1') - 0.39, { x: 960, y: 480, z: 1.02 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 900, y: 470, z: 1.05 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 1060, y: 450, z: 1.06 }, 2.6, { ease: 'none', sfx: false }],
    [T('fT') - 0.48, { x: 960 + DX, y: 484, z: 1 }, 0.6],
    [null, { x: 980 + DX, y: 480, z: 1.05 }, 2.6, { ease: 'none', sfx: false }],
  ]);
});
