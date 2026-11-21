// 第 07 章 删：同样从 96 KB 的集合文件开始。Alice 注销：三棵树都要动（profiler：ndeleted 1、keysDeleted 2）；内存里挂删除标记；
// 检查点后第二个叶页又写到末尾，文件 132 KB。Dave 注册拿到 4097（$recordId），落进最后一个叶页；检查点时他那页写进第二个叶页空出来的块，
// 根页挪进旧叶页的位置，文件缩回 120 KB（compact 也释放不出字节）。版面同第 06 章：上面树与文件，下面工作区；回显抄自 research/lab/out_06_delete.txt。
// 事实：F01 F02 F03 F04 F05 F06 F07 D05 A05 B03。
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '07 删');
  ch.sec(c0, '删除标记');
  const V = collView(world, c0, ov), b = V.b, band = V.band;
  const WY = 640;
  figs(world, 140, CV.BY + 90, 1640, [[c0 + 0.6, '图 7-1', '集合树与集合文件，删除与 Dave 写入前后', '实测：wt verify -d dump_address · ls -l']], null);
  const fresh = callout(world, 140, WY, 'note', '新装的 4096 人 · 96 KB', '起点');
  show(fresh, T('f1') + 0.1, { y: 10 }); fadeOut(fresh, T('f1a') + 0.2);
  glow(V.leaf[1], T('f1'), null, { bg: '#E3FCF7', bd: '#00A35C', c: '#00684A' }); glow(b.l2, T('f1'), null, { bg: '#00ED64', rb: '#FFFFFF' });

  // Alice 注销：三棵树各动一处；右边是这次删除的操作记录
  const sh = term(world, 1180, WY - 20, 600, 320, 'mongosh', { fs: 22 });
  const t1 = T('f1a');
  show(sh.c, t1 - 0.1, { x: 20, y: 0 });
  sh.cmd(t1, 'db.users.deleteOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })');
  sh.out(T('f2', '删掉') - 0.2, '<span class="c">// profiler：</span><span class="k">ndeleted</span>: <span class="n">1</span>,');
  sh.out(T('f2b') + 0.2, '<span class="k">keysDeleted</span>: <span class="n">2</span>');
  sh.out(T('f2b') + 1.0, 'db.users.countDocuments()  <span class="c">// 4095</span>');
  const title = h('div', 'abs', world, 'Alice 注销账号'); px(title, 140, WY - 20); css(title, { font: '700 34px "Inter", "Sans SC"', color: '#001E2B' });
  show(title, t1 + 0.1, { y: 8 });
  const A1 = tile(world, 140, WY + 40, 310, 140, '集合树', '删掉 2050 这份', 'sp');
  const A2 = tile(world, 470, WY + 40, 310, 140, '姓名索引', '删掉 1 项', 'dk');
  const A3 = tile(world, 800, WY + 40, 330, 140, '_id 索引', '删掉 1 项', 'dk');
  show(A1, T('f2', '集合树'), { y: 10 }); sfx('pop', T('f2', '集合树')); show([A2, A3], T('f2b') - 0.1, { y: 10, stagger: 0.35 });
  fadeOut([title, A1, A2, A3], T('f3') - 0.15);

  // 删除标记：挂在更新链上，不带内容（F02）
  const C1 = tile(world, 140, WY + 40, 300, 140, '页上的 2050', 'Alice · age 42', 'dk');
  const C2 = tile(world, 520, WY + 40, 520, 140, '新版本：删除', '不带内容，只说这一项删了', 'rd');
  show(C1, T('f3') - 0.05, { y: 10 });
  const memL = label(world, 140, WY - 20, '在内存里：删除也是挂一个版本', 'h2'); css(memL, { fontSize: '32px' });
  show(memL, T('f3', '更新链') - 0.3, { y: 8 }); fadeOut(memL, T('f5') - 0.1);
  show(C2, T('f4', '不带内容') - 0.3, { x: -30, y: 0 }); sfx('pop', T('f4', '不带内容') - 0.3);
  const l12 = link(ov, [[446, WY + 110], [514, WY + 110]], 'accent', { arrow: true, w: 3 }); arrowIn(l12, T('f4', '不带内容'), 0.4);
  const tomb = gloss(label(world, 140, WY - 20, '删除标记（tombstone）：不带内容的版本', 'h2'), '删除标记'); css(tomb, { fontSize: '32px', color: '#970606' });
  show(tomb, T('f5') + 0.15, { y: 8 });
  fadeOut([C1, C2, l12], T('f6') + 0.3); fadeOut(tomb, T('f6') + 0.8);

  // 检查点：第二个叶页写到文件末尾，文件 132 KB（F03 F06）
  ch.sec(T('f6') - 0.2, '检查点之后');
  const t6 = T('f6');
  const ck = chip(world, 450, CV.BY - 58, '检查点', 'dk'); show(ck, t6, { y: 8 }); fadeOut(ck, T('f9') - 0.2);
  sh.clear(t6 - 0.1);
  sh.cmd(t6 + 0.1, 'wt verify -d dump_address …', '$ ');
  sh.out(T('f6', '文件末尾') - 0.2, '<span class="n">[0: 98304-122880, 24576]</span> <span class="c"># 第二个叶页</span>');
  const nb = band.blk(98304, 122880, 'a', '1225–2448'); show(nb, t6 + 0.7, { y: -220, d: 0.7, ease: 'power2.in' });
  const nr = band.blk(122880, 126976, 'r'); show(nr, t6 + 1.0, { y: -300, d: 0.7, ease: 'power2.in' });
  clipBand(band, t6 + 0.4, 1.0, CV.CLIP0, CV.CLIP1, false);
  stepTo(V.sizeL, [[t6 + 0.4, 1.0, 96, 132], [T('f15') + 0.3, 1.2, 132, 120]], (v) => Math.round(v) + ' KB');
  sfx('thud', t6 + 1.2, { g: 0.5 });
  const lkA = [conn(ov, band, 0, 4096, 28672, t6 + 1.6), conn(ov, band, 1, 98304, 122880, t6 + 1.7, 'spring'), conn(ov, band, 2, 53248, 65536, t6 + 1.8), conn(ov, band, 3, 65536, 86016, t6 + 1.9)];
  // f7：页里 2049 后面紧接着 2051（键 c7c1、c7c3，没有 c7c2）
  const keys = h('div', 'abs', world); px(keys, 140, WY + 40, 990, 120); css(keys, { background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '12px' });
  keys.innerHTML = '<div style="position:absolute;left:24px;top:14px;font:600 24px Inter,\'Sans SC\';color:#5C6C75">检查点之后，第二个叶页里的键</div>'
    + '<div style="position:absolute;left:24px;top:56px;font:500 32px Mono;color:#001E2B">… 2048　2049　<span style="color:#DB3030;text-decoration:line-through">2050</span>　2051　2052 …</div>';
  show(keys, T('f7') - 0.2, { y: 10 });
  sh.out(T('f7', '2051') - 0.2, '<span class="c">键 … c7c1 · c7c3 …（没有 c7c2）</span>');
  // f8：少了一份文档，文件却没有变小
  sh.clear(T('f8') - 0.1);
  sh.cmd(T('f8'), 'ls -l db/collection-….wt', '$ '); sh.out(T('f8', '132 KB') - 0.4, '<span class="n">135168</span>  <span class="c"># 132 KB</span>');
  const notSmall = callout(world, 140, WY, 'warn', '4095 份文档，文件却从 96 KB 长到 132 KB', '没有变小');
  fadeOut(keys, T('f8') - 0.1); show(notSmall, T('f8') + 0.1, { y: 10 }); fadeOut(notSmall, T('f9') - 0.1);
  // f9：旧页的地方空出来
  const t9 = T('f9');
  const d2 = band.blk(28672, 53248, 'f'), dr = band.blk(86016, 90112, 'f');
  show([d2, dr], t9, { y: 0, d: 0.6 }); hide([b.l2, b.r], t9, { y: 0, d: 0.6 });
  const freeTag = label(world, band.xOf(28672) + 16, CV.BY + 22, '空着', 't-small');
  show(freeTag, T('f9', '空了') - 0.3, { y: 6 });

  // Dave 注册：拿到 4097，空出来的 2050 不再发出去（F04）
  ch.sec(T('f10') - 0.2, 'Dave');
  fadeOut(lkA, T('f10') - 0.2);
  const D1 = tile(world, 140, WY + 40, 300, 140, 'Dave 注册', '又一份新文档', 'dk');
  const D2 = tile(world, 470, WY + 40, 330, 140, 'RecordId：4097', '接着往上加', 'sp');
  const D3 = tile(world, 830, WY + 40, 300, 140, '2050', '不会再发给别人', 'dash');
  show(D1, T('f10') - 0.05, { y: 10 }); show(D2, T('f11', '4097') - 0.4, { y: 10 }); sfx('pop', T('f11', '4097') - 0.4); show(D3, T('f11', '空出来的') - 0.2, { y: 10 });
  sh.clear(T('f10') - 0.1);
  sh.cmd(T('f10') + 0.1, 'db.users.find({ <span class="k">name</span>: <span class="s">"Dave"</span> })\n  .showRecordId()');
  sh.out(T('f11', '4097') - 0.3, "<span class=\"k\">'$recordId'</span>: Long(<span class=\"s\">'4097'</span>)");
  // f13：4097 比最后一个分界 3124 大，落进最后一个叶页
  glow(V.root, T('f13') - 0.1, T('f14'), { bg: '#00684A', bd: '#00ED64', rb: '#001E2B', rd: '#001E2B' });
  const cmpR = chip(world, 1180, CV.RY + 14, '4097 ≥ 3124 → 第四个叶页', 'on'); css(cmpR, { fontFamily: '"Mono", "Sans SC"' });
  show(cmpR, T('f13', '3124') - 0.3, { x: -10, y: 0 }); fadeOut(cmpR, T('f14') - 0.1);
  keyed(V.leaf[3]).at(T('f13', '落进') - 0.2, { html: '3124–4097' });
  glow(V.leaf[3], T('f13', '落进') - 0.2, null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' }); sfx('pop', T('f13', '落进'));
  const dv = chip(world, 260 + 3 * 390 + 120, CV.LY + CV.LH + 10, 'Dave', 'on'); show(dv, T('f13', '落进'), { y: 6 });
  fadeOut([D1, D2, D3], T('f14') - 0.15);

  // f14：检查点：Dave 那页写进旧页空出的块（F05）
  const t14 = T('f14');
  const ck2 = chip(world, 450, CV.BY - 58, '检查点', 'dk'); show(ck2, t14 - 0.1, { y: 8 });
  const t14b = T('f14', '用上了') - 0.2;
  const dB = band.blk(28672, 49152, 'd', 'Dave 这页'), d2b = band.blk(49152, 53248, 'f');
  show([dB, d2b], t14b, { y: -220, d: 0.7, ease: 'power2.in' }); hide([d2, freeTag], t14b, { y: 0, d: 0.5 });
  sfx('thud', t14b + 0.6, { g: 0.5 });
  conn(ov, band, 0, 4096, 28672, t14b + 0.9); conn(ov, band, 1, 98304, 122880, t14b + 1.0); conn(ov, band, 2, 53248, 65536, t14b + 1.1); conn(ov, band, 3, 28672, 49152, t14b + 1.2, 'spring');
  sh.clear(t14b - 0.1);
  sh.cmd(t14b, 'wt verify -d dump_address …', '$ ');
  sh.out(t14b + 1.0, '<span class="n">[0: 28672-49152, 20480]</span> <span class="c"># Dave 那一页</span>');
  const reuse = callout(world, 140, WY, 'tip', 'Dave 那一页写进了 28672 起的块：正是 Alice 那一页原来的位置', '空位用上了');
  show(reuse, T('f14', '用上了') + 0.2, { y: 10 }); fadeOut(reuse, T('f15b') - 0.1);
  // f15：根页也挪进空位，文件末尾那一块用不着了，文件缩回 120 KB（F07）
  const t15 = T('f15');
  const nr2 = band.blk(65536, 69632, 'r'); show(nr2, t15, { y: -260, d: 0.7, ease: 'power2.in' }); sfx('pop', t15 + 0.7);
  hide([nr, dr], t15 + 0.3, { y: 0, d: 0.6 });
  const d4 = band.blk(69632, 90112, 'f'); show(d4, t15 + 0.3, { y: 0, d: 0.6 }); hide(b.l4, t15 + 0.3, { y: 0, d: 0.6 });
  clipBand(band, t15 + 0.3, 1.2, CV.CLIP1, 'inset(0 9.09% 0 0)', false);
  sh.out(t15 + 0.4, '<span class="n">[0: 65536-69632, 4096]</span> <span class="c"># 根页</span>');
  sh.clear(T('f15b') - 0.1);
  sh.cmd(T('f15b'), 'ls -l db/collection-….wt', '$ '); sh.out(T('f15b', '120 KB') - 0.3, '<span class="n">122880</span>  <span class="c"># 120 KB</span>');
  sh.out(T('f15b', '24 KB') + 0.2, 'db.runCommand({ <span class="k">compact</span>: <span class="s">"users"</span> })\n<span class="c">// { bytesFreed: 0 }</span>');
  const spare = callout(world, 140, WY, 'note', '还空着 24 KB；<code>compact</code> 没还回一个字节', '文件缩回 120 KB');
  show(spare, T('f15b') + 0.3, { y: 10 });
  to(V.sizeL, T('f15b'), { color: '#00684A', duration: 0.4 });
  // f16：到这里，每一次都只有一个人在读写
  hide(spare, T('f16') - 0.1, { y: 0, d: 0.3 });
  nextPage(world, 600, WY + 60, '08', '事务与并发', T('f16') + 0.2);

  const a = drift(s.start, s.end, 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
