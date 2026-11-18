// 第 04 章 落盘：上层是缓存里的页，下层是集合文件（真实偏移，4 KB 一格）。检查点时页落进文件，文件从 4 KB 到 96 KB；
// 树立在文件上方、叶页连到它的块；最后看一页从内存格式整理、压缩成 24 KB。
// 事实：A07 A08 A09 A10 A11 B01 B03 B04 B06 B07 H01 C05。
scene('flush', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const TOTAL = 98304, BX = 140, BY = 760, BW = 1640;

  // 文件带（下层）：先只有 4 KB 的文件头
  const fileL = label(world, BX, BY - 46, 'collection-….wt', 'lab');
  const sizeL = h('div', 'abs', world, '4 KB'); px(sizeL, BX + BW - 220, BY - 56); css(sizeL, { width: '220px', textAlign: 'right', font: '800 40px "Inter"', color: '#061621' });
  const band = fileBand(world, BX, BY, BW, TOTAL);
  const head = band.blk(0, 4096, 'h');
  css(band.wrap, { clipPath: 'inset(0 95.8% 0 0)' });
  show([fileL, sizeL, band.wrap], c0, { y: 10 });
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');
  const ls = codeCard(world, 140, 150, 980, '数据目录 db/', 200); ls.line('<span class="c">$</span> ls -l db/collection-….wt'); ls.line('collection-….wt　　<span class="n">4 KB</span>');
  show(ls.c, T('c1'), { y: 16 }); fadeOut(ls.c, T('c3') - 0.2);
  const lsHi = h('div', 'abs', world); px(lsHi, 150, 256, 960, 48); css(lsHi, { background: '#00ED6455', borderRadius: '6px' }); show(lsHi, T('c1', '数据目录'), { y: 0 }); fadeOut(lsHi, T('c3') - 0.2);
  const tooSmall = xl(world, 1180, 210, '4096 份文档，装不进 4 KB', 'red'); show(tooSmall, T('c2') + 0.4, { y: 0, s: 1.2 }); fadeOut(tooSmall, T('c3') - 0.2);

  // 缓存（上层）：根页与四个叶页，「脏」页先放在内存里
  const cache = h('div', 'abs', world); px(cache, 140, 110, 1640, 380); css(cache, { border: '2px dashed #00684A', borderRadius: '14px', background: '#E3FCF7' });
  const cl = h('div', 'abs', cache, 'WiredTiger 的缓存 · 内存'); css(cl, { left: '24px', top: '16px', font: '600 30px "Sans SC"', color: '#023430' });
  show(cache, T('c3'), { y: 14 });
  const memDocs = [0, 1, 2].map((i) => { const g = h('div', 'abs', world); px(g, 1250 + i * 170, 200, 140, 110); css(g, { background: '#023430', borderRadius: '10px' }); for (let k = 0; k < 3; k++) { const b = h('div', 'abs', g); px(b, 18, 22 + k * 28, [100, 70, 86][k], 10); css(b, { background: k === 0 ? '#71F6BA' : '#5C6C75', borderRadius: '5px' }); } return g; });
  show(memDocs, T('c3', '内存里'), { y: -40, stagger: 0.15 }); fadeOut(memDocs, T('c4') - 0.1);
  const LEAF = [['1–1224', 4096, 28672], ['1225–2448', 28672, 53248], ['2449–3123', 53248, 65536], ['3124–4096', 65536, 86016]];
  const leaves = LEAF.map(([k], i) => pg(world, 260 + i * 390, 330, 340, 110, k, 'hot'));
  const root_ = pg(world, 840, 180, 240, 80, '根页', 'root');
  show(leaves, T('c4'), { y: 16, stagger: 0.1 }); show(root_, T('c4') + 0.4, { y: 16 });
  const pageN = chip(world, 260, 470, '一页：一批排好序的键值', 'dk xl'); show(pageN, T('c4', '排好序') - 0.3, { y: 10 }); fadeOut(pageN, T('c5') - 0.1);
  const dirty = leaves.map((l, i) => { const d = xl(world, 260 + i * 390 + 100, 270, '改过', 'dk'); css(d, { fontSize: '26px', padding: '6px 16px' }); return d; });
  dirty.forEach((d, i) => show(d, T('c5', '缓存里的页') + i * 0.15, { y: 10 }));
  const later = label(world, 260, 470, '文件：过一会儿才更新', 't-body'); show(later, T('c5', '过一会儿'), { y: 8 }); fadeOut(later, T('c6') - 0.1);
  const fits = xl(world, 260, 460, '4096 份不多，缓存装得下', 'on'); show(fits, T('c6') + 0.3, { y: 10 }); fadeOut(fits, T('c6b') - 0.5);
  const evict = xl(world, 260, 460, '缓存要腾地方时，也会提前写出一部分'); show(evict, T('c6b') + 0.1, { y: 10 }); fadeOut(evict, T('c7') - 0.2);

  // 检查点：页落进文件，文件长到 96 KB（H01 A08）
  const tc = T('c7') + 0.6;
  const ck = chip(world, 1300, 40, '检查点 · 默认每 60 秒', 'dk');
  show(ck, T('c7'), { y: 10 });
  const tbar = h('div', 'abs', world); px(tbar, 1300, 100, 480, 14); css(tbar, { background: '#00ED64', borderRadius: '7px', transformOrigin: '0 50%' });
  fromTo(tbar, T('c7', '60'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'none' }); fadeOut(tbar, T('c9'));
  fadeOut(dirty, tc + 0.4);
  const ckN = gloss(note(world, 260, 520, '<b>检查点</b>：把缓存里改过的页，一次写进文件', 'g'), '检查点'); css(ckN, { fontSize: '30px' });
  show(ckN, T('c8', '检查点') - 0.3, { y: 10 }); fadeOut(ckN, T('c10') - 0.1);
  const grown = chip(world, 1000, 620, '4 KB → 96 KB', 'dk xl'); show(grown, T('c9') + 1.2, { y: 10 }); fadeOut(grown, T('c10') + 0.6);
  const treeN = chip(world, 1000, 620, '打开文件：一棵集合树', 'dk xl'); show(treeN, T('c10', '样子') - 0.2, { y: 10 }); fadeOut(treeN, T('c11') - 0.1);
  to(band.wrap, tc, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut' });
  const blocks = LEAF.map(([k, a, b]) => band.blk(a, b, 'l', k));
  const rootB = band.blk(86016, 90112, 'r');
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
  const leafN = chip(world, 260, 460, '叶页：键和值都在这里', 'dk xl'); show(leafN, T('c11', '键和值') - 0.3, { y: 8 }); fadeOut(leafN, T('c14b') - 0.2);
  const bounds = chip(world, 1110, 186, '根页：1 · 1225 · 2449 · 3124', 'dk xl'); css(bounds, { fontFamily: '"Mono"', fontSize: '28px' });
  show(bounds, T('c13'), { x: -10, y: 0 });
  const bt = gloss(note(world, 140, 560, '<b>B 树</b>：根页记着每个叶页从哪个键开始、在文件哪里；找键时从根往下走', 'g'), 'B 树');
  show(bt, T('c14b'), { y: 10 });
  // 走一遍：从根落到第二个叶页
  const walk = link(ov, [[960, 260], [260 + 390 + 170, 330]], 'spring', { w: 6 });
  draw(walk, T('c14'), 0.7); hide(walk, T('c15'));
  const rootN = chip(world, 1240, 640, '根页：文件里的这一块', 'dk xl'); show(rootN, T('c13b') - 0.2, { y: 10 }); fadeOut(rootN, T('c14b') - 0.1);
  glow(rootB, T('c13b'), T('c14'), { bg: '#00ED64', bd: '#00ED64', rb: '#023430', rd: '#023430' });
  glow(leaves[1], T('c14', '往下走') - 0.3, T('c15'), { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const idx = note(world, 1060, 880 - 20, '_id 索引：根页 + 3 个叶页　·　姓名索引：根页 + 15 个叶页', '');
  css(idx, { top: '850px', left: '140px', fontSize: '24px' }); show(idx, T('c15'), { y: 8 }); hide(bt, T('c15'));

  // ── 第二站：一页从内存格式变成磁盘格式（A10 A09 B04）──
  const X2 = 1920;
  const mem = h('div', 'abs', world); px(mem, X2 + 160, 200, 560, 520); css(mem, { background: '#F4FEF8', border: '2px dashed #00684A', borderRadius: '12px' });
  const memT = h('div', 'abs', mem, '内存里的页'); css(memT, { left: '24px', top: '18px', font: '700 38px "Serif SC"', color: '#023430' });
  const memS = h('div', 'abs t-note', mem, '方便很多人同时读写'); css(memS, { left: '24px', top: '74px' });
  for (let r = 0; r < 6; r++) { const it = h('div', 'abs', mem); css(it, { left: '24px', top: 130 + r * 60 + 'px', width: '512px', height: '46px', background: '#fff', border: '1.5px solid #C1C7C6', borderRadius: '6px' }); }
  const disk = h('div', 'abs', world); px(disk, X2 + 860, 260, 420, 400); css(disk, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '8px' });
  const dT = h('div', 'abs', disk, '磁盘格式'); css(dT, { left: '22px', top: '18px', font: '700 38px "Serif SC"' });
  const dS = h('div', 'abs t-note', disk, '尽量少占地方'); css(dS, { left: '22px', top: '74px' });
  const dSize = h('div', 'abs num', disk, '118,705 字节'); css(dSize, { left: '22px', top: '150px', fontSize: '50px' });
  const dNote = h('div', 'abs t-small', disk, '整理好、还没压缩'); css(dNote, { left: '22px', top: '230px' });
  const zipped = h('div', 'abs', world); px(zipped, X2 + 1420, 380, 160, 160); css(zipped, { background: '#00ED64', borderRadius: '8px', font: '800 40px/160px "Inter"', textAlign: 'center', color: '#023430' });
  zipped.textContent = '24 KB';
  const zl = label(world, X2 + 1400, 560, 'snappy 压缩后写进文件', 'lab');
  show(mem, T('c16'), { y: 16 }); show(disk, T('c18'), { x: -40, y: 0 });
  const inMem = chip(world, X2 + 160, 750, '在内存里', 'dk xl'), inFile = chip(world, X2 + 860, 750, '在文件里', 'dk xl');
  show(inMem, T('c16') + 0.3, { y: 10 }); show(inFile, T('c16') + 1.7, { y: 10 });
  glow(mem, T('c17', '同时读写') - 0.4, T('c18'), { bg: '#C0FAE6', bd: '#00684A', rb: '#F4FEF8', rd: '#00684A' });
  const rw = [0, 1, 2, 3, 4, 5].map((r) => { const d = h('div', 'abs', world); px(d, X2 + 160 + 480, 200 + 134 + r * 60, 38, 38); css(d, { borderRadius: '50%', background: '#023430' }); return d; });
  show(rw, T('c17', '很多人'), { x: 20, y: 0, stagger: 0.1 });
  const rwL = chip(world, X2 + 160, 120, '很多人同时在读写', 'dk xl'); show(rwL, T('c17') + 0.2, { y: 10 }); fadeOut(rwL, T('c18'));
  glow(disk, T('c18', '少占地方'), null, { bg: '#F9FBFA', bd: '#00684A' });
  const xl2 = chip(world, X2 + 160, 780, 'find({ name: "Alice" })', 'dk xl'); css(xl2, { fontFamily: '"Mono"' });
  fadeOut([inMem, inFile], T('c22') - 0.1); show(xl2, T('c22', '一个名字'), { y: 10 });
  const a1 = link(ov, [[X2 + 730, 460], [X2 + 850, 460]], 'accent', { arrow: true, w: 3 }); arrowIn(a1, T('c19'));
  show(dNote, T('c20'), { y: 6 });
  const a2 = link(ov, [[X2 + 1290, 460], [X2 + 1410, 460]], 'accent', { arrow: true, w: 3 }); arrowIn(a2, T('c20b') - 0.2);
  show([zipped, zl], T('c20b'), { x: -30, y: 0 }); sfx('pop', T('c20b'));

  // 镜头：两站
  const a = drift(s.start, T('c16') - 0.4, 960, 1), b = drift(T('c16') + 1, s.end, X2 + 960, -1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }],
    [T('c16') - 0.4, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
  ]);
});
