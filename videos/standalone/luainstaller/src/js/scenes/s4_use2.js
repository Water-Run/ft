// 04 使用（下）：三种发现方式、C 模块、选项、库 API、一个大些的例子。各屏接在 s4_use.js 的 USE 后面。
// 回显取自 research/lab/v2/out_11_usage.txt、out_20_web.txt、out_21_clean.txt

// 一组轨道图整体退场（标签的透明度由帧函数接管，所以走 st.lab）
const hideSys = (sys, t) => { tl.to(sys.st, { lab: 0, duration: 0.3 }, t); tl.to(sys.g, { autoAlpha: 0, duration: 0.3 }, t); };

// ── 5 依赖发现的三种方式：同一段程序，换三种方式分析。右边的图里，被发现的模块才是实心的 ──
USE.push(({ world, cam, hud, fg, D }) => {
  const y = UY.modes, t17 = T('u17'), t18 = T('u18'), t19 = T('u19'), t21 = T('u21'), t22 = T('u22'), t23 = T('u23'), tEnd = T('u24') - 0.55;
  cam.go(t17 - 0.8, 0, y, { z: 1.03 }); cam.hold(t17 + 0.4, 0, y, t21 - t17, 1);
  const modes = [['static', tr('静态', 'Static'), tr('默认', 'default')], ['runtime', tr('运行时', 'Runtime'), ''], ['manual', tr('手动', 'Manual'), '']];
  const mx = ZH ? [M, M + 330, M + 730] : [M, M + 370, M + 800];
  const names = modes.map(([flag, name, extra], i) => {
    const tt = t17 + 0.1 + i * 0.16;
    const e = head(world, mx[i] - 10, y + 84, `<span class="hlb">${name}</span>`, 'd-3', tt, { d: 0.7, css: { fontSize: '64px' } });
    note(world, mx[i] + 2, y + 172, `-d ${flag}` + (extra ? `<span class="dim">  ${extra}</span>` : ''), tt + 0.2, { cls: 'abs mono', css: { fontSize: '28px', lineHeight: '40px' } });
    sfx('pop', tt, { g: 0.6, p: -0.5 + i * 0.4 });
    return e._in.firstChild;
  });
  hl(names[0], T('u18', { zh: '静态', en: 'static' }) - 0.1, t21 - 0.15); hl(names[1], t21 - 0.1, t23 - 0.15); hl(names[2], t23 - 0.1, tEnd + 2);
  [T('u18', { zh: '静态', en: 'static' }) - 0.1, t21 - 0.1, t23 - 0.1].forEach((tt) => sfx('blip', tt, { g: 0.7 }));
  ruleIn(world, M, y + 236, 1000, t17 + 0.35, { d: 0.9, h: 2, a: 0.5 });
  // 被分析的程序：模块名在运行时才拼出来
  const CY = y + 262, CL = 58;
  const code = codeBlock(world, D.dyn.src, M, CY, 36, { marks: [['require("drivers." .. name)', 'req']], lh: CL / 36 });
  code.cascade(t18 - 0.5, { step: 0.09 });
  // 静态方式「只读源码」：一条线自上而下扫过
  const scan = h('div', 'rule', world); px(scan, M - 24, CY - 2, 980); css(scan, { height: '3px' });
  const ts = T('u18', { zh: '只读', en: 'reads' });
  fromTo(scan, ts, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.12 });
  tl.fromTo(scan, { y: 0 }, { y: 3 * CL + 4, duration: 0.95, ease: 'power1.inOut', immediateRender: true }, ts);
  tl.to(scan, { autoAlpha: 0, duration: 0.2 }, ts + 0.9);
  sfx('whoosh', ts, { g: 0.35 });
  // 图：入口与两个驱动模块。空心 = 没被发现
  const ds = orbitSystem(hud, 1390, 560, { k: 0.86, fg, bg: NAVY, labSize: 28, speed: 0.14, a0: 0, moons: [{ name: 'drivers.sqlite', hollow: true, a: -0.95 }, { name: 'drivers.mysql', hollow: true, a: -0.95 + Math.PI }] });
  ds.rl.style.display = 'none';
  ds.showPlanet(t18 - 0.35); ds.showMoon(0, t18 - 0.1); ds.showMoon(1, t18 + 0.05);

  // 静态：构建停下，指出是哪一行
  const TY = y + 478, TS = 32;
  const tS = makeTerm(world, M, TY, TS, { lh: 1.5 });
  const eS = tS.cmd(Math.min(T('u18', { zh: '不执行', en: 'runs nothing' }), t19 - 1.0), 'luai -a main.lua', { cps: 30 });
  hl(code.m('req'), T('u19', { zh: '拼出', en: 'computed' }) - 0.25, t21 - 0.3);
  const tErr = Math.max(eS + 0.2, T('u19', { zh: '构建会', en: 'the build' }) - 0.25);
  const [e0, e1] = D.dyn.static, cut = e0.indexOf(' at ') + 3, cut2 = e0.indexOf(': require(') + 1;   // 长行按词折成三行，内容不变
  const errL = tS.out(tErr, [e0.slice(0, cut), e0.slice(cut + 1, cut2), e0.slice(cut2 + 1), e1], { cls: 'sm4', step: 0.07, sfx: 'error' });
  hl(sub(errL[0], 'DynamicRequireError'), tErr + 0.25, t21 - 0.3);
  hl(sub(errL[1], '/home/waterrun/dyn/main.lua:2'), T('u19', { zh: '指出', en: 'points' }) - 0.05, t21 - 0.3);
  tl.to(tS.el, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power2.in' }, t21 - 0.4);

  // 运行时：真的执行一遍。一个小圆点沿着源码逐行走，走到 require 那行，对应的模块被记下
  const gp = gfx(world);
  const runPtr = (te, step, onLoad) => {
    const d = disc(gp, M - 34, CY + CL / 2, 8, fg);
    fromTo(d, te, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 });
    [1, 2].forEach((i) => tl.to(d, { y: CL * i, duration: 0.16, ease: 'power2.inOut' }, te + step * i));
    tl.to(d, { autoAlpha: 0, duration: 0.2 }, te + step * 2 + 0.45);
    [0, 1, 2].forEach((i) => sfx('tick', te + step * i, { g: 0.9 }));
    onLoad(te + step + 0.2);
  };
  const tR = makeTerm(world, M, TY, TS, { lh: 1.5 });
  const r1 = 'luai -a main.lua -d runtime -- mysql', r2 = 'luai -a main.lua -d runtime';
  const eR1 = tR.cmd(t21 + 0.05, r1, { cps: 34 });
  const te1 = Math.max(eR1, T('u21', { zh: '真的', en: 'really' }));
  runPtr(te1, 0.34, (tt) => ds.fill(1, tt));
  const tO1 = Math.max(te1 + 0.9, T('u21', { zh: '记下', en: 'records' }) - 0.1);
  const o1 = tR.out(tO1, D.dyn.runtime_mysql, { cls: 'sm2', step: 0.05 }).map(inl);
  hl(o1[4], tO1 + 0.4, t23 + 0.2);
  tR.gap(0.4);
  // 再运行一次，不带参数：走的是另一条路
  const eR2 = tR.cmd(Tend('u21') + 0.05, r2, { cps: 40 });
  ds.fill(1, eR2 - 0.15, false);
  runPtr(eR2, 0.25, (tt) => ds.fill(0, tt));
  const o2 = tR.out(eR2 + 0.75, D.dyn.runtime_default, { cls: 'sm2', step: 0.05 }).map(inl);
  hl(o2[4], eR2 + 1.0, t23 + 0.2);
  tl.to(tR.el, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power2.in' }, t23 + 0.2);

  // 手动：不扫描，逐个列出
  ds.fill(0, t23 + 0.2, false);
  const tM = makeTerm(world, M, TY, TS, { lh: 1.5 });
  const mc = 'luai -a main.lua -d manual \\\n    --include drivers/sqlite.lua \\\n    --include drivers/mysql.lua';
  if (mc.replace(/ \\\n\s+/g, ' ') !== D.dyn.manual_cmd) console.warn('手动方式的命令与实测不符');
  const tM0 = t23 + 0.45, CPS = 70;
  const eM = tM.cmd(tM0, mc, { cps: CPS });
  ds.fill(0, tM0 + mc.indexOf('sqlite.lua') / CPS + 0.1); ds.fill(1, tM0 + mc.indexOf('mysql.lua') / CPS + 0.1);
  const om = tM.out(eM, D.dyn.manual, { cls: 'sm2', step: 0.05 }).map(inl);
  hl(om[2], eM + 0.3, tEnd + 2);
  hideSys(ds, tEnd + 0.1);
});

// ── 6 C 模块：按 package.cpath 找到，原样复制进 .luai/native ──
USE.push(({ world, cam, hud, fg, D }) => {
  const y = UY.native, t = T('u24'), tLeave = T('u25') - 0.5, N = D.native;
  cam.go(t - 0.55, 0, y);
  const code = codeBlock(world, [N.src], M, y + 92, 44, { marks: [['require("lfs")', 'req']] });
  code.cascade(t - 0.15);
  const tm = makeTerm(world, M, y + 214, 34, { lh: 1.5 });
  const e1 = tm.cmd(t + 0.2, 'luai -a main.lua', { cps: 50 });
  const o1 = tm.out(e1, N.analyze, { cls: 'sm2', step: 0.05 }).map(inl);
  const tFound = Math.max(e1 + 0.3, T('u24', { zh: 'package', en: 'package' }));
  hl(o1[4], tFound, tLeave + 2);
  const e2 = tm.cmd(tFound + 0.3, 'luai -b main.lua -o build/list', { cps: 80 });
  tm.out(e2, N.build, { cls: 'sm2', step: 0.08, sfx: 'chime' });
  const e3 = tm.cmd(e2 + 0.2, 'cd build/list && find .luai/native | sort', { cps: 90 });
  const o3 = tm.out(e3, N.find, { cls: 'sm2', step: 0.05 }).map(inl);
  const tCopy = Math.max(e3 + 0.1, T('u24', { zh: '复制', en: 'copied' }));
  hl(o3[1], tCopy, tLeave + 2);
  // 图：C 模块（空心圆）原本在系统目录里；构建后，它被搬进目录包的那一圈之内
  const HX = 1500, HY = 430, A = -0.52, g = gfx(hud), ms = { r: 250 };
  const ob = orbit(g, HX, HY, 250, 'rgba(243,242,237,.6)'), pl = disc(g, HX, HY, 84, fg), fold = ring(g, HX, HY, 172, fg, 3);
  const mod = svg('circle', { cx: 0, cy: 0, r: 20, fill: NAVY, stroke: fg, 'stroke-width': 3.5 }, g);
  const lab = h('div', 'abs mono', hud, 'lfs.so'); css(lab, { fontSize: '26px', lineHeight: '36px', color: fg });
  const nm = h('div', 'abs mono', hud, 'main.lua'); px(nm, HX - 150, HY - 22, 300); css(nm, { fontSize: '27px', lineHeight: '44px', textAlign: 'center', color: NAVY, fontWeight: 600 });
  const cap = h('div', 'abs mono', hud, ''); px(cap, HX - 300, HY + 286, 600); css(cap, { fontSize: '26px', lineHeight: '38px', textAlign: 'center', color: fg });
  F(() => { const x = HX + ms.r * Math.cos(A), yy = HY + ms.r * Math.sin(A); mod.setAttribute('cx', x.toFixed(2)); mod.setAttribute('cy', yy.toFixed(2)); ob.setAttribute('r', ms.r.toFixed(2)); css(lab, { left: x + 34 + 'px', top: yy - 18 + 'px' }); });
  const x0 = HX + 250 * Math.cos(A), y0 = HY + 250 * Math.sin(A);
  popIn(pl, t - 0.05, HX, HY); fadeIn(nm, t + 0.3, { d: 0.3 }); sfx('pop', t - 0.05, { p: 0.4 });
  fromTo(ob, t + 0.25, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  popIn(mod, tFound - 0.1, x0, y0, { d: 0.5 }); fadeIn(lab, tFound, { d: 0.3 }); impact(g, x0, y0, 20, 60, tFound, fg, { d: 0.55 }); sfx('pop', tFound - 0.1, { g: 0.7, p: 0.5 });
  const capK = keyed(cap);
  capK.at(tFound, { html: esc(N.analyze[4].replace('library[1]: ', '')) });
  fromTo(cap, tFound, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  fromTo(fold, e2, { autoAlpha: 0, scale: 1.3, svgOrigin: `${HX} ${HY}` }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
  keyed(nm).at(e2, { html: 'list' }); tl.set(nm, { fontSize: '40px' }, e2);
  capK.at(e2 + 0.1, { html: 'build/list/' });
  tl.to(ms, { r: 128, duration: 0.6, ease: 'power3.inOut' }, tCopy - 0.15); fadeOut(lab, tCopy - 0.15, { d: 0.2 });
  const x1 = HX + 128 * Math.cos(A), y1 = HY + 128 * Math.sin(A);
  impact(g, x1, y1, 20, 58, tCopy + 0.42, fg, { d: 0.5 }); sfx('whoosh', tCopy - 0.15, { g: 0.4, p: 0.5 }); sfx('pop', tCopy + 0.4, { g: 0.8, p: 0.5 });
  capK.at(tCopy + 0.3, { html: 'build/list/' + esc(N.find[1]) });
  tl.to(g, { autoAlpha: 0, duration: 0.3 }, tLeave); [lab, nm, cap].forEach((e) => tl.to(e, { autoAlpha: 0, duration: 0.3 }, tLeave));
  if (!/lfs\.so$/.test(N.find[1])) console.warn('C 模块的实测文件名不符');
});

// ── 7 选项：luai -h 的原文，说到哪一项，哪一行反白；下面给一个实测的例子 ──
USE.push(({ world, cam, fg, D }) => {
  const y = UY.opts, LH = 46, FS = 32, t27 = T('u27'), t28 = T('u28'), tEnd = T('u29') - 0.75;
  const all = D.install.help_raw, iOpt = all.indexOf('Options:'), help = all.slice(iOpt);      // 帮助原文的 Options 一节（前面的用法与子命令从略）
  const tGo = T('u25') - 0.5;
  cam.go(tGo, 0, y, { d: 1.3 });
  const tm = makeTerm(world, M, y + 50, FS, { lh: LH / FS });
  const e = tm.cmd(tGo + 0.35, 'luai -h', { cps: 30 });
  note(world, M + 230, y + 56, '⋮', e, { cls: 'abs mono dim', css: { fontSize: '26px', lineHeight: '34px' }, y: 0 });
  const ls = tm.out(e, help, { cls: '', step: 0.02 });
  const line = (p) => { const i = help.findIndex((l) => l.trim().startsWith(p)); if (i < 0) { console.warn('luai -h 里没有', p); return ls[0]; } const sp = sub(ls[i], help[i].trim()); sp.dataset.flush = '1'; return sp; };
  const tO = T('u25', { zh: '指定', en: 'sets' }) - 0.45;
  hl(line('-o, --out'), tO, t27 - 0.05); hl(line('--max-deps'), t27 + 0.05, t28 - 0.05);
  hl(line('--include'), T('u28', 'include') - 0.1, tEnd + 2); hl(line('--exclude'), T('u28', 'exclude') - 0.1, tEnd + 2);
  [tO, t27 + 0.05, T('u28', 'include') - 0.1, T('u28', 'exclude') - 0.1].forEach((tt) => sfx('blip', tt, { g: 0.7 }));
  // 例子
  const EY = y + 50 + (help.length + 1) * LH + 36;
  ruleIn(world, M, EY - 20, 1270, tO - 0.2, { d: 0.9, h: 2, a: 0.5 });
  const tA = makeTerm(world, M, EY, 30, { lh: 1.5 });
  const ea = tA.cmd(tO + 0.15, 'luai -b main.lua', { cps: 40 });
  tA.out(ea, D.default_out, { cls: 'sm2', step: 0.08 });
  note(world, M + 420, EY + 6, tr('不写 -o 时的默认位置：build/&lt;入口名&gt;/', 'without -o, the default is build/&lt;entry name&gt;/'), ea + 0.2, { css: { fontSize: '26px', lineHeight: '34px' } }).classList.add('ex-a');
  const exA = [tA.el, world.querySelector('.ex-a')];
  exA.forEach((el) => tl.to(el, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, t27 - 0.1));
  const tB = makeTerm(world, M, EY, 30, { lh: 1.5 });
  const eb = tB.cmd(t27 + 0.25, 'luai -b main.lua -o build/x --max-deps 2', { cps: 46 });
  const xo = tB.out(eb, D.err.max_deps, { cls: 'sm3', sfx: 'error' });
  hl(sub(xo[0], 'DependencyLimitExceededError'), eb + 0.25, tEnd + 2);
  // 默认上限：36
  const t36 = T('u27', { zh: '三十六', en: '36' }) - 0.2;
  const n36 = head(world, 1500, y + 236, '36', 'd-hero', t36, { d: 0.8 });
  const c36 = note(world, 1508, y + 470, tr('模块数量的默认上限', 'default module limit'), t36 + 0.3, { css: { fontSize: '26px' } });
  sfx('thud', t36 + 0.1, { g: 0.6, p: 0.5 });
  sink(n36, t28 - 0.3, { d: 0.35 }); fadeOut(c36, t28 - 0.3, { d: 0.25 });
  // 增减模块：多出一颗，少掉一颗
  const ms = orbitSystem(world, 1650, y + 380, { k: 0.6, fg, labels: false, planetName: '', speed: 0.3, moons: [{ a: 0 }, { a: 2.1 }, { a: 4.2 }, { a: 1.05 }] });
  ms.rl.style.display = 'none';
  ms.showPlanet(t28 + 0.05, { sfx: false }); [0, 1, 2].forEach((i) => ms.showMoon(i, t28 + 0.15 + i * 0.07, { sfx: false }));
  const tInc = T('u28', 'include') + 0.35, tExc = T('u28', 'exclude') + 0.35;
  ms.showMoon(3, tInc); const pi = ms.pos(3, tInc + 0.1); impact(ms.g, pi[0], pi[1], 12, 44, tInc + 0.1, fg, { d: 0.5 });
  tl.to(ms.moons[1], { s: 0, duration: 0.3, ease: 'back.in(2.5)' }, tExc); sfx('tick', tExc + 0.25, { g: 1 });
  hideSys(ms, tEnd + 0.1);
});

// ── 8 当作库来调用：脚本节选 + 实测输出 ──
USE.push(({ world, cam, fg, D }) => {
  const y = UY.api, t29 = T('u29'), t30 = T('u30'), S = D.api_src, tEnd = T('u32') - 0.75;
  cam.go(t29 - 0.75, 0, y);
  const pickL = (p) => { const l = S.find((x) => x.startsWith(p)); if (l == null) console.warn('api.lua 里没有', p); return l || ''; };
  const ex = [pickL('local luainstaller'), '⋮', pickL('local b ='), pickL('print("bundle.ok"'), '', pickL('local bad ='), pickL('print("bad.ok"'), '⋮'];
  note(world, M, y + 86, 'api.lua' + `<span style="font-family:Inter,'Sans SC'">${tr('（节选）', ' (excerpt)')}</span>`, t29 - 0.2, { cls: 'abs mono dim', css: { fontSize: '25px', lineHeight: '34px' } });
  const code = codeBlock(world, ex, M, y + 132, 26, { lh: 1.7, marks: [['require("luainstaller")', 'req'], ['luainstaller.bundle', 'call'], ['bad.error.type', 'etype']] });
  code._lines.forEach((ln, i) => { if (ex[i] === '⋮') ln.classList.add('dim'); });
  code.cascade(t29 - 0.15, { step: 0.06 });
  hl(code.m('req'), T('u29', { zh: '当作库', en: 'library' }) - 0.1, t30 - 0.1);
  // 运行
  const tm = makeTerm(world, M, y + 530, 34, { lh: 1.5 });
  const e = tm.cmd(t29 + 1.25, 'lua /tmp/api.lua', { cps: 30 });
  const tOut = Math.max(e, t30 - 0.7);
  const o = tm.out(tOut, D.api.map(tabs), { cls: 'sm2', step: 0.06 });
  const iOk = D.api.findIndex((l) => l.startsWith('bundle.ok')), iBad = D.api.findIndex((l) => l.startsWith('bad.ok'));
  const tRet = T('u30', { zh: '返回', en: 'return' }) - 0.1, tFail = T('u30', { zh: '失败', en: 'failure' }) - 0.1, tType = T('u30', { zh: 'error', en: 'error' }) - 0.1;
  hl(code.m('call'), tRet, tFail); hl(inl(o[iOk]), tRet, tFail);
  hl(code.m('etype'), tType, tEnd + 2); hl(sub(o[iBad], 'InvalidOptionsError'), tType, tEnd + 2);
  [tRet, tType].forEach((tt) => sfx('blip', tt, { g: 0.7 }));
  // 库的六个入口（src/init.lua 导出的函数）
  const AX = 1330, AY = y + 536, tA = T('u29', { zh: '调用', en: 'library' }) + 0.15;
  note(world, AX, AY, 'luainstaller.', tA, { cls: 'abs mono dim', css: { fontSize: '28px', lineHeight: '40px' } });
  ['analyze', 'trace', 'compatibility', 'bundle', 'getLogs', 'clearLogs'].forEach((n, i) => {
    const el = note(world, AX, AY + 48 + i * 46, `<span>${n}</span>`, tA + 0.1 + i * 0.06, { cls: 'abs mono', css: { fontSize: '30px', lineHeight: '46px' }, x: -12, y: 0 });
    if (n === 'bundle') hl(el.firstChild, tRet, tEnd + 2);
  });
  cam.hold(t29 + 0.5, 0, y, tEnd - t29 - 0.6);
});

// ── 9 一个大些的例子：仓库自带的示例服务。17 个 Lua 模块 + 2 个 C 模块，一条命令；放到没有 Lua 的机器上启动 ──
USE.push(({ world, cam, fg, D }) => {
  const y = UY.web, t32 = T('u32'), t33 = T('u33'), t35 = T('u35'), WB = D.web;
  cam.go(t32 - 0.75, 0, y, { z: 1.03 }); cam.hold(t32 + 0.45, 0, y, t35 - t32 - 0.5, 1);
  // 由实测的 analyze 结果归类：项目自己的模块 / LuaRocks 里的模块 / C 模块
  const scripts = WB.analyze.filter((l) => l.startsWith('script[')), libs = WB.analyze.filter((l) => l.startsWith('library['));
  const nLocal = scripts.filter((l) => l.includes('/luainstaller-src/')).length, nRocks = scripts.length - nLocal;
  const libNames = libs.map((l) => l.replace(/^.*\/lua\/5\.4\//, '').replace(/\.so$/, '').replace(/\//g, '.'));
  if (scripts.length !== WB.scripts || libs.length !== WB.libraries) console.warn('示例服务的模块数与实测不符');

  // 图：三圈轨道。内圈是项目自己的模块，中圈来自 LuaRocks，外圈的空心圆是 C 模块
  const CX = 1450, CY = y + 372, g = gfx(world);
  const S = { k: 1, spin: 0, rp: 66, pl: 0, ring: 0 };
  const orbR = [118, 184, 250], cnt = [nLocal, nRocks, libs.length], spd = [0.2, 0.13, 0.09];
  const orbs = orbR.map((r) => orbit(g, CX, CY, r, 'rgba(243,242,237,.5)'));
  const planet = disc(g, CX, CY, 0, fg);
  const moons = [];
  cnt.forEach((n, j) => { for (let i = 0; i < n; i++) moons.push({ e: j === 2 ? svg('circle', { r: 0, fill: NAVY, stroke: fg, 'stroke-width': 3 }, g) : disc(g, 0, 0, 0, fg), j, a: i * 2 * Math.PI / n + j * 0.7, r: [11, 8.5, 12][j], s: 0 }); });
  const mpos = (m, t) => { const a = m.a + t * spd[m.j] + S.spin * (1 + m.j * 0.3), r = orbR[m.j] * S.k; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
  F((t) => {
    orbs.forEach((o, j) => { o.setAttribute('r', Math.max(0.01, orbR[j] * S.k).toFixed(2)); o.style.opacity = (S.ring * clamp(S.k * 3)).toFixed(3); });
    planet.setAttribute('r', Math.max(0, S.rp * S.pl).toFixed(2));
    for (const m of moons) { const p = mpos(m, t); m.e.setAttribute('cx', p[0].toFixed(2)); m.e.setAttribute('cy', p[1].toFixed(2)); m.e.setAttribute('r', Math.max(0, m.r * m.s).toFixed(2)); }
  });
  const lab1 = h('div', 'abs mono', world, 'server.lua'); px(lab1, CX - 150, CY - 16, 300); css(lab1, { fontSize: '18.5px', lineHeight: '32px', textAlign: 'center', color: NAVY, fontWeight: 600 });
  const lab2 = h('div', 'abs mono', world, 'websql'); px(lab2, CX - 150, CY - 30, 300); css(lab2, { fontSize: '44px', lineHeight: '60px', textAlign: 'center', color: NAVY, fontWeight: 600 });
  tl.fromTo(S, { pl: 0 }, { pl: 1, duration: 0.7, ease: 'back.out(1.9)', immediateRender: true }, t32 - 0.1); sfx('pop', t32 - 0.1, { p: 0.4 });
  fromTo(lab1, t32 + 0.35, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  tl.fromTo(S, { ring: 0 }, { ring: 1, duration: 0.7, ease: 'power2.out', immediateRender: true }, t32 + 0.2);
  const pop = (m, tt, d = 0.45) => tl.fromTo(m, { s: 0 }, { s: 1, duration: d, ease: 'back.out(2.4)', immediateRender: true }, tt);
  const luaM = moons.filter((m) => m.j < 2), cM = moons.filter((m) => m.j === 2);
  luaM.forEach((m, i) => { const tt = t33 - 0.05 + i * 0.05; pop(m, tt); if (i % 2 === 0) sfx('tick', tt, { g: 0.8, p: 0.4 }); });
  const tC = T('u33', { zh: '两个 C', en: 'two C' }) - 0.1;
  cM.forEach((m, i) => { const tt = tC + i * 0.16; pop(m, tt, 0.5); const p = mpos(m, tt + 0.1); impact(g, p[0], p[1], 12, 46, tt + 0.1, fg, { d: 0.5 }); sfx('pop', tt, { g: 0.7, p: 0.5 }); });

  // 左边：位置、两个数字
  note(world, M, y + 86, 'test/firebird_web_sql/' + `<span class="dim" style="font-family:Inter,'Sans SC'">   ${tr('仓库自带的示例服务', 'sample service in the repository')}</span>`, t32 + 0.05, { cls: 'abs mono', css: { fontSize: '30px', lineHeight: '40px' } });
  const X2 = M + 500;
  const n1 = head(world, M - 6, y + 132, '0', 'd-hero', t33 - 0.2, { d: 0.7, css: { fontSize: '150px' } }); countUp(n1._in, WB.scripts, t33 - 0.1, 0.9);
  note(world, M + 2, y + 276, tr('个 Lua 模块', 'Lua modules'), t33 + 0.1, { cls: 't-body', css: { fontSize: '36px', lineHeight: '46px', fontWeight: 700 } });
  note(world, M + 2, y + 324, tr(`项目 ${nLocal} · LuaRocks ${nRocks}`, `${nLocal} in the project · ${nRocks} from LuaRocks`), t33 + 0.5, { css: { fontSize: '26px', lineHeight: '36px' } });
  const n2 = head(world, X2 - 6, y + 132, '0', 'd-hero', tC - 0.1, { d: 0.7, css: { fontSize: '150px' } }); countUp(n2._in, WB.libraries, tC, 0.35);
  note(world, X2 + 2, y + 276, tr('个 C 模块', 'C modules'), tC + 0.15, { cls: 't-body', css: { fontSize: '36px', lineHeight: '46px', fontWeight: 700 } });
  note(world, X2 + 2, y + 326, libNames.join(' · '), tC + 0.4, { cls: 'abs mono dim', css: { fontSize: '24px', lineHeight: '34px' } });

  // 一条命令
  const TY = y + 386, FS = 30;
  const tm = makeTerm(world, M, TY, FS, { lh: 1.5 });
  const eB = tm.cmd(T('u33', { zh: '一条', en: 'one command' }) - 0.5, WB.build_cmd, { cps: 52 });
  const tOk = eB + 0.3, tc = tOk - 1.02;
  tm.out(tOk, WB.build, { cls: 'sm2', sfx: 'chime', step: 0.1 });
  note(world, M + 76, TY + FS * 1.5 + 1, tr(`用时 ${D.secs.websql} 秒`, `${D.secs.websql} s`), tOk + 0.25, { css: { fontSize: '22px', lineHeight: '32px' } });
  // 合成：三圈一起收拢
  tl.to(S, { k: 1.05, duration: 0.22, ease: 'power2.out' }, tc - 0.05);
  tl.to(S, { k: 0, spin: 3.6, duration: 0.85, ease: 'power3.in' }, tc + 0.17);
  moons.forEach((m) => tl.to(m, { s: 0, duration: 0.05 }, tc + 1.02));
  tl.to(S, { ring: 0, duration: 0.05 }, tc + 1.02);
  tl.to(S, { rp: 122, duration: 0.6, ease: 'back.out(2.6)' }, tc + 1.02);
  impact(g, CX, CY, 122, 240, tc + 1.04, fg);
  sfx('riser', tc - 0.1, { g: 0.7, p: 0.3 }); sfx('thud', tc + 1.02, { g: 1, p: 0.3 });
  fadeOut(lab1, tc, { d: 0.25 }); fromTo(lab2, tc + 1.15, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  const cap = note(world, CX - 250, CY + 150, `~/websql/<br><span class="dim">${tr('整个目录包', 'the whole folder')} ${WB.du}</span>`, tc + 1.3, { cls: 'abs mono', css: { fontSize: '26px', lineHeight: '38px', textAlign: 'center', width: '500px' } });

  // 另一台机器：没有 Lua
  tm.gap(0.45);
  const CL = WB.clean, c1 = 'lua -v', c2 = './websql/websql &', c3 = 'curl -si http://127.0.0.1:9090/ | head -1';
  const e1 = tm.cmd(Math.max(tOk + 0.3, t35 - 0.05), c1, { cps: 30 });
  tm.out(e1, CL[c1], { cls: 'sm2', sfx: 'error' });
  note(world, M + 330, TY + FS * 1.5 + 2 * FS * 0.74 * 1.5 + FS * 0.45 + 6, tr('另一台机器：没有 Lua、没有编译器、没有这些模块', 'another machine: no Lua, no compiler, none of these modules'), e1 - 0.3, { css: { fontSize: '24px', lineHeight: '34px' } });
  const e2 = tm.cmd(e1 + 0.25, c2, { cps: 44 });
  tm.out(e2, CL[c2], { cls: 'sm2', step: 0.04 });
  const e3 = tm.cmd(e2 + 0.3, c3, { cps: 60 });
  const ok = tm.out(e3, CL[c3], { cls: 'b', sfx: 'chime' }).map(inl);
  hl(ok[0], e3 + 0.12, 1e9);
  [0, 0.16, 0.32].forEach((d) => impact(g, CX, CY, 122, 300, e3 + 0.1 + d, fg, { d: 0.9 }));
});
