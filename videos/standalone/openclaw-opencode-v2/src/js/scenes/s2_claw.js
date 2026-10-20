// 02 OpenClaw 2.0（上）：一条消息的收与发。OpenClaw 皮肤（照其 2.0 Control UI）。
// 镜头沿一条横向的路线走，顶部一条细轨上标着各站；一枚珊瑚红的消息气泡沿轨走到哪一站，就讲哪一站。
// 站：A 版本与规模 → B 重构文档里的故障 → C 发送三步与危险窗口（上下两屏）→ D 接收日志与水位线 → E 运行中插话。
scene('claw', ({ root, s, c0 }) => {
  const { world, g, gt } = stage(root, 'cl');
  const cam = makeCamera(world);
  const SX = [0, 2000, 4000, 6000, 8000];
  const T2 = (id, zh, en) => T(id, { zh, en });

  // ── 顶部的路线：一条细轨 + 各站的胶囊 ──
  const railY = 96;
  const rail = Ln(g, 140, railY, 9800, railY, C.clBorder, 3);
  drawH(rail, c0, 1.2);
  const stops = [[SX[1], tr('故障', 'failure')], [SX[2], tr('发送', 'send')], [SX[3], tr('接收', 'receive')], [SX[4], tr('插话', 'mid-turn')]];
  const stopEls = stops.map(([x, l]) => { const d = Ci(g, x + 140, railY, 10, C.clBorder); const p = clPill(world, x + 170, railY - 24, l, 'out', 26); return { d, p }; });
  stopEls.forEach((o, i) => { appear(o.d, c0 + 0.3 + i * 0.1); appear(o.p, c0 + 0.3 + i * 0.1); });
  const msg = token(g, 64, 40, C.clAccent, { rx: 14 });

  // ── A：版本与规模 ──
  const A = SX[0];
  const ver = tx(world, 'clb', A + 140, 180, 'v2026.8.1', { fontSize: '150px' });
  const aka = clPill(world, A + 146, 372, 'AKA OpenClaw 2.0', 'acc', 34);
  const asrc = tx(world, 'clm', A + 146, 440, esc(srcOf('claw_rel_title', { ver: true })), { fontSize: '24px', color: C.clMuted });
  has('claw_rel_title', 'v2026.8.1 (AKA OpenClaw 2.0)');
  wipe(ver, T2('c1', '版本号', 'version') - 0.2, { dir: 'l', d: 0.55 }); sfx('thud', T2('c1', '版本号', 'version'), { g: 0.6 });
  slam(aka, T('c1', 'OpenClaw'), { from: 1.3 }); sfx('pop', T('c1', 'OpenClaw') + 0.05, { g: 0.6 }); appear(asrc, T('c1', 'OpenClaw') + 0.3);
  const num = tx(world, 'clb', A + 140, 530, '0', { fontSize: '170px' });
  const prs = clPill(world, A + 150, 750, 'pull requests', 'on', 34);
  const nsrc = tx(world, 'clm', A + 150, 818, esc(srcOf('claw_rel_scale', { ver: true })), { fontSize: '24px', color: C.clMuted });
  has('claw_rel_scale', '16,977 pull requests');
  appear(num, T('c2') - 0.1); countTo(num, 0, 16977, T('c2') - 0.1, Math.max(0.8, T2('c2', '拉取', 'pull') - T('c2'))); sfx('riser', T('c2') - 0.1, { g: 0.35 });
  sfx('thud', T2('c2', '拉取', 'pull'), { g: 0.6 }); wipe(prs, T2('c2', '拉取', 'pull'), { dir: 'l', d: 0.4 }); appear(nsrc, T2('c2', '拉取', 'pull') + 0.3);
  const mg = svg('g', {}, g); lobsterMascot(mg, A + 1330, 250, 380, { t0: c0 });
  fromTo(mg, T('c1') + 0.3, { y: 600 }, { y: 0, duration: 0.7, ease: 'back.out(1.5)', immediateRender: true }); sfx('pop', T('c1') + 0.7, { g: 0.5 });
  // 只看 harness 的部分：一条消息
  const only = clPill(world, A + 1290, 760, tr('只看和 harness 有关的部分', 'only the harness part'), 'out', 30);
  wipe(only, T('c3', 'harness'), { dir: 'l', d: 0.4 }); sfx('tick', T('c3', 'harness'), { g: 0.4 });
  const tMsg = T2('c4', '消息', 'message');
  msg.ride(tMsg, 0.5, [[A + 1520, 700], [A + 1520, railY]], { hold: 0 });
  msg.ride(tMsg + 0.5, Math.max(0.8, T('c5') - tMsg - 0.6), [[A + 1520, railY], [SX[1] + 140, railY]], { hold: 0 });
  sfx('pop', tMsg, { g: 0.6 });

  // ── B：重构文档里的故障（v2026.8.1 docs/concepts/message-lifecycle-refactor.md:30–37）──
  const B = SX[1];
  msg.ride(T('c5') - 0.1, 0.01, [[B + 140, railY], [B + 140, railY]], { hold: Tend('c7') - T('c5') + 0.6 });
  const bt = tx(world, 'clb', B + 140, 170, tr('重构文档记着的故障', 'The failure in the refactor notes'), { fontSize: '64px' });
  wipe(bt, T('c5') - 0.8, { dir: 'l', d: 0.5 });
  const gap = ent('claw_lc_gap').text.split('\n');
  const steps = [3, 4, 5, 6].map((i) => has('claw_lc_gap', gap[i].trim()));
  const card = clCard(world, B + 140, 300, 1130, 460);
  const marks = [['ok', 'ok'], ['ok', 'ok'], ['restart', 'warn'], ['lost', 'acc']];
  const rowsB = steps.map((st, i) => {
    const y = 336 + i * 100;
    const ig = clPill(world, B + 176, y + 12, marks[i][0], marks[i][1], 24);
    const tt = tx(world, 'clm', B + 330, y + 16, esc(st), { fontSize: '30px', color: C.clStrong });
    return { ig, tt };
  });
  const bsrc = tx(world, 'clm', B + 140, 786, esc(srcOf('claw_lc_gap', { ver: true })), { fontSize: '24px', color: C.clMuted });
  wipe(card, T('c5') - 0.5, { dir: 'b', d: 0.4 }); appear(bsrc, T('c5') - 0.2);
  const tB = [T2('c6', '确认', 'acknowledged'), T2('c6', '回复', 'reply'), T2('c7', '重启', 'restarted'), T2('c7', '丢了', 'lost')];
  rowsB.forEach((r, i) => { wipe(r.tt, tB[i] - 0.15, { dir: 'l', d: 0.35 }); appear(r.ig, tB[i]); sfx(i === 3 ? 'error' : i === 2 ? 'thud' : 'tick', tB[i], { g: i < 2 ? 0.45 : 0.6 }); });
  // 右边：一段对话。用户发来一条，回复写好了，却在发送前随进程一起没了（示意）
  const u = clBubble(world, B + 1290, 330, 470, 'Telegram', tr('明早八点提醒我开会', 'Remind me at 8 am'), { size: 30 });
  const rep = clBubble(world, B + 1330, 520, 430, 'OpenClaw', tr('好的，八点提醒你。', 'Sure, at 8.'), { size: 30, bg: C.clHover, whoC: C.clAccent });
  const repLost = clCard(world, B + 1330, 520, 430, 138, { dash: true, bg: C.clBg });
  const lostT = tx(world, 'cl', B + 1360, 566, tr('回复没有发出', 'reply never sent'), { fontSize: '28px', color: C.clAccent, fontWeight: 600 });
  const bnote = tx(world, 'cl', B + 1290, 690, tr('示意', 'schematic'), { fontSize: '24px', color: C.clMuted });
  slide(u, tB[0] - 0.3, { x: 60, d: 0.45 }); sfx('pop', tB[0] - 0.3, { g: 0.5 }); appear(bnote, tB[0]);
  slide(rep, tB[1], { y: 30, d: 0.45 });
  vanish(rep, tB[3]); appear(repLost, tB[3]); appear(lostT, tB[3] + 0.05);

  // ── C：发送三步（上屏）与恢复规则（下屏）──
  const Cx = SX[2];
  msg.ride(Tend('c7') + 0.6, Math.max(0.8, T('c8') - Tend('c7') - 0.7), [[B + 140, railY], [Cx + 140, railY]], { hold: 0 });
  const ct = tx(world, 'clb', Cx + 140, 150, tr('先写意图，再调平台，后记回执', 'Intent first, then the call, then the receipt'), { fontSize: '64px' });
  wipe(ct, T('c8') - 0.1, { dir: 'l', d: 0.5 });
  const cards = [['send intent', tr('发送意图写进库', 'intent written')], ['platform call', tr('调用平台接口', 'call the platform')], ['receipt', tr('记下回执', 'record receipt')]].map(([a, b], i) => {
    const x = Cx + 140 + i * 580, k = clCard(world, x, 320, 500, 210);
    tx(k, 'clm', 30, 26, a, { fontSize: '28px', color: C.clMuted }); tx(k, 'clb', 30, 86, b, { fontSize: '48px' });
    return { k, x };
  });
  const lnk = [0, 1].map((i) => Ln(g, cards[i].x + 504, 425, cards[i + 1].x - 4, 425, C.clBorder, 4));
  const tC = [T2('c8', '意图', 'intent'), T2('c9', '平台', 'platform'), T2('c9', '回执', 'receipt')];
  cards.forEach((c, i) => { wipe(c.k, tC[i] - 0.25, { dir: 'l', d: 0.4 }); sfx('tick', tC[i] - 0.25, { g: 0.45 }); });
  drawH(lnk[0], tC[1] - 0.3, 0.3); drawH(lnk[1], tC[2] - 0.3, 0.3);
  msg.ride(T('c8'), Math.max(0.5, tC[0] - T('c8')), [[Cx + 140, railY], [Cx + 140, 250], [cards[0].x + 250, 250], [cards[0].x + 250, 290]], { hold: tC[1] - tC[0] - 0.4 });
  msg.ride(tC[1] - 0.4, 0.4, [[cards[0].x + 250, 290], [cards[1].x + 250, 290]], { hold: tC[2] - tC[1] - 0.4 });
  const dur = clPill(world, cards[0].x + 30, 560, tr('已落库', 'durable'), 'ok', 28); appear(dur, tC[0]); sfx('pop', tC[0], { g: 0.6 });
  // 危险窗口：接口调了、回执没写、进程死了
  const winX = cards[1].x + 340, winW = cards[2].x - cards[1].x - 340 + 150;
  const win = R(gt, winX, 296, winW, 258, 'none', { stroke: C.clAccent, 'stroke-width': 5, 'stroke-dasharray': '16 12', rx: 18 });
  const tW = [T2('c10', '接口调了', 'call went'), T2('c10', '回执没写', 'no receipt'), T2('c10', '死了', 'died')];
  msg.ride(tW[0], 0.5, [[cards[1].x + 250, 290], [cards[1].x + 520, 290]], { hold: Tend('c14c') - tW[0] });
  wipe(win, tW[1] - 0.1, { dir: 'l', d: 0.45 }); sfx('tick', tW[1] - 0.1, { g: 0.45 });
  const kx = Cx + 140 + 1080 + 40;
  const kill = Pa(gt, `M${kx - 30},${380} L${kx + 30},${470} M${kx + 30},${380} L${kx - 30},${470}`, { stroke: C.clAccent, 'stroke-width': 8, 'stroke-linecap': 'round' });
  drawH(kill, tW[2], 0.25); sfx('error', tW[2], { g: 0.8 });
  const q = tx(world, 'clb', winX + 10, 600, tr('发出去没有？', 'sent or not?'), { fontSize: '44px', color: C.clMuted });
  wipe(q, T('c11'), { dir: 'l', d: 0.45 });
  const unk = clPill(world, winX - 20, 680, 'unknown_after_send', 'acc', 40);
  slam(unk, T('c12', 'unknown_after_send'), { from: 1.4 }); sfx('thud', T('c12', 'unknown_after_send') + 0.05, { g: 0.8 });
  const rsrc = tx(world, 'clm', winX - 20, 760, esc('src/infra/outbound/delivery-queue-recovery.ts:' + ent('claw_recovery_states').line), { fontSize: '24px', color: C.clMuted });
  has('claw_recovery_states', '"unknown_after_send"'); appear(rsrc, T('c12', 'unknown_after_send') + 0.4);
  // 下屏：对账的三种结果、至少一次、持久性策略
  const Yb = 1180;
  const rq = clQuote(world, Cx + 140, Yb + 40, 1000, 'claw_lc_reconcile', 'That hook classifies an interrupted send as `sent`, `not_sent`, or\n`unresolved`; only `not_sent` permits replay.', { size: 30, html: (s_) => s_.replace(/\n/g, ' ').replace(/only `not_sent` permits replay/, '<span class="hl-c">only `not_sent` permits replay</span>') });
  wipe(rq, T('c13') - 0.2, { dir: 'l', d: 0.5 });
  const oc = clRow(world, Cx + 140, Yb + 330, 18);
  const outs = [['sent', 'out'], ['not_sent → ' + tr('允许重发', 'replay'), 'ok'], ['unresolved', 'warn']].map(([x, k]) => { const p = clPill(oc, 0, 0, x, k, 34); p.style.position = 'static'; return p; });
  seq(outs, T2('c13', '没发出', 'not sent') - 0.3, 0.14, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.45 }); });
  sfx('chime', T2('c13', '重发', 'resends'), { g: 0.5 });
  const al = tx(world, 'clb', Cx + 1240, Yb + 60, tr('至少一次', 'at least once'), { fontSize: '72px' });
  const alp = clPill(world, Cx + 1244, Yb + 160, tr('默认', 'default'), 'on', 30);
  const eo = tx(world, 'clb', Cx + 1240, Yb + 250, tr('恰好一次', 'exactly once'), { fontSize: '72px', color: C.clMuted });
  const eop = clPill(world, Cx + 1244, Yb + 350, tr('通道能证明幂等时', 'when a channel proves idempotency'), 'out', 28);
  slam(al, T2('c14', '至少一次', 'At least'), { from: 1.25 }); appear(alp, T2('c14', '至少一次', 'At least') + 0.25); sfx('thud', T2('c14', '至少一次', 'At least'), { g: 0.6 });
  wipe(eo, T2('c14', '恰好一次', 'exactly'), { dir: 'l', d: 0.45 }); appear(eop, T2('c14', '恰好一次', 'exactly') + 0.3); sfx('tick', T2('c14', '恰好一次', 'exactly'), { g: 0.45 });
  const pol = clCard(world, Cx + 140, Yb + 470, 1640, 150, { bg: C.clElev });
  const p1 = clPill(world, Cx + 180, Yb + 520, 'required', 'on', 32), p1t = tx(world, 'clb', Cx + 400, Yb + 520, tr('→ 写不进库就直接失败', '→ fails if the intent cannot be written'), { fontSize: '38px' });
  const p2 = clPill(world, Cx + 1060, Yb + 520, 'best_effort', 'out', 32), p2t = tx(world, 'clb', Cx + 1290, Yb + 520, tr('→ 直接发送', '→ send directly'), { fontSize: '38px', color: C.clText });
  const psrc = tx(world, 'clm', Cx + 140, Yb + 640, esc(srcOf('claw_lc_durability', { ver: true })), { fontSize: '24px', color: C.clMuted });
  has('claw_lc_durability', '`required`'); has('claw_lc_durability', 'fails closed');
  wipe(pol, T('c14b') - 0.2, { dir: 'l', d: 0.4 });
  appear(p1, T2('c14b', '要求持久', 'requires')); wipe(p1t, T2('c14b', '失败', 'fails') - 0.1, { dir: 'l', d: 0.4 }); sfx('thud', T2('c14b', '失败', 'fails'), { g: 0.5 });
  appear(p2, T2('c14c', '尽力而为', 'best-effort')); wipe(p2t, T2('c14c', '直接发送', 'directly') - 0.1, { dir: 'l', d: 0.4 }); sfx('tick', T2('c14c', '直接发送', 'directly'), { g: 0.45 }); appear(psrc, T('c14c') + 0.4);

  // ── D：收的一侧（v2026.8.1 message-lifecycle-refactor.md:63、:120–125）──
  const Dx = SX[3];
  const msg2 = token(g, 64, 40, C.clAccent, { rx: 14 });
  msg2.ride(T('c15') - 0.5, 0.6, [[Cx + 140, railY], [Dx + 140, railY]], { hold: 0.2 });
  const dt_ = tx(world, 'clb', Dx + 140, 150, tr('收的一侧', 'The receiving side'), { fontSize: '64px' });
  wipe(dt_, T('c15'), { dir: 'l', d: 0.45 });
  const jr = clRow(world, Dx + 140, 320, 20);
  const jw = [['accept', tr('接收', 'accepted')], ['pending', tr('待处理', 'pending')], ['complete', tr('完成', 'completed')]];
  const jEls = jw.map(([a, b], i) => { const k = h('div', 'cl-card', jr); css(k, { padding: '22px 34px', position: 'relative' }); tx(k, 'clm', 0, 0, a, { fontSize: '28px', color: C.clMuted, position: 'static' }); const bb = h('div', 'clb', k, b); css(bb, { fontSize: '50px', marginTop: '8px' }); return k; });
  const tJ = [T2('c16', '接收', 'accepted'), T2('c16', '待处理', 'pending'), T2('c16', '完成', 'completed')];
  jEls.forEach((k, i) => { wipe(k, tJ[i] - 0.15, { dir: 'l', d: 0.35 }); sfx('tick', tJ[i] - 0.15, { g: 0.45 }); });
  const jsrc = tx(world, 'clm', Dx + 140, 486, esc(srcOf('claw_lc_journal', { ver: true }) + '  · accept/pending/complete/release'), { fontSize: '24px', color: C.clMuted });
  has('claw_lc_journal', 'accept/pending/complete/release'); appear(jsrc, tJ[2] + 0.3);
  const rs = clPill(world, Dx + 1340, 360, tr('网关重启', 'gateway restart'), 'warn', 32);
  const rs2 = tx(world, 'clb', Dx + 1340, 436, tr('从记录接着走', 'resume from the record'), { fontSize: '40px' });
  appear(rs, T2('c17', '重启', 'restart')); sfx('thud', T2('c17', '重启', 'restart'), { g: 0.55 }); wipe(rs2, T2('c17', '接着走', 'resumes') - 0.1, { dir: 'l', d: 0.4 });
  // Telegram 的重启水位线（示意）：#1041–#1045 处理完，#1046、#1047 还在处理；水位线只推进到 #1045
  const uy = 610, ux0 = Dx + 140;
  const ups = [1041, 1042, 1043, 1044, 1045, 1046, 1047].map((n, i) => {
    const done = i < 5, k = clCard(world, ux0 + i * 196, uy, 176, 120, { bg: done ? C.clCard : C.clElev });
    const nn = tx(k, 'clm', 22, 18, '#' + n, { fontSize: '28px', color: C.clStrong });
    const st = clPill(k, 18, 64, done ? 'done' : 'pending', done ? 'ok' : 'warn', 24);
    return { k, done };
  });
  const tU = T2('c17b', '更新', 'updates');
  seq(ups.map((o) => o.k), tU - 0.2, 0.08, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.25 }); });
  const wmX = ux0 + 5 * 196 - 10;
  const wm = Ln(g, wmX, uy - 40, wmX, uy + 160, C.clAccent, 6);
  const wmL = tx(world, 'cl', wmX + 14, uy - 52, tr('水位线', 'watermark'), { fontSize: '30px', color: C.clAccent, fontWeight: 600 });
  drawH(wm, T2('c17b', '水位线', 'watermark') - 0.2, 0.4); appear(wmL, T2('c17b', '水位线', 'watermark')); sfx('pop', T2('c17b', '水位线', 'watermark'), { g: 0.6 });
  const rp = Pa(g, `M${ux0 + 5 * 196 + 88},${uy + 130} C${ux0 + 5 * 196 + 88},${uy + 230} ${ux0 + 6 * 196 + 88},${uy + 230} ${ux0 + 6 * 196 + 88},${uy + 130}`, { stroke: C.clWarn, 'stroke-width': 4 });
  const rpl = tx(world, 'cl', ux0 + 5 * 196, uy + 236, tr('重启后再来一遍', 'replayed after restart'), { fontSize: '30px', color: C.clWarn, fontWeight: 600 });
  drawH(rp, T2('c17c', '再来一遍', 'replayed') - 0.3, 0.5); appear(rpl, T2('c17c', '再来一遍', 'replayed')); sfx('whoosh', T2('c17c', '再来一遍', 'replayed') - 0.3, { g: 0.4 });
  const usrc = tx(world, 'clm', ux0, uy + 276, esc(srcOf('claw_lc_watermark', { ver: true }) + '  · safeCompletedUpdateId  ·  ' + tr('示意', 'schematic')), { fontSize: '24px', color: C.clMuted });
  has('claw_lc_watermark', 'restart watermark'); appear(usrc, T('c17c'));

  // ── E：一轮没跑完又来一条消息（v2026.8.1 docs/concepts/queue.md:28、:39、:82）──
  const Ex = SX[4];
  msg2.ride(Tend('c17c') + 0.2, Math.max(0.6, T('c17d') - Tend('c17c') - 0.2), [[Dx + 140, railY], [Ex + 140, railY]], { hold: 0.1 });
  const et = tx(world, 'clb', Ex + 140, 150, tr('一轮没跑完，又来一条', 'A message arrives mid-turn'), { fontSize: '64px' });
  wipe(et, T('c17d') - 0.1, { dir: 'l', d: 0.45 });
  const turn = clCard(world, Ex + 140, 300, 1640, 330);
  const tlab = tx(world, 'clm', Ex + 180, 320, tr('正在进行的这一轮', 'the running turn'), { fontSize: '26px', color: C.clMuted });
  const calls = ['exec', 'read', 'write'].map((n, i) => {
    const x = Ex + 200 + i * 520, k = clCard(world, x, 380, 460, 110, { bg: C.clElev });
    tx(k, 'clm', 26, 32, 'tool · ' + n, { fontSize: '32px', color: C.clStrong });
    return { k, x };
  });
  wipe(turn, T('c17d') - 0.3, { dir: 'l', d: 0.4 }); appear(tlab, T('c17d'));
  calls.forEach((c, i) => { wipe(c.k, T('c17d') + i * 0.12, { dir: 'l', d: 0.35 }); });
  const bar = R(g, calls[0].x, 500, 460, 8, C.clAccent); wipe(bar, T('c17d') + 0.2, { dir: 'l', d: Math.max(0.8, T2('c17e', '跑完', 'finishes') - T('c17d') - 0.2), ease: 'none' });
  const sb = clBubble(world, Ex + 1240, 168, 520, tr('新消息', 'new message'), tr('顺便把会议改到九点', 'Make it 9 instead'), { size: 30 });
  const steer = clPill(world, Ex + 1240, 120, 'steer', 'acc', 26);
  slide(sb, T2('c17d', '又来', 'arrives'), { x: 80, d: 0.45 }); appear(steer, T2('c17d', '注入', 'steered')); sfx('pop', T2('c17d', '又来', 'arrives'), { g: 0.6 });
  const doneA = clPill(world, calls[0].x + 300, 404, 'done', 'ok', 26); appear(doneA, T2('c17e', '跑完', 'finishes')); sfx('chime', T2('c17e', '跑完', 'finishes'), { g: 0.4 });
  const skips = [1, 2].map((i) => { const p = clPill(world, calls[i].x + 300, 404, 'skipped', 'out', 26); return p; });
  seq(skips, T2('c17e', '跳过', 'skipped'), 0.15, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.45 }); });
  [1, 2].forEach((i) => { to(calls[i].k, T2('c17e', '跳过', 'skipped') + (i - 1) * 0.15, { opacity: 0.5, duration: 0.3 }); });
  const res = [1, 2].map((i) => {
    const y = 700, x = calls[i].x;
    const k = clCard(world, x, y, 460, 100, { border: C.clAccent });
    tx(k, 'clm', 26, 28, 'synthetic error', { fontSize: '30px', color: C.clAccent });
    const ln = Ln(g, x + 230, 494, x + 230, y - 4, C.clAccent, 3, { 'stroke-dasharray': '8 8' });
    return { k, ln };
  });
  seq(res, T2('c17f', '合成', 'synthetic') - 0.2, 0.2, (o, t) => { drawH(o.ln, t, 0.3); wipe(o.k, t + 0.2, { dir: 't', d: 0.35 }); sfx('pop', t + 0.2, { g: 0.5 }); });
  const paired = clPill(world, Ex + 200, 730, tr('记录保持成对', 'record stays paired'), 'on', 30);
  appear(paired, T2('c17f', '成对', 'paired')); sfx('chime', T2('c17f', '成对', 'paired'), { g: 0.4 });
  const esrc = tx(world, 'clm', Ex + 140, 850, esc(srcOf('claw_steer_synth', { ver: true }) + '  · ' + tr('工具名为示意', 'tool names are schematic')), { fontSize: '24px', color: C.clMuted });
  has('claw_steer_synth', 'synthetic paired error results'); appear(esrc, T('c17f') + 0.3);

  // ── 镜头 ──
  camTrack(cam, s.start, { x: SX[0] + 960, y: 540, z: 1.03 }, [
    [c0 + 0.1, { x: SX[0] + 980, z: 1.0 }, Math.max(1.2, T('c4') - c0), { sfx: false }],
    [T('c5') - 0.7, { x: SX[1] + 960, y: 520, z: 1.0 }, 1.0],
    [null, { x: SX[1] + 980, z: 1.03 }, Math.max(1.2, Tend('c7') - T('c5')), { sfx: false }],
    [Tend('c7') + 0.5, { x: SX[2] + 960, y: 520, z: 1.0 }, 1.0],
    [null, { x: SX[2] + 990, z: 1.03 }, Math.max(1.2, T('c13') - Tend('c7') - 2.0), { sfx: false }],
    [Tend('c12') + 0.1, { x: SX[2] + 960, y: 1180 + 420, z: 1.0 }, 0.9],
    [null, { x: SX[2] + 980, z: 1.03 }, Math.max(1.2, Tend('c14c') - T('c13') - 0.6), { sfx: false }],
    [T('c15') - 0.5, { x: SX[3] + 960, y: 520, z: 1.0 }, 1.0],
    [null, { x: SX[3] + 980, z: 1.03 }, Math.max(1.2, Tend('c17c') - T('c15') - 1.0), { sfx: false }],
    [Tend('c17c') + 0.2, { x: SX[4] + 960, y: 520, z: 1.0 }, 1.0],
    [null, { x: SX[4] + 980, z: 1.03 }, Math.max(1.2, s.end - Tend('c17c') - 1.2), { sfx: false }],
  ], s.end + 0.45);
});
