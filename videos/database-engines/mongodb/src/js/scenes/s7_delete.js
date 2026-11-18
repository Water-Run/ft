// 第 07 章 删：同样从 96 KB 的集合文件开始。Alice 注销：三棵树都要动（profiler：ndeleted 1、keysDeleted 2）；内存里挂删除标记；
// 检查点后第二个叶页又写到末尾，文件 132 KB。Dave 注册拿到 4097（$recordId），落进最后一个叶页；检查点时他那页写进第二个叶页空出来的块，
// 根页挪进旧叶页的位置，文件缩回 120 KB（compact 也释放不出字节）。右上角的 shell 回显抄自 research/lab/out_06_delete.txt。
// 事实：F01 F02 F03 F04 F05 F06 F07 D05 A05 B03。
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const V = collView(world, c0, ov), b = V.b, band = V.band;
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const mid = (x, y, txt, t0, t1, cls = 'dk') => { const c = xl(world, x, y, txt, cls); show(c, t0, { y: 10 }); if (t1 != null) fadeOut(c, t1); return c; };
  const MX = 450, MY = 600;
  mid(140, 890, '还是那个刚写完 4096 人的集合文件：96 KB', T('f1') + 0.4, T('f1a') + 1.5);
  glow(V.leaf[1], T('f1'), null, { bg: '#E3FCF7', c: '#00684A' }); glow(b.l2, T('f1'), null, { bg: '#00ED64' });
  css(V.root, { outline: '0px solid #00ED64' });
  const t1 = T('f1a');
  const lk0 = [[0, 4096, 28672], [1, 28672, 53248], [2, 53248, 65536], [3, 65536, 86016]].map(([i, a, z]) => conn(ov, band, i, a, z, T('f1') + 0.3));
  fadeOut(lk0, t1 - 0.1);

  // Alice 注销：三棵树各动一处；右边是这次删除的 profiler 记录
  const P = h('div', 'panel', world); px(P, 140, 440, 1640, 270);
  const pt = xl(P, 28, 14, 'Alice 注销账号', 'dk');
  show(P, t1, { y: 14 }); show(pt, t1 + 0.2, { y: 8 });
  const A1 = tile(P, 28, 100, 360, 150, '集合树', '删掉 2050 这份', 'sp');
  const A2 = tile(P, 400, 100, 360, 150, '姓名索引', '删掉 1 项', 'dk');
  const A3 = tile(P, 772, 100, 360, 150, '_id 索引', '删掉 1 项', 'dk');
  show(A1, T('f2', '集合树'), { y: 10 }); sfx('pop', T('f2', '集合树')); show([A2, A3], T('f2b'), { y: 10, stagger: 0.4 });
  const pf = term(P, 1150, 14, 470, 240, 'profiler · remove', { fs: 22 });
  show(pf.c, T('f2') - 0.1, { x: 20, y: 0 });
  pf.out(T('f2', '删掉') - 0.2, '<span class="k">ndeleted</span>: <span class="n">1</span>,');
  pf.out(T('f2b') + 0.2, '<span class="k">keysDeleted</span>: <span class="n">2</span>');
  pf.out(T('f2b') + 1.0, '<span class="c">countDocuments() → 4095</span>');
  fadeOut([pt, A1, A2, A3, pf.c], T('f3') - 0.15);

  // 删除标记：挂在更新链上，不带内容
  const C1 = tile(P, 28, 90, 480, 150, '页上的 2050', 'Alice · age 42', 'dk');
  const C2 = tile(P, 590, 90, 620, 150, '新版本：删除', '不带内容，只说这一项删了', 'rd');
  show(C1, T('f3'), { y: 10 }); const memL = xl(P, 28, 14, '在内存里：也是在更新链上挂一个版本'); show(memL, T('f3', '更新链') - 0.3, { y: 8 }); fadeOut(memL, T('f5') - 0.1);
  show(C2, T('f4', '不带内容') - 0.3, { x: -30, y: 0 }); sfx('pop', T('f4', '不带内容') - 0.3);
  const l12 = link(ov, [[652, 605], [724, 605]], 'accent', { arrow: true, w: 3 }); arrowIn(l12, T('f4', '不带内容'), 0.5);
  const tomb = gloss(xl(P, 28, 14, '删除标记：不带内容的版本，说这一项删了', 'on'), '删除标记'); show(tomb, T('f5', '删除标记') - 0.3, { y: 8 });
  fadeOut([P, l12], T('f6') - 0.2);

  // 右上角的 shell：检查点前后的地址与大小（out_06）
  const sh = term(world, 1130, 20, 660, 236, 'shell', { fs: 22 });
  const t6 = T('f6');
  show(sh.c, t6 - 0.1, { x: 20, y: 0 });
  sh.cmd(t6 + 0.1, 'wt verify -d dump_address …', '$ ');
  sh.out(T('f6', '文件末尾') - 0.2, '<span class="n">[0: 98304-122880, 24576]</span> <span class="c"># 第二个叶页</span>');
  sh.out(T('f7') + 0.2, '<span class="c">键 … c7c1 · c7c3 …　（2049、2051，没有 2050）</span>');
  sh.clear(T('f8') - 0.1);
  sh.cmd(T('f8'), 'ls -l db/collection-….wt', '$ '); sh.out(T('f8', '132 KB') - 0.4, '<span class="n">135168</span>　<span class="c"># 132 KB</span>');

  // 检查点：第二个叶页写到文件末尾，文件 132 KB
  const ck = chip(world, 830, 40, '检查点', 'dk'); show(ck, t6, { y: 10 }); fadeOut(ck, T('f9') - 0.2);
  const nb = band.blk(98304, 122880, 'a', '1225–2448'); show(nb, t6 + 0.7, { y: -260, d: 0.7, ease: 'power2.in' });
  const nr = band.blk(122880, 126976, 'r'); show(nr, t6 + 1.0, { y: -500, d: 0.7, ease: 'power2.in' });
  clipBand(band, t6 + 0.4, 1.0, CV.CLIP0, CV.CLIP1, false);
  stepTo(V.sizeL, [[t6 + 0.4, 1.0, 96, 132], [T('f15') + 0.3, 1.2, 132, 120]], (v) => Math.round(v) + ' KB');
  sfx('thud', t6 + 1.2, { g: 0.5 });
  const lkA = [conn(ov, band, 0, 4096, 28672, t6 + 1.6), conn(ov, band, 1, 98304, 122880, t6 + 1.7, 'spring'), conn(ov, band, 2, 53248, 65536, t6 + 1.8), conn(ov, band, 3, 65536, 86016, t6 + 1.9)];
  mid(MX, MY, '2049 后面，紧接着 2051', T('f7', '2051') - 0.4, T('f8') - 0.1, 'on');
  mid(MX, MY, '少了一份文档，文件反而长到 132 KB', T('f8') + 0.4, T('f9') - 0.1);
  // 旧页的地方空出来
  const t9 = T('f9');
  const d2 = band.blk(28672, 53248, 'f'), dr = band.blk(86016, 90112, 'f');
  show([d2, dr], t9, { y: 0, d: 0.6 }); hide([b.l2, b.r], t9, { y: 0, d: 0.6 });
  mid(MX, MY, '第二个叶页原来的地方：空了', T('f9', '空了') - 0.3, T('f10') - 0.1);

  // Dave 注册：拿到 4097，空出来的 2050 不再发出去
  fadeOut(lkA, T('f10') - 0.2);
  const Q = h('div', 'panel', world); px(Q, 140, 440, 1640, 270); show(Q, T('f10'), { y: 14 });
  const D1 = tile(Q, 28, 60, 400, 150, 'Dave 注册', '又一份新文档', 'dk');
  const D2 = tile(Q, 470, 60, 560, 150, 'RecordId：4097', '接着往上加', 'sp');
  const D3 = tile(Q, 1070, 60, 540, 150, '2050 空着', '不会再发给别人', 'dk');
  show(D1, T('f10'), { y: 10 }); show(D2, T('f11', '4097') - 0.4, { y: 10 }); sfx('pop', T('f11', '4097') - 0.4); show(D3, T('f11', '空出来的') - 0.2, { y: 10 });
  sh.clear(T('f10') - 0.1);
  sh.cmd(T('f10') + 0.1, 'db.users.find({ <span class="k">name</span>: <span class="s">"Dave"</span> }).showRecordId()', 'lab&gt; ');
  sh.out(T('f11', '4097') - 0.3, "<span class=\"k\">'$recordId'</span>: Long(<span class=\"s\">'4097'</span>)");
  // 4097 比最后一个分界大，落进最后一个叶页
  to(V.root, T('f13'), { outlineWidth: '6px', duration: 0.4 });
  mid(1500, 600, '4097 > 3124', T('f13', '3124') - 0.3, T('f14') - 0.1, 'on');
  keyed(V.leaf[3]).at(T('f13', '落进') - 0.2, { html: '3124–4097' });
  glow(V.leaf[3], T('f13', '落进') - 0.2, null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' }); sfx('pop', T('f13', '落进'));
  const dv = chip(world, 1470, 384, 'Dave', 'on'); show(dv, T('f13', '落进'), { y: 6 });
  fadeOut(Q, T('f14') - 0.15);

  // 检查点：Dave 那页写进旧页空出的块
  const t14 = T('f14');
  to(V.root, t14, { outlineWidth: '0px', duration: 0.3 });
  const ck2 = chip(world, 830, 40, '检查点', 'dk'); show(ck2, t14, { y: 10 });
  const t14b = T('f14', '用上了') - 0.2;
  mid(MX, MY, '检查点：给这一页找地方', t14 + 0.2, t14b + 0.4, 'dk');
  const dB = band.blk(28672, 49152, 'd', 'Dave 在这页'), d2b = band.blk(49152, 53248, 'f');
  show([dB, d2b], t14b, { y: -260, d: 0.7, ease: 'power2.in' }); hide(d2, t14b, { y: 0, d: 0.5 });
  sfx('thud', t14b + 0.6, { g: 0.5 });
  conn(ov, band, 0, 4096, 28672, t14b + 0.9); conn(ov, band, 1, 98304, 122880, t14b + 1.0); conn(ov, band, 2, 53248, 65536, t14b + 1.1); conn(ov, band, 3, 28672, 49152, t14b + 1.2, 'spring');
  sh.clear(t14b - 0.1);
  sh.cmd(t14b, 'wt verify -d dump_address …', '$ ');
  sh.out(t14b + 1.0, '<span class="n">[0: 28672-49152, 20480]</span> <span class="c"># Dave 那一页</span>');
  // 根页也挪进旧叶页的位置，文件末尾那一块用不着了，文件缩回 120 KB
  const t15 = T('f15');
  const nr2 = band.blk(65536, 69632, 'r'); show(nr2, t15, { y: -300, d: 0.7, ease: 'power2.in' }); sfx('pop', t15 + 0.7);
  hide([nr, dr], t15 + 0.3, { y: 0, d: 0.6 });
  const d4 = band.blk(69632, 90112, 'f'); show(d4, t15 + 0.3, { y: 0, d: 0.6 }); hide(b.l4, t15 + 0.3, { y: 0, d: 0.6 });
  clipBand(band, t15 + 0.3, 1.2, CV.CLIP1, 'inset(0 9.09% 0 0)', false);
  sh.out(t15 + 0.4, '<span class="n">[0: 65536-69632, 4096]</span> <span class="c"># 根页</span>');
  mid(MX, MY, '根页挪进空位，文件末尾那块用不着了', t15 + 0.6, T('f15b') - 0.1);
  sh.clear(T('f15b') - 0.1);
  sh.cmd(T('f15b'), 'ls -l db/collection-….wt', '$ '); sh.out(T('f15b', '120 KB') - 0.3, '<span class="n">122880</span>　<span class="c"># 120 KB</span>');
  sh.out(T('f15b', '24 KB') + 0.2, "<span class=\"c\">compact → { bytesFreed: 0 }</span>");
  mid(1500, 600, '还有 24 KB 空着', T('f15b', '24 KB') - 0.3, T('f16') - 0.1);
  to(V.sizeL, T('f15b'), { color: '#00684A', duration: 0.4 });
  mid(MX, MY, '到这里：每次只有一个人在读写', T('f16') + 0.2, null, 'dk');
  mid(MX, 700, '同时很多人呢？', T('f16', '读写') - 0.2, null, 'red');

  const a = drift(s.start, s.end, 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
