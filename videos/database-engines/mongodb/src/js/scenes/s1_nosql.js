// 第 01 章 NoSQL（第 4 轮重做）：底部一条时间轴，播放头从「2000 年代末」走到「2009 年 8 月」；上面每个年代一幅会动的图——
// 杂样的数据装不进定死的表（记录撞到表边弹回）→ 多加机器、把数据分开 vs 换一台更强的 → DoubleClick 每秒四十多万条广告压在一台库上 → 10gen →
// 2009 年 6 月旧金山的聚会，NoSQL 这个名字罩住上台的几家 → MongoDB 第一个版本；然后是这一类的共同点（非关系型）与四类，落到「文档」。
// 事实：V03（按 MongoDB 的说法：存储变便宜、数据多而杂、横向扩展）、V01（DoubleClick、40 多万条/秒、2007 年 10gen）、V04（2009-06-11 旧金山聚会）、
//       V02（2009 年 8 月第一个版本）、N01（非关系型、四类、键值数据库）、A12（people 里的三份文档）、I04（文档由字段与值组成）。
scene('nosql', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '01 NoSQL');

  // ── 时间轴（前四段常驻） ──
  const TY = 872, NODES = [[300, '2000 年代末'], [800, '2007'], [1220, '2009 年 6 月'], [1600, '2009 年 8 月']];
  const axis = h('div', 'abs', world); px(axis, 160, TY, 1600, 3); css(axis, { background: K.gl1, transformOrigin: '0 50%' });
  const nodes = NODES.map(([x, t]) => {
    const d = h('div', 'abs', world); px(d, x - 9, TY - 8, 18, 18); css(d, { borderRadius: '50%', background: '#fff', border: '3px solid ' + K.gb });
    const l = tg(world, x - 120, TY + 20, t, 'm'); css(l, { width: '240px', textAlign: 'center', color: K.gd1 });
    return { d, l };
  });
  const head = h('div', 'abs', world); px(head, NODES[0][0] - 15, TY - 14, 30, 30); css(head, { borderRadius: '50%', background: K.spring, border: '4px solid ' + K.forest });
  fromTo(axis, c0, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' });
  nodes.forEach((n, i) => { show(n.d, c0 + 0.2 + i * 0.12, { y: 0, s: 0.5, d: 0.4 }); show(n.l, c0 + 0.3 + i * 0.12, { y: 8, d: 0.4 }); });
  show(head, T('n3', '2000') - 0.2, { y: 0, s: 0.4, d: 0.45 });
  const srcC = h('div', 'panel', world); px(srcC, 160, 380, 1000, 150);
  srcC.innerHTML = `<div style="position:absolute;left:28px;top:30px">${ico('server', 56, K.forest, 2.4)}</div><div style="position:absolute;left:110px;top:26px;font:700 38px 'Inter', 'Sans SC';color:${K.forest}">MongoDB 官网 · What is NoSQL?</div><div style="position:absolute;left:110px;top:88px;font:500 24px Mono;color:${K.gd1}">mongodb.com/resources/basics/databases/nosql-explained</div>`;
  show(srcC, T('n3', 'MongoDB') - 0.25, { y: 14, d: 0.5 }); fadeOut(srcC, T('n4') - 0.35, 0.4);   // V03
  const moveHead = (i, t) => { tl.fromTo(head, { x: NODES[i - 1][0] - NODES[0][0] }, { x: NODES[i][0] - NODES[0][0], duration: 0.9, ease: 'power2.inOut', immediateRender: false }, t); to(nodes[i].d, t + 0.7, { borderColor: K.forest, duration: 0.3 }); to(nodes[i].l, t + 0.7, { color: K.forest, duration: 0.3 }); };
  to(nodes[0].d, T('n3', '2000'), { borderColor: K.forest, duration: 0.3 }); to(nodes[0].l, T('n3', '2000'), { color: K.forest, duration: 0.3 });

  // ══ 一、2000 年代末：存储便宜了，数据又多又杂；定死的表装不下 ══
  const P1 = [];
  const disk = icon(world, 160, 226, 'disk', 130, K.gd2, 2.2); P1.push(disk);
  const cheap = tg(world, 310, 236, '存储<br>便宜了', 'big'); css(cheap, { lineHeight: '1.25', fontSize: '50px' }); P1.push(cheap);
  show(disk, T('n4', '存储') - 0.2, { y: 10, d: 0.5 }); show(cheap, T('n4', '便宜') - 0.1, { y: 10, d: 0.5 });
  // 一条条记录：卡片上写的是它有哪几个字段。先是一样的 name、age，越来越多；
  // 「样子也越来越杂」时，各自的字段变得不一样（有的多了 email、tags，有的只剩 name，有的带 address），卡片高度跟着字段数走
  const MIX = [['name', 'age'], ['name', 'email', 'tags'], ['name', 'address'], ['name'], ['name', 'age', 'tags'], ['name', 'email'], ['name', 'age', 'address'], ['name', 'tags'],
    ['name', 'email', 'address'], ['name', 'age'], ['name'], ['name', 'tags', 'email'], ['name', 'address'], ['name', 'age', 'email'], ['name', 'tags'], ['name', 'age', 'tags', 'email']];
  const CH = (n) => 18 + n * 30, PILE = [];
  const tMix = T('n4', '样子') - 0.1;
  for (let i = 0; i < 16; i++) {
    const col = i % 8, row = Math.floor(i / 8);
    const c = h('div', 'abs', world); px(c, 640 + col * 145, 214 + row * 158, 124, CH(2)); css(c, { background: '#fff', border: '2px solid ' + K.gb, borderRadius: '8px', overflow: 'hidden' });
    const fl = (keys) => { const d = h('div', 'abs', c); css(d, { left: '12px', top: '8px', font: '600 22px/30px "Mono"', color: K.blued, whiteSpace: 'pre' }); d.textContent = keys.join('\n'); return d; };
    const a = fl(['name', 'age']), b = fl(MIX[i]);
    set(b, s.start, { autoAlpha: 0 });
    PILE.push(c); P1.push(c);
    show(c, T('n4', '数据') - 0.1 + i * 0.07, { y: 14, d: 0.4 });
    // 变杂：字段换掉，卡片高度跟着变（同一张卡上原地换，不闪）
    const tt = tMix + (i % 8) * 0.06 + row * 0.12;
    if (MIX[i].join() !== 'name,age') {
      tl.to(a, { autoAlpha: 0, duration: 0.2 }, tt);
      tl.to(c, { height: CH(MIX[i].length), duration: 0.32, ease: 'power2.inOut' }, tt);
      tl.to(b, { autoAlpha: 1, duration: 0.25 }, tt + 0.3);
      tl.to(c, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 }, tt + 0.3);   // 框先长到位，字再出来（不被裁）
    }
  }
  // 两份具体的：一份有年龄，一份只有邮箱和标签（A12）
  const dA = docCard(world, 160, 540, [['name', JS('Alice')], ['age', JN(42)]], { w: 400, fs: 31 });
  const dE = docCard(world, 170, 540, [['name', JS('Erin')], ['email', JS('erin@example.com')], ['tags', `[ ${JS('db')}, ${JS('go')} ]`]], { w: 560, fs: 29 });
  css(dE.c, { left: '590px' }); P1.push(dA.c, dE.c);
  show(dA.c, T('n5', '年龄') - 0.4, { y: -30, d: 0.6 });
  show(dE.c, T('n5', '邮箱') - 0.4, { y: -30, d: 0.6 });
  solid(dA.r.age, T('n5', '年龄') - 0.1, 'new'); to([...dA.r.age.querySelectorAll('span')], T('n5', '年龄') - 0.1, { color: '#FFFFFF', duration: 0.35 });
  [dE.r.email, dE.r.tags].forEach((r, i) => { solid(r, T('n5', i ? '标签' : '邮箱') - 0.1, 'new'); to([...r.querySelectorAll('span')], T('n5', i ? '标签' : '邮箱') - 0.1, { color: '#FFFFFF', duration: 0.35 }); });
  // 定死的表：两列 name、age，表头上锁
  const TX = 1180, TWn = 270, TWa = 190, TR = 64;
  const tbl = h('div', 'abs', world); px(tbl, TX, 540, TWn + TWa, TR * 3); P1.push(tbl);
  const cell = (x, y, w, txt, hd) => { const e = h('div', 'mt' + (hd ? ' h' : ''), tbl, txt); px(e, x, y, w, TR); css(e, { font: (hd ? '700' : '500') + ' 30px/61px "Mono"', paddingLeft: '18px' }); return e; };
  cell(0, 0, TWn, 'name', 1); cell(TWn, 0, TWa, 'age', 1);
  const r1n = cell(0, TR, TWn, ''), r1a = cell(TWn, TR, TWa, ''), r2n = cell(0, TR * 2, TWn, ''), r2a = cell(TWn, TR * 2, TWa, '');
  const lock = icon(world, TX + TWn + TWa - 44, 484, 'lock', 44, K.gd2, 2.6); P1.push(lock);
  const tblT = tg(world, TX, 492, 'users 表', 'm'); P1.push(tblT);
  show([tblT, tbl], T('n6') - 0.1, { y: 14, d: 0.55 });
  show(lock, T('n6', '定死') - 0.15, { y: -12, d: 0.4 }); sfx('thud', T('n6', '定死'), { g: 0.5 });
  // Alice 进表：正好两格
  const tFit = T('n6', '这样') - 0.2;
  tl.to(dA.c, { x: TX - 170 + 40, y: 30, scale: 0.8, autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' }, tFit);
  swapAt(r1n, '', 'Alice', tFit + 0.55); swapAt(r1a, '', '42', tFit + 0.55);
  // Erin 进表：name 有格子，age 空着；email、tags 没有列，撞到表的右边弹回来
  const tBump = T('n6', '很难') - 0.35;
  const xs = [['email', 652], ['tags', 699]].map(([k, y], i) => { const e = h('div', 'abs', world, k); px(e, 640, y - 4); css(e, { font: '600 28px "Mono"', color: K.blued, background: '#fff', border: '2px solid ' + K.gb, borderRadius: '8px', padding: '2px 12px' }); P1.push(e); return e; });
  xs.forEach((e, i) => {
    tl.fromTo(e, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tBump - 0.2);
    tl.to(e, { x: 1300 - 640 + i * 20, y: 712 - 644 - i * 35, duration: 0.55, ease: 'power2.in' }, tBump + i * 0.08);
    tl.to(e, { x: 1668 - 640, y: 668 - 652 + i * 64 - i * 47, duration: 0.5, ease: 'back.out(2)' }, tBump + 0.6 + i * 0.08);
    to(e, tBump + 0.6, { borderColor: K.red, color: K.redd, backgroundColor: K.redl, borderStyle: 'dashed', duration: 0.3 });
  });
  to([dE.r.email, dE.r.tags], tBump + 0.6, { backgroundColor: K.redl, color: K.redd, duration: 0.3 }); to([dE.r.email, dE.r.tags].flatMap((r) => [...r.querySelectorAll('span')]), tBump + 0.6, { color: K.redd, duration: 0.3 });
  sfx('blip', tBump + 0.62);
  swapAt(r2n, '', 'Erin', tBump + 0.45); swapAt(r2a, '', '—', tBump + 0.7);
  const noCol = tg(world, 1668, 616, '没有这一列', 'r'); P1.push(noCol); show(noCol, tBump + 0.7, { y: 8, d: 0.4 });
  const tP1 = T('n7') - 0.4;
  fadeOut(P1, tP1, 0.5);

  // ══ 二、云计算：多加几台机器、把数据分开 vs 把一台换得更强（V03） ══
  const P2 = [];
  const cloud = h('div', 'abs', world, '<svg width="120" height="76" viewBox="0 0 120 76" fill="none" stroke="#5C6C75" stroke-width="3" stroke-linejoin="round"><path d="M30 66h62a20 20 0 0 0 2-40 28 28 0 0 0-54-6A22 22 0 0 0 30 66z"/></svg>');
  px(cloud, 1380, 214, 120, 76); P2.push(cloud);
  const cloudT = tg(world, 1510, 236, '云计算', 'b'); P2.push(cloudT);
  show([cloud, cloudT], T('n7', '云') - 0.15, { y: -10, d: 0.5 });
  const SV = [1030, 1220, 1410, 1600], SY = 370;
  const servers = SV.map((x, i) => { const e = icon(world, x, SY, 'server', 160, K.ink, 2.0); P2.push(e); return e; });
  show(servers[0], T('n7') + 0.2, { y: 14, d: 0.5 });
  servers.slice(1).forEach((e, i) => show(e, T('n7', '多加') + i * 0.18, { x: -40, y: 0, d: 0.5 }));
  // 数据块：先都在第一台下面，再分给四台
  const blocks = [];
  for (let i = 0; i < 8; i++) {
    const b = h('div', 'abs', world); px(b, SV[0] + 12 + (i % 4) * 36, SY + 184 + Math.floor(i / 4) * 36, 28, 28); css(b, { background: K.g1, borderRadius: '4px' });
    blocks.push(b); P2.push(b);
    show(b, T('n7') + 0.4 + i * 0.04, { y: 6, d: 0.3 });
    const dst = Math.floor(i / 2), k = i % 2;
    to(b, T('n7', '分散') - 0.25 + i * 0.05, { x: SV[dst] - SV[0] + 44 + k * 36 - (i % 4) * 36, y: (Math.floor(i / 4) === 1 ? -36 : 0), duration: 0.7, ease: 'power2.inOut' });
  }
  const outT = tg(world, 1030, 660, '横向扩展（scale out）：多加机器', 'g'); css(outT, { fontSize: '32px' }); P2.push(outT);
  show(outT, T('n7', '分散') + 0.4, { y: 10, d: 0.5 });
  // 关系数据库：一台机器，换得更强
  const big = h('div', 'abs', world, ico('server', 160, K.ink, 2.0)); px(big, 380, SY, 160, 160); css(big, { transformOrigin: '50% 100%' }); P2.push(big);
  const bigT = tg(world, 320, SY - 60, '关系数据库', 'b'); css(bigT, { width: '280px', textAlign: 'center', fontSize: '32px' }); P2.push(bigT);
  show([big, bigT], T('n8', '关系') - 0.2, { y: 14, d: 0.5 });
  to(big, T('n8', '换得') - 0.2, { scale: 1.6, duration: 0.9, ease: 'power2.inOut' });
  to(bigT, T('n8', '换得') - 0.2, { y: -96, duration: 0.9, ease: 'power2.inOut' });
  const upT = tg(world, 200, 660, '纵向扩展（scale up）：换更强的一台', 'b'); css(upT, { fontSize: '32px' }); P2.push(upT);
  show(upT, T('n8', '关系') + 0.2, { y: 10, d: 0.5 });
  const sep = h('div', 'abs', world); px(sep, 940, 230, 2, 460); css(sep, { background: K.gl2 }); P2.push(sep);
  show(sep, T('n8') - 0.3, { y: 0, d: 0.5 });
  const tP2 = T('n9') - 0.45;
  fadeOut(P2, tP2, 0.5);

  // ══ 三、DoubleClick：每秒四十多万条广告，压在一台关系数据库上（V01）；2007 年 10gen ══
  const P3 = [];
  const dc = h('div', 'panel', world); px(dc, 160, 220, 600, 470); P3.push(dc);
  const dcT = h('div', 'abs', dc, 'DoubleClick'); css(dcT, { left: '30px', top: '24px', font: '700 48px "Inter"', color: K.ink });
  const dcS = h('div', 'abs', dc, '广告公司'); css(dcS, { left: '30px', top: '92px', font: '500 32px "Sans SC"', color: K.gd1 });
  const BR = [0, 1, 2].map((i) => { const b = h('div', 'abs', dc); px(b, 36 + i * 180, 200, 160, 200); css(b, { border: '2px solid ' + K.gb, borderRadius: '8px', background: '#fff' });
    const bar = h('div', 'abs', b); css(bar, { left: 0, right: 0, top: 0, height: '18px', background: K.gl2, borderRadius: '6px 6px 0 0' });
    const ad = h('div', 'abs', b); css(ad, { left: '18px', top: '36px', width: '120px', height: '66px', background: K.mint, border: '1.5px solid ' + K.g1, borderRadius: '4px' });
    for (let k = 0; k < 3; k++) { const ln = h('div', 'abs', b); css(ln, { left: '18px', top: 120 + k * 22 + 'px', width: 120 - k * 24 + 'px', height: '8px', background: K.gl2, borderRadius: '3px' }); } return b; });
  show(dc, T('n9', '广告') - 0.3, { y: 16, d: 0.6 });
  BR.forEach((b, i) => to(b.children[1], T('n9', 'Double') - 0.1 + i * 0.12, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }));
  // 一台关系数据库，右边一根负载条
  const db1 = icon(world, 1150, 300, 'server', 190, K.ink, 2.0); P3.push(db1);
  const db1T = tg(world, 1110, 506, '关系数据库', 'b'); css(db1T, { width: '270px', textAlign: 'center', fontSize: '32px' }); P3.push(db1T);
  const load = h('div', 'abs', world); px(load, 1370, 300, 38, 190); css(load, { border: '2px solid ' + K.gb, borderRadius: '6px' }); P3.push(load);
  const lf = h('div', 'abs', load); css(lf, { left: '3px', right: '3px', bottom: '3px', height: '30%', background: K.g1, borderRadius: '3px' });
  show([db1, db1T, load], T('n11') - 0.3, { y: 14, d: 0.5 });
  // 广告请求：一串小块从网页流向数据库（只由 t 决定位置）
  const tS0 = T('n11') + 0.2, tS1 = T('n12', '扩展') + 0.8, NT = 14;
  const toks = [];
  for (let k = 0; k < NT; k++) { const e = h('div', 'abs', world); px(e, 0, 0, 22, 22); css(e, { background: K.g1, borderRadius: '4px', opacity: 0 }); toks.push(e); P3.push(e); }
  F((t) => {
    const on = t >= tS0 && t < tS1 + 0.6;
    toks.forEach((e, k) => {
      if (!on) { e.style.opacity = 0; return; }
      const sp = t < T('n12', '亮') ? 0.9 : 1.6;           // 量上去以后流得更快
      const ph = ((t - tS0) * sp + k / NT) % 1;
      const sx = 760, sy = 330 + (k % 3) * 90, ex = 1150, ey = 400;
      const jam = t > T('n12', '很难') ? Math.min(1, (t - T('n12', '很难')) / 0.6) : 0;   // 堵住：停在库前面排队
      const p = jam ? Math.min(ph, 0.86 - (k % 5) * 0.035) : ph;
      e.style.transform = `translate(${lerp(sx, ex, p)}px, ${lerp(sy, ey, p)}px)`;
      e.style.opacity = String(Math.min(1, (t - tS0) * 3) * (p > 0.97 ? 0 : 1) * (t > tS1 ? Math.max(0, 1 - (t - tS1) / 0.6) : 1));
      e.style.background = jam ? K.red : K.g1;
    });
  });
  const cnt = h('div', 'abs', world, '0'); px(cnt, 1300, 586, 500); css(cnt, { font: '800 110px "Inter"', color: K.ink, textAlign: 'right' }); P3.push(cnt);
  const cntT = tg(world, 1300, 722, '条广告 / 秒', 'b'); css(cntT, { width: '500px', textAlign: 'right', fontSize: '32px' }); P3.push(cntT);
  show([cnt, cntT], T('n11', '四十') - 0.4, { y: 10, d: 0.4 });
  stepTo(cnt, [[T('n11', '四十') - 0.2, 1.1, 0, 400000]], (v) => Math.round(v).toLocaleString('en-US') + (v >= 399999 ? '+' : ''));
  // 量一上去：负载条涨满变红，库的轮廓变红
  to(lf, T('n12', '亮') - 0.1, { height: '96%', backgroundColor: K.red, duration: 1.8, ease: 'power2.in' });
  to(db1.firstChild, T('n12', '很难') - 0.1, { stroke: K.red, duration: 0.4 });
  to(load, T('n12', '很难') - 0.1, { borderColor: K.red, duration: 0.4 });
  sfx('error', T('n12', '很难'), { g: 0.5 });
  to(cnt, T('n12', '亮') - 0.1, { color: K.red, duration: 0.5 });
  res(world, 1130, 236, '很难扩展', 'del', T('n12', '关系') - 0.1, { out: T('n13') - 0.3 });
  // 2007：播放头走到 2007，10gen
  moveHead(1, T('n13', '2007') - 0.3);
  fadeOut([dc, db1, db1T, load, cnt, cntT], T('n13') - 0.3, 0.45);
  const gen = h('div', 'panel', world); px(gen, 640, 470, 320, 210); css(gen, { borderColor: K.g1, borderWidth: '3px' }); P3.push(gen);
  const genT = h('div', 'abs', gen, '10gen'); css(genT, { left: 0, top: '44px', width: '320px', textAlign: 'center', font: '800 64px "Inter"', color: K.forest });
  const genS = h('div', 'abs', gen, '后来的 MongoDB 公司'); css(genS, { left: 0, top: '134px', width: '320px', textAlign: 'center', font: '500 26px "Sans SC"', color: K.gd2 });
  const genL = link(ov, [[800, 680], [800, TY - 12]], 'accent', { w: 3 }); P3.push(genL);
  show(gen, T('n13', '2007') + 0.4, { y: 20, d: 0.6 }); draw(genL, T('n13', '2007') + 0.8, 0.5);
  solid(gen, T('n13', 'ten') - 0.1, 'new'); to([genT, genS], T('n13', 'ten') - 0.1, { color: '#FFFFFF', duration: 0.35 });
  fadeOut(genL, Tend('n13') + 0.4, 0.3); tl.to(gen, { y: 120, scale: 0.75, duration: 0.8, ease: 'power2.inOut' }, Tend('n13') + 0.5);
  show(genS, T('n13', 'ten') + 0.2, { y: 8, d: 0.4 });
  const tP3 = T('n15') - 0.4;
  fadeOut([gen], tP3, 0.5);

  // ══ 四、2009 年 6 月旧金山的聚会（V04）：上台的几家，NoSQL 这个名字罩住它们；两个月后 MongoDB 第一个版本（V02） ══
  const P4 = [];
  moveHead(2, T('n15', '2009') - 0.3);
  const date = h('div', 'abs', world, '2009 年 6 月 11 日 · 旧金山'); px(date, 160, 222); css(date, { font: '700 40px/66px "Inter", "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '12px', padding: '0 22px' }); P4.push(date);
  const dateS = tg(world, 160, 304, '一场新数据库的聚会', ''); css(dateS, { font: '700 32px/56px "Sans SC"', color: '#FFFFFF', background: K.forest, borderRadius: '10px', padding: '0 18px' }); P4.push(dateS);
  show(date, T('n15', '旧金山') - 0.4, { y: 12, d: 0.5 }); show(dateS, T('n15', '聚会') - 0.2, { y: 8, d: 0.45 });
  const stage = h('div', 'abs', world); px(stage, 160, 690, 1600, 4); css(stage, { background: K.gb, transformOrigin: '0 50%' }); P4.push(stage);
  fromTo(stage, T('n15', '旧金山') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' });
  const slots = [0, 1, 2, 3].map((i) => { const e = h('div', 'abs', world); px(e, 210 + i * 390, 450, 350, 210); css(e, { border: '3px dashed ' + K.gl1, borderRadius: '16px' }); e.dataset.name = 'slot'; show(e, T('n15', '聚会') - 0.1 + i * 0.1, { y: 10, d: 0.4 }); fadeOut(e, T('n16') + 3.2, 0.4); return e; });
  const PR = [['Cassandra', 'n16', 'Cassandra'], ['HBase', 'n16', 'HBase'], ['CouchDB', 'n16', 'CouchDB'], ['MongoDB', 'n16', 'MongoDB']];
  const pres = PR.map(([n, id, w], i) => {
    const c = h('div', 'panel', world); px(c, 210 + i * 390, 450, 350, 210); css(c, { background: K.gl2 }); P4.push(c);
    icon(c, 24, 24, 'server', 64, i === 3 ? K.forest : K.gd2, 2.4);
    const t = h('div', 'abs', c, n); css(t, { left: '24px', top: '110px', font: '700 48px "Inter"', color: i === 3 ? K.forest : K.ink });
    show(c, T(id, w) - 0.25, { y: 40, d: 0.55 });
    return c;
  });
  // NoSQL 这个名字：一道括号罩住上台的几家
  const nsB = h('div', 'abs', world); px(nsB, 210, 410, 1520, 18); css(nsB, { borderLeft: '3px solid ' + K.forest, borderRight: '3px solid ' + K.forest, borderTop: '3px solid ' + K.forest }); P4.push(nsB);
  const nsT = h('div', 'abs', world, 'NoSQL'); px(nsT, 210, 310, 1520); css(nsT, { font: '800 80px "Inter"', color: K.forest, textAlign: 'center' }); P4.push(nsT);
  show(nsB, T('n18', 'No') - 0.3, { y: 10, d: 0.45 }); show(nsT, T('n18', 'No') - 0.15, { y: 18, s: 0.9, d: 0.55 });
  fadeOut([date, dateS], T('n18', 'No') - 0.4, 0.4);
  pres.forEach((c, i) => glow(c, T('n18', '传开') - 0.3 + i * 0.12, T('n19') + 0.2, { bg: K.mint, bd: K.g1 }));
  // 两个月后：播放头到 2009 年 8 月，MongoDB 那张卡落到时间轴上
  moveHead(3, T('n19', '两个') - 0.3);
  fadeOut(stage, T('n19', 'MongoDB') - 0.5, 0.4);
  tl.to(pres[3], { x: 1600 - 175 - (210 + 3 * 390), y: 150, scale: 0.8, duration: 0.9, ease: 'power2.inOut' }, T('n19', 'MongoDB') - 0.3);
  solid(pres[3], T('n19', '发布') - 0.1, 'new'); to(pres[3].children[1], T('n19', '发布') - 0.1, { color: '#FFFFFF', duration: 0.35 }); to(pres[3].querySelector('svg'), T('n19', '发布') - 0.1, { attr: { stroke: '#FFFFFF' }, duration: 0.35 });
  const v1 = tg(world, 1250, 600, '第一个版本', 'g'); css(v1, { width: '300px', textAlign: 'right', fontSize: '30px' }); P4.push(v1);
  show(v1, T('n19', '第一') - 0.2, { x: 16, y: 0, d: 0.45 });

  // ══ 五、这一类的共同点（V04、N01）：时间轴收起，NoSQL 和几家留在上面 ══
  const tP5 = T('n24') - 0.4;
  fadeOut([axis, head, ...nodes.map((n) => n.d), ...nodes.map((n) => n.l), stage, v1], tP5, 0.5);
  fadeOut([...pres, nsB], tP5, 0.5);
  tl.to(nsT, { y: 206 - 310, duration: 0.8, ease: 'power2.inOut' }, tP5 + 0.1);
  const TRX = [180, 740, 1300], TRY = 520;
  const trait = (i, ic, txt) => {
    const g = h('div', 'abs', world); px(g, TRX[i], TRY, 460, 300);
    const ib = h('div', 'abs', g, ico(ic, 130, K.ink, 2.0)); css(ib, { left: '0', top: '0' });
    const tt = h('div', 'abs', g, txt); css(tt, { left: '0', top: '170px', font: '700 46px "Sans SC"', color: K.ink, whiteSpace: 'nowrap' });
    return { g, ib, tt };
  };
  const t1 = trait(0, 'table', '不用关系表和 SQL'), t2 = trait(1, 'doc', '随时加字段'), t3 = trait(2, 'cluster', '在一大群机器上跑');
  const tx = h('div', 'abs', t1.g, ico('x', 130, K.gd2, 3.4)); css(tx, { left: 0, top: 0 });
  css(t1.tt, { padding: '0 16px', borderRadius: '10px', marginLeft: '-16px', background: K.gd1, color: '#FFFFFF' });
  set(t1.tt, s.start, { autoAlpha: 0 }); show(t1.tt, T('n24', '关系表') - 0.2, { y: 10, d: 0.45 });
  show(t1.g, T('n24', '没有') - 0.1, { y: 16, d: 0.55 }); show(tx, T('n24', '不用') - 0.1, { y: 0, s: 1.3, d: 0.4 });
  css(tx, { color: K.red }); tx.innerHTML = ico('x', 130, K.red, 3.6);
  res(world, 180, 400, '没有统一的定义', 'ink', T('n24', '统一') - 0.15, { out: T('n28') - 0.45 });
  show(t2.g, T('n25', '记录') - 0.1, { y: 16, d: 0.55 });
  const plus = h('div', 'abs', t2.g, '+ email'); css(plus, { left: '150px', top: '40px', font: '700 34px "Mono"', color: '#FFFFFF', background: K.forest, borderRadius: '8px', padding: '4px 14px' });
  show(plus, T('n25', '加字段') - 0.15, { x: -30, y: 0, d: 0.5 }); sfx('pop', T('n25', '加字段'));
  show(t3.g, T('n25', '一大群') - 0.3, { y: 16, d: 0.55 });
  const mini = [];
  for (let i = 0; i < 6; i++) { const sh = h('div', 'abs', t3.g); css(sh, { left: 164 + (i % 3) * 64 + 'px', top: 54 + Math.floor(i / 3) * 64 + 'px', width: '28px', height: '16px', background: K.forest, borderRadius: '3px' }); show(sh, T('n25', '运行') - 0.2 + i * 0.06, { y: -8, d: 0.3 });
    const e = h('div', 'abs', t3.g, ico('server', 56, K.gd2, 2.4)); css(e, { left: 150 + (i % 3) * 64 + 'px', top: 6 + Math.floor(i / 3) * 64 + 'px' }); mini.push(e); show(e, T('n25', '机器') - 0.2 + i * 0.07, { y: 10, d: 0.35 }); }
  css(t1.tt, { padding: '0 16px', borderRadius: '10px', marginLeft: '-16px' }); solid(t1.tt, T('n27', '不按') - 0.1, 'new');
  // 非关系型数据库：贴在 NoSQL 那个名字下面
  const glN = gl(world, 1150, 222, '非关系型数据库', '不按关系表存数据的这一类', { cls: 'lg' });
  show(glN, T('n27', '非关系') - 0.3, { x: 16, y: 0, d: 0.55 });
  to(t3.g, T('n27', '不按') - 0.1, { opacity: 0.35, duration: 0.5 }); to(t2.g, T('n27', '不按') - 0.1, { opacity: 0.35, duration: 0.5 });
  css(glN.querySelector('b'), { borderRadius: '8px', padding: '0 12px', marginLeft: '-12px' }); to(glN.querySelector('b'), T('n27', '数据库') - 0.1, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.4 });
  const tP6 = T('n28') - 0.4;
  fadeOut([t1.g, t2.g, t3.g, glN], tP6, 0.5);

  // ══ 六、四类（N01）：文档、键值、宽列、图；MongoDB 属于文档；Alice 那份资料就是一份文档（I04） ══
  const CAT = [['文档', 'doc'], ['键值', 'kv'], ['宽列', 'wide'], ['图', 'graph']];
  const KX = 170, KW = 375, KG = 40, KY = 390, KH = 440;
  const cats = CAT.map(([n, ic], i) => {
    const c = h('div', 'panel', world); px(c, KX + i * (KW + KG), KY, KW, KH);
    const t = h('div', 'abs', c, n); css(t, { left: '28px', top: '22px', font: '700 50px "Sans SC"', color: K.ink });
    const b = h('div', 'abs', c); css(b, { left: '28px', top: '116px', right: '24px', bottom: '24px' });
    return { c, t, b };
  });
  // 每一类里一幅小图
  cats[0].b.innerHTML = `<div style="font:500 28px/1.6 Mono;color:${K.ink};white-space:pre">{\n  <span class="k">name</span>: <span class="s">"Erin"</span>,\n  <span class="k">tags</span>: [ <span class="s">"db"</span>, <span class="s">"go"</span> ]\n}</div>`;
  cats[1].b.innerHTML = [0, 1, 2].map((k) => `<div style="display:flex;gap:12px;align-items:center;margin-bottom:28px"><span style="font:600 30px Mono;padding:8px 16px;border:2px solid ${K.gb};border-radius:6px">k${k + 1}</span><span style="font:600 26px Inter;color:${K.gd1}">→</span><span style="font:500 30px Mono;padding:8px 16px;background:${K.gl3};border:2px solid ${K.gl2};border-radius:6px">v${k + 1}</span></div>`).join('');
  cats[2].b.innerHTML = [3, 5, 2, 4].map((n, r) => `<div style="display:flex;gap:7px;margin-bottom:18px"><span style="width:50px;height:46px;background:${K.ink};border-radius:4px"></span>${Array.from({ length: n }, () => `<span style="width:38px;height:46px;background:${K.gl2};border:1.5px solid ${K.gl1};border-radius:4px"></span>`).join('')}</div>`).join('');
  cats[3].b.innerHTML = `<svg width="320" height="270" viewBox="0 0 300 240" fill="none" stroke="${K.gd2}" stroke-width="3"><path d="M50 60 L150 30 L250 80 L190 190 L80 170 Z M150 30 L190 190 M50 60 L190 190"/>${[[50, 60], [150, 30], [250, 80], [190, 190], [80, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#fff"/>`).join('')}</svg>`;
  const catT = [T('n28', '文档'), T('n28', '键值'), T('n28', '宽列'), T('n28', '图')];
  cats.forEach((c, i) => show(c.c, catT[i] - 0.25, { y: 24, d: 0.5 }));
  const nsB2 = h('div', 'abs', world); px(nsB2, KX, 334, 4 * KW + 3 * KG, 18); css(nsB2, { borderLeft: '3px solid ' + K.forest, borderRight: '3px solid ' + K.forest, borderTop: '3px solid ' + K.forest });
  show(nsB2, T('n28', '四类') - 0.2, { y: 10, d: 0.45 });
  // 键值：这个系列的最后一集还会遇到
  to(cats[1].c, T('n29', '键值') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); to(cats[1].c, T('n30') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.4 });
  const p7 = res(world, KX + (KW + KG) + 28, KY + KH + 20, 'PART 7 · 系列最后一集', 'ink', T('n29', '最后') - 0.2, { fs: 28, lh: 50 });
  // MongoDB 属于文档：名字落进「文档」那一格
  const mg = chip(world, KX + 160, KY + 30, 'MongoDB', 'sp'); css(mg, { fontSize: '30px' });
  tl.fromTo(mg, { autoAlpha: 0, y: -120 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('n30', 'MongoDB') - 0.15);
  to(cats[0].c, T('n30', '文档') - 0.15, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.4 });
  // 开头 Alice 那份资料：其余三类退下，「文档」那一格里换成她的文档，字段与值各指一下
  const tAl = T('n31') - 0.1;
  fadeOut([cats[1].c, cats[2].c, cats[3].c, p7, nsB2], tAl, 0.5);
  fadeOut(cats[0].b, tAl, 0.4);
  tl.to(cats[0].c, { width: 960, height: 440, duration: 0.7, ease: 'power2.inOut' }, tAl + 0.2);
  const ad = docCard(world, KX + 40, KY + 120, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 640, fs: 33 });
  css(ad.c, { borderColor: K.g1 });
  show(ad.c, T('n31', 'Alice') - 0.2, { y: 14, d: 0.55 }); to(ad.c, T('n31', 'Mongo') - 0.2, { backgroundColor: K.mint, duration: 0.4 });
  const keys = [...ad.c.querySelectorAll('.k')], vals = [...ad.c.querySelectorAll('.dv')];
  to(keys, T('n31', '文档') + 0.2, { backgroundColor: K.bluel, duration: 0.4 });
  to(vals, T('n31', '文档') + 0.7, { backgroundColor: K.mint2, duration: 0.4 });
  const fk = res(world, KX + 1010, KY + 190, '字段', 'ink', Tend('n31') + 0.5), fv = res(world, KX + 1150, KY + 190, '值', 'new', Tend('n31') + 0.9);
  const glD = gl(world, KX + 1010, KY + 40, '文档', 'MongoDB 里的一条记录<br>由字段和值组成', { cls: 'lg' });
  show(glD, T('n31', '文档') - 0.3, { x: 16, y: 0, d: 0.5 });
  ['_id', 'name', 'age'].forEach((k, i) => to(ad.r[k], Tend('n31') + 0.2 + i * 0.4, { color: K.forest, duration: 0.35 }));
  res(world, KX + 1010, KY + 290, '= 一份文档', 'new', T('n31', '文档') + 0.6);
});
