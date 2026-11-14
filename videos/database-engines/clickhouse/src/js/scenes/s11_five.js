// 第 11 章 五个问题：每个数据库引擎都得回答——放、找、改和删、并发、出错。
// 每一行：左边问题，中间答案（讲到才刷出），右边一张小图，用的是前面各章实验里的真名字和真数（FACTS M02、Q02、Q04、U01、U02、D02、B01、P02，与第 04–10 章画面一致），跟着答案的后半句再动一步。
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const g = groupAt(world); appear(g, c0 + 0.05);
  const ROWS = [
    ['数据怎么放？', '按列，存进排好序、不再改动的片段<br>再由后台不断合并', T('f2'), 'f2'],
    ['怎么找？', '稀疏索引加标记，按颗粒跳着读<br>条件不在排序键里，就要读完那一列', T('f3'), 'f3'],
    ['怎么改和删？', '改：生成新版本，重写那一列<br>删：加一列删除标记，清理留给合并', T('f4'), 'f4'],
    ['怎么同时读写？', '查询拿快照，写入只添新片段<br>互不等待', T('f5'), 'f5'],
    ['出错怎么办？', '先写临时文件夹再改名，有校验和<br>还留着旧片段，万一要退回', T('f6'), 'f6'],
  ];
  const Y0 = 190, PITCH = 148, MX = 1064, MW = 756, FS = '24px';
  const ROWEL = [[], [], [], [], []]; let cur = 0;   // 每一行的答案与小图：讲下一行时压暗，整章讲完再一起亮回来
  ROWS.forEach(([q, a, ta], i) => {
    const qe = mk(g, 'cell lg', 100, Y0 + i * PITCH, 320, 124, '<span>' + q + '</span>'); css(qe, { fontSize: '36px', fontWeight: '700' });
    wipe(qe, T('f1') + 0.3 + i * 0.4, { dir: 'l', d: 0.45 }); sfx('tick', T('f1') + 0.3 + i * 0.4, { g: 0.4 });
    const ae = mk(g, 'h2', 452, Y0 + i * PITCH + 12, 590, 110, a); css(ae, { fontSize: '36px', lineHeight: '1.4', whiteSpace: 'nowrap' }); wipe(ae, ta + 0.2, { dir: 'l', d: 0.7 });
    const nxt = i + 1 < ROWS.length ? ROWS[i + 1][2] - 0.2 : Tend('f6b', 0.6);
    classAt(qe, 'on', ta - 0.1, nxt); sfx('chime', ta, { g: 0.35 });
    const fr = mk(g, '', MX, Y0 + i * PITCH, MW, 124); css(fr, { border: '2px solid var(--g2)', background: 'var(--k)' }); vanish(fr, 0); wipe(fr, ta, { dir: 'l', d: 0.4 });
    ROWEL[i].push(ae, fr);
  });
  const hint = mk(g, 'lab', 100, 150, null, null, '放 · 找 · 改和删 · 并发 · 出错'); css(hint, { fontSize: '24px' }); appear(hint, T('f1'));
  const at = (e, t) => { vanish(e, 0); appear(e, t); ROWEL[cur].push(e); return e; };
  const box = (x, y, w, hh, cls, t) => at(mk(g, cls, x, y, w, hh, ''), t);
  const txt = (x, y, text, t, cls = 't-note') => { const e = mk(g, cls, x, y, null, null, text); css(e, { fontSize: FS, lineHeight: '1.2' }); return at(e, t); };
  // 片段做成小签：文件夹框 + 名字（24px 等宽）
  const chip = (x, y, w, name, cls, t, hh = 34) => { const f = foldAt(g, x, y, w, hh, name, cls); css(f.nm, { fontSize: FS, left: '10px', top: '4px' }); return at(f, t); };
  const fileIn = (f, r, text, cls = '') => { const e = h('div', 'it ' + cls, f, text); css(e, { left: '10px', top: (36 + r * 25) + 'px', fontSize: FS }); return e; };
  // 一个片段里的三个列文件：编号、姓名、年龄三种灰，和第 13 章的列文件同一种画法
  const colFiles = (x, y, w, hh, n, t) => [0, 1, 2].forEach((k) => { for (let r = 0; r < n; r++) box(x + k * (w + 10), y + r * (hh + 4), w, hh, 'cseg k' + k, t + k * 0.08 + r * 0.03); });

  // ① 放：三批插入写成三个片段（各有三个列文件），后台并成 all_1_3_1（FACTS M02，第 05 章同一个例子）
  cur = 0; { const y = Y0, t = T('f2') + 0.4, tm = T('f2b') - 0.1;
    const parts = [['all_1_1_0', 3], ['all_2_2_0', 3], ['all_3_3_0', 2]].map(([nm, n], k) => {
      const c = chip(MX + 14, y + 4 + k * 40, 290, nm, '', t + k * 0.25);
      [0, 1, 2].forEach((j) => box(MX + 164 + j * 16, y + 11 + k * 40, 10, 20, 'cseg k' + j, t + k * 0.25 + 0.1));
      txt(MX + 228, y + 9 + k * 40, n + ' 行', t + k * 0.25 + 0.15);
      return c;
    });
    parts.forEach((c, k) => classAt(c, 'ghost', tm + 0.3 + k * 0.08));
    txt(MX + 324, y + 46, '合并 →', tm, 'lab y');
    const big = foldAt(g, MX + 424, y + 6, 316, 112, 'all_1_3_1 · 8 行', 'y'); css(big.nm, { fontSize: FS, left: '12px', top: '8px' }); at(big, tm + 0.2);
    colFiles(MX + 440, y + 44, 88, 12, 4, tm + 0.35); sfx('pop', tm + 0.2, { g: 0.4 }); }
  // ② 找：稀疏索引只记每个颗粒（8192 行）第一行的编号；找 2050 只读第一个颗粒，按姓名找就得一亿行 12208 个颗粒全读（FACTS Q02、Q04）
  cur = 1; { const y = Y0 + PITCH, t = T('f3') + 0.4, tb = T('f3b') - 0.1;
    const gr = [1, 8193, 16385, 24577, 32769, 40961].map((v, k) => { txt(MX + 18 + k * 114, y + 6, String(v), t + k * 0.06, 'mono'); return box(MX + 14 + k * 114, y + 38, 104, 40, 'gran', t + k * 0.06); });
    txt(MX + 702, y + 44, '…', t + 0.4, 'lab');
    classAt(gr[0], 'y', t + 0.2, tb); const one = txt(MX + 14, y + 88, '找 2050 号：只读 1 个颗粒', t + 0.2, 'lab y'); vanish(one, tb);
    gr.forEach((e, k) => classAt(e, 'on', tb + 0.2 + k * 0.06, T('f4') - 0.2)); txt(MX + 14, y + 88, '按姓名找：12208 个颗粒全要读', tb + 0.3, 'lab'); }
  // ③ 改和删：变更生成新版本 all_1_90_3_92，只有 age.bin 是新写的，其余硬链接（U01、U02）；轻量删除多一列 _row_exists（D02）
  cur = 2; { const y = Y0 + 2 * PITCH, t = T('f4') + 0.4, td = T('f4b') - 0.1;
    const fa = foldAt(g, MX + 14, y + 6, 200, 112, 'all_1_90_3', ''); css(fa.nm, { fontSize: FS, left: '10px', top: '8px' }); at(fa, t);
    ['id.bin', 'name.bin', 'age.bin'].forEach((f, r) => fileIn(fa, r, f));
    txt(MX + 226, y + 46, '→', t + 0.4, 'lab y');
    const fb = foldAt(g, MX + 260, y + 6, 226, 112, 'all_1_90_3_92', 'y'); css(fb.nm, { fontSize: FS, left: '10px', top: '8px' }); at(fb, t + 0.5);
    const nb = ['id.bin', 'name.bin', 'age.bin'].map((f, r) => fileIn(fb, r, f, r === 2 ? 'y' : ''));
    const tw = T('f4', '重写') - 0.1; css(nb[2], { fontWeight: '700' }); warm(fb, tw, tw + 1.2);
    txt(MX + 512, y + 6, '_row_exists', td, 'mono y');
    [1, 1, 1, 0, 1, 1].forEach((v, k) => { const c = box(MX + 512 + k * 36, y + 40, 32, 38, 'cs13' + (v ? ' fy' : ''), td + 0.2 + k * 0.05); c.innerHTML = '<span class="b01">' + v + '</span>'; });
    txt(MX + 512, y + 88, '清理留给合并', T('f4b', '清理') - 0.1, 'lab'); }
  // ④ 并发：Bob 的快照里只有 all_1_91_4_93；Carol 写入只添一个新片段 all_94_94_0，4 毫秒；Bob 的查询照样 3.2 秒读完（B01，第 09 章）
  cur = 3; { const y = Y0 + 3 * PITCH, t = T('f5') + 0.4, tw = T('f5', '写入') - 0.1, tn = T('f5', '互不等待') - 0.1;
    txt(MX + 14, y + 6, 'Bob 的快照', t, 'lab y'); chip(MX + 14, y + 40, 232, 'all_1_91_4_93', 'y', t + 0.15);
    txt(MX + 400, y + 6, '磁盘上现在', tw, 'lab'); chip(MX + 400, y + 40, 232, 'all_1_91_4_93', '', tw + 0.1);
    chip(MX + 400, y + 82, 232, 'all_94_94_0', 'y', tw + 0.4); sfx('pop', tw + 0.4, { g: 0.4 });
    txt(MX + 646, y + 86, '4 ms', tn, 'mono y'); txt(MX + 260, y + 45, '3.2 s', tn + 0.2, 'mono'); }
  // ⑤ 出错：先写 tmp_insert_all_91_91_0 再改名（P02，第 10 章 Dave 那一次）；有 checksums.txt；合并前的旧片段还留着（第 10 章同一组）
  cur = 4; { const y = Y0 + 4 * PITCH, t = T('f6') + 0.4, tb = T('f6b') - 0.1;
    chip(MX + 14, y + 4, 342, 'tmp_insert_all_91_91_0', 'ghost', t); txt(MX + 366, y + 8, '→', t + 0.5, 'lab y'); chip(MX + 400, y + 4, 182, 'all_91_91_0', 'y', t + 0.6); sfx('pop', t + 0.6, { g: 0.4 });
    chip(MX + 14, y + 44, 212, 'checksums.txt', 'y', T('f6', '校验和') - 0.1);
    ['all_1_1_0', 'all_2_2_0', 'all_3_3_0'].forEach((nm, k) => chip(MX + 14 + k * 168, y + 84, 156, nm, 'ghost', tb + k * 0.12));
    txt(MX + 524, y + 88, '旧片段留着', tb + 0.4, 'lab'); }
  ROWEL.forEach((els, i) => { if (i < 4) for (const e of els) classAt(e, 'dim55', ROWS[i + 1][2] - 0.1, Tend('f6b', 0.2)); });
  drift(cam, s, 1);
});
