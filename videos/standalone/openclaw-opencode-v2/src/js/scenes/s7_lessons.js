// 04 学到了什么。中性皮肤：六行记录（0401–0406），每行下面是两条证据，各带项目的颜色块，内容都回指前面讲过、有出处的事实。
// 最后一站：一年前的循环（第 01 章那个圆环）放回画面，循环外面长出三样东西；再把六条收成一张索引。
scene('lessons', ({ root, s, c0 }) => {
  const { world, g } = stage(root, 'n');
  const cam = makeCamera(world);
  const X = 260, Wd = 1440;
  const T2 = (id, zh, en) => T(id, { zh, en });
  const STEP = 1000, Y0 = 700;

  const intro = tx(world, 'ser6', X, 150, tr('把两边放在一起', 'Side by side'), { fontSize: '44px', color: C.ink2 });
  const t1 = Math.min(T('l1'), c0 + 0.1);   // 章节卡一退就有字，免得空屏
  appear(intro, t1);
  // 开篇：两个项目的名字各占一行，中间一条细线
  const pa = nRow(world, g, X, 380, 700, 399, 'OpenClaw 2.0', { size: 84 }), pb = nRow(world, g, X + 840, 380, 640, 400, 'OpenCode v2', { size: 84 });
  const da = brandDot(g, X + 650, 306, 'cl', 30), db = brandDot(g, X + 1440, 306, 'oc', 30);
  pa.in(t1 + 0.1); pb.in(t1 + 0.35); appear(da, t1 + 0.3); appear(db, t1 + 0.55); sfx('pop', t1 + 0.3, { g: 0.5 }); sfx('pop', t1 + 0.55, { g: 0.5 });

  // 六条：[句号, 陈述, OpenClaw 的证据, OpenCode 的证据, 证据出现的句号与词]
  const L6 = [
    ['l2', tr('先记下来，再动手', 'Write it down, then act'),
      [tr('先写发送意图，再调用平台接口', 'send intent written before the platform call'), 'message-lifecycle-refactor.md:39'],
      [tr('工具调用先落库，再产生副作用', 'tool call stored before its side effects'), 'specs/v2/session.md:74'], [['l3', 'OpenClaw'], ['l3', 'OpenCode']]],
    ['l4', tr('恢复时承认「不知道」', 'Admit what is unknown'),
      ['unknown_after_send · ' + tr('只有 not_sent 才重发', 'only not_sent is replayed'), 'delivery-queue-recovery.ts:238'],
      ['aborted · ' + tr('不保证工具恰好执行一次', 'no exactly-once guarantee'), tr('实验 · session.md:116', 'experiment · session.md:116')], [['l5', 'unknown_after_send'], ['l5', { zh: '被中断', en: 'interruption' }]]],
    ['l7', tr('记录始终成对', 'Keep the record paired'),
      [tr('跳过的调用补一条 synthetic error', 'skipped calls get a synthetic error'), 'docs/concepts/queue.md:82'],
      [tr('中断的调用补一条 aborted 结果', 'the interrupted call gets an aborted result'), tr('实验：序号 5', 'experiment: seq 5')], [['l8', { zh: '跳过', en: 'skipped' }], ['l8', { zh: '中断', en: 'interrupted' }]]],
    ['l9', tr('上下文是预算', 'The context is a budget'),
      [tr('注入的每一项都有硬上限；顺序确定，旧字节不变', 'a hard cap on every injected item; stable order and bytes'), 'AGENTS.md:142–143'],
      [tr('摘要 + 最近 15k；输出留头尾；指令按差异追加', 'summary + recent 15k; head and tail; appended deltas'), 'compaction · tools · session'], [['l10', { zh: '硬上限', en: 'hard cap' }], ['l12', 'OpenCode']]],
    ['l13', tr('授权绑定到具体的那一次', 'Authority binds to the instance'),
      [tr('审批绑定请求、命令、会话和人', 'approval bound to request, command, session, person'), 'security-and-privacy.md:6'],
      [tr('权限按顺序匹配，最后命中的生效', 'ordered rules; the last match wins'), 'permissions.mdx:24'], [['l14', 'OpenClaw'], ['l15', 'OpenCode']]],
    ['l16', tr('只留一条路径，旧的删掉', 'Keep one path, delete the old'),
      ['one canonical path — delete the old one', 'AGENTS.md:111'],
      [tr('删掉 packages/opencode；v1 插件不再运行', 'packages/opencode removed; v1 plugins do not run'), 'migrate-v1.mdx:38'], [['l17', 'OpenClaw'], ['l18', 'OpenCode']]],
  ];
  has('claw_agents_canonical', 'one canonical path — delete the old one'); has('claw_agents_budget', 'bounded with a hard cap'); has('claw_agents_cache', 'Preserve old transcript bytes when possible'); has('oc2_perm_last', 'The last matching rule wins');
  const rows = L6.map(([id, stmt, cl, oc, ev], i) => {
    const y0 = Y0 + i * STEP;
    const r = nRow(world, g, X, y0 + 200, Wd, 401 + i, stmt, { size: tr(92, 72) });   // 英文标题长，缩小以免压到右侧的小图
    r.in(T(id) - 0.6); sfx('thud', T(id) - 0.3, { g: 0.55 });
    const mk = (y, which, [txt, src], t) => {
      const d = brandDot(g, X, y + 18, which, 26);
      const nm = tx(world, 'ser6', X + 48, y, which === 'cl' ? 'OpenClaw' : 'OpenCode', { fontSize: '38px' });
      const tt = tx(world, 'sans', X + 340, y + 2, esc(txt), { fontSize: '38px', fontWeight: 500 });
      const sr = tx(world, 'seqn', X + 340, y + 60, esc(src), { fontSize: '24px' });
      appear(d, t); wipe(nm, t, { dir: 'l', d: 0.35 }); wipe(tt, t + 0.12, { dir: 'l', d: 0.45 }); appear(sr, t + 0.4); sfx('pop', t, { g: 0.4 });
    };
    mk(y0 + 320, 'cl', cl, T(ev[0][0], ev[0][1]) - 0.1);
    mk(y0 + 470, 'oc', oc, T(ev[1][0], ev[1][1]) - 0.1);
    return { y0, r };
  });
  // 每一条右侧一个线描的小图（示意），与第 01 章同一套图形语言
  const pic = (i, fn) => fn(X + Wd - 220, Y0 + i * STEP + 40);
  pic(0, (x, y) => { const l = lifeLine(g, x - 60, y + 60, x + 220); const t = T('l2'); l.grow(t + 0.4, t + 1.4, x + 220); const rr = R(g, x - 60, y - 10, 120, 34, C.ink); wipe(rr, t + 0.1, { dir: 'l', d: 0.3 }); });
  pic(1, (x, y) => { const q = tx(world, 'ser', x + 10, y - 50, '?', { fontSize: '150px' }); slam(q, T('l4') + 0.3, { from: 1.5 }); });
  pic(2, (x, y) => { const a = Pa(g, `M${x},${y - 20} L${x - 30},${y - 20} L${x - 30},${y + 80} L${x},${y + 80} M${x + 160},${y - 20} L${x + 190},${y - 20} L${x + 190},${y + 80} L${x + 160},${y + 80}`, { stroke: C.ink, 'stroke-width': 5 }); drawH(a, T('l7') + 0.3, 0.6); });
  pic(3, (x, y) => { const fr = R(g, x - 40, y, 240, 60, 'none', { stroke: C.ink, 'stroke-width': 4 }); const cap = Ln(g, x + 200, y - 30, x + 200, y + 90, C.ink, 6); const f = R(g, x - 36, y + 4, 232, 52, C.ink); wipe(fr, T('l9'), { dir: 'l', d: 0.3 }); appear(cap, T('l9') + 0.2); wipe(f, T('l9') + 0.3, { dir: 'l', d: 0.7, ease: 'none' }); });
  pic(4, (x, y) => { const gt_ = Pa(g, `M${x - 20},${y + 90} L${x - 20},${y - 20} M${x + 200},${y + 90} L${x + 200},${y - 20} M${x - 20},${y + 30} L${x + 200},${y + 30}`, { stroke: C.ink, 'stroke-width': 5 }); const k = R(g, x + 70, y + 12, 40, 36, C.ink); drawH(gt_, T('l13') + 0.2, 0.5); appear(k, T('l13') + 0.7); });
  pic(5, (x, y) => { const a = Pa(g, `M${x - 40},${y - 10} C${x + 60},${y - 10} ${x + 60},${y + 40} ${x + 200},${y + 40}`, { stroke: C.ink, 'stroke-width': 5 }); const b = Pa(g, `M${x - 40},${y + 90} C${x + 60},${y + 90} ${x + 60},${y + 40} ${x + 120},${y + 40}`, { stroke: C.rule, 'stroke-width': 5 }); const xx = Pa(g, `M${x + 10},${y + 60} L${x + 50},${y + 100} M${x + 50},${y + 60} L${x + 10},${y + 100}`, { stroke: C.ink, 'stroke-width': 5 }); drawH(a, T('l16') + 0.2, 0.5); drawH(b, T('l16') + 0.2, 0.5); drawH(xx, T2('l16', '删掉', 'delete'), 0.25); });

  // ── 最后一站：循环与循环外面 ──
  const YF = Y0 + 6 * STEP;
  const ring = loopRing(g, X + 360, YF + 300, 200, { w: 6, dot: 28 });
  const rl = tx(world, 'ser', X + 260, YF + 270, tr('循环', 'the loop'), { fontSize: '56px', width: '200px', textAlign: 'center' });
  drawH(ring.circ, T('l19') - 0.55, 0.8); appear(rl, Math.min(T2('l19', '循环', 'loop'), T('l19') + 0.2)); ring.spin(T('l19'), s.end, 2.6); sfx('thud', T2('l19', '循环', 'loop'), { g: 0.5 });
  const yr = tx(world, 'seqn', X + 230, YF + 40, tr('一年前', 'a year ago'), { fontSize: '30px', color: C.ink });
  appear(yr, T('l19'));
  const outs = [[tr('先写下的记录', 'records written first'), { zh: '记录', en: 'records' }], [tr('有上限的上下文', 'a bounded context'), { zh: '上下文', en: 'context' }], [tr('绑定到具体请求的权限', 'authority bound to each request'), { zh: '权限', en: 'authority' }]];
  const oEls = outs.map(([t_, w], i) => {
    const y = YF + 110 + i * 150;
    const ln = Pa(g, `M${X + 580},${YF + 300} L${X + 730},${y + 40}`, { stroke: C.rule, 'stroke-width': 3 });
    const r = nRow(world, g, X + 760, y + 70, tr(690, 820), 407 + i, t_, { cls: 'ser', size: tr(60, 48) });
    return { ln, r, t: T('l21', w) };
  });
  const now = tx(world, 'seqn', X + 760, YF + 40, tr('到了 v2：循环外面', 'in v2: outside the loop'), { fontSize: '30px', color: C.ink });
  appear(now, T2('l20', '外面', 'outside')); sfx('whoosh', T2('l20', '外面', 'outside'), { g: 0.4 });
  oEls.forEach((o) => { drawH(o.ln, o.t - 0.3, 0.3); o.r.in(o.t - 0.2); });
  const last = tx(world, 'ser6', X, YF + 640, tr('要自己写 harness，可以从这几处开始。', 'Anyone writing a harness can start from these.'), { fontSize: '50px', color: C.ink });
  wipe(last, T('l22') - 0.1, { dir: 'l', d: 0.6 }); sfx('chime', T('l22') + 0.3, { g: 0.45 });

  // ── 镜头：每条一站往下移，最后一站停住 ──
  const keys = [[c0 + 0.1, { x: 980, z: 1.02 }, Math.max(1.0, T('l2') - c0 - 0.8), { sfx: false }]];
  L6.forEach(([id], i) => {
    const nextT = i < 5 ? T(L6[i + 1][0]) : T('l19');
    keys.push([T(id) - 0.55, { x: 960, y: Y0 + i * STEP + 360, z: 1.0 }, 0.85]);
    keys.push([null, { x: 980, z: 1.03 }, Math.max(1.2, nextT - T(id) - 1.6), { sfx: false }]);
  });
  keys.push([T('l19') - 0.55, { x: 960, y: YF + 330, z: 1.0 }, 0.9]);
  keys.push([null, { x: 975, z: 1.03 }, Math.max(1.2, s.end - T('l19') - 1.0), { sfx: false }]);
  camTrack(cam, s.start, { x: 960, y: 420, z: 1.0 }, keys, s.end + 0.45);
});
