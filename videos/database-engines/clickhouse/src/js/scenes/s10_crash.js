// 第 10 章 出错怎么办：不先写日志，先写临时文件夹再改名 → 写一亿行到第四秒杀掉（四十三个片段 + 一个临时文件夹）→ 重启清掉临时文件夹，语句没有整个撤回 → 不 fsync 的风险 → 旧片段留着可放回 → 校验和
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC, gD, gE, gF] = [0, 1, 2, 3, 4, 5].map(() => groupAt(world));

  // ── A 别的数据库先记日志；MergeTree 先写临时文件夹再改名 ──
  appear(gA, c0 + 0.05);
  const pl = mk(gA, 'panel', 100, 200, 820, 560), pr = mk(gA, 'panel y', 1000, 200, 820, 560); wipe(pl, c0 + 0.05, { dir: 'l', d: 0.5 }); appear(pr, T('r1b') - 0.1);
  mk(gA, 'lab', 140, 226, null, null, '很多数据库');
  const l1 = mk(gA, 'cell w', 140, 300, 360, 72, '<span>① 先记日志</span>'); vanish(l1, 0); appear(l1, T('r1', '日志'));
  const l2 = mk(gA, 'cell', 560, 300, 330, 72, '<span>② 再改数据</span>'); vanish(l2, 0); appear(l2, T('r1', '日志') + 0.8);
  [['InnoDB 的 redo 日志', 'InnoDB'], ['SQLite 的 WAL', 'SQLite'], ['PostgreSQL 的 WAL', 'Postgre']].forEach(([t, w], i) => {
    const p = mk(gA, 'pill', 140, 430 + i * 90, 700, 66, t); css(p, { fontSize: '28px' }); vanish(p, 0); appear(p, T('r1') + 0.2 + i * 0.5); sfx('tick', T('r1') + 0.2 + i * 0.5, { g: 0.4 });
  });
  const lr = mk(gA, 'lab y', 1040, 226, null, null, 'MergeTree'); vanish(lr, 0); appear(lr, T('r1b') - 0.1);
  const d1 = mk(gA, 'cell y', 1040, 300, 740, 72, '<span>直接把数据写到磁盘上</span>'); vanish(d1, 0); appear(d1, T('r1b', '直接'));
  const d2 = mk(gA, 'cell ghost lg', 1040, 430, 740, 72, '<span>tmp_insert_all_44_44_0</span>'); vanish(d2, 0); appear(d2, T('r1c', '先写临时')); css(d2, { fontSize: '30px' });
  const d3 = mk(gA, 'h1 y', 1040, 530, null, null, '↓ 写完，改名'); css(d3, { fontSize: '48px' }); vanish(d3, 0); appear(d3, T('r1c', '再改名') - 0.2);
  const d4 = mk(gA, 'cell y', 1040, 620, 740, 72, '<span>all_44_44_0</span>'); vanish(d4, 0); appear(d4, T('r1c', '再改名')); css(d4, { fontSize: '30px' }); sfx('chime', T('r1c', '再改名') + 0.1, { g: 0.5 });
  warm(pl, T('r1'), T('r1b')); warm(pr, T('r1b'), T('r2') - 0.3);
  const tAB = T('r2') + 0.6;
  vanish(gA, tAB);

  // ── B 写一亿行，第四秒强行杀掉 ──
  appear(gB, tAB);
  tableTag(gB, '表 <b>demo.crash</b>', tAB);
  const tm = termAt(gB, 100, 180, 1100, 90); tm.line(0, '<span class="pr">:) </span>INSERT INTO users SELECT … ;  <span class="dim">-- 一亿行</span>', tAB, { type: 60, cursorUntil: T('r2', '强行杀掉') });
  vanish(tm.el, 0); appear(tm.el, tAB);
  const sec = mk(gB, 'huge y', 1280, 160, null, null, '0.0 s'); css(sec, { fontSize: '150px' }); appear(sec, tAB + 0.2);
  const kA = tAB + 0.3, kB = T('r2', '强行杀掉');
  F((t) => { const k = clamp((t - kA) / Math.max(0.5, kB - kA)); sec.textContent = (k * 4).toFixed(1) + ' s'; });
  const SQ = [];
  for (let i = 0; i < 44; i++) {
    const e = mk(gB, 'sq-l' + (i === 43 ? ' ghost' : ''), 100 + (i % 11) * 160, 330 + Math.floor(i / 11) * 96, 140, 76); css(e, { borderStyle: i === 43 ? 'dashed' : 'solid' });
    e.innerHTML = '<span class="mono" style="position:absolute;left:12px;top:24px;font-size:22px;color:var(--g3)">' + (i === 43 ? 'tmp…' : 'all_' + (i + 1)) + '</span>'; vanish(e, 0);
    const tt = kA + (i / 43) * (kB - kA - 0.2); appear(e, tt); SQ.push(e);
  }
  const kill = mk(gB, 'badge', 100, 760, null, null, '强行杀掉服务端'); css(kill, { fontSize: '36px' }); slam(kill, T('r2', '强行杀掉'), { from: 1.3 }); sfx('thud', T('r2', '强行杀掉') + 0.05, { g: 0.8 });
  const n43 = mk(gB, 'big y', 700, 740, null, null, '43'); css(n43, { fontSize: '130px' }); slam(n43, T('r3', '四十三'), { from: 1.2 }); sfx('chime', T('r3', '四十三') + 0.1, { g: 0.5 });
  const n43l = mk(gB, 'h2', 900, 790, null, null, '个完整的片段，留在磁盘上'); show(n43l, T('r3', '四十三') + 0.2, { y: 10 });
  SQ.slice(0, 43).forEach((e, i) => classAt(e, 'y', T('r3', '四十三') + i * 0.01, T('r3b') - 0.1));
  classAt(SQ[43], 'y', T('r3b', 'tmp'));
  const ng = mk(gB, 'lab y', 100, 840, null, null, '还没改名的 tmp_insert_all_44_44_0'); show(ng, T('r3b') - 0.1, { y: 10 });
  const tBC = T('r4') + 0.5;
  vanish(gB, tBC);

  // ── C 重启：临时文件夹被清掉；语句没有整个撤回 ──
  appear(gC, tBC);
  const tm2 = termAt(gC, 100, 180, 1720, 90); vanish(tm2.el, 0); appear(tm2.el, tBC);
  tm2.line(0, '<span class="pr">log </span>Removing temporary directory …/tmp_insert_all_44_44_0/', Math.max(T('r4', '清掉') - 0.6, tBC + 0.1), { type: 50, cursorUntil: T('r4', '清掉') + 1.0 });
  const SQ2 = [];
  for (let i = 0; i < 44; i++) {
    const e = mk(gC, 'sq-l' + (i < 43 ? ' y' : ''), 100 + (i % 22) * 80, 320 + Math.floor(i / 22) * 80, 66, 60); css(e, { borderStyle: i === 43 ? 'dashed' : 'solid' }); appear(e, tBC); SQ2.push(e);
  }
  vanish(SQ2[43], Math.max(T('r4', '清掉') + 0.8, tBC + 0.8)); sfx('whoosh', Math.max(T('r4', '清掉') + 0.8, tBC + 0.8), { g: 0.4 });
  const t4 = mk(gC, 'h1', 100, 480, null, null, '表里只有完整的片段，没有半个'); css(t4, { fontSize: '60px' }); wipe(t4, T('r4b') - 0.1, { dir: 'l', d: 0.7 });
  const bar = mk(gC, 'bar', 100, 640, 1720, 56); css(bar, { background: 'var(--g2)' }); wipe(bar, T('r5') - 0.1, { dir: 'l', d: 0.6 });
  const part = mk(gC, 'bar y', 100, 640, 1720 * 0.478, 56); wipe(part, T('r5') + 0.3, { dir: 'l', d: 0.8 });
  SQ2.slice(0, 43).forEach((e, i) => classAt(e, 'hi', T('r5b', '四十三') + i * 0.03, T('r6') + 0.4));
  const pl_ = mk(gC, 'lab y', 100, 710, null, null, '47,813,979 行：写完的 43 个片段，留下了'); show(pl_, T('r5') + 1.0, { y: 10 });
  const pl2 = mk(gC, 'lab', 1100, 710, null, null, '一亿行'); appear(pl2, T('r5') + 0.2);
  keyed(pl2).at(T('r5b') - 0.1, { html: '一亿行：剩下的 52,186,021 行没写进去' });
  const nr = noteAt(gC, 100, 790, '这条 INSERT 没有整个撤回'); show(nr, T('r5', '没有整个撤回') - 0.3, { y: 10 });
  const tCD = T('r6') + 0.5;
  vanish(gC, tCD);

  // ── D 默认不立刻写进磁盘：断电会丢 ──
  appear(gD, tCD);
  const bgp = mk(gD, 'panel', 80, 250, 1760, 300); vanish(bgp, 0); appear(bgp, tCD); warm(bgp, T('r6'), T('r7') - 0.2);
  const nodes = [['新片段', 100, 'cell y', 460], ['操作系统缓存（内存）', 660, 'cell', 560], ['磁盘', 1340, 'cell', 480]];
  const nd = nodes.map(([t, x, c, w], i) => { const e = mk(gD, c + ' lg', x, 320, w, 120, '<span>' + t + '</span>'); css(e, { fontSize: '34px' }); wipe(e, tCD + i * 0.25, { dir: 'l', d: 0.45 }); return e; });
  const a1 = mk(gD, 'h1 y', 580, 330, null, null, '→'); css(a1, { fontSize: '70px' }); vanish(a1, 0); appear(a1, T('r6', '写完') + 0.1);
  const a2 = mk(gD, 'h1', 1240, 330, null, null, '→'); css(a2, { fontSize: '70px', color: 'var(--g4)' }); vanish(a2, 0); appear(a2, T('r6', '不要求立刻') - 0.2);
  const q2 = mk(gD, 'badge', 1140, 470, null, null, '默认不要求立刻写'); css(q2, { fontSize: '30px' }); slam(q2, T('r6', '不要求立刻'), { from: 1.2 });
  const stay = mk(gD, 'lab y', 660, 470, null, null, '↑ 新片段还停在这里'); show(stay, T('r6b', '缓存里') - 0.4, { y: 10 });
  const cut = mk(gD, 'huge y', 660, 560, null, null, '断电'); css(cut, { fontSize: '200px' }); slam(cut, T('r7', '断电') - 0.1, { from: 1.25 }); sfx('thud', T('r7', '断电'), { g: 0.8 });
  classAt(nd[1], 'ghost', T('r7', '没了')); classAt(nd[0], 'done', T('r7', '没了'));
  keyed(nd[2].firstChild).at(T('r7b', '丢失') - 0.1, { html: '磁盘：没有最新的片段' }); classAt(nd[2], 'y', T('r7b', '丢失') - 0.1);
  const lost = mk(gD, 'h1', 100, 820, null, null, '最新的片段，可能丢失或损坏'); css(lost, { fontSize: '60px' }); wipe(lost, T('r7b') - 0.2, { dir: 'l', d: 0.6 });
  const tDE = T('r8') + 1.6;
  vanish(gD, tDE);

  // ── E 旧片段留着，万一合并出的新片段坏了 ──
  appear(gE, tDE);
  const old = [0, 1, 2].map((i) => { const f = foldAt(gE, 100 + i * 330, 220, 300, 200, 'all_' + (i + 1) + '_' + (i + 1) + '_0', 'ghost'); wipe(f, tDE + i * 0.2, { dir: 'l', d: 0.4 }); return f; });
  const nw = foldAt(gE, 1140, 220, 680, 200, 'all_1_3_1', 'y'); wipe(nw, tDE + 0.5, { dir: 'l', d: 0.5 }); sfx('pop', tDE + 0.6, { g: 0.4 });
  const bad = mk(gE, 'badge', 1140, 450, null, null, '启动时发现：新片段坏了'); css(bad, { fontSize: '32px' }); slam(bad, T('r8b', '坏了'), { from: 1.2 }); sfx('thud', T('r8b', '坏了') + 0.1, { g: 0.6 });
  classAt(nw, 'ghost', T('r8b', '坏了')); classAt(nw, 'y', 0, T('r8b', '坏了'));
  old.forEach((f, i) => { classAt(f, 'y', T('r8b', '放回来') + i * 0.2); classAt(f, 'ghost', 0, T('r8b', '放回来') + i * 0.2); });
  const back = mk(gE, 'h1 y', 100, 560, null, null, '把旧片段放回来'); css(back, { fontSize: '90px' }); wipe(back, T('r8b', '放回来'), { dir: 'l', d: 0.7 }); sfx('chime', T('r8b', '放回来') + 0.3, { g: 0.6 });
  const bn = noteAt(gE, 100, 720, '第一个原因：可能还有人在读（第 08 章）'); css(bn, { fontSize: '28px' }); show(bn, tDE + 0.3, { y: 10 });
  old.forEach((f, i) => warm(f, tDE + 0.6 + i * 0.4, tDE + 1.6 + i * 0.4, '#151515', '#33332A')); warm(nw, tDE + 0.8, T('r8b', '坏了'));
  const tEF = T('r9') + 1.8;
  vanish(gE, tEF);

  // ── F 校验和 ──
  appear(gF, tEF);
  tableTag(gF, '表 <b>demo.broken</b>', tEF);
  const ck = foldAt(gF, 100, 200, 800, 360, 'all_2_2_0 / checksums.txt', 'y'); wipe(ck, tEF, { dir: 'l', d: 0.4 });
  ['id.bin　　大小　校验和', 'name.bin　大小　校验和', 'age.bin　　大小　校验和', '…'].forEach((t, i) => { const e = fileAt(ck, i, t, ''); vanish(e, 0); appear(e, Math.max(T('r9', '大小') - 0.2, tEF + 0.3) + i * 0.25); });
  const g1 = glossAt(gF, 100, 600, 800, '校验和', '<b>校验和</b>　按文件内容算出来的一个数；内容一变，这个数就对不上'); show(g1, T('r9b', '校验和') - 0.1, { y: 10, d: 0.35 });
  const c9 = mk(gF, 'h1', 1000, 230, null, null, '内容 1e → 1f'); css(c9, { fontSize: '64px' }); wipe(c9, T('r9c') - 0.1, { dir: 'l', d: 0.6 });
  const c9b = mk(gF, 'h1 y', 1000, 330, null, null, '校验和 ≠ 原来的'); css(c9b, { fontSize: '64px' }); wipe(c9b, T('r9c', '对不上') - 0.3, { dir: 'l', d: 0.6 }); sfx('thud', T('r9c', '对不上') + 0.1, { g: 0.5 });
  const c9n = noteAt(gF, 1000, 430, '（示意）'); css(c9n, { fontSize: '24px' }); appear(c9n, T('r9c') - 0.1);
  warm(ck, T('r9'), T('r10') - 0.3);
  const mv = foldAt(gF, 100, 680, 480, 150, 'all_1_1_0', ''); vanish(mv, 0); appear(mv, T('r10') - 0.1);
  const dt = foldAt(gF, 1000, 680, 820, 150, 'detached/broken-on-start_all_1_1_0', 'ghost'); vanish(dt, 0); appear(dt, T('r10', '挪到一边'));
  tl.fromTo(mv, { x: 0 }, { x: 0, duration: 0.01 }, 0);
  to(mv, T('r10', '挪到一边'), { x: 900, duration: 0.8, ease: 'power3.inOut' }); sfx('whoosh', T('r10', '挪到一边'), { g: 0.5 });
  vanish(mv, T('r10', '挪到一边') + 0.85);
  const sz = mk(gF, 'lab y', 100, 850, null, null, '大小不对 → 启动时挪到一边'); show(sz, T('r10', '大小不对'), { y: 10 });
  const er = termAt(gF, 1000, 560, 820, 90); vanish(er.el, 0); appear(er.el, T('r10b', '校验失败') - 0.6);
  er.line(0, '<span class="out">Checksum doesn\'t match: corrupted data</span>', T('r10b', '校验失败'), {});
  const stp = mk(gF, 'badge', 1000, 488, null, null, '报错停下'); css(stp, { fontSize: '40px' }); slam(stp, T('r10b', '报错停下'), { from: 1.25 }); sfx('thud', T('r10b', '报错停下') + 0.1, { g: 0.6 });
  drift(cam, s, -1);
});
