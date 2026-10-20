// 开场：两行记录（两个 v2 的日期）、一条被切断的进程生命线、片名。中性皮肤。
// 图形语言：带序号的一行 = 落了盘的记录；粗横线 = 一个进程的生命期，被斜着切断 = 进程被杀。
scene('open', ({ root, s }) => {
  const { world, g } = stage(root, 'n');
  const cam = makeCamera(world);
  const X = 260, Wd = 1440;

  // 两行记录：日期（宋体大字）+ 项目与版本（宋体）+ 项目的颜色块
  const r1 = nRow(world, g, X, 300, Wd, 1, '2026-08-31', { size: 76 });
  const n1 = tx(world, 'ser6', X + 540, 300 - 12 - 58, 'OpenClaw 2.0', { fontSize: '52px' });
  const d1 = brandDot(g, X + 500, 300 - 52, 'cl', 24);
  const r2 = nRow(world, g, X, 450, Wd, 2, '2026-09-11', { size: 76 });
  const n2 = tx(world, 'ser6', X + 540, 450 - 12 - 58, 'OpenCode v2.0.0', { fontSize: '52px' });
  const d2 = brandDot(g, X + 500, 450 - 52, 'oc', 24);
  r1.in(s.start + 0.05);
  wipe(n1, T('o1', 'OpenClaw'), { dir: 'l', d: 0.5 }); appear(d1, T('o1', 'OpenClaw')); sfx('pop', T('o1', 'OpenClaw'), { g: 0.6 });
  r2.in(T('o2'));
  wipe(n2, T('o2', 'OpenCode'), { dir: 'l', d: 0.5 }); appear(d2, T('o2', 'OpenCode')); sfx('pop', T('o2', 'OpenCode'), { g: 0.6 });
  // 两个日期之间的间隔：右侧页边一个方括号与「11 天」
  const br = Pa(g, `M${X + Wd - 30},236 L${X + Wd},236 L${X + Wd},386 L${X + Wd - 30},386`, { stroke: C.ink, 'stroke-width': 3 });
  const gap = tx(world, 'seqn', X + Wd - 150, 318, tr('11 天', '11 days'), { fontSize: '28px', color: C.ink, width: '120px', textAlign: 'right' });
  drawH(br, Tc('o2', '不到两周', 'Less than'), 0.5); appear(gap, Tc('o2', '不到两周', 'Less than') + 0.4); sfx('tick', Tc('o2', '不到两周', 'Less than') + 0.4, { g: 0.5 });

  // 两个项目各是什么
  const k3 = tx(world, 'ser6', X + 1000, 300 - 12 - 42, tr('聊天软件里的个人助理', 'an assistant in chat apps'), { fontSize: '34px', color: C.ink2 });
  const k4 = tx(world, 'ser6', X + 1000, 450 - 12 - 42, tr('终端里写代码的智能体', 'a coding agent in a terminal'), { fontSize: '34px', color: C.ink2 });
  wipe(k3, T('o3', { zh: '聊天', en: 'personal' }), { dir: 'l', d: 0.5 }); sfx('tick', T('o3', { zh: '聊天', en: 'personal' }), { g: 0.4 });
  wipe(k4, T('o4', { zh: '终端', en: 'terminal' }), { dir: 'l', d: 0.5 }); sfx('tick', T('o4', { zh: '终端', en: 'terminal' }), { g: 0.4 });

  // 同一个问题：一条进程的生命线从左走到右，在半路被切断
  const yL = 640, cutX = X + 980;
  const life = lifeLine(g, X, yL, X + Wd);
  const ttl = tx(world, 'nmono', X, yL - 64, tr('一个进程', 'a process'), { fontSize: '28px', color: C.ink2 });
  appear(ttl, T('o5')); life.grow(T('o5'), T('o6', { zh: '死掉', en: 'dies' }), cutX);
  const kill = tx(world, 'nmono', cutX - 70, yL + 52, 'kill -9', { fontSize: '30px' });
  life.cut(T('o6', { zh: '死掉', en: 'dies' }), cutX); appear(kill, T('o6', { zh: '死掉', en: 'dies' }));
  // 「还剩下什么」：上面两行记录的序号反白——记录还在
  classAt(r1.sq, 'hl-n', T('o6', { zh: '剩下', en: 'left' })); classAt(r2.sq, 'hl-n', T('o6', { zh: '剩下', en: 'left' }) + 0.12);
  sfx('blip', T('o6', { zh: '剩下', en: 'left' }), { g: 0.5 });

  // 片名：第三行记录，宋体大字；副题小一级
  const tY = 860;
  const r3 = nRow(world, g, X, tY, Wd, 3, tr('OpenClaw 和 OpenCode 的 v2 大改', 'The v2 Overhauls of OpenClaw and OpenCode'), { size: tr(84, 60) });
  const sub = tx(world, 'ser6', X, tY + 18, tr('我们从过去一年的 Agent 工程化学习到了什么', 'What a Year of Agent Engineering Taught Us'), { fontSize: tr(46, 44) + 'px', color: C.ink2 });
  const tT = T('oT');
  r3.in(tT); wipe(sub, tT + 0.5, { dir: 'l', d: 0.6 }); sfx('thud', tT + 0.15, { g: 0.7 });

  // 第 0 帧是「0001」这个序号的特写，随即拉开，露出整页记录
  camTrack(cam, s.start, { x: 205, y: 262, z: 3.2 }, [
    [s.start + 0.3, { x: 980, y: 520, z: 1.06 }, 1.5, { g: 0.7 }],
    [null, { x: 960, z: 1.03 }, Math.max(1.2, T('o3') - s.start - 2.0), { sfx: false, room: 40 }],
    [T('o5') - 0.3, { x: 960, y: 560, z: 1.0 }, 1.0],
    [null, { x: 990, z: 1.02 }, Math.max(1, tT - T('o5') - 1.6), { sfx: false, room: 40 }],
    [tT - 0.25, { x: 960, y: 620, z: 1.0 }, 0.9],
    [null, { x: 975, z: 1.025 }, Math.max(1, s.end - tT - 1.2), { sfx: false, room: 40 }],
  ], s.end + 0.4, world);
});
