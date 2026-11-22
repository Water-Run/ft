// 第 06 章 改（第 4 轮重做）：上面内存里的集合树，下面磁盘上的集合文件（collStage）。
// 改年龄：两个索引不用动；内存里 2050 这一项上挂新版本，连成更新链，旧的 42 留给正在读的人 → 文件不变 →
// 检查点：第二个叶页不回原处，整页写到文件末尾，根页也重写一份 → 47 个字节里只变了 1 个，却写了整页 24 KB →
// 上一个检查点的页原样留着（新的写一半出事还能回去），写完旧页的地方才空出来 → 文件 96 KB → 132 KB。
// 事实：D01（更新链）、D02（索引键 0 增 0 删）、D03（检查点前文件不变）、D04（叶页 28672 → 98304，根页 86016 → 122880，135,168 字节）、
//       D05（旧页空出可复用）、D06（写新检查点期间上一个仍有效）、D07（2a → 2b）、B02（不覆盖写）、B04（叶页 24,576 字节）。
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  chrome(root, s, '06 改');
  const V = collStage(world, null, c0);
  const ov = V.ov;
  const sc = V.band.sc, X = (o) => V.band.xOf(o);
  css(V.size, { borderRadius: '12px', padding: '0 16px', lineHeight: '66px', top: '674px' });
  const rowOn = (t, kind) => solid(V.rows[1], t, kind);
  const rowOff = (t) => to(V.rows[1], t, { backgroundColor: K.gl3, borderColor: K.gl3, color: K.gd2, duration: 0.35 });

  rowOn(T('e1', '找到') - 0.1, 'new');
  // 起点：96 KB（e1a）；命令（05 回显）
  solid(V.size, T('e1a', '九十') - 0.1, 'new', [T('e1a', '九十') + 1.4, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]);
  const age = h('div', 'abs', world, '<span style="font:600 34px Mono;opacity:.75">age</span> 42 → 43'); px(age, 420, 228); css(age, { background: K.ink, borderRadius: '12px', padding: '0 20px', lineHeight: '70px', font: '800 52px "Inter"', color: K.spring });
  show(age, T('e1', '改') - 0.2, { x: -16, y: 0, d: 0.45 });
  solid(V.rows[1], T('e1b', '过生日') - 0.2, 'ink'); to(age, T('e1b', '过生日') - 0.1, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 }); to(V.leaves[1].c, T('e1b') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(age, T('e1b', '43') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  textAt(age, [[0, '<span style="font:600 34px Mono;opacity:.75">age</span> 42'], [T('e1b', '43') - 0.2, '<span style="font:600 34px Mono;opacity:.75">age</span> 42 → 43']]);
  // 先用姓名索引找到她；名字和 RecordId 没变，两个索引不用动（D02：新增 0、删除 0）
  solid(V.ix[1], T('e2', '姓名') - 0.2, 'new');
  V.ix.forEach((e, i) => solid(e, T('e3', '不用') - 0.2 + i * 0.1, K.gd1, [T('e4') - 0.1, '#FFFFFF', K.gl1, K.gd2]));
  rowOff(T('e3') - 0.1);
  res(world, 1180, 580, '名字、RecordId 都没变', 'ink', T('e3', 'RecordId') - 0.2, { out: T('e4') + 0.6 });
  V.ix.forEach((e, i) => swapAt(e.querySelector('.ok'), '', '不用动', T('e3', '不用') - 0.2 + i * 0.1));
  // 只有集合树里 2050 这一项
  rowOn(T('e4', '二') - 0.2, 'new');
  to(V.leaves[1].c, T('e4', '要改') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(V.leaves[1].c, T('e9') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
  solid(V.rows[1], T('e5', '42') - 0.2, 'ink');
  to(V.root, T('e5') - 0.1, { opacity: 0.35, duration: 0.45 }); to(V.root, T('e10', '检查点') - 0.3, { opacity: 1, duration: 0.45 });
  // 更新链：叶页三、四先让开，链挂在 2050 这一项右边
  const tCh = T('e5') - 0.2;
  to([V.leaves[2].c, V.leaves[3].c], tCh, { opacity: 0, duration: 0.45 });
  const RY = V.LY + 52 + 46;             // 2050 那一行的上沿
  const vbox = (txt, x, cls) => { const e = h('div', 'abs', world, txt); px(e, x, RY - 8, 200, 56); css(e, { borderRadius: '10px', font: '800 34px/52px "Mono"', textAlign: 'center', ...(cls === 'new' ? { background: K.forest, color: '#FFFFFF', border: '2px solid ' + K.forest } : { background: K.gd1, color: '#FFFFFF', border: '2px solid ' + K.gd1 }) }); return e; };
  const keep42 = tg(world, 990, RY + 62, '42 留在页上，不擦', 'b'); css(keep42, { fontSize: '28px', lineHeight: '50px', color: '#FFFFFF', background: K.ink, borderRadius: '10px', padding: '0 16px' });
  show(keep42, T('e5', '擦掉') - 0.3, { x: 12, y: 0, d: 0.4 }); fadeOut(keep42, T('e7') - 0.3, 0.3);
  const v43 = vbox('43', 990, 'new');
  const a43 = link(ov, [[912, RY + 20], [986, RY + 20]], 'ink', { w: 3, arrow: true });
  show(v43, T('e6', '挂') - 0.1, { x: -24, y: 0, d: 0.45 }); to(v43, T('e6', '43') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 }); arrowIn(a43, T('e6', '挂') - 0.1, 0.35);
  const vN = vbox('再改…', 1250, 'old');
  const aN = link(ov, [[1192, RY + 20], [1246, RY + 20]], 'dim', { w: 3, arrow: true });
  show(vN, T('e7', '再改') - 0.2, { x: -24, y: 0, d: 0.45 }); arrowIn(aN, T('e7', '再挂') - 0.25, 0.3);
  const glU = gl(world, 990, 516, '更新链', '一项上挂着的新旧版本');
  const chainB = h('div', 'abs', world); px(chainB, 976, RY - 22, 500, 84); css(chainB, { border: '3px solid ' + K.g1, background: '#7DEBB0', borderRadius: '14px' }); world.insertBefore(chainB, v43);
  show(chainB, T('e6', '挂') - 0.2, { y: 0, s: 1.02, d: 0.4 });
  res(world, 1490, 448, '更新链', 'new', T('e7', '更新') - 0.2, { out: T('e10', '检查点') - 0.3 }); fadeOut(chainB, T('e10', '检查点') - 0.3, 0.45);
  show(glU, T('e7', '更新') - 0.3, { y: 10, d: 0.5 }); to(chainB, T('e7', '一串') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  // 旧的 42 还留着：有人同时在读
  rowOn(T('e8', '42') - 0.2, 'read');
  const reader = h('div', 'abs', world, ico('person', 44, '#FFFFFF', 2.8) + '<span style="font:700 26px Sans SC;color:#FFFFFF;vertical-align:12px;margin-left:8px">正在读的人看 42</span>'); px(reader, 990, 382);
  css(reader, { background: K.blue, borderRadius: '12px', padding: '8px 20px' });
  show(reader, T('e8', '有人') - 0.2, { y: -10, d: 0.45 });
  to(v43, T('e8') - 0.1, { opacity: 0.25, duration: 0.4 }); to(V.leaves[1].c, T('e8', '用到') - 0.2, { backgroundColor: '#9CCBFF', duration: 0.35 });
  to(V.leaves[1].c, T('e8', '42') - 0.2, { backgroundColor: '#B9DAFF', borderColor: K.blue, duration: 0.35 });
  const rdA = link(ov, [[984, 412], [916, 452]], 'blue', { w: 3, arrow: true }); arrowIn(rdA, T('e8', '用到') - 0.2, 0.4);
  // 文件大小没变，改动还在缓存里：叶页标成「改过」
  const dot = h('div', 'abs', V.leaves[1].c); css(dot, { right: '12px', top: '10px', width: '22px', height: '22px', borderRadius: '50%', background: K.yel, border: '2px solid ' + K.yeld });
  show(dot, T('e9', '缓存') - 0.3, { y: 0, s: 0.3, d: 0.35 });
  solid(V.size, T('e9') - 0.3, 'new', [T('e9', '大小') + 1.0, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]);
  to(V.leaves[1].c, T('e9', '缓存') - 0.3, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 }); to(V.leaves[1].c, T('e12', '新的'), { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
  // 检查点：链收起，叶页三、四回来
  const tK = T('e10', '检查点') - 0.3;
  fadeOut([v43, a43, vN, aN, glU, reader, age, rdA], tK, 0.45);
  to(V.rows[1], tK, { color: K.ink, duration: 0.35 });
  to([V.leaves[2].c, V.leaves[3].c], tK, { opacity: 1, duration: 0.45 });
  to(V.rows[1], tK, { backgroundColor: K.gl3, duration: 0.35 });
  textAt(V.rows[1], [[0, V.rows[1].innerHTML], [tK + 0.2, `<b style="color:inherit">2050</b>  Alice · 43`]]);
  // 这一页往下写：先朝原来的位置去，停住，再拐到文件末尾（e11、e12）
  const gh = ghostPage(world, V.LX(1), V.LY, V.LW, V.LH);
  const gx0 = V.LX(1), gy0 = V.LY;
  tl.fromTo(gh, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: X(40960) - (gx0 + V.LW / 2), y: 600 - gy0, scale: 0.45, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('e10', '写回') - 0.3);
  const noX = h('div', 'abs', world, ico('x', 64, K.red, 4)); px(noX, X(40960) - 32, 700, 64, 64);
  show(noX, T('e11', '原来') - 0.2, { y: 0, s: 1.4, d: 0.35 }); fadeOut(noX, T('e12', '写到') - 0.1, 0.35);
  to(V.leaves[1].c, T('e12', '整个') - 0.1, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 });
  res(world, X(40960) - 150, 630, '不写回原处', 'del', T('e11', '原来') - 0.3, { fs: 36, lh: 64, pad: 26, out: T('e12', '写到') - 0.1 });
  res(world, 170, 698, '整页重新整理，写成新的一块', 'new', T('e12', '整个') - 0.1, { fs: 30, lh: 52, out: T('e13') - 0.3 });   // D03 B02
  tl.to(gh, { x: X(110592) - (gx0 + V.LW / 2), y: 640 - gy0, scale: 0.4, duration: 0.9, ease: 'power2.inOut' }, T('e12', '写到') - 0.3);
  tl.to(gh, { y: 700 - gy0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, T('e12', '新的') - 0.1);
  revealBand(V, T('e12', '末尾') - 0.3, 98304, 126976, 0.8);
  const n2 = V.band.blk(98304, 122880, 'n', '1225–2448'); show(n2, T('e12', '新的'), { y: 0, s: 0.7, d: 0.4 }); solid(n2, T('e12', '新的'), 'new'); if (n2._t) to(n2._t, T('e12', '新的'), { color: '#FFFFFF', duration: 0.35 }); sfx('thud', T('e12', '新的') + 0.1, { g: 0.5 });
  fadeOut(dot, T('e12', '新的'), 0.3);
  fadeOut(V.drop[1], T('e12', '新的') - 0.1, 0.3);
  [0, 2, 3].forEach((i) => tl.to(V.drop[i], { autoAlpha: 0, duration: 0.3 }, T('e12', '新的') - 0.1));
  const drop2 = link(ov, [[V.LX(1) + V.LW / 2, V.LY + V.LH], [V.LX(1) + V.LW / 2, 604], [X(110592), 604], [X(110592), 756]], 'accent', { w: 2.5, dashed: '6 6' }); arrowIn(drop2, T('e12', '新的') + 0.1, 0.5);
  fadeOut(drop2, T('e17', '原地') - 0.4, 0.3); [0, 2, 3].forEach((i) => tl.to(V.drop[i], { autoAlpha: 1, duration: 0.4 }, T('e17', '原地') - 0.3));
  // 47 个字节里只变了 1 个：2a → 2b（D07）
  const tB = T('e13') - 0.2;
  const bz = h('div', 'abs', world); px(bz, 990, 392, 780, 168); css(bz, { background: K.ink, border: '2px solid ' + K.ink, borderRadius: '10px' });
  const BB = ['10', '61', '67', '65', '00', '2a', '00', '00', '00', '00'];
  bz.innerHTML = `<div style="position:absolute;left:18px;top:10px;font:600 22px 'Sans SC';color:${K.spring}">Alice 那一项的最后 10 个字节</div>` + BB.map((b, i) => `<span class="bb" style="position:absolute;left:${18 + i * 76}px;top:48px;width:68px;height:56px;border-radius:6px;border:2px solid #3D4F58;background:#1C2D38;font:600 28px/52px Mono;text-align:center;color:#C1C7C6">${b}</span>`).join('');
  [[0, 1, 'int 类型'], [1, 5, '字段名 age 和 0'], [5, 9, '值：4 字节整数'], [9, 10, '结尾']].forEach(([a, b, t]) => { const e = h('div', 'abs', bz, t); css(e, { left: 18 + a * 76 + 'px', top: '112px', width: (b - a) * 76 - 8 + 'px', textAlign: 'center', font: '600 22px/40px "Inter", "Sans SC"', color: '#E8EDEB', borderTop: '2px solid #889397', whiteSpace: 'nowrap' }); });   // A04 A16
  to([V.leaves[2].c, V.leaves[3].c], tB - 0.2, { opacity: 0, duration: 0.4 });
  show(bz, tB, { y: 10, d: 0.45 });
  const b5 = bz.querySelectorAll('.bb')[5];
  to(b5, T('e13', '42') - 0.1, { backgroundColor: K.spring, borderColor: K.forest, color: K.ink, duration: 0.35 });
  swapAt(b5, '2a', '2b', T('e13', '43') - 0.2);
  res(world, 990, 572, '47 个字节里只变了 1 个', 'new', T('e13', '一个') - 0.2, { out: T('e14', '整页') - 0.2 });
  to(bz, T('e13', '43') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.4 }); to(bz.firstChild, T('e13', '43') - 0.2, { color: '#FFFFFF', duration: 0.4 });
  res(world, X(98304) - 30, 636, '整页重写 24 KB', 'new', T('e14', '整页') - 0.2, { out: T('e15', '根页') - 0.4 });
  // 却写了整页 24 KB
  const k24 = n2._t; textAt(k24, [[0, '1225–2448'], [T('e14', '二十') - 0.3, '1225–2448 · 24 KB']]);
  to(bz, T('e14', '整页') - 0.2, { opacity: 0.4, duration: 0.45 });
  to(n2, T('e14', '整页') - 0.2, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); if (n2._t) to(n2._t, T('e14', '整页') - 0.2, { color: K.ink, duration: 0.35 });
  to(n2, T('e14', '一遍') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); if (n2._t) to(n2._t, T('e14', '一遍') - 0.2, { color: '#FFFFFF', duration: 0.35 });   // 重新写了一遍：写成
  // 叶页换了位置，根页也重写一份（122880）
  const tR = T('e15', '根页') - 0.3;
  fadeOut(bz, tR - 0.3, 0.35);
  to([V.leaves[2].c, V.leaves[3].c], tR - 0.2, { opacity: 1, duration: 0.4 });
  const r2 = V.band.blk(122880, 126976, 'r'); show(r2, tR + 0.4, { y: 0, s: 0.7, d: 0.4 });
  res(world, X(122880) - 40, 590, '新根页', 'ink', T('e15', '根页') + 0.2, { fs: 26, lh: 46, out: T('e16') + 0.3 });
  res(world, 170, 600, '叶页的位置记在根页里', 'ink', Tend('e15') - 0.6, { fs: 30, lh: 56, out: T('e17') - 0.3 });   // B03
  to(V.root, tR, { backgroundColor: K.forest, duration: 0.35 }); to(V.root, tR + 1.2, { backgroundColor: K.ink, duration: 0.35 });
  textAt(V.root, [[0, '根页 · 1 · 1225 · 2449 · 3124'], [tR + 0.2, '根页 · 1225 那一项 → 新位置'], [T('e16') + 0.2, '根页 · 1 · 1225 · 2449 · 3124']]);
  to(V.root, T('e15', '新位置') - 0.2, { backgroundColor: K.forest, color: K.mint2, duration: 0.35 }); to(V.root, T('e16') + 0.1, { backgroundColor: K.ink, color: '#FFFFFF', duration: 0.35 });
  // 两个索引记的是 2050，不是位置：一项都不用改
  V.ix.forEach((e) => glow(e, T('e16', '二') - 0.2, T('e17') + 0.2, { bg: K.mint, bd: K.g1 }));
  // 「记的是 2050」：两个索引连到 2050 那一行（从根页下面绕过去）
  rowOn(T('e16', '2050') - 0.2, 'new'); rowOff(T('e17') + 0.1);
  V.ix.forEach((e, i) => solid(e, T('e16', '不用改') - 0.2 + i * 0.1, K.gd1, [T('e17') + 0.2, '#FFFFFF', K.gl1, K.gd2]));
  // 另外三个叶页留在原地
  [V.b.l1, V.b.l3, V.b.l4].forEach((e) => { to(e, T('e17', '原地') - 0.3, { borderColor: K.forest, backgroundColor: K.forest, duration: 0.3 }); if (e._t) { to(e._t, T('e17', '原地') - 0.3, { color: '#FFFFFF', duration: 0.3 }); to(e._t, T('e17', '原地') + 1.2, { color: K.ink, duration: 0.3 }); } to(e, T('e17', '原地') + 1.2, { borderColor: K.gb, backgroundColor: '#FFFFFF', duration: 0.3 }); });
  // 上一个检查点的页原样留着；新的写到一半出事，还能回去
  const tO = T('e18', '上一个') - 0.3;
  to([V.b.l2, V.b.r], tO, { backgroundColor: K.gd1, borderColor: K.gd1, duration: 0.4 }); if (V.b.l2._t) to(V.b.l2._t, tO, { color: '#FFFFFF', duration: 0.4 });
  const oldT = tg(world, X(28672) - 10, 700, '上一个检查点的页', 'b'); css(oldT, { fontSize: '26px', lineHeight: '46px', color: '#FFFFFF', background: K.gd1, borderRadius: '8px', padding: '0 14px' });
  to(oldT, T('e18', '原样') - 0.2, { backgroundColor: K.ink, duration: 0.35 }); to([V.b.l2, V.b.r], T('e18', '原样') - 0.2, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 }); to(oldT, T('e20', '完好') - 0.3, { backgroundColor: K.forest, duration: 0.35 }); to(oldT, T('e21', '空出') - 0.1, { backgroundColor: K.gd1, duration: 0.35 });
  show(oldT, tO + 0.2, { y: 8, d: 0.4 });
  to([V.root, ...V.leaves.map((p) => p.c), ...V.links], T('e19') - 0.1, { opacity: 0.35, duration: 0.45 }); to([V.root, ...V.leaves.map((p) => p.c), ...V.links], T('e21') - 0.2, { opacity: 1, duration: 0.45 });
  to(n2, T('e19', '检查点') - 0.2, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 }); if (n2._t) to(n2._t, T('e19', '检查点') - 0.2, { color: K.ink, duration: 0.35 });
  to([n2, r2], T('e19', '一半') - 0.2, { backgroundColor: K.red, borderColor: K.red, duration: 0.35 }); if (n2._t) to(n2._t, T('e19', '一半') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  const bang = h('div', 'abs', world, ico('bolt', 56, K.red, 3)); px(bang, X(110592) - 28, 778, 56, 56);
  show(bang, T('e19', '出了事') - 0.2, { y: -8, s: 0.6, d: 0.35 });
  to([V.b.l2, V.b.r], T('e20', '回到') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  textAt(oldT, [[0, '上一个检查点的页'], [T('e18', '原样') - 0.2, '上一个检查点的页 · 原样留着'], [T('e20', '完好') - 0.3, '上一个检查点 · 完好'], [T('e21', '空出') - 0.1, '空出来，留给以后用']]);
  // 新的写完：新块转正，旧页的地方空出来
  const tN = T('e21', '写完') - 0.2;
  fadeOut(bang, tN, 0.3);
  to(n2, tN, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  res(world, X(110592) - 140, 636, '新的检查点写完', 'new', tN + 0.1, { out: T('e22') - 0.1 }); to(r2, tN, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 });
  to([V.b.l2, V.b.r], T('e21', '空出') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', color: K.gb, duration: 0.45 });   // lint-ok: 空出的块是透明底
  fadeOut(V.b.l2._t, T('e21', '空出') - 0.2, 0.3);
  // 文件 96 KB → 132 KB
  solid(V.size, T('e22') + 0.1, 'new');   // 「所以这一次」：视线回到文件大小
  if (V.b.l2._t) to(V.b.l2._t, T('e22') + 0.1, { color: K.gb, duration: 0.35 });
  stepTo(V.size, [[T('e22', '长到') - 0.3, 1.0, 96, 132]], (v) => Math.round(v) + ' KB');
  to(V.size, T('e22', '一百') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 });
  res(world, X(110592) - 140, 636, '多出 36 KB', 'new', T('e22', '长到') - 0.2, { out: T('e24') - 0.2 });
  // e24：引出下一章——那个正在读的人回来，读到的是 42 还是 43
  const tQ = T('e24') - 0.2;
  to(V.size, tQ, { color: K.ink, duration: 0.3 });
  to([V.leaves[2].c, V.leaves[3].c], tQ - 0.15, { opacity: 0, duration: 0.4 });   // 右边两个叶页让开，问句不压在它们上面
  const rq = h('div', 'abs', world, ico('person', 52, '#FFFFFF', 2.8) + '<span style="font:700 34px Sans SC;color:#FFFFFF;vertical-align:14px;margin-left:12px">读到的是</span>'); px(rq, 960, 384); css(rq, { background: K.blue, borderRadius: '12px', padding: '6px 18px' });
  const rqA = h('div', 'abs', world, '42'), rqB = h('div', 'abs', world, '43'), rqO = h('div', 'abs', world, '还是');
  [[rqA, 1240], [rqO, 1376], [rqB, 1480]].forEach(([e, x]) => { px(e, x, 384); if (e !== rqO) css(e, { background: e === rqA ? K.blue : K.forest, borderRadius: '12px', padding: '0 18px' }); css(e, { font: e === rqO ? '600 34px/72px "Sans SC"' : '800 56px/72px "Mono"', color: e === rqO ? K.gd2 : '#FFFFFF' }); });
  css(rqO, { background: K.gd1, color: '#FFFFFF', borderRadius: '12px', padding: '0 14px' });
  show(rq, T('e24', '读的人') - 0.2, { y: -10, d: 0.45 });
  show(rqA, T('e24', '42') - 0.15, { y: 10, d: 0.4 }); to(V.leaves[1].c, T('e24', '42') - 0.15, { backgroundColor: K.bluel, borderColor: K.blue, duration: 0.4 }); show(rqO, T('e24', '还是') - 0.15, { y: 0, d: 0.3 }); show(rqB, T('e24', '43') - 0.15, { y: 10, d: 0.4 });
});
