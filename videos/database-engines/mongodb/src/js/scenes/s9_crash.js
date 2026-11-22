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
  chrome(root, s, '08 出错怎么办');

  // ══ 一、两次检查点之间 ══
  const P1 = [];
  const memZ = h('div', 'panel gray', world); px(memZ, 120, 212, 1680, 240); P1.push(memZ);
  memZ.innerHTML = `<div style="position:absolute;left:22px;top:18px">${ico('mem', 40, K.gd2, 2.4)}</div><div style="position:absolute;left:76px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">内存 · 缓存</div>`;
  const AX0 = 260, AX1 = 1660, AY = 520;
  const axis = h('div', 'abs', world); px(axis, AX0, AY, AX1 - AX0, 3); css(axis, { background: K.gb, transformOrigin: '0 50%' }); P1.push(axis);
  const ck = [AX0 + 40, AX1 - 40].map((x, i) => { const m = h('div', 'abs', world); px(m, x - 3, AY - 40, 6, 80); css(m, { background: K.forest }); const t = tg(world, x - 90, AY + 50, i === 0 ? '检查点' : '下一个检查点', 'g'); css(t, { textAlign: 'center', fontSize: '28px', lineHeight: '48px', color: '#FFFFFF', background: K.forest, borderRadius: '10px', padding: '0 14px' }); P1.push(m, t); return [m, t]; });
  const sixty = tg(world, 860, AY - 62, '60 秒', 'big'); css(sixty, { fontSize: '38px', lineHeight: '60px', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 20px' }); P1.push(sixty);
  const datF = h('div', 'abs', world); px(datF, 140, 650, 560, 130); css(datF, { background: '#fff', border: '3px solid ' + K.gb, borderRadius: '12px' }); P1.push(datF);
  datF.innerHTML = `<div style="position:absolute;left:20px;top:16px">${ico('disk', 44, K.gd2, 2.4)}</div><div style="position:absolute;left:78px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">数据文件</div><div style="position:absolute;left:78px;top:68px;font:500 26px 'Sans SC';color:${K.gd1}">停在上一个检查点</div>`;
  show(memZ, c0, { y: 12, d: 0.5 });
  fromTo(axis, T('h1') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' });
  ck.forEach(([m, t], i) => { show(m, T('h1') + 0.2 + i * 0.4, { y: 0, s: 0.4, d: 0.4 }); show(t, T('h1') + 0.3 + i * 0.4, { y: 8, d: 0.4 }); });
  show(sixty, T('h1', '60') - 0.2, { y: 8, d: 0.4 });
  show(datF, T('h2', '数据文件') - 0.4, { y: 12, d: 0.45 }); to(datF, T('h2', '数据文件') + 0.3, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.4 });
  // 两次检查点之间的修改：在内存里一笔笔出现
  const MX = [440, 600, 760, 920, 1080];
  const dots = [], dls = [];
  const mods = MX.map((x, i) => { const e = h('div', 'abs', world); px(e, x - 60, 300, 120, 70); css(e, { background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/66px "Sans SC"', textAlign: 'center', color: '#FFFFFF' }); e.textContent = '修改'; P1.push(e);
    const d = h('div', 'abs', world); px(d, x - 8, AY - 7, 16, 16); css(d, { borderRadius: '50%', background: K.g1 }); dots.push(d);
    const l = link(ov, [[x, 372], [x, AY - 9]], 'dim', { w: 2, dashed: '4 5' }); dls.push(l);
    show(e, T('h2', '修改') - 0.6 + i * 0.25, { y: -12, d: 0.4 }); show(d, T('h2', '修改') - 0.5 + i * 0.25, { y: 0, s: 0.3, d: 0.3 }); arrowIn(l, T('h2', '修改') - 0.5 + i * 0.25, 0.3);
    return e; });
  // 进程这时被杀：轴上一道闪电，内存里的修改变成虚线问号
  const kx = 1220;
  const bolt = h('div', 'abs', world, ico('bolt', 72, K.red, 3)); px(bolt, kx - 36, AY - 90, 72, 72); P1.push(bolt);
  show(bolt, T('h3', '被杀') - 0.2, { y: -14, s: 0.6, d: 0.35 }); sfx('error', T('h3', '被杀'), { g: 0.6 });
  to(memZ, T('h3', '被杀') + 0.1, { backgroundColor: K.gl2, duration: 0.4 });
  to(mods, T('h3', '找得') - 0.3, { borderColor: K.red, backgroundColor: K.red, color: '#FFFFFF', duration: 0.4 });
  const tP1 = T('h4') - 0.4;
  fadeOut([bolt], tP1, 0.4);
  to(memZ, tP1, { backgroundColor: K.gl3, duration: 0.4 }); to(datF, tP1, { backgroundColor: '#FFFFFF', borderColor: K.gb, duration: 0.4 });
  to(mods, tP1, { borderColor: K.forest, backgroundColor: K.forest, color: '#FFFFFF', duration: 0.4 });
  mods.forEach((e) => textAt(e, [[0, '修改'], [T('h3', '找得') - 0.2, '？'], [tP1 + 0.2, '修改']]));

  // ══ 二、日志：每次修改记一条，接在后面；每 100 毫秒同步到磁盘（H01 H02 H03 H08） ══
  const jF = h('div', 'abs', world); px(jF, 760, 650, 1040, 130); css(jF, { background: K.bluel, border: '3px solid ' + K.blue, borderRadius: '12px' });
  jF.innerHTML = `<div style="position:absolute;left:20px;top:16px;font:700 30px 'Sans SC';color:${K.blued}">日志 · <span style="font-family:Mono;font-size:26px">WiredTigerLog.0000000001</span></div>`;
  show(jF, T('h4', '日志') - 0.4, { y: 12, d: 0.45 });
  const recs = MX.map((x, i) => { const r = h('div', 'abs', world); px(r, 790 + i * 116, 712, 104, 46); css(r, { background: K.blue, border: '2px solid ' + K.blue, borderRadius: '6px', font: '600 23px/42px "Mono"', textAlign: 'center', color: '#FFFFFF' }); r.textContent = '记录'; return r; });
  recs.forEach((r, i) => { tl.fromTo(r, { autoAlpha: 0, x: MX[i] - 60 - (790 + i * 116), y: 300 - 712, scale: 1 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: true }, T('h4', '每一次') + i * 0.3); });
  const glJ = gl(world, 140, 820, '日志', '每一次修改都按顺序记一条，接在后面'); css(glJ, { padding: '0 0 0 16px' }); css(glJ.querySelector('b'), { display: 'inline', marginRight: '16px' }); css(glJ.querySelector('span'), { display: 'inline' });
  show(glJ, T('h4', '日志') - 0.2, { y: 8, d: 0.45 });
  // 同步：一条竖线每隔一会儿扫过已经写下的记录（标「每 100 毫秒」）
  const syncL = h('div', 'abs', world); px(syncL, 780, 700, 4, 70); css(syncL, { background: K.forest });
  const syncT = tg(world, 1400, 664, '每 100 毫秒同步到磁盘', 'g'); css(syncT, { fontSize: '30px', lineHeight: '54px', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '0 14px', top: '700px' });
  show(syncL, T('h5', '默认') - 0.2, { y: 0, d: 0.4 }); show(syncT, T('h5', '100') - 0.2, { y: 6, d: 0.4 }); to(jF, T('h5', '新记录') - 0.2, { backgroundColor: '#CFE5FF', duration: 0.4 }); to(recs[recs.length - 1], T('h5', '后面') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); to(jF, T('h5', '同步') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 });
  const tSy0 = T('h5', '100') - 0.2;
  F((t) => { if (t < tSy0) return; const k = Math.min(5, Math.floor((t - tSy0) / 0.7) + 1); syncL.style.transform = `translateX(${k * 116 + 6}px)`; });
  const synced = recs.map((r, i) => { to(r, tSy0 + i * 0.7 + 0.05, { backgroundColor: K.forest, borderColor: K.forest, color: '#fff', duration: 0.25 }); return r; });
  fadeOut([...mods, axis, ...ck.flat(), sixty, ...dots], T('h6') - 0.4, 0.4);
  dls.forEach((p) => fadeOut(p, T('h6') - 0.4, 0.4));
  // 回复「写好了」与日志落盘：两种写法比一比（H08）
  const tW = T('h6') - 0.2;
  const rows = [['默认写法', '写进内存', '就回复', T('h8', '不带')], ['j: true', '日志写进磁盘', '才回复', T('h7', 'J')]].map(([w, when, act, t], i) => {
    const g = h('div', 'abs', world); px(g, 300, 250 + i * 100, 1300, 84); css(g, { background: '#fff', border: '2px solid ' + (i ? K.blue : K.gl1), borderRadius: '12px' });
    g.innerHTML = `<div style="position:absolute;left:24px;top:20px;width:220px;font:700 32px ${i ? 'Mono' : "'Sans SC'"};color:${i ? K.blued : K.ink}">${w}</div><div style="position:absolute;left:300px;top:22px;font:500 32px 'Sans SC';color:${K.ink}">${when}<span style="color:${K.gd2};margin:0 16px">→</span><b>${act}「写好了」</b></div>`;
    return { g, t };
  });
  fadeOut(memZ, tW - 0.2, 0.4);
  show(rows[0].g, T('h6', '写好了') - 0.4, { y: 12, d: 0.45 });
  textAt(rows[0].g.lastChild, [[0, `写进内存<span style="color:${K.gd2};margin:0 16px">→</span><b>就回复「写好了」</b>`], [T('h6', '不一定') - 0.2, `写进内存<span style="color:${K.gd2};margin:0 16px">→</span><b>就回复「写好了」</b><span style="margin-left:24px;color:#FFFFFF;background:#DB3030;border-radius:8px;padding:2px 14px;font-weight:700">日志不一定已经落盘</span>`]]);
  to(rows[0].g, T('h6', '落盘') - 0.2, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 });
  set(rows[1].g, s.start, { backgroundColor: '#E6F1FF' }); show(rows[1].g, T('h7', 'J') - 0.3, { y: 12, d: 0.45 });
  const jj = tg(world, 1240, 380, 'j = journal（日志）', 'm'); css(jj, { fontSize: '30px', lineHeight: '56px', color: '#FFFFFF', background: K.blue, borderRadius: '10px', padding: '0 18px', fontWeight: 600 });
  show(jj, T('h7', '日志') - 0.3, { x: 14, y: 0, d: 0.4 });
  to(rows[1].g, T('h7b', '等') - 0.2, { backgroundColor: '#9CCBFF', duration: 0.35 }); to(rows[1].g.firstChild, T('h7b', '等') - 0.2, { color: K.ink, duration: 0.35 });
  to(rows[1].g, T('h8', '不带') - 0.2, { opacity: 0.4, duration: 0.45 }); to(rows[0].g, T('h8', '单机') - 0.2, { backgroundColor: '#FCD97A', borderColor: K.yeld, duration: 0.35 });
  to(rows[0].g.lastChild, T('h8', '内存') - 0.2, { color: K.yeld, duration: 0.35 });
  const tP2 = T('h9') - 0.4;
  fadeOut([rows[0].g, rows[1].g, jj, glJ, syncL, syncT, ...recs, datF], tP2, 0.45);
  fadeOut(jF, tP2, 0.45);

  // ══ 三、实验：Alice（j: true）、Dave（不带 j），然后强制结束（H04 H05） ══
  const ex = term(world, 140, 222, 1660, 300, 'mongosh · 单机的 mongod · 刚写完 4096 人', { fs: 26, lh: 42 });
  show(ex.c, tP2 + 0.3, { y: 12, d: 0.5 });
  const exL0 = ex.out(T('h9', '4096') - 0.2, '');
  textAt(exL0, [[0, '<span style="color:#5C6C75">// 先写好 4096 人，建好姓名索引</span>'], [T('h10', '检查点') - 0.2, '<span style="color:#5C6C75">// 先写好 4096 人，建好姓名索引；检查点刚做完</span>']]);
  const exA = ex.cmd(T('h10', 'Alice') - 0.2, 'db.users.updateOne({ <span class="k">name</span>: <span class="s">"Alice"</span> }, { <span class="k">$set</span>: { <span class="k">age</span>: <span class="n">43</span> } }, { <span class="k" style="background:#E1F7FF">writeConcern: { j: true }</span> })', 'lab&gt; ', 70);
  to(exA, T('h10', 'J') - 0.1, { color: K.blued, backgroundColor: '#CFE5FF', duration: 0.35 });
  ex.cmd(T('h11', 'D') - 0.2, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Dave"</span>, <span class="k">age</span>: <span class="n">19</span> })   <span style="color:#5C6C75">// 不带 j</span>', 'lab&gt; ', 60);
  const solo = h('div', 'abs', world); px(solo, 140, 560, 1660, 150); css(solo, { background: '#FFFFFF', border: '3px solid ' + K.ink, borderRadius: '14px' });
  solo.innerHTML = `<div style="position:absolute;left:28px;top:44px">${ico('server', 60, K.forest, 2.4)}</div><div style="position:absolute;left:112px;top:30px;font:700 40px Mono;color:${K.ink}">mongod</div><div style="position:absolute;left:112px;top:88px;font:500 28px 'Sans SC';color:${K.gd1}">单机，不带副本集 · users 里 4096 份</div>`;
  show(solo, T('h9', 'mongo') - 0.2, { y: 14, d: 0.5 }); fadeOut(solo, T('h13', '日志') - 0.6, 0.4);
  const ok2 = ex.out(T('h12', '回复') - 0.2, '<span style="color:#FFFFFF">两笔都回复了成功</span>'); css(ok2, { background: K.forest, borderRadius: '6px', padding: '0 10px', display: 'inline-block' });
  const kl9 = ex.out(T('h12', '强制') - 0.3, '<span style="color:#FFFFFF">$ kill -9 mongod</span>'); css(kl9, { background: K.red, borderRadius: '6px', padding: '0 10px', display: 'inline-block' });
  to(solo, T('h10', '年龄') - 0.2, { backgroundColor: K.mint, borderColor: K.forest, duration: 0.4 });
  to(solo, T('h12', '强制') - 0.1, { backgroundColor: K.red, borderColor: K.red, duration: 0.4 }); to([solo.children[1], solo.children[2]], T('h12', '强制') - 0.1, { color: '#FFFFFF', duration: 0.4 }); to(solo.querySelector('svg'), T('h12', '强制') - 0.1, { attr: { stroke: '#FFFFFF' }, duration: 0.4 });
  res(solo, 760, 44, 'users · 4096 份', 'ink', T('h9', '4096') - 0.2, { fs: 30, lh: 60, out: T('h10', 'Alice') - 0.4 });
  const ckC = res(solo, 1372, 44, '检查点刚做完', 'new', T('h10', '检查点') - 0.2, { fs: 32, lh: 60 });
  textAt(ckC, [[0, '检查点刚做完'], [T('h12', '回复') - 0.2, '两笔都回复成功']]); to(ckC, T('h12', '回复') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  const aC2 = res(solo, 760, 44, 'Alice · 改年龄', 'new', T('h10', 'Alice') - 0.2, { fs: 30, lh: 60 }); textAt(aC2, [[0, 'Alice · 改年龄'], [T('h10', '加了') - 0.2, 'Alice · j: true']]); to(aC2, T('h10', '加了') - 0.2, { backgroundColor: K.blue, duration: 0.35 });
  const dC2 = res(solo, 1090, 44, 'Dave · 注册', 'new', T('h11', 'D') - 0.2, { fs: 30, lh: 60 }); textAt(dC2, [[0, 'Dave · 注册'], [T('h11', 'j') - 0.2, 'Dave · 不带 j']]); to(dC2, T('h11', 'j') - 0.2, { backgroundColor: K.gd1, duration: 0.35 });
  const kb = h('div', 'abs', world, ico('bolt', 48, K.red, 3)); px(kb, 440, 462, 48, 48);
  show(kb, T('h12', '强制') - 0.1, { y: -12, s: 0.6, d: 0.35 }); sfx('error', T('h12', '强制'), { g: 0.6 });
  // 日志文件里，检查点之后的两笔（07 回显第 38–41 行）
  const jl = term(world, 140, 560, 1660, 290, '磁盘上的日志 · 检查点之后', { fs: 28, lh: 46 });
  show(jl.c, T('h13', '日志') - 0.4, { y: 12, d: 0.5 });
  to(ex.c, T('h13', '两笔') - 0.2, { opacity: 0.45, duration: 0.45 });
  const L1 = jl.out(T('h14', '一笔') - 0.3, '事务 63  row_put  文件号 88   键 c7c2  name=Alice, age=43（整份文档 47 字节）');
  const L2 = jl.out(T('h15', '一笔') - 0.3, '事务 64  row_put  文件号 88   键 cfc1  name=Dave, age=19（整份文档 46 字节）'); set(L2, s.start, { backgroundColor: K.gd1, color: '#FFFFFF' });
  const L3 = jl.out(T('h15', '三次') - 0.2, '事务 64  row_put  文件号 96   <span style="opacity:.75">（_id 索引）</span>');
  const L4 = jl.out(T('h15', '三次') + 0.1, '事务 64  row_put  文件号 104  <span style="opacity:.75">（姓名索引）</span>');
  to(L1, T('h14', '43') - 0.3, { backgroundColor: K.bluel, color: K.ink, duration: 0.35 });
  to(L1, T('h14', '整份') - 0.2, { color: '#FFFFFF', backgroundColor: K.blue, duration: 0.35 });
  to([L2, L3, L4], T('h15', '三次') - 0.1, { color: '#FFFFFF', backgroundColor: K.gd1, duration: 0.35 });
  to([L2, L3, L4], T('h16', 'Dave') - 0.2, { color: '#FFFFFF', backgroundColor: K.forest, duration: 0.35 });
  fadeOut(kb, Tend('h16') + 0.1, 0.4);
  to([L2, L3, L4], T('h16', '赶在') - 0.3, { backgroundColor: K.mint2, color: K.ink, duration: 0.35 });
  const caught = tg(world, 1290, 590, '不带 j，也已经写进日志文件', 'g'); css(caught, { fontSize: '26px', lineHeight: '48px', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '0 14px' });
  show(caught, T('h16', '写进') - 0.3, { x: 14, y: 0, d: 0.4 });
  // 重启：回到最后一个检查点，再一条条重放（H02 H05）
  const tR = T('h17') - 0.3;
  fadeOut(ex.c, Tend('h16') + 0.3, 0.45); fadeOut(caught, tR, 0.45);
  tl.to(jl.c, { y: 222 - 560, duration: 0.8, ease: 'power2.inOut' }, tR + 0.1);
  const st = h('div', 'abs', world); px(st, 140, 530, 1660, 300); css(st, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px' });
  st.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:700 30px 'Sans SC';color:${K.ink}">重启</div>` +
    [['回到最后一个检查点', '数据文件里的那一版：Alice 42，没有 Dave'], ['重放之后的日志', '事务 63、事务 64，一条条重做'], ['完成', 'Alice 43 · Dave 在 · 4097 份']].map(([a, b], i) =>
      `<div class="stp" style="position:absolute;left:${24 + i * 540}px;top:76px;width:500px;height:190px;border:2px solid ${K.gl1};border-radius:12px;padding:18px 22px;box-sizing:border-box"><div style="font:700 30px 'Sans SC';color:${K.ink}"><span style="display:inline-block;width:40px;height:40px;border-radius:50%;background:${K.ink};color:#fff;font:700 24px/40px Inter;text-align:center;margin-right:12px">${i + 1}</span>${a}</div><div style="margin-top:16px;font:500 26px/1.45 'Sans SC';color:${K.gd2};white-space:normal">${b}</div></div>`).join('');
  show(st, tR + 0.4, { y: 14, d: 0.5 });
  tl.to(jl.c, { opacity: 0.45, duration: 0.4 }, Tend('h17') + 0.1); tl.to(jl.c, { opacity: 1, duration: 0.3 }, T('h18', '重放') - 0.3);
  const stp = [...st.querySelectorAll('.stp')];
  set(stp, s.start, { autoAlpha: 0 });
  [T('h17', '回到'), T('h18', '重放'), T('h19', 'Alice')].forEach((t, i) => show(stp[i], t - 0.5, { y: 10, d: 0.4 }));
  [T('h17', '回到'), T('h18', '重放'), T('h19', 'Alice')].forEach((t, i) => { to(stp[i], t - 0.3, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 }); to(stp[i].firstChild, t - 0.3, { color: K.forest, duration: 0.35 }); });
  to(stp[2], T('h19', '一份') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, color: '#FFFFFF', duration: 0.35 }); classAt(stp[2], 'inv', T('h19', '一份') - 0.2);
  to([L1, L2, L3, L4], T('h18', '重放') - 0.2, { color: K.ink, backgroundColor: K.spring, duration: 0.35 });
  to([L2, L3, L4], T('h18', '一条') + 0.2, { backgroundColor: K.mint2, duration: 0.3 });
  const rec = tg(world, 164, 850, '<span style="font-family:Mono">"msg":"recovery was completed successfully …"</span>', ''); css(rec, { fontSize: '24px', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '4px 14px' });
  show(rec, T('h19', '4097') - 0.4, { y: 8, d: 0.45 });

  // ══ 四、不带 j 什么时候会丢（H06 H07） ══
  const tD = T('h20') - 0.4;
  fadeOut(jl.c, tD, 0.45); fadeOut([st, rec], T('h20', '会丢') - 0.2, 0.45);
  const q = h('div', 'abs', world); px(q, 140, 228, 1660); css(q, { font: '700 34px "Sans SC"', color: K.ink, display: 'flex', gap: '14px', alignItems: 'baseline' });
  q.innerHTML = '<span class="sg" style="background:#5C6C75;color:#fff;border-radius:10px;padding:0 14px">不带 j 写一笔</span> <span class="ar" style="color:#5C6C75">→</span> <span class="sg" style="background:#5C6C75;color:#fff;border-radius:10px;padding:0 14px">回复成功</span> <span class="ar" style="color:#5C6C75">→</span> <span class="sg" style="background:#5C6C75;color:#fff;border-radius:10px;padding:0 14px">立刻 <span style="font-family:Mono;color:#FFFFFF">kill -9</span></span> <span class="ar" style="color:#5C6C75">→</span> <span class="sg" style="background:#001E2B;color:#fff;border-radius:10px;padding:0 14px">重启，看还在不在</span>';
  set(q, s.start, { autoAlpha: 0 }); show(q, T('h20', '不带') - 0.2, { y: 10, d: 0.5 });
  tl.fromTo(q, { top: '428px', fontSize: '44px' }, { top: '228px', fontSize: '34px', duration: 0.7, ease: 'power2.inOut', immediateRender: true }, T('h22', '一轮') - 0.9);   // 用 top 与字号，不和 show() 的位移、缩放打架
  const sgs = [...q.querySelectorAll('.sg')], ars = [...q.querySelectorAll('.ar')];
  set([...sgs.slice(1), ...ars], s.start, { autoAlpha: 0 });
  [T('h21', '回复'), T('h21', '立刻'), T('h22', '两轮')].forEach((t, i) => { show(ars[i], t - 0.35, { x: -8, y: 0, d: 0.3 }); show(sgs[i + 1], t - 0.25, { x: -10, y: 0, d: 0.4 }); });
  to(sgs[0], T('h20', '会丢') - 0.2, { backgroundColor: K.red, duration: 0.35 }); to(sgs[2], T('h21', '结束') - 0.2, { backgroundColor: K.red, duration: 0.35 });
  // 四行，每行五次：■ 留下、□ 丢了
  const RW = [['不带 j，立刻结束 · 第一轮', [0, 0, 0, 0, 0], T('h22', '一轮') - 0.3], ['不带 j，立刻结束 · 第二轮', [1, 0, 0, 0, 0], T('h22', '另一轮') - 0.3], ['j: true，立刻结束', [1, 1, 1, 1, 1], T('h24', 'J') - 0.3], ['不带 j，隔 300 毫秒再结束', [1, 1, 1, 1, 1], T('h24', '隔') - 0.2]];
  const rowEls = RW.map(([lab, xs, t], i) => {
    const g = h('div', 'abs', world); px(g, 140, 320 + i * 96, 1660, 80);
    const l = h('div', 'abs', g, lab); css(l, { left: 0, top: '20px', font: '700 30px "Sans SC"', color: i >= 2 ? K.forest : K.ink });
    xs.forEach((v, k) => { const b = h('div', 'abs', g); css(b, { left: 560 + k * 96 + 'px', top: '6px', width: '76px', height: '68px', borderRadius: '10px', background: v ? K.forest : K.red, border: '3px solid ' + (v ? K.forest : K.red) });
      b.innerHTML = v ? ico('check', 48, '#FFFFFF', 4).replace('<svg', '<svg style="margin:7px 11px"') : ico('x', 44, '#FFFFFF', 4).replace('<svg', '<svg style="margin:9px 13px"'); show(b, t + 0.15 + k * 0.08, { y: 0, s: 0.6, d: 0.3 }); });
    const n = h('div', 'abs', g, `留下 ${xs.reduce((a, b) => a + b, 0)} 次`); css(n, { left: '1080px', top: '20px', font: '800 32px "Inter", "Sans SC"', color: i >= 2 ? K.forest : K.redd });
    show(l, t, { x: -14, y: 0, d: 0.4 }); show(n, t + 0.6, { x: 10, y: 0, d: 0.4 });
    return g;
  });
  // 300 毫秒 > 100 毫秒一次的落盘间隔：一根 0–300 毫秒的尺子
  const rl = h('div', 'abs', world); px(rl, 300, 750, 1200, 120);
  const RX = (ms) => 40 + ms * 3.6;
  rl.innerHTML = `<div style="position:absolute;left:${RX(0)}px;top:60px;width:${RX(300) - RX(0)}px;height:3px;background:${K.gb}"></div><div class="seg1" style="position:absolute;left:${RX(0)}px;top:50px;width:${RX(100) - RX(0)}px;height:22px;background:${K.blue};border-radius:4px"></div><div class="seg3" style="position:absolute;left:${RX(100)}px;top:50px;width:${RX(300) - RX(100)}px;height:22px;background:${K.gd1};border-radius:4px"></div>` +
    [0, 100, 200, 300].map((ms) => `<div style="position:absolute;left:${RX(ms) - 2}px;top:${ms ? 44 : 40}px;width:4px;height:${ms ? 34 : 42}px;background:${ms ? K.blue : K.ink}"></div><div style="position:absolute;left:${RX(ms) - 60}px;top:86px;width:120px;text-align:center;font:600 24px Mono;color:${K.gd2}">${ms} 毫秒</div>`).join('') +
    `<div style="position:absolute;left:${RX(0) - 40}px;top:6px;font:700 26px 'Sans SC';color:${K.ink}">写完</div><div class="jl1" style="position:absolute;left:${RX(100) + 14}px;top:6px;font:700 26px 'Sans SC';color:${K.blued}">日志落盘</div><div class="k3" style="position:absolute;left:${RX(300) - 30}px;top:6px;font:700 26px Mono;color:#970606">kill</div>`;
  show(rl, T('h26', '300') - 0.4, { y: 12, d: 0.5 });
  const jl1 = rl.querySelector('.jl1'), k3 = rl.querySelector('.k3'), seg1 = rl.querySelector('.seg1'), seg3 = rl.querySelector('.seg3');
  set([seg1, seg3], s.start, { autoAlpha: 0 }); show(seg1, T('h26', '100') - 0.2, { y: 0, d: 0.35 }); show(seg3, T('h26', '300') - 0.1, { y: 0, d: 0.35 }); to(seg3, T('h26', '超过') - 0.2, { backgroundColor: K.forest, duration: 0.35 });
  set([jl1, k3], s.start, { autoAlpha: 0 }); show(k3, T('h26', '300') - 0.1, { y: -8, d: 0.35 }); show(jl1, T('h26', '100') - 0.2, { y: -8, d: 0.35 });
  // 只是结束进程：可能丢的只有最后一小段——回复了成功、还没写进日志文件的写入
  const tE = T('h27') - 0.3;
  to(rowEls, T('h26', '间隔') - 0.2, { opacity: 0.4, duration: 0.45 });
  fadeOut([q, ...rowEls, rl], tE, 0.45);
  const lane = h('div', 'abs', world); px(lane, 140, 300, 1660, 360); css(lane, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px' });
  lane.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:700 30px 'Sans SC';color:${K.ink}">写入一笔笔回复成功</div>` +
    Array.from({ length: 12 }, (_, k) => `<div class="w" style="position:absolute;left:${30 + k * 132}px;top:90px;width:116px;height:70px;border-radius:8px;background:#FFFFFF;border:2px solid ${K.gl1};font:600 24px/66px 'Sans SC';text-align:center;color:${K.gd2}">回复成功</div>`).join('') +
    `<div class="kl" style="position:absolute;left:${30 + 12 * 132 - 8}px;top:70px;width:4px;height:120px;background:${K.red}"></div><div class="kl" style="position:absolute;left:${30 + 12 * 132 - 72}px;top:34px;font:700 28px Mono;color:#970606">kill</div>` +
    `<div class="ln" style="position:absolute;left:30px;top:242px;font:600 28px/50px 'Sans SC';color:#FFFFFF;background:#5C6C75;border-radius:10px;padding:0 16px">进程被强制结束时，已经写进日志文件（交给了操作系统）的都留得下</div>`;
  show(lane, tE + 0.2, { y: 12, d: 0.5 });
  const ws = [...lane.querySelectorAll('.w')], kls = [...lane.querySelectorAll('.kl')];
  const lnote = lane.querySelector('.ln'); set(lnote, s.start, { autoAlpha: 0 }); show(lnote, T('h28', '这种') - 0.2, { y: 8, d: 0.4 });
  set(kls, s.start, { autoAlpha: 0 }); show(kls, T('h27', '强制') - 0.2, { y: -8, d: 0.4 });
  const tLost = T('h28', '最后') - 0.2, tIn = T('h29', '日志文件') - 0.2;
  ws.forEach((w, k) => { if (k >= 9) { to(w, tLost, { backgroundColor: K.red, borderColor: K.red, color: '#FFFFFF', duration: 0.35 }); textAt(w, [[0, '回复成功'], [tLost + 0.1, '还没进']]); } else { to(w, tIn + k * 0.04, { backgroundColor: K.blue, borderColor: K.blue, color: '#FFFFFF', duration: 0.35 }); textAt(w, [[0, '回复成功'], [tIn + k * 0.04 + 0.1, '已进日志']]); } });
  const lostB = h('div', 'abs', world); px(lostB, 140 + 30 + 9 * 132 - 14, 380, 3 * 132 + 10, 96); css(lostB, { border: '4px solid ' + K.red, borderRadius: '12px' }); lostB.dataset.name = 'lost';
  show(lostB, T('h28', '丢的') - 0.3, { y: 0, s: 1.04, d: 0.4 });
  const lostT = tg(world, 140 + 30 + 9 * 132 - 14, 488, '回复了成功、还没写进日志文件', 'r'); css(lostT, { fontSize: '26px', lineHeight: '48px', color: '#FFFFFF', background: K.red, borderRadius: '8px', padding: '0 14px' });
  show(lostT, T('h29', '已经') - 0.1, { y: 8, d: 0.4 });
  // 断电又不同：日志文件与磁盘之间还隔着操作系统
  const pw = h('div', 'abs', world); px(pw, 140, 700, 1660, 200); css(pw, { background: K.yell, border: '2px solid ' + K.yeld, borderRadius: '14px' });
  pw.innerHTML = `<div style="position:absolute;left:24px;top:20px;font:700 30px 'Sans SC';color:${K.yeld}">断电又不同（本片没有测）</div>` +
    [['日志文件', K.bluel, K.blue], ['操作系统缓存', '#FFFFFF', K.yeld], ['磁盘', '#FFFFFF', K.gd2]].map(([n, bg, bd], i) => `<div style="position:absolute;left:${40 + i * 420}px;top:86px;width:340px;height:80px;border-radius:10px;background:${bg};border:2px solid ${bd};font:700 30px/76px 'Sans SC';text-align:center;color:${K.ink}">${n}</div>` + (i < 2 ? `<div style="position:absolute;left:${390 + i * 420}px;top:110px;font:700 36px Inter;color:${K.yeld}">→</div>` : '')).join('');
  show(pw, T('h30', '断电') - 0.3, { y: 12, d: 0.5 });
  const pwB = [...pw.children].filter((e) => e.style.width === '340px');
  to(pwB[0], T('h30', '日志') - 0.2, { color: '#FFFFFF', backgroundColor: K.blue, borderColor: K.blue, duration: 0.35 });
  to(pwB[1], T('h30', '操作系统') - 0.2, { color: '#FFFFFF', backgroundColor: K.yeld, borderColor: K.yeld, duration: 0.35 });
  to(pwB[2], T('h30', '磁盘') - 0.2, { color: '#FFFFFF', backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 });
  // 每一次写入都可以自己选
  const tF = T('h31') - 0.2;
  fadeOut([lane, lostB, lostT], tF, 0.45);
  tl.to(pw, { autoAlpha: 0, duration: 0.4 }, tF);
  const pick = [['默认写法', '写进内存就回复', K.gl1, K.ink], ['j: true', '等日志落盘再回复', K.blue, K.blued]].map(([a, b, bd, c], i) => {
    const e = h('div', 'abs', world); px(e, 240 + i * 760, 420, 680, 200); css(e, { background: i ? '#E6F1FF' : '#FCE9B0', border: '3px solid ' + (i ? K.blue : K.yeld), borderRadius: '16px' });
    e.innerHTML = `<div style="position:absolute;left:30px;top:30px;font:800 44px ${i ? 'Mono' : "'Sans SC'"};color:${c}">${a}</div><div style="position:absolute;left:30px;top:110px;font:500 34px 'Sans SC';color:${K.gd2}">${b}</div>`;
    show(e, tF + 0.3 + i * 0.25, { y: 14, d: 0.5 });
    return e;
  });
  const or = tg(world, 940, 494, '或', 'big'); css(or, { fontSize: '40px' }); show(or, tF + 0.5, { y: 8, d: 0.4 });
  to(pick[1], T('h31', '等日志') - 0.2, { backgroundColor: K.blue, duration: 0.35 }); to([...pick[1].children], T('h31', '等日志') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  const tAl = T('h32') - 0.25;
  fadeOut([...pick, or], tAl, 0.45);
  const al = docCard(world, 720, 380, [['name', JS('Alice')], ['age', JN(43)]], { w: 480, fs: 36 });
  show(al.c, tAl + 0.3, { y: 14, d: 0.5 });
  to(al.c, T('h32', '不再') - 0.15, { borderColor: K.red, backgroundColor: '#FFC7BC', duration: 0.5 }); to(al.c, T('h32', '网站') - 0.1, { opacity: 0.45, duration: 0.5 });
});
