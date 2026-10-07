// 05 真实链路：一台 Mac mini 上的网关接入飞书。先交代主机与 launchd，再讲长连接为什么由内向外，然后让一条消息沿两条泳道走完全程
// （上：OpenClaw，珊瑚红；下：Hermes Agent，金色），最后回到网络图：离开这台机器的只有两类请求。
// 两个网关并排画在同一台机器上是为了对照；链路上的每一步都给出固定提交里的源码行或文档行（data.js）。消息内容与编号是示意。
scene('mini', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, RD = C.claw, GD = C.herm, PP = C.paper;
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, o);

  // ═══ 第一站：主机与 launchd；第二站：网络（同一张图，镜头先近后远）═══
  const MX = 1290, MY = 380, MS = 300;                             // Mac mini（俯视的圆角方形）
  const mini = frame(world, MX, MY, MS, MS, { c: PP, bw: 7, r: 56 }), led = Ci(g, MX + MS - 44, MY + MS - 40, 7, PP);
  const miniT = Lb(MX, MY + MS + 18, 'Mac mini', { cls: 'in9', size: 44, w: MS, align: 'center' });
  const t2 = T('m2'), t3 = T('m3'), t4 = T('m4'), t5 = T('m5'), t6 = T('m6');
  wipe(mini, s.start + 0.4, { dir: 'l', d: 0.5 }); appear(led, c0 + 0.1); appear(miniT, c0 + 0.2); sfx('whoosh', c0 - 0.3, { g: 0.5 });
  const hd1 = Lb(150, 300, tr('一条真实的链路', 'One real path'), { cls: 'hd', size: 96 }), hd1s = Lb(156, 432, tr('Mac mini · launchd · 飞书', 'Mac mini · launchd · Feishu'), { size: 40, c: C.dimi });
  wipe(hd1, c0 + 0.32, { dir: 'l', d: 0.45 }); appear(hd1s, c0 + 0.7); [hd1, hd1s].forEach((e) => vanish(e, t2 - 0.3));
  const note = Lb(120, 70, tr('对照示意：两个网关并排画在同一台机器上', 'For comparison, both gateways are drawn on one machine'), { size: 24, c: C.dimi }); appear(note, c0 + 0.3);
  // 两个网关进程：两个方块
  const pO = R(g, MX + 70, MY + 110, 60, 60, RD), pH = R(g, MX + 170, MY + 110, 60, 60, GD), pOT = Lb(MX + 40, MY + 184, 'OpenClaw', { size: 22, c: RD, w: 120, align: 'center' }), pHT = Lb(MX + 140, MY + 184, 'Hermes', { size: 22, c: GD, w: 120, align: 'center' });
  [pO, pOT].forEach((e) => appear(e, t2)); [pH, pHT].forEach((e) => appear(e, t2 + 0.2)); sfx('pop', t2); sfx('pop', t2 + 0.2, { p: 0.2 });
  const faq = quote(world, 150, 250, 900, 'oc.mini.faq', 'A Mac mini is a popular', { bar: RD, size: 30, html: () => 'A Mac mini is a popular always-on host choice, but a small VPS, home server, or Raspberry Pi-class box works too.', pre: 'OpenClaw · ' }); has('oc.mini.faq', 'always-on host choice, but a small VPS, home server, or Raspberry Pi-class box works too.');
  wipe(faq, Tw('m2', '不关机', 'switched on') - 0.3, { dir: 'l', d: 0.4 });
  // launchd
  const lT = tag(world, 150, 470, 'launchd', { bg: PP, c: C.ink, size: 40, cls: 'mono7', pad: '8px 18px' });
  const l1 = Lb(150, 548, has('oc.launchd.label', '~/Library/LaunchAgents/ai.openclaw.gateway.plist'), { size: 26, c: RD }), l2 = Lb(150, 590, '~/Library/LaunchAgents/' + has('hm.launchd.label', 'ai.hermes.gateway') + '.plist', { size: 26, c: GD });
  const k1 = Lb(150, 656, 'RunAtLoad', { cls: 'mono7', size: 32 }), k1n = Lb(400, 660, tr('登录时启动', 'start at login'), { cls: 'body', size: 30 }), k2 = Lb(150, 708, 'KeepAlive', { cls: 'mono7', size: 32 }), k2n = Lb(400, 712, tr('异常退出后拉起', 'restart after an abnormal exit'), { cls: 'body', size: 30 });
  const lS = srcLab(world, 150, 770, 'hm.launchd.plist'), lS2 = srcLab(world, 150, 800, 'oc.launchd.keepalive'); has('hm.launchd.plist', '<key>RunAtLoad</key>'); has('hm.launchd.plist', '<key>KeepAlive</key>'); has('oc.launchd.keepalive', 'KeepAlive auto-recovery stays active'); has('oc.launchd.plist', 'writes LaunchAgent plists'); has('hm.launchd.doc', 'a **launchd** service on macOS');
  const tl3 = Tw('m3', 'launchd', 'launchd'), tr3 = Tw('m3', '登录时启动', 'started at login'), tk3 = Tw('m3', '异常退出', 'abnormally') - 0.3;
  vanish(faq, t3 - 0.15); slam(lT, tl3, { from: 1.2, d: 0.35 }); sfx('thud', tl3); wipe(l1, tl3 + 0.3, { dir: 'l', d: 0.3 }); wipe(l2, tl3 + 0.45, { dir: 'l', d: 0.3 });
  [k1, k1n].forEach((e) => appear(e, tr3)); sfx('tick', tr3); [k2, k2n].forEach((e) => appear(e, tk3)); sfx('tick', tk3); appear(lS, tk3 + 0.4); appear(lS2, tk3 + 0.5);
  // 异常退出 → 被拉起：金色方块消失片刻又回来
  const tx_ = Tw('m3', '异常退出', 'abnormally'), tb_ = Tw('m3', '被拉起', 'restarted');
  tl.set(pH, { autoAlpha: 0 }, tx_ + 0.1); fromTo(pH, Math.max(tb_, tx_ + 0.5), { autoAlpha: 0, scale: 0.3, svgOrigin: `${MX + 200} ${MY + 140}` }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', immediateRender: false }); sfx('thud', tx_ + 0.1, { g: 0.5, p: -0.3 }); sfx('pop', Math.max(tb_, tx_ + 0.5));

  // ═══ 第二站：网络 ═══（launchd 的文字收起，左侧换成飞书）
  [lT, l1, l2, k1, k1n, k2, k2n, lS, lS2].forEach((e) => vanish(e, t4 - 0.35));
  const FX = 150, FY = 400, fs = frame(world, FX, FY, 440, 260, { c: PP, bw: 6, r: 36 }), fsT = Lb(FX, FY + 96, tr('飞书开放平台', 'Feishu Open Platform'), { cls: 'hd', size: tr(46, 36), w: 440, align: 'center' });
  const NX = 1090, nat = wire(g, [[NX, 170], [NX, 900]], C.dimi, 5, { dash: '14 12' }), natT = Lb(NX + 24, 190, tr('家里的网络 · 没有公网地址', 'home network · no public address'), { size: 26, c: C.dimi });
  wipe(fs, t4 - 0.2, { dir: 'l', d: 0.4 }); appear(fsT, t4 + 0.1); appear(nat, Tw('m4', '没有公网地址', 'public address') - 0.2); appear(natT, Tw('m4', '没有公网地址', 'public address')); sfx('tick', Tw('m4', '没有公网地址', 'public address'));
  // 从外向内：到边界被挡回
  const tq = Tw('m4', '怎么进来', 'arrive');
  const inP = packet(g, 26, PP, { hollow: true }); inP.ride(tq - 0.5, 0.6, [[FX + 440, 480], [NX - 24, 480]], { hold: 0.25 }); inP.ride(tq + 0.4, 0.4, [[NX - 24, 480], [NX - 150, 480]], { hold: 0.2 }); sfx('thud', tq + 0.1, { g: 0.6, p: -0.2 });
  const qm = Lb(NX - 70, 400, '?', { cls: 'in9', size: 80 }); slam(qm, tq + 0.1, { from: 1.3, d: 0.3 }); vanish(qm, t5 - 0.1);
  // 由内向外的长连接：两条（两个网关各一条）
  const yO = 500, yH = 560, tubeO = wire(g, [[MX, yO], [FX + 440, yO]], RD, 8), tubeH = wire(g, [[MX, yH], [FX + 440, yH]], GD, 8);
  const tu = Tw('m5', '主动', 'opens');
  drawIn(tubeO, tu - 0.1, 0.9); drawIn(tubeH, tu + 0.1, 0.9); sfx('whoosh', tu - 0.1, { g: 0.5 }); sfx('pop', tu + 0.9);
  const lc = tag(world, 700, 428, tr('长连接 · 由内向外建立', 'long connection · opened from inside'), { bg: PP, c: C.ink, size: 26 }); slam(lc, Tw('m5', '长连接', 'long connection'), { from: 1.2, d: 0.3 });
  const np = h('div', 'abs', world); px(np, 150, 700, 900); css(np, { whiteSpace: 'normal' });
  css(h('div', 'mono', np, '"' + esc(D.sdkNoPublic) + '"'), { fontSize: '24px', lineHeight: '1.4', whiteSpace: 'normal', color: PP });
  const npS = h('div', 'mono', np, tr('飞书官方 Node SDK 的 README', 'README of the official Feishu Node SDK')); css(npS, { fontSize: '22px', color: C.dimi, marginTop: '8px' }); if (!D.sdkNoPublic.includes('no need to provide public IP or domain name')) console.warn('quote mismatch sdkNoPublic');
  wipe(np, Tw('m5', '长连接', 'long connection') + 0.3, { dir: 'l', d: 0.4 });
  // 两边用的都是官方 SDK 的 WebSocket 客户端
  vanish(np, t6 - 0.2);
  const w1 = Lb(150, 700, 'Promise&lt;Lark.WSClient&gt;', { cls: 'mono7', size: 30, c: RD }), w1s = srcLab(world, 150, 742, 'oc.feishu.wsclient'), w2 = Lb(150, 796, has('hm.feishu.wsimport', 'importlib.import_module("lark_oapi.ws").Client'), { cls: 'mono7', size: 30, c: GD }), w2s = srcLab(world, 150, 838, 'hm.feishu.wsimport'); has('oc.feishu.wsclient', 'Promise<Lark.WSClient>');
  const tw6 = Tw('m6', '官方 SDK', 'official SDK');
  wipe(w1, tw6 - 0.3, { dir: 'l', d: 0.35 }); appear(w1s, tw6); wipe(w2, tw6 + 0.2, { dir: 'l', d: 0.35 }); appear(w2s, tw6 + 0.5); sfx('tick', tw6 - 0.3); sfx('tick', tw6 + 0.2);

  // ═══ 第三站：一条消息走完全程 ═══（泳道画在右侧一张长图上）
  const CX = 2500, PIT = 640, LO = 360, LH = 700, HD = 150;        // 第 k 步的左缘 = CX + k * PIT
  const t7 = T('m7'), t8 = T('m8'), t9 = T('m9'), t10 = T('m10'), t11 = T('m11'), t12 = T('m12'), t13 = T('m13'), t14 = T('m14'), t15 = T('m15'), t16 = T('m16'), t17 = T('m17');
  const steps = [tr('事件', 'Event'), tr('先收下', 'Accept first'), tr('去重 · 准入', 'Dedupe · admit'), tr('会话键', 'Session key'), tr('循环', 'Loop'), tr('回复', 'Reply'), tr('落盘', 'Persist')];
  const st = [t7 - 0.3, t9 - 0.1, t10 - 0.1, Tw('m10', '会话键', 'session key') - 0.2, t12 - 0.1, t15 - 0.1, t16 - 0.1];
  const laneO = R(g, CX - 200, LO - 4, 7 * PIT + 100, 8, RD), laneH = R(g, CX - 200, LH - 4, 7 * PIT + 100, 8, GD);
  [laneO, laneH].forEach((e, i) => fromTo(e, t7 - 0.6, { scaleX: 0, svgOrigin: `${CX - 200} ${i ? LH : LO}` }, { scaleX: 1, duration: 1.2, ease: 'power2.out' }));
  const nO = tag(world, CX - 200, LO - 86, 'OpenClaw', { bg: RD, c: C.ink, size: 34, cls: 'in9', pad: '6px 16px' }), nH = tag(world, CX - 200, LH - 86, 'Hermes Agent', { bg: GD, c: C.ink, size: 34, cls: 'in9', pad: '6px 16px' }); appear(nO, t7 - 0.4); appear(nH, t7 - 0.3);
  steps.forEach((n, k) => { const e = tag(world, CX + k * PIT, HD, `${k + 1}  ${n}`, { bg: PP, c: C.ink, size: 34, cls: 'hd', pad: '8px 18px' }); wipe(e, st[k], { dir: 'l', d: 0.3 }); sfx('pop', st[k], { g: 0.5 });
    [LO, LH].forEach((y, i) => appear(R(g, CX + k * PIT - 9, y - 9, 18, 18, C.ink, { stroke: i ? GD : RD, 'stroke-width': 5 }), st[k])); });
  // 两个方块沿泳道走：每到一步停一下
  const stops = [[t7, 0], [t9, 1], [t10, 2], [Tw('m10', '会话键', 'session key'), 3], [t12, 4], [t15, 5], [t16, 6]];
  [[LO, RD], [LH, GD]].forEach(([y, c]) => { const pk = packet(g, 30, c); pk.ride(t7 - 0.4, 0.5, [[CX - 190, y], [CX, y]], { hold: stops[1][0] - t7 - 0.2 });
    for (let k = 1; k < stops.length; k++) { const a = stops[k][0] - 0.25, nxt = k + 1 < stops.length ? stops[k + 1][0] - 0.25 : s.end; pk.ride(a, 0.5, [[CX + (k - 1) * PIT, y], [CX + k * PIT, y]], { hold: nxt - a - 0.5 }); } });
  const X = (k) => CX + k * PIT + 30;
  // 1 事件
  has('oc.feishu.register', '"im.message.receive_v1": createFeishuMessageReceiveHandler'); has('hm.feishu.register', 'register_p2_im_message_receive_v1(self._on_message_event)');
  const e0 = Lb(X(0), LO + 30, 'im.message.receive_v1', { cls: 'mono7', size: 30 }), e0s = srcLab(world, X(0), LO + 74, 'oc.feishu.register'), e0b = Lb(X(0), LH + 30, 'register_p2_im_message_receive_v1', { cls: 'mono7', size: 24 }), e0c = srcLab(world, X(0), LH + 68, 'hm.feishu.register');
  appear(e0, Tw('m7', '事件', 'event') - 0.1); appear(e0s, Tw('m7', '事件', 'event') + 0.2); appear(e0b, Tw('m7', '事件', 'event') + 0.1); appear(e0c, Tw('m7', '事件', 'event') + 0.3); sfx('blip', Tw('m7', '事件', 'event'));
  // 三秒：倒计时的圆弧
  const tm = Tw('m8', '三秒', 'three seconds'), TX3 = X(0) + 250, TY3 = 540, arc = Ci(g, TX3, TY3, 46, 'none', { stroke: PP, 'stroke-width': 9, transform: `rotate(-90 ${TX3} ${TY3})` }), arcT = Lb(TX3 - 50, TY3 - 24, '3 s', { cls: 'mono7', size: 36, w: 100, align: 'center' });
  const CL = 2 * Math.PI * 46; arc.style.strokeDasharray = CL.toFixed(1); appear(arc, tm - 0.2); appear(arcT, tm - 0.2);
  F((t) => { arc.style.strokeDashoffset = (CL * clamp((t - tm) / 3)).toFixed(1); });
  if (!D.sdkNotes[0].includes('within 3 seconds')) console.warn('quote mismatch sdkNotes');
  const rep = Lb(X(0) + 330, TY3 - 14, tr('超时会重推（官方 SDK 的说明）', 'a timeout triggers a re-push (SDK note)'), { size: 22, c: C.dimi }); appear(rep, Tw('m8', '重推', 'again') - 0.2); sfx('tick', tm); sfx('tick', tm + 1); sfx('tick', tm + 2);
  // 2 先收下
  has('oc.feishu.durable', 'durably queues authenticated `im.message.receive_v1`'); has('hm.base.handle', 'returns quickly by spawning a background');
  const qd = cyl(g, X(1), LO + 26, 110, 120, RD, { w: 6 }), qdT = Lb(X(1) + 130, LO + 40, tr('写入持久队列', 'into a durable queue'), { cls: 'hd', size: 34, c: RD }), qdS = srcLab(world, X(1) + 130, LO + 90, 'oc.feishu.durable');
  const bgA = arrow(g, X(1), LH + 40, X(1) + 100, LH + 110, GD, 7), bgT = Lb(X(1) + 130, LH + 40, tr('起一个后台任务', 'spawn a background task'), { cls: 'hd', size: 34, c: GD }), bgS = srcLab(world, X(1) + 130, LH + 90, 'hm.base.handle');
  const ta9 = Tw('m9', '持久队列', 'durable queue'), tb9 = Tw('m9', '后台任务', 'background task');
  appear(qd, ta9 - 0.2); appear(qdT, ta9); appear(qdS, ta9 + 0.3); sfx('pop', ta9 - 0.2); appear(bgA, tb9 - 0.2); appear(bgT, tb9); appear(bgS, tb9 + 0.3); sfx('pop', tb9 - 0.2);
  // 3 去重 · 准入
  has('hm.feishu.dedupe', 'deduplicated using message IDs'); has('oc.msg.dedupe', 'does not trigger a second agent run'); has('oc.feishu.dmpolicy', 'dmPolicy ?? "pairing"'); has('hm.gw.deny', 'Default: deny');
  const d1 = Lb(X(2), LO + 30, 'dmPolicy ?? "pairing"', { cls: 'mono7', size: 28, c: RD }), d1s = srcLab(world, X(2), LO + 72, 'oc.feishu.dmpolicy'), d1n = Lb(X(2), LO + 104, tr('陌生人的私聊先配对', 'unknown DM senders pair first'), { size: 24 });
  const d2 = Lb(X(2), LH + 30, tr('白名单 / 配对；默认拒绝', 'allowlist / pairing; deny by default'), { cls: 'hd', size: tr(30, 24), c: GD }), d2s = srcLab(world, X(2), LH + 76, 'hm.gw.deny'), d2n = Lb(X(2), LH + 108, tr('按消息编号去重，保留 24 小时', 'dedupe by message ID, 24-hour TTL'), { size: 24 });
  [d1, d2].forEach((e, i) => appear(e, Tw('m10', '准入', 'admission') - 0.2 + i * 0.15)); [d1s, d1n, d2s, d2n].forEach((e, i) => appear(e, Tw('m10', '准入', 'admission') + 0.1 + i * 0.08)); sfx('tick', Tw('m10', '准入', 'admission') - 0.2);
  // 4 会话键
  const s1 = tag(world, X(3), LO + 30, 'agent:main:main', { bg: RD, c: C.ink, size: 32, cls: 'mono7' }), s1n = Lb(X(3), LO + 92, tr('并入主会话', 'joins the main session'), { cls: 'body', size: 30 });
  const s2 = tag(world, X(3), LH + 30, 'agent:main:feishu:dm:oc_…', { bg: GD, c: C.ink, size: 32, cls: 'mono7' }), s2n = Lb(X(3), LH + 92, tr('这个私聊自己的键', 'this chat\'s own key'), { cls: 'body', size: 30 });
  slam(s1, Tw('m11', '主会话', 'main session') - 0.2, { from: 1.15, d: 0.3 }); appear(s1n, Tw('m11', '主会话', 'main session')); slam(s2, Tw('m11', '自己的键', 'separate key') - 0.2, { from: 1.15, d: 0.3 }); appear(s2n, Tw('m11', '自己的键', 'separate key')); sfx('pop', Tw('m11', '主会话', 'main session') - 0.2); sfx('pop', Tw('m11', '自己的键', 'separate key') - 0.2);
  // 5 循环：提示词 → 模型 → 工具调用 → 结果追加 → 回答
  const RXO = X(4) + 70, r5o = ring(g, RXO, LO + 110, 54, RD, { w: 7, dot: 18, rest: 180 }), r5h = ring(g, RXO, LH + 110, 54, GD, { w: 7, dot: 18, rest: 180 });
  [r5o.grp, r5h.grp].forEach((e) => appear(e, t12)); r5o.spin(t12 + 0.1, t15, 1.6, 180); r5h.spin(t12 + 0.1, t15, 1.6, 180);
  const pm = Lb(X(4) + 150, 524, tr('装配提示词 → 调用模型', 'prompt → model'), { cls: 'body', size: 30 }); wipe(pm, Tw('m12', '装配', 'assemble') - 0.1, { dir: 'l', d: 0.3 });
  has('oc.feishu.doctool', 'name: "feishu_doc"'); has('oc.feishu.doctool', 'Actions: read, write'); has('hm.feishu.docread', '``feishu_doc_read``');
  const tc1 = Lb(X(4) + 150, LO + 76, 'feishu_doc { action: "read" }', { cls: 'mono7', size: 28, c: RD }), tc1s = srcLab(world, X(4) + 150, LO + 118, 'oc.feishu.doctool'), tc2 = Lb(X(4) + 150, LH + 76, 'feishu_doc_read', { cls: 'mono7', size: 28, c: GD }), tc2s = srcLab(world, X(4) + 150, LH + 118, 'hm.feishu.docread');
  const ttc = Tw('m13', '工具调用', 'tool call');
  [tc1, tc2].forEach((e, i) => wipe(e, ttc - 0.2 + i * 0.15, { dir: 'l', d: 0.3 })); [tc1s, tc2s].forEach((e) => appear(e, ttc + 0.3)); sfx('blip', ttc - 0.2);
  const res = Lb(X(4) + 150, 572, tr('结果追加回对话 → 回答', 'result appended → answer'), { cls: 'body', size: 30 }); wipe(res, Tw('m14', '追加', 'appended') - 0.1, { dir: 'l', d: 0.3 }); sfx('tick', Tw('m14', '追加', 'appended'));
  [LO, LH].forEach((y) => appear(Lb(RXO - 90, y - 104, tr('飞书接口', 'Feishu API'), { size: 22, c: C.dimi, w: 180, align: 'center' }), ttc - 0.1));
  [[LO, RD], [LH, GD]].forEach(([y, c]) => [ttc, Tw('m14', '追加', 'appended') + 0.4].forEach((t) => { const pk = packet(g, 18, c); pk.ride(t, 0.4, [[RXO, y + 56], [RXO, y - 60]]); pk.ride(t + 0.45, 0.4, [[RXO, y - 60], [RXO, y + 56]]); }));
  // 6 回复
  has('oc.feishu.streaming', 'streaming replies via interactive cards'); has('hm.feishu.post', 'Feishu **post** message');
  const card = frame(world, X(5), LO + 30, 250, 150, { c: RD, bw: 6, r: 18 }), cl = [0, 1, 2].map((i) => R(g, X(5) + 24, LO + 58 + i * 36, 200, 14, RD));
  const cT = Lb(X(5) + 270, LO + 40, tr('流式卡片', 'streaming card'), { cls: 'hd', size: 34, c: RD }), cS = srcLab(world, X(5), LO + 192, 'oc.feishu.streaming', { short: true });
  const post = frame(world, X(5), LH + 30, 250, 150, { c: GD, bw: 6 }), pl = [0, 1, 2].map((i) => R(g, X(5) + 24, LH + 58 + i * 36, [200, 150, 180][i], 14, GD));
  const pT = Lb(X(5) + 270, LH + 40, tr('富文本 post', 'rich-text post'), { cls: 'hd', size: 34, c: GD }), pN = Lb(X(5) + 270, LH + 92, tr('被拒时退回纯文本', 'falls back to plain text'), { size: 24 }), pS = srcLab(world, X(5) + 270, LH + 130, 'hm.feishu.post', { short: true });
  const tca = Tw('m15', '流式卡片', 'streaming card'), tpo = Tw('m15', '富文本', 'rich text');
  wipe(card, tca - 0.3, { dir: 'l', d: 0.3 }); appear(cT, tca); appear(cS, tca + 0.3); sfx('pop', tca - 0.3);
  F((t) => cl.forEach((r, i) => { const k = clamp((t - (tca - 0.1) - i * 0.5) / 0.9); r.setAttribute('width', (200 * k).toFixed(1)); r.setAttribute('opacity', k > 0 ? 1 : 0); }));
  wipe(post, tpo - 0.3, { dir: 'l', d: 0.3 }); pl.forEach((r) => appear(r, tpo)); appear(pT, tpo); appear(pS, tpo + 0.3); appear(pN, tpo + 0.5); sfx('pop', tpo - 0.3);
  // 7 落盘
  has('oc.release.sqlite', 'moving them into SQLite'); has('hm.session.sqlite', '~/.hermes/state.db');
  [[LO, RD, 'SQLite', 'MEMORY.md'], [LH, GD, 'state.db', 'MEMORY.md']].forEach(([y, c, dbn, fn], i) => {
    const db = cyl(g, X(6), y + 30, 110, 130, c, { w: 6 }), dT = Lb(X(6) - 20, y + 170, dbn, { cls: 'mono7', size: 26, c, w: 150, align: 'center' }), fi = fileIcon(g, X(6) + 170, y + 40, 84, 108, c, { w: 5 }), fT = Lb(X(6) + 130, y + 170, fn, { cls: 'mono7', size: 26, c, w: 170, align: 'center' });
    const ts = Tw('m16', 'SQLite', 'SQLite') - 0.2, tf = Tw('m16', '记忆', 'memory') - 0.1; appear(db, ts); appear(dT, ts + 0.1); appear(fi, tf); appear(fT, tf + 0.1); if (!i) { sfx('pop', ts); sfx('tick', tf); }
  });
  const fkB = frame(world, X(6) + 300, LH + 40, tr(190, 270), 110, { c: GD, bw: 5, dash: true }), fkT = Lb(X(6) + 300, LH + 76, tr('后台回看', 'background review'), { size: 24, c: GD, w: tr(190, 270), align: 'center' }); appear(fkB, Tw('m16', '记忆', 'memory') + 0.4); appear(fkT, Tw('m16', '记忆', 'memory') + 0.5);

  // ═══ 第四站：回到网络图 —— 离开这台机器的只有两类请求 ═══
  [w1, w1s, w2, w2s, lc, note].forEach((e) => vanish(e, t17 - 0.8));
  const mo = frame(world, FX, 760, 440, 130, { c: PP, bw: 6, r: 36 }), moT = Lb(FX, 796, tr('模型接口', 'Model API'), { cls: 'hd', size: tr(46, 36), w: 440, align: 'center' });
  const mP = [[MX, MY + 250], [MX - 110, MY + 250], [MX - 110, 825], [FX + 440, 825]], mW = wire(g, mP, PP, 8);
  const tA = Tw('m17', '发给飞书的', 'to Feishu'), tB = Tw('m17', '发给模型的', 'to the model');
  const o1 = tag(world, 660, 430, tr('① 发给飞书', '1  to Feishu'), { bg: PP, c: C.ink, size: 32, cls: 'hd' }), o2 = tag(world, 660, 760, tr('② 发给模型', '2  to the model'), { bg: PP, c: C.ink, size: 32, cls: 'hd' });
  const loc = Lb(660, 850, tr('用本地模型时，只剩第一类', 'with a local model, only the first remains'), { size: 24, c: C.dimi });
  slam(o1, tA - 0.1, { from: 1.2, d: 0.3 }); sfx('pop', tA - 0.1);
  wipe(mo, tB - 0.5, { dir: 'l', d: 0.35 }); appear(moT, tB - 0.2); drawIn(mW, tB - 0.4, 0.6); slam(o2, tB, { from: 1.2, d: 0.3 }); appear(loc, tB + 0.6); sfx('pop', tB);
  [0, 0.9, 1.8, 2.7].forEach((d, i) => { const a = packet(g, 20, i % 2 ? GD : RD); a.ride(t17 + 0.1 + d, 0.8, [[MX, i % 2 ? yH : yO], [FX + 440, i % 2 ? yH : yO]]); const b = packet(g, 20, PP); b.ride(tB - 0.1 + d * 0.7, 0.8, mP); });

  const pan = (k, y = 545) => ({ x: CX + k * PIT + 330, y, z: 1.12 });
  camTrack(cam, s.start, { x: 1040, y: 540, z: 1.08 }, [
    [c0 - 0.4, { x: 960, y: 540, z: 1 }, 2.8, { ease: 'power2.out', sfx: false }],
    [t2 - 0.2, { x: 980, y: 520, z: 1.04 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t3 - 0.3, { x: 960, y: 580, z: 1.06 }, 1.0, { g: 0.4 }],
    [t3 + 1.2, { x: 980, y: 590, z: 1.1 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [t4 - 0.5, { x: 960, y: 540, z: 1 }, 1.0],
    [t5 - 0.2, { x: 940, y: 540, z: 1.05 }, 4.0, { ease: 'sine.inOut', sfx: false }],
    [t6 - 0.2, { x: 900, y: 620, z: 1.08 }, 3.8, { ease: 'sine.inOut', sfx: false }],
    [t7 - 0.9, pan(0), 1.3],
    [t8, { x: CX + 380, y: 540, z: 1.16 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [st[1] - 0.4, pan(1), 1.0, { g: 0.4 }],
    [st[1] + 1.2, { x: CX + PIT + 370, z: 1.15 }, 2.8, { ease: 'sine.inOut', sfx: false }],
    [st[2] - 0.4, pan(2), 0.9, { g: 0.4 }],
    [st[3] - 0.3, pan(3), 0.9, { g: 0.4 }],
    [st[3] + 1.2, { x: CX + 3 * PIT + 370, z: 1.15 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [st[4] - 0.4, pan(4), 1.0, { g: 0.4 }],
    [t13 - 0.2, { x: CX + 4 * PIT + 390, y: 530, z: 1.16 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t14 - 0.2, { x: CX + 4 * PIT + 360, y: 540, z: 1.12 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [st[5] - 0.4, pan(5), 1.0, { g: 0.4 }],
    [st[5] + 1.3, { x: CX + 5 * PIT + 370, z: 1.15 }, 2.8, { ease: 'sine.inOut', sfx: false }],
    [st[6] - 0.4, pan(6), 1.0, { g: 0.4 }],
    [st[6] + 1.3, { x: CX + 6 * PIT + 360, z: 1.15 }, 2.4, { ease: 'sine.inOut', sfx: false }],
    [t17 - 0.9, { x: 960, y: 560, z: 1 }, 1.4],
    [t17 + 0.9, { x: 950, y: 580, z: 1.04 }, 3.6, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
