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
  const sixty = tg(world, 860, AY - 86, '60 秒', 'big'); css(sixty, { fontSize: '38px', lineHeight: '60px', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 20px' }); P1.push(sixty);
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

  // ══ 二、日志：每次修改同时记一条，接在日志后面；每 100 毫秒同步到磁盘（H01 H02 H03 H08 S13） ══
  const jF = h('div', 'abs', world); px(jF, 760, 650, 1040, 130); css(jF, { background: K.bluel, border: '3px solid ' + K.blue, borderRadius: '12px' });
  jF.innerHTML = `<div style="position:absolute;left:20px;top:16px;font:700 30px 'Sans SC';color:${K.blued}">日志 · <span style="font-family:Mono;font-size:26px">journal/WiredTigerLog.0000000001</span></div>`;
  show(jF, T('h4', '日志') - 0.4, { y: 12, d: 0.45 });
  const recs = MX.map((x, i) => { const r = h('div', 'abs', world); px(r, 790 + i * 160, 716, 140, 56); css(r, { background: '#FFFFFF', border: '3px solid ' + K.blue, borderRadius: '8px', font: '600 26px/50px "Mono"', textAlign: 'center', color: K.blued }); r.textContent = '记录'; return r; });
  recs.forEach((r, i) => { tl.fromTo(r, { autoAlpha: 0, x: MX[i] - 60 - (790 + i * 160), y: 300 - 716, scale: 1 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: true }, T('h4', '每一') + i * 0.2); });
  const glJ = gl(world, 140, 806, '日志', 'WiredTiger 按顺序记下每一次修改的文件：修改先写进它，再进数据文件；<br>进程异常退出后，靠它把检查点之后的修改补回来', { key: '日志' }); glInline(glJ);   // T12 H02 H03 S13
  show(glJ, T('h4', '日志') - 0.2, { x: 12, y: 0, d: 0.45 });
  to(datF, T('h4b', '预写') - 0.2, { opacity: 0.35, duration: 0.4 });   // 先写的是日志，数据文件以后再改
  to(datF.children[1], T('h4b', 'WAL') - 0.2, { color: K.gd1, duration: 0.3 }); jF.dataset.name = 'jf'; to(jF, T('h4b', '预写') - 0.2, { backgroundColor: '#A6F4C9', borderColor: K.forest, duration: 0.35 }); to(jF.firstChild, T('h4b', 'WAL') - 0.2, { color: K.forest, duration: 0.3 });
  // h5 同步：一条竖线隔一会儿扫过已经写下的记录，扫过的记录变绿（落盘）
  to(mods, T('h4b', 'WAL') - 0.2, { opacity: 0.35, duration: 0.4 }); to(mods, T('h5', '新记录') - 0.2, { opacity: 1, duration: 0.4 });
  const mod6 = h('div', 'abs', world, '修改'); px(mod6, 1240 - 60, 300, 120, 70); css(mod6, { background: K.forest, border: '2px solid ' + K.forest, borderRadius: '10px', font: '700 26px/66px "Sans SC"', textAlign: 'center', color: '#FFFFFF' }); mod6.dataset.name = 'mod6';
  show(mod6, T('h5', '新记录') - 0.3, { y: -12, d: 0.4 });
  const rec6 = recs[0].cloneNode(true); world.appendChild(rec6); px(rec6, 790 + 5 * 160, 716, 140, 56); rec6.dataset.name = 'rec6';
  tl.fromTo(rec6, { autoAlpha: 0, x: 1240 - 60 - (790 + 5 * 160), y: 300 - 716 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: true }, T('h5', '接在') - 0.2);
  const syncL = h('div', 'abs', world); syncL.dataset.name = 'sync'; px(syncL, 780, 710, 6, 70); css(syncL, { background: K.forest });
  const tSy0 = T('h5', '同步') - 0.5;
  tl.fromTo(syncL, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, duration: 0.15, immediateRender: true }, tSy0); tl.to(syncL, { x: 6 * 160, duration: 0.35, ease: 'none' }, tSy0 + 0.1); tl.to(syncL, { autoAlpha: 0, duration: 0.2 }, tSy0 + 0.5);
  [...recs, rec6].forEach((r, i) => to(r, tSy0 + 0.1 + i * 0.05, { backgroundColor: K.forest, borderColor: K.forest, color: '#FFFFFF', duration: 0.2 }));   // 一次同步把已经记下的都写进磁盘
  fadeOut([...mods, mod6, axis, ...ck.flat(), sixty, ...dots], T('h6') - 0.4, 0.4);
  dls.forEach((p) => fadeOut(p, T('h6') - 0.4, 0.4));
  fadeOut([memZ, datF], T('h6') - 0.4, 0.4);
  // h6–h8：一笔写入从应用出发，什么时候收到「写好了」——上面是默认写法，下面是带 j 的写法（H08）
  const LN = [{ y: 300, code: 'insertOne({ … })', col: K.gd2 }, { y: 470, code: 'insertOne({ … }, { writeConcern: { <span class="jx">j<span class="jr" style="color:#C1C7C6">ournal</span></span>: true } })', col: K.blue }];
  const PX = { app: 140, mem: 760, disk: 1360 };
  const laneEls = LN.map((o, i) => {
    const g = h('div', 'abs', world); px(g, 120, o.y - 40, 1680, 140); css(g, { background: '#FFFFFF', border: '2px solid ' + K.gl1, borderRadius: '14px' });
    const c = h('div', 'abs mono', g, o.code); css(c, { left: '20px', top: '14px', font: '500 26px "Mono"', color: K.ink });
    const mz = h('div', 'abs', g); css(mz, { left: PX.mem - 160 + 'px', top: '52px', width: '380px', height: '76px', background: K.gl2, border: '2px solid ' + K.gl1, borderRadius: '10px' }); mz.dataset.name = 'mz';
    const dz = h('div', 'abs', g); css(dz, { left: PX.disk - 160 + 'px', top: '52px', width: '380px', height: '76px', background: K.gl2, border: '2px solid ' + K.gl1, borderRadius: '10px' }); dz.dataset.name = 'dz';
    const m = h('div', 'abs', g, ico('mem', 40, K.gd2, 2.4) + '<span style="vertical-align:10px;margin-left:8px">内存</span>'); css(m, { left: PX.mem - 140 + 'px', top: '66px', font: '600 26px "Sans SC"', color: K.ink });
    const d = h('div', 'abs', g, ico('disk', 40, K.blued, 2.4) + '<span style="vertical-align:10px;margin-left:8px">日志落盘</span>'); css(d, { left: PX.disk - 140 + 'px', top: '66px', font: '600 26px "Sans SC"', color: K.blued });
    return { g, c, m, d, mz, dz };
  });
  laneEls.forEach((o) => { o.g.dataset.name = 'lane'; });
  const jr = laneEls[1].c.querySelector('.jr'), jx = laneEls[1].c.querySelector('.jx');
  set(jr, s.start, { autoAlpha: 0, fontSize: '0px' });
  show(laneEls[0].g, T('h6') - 0.2, { y: 12, d: 0.45 });
  // 默认写法：小块写进内存就折返，回复「写好了」；这时日志还没落盘（同步线还没扫到）
  const tok = (y, color) => { const e = h('div', 'abs', world); e.dataset.name = 'tok'; px(e, 0, 0, 30, 30); css(e, { borderRadius: '50%', background: color, border: '3px solid #FFFFFF' }); return e; };
  const ok = (x, y) => { const e = h('div', 'abs', world, '写好了'); px(e, x, y); css(e, { font: '700 26px/44px "Sans SC"', color: '#FFFFFF', background: K.forest, borderRadius: '22px', padding: '0 16px' }); return e; };
  const t0 = tok(0, K.gd2), ok0 = ok(PX.app + 40, LN[0].y + 42);
  const tA0 = T('h6') + 0.05;
  tl.fromTo(t0, { autoAlpha: 0, x: PX.app + 380, y: LN[0].y + 52 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tA0);
  tl.to(t0, { x: PX.mem + 150, duration: 0.6, ease: 'power2.inOut' }, tA0 + 0.1); to(laneEls[0].mz, tA0 + 0.55, { backgroundColor: K.yel, borderColor: K.yeld, duration: 0.3 });   // 写进了内存
  tl.to(t0, { x: PX.app + 380, duration: 0.5, ease: 'power2.inOut' }, tA0 + 0.75);
  show(ok0, tA0 + 1.2, { y: 0, s: 0.7, d: 0.35 }); fadeOut(t0, tA0 + 1.25, 0.3);
  to(jF, T('h6', '不一定') - 0.2, { opacity: 0.35, duration: 0.4 }); to(jF, T('h7', '指的') - 0.2, { opacity: 1, duration: 0.4 });   // 这时日志还不一定在磁盘上；说到 j 指的就是日志，它再亮
  const lag0 = h('div', 'abs', world); px(lag0, PX.mem + 120, LN[0].y + 60, 420, 12); css(lag0, { height: '0px', borderTop: '6px dashed ' + K.yel, transformOrigin: '0 50%' });
  fromTo(lag0, T('h6', '不一定') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power1.inOut' });
  to(laneEls[0].d, T('h6', '落盘') - 0.2, { opacity: 0.35, duration: 0.3 });
  // h7：带上 j: true——代码里的 j 原地展开成 journal
  show(laneEls[1].g, T('h7', '写入') - 0.3, { y: 12, d: 0.45 });
  to(jx, T('h7', '指的') - 0.4, { color: K.blued, duration: 0.3 });
  tl.to(jr, { autoAlpha: 1, fontSize: '26px', duration: 0.5, ease: 'power2.out' }, T('h7', '指的') - 0.3);
  // h7b：这一笔要等日志写进磁盘才回复
  const t1 = tok(0, K.blue), ok1 = ok(PX.app + 40, LN[1].y + 42);
  const tA1 = T('h7b', '等') - 0.5;
  tl.fromTo(t1, { autoAlpha: 0, x: PX.app + 380, y: LN[1].y + 52 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tA1);
  tl.to(t1, { x: PX.mem + 150, duration: 0.5, ease: 'power2.inOut' }, tA1 + 0.1); to(laneEls[1].mz, tA1 + 0.5, { backgroundColor: K.yel, borderColor: K.yeld, duration: 0.3 });
  tl.to(t1, { x: PX.disk + 150, duration: 0.6, ease: 'power2.inOut' }, tA1 + 0.7); to(laneEls[1].dz, tA1 + 1.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.3 }); to(laneEls[1].d, tA1 + 1.2, { color: '#FFFFFF', duration: 0.3 });   // 日志写进了磁盘
  tl.to([laneEls[0].g, lag0], { autoAlpha: 0.4, duration: 0.4 }, T('h7', '写入') - 0.3); tl.to([laneEls[0].g, lag0], { autoAlpha: 1, duration: 0.4 }, T('h8', '不带') - 0.2);   // 讲带 j 的那一行时，上面那行退后
  tl.to(t1, { x: PX.app + 380, duration: 0.7, ease: 'power2.inOut' }, T('h7b', '回复') - 0.6);
  show(ok1, T('h7b', '回复') - 0.05, { y: 0, s: 0.7, d: 0.35 }); fadeOut(t1, T('h7b', '回复') + 0.1, 0.3);
  // h8：不带 j——单机上写进内存就回复（上面那一行再亮一下）
  tl.to(laneEls[1].g, { autoAlpha: 0.45, duration: 0.4 }, T('h8', '不带') - 0.2);
  to(laneEls[0].g, T('h8', '内存') - 0.2, { borderColor: K.yeld, backgroundColor: '#FFF6DA', duration: 0.35 });
  const tP2 = T('h9') - 0.4;
  fadeOut([...laneEls.map((o) => o.g), t0, t1, ok0, ok1, lag0, glJ, ...recs, rec6, jF], tP2, 0.45);
  const glSA = gl(world, 140, 786, '为什么这里换回单机', glRows([['本章要看', '已经回复「写好了」、日志还没落盘的时候进程被杀，会丢什么'], ['副本集不行', '它默认的写法（w: majority）要等日志真正写进磁盘才回复；回复过的都已经在磁盘上，杀进程也丢不了，看不出区别'], ['单机可以', '默认写进内存就回复，日志稍后才落盘，中间这一小段正是要看的']]), { key: '为什么用单机', w: 1640 });
  [glSA.querySelector('span'), ...glSA.querySelectorAll('.gr')].forEach((e) => css(e, { fontSize: '24px', lineHeight: '34px' }));   // U08 H08
  show(glSA, T('h9') + 0.2, { x: 12, y: 0, d: 0.45 }); fadeOut(glSA, T('h13') - 0.9, 0.4);   // 日志框上来之前收完

  // ══ 三、实验：Alice（j: true）、Dave（不带 j），然后强制结束（H04 H05） ══
  const ex = term(world, 140, 222, 1660, 340, 'mongosh · 单机的 mongod · 刚写完 4096 人', { fs: 26, lh: 42 });
  show(ex.c, tP2 + 0.3, { y: 12, d: 0.5 });
  const exL0 = ex.out(T('h9', '4096') - 0.2, '');
  textAt(exL0, [[0, '<span style="color:#5C6C75">// 先写好 4096 人，建好姓名索引</span>'], [T('h10', '检查点') - 0.2, '<span style="color:#5C6C75">// 先写好 4096 人，建好姓名索引；检查点刚做完</span>']]);
  const exA = ex.cmd(T('h10', 'Alice') - 0.2, 'db.users.updateOne({ <span class="k">name</span>: <span class="s">"Alice"</span> }, { <span class="k">$set</span>: { <span class="k">age</span>: <span class="n">43</span> } }, { <span class="k" style="background:#E1F7FF">writeConcern: { j: true }</span> })', 'lab&gt; ', 70);
  to(exA, T('h10', 'J') - 0.1, { color: K.blued, backgroundColor: '#CFE5FF', duration: 0.35 });
  // updateOne 这一行的分段注解：改哪一份、怎么改、写关注 j（H09）
  const ECW = monoW(26), EX0 = 166, EY = 222 + 74 + 42 * 2 + 2, ex_ = (i) => EX0 + i * ECW;
  brace(world, ex_(14), EY, 9 * ECW, '改一份', T('h10', 'Alice') + 0.5, { out: T('h13', '日志') - 0.6 });
  brace(world, ex_(24), EY, 17 * ECW, '哪一份：name 是 Alice', T('h10', 'Alice') + 0.9, { out: T('h13', '日志') - 0.6 });
  brace(world, ex_(43), EY, 21 * ECW, '怎么改：age 设成 43', T('h10', '年龄'), { out: T('h13', '日志') - 0.6 });
  brace(world, ex_(66), EY, 29 * ECW, '写关注 j: true：等日志落盘再回复', T('h10', 'J') + 0.1, { color: K.blued, out: T('h13', '日志') - 0.6 });
  const exD = ex.cmd(T('h11', 'D') - 0.2, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Dave"</span>, <span class="k">age</span>: <span class="n">19</span> })   <span style="color:#5C6C75">// 不带 j</span>', 'lab&gt; ', 60);
  css(exD, { marginTop: '50px', borderRadius: '6px' }); to(exD, T('h11', '不带') - 0.2, { backgroundColor: K.yel, duration: 0.35 });   // 上一行命令下面的分段注解与这一行之间留空
  const solo = h('div', 'abs', world); px(solo, 140, 590, 1660, 150); css(solo, { background: '#FFFFFF', border: '3px solid ' + K.ink, borderRadius: '14px' });
  solo.innerHTML = `<div style="position:absolute;left:28px;top:44px">${ico('server', 60, K.forest, 2.4)}</div><div style="position:absolute;left:112px;top:30px;font:700 40px Mono;color:${K.ink}">mongod</div><div style="position:absolute;left:112px;top:88px;font:500 28px 'Sans SC';color:${K.gd1}">单机，不带副本集 · users 里 4096 份</div>`;
  show(solo, T('h9', 'mongo') - 0.2, { y: 14, d: 0.5 }); fadeOut(solo, T('h13', '日志') - 0.6, 0.4);
  css(solo.children[2], { color: K.gd2 });
  const soloF = h('div', 'abs', solo); css(soloF, { left: 0, top: 0, bottom: 0, width: '100%', background: '#A6F4C9', borderRadius: '10px', transformOrigin: '0 50%' }); solo.insertBefore(soloF, solo.firstChild); soloF.dataset.name = 'solof';
  fromTo(soloF, T('h9', '四千') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power1.inOut' });   // 先写好 4096 人
  to(soloF, T('h10', '做完') - 0.2, { backgroundColor: K.forest, duration: 0.4 }); to([solo.children[2], solo.children[3]], T('h10', '做完') + 0.05, { color: '#FFFFFF', duration: 0.1 });   // 检查点刚做完：都落定了
  to(soloF, T('h10', '年龄') - 0.2, { backgroundColor: '#A6F4C9', duration: 0.4 }); to([solo.children[2], solo.children[3]], T('h10', '年龄') + 0.05, { color: K.ink, duration: 0.1 });
  const ok2 = ex.out(T('h12', '回复') - 0.2, '<span style="color:#FFFFFF">两笔都回复了成功</span>'); css(ok2, { background: K.forest, borderRadius: '6px', padding: '0 10px', display: 'inline-block' });
  const kl9 = ex.out(T('h12', '强制') - 0.3, '<span style="color:#FFFFFF">$ kill -9 mongod</span>'); css(kl9, { background: K.red, borderRadius: '6px', padding: '0 10px', display: 'inline-block' });
  to(solo, T('h10', '年龄') - 0.2, { borderColor: K.forest, duration: 0.4 }); to(soloF, T('h12', '强制') - 0.1, { backgroundColor: K.red, duration: 0.4 });
  to(solo, T('h12', '强制') - 0.1, { backgroundColor: K.red, borderColor: K.red, duration: 0.4 }); to([solo.children[2], solo.children[3]], T('h12', '强制') - 0.1, { color: '#FFFFFF', duration: 0.4 }); to(solo.querySelector('svg'), T('h12', '强制') - 0.1, { attr: { stroke: '#FFFFFF' }, duration: 0.4 });
  const kill9 = tg(world, EX0 + 17 * ECW + 40, 516, 'kill -9：直接强制结束进程', 'r'); css(kill9, { fontSize: '26px', lineHeight: '40px' });
  show(kill9, T('h12', '强制') + 0.1, { x: -10, y: 0, d: 0.4 }); fadeOut(kill9, T('h13', '记着') - 0.2, 0.4);
  const kb = h('div', 'abs', world, ico('bolt', 48, K.red, 3)); px(kb, 880, 498, 48, 48);
  show(kb, T('h12', '强制') - 0.1, { y: -12, s: 0.6, d: 0.35 }); sfx('error', T('h12', '强制'), { g: 0.6 });
  // 日志文件里，检查点之后的两笔（07 回显第 38–41 行）
  const jl = term(world, 140, 590, 1660, 290, '磁盘上的日志 · 检查点之后', { fs: 28, lh: 46 });
  show(jl.c, T('h13', '日志') - 0.4, { y: 12, d: 0.5 });
  to(ex.c, T('h13', '两笔') - 0.2, { opacity: 0.45, duration: 0.45 });
  const L1 = jl.out(T('h14', '一笔') - 0.3, '事务 63  row_put  文件号 88   键 c7c2  name=Alice, age=43（整份文档 47 字节）');
  const L2 = jl.out(T('h15', '一笔') - 0.3, '事务 64  row_put  文件号 88   键 cfc1  name=Dave, age=19（整份文档 46 字节）'); set(L2, s.start, { backgroundColor: K.gd1, color: '#FFFFFF' });
  const L3 = jl.out(T('h15', '三次') - 0.2, '事务 64  row_put  文件号 96   <span style="opacity:.75">（_id 索引）</span>');
  const L4 = jl.out(T('h15', '三次') + 0.1, '事务 64  row_put  文件号 104  <span style="opacity:.75">（姓名索引）</span>');
  [L1, L2, L3, L4].forEach((L) => css(L, { padding: '0 12px', borderRadius: '6px' }));   // 字不贴底色的边
  const glLg = h('div', 'abs', world, '每条记录：<b>事务号</b> · <b>row_put</b> 写入一项 · <b>文件号</b> 写进哪个文件 · <b>键</b>（c7c2 是 RecordId 2050 打包后的写法）· 值'); px(glLg, 140, 892);   // H04 B05
  css(glLg, { font: '500 24px "Inter", "Sans SC"', color: K.gd2, borderLeft: '5px solid ' + K.blue, paddingLeft: '16px', whiteSpace: 'nowrap' });
  show(glLg, T('h14', '一笔') + 0.6, { x: 12, y: 0, d: 0.45 }); fadeOut(glLg, T('h17') - 0.3, 0.4);
  to(L1, T('h14', '43') - 0.3, { backgroundColor: K.bluel, color: K.ink, duration: 0.35 });
  to(L1, T('h14', '整份') - 0.2, { color: '#FFFFFF', backgroundColor: K.blue, duration: 0.35 });
  to([L2, L3, L4], T('h15', '三次') - 0.1, { color: '#FFFFFF', backgroundColor: K.gd1, duration: 0.35 });
  to([L2, L3, L4], T('h16', 'Dave') - 0.2, { color: '#FFFFFF', backgroundColor: K.forest, duration: 0.35 });
  fadeOut(kb, Tend('h16') + 0.1, 0.4);
  to([L2, L3, L4], T('h16', '赶在') - 0.3, { backgroundColor: K.mint2, color: K.ink, duration: 0.35 });
  // 重启（H02 H05）：数据文件停在最后一个检查点（Alice 42、没有 Dave）；日志里的四条记录一条条飞回去重做
  const tR = T('h17') - 0.3;
  const glSq = gl(world, 1190, 548, '和 SQLite 的日志很像', '改动先记进日志文件，<br>进程出事后靠它把数据恢复回来', { key: '和 SQLite 的日志很像', w: 610 });   // U03 H02
  [glSq.querySelector('span'), ...glSq.querySelectorAll('.gr')].forEach((e) => css(e, { fontSize: '24px', lineHeight: '34px' }));
  show(glSq, T('h17', '检查点') - 0.2, { x: 12, y: 0, d: 0.45 }); fadeOut(glSq, Tend('h19') + 0.4, 0.4);
  fadeOut(ex.c, Tend('h16') + 0.3, 0.45);
  tl.to(jl.c, { y: 222 - 590, duration: 0.8, ease: 'power2.inOut' }, tR + 0.1);
  const df = h('div', 'panel', world); px(df, 140, 530, 1000, 300);
  df.innerHTML = `<div style="position:absolute;left:24px;top:18px">${ico('disk', 40, K.gd2, 2.4)}</div><div style="position:absolute;left:78px;top:20px;font:700 30px 'Sans SC';color:${K.ink}">数据文件 · 最后一个检查点</div>`;
  const dRow = (y, html) => { const e = h('div', 'abs', df, html); css(e, { left: '30px', top: y + 'px', width: '560px', height: '56px', borderRadius: '8px', background: K.gl3, border: '2px solid ' + K.gl1, font: '600 28px/52px "Mono"', color: K.ink, paddingLeft: '16px', boxSizing: 'border-box' }); return e; };
  const rA = dRow(84, '2050 · Alice · 42'), rD = dRow(152, '4097 · Dave · 19'), rI = dRow(220, '_id 索引 · 姓名索引');
  set(rD, s.start, { autoAlpha: 0 });
  const cnt = h('div', 'abs', df, '4096 份'); css(cnt, { left: '640px', top: '96px', font: '800 64px/80px "Inter", "Sans SC"', color: K.ink });
  show(df, tR + 0.4, { y: 14, d: 0.5 });
  to(df, T('h17', '回到') - 0.2, { borderColor: K.g1, duration: 0.3 }); to(df, T('h17', '最后') - 0.2, { backgroundColor: '#C9F2E2', duration: 0.4 }); to(df.children[1], T('h17', '回到') - 0.2, { color: K.forest, duration: 0.3 });
  // 一条条重放：每条记录的影子飞进数据文件，对应那一行跟着变
  const tRp = T('h18', '日志') - 0.3, LL = [L1, L2, L3, L4];
  LL.forEach((L, i) => {
    const g = h('div', 'abs', world, L.innerHTML); g.dataset.name = 'replay'; px(g, 140 + 2 + jl.body.offsetLeft + L.offsetLeft, 222 + 2 + jl.body.offsetTop + L.offsetTop); css(g, { font: '400 28px/46px "Mono", "Sans SC"', color: K.ink, background: K.spring, borderRadius: '6px', padding: '0 10px', whiteSpace: 'pre', opacity: 0 });
    const tt = tRp + i * 0.45;
    tl.fromTo(g, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, { autoAlpha: 0.95, duration: 0.15, immediateRender: true }, tt);
    const ty = [84, 152, 220, 220][i] + 530 - (222 + 2 + jl.body.offsetTop + L.offsetTop);
    tl.to(g, { x: 30, y: ty, scale: 0.5, transformOrigin: '0 0', autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, tt + 0.1);
    to(L, tt, { backgroundColor: K.spring, color: K.ink, duration: 0.25 }); to(L, tt + 0.7, { backgroundColor: K.mint2, duration: 0.3 });
  });
  textAt(rA, [[0, '2050 · Alice · 42'], [tRp + 0.6, '2050 · Alice · 43']]); to(rA, tRp + 0.6, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 });
  show(rD, tRp + 1.05, { x: -12, y: 0, d: 0.35 }); to(rD, tRp + 1.05, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 });
  to(rI, tRp + 1.6, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 });
  to([rA, rD, rI], T('h19', '一份') - 0.2, { color: K.forest, duration: 0.3 }); to(jl.c, T('h19', '一份') - 0.2, { opacity: 0.35, duration: 0.4 });   // 重放完，日志用完了
  textAt(cnt, [[0, '4096 份'], [tRp + 1.15, '4097 份']]); to(cnt, tRp + 1.15, { color: K.forest, duration: 0.3 });   // Dave 那一行补回来时就是 4097
  const rec = tg(world, 164, 850, '<span style="font-family:Mono">"msg":"recovery was completed successfully …"</span>', ''); css(rec, { fontSize: '24px', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '4px 14px' });   // H05 原样日志
  show(rec, T('h19', '4097') - 0.4, { y: 8, d: 0.45 });

  // ══ 四、不带 j 什么时候会丢（H06 H07） ══
  const tD = T('h20') - 0.4;
  fadeOut(jl.c, tD, 0.45); fadeOut([df, rec], T('h20', '会丢') - 0.2, 0.45);
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
  const lane = h('div', 'abs', world); px(lane, 140, 300, 1660, 250); css(lane, { background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '14px' });   // 下半截原先空着
  lane.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:700 30px 'Sans SC';color:${K.ink}">写入一笔笔回复成功</div>` +
    Array.from({ length: 12 }, (_, k) => `<div class="w" style="position:absolute;left:${30 + k * 132}px;top:90px;width:116px;height:70px;border-radius:8px;background:#FFFFFF;border:2px solid ${K.gl1};font:600 24px/66px 'Sans SC';text-align:center;color:${K.gd2}">回复成功</div>`).join('') +
    `<div class="kl" style="position:absolute;left:${30 + 12 * 132 - 8}px;top:70px;width:4px;height:120px;background:${K.red}"></div><div class="kl" style="position:absolute;left:${30 + 12 * 132 - 96}px;top:34px;font:700 28px Mono;color:#970606">kill</div>` +
    `<div class="ln" style="position:absolute;left:30px;top:242px;font:600 28px/50px 'Sans SC';color:#FFFFFF;background:#5C6C75;border-radius:10px;padding:0 16px">进程被强制结束时，已经写进日志文件（交给了操作系统）的都留得下</div>`;
  show(lane, tE + 0.2, { y: 12, d: 0.5 });
  const ws = [...lane.querySelectorAll('.w')], kls = [...lane.querySelectorAll('.kl')];
  ws.forEach((w) => { w.dataset.name = 'w'; });
  const lnote = lane.querySelector('.ln'); set(lnote, s.start, { autoAlpha: 0, display: 'none' });
  set(kls, s.start, { autoAlpha: 0 }); show(kls, T('h27', '强制') - 0.2, { y: -8, d: 0.4 });
  const tLost = T('h28', '最后') - 0.2, tIn = T('h28', '这种') - 0.2;
  ws.forEach((w, k) => { if (k >= 9) { to(w, tLost, { backgroundColor: K.red, borderColor: K.red, color: '#FFFFFF', duration: 0.35 }); textAt(w, [[0, '回复成功'], [tLost + 0.1, '还没进']]); } else { to(w, tIn + k * 0.04, { backgroundColor: K.blue, borderColor: K.blue, color: '#FFFFFF', duration: 0.35 }); textAt(w, [[0, '回复成功'], [tIn + k * 0.04 + 0.1, '已进日志']]); } });
  const lostB = h('div', 'abs', world); px(lostB, 140 + 30 + 9 * 132 - 8, 380, 3 * 132 - 16 + 16, 150); css(lostB, { border: '4px solid ' + K.red, borderRadius: '12px' }); lostB.dataset.name = 'lost';
  show(lostB, T('h28', '丢的') - 0.3, { y: 0, s: 1.04, d: 0.4 });
  to(ws.slice(0, 9), T('h29') - 0.2, { opacity: 0.35, duration: 0.4 });   // 只看最后那一小段
  tl.to(ws.slice(9), { y: 46, autoAlpha: 0.35, duration: 0.5, ease: 'power2.in' }, T('h29', '日志文件') - 0.2);   // 这几笔丢了：掉下去
  ws.slice(9).forEach((w, k) => { to(w, T('h29', '还没') - 0.2 + k * 0.1, { backgroundColor: K.redd, borderColor: K.redd, color: K.redl, duration: 0.3 }); });
  to(kls[0], T('h27', '进程') - 0.2, { height: '160px', top: '50px', duration: 0.35 });   // kill 那一刻：竖线拉长，横过整排
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
  fadeOut([lane, lostB], tF, 0.45);
  tl.to(pw, { autoAlpha: 0, duration: 0.4 }, tF);
  const pick = [['insertOne({ … })', '', K.gl1, K.ink], ['insertOne({ … }, { writeConcern: { j: true } })', '', K.blue, K.blued]].map(([a, b, bd, c], i) => {
    const e = h('div', 'abs', world); px(e, 240 + i * 760, 420, 680, 200); css(e, { background: i ? '#E6F1FF' : '#FCE9B0', border: '3px solid ' + (i ? K.blue : K.yeld), borderRadius: '16px' });
    e.innerHTML = `<div style="position:absolute;left:30px;top:34px;font:700 22px/36px Mono;color:${c};white-space:nowrap">${a}</div><div class="pi" style="position:absolute;left:30px;top:112px">${ico(i ? 'disk' : 'mem', 56, c, 2.4)}</div><div style="position:absolute;left:104px;top:120px;font:700 30px/40px 'Sans SC';color:${c}">${i ? '等日志落盘再回复' : '写进内存就回复'}</div>`;
    show(e, tF + 0.3 + i * 0.25, { y: 14, d: 0.5 });
    return e;
  });
  const or = tg(world, 940, 494, '或', 'big'); css(or, { fontSize: '40px' }); show(or, tF + 0.5, { y: 8, d: 0.4 });
  to(pick[1], T('h31', '等日志') - 0.2, { backgroundColor: K.blue, duration: 0.35 }); to([...pick[1].children], T('h31', '等日志') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to(pick[1].querySelector('.pi svg'), T('h31', '等日志') - 0.2, { attr: { stroke: '#FFFFFF' }, duration: 0.35 });
  const tAl = T('h32') - 0.25;
  fadeOut([...pick, or], tAl, 0.45);
  const al = docCard(world, 720, 380, [['name', JS('Alice')], ['age', JN(43)]], { w: 480, fs: 36 });
  show(al.c, tAl + 0.3, { y: 14, d: 0.5 });
  to(al.c, T('h32', '不再') - 0.15, { borderColor: K.red, backgroundColor: '#FFC7BC', duration: 0.5 }); to(al.c, T('h32', '网站') - 0.1, { opacity: 0.45, duration: 0.5 });
});
