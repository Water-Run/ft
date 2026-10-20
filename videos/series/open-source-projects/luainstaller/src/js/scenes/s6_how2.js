// 06 实现原理（续）：3 清单、4 工具链、5 生成 C

// ── 3 清单：上一站的四个圆（入口与三个模块）沿着流水线过来，成为清单的四行 ──
HOW.push((ctx) => {
  const { world, cam, fg, D, g, station } = ctx;
  const t9 = T('h9'), t10 = T('h10'), tOut = T('h11') - 0.85, sx = hx(3), tGo = t9 - 0.85, dGo = 1.15;
  cam.go(tGo, sx, 0); station(3, t9 - 0.1); cam.hold(t9 + 0.4, sx, 0, tOut - t9 - 0.5, 1.02);
  note(world, sx + M, 212, 'build/moon/.luai/manifest.lua', t9 + 0.15, { cls: 'abs mono dim', css: { fontSize: '26px', lineHeight: '36px' } });
  const X1 = sx + M + 56, X2 = sx + M + 420, X3 = sx + 1340, RY = 338, RH = 90, MF = D.manifest;
  const tw = [T('h9', { zh: '身份', en: 'identity' }) - 0.25, T('h9', { zh: '哈希', en: 'hash' }) - 0.25, T('h9', { zh: '位置', en: 'place' }) - 0.25];
  [['source_id', X1], ['content_hash', X2], ['destination_path', X3]].forEach(([n, x], i) => note(world, x, 270, n, tw[i], { cls: 'abs mono dim', css: { fontSize: '24px', lineHeight: '34px' }, y: 0 }));
  hairlines(world, sx + M, RY - 14, W - 2 * M, MF.length, RH, t9 + 0.1);
  MF.forEach((m, i) => {
    const y = RY + i * RH;
    note(world, X1, y + 8, m.id, tw[0] + 0.05 + i * 0.07, { cls: 'abs mono', css: { fontSize: '32px', lineHeight: '46px', fontWeight: 600 }, x: -12, y: 0 });
    const he = h('div', 'abs mono', world, ''); px(he, X2, y + 12); css(he, { fontSize: '20px', lineHeight: '40px' });
    scramble(he, m.sha, tw[1] + i * 0.1, 1.0); sfx('tick', tw[1] + i * 0.1 + 1.0, { g: 0.8 });
    note(world, X3, y + 10, m.dest, tw[2] + 0.05 + i * 0.07, { cls: 'abs mono', css: { fontSize: '26px', lineHeight: '42px' }, x: -12, y: 0 });
  });
  // 从上一站带过来的四个圆：行星 → main.lua 那一行；三颗卫星 → 各自的那一行
  const sys = ctx.sys2, io = gsap.parseEase('power3.inOut');
  const rowOf = { planet: MF.findIndex((m) => m.id === 'main.lua'), 0: MF.findIndex((m) => m.id === 'moon/phase.lua'), 1: MF.findIndex((m) => m.id === 'moon/names.lua'), 2: MF.findIndex((m) => m.id === 'moon/julian.lua') };
  const from = (key, t) => (key === 'planet' ? [sys.st.cx, sys.st.cy, sys.st.rp] : [...sys.pos(+key, t).slice(0, 2), sys.moons[+key].r * sys.k]);
  Object.keys(rowOf).forEach((key) => {
    const d = disc(g, 0, 0, 0, fg), to = [sx + M + 18, RY + rowOf[key] * RH + 31, 13];
    F((t) => {
      const a = from(key, Math.min(t, tGo)), k = io(clamp((t - tGo) / dGo));
      d.setAttribute('cx', lerp(a[0], to[0], k).toFixed(2)); d.setAttribute('cy', lerp(a[1], to[1], k).toFixed(2)); d.setAttribute('r', lerp(a[2], to[2], k).toFixed(2));
      d.style.opacity = clamp((t - (tGo - 0.25)) / 0.25).toFixed(3);
    });
  });
  hideSys(sys, tGo - 0.25);
  // 路径相对于入口：绝对路径的前缀被划掉
  const abs = D.trace[0].match(/-> (\S+)/)[1], rel = MF.find((m) => abs.endsWith('/' + m.id)).id, pre = abs.slice(0, abs.length - rel.length);
  const AY = 730;
  const big = note(world, sx + M, AY, `<span>${esc(pre)}</span><span class="hlb">${esc(rel)}</span>`, t10 - 0.1, { cls: 'abs mono', css: { fontSize: '44px', lineHeight: '60px' }, x: -16, y: 0 });
  const tRel = T('h10', { zh: '相对', en: 'relative' }) - 0.1, tAbs = T('h10', { zh: '不含', en: 'no absolute' }) - 0.1;
  hl(big.lastChild, tRel, tOut + 2); sfx('blip', tRel, { g: 0.7 });
  const pw = big.firstChild.offsetWidth;
  const strike = h('div', 'rule', world); px(strike, sx + M - 6, AY + 29, pw + 6); css(strike, { height: '3px' });
  fromTo(strike, tAbs, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }); tl.to(big.firstChild, { opacity: 0.4, duration: 0.4 }, tAbs + 0.1); sfx('tick', tAbs, { g: 1 });
  // 实测：清单与可执行文件里都搜不到构建机器上的路径
  const tm = makeTerm(world, sx + M, AY + 86, 24, { lh: 1.55 });
  const cmd = 'grep -c /home/waterrun build/r1/moon/.luai/manifest.lua; strings build/r1/moon/moon | grep -c /home/waterrun';
  const e = tm.cmd(tAbs + 0.2, cmd, { cps: 170 });
  tm.out(e, D.privacy, { cls: '', step: 0.12 });
});

// ── 4 工具链：三样东西，两个探针 ──
HOW.push(({ world, cam, fg, D, g, station }) => {
  const t = T('h11'), tOut = T('h13') - 0.85, sx = hx(4);
  cam.go(t - 0.7, sx, 0); station(4, t - 0.1); cam.hold(t + 0.4, sx, 0, tOut - t - 0.5, 1.02);
  const inc = D.cc.probe.match(/-I(\S+)/)[1], lib = D.cc.probe.match(/(\S+liblua\S+)/)[1], ver = D.boot.guard[0].match(/!= (\d+)/)[1];
  const tC = T('h11', { zh: '编译器', en: 'compiler' }) - 0.25, tL = T('h11', { zh: '同版本', en: 'matching' }) - 0.2;
  const items = [[tr('C 编译器', 'C compiler'), 'gcc ' + D.versions.gcc, '', tC], [tr('Lua 头文件', 'Lua headers'), inc + '/lua.h', 'LUA_VERSION_NUM ' + ver, tL], [tr('Lua 库', 'Lua library'), lib, '', tL + 0.35]];
  const cw = (W - 2 * M) / 3, cy = 330, RD = 40;
  items.forEach(([name, val, extra, tt], i) => {
    const x = sx + M + i * cw + RD, t0 = t + 0.25 + i * 0.12;                 // t0：空心圆与名字进场；tt：找到（填实）
    const rg = svg('circle', { cx: x, cy, r: RD - 2, fill: 'none', stroke: fg, 'stroke-width': 4 }, g); popIn(rg, t0, x, cy, { d: 0.5 });
    const c = disc(g, x, cy, RD, fg); popIn(c, tt, x, cy, { d: 0.5, ease: 'back.out(2.4)' }); impact(g, x, cy, RD, RD * 2, tt + 0.1, fg, { d: 0.6 }); sfx('pop', tt, { g: 0.8, p: -0.5 + i * 0.5 });
    head(world, x + RD + 34, cy - 60, name, 'd-3', t0 + 0.05, { d: 0.7, css: { fontSize: ZH ? '52px' : '44px' } });
    note(world, x + RD + 36, cy + 16, val, tt + 0.3, { cls: 'abs mono', css: { fontSize: '27px', lineHeight: '38px' } });
    if (extra) note(world, x + RD + 36, cy + 58, extra, tt + 0.5, { cls: 'abs mono dim', css: { fontSize: '23px', lineHeight: '34px' } });
  });
  // 两个探针：编译，再运行（实测的两条编译命令）
  const PY = 560, tP = T('h11', { zh: '再用', en: 'then' }) - 0.7;
  ruleIn(world, sx + M, PY - 30, W - 2 * M, tP - 0.2, { d: 0.9, h: 2, a: 0.5 });
  note(world, sx + M, PY, tr('探针：编译，再运行', 'Probes: compile, then run'), tP - 0.1, { css: { fontSize: '30px' } });
  const tm = makeTerm(world, sx + M, PY + 60, 25, { lh: 2.4 });
  const tOk = T('h11', { zh: '确认', en: 'prove' }) - 0.1;
  [D.cc.probe_native, D.cc.probe].forEach((c, i) => {
    tm.cmd(tP + i * 0.75, c, { cps: 150 });
    tick(g, sx + W - M - 30, PY + 60 + 30 + i * 60, 34, tOk + i * 0.4, fg, 5); sfx('chime', tOk + i * 0.4, { g: 0.6 });
  });
  // 探针决定了什么：trace 输出里的原话，以及这一次的结果
  const nt = D.cmd['luai -t main.lua'].find((l) => /probes/.test(l)), so = D.cmd['find build/moon'].find((l) => /native\/liblua/.test(l)).replace(/^moon\//, '');
  note(world, sx + M, PY + 226, esc(nt), tOk + 0.5, { cls: 'abs mono dim', css: { fontSize: '24px', lineHeight: '36px' } });
  note(world, sx + M, PY + 274, tr('这一次：链接共享库，并把它复制进包里', 'This build: link the shared library and copy it into the bundle') + `<span class="mono" style="color:var(--fg)">   ${esc(so)}</span>`, tOk + 0.9, { css: { fontSize: '28px', lineHeight: '40px' } });
});

// ── 5 生成 C：引导脚本（节选）→ 逐字节写成 C 数组 → 接上启动器模板 = launcher.c ──
HOW.push(({ world, cam, fg, D, g, station, codeNum }) => {
  const t13 = T('h13'), t14 = T('h14'), t15 = T('h15'), t16 = T('h16'), tOut = T('h17') - 0.85, sx = hx(5), S = D.boot.src;
  cam.go(t13 - 0.85, sx, 0); station(5, t13 - 0.1); cam.hold(t13 + 0.4, sx, 0, t15 - t13 - 1.3, 1.02);
  // 5a：引导脚本节选（行号是真实的）
  const ex = (nums) => nums.map((n) => (n ? S[n - 1] : '⋮'));
  const L1 = [1, 2, 3, 4, 5, 6, 7, 0, 79, 80, 0, 93, 94, 95, 96, 97], L2 = [167, 168, 169, 170, 171, 172, 0, 176];
  const tA = T('h13', { zh: '先拼出', en: 'First' }) - 1.0, FS = 23, CL = 37, CY = 274;
  // 这一步的配方：四个词依次出现，说到哪个，哪个反白
  const tF = T('h13', { zh: '生成', en: 'generate' }) - 0.2;
  const terms = [tr('引导脚本', 'bootstrap script'), '→', tr('C 数组', 'C array'), '+', tr('启动器模板', 'launcher template'), '=', 'launcher.c'];
  const fw = h('div', 'abs t-body', world, terms.map((w, i) => (i % 2 ? `<span class="dim" style="margin:0 .5em">${w}</span>` : `<span class="hlb${w === 'launcher.c' ? ' mono' : ''}">${w}</span>`)).join('')); px(fw, sx + M - 6, 204); css(fw, { fontSize: '30px', lineHeight: '44px', fontWeight: 700 });
  [...fw.children].forEach((e, i) => fromTo(e, tF + i * 0.13, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' }));
  hl(fw.children[0], T('h13', { zh: '引导', en: 'bootstrap' }) - 0.2, t15 - 0.9);
  note(world, sx + M, 212, `${S.length} ${tr('行', 'lines')} · ${fmt(D.boot.size)} ${tr('字节', 'bytes')}`, tA + 0.2, { cls: 'abs mono dim', css: { width: W - 2 * M + 'px', textAlign: 'right', fontSize: '24px', lineHeight: '36px' } });
  const c1 = codeNum(world, ex(L1), sx + M, CY, FS, { lh: CL / FS, nums: L1, marks: [['module_records', 'mr'], ['source = ', 'src'], ['["moon.julian"] = module_records[1],', 'm1']] });
  const c2 = codeNum(world, ex(L2), sx + 1200, CY, FS, { lh: CL / FS, nums: L2, marks: [['searcher = function(module_name)', 'fn'], ['table.insert(searchers, 2, searcher)', 'ins']] });
  c1.cascade(tA, { step: 0.045 }); c2.cascade(tA + 0.6, { step: 0.045 });
  if (S[2] !== 'local module_records = {' || !S[175].includes('table.insert(searchers, 2, searcher)')) console.warn('生成 C：引导脚本的行号与节选不符');
  const tMR = T('h14', { zh: '模块表', en: 'table' }) - 0.15, tSrc = T('h14', { zh: '源码', en: 'source' }) - 0.2, tFn = T('h14', { zh: '搜索器', en: 'searcher' }) - 0.25;
  hl(c1.m('mr'), tMR, tSrc); hl(c1._lines[5].lastChild.previousSibling ? c1.m('src') : c1.m('src'), tSrc, tFn);
  hl(c2.m('fn'), tFn, t15 - 0.9); hl(c2.m('ins'), tFn + 0.5, t15 - 0.9);
  [tMR, tSrc, tFn].forEach((tt) => sfx('blip', tt, { g: 0.7 }));

  // 5b：文本逐字节写成 C 数组。前 96 个字符排成 12 列的网格，一格一格翻成十六进制
  const y0 = 1240, tGo = t15 - 0.85;
  cam.go(tGo, sx, y0); cam.hold(t15 + 0.4, sx, y0, tOut - t15 - 0.5, 1.02);
  const NB = 96, COLS = 12, HF = 26, CW = HF * 0.6 * 6, CH = 52, GX = sx + M, GXg = GX + HF * 0.6 * 4, GY = y0 + 258;
  const txt = S.join('\n').slice(0, NB), hex = (b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0') + ',';
  if (D.boot.head.some((b, i) => b !== txt.charCodeAt(i))) console.warn('生成 C：引导脚本与数组的前 96 个字节不一致');
  for (let r = 0; r < NB / COLS; r++) if (D.boot.first_rows[r] !== D.boot.head.slice(r * COLS, r * COLS + COLS).map(hex).join(' ')) console.warn('生成 C：数组第', r, '行与 launcher.c 不一致');
  note(world, GX, y0 + 150, tr('引导脚本的前 96 个字节', 'The first 96 bytes of the bootstrap'), tGo + 0.5, { css: { fontSize: '28px' } });
  const tW = T('h15', { zh: '逐字节', en: 'byte by byte' }) - 0.5, DT = 0.017, FD = 0.2;        // tW：翻转开始；每格相隔 DT，翻一次用时 FD
  const decl = note(world, GX, y0 + 204, esc(D.boot.decl), tW - 0.15, { cls: 'abs mono', css: { fontSize: HF + 'px', lineHeight: CH + 'px' }, x: -14, y: 0 });
  const cells = [];
  for (let k = 0; k < NB; k++) {
    const c = h('div', 'abs mono bc', world); px(c, GXg + (k % COLS) * CW, GY + Math.floor(k / COLS) * CH, CW, CH);
    const ch = txt[k];
    const a = h('span', 'ca', c, ch === ' ' ? '<span class="dim">·</span>' : ch === '\n' ? '<span class="dim" style="font-size:.62em">\\n</span>' : esc(ch));
    const b = h('span', 'cb', c, hex(txt.charCodeAt(k)));
    css(a, { width: HF * 0.6 * 5 + 'px' }); css(b, { fontSize: HF + 'px' });
    cells.push({ a, b, last: -2 });
  }
  const tG = tGo + 0.55;                                               // 字符先出现（按行）
  F((t) => {
    for (let k = 0; k < NB; k++) {
      const c = cells[k], row = Math.floor(k / COLS);
      const vis = clamp((t - (tG + row * 0.05)) / 0.2), p = clamp((t - (tW + k * DT)) / FD);
      const key = Math.round(vis * 20) * 100 + Math.round(p * 40);
      if (key === c.last) continue; c.last = key;
      c.a.style.opacity = (vis * clamp(1 - p * 2)).toFixed(3); c.a.style.transform = `translateY(${(-14 * clamp(p * 2)).toFixed(1)}px)`;
      c.b.style.opacity = clamp(p * 2 - 1).toFixed(3); c.b.style.transform = `translateY(${(14 * (1 - clamp((p - 0.5) * 2))).toFixed(1)}px)`;
    }
  });
  for (let k = 0; k < NB; k += 4) sfx('key', tW + k * DT + FD * 0.5, { g: 0.8 });
  // 数到 6,964：前 96 个逐格数，其余的一口气流过去
  const tEndW = tW + NB * DT + FD, tStream = 0.9;
  const cnt = note(world, GXg + COLS * CW - 420, y0 + 204, '', tW - 0.1, { cls: 'abs mono', css: { width: '404px', textAlign: 'right', fontSize: HF + 'px', lineHeight: CH + 'px' }, y: 0 });
  let lastN = -1;
  F((t) => { const n = t < tEndW ? Math.round(NB * clamp((t - tW) / (NB * DT))) : Math.round(lerp(NB, D.boot.size, ease.io3(clamp((t - tEndW) / tStream)))); if (n !== lastN) { cnt.innerHTML = `${fmt(n)}<span class="dim"> / ${fmt(D.boot.size)} ${tr('字节', 'bytes')}</span>`; lastN = n; } });
  const ty = GY + (NB / COLS) * CH;
  note(world, GXg, ty - 2, '⋮', tEndW, { cls: 'abs mono dim', css: { fontSize: HF + 'px', lineHeight: '40px' }, y: 0 });
  D.launcher.last_rows.forEach((r, i) => note(world, GXg, ty + 40 + i * CH, esc(r), tEndW + 0.35 + i * 0.12, { cls: 'abs mono', css: { fontSize: HF + 'px', lineHeight: CH + 'px' }, x: -12, y: 0 }));
  note(world, GX, ty + 40 + 2 * CH, '};', tEndW + 0.7, { cls: 'abs mono', css: { fontSize: HF + 'px', lineHeight: CH + 'px' }, y: 0 });
  sfx('whoosh', tEndW, { g: 0.5 });

  // 右边：launcher.c 的缩略图。每一行画成一条短线，长度就是那一行的长度（真实文件，824 行）
  const LC = D.launcher, lens = LC.lens, MW = 250, LP = 0.75, MX = sx + W - M - MW, MY = y0 + 204, maxLen = Math.max(...lens);
  const cv = document.createElement('canvas'); cv.width = MW * 2; cv.height = lens.length * 3;
  css(cv, { position: 'absolute', left: MX + 'px', top: MY + 'px', width: MW + 'px', height: lens.length * LP + 'px' }); world.appendChild(cv);
  const c2d = cv.getContext('2d'); c2d.fillStyle = fg;
  lens.forEach((n, i) => { if (n) c2d.fillRect(0, i * 3, Math.max(3, Math.round(n / maxLen * MW * 2)), 2); });
  const mv = freeze(cv);
  const aEnd = LC.size_line - 1;                                         // 数组的最后一行（'};'）
  const tT = T('h16', { zh: '启动器', en: 'launcher' }) - 0.3;
  F((t) => {
    const k1 = ease.io3(clamp((t - tW) / (tEndW + tStream - tW))) * aEnd, k2 = ease.io3(clamp((t - tT) / 0.9)) * (lens.length - aEnd);
    mv.style.clipPath = `inset(0 0 ${(100 * (1 - (k1 + k2) / lens.length)).toFixed(2)}% 0)`;
  });
  sfx('whoosh', tT, { g: 0.5, p: 0.6 });
  const tN = T('h16', { zh: 'launcher', en: 'form launcher' }) - 0.1;
  const ttl = note(world, MX - 300, y0 + 150, `<span class="dim">${fmt(LC.lines)} ${tr('行', 'lines')}   </span><span class="hlb">launcher.c</span>`, tW - 0.1, { cls: 'abs mono', css: { width: 300 + MW + 'px', textAlign: 'right', fontSize: '28px', lineHeight: '40px' } });
  hl(ttl.lastChild, tN, tOut + 2); sfx('blip', tN, { g: 0.8 });
  const lab = (line, name, num, t) => {
    const y = MY + line * LP;
    note(world, MX - 262, y - 28, `${name}<br><span class="dim">${num}</span>`, t, { cls: 'abs mono', css: { width: '236px', textAlign: 'right', fontSize: '21px', lineHeight: '28px' }, y: 0, x: 10 });
    const l = seg(g, MX - 16, y, MX - 3, y, fg, 2); fromTo(l, t, { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.2 });
  };
  lab(Math.round(aEnd * 0.72), 'luai_bootstrap[]', `${LC.decl_line}–${aEnd}`, tEndW + 0.3);
  lab(LC.error_line, '#error', LC.error_line, tT + 0.55); lab(LC.main_line, 'main()', LC.main_line, tT + 0.8);
  // 网格是数组开头那 8 行的放大：一条括线，一条连线
  const bx = GXg + COLS * CW + 14, by0 = GY + 6, by1 = GY + (NB / COLS) * CH - 6;
  [[bx, by0, bx, by1], [bx, (by0 + by1) / 2, MX - 6, MY + (LC.decl_line + 4) * LP]].forEach(([x1, y1, x2, y2]) => { const l = seg(g, x1, y1, x2, y2, fg, 2, { opacity: 0 }); fromTo(l, tW, { autoAlpha: 0 }, { autoAlpha: 0.4, duration: 0.5 }); });
});
