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

  // 起点：96 KB（e1a）；命令（05 回显）
  to(V.size, T('e1a', '九十') - 0.1, { color: K.forest, duration: 0.3 }); to(V.size, T('e1a', '开始'), { color: K.ink, duration: 0.3 });
  const age = h('div', 'abs', world, '<span style="font:600 34px Mono;color:#3D4F58">age</span> 42 → 43'); px(age, 420, 228); css(age, { font: '800 52px "Inter"', color: K.forest });
  show(age, T('e1b', '42') - 0.3, { x: -16, y: 0, d: 0.45 });
  pt(world, 162, 752, 1166, 108, T('e1a', '写完') - 0.2, T('e1a', '九十') - 0.2);
  // 先用姓名索引找到她；名字和 RecordId 没变，两个索引不用动（D02：新增 0、删除 0）
  glow(V.ix[1], T('e2', '姓名') - 0.2, T('e3') + 0.3, { bg: K.mint, bd: K.g1 });
  V.ix.forEach((e, i) => swapAt(e.querySelector('.ok'), '', '不用动', T('e3', '不用') - 0.2 + i * 0.1));
  pt(world, 1432, 278, 346, 58, T('e2', '姓名') - 0.2, T('e3') - 0.1);
  pt(world, 570, 452, 334, 52, T('e3', '名字') - 0.2, T('e3', '两个') - 0.1);
  // 只有集合树里 2050 这一项
  to(V.rows[1], T('e4', '二') - 0.2, { backgroundColor: K.mint2, color: K.ink, duration: 0.35 });
  // 更新链：叶页三、四先让开，链挂在 2050 这一项右边
  const tCh = T('e5') - 0.2;
  to([V.leaves[2].c, V.leaves[3].c], tCh, { opacity: 0.15, duration: 0.45 });
  const RY = V.LY + 52 + 46;             // 2050 那一行的上沿
  const vbox = (txt, x, cls) => { const e = h('div', 'abs', world, txt); px(e, x, RY - 8, 200, 56); css(e, { borderRadius: '10px', font: '800 34px/52px "Mono"', textAlign: 'center', ...(cls === 'new' ? { background: K.spring, color: K.ink, border: '2px solid ' + K.forest } : { background: '#fff', color: K.gd2, border: '2px dashed ' + K.gb }) }); return e; };
  pt(world, 784, 454, 60, 48, T('e5', '42') - 0.2, T('e6') - 0.1, K.blue);
  const v43 = vbox('43', 990, 'new');
  const a43 = link(ov, [[912, RY + 20], [986, RY + 20]], 'ink', { w: 3, arrow: true });
  show(v43, T('e6', '新版本') - 0.2, { x: -24, y: 0, d: 0.45 }); arrowIn(a43, T('e6', '挂') - 0.1, 0.35);
  const vN = vbox('再改…', 1250, 'old');
  const aN = link(ov, [[1192, RY + 20], [1246, RY + 20]], 'dim', { w: 3, arrow: true });
  show(vN, T('e7', '再挂') - 0.2, { x: -24, y: 0, d: 0.45 }); arrowIn(aN, T('e7', '再挂') - 0.25, 0.3);
  const glU = gl(world, 990, 516, '更新链', '一项上挂着的新旧版本');
  show(glU, T('e7', '更新') - 0.3, { y: 10, d: 0.5 });
  // 旧的 42 还留着：有人同时在读
  to(V.rows[1], T('e8', '42') - 0.2, { backgroundColor: K.bluel, duration: 0.35 });
  const reader = h('div', 'abs', world, ico('person', 44, K.blued, 2.8) + '<span style="font:700 26px Sans SC;color:#1254B7;vertical-align:12px;margin-left:8px">正在读的人看 42</span>'); px(reader, 990, 382);
  show(reader, T('e8', '有人') - 0.2, { y: -10, d: 0.45 });
  pt(world, 784, 454, 60, 48, T('e8', '42') - 0.2, T('e8', '有人') - 0.1, K.blue);
  pt(world, 570, 452, 334, 52, T('e8', '用到') - 0.2, T('e9') - 0.1, K.blue);
  pt(world, 1442, 674, 316, 76, T('e9', '集合') - 0.2, T('e9', '大小') + 1.2);
  // 文件大小没变，改动还在缓存里：叶页标成「改过」
  const dot = h('div', 'abs', V.leaves[1].c); css(dot, { right: '12px', top: '10px', width: '22px', height: '22px', borderRadius: '50%', background: K.yel, border: '2px solid ' + K.yeld });
  show(dot, T('e9', '缓存') - 0.3, { y: 0, s: 0.3, d: 0.35 });
  to(V.size, T('e9', '大小') - 0.2, { color: K.blued, duration: 0.3 }); to(V.size, T('e9', '大小') + 1.1, { color: K.ink, duration: 0.3 });
  // 检查点：链收起，叶页三、四回来
  const tK = T('e10', '检查点') - 0.3;
  fadeOut([v43, a43, vN, aN, glU, reader, age], tK, 0.45);
  to([V.leaves[2].c, V.leaves[3].c], tK, { opacity: 1, duration: 0.45 });
  to(V.rows[1], tK, { backgroundColor: K.gl3, duration: 0.35 });
  textAt(V.rows[1], [[0, V.rows[1].innerHTML], [tK + 0.2, `<b style="color:${K.ink}">2050</b>  Alice · 43`]]);
  // 这一页往下写：先朝原来的位置去，停住，再拐到文件末尾（e11、e12）
  const gh = ghostPage(world, V.LX(1), V.LY, V.LW, V.LH);
  const gx0 = V.LX(1), gy0 = V.LY;
  tl.fromTo(gh, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: X(40960) - (gx0 + V.LW / 2), y: 600 - gy0, scale: 0.45, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('e10', '写回') - 0.3);
  const noX = h('div', 'abs', world, ico('x', 64, K.red, 4)); px(noX, X(40960) - 32, 700, 64, 64);
  show(noX, T('e11', '原来') - 0.2, { y: 0, s: 1.4, d: 0.35 }); fadeOut(noX, T('e12', '写到') - 0.1, 0.35);
  tl.to(gh, { x: X(110592) - (gx0 + V.LW / 2), y: 640 - gy0, scale: 0.4, duration: 0.9, ease: 'power2.inOut' }, T('e12', '写到') - 0.3);
  tl.to(gh, { y: 700 - gy0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, T('e12', '新的') - 0.1);
  revealBand(V, T('e12', '末尾') - 0.3, 98304, 126976, 0.8);
  const n2 = V.band.blk(98304, 122880, 'n', '1225–2448'); show(n2, T('e12', '新的'), { y: 0, s: 0.7, d: 0.4 }); sfx('thud', T('e12', '新的') + 0.1, { g: 0.5 });
  fadeOut(dot, T('e12', '新的'), 0.3);
  fadeOut(V.drop[1], T('e12', '新的') - 0.1, 0.3);
  const drop2 = link(ov, [[V.LX(1) + V.LW / 2, V.LY + V.LH], [X(110592), 756]], 'accent', { w: 2.5, dashed: '6 6' }); arrowIn(drop2, T('e12', '新的') + 0.1, 0.5);
  // 47 个字节里只变了 1 个：2a → 2b（D07）
  const tB = T('e13') - 0.2;
  const bz = h('div', 'abs', world); px(bz, 990, 392, 780, 130); css(bz, { background: '#fff', border: '2px solid ' + K.g1, borderRadius: '10px' });
  const BB = ['10', '61', '67', '65', '00', '2a', '00', '00', '00', '00'];
  bz.innerHTML = `<div style="position:absolute;left:18px;top:10px;font:600 22px 'Sans SC';color:${K.forest}">Alice 那一项的最后 10 个字节</div>` + BB.map((b, i) => `<span class="bb" style="position:absolute;left:${18 + i * 76}px;top:48px;width:68px;height:56px;border-radius:6px;border:2px solid ${K.gl1};font:600 28px/52px Mono;text-align:center;color:${K.gd2}">${b}</span>`).join('');
  to([V.leaves[2].c, V.leaves[3].c], tB - 0.2, { opacity: 0.12, duration: 0.4 });
  show(bz, tB, { y: 10, d: 0.45 });
  const b5 = bz.querySelectorAll('.bb')[5];
  to(b5, T('e13', '42') - 0.1, { backgroundColor: K.spring, borderColor: K.forest, color: K.ink, duration: 0.35 });
  swapAt(b5, '2a', '2b', T('e13', '43') - 0.2);
  // 却写了整页 24 KB
  const k24 = tg(world, X(98304) + 4, 718, '整页 24 KB', 'g'); css(k24, { fontSize: '30px' });
  show(k24, T('e14', '二十') - 0.3, { y: 8, d: 0.4 });
  pt(world, X(98304) - 4, 752, (122880 - 98304) * sc + 8, 108, T('e14', '重新') - 0.2, T('e15') - 0.1);
  // 叶页换了位置，根页也重写一份（122880）
  const tR = T('e15', '根页') - 0.3;
  fadeOut(bz, tR - 0.3, 0.35);
  to([V.leaves[2].c, V.leaves[3].c], tR - 0.2, { opacity: 1, duration: 0.4 });
  const r2 = V.band.blk(122880, 126976, 'r'); show(r2, tR + 0.4, { y: 0, s: 0.7, d: 0.4 });
  to(V.root, tR, { backgroundColor: K.forest, duration: 0.35 }); to(V.root, tR + 1.2, { backgroundColor: K.ink, duration: 0.35 });
  textAt(V.root, [[0, '根页 · 1 · 1225 · 2449 · 3124'], [tR + 0.2, '根页 · 1225 那一项 → 新位置'], [T('e16') + 0.2, '根页 · 1 · 1225 · 2449 · 3124']]);
  pt(world, X(122880) - 4, 752, 4096 * sc + 8, 108, T('e15', '新位置') - 0.2, T('e16') - 0.1);
  // 两个索引记的是 2050，不是位置：一项都不用改
  V.ix.forEach((e) => glow(e, T('e16', '二') - 0.2, T('e17') + 0.2, { bg: K.mint, bd: K.g1 }));
  pt(world, 1432, 220, 346, 120, T('e16', '两个') - 0.2, T('e17') - 0.1);
  pt(world, 570, 452, 80, 52, T('e16', '二') - 0.2, T('e16', '不是') - 0.2);
  pt(world, 872, 228, 536, 86, T('e16', '不是') - 0.2, T('e17') - 0.1);
  // 另外三个叶页留在原地
  [0, 2, 3].forEach((i) => pt(world, V.LX(i) - 6, V.LY - 6, V.LW + 12, V.LH + 12, T('e17', '原地') - 0.3, T('e18') - 0.2));
  [V.b.l1, V.b.l3, V.b.l4].forEach((e) => { to(e, T('e17', '原地') - 0.3, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.3 }); to(e, T('e17', '原地') + 1.2, { borderColor: K.gb, backgroundColor: '#FFFFFF', duration: 0.3 }); });
  // 上一个检查点的页原样留着；新的写到一半出事，还能回去
  const tO = T('e18', '上一个') - 0.3;
  to([V.b.l2, V.b.r], tO, { backgroundColor: K.gl2, borderColor: K.gd1, duration: 0.4 });
  const oldT = tg(world, X(28672), 712, '上一个检查点的页', 'b'); css(oldT, { fontSize: '26px' });
  show(oldT, tO + 0.2, { y: 8, d: 0.4 });
  pt(world, X(28672) - 4, 752, (53248 - 28672) * sc + 8, 108, T('e18', '原样') - 0.2, T('e19') - 0.1);
  pt(world, X(86016) - 4, 752, 4096 * sc + 8, 108, T('e18', '原样') - 0.1, T('e19') - 0.1);
  to([n2, r2], T('e19', '一半') - 0.2, { backgroundColor: K.redl, borderColor: K.red, duration: 0.35 });
  const bang = h('div', 'abs', world, ico('bolt', 56, K.red, 3)); px(bang, X(110592) - 28, 778, 56, 56);
  show(bang, T('e19', '出了事') - 0.2, { y: -8, s: 0.6, d: 0.35 });
  to([V.b.l2, V.b.r], T('e20', '回到') - 0.2, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.35 });
  textAt(oldT, [[0, '上一个检查点的页'], [T('e20', '完好') - 0.3, '上一个检查点 · 完好'], [T('e21', '空出') - 0.1, '空出来，留给以后用']]);
  // 新的写完：新块转正，旧页的地方空出来
  const tN = T('e21', '写完') - 0.2;
  fadeOut(bang, tN, 0.3);
  to(n2, tN, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(r2, tN, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 });
  to([V.b.l2, V.b.r], T('e21', '空出') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', color: K.gb, duration: 0.45 });   // lint-ok: 空出的块是透明底
  fadeOut(V.b.l2._t, T('e21', '空出') - 0.2, 0.3);
  fadeOut(k24, T('e22') - 0.2, 0.3);
  // 文件 96 KB → 132 KB
  stepTo(V.size, [[T('e22', '长到') - 0.3, 1.0, 96, 132]], (v) => Math.round(v) + ' KB');
  to(V.size, T('e22', '一百') - 0.2, { color: K.forest, duration: 0.3 });
  pt(world, 162, 752, 1600, 108, T('e22', '文件') - 0.2, T('e22', '长到') - 0.2);
  pt(world, 570, 452, 334, 52, T('e24', '删掉') - 0.2, T('e24', '变小') - 0.1, K.red);
  pt(world, 1442, 674, 316, 76, T('e24', '变小') - 0.2, s.end - 0.2, K.gd2);
  beat(world, T('e1a', '九十') - 0.1, 1442, 674, 316, 76, 1.2);
  beat(world, T('e5') + 0.1, 570, 404, 334, 150, 1.0);
  beat(world, T('e4', '要改') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.0, K.gb);
  beat(world, T('e10', '写回') - 0.2, 162, 752, 1166, 108, 1.2);
  beat(world, T('e10', '文件') + 0.3, X(28672) - 4, 752, (53248 - 28672) * sc + 8, 108, 1.0, K.gb);
  beat(world, T('e16', '一项') - 0.1, 1432, 220, 346, 120, 1.2);
  beat(world, T('e19', '新的') - 0.1, X(98304) - 4, 752, (126976 - 98304) * sc + 8, 108, 1.2, K.red);
  beat(world, T('e6', '挂') - 0.1, 980, 436, 540, 84, 1.0);
  beat(world, T('e10', '检查点') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.0, K.yeld);
  beat(world, T('e1b', '过生日') - 0.1, 412, 220, 300, 72, 1.0);
  beat(world, T('e1b', '42') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.0);
  beat(world, T('e2', '姓名') - 0.2, 1432, 220, 346, 120, 1.2);
  beat(world, T('e3', '两个') - 0.1, 1432, 220, 346, 120, 1.2, K.gb);
  beat(world, T('e4', '集合树') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.3);
  beat(world, T('e5', '擦掉') - 0.2, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.2, K.gb);
  beat(world, T('e7', '再改') - 0.1, 980, 436, 540, 84, 1.2);
  beat(world, T('e7', '更新链') - 0.1, 982, 508, 560, 80, 1.2);
  beat(world, T('e8', '也') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.2, K.blue);
  beat(world, T('e9', '改动') - 0.1, V.LX(1) - 6, V.LY - 6, V.LW + 12, V.LH + 12, 1.3, K.yeld);
  beat(world, T('e12', '写到') - 0.1, X(98304) - 4, 752, (126976 - 98304) * sc + 8, 108, 1.2);
  beat(world, T('e13', '只有') - 0.1, 982, 384, 796, 146, 1.4);
  beat(world, T('e13', '43') + 0.3, X(98304) - 4, 752, (122880 - 98304) * sc + 8, 108, 1.2);
  beat(world, T('e20', '回到') - 0.1, X(28672) - 4, 752, (53248 - 28672) * sc + 8, 108, 1.2);
  beat(world, Tend('e20') + 0.3, X(98304) - 4, 752, (126976 - 98304) * sc + 8, 108, 1.0, K.gb);
  beat(world, T('e21', '空出') - 0.1, X(28672) - 4, 752, (53248 - 28672) * sc + 8, 108, 1.2, K.gb);
});
