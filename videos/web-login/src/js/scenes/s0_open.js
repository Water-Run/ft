// 开场：一次登录 → 之后它再也没问过密码 → 服务器怎么知道你是你 → 片名卡 → 认证、会话、授权三件事。
// 站 A：登录页；站 B：之后的请求记录；站 C：你、请求、服务器；站 D：三件事。片名卡盖在最上层（o3b 到 o4 之前，约 5 秒）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root); css(world, { width: '8000px' });
  const t0 = s.start, isZh = zh();
  F((t) => { if (t < t0 + 0.02) Object.assign(cam.st, { x: 960, y: 484, z: 1 }); });   // 第 0 帧镜头就在起点（见 docs/reference/pitfalls.md）
  const cam = makeCamera(world, 1920, VH);

  // ── 站 A：登录页 ──
  const you = shape(world, 'tri', -140, 430, 640, C.yel, { name: 'you', bleed: true });
  slide(you, t0 + 0.05, { x: -260, y: 120, d: 0.42, ease: STEP(0.42) }); sfx('thud', t0 + 0.4, { g: 0.6, p: -0.6 });
  const url = mono(world, '', 700, 176, 34, { color: C.dim });
  typeText(url, 'https://shop.example/login', t0 + 0.15, 40, { cursor: false, sfxGain: 0.4 });
  const labA = word(world, tr('账号', 'Account'), 700, 280, 30, { color: C.dim, w: 700 });
  const lineA = blk(world, 'bg-ink', 700, 408, 820, 14);
  const labP = word(world, tr('密码', 'Password'), 700, 470, 30, { color: C.dim, w: 700 });
  const lineP = blk(world, 'bg-ink', 700, 598, 820, 14);
  [labA, labP].forEach((e, i) => wipe(e, t0 + 0.25 + i * 0.1, { dir: 'l', d: 0.25 }));
  [lineA, lineP].forEach((e, i) => wipe(e, t0 + 0.3 + i * 0.1, { dir: 'l', d: 0.33, ease: STEP(0.33) }));
  const acct = mono(world, '', 700, 318, 66, { w: 800 });
  const tAcct = Math.max(t0 + 0.6, T('o1', { zh: '账号', en: 'account' }) - 0.1);
  typeText(acct, 'alice', tAcct, 14, { cursor: false });
  const tPw = Math.max(tAcct + 0.45, T('o1', { zh: '密码', en: 'password' }) - 0.1);
  const dots = [];
  for (let i = 0; i < 10; i++) { const d = shape(world, 'circle', 704 + i * 62, 530, 44, C.red, { name: 'password-char' }); appear(d, tPw + i * 1 / 12); dots.push(d); if (i % 2 === 0) sfx('key', tPw + i / 12, { g: 0.7 }); }
  const btn = blk(world, 'bg-ink', 700, 668, 300, 104); btn.dataset.name = 'login-button';
  const btnT = word(btn, tr('登录', 'Log in'), 0, 0, 48, { color: C.paper, w: 800 }); css(btnT, { width: '300px', height: '104px', lineHeight: '104px', textAlign: 'center' });
  wipe(btn, t0 + 0.45, { dir: 'b', d: 0.25 });
  const tPress = Math.max(tPw + 10 / 12 + 0.1, T('o1', { zh: '登录', en: 'log in' }) - 0.05);
  fromTo(btn, tPress, { y: 0 }, { keyframes: [{ y: 10, duration: 1 / 12, ease: 'steps(1)' }, { y: 0, duration: 2 / 12, ease: 'steps(2)' }], immediateRender: false });
  sfx('thud', tPress, { g: 0.8 });

  // ── 站 B：之后的请求记录。只有第一行要过密码 ──
  const BX = 1920;
  const head1 = word(world, tr('之后的请求', 'Requests after login'), BX + 200, 170, 30, { color: C.dim, w: 700 });
  const head2 = word(world, tr('要密码吗', 'Password?'), BX + 1300, 170, 30, { color: C.dim, w: 700 });
  const reqs = ['POST /login', 'GET /orders', 'GET /orders/1024', 'PUT /address'];
  const tB = Tend('o1') + 0.05, tNo = T('o2', { zh: '再也', en: 'never' });
  const tReq = [tB + 0.2, Q(T('o2', { zh: '订单', en: 'orders' })) - 0.1, Q(T('o2', { zh: '订单', en: 'orders' })) + 0.4, Q(T('o2', { zh: '地址', en: 'address' })) - 0.1];
  [head1, head2].forEach((e, i) => wipe(e, tB + i * 0.1, { dir: 'l', d: 0.3 }));
  reqs.forEach((r, i) => {
    const y = 250 + i * 150;
    const n = mono(world, '0' + (i + 1), BX + 200, y, 40, { color: C.dim });
    const e = mono(world, r.replace(' ', '&nbsp;'), BX + 300, y, 52, { w: 800 });
    const rule = blk(world, 'bg-ink', BX + 200, y + 96, 1380, 4);
    slide(e, tReq[i], { x: -60, d: 0.25, ease: STEP(0.25) }); appear(n, tReq[i]); wipe(rule, tReq[i], { dir: 'l', d: 0.25 });
    sfx('tick', tReq[i], { g: 0.6, p: -0.2 + i * 0.15 });
    if (i === 0) { for (let k = 0; k < 3; k++) appear(shape(world, 'circle', BX + 1300 + k * 52, y + 10, 40, C.red, { name: 'password-char' }), tReq[i] + 0.1 + k / 12); }
    else {
      const ring = h('div', 'abs', world); px(ring, BX + 1300, y + 10, 40, 40); css(ring, { border: `6px solid ${C.ink}`, borderRadius: '50%', boxSizing: 'border-box' }); ring.dataset.name = 'no-password';
      const tt = Math.max(tReq[i] + 0.15, tNo + (i - 1) * 0.17); appear(ring, tt); sfx('pop', tt, { g: 0.45, p: 0.4 });
    }
  });

  // ── 站 C：你、请求、服务器 ──
  const CX = 3840, tC = Tend('o2') + 0.05;
  const you2 = shape(world, 'tri', CX + 140, 360, 360, C.yel, { name: 'you' });
  const srv = frame(world, CX + 1200, 200, 520, 520, { bw: 18, label: 'shop.example' });
  const qm = word(srv.el, '?', 140, 40, 360, { w: 900 }); qm.dataset.name = 'question';
  slide(you2, tC + 0.1, { x: -200, d: 0.33, ease: STEP(0.33) });
  fromTo(srv.el, tC + 0.25, { autoAlpha: 0, y: -260 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); appear(srv.lab, tC + 0.5);
  sfx('thud', tC + 0.55, { g: 0.8, p: 0.4 });
  const arrows = [0, 1, 2].map((k) => { const a = blk(world, 'bh-arrow', CX + 560, 470 + (k - 1) * 90, 540, 12); a.dataset.name = 'request'; return a; });
  arrows.forEach((a, k) => { fromTo(a, tC + 0.5 + k * 0.12, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0% 50%', duration: 0.25, ease: STEP(0.25) }); sfx('tick', tC + 0.5 + k * 0.12, { g: 0.4 }); });
  const youL = word(world, tr('你', 'You'), CX + 140, 760, 64, { w: 900 }), srvL = word(world, tr('服务器', 'Server'), CX + 1200, 760, 64, { w: 900 });
  wipe(youL, tC + 0.3, { dir: 'l', d: 0.25 }); wipe(srvL, tC + 0.6, { dir: 'l', d: 0.25 });
  slam(qm, Q(T('o3', { zh: '什么样', en: 'work' })) - 0.1, { from: 1.4, d: 0.25 }); sfx('pop', Q(T('o3', { zh: '什么样', en: 'work' })) - 0.1, { g: 0.7, p: 0.4 });

  // ── 片名卡：盖在最上层，o3b 开始到 o4 之前 ──
  const tT = T('o3b') - 0.05, tOut = T('o4') - 0.35;
  const card = blk(root, 'bg-paper', 0, 0, 1920, VH); card.dataset.name = 'title-card';
  during(card, tT, tOut + 0.34);
  const sh = [
    [shape(card, 'circle', 90, 150, 540, C.red), { x: -500 }],
    [shape(card, 'tri', 520, 120, 420, C.yel), { y: -500 }],
    [shape(card, 'square', 470, 470, 360, C.blue), { y: 500 }],
  ];
  sh.forEach(([e, from], i) => { slide(e, tT + i * 0.1, { ...from, d: 0.33, ease: STEP(0.33) }); sfx('tick', tT + 0.3 + i * 0.1, { g: 0.6, p: -0.6 }); });
  const fr = frame(card, 560, 250, 420, 420, { bw: 26, name: 'server' });
  fromTo(fr.el, tT + 0.4, { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'steps(3)' });
  sfx('thud', tT + 0.62, { g: 0.9 });
  const n200 = mono(card, String(TOTAL), 1060, 120, 170, { w: 800 }); const sec = word(card, tr('秒', 's'), 1060 + n200.offsetWidth + 16, 200, 80, { w: 900 });
  const tl1 = word(card, tr('了解 Web 登录机制', 'Web Login'), 1064, 330, isZh ? 84 : 150, { w: 900 });
  const tl2 = word(card, tr('怎么验证<br>你是你', 'How a site checks<br>that you are you'), 1064, isZh ? 470 : 520, isZh ? 132 : 72, { w: 900, lh: '1.04' });
  slam(n200, tT + 0.55, { from: 1.3, d: 0.3 }); wipe(sec, tT + 0.7, { dir: 'l', d: 0.25 });
  wipe(tl1, tT + 0.8, { dir: 'l', d: 0.3 }); slam(tl2, tT + 1.0, { from: 1.2, d: 0.3 }); sfx('thud', tT + 1.0, { g: 0.8, p: 0.4 });
  fromTo(card, tT + 1.0, { scale: 1 }, { scale: 1.045, transformOrigin: '30% 50%', duration: Math.max(0.5, tOut - tT - 1.0), ease: 'none', immediateRender: false });   // 片名停留时极慢地推近，不至于静止
  to(card, tOut, { y: -VH, duration: 0.33, ease: STEP(0.33) });

  // ── 站 D：三件事 ──
  const DX = 5760;
  const JOBS = [
    ['o4', { zh: '认证', en: 'authentication' }, '01', tr('认证', 'Authentication'), tr('Authentication', '认证'), tr('第一次认出你', 'Recognizing you the first time'), C.red],
    ['o5', { zh: '会话', en: 'session' }, '02', tr('会话', 'Session'), tr('Session', '会话'), tr('之后每个请求都认得你', 'Knowing you on every later request'), C.blue],
    ['o6', { zh: '授权', en: 'authorization' }, '03', tr('授权', 'Authorization'), tr('Authorization', '授权'), tr('你能做什么', 'What you may do'), C.yel],
  ];
  JOBS.forEach(([cid, kw, n, w1, w2, ex, col], i) => {
    const y = 150 + i * 255;
    const num = mono(world, n, DX + 160, y + 18, 96, { w: 800 });
    const big = word(world, w1, DX + 400, y, isZh ? 132 : 104, { w: 900 });
    const alt = isZh ? word(world, w2, DX + 400 + big.offsetWidth + 36, y + 70, 36, { color: C.dim, w: 700 }) : null;
    const exp = word(world, ex, DX + 404, y + (isZh ? 150 : 126), 38, { color: C.ink, w: 500 });
    const rule = blk(world, '', DX + 160, y + 212, 1460, 14); rule.style.background = col;
    const ts = T(cid) - 0.05, tk = Q(T(cid, kw)) - 0.1;
    appear(num, ts); wipe(exp, ts + 0.05, { dir: 'l', d: 0.3 }); wipe(rule, ts, { dir: 'l', d: 0.42, ease: STEP(0.42) });
    slam(big, tk, { from: 1.35, d: 0.25 }); if (alt) wipe(alt, tk + 0.15, { dir: 'l', d: 0.25 });
    sfx('tick', ts, { g: 0.5 }); sfx('thud', tk, { g: 0.8, p: -0.2 + i * 0.2 });
  });

  // ── 镜头 ──
  const tA2 = Tend('o1') - 0.05;
  cam.track(t0, { x: 960, y: 484, z: 1 }, [
    [t0 + 0.02, { z: 1.04, x: 990 }, tA2 - t0 - 0.05, { ease: 'none', sfx: false }],
    [tA2, { x: BX + 960, z: 1 }, 0.9, { sfx: false }],
    [tA2 + 0.95, { x: BX + 990, z: 1.03 }, Tend('o2') - tA2 - 1.0, { ease: 'none', sfx: false }],
    [Tend('o2') - 0.05, { x: CX + 960, z: 1 }, 0.9, { sfx: false }],
    [Tend('o2') + 0.9, { x: CX + 1000, z: 1.04 }, Math.max(0.5, tT - Tend('o2') - 0.95), { ease: 'none', sfx: false }],
    [tT + 0.3, { x: DX + 960, y: 484, z: 1 }, 0.05, { ease: 'none', sfx: false }],
    [tOut + 0.4, { x: DX + 990, z: 1.03 }, Math.max(0.5, s.end - tOut - 0.5), { ease: 'none', sfx: false }],
  ]);
});
