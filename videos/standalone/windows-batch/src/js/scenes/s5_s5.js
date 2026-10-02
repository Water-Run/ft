// 场景 s5：05 今天。
// 站点一（x=0）：1981 → 1993（cmd.exe）→ 2006（PowerShell）→ 2026，琥珀条没有断。
// 站点二（x=+2400）：一台开发机上的 3164 个批处理文件，近六成来自 npm。
// 站点三（x=+4800）：中国约 4% 的桌面 Windows 还是 Windows 7（StatCounter）。
// 站点四（x=+7200）：2008 年的系统与 Windows 11 上，同一个脚本输出相同。
// 站点五（x=+9600）：两段微软官方博客的引文。
// 画面内容只由 t 决定；每个可见动作登记一个音效。
scene('s5', ({ root, s, c0 }) => {
  const world = h('div', 'abs', root); css(world, { left: 0, top: 0, width: '1920px', height: '968px' });
  const cam = makeCamera(world, 1920, 968);

  // ══════════ 站点一：一条从 1981 长到 2026 的琥珀条 ══════════
  const axis = h('div', 'rule', world); px(axis, 96, 380, 0, 6);
  const bar = h('div', 'blk', world); px(bar, 96, 374, 0, 18);
  const barPS = h('div', 'blk ink', world); px(barPS, 1018, 430, 0, 18);
  const tk93 = h('div', 'blk ink', world); px(tk93, 536, 340, 6, 40);
  const tk06 = h('div', 'blk ink', world); px(tk06, 1015, 340, 6, 40);
  const y81 = h('div', 'y-pixel nowrap abs', world, '1981'); px(y81, 96, 220);
  const y93 = h('div', 'y-grot nowrap abs', world, '1993'); px(y93, 470, 220);
  const y06 = h('div', 'y-grot nowrap abs', world, '2006'); px(y06, 960, 220);
  const y26 = h('div', 'n-grot abs', world, '2026'); px(y26, 1400, 150); css(y26, { fontSize: '200px' });
  const nt = h('div', 't-h2 nowrap abs', world, 'Windows NT 3.1'); px(nt, 430, 520);
  const exe = h('div', 'y-mono nowrap abs', world, 'cmd.exe'); px(exe, 430, 650);
  const d93 = h('div', 't-note nowrap abs', world, '1993 年 7 月'); px(d93, 430, 770);
  const ps = h('div', 't-h2 nowrap abs', world, 'PowerShell 1.0'); px(ps, 1018, 650);
  const d06 = h('div', 't-note nowrap abs', world, '2006 年 11 月'); px(d06, 1018, 780);

  for (const e of [axis, bar, barPS, tk93, tk06, y81, y93, y06, y26, nt, exe, d93, ps, d06]) vanish(e, 0);
  const tAxis = T('e1') - 0.72;
  growTo(axis, [[tAxis, 0], [tAxis + 0.8, 1660]]);
  growTo(bar, [[tAxis + 0.5, 0], [T('e1', '一九九三') - 0.30, 443], [T('e2', '2006') - 0.25, 922], [T('e3') + 0.15, 1660]]);
  growTo(barPS, [[T('e3') + 0.30, 0], [T('e3') + 1.30, 738]]);
  appear(y81, tAxis - 0.05); sfx('whoosh', tAxis, { g: 0.4, p: -0.4 });
  sfx('tick', tAxis - 0.05, { g: 0.6, p: -0.4 });
  const grow = (el, t, w, d) => { fromTo(el, t, { width: '0px' }, { width: w + 'px', duration: d, ease: 'power2.inOut' }); appear(el, t); };
  sfx('tick', T('e1', '一九九三') - 0.3, { g: 0.5, p: -0.3 });
  slam(y93, T('e1', '一九九三') - 0.15); sfx('thud', T('e1', '一九九三') - 0.15);
  appear(tk93, T('e1', '一九九三') + 0.5); sfx('tick', T('e1', '一九九三') + 0.5, { g: 0.5, p: -0.3 });
  wipe(nt, T('e1', 'Windows') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('e1', 'Windows') - 0.2, { p: -0.3 });
  wipe(exe, T('e1', 'CMD') - 0.2, { dir: 'l', d: 0.5 }); sfx('blip', T('e1', 'CMD') - 0.2, { p: -0.3 });
  appear(d93, T('e1', 'NT') + 0.7); sfx('tick', T('e1', 'NT') + 0.7, { g: 0.5, p: -0.3 });

  sfx('tick', T('e2', '2006') - 0.25, { g: 0.5 });
  slam(y06, T('e2', '2006') - 0.15); sfx('thud', T('e2', '2006') - 0.15, { g: 0.8 });
  appear(tk06, T('e2', '2006') + 0.45); sfx('tick', T('e2', '2006') + 0.45, { g: 0.5 });
  wipe(ps, T('e2', 'PowerShell') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('e2', 'PowerShell') - 0.2, { g: 0.8 });
  appear(d06, T('e2', 'PowerShell') + 0.5); sfx('tick', T('e2', 'PowerShell') + 0.5, { g: 0.5, p: 0.3 });

  sfx('whoosh', T('e3') + 0.15, { g: 0.5, p: 0.3 });
  sfx('tick', T('e3') + 0.3, { g: 0.5, p: 0.3 });
  slam(y26, T('e3', '取代') - 0.5); sfx('thud', T('e3', '取代') - 0.5);

  // ══════════ 站点二：3164 个批处理文件 ══════════
  const DX = 2400;
  const num = h('div', 'n-grot abs', world, '0'); px(num, 80 + DX, 150); css(num, { fontSize: '400px' });
  countTo(num, 0, 3164, T('e4', '三千一百六十四') - 0.5, 1.4, (v) => String(Math.round(v)));
  const n1 = h('div', 't-note nowrap abs', world, '一台 Windows 11 开发机 · .bat 与 .cmd'); px(n1, 1090 + DX, 320);
  const n2 = h('div', 't-note nowrap abs', world, '2026-10-01 实测'); px(n2, 1090 + DX, 368);
  const unit = h('div', 't-h2 nowrap abs', world, '个批处理文件'); px(unit, 1090 + DX, 440);
  const segA = h('div', 'blk', world); px(segA, 96 + DX, 660, 0, 96);
  const segB = h('div', 'blk ink', world); px(segB, 1091 + DX, 660, 0, 96);
  const labA = h('div', 't-body nowrap abs', world, 'npm 生成的入口 1824 · 57.6%'); px(labA, 96 + DX, 780);
  const labB = h('div', 't-body nowrap abs', world, '其余 1340'); px(labB, 1091 + DX, 780);
  const names = ['tsc.cmd', 'vite.cmd', 'eslint.cmd', 'npm.cmd'].map((c, i) => { const e = h('div', 'y-mono nowrap abs', world, c); px(e, [2500, 2760, 3000, 3300][i], 580); return e; });
  const n3 = h('div', 'mono-note nowrap abs', world, 'activate.bat · gradlew.bat · vcvarsall.bat'); px(n3, 1091 + DX, 850);

  appear(num, T('e4') + 0.71); sfx('whoosh', T('e4') + 0.71, { p: 0.3 });
  wipe(n1, T('e4') + 1.11, { dir: 'l', d: 0.5 }); wipe(n2, T('e4') + 1.26, { dir: 'l', d: 0.5 });
  wipe(unit, T('e4') + 1.41, { dir: 'l', d: 0.5 }); sfx('pop', T('e4') + 1.41, { p: 0.3 });
  grow(segA, T('e5') + 0.2, 995, 0.7); grow(segB, T('e5') + 0.35, 733, 0.7);  sfx('whoosh', T('e5') + 0.2, { g: 0.4, p: 0.3 });
  appear(labA, T('e5') + 0.9); appear(n3, T('e5') + 1.2);
  sfx('pop', T('e5') + 0.9, { g: 0.5, p: -0.3 }); sfx('tick', T('e5') + 1.2, { g: 0.5, p: 0.3 });
  names.forEach((e, i) => { const t = T('e5', 'NPM') - 0.6 + i * 0.24; slam(e, t, { from: 1.4 }); sfx('tick', t, { g: 0.6, p: 0.3 }); vanish(e, 0); });
  for (const e of [n1, n2, unit, segA, segB, labA, labB, n3]) vanish(e, 0);
  appear(labB, T('e5') + 1.05); sfx('pop', T('e5') + 1.05, { g: 0.5, p: 0.3 });

  // ══════════ 站点三：4.45% 的 Windows 7 ══════════
  const DX3 = 4800;
  const pct = h('div', 'n-grot abs', world, '4.45%'); px(pct, 80 + DX3, 150); css(pct, { fontSize: '300px' });
  const w7 = h('div', 't-h2 nowrap abs', world, 'Windows 7'); px(w7, 960 + DX3, 400);
  const s11 = h('div', 'blk ink', world); px(s11, 80 + DX3, 620, 0, 96);
  const s10 = h('div', 'blk ink', world); px(s10, 982 + DX3, 620, 0, 96);
  const s7 = h('div', 'blk', world); px(s7, 1673 + DX3, 620, 0, 96);
  const l11 = h('div', 't-body nowrap abs', world, 'Windows 11 53.89%'); px(l11, 80 + DX3, 740);
  const l10 = h('div', 't-body nowrap abs', world, 'Windows 10 41.14%'); px(l10, 982 + DX3, 740);
  const l7 = h('div', 't-body nowrap abs', world, 'Windows 7 4.45%'); px(l7, 1500 + DX3, 740);
  const cn = h('div', 't-note nowrap abs', world, 'StatCounter · 2026 年 9 月 · 中国 · 桌面 Windows 版本份额（按网页访问量）'); px(cn, 80 + DX3, 830);
  for (const e of [s11, s10, s7, l11, l10, l7, cn]) vanish(e, 0);
  slam(pct, T('e6') + 0.81); sfx('thud', T('e6') + 0.81);
  grow(s11, T('e6', '百分之四') - 0.05, 894, 0.8); grow(s10, T('e6', '百分之四') + 0.1, 683, 0.8); grow(s7, T('e6', '百分之四') + 0.25, 74, 0.8);
  sfx('tick', T('e6', '百分之四') - 0.05, { g: 0.5 }); sfx('tick', T('e6', '百分之四') + 0.35, { g: 0.5 });
  wipe(w7, T('e6', 'Windows 七') - 0.3, { dir: 'l', d: 0.5 }); sfx('pop', T('e6', 'Windows 七') - 0.3, { p: 0.3 });
  appear(l11, T('e6', 'Windows 七') + 0.2); appear(l10, T('e6', 'Windows 七') + 0.35); appear(l7, T('e6', 'Windows 七') + 0.5);
  sfx('tick', T('e6', 'Windows 七') + 0.2, { g: 0.5, p: -0.3 }); sfx('tick', T('e6', 'Windows 七') + 0.5, { g: 0.5, p: 0.3 });
  appear(cn, T('e6', '百分之四') + 1.3); sfx('pop', T('e6', '百分之四') + 1.3, { g: 0.5, p: -0.4 });

  // ══════════ 站点四：两台机器，同样的输出 ══════════
  const DX4 = 7200;
  const mkMon = (x, hdTxt) => {
    const el = h('div', 'slab now', world); px(el, x, 130, 740);
    h('div', 'hd', el, hdTxt);
    const rs = [0, 1, 2].map((i) => h('div', 'row', el, String(i + 1)));
    return { el, rs };
  };
  const monA = mkMon(96 + DX4, 'Windows Server 2008 · 6.0.6003');
  const monB = mkMon(1056 + DX4, 'Windows 11 · 10.0.26220');
  const same = h('div', 't-h2 nowrap abs', world, '同一个脚本，同样的输出'); px(same, 96 + DX4, 720);
  const tagA = tagAt(world, 'amber', 'PowerShell 1.0', 96 + DX4, 600);
  const tagB = tagAt(world, 'ink', 'PowerShell 5.1 / 7.6', 1056 + DX4, 600);
  wipe(monA.el, T('e7') + 0.75, { dir: 'b', d: 0.5 }); sfx('whoosh', T('e7') + 0.75, { p: -0.3 });
  wipe(monB.el, T('e7') + 0.90, { dir: 'b', d: 0.5 }); sfx('whoosh', T('e7') + 0.90, { p: 0.3 });
  sfx('thud', T('e7') + 1.20, { g: 0.5 });
  monA.rs.forEach((r) => vanish(r, 0)); monB.rs.forEach((r) => vanish(r, 0));
  for (let i = 0; i < 3; i++) {
    const t = T('e7', '二零零八年') + 0.15 + i * 0.25;
    appear(monA.rs[i], t); sfx('blip', t, { p: -0.4 });
    appear(monB.rs[i], t + 0.07); sfx('blip', t + 0.07, { p: 0.4 });
  }
  sfx('chime', T('e7', '二零零八年') + 0.95, { g: 0.7 });
  wipe(same, T('e7', '输出') - 0.25, { dir: 'l', d: 0.5 }); sfx('pop', T('e7', '输出') - 0.25, { g: 0.8 });
  slam(tagA, T('e8', '一点') - 0.25); sfx('pop', T('e8', '一点') - 0.25, { p: -0.4 });
  slam(tagB, T('e8', '一点') - 0.05); sfx('tick', T('e8', '一点') - 0.05, { g: 0.6, p: 0.4 });
  vanish(same, 0); vanish(tagA, 0); vanish(tagB, 0);

  // ══════════ 站点五：两段引文 ══════════
  const DX5 = 9600;
  const no = h('div', 't-h1 nowrap abs', world, '不会移除'); px(no, 160 + DX5, 150); css(no, { fontSize: '128px' });
  const q1 = h('div', 'abs', world, 'The Windows Cmd / Command-Line shell is <span class="hl">NOT being removed</span> from Windows in the near or distant future!');
  px(q1, 160 + DX5, 340, 1560); css(q1, { font: '700 44px/1.35 "Grot", "Sans SC"' });
  const src1 = h('div', 't-note nowrap abs', world, '微软官方博客 · Rich Turner · 2017-01-04'); px(src1, 160 + DX5, 520);
  const q2 = h('div', 'abs', world, 'Much of the automated system that builds and tests Windows itself is a collection of many <span class="hl">Cmd scripts</span>');
  px(q2, 160 + DX5, 580, 1560); css(q2, { font: '700 44px/1.35 "Grot", "Sans SC"' });
  const src2 = h('div', 't-note nowrap abs', world, '微软官方博客 · Rich Turner · 2017-01-04'); px(src2, 160 + DX5, 780);
  for (const e of [q1, q2, src1, src2, no]) vanish(e, 0);
  wipe(q1, T('e9', '微软') - 0.25, { dir: 'l', d: 0.5 }); sfx('whoosh', T('e9', '微软') - 0.25, { g: 0.5 });
  slam(no, T('e9', '不会') - 0.4); sfx('thud', T('e9', '不会') - 0.4);
  appear(src1, T('e9', '不会') + 0.6); sfx('pop', T('e9', '不会') + 0.6, { g: 0.5, p: -0.3 });
  exit(q1, T('e10') - 0.35, { y: -60, d: 0.35 }); exit(src1, T('e10') - 0.3, { y: -60, d: 0.35 });
  sfx('whoosh', T('e10') - 0.35, { g: 0.35, p: -0.3 });
  wipe(q2, T('e10') - 0.15, { dir: 'l', d: 0.5 }); sfx('whoosh', T('e10') - 0.15, { g: 0.5 });
  appear(src2, T('e10') + 0.7); sfx('pop', T('e10') + 0.7, { g: 0.5, p: -0.3 });
  sfx('tick', T('e10', 'CMD') - 0.1, { p: 0.3 });

  // ── 镜头：跨站点与推近锚在词上，缓慢漂移用 null ──
  camTrack(cam, s.start, { x: 960, y: 484, z: 1 }, [
    [T('e1') - 0.67, { x: 960, y: 450, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 880, y: 440, z: 1.06 }, 2.3, { ease: 'none', sfx: false }],
    [T('e2') - 0.50, { x: 1060, y: 440, z: 1.06 }, 2.0, { ease: 'none', sfx: false }],
    [null, { x: 1180, y: 430, z: 1.02 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 1160, y: 440, z: 1.0 }, 1.2, { ease: 'none', sfx: false }],
    [T('e4') + 0.50, { x: 960 + DX, y: 470, z: 1 }, 0.75],
    [null, { x: 970 + DX, y: 460, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 975 + DX, y: 470, z: 1.05 }, 2.4, { ease: 'none', sfx: false }],
    [null, { x: 970 + DX, y: 480, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 965 + DX, y: 470, z: 1.02 }, 0.9, { ease: 'none', sfx: false }],
    [T('e6') + 0.11, { x: 960 + DX3, y: 470, z: 1 }, 0.75],
    [null, { x: 970 + DX3, y: 460, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 975 + DX3, y: 470, z: 1.05 }, 1.4, { ease: 'none', sfx: false }],
    [T('e7') - 0.04, { x: 960 + DX4, y: 470, z: 1 }, 0.75],
    [null, { x: 965 + DX4, y: 450, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 970 + DX4, y: 460, z: 1.04 }, 2.4, { ease: 'none', sfx: false }],
    [T('e8', '一点') - 1.44, { x: 800 + DX4, y: 430, z: 1.18 }, 1.0],
    [null, { x: 790 + DX4, y: 425, z: 1.2 }, 1.35, { ease: 'none', sfx: false }],
    [T('e9') - 0.10, { x: 960 + DX5, y: 470, z: 1 }, 0.75],
    [null, { x: 965 + DX5, y: 460, z: 1.03 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 970 + DX5, y: 450, z: 1.05 }, 1.5, { ease: 'none', sfx: false }],
    [null, { x: 975 + DX5, y: 440, z: 1.07 }, 2.6, { ease: 'none', sfx: false }],
    [null, { x: 980 + DX5, y: 440, z: 1.09 }, 2.4, { ease: 'none', sfx: false }],
  ]);
});
