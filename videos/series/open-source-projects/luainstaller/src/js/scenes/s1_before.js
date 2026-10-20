// 01 在它之前：srlua 与 luastatic 是怎么做的、缺什么；最后放在一起对照，引出 luainstaller
// 命令与回显是 research/lab/v2 里的实测原文（干净的 Fedora 44 容器）；对照表每一格的依据见 research/FACTS.md
scene('before', ({ root, s, c0 }) => {
  const st = stageOf(root, 'paper'); const { world, cam } = st;
  chapter(root, s); emblem(st, s);
  const D = window.DATA, S = D.srlua, LS = D.luastatic;
  const g = gfx(world);

  // ── 两个名字 ──
  const tN = T('b1') - 0.15;
  const nA = head(world, M - 6, 150, 'srlua', 'd-hero', tN, { d: 0.9 });
  const nB = head(world, M - 6, 420, 'luastatic', 'd-hero', tN + 0.16, { d: 0.9 });
  sfx('thud', tN + 0.05, { g: 0.7 });
  cam.at(c0 - 0.2, 0, 0, 1.05); cam.hold(c0, 0, 0, 2.4, 1);

  // ── srlua ──
  const tS = T('b2');
  sink(nB, tS - 0.25, { d: 0.45 });
  tl.to(nA, { scale: 150 / 236, y: -62, x: 2, transformOrigin: '0 0', duration: 0.9, ease: 'expo.inOut' }, tS - 0.2);
  note(world, M, 240, 'Luiz Henrique de Figueiredo · srlua-103 · 2026-09', tS + 0.55);
  ruleIn(world, M, 288, W - 2 * M, tS + 0.3, { d: 1.0, h: 2 });
  const term = makeTerm(world, M, 304, 40, { lh: 1.42 });
  const mk_ = 'make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64';
  const e1 = term.cmd(T('b3') - 0.05, mk_, { cps: 30 });
  term.out(e1, S.make.map((l) => l.replace('-std=c99 -Wall -Wextra -Wfatal-errors -O2', '…')), { cls: 'd sm2', step: 0.12 });   // 编译选项从略
  const e2 = term.cmd(T('b4') - 0.1, home(S.glue_cmd), { cps: 36 });
  const e3 = term.cmd(T('b6') - 0.2, 'cd /tmp && ~/moon/moon-srlua 2026-10-01', { cps: 34 });
  const k1 = "module 'moon.phase' not found";
  const tE1 = Math.max(e3, T('b6', { zh: '模块就', en: 'they' }) - 0.2);
  const err1 = term.out(tE1, [span(S.elsewhere[0], k1)], { html: true, cls: 'sm2', sfx: 'error' });
  hl(err1[0].querySelector('[data-k]'), tE1 + 0.35);
  const e4 = term.cmd(T('b7') - 0.1, 'env PATH=~/bin:/usr/bin moon-srlua 2026-10-01', { cps: 34 });
  const k2 = 'cannot open moon-srlua';
  const tE2 = Math.max(e4, T('b7', { zh: '打不开', en: 'cannot' }) - 0.15);
  const err2 = term.out(tE2, [span(S.path[0], k2)], { html: true, cls: 'sm2', sfx: 'error' });
  hl(err2[0].querySelector('[data-k]'), tE2 + 0.35);

  // 示意：解释器是一个实心圆，脚本接在它后面；三个模块留在原地（空心）。换目录运行时，被带走的只有前两者
  const GY = 838, AX = M + 88, AR = 88, BR = 56, BX = AX + AR + BR - 10;
  const dA = disc(g, AX, GY, AR, NAVY);
  const dB = svg('circle', { cx: BX, cy: GY, r: BR - 1.5, fill: PAPER, stroke: NAVY, 'stroke-width': 3 }, g);
  const lA = h('div', 'abs mono', world, 'srlua'); px(lA, AX - 70, GY - 22, 140); css(lA, { fontSize: '36px', lineHeight: '44px', textAlign: 'center', color: PAPER, fontWeight: 600 });
  const lB = h('div', 'abs mono', world, 'main<br>.lua'); px(lB, BX - 54, GY - 31, 108); css(lB, { fontSize: '26px', lineHeight: '31px', textAlign: 'center', fontWeight: 600 });
  const tMk = Math.max(e1, T('b3', { zh: '解释器', en: 'interpreter' }) - 0.1);
  popIn(dA, tMk, AX, GY, { d: 0.6 }); fadeIn(lA, tMk + 0.25, { d: 0.3 }); sfx('pop', tMk, { p: -0.5 });
  const tG = Math.max(e2 - 0.25, T('b4', { zh: '接在', en: 'appends' }) - 0.1);
  fromTo([dB, lB], tG, { x: 520, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'power4.in' });
  tl.fromTo([dA, lA], { x: 0 }, { x: -9, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, tG + 0.55);
  impact(g, BX - BR + 6, GY, 10, 70, tG + 0.55, NAVY, { d: 0.5 });
  sfx('whoosh', tG, { g: 0.5 }); sfx('thud', tG + 0.55, { g: 0.9 });
  const nm = note(world, BX + BR + 22, GY - 34, `moon-srlua<br>${fmt(S.size)} ${tr('字节', 'bytes')}`, tG + 0.8, { cls: 't-note mono', css: { fontSize: '27px', lineHeight: '34px' } });
  const mods = ['moon.phase', 'moon.julian', 'moon.names'].map((n, i) => {
    const x = M + 560 + i * 250, c = ring(g, x + 16, GY, 15, NAVY, 3);
    const l = h('div', 'abs mono', world, n); px(l, x + 44, GY - 20); css(l, { fontSize: '30px', lineHeight: '40px' });
    const t = T('b5', { zh: 'require', en: 'Required' }) - 0.2 + i * 0.12;
    popIn(c, t, x + 16, GY, { d: 0.45 }); fadeIn(l, t + 0.05, { x: -12, d: 0.4 }); sfx('pop', t, { g: 0.5, p: 0.1 + i * 0.25 });
    return [c, l];
  });
  // 换目录：一条竖线分出 /tmp，可执行文件被带过去
  const VX = 1424, tMv = T('b6') - 0.1, DX = 1456 - M;
  const dv = seg(g, VX, GY - 96, VX, GY + 84, NAVY, 2, { opacity: 0.4 }); draw(dv, tMv, 0.5);
  const r1 = note(world, M + 560, GY - 76, '~/moon', tMv, { cls: 't-note mono', css: { fontSize: '26px' } });
  const r2 = note(world, VX + 46, GY - 136, '/tmp', tMv + 0.1, { cls: 't-note mono', css: { fontSize: '26px' } });
  fadeOut(nm, tMv, { d: 0.25 });
  tl.to([dA, lA, dB, lB], { x: DX, duration: 0.9, ease: 'expo.inOut' }, tMv + 0.25);
  sfx('whoosh', tMv + 0.25, { g: 0.6, p: 0.5 });
  mods.forEach(([c], i) => tl.fromTo(c, { scale: 1, svgOrigin: `${M + 576 + i * 250} ${GY}` }, { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, tE1 + 0.35 + i * 0.06));
  cam.hold(T('b3'), 0, 0, Tend('b7') - T('b3') + 0.4);

  // ── luastatic ──
  const YL = 1300, tL = T('b9');
  cam.go(tL - 0.75, 0, YL);
  head(world, M - 4, YL + 84, 'luastatic', 'd-1', tL - 0.1, { d: 0.9 });
  note(world, M, YL + 262, 'ers35 · luastatic 0.0.12 · 2020', tL + 0.5);
  ruleIn(world, M, YL + 312, W - 2 * M, tL + 0.25, { d: 1.0, h: 2 });
  // 做法：源码 → C 数组 → 与 liblua.a 一起编译
  const FY = YL + 404, flow = [['main.lua + 3', 38, true], ['main.luastatic.c', 38, true], ['main', 52, true]];
  const fx = [M + 40, M + 560, M + 1180];
  const tF = T('b10') + 0.15;
  flow.forEach(([name, r], i) => {
    const d = disc(g, fx[i], FY, r, NAVY); const t = i === 0 ? tF : i === 1 ? T('b10', { zh: 'C 数组', en: 'C arrays' }) - 0.1 : T('b10', { zh: '一起编译', en: 'compiles' }) + 0.2;
    popIn(d, t, fx[i], FY, { d: 0.5 }); sfx('pop', t, { g: 0.6, p: -0.4 + i * 0.4 });
    const l = h('div', 'abs mono', world, name); px(l, fx[i] + r + 18, FY - 22); css(l, { fontSize: '32px', lineHeight: '44px', fontWeight: 600 }); fadeIn(l, t + 0.1, { x: -12, d: 0.4 });
    if (i > 0) { const ln = seg(g, fx[i - 1] + (i === 1 ? 300 : 400), FY, fx[i] - r - 18, FY, NAVY, 3); draw(ln, t - 0.35, 0.4); }
  });
  note(world, fx[1] + 56, FY + 28, `${fmt(LS.sizes['main.luastatic.c'])} ${tr('字节', 'bytes')}`, T('b10', { zh: 'C 数组', en: 'C arrays' }) + 0.2, { cls: 't-note mono', css: { fontSize: '25px' } });
  note(world, fx[2] + 70, FY + 28, `${fmt(LS.sizes.main)} ${tr('字节', 'bytes')}`, T('b10', { zh: '一起编译', en: 'compiles' }) + 0.5, { cls: 't-note mono', css: { fontSize: '25px' } });
  const la = svg('circle', { cx: fx[2] - 150, cy: FY - 86, r: 26, fill: PAPER, stroke: NAVY, 'stroke-width': 3 }, g);
  const tA = T('b10', { zh: '静态库', en: 'static' }) - 0.1;
  popIn(la, tA, fx[2] - 150, FY - 86, { d: 0.45 }); note(world, fx[2] - 112, FY - 106, 'liblua.a', tA + 0.1, { cls: 'abs mono', css: { fontSize: '30px', fontWeight: 600 }, y: 0, x: -10 });
  draw(seg(g, fx[2] - 130, FY - 68, fx[2] - 56, FY - 22, NAVY, 3), tA + 0.2, 0.35);

  // 那条命令：镜头跟着光标向右走
  const SZ = 56, CW = SZ * 0.6, LY = YL + 560, lsCmd = LS.cmd;
  const t2 = makeTerm(world, M, LY, SZ, { lh: 1.5 });
  const t0 = T('b11') - 0.3, t1 = Tend('b12') - 0.45, cps = lsCmd.length / (t1 - t0);
  t2.cmd(t0, lsCmd, { cps, sfxGain: 0.8, hold: 99 });
  const X0 = M + 2 * CW, xAt = (i) => X0 + i * CW;
  const lead = 1500 - 960, iGo = (960 + lead - X0) / CW;
  tl.to(cam.st, { x: xAt(lsCmd.length) - lead, duration: (lsCmd.length - iGo) / cps, ease: 'none' }, t0 + iGo / cps);
  [[lsCmd.indexOf('main.lua'), 8, tr('入口', 'entry'), { zh: '入口', en: 'entry' }],
    [lsCmd.indexOf('moon/phase.lua'), 45, tr('每一个模块', 'every module'), { zh: '每一个', en: 'every' }],
    [lsCmd.indexOf('/usr/lib64'), 19, tr('静态库的路径', 'the library path'), { zh: '静态库', en: 'library' }]].forEach(([i0, n, label, w]) => {
    const tt = Math.max(T('b11', w) - 0.1, t0 + (i0 + Math.min(n, 6)) / cps);
    ruleIn(world, xAt(i0), LY + 86, n * CW, tt, { d: 0.6, h: 4 });
    note(world, xAt(i0), LY + 104, label, tt + 0.15, { css: { fontSize: '34px', color: NAVY }, y: 10 });
    sfx('blip', tt, { g: 0.7 });
  });
  // 拉远：这条命令有多长；漏写模块会怎样
  const tW = T('b13') - 0.4, fullW = (lsCmd.length + 2) * CW, zW = 1680 / (fullW + 60);
  cam.to(tW, { x: M + fullW / 2, y: YL + 760, z: zW }, { d: 1.25 });
  const cnt = head(world, X0 - 8, LY + 190, String(D.len.luastatic), 'd-2 mono', T('b13', { zh: '越长', en: 'longer' }) - 0.45, { d: 0.7, css: { fontWeight: 700, fontSize: '300px', lineHeight: '1' } });
  note(world, X0 + 420, LY + 308, tr('个字符', 'characters'), T('b13', { zh: '越长', en: 'longer' }) - 0.25, { cls: 'd-1', x: -20, y: 0 });
  sfx('pop', T('b13', { zh: '越长', en: 'longer' }) - 0.45);
  const t3 = makeTerm(world, X0 + 1220, LY + 214, 62, { lh: 1.5 });
  const tM = T('b13', { zh: '漏写', en: 'Leave' }) - 0.15;
  const e5 = t3.cmd(tM, LS.short_cmd, { cps: 40 });
  const k3 = "no module 'moon.phase' in luastatic bundle";
  const o5 = t3.out(Math.max(e5, T('b13', { zh: '运行时', en: 'run time' }) - 0.1), ['$ cd /tmp && ~/moon/main 2026-10-01', `<span data-k>${esc(k3)}</span>`].map((l, i) => (i ? l : `<span class="ps">$ </span>${esc(l.slice(2))}`)), { html: true, step: 0.25, sfx: 'error' });
  if (!LS.short_run.some((l) => l.includes(k3))) console.warn('luastatic 漏写模块的报错与实测不符');
  hl(o5[1].querySelector('[data-k]'), Math.max(e5, T('b13', { zh: '运行时', en: 'run time' }) - 0.1) + 0.6);

  // ── 放在一起看 ──
  const YM = 3300, tT = T('b14');
  cam.go(tT - 0.8, 0, YM);
  const cx = [M + 640, M + 990, M + 1330], RH = 72, TY = YM + 272;
  const heads = ['srlua', 'luastatic', 'luainstaller'].map((n, i) => head(world, cx[i] - 2, YM + 150, `<span>${n}</span>`, 'd-3', tT - 0.25 + i * 0.1, { d: 0.7, css: { fontSize: '56px' } }));
  const rows = [
    [tr('自动发现依赖', 'Finds dependencies itself'), 'no', 'no', 'yes'],
    [tr('多个 Lua 模块', 'Multiple Lua modules'), 'no', ['part', tr('逐个列出', 'listed by hand')], 'yes'],
    [tr('C 模块', 'C modules'), 'no', ['part', tr('仅静态库', 'static libraries only')], 'yes'],
    [tr('自带 Lua 运行时', 'Carries the Lua runtime'), ['part', tr('视编译方式', 'depends on your build')], 'yes', 'yes'],
    [tr('经 PATH 启动', 'Starts through PATH'), 'no', 'yes', 'yes'],
    [tr('目录包与单文件', 'Folder and single file'), ['text', tr('单文件', 'single file')], ['text', tr('单文件', 'single file')], 'yes'],
    [tr('清单与校验', 'Manifest and verification'), 'no', 'no', 'yes'],
    [tr('诊断与日志', 'Diagnostics and logs'), 'no', 'no', 'yes'],
  ];
  hairlines(world, M, TY, W - 2 * M, rows.length, RH, tT + 0.1);
  const tRow = [T('b14', { zh: '两者', en: 'neither' }) - 0.1, 0, 0, 0, 0, 0, T('b16') - 0.05, T('b16', { zh: '诊断', en: 'explains' }) - 0.2];
  for (let i = 1; i < 6; i++) tRow[i] = lerp(Tend('b14') - 0.2, T('b16') - 0.5, (i - 1) / 4);
  const t3col = T('b17', 'luainstaller') - 0.1;
  rows.forEach(([name, a, b, c], i) => {
    const y = TY + i * RH, tt = tRow[i];
    note(world, M, y + 13, name, tT + 0.25 + i * 0.06, { cls: 't-body', css: { fontSize: '36px', lineHeight: '46px' }, x: -14, y: 0 });
    [a, b, c].forEach((v, j) => {
      const kind = Array.isArray(v) ? v[0] : v, txt = Array.isArray(v) ? v[1] : null, tc = j === 2 ? t3col + i * 0.07 : tt + j * 0.12;
      if (kind === 'text') { note(world, cx[j], y + 16, txt, tc, { cls: 't-note', css: { fontSize: '30px', lineHeight: '40px', color: NAVY }, y: 0 }); return; }
      mark(g, kind, cx[j] + 14, y + RH / 2, tc, NAVY, PAPER);
      if (txt) note(world, cx[j] + 40, y + 17, txt, tc + 0.1, { cls: 't-note', css: { fontSize: '28px', lineHeight: '38px' }, y: 0 });
      if (j === 2) sfx('tick', tc, { g: 1, p: 0.5 }); else if (kind !== 'no') sfx('tick', tc, { g: 0.6 });
    });
  });
  hl(heads[2]._in.firstChild, T('b17', 'luainstaller') - 0.15); sfx('thud', T('b17', 'luainstaller') - 0.15, { g: 0.6 });
  cam.hold(tT + 0.4, 0, YM, s.end - tT);
});
