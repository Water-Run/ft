// 会话：HTTP 不记事 → 服务器记一条会话 → 发编号（Session ID）→ 装进 Cookie 交给浏览器 → 之后每次自动带回、查表认出你 →
// Cookie 只运送、会话才记住你 → 代价：谁拿到编号就是你；别的网页也能借你的浏览器发请求（跨站请求伪造）。
// 一张大图：左边浏览器，右边服务器黑框；镜头在两者之间移动，推进黑框看会话记录与会话表。左上角一格是「标题位」，同一时刻只放一个名词。
// Session ID 与 Cookie 行取 RFC 6265 §3.1 的示例原值（DATA.sid）。
scene('session', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '3600px', height: '1400px' });
  const cam = makeCamera(world, 1920, VH);
  const isZh = zh(), SID = DATA.sid;

  // ── 浏览器（左）与服务器（右） ──
  const BRX = 120, BRY = 250, BRW = 640, BRH = 620;
  const br = blk(world, 'bg-paper', BRX, BRY, BRW, BRH); css(br, { border: `6px solid ${C.ink}`, boxSizing: 'border-box' }); br.dataset.name = 'browser';
  const bar = blk(world, '', BRX + 30, BRY + 30, BRW - 60, 64); css(bar, { border: `4px solid ${C.ink}`, boxSizing: 'border-box' });
  const barT = mono(world, 'shop.example', BRX + 52, BRY + 42, 32);
  const jar = word(world, 'Cookie', BRX + 34, BRY + 446, 30, { color: C.dim, w: 700 });
  const jarLine = blk(world, 'bg-ink', BRX + 30, BRY + 486, BRW - 60, 4);
  const brL = word(world, tr('浏览器', 'Browser'), BRX, BRY + BRH + 24, 48, { w: 900 });
  const SVX = 1260, SVY = 250, SVW = 640, SVH = 620;
  const srv = frame(world, SVX, SVY, SVW, SVH, { bw: 18, label: 'shop.example' });
  const srvL = word(world, tr('服务器', 'Server'), SVX, SVY + SVH + 24, 48, { w: 900 });
  const tIn = c0 + 0.05;
  wipe(br, tIn, { dir: 'b', d: 0.25 }); [bar, barT, jar, jarLine].forEach((e, i) => appear(e, tIn + 0.15 + i * 0.05));
  wipe(srv.el, tIn + 0.1, { dir: 't', d: 0.25 }); appear(srv.lab, tIn + 0.25);
  wipe(brL, tIn + 0.2, { dir: 'l', d: 0.25 }); wipe(srvL, tIn + 0.3, { dir: 'l', d: 0.25 });
  sfx('thud', tIn + 0.25, { g: 0.6, p: 0.3 });

  // 标题位：左上角，同一时刻只放一个名词；后一个进来之前前一个收走
  const HX = 120, HY = 150;
  const headline = (html, t0, t1, o = {}) => {
    const e = word(world, html, HX, HY, o.size || (isZh ? 72 : 60), { w: 900 }); e.dataset.name = 'headline';
    slam(e, t0, { from: 1.25, d: 0.25 }); sfx('thud', t0, { g: 0.8, p: -0.4 });
    if (t1 != null) to(e, t1, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' });
    return e;
  };

  // 一张请求卡：从浏览器飞到服务器（12 帧/秒步进），到了就被服务器收走。带 cookie 时底部一条蓝底的 Cookie 行
  const card = (y, line, tGo, o = {}) => {
    const W = 520, H = o.cookie ? 132 : 76;
    const e = h('div', 'abs', world); px(e, BRX + 60, y, W, H); css(e, { background: C.white, border: `5px solid ${C.ink}`, boxSizing: 'border-box' }); e.dataset.name = 'request';
    const l1 = mono(e, line, 18, 12, 34, { w: 800 }); l1.style.position = 'absolute';
    if (o.cookie) { const ck = mono(e, 'Cookie: SID=' + SID, 0, 72, 26, { color: C.paper, w: 700 }); css(ck, { position: 'absolute', left: '-5px', width: W + 'px', height: '55px', lineHeight: '55px', background: C.blue, paddingLeft: '18px', boxSizing: 'border-box' }); ck.dataset.name = 'cookie-line'; }
    if (o.red) for (let k = 0; k < 4; k++) { const d = shape(e, 'circle', 330 + k * 40, 22, 30, C.red, { name: 'password-char' }); d.style.position = 'absolute'; }
    const d = o.d || 0.5, dx = o.dx != null ? o.dx : SVX + 40 - BRX - 60;
    appear(e, tGo - 0.2);
    fromTo(e, tGo, { x: 0 }, { x: dx, duration: d, ease: STEP(d), immediateRender: false });
    vanish(e, o.until != null ? o.until : tGo + d + 0.6);
    sfx('tick', tGo, { g: 0.55, p: -0.4 }); sfx('tick', tGo + d, { g: 0.45, p: 0.4 });
    return e;
  };

  // ── s1：两张请求，服务器每次都问「谁？」——它不记得上一个 ──
  const q1 = Q(T('s1', { zh: '本身', en: 'protocol' })) - 0.4, q2 = Q(T('s1', { zh: '上一个', en: 'forgets' })) - 0.25;
  const forget = word(world, '?', SVX + 250, SVY + 130, 300, { w: 900 }); forget.dataset.name = 'question';
  card(SVY + 140, 'GET /orders', q1); card(SVY + 240, 'GET /orders', q2);
  F((t) => { const on = (t >= q1 + 0.5 && t < q1 + 0.95) || (t >= q2 + 0.5 && t < Tend('s1') + 0.15); forget.style.visibility = on ? 'visible' : 'hidden'; });
  sfx('pop', q1 + 0.55, { g: 0.6, p: 0.5 }); sfx('pop', q2 + 0.55, { g: 0.6, p: 0.5 });
  const tFor = Q(T('s1', 'HTTP')) - 0.1;
  headline(tr('HTTP：不记得上一个请求', 'HTTP: no memory of the last request'), tFor, Tend('s1') + 0.6, { size: isZh ? 64 : 52 });

  // ── s2–s3：登录请求带着红圆进来；框里写出一张会话记录 ──
  const tLogin = T('s2') - 0.1;
  card(SVY + 140, 'POST /login', tLogin, { red: true });
  const RX = SVX + 50, RY = SVY + 60, RW = 540, RH = 400, SW = 130;
  const rec = blk(world, 'bg-paper', RX, RY, RW, RH); css(rec, { border: `6px solid ${C.ink}`, boxSizing: 'border-box' }); rec.dataset.name = 'session-record';
  const recT = word(world, tr('会话 Session', 'Session'), RX + 30, RY + 24, 44, { w: 900 });
  const tRec = Q(T('s2', { zh: '会话', en: 'session' })) - 0.15;
  wipe(rec, tRec, { dir: 't', d: 0.33, ease: STEP(0.33) }); wipe(recT, tRec + 0.2, { dir: 'l', d: 0.25 }); sfx('thud', tRec + 0.3, { g: 0.7, p: 0.4 });
  const recEls = [rec, recT], rowLabels = [];
  [
    [{ zh: '你是谁', en: 'who' }, tr('用户', 'User'), 'alice', true],
    [{ zh: '能做什么', en: 'may' }, tr('权限', 'Can'), tr('下单 · 改地址', 'order, edit'), true],
    [{ zh: '何时过期', en: 'expires' }, tr('过期', 'Until'), '20:30', false],
  ].forEach(([kw, k, v, yel], i) => {
    const y = RY + 110 + i * 88;
    const a = word(world, k, RX + 30, y + 6, 30, { color: C.dim, w: 700 });
    const b = yel ? word(world, v, RX + 130, y, 34, { w: 800 }) : mono(world, v, RX + 130, y, 38, { w: 800 });
    if (yel) css(b, { background: C.yel, padding: '2px 12px' });
    const tt = Math.max(tRec + 0.35 + i * 0.1, Q(T('s3', kw)) - 0.1);
    wipe(a, tt, { dir: 'l', d: 0.2 }); slide(b, tt + 0.05, { x: -40, d: 0.25, ease: STEP(0.25) }); sfx('tick', tt, { g: 0.6, p: 0.4 });
    recEls.push(b); rowLabels.push(a);
  });

  // ── s4：盖上蓝色票根（Session ID） ──
  const tStub = Q(T('s4', { zh: '随机编号', en: 'random' })) - 0.1;
  const stub = blk(world, 'bg-blue', RX + RW - SW - 6, RY + 6, SW, RH - 12); stub.dataset.name = 'session-id-stub';
  const stubT = mono(world, SID.slice(0, 8) + '<br>' + SID.slice(8), RX + RW - SW + 8, RY + 140, 26, { color: C.paper, w: 800 }); css(stubT, { lineHeight: '1.5' });
  fromTo(stub, tStub, { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.17, ease: 'steps(2)' });
  appear(stubT, tStub + 0.1); sfx('pop', tStub + 0.08, { g: 0.85, p: 0.4 });
  recEls.push(stub, stubT);
  const sidL = word(world, 'Session ID', RX + 20, RY + RH + 34, 72, { w: 900 }); sidL.dataset.name = 'session-id-label';
  const tSidL = Q(T('s4', 'Session ID')) - 0.1; slam(sidL, tSidL, { from: 1.3, d: 0.25 }); sfx('thud', tSidL, { g: 0.8, p: 0.4 });
  recEls.push(sidL);

  // ── s5：Set-Cookie 行带着票根的复本回到浏览器，落进 Cookie 栏 ──
  const tSet = Q(T('s5')) - 0.1;
  const setc = mono(world, 'Set-Cookie: SID=' + SID, SVX + 40, SVY + SVH - 110, 30, { color: C.paper, w: 700 }); css(setc, { background: C.blue, padding: '10px 16px' }); setc.dataset.name = 'set-cookie';
  appear(setc, tSet);
  fromTo(setc, tSet + 0.25, { x: 0, y: 0 }, { x: BRX + 30 - SVX - 40, y: BRY + 504 - (SVY + SVH - 110), duration: 0.67, ease: STEP(0.67), immediateRender: false });
  sfx('blip', tSet + 0.25, { g: 0.6, p: 0.4 }); sfx('pop', tSet + 0.92, { g: 0.7, p: -0.4 });
  const tCk = Math.max(tSet + 0.6, Q(T('s5', 'Cookie')) - 0.05);
  const ckHead = headline('Cookie', tCk, null);
  rowLabels.forEach((e) => to(e, tSet + 0.95, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));   // 字段名先收走，只留值，免得这一屏字太多

  // ── s6：之后每次请求都自动带上 ──
  const tR = [Q(T('s6')) + 0.1, Q(T('s6', { zh: '自动', en: 'sends' })) - 0.1, Q(Tend('s6')) - 0.25];
  ['GET /orders', 'GET /orders/1024', 'PUT /address'].forEach((l, i) => card(SVY + 100 + i * 150, l, tR[i], { cookie: true }));

  // ── s7：查表。记录卡退到后面，会话表出现：四行编号，查找条逐行下移，停在本行，alice 亮起 ──
  const tTab = Q(T('s7')) - 0.2;
  recEls.forEach((e) => to(e, tTab - 0.1, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  const TX = SVX + 50, TY = SVY + 60;
  const ids = ['7c1e04b9a2f3d851', '5a90e2c46d1b77f0', SID, 'e2d81f6a0c3b9947'], who = ['bob', 'carol', 'alice', 'dave'];
  const tabRows = ids.map((id, i) => {
    const y = TY + i * 104;
    const r = blk(world, 'bg-paper', TX, y, 540, 88); css(r, { border: `4px solid ${C.ink}`, boxSizing: 'border-box' }); r.dataset.name = 'session-row';
    const a = mono(world, id, TX + 20, y + 24, 30, { w: 700 }); const b = word(world, who[i], TX + 400, y + 18, 38, { w: 800 });
    [r, a, b].forEach((e) => appear(e, tTab + i / 12));
    return { r, a, b, y };
  });
  const tabL = word(world, tr('会话表', 'Session table'), TX, TY + 4 * 104 + 20, 44, { w: 900 }); appear(tabL, tTab + 0.35);
  const hit = blk(world, 'bg-ink', TX - 26, TY, 16, 88); hit.dataset.name = 'lookup';
  appear(hit, tTab + 0.4);
  const tLook = tTab + 0.45, tFound = Math.max(tLook + 0.75, Q(T('s7', { zh: '认出', en: 'knows' })) - 0.1);
  fromTo(hit, tLook, { y: 0 }, { y: 2 * 104, duration: tFound - tLook, ease: 'steps(2)', immediateRender: false });
  sfx('tick', tLook, { g: 0.5, p: 0.4 }); sfx('tick', tLook + (tFound - tLook) / 2, { g: 0.5, p: 0.4 });
  classAt(tabRows[2].b, 'bg-yellow', tFound); classAt(tabRows[2].r, 'bg-blue', tFound);
  F((t) => { const c = t >= tFound ? C.paper : C.ink; if (tabRows[2].a.style.color !== c) tabRows[2].a.style.color = c; });
  sfx('chime', tFound, { g: 0.7, p: 0.4 });

  // ── s8：两句大字，分别压在浏览器和服务器下面。Cookie 只运送；会话记住你 ──
  const tS8 = Q(T('s8')) - 0.1;
  to(ckHead, tS8 - 0.15, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' });
  [brL, srvL, tabL].forEach((e) => to(e, tS8 - 0.1, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  const k1 = word(world, tr('Cookie：只负责运送', 'Cookie: only carries it'), BRX, BRY + BRH + 24, isZh ? 56 : 46, { w: 900 });
  const k2 = word(world, tr('会话：记住你', 'Session: remembers you'), SVX, SVY + SVH + 24, isZh ? 56 : 46, { w: 900 });
  slam(k1, tS8 + 0.1, { from: 1.25, d: 0.25 }); sfx('thud', tS8 + 0.1, { g: 0.8, p: -0.4 });
  const tK2 = Math.max(tS8 + 0.6, Q(T('s8', { zh: '记住你', en: 'session' })) - 0.15); slam(k2, tK2, { from: 1.25, d: 0.25 }); sfx('thud', tK2, { g: 0.8, p: 0.4 });

  // ── s9：一块斜线块从下面插进两框之间，抄走一行 Cookie；它带着这行发请求，表里照样亮起 alice ──
  const tS9 = Q(T('s9')) - 0.1;
  [k1, k2].forEach((e) => to(e, tS9 + 0.35, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  const thief = h('div', 'abs', world); px(thief, 790, 720, 440, 230); thief.dataset.name = 'attacker';
  const th = hatch(thief, 0, 0, 440, 230, C.ink, 22, 7); css(th, { position: 'absolute', left: '0px', top: '0px' });
  fromTo(thief, tS9 + 0.05, { autoAlpha: 0, y: 330 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: STEP(0.42) });
  sfx('pop', tS9 + 0.45, { g: 0.7, p: 0.0 });
  const tTake = Math.max(tS9 + 0.55, Q(T('s9', { zh: '拿到', en: 'holds' })) - 0.05);
  const copy = mono(world, 'Cookie: SID=' + SID, 760, 640, 30, { color: C.paper, w: 700 }); css(copy, { background: C.blue, padding: '8px 14px' }); copy.dataset.name = 'stolen-cookie';
  appear(copy, tTake); sfx('tick', tTake, { g: 0.6 });
  const tSend = tTake + 0.45;
  fromTo(copy, tSend, { x: 0, y: 0 }, { x: SVX - 20 - 760, y: TY + 2 * 104 + 22 - 640, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  copy.dataset.overlapOk = '1'; vanish(copy, tSend + 0.6);
  const asYou = word(world, '= alice', 820, 560, 64, { w: 900 }); css(asYou, { background: C.yel, padding: '0 14px' }); asYou.dataset.name = 'as-you';
  const tAs = Math.max(tSend + 0.5, Q(T('s9', { zh: '当成你', en: 'you' })) - 0.15); slam(asYou, tAs, { from: 1.3, d: 0.25 }); sfx('error', tAs, { g: 0.75, p: 0.0 });
  const tS10 = Q(T('s10')) - 0.1;
  [thief, asYou].forEach((e) => to(e, tS10 - 0.15, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  tabRows.forEach(({ r, a, b }) => [r, a, b].forEach((e) => to(e, tS10 - 0.15, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' })));
  to(hit, tS10 - 0.15, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' });

  // ── s10：浏览器里多出一页斜线的 other.example，它替你发出 PUT /address，浏览器自动贴上票根 ──
  const evil = h('div', 'abs', world); px(evil, BRX + 40, BRY + 120, 560, 300); css(evil, { background: C.paper, border: `5px solid ${C.ink}`, boxSizing: 'border-box', overflow: 'hidden' }); evil.dataset.name = 'other-site';
  const eh = hatch(evil, 0, 0, 560, 300, C.dimp, 26, 4); css(eh, { position: 'absolute', left: '0px', top: '0px' });
  const ehT = mono(evil, 'other.example', 24, 20, 34, { w: 800 }); css(ehT, { position: 'absolute', background: C.paper, padding: '4px 10px' });
  fromTo(evil, tS10, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: STEP(0.25) }); sfx('pop', tS10 + 0.1, { g: 0.6, p: -0.4 });
  const tF = Math.max(tS10 + 0.5, Q(T('s10', { zh: '替你', en: 'request' })) + 0.1);
  card(BRY + 300, 'PUT /address', tF, { cookie: true, d: 0.67, until: s.end + 1 });
  const ok = word(world, '= alice', SVX + 60, BRY + 460, 56, { w: 900 }); css(ok, { background: C.yel, padding: '0 14px' }); ok.dataset.name = 'accepted-as-you';
  slam(ok, tF + 0.8, { from: 1.3, d: 0.25 }); sfx('error', tF + 0.8, { g: 0.7, p: 0.4 });
  const tName = Q(T('s10', { zh: '跨站', en: 'cross-site' })) - 0.1;
  headline(tr('跨站请求伪造', 'Cross-site request forgery'), tName, null, { size: isZh ? 72 : 56 });
  const csrfE = mono(world, 'CSRF', HX + (isZh ? 470 : 900), HY + 6, 60, { color: C.red, w: 800 });
  wipe(csrfE, tName + 0.2, { dir: 'l', d: 0.2 });

  // 推近服务器时，两只框下面的标签会伸进字幕条：推近期间藏起来
  F((t) => { const z = (t >= tRec - 0.1 && t < tSet + 0.7) || (t >= tTab - 0.15 && t < tS8 - 0.1); const v = z ? 'hidden' : 'visible'; if (srvL.style.visibility !== v) { srvL.style.visibility = v; brL.style.visibility = v; } });
  // ── 镜头：全景 → 推近服务器（记录、票根）→ 拉回全景（Cookie 回到浏览器、带着它的请求）→ 推进黑框查表 → 拉回全景 → 看斜线块 → 回到全景 ──
  const ALL = { x: 1010, y: 540, z: 0.94 }, SRV = { x: SVX + SVW / 2, y: SVY + 300, z: 1.25 };
  cam.track(s.start, { ...ALL, z: 0.98 }, [
    [c0 + 0.05, { z: 0.94 }, 0.6, { sfx: false }],
    [c0 + 0.7, { z: 0.955 }, Math.max(0.5, tRec - c0 - 0.9), { ease: 'none', sfx: false }],
    [tRec - 0.15, SRV, 1.0, { sfx: false }],
    [tRec + 0.9, { z: 1.28 }, Math.max(0.5, tSet - tRec - 0.95), { ease: 'none', sfx: false }],
    [tSet + 0.2, { ...ALL }, 0.9, { sfx: false }],
    [tSet + 1.15, { z: 0.965 }, Math.max(0.5, tTab - tSet - 1.4), { ease: 'none', sfx: false }],
    [tTab - 0.2, { ...SRV, y: SVY + 320 }, 0.9, { sfx: false }],
    [tTab + 0.75, { z: 1.28 }, Math.max(0.4, tS8 - tTab - 1.0), { ease: 'none', sfx: false }],
    [tS8 - 0.2, { ...ALL }, 0.8, { sfx: false }],
    [tS8 + 0.65, { z: 0.955 }, Math.max(0.4, tS9 - tS8 - 0.85), { ease: 'none', sfx: false }],
    [tS9 - 0.15, { x: 1010, y: 600, z: 0.9 }, 0.8, { sfx: false }],
    [tS10 - 0.2, { ...ALL }, 0.8, { sfx: false }],
    [tS10 + 0.65, { z: 0.96 }, Math.max(0.4, s.end - tS10 - 0.7), { ease: 'none', sfx: false }],
  ]);
});
