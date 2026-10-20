// 03 OpenCode v2（中）：实验——工具执行到一半时强杀进程。OpenCode 皮肤。
// 画面上的命令、记录、请求与进程列表都取自实验回显（research/lab/exp_v1、exp_v2，经 tools/gen_data.py 生成 data.js），只截取，不改写。
// 版式：上方一条时间标尺（以工具开始执行为 0 秒）；左面板 opencode 1.0.0，右面板 opencode 2.0.24；最后两边各出 note.txt。
scene('crash', ({ root, s, c0 }) => {
  const { world, g, gt } = stage(root, 'oc');
  const cam = makeCamera(world);
  const E = D_().exp;
  const T2 = (id, zh, en) => T(id, { zh, en });
  const L_ = (p, x, y, parts, o) => ocLine(p, x, y, parts, o);

  // ── 上方：脚本模型与命令；时间标尺 ──
  const top = ocPane(world, 100, 70, 1720, 250, tr('按脚本应答的模型', 'scripted model'));
  const cmd = E.v2.req[2].messages.find((m) => m.calls) || E.v2.req[1].messages.find((m) => m.calls);
  const callCmd = E.v2.req[3].messages.find((m) => m.calls).calls[0].args.command;
  const rule = L_(top.p, 40, 40, [['user → ', C.ocMuted], ['shell: ', C.oc300], [callCmd, C.ocText]], { size: 34 });
  const rule2 = L_(top.p, 40, 100, [[tr('不是真实模型：规则写死在 10_scripted_model.mjs 里', 'not a real model: its rules are fixed in 10_scripted_model.mjs'), C.ocMuted]], { size: 24 });
  wipeP(top.p, c0 + 0.1, { dir: 't', d: 0.3, ease: 'steps(8)' }); sfx('blip', c0 + 0.1, { g: 0.4 });
  appear(rule2, T2('e2', '按脚本', 'scripted'));
  const typed = typeText(rule, `<span style="color:${C.ocMuted}">user → </span><span style="color:${C.oc300}">shell: </span>${esc(callCmd)}`, T2('e2', '命令', 'command'), 26);
  // 时间标尺：0–30 秒，sleep 20 的进度条，第 4 秒处强杀
  const RX = 100 + 40, RW = 1640, RY = 70 + 170, s2x = (v) => RX + v / 30 * RW;
  const ruler = Ln(gt, RX, RY + 40, RX + RW, RY + 40, C.ocBorder, 2);
  const tks = [0, 5, 10, 15, 20, 25, 30].map((v) => { const l = Ln(gt, s2x(v), RY + 32, s2x(v), RY + 48, C.ocBorder, 2); const n = L_(world, s2x(v) - 14, RY + 50, [[v + 's', C.ocMuted]], { size: 24 }); return [l, n]; });
  const sleepBar = R(gt, RX, RY + 24, 0, 12, C.ocPeach);
  const killAt = 4;
  drawH(ruler, T('e3') - 0.3, 0.4); tks.forEach((p, i) => { appear(p[0], T('e3') - 0.2 + i * 0.04); appear(p[1], T('e3') - 0.2 + i * 0.04); });
  const t0bar = T2('e3', '20 秒', '20');
  F((t) => { const k = t < t0bar ? 0 : Math.min(killAt, (t - t0bar) / Math.max(0.6, T2('e4', '强杀', 'killed') - t0bar) * killAt); sleepBar.setAttribute('width', (k / 30 * RW).toFixed(1)); });
  const ghost = R(gt, RX, RY + 24, 20 / 30 * RW, 12, 'none', { stroke: C.ocPeach, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
  appear(ghost, t0bar);
  const killM = Ln(gt, s2x(killAt), RY + 6, s2x(killAt), RY + 60, C.ocRed, 5);
  const killL = L_(world, s2x(killAt) + 12, RY - 4, [['kill -9', C.ocRed]], { size: 26, bold: true });
  appear(killM, T2('e4', '强杀', 'killed')); appear(killL, T2('e4', '强杀', 'killed')); sfx('error', T2('e4', '强杀', 'killed'), { g: 0.8 });

  // 开头：两个面板出来之前，中间是本场的标题（e1 时画面不空）
  const h1 = tx(world, 'ocb', 140, 520, tr('实验：工具执行到一半时强杀进程', 'Experiment: kill the process mid-tool'), { fontSize: '64px', color: C.ocText });
  const h2 = L_(world, 140, 620, [['opencode 1.0.0', C.oc300], ['   vs   ', C.ocMuted], ['opencode 2.0.24', C.ocPeach]], { size: 40, bold: true });
  wipe(h1, c0 + 0.3, { dir: 'l', d: 0.5, ease: 'steps(14)' }); appear(h2, T('e1') + 0.8); sfx('blip', T('e1') + 0.8, { g: 0.4 });
  wipeOut(h1, T('e5') - 0.5, { dir: 'r', d: 0.3 }); wipeOut(h2, T('e5') - 0.5, { dir: 'r', d: 0.3 });
  // ── 两个面板 ──
  const PY = 420, PH = 520;
  const left = ocPane(world, 100, PY, 840, PH, 'opencode 1.0.0'), right = ocPane(world, 980, PY, 840, PH, 'opencode 2.0.24', { border: C.ocPeach, titleC: C.ocPeach });
  wipeP(left.p, T2('e5', 'v1.0.0', 'v1.0.0') - 0.2, { dir: 't', d: 0.3, ease: 'steps(8)' }); wipeP(right.p, T2('e5', 'v2.0.24', 'v2.0.24') - 0.2, { dir: 't', d: 0.3, ease: 'steps(8)' });
  sfx('blip', T2('e5', 'v1.0.0', 'v1.0.0') - 0.2, { g: 0.4 }); sfx('blip', T2('e5', 'v2.0.24', 'v2.0.24') - 0.2, { g: 0.4 });

  // 左：1.0.0 —— 片段 JSON 停在 running；继续时发给模型的请求里没有这次调用
  const part = E.v1.parts_final.find((p) => p.status === 'running');
  const lp = left.p;
  const l1 = L_(lp, 32, 40, [['storage/' + part.file.split('/')[0] + '/…/' + part.file.split('/').pop().slice(0, 18) + '….json', C.ocMuted]], { size: 24 });
  const l2 = L_(lp, 32, 82, [['"tool": ', C.ocMuted], ['"' + part.tool + '"', C.ocText]], { size: 30 });
  const l3 = L_(lp, 32, 126, [['"status": ', C.ocMuted], ['"' + part.status + '"', C.ocText]], { size: 30 });
  const runHL = R(gt, 100 + 32 + 182, PY + 126 + 2, 182, 40, 'none', { stroke: C.ocPeach, 'stroke-width': 3 });
  seq([l1, l2, l3], T('e6') - 0.1, 0.12, (e, t) => appear(e, t));
  appear(runHL, T2('e6', 'running', 'running')); sfx('pop', T2('e6', 'running', 'running'), { g: 0.55 });
  const req1 = E.v1.req[2].messages;
  const rq0 = L_(lp, 32, 196, [[tr('→ 发给模型（继续之后）', '→ sent to the model (after continue)'), C.ocMuted]], { size: 24 });
  const rqEls = req1.map((m, i) => L_(lp, 56, 236 + i * 40, [[m.role.padEnd(8), C.ocMuted], [m.role === 'system' ? '(system prompt)' : m.text.trim(), C.ocText]], { size: 26 }));
  const holeY = PY + 236 + 2 * 40 + 34;
  const hole = R(gt, 100 + 56, holeY, 700, 4, C.ocRed, { 'stroke-dasharray': '' });
  const holeL = L_(lp, 420, 236 + 2 * 40 + 12, [[tr('这里没有那次 bash 调用', 'no bash call here'), C.ocRed]], { size: 24 });
  appear(rq0, T('e7') - 0.1); seq(rqEls, T('e7'), 0.1, (e, t) => appear(e, t));
  wipe(hole, T2('e7', '不见了', 'gone'), { dir: 'l', d: 0.35 }); appear(holeL, T2('e7', '不见了', 'gone') + 0.1); sfx('error', T2('e7', '不见了', 'gone'), { g: 0.45 });
  // 源码：只有 completed 与 error 会转进上下文（v1.0.0 message-v2.ts:578、:608、:630）
  const srcL = [[578, has('oc1_ctx_completed', 'if (part.state.status === "completed") {').trim()], [608, has('oc1_ctx_error', 'if (part.state.status === "error")').trim()], [630, has('oc1_ctx_drop', 'return []').trim()]];
  const sEls = srcL.map(([n, c], i) => L_(lp, 32, 420 + i * 30, [[String(n).padEnd(5), C.ocMuted], [c, i < 2 ? C.oc300 : C.ocPeach]], { size: 24 }));
  seq(sEls, T2('e8', '源码', 'source'), 0.18, (e, t) => { appear(e, t); sfx('tick', t, { g: 0.35 }); });

  // 右：2.0.24 —— 数据库里的行；重启服务后自动接上
  const rp = right.p, rk = E.v2.rows_kill, rf = E.v2.rows_final;
  const hdr = L_(rp, 32, 40, [['seq  type        state', C.ocMuted]], { size: 26 });
  const rowLine = (r) => {
    const st = r.tool ? (r.tool.error ? 'aborted' : r.tool.status) : r.type === 'synthetic' ? tr('重启通知', 'restart notice') : r.type === 'idle' ? r.outcome : (r.text || '').replace(/"/g, '');
    return [[String(r.seq).padStart(3) + '  ', C.oc300], [(r.tool ? r.type + '·' + r.tool.name : r.type).padEnd(16), C.ocText], [st, r.tool && r.tool.error ? C.ocPeach : C.oc300]];
  };
  const rowY = (i) => 80 + i * 42;
  const k4 = L_(rp, 32, rowY(0), rowLine(rk[0]), { size: 26 }), k5 = L_(rp, 32, rowY(1), rowLine(rk[1]), { size: 26 });
  const claim = L_(rp, 32, rowY(2) + 6, [['time_suspended = ', C.ocMuted], [String(E.v2.claim_kill.time_suspended), C.ocPeach], [tr('  执行声明', '  claim'), C.ocMuted]], { size: 24 });
  appear(hdr, T2('e5', 'v2.0.24', 'v2.0.24')); appear(k4, T2('e5', 'v2.0.24', 'v2.0.24') + 0.1); appear(k5, T2('e5', 'v2.0.24', 'v2.0.24') + 0.2); appear(claim, T2('e5', 'v2.0.24', 'v2.0.24') + 0.3);
  const svcStart = L_(rp, 32, rowY(3) + 14, [['$ ', C.ocMuted], ['opencode service start', C.ocText]], { size: 26 });
  typeText(svcStart, `<span style="color:${C.ocMuted}">$ </span>opencode service start`, T('e9') - 0.2, 30);
  // 恢复：序号 5 改为 aborted；新增序号 12 的合成消息；序号 15 再执行一次
  const k5b = L_(rp, 32, rowY(1), rowLine(rf[1]), { size: 26 });
  const err5 = L_(rp, 120, rowY(1) + 34, [[rf[1].tool.error.message, C.ocPeach]], { size: 24 });
  vanish(k5, T2('e10', '中断', 'interrupted')); appear(k5b, T2('e10', '中断', 'interrupted')); appear(err5, T2('e10', '中断', 'interrupted') + 0.1);
  sfx('error', T2('e10', '中断', 'interrupted'), { g: 0.5 });
  to(svcStart, T('e10') - 0.15, { opacity: 0, duration: 0.15 }); to(claim, T('e10') - 0.15, { opacity: 0, duration: 0.15 });
  const k12 = L_(rp, 32, rowY(2) + 26, rowLine(rf[2]), { size: 26 });
  const msg12 = tx(rp, 'oc', 32, rowY(3) + 30, esc('"' + rf[2].text + '"'), { fontSize: '24px', color: C.ocText, whiteSpace: 'normal', width: '770px', lineHeight: '1.35' });
  has('oc2_restart_text', rf[2].text);
  appear(k12, T('e11') - 0.1); wipe(msg12, T2('e11', '服务器', 'server') - 0.1, { dir: 'l', d: 0.6, ease: 'steps(12)' }); sfx('blip', T2('e11', '服务器', 'server'), { g: 0.5 });
  const k15 = L_(rp, 32, rowY(6) + 20, rowLine({ ...rf[3], tool: { ...rf[3].tool, status: 'running' } }), { size: 26 });
  const k15b = L_(rp, 32, rowY(6) + 20, rowLine(rf[3]), { size: 26 });
  appear(k15, T2('e12', '又执行', 'runs it again')); vanish(k15, T('e14') - 0.2); appear(k15b, T('e14') - 0.2); sfx('pop', T2('e12', '又执行', 'runs it again'), { g: 0.5 });

  // ── 下方：被强杀的服务留下的那条命令还在跑（进程列表）；note.txt 两行 ──
  const ps = E.v2.ps_after.find((l) => /sleep 20 &&/.test(l)).trim().split(/\s+/);
  const bot = ocPane(world, 100, 990, 1720, 220, 'ps');
  const psL = L_(bot.p, 32, 40, [[ps[0].padStart(6) + ' ', C.oc300], [ps[1].padStart(6) + '  ', C.ocPeach], [ps.slice(2).join(' '), C.ocText]], { size: 28 });
  const psN = L_(bot.p, 32, 100, [[tr('强杀之后：父进程已变，命令还在跑', 'after the kill: new parent, still running'), C.ocMuted]], { size: 24 });
  wipeP(bot.p, T('e13') - 0.1, { dir: 't', d: 0.3, ease: 'steps(8)' }); appear(psL, T('e13') + 0.15); appear(psN, T2('e13', '还在跑', 'still')); sfx('tick', T('e13') + 0.15, { g: 0.45 });   // 镜头一下来就是进程列表
  const notes = [[100, E.v1.timeline], [980, E.v2.timeline]].map(([x, tl_]) => {
    const i0 = tl_.findIndex((l) => /note\.txt now/.test(l));
    const lines = tl_.slice(i0 + 1).filter((l) => l === 'written');
    const p = ocPane(world, x, 1260, 840, 240, 'note.txt', { border: C.ocPeach });
    const ls = lines.slice(0, 2).map((l, i) => L_(p.p, 40, 50 + i * 56, [[l, C.ocText]], { size: 38, bold: true }));
    const cnt = tx(p.p, 'ocb', 560, 40, String(lines.slice(0, 2).length), { fontSize: '120px', color: C.ocPeach, lineHeight: '1' });
    return { p, ls, cnt };
  });
  notes.forEach((n, i) => { const t = (i ? T2('e14', '最后', 'ends') : T2('e14', '也是两行', 'also two')) - 0.1; wipeP(n.p.p, t, { dir: 't', d: 0.3, ease: 'steps(8)' }); seq(n.ls, t + 0.2, 0.25, (e, tt) => { appear(e, tt); sfx('key', tt, { g: 0.5 }); }); slam(n.cnt, t + 0.75, { from: 1.4 }); sfx('thud', t + 0.75, { g: 0.6 }); });
  // 规范原文与结论
  const q = tx(world, 'oc', 100, 1560, esc(has('oc2_no_exactly_once', 'does not guarantee exactly-once provider or tool behavior')), { fontSize: '40px', color: C.ocText });
  const qs = L_(world, 100, 1624, [['specs/v2/session.md:' + ent('oc2_no_exactly_once').line, C.ocMuted]], { size: 24 });
  wipe(q, T2('e15', '恰好', 'exactly-once') - 0.4, { dir: 'l', d: 0.6, ease: 'steps(16)' }); appear(qs, T2('e15', '恰好', 'exactly-once'));
  const cmp = [[100, 'running', tr('调用从上下文里消失', 'the call vanishes from context')], [980, 'aborted', tr('记下来，如实告诉模型', 'recorded and reported')]].map(([x, a, b]) => {
    const t1 = ocTag(world, x, 1720, a, { size: 32, bg: x > 500 ? C.ocPeach : C.ocMuted });
    const t2 = L_(world, x + 220, 1720, [[b, C.ocText]], { size: 32 });
    return [t1, t2];
  });
  cmp.forEach((p, i) => { const t = T2('e16', i ? '如实' : '记下', i ? 'told' : 'recorded'); appear(p[0], t); wipe(p[1], t + 0.05, { dir: 'l', d: 0.35, ease: 'steps(10)' }); sfx('pop', t, { g: 0.5 }); });

  // ── 压暗：特写一侧面板时，另一侧盖一层底色；镜头往下看时，上方三块一起压暗。透明度由 t 直接算出 ──
  const veil = (x, y, w, h, keys) => { const v = tx(world, 'abs', x - 4, y - 30, '', { width: (w + 8) + 'px', height: (h + 38) + 'px', background: C.ocBg, opacity: 0 }); F((t) => { v.style.opacity = keysAt(keys, t); }); };
  const DIM = 0.72, tL = T('e6') - 0.4, tR = Tend('e8') + 0.1, tD = T('e13') - 0.4;
  veil(980, PY, 840, PH, [[tL, 0], [tL + 0.7, DIM], [tR, DIM], [tR + 0.6, 0], [tD, 0], [tD + 0.7, DIM]]);
  veil(100, PY, 840, PH, [[tR, 0], [tR + 0.7, DIM]]);
  veil(100, 70, 1720, 250, [[tD, 0], [tD + 0.7, DIM]]);
  const tE = T('e15') - 0.55; veil(100, 990, 1720, 220, [[tE, 0], [tE + 0.7, DIM]]);   // 再往下看规范原文时，进程列表也压暗

  // ── 镜头：先看上方与两个面板，再往下看进程与 note.txt，最后看规范原文 ──
  camTrack(cam, s.start, { x: 960, y: 540, z: 1.0 }, [
    [c0 + 0.2, { x: 975, z: 1.02 }, Math.max(1.2, T('e6') - c0 - 0.6), { sfx: false, room: 30 }],
    [T('e6') - 0.4, { x: 520, y: 620, z: 1.32 }, 0.9],
    [null, { x: 540, z: 1.35 }, Math.max(1.2, Tend('e8') - T('e6') - 0.6), { sfx: false, room: 30 }],
    [Tend('e8') + 0.1, { x: 1400, y: 640, z: 1.32 }, 0.9],
    [null, { x: 1380, z: 1.35 }, Math.max(1.2, Tend('e12') - Tend('e8') - 1.0), { sfx: false, room: 30 }],
    [T('e13') - 0.4, { x: 960, y: 1240, z: 1.0 }, 0.9],
    [null, { x: 975, z: 1.03 }, Math.max(1.2, Tend('e14') - T('e13') - 0.6), { sfx: false, room: 30 }],
    [T('e15') - 0.55, { x: 960, y: 1600, z: 1.0 }, 0.9],
    [null, { x: 975, z: 1.03 }, Math.max(1.2, s.end - T('e15') - 1.0), { sfx: false, room: 30 }],
  ], s.end + 0.45);
});
