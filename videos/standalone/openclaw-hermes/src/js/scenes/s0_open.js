// 开场：一台不关机的电脑里常驻一个进程（示意）→ 它的两头 → 两个项目的标志与星标（取自 research/lab）→ 标题。
// 第一站是示意图，画面上标「示意」；第二站的数字与日期来自 data.js。
scene('open', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, ocS = D.repo.oc.stars, hmS = D.repo.hm.stars;
  const BX = 2200;

  // ═══ 第一站：电脑、进程、两头 ═══
  const note = lab(world, 120, 70, tr('示意', 'Illustration'), { size: 24, c: C.dimi });
  const pc = frame(world, 700, 300, 520, 380, { c: C.paper, bw: 6 });
  const pcLab = lab(world, 700, 700, tr('一台不关机的电脑', 'A computer that stays on'), { size: 30, w: 520, align: 'center', cls: 'body' });
  const led = R(g, 1176, 322, 18, 18, C.paper);
  const proc = R(g, 960 - 30, 470 - 30, 60, 60, C.paper);
  const pLab = lab(world, 760, 548, tr('进程', 'process'), { size: 28, w: 400, align: 'center' });
  const up = lab(world, 760, 592, '', { size: 26, w: 400, align: 'center', c: C.dimi });
  wipe(pc, s.start + 0.05, { dir: 'l', d: 0.5 }); appear(note, s.start + 0.02); appear(pcLab, s.start + 0.05); appear(led, s.start + 0.02);
  const tP = Tw('o1', '常驻', 'one process');
  sfx('pop', tP);
  appear(pLab, tP + 0.2); appear(up, tP + 0.3);
  // 进程的脉动与运行时长（示意：从 41 天起算）
  F((t) => {
    // 方块的出现（带过冲）与之后的脉动都由 t 直接算出，不与补间抢同一个属性
    const a = clamp((t - tP) / 0.35), k = t < tP ? 0 : t < tP + 0.35 ? 1 + 3.5 * Math.pow(a - 1, 3) + 2.5 * Math.pow(a - 1, 2) : 1 + 0.08 * Math.sin((t - tP - 0.35) * Math.PI * 1.6);
    proc.setAttribute('transform', `translate(960 470) scale(${k.toFixed(3)}) translate(-960 -470)`); proc.setAttribute('opacity', t >= tP ? 1 : 0);
    const sec = Math.floor(41 * 86400 + 7 * 3600 + 12 * 60 + 33 + Math.max(0, t - tP) * 1), d = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), mm = Math.floor(sec % 3600 / 60), ss = sec % 60;
    const txt = tr(`已运行 ${d} 天 `, `up ${d} days `) + [hh, mm, ss].map((v) => String(v).padStart(2, '0')).join(':');
    if (up.textContent !== txt) up.textContent = txt;
  });

  // 左：聊天软件；右：模型、文件、终端
  const ys = [330, 490, 650];
  const chats = ys.map((y) => frame(world, 150, y - 50, 250, 100, { c: C.paper, bw: 5, r: 26 }));
  ys.forEach((y) => [0, 1, 2].forEach((i) => chats.push(R(g, 232 + i * 36, y - 9, 18, 18, C.paper))));
  const chatLab = lab(world, 150, 742, tr('聊天软件', 'Chat apps'), { size: 30, w: 250, align: 'center', cls: 'body' });
  const wL = ys.map((y) => wire(g, [[400, y], [560, y], [560, 490], [700, 490]], C.paper, 5));
  const rg = ring(g, 1620, 330, 46, C.paper, { w: 6, dot: 18 });
  const fi = fileIcon(g, 1582, 440, 76, 100, C.paper, { w: 5 });
  const term = frame(world, 1560, 604, 150, 96, { c: C.paper, bw: 5 });
  const prm = lab(world, 1580, 630, '$ _', { size: 36, cls: 'mono7' });
  const rl = [lab(world, 1730, 312, tr('模型', 'Model'), { size: 30, cls: 'body' }), lab(world, 1730, 472, tr('文件', 'Files'), { size: 30, cls: 'body' }), lab(world, 1730, 632, tr('终端', 'Shell'), { size: 30, cls: 'body' })];
  const wR = ys.map((y) => wire(g, [[1220, 490], [1380, 490], [1380, y], [1540, y]], C.paper, 5));
  const tL = Tw('o2', '聊天软件', 'chat apps'), tR = Tw('o2', '模型', 'a model');
  chats.forEach((e, i) => (i < 3 ? wipe(e, tL - 0.25 + i * 0.08, { dir: 'r', d: 0.35 }) : appear(e, tL + 0.1 + (i % 3) * 0.05)));
  appear(chatLab, tL + 0.2); wL.forEach((w, i) => drawIn(w, tL + 0.1 + i * 0.08, 0.5)); sfx('tick', tL); sfx('tick', tL + 0.16); sfx('tick', tL + 0.32);
  appear(rg.grp, tR - 0.1); appear(fi, Tw('o2', '文件', 'files') - 0.1); appear(term, Tw('o2', '终端', 'shell') - 0.1); appear(prm, Tw('o2', '终端', 'shell'));
  rl.forEach((e, i) => appear(e, [tR, Tw('o2', '文件', 'files'), Tw('o2', '终端', 'shell')][i]));
  wR.forEach((w, i) => drawIn(w, tR - 0.2 + i * 0.1, 0.5)); sfx('blip', tR);
  rg.spin(tR, s.end, 2.2);
  // 消息方块：从聊天进来，经过进程，去往右侧，再回来
  const inP = (y) => [[400, y], [560, y], [560, 490], [700, 490], [900, 490]], outP = (y) => [[1020, 490], [1220, 490], [1380, 490], [1380, y], [1540, y]];
  [[0, 0, 0], [0.9, 1, 2], [1.8, 2, 1], [2.9, 1, 0], [3.9, 0, 2]].forEach(([dt, a, b], i) => {
    const pk = packet(g, 26, C.paper), t = tL + 0.5 + dt;
    pk.ride(t, 0.8, inP(ys[a])); pk.ride(Math.max(t + 0.85, tR + 0.2 + i * 0.1), 0.8, outP(ys[b])); pk.ride(Math.max(t + 0.85, tR + 0.2 + i * 0.1) + 0.95, 0.8, outP(ys[b]).slice().reverse());
    if (i < 3) sfx('pop', t, { g: 0.35, p: -0.5 });
  });

  // ═══ 第二站：两个项目的标志与星标 → 标题 ═══
  const lob = lobster(g, BX + 140, 150, 17);
  const ocN = lab(world, BX + 470, 168, 'OpenClaw', { cls: 'in9', size: 168, c: C.claw });
  const ocS_ = lab(world, BX + 478, 350, '', { size: 46, c: C.claw, cls: 'mono7' });
  const ban = pixelBanner(g, 'HERMES AGENT', BX + 140, 500, 15);
  const hmS_ = lab(world, BX + 140, 636, '', { size: 46, c: C.herm, cls: 'mono7' });
  const asof = lab(world, BX + 140, 80, tr('GitHub 星标 · 截至 ' + D.rel.cutoff, 'GitHub stars · as of ' + D.rel.cutoff), { size: 24, c: C.dimi });
  const tO = Tw('o3', 'OpenClaw', 'OpenClaw'), tH = Tw('o3', 'Hermes Agent', 'Hermes Agent');
  fromTo(lob.grp, T('o3') - 0.6, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }); F((t) => lob.set(Math.abs(Math.sin(clamp((t - tO) / 1.4) * Math.PI * 2))));
  wipe(ocN, tO, { dir: 'l', d: 0.4 }); sfx('thud', tO + 0.3, { g: 0.6 }); appear(ocS_, tO + 0.5); appear(asof, T('o3') - 0.6);
  colReveal(ban.els, tH - 0.1, 0.012); sfx('pop', tH + 0.3, { g: 0.6 }); appear(hmS_, tH + 0.7);
  F((t) => {
    const a = fmtN(lerp(0, ocS, ease.out5(clamp((t - tO - 0.5) / 1.2)))), b = fmtN(lerp(0, hmS, ease.out5(clamp((t - tH - 0.7) / 1.2))));
    if (ocS_.textContent !== a) ocS_.textContent = a; if (hmS_.textContent !== b) hmS_.textContent = b;
  });
  // 这一类的设计 / 两者的实现 → 标题
  const rule = R(g, BX + 140, 742, 1640, 5, C.paper);
  const k1 = tag(world, BX + 140, 780, tr('这一类的设计', 'The design of the kind'), { size: 40, cls: 'hd', pad: '12px 24px' });
  const k2 = tag(world, BX + tr(520, 720), 780, tr('两者的实现', 'How the two are built'), { size: 40, cls: 'hd', pad: '12px 24px' });
  const t4 = T('o4');
  fromTo(rule, t4 - 0.1, { scaleX: 0, svgOrigin: `${BX + 140} 744` }, { scaleX: 1, duration: 0.6, ease: 'power3.out' });
  wipe(k1, Tw('o4', '这一类', 'design'), { dir: 'l', d: 0.35 }); wipe(k2, Tw('o4', '两者', 'both'), { dir: 'l', d: 0.35 }); sfx('tick', Tw('o4', '这一类', 'design')); sfx('tick', Tw('o4', '两者', 'both'));
  const tT = T('oT');
  vanish(k1, tT); vanish(k2, tT);
  const impl = tr('实现', 'Implementation');
  const title = lab(world, BX + 132, 770, tr(`OpenClaw, Hermes 和<span class="hl-p" style="margin-left:14px;padding:0 18px">${impl}</span>`, `OpenClaw, Hermes, and Their <span class="hl-p" style="padding:0 14px">${impl}</span>`), { cls: 'hd', size: tr(124, 70), st: { lineHeight: '1.25' } });
  wipe(title, tT + 0.05, { dir: 'l', d: 0.6 }); sfx('thud', tT + 0.5); sfx('whoosh', tT, { g: 0.5 });

  camTrack(cam, s.start, { x: 960, y: 540, z: 1.12 }, [
    [s.start + 0.05, { z: 1 }, 2.9, { ease: 'power2.out', sfx: false }],
    [T('o2') - 0.2, { x: 960, z: 0.98 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [T('o3') - 0.55, { x: BX + 960, y: 540, z: 1 }, 1.1],
    [T('o4'), { y: 560 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [tT, { y: 540, z: 1.03 }, 3.2, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
