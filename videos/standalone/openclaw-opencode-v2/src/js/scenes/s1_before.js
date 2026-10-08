// 01 一年前的 harness。中性皮肤：一页往下读的记录，镜头按站往下移。
// 站：定义（循环示意）→ OpenCode 1.0 的循环源码 → 状态存在哪里（实测的数据目录、写锁、内存里的排队）→ 一年的时间线（两条泳道）→ 四个时刻。
const midTrunc = (s, n) => (s.length <= n ? s : s.slice(0, Math.ceil(n / 2) - 1) + '…' + s.slice(s.length - Math.floor(n / 2)));
scene('before', ({ root, s, c0 }) => {
  const { world, g } = stage(root, 'n');
  const cam = makeCamera(world);
  const X = 260, Wd = 1440, E = D_();

  // ── 站 1：harness 是什么（示意）──
  const Y1 = 0;
  const big = tx(world, 'ser', X, Y1 + 170, 'harness', { fontSize: '150px' });
  const r101 = nRow(world, g, X, Y1 + 470, 760, 101, tr('包在模型外面的那层程序', 'the program around the model'), { cls: 'ser6', size: 48 });
  slide(big, c0 + 0.1, { y: 40, d: 0.55, ease: 'power3.out' }); sfx('thud', c0 + 0.15, { g: 0.6 });
  r101.in(T('a1', { zh: '包在', en: 'wrapped' }));
  const cx = 1420, cy = Y1 + 470, rr = 250;
  const ring = loopRing(g, cx, cy, rr, { w: 6, dot: 28 });
  const mdl = R(g, cx - 100, cy - 100, 200, 200, C.ink);
  const mlab = tx(world, 'ser', cx - 100, cy - 36, tr('模型', 'model'), { fontSize: '56px', color: C.paper, width: '200px', textAlign: 'center' });
  drawH(ring.circ, T('a1') + 0.2, 0.9); wipe(mdl, T('a1', { zh: '模型', en: 'model' }) - 0.1, { dir: 'b', d: 0.4 }); appear(mlab, T('a1', { zh: '模型', en: 'model' }) + 0.2);
  const tag1 = tx(world, 'nlab', cx - 300, cy - 336, tr('对话 + 工具清单 →', 'conversation + tools →'), { fontSize: '32px', color: C.ink });
  const tag2 = tx(world, 'nlab', cx + 270, cy - 40, tr('工具调用', 'tool call'), { fontSize: '32px', color: C.ink });
  const tag3 = tx(world, 'nlab', cx - 70, cy + 276, tr('执行', 'run it'), { fontSize: '32px', color: C.ink });
  const tag4 = tx(world, 'nlab', cx - 440, cy + 150, tr('← 结果接回', '← result back'), { fontSize: '32px', color: C.ink });
  const note1 = tx(world, 'nlab', cx + 170, cy + 290, tr('示意', 'schematic'), { fontSize: '26px' });
  wipe(tag1, T('a2', { zh: '对话', en: 'conversation' }), { dir: 'l', d: 0.45 }); sfx('tick', T('a2', { zh: '对话', en: 'conversation' }), { g: 0.4 });
  wipe(tag2, T('a3', { zh: '执行', en: 'runs' }), { dir: 'l', d: 0.4 }); sfx('tick', T('a3', { zh: '执行', en: 'runs' }), { g: 0.4 });
  wipe(tag3, T('a3', { zh: '工具', en: 'tools' }), { dir: 'l', d: 0.4 });
  wipe(tag4, T('a3', { zh: '结果', en: 'results' }), { dir: 'r', d: 0.45 }); sfx('tick', T('a3', { zh: '结果', en: 'results' }), { g: 0.4 });
  appear(note1, T('a2'));
  ring.spin(T('a2'), Tend('a3') + 0.6, 2.2);

  // ── 站 2：OpenCode 1.0 的循环（源码原文，v1.0.0 packages/opencode/src/session/prompt.ts）──
  const Y2 = 1200;
  const r102 = nRow(world, g, X, Y2 + 190, Wd, 102, '2025-10-31', { size: 76 });
  const n102 = tx(world, 'ser6', X + 520, Y2 + 190 - 12 - 58, 'OpenCode 1.0', { fontSize: '52px' }); const d102 = brandDot(g, X + 480, Y2 + 190 - 52, 'oc', 24);
  r102.in(T('a4') - 0.6); wipe(n102, T('a4') - 0.3, { dir: 'l', d: 0.5 }); appear(d102, T('a4') - 0.3);
  const strip4 = (s_) => s_.replace(/^ {4}/, '');
  const L1 = ent('oc1_loop_start').text.split('\n'), L2 = ent('oc1_continue').text.split('\n');
  const code = nCode(world, X + 112, Y2 + 260, [
    [225, strip4(has('oc1_loop_start', L1[0]))], [226, strip4(has('oc1_loop_start', L1[1]))], [null, '  …'],
    [257, strip4(has('oc1_stream', ent('oc1_stream').text))], [308, strip4(has('oc1_stop', ent('oc1_stop').text))], [null, '    …'],
    [412, strip4(has('oc1_continue', L2[0]))], [413, strip4(has('oc1_continue', L2[1]))], [414, strip4(has('oc1_continue', L2[2]))], [null, '}'],
  ], { size: 32 });
  const src2 = tx(world, 'nlab', X, Y2 + 260 + code.h + 18, 'anomalyco/opencode v1.0.0 · ' + ent('oc1_loop_start').path, { fontSize: '26px' });
  const tCode = Math.min(T('a5') - 0.1, T('a4', 'OpenCode') + 0.9);
  code.rows.forEach((r, i) => { appear(r.no, tCode + i * 0.05); wipe(r.el, tCode + i * 0.05, { dir: 'l', d: 0.35 }); });
  sfx('blip', T('a5') - 0.1, { g: 0.4 }); appear(src2, T('a5') + 0.3);
  code.hl(1, T('a5', { zh: '循环', en: 'loop' }), T('a6')); sfx('pop', T('a5', { zh: '循环', en: 'loop' }), { g: 0.5 });
  code.hl(3, T('a6', { zh: '请求', en: 'request' }), T('a7')); code.hl(4, T('a6', { zh: '请求', en: 'request' }) + 0.15, T('a7'));
  code.hl(6, T('a7', { zh: '工具', en: 'tool' }), Tend('a7') + 0.6); code.hl(7, T('a7', { zh: '再转', en: 'around' }), Tend('a7') + 0.6);
  sfx('pop', T('a6', { zh: '请求', en: 'request' }), { g: 0.45 }); sfx('pop', T('a7', { zh: '工具', en: 'tool' }), { g: 0.45 });
  const ring2 = loopRing(g, 1640, Y2 + 560, 130, { w: 5, dot: 22 });
  const r2lab = tx(world, 'nlab', 1500, Y2 + 720, tr('一圈 = 一次请求', 'one turn = one request'), { fontSize: '28px' });
  drawH(ring2.circ, T('a5') + 0.4, 0.7); appear(r2lab, T('a6')); ring2.spin(T('a6'), Tend('a7') + 0.4, 1.6);

  // ── 站 3：状态存在哪里（实测：opencode 1.0.0 跑一次之后的数据目录；写锁；内存里的排队）──
  const Y3 = 2400;
  const r103 = nRow(world, g, X, Y3 + 170, Wd, 103, tr('状态', 'State'), { size: 76 });
  r103.in(T('a8') - 0.6);
  const files = E.exp.v1.storage.map((p) => midTrunc(p, 52));
  const fy0 = Y3 + 240;
  const fEls = files.map((f, i) => tx(world, 'nmono', X + 40, fy0 + i * 50, esc(f), { fontSize: '27px', lineHeight: '50px' }));
  const flab = tx(world, 'nlab', X + 40, fy0 + files.length * 50 + 14, tr('实测：opencode 1.0.0 运行一次后的数据目录（路径中段已省略）', 'measured: the data directory after one run of opencode 1.0.0 (middle of paths elided)'), { fontSize: '26px' });
  seq(fEls, Math.min(T('a8') + 0.1, T('a8', { zh: '每条', en: 'One' })), 0.12, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.3 }); });
  appear(flab, T('a8', { zh: '文件', en: 'file' }));
  // 一把写锁罩住全部文件
  const brX = X + 930, br = Pa(g, `M${brX},${fy0 + 6} L${brX + 30},${fy0 + 6} L${brX + 30},${fy0 + files.length * 50 - 6} L${brX},${fy0 + files.length * 50 - 6}`, { stroke: C.ink, 'stroke-width': 4 });
  const lk = ent('oc1_lock').text.split('\n');
  const lock = tx(world, 'nmono', brX + 56, fy0 + files.length * 25 - 40, esc(has('oc1_lock', lk[4]).trim()), { fontSize: '24px' });
  const lockSrc = tx(world, 'nlab', brX + 56, fy0 + files.length * 25 + 4, 'storage.ts:' + (ent('oc1_lock').line + 4), { fontSize: '24px' });
  drawH(br, T('a9', { zh: '写锁', en: 'lock' }) - 0.2, 0.5); wipe(lock, T('a9', { zh: '写锁', en: 'lock' }), { dir: 'l', d: 0.5 }); appear(lockSrc, T('a9', { zh: '写锁', en: 'lock' }) + 0.3);
  sfx('thud', T('a9', { zh: '写锁', en: 'lock' }), { g: 0.5 });
  // 排队：只在进程内存里（一条进程生命线上的一个框）
  const qY = fy0 + files.length * 50 + 150;
  const qLine = lifeLine(g, X, qY, X + Wd);
  const qBox = R(g, X + 420, qY - 46, 520, 92, C.paper, { stroke: C.ink, 'stroke-width': 4 });
  const qTxt = tx(world, 'nmono', X + 446, qY - 22, esc(has('oc1_queue_map', 'const queued = new Map<')), { fontSize: '30px' });
  const qLab = tx(world, 'nlab', X, qY + 26, tr('进程内存 · prompt.ts:72', 'process memory · prompt.ts:72'), { fontSize: '26px' });
  qLine.grow(T('a10') - 0.3, T('a10') + 0.6, X + Wd);
  wipe(qBox, T('a10', { zh: '排队', en: 'queue' }), { dir: 'l', d: 0.4 }); appear(qTxt, T('a10', { zh: '排队', en: 'queue' }) + 0.25); appear(qLab, T('a10', { zh: '内存', en: 'memory' }));
  sfx('pop', T('a10', { zh: '排队', en: 'queue' }), { g: 0.5 });

  // ── 站 4：一年的时间线。两条泳道：上 OpenCode，下 OpenClaw；标签在标记的上方或下方错开 ──
  const Y4 = 3600, ax0 = 300, ax1 = 1780, d0 = Date.parse('2025-10-01'), d1 = Date.parse('2026-10-15');
  const xd = (iso) => ax0 + (Date.parse(iso) - d0) / (d1 - d0) * (ax1 - ax0);
  const axY = Y4 + 130;
  const axis = Ln(g, ax0, axY, ax1, axY, C.ink, 3);
  const ticks = [];
  for (const m of ['2025-11', '2026-01', '2026-03', '2026-05', '2026-07', '2026-09']) {
    const x = xd(m + '-01'); ticks.push(Ln(g, x, axY - 10, x, axY + 10, C.ink, 3));
    ticks.push(tx(world, 'seqn', x - 52, axY - 52, m, { fontSize: '24px' }));
  }
  drawH(axis, T('h1') - 0.5, 0.8); seq(ticks, T('h1') - 0.3, 0.04, (e, t) => appear(e, t));
  const lane = (y, which, label, t) => {
    const r_ = Ln(g, ax0, y, ax1, y, C.rule, 2), d = brandDot(g, ax0 - 128, y - 12, which, 24), l = tx(world, 'ser6', ax0 - 92, y - 74, label, { fontSize: '36px' });
    drawH(r_, t, 0.6); appear(d, t); wipe(l, t, { dir: 'l', d: 0.4 });
  };
  // 一个事件：泳道上的方块（空心 = 还没发生）＋ 标签（above：在线上方；否则在下方）＋ 日期
  const ev = (iso, y, label, o = {}) => {
    const x = xd(iso), mk = o.ghost ? R(g, x - 10, y - 10, 20, 20, C.paper, { stroke: C.ink, 'stroke-width': 3 }) : R(g, x - 10, y - 10, 20, 20, C.ink);
    const ly = o.above ? y - 92 : y + 22;
    const lb = tx(world, 'nmono', x - 10, ly, esc(label), { fontSize: '28px', color: o.ghost ? C.ink2 : C.ink });
    const dt = tx(world, 'seqn', x - 10, ly + 38, iso, { fontSize: '24px' });
    return { in(t) { appear(mk, t); wipe(lb, t + 0.08, { dir: 'l', d: 0.4 }); appear(dt, t + 0.2); sfx('tick', t, { g: 0.45 }); } };
  };
  const yOC = Y4 + 300, yCL = Y4 + 520;
  lane(yOC, 'oc', 'OpenCode', T('h1'));
  ev('2025-10-31', yOC, '1.0', { above: true }).in(T('h1') + 0.1);
  ev('2026-02-14', yOC, '1.2 → SQLite', { above: true }).in(T('h2', '1.2') - 0.3);
  ev('2026-03-22', yOC, '1.3 → Node.js').in(T('h3', '1.3') - 0.3);
  ev('2026-09-11', yOC, 'v2.0.0', { above: true, ghost: true }).in(Tend('h3') + 0.1);
  lane(yCL, 'cl', 'OpenClaw', T('h4'));
  ev('2025-11-24', yCL, tr('warelay（WhatsApp）', 'warelay (WhatsApp)'), { above: true }).in(T('h4', 'warelay') - 0.2);
  ev('2025-12-19', yCL, 'CLAWDIS').in(T('h6', 'CLAWDIS') - 0.2);
  ev('2026-07-13', yCL, '2026.7.1', { above: true }).in(T('a11', { zh: '7 月', en: 'July' }) - 0.2);
  ev('2026-08-31', yCL, '2.0', { ghost: true }).in(T('a11', { zh: '7 月', en: 'July' }) + 0.2);
  // CLAWDIS：网关在 harness 外面（示意）——两个通道 → 网关 → 循环（Pi）。放在左下
  const gx = 300, gy = Y4 + 660;
  const ch1 = R(g, gx, gy, 180, 64, C.paper, { stroke: C.ink, 'stroke-width': 3 }), ch2 = R(g, gx, gy + 92, 180, 64, C.paper, { stroke: C.ink, 'stroke-width': 3 });
  const ch1t = tx(world, 'nmono', gx + 16, gy + 14, 'WhatsApp', { fontSize: '26px' }), ch2t = tx(world, 'nmono', gx + 16, gy + 106, 'Telegram', { fontSize: '26px' });
  const gw = R(g, gx + 290, gy, 190, 156, C.ink), gwt = tx(world, 'ser', gx + 290, gy + 52, tr('网关', 'gateway'), { fontSize: '42px', color: C.paper, width: '190px', textAlign: 'center' });
  const a1_ = Pa(g, `M${gx + 182},${gy + 32} L${gx + 286},${gy + 60}`, { stroke: C.ink, 'stroke-width': 3 }), a2_ = Pa(g, `M${gx + 182},${gy + 124} L${gx + 286},${gy + 96}`, { stroke: C.ink, 'stroke-width': 3 });
  const pring = loopRing(g, gx + 650, gy + 78, 74, { w: 5, dot: 18 });
  const pt = tx(world, 'nmono', gx + 628, gy + 58, 'Pi', { fontSize: '30px' });
  const a3_ = Pa(g, `M${gx + 482},${gy + 78} L${gx + 572},${gy + 78}`, { stroke: C.ink, 'stroke-width': 3 });
  const hnote = tx(world, 'nlab', gx + 560, gy + 168, tr('harness（示意）', 'harness (schematic)'), { fontSize: '26px' });
  const tg = T('h7', 'WhatsApp');
  wipe(ch1, tg - 0.1, { dir: 'l', d: 0.3 }); appear(ch1t, tg); wipe(ch2, T('h7', 'Telegram') - 0.1, { dir: 'l', d: 0.3 }); appear(ch2t, T('h7', 'Telegram'));
  wipe(gw, T('h6', { zh: '网关', en: 'gateway' }), { dir: 'b', d: 0.4 }); appear(gwt, T('h6', { zh: '网关', en: 'gateway' }) + 0.2); sfx('thud', T('h6', { zh: '网关', en: 'gateway' }), { g: 0.5 });
  drawH(a1_, T('h7', 'Telegram') + 0.1, 0.3); drawH(a2_, T('h7', 'Telegram') + 0.2, 0.3);
  drawH(pring.circ, T('h7', { zh: '编程', en: 'coding' }), 0.6); appear(pt, T('h7', 'Pi')); drawH(a3_, T('h7', 'Pi'), 0.3); pring.spin(T('h8'), Tend('h8') + 0.5, 1.6);
  appear(hnote, T('h8', 'harness')); sfx('pop', T('h8', 'harness'), { g: 0.5 });
  // 2026.7.1 的会话存储：sessions.json + 每个会话一份 JSONL（v2026.7.1 docs/concepts/session.md:116–117）。放在右下
  const sx = 1160, sy = Y4 + 650;
  const sj = tx(world, 'nmono', sx, sy, 'sessions/sessions.json', { fontSize: '30px' });
  const jl = [0, 1, 2].map((i) => tx(world, 'nmono', sx + 30, sy + 52 + i * 46, esc(`sessions/<sessionId>.jsonl`), { fontSize: '28px', color: i ? C.ink2 : C.ink }));
  const ssrc = tx(world, 'nlab', sx, sy + 200, 'v2026.7.1 · ' + ent('claw71_store').path + ':' + ent('claw71_store').line, { fontSize: '24px' });
  has('claw71_store', 'sessions/sessions.json'); has('claw71_store', 'sessions/<sessionId>.jsonl');
  wipe(sj, T('a12', 'sessions'), { dir: 'l', d: 0.4 }); sfx('tick', T('a12', 'sessions'), { g: 0.45 });
  seq(jl, T('a12', 'JSONL') - 0.1, 0.1, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.3 }); });
  appear(ssrc, T('a12', 'JSONL') + 0.3);

  // ── 站 5：四个时刻 ──
  const Y5 = 4800;
  const big5 = tx(world, 'ser', X, Y5 + 90, tr('它没有处理的时刻', 'The moments it does not handle'), { fontSize: '72px' });
  wipe(big5, T('a13') - 0.6, { dir: 'l', d: 0.5 });
  const items = [[tr('进程半路退出', 'the process exits halfway'), 'a14', { zh: '退出', en: 'exits' }], [tr('上下文装不下', 'the context does not fit'), 'a14', { zh: '上下文', en: 'context' }],
    [tr('几个客户端同时连接', 'several clients at once'), 'a15', { zh: '客户端', en: 'clients' }], [tr('一条命令该不该放行', 'a command needs approval'), 'a15', { zh: '放行', en: 'approval' }]];
  const rows5 = items.map(([t_, id, w], i) => {
    const y = Y5 + 300 + i * 150;
    const r = nRow(world, g, X, y, Wd, 111 + i, t_, { cls: 'ser6', size: 56 });
    r.in(T(id, w) - 0.25);
    return { r, y };
  });
  // 每一行右侧一个线描的小图（示意）
  const px0 = X + Wd - 260;
  const p1 = lifeLine(g, px0, rows5[0].y - 40, px0 + 260); p1.grow(T('a14', { zh: '退出', en: 'exits' }), T('a14', { zh: '退出', en: 'exits' }) + 0.5, px0 + 160); p1.cut(T('a14', { zh: '退出', en: 'exits' }) + 0.5, px0 + 160);
  const fr = R(g, px0, rows5[1].y - 76, 220, 60, 'none', { stroke: C.ink, 'stroke-width': 4 });
  const fill2 = R(g, px0 + 4, rows5[1].y - 72, 280, 52, C.ink);
  wipe(fr, T('a14', { zh: '上下文', en: 'context' }) - 0.2, { dir: 'l', d: 0.3 }); wipe(fill2, T('a14', { zh: '上下文', en: 'context' }) + 0.1, { dir: 'l', d: 0.6, ease: 'none' });
  const cl3 = [0, 1, 2].map((i) => Pa(g, `M${px0},${rows5[2].y - 100 + i * 34} L${px0 + 200},${rows5[2].y - 66}`, { stroke: C.ink, 'stroke-width': 4 }));
  const cd3 = Ci(g, px0 + 210, rows5[2].y - 66, 14, C.ink);
  seq(cl3, T('a15', { zh: '客户端', en: 'clients' }), 0.1, (e, t) => drawH(e, t, 0.35)); appear(cd3, T('a15', { zh: '客户端', en: 'clients' }) + 0.35);
  const gate = Pa(g, `M${px0},${rows5[3].y - 16} L${px0},${rows5[3].y - 110} M${px0 + 220},${rows5[3].y - 16} L${px0 + 220},${rows5[3].y - 110} M${px0},${rows5[3].y - 70} L${px0 + 220},${rows5[3].y - 70}`, { stroke: C.ink, 'stroke-width': 4 });
  drawH(gate, T('a15', { zh: '放行', en: 'approval' }) - 0.1, 0.5);
  sfx('pop', T('a15', { zh: '放行', en: 'approval' }), { g: 0.45 });
  // 两个 v2 各改了什么：每一行末尾点上两个项目的颜色
  rows5.forEach(({ y }, i) => {
    const a = brandDot(g, X + Wd - 360, y - 52, 'cl', 22), b = brandDot(g, X + Wd - 324, y - 52, 'oc', 22);
    const t = T('a16', { zh: '两个', en: 'each' }) + i * 0.12; appear(a, t); appear(b, t + 0.06); sfx('tick', t, { g: 0.35 });
  });

  // ── 镜头：每站一个机位，站间往下移 ──
  camTrack(cam, s.start, { x: 960, y: Y1 + 520, z: 1.04 }, [
    [c0 + 0.1, { x: 980, z: 1.0 }, Math.max(1.2, T('a3') - c0), { sfx: false, room: 40 }],
    [T('a4') - 0.55, { x: 980, y: Y2 + 540, z: 1.0 }, 0.9],
    [null, { x: 960, z: 1.03 }, Math.max(1.2, T('a7') - T('a4')), { sfx: false, room: 30 }],
    [T('a8') - 0.55, { x: 960, y: Y3 + 520, z: 1.0 }, 0.9],
    [null, { x: 980, z: 1.03 }, Math.max(1.2, Tend('a10') - T('a8') - 1.0), { sfx: false, room: 30 }],
    // 时间线这一站横向撑满：整站始终在画面里，只做轻微的推近与平移
    [T('h1') - 0.6, { x: 990, y: Y4 + 480, z: 1.0 }, 0.9],
    [null, { x: 975, z: 1.02 }, Math.max(1.2, T('h6') - T('h1') - 1.2), { sfx: false, room: 30 }],
    [T('h6') - 0.3, { x: 950, y: Y4 + 500, z: 1.04 }, 0.9],
    [null, { x: 960, z: 1.05 }, Math.max(1.2, Tend('h8') - T('h6') - 1.0), { sfx: false, room: 30 }],
    [T('a11') - 0.2, { x: 1010, y: Y4 + 490, z: 1.04 }, 0.9],
    [null, { x: 1000, z: 1.05 }, Math.max(1.2, Tend('a12') - T('a11') - 1.0), { sfx: false, room: 30 }],
    [T('a13') - 0.6, { x: 960, y: Y5 + 470, z: 1.0 }, 0.9],
    [null, { x: 980, z: 1.03 }, Math.max(1.2, s.end - T('a13') - 0.5), { sfx: false, room: 40 }],
  ], s.end + 0.45);
});
