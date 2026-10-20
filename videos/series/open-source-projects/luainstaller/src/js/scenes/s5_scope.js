// 05 边界：它不做什么。每一条都配上实测回显或文档原文。
// A 屏：不做交叉编译——两台机器必须是同一系统、架构和 Lua 版本；B 屏：其余四条
scene('scope', ({ root, s, c0 }) => {
  const st = stageOf(root, 'paper'); const { world, cam, fg, bg } = st;
  chapter(root, s); emblem(st, s);
  const D = window.DATA;

  // ── A：让它替别的系统构建 ──
  const e2 = T('e2'), e4 = T('e4');
  cam.at(c0 - 0.2, 0, 0, 1.04); cam.hold(c0, 0, 0, e4 - c0 - 0.9, 1);
  const tm = makeTerm(world, M, 96, 36, { lh: 1.5 });
  const ec = tm.cmd(c0 + 0.1, 'luai -b main.lua -o build/x --target-os windows', { cps: 46 });
  const eo = tm.out(ec, D.err.target_os, { cls: 'sm2', sfx: 'error' });
  hl(sub(eo[0], 'UnsupportedPlatformError'), ec + 0.25, e4);
  // 两台机器：构建的那台，运行的那台。里面的三样东西必须逐项相同（取自实测的 compatibility 输出）
  const host = D.api.find((l) => l.startsWith('host')).split('\t');           // host  linux  x86_64  lua  Lua 5.4
  const vals = [host[1], host[2], host[4]];
  const g = gfx(world), R = 232, LX = 520, RX = 1400, CY = 612;
  const tB = T('e2', { zh: '构建', en: 'Build' }) - 0.15, tR = T('e2', { zh: '运行', en: 'run' }) - 0.15;
  const mkRing = (x, t, label) => {
    const r = ring(g, x, CY, R, fg, 3);
    fromTo(r, t, { autoAlpha: 0, scale: 0.7, svgOrigin: `${x} ${CY}` }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    note(world, x - R, CY - R - 62, label, t + 0.15, { css: { width: 2 * R + 'px', textAlign: 'center', fontSize: '30px', color: fg }, y: 0 });
    sfx('pop', t, { g: 0.7, p: x < W / 2 ? -0.4 : 0.4 });
  };
  mkRing(LX, tB, tr('构建的机器', 'where it is built')); mkRing(RX, tR, tr('运行的机器', 'where it runs'));
  const words = [{ zh: '系统', en: 'system' }, { zh: '架构', en: 'architecture' }, { zh: 'Lua 版本', en: 'Lua version' }];
  const names = [tr('系统', 'system'), tr('架构', 'architecture'), tr('Lua 版本', 'Lua version')];
  vals.forEach((v, i) => {
    const t = Math.max(T('e2', words[i]) - 0.1, Math.max(tB, tR) + 0.35 + i * 0.1), y = CY - 118 + i * 80;
    [LX, RX].forEach((x) => { const e = head(world, x - R, y, v, 'mono', t, { d: 0.6, css: { width: 2 * R + 'px', textAlign: 'center', fontSize: '46px', lineHeight: '64px', fontWeight: 600 } }); });
    // 中间：这一项的名字，两边各一条线，把左右两个值连起来
    const lab = note(world, W / 2 - 150, y + 14, names[i], t + 0.05, { css: { width: '300px', textAlign: 'center', fontSize: '26px', lineHeight: '36px' }, y: 0 });
    const wl = ZH ? [64, 64, 124][i] : [110, 170, 160][i];
    [[LX + R - 70, W / 2 - wl / 2 - 22], [W / 2 + wl / 2 + 22, RX - R + 70]].forEach(([x1, x2]) => { const l = seg(g, x1, y + 33, x2, y + 33, fg, 2, { opacity: 0.35 }); fromTo(l, t + 0.1, { scaleX: 0, svgOrigin: `${W / 2} ${y + 33}` }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }); });
    sfx('tick', t, { g: 1 });
  });

  // ── B：其余四条 ──
  const yB = 1240, RH = 200;
  cam.go(e4 - 0.75, 0, yB); cam.hold(e4 + 0.5, 0, yB, s.end - e4 - 1.2);
  const gB = gfx(world);
  const jit = D.err.luajit || { cmd: 'luajit bin/luai.lua -a main.lua', out: ['(实测待补)'] };
  const xx = D.exe.xxd_src;
  const warn = D.native.warning, wc = warn.indexOf(' that ');                    // 长行按词折成两行，内容不变
  const rows = [
    ['e4', tr('不支持 LuaJIT', 'No LuaJIT'), [`<span class="ps">$ </span>${esc(jit.cmd)}`, esc(jit.out[0])], 'UnsupportedLuaVersionError', jit.version],
    ['e5', tr('C 模块依赖的系统库，不随包带走', 'System libraries are not collected'), [esc(warn.slice(0, wc)), esc(warn.slice(wc + 1))], 'external shared libraries', 'luai -t main.lua'],
    ['e6', tr('源码以文本嵌入：不加密，不混淆', 'Embedded as text: not encrypted, not obfuscated'), [esc(xx[1]), esc(xx[2])], null, 'build/moon/moon'],
    ['e7', tr('不签名，不生成安装包', 'No code signing, no installer packages'), ['* Signing the executable, or checking it hasn\'t been tampered with', '* Installer packages such as MSI, PKG, DEB or RPM'], null, 'docs/PLATFORMS-NATIVE-LIMITS.adoc · Out of scope'],
  ];
  rows.forEach(([id, txt, ev, key, src], i) => {
    const t = T(id) - 0.1, y = yB + 96 + i * RH;
    const mk_ = seg(gB, M, y + 36, M + 38, y + 36, fg, 5); fromTo(mk_, t, { scaleX: 0, svgOrigin: `${M} ${y + 36}` }, { scaleX: 1, duration: 0.4, ease: 'expo.out' });
    const hd = head(world, M + 66, y, txt, 'd-3', t + 0.05, { d: 0.75, css: { fontSize: ZH ? '56px' : '52px' } });
    sfx('thud', t + 0.1, { g: 0.55 });
    // 证据的出处：跟在这一条后面的小字
    note(world, M + 66 + hd.offsetWidth + 30, y + 26, src, t + 0.5, { cls: 'abs mono dim', css: { fontSize: '22px', lineHeight: '32px' }, y: 0 });
    const els = ev.map((ln, j) => {
      const e = h('div', 'abs mono', world, ln); px(e, M + 68, y + 88 + j * 37); css(e, { fontSize: '25px', lineHeight: '37px' });
      fadeIn(e, t + 0.55 + j * 0.12, { x: -14, d: 0.4 });
      return e;
    });
    if (key) { const tgt = els.map((e) => (e.innerHTML.includes(esc(key)) ? sub(e, key) : null)).find(Boolean); if (tgt) hl(tgt, t + 1.0, 1e9); else console.warn('边界：找不到关键词', key); }
    if (id === 'e6') { const a = sub(els[0], xx[1].slice(51)), b = sub(els[1], xx[2].slice(51)); [a, b].forEach((e) => hl(e, T('e6', { zh: '文本', en: 'text' }) + 0.2, 1e9)); }
  });
  if (!/require/.test(xx[1]) || !/oon\.phase/.test(xx[2])) console.warn('边界：十六进制行里读不到源码');
});
