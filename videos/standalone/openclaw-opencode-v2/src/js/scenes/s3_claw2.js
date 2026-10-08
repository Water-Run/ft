// 02 OpenClaw 2.0（下）：存下来的与放出去的。OpenClaw 皮肤。顶部仍是那条路线细轨，接着往右走。
// 站：F 会话与记录搬进 SQLite → G 会话之间的信号日志 → H 审批 → I 凭据与出网代理 → J 接管别的编程智能体的会话（落到 OpenCode）。
scene('claw2', ({ root, s, c0 }) => {
  const { world, g, gt } = stage(root, 'cl');
  const cam = makeCamera(world);
  const SX = [0, 2000, 4000, 6000, 8000];
  const T2 = (id, zh, en) => T(id, { zh, en });
  const railY = 96;
  const rail = Ln(g, 140, railY, 9800, railY, C.clBorder, 3); appear(rail, c0);
  [[SX[0], tr('存储', 'storage')], [SX[1], tr('信号', 'signals')], [SX[2], tr('审批', 'approval')], [SX[3], tr('凭据', 'credentials')], [SX[4], tr('接管', 'adopt')]].forEach(([x, l], i) => { const d = Ci(g, x + 140, railY, 10, C.clBorder); const p = clPill(world, x + 170, railY - 24, l, 'out', 26); appear(d, c0 + 0.1 + i * 0.08); appear(p, c0 + 0.1 + i * 0.08); });
  const head = (x, t, zh, en) => { const e = tx(world, 'clb', x + 140, 150, tr(zh, en), { fontSize: '64px' }); wipe(e, t, { dir: 'l', d: 0.45 }); return e; };

  // ── F：会话与记录从文件搬进 SQLite（2.0 发布说明 installation-and-onboarding.md:9；database-first.md:16–19、:109）──
  const F0 = SX[0];
  head(F0, c0 + 0.1, '会话与记录：从文件到 SQLite', 'Sessions and transcripts: from files to SQLite');
  const old = clCard(world, F0 + 140, 300, 620, 330, { dash: true, bg: C.clBg });
  const oldT = tx(old, 'clm', 30, 26, tr('2.0 之前', 'before 2.0'), { fontSize: '26px', color: C.clMuted });
  const ofs = ['sessions.json', '<sessionId>.jsonl', '<sessionId>.jsonl', '<sessionId>.jsonl'].map((f, i) => tx(old, 'clm', 30, 84 + i * 56, esc(f), { fontSize: '32px', color: i ? C.clText : C.clStrong }));
  wipe(old, T('c18') - 0.1, { dir: 'l', d: 0.4 }); seq(ofs, T('c18') + 0.1, 0.08, (e, t) => appear(e, t));
  const dbs = [
    ['agents/<agentId>/agent/openclaw-agent.sqlite', tr('每个智能体一个：会话与记录', 'one per agent: sessions and transcripts'), 'data plane', T2('c19', '每个智能体', 'Each agent')],
    ['state/openclaw.sqlite', tr('全局一个：网关自己的状态', 'one global: the gateway\'s own state'), 'control plane', T2('c20', '全局', 'global')],
  ].map(([p_, d_, k_, t], i) => {
    const y = 300 + i * 200, k = clCard(world, F0 + 940, y, 840, 170, { border: i ? C.clBorder : C.clAccent });
    tx(k, 'clm', 30, 24, esc(p_), { fontSize: '27px', color: C.clStrong });
    tx(k, 'cl', 30, 78, d_, { fontSize: '34px', fontWeight: 600, color: C.clText });
    const p = clPill(world, F0 + 940 + 840 - 200, y - 22, k_, i ? 'on' : 'acc', 24);
    wipe(k, t - 0.2, { dir: 'l', d: 0.4 }); appear(p, t + 0.1); sfx('thud', t - 0.2, { g: 0.5 });
    return k;
  });
  const arr = Pa(g, `M${F0 + 770},${465} L${F0 + 925},${385}`, { stroke: C.clAccent, 'stroke-width': 5 });
  const sq = token(g, 40, 26, C.clAccent, { rx: 8 });
  drawH(arr, T2('c18', 'SQLite', 'SQLite') - 0.1, 0.4); sq.ride(T2('c18', 'SQLite', 'SQLite'), 0.6, [[F0 + 770, 465], [F0 + 925, 385]], { hold: 0 });
  const doc = clPill(world, F0 + 140, 660, 'openclaw doctor --fix', 'on', 28);
  const docL = tx(world, 'cl', F0 + 470, 662, tr('旧文件只交给迁移工具', 'old files go to the migration tool'), { fontSize: '32px', fontWeight: 600 });
  appear(doc, T2('c21', '迁移', 'migration')); wipe(docL, T2('c21', '迁移', 'migration') + 0.1, { dir: 'l', d: 0.4 }); sfx('pop', T2('c21', '迁移', 'migration'), { g: 0.5 });
  to(old, T2('c21', '迁移', 'migration') + 0.2, { opacity: 0.45, duration: 0.4 });
  const fq = clQuote(world, F0 + 140, 740, 1640, 'claw_db_runtime', 'Runtime never writes or reads session or transcript JSONL as active state.', { size: 30 });
  wipe(fq, T2('c21', '运行时', 'runtime') - 0.1, { dir: 'l', d: 0.5 });

  // ── G：会话之间的信号日志（v2026.8.1 docs/concepts/session-state.md，2.0 新增的文件；画面上是文档自带的示例）──
  const G0 = SX[1];
  head(G0, T('c21b') - 0.2, '会话之间：谁改了什么', 'Between sessions: who changed what');
  const watcher = clCard(world, G0 + 140, 300, 760, 190);
  tx(watcher, 'clm', 30, 24, 'agent:main:main', { fontSize: '28px', color: C.clStrong }); tx(watcher, 'cl', 30, 74, tr('观察者', 'watcher'), { fontSize: '30px', color: C.clMuted, fontWeight: 600 });
  const target = clCard(world, G0 + 140, 560, 760, 190);
  tx(target, 'clm', 30, 24, 'agent:main:subagent:child', { fontSize: '28px', color: C.clStrong }); tx(target, 'cl', 30, 74, tr('被观察的会话', 'watched session'), { fontSize: '30px', color: C.clMuted, fontWeight: 600 });
  wipe(watcher, T('c21b') + 0.1, { dir: 'l', d: 0.4 }); wipe(target, T('c21b') + 0.25, { dir: 'l', d: 0.4 });
  const human = clBubble(world, G0 + 560, 640, 400, tr('人', 'human'), tr('直接发来一句', 'a direct message'), { size: 28, bg: C.clHover });
  slide(human, T2('c21b', '人', 'human'), { x: 80, d: 0.45 }); sfx('pop', T2('c21b', '人', 'human'), { g: 0.5 });
  const log = clCard(world, G0 + 1000, 300, 780, 450, { bg: C.clCard });
  tx(log, 'clm', 30, 24, 'session_state_events', { fontSize: '26px', color: C.clMuted });
  const js = ent('claw_changes_json').text;
  has('claw_changes_json', '"sequence": 14'); has('claw_changes_json', '"kind": "goal_changed"');
  const lrows = [['14', 'human_direct_message', 'human'], ['19', 'goal_changed', 'human']].map((r, i) => {
    const y = 90 + i * 70;
    const a = tx(log, 'clm', 30, y, r[0].padStart(3), { fontSize: '30px', color: C.clAccent });
    const b = tx(log, 'clm', 110, y, r[1], { fontSize: '30px', color: C.clStrong });
    const c = tx(log, 'clm', 560, y, r[2], { fontSize: '30px', color: C.clMuted });
    return [a, b, c];
  });
  const sv = tx(log, 'clm', 30, 250, 'stateVersion 19', { fontSize: '30px', color: C.clText });
  wipe(log, T('c21c') - 0.2, { dir: 'l', d: 0.4 });
  lrows.forEach((r, i) => { const t = T2('c21c', '信号日志', 'signal log') + i * 0.25; r.forEach((e) => appear(e, t)); sfx('tick', t, { g: 0.45 }); });
  appear(sv, T2('c21c', '序号', 'numbered'));
  const note = clCard(world, G0 + 140, 800, 1640, 104, { border: C.clAccent, bg: C.clElev });
  const nt = tx(note, 'clm', 26, 18, esc(has('claw_notice', 'changed (other actor). Reconcile before acting: session_status sessionKey "agent:main:subagent:child" changesSince 12.')), { fontSize: '24px', color: C.clStrong, whiteSpace: 'normal', width: '1590px', lineHeight: '1.35' });
  const one = clPill(world, G0 + 1560, 772, tr('一条提醒', 'one notice'), 'acc', 26);
  wipe(note, T2('c21d', '提醒', 'notice') - 0.1, { dir: 'l', d: 0.45 }); appear(one, T2('c21d', '提醒', 'notice')); sfx('pop', T2('c21d', '提醒', 'notice'), { g: 0.6 });
  const pull = Pa(g, `M${G0 + 900},${395} C${G0 + 950},${395} ${G0 + 950},${465} ${G0 + 1000},${465}`, { stroke: C.clAccent, 'stroke-width': 4 });
  drawH(pull, T2('c21d', '取回', 'fetches'), 0.4); sfx('whoosh', T2('c21d', '取回', 'fetches'), { g: 0.35 });
  const gsrc = tx(world, 'clm', G0 + 140, 920, esc(srcOf('claw_notice', { ver: true }) + '  · ' + tr('文档示例', 'documentation example')), { fontSize: '24px', color: C.clMuted });
  appear(gsrc, T('c21d') + 0.3);

  // ── H：审批绑定到具体的那一次（2.0 发布说明 security-and-privacy.md:6、:12）──
  const H0 = SX[2];
  head(H0, T('c22') - 0.2, '一次审批，绑定到具体的那一次', 'An approval binds to that one instance');
  const ap = clCard(world, H0 + 140, 280, 980, 560, { bg: C.clCard });
  tx(ap, 'cl', 34, 28, tr('执行审批', 'Exec approval'), { fontSize: '40px', fontWeight: 700, color: C.clStrong });
  const fields = [[tr('请求', 'request'), 'req · 7f3a…'], [tr('命令', 'command'), 'git push origin main'], [tr('会话', 'session'), 'agent:main:main'], [tr('审批人', 'person'), 'owner']];
  const fEls = fields.map(([k, v], i) => {
    const y = 110 + i * 78;
    const a = tx(ap, 'cl', 34, y, k, { fontSize: '30px', color: C.clMuted, fontWeight: 600 });
    const b = tx(ap, 'clm', 230, y, esc(v), { fontSize: '30px', color: C.clStrong });
    return [a, b];
  });
  const okb = clPill(ap, 34, 450, tr('批准', 'Approve'), 'on', 32), nob = clPill(ap, 220, 450, tr('拒绝', 'Deny'), 'out', 32);
  const hnote = tx(world, 'cl', H0 + 140, 860, tr('示意；规则取自 2.0 发布说明', 'schematic; rules from the 2.0 release notes'), { fontSize: '24px', color: C.clMuted });
  wipe(ap, T('c22') + 0.1, { dir: 'b', d: 0.4 }); appear(hnote, T('c22') + 0.4);
  const tF = [T2('c23', '请求', 'request'), T2('c23', '命令', 'command'), T2('c23', '会话', 'session'), T2('c23', '人', 'person')];
  fEls.forEach((p, i) => { p.forEach((e) => wipe(e, tF[i] - 0.1, { dir: 'l', d: 0.3 })); sfx('tick', tF[i] - 0.1, { g: 0.4 }); });
  appear(okb, Tend('c23') - 0.3); appear(nob, Tend('c23') - 0.25);
  const tS = T2('c24', '第一个', 'first');
  to(okb, tS, { backgroundColor: C.clAccent, color: C.clBg, duration: 0.15 }); sfx('pop', tS, { g: 0.7 });
  const settled = clPill(world, H0 + 1180, 340, tr('已了结', 'settled'), 'ok', 34);
  appear(settled, tS + 0.2); sfx('chime', tS + 0.2, { g: 0.5 });
  const dev = clCard(world, H0 + 1180, 460, 360, 300, { bg: C.clElev, r: 28 });
  tx(dev, 'cl', 30, 30, tr('另一台设备', 'another device'), { fontSize: '28px', color: C.clMuted, fontWeight: 600 });
  const late = clPill(dev, 30, 100, tr('重新连接', 'reconnect'), 'out', 28);
  const rej = tx(dev, 'cl', 30, 180, tr('不能复活', 'cannot revive'), { fontSize: '40px', color: C.clAccent, fontWeight: 700 });
  slide(dev, T2('c24', '重连', 'reconnecting') - 0.3, { x: 100, d: 0.45 }); appear(late, T2('c24', '重连', 'reconnecting')); appear(rej, T2('c24', '复活', 'revive')); sfx('error', T2('c24', '复活', 'revive'), { g: 0.5 });
  const hsrc = tx(world, 'clm', H0 + 1180, 790, esc('security-and-privacy.md:' + ent('claw_rel_approvals').line), { fontSize: '24px', color: C.clMuted });
  has('claw_rel_approvals', 'The first valid answer settles it, reconnecting cannot revive a completed request'); has('claw_rel_bound', 'the exact request, command, session, and person');
  appear(hsrc, T('c24') + 0.3);

  // ── I：凭据不进模型可见的文字（v2026.8.1 docs/gateway/secrets.md:320、:350）──
  const I0 = SX[3];
  head(I0, T('c25') - 0.2, '凭据不进模型能看到的文字', 'Credentials stay out of model-visible text');
  const optin = clPill(world, I0 + 146, 250, tr('出网代理：默认关闭，需显式开启', 'egress proxy: off by default, opt in'), 'warn', 28);
  appear(optin, T2('c26', '开启', 'With'));
  const env = clCard(world, I0 + 140, 340, 600, 220);
  tx(env, 'cl', 30, 26, tr('子进程的环境变量', 'subprocess environment'), { fontSize: '28px', color: C.clMuted, fontWeight: 600 });
  const envv = tx(env, 'clm', 30, 90, 'OPENAI_API_KEY=', { fontSize: '30px', color: C.clStrong });
  const sent = tx(env, 'clm', 30, 140, 'oc-sent-v2...end', { fontSize: '34px', color: C.clAccent });
  has('claw_sentinel', '`oc-sent-v2...end` sentinel');
  const px_ = clCard(world, I0 + 840, 340, 360, 220, { bg: C.clElev });
  tx(px_, 'cl', 30, 26, tr('出网代理', 'egress proxy'), { fontSize: '34px', fontWeight: 700, color: C.clStrong });
  tx(px_, 'clm', 30, 90, tr('本机回环', 'loopback'), { fontSize: '26px', color: C.clMuted });
  const hosts = [['api.openai.com', true], ['other.example', false]].map(([hn, ok], i) => {
    const y = 300 + i * 220, k = clCard(world, I0 + 1300, y, 480, 180, { border: ok ? C.clOk : C.clAccent });
    tx(k, 'clm', 26, 22, hn, { fontSize: '30px', color: C.clStrong });
    tx(k, 'cl', 26, 84, ok ? tr('在这里换成真值', 'real value swapped in here') : tr('拒绝：未绑定的主机', 'refused: unbound host'), { fontSize: '30px', fontWeight: 600, color: ok ? C.clOk : C.clAccent });
    return k;
  });
  wipe(env, T('c25') + 0.4, { dir: 'l', d: 0.4 }); appear(envv, T('c25') + 0.7); appear(sent, T2('c26', '哨兵', 'sentinel')); sfx('pop', T2('c26', '哨兵', 'sentinel'), { g: 0.6 });
  wipe(px_, T2('c27', '代理', 'proxy') - 0.2, { dir: 'l', d: 0.4 });
  const req = token(g, 40, 26, C.clAccent, { rx: 8 });
  req.ride(T2('c27', '代理', 'proxy'), 0.6, [[I0 + 740, 450], [I0 + 840, 450]], { hold: 0.3 });
  req.ride(T2('c27', '代理', 'proxy') + 0.9, 0.6, [[I0 + 1200, 450], [I0 + 1300, 390]], { hold: 0.4 });
  wipe(hosts[0], T2('c27', '真值', 'real value') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T2('c27', '真值', 'real value'), { g: 0.45 });
  wipe(hosts[1], T2('c27', '绑定', 'bound') - 0.2, { dir: 'l', d: 0.4 }); sfx('error', T2('c27', '绑定', 'bound'), { g: 0.45 });
  const iq = clQuote(world, I0 + 140, 760, 1640, 'claw_sentinel', 'A request to an unbound host is refused with `Secret "OPENAI_API_KEY" is not allowed for host "<host>".', { size: 26 });
  wipe(iq, Tend('c27') - 0.6, { dir: 'l', d: 0.45 });

  // ── J：接管别的编程智能体的会话（v2026.8.1 docs/concepts/session-state.md:52、:54）──
  const J0 = SX[4];
  head(J0, T('c28') - 0.2, tr('接管别的编程智能体的会话', 'Adopting other coding agents\' sessions'), tr('接管别的编程智能体的会话', 'Adopting other coding agents\' sessions'));
  has('claw_adopt', 'Watched Claude, Codex, OpenCode, and Pi sessions adopted from a session catalog');
  const cat = clCard(world, J0 + 140, 280, 760, 470);
  tx(cat, 'cl', 30, 26, tr('会话目录', 'session catalog'), { fontSize: '30px', color: C.clMuted, fontWeight: 600 });
  const names = ['Claude', 'Codex', 'OpenCode', 'Pi'];
  const nEls = names.map((n, i) => { const e = tx(cat, 'clb', 30, 90 + i * 90, n, { fontSize: '50px', color: n === 'OpenCode' ? C.clStrong : C.clText }); return e; });
  const ocMark = R(gt, J0 + 140 + 380, 280 + 90 + 2 * 90 + 14, 34, 34, C.ocPeach);
  wipe(cat, T('c28') + 0.1, { dir: 'l', d: 0.4 });
  seq(nEls, T2('c28', '编程智能体', 'coding agents'), 0.14, (e, t) => { wipe(e, t, { dir: 'l', d: 0.3 }); sfx('tick', t, { g: 0.35 }); });
  appear(ocMark, T('c28', 'OpenCode')); sfx('pop', T('c28', 'OpenCode'), { g: 0.6 });
  const jq = clQuote(world, J0 + 980, 280, 800, 'claw_oc_provenance', "OpenCode's v1 tables do not preserve message provenance, so reporting ambiguous rows would create false alarms; per-message provenance exists only in its v2 schema.", { size: 30, html: (s_) => s_.replace('only in its v2 schema', '<span class="hl-c">only in its v2 schema</span>') });
  wipe(jq, T('c29') - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', T('c29') - 0.1, { g: 0.3 });

  // ── 镜头 ──
  camTrack(cam, s.start, { x: SX[0] + 960, y: 520, z: 1.0 }, [
    [c0 + 0.2, { x: SX[0] + 980, z: 1.03 }, Math.max(1.2, Tend('c21') - c0 - 0.5), { sfx: false }],
    [Tend('c21') + 0.1, { x: SX[1] + 960, y: 540, z: 1.0 }, 1.0],
    [null, { x: SX[1] + 980, z: 1.03 }, Math.max(1.2, Tend('c21d') - Tend('c21') - 1.2), { sfx: false }],
    [Tend('c21d') + 0.15, { x: SX[2] + 960, y: 540, z: 1.0 }, 1.0],
    [null, { x: SX[2] + 980, z: 1.03 }, Math.max(1.2, Tend('c24') - Tend('c21d') - 1.2), { sfx: false }],
    [Tend('c24') + 0.15, { x: SX[3] + 960, y: 540, z: 1.0 }, 1.0],
    [null, { x: SX[3] + 980, z: 1.03 }, Math.max(1.2, Tend('c27') - Tend('c24') - 1.2), { sfx: false }],
    [Tend('c27') + 0.15, { x: SX[4] + 960, y: 540, z: 1.0 }, 1.0],
    [null, { x: SX[4] + 980, z: 1.03 }, Math.max(1.2, Tend('c30') - Tend('c27') - 1.2), { sfx: false }],
    [Tend('c30') - 0.2, { x: J0 + 490, y: 500, z: 2.0 }, Math.max(0.6, s.end - Tend('c30') + 0.25), { g: 0.6 }],
  ], s.end + 0.45);
});
