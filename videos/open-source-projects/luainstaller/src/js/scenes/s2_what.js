// 02 它做什么：入口脚本（行星）+ 模块（卫星）+ Lua 运行时（外环）→ 合成一个圆（可执行文件）
// 向下依次是：只写入口的那条命令；PyInstaller 的类比；版本与平台；开源、自身规模与测试矩阵
scene('what', ({ root, s, c0 }) => {
  const st_ = stageOf(root, 'navy'); const { world, cam, fg, dim } = st_;
  chapter(root, s); emblem(st_, s);
  const D = window.DATA;
  const SH = 1240, Y = (i) => i * SH;

  // ── A：三样东西 ──
  const CX = 1330, CY = 484;
  const sys = orbitSystem(world, CX, CY, { fg });
  const st = sys.st;
  const h1 = h('div', 'abs d-1', world); px(h1, M, 120); if (!ZH) css(h1, { fontSize: '128px' });
  const h1a = mk(h1, tr('Lua', 'A packaging')), h1b = mk(h1, tr('打包工具', 'tool for Lua'));
  rise(h1a, T('a1') - 0.15); rise(h1b, T('a1') + 0.02);
  tl.fromTo(st, { orb: 0 }, { orb: 1, duration: 1.2, ease: 'power2.out', immediateRender: true }, T('a1') + 0.2);
  cam.at(c0 - 0.2, 0, 0, 1.05); cam.hold(c0, 0, 0, 3.0, 1);
  const items = [[tr('入口脚本', 'Entry script'), 'a2', { zh: '入口', en: 'entry' }], [tr('require 的模块', 'Required modules'), 'a3', { zh: '模块', en: 'modules' }], [tr('Lua 运行时', 'Lua runtime'), 'a4', { zh: 'Lua', en: 'Lua' }]];
  const rows = items.map(([txt, id, w], i) => {
    const row = h('div', 'abs d-3', world); px(row, M, 540 + i * 96);
    const m = mk(row, `<span class="dim" style="display:inline-block;width:1.5em">${i + 1}</span>${txt}`);
    const t = T(id, w) - 0.12; rise(m, t, { d: 0.7 });
    return { m, t };
  });
  sys.showPlanet(rows[0].t); impact(sys.g, CX, CY, 100, 190, rows[0].t + 0.25, fg);
  [0, 1, 2].forEach((i) => sys.showMoon(i, rows[1].t + i * 0.18));
  sys.showRing(rows[2].t);

  // ── 合成一个圆 ──
  const tB = T('a5', { zh: '构建', en: 'builds' }) - 0.25;
  rows.forEach((r, i) => sink(r.m, tB - 0.25 + i * 0.05, { d: 0.4 }));
  const tDone = sys.collapse(tB);
  const exe = h('div', 'abs mono', world, 'moon'); px(exe, CX - 160, CY - 34, 320); css(exe, { fontSize: '54px', lineHeight: '68px', textAlign: 'center', color: NAVY, fontWeight: 600 });
  fadeIn(exe, tDone + 0.15, { d: 0.3 });
  const h2 = h('div', 'abs d-1', world); px(h2, M, 120); if (!ZH) css(h2, { fontSize: '128px' });
  const h2a = mk(h2, tr('一个原生', 'One native')), h2b = mk(h2, tr('可执行文件', 'executable'));
  sink(h1a, tB - 0.2, { d: 0.4 }); sink(h1b, tB - 0.15, { d: 0.4 });
  rise(h2a, tB + 0.55); rise(h2b, tB + 0.7);

  // ── 没有 Lua 的机器上运行（干净容器里的实测回显）；输出的月相画在圆上 ──
  const term = makeTerm(world, M, 560, 38, { lh: 1.6 });
  const tC = T('a6') - 0.95;
  const e1 = term.cmd(tC, 'lua -v', { cps: 13 });
  term.out(e1, D.clean.lua, { sfx: 'error', cls: 'd' });
  term.gap(0.6);
  const e2 = term.cmd(Math.max(e1 + 0.6, T('a6') + 0.4), './moon/build/moon/moon 2026-10-01', { cps: 30 });
  term.out(e2, D.clean.moon, { sfx: 'chime' });
  const ph = moonPhase(sys.g, CX, CY, 176, 0.78, true, fg, '#2b2ba1');
  fromTo(ph, e2 + 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.inOut' });
  fadeOut(exe, e2, { d: 0.3 });
  impact(sys.g, CX, CY, 176, 330, e2 + 0.15, fg);

  // ── B：只写入口 ──
  {
    const y0 = Y(1), t = T('a7');
    cam.go(t - 0.75, 0, y0);
    const SZ = 134, CW = SZ * 0.6, cmd = D.luai_short.cmd;
    const tm = makeTerm(world, M - 4, y0 + 96, SZ, { lh: 1.3 });
    const eA = tm.cmd(t - 0.2, cmd, { cps: 15, hold: 99 });
    const X0 = M - 4 + 2 * CW;
    ruleIn(world, X0, y0 + 96 + 180, cmd.length * CW, eA - 0.25, { d: 0.6, h: 5 });
    const c16 = head(world, X0 - 2, y0 + 306, String(D.len.luai), 'd-2 mono', eA - 0.1, { d: 0.6, css: { fontWeight: 700 } });
    note(world, X0 + 150, y0 + 332, tr('个字符', 'characters'), eA + 0.05, { cls: 'd-3', x: -14, y: 0 });
    // 上一章那条命令，作为对照（同一字号下的长度）
    const ls = D.luastatic.cmd, c2 = 26 * 0.6;
    const cmp = note(world, X0, y0 + 492, `<span class="dim">$ </span>${esc(ls)}`, T('a7', { zh: '模块', en: 'finds' }) - 0.5, { cls: 'abs mono dim', css: { fontSize: '26px', lineHeight: '44px' }, x: -20, y: 0 });
    ruleIn(world, X0 + 2 * c2, y0 + 536, ls.length * c2, T('a7', { zh: '模块', en: 'finds' }) - 0.35, { d: 0.8, h: 2, a: 0.5 });
    note(world, X0 + 2 * c2 + ls.length * c2 + 18, y0 + 494, String(D.len.luastatic) + ' ' + tr('个字符', 'characters'), T('a7', { zh: '模块', en: 'finds' }) + 0.2, { cls: 't-note', css: { fontSize: '26px', lineHeight: '40px' }, y: 0 });
    const t4 = makeTerm(world, M, y0 + 640, 44, { lh: 1.6 });
    t4.out(Math.max(eA + 0.5, T('a7', { zh: '由它', en: 'It finds' })), D.luai_short.out, { step: 0.3, sfx: 'chime' });
    cam.hold(t + 0.4, 0, y0, Tend('a7') - t + 0.5);
  }

  // ── C：Python / PyInstaller，Lua / luainstaller ──
  {
    const y0 = Y(2), tP = T('a8');
    cam.go(tP - 0.75, 0, y0);
    const colB = M + 660;
    const mkRow = (y, a, b, dimmed) => { const r1 = mk(world, a, 'd-1'), r2 = mk(world, b, 'd-1'); at(r1, M, y); at(r2, colB, y); if (dimmed) { r1.classList.add('dim'); r2.classList.add('dim'); } return [r1, r2]; };
    const [p1, p2] = mkRow(y0 + 150, 'Python', 'PyInstaller', true);
    const [l1, l2] = mkRow(y0 + 440, 'Lua', 'luainstaller', false);
    ruleIn(world, M, y0 + 388, W - 2 * M, tP + 0.1, { d: 1.0 });
    rise(p1, tP - 0.1); rise(p2, T('a8', 'PyInstaller') - 0.12);
    rise(l1, T('a8', { zh: 'Lua 有', en: 'Lua has' }) - 0.12); rise(l2, T('a8', 'luainstaller') - 0.15);
    sfx('pop', tP - 0.1, { g: 0.5 }); sfx('thud', T('a8', 'luainstaller') - 0.1, { g: 0.8 });
    cam.hold(tP + 0.4, 0, y0, Tend('a8') - tP + 0.4);
  }

  // ── D：版本与平台（各平台的架构与工具链取自 README 与 docs/PLATFORMS-NATIVE-LIMITS.adoc）──
  {
    const y0 = Y(3), tV = T('a9');
    cam.go(tV - 0.7, 0, y0);
    const cw = (W - 2 * M) / 5;
    head(world, M, y0 + 96, tr('官方 Lua', 'Official Lua'), 'd-3', tV - 0.1);
    ['5.1', '5.2', '5.3', '5.4', '5.5'].forEach((v, i) => {
      const t = T('a9', { zh: '官方', en: 'official' }) - 0.1 + i * 0.13;
      head(world, M + i * cw, y0 + 190, v, 'd-1', t, { d: 0.7, css: { fontSize: '190px' } }); sfx('tick', t + 0.05, { g: 1.2, p: -0.6 + i * 0.3 });
    });
    ruleIn(world, M, y0 + 470, W - 2 * M, T('a10') - 0.3, { d: 1.0 });
    const plats = [
      ['Linux', ['x86 · x86_64', 'ARM · ARM64', 'cc · gcc · clang'], 'a10', 'Linux'],
      ['Windows', [tr('XP SP3 起', 'XP SP3 and later'), 'x86 · x86_64', 'ARM · ARM64', 'MSVC · MinGW-w64'], 'a10', 'Windows'],
      ['macOS', ['x86_64 · ARM64', 'Xcode Command', 'Line Tools'], 'a10', 'macOS'],
      ['FreeBSD', ['cc'], 'a11', 'FreeBSD'],
      ['Android', ['Termux · clang'], 'a11', 'Android'],
    ];
    let xpEl = null;
    plats.forEach(([name, notes, id, w], i) => {
      const t = T(id, w) - 0.12;
      head(world, M + i * cw, y0 + 520, name, 'd-3', t, { d: 0.7, css: { fontSize: '64px' } }); sfx('pop', t, { g: 0.5, p: -0.6 + i * 0.3 });
      notes.forEach((ln, j) => {
        const n = note(world, M + i * cw, y0 + 622 + j * 44, `<span>${ln}</span>`, t + 0.25 + j * 0.08, { css: { fontSize: '28px', whiteSpace: 'nowrap' }, y: 10 });
        if (name === 'Windows' && j === 0) xpEl = n.firstChild;
      });
    });
    xpEl.classList.add('bright');
    hl(xpEl, T('a12', 'XP') - 0.15); sfx('blip', T('a12', 'XP') - 0.15);
    cam.hold(T('a10'), 0, y0, Tend('a12') - T('a10') + 0.5);
  }

  // ── E：开源；它自己的规模（用它打包出的 ltokei 统计自身源码）；每次改动的测试矩阵 ──
  {
    const y0 = Y(4), t = T('a13');
    cam.go(t - 0.75, 0, y0);
    head(world, M, y0 + 96, tr('开源', 'Open source'), 'd-3', t - 0.1);
    head(world, M - 4, y0 + 176, 'LGPL-3.0-or-later', 'd-2 mono', T('a13', { zh: 'L G P L', en: 'L G P L' }) - 0.25, { d: 0.8, css: { fontWeight: 700, fontSize: '104px' } });
    note(world, M, y0 + 318, 'github.com/Water-Run/luainstaller', T('a13', { zh: 'L G P L', en: 'L G P L' }) + 0.4, { cls: 'abs mono', css: { fontSize: '36px' } });
    ruleIn(world, M, y0 + 412, W - 2 * M, t + 0.3, { d: 1.0 });
    // 左：自身规模
    const tk = D.ltokei, tL = Tend('a13') - 0.5;
    head(world, M, y0 + 446, tr('用 Lua 写成', 'Written in Lua'), 'd-3', tL, { d: 0.7 });
    const tb = makeTerm(world, M, y0 + 544, 31, { lh: 1.6 });
    tb.out(tL + 0.3, [`<span class="ps">$ </span>env -i ~/ltokei/ltokei ~/luainstaller-src/src`].concat(tk.map((l, i) => (i === 3 ? `<span data-k>${esc(l.trimEnd())}</span>` : esc(l)))), { html: true, step: 0.09, sfx: 'tick' });
    hl(tb.el.querySelector('[data-k]'), tL + 1.3);
    // 右：测试矩阵
    const XR = M + 900, tC = T('a15');
    head(world, XR, y0 + 446, tr('每次改动都测', 'Tested on every change'), 'd-3', tC - 0.15, { d: 0.7 });
    const vs = ['5.1', '5.2', '5.3', '5.4', '5.5'], g = gfx(world);
    vs.forEach((v, i) => note(world, XR + 380 + i * 84 - 24, y0 + 548, v, tC + 0.2 + i * 0.05, { cls: 'abs mono', css: { fontSize: '30px', lineHeight: '40px', width: '48px', textAlign: 'center' }, y: 0 }));
    [['Linux x86_64', [1, 1, 1, 1, 1]], ['Windows x86_64 (MSVC)', [1, 1, 1, 1, 1]], ['Linux x86', [0, 0, 0, 1, 0]]].forEach(([name, cells], r) => {
      const y = y0 + 618 + r * 68;
      note(world, XR, y - 20, name, tC + 0.3 + r * 0.12, { cls: 'abs mono', css: { fontSize: '27px', lineHeight: '40px' }, x: -12, y: 0 });
      cells.forEach((on, i) => { if (!on) return; const tt = (r === 0 ? T('a15', 'Linux') : r === 1 ? T('a15', 'Windows') : Tend('a15') - 1.1) + i * 0.09; mark(g, 'yes', XR + 380 + i * 84, y, tt, fg); sfx('tick', tt, { g: 0.9, p: 0.4 }); });
    });
    note(world, XR, y0 + 618 + 3 * 68 - 14, tr('发布前真机验证：Linux ARM64 · macOS ARM64', 'On real hardware before releases: Linux ARM64 · macOS ARM64'), Tend('a15') - 0.6, { css: { fontSize: '26px' } });
    cam.hold(t + 0.5, 0, y0, s.end - t);
  }
});
