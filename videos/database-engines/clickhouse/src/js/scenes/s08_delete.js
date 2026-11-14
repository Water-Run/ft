// 第 08 章 删：Alice 注销 → 文件不动，加一列隐藏的 _row_exists（她写成 0）→ 查询自动跳过 → 合并时才真正消失 → 旧片段留八分钟
scene('delete', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gC, gD] = [0, 1, 2].map(() => groupAt(world));

  // ── A Alice 注销；_row_exists ──
  appear(gA, c0 + 0.05);
  const al = rowAt(gA, 100, 190, ['2050', 'Alice', '43'], [210, 310, 150], 90, 'lg'); wipe(al.row, c0 + 0.1, { dir: 'l', d: 0.5 });
  al.c.forEach((c) => classAt(c, 'done', T('d1', '注销') + 0.6)); classAt(al.c[1], 'y', T('d1', '注销'), T('d1', '注销') + 0.6);
  const tm = termAt(gA, 100, 306, 840, 170); tm.line(1, '<span class="out">Ok.</span>', T('d2') - 0.2, {}); tm.line(2, '<span class="out">0 rows in set. Elapsed: 1.918 sec.</span>', T('d2') - 0.2, {}); tm.line(0, '<span class="pr">:) </span>DELETE FROM users WHERE id = 2050;', T('d1', '注销') - 0.4, { type: 36, cursorUntil: T('d2') });
  vanish(tm.el, 0); appear(tm.el, T('d1', '注销') - 0.45);
  tableTag(gA, '表 <b>demo.users</b> · 一亿行', c0 + 0.1);
  const fo = foldAt(gA, 100, 492, 780, 320, 'all_1_90_3_92', ''); wipe(fo, T('d2') - 0.1, { dir: 'l', d: 0.5 });
  keyed(fo.nm).at(T('d2b', 'row exists'), { html: 'all_1_90_3<span class="y">_93</span>　← 第 93 号变更' });
  ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(fo, i, t));
  const lk = mk(gA, 'badge', 100, 838, null, null, '原来的文件，不动'); css(lk, { fontSize: '30px' }); slam(lk, T('d2', '不动'), { from: 1.2 }); sfx('thud', T('d2', '不动') + 0.1, { g: 0.6 });
  const hid = fileAt(fo, 3, '_row_exists.bin', 'y'); vanish(hid, 0); appear(hid, T('d2b', 'row exists')); sfx('pop', T('d2b', 'row exists'), { g: 0.5 });
  classAt(fo, 'y', T('d2b', 'row exists'));
  const ex = mk(gA, 'lab y', 960, 440, null, null, '_row_exists：每人一个字节'); vanish(ex, 0); appear(ex, T('d2b', 'row exists'));
  const RID = [2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054], AI = 3;          // Alice 是 2050 号
  const ex1 = RID.map((r, i) => { const c = cellAt(gA, 960 + i * 108, 500, 112, 76, '<span>1</span>', ''); vanish(c, 0); appear(c, T('d2b', '一人一个字节') + i * 0.12); sfx('tick', T('d2b', '一人一个字节') + i * 0.12, { g: 0.3 }); return c; });
  const dl = mk(gA, 'lab', 916, 520, null, null, '…'); vanish(dl, 0); appear(dl, T('d2b', '一人一个字节'));
  const rn = noteAt(gA, 960, 626, '一亿个字节，这里只画 2047–2054 号'); css(rn, { fontSize: '22px' }); vanish(rn, 0); show(rn, T('d2b', '一人一个字节') + 1.0, { y: 8 });
  const nms = RID.map((r, i) => { const l = mk(gA, 'lab' + (i === AI ? ' y' : ''), 960 + i * 108 + 14, 586, null, null, String(r)); css(l, { fontSize: '22px' }); vanish(l, 0); appear(l, T('d2b', '一人一个字节') + i * 0.12); return l; });
  // d3：她写成 0，其他人是 1，其余的列照样是硬链接
  keyed(ex1[AI].firstChild).at(T('d3', '写成零'), { html: '0' }); classAt(ex1[AI], 'on', T('d3', '写成零'), T('d3', '都是一') - 0.1); classAt(ex1[AI], 'dead', T('d3', '都是一') - 0.1);
  ex1.filter((c, i) => i !== AI).forEach((c, i) => classAt(c, 'y', T('d3', '都是一') + i * 0.08, T('d4') - 0.2));
  ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => { const lb = mk(gA, 'lab y', 500, 492 + 58 + i * 40 - 4, null, null, '= 旧文件（硬链接）'); css(lb, { fontSize: '22px' }); vanish(lb, 0); appear(lb, T('d3', '硬链接') + i * 0.2); });
  // d4：查询自动跳过她
  const sk0 = T('d4', '跳过') - 1.0, sk1 = Tend('d4');
  F((t) => { const k = clamp((t - sk0) / Math.max(0.4, sk1 - sk0)) * 8; ex1.forEach((c, i) => { if (i !== AI) c.classList.toggle('on', t >= sk0 && i < k + 0.5 && t < sk1 + 0.3); }); });
  const skb = mk(gA, 'badge', 960, 660, null, null, '查询：自动跳过她'); css(skb, { fontSize: '32px' }); slam(skb, T('d4') - 0.1, { from: 1.2 }); sfx('thud', T('d4', '跳过') + 0.1, { g: 0.5 });
  const skn = noteAt(gA, 960, 740, '总数少了 1 个'); css(skn, { fontSize: '26px' }); show(skn, T('d4') + 0.3, { y: 10 });
  warm(fo, T('d2'), T('d2b'));
  const tAC = T('d5') + 0.6;
  vanish(gA, tAC);

  // ── C 合并时才真正消失 ──
  appear(gC, tAC);
  mk(gC, 'lab', 100, 180, null, null, '带着 _row_exists 的片段'); const rl = mk(gC, 'lab y', 1060, 180, null, null, '合并出来的新片段'); vanish(rl, 0); appear(rl, T('d5b') - 0.1);
  const fa = foldAt(gC, 100, 230, 760, 330, 'all_1_90_3_93', ''); wipe(fa, tAC, { dir: 'l', d: 0.4 });
  ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(fa, i, t)); fileAt(fa, 3, '_row_exists.bin', 'y');
  const mg = mk(gC, 'h1 y', 880, 340, null, null, '合并 →'); css(mg, { fontSize: '56px' }); wipe(mg, T('d5', '合并'), { dir: 'l', d: 0.5 }); sfx('whoosh', T('d5', '合并'), { g: 0.5 });
  const fb = foldAt(gC, 1060, 230, 760, 330, 'all_1_91_4_93', 'y'); wipe(fb, T('d5b') - 0.1, { dir: 'l', d: 0.5 }); sfx('chime', T('d5b') + 0.1, { g: 0.5 });
  const fbn = mk(fb, 'abs t-note', 18, 250, null, null, '连同 Dave 那个片段，一起并成了一个'); css(fbn, { fontSize: '22px' });
  ['id.bin', 'name.bin', 'age.bin'].forEach((t, i) => fileAt(fb, i, t));
  const ng = mk(gC, 'h2 y', 1060, 600, null, null, '新片段里，没有 Alice'); show(ng, T('d5b', '不再有她'), { y: 12 }); sfx('thud', T('d5b', '不再有她') + 0.1, { g: 0.5 });
  const ng2 = mk(gC, 'h2', 1060, 660, null, null, '隐藏的那一列，也不用了'); show(ng2, T('d5b', '隐藏'), { y: 12 });
  const tm2 = termAt(gC, 100, 760, 1100, 170); tm2.line(1, '<span class="out">Ok.</span>', T('d5c', '手动') + 0.8, {}); tm2.line(2, '<span class="out">0 rows in set. Elapsed: 8.490 sec.</span>', T('d5c', '手动') + 0.8, {}); vanish(tm2.el, 0); appear(tm2.el, T('d5c') - 0.1);
  tm2.line(0, '<span class="pr">:) </span>OPTIMIZE TABLE users FINAL;', T('d5c', '手动') - 0.3, { type: 34, cursorUntil: T('d5c', '手动') + 1.5 });
  const nt = noteAt(gC, 1260, 770, '实验里就是\n手动催的'); show(nt, T('d5c') - 0.1, { y: 12 });
  warm(fa, T('d5'), T('d5b')); warm(fb, T('d5b'), T('d6') - 0.3);
  const tCD = T('d6') + 1.6;
  vanish(gC, tCD);

  // ── D 旧片段留八分钟 ──
  appear(gD, tCD);
  const fo2 = foldAt(gD, 100, 200, 760, 300, '含着她的旧片段', 'ghost'); wipe(fo2, tCD, { dir: 'l', d: 0.4 });
  ['id.bin', 'name.bin', 'age.bin', '_row_exists.bin'].forEach((t, i) => fileAt(fo2, i, t));
  warm(fo2, T('d6'), T('d6b'), '#151515', '#3C3C2A'); warm(fo2, T('d6b'), T('d7'), '#151515', '#3C3C2A');
  const bd = mk(gD, 'badge', 940, 220, null, null, '不活动'); css(bd, { fontSize: '34px' }); slam(bd, T('d6b', '不活动'), { from: 1.2 }); sfx('thud', T('d6b', '不活动') + 0.1, { g: 0.5 });
  const tbar = mk(gD, 'bar', 100, 600, 1720, 56); css(tbar, { background: 'var(--g2)' }); wipe(tbar, T('d6b', '八分钟') - 1.0, { dir: 'l', d: 0.6 });
  const tf = mk(gD, 'bar y', 100, 600, 1720, 56); const w0 = T('d6b', '八分钟') - 0.6, w1 = Tend('d6b') + 0.4;
  F((t) => { const k = clamp((t - w0) / Math.max(0.5, w1 - w0)); tf.style.clipPath = 'inset(0 ' + (100 - k * 100) + '% 0 0)'; tf.style.visibility = t >= w0 ? 'visible' : 'hidden'; });
  const l0 = mk(gD, 'fn', 100, 668, null, null, '0 s'); css(l0, { fontSize: '24px' }); const l480 = mk(gD, 'fn y', 1620, 668, null, null, '480 s'); css(l480, { fontSize: '24px' });
  const e8 = mk(gD, 'huge y', 940, 300, null, null, '8 分钟'); css(e8, { fontSize: '170px' }); slam(e8, T('d6b', '八分钟'), { from: 1.2 }); sfx('chime', T('d6b', '八分钟') + 0.1, { g: 0.6 });
  const e8n = noteAt(gD, 100, 750, '默认至少留 480 秒（实测约 8 分半）才从磁盘上删除'); css(e8n, { fontSize: '26px' }); show(e8n, T('d6b', '八分钟') + 0.3, { y: 12 });
  const rdq = termAt(gD, 940, 500, 880, 90); vanish(rdq.el, 0); appear(rdq.el, T('d7', '还有人在读') - 0.6);
  rdq.line(0, '<span class="pr">:) </span>SELECT …  <span class="dim">（还在读）</span>', T('d7', '还有人在读') - 0.5, { type: 30, cursorUntil: T('d7', '还有人在读') + 1.5 });
  const rdl = mk(gD, 'lab y', 100, 830, null, null, '旧片段先留着：可能还有人在读'); show(rdl, T('d7') + 0.1, { y: 12 });
  drift(cam, s, -1);
});
