// 第 4 章：半年后，德国程序员在代码里翻出一个账号 → politically / correct → 连得上服务器就能进 → 七年的版本都带着 → 闭源时没人看见，公开就被翻出来。
scene('door', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 代码里翻出一个账号 ──
  const A = fbSec(pl, true);
  const y01 = fbMini(A, 1380, 16, '二〇〇一年', '1 月');
  fbIn(y01, T('d1', '半年') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('d1', '半年'), { p: 0.5 });
  const dev = fbAbs(A, 60, 300, artHuman({ ...PEOPLE.dev, w: 130 }));
  fbIn(dev, T('d1', '德国') - 0.25, { x: -90 }, { d: 0.35 });
  const de = fbAbs(A, 64, 210, flagDE);
  fbIn(de, T('d1', '德国') - 0.05, { scale: 0.4 }, { d: 0.25, ease: 'back.out(2)' });
  sfx('pop', T('d1', '德国'), { g: 0.6, p: -0.5 });
  const code = fbCard(A, 260, 30, 1120, 470, '', { overflow: 'hidden' });
  fbIn(code, T('d1') + 0.05, { y: 40 }, { d: 0.35 });
  const r = seeded(77), n = 13, hit = 9, lines = [];
  for (let i = 0; i < n; i++) {
    const b = h('div', 'bar-l', code); css(b, { left: 50 + (r() * 3 | 0) * 40 + 'px', top: 28 + i * 33 + 'px', width: 300 + r() * 600 + 'px', background: ['#cfcdc7', '#cfcdc7', '#b9c9df', '#e6c7a8'][r() * 4 | 0] });
    lines.push(b);
  }
  const scan = h('div', 'abs', code); css(scan, { left: '0px', top: '0px', width: '1120px', height: '30px', background: 'rgba(33,86,165,.22)' });
  const t0 = T('d1', '代码') - 0.1, t1 = T('d1', '账号') - 0.15;
  F((t) => { const k = clamp((t - t0) / (t1 - t0)); scan.style.opacity = t >= t0 && t < t1 + 0.1 ? 1 : 0; scan.style.transform = `translateY(${f1((hit * 33 + 22) * k)}px)`; });
  const hitBar = h('div', 'bar-l', code); css(hitBar, { left: lines[hit].style.left, top: lines[hit].style.top, width: lines[hit].style.width, background: '#bf0000' });
  wipe(hitBar, t1, { dir: 'l', d: 0.16 });
  sfx('error', t1 + 0.05, { g: 0.7 });
  const ic = h('div', 'adm-ic', code, '!'); css(ic, { left: parseFloat(lines[hit].style.left) + parseFloat(lines[hit].style.width) + 26 + 'px', top: 28 + hit * 33 - 38 + 'px' });
  slam(ic, t1 + 0.1, { from: 1.6, d: 0.3 });
  // 两张卡从红行里弹出来，读到那个词时字砸进去
  const hitY = 30 + 28 + hit * 33;
  const mk = (label, word, x, y, cue, spoken) => {
    const pad = fbCard(A, x, y, 0, 0, `<div class="by" style="font-size:38px">${label}</div><div class="login" style="margin-top:10px;text-shadow:3px 4px 0 #F68A21">${word}</div>`, { padding: '22px 50px 30px' });
    init(pad, { autoAlpha: 0, x: 420 - x, y: hitY - y - 30, scale: 0.1, rotationZ: -6, transformOrigin: '0% 50%' });
    to(pad, T(cue) - 0.02, { autoAlpha: 1, z: 120, x: 0, y: 0, scale: 1, rotationZ: 0, duration: 0.3, ease: 'back.out(1.5)' });
    sfx('pop', T(cue), { g: 0.7 });
    const w = pad.querySelector('.login');
    init(w, { autoAlpha: 0, y: -40, scale: 1.3, transformOrigin: '0% 50%' });
    to(w, spoken - 0.05, { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power4.out' });
    sfx('thud', spoken);
    return pad;
  };
  // MiniMax 把逗号后第一个词的起点标早约 0.4 秒，这里取按音频能量核对过的时刻
  const sp1 = T('d2', 'ically', -0.02), sp2 = T('d3', '。。', -0.04);
  mk('用户名', 'politically', 300, 250, 'd2', sp1);
  mk('密码', 'correct', 760, 500, 'd3', sp2);
  to(code, T('d3') - 0.1, { autoAlpha: 0.25, duration: 0.3 });

  // ── B 政治正确：连得上服务器、知道这两个词就能进 ──
  const B = fbSec(pl);
  fbScroll(A, B, T('d4') - 0.4);
  const gl = fbAbs(B, 70, 20, '<span style="font:800 56px Mono;color:#1c1c1c">politically correct</span><span style="font:700 52px Sans SC;color:#6f6f6f;margin-left:30px">＝ 政治正确</span>');
  fbIn(gl, T('d4') - 0.1, { y: -20 }, { d: 0.3 });
  const ppl = fbAbs(B, 80, 150, artCrowd(3, 104, -16, 6));
  fbIn(ppl, T('d4', '只要') - 0.1, { x: -120 }, { d: 0.35 });
  const srv = fbAbs(B, 860, 110, ART.server);
  init(srv, { scale: 1.25, transformOrigin: '0 0' });
  fbIn(srv, T('d4', '服务器') - 0.2, { y: -80 }, { d: 0.4, ease: 'bounce.out', end: { scale: 1.25 } });
  sfx('thud', T('d4', '服务器') + 0.1, { g: 0.7 });
  const net = fbAbs(B, 370, 268, '<svg width="490" height="20" viewBox="0 0 490 20"><path d="M0 10 H490" stroke="#2156a5" stroke-width="6" stroke-dasharray="16 10"/></svg>');
  fbIn(net, T('d4', '连') - 0.05, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.35 });
  const lock = fbAbs(B, 560, 140, ART.lock);
  fbIn(lock, T('d5', '谁') - 0.1, { y: -40 }, { d: 0.3 });
  const key = fbCard(B, 96, 384, 0, 0, '<div style="font:700 36px Mono;color:#1c1c1c;line-height:1.3">politically<br>correct</div>', { padding: '14px 26px' });
  fbIn(key, T('d5', '这两') - 0.1, { y: 30, rotationZ: -4 }, { d: 0.3, ease: 'back.out(1.6)' });
  const tOpen = T('d5', '就能') - 0.05;
  to(lock.querySelector('[data-shackle]'), tOpen, { y: -26, duration: 0.18, ease: 'power4.out' });
  sfx('thud', tOpen, { g: 0.8, p: 0.5 });
  to(ppl, tOpen + 0.1, { x: 640, autoAlpha: 0, duration: 0.6, ease: 'power2.in' });
  to(key, tOpen + 0.1, { x: 640, autoAlpha: 0, duration: 0.6, ease: 'power2.in' });
  sfx('whoosh', tOpen + 0.1, { g: 0.4, p: 0.4 });
  // 过去七年发布的版本，全带着它
  const tV = T('d6', '七年') - 0.1;
  const vs = ['4.x', '5.x', '6.01'].map((v, i) => {
    const e = fbCard(B, 170 + i * 420, 470, 340, 140, `<div class="nm" style="line-height:140px;font-size:64px">${v}</div>`);
    fbIn(e, tV + i * 0.3, { y: 90, z: 60 }, { ease: 'back.out(1.4)', d: 0.35 });
    sfx('pop', tV + i * 0.3, { g: 0.6, p: -0.4 + i * 0.4 });
    const lab = e.querySelector('.nm');
    to(lab, T('d7', '闭源') + 0.1, { autoAlpha: 0, duration: 0.02 }); to(lab, T('d7', '公开') - 0.03, { autoAlpha: 1, duration: 0.02 });
    const dot = fbAbs(e, 280, 22, '', 'r-dot');
    fbIn(dot, T('d6', '全带') - 0.05 + i * 0.12, { scale: 2.4 }, { d: 0.15 });
    sfx('tick', T('d6', '全带') + i * 0.12, { g: 0.8 });
    return e;
  });
  const span = fbAbs(B, 170, 640, '<svg width="1180" height="40" viewBox="0 0 1180 40"><path d="M4 4 V20 H1176 V4" fill="none" stroke="#6f6f6f" stroke-width="4"/></svg><div class="lab-s" style="text-align:center;width:1180px;margin-top:4px">过去七年</div>');
  fbIn(span, tV + 0.2, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.5 });
  // 闭源时盖着，公开时揭开，然后被翻出来
  const cover = fbCard(B, 150, 450, 1240, 180, '<div class="cover-t">闭 源</div>', { background: '#2a2a2a' });
  init(cover, { autoAlpha: 0, x: -1300, z: 140 });
  to(cover, T('d7', '闭源') - 0.2, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' });
  sfx('whoosh', T('d7', '闭源') - 0.2, { g: 0.5 });
  to(cover, T('d7', '公开') - 0.05, { y: -520, rotationX: -40, autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
  sfx('thud', T('d7', '公开') + 0.1);
  const mag = fbAbs(B, 0, 0, ART.magnifier);
  const m0 = T('d7', '翻') - 0.25, mE = Tend('d7') + 0.3;
  init(mag, { autoAlpha: 0, z: 200 });
  to(mag, m0, { autoAlpha: 1, duration: 0.12 }); to(mag, mE, { autoAlpha: 0, duration: 0.2 });
  F((t) => { const k = clamp((t - m0) / (mE - m0)); mag.style.left = f1(260 + k * 900) + 'px'; mag.style.top = '400px'; });
  vs.forEach((e, i) => { const d = e.querySelector('.r-dot'); to(d, m0 + 0.2 + i * 0.25, { scale: 1.6, duration: 0.12, yoyo: true, repeat: 1 }); });
  sfx('tick', m0 + 0.2, { g: 0.6 }); sfx('tick', m0 + 0.45, { g: 0.6 }); sfx('tick', m0 + 0.7, { g: 0.6 });
});
