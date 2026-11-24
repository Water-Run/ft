// 第 07 章 事务与并发（r7 重写）。同一个舞台从头到尾：上面三条时间泳道（Bob、Alice、事务外），下面是 Alice 那一项的版本链。
// 每一次读，画成从泳道上的点落到链上某一版的箭头；不贴复述台词的字块。
// 一、开头：Alice 改、Bob 读 → Bob 读到哪一版看他在不在事务里 → 第 03 章的事务（MongoDB 自己开）与应用自己开的事务 →
//    单机的 mongod 开不了（真实报错）→ 前几集都是一个程序管一份数据；单机 = 只开一个 mongod；副本集 = 几台存同一份，一台收写入、其余复制 →
//    事务只在副本集上能用；本章实验是只有一台的副本集。
// 二、快照读：Bob 的事务里两次都落到 42，事务外与事务结束后落到 43；快照是一道竖线，竖线之前的已提交；顺着链往回找，43 跳过。
// 三、写冲突：Alice 的 44 还没提交（虚线），Carol 的那一版撞上它被弹回 → 报 WriteConflict（真实回显）→ Alice 提交后 Carol 重来，45 接上。
// 事实：G01（快照读 42/43）、G07（快照）、D01（更新链）、H04（第 03 章的内部事务）、I07 V02（应用的事务、4.0、2018）、
//       G00 G00b G00c（单机拒绝、副本集、主节点收写入）、S04（前几集）、G04 G08 G06（写冲突、标签、乐观并发、44/45）、S11（PostgreSQL 的快照）。
scene('concur', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '07 事务与并发');

  // ── 版本链（下面）：页上那一版 + 后来挂上的版本 ──
  const CY = 690, CH = 100;
  const chainHd = tg(world, 120, CY + 30, 'Alice 那一项', 'b'); css(chainHd, { fontSize: '28px' });   // 放在版本框左边，箭头都从上面落到框顶
  const vbox = (x, w, txt, kind) => {
    const e = h('div', 'abs', world, txt); px(e, x, CY, w, CH); e.dataset.name = 'ver';
    const st = { page: [K.gl3, K.gb, K.ink], ok: ['#C0FAE6', K.forest, K.forest], open: ['#FFF6DA', K.yeld, K.ink] }[kind];
    css(e, { background: st[0], border: `3px ${kind === 'open' ? 'dashed' : 'solid'} ${st[1]}`, color: st[2], borderRadius: '12px', font: '800 40px/94px "Mono"', textAlign: 'center', boxSizing: 'border-box' });
    return e;
  };
  const P42 = vbox(320, 300, '页上 · 42', 'page');
  const C43 = vbox(700, 260, '43', 'ok');
  const a43 = link(ov, [[620, CY + CH / 2], [696, CY + CH / 2]], 'ink', { w: 3, arrow: true });
  show([chainHd, P42], c0 + 0.2, { y: 12, d: 0.45 });
  const RD = { bob: K.blue, out: K.gd1, alice: K.forest, carol: K.gd2 };
  const readOn = (b, t, k) => to(b, t, { backgroundColor: RD[k], borderColor: RD[k], color: '#FFFFFF', duration: 0.3 });
  const asPage = (t) => to(P42, t, { backgroundColor: K.gl3, borderColor: K.gb, color: K.ink, duration: 0.3 });
  const asOk = (b, t) => to(b, t, { backgroundColor: '#C0FAE6', borderColor: K.forest, color: K.forest, duration: 0.3 });

  // ── 泳道 ──
  const LX0 = 320, LX1 = 1760;
  const LANE = { bob: [270, 'Bob', K.blue], alice: [390, 'Alice', K.forest], out: [510, '事务外', K.gd1] };
  const lanes = {};
  Object.entries(LANE).forEach(([k, [y, n, c]]) => {
    const l = h('div', 'abs', world); px(l, LX0, y - 3, LX1 - LX0, 6); css(l, { background: c, opacity: 0.3, borderRadius: '3px', transformOrigin: '0 50%' });
    const t = h('div', 'abs', world, ico('person', 30, '#FFFFFF', 2.6) + `<span style="vertical-align:8px;margin-left:8px">${n}</span>`); px(t, 120, y - 28); css(t, { font: '700 28px/56px "Inter", "Sans SC"', color: '#FFFFFF', background: c, borderRadius: '10px', padding: '0 14px 0 10px', whiteSpace: 'nowrap' });
    lanes[k] = { l, t, y, c };
  });
  const laneIn = (k, t) => { fromTo(lanes[k].l, t, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(lanes[k].t, t, { x: -14, y: 0, d: 0.4 }); };
  const dot = (k, x, t, solidDot = true) => { const d = h('div', 'abs', world); d.dataset.name = 'dot'; px(d, x - 11, lanes[k].y - 11, 22, 22); css(d, { borderRadius: '50%', background: solidDot ? lanes[k].c : '#FFFFFF', border: '3px solid ' + lanes[k].c, boxSizing: 'border-box' }); show(d, t, { y: 0, s: 0.3, d: 0.3 }); return d; };
  const boxTop = (b) => { const x = parseFloat(b.style.left) + parseFloat(b.style.width) / 2; return [x, CY - 4]; };
  const arrowTo = (k, x, box, t, color) => { const [bx, by] = boxTop(box); const p = link(ov, [[x, lanes[k].y + 12], [bx, by]], color || (k === 'bob' ? 'blue' : k === 'alice' ? 'accent' : 'dim'), { w: 3, arrow: true }); arrowIn(p, t, 0.45); return p; };

  // ══ 一、开头 ══
  laneIn('alice', T('g1', 'Alice') - 0.3); laneIn('bob', T('g1', 'Bob') - 0.3);
  const d0a = dot('alice', 400, T('g1', '改') - 0.2), w0 = arrowTo('alice', 400, P42, T('g1', '改') - 0.1);
  const d0b = dot('bob', 400, T('g1', '读') - 0.2), r0 = arrowTo('bob', 400, P42, T('g1', '读') - 0.1);
  readOn(P42, T('g1', '读') + 0.1, 'bob'); asPage(T('g2', '要看') - 0.2);   // 他这时读到的是页上这一版
  // g2：Bob 那条泳道上先画出一个空的事务框（虚线）
  const bSpan = h('div', 'abs', world); px(bSpan, 420, lanes.bob.y - 24, 880, 48); css(bSpan, { border: '3px dashed ' + K.blue, borderRadius: '12px', background: 'rgba(1,107,248,0.06)' });
  bSpan.dataset.name = 'span'; show(bSpan, T('g2', '事务') - 0.3, { y: 0, s: 1.03, d: 0.45 });
  const tClr = T('g7') - 0.5;
  fadeOut([d0a, w0, d0b, r0], T('g3') - 0.2, 0.4);
  // g3：右下角回到第 03 章——三处写入装在一个事务里（MongoDB 自己开）
  const BX = 1000, BYp = 600, BW = 760, BH = 300;
  const fb = h('div', 'panel', world); px(fb, BX, BYp, BW, BH);
  fb.innerHTML = `<div style="position:absolute;left:24px;top:18px;font:600 24px 'Sans SC';color:${K.gd1}">第 03 章 · Dave 注册</div>` +
    `<div class="fbx" style="position:absolute;left:24px;top:70px;width:712px;height:120px;border:3px dashed ${K.blue};border-radius:12px"></div>` +
    ['集合树', '_id 索引', '姓名索引'].map((n, i) => `<div class="fbk" style="position:absolute;left:${48 + i * 228}px;top:96px;width:208px;height:68px;background:${K.forest};border-radius:10px;font:700 26px/68px 'Sans SC';text-align:center;color:#fff">${n}</div>`).join('') +
    `<div style="position:absolute;left:24px;top:214px;font:600 26px 'Sans SC';color:${K.ink}">MongoDB 替这一次写入开的事务</div>`;
  show(fb, T('g3', '第三章') - 0.3, { y: 14, d: 0.5 });
  [...fb.querySelectorAll('.fbk')].forEach((e, i) => to(e, T('g3', '替') - 0.2 + i * 0.25, { backgroundColor: K.spring, color: K.ink, duration: 0.3 }));
  fadeOut(fb, T('g3b') - 0.25, 0.35);
  // g3b：同一个位置，应用自己写的事务（四行代码，左边一道括号把它们包成一个）
  const code = term(world, BX, BYp, BW, BH + 40, 'mongosh · 应用自己开的事务', { fs: 25, lh: 40 });
  show(code.c, T('g3b') - 0.15, { y: 14, d: 0.45 });
  code.cmd(T('g3b', '应用') + 0.05, 'session.<span class="k">startTransaction</span>()', '', 60);
  code.cmd(T('g3b', '读写') - 0.35, '  users.findOne(…)', '', 70);
  code.cmd(T('g3b', '读写') + 0.05, '  users.updateOne(…)', '', 70);
  code.cmd(T('g3b', '包成') - 0.2, 'session.<span class="k">commitTransaction</span>()', '', 60);
  const brk = h('div', 'abs', world); px(brk, BX + 10, BYp + 78, 12, 160); css(brk, { borderLeft: '3px solid ' + K.blue, borderTop: '3px solid ' + K.blue, borderBottom: '3px solid ' + K.blue, borderRadius: '6px 0 0 6px' });
  show(brk, T('g3b', '包成') + 0.1, { x: -8, y: 0, d: 0.4 });
  const v4 = tg(world, BX + BW - 380, BYp + 18, '4.0 版（2018 年）起可用', 'm'); css(v4, { fontSize: '24px', color: K.gd1, width: '290px', textAlign: 'right' });   // V02 只作图注
  show(v4, T('g3b', '应用') + 0.6, { y: 6, d: 0.4 });
  // g5：在单机的 mongod 上执行，报错（G00 的真实报错）
  const errL = code.out(T('g5', '这种') - 0.1, '<span style="color:#FFFFFF">MongoServerError: Transaction numbers are only allowed on a replica set member or mongos</span>');
  css(errL, { background: K.red, borderRadius: '6px', padding: '2px 10px', fontSize: '22px', lineHeight: '30px', whiteSpace: 'normal' });
  const errZ = code.out(T('g5', '这种') + 0.5, '<span style="color:#5C6C75;font-family:Inter,\'Sans SC\'">事务号只能用在副本集成员或 mongos 上</span>');
  textAt(code.c.querySelector('.lang'), [[0, 'mongosh · 应用自己开的事务'], [T('g5', '这种') - 0.3, 'mongosh · 单机的 mongod']]);
  const tSA = T('g5b') - 0.3;
  fadeOut([code.c, brk, v4], tSA, 0.4);
  // 报错移到左边，留到讲副本集复制（U07 U10）
  const errC = h('div', 'abs', world); errC.dataset.name = 'errcard'; px(errC, 140, 452, 760); css(errC, { background: '#FFFFFF', border: '2px solid ' + K.red, borderRadius: '10px', padding: '10px 18px', boxSizing: 'border-box', whiteSpace: 'normal', overflowWrap: 'anywhere' });
  errC.innerHTML = `<div style="font:600 22px/30px Mono;color:${K.redd}">单机 mongod：Transaction numbers are only allowed on a replica set member or mongos</div>`
    + `<div style="font:600 24px/34px 'Inter','Sans SC';color:${K.ink};margin-top:6px">事务号只能用在副本集成员或 mongos（分片集群的入口）上</div>`;
  show(errC, tSA - 0.1, { x: 160, y: 0, d: 0.55 }); fadeOut(errC, T('g5d') - 0.3, 0.4);   // 从右边的代码框挪过来
  // 为什么单机开不了事务：问答，逐条随旁白出（U07 G00 G00c）；这一段里左下的「Alice 那一项」先收起，讲到 Bob 再拿回来
  const QA = [['MongoDB 的事务，是在副本集这种跑法上做出来的。', 0],
    ['副本集里，一台收下修改，记进一本「同步日志」，其余几台照着日志改，几台的数据才一样', 1],
    ['事务提交时，也是整笔记进这本同步日志，几台一起照着改', 1],
    ['单机不用和谁同步，就没有这本日志；事务没处记，所以直接拒绝', 1],
    ['一台机器也想用事务：把它设成「只有一台的副本集」，有了这本日志就行（本章实验就这么做的）', 1]];
  const glTx = gl(world, 140, 440, '问：单机好好的，为什么开不了事务？', QA.map(([t, b], k) => `<i class="qa${k}" style="display:block;font-style:normal;${b ? 'padding-left:22px;text-indent:-22px' : ''}">${b ? '· ' : '答：'}${t}</i>`).join(''), { key: '为什么单机开不了事务', w: 820 });
  css(glTx.querySelector('span'), { fontSize: '24px', lineHeight: '34px' });
  css(glTx, { borderLeft: 'none', paddingLeft: '0' });   // 竖条跟着已经出来的行走，不先画出整条
  const qaB = glTx.querySelector('b'); css(qaB, { borderLeft: '5px solid ' + K.g1, paddingLeft: '18px' });
  glTx.querySelectorAll('span i').forEach((e, k) => css(e, k ? { borderLeft: '5px solid ' + K.g1, paddingLeft: '40px' } : { borderLeft: '5px solid ' + K.g1, paddingLeft: '18px' }));
  const qaT = [T('g5d') + 0.2, T('g5e') - 0.2, T('g5e', '复制') - 0.2, T('g5f') - 0.2, T('g5f', '副本集') - 0.2];
  const qaL = QA.map((_, k) => glTx.querySelector('.qa' + k)); set(qaL.slice(1), s.start, { autoAlpha: 0 });
  show(glTx, qaT[0], { x: 12, y: 0, d: 0.45 }); qaL.slice(1).forEach((e, k) => show(e, qaT[k + 1], { y: 6, d: 0.4 }));
  fadeOut(glTx, tClr - 0.2, 0.4);   // 下一段的时间线进来之前收完
  tl.to([chainHd, P42], { autoAlpha: 0, duration: 0.35 }, T('g5d') - 0.2); tl.to([chainHd, P42], { autoAlpha: 1, duration: 0.4 }, tClr + 0.95);
  // g5b：前几集的数据库——每一个都是一个程序管着一份数据
  const EPS = ['MySQL', 'PostgreSQL', 'SQLite', 'ClickHouse'];
  const eps = EPS.map((n, i) => {
    const e = h('div', 'abs', world); px(e, BX + i * 192, BYp + 40, 176, 220); css(e, { background: '#FFFFFF', border: '2px solid ' + K.gl1, borderRadius: '12px' });
    e.innerHTML = `<div style="position:absolute;left:0;right:0;top:18px;text-align:center;font:700 24px Inter;color:${K.ink}">${n}</div>` +
      `<div style="position:absolute;left:58px;top:64px">${ico('server', 60, K.gd2, 2.4)}</div>` +
      `<div style="position:absolute;left:58px;top:146px">${ico('disk', 60, K.gd2, 2.4)}</div>`;
    show(e, T('g5b', '前几集') - 0.2 + i * 0.12, { y: 12, d: 0.4 }); to(e.firstChild, T('g5b', '一份') - 0.6 + i * 0.25, { color: K.forest, duration: 0.3 }); to(e, T('g5b', '一份') - 0.6 + i * 0.25, { backgroundColor: '#C9F2E2', borderColor: K.forest, duration: 0.3 }); to(e, T('g5c', 'MongoDB') - 0.2, { opacity: 0.4, duration: 0.4 }); return e;
  });
  // g5c：MongoDB 也能这样跑——一个 mongod，一份数据：这就是单机
  const tSolo = T('g5c', '只开') - 0.3;
  fadeOut(eps, tSolo, 0.4);
  const node = (i) => { const e = h('div', 'abs', world); px(e, BX + 40 + i * 240, BYp + 40, 200, 220); css(e, { background: '#FFFFFF', border: '3px solid ' + K.ink, borderRadius: '14px' });
    e.innerHTML = `<div style="position:absolute;left:0;right:0;top:14px;text-align:center;font:700 28px Mono;color:${K.ink}">mongod</div><div style="position:absolute;left:70px;top:62px">${ico('server', 60, K.gd2, 2.4)}</div><div style="position:absolute;left:70px;top:142px">${ico('disk', 60, K.forest, 2.4)}</div>`; return e; };
  const N = [0, 1, 2].map(node);
  show(N[0], tSolo + 0.2, { y: 12, d: 0.45 });
  to(N[0], T('g5c', '单机') - 0.2, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 }); to(N[0].firstChild, T('g5c', '单机') - 0.2, { color: '#FFFFFF', duration: 0.35 }); to(N[0].firstChild, T('g5d', '同一') - 0.2, { color: K.ink, duration: 0.35 });
  const n0ic = [...N[0].querySelectorAll('svg')]; to(n0ic, T('g5c', '单机') - 0.2, { attr: { stroke: '#FFFFFF' }, duration: 0.35 }); to(n0ic[0], T('g5d', '同一') - 0.2, { attr: { stroke: K.gd2 }, duration: 0.35 }); to(n0ic[1], T('g5d', '同一') - 0.2, { attr: { stroke: K.forest }, duration: 0.35 }); to(n0ic, T('g5e', '收写入') - 0.3, { attr: { stroke: '#FFFFFF' }, duration: 0.35 });   // 深底上的图标改成白色
  const glSolo = gl(world, 140, 836, '单机', '作为单独一台服务器运行、不属于副本集的 mongod；<br>数据只在它手上这一份。只有一台的副本集也不算单机', { key: '单机' }); glInline(glSolo); show(glSolo, T('g5c', '只开') + 0.3, { x: 12, y: 0, d: 0.4 });   // T13 放在左下，留到副本集的代码出来之前
  // g5d：副本集——几台 mongod，各存一份同样的数据
  fadeOut(glSolo, T('g5f', '应用') - 0.6, 0.3);
  [1, 2].forEach((i) => tl.fromTo(N[i], { autoAlpha: 0, x: -240 * i }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power2.out', immediateRender: true }, T('g5d') - 0.1 + i * 0.1));
  to(N, T('g5d', '同一') - 0.2, { backgroundColor: '#C9F2E2', borderColor: K.ink, duration: 0.35 });   // 存的是同一份数据
  const glRS = gl(world, BX, BYp + 284, '副本集', '几台 mongod 存同一份数据，一台坏了，还有别的顶上', { key: '副本集' }); glInline(glRS);   // T14 G00b G00c
  show(glRS, T('g5d', '副本集') - 0.2, { x: 12, y: 0, d: 0.4 });
  // g5e：一台收写入（实心），其余两台照着它复制（箭头上有点在流）
  to(N[0], T('g5e', '收写入') - 0.3, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); to(N[0].firstChild, T('g5e', '收写入') - 0.3, { color: '#FFFFFF', duration: 0.35 });
  const wIn = link(ov, [[BX + 140, BYp - 30], [BX + 140, BYp + 22]], 'accent', { w: 4, arrow: true }); arrowIn(wIn, T('g5e', '收写入') - 0.3, 0.4);   // 箭头停在框顶之上，不压「mongod」
  const rep = [1, 2].map((i) => link(ov, [[BX + 240, BYp + 150], [BX + 40 + i * 240 - 4, BYp + 150]], 'accent', { w: 3, arrow: true, dashed: '8 6' }));
  rep.forEach((p, i) => arrowIn(p, T('g5e', '复制') - 0.4 + i * 0.15, 0.5));
  const flow = [0, 1, 2].map(() => { const e = h('div', 'abs', world); px(e, 0, 0, 14, 14); css(e, { borderRadius: '50%', background: K.spring, border: '2px solid ' + K.forest, opacity: 0 }); return e; });
  const tF0 = T('g5e', '复制'), tF1 = T('g5g') - 0.2;
  F((t) => { flow.forEach((e, k) => { if (t < tF0 || t > tF1) { e.style.opacity = 0; return; } const ph = ((t - tF0) * 0.9 + k / 3) % 1; const tgt = k % 2 ? 2 : 1; const x0 = BX + 240, x1 = BX + 40 + tgt * 240 - 10; e.style.opacity = '1'; e.style.transform = `translate(${x0 + (x1 - x0) * ph - 7}px, ${BYp + 143}px)`; }); });
  // g5f：应用自己开的事务放到副本集上——这次通过
  const code2 = term(world, 320, 808, 600, 146, 'mongosh · 副本集 rs0', { fs: 24, lh: 36 });
  const c2bar = code2.c.querySelector('.bar'); css(code2.c, { background: K.ink, borderColor: K.ink }); css(c2bar, { background: K.ink, borderBottomColor: K.gd2 }); css(code2.c.querySelector('.lang'), { color: '#C1C7C6' }); css(code2.body, { color: '#FFFFFF' });
  show(code2.c, T('g5f', '应用') - 0.3, { y: 12, d: 0.45 });
  code2.cmd(T('g5f', '应用') - 0.1, 'session.startTransaction()', '', 60);
  code2.cmd(T('g5f', '事务') - 0.1, 'session.commitTransaction()', '', 60);
  const txTok = link(ov, [[924, 866], [BX + 36, BYp + 170]], 'accent', { w: 3, arrow: true }); arrowIn(txTok, T('g5f', '事务') + 0.2, 0.45);
  const okR = h('div', 'abs', world, ico('check', 40, '#FFFFFF', 4)); px(okR, 860, 878, 40, 40);   // 勾打在副本集上跑通的那段命令右边（原先压在 mongod 字上）
  show(okR, T('g5f', '副本集') - 0.1, { y: 0, s: 1.4, d: 0.35 }); to([code2.c, c2bar], T('g5f', '副本集') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); to(code2.c.querySelector('.lang'), T('g5f', '副本集') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  fadeOut([code2.c, txTok], T('g5g') - 0.2, 0.4);
  // g5g：本章实验——只留一台的副本集（rs0）
  fadeOut([N[1], N[2], ...rep, ...flow], T('g5g', '一台') - 0.3, 0.45);
  const rs0 = tg(world, BX + 260, BYp + 120, '副本集 rs0', 'b'); css(rs0, { fontSize: '28px', color: K.forest });   // G00
  show(rs0, T('g5g', '一台') + 0.25, { x: 12, y: 0, d: 0.4 });   // 另外两台先退场，再写名字
  fadeOut([N[0], glRS, wIn, okR, rs0], tClr, 0.45);

  // ══ 二、快照读 ══
  // 时间：播放头沿泳道往右走，事件按先后落在 x 上
  const EV = [[T('g7') - 0.3, 400], [T('g7', '读到'), 440], [T('g8', '提交'), 640], [T('g9', '再读'), 860], [T('g10', '去读'), 1080], [T('g11', '结束'), 1300], [T('g11', '才是'), 1460], [Tend('g11') + 0.4, 1520]];
  const playX = (t) => { if (t <= EV[0][0]) return EV[0][1]; for (let i = 1; i < EV.length; i++) if (t <= EV[i][0]) return EV[i - 1][1] + (EV[i][1] - EV[i - 1][1]) * (t - EV[i - 1][0]) / Math.max(0.01, EV[i][0] - EV[i - 1][0]); return EV[EV.length - 1][1]; };
  const ph = h('div', 'abs', world); px(ph, 0, 228, 3, 316); css(ph, { background: K.gd2, opacity: 0 });
  const tPh0 = T('g7') - 0.3, tPh1 = T('g12') - 0.3;
  F((t) => { const on = t >= tPh0 && t <= tPh1 + 0.4; ph.style.opacity = on ? String(t > tPh1 ? Math.max(0, 1 - (t - tPh1) / 0.4) * 0.6 : 0.6) : '0'; ph.style.transform = `translateX(${playX(t)}px)`; });
  // Bob 的事务：虚线框变实，跟着播放头长出来，到「结束」为止
  const bFill = h('div', 'abs', world); px(bFill, 420, lanes.bob.y - 24, 0, 48); css(bFill, { background: '#B9DAFF', borderRadius: '12px' }); world.insertBefore(bFill, bSpan);
  const tB0 = T('g7', '开了') - 0.2, tB1 = T('g11', '结束');
  F((t) => { const w = t < tB0 ? 0 : Math.min(880, Math.max(0, playX(Math.min(t, tB1)) - 420)); bFill.style.width = w + 'px'; });
  set(bSpan, tB0, { borderStyle: 'solid' }); tl.to(bSpan, { autoAlpha: 0.6, duration: 0.3 }, T('g12') - 0.3);
  // 事件
  const e1 = dot('bob', 440, T('g7', '读到') - 0.2), r1 = arrowTo('bob', 440, P42, T('g7', '读到') - 0.1);
  readOn(P42, T('g7', '读到') + 0.1, 'bob'); asPage(T('g8', '这时') - 0.2);
  const e2 = dot('alice', 640, T('g8', '改成') - 0.2), wA = arrowTo('alice', 640, C43, T('g8', '提交') - 0.25);
  readOn(C43, T('g8', '提交') - 0.2, 'alice'); asOk(C43, T('g9') - 0.2);
  show(C43, T('g8', '提交') - 0.1, { x: -16, y: 0, d: 0.4 }); arrowIn(a43, T('g8', '提交') - 0.1, 0.35);
  const e3 = dot('bob', 860, T('g9', '再读') - 0.2), r3 = arrowTo('bob', 860, P42, T('g9', '再读') - 0.1);
  readOn(P42, T('g9', '再读') + 0.1, 'bob'); asPage(T('g10') - 0.2);
  laneIn('out', T('g10') - 0.4);
  const e4 = dot('out', 1080, T('g10', '去读') - 0.2), r4 = arrowTo('out', 1080, C43, T('g10', '去读') - 0.1);
  readOn(C43, T('g10', '去读') + 0.1, 'out'); asOk(C43, T('g11') - 0.2);
  const e5 = dot('bob', 1300, T('g11', '结束') - 0.2, false);
  const e6 = dot('bob', 1460, T('g11', '才是') - 0.3), r6 = arrowTo('bob', 1460, C43, T('g11', '才是') - 0.2);
  readOn(C43, T('g11', '才是'), 'bob'); asOk(C43, T('g12', '事务') - 0.2);
  readOn(P42, T('g12', '快照') - 0.1, 'bob'); asPage(T('g14') - 0.5);   // 快照里看得见的是 42；往回找之前先复原
  // g12：快照——在 Bob 事务开始那一刻，一道竖线穿过三条泳道
  const snap = h('div', 'abs', world); px(snap, 438, 226, 4, 320); css(snap, { background: K.blue, transformOrigin: '50% 0' });
  snap.dataset.name = 'snap';
  sfx('blip', T('g12', '快照') - 0.2, { g: 0.5 }); sfx('pop', T('g14', '读'), { g: 0.4 }); sfx('blip', T('g14', '跳过') - 0.1, { g: 0.4 }); sfx('pop', T('g14b', '42') - 0.2, { g: 0.4 });
  fromTo(snap, T('g12', '快照') - 0.35, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: 'power2.out' });
  tl.to([r4, r6, e4, e5, e6, wA], { autoAlpha: 0.25, duration: 0.4 }, T('g12') - 0.2);
  const glSnap = gl(world, LX0, 826, '快照', '事务开始那一刻对「哪些事务已经提交」的一份记录：整个事务里只读那之前提交的版本，<br>之后提交的跳过。它不复制数据，读的时候顺着更新链去找', { key: '快照' }); glInline(glSnap);   // G07 T07
  show(glSnap, T('g12', '快照') - 0.2, { x: 12, y: 0, d: 0.45 });
  // g13：竖线之前（已经提交的）铺一层浅蓝；Alice 的提交点在竖线之后
  const before = h('div', 'abs', world); px(before, LX0, 226, 438 - LX0, 320); css(before, { background: 'rgba(1,107,248,0.10)', transformOrigin: '100% 50%' }); world.insertBefore(before, lanes.bob.l); before.dataset.name = 'before';
  fromTo(before, T('g13', '快照') - 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
  const afterZ = h('div', 'abs', world); px(afterZ, 442, 226, LX1 - 442, 320); css(afterZ, { background: 'rgba(0,30,43,0.07)', transformOrigin: '0 50%' }); world.insertBefore(afterZ, lanes.bob.l); afterZ.dataset.name = 'afterz';
  fromTo(afterZ, T('g13', '快照') - 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });   // 竖线之后提交的，快照里看不见
  to(e2, T('g13', '提交') - 0.2, { scale: 1.5, duration: 0.3 }); to(e2, T('g13', '提交') + 0.4, { scale: 1, duration: 0.3 });
  const after = link(ov, [[446, lanes.alice.y], [628, lanes.alice.y]], 'blue', { w: 2.5, dashed: '6 6', arrow: true }); arrowIn(after, T('g13', '提交') - 0.1, 0.45);
  // g14：Bob 那一次再读：一个蓝点从他那里落到链上——先碰到 43（竖线之后才提交，跳过），再退到 42
  tl.to(r3, { autoAlpha: 0.2, duration: 0.3 }, T('g14') - 0.2);
  const tok = h('div', 'abs', world); px(tok, 0, 0, 26, 26); css(tok, { borderRadius: '50%', background: K.blue, border: '3px solid #FFFFFF' });
  const [x43, y43] = boxTop(C43), [x42, y42] = boxTop(P42);
  tl.fromTo(tok, { autoAlpha: 0, x: 860 - 13, y: lanes.bob.y - 13 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, T('g14', '读') - 0.3);
  tl.to(tok, { x: x43 - 13, y: y43 - 20, duration: 0.8, ease: 'power2.in' }, T('g14', '读'));
  readOn(C43, T('g14', '更新链') - 0.2, 'bob');   // 先碰到链上最新的一版
  to(bFill, T('g14', '顺着') - 0.2, { backgroundColor: K.blue, duration: 0.35 });   // 这是 Bob 事务里的一次读
  to(afterZ, T('g14', '43') - 0.2, { backgroundColor: 'rgba(0,30,43,0.18)', duration: 0.35 }); to(afterZ, T('g15') - 0.2, { backgroundColor: 'rgba(0,30,43,0.07)', duration: 0.4 });   // 竖线之后提交的，快照里看不见
  to(C43, T('g14', '43') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gb, color: K.gd1, borderStyle: 'dashed', duration: 0.3 });   // 快照之后才提交的：跳过
  tl.to(tok, { x: x42 - 13, y: y42 - 20, duration: 0.7, ease: 'power2.inOut' }, T('g14', '跳过') - 0.2);
  to(P42, T('g14b', '42') - 0.3, { backgroundColor: K.blue, borderColor: K.blue, color: '#FFFFFF', duration: 0.35 });
  // g15：Alice 的提交点落在 Bob 的事务中间——她没停下来等
  to(lanes.alice.l, T('g15', 'Alice') - 0.2, { opacity: 0.9, duration: 0.4 });
  to(e2, T('g15', '不用等') - 0.2, { backgroundColor: K.spring, duration: 0.3 }); readOn(C43, T('g15', '完成') - 0.2, 'alice');   // 她的 43 照样写成了
  const mid = link(ov, [[640, lanes.alice.y - 14], [640, lanes.bob.y + 26]], 'accent', { w: 3, dashed: '6 6' }); arrowIn(mid, T('g15', '照样') - 0.3, 0.4);

  // 第二段退场
  const tC = T('g19a') - 0.4;
  fadeOut([e1, r1, e3, r3, e4, r4, e5, e6, r6, e2, wA, snap, before, afterZ, after, tok, mid, glSnap, bFill, bSpan, lanes.bob.l, lanes.bob.t, lanes.out.l, lanes.out.t], tC, 0.45);   // ph 的透明度只由 F() 写
  to(P42, tC, { backgroundColor: K.gl3, borderColor: K.gb, color: K.ink, duration: 0.4 }); asOk(C43, tC); to(C43, tC, { borderStyle: 'solid', duration: 0.01 });
  to(lanes.alice.l, tC, { opacity: 0.3, duration: 0.4 });

  to(chainHd, T('g19a', '同一份') - 0.2, { color: K.forest, duration: 0.3 });
  [P42, C43].forEach((b) => readOn(b, T('g19a', '同一份') - 0.2, 'alice')); asPage(T('g21', '改了') - 0.2); asOk(C43, T('g21', '改了') - 0.2);
  [P42, C43].forEach((b) => readOn(b, T('g22', '这份') - 0.2, 'alice')); asPage(T('g23') - 0.2); asOk(C43, T('g23') - 0.2);   // Carol 要改的也是这一份
  // ══ 三、写冲突 ══
  // Carol 的泳道在原来「事务外」的位置
  const carolY = 510;
  const cl = h('div', 'abs', world); px(cl, LX0, carolY - 3, LX1 - LX0, 6); css(cl, { background: K.gd2, opacity: 0.3, borderRadius: '3px', transformOrigin: '0 50%' });
  const ct = h('div', 'abs', world, ico('person', 30, '#FFFFFF', 2.6) + '<span style="vertical-align:8px;margin-left:8px">Carol</span>'); px(ct, 120, carolY - 28); css(ct, { font: '700 28px/56px "Inter", "Sans SC"', color: '#FFFFFF', background: K.gd2, borderRadius: '10px', padding: '0 14px 0 10px', whiteSpace: 'nowrap' });
  const ctSub = tg(world, 120, carolY + 42, '管理员', 'm'); css(ctSub, { fontSize: '24px', color: K.gd1 });
  // g21：Alice 开一个事务改了，还没提交：泳道上一段虚线框，链上挂出一个虚线的 44
  const aSpan = h('div', 'abs', world); px(aSpan, 420, lanes.alice.y - 24, 0, 48); css(aSpan, { border: '3px dashed ' + K.yeld, background: '#FFF6DA', borderRadius: '12px' });
  tl.fromTo(aSpan, { autoAlpha: 0, width: 0 }, { autoAlpha: 1, width: 640, duration: 0.9, ease: 'power2.out', immediateRender: true }, T('g21', '一个事务') - 0.2);
  const C44 = vbox(1000, 260, '44', 'open'); const a44 = link(ov, [[964, CY + CH / 2], [996, CY + CH / 2]], 'ink', { w: 3, arrow: true });
  const dA2 = dot('alice', 460, T('g21', '改了') - 0.3), wA2 = arrowTo('alice', 460, C44, T('g21', '改了') - 0.1, 'accent');
  show(C44, T('g21', '改了') + 0.2, { x: -16, y: 0, d: 0.4 }); arrowIn(a44, T('g21', '改了') + 0.2, 0.35);
  to([aSpan, C44], T('g21', '还没') - 0.2, { backgroundColor: K.yel, duration: 0.35 });   // 还没提交
  // g22：Carol 出现，也开一个事务
  fromTo(cl, T('g22', 'Carol') - 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }); show(ct, T('g22', 'Carol') - 0.3, { x: -14, y: 0, d: 0.4 }); show(ctSub, Math.max(T('g22', '管理员') - 0.2, T('g22', 'Carol') + 0.2), { y: 6, d: 0.35 });
  const cSpan = h('div', 'abs', world); cSpan.dataset.name = 'cspan'; px(cSpan, 770, carolY - 28, 220, 56); css(cSpan, { border: '3px solid ' + K.gd2, background: K.gd2, borderRadius: '12px', transformOrigin: '0 50%' });
  fromTo(cSpan, T('g22', '另一个') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
  const dC = dot('out', 794, T('g22', '也要') - 0.2); css(dC, { top: carolY - 11 + 'px', background: '#FFFFFF', borderColor: '#FFFFFF' });
  // g23：本可以让 Carol 一直等到 Alice 提交（一段斜纹），MongoDB 没这么做：这段收回去
  const wait = h('div', 'abs', world); wait.dataset.name = 'wait'; px(wait, 990, carolY - 30, 600, 60); css(wait, { background: K.yeld, border: '2px solid ' + K.yeld, borderRadius: '8px', transformOrigin: '0 50%' });
  fromTo(wait, T('g23', '排队') - 0.3, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power2.out' });
  tl.to(wait, { scaleX: 0, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, T('g23', '没这么做') - 0.1);
  // g24：Carol 的那一版飞向链的末端，撞上还没提交的 44，被弹回来
  const g45 = vbox(1300, 260, '45', 'page'); g45.dataset.name = 'g45'; css(g45, { opacity: 0, background: K.gd2, borderColor: K.gd2, color: '#FFFFFF' });
  const tHit = T('g24', '同一份') - 0.2;
  tl.fromTo(g45, { autoAlpha: 0, x: 790 - 1300, y: carolY - CY - 40, scale: 0.6 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tHit - 0.9);
  tl.to(g45, { x: -96, y: 0, scale: 1, duration: 0.7, ease: 'power2.in' }, tHit - 0.75);
  tl.to(g45, { x: 20, duration: 0.25, ease: 'power2.out' }, tHit - 0.05);
  tl.to(g45, { x: 790 - 1300, y: carolY - CY - 40, scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, tHit + 0.3);
  const bolt = h('div', 'abs', world, ico('bolt', 64, K.red, 3)); px(bolt, 1206, CY - 70, 64, 64);
  show(bolt, tHit, { y: -10, s: 0.6, d: 0.3 }); sfx('error', tHit + 0.05, { g: 0.6 }); fadeOut(bolt, T('g26') - 0.2, 0.3);
  to(cSpan, tHit + 0.1, { backgroundColor: K.red, borderColor: K.red, duration: 0.3 });
  // g25：Carol 收到的错误（08 回显，键名译成中文）
  const ce = term(world, 960, 210, 860, 130, 'mongosh · Carol', { fs: 22, lh: 36 });
  show(ce.c, T('g25', '收到') - 0.4, { y: 10, d: 0.4 });
  const ceL = ce.out(T('g25', '错误') - 0.2, `{'错误':'WriteConflict','标签':[<span class="tl" style="color:#FFFFFF;border-radius:4px;padding:0 4px">'TransientTransactionError'</span>]}`);
  css(ceL, { background: K.red, color: '#FFFFFF', borderRadius: '6px', padding: '0 10px', display: 'inline-block' });
  const glW = gl(world, LX0, 826, '写冲突', '两个操作同时改同一份数据，一方收到的错误：WriteConflict；<br><i class="l2" style="font-style:normal">还带 TransientTransactionError 标签：整个事务重来</i>', { cls: 'r', key: '写冲突' }); glInline(glW);   // T15 G04 G08
  show(glW, T('g25', '写冲突') - 0.3, { x: 12, y: 0, d: 0.45 });
  const glW2 = glW.querySelector('.l2'); set(glW2, s.start, { autoAlpha: 0 }); show(glW2, T('g26', '标签') - 0.3, { y: 6, d: 0.4 });   // 第二行等说到标签再出
  to([P42, C43, a43, C44, a44, chainHd], T('g26', '整个') - 0.2, { opacity: 0.3, duration: 0.45 }); to([P42, C43, a43, C44, a44, chainHd], T('g27', '提交') - 0.3, { opacity: 1, duration: 0.4 });   // 讲 Carol 整个事务重来：版本链先退后
  // g26：标签那一段亮成黄底
  to(ceL.querySelector('.tl'), T('g26', '标签') - 0.2, { backgroundColor: K.yel, color: K.ink, duration: 0.35 });
  // g27：Alice 提交，44 变成实线；Carol 整个事务重来，这次 45 接在 44 后面
  const dA3 = dot('alice', 1080, T('g27', '提交') - 0.3);
  to(aSpan, T('g27', '提交') - 0.2, { borderColor: K.forest, borderStyle: 'solid', backgroundColor: '#C0FAE6', duration: 0.35 });
  to(C44, T('g27', '提交') - 0.1, { backgroundColor: K.forest, borderColor: K.forest, borderStyle: 'solid', color: '#FFFFFF', duration: 0.35 }); asOk(C44, T('g27', '成功') - 0.4);
  const loop = link(ov, [[930, carolY - 30], [960, carolY - 60], [1180, carolY - 60], [1200, carolY - 30]], 'dim', { w: 2.5, arrow: true }); arrowIn(loop, T('g26', '重来') - 0.3, 0.5);
  const cSpan2 = h('div', 'abs', world); px(cSpan2, 1200, carolY - 28, 300, 56); css(cSpan2, { border: '3px solid ' + K.gd2, background: K.gd2, borderRadius: '12px', transformOrigin: '0 50%' });
  to(cSpan2, T('g27', '成功') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  fromTo(cSpan2, T('g27', '重做') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
  const C45 = vbox(1300, 260, '45', 'ok'); const a45 = link(ov, [[1264, CY + CH / 2], [1296, CY + CH / 2]], 'ink', { w: 3, arrow: true });
  readOn(C45, T('g27', '成功') - 0.25, 'carol'); asOk(C45, T('g28') - 0.2);
  const dC2 = dot('out', 1240, T('g27', '成功') - 0.6); css(dC2, { top: carolY - 11 + 'px', background: '#FFFFFF', borderColor: '#FFFFFF' });
  const [x45] = boxTop(C45); const wC = link(ov, [[1240, carolY + 12], [x45, CY - 4]], 'accent', { w: 3, arrow: true }); arrowIn(wC, T('g27', '成功') - 0.5, 0.45);
  show(C45, T('g27', '成功') - 0.2, { x: -16, y: 0, d: 0.4 }); arrowIn(a45, T('g27', '成功') - 0.2, 0.35);
  const ok = h('div', 'abs', world, ico('check', 46, K.forest, 4)); px(ok, 1510, carolY - 23, 46, 46); show(ok, T('g27', '成功') - 0.1, { y: 0, s: 1.3, d: 0.35 });
  // g28：乐观并发——Carol 那条泳道上没有一段是在等：撞上 → 重来 → 成功
  fadeOut(ce.c, T('g28') - 0.3, 0.4); fadeOut(glW, T('g28') - 0.3, 0.4);
  to(cl, T('g28', '先不') - 0.2, { opacity: 0.9, backgroundColor: K.forest, duration: 0.4 });
  to([chainHd, P42, C43, a43, C44, a44, C45, a45, aSpan, dA2, wA2, dA3, wC, lanes.alice.l, lanes.alice.t], T('g28', '撞上') - 0.2, { opacity: 0.25, duration: 0.45 });
  to(cSpan, T('g28', '重来') - 0.3, { opacity: 0.35, duration: 0.4 });
  to([chainHd, P42, C43, a43, C44, a44, C45, a45, aSpan, dA2, wA2, dA3, wC, lanes.alice.l, lanes.alice.t, cSpan], T('g28', '乐观') - 0.2, { opacity: 1, duration: 0.45 });   // 起名字时，整个过程一起看
  const glO = gl(world, LX0, 826, '乐观并发', '不先加锁排队，等冲突发生了才检查，<br>撞上就让一方重来；WiredTiger 多数读写都这样', { key: '乐观并发' }); glInline(glO);   // T15 G06
  show(glO, T('g28') + 0.1, { x: 12, y: 0, d: 0.45 }); fadeOut(glO, Tend('g36') + 0.5, 0.4);   // 留到章末
  // 章末：mongod 突然被杀——整个舞台熄掉，只剩一个 mongod
  const tEnd = T('g36') - 0.3;
  fadeOut([chainHd, P42, C43, a43, C44, a44, C45, a45, aSpan, cSpan, cSpan2, loop, ok, dA2, wA2, dA3, dC, dC2, wC, cl, ct, ctSub, lanes.alice.l, lanes.alice.t], tEnd, 0.45);
  const kill = h('div', 'abs', world); px(kill, 760, 560, 400, 120); css(kill, { background: K.ink, border: '3px solid ' + K.ink, borderRadius: '14px' });
  kill.innerHTML = `<div style="position:absolute;left:28px;top:30px;font:700 44px Mono;color:#FFFFFF">mongod</div>`;
  show(kill, T('g36') - 0.1, { y: 12, d: 0.45 });
  const kb = h('div', 'abs', kill, ico('bolt', 60, '#FFFFFF', 3)); css(kb, { right: '26px', top: '28px' });
  show(kb, T('g36', '被杀') - 0.3, { y: -10, s: 0.6, d: 0.35 });
  to(kill, T('g36', '被杀') - 0.1, { backgroundColor: K.red, borderColor: K.red, duration: 0.4 }); to(kill, Tend('g36') + 0.2, { opacity: 0.35, duration: 0.5 });
});
