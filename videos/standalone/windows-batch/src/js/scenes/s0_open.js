// 场景 open：开场（无章节卡）。
// 站点 A（x=0）：今天的 Windows 11 —— 新建一个文本文件、写一行命令、改成 .bat、双击运行。
// 站点 B（x=2400）：一下子拉回 1981 —— 像素大数字与到 1985 的时间轴。
// 站点 C（x=4800）：片名帧（整屏墨色）。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点 A：新建文本文档 → hello.bat ══════════
  const sheet = h('div', 'sheet', world); px(sheet, 96, 220, 760);
  const name = h('div', 'name', sheet, '新建文本文档.txt');
  const ln1 = h('div', 'ln', sheet); ln1.dataset.n = 1;
  const lnSpan = h('span', null, ln1);
  const flash = h('div', 'blk', world); px(flash, 140, 296, 260, 10);

  const slab = h('div', 'slab now', world); px(slab, 1010, 220, 814);
  h('div', 'hd', slab, 'Windows 11 · cmd.exe');
  const rows = ['', '<span class="in">D:\\batlab&gt;echo hello</span>', 'hello'].map((html) => h('div', 'row', slab, html));
  const note = h('div', 't-note nowrap abs', world, '实测：Windows 11（10.0.26220）'); px(note, 1010, 600);

  wipe(sheet, s.start + 0.02, { dir: 't', d: 0.8 }); sfx('whoosh', s.start + 0.02);
  typeText(lnSpan, 'echo hello', T('o2', '写') - 0.1, 14);
  keyed(name).at(T('o2', '扩展') + 0.15, { html: 'hello.bat' });
  appear(flash, T('o2', '扩展') + 0.15); vanish(flash, T('o2', '扩展') + 0.6);
  sfx('pop', T('o2', '扩展') + 0.15, { p: -0.4 });
  slam(slab, T('o3', '双击') - 0.4); sfx('thud', T('o3', '双击') - 0.4, { p: 0.3 });
  appear(rows[1], T('o3', '双击') + 0.25); sfx('blip', T('o3', '双击') + 0.25, { p: 0.4 });
  appear(rows[2], T('o3', '运行') - 0.1); sfx('blip', T('o3', '运行') - 0.1, { p: 0.4 });
  appear(note, T('o3', '运行') + 0.15); sfx('tick', T('o3', '运行') + 0.15, { g: 0.5, p: 0.4 });
  vanish(flash, 0); vanish(rows[1], 0); vanish(rows[2], 0); vanish(note, 0);

  // ══════════ 站点 B：1981，比 Windows 早四年 ══════════
  const DX = 2400;
  const big = h('div', 'n-pixel abs', world, '1981'); px(big, 76 + DX, 150);
  const axis = h('div', 'rule', world); px(axis, 96 + DX, 690, 0, 6);
  const seg = h('div', 'blk', world); px(seg, 96 + DX, 687, 0, 12);
  const tick = h('div', 'blk ink', world); px(tick, 756 + DX, 660, 6, 60);
  const y85 = h('div', 'y-grot nowrap abs', world, '1985'); px(y85, 680 + DX, 600);
  const win = h('div', 't-h2 nowrap abs', world, 'Windows 1.0'); px(win, 680 + DX, 740);
  const y4 = h('div', 't-h2 nowrap abs', world, '4 年'); px(y4, 96 + DX, 740);
  const dateNote = h('div', 't-note nowrap abs', world, '1981 年 8 月 — 1985 年 11 月'); px(dateNote, 96 + DX, 860);

  const t81 = T('o4', '1981');
  sfx('riser', t81 - 1.2);
  slam(big, t81 - 0.1); sfx('thud', t81 - 0.1);
  fromTo(axis, T('o5', '第一个') - 0.2, { width: '0px' }, { width: '1100px', duration: 0.7, ease: 'power3.out' });
  fromTo(seg, T('o5', '第一个') - 0.1, { width: '0px' }, { width: '660px', duration: 0.7, ease: 'power3.out' });
  appear(axis, T('o5', '第一个') - 0.2); appear(seg, T('o5', '第一个') - 0.1);
  sfx('whoosh', T('o5', '第一个') - 0.2, { g: 0.4 });
  appear(tick, T('o5', '第一个') + 0.2); sfx('tick', T('o5', '第一个') + 0.2, { g: 0.6 });
  slam(y85, T('o5', '第一个') + 0.25); sfx('thud', T('o5', '第一个') + 0.25, { g: 0.5 });
  wipe(win, T('o5', '版本') + 0.1, { dir: 'l', d: 0.5 }); sfx('tick', T('o5', '版本') + 0.1);
  slam(y4, T('o5', '早') - 0.15); sfx('pop', T('o5', '早') - 0.15, { p: -0.4 });
  appear(dateNote, T('o5', '年') + 0.15); sfx('tick', T('o5', '年') + 0.15, { g: 0.5, p: -0.4 });
  for (const e of [big, axis, seg, tick, y85, win, y4, dateNote]) vanish(e, 0);

  // ══════════ 站点 C：片名帧。墨色块横跨两站，遮住镜头平移 ══════════
  const DX3 = 4800;
  const cover = h('div', 'blk ink', world); px(cover, DX, 0, DX3 - DX + 1920, 968);
  wipe(cover, T('oT') - 0.35, { dir: 'b', d: 0.5 }); sfx('whoosh', T('oT') - 0.35);
  sfx('thud', T('oT') + 0.2);

  const prompt = h('div', 'n-pixel c-amber abs', world, 'A&gt;'); px(prompt, 1080 + DX3, 120);
  css(prompt, { fontSize: '760px' }); prompt.setAttribute('data-bleed', '');
  const caret = h('div', 'blk', world); px(caret, 1668 + DX3, 208, 230, 420); caret.setAttribute('data-bleed', '');
  F((t) => { const on = t >= T('oT') + 0.05 && Math.floor(t * 2) % 2 === 1; caret.style.opacity = on ? '1' : '0'; caret.style.visibility = on ? 'visible' : 'hidden'; });
  const l1 = h('div', 't-hero c-paper nowrap abs', world, '古代来的'); px(l1, 96 + DX3, 128); css(l1, { fontSize: '200px' });
  const l2 = h('div', 'abs c-paper', world, 'Shell'); px(l2, 88 + DX3, 356); css(l2, { font: '900 270px/1 "Grot", "Sans SC"', letterSpacing: '-.045em' });
  const line = h('div', 'blk', world); px(line, 96 + DX3, 690, 0, 8);
  const l3 = h('div', 't-h2 c-paper nowrap abs', world, 'Windows 批处理（.bat）'); px(l3, 96 + DX3, 728);
  slam(prompt, T('oT') + 0.02, { from: 1.15 }); sfx('thud', T('oT') + 0.02, { g: 0.6, p: 0.4 });
  slam(l1, T('oT') + 0.18); sfx('thud', T('oT') + 0.18);
  slam(l2, T('oT') + 0.42); sfx('thud', T('oT') + 0.42, { g: 0.7 });
  fromTo(line, T('oT') + 0.65, { width: '0px' }, { width: '520px', duration: 0.4, ease: 'power3.out' });
  appear(line, T('oT') + 0.65); sfx('tick', T('oT') + 0.65, { g: 0.5 });
  wipe(l3, T('oT') + 0.78, { dir: 'l', d: 0.45 }); sfx('tick', T('oT') + 0.78, { g: 0.5 });
  for (const e of [prompt, l1, l2, line, l3]) vanish(e, 0);

  // ── 镜头：慢推（今天）→ 推近文件 → 拉回看屏幕 → 急速平移到 1981 → 极度慢推 → 片名 ──
  // ── 镜头：每一段都锚在旁白的词上；缓慢漂移用 null（自动接在上一段之后）──
  camTrack(cam, s.start, { x: 620, y: 340, z: 1.12 }, [
    [T('o1') - 0.45, { x: 500, y: 330, z: 1.45 }, 3.3, { ease: 'none', sfx: false }],
    [T('o2') - 0.20, { x: 560, y: 350, z: 1.42 }, 1.3, { ease: 'none', sfx: false }],
    [T('o2', '扩展') - 0.20, { x: 620, y: 370, z: 1.38 }, 1.4, { ease: 'none', sfx: false }],
    [T('o3', '双击') - 0.95, { x: 960, y: 430, z: 1.12 }, 0.55],
    [null, { x: 960, y: 430, z: 1.14 }, 2.4, { ease: 'none', sfx: false }],
    [T('o4', '1981') - 0.85, { x: 960 + DX, y: 484, z: 1 }, 0.85],
    [null, { x: 960 + DX, y: 470, z: 1.06 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 960 + DX, y: 465, z: 1.06 }, 2.9, { ease: 'none', sfx: false }],
    [T('oT') - 0.28, { x: 960 + DX3, y: 484, z: 1 }, 0.45],
    [null, { x: 980 + DX3, y: 480, z: 1.06 }, 2.6, { ease: 'none', sfx: false }],
  ]);
});
