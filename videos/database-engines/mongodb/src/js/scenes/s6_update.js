// 第 06 章 改：上面集合树与 96 KB 的集合文件，下面一条工作区（左边过程，右边 mongosh／shell 回显）。Alice 42 → 43：
// 只有集合树里 2050 这一项要改（两个索引不动）；内存里在这一项上挂新版本（更新链）；检查点把整个叶页写到文件末尾，旧页不覆盖，文件 96 → 132 KB。
// 事实：D01 D02 D03 D04 D05 D06 D07 B02 B10；回显抄自 research/lab/out_05_update.txt。
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '06 改');
  ch.sec(c0, '更新链');
  const V = collView(world, c0, ov), b = V.b, band = V.band;
  const WY = 640;   // 工作区
  figs(world, 140, CV.BY + 90, 1640, [[c0 + 0.6, '图 6-1', '集合树与集合文件，文件按真实偏移 4 KB 一格', '实测：wt verify -d dump_address']], null);

  // 回到刚写完的状态；Alice 那一页
  glow(V.leaf[1], T('e1') - 0.2, null, { bg: '#E3FCF7', bd: '#00A35C', c: '#00684A' }); glow(b.l2, T('e1') - 0.2, null, { bg: '#00ED64', rb: '#FFFFFF' });
  const aliceTag = chip(world, 260 + 390 + 80, CV.LY + CV.LH + 10, 'Alice 在这一页', 'on'); show(aliceTag, T('e1') + 0.2, { y: 6 });
  const fresh = callout(world, 140, WY, 'note', '每一章的实验都从同一份新装的 4096 人出发：集合文件 96 KB', '起点');
  show(fresh, T('e1a') - 0.1, { y: 10 }); fadeOut(fresh, T('e1b') - 0.1);
  glow(V.sizeL, T('e1a', '96 KB') - 0.3, T('e1b'), { bg: '#E3FCF7', bd: '#E3FCF7', rb: 'rgba(0,0,0,0)', rd: 'rgba(0,0,0,0)' });

  // 右边：这次修改的操作记录（profiler，out_05）
  const sh = term(world, 1180, WY - 20, 600, 320, 'mongosh', { fs: 22 });
  show(sh.c, T('e1b') - 0.1, { x: 20, y: 0 });
  sh.cmd(T('e1b'), 'db.users.updateOne({ <span class="k">name</span>: <span class="s">"Alice"</span> },\n  { <span class="k">$set</span>: { <span class="k">age</span>: <span class="n">43</span> } })');
  sh.out(T('e2') + 0.3, '<span class="c">// profiler 记下的这次修改：</span>\n<span class="k">keysExamined</span>: <span class="n">1</span>, <span class="k">docsExamined</span>: <span class="n">1</span>,');
  sh.out(T('e3', '不用动') - 0.3, '<span class="k">keysInserted</span>: <span class="n">0</span>, <span class="k">keysDeleted</span>: <span class="n">0</span>');

  // 左边：哪几棵树要动
  const title = h('div', 'abs', world, 'Alice 过生日：age <span style="color:#5C6C75">42</span> → <span style="color:#00684A">43</span>'); px(title, 140, WY - 20); css(title, { font: '700 34px "Inter", "Sans SC"', color: '#001E2B' });
  show(title, T('e1b') - 0.1, { y: 8 });
  const A1 = tile(world, 140, WY + 40, 310, 140, '姓名索引', '用它找到 Alice', 'dk');
  const A2 = tile(world, 470, WY + 40, 310, 140, '_id 索引', 'RecordId 没变', 'dk');
  const A3 = tile(world, 800, WY + 40, 330, 140, '集合树', '只有 2050 要改', 'sp');
  show(A1, T('e2', '姓名索引') - 0.2, { y: 10 }); swapAt(A1._s, '用它找到 Alice', '名字没变 · 不用改', T('e3') + 0.7);
  show(A2, T('e3', 'RecordId') - 0.1, { y: 10 }); to([A1, A2], T('e4') - 0.1, { autoAlpha: 0.45, duration: 0.5 });
  show(A3, T('e4', '2050') - 0.25, { y: 10 }); sfx('pop', T('e4', '2050'));
  glow(V.leaf[1], T('e4', '2050') - 0.1, T('e5'), { bg: '#00ED64', bd: '#00ED64', c: '#023430', rb: '#E3FCF7', rd: '#00A35C', rc: '#00684A' });
  fadeOut([title, A1, A2, A3], T('e5') - 0.15);

  // 更新链：旧值不擦，挂新版本（D01）
  const C1 = tile(world, 140, WY + 40, 300, 140, '页上的 2050', 'age 42', 'dk');
  const C2 = tile(world, 520, WY + 40, 260, 140, '新版本', 'age 43', 'sp');
  const C3 = tile(world, 860, WY + 40, 270, 140, '再改一次', '再挂一个', 'dash');
  show(C1, T('e5') - 0.05, { y: 10 });
  const noErase = h('div', 'abs', world); px(noErase, 150, WY + 112, 160, 4); css(noErase, { background: '#DB3030', transformOrigin: '0 50%' });
  fromTo(noErase, T('e5', '擦掉') - 0.1, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.3 }); to(noErase, T('e5', '擦掉') + 0.5, { autoAlpha: 0, duration: 0.3 });
  show(C2, T('e6', '新版本') - 0.1, { x: -30, y: 0 }); sfx('pop', T('e6', '新版本'));
  const l12 = link(ov, [[446, WY + 110], [514, WY + 110]], 'accent', { arrow: true, w: 3 }); arrowIn(l12, T('e6', '新版本') + 0.1, 0.4);
  show(C3, T('e7', '再挂一个') - 0.1, { x: -30, y: 0 });
  const l23 = link(ov, [[786, WY + 110], [854, WY + 110]], 'accent', { arrow: true, w: 3, dashed: '6 6' }); arrowIn(l23, T('e7', '再挂一个') + 0.1, 0.4);
  const chainL = gloss(label(world, 140, WY - 20, '更新链：同一项的各个版本，新的接在后面', 'h2'), '更新链'); css(chainL, { fontSize: '32px' });
  show(chainL, T('e7', '更新链') - 0.3, { y: 8 });
  const reader = chip(world, 150, WY + 194, '同时在读的人读这一版', 'blue');
  show(reader, T('e8') - 0.1, { y: 8 });
  fadeOut([C1, C2, C3, l12, l23, chainL, reader, aliceTag], T('e9') - 0.2);

  // 改动还在缓存里；检查点之前文件不变（D03）
  ch.sec(T('e9') - 0.2, '检查点');
  const t9 = T('e9');
  const lk = [[0, 4096, 28672], [1, 28672, 53248], [2, 53248, 65536], [3, 65536, 86016]].map(([i, a, z]) => conn(ov, band, i, a, z, t9 + 0.2));
  sh.clear(t9 - 0.1);
  sh.cmd(t9, 'ls -l db/collection-….wt', '$ ');
  sh.out(T('e9', '没变') - 0.2, '<span class="n">98304</span>  <span class="c"># 改完、检查点之前：96 KB</span>');
  sh.out(T('e9', '缓存里') - 0.1, '<span class="c">// 缓存里的脏数据（tracked dirty bytes）：</span>\n<span class="n">149958</span>');
  const inCache = callout(world, 140, WY, 'note', '文件还是 98,304 字节', '还没落盘');
  show(inCache, T('e9') + 0.2, { y: 10 }); fadeOut(inCache, T('e11') - 0.2);
  const ck = chip(world, 450, CV.BY - 58, '检查点', 'dk'); show(ck, T('e10') - 0.1, { y: 8 });
  glow(V.leaf[1], T('e10', '这一页'), T('e12') + 1, { bg: '#00ED64', bd: '#00ED64', c: '#023430', rb: '#E3FCF7', rd: '#00A35C', rc: '#00684A' });
  sh.clear(T('e10') + 0.8);
  sh.cmd(T('e10') + 0.9, 'db.adminCommand({ <span class="k">fsync</span>: <span class="n">1</span> })');

  // e11–e12：不写回原来的位置；整页写到文件末尾一块新的地方，文件长到 132 KB（B02 D04）
  const xOld = h('div', 'abs', world); px(xOld, band.xOf(28672) + 4, CV.BY + 4, band.xOf(53248) - band.xOf(28672) - 8, 66); css(xOld, { border: '4px solid #DB3030', borderRadius: '6px' });
  show(xOld, T('e11', '原来的位置') - 0.4, { y: 0, s: 1.04, d: 0.3 }); fadeOut(xOld, T('e12') + 0.4);
  const noBack = callout(world, 140, WY, 'warn', '第二个叶页原来在 28672–53248，这次不往那里写', '不覆盖');
  show(noBack, T('e11') - 0.1, { y: 10 }); fadeOut(noBack, T('e13') - 0.1);
  const tN = T('e12');
  const nb = band.blk(98304, 122880, 'a', '1225–2448'); show(nb, tN + 0.5, { y: -220, d: 0.7, ease: 'power2.in' });
  clipBand(band, tN + 0.2, 1.0, CV.CLIP0, CV.CLIP1, false);
  stepTo(V.sizeL, [[tN + 0.2, 1.0, 96, 132]], (v) => Math.round(v) + ' KB');
  sfx('thud', tN + 1.0, { g: 0.5 });
  fadeOut(lk[1], tN + 0.4);
  conn(ov, band, 1, 98304, 122880, tN + 1.0, 'spring');
  sh.clear(tN - 0.1);
  sh.cmd(tN, 'wt verify -d dump_address …', '$ ');
  sh.out(T('e12', '文件末尾') - 0.2, '<span class="n">[0: 98304-122880, 24576]</span> <span class="c"># 第二个叶页</span>');
  // e13：47 字节里只变了一个字节（D07）；e14：整页 24 KB
  const by = h('div', 'abs', world); px(by, 140, WY + 40, 990, 120); css(by, { background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '12px' });
  by.innerHTML = '<div style="position:absolute;left:24px;top:14px;font:600 24px Inter,\'Sans SC\';color:#5C6C75">检查点里 Alice 那一项的最后几个字节</div>'
    + '<div style="position:absolute;left:24px;top:56px;font:500 32px Mono;color:#001E2B">… 61 67 65 00 <span style="background:#FFEAE5;color:#970606;padding:0 6px;border-radius:4px">2a</span> 00 00 00 00</div>'
    + '<div style="position:absolute;left:596px;top:56px;font:500 32px Mono;color:#5C6C75">→</div>'
    + '<div style="position:absolute;left:650px;top:56px;font:500 32px Mono;color:#001E2B"><span style="background:#00ED64;color:#023430;padding:0 6px;border-radius:4px">2b</span> 00 00 00 00</div>';
  show(by, T('e13') - 0.1, { y: 10 });
  const byL = label(world, 140, WY - 20, '只变了 1 个字节：2a（42）→ 2b（43）', 'h2'); css(byL, { fontSize: '32px' });
  show(byL, T('e13') + 0.2, { y: 8 }); fadeOut(byL, T('e14') - 0.1);
  const pgL = label(world, 140, WY - 20, '检查点写出去的：整个叶页 24,576 字节', 'h2'); css(pgL, { fontSize: '32px', color: '#00684A' });
  show(pgL, T('e14', '24 KB') - 0.4, { y: 8 }); fadeOut([pgL, by], T('e15') - 0.1);
  glow(nb, T('e14', '24 KB') - 0.3, T('e15'), { bg: '#71F6BA', bd: '#00684A', rb: '#00ED64', rd: '#00ED64' });
  // e15：根页也换了地方（D04）
  const nr = band.blk(122880, 126976, 'r'); show(nr, T('e15') + 0.3, { y: -300, d: 0.7, ease: 'power2.in' }); sfx('pop', T('e15') + 0.9);
  glow(V.root, T('e15', '根页'), T('e16'), { bg: '#00684A', bd: '#00ED64', rb: '#001E2B', rd: '#001E2B' });
  sh.out(T('e15', '根页') - 0.2, '<span class="n">[0: 122880-126976, 4096]</span> <span class="c"># 根页</span>');
  const rootN = callout(world, 140, WY, 'note', '叶页搬家，根页也重写一份', '根页');
  show(rootN, T('e15') + 0.35, { y: 10 }); fadeOut(rootN, T('e16') + 0.1);
  // e16：两个索引记的是 2050，不是位置
  const idxN = callout(world, 140, WY, 'tip', '索引记的是 2050，不是位置', '索引不用动');
  show(idxN, T('e16') + 0.2, { y: 10 }); fadeOut(idxN, T('e17') + 0.2);
  // e17：另外三个叶页留在原地
  glow([b.l1, b.l3, b.l4], T('e17', '留在原地') - 0.4, T('e18'), { bg: '#E3FCF7', bd: '#00A35C', rb: '#FFFFFF', rd: '#889397' });
  const stay = chip(world, 760, WY + 20, '另外三个叶页：位置不变', 'on'); show(stay, T('e17') - 0.1, { y: 8 }); fadeOut(stay, T('e18') + 0.6);

  // e18–e20：旧页原样留着，新检查点写完才算数（D06）
  [b.l2, b.r].forEach((e) => css(e, { outline: '0px solid #00684A' }));
  to([b.l2, b.r], T('e18') - 0.1, { outlineWidth: '5px', duration: 0.4 });
  const keep = callout(world, 140, WY, 'imp', '旧页原样留着：新的写坏了，还能回到上一个', '为什么不覆盖');
  show(keep, T('e18', '原样留着') - 0.4, { y: 10 });
  hide(keep, T('e21') - 0.1, { y: 0, d: 0.3 });
  const t21 = T('e21');
  const d2 = band.blk(28672, 53248, 'f'), dr = band.blk(86016, 90112, 'f');
  show([d2, dr], t21, { y: 0, d: 0.6 }); hide([b.l2, b.r], t21, { y: 0, d: 0.6 });
  const freeN = callout(world, 140, WY, 'note', '新检查点写完，旧页的地方才空出来，留给以后的写入', '空出来');
  show(freeN, T('e21', '空出来') - 0.3, { y: 10 }); fadeOut(freeN, T('e24') - 0.2);
  // e22：96 → 132 KB
  to(V.sizeL, T('e22'), { color: '#00684A', duration: 0.4 });
  sh.clear(T('e22') - 0.1);
  sh.cmd(T('e22'), 'ls -l db/collection-….wt', '$ '); sh.out(T('e22', '132 KB') - 0.4, '<span class="n">135168</span>  <span class="c"># 132 KB</span>');
  // e24：删掉一份，它会变小吗？
  nextPage(world, 600, WY + 60, '07', '删', T('e24') - 0.1);

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
