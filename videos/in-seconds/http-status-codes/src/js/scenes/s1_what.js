// 它是什么：状态码在响应的第一行；首位数字定类别。
// 主画面：五格的「类别架」。实验里测到的码一开始就整组摆在各自那一格里（F22），旁白念到哪一类，哪一格的灯亮、名字刷出来；
// 最后一个陌生的 471 从回显里出来，只看首位，落进 4xx 那一格，与 400 一起亮。
const CLASSES = [
  { d: '1', zh: '处理中', en: 'working', codes: ['100'] },
  { d: '2', zh: '成功', en: 'success', codes: ['200', '201', '204'] },
  { d: '3', zh: '重定向', en: 'redirect', codes: ['301', '302', '304'] },
  { d: '4', zh: '请求有错', en: 'bad request', codes: ['400', '401', '403', '404', '405', '429'] },
  { d: '5', zh: '服务端故障', en: 'server failure', codes: ['500', '502', '503', '504'] },
];
scene('what', ({ root, s }) => {
  const world = h('div', 'world', root);
  css(world, { width: '4000px' });
  const cam = makeCamera(world, 1920, VH);

  // ── 第一站：404 的完整回显（第一帧就在，换场推进来时屏上已经有字） ──
  const e4 = E('404');
  const scr = screen(world, 120, 150, 980, 640, tr('响应', 'response'));
  addLine(scr, '<span class="dima">$ </span>' + esc(e4.cmd), 44, 36, 28, 'dim');
  const first = addLine(scr, esc(e4.status[0]), 44, 96, 50);
  const heads = e4.head.map((x, i) => addLine(scr, esc(x), 44, 176 + i * 40, 30, 'dim'));
  addLine(scr, esc(e4.body[0]), 44, 176 + heads.length * 40 + 24, 30);
  const tFirst = Q(T('w1') + 0.1);
  classAt(first, 'hot', tFirst);
  sfx('tick', tFirst, { g: 0.7, p: -0.4 });
  const lab1 = addLine(scr, '← ' + tr('第一行', 'first line'), 44 + 22 * 30 + 40, 100, 42);
  css(lab1, { fontFamily: '"Sans SC", "Inter"', fontWeight: 800 });
  wipe(lab1, tFirst + 0.1, { dir: 'l', d: 0.3 });
  // 首位：右边一个点阵的 404，后两位暗下去，只留首位
  const D = 34, big = dots(world, '404', 1220, 230, D, C.red, { name: '404' });
  const uline = blk(world, 'bg-amber', 1220, 230 + big.h + 26, 5 * D, 14);
  const tDig = Q(T('w1', { zh: '首位', en: 'digit' }) - 0.1);
  scanIn(big, s.start + 0.05, 0.02); appear(big.el, s.start);
  F((t) => { const k = clamp((t - tDig) / 0.3); const op = (1 - 0.75 * ease.out3(k)).toFixed(3); big.chars[1].style.opacity = op; big.chars[2].style.opacity = op; });
  fromTo(uline, tDig, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' });
  sfx('pop', tDig, { g: 0.7, p: 0.3 });

  // ── 第二站：五格的类别架 ──
  const BX = 2032, BW = 320, BG = 24, BY = 150;
  const bays = CLASSES.map((c, i) => {
    const x = BX + i * (BW + BG), err = +c.d >= 4;
    const m = h('div', 'mach', world); px(m, x, BY, BW, 650); m.dataset.name = c.d + 'xx';
    const plate = blk(world, 'bg-ink', x, BY, BW, 150);
    const dm = dots(world, c.d + 'xx', x + 24, BY + 22, 15, err ? C.red : C.amber, { name: c.d + 'xx' });
    const lp = led(world, x + BW - 54, BY + 26, 30);
    const name = txt(world, 'ink', tr(c.zh, c.en), x + 24, BY + 172);
    css(name, { font: `800 ${LANG === 'zh' ? 44 : 38}px/1.1 "Sans SC", "Inter"`, width: (BW - 40) + 'px', whiteSpace: 'normal' });
    const chips = c.codes.map((k, j) => chip(world, k, x + 24 + (j % 2) * 146, BY + 270 + Math.floor(j / 2) * 96, 128, 76, 72));
    return { x, m, plate, dm, lp, name, chips, c };
  });
  // 码整组到位：念到「五类」时，二十个码一齐落进各自的格
  const tSort = Q(T('w1', { zh: '五类', en: 'class' }) - 0.2);
  bays.forEach((b, i) => b.chips.forEach((e, j) => slam(e, tSort + 0.05 + i * 0.06 + j * 0.03, { from: 1.4, d: 0.28 })));
  sfx('drive', tSort, { g: 0.6 });
  // 逐类点名：灯亮、名字变墨色
  const tName = CLASSES.map((c, i) => Q(T(i < 3 ? 'w2' : 'w3', c.d + 'xx') - 0.05));
  bays.forEach((b, i) => {
    const err = +b.c.d >= 4;
    classAt(b.lp, err ? 'eon' : 'on', tName[i]);
    wipe(b.name, tName[i] + 0.05, { dir: 'l', d: 0.3 });
    fromTo(b.plate, tName[i], { scaleY: 1 }, { keyframes: [{ scaleY: 1.06, duration: 0.08 }, { scaleY: 1, duration: 0.25 }], transformOrigin: '50% 0%', immediateRender: false });
    sfx('beep', tName[i], { g: 0.55, p: -0.6 + i * 0.3 });
    meter(tName[i], b.c.codes[0]);
  });

  // ── 陌生码：471 从回显里出来，只看首位 ──
  const e471 = E('471');
  const SY2 = 820, s2 = screen(world, BX, SY2, 1010, 140, tr('回显', 'echo'));
  addLine(s2, '<span class="dima">$ </span>' + esc(e471.cmd), 34, 18, 28, 'dim');
  const st471 = addLine(s2, esc(e471.status[0]), 34, 68, 44);
  const tU = Q(T('w4') - 0.15);
  wipe(s2, tU, { dir: 'l', d: 0.35 }); sfx('blip', tU, { g: 0.6 });
  const b4 = bays[3], ROW4 = BY + 270 + 3 * 96, c471 = chip(world, '471', b4.x + 24, SY2 + 32, 128, 76, 72);
  const tDrop = Q(T('w4', { zh: '首位', en: 'digit' }) - 0.1);
  appear(c471, tU + 0.35);
  fromTo(c471, tU + 0.35, { x: BX + 640 - (b4.x + 24) }, { x: 0, duration: 0.5, ease: 'power3.out', immediateRender: false });
  fromTo(c471, tDrop, { y: 0 }, { y: ROW4 - (SY2 + 32), duration: 0.45, ease: 'back.out(1.6)', immediateRender: false });
  sfx('pop', tDrop + 0.1, { g: 0.7, p: 0.3 });
  meter(tDrop, '471');
  const t400 = Math.min(Q(T('w4', '400') - 0.05), Q(Tend('w4') - 1.2));
  lightChip(c471, t400); lightChip(b4.chips[0], t400);
  const eq = txt(world, 't-4 ink', tr('当 400', 'as 400'), b4.x + 24 + 146, ROW4 + 14);
  wipe(eq, t400, { dir: 'l', d: 0.3 });
  sfx('chime', t400, { g: 0.6, p: 0.3 });
  meter(t400, '400');

  // 镜头：第一站慢推 → 摇到类别架 → 推向下方的 471
  const tPan = Math.max(tDig + 0.9, tSort - 0.75);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [
    [s.start + 0.3, { z: 1.03 }, Math.max(0.3, tPan - s.start - 0.35), { ease: 'none', sfx: false }],
    [tPan, { x: 2880, y: 470, z: 1 }, 1.0, { g: 0.45 }],
    [tPan + 1.1, { z: 1.02 }, Math.max(0.3, tU - tPan - 1.25), { ease: 'none', sfx: false }],
    [tU, { y: 500, z: 1.0 }, 0.9, { sfx: false }],
    [tU + 1.0, { x: 2930 }, Math.max(0.3, s.end - tU - 0.9), { ease: 'none', sfx: false }],
  ]);
});
