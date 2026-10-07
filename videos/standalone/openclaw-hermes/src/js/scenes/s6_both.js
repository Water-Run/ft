// 04 异同：纸白底。先把相同的骨架逐行对齐（两边画同一种图形），再列差别（每行一组小动画）。
// 每一行的依据都在前两章给过出处；这里的小图是对那些事实的缩略画法。许可、迁移命令取自 data.js。
scene('both', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'paper');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, K = C.ink, RD = C.claw, GD = C.herm;
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, { c: K, ...o });
  const LXC = 520, RXC = 1400, MID = 960;                          // 左列、右列、中列的中心线

  // 表头：两个名字（色块上压墨色字）
  function heads(ox, oy, t) {
    const a = tag(world, ox + LXC - 190, oy, 'OpenClaw', { bg: RD, c: K, size: 54, cls: 'in9', pad: '10px 24px' }), b = tag(world, ox + RXC - 250, oy, 'Hermes Agent', { bg: GD, c: K, size: 54, cls: 'in9', pad: '10px 24px' });
    wipe(a, t, { dir: 'l', d: 0.4 }); wipe(b, t + 0.12, { dir: 'l', d: 0.4 }); return [a, b];
  }
  // ═══ 第一站：相同的骨架 ═══
  heads(0, 90, s.start + 0.4); sfx('whoosh', c0 - 0.5, { g: 0.5 });
  const ry = [270, 390, 510, 630], names = [tr('常驻进程', 'Long-lived process'), tr('平台适配器', 'Platform adapters'), tr('会话键', 'Session keys'), tr('工具循环', 'Tool loop')];
  const rw = [Tw('b2', '常驻进程', 'long-lived process'), Tw('b2', '平台适配器', 'platform adapters'), Tw('b2', '会话键', 'session keys'), Tw('b2', '工具循环', 'tool loop')];
  const eqT = Lb(MID - 200, 196, tr('相同的骨架', 'The same skeleton'), { size: 26, c: C.dim, w: 400, align: 'center' }); appear(eqT, T('b1') + 0.3);
  function rowIcons(i, cx, col, t) {
    const y = ry[i];
    if (i === 0) { const p = R(g, cx - 26, y - 26, 52, 52, col, { stroke: K, 'stroke-width': 6 }); appear(p, t); F((tt) => p.setAttribute('transform', `translate(${cx} ${y}) scale(${(1 + 0.1 * Math.sin((tt - t) * 5)).toFixed(3)}) translate(${-cx} ${-y})`)); }
    if (i === 1) { const bar = R(g, cx + 10, y - 44, 22, 88, K); appear(bar, t); [-30, 0, 30].forEach((dy, k) => { const sq = R(g, cx - 26, y + dy - 11, 22, 22, col, { stroke: K, 'stroke-width': 5 }), w = Ln(g, cx - 90, y + dy, cx - 26, y + dy, K, 5); appear(sq, t + 0.08 * k); appear(w, t + 0.08 * k); const pk = packet(g, 16, K); [0, 1.4, 2.8, 4.2].forEach((d) => pk.ride(t + 0.3 + k * 0.4 + d, 0.5, [[cx - 130, y + dy], [cx - 30, y + dy]])); }); }
    if (i === 2) { const e = tag(world, cx - 150, y - 24, cx < MID ? 'agent:main:main' : 'agent:main:telegram:dm:…', { bg: col, c: K, size: 26 }); e.style.left = (cx - (cx < MID ? 122 : 196)) + 'px'; wipe(e, t, { dir: 'l', d: 0.3 }); }
    if (i === 3) { const r = ring(g, cx, y, 36, K, { w: 7, dot: 18, dotc: K, rest: 180 }); const f = Ci(g, cx, y, 18, col); appear(r.grp, t); appear(f, t); r.spin(t, s.end, 1.8, 180); }
  }
  names.forEach((n, i) => { const e = Lb(MID - 200, ry[i] - 24, n, { cls: 'hd', size: tr(40, 32), w: 400, align: 'center' }); wipe(e, rw[i] - 0.1, { dir: 'l', d: 0.3 }); rowIcons(i, LXC, RD, rw[i]); rowIcons(i, RXC, GD, rw[i] + 0.1); sfx('pop', rw[i], { g: 0.5 });
    const ln = R(g, 160, ry[i] + 58, 1600, 2, C.dim); appear(ln, rw[i]); });
  // 记忆文件：连文件名都相同
  const fn = ['SOUL.md', 'USER.md', 'MEMORY.md'], t3 = T('b3'), tf = Tw('b3', '文件名', 'file names');
  has('oc.workspace.soulfile', 'SOUL.md'); has('oc.memory.user', '`USER.md`'); has('oc.memory.long', '`MEMORY.md`'); has('hm.prompt.three', '`SOUL.md`'); has('hm.memory.files', '**MEMORY.md**'); has('hm.memory.files', '**USER.md**');
  const mL = Lb(MID - 220, 764, tr('记忆：Markdown 文件', 'Memory: Markdown files'), { cls: 'hd', size: tr(34, 28), w: 440, align: 'center' }); wipe(mL, Tw('b3', '记忆', 'memory') - 0.1, { dir: 'l', d: 0.3 });
  [LXC, RXC].forEach((cx, side) => fn.forEach((n, k) => { const x = (side ? cx - 180 : cx - 250) + k * 130, ic = fileIcon(g, x + 50, 720, 64, 82, K, { w: 5, fill: side ? GD : RD }), nm = Lb(x, 812, n, { size: 24, w: 164, align: 'center' });
    const t = Tw('b3', 'Markdown', 'Markdown') - 0.1 + k * 0.1 + side * 0.05; appear(ic, t); appear(nm, tf + k * 0.12); if (!side) { sfx('tick', t, { g: 0.4 }); sfx('blip', tf + k * 0.12, { g: 0.5 }); } }));

  // ═══ 第一站（下半）：定时、本机执行、许可、互相迁移 ═══
  const OY = 1140, sy = [OY + 250, OY + 370, OY + 490], t4 = T('b4'), t5 = T('b5');
  heads(0, OY + 70, t4 - 0.5);
  const sn = [tr('定时启动', 'Scheduled runs'), tr('工具默认在本机执行', 'Tools run locally by default'), tr('MIT 许可', 'MIT license')], sw = [Tw('b4', '定时', 'schedule'), Tw('b4', '本机', 'locally'), Tw('b4', 'MIT', 'MIT')];
  has('oc.heartbeat.def', 'periodic agent turns'); has('hm.cron.fresh', 'run in fresh agent sessions'); has('oc.readme.sandbox', 'Tools run on the host for the main session'); has('hm.tools.default', 'Run on your machine (default)');
  if (D.repo.oc.license !== 'MIT' || D.repo.hm.license !== 'MIT') console.warn('license mismatch');
  sn.forEach((n, i) => { const e = Lb(MID - 260, sy[i] - 24, n, { cls: 'hd', size: tr(40, 30), w: 520, align: 'center' }); wipe(e, sw[i] - 0.1, { dir: 'l', d: 0.3 }); sfx('pop', sw[i], { g: 0.5 }); appear(R(g, 160, sy[i] + 58, 1600, 2, C.dim), sw[i]);
    [[LXC, RD], [RXC, GD]].forEach(([cx, col], side) => { const t = sw[i] + side * 0.1, y = sy[i];
      if (i === 0) { const f = Ci(g, cx, y, 34, col); appear(f, t); const ck = clock(g, cx, y, 34, K, { w: 6 }); appear(ck.grp, t); ck.run(t, s.end, 1.6); }
      if (i === 1) { const a = tag(world, cx - 150, y - 22, 'exec', { bg: K, c: C.paper, size: 24 }), ar = arrow(g, cx - 60, y, cx + 20, y, K, 6), b = tag(world, cx + 34, y - 26, tr('本机', 'host'), { bg: col, c: K, size: 28, cls: 'hd' }); appear(a, t); appear(ar, t + 0.1); appear(b, t + 0.2); }
      if (i === 2) { const m = tag(world, cx - 46, y - 26, 'MIT', { bg: col, c: K, size: 30, cls: 'mono7' }); appear(m, t); } }); });
  // 互相迁移的两条命令
  const my = OY + 640, tm5 = Tw('b5', '一条命令', 'a command');
  const c1 = has('hm.readme.migrate', 'hermes claw migrate'), c2 = has('oc.migrate.cmd', 'openclaw migrate hermes');
  const a1 = arrow(g, LXC + 40, my, RXC - 40, my, K, 8), l1 = tag(world, MID - 170, my - 62, c1, { bg: GD, c: K, size: 30, cls: 'mono7' });
  const a2 = arrow(g, RXC - 40, my + 110, LXC + 40, my + 110, K, 8), l2 = tag(world, MID - 206, my + 48, c2, { bg: RD, c: K, size: 30, cls: 'mono7' });
  const e1 = [Lb(LXC - 200, my - 22, tr('OpenClaw 的数据', 'OpenClaw data'), { size: 26, w: 230, align: 'right' }), Lb(RXC - 30, my - 22, tr('→ Hermes', '→ Hermes'), { size: 26 })], e2 = [Lb(RXC - 30, my + 88, tr('Hermes 的数据', 'Hermes data'), { size: 26 }), Lb(LXC - 200, my + 88, tr('OpenClaw ←', 'OpenClaw ←'), { size: 26, w: 230, align: 'right' })];
  appear(a1, tm5 - 0.2); slam(l1, tm5, { from: 1.15, d: 0.3 }); e1.forEach((e) => appear(e, tm5 + 0.1)); sfx('whoosh', tm5 - 0.2, { g: 0.4 });
  appear(a2, Tw('b5', '对方', 'the other') - 0.3); slam(l2, Tw('b5', '对方', 'the other') - 0.1, { from: 1.15, d: 0.3 }); e2.forEach((e) => appear(e, Tw('b5', '对方', 'the other'))); sfx('whoosh', Tw('b5', '对方', 'the other') - 0.3, { g: 0.4 });
  [0, 1.2, 2.4].forEach((d) => { const p = packet(g, 20, K); p.ride(tm5 + 0.3 + d, 0.9, [[LXC + 40, my], [RXC - 60, my]]); const q = packet(g, 20, K); q.ride(Tw('b5', '对方', 'the other') + 0.2 + d, 0.9, [[RXC - 40, my + 110], [LXC + 60, my + 110]]); });

  // ═══ 第二站：差别 ═══
  const DX = 2200, dy0 = 250, pitch = 118, t6 = T('b6');
  heads(DX, 90, t6 - 0.6);
  const rows = [
    [tr('中心', 'Center'), tr('网关', 'the gateway'), tr('核心', 'the core'), Tw('b6', '中心', 'center') - 0.2],
    [tr('循环', 'Loop'), tr('可以整个换掉', 'swappable'), tr('只有一个', 'exactly one'), T('b7')],
    [tr('中途的消息', 'Mid-turn message'), tr('默认注入', 'injected by default'), tr('默认打断', 'interrupts by default'), T('b8')],
    [tr('私聊', 'Direct messages'), tr('默认并入主会话', 'merge into the main session'), tr('按聊天分开', 'one session per chat'), T('b9')],
    [tr('记忆', 'Memory'), tr('笔记 + 检索', 'notes + search'), tr('限额 + 技能', 'caps + skills'), T('b10')],
    [tr('出发点', 'Origin'), tr('桥接聊天软件', 'a chat bridge'), tr('会调用工具的模型', 'a tool-calling model'), T('b11')],
  ];
  const GL = DX + 230, GR = DX + 1200, TL = DX + 350, TRX = DX + 1310;      // 左右两格：小图的中心 x 与文字的 x
  const hi = R(g, DX + 140, dy0 - 52, 1640, 104, 'none', { stroke: K, 'stroke-width': 6 }); appear(hi, rows[0][3]);
  F((t) => { let k = 0; for (let i = 0; i < rows.length; i++) if (t >= rows[i][3] - 0.15) k = i; hi.setAttribute('y', dy0 - 52 + k * pitch); });
  rows.forEach(([n, a, b, t], i) => {
    const y = dy0 + i * pitch;
    const nm = tag(world, DX + MID - 130, y - 26, n, { bg: K, c: C.paper, size: tr(30, 24), cls: 'hd', pad: '8px 16px' }); nm.style.left = ''; css(nm, { left: (DX + MID - 130) + 'px', width: '260px', textAlign: 'center', boxSizing: 'border-box' });
    const ta = Lb(TL, y - 24, a, { cls: 'hd', size: tr(38, 28) }), tb = Lb(TRX, y - 24, b, { cls: 'hd', size: tr(38, 28) });
    wipe(nm, t - 0.1, { dir: 'l', d: 0.3 }); wipe(ta, t + 0.15, { dir: 'l', d: 0.3 }); wipe(tb, t + 0.4, { dir: 'l', d: 0.3 }); sfx('pop', t - 0.1, { g: 0.5 }); sfx('tick', t + 0.15, { g: 0.4 }); sfx('tick', t + 0.4, { g: 0.4 });
    const E = s.end;
    if (i === 0) {   // 中心：网关（方块带插口） / 核心（沙漏的腰）
      const hub = R(g, GL - 30, y - 30, 60, 60, RD, { stroke: K, 'stroke-width': 6 }); appear(hub, t); [-34, 34].forEach((d) => { appear(Ln(g, GL - 70, y + d * 0.5, GL - 30, y + d * 0.5, K, 5), t); appear(Ln(g, GL + 30, y + d * 0.5, GL + 70, y + d * 0.5, K, 5), t); });
      for (let k = 0; k < 12; k++) { const a = t + 0.5 + k * 1.3; const p = packet(g, 14, K); p.ride(a, 0.5, [[GL - 110, y + 17 * (k % 2 ? 1 : -1)], [GL - 34, y + 17 * (k % 2 ? 1 : -1)]]); const q = packet(g, 14, K); q.ride(a + 0.3, 0.7, [[GR, y - 70], [GR, y + 70]]); }
      const wst = Pa(g, `M${GR - 50},${y - 38} L${GR + 50},${y - 38} L${GR + 16},${y - 10} L${GR + 16},${y + 10} L${GR + 50},${y + 38} L${GR - 50},${y + 38} L${GR - 16},${y + 10} L${GR - 16},${y - 10} Z`, { fill: GD, stroke: K, 'stroke-width': 6, 'stroke-linejoin': 'miter' }); appear(wst, t + 0.2);
    }
    if (i === 1) {   // 循环：插槽里的卡带轮换 / 一个圆环
      const slot = R(g, GL - 44, y - 34, 88, 68, 'none', { stroke: K, 'stroke-width': 5, 'stroke-dasharray': '8 6' }), c = R(g, GL - 30, y - 22, 60, 44, RD, { stroke: K, 'stroke-width': 5 }), rr = ring(g, GL, y, 12, K, { w: 4, dot: 8, rest: 180 }); appear(slot, t); appear(c, t); appear(rr.grp, t); rr.spin(t, E, 1.2, 180);
      F((tt) => { const ph = ((tt - t) % 1.6) / 1.6, off = tt < t ? 0 : ph < 0.2 ? lerp(80, 0, ease.out3(ph / 0.2)) : ph > 0.85 ? lerp(0, -80, (ph - 0.85) / 0.15) : 0; c.setAttribute('transform', `translate(${off.toFixed(1)} 0)`); rr.grp.setAttribute('transform', `translate(${off.toFixed(1)} 0)`); c.setAttribute('opacity', tt >= t && Math.abs(off) < 60 ? 1 : 0); });
      const r1 = ring(g, GR, y, 34, K, { w: 7, dot: 16, rest: 180 }), f1 = Ci(g, GR, y, 16, GD); appear(r1.grp, t + 0.2); appear(f1, t + 0.2); r1.spin(t + 0.2, E, 1.8, 180);
    }
    if (i === 2) {   // 中途的消息：并进正在转的圆环 / 圆环停下重来
      const r1 = ring(g, GL, y, 30, K, { w: 6, dot: 14, rest: 180 }), f1 = Ci(g, GL, y, 14, RD); appear(r1.grp, t); appear(f1, t); r1.spin(t, E, 1.5, 180);
      const r2 = ring(g, GR, y, 30, K, { w: 6, dot: 14, rest: 180 }), f2 = Ci(g, GR, y, 14, GD); appear(r2.grp, t + 0.2); appear(f2, t + 0.2);
      const ks = []; for (let k = 0; k < 6; k++) { const a = t + 0.4 + k * 1.7; const p = packet(g, 16, K); p.ride(a, 0.5, [[GL - 110, y], [GL - 32, y]]); const q = packet(g, 16, K); q.ride(a, 0.5, [[GR - 110, y], [GR - 32, y]]); ks.push([a + 0.5, 180 + 300], [a + 0.5 + 0.001, 180], [a + 0.5 + 0.25, 180]); if (k < 5) ks.push([a + 1.7 + 0.499, 180 + 300]); }
      r2.key([[t + 0.2, 180], [t + 0.9, 480], ...ks.slice(1)]);
      F((tt) => { let fl = false; for (let k = 0; k < 6; k++) { const a = t + 0.9 + k * 1.7; if (tt >= a && tt < a + 0.25) fl = true; } r2.circ.setAttribute('stroke', fl ? GD : K); });
    }
    if (i === 3) {   // 私聊：两个方块进一条线 / 各走各的线
      appear(Ln(g, GL - 30, y, GL + 80, y, K, 6), t); appear(Ln(g, GR - 30, y - 18, GR + 80, y - 18, K, 6), t + 0.2); appear(Ln(g, GR - 30, y + 18, GR + 80, y + 18, K, 6), t + 0.2);
      for (let k = 0; k < 5; k++) { const a = t + 0.3 + k * 1.5; const p1 = packet(g, 16, RD), p2 = packet(g, 16, RD); p1.ride(a, 0.7, [[GL - 110, y - 24], [GL - 30, y], [GL + 70, y]]); p2.ride(a + 0.25, 0.7, [[GL - 110, y + 24], [GL - 30, y], [GL + 40, y]]);
        const q1 = packet(g, 16, GD), q2 = packet(g, 16, GD); q1.ride(a, 0.7, [[GR - 110, y - 18], [GR + 70, y - 18]]); q2.ride(a + 0.25, 0.7, [[GR - 110, y + 18], [GR + 70, y + 18]]); }
    }
    if (i === 4) {   // 记忆：按天累积的笔记 + 放大镜 / 有上限的条 + 技能文件
      [0, 1, 2].forEach((k) => appear(fileIcon(g, GL - 58 + k * 18, y - 34 + k * 6, 44, 56, K, { w: 4, fill: RD }), t + k * 0.1)); const mg = Ci(g, GL + 52, y - 6, 16, 'none', { stroke: K, 'stroke-width': 5 }), mh = Ln(g, GL + 63, y + 6, GL + 76, y + 20, K, 5); appear(mg, t + 0.3); appear(mh, t + 0.3);
      const bar = R(g, GR - 70, y - 14, 84, 28, 'none', { stroke: K, 'stroke-width': 5 }), fl = R(g, GR - 70, y - 14, 84, 28, GD), sk = fileIcon(g, GR + 34, y - 30, 46, 58, K, { w: 4, fill: GD }); appear(bar, t + 0.2); appear(sk, t + 0.4);
      F((tt) => { const k = tt < t + 0.2 ? 0 : 0.35 + 0.6 * Math.abs(Math.sin((tt - t) * 0.9)); fl.setAttribute('width', (84 * Math.min(1, k)).toFixed(1)); fl.setAttribute('opacity', tt >= t + 0.2 ? 1 : 0); });
    }
    if (i === 5) {   // 出发点：年份
      const y1 = tag(world, GL - 62, y - 22, D.names[0].from.slice(0, 7), { bg: RD, c: K, size: 26, cls: 'mono7' }), y2 = tag(world, GR - 62, y - 22, D.hmModels[0].d.slice(0, 7), { bg: GD, c: K, size: 26, cls: 'mono7' }); appear(y1, t + 0.1); appear(y2, t + 0.3);
    }
  });

  camTrack(cam, s.start, { x: 960, y: 500, z: 1.1 }, [
    [c0 - 0.5, { x: 960, y: 540, z: 1 }, 2.4, { ease: 'power2.out', sfx: false }],
    [T('b2'), { x: 960, y: 520, z: 1.06 }, 4.0, { ease: 'sine.inOut', sfx: false }],
    [t3 - 0.2, { x: 960, y: 600, z: 1.08 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t4 - 0.6, { x: 960, y: OY + 500, z: 1 }, 1.1],
    [t4 + 0.8, { x: 960, y: OY + 480, z: 1.05 }, 4.0, { ease: 'sine.inOut', sfx: false }],
    [t5 - 0.2, { x: 960, y: OY + 600, z: 1.08 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t6 - 0.8, { x: DX + 960, y: 540, z: 1 }, 1.2],
    [T('b7') - 0.2, { x: DX + 960, y: 520, z: 1.04 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [T('b8') - 0.2, { x: DX + 960, y: 560, z: 1.06 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [T('b9') - 0.2, { x: DX + 940, y: 580, z: 1.04 }, 3.8, { ease: 'sine.inOut', sfx: false }],
    [T('b10') - 0.2, { x: DX + 980, y: 600, z: 1.06 }, 3.8, { ease: 'sine.inOut', sfx: false }],
    [T('b11') - 0.2, { x: DX + 960, y: 560, z: 1 }, 4.2, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
