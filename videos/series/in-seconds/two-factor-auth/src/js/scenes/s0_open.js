// 第 1 个时间步（0–30 秒）：现象 → 片名 → 只有密码时 → 三类依据 → 双因素。
// 站 A：验证码与表盘，随后变成「手机 | 服务器」左右对开；片名卡盖住换站；站 B：密码与账号；站 C：三类依据。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const XB = 4400, XC = 6600;

  // ── 站 A：这 6 位数字，每 30 秒换一次 ──
  const paper = blk(world, 'bg-paper', 960, -400, 960, 1800);                 // 服务器一侧的纸色底：说到服务器时才刷出来
  const codeA = makeCode(world, { size: 270, x: 112, y: 250 });
  const gDial = h('div', 'abs', world); px(gDial, 0, 0);
  makeDial(gDial, { x: 1530, y: 420, r: 262, color: C.paper, num: true });
  const every = txt(world, 't-3', tr('每 30 秒换一次', 'A new code every 30 s'), 124, 566);
  codeA.cells.forEach((c, i) => { slam(c, 0.04 + i * 0.0625, { from: 1.7, d: 0.32 }); if (i % 2 === 0) sfx('tick', 0.04 + i * 0.0625, { g: 0.8, p: -0.3 }); });
  sfx('thud', 0.42, { g: 0.7 });
  const tEvery = Qf(T('o1', { zh: '每', en: 'change' }));
  wipe(every, tEvery, { dir: 'l', d: 0.4 }); sfx('pop', tEvery, { g: 0.7, p: -0.3 });

  // 「手机可以不联网，服务器却知道」：两件东西各自挪到左半，右半刷出服务器一侧，同样的六位数字逐位填上
  const tSplit = Qf(T('o2'));
  wipeOut(every, tSplit, { dir: 'l', d: 0.3 });
  fromTo(codeA.el, tSplit, { x: 0, y: 0, scale: 1 }, { x: 70 - 112, y: 170 - 250, scale: 210 / 270, transformOrigin: '0 0', duration: 0.75, ease: 'power3.inOut' });
  fromTo(gDial, tSplit, { x: 0, y: 0, scale: 1 }, { x: 700 - 1530, y: 690 - 420, scale: 170 / 262, transformOrigin: '1530px 420px', duration: 0.75, ease: 'power3.inOut' });
  wipe(paper, tSplit + 0.1, { dir: 'r', d: 0.6 }); sfx('whoosh', tSplit, { g: 0.7, p: 0.4 });
  const lPhone = txt(world, 't-2', tr('手机', 'Phone'), 66, 596);
  const lOff = txt(world, 't-3 ac', tr('未联网', 'offline'), 72, 716);
  const lServer = txt(world, 't-2 ink', tr('服务器', 'Server'), 1026, 596);
  const tOff = Q(T('o2', { zh: '不联网', en: 'offline' })), tSrv = Q(T('o2', { zh: '服务器', en: 'server' }));
  wipe(lPhone, tSplit + 0.35, { dir: 'l', d: 0.35 });
  slam(lOff, tOff, { from: 1.3, d: 0.3 }); sfx('pop', tOff, { g: 0.7, p: -0.4 });
  wipe(lServer, tSrv, { dir: 'l', d: 0.35 }); sfx('pop', tSrv, { g: 0.6, p: 0.4 });
  const slots = [];                                                           // 占位：六道空位，随后填上数字
  for (let i = 0; i < 6; i++) { const b = blk(world, 'bg-ink', 1030 + i * 126 + (i >= 3 ? 63 : 0), 356, 104, 10); slots.push(b); wipe(b, tSplit + 0.45 + i * 0.04, { dir: 'l', d: 0.25 }); }
  const codeS = makeCode(world, { size: 210, x: 1030, y: 170, color: C.ink });
  const gDialS = h('div', 'abs', world); px(gDialS, 0, 0);
  makeDial(gDialS, { x: 1660, y: 690, r: 170, color: C.ink, num: true });
  fromTo(gDialS, tSplit + 0.45, { autoAlpha: 0, scale: 0.6, rotation: -40 }, { autoAlpha: 1, scale: 1, rotation: 0, transformOrigin: '1660px 690px', duration: 0.5, ease: 'back.out(1.6)' });
  const tKnow = Q(T('o2', { zh: '知道', en: 'knows' }));
  codeS.cells.forEach((c, i) => { slam(c, tKnow + i * 0.0625, { from: 1.5, d: 0.28 }); sfx('tick', tKnow + i * 0.0625, { g: 0.7, p: 0.4 }); wipeOut(slots[i], tKnow + i * 0.0625, { dir: 'r', d: 0.2 }); });
  sfx('chime', tKnow + 0.45, { g: 0.6, p: 0.3 });

  // ── 片名卡：朱红整屏，压在镜头换站的那一刻上 ──
  const tCard = Qf(T('o3')), t2fa = Q(T('o3', '2FA')), tOut = Q(Tend('o3') + 0.35);
  const card = h('div', 'abs bg-ac ink', root); px(card, 0, 0, 1920, VH);
  const big = txt(card, 'ink', '2FA', 84, 74); css(big, { font: '900 540px "Inter"', letterSpacing: '-.04em', lineHeight: '1' });
  const sub = txt(card, (LANG === 'zh' ? 't-1' : 't-2') + ' ink', tr('双因素认证', 'Two-factor authentication'), 104, LANG === 'zh' ? 640 : 690);
  const n120 = txt(card, 'num ink', '120', 1196, 150); n120.style.fontSize = '290px';
  const sec = txt(card, 't-2 ink', tr('秒', 's'), 1736, 322);
  const ttl = txt(card, 't-4 ink', tr('关于什么是 2FA，<br>以及它是怎么工作的', 'What it is,<br>and how it works'), 1208, 474);
  [big, sub, n120, sec, ttl].forEach((e) => { e.dataset.overlapOk = '1'; });      // 片名卡盖在换站的画面上，属有意压盖
  wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
  slam(big, t2fa, { from: 1.35, d: 0.4 }); sfx('thud', t2fa);
  slide(n120, t2fa + 0.25, { x: 120, d: 0.45 }); slide(sec, t2fa + 0.33, { x: 120, d: 0.45 }); sfx('pop', t2fa + 0.25, { g: 0.6, p: 0.4 });
  wipe(ttl, t2fa + 0.5, { dir: 't', d: 0.4 });
  fromTo(big, t2fa + 0.42, { scale: 1 }, { scale: 1.045, transformOrigin: '0% 60%', duration: tOut - t2fa, ease: 'none', immediateRender: false });   // 片名停留时保持缓慢的推近
  const tSub = Q(T('o3', { zh: '双因素', en: 'two-factor' }));
  wipe(sub, tSub, { dir: 'l', d: 0.45 }); sfx('blip', tSub, { g: 0.7, p: -0.3 });
  wipeOut(card, tOut, { dir: 'r', d: 0.4 }); sfx('whoosh', tOut, { g: 0.7 });
  hudGround('L', tCard + 0.2, tOut + 0.3, 'ac'); hudGround('R', tCard + 0.3, tOut + 0.1, 'ac');
  slam(HUD.right, tCard + 0.5, { from: 1.4, d: 0.35 });                       // 从这里起，验证码与表盘常驻右上角

  // ── 站 B：只验证密码的登录 ──
  const PW = 'qwerty12';                                                      // 演示用的弱密码
  txt(world, 't-3', tr('密码', 'Password'), XB + 120, 196);
  blk(world, 'bg-paper', XB + 120, 398, 680, 6);
  const dots = [], chars = [];
  const tLeak = Q(T('p1', { zh: '泄露', en: 'leak' }));
  [...PW].forEach((ch, i) => {
    dots.push(blk(world, 'bg-paper', XB + 128 + i * 86, 312, 60, 60));
    const c = txt(world, 'num', ch, XB + 120 + i * 86, 296); css(c, { fontSize: '84px', width: '76px', textAlign: 'center' }); chars.push(c);
    vanish(dots[i], tLeak + i * 0.03); appear(c, tLeak + i * 0.03);
  });
  sfx('error', tLeak, { g: 0.7, p: -0.3 });
  const ov = overlay(world);
  const acct = h('div', 'abs', world); px(acct, XB + 1260, 170, 520, 330); css(acct, { border: `8px solid ${C.paper}` });
  const acctT = txt(world, 't-1', tr('账号', 'Account'), XB + 1260, 250); css(acctT, { width: '520px', textAlign: 'center', fontSize: LANG === 'zh' ? '168px' : '104px', lineHeight: '170px' });
  const line1 = path(ov, `M${XB + 830},345 L${XB + 1236},345`, 'paper', { w: 6 });
  const one = txt(world, 't-n dim', tr('只有这一道验证', 'the only check'), XB + 860, 286);
  const tOnly = Qf(T('p1')) + 0.25;
  arrowIn(line1, tOnly, 0.5); wipe(one, tOnly + 0.2, { dir: 'l', d: 0.3 }); sfx('blip', tOnly, { g: 0.6 });
  // 泄露的副本：斜线框 = 不可信的一方
  const leak = h('div', 'abs', world); px(leak, XB + 108, 520, 704, 132);
  hatch(leak, 0, 0, 704, 132, C.paper, 20, 6); blk(leak, 'bg-ink', 14, 14, 676, 104);
  const lt = txt(leak, 'num', PW, 30, 28); css(lt, { fontSize: '76px', letterSpacing: '.12em' });
  const leakL = txt(world, 't-n dim', tr('泄露出去的副本', 'the leaked copy'), XB + 120, 672);
  slide(leak, tLeak + 0.25, { y: -180, d: 0.45 }); wipe(leakL, tLeak + 0.6, { dir: 'l', d: 0.3 }); sfx('pop', tLeak + 0.25, { g: 0.7, p: -0.3 });
  const tLost = Q(T('p1', { zh: '失守', en: 'loses' }));
  const line2 = path(ov, `M${XB + 830},586 L${XB + 1030},586 L${XB + 1030},440 L${XB + 1236},440`, 'paper', { w: 6 });
  arrowIn(line2, tLost - 0.5, 0.5);
  const lost = h('div', 'abs', world); px(lost, XB + 1260, 170, 520, 330);
  hatch(lost, 0, 0, 520, 330, C.paper, 20, 6);
  const lostT = txt(lost, 'ink bg-ac', tr('失守', 'Lost'), 60, 82); css(lostT, { width: '400px', textAlign: 'center', font: `900 ${LANG === 'zh' ? 150 : 130}px "Inter", "Sans SC"`, lineHeight: '166px' });
  wipe(lost, tLost, { dir: 'l', d: 0.35 }); vanish(acctT, tLost + 0.2); sfx('thud', tLost, { p: 0.4 });

  // ── 站 C：验证的依据共有三类 ──
  const cols = [
    { x: XC + 100, w: tr('知道', 'KNOWN'), ex: tr('密码', 'password'), cue: 'a2', at: { zh: '知道', en: 'known' }, exAt: { zh: '密码', en: 'password' } },
    { x: XC + 710, w: tr('持有', 'HELD'), ex: tr('手机 · 安全密钥', 'phone · security key'), cue: 'a3', at: { zh: '持有', en: 'held' }, exAt: { zh: '手机', en: 'phone' } },
    { x: XC + 1320, w: tr('自身', 'INHERENT'), ex: tr('指纹', 'fingerprint'), cue: 'a4', at: { zh: '自身', en: 'inherent' }, exAt: { zh: '指纹', en: 'fingerprint' } },
  ];
  const tThree = Qf(T('a1')) + 0.25;
  const emblem = (x, kind) => {                                                // 三个示意图形，同一种 8px 线
    const g = svg('svg', { class: 'abs', width: 500, height: 250, viewBox: '0 0 500 250' }, world); px(g, x, 478); g.dataset.name = kind;
    const st = { fill: 'none', stroke: C.paper, 'stroke-width': 8 };
    if (kind === 'know') { svg('rect', { x: 4, y: 70, width: 400, height: 110, ...st }, g); for (let i = 0; i < 5; i++) svg('rect', { x: 40 + i * 68, y: 105, width: 40, height: 40, fill: C.paper }, g); }
    if (kind === 'have') { svg('rect', { x: 4, y: 4, width: 132, height: 240, ...st }, g); svg('rect', { x: 46, y: 206, width: 48, height: 12, fill: C.paper }, g); svg('rect', { x: 230, y: 96, width: 200, height: 76, ...st }, g); svg('rect', { x: 430, y: 112, width: 60, height: 44, ...st }, g); svg('rect', { x: 262, y: 118, width: 32, height: 32, fill: C.paper }, g); }
    if (kind === 'are') for (let i = 0; i < 5; i++) { const r = 24 + i * 25, tail = [70, 110, 60, 96, 40][i]; svg('path', { d: `M${150 - r},${130 + tail} L${150 - r},130 A${r},${r} 0 0 1 ${150 + r},130 L${150 + r},${130 + [50, 84, 110, 70, 100][i]}`, ...st }, g); }
    return g;
  };
  const pickBars = [];
  cols.forEach((c, i) => {
    const rule = blk(world, 'bg-paper', c.x, 152, 500, 8);
    fromTo(rule, tThree + i * 0.125, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'power3.out' }); sfx('tick', tThree + i * 0.125, { g: 0.7, p: -0.5 + i * 0.5 });
    const word = txt(world, '', c.w, c.x - 6, 178); css(word, { font: `900 ${LANG === 'zh' ? 184 : 96}px "Inter", "Sans SC"`, letterSpacing: '-.02em', lineHeight: '184px' });
    const ex = txt(world, LANG === 'zh' ? 't-3' : 't-4', c.ex, c.x, 384);
    const em = emblem(c.x, ['know', 'have', 'are'][i]);
    const tw = Q(T(c.cue, c.at)), te = Q(T(c.cue, c.exAt));
    slam(word, tw, { from: 1.25, d: 0.35 }); sfx('thud', tw, { g: 0.7, p: -0.5 + i * 0.5 });
    wipe(ex, te, { dir: 'l', d: 0.3 }); wipe(em, tThree + 0.3 + i * 0.125, { dir: 't', d: 0.4 }); sfx('pop', te, { g: 0.6, p: -0.5 + i * 0.5 });        // 三个图形先摆出来占位
    const bar = blk(world, 'bg-ac', c.x, 132, 500, 28); pickBars.push(bar);
    c.word = word; c.ex = ex; c.em = em;
  });
  // 双因素：用上其中不同的两类
  const tTwo = Q(T('a5', { zh: '不同', en: 'two different' }));
  [0, 1].forEach((i) => { fromTo(pickBars[i], tTwo + i * 0.25, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.35, ease: 'power3.out' }); sfx('pop', tTwo + i * 0.25, { p: -0.5 + i * 0.5 }); });
  vanish(pickBars[2], 0);                                                     // 第三类不选
  [cols[2].word, cols[2].ex].forEach((e) => classAt(e, 'dim', tTwo));
  to(cols[2].em, tTwo, { opacity: 0.45, duration: 0.3 });
  const plus = txt(world, 'ac', '+', XC + 600, 208); css(plus, { font: '900 120px "Inter"', width: '110px', textAlign: 'center', lineHeight: '1' });
  slam(plus, tTwo + 0.25, { from: 1.6, d: 0.3 });
  const eq = txt(world, 't-2', tr('2FA = <span class="ac">不同的两类</span>', '2FA = <span class="ac">two different kinds</span>'), XC + 100, 778);
  const tEq = Q(Tend('a5') - 0.55);
  wipe(eq, tEq, { dir: 'l', d: 0.45 }); sfx('chime', tEq + 0.2, { g: 0.7 });
  const same = txt(world, 't-n dim', tr('两个密码仍是同一类，不算', 'two passwords are still one kind'), XC + 1320, 820);
  wipe(same, tEq + 0.75, { dir: 'l', d: 0.35 }); sfx('tick', tEq + 0.75, { g: 0.6, p: 0.5 });
  sfx('riser', s.end - 1.25, { g: 0.8 });                                      // 换码之前的铺垫

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1.07 }, [
    [0.02, { z: 1 }, 0.85, { ease: 'power3.out', sfx: false }],
    [0.9, { z: 1.03 }, tSplit - 0.95, { ease: 'none', sfx: false }],
    [tSplit, { z: 1 }, 0.7, { sfx: false }],
    [tSplit + 0.75, { z: 1.03 }, tCard - tSplit - 0.4, { ease: 'none', sfx: false }],
    [tCard + 0.55, { x: XB + 960, z: 1 }, 0.02, { ease: 'none', sfx: false }],        // 片名卡盖着的时候换站
    [tOut, { z: 1.04 }, Tend('p1') - tOut - 0.1, { ease: 'none', sfx: false }],
    [Tend('p1') + 0.05, { x: XC + 960, z: 1 }, 0.7],
    [null, { z: 1.03 }, tTwo - T('a1') - 0.8, { ease: 'none', sfx: false }],
    [tTwo, { z: 1 }, 0.6, { sfx: false }],
    [null, { z: 1.03 }, s.end - tTwo - 0.8, { ease: 'none', sfx: false }],
  ]);
});
