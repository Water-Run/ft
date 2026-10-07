// Hermes Agent（实现与分析）：一张沙漏形的大图（上：入口；腰：AIAgent；下：边缘的能力），镜头依次走过：核心与入口 → 三种模型接口
// → 网关一侧（适配器、会话键、准入、打断）→ 提示词三层与缓存 → 记忆与会话库 → 学习闭环 → 终端后端与安全边界 → 拉远看全图。
// 引文、源码行与数字取自 data.js；对话行与消息是示意。
scene('hermesi', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, GD = C.herm, AM = C.amber, BR = C.bronze, PP = C.paper;
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, o);
  const CXW = 1800, WY = 700;                                     // 腰（AIAgent）的中心线与上沿

  // ═══ A 核心与入口 ═══
  const t1 = T('j1'), t2 = T('j2'), t3 = T('j3'), t4 = T('j4'), t5 = T('j5'), t6 = T('j6');
  const sec = tag(world, CXW - 310, WY - 150, 'Hermes Agent', { bg: GD, c: C.ink, size: 40, cls: 'in9', pad: '8px 20px' }); wipe(sec, s.start + 0.7, { dir: 'l', d: 0.35 });
  const waist = frame(world, CXW - 310, WY, 620, 210, { c: GD, bw: 10 });
  const wN = Lb(CXW - 282, WY + 22, 'AIAgent', { cls: 'mono7', size: 60, c: GD });
  const wR = ring(g, CXW + 222, WY + 105, 62, PP, { w: 7, dot: 20, rest: 180 });
  const wF = Lb(CXW - 282, WY + 110, 'run_conversation()', { size: 28 }), wS = srcLab(world, CXW - 282, WY + 154, 'hm.loop.def'); has('hm.loop.def', 'def run_conversation(');
  const coreT = tag(world, CXW - 310, WY - 58, tr('核心', 'core'), { bg: GD, c: C.ink, size: 34, cls: 'hd' });
  const tc = Tw('j1', '核心', 'core');
  vanish(sec, tc + 0.12);                                         // 留到「核心」的框与标签进来之后再收：两者之间不留空画面
  const ghost = frame(world, CXW - 310, WY, 620, 210, { c: C.dimi, bw: 5, dash: true }), ghostT = Lb(CXW - 310, WY + 70, tr('网关？', 'the gateway?'), { cls: 'hd', size: 56, c: C.dimi, w: 620, align: 'center' });
  wipe(ghost, s.start + 0.5, { dir: 'l', d: 0.5 }); appear(ghostT, Tw('j1', '不是网关', 'not the gateway') - 0.3); [ghost, ghostT].forEach((e) => vanish(e, tc - 0.3)); sfx('tick', Tw('j1', '不是网关', 'not the gateway') - 0.3);
  wipe(waist, tc - 0.3, { dir: 'l', d: 0.5 }); slam(coreT, tc, { from: 1.2, d: 0.35 }); sfx('whoosh', tc - 0.3, { g: 0.5 }); sfx('thud', tc + 0.1);
  slam(wN, Tw('j2', 'AIAgent', 'AIAgent') - 0.1, { from: 1.15, d: 0.35 }); sfx('pop', Tw('j2', 'AIAgent', 'AIAgent'));
  const tr2 = Tw('j2', 'run_conversation', 'run_conversation');
  appear(wR.grp, tr2 - 0.2); appear(wF, tr2 - 0.1); appear(wS, tr2 + 0.3); wR.spin(tr2, s.end, 2.0, 180); sfx('blip', tr2);
  has('hm.loop.core', 'The core orchestration engine is the `AIAgent` class');
  // 入口
  const EN = [[tr('命令行', 'CLI'), 'cli.py'], [tr('消息网关', 'Gateway'), 'gateway/run.py'], ['ACP', 'acp_adapter/'], [tr('批处理', 'Batch'), 'Batch Runner'], [tr('API 服务', 'API server'), 'API Server'], [tr('Python 库', 'Python lib'), 'Python Library']];
  has('hm.arch.entry', 'CLI (cli.py)    Gateway (gateway/run.py)    ACP (acp_adapter/)'); has('hm.arch.entry', 'Batch Runner    API Server                  Python Library');
  const ex = (i) => CXW - 780 + i * 264, EY = 300;
  const ew = [Tw('j3', '命令行', 'command line'), Tw('j3', '消息网关', 'messaging gateway'), Tw('j3', 'ACP', 'ACP'), Tw('j3', '批处理', 'batch'), Tw('j3', '入口', 'entry points') - 0.3, Tw('j3', '入口', 'entry points') - 0.1];
  const ents = EN.map(([n, f], i) => {
    const x = ex(i), fr = frame(world, x, EY, 240, 110, { c: PP, bw: 5 }), tt = Lb(x, EY + 18, n, { cls: 'body', size: 32, w: 240, align: 'center' }), ff = Lb(x - 10, EY + 64, f, { size: 26, c: C.dimi, w: 260, align: 'center' });
    const w = wire(g, [[x + 120, EY + 110], [x + 120, EY + 200], [CXW - 150 + i * 60, WY - 80], [CXW - 150 + i * 60, WY]], PP, 5);
    wipe(fr, ew[i] - 0.15, { dir: 't', d: 0.3 }); appear(tt, ew[i] + 0.05); appear(ff, ew[i] + 0.12); drawIn(w, ew[i] + 0.1, 0.4); sfx('tick', ew[i], { g: 0.5 });
    return { x: x + 120, path: [[x + 120, EY + 110], [x + 120, EY + 200], [CXW - 150 + i * 60, WY - 80], [CXW - 150 + i * 60, WY]] };
  });
  const enT = tag(world, ex(0), EY - 58, tr('入口', 'entry points'), { bg: PP, c: C.ink, size: 30, cls: 'hd' }); wipe(enT, Tw('j3', '入口', 'entry points') - 0.2, { dir: 'l', d: 0.3 });
  // 每个入口做同一件事
  ents.forEach((e, i) => [0, 1.5, 3.0].forEach((dt) => { const pk = packet(g, 20, GD); pk.ride(t4 + 0.2 + i * 0.22 + dt, 0.7, e.path); }));
  const same = Lb(CXW - 930, WY + 80, 'AIAgent(…).run_conversation(msg)', { cls: 'mono7', size: 30, c: GD }); wipe(same, Tw('j4', '构造', 'construct') - 0.1, { dir: 'l', d: 0.4 }); sfx('pop', Tw('j4', '构造', 'construct'));
  // 窄腰：沙漏的轮廓与边缘的能力
  const EDY = 1130, ED = [[tr('工具', 'Tools'), 'tools/registry.py'], [tr('记忆', 'Memory'), '~/.hermes/memories'], [tr('技能', 'Skills'), '~/.hermes/skills'], [tr('会话库', 'Sessions'), '~/.hermes/state.db'], [tr('终端后端', 'Backends'), 'tools/environments']];
  const edx = (i) => CXW - 810 + i * 330;
  const hgL = wire(g, [[ex(0), EY + 110], [CXW - 310, WY], [CXW - 310, WY + 210], [edx(0), EDY]], GD, 4, { o: 0.9 }), hgR = wire(g, [[ex(5) + 240, EY + 110], [CXW + 310, WY], [CXW + 310, WY + 210], [edx(4) + 300, EDY]], GD, 4, { o: 0.9 });
  const tw5 = Tw('j5', '窄腰', 'narrow waist'), te5 = Tw('j5', '边缘', 'edges');
  vanish(same, t5 - 0.2); vanish(wS, t5 - 0.4); drawIn(hgL, tw5 - 0.3, 0.9); drawIn(hgR, tw5 - 0.3, 0.9); sfx('whoosh', tw5 - 0.3, { g: 0.5 });
  const q5 = quote(world, 860, WY + 10, 560, 'hm.agents.waist', 'The core is a narrow waist; capability lives at the edges.', { bar: GD, size: 30, srcSize: 26, html: (x) => mark(x, ['narrow waist'], 'hl-g') }); wipe(q5, tw5 + 0.1, { dir: 'l', d: 0.4 });
  const eds = ED.map(([n, f], i) => { const x = edx(i), fr = frame(world, x, EDY, 300, 110, { c: GD, bw: 5 }), tt = Lb(x, EDY + 18, n, { cls: 'body', size: 32, c: GD, w: 300, align: 'center' }), ff = Lb(x, EDY + 64, f, { size: 26, c: C.dimi, w: 300, align: 'center' });
    const w = wire(g, [[CXW - 120 + i * 60, WY + 210], [CXW - 120 + i * 60, WY + 270], [x + 150, EDY - 70], [x + 150, EDY]], GD, 5);
    const t = te5 - 0.3 + i * 0.1; drawIn(w, t, 0.4); wipe(fr, t + 0.2, { dir: 't', d: 0.3 }); appear(tt, t + 0.4); appear(ff, t + 0.45); sfx('tick', t + 0.2, { g: 0.4 }); return { x: x + 150 }; });
  // 三种模型接口，进出核心时统一成一种格式
  const MX = CXW + 480, modes = ['chat_completions', 'codex_responses', 'anthropic_messages'];
  has('hm.loop.modes', '`chat_completions`'); has('hm.loop.modes', '`codex_responses`'); has('hm.loop.modes', '`anthropic_messages`'); has('hm.loop.converge', 'All three converge on the same internal message format');
  const mE = modes.map((m, i) => chip(world, MX + 430, WY - 20 + i * 86, m, 'ni', 28));
  const mW = modes.map((m, i) => wire(g, [[MX + 430, WY + 4 + i * 86], [MX + 330, WY + 4 + i * 86], [MX + 330, WY + 90], [MX + 250, WY + 90]], PP, 5));
  const fmt = frame(world, MX - 110, WY + 40, 360, 100, { c: GD, bw: 6 }), fmtT = Lb(MX - 110, WY + 58, '{"role", "content",\n "tool_calls"}', { size: 24, c: GD, w: 360, align: 'center', lh: '1.3' });
  const fmtW = wire(g, [[MX - 110, WY + 90], [CXW + 310, WY + 90]], GD, 6), mH = Lb(MX + 430, WY - 74, tr('三种接口模式', 'three API modes'), { size: 26, c: C.dimi }), fS = srcLab(world, MX + 430, WY + 246, 'hm.loop.modes', { short: true });
  const tm = Tw('j6', '三种模式', 'three modes'), tf = Tw('j6', '一种格式', 'one format');
  appear(mH, tm - 0.3); seq(mE, tm - 0.2, 0.15, (e, t) => { slide(e, t, { x: 30, d: 0.3 }); sfx('tick', t, { g: 0.5 }); }); mW.forEach((w, i) => drawIn(w, tf - 0.5 + i * 0.08, 0.4));
  wipe(fmt, tf - 0.2, { dir: 'r', d: 0.35 }); appear(fmtT, tf + 0.1); drawIn(fmtW, tf + 0.1, 0.3); appear(fS, tf + 0.4); sfx('pop', tf);

  // ═══ B 网关一侧 ═══（画在「消息网关」入口的上方）
  [enT].forEach((e) => vanish(e, T('j7') - 0.6));
  const t7 = T('j7'), t8 = T('j8'), t9 = T('j9'), BXC = ex(1) + 120, BY = -520;
  const plats = ['telegram', 'discord', 'slack', 'feishu', 'matrix', 'email'].filter((p) => D.hmPlatforms.includes(p));
  const px0 = BXC - (plats.length * 190) / 2;
  const pE = plats.map((p, i) => { const e = chip(world, px0 + i * 190, BY, p, 'hm', 24), w = wire(g, [[px0 + i * 190 + 70, BY + 46], [px0 + i * 190 + 70, BY + 110]], GD, 4); return [e, w]; });
  const more = Lb(px0 + plats.length * 190 + 6, BY + 8, tr(`… 共 ${D.hmPlatforms.length} 个`, `… ${D.hmPlatforms.length} in all`), { size: 24, c: C.dimi }), moreS = Lb(px0, BY - 44, 'plugins/platforms/&lt;name&gt;/adapter.py', { size: 22, c: C.dimi });
  const base = frame(world, px0 - 20, BY + 110, plats.length * 190 + 10, 96, { c: GD, bw: 6 }), baseT = Lb(px0, BY + 124, 'BasePlatformAdapter', { cls: 'mono7', size: 30, c: GD }), baseM = Lb(px0 + 420, BY + 128, 'connect()  disconnect()  send()', { size: 24 });
  has('hm.base.connect', 'async def connect('); has('hm.base.send', 'async def send('); has('hm.gw.extend', 'All extend `BasePlatformAdapter`');
  const ev = tag(world, BXC - 96, BY + 262, 'MessageEvent', { bg: PP, c: C.ink, size: 26 }), evW = wire(g, [[BXC, BY + 206], [BXC, BY + 262]], PP, 5); has('hm.gw.flow', 'normalizes it into a `MessageEvent`');
  const gr = frame(world, BXC - 200, BY + 360, 400, 96, { c: PP, bw: 5 }), grT = Lb(BXC - 200, BY + 388, 'GatewayRunner', { cls: 'mono7', size: 30, w: 400, align: 'center' }), grW = wire(g, [[BXC, BY + 308], [BXC, BY + 360]], PP, 5), grD = wire(g, [[BXC, BY + 456], [BXC, EY]], PP, 5);
  const ta7 = Tw('j7', '适配器', 'adapter'), tb7 = Tw('j7', '基类', 'base class');
  appear(moreS, ta7 - 0.3); seq(pE, ta7 - 0.2, 0.09, (e, t) => { slide(e[0], t, { y: -14, d: 0.3 }); sfx('tick', t, { g: 0.4 }); }); appear(more, ta7 + 0.5);
  pE.forEach((e, i) => drawIn(e[1], tb7 - 0.3 + i * 0.04, 0.25)); wipe(base, tb7 - 0.1, { dir: 'l', d: 0.4 }); appear(baseT, tb7 + 0.2); appear(baseM, tb7 + 0.4); sfx('thud', tb7, { g: 0.6 });
  drawIn(grD, t7 - 1.0, 0.8); wipe(gr, t7 - 0.5, { dir: 't', d: 0.3 }); appear(grT, t7 - 0.3); [evW, grW].forEach((w, i) => drawIn(w, tb7 + 0.6 + i * 0.15, 0.25)); slam(ev, tb7 + 0.7, { from: 1.2, d: 0.3 });
  // 会话键：平台与聊天编号都写进去，每个私聊各自独立
  const KX = BXC + 300, kf = Lb(KX, BY + 258, has('hm.gw.keyfmt', 'agent:{namespace}:{platform}:{chat_type}:{chat_id}'), { cls: 'mono7', size: 26, c: GD }), kfS = srcLab(world, KX, BY + 296, 'hm.gw.keyfmt');
  has('hm.sessionkey.doc', 'DMs are isolated per chat_id'); has('hm.sessionkey.parts', 'source.platform.value, chat_type_slot');
  const kk = ['agent:main:telegram:dm:1001', 'agent:main:feishu:dm:oc_42'], kE = kk.map((k, i) => { const y = BY + 372 + i * 74; return [Lb(KX, y, k, { size: 26 }), R(g, KX + 470, y + 14, 150, 6, GD), ring(g, KX + 650, y + 17, 18, GD, { w: 4, dot: 10, rest: 180 })]; });
  const kN = Lb(KX, BY + 520, tr('（聊天编号为示意）', '(chat IDs are illustrative)'), { size: 22, c: C.dimi });
  const tk8 = Tw('j8', '会话键', 'session key'), ti8 = Tw('j8', '各自独立', 'separate');
  wipe(kf, tk8 - 0.1, { dir: 'l', d: 0.4 }); appear(kfS, tk8 + 0.4); sfx('pop', tk8);
  kE.forEach((e, i) => { const t = ti8 - 0.4 + i * 0.3; wipe(e[0], t, { dir: 'l', d: 0.3 }); appear(e[1], t + 0.2); appear(e[2].grp, t + 0.3); e[2].spin(t + 0.5, t9, 1.0, 180); sfx('tick', t); }); appear(kN, ti8 + 0.3);
  // 准入默认拒绝；中途来消息默认打断
  const AXL = BXC - 1040, auth = [tr('平台的全部放行开关', 'per-platform allow-all'), tr('平台白名单', 'platform allowlist'), tr('私聊配对', 'DM pairing'), tr('全局放行开关', 'global allow-all')];
  const aH = Lb(AXL, BY + 236, tr('准入：依次检查', 'Admission, checked in order'), { size: 26, c: C.dimi });
  const aE = auth.map((a, i) => Lb(AXL, BY + 284 + i * 44, `${i + 1}. ${a}`, { size: 26 })), aD = tag(world, AXL - 4, BY + 284 + 4 * 44, tr('5. 默认：拒绝', '5. Default: deny'), { bg: GD, c: C.ink, size: 28 }), aS = srcLab(world, AXL, BY + 284 + 5 * 44 + 10, 'hm.gw.deny'); has('hm.gw.deny', 'Default: deny');
  const td9 = Tw('j9', '拒绝', 'denies'), tn9 = Tw('j9', '又来消息', 'mid-turn'), ti9 = Tw('j9', '打断', 'interrupts');
  appear(aH, t9 - 0.1); seq(aE, t9, 0.1, (e, t) => appear(e, t)); slam(aD, td9, { from: 1.2, d: 0.3 }); appear(aS, td9 + 0.3); sfx('thud', td9, { g: 0.6 });
  // 打断：第一条键上的一轮正在跑，新消息到来，这一轮停下，从新消息重新开始
  const r0 = kE[0][2], ky = BY + 372 + 17;
  r0.spin(tn9 - 1.2, ti9, 1.0, 180); r0.spin(ti9 + 0.5, s.end, 1.0, 180);
  const ip = packet(g, 18, PP); ip.ride(tn9, Math.max(0.3, ti9 - tn9), [[KX + 470, ky - 44], [KX + 632, ky - 44], [KX + 632, ky - 18]], { hold: 0.2 });
  const iT = tag(world, KX + 700, ky - 20, 'busy_input_mode: interrupt', { bg: GD, c: C.ink, size: 24 }), iS = srcLab(world, KX + 700, ky + 22, 'hm.busy', { short: true }); has('hm.busy', 'interrupt (default)'); has('hm.gw.guard', 'sets an interrupt event');
  slam(iT, ti9, { from: 1.2, d: 0.3 }); appear(iS, ti9 + 0.3); sfx('thud', ti9 + 0.05); sfx('pop', ti9 + 0.5, { p: 0.2 });
  F((t) => { r0.circ.setAttribute('stroke', t >= ti9 && t < ti9 + 0.45 ? PP : GD); });

  // ═══ C 提示词与缓存 ═══（画在沙漏的左侧）
  const t10 = T('j10'), t11 = T('j11'), t12 = T('j12'), t13 = T('j13'), t14 = T('j14'), t15 = T('j15'), PX0 = -1150, PYT = 760;
  const sl10 = slate(t10 - 0.75, { bg: GD, text: tr('提示词缓存', 'Prompt cache'), sub: 'Hermes Agent' });     // 这一段画在沙漏左侧很远的地方：小节幕遮住时切镜头
  const q10 = quote(world, PX0, PYT - 200, 1300, 'hm.agents.cache', 'Per-conversation prompt caching is sacred.', { bar: GD, size: 40, html: (x) => mark(x, ['prompt caching is sacred'], 'hl-g') });
  wipe(q10, Math.min(Tw('j10', '不变量', 'invariant') - 0.1, sl10.clear), { dir: 'l', d: 0.5 });
  const grow = R(g, PX0, PYT - 76, 10, 10, GD); F((t) => { const k = clamp((t - t10) / Math.max(1, t11 - t10)); grow.setAttribute('width', (1300 * k).toFixed(1)); grow.setAttribute('opacity', t >= t10 && t < t11 - 0.2 ? 1 : 0); });
  // 三层
  const tiers = [[tr('稳定', 'stable'), 'SOUL.md', GD, 380], [tr('上下文', 'context'), 'AGENTS.md …', AM, 380], [tr('易变', 'volatile'), tr('技能索引 · 记忆快照', 'skills index · memory snapshot'), BR, 500]];
  has('hm.prompt.three', '**stable** — identity (`SOUL.md` or fallback)'); has('hm.prompt.three', '**context**'); has('hm.prompt.three', '**volatile** — skills index, built-in memory snapshot (`MEMORY.md`)');
  let tx0 = PX0; const tw = [Tw('j11', '稳定', 'stable'), Tw('j11', '上下文', 'context'), Tw('j11', '易变', 'volatile')];
  const prH = Lb(PX0, PYT - 50, tr('系统提示词', 'system prompt'), { size: 26, c: C.dimi }); appear(prH, t11 - 0.1);
  const tierE = tiers.map(([n, sub, c, w], i) => { const b = h('div', 'abs', world); px(b, tx0, PYT, w - 10, 110); css(b, { background: c }); const a = Lb(tx0 + 18, PYT + 12, n, { cls: 'hd', size: 40, c: C.ink }), d = Lb(tx0 + 18, PYT + 66, sub, { size: 24, c: C.ink }); tx0 += w;
    wipe(b, tw[i] - 0.15, { dir: 'l', d: 0.3 }); appear(a, tw[i]); appear(d, tw[i] + 0.1); sfx('pop', tw[i] - 0.15, { g: 0.5 }); return b; });
  const prS = srcLab(world, PX0, PYT + 122, 'hm.prompt.three'); appear(prS, tw[2] + 0.4);
  // 每一轮：同一条前缀原样复用，消息接在后面
  const TY0 = PYT + 210, turnE = [0, 1, 2].map((k) => {
    const y = TY0 + k * 74, lab_ = Lb(PX0 - 150, y + 10, tr(`第 ${k + 1} 轮`, `turn ${k + 1}`), { size: 24, c: C.dimi, w: 130, align: 'right' });
    const pre = R(g, PX0, y, 600, 48, k ? GD : 'none', k ? {} : { stroke: GD, 'stroke-width': 5 }), msgs = []; for (let m = 0; m <= k * 2; m++) msgs.push(R(g, PX0 + 614 + m * 58, y + 2, 44, 44, PP));
    const hit = k ? Lb(PX0 + 18, y + 8, tr('缓存命中', 'cache hit'), { cls: 'mono7', size: 26, c: C.ink }) : Lb(PX0 + 18, y + 8, tr('装配一次', 'assembled once'), { cls: 'mono7', size: 26, c: GD });
    return { lab_, pre, msgs, hit, y };
  });
  const ta12 = Tw('j12', '装配一次', 'assembled once'), tr12 = Tw('j12', '原样复用', 'reused unchanged');
  turnE.forEach((e, k) => { const t = k === 0 ? ta12 - 0.2 : tr12 - 0.3 + (k - 1) * 0.5; appear(e.lab_, t); fromTo(e.pre, t, { scaleX: 0, svgOrigin: `${PX0} ${e.y}` }, { scaleX: 1, duration: 0.4, ease: 'power3.out' }); appear(e.hit, t + 0.3); e.msgs.forEach((m, i) => appear(m, t + 0.35 + i * 0.07)); sfx(k ? 'blip' : 'pop', t + 0.3, { g: 0.6 }); });
  has('hm.loop.reuse', 'Build or reuse cached system prompt'); has('hm.cache.plan', '4 cache_control breakpoints');
  // 记忆：两份有上限的文件；中途写入落盘，快照不变
  const MY0 = PYT + 480;
  has('hm.memory.files', '2,200 chars'); has('hm.memory.files', '1,375 chars'); has('hm.mem.limits', '"memory_char_limit", 2200'); has('hm.mem.limits', '"user_char_limit", 1375'); has('hm.memory.home', '~/.hermes/memories/');
  const mems = [['MEMORY.md', 2200, 0.83], ['USER.md', 1375, 0.64]].map(([n, lim, fill], i) => {
    const y = MY0 + i * 150, ic = fileIcon(g, PX0, y, 84, 108, GD, { w: 5 }), nm = Lb(PX0 + 110, y - 4, n, { cls: 'mono7', size: 34, c: GD });
    const bar = R(g, PX0 + 110, y + 56, 560, 30, 'none', { stroke: GD, 'stroke-width': 4 }), fl = R(g, PX0 + 110, y + 56, 560 * fill, 30, GD), cap = Lb(PX0 + 690, y + 50, tr(`上限 ${fmtN(lim)} 个字符`, `cap ${fmtN(lim)} chars`), { cls: 'mono7', size: 30 });
    return { ic, nm, bar, fl, cap, y, fill };
  });
  const mH13 = Lb(PX0, MY0 - 56, '~/.hermes/memories/', { size: 26, c: C.dimi }), mwd = [Tw('j13', '2200', '2,200'), Tw('j13', '1375', '1,375')];
  appear(mH13, t13 - 0.1);
  mems.forEach((m, i) => { const t = t13 + 0.1 + i * 0.25; appear(m.ic, t); appear(m.nm, t + 0.05); appear(m.bar, t + 0.1); fromTo(m.fl, t + 0.15, { scaleX: 0, svgOrigin: `${PX0 + 110} ${m.y + 56}` }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); slam(m.cap, mwd[i] - 0.1, { from: 1.2, d: 0.3 }); sfx('pop', mwd[i] - 0.1); });
  // 写入：磁盘上的文件变了（示意：条形伸长），提示词里的快照不变
  const tw14 = Tw('j14', '落盘', 'reaches disk'), tf14 = Tw('j14', '不变', 'stays fixed');
  const add = R(g, PX0 + 110 + 560 * mems[0].fill, MY0 + 56, 560 * 0.07, 30, PP); appear(add, tw14); const wr = tag(world, PX0 + 110 + 560 * mems[0].fill - 20, MY0 + 96, tr('已写入磁盘', 'written to disk'), { bg: PP, c: C.ink, size: 24 }); slam(wr, tw14 + 0.1, { from: 1.2, d: 0.3 }); sfx('tick', tw14);
  const frz = tag(world, PX0 + 760 + 80, PYT - 54, tr('会话开始时的快照 · 冻结', 'snapshot from session start · frozen'), { bg: PP, c: C.ink, size: 26 }); slam(frz, tf14, { from: 1.2, d: 0.3 }); sfx('thud', tf14, { g: 0.6 });
  has('hm.memory.frozen', 'captured once at session start and never changes mid-session'); has('hm.memory.frozen', 'persisted to disk immediately'); has('hm.mem.frozen', 'FROZEN snapshot at session start');
  // 会话库
  const DBX = PX0 + 1080, db = cyl(g, DBX, MY0 - 10, 200, 250, GD, { w: 7 }), dbT = Lb(DBX, MY0 + 80, 'state.db', { cls: 'mono7', size: 32, c: GD, w: 200, align: 'center' }), dbS = Lb(DBX, MY0 + 126, 'SQLite + FTS5', { size: 24, w: 200, align: 'center' });
  const ss = chip(world, DBX + 250, MY0 + 80, 'session_search', 'hm', 28), ssW = wire(g, [[DBX + 200, MY0 + 106], [DBX + 250, MY0 + 106]], GD, 5), dS = srcLab(world, DBX, MY0 + 256, 'hm.session.sqlite');
  has('hm.session.sqlite', 'stored in SQLite (`~/.hermes/state.db`) with FTS5 full-text search'); has('hm.session.storage', 'FTS5 full-text search');
  const td15 = Tw('j15', 'SQLite', 'SQLite');
  appear(db, td15 - 0.2); appear(dbT, td15); appear(dbS, Tw('j15', '全文索引', 'full-text index')); sfx('pop', td15 - 0.2); drawIn(ssW, Tw('j15', '检索', 'searched') - 0.1, 0.2); slide(ss, Tw('j15', '检索', 'searched'), { x: 20, d: 0.3 }); sfx('blip', Tw('j15', '检索', 'searched')); appear(dS, td15 + 0.5);

  // ═══ D 学习闭环 ═══（画在沙漏的右侧）
  const t16 = T('j16'), t17 = T('j17'), t18 = T('j18'), t19 = T('j19'), t20 = T('j20'), LX = 2900, LY = 1250;
  vanish(fS, t16 - 0.9);                                          // 「三种接口模式」的出处标注离这一区的画面上沿很近：镜头过来之前收起
  const lT = tag(world, LX, LY - 110, tr('学习闭环', 'learning loop'), { bg: GD, c: C.ink, size: 46, cls: 'hd', pad: '10px 24px' }); slam(lT, Tw('j16', '学习闭环', 'learning loop') - 0.1, { from: 1.2, d: 0.35 }); sfx('thud', Tw('j16', '学习闭环', 'learning loop'));
  // 两个智能体：左为这场对话里的，右为后台副本；各自上方一条提示词前缀
  function agentBox(x, dashed, title) {
    const fr = frame(world, x, LY + 70, 420, 330, { c: GD, bw: 7, dash: dashed }), tt = Lb(x + 22, LY + 84, title, { cls: 'mono7', size: 28, c: GD });
    const pre = R(g, x, LY, 300, 40, GD), preT = Lb(x + 12, LY + 4, tr('提示词前缀', 'prompt prefix'), { cls: 'mono7', size: 22, c: C.ink });
    const rows = [0, 1, 2, 3, 4].map((i) => R(g, x + 24, LY + 140 + i * 48, [300, 220, 340, 180, 260][i], 30, i === 4 ? GD : PP));
    const r = ring(g, x + 350, LY + 340, 30, GD, { w: 5, dot: 12, rest: 180 });
    return { fr, tt, pre, preT, rows, r, x };
  }
  const A1 = agentBox(LX, false, 'AIAgent'), A2 = agentBox(LX + 620, true, tr('后台副本', 'forked copy'));
  [A1.fr, A1.tt, A1.pre, A1.preT, A1.r.grp, ...A1.rows].forEach((e) => appear(e, t16 + 0.2));
  A1.r.spin(t16 + 0.3, Tw('j17', '结束', 'After a turn') + 0.4, 1.0, 180);
  const tfk = Tw('j17', '复制', 'copy'), trp = Tw('j17', '重放', 'replays');
  const fk = arrow(g, LX + 430, LY + 235, LX + 606, LY + 235, GD, 8); appear(fk, tfk - 0.1); sfx('whoosh', tfk - 0.1, { g: 0.5 });
  [A2.fr, A2.tt, A2.pre, A2.preT, A2.r.grp].forEach((e) => appear(e, tfk + 0.1)); sfx('pop', tfk + 0.1);
  seq(A2.rows, trp - 0.1, 0.14, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.4 }); }); A2.r.spin(trp, t19, 0.9, 180);
  const fkS = srcLab(world, LX, LY + 414, 'hm.review.doc'); appear(fkS, tfk + 0.4);
  // 它只判断一件事
  const ask = has('hm.review.doc', 'should any skill/memory be saved or updated?');
  const qB = frame(world, LX + 620, LY + 424, 420, 124, { c: PP, bw: 5, r: 24 }), qT = Lb(LX + 640, LY + 444, '"' + ask + '"', { size: 26, w: 380, align: 'center', wrap: true, lh: '1.35' });
  wipe(qB, Tw('j18', '判断', 'decides') - 0.2, { dir: 'l', d: 0.4 }); appear(qT, Tw('j18', '判断', 'decides') + 0.1); sfx('pop', Tw('j18', '判断', 'decides'));
  // 结果：写进记忆与技能；技能在提示词里只有索引
  const OX = LX + 1120, mf = fileIcon(g, OX, LY + 80, 80, 104, GD, { w: 5 }), mfT = Lb(OX + 96, LY + 106, 'MEMORY.md', { cls: 'mono7', size: 28, c: GD });
  const sf = fileIcon(g, OX, LY + 230, 80, 104, GD, { w: 5 }), sfT = Lb(OX + 96, LY + 244, 'skills/&lt;name&gt;/SKILL.md', { cls: 'mono7', size: 28, c: GD }), sfN = Lb(OX + 96, LY + 286, tr('用 Markdown 写下的做法', 'a procedure in Markdown'), { size: 24 });
  const oW = [wire(g, [[LX + 1040, LY + 180], [OX - 10, LY + 132]], GD, 5), wire(g, [[LX + 1040, LY + 290], [OX - 10, LY + 282]], GD, 5)];
  const tmm = Tw('j18', '记忆', 'memory'), tsk = Tw('j18', '技能', 'skill');
  drawIn(oW[0], tmm - 0.1, 0.25); appear(mf, tmm); appear(mfT, tmm + 0.05); sfx('tick', tmm); drawIn(oW[1], tsk - 0.1, 0.25); appear(sf, tsk); appear(sfT, tsk + 0.05); sfx('tick', tsk);
  has('hm.skills.def', 'progressive disclosure'); has('hm.skills.home', '~/.hermes/skills/'); has('hm.skills.view', 'skill_view(name)');
  appear(sfN, Tw('j19', 'Markdown', 'Markdown') - 0.1);
  const ixB = frame(world, OX, LY + 400, 620, 150, { c: BR, bw: 6 }), ixH = Lb(OX + 20, LY + 412, tr('提示词里：技能索引', 'in the prompt: skills index'), { size: 24, c: BR }), ixL = [Lb(OX + 20, LY + 452, '- code-review: …', { size: 24 }), Lb(OX + 20, LY + 488, '- arxiv: …', { size: 24 })];
  const sv = chip(world, OX + 326, LY + 462, 'skill_view(name)', 'hm', 24);
  const tix = Tw('j19', '索引', 'index');
  wipe(ixB, tix - 0.3, { dir: 't', d: 0.3 }); appear(ixH, tix - 0.1); seq(ixL, tix, 0.12, (e, t) => appear(e, t)); slide(sv, tix + 0.5, { x: 20, d: 0.3 }); sfx('blip', tix + 0.5);
  // 同一份前缀 → 同一段缓存
  const tsm = Tw('j20', '同一份', 'same prompt'), thit = Tw('j20', '缓存', 'cached');
  const eq = wire(g, [[LX + 150, LY - 4], [LX + 150, LY - 36], [LX + 770, LY - 36], [LX + 770, LY - 4]], PP, 5), eqT = tag(world, LX + 340, LY - 62, tr('同一份前缀 → 同一段缓存', 'same prefix → same cache'), { bg: PP, c: C.ink, size: 26 });
  drawIn(eq, tsm - 0.2, 0.5); slam(eqT, thit - 0.1, { from: 1.2, d: 0.3 }); sfx('thud', thit, { g: 0.6 });
  F((t) => { const on = t >= tsm && t < tsm + 1.6 && Math.floor((t - tsm) * 5) % 2 === 0; [A1.pre, A2.pre].forEach((e) => e.setAttribute('fill', on ? PP : GD)); });
  has('hm.review.doc', 'so it hits the same prefix cache'); has('hm.review.doc', 'cached system prompt');

  // ═══ E 终端后端与安全边界 ═══（「终端后端」那一格的下方）
  const t21 = T('j21'), EXX = 1260, EYY = 1560;
  const bks = ['local', 'docker', 'ssh', 'singularity', 'modal', 'daytona', 'vercel_sandbox'];
  has('hm.readme.backends', 'Seven terminal backends — local, Docker, SSH, Singularity, Modal, Daytona, and Vercel Sandbox'); has('hm.tools.default', '`local` | Run on your machine (default)');
  const bW = wire(g, [[eds[4].x, EDY + 110], [eds[4].x, EYY - 30]], GD, 5); let bx = EXX;
  const bE = bks.map((b, i) => { const e = i === 0 ? tag(world, bx, EYY, b, { bg: GD, c: C.ink, size: 30, pad: '10px 18px' }) : chip(world, bx, EYY, b, 'hm', 30); bx += b.length * 18.6 + 64; return e; });
  const bD = Lb(EXX, EYY + 66, tr('默认：本机', 'default: local'), { size: 24, c: GD }), bN = Lb(EXX, EYY - 54, tr('终端的七种后端', 'seven terminal backends'), { size: 26, c: C.dimi });
  const tb21 = Tw('j21', '七种', 'seven');
  drawIn(bW, t21 - 0.1, 0.3); appear(bN, tb21 - 0.2); seq(bE, tb21 - 0.1, 0.08, (e, t) => { slide(e, t, { y: 14, d: 0.25 }); sfx('tick', t, { g: 0.4 }); }); appear(bD, Tw('j21', '默认本机', 'local by default'));
  const q21 = quote(world, EXX, EYY + 150, 1340, 'hm.security.boundary', 'The only security boundary against an adversarial LLM is the', { bar: GD, size: 34, html: () => 'The only security boundary against an adversarial LLM is the <span class="hl-g">operating system</span>.' }); has('hm.security.boundary', 'operating system.');
  wipe(q21, Tw('j21', '安全边界', 'security boundary') - 0.2, { dir: 'l', d: 0.5 }); sfx('whoosh', Tw('j21', '安全边界', 'security boundary') - 0.2, { g: 0.4 });

  // ═══ F 全图与分析 ═══
  const t22 = T('j22'), t23 = T('j23');
  const big = (x, y, t, bg, c) => tag(world, x, y, t, { bg, c, size: 60, cls: 'hd', pad: '12px 28px' });
  const b1 = big(CXW - 230, WY + 46, tr('一个核心', 'one core'), GD, C.ink), b2 = big(ex(0), EY - 150, tr('入口（网关是其中之一）', 'entry points (the gateway is one)'), PP, C.ink), b3 = big(edx(0), EDY + 150, tr('能力在边缘', 'capability at the edges'), PP, C.ink);
  const cons = [tr('记忆有上限', 'memory is capped'), tr('快照被冻结', 'snapshots are frozen'), tr('后台副本共用前缀', 'the copy shares the prefix')];
  const cH = big(2760, 520, tr('约束：缓存按前缀命中', 'Constraint: caches match by prefix'), GD, C.ink), cE = cons.map((c, i) => Lb(2790, 650 + i * 96, '→ ' + c, { cls: 'hd', size: 60 }));
  const keep = [b1, b2, b3, cH, ...cE];
  [b2, b3].forEach((e) => exit(e, t23 - 0.45, { d: 0.3 }));        // j23 镜头右移，这两块会被画面左缘截断
  [...world.querySelectorAll('div')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !keep.some((k) => k === e || k.contains(e))).forEach((e) => vanish(e, t22 - 0.35));
  [A1, A2].forEach((a) => [a.fr, a.pre, a.r.grp, ...a.rows].forEach((e) => vanish(e, t22 - 0.35))); [fk, eq, qB, mf, sf, ixB, q5, ...oW, ...mE.map((e) => e), ...mW, fmt, fmtW].forEach((e) => vanish(e, t22 - 0.35));
  slam(b1, Tw('j22', '一个核心', 'one core') - 0.1, { from: 1.15, d: 0.4 }); sfx('thud', Tw('j22', '一个核心', 'one core')); slam(b2, Tw('j22', '入口', 'entry point') - 0.1, { from: 1.15, d: 0.35 }); sfx('pop', Tw('j22', '入口', 'entry point')); slam(b3, Tw('j22', '网关', 'gateway') + 0.5, { from: 1.15, d: 0.35 });
  wipe(cH, Tw('j23', '约束', 'constraint') - 0.3, { dir: 'l', d: 0.5 }); sfx('whoosh', Tw('j23', '约束', 'constraint') - 0.3, { g: 0.5 }); seq(cE, Tw('j23', '前缀', 'prefix') - 0.4, 0.35, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t); });

  camTrack(cam, s.start, { x: CXW, y: 820, z: 1.3 }, [
    [t1 - 0.6, { x: CXW, y: 800, z: 1.1 }, 2.6, { ease: 'power2.out', sfx: false }],
    [t2 - 0.2, { x: CXW + 20, y: 800, z: 1.25 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t3 - 0.5, { x: CXW, y: 600, z: 1 }, 1.1],
    [t4 - 0.2, { x: CXW + 40, y: 620, z: 1.04 }, 4.0, { ease: 'sine.inOut', sfx: false }],
    [t5 - 0.5, { x: CXW - 80, y: 800, z: 0.86 }, 1.2],
    [t5 + 1.0, { x: CXW - 80, y: 815, z: 0.88 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t6 - 0.5, { x: 2528, y: 768, z: 1.5 }, 1.1],
    [t6 + 0.9, { x: 2560, y: 776, z: 1.52 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [t7 - 0.6, { x: BXC, y: BY + 250, z: 1 }, 1.3],
    [t7 + 1.0, { x: BXC + 20, y: BY + 240, z: 1.04 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t8 - 0.3, { x: KX - 50, y: BY + 290, z: 1.05 }, 1.0, { g: 0.4 }],
    [t8 + 0.8, { x: KX - 30, y: BY + 316, z: 1.09 }, Math.max(1.2, t9 - t8 - 1.3), { ease: 'sine.inOut', sfx: false }],
    [t9 - 0.3, { x: BXC - 440, y: BY + 260, z: 1 }, 1.0, { g: 0.4 }],
    [tn9 - 0.3, { x: KX + 420, y: BY + 310, z: 1.1 }, 0.9, { g: 0.4 }],
    [sl10.cover + 0.05, { x: PX0 + 760, y: PYT + 60, z: 1 }, 0.02, { sfx: false }],
    [t11 - 0.2, { x: PX0 + 700, y: PYT + 120, z: 1.06 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t12 - 0.2, { x: PX0 + 660, y: PYT + 220, z: 1.06 }, 2.8, { ease: 'sine.inOut', sfx: false }],
    [t13 - 0.4, { x: PX0 + 760, y: MY0 + 130, z: 1 }, 1.0, { g: 0.4 }],
    [t13 + 1.0, { x: PX0 + 740, y: MY0 + 110, z: 1.04 }, 4.0, { ease: 'sine.inOut', sfx: false }],
    [t14 - 0.2, { x: PX0 + 740, y: PYT + 325, z: 1 }, 1.0, { g: 0.4 }],
    [t15 - 0.3, { x: PX0 + 900, y: MY0 + 130, z: 1.05 }, 1.0, { g: 0.4 }],
    [t16 - 0.6, { x: LX + 760, y: LY + 190, z: 1 }, 1.3],
    [t17, { x: LX + 600, y: LY + 210, z: 1.12 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [t18 - 0.2, { x: LX + 800, y: LY + 230, z: 1 }, 1.0, { g: 0.4 }],
    [t19 - 0.2, { x: LX + 1300, y: LY + 300, z: 1.12 }, 1.0, { g: 0.4 }],
    [t20 - 0.3, { x: LX + 833, y: LY + 215, z: 1 }, 1.0, { g: 0.4 }],
    [t20 + 0.75, { x: LX + 908, y: LY + 215, z: 1 }, Math.max(1.2, t21 - t20 - 1.5), { ease: 'sine.inOut', sfx: false }],
    [t21 - 0.6, { x: EXX + 660, y: EYY + 60, z: 1 }, 1.2],
    [t21 + 1.0, { x: EXX + 680, y: EYY + 90, z: 1.04 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t22 - 0.7, { x: CXW, y: 790, z: 0.66 }, 1.4],
    [t22 + 1.0, { x: CXW + 40, y: 790, z: 0.68 }, 2.4, { ease: 'sine.inOut', sfx: false }],
    [t23 - 0.4, { x: CXW + 1040, y: 790, z: 0.66 }, 1.1, { g: 0.4 }],
    [t23 + 1.0, { x: CXW + 1100, y: 790, z: 0.68 }, 2.6, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
