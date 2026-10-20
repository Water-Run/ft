// 01 网关型智能体：先画终端里的编程智能体（harness：一个循环加它默认的几个前提），再把前提逐个换掉，得到网关型智能体的结构。
// 本章是概念图解（画面上标「示意」）：平台、会话键与顺序都是一般化的画法，不对应某一个项目；两个项目各自的做法在后面两章给出处。
scene('kind', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'paper');
  const cam = makeCamera(world);
  const g = gfx(world), K = C.ink, P = C.paper;
  const L_ = (x, y, t, o = {}) => lab(world, x, y, t, { c: K, ...o });

  // ═══ 第一站：终端里的编程智能体 ═══
  appear(L_(120, 64, tr('示意', 'Illustration'), { size: 24, c: C.dim }), s.start + 0.6);
  const win = frame(world, 120, 130, 980, 660, { c: K, bw: 6 });
  const bar = h('div', 'abs', world); px(bar, 120, 130, 980, 58); css(bar, { background: K });
  const barT = L_(146, 143, tr('~/project — 终端', '~/project — terminal'), { size: 26, c: P });
  const t1 = T('k1');
  wipe(win, t1 - 0.3, { dir: 'l', d: 0.5 }); wipe(bar, t1 - 0.2, { dir: 'l', d: 0.5 }); appear(barT, t1 + 0.1); sfx('whoosh', t1 - 0.3, { g: 0.5 });
  const ask = L_(160, 728, '', { size: 28, cls: 'mono7' }); typeText(ask, tr('> 修掉这个 bug', '> fix this bug'), t1 + 0.5, tr(5, 7), { cursor: false }); vanish(ask, T('k2') + 1.2);
  // 循环：圆环；左 = 对话，右 = 模型，下 = 工具
  const RX = 740, RY = 470, RR = 170;
  const rg = ring(g, RX, RY, RR, K, { w: 10, dot: 30, rest: 180, idle: false });
  const loopLab = L_(RX - 100, RY - 30, tr('循环', 'loop'), { cls: 'hd', size: 56, w: 200, align: 'center' });
  // 对话：一行一条消息
  const rows = [['user', tr('修掉这个 bug', 'fix this bug')], ['assistant', 'tool_call: read'], ['tool', tr('（文件内容）', '(file contents)')], ['assistant', 'tool_call: bash'], ['tool', tr('（测试输出）', '(test output)')], ['assistant', tr('已修复', 'fixed')]];
  const convH = L_(160, 214, tr('对话', 'Conversation'), { size: 26, c: C.dim });
  const conv = rows.map(([role, txt], i) => { const e = h('div', 'abs mono', world, `<span style="display:inline-block;width:140px;color:${C.dim}">${role}</span>${txt}`); px(e, 150, 262 + i * 58); css(e, { fontSize: '24px', color: K, padding: '6px 12px', width: '396px', boxSizing: 'border-box' }); return e; });
  const toolsH = L_(160, 634, tr('工具清单', 'Tool list'), { size: 26, c: C.dim });
  const tools = ['read', 'edit', 'bash'].map((n, i) => chip(world, 160 + i * 124, 676, n, 'n', 26));
  // 模型：在窗口之外
  const mX = 1420, mY = 330;
  const model = Ci(g, mX, mY, 92, 'none', { stroke: K, 'stroke-width': 8 });
  const modelT = L_(mX - 100, mY - 30, tr('模型', 'Model'), { cls: 'hd', size: 52, w: 200, align: 'center' });
  const wM = wire(g, [[RX + RR, RY], [1180, RY], [1180, mY], [mX - 92, mY]], K, 6);
  const wT = wire(g, [[RX, RY + RR], [RX, 716], [540, 716]], K, 6);
  const wC = wire(g, [[RX - RR, RY], [552, RY]], K, 6);
  const t2 = T('k2');
  appear(rg.grp, t2 - 0.1); fromTo(rg.circ, t2 - 0.1, { scale: 0.6, svgOrigin: `${RX} ${RY}` }, { scale: 1, duration: 0.5, ease: 'back.out(1.8)' }); appear(loopLab, t2 + 0.2); sfx('pop', t2 - 0.1);
  appear(convH, Tw('k2', '对话', 'conversation') - 0.1); wipe(conv[0], Tw('k2', '对话', 'conversation'), { dir: 'l', d: 0.3 }); drawIn(wC, Tw('k2', '对话', 'conversation'), 0.3);
  appear(toolsH, Tw('k2', '工具清单', 'tool list') - 0.05); seq(tools, Tw('k2', '工具清单', 'tool list'), 0.08, (e, t) => { slide(e, t, { y: 14, d: 0.3 }); sfx('tick', t, { g: 0.4 }); });
  const tm = Tw('k2', '发给模型', 'to a model');
  appear(model, tm - 0.3); appear(modelT, tm - 0.2); drawIn(wM, tm - 0.3, 0.4);
  // 圆环上的方块：180°（对话）→ 360°（模型）→ 450°（工具）→ 540°（对话），第二圈较快，最后停在对话一侧
  const tk = Tw('k3', '调用工具', 'requests a tool'), tx_ = Tw('k3', '执行', 'execute it'), ta = Tw('k3', '追加', 'append'), t4 = T('k4'), tF = Tw('k4', '回答', 'answers');
  rg.key([[tm - 0.5, 180], [tm + 0.3, 360], [tk, 360], [tx_ + 0.1, 450], [ta - 0.1, 450], [ta + 0.5, 540], [t4, 540], [t4 + 0.5, 720], [t4 + 0.9, 810], [t4 + 1.3, 900], [tF - 0.6, 900], [tF - 0.1, 1080]]);
  // 往返模型、工具的方块
  const p1 = packet(g, 26, K); p1.ride(tm + 0.3, 0.45, [[RX + RR, RY], [1180, RY], [1180, mY], [mX - 92, mY]]); p1.ride(tm + 0.95, 0.45, [[mX - 92, mY], [1180, mY], [1180, RY], [RX + RR, RY]]); sfx('blip', tm + 0.75, { g: 0.6 });
  drawIn(wT, tx_ - 0.2, 0.3);
  const p2 = packet(g, 26, K); p2.ride(tx_ + 0.1, 0.35, [[RX, RY + RR], [RX, 716], [540, 716]]); p2.ride(tx_ + 0.55, 0.35, [[540, 716], [RX, 716], [RX, RY + RR]]); sfx('tick', tx_ + 0.45);
  wipe(conv[1], tk, { dir: 'l', d: 0.25 }); wipe(conv[2], ta + 0.4, { dir: 'l', d: 0.25 }); sfx('pop', ta + 0.4, { g: 0.5, p: -0.3 });
  wipe(conv[3], t4 + 0.5, { dir: 'l', d: 0.2 }); wipe(conv[4], t4 + 1.3, { dir: 'l', d: 0.2 }); sfx('tick', t4 + 0.5, { g: 0.5 }); sfx('tick', t4 + 1.3, { g: 0.5 });
  const p3 = packet(g, 26, K); p3.ride(t4 + 0.5, 0.2, [[RX + RR, RY], [1180, RY], [1180, mY], [mX - 92, mY]]); p3.ride(t4 + 0.72, 0.2, [[mX - 92, mY], [1180, mY], [1180, RY], [RX + RR, RY]]);
  wipe(conv[5], tF, { dir: 'l', d: 0.3 }); tl.set(conv[5], { background: K, color: P }, tF + 0.3); tl.set(conv[5].firstChild, { color: C.dimi }, tF + 0.3); sfx('thud', tF + 0.3, { g: 0.6 });
  // harness：把窗口里的东西括起来的名字
  const t5 = Tw('k5', 'harness', 'harness');
  const hb = R(g, 120, 812, 980, 10, K), hbL = R(g, 120, 792, 10, 30, K), hbR = R(g, 1090, 792, 10, 30, K);
  const hn = L_(120, 836, 'harness', { cls: 'in9', size: 96 });
  fromTo(hb, t5 - 0.25, { scaleX: 0, svgOrigin: '120 817' }, { scaleX: 1, duration: 0.45, ease: 'power3.out' }); appear(hbL, t5 - 0.25); appear(hbR, t5 + 0.2);
  slam(hn, t5, { from: 1.25, d: 0.4 }); sfx('thud', t5 + 0.1);

  // ═══ 四个前提 ═══
  const AX = 1200, AY = 480, pre = [
    [tr('人在键盘前', 'A person at the keyboard'), Tw('k6', '人在键盘前', 'someone')],
    [tr('输入只来自这个人', 'Input only from that person'), Tw('k6', '输入', 'input')],
    [tr('一个窗口，一段对话', 'One window, one conversation'), Tw('k7', '一个窗口', 'One window')],
    [tr('窗口关闭，进程结束', 'Window closes, process ends'), Tw('k7', '窗口关了', 'close the window')],
  ];
  const preH = L_(AX, AY - 56, tr('它默认的前提', 'What it assumes'), { size: 26, c: C.dim });
  appear(preH, T('k6'));
  const preE = pre.map(([txt, t], i) => {
    const sq = R(g, AX, AY + i * 86 + 10, 30, 30, K), e = L_(AX + 54, AY + i * 86, txt, { cls: 'hd', size: tr(44, 34) });
    appear(sq, t - 0.05); wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t);
    return { sq, e };
  });
  // 窗口关掉：窗口内容收走，圆环停下
  const tX = Tw('k7', '进程也就结束', 'the process ends');
  [win, bar, barT, convH, toolsH, loopLab, ...conv, ...tools].forEach((e) => vanish(e, tX + 0.25)); [wC, wT, wM, rg.grp].forEach((e) => vanish(e, tX + 0.25));
  const gone = frame(world, 120, 130, 980, 660, { c: C.dim, bw: 4, dash: true }); appear(gone, tX + 0.25); sfx('thud', tX + 0.25, { p: -0.3 });
  const goneT = L_(120, 430, tr('进程已结束', 'process exited'), { size: 34, c: C.dim, w: 980, align: 'center' }); appear(goneT, tX + 0.4);

  // ═══ 第二站：网关型智能体 ═══
  const GX = 2300, ly = [330, 520, 710], py = [270, 420, 570, 720];
  appear(L_(GX + 60, 64, tr('示意', 'Illustration'), { size: 24, c: C.dim }), T('k8'));
  const t8 = T('k8');
  // 循环（与上一站同一个圆环）与模型
  const QX = GX + 1470, QY = 520, QR = 120;
  const rg2 = ring(g, QX, QY, QR, K, { w: 10, dot: 26, rest: 180 });
  const loop2 = L_(QX - 100, QY - 26, tr('循环', 'loop'), { cls: 'hd', size: 48, w: 200, align: 'center' });
  const mod2 = Ci(g, QX + 250, QY - 190, 62, 'none', { stroke: K, 'stroke-width': 7 }), mod2T = L_(QX + 190, QY - 212, tr('模型', 'Model'), { cls: 'hd', size: 36, w: 120, align: 'center' });
  const wm2 = wire(g, [[QX + 85, QY - 85], [QX + 206, QY - 146]], K, 6);
  const tl2 = chip(world, QX - 62, QY + 180, tr('工具', 'tools'), 'n', 28), wt2 = wire(g, [[QX, QY + QR], [QX, QY + 180]], K, 6);
  [rg2.grp, loop2, mod2, mod2T, wm2, tl2, wt2].forEach((e) => appear(e, t8 - 0.4));
  rg2.spin(t8, s.end, 2.6, 180);
  // 网关
  const gw = frame(world, GX + 440, 200, 760, 640, { c: K, bw: 8 });
  const gwT = L_(GX + 836, 772, tr('网关', 'Gateway'), { cls: 'hd', size: 46 });
  const toLoop = ly.map((y) => wire(g, [[GX + 1200, y], [GX + 1280, y], [GX + 1280, QY], [QX - QR, QY]], K, 6));
  wipe(gw, Tw('k8', '网关型', 'gateway agent') - 0.1, { dir: 'l', d: 0.5 }); appear(gwT, Tw('k8', '网关型', 'gateway agent') + 0.3); sfx('whoosh', Tw('k8', '网关型', 'gateway agent') - 0.1, { g: 0.5 });
  toLoop.forEach((w) => drawIn(w, Tw('k8', '网关型', 'gateway agent') + 0.4, 0.5));
  [0.9, 1.5, 2.1, 2.7].forEach((d, i) => { const pk = packet(g, 26, K); pk.ride(Tw('k8', '网关型', 'gateway agent') + d, 0.5, [[GX + 1200, ly[i % 3]], [GX + 1280, ly[i % 3]], [GX + 1280, QY], [QX - QR, QY]]); });
  // k9 常驻：服务管理器拉起进程；运行时长的横条不断伸长
  const t9 = T('k9');
  const sm = frame(world, GX + 440, 70, tr(420, 440), 78, { c: K, bw: 5 }), smT = L_(GX + 456, 88, tr('服务管理器 launchd / systemd', 'services: launchd / systemd'), { size: 24 });
  const smA = arrow(g, GX + 650, 148, GX + 650, 196, K, 6);
  wipe(sm, Tw('k9', '服务管理器', 'service manager') - 0.2, { dir: 'l', d: 0.35 }); appear(smT, Tw('k9', '服务管理器', 'service manager')); appear(smA, Tw('k9', '拉起', 'started') - 0.05); sfx('pop', Tw('k9', '拉起', 'started'));
  const upB = R(g, GX + 900, 100, 300, 16, K), upT = L_(GX + 900, 62, '', { size: 24 });
  appear(upT, t9 + 0.1); F((t) => { const k = clamp((t - t9) / (s.end - t9)); upB.setAttribute('width', (20 + 280 * k).toFixed(1)); upB.setAttribute('opacity', t >= t9 ? 1 : 0); const d = Math.floor(lerp(0, 97, k)); const tt = tr(`常驻 · 已运行 ${d} 天`, `long-lived · up ${d} days`); if (upT.textContent !== tt) upT.textContent = tt; });
  // k10 平台与适配器：各家的事件形状不同，过了适配器都成为方块
  const t10 = T('k10'), names = ['A', 'B', 'C', 'D'];
  const plats = py.map((y, i) => { const f = frame(world, GX + 60, y - 44, 220, 88, { c: K, bw: 5, r: 24 }), t = L_(GX + 60, y - 20, tr('聊天平台 ', 'Platform ') + names[i], { size: 26, w: 220, align: 'center' }); return [f, t]; });
  const adps = py.map((y) => R(g, GX + 418, y - 22, 44, 44, P, { stroke: K, 'stroke-width': 7 }));
  const wp = py.map((y) => wire(g, [[GX + 280, y], [GX + 418, y]], K, 5));
  const adT = L_(GX + 330, 790, tr('适配器', 'adapters'), { size: 26, w: 220, align: 'center' });
  plats.forEach(([f, t], i) => { const tt = Tw('k10', '聊天平台', 'chat platforms') - 0.2 + i * 0.09; wipe(f, tt, { dir: 'r', d: 0.3 }); appear(t, tt + 0.2); drawIn(wp[i], tt + 0.2, 0.3); sfx('tick', tt, { g: 0.4 }); });
  seq(adps, Tw('k10', '适配器', 'adapter') - 0.1, 0.08, (e, t) => { fromTo(e, t, { scale: 0, svgOrigin: `${GX + 440} ${+e.getAttribute('y') + 22}` }, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }); sfx('pop', t, { g: 0.45 }); });
  appear(adT, Tw('k10', '适配器', 'adapter') + 0.2);
  // 形状各异的原始事件（三角、圆、菱形、六边形）
  const shapeOf = [(x, y) => `M${x},${y - 17} L${x + 17},${y + 13} L${x - 17},${y + 13} Z`, null, (x, y) => `M${x},${y - 18} L${x + 18},${y} L${x},${y + 18} L${x - 18},${y} Z`, (x, y) => `M${x - 9},${y - 16} L${x + 9},${y - 16} L${x + 18},${y} L${x + 9},${y + 16} L${x - 9},${y + 16} L${x - 18},${y} Z`];
  function raw(i, t0) {
    const y = py[i], e = shapeOf[i] ? Pa(g, shapeOf[i](0, 0), { fill: K }) : Ci(g, 0, 0, 16, K); e.setAttribute('opacity', 0);
    F((t) => { const on = t >= t0 && t < t0 + 0.42; e.setAttribute('opacity', on ? 1 : 0); if (on) e.setAttribute('transform', `translate(${lerp(GX + 290, GX + 420, ease.io3((t - t0) / 0.42)).toFixed(1)} ${y})`); });
  }
  // 一条消息的全程：平台 i → 适配器 → 准入 → 会话键 → 车道 j → 循环。stop：只走到哪里（'in' 适配器之后一小段；'gate' 被准入挡回）
  const GATE = GX + 590, KEYX = GX + 720, LANE0 = GX + 830, LANE1 = GX + 1200;
  function flow(t0, i, j, o = {}) {
    raw(i, t0);
    const pk = packet(g, 26, K, { hollow: o.stop === 'gate' }), y = py[i], t1 = t0 + 0.42;
    if (o.stop === 'in') { pk.ride(t1, 0.35, [[GX + 462, y], [GX + 540, y]], { hold: 0.25 }); return; }
    if (o.stop === 'gate') { pk.ride(t1, 0.4, [[GX + 462, y], [GATE - 22, y]], { hold: 0.25 }); pk.ride(t1 + 0.7, 0.3, [[GATE - 22, y], [GX + 500, y]], { hold: 0.2 }); sfx('thud', t1 + 0.4, { g: 0.5, p: -0.2 }); return; }
    pk.ride(t1, 0.9, [[GX + 462, y], [KEYX, y], [KEYX, ly[j]], [LANE0, ly[j]], [LANE1, ly[j]]]);
    pk.ride(t1 + 0.9, 0.45, [[LANE1, ly[j]], [GX + 1280, ly[j]], [GX + 1280, QY], [QX - QR, QY]]);
  }
  [0, 0.45, 0.9, 1.35].forEach((dt, i) => flow(Tw('k10', '适配器', 'adapter') + 0.5 + dt, [0, 2, 1, 3][i], 0, { stop: 'in' }));
  // k11 会话键与车道
  const t11 = T('k11'), tk11 = Tw('k11', '会话键', 'session key');
  const keyBar = R(g, KEYX - 5, 250, 10, 520, K), keyT = tag(world, KEYX - tr(76, 30), 196, tr('会话键', 'session key'), { bg: K, c: P, size: 26 });
  fromTo(keyBar, tk11 - 0.2, { scaleY: 0, svgOrigin: `${KEYX} 250` }, { scaleY: 1, duration: 0.4, ease: 'power3.out' }); slam(keyT, tk11, { from: 1.2, d: 0.35 }); sfx('pop', tk11);
  const lanes = ly.map((y) => R(g, LANE0, y - 4, LANE1 - LANE0, 8, K));
  const laneT = [tr('私聊 · 甲', 'DM · A'), tr('群聊 · 42', 'group · 42'), tr('私聊 · 乙', 'DM · B')].map((n, i) => L_(LANE0 + 6, ly[i] - 46, n, { size: 24, c: C.dim }));
  const ctxT = L_(LANE0 + 6, 742, tr('每个会话各有上下文', 'one context per session'), { size: 22, c: C.dim });
  const tc = Tw('k11', '上下文', 'context');
  lanes.forEach((r, i) => { fromTo(r, tc - 0.35 + i * 0.1, { scaleX: 0, svgOrigin: `${LANE0} ${ly[i]}` }, { scaleX: 1, duration: 0.4, ease: 'power3.out' }); appear(laneT[i], tc - 0.1 + i * 0.1); }); appear(ctxT, tc + 0.3);
  flow(tk11 + 0.2, 0, 0); flow(tk11 + 0.9, 2, 1); flow(tk11 + 1.7, 3, 2); flow(tk11 + 2.5, 1, 0);
  // k12 准入
  const t12 = T('k12'), tg = Tw('k12', '准入', 'admission');
  const gA = R(g, GATE - 5, 250, 10, 520, K), gT = tag(world, GATE - tr(46, 150), 196, tr('准入', 'admission'), { bg: K, c: P, size: 26 });
  fromTo(gA, tg - 0.2, { scaleY: 0, svgOrigin: `${GATE} 250` }, { scaleY: 1, duration: 0.4, ease: 'power3.out' }); slam(gT, tg, { from: 1.2, d: 0.35 }); sfx('pop', tg);
  flow(Tw('k12', '任何人', 'Anyone') - 0.2, 1, 0, { stop: 'gate' }); flow(tg + 0.5, 3, 2); flow(tg + 1.3, 2, 0, { stop: 'gate' });
  const denyT = L_(GX + 478, 790, tr('空心 = 未放行', 'hollow = not admitted'), { size: 22, c: C.dim }); appear(denyT, Tw('k12', '任何人', 'Anyone') + 0.5); vanish(adT, Tw('k12', '任何人', 'Anyone') + 0.5);
  // k13 定时：没有消息进来，时钟自己放出一个方块
  const t13 = T('k13'), tcl = Tw('k13', '定时任务', 'scheduled job');
  const ck = clock(g, GX + 1040, 258, 30, K, { w: 6 }), ckT = L_(GX + 1084, 240, tr('定时', 'timer'), { size: 24 }), ckW = wire(g, [[GX + 1040, 288], [GX + 1040, ly[1]]], K, 5);
  appear(ck.grp, tcl - 0.2); appear(ckT, tcl); drawIn(ckW, tcl, 0.3); ck.run(tcl, s.end, 1.6); sfx('tick', tcl); sfx('tick', tcl + 0.8); sfx('tick', tcl + 1.6);
  [0.5, 2.1, 3.7, 5.3, 6.9].forEach((dt) => { const pk = packet(g, 26, K); pk.ride(tcl + dt, 0.5, [[GX + 1040, 288], [GX + 1040, ly[1]], [LANE1, ly[1]]]); pk.ride(tcl + dt + 0.5, 0.45, [[LANE1, ly[1]], [GX + 1280, ly[1]], [GX + 1280, QY], [QX - QR, QY]]); });
  flow(t13 + 0.2, 0, 2);
  // k14 循环没有变；网关回答的四个问题
  const t14 = T('k14');
  const same = tag(world, QX - 96, QY - 216, tr('循环没有变', 'loop unchanged'), { bg: K, c: P, size: 28 }); slam(same, Tw('k14', '没有变', 'unchanged'), { from: 1.2, d: 0.35 }); sfx('thud', Tw('k14', '没有变', 'unchanged') + 0.1, { g: 0.6 });
  [denyT, ctxT].forEach((e) => vanish(e, t14 + 0.3));
  const qs = [tr('谁在说话', 'Who is speaking'), tr('哪个会话', 'Which session'), tr('能不能进', 'Allowed in'), tr('何时开始', 'When to start')];
  const qrow = rowOf(world, GX + 440, 860, tr(22, 12)), qe = qs.map((q) => tagIn(qrow, q, { bg: K, c: P, size: tr(30, 24), cls: 'hd', pad: '8px 16px' }));
  seq(qe, Tw('k14', '循环之外', 'outside') - 0.3, 0.22, (e, t) => { wipe(e, t, { dir: 'l', d: 0.25 }); sfx('tick', t); });
  flow(t14 + 0.3, 2, 1); flow(t14 + 1.4, 0, 0); flow(t14 + 2.5, 3, 2);

  camTrack(cam, s.start, { x: 760, y: 500, z: 1.08 }, [
    [t1 - 0.4, { x: 900, y: 520, z: 1 }, 1.6, { ease: 'power2.out', sfx: false }],
    [T('k3'), { x: 860, y: 500, z: 1.1 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [T('k4'), { x: 700, y: 480, z: 1.18 }, 2.6, { ease: 'sine.inOut', sfx: false }],
    [T('k5') - 0.3, { x: 960, y: 540, z: 1 }, 0.9],
    [T('k6') + 0.2, { x: 1010, y: 560, z: 1.04 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [T('k7'), { x: 980, y: 540, z: 1 }, 3.4, { ease: 'sine.inOut', sfx: false }],
    [t8 - 0.5, { x: GX + 960, y: 540, z: 1 }, 1.2],
    [t9, { x: GX + 900, y: 470, z: 1.1 }, 3.0, { ease: 'sine.inOut', sfx: false }],
    [t10 - 0.2, { x: GX + 560, y: 510, z: 1.22 }, 1.0],
    [t11 - 0.2, { x: GX + 860, y: 520, z: 1.2 }, 1.0, { g: 0.4 }],
    [t12 - 0.2, { x: GX + 700, y: 520, z: 1.26 }, 0.9, { g: 0.4 }],
    [t13 - 0.2, { x: GX + 1060, y: 480, z: 1.2 }, 0.9, { g: 0.4 }],
    [t14 - 0.3, { x: GX + 960, y: 540, z: 1 }, 1.0],
    [t14 + 0.9, { z: 1.03 }, 3.4, { ease: 'sine.inOut', sfx: false }],
  ], s.end + 0.4, world);
});
