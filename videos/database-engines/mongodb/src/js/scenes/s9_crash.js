// 第 09 章 出错怎么办（四站）：1 两次检查点之间的修改与日志；2 默认写法与 j: true 的回复时机；3 崩溃实验：日志里两笔、重启后检查点加重放；
// 4 两轮五次的实测与进程被杀／断电的边界。事实：H01 H02 H03 H04 H05 H06 H07 H08。
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const arrow = (pts, t, col = 'accent', o = {}) => { const p = link(ov, pts, col, { arrow: true, w: 3, ...o }); arrowIn(p, t, 0.6); return p; };
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const pop = (x, y, txt, t0, t1, cls = 'dk') => { const c = xl(world, x, y, txt, cls); show(c, t0, { y: 10 }); if (t1 != null) fadeOut(c, t1); return c; };
  const X2 = 1920, X3 = 3840, X4 = 5760;

  // ── 第一站：两次检查点之间 ──
  const ax = link(ov, [[160, 420], [1760, 420]], 'dim', { w: 3 }); arrowIn(ax, c0, 0.8);
  [300, 1500].forEach((x) => {
    const ln = link(ov, [[x, 340], [x, 500]], 'ink', { w: 4 });
    const c = chip(world, x - 62, 280, '检查点', 'dk');
    arrowIn(ln, c0 + 0.3, 0.5); show(c, c0 + 0.3, { y: 8 });
  });
  pop(800, 450, '60 秒', T('h1', '60 秒') - 0.3, null, 'dk');
  const gp = term(world, 1100, 30, 700, 200, 'mongosh · lab', { fs: 22 });
  show(gp.c, T('h1') - 0.2, { x: 20, y: 0 });
  gp.cmd(T('h1') - 0.1, 'db.adminCommand({ <span class="k">getParameter</span>: <span class="n">1</span>, … })');
  gp.out(T('h1', '60 秒') - 0.2, '{ <span class="k">journalCommitInterval</span>: <span class="n">100</span>, <span class="k">syncdelay</span>: <span class="n">60</span> }');
  gp.clear(T('h4') - 0.1);
  gp.cmd(T('h4'), 'ls -l db/journal', '$ ');
  gp.out(T('h4', '日志') - 0.2, '<span class="n">104857600</span>  WiredTigerLog.0000000001');
  const dots = [560, 800, 1040, 1280].map((x) => { const d = h('div', 'abs', world); px(d, x, 340, 70, 70); css(d, { background: '#00ED64', borderRadius: '10px' }); return d; });
  show(dots, T('h2', '修改') - 0.3, { y: 10, stagger: 0.15 });
  pop(520, 140, '两次检查点之间', T('h2') + 0.1, T('h3') - 0.1, 'on');
  pop(520, 220, '内存里的修改', T('h2', '修改'), T('h3') - 0.1, 'dk');
  pop(560, 520, '还不一定进了数据文件', T('h2', '数据文件') - 0.3, T('h4') - 0.1, 'red');
  const kill = h('div', 'abs', world, '×'); px(kill, 1362, 316); css(kill, { font: '800 96px "Inter"', color: '#DB3030' });
  const killL = xl(world, 1290, 450, '进程被杀', 'red');
  show([kill, killL], T('h3', '被杀') - 0.2, { y: 0, s: 1.5 }); sfx('error', T('h3', '被杀') - 0.2);
  slotNote(world, 520, 190, '这些修改，还找得回来吗？', T('h3'), T('h4') - 0.1, 'r');
  fadeOut([kill, killL], T('h4') - 0.1);
  // 日志：每一次修改都同时记一笔（深色的一条文件），先在缓冲里（灰），落盘后变绿
  const J1 = h('div', 'abs', world); px(J1, 160, 580, 1600, 150); css(J1, { background: '#001E2B', borderRadius: '12px' }); gloss(J1, '日志');
  const jt = h('div', 'abs', J1, '日志：每次修改都记一笔，新的接在后面'); css(jt, { left: '28px', top: '14px', font: '600 28px "Sans SC"', color: '#71F6BA' });
  show(J1, T('h4', '日志') - 0.4, { y: 14 });
  const recs = [560, 800, 1040, 1280].map((x, i) => {
    const r = h('div', 'abs', world); px(r, x, 640, 70, 70); css(r, { background: '#889397', borderRadius: '8px' });
    show(r, T('h4', '同时记进') + i * 0.3, { y: -250, d: 0.7, ease: 'power2.in' }); sfx('pop', T('h4', '同时记进') + 0.6 + i * 0.3);
    return r;
  });
  const fl = pop(1010, 750, '默认每 100 毫秒同步到磁盘一次', T('h5', '100 毫秒') - 0.4, null, 'dk');
  recs.forEach((r, i) => to(r, T('h5', '同步到磁盘') - 0.2 + i * 0.25, { backgroundColor: '#00ED64', duration: 0.3 }));
  pop(160, 750, '新的记录一条条接在后面', T('h5') + 0.2, null, 'on');

  // ── 第二站：回复「写好了」的时机 ──
  const step = (x, y, w, title, sub, cls = '') => tile(world, X2 + x, y, w, 130, title, sub, cls);
  const r1 = [step(120, 300, 400, '默认写法', '不带 j', 'dk'), step(580, 300, 300, '写进内存', ''), step(960, 300, 340, '回复「写好了」', '', 'sp'), step(1380, 300, 420, '日志落盘', '最多再等 100 毫秒', 'dash')];
  show(r1[0], T('h6'), { y: 12 }); show(r1[1], T('h6') + 0.3, { y: 12 });
  show(r1[2], T('h6', '写好了') - 0.3, { y: 12 }); arrow([[X2 + 884, 365], [X2 + 954, 365]], T('h6', '写好了') - 0.3);
  show(r1[3], T('h6', '不一定') - 0.2, { y: 12 }); arrow([[X2 + 1304, 365], [X2 + 1374, 365]], T('h6', '不一定') - 0.2, 'accent', { dashed: '6 6' });
  pop(X2 + 1380, 450, '日志还没落盘', T('h6', '不一定') - 0.1, T('h7') - 0.1, 'red');
  const r2 = [step(120, 560, 400, 'j: true', 'j 指的是日志（journal）', 'dk'), step(580, 560, 300, '写进内存', ''), step(960, 560, 340, '日志落盘', '', 'dk'), step(1380, 560, 420, '回复「写好了」', '', 'sp')];
  show(r2[0], T('h7', 'j: true') - 0.3, { y: 12 }); show(r2[1], T('h7', '日志') - 0.2, { y: 12 });
  show(r2[2], T('h7b', '写进磁盘') - 0.3, { y: 12 }); arrow([[X2 + 884, 625], [X2 + 954, 625]], T('h7b', '写进磁盘') - 0.3);
  show(r2[3], T('h7b', '再回复') - 0.2, { y: 12 }); arrow([[X2 + 1304, 625], [X2 + 1374, 625]], T('h7b', '再回复') - 0.2);
  sfx('pop', T('h7b', '写进磁盘')); sfx('chime', T('h7b', '再回复'));
  glow([r1[1]], T('h8', '内存') - 0.3, null, { bg: '#00ED64', bd: '#00ED64' });
  slotNote(world, X2 + 560, 780, '不带 j 的单机写入：写进内存就回复', T('h8'), null, 'g');

  // ── 第三站：崩溃实验 ──
  const CP = tile(world, X3 + 120, 220, 520, 150, '刚写完 4096 人', '刚做完检查点', 'dk'); show(CP, T('h9'), { y: 12 });
  pop(X3 + 120, 120, '一台单独的 mongod', T('h9', '单独') - 0.3, T('h13') - 0.1, 'on');
  const OP1 = tile(world, X3 + 120, 400, 520, 120, 'Alice 改年龄 → 43', '这一笔带 j: true', 'dk'); show(OP1, T('h10') + 0.2, { y: 12 });
  pop(X3 + 660, 430, 'j: true', T('h10', 'j: true') - 0.3, T('h13') - 0.1, 'on');
  pop(X3 + 660, 300, 'age 42 → 43', T('h10', '改了') - 0.2, T('h13') - 0.1, 'dk');
  const OP2 = tile(world, X3 + 120, 540, 520, 120, 'Dave 注册', '这一笔不带 j', 'dk'); show(OP2, T('h11', 'Dave') - 0.2, { y: 12 });
  pop(X3 + 660, 570, '不带 j', T('h11', '不带') - 0.2, T('h13') - 0.1, 'dk');
  const KL = tile(world, X3 + 120, 700, 520, 120, '两笔都回复成功', 'mongod 被强制结束', 'rd'); show(KL, T('h12', '强制结束') - 0.5, { y: 12 }); sfx('error', T('h12', '强制结束') - 0.3);
  pop(X3 + 720, 700, '两笔都回复成功之后', T('h12', '回复成功') - 0.3, T('h13') - 0.1, 'dk');
  const J3 = h('div', 'abs', world); px(J3, X3 + 720, 220, 1080, 370); css(J3, { background: '#001E2B', borderRadius: '14px' }); gloss(J3, '日志');
  const jt3 = h('div', 'abs', J3, '日志文件：检查点之后记着两笔'); css(jt3, { left: '28px', top: '18px', font: '600 30px "Sans SC"', color: '#71F6BA' });
  show(J3, T('h13'), { y: 14 });
  const R1 = tile(J3, 30, 86, 1020, 120, 'Alice：整份新文档，47 字节，age 43', 'lsn [1, 139904]　row_put　文件号 88　键 c7c2', 'sp'); css(R1._s, { fontFamily: '"Mono"' }); show(R1, T('h14', 'Alice') - 0.2, { y: 10 });
  const R2 = tile(J3, 30, 226, 1020, 120, 'Dave：一个事务，三次写入', '事务 64　row_put × 3　文件号 88 · 96 · 104', 'sp'); css(R2._s, { fontFamily: '"Mono"' }); show(R2, T('h15', 'Dave') - 0.2, { y: 10 }); sfx('pop', T('h15', 'Dave'));
  pop(X3 + 720, 610, '不带 j 的 Dave：也赶在结束前写进了日志文件', T('h16', '写进了日志文件') - 0.5, T('h17') - 0.1, 'on');
  const S1 = tile(world, X3 + 720, 640, 500, 150, '重启：回到检查点', '4096 人，Alice 还是 42', 'dk'); show(S1, T('h17', '检查点') - 0.3, { y: 12 });
  fadeOut([CP, OP1, OP2, KL], T('h17') - 0.1);
  const rec = term(world, X3 + 60, 220, 645, 400, 'mongod 重启', { fs: 22 });
  show(rec.c, T('h17') + 0.1, { y: 12 });
  rec.out(T('h18', '重放') - 0.2, '<span class="c">"msg":</span><span class="s">"recovery was completed\n successfully …"</span>');
  rec.cmd(T('h19') - 0.1, 'db.users.countDocuments()');
  rec.out(T('h19', '4097') - 0.3, '<span class="n">4097</span>');
  rec.cmd(T('h19', '43') - 0.6, 'db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> }).age');
  rec.out(T('h19', '43') - 0.1, '<span class="n">43</span>');
  const S2 = tile(world, X3 + 1300, 640, 500, 150, '再把日志一条条重放', 'Alice 改年龄，Dave 注册', 'sp'); show(S2, T('h18', '重放') - 0.4, { y: 12 });
  arrow([[X3 + 1226, 715], [X3 + 1294, 715]], T('h18', '重放') - 0.2);
  const RES = tile(world, X3 + 720, 820, 1080, 100, 'Alice 又是 43 岁，Dave 也在：4097 份，一份不少', '', 'sp'); css(RES, { padding: '24px 28px' });
  show(RES, T('h19', '43') - 0.3, { y: 12 }); sfx('chime', T('h19', '43'));
  glow([R1, R2], T('h19', '4097') - 0.3, null, { bg: '#C0FAE6', bd: '#00684A' });

  // ── 第四站：两轮五次的实测 ──
  const q20 = pop(X4 + 160, 300, '不带 j 的写法，什么时候会丢？', T('h20'), T('h21') - 0.2, 'red'); css(q20, { fontSize: '44px' });
  const ops = [['写一笔', 'dk', '写一笔'], ['回复成功', 'sp', '回复成功'], ['立刻结束进程', 'rd', '立刻结束']].map(([t, c, w], i) => {
    const e = tile(world, X4 + 160 + i * 560, 420, 480, 110, t, '', c); css(e, { padding: '30px 24px', textAlign: 'center' });
    show(e, T('h21', w) - 0.3, { y: 12 }); fadeOut(e, T('h22') - 0.2); return e;
  });
  const opa = [arrow([[X4 + 650, 475], [X4 + 710, 475]], T('h21', '回复成功') - 0.2), arrow([[X4 + 1210, 475], [X4 + 1270, 475]], T('h21', '立刻结束') - 0.2)];
  fadeOut(opa, T('h22') - 0.2);
  const rows = [['不带 j · 写完立刻结束 · 第一轮', 0, ['h22', '两轮'], ['h22', '全丢了']], ['不带 j · 写完立刻结束 · 第二轮', 1, ['h22', '每轮五次'], ['h22', '只留下一次']], ['j: true · 写完立刻结束', 5, ['h24', 'j: true'], ['h24', 'j: true']], ['不带 j · 隔 300 毫秒再结束', 5, ['h24', '300 毫秒'], ['h24', '五次都在']]];
  const TB = [];
  rows.forEach(([lab, n, ta, tf], i) => {
    const y = 230 + i * 118;
    const lb = tile(world, X4 + 120, y, 800, 96, lab, '', 'dk'); css(lb, { padding: '22px 24px' });
    const sl = [0, 1, 2, 3, 4].map((k) => { const e = h('div', 'abs', world); px(e, X4 + 970 + k * 84, y + 16, 64, 64); css(e, { borderRadius: '8px', border: '3px dashed #889397', boxSizing: 'border-box' }); return e; });
    const res = chip(world, X4 + 1420, y + 14, `留下 ${n} 次`, (n === 5 ? 'on' : 'red') + ' xl');
    const t1 = T(ta[0], ta[1]) - 0.3, t2 = T(tf[0], tf[1]) - 0.3 + (i === 2 ? 0.8 : 0);
    show([lb, ...sl], t1, { y: 10 });
    sl.slice(0, n).forEach((e, k) => to(e, t2 + 0.2 + k * 0.15, { backgroundColor: '#00ED64', borderColor: '#00ED64', duration: 0.3 }));
    if (n === 0) to(sl, t2 + 0.2, { borderColor: '#DB3030', duration: 0.3 });
    show(res, t2 + 0.4 + n * 0.15, { y: 6 });
    TB.push(lb, ...sl, res);
  });
  slotNote(world, X4 + 400, 740, '300 毫秒，已经超过日志 100 毫秒一次的落盘间隔', T('h26'), T('h27') - 0.2, 'g');
  fadeOut(TB, T('h27') - 0.2);
  // 边界：进程被杀与断电（深色两栏）
  const panel = (x, title, note_) => { const p = h('div', 'abs', world); px(p, x, 260, 760, 400); css(p, { background: '#001E2B', borderRadius: '16px' }); const t = h('div', 'abs', p, title); css(t, { left: '30px', top: '26px', font: '700 44px "Serif SC"', color: '#fff' }); const n = h('div', 'abs', p, note_); css(n, { left: '30px', top: '92px', font: '500 26px "Sans SC"', color: '#C0FAE6' }); return p; };
  const PL = panel(X4 + 160, '进程被强制结束', '本片实测的就是这一种'); show(PL, T('h27') - 0.1, { y: 14 });
  pop(X4 + 960, 300, 'kill -9：强制结束进程', T('h27', '强制结束') - 0.3, T('h28') + 0.4, 'dk');
  const pl1 = h('div', 'abs', PL, '可能丢的，只有最后一小段'); css(pl1, { left: '30px', top: '170px', font: '600 34px "Sans SC"', color: '#fff' });
  const pl2 = h('div', 'abs', PL, '已经回复了成功、<br>还没写进日志文件的写入'); css(pl2, { left: '30px', top: '240px', font: '600 34px/1.4 "Sans SC"', color: '#FF8A80', whiteSpace: 'normal', width: '700px' });
  show(pl1, T('h28') + 0.2, { y: 8 }); pop(X4 + 200, 690, '最后一小段', T('h28', '最后一小段') - 0.3, T('h30') - 0.1, 'on'); show(pl2, T('h29', '还没写进') - 0.4, { y: 8 });
  const PR = panel(X4 + 1000, '断电', '本片没有测'); show(PR, T('h30') - 0.1, { y: 14 });
  const pr1 = h('div', 'abs', PR, '写进了日志文件，还不够'); css(pr1, { left: '30px', top: '170px', font: '600 34px "Sans SC"', color: '#fff' });
  const pr2 = h('div', 'abs', PR, '还要看操作系统有没有<br>真的写到磁盘上'); css(pr2, { left: '30px', top: '240px', font: '600 34px/1.4 "Sans SC"', color: '#FF8A80', whiteSpace: 'normal', width: '700px' });
  show(pr1, T('h30', '断电') + 0.4, { y: 8 }); show(pr2, T('h30', '操作系统') - 0.4, { y: 8 });
  slotNote(world, X4 + 520, 720, '每一次写入，都可以自己选：等不等日志落盘', T('h31'), null, 'g');

  // 镜头：四站
  const m1 = T('h6') - 0.9, m2 = T('h9') - 0.9, m3 = T('h20') - 0.9;
  const a = drift(s.start, m1, 960, 1), b = drift(m1 + 1.3, m2, X2 + 960, 1), c = drift(m2 + 1.3, m3, X3 + 960, 1), d = drift(m3 + 1.3, s.end, X4 + 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d - 0.2, { ease: 'none', sfx: false }],
    [m1, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d - 0.2, { ease: 'none', sfx: false }],
    [m2, { x: c.from }, 1.3],
    [null, { x: c.to }, c.d - 0.2, { ease: 'none', sfx: false }],
    [m3, { x: d.from }, 1.3],
    [null, { x: d.to }, d.d - 0.2, { ease: 'none', sfx: false }],
  ]);
});
