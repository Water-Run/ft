// 06 实现原理（续）：6 编译、7 核验、8 落盘；以及运行时与单文件

// ── 6 编译：C 的五次调用变成机器码；整个可执行文件的每个字节；推近到能读出 Lua 源码 ──
HOW.push(({ world, cam, hud, fg, D, g, station, bytes }) => {
  const t17 = T('h17'), t18 = T('h18'), t19 = T('h19'), t20 = T('h20'), t21 = T('h21'), t22 = T('h22'), sx = hx(6);
  cam.go(t17 - 0.85, sx, 0); station(6, t17 - 0.1); cam.hold(t17 + 0.4, sx, 0, t18 - t17 - 1.35, 1.02);
  // 6a：真实的编译命令（由记录编译器调用的包装脚本取得），过长，按 shell 的写法折成两行
  const cc = D.cc.launcher, cut = cc.indexOf(' -Wl,'), lib = cc.match(/(\S+liblua\S+)/)[1];
  const cmdText = cc.slice(0, cut) + ' \\\n      ' + cc.slice(cut + 1);
  const tm = makeTerm(world, sx + M, 214, 26, { lh: 1.5 });
  tm.cmd(t17 + 0.05, cmdText, { cps: 190, html: esc(cmdText).replace(esc(lib), `<span data-k class="hlb">${esc(lib)}</span>`) });
  const cmdLn = tm.last, tLk = T('h17', { zh: '链接', en: 'linked' }) - 0.2;
  classAt(cmdLn, 'hot', tLk, t18); sfx('blip', tLk, { g: 0.7 });
  // C 的一行 → 机器码的一条（objdump 的反汇编原文）
  const RY = 380, RH = 74, C0 = sx + M, B0 = sx + 1040, A0 = sx + 1290, cl = D.boot.cmain, calls = D.exe.calls;
  const tC = t17 + 0.75, tB = Math.max(tC + 0.4, T('h17', { zh: '变成', en: 'becomes' }) - 0.1);
  note(world, C0, RY - 50, 'launcher.c · main()', tC - 0.1, { cls: 'abs mono dim', css: { fontSize: '23px', lineHeight: '32px' } });
  note(world, B0, RY - 50, 'moon · .text', tB - 0.1, { cls: 'abs mono dim', css: { fontSize: '23px', lineHeight: '32px' } });
  cl.forEach((line, i) => {
    const y = RY + i * RH, tb = tB + i * 0.17;
    const ce = note(world, C0, y, esc(line), tC + i * 0.07, { cls: 'abs mono', css: { fontSize: '26px', lineHeight: '44px' }, x: -14, y: 0 });
    const x1 = C0 + ce.offsetWidth + 18, l = seg(g, x1, y + 22, B0 - 22, y + 22, fg, 2, { opacity: 0.4 });
    fromTo(l, tb - 0.2, { scaleX: 0, svgOrigin: `${x1} ${y + 22}` }, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
    const be = h('div', 'abs mono', world, ''); px(be, B0, y); css(be, { fontSize: '26px', lineHeight: '44px', fontWeight: 700 });
    scramble(be, calls[i].bytes, tb, 0.45); sfx('tick', tb + 0.45, { g: 0.9, p: 0.3 });
    note(world, A0, y + 1, esc(calls[i].asm), tb + 0.4, { cls: 'abs mono', css: { fontSize: '22px', lineHeight: '44px' }, a: 0.8, y: 0 });
    if (!calls[i].asm.includes(line.match(/(lua\w+)\(/)[1].replace(/^lua_pcall$/, 'lua_pcallk'))) console.warn('编译：C 行与反汇编对不上', line);
  });
  // 链接：运行时由包里的 liblua 提供（ldd 的实测输出，只取前两行）
  const tmL = makeTerm(world, sx + M, RY + cl.length * RH + 22, 26, { lh: 1.5 });
  const lc = 'ldd build/moon/moon', lo = D.cmd[lc];
  const eL = tmL.cmd(tLk + 0.05, lc, { cps: 60 });
  const ll = tmL.out(eL, lo.slice(0, 2).map((x) => x.replace(/^\t/, '    ')).concat(['    ⋮']), { cls: 'sm2', step: 0.06 });
  hl(sub(ll[1], lo[1].match(/=> (\S+)/)[1].replace('/home/waterrun/moon/', '')), eL + 0.3, t18);

  // 6b：整个可执行文件。每个字节一个点，亮度即数值
  const y0 = 1240, COLS = 224, CELL = 5.9, MX = sx + M, MY = y0 + 212, tR = t18 - 0.05;
  cam.go(t18 - 0.85, sx, y0);
  const ttl = note(world, MX, y0 + 132, `build/moon/moon   <span id="how-cnt"></span><span class="dim"> ${tr('字节', 'bytes')}</span>`, tR - 0.2, { cls: 'abs mono', css: { fontSize: '30px', lineHeight: '44px' } });
  countUp(ttl.querySelector('#how-cnt'), D.exe.size, tR, 1.7);
  const bm = byteMap(world, bytes, MX, MY, COLS, CELL, fg); bm.reveal(tR, 1.7); sfx('whoosh', tR, { g: 0.5 });
  const text = D.exe.sections.find((s_) => s_.name === '.text');
  const R = [
    [0, 64, tr('ELF 文件头', 'ELF header'), `7f 45 4c 46 · 64 ${tr('字节', 'bytes')}`, T('h19', { zh: 'E L F', en: 'E L F' }) - 0.2],
    [text.off, text.off + text.size, '.text', `${tr('机器码', 'machine code')} · ${fmt(text.size)} ${tr('字节', 'bytes')}`, T('h19', { zh: '接着', en: 'then' }) - 0.1],
    [D.exe.boot_off, D.exe.boot_off + D.boot.size, 'luai_bootstrap[]', `${tr('那个 C 数组', 'the C array')} · ${fmt(D.boot.size)} ${tr('字节', 'bytes')}`, T('h20', { zh: '中间', en: 'band' }) - 0.2],
  ];
  if (bytes[0] !== 0x7f || String.fromCharCode(bytes[1], bytes[2], bytes[3]) !== 'ELF') console.warn('编译：文件头不是 ELF');
  tl.to(bm.base, { opacity: 0.3, duration: 0.5 }, R[0][4]);
  const LX = MX + COLS * CELL + 34;
  R.forEach(([a, b, name, subt, tt], i) => {
    const rc = bm.range(a, b); tl.to(rc, { opacity: 1, duration: 0.4 }, tt);
    const yc = MY + ((a + b) / 2 / COLS) * CELL, yl = i === 0 ? MY + 4 : yc;
    const l = seg(g, MX + COLS * CELL + 8, yl, LX - 8, yl, fg, 2); fromTo(l, tt, { scaleX: 0, svgOrigin: `${MX + COLS * CELL + 8} ${yl}` }, { scaleX: 1, duration: 0.3 });
    note(world, LX, yl - 20 + (i === 1 ? 26 : 0) - (i === 0 ? 0 : 0), `<b>${name}</b><br><span class="dim">${subt}</span>`, tt + 0.1, { cls: 'abs mono', css: { fontSize: '23px', lineHeight: '32px' }, x: -10, y: 0 });
    sfx('blip', tt, { g: 0.7, p: 0.5 });
  });

  // 推近：点阵里的每个点换成它的字符（上）与十六进制（下）。224 列时，main.lua 的源码正好从第 38 行第 7 列开始
  const src = D.exe.src_off, ZR = Math.floor(src / COLS), stmt = 'local phase = require(\\"moon.phase\\")';
  if (String.fromCharCode(...bytes.slice(src, src + stmt.length)) !== stmt) console.warn('编译：二进制里的源码与预期不符');
  const Zz = (W - 120) / (45 * CELL), a = { x: sx + W / 2, y: y0 + H / 2, z: 1 }, b = { x: MX + (W / 2 - 60) / Zz, y: MY + (ZR + 0.5) * CELL, z: Zz };
  const tz = t21 - 0.25, dz = 1.9, OS = 7, r0 = Math.max(0, ZR - 30), r1 = ZR + 30, c1 = 100, U = CELL * OS;   // 字符层要盖住它淡入那一刻镜头里能看到的全部范围，否则会露出一道边
  const mkOv = () => { const c = document.createElement('canvas'); c.width = Math.round(c1 * U); c.height = Math.round((r1 - r0) * U); css(c, { position: 'absolute', left: 0, top: r0 * CELL + 'px', width: c1 * CELL + 'px', height: (r1 - r0) * CELL + 'px', opacity: 0 }); bm.wrap.appendChild(c); return c; };
  const paint = (c, from, to, inv) => {
    const x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle';
    if (!inv) { x.fillStyle = NAVY; x.fillRect(0, 0, c.width, c.height); }
    for (let r = r0; r < r1; r++) for (let col = 0; col < c1; col++) {
      const off = r * COLS + col; if (off < from || off >= to || off >= bytes.length) continue;
      const v = bytes[off], cx = (col + 0.5) * U, cy = (r - r0 + 0.5) * U;
      if (inv) { x.fillStyle = PAPER; x.fillRect(col * U, (r - r0) * U + 1, U + 0.5, U - 2); }
      const pr = v >= 33 && v < 127;
      x.fillStyle = inv ? NAVY : (pr ? PAPER : 'rgba(243,242,237,.45)'); x.font = `${pr ? 600 : 400} ${(U * (pr ? 0.54 : 0.3)).toFixed(1)}px Mono`;
      x.fillText(pr ? String.fromCharCode(v) : v === 10 ? '\\n' : v === 32 ? '·' : '', cx, cy - U * 0.13);
      x.fillStyle = inv ? 'rgba(0,0,128,.6)' : 'rgba(243,242,237,.42)'; x.font = `400 ${(U * 0.2).toFixed(1)}px Mono`;
      x.fillText(v.toString(16).padStart(2, '0'), cx, cy + U * 0.31);
    }
  };
  const c1_ = mkOv(), c2_ = mkOv(); paint(c1_, 0, bytes.length, false); paint(c2_, src, src + stmt.length, true);
  const ov = freeze(c1_), ov2 = freeze(c2_);
  cam.dive(tz, dz, a, b); sfx('riser', tz, { g: 0.6 }); sfx('whoosh', tz + 0.1, { g: 0.7 });
  const tH = Math.max(tz + dz - 0.2, T('h21', { zh: '读到', en: 'readable' }) - 0.6);
  // 离开：拉远并移向下一站
  const tX = t22 - 1.05, dX = 1.35;
  cam.dive(tX, dX, b, { x: hx(7) + W / 2, y: H / 2, z: 1 }); sfx('whoosh', tX, { g: 0.8 });
  F((t) => { ov.style.opacity = (clamp((t - (tz + 1.0)) / 0.45) * (1 - clamp((t - tX) / 0.45))).toFixed(3); ov2.style.opacity = (clamp((t - tH) / 0.25) * (1 - clamp((t - tX) / 0.3))).toFixed(3); });
  sfx('blip', tH, { g: 0.9 });
  // 推近之后满屏都是字：给字幕和角上的小月亮各垫一块底色
  const band = h('div', 'abs', hud); css(band, { left: 0, top: '940px', width: W + 'px', height: '140px', background: NAVY, opacity: 0 }); hud.insertBefore(band, hud.firstChild);
  const pad = h('div', 'abs', hud); css(pad, { left: EMB.x - 56 + 'px', top: EMB.y - 56 + 'px', width: '112px', height: '112px', borderRadius: '50%', background: NAVY, opacity: 0 }); hud.insertBefore(pad, hud.firstChild);
  F((t) => { const o = (clamp((t - (tz + 0.7)) / 0.6) * (1 - clamp((t - tX) / 0.4))).toFixed(3); band.style.opacity = o; pad.style.opacity = o; });
});

// ── 7 核验：再编译并运行一个探针；复核每个源文件的哈希 ──
HOW.push(({ world, cam, fg, D, g, station }) => {
  const t22 = T('h22'), t24 = T('h24'), tOut = T('h25') - 0.85, sx = hx(7), SC = D.srcchange;
  station(7, t22 - 0.15); cam.hold(t22 + 0.5, sx, 0, tOut - t22 - 0.6, 1.02);
  // 探针
  const cc = D.cc.abi, cut = cc.indexOf(' -Wl,');
  const tm = makeTerm(world, sx + M, 214, 24, { lh: 1.5 });
  const cmdText = cc.slice(0, cut) + ' \\\n      ' + cc.slice(cut + 1);
  tm.cmd(t22 + 0.2, cmdText, { cps: 220 });
  const PY = 316, tP = T('h22', { zh: '探针', en: 'probe' }) - 0.3;
  note(world, sx + M, PY, 'lua-abi-probe.c' + `<span style="font-family:Inter,'Sans SC'">${tr('（节选）', ' (excerpt)')}</span>`, tP - 0.1, { cls: 'abs mono dim', css: { fontSize: '23px', lineHeight: '32px' } });
  const pc = codeBlock(world, D.abi_probe, sx + M, PY + 40, 28, { lh: 1.55, plain: true });
  pc.cascade(tP, { step: 0.07 });
  const tV = T('h22', { zh: '版本', en: 'version' }) - 0.35;
  hl(sub(pc._lines[2], 'strcmp(version, "Lua 5.4") == 0'), tV, t24 - 0.2);
  tick(g, sx + M + 28 * 0.6 * D.abi_probe[3].length + 46, PY + 40 + 3 * 43.4 + 22, 30, Tend('h22') - 0.45, fg, 4.5); sfx('chime', Tend('h22') - 0.45, { g: 0.6 });

  // 源文件的哈希复核：实测——用包装脚本在编译的那一刻改动 names.lua
  const HY = 560;
  ruleIn(world, sx + M, HY - 28, W - 2 * M, t24 - 0.3, { d: 0.9, h: 2, a: 0.5 });
  note(world, sx + M, HY, tr('实验：在编译的那一刻，用包装脚本改动 moon/names.lua', 'Experiment: a wrapper script edits moon/names.lua at the moment of compilation'), t24 - 0.15, { css: { fontSize: '28px' } });
  const rows = [[tr('发现时', 'at discovery'), SC.before, t24 + 0.1], [tr('此刻', 'now'), SC.after, T('h24', { zh: '哈希', en: 'hash' }) - 0.35]];
  rows.forEach(([lab, hash, tt], i) => {
    const y = HY + 58 + i * 54;
    note(world, sx + M, y, lab, tt, { cls: 't-body', css: { fontSize: '30px', lineHeight: '48px', fontWeight: 700 }, y: 0, x: -12 });
    const he = h('div', 'abs mono', world, ''); px(he, sx + M + (ZH ? 150 : 230), y + 3); css(he, { fontSize: '25px', lineHeight: '44px' });
    scramble(he, hash, tt + 0.05, 0.7);
  });
  // 不等号：两横一斜
  const nx = sx + M + (ZH ? 150 : 230) + 64 * 15 + 50, ny = HY + 58 + 51, tNe = T('h24', { zh: '对不上', en: 'no longer' }) - 0.1;
  [[nx, ny - 9, nx + 40, ny - 9], [nx, ny + 9, nx + 40, ny + 9], [nx + 8, ny + 24, nx + 32, ny - 24]].forEach(([x1, y1, x2, y2], i) => { const l = seg(g, x1, y1, x2, y2, fg, 5); fromTo(l, tNe + i * 0.08, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }); });
  sfx('error', tNe + 0.16, { g: 0.8 });
  const tmE = makeTerm(world, sx + M, HY + 190, 28, { lh: 1.5 });
  const eE = tmE.cmd(t24 + 0.5, SC.cmd, { cps: 60 });
  const tErr = Math.max(eE, T('h24', { zh: '构建作废', en: 'the build' }) - 0.25);
  const er = tmE.out(tErr, SC.err, { cls: 'sm3', sfx: false });
  hl(sub(er[0], 'SourceChangedError'), tErr + 0.2, tOut + 2);
});

// ── 8 落盘：暂存目录里做完，整体换入；失败不动旧产物；标记文件；可复现 ──
HOW.push(({ world, cam, fg, D, g, station }) => {
  const t25 = T('h25'), t26 = T('h26'), t27 = T('h27'), t28 = T('h28'), t30 = T('h30'), tOut = T('h31') - 0.85, sx = hx(8), SC = D.srcchange;
  cam.go(t25 - 0.85, sx, 0); station(8, t25 - 0.1); cam.hold(t25 + 0.4, sx, 0, tOut - t25 - 0.5, 1.02);
  const LX = sx + 760, RX = sx + 330, CY = 446, RR = 150;          // LX：暂存目录（在输出位置的旁边）；RX：输出位置
  const stg = D.cc.staging.replace(/(staging-[0-9a-f]{8})[0-9a-f-]+/, '$1…') + '/';
  const tS = T('h25', { zh: '前面', en: 'All of' }) - 0.35, tO = t25 + 0.1;          // 输出位置先出现，暂存目录在说到时出现
  // 两个位置：暂存目录（虚线圈）与输出位置（实线圈）
  const dash = ring(g, LX, CY, RR, fg, 3, { 'stroke-dasharray': '4 12', 'stroke-linecap': 'round' }), sol = ring(g, RX, CY, RR, fg, 3);
  fromTo(dash, tS, { autoAlpha: 0, scale: 0.75, svgOrigin: `${LX} ${CY}` }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
  fromTo(sol, tO, { autoAlpha: 0, scale: 0.75, svgOrigin: `${RX} ${CY}` }, { autoAlpha: 0.55, scale: 1, duration: 0.6, ease: 'expo.out' });
  const lab = (x, name, role, t) => note(world, x - 230, 212, `${esc(name)}<br><span class="dim" style="font-family:Inter,'Sans SC'">${role}</span>`, t, { cls: 'abs mono', css: { width: '460px', textAlign: 'center', fontSize: '23px', lineHeight: '34px' } });
  const labS = lab(LX, stg, tr('暂存目录', 'staging folder'), T('h25', { zh: '暂存', en: 'staging' }) - 0.3); lab(RX, 'build/moon/', tr('输出位置', 'output path'), tO + 0.1);
  // 包里的 11 个文件：可执行文件是中间的大圆，其余围在一圈
  const files = D.bundle_files, others = files.filter((f) => f.path !== 'moon');
  const grp = svg('g', {}, g), parts = [];
  const exe = disc(grp, LX, CY, 52, fg); parts.push([exe, LX, CY]);
  const tx = svg('text', { x: LX, y: CY + 9, 'text-anchor': 'middle', 'font-family': 'Mono', 'font-size': 25, 'font-weight': 600, fill: NAVY }, grp); tx.textContent = 'moon';
  let noticeDot = null;
  others.forEach((f, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / others.length, x = LX + 102 * Math.cos(a), y = CY + 102 * Math.sin(a), r = /liblua/.test(f.path) ? 19 : 8.5; const d = disc(grp, x, y, r, fg); parts.push([d, x, y]); if (/THIRD_PARTY/.test(f.path)) noticeDot = [d, x, y]; });
  parts.forEach(([e, x, y], i) => { popIn(e, tS + 0.45 + i * 0.07, x, y, { d: 0.4, ease: 'back.out(2.2)' }); if (i % 2 === 0) sfx('tick', tS + 0.45 + i * 0.07, { g: 0.8, p: -0.4 }); });
  fromTo(tx, tS + 0.7, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  // 整体换入
  const tW = T('h26', { zh: '换入', en: 'swapped' }) - 0.2;
  tl.fromTo(dash, { rotation: 0 }, { rotation: 50, duration: tW + 0.5 - tS, ease: 'none', svgOrigin: `${LX} ${CY}`, immediateRender: false }, tS);
  tl.to(grp, { x: RX - LX, duration: 0.7, ease: 'expo.inOut' }, tW);
  tl.to(dash, { autoAlpha: 0, scale: 0.8, duration: 0.35, ease: 'power2.in' }, tW + 0.45); fadeOut(labS, tW + 0.45, { d: 0.3 });
  tl.to(sol, { autoAlpha: 1, duration: 0.3 }, tW + 0.4); impact(g, RX, CY, RR, RR * 1.5, tW + 0.6, fg);
  sfx('whoosh', tW, { g: 0.7 }); sfx('thud', tW + 0.6, { g: 1 });

  // 中途失败：又一次构建在暂存目录里做到一半，失败，暂存目录被清走；右边不动
  const tN = t27 - 0.15, tF = T('h27', { zh: '失败', en: 'fails' }) + 0.2;
  const dash2 = ring(g, LX, CY, RR, fg, 3, { 'stroke-dasharray': '4 12', 'stroke-linecap': 'round' });
  fromTo(dash2, tN, { autoAlpha: 0, scale: 0.75, svgOrigin: `${LX} ${CY}` }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
  const half = [0, 1, 2, 3].map((i) => { const a = -Math.PI / 2 + i * 0.63, x = LX + 102 * Math.cos(a), y = CY + 102 * Math.sin(a), d = disc(g, x, y, i === 0 ? 19 : 8.5, fg); popIn(d, tN + 0.2 + i * 0.1, x, y, { d: 0.35 }); return [d, x, y]; });
  [dash2, ...half.map((x) => x[0])].forEach((e) => tl.to(e, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, tF));
  sfx('error', tF, { g: 0.8, p: -0.4 });
  const EY = 652;
  const cap1 = note(world, sx + M, EY, tr('一次失败的构建之后（第 7 步里的那次实验）', 'After a failed build (the experiment in step 7)'), tF + 0.1, { css: { fontSize: '26px' } });
  const tmA = makeTerm(world, sx + M, EY + 46, 26, { lh: 1.5 });
  const eA = tmA.cmd(tF + 0.15, 'sha256sum build/moon/moon; ls -a build', { cps: 80 });
  const oA = tmA.out(eA, [SC.kept + '  build/moon/moon', ...SC.ls], { cls: 'sm4', step: 0.05 });
  hl(sub(oA[0], SC.kept), Math.max(eA + 0.2, T('h27', { zh: '保持', en: 'stays' }) - 0.2), t28);
  const LHA = 26 * 0.9 * 1.5;                                         // 回显的行高
  const n1 = note(world, sx + M + 1290, EY + 46 + 39 + 2, tr('与失败之前相同', 'the same as before'), eA + 0.4, { css: { fontSize: '24px', lineHeight: LHA + 'px' } });
  const n2 = note(world, sx + M + 110, EY + 46 + 39 + LHA * 3 + 2, tr('暂存目录没有留下', 'no staging folder left behind'), eA + 0.6, { css: { fontSize: '24px', lineHeight: LHA + 'px' } });
  [cap1, tmA.el, n1, n2].forEach((e) => tl.to(e, { autoAlpha: 0, y: -16, duration: 0.25, ease: 'power2.in' }, t28 - 0.3));

  // 标记文件（节选）；目录被改过，重建拒绝覆盖
  const MXk = sx + 640, MK = D.marker, short = (l) => l.split('\t').map((x, i) => (i === 2 ? x.slice(0, 16) + '…' : x)).join('  ');
  const pickM = (re) => short(MK.find((l) => re.test(l)));
  const mk = [MK[0], MK[1], '⋮', pickM(/liblua/), pickM(/THIRD_PARTY/), pickM(/^file\tmoon\t/)];
  const tM = T('h28', { zh: '标记', en: 'marker' }) - 0.5;
  const mkEls = [note(world, MXk, 262, 'build/moon/.luai/generated-output.txt', tM, { cls: 'abs mono dim', css: { fontSize: '22px', lineHeight: '32px' } })];
  mk.forEach((l, i) => mkEls.push(note(world, MXk, 306 + i * 36, `<span>${esc(l)}</span>`, tM + 0.1 + i * 0.07, { cls: 'abs mono' + (l === '⋮' ? ' dim' : ''), css: { fontSize: '22px', lineHeight: '36px' }, x: -12, y: 0 })));
  const tEd = T('h28', { zh: '改过', en: 'changed' }) - 0.2;
  const tmB = makeTerm(world, sx + M, EY + 14, 26, { lh: 1.5 });
  const eB = tmB.cmd(tEd - 0.7, D.rebuild.edited_cmd, { cps: 110 });
  // 被改的那个文件：圈里对应的小圆变成空心，标记里它那一行反白
  const [nd, nx, ny] = noticeDot;
  const hole = disc(grp, nx, ny, 5, NAVY); popIn(hole, eB + 0.05, nx, ny, { d: 0.3 }); impact(g, nx + RX - LX, ny, 9, 34, eB + 0.05, fg, { d: 0.5 });
  hl(mkEls[5].firstChild, eB + 0.05, t30 - 0.2);
  const tRej = Math.max(eB + 0.3, T('h28', { zh: '拒绝', en: 'refuses' }) - 0.2);
  const oB = tmB.out(tRej, D.rebuild.edited, { cls: 'sm3', sfx: 'error' });
  hl(sub(oB[0], 'InvalidOutputError'), tRej + 0.2, t30);
  [tmB.el, ...mkEls].forEach((e) => tl.to(e, { autoAlpha: 0, y: -16, duration: 0.25, ease: 'power2.in' }, t30 - 0.3));
  tl.to(hole, { autoAlpha: 0, duration: 0.2 }, t30 - 0.3);

  // 可复现：三次构建（其中一次换了目录），三个相同的哈希
  const RP = D.repro, rows = [[RP.dir[0][0], RP.dir[0][1], ''], [RP.dir[1][0], RP.dir[1][1], ''], [RP.elsewhere, 'build/moon/moon', tr('在 /tmp/elsewhere 里构建', 'built in /tmp/elsewhere')]];
  if (new Set(rows.map((r) => r[0])).size !== 1) console.warn('落盘：三个哈希不相同');
  note(world, sx + M, EY, tr('构建两次，再换一个目录构建一次', 'Built twice, then once more in another folder'), t30 - 0.1, { css: { fontSize: '26px' } });
  const tSame = T('h30', { zh: '相同', en: 'byte-identical' }) - 0.25;
  rows.forEach(([hash, pth, extra], i) => {
    const y = EY + 52 + i * 46, he = h('div', 'abs mono', world, '<span></span>'); px(he, sx + M, y); css(he, { fontSize: '24px', lineHeight: '46px' });
    scramble(he.firstChild, hash, t30 + 0.1, Math.max(0.6, tSame - t30 - 0.1)); hl(he.firstChild, tSame, tOut + 2);
    note(world, sx + M + 64 * 14.4 + 40, y, esc(pth) + (extra ? `<span class="dim" style="font-family:Inter,'Sans SC'">   ${extra}</span>` : ''), t30 + 0.2 + i * 0.1, { cls: 'abs mono', css: { fontSize: '24px', lineHeight: '46px' }, y: 0 });
    const mx = sx + 760 + i * 230; const d = disc(g, mx, CY - 10, 54, fg); popIn(d, t30 + 0.15 + i * 0.16, mx, CY - 10, { d: 0.5 }); sfx('pop', t30 + 0.15 + i * 0.16, { g: 0.7, p: 0.3 + i * 0.2 });
    note(world, mx - 100, CY + 62, i === 2 ? '/tmp/elsewhere' : pth.split('/').slice(0, 2).join('/'), t30 + 0.3 + i * 0.16, { cls: 'abs mono', css: { width: '200px', textAlign: 'center', fontSize: '21px', lineHeight: '30px' }, a: 0.8 });
  });
  sfx('chime', tSame, { g: 0.7 });
});

// ── 运行时：main() 做的几件事；搜索器插在 package.searchers 的第二位 ──
HOW.push(({ world, cam, fg, D, g, station, codeNum }) => {
  const t31 = T('h31'), t32 = T('h32'), t33 = T('h33'), tOut = T('h34') - 0.85, sx = hx(9), LC = D.launcher;
  cam.go(t31 - 0.85, sx, 0); station(9, t31 - 0.1, tr('运行时', 'At run time')); cam.hold(t31 + 0.4, sx, 0, tOut - t31 - 0.5, 1.02);
  const idx = [0, 5, 11, 12, -1, 17, -1, 22, 23, 24, -1];
  const lines = idx.map((i) => (i < 0 ? '⋮' : LC.main[i])), nums = idx.map((i) => (i < 0 ? 0 : LC.main_line + i));
  note(world, sx + M, 212, 'build/moon/.luai/build/launcher.c', t31 + 0.1, { cls: 'abs mono dim', css: { fontSize: '24px', lineHeight: '36px' } });
  const code = codeNum(world, lines, sx + M, 262, 25, { lh: 1.66, nums, plain: true });
  code.cascade(t31 + 0.15, { step: 0.05 });
  const tok = (i, text) => sub(code._lines[i], text);
  const tNew = T('h31', { zh: '创建', en: 'creates' }) - 0.15, tOpen = T('h31', { zh: '打开', en: 'opens' }) - 0.15, tLoad = T('h32', { zh: '载入', en: 'loads' }) - 0.1, tRun = T('h33') - 0.2;
  hl(tok(1, 'luaL_newstate()'), tNew, tOpen); hl(tok(2, 'luaL_openlibs(L)'), tOpen, tLoad); hl(tok(7, 'luai_load_bootstrap(L)'), tLoad, tRun); hl(tok(9, 'lua_pcall'), tRun, tOut + 2);
  [tNew, tOpen, tLoad, tRun].forEach((tt) => sfx('blip', tt, { g: 0.7 }));
  if (!/luaL_newstate/.test(lines[1]) || !/luai_load_bootstrap/.test(lines[7]) || !/lua_pcall/.test(lines[9])) console.warn('运行时：main() 的行与节选不符');
  // 引导脚本只按文本载入（launcher.c 的原文）
  const ld = LC.load.findIndex((l) => /luaL_loadbufferx/.test(l));
  const lc = codeNum(world, [LC.load[ld].trim()], sx + M, 838, 22, { nums: [LC.load_line + ld], plain: true });
  lc.cascade(tLoad + 0.5);
  hl(sub(lc._lines[0], '"t"'), tLoad + 1.1, tOut + 2);
  note(world, sx + M + 48, 880, tr('"t"：只按文本载入，不接受字节码', '"t": loaded as text only, never as bytecode'), tLoad + 1.2, { css: { fontSize: '25px' } });

  // package.searchers：原有四个，新的插在第二位
  const SX = sx + 1230, SY = 372, SP = 94, tIns = T('h32', { zh: '插进', en: 'inserts' }) - 0.1, tSh = Math.min(T('h32', { zh: '搜索器', en: 'searcher' }) - 0.6, tIns - 0.95);   // 四个旧槽位先出现完，再插入（入场与下移不能重叠）
  note(world, SX - 32, 218, 'package.searchers', tSh, { cls: 'abs mono', css: { fontSize: '28px', lineHeight: '40px', fontWeight: 600 } });
  const mkSlot = (n, name, subt, solid) => {
    const e = h('div', 'abs', world, `<div class="sl${solid ? ' on' : ''}"><span>${n}</span></div><div class="sn">${name}${subt ? `<br><span class="mono dim">${subt}</span>` : ''}</div>`);
    return e;
  };
  const old = [['package.preload', ''], [tr('Lua 文件', 'Lua files'), 'package.path'], [tr('C 模块', 'C modules'), 'package.cpath'], [tr('C 模块（按根名）', 'C modules, by root'), 'package.cpath']];
  const slots = old.map(([name, subt], i) => { const e = mkSlot(i + 1, name, subt, false); px(e, SX - 32, SY + i * SP - 32); fadeIn(e, tSh + 0.1 + i * 0.08, { x: 16, d: 0.4 }); return e; });
  slots.slice(1).forEach((e, i) => { tl.to(e, { y: SP, duration: 0.5, ease: 'expo.inOut' }, tIns); keyed(e.querySelector('.sl span')).at(tIns + 0.25, { html: String(i + 3) }); });
  const neu = mkSlot(2, tr('包内的模块', 'bundled modules'), tr('引导脚本里的搜索器', 'the bootstrap\'s searcher'), true); px(neu, SX - 32, SY + SP - 32);
  fromTo(neu, tIns + 0.2, { autoAlpha: 0, x: -90 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' });
  impact(g, SX, SY + SP, 32, 70, tIns + 0.55, fg, { d: 0.6 }); sfx('whoosh', tIns, { g: 0.5, p: 0.5 }); sfx('thud', tIns + 0.5, { g: 0.8, p: 0.5 });
  // 两次 require：一个在包里（第 2 位命中），一个是 C 模块（走到文件系统，在 .luai/native 里找到）
  const run = (t0, name, hit, result) => {
    const TX = SX - 78, d = disc(g, TX, SY, 10, fg);
    const lb = note(world, SX - 32, 270, `<span>require("${name}")</span>`, t0 - 0.1, { cls: 'abs mono', css: { fontSize: '25px', lineHeight: '40px' }, x: -12, y: 0 });
    fromTo(d, t0, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
    for (let i = 1; i <= hit; i++) { tl.to(d, { y: i * SP, duration: 0.22, ease: 'power2.inOut' }, t0 + 0.2 + (i - 1) * 0.3); sfx('tick', t0 + 0.2 + (i - 1) * 0.3, { g: 0.9, p: 0.5 }); }
    const th = t0 + 0.2 + hit * 0.3;
    tl.to(d, { x: 78, duration: 0.2, ease: 'power2.in' }, th - 0.05); tl.to(d, { autoAlpha: 0, duration: 0.1 }, th + 0.15);
    impact(g, SX, SY + hit * SP, 32, 64, th + 0.15, fg, { d: 0.5 }); sfx('pop', th + 0.15, { g: 0.8, p: 0.5 });
    const rs = note(world, SX + 300, SY + hit * SP - 30, '→ ' + result, th + 0.2, { cls: 'abs mono', css: { fontSize: '22px', lineHeight: '32px' }, y: 0, x: -10 });
    hl(rs, th + 0.2, tOut + 2);
    return [d, lb, rs];
  };
  const mrec = D.boot.modules.find((l) => /moon\.phase/.test(l)).match(/= (module_records\[\d+\])/)[1];
  const r1 = run(T('h33', { zh: 'require', en: 'require' }) - 0.2, 'moon.phase', 1, mrec);
  const t2 = T('h33', { zh: '再查', en: 'before' }) - 0.5;
  tl.to(r1[1], { autoAlpha: 0, duration: 0.2 }, t2 - 0.3);
  run(t2, 'lfs', 3, D.native.files.find((f) => /lfs/.test(f)));
});

// ── 单文件：包里的每个文件原样写成字节数组，前后是解压器自己的代码；解压到按内容哈希命名的目录；进程号不变 ──
// 这条图是 build/moon-onefile 的真实布局：每一段的位置就是该文件在单文件里的偏移（research/lab/v2/out_29_onefile_unpack.txt）
HOW.push(({ world, cam, fg, D, g, station }) => {
  const t34 = T('h34'), t35 = T('h35'), t37 = T('h37'), sx = hx(10);
  cam.go(t34 - 0.85, sx, 0); station(10, t34 - 0.1, tr('单文件', 'Single file')); cam.hold(t34 + 0.4, sx, 0, T('h37') + 4.5 - t34, 1.02);
  const FM = D.onefile_map, SUM = D.onefile_sum, total = SUM.total;
  const BX = sx + M, BW = W - 2 * M, BY = 392, BH = 52, kx = BW / total;
  const p0 = FM[0].off, p1 = FM[FM.length - 1].off + FM[FM.length - 1].size;         // 载荷的起止偏移
  const tF = T('h34', { zh: '整个', en: 'whole' }) - 0.3, tE = T('h34', { zh: '解压器', en: 'extractor' }) - 0.35;
  // 载荷：12 个文件，实心；依偏移自左向右出现
  let lastR = -1e9, nSmall = 0;
  FM.forEach((f, i) => {
    const x0 = BX + f.off * kx, w = f.size * kx, tt = tF + i * 0.09, name = f.path.split('/').pop();
    const l = seg(g, x0, BY, x0 + Math.max(1.5, w - 2.5), BY, fg, BH);
    fromTo(l, tt, { scaleX: 0, svgOrigin: `${x0} ${BY}` }, { scaleX: 1, duration: 0.45, ease: 'expo.out' });
    if (i % 2 === 0) sfx('tick', tt, { g: 0.8, p: -0.6 + 1.2 * f.off / total });
    if (w <= 70) { nSmall++; return; }
    const label = name === 'inner' ? `inner<span class="dim" style="font-family:Inter,'Sans SC'"> ${tr('真正的程序', 'the real program')}</span>` : esc(name);
    const e = note(world, x0 + 2, BY - BH / 2 - 76, `${label}<br><span class="dim">${fmt(f.size)}</span>`, tt + 0.15, { cls: 'abs mono', css: { fontSize: '21px', lineHeight: '30px' }, y: 0 });
    // 标签放在自己那一段的上方：被前一个标签挡住就往右让（段够宽）；伸出版心就靠右对齐
    const lw = e.offsetWidth; let lx = Math.max(x0 + 2, lastR + 28);
    if (lx + lw > BX + BW) lx = BX + BW - lw;
    if (lx > x0 + w - 20) console.warn('单文件：标签放不下', name);
    e.style.left = lx + 'px'; lastR = lx + lw;
  });
  // 解压器自己的部分：头（ELF 头与机器码）和尾（数据段与符号表），画成空心，把载荷夹在中间
  [[0, p0], [p1, total]].forEach(([a, b], i) => {
    const x0 = BX + a * kx, w = (b - a) * kx - (i ? 0 : 2.5);
    const r = svg('rect', { x: x0 + 1.5, y: BY - BH / 2 + 1.5, width: Math.max(2, w - 3), height: BH - 3, fill: 'none', stroke: fg, 'stroke-width': 3 }, g);
    fromTo(r, tE + i * 0.12, { autoAlpha: 0, scaleY: 1.5, svgOrigin: `${x0 + w / 2} ${BY}` }, { autoAlpha: 1, scaleY: 1, duration: 0.5, ease: 'expo.out' });
  });
  sfx('thud', tE + 0.1, { g: 0.8, p: -0.5 });
  note(world, BX, BY + BH / 2 + 14, `${tr('解压器', 'extractor')}<span class="dim">  ${tr('头尾两段，共', 'head and tail,')} ${fmt(SUM.rest)}</span>`, tE + 0.2, { cls: 'abs mono', css: { fontSize: '21px', lineHeight: '30px', fontFamily: '"Mono","Sans SC"' } });
  // 总数与载荷
  note(world, BX, 212, `build/moon-onefile   <span id="of-n"></span><span class="dim"> ${tr('字节', 'bytes')}</span>`, t34 + 0.05, { cls: 'abs mono', css: { fontSize: '28px', lineHeight: '40px' } });
  const cn = world.querySelector('#of-n'); let lastC = -1;
  F((t) => { const v = Math.round(SUM.payload * ease.out5(clamp((t - tF) / 1.6)) + SUM.rest * ease.out5(clamp((t - tE) / 0.5))); if (v !== lastC) { cn.textContent = fmt(v); lastC = v; } });
  const bx0 = BX + p0 * kx, bx1 = BX + p1 * kx, by = BY + BH / 2 + 64;
  const br = seg(g, bx0, by, bx1 - 2, by, fg, 2); fromTo(br, tF + 1.1, { scaleX: 0, svgOrigin: `${bx0} ${by}` }, { scaleX: 1, duration: 0.6, ease: 'expo.out' });
  note(world, bx0, by + 10, tr(`包里的 ${SUM.files} 个文件，原样写成字节数组：${fmt(SUM.payload)} 字节`, `the bundle's ${SUM.files} files, written out as byte arrays: ${fmt(SUM.payload)} bytes`), tF + 1.3, { css: { fontSize: '25px' } });
  note(world, BX + BW - 500, by + 10, tr(`未标名的 ${nSmall} 段是较小的文件`, `the ${nSmall} unlabelled segments are smaller files`), tF + 1.5, { css: { width: '500px', textAlign: 'right', fontSize: '21px', lineHeight: '34px' } });

  // 首次运行：解压到按内容哈希命名的目录（实测的目录列表）
  const TY = 556, OF = D.onefile_find, hashDir = D.onefile.cache.split('/').pop();
  const tm = makeTerm(world, sx + M, TY, 30, { lh: 1.5 });
  const e1 = tm.cmd(t35 - 0.1, 'find /tmp/luainstaller-onefile-$(id -u) -maxdepth 2 | sort', { cps: 70 });
  const o1 = tm.out(e1, OF, { cls: 'sm2', step: 0.06 });
  const tHash = Math.max(e1 + 0.3, T('h35', { zh: '内容哈希', en: 'content hash' }) - 0.2);
  hl(sub(o1[1], hashDir), tHash, t37 - 0.2); sfx('blip', tHash, { g: 0.7 });
  // 「之后直接复用」（docs/BUNDLING.adoc：Later runs reuse that copy if it's byte-for-byte identical）
  const tRe = T('h35', { zh: '之后', en: 'reuses' }) - 0.1;
  note(world, sx + M + 640, TY + 45 + 2, tr('之后的运行：内容相同，直接复用这个目录', 'later runs: same content, so this folder is reused'), tRe, { css: { fontSize: '24px', lineHeight: '33px', color: fg }, x: -14, y: 0, a: 0.85 }); sfx('blip', tRe, { g: 0.6 });
  // 进程号不变（实测）
  tm.gap(0.5);
  const e2 = tm.cmd(t37 + 0.05, D.onefile.pid_cmd, { cps: 70 });
  const o2 = tm.out(Math.max(e2, T('h37', { zh: '进程号', en: 'process' }) - 0.5), D.onefile.pid, { cls: 'sm2', step: 0.25 });
  const pid = D.onefile.pid[0].match(/(\d+)$/)[1], tP = T('h37', { zh: '不变', en: 'stays' }) - 0.25;
  o2.forEach((l) => hl(sub(l, pid), tP, 1e9)); sfx('chime', tP, { g: 0.7 });
  hl(sub(o1[4], '/inner'), T('h37', { zh: '真正', en: 'real' }) - 0.2, tP);
});
