// 场景 s1：01 来历。
// 站点一（x=0）：像素字的 1981 与 IBM PC / PC DOS 1.0；右侧是 COMMAND.COM 的屏幕（示意）。
// 站点二（x=+2400）：机制图 —— 把命令逐行写进 DEMO.BAT，解释器一条一条地回显并执行。
// 站点三（x=+4800）：时间轴推到 1983 —— IF / FOR / GOTO 等要到 DOS 2.0 才有。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('s1', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点一：1981，IBM PC，PC DOS 1.0 ══════════
  const big = h('div', 'n-pixel abs', world, '1981'); px(big, 76, 150); big.setAttribute('data-bleed', '');
  const ibm = h('div', 't-h2 nowrap abs', world, 'IBM PC'); px(ibm, 96, 600);
  const dos = h('div', 't-h2 nowrap abs', world, 'PC DOS 1.0'); px(dos, 96, 690);
  const dateNote = h('div', 't-note nowrap abs', world, '1981 年 8 月'); px(dateNote, 96, 800);

  const scr = h('div', 'slab old', world); px(scr, 900, 130, 900, 640);
  h('div', 'hd', scr, 'COMMAND.COM 的屏幕（示意）');
  const rowA = h('div', 'row', scr, 'A&gt;<span class="cur"></span>');
  const cur = rowA.querySelector('.cur');
  F((t) => { cur.style.opacity = Math.floor(t * 2) % 2 ? '0' : '1'; });

  // ══════════ 站点二：DEMO.BAT 与它的回显 ══════════
  const DX = 2400;
  const sheet = h('div', 'sheet old', world); px(sheet, 96 + DX, 190, 900);
  h('div', 'name', sheet, 'DEMO.BAT');
  const sl = [0, 1].map((i) => { const e = h('div', 'ln', sheet); e.dataset.n = i + 1; return e; });
  const slText = sl.map((e) => h('span', null, e));

  const scr2 = h('div', 'slab old', world); px(scr2, 1100 + DX, 130, 900);
  h('div', 'hd', scr2, 'COMMAND.COM 的屏幕（示意）');
  const rows = ['', 'A&gt;<span class="in">DEMO</span>', '', 'A&gt;<span class="hi">REM CHANGE DISK IN B:</span>', '',
    'A&gt;<span class="hi">PAUSE</span>', 'Strike a key when ready . . . ']
    .map((html) => h('div', 'row', scr2, html));
  rows.forEach((r) => vanish(r, 0));
  const beam = sl.map((e) => { const b = box(e, world); const m = h('div', 'blk', world); px(m, 996 + DX, b.y, 104, b.h); return m; });
  beam.forEach((b) => vanish(b, 0));
  const claim = h('div', 't-h1 nowrap abs', world, '批处理'); px(claim, 96 + DX, 770);
  const tag1 = tagAt(sheet, 'amber', '注释', 0, box(sl[0], sheet).y + 6, 44);
  const tag2 = tagAt(sheet, 'amber', '暂停', 0, box(sl[1], sheet).y + 6, 44);

  // ── 站点一编排 ──
  slam(big, T('a1', '1981') - 0.78); sfx('thud', T('a1', '1981') - 0.78);
  wipe(ibm, T('a1', 'IBM') - 0.15, { dir: 'l', d: 0.5 }); sfx('tick', T('a1', 'IBM') - 0.15);
  appear(dateNote, T('a1', '8 月') - 0.25); sfx('pop', T('a1', '8 月') - 0.25, { g: 0.5, p: -0.4 });
  slam(dos, T('a2', 'PC') - 0.15); sfx('thud', T('a2', 'PC') - 0.15, { g: 0.6 });
  wipe(scr, T('a3', '解释器') - 0.45, { dir: 'r', d: 0.5 }); sfx('whoosh', T('a3', '解释器') - 0.45, { p: 0.4 });
  appear(rowA, T('a3', 'command') - 0.05); sfx('beep', T('a3', 'command') - 0.05, { p: 0.4 });
  vanish(rowA, 0);

  // ── 站点二编排 ──
  const tWrite = T('a4', '写进');
  wipe(sheet, tWrite - 0.5, { dir: 't', d: 0.5 }); sfx('whoosh', tWrite - 0.5, { p: -0.4 });
  const tType1 = typeText(slText[0], 'REM CHANGE DISK IN B:', tWrite - 0.1, 16, { cursorUntil: tWrite + 1.5 });
  typeText(slText[1], 'PAUSE', tType1 + 0.25, 16, { cursorUntil: tType1 + 0.9 });

  wipe(scr2, T('a5') - 0.55, { dir: 'b', d: 0.5 }); sfx('whoosh', T('a5') - 0.55, { p: 0.4 });
  appear(rows[1], T('a5') - 0.25); sfx('beep', T('a5') - 0.25, { p: 0.4 });
  const step = (i, t, out) => {
    classAt(sl[i], 'on', t, t + 1.6); appear(beam[i], t); vanish(beam[i], t + 1.6);
    sfx('tick', t, { p: -0.3 });
    for (const r of out) { appear(rows[r], t + 0.3); sfx('beep', t + 0.3, { p: 0.4 }); }
  };
  step(0, T('a5', '解释器') + 0.15, [3]);
  step(1, T('a5', '执行') + 0.05, [5, 6]);
  slam(claim, T('a5', '批') - 0.15); sfx('thud', T('a5', '批') - 0.15);
  wipeOut(claim, T('a6', '注释') - 1.50, { dir: 'l', d: 0.3 }); sfx('tick', T('a6', '注释') - 1.50, { g: 0.4, p: -0.4 });

  // 标签：注释 / 暂停
  slam(tag1, T('a6', '注释') - 0.1); sfx('pop', T('a6', '注释') - 0.1, { p: -0.3 });
  slam(tag2, T('a6', '暂停') - 0.1); sfx('pop', T('a6', '暂停') - 0.1, { g: 0.6, p: -0.3 });
  vanish(tag1, 0); vanish(tag2, 0);

  // ══════════ 站点三：1983，DOS 2.0 ══════════
  const DX3 = 4800;
  const big3 = h('div', 'n-pixel abs', world, '1983'); px(big3, 76 + DX3, 150);
  const dos2 = h('div', 't-h2 nowrap abs', world, 'DOS 2.0'); px(dos2, 96 + DX3, 600);
  const axis = h('div', 'rule', world); px(axis, 96 + DX3, 700, 0, 6);
  const span83 = h('div', 'blk', world); px(span83, 96 + DX3, 697, 0, 12);
  const tk81 = h('div', 'y-pixel nowrap abs', world, '1981'); px(tk81, 72 + DX3, 730);
  const tk83 = h('div', 'y-pixel nowrap abs', world, '1983'); px(tk83, 572 + DX3, 730);
  const note3 = h('div', 't-note nowrap abs', world, 'MS-DOS 2.0 · 1983 年 3 月'); px(note3, 96 + DX3, 830);
  const cmds = ['ECHO', 'IF', 'FOR', 'GOTO', 'SHIFT'].map((c, i) => { const e = h('div', 'y-pixel nowrap abs', world, c); px(e, 900 + DX3, 180 + i * 116); return e; });

  const t83 = T('a7', '一九八三');
  fromTo(axis, t83 - 1.45, { width: '0px' }, { width: '1000px', duration: 0.6, ease: 'power3.out' });
  appear(axis, t83 - 1.45); appear(tk81, t83 - 1.10); sfx('tick', t83 - 1.45, { p: -0.3 }); sfx('tick', t83 - 1.10, { g: 0.6, p: -0.3 });
  slam(big3, t83 - 0.35); sfx('thud', t83 - 0.35);
  wipe(dos2, T('a7', 'DOS') - 0.2, { dir: 'l', d: 0.5 }); sfx('tick', T('a7', 'DOS') - 0.2);
  fromTo(span83, t83 + 0.15, { width: '0px' }, { width: '500px', duration: 0.5, ease: 'power3.out' });
  appear(span83, t83 + 0.15);
  sfx('whoosh', t83, { g: 0.4, p: -0.3 });
  appear(tk83, t83 + 0.7); sfx('tick', t83 + 0.75, { g: 0.5, p: -0.3 });
  appear(note3, t83 + 0.9); sfx('pop', t83 + 0.9, { g: 0.5, p: -0.4 });
  cmds.forEach((e, i) => { const t = t83 + 1.15 + i * 0.26; slam(e, t, { from: 1.5 }); sfx('tick', t, { p: 0.3 }); vanish(e, 0); });
  vanish(axis, 0); vanish(span83, 0); vanish(tk81, 0); vanish(tk83, 0); vanish(note3, 0);
  vanish(big3, 0); vanish(dos2, 0);

  // ── 镜头：站点一建立 → 推近屏幕 → 站点二机制图 → 推近文件 → 站点三 ──
  // ── 镜头：跨站点与推近锚在词上，缓慢漂移用 null ──
  camTrack(cam, s.start, { x: 960, y: 484, z: 1 }, [
    [T('a1') - 0.43, { x: 960, y: 470, z: 1.03 }, 3.2, { ease: 'none', sfx: false }],
    [null, { x: 965, y: 462, z: 1.05 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 965, y: 458, z: 1.06 }, 2.3, { ease: 'none', sfx: false }],
    [T('a3', '解释器') - 0.80, { x: 1240, y: 430, z: 1.18 }, 1.0],
    [null, { x: 1255, y: 430, z: 1.20 }, 2.9, { ease: 'none', sfx: false }],
    [T('a4', '写进') - 0.75, { x: 960 + DX, y: 470, z: 1.04 }, 0.8],
    [null, { x: 996 + DX, y: 465, z: 1.06 }, 2.3, { ease: 'none', sfx: false }],
    [T('a5') - 0.53, { x: 996 + DX, y: 460, z: 1.06 }, 1.1],
    [null, { x: 996 + DX, y: 455, z: 1.06 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 996 + DX, y: 450, z: 1.06 }, 2.3, { ease: 'none', sfx: false }],
    [T('a6', '注释') - 1.10, { x: 500 + DX, y: 400, z: 1.32 }, 1.0],
    [null, { x: 480 + DX, y: 395, z: 1.34 }, 2.0, { ease: 'none', sfx: false }],
    [T('a7', '一九八三') - 2.40, { x: 960 + DX3, y: 484, z: 1 }, 0.8],
    [null, { x: 960 + DX3, y: 480, z: 1.0 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 960 + DX3, y: 470, z: 1.03 }, 1.6, { ease: 'none', sfx: false }],
  ]);
});
