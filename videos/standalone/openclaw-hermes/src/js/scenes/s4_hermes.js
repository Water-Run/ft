// 03 Hermes Agent（来历与用法）：模型线（2023 起）与智能体（2025 起）在同一条时间轴上 → 星标曲线（与 OpenClaw 同一坐标）→ 用法一行。
// 日期、名字、论文摘要、发布说明与星标取自 data.js（research/lab）。
scene('hermes', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, GD = C.herm, PP = C.paper;
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, o);

  // ═══ 第一站：先有模型，后有智能体 ═══
  const d0 = '2023-01-01', AX0 = 160, PPD = 1.164, MY = 380, AY = 640;
  const nx = (iso) => dayX(iso, d0, AX0, PPD);
  const ban = pixelBanner(g, 'HERMES', 160, 110, 12); colReveal(ban.els, s.start + 0.4, 0.02);
  const axis = R(g, 140, MY + 150, 1640, 5, C.dimi); fromTo(axis, c0 - 0.5, { scaleX: 0, svgOrigin: `140 ${MY + 152}` }, { scaleX: 1, duration: 0.8, ease: 'power3.out' });
  ['2023', '2024', '2025', '2026'].forEach((y) => { const x = nx(y + '-01-01'); appear(R(g, x - 2, MY + 150, 4, 16, C.dimi), c0 - 0.2); appear(Lb(x - 40, MY + 174, y, { size: 24, c: C.dimi, w: 80, align: 'center' }), c0 - 0.2); });
  const rowM = tag(world, 160, MY - 110, tr('模型', 'Models'), { bg: GD, c: C.ink, size: 30, cls: 'hd' }); wipe(rowM, Tw('h1', '模型', 'models') - 0.2, { dir: 'l', d: 0.3 }); sfx('tick', Tw('h1', '模型', 'models') - 0.2);
  const M = D.hmModels, mw = [Tw('h2', 'Nous-Hermes-13b', 'Nous-Hermes-13b') - 0.3, Tend('h2') + 0.05, Tw('h3', 'Hermes 3', 'Hermes 3') - 0.2, Tw('h4', '后有', 'came later') - 0.9];
  const mE = M.map((m, i) => {
    const x = nx(m.d), up = i % 2 === 0, y = MY + (up ? 0 : 84);
    const sq = R(g, x - 14, MY + 138, 28, 28, GD), st = R(g, x - 2, y + (up ? 44 : 32), 4, MY + 138 - y - (up ? 44 : 32), GD);
    const nm = Lb(x - 8, y - 6, i === 0 ? 'Nous-Hermes-13b' : m.n, { cls: 'pxl', size: up ? 46 : 34, c: GD }), dt = Lb(x - 8, y + 40 - (up ? 0 : 0), '', { size: 1, c: C.ink });
    const dd = Lb(x + 22, MY + 196 + (i === 1 ? 0 : 0), '', { size: 1 });
    [sq, st].forEach((e) => appear(e, mw[i])); slide(nm, mw[i], { y: 12, d: 0.3 }); sfx('pop', mw[i], { g: i === 0 || i === 2 ? 0.7 : 0.4 });
    return { x, nm };
  });
  const m0d = Lb(nx(M[0].d) - 8, MY + 46, M[0].d + ' · Hugging Face', { size: 22, c: C.dimi }); appear(m0d, mw[0] + 0.3);
  const m2d = Lb(nx(M[2].d) - 8, MY + 46, M[2].d + ' · arXiv 2408.11857', { size: 22, c: C.dimi }); appear(m2d, mw[2] + 0.3);
  // Hermes 3 的论文摘要
  const sent = 'We present Hermes 3, a neutrally-aligned generalist instruct and tool use model with strong reasoning and creative abilities.';
  if (!D.hm3abs.includes(sent)) console.warn('quote mismatch hm3abs');
  const qb = h('div', 'abs', world); px(qb, 160, AY + 60, 1180); css(qb, { borderLeft: `8px solid ${GD}`, paddingLeft: '26px', whiteSpace: 'normal' });
  const qt = h('div', 'mono', qb, mark(esc(sent), ['generalist instruct and tool use model'], 'hl-g')); css(qt, { fontSize: '32px', lineHeight: '1.45', whiteSpace: 'normal', color: PP });
  const qs = h('div', 'mono', qb, tr('arXiv 2408.11857 摘要 · 2024-08-15', 'arXiv 2408.11857, abstract · 2024-08-15')); css(qs, { fontSize: '22px', color: C.dimi, marginTop: '12px' });
  wipe(qb, Tw('h3', '定位', 'described') - 0.2, { dir: 'l', d: 0.5 }); sfx('whoosh', Tw('h3', '定位', 'described') - 0.2, { g: 0.4 });
  // 智能体：同一条轴的下一行
  const ax = nx(D.repo.hm.created), lx = nx(D.hmEvents.launch), ta = Tw('h4', '后有', 'came later') - 0.1;
  const rowA = tag(world, ax - 150, AY - 44, tr('智能体', 'Agent'), { bg: PP, c: C.ink, size: 30, cls: 'hd' });
  const rg = ring(g, ax + 64, AY - 20, 44, PP, { w: 7, dot: 18, rest: 180 }), aSt = R(g, ax + 62, MY + 166, 4, AY - 64 - MY - 166, PP);
  const aD = Lb(ax + 124, AY - 44, tr(`仓库创建 ${D.repo.hm.created}`, `repository created ${D.repo.hm.created}`), { size: 24 });
  wipeOut(qb, Tw('h4', '先有', 'came first') - 0.45, { dir: 'l', d: 0.3 });   // 下面的金线与文字画在引文的位置上：先把引文收走
  [rg.grp, aSt].forEach((e) => appear(e, ta)); wipe(rowA, ta, { dir: 'l', d: 0.3 }); appear(aD, ta + 0.3); sfx('thud', ta, { g: 0.6 }); rg.spin(ta + 0.2, s.end, 2.2, 180);
  const gap = R(g, nx(M[0].d), AY + 86, ax + 64 - nx(M[0].d), 6, GD), gapT = Lb(nx(M[0].d), AY + 106, tr('先有会调用工具的模型，后有智能体', 'tool-calling models first, the agent later'), { cls: 'body', size: 32, c: GD });
  fromTo(gap, Tw('h4', '先有', 'came first') - 0.1, { scaleX: 0, svgOrigin: `${nx(M[0].d)} ${AY + 89}` }, { scaleX: 1, duration: Math.max(0.6, ta - Tw('h4', '先有', 'came first')), ease: 'power2.inOut' }); appear(gapT, Tw('h4', '先有', 'came first') + 0.2);

  // ═══ 第二站：公开与星标 ═══
  const SX = 2300, P = D.stars['NousResearch/hermes-agent'].points.slice(0, -1), PO = D.stars['openclaw/openclaw'].points.slice(0, -1);
  const e0 = D.repo.hm.created, CX0 = SX + 220, CY0 = 860, PX = 3.4, PY = 1.72 / 1000;
  const cx = (iso) => dayX(iso, e0, CX0, PX), cy = (v) => CY0 - v * PY;
  const grid = [100, 200, 300, 400].map((v) => [R(g, CX0, cy(v * 1000) - 1, 1500, 2, C.line), Lb(CX0 - 96, cy(v * 1000) - 14, v + 'k', { size: 22, c: C.dimi, w: 80, align: 'right' })]);
  const base = R(g, CX0, CY0 - 2, 1500, 4, C.dimi);
  const months = ['2025-08-01', '2025-10-01', '2025-12-01', '2026-02-01', '2026-04-01', '2026-06-01', '2026-08-01', '2026-10-01'].map((m) => [R(g, cx(m) - 1, CY0, 2, 12, C.dimi), Lb(cx(m) - 50, CY0 + 18, m.slice(0, 7), { size: 22, c: C.dimi, w: 100, align: 'center' })]);
  const t5 = T('h5'), t6 = T('h6'), t7 = T('h7'), t7b = T('h7b');
  [base, ...grid.flat(), ...months.flat()].forEach((e) => appear(e, t5 - 0.6));
  // OpenClaw 的曲线：同一坐标下的参照（细线）
  const oc = wire(g, PO.filter((p) => DT(p[0]) >= DT(e0)).map(([d, v]) => [cx(d), cy(v)]), C.claw, 3, { o: 0.75 }); const ocT = Lb(cx('2026-07-01'), cy(376000) + 16, tr('OpenClaw（同一坐标）', 'OpenClaw (same axes)'), { size: 22, c: C.claw });
  const pts = P.map(([d, v]) => [cx(d), cy(v)]), cv = curve(g, pts, GD, 9);
  const idx = (iso) => P.findIndex((p) => p[0] === iso), val = (k) => { const i = Math.min(P.length - 2, Math.floor(k)); return lerp(P[i][1], P[i + 1][1], clamp(k - i)); };
  const iL = idx('2026-02-13'), iA = idx('2026-04-01'), iB = idx('2026-04-24'), iE = P.length - 1;
  cv.reveal([[t5 - 0.4, 0], [Tend('h5'), iL], [t6, iL + 0.55], [Tend('h6'), iA - 0.55], [t7, iA - 0.55], [Tw('h7', '两万', '20,000') + 0.5, iA], [Tw('h7', '四月下旬', 'by late April'), iA], [Tend('h7'), iB], [t7b, iB], [Tend('h7b') - 0.3, iE]]);
  // 采样点上的金色方块（曲线描过时点亮）
  P.forEach(([d, v], i) => { if (i < iL) return; const sq = R(g, cx(d) - 9, cy(v) - 9, 18, 18, GD); let last = null; sq.setAttribute('opacity', 0); F((t) => { const on = cv.kAt(t) >= i - 0.001 ? 1 : 0; if (on !== last) { last = on; sq.setAttribute('opacity', on); } }); });
  // 像素数字计数
  const pn = pixelNum(g, SX + 240, 130, 16, GD, 7), cntL = Lb(SX + 244, 262, tr('GitHub 星标', 'GitHub stars'), { size: 26, c: C.dimi }), src = Lb(SX + 244, 298, 'star-history.com · ' + D.rel.cutoff, { size: 22, c: C.dimi });
  appear(cntL, t5 - 0.4); appear(src, t5 - 0.4); F((t) => pn.set(t >= t5 - 0.4 ? fmtN(val(cv.kAt(t))) : ''));
  appear(oc, t7 - 0.2); appear(ocT, t7);
  // 标注
  const vline = (iso, y0, lines, t, c = PP) => { const x = cx(iso); const l = wire(g, [[x, CY0], [x, y0]], c, 3, { dash: '8 8' }); appear(l, t); const es = lines.map((tx_, i) => { const e = Lb(x + 12, y0 - 4 + i * 34, tx_, { size: 24, c }); appear(e, t + 0.1 + i * 0.1); return e; }); sfx('tick', t); return es; };
  const rc = Lb(CX0 + 8, CY0 - 76, tr(`仓库创建 ${e0}`, `repository created ${e0}`), { size: 24 }); appear(rc, Tw('h5', '仓库', 'repository') - 0.1); appear(R(g, CX0 - 9, CY0 - 9, 18, 18, PP), Tw('h5', '仓库', 'repository') - 0.1);
  vline(D.hmEvents.launch, 430, [tr(`${D.hmEvents.launch} 公开发布`, `${D.hmEvents.launch} public launch`)], Tw('h5', '公开', 'launched') - 0.1);
  const relL = vline(D.hmFirstRel, 520, [`${D.hmFirstRel} v0.2.0`, tr(`${D.v020.pulls} 个合并的拉取请求 · ${D.v020.contributors} 位贡献者`, `${D.v020.pulls} merged pull requests · ${D.v020.contributors} contributors`)], Tw('h6', 'v0.2.0', 'v0.2.0') - 0.2, GD);
  exit(relL[1], t7b - 0.4, { d: 0.3 });                           // 曲线接下来要从这一行上描过去：讲完这次发布就收起
  const mk = (i, dx, dy, t) => { const e = Lb(pts[i][0] + dx, pts[i][1] + dy, `${P[i][0].slice(5)} · ${fmtN(P[i][1])}`, { size: 26 }); appear(e, t); sfx('blip', t, { g: 0.6 }); };
  mk(iA, 26, -6, Tw('h7', '两万', '20,000') + 0.5); mk(iB, 26, -14, Tend('h7')); mk(iE, -260, -58, Tend('h7b') - 0.3);

  // ═══ 第三站：用法 ═══
  const UX = 4500, t8 = T('h8');
  const term = frame(world, UX + 160, 200, 760, 440, { c: PP, bw: 6 }), tb = h('div', 'abs', world); px(tb, UX + 160, 200, 760, 52); css(tb, { background: PP });
  const tbT = Lb(UX + 182, 210, tr('终端', 'terminal'), { size: 24, c: C.ink });
  const c1 = Lb(UX + 192, 300, '', { cls: 'mono7', size: 38 }), c1n = Lb(UX + 192, 356, '# ' + has('hm.readme.cmd', 'Interactive CLI — start a conversation'), { size: 22, c: C.dimi });
  const c2 = Lb(UX + 192, 450, '', { cls: 'mono7', size: 38 }), c2n = Lb(UX + 192, 506, '# ' + has('hm.readme.gw', 'Start the messaging gateway'), { size: 22, c: C.dimi });
  const cs = srcLab(world, UX + 192, 580, 'hm.readme.cmd');
  wipe(term, t8 - 0.3, { dir: 'l', d: 0.4 }); wipe(tb, t8 - 0.25, { dir: 'l', d: 0.4 }); appear(tbT, t8); appear(cs, t8 + 0.4);
  const th = Tw('h8', 'hermes 进入', 'hermes opens'), tg = Tw('h8', 'gateway', 'hermes gateway');
  typeText(c1, '$ hermes', th - 0.1, 22, { cursor: false }); appear(c1n, th + 0.5); typeText(c2, '$ hermes gateway', tg - 0.1, 26, { cursor: false }); appear(c2n, tg + 0.7);
  // 两条命令通向同一个核心
  const core = ring(g, UX + 1500, 420, 110, GD, { w: 10, dot: 26, rest: 180 }), coreT = Lb(UX + 1400, 396, tr('同一个核心', 'one core'), { cls: 'hd', size: 36, c: GD, w: 200, align: 'center' });
  const w1 = wire(g, [[UX + 920, 322], [UX + 1180, 322], [UX + 1180, 420], [UX + 1390, 420]], PP, 6), w2 = wire(g, [[UX + 920, 472], [UX + 1180, 472], [UX + 1180, 420]], PP, 6);
  drawIn(w1, th + 0.3, 0.5); appear(core.grp, th + 0.6); appear(coreT, th + 0.7); sfx('pop', th + 0.6); drawIn(w2, tg + 0.6, 0.4); core.spin(th + 0.8, s.end, 2.2, 180);
  [th + 0.9, tg + 1.0, tg + 1.8].forEach((t, i) => { const pk = packet(g, 22, GD); pk.ride(t, 0.6, i === 0 ? [[UX + 920, 322], [UX + 1180, 322], [UX + 1180, 420], [UX + 1390, 420]] : [[UX + 920, 472], [UX + 1180, 472], [UX + 1180, 420], [UX + 1390, 420]]); });
  const q8 = quote(world, UX + 160, 720, 1500, 'hm.agents.what', 'runs the same agent core across a CLI, a messaging', { bar: GD, size: 28, html: () => 'Hermes is a personal AI agent that <span class="hl-g">runs the same agent core</span> across a CLI, a messaging gateway (Telegram, Discord, Slack, ~20 platforms), a TUI, and an Electron desktop app.' });
  has('hm.agents.what', 'Hermes is a personal AI agent that runs the same agent core across a CLI, a messaging'); has('hm.agents.what', 'gateway (Telegram, Discord, Slack, ~20 platforms), a TUI, and an Electron desktop app.');
  wipe(q8, tg + 0.9, { dir: 'l', d: 0.5 });

  camTrack(cam, s.start, { x: 760, y: 420, z: 1.15 }, [
    [c0 - 0.5, { x: 800, y: 440, z: 1.1 }, 3.0, { ease: 'power2.out', sfx: false }],
    [T('h2') - 0.2, { x: 620, y: 470, z: 1.2 }, 1.0, { g: 0.4 }],
    [T('h3') - 0.2, { x: 900, y: 560, z: 1.04 }, 1.1, { g: 0.4 }],
    [T('h3') + 1.2, { x: 920, y: 580, z: 1.08 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [T('h4') - 0.3, { x: 985, y: 500, z: 1.08 }, 1.0, { g: 0.4 }],
    [T('h4') + 0.9, { x: 995, y: 525, z: 1.09 }, 2.2, { ease: 'sine.inOut', sfx: false }],
    [t5 - 0.7, { x: SX + 960, y: 540, z: 1 }, 1.1],
    [t5 + 0.8, { x: SX + 1000, y: 560, z: 1.04 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t6 - 0.2, { x: SX + 1000, y: 555, z: 1.12 }, 1.0, { g: 0.4 }],
    [t6 + 1.0, { x: SX + 1030, y: 560, z: 1.15 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t7 - 0.2, { x: SX + 1000, y: 540, z: 1.06 }, 1.0, { g: 0.4 }],
    [t7 + 0.9, { x: SX + 1040, y: 530, z: 1.1 }, Math.max(1.2, t7b - t7 - 1.3), { ease: 'sine.inOut', sfx: false }],
    [t7b - 0.2, { x: SX + 960, y: 540, z: 1 }, 2.4, { ease: 'sine.inOut', sfx: false }],
    [t8 - 0.6, { x: UX + 900, y: 520, z: 1.05 }, 1.1],
    [t8 + 1.0, { x: UX + 960, y: 540, z: 1 }, 3.0, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
