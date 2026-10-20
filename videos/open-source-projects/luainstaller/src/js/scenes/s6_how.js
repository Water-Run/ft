// 06 实现原理：一次构建的八步，从源码到二进制；之后是运行时与单文件。
// 世界是一条自左向右的流水线，每一步一站（间距 HXS）。开头先看整条线的总览，再「俯冲」进第一站。
// 八步对应八个月相：从一弯新月到满月——满月就是那个可执行文件。
// 画面上的源码、清单、命令、字节、哈希都取自 data.js（实测原文与真实产物）。
const HOW = [];                              // 各站的构建函数；后几站在 s6_how2.js / s6_how3.js
const HXS = 2600, hx = (i) => i * HXS;       // 第 i 站的左上角
const SHADE = '#2b2ba1';                     // 月相的暗面
const HOW_STEPS = [['校验', 'Validate'], ['发现依赖', 'Discover'], ['清单', 'Manifest'], ['工具链', 'Toolchain'], ['生成 C', 'Generate C'], ['编译', 'Compile'], ['核验', 'Verify'], ['落盘', 'Commit']];
scene('how', ({ root, s, c0 }) => {
  const st = stageOf(root, 'navy'); const { world, cam, hud, fg } = st;
  chapter(root, s); emblem(st, s);
  const D = window.DATA, g = gfx(world);
  // 俯冲：缩放按指数走。GSAP 里的镜头状态在 t+d 处直接对齐到终点
  cam.dive = (t, d, a, b) => {
    cam.cut(t + d, b);
    F((tt) => {
      if (tt < t || tt >= t + d) return;
      const u = ease.io3((tt - t) / d), z = a.z * Math.pow(b.z / a.z, u), k = 1 - u;
      // 推近时以终点为准（终点在屏幕上直线移向中心）；拉远时以起点为准（起点直线移出画面），镜头不会先往反方向漂
      const zin = b.z >= a.z, x = zin ? b.x - (b.x - a.x) * a.z * k / z : a.x + (b.x - a.x) * b.z * u / z, y = zin ? b.y - (b.y - a.y) * a.z * k / z : a.y + (b.y - a.y) * b.z * u / z;
      world.style.transform = `translate(${W / 2}px, ${H / 2}px) scale(${z}) translate(${-x}px, ${-y}px)`;
    });
  };
  // 每一站的标题：月相 + 序号 + 名字
  const station = (i, t, title) => {
    const sx = hx(i), step = i <= 8;
    if (step) { const m = moonPhase(g, sx + M + 30, 130, 30, i / 8, false, fg, SHADE); popIn(m, t, sx + M + 30, 130, { d: 0.55 }); sfx('pop', t, { g: 0.7 }); }
    head(world, sx + M + (step ? 86 : 0), 92, (step ? `<span class="dim" style="font-weight:500">${i}</span>&ensp;` : '') + (title || tr(HOW_STEPS[i - 1][0], HOW_STEPS[i - 1][1])), 'd-3', t + 0.08, { d: 0.75, css: { fontSize: '64px' } });
    return sx;
  };
  // 带行号的源码块：start 为首行行号，'⋮' 行不编号
  const codeNum = (parent, lines, x, y, size, o = {}) => {
    const el = codeBlock(parent, lines, x, y, size, o);
    let n = o.start || 1;
    el._lines.forEach((ln, i) => { const skip = lines[i] === '⋮'; ln.innerHTML = `<span class="gut">${skip ? '' : (o.nums ? o.nums[i] : n)}</span>` + (skip ? '<span class="dim">⋮</span>' : ln.innerHTML); if (!skip) n++; });
    return el;
  };
  const bytes = Uint8Array.from(atob(D.exe.b64), (c) => c.charCodeAt(0));
  const ctx = { st, world, cam, hud, fg, s, c0, D, g, station, codeNum, bytes };
  for (const part of HOW) part(ctx);
});

// ── 总览：一条线，八个月相；左下是源码，右下是最终的可执行文件（每个字节一个点）──
HOW.push(({ world, cam, fg, D, c0, bytes }) => {
  const P = 220, K = HXS / P, z0 = 1 / K;               // P：总览里相邻两站的屏幕间距
  const TX = 190, TY = 352, t1 = T('h1');
  // 总览按屏幕像素设计，整体放大 K 倍放进世界：第 i 个刻度正好落在第 i 站的中心
  const map = h('div', 'abs', world); css(map, { left: hx(1) + 960 - TX * K + 'px', top: 540 - TY * K + 'px', width: W + 'px', height: H + 'px', transformOrigin: '0 0', transform: `scale(${K})` });
  const ov = { x: hx(1) + 960 + (960 - TX) * K, y: 540 + (540 - TY) * K, z: z0 };
  cam.cut(c0 - 0.3, { ...ov, z: z0 * 0.95 }); cam.to(c0 - 0.2, ov, { d: T('h2') - 0.95 - c0 + 0.2, ease: 'sine.out', sfx: false });
  const mg = svg('svg', { class: 'gfx', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, map);
  const line = seg(mg, TX, TY, TX + 7 * P, TY, fg, 3);
  fromTo(line, t1 - 0.25, { scaleX: 0, svgOrigin: `${TX} ${TY}` }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' });
  HOW_STEPS.forEach(([zh, en], i) => {
    const x = TX + i * P, tt = t1 - 0.1 + i * 0.16;
    const grp = svg('g', {}, mg); disc(grp, x, TY, 34, NAVY); moonPhase(grp, x, TY, 28, (i + 1) / 8, false, fg, SHADE);
    popIn(grp, tt, x, TY, { d: 0.5 });
    note(map, x - 100, TY - 98, String(i + 1), tt + 0.05, { cls: 'abs mono dim', css: { width: '200px', textAlign: 'center', fontSize: '28px', lineHeight: '36px' }, y: 0 });
    note(map, x - 110, TY + 58, tr(zh, en), tt + 0.1, { cls: 't-body', css: { width: '220px', textAlign: 'center', fontSize: ZH ? '35px' : '29px', lineHeight: '44px', fontWeight: 700 }, y: 6 });
    sfx('tick', tt, { g: 0.9, p: -0.7 + i * 0.2 });
  });
  // 两端：源码，与最终的可执行文件
  const tS = T('h1', { zh: '源码', en: 'source' }) - 0.25, tB = T('h1', { zh: '可执行', en: 'executable' }) - 0.25, EY = 562;
  note(map, 120, EY, 'main.lua', tS, { cls: 'abs mono', css: { fontSize: '24px', lineHeight: '32px' } });
  const code = codeBlock(map, D.src.main, 120, EY + 48, 19.5, { lh: 1.62 }); code.cascade(tS + 0.1, { step: 0.045, x: -10, sfx: false });
  note(map, 1083, EY, `moon <span class="dim">  ${fmt(D.exe.size)} ${tr('字节', 'bytes')}</span>`, tB, { cls: 'abs mono', css: { fontSize: '24px', lineHeight: '32px' } });
  const bm = byteMap(map, bytes, 1083, EY + 48, 224, 3.2, fg); bm.reveal(tB + 0.1, 1.1);
  sfx('whoosh', tB + 0.1, { g: 0.4, p: 0.5 });
  // 俯冲进第一站
  const tD = T('h2') - 0.95, dD = 1.7;
  cam.dive(tD, dD, ov, { x: hx(1) + 960, y: 540, z: 1 });
  tl.to(map, { autoAlpha: 0, duration: dD * 0.36, ease: 'power1.in' }, tD + dD * 0.46);
  sfx('whoosh', tD, { g: 0.9 }); sfx('riser', tD + 0.15, { g: 0.6 }); sfx('thud', tD + dD - 0.25, { g: 0.7 });
});

// ── 1 校验：解释器版本；选项逐项检查 ──
HOW.push(({ world, fg, D, g, station }) => {
  const t2 = T('h2'), t3 = T('h3'), tOut = T('h4') - 0.85, sx = station(1, t2 + 0.3);
  const VY = 236;
  note(world, sx + M, VY, tr('解释器：官方 Lua', 'Interpreter: official Lua'), t2 + 0.7, { css: { fontSize: '30px' } });
  const cur = D.versions.lua.split('.').slice(0, 2).join('.');
  const tV = Math.max(t2 + 0.8, T('h2', { zh: '官方', en: 'official' }) - 0.5);
  const vEl = ['5.1', '5.2', '5.3', '5.4', '5.5'].map((v, i) => {
    const e = head(world, sx + M + i * 250 - 14, VY + 52, `<span class="hlb">${v}</span>`, 'd-2', tV + i * 0.09, { d: 0.7, css: { fontSize: '130px' } });
    sfx('tick', tV + i * 0.09, { g: 0.9 });
    return [v, e._in.firstChild];
  });
  // 当前这一个：lua -v 的实测回显
  const tCur = Tend('h2') - 0.55;
  const tm = makeTerm(world, sx + M, VY + 232, 32, { lh: 1.5 });
  const ev = tm.cmd(tCur - 0.5, 'lua -v', { cps: 30 });
  tm.out(ev, [D.versions.lua_v], { cls: 'sm2' });
  hl(vEl.find(([v]) => v === cur)[1], ev, tOut + 2);
  // 不是官方 Lua：实测的报错
  const JX = sx + 1372, jit = D.err.luajit;                    // 报错名 26 个字符，右端要留在版心之内
  const jm = seg(g, JX, VY + 132, JX + 34, VY + 132, fg, 5); fromTo(jm, ev + 0.4, { scaleX: 0, svgOrigin: `${JX} ${VY + 132}` }, { scaleX: 1, duration: 0.4, ease: 'expo.out' });
  head(world, JX + 54, VY + 96, 'LuaJIT', 'd-3', ev + 0.45, { d: 0.6, css: { fontSize: '60px' } });
  note(world, JX + 56, VY + 176, jit.out[0].match(/[A-Za-z]+Error/)[0], ev + 0.8, { cls: 'abs mono', css: { fontSize: '22px', lineHeight: '32px' }, a: 0.8 });

  // 选项：实测的那次 API 调用，三个字段逐个检查
  const OY = 610, call = D.api_src.find((l) => l.startsWith('local bad ='));
  note(world, sx + M, OY, tr('选项', 'Options'), t3 - 0.15, { css: { fontSize: '30px' } });
  const keys = ['entry = "main.lua"', 'out = "build/api/moon"', 'colour = "blue"'];
  const cb = codeBlock(world, [call], sx + M, OY + 56, 28, { marks: keys.map((k, i) => [k, 'k' + i]) });
  cb.cascade(t3 - 0.1);
  const tK = T('h3', { zh: '逐项', en: 'checked' }) - 0.25;
  keys.forEach((k, i) => {
    const el = cb.m('k' + i), b = box(el, world), tt = tK + i * 0.36;
    if (i < 2) { tick(g, b.cx, b.b + 34, 30, tt, fg, 4.5); sfx('tick', tt, { g: 1 }); }
    else { const tBad = Math.max(tt, T('h3', { zh: '写错', en: 'unknown' }) - 0.1); hl(el, tBad, tOut + 2); sfx('error', tBad, { g: 0.8 }); }
  });
  const bad = D.api.find((l) => l.startsWith('bad.ok')).split('\t');           // bad.ok  false  InvalidOptionsError  unknown option: colour
  const tE = Math.max(tK + 1.1, T('h3', { zh: '不会', en: 'error' }) - 0.2);
  const eL = [['bad.error.type', bad[2]], ['bad.error.message', bad[3]]].map(([k, v], i) => {
    const e = note(world, sx + M, OY + 176 + i * 50, `<span class="dim">${k.padEnd(20)}</span><span>${esc(v)}</span>`, tE + i * 0.12, { cls: 'abs mono', css: { fontSize: '30px', lineHeight: '50px' }, x: -14, y: 0 });
    return e.lastChild;
  });
  hl(eL[0], tE + 0.3, tOut + 2);
});

// ── 2 发现依赖：词法扫描 → 字面量 require → 按搜索顺序定位 → 继续向下追 → 记下 SHA-256 ──
HOW.push((ctx) => {
  const { world, cam, fg, D, g, station, codeNum } = ctx;
  const t4 = T('h4'), t5 = T('h5'), t6 = T('h6'), t7 = T('h7'), t8 = T('h8'), tOut = T('h9') - 0.85, sx = hx(2);
  cam.go(t4 - 0.85, sx, 0); station(2, t4 - 0.1); cam.hold(t4 + 0.4, sx, 0, tOut - t4 - 0.5, 1.02);
  const CX = sx + M, CY = 262, CL = 50, FS = 30, GW = 66;          // GW：行号栏宽
  const fl = note(world, CX, 212, 'main.lua', t4 + 0.2, { cls: 'abs mono dim', css: { fontSize: '26px', lineHeight: '36px' } });
  const cm = codeNum(world, D.src.main, CX, CY, FS, { lh: CL / FS, marks: [['require("moon.phase")', 'rp'], ['require("moon.names")', 'rn']] });
  cm.cascade(t4 + 0.25, { step: 0.05 });
  // 扫描线
  const scan = (ts, rows, d) => {
    const e = h('div', 'rule', world); px(e, CX - 20, CY - 2, 1010); css(e, { height: '3px' });
    fromTo(e, ts, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.12 });
    tl.fromTo(e, { y: 0 }, { y: rows * CL + 4, duration: d, ease: 'power1.inOut', immediateRender: true }, ts);
    tl.to(e, { autoAlpha: 0, duration: 0.2 }, ts + d - 0.05); sfx('whoosh', ts, { g: 0.35 });
  };
  scan(T('h4', { zh: '词法', en: 'scans' }) - 0.35, D.src.main.length, 1.3);
  // 图：入口是行星，找到的模块是卫星；空心 = 只看到了名字，实心 = 已定位到文件
  const sys = orbitSystem(world, sx + 1420, 404, { k: 0.72, fg, bg: NAVY, labSize: 35, speed: 0.12, a0: -t5 * 0.12, moons: [{ name: 'moon.phase', hollow: true, a: -0.75 }, { name: 'moon.names', hollow: true, a: 2.35 }, { name: 'moon.julian', hollow: true, sub: 0, a: 0.9, r: 14 }] });
  sys.rl.style.display = 'none'; ctx.sys2 = sys;
  sys.showPlanet(t4 + 0.2);
  const tRP = T('h5', { zh: '字面量', en: 'literal' }) - 0.15, tRN = tRP + 0.3;
  hl(cm.m('rp'), tRP, t7 - 0.4); hl(cm.m('rn'), tRN, t7 - 0.4);
  sys.showMoon(0, tRP + 0.12); sys.showMoon(1, tRN + 0.12);

  // 搜索顺序（实测的 Searched: 列表）：先是入口所在的目录，再是 Lua 自己的搜索路径
  const LY = 696, S = D.search, nEntry = S.findIndex((p) => !p.startsWith(S[0]));
  const sEls = [];
  [[tr('入口所在的目录', 'the entry\'s folder'), 0, nEntry, CX, T('h6', { zh: '入口', en: 'entry' }) - 0.25], [tr('Lua 的搜索路径', 'Lua\'s search paths'), nEntry, S.length, CX + 560, T('h6', { zh: '再按', en: 'then' }) - 0.1]].forEach(([title, a, b, x, tt]) => {
    sEls.push(note(world, x, LY, title, tt, { css: { fontSize: '26px' } }));
    for (let i = a; i < b; i++) sEls.push(note(world, x, LY + 44 + (i - a) * 38, `<span class="dim">${i + 1}</span>  <span>${esc(S[i])}</span>`, tt + 0.08 + (i - a) * 0.05, { cls: 'abs mono', css: { fontSize: '24px', lineHeight: '38px' }, x: -10, y: 0 }));
  });
  // 第一个目录就命中：moon.phase 被定位，卫星填实
  const tHit = T('h6', { zh: '定位', en: 'search paths' }) - 0.1;
  hl(sEls[1].lastChild, T('h6', { zh: '入口', en: 'entry' }) + 0.35, t7 - 0.3);
  sys.fill(0, tHit);
  sEls.forEach((e) => tl.to(e, { autoAlpha: 0, duration: 0.25 }, t7 - 0.3));

  // 定位结果（实测的 trace）与哈希
  const tr_ = D.trace.map((l) => l.match(/resolved (\S+) -> (\S+)/)), sha = (id) => D.manifest.find((m) => m.id === id).sha;
  const rowsD = [['main.lua', tr('入口', 'entry'), sha('main.lua'), t7 - 0.15], ...tr_.map((m) => [m[1], m[2], sha(m[2].split('/moon/').slice(1).join('/moon/')), 0])];
  // 继续向下追：phase.lua 自己的 require
  tl.to(cm, { autoAlpha: 0, duration: 0.25 }, t7 - 0.4);
  const PL = D.src.phase.slice(1, 8).concat(['⋮']);
  const cp = codeNum(world, PL, CX, CY, FS, { lh: CL / FS, start: 2, marks: [['require("moon.julian")', 'rj']] });
  cp.cascade(t7 - 0.2, { step: 0.04 }); keyed(fl).at(t7 - 0.25, { html: 'moon/phase.lua' });
  scan(t7 + 0.05, 7, 0.8);
  const tRJ = Math.max(t7 + 0.5, T('h7', { zh: 'require', en: 'requires' }) - 0.1);
  hl(cp.m('rj'), tRJ, tOut + 2); sys.showMoon(2, tRJ + 0.12); sys.fill(2, tRJ + 0.75);
  const tNames = Tend('h7') - 0.3; sys.fill(1, tNames);
  rowsD[1][3] = t7 - 0.05; rowsD[2][3] = tRJ + 0.75; rowsD[3][3] = tNames;
  const HXc = CX + 860;
  note(world, HXc, LY, 'SHA-256', T('h8', 'SHA-256') - 0.3, { cls: 'abs mono dim', css: { fontSize: '24px', lineHeight: '36px' } });
  rowsD.forEach(([name, path, hash, tt], i) => {
    const y = LY + 44 + i * 46;
    note(world, CX, y, name, tt, { cls: 'abs mono', css: { fontSize: '25px', lineHeight: '46px', fontWeight: 600 }, x: -12, y: 0 });
    note(world, CX + 236, y, (i ? '→ ' : '') + esc(path), tt + 0.1, { cls: 'abs mono', css: { fontSize: '23px', lineHeight: '46px' }, a: 0.7, y: 0 });
    const he = h('div', 'abs mono', world, ''); px(he, HXc, y); css(he, { fontSize: '23px', lineHeight: '46px' });
    const th = Math.max(tt + 0.4, T('h8', { zh: '记下', en: 'SHA-256' }) - 0.2 + i * 0.18);
    scramble(he, hash.slice(0, 24) + '…', th, 0.9); sfx('tick', th + 0.9, { g: 0.9 });
  });
  if (rowsD.some((r) => !/^[0-9a-f]{64}$/.test(r[2]))) console.warn('发现依赖：哈希与清单对不上');
});
