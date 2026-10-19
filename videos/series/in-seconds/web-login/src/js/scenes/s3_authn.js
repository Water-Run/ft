// 第一次怎么认出你：回到登录页 → 密码只存哈希（单向压模），输入的照样压一遍、一致就通过；压模故意慢，表被偷也难逐个猜 →
// 密码证明「知道」，会被假网站骗走（钓鱼）；短信码证明「有」，同样会被转走 → passkey：一对钥匙，服务器只存公钥；
// 你按下指纹，设备用私钥给随机数签名，服务器用公钥一验；钥匙只给注册它的网站签名 → 验证码只分辨人和程序。
// 站 A：登录页（p1）；站 B：压模（p2–p3b）；站 C：钓鱼（p4–p5）；站 D：passkey（p6–p8）；站 E：验证码（p9）。
// 哈希、两种哈希的耗时、挑战值与签名来自 research/lab/01_lab.js 的实算（DATA.pw、DATA.pk）。
scene('authn', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '10200px', height: '1400px' });
  const cam = makeCamera(world, 1920, VH);
  const isZh = zh(), P = DATA.pw, K = DATA.pk;
  const KW = (id, zhw, enw) => T(id, { zh: zhw, en: enw });
  const fade = (els, t) => els.forEach((e) => to(e, t, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));

  // ── 站 A：回到登录页，问「第一次？」 ──
  const t1 = c0 + 0.05;
  const url = mono(world, 'https://shop.example/login', 160, 200, 34, { color: C.dim });
  const la = word(world, tr('账号', 'Account'), 160, 290, 30, { color: C.dim, w: 700 }), lA = blk(world, 'bg-ink', 160, 410, 720, 14), ac = mono(world, 'alice', 160, 326, 64, { w: 800 });
  const lp = word(world, tr('密码', 'Password'), 160, 470, 30, { color: C.dim, w: 700 }), lP = blk(world, 'bg-ink', 160, 598, 720, 14);
  const dots = []; for (let i = 0; i < 10; i++) dots.push(shape(world, 'circle', 164 + i * 62, 530, 44, C.red, { name: 'password-char' }));
  [url, la, lA, ac, lp, lP].forEach((e, i) => appear(e, t1 + i / 24)); dots.forEach((d, i) => appear(d, t1 + 0.25 + i / 24));
  const q = word(world, tr('第一次？', 'First time?'), 1040, 300, isZh ? 200 : 150, { w: 900 }); q.dataset.name = 'question';
  const tQ = Math.min(Q(KW('p1', '第一次', 'first time')) - 0.15, T('p1') + 0.3);
  slam(q, tQ, { from: 1.3, d: 0.25 }); sfx('thud', tQ, { g: 0.85 });
  sfx('tick', t1 + 0.25, { g: 0.5 });

  // ── 站 B：单向压模。红圆进去，出来的是墨色方块上的哈希；反过来走不通 ──
  const BX = 2000;
  const tB = Q(T('p2')) - 0.1;
  const pw1 = shape(world, 'circle', BX + 140, 360, 200, C.red, { name: 'password' });
  const mv1 = shape(world, 'circle', BX + 140, 360, 200, C.red, { name: 'password' });
  const pwT = mono(world, P.text, BX + 110, 590, 34, { w: 700 });
  const pr = press(world, BX + 520, 300, 340, 320);
  const prL = word(world, tr('哈希', 'Hash'), BX + 520, 640, 72, { w: 900 });
  const out1 = blk(world, 'bg-ink', BX + 1010, 360, 200, 200); out1.dataset.name = 'hash';
  const hexA = mono(world, P.hash.slice(0, 16) + '<br>' + P.hash.slice(16, 32) + '…', BX + 950, 590, 30, { w: 700 });
  const srv = frame(world, BX + 1360, 300, 460, 320, { bw: 16, label: 'shop.example' });
  const rowL = mono(world, 'alice', BX + 1400, 350, 38, { w: 800 }); css(rowL, { background: C.yel, padding: '0 10px' });
  const rowH = mono(world, P.hash.slice(0, 12) + '…', BX + 1400, 420, 34, { w: 700 }); css(rowH, { background: C.paper, padding: '0 8px' }); rowH.dataset.name = 'stored-hash';
  const arIn = blk(world, 'bh-arrow', BX + 360, 454, 130, 12), arOut = blk(world, 'bh-arrow', BX + 880, 454, 110, 12);
  appear(pw1, tB); appear(mv1, tB); appear(pwT, tB); appear(pr.body.el, tB); appear(pr.plate, tB); appear(prL, tB + 0.1); appear(srv.el, tB); appear(srv.lab, tB); appear(arIn, tB + 0.1); appear(arOut, tB + 0.1);
  const tHash = Math.max(tB + 0.35, Q(KW('p2', '哈希', 'hash')) - 0.35);
  fromTo(mv1, tHash, { x: 0 }, { x: 440, duration: 0.33, ease: STEP(0.33), immediateRender: false });
  pressDown(pr, tHash + 0.33, 120);
  appear(out1, tHash + 0.5); appear(hexA, tHash + 0.55); sfx('blip', tHash + 0.55, { g: 0.6, p: 0.2 });
  vanish(mv1, tHash + 0.34);
  const tStore = tHash + 0.85;
  appear(rowL, tStore); appear(rowH, tStore + 0.08); sfx('tick', tStore, { g: 0.5, p: 0.5 });
  // 反过来：从摘要往回走，撞上一道黑缝
  const tRev = Math.max(tStore + 0.3, Q(KW('p2', '算不回去', 'cannot')) - 0.15);
  const rev = blk(world, 'bh-arrow', BX + 880, 520, 110, 12); css(rev, { transform: 'scaleX(-1)' }); rev.dataset.name = 'reverse';
  const seamR = blk(world, 'bg-ink', BX + 900, 490, 18, 80); seamR.dataset.name = 'one-way';
  appear(rev, tRev); appear(seamR, tRev + 0.17); sfx('error', tRev + 0.17, { g: 0.55, p: 0.2 });
  const noRev = word(world, tr('算不回去', 'Cannot be reversed'), BX + 950, 690, 48, { w: 900 }); wipe(noRev, tRev + 0.2, { dir: 'l', d: 0.25 });
  // p3：你输入的密码照样压一遍，出来同一个哈希，与存着的对齐
  const tIn = Q(KW('p3', '照样', 'same')) - 0.25;
  const pw2 = shape(world, 'circle', BX + 140, 360, 200, C.red, { name: 'password' });
  appear(pw2, tIn - 0.05);
  fromTo(pw2, tIn, { x: 0 }, { x: 440, duration: 0.33, ease: STEP(0.33), immediateRender: false }); to(pw2, tIn + 0.34, { autoAlpha: 0, duration: 0.01 });
  pressDown(pr, tIn + 0.33, 120);
  const out2 = blk(world, 'bg-ink', BX + 1010, 360, 200, 200); out2.dataset.name = 'hash';
  appear(out2, tIn + 0.5);
  const tMatch = Math.max(tIn + 0.9, Q(KW('p3', '一致', 'match')) - 0.1);
  fromTo(out2, tMatch - 0.35, { x: 0, y: 0 }, { x: 620, y: -20, scale: 0.5, duration: 0.33, ease: STEP(0.33), immediateRender: false });
  const ok = stamp(world, tr('一致 · 通过', 'MATCH · IN'), BX + 1400, 500, 44, tMatch, { r: -6, color: C.ink });
  sfx('chime', tMatch + 0.1, { g: 0.7, p: 0.4 });
  // p3b：表被偷走；两台压模并排：快的每秒约 100 万次，慢的每秒约 5 次（实测）
  const tSlow = Q(T('p3b')) - 0.1;
  fade([pw1, pwT, out1, hexA, out2, noRev, rev, seamR, arIn, arOut, prL], tSlow - 0.1);
  const thief = h('div', 'abs', world); px(thief, BX + 1300, 660, 420, 220); thief.dataset.name = 'attacker';
  const th = hatch(thief, 0, 0, 420, 220, C.ink, 22, 7); css(th, { position: 'absolute', left: '0px', top: '0px' });
  const tSteal = Math.max(tSlow + 0.4, Q(KW('p3b', '表被偷了', 'stolen')) - 0.2);
  fromTo(thief, tSteal, { autoAlpha: 0, y: 300 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); fade([ok], tSteal + 0.3);
  fromTo(rowH, tSteal + 0.4, { x: 0, y: 0 }, { x: 10, y: 360, duration: 0.25, ease: STEP(0.25), immediateRender: false }); rowH.dataset.overlapOk = '1';
  sfx('pop', tSteal + 0.4, { g: 0.6, p: 0.4 });
  const pr2 = press(world, BX + 140, 300, 300, 280);
  const fastL = word(world, tr('快的哈希', 'Fast hash'), BX + 140, 640, 40, { w: 900 }), fastN = mono(world, '0', BX + 140, 700, 64, { w: 800 }), fastU = word(world, tr('次 / 秒', 'tries / s'), BX + 140, 780, 32, { color: C.dim, w: 700 });
  const slowL = word(world, tr('故意慢的哈希', 'Slow hash'), BX + 520, 640, 40, { w: 900 }), slowN = mono(world, '0', BX + 520, 700, 64, { w: 800 }), slowU = word(world, tr('次 / 秒', 'tries / s'), BX + 520, 780, 32, { color: C.dim, w: 700 });
  slowL.dataset.name = 'slow-hash';
  const tCmp = tSlow + 0.1;
  [pr2.body.el, pr2.plate, fastL, fastN, fastU, slowL, slowN, slowU].forEach((e, i) => appear(e, tCmp + (i % 4) / 12));
  const tGuess = tCmp + 0.5;   // 计数尽早跑完，终值留在画面上读
  countTo(fastN, 0, P.shaPerSec, tGuess, 1.2, (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, isZh ? ' ' : ','));
  countTo(slowN, 0, Math.round(P.slowPerSec), tGuess, 1.2, (v) => String(Math.round(v)));
  // 慢的那台按实测的节奏一下一下压（约 0.19 秒一次）；快的那台快到看不出起落，顶板一直压着。用 top 偏移，不与压模自己的位移补间相争
  const plTop = parseFloat(pr.plate.style.top), plTop2 = parseFloat(pr2.plate.style.top), tEnd3 = Tend('p3b') + 0.3;
  F((t) => {
    const on = t >= tGuess && t < tEnd3, ph = on ? ((t - tGuess) * P.slowPerSec) % 1 : 1;
    pr.plate.style.top = (plTop + (on && ph < 0.45 ? 120 : 0)) + 'px';
    pr2.plate.style.top = (plTop2 + (on ? 100 : 0)) + 'px';
  });
  for (let k = 0; k < Math.floor((tEnd3 - tGuess) * P.slowPerSec); k++) sfx('tick', tGuess + k / P.slowPerSec, { g: 0.5, p: 0.1 });
  // 镜头在站 B：压模居中；p3b 时拉远看两台

  // ── 站 C：钓鱼。你、假网站、真网站 ──
  const CX = 4000, tC = Q(T('p4')) - 0.1;
  const you = shape(world, 'tri', CX + 120, 380, 240, C.yel, { name: 'you' });
  const fake = h('div', 'abs', world); px(fake, CX + 700, 300, 380, 380); css(fake, { border: `14px dashed ${C.ink}`, boxSizing: 'border-box', overflow: 'hidden' }); fake.dataset.name = 'fake-site';
  const fh = hatch(fake, 0, 0, 380, 380, C.dimp, 26, 4); css(fh, { position: 'absolute', left: '0px', top: '0px' });
  const fakeL = mono(world, 'sh0p.example', CX + 700, 250, 34, { w: 800 });
  const real = frame(world, CX + 1400, 300, 380, 380, { bw: 18, label: 'shop.example' });
  [you, fake, fakeL, real.el, real.lab].forEach((e, i) => appear(e, tC + i / 12)); sfx('thud', tC + 0.2, { g: 0.6 });
  const know = shape(world, 'circle', CX + 380, 430, 120, C.red, { name: 'password' });
  const knowL = word(world, tr('知道', 'Know'), CX + 390, 570, 48, { w: 900 });
  const tKnow = Math.max(tC + 0.3, Q(KW('p4', '秘密', 'secret')) - 0.2);
  appear(know, tKnow); wipe(knowL, tKnow + 0.1, { dir: 'l', d: 0.2 }); sfx('pop', tKnow, { g: 0.6, p: -0.4 });
  const tFake = Math.max(tKnow + 0.5, Q(KW('p4', '假网站', 'fake')) - 0.1);
  fromTo(know, tFake, { x: 0, y: 0 }, { x: 450, y: 0, duration: 0.33, ease: STEP(0.33), immediateRender: false });
  fromTo(know, tFake + 0.5, { x: 450 }, { x: 1150, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  const pass1 = word(world, '= alice', CX + 1440, 720, 52, { w: 900 }); css(pass1, { background: C.yel, padding: '0 12px' });
  appear(pass1, tFake + 0.95); sfx('error', tFake + 0.95, { g: 0.7, p: 0.5 });
  const fish = word(world, tr('钓鱼', 'Phishing'), CX + 700, 760, 96, { w: 900 }); fish.dataset.name = 'phishing';
  const tFish = Math.max(tFake + 1.0, Q(KW('p4', '钓鱼', 'phishing')) - 0.15); slam(fish, tFish, { from: 1.3, d: 0.25 }); sfx('thud', tFish, { g: 0.85 });
  // p5：短信码：蓝方（手机）收到一串数字，标「有」；假网站同样转走
  const tS5 = Q(T('p5')) - 0.1;
  fade([know, knowL, pass1], tS5 + 0.3);
  const phone = shape(world, 'square', CX + 360, 400, 170, C.blue, { name: 'phone' });
  const code = mono(world, DATA.sms, CX + 372, 460, 40, { color: C.paper, w: 800 });
  const haveL = word(world, tr('有', 'Have'), CX + 400, 590, 48, { w: 900 });
  const tPh = Math.max(tS5 + 0.1, Q(KW('p5', '短信码', 'SMS')) - 0.15);
  appear(phone, tPh); appear(code, tPh + 0.2); wipe(haveL, Math.max(tPh + 0.3, Q(KW('p5', '号码', 'phone')) - 0.1), { dir: 'l', d: 0.2 }); sfx('pop', tPh + 0.2, { g: 0.6, p: -0.4 });
  const codeFly = mono(world, DATA.sms, CX + 372, 460, 40, { w: 800 }); css(codeFly, { background: C.paper, padding: '0 8px' }); codeFly.dataset.overlapOk = '1';
  const tRelay = Math.max(tPh + 0.8, Q(KW('p5', '转走', 'relay')) - 0.5);
  appear(codeFly, tRelay);
  fromTo(codeFly, tRelay, { x: 0 }, { x: 460, duration: 0.33, ease: STEP(0.33), immediateRender: false });
  fromTo(codeFly, tRelay + 0.45, { x: 460 }, { x: 1110, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  const pass2 = word(world, '= alice', CX + 1440, 720, 52, { w: 900 }); css(pass2, { background: C.yel, padding: '0 12px' });
  appear(pass2, tRelay + 0.9); sfx('error', tRelay + 0.9, { g: 0.7, p: 0.5 });

  // ── 站 D：passkey。设备（蓝方）里一把带齿的红钥匙（私钥）；一块黑色锁块（公钥）送进服务器 ──
  const DX = 6000, tD = Q(T('p6')) - 0.1, TEETH = [0.3, 0.9, 0.5, 1, 0.2];
  fade([you, fake, fakeL, real.el, real.lab, phone, code, codeFly, pass2, fish, haveL], tD + 0.6);
  const title = word(world, 'passkey', DX + 140, 120, 110, { w: 900 }); const titleZ = word(world, tr('通行密钥', 'a key pair'), DX + 140 + 440, 166, 52, { color: C.dim, w: 800 });
  const dev = shape(world, 'square', DX + 140, 330, 380, C.blue, { name: 'device' });
  const devL = word(world, tr('你的设备', 'Your device'), DX + 140, 730, 40, { w: 900 });
  const key = keyShape(world, DX + 200, 470, 260, 110, TEETH, C.red);
  const keyL = word(world, tr('私钥', 'Private key'), DX + 200, 600, 40, { color: C.paper, w: 900 });
  const sv = frame(world, DX + 1240, 300, 520, 460, { bw: 18, label: 'shop.example' });
  const lock = lockShape(world, DX + 200, 360, 260, 110, TEETH, C.ink); lock.style.zIndex = 3;
  const lockL = word(world, tr('公钥', 'Public key'), DX + 1480, 560, 40, { w: 900 });
  const tPair = Math.max(tD + 0.2, Q(KW('p6', '一对儿', 'key pair')) - 0.15);
  slam(title, tD, { from: 1.3, d: 0.25 }); wipe(titleZ, tD + 0.2, { dir: 'l', d: 0.25 }); sfx('thud', tD, { g: 0.8 });
  appear(dev, tD + 0.1); appear(devL, tD + 0.15); appear(sv.el, tD + 0.1); appear(sv.lab, tD + 0.1);
  appear(key, tPair); appear(lock, tPair); appear(keyL, tPair + 0.1); sfx('pop', tPair, { g: 0.7, p: -0.4 });
  const tPub = Math.max(tPair + 0.5, Q(KW('p6', '公钥', 'public')) - 0.25);
  fromTo(lock, tPub, { x: 0, y: 0 }, { x: 1280, y: 260, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  wipe(lockL, tPub + 0.45, { dir: 'l', d: 0.2 }); sfx('thud', tPub + 0.42, { g: 0.7, p: 0.5 });
  // p7：服务器送来一张写着随机数的纸条，落在设备右边；黄三角碰一下设备，纸条上印出红钥匙的形状（签名）
  const card = h('div', 'abs', world); px(card, DX + 620, 360, 470, 250); css(card, { background: C.white, border: `5px solid ${C.ink}`, boxSizing: 'border-box' }); card.dataset.name = 'challenge';
  const chal = mono(card, K.challenge.slice(0, 20) + '…', 22, 18, 30, { w: 700 }); chal.style.position = 'absolute';
  const chalL = word(card, tr('随机数', 'Challenge'), 22, 64, 30, { color: C.dim, w: 800 }); chalL.style.position = 'absolute';
  const mark = keyShape(card, 30, 120, 260, 110, TEETH, C.red); mark.style.position = 'absolute'; mark.dataset.name = 'signature';
  const sigL = word(card, tr('签名', 'Signature'), 300, 164, isZh ? 40 : 30, { w: 900 }); sigL.style.position = 'absolute';
  const tSlip = Q(T('p7')) - 0.05;
  fromTo(card, tSlip, { autoAlpha: 0, x: 620 }, { autoAlpha: 1, x: 0, duration: 0.42, ease: STEP(0.42) }); sfx('tick', tSlip, { g: 0.6, p: 0.5 });
  const finger = shape(world, 'tri', DX + 440, 640, 130, C.yel, { name: 'you' });
  const tTouch = Math.max(tSlip + 0.6, Q(KW('p7', '指纹', 'sensor')) - 0.2);
  fromTo(finger, tTouch, { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: STEP(0.25) }); sfx('tick', tTouch + 0.25, { g: 0.6 });
  const tSig = Math.max(tTouch + 0.45, Q(KW('p7', '签名', 'signs')) - 0.15);
  fromTo(key, tSig, { x: 0 }, { keyframes: [{ x: 60, duration: 0.17, ease: STEP(0.17) }, { x: 0, duration: 0.25, ease: STEP(0.25) }], immediateRender: false });
  appear(mark, tSig + 0.17); appear(sigL, tSig + 0.25); sfx('thud', tSig + 0.17, { g: 0.8 });
  // p7b：整张纸条送进服务器，锁块落到印子上，拼缝对上
  const tBack = Q(T('p7b')) - 0.05;
  fromTo(card, tBack, { x: 0 }, { x: 650, duration: 0.42, ease: STEP(0.42), immediateRender: false });
  const tFit = Math.max(tBack + 0.6, Q(KW('p7b', '公钥', 'public')) - 0.1);
  fromTo(lock, tFit, { x: 1280, y: 260 }, { keyframes: [{ x: 1105, y: -40, duration: 0.17, ease: STEP(0.17) }, { y: 125, duration: 0.25, ease: STEP(0.25) }], immediateRender: false });
  sfx('thud', tFit + 0.42, { g: 0.75, p: 0.5 });
  const fit = stamp(world, tr('是你', "IT'S YOU"), DX + 1290, 640, 56, Math.max(tFit + 0.45, Q(KW('p7b', '是你', 'you')) - 0.1), { r: -6, color: C.ink });
  sfx('chime', tFit + 0.45, { g: 0.7, p: 0.5 });
  // p8：钥匙只给注册它的网站签名；假网站也送来纸条，钥匙转 90° 对不上，什么也拿不到
  const tP8 = Q(T('p8')) - 0.1;
  const bound = mono(world, 'shop.example', DX + 200, 372, 30, { color: C.paper, w: 800 }); bound.dataset.name = 'rp-id';
  wipe(bound, Math.max(tP8 + 0.1, Q(KW('p8', '注册', 'own site')) - 0.1), { dir: 'l', d: 0.2 });
  const fake2 = h('div', 'abs', world); px(fake2, DX + 1240, 300, 520, 460); css(fake2, { border: `14px dashed ${C.ink}`, boxSizing: 'border-box', overflow: 'hidden', background: C.paper }); fake2.dataset.name = 'fake-site';
  const fh2 = hatch(fake2, 0, 0, 520, 460, C.dimp, 26, 4); css(fh2, { position: 'absolute', left: '0px', top: '0px' });
  const fake2L = mono(world, 'sh0p.example', DX + 1240, 300 - 44, 34, { w: 800 });
  const tFk = Math.max(tP8 + 0.3, Q(KW('p8', '假网站', 'fakes')) - 0.3);
  fade([fit, card, lock, lockL, sv.lab], tFk - 0.05);
  fromTo(fake2, tFk, { autoAlpha: 0, x: 220 }, { autoAlpha: 1, x: 0, duration: 0.25, ease: STEP(0.25) }); appear(fake2L, tFk + 0.25);
  reject(key, tFk + 0.5, { r: 90, p: -0.3 });
  const nothing = word(world, tr('拿不到能用的签名', 'Gets nothing usable'), DX + 1260, 800, 48, { w: 900 }); wipe(nothing, tFk + 0.4, { dir: 'l', d: 0.25 });
  // ── 站 E：验证码。方片滑进缺口（人）；斜线块卡住（程序）；不证明你是谁 ──
  const EX = 8000, tE = Q(T('p9')) - 0.1;
  const panel = blk(world, 'bg-white', EX + 140, 260, 760, 420); css(panel, { border: `6px solid ${C.ink}`, boxSizing: 'border-box' }); panel.dataset.name = 'captcha';
  const notch = h('div', 'abs', world); px(notch, EX + 640, 360, 150, 150); css(notch, { border: `8px dashed ${C.ink}`, boxSizing: 'border-box' });
  const piece = blk(world, 'bg-ink', EX + 200, 360, 150, 150); piece.dataset.name = 'slider-piece';
  const track = blk(world, 'bg-ink', EX + 200, 580, 600, 10);
  const knob = blk(world, 'bg-ink', EX + 200, 560, 50, 50);
  const capL = word(world, tr('选图片、拖滑块', 'Pick images, drag sliders'), EX + 140, 180, 44, { w: 900 });
  [panel, notch, piece, track, knob, capL].forEach((e, i) => appear(e, tE + i / 24)); sfx('pop', tE, { g: 0.5 });
  const tSlide = Math.max(tE + 0.4, Q(KW('p9', '验证码', 'sliders')) - 0.1);
  fromTo(piece, tSlide, { x: 0 }, { x: 440, duration: 0.5, ease: STEP(0.5), immediateRender: false });
  fromTo(knob, tSlide, { x: 0 }, { x: 440, duration: 0.5, ease: STEP(0.5), immediateRender: false });
  sfx('tick', tSlide + 0.5, { g: 0.6 });
  const human = word(world, tr('人', 'Person'), EX + 1020, 300, 72, { w: 900 }), bot = word(world, tr('程序', 'Program'), EX + 1020, 470, 72, { w: 900 });
  const botBlk = h('div', 'abs', world); px(botBlk, EX + 1300, 460, 260, 100); const bh = hatch(botBlk, 0, 0, 260, 100, C.ink, 18, 6); css(bh, { position: 'absolute', left: '0px', top: '0px' }); botBlk.dataset.name = 'program';
  const tHP = Math.max(tSlide + 0.5, Q(KW('p9', '人和程序', 'people')) - 0.15);
  slam(human, tHP, { from: 1.3, d: 0.25 }); slam(bot, tHP + 0.2, { from: 1.3, d: 0.25 }); appear(botBlk, tHP + 0.2); sfx('thud', tHP, { g: 0.7 });
  reject(botBlk, tHP + 0.45, { r: 90, g: 0.6 });
  const notWho = word(world, tr('不证明你是谁', 'Not who you are'), EX + 1020, 680, 64, { w: 900 }); css(notWho, { background: C.yel, padding: '0 14px' });
  const tNW = Math.max(tHP + 0.6, Q(KW('p9', '不证明', 'not who')) - 0.15); slam(notWho, tNW, { from: 1.3, d: 0.25 }); sfx('pop', tNW, { g: 0.7 });

  // ── 镜头 ──
  const A = { x: 960, y: 470, z: 1 }, B = { x: BX + 960, y: 480, z: 0.98 }, C3 = { x: CX + 960, y: 520, z: 0.98 }, D = { x: DX + 960, y: 500, z: 0.98 }, E = { x: EX + 960, y: 470, z: 1 };
  cam.track(s.start, { ...A, z: 0.97 }, [
    [c0 + 0.05, { z: 1 }, 0.5, { sfx: false }],
    [c0 + 0.6, { z: 1.03 }, Math.max(0.4, tB - c0 - 0.9), { ease: 'none', sfx: false }],
    [tB - 0.25, B, 0.85, { sfx: false }],
    [tB + 0.65, { z: 1.0 }, Math.max(0.4, tC - tB - 0.95), { ease: 'none', sfx: false }],
    [tC - 0.25, C3, 0.85, { sfx: false }],
    [tC + 0.65, { z: 1.0 }, Math.max(0.4, tD - tC - 0.95), { ease: 'none', sfx: false }],
    [tD - 0.25, D, 0.85, { sfx: false }],
    [tD + 0.65, { z: 1.0 }, Math.max(0.4, tE - tD - 0.1), { ease: 'none', sfx: false }],
    [tE + 0.7, E, 0.85, { sfx: false }],
    [tE + 1.6, { z: 1.03 }, Math.max(0.4, s.end - tE - 1.65), { ease: 'none', sfx: false }],
  ]);
});
