// 第 06 章 改：上面集合树，下面 96 KB 的集合文件。Alice 42 → 43：只有集合树里 2050 这一项要改（两个索引不动）；
// 内存里在这一项上挂新版本（更新链）；检查点把整个叶页写到文件末尾，旧页不覆盖，文件 96 → 132 KB。
// 事实：D01 D02 D03 D04 D05 D06 D07 B02 B10。
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const V = collView(world, c0, ov), b = V.b, band = V.band;
  const NX = 1130, NY = 130;   // 旁注固定的位置：根页右边
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const mid = (x, y, txt, t0, t1, cls = 'dk') => { const c = xl(world, x, y, txt, cls); show(c, t0, { y: 10 }); if (t1 != null) fadeOut(c, t1); return c; };
  const MX = 450, MY = 600;    // 树与文件之间的空当：放这一句的要点（避开连线）

  // 回到刚写完的状态；Alice 那一页
  glow(V.leaf[1], T('e1'), null, { bg: '#E3FCF7', c: '#00684A' }); glow(b.l2, T('e1'), null, { bg: '#00ED64' });
  mid(MX, MY, 'Alice 在第二个叶页', T('e1') + 0.3, T('e1b') - 0.1, 'on');
  mid(140, 890, '4096 人刚写完：集合文件 96 KB', T('e1a') + 0.5, T('e1b') - 0.1);
  mid(1500, 600, '96 KB', T('e1a', '96 KB') - 0.3, T('e1b') - 0.1, 'on');

  // 中间的面板：先看哪几棵树要动，再看那一项上发生了什么
  const P = h('div', 'panel', world); px(P, 140, 430, 1640, 300);
  show(P, T('e1b'), { y: 14 });
  const pt = xl(P, 28, 14, 'Alice 过生日：age 42 → 43'); show(pt, T('e1b', '43') - 0.4, { y: 8 });
  const A1 = tile(P, 28, 100, 360, 150, '姓名索引', '用它找到 Alice', 'dk');
  const A2 = tile(P, 400, 100, 360, 150, '_id 索引', 'RecordId 没变', 'dk');
  const A3 = tile(P, 772, 100, 360, 150, '集合树', '只有 2050 要改', 'sp');
  show(A1, T('e2', '姓名索引') - 0.2, { y: 10 }); swapAt(A1._s, '用它找到 Alice', '名字没变 · 不用动', T('e3'));
  glow(V.leaf[1], T('e2') + 0.8, T('e4'), { bg: '#00ED64', bd: '#00ED64', c: '#023430', rb: '#E3FCF7', rd: '#00684A', rc: '#00684A' });
  show(A2, T('e3', 'RecordId'), { y: 10 }); to([A1, A2], T('e3', '不用动'), { autoAlpha: 0.4, duration: 0.5 });
  show(A3, T('e4', '2050'), { y: 10 }); sfx('pop', T('e4', '2050'));
  const pf = term(P, 1150, 14, 470, 270, 'profiler · update', { fs: 22 });
  pf.out(T('e2') + 0.4, '<span class="k">keysExamined</span>: <span class="n">1</span>,\n<span class="k">docsExamined</span>: <span class="n">1</span>,');
  pf.out(T('e3', '不用动') - 0.3, '<span class="k">keysInserted</span>: <span class="n">0</span>,\n<span class="k">keysDeleted</span>: <span class="n">0</span>');
  pf.out(T('e4') + 0.3, "<span class=\"k\">planSummary</span>: <span class=\"s\">'IXSCAN { name: 1 }'</span>");
  show(pf.c, T('e2'), { x: 20, y: 0 });
  fadeOut([pt, A1, A2, A3, pf.c], T('e5') - 0.15);

  // 更新链：旧值不擦，挂新版本
  const C1 = tile(P, 28, 90, 480, 150, '页上的 2050', 'Alice · age 42', 'dk');
  const C2 = tile(P, 590, 90, 440, 150, '新版本', 'age 43', 'sp');
  const C3 = tile(P, 1110, 90, 500, 150, '再改一次，再挂一个', '一串版本，新的在后', 'dash');
  show(C1, T('e5'), { y: 10 });
  const noErase = xl(P, 28, 14, '不擦掉 42', 'dk'); show(noErase, T('e5', '擦掉') - 0.2, { y: 0, s: 1.2 }); fadeOut(noErase, T('e6') - 0.1);
  show(C2, T('e6', '新版本'), { x: -30, y: 0 }); sfx('pop', T('e6', '新版本'));
  const l12 = link(ov, [[652, 595], [724, 595]], 'accent', { arrow: true, w: 3 }); arrowIn(l12, T('e6', '新版本') + 0.2, 0.5);
  to(C1, T('e7'), { autoAlpha: 0.6, duration: 0.4 });
  show(C3, T('e7', '再挂一个'), { x: -30, y: 0 });
  const l23 = link(ov, [[1174, 595], [1244, 595]], 'accent', { arrow: true, w: 3, dashed: '6 6' }); arrowIn(l23, T('e7', '再挂一个') + 0.2, 0.5);
  const chainL = gloss(xl(P, 28, 14, '更新链：同一项的各个版本，连成一串'), '更新链'); show(chainL, T('e7', '更新链') - 0.3, { y: 8 });
  fadeOut(chainL, T('e8') - 0.1);
  const reader = xl(P, 28, 14, '有人同时在读：用的还是 42', 'on'); show(reader, T('e8', '同时在读') - 0.3, { y: 8 });
  fadeOut([P, l12, l23, reader], T('e9') - 0.2);

  // 改动还在缓存里；检查点之前文件不变
  const t9 = T('e9');
  const lk = [[0, 4096, 28672], [1, 28672, 53248], [2, 53248, 65536], [3, 65536, 86016]].map(([i, a, z]) => conn(ov, band, i, a, z, t9 + 0.2));
  mid(MX, MY, '改动还在缓存里', T('e9', '缓存里') - 0.2, T('e10') - 0.1, 'dk');
  const ck = chip(world, 830, 40, '检查点', 'dk'); show(ck, T('e10'), { y: 10 });
  const sh = term(world, 1130, 20, 660, 236, 'shell', { fs: 22 });
  show(sh.c, t9 + 0.1, { x: 20, y: 0 });
  sh.cmd(t9 + 0.3, 'ls -l db/collection-….wt', '$ '); sh.out(T('e9', '没变') - 0.2, '<span class="n">98304</span>　<span class="c"># 改完、检查点之前：96 KB</span>');
  sh.cmd(T('e10') + 0.2, 'db.adminCommand({ <span class="k">fsync</span>: <span class="n">1</span> })', 'lab&gt; ');
  sh.clear(T('e12') - 0.1);
  sh.cmd(T('e12'), 'wt verify -d dump_address …', '$ ');
  sh.out(T('e12', '文件末尾') - 0.2, '<span class="n">[0: 98304-122880, 24576]</span> <span class="c"># 第二个叶页</span>');
  sh.out(T('e15', '根页') - 0.2, '<span class="n">[0: 122880-126976, 4096]</span> <span class="c"># 根页</span>');
  sh.clear(T('e22') - 0.1);
  sh.cmd(T('e22'), 'ls -l db/collection-….wt', '$ '); sh.out(T('e22', '132 KB') - 0.4, '<span class="n">135168</span>　<span class="c"># 132 KB</span>');
  glow(V.leaf[1], T('e10', '这一页'), T('e12') + 1, { bg: '#00ED64', bd: '#00ED64', c: '#023430', rb: '#E3FCF7', rd: '#00684A', rc: '#00684A' });

  // 检查点：整页写到文件末尾一块新的地方，文件长到 132 KB
  const tN = T('e12');
  const nb = band.blk(98304, 122880, 'a', '1225–2448'); show(nb, tN + 0.5, { y: -260, d: 0.7, ease: 'power2.in' });
  clipBand(band, tN + 0.2, 1.0, CV.CLIP0, CV.CLIP1, false);
  stepTo(V.sizeL, [[tN + 0.2, 1.0, 96, 132]], (v) => Math.round(v) + ' KB');
  sfx('thud', tN + 1.0, { g: 0.5 });
  fadeOut(lk[1], tN + 0.4);
  conn(ov, band, 1, 98304, 122880, tN + 1.0, 'spring');
  mid(MX, MY, '不写回原来的位置', T('e11') + 0.1, T('e12') + 0.6, 'red');
  const byte = mid(MX, MY, '2a → 2b　就是 42 → 43', T('e13') + 0.6, T('e14') - 0.1, 'on');
  mid(1460, 600, '47 字节里只变了 1 个', T('e13', '42 变成 43') - 0.2, T('e14') - 0.1, 'dk'); css(byte, { fontFamily: '"Mono"' });
  mid(1500, 600, '整页 24 KB', T('e14', '24 KB') - 0.2, T('e15') - 0.1);
  // 根页也换了地方
  const nr = band.blk(122880, 126976, 'r'); show(nr, T('e15') + 0.3, { y: -500, d: 0.7, ease: 'power2.in' }); sfx('pop', T('e15') + 0.9);
  glow(V.root, T('e15', '根页'), T('e16'), { bg: '#00684A', bd: '#00ED64', rb: '#023430', rd: '#023430' });
  mid(1500, 600, '根页：记下新位置', T('e15', '新位置') - 0.4, T('e16') - 0.1);
  mid(MX, MY, '两个索引：一项都不用改', T('e16', '一项都不用改') - 0.3, T('e17') - 0.1, 'on');
  mid(MX, MY, '另外三个叶页：留在原地', T('e17') + 0.1, T('e18') - 0.1, 'dk');
  glow([b.l1, b.l3, b.l4], T('e17', '留在原地') - 0.3, T('e18'), { bg: '#C0FAE6', bd: '#00684A' });

  // 旧页原样留着，新检查点写完才算数
  [b.l2, b.r].forEach((e) => css(e, { outline: '0px solid #00684A' }));
  to([b.l2, b.r], T('e18'), { outlineWidth: '5px', duration: 0.4 });
  mid(MX, MY, '上一个检查点：原样留着', T('e18', '原样留着') - 0.3, T('e19') - 0.1);
  mid(MX, MY, '写到一半出了事', T('e19', '出了事') - 0.3, T('e20') - 0.1, 'red');
  mid(MX, MY, '重启：回到上一个检查点', T('e20', '回到') - 0.3, T('e21') - 0.1, 'on');
  const t21 = T('e21');
  const d2 = band.blk(28672, 53248, 'f'), dr = band.blk(86016, 90112, 'f');
  show([d2, dr], t21, { y: 0, d: 0.6 }); hide([b.l2, b.r], t21, { y: 0, d: 0.6 });
  mid(MX, MY, '空出来，留给以后用', T('e21', '空出来') - 0.3, T('e22') - 0.1);
  to(V.sizeL, T('e22'), { color: '#00684A', duration: 0.4 });
  mid(1500, 600, '96 KB → 132 KB', T('e22', '132 KB') - 0.3, T('e24') - 0.1);
  mid(MX, MY, '那删掉一份文档，文件会变小吗？', T('e24') + 0.2, null, 'dk');

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
