// 开场：一份写完的脚本 → 另一台机器上跑不起来 → 还缺模块 → 收成一个圆（可执行文件）→ 圆展开成藏蓝底，出标题
// 标题：一轮纸白色的「月亮」从右下升起，字压在它上面的部分反成藏蓝。全片只有这两种颜色。
// 画面上的源码与回显取自 data.js（research/lab 的实测原文）。
// 标题里月亮的位置：下一场（01）的入场光圈从这里展开，所以写成两场共用的函数
function titleMoon(t, tT) {
  const k = ease.out5(clamp((t - tT - 0.45) / 1.5)), d = Math.max(0, t - tT - 0.45);
  return { x: lerp(1700, 1470, k) - d * 16, y: lerp(1560, 318, k) + d * 5, r: 318 };
}
scene('open', ({ root, s }) => {
  const { world, cam, hud } = stageOf(root, 'paper');
  const D = window.DATA;

  // ── 脚本 ──
  const head_ = head(world, M, 118, 'main.lua', 'd-2 mono', 0.2, { d: 0.9, css: { fontWeight: 700, letterSpacing: '-0.02em' } });
  const code = codeBlock(world, D.src.main, M, 296, 37, { marks: [['require("moon.phase")', 'r1'], ['require("moon.names")', 'r2']] });
  code.cascade(0.32);
  cam.cut(0, { x: 640, y: 372, z: 1.82 });
  cam.to(0.05, { x: 960, y: 540, z: 1 }, { d: T('o2') - 0.5, ease: 'power2.out', sfx: false });
  sfx('thud', 0.12, { g: 0.7 });

  // ── 另一台机器：没有 Lua ──
  const X2 = 2260;
  const head2 = head(world, X2, 118, tr('另一台机器', 'Another machine'), 'd-2', T('o2') + 0.15);
  const term = makeTerm(world, X2, 330, 58, { lh: 1.6 });
  const tA = T('o2');
  cam.to(tA - 0.45, { x: X2 + 840, y: 540, z: 1 }, { d: 1.25 });
  const e1 = term.cmd(tA + 0.75, 'lua main.lua', { cps: 15 });
  const tErr = Math.max(e1, T('o2', { zh: '得先', en: 'needs' }));
  const err = term.out(tErr, [span(D.clean.lua_main[0], 'command not found')], { html: true, sfx: 'error' });
  hl(err[0].querySelector('[data-k]'), tErr + 0.45);

  // ── 还缺模块 ──
  const tB = T('o3');
  const mods = ['moon/phase.lua', 'moon/julian.lua', 'moon/names.lua'];
  const g = gfx(world);
  const row = mods.map((name, i) => {
    const x = M + i * 500, y = 930;
    const d = disc(g, x + 17, y + 27, 17, NAVY);
    const lb = h('div', 'abs mono', world, name); px(lb, x + 52, y); css(lb, { fontSize: '37px', lineHeight: '54px' });
    const tt = T('o3', { zh: '每一个', en: 'every' }) - 0.25 + i * 0.16;
    popIn(d, tt, x + 17, y + 27, { d: 0.5, ease: 'back.out(2.4)' });
    fadeIn(lb, tt + 0.05, { x: -18, d: 0.45 }); sfx('pop', tt, { g: 0.7, p: -0.4 + i * 0.4 });
    return { d, lb };
  });
  cam.to(tB - 0.5, { x: 960, y: 610, z: 1 }, { d: 1.25 });
  const tReq = T('o3', 'require') - 0.1, tGo = T('o4', { zh: '做成', en: 'turn' }) - 0.2;
  hl(code.m('r1'), tReq, tGo + 0.2); hl(code.m('r2'), tReq + 0.16, tGo + 0.2);
  sfx('blip', tReq); sfx('blip', tReq + 0.16, { g: 0.7 });

  // ── 全部收进一个圆 ──
  const tC = T('o4'), CX = 1960, CY = 600;
  cam.to(tC - 0.35, { x: CX, y: CY, z: 0.49 }, { d: 1.05, ease: 'power3.inOut' });
  const blob = disc(g, CX, CY, 190, NAVY);
  popIn(blob, tGo + 0.25, CX, CY, { d: 0.75, ease: 'back.out(1.7)' });
  const suck = (els, cx, cy, dly) => els.forEach((e) => tl.to(e, { x: CX - cx, y: CY - cy, scale: 0.05, autoAlpha: 0, duration: 0.7, ease: 'power3.in', transformOrigin: '50% 50%' }, tGo + dly));
  suck([head_, code], 700, 430, 0);
  suck(row.map((r) => r.lb).concat(row.map((r) => r.d)), 800, 950, 0.07);
  suck([head2, term.el], X2 + 500, 380, 0.14);
  impact(g, CX, CY, 190, 420, tGo + 0.72, NAVY, { w: 5 });
  sfx('riser', tGo - 0.5, { g: 0.7 }); sfx('thud', tGo + 0.62, { g: 1 });
  cam.to(tGo + 0.5, { x: CX, y: CY, z: 1.15 }, { d: 1.5, ease: 'power2.inOut', sfx: false });
  const name = h('div', 'abs mono', world, 'moon'); px(name, CX - 190, CY - 44, 380); css(name, { fontSize: '72px', lineHeight: '88px', textAlign: 'center', color: PAPER, fontWeight: 600 });
  fadeIn(name, tGo + 0.95, { d: 0.4 });

  // ── 圆展开成底色，出标题 ──
  const tT = T('o5') - 0.2;
  fadeOut(name, tT, { d: 0.2 });
  tl.to(blob, { scale: 14, duration: 0.95, ease: 'expo.inOut' }, tT + 0.05);
  sfx('riser', tT - 0.5, { g: 0.6 }); sfx('thud', tT + 0.5, { g: 1 }); sfx('chime', tT + 1.0, { g: 0.6 });
  hud.classList.add('on-navy'); hud.style.background = 'none';
  const g2 = gfx(hud);
  const moon = disc(g2, 0, 0, 10, PAPER), orb = orbit(g2, 0, 0, 10, 'rgba(243,242,237,.55)'), sat = disc(g2, 0, 0, 22, PAPER);
  [moon, orb, sat].forEach((e) => fromTo(e, tT + 0.5, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }));
  const title = invText(hud, M - 8, 470, 'luainstaller', 'd-hero', NAVY);
  const sub = head(hud, M, 742, tr('把 Lua 脚本，变成可执行文件', 'Lua scripts, as executables.'), 'd-3', tT + 1.0, { d: 0.9, css: { fontWeight: ZH ? 700 : 600 } });
  const rl = ruleIn(hud, M, 716, 1680, tT + 0.75, { d: 1.0 });
  title.rise(tT + 0.65, { d: 1.0 });
  F((t) => {
    const m = titleMoon(t, tT), a = 3.5 + (t - tT) * 0.16;
    moon.setAttribute('cx', m.x.toFixed(2)); moon.setAttribute('cy', m.y.toFixed(2)); moon.setAttribute('r', m.r);
    orb.setAttribute('cx', m.x.toFixed(2)); orb.setAttribute('cy', m.y.toFixed(2)); orb.setAttribute('r', m.r + 118);
    sat.setAttribute('cx', (m.x + (m.r + 118) * Math.cos(a)).toFixed(2)); sat.setAttribute('cy', (m.y + (m.r + 118) * Math.sin(a)).toFixed(2));
    title.clip(m.x, m.y, m.r);
  });
  window.TITLE_T = tT;
  // 让位给第一章：字先退场，月亮留给下一场的光圈
  const tX = s.end - 0.34;
  title.sink(tX, { d: 0.36 }); sink(sub, tX + 0.04, { d: 0.34 });
  tl.to(rl, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.36, ease: 'expo.in' }, tX);
  tl.to([orb, sat], { autoAlpha: 0, duration: 0.25 }, tX + 0.05);
});
