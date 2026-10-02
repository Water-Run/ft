// 示例（参考实现）：场景 s3 的后半段，旁白 c5–c7 ——「今天的 cmd.exe 仍然执行一条、读一条」。
// 它演示本片场景的标准写法，index.html 默认不加载它。制作 s3 时可以把这段并进 js/scenes/s3_s3.js，再补上前半段（c1–c4）。
//
// 要点：
//   1 所有内容放进 world，镜头（cam）在 world 上运动；world 的坐标 = 镜头在 z=1 正对时的画面坐标（内容区 1920×968）
//   2 时间一律写成 T(句号, 词)：某句旁白里某个词被读到的时刻。不写死秒数
//   3 状态只由 t 决定：用 appear / vanish / classAt / keyed / typeText / wipe / slam / slide，不用定时器
//   4 每个看得见的动作都登记一个音效 sfx(名称, 时刻)
//   5 文件 = .sheet（纸），屏幕 = .slab（墨），琥珀色 = 「正被读到的那一行」
scene('s3', ({ root, s, c0 }) => {
  // ── world 与镜头 ──
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);          // 镜头中心默认在 (960, 484)，z=1

  // ── 文件：selfmod.bat（内容与 research/lab/bat/selfmod.bat 一致；第 5 行是运行途中被追加的）──
  const sheet = h('div', 'sheet', world); px(sheet, 96, 150, 760);
  h('div', 'name', sheet, 'selfmod.bat');
  const code = ['@echo off', 'echo 1', 'echo echo 3 &gt;&gt; selfmod.bat', 'echo 2', 'echo 3'];
  const ln = code.map((c, i) => { const e = h('div', 'ln', sheet, c); e.dataset.n = i + 1; return e; });
  const added = h('div', 'tag amber abs', sheet, '运行途中追加'); css(added, { right: '44px', top: box(ln[4], sheet).y + 6 + 'px' });

  // ── 屏幕：今天的 cmd.exe（输出与 research/lab/lab_output.txt 一致）──
  const slab = h('div', 'slab now', world); px(slab, 1010, 150, 814, 500);
  h('div', 'hd', slab, 'Windows 11 · cmd.exe');
  const row = [0, 1, 2, 3].map(() => h('div', 'row', slab));
  const note = h('div', 't-note nowrap abs', world, '实测：Windows 11（10.0.26220）'); px(note, 1010, 676);

  // ── 光束：从「正被读的那一行」伸到屏幕。每行一条，轮到谁谁出现 ──
  const beam = ln.map((e) => { const b = box(e, world); const m = h('div', 'blk', world); px(m, 856, b.y, 154, b.h); return m; });

  // ── 一句话的结论 ──
  const claim = h('div', 't-h1 nowrap abs', world, '执行一条，读一条'); px(claim, 96, 716);

  // ── 时间编排 ──
  const t0 = T('c5') - 0.5;                           // 这一段的入场时刻
  cam.cut(t0 - 0.1, { x: 960, y: 484, z: 1 });
  wipe(sheet, t0, { dir: 't', d: 0.5 });              // 纸从上往下刷出来
  wipe(slab, t0 + 0.12, { dir: 'b', d: 0.5 });        // 屏幕从下往上刷出来，错开 0.12 秒
  appear(note, t0 + 0.6);
  sfx('whoosh', t0); sfx('thud', t0 + 0.5, { g: 0.5 });
  vanish(ln[4], 0); vanish(added, 0);                 // 第 5 行一开始不存在

  // 敲入命令（打字机自带按键声）
  row[0].innerHTML = '<span class="in"></span>';
  typeText(row[0].firstChild, 'D:\\batlab&gt;selfmod.bat', T('c5') - 0.1, 26, { cursorUntil: T('c5', '仍然') });

  // 「读到第 i 行」：这一行变琥珀色、光束伸出；需要时在屏幕上打出一行输出
  const read = (i, a, b) => { classAt(ln[i], 'on', a, b); appear(beam[i], a); vanish(beam[i], b); sfx('tick', a, { p: -0.3 }); };
  const print = (r, html, t, hot) => { row[r].innerHTML = hot ? `<span class="hi">${html}</span>` : html; appear(row[r], t); sfx(hot ? 'chime' : 'blip', t, { p: 0.4 }); };
  for (const e of beam) vanish(e, 0);
  for (const r of row.slice(1)) vanish(r, 0);

  const a1 = T('c5', '仍然'), a2 = T('c5', '读'), a3 = T('c6', '运行'), a4 = T('c7') - 0.25, a5 = T('c7', '随后');
  read(0, a1, a2);                                    // @echo off
  read(1, a2, a3);   print(1, '1', a2 + 0.2);         // echo 1 → 输出 1
  read(2, a3, a4);                                    // echo echo 3 >> selfmod.bat
  read(3, a4, a5);   print(2, '2', a4 + 0.2);         // echo 2 → 输出 2
  read(4, a5, s.end); print(3, '3', T('c7', '执行'), true);   // 被追加的那一行也被执行 → 输出 3（强调）

  // 追加发生的那一刻：第 5 行从左滑入，标签砸入
  const tA = T('c6', '追加');
  slide(ln[4], tA, { x: -80, d: 0.45 }); slam(added, tA + 0.25); sfx('pop', tA); sfx('thud', tA + 0.3, { g: 0.4 });

  // 结论随「执行一条」刷出，推近之前先收走（否则放大后会伸进字幕条）
  wipe(claim, T('c5', '执行'), { dir: 'l', d: 0.6 }); sfx('whoosh', T('c5', '执行'), { g: 0.4 });
  wipeOut(claim, T('c6') - 0.35, { dir: 'l', d: 0.3 });

  // 镜头：c5 缓慢推进（一直在动）→ c6 推近到文件下半 → c7 摇到屏幕的输出 → 拉回全景
  cam.to(T('c5'), { x: 972, y: 484, z: 1.05 }, { d: 4.6, ease: 'none', sfx: false });
  cam.to(T('c6') - 0.1, { x: 640, y: 420, z: 1.42 }, { d: 1.1 });
  cam.to(T('c7', '随后') - 0.35, { x: 1210, y: 400, z: 1.42 }, { d: 0.9 });
  cam.to(Tend('c7') + 0.05, { x: 960, y: 484, z: 1 }, { d: 0.65 });
});
