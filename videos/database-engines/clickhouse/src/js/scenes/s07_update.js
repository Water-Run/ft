// 第 07 章 改：Alice 四十二岁变四十三岁 → 文件不改，一次变更给每个片段生成新版本（_92）→ 年龄列整个重写、没改的列硬链接 → 慢了几十倍 → 轻量更新
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC, gD, gE] = [0, 1, 2, 3, 4].map(() => groupAt(world));

  // ── A Alice 过生日 ──
  appear(gA, c0 + 0.05);
  tableTag(world, '表 <b>demo.users</b> · 一亿行', c0 + 0.1, T('u7', '轻量更新') - 0.1);
  tableTag(world, '表 <b>demo.users_lw</b>', T('u7', '轻量更新') - 0.1, s.end);
  mk(gA, 'lab y', 100, 180, null, null, '要改的人');
  const al = rowAt(gA, 100, 240, ['2050', 'Alice', '42'], [210, 310, 150], 90, 'lg y'); slide(al.row, T('u1', '四十二') - 0.4, { x: -80 });
  keyed(al.c[2].firstChild).at(T('u1', '四十三'), { html: '43' }); classAt(al.c[2], 'on', T('u1', '四十三'), T('u1', '四十三') + 1.2); sfx('pop', T('u1', '四十二'), { g: 0.5 }); sfx('chime', T('u1', '四十三') + 0.1, { g: 0.6 });
  const big = mk(gA, 'huge y', 1000, 190, null, null, '42'); css(big, { fontSize: '340px' }); slam(big, T('u1', '四十二'), { from: 1.2 });
  keyed(big).at(T('u1', '四十三'), { html: '43', cls: 'abs huge y' });
  const plus = mk(gA, 'tag', 1560, 260, null, null, '+1'); css(plus, { fontSize: '120px' }); vanish(plus, 0); slam(plus, T('u1', '四十三') - 0.1, { from: 1.6 }); sfx('thud', T('u1', '四十三'), { g: 0.5 });
  vanish(gA, T('u2') - 0.1);

  // ── B 文件不改：一次变更，每个片段生成一个新版本 ──
  appear(gB, T('u2') - 0.1);
  mk(gB, 'lab', 100, 180, null, null, '原来的片段'); const nl = mk(gB, 'lab y', 1180, 180, null, null, '新版本'); vanish(nl, 0); appear(nl, T('u3', '新版本') - 0.1);
  const o1 = foldAt(gB, 100, 220, 660, 200, 'all_1_90_3', ''); const o2 = foldAt(gB, 100, 450, 660, 200, 'all_91_91_0', ''); const o2n = mk(o2, 't-note', 360, 12, null, null, 'Dave 那一行'); css(o2n, { fontSize: '22px' });
  [o1, o2].forEach((f, k) => { wipe(f, T('u2') - 0.1 + k * 0.3, { dir: 'l', d: 0.5 }); ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(f, i, t)); });
  [o1, o2].forEach((f, k) => { const lk = ico(gB, 'lock', 680, 236 + k * 230, 64, 'y', 3.4); vanish(lk, 0); slam(lk, T('u2', '不改') - 0.05 + k * 0.12, { from: 1.8 }); });
  sfx('thud', T('u2', '不改') + 0.1, { g: 0.6 });
  const tm = termAt(gB, 100, 732, 1720, 156); tm.line(1, '<span class="out">Ok.</span>', T('u3', '新版本') + 0.3, {}); tm.line(2, '<span class="out">0 rows in set. Elapsed: 0.556 sec.</span>', T('u3', '新版本') + 0.3, {}); vanish(tm.el, 0); appear(tm.el, T('u2b') - 0.1);
  tm.line(0, '<span class="pr">:) </span>ALTER TABLE users UPDATE age = 43 WHERE id = 2050;', T('u2b') - 0.05, { type: 40, cursorUntil: T('u2b', '变更') + 1.5 });
  const g1 = glossAt(gB, 100, 898, 1720, '变更', '<b>变更</b>（mutation）　后台任务：给每个片段做一个新版本，只重写改到的列'); show(g1, T('u2b', '变更') - 0.1, { y: 12, d: 0.35 });
  const n1 = foldAt(gB, 1180, 220, 640, 200, '', 'y'); const n2 = foldAt(gB, 1180, 450, 640, 200, '', 'y');
  [[n1, 'all_1_90_3'], [n2, 'all_91_91_0']].forEach(([f, nm], k) => {
    f.nm.innerHTML = nm + '<span class="y">_92</span>'; wipe(f, T('u3', '新版本') + k * 0.4, { dir: 'l', d: 0.5 }); sfx('pop', T('u3', '新版本') + k * 0.4, { g: 0.5 });
    ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(f, i, t));
  });
  const ar = [mk(gB, 'h1 y', 830, 280, null, null, '→'), mk(gB, 'h1 y', 830, 510, null, null, '→')]; ar.forEach((a, k) => { css(a, { fontSize: '90px' }); vanish(a, 0); appear(a, T('u3', '新版本') + k * 0.4 + 0.1); });
  const m92 = mk(gB, 'lab y', 1180, 668, null, null, '_92 = 第 92 号变更'); css(m92, { fontSize: '26px' }); show(m92, T('u3b', '第九十二') - 0.2, { y: 10 });
  const tBC = T('u4') + 0.4;
  vanish(gB, tBC);

  // ── C 年龄列整个重写，没改的列硬链接 ──
  appear(gC, tBC);
  const fl = foldAt(gC, 100, 190, 800, 420, 'all_1_90_3', ''); const fr = foldAt(gC, 1020, 190, 800, 420, '', 'y'); fr.nm.innerHTML = 'all_1_90_3<span class="y">_92</span>';
  wipe(fl, tBC, { dir: 'l', d: 0.4 }); wipe(fr, tBC + 0.1, { dir: 'l', d: 0.4 });
  const FN = ['id.bin', 'name.bin', 'age.bin'], FY = [270, 380, 490];
  const lc = FN.map((nm, k) => cellAt(gC, 130, FY[k], 420, 72, '<span>' + nm + '</span>', ''));
  const rc = FN.map((nm, k) => cellAt(gC, 1050, FY[k], 420, 72, '<span>' + nm + '</span>', ''));
  classAt(rc[2], 'on', Math.max(T('u4', '重写'), tBC + 0.7), T('u4b') - 0.1); classAt(lc[2], 'y', Math.max(T('u4', '重写'), tBC + 0.7), T('u4b') - 0.1);
  const bar = mk(gC, 'bar', 100, 660, 1720, 56); css(bar, { background: 'var(--g2)' }); wipe(bar, tBC + 0.2, { dir: 'l', d: 0.5 });
  const fill = mk(gC, 'bar y', 100, 660, 1720, 56); const f0 = Math.max(T('u4', '重写'), tBC + 0.7), f1 = Tend('u4b') - 0.2;
  F((t) => { const k = clamp((t - f0) / Math.max(0.5, f1 - f0)); fill.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)'; fill.style.visibility = t >= f0 ? 'visible' : 'hidden'; });
  const bl = mk(gC, 'lab y', 100, 725, null, null, 'age.bin 整个重写：95.37 MiB'); css(bl, { fontSize: '26px' }); appear(bl, f0);
  const one = mk(gC, '', 100, 790, 40, 40); css(one, { background: 'var(--y)' }); vanish(one, 0); slam(one, T('u4b', '一个字节') - 0.1, { from: 2 });
  const oneL = mk(gC, 'lab y', 156, 796, null, null, '改 1 个'); vanish(oneL, 0); appear(oneL, T('u4b', '一个字节'));
  const tW = T('u4b', '一亿个') - 0.4;
  for (let i = 0; i < 160; i++) { const c = mk(gC, '', 420 + (i % 40) * 34, 776 + Math.floor(i / 40) * 18, 28, 12); css(c, { background: '#5E5E55' }); vanish(c, 0); appear(c, T('u4b', '一个字节') + 0.2); const k = (i % 40) * 0.012 + Math.floor(i / 40) * 0.03; tl.fromTo(c, { backgroundColor: '#5E5E55' }, { backgroundColor: '#FAFF69', duration: 0.2, ease: 'none', immediateRender: false }, tW + k); }
  const allL = mk(gC, 'lab y', 1800, 796, null, null, '×1 亿'); css(allL, { left: 'auto', right: '60px' }); vanish(allL, 0); appear(allL, T('u4b', '一亿个'));
  sfx('riser', tW, { g: 0.35 }); sfx('thud', T('u4b', '一亿个') + 0.2, { g: 0.6 });
  [0, 1].forEach((k) => {
    const ln = mk(gC, '', 550, FY[k] + 32, 500, 4); css(ln, { background: 'var(--w)' }); wipe(ln, T('u5', '不复制') + k * 0.25, { dir: 'l', d: 0.5 }); classAt(lc[k], 'y', T('u5', '不复制') + k * 0.25); classAt(rc[k], 'y', T('u5', '不复制') + k * 0.25);
    const lb = mk(gC, 'lab y', 640, FY[k] - 10, null, null, '同一份文件'); css(lb, { fontSize: '24px' }); vanish(lb, 0); appear(lb, T('u5b', '同一份文件') + k * 0.2); sfx('tick', T('u5b', '同一份文件') + k * 0.2, { g: 0.5 });
  });
  const g2 = glossAt(gC, 100, 880, 1720, '硬链接', '<b>硬链接</b>　文件系统里给同一份文件再起一个名字：几个名字指着磁盘上同一份数据'); show(g2, T('u5') + 0.3, { y: 12, d: 0.35 });
  const tCD = T('u6') + 0.5;
  vanish(gC, tCD);

  // ── D 读一遍 vs 改一次 ──
  appear(gD, tCD);
  mk(gD, 'lab', 100, 190, null, null, '读一遍 age 这一列');
  const r1 = mk(gD, 'bar w', 100, 250, 22, 56); wipe(r1, Math.max(T('u6', '不到十毫秒'), tCD + 0.2), { dir: 'l', d: 0.3 });
  const t1 = mk(gD, 'big', 180, 225, null, null, '< 10 ms'); css(t1, { fontSize: '100px' }); slam(t1, Math.max(T('u6', '不到十毫秒'), tCD + 0.2), { from: 1.2 }); sfx('chime', Math.max(T('u6', '不到十毫秒'), tCD + 0.2) + 0.1, { g: 0.5 });
  const l2 = mk(gD, 'lab y', 100, 450, null, null, '改一次年龄（一次变更）'); appear(l2, T('u6b', '半秒') - 0.5);
  const r2 = mk(gD, 'bar y', 100, 510, 1500, 56); wipe(r2, T('u6b', '半秒') - 0.4, { dir: 'l', d: 1.2 });
  const t2 = mk(gD, 'big y', 100, 590, null, null, '半秒上下'); css(t2, { fontSize: '120px' }); show(t2, T('u6b', '半秒'), { y: 14 }); sfx('thud', T('u6b', '半秒') + 0.1, { g: 0.5 });
  // 「慢了几十倍」：短条在长条上从头量过去，量了几十个才到头（两根条的长短就是比例）
  const tR = T('u6b', '几十倍') - 0.3, nR = 68; for (let k = 0; k < nR; k++) { const e = mk(gD, 'bar w', 100 + k * 22, 516, 20, 44); css(e, { background: k % 2 ? '#8C8C82' : '#F9F9F9' }); vanish(e, 0); appear(e, tR + k * 0.02); }
  sfx('riser', tR, { g: 0.35 });
  const tDE = T('u7') + 1.0;
  vanish(gD, tDE);

  // ── E 轻量更新（两边都只摆做法本身：最近一次重跑里两者的耗时都是 0.556 秒，不拿时间比）──
  appear(gE, tDE);
  const pa = mk(gE, 'panel', 100, 220, 840, 460), pb = mk(gE, 'panel y', 980, 220, 840, 460); wipe(pa, tDE, { dir: 'l', d: 0.4 }); appear(pb, T('u7', '轻量更新') - 0.1);
  mk(gE, 'lab', 140, 250, null, null, '变更'); mk(gE, 'big', 140, 320, null, null, '95.37 MiB'); gE.lastChild.style.fontSize = '120px';
  const lwA = mk(gE, 'bar y', 140, 520, 760, 40); wipe(lwA, tDE + 0.3, { dir: 'l', d: 0.8 }); const lwAL = mk(gE, 'lab', 140, 580, null, null, '整列的年龄，重写一遍'); appear(lwAL, tDE + 0.6);
  const lb2 = mk(gE, 'lab y', 1020, 250, null, null, '轻量更新'); vanish(lb2, 0); appear(lb2, T('u7', '轻量更新') - 0.1);
  // 轻量更新：年龄列的一小段；改了的那一行写成一块补丁；查询时叠上去读；合并时才真正并进去
  const AG = [50, 51, 42, 53, 54], CW7 = 130, SX7 = 1040, SY7 = 360, tP = T('u7d', '补丁') - 0.1;
  const idL = AG.map((_, i) => { const e = mk(gE, 'mono', SX7 + i * (CW7 + 6), SY7 - 34, CW7, null, String(2048 + i)); css(e, { fontSize: '22px', textAlign: 'center', color: i === 2 ? 'var(--y)' : 'var(--g3)' }); vanish(e, 0); appear(e, tDE + 0.3 + i * 0.05); return e; });
  const agC = AG.map((v, i) => { const c = cellAt(gE, SX7 + i * (CW7 + 6), SY7, CW7, 64, '<span>' + v + '</span>', ''); vanish(c, 0); appear(c, tDE + 0.3 + i * 0.05); return c; });
  const agL = mk(gE, 'fn', SX7, SY7 + 76, null, null, 'age.bin（原来的片段，不动）'); css(agL, { fontSize: '22px' }); vanish(agL, 0); appear(agL, tDE + 0.6);
  const XA7 = SX7 + 2 * (CW7 + 6);
  const patchC = cellAt(gE, XA7, SY7 + 150, CW7, 64, '<span>43</span>', 'on'); patchC.setAttribute('data-overlap-ok', ''); /* 补丁要叠到她那一格上 */ const patchL = mk(gE, 'fn y', XA7 + CW7 + 20, SY7 + 166, null, null, '补丁片段：只有这 1 行'); css(patchL, { fontSize: '24px' });
  const tRd = T('u7a', '叠上去') - 0.3, tMg = Math.max(T('u7a2', '合并') - 0.1, tRd + 2.4);
  motion(patchC, [[0, { a: 0, y: -40 }], [tP, { a: 0, y: -40 }], [tP + 0.05, { a: 1 }], [tP + 0.45, { y: 0 }], [tRd + 0.45, { y: 0 }], [tRd + 0.8, { y: -150 }], [tRd + 1.9, { y: -150 }], [tRd + 2.2, { y: 0 }], [tMg, { y: 0, s: 1, a: 1 }], [tMg + 0.45, { y: -150, s: 1, a: 1 }], [tMg + 0.9, { y: -150, s: 0.6, a: 0 }]], ease.io3);
  vanish(patchL, 0); show(patchL, tP + 0.4, { x: -12, y: 0, d: 0.35 }); keyed(patchL).at(tMg + 0.6, { html: '补丁并进去了，随后删掉', cls: 'abs fn dim' });
  sfx('pop', tP + 0.4, { g: 0.5 });
  // 查询读这一列：放大镜扫过，读到她那一格时补丁正叠在上面，读出来的就是 43
  const q7 = ico(gE, 'search', 0, 0, 48, 'y', 3.6);
  motion(q7, [[0, { a: 0, x: SX7 - 60, y: SY7 + 8 }], [tRd, { a: 0, x: SX7 - 60 }], [tRd + 0.15, { a: 1 }], [tRd + 1.9, { x: SX7 + 5 * (CW7 + 6), a: 1 }], [tRd + 2.2, { a: 0 }]], (k) => k);
  const rdL = mk(gE, 'lab y', SX7, SY7 + 230, null, null, '查询读到的：43'); css(rdL, { fontSize: '26px' }); vanish(rdL, 0); show(rdL, tRd + 0.55, { y: 10, d: 0.3 }); vanish(rdL, tMg + 0.6);
  // 合并：补丁真正并进片段，原来那一格变成 43
  keyed(agC[2].firstChild).at(tMg + 0.5, { html: '43' });
  flashClone(agC[2], tMg + 0.45, 1.0, 0.7, 'on', '<span>43</span>');
  keyed(agL).at(tMg + 0.5, { html: '合并后的新片段：age.bin 里就是 43', cls: 'abs fn y' });
  sfx('chime', tMg + 0.5, { g: 0.5 });
  const gLw = glossAt(gE, 100, 700, 1720, '轻量更新', '<b>轻量更新</b>　只把改了的那几行写成补丁片段，不重写整列'); show(gLw, T('u7', '轻量更新') + 0.2, { y: 12, d: 0.35 });
  const st = mk(gE, 'pill y', 100, 760, 920, 72, 'enable_block_number_column'); css(st, { fontSize: '34px' }); show(st, T('u7b', '设置') - 0.5, { y: 14 }); sfx('pop', T('u7b', '设置') - 0.2, { g: 0.5 });
  const sw = mk(gE, '', 1060, 774, 96, 44); css(sw, { border: '3px solid var(--g3)', background: 'var(--k2)' }); vanish(sw, 0); show(sw, T('u7b') - 0.7, { y: 14 });
  const knob = mk(sw, '', 4, 4, 30, 30); css(knob, { background: 'var(--g3)' });
  tl.fromTo(knob, { x: 0 }, { x: 52, duration: 0.3, ease: 'power2.inOut', immediateRender: false }, T('u7b', '开'));
  classAt(knob, 'kon', T('u7b', '开') + 0.15); classAt(sw, 'swon', T('u7b', '开') + 0.15);
  const swL = mk(gE, 'lab', 1180, 782, null, null, '关'); keyed(swL).at(T('u7b', '开') + 0.15, { html: '<span class="y">开</span>' }); vanish(swL, 0); appear(swL, T('u7b') - 0.6);
  drift(cam, s, 1);
});
