// 场景 s3：03 逐行读盘。
// 站点一（x=0）：「当年」的机制图 —— 文件放在软盘上，每读一行之前先重新打开文件；打不开时提示插盘。
// 站点二（x=+2400）：「今天」的机制图 —— 脚本在运行途中给自己追加一行，追加的那行随后也被执行（示范场景整体平移）。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('s3', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点一：DEMO.BAT 在一张 160 KB 的软盘上 ══════════
  const sheet = h('div', 'sheet old', world); px(sheet, 96, 120, 840);
  h('div', 'name', sheet, 'DEMO.BAT');
  const sl = [0, 1].map((i) => { const e = h('div', 'ln', sheet); e.dataset.n = i + 1; return e; });
  const slText = sl.map((e) => h('span', null, e));
  const tType = typeText(slText[0], 'REM CHANGE DISK IN B:', c0 + 0.5, 16, { cursorUntil: c0 + 1.6 });
  typeText(slText[1], 'PAUSE', tType + 0.2, 16, { cursorUntil: tType + 0.7 });

  // 软盘：平涂的墨色正方形 + 纸色圆孔 + 读写槽（data-name 让工具报告里显示「软盘」）
  const mkFloppy = () => {
    const f = h('div', 'floppy', world); f.dataset.name = '软盘'; px(f, 96, 460, 240, 240);
    h('div', 'hub', f); h('div', 'slot', f); return f;
  };
  const disk1 = mkFloppy(), disk2 = mkFloppy();
  const dflash = h('div', 'blk', world); px(dflash, 96, 684, 240, 16);   // 读盘时闪一下（寻道）
  const dnote = h('div', 't-note nowrap abs', world, '160 KB 软盘'); px(dnote, 96, 740);

  // 「当年」的屏幕：按 MS-DOS 1.25 源码的行为重建，必须标「示意」
  const scr = h('div', 'slab old', world); px(scr, 1000, 90, 880);
  h('div', 'hd', scr, 'COMMAND.COM 的屏幕（示意）');
  const rows = ['', 'A&gt;<span class="in">DEMO</span>', '', 'A&gt;<span class="hi">REM CHANGE DISK IN B:</span>', '',
    'A&gt;<span class="hi">PAUSE</span>', 'Strike a key when ready . . . ',
    '<span class="hi">Insert disk with batch file</span>', 'and strike any key when ready']
    .map((html) => h('div', 'row', scr, html));
  rows.forEach((r) => vanish(r, 0));
  const beam = sl.map((e) => { const b = box(e, world); const m = h('div', 'blk', world); px(m, 936, b.y, 64, b.h); return m; });
  beam.forEach((b) => vanish(b, 0));

  // 源码里的那一行注释（c2 的出处）
  const codeNote = h('div', 'mono-note nowrap abs', world, 'INT 33 ;Make sure batch file still exists'); px(codeNote, 96, 790);
  const srcNote = h('div', 't-note nowrap abs', world, 'MS-DOS 1.25 · COMMAND.ASM'); px(srcNote, 96, 845);

  // ── 站点一的编排 ──
  wipe(sheet, c0 - 0.15, { dir: 't', d: 0.5 }); sfx('whoosh', c0 - 0.15);
  slide(disk1, c0 + 0.4, { y: -260, d: 0.55 }); sfx('drive', c0 + 0.4, { p: -0.4 });
  wipe(scr, c0 + 0.2, { dir: 'b', d: 0.5 }); sfx('thud', c0 + 0.6, { g: 0.5, p: 0.3 });
  appear(rows[1], T('c1', '脚本') + 0.2); sfx('beep', T('c1', '脚本') + 0.2, { p: 0.4 });

  // 每一轮：软盘闪一下、响一声寻道 → 这一行变琥珀、光束伸出 → 屏幕回显
  const round = (i, a, out, b) => {
    appear(dflash, a); vanish(dflash, a + 0.28); sfx('drive', a, { p: -0.4 });
    classAt(sl[i], 'on', a + 0.3, b); appear(beam[i], a + 0.3); vanish(beam[i], b + 0.5);
    sfx('tick', a + 0.3, { p: -0.3 });
    for (const r of out) { appear(rows[r], a + 0.55); sfx('beep', a + 0.55, { p: 0.4 }); }
  };
  vanish(dflash, 0);
  round(0, T('c2', 'DOS') + 0.25, [3], T('c2', '打开'));
  round(1, T('c2', '打开') + 0.5, [5, 6], Tend('c2') + 0.2);
  appear(codeNote, T('c2', '文件') + 0.4); appear(srcNote, T('c2', '文件') + 0.6);
  sfx('pop', T('c2', '文件') + 0.4, { g: 0.5, p: -0.4 });

  // c3：软盘（连同文件）被换掉，下一次打开文件失败
  const tOut = T('c3', '插入') - 0.3;
  exit(sheet, tOut, { x: -900, d: 0.5 }); exit(disk1, tOut, { x: -900, d: 0.5 });
  exit(codeNote, T('c3') - 0.2, { x: -300, d: 0.3 }); exit(srcNote, T('c3') - 0.15, { x: -300, d: 0.3 });
  sfx('tick', T('c3') - 0.2, { g: 0.4, p: -0.4 });
  sfx('whoosh', tOut, { p: -0.5 });
  appear(rows[7], T('c3', '插入') + 0.25); sfx('error', T('c3', '插入') + 0.25, { p: 0.3 });
  appear(rows[8], T('c3', '插入') + 0.6); sfx('beep', T('c3', '插入') + 0.6, { p: 0.4 });

  // c4：另一张软盘从另一侧滑入（它不是原来那张）
  slide(disk2, T('c4', '软盘') - 0.2, { x: 700, d: 0.6 }); sfx('drive', T('c4', '软盘') - 0.2, { p: 0.4 });
  appear(dnote, T('c4', '软盘') + 0.35); sfx('pop', T('c4', '软盘') + 0.35, { g: 0.5, p: -0.4 });
  vanish(disk2, 0); vanish(dnote, 0);

  // ══════════ 站点二（x=+2400）：今天的 cmd.exe ══════════
  const DX = 2400;
  const sh2 = h('div', 'sheet', world); px(sh2, 96 + DX, 150, 760);
  h('div', 'name', sh2, 'selfmod.bat');
  const code = ['@echo off', 'echo 1', 'echo echo 3 &gt;&gt; selfmod.bat', 'echo 2', 'echo 3'];
  const ln2 = code.map((c, i) => { const e = h('div', 'ln', sh2, c); e.dataset.n = i + 1; return e; });
  const added = h('div', 'tag amber abs', sh2, '运行途中追加'); css(added, { right: '44px', top: box(ln2[4], sh2).y + 6 + 'px' });

  const slab2 = h('div', 'slab now', world); px(slab2, 1010 + DX, 150, 814, 500);
  h('div', 'hd', slab2, 'Windows 11 · cmd.exe');
  const row2 = [0, 1, 2, 3].map(() => h('div', 'row', slab2));
  const note2 = h('div', 't-note nowrap abs', world, '实测：Windows 11（10.0.26220）'); px(note2, 1010 + DX, 676);

  const beam2 = ln2.map((e) => { const b = box(e, world); const m = h('div', 'blk', world); px(m, 856 + DX, b.y, 154, b.h); return m; });
  const claim = h('div', 't-h1 nowrap abs', world, '执行一条，读一条'); px(claim, 96 + DX, 716);

  const t0 = T('c5') - 0.5;
  wipe(sh2, t0, { dir: 't', d: 0.5 });
  wipe(slab2, t0 + 0.12, { dir: 'b', d: 0.5 });
  appear(note2, t0 + 0.6);
  sfx('thud', t0 + 0.5, { g: 0.5, p: 0.3 });
  vanish(ln2[4], 0); vanish(added, 0);
  for (const e of beam2) vanish(e, 0);
  for (const r of row2.slice(1)) vanish(r, 0);

  row2[0].innerHTML = '<span class="in"></span>';
  typeText(row2[0].firstChild, 'D:\\batlab&gt;selfmod.bat', T('c5') - 0.1, 26, { cursorUntil: T('c5', '仍然') });

  const readLn = (i, a, b) => { classAt(ln2[i], 'on', a, b); appear(beam2[i], a); vanish(beam2[i], b); sfx('tick', a, { p: -0.3 }); };
  const print = (r, html, t, hot) => { row2[r].innerHTML = hot ? `<span class="hi">${html}</span>` : html; appear(row2[r], t); sfx(hot ? 'chime' : 'blip', t, { p: 0.4 }); };

  const a1 = T('c5', '仍然'), a2 = T('c5', '读'), a3 = T('c6', '运行'), a4 = T('c7') - 0.25, a5 = T('c7', '随后');
  readLn(0, a1, a2);
  readLn(1, a2, a3); print(1, '1', a2 + 0.2);
  readLn(2, a3, a4);
  readLn(3, a4, a5); print(2, '2', a4 + 0.2);
  readLn(4, a5, s.end); print(3, '3', T('c7', '执行'), true);

  const tA = T('c6', '追加');
  slide(ln2[4], tA, { x: -80, d: 0.45 }); slam(added, tA + 0.25); sfx('pop', tA); sfx('thud', tA + 0.3, { g: 0.4, p: 0.3 });

  wipe(claim, T('c5', '执行'), { dir: 'l', d: 0.6 }); sfx('whoosh', T('c5', '执行'), { g: 0.4 });
  wipeOut(claim, T('c6') - 0.35, { dir: 'l', d: 0.3 });

  // ── 镜头：跨站点与推近锚在词上，缓慢漂移用 null。每段首尾相接、互不重叠 ──
  const Z0 = { x: 960, y: 484, z: 1 };
  camTrack(cam, s.start, Z0, [
    [T('c1') - 0.20, { x: 990, y: 470, z: 1.07 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 1000, y: 468, z: 1.08 }, 0.56, { ease: 'none', sfx: false }],
    [T('c2', 'DOS') - 0.90, { x: 700, y: 480, z: 1.12 }, 0.9],
    [null, { x: 770, y: 470, z: 1.16 }, 3.9, { ease: 'none', sfx: false }],
    [T('c3', '文件') - 0.36, { x: 1150, y: 420, z: 1.12 }, 1.0],
    [null, { x: 1190, y: 435, z: 1.15 }, 3.4, { ease: 'none', sfx: false }],
    [T('c4', '软盘') - 1.06, { x: 240, y: 540, z: 1.3 }, 1.0],
    [null, { x: 265, y: 555, z: 1.33 }, 1.6, { ease: 'none', sfx: false }],
    [T('c5') - 0.58, { x: 960 + DX, y: 484, z: 1 }, 0.55],
    [T('c5'), { x: 972 + DX, y: 484, z: 1.05 }, 4.6, { ease: 'none', sfx: false }],
    [T('c6') - 0.10, { x: 640 + DX, y: 420, z: 1.42 }, 1.1],
    [T('c6', '追加') - 1.40, { x: 600 + DX, y: 410, z: 1.45 }, 2.6, { ease: 'none', sfx: false }],
    [T('c7', '随后') - 0.70, { x: 1210 + DX, y: 400, z: 1.42 }, 0.9],
    [Tend('c7') + 0.05, { x: 960 + DX, y: 484, z: 1 }, 0.65],
  ]);
});
