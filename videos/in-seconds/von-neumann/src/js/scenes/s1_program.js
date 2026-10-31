// 存储程序：这就叫存储程序（b1）→ 一排编号的格子（b2）→ 前几格放步骤＝指令（b3）→ 后几格放数＝数据（b4）
// → 指令也写成 0 和 1：放大第 1 格与第 8 格，字一个个换成 0 和 1（b5）。末态（全图、九格已填）即下一场的初态。
scene('program', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ov = overlay(world);
  const M = machine(world, {});
  M.rows.forEach((r) => hide0(r.el)); hide0(M.pc);

  // 镜头：推近存储器；讲完 0 和 1 后退回全图
  const tBack = Q(s.end - 1.25);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.05, { x: 1330, y: 480, z: 1.25 }, 1.0, { g: 0.4 }], [tBack, { x: 960, y: 484, z: 1 }, 1.0, { g: 0.4 }]]);

  // b1：盖章「存储程序」
  const stamp = h('div', 'stamp', world, tr('存储程序', 'STORED PROGRAM')); px(stamp, 1664, 150); stamp.dataset.gloss = '存储程序';
  const tStamp = Q(T('b1', '存储'));
  slam(stamp, tStamp, { from: 1.6, d: 0.35, ease: 'power4.out' }); sfx('thud', tStamp);
  hide(stamp, Q(T('b5')) - 0.1, { d: 0.3 });
  // 推近时运算器的「+ − × ÷」在画面边上，先收起，退回全图时再出来
  to(M.ops, s.start + 0.05, { opacity: 0, duration: 0.3 }); to(M.ops, tBack + 0.3, { opacity: 1, duration: 0.4 });

  // b2：纸带先挪到存储器右边排队，格子一格一格画出来
  const tAside = Q(T('b2')), tRows = tAside + 0.45;
  M.rows.forEach((r, k) => { const t = tRows + k * 0.2; appear(r.el, t); fromTo(r.line, t, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'power2.out' }); slam(r.n, t, { from: 1.5, d: 0.3 }); if (k % 2 === 0) sfx('tick', t, { g: 0.5, p: 0.5 }); });
  // b3、b4：先标出区域，读到「步骤」「数」时纸带落进各自的格，落下的同时格子里出现内容
  const zone = (r0, n, col) => { const z = frameBox(world, 1104, rowY(r0) + 2, 532, n * ROW.h - 4, col, 3); z.style.background = col === 'var(--blue)' ? 'var(--blue9)' : 'var(--ochre8)'; hide0(z); return z; };
  const zI = zone(1, 4, 'var(--blue)'), zD = zone(5, 5, 'var(--ochre)');
  const tZI = Q(T('b3', '前')), tLandI = Q(T('b3', '步骤')), tZD = Q(T('b4', '后')), tLandD = Q(T('b4', '数'));
  wipe(zI, tZI, { dir: 't', d: 0.4 }); wipe(zD, tZD, { dir: 't', d: 0.4 }); sfx('tick', tZI, { g: 0.5, p: 0.4 }); sfx('tick', tZD, { g: 0.5, p: 0.4 });
  const labI = txt(world, 't-4 blue', tr('指令', 'Instructions'), 1664, rowY(2) + 20), labD = txt(world, 't-4 ochre', tr('数据', 'Data'), 1664, rowY(7) - 10);
  labI.dataset.gloss = '指令'; labD.dataset.gloss = '数据';
  slam(labI, Q(T('b3', '指令')), { from: 1.3, d: 0.3 }); slam(labD, Q(T('b4', '数据')), { from: 1.3, d: 0.3 });
  sfx('pop', Q(T('b3', '指令')), { g: 0.7, p: 0.6 }); sfx('pop', Q(T('b4', '数据')), { g: 0.7, p: 0.6 });
  PILE.forEach(([kind, x, y, r], k) => {
    const isI = kind === 'i', j = isI ? k : k - 4, row = isI ? j + 1 : j + 5;
    const bits = isI ? PROG.calc[j][0] : DATA[j][0];
    const tp = tape(world, bits, kind);
    const qx = 1664, qy = isI ? 250 + j * 52 : 470 + j * 52;             // 右边排队的位置（数据纸带在下半段）
    const tl0 = (isI ? tLandI : tLandD) + j * 0.15, [rx, ry] = rowTape(row);
    mover(tp, [[s.start, x, y, { r }], [tAside, x, y, { r }], [tAside + 0.5, qx, qy, { s: 0.72 }], [tl0, qx, qy, { s: 0.72 }], [tl0 + 0.55, rx, ry, { s: 0.92 }]], tl0 + 0.56);
    M.setRow(row, tl0 + 0.56, bits, isI ? PROG.calc[j][1] : DATA[j][1], kind);
    sfx('tick', tl0 + 0.55, { g: 0.45, p: 0.4 });
  });
  sfx('drive', tAside, { g: 0.5, p: 0.4 });

  // b5：放大卡片：第 1 格「加 第8格」、第 8 格「5」，字一个一个换成 0 和 1，下面注明对应关系，然后停住
  const tCard = Q(T('b5')), tConv = Q(T('b5', '写成'));
  [zI, zD, labI, labD].forEach((e) => hide(e, tCard - 0.1, { d: 0.3 }));
  const card = h('div', 'sheet', world); px(card, 600, 470, 480, 380); card.dataset.name = '放大的两格';
  const cov = overlay(world);
  const lk1 = path(cov, `M1104,${rowY(1) + 34} C900,${rowY(1) + 34} 1000,530 1080,530`, 'red', { w: 3, dashed: '8 8' });
  const lk8 = path(cov, `M1104,${rowY(8) + 34} C1090,${rowY(8) + 34} 1090,690 1080,690`, 'red', { w: 3, dashed: '8 8' });
  wipe(card, tCard, { dir: 'l', d: 0.45 }); arrowIn(lk1, tCard + 0.3, 0.45); arrowIn(lk8, tCard + 0.4, 0.45); sfx('pop', tCard, { g: 0.6 });
  const tag = (y, t) => { const e = txt(card, 'type', t, 24, y); e.style.fontSize = '24px'; return e; };
  tag(18, tr('第 1 格 · 指令', 'CELL 1 · INSTRUCTION')); tag(178, tr('第 8 格 · 数据', 'CELL 8 · DATA'));
  // 每个「词」一个槽：先是人读的写法，到时刻换成 0 和 1，旧字往上淡出、新字从下面上来
  const word = (x, y, a, b, col, t) => {
    const A = txt(card, 'ttl', a, x, y), B = txt(card, 'mono', b, x, y + 8);
    css(A, { fontSize: '56px', color: col }); css(B, { font: '700 52px "Mono"', color: col, letterSpacing: '.06em' });
    to(A, t, { y: -30, opacity: 0, duration: 0.45, ease: 'power2.in' });
    fromTo(B, t + 0.25, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', immediateRender: true });
    sfx('beep', t + 0.25, { g: 0.45 });
    return [A, B];
  };
  word(24, 56, tr('加', 'ADD'), '0001', 'var(--blue)', tConv);
  word(200, 56, tr('第8格', 'cell 8'), '1000', 'var(--blue)', tConv + 0.55);
  word(24, 216, '5', '0000 0101', 'var(--ochre)', tConv + 1.1);
  const legend = h('div', 'abs soft', card, [tr('加', 'ADD') + ' → 0001', '8 → 1000', '5 → 0101'].map((x) => `<span style="font:600 26px 'Mono', 'Serif SC'">${x}</span>`).join(''));
  px(legend, 24, 318, 432); css(legend, { display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--ink22)', paddingTop: '8px' });
  hide0(legend); appear(legend, tConv + 1.7); sfx('tick', tConv + 1.7, { g: 0.5 });
  // 存储格里的这两行也闪一下红框：格子里存的就是这些 0 和 1
  [1, 8].forEach((r, k) => { const f = frameBox(world, 1104, rowY(r) + 2, 532, ROW.h - 4); hide0(f); appear(f, tConv + 0.55 * k + 0.3); vanish(f, tBack - 0.1); });
  exit(card, tBack - 0.3, { x: -40, d: 0.35 }); to(cov, tBack - 0.3, { opacity: 0, duration: 0.3 });
});
