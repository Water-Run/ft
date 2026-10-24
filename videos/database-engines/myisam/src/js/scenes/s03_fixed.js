// 03 数据文件：定长行。主画面：users.MYD 的 128 个字节。先按一行 32 个原样倒出来（文件就是一串字节），
// 讲到「每十六个字节是一行」时重新排成一行 16 个；再逐段标出字段，用 N × 16 直接跳到第 5 行，最后 alice 的年龄原地改写。
// 字节取自 snap_01_create（FACTS「03」）；改年龄只改最后一个字节，依据 mi_statrec.c 与 9.7.4 实测（FACTS「新版扩充」c13–c14）。
scene('s3', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const bytes = R.usersMYD[0].match(/../g);
  const X = 200, Y = 270, OFFW = 118, RH = 58, CW = 54, CW32 = 42;
  const p32 = (i) => ({ x: X + OFFW + (i % 32) * CW32, y: Y + Math.floor(i / 32) * RH });
  const p16 = (i) => ({ x: X + OFFW + (i % 16) * CW, y: Y + Math.floor(i / 16) * RH });

  // 文件名与大小
  const head = h('div', 'abs mono', world, 'users.MYD'); px(head, X, 146); css(head, { fontSize: '40px', color: '#F29111' });
  const size = h('div', 'abs mono', world, '0'); px(size, X + 250, 152); css(size, { fontSize: '34px', color: '#8a8a8a' });
  const sizeU = h('div', 'abs mono', world, '字节'); px(sizeU, X + 330, 152); css(sizeU, { fontSize: '34px', color: '#8a8a8a' });
  wipe(head, c0 + 0.1, { dir: 'l', d: 0.4 }); appear(size, T('c2', '128') - 0.6); appear(sizeU, T('c2', '128') - 0.6);
  countTo(size, 0, 128, T('c2', '128') - 0.6, 0.7, (v) => String(Math.round(v)));
  sfx('tick', T('c2', '128'), { g: 0.5 });

  // 字节：先一行 32 个倒出来，讲到「一行」时重排成一行 16 个
  const tFlow = T('c4', '十六') - 0.2;
  const cells = bytes.map((b, i) => {
    const e = h('div', 'abs mono', world, b); css(e, { width: '44px', textAlign: 'center', fontSize: '30px', lineHeight: RH + 'px' });   // 字色由类名给（字段上色时换类名）
    const a = p32(i), z = p16(i);
    fromTo(e, tFlow + Math.floor(i / 16) * 0.06, { left: a.x, top: a.y }, { left: z.x, top: z.y, duration: 0.8, ease: 'power3.inOut' });
    return e;
  });
  const tPour = T('c1') + 0.1;
  for (let r = 0; r < 4; r++) cells.slice(r * 32, r * 32 + 32).forEach((e) => appear(e, tPour + r * 0.12));
  sfx('drive', tPour, { g: 0.6 });
  const off32 = [0, 1, 2, 3].map((r) => { const e = h('div', 'abs mono', world, off4(r * 32)); px(e, X, Y + r * RH); css(e, { fontSize: '26px', lineHeight: RH + 'px', color: '#808080' }); appear(e, tPour + r * 0.12); vanish(e, tFlow); return e; });
  const off16 = [...Array(8)].map((_, r) => { const e = h('div', 'abs mono', world, off4(r * 16)); px(e, X, Y + r * RH); css(e, { fontSize: '26px', lineHeight: RH + 'px', color: '#808080' }); appear(e, tFlow + 0.5 + r * 0.06); return e; });
  sfx('whoosh', tFlow, { g: 0.35 }); sfx('tick', tFlow + 0.8, { g: 0.5 });

  // 从第一个字节开始就是数据：没有文件头
  const r0 = ring(world, { x: p32(0).x - 4, y: Y - 2, w: CW32 + 4, h: RH + 4 });
  appear(r0, T('c2', '没有') - 0.1); sfx('pop', T('c2', '没有'), { g: 0.5 });
  vanish(r0, tFlow - 0.1);

  // 字段：标志 1 + id 4 + 名字 10 + 年龄 1
  const FIELDS = [['标志', 0, 0, 'c5', '标志'], ['id = 1', 1, 4, 'c6', '四个'], ['名字 alice', 5, 14, 'c7', '名字'], ['年龄 30', 15, 15, 'c8', '年龄']];
  const COLS = { 0: '#b4b4b4', 1: '#3fb4cc', 5: '#d9d9d9', 15: '#a6d36b' };
  FIELDS.forEach(([name, a, b, cue, word]) => {
    const t_ = T(cue, word) - 0.15, l = p16(a).x - 3, w = (b - a + 1) * CW - 6;
    const br = h('div', 'abs', world); px(br, l, Y - 22, w, 14); css(br, { border: '2px solid ' + COLS[a], borderBottom: '0' });
    const lb = h('div', 'abs', world, name); px(lb, a === 0 ? l - 30 : l, Y - 70); css(lb, { font: '500 30px "Sans SC"', color: COLS[a] });   // 「标志」比它那一格宽，往左挪，免得压到 id
    wipe(br, t_, { dir: 'l', d: 0.35 }); appear(lb, t_ + 0.1); sfx('tick', t_, { g: 0.5 });
    // 这一段在每一行里都上色
    for (let r = 0; r < 8; r++) for (let c = a; c <= b; c++) { const i = r * 16 + c; keyed(cells[i]).at(t_ + 0.05 + r * 0.03, { cls: 'abs mono ' + userCls(c, bytes[i]) }); }
  });
  // 四段的含义就写在各段的括号标签上（标志、id = 1、名字 alice、年龄 30），字节下面不再另写一遍旁白

  // 每行都是 16 字节：定长格式；右边逐行解码
  const decs = rowsOf(R.usersMYD[0]).map(decodeUser).map((u, r) => { const e = h('div', 'abs mono', world, `${String(u.id).padStart(2)}  ${u.name.padEnd(6)} ${u.age}`); px(e, X + OFFW + 16 * CW + 40, Y + r * RH); css(e, { fontSize: '30px', lineHeight: RH + 'px', color: r === 0 ? '#F29111' : '#8a8a8a' }); appear(e, T('c9') + r * 0.06); return e; });
  const lens = [...Array(8)].map((_, r) => { const e = h('div', 'abs mono', world, '16'); px(e, X + OFFW + 16 * CW + 330, Y + r * RH); css(e, { fontSize: '30px', lineHeight: RH + 'px', color: '#3fb4cc' }); appear(e, T('c9', '长度') + r * 0.06); return e; });
  sfx('blip', T('c9'), { g: 0.4 });
  const fixedL = h('div', 'abs t-big', world, '定长格式'); px(fixedL, X + OFFW + 16 * CW + 250, Y - 82); css(fixedL, { color: '#F29111' });
  show(fixedL, T('c9', '定长') - 0.1, { y: 12, d: 0.4 }); sfx('thud', T('c9', '定长'), { g: 0.45 });

  // 第 N 行的位置 = N × 16：光标直接跳到第 5 行
  const fx = X + OFFW + 16 * CW + 40;
  const f1 = h('div', 'abs mono', world, '第 5 行 → 5 × 16 = 80 = 0x50'); px(f1, fx, Y + 8 * RH + 30); css(f1, { fontSize: '36px', color: '#F29111' });
  const cur = ring(world, { x: X - 12, y: Y - 2, w: OFFW + 16 * CW + 6, h: RH + 4 });
  const tJ = T('c11', '乘以') + 0.3;
  appear(cur, T('c11') - 0.1);
  fromTo(cur, tJ, { y: 0 }, { y: 5 * RH, duration: 0.5, ease: 'power3.inOut' });
  typeText(f1, '第 5 行 → 5 × 16 = 80 = 0x50', T('c11', '第') + 0.1, 24, { cursor: false, sfxGain: 0.4 });
  sfx('pop', tJ + 0.5, { g: 0.6 });
  classAt(off16[5], 'c-o', tJ + 0.4, T('c13') - 0.3); classAt(decs[5], 'c-o', tJ + 0.4, T('c13') - 0.3);
  classAt(f1, 'c-t', T('c12', '乘法') - 0.1, T('c13', '新的') - 0.6); sfx('chime', T('c12', '乘法'), { g: 0.45 });   // 「一次乘法」：算式本身亮一下
  hide([f1], T('c13', '新的') - 0.6, { y: 0, d: 0.3 });   // 镜头推近前收起（推近后它会落到字幕栏下面）
  fromTo(cur, T('c13') - 0.2, { y: 5 * RH }, { y: 0, duration: 0.5, ease: 'power3.inOut', immediateRender: false });

  // 改一行：新的一行写回原来的位置；alice 过生日，只有年龄那个字节变了
  const nb = bytes.slice(0, 16).slice(); nb[15] = '1f';
  const ghost = h('div', 'abs', world); px(ghost, X + OFFW, Y - 150, 16 * CW, RH);
  nb.forEach((b, c) => { const e = h('div', 'abs mono ' + userCls(c, b), ghost, b); px(e, c * CW, 0, 44, RH); css(e, { textAlign: 'center', fontSize: '30px', lineHeight: RH + 'px', background: '#111214', outline: '2px solid #F29111' }); });
  const tW = T('c13', '新的') - 0.2;
  hide([head, size, sizeU], T('c13') - 0.4, { y: 0, d: 0.3 });   // 让出上方给新的一行
  show(ghost, T('c13', '改一') - 0.1, { y: -20, d: 0.4 });
  fromTo(ghost, tW, { y: 0 }, { y: 150, duration: 0.6, ease: 'power3.in' });
  vanish(ghost, tW + 0.62); sfx('thud', tW + 0.6, { g: 0.6 });
  keyed(cells[15]).at(tW + 0.6, { html: '1f', cls: 'abs mono f-hot' }).at(tW + 1.2, { cls: 'abs mono f-age' });
  keyed(decs[0]).at(tW + 0.6, { html: ' 1  alice  31' });
  const ar = ring(world, { x: p16(15).x - 5, y: Y - 4, w: 52, h: RH + 8 });
  appear(ar, T('c14', '年龄') - 0.2);
  const delta = h('div', 'abs mono', world, '1e → 1f　30 → 31'); px(delta, X + OFFW + 560, Y + 8 * RH + 14); css(delta, { fontSize: '30px', color: '#F29111', background: '#0b0b0c', padding: '0 6px' });
  slide(delta, T('c14', '年龄'), { y: -14, d: 0.4 }); sfx('pop', T('c14', '年龄'), { g: 0.55 });
  // 其余 15 个字节不变：同一行的其余字节淡一下，只剩年龄那一格亮着
  fromTo(cells.slice(0, 15), T('c14', '只有') - 0.1, { opacity: 1 }, { opacity: 0.35, duration: 0.3, ease: 'power1.out', immediateRender: false });   // 这些格子的类名由 keyed 管，淡化用补间

  track(cam, s.start, { x: 960, y: 520, z: 1 }, [
    [c0 + 0.1, { z: 1.02 }, T('c4') - c0 - 0.6, { ease: 'none', sfx: false }],
    [T('c5') - 0.4, { x: 760, y: 500, z: 1.42 }, 1.0, { g: 0.4 }],   // 中心放低：下面那行注释要留在字幕栏上方
    [null, { x: 800, z: 1.45 }, Tend('c8') - T('c5') - 0.8, { ease: 'none', sfx: false }],
    [Tend('c8') + 0.15, { x: 960, y: 520, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.02 }, T('c13') - Tend('c8') - 1.2, { ease: 'none', sfx: false }],
    [T('c13', '新的') - 0.6, { x: 860, y: 430, z: 1.18 }, 1.0, { g: 0.4 }],
    [null, { z: 1.22 }, s.end - T('c13') - 1.4, { ease: 'none', sfx: false }],
  ]);
});
