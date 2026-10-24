// 09 没有日志的代价。主画面依次是：一次插入要改的几处（数据文件、两个索引、文件头的行数），没有日志，改到一半断电；
// 模拟现场 users_crashed（snap_06：文件里 11 行 176 字节，文件头记着 10 行 160 字节，索引 10 项，open_count = 1）；
// CHECK TABLE 逐项核对、REPAIR TABLE 重建；服务停着时用 myisamchk；打开时自动修复；先备份；最后是 ROLLBACK 撤不回。
// 回显照录 06c.out 与 9.7.4 的 out_06（FACTS「09」「新版扩充」）。
scene('s9', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const ov = overlay(world);
  const SC = R.stateCrash;
  const crash = rowsOf(R.crashMYD).map(decodeUser);

  // ── 第一站：一次插入要改动好几处 ──
  const cmd = h('div', 'abs mono', world, ''); px(cmd, 140, 128); css(cmd, { fontSize: '32px', color: '#d9d9d9' });
  appear(cmd, c0 + 0.1);
  typeText(cmd, "<span class=\"c-o\">mysql&gt;</span> <span class=\"k\">INSERT INTO</span> users <span class=\"k\">VALUES</span> (13,'olivia',31);", T('m2') - 0.3, 40, { cursorUntil: T('m3'), sfxGain: 0.5 });
  const box = (x, y, w, hh, title) => { const b = h('div', 'blk', world); px(b, x, y, w, hh); const t = h('div', 'abs mono', b, title); px(t, 20, 14); css(t, { fontSize: '28px', color: '#8a8a8a' }); return b; };
  const bD = box(140, 220, 1640, 150, 'users.MYD');
  const cellsD = [...Array(11)].map((_, i) => { const e = h('div', 'abs', bD); px(e, 20 + i * 146, 64, 138, 64); css(e, { background: i < 10 ? '#2b606c' : '#F29111' }); return e; });
  const bH = box(140, 410, 520, 210, 'users.MYI 文件头');
  const recs = h('div', 'abs mono', bH, 'records  10'); px(recs, 20, 90); css(recs, { fontSize: '36px', color: '#d9d9d9' });
  const bP = box(700, 410, 520, 210, '主键索引');
  const keysP = h('div', 'abs mono', bP, '… 10 11 12'); px(keysP, 20, 90); css(keysP, { fontSize: '36px', color: '#d9d9d9' });
  const bN = box(1260, 410, 520, 210, 'idx_name 索引');
  const keysN = h('div', 'abs mono', bN, '… mallory niaj'); px(keysN, 20, 90); css(keysN, { fontSize: '36px', color: '#d9d9d9' });
  [bD, bH, bP, bN].forEach((b, i) => wipe(b, c0 + 0.2 + i * 0.1, { dir: 'l', d: 0.4 }));
  vanish(cellsD[10], 0);
  // 讲到哪一处，哪一处亮
  const rD = ring(world, { x: 134, y: 214, w: 1652, h: 162 }), rI = ring(world, { x: 694, y: 404, w: 1092, h: 222 }), rH = ring(world, { x: 134, y: 404, w: 532, h: 222 });
  [rD, rI, rH].forEach((r) => vanish(r, 0));
  appear(rD, T('m3', '数据') - 0.15); appear(cellsD[10], T('m3', '数据') - 0.1); sfx('pop', T('m3', '数据'), { g: 0.5 });
  appear(rI, T('m3', '每一个') - 0.15); keyed(keysP).at(T('m3', '每一个'), { html: '… 10 11 12 <span class="c-o">13</span>' }); keyed(keysN).at(T('m3', '每一个') + 0.15, { html: '… mallory niaj <span class="c-o">olivia</span>' }); sfx('pop', T('m3', '每一个'), { g: 0.5 });
  appear(rH, T('m3', '行数') - 0.2); keyed(recs).at(T('m3', '行数'), { html: 'records  <span class="c-o">11</span>' }); sfx('pop', T('m3', '行数'), { g: 0.5 });
  [rD, rI, rH].forEach((r) => vanish(r, T('m4') - 0.2));
  // 不记日志
  const logB = h('div', 'abs', world); px(logB, 140, 668, 1640, 92); css(logB, { border: '3px dashed #808080' });
  // 日志：一个空着的框（什么也没有记下）
  const logT = h('div', 'abs mono', logB, 'log'); px(logT, 24, 22); css(logT, { fontSize: '32px', color: '#808080' });
  wipe(logB, T('m4') - 0.2, { dir: 'l', d: 0.5 }); sfx('error', T('m4', '日志'), { g: 0.5 });
  classAt(logB, 'bad', T('m4', '日志') - 0.1, T('m5') - 0.2);
  // 改动之间断电：数据行已写进去，索引和行数还没改
  const tCut = T('m5', '断电') - 0.1;
  const cut = h('div', 'abs', world); px(cut, 1000, 200, 6, 440); css(cut, { background: '#e5534b' });
  const cutL = h('div', 'abs', world, '断电'); px(cutL, 1018, 200); css(cutL, { font: '700 40px "Sans SC"', color: '#e5534b' });
  vanish(cut, 0); appear(cut, tCut); appear(cutL, tCut); sfx('thud', tCut, { g: 0.8 });
  keyed(keysP).at(tCut + 0.1, { html: '… 10 11 12 <span class="c-r" style="text-decoration:line-through">13</span>' });
  keyed(keysN).at(tCut + 0.1, { html: '… mallory niaj <span class="c-r" style="text-decoration:line-through">olivia</span>' });
  keyed(recs).at(tCut + 0.1, { html: 'records  10' });
  // 对不上：数据文件的第 11 格和退回 10 的行数一起标红
  classAt(cellsD[10], 'bad', tCut + 0.2, s.end); keyed(recs).at(tCut + 0.2, { cls: recs.className + ' c-r' });   // recs 已由 keyed 换内容，类名也交给 keyed（两者混用会让画面依赖播放顺序）

  // ── 第二站：模拟现场 users_crashed ──
  const BX = 2040;
  const tB = T('m6') - 0.3;
  const sT = h('div', 'abs mono', world, `users_crashed.MYD  <span class="c-o">176</span> 字节`); px(sT, BX, 128); css(sT, { fontSize: '30px', color: '#8a8a8a' });
  const sCells = crash.map((u, i) => { const e = h('div', 'abs mono', world, u.name); px(e, BX + i * 162, 180, 152, 64); css(e, { fontSize: '24px', lineHeight: '64px', textAlign: 'center', color: i === 10 ? '#0b0b0c' : '#d9d9d9', background: i === 10 ? '#F29111' : '#1f4a54' }); return e; });
  appear(sT, tB); sCells.forEach((e, i) => { if (i < 10) appear(e, tB + 0.1 + i * 0.03); }); sfx('drive', tB, { g: 0.5 });
  slide(sCells[10], T('m6', '写进') - 0.2, { y: -60, d: 0.45 }); sfx('pop', T('m6', '写进') + 0.2, { g: 0.5 });   // 新行写进数据文件
  const flds = [['records', String(SC.records[2])], ['data_file_length', String(SC.data_file_length[2])], ['open_count', String(SC.open_count[2])]];
  const fEl = flds.map(([n, v], i) => { const e = h('div', 'abs mono', world, `${n.padEnd(17)}<span class="c-o">${v}</span>`); px(e, BX, 290 + i * 54); css(e, { fontSize: '32px', color: '#d9d9d9' }); return e; });
  const fT = h('div', 'abs mono', world, 'users_crashed.MYI 文件头'); px(fT, BX, 250); css(fT, { fontSize: '26px', color: '#8a8a8a' });
  const ids = crash.slice(0, 10).map((u) => u.id).sort((a, b) => a - b);
  const idx = h('div', 'abs mono', world, `主键索引 10 项：${ids.join(' ')} <span class="c-r">（没有 13）</span>`); px(idx, BX + 800, 290); css(idx, { fontSize: '30px', color: '#d9d9d9' });
  // 文件头与索引跟数据一起在场；讲到「索引和行数还是旧的」时把它们框出来
  appear(fT, tB + 0.4); fEl.slice(0, 2).forEach((e, i) => slide(e, tB + 0.45 + i * 0.08, { x: -20, d: 0.35 })); slide(idx, tB + 0.6, { x: -20, d: 0.35 });
  for (const e of [fEl[0], idx]) keyed(e).at(T('m6b', '索引') - 0.2, { cls: e.className + ' c-r' }).at(T('m10', '重建') + 0.6, { cls: e.className });   // 这两个元素后面还要由 keyed 换内容
  sfx('tick', T('m6b', '索引'), { g: 0.5 });
  // 索引和行数还是旧的：红框框住文件头的两行与索引
  const oldH = ring(world, { x: BX - 12, y: 284, w: 560, h: 116 }, 'r'), oldI = ring(world, { x: BX + 788, y: 282, w: 900, h: 54 }, 'r');
  [oldH, oldI].forEach((r) => { vanish(r, 0); appear(r, T('m6b', '索引') - 0.2); vanish(r, T('m7') - 0.3); });
  // 终端：查不出来
  const term1 = term(world, BX, 520, 1840, 420, '<b>mysql</b>  myisam_demo');
  appear(term1.el, T('m7') - 0.6);
  const grp = (t0, t1) => { const g = h('div', 'abs', term1.body); px(g, 0, 0, 1780, 380); vanish(g, 0); appear(g, t0); if (t1) vanish(g, t1); return g; };
  const line = (g, html, row, t, snd) => { const e = h('div', 'tl', g, html); css(e, { position: 'absolute', left: 0, top: row * 43 + 'px' }); if (t != null) { vanish(e, 0); appear(e, t); sfx(snd || 'blip', t, { g: 0.3 }); } return e; };
  const typeLine = (g, sql, row, t) => { const e = line(g, '', row); const p = h('span', 'p', e, 'mysql&gt; '); const s_ = h('span', '', e); typeText(s_, sql, t, 44, { cursorUntil: t + tokenize(sql).filter((k) => k.ch).length / 44 + 0.3, sfxGain: 0.5 }); return e; };
  const g1 = grp(T('m7') - 0.5, T('m9b') - 0.4);
  typeLine(g1, '<span class="k">SELECT</span> * <span class="k">FROM</span> users_crashed <span class="k">WHERE</span> id = 13;', 0, T('m7') - 0.4);
  line(g1, '<span class="c-r">Empty set (0.00 sec)</span>', 1, T('m7', '查不出') - 0.3, 'error');
  const there = path(ov, `M ${BX + 10 * 162 - 4} 146 L ${BX + 10 * 162 + 60} 172`, 'orange', { w: 3 });
  arrowIn(there, T('m7', '明明') - 0.2, 0.4); classAt(sCells[10], 'lit-cell', T('m7', '明明') - 0.1, T('m10f') - 0.4);   // olivia 那一格：箭头指着它
  // open_count：开始修改时加一，正常关闭时减一；打开时不为零 → 需要检查
  const oc = fEl[2];
  appear(oc, T('m8') - 0.1); sfx('tick', T('m8', '计数器'), { g: 0.5 });
  const ocR = ring(world, { x: BX - 10, y: 290 + 2 * 54 - 6, w: 560, h: 54 });
  vanish(ocR, 0); appear(ocR, T('m8', '计数器') - 0.2);
  keyed(oc).at(T('m8') - 0.1, { html: `${'open_count'.padEnd(17)}<span class="c-o">0</span>` }).at(T('m8', '加一'), { html: `${'open_count'.padEnd(17)}<span class="c-o">1</span>` });
  // 两句注解各占一个元素，读到后一直留着
  // 计数器旁边只写 +1 与 −1；−1 被划掉（断电了，没走到这一步）
  const ann1 = tag(world, BX + 620, 290 + 2 * 54 + 4, '+1', 'c-o'), ann2 = tag(world, BX + 720, 290 + 2 * 54 + 4, '−1', 'c-d');
  classAt(ann2, 'struck', T('m8', '减一') + 0.6, s.end);
  appear(ann1, T('m8', '加一')); appear(ann2, T('m8', '减一')); vanish(ann1, T('m9b') - 0.3); vanish(ann2, T('m9b') - 0.3);
  sfx('blip', T('m8', '加一'), { g: 0.45 });
  classAt(ocR, 'r', T('m9', '不为零') - 0.2, T('m9b') - 0.3); sfx('error', T('m9', '检查') - 0.2, { g: 0.45 });   // 不为零：框变红
  vanish(ocR, T('m9b') - 0.3);
  // CHECK TABLE 逐项核对
  const g2 = grp(T('m9b') - 0.4, T('m10f') - 0.4);
  typeLine(g2, '<span class="k">CHECK TABLE</span> users_crashed;', 0, T('m9b') - 0.3);
  line(g2, '<span class="c-d">Msg_type  Msg_text</span>', 1, null);
  const CK = [['warning', "1 client is using or hasn't closed the table properly", '有连接在用，或没有正常关表', 'm9d'],
    ['warning', 'Size of datafile is: 176       Should be: 160', '数据文件 176 字节，应为 160', 'm9d'],
    ['error', 'Record-count is not ok; is 11   Should be: 10', '数出 11 行，记着 10 行', 'm9c'],
    ['warning', 'Found 11 key parts. Should be: 10', '索引里 11 项，应为 10', 'm9c'],
    ['error', 'Corrupt', '损坏', 'm9c']];
  const ckT = [T('m9b', '核对') + 0.2, T('m9d', '多大') - 0.1, T('m9d', '几航') - 0.1, T('m9d', '几项') - 0.1, T('m9c', '损坏') - 0.2];
  const ckR = ring(world, { x: BX + 18, y: 520 + 66 + 4 * 43 - 2, w: 1200, h: 46 }, 'r');
  vanish(ckR, 0); appear(ckR, T('m9c', '数出') - 0.1); vanish(ckR, T('m10') - 0.3);
  const ckEl = CK.map(([ty, tx, gl], i) => { const e = line(g2, `<span class="${ty === 'error' ? 'c-r' : 'c-d'}">${ty.padEnd(9)}</span> ${esc(tx)}`, 2 + i, ckT[i]); const gg = h('span', '', e, `   <span style="font-family:'Sans SC';color:#3fb4cc">${gl}</span>`); return e; });
  line(g2, '', 7, null);
  hide([g1], T('m9b') - 0.4, { y: 0, d: 0.01 });
  // 修复：重新扫描数据文件，重建索引（第二站上方动起来）
  const tFx = T('m10', '重新') - 0.2, tFx1 = T('m10', '重建') + 0.6;
  const scanR = ring(world, { x: BX - 6, y: 174, w: 164, h: 76 }, 't');
  vanish(scanR, 0); appear(scanR, tFx); vanish(scanR, tFx1 + 0.2);
  F((t) => { const k = Math.floor(clamp((t - tFx) / (tFx1 - tFx)) * 10.99); scanR.style.left = (BX - 6 + k * 162) + 'px'; });
  for (let i = 0; i < 11; i++) sfx('tick', tFx + i * (tFx1 - tFx) / 11, { g: 0.3 });
  keyed(idx).at(tFx1, { html: `主键索引 <span class="c-o">11</span> 项：${[...ids, 13].sort((a, b) => a - b).join(' ')}` });
  keyed(fEl[0]).at(tFx1, { html: `${'records'.padEnd(17)}<span class="c-o">11</span>` });
  keyed(fEl[1]).at(tFx1, { html: `${'data_file_length'.padEnd(17)}<span class="c-o">176</span>` });
  keyed(oc).at(tFx1, { html: `${'open_count'.padEnd(17)}<span class="c-o">0</span>` });
  sfx('pop', tFx1, { g: 0.5 });
  // REPAIR TABLE 的报告；那一行又找得到了
  const g3 = grp(T('m10f') - 0.4, null);
  typeLine(g3, '<span class="k">REPAIR TABLE</span> users_crashed;', 0, T('m10f') - 0.3);
  line(g3, `<span class="c-d">warning  </span> Number of rows changed from 10 to 11   <span style="font-family:'Sans SC';color:#3fb4cc">行数从 10 改成 11</span>`, 1, T('m10f', '报告') + 0.1);
  line(g3, `<span class="c-t">status   </span> OK`, 2, T('m10f', '报告') + 0.3, 'tick');
  typeLine(g3, '<span class="k">SELECT</span> * <span class="k">FROM</span> users_crashed <span class="k">WHERE</span> id = 13;', 3, T('m10f', '报告') + 1.0);
  line(g3, '| 13 | <span class="c-o">olivia</span> |  31 |', 4, T('m10g') - 0.2);
  line(g3, '1 row in set (0.00 sec)', 5, T('m10g') - 0.1, 'tick');
  sfx('chime', T('m10g', '找得到'), { g: 0.45 });
  vanish(there, T('m10f') - 0.4);

  // ── 第三站：服务停着时用 myisamchk；打开表时自动修复；修复前先备份 ──
  const EX = 4100;
  const stopped = h('div', 'abs mono', world, 'mysqld <span class="c-r">已停止</span>'); px(stopped, EX, 150); css(stopped, { fontSize: '32px', color: '#8a8a8a' });
  const sh = h('div', 'blk mono', world); px(sh, EX, 220, 1700, 84); css(sh, { fontSize: '32px', lineHeight: '80px', paddingLeft: '24px' });
  const shIn = h('span', '', sh);
  const fM = h('div', 'blk mono', world, 'users_crashed.MYD'); px(fM, EX + 300, 400, 480, 84); css(fM, { fontSize: '32px', lineHeight: '80px', textAlign: 'center', color: '#3fb4cc' });
  const fI = h('div', 'blk mono', world, 'users_crashed.MYI'); px(fI, EX + 900, 400, 480, 84); css(fI, { fontSize: '32px', lineHeight: '80px', textAlign: 'center', color: '#3fb4cc' });
  const tE = T('m10h') - 0.3;
  appear(stopped, tE); appear(sh, tE);
  typeText(shIn, '<span class="c-o">myisamchk</span>  直接检查、修复表的文件', T('m10h', 'my isam') - 0.3, 24, { cursorUntil: T('m10k') + 0.6, sfxGain: 0.5 });
  const aM = path(ov, `M ${EX + 700} 310 L ${EX + 540} 394`, 'teal', { w: 3 }), aI = path(ov, `M ${EX + 760} 310 L ${EX + 1140} 394`, 'teal', { w: 3 });
  wipe(fM, tE + 0.3, { dir: 'l', d: 0.35 }); wipe(fI, tE + 0.45, { dir: 'l', d: 0.35 });   // 两个文件到站就在
  // myisamchk 直接读这两个文件：框里的检查进度从左往右扫过
  [fM, fI].forEach((f, i) => { const bar = h('div', 'abs', f); px(bar, 0, 0, 0, 80); css(bar, { background: '#3fb4cc', opacity: '0.18' });
    const a = T('m10h', 'my isam') + 0.6 + i * 0.4, b = T('m10k', '修复') + 0.2; F((t) => { bar.style.width = (480 * clamp((t - a) / (b - a))) + 'px'; }); });
  arrowIn(aM, T('m10k', '检查') - 0.2, 0.35); arrowIn(aI, T('m10k', '修复') - 0.2, 0.35); sfx('pop', T('m10k', '修复'), { g: 0.5 });
  const cfg = h('div', 'blk mono', world); px(cfg, EX, 560, 820, 130); css(cfg, { fontSize: '30px', padding: '20px 24px', whiteSpace: 'pre', lineHeight: '1.45' });
  cfg.innerHTML = '<span class="c-d">启动 mysqld 时设置</span>\n<span class="c-o">myisam_recover_options</span>';   // 只写 FACTS 里有的：设置这个变量即开启；不写具体取值
  const flow = h('div', 'abs', world, '打开表 → open_count 不为 0 → 自动修复'); px(flow, EX + 880, 600); css(flow, { font: '500 34px "Sans SC"', color: '#d9d9d9' });
  wipe(cfg, T('m10i') - 0.2, { dir: 'l', d: 0.45 }); sfx('blip', T('m10i'), { g: 0.4 });
  appear(flow, T('m10i', '发现') - 0.2); keyed(flow).at(T('m10i', '自动'), { html: '打开表 → open_count 不为 0 → <span class="c-o">自动修复</span>' }); sfx('pop', T('m10i', '自动'), { g: 0.5 });
  // 先备份：两个文件各复制出一份（虚线框），再修
  const cM = h('div', 'abs mono', world, 'users_crashed.MYD'), cI = h('div', 'abs mono', world, 'users_crashed.MYI');
  [[cM, EX + 300], [cI, EX + 900]].forEach(([e, x]) => { px(e, x, 760, 480, 84); css(e, { fontSize: '30px', lineHeight: '80px', textAlign: 'center', color: '#808080', border: '2px dashed #808080' }); });
  const cpL = h('div', 'abs mono', world, 'backup/'); px(cpL, EX + 60, 784); css(cpL, { fontSize: '30px', color: '#808080' });
  fromTo(cM, T('m10j', '备份') - 0.3, { y: -360, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
  fromTo(cI, T('m10j', '备份') - 0.15, { y: -360, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
  appear(cpL, T('m10j', '备份') - 0.3); sfx('tick', T('m10j', '备份'), { g: 0.5 });

  // ── 第四站：也没有事务。ROLLBACK 只回一句警告，改过的值留在文件里 ──
  const FX = 6160;
  const eng = h('div', 'abs mono', world); px(eng, FX, 140); css(eng, { fontSize: '30px', color: '#d9d9d9', whiteSpace: 'pre', lineHeight: '1.45' });
  eng.innerHTML = '<span class="c-d">SHOW ENGINES（节选）</span>\n<span class="c-d">Engine   Transactions  XA   Savepoints</span>\nMyISAM   <span class="c-r">NO</span>            <span class="c-r">NO</span>   <span class="c-r">NO</span>';
  const engR = ring(world, { x: FX + 150, y: 140 + 2 * 43.5 - 4, w: 62, h: 50 }, 'r');   // Transactions 那一列的 NO
  wipe(eng, T('m10b') - 0.3, { dir: 'l', d: 0.5 }); vanish(engR, 0); appear(engR, T('m10b', '事务') - 0.1); sfx('error', T('m10b', '事务'), { g: 0.45 });
  const engG = tag(world, FX + 900, 140 + 2 * 43.5 + 8, 'Transactions：事务', 'c-t'); appear(engG, T('m10b', '事务'));   // 英文列名的中文释义（F11）
  const t2 = term(world, FX, 360, 1700, 520, '<b>mysql</b>  9.7.4');
  appear(t2.el, T('m10c') - 0.9);
  const tc = T('m10c') - 0.8;
  t2.cmd('<span class="k">START TRANSACTION</span>;', tc, { cps: 60 });
  t2.cmd('<span class="k">UPDATE</span> users <span class="k">SET</span> age=43 <span class="k">WHERE</span> id=2050;', tc + 0.45, { cps: 60 });
  t2.cmd('<span class="k">ROLLBACK</span>; <span class="k">SHOW WARNINGS</span>;', T('m10c', 'roll') - 0.2, { cps: 50 });
  t2.line('<span class="c-d">Level    Code  Message</span>', T('m10c', '警告') - 0.2, { sfx: false });
  t2.line("Warning  <span class=\"c-r\">1196</span>  Some non-transactional changed tables couldn't be rolled back", T('m10c', '警告'), { snd: 'error' });
  const gl = tag(world, FX + 26, 360 + 66 + 5 * 43 + 8, '有些不支持事务的表，没法回滚', 'c-t'); appear(gl, T('m10e') - 0.1);
  t2.row(7);
  t2.cmd('<span class="k">SELECT</span> age <span class="k">FROM</span> users <span class="k">WHERE</span> id=2050;', T('m10d') - 0.5, { cps: 60 });
  t2.line('| <span class="c-o">43</span> |   <span style="font-family:\'Sans SC\';color:#F29111">没有回到 42</span>', T('m10d', '原样') - 0.1, { snd: 'pop' });
  // 收束：撤不回的那句警告与留下的 43 一起框出来
  const endR = ring(world, { x: FX + 14, y: 360 + 66 + 4 * 43 - 4, w: 1672, h: 50 }, 'r'), endR2 = ring(world, { x: FX + 14, y: 360 + 66 + 8 * 43 - 4, w: 520, h: 50 }, 'r');
  vanish(endR, 0); vanish(endR2, 0); appear(endR, T('m11', '不能') - 0.1); appear(endR2, T('m11', '崩溃') - 0.1);
  sfx('thud', T('m11', '不能'), { g: 0.5 }); sfx('thud', T('m11', '崩溃'), { g: 0.5 });

  track(cam, s.start, { x: 960, y: 520, z: 1 }, [
    [c0 + 0.1, { x: 1000, z: 1.06 }, T('m6') - c0 - 0.6, { ease: 'none', sfx: false }],
    [T('m6') - 0.3, { x: BX + 900, y: 520, z: 1 }, 1.1, { g: 0.5 }],   // 这一站横向撑满：靠整体的 0.95 倍留出页边
    [T('m8') - 0.3, { x: BX + 700, y: 380, z: 1.15 }, 0.9, { sfx: false }],
    [T('m9') - 0.2, { x: BX + 560, y: 430, z: 1.25 }, 1.2, { sfx: false }],
    [null, { x: BX + 660, z: 1.3 }, T('m9b') - T('m9') - 1.9, { ease: 'none', sfx: false }],
    [T('m9b') - 0.4, { x: BX + 920, y: 640, z: 1.02 }, 0.9, { sfx: false }],
    [null, { x: BX + 820, y: 660, z: 1.1 }, T('m10') - T('m9b') - 1.7, { ease: 'none', sfx: false }],
    [T('m10') - 0.4, { x: BX + 920, y: 470, z: 1.02 }, 0.8, { sfx: false }],   // 上方扫描与下方 CHECK 报告都留在两条带之间
    [T('m10f') - 0.5, { x: BX + 920, y: 640, z: 1.02 }, 0.8, { sfx: false }],
    [Tend('m10g') + 0.9, { x: EX + 860, y: 520, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.03 }, T('m10b') - Tend('m10g') - 1.6, { ease: 'none', sfx: false }],
    [T('m10b') - 0.5, { x: FX + 860, y: 560, z: 0.98 }, 1.1, { g: 0.5 }],
    [null, { z: 1.0 }, s.end - T('m10b') - 0.8, { ease: 'none', sfx: false }],
  ]);
});
