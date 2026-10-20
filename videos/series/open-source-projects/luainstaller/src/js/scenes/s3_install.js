// 03 安装：一行安装；不经 LuaRocks 的安装；构建前提（分步实测）；两个命令、两种写法
// 回显取自 research/lab/v2：out_11_usage.txt（安装）、out_14_prereq.txt（只装 Lua → 加编译器 → 加头文件）
scene('install', ({ root, s, c0 }) => {
  const st = stageOf(root, 'paper'); const { world, cam, fg } = st;
  chapter(root, s); emblem(st, s);
  const D = window.DATA, I = D.install, P = D.prereq;
  const SH = 1240, Y = (i) => i * SH;
  const g = gfx(world);

  // ── 1 安装 ──
  cam.at(c0 - 0.2, 0, 0, 1.05); cam.hold(c0, 0, 0, 2.4, 1);
  const tA = makeTerm(world, M - 2, 100, 84, { lh: 1.4 });
  const eA = tA.cmd(T('i1') + 0.1, 'luarocks install luainstaller', { cps: 26 });
  const tA2 = makeTerm(world, M, 232, 34, { lh: 1.6 });
  tA2.out(eA, I.rocks, { cls: 'd', step: 0.3 });
  const tA3 = makeTerm(world, M, 368, 52, { lh: 1.5 });
  const eV = tA3.cmd(eA + 0.7, 'luai -v', { cps: 16 });
  tA3.out(eV, I.version, { sfx: 'chime' });
  ruleIn(world, M, 566, W - 2 * M, T('i2') - 0.2, { d: 0.9, h: 2 });
  const tB = makeTerm(world, M, 612, 52, { lh: 1.5 });
  const eB = tB.cmd(T('i2') + 0.2, home(I.standalone_cmd), { cps: 30 });
  const tB2 = makeTerm(world, M, 700, 34, { lh: 1.6 });
  tB2.out(eB, I.standalone, { cls: 'd', step: 0.2 });

  // ── 2 构建前提：三样东西，缺的画成空心 ──
  {
    const y0 = Y(1), t = T('i3');
    cam.go(t - 0.75, 0, y0);
    const cw = 510, cy = y0 + 196, RD = 40;                    // 三列靠左排：右上角留给小月亮
    const need = [
      [tr('Lua 解释器', 'Lua interpreter'), 'Lua ' + D.versions.lua, t + 0.05, null],
      [tr('C 编译器', 'C compiler'), 'gcc ' + D.versions.gcc, T('i4', { zh: 'C 编译器', en: 'compiler' }) - 0.2, 1],
      [tr('Lua 头文件与库', 'Lua headers and library'), 'lua.h · liblua', T('i5', { zh: '头文件', en: 'headers' }) - 0.2, 1],
    ];
    const tFill = Tend('i6') + 0.35;
    need.forEach(([name, ver, tt, missing], i) => {
      const x = M + i * cw;
      if (missing) {
        const rg = svg('circle', { cx: x + RD, cy, r: RD - 2, fill: 'none', stroke: fg, 'stroke-width': 4 }, g); popIn(rg, tt, x + RD, cy, { d: 0.5 });
        const dd = disc(g, x + RD, cy, RD, fg); popIn(dd, tFill + i * 0.12, x + RD, cy, { d: 0.5, ease: 'back.out(2.4)' });
        impact(g, x + RD, cy, RD, RD * 2.3, tFill + i * 0.12 + 0.15, fg); sfx('pop', tFill + i * 0.12, { p: -0.3 + i * 0.4 });
      } else { const dd = disc(g, x + RD, cy, RD, fg); popIn(dd, tt, x + RD, cy, { d: 0.5 }); impact(g, x + RD, cy, RD, RD * 2.3, tt + 0.2, fg); }
      sfx('pop', tt, { g: 0.7, p: -0.4 + i * 0.4 });
      head(world, x + 2 * RD + 38, cy - 62, name, 'd-3', tt + 0.05, { d: 0.7, css: { fontSize: ZH ? '56px' : '42px', lineHeight: '80px' } });
      const v = note(world, x + 2 * RD + 40, cy + 22, ver, missing ? tFill + i * 0.12 + 0.1 : tt + 0.3, { cls: 'abs mono', css: { fontSize: '30px' } });
    });
    ruleIn(world, M, y0 + 330, W - 2 * M, t - 0.1, { d: 1.0, h: 2 });
    const tm = makeTerm(world, M, y0 + 362, 46, { lh: 1.5 });
    const e1 = tm.cmd(t + 0.45, 'luai -a main.lua', { cps: 20 });
    tm.out(e1, [P.analyze[0], P.analyze[2]], { cls: 'sm2', step: 0.12 });
    const bc = 'luai -b main.lua -o build/moon';
    const e2 = tm.cmd(T('i6') - 0.55, bc, { cps: 34 });
    const tE = Math.max(e2, T('i6', { zh: '停下', en: 'stops' }) - 0.25);
    const er = tm.out(tE, [span(P.build_fail[0], 'ToolchainError')], { html: true, cls: 'sm2', sfx: 'error' });
    hl(er[0].querySelector('[data-k]'), tE + 0.3);
    const e3 = tm.cmd(tFill + 0.45, bc, { cps: 60, sfxGain: 0.6 });
    tm.out(e3, P.build_ok.map(home), { cls: 'sm2', step: 0.12, sfx: 'chime' });
    cam.hold(t + 0.5, 0, y0, T('i7') - t - 1.2);
  }

  // ── 3 两个命令，同一个工具 ──
  {
    const y0 = Y(2), t2 = T('i7');
    cam.go(t2 - 0.7, 0, y0);
    const colB = M + 700, colC = M + 1440;
    const tw = T('i7', { zh: '两个', en: 'two' });
    const tA_ = Math.min(tw - 0.35, t2 + 0.05), tB_ = Math.min(tw - 0.2, t2 + 0.25);          // 镜头一到，两个名字就升起来
    const hA = head(world, M - 4, y0 + 84, 'luai', 'd-1', tA_), hB = head(world, colB - 4, y0 + 84, 'luainstaller', 'd-1', tB_);
    sfx('pop', tA_, { p: -0.4 }); sfx('pop', tB_, { p: 0.3 });
    const tbl = [
      ['-a', 'analyze', ' main.lua', tr('分析依赖', 'Analyze')], ['-t', 'trace', ' main.lua', tr('追踪解析', 'Trace')], ['-b', 'build', ' main.lua', tr('构建', 'Build')],
      ['-v', 'version', '', tr('版本', 'Version')], ['-h', 'help', '', tr('帮助', 'Help')], ['', 'logs', '', tr('查看日志', 'View logs')],
    ];
    const RY = y0 + 286, RH = 76;
    hairlines(world, M, RY - 8, W - 2 * M, tbl.length, RH, t2 + 0.2);
    tbl.forEach(([f, sub, arg, mean], i) => {
      const y = RY + i * RH;
      const a = h('div', 'abs mono', world, f ? `<span class="dim">luai </span><b>${f}</b><span class="dim">${arg}</span>` : '<span class="dim">—</span>'); px(a, M, y); css(a, { fontSize: '40px', lineHeight: '60px' });
      const b = h('div', 'abs mono', world, `<span class="dim">luainstaller </span><b>${sub}</b><span class="dim">${arg}</span>`); px(b, colB, y); css(b, { fontSize: '40px', lineHeight: '60px' });
      const m = h('div', 'abs t-body', world, mean); px(m, colC, y + 2); css(m, { lineHeight: '56px', fontSize: '34px' });
      const ta = T('i8') - 0.05 + i * 0.11, tb = T('i9') - 0.05 + i * 0.11;
      fadeIn(a, ta, { x: -24, d: 0.45 }); fadeIn(b, tb, { x: -24, d: 0.45 }); fadeIn(m, tb + 0.25, { x: -16, d: 0.4, a: 0.6 });
      sfx('tick', ta, { g: 1.1, p: -0.5 }); sfx('tick', tb, { g: 1.1, p: 0.3 });
    });
    // 不能混用：两条实测的报错
    const tx = T('i10', { zh: '不能', en: "don't" }) - 0.3;
    const tm = makeTerm(world, M, y0 + 760, 34, { lh: 1.55 });
    const mx = I.mix;
    tm.out(tx, [`<span class="ps">$ </span>luai build main.lua   <span class="dim">→</span> <span data-k>${esc(mx[0][0])}</span>`, `<span class="ps">$ </span>luainstaller -b main.lua   <span class="dim">→</span> <span data-k>${esc(mx[1][0])}</span>`], { html: true, step: 0.3, sfx: 'error' });
    cam.hold(T('i8') + 0.3, 0, y0, s.end - T('i8'));
  }
});
