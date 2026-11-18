// 第 04 章 落盘：上层是缓存里的页，下层是集合文件（真实偏移，4 KB 一格）。检查点时页落进文件，文件从 4 KB 到 96 KB；
// 页写进文件前要整理、压缩（第一个叶页 118,705 字节 → 24 KB）；树立在文件上方、叶页连到它的块，每页的项数与键的范围取自 dump_pages。
// 事实：A07 A08 A09 A10 A11 B01 B03 B04 B06 B07 H01 C05；页的项数与键：out_03「各页的键」。
scene('flush', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const TOTAL = 98304, BX = 140, BY = 760, BW = 1640;
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');

  // 文件带（下层）：先只有 4 KB 的文件头
  const fileL = label(world, BX, BY - 46, 'collection-ccaa694c-….wt', 'lab');
  const sizeL = h('div', 'abs', world, '4 KB'); px(sizeL, BX + BW - 220, BY - 56); css(sizeL, { width: '220px', textAlign: 'right', font: '800 40px "Inter"', color: '#061621' });
  const band = fileBand(world, BX, BY, BW, TOTAL);
  band.blk(0, 4096, 'h');
  css(band.wrap, { clipPath: 'inset(0 95.8% 0 0)' });
  show([fileL, sizeL, band.wrap], c0, { y: 10 });
  const ls = term(world, 140, 150, 980, 200, 'shell · 数据目录', { fs: 26 });
  ls.cmd(T('c1') + 0.1, 'ls -l db/collection-ccaa694c-….wt', '$ ');
  ls.out(T('c1', '看一眼') - 0.2, '<span class="n">4096</span>  collection-ccaa694c-….wt　　<span class="c"># 4 KB</span>');
  show(ls.c, T('c1') - 0.1, { y: 16 }); fadeOut(ls.c, T('c3') - 0.2);
  const tooSmall = xl(world, 1180, 210, '4096 份文档，装不进 4 KB', 'red'); show(tooSmall, T('c2') + 0.4, { y: 0, s: 1.2 }); fadeOut(tooSmall, T('c3') - 0.2);

  // 缓存（上层）：根页与四个叶页，「脏」页先放在内存里
  const cache = h('div', 'abs', world); px(cache, 140, 110, 1640, 380); css(cache, { border: '2px dashed #00684A', borderRadius: '14px', background: '#E3FCF7' });
  const cl = h('div', 'abs', cache, 'WiredTiger 的缓存 · 内存'); css(cl, { left: '24px', top: '16px', font: '600 30px "Sans SC"', color: '#023430' });
  show(cache, T('c3'), { y: 14 });
  const cacheC = chip(world, 1290, 120, 'WiredTiger 的缓存', 'dk xl'); show(cacheC, T('c3', '缓存') - 0.3, { y: 8 }); fadeOut(cacheC, T('c4') + 0.5);
  const memDocs = [0, 1, 2].map((i) => { const g = h('div', 'abs', world); px(g, 1250 + i * 170, 200, 140, 110); css(g, { background: '#023430', borderRadius: '10px' }); for (let k = 0; k < 3; k++) { const b = h('div', 'abs', g); px(b, 18, 22 + k * 28, [100, 70, 86][k], 10); css(b, { background: k === 0 ? '#71F6BA' : '#5C6C75', borderRadius: '5px' }); } return g; });
  show(memDocs, T('c3', '内存里'), { y: -40, stagger: 0.15 }); fadeOut(memDocs, T('c4') - 0.1);
  const LEAF = [['1–1224', 4096, 28672, '1224 项 · 键 1…1224'], ['1225–2448', 28672, 53248, '1224 项 · 键 1225…2448'], ['2449–3123', 53248, 65536, '675 项 · 键 2449…3123'], ['3124–4096', 65536, 86016, '973 项 · 键 3124…4096']];
  const leaves = LEAF.map(([k], i) => pg(world, 260 + i * 390, 330, 340, 110, k, 'hot'));
  const root_ = pg(world, 840, 180, 240, 80, '根页', 'root');
  show(leaves, T('c4'), { y: 16, stagger: 0.1 }); show(root_, T('c4') + 0.4, { y: 16 });
  const pageN = chip(world, 260, 470, '一页：一批排好序的键值', 'dk xl'); show(pageN, T('c4', '排好序') - 0.3, { y: 10 }); fadeOut(pageN, T('c5') - 0.1);
  const dirty = leaves.map((l, i) => { const d = xl(world, 260 + i * 390 + 100, 270, '改过', 'dk'); css(d, { fontSize: '26px', padding: '6px 16px' }); return d; });
  dirty.forEach((d, i) => show(d, T('c5', '缓存里的页') + i * 0.15, { y: 10 }));
  const later = xl(world, 260, 470, '文件：过一会儿才更新', 'on'); show(later, T('c5', '过一会儿') - 0.2, { y: 8 }); fadeOut(later, T('c7') - 0.1);

  // 检查点：页落进文件，文件长到 96 KB（H01 A08）
  const tc = T('c7') + 0.6;
  const ck = chip(world, 1300, 40, '检查点 · 默认每 60 秒', 'dk');
  show(ck, T('c7'), { y: 10 });
  const tbar = h('div', 'abs', world); px(tbar, 1300, 100, 480, 14); css(tbar, { background: '#00ED64', borderRadius: '7px', transformOrigin: '0 50%' });
  fromTo(tbar, T('c7', '60'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'none' }); fadeOut(tbar, T('c9'));
  fadeOut(dirty, tc + 0.4);
  const ckN = gloss(note(world, 260, 520, '<b>检查点</b>：把缓存里改过的页，一次写进文件', 'g'), '检查点'); css(ckN, { fontSize: '30px' });
  show(ckN, T('c8', '检查点') - 0.3, { y: 10 }); fadeOut(ckN, T('c9b') - 0.1);
  const grown = xl(world, 1000, 620, 'ls -l：98304 字节，96 KB'); css(grown, { fontFamily: '"Mono"', fontSize: '30px' });
  show(grown, T('c9', '96 KB') - 0.4, { y: 10 }); fadeOut(grown, T('c9b') - 0.1);
  // 页写进文件前，整理、压缩（第一个叶页：118,705 字节 → 24 KB）
  const fmt = xl(world, 300, 620, '第一个叶页整理好：118,705 字节'), zip = xl(world, 1060, 620, '压缩后在文件里：24 KB', 'on');
  const za = link(ov, [[980, 655], [1050, 655]], 'accent', { arrow: true, w: 3 });
  show(fmt, T('c9b', '整理') - 0.3, { y: 10 }); arrowIn(za, T('c9b', '压缩') - 0.2, 0.5); show(zip, T('c9b', '压缩'), { x: -20, y: 0 });
  fadeOut([fmt, zip, za], T('c10') - 0.1);
  const treeN = chip(world, 1000, 620, '打开文件：一棵集合树', 'dk xl'); show(treeN, T('c10', '样子') - 0.2, { y: 10 }); fadeOut(treeN, T('c11') - 0.1);
  to(band.wrap, tc, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut' });
  const blocks = LEAF.map(([k, a, b]) => band.blk(a, b, 'l', k));
  const rootB = band.blk(86016, 90112, 'r');
  glow(blocks[0], T('c9b', '压缩') + 0.2, T('c10'), { bg: '#00ED64', bd: '#00ED64' });
  blocks.forEach((e, i) => show(e, tc + 0.3 + i * 0.25, { y: -260, d: 0.7, ease: 'power2.in' }));
  show(rootB, tc + 1.4, { y: -500, d: 0.7, ease: 'power2.in' });
  sfx('thud', tc + 1.0, { g: 0.5 });
  countTo(sizeL, 4, 96, T('c9'), 1.2, (v) => Math.round(v) + ' KB');
  to(cache, T('c9'), { borderColor: '#C1C7C6', background: '#FDFFF5', duration: 0.6 });
  to(cl, T('c9'), { autoAlpha: 0, duration: 0.4 });
  leaves.forEach((l) => to(l, T('c9'), { backgroundColor: '#fff', borderColor: '#C1C7C6', color: '#3D4F58', duration: 0.6 }));

  // 树的形状：叶页连到文件里的块，根页连到叶页（B03 B01）
  const tree = [];
  LEAF.forEach(([k, a, b], i) => {
    const lx = 260 + i * 390 + 170, bx = band.xOf((a + b) / 2);
    tree.push(link(ov, [[lx, 440], [bx, BY]], 'dim', { dashed: '6 6' }));
    tree.push(link(ov, [[960, 260], [lx, 330]], 'ink', { w: 2.4 }));
  });
  tree.push(link(ov, [[960, 260], [band.xOf(88064), BY]], 'dim', { dashed: '6 6' }));
  tree.forEach((p, i) => (p.getAttribute('stroke-dasharray') ? draw(p, T('c10') + 0.2 + i * 0.08, 0.6, { dash: '6 6' }) : draw(p, T('c13') + i * 0.05, 0.6)));
  glow(blocks, T('c10') + 0.2, T('c11') - 0.1, { bg: '#00ED64', bd: '#00ED64' });
  glow(leaves, T('c11', '叶页'), T('c12') - 0.2, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  leaves.forEach((l, i) => glow(l, T('c12', '连续') - 0.6 + i * 0.5, T('c12', '连续') + i * 0.5 + 0.6, { bg: '#00ED64', bd: '#00ED64', c: '#023430' }));
  // 每页的真实项数与键（dump_pages）
  const cnt = LEAF.map(([, , , t], i) => { const e = h('div', 'abs mono', world, t); px(e, 260 + i * 390, 446); css(e, { width: '340px', textAlign: 'center', font: '600 22px "Mono"', color: '#00684A' }); return e; });
  cnt.forEach((e, i) => show(e, T('c12', '连续') - 0.6 + i * 0.5, { y: 6 }));
  const leafN = chip(world, 260, 500, '叶页：键和值都在这里', 'dk xl'); show(leafN, T('c11', '键和值') - 0.3, { y: 8 }); fadeOut(leafN, T('c14b') - 0.2);
  const bounds = chip(world, 1110, 186, '根页：4 项，分界 1225 · 2449 · 3124', 'dk xl'); css(bounds, { fontFamily: '"Mono"', fontSize: '26px' });
  show(bounds, T('c13'), { x: -10, y: 0 });
  const bt = gloss(note(world, 140, 580, '<b>B 树</b>：根页记着每个叶页从哪个键开始、在文件哪里；找键时从根往下走', 'g'), 'B 树');
  show(bt, T('c14b'), { y: 10 });
  // 走一遍：从根落到第二个叶页
  const walk = link(ov, [[960, 260], [260 + 390 + 170, 330]], 'spring', { w: 6 });
  draw(walk, T('c14'), 0.7); hide(walk, T('c15'));
  const rootN = chip(world, 1240, 640, '根页：文件里的这一块', 'dk xl'); show(rootN, T('c13', '文件哪里') - 0.2, { y: 10 }); fadeOut(rootN, T('c14b') - 0.1);
  glow(rootB, T('c13', '文件哪里') - 0.2, T('c14'), { bg: '#00ED64', bd: '#00ED64', rb: '#023430', rd: '#023430' });
  glow(leaves[1], T('c14', '往下走') - 0.3, T('c15'), { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const idx = note(world, 140, 850, '_id 索引：根页 + 3 个叶页　·　姓名索引：根页 + 15 个叶页', '');
  css(idx, { fontSize: '26px' }); show(idx, T('c15'), { y: 8 }); hide(bt, T('c15'));
  const xl2 = chip(world, 1300, 40, 'find({ name: "Alice" })', 'on xl'); css(xl2, { fontFamily: '"Mono"', fontSize: '28px' });
  fadeOut(ck, T('c22') - 0.2); show(xl2, T('c22', '一个名字') - 0.2, { y: 10 });

  const a = drift(s.start, s.end, 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [[s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }]]);
});
