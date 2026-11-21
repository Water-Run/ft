// 第 04 章 落盘：上层是缓存里的页，下层是集合文件（真实偏移，4 KB 一格）。写完 4096 份时文件只有 4 KB、集合在缓存里 835,550 字节；
// 检查点时页落进文件，文件从 4 KB 到 96 KB；页写进文件前要整理、压缩（第一个叶页的磁盘映像 118,705 字节 → 24 KB）；
// 树立在文件上方、叶页连到它的块，每页的项数与键的范围取自 dump_pages。
// 事实：A07 A08 A09 A10 B01 B03 B04 B06 B07 H01 C05；页的项数与键：out_03「各页的键」。
scene('flush', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '04 落盘');
  ch.sec(c0, '缓存');
  const TOTAL = 98304, BX = 140, BY = 790, BW = 1640;

  // 文件带（下层）：先只有 4 KB 的文件头
  const fileL = label(world, BX, BY - 46, 'collection-ccaa694c-….wt', 'lab');
  const sizeL = h('div', 'abs', world, '4 KB'); px(sizeL, BX + BW - 220, BY - 58); css(sizeL, { width: '220px', textAlign: 'right', font: '700 40px "Inter"', color: '#001E2B' });
  const band = fileBand(world, BX, BY, BW, TOTAL);
  const hdr = band.blk(0, 4096, 'h');
  css(band.wrap, { clipPath: 'inset(0 95.8% 0 0)' });
  show([fileL, sizeL, band.wrap], c0, { y: 10 });
  const ls = term(world, 140, 140, 1000, 190, 'shell · 数据目录', { fs: 26 });
  ls.cmd(T('c1') + 0.1, 'ls -l db/collection-ccaa694c-….wt', '$ ');
  ls.out(T('c1', '看一眼') - 0.2, '<span class="n">4096</span>  collection-ccaa694c-….wt　　<span class="c"># 4 KB</span>');
  show(ls.c, T('c1') - 0.1, { y: 16 });
  const big4 = h('div', 'abs', world, '4 KB'); px(big4, 1200, 300); css(big4, { font: '700 110px "Inter"', color: '#001E2B' });
  const big4L = label(world, 1206, 440, '集合文件的大小', 't-note');
  show([big4, big4L], T('c1', '看一眼') + 0.1, { y: 14 }); hide([big4, big4L], T('c3') - 0.3, { y: -10, d: 0.4 });
  glow(hdr, T('c2', '4 KB') - 0.2, T('c3'), { bg: '#DB3030', bd: '#DB3030', rb: '#C1C7C6', rd: '#C1C7C6' });
  const tooSmall = callout(world, 1200, 150, 'warn', '4 KB 装不下 4096 份文档', '对不上');
  show(tooSmall, T('c2') - 0.1, { x: 20, y: 0 });
  hide([ls.c, tooSmall], T('c3') - 0.3, { y: -10, d: 0.4 });

  // 缓存（上层）：根页与四个叶页
  const cache = h('div', 'abs', world); px(cache, 140, 130, 1640, 340); css(cache, { border: '2px dashed #00A35C', borderRadius: '16px', background: '#E3FCF7' });
  const cl = h('div', 'abs', cache, 'WiredTiger 的缓存 · 内存'); css(cl, { left: '26px', top: '18px', font: '700 28px "Inter", "Sans SC"', color: '#00684A' });
  show(cache, T('c3') - 0.1, { y: 14 });
  // A07：写完、检查点之前，集合在缓存里 835,550 字节，文件 4,096 字节
  const cmp = h('div', 'abs', world); px(cmp, 140, 494, 1000); cmp.innerHTML = '<table class="dtab" style="position:static;font-size:27px"><tr><th></th><th>字节数</th></tr><tr><td class="q">集合在缓存里</td><td style="font-family:Mono">835,550</td></tr><tr><td class="q">集合文件</td><td style="font-family:Mono">4,096</td></tr></table>';
  show(cmp, T('c3', '缓存中') - 0.2, { y: 10 });
  const cmpF = figs(world, 140, 690, 1000, [[T('c3', '缓存中'), '表 4-1', '写完 4096 份、检查点之前', '实测：out_02 · ls -l']], T('c7') - 0.2);
  hide(cmp, T('c7') - 0.2, { y: 0, d: 0.4 });
  const LEAF = [['1–1224', 4096, 28672, '1224 项 · 键 1…1224'], ['1225–2448', 28672, 53248, '1224 项 · 键 1225…2448'], ['2449–3123', 53248, 65536, '675 项 · 键 2449…3123'], ['3124–4096', 65536, 86016, '973 项 · 键 3124…4096']];
  const leaves = LEAF.map(([k], i) => pg(world, 260 + i * 390, 330, 340, 100, k, 'hot'));
  const root_ = pg(world, 790, 196, 340, 74, '根页', 'root');
  show(leaves, T('c4') - 0.1, { y: 16, stagger: 0.1 }); show(root_, T('c4') + 0.3, { y: 16 });
  const tL = leaves.map((l, i) => link(ov, [[960, 270], [260 + i * 390 + 170, 330]], 'ink', { w: 2.4 }));
  tL.forEach((p, i) => draw(p, T('c4') + 0.5 + i * 0.06, 0.5));
  const pgL = label(world, 1180, 210, '一页 = 一批排好序的键值', 't-note'); css(pgL, { color: '#00684A' });
  show(pgL, T('c4', '排好序') - 0.3, { x: -10, y: 0 }); fadeOut(pgL, T('c7') - 0.2);
  const dirty = leaves.map((l, i) => { const d = chip(world, 260 + i * 390 + 230, 314, '改过', 'yel'); css(d, { fontSize: '22px', padding: '3px 12px' }); return d; });
  dirty.forEach((d, i) => show(d, T('c5', '缓存里的页') + i * 0.15, { y: 10 }));

  // 检查点：页落进文件，文件长到 96 KB（H01 A08）
  ch.sec(T('c7') - 0.2, '检查点');
  const tc = T('c7') + 0.8;
  const timer = h('div', 'abs', world); px(timer, 1180, 196, 560, 74); css(timer, { background: '#fff', border: '1.5px solid #C1C7C6', borderRadius: '10px' });
  const tml = h('div', 'abs mono', timer, 'syncdelay: 60'); css(tml, { left: '20px', top: '18px', font: '600 26px "Mono"', color: '#001E2B' });
  const tmn = h('div', 'abs mono', timer, '0 s'); css(tmn, { right: '20px', top: '18px', font: '600 26px "Mono"', color: '#00684A' });
  const tbar = h('div', 'abs', timer); px(tbar, 230, 30, 200, 14); css(tbar, { background: '#00ED64', borderRadius: '7px', transformOrigin: '0 50%' });
  show(timer, T('c7') - 0.1, { x: 20, y: 0 });
  fromTo(tbar, T('c7', '60'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'none' });
  stepTo(tmn, [[T('c7', '60'), 1.4, 0, 60]], (v) => Math.round(v) + ' s');
  fadeOut(dirty, tc + 0.4);
  const ckN = gloss(callout(world, 140, 500, 'tip', '把缓存里改过的页，一次写进文件；默认每 60 秒一次', '检查点'), '检查点');
  show(ckN, T('c8', '检查点') - 0.3, { y: 10 }); fadeOut(ckN, T('c9b') - 0.1);
  const ls2 = term(world, 1180, 500, 600, 170, 'shell', { fs: 24 });
  show(ls2.c, T('c9') - 0.2, { x: 20, y: 0 });
  ls2.cmd(T('c9'), 'ls -l db/collection-….wt', '$ ');
  ls2.out(T('c9', '96 KB') - 0.4, '<span class="n">98304</span>  <span class="c"># 96 KB</span>');
  // 页写进文件前，整理、压缩（第一个叶页：磁盘映像 118,705 字节 → 24 KB）
  const zipT = h('div', 'abs', world); px(zipT, 140, 500, 1000, 190);
  zipT.innerHTML = '<div style="position:absolute;left:0;top:0;width:300px;height:150px;background:#E3FCF7;border:2px solid #00A35C;border-radius:12px"><div style="position:absolute;left:20px;top:16px;font:700 26px Inter,\'Sans SC\';color:#00684A">缓存里的页</div><div style="position:absolute;left:20px;top:60px;font:500 24px/1.45 Inter,\'Sans SC\';color:#3D4F58">为同时读写组织</div></div>'
    + '<div style="position:absolute;left:340px;top:0;width:300px;height:150px;background:#fff;border:2px solid #C1C7C6;border-radius:12px"><div style="position:absolute;left:20px;top:16px;font:700 26px Inter,\'Sans SC\';color:#001E2B">整理成磁盘格式</div><div style="position:absolute;left:20px;top:64px;font:600 34px Mono;color:#001E2B">118,705</div><div style="position:absolute;left:20px;top:108px;font:500 22px Inter,\'Sans SC\';color:#5C6C75">字节（第一个叶页）</div></div>'
    + '<div style="position:absolute;left:680px;top:0;width:300px;height:150px;background:#00ED64;border:2px solid #00ED64;border-radius:12px"><div style="position:absolute;left:20px;top:16px;font:700 26px Inter,\'Sans SC\';color:#023430">snappy 压缩</div><div style="position:absolute;left:20px;top:64px;font:600 34px Mono;color:#023430">24,576</div><div style="position:absolute;left:20px;top:108px;font:500 22px Inter,\'Sans SC\';color:#023430">字节 = 文件里 24 KB</div></div>';
  const zk = [...zipT.children];
  show(zk[0], T('c9b') - 0.2, { y: 10 }); show(zk[1], T('c9b', '整理') - 0.2, { x: -20, y: 0 }); show(zk[2], T('c9b', '压缩') - 0.1, { x: -20, y: 0 });
  const za1 = link(ov, [[446, 575], [474, 575]], 'accent', { arrow: true, w: 3 }), za2 = link(ov, [[786, 575], [814, 575]], 'accent', { arrow: true, w: 3 });
  arrowIn(za1, T('c9b', '整理') - 0.3, 0.3); arrowIn(za2, T('c9b', '压缩') - 0.2, 0.3);
  const zF = figs(world, 140, 670, 1000, [[T('c9b') + 0.3, '图 4-1', '一页写进文件之前', 'arch-cache.dox · dump_pages']], T('c10') - 0.2);
  hide([...zk, za1, za2, ls2.c], T('c10') + 0.4, { y: 0, d: 0.35 });
  to(band.wrap, tc, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut' });
  const blocks = LEAF.map(([k, a, b]) => band.blk(a, b, 'l', k));
  const rootB = band.blk(86016, 90112, 'r');
  glow(blocks[0], T('c9b', '压缩') + 0.2, T('c10'), { bg: '#00ED64', bd: '#00ED64', rb: '#FFFFFF', rd: '#889397' });
  blocks.forEach((e, i) => show(e, tc + 0.3 + i * 0.25, { y: -280, d: 0.7, ease: 'power2.in' }));
  show(rootB, tc + 1.4, { y: -520, d: 0.7, ease: 'power2.in' });
  sfx('thud', tc + 1.0, { g: 0.5 });
  countTo(sizeL, 4, 96, T('c9'), 1.2, (v) => Math.round(v) + ' KB');
  to(cache, T('c9'), { borderColor: '#E8EDEB', backgroundColor: '#FFFFFF', duration: 0.6 });
  to(cl, T('c9'), { autoAlpha: 0, duration: 0.4 });
  to(timer, T('c9'), { autoAlpha: 0, duration: 0.4 });
  leaves.forEach((l) => to(l, T('c9'), { backgroundColor: '#fff', borderColor: '#C1C7C6', color: '#3D4F58', duration: 0.6 }));

  // 树的形状：叶页连到文件里的块，根页连到它的块（B03 B01）
  ch.sec(T('c10') - 0.2, 'B 树');
  const tree = [];
  LEAF.forEach(([k, a, b], i) => { const lx = 260 + i * 390 + 170, bx = band.xOf((a + b) / 2); tree.push(link(ov, [[lx, 430], [bx, BY]], 'dim', { dashed: '6 6' })); });
  const rootLink = link(ov, [[1100, 270], [1100, 296], [1830, 296], [1830, BY + 37], [band.xOf(90112), BY + 37]], 'dim', { dashed: '6 6' });
  tree.forEach((p, i) => draw(p, T('c10') + 0.7 + i * 0.08, 0.6, { dash: '6 6' }));
  glow(blocks, T('c10') + 0.2, T('c11') - 0.1, { bg: '#E3FCF7', bd: '#00A35C', rb: '#FFFFFF', rd: '#889397' });
  glow(leaves, T('c11', '叶页'), T('c12') - 0.2, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  leaves.forEach((l, i) => glow(l, T('c12', '连续') - 0.6 + i * 0.5, T('c12', '连续') + i * 0.5 + 0.6, { bg: '#00ED64', bd: '#00ED64', c: '#023430' }));
  const cnt = LEAF.map(([, , , t], i) => { const e = h('div', 'abs mono', world, t); px(e, 260 + i * 390, 440); css(e, { width: '340px', textAlign: 'center', font: '600 22px "Mono", "Sans SC"', color: '#00684A' }); return e; });
  cnt.forEach((e, i) => show(e, T('c12', '连续') - 0.6 + i * 0.5, { y: 6 }));
  const leafN = label(world, 140, 470 + 20, '叶页：键和值都在这里', 't-note'); css(leafN, { color: '#00684A' });
  show(leafN, T('c11', '键和值') - 0.3, { y: 6 });
  const bounds = h('div', 'abs mono', world, '分界键：1225 · 2449 · 3124'); px(bounds, 1180, 214); css(bounds, { font: '600 26px "Mono", "Sans SC"', color: '#001E2B', background: '#fff', border: '1.5px solid #C1C7C6', borderRadius: '8px', padding: '4px 14px' });
  show(bounds, T('c13'), { x: -10, y: 0 });
  swapAt(root_, '根页', '1 · 1225 · 2449 · 3124', T('c13') + 0.3); css(root_, { fontSize: '23px' });
  draw(rootLink, T('c13', '文件哪里') - 0.3, 0.8, { dash: '6 6' });
  glow(rootB, T('c13', '文件哪里') - 0.2, T('c14'), { bg: '#00ED64', bd: '#00ED64', rb: '#001E2B', rd: '#001E2B' });
  // 走一遍：从根落到第二个叶页
  const walk = link(ov, [[960, 270], [260 + 390 + 170, 330]], 'spring', { w: 6 });
  draw(walk, T('c14'), 0.7); hide(walk, T('c15'));
  glow(leaves[1], T('c14', '往下走') - 0.3, T('c15'), { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const bt = gloss(callout(world, 140, 540, 'tip', '根页记着分界和位置，从根往下找', 'B 树'), 'B 树');
  show(bt, T('c14b') - 0.8, { y: 10 });
  figs(world, 140, BY + 92, 1640, [[T('c10') + 0.3, '图 4-2', '检查点之后的集合树：1 个根页、4 个叶页，各在文件里的一块', '实测：wt verify -d dump_address · dump_pages']], null);
  hide(bt, T('c15') - 0.1, { y: 0, d: 0.35 });
  const idx = callout(world, 140, 540, 'note', '<code>_id</code> 索引：根页 + 3 个叶页　·　姓名索引：根页 + 15 个叶页', '两个索引文件');
  show(idx, T('c15'), { y: 10 });
  const fq = code(world, 1180, 560, 'find({ name: "Alice" })'); css(fq, { fontSize: '30px', background: '#E3FCF7', borderColor: '#00A35C' });
  show(fq, T('c22', '一个名字') - 0.2, { x: 20, y: 0 });

  const a = drift(s.start, s.end, 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
