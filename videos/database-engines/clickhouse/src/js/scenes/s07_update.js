// 第 07 章 改：Alice 四十二岁变四十三岁 → 文件不改，一次变更给每个片段生成新版本（_92）→ 年龄列整个重写、没改的列硬链接 → 慢了几十倍 → 轻量更新
scene('update', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC, gD, gE] = [0, 1, 2, 3, 4].map(() => groupAt(world));

  // ── A Alice 过生日 ──
  appear(gA, c0 + 0.05);
  tableTag(world, '表 <b>demo.users</b> · 一亿行', c0 + 0.1, s.end);
  mk(gA, 'lab y', 100, 180, null, null, '要改的人');
  const al = rowAt(gA, 100, 240, ['2050', 'Alice', '42'], [210, 310, 150], 90, 'lg y'); slide(al.row, T('u1', '四十二') - 0.4, { x: -80 });
  keyed(al.c[2].firstChild).at(T('u1', '四十三'), { html: '43' }); classAt(al.c[2], 'on', T('u1', '四十三'), T('u1', '四十三') + 1.2); sfx('pop', T('u1', '四十二'), { g: 0.5 }); sfx('chime', T('u1', '四十三') + 0.1, { g: 0.6 });
  const big = mk(gA, 'huge y', 1000, 190, null, null, '42'); css(big, { fontSize: '340px' }); slam(big, T('u1', '四十二'), { from: 1.2 });
  keyed(big).at(T('u1', '四十三'), { html: '43', cls: 'abs huge y' });
  const bday = mk(gA, 'h1', 100, 480, null, null, '生日快乐'); css(bday, { fontSize: '90px' }); wipe(bday, T('u1', '过生日'), { dir: 'l', d: 0.7 });
  vanish(gA, T('u2') - 0.1);

  // ── B 文件不改：一次变更，每个片段生成一个新版本 ──
  appear(gB, T('u2') - 0.1);
  mk(gB, 'lab', 100, 180, null, null, '原来的片段'); const nl = mk(gB, 'lab y', 1180, 180, null, null, '新版本'); vanish(nl, 0); appear(nl, T('u3', '新版本') - 0.1);
  const o1 = foldAt(gB, 100, 230, 660, 230, 'all_1_90_3', ''); const o2 = foldAt(gB, 100, 500, 660, 230, 'all_91_91_0', ''); const o2n = mk(o2, 'abs t-note', 360, 12, null, null, 'Dave 那一行'); css(o2n, { fontSize: '22px' });
  [o1, o2].forEach((f, k) => { wipe(f, T('u2') - 0.1 + k * 0.3, { dir: 'l', d: 0.5 }); ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(f, i, t)); });
  const lock = mk(gB, 'badge', 100, 750, null, null, '写好的文件，从来不改'); css(lock, { fontSize: '30px' }); slam(lock, T('u2', '不改'), { from: 1.2 }); sfx('thud', T('u2', '不改') + 0.1, { g: 0.6 });
  const tm = termAt(gB, 100, 800, 1720, 86); vanish(tm.el, 0); appear(tm.el, T('u2b') - 0.1);
  tm.line(0, '<span class="pr">:) </span>ALTER TABLE users UPDATE age = 43 WHERE id = 2050;', T('u2b') - 0.05, { type: 40, cursorUntil: T('u2b', '变更') + 1.5 });
  const g1 = glossAt(gB, 100, 895, 1720, '变更', '<b>变更</b>（mutation）　改数据的后台任务：每个片段做出一个新版本'); show(g1, T('u2b', '变更') - 0.1, { y: 12, d: 0.35 });
  const n1 = foldAt(gB, 1180, 230, 640, 230, '', 'y'); const n2 = foldAt(gB, 1180, 500, 640, 230, '', 'y');
  [[n1, 'all_1_90_3'], [n2, 'all_91_91_0']].forEach(([f, nm], k) => {
    f.nm.innerHTML = nm + '<span class="y">_92</span>'; wipe(f, T('u3', '新版本') + k * 0.4, { dir: 'l', d: 0.5 }); sfx('pop', T('u3', '新版本') + k * 0.4, { g: 0.5 });
    ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(f, i, t));
  });
  const ar = [mk(gB, 'h1 y', 830, 300, null, null, '→'), mk(gB, 'h1 y', 830, 570, null, null, '→')]; ar.forEach((a, k) => { css(a, { fontSize: '90px' }); vanish(a, 0); appear(a, T('u3', '新版本') + k * 0.4 + 0.1); });
  const m92 = noteAt(gB, 1180, 745, '第 92 号变更：名字后面多了 _92'); css(m92, { fontSize: '24px' }); show(m92, T('u3b') - 0.4, { y: 10 });
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
  const c1 = mk(gC, 'h1', 100, 790, null, null, '改 1 个字节'); css(c1, { fontSize: '60px' }); vanish(c1, 0); appear(c1, T('u4b', '一个字节'));
  const c2 = mk(gC, 'h1 y', 640, 790, null, null, '→ 重写 100,000,000 个'); css(c2, { fontSize: '60px' }); wipe(c2, T('u4b', '一亿个') - 0.2, { dir: 'l', d: 0.6 }); sfx('thud', T('u4b', '一亿个'), { g: 0.6 });
  [0, 1].forEach((k) => {
    const ln = mk(gC, 'abs', 550, FY[k] + 32, 500, 4); css(ln, { background: 'var(--w)' }); wipe(ln, T('u5', '不复制') + k * 0.25, { dir: 'l', d: 0.5 }); classAt(lc[k], 'y', T('u5', '不复制') + k * 0.25); classAt(rc[k], 'y', T('u5', '不复制') + k * 0.25);
    const lb = mk(gC, 'lab y', 640, FY[k] - 10, null, null, '同一份文件'); css(lb, { fontSize: '24px' }); vanish(lb, 0); appear(lb, T('u5b', '同一份文件') + k * 0.2); sfx('tick', T('u5b', '同一份文件') + k * 0.2, { g: 0.5 });
  });
  const g2 = glossAt(gC, 100, 880, 1720, '硬链接', '<b>硬链接</b>　同一份文件，在两个文件夹里各有一个名字'); show(g2, T('u5') + 0.3, { y: 12, d: 0.35 });
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
  const t3 = mk(gD, 'tag', 760, 640, null, null, '慢了几十倍'); css(t3, { fontSize: '90px' }); slam(t3, T('u6b', '几十倍'), { from: 1.25 }); sfx('thud', T('u6b', '几十倍') + 0.1, { g: 0.6 });
  const tDE = T('u7') + 1.0;
  vanish(gD, tDE);

  // ── E 轻量更新（两边都只摆做法本身：最近一次重跑里两者的耗时都是 0.556 秒，不拿时间比）──
  appear(gE, tDE);
  const pa = mk(gE, 'panel', 100, 220, 840, 460), pb = mk(gE, 'panel y', 980, 220, 840, 460); wipe(pa, tDE, { dir: 'l', d: 0.4 }); appear(pb, T('u7', '轻量更新') - 0.1);
  mk(gE, 'lab', 140, 250, null, null, '变更'); mk(gE, 'big', 140, 320, null, null, '95.37 MiB'); gE.lastChild.style.fontSize = '120px';
  mk(gE, 'h2', 140, 520, null, null, '重写整列的年龄');
  const lb2 = mk(gE, 'lab y', 1020, 250, null, null, '轻量更新'); vanish(lb2, 0); appear(lb2, T('u7', '轻量更新') - 0.1);
  const gn = mk(gE, 'big y', 1020, 320, null, null, '1 行'); css(gn, { fontSize: '120px' }); slam(gn, T('u7', '小补丁'), { from: 1.2 }); sfx('chime', T('u7', '小补丁') + 0.1, { g: 0.6 });
  const gu = mk(gE, 'h2', 1020, 520, null, null, '只写一个补丁片段'); show(gu, T('u7', '小补丁') + 0.2, { y: 12 });
  const gp = mk(gE, 'fn y', 1020, 600, null, null, 'patch-…-all_98_98_0_97（demo.users_lw 表）'); css(gp, { fontSize: '24px' }); show(gp, T('u7', '小补丁') + 0.5, { y: 10 });
  const st = mk(gE, 'pill y', 100, 760, 920, 72, 'enable_block_number_column'); css(st, { fontSize: '34px' }); show(st, T('u7b', '先开设置') - 0.3, { y: 14 }); sfx('pop', T('u7b', '先开设置'), { g: 0.5 });
  const stn = noteAt(gE, 1060, 770, '表上先开这个设置，才能用'); show(stn, T('u7b') - 0.1, { y: 12 });
  drift(cam, s, 1);
});
