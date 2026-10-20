// 场景 s2：02 回显。
// 站点一（x=0）：今天的 cmd.exe —— 执行之前先把这条命令显示一遍；所以第一行常常是 @echo off。
// 站点二（x=+2400）：MS-DOS 1.25 的源码 —— 读入的批处理行被原样输出到屏幕。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('s2', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点一：echo_on.bat → echo_off.bat ══════════
  const sheet = h('div', 'sheet', world); px(sheet, 96, 150, 760);
  const name = h('div', 'name', sheet, 'echo_on.bat');
  const wrap = h('div', 'wrap', sheet); css(wrap, { height: '0px' });      // 被「顶」出来的那一行
  const lnNew = h('div', 'ln on', wrap, '@echo off'); lnNew.dataset.n = 1;
  const lnOld = h('div', 'ln', sheet, 'echo hello'); lnOld.dataset.n = 1;

  // 今天的屏幕：一块显示回显与输出，一块是关掉回显之后只剩输出
  const mkSlab = (n) => {
    const el = h('div', 'slab now', world); px(el, 1010, 150, 814);
    h('div', 'hd', el, 'Windows 11 · cmd.exe');
    const rs = Array.from({ length: n }, () => h('div', 'row', el));
    return { el, rs, set: (i, html) => { rs[i].innerHTML = html; } };
  };
  const slabA = mkSlab(3), slabB = mkSlab(1);
  const note = h('div', 't-note nowrap abs', world, '实测：Windows 11（10.0.26220）'); px(note, 1010, 560);

  const beam = h('div', 'blk', world); px(beam, 856, box(lnOld, world).y, 154, 54);
  const slabY = box(slabA.el, world).y;
  const tagEcho = tagAt(world, 'amber', '回显', 1500, slabY + box(slabA.rs[1], slabA.el).y + 4);
  const tagOut = tagAt(world, 'inv', '输出', 1500, slabY + box(slabA.rs[2], slabA.el).y + 4);

  // ── 站点一编排 ──
  wipe(sheet, c0 + 0.05, { dir: 't', d: 0.5 }); sfx('whoosh', c0 + 0.05);
  wipe(slabA.el, c0 + 0.2, { dir: 'b', d: 0.5 }); sfx('thud', c0 + 0.6, { g: 0.5, p: 0.3 });
  appear(note, c0 + 0.75); sfx('tick', c0 + 0.75, { g: 0.5, p: 0.4 });
  vanish(slabB.el, 0); vanish(beam, 0); vanish(tagEcho, 0); vanish(tagOut, 0);
  slabA.rs.forEach((r) => vanish(r, 0));
  slabA.set(1, '<span class="in">D:\\batlab&gt;echo hello</span>');
  slabA.set(2, 'hello');

  // b2：文件第 1 行被读到 → 光束 → 屏幕先回显命令，再输出结果
  const tB2 = T('b2', '每条') - 0.1;
  classAt(lnOld, 'on', tB2, T('b5') - 0.3);
  appear(beam, tB2); sfx('tick', tB2, { p: -0.3 });
  appear(slabA.rs[1], T('b2', '显示') - 0.15); sfx('blip', T('b2', '显示') - 0.15, { p: 0.4 });
  slam(tagEcho, T('b2', '显示') + 0.1); sfx('pop', T('b2', '显示') + 0.1, { p: 0.4 });
  appear(slabA.rs[2], T('b2', '显示') + 0.4); sfx('blip', T('b2', '显示') + 0.4, { p: 0.4 });
  slam(tagOut, T('b2', '显示') + 0.6); sfx('pop', T('b2', '显示') + 0.6, { g: 0.6, p: 0.4 });

  // b5：插入 @echo off 那一行（原来的行下移、行号变 2），文件名跟着换，屏幕只剩输出
  const tIns = T('b5', '艾特') - 0.25;
  fromTo(wrap, tIns, { height: '0px' }, { height: '56px', duration: 0.45, ease: 'power3.out' });
  sfx('pop', tIns, { p: -0.3 }); sfx('thud', tIns + 0.2, { g: 0.4, p: -0.3 });
  keyed(name).at(tIns, { html: 'echo_off.bat' });
  F((t) => { lnOld.dataset.n = t >= tIns + 0.2 ? 2 : 1; });
  vanish(beam, T('b5') - 0.25);
  appear(slabB.rs[0], T('b5', '艾特') + 0.35);
  wipe(slabB.el, T('b5', '艾特') + 0.3, { dir: 'l', d: 0.3 });
  vanish(slabA.el, T('b5', '艾特') + 0.62);
  vanish(tagEcho, T('b5', '艾特') + 0.62); vanish(tagOut, T('b5', '艾特') + 0.62);
  sfx('blip', T('b5', '艾特') + 0.4, { p: 0.4 });
  slabB.set(0, 'hello');

  // ══════════ 站点二：MS-DOS 1.25 的 COMMAND.ASM（源码，不是屏幕） ══════════
  const DX = 2400;
  const src = h('div', 'slab old', world); px(src, 96 + DX, 130, 1440);
  css(src, { fontSize: '52px' });
  h('div', 'hd', src, 'MS-DOS 1.25 · COMMAND.ASM');
  const srcRows = [
    'SAVBATBYT:',
    '        STOSB',
    '        CALL    OUT             ;<span class="hi">Display batched command line</span>',
  ].map((html) => h('div', 'row', src, html));
  srcRows.forEach((r) => vanish(r, 0));
  const claim = h('div', 't-h1 nowrap abs', world, '替人敲命令'); px(claim, 96 + DX, 560);

  // ── 站点二编排 ──
  wipe(src, T('b3', '读入') - 0.6, { dir: 'b', d: 0.5 }); sfx('whoosh', T('b3', '读入') - 0.6, { p: 0.3 });
  srcRows.forEach((r, i) => { appear(r, T('b3', '读入') - 0.2 + i * 0.28); sfx('beep', T('b3', '读入') - 0.2 + i * 0.28, { p: 0.4 }); });
  slam(claim, T('b4', '替人')); sfx('thud', T('b4', '替人'));

  // ── 镜头：跨站点与推近锚在词上，缓慢漂移用 null ──
  camTrack(cam, s.start, { x: 960, y: 484, z: 1 }, [
    [T('b1') - 0.22, { x: 1020, y: 470, z: 1.08 }, 3.0, { ease: 'none', sfx: false }],
    [null, { x: 980, y: 452, z: 1.1 }, 1.5, { ease: 'none', sfx: false }],
    [null, { x: 1010, y: 445, z: 1.09 }, 2.75, { ease: 'none', sfx: false }],
    [T('b2', '显示') - 0.50, { x: 1000, y: 420, z: 1.1 }, 1.0],
    [null, { x: 1030, y: 415, z: 1.12 }, 1.4, { ease: 'none', sfx: false }],
    [T('b3', '读入') - 0.55, { x: 960 + DX, y: 420, z: 1 }, 0.85],
    [null, { x: 980 + DX, y: 410, z: 1.06 }, 2.0, { ease: 'none', sfx: false }],
    [null, { x: 970 + DX, y: 420, z: 1.08 }, 1.7, { ease: 'none', sfx: false }],
    [T('b4', '替人') - 0.45, { x: 960 + DX, y: 450, z: 1.05 }, 1.0],
    [T('b5') - 1.00, { x: 940 + DX, y: 435, z: 1.09 }, 0.45, { ease: 'none', sfx: false }],
    [T('b5') - 0.45, { x: 960, y: 484, z: 1 }, 0.65],
    [null, { x: 990, y: 468, z: 1.07 }, 3.3, { ease: 'none', sfx: false }],
    [null, { x: 960, y: 484, z: 1.02 }, 1.0, { ease: 'none', sfx: false }],
  ]);
});
