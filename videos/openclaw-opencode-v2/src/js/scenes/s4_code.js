// 03 OpenCode v2（上）：一个后台服务，一本会话记录。OpenCode 皮肤（照其 v2 终端主题）。
// 一块大终端屏上的几个面板，镜头在面板之间移动：P1 版本 → P2 分层 → P3 后台服务与事件队列 → P4 会话的记账方式 → P5 重试。
scene('code', ({ root, s, c0 }) => {
  const { world, g, gt } = stage(root, 'oc');
  const cam = makeCamera(world);
  const E = D_(), M2 = E.meta;
  const T2 = (id, zh, en) => T(id, { zh, en });
  const PX = [0, 2000, 4000, 6000, 8000];
  const pane = (x, title, t, o = {}) => { const p = ocPane(world, x + (o.x || 100), o.y || 100, o.w || 1720, o.h || 820, title); wipeP(p.p, t, { dir: 't', d: 0.35, ease: 'steps(10)' }); sfx('blip', t, { g: 0.35 }); return p; };
  const L_ = (p, x, y, parts, o) => ocLine(p, x, y, parts, o);

  // ── P1：版本（git 标签与提交日期，GitHub API 2026-10-08）──
  const p1 = pane(PX[0], 'git tag --list "v2.*"', c0 + 0.1);
  const tags = M2.opencode_v2_tags.slice().reverse();
  const tEls = tags.map((tg, i) => L_(p1.p, 60 + Math.floor(i / 13) * 300, 60 + (i % 13) * 52, [[tg, i === 0 || i === tags.length - 1 ? C.ocText : C.oc300]], { size: 32 }));
  seq(tEls, T('d1') - 0.2, Math.min(0.06, 1.6 / tags.length), (e, t) => appear(e, t));
  for (let i = 0; i < 6; i++) sfx('key', T('d1') - 0.2 + i * 0.25, { g: 0.3 });
  const v0 = M2.opencode_tag_commits['v2.0.0'], v24 = M2.opencode_tag_commits['v2.0.24'], v118 = M2.opencode_tag_commits['v1.18.35'];
  const d0 = L_(p1.p, 760, 60, [['v2.0.0  ', C.ocText], [v0.date.slice(0, 10), C.ocPeach]], { size: 40, bold: true });
  const d24 = L_(p1.p, 760, 130, [['v2.0.24 ', C.ocText], [v24.date.slice(0, 10), C.oc300]], { size: 40, bold: true });
  const d118 = L_(p1.p, 760, 250, [['v1.18.35 ', C.ocMuted], [v118.date.slice(0, 10), C.ocMuted], [tr('  v1 仍在发布', '  v1 still shipping'), C.ocMuted]], { size: 32 });
  const big2 = tx(p1.p, 'ocb', 760, 380, '25', { fontSize: '200px', color: C.ocPeach, lineHeight: '1' });
  const big2l = L_(p1.p, 1080, 470, [[tr('个 v2 标签', 'v2 tags'), C.oc300]], { size: 36 });
  const d1src = L_(p1.p, 760, 640, [[tr('来源：GitHub API，提交日期（UTC），2026-10-08 读取', 'source: GitHub API commit dates (UTC), read 2026-10-08'), C.ocMuted]], { size: 24 });
  appear(d0, T2('d1', '9 月', 'September')); sfx('pop', T2('d1', '9 月', 'September'), { g: 0.5 });
  appear(d24, T('d2', '2.0.24')); appear(big2, T('d2', '2.0.24') + 0.1); appear(big2l, T('d2', '2.0.24') + 0.2); sfx('thud', T('d2', '2.0.24') + 0.1, { g: 0.6 });
  appear(d118, T2('d2', 'v1', 'v1')); appear(d1src, T2('d2', 'v1', 'v1') + 0.2);

  // ── P2：分层（v1.18.35 还有 packages/opencode；v2.0.24 没有。依赖方向：v2.0.24 AGENTS.md:2）──
  const p2 = pane(PX[1], 'packages/', T('d3') - 0.4);
  const oldPkg = L_(p2.p, 60, 60, [['opencode/', C.oc300], ['   v1.18.35 → v2.0.24', C.ocMuted]], { size: 36 });
  const strike = R(gt, PX[1] + 100 + 60, 100 + 60 + 26, 230, 4, C.ocRed);
  appear(oldPkg, T('d3') - 0.1); wipe(strike, T2('d3', '删掉', 'deleted'), { dir: 'l', d: 0.3, ease: 'steps(6)' }); sfx('error', T2('d3', '删掉', 'deleted'), { g: 0.5 });
  // 五个盒子：schema → core / protocol → server；client 由接口生成
  const boxes = {
    schema: [160, 330, 'schema', tr('数据的形状', 'shapes')],
    core: [620, 230, 'core', tr('执行与存储', 'execution + storage')],
    protocol: [620, 470, 'protocol', tr('接口定义', 'API definitions')],
    server: [1080, 330, 'server', tr('对外服务', 'serves it')],
    client: [1080, 600, 'client', tr('由接口生成', 'generated')],
  };
  const bEls = {};
  for (const [k, [x, y, n, d_]] of Object.entries(boxes)) {
    const b = ocPane(p2.p, x, y, 400, 150, '', { border: k === 'client' ? C.ocPeach : C.ocBorder });
    L_(b.p, 28, 22, [[n, C.ocText]], { size: 40, bold: true }); L_(b.p, 28, 86, [[d_, C.ocMuted]], { size: 26 });
    bEls[k] = b.p;
  }
  const ar = (a, b, c = C.ocMuted) => { const [x1, y1] = [PX[1] + 100 + boxes[a][0] + 400, 100 + boxes[a][1] + 75], [x2, y2] = [PX[1] + 100 + boxes[b][0], 100 + boxes[b][1] + 75]; return Pa(gt, `M${x1},${y1} L${(x1 + x2) / 2},${y1} L${(x1 + x2) / 2},${y2} L${x2 - 6},${y2}`, { stroke: c, 'stroke-width': 3 }); };
  const arrows = [ar('schema', 'core'), ar('schema', 'protocol'), ar('core', 'server'), ar('protocol', 'server'), ar('protocol', 'client', C.ocPeach)];
  const tL = [T('d4', 'Schema'), T('d4', 'Core'), T('d5', 'Protocol'), T('d5', 'Server'), T2('d5', '客户端', 'clients')];
  ['schema', 'core', 'protocol', 'server', 'client'].forEach((k, i) => { wipe(bEls[k], tL[i] - 0.15, { dir: 't', d: 0.3, ease: 'steps(8)' }); sfx('tick', tL[i] - 0.15, { g: 0.4 }); });
  drawH(arrows[0], tL[1] - 0.2, 0.3); drawH(arrows[1], tL[2] - 0.2, 0.3); drawH(arrows[2], tL[3] - 0.2, 0.3); drawH(arrows[3], tL[3] - 0.1, 0.3); drawH(arrows[4], tL[4] - 0.2, 0.3);
  const p2src = L_(p2.p, 60, 760, [['AGENTS.md:' + ent('oc2_layers').line + '  ' + tr('依赖方向：Schema → Core / Protocol → Server', 'dependency direction: Schema → Core / Protocol → Server'), C.ocMuted]], { size: 24 });
  has('oc2_layers', 'Keep runtime dependencies directed from Schema to Core and Protocol, then from Core and Protocol to Server'); has('oc2_generate', 'Do not edit generated client files directly');
  appear(p2src, tL[4] + 0.3);

  // ── P3：一个后台服务；事件只编码一次，每个连接一条队列（v2.0.24 cli/index.mdx:48；specs/v2/event-stream-architecture.md）──
  const p3 = pane(PX[2], tr('后台服务', 'background service'), T('d6') - 0.4);
  const svcLine = E.exp.v2.ps_before.find((l) => /serve --service/.test(l)).trim().split(/\s+/).slice(2).join(' ').replace('/home/user/tools/oc2', 'opencode');
  const svc = ocPane(p3.p, 620, 70, 480, 170, '', { border: C.ocPeach });
  L_(svc.p, 30, 24, [['opencode', C.ocText]], { size: 40, bold: true }); L_(svc.p, 30, 90, [[svcLine.replace('opencode ', ''), C.ocPeach]], { size: 30 });
  const svcN = L_(p3.p, 620, 254, [[tr('实测进程（命名空间实验）', 'observed process (sandbox run)'), C.ocMuted]], { size: 24 });
  const tSv = Math.min(T2('d6', '后台服务', 'background'), T('d6') + 0.6);   // 面板一出就有内容
  wipe(svc.p, tSv, { dir: 't', d: 0.3, ease: 'steps(8)' }); appear(svcN, tSv + 0.2); sfx('thud', tSv, { g: 0.5 });
  const clis = [[tr('终端', 'terminal'), 60], [tr('桌面', 'desktop'), 620], [tr('网页', 'web'), 1180]].map(([n, x], i) => {
    const b = ocPane(p3.p, x, 380, 420, 110, '');
    L_(b.p, 30, 30, [[n, C.ocText]], { size: 36, bold: true });
    const ln = Pa(gt, `M${PX[2] + 100 + x + 210},${100 + 380} L${PX[2] + 100 + 860},${100 + 240}`, { stroke: C.ocMuted, 'stroke-width': 3 });
    return { b, ln };
  });
  const tC = [T2('d7', '终端', 'Terminal'), T2('d7', '桌面', 'desktop'), T2('d7', '网页', 'web')];
  clis.forEach((c, i) => { wipe(c.b.p, tC[i] - 0.15, { dir: 't', d: 0.25, ease: 'steps(6)' }); drawH(c.ln, tC[i], 0.3); sfx('tick', tC[i], { g: 0.4 }); });
  const owns = L_(p3.p, 60, 530, [[tr('会话 · 权限 · 工具执行 → 都归它', 'sessions · permissions · tool execution → all owned by it'), C.oc300]], { size: 30 });
  appear(owns, T2('d7', '归它', 'owns'));
  // 事件流：编码一次 → 每个连接一条队列（上限 4,096）；慢的那个超限断开
  const enc = ocTag(p3.p, 60, 610, tr('编码一次', 'encode once'), { size: 30 });
  const qs = [0, 1, 2].map((i) => { const y = 600 + i * 50, bar = R(gt, PX[2] + 100 + 400, 100 + y + 8, 10, 26, C.oc300); const lab = L_(p3.p, 1180, y, [['queue ' + (i + 1) + '  ≤ 4,096', C.ocMuted]], { size: 26 }); return { bar, lab }; });
  appear(enc, T2('d7b', '编码', 'encoded'));
  qs.forEach((q, i) => { appear(q.bar, T2('d7b', '队列', 'queue') + i * 0.1); appear(q.lab, T2('d7b', '队列', 'queue') + i * 0.1); sfx('tick', T2('d7b', '队列', 'queue') + i * 0.1, { g: 0.3 }); });
  // 队列长度：前两条维持在低位，第三条（慢的那个）一路涨到上限后断开
  F((t) => {
    const k0 = T2('d7b', '队列', 'queue');
    qs.forEach((q, i) => {
      const len = i < 2 ? 60 + 30 * Math.abs(Math.sin((t - k0) * (2 + i))) : clamp((t - k0) / Math.max(0.5, T2('d7c', '慢', 'slow') + 0.6 - k0)) * 640;
      q.bar.setAttribute('width', Math.max(10, len).toFixed(1));
      q.bar.setAttribute('fill', i === 2 && t > T2('d7c', '断开', 'cut off') ? C.ocRed : C.oc300);
    });
  });
  const cut = L_(p3.p, 400, 752, [[tr('超限 → 只断开这一个', 'overflow → only this one is dropped'), C.ocRed]], { size: 26 });
  appear(cut, T2('d7c', '断开', 'cut off')); sfx('error', T2('d7c', '断开', 'cut off'), { g: 0.5 });
  has('oc2_feed_cap', 'capacity 4,096'); has('oc2_feed_law', 'Exceeding it terminates only that connection');

  // 规范里的测量（v2.0.24 specs/v2/event-stream-architecture.md:203–209，Apple Silicon、Bun 1.3.14）——单独一个面板
  const p3b = ocPane(world, PX[2] + 100, 1060, 1720, 600, tr('编码耗时的中位数（规范里的测量）', 'median encoding time (measured in the spec)'));
  const bench = ent('oc2_bench').text.split('\n').slice(2).map((l) => l.split('|').map((x) => x.trim()).filter(Boolean));
  has('oc2_bench', '553.928 ms'); has('oc2_bench', '12.389 ms');
  const bRows = bench.map((r, i) => {
    const y = 70 + i * 140, cur = parseFloat(r[1]), sh = parseFloat(r[2]);
    const lab = L_(p3b.p, 60, y + 10, [[r[0].padStart(2) + tr(' 个客户端', r[0] === '1' ? ' client' : ' clients'), C.oc300]], { size: 30 });
    const b1 = R(gt, PX[2] + 100 + 360, 1060 + y + 6, Math.max(4, cur / 553.928 * 1000), 26, C.ocMuted);
    const b2 = R(gt, PX[2] + 100 + 360, 1060 + y + 44, Math.max(4, sh / 553.928 * 1000), 26, C.ocPeach);
    const v1 = L_(p3b.p, 360 + Math.max(4, cur / 553.928 * 1000) + 20, y, [[r[1], C.ocMuted]], { size: 26 });
    const v2 = L_(p3b.p, 360 + Math.max(4, sh / 553.928 * 1000) + 20, y + 38, [[r[2], C.ocPeach]], { size: 26 });
    return { lab, b1, b2, v1, v2 };
  });
  const leg = L_(p3b.p, 60, 500, [['▬ ', C.ocMuted], [tr('每个连接各编一次', 'encoded per connection'), C.ocMuted], ['    ▬ ', C.ocPeach], [tr('编码一次、共享', 'encoded once, shared'), C.ocPeach], ['   · Apple Silicon · Bun 1.3.14', C.ocMuted]], { size: 24 });
  const tB = T2('d7d', '50', '50');
  wipeP(p3b.p, Math.min(tB - 0.5, T('d7d') - 0.3), { dir: 't', d: 0.35, ease: 'steps(10)' });   // 镜头一往下移就出面板，免得落到空处
  bRows.forEach((r, i) => { const t = tB - 0.3 + i * 0.15; appear(r.lab, t); wipe(r.b1, t, { dir: 'l', d: 0.4 }); appear(r.v1, t + 0.3); });
  bRows.forEach((r, i) => { const t = T2('d7e', '12', '12') - 0.4 + i * 0.12; wipe(r.b2, t, { dir: 'l', d: 0.3 }); appear(r.v2, t + 0.2); });
  appear(leg, tB); sfx('thud', T2('d7e', '12', '12'), { g: 0.6 });

  // ── P4：会话的记账方式（表名取自实验里的数据库；规范 specs/v2/session.md:7、:18、:72、:74）──
  const p4 = pane(PX[3], 'opencode.db', T('d8') - 0.5);
  const tabs = E.exp.v2.tables.filter((n) => /^(event|event_sequence|session_inbox|session_message|session_pending|session_v2)$/.test(n));
  const tabEls = tabs.map((n, i) => L_(p4.p, 60, 60 + i * 46, [[n, n === 'session_message' || n === 'event_sequence' ? C.ocText : C.ocMuted]], { size: 30 }));
  seq(tabEls, T('d8') - 0.2, 0.06, (e, t) => appear(e, t));
  // 一次变化 = 一个带序号的事件，同一个事务里写进表
  const evb = ocPane(p4.p, 520, 60, 560, 140, '', { border: C.ocPeach });
  L_(evb.p, 28, 20, [['event  ', C.ocMuted], ['seq ', C.ocMuted], ['5', C.ocPeach]], { size: 34, bold: true });
  L_(evb.p, 28, 76, [['assistant · tool call', C.oc300]], { size: 28 });
  const txn = Pa(gt, `M${PX[3] + 100 + 1120},${100 + 60} L${PX[3] + 100 + 1150},${100 + 60} L${PX[3] + 100 + 1150},${100 + 330} L${PX[3] + 100 + 1120},${100 + 330}`, { stroke: C.ocPeach, 'stroke-width': 3 });
  const txnL = L_(p4.p, 1170, 176, [[tr('同一个事务', 'one transaction'), C.ocPeach]], { size: 26 });
  const proj = L_(p4.p, 520, 250, [['→ session_message  ', C.oc300], ['seq 5', C.ocText]], { size: 30 });
  const proj2 = L_(p4.p, 520, 296, [['→ event_sequence   ', C.oc300], ['5', C.ocText]], { size: 30 });
  wipe(evb.p, T2('d8', '事件', 'event'), { dir: 'l', d: 0.3, ease: 'steps(8)' }); sfx('pop', T2('d8', '事件', 'event'), { g: 0.5 });
  appear(proj, T2('d9', '写进表', 'tables')); appear(proj2, T2('d9', '写进表', 'tables') + 0.1); drawH(txn, T2('d9', '事务', 'transaction') - 0.1, 0.4); appear(txnL, T2('d9', '事务', 'transaction')); sfx('tick', T2('d9', '事务', 'transaction'), { g: 0.4 });
  // 收件箱：先进 session_inbox，在安全的步边界投递
  const inbox = ocPane(p4.p, 60, 420, 520, 150, 'session_inbox');
  const inMsg = L_(inbox.p, 28, 50, [['user  ', C.ocMuted], ['"Write a note."', C.ocText]], { size: 28 });
  const steer = ocTag(p4.p, 620, 470, 'steer', { size: 26 });
  const bnd = L_(p4.p, 770, 470, [[tr('→ 下一个安全的步边界', '→ next safe step boundary'), C.oc300]], { size: 28 });
  wipeP(inbox.p, T2('d10', '收件箱', 'inbox') - 0.2, { dir: 't', d: 0.3, ease: 'steps(8)' }); appear(inMsg, T2('d10', '收件箱', 'inbox')); sfx('blip', T2('d10', '收件箱', 'inbox'), { g: 0.45 });
  appear(steer, T2('d10', '默认', 'default')); appear(bnd, T2('d10', '步边界', 'boundary'));
  // 每一步前重读历史
  const step = ocPane(p4.p, 1180, 420, 420, 150, 'step');
  L_(step.p, 28, 50, [[tr('先读历史', 'reload history'), C.ocText]], { size: 30 });
  const rd = Pa(gt, `M${PX[3] + 100 + 1390},${100 + 418} L${PX[3] + 100 + 1390},${100 + 330}`, { stroke: C.ocPeach, 'stroke-width': 3 });
  wipeP(step.p, T('d11') - 0.1, { dir: 't', d: 0.3, ease: 'steps(8)' }); drawH(rd, T2('d11', '读出', 'reloaded'), 0.3); sfx('tick', T2('d11', '读出', 'reloaded'), { g: 0.4 });
  // 工具调用先落库，再执行（实验数据：created 与 ran 两个时刻）
  const tool = E.exp.v2.rows_kill.find((r) => r.tool).tool;
  const tc = L_(p4.p, 60, 640, [['tool ' + tool.name + '  ', C.ocText], ['created ', C.ocMuted], [String(tool.created), C.ocPeach]], { size: 30 });
  const tr_ = L_(p4.p, 60, 690, [['           ', C.ocMuted], ['ran     ', C.ocMuted], [String(tool.ran), C.oc300], ['  (+' + (tool.ran - tool.created) + ' ms)', C.ocMuted]], { size: 30 });
  const tcL = L_(p4.p, 1020, 660, [[tr('先落库，再产生副作用', 'stored first, then side effects'), C.ocPeach]], { size: 30 });
  appear(tc, T2('d12', '工具调用', 'tool call')); appear(tr_, T2('d12', '副作用', 'side effects')); appear(tcL, T2('d12', '落库', 'stored') + 0.1);
  sfx('blip', T2('d12', '工具调用', 'tool call'), { g: 0.45 }); sfx('pop', T2('d12', '落库', 'stored') + 0.1, { g: 0.5 });
  has('oc2_durable_call', 'Each complete local tool call is durable before side effects begin.');

  // ── P5：重试的边界（specs/v2/session.md:84）──
  const p5 = pane(PX[4], tr('重试', 'retry'), T('d13') - 0.4);
  const cls_ = [tr('限流', 'rate limit'), tr('服务端故障', 'provider internal'), tr('传输失败（未发出 / 不知是否送达）', 'transport (unsent / unknown delivery)'), tr('不完整的流', 'incomplete stream')];
  const cEls = cls_.map((c, i) => L_(p5.p, 60, 60 + i * 56, [['• ', C.ocPeach], [c, C.ocText]], { size: 32 }));
  seq(cEls, Math.min(T('d13') + 0.2, T2('d13', '限流', 'rate')), 0.25, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.35 }); });
  // 1 次请求 + 至多 4 次重试；间隔按指数增长（示意，带随机抖动）
  const ax = Ln(gt, PX[4] + 160, 100 + 520, PX[4] + 1760, 100 + 520, C.ocBorder, 2);
  const xs = [0, 1.1, 3.2, 7.6, 16.4], k_ = 1500 / 17;
  const dots = xs.map((v, i) => { const d = R(gt, PX[4] + 160 + v * k_ - 14, 100 + 520 - 14, 28, 28, i ? C.ocPeach : C.ocText); const l = L_(p5.p, 60 + v * k_ - 20, 460, [[i ? '#' + i : tr('请求', 'req'), C.oc300]], { size: 24 }); return { d, l }; });
  drawH(ax, T('d14') - 0.3, 0.4);
  dots.forEach((o, i) => { const t = T2('d14', '四次', 'four') - 0.5 + i * 0.22; appear(o.d, t); appear(o.l, t); sfx('tick', t, { g: 0.35 }); });
  const jit = L_(p5.p, 60, 590, [[tr('间隔按指数增长，带随机抖动（示意）', 'exponential backoff with jitter (schematic)'), C.ocMuted]], { size: 26 });
  const p5src = L_(p5.p, 60, 640, [['specs/v2/session.md:' + ent('oc2_retry').line, C.ocMuted]], { size: 24 });
  has('oc2_retry', 'The initial request plus at most four retries use jittered exponential backoff');
  appear(jit, T2('d14', '抖动', 'jittered')); appear(p5src, T2('d14', '抖动', 'jittered') + 0.2);

  // ── 镜头 ──
  camTrack(cam, s.start, { x: PX[0] + 960, y: 510, z: 1.0 }, [
    [c0 + 0.2, { x: PX[0] + 980, z: 1.03 }, Math.max(1.2, Tend('d2') - c0 - 0.5), { sfx: false, room: 30 }],
    [T('d3') - 0.55, { x: PX[1] + 960, y: 510, z: 1.0 }, 0.9],
    [null, { x: PX[1] + 980, z: 1.03 }, Math.max(1.2, Tend('d5') - T('d3') - 0.6), { sfx: false, room: 30 }],
    [T('d6') - 0.55, { x: PX[2] + 960, y: 510, z: 1.0 }, 0.9],
    [null, { x: PX[2] + 980, z: 1.03 }, Math.max(1.2, T('d7d') - T('d6') - 1.2), { sfx: false, room: 30 }],
    [T('d7d') - 0.6, { x: PX[2] + 960, y: 1475, z: 1.0 }, 0.8],
    [null, { x: PX[2] + 975, z: 1.02 }, Math.max(1.2, Tend('d7e') - T('d7d') - 0.4), { sfx: false, room: 30 }],
    [T('d8') - 0.55, { x: PX[3] + 960, y: 510, z: 1.0 }, 0.9],
    [null, { x: PX[3] + 980, z: 1.03 }, Math.max(1.2, Tend('d12') - T('d8') - 0.6), { sfx: false, room: 30 }],
    [T('d13') - 0.55, { x: PX[4] + 960, y: 510, z: 1.0 }, 0.9],
    [null, { x: PX[4] + 980, z: 1.03 }, Math.max(1.2, s.end - T('d13') - 1.0), { sfx: false, room: 30 }],
  ], s.end + 0.45);
});
