// 示范场景（约 10 秒）：选定的「内存条」方向在运动中的样子——方块按十六分音符落位（分配）、金线扫过（收集器）、
// 数字按拍跳、镜头先推后拉。正片的开场 src/js/scenes/s0_open.js 就是按这段的做法铺开的。
// 用法：把它加进 src/index.html（放在各场景之后），并把某一场的场景号改成 'demo' 即可预览；正片不加载本文件。
scene('demo', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const P = 60, COLS = 24, ROWS = 12;
  const sv = board(world, 0, 0, COLS * P, ROWS * P);
  gridLines(sv, 0, 0, COLS, ROWS, P);
  const FL = field(board(world, 0, 0, COLS * P, ROWS * P), 0, 0, COLS, ROWS, P, 50);
  const t0 = qn(c0 + 0.3), tSw = qn(t0 + 4), SWD = 1.2;
  // 分配：每个十六分音符落下一批方块（行优先，就是「指针往后挪」的顺序）
  F((t) => FL.cells.forEach((c, k) => {
    const tb = t0 + Math.floor(k / 12) * (BEAT / 4), ts = tSw + SWD * (c.cx / (COLS * P));
    if (t < tb) return c.set({ k: 0 });
    const dead = (k * 7) % 10 < 4;
    if (dead && t >= ts) { const u = (t - ts) / 0.2; return c.set(u < 1 ? { fill: C.gold, k: 1 - u } : { k: 0 }); }
    c.set({ fill: dead && t >= tSw - 0.6 ? C.white : C.ink, st: dead && t >= tSw - 0.6 ? C.white : null, k: Math.min(1, (t - tb) / 0.1) });
  }));
  const bar = h('div', 'abs', world); css(bar, { background: C.gold, width: '24px', height: ROWS * P + 'px', top: '0px' });
  FR(tSw - 0.1, tSw + SWD + 0.1, (t) => { vis(bar, t >= tSw && t < tSw + SWD); ss(bar, 'left', (COLS * P * clamp((t - tSw) / SWD) - 12).toFixed(1) + 'px'); });
  const n = tx(ui, 'big', '0', 112, 760, { size: 120, bg: C.field, pad: '0 18px 8px' });
  stepCount(n, t0, t0 + 3.2, 0, FL.n);
  for (let k = 0; k < 8; k++) sfx('tick', t0 + k * BEAT / 2, { g: 0.3 });
  sfx('whoosh', tSw, { g: 0.5 }); sfx('chime', tSw + SWD, { g: 0.5 });
  cam.track(s.start, { x: 720, y: 360, z: 1.6 }, [
    [t0, { z: 1.0 }, 3.0, { ease: 'power2.inOut', sfx: false }],
    [tSw - 0.4, { x: 760, z: 1.08 }, 1.0, { ease: 'power3.inOut', sfx: false }],
  ]);
});
