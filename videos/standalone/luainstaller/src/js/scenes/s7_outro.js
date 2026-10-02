// 片尾：每个产物随身带着什么 → GitHub → 一路陪在角上的小月亮长成满屏的那一轮，标题回到开场的位置（配色反过来）→ 信息
// 文件名取自实测的 find build/moon 输出
scene('outro', ({ root, s }) => {
  const st = stageOf(root, 'paper'); const { world, fg, bg } = st;
  const D = window.DATA, g = gfx(world);
  const t1 = T('f1'), t2 = T('f2'), t3 = T('f3'), tT = T('fT');

  // ── 一：产物里随身带着的东西 ──
  const found = D.cmd['find build/moon'].map((p) => p.replace(/^moon\//, ''));
  const rows = [
    ['.luai/licenses/LGPL-3.0-or-later.txt', 0], ['.luai/licenses/GPL-3.0-or-later.txt', 0], ['.luai/licenses/Lua-MIT.txt', 0], ['THIRD_PARTY_NOTICES.md', 0],
    ['.luai/build/launcher.c', 1], ['.luai/build/RELINKING.adoc', 2],
  ];
  rows.forEach(([p]) => { if (!found.includes(p)) console.warn('片尾：实测的目录里没有', p); });
  const roles = [tr('许可证文本', 'license texts'), tr('生成它的 C 源码', 'the C source it was built from'), tr('重新链接的说明', 'how to relink it')];
  const RY = 212, RH = 72, tL = T('f1', { zh: '许可证', en: 'license' }) - 0.2, tC = T('f1', { zh: '生成', en: 'C source' }) - 0.2;
  const first = [];
  first.push(note(world, M, 150, 'build/moon/', t1 - 0.1, { cls: 'abs mono dim', css: { fontSize: '30px', lineHeight: '40px' } }));
  rows.forEach(([p, role], i) => {
    const y = RY + i * RH, tt = (role === 0 ? Math.min(t1 + 0.1 + i * 0.1, tL + i * 0.1) : tC + (i - 4) * 0.25);
    const d = disc(g, M + 12, y + 30, 10, fg); popIn(d, tt, M + 12, y + 30, { d: 0.4 });
    const e = note(world, M + 52, y, `<span>${esc(p)}</span>`, tt + 0.03, { cls: 'abs mono', css: { fontSize: '42px', lineHeight: '58px' }, x: -16, y: 0 });
    sfx('tick', tt, { g: 0.9 });
    first.push(d, e);
    if (role === 0) hl(e.firstChild, tL, tC); else if (role === 1) hl(e.firstChild, tC, t2 - 0.2);
    if (i === 0 || i === 4 || i === 5) first.push(note(world, M + 1100, y + 10, roles[role], (role === 0 ? tL : tt) + 0.2, { css: { fontSize: '32px', lineHeight: '42px' }, y: 0 }));
  });
  // 许可证那四行右边的括线
  const bx = M + 1068, br = seg(g, bx, RY + 10, bx, RY + 4 * RH - 22, fg, 2, { opacity: 0.4 }); fromTo(br, tL, { scaleY: 0, svgOrigin: `${bx} ${RY + 12}` }, { scaleY: 1, duration: 0.5, ease: 'expo.out' }); first.push(br);
  // ── 二：GitHub ──
  const gl = ruleIn(world, M, 706, W - 2 * M, t2 - 0.25, { d: 0.9 });
  const gh = head(world, M, 740, 'github.com/Water-Run/luainstaller', 'd-3 mono', t2 - 0.1, { d: 0.8, css: { fontSize: '64px', fontWeight: 600, letterSpacing: '-0.02em' } });
  const gn = note(world, M + 2, 836, tr('源码 · 文档', 'source · documentation'), t2 + 0.3, { css: { fontSize: '30px' } });
  sfx('thud', t2, { g: 0.6 });

  // ── 三：小月亮长成大月亮，标题回来 ──
  const tM = t3 - 0.5, dM = 1.5;
  first.forEach((e) => tl.to(e, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, tM - 0.05));
  sink(gh, tM - 0.05, { d: 0.34 }); fadeOut(gn, tM - 0.05, { d: 0.25 });
  tl.to(gl, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.36, ease: 'expo.in' }, tM - 0.05);
  const moon = disc(g, 0, 0, 1, fg), orb = orbit(g, 0, 0, 10, 'rgba(0,0,128,.5)'), sat = disc(g, 0, 0, 1, fg);
  popIn(moon, s.start + 1.0, EMB.x, EMB.y, { d: 0.5, ease: 'back.out(2.2)' });
  [orb, sat].forEach((e) => fromTo(e, s.start + 1.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }));
  const io = gsap.parseEase('expo.inOut');
  const title = invText(world, M - 8, 470, 'luainstaller', 'd-hero', PAPER);
  title.rise(tM + 0.75, { d: 1.0 });
  const rl = ruleIn(world, M, 716, 1680, tM + 0.85, { d: 1.0 });
  head(world, M, 742, tr('把 Lua 脚本，交给没有 Lua 的人', 'Hand your Lua script to someone without Lua.'), 'd-3', t3 + 0.35, { d: 0.9, css: { fontWeight: ZH ? 700 : 600 } });
  sfx('riser', tM - 0.2, { g: 0.6 }); sfx('thud', tM + 0.85, { g: 1 }); sfx('chime', tM + 1.3, { g: 0.6 });
  F((t) => {
    const k = io(clamp((t - tM) / dM)), d = Math.max(0, t - tM - dM);
    const x = lerp(EMB.x, 1466, k) - d * 5, y = lerp(EMB.y, 322, k) + d * 1.6, r = lerp(EMB.r, 318, k), ro = lerp(EMB.orbit, 318 + 118, k), rs = lerp(EMB.moon, 22, k);
    const a = -1.2 + t * 0.42 * (1 - k) + (3.4 + (t - tM) * 0.16) * k;
    moon.setAttribute('cx', x.toFixed(2)); moon.setAttribute('cy', y.toFixed(2)); moon.setAttribute('r', r.toFixed(2));
    orb.setAttribute('cx', x.toFixed(2)); orb.setAttribute('cy', y.toFixed(2)); orb.setAttribute('r', ro.toFixed(2));
    sat.setAttribute('cx', (x + ro * Math.cos(a)).toFixed(2)); sat.setAttribute('cy', (y + ro * Math.sin(a)).toFixed(2)); sat.setAttribute('r', rs.toFixed(2));
    title.clip(x, y, r);
  });

  // ── 四：信息 ──
  const IY = 860, tI = tT + 0.15;
  const info = [
    [M, 0, `<span class="dim">$ </span>luarocks install luainstaller`, 'mono'],
    [M, 1, `github.com/Water-Run/luainstaller`, 'mono'],
    [M + 900, 0, `${tr('作者', 'by')} WaterRun <span class="dim">· LGPL-3.0-or-later · ${D.install.version[0].replace(/^luai /, '')}</span>`, ''],
    [M + 900, 1, tr('本介绍视频由 Opus 5.5 制作', 'This video was made by Opus 5.5'), ''],
  ];
  info.forEach(([x, r, html, cls], i) => note(world, x, IY + r * 62, html, tI + i * 0.18, { cls: 'abs ' + (cls || 't-body'), css: { fontSize: cls ? '34px' : '34px', lineHeight: '50px', fontWeight: cls ? 500 : 600 }, y: 10 }));
  sfx('pop', tI, { g: 0.5 });
});
