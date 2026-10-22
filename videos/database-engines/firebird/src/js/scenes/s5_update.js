// 05 更新记录，保存回溯版本：实验 08 的 UPDATE users SET age = 31 WHERE id = 1，前后两份快照的真实字节。
// 主画面：同一条记录的 32 个字节——旧内容先另存（金色），主记录改写事务号、年龄与回溯指针（橙色），回溯指针连到 8 号槽的差量版本。
scene('update', ({ root, s, c0 }) => {
  const SW = 1920;
  const { world, under, over } = stage(root, SW * 5, 1080);
  const cam = makeCamera(world);
  const R = FB.record_layout, PB = FB.page_map.clean_before.data_page_231, PA = FB.page_map.clean_after.data_page_231;
  const ORIG = R.original.record_hex.match(/../g), CUR = R.current.record_hex.match(/../g), HIST = R.historical_delta.record_hex.match(/../g);
  const CW = 96;

  // ── 站 0：读进当前记录 → 另存旧内容 → 改写 ──
  const sql = tx(world, 'm1', '', 120, 160, { fontWeight: 600 });
  typeText(sql, 'UPDATE users SET age = 31 WHERE id = 1;', c0 + 0.05, 32, { cursorUntil: c0 + 1.7, sfxGain: 0.4 });
  during(sql, c0 + 0.05, 1e9);
  const RX = 120, RY = 300;
  const recT = tx(world, 't4', '0 号槽的当前记录', RX, RY - 64, { fontWeight: 500 });
  const cells = ORIG.map((v, i) => {
    const e = h('div', 'byte ' + (i < 13 ? 'hdr' : (i >= 30 ? 'cur-rec' : '')), world, v);
    px(e, RX + (i % 16) * CW, RY + Math.floor(i / 16) * 110, CW - 8, 80); e.style.fontSize = '40px';
    return e;
  });
  const tRead = T('u1', '读进来') - 0.4;
  appear(recT, tRead); cells.forEach((e, i) => appear(e, tRead + i * 0.02)); sfx('tick', tRead, { g: 0.4 }); sfx('tick', tRead + 0.3, { g: 0.35 });
  // u2：旧内容另存为回溯版本（金色的一份落到下方）
  const tU2 = T('u2');
  const histT = tx(world, 't4', '回溯版本（旧内容）', RX, 620, { fontWeight: 500 });
  const ghost = blk(world, 'hist-rec', '', RX, RY, 16 * CW - 8, 190); ghost.dataset.name = '旧内容的副本';
  const hist = blk(world, 'hist-rec', '', RX, 680, 16 * CW - 8, 120); hist.dataset.name = '回溯版本';
  const histX = tx(hist, 'm2', '年龄 30 · 事务号 2', 30, 36, { color: C.ink });
  const tCopy = T('u2', '另存') - 0.2;
  tl.fromTo(ghost, { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.2, immediateRender: true }, tCopy);
  tl.to(ghost, { y: 380, height: 120, autoAlpha: 1, duration: 0.7, ease: 'power3.inOut' }, tCopy + 0.2);
  vanish(ghost, tCopy + 0.95); appear(hist, tCopy + 0.95); appear(histT, tCopy + 0.9);
  sfx('whoosh', tCopy + 0.2, { g: 0.3 }); sfx('thud', tCopy + 0.9, { g: 0.6 });
  // u3：主记录写入新值、新事务号
  const tU3 = T('u3');
  const tAge = T('u3', '新值') - 0.1, tTx = T('u3', '事务号') - 0.1;
  swapAt(cells[30], ORIG[30], CUR[30], tAge); sfx('pop', tAge, { g: 0.6, p: 0.5 });
  const ageL = tx(world, 't4 b', '年龄 30 → 31', RX + 14 * CW - 120, RY + 110 + 96, { color: C.ink });
  wipe(ageL, tAge + 0.1, { dir: 'l', d: 0.35 });
  [0, 1, 2, 3].forEach((i) => swapAt(cells[i], ORIG[i], CUR[i], tTx));
  const txBox = blk(world, 'tx', '', RX - 6, RY - 6, 4 * CW + 4, 92); appear(txBox, tTx);
  sfx('pop', tTx, { g: 0.6, p: -0.5 });
  // u3a：事务号 2 → 11（大字）
  const tU3a = T('u3a');
  const big = tx(world, 'lat', '', RX, RY + 230, { fontSize: '96px', fontWeight: 700, color: C.ink });
  appear(big, T('u3a', '二') - 0.1); keyed(big).at(T('u3a', '二') - 0.1, { html: '事务号 2' }).at(T('u3a', '十一') - 0.1, { html: '事务号 2 <span style="color:#3A434B">→</span> 11' });
  sfx('thud', T('u3a', '十一'), { g: 0.6 });
  F((t) => { big.style.visibility = (t >= T('u3a', '二') - 0.1 && t < T('u4') - 0.1) ? 'visible' : 'hidden'; });
  F((t) => { const on = t >= T('u3a', '二') - 0.1 && t < T('u4') - 0.1; hist.style.visibility = on ? 'hidden' : ''; histT.style.visibility = on ? 'hidden' : ''; });
  // u4：回溯页号和槽号连到旧版本
  const tU4 = T('u4');
  const tBk = T('u4', '回溯') - 0.1;
  [4, 5, 6, 7, 8, 9].forEach((i) => swapAt(cells[i], ORIG[i], CUR[i], tBk + (i - 4) * 0.05));
  [4, 5, 6, 7, 8, 9].forEach((i) => classAt(cells[i], 'sel', tBk, s.end));
  sfx('blip', tBk, { g: 0.5 });
  const bkL = tx(world, 't4', '回溯 → 第 231 页 · 8 号槽', RX + 4 * CW, RY - 64, { fontWeight: 700, color: C.teal });
  wipe(bkL, tBk + 0.2, { dir: 'l', d: 0.4 }); vanish(recT, tBk + 0.2);
  const link = arrow(over, [[RX + 7 * CW, RY + 86], [RX + 7 * CW, 672]], 'teal', { w: 5 });
  drawIn(link, T('u4', '连到') - 0.2, 0.45); sfx('tick', T('u4', '旧版本'), { g: 0.5 });
  swapAt(histX, '年龄 30 · 事务号 2', '8 号槽 · 年龄 30 · 事务号 2', T('u4', '旧版本') - 0.1);

  // ── 站 1：第 231 页——页尾 384 字节放大（32 列 × 12 行），看 0 号槽的记录搬到新位置、8 号槽放进差量 ──
  const X1 = SW, PX = X1 + 120;
  const ownS = (b) => { if (b < 24) return 'hdr'; if (b < 24 + PA.slot_bytes) return 'slot'; for (const sl of PA.slots) if (b >= sl.offset && b < sl.offset + sl.length && sl.line !== 0 && sl.line !== 8) return 'rec'; return 'free'; };
  const mini = pageGrid(world, PX, 250, ownS, { hdr: C.ink, slot: C.g4, rec: C.g3, free: C.g1 }, { cols: 128, cs: 3, name: '第 231 页（缩略）' });
  const pgT = tx(world, 't3', '第 231 页 · 页尾放大', PX, 170, { fontWeight: 700 });
  const T0 = 7808, TC = 32, TS = 26, TY = 520;
  const tail = pageGrid(world, PX, TY, (b) => ownS(b + T0), { hdr: C.ink, slot: C.g4, rec: C.g3, free: C.g1 }, { cols: TC, cs: TS, gap: 2, n: 8192 - T0, name: '页尾 384 字节' });
  const lens = blk(world, '', '', PX - 2, 250 + 61 * 3 - 2, 128 * 3 + 4, 3 * 3 + 4, { outline: '3px solid ' + C.ink }); lens.dataset.name = '放大的范围';
  const lensA = arrow(over, [[PX + 192, 250 + 64 * 3 + 6], [PX + 192, TY - 10]], 'ink', { head: false });
  const at = (b) => ({ x: PX + ((b - T0) % TC) * TS, y: TY + Math.floor((b - T0) / TC) * TS });
  const rangeBlk = (b0, len, cls, name) => {           // 一段字节，按行拆成几块
    const out = []; let b = b0;
    while (b < b0 + len) { const p = at(b), n = Math.min(b0 + len - b, TC - ((b - T0) % TC)); const e = blk(world, cls, '', p.x, p.y, n * TS - 2, TS - 2); e.dataset.name = name; out.push(e); b += n; }
    return out;
  };
  const oldBlk = rangeBlk(PB.slots[0].offset, 32, 'cur-rec', 'Alice 的记录（更新前）');
  const newBlk = rangeBlk(PA.slots[0].offset, 32, 'cur-rec', 'Alice 的记录（当前）');
  const histBlk = rangeBlk(PA.slots[8].offset, 22, 'hist-rec', '8 号槽的历史版本');
  const freed = rangeBlk(PB.slots[0].offset, 32, '', '原位置（已腾出）'); freed.forEach((e) => css(e, { outline: '3px dashed ' + C.g4, outlineOffset: '-3px' }));
  const SX = X1 + 1120, SY = 250;
  const sRows = PA.slots.map((sl, i) => {
    const y = SY + i * 66;
    const no = blk(world, 'chip g lat', String(sl.line), SX, y, 80, 54, { fontSize: '30px' });
    const dec = tx(world, 'lat', `${sl.offset} · ${sl.length}`, SX + 110, y + 4, { fontSize: '34px', color: i === 0 || i === 8 ? C.ink : C.g4, fontWeight: i === 0 || i === 8 ? 700 : 400 });
    return { no, dec };
  });
  classAt(sRows[0].no, 'cur-rec', 0, s.end); classAt(sRows[8].no, 'hist-rec', 0, s.end);
  const sHd = tx(world, 't5', '槽号 · 偏移 · 长度', SX, SY - 50);
  const tU5 = T('u5');
  const tGo1 = tU5 - 0.5;
  wipe(pgT, tGo1 + 0.3, { dir: 'l', d: 0.4 }); wipe(mini.img, tGo1 + 0.35, { dir: 't', d: 0.5 }); appear(lens, tGo1 + 0.7); drawIn(lensA, tGo1 + 0.75, 0.3);
  wipe(tail.img, tGo1 + 0.85, { dir: 't', d: 0.5 }); sfx('drive', tGo1 + 0.4, { g: 0.2 });
  appear(sHd, tGo1 + 0.4);
  // 槽表：先显示更新前的 0 号槽（8160），读到「新位置」时换成 7880；8 号槽在读到「八号」时出现
  const tNew = T('u6', '新位置') - 0.3, tH8 = T('u6', '八号') - 0.3;
  sRows.forEach((r, i) => { if (i === 8) return; appear(r.no, tGo1 + 0.5 + i * 0.05); appear(r.dec, tGo1 + 0.55 + i * 0.05); });
  swapAt(sRows[0].dec, `${PB.slots[0].offset} · 32`, `${PA.slots[0].offset} · 32`, tNew + 0.4);
  slide(sRows[8].no, tH8, { x: 40, d: 0.4, ease: 'power3.out' }); appear(sRows[8].dec, tH8 + 0.1);
  oldBlk.forEach((e) => { appear(e, tGo1 + 0.9); vanish(e, tNew + 0.05); });
  newBlk.forEach((e, i) => { appear(e, tNew); tl.fromTo(e, { x: oldBlk[0] ? (at(PB.slots[0].offset).x - at(PA.slots[0].offset).x) : 0, y: at(PB.slots[0].offset).y - at(PA.slots[0].offset).y + (i ? -TS : 0) }, { x: 0, y: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, tNew); });
  freed.forEach((e) => appear(e, tNew + 0.8));
  histBlk.forEach((e) => wipe(e, tH8 + 0.1, { dir: 'l', d: 0.35 }));
  sfx('whoosh', tNew, { g: 0.3 }); sfx('pop', tNew + 0.8, { g: 0.55 }); sfx('pop', tH8 + 0.15, { g: 0.55 });
  const pNew = at(PA.slots[0].offset), pH = at(PA.slots[8].offset), pOld = at(PB.slots[0].offset);
  const a0 = arrow(over, [[SX - 10, SY + 27], [SX - 60, SY + 27], [SX - 60, pNew.y + 13], [pNew.x + 8 * TS + 4, pNew.y + 13]], 'flame', { w: 5 });
  drawIn(a0, tNew + 0.75, 0.45); classAt(sRows[0].dec, 'b', T('u5', '入口') - 0.2, s.end); sfx('tick', T('u5', '入口'), { g: 0.5 });
  const a8 = arrow(over, [[SX - 10, SY + 8 * 66 + 27], [SX - 40, SY + 8 * 66 + 27], [SX - 40, pH.y + 13], [pH.x + 24 * TS + 4, pH.y + 13]], 'gold', { w: 5 });
  drawIn(a8, tH8 + 0.2, 0.5);
  const nL = tx(world, 't4 b', `新位置 ${PA.slots[0].offset}`, pNew.x + 300, TY - 60); wipe(nL, tNew + 0.6, { dir: 'l', d: 0.35 });
  const oL = tx(world, 't5', `原位置 ${PB.slots[0].offset} 已腾出`, pOld.x, pOld.y + TS + 10); appear(oL, tNew + 0.9);
  // u7：索引里的记录号不变
  const tU7 = T('u7');
  const idx = blk(world, 'chip w', '<span class="mono" style="font-size:32px;margin-right:30px">alice</span>→ 记录号 0', PX + 560, 880, 480, 72, { fontSize: '32px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
  const same = blk(world, 'sel', '不变', PX + 1060, 880, 140, 72, { fontSize: '34px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const idxL = tx(world, 't5', '姓名索引的叶子', PX + 560, 836);
  wipe(idx, tU7 - 0.1, { dir: 'l', d: 0.4 }); appear(idxL, tU7); slam(same, T('u7', '不必') - 0.1, { from: 1.25 }); sfx('thud', T('u7', '不必'), { g: 0.5 });

  // ── 站 2：8 号槽里的差量，以及还原 ──
  const X2 = SW * 2, DX = X2 + 120;
  const dT = tx(world, 't3', '8 号槽 · 历史版本 · 22 字节', DX, 170, { fontWeight: 700 });
  const hc = HIST.map((v, i) => { const e = h('div', 'byte ' + (i < 13 ? 'hdr' : 'hist-rec'), world, v); px(e, DX + i * 76, 250, 70, 70); e.style.fontSize = '30px'; return e; });
  const tU8 = T('u8');
  const tGo2 = tU8 - 0.5;
  wipe(dT, tGo2 + 0.3, { dir: 'l', d: 0.4 }); hc.forEach((e, i) => appear(e, tGo2 + 0.4 + i * 0.025)); sfx('tick', tGo2 + 0.5, { g: 0.4 });
  const dL = field(world, DX + 13 * 76, 330, 9 * 76 - 6, '差量', { cls: 't4', textColor: C.ink });
  wipe(dL.ln, T('u8', '差量') - 0.15, { dir: 'l', d: 0.3 }); wipe(dL.lb, T('u8', '差量') - 0.05, { dir: 'l', d: 0.3 }); sfx('pop', T('u8', '差量'), { g: 0.5, p: 0.3 });
  // u8a：比较长度
  const tU8a = T('u8a');
  const barD = blk(world, 'hist-rec', '', DX, 470, 22 * 30, 64), barF = blk(world, 'panel', '', DX, 560, 32 * 30, 64);
  const barDL = tx(world, 't4', '差量版本 22 字节', DX + 22 * 30 + 24, 474), barFL = tx(world, 't4', '整份旧记录 32 字节', DX + 32 * 30 + 24, 564, { color: C.g4 });
  tl.fromTo(barD, { width: 0 }, { width: 660, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('u8a', '差量') - 0.2);
  tl.fromTo(barF, { width: 0 }, { width: 960, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('u8a', '整份') - 0.2);
  appear(barDL, T('u8a', '差量') + 0.2); appear(barFL, T('u8a', '整份') + 0.2); sfx('tick', T('u8a', '差量'), { g: 0.4, p: -0.3 }); sfx('tick', T('u8a', '整份'), { g: 0.4, p: 0.2 });
  const shorter = blk(world, 'sel', '取短的', DX + 22 * 30 + 330, 470, 150, 64, { fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  wipe(shorter, T('u8a', '长度'), { dir: 'l', d: 0.3 }); sfx('tick', T('u8a', '长度'), { g: 0.5 });
  // u8b：差量的读法：d0 = 跳过 48 字节；02 = 接着写回 2 字节 1e 00
  const tU8b = T('u8b');
  const k1 = field(world, DX + 13 * 76, 330, 70, 'd0：跳过 48 字节', { cls: 't5', textColor: C.ink });
  const k2 = field(world, DX + 14 * 76, 380, 3 * 76 - 6, '02：写回 2 字节 1e 00', { cls: 't5', textColor: C.ink });
  [k1, k2].forEach((f, i) => { const t = T('u8b', i ? '补回' : '跳过') - 0.15; wipe(f.ln, t, { dir: 'l', d: 0.3 }); wipe(f.lb, t + 0.05, { dir: 'l', d: 0.3 }); });
  vanish(dL.lb, T('u8b', '跳过') - 0.2);
  [hc[13]].forEach((e) => classAt(e, 'sel', T('u8b', '跳过') - 0.15, T('u9')));
  [hc[14], hc[15], hc[16]].forEach((e) => classAt(e, 'sel', T('u8b', '补回') - 0.15, T('u9')));
  F((t) => { const on = t >= tU8b - 0.3; [barD, barF, barDL, barFL, shorter].forEach((e) => { e.style.opacity = on ? 0.18 : ''; }); });
  // u9–u10：应用到当前记录（解压后 50 字节），偏移 48 的 1f 00 换回 1e 00，与原记录逐字节一致
  const U = R.current.payload_hex.match(/../g), O = R.original.payload_hex.match(/../g);
  const ux = DX, uy = 700, ucw = 32;
  const strip = U.map((v, i) => { const e = h('div', 'byte', world, ''); px(e, ux + i * ucw, uy, ucw - 3, 70); e.style.fontSize = '22px'; return e; });
  [48, 49].forEach((i) => { strip[i].textContent = U[i]; classAt(strip[i], 'cur-rec', 0, s.end); });
  const stripL = tx(world, 't5', '当前记录解压后 50 字节', ux, uy - 46, { color: C.ink });
  const skip = arrow(over, [[ux, uy + 96], [ux + 48 * ucw - 6, uy + 96]], 'ink');
  const skipL = tx(world, 't5', '跳过 48 字节', ux + 600, uy + 110);
  const tU9 = T('u9');
  appear(stripL, tU9 - 0.3); strip.forEach((e, i) => appear(e, tU9 - 0.3 + i * 0.01));
  drawIn(skip, T('u9', '应用') - 0.1, 0.8); appear(skipL, T('u9', '应用') + 0.3); sfx('whoosh', T('u9', '应用'), { g: 0.25 });
  const tRestore = T('u9', '还原') - 0.1;
  [48, 49].forEach((i) => { swapAt(strip[i], U[i], O[i], tRestore); classAt(strip[i], 'hist-rec', tRestore, s.end); });
  sfx('pop', tRestore, { g: 0.6 });
  const tU10 = T('u10');
  const eq = blk(world, 'sel', '与更新前逐字节一致', ux + 1000, uy + 110, 560, 72, { fontSize: '34px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  slam(eq, T('u10', '一致') - 0.4, { from: 1.15 }); sfx('chime', T('u10', '一致'), { g: 0.7 });

  // ── 站 3：与前集对照：InnoDB 的 undo、PostgreSQL 的堆里多份行版本、Firebird 的回溯差量 ──
  const X3 = SW * 3;
  const cols = [['InnoDB', 120], ['PostgreSQL', 720], ['Firebird', 1320]];
  const heads = cols.map(([n, x]) => tx(world, 't3 b lat', n, X3 + x, 170));
  // InnoDB：行 + 回滚指针 → undo 记录
  const iRow = blk(world, 'cur-rec', '', X3 + 120, 280, 460, 80), iU = blk(world, 'panel', '', X3 + 120, 470, 460, 80);
  tx(iRow, 't5', '当前行 · 回滚指针', 20, 22, { color: C.ink }); tx(iU, 't5', 'undo：重建旧值的信息', 20, 22, { color: C.ink });
  const iA = arrow(over, [[X3 + 350, 360], [X3 + 350, 462]], 'ink');
  // PostgreSQL：堆页里两份独立的行版本
  const pHeap = blk(world, 'panel', '', X3 + 720, 280, 460, 270); tx(pHeap, 't5', '堆页', 20, 14);
  const pgOld = blk(pHeap, 'hist-rec', '', 20, 70, 420, 70), pgNew = blk(pHeap, 'cur-rec', '', 20, 170, 420, 70);
  tx(pgOld, 't5', '旧版本（完整一行）', 16, 18, { color: C.ink }); tx(pgNew, 't5', '新版本（完整一行）', 16, 18, { color: C.ink });
  // Firebird：当前记录 → 回溯差量
  const fCur = blk(world, 'cur-rec', '', X3 + 1320, 280, 460, 80), fBack = blk(world, 'hist-rec', '', X3 + 1320, 470, 300, 80);
  tx(fCur, 't5', '当前记录 · 回溯指针', 20, 22, { color: C.ink }); tx(fBack, 't5', '回溯版本（差量）', 20, 22, { color: C.ink });
  const fA = arrow(over, [[X3 + 1470, 360], [X3 + 1470, 462]], 'teal');
  const tU11 = T('u11'), tU12 = T('u12');
  [heads[0], iRow].forEach((e, i) => wipe(e, tU11 - 0.4 + i * 0.1, { dir: 'l', d: 0.35 })); drawIn(iA, T('u11', 'undo') - 0.3, 0.3); wipe(iU, T('u11', 'undo') - 0.1, { dir: 'l', d: 0.35 });
  [heads[1], pHeap].forEach((e, i) => wipe(e, tU12 - 0.2 + i * 0.1, { dir: 'l', d: 0.35 })); appear(pgOld, T('u12', '独立') - 0.2); appear(pgNew, T('u12', '独立'));
  [heads[2], fCur, fBack].forEach((e, i) => wipe(e, tU11 + 0.3 + i * 0.12, { dir: 'l', d: 0.35 })); drawIn(fA, tU11 + 0.5, 0.3);
  sfx('tick', T('u11', 'undo'), { g: 0.45, p: -0.5 }); sfx('tick', T('u12', '独立'), { g: 0.45 });
  // u13–u14：读取从当前版本开始；不可见就沿回溯指针找
  const rdr = blk(world, 'chip ink', '先开始的读事务', X3 + 120, 700, 420, 86, { fontSize: '32px' });
  const v1 = blk(world, 'cur-rec', '<span class="lat" style="font-size:30px;padding-left:18px">事务 11 · 年龄 31</span>', X3 + 720, 700, 460, 86, { display: 'flex', alignItems: 'center' });
  const v0 = blk(world, 'hist-rec', '<span class="lat" style="font-size:30px;padding-left:18px">事务 2 · 年龄 30</span>', X3 + 1320, 700, 460, 86, { display: 'flex', alignItems: 'center' });
  const r1 = arrow(over, [[X3 + 540, 743], [X3 + 712, 743]], 'ink'), r2 = arrow(over, [[X3 + 1180, 743], [X3 + 1312, 743]], 'teal', { w: 5 });
  const no = tx(world, 't4 b', '不可见', X3 + 760, 800), yes = tx(world, 't4 b', '可见', X3 + 1360, 800, { color: C.teal });
  const tU13 = T('u13'), tU14 = T('u14');
  wipe(rdr, tU13 - 0.2, { dir: 'l', d: 0.35 }); drawIn(r1, T('u13', '当前') - 0.2, 0.3); wipe(v1, T('u13', '当前'), { dir: 'l', d: 0.35 });
  appear(no, T('u13', '判断') + 0.2); sfx('error', T('u13', '判断') + 0.2, { g: 0.35 });
  drawIn(r2, T('u14', '回溯') - 0.2, 0.4); wipe(v0, T('u14', '回溯'), { dir: 'l', d: 0.35 }); appear(yes, T('u14', '继续') + 0.1); sfx('chime', T('u14', '继续') + 0.1, { g: 0.5 });

  // ── 站 4：回收；长事务拖住回收，版本链越积越长 ──
  const X4 = SW * 4;
  const gT = tx(world, 't3', '旧版本的回收', X4 + 120, 170, { fontWeight: 700 });
  const chainCur = blk(world, 'cur-rec', '<span class="lat" style="font-size:30px;padding-left:18px">当前记录</span>', X4 + 120, 300, 360, 86, { display: 'flex', alignItems: 'center' });
  const olds = [0, 1, 2, 3, 4].map((i) => blk(world, 'hist-rec', '', X4 + 560 + i * 230, 300, 190, 86));
  const links = [0, 1, 2, 3, 4].map((i) => arrow(over, [[X4 + 480 + (i ? 190 + 230 * (i - 1) + 80 : 0), 343], [X4 + 552 + i * 230, 343]], 'ink'));
  const tU15 = T('u15'), tU16 = T('u16');
  wipe(gT, tU15 - 0.4, { dir: 'l', d: 0.4 }); wipe(chainCur, tU15 - 0.3, { dir: 'l', d: 0.35 }); appear(olds[0], tU15 - 0.2); drawIn(links[0], tU15 - 0.2, 0.25);
  const nobody = tx(world, 't4', '没有事务再需要它', X4 + 560, 410, { color: C.g4 }); appear(nobody, T('u15', '无人') - 0.2);
  tl.to(olds[0], { scaleX: 0, transformOrigin: '0 50%', duration: 0.45, ease: 'power2.in' }, T('u15', '回收') - 0.1); to(links[0], T('u15', '回收') - 0.1, { opacity: 0, duration: 0.3 });
  vanish(nobody, T('u15', '回收') + 0.6); sfx('pop', T('u15', '回收'), { g: 0.5 });
  // 长事务：一根长条压住时间，链一节节加长
  const longTx = blk(world, 'tx', '', X4 + 120, 560, 0, 70); longTx.dataset.name = '长事务';
  const longL = tx(longTx, 't4', '长事务', 20, 12, { color: C.ink });
  appear(longTx, tU16 - 0.2); tl.fromTo(longTx, { width: 240 }, { width: 1640, duration: Math.max(1, Tend('u16') - tU16 + 0.6), ease: 'none', immediateRender: true }, tU16 - 0.2);
  const tGrow = T('u16', '拖住');
  [1, 2, 3, 4].forEach((i) => { const t = tGrow + (i - 1) * 0.55; set(olds[i], t, { scaleX: 1 }); appear(olds[i], t); drawIn(links[i], t, 0.2); sfx('tick', t, { g: 0.35 + i * 0.05, p: -0.2 + i * 0.2 }); });
  const growL = tx(world, 't4 b', '版本链越积越长', X4 + 120, 700); wipe(growL, T('u16', '越积') - 0.1, { dir: 'l', d: 0.4 });

  // ── 镜头 ──
  const moves = [[tGo1, 1], [tGo2, 2], [T('u11') - 0.5, 3], [T('u15') - 0.6, 4]];
  const keysCam = [[c0 + 0.1, { x: 990, z: 1.03 }, moves[0][0] - c0 - 0.25, { ease: 'none', sfx: false }]];
  moves.forEach(([t, k], i) => {
    keysCam.push([t, { x: SW * k + 960, z: 1 }, 1.0, { g: 0.35 }]);
    const nextT = i + 1 < moves.length ? moves[i + 1][0] : s.end;
    keysCam.push([null, { x: SW * k + 985, z: 1.025 }, Math.max(0.5, nextT - t - 1.25), { ease: 'none', sfx: false }]);
  });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keysCam);
});
