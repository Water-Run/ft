// 第 09 章 出错怎么办（第 4 轮重做）。
// 一、两次检查点之间：修改在内存里，数据文件还没有；进程这时被杀，找得回来吗？
// 二、日志：每次修改同时记一条，新记录接在后面，每 100 毫秒同步到磁盘；默认写法写进内存就回复，j: true 等日志落盘再回复。
// 三、实验：单机 mongod，检查点之后 Alice（j: true）、Dave（不带 j），都回复成功后强制结束 → 日志里两笔（四条记录）→ 重启：回到检查点，重放日志，4097 份。
// 四、会丢多少：不带 j、回复后立刻结束，两轮各 5 次：0 次、1 次留下；j: true 或隔 300 毫秒，5 次都在 → 只是结束进程；可能丢的是最后一小段；断电另说。
// 事实：H01（60 秒、100 毫秒）、H02（日志重放）、H08（默认写法内存里确认，j: true 等磁盘上的日志）、H04（日志里的两笔，07 回显第 38–41 行）、
//       H05（recovery 完成、4097 份）、H06（两轮 0 次、1 次；j: true 与 0.3 秒 5 次都在）、H07（只测了结束进程，断电不同）。
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '09 出错怎么办');

  // ══ 一、两次检查点之间 ══
  const P1 = [];
  const memZ = h('div', 'panel gray', world); px(memZ, 120, 212, 1680, 240); P1.push(memZ);
  memZ.innerHTML = `<div style="position:absolute;left:22px;top:18px">${ico('mem', 40, K.gd2, 2.4)}</div><div style="position:absolute;left:76px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">内存 · 缓存</div>`;
  const AX0 = 260, AX1 = 1660, AY = 520;
  const axis = h('div', 'abs', world); px(axis, AX0, AY, AX1 - AX0, 3); css(axis, { background: K.gb, transformOrigin: '0 50%' }); P1.push(axis);
  const ck = [AX0 + 40, AX1 - 40].map((x, i) => { const m = h('div', 'abs', world); px(m, x - 3, AY - 40, 6, 80); css(m, { background: K.forest }); const t = tg(world, x - 90, AY + 50, i === 0 ? '检查点' : '下一个检查点', 'g'); css(t, { width: '180px', textAlign: 'center', fontSize: '28px' }); P1.push(m, t); return [m, t]; });
  const sixty = tg(world, 860, AY - 50, '60 秒', 'big'); css(sixty, { fontSize: '40px' }); P1.push(sixty);
  const datF = h('div', 'abs', world); px(datF, 140, 650, 560, 130); css(datF, { background: '#fff', border: '3px solid ' + K.gb, borderRadius: '12px' }); P1.push(datF);
  datF.innerHTML = `<div style="position:absolute;left:20px;top:16px">${ico('disk', 44, K.gd2, 2.4)}</div><div style="position:absolute;left:78px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">数据文件</div><div style="position:absolute;left:78px;top:68px;font:500 26px 'Sans SC';color:${K.gd1}">停在上一个检查点</div>`;
  show(memZ, c0, { y: 12, d: 0.5 });
  fromTo(axis, T('h1') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' });
  ck.forEach(([m, t], i) => { show(m, T('h1') + 0.2 + i * 0.4, { y: 0, s: 0.4, d: 0.4 }); show(t, T('h1') + 0.3 + i * 0.4, { y: 8, d: 0.4 }); });
  show(sixty, T('h1', '60') - 0.2, { y: 8, d: 0.4 });
  show(datF, T('h2', '数据文件') - 0.4, { y: 12, d: 0.45 });
  // 两次检查点之间的修改：在内存里一笔笔出现
  const MX = [440, 600, 760, 920, 1080];
  const dots = [], dls = [];
  const mods = MX.map((x, i) => { const e = h('div', 'abs', world); px(e, x - 60, 300, 120, 70); css(e, { background: K.mint, border: '2px solid ' + K.g1, borderRadius: '10px', font: '700 26px/66px "Sans SC"', textAlign: 'center', color: K.forest }); e.textContent = '修改'; P1.push(e);
    const d = h('div', 'abs', world); px(d, x - 8, AY - 7, 16, 16); css(d, { borderRadius: '50%', background: K.g1 }); dots.push(d);
    const l = link(ov, [[x, 372], [x, AY - 9]], 'dim', { w: 2, dashed: '4 5' }); dls.push(l);
    show(e, T('h2', '修改') - 0.6 + i * 0.25, { y: -12, d: 0.4 }); show(d, T('h2', '修改') - 0.5 + i * 0.25, { y: 0, s: 0.3, d: 0.3 }); arrowIn(l, T('h2', '修改') - 0.5 + i * 0.25, 0.3);
    return e; });
  // 进程这时被杀：轴上一道闪电，内存里的修改变成虚线问号
  const kx = 1220;
  const bolt = h('div', 'abs', world, ico('bolt', 72, K.red, 3)); px(bolt, kx - 36, AY - 90, 72, 72); P1.push(bolt);
  show(bolt, T('h3', '被杀') - 0.2, { y: -14, s: 0.6, d: 0.35 }); sfx('error', T('h3', '被杀'), { g: 0.6 });
  to(memZ, T('h3', '被杀') + 0.1, { backgroundColor: K.gl2, duration: 0.4 });
  to(mods, T('h3', '找得') - 0.3, { borderStyle: 'dashed', borderColor: K.red, backgroundColor: K.redl, color: K.redd, duration: 0.4 });
  const tP1 = T('h4') - 0.4;
  fadeOut([bolt], tP1, 0.4);
  to(memZ, tP1, { backgroundColor: K.gl3, duration: 0.4 });
  to(mods, tP1, { borderStyle: 'solid', borderColor: K.g1, backgroundColor: K.mint, color: K.forest, duration: 0.4 });
  mods.forEach((e) => textAt(e, [[0, '修改'], [T('h3', '找得') - 0.2, '？'], [tP1 + 0.2, '修改']]));

  // ══ 二、日志：每次修改记一条，接在后面；每 100 毫秒同步到磁盘（H01 H02 H03 H08） ══
  const jF = h('div', 'abs', world); px(jF, 760, 650, 1040, 130); css(jF, { background: '#fff', border: '3px solid ' + K.blue, borderRadius: '12px' });
  jF.innerHTML = `<div style="position:absolute;left:20px;top:16px;font:700 30px 'Sans SC';color:${K.blued}">日志 · <span style="font-family:Mono;font-size:26px">journal/WiredTigerLog.0000000001</span></div>`;
  show(jF, T('h4', '日志') - 0.4, { y: 12, d: 0.45 });
  const recs = MX.map((x, i) => { const r = h('div', 'abs', world); px(r, 790 + i * 116, 712, 104, 46); css(r, { background: K.bluel, border: '2px solid ' + K.blue, borderRadius: '6px', font: '600 23px/42px "Mono"', textAlign: 'center', color: K.blued }); r.textContent = '记录'; return r; });
  recs.forEach((r, i) => { tl.fromTo(r, { autoAlpha: 0, x: MX[i] - 60 - (790 + i * 116), y: 300 - 712, scale: 1 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: true }, T('h4', '每一次') + i * 0.3); });
  const glJ = gl(world, 140, 820, '日志', '每一次修改都按顺序记一条，接在后面'); css(glJ, { padding: '0 0 0 16px' }); css(glJ.querySelector('b'), { display: 'inline', marginRight: '16px' }); css(glJ.querySelector('span'), { display: 'inline' });
  show(glJ, T('h4', '日志') - 0.2, { y: 8, d: 0.45 });
  pt(world, 752, 642, 1056, 146, T('h5', '接在') - 0.2, T('h5', '100') - 0.45, K.blue);
  // 同步：一条竖线每隔一会儿扫过已经写下的记录（标「每 100 毫秒」）
  const syncL = h('div', 'abs', world); px(syncL, 780, 700, 4, 70); css(syncL, { background: K.forest });
  const syncT = tg(world, 1400, 664, '每 100 毫秒同步到磁盘', 'g'); css(syncT, { fontSize: '26px' });
  show([syncL, syncT], T('h5', '100') - 0.4, { y: 0, d: 0.4 });
  const tSy0 = T('h5', '100') - 0.2;
  F((t) => { if (t < tSy0) return; const k = Math.min(5, Math.floor((t - tSy0) / 0.7) + 1); syncL.style.transform = `translateX(${k * 116 + 6}px)`; });
  const synced = recs.map((r, i) => { to(r, tSy0 + i * 0.7 + 0.05, { backgroundColor: K.blue, color: '#fff', duration: 0.25 }); return r; });
  fadeOut([...mods, axis, ...ck.flat(), sixty, ...dots], T('h6') - 0.4, 0.4);
  dls.forEach((p) => fadeOut(p, T('h6') - 0.4, 0.4));
  // 回复「写好了」与日志落盘：两种写法比一比（H08）
  const tW = T('h6') - 0.2;
  const rows = [['默认写法', '写进内存', '就回复', T('h8', '不带')], ['j: true', '日志写进磁盘', '才回复', T('h7', 'J')]].map(([w, when, act, t], i) => {
    const g = h('div', 'abs', world); px(g, 300, 250 + i * 100, 1300, 84); css(g, { background: '#fff', border: '2px solid ' + (i ? K.blue : K.gl1), borderRadius: '12px' });
    g.innerHTML = `<div style="position:absolute;left:24px;top:20px;width:220px;font:700 32px ${i ? 'Mono' : "'Sans SC'"};color:${i ? K.blued : K.ink}">${w}</div><div style="position:absolute;left:300px;top:22px;font:500 32px 'Sans SC';color:${K.ink}">${when}<span style="color:${K.gb};margin:0 16px">→</span><b>${act}「写好了」</b></div>`;
    return { g, t };
  });
  fadeOut(memZ, tW - 0.2, 0.4);
  show(rows[0].g, T('h6', '写好了') - 0.4, { y: 12, d: 0.45 });
  textAt(rows[0].g.lastChild, [[0, `写进内存<span style="color:${K.gb};margin:0 16px">→</span><b>就回复「写好了」</b><span style="margin-left:24px;color:#970606;font-weight:700">日志不一定已经落盘</span>`]]);
  pt(world, 1040, 258, 580, 66, T('h6', '落盘') - 0.3, T('h7') - 0.1, K.red);
  show(rows[1].g, T('h7', 'J') - 0.3, { y: 12, d: 0.45 });
  const jj = tg(world, 1240, 380, 'j = journal（日志）', 'm'); css(jj, { fontSize: '26px', color: K.blued, fontWeight: 600 });
  show(jj, T('h7', '日志') - 0.3, { x: 14, y: 0, d: 0.4 });
  to(rows[1].g, T('h7b', '等') - 0.2, { backgroundColor: K.bluel, duration: 0.35 });
  to(rows[0].g, T('h8', '单机') - 0.2, { backgroundColor: K.yell, borderColor: K.yeld, duration: 0.35 });
  const tP2 = T('h9') - 0.4;
  fadeOut([rows[0].g, rows[1].g, jj, glJ, syncL, syncT, ...recs, datF], tP2, 0.45);
  fadeOut(jF, tP2, 0.45);

  // ══ 三、实验：Alice（j: true）、Dave（不带 j），然后强制结束（H04 H05） ══
  const ex = term(world, 140, 222, 1660, 300, 'mongosh · 单机的 mongod · 刚写完 4096 人', { fs: 26, lh: 42 });
  show(ex.c, tP2 + 0.3, { y: 12, d: 0.5 });
  pt(world, 132, 214, 1676, 70, T('h9', 'mongo') - 0.2, T('h10') - 0.1);
  pt(world, 1208, 332, 404, 44, T('h10', 'J') - 0.3, T('h11') - 0.2, K.blue);
  pt(world, 132, 214, 1676, 70, T('h9', '4096') - 0.2, T('h9', 'mongo') - 0.3, K.gb);
  ex.out(T('h10', '检查点') - 0.2, '<span style="color:#5C6C75">// 检查点刚做完</span>');
  ex.cmd(T('h10', 'Alice') - 0.2, 'db.users.updateOne({ <span class="k">name</span>: <span class="s">"Alice"</span> }, { <span class="k">$set</span>: { <span class="k">age</span>: <span class="n">43</span> } }, { <span class="k" style="background:#E1F7FF">writeConcern: { j: true }</span> })', 'lab&gt; ', 70);
  ex.cmd(T('h11', 'D') - 0.2, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Dave"</span>, <span class="k">age</span>: <span class="n">19</span> })   <span style="color:#5C6C75">// 不带 j</span>', 'lab&gt; ', 60);
  ex.out(T('h12', '回复') - 0.2, '<span style="color:#00684A">两笔都回复了成功</span>');
  ex.out(T('h12', '强制') - 0.3, '<span style="color:#970606">$ kill -9 mongod</span>');
  const kb = h('div', 'abs', world, ico('bolt', 72, K.red, 3)); px(kb, 1660, 330, 72, 72);
  show(kb, T('h12', '强制') - 0.1, { y: -12, s: 0.6, d: 0.35 }); sfx('error', T('h12', '强制'), { g: 0.6 });
  // 日志文件里，检查点之后的两笔（07 回显第 38–41 行）
  const jl = term(world, 140, 560, 1660, 250, '磁盘上的日志 · 检查点之后', { fs: 24, lh: 40 });
  show(jl.c, T('h13', '日志') - 0.4, { y: 12, d: 0.5 });
  const L1 = jl.out(T('h14', '一笔') - 0.3, '事务 63  row_put  文件号 88   键 c7c2  name=Alice, age=43（整份文档 47 字节）');
  const L2 = jl.out(T('h15', '一笔') - 0.3, '事务 64  row_put  文件号 88   键 cfc1  name=Dave, age=19（整份文档 46 字节）');
  const L3 = jl.out(T('h15', '三次') - 0.2, '事务 64  row_put  文件号 96   <span style="color:#5C6C75">（_id 索引）</span>');
  const L4 = jl.out(T('h15', '三次') + 0.1, '事务 64  row_put  文件号 104  <span style="color:#5C6C75">（姓名索引）</span>');
  to(L1, T('h14', '43') - 0.3, { backgroundColor: K.bluel, duration: 0.35 });
  pt(world, 156, 628, 1630, 172, T('h13', '两笔') - 0.2, T('h14') - 0.1);
  pt(world, 156, 630, 1300, 44, T('h14', '43') - 0.2, T('h15') - 0.2, K.blue);
  to([L2, L3, L4], T('h16', '赶在') - 0.3, { backgroundColor: K.mint2, duration: 0.35 });
  const caught = tg(world, 1290, 590, '不带 j，也已经写进日志文件', 'g'); css(caught, { fontSize: '26px' });
  show(caught, T('h16', '写进') - 0.3, { x: 14, y: 0, d: 0.4 });
  pt(world, 156, 670, 1300, 130, T('h16', 'Dave') - 0.2, T('h16', '写进') - 0.3);
  pt(world, 1282, 584, 470, 46, Tend('h16') + 0.3, T('h17') - 0.35);
  // 重启：回到最后一个检查点，再一条条重放（H02 H05）
  const tR = T('h17') - 0.3;
  fadeOut([ex.c, kb, caught], tR, 0.45);
  tl.to(jl.c, { y: 222 - 560, duration: 0.8, ease: 'power2.inOut' }, tR + 0.1);
  const st = h('div', 'abs', world); px(st, 140, 530, 1660, 300); css(st, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px' });
  st.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:700 30px 'Sans SC';color:${K.ink}">重启</div>` +
    [['回到最后一个检查点', '数据文件里的那一版：Alice 42，没有 Dave'], ['重放之后的日志', '事务 63、事务 64，一条条重做'], ['完成', 'Alice 43 · Dave 在 · 4097 份']].map(([a, b], i) =>
      `<div class="stp" style="position:absolute;left:${24 + i * 540}px;top:76px;width:500px;height:190px;border:2px solid ${K.gl1};border-radius:12px;padding:18px 22px;box-sizing:border-box"><div style="font:700 30px 'Sans SC';color:${K.ink}"><span style="display:inline-block;width:40px;height:40px;border-radius:50%;background:${K.ink};color:#fff;font:700 24px/40px Inter;text-align:center;margin-right:12px">${i + 1}</span>${a}</div><div style="margin-top:16px;font:500 26px/1.45 'Sans SC';color:${K.gd2};white-space:normal">${b}</div></div>`).join('');
  show(st, tR + 0.4, { y: 14, d: 0.5 });
  const stp = [...st.querySelectorAll('.stp')];
  [T('h17', '回到'), T('h18', '重放'), T('h19', 'Alice')].forEach((t, i) => to(stp[i], t - 0.3, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 }));
  pt(world, 156, 598, 520, 206, T('h17', '检查点') - 0.2, T('h18') - 0.1);
  pt(world, 1236, 598, 520, 206, T('h19', '4097') + 0.1, T('h20') - 0.3);
  to(L1, T('h18', '一条') - 0.3, { backgroundColor: K.mint2, duration: 0.3 });
  to([L2, L3, L4], T('h18', '一条') + 0.2, { backgroundColor: K.mint2, duration: 0.3 });
  const rec = tg(world, 164, 850, '<span style="font-family:Mono">"msg":"recovery was completed successfully …"</span>', ''); css(rec, { fontSize: '24px', color: K.forest });
  show(rec, T('h19', '4097') - 0.4, { y: 8, d: 0.45 });

  // ══ 四、不带 j 什么时候会丢（H06 H07） ══
  const tD = T('h20') - 0.4;
  fadeOut([jl.c, st, rec], tD, 0.45);
  const q = h('div', 'abs', world); px(q, 140, 228, 1660); css(q, { font: '700 34px "Sans SC"', color: K.ink });
  q.innerHTML = '<span class="sg">不带 j 写一笔</span> <span style="color:#889397">→</span> <span class="sg">回复成功</span> <span style="color:#889397">→</span> <span class="sg">立刻 <span style="font-family:Mono;color:#970606">kill -9</span></span> <span style="color:#889397">→</span> <span class="sg">重启，看还在不在</span>';
  set(q, s.start, { autoAlpha: 0 }); show(q, T('h20', '不带') - 0.2, { y: 10, d: 0.5 });
  pt(world, 130, 216, 1500, 64, T('h20', '什么时候') - 0.2, T('h21', '写一笔') - 0.3);
  const sgs = [...q.querySelectorAll('.sg')];
  [T('h21', '写一笔'), T('h21', '回复'), T('h21', '立刻'), T('h22', '两轮')].forEach((t, i) => pt(world, 140 + sgs[i].offsetLeft - 10, 220, sgs[i].offsetWidth + 20, 58, t - 0.2, t + 1.0));
  // 四行，每行五次：■ 留下、□ 丢了
  const RW = [['不带 j，立刻结束 · 第一轮', [0, 0, 0, 0, 0], T('h22', '一轮') - 0.3], ['不带 j，立刻结束 · 第二轮', [1, 0, 0, 0, 0], T('h22', '另一轮') - 0.3], ['j: true，立刻结束', [1, 1, 1, 1, 1], T('h24', 'J') - 0.3], ['不带 j，隔 300 毫秒再结束', [1, 1, 1, 1, 1], T('h24', '隔') - 0.2]];
  const rowEls = RW.map(([lab, xs, t], i) => {
    const g = h('div', 'abs', world); px(g, 140, 320 + i * 96, 1660, 80);
    const l = h('div', 'abs', g, lab); css(l, { left: 0, top: '20px', font: '700 30px "Sans SC"', color: i >= 2 ? K.forest : K.ink });
    xs.forEach((v, k) => { const b = h('div', 'abs', g); css(b, { left: 560 + k * 96 + 'px', top: '6px', width: '76px', height: '68px', borderRadius: '10px', background: v ? K.spring : K.redl, border: '3px ' + (v ? 'solid ' + K.forest : 'dashed ' + K.red) });
      b.innerHTML = v ? ico('check', 48, K.forest, 4).replace('<svg', '<svg style="margin:7px 11px"') : ico('x', 44, K.red, 4).replace('<svg', '<svg style="margin:9px 13px"'); show(b, t + 0.15 + k * 0.08, { y: 0, s: 0.6, d: 0.3 }); });
    const n = h('div', 'abs', g, `留下 ${xs.reduce((a, b) => a + b, 0)} 次`); css(n, { left: '1080px', top: '20px', font: '800 32px "Inter", "Sans SC"', color: i >= 2 ? K.forest : K.redd });
    show(l, t, { x: -14, y: 0, d: 0.4 }); show(n, t + 0.6, { x: 10, y: 0, d: 0.4 });
    return g;
  });
  // 300 毫秒 > 100 毫秒一次的落盘间隔：一根 0–300 毫秒的尺子
  const rl = h('div', 'abs', world); px(rl, 300, 750, 1200, 120);
  const RX = (ms) => 40 + ms * 3.6;
  rl.innerHTML = `<div style="position:absolute;left:${RX(0)}px;top:60px;width:${RX(300) - RX(0)}px;height:3px;background:${K.gb}"></div>` +
    [0, 100, 200, 300].map((ms) => `<div style="position:absolute;left:${RX(ms) - 2}px;top:${ms ? 44 : 40}px;width:4px;height:${ms ? 34 : 42}px;background:${ms ? K.blue : K.ink}"></div><div style="position:absolute;left:${RX(ms) - 60}px;top:86px;width:120px;text-align:center;font:600 24px Mono;color:${K.gd2}">${ms} 毫秒</div>`).join('') +
    `<div style="position:absolute;left:${RX(0) - 40}px;top:6px;font:700 26px 'Sans SC';color:${K.ink}">写完</div><div style="position:absolute;left:${RX(100) + 14}px;top:6px;font:700 26px 'Sans SC';color:${K.blued}">日志落盘</div><div style="position:absolute;left:${RX(300) - 30}px;top:6px;font:700 26px Mono;color:#970606">kill</div>`;
  show(rl, T('h26', '300') - 0.4, { y: 12, d: 0.5 });
  pt(world, 682, 786, 36, 54, T('h26', '100') - 0.2, T('h27') - 0.3);
  // 只是结束进程：可能丢的只有最后一小段——回复了成功、还没写进日志文件的写入
  const tE = T('h27') - 0.3;
  fadeOut([q, ...rowEls, rl], tE, 0.45);
  const lane = h('div', 'abs', world); px(lane, 140, 300, 1660, 360); css(lane, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px' });
  lane.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:700 30px 'Sans SC';color:${K.ink}">写入一笔笔回复成功</div>` +
    Array.from({ length: 12 }, (_, k) => `<div class="w" style="position:absolute;left:${30 + k * 132}px;top:90px;width:116px;height:70px;border-radius:8px;background:${k < 9 ? K.bluel : K.redl};border:2px ${k < 9 ? 'solid ' + K.blue : 'dashed ' + K.red};font:600 24px/66px 'Sans SC';text-align:center;color:${k < 9 ? K.blued : K.redd}">${k < 9 ? '已进日志' : '还没进'}</div>`).join('') +
    `<div style="position:absolute;left:${30 + 9 * 132 - 10}px;top:70px;width:4px;height:120px;background:${K.red}"></div><div style="position:absolute;left:${30 + 9 * 132}px;top:34px;font:700 28px Mono;color:#970606">kill</div>` +
    `<div style="position:absolute;left:30px;top:250px;font:500 28px 'Sans SC';color:${K.gd2}">进程被强制结束时，已经写进日志文件（交给了操作系统）的都留得下</div>`;
  show(lane, tE + 0.2, { y: 12, d: 0.5 });
  const lostB = h('div', 'abs', world); px(lostB, 140 + 30 + 9 * 132 - 14, 380, 3 * 132 + 10, 96); css(lostB, { border: '4px solid ' + K.red, borderRadius: '12px' }); lostB.dataset.name = 'lost';
  show(lostB, T('h28', '最后') - 0.3, { y: 0, s: 1.04, d: 0.4 });
  const lostT = tg(world, 140 + 30 + 9 * 132 - 14, 488, '回复了成功、还没写进日志文件', 'r'); css(lostT, { fontSize: '26px' });
  show(lostT, T('h29', '已经') - 0.1, { y: 8, d: 0.4 });
  pt(world, 1316, 482, 470, 46, T('h29', '还没') - 0.2, T('h30') - 0.3, K.red);
  pt(world, 594, 780, 352, 92, T('h30', '操作系统') - 0.2, T('h30', '磁盘') - 0.2, K.yeld);
  pt(world, 1014, 780, 352, 92, T('h30', '磁盘') - 0.2, T('h31') - 0.3, K.yeld);
  pt(world, 1320, 360, 40, 140, T('h27', '强制') - 0.2, T('h28') + 0.2, K.red);
  // 断电又不同：日志文件与磁盘之间还隔着操作系统
  const pw = h('div', 'abs', world); px(pw, 140, 700, 1660, 200); css(pw, { background: K.yell, border: '2px solid ' + K.yeld, borderRadius: '14px' });
  pw.innerHTML = `<div style="position:absolute;left:24px;top:20px;font:700 30px 'Sans SC';color:${K.yeld}">断电又不同（本片没有测）</div>` +
    [['日志文件', K.bluel, K.blue], ['操作系统缓存', '#FFFFFF', K.yeld], ['磁盘', '#FFFFFF', K.gd2]].map(([n, bg, bd], i) => `<div style="position:absolute;left:${40 + i * 420}px;top:86px;width:340px;height:80px;border-radius:10px;background:${bg};border:2px solid ${bd};font:700 30px/76px 'Sans SC';text-align:center;color:${K.ink}">${n}</div>` + (i < 2 ? `<div style="position:absolute;left:${390 + i * 420}px;top:110px;font:700 36px Inter;color:${K.yeld}">→</div>` : '')).join('');
  show(pw, T('h30', '断电') - 0.3, { y: 12, d: 0.5 });
  const pwB = [...pw.children].filter((e) => e.style.width === '340px');
  to(pwB[1], T('h30', '操作系统') - 0.2, { color: K.yeld, backgroundColor: K.yell, duration: 0.35 });
  to(pwB[2], T('h30', '磁盘') - 0.2, { color: K.forest, duration: 0.35 });
  // 每一次写入都可以自己选
  const tF = T('h31') - 0.2;
  fadeOut([lane, lostB, lostT], tF, 0.45);
  tl.to(pw, { autoAlpha: 0, duration: 0.4 }, tF);
  const pick = [['默认写法', '写进内存就回复', K.gl1, K.ink], ['j: true', '等日志落盘再回复', K.blue, K.blued]].map(([a, b, bd, c], i) => {
    const e = h('div', 'abs', world); px(e, 240 + i * 760, 420, 680, 200); css(e, { background: '#fff', border: '3px solid ' + bd, borderRadius: '16px' });
    e.innerHTML = `<div style="position:absolute;left:30px;top:30px;font:800 44px ${i ? 'Mono' : "'Sans SC'"};color:${c}">${a}</div><div style="position:absolute;left:30px;top:110px;font:500 34px 'Sans SC';color:${K.gd2}">${b}</div>`;
    show(e, tF + 0.3 + i * 0.25, { y: 14, d: 0.5 });
    return e;
  });
  pt(world, 230, 410, 700, 220, T('h31', '要不要') - 0.3, T('h31', '落盘') - 0.2);
  pt(world, 990, 410, 700, 220, T('h31', '落盘') - 0.2, s.end - 0.2, K.blue);
  beat(world, T('h1', '60') - 0.1, 250, 470, 1430, 110, 1.2);
  beat(world, Tend('h12') + 0.1, 156, 250, 1600, 250, 1.0, K.red);
  beat(world, Tend('h31') + 0.2, 230, 410, 1460, 220, 1.0, K.gb);
  beat(world, T('h2', '数据文件') - 0.1, 132, 642, 576, 146, 1.2);
  beat(world, T('h7', '日志') - 0.1, 292, 342, 1316, 100, 1.2, K.blue);
  beat(world, T('h7b', '磁盘') - 0.1, 752, 642, 1056, 146, 1.2, K.blue);
  beat(world, T('h10', '年龄') - 0.1, 156, 326, 1600, 46, 1.2);
  beat(world, T('h11', 'Dave') - 0.1, 156, 368, 1100, 46, 1.2);
  beat(world, Tend('h11') + 0.2, 156, 250, 1600, 170, 1.0, K.gb);
  beat(world, T('h22') + 0.1, 140, 312, 1660, 200, 1.0, K.gb);
  beat(world, Tend('h24') + 0.1, 140, 504, 1300, 180, 1.3);
  beat(world, T('h26', '日志') - 0.1, 300, 744, 1200, 130, 1.2, K.blue);
  beat(world, T('h27', '结束') - 0.1, 160, 382, 1200, 86, 1.2, K.blue);
  beat(world, T('h28', '可能') - 0.1, 1316, 374, 416, 104, 1.2, K.red);
  beat(world, T('h30', '日志') - 0.1, 180, 786, 340, 80, 1.0, K.blue);
  const or = tg(world, 940, 494, '或', 'big'); css(or, { fontSize: '40px' }); show(or, tF + 0.5, { y: 8, d: 0.4 });
});
