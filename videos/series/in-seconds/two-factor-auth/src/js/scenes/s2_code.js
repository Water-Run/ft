// 第 3 个时间步（60–90 秒）：密钥 + 计数器 → HMAC-SHA-1 → 20 个字节 → 动态截取 → 6 位验证码；服务器同算一遍，两边一致。
// 站 A：两个输入与 HMAC；站 B：20 个字节与截取；站 C（B 的下方）：4 个字节 → 31 位整数 → 末 6 位；站 D：左墨右纸，手机与服务器对开。
// 画面上的每个数都取自 DATA.windows[2]（这 30 秒的真实结果）。
scene('code', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const W = DATA.windows[2], XR = 2100, P = 86, XD = 5400;
  console.assert(W.code === CODES[2] && W.hs.length === 20 && W.offset === parseInt(W.last[1], 16));

  // ── 站 A：密钥和计数器，一起送进 HMAC ──
  txt(world, 't-4', tr('密钥', 'Secret key'), 120, 150);
  const keyCells = byteCells(world, DATA.key, { x: 116, y: 214, pitch: 80, w: 72, h: 62, rowGap: 70, size: 44, cols: 10 });
  txt(world, 't-4', tr('计数器', 'Counter'), 120, 452);
  const ctr = txt(world, 'num', String(W.counter), 112, 516); ctr.style.fontSize = '120px';
  const ctrB = txt(world, 'mono t-n dim', W.msg.join(' ') + tr('　8 个字节', '   8 bytes'), 120, 664);
  slam(ctr, s.start + 0.12, { from: 1.3, d: 0.35 });
  keyCells.forEach((c, i) => { slide(c, s.start + 0.2 + (i % 10) * 0.03, { y: i < 10 ? -30 : 30, d: 0.3 }); });
  wipe(ctrB, s.start + 0.6, { dir: 'l', d: 0.35 });
  const box = h('div', 'abs bg-ac ink', world); px(box, 1300, 230, 420, 420);
  const bh = txt(box, 'ink', 'HMAC', 0, 86); css(bh, { width: '420px', textAlign: 'center', font: '900 124px "Inter"', letterSpacing: '-.03em', lineHeight: '1' });
  const bs = txt(box, 'mono ink', 'SHA-1', 0, 226); css(bs, { width: '420px', textAlign: 'center', fontSize: '60px', fontWeight: 700 });
  const bn = txt(box, 't-n ink', 'RFC 2104 · 1997', 0, 344); css(bn, { width: '420px', textAlign: 'center' });
  const ovA = overlay(world);
  const la = path(ovA, 'M930,284 L1110,284 L1110,360 L1284,360', 'paper', { w: 6 }), lb = path(ovA, 'M700,580 L1110,580 L1110,520 L1284,520', 'paper', { w: 6 });
  const tBox = Q(T('c1', 'HMAC')), tIn = Qf(T('c1', { zh: '送进', en: 'go into' }));
  wipe(box, s.start + 0.3, { dir: 'b', d: 0.45 });
  arrowIn(la, tIn - 0.35, 0.4); arrowIn(lb, tIn - 0.25, 0.4); sfx('blip', tIn - 0.35, { g: 0.6 });
  // 两个输入各化成一个方块，沿线送进去
  [[930, 262, 'M0,0 L180,0 L180,76 L340,76'], [700, 558, 'M0,0 L410,0 L410,-60 L570,-60']].forEach(([x, y], i) => {
    const pk = blk(world, 'bg-paper', x, y, 44, 44), t0 = tIn + i * 0.125;
    const pts = i === 0 ? [[0, 0], [180, 0], [180, 76], [340, 76]] : [[0, 0], [410, 0], [410, -60], [570, -60]];
    appear(pk, t0); fromTo(pk, t0, { x: 0, y: 0 }, { keyframes: pts.slice(1).map(([px_, py_]) => ({ x: px_, y: py_, ease: 'none' })), duration: 0.5, ease: 'power1.in' });
    vanish(pk, t0 + 0.5); sfx('tick', t0, { g: 0.8, p: -0.2 });
  });
  fromTo(box, tIn + 0.6, { scale: 1 }, { keyframes: [{ scale: 1.09, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }] });
  sfx('thud', tIn + 0.6, { p: 0.3 });

  // ── 站 B：得到 20 个字节 ──
  const head = txt(world, 't-3', tr('HMAC-SHA-1 的输出：20 个字节', 'HMAC-SHA-1 output: 20 bytes'), XR, 150);
  const cells = byteCells(world, W.hs, { x: XR, y: 330, pitch: P, w: 78, h: 104, size: 50, idx: true, idxSize: 28 });
  const tOutB = Qf(T('c2')) + 0.1;
  wipe(head, tOutB - 0.1, { dir: 'l', d: 0.4 });
  cells.forEach((c, i) => { slide(c, tOutB + i * 0.045, { x: -70, d: 0.3, ease: 'power3.out' }); appear(cells.idx[i], tOutB + i * 0.045 + 0.1); if (i % 2 === 0) sfx('tick', tOutB + i * 0.045, { g: 0.7, p: -0.6 + i * 0.06 }); });
  blk(world, 'bg-paper', XR, 440, 20 * P - 8, 4);
  // 最后一个字节的低 4 位
  const tLast = Q(T('c3', { zh: '最后', en: 'last' })), tLow = Q(T('c3', { zh: '低', en: 'low' })), tPoint = Q(T('c3', { zh: '指出', en: 'say' })), tTake = Q(T('c3', { zh: '取', en: 'take' }));
  const lastBar = blk(world, 'bg-ac', XR + 19 * P, 440, 78, 12);
  fromTo(lastBar, tLast, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out' }); sfx('pop', tLast, { p: 0.6 });
  const LX = XR + 19 * P + 78;                                                  // 细节右对齐到最后一格的右缘
  const bigA = txt(world, 'num', W.last[0], LX - 2 * 108, 486), bigB = txt(world, 'num', W.last[1], LX - 108, 486);
  for (const e of [bigA, bigB]) css(e, { fontSize: '180px', width: '108px', textAlign: 'center' });
  slam(bigA, tLast + 0.2, { from: 1.4, d: 0.3 }); slam(bigB, tLast + 0.26, { from: 1.4, d: 0.3 });
  const lbits = bitCells(world, W.lastBits, { x: LX - 8 * 44 - 28 + 4, y: 700, s: 40, gap: 4, group: 0, color: C.paper });
  lbits.forEach((b, i) => { if (i >= 4) b.style.marginLeft = '28px'; wipe(b, tLast + 0.45 + i * 0.04, { dir: 't', d: 0.2 }); });
  const lowB = bitCells(world, W.lastBits.slice(4), { x: LX - 4 * 44 + 4, y: 700, s: 40, gap: 4, color: C.ac });
  lowB.forEach((b, i) => { appear(b, tLow + i * 0.05); vanish(lbits[4 + i], tLow + i * 0.05); });
  classAt(bigB, 'ac', tLow); sfx('blip', tLow, { p: 0.6 });
  wipeOut(head, tLast - 0.4, { dir: 'l', d: 0.3 });
  const lowL = txt(world, 't-3', tr(`低 4 位 = <span class="ac">${W.offset}</span>`, `low 4 bits = <span class="ac">${W.offset}</span>`), 0, 688); css(lowL, { left: 'auto', right: (1920 - (LX - 8 * 44 - 28 - 40)) + 'px' });
  wipe(lowL, tLow + 0.2, { dir: 'r', d: 0.35 });
  // 指出从哪里取：一个朱红的记号沿序号走到第 offset 格，从那里起的 4 个字节被选中
  const ptr = svg('svg', { class: 'abs', width: 44, height: 30, viewBox: '0 0 44 30' }, world); svg('path', { d: 'M2,2 L42,2 L22,28 Z', fill: C.ac }, ptr); ptr.dataset.name = 'pointer';
  px(ptr, XR + 19 * P + 17, 238);
  slam(ptr, tPoint - 0.2, { from: 1.6, d: 0.2 }); fromTo(ptr, tPoint, { x: 0 }, { x: -(19 - W.offset) * P, duration: 0.75, ease: 'power2.inOut' });
  for (let i = 18; i >= W.offset; i--) if ((19 - i) % 3 === 0) sfx('tick', tPoint + 0.75 * (19 - i) / (19 - W.offset), { g: 0.5, p: 0.5 - (19 - i) * 0.05 });
  for (let j = 0; j < 4; j++) { const i = W.offset + j, tt = tTake + j * 0.125; classAt(cells[i], 'sel', tt); classAt(cells.idx[i], 'on', j === 0 ? Math.min(tt, tPoint + 0.75) : tt); sfx('pop', tt, { g: 0.8, p: -0.2 + j * 0.1 }); }   // 同一个元素的同一个类名只登记一次

  // ── 站 C：去掉最高位，读成整数，留下末 6 位 ──
  const BX = XR, BY = 500, BP = 250;
  const tDown = Tend('c3') + 0.1, tTop = Q(T('c4', { zh: '最高位', en: 'top bit' })), tInt = Q(T('c4', { zh: '读成', en: 'read' })), tKeep = Q(T('c4', { zh: '留下', en: 'keep' }));
  [bigA, bigB, lowL, ...lbits.slice(0, 4), ...lowB].forEach((e) => exit(e, tDown, { y: 0, x: 60, d: 0.25 }));      // 末字节的细节让出位置
  const bigs = W.p.map((b, j) => { const e = txt(world, 'num', b, BX + j * BP, BY); e.style.fontSize = '150px'; slam(e, tDown + 0.15 + j * 0.0625, { from: 1.4, d: 0.3 }); return e; });
  sfx('thud', tDown + 0.15, { g: 0.7, p: -0.3 });
  keyed(bigs[0]).at(tTop + 0.15, { html: `<span class="ac">${W.masked[0]}</span>${W.masked[1]}` });
  const bits = bitCells(world, W.bits, { x: BX + 4, y: BY + 176, s: 20, gap: 4, group: BP - 8 * 24, color: C.paper, bw: 3 });
  bits.forEach((b, i) => wipe(b, tDown + 0.4 + i * 0.012, { dir: 't', d: 0.18 }));
  const hollow = blk(world, '', BX + 4, BY + 176, 20, 20); css(hollow, { border: `3px solid ${C.ac}` });
  fromTo(bits[0], tTop, { scale: 1 }, { scale: 0, duration: 0.15, ease: 'power2.in' }); appear(hollow, tTop + 0.15); sfx('error', tTop, { g: 0.5, p: -0.4 });
  const topL = txt(world, 't-n', tr('最高位 → 0', 'top bit → 0'), BX, BY + 214);
  wipe(topL, tTop + 0.1, { dir: 'l', d: 0.3 });
  const SN = String(W.snum), cut = SN.length - 6, IY = BY + 280;
  const eqs = txt(world, 'num dim', '=', BX, IY); eqs.style.fontSize = '150px';
  const hi = txt(world, 'num', SN.slice(0, cut), BX + 150, IY), lo = txt(world, 'num', SN.slice(cut), BX + 150 + cut * 90, IY);
  for (const e of [hi, lo]) e.style.fontSize = '150px';
  wipe(eqs, tInt, { dir: 'l', d: 0.2 }); wipe(hi, tInt + 0.05, { dir: 'l', d: 0.3 }); wipe(lo, tInt + 0.2, { dir: 'l', d: 0.35 }); sfx('whoosh', tInt, { g: 0.5, p: -0.2 });
  classAt(hi, 'dim', tKeep); classAt(lo, 'ac', tKeep + 0.125); sfx('pop', tKeep + 0.125, { p: 0.1 });
  const keepL = txt(world, 't-n', tr('对 1 000 000 取余：末 6 位', 'mod 1 000 000: the last six digits'), BX + 150 + SN.length * 90 + 40, IY + 92);
  wipe(keepL, tKeep + 0.2, { dir: 'l', d: 0.3 });
  // 这就是验证码：与右上角此刻的那一个相同
  const tCode = Q(T('c5', { zh: '验证码', en: 'code' }));
  const isL = txt(world, 't-2 ink bg-ac', tr('验证码', 'the code'), BX + 150 + SN.length * 90 + 40, IY - 40); css(isL, { padding: '4px 26px 12px' });
  slam(isL, tCode, { from: 1.35, d: 0.3 }); sfx('chime', tCode, { p: 0.2 });
  fromTo(HUD.code.el, tCode + 0.05, { scale: 1 }, { keyframes: [{ scale: 1.35, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }], transformOrigin: '50% 50%' });

  // ── 站 D：服务器用同一个密钥、同一个时间，再算一遍 ──
  blk(world, 'bg-paper', XD + 960, -400, 1500, 1800);
  const tD = Tend('c5') + 0.1;
  const tSK = Q(T('c6', { zh: '密钥', en: 'key' })), tST = Q(T('c6', { zh: '时间', en: 'time' })), tSC = Q(T('c6', { zh: '再算', en: 'computes' }));
  const side = (x0, ink, phone) => {
    const col = ink ? ' ink' : '', dimc = ink ? ' dimp' : ' dim', o = {};
    o.name = txt(world, 't-2' + col, phone ? tr('手机', 'Phone') : tr('服务器', 'Server'), x0 + 80, 130);
    o.kl = txt(world, 't-n' + dimc, tr('密钥', 'secret key'), x0 + 86, 268);
    o.key = byteCells(world, DATA.key, { x: x0 + 82, y: 312, pitch: 80, w: 72, h: 50, rowGap: 54, size: 36, cols: 10, cls: ink ? 'ink' : '' });
    o.kbar = blk(world, 'bg-ac', x0 + 82, 424, 792, 10);
    o.tl = txt(world, 't-n' + dimc, tr('时间 ÷ 30', 'time ÷ 30'), x0 + 86, 462);
    o.tv = txt(world, 'num' + col, group3(W.counter), x0 + 80, 504); o.tv.style.fontSize = '64px';
    o.code = makeCode(world, { size: 166, x: x0 + 76, y: 642, color: ink ? C.ink : C.paper });
    o.dialG = h('div', 'abs', world); px(o.dialG, 0, 0); o.dx = x0 + 826; o.dy = 726;
    makeDial(o.dialG, { x: o.dx, y: o.dy, r: 78, sw: 4, color: ink ? C.ink : C.paper });
    return o;
  };
  const ph = side(XD, false, true), sv = side(XD + 960, true, false);
  // 手机一侧在镜头到站时已经在那里；服务器一侧随旁白逐行出现
  wipe(sv.name, tD + 0.5, { dir: 'l', d: 0.35 });
  wipe(sv.kl, tSK - 0.1, { dir: 'l', d: 0.25 }); sv.key.forEach((c, i) => appear(c, tSK + i * 0.018)); sfx('blip', tSK, { g: 0.7, p: 0.5 });
  wipe(sv.tl, tST - 0.1, { dir: 'l', d: 0.25 }); wipe(sv.tv, tST, { dir: 'l', d: 0.3 }); sfx('blip', tST, { g: 0.7, p: 0.5 });
  fromTo(sv.dialG, tST + 0.1, { autoAlpha: 0, scale: 0.6, rotation: -40 }, { autoAlpha: 1, scale: 1, rotation: 0, transformOrigin: `${sv.dx}px ${sv.dy}px`, duration: 0.45, ease: 'back.out(1.6)' });
  sv.code.cells.forEach((c, i) => { slam(c, tSC + i * 0.0625, { from: 1.5, d: 0.28 }); sfx('tick', tSC + i * 0.0625, { g: 0.7, p: 0.5 }); });
  // 结果一致，登录通过
  const tEq = Q(T('c7', { zh: '一致', en: 'match' })), tPass = Q(T('c7', { zh: '通过', en: 'succeeds' }));
  [692, 738].forEach((y, i) => { const b = blk(world, 'bg-ac', XD + 916, y, 88, 22); fromTo(b, tEq + i * 0.0625, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'back.out(2)' }); });
  sfx('pop', tEq, { g: 0.9 });
  const pass = txt(world, 't-2 ink bg-ac', tr('登录通过', 'Signed in'), XD + 960, 832); css(pass, { padding: '2px 34px 12px' });
  const passW = h('div', 'abs', world); px(passW, XD + 460, 832, 1000, 130); css(passW, { display: 'flex', justifyContent: 'center' }); passW.appendChild(pass); css(pass, { position: 'static' });
  slam(pass, tPass, { from: 1.4, d: 0.32 }); sfx('chime', tPass);
  // 手机和服务器无需通信：只靠同一个密钥、同一个时钟
  const tWall = Qf(T('c8')), tK2 = Q(T('c8', { zh: '密钥', en: 'same key' })), tClock = Q(T('c8', { zh: '时钟', en: 'clock' }));
  const wall = blk(world, 'bg-ac', XD + 956, 100, 8, 510);
  wipe(wall, tWall, { dir: 't', d: 0.45 }); sfx('whoosh', tWall, { g: 0.5 });
  const noL = txt(world, 't-4 ink bg-ac', tr('无需通信', 'no link needed'), 0, 110); css(noL, { padding: '4px 20px 8px' });
  const noW = h('div', 'abs', world); px(noW, XD + 660, 34, 600, 70); css(noW, { display: 'flex', justifyContent: 'center' }); noW.appendChild(noL); css(noL, { position: 'static' });
  slam(noL, tWall + 0.3, { from: 1.3, d: 0.3 });
  [ph, sv].forEach((o, i) => {
    fromTo(o.kbar, tK2 + i * 0.125, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' }); sfx('pop', tK2 + i * 0.125, { g: 0.8, p: -0.5 + i });
    fromTo(o.dialG, tClock + i * 0.125, { scale: 1 }, { keyframes: [{ scale: 1.3, duration: 0.12, ease: 'power2.out' }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }], transformOrigin: `${o.dx}px ${o.dy}px`, immediateRender: false });
    sfx('thud', tClock + i * 0.125, { g: 0.7, p: -0.5 + i });
  });
  sfx('riser', s.end - 1.25, { g: 0.8 });
  hudGround('R', tD + 0.45, s.end + SWEEP, 'paper');

  // ── 镜头 ──
  const tB = Tend('c1') + 0.05, cxB = XR + 10 * P - 4;
  cam.track(s.start, { x: 960, y: 444, z: 1.04 }, [
    [s.start + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [s.start + 1.0, { z: 1.03 }, tB - s.start - 1.1, { ease: 'none', sfx: false }],
    [tB, { x: cxB, y: 484, z: 1 }, 0.8],
    [null, { z: 1.02 }, tLast - tB - 1.3, { ease: 'none', sfx: false }],
    [tLast - 0.3, { x: XR + 16.2 * P, y: 560, z: 1.3 }, 0.8, { g: 0.4 }],
    [tPoint - 0.1, { x: cxB, y: 484, z: 1 }, 0.9, { g: 0.4 }],
    [tDown, { y: 590 }, 0.7, { g: 0.5 }],
    [null, { z: 1.03 }, tD - tDown - 0.95, { ease: 'none', sfx: false }],
    [tD, { x: XD + 960, y: 484, z: 1 }, 0.9],
    [null, { z: 1.025 }, s.end - tD - 1.1, { ease: 'none', sfx: false }],
  ]);
});
