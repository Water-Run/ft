// 第三方登录：「用另一个平台的账号登录」，检查你的是那个平台 → 在平台登录、点同意，带着一次性码回来 → 网站拿码去换票 → 这套流程叫 OAuth 2.0 →
// 它本是授权：Access Token 只说能做什么 → OIDC 在上面加一层，给一张签了名的 ID Token，写明你是谁、发给谁 → 代价：信任集中。
// 站 A：两只黑框 shop.example 与 id.example（a1–a3b）；站 B：授权与身份两层、ID Token（a4–a6）；站 C：平台失守，网站一起倒（a7）。
// 授权码与令牌取 RFC 6749 §4.1.2、§4.1.4 的示例原值（DATA.code、DATA.accessToken、DATA.refreshToken）；ID Token 的内容来自实算（DATA.idt）。
scene('oauth', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '6200px', height: '1400px' });
  const cam = makeCamera(world, 1920, VH);
  const isZh = zh();
  const KW = (id, zhw, enw) => T(id, { zh: zhw, en: enw });
  const fade = (els, t) => els.forEach((e) => to(e, t, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));

  // ── 站 A：网站与平台 ──
  const shop = frame(world, 140, 260, 460, 520, { bw: 18, label: 'shop.example' });
  const plat = frame(world, 1320, 260, 460, 520, { bw: 18, label: 'id.example' });
  const shopL = word(world, tr('网站', 'Site'), 140, 800, 44, { w: 900 }), platL = word(world, tr('另一个平台', 'Platform'), 1320, 800, 44, { w: 900 });
  const btn = blk(world, 'bg-ink', 180, 330, 380, 90); btn.dataset.name = 'login-with-platform';
  const btnT = word(btn, tr('用 id.example 登录', 'Sign in with id.example'), 0, 0, isZh ? 36 : 30, { color: C.paper, w: 800 }); css(btnT, { width: '380px', height: '90px', lineHeight: '90px', textAlign: 'center' });
  const you = shape(world, 'tri', 300, 520, 200, C.yel, { name: 'you' });
  const tA = c0 + 0.05;
  [shop.el, shop.lab, plat.el, plat.lab, shopL, platL].forEach((e, i) => appear(e, tA + (i % 2) * 0.1)); sfx('thud', tA + 0.1, { g: 0.6 });
  wipe(btn, Math.max(tA + 0.2, Q(KW('a1', '另一个平台', 'another platform')) - 0.2), { dir: 'l', d: 0.25 }); appear(you, tA + 0.15);
  // 你被送到平台；平台检查你（红圆：密码）
  const tGo = Math.max(tA + 0.6, Q(KW('a1', '那个平台', 'that platform')) - 0.25);
  fromTo(you, tGo, { x: 0 }, { x: 1120, duration: 0.42, ease: STEP(0.42), immediateRender: false }); sfx('tick', tGo, { g: 0.5, p: 0.3 });
  const chk = word(world, tr('检查你的是它', 'It checks you'), 1320, 150, 48, { w: 900 }); css(chk, { background: C.yel, padding: '0 12px' }); wipe(chk, tGo + 0.4, { dir: 'l', d: 0.25 });
  const pw = shape(world, 'circle', 1380, 360, 110, C.red, { name: 'password' });
  const tLog = Math.max(tGo + 0.5, Q(KW('a2', '登录', 'log in')) - 0.1); appear(pw, tLog); sfx('pop', tLog, { g: 0.6, p: 0.5 });
  const agree = blk(world, 'bg-ink', 1520, 360, 220, 100); const agT = word(agree, tr('同意', 'Agree'), 0, 0, 44, { color: C.paper, w: 900 }); css(agT, { width: '220px', height: '100px', lineHeight: '100px', textAlign: 'center' });
  const tAg = Math.max(tLog + 0.4, Q(KW('a2', '同意', 'agree')) - 0.1);
  appear(agree, tAg - 0.2); fromTo(agree, tAg, { y: 0 }, { keyframes: [{ y: 8, duration: 1 / 12, ease: 'steps(1)' }, { y: 0, duration: 2 / 12, ease: 'steps(2)' }], immediateRender: false }); sfx('thud', tAg, { g: 0.7, p: 0.5 });
  // 带着一次性码回来：一行回跳地址（RFC 6749 §4.1.2 的示例码）
  const tBackA = Math.max(tAg + 0.4, Q(KW('a2', '送回来', 'come back')) - 0.2);
  fromTo(you, tBackA, { x: 1120 }, { x: 0, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  const codeSlip = mono(world, 'code=' + DATA.code, 200, 450, 30, { w: 800 }); css(codeSlip, { background: C.white, border: `4px solid ${C.ink}`, padding: '8px 14px' }); codeSlip.dataset.name = 'one-time-code';
  const tCode = Math.max(tBackA + 0.3, Q(KW('a2', '一次性码', 'one-time code')) - 0.15);
  fromTo(codeSlip, tCode, { autoAlpha: 0, x: 900 }, { autoAlpha: 1, x: 0, duration: 0.33, ease: STEP(0.33) }); sfx('tick', tCode, { g: 0.6, p: -0.3 });
  const redirect = mono(world, '→ shop.example/cb?code=' + DATA.code + '&amp;state=' + DATA.state, 140, 880, 30, { color: C.dim, w: 700 });
  wipe(redirect, tCode + 0.1, { dir: 'l', d: 0.33 });
  // a3：网站拿码去平台换票：码条沿上方的直线过去，回来两行令牌
  const tTrade = Q(T('a3')) - 0.05;
  const wire = blk(world, 'bg-ink', 600, 300, 720, 10); appear(wire, tTrade);
  fromTo(codeSlip, tTrade + 0.05, { x: 0, y: 0 }, { x: 1080, y: -130, duration: 0.42, ease: STEP(0.42), immediateRender: false }); vanish(codeSlip, tTrade + 0.55);
  const tok1 = mono(world, '"access_token":"' + DATA.accessToken + '"', 640, 470, 26, { w: 700 }); css(tok1, { background: C.blue, color: C.paper, padding: '6px 10px' }); tok1.dataset.name = 'access-token';
  const tok2 = mono(world, '"refresh_token":"' + DATA.refreshToken + '"', 640, 540, 26, { w: 700 }); css(tok2, { background: C.blue, color: C.paper, padding: '6px 10px' }); tok2.dataset.name = 'refresh-token';
  const tTok = Math.max(tTrade + 0.55, Q(KW('a3', '换票', 'trades')) - 0.05);
  [tok1, tok2].forEach((e, i) => { fromTo(e, tTok + i * 0.12, { autoAlpha: 0, x: 500 }, { autoAlpha: 1, x: 0, duration: 0.33, ease: STEP(0.33) }); sfx('blip', tTok + i * 0.12, { g: 0.55, p: 0.3 - i * 0.6 }); });
  fade([you], tTok);
  const oa = word(world, 'OAuth 2.0', 700, 150, 110, { w: 900 }); oa.dataset.name = 'oauth';
  const tOA = Q(KW('a3b', 'OAuth 2.0', 'OAuth 2.0')) - 0.15; fade([chk], tOA - 0.1); slam(oa, tOA, { from: 1.3, d: 0.25 }); sfx('thud', tOA, { g: 0.9 });

  // ── 站 B：两层。下层 OAuth 2.0（授权），上层 OIDC（身份） ──
  const BX = 2000, tB = Q(T('a4')) - 0.1;
  const layerA = blk(world, '', BX + 140, 640, 1640, 150); css(layerA, { border: `10px solid ${C.ink}`, boxSizing: 'border-box', background: C.paper }); layerA.dataset.name = 'oauth-layer';
  const layerAL = word(world, tr('OAuth 2.0 · 授权', 'OAuth 2.0 · authorization'), BX + 180, 680, 52, { w: 900 });
  const acc = blk(world, 'bg-blue', BX + 140, 460, 820, 120); acc.dataset.name = 'access-token';
  const accL = word(world, 'Access Token', BX + 170, 486, 56, { color: C.paper, w: 900 });
  const scope = word(world, tr('能做：读取资料', 'May: read profile'), BX + 1000, 480, 48, { w: 900 }); css(scope, { background: C.yel, padding: '4px 14px' }); scope.dataset.name = 'scope';
  const whoQ = h('div', 'abs', world); px(whoQ, BX + 1460, 460, 320, 120); css(whoQ, { border: `6px dashed ${C.ink}`, boxSizing: 'border-box' });
  const whoQL = word(world, tr('是谁？', 'Who?'), BX + 1500, 486, 56, { color: C.dim, w: 900 });
  wipe(layerA, tB, { dir: 'l', d: 0.33, ease: STEP(0.33) }); wipe(layerAL, tB + 0.2, { dir: 'l', d: 0.25 }); sfx('thud', tB + 0.2, { g: 0.6 });
  const tAcc = Math.max(tB + 0.3, Q(KW('a4', 'Access Token', 'Access Token')) - 0.15);
  wipe(acc, tAcc, { dir: 'l', d: 0.25, ease: STEP(0.25) }); appear(accL, tAcc + 0.2); sfx('pop', tAcc, { g: 0.6 });
  const tScope = Math.max(tAcc + 0.4, Q(KW('a4', '能做什么', 'what may')) - 0.15);
  slam(scope, tScope, { from: 1.3, d: 0.25 }); sfx('pop', tScope, { g: 0.6, p: 0.3 }); appear(whoQ, tScope + 0.3); appear(whoQL, tScope + 0.3);
  // a5：一块墨色横板 OIDC 叠在上面
  const tO = Q(T('a5')) - 0.1;
  const layerB = blk(world, 'bg-ink', BX + 140, 300, 1640, 120); layerB.dataset.name = 'oidc-layer';
  const layerBL = word(world, tr('OIDC · 身份', 'OIDC · identity'), BX + 180, 326, 60, { color: C.paper, w: 900 });
  const tLay = Math.max(tO + 0.2, Q(KW('a5', 'OIDC', 'OIDC')) - 0.2);
  fromTo(layerB, tLay, { autoAlpha: 0, y: -300 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); appear(layerBL, tLay + 0.33); sfx('thud', tLay + 0.33, { g: 0.85 });
  // a6：ID Token：三段色条，内容解码：iss、sub（你是谁）、aud（发给谁）
  const tId = Q(T('a6')) - 0.1, I = DATA.idt.payload;
  fade([acc, accL, scope, whoQ, whoQL], tId - 0.05);
  const idBar = (() => { const g = h('div', 'abs', world); px(g, BX + 140, 450, 270, 70); [C.ink, C.yel, C.red].forEach((c, i) => { const b = blk(g, '', i * 92, 0, 86, 70); b.style.background = c; }); g.dataset.name = 'id-token'; return g; })();
  const idL = word(world, 'ID Token', BX + 440, 450, 64, { w: 900 });
  const lines = [['"iss": "' + I.iss + '"', null], ['"sub": "' + I.sub + '"', tr('你是谁', 'who you are')], ['"aud": "' + I.aud + '"', tr('发给谁', 'which site')]];
  const tIdIn = Math.max(tId + 0.1, Q(KW('a6', 'ID Token', 'ID Token')) - 0.2);
  fromTo(idBar, tIdIn, { autoAlpha: 0, x: -200 }, { autoAlpha: 1, x: 0, duration: 0.25, ease: STEP(0.25) }); wipe(idL, tIdIn + 0.1, { dir: 'l', d: 0.25 }); sfx('pop', tIdIn, { g: 0.7 });
  const kws = [null, { zh: '你是谁', en: 'who you are' }, { zh: '发给谁', en: 'which site' }];
  lines.forEach(([l, tag], i) => {
    const e = mono(world, esc(l), BX + 920, 445 + i * 62, 34, { w: 700 });
    const tt = i === 0 ? tIdIn + 0.3 : Math.max(tIdIn + 0.4 + i * 0.2, Q(T('a6', kws[i])) - 0.15);
    wipe(e, tt, { dir: 'l', d: 0.25 });
    if (tag) { css(e, { background: C.yel, padding: '0 10px' }); const tg = word(world, '← ' + tag, BX + 920 + e.offsetWidth + 24, 445 + i * 62, 34, { w: 900 }); wipe(tg, tt + 0.1, { dir: 'l', d: 0.2 }); sfx('tick', tt, { g: 0.6, p: 0.4 }); }
  });

  // ── 站 C：平台连着一排网站；斜线块拿下平台账号，网站一个个转 90° 倒下 ──
  const CX = 4000, tC = Q(T('a7')) - 0.1;
  const hub = frame(world, CX + 140, 330, 360, 360, { bw: 18, label: 'id.example' });
  const sites = [0, 1, 2, 3, 4].map((k) => frame(world, CX + 740 + k * 210, 420, 180, 180, { bw: 12 }));
  const sitesL = word(world, tr('用它登录的网站', 'Sites that sign in with it'), CX + 740, 780, 40, { w: 900 });
  const ov = svg('svg', { class: 'abs', width: 2000, height: 1000, viewBox: '0 0 2000 1000' }, world); px(ov, CX, 0);
  const bus = svg('path', { d: `M500,340 L${740 + 4 * 210 + 90},340`, stroke: C.ink, 'stroke-width': 10, fill: 'none' }, ov);
  const links = [bus, ...sites.map((sv, k) => svg('path', { d: `M${740 + k * 210 + 90},340 L${740 + k * 210 + 90},420`, stroke: C.ink, 'stroke-width': 10, fill: 'none' }, ov))];
  appear(hub.el, tC); appear(hub.lab, tC); sites.forEach((sv, k) => appear(sv.el, tC + 0.1 + k / 12)); wipe(sitesL, tC + 0.4, { dir: 'l', d: 0.25 });
  draw(bus, tC + 0.15, 0.33, { ease: STEP(0.33) }); links.slice(1).forEach((p, k) => draw(p, tC + 0.45 + k / 12, 0.17, { ease: STEP(0.17) }));
  sfx('tick', tC + 0.15, { g: 0.5 });  const trust = word(world, tr('信任集中', 'Concentrated trust'), CX + 140, 140, 80, { w: 900 });
  const tTr = Math.max(tC + 0.3, Q(KW('a7', '信任集中', 'trust')) - 0.15); slam(trust, tTr, { from: 1.3, d: 0.25 }); sfx('thud', tTr, { g: 0.8 });
  const grab = h('div', 'abs', world); px(grab, CX + 140, 330, 360, 360); grab.dataset.name = 'attacker';
  const gh = hatch(grab, 0, 0, 360, 360, C.ink, 24, 8); css(gh, { position: 'absolute', left: '0px', top: '0px' });
  const tLose = Math.max(tTr + 0.5, Q(KW('a7', '失守', 'Lose')) - 0.1);
  fromTo(grab, tLose, { autoAlpha: 0, y: 360 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); sfx('error', tLose + 0.3, { g: 0.8 });
  const tFall = Math.max(tLose + 0.5, Q(KW('a7', '一起失守', 'fall')) - 0.3);
  sites.forEach((sv, k) => { to(sv.el, tFall + k * 0.12, { rotation: 25, y: 70, autoAlpha: 0.35, duration: 0.33, ease: STEP(0.33) }); sfx(k === 0 ? 'error' : 'tick', tFall + k * 0.12, { g: k === 0 ? 0.8 : 0.45, p: 0.2 + k * 0.1 }); });
  links.forEach((p) => to(p, tFall + 0.3, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));

  // ── 镜头 ──
  const A = { x: 960, y: 520, z: 0.98 }, B = { x: BX + 960, y: 540, z: 1 }, C3 = { x: CX + 960, y: 470, z: 1 };
  cam.track(s.start, { ...A, z: 0.95 }, [
    [c0 + 0.05, { z: 0.98 }, 0.5, { sfx: false }],
    [c0 + 0.6, { z: 1.0 }, Math.max(0.4, tB - c0 - 0.85), { ease: 'none', sfx: false }],
    [tB - 0.25, B, 0.85, { sfx: false }],
    [tB + 0.65, { z: 1.02 }, Math.max(0.4, tC - tB - 0.5), { ease: 'none', sfx: false }],
    [tC + 0.2, C3, 0.85, { sfx: false }],
    [tC + 1.1, { z: 1.03 }, Math.max(0.4, s.end - tC - 1.15), { ease: 'none', sfx: false }],
  ]);
});
