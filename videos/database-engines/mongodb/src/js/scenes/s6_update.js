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
  V.ix.forEach((e, i) => swapAt(e.querySelector('.ok'), '', '不用动', T('e3', '不用') - 0.2 + i * 0.1));
  to(V.rows[1], T('e3', 'RecordId') - 0.2, { color: K.forest, duration: 0.3 });   // 名字和 RecordId 都在这一行，都没变
  // 只有集合树里 2050 这一项
  const treeE = [V.root, ...V.leaves.map((p) => p.c)];
  to(treeE, T('e2', '姓名') - 0.2, { opacity: 0.35, duration: 0.4 }); to(treeE, T('e3', '名字') - 0.2, { opacity: 1, duration: 0.4 });   // 先用姓名索引找
  to(treeE, T('e3', '两个') - 0.2, { opacity: 0.35, duration: 0.4 }); to(treeE, T('e4') - 0.2, { opacity: 1, duration: 0.4 });   // 讲两个索引时，树退后
  rowOn(T('e4', '二') - 0.2, 'new');
  to(V.leaves[1].c, T('e4', '要改') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(V.leaves[1].c, T('e9') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
  solid(V.rows[1], T('e5', '42') - 0.2, 'ink');
  to(V.root, T('e5') - 0.1, { opacity: 0.35, duration: 0.45 }); to(V.root, T('e10', '检查点') - 0.3, { opacity: 1, duration: 0.45 });
  // 更新链：叶页三、四先让开，链挂在 2050 这一项右边
  const tCh = T('e5', '擦掉') - 0.3;
  to([V.leaves[2].c, V.leaves[3].c, V.links[2], V.links[3], V.drop[2], V.drop[3]], tCh, { opacity: 0, duration: 0.45 });
  const RY = V.LY + 52 + 46;             // 2050 那一行的上沿
  const vbox = (txt, x, cls) => { const e = h('div', 'abs', world, txt); px(e, x, RY - 8, 200, 56); css(e, { borderRadius: '10px', font: '800 34px/52px "Mono"', textAlign: 'center', ...(cls === 'new' ? { background: K.forest, color: '#FFFFFF', border: '2px solid ' + K.forest } : { background: K.gd1, color: '#FFFFFF', border: '2px solid ' + K.gd1 }) }); return e; };
  const erase = h('div', 'abs', world); px(erase, V.LX(1) + 150, RY + 18, 110, 5); css(erase, { background: K.red, transformOrigin: '0 50%' }); erase.dataset.name = 'erase';
  tl.fromTo(erase, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.35, ease: 'power2.out', immediateRender: true }, T('e5', '擦掉') - 0.4);
  tl.to(erase, { scaleX: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, T('e5', '擦掉') + 0.2);
  const v43 = vbox('43', 990, 'new');
  const a43 = link(ov, [[912, RY + 20], [986, RY + 20]], 'ink', { w: 3, arrow: true });
  sfx('pop', T('e2', '姓名') - 0.1, { g: 0.35 }); sfx('blip', T('e3', '不用') - 0.1, { g: 0.35 }); sfx('pop', T('e6', '挂'), { g: 0.4 }); sfx('pop', T('e7', '再挂'), { g: 0.35 });
  show(v43, T('e6', '挂') - 0.1, { x: -24, y: 0, d: 0.45 }); to(v43, T('e6', '43') - 0.2, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 }); arrowIn(a43, T('e6', '挂') - 0.1, 0.35);
  const vN = vbox('再改…', 1250, 'old');
  const aN = link(ov, [[1192, RY + 20], [1246, RY + 20]], 'dim', { w: 3, arrow: true });
  show(vN, T('e7', '再改') - 0.2, { x: 140, y: 0, d: 0.6 }); rowOff(T('e7', '再改') - 0.2); arrowIn(aN, T('e7', '再挂') - 0.25, 0.3);   // 再挂一个：链往右长；页上那一行退回原样
  const glU = gl(world, 1500, 392, '更新链', 'WiredTiger 在内存里<br>挂在一项上的一串版本：<br>每改一次加一个，<br>旧的先留给正在读的人');   // D01 G07
  css(glU.querySelector('span'), { fontSize: '24px' });
  const chainB = h('div', 'abs', world); px(chainB, 976, RY - 22, 500, 84); css(chainB, { border: '3px solid ' + K.g1, background: '#7DEBB0', borderRadius: '14px' }); world.insertBefore(chainB, v43);
  show(chainB, T('e6', '挂') - 0.2, { y: 0, s: 1.02, d: 0.4 });
  show(glU, T('e7', '更新') - 0.3, { y: 10, d: 0.5 }); fadeOut(glU, T('e8b') - 0.3, 0.35); to(chainB, T('e7', '一串') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  // 旧的 42 还留着：有人同时在读（读的人只画成一个人和一根指向 42 的箭头，不写字）
  rowOn(T('e8', '42') - 0.2, 'read');
  const reader = h('div', 'abs', world, ico('person', 46, '#FFFFFF', 2.8)); px(reader, 990, 364, 64, 64);
  css(reader, { background: K.blue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  show(reader, T('e8', '有人') - 0.2, { y: -10, d: 0.45 });
  to(v43, T('e8') - 0.1, { opacity: 0.25, duration: 0.4 }); to(chainB, T('e8', '有人') - 0.2, { opacity: 0.3, duration: 0.4 }); to([chainB, v43], T('e9', '还在') - 0.3, { opacity: 1, duration: 0.4 });   // 读的人用的是页上的 42；「改动还在缓存里」时链再亮
  to(V.leaves[1].c, T('e8', '42') - 0.2, { backgroundColor: '#B9DAFF', borderColor: K.blue, duration: 0.35 });
  const rdA = link(ov, [[986, 400], [916, 448]], 'blue', { w: 3, arrow: true }); arrowIn(rdA, T('e8', '用到') - 0.2, 0.4);
  to([V.dsk, V.band.wrap, V.size, V.drop[0], V.drop[1]], T('e8', '用到') - 0.2, { opacity: 0.35, duration: 0.45 }); to([V.dsk, V.band.wrap, V.size, V.drop[0], V.drop[1]], T('e9', '大小') - 0.3, { opacity: 1, duration: 0.45 });   // 讲的是内存里的版本：磁盘先退后
  to([V.leaves[0].c, V.leaves[1].c, chainB, v43, vN, a43, aN, reader, rdA], T('e8b', 'Po') - 0.35, { opacity: 0.35, duration: 0.45 }); to([V.leaves[0].c, V.leaves[1].c, chainB, v43, vN, a43, aN, reader, rdA], T('e9', '缓存') - 0.4, { opacity: 1, duration: 0.45 });   // 对照 PostgreSQL 时，这边退后
  // e8b 和 PostgreSQL 一样：PostgreSQL 的旧版本也留在原处（只作对照，画一个小的堆页示意）
  const pgC = h('div', 'panel', world); px(pgC, 1500, 380, 284, 170);
  pgC.innerHTML = `<div style="position:absolute;left:18px;top:12px;font:700 24px Inter;color:${K.blued}">PostgreSQL · PART 3</div>` +
    `<div style="position:absolute;left:18px;top:56px;width:248px;height:40px;border-radius:6px;background:${K.gl2};font:600 22px/40px Mono;color:${K.gd1};padding-left:12px;box-sizing:border-box">Alice · 42 <span style="font-family:'Sans SC'">旧</span></div>` +
    `<div style="position:absolute;left:18px;top:106px;width:248px;height:40px;border-radius:6px;background:${K.blue};font:600 22px/40px Mono;color:#fff;padding-left:12px;box-sizing:border-box">Alice · 43 <span style="font-family:'Sans SC'">新</span></div>`;   // S11
  show(pgC, T('e8b', 'Postgre') - 0.3, { x: 16, y: 0, d: 0.45 }); fadeOut(pgC, T('e9') - 0.2, 0.4);
  const pgR = [...pgC.children].slice(1); set(pgR[1], s.start, { autoAlpha: 0 }); show(pgR[1], T('e8b', '改了') - 0.2, { y: 8, d: 0.35 });
  to(pgR[0], T('e8b', '不覆盖') - 0.2, { color: '#FFFFFF', backgroundColor: K.ink, duration: 0.3 });
  // 文件大小没变，改动还在缓存里：叶页标成「改过」
  const dot = h('div', 'abs', V.leaves[1].c); css(dot, { right: '12px', top: '10px', width: '22px', height: '22px', borderRadius: '50%', background: K.yel, border: '2px solid ' + K.yeld });
  show(dot, T('e9', '缓存') - 0.3, { y: 0, s: 0.3, d: 0.35 });
  to(V.leaves[1].c, T('e9', '缓存') - 0.3, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.35 });

  // ══ 检查点（e10 起）：一个连续的过程——新版本合进页里 → 页往下写 → 原来那块正被上一个检查点用着，绕开 →
  //    文件末尾长出一块，页落进去 → 整块写满 → 根页指向新块、自己也写一份到末尾 → 写到一半出事就退回旧的 → 写完旧块才空出 ══
  const tK = T('e10', '检查点') - 0.3;
  // 链上的 43 合进页里那一行；读的人与箭头退场
  tl.to(v43, { x: -90, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, tK);
  fadeOut([a43, vN, aN, chainB, glU, reader, rdA, age], tK, 0.4);
  to(V.rows[1], tK, { color: K.ink, backgroundColor: K.gl3, duration: 0.35 });
  textAt(V.rows[1], [[0, V.rows[1].innerHTML], [tK + 0.35, `<b style="color:inherit">2050</b>  Alice · 43`]]);
  to([V.leaves[2].c, V.leaves[3].c, V.links[2], V.links[3], V.drop[2], V.drop[3]], tK + 0.45, { opacity: 1, duration: 0.45 });   // 等更新链的注解退完
  to(V.root, tK, { opacity: 1, duration: 0.45 });
  // 页的影子往下：先去原来那块（e10「写回」）
  const gh = ghostPage(world, V.LX(1), V.LY, V.LW, V.LH);
  const gx0 = V.LX(1), gy0 = V.LY, BY = 760;
  const toX = (off) => off - (gx0 + V.LW / 2);
  tl.fromTo(gh, { autoAlpha: 0.95, x: 0, y: 0, scale: 1 }, { x: toX(X(40960)), y: 640 - gy0, scale: 0.42, duration: 0.85, ease: 'power2.inOut', immediateRender: false }, T('e10', '写回') - 0.35);
  // e11 原来那块正被上一个检查点用着：变深、上锁，影子停一下，绕开
  const lock = h('div', 'abs', world, ico('lock', 40, '#FFFFFF', 3)); px(lock, X(40960) - 20, BY + 26, 40, 40);
  to(V.b.l2, T('e11', '原来') - 0.3, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 }); if (V.b.l2._t) to(V.b.l2._t, T('e11', '原来') - 0.3, { autoAlpha: 0, duration: 0.25 });
  show(lock, T('e11', '原来') - 0.15, { y: -6, s: 0.6, d: 0.35 });
  tl.to(gh, { y: 610 - gy0, duration: 0.25, ease: 'power2.out' }, T('e11', '位置') - 0.2);
  // e12 文件末尾长出一块，影子滑过去落进去
  revealBand(V, T('e12', '末尾') - 0.35, 98304, 126976, 0.8);
  to(V.size, T('e12', '末尾') - 0.45, { autoAlpha: 0, duration: 0.3 }); to(V.size, T('e22', '所以') - 0.3, { autoAlpha: 1, duration: 0.35 });   // 文件条在长、数字还没讲到：先收起，免得两者对不上
  to([V.root, V.leaves[0].c, V.leaves[2].c, V.leaves[3].c], T('e12', '整个') - 0.2, { opacity: 0.35, duration: 0.4 });   // 只看要重写的这一页
  tl.to(gh, { x: toX(X(110592)), y: 640 - gy0, scale: 0.4, duration: 0.9, ease: 'power2.inOut' }, T('e12', '写到') - 0.35);
  tl.to(gh, { y: 700 - gy0, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, T('e12', '新的') - 0.1);
  const n2 = V.band.blk(98304, 122880, 'n', '1225–2448'); show(n2, T('e12', '新的'), { y: 0, s: 0.7, d: 0.4 }); sfx('thud', T('e12', '新的') + 0.1, { g: 0.5 });
  const fill = h('div', 'abs', n2); css(fill, { left: 0, top: 0, bottom: 0, width: '100%', background: K.forest, borderRadius: '3px', transformOrigin: '0 50%' }); n2.insertBefore(fill, n2.firstChild);
  fromTo(fill, T('e12', '新的'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power1.inOut' });
  if (n2._t) to(n2._t, T('e12', '新的') + 0.3, { color: '#FFFFFF', duration: 0.3 });
  fadeOut(dot, T('e12', '新的'), 0.3);
  to(V.leaves[1].c, T('e12', '新的'), { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
  [0, 1, 2, 3].forEach((i) => tl.to(V.drop[i], { autoAlpha: 0, duration: 0.3 }, T('e12', '写到') - 0.4));
  const drop2 = link(ov, [[V.LX(1) + V.LW / 2, V.LY + V.LH], [V.LX(1) + V.LW / 2, 610], [X(110592), 610], [X(110592), BY - 4]], 'accent', { w: 2.5, dashed: '6 6' }); arrowIn(drop2, T('e12', '新的') + 0.1, 0.5);
  // e13 这一项里只变了一个字节（真实字节）
  const tB = T('e13') - 0.2;
  const bz = h('div', 'abs', world); px(bz, 990, 392, 780, 168); css(bz, { background: K.ink, border: '2px solid ' + K.ink, borderRadius: '10px' });
  const BB = ['10', '61', '67', '65', '00', '2a', '00', '00', '00', '00'];
  bz.innerHTML = `<div style="position:absolute;left:18px;top:10px;font:600 22px 'Sans SC';color:${K.spring}">Alice 那一项的最后 10 个字节</div>` + BB.map((b, i) => `<span class="bb" style="position:absolute;left:${18 + i * 76}px;top:48px;width:68px;height:56px;border-radius:6px;border:2px solid #3D4F58;background:#1C2D38;font:600 28px/52px Mono;text-align:center;color:#C1C7C6">${b}</span>`).join('');
  [[0, 1, 'int 类型'], [1, 5, '字段名 age 和 0'], [5, 9, '值：4 字节整数'], [9, 10, '结尾']].forEach(([a, b, t]) => { const e = h('div', 'abs', bz, t); css(e, { left: 18 + a * 76 + 'px', top: '112px', width: (b - a) * 76 - 8 + 'px', textAlign: 'center', font: '600 22px/40px "Inter", "Sans SC"', color: '#E8EDEB', borderTop: '2px solid #889397', whiteSpace: 'nowrap' }); });   // A04 A16
  to([V.leaves[2].c, V.leaves[3].c], tB - 0.2, { opacity: 0, duration: 0.4 });
  show(bz, tB, { y: 10, d: 0.45 }); to([V.root, V.leaves[0].c], tB, { opacity: 1, duration: 0.4 });
  const bbs = [...bz.querySelectorAll('.bb')]; bbs.forEach((e) => css(e, { background: '#FFFFFF', color: K.ink, borderColor: K.gl1 }));
  bbs.forEach((e, i) => { if (i !== 5) { to(e, T('e13', '只有') - 0.2, { opacity: 0.3, duration: 0.4 }); to(e, T('e14') - 0.2, { opacity: 1, duration: 0.4 }); } });   // 只有一个字节变：其余九格退淡
  rowOn(T('e13', '42') - 0.2, 'ink'); rowOff(T('e14') - 0.2);
  const b5 = bz.querySelectorAll('.bb')[5];
  to(b5, T('e13', '42') - 0.1, { backgroundColor: K.spring, borderColor: K.forest, color: K.ink, duration: 0.35 });
  swapAt(b5, '2a', '2b', T('e13', '43') - 0.2);
  // e14 只变了一个字节，写下去的却是整块：字节条缩成一条细线落进新块，整块再重写一遍（左到右刷满）
  tl.to(bz, { x: X(98304) - 990, y: BY + 8 - 392, scaleX: 0.012, scaleY: 0.45, transformOrigin: '0 0', autoAlpha: 0.9, duration: 0.7, ease: 'power2.in' }, T('e14', '整页') - 0.6);
  tl.to(bz, { autoAlpha: 0, duration: 0.2 }, T('e14', '整页') + 0.1);
  tl.fromTo(fill, { scaleX: 0, backgroundColor: K.spring }, { scaleX: 1, duration: 1.1, ease: 'none', immediateRender: false }, T('e14', '整页') + 0.05);
  to(fill, T('e14', '一遍') + 0.2, { backgroundColor: K.forest, duration: 0.35 });
  if (n2._t) { to(n2._t, T('e14', '整页'), { color: K.ink, duration: 0.25 }); to(n2._t, T('e14', '一遍') + 0.2, { color: '#FFFFFF', duration: 0.3 }); }
  const k24 = n2._t; textAt(k24, [[0, '1225–2448'], [T('e14', '二十') - 0.3, '1225–2448 · 24 KB']]);
  // e15 根页记着叶页在文件哪里：它指向旧块的那根线挪到新块；根页自己也写一份到文件末尾
  const tR = T('e15') - 0.3;
  to([V.leaves[2].c, V.leaves[3].c], tR, { opacity: 1, duration: 0.4 });
  fadeOut(drop2, tR, 0.3);
  V.root.innerHTML = '根页 · 1 · <span class="k1225" style="border-radius:6px;padding:0 6px">1225</span> · 2449 · 3124';
  const k1225 = V.root.querySelector('.k1225');
  const RX = 880 + k1225.offsetLeft + k1225.offsetWidth / 2, RYb = 306;     // 根页里「1225」那一格的下沿
  const GAPL = V.LX(2) - 25, GAPR = V.LX(3) - 25;   // 第二、三个叶页之间，第三、四个叶页之间的空隙
  const pOld = link(ov, [[RX, RYb], [RX, 324], [GAPL, 324], [GAPL, 660], [X(40960), 660], [X(40960), BY - 4]], 'ink', { w: 3, arrow: true });
  const pNew = link(ov, [[RX, RYb], [RX, 324], [GAPR, 324], [GAPR, 660], [X(110592), 660], [X(110592), BY - 4]], 'accent', { w: 3.5, arrow: true });
  to(k1225, T('e15', '根页') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.3 });
  arrowIn(pOld, T('e15', '根页') - 0.1, 0.5);
  fadeOut(pOld, T('e15', '新位置') - 0.25, 0.3); arrowIn(pNew, T('e15', '新位置') - 0.2, 0.55);
  const r2 = V.band.blk(122880, 126976, 'r');
  const rg = h('div', 'abs', world); px(rg, 880, 236, 520, 70); css(rg, { background: K.ink, borderRadius: '10px', opacity: 0.85 });
  tl.fromTo(rg, { autoAlpha: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 }, { autoAlpha: 0.85, duration: 0.2, immediateRender: true }, T('e15', '重写') - 0.3);
  tl.to(rg, { x: X(122880) - 880, y: BY + 7 - 236, scaleX: (4096 * sc - 6) / 520, scaleY: 78 / 70, transformOrigin: '0 0', duration: 0.8, ease: 'power2.inOut' }, T('e15', '重写') - 0.1);
  tl.to(rg, { autoAlpha: 0, duration: 0.15 }, T('e15', '重写') + 0.72);
  show(r2, T('e15', '重写') + 0.6, { y: 0, d: 0.2 });
  // e16 两个索引记的是 2050：从索引框连到页里 2050 那一行，索引框原样不动
  rowOn(T('e16', '2050') - 0.2, 'new'); rowOff(T('e17') + 0.2);
  V.ix.forEach((e, i) => solid(e, T('e16', '不用改') - 0.2 + i * 0.1, K.gd1, [T('e17') + 0.2, '#FFFFFF', K.gl1, K.gd2]));
  const glPG = gl(world, 170, 625, '对照 PostgreSQL', '改一行，新版本落在另一个位置，<br>表上的每个索引都要多出一项指向它', { key: 'PG 对照' });   // S11
  css(glPG.querySelector('b'), { fontSize: '26px' }); css(glPG.querySelector('span'), { fontSize: '23px' });
  show(glPG, T('e16', '不是') - 0.2, { x: 14, y: 0, d: 0.45 }); fadeOut(glPG, T('e18') - 0.3, 0.4);
  // e17 另外三个叶页留在原地
  [V.b.l1, V.b.l3, V.b.l4].forEach((e) => { to(e, T('e17', '原地') - 0.3, { borderColor: K.forest, backgroundColor: K.forest, duration: 0.3 }); if (e._t) { to(e._t, T('e17', '原地') - 0.3, { color: '#FFFFFF', duration: 0.3 }); to(e._t, T('e18', '上一个') - 0.2, { color: K.ink, duration: 0.3 }); } to(e, T('e18', '上一个') - 0.2, { borderColor: K.gb, backgroundColor: '#FFFFFF', duration: 0.3 }); });
  // e18 上一个检查点的两块（旧叶页、旧根页）原样留着：标出来
  to(V.b.r, T('e18', '上一个') - 0.2, { backgroundColor: K.ink, duration: 0.3 });
  const memAll = [V.root, V.leaves[0].c, V.leaves[1].c];
  to(memAll, T('e18', '原样') - 0.2, { opacity: 0.3, duration: 0.4 }); to(memAll, T('e21', '空出') - 0.2, { opacity: 1, duration: 0.4 });   // 看磁盘上留下的块；出事时内存里的东西本来也没了
  to(memAll, T('e22', '所以') - 0.2, { opacity: 0.3, duration: 0.4 }); to(memAll, T('e24') - 0.3, { opacity: 1, duration: 0.4 });   // 讲文件长了多少：内存退后
  const pOld2 = link(ov, [[RX, RYb], [RX, 324], [GAPL, 324], [GAPL, 640], [X(40960), 640], [X(40960), BY - 4]], 'dim', { w: 2.5, dashed: '6 6' });
  arrowIn(pOld2, T('e18', '原样') - 0.2, 0.5);
  // e19 新的写到一半出事：新块重新从左往右写，写到一半变红，闪电
  to(pNew, T('e19') - 0.1, { autoAlpha: 0.25, duration: 0.3 });
  tl.fromTo(fill, { scaleX: 0, backgroundColor: K.spring }, { scaleX: 0.5, duration: 0.9, ease: 'none', immediateRender: false }, T('e19', '新的') - 0.1);
  if (n2._t) { to(n2._t, T('e19', '新的') - 0.2, { autoAlpha: 0, duration: 0.25 }); to(n2._t, T('e21', '写完') + 0.4, { autoAlpha: 1, duration: 0.3 }); }   // 写到一半、作废时不显示块上的字
  to(n2, T('e19', '新的') - 0.2, { backgroundColor: K.gl3, duration: 0.3 });   // 新块重新从空开始写
  to([fill, r2], T('e19', '一半') - 0.1, { backgroundColor: K.red, duration: 0.3 }); to(n2, T('e19', '出了事') - 0.2, { backgroundColor: '#FFC7BC', borderColor: K.red, duration: 0.3 });
  to(V.dsk, T('e19', '出了事') - 0.2, { backgroundColor: K.redl, borderColor: K.red, duration: 0.35 }); to(V.dsk, T('e20', '回到') - 0.2, { backgroundColor: K.gl3, borderColor: K.gl2, duration: 0.4 });
  const bang = h('div', 'abs', world, ico('bolt', 56, K.red, 3)); px(bang, X(110592) - 28, BY + 100, 56, 56);
  show(bang, T('e19', '出了事') - 0.2, { y: -8, s: 0.6, d: 0.35 }); sfx('error', T('e19', '出了事'), { g: 0.5 });
  // e20 重启时回到上一个：旧的那根指针亮成实线，两块旧块变绿；新块整块作废（退淡）
  const pBack = link(ov, [[RX, RYb], [RX, 324], [GAPL, 324], [GAPL, 640], [X(40960), 640], [X(40960), BY - 4]], 'accent', { w: 4, arrow: true }); arrowIn(pBack, T('e20', '回到') - 0.2, 0.5); fadeOut(pOld2, T('e20', '回到') - 0.2, 0.3); fadeOut(pBack, T('e21', '写完') + 0.2, 0.3);
  to([V.b.l2, V.b.r], T('e20', '回到') - 0.2, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to(lock, T('e20', '回到') - 0.2, { autoAlpha: 0, duration: 0.25 });
  to([n2, r2], T('e20', '完好') - 0.1, { opacity: 0.3, duration: 0.4 });
  to([V.b.l1, V.b.l3, V.b.l4], T('e20', '完好') - 0.2, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); to([V.b.l1, V.b.l3, V.b.l4], T('e21') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gb, duration: 0.35 });   // 上一个检查点的整棵树都还在
  // e21 这一次写完：新块写满变绿，指针换到新块；旧的两块空出来（虚线框），标签退场
  const tN = T('e21', '写完') - 0.3;
  fadeOut(bang, tN, 0.3);
  to([n2, r2], tN, { opacity: 1, duration: 0.3 }); to(n2, tN, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 });
  tl.fromTo(fill, { scaleX: 0.5, backgroundColor: K.spring }, { scaleX: 1, duration: 0.6, ease: 'none', immediateRender: false }, tN);
  to(fill, tN + 0.65, { backgroundColor: K.forest, duration: 0.3 }); to(r2, tN, { backgroundColor: K.ink, duration: 0.3 });
  if (n2._t) to(n2._t, tN + 0.65, { color: '#FFFFFF', duration: 0.3 });
  to(pNew, tN + 0.5, { autoAlpha: 1, duration: 0.3 });
  revealBand(V, tN + 0.4, 126976, 135168, 0.5); const ex2 = V.band.blk(126976, 135168, 'h', '区段表'); set(ex2, s.start, { autoAlpha: 0 }); show(ex2, tN + 0.7, { y: 0, s: 0.7, d: 0.35 });   // 这次检查点的区段表
  to([V.b.l2, V.b.r], T('e21', '空出') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', borderColor: K.gd1, borderStyle: 'dashed', duration: 0.45 });   // lint-ok: 空出的块是透明底
  fadeOut(pNew, T('e22') - 0.1, 0.35); to(k1225, T('e22') - 0.1, { backgroundColor: 'rgba(0,0,0,0)', color: '#FFFFFF', duration: 0.3 });   // lint-ok: 取消高亮
  // e22 文件 96 KB → 132 KB：文件条已经长出来，右边的大小跟着数上去
  stepTo(V.size, [[T('e22', '长到') - 0.3, 1.0, 96, 132]], (v) => Math.round(v) + ' KB');
  solid(V.size, T('e22', '一百') - 0.2, 'new');
  // e24 引出下一章：页上是 43，链上还挂着 42；读的人走到两版之间停住
  const tQ = T('e24') - 0.2;
  to(V.size, tQ, { backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', color: K.ink, duration: 0.3 });   // lint-ok: 退回文字
  to([V.leaves[2].c, V.leaves[3].c], tQ - 0.15, { opacity: 0, duration: 0.4 });
  const q43 = vbox('43', 990, 'new'), q42 = vbox('42', 1300, 'old');
  const qA = link(ov, [[1192, RY + 20], [1296, RY + 20]], 'dim', { w: 3, arrow: true });
  show(q43, tQ + 0.1, { x: -20, y: 0, d: 0.4 }); show(q42, T('e24', '42') - 0.4, { x: -20, y: 0, d: 0.4 }); arrowIn(qA, T('e24', '42') - 0.35, 0.35);
  const qr = h('div', 'abs', world, ico('person', 46, '#FFFFFF', 2.8)); px(qr, 1060, 378, 64, 64);
  css(qr, { background: K.blue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  show(qr, T('e24', '读的人') - 0.2, { y: -12, d: 0.4 });
  to([V.dsk, V.band.wrap, V.size], T('e24', '43') - 0.3, { opacity: 0.3, duration: 0.45 });   // 问题在内存里：磁盘退后
  tl.to(qr, { x: 1370 - 1060, duration: 0.6, ease: 'power2.inOut' }, T('e24', '42') - 0.3);
  tl.to(qr, { x: 1060 - 1060, duration: 0.6, ease: 'power2.inOut' }, T('e24', '43') - 0.35);
  tl.to(qr, { x: 1215 - 1060, duration: 0.5, ease: 'power2.inOut' }, Tend('e24') - 0.2);
  const qm = h('div', 'abs', world, '?'); px(qm, 1228, 300, 60, 70); css(qm, { font: '800 64px/70px "Inter"', color: K.blue, textAlign: 'center' });
  show(qm, Tend('e24') + 0.2, { y: 10, s: 0.6, d: 0.4 });
});
