// 第 09 章 出错怎么办（四站）：1 两次检查点之间的修改，日志文件按 100 毫秒一次落盘；2 默认写法与 j: true 的回复时机（文档页式的步骤）；
// 3 崩溃实验：日志里两笔、重启后检查点加重放（mongod 的日志与查询回显）；4 两轮五次的实测表，进程被杀与断电的边界。
// 事实：H01 H02 H03 H04 H05 H06 H07 H08；回显抄自 research/lab/out_07_crash.txt。
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '09 出错怎么办');
  ch.sec(c0, '日志');
  const arrow = (pts, t, col = 'accent', o = {}) => { const p = link(ov, pts, col, { arrow: true, w: 3, ...o }); arrowIn(p, t, 0.5); return p; };
  const X2 = 1920, X3 = 3840, X4 = 5760;

  // ── 第一站：两次检查点之间；日志 ──
  const AY = 400;
  const ax = link(ov, [[160, AY], [1760, AY]], 'dim', { w: 3, arrow: true }); arrowIn(ax, c0, 0.8);
  const axL = label(world, 1650, AY + 14, '时间', 't-small'); show(axL, c0 + 0.5, { y: 6 });
  const cps = [300, 1500].map((x) => { const ln = link(ov, [[x, AY - 90], [x, AY + 30]], 'ink', { w: 4 }); const c = chip(world, x - 62, AY - 136, '检查点', 'dk'); arrowIn(ln, c0 + 0.3, 0.5); show(c, c0 + 0.3, { y: 8 }); return [ln, c]; });
  const span = h('div', 'abs', world); px(span, 310, AY + 40, 1180, 14); css(span, { borderLeft: '3px solid #5C6C75', borderRight: '3px solid #5C6C75', borderBottom: '3px solid #5C6C75' });
  const spanL = label(world, 820, AY + 64, 'syncdelay：60 秒', 't-small'); css(spanL, { font: '600 24px "Mono", "Sans SC"', color: '#3D4F58' });
  show([span, spanL], T('h1', '60 秒') - 0.3, { y: 6 });
  const gp = term(world, 1100, 108, 680, 150, 'mongosh', { fs: 22 });
  show(gp.c, T('h1') - 0.2, { x: 20, y: 0 });
  gp.cmd(T('h1') - 0.1, 'db.adminCommand({ <span class="k">getParameter</span>: <span class="n">1</span>, … })');
  gp.out(T('h1', '60 秒') - 0.2, '{ <span class="k">journalCommitInterval</span>: <span class="n">100</span>, <span class="k">syncdelay</span>: <span class="n">60</span> }');
  const mods = [560, 800, 1040, 1280].map((x) => { const d = h('div', 'abs', world); px(d, x, AY - 70, 64, 64); css(d, { background: '#E3FCF7', border: '2px solid #00A35C', borderRadius: '10px' }); return d; });
  show(mods, T('h2', '修改') - 0.3, { y: 10, stagger: 0.15 });
  const notFile = callout(world, 160, 116, 'warn', '数据文件只停在上一个检查点', '两次检查点之间');
  show(notFile, T('h2') + 0.2, { y: 10 }); fadeOut(notFile, T('h4') - 0.1);
  const kill = h('div', 'abs', world); px(kill, 1390, AY - 100, 4, 140); css(kill, { background: '#DB3030' });
  const killL = chip(world, 1330, AY + 50, '进程被杀', 'red');
  show([kill, killL], T('h3', '被杀') - 0.2, { y: 0, s: 1.2 }); sfx('error', T('h3', '被杀') - 0.2);
  fadeOut([kill, killL], T('h4') - 0.1);
  // h4：日志文件（WiredTigerLog），每次修改都记一笔；h5：新的接在后面，每 100 毫秒落盘
  gp.clear(T('h4') - 0.1);
  gp.cmd(T('h4'), 'ls -l db/journal', '$ ');
  gp.out(T('h4', '日志') - 0.2, '<span class="n">104857600</span>  WiredTigerLog.0000000001');
  const JY = 600;
  const J1 = gloss(h('div', 'panel gray', world), '日志'); px(J1, 160, JY, 1600, 190);
  const jt = h('div', 'abs', J1, 'journal/WiredTigerLog.0000000001'); css(jt, { left: '26px', top: '16px', font: '600 26px "Mono"', color: '#001E2B' });
  const jt2 = h('div', 'abs', J1, '每次修改都记一笔，新的接在后面'); css(jt2, { left: '600px', top: '18px', font: '500 24px "Inter", "Sans SC"', color: '#5C6C75' });
  show(J1, T('h4', '日志') - 0.4, { y: 14 });
  const recs = [560, 800, 1040, 1280].map((x, i) => {
    const r = h('div', 'abs', world); px(r, x, JY + 80, 64, 64); css(r, { background: '#fff', border: '2px dashed #889397', borderRadius: '8px' });
    show(r, T('h4', '同时记进') + i * 0.3, { y: -270, d: 0.7, ease: 'power2.in' }); sfx('pop', T('h4', '同时记进') + 0.6 + i * 0.3);
    return r;
  });
  // 100 毫秒的刻度：每到一格，缓冲里的记录落盘（实线、变绿）
  const ticks = [0, 1, 2, 3, 4, 5].map((k) => { const t = h('div', 'abs', world); px(t, 480 + k * 220, JY + 158, 2, 18); css(t, { background: '#889397' }); return t; });
  const tickL = label(world, 480, JY + 196, '每一格 100 毫秒', 't-small');
  show([...ticks, tickL], T('h5', '100 毫秒') - 0.4, { y: 6, stagger: 0.04 });
  recs.forEach((r, i) => to(r, T('h5', '同步到磁盘') - 0.2 + i * 0.25, { backgroundColor: '#00ED64', borderColor: '#00ED64', borderStyle: 'solid', duration: 0.3 }));
  figs(world, 160, 860, 1600, [[T('h4') + 0.5, '图 9-1', '日志每 100 毫秒落盘一次', 'getParameter · ls -l']], T('h6') - 1.0);

  // ── 第二站：回复「写好了」的时机（文档页式的步骤） ──
  ch.sec(T('h6') - 0.9, '写关注 j');
  const stepRow = (y, items, cls) => items.map(([n, title, sub, k], i) => {
    const e = h('div', 'abs', world); px(e, X2 + 300 + i * 380, y, 340, 130);
    css(e, { background: k === 'reply' ? '#00ED64' : '#fff', border: `2px ${k === 'later' ? 'dashed' : 'solid'} ${k === 'reply' ? '#00ED64' : '#C1C7C6'}`, borderRadius: '14px' });
    e.innerHTML = `<div style="position:absolute;left:20px;top:18px;width:40px;height:40px;border-radius:50%;background:${k === 'reply' ? '#023430' : '#001E2B'};color:#fff;font:700 24px/40px Inter;text-align:center">${n}</div>`
      + `<div style="position:absolute;left:76px;top:20px;font:700 30px Inter,'Sans SC';color:${k === 'reply' ? '#023430' : '#001E2B'}">${title}</div>`
      + `<div style="position:absolute;left:76px;top:70px;font:500 23px Inter,'Sans SC';color:${k === 'reply' ? '#023430' : '#5C6C75'}">${sub}</div>`;
    return e;
  });
  const hd1 = h('div', 'abs', world, '默认写法<br><span style="font:500 24px Mono;color:#5C6C75">不带 j</span>'); px(hd1, X2 + 120, 230); css(hd1, { font: '700 32px "Inter", "Sans SC"', color: '#001E2B', lineHeight: '1.5' });
  const r1 = stepRow(220, [[1, '写进内存', '缓存里的页'], [2, '回复「写好了」', '应用拿到结果', 'reply'], [3, '日志落盘', '最多再等 100 毫秒', 'later'], [4, '下一个检查点', '60 秒一次', 'later']]);
  show(hd1, T('h6') - 0.1, { x: -10, y: 0 }); show(r1[0], T('h6') + 0.2, { y: 12 });
  show(r1[1], T('h6', '写好了') - 0.3, { y: 12 }); show(r1[2], T('h6', '不一定') - 0.3, { y: 12 }); show(r1[3], T('h6', '不一定') + 0.1, { y: 12 });
  const gap1 = h('div', 'abs', world); px(gap1, X2 + 680, 362, 720, 46); css(gap1, { background: '#FFEAE5', border: '2px solid #FFCDC7', borderRadius: '8px', font: '600 24px/42px "Inter", "Sans SC"', color: '#970606', paddingLeft: '18px' });
  gap1.textContent = '这段时间里进程被杀：已回复的写入，日志可能还没落盘';
  show(gap1, T('h6', '不一定') + 0.4, { y: -8 });
  const hd2 = h('div', 'abs', world, '<span class="code" style="position:static;font-size:30px">j: true</span><br><span style="font:500 24px Inter,\'Sans SC\';color:#5C6C75">j 即 journal</span>'); px(hd2, X2 + 120, 520); css(hd2, { font: '700 32px "Inter", "Sans SC"', color: '#001E2B', lineHeight: '1.7' });
  const r2 = stepRow(510, [[1, '写进内存', '缓存里的页'], [2, '日志落盘', '等这一步做完'], [3, '回复「写好了」', '应用拿到结果', 'reply'], [4, '下一个检查点', '60 秒一次', 'later']]);
  show(hd2, T('h7', 'j: true') - 0.3, { x: -10, y: 0 }); show(r2[0], T('h7', '日志') - 0.1, { y: 12 });
  show(r2[1], T('h7b', '写进磁盘') - 0.3, { y: 12 }); show(r2[2], T('h7b', '再回复') - 0.2, { y: 12 }); show(r2[3], T('h7b', '再回复') + 0.3, { y: 12 });
  sfx('pop', T('h7b', '写进磁盘')); sfx('chime', T('h7b', '再回复'));
  const flow = [[r1, 220], [r2, 510]].flatMap(([row, y]) => [0, 1, 2].map((i) => link(ov, [[X2 + 300 + i * 380 + 344, y + 65], [X2 + 300 + (i + 1) * 380 - 4, y + 65]], 'dim', { arrow: true, w: 2.5 })));
  flow.slice(0, 3).forEach((p, i) => arrowIn(p, T('h6', '写好了') - 0.3 + i * 0.4, 0.3)); flow.slice(3).forEach((p, i) => arrowIn(p, T('h7b', '写进磁盘') - 0.3 + i * 0.4, 0.3));
  const single = callout(world, X2 + 120, 700, 'note', '单机不带 <code>j</code>：写进内存就回复', '本片测的情形');
  show(single, T('h8') - 0.7, { y: 10 });
  glow(r1[0], T('h8', '内存') - 0.3, null, { bg: '#E3FCF7', bd: '#00A35C' });

  // ── 第三站：崩溃实验 ──
  ch.sec(T('h9') - 0.9, '强制结束');
  const steps = [['刚写完 4096 人', '刚做完检查点', 'h9'], ['Alice 改年龄 → 43', '这一笔带 j: true', 'h10'], ['Dave 注册', '这一笔不带 j', 'h11'], ['两笔都回复成功', 'mongod 被强制结束（kill -9）', 'h12']];
  const ST = steps.map(([t1, t2, id], i) => {
    const e = h('div', 'abs', world); px(e, X3 + 120, 150 + i * 132, 640, 112);
    css(e, { background: i === 3 ? '#FFEAE5' : '#fff', border: `2px solid ${i === 3 ? '#DB3030' : '#C1C7C6'}`, borderRadius: '14px' });
    e.innerHTML = `<div style="position:absolute;left:20px;top:34px;width:40px;height:40px;border-radius:50%;background:${i === 3 ? '#DB3030' : '#001E2B'};color:#fff;font:700 24px/40px Inter;text-align:center">${i + 1}</div>`
      + `<div style="position:absolute;left:78px;top:16px;font:700 30px Inter,'Sans SC';color:${i === 3 ? '#970606' : '#001E2B'}">${t1}</div>`
      + `<div style="position:absolute;left:78px;top:62px;font:500 24px Inter,'Sans SC';color:${i === 3 ? '#970606' : '#5C6C75'}">${t2}</div>`;
    return e;
  });
  show(ST[0], T('h9') - 0.1, { y: 12 }); show(ST[1], T('h10') + 0.1, { y: 12 }); show(ST[2], T('h11', 'Dave') - 0.2, { y: 12 }); show(ST[3], T('h12', '强制结束') - 0.5, { y: 12 }); sfx('error', T('h12', '强制结束') - 0.3);
  [['h9', 0], ['h10', 1], ['h11', 2]].forEach(([id, i], k, arr) => { const t = id === 'h11' ? T('h11', 'Dave') - 0.1 : T(id) + 0.2; glow(ST[i], t, k < 2 ? T(arr[k + 1][0]) + 0.2 : T('h12', '强制结束') - 0.4, { bg: '#C0FAE6', bd: '#00A35C', rb: '#FFFFFF', rd: '#C1C7C6' }); });
  const solo = tile(world, X3 + 820, 160, 520, 120, '一台单独的 mongod', '不是副本集', 'sp'); show(solo, T('h9', '单独') - 0.3, { y: 10 }); fadeOut(solo, T('h13') - 0.3);
  const c43 = chip(world, X3 + 1360, 176, 'age 42 → 43', 'sp'), cj = chip(world, X3 + 1360, 236, 'j: true', 'sp');
  [c43, cj].forEach((c) => css(c, { font: '700 30px "Mono", "Sans SC"' }));
  show(c43, T('h10', '改了') - 0.2, { x: -16, y: 0 }); show(cj, T('h10', 'j: true') - 0.2, { x: -16, y: 0 }); fadeOut([c43, cj], T('h13') - 0.3);
  const J3 = term(world, X3 + 820, 150, 980, 380, 'journal · 检查点之后的记录', { fs: 22 }); gloss(J3.c, '日志');
  show(J3.c, T('h13') - 0.1, { x: 20, y: 0 });
  J3.out(T('h14', 'Alice') - 0.2, '<span class="c">// Alice：整份新文档，47 字节，age 43</span>\n<span class="k">lsn</span> [<span class="n">1</span>, <span class="n">139904</span>]  row_put  文件号 <span class="n">88</span>  键 <span class="s">c7c2</span>');
  J3.out(T('h15', 'Dave') - 0.2, '\n<span class="c">// Dave：一个事务，三次写入</span>\n事务 <span class="n">64</span>  row_put × <span class="n">3</span>  文件号 <span class="n">88</span> · <span class="n">96</span> · <span class="n">104</span>');
  sfx('pop', T('h15', 'Dave'));
  const hl1 = ring(world, X3 + 834, 230, 952, 90, T('h14', 'Alice') + 0.1, T('h15') - 0.1);
  const hl2 = ring(world, X3 + 834, 352, 952, 90, T('h15', 'Dave') + 0.1, T('h17') - 0.1);
  const daveIn = callout(world, X3 + 820, 560, 'tip', 'Dave 也赶在结束前进了日志', '两笔都在');
  show(daveIn, T('h16') - 0.1, { y: 10 }); fadeOut(daveIn, T('h17') - 0.1);
  // h17–h19：重启：回到检查点，再重放日志
  const S1 = tile(world, X3 + 820, 580, 460, 130, '① 回到最后一个检查点', '4096 人，Alice 还是 42', 'dk'); show(S1, T('h17', '检查点') - 0.3, { y: 12 });
  const S2 = tile(world, X3 + 1340, 580, 460, 130, '② 重放之后的日志', 'Alice 改年龄，Dave 注册', 'sp'); show(S2, T('h18', '重放') - 0.4, { y: 12 });
  arrow([[X3 + 1284, 645], [X3 + 1334, 645]], T('h18', '重放') - 0.2);
  hide(ST, T('h17') - 0.1, { y: -10, d: 0.4, stagger: 0.04 });
  const rec = term(world, X3 + 120, 150, 640, 560, 'mongod 重启', { fs: 22 });
  show(rec.c, T('h17') + 0.1, { y: 12 });
  rec.out(T('h18', '重放') - 0.2, '<span class="k">"msg"</span>: <span class="s">"recovery was completed\n  successfully …"</span>');
  rec.cmd(T('h19') - 0.1, 'db.users.countDocuments()');
  rec.out(T('h19', '4097') - 0.3, '<span class="n">4097</span>');
  rec.cmd(T('h19', '43') - 0.6, 'db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })\n  .age');
  rec.out(T('h19', '43') - 0.1, '<span class="n">43</span>');
  const RES = callout(world, X3 + 820, 740, 'tip', 'Alice 又是 43 岁，Dave 也在：4097 份，一份不少', '重启之后');
  show(RES, T('h19', '43') - 0.3, { y: 10 }); sfx('chime', T('h19', '43'));
  figs(world, X3 + 120, 740, 640, [[T('h13') + 0.4, '图 9-2', '强制结束之后', '实测：out_07']], null);

  // ── 第四站：两轮五次的实测；边界 ──
  ch.sec(T('h20') - 0.9, '什么时候会丢');
  const q20 = label(world, X4 + 140, 140, '不带 j 的写法，什么时候会丢？', 'h2'); show(q20, T('h20') - 0.1, { y: 8 });
  const ops = [['写一笔', '#fff', '写一笔'], ['回复成功', '#00ED64', '回复成功'], ['立刻结束进程', '#FFEAE5', '立刻结束']].map(([t, bg, w], i) => {
    const e = h('div', 'abs', world, t); px(e, X4 + 140 + i * 420, 224, 360, 76);
    css(e, { background: bg, border: '2px solid ' + (i === 2 ? '#DB3030' : i === 1 ? '#00ED64' : '#C1C7C6'), borderRadius: '12px', font: '700 30px/72px "Inter", "Sans SC"', textAlign: 'center', color: i === 2 ? '#970606' : '#001E2B' });
    show(e, i === 0 ? T('h21') - 0.2 : T('h21', w) - 0.3, { y: 12 }); return e;
  });
  const opa = [arrow([[X4 + 506, 262], [X4 + 556, 262]], T('h21', '回复成功') - 0.2), arrow([[X4 + 926, 262], [X4 + 976, 262]], T('h21', '立刻结束') - 0.2)];
  const rows = [['不带 j · 写完立刻结束 · 第一轮', 0, ['h22', '两轮'], ['h22', '全丢了']], ['不带 j · 写完立刻结束 · 第二轮', 1, ['h22', '每轮五次'], ['h22', '只留下一次']], ['j: true · 写完立刻结束', 5, ['h24', 'j: true'], ['h24', 'j: true']], ['不带 j · 隔 300 毫秒再结束', 5, ['h24', '300 毫秒'], ['h24', '五次都在']]];
  const thd = h('div', 'abs', world); px(thd, X4 + 140, 340, 1640, 58); css(thd, { background: '#F9FBFA', borderBottom: '2px solid #C1C7C6', borderRadius: '10px 10px 0 0', font: '700 26px/56px "Inter", "Sans SC"', color: '#001E2B' });
  thd.innerHTML = '<span style="position:absolute;left:24px">写法与结束方式</span><span style="position:absolute;left:880px">5 次写入，重启后还在的</span><span style="position:absolute;left:1380px">结果</span>';
  show(thd, T('h20') + 0.7, { y: 8 });
  const TB = [];
  rows.forEach(([lab, n, ta, tf], i) => {
    const y = 400 + i * 96;
    const lb = h('div', 'abs', world, lab); px(lb, X4 + 164, y + 26); css(lb, { font: '500 28px "Inter", "Sans SC"', color: '#001E2B' });
    const line = h('div', 'abs', world); px(line, X4 + 140, y + 94, 1640, 2); css(line, { background: '#E8EDEB' });
    const sl = [0, 1, 2, 3, 4].map((k) => { const e = h('div', 'abs', world); px(e, X4 + 1020 + k * 64, y + 22, 50, 50); css(e, { borderRadius: '8px', border: '3px dashed #889397' }); return e; });
    const res = chip(world, X4 + 1520, y + 24, `留下 ${n} 次`, n === 5 ? 'on' : 'red'); css(res, { font: '700 28px "Inter", "Sans SC"' });
    const t1 = T('h20') + 0.9 + i * 0.12, t2 = T(tf[0], tf[1]) - 0.3 + (i === 2 ? 0.8 : 0);
    show([lb, line, ...sl], t1, { y: 10 });
    sl.slice(0, n).forEach((e, k) => to(e, t2 + 0.2 + k * 0.15, { backgroundColor: '#00ED64', borderColor: '#00ED64', borderStyle: 'solid', duration: 0.3 }));
    if (n === 0) to(sl, t2 + 0.2, { borderColor: '#DB3030', duration: 0.3 });
    show(res, t2 + 0.4 + n * 0.15, { y: 6 });
    TB.push(lb, line, ...sl, res);
  });
  const why = callout(world, X4 + 140, 800, 'tip', '300 毫秒 &gt; 100 毫秒一次的落盘', '为什么隔 300 毫秒就都在');
  show(why, T('h26') - 0.1, { y: 10 });
  figs(world, X4 + 1000, 800, 780, [[T('h22') + 0.4, '表 9-1', '两轮、每轮五次的实测', '实测：out_07（H06）']], T('h27') - 0.2);
  hide([q20, ...ops, ...opa, thd, ...TB, why], T('h27') - 0.25, { y: -10, d: 0.4 });
  // 边界：进程被杀与断电
  const PL = h('div', 'panel', world); px(PL, X4 + 140, 160, 800, 520); css(PL, { borderColor: '#016BF8', borderWidth: '2px' });
  PL.innerHTML = '<div style="position:absolute;left:30px;top:26px;font:500 46px \'Serif SC\';color:#001E2B">进程被强制结束</div><div style="position:absolute;left:32px;top:100px"><span class="chip blue" style="position:static">本片实测的就是这一种</span></div>';
  show(PL, T('h27') - 0.1, { y: 14 });
  const kc = code(PL, 30, 170, 'kill -9 &lt;mongod 的进程号&gt;'); css(kc, { fontSize: '26px' }); show(kc, T('h27', '强制结束') - 0.3, { y: 8 });
  const pl1 = h('div', 'abs', PL, '可能丢的，只有最后一小段：'); css(pl1, { left: '30px', top: '250px', font: '700 34px "Inter", "Sans SC"', color: '#001E2B' });
  const pl2 = h('div', 'abs', PL, '已经回复了成功、<br>还没写进日志文件的写入'); css(pl2, { left: '30px', top: '310px', font: '500 34px/1.5 "Inter", "Sans SC"', color: '#970606' });
  show(pl1, T('h28', '最后一小段') - 0.4, { y: 8 }); show(pl2, T('h29', '还没写进') - 0.4, { y: 8 });
  const PR = h('div', 'panel', world); px(PR, X4 + 980, 160, 800, 520); css(PR, { borderColor: '#FFC010', borderWidth: '2px' });
  PR.innerHTML = '<div style="position:absolute;left:30px;top:26px;font:500 46px \'Serif SC\';color:#001E2B">断电</div><div style="position:absolute;left:32px;top:100px"><span class="chip yel" style="position:static">本片没有测</span></div>';
  show(PR, T('h30') - 0.1, { y: 14 });
  const pr1 = h('div', 'abs', PR, '写进了日志文件，还不够：'); css(pr1, { left: '30px', top: '250px', font: '700 34px "Inter", "Sans SC"', color: '#001E2B' });
  const pr2 = h('div', 'abs', PR, '还要看操作系统有没有<br>真的写到磁盘上'); css(pr2, { left: '30px', top: '310px', font: '500 34px/1.5 "Inter", "Sans SC"', color: '#944F01' });
  show(pr1, T('h30', '断电') + 0.4, { y: 8 }); show(pr2, T('h30', '操作系统') - 0.4, { y: 8 });
  const own = callout(world, X4 + 140, 720, 'tip', '每次写入自己选：等不等日志落盘', '写关注');
  show(own, T('h31') - 0.1, { y: 10 });

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
