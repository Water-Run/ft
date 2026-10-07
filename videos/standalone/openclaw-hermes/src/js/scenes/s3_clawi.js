// OpenClaw（实现与分析）：一张以网关为中心的大图，镜头依次走过：网关与客户端 → 通道插件 → 网关内部（会话键、车道、注入）→ 可换的运行时
// → 提示词与记忆 → 工具与心跳 → 拉远看全图 → 两条分析。引文、源码行与数字取自 data.js；车道里的会话与消息是示意。
scene('clawi', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, RD = C.claw, PP = C.paper;
  const GX = 1400, GY = 800, GW = 800, GH = 600;                  // 网关的方框
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, o);

  // ═══ A 网关与客户端 ═══
  const t1 = T('i1'), t2 = T('i2'), t3 = T('i3'), t4 = T('i4'), t5 = T('i5');
  const sec = tag(world, GX, GY - 190, 'OpenClaw', { bg: RD, c: C.ink, size: 40, cls: 'in9', pad: '8px 20px' }); wipe(sec, s.start + 0.7, { dir: 'l', d: 0.35 });
  const gw = frame(world, GX, GY, GW, GH, { c: RD, bw: 10 });
  const gwT = Lb(GX + 36, GY + 26, 'Gateway', { cls: 'in9', size: 84, c: RD });
  const lob = lobster(g, GX + GW - 116, GY - 86, 6);
  const tg1 = Tw('i1', '网关', 'gateway');
  wipe(gw, Math.min(tg1 - 0.35, s.start + 0.5), { dir: 'l', d: 0.6 }); slam(gwT, tg1, { from: 1.2, d: 0.4 }); appear(lob.grp, tg1 + 0.3); sfx('whoosh', tg1 - 0.35, { g: 0.5 }); sfx('thud', tg1 + 0.1);
  F((t) => lob.set(Math.abs(Math.sin(t * 3))));
  // 一台主机一个网关；默认端口
  const host = frame(world, GX - 70, GY - 110, GW + 140, GH + 180, { c: C.dimi, bw: 4, dash: true }), hostT = Lb(GX - 60, GY - 150, tr('一台主机', 'one host'), { size: 26, c: C.dimi });
  const port = tag(world, GX + GW - 348, GY + 44, '127.0.0.1:18789', { bg: PP, c: C.ink, size: 32 });
  const portS = srcLab(world, GX + 40, GY + 128, 'oc.arch.gateway', { size: 24 }); has('oc.arch.gateway', '127.0.0.1:18789'); has('oc.arch.onehost', 'One Gateway per host');
  vanish(sec, t2 - 0.3);
  wipe(host, Tw('i2', '一台主机', 'per host') - 0.2, { dir: 'l', d: 0.5 }); appear(hostT, Tw('i2', '一台主机', 'per host') + 0.2); sfx('tick', Tw('i2', '一台主机', 'per host'));
  slam(port, Tw('i2', '18789', '18789') - 0.5, { from: 1.2, d: 0.35 }); appear(portS, Tw('i2', '18789', '18789')); sfx('pop', Tw('i2', '18789', '18789') - 0.5);
  // 客户端
  const cx = [GX + 20, GX + 280, GX + 540], cn = [tr('命令行', 'CLI'), tr('网页控制台', 'Web console'), tr('桌面应用', 'Desktop app')], cw = [Tw('i3', '命令行', 'command line'), Tw('i3', '网页控制台', 'web console'), Tw('i3', '桌面应用', 'desktop app')];
  const cl = cx.map((x, i) => { const f = frame(world, x, 330, 240, 100, { c: PP, bw: 5 }), tt = Lb(x, 358, cn[i], { cls: 'body', size: 32, w: 240, align: 'center' }), w = wire(g, [[x + 120, 430], [x + 120, GY - 5]], PP, 5);
    wipe(f, cw[i] - 0.15, { dir: 't', d: 0.3 }); appear(tt, cw[i] + 0.1); drawIn(w, cw[i] + 0.1, 0.35); sfx('tick', cw[i]); return { f, tt, w, x: x + 120 }; });
  const clT = Lb(GX + 20, 276, tr('客户端', 'clients'), { size: 26, c: C.dimi }); appear(clT, Tw('i3', '客户端', 'clients') - 0.2);
  // WebSocket 与带类型的帧
  const ws = tag(world, GX + 300, 560, 'WebSocket', { bg: PP, c: C.ink, size: 28 }); slam(ws, Tw('i4', 'WebSocket', 'WebSocket'), { from: 1.2, d: 0.3 }); sfx('pop', Tw('i4', 'WebSocket', 'WebSocket'));
  const fr = [has('oc.arch.wire', '{type:"req", id, method, params}'), has('oc.arch.wire', '{type:"res", id, ok, payload|error}'), has('oc.arch.wire', '{type:"event", event, payload, seq?, stateVersion?}')];
  const frE = fr.map((t, i) => Lb(GX + GW + 60, 372 + i * 62, (i === 0 ? '↓ ' : '↑ ') + t, { size: 24, c: i === 0 ? PP : RD }));
  const frS = srcLab(world, GX + GW + 60, 372 + 3 * 62 + 4, 'oc.arch.wire'), frH = Lb(GX + GW + 60, 318, tr('JSON 帧，首帧必须是 connect', 'JSON frames; the first must be connect'), { size: 24, c: C.dimi }); has('oc.arch.first', 'First frame **must** be `connect`');
  const tj = Tw('i4', 'JSON', 'JSON');
  appear(frH, tj - 0.4); seq(frE, tj - 0.3, 0.3, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t, { g: 0.5 }); }); appear(frS, tj + 0.7);
  cl.forEach((c, i) => { const a = packet(g, 20, PP), b = packet(g, 20, RD); for (let k = 0; k < 4; k++) { const t = Tw('i4', 'WebSocket', 'WebSocket') + 0.3 + i * 0.25 + k * 1.3; a.ride(t, 0.45, [[c.x, 430], [c.x, GY]]); b.ride(t + 0.55, 0.45, [[c.x, GY], [c.x, 430]]); } });
  // 会话归网关
  const sdb = cyl(g, GX + 610, GY + 340, 150, 170, RD, { w: 6 }), sdbT = Lb(GX + 610, GY + 412, tr('会话', 'sessions'), { cls: 'hd', size: tr(34, 28), c: RD, w: 150, align: 'center' });
  const ts = Tw('i5', '会话', 'Sessions');
  appear(sdb, ts - 0.1); appear(sdbT, ts + 0.05); sfx('pop', ts - 0.1);
  const q5 = quote(world, GX + GW + 130, 640, 560, 'oc.msg.owned', 'Sessions are owned by the gateway, not by clients.', { bar: RD, size: 30 }); wipe(q5, Tw('i5', '网关所有', 'belong') - 0.1, { dir: 'l', d: 0.4 });

  [...frE, frS, frH].forEach((e) => exit(e, Math.max(T('i5') - 0.4, tj + 1.0), { d: 0.3 }));   // 镜头下移到网关时，这一段会被画面右缘截断：先淡出

  // ═══ B 通道插件 ═══
  [...frE, frS, frH, q5, ws, clT].forEach((e) => vanish(e, T('i6') - 0.5));
  const t6 = T('i6'), t7 = T('i7'), EX = 150, EY = 900, CELL = 40;
  const ext = D.ext, cells = ext.map(([n, ch], i) => R(g, EX + (i % 18) * CELL, EY + Math.floor(i / 18) * CELL, 34, 34, ch ? RD : 'none', ch ? {} : { stroke: C.dimi, 'stroke-width': 3 }));
  const exH = Lb(EX, EY - 100, 'extensions/', { cls: 'mono7', size: 34 }), exN = Lb(EX, EY - 52, '', { size: 28, c: C.dimi });
  const tn = Tw('i6', '162', '162'), tc = Tw('i6', '28', '28');
  appear(exH, tn - 0.5); appear(exN, tn - 0.4);
  cells.forEach((e, i) => { if (!ext[i][1]) appear(e, tn - 0.4 + i * 0.006); else { appear(e, tc - 0.2 + (i / 162) * 0.5); } });
  for (let i = 0; i < 6; i++) sfx('tick', tn - 0.4 + i * 0.15, { g: 0.3 }); sfx('pop', tc, { g: 0.6 });
  F((t) => { const a = Math.round(D.extCount * clamp((t - (tn - 0.4)) / 0.97)), b = Math.round(D.extChannels * clamp((t - (tc - 0.2)) / 0.5)); const tt = tr(`${a} 个扩展包`, `${a} extension packages`) + (t >= tc - 0.2 ? tr(` · 其中 ${b} 个是聊天通道`, ` · ${b} are chat channels`) : ''); if (exN.textContent !== tt) exN.textContent = tt; });
  // 四个通道接到网关的插口
  const named = ['feishu', 'telegram', 'slack', 'whatsapp'].filter((n) => ext.some(([m, ch]) => m === n && ch)), sy = [GY + 120, GY + 240, GY + 360, GY + 480];
  const tp = Tw('i6', '通道插件', 'channel plugins'), chT = [];
  named.forEach((n, i) => {
    const idx = ext.findIndex(([m]) => m === n), ex_ = EX + (idx % 18) * CELL, ey = EY + Math.floor(idx / 18) * CELL, rx = EX + 18 * CELL + 30 + i * 34;
    const hi = R(g, ex_ - 5, ey - 5, 44, 44, 'none', { stroke: PP, 'stroke-width': 5 });
    const so = R(g, GX - 24, sy[i] - 24, 48, 48, C.ink, { stroke: RD, 'stroke-width': 8 }), w = wire(g, [[ex_ + 42, ey + 17], [rx, ey + 17], [rx, sy[i]], [GX - 24, sy[i]]], RD, 5), tt = Lb(GX - 250, sy[i] - 60, n, { size: 28, c: RD, w: 210, align: 'right' });
    const t = tp + 0.3 + i * 0.12; appear(hi, t); appear(so, t); drawIn(w, t, 0.5); appear(tt, t + 0.3); sfx('tick', t, { g: 0.5 }); chT.push(tt);
  });
  // 插件负责什么、核心留下什么
  const own = [tr('平台的收发', 'send and receive'), tr('准入与配对', 'admission and pairing'), tr('会话的写法', 'session grammar')], core = [tr('发消息的工具 message', 'the message tool'), tr('会话键的外形', 'session-key shape'), tr('调度', 'dispatch')];
  const o1 = tag(world, EX, 560, tr('通道插件负责', 'A channel plugin owns'), { bg: RD, c: C.ink, size: 30, cls: 'hd' }), o2 = tag(world, EX + 620, 560, tr('核心留下', 'Core keeps'), { bg: PP, c: C.ink, size: 30, cls: 'hd' });
  const oE = own.map((t, i) => Lb(EX, 622 + i * 56, t, { cls: 'body', size: 36, c: RD })), cE = core.map((t, i) => Lb(EX + 620, 622 + i * 56, t, { cls: 'body', size: 36 }));
  const oS = srcLab(world, EX + 620, 800, 'oc.plugin.owns'); has('oc.plugin.owns', 'core provides one'); has('oc.plugin.core', 'Core owns the shared message tool');
  wipe(o1, Tw('i7', '插件', 'plugin') - 0.2, { dir: 'l', d: 0.3 }); seq(oE, Tw('i7', '收发', 'transport') - 0.1, 0.3, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t, { g: 0.5 }); }); appear(oS, Tw('i7', '插件', 'plugin') + 0.6);
  wipe(o2, Tw('i7', '会话键', 'session keys') - 0.3, { dir: 'l', d: 0.3 }); seq(cE, Tw('i7', '会话键', 'session keys') - 0.1, 0.3, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t, { g: 0.5 }); });

  // ═══ C 网关内部：路由、会话键、车道、注入（镜头推近到网关里，这里的尺寸按 1.8 倍镜头设计）═══
  const t8 = T('i8'), t9 = T('i9'), t10 = T('i10'), t11 = T('i11');
  const IX = GX + 60, PY_ = GY + 190, ly = [GY + 300, GY + 380, GY + 460], LX0 = GX + 300, LX1 = GX + 500;
  const st = [tr('路由 → 会话键', 'route → session key'), tr('去重', 'dedupe'), tr('合并连发', 'debounce')], stw = [Tw('i8', '路由', 'routed'), Tw('i8', '去重', 'deduplicated'), Tw('i8', '合并连发', 'debounced')];
  const strow = rowOf(world, IX, PY_, 8), stE = st.map((t, i) => { const e = tagIn(strow, t, { bg: PP, c: C.ink, size: 18, pad: '5px 10px' }); wipe(e, stw[i] - 0.1, { dir: 'l', d: 0.25 }); sfx('tick', stw[i] - 0.1); return e; });
  const pS = srcLab(world, IX, PY_ - 30, 'oc.messages.pipeline', { size: 13 }); appear(pS, t8 + 0.3);
  // 会话键与车道
  const keys = ['agent:main:main', 'agent:main:feishu:group:…', 'agent:main:telegram:group:…'];
  const lanes = ly.map((y, i) => R(g, LX0, y - 3, LX1 - LX0, 6, RD)), kE = keys.map((k, i) => Lb(IX, ly[i] - 14, k, { size: 16, c: i === 0 ? RD : PP }));
  const runs = ly.map((y) => ring(g, LX1 + 30, y, 16, RD, { w: 4, dot: 9, rest: 180, idle: false }));
  const kS = srcLab(world, IX, ly[2] + 26, 'oc.sessionkey.group', { size: 13 }); has('oc.sessionkey.dm', 'dmScope ?? "main"'); has('oc.sessionkey.group', 'agent:${normalizeAgentId(params.agentId)}:${channel}:${peerKind}:${peerId}');
  const dmT = Lb(IX, ly[0] - 40, tr('私聊（默认）', 'DMs (default)'), { size: 14, c: C.dimi }), grT = Lb(IX, ly[1] - 40, tr('群聊：各有各的键', 'groups: one key each'), { size: 14, c: C.dimi });
  const td = Tw('i9', '主会话', 'main session'), tgp = Tw('i9', '群聊', 'group');
  appear(kE[0], td - 0.3); appear(dmT, td - 0.3); fromTo(lanes[0], td - 0.2, { scaleX: 0, svgOrigin: `${LX0} ${ly[0]}` }, { scaleX: 1, duration: 0.35 }); appear(runs[0].grp, td); sfx('pop', td - 0.2);
  [1, 2].forEach((i) => { appear(kE[i], tgp - 0.2 + i * 0.15); fromTo(lanes[i], tgp - 0.1 + i * 0.15, { scaleX: 0, svgOrigin: `${LX0} ${ly[i]}` }, { scaleX: 1, duration: 0.35 }); appear(runs[i].grp, tgp + i * 0.15); }); appear(grT, tgp - 0.2); appear(kS, tgp + 0.5); sfx('pop', tgp);
  // 消息：从左侧插口进来，到对应车道排队；每条车道一次只跑一轮
  const QW = 22;
  function msg(t0, from, lane, slot, tRun, o = {}) {              // slot：排在队列第几位（0 = 最前）；tRun：轮到它开始跑的时刻
    const pk = packet(g, 14, o.c || PP), y = ly[lane], qx = LX1 - 12 - slot * QW;
    pk.ride(t0, 0.5, [[GX, sy[from]], [GX + 30, sy[from]], [GX + 30, y], [LX0, y], [qx, y]], { hold: Math.max(0, tRun - t0 - 0.5) });
    pk.ride(tRun, 0.2, [[qx, y], [LX1 + 14, y]], { hold: o.run || 1.0 });
    return pk;
  }
  // i9：两条私聊并进同一条车道；两条群聊各走各的
  msg(td + 0.1, 0, 0, 0, td + 0.7, { run: 1.3 }); msg(td + 0.5, 1, 0, 1, td + 2.3, { run: 1.2 });
  msg(tgp + 0.3, 0, 1, 0, tgp + 0.9, { run: 1.6 }); msg(tgp + 0.6, 1, 2, 0, tgp + 1.2, { run: 1.6 });
  runs[0].spin(td + 0.9, td + 2.2, 0.9, 180); runs[0].spin(td + 2.5, td + 3.7, 0.9, 180); runs[1].spin(tgp + 1.1, tgp + 2.7, 0.9, 180); runs[2].spin(tgp + 1.4, tgp + 3.0, 0.9, 180);
  // i10：同一会话里串行
  const ser = tag(world, LX1 + 70, ly[0] - 16, tr('一次一轮', 'one turn at a time'), { bg: RD, c: C.ink, size: 16, pad: '4px 8px' }), serS = srcLab(world, LX1 + 70, ly[0] + 20, 'oc.queue.lane', { size: 13 });
  has('oc.queue.lane', 'session-key lane'); has('oc.loop.serial', 'Runs are serialized per session key');
  const tl_ = Tw('i10', '车道', 'lane'), tse = Tw('i10', '串行', 'one at a time');
  [0, 1, 2].forEach((k) => msg(tl_ + k * 0.25, k % 2 ? 1 : 0, 0, k, tse + k * 1.0, { run: 0.8 })); for (let k = 0; k < 3; k++) runs[0].spin(tse + k * 1.0 + 0.2, tse + k * 1.0 + 1.0, 0.8, 180);
  slam(ser, tse, { from: 1.2, d: 0.3 }); appear(serS, tse + 0.3); sfx('thud', tse, { g: 0.6 }); [0, 1, 2].forEach((k) => sfx('tick', tse + k * 1.0, { g: 0.5 }));
  // i11：注入正在进行的一轮
  const ti = Tw('i11', '注入', 'injected'), tn11 = Tw('i11', '又来消息', 'mid-turn');
  vanish(ser, t11 - 0.2); vanish(serS, t11 - 0.2);
  msg(t11 - 0.1, 0, 0, 0, t11 + 0.5, { run: Tend('i11') - t11 + 0.6 }); runs[0].spin(t11 + 0.7, Tend('i11') + 1.0, 0.9, 180);
  const inj = packet(g, 14, RD); inj.ride(tn11, ti - tn11 + 0.15, [[GX, sy[1]], [GX + 30, sy[1]], [GX + 30, ly[0] - 46], [LX1 + 30, ly[0] - 46], [LX1 + 30, ly[0] - 18]], { hold: 0.15 }); sfx('pop', ti + 0.15, { p: 0.2 });
  const stT = tag(world, LX1 + 70, ly[0] - 16, 'mode: "steer"', { bg: RD, c: C.ink, size: 16, pad: '4px 8px' }), stS = srcLab(world, LX1 + 70, ly[0] + 20, 'oc.queue.steer', { size: 13 });
  has('oc.queue.mode', 'mode: "steer"'); has('oc.queue.steer', 'injected into the active runtime');
  slam(stT, ti, { from: 1.2, d: 0.3 }); appear(stS, ti + 0.3); sfx('thud', ti + 0.1, { g: 0.6 });

  // ═══ D 运行时：可换的循环 ═══（网关内部的小字只在推近时看得清，离开时收起）
  [...stE, pS, ...kE, kS, dmT, grT, stT, stS].forEach((e) => vanish(e, T('i12') - 0.55));
  const t12 = T('i12'), t13 = T('i13'), t14 = T('i14'), t15 = T('i15'), SLX = 2520, SLY = 900;
  // 推近到网关内部的这一段，四个通道名会被画面左缘截成半个词：推近时淡出，镜头离开后恢复（用 filter，不与入场的 autoAlpha 争同一个属性）
  { let last = -1; F((t) => { const k = 1 - clamp((t - (t8 - 0.55)) / 0.3) + clamp((t - (t12 - 0.2)) / 0.3); if (k !== last) { last = k; chT.forEach((e) => { e.style.filter = k >= 1 ? '' : `opacity(${k.toFixed(3)})`; }); } }); }
  const link = wire(g, [[GX + GW, 1100], [SLX, 1100]], RD, 8);
  const slot = frame(world, SLX, SLY, 420, 400, { c: PP, bw: 5, dash: true }), slotT = Lb(SLX, SLY - 56, tr('智能体运行时', 'agent runtime'), { cls: 'hd', size: 40 });
  const tr12 = Tw('i12', '智能体运行时', 'agent runtime');
  drawIn(link, t12 - 0.2, 0.4); wipe(slot, tr12 - 0.3, { dir: 'l', d: 0.4 }); slam(slotT, tr12, { from: 1.15, d: 0.35 }); sfx('pop', tr12);
  const q12 = quote(world, SLX, 620, 490, 'oc.runtime.def', 'An **agent runtime** owns one prepared model loop', { bar: RD, size: 28, html: (x) => x.replace(/\*\*/g, '') }); wipe(q12, tr12 + 0.4, { dir: 'l', d: 0.4 });
  // 卡带：openclaw（旧别名 pi）、codex、claude-cli
  function cart(name, sub) {
    const grp = h('div', 'abs', world); px(grp, SLX + 30, SLY + 40, 360, 320); css(grp, { border: `8px solid ${RD}`, background: C.ink, boxSizing: 'border-box' });
    const n = h('div', 'abs mono7', grp, name); px(n, 22, 12); css(n, { fontSize: '40px', color: RD });
    const sb = h('div', 'abs mono', grp, sub); px(sb, 22, 254); css(sb, { fontSize: '32px', color: C.dimi });
    const sv = svg('svg', { class: 'gi' }, grp);
    const r = ring(sv, 172, 160, 74, PP, { w: 7, dot: 20, rest: 180 });
    return { grp, r };
  }
  has('oc.runtime.alias', 'The built-in runtime id is `openclaw`. The legacy alias `pi` normalizes to `openclaw`.'); has('oc.runtime.embedded', '`codex`'); has('oc.runtime.cli', 'claude-cli');
  const cO = cart('openclaw', tr('内置 · 旧别名 pi', 'legacy alias: pi')), cC = cart('codex', tr('插件 harness', 'plugin harness')), cL = cart('claude-cli', tr('CLI 后端', 'CLI backend'));
  const aS = srcLab(world, SLX, SLY + 414, 'oc.runtime.alias');
  const tO = Tw('i13', 'openclaw', 'openclaw');
  fromTo(cO.grp, tO - 0.3, { autoAlpha: 0, x: 520 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'back.out(1.2)' }); sfx('thud', tO + 0.15); appear(aS, Tw('i13', 'pi', 'pi')); cO.r.spin(tO + 0.3, s.end, 2.0, 180);
  // 换卡带：各自从右侧待命位滑入插槽，上一个滑回
  const park = (i) => ({ x: 500, y: -300 + i * 250, scale: 0.7 });       // 待命位：0 openclaw 离开时的位置，1 codex，2 claude-cli
  [cC, cL].forEach((c, i) => { tl.set(c.grp, { autoAlpha: 0, transformOrigin: '0 0', ...park(i + 1) }, 0); fromTo(c.grp, t14 - 0.5 + i * 0.12, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }); c.r.spin(t14, s.end, 2.0, 180); });
  const tcx = Tw('i14', 'Codex', 'Codex'), tcl = Tw('i14', 'Claude', 'Claude'), tsw = Tw('i14', '运行时', 'runtime');
  tl.to(cO.grp, { ...park(0), transformOrigin: '0 0', duration: 0.45, ease: 'power3.inOut' }, tcx + 0.1); tl.to(cC.grp, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'power3.inOut' }, tcx + 0.15); sfx('whoosh', tcx + 0.1, { g: 0.5 }); sfx('thud', tcx + 0.55, { g: 0.6 });
  tl.to(cC.grp, { ...park(1), duration: 0.45, ease: 'power3.inOut' }, tcl + 0.3); tl.to(cL.grp, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'power3.inOut' }, tcl + 0.35); sfx('whoosh', tcl + 0.3, { g: 0.5 }); sfx('thud', tcl + 0.75, { g: 0.6 });
  const tb = Tw('i15', '替换', 'replaceable');
  tl.to(cL.grp, { ...park(2), duration: 0.45, ease: 'power3.inOut' }, tb - 0.2); tl.to(cO.grp, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'power3.inOut' }, tb - 0.15); sfx('whoosh', tb - 0.2, { g: 0.5 }); sfx('thud', tb + 0.25, { g: 0.6 });
  const rep = tag(world, SLX + 130, SLY - 4, tr('可替换', 'replaceable'), { bg: RD, c: C.ink, size: 28, cls: 'hd' }); slam(rep, tb + 0.2, { from: 1.2, d: 0.3 });

  // ═══ E 提示词与记忆 ═══
  const t16 = T('i16'), t17 = T('i17'), t18 = T('i18'), t19 = T('i19'), PXX = 900, PYY = 1560;
  const pr = frame(world, PXX, PYY, 520, 470, { c: PP, bw: 6 }), prT = Lb(PXX, PYY - 56, tr('系统提示词 · 每一轮装配', 'system prompt · built every run'), { cls: 'hd', size: 34 });
  const prUp = wire(g, [[PXX + 260, PYY], [PXX + 260, 1470], [GX + 120, 1470], [GX + 120, GY + GH]], PP, 5);
  const layers = [tr('基础提示词', 'base prompt'), tr('技能', 'skills'), tr('工作区文件', 'workspace files'), tr('本轮的易变内容', 'per-turn volatile')];
  const lyE = layers.map((t, i) => { const e = h('div', 'abs body', world, t); px(e, PXX + 24, PYY + 26 + i * 108, 472, 86); css(e, { border: `4px solid ${i === 2 ? RD : C.dimi}`, color: i === 2 ? RD : PP, fontSize: '30px', lineHeight: '78px', paddingLeft: '20px', boxSizing: 'border-box' }); return e; });
  const pS16 = srcLab(world, PXX, PYY + 482, 'oc.prompt.own'); has('oc.prompt.own', 'OpenClaw builds its own system prompt for every agent run'); has('oc.prompt.build', 'bootstrap context');
  wipe(pr, t16 - 0.1, { dir: 't', d: 0.4 }); appear(prT, t16 + 0.2); drawIn(prUp, t16 + 0.3, 0.5); seq(lyE, Tw('i16', '装配', 'assembles') - 0.3, 0.14, (e, t) => { wipe(e, t, { dir: 'l', d: 0.25 }); sfx('tick', t, { g: 0.4 }); }); appear(pS16, t16 + 1.2);
  // 工作区文件
  const FX = 1620, FY = 1600, fn = ['AGENTS.md', 'SOUL.md', 'USER.md', 'MEMORY.md'];
  has('oc.workspace.files', 'Standard files'); has('oc.workspace.soul', 'Persona'); has('oc.workspace.memory', 'Curated long-term memory');
  const wsT = Lb(FX, PYY - 56, '~/.openclaw/workspace', { cls: 'mono7', size: 30 }); has('oc.memory.md', '~/.openclaw/workspace');
  const fE = fn.map((n, i) => [fileIcon(g, FX + i * 210, FY, 110, 140, i === 3 ? RD : PP, { w: 5 }), Lb(FX + i * 210 - 40, FY + 152, n, { size: 24, c: i === 3 ? RD : PP, w: 190, align: 'center' })]);
  const fW = wire(g, [[FX + 3 * 210 + 55, FY - 8], [FX + 3 * 210 + 55, FY - 30], [1500, FY - 30], [1500, PYY + 285], [PXX + 520, PYY + 285]], RD, 5);
  const tf = Tw('i17', 'Markdown', 'Markdown');
  appear(wsT, tf - 0.4); seq(fE, tf - 0.3, 0.12, (e, t) => { appear(e[0], t); appear(e[1], t + 0.05); sfx('tick', t, { g: 0.4 }); });
  drawIn(fW, Tw('i17', '注入', 'injected') - 0.2, 0.5); [0, 1, 2].forEach((k) => { const pk = packet(g, 20, RD); pk.ride(Tw('i17', '注入', 'injected') + 0.2 + k * 0.5, 0.6, [[FX + 3 * 210 + 55, FY - 8], [FX + 3 * 210 + 55, FY - 30], [1500, FY - 30], [1500, PYY + 285], [PXX + 520, PYY + 285]]); });
  const q18 = quote(world, FX, 1850, 900, 'oc.memory.md', 'there is no hidden state', { bar: RD, size: 34, html: () => 'The model only remembers what gets saved to disk; <span class="hl">there is no hidden state</span>.' }); has('oc.memory.md', 'The model only remembers what gets');
  wipe(q18, Tw('i18', '模型只记得', 'the model remembers') - 0.2, { dir: 'l', d: 0.4 });
  // 每天一份笔记、检索、后台整理
  const DX = FX + 4 * 210 + 60, days = ['10-04', '10-05', '10-06'];
  const dE = days.map((d, i) => [fileIcon(g, DX + i * 26, FY + i * 20 - 20, 110, 140, PP, { w: 5, fill: C.ink }), null]);
  const dT = Lb(DX - 30, FY + 172, 'memory/2026-10-06.md', { size: 22, w: 280, align: 'center' });
  const td19 = Tw('i19', '每天一份', 'Daily notes'), tse19 = Tw('i19', '检索', 'searchable'), tdr = Tw('i19', '后台', 'background');
  wipeOut(q18, t19 - 0.3, { dir: 'l', d: 0.3 });
  seq(dE, td19 - 0.2, 0.18, (e, t) => { appear(e[0], t); sfx('tick', t, { g: 0.5 }); }); appear(dT, td19 + 0.3);
  const msE = chip(world, DX + 220, FY + 20, 'memory_search', 'ni', 26), msL = wire(g, [[DX + 170, FY + 44], [DX + 220, FY + 44]], PP, 5); has('oc.memsearch', '`memory_search` finds relevant notes');
  slide(msE, tse19, { x: 20, d: 0.3 }); drawIn(msL, tse19, 0.2); sfx('blip', tse19);
  const dr = Pa(g, `M${DX + 60},${FY + 210} C ${DX + 20},${FY + 330} ${FX + 3 * 210 + 120},${FY + 330} ${FX + 3 * 210 + 60},${FY + 200}`, { stroke: RD, 'stroke-width': 6 });
  const drT = tag(world, FX + 3 * 210 + 120, FY + 300, tr('后台整理（dreaming，默认开启）', 'background consolidation (dreaming, on by default)'), { bg: RD, c: C.ink, size: 24 }); has('oc.dreaming.default', 'Dreaming is enabled by default'); has('oc.memory.distill', 'distilled into `MEMORY.md`');
  drawIn(dr, tdr - 0.1, 0.6); wipe(drT, tdr + 0.2, { dir: 'l', d: 0.35 }); sfx('whoosh', tdr - 0.1, { g: 0.4 });
  const pk19 = packet(g, 20, RD); pk19.ride(tdr + 0.5, 0.8, [[DX + 60, FY + 210], [DX + 20, FY + 300], [FX + 3 * 210 + 100, FY + 300], [FX + 3 * 210 + 60, FY + 200]]);

  // ═══ F 工具与心跳 ═══
  const t20 = T('i20'), t21 = T('i21'), TX = 3200, TY = 1480, EXX = SLX + 210, BUS = 3120;
  vanish(q12, t16 - 0.5);
  const exW = wire(g, [[EXX, SLY + 400], [EXX, 1420], [BUS, 1420]], PP, 6), exC = tag(world, EXX + 70, 1396, 'exec', { bg: PP, c: C.ink, size: 32 });
  const tgt = [[tr('网关所在的主机', 'the gateway host'), tr('默认', 'default'), RD, false], [tr('沙箱', 'sandbox'), tr('默认关闭', 'off by default'), C.dimi, true], [tr('配对的设备', 'a paired node'), tr('可选', 'optional'), C.dimi, true]];
  has('oc.exec.host', 'tools.exec.host'); has('oc.trust.sandbox', 'Sandboxing is off by default');
  const tgE = tgt.map(([n, sub, c, dash], i) => { const y = TY + i * 170, f = frame(world, TX, y, 520, 130, { c, bw: 6, dash, fill: i === 0 ? RD : 'transparent' }), a = Lb(TX + 28, y + 36, n, { cls: 'hd', size: tr(40, 34), c: i === 0 ? C.ink : c }), b = Lb(TX + 280, y + 44, sub, { size: 28, c: i === 0 ? C.ink : c, w: 212, align: 'right' }); const w = wire(g, [[BUS, i ? TY + (i - 1) * 170 + 65 : 1420], [BUS, y + 65], [TX, y + 65]], c, 5, i ? { dash: '10 8' } : {}); return { f, a, b, w, y }; });
  const th20 = Tw('i20', '主机', 'gateway host'), tsb = Tw('i20', '沙箱', 'sandboxing');
  drawIn(exW, t20 - 0.2, 0.4); slam(exC, t20 + 0.2, { from: 1.2, d: 0.3 }); sfx('pop', t20 + 0.2);
  [tgE[0]].forEach((e) => { drawIn(e.w, th20 - 0.3, 0.4); wipe(e.f, th20 - 0.1, { dir: 'l', d: 0.3 }); appear(e.a, th20 + 0.1); appear(e.b, th20 + 0.2); sfx('thud', th20, { g: 0.6 }); });
  [tgE[1], tgE[2]].forEach((e, i) => { appear(e.w, tsb - 0.2 + i * 0.25); appear(e.f, tsb - 0.1 + i * 0.25); appear(e.a, tsb + i * 0.25); appear(e.b, tsb + 0.1 + i * 0.25); sfx('tick', tsb + i * 0.25); });
  const exS = srcLab(world, TX, TY - 46, 'oc.trust.sandbox', { size: 24 }); appear(exS, tsb + 0.6);
  [0, 0.8, 1.6, 2.4].forEach((dt) => { const pk = packet(g, 20, RD); pk.ride(th20 + 0.3 + dt, 0.7, [[EXX, SLY + 400], [EXX, 1420], [BUS, 1420], [BUS, TY + 65], [TX, TY + 65]]); });
  // 心跳：网关右上角的时钟，按默认间隔往主会话里放一轮
  const HBX = 2320, HBY = 700, ck = clock(g, HBX, HBY, 44, RD, { w: 7 }), ckW = wire(g, [[HBX - 44, HBY], [GX + GW - 200, HBY], [GX + GW - 200, GY]], RD, 6);
  const ckT = Lb(HBX + 64, HBY - 42, tr('心跳 · 默认 30m', 'heartbeat · default 30m'), { cls: 'mono7', size: 32, c: RD }), ckS = Lb(HBX + 64, HBY + 6, tr('主会话里的一轮（用 Anthropic OAuth 时为 1h）', 'a main-session turn (1h with Anthropic OAuth)'), { size: 24, c: C.dimi });
  has('oc.heartbeat.default', 'default is `30m`'); has('oc.heartbeat.def', 'main session');
  const thb = Tw('i21', '心跳', 'heartbeat');
  appear(ck.grp, thb - 0.2); drawIn(ckW, thb, 0.4); appear(ckT, thb + 0.2); appear(ckS, thb + 0.6); ck.run(thb, s.end, 1.4); sfx('tick', thb); sfx('tick', thb + 0.7); sfx('tick', thb + 1.4); sfx('tick', thb + 2.1);
  [0.6, 2.0].forEach((dt) => { const pk = packet(g, 20, RD); pk.ride(thb + dt, 0.6, [[HBX - 44, HBY], [GX + GW - 200, HBY], [GX + GW - 200, GY], [GX + GW - 200, GY + 60]]); });

  // ═══ G 全图与分析 ═══
  const t22 = T('i22'), t23 = T('i23'), t24 = T('i24');
  const big = (x, y, t, bg, c) => tag(world, x, y, t, { bg, c, size: 64, cls: 'hd', pad: '12px 28px' });
  const sT = big(GX + 60, GY + 220, tr('状态在网关', 'state lives here'), RD, C.ink);
  const pl = [[EX, 700, tr('通道 = 插件', 'channels = plugins')], [SLX, 700, tr('运行时 = 插件', 'runtimes = plugins')], [FX, 1880, tr('记忆 = 插件位', 'memory = a plugin slot')]];
  has('oc.vision.memory', 'Memory is a special plugin slot'); has('oc.vision.core', 'Core stays lean; optional capabilities should usually ship as plugins.');
  const plE = pl.map(([x, y, t]) => big(x, y, t, PP, C.ink));
  const tg22 = Tw('i22', '状态', 'state'), tp22 = Tw('i22', '插件', 'plugin');
  const keepBig = () => [sT, ...plE, a1, q23, a2, ...dfl, q24, iso];
  slam(sT, tg22, { from: 1.15, d: 0.4 }); sfx('thud', tg22 + 0.1); seq(plE, tp22 - 0.4, 0.14, (e, t) => { slam(e, t, { from: 1.15, d: 0.3 }); sfx('pop', t, { g: 0.5 }); });
  // 分析卡：画在图外很远的地方；用一张小节幕遮住，在遮住的那一刻切镜头（见本场景末尾的镜头轨迹）
  const sl23 = slate(t23 - 0.55, { bg: RD, text: tr('分析', 'Analysis'), sub: 'OpenClaw', tin: 0.22, hold: 0.16, tout: 0.25 });
  const AXX = 520, AYY = 2560;
  const a1 = tag(world, AXX, AYY, tr('代价', 'The cost'), { bg: RD, c: C.ink, size: 40, cls: 'hd', pad: '8px 20px' });
  const q23 = quote(world, AXX, AYY + 90, 1500, 'oc.vision.tax', 'The core carries a per-call tax: each core tool, prompt line, and config key reaches every operator on every model request', { bar: RD, size: 38, html: (x) => mark(x, ['per-call tax', 'every model request']) });
  wipe(a1, sl23.clear - 0.05, { dir: 'l', d: 0.3 }); wipe(q23, sl23.clear + 0.1, { dir: 'l', d: 0.5 });
  const BYY = AYY + 400;
  const a2 = tag(world, AXX, BYY, tr('默认值', 'The defaults'), { bg: PP, c: C.ink, size: 40, cls: 'hd', pad: '8px 20px' });
  const dfl = [Lb(AXX, BYY + 84, 'session.dmScope: "main"', { cls: 'mono7', size: 38, c: RD }), Lb(AXX + 700, BYY + 84, tr('沙箱：关闭', 'sandbox: off'), { cls: 'mono7', size: 38, c: RD }), Lb(AXX + 1100, BYY + 84, tr('→ 一人自用', '→ one person'), { cls: 'hd', size: 40 })];
  const q24 = quote(world, AXX, BYY + 170, 1500, 'oc.session.dmwarn', 'If multiple people can message your agent, enable DM isolation.', { bar: PP, size: 34 });
  const iso = Lb(AXX + 34, BYY + 300, 'session.dmScope: "per-channel-peer"', { cls: 'mono7', size: 34 }); has('oc.session.dmpeer', 'per-channel-peer'); has('oc.session.dmmain', '`main` (default)');
  wipe(a2, t24 - 0.1, { dir: 'l', d: 0.3 }); seq(dfl, Tw('i24', '默认值', 'defaults') - 0.1, 0.35, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t); });
  // 拉远看全图时只留大字：其余自身带文字的元素在拉远前收起（缩小后看不清）
  { const keep = keepBig(); [...world.querySelectorAll('div')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !keep.some((k) => k === e || k.contains(e))).forEach((e) => vanish(e, t22 - 0.35)); vanish(exN, t22 - 0.35); }
  wipe(q24, Tw('i24', '多人', 'several users') - 0.2, { dir: 'l', d: 0.4 }); wipe(iso, Tw('i24', '隔离', 'isolating') - 0.1, { dir: 'l', d: 0.3 }); sfx('pop', Tw('i24', '隔离', 'isolating'));

  camTrack(cam, s.start, { x: 1800, y: 900, z: 1.25 }, [
    [t1 - 0.6, { x: 1800, y: 1000, z: 1.05 }, 2.6, { ease: 'power2.out', sfx: false }],
    [t2 - 0.3, { x: 1800, y: 1040, z: 0.95 }, 1.0, { g: 0.4 }],
    [t3 - 0.4, { x: 1800, y: 720, z: 1 }, 1.1],
    [t4 - 0.2, { x: 2170, y: 700, z: 1 }, 1.2, { g: 0.4 }],
    [t4 + 1.05, { x: 2215, y: 722, z: 1.03 }, Math.max(1.0, t5 - t4 - 1.5), { ease: 'sine.inOut', sfx: false }],
    [t5 - 0.3, { x: 2100, y: 960, z: 1.05 }, 1.1, { g: 0.4 }],
    [t6 - 0.6, { x: 1000, y: 1020, z: 1 }, 1.3],
    [t6 + 1.6, { x: 1020, y: 1030, z: 1.03 }, 2.8, { ease: 'sine.inOut', sfx: false }],
    [t7 - 0.4, { x: 980, y: 900, z: 1 }, 1.0, { g: 0.4 }],
    [t7 + 1.2, { x: 1000, y: 880, z: 1.04 }, 2.8, { ease: 'sine.inOut', sfx: false }],
    [t8 - 0.6, { x: 1790, y: 1090, z: 1.82 }, 1.3],
    [t9 - 0.2, { x: 1800, y: 1100, z: 1.9 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t10 - 0.2, { x: 1850, y: 1100, z: 1.95 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t11 - 0.2, { x: 1880, y: 1104, z: 2 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t12 - 0.6, { x: 2700, y: 1000, z: 1 }, 1.3],
    [t13 - 0.2, { x: 2740, y: 1080, z: 1.15 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [t14 - 0.3, { x: 2860, y: 1060, z: 1.02 }, 1.0, { g: 0.4 }],
    [t15, { x: 2760, y: 1060, z: 1.1 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t16 - 0.6, { x: 1560, y: 1760, z: 1 }, 1.3],
    [t17 - 0.2, { x: 1800, y: 1760, z: 1 }, 3.2, { ease: 'sine.inOut', sfx: false }],
    [t18 - 0.2, { x: 1900, y: 1800, z: 1.04 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [t19 - 0.2, { x: 2240, y: 1760, z: 1.1 }, 1.1, { g: 0.4 }],
    [t20 - 0.6, { x: 3180, y: 1520, z: 1 }, 1.2],
    [t20 + 1.2, { x: 3220, y: 1560, z: 1.04 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t21 - 0.5, { x: 2360, y: 900, z: 1.1 }, 1.1],
    [t21 + 1.0, { x: 2340, y: 880, z: 1.14 }, 2.2, { ease: 'sine.inOut', sfx: false }],
    [t22 - 0.7, { x: 1900, y: 1240, z: 0.5 }, 1.4],
    [t22 + 1.0, { x: 1900, y: 1260, z: 0.52 }, 2.4, { ease: 'sine.inOut', sfx: false }],
    [sl23.cover + 0.04, { x: AXX + 760, y: AYY + 250, z: 1 }, 0.02, { sfx: false }],
    [t23 + 1.0, { y: AYY + 300, z: 1.03 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [t24 - 0.3, { x: AXX + 780, y: BYY + 130, z: 1 }, 1.0, { g: 0.4 }],
    [t24 + 1.0, { z: 1.04 }, s.end - t24 - 0.7, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
