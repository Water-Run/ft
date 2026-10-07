// 02 OpenClaw（来历与用法）：名字的时间轴 → 星标曲线（star-history.com 的采样点）→ 2.0 把会话迁进 SQLite → 用法一行。
// 日期、名字、README 原句、星标、公告与版本都取自 data.js（research/lab）。
scene('claw', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, RD = C.claw;

  // ═══ 第一站：名字 ═══
  const N = D.names, d0 = N[0].from, AX0 = 200, PPD = 22.4, AY = 420;
  const nx = (iso) => dayX(iso, d0, AX0, PPD);
  const axis = R(g, 140, AY - 3, 1640, 6, C.paper);
  fromTo(axis, s.start + 0.4, { scaleX: 0, svgOrigin: `140 ${AY}` }, { scaleX: 1, duration: 0.8, ease: 'power3.out' });
  const hdr = lab(world, 140, 84, tr('仓库的名字', 'Names of the repository'), { size: 26, c: C.dimi }); appear(hdr, c0 - 0.3);
  const lv = [0, 0, 0, 1, 0];
  const nameEl = N.map((n, i) => {
    const x = nx(n.from), y = AY - 96 - lv[i] * 92, last = i === N.length - 1;
    const tick = R(g, x - 3, y + 62, 6, AY - y - 62, last ? RD : C.paper);
    const tg = last ? tag(world, x - 6, y - 6, n.name, { bg: RD, c: C.ink, size: 44, cls: 'in9', pad: '8px 16px' }) : chip(world, x - 6, y, n.name, 'oc', 34, { fontWeight: 700 });
    const dt = lab(world, x - 6, AY + 18 + (i === 3 ? 0 : i === 4 ? 34 : 0), n.from, { size: 22, c: i === 4 ? RD : C.dimi });
    return { tick, tg, dt, x };
  });
  const showName = (i, t) => { const e = nameEl[i]; appear(e.tick, t - 0.05); slide(e.tg, t, { y: 16, d: 0.3 }); appear(e.dt, t + 0.15); sfx(i === 4 ? 'thud' : 'pop', t, { g: 0.6 }); };
  showName(0, Tw('c1', 'warelay', 'warelay') - 0.1);
  const r0 = lab(world, nx(d0) - 6, AY + 58, '"' + N[0].readme + '"', { size: 24, c: C.dimi }); appear(r0, Tw('c1', 'warelay', 'warelay') + 0.5);
  showName(1, Tw('c2', 'CLAWDIS', 'CLAWDIS') - 0.1);
  // CLAWDIS 的 README 首句（v2.0.0-beta1）
  const line = D.readmeLines['v2.0.0-beta1'][0].replace(/\*\*/g, '');
  const qb = h('div', 'abs', world); px(qb, 140, 600, 1000); css(qb, { borderLeft: `8px solid ${RD}`, paddingLeft: '26px', whiteSpace: 'normal' });
  const qt = h('div', 'mono', qb, mark(esc(line), ['gateway', 'bridges', 'local coding agent (Pi)'])); css(qt, { fontSize: '34px', lineHeight: '1.45', whiteSpace: 'normal', color: C.paper });
  const qs = h('div', 'mono', qb, 'README.md @ ' + N[1].ver + ' · ' + N[1].rel); css(qs, { fontSize: '22px', color: C.dimi, marginTop: '12px' });
  wipe(qb, Tw('c2', '定位', 'described') - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', Tw('c2', '定位', 'described') - 0.1, { g: 0.4 });
  // 一个 harness 加上网关：沿用上一章的画法（圆环 = 循环，竖条 = 网关，方块 = 插口）
  const hx = 1560, hy = 730;
  const rg = ring(g, hx, hy, 84, C.paper, { w: 8, dot: 22, rest: 180 }), rgT = lab(world, hx - 60, hy - 22, 'Pi', { cls: 'in9', size: 44, w: 120, align: 'center' });
  const hT = lab(world, hx - 90, hy + 100, 'harness', { size: 26, w: 180, align: 'center', c: C.dimi });
  const gwB = R(g, 1300, 620, 56, 220, RD), gwT = lab(world, 1262, 852, tr('网关', 'gateway'), { size: 26, c: RD, w: 132, align: 'center' });
  const ports = [670, 790].map((y) => R(g, 1260, y - 18, 36, 36, C.ink, { stroke: RD, 'stroke-width': 6 }));
  const pn = ['WhatsApp', 'Telegram'].map((n, i) => lab(world, 1250 - 150, [670, 790][i] - 48, n, { size: 22, c: C.dimi, w: 150, align: 'center' }));
  const lk = wire(g, [[1356, hy], [hx - 84, hy]], C.paper, 6);
  const t4 = T('c4'), th = Tw('c4', 'harness', 'harness'), tg4 = Tw('c4', '网关', 'gateway');
  const a4 = Math.min(th, tg4) - 0.2;
  [rg.grp, rgT, hT].forEach((e) => appear(e, th - 0.2)); sfx('pop', th - 0.2);
  fromTo(gwB, tg4 - 0.15, { scaleY: 0, svgOrigin: `1328 730` }, { scaleY: 1, duration: 0.4, ease: 'back.out(1.6)' }); appear(gwT, tg4 + 0.1); ports.forEach((p, i) => appear(p, tg4 + 0.15 + i * 0.1)); pn.forEach((p, i) => appear(p, tg4 + 0.2 + i * 0.1)); drawIn(lk, tg4 + 0.1, 0.3); sfx('thud', tg4, { g: 0.6 });
  rg.spin(tg4 + 0.4, T('c6'), 2.0, 180);
  [0, 0.9, 1.8].forEach((dt, i) => { const pk = packet(g, 22, RD); pk.ride(tg4 + 0.4 + dt, 0.6, [[1150, [670, 790][i % 2]], [1300, [670, 790][i % 2]], [1356, hy], [hx - 84, hy]]); });
  // 三次改名：龙虾沿时间轴走过（引文与小图先收起）
  wipeOut(qb, T('c5') - 0.45, { dir: 'l', d: 0.3 }); [rg.grp, rgT, hT, gwB, gwT, lk, ...ports, ...pn].forEach((e) => vanish(e, T('c5') - 0.3));
  showName(2, Tw('c5', '三次改名', 'three times') - 0.2); showName(3, Tw('c5', '三次改名', 'three times') + 0.35); showName(4, Tw('c5', '定名', 'ending as') - 0.05);
  const lob = lobster(g, 0, 0, 5); const t5 = T('c5'), tw0 = Tw('c5', '三次改名', 'three times') - 0.3, tw1 = Tw('c5', '定名', 'ending as') + 0.2;
  // 龙虾的位置按关键帧走：进场 → warelay → CLAWDIS →（三次改名）→ OpenClaw；停在每个名字的刻度左边
  const lk_ = [[s.start + 0.6, 150], [Tw('c1', 'warelay', 'warelay') - 0.1, nx(N[0].from) - 90], [T('c2') - 0.3, nx(N[0].from) - 90], [Tw('c2', 'CLAWDIS', 'CLAWDIS') + 0.2, nx(N[1].from) - 90], [tw0, nx(N[1].from) - 90], [tw1, nx(N[4].from) - 90]];
  F((t) => { let x = lk_[0][1], mv = 0; for (let i = 1; i < lk_.length; i++) { if (t >= lk_[i][0]) { x = lk_[i][1]; continue; } if (t > lk_[i - 1][0]) { const k = ease.io3((t - lk_[i - 1][0]) / (lk_[i][0] - lk_[i - 1][0])); x = lerp(lk_[i - 1][1], lk_[i][1], k); mv = lk_[i][1] !== lk_[i - 1][1] ? 1 : 0; } break; }
    lob.grp.setAttribute('transform', `translate(${x.toFixed(1)} ${(AY - 84 - mv * Math.abs(Math.sin(t * 9)) * 12).toFixed(1)})`); lob.grp.setAttribute('opacity', t >= s.start + 0.6 && t < tw1 + 0.15 ? 1 : 0); lob.set(Math.abs(Math.sin(t * 5))); });

  // ═══ 第二站：星标曲线 ═══
  const SX = 2300, P = D.stars['openclaw/openclaw'].points.slice(0, -1), CX0 = SX + 220, CY0 = 860, PX = 4.72, PY = 1.72 / 1000;
  const cx = (iso) => dayX(iso, d0, CX0, PX), cy = (v) => CY0 - v * PY;
  const pts = P.map(([d, v]) => [cx(d), cy(v)]);
  const idx = (iso) => P.findIndex((p) => p[0] === iso), val = (k) => { const i = Math.min(P.length - 2, Math.floor(k)); return lerp(P[i][1], P[i + 1][1], clamp(k - i)); };
  // 坐标
  const grid = [100, 200, 300, 400].map((v) => [R(g, CX0, cy(v * 1000) - 1, 1500, 2, C.line), lab(world, CX0 - 96, cy(v * 1000) - 14, v + 'k', { size: 22, c: C.dimi, w: 80, align: 'right' })]);
  const base = R(g, CX0, CY0 - 2, 1500, 4, C.dimi);
  const months = ['2025-12-01', '2026-02-01', '2026-04-01', '2026-06-01', '2026-08-01', '2026-10-01'].map((m) => [R(g, cx(m) - 1, CY0, 2, 12, C.dimi), lab(world, cx(m) - 50, CY0 + 18, m.slice(0, 7), { size: 22, c: C.dimi, w: 100, align: 'center' })]);
  const cv = curve(g, pts, RD, 9);
  const iJ = idx('2026-01-20'), iF = idx('2026-02-07'), iM = idx('2026-03-16'), iE = P.length - 1;
  const t6 = T('c6'), t7 = T('c7'), t8 = T('c8');
  [base, ...grid.flat(), ...months.flat()].forEach((e) => appear(e, t6 - 0.9));
  cv.reveal([[t6 - 0.6, 0], [Tw('c6', '不到五千', 'Under 5,000') + 0.5, iJ], [Tw('c6', '2 月 7 日', 'by February 7'), iJ], [Tend('c6'), iF], [t7, iF + 0.42], [Tend('c7'), iM], [t8, iM], [Tend('c8') - 0.4, iE]]);
  // 计数与曲线顶端的龙虾
  const cnt = lab(world, SX + 240, 120, '', { cls: 'in9', size: 150, c: RD }), cntL = lab(world, SX + 248, 280, tr('GitHub 星标', 'GitHub stars'), { size: 26, c: C.dimi });
  const src = lab(world, SX + 248, 316, 'star-history.com · ' + D.rel.cutoff, { size: 22, c: C.dimi });
  appear(cnt, t6 - 0.6); appear(cntL, t6 - 0.6); appear(src, t6 - 0.6);
  const lob2 = lobster(g, 0, 0, 5);
  F((t) => { const k = cv.kAt(t), [x, y] = cv.at(k); const tx_ = fmtN(val(k)); if (cnt.textContent !== tx_) cnt.textContent = tx_; lob2.grp.setAttribute('transform', `translate(${(x - 40).toFixed(1)} ${(y - 84).toFixed(1)})`); lob2.grp.setAttribute('opacity', t >= t6 - 0.6 ? 1 : 0); lob2.set(Math.abs(Math.sin(t * 4))); });
  // 标注：两个日期的数值、18 天、公告、加入 OpenAI
  const mk = (iso, v, txt, o = {}) => { const x = cx(iso), y = cy(v); const d = Ci(g, x, y, 11, C.ink, { stroke: C.paper, 'stroke-width': 5 }); const e = lab(world, x + (o.dx != null ? o.dx : 24), y + (o.dy != null ? o.dy : -18), txt, { size: o.size || 26, c: o.c || C.paper }); return [d, e]; };
  const mJ = mk('2026-01-20', P[iJ][1], `01-20 · ${fmtN(P[iJ][1])}`, { dx: -250, dy: -52 }), mF = mk('2026-02-07', P[iF][1], `02-07 · ${fmtN(P[iF][1])}`, { dx: 56, dy: -14 });
  mJ.forEach((e) => appear(e, Tw('c6', '不到五千', 'Under 5,000') + 0.5)); mF.forEach((e) => appear(e, Tend('c6'))); sfx('blip', Tw('c6', '不到五千', 'Under 5,000') + 0.5); sfx('thud', Tend('c6'), { g: 0.7 });
  const days = Math.round((DT('2026-02-07') - DT('2026-01-20')) / 86400000), mult = (P[iF][1] / P[iJ][1]).toFixed(1);
  const brk = tag(world, cx('2026-02-07') + 56, cy(P[iF][1]) + 34, tr(`${days} 天 · ${mult} 倍`, `${days} days · ×${mult}`), { bg: RD, c: C.ink, size: 30 }); slam(brk, Tend('c6') + 0.25, { from: 1.2, d: 0.35 });
  const vline = (iso, y0, txt, t, o = {}) => { const x = cx(iso); const l = wire(g, [[x, CY0], [x, y0]], o.c || C.dimi, 3, { dash: '8 8' }); const e = lab(world, o.left ? x - 12 - 420 : x + 12, y0 - 4, txt, { size: 22, c: o.c || C.dimi, ...(o.left ? { w: 420, align: 'right' } : {}) }); appear(l, t); appear(e, t + 0.1); return [l, e]; };
  vline(D.sec.published, 600, tr(`${D.sec.published.slice(5)} 安全公告 · CVSS ${D.sec.cvss}`, `${D.sec.published.slice(5)} advisory · CVSS ${D.sec.cvss}`), Tend('c6') + 0.6, { left: true });
  vline(D.xposts.joins_openai.date, 480, tr('02-15 作者宣布加入 OpenAI', '02-15 author to join OpenAI'), Tw('c7', '作者', 'author') - 0.1, { c: C.paper, left: true });
  const fd = lab(world, cx(D.xposts.joins_openai.date) - 12 - 420, 514, tr('项目转由 OpenClaw 基金会托管', 'project moves to a foundation'), { size: 22, c: C.paper, w: 420, align: 'right' }); appear(fd, Tw('c7', '基金会', 'foundation') - 0.1); sfx('tick', Tw('c7', '作者', 'author') - 0.1); sfx('tick', Tw('c7', '基金会', 'foundation') - 0.1);
  const mE = mk(P[iE][0], P[iE][1], `${P[iE][0].slice(5)} · ${fmtN(P[iE][1])}`, { dx: -230, dy: 30 }); mE.forEach((e) => appear(e, Tend('c8') - 0.4)); sfx('blip', Tend('c8') - 0.4);

  // ═══ 第三站：2.0 与用法 ═══
  const UX = 4500, t9 = T('c9'), t10 = T('c10');
  const v2 = tag(world, UX + 140, 150, 'OpenClaw 2.0', { bg: RD, c: C.ink, size: 64, cls: 'in9', pad: '10px 22px' });
  const v2s = lab(world, UX + 146, 262, 'v2026.8.1 · 2026-08-31', { size: 26, c: C.dimi });
  const tv = Tw('c9', '8 月底', 'Version 2.0') + 0.2;
  slam(v2, tv - 0.1, { from: 1.2, d: 0.35 }); appear(v2s, tv + 0.2); sfx('thud', tv);
  const files = []; for (let i = 0; i < 8; i++) files.push(fileIcon(g, UX + 150 + (i % 4) * 96, 360 + Math.floor(i / 4) * 120, 70, 92, C.paper, { w: 4 }));
  const fL = lab(world, UX + 150, 610, tr('会话与转录：文件', 'sessions and transcripts: files'), { size: 24, c: C.dimi });
  const ar = arrow(g, UX + 570, 468, UX + 720, 468, RD, 8);
  const db = cyl(g, UX + 760, 360, 170, 220, RD, { w: 7 }), dbT = lab(world, UX + 760, 448, 'SQLite', { cls: 'mono7', size: 34, c: RD, w: 170, align: 'center' });
  const tf = Tw('c9', '文件', 'files'), tq = Tw('c9', 'SQLite', 'SQLite');
  seq(files, Math.min(tf, tq) - 0.5, 0.04, (e, t) => appear(e, t)); appear(fL, Math.min(tf, tq) - 0.2);
  drawIn(ar.firstChild, tq - 0.35, 0.3); appear(ar, tq - 0.35); appear(db, tq - 0.1); appear(dbT, tq); sfx('pop', tq - 0.1);
  files.forEach((f, i) => tl.to(f, { x: 620 - (i % 4) * 96, y: 80 - Math.floor(i / 4) * 120, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, tq + 0.1 + i * 0.05));
  const q9 = quote(world, UX + 140, 690, 820, 'oc.release.sqlite', 'This release changes how sessions and transcripts are stored by moving them into SQLite.', { bar: RD, size: 26 }); wipe(q9, tq + 0.5, { dir: 'l', d: 0.4 });
  // 用法：一行
  const term = frame(world, UX + 1040, 150, 760, 300, { c: C.paper, bw: 6 }), tb = h('div', 'abs', world); px(tb, UX + 1040, 150, 760, 52); css(tb, { background: C.paper });
  const tbT = lab(world, UX + 1062, 160, tr('终端', 'terminal'), { size: 24, c: C.ink });
  const cmd = lab(world, UX + 1072, 250, '', { size: 34, cls: 'mono7' });
  const cs = srcLab(world, UX + 1072, 382, 'oc.onboard');
  wipe(term, t10 - 0.3, { dir: 'l', d: 0.4 }); wipe(tb, t10 - 0.25, { dir: 'l', d: 0.4 }); appear(tbT, t10); appear(cs, t10 + 0.3);
  const eT = typeText(cmd, '$ ' + has('oc.onboard', 'openclaw onboard --install-daemon'), Tw('c10', '安装', 'install') - 0.2, 26, { cursor: false });
  const svc = frame(world, UX + 1040, 560, 360, 120, { c: RD, bw: 6 }), svcT = lab(world, UX + 1040, 582, tr('系统服务', 'system service'), { cls: 'hd', size: 40, c: RD, w: 360, align: 'center' }), svcS = lab(world, UX + 1040, 640, 'launchd / systemd', { size: 22, c: C.dimi, w: 360, align: 'center' });
  const a2 = arrow(g, UX + 1220, 452, UX + 1220, 556, RD, 8);
  const ts = Tw('c10', '系统服务', 'system service');
  appear(a2, ts - 0.3); wipe(svc, ts - 0.15, { dir: 't', d: 0.35 }); appear(svcT, ts + 0.1); appear(svcS, ts + 0.2); sfx('pop', ts);
  const bub = frame(world, UX + 1470, 560, 330, 120, { c: C.paper, bw: 6, r: 30 }), bubT = lab(world, UX + 1470, 596, tr('之后的入口：聊天', 'then: just chat'), { cls: 'body', size: 30, w: 330, align: 'center' });
  wipe(bub, ts + 0.6, { dir: 'l', d: 0.35 }); appear(bubT, ts + 0.8); sfx('tick', ts + 0.6);

  camTrack(cam, s.start, { x: 700, y: 430, z: 1.34 }, [
    [c0 - 0.5, { x: 740, y: 440, z: 1.12 }, 4.4, { ease: 'power2.out', sfx: false }],
    [T('c2') - 0.2, { x: 960, y: 540, z: 1 }, 1.0, { g: 0.4 }],
    [T('c3'), { x: 760, y: 640, z: 1.18 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t4 - 0.3, { x: 975, y: 620, z: 1.08 }, 0.9],
    [t5 - 0.4, { x: 1100, y: 400, z: 1.2 }, 1.0],
    [t5 + 1.0, { x: 1240, y: 390, z: 1.3 }, 2.4, { ease: 'sine.inOut', sfx: false }],
    [t6 - 1.0, { x: SX + 960, y: 540, z: 1 }, 1.1],
    [Tw('c6', '2 月 7 日', 'by February 7') - 0.2, { x: SX + 740, y: 540, z: 1.1 }, 2.0, { ease: 'sine.inOut', g: 0.4 }],
    [t7 - 0.2, { x: SX + 880, y: 540, z: 1.06 }, 1.2, { g: 0.4 }],
    [t8 - 0.2, { x: SX + 960, y: 540, z: 1 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t9 - 0.6, { x: UX + 640, y: 480, z: 1.2 }, 1.1],
    [t9 + 0.8, { x: UX + 660, y: 500, z: 1.24 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [t10 - 0.5, { x: UX + 1380, y: 440, z: 1.25 }, 1.0],
    [t10 + 1.0, { x: UX + 1400, y: 460, z: 1.2 }, 3.0, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
