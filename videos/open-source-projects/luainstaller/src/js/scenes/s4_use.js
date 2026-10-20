// 04 使用（上）：四步工作流的总览；一次完整的会话（左边是终端，右边是随之变化的图）
// 会话里的命令与回显取自 research/lab/v2/out_11_usage.txt（干净的 Fedora 44 容器，用户 waterrun，项目在 ~/moon）
const USE = [];          // 各屏的构建函数，后半部分在 s4_use2.js
// 各屏在 world 里的纵向位置。镜头一屏一屏向下走
const UY = { over: 0, s1: 1240, s2: 2480, s3: 3720, s4: 4960, modes: 6200, native: 7440, opts: 9180, api: 10420, web: 11660 };
scene('use', ({ root, s, c0 }) => {
  const st = stageOf(root, 'navy'); const { world, cam, hud, fg } = st;
  chapter(root, s); emblem(st, s);
  const D = window.DATA;
  const ctx = { st, world, cam, hud, fg, s, c0, D, C: D.cmd, out: { cls: 'sm2', step: 0.06 } };
  for (const part of USE) part(ctx);
});

// ── 0 总览：四步 ──
USE.push(({ world, cam, c0 }) => {
  const t = T('u1'), cw = (W - 2 * M) / 4, Y0 = 60;
  cam.at(c0 - 0.2, 0, 0, 1.05); cam.hold(c0, 0, 0, Tend('u1') - c0, 1);
  ruleIn(world, M, Y0 + 150, W - 2 * M, t - 0.25, { d: 1.0 });
  const steps = [
    [tr('分析', 'Analyze'), ['luai -a main.lua'], { zh: '分析', en: 'analyze' }],
    [tr('构建目录包', 'Build a folder'), ['luai -b main.lua', '    -o build/moon'], { zh: '构建', en: 'build' }],
    [tr('验证', 'Test it'), ['env -u LUA_PATH', '    -u LUA_CPATH', '    build/moon/moon'], { zh: '验证', en: 'test' }],
    [tr('单文件', 'Single file'), ['luai -b --file main.lua', '    -o build/moon-onefile'], { zh: '单文件', en: 'single' }],
  ];
  steps.forEach(([name, cmd, w], i) => {
    const x = M + i * cw, tn = t + 0.05 + i * 0.16, tt = Math.max(tn + 0.3, T('u1', w) - 0.25);     // 四个数字先到，名字与命令跟着旁白来
    head(world, x - 8, Y0 + 196, String(i + 1), 'd-hero', tn, { d: 0.8, css: { fontSize: '330px' } });
    head(world, x, Y0 + 566, name, 'd-3', tt + 0.12, { d: 0.7 });
    cmd.forEach((ln, j) => note(world, x + 2, Y0 + 668 + j * 40, ln, tt + 0.3 + j * 0.06, { cls: 'abs mono', css: { fontSize: '26px', lineHeight: '40px' }, a: 0.72 }));
    sfx('pop', tn, { g: 0.7, p: -0.6 + i * 0.4 }); sfx('tick', tt + 0.12, { g: 1, p: -0.6 + i * 0.4 });
  });
});

// ── 1～4 一次完整的会话：左边终端一路向下，右边的图常驻（放在不随镜头动的一层）──
USE.push(({ world, cam, hud, fg, D, C, out }) => {
  const HX = 1540, HY = 470, K = 0.8;
  const sys = orbitSystem(hud, HX, HY, { k: K, fg, labels: false });
  sys.rl.style.display = 'none';
  const gh = sys.g, TW = 40;                                 // TW：终端字号
  // 屏 1：程序与分析
  const y1 = UY.s1, t3 = T('u3');
  cam.go(t3 - 0.75, 0, y1);
  const tA = makeTerm(world, M, y1 + 96, TW, { lh: 1.5 });
  const run = 'lua main.lua 2026-10-01';
  const eA = tA.cmd(t3 + 0.2, run, { cps: 26 });
  tA.out(eA, C[run], out);
  sys.showPlanet(T('u3', { zh: '小程序', en: 'program' }) - 0.15); [0, 1, 2].forEach((i) => sys.showMoon(i, T('u4', { zh: '三个', en: 'three' }) - 0.15 + i * 0.16));
  tA.gap(0.5);
  const an = 'luai -a main.lua';
  const eB = tA.cmd(T('u5') + 0.1, an, { cps: 18 });
  const tOut = Math.max(eB, Tend('u5') - 0.9);
  const ao = tA.out(tOut, C[an], { ...out, step: 0.09 }).map(inl);
  hl(ao[2], tOut + 0.55, T('u6') - 0.1);
  [4, 5, 6].forEach((k, i) => { const tt = tOut + k * 0.09 + 0.05, p = sys.pos(i, tt); impact(gh, p[0], p[1], 16, 46, tt, fg, { d: 0.6 }); sfx('blip', tt, { g: 0.6, p: 0.6 }); });
  // 「这里没有列出的」：三行脚本一起反白
  [4, 5, 6].forEach((k) => hl(ao[k], T('u6') + 0.2, T('u7') - 0.6));
  cam.hold(T('u5'), 0, y1, T('u7') - T('u5') - 0.9);

  // 屏 2：构建，得到目录包
  const y2 = UY.s2, t7 = T('u7');
  cam.go(t7 - 0.8, 0, y2);
  const tB = makeTerm(world, M, y2 + 96, TW, { lh: 1.5 });
  const bd = 'luai -b main.lua -o build/moon';
  const eC = tB.cmd(t7 + 0.1, bd, { cps: 26 });
  const tOk = eC + 0.55;
  tB.out(tOk, C[bd], { ...out, sfx: 'chime', step: 0.12 });
  const tDone = sys.collapse(tOk - 1.0, { r: 132 });
  const nm = h('div', 'abs mono', hud, 'moon'); px(nm, HX - 150, HY - 32, 300); css(nm, { fontSize: '50px', lineHeight: '64px', textAlign: 'center', color: NAVY, fontWeight: 600 });
  const nmK = keyed(nm);
  fadeIn(nm, tDone + 0.15, { d: 0.3 });
  const cap = h('div', 'abs mono', hud, ''); px(cap, HX - 250, HY + 232, 500); css(cap, { fontSize: '28px', lineHeight: '40px', textAlign: 'center', color: fg });
  const capK = keyed(cap);
  capK.at(tDone + 0.2, { html: `build/moon/moon<br><span class="dim">${fmt(D.size.moon)} ${tr('字节', 'bytes')}</span>` });
  fromTo(cap, tDone + 0.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  // 目录树（由实测的 find 结果归并：build/moon 下 16 项）
  const tree = ['build/moon/', '├── moon', '├── THIRD_PARTY_NOTICES.md', '└── .luai/', '    ├── manifest.lua', '    ├── native/liblua-5.4.so', '    ├── licenses/', '    └── build/launcher.c'];
  for (const n of ['moon/moon', 'moon/THIRD_PARTY_NOTICES.md', 'moon/.luai/manifest.lua', 'moon/.luai/native/liblua-5.4.so', 'moon/.luai/licenses', 'moon/.luai/build/launcher.c']) if (!C['find build/moon'].includes(n)) console.warn('目录树与实测不符', n);
  const t8 = T('u8');
  const tEl = tree.map((txt, i) => {
    const m = txt.match(/^([\s│├└─]*)(.*)$/);
    const e = h('div', 'abs mono', world, `<span class="dim">${m[1]}</span><span>${esc(m[2])}</span>`); px(e, M, y2 + 330 + i * 58); css(e, { fontSize: '38px', lineHeight: '58px' });
    fadeIn(e, t8 - 0.1 + i * 0.08, { x: -20, d: 0.4 }); sfx('tick', t8 - 0.1 + i * 0.08, { g: 0.8 });
    return e.lastChild;
  });
  hl(tEl[1], T('u8', { zh: '可执行文件', en: 'executable' }) - 0.1, T('u9') - 0.6); hl(tEl[3], T('u8', '.luai') - 0.1, T('u9') - 0.6);
  // 图：圆外加一圈细环 = 目录包
  const fold = ring(gh, HX, HY, 186, fg, 3); fold.style.opacity = 0;
  const tF = T('u8', { zh: '目录', en: 'folder' }) - 0.1;
  fromTo(fold, tF, { autoAlpha: 0, scale: 1.3, svgOrigin: `${HX} ${HY}` }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
  capK.at(tF + 0.2, { html: `build/moon/<br><span class="dim">${tr('可执行文件', 'executable')} + .luai/</span>` });
  cam.hold(t8, 0, y2, T('u9') - t8 - 0.9);

  // 屏 3：清空搜索路径后运行；包不是沙箱
  const y3 = UY.s3, t9 = T('u9');
  cam.go(t9 - 0.8, 0, y3);
  const tC = makeTerm(world, M, y3 + 96, 34, { lh: 1.6 });
  const ev = 'env -u LUA_PATH -u LUA_CPATH build/moon/moon 2026-10-01';
  const eD = tC.cmd(t9 + 0.1, ev, { cps: 30 });
  tC.out(eD, C[ev], { cls: '', sfx: 'chime' });
  const ph = moonPhase(gh, HX, HY, 132, 0.78, true, fg, '#2b2ba1');
  fromTo(ph, eD + 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.inOut' });
  fadeOut(nm, eD, { d: 0.3 }); impact(gh, HX, HY, 132, 250, eD + 0.15, fg);
  capK.at(eD + 0.2, { html: `2026-10-01<br><span class="dim">waning gibbous · 78% lit</span>` });
  // require 的查找顺序（docs/BUNDLING.adoc）；第 3 行就是「悄悄从本机加载」的那条路
  const t10 = T('u10'), RH = 82;
  head(world, M, y3 + 290, tr('require 的查找顺序', 'Where require looks'), 'd-3', t10 - 0.2, { d: 0.7 });
  const order = [['package.preload', ''], [tr('包内的模块', 'modules inside the executable'), ''], [tr('Lua 文件搜索', 'the usual Lua file search'), tr('本机上的模块也在这里', 'host modules are found here too')], [tr('C 模块搜索', 'the usual C module search'), tr('.luai/native 排在最前', '.luai/native comes first')]];
  hairlines(world, M, y3 + 400, 1100, order.length, RH, t10);
  const oEl = order.map(([a, b], i) => {
    const y = y3 + 400 + i * RH, tt = t10 + 0.1 + i * 0.12;
    note(world, M, y + 16, String(i + 1), tt, { cls: 'abs mono dim', css: { fontSize: '36px', lineHeight: '50px' }, y: 0 });
    const e = note(world, M + 64, y + 16, `<span>${a}</span>`, tt, { cls: 't-body', css: { fontSize: '40px', lineHeight: '50px' }, x: -14, y: 0 });
    if (b) note(world, M + (ZH ? 420 : 620), y + 23, b, tt + 0.2, { css: { fontSize: '28px', lineHeight: '40px' }, y: 0 });
    return e.firstChild;
  });
  hl(oEl[1], T('u10', { zh: '包不是', en: 'bundle' }) + 0.2, T('u10', { zh: '漏打包', en: 'forgotten' }) - 0.1);
  hl(oEl[2], T('u10', { zh: '悄悄', en: 'quietly' }) - 0.2, T('u12') - 0.9); sfx('blip', T('u10', { zh: '悄悄', en: 'quietly' }) - 0.2);
  cam.hold(t10, 0, y3, T('u12') - t10 - 0.9);

  // 屏 4：单文件；目录包与单文件的取舍；Windows
  const y4 = UY.s4, t12 = T('u12');
  cam.go(t12 - 0.8, 0, y4);
  const tD = makeTerm(world, M, y4 + 96, TW, { lh: 1.5 });
  const of = 'luai -b --file main.lua -o build/moon-onefile';
  const eE = tD.cmd(t12 - 0.15, of, { cps: 40, html: esc(of).replace('--file', '<b>--file</b>') });
  tD.out(eE + 0.35, C[of], { ...out, sfx: 'chime', step: 0.12 });
  // 图：一圈粗环从外面收拢，合成一个更大的实心圆：整个目录包都在这一个文件里
  const tW = eE + 0.4;
  const ext = ring(gh, HX, HY, 207, fg, 22); ext.style.opacity = 0;
  fromTo(ext, tW, { autoAlpha: 0, scale: 1.6, svgOrigin: `${HX} ${HY}` }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
  const one = disc(gh, HX, HY, 218, fg); const in1 = ring(gh, HX, HY, 186, NAVY, 3), in2 = ring(gh, HX, HY, 132, NAVY, 3);
  [one, in1, in2].forEach((e) => fromTo(e, tW + 0.42, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }));
  impact(gh, HX, HY, 218, 330, tW + 0.5, fg);
  sfx('whoosh', tW - 0.05, { g: 0.6, p: 0.5 }); sfx('thud', tW + 0.45, { g: 0.8, p: 0.5 });
  fadeOut(ph, tW + 0.3, { d: 0.3 });
  fromTo(nm, tW + 0.55, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  tl.to(cap, { y: 36, duration: 0.5, ease: 'power2.out' }, tW);
  capK.at(tW + 0.5, { html: `build/moon-onefile<br><span class="dim">${fmt(D.size['moon-onefile'])} ${tr('字节，一个文件', 'bytes, one file')}</span>` });
  // 取舍：两行对照（docs/USAGE.adoc）
  const t13 = T('u13'), TY = y4 + 308, CH = 86;
  hairlines(world, M, TY, 1100, 2, CH, t13 - 0.1);
  const cmp = [['--dir', tr('目录包（默认）', 'folder (default)'), tr('直接启动 · 便于检查', 'starts directly · easy to inspect'), T('u13') - 0.05], ['--file', tr('单文件', 'single file'), tr('首次运行先解压 · 只交付一个文件', 'unpacks on first run · one file to ship'), T('u13', { zh: '单文件首次', en: 'A single' }) - 0.2]];
  const cEl = cmp.map(([flag, name, desc, tt], i) => {
    const y = TY + i * CH;
    note(world, M, y + 18, flag, tt, { cls: 'abs mono', css: { fontSize: '36px', lineHeight: '50px', fontWeight: 700 }, y: 0, x: -14 });
    const e = note(world, M + 164, y + 18, `<span>${name}</span>`, tt, { cls: 't-body', css: { fontSize: '36px', lineHeight: '50px', fontWeight: 700 }, y: 0, x: -14 });
    note(world, M + (ZH ? 470 : 500), y + 24, desc, tt + 0.15, { css: { fontSize: '29px', lineHeight: '40px', color: fg }, y: 0, a: 0.85 });
    return e.firstChild;
  });
  hl(cEl[0], T('u15', { zh: '回到', en: 'go back' }) - 0.1, T('u16') - 0.3); sfx('blip', T('u15', { zh: '回到', en: 'go back' }) - 0.1);
  // Windows（实测：Windows 11，MSVC，Lua 5.5）
  const t16 = T('u16'), WY = y4 + 548, WN = D.win;
  head(world, M, WY, 'Windows', 'd-3', t16 - 0.2, { d: 0.7, css: { fontSize: '54px' } });
  note(world, M + 290, WY + 22, D.win_note.replace(/^Windows /, 'Windows '), t16 + 0.15, { css: { fontSize: '26px' } });
  const tE = makeTerm(world, M, WY + 92, 34, { lh: 1.5 });
  const wb = 'luai -b main.lua -o build\\moon';
  const eF = tE.cmd(t16 + 0.2, wb, { cps: 36, prompt: '&gt;' });
  tE.out(eF + 0.15, WN[wb], { cls: 'sm2', step: 0.1 });
  const wr = 'build\\moon\\moon.exe 2026-10-01';
  const eG = tE.cmd(Math.max(eF + 0.6, T('u16', { zh: 'moon 点', en: 'moon dot' }) - 0.75), wr, { cps: 40, prompt: '&gt;' });
  tE.out(eG, WN[wr], { cls: 'sm2', sfx: 'chime' });
  // 图：回到目录包的样子。Windows 上，Lua 的 DLL 就放在 exe 旁边
  for (const f of ['moon.exe', 'lua55.dll', '.luai']) if (!WN['dir /b build\\moon'].includes(f)) console.warn('Windows 目录与实测不符', f);
  const tV = eF + 0.2;
  tl.to([one, in1, in2, ext], { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, tV - 0.1);
  nmK.at(tV, { html: 'moon.exe' }); tl.set(nm, { fontSize: '38px' }, tV);
  const da = -0.62, dx = HX + 161 * Math.cos(da), dy = HY + 161 * Math.sin(da);
  const dll = disc(gh, dx, dy, 14, fg); popIn(dll, tV + 0.25, dx, dy, { d: 0.5 }); impact(gh, dx, dy, 14, 48, tV + 0.3, fg, { d: 0.5 }); sfx('pop', tV + 0.25, { g: 0.7, p: 0.5 });
  capK.at(tV, { html: `build\\moon\\<br><span class="dim">moon.exe + lua55.dll + .luai\\</span>` });
  cam.hold(t13, 0, y4, T('u17') - t13 - 0.9);
  // 会话结束：右侧的图退场
  const tX = T('u17') - 0.8;
  tl.to(gh, { autoAlpha: 0, duration: 0.35 }, tX); fadeOut(cap, tX, { d: 0.3 }); tl.to(nm, { autoAlpha: 0, duration: 0.3 }, tX);
});
