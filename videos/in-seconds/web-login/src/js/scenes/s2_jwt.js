// JWT：多台服务器共用一张会话表 → 不查表，把你是谁写进一张票、由服务器签名 → 真实的三段 JWT → 内容只是编码、谁都能读；改一个字签名就对不上 →
// 各台服务器只验签名与有效期就认出你 → 代价：票发出去收不回 → 有效期设短，过期用长期票换 → 短的叫 Access Token，长的叫 Refresh Token。
// 站 A：六台服务器围着一张表（j1），之后回到这里各自验票（j5）；站 B：签名的票与三段 JWT、解码与改字（j2–j4）；站 D：收不回与短票长票（j6–j7b）。
// 令牌、改字后的应得签名都来自 research/lab/01_lab.js 的实算（DATA.jwt）。
scene('jwt', ({ root, s, c0 }) => {
  const world = h('div', 'world', root); css(world, { width: '8200px', height: '1600px' });
  const cam = makeCamera(world, 1920, VH);
  const isZh = zh(), J = DATA.jwt;
  const KW = (id, zhw, enw) => T(id, { zh: zhw, en: enw });

  // ── 站 A：六台服务器、一张会话表 ──
  const tbl = blk(world, 'bg-paper', 760, 330, 400, 300); css(tbl, { border: `6px solid ${C.ink}`, boxSizing: 'border-box' }); tbl.dataset.name = 'session-table';
  const tblRows = [0, 1, 2, 3].map((i) => blk(world, i === 2 ? 'bg-blue' : 'bg-ink', 790, 360 + i * 62, 340, 34));
  const tblL = word(world, tr('一张会话表', 'One session table'), 760, 660, 40, { w: 900 });
  const SV = [[120, 150], [120, 400], [120, 650], [1610, 150], [1610, 400], [1610, 650]];
  const servers = SV.map(([x, y]) => frame(world, x, y, 190, 190, { bw: 14 }));
  const ov = svg('svg', { class: 'abs', width: 1920, height: 1100, viewBox: '0 0 1920 1100' }, world); px(ov, 0, 0);
  const lines = SV.map(([x, y], i) => {
    const left = i < 3, x1 = left ? x + 190 : x, y1 = y + 95, x2 = left ? 760 : 1160, y2 = 480;
    const p = svg('path', { d: `M${x1},${y1} L${x2},${y2}`, stroke: C.ink, 'stroke-width': 10, fill: 'none' }, ov); p.dataset.name = 'lookup-line';
    return { p, x1, y1, x2, y2 };
  });
  const tA = c0 + 0.05;
  servers.forEach((sv, i) => fromTo(sv.el, tA + i * 1 / 12, { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1, duration: 0.17, ease: 'steps(2)' }));
  appear(tbl, tA); tblRows.forEach((e, i) => appear(e, tA + 0.1 + i / 12)); wipe(tblL, tA + 0.2, { dir: 'l', d: 0.25 });
  sfx('thud', tA + 0.1, { g: 0.6 });
  const tLines = Q(KW('j1', '很多台', 'many')) - 0.1;
  lines.forEach((l, i) => { draw(l.p, tLines + i * 0.08, 0.33, { ease: STEP(0.33) }); if (i % 2 === 0) sfx('tick', tLines + i * 0.08, { g: 0.5, p: i < 3 ? -0.5 : 0.5 }); });
  // 查询在线上来回：每条线上一个小黑块，按 12 帧/秒往返，到表时那一行闪一下
  const tQ0 = tLines + 0.6, tQ1 = Tend('j1') + 0.25;
  const pkts = lines.map(() => { const e = blk(world, 'bg-ink', 0, 0, 22, 22); e.dataset.name = 'query'; return e; });
  F((t) => {
    pkts.forEach((e, i) => {
      if (t < tQ0 || t >= tQ1) { e.style.visibility = 'hidden'; return; }
      const l = lines[i], ph = (Math.floor((t - tQ0) * 12) / 12 + i * 0.17) % 0.84 / 0.84, k = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      e.style.visibility = 'visible'; e.style.left = (lerp(l.x1, l.x2, k) - 11).toFixed(0) + 'px'; e.style.top = (lerp(l.y1, l.y2, k) - 11).toFixed(0) + 'px';
    });
  });
  for (let k = 0; k < 4; k++) sfx('tick', tQ0 + k * 0.42, { g: 0.35, p: (k % 2 ? 0.5 : -0.5) });
  const busy = word(world, tr('都得查这一张', 'All must check this one'), 760, 250, 40, { w: 800 }); css(busy, { background: C.yel, padding: '0 12px' });
  const tBusy = Math.min(Q(KW('j1', '同一张表', 'one table')) - 0.1, tLines + 0.55); slam(busy, tBusy, { from: 1.3, d: 0.25 }); sfx('pop', tBusy, { g: 0.7 });

  // ── j2：线断、表撤；站 B 上一张蓝色长票：写上 alice，由一只黑框盖上红色签名 ──
  const tCut = Q(KW('j2', '不查表', 'skips')) - 0.1;
  lines.forEach((l) => to(l.p, tCut, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  [tbl, tblL, busy, ...tblRows].forEach((e) => to(e, tCut + 0.1, { autoAlpha: 0, duration: 0.25, ease: 'steps(3)' }));
  sfx('error', tCut, { g: 0.45 });
  const BX = 2000;
  const bar = blk(world, 'bg-blue', BX + 160, 300, 1100, 150); bar.dataset.name = 'ticket';
  const barL = word(world, tr('一张票', 'A ticket'), BX + 160, 200, 44, { w: 900 });
  const who = word(world, tr('你是谁：alice', 'Who: alice'), BX + 200, 336, 56, { w: 900 }); css(who, { background: C.yel, padding: '0 16px' });
  const signer = frame(world, BX + 1420, 250, 250, 250, { bw: 16, label: 'shop.example' });
  const sig = blk(world, 'bg-red', BX + 1150, 300, 150, 150); sig.dataset.name = 'signature';
  const sigL = word(world, tr('签名', 'Signature'), BX + 1150, 470, 40, { w: 900 });
  const tBar = tCut + 0.45;
  wipe(bar, tBar, { dir: 'l', d: 0.42, ease: STEP(0.42) }); wipe(barL, tBar + 0.1, { dir: 'l', d: 0.25 }); sfx('pop', tBar, { g: 0.6 });
  fromTo(signer.el, tBar + 0.2, { autoAlpha: 0, x: 200 }, { autoAlpha: 1, x: 0, duration: 0.33, ease: STEP(0.33) }); appear(signer.lab, tBar + 0.5);
  const tWho = Math.max(tBar + 0.45, Q(KW('j2', '写进', 'who you are')) - 0.1);
  slide(who, tWho, { x: -60, d: 0.25, ease: STEP(0.25) }); sfx('tick', tWho, { g: 0.6 });
  const tSign = Math.max(tWho + 0.4, Q(KW('j2', '签名', 'signs')) - 0.15);
  fromTo(sig, tSign, { autoAlpha: 0, x: 280, scale: 1.3 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.25, ease: 'steps(3)' });
  sfx('thud', tSign + 0.2, { g: 0.9, p: 0.4 }); wipe(sigL, tSign + 0.3, { dir: 'l', d: 0.2 });

  // ── j3：长票展开成真实的 JWT 三段（头部墨底、内容黄底、签名红底），段间是真正的点 ──
  const tJ = Q(KW('j3', 'JWT', 'JWT')) - 0.15;
  [bar, barL, who, sig, sigL].forEach((e) => to(e, tJ + 0.35, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));   // 长票等三段开始出现时才撤，中间不留空
  to(signer.el, tJ - 0.1, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }); to(signer.lab, tJ - 0.1, { autoAlpha: 0, duration: 0.17 });
  const big = word(world, 'JWT', BX + 160, 170, 150, { w: 900 }); slam(big, tJ, { from: 1.3, d: 0.25 }); sfx('thud', tJ, { g: 0.85 });
  const RX = BX + 470, RY = 420, RH = 78, RG = 104;
  const segs = [[J.h, C.ink, C.paper, tr('头部', 'Header'), { zh: '头部', en: 'header' }], [J.p, C.yel, C.ink, tr('内容', 'Payload'), { zh: '内容', en: 'payload' }], [J.s, C.red, C.ink, tr('签名', 'Signature'), { zh: '签名', en: 'signature' }]];
  const rows = segs.map(([str, bg, fg, lab, kw], i) => {
    const y = RY + i * RG;
    const e = mono(world, str, RX, y, 38, { color: fg, w: 700 }); css(e, { background: bg, padding: `0 22px`, height: RH + 'px', lineHeight: RH + 'px' }); e.dataset.name = ['jwt-header', 'jwt-payload', 'jwt-signature'][i];
    const l = word(world, lab, BX + 160, y + 14, 44, { w: 900 });
    const dot = i < 2 ? mono(world, '.', RX + e.offsetWidth + 10, y - 6, 84, { w: 800 }) : null;
    const tt = Math.max(tJ + 0.3 + i * 0.1, Q(T('j3', kw)) - 0.1);
    wipe(e, tt, { dir: 'l', d: 0.33, ease: STEP(0.33) }); wipe(l, tt, { dir: 'l', d: 0.2 }); if (dot) appear(dot, tt + 0.3);
    sfx('tick', tt, { g: 0.6, p: -0.3 + i * 0.3 });
    return { e, l, dot, y };
  });

  // ── j4：内容一段解码，谁都能读；把 exp 的第一位 1 改成 2，签名对不上 ──
  const tDec = Q(KW('j4', '编码', 'encoded')) - 0.1;
  const decY = RY + 3 * RG + 40;
  const decL = word(world, tr('解码：谁都能读', 'Readable'), BX + 160, decY + 10, 40, { w: 900 });
  const jsonA = J.payload.replace(/"/g, '&quot;'), digit = String(JSON.parse(J.payload).exp)[0], digitT = String(JSON.parse(J.tPayload).exp)[0];
  const head = jsonA.slice(0, jsonA.indexOf(digit, jsonA.indexOf('exp')));
  const dec = mono(world, `${head}<span class="dg">${digit}</span>${jsonA.slice(head.length + 1)}`, RX, decY, 44, { w: 800 }); css(dec, { background: C.yel, padding: '6px 22px' }); dec.dataset.name = 'jwt-decoded';
  const dg = dec.querySelector('.dg');
  wipe(dec, tDec + 0.15, { dir: 't', d: 0.33, ease: STEP(0.33) }); wipe(decL, tDec, { dir: 'l', d: 0.25 }); sfx('blip', tDec + 0.15, { g: 0.7 });
  const tEdit = Q(KW('j4', '改一个字', 'change')) - 0.1;
  swapAt(dg, digit, digitT, tEdit);
  F((t) => { const on = t >= tEdit; dg.style.background = on ? C.red : 'transparent'; dg.style.color = on ? C.paper : C.ink; });
  sfx('key', tEdit, { g: 0.9 });
  swapAt(rows[1].e, J.p, J.tP, tEdit + 0.17); sfx('tick', tEdit + 0.17, { g: 0.5 });
  const expect = mono(world, tr('按改后的内容，签名应是 ', 'Signature should now be ') + J.tExpected.slice(0, 16) + '…', RX, RY + 2 * RG + RH + 6, 30, { w: 700 }); expect.dataset.name = 'expected-signature';
  const tBad = Math.max(tEdit + 0.5, Q(KW('j4', '对不上', 'fails')) - 0.15);
  wipe(expect, tEdit + 0.35, { dir: 'l', d: 0.25 });
  const st = stamp(world, tr('对不上', 'MISMATCH'), RX + 1010, RY + 2 * RG - 6, 56, tBad, { r: -8, color: C.ink });
  sfx('error', tBad + 0.05, { g: 0.85 });

  // ── j5：回到站 A：表已经撤掉，每台服务器自己验签名与有效期，框里亮起 alice ──
  const tV = Math.max(tBad + 2.3, T('j5') + 0.2);
  const verL = word(world, tr('验签名 · 看有效期 · 不查表', 'Check signature · check expiry · no lookup'), 560, 250, isZh ? 52 : 40, { w: 900 });
  const mini = (x, y, k = 1) => { const g = h('div', 'abs', world); px(g, x, y, 150 * k, 40 * k); [C.ink, C.yel, C.red].forEach((c, i) => { const b = blk(g, '', i * 52 * k, 0, 46 * k, 40 * k); b.style.background = c; }); g.dataset.name = 'jwt-mini'; return g; };
  const okTags = servers.map((sv, i) => {
    const [x, y] = SV[i];
    const tk = mini(x + 20, y + 30), tag = word(world, 'alice', x + 34, y + 100, 40, { w: 900 }); css(tag, { background: C.yel, padding: '0 10px' });
    const tt = tV + 0.75 + i / 6;
    slide(tk, tt, { x: i < 3 ? 120 : -120, d: 0.25, ease: STEP(0.25) }); appear(tag, tt + 0.33);
    sfx('tick', tt + 0.33, { g: 0.5, p: i < 3 ? -0.5 : 0.5 });
    return tag;
  });
  wipe(verL, tV + 0.55, { dir: 'l', d: 0.3 });
  sfx('chime', tV + 0.75 + 1.0, { g: 0.6 });

  // ── j6：站 D：票发出去了。斜线块手里也有一张；服务器想收回，被黑缝挡住，有效期照走 ──
  const DX = 6000, tR = Q(T('j6')) - 0.1;
  // 上半：服务器想收回，被黑缝挡住；斜线块手里的复本照样能用。这一组留到本场结束，结论「收不回」读得完
  const own = frame(world, DX + 140, 150, 210, 210, { bw: 16, label: 'shop.example' });
  const tk1 = mini(DX + 700, 190, 2);
  const thief = h('div', 'abs', world); px(thief, DX + 1180, 120, 400, 270); thief.dataset.name = 'attacker';
  const th = hatch(thief, 0, 0, 400, 270, C.ink, 22, 7); css(th, { position: 'absolute', left: '0px', top: '0px' });
  const tk2 = mini(DX + 1230, 190, 2); tk2.dataset.overlapOk = '1';
  appear(own.el, tR); appear(own.lab, tR); slide(tk1, tR + 0.1, { x: -300, d: 0.33, ease: STEP(0.33) });
  fromTo(thief, tR + 0.3, { autoAlpha: 0, y: 260 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); appear(tk2, tR + 0.6); sfx('pop', tR + 0.6, { g: 0.6, p: 0.5 });
  const back = blk(world, 'bh-arrow', DX + 380, 249, 250, 12); back.dataset.name = 'revoke';
  const seam = blk(world, 'bg-ink', DX + 660, 160, 22, 190); seam.dataset.name = 'blocked';
  const tBack = Math.min(Math.max(tR + 0.7, Q(KW('j6', '收回', 'take back')) - 0.2), tR + 1.2);
  fromTo(back, tBack, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0% 50%', duration: 0.25, ease: 'steps(3)' });
  appear(seam, tBack + 0.3); sfx('error', tBack + 0.3, { g: 0.7 });
  // 两张票下面各一条有效期：一直在缩短，但这一场里走不完——收不回的票照样有效
  const vbars = [[DX + 700, tk1], [DX + 1230, tk2]].map(([x]) => { const b = blk(world, 'bg-ink', x, 316, 300, 14); b.dataset.name = 'validity'; return b; });
  const vL = word(world, tr('有效期', 'Still valid'), DX + 700, 280, 26, { color: C.dim, w: 800 });
  vbars.forEach((b, i) => { appear(b, tR + 0.3 + i * 0.3); fromTo(b, tR + 0.3 + i * 0.3, { scaleX: 1 }, { scaleX: 0.45, transformOrigin: '0% 50%', duration: Math.max(1, s.end - tR), ease: STEP(Math.max(1, s.end - tR)), immediateRender: false }); });
  appear(vL, tR + 0.3);
  const noBack = word(world, tr('发出去，收不回', 'Once out, it stays valid'), DX + 700, 352, isZh ? 56 : 44, { w: 900 }); slam(noBack, tBack + 0.4, { from: 1.25, d: 0.25 }); sfx('thud', tBack + 0.4, { g: 0.7 });

  // ── j7–j7b：下半是时间轴：一串短票首尾相接，到期一张，长票换出一张；最后给两种票起名 ──
  const tS = Q(T('j7')) - 0.1, AX = DX + 140, AW = 1560;
  const axis = blk(world, 'bg-ink', AX, 880, AW, 8); const axL = word(world, tr('时间 →', 'Time →'), AX + AW - 170, 900, 32, { color: C.dim, w: 700 });
  appear(axis, tS); appear(axL, tS);
  const shortW = 230, shorts = [];
  const tShort = Math.max(tS + 0.2, Q(KW('j7', '很短', 'short')) - 0.1), tLong = Math.max(tShort + 0.6, Q(KW('j7', '长期票', 'long-lived')) - 0.15);
  for (let k = 0; k < 6; k++) {
    const e = blk(world, 'bg-blue', AX + k * (shortW + 30), 560, shortW, 80); e.dataset.name = 'access-token';
    const tt = k === 0 ? tShort : tLong + 0.35 + (k - 1) * 0.42;
    fromTo(e, tt, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0% 50%', duration: 0.17, ease: 'steps(2)' });
    sfx('tick', tt, { g: 0.45, p: -0.5 + k * 0.2 });
    shorts.push(e);
  }
  const shortL = word(world, tr('短', 'Short'), AX + 24, 572, 44, { color: C.paper, w: 900 }); appear(shortL, tShort + 0.17);
  const longT = blk(world, 'bg-blue', AX, 690, AW, 150); longT.dataset.name = 'refresh-token';
  const longIn = h('div', 'abs', world); px(longIn, AX + 20, 710, AW - 40, 110); css(longIn, { border: `6px solid ${C.paper}`, boxSizing: 'border-box' });
  wipe(longT, tLong, { dir: 'l', d: 0.42, ease: STEP(0.42) }); appear(longIn, tLong + 0.42); sfx('thud', tLong + 0.4, { g: 0.7 });
  const lgL = word(world, tr('长期票', 'Long-lived'), AX + 40, 730, 52, { color: C.paper, w: 900 }); wipe(lgL, tLong + 0.3, { dir: 'l', d: 0.25 });
  const tA2 = Q(KW('j7b', 'Access Token', 'Access Token')) - 0.15, tR2 = Q(KW('j7b', 'Refresh Token', 'Refresh Token')) - 0.15;
  const accN = word(world, 'Access Token', AX, 470, 64, { w: 900 });
  const refN = word(world, 'Refresh Token', AX + 520, 730, 64, { color: C.paper, w: 900 });
  slam(accN, tA2, { from: 1.3, d: 0.25 }); sfx('thud', tA2, { g: 0.8 });
  slam(refN, tR2, { from: 1.3, d: 0.25 }); sfx('thud', tR2, { g: 0.8 });
  // ── 镜头 ──
  const A = { x: 960, y: 470, z: 1 }, B1 = { x: BX + 900, y: 400, z: 1 }, B2 = { x: BX + 1060, y: 560, z: 0.92 }, D = { x: DX + 920, y: 460, z: 0.95 };
  cam.track(s.start, { ...A, z: 0.97 }, [
    [c0 + 0.05, { z: 1 }, 0.5, { sfx: false }],
    [c0 + 0.6, { z: 1.03 }, Math.max(0.5, tCut - c0 - 0.8), { ease: 'none', sfx: false }],
    [tCut + 0.2, B1, 0.9, { sfx: false }],
    [tCut + 1.15, { x: B1.x + 30 }, Math.max(0.4, tJ - tCut - 1.4), { ease: 'none', sfx: false }],
    [tJ - 0.2, B2, 0.9, { sfx: false }],
    [tJ + 0.75, { z: 0.94 }, Math.max(0.4, tV - tJ - 1.0), { ease: 'none', sfx: false }],
    [tV - 0.2, { ...A }, 0.9, { sfx: false }],
    [tV + 0.75, { z: 1.08 }, Math.max(0.4, tR - tV - 0.55), { ease: 'none', sfx: false }],
    [tR + 0.2, D, 0.9, { sfx: false }],
    [tR + 1.15, { z: 0.97 }, Math.max(0.4, s.end - tR - 1.2), { ease: 'none', sfx: false }],
  ]);
});
