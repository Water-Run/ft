// 06 页面依赖和提交状态：脏页写回、页面依赖（先写被指向的页）、提交时先刷页再写事务清单页、两位状态、强制写、崩溃后的失败事务。
// 主画面：页缓存与磁盘上的库文件上下两层，写盘的先后用 ①② 标出；事务清单页 222 上一排两位状态，事务 11 是二进制 11。
scene('durable', ({ root, s, c0 }) => {
  const SW = 1920;
  const { world, under, over } = stage(root, SW * 5, 1080);
  const cam = makeCamera(world);
  const TIP = FB.page_map.clean_after.tip;
  const ord = (n, x, y, t, o = {}) => { const e = blk(world, 'chip ink lat', n, x, y, 60, 60, { fontSize: '34px', fontWeight: 700 }); slam(e, t, { from: 1.6, d: 0.4 }); sfx(o.s || 'thud', t + 0.05, { g: o.g || 0.55, p: o.p || 0 }); return e; };

  // ── 站 0：页缓存 → 库文件 ──
  const cache = blk(world, '', '', 120, 220, 1000, 300, { outline: '4px dashed ' + C.g4, outlineOffset: '-4px' }); cache.dataset.name = '页缓存';
  const cacheT = tx(world, 't4', '页缓存（内存）', 150, 238, { fontWeight: 500 });
  const disk = blk(world, 'panel', '', 120, 640, 1000, 260); disk.dataset.name = '库文件 users.fdb';
  const diskT = tx(world, 'm3', 'users.fdb（磁盘）', 150, 656, { fontWeight: 600 });
  const pages = [['231', true], ['225', false], ['230', false], ['222', false]].map(([n, dirty], i) => {
    const e = blk(world, 'chip w lat', n, 160 + i * 230, 320, 190, 150, { fontSize: '44px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
    return e;
  });
  const dTag = blk(world, 'chip cur-rec', '已修改 · 脏页', 160, 290, 190, 40, { fontSize: '24px' });
  const dSlots = [0, 1, 2, 3].map((i) => blk(world, 'chip w lat', ['231', '225', '230', '222'][i], 160 + i * 230, 710, 190, 150, { fontSize: '44px', color: C.g4 }));
  const tW1 = T('w1'), tW1a = T('w1a');
  wipe(cache, c0 + 0.1, { dir: 'l', d: 0.5 }); appear(cacheT, c0 + 0.3); wipe(disk, c0 + 0.25, { dir: 'l', d: 0.5 }); appear(diskT, c0 + 0.45);
  pages.forEach((e, i) => appear(e, c0 + 0.4 + i * 0.08)); dSlots.forEach((e, i) => appear(e, c0 + 0.55 + i * 0.08));
  sfx('tick', c0 + 0.4, { g: 0.4, p: -0.4 });
  const tDirty = T('w1a', '页缓存') - 0.1;
  classAt(pages[0], 'cur-rec', tDirty, s.end); wipe(dTag, tDirty + 0.1, { dir: 'l', d: 0.3 }); sfx('pop', tDirty, { g: 0.5, p: -0.6 });
  const wb = arrow(over, [[255, 476], [255, 702]], 'ink', { w: 5 });
  const tWb = T('w1a', '写回') - 0.3;
  drawIn(wb, tWb, 0.45); classAt(dSlots[0], 'cur-rec', tWb + 0.45, s.end); sfx('drive', tWb + 0.3, { g: 0.35 });
  const wbL = tx(world, 't4', '写回', 280, 560, { fontWeight: 500 }); wipe(wbL, tWb + 0.2, { dir: 'l', d: 0.3 });
  // w2：InnoDB / PostgreSQL 重放日志（右侧对照）
  const tW2 = T('w2');
  const logT = tx(world, 't4 b lat', 'InnoDB · PostgreSQL', 1250, 220);
  const logs = [0, 1, 2, 3, 4, 5].map((i) => blk(world, 'panel', '', 1250 + i * 92, 300, 80, 110));
  const logL = tx(world, 't5', 'redo / WAL 日志', 1250, 424);
  const replay = arrow(over, [[1500, 460], [1500, 560]], 'ink'); const rpL = tx(world, 't5', '崩溃后重放', 1530, 486);
  const rpPage = blk(world, 'panel', '', 1250, 570, 540, 100); tx(rpPage, 't5', '数据页', 20, 30);
  wipe(logT, tW2 - 0.3, { dir: 'l', d: 0.35 }); logs.forEach((e, i) => appear(e, tW2 - 0.1 + i * 0.06)); appear(logL, tW2 + 0.3);
  drawIn(replay, T('w2', '重放') - 0.2, 0.4); appear(rpL, T('w2', '重放')); wipe(rpPage, T('w2', '重放') + 0.2, { dir: 't', d: 0.3 });
  sfx('tick', T('w2', '重放'), { g: 0.45, p: 0.6 });
  // w3：Firebird 依靠页面依赖与事务状态
  const tW3 = T('w3');
  const p1 = blk(world, 'sel', '页面依赖', 1250, 730, 260, 90, { fontSize: '38px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const p2 = blk(world, 'sel', '事务状态', 1530, 730, 260, 90, { fontSize: '38px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const fbT = tx(world, 't4 b lat', 'Firebird', 1250, 680);
  appear(fbT, tW3); slam(p1, T('w3', '页面依赖') - 0.1, { from: 1.2 }); slam(p2, T('w3', '事务状态') - 0.1, { from: 1.2 });
  sfx('thud', T('w3', '页面依赖'), { g: 0.5 }); sfx('thud', T('w3', '事务状态'), { g: 0.5 });
  F((t) => { const dim = t >= tW3 - 0.1; [logT, logL, rpL, rpPage, ...logs].forEach((e) => { e.style.opacity = dim ? 0.3 : ''; }); replay.style.opacity = dim ? 0.3 : ''; });

  // ── 站 1：分配新数据页——先写新页，再写指向它的指针页 ──
  const X1 = SW;
  const nT = tx(world, 't3', '分配数据页时的写入顺序', X1 + 120, 170, { fontWeight: 700 });
  const ptr = blk(world, 'chip ink', '指针页', X1 + 120, 300, 360, 110, { fontSize: '40px' });
  const nd = blk(world, 'chip w', '新数据页', X1 + 760, 300, 360, 110, { fontSize: '40px', outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  const ptrA = arrow(over, [[X1 + 480, 355], [X1 + 752, 355]], 'ink', { w: 5 }); const ptrL = tx(world, 't5', '指向', X1 + 580, 300);
  const diskB = blk(world, 'panel', '', X1 + 120, 640, 1000, 200); tx(diskB, 'm3', '磁盘', 24, 14, { color: C.g4 });
  const sNd = blk(world, 'chip w', '新数据页', X1 + 760, 700, 360, 110, { fontSize: '40px' }), sPtr = blk(world, 'chip w', '指针页', X1 + 120, 700, 360, 110, { fontSize: '40px' });
  const tW4 = T('w4');
  const tGo1 = tW4 - 0.5;
  wipe(nT, tGo1 + 0.3, { dir: 'l', d: 0.4 }); wipe(diskB, tGo1 + 0.4, { dir: 'l', d: 0.45 });
  slide(ptr, tGo1 + 0.5, { x: -60, d: 0.45 }); slide(nd, tGo1 + 0.6, { x: 60, d: 0.45 }); drawIn(ptrA, tGo1 + 0.8, 0.35); appear(ptrL, tGo1 + 0.9);
  const tWr1 = T('w4', '新页') - 0.2, tWr2 = T('w4', '指针页') - 0.2;
  const dn1 = arrow(over, [[X1 + 940, 418], [X1 + 940, 692]], 'ink', { w: 5 }), dn2 = arrow(over, [[X1 + 300, 418], [X1 + 300, 692]], 'ink', { w: 5 });
  drawIn(dn1, tWr1, 0.4); wipe(sNd, tWr1 + 0.35, { dir: 't', d: 0.3 }); ord('①', X1 + 970, 520, tWr1 + 0.2, { s: 'drive', g: 0.4 });
  drawIn(dn2, tWr2, 0.4); wipe(sPtr, tWr2 + 0.35, { dir: 't', d: 0.3 }); ord('②', X1 + 330, 520, tWr2 + 0.2, { s: 'drive', g: 0.4 });
  // w5：指针落盘之前，它指向的内容已经写好
  const tW5 = T('w5');
  const okL = blk(world, 'sel', '指针落盘时，指向的页已在磁盘上', X1 + 120, 870, 760, 64, { fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  wipe(okL, T('w5', '写好') - 0.4, { dir: 'l', d: 0.45 }); sfx('chime', T('w5', '写好'), { g: 0.5 });
  const sArr = arrow(over, [[X1 + 480, 755], [X1 + 752, 755]], 'teal', { w: 5 }); drawIn(sArr, T('w5', '指向') - 0.2, 0.4);

  // ── 站 2：提交——先刷这笔事务的页，再更新事务清单页 ──
  const X2 = SW * 2;
  const cT = tx(world, 't3', '提交时的顺序', X2 + 120, 170, { fontWeight: 700 });
  const pg231 = blk(world, 'chip cur-rec lat', '231', X2 + 120, 300, 260, 120, { fontSize: '52px', fontWeight: 700 });
  const pg231L = tx(world, 't5', '本事务修改的页', X2 + 120, 432, { color: C.ink });
  const tip = blk(world, 'chip ink', '事务清单页 222', X2 + 620, 300, 420, 120, { fontSize: '40px' });
  const tipL = tx(world, 't5', '记下：事务 11 已提交', X2 + 620, 432, { color: C.ink });
  const disk2 = blk(world, 'panel', '', X2 + 120, 560, 920, 160); tx(disk2, 'm3', '磁盘', 24, 14, { color: C.g4 });
  const c1 = blk(world, 'chip w lat', '231', X2 + 120, 600, 260, 90, { fontSize: '40px' }), c2 = blk(world, 'chip w', '222', X2 + 620, 600, 420, 90, { fontSize: '40px' });
  const tW6 = T('w6'), tW7 = T('w7');
  const tGo2 = tW6 - 0.5;
  wipe(cT, tGo2 + 0.3, { dir: 'l', d: 0.4 }); slide(pg231, tGo2 + 0.45, { x: -60, d: 0.45 }); appear(pg231L, tGo2 + 0.7); wipe(disk2, tGo2 + 0.5, { dir: 'l', d: 0.45 });
  const f1 = T('w6', '刷新') - 0.2;
  wipe(c1, f1 + 0.3, { dir: 't', d: 0.3 }); classAt(c1, 'cur-rec', f1 + 0.6, s.end); ord('①', X2 + 400, 470, f1 + 0.2, { s: 'drive', g: 0.4 });
  slide(tip, tW7 - 0.25, { x: 60, d: 0.45 }); appear(tipL, T('w7', '已经') - 0.2);
  const f2 = T('w7', '更新') - 0.1;
  wipe(c2, f2 + 0.3, { dir: 't', d: 0.3 }); classAt(c2, 'sel', f2 + 0.6, s.end); ord('②', X2 + 1060, 470, f2 + 0.2, { s: 'drive', g: 0.4 });
  sfx('chime', T('w7', '提交') + 0.1, { g: 0.5 });
  // w7a：顺序反过来的后果（右侧，红色描边）
  const tW7a = T('w7a');
  const bad = blk(world, 'tx', '', X2 + 1160, 280, 640, 440); bad.dataset.name = '顺序反过来';
  const badT = tx(world, 't4 b', '如果顺序反过来', X2 + 1190, 300);
  const b1 = blk(world, 'chip w', '222 · 已提交', X2 + 1190, 380, 580, 80, { fontSize: '34px' });
  const crash = tx(world, 'b', '崩溃', X2 + 1190, 470, { color: C.fire, fontSize: '64px' });
  const b2 = blk(world, 'chip g lat', '231 · 还没写', X2 + 1190, 570, 580, 80, { fontSize: '34px', color: C.g4, outline: '3px dashed ' + C.g4, outlineOffset: '-3px' });
  const badL = tx(world, 't4', '已提交，却缺少内容', X2 + 1190, 760, { fontWeight: 700 });
  wipe(bad, tW7a - 0.2, { dir: 'l', d: 0.45 }); appear(badT, tW7a); wipe(b1, T('w7a', '崩溃') - 0.5, { dir: 'l', d: 0.3 });
  slam(crash, T('w7a', '崩溃') - 0.05, { from: 1.4 }); sfx('error', T('w7a', '崩溃'), { g: 0.6 });
  wipe(b2, T('w7a', '已提交') - 0.2, { dir: 'l', d: 0.3 }); wipe(badL, T('w7a', '缺少') - 0.1, { dir: 'l', d: 0.4 });

  // ── 站 3：事务清单页 222 ——每个事务两位 ──
  const X3 = SW * 3;
  const tT = tx(world, 't3', '第 222 页 · 事务清单页', X3 + 120, 170, { fontWeight: 700 });
  const STN = ['00', '01', '10', '11'];
  const cellsTip = [];
  for (let n = 1; n <= TIP.next_transaction; n++) {
    const i = n - 1, x = X3 + 120 + i * 112;
    const c = blk(world, 'chip g lat', '', x, 300, 100, 100, { fontSize: '44px', fontWeight: 600 });
    const lb = tx(world, 'lat', String(n), x + 34, 410, { fontSize: '30px', color: C.g4 });
    cellsTip.push({ c, lb, n, st: TIP.states[n] });
  }
  const txN = tx(world, 't5', '事务号', X3 + 120, 452);
  const legend = [[3, '已提交'], [0, '活动'], [2, '失败'], [1, '待定（两阶段提交）']].map(([v, n], i) => {
    const e = blk(world, 'chip w', `<b class="lat" style="margin-right:14px">${STN[v]}</b>${n}`, X3 + 120 + i * 380, 560, 350, 74, { fontSize: '30px', justifyContent: 'flex-start', paddingLeft: '20px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' });
    return e;
  });
  const tW8 = T('w8');
  const tGo3 = tW8 - 0.5;
  wipe(tT, tGo3 + 0.3, { dir: 'l', d: 0.4 });
  cellsTip.forEach((o, i) => { appear(o.c, tGo3 + 0.4 + i * 0.04); appear(o.lb, tGo3 + 0.45 + i * 0.04); });
  appear(txN, tGo3 + 0.6);
  const tBits = T('w8', '两位') - 0.2;
  cellsTip.forEach((o, i) => swapAt(o.c, '', STN[o.st], tBits + i * 0.05)); sfx('blip', tBits, { g: 0.45 }); sfx('blip', tBits + 0.3, { g: 0.4 });
  legend.forEach((e, i) => wipe(e, T('w8', '状态') - 0.2 + i * 0.1, { dir: 'l', d: 0.3 }));
  // w9：事务 11 提交后是 11
  const tW9 = T('w9');
  const c11 = cellsTip[cellsTip.length - 1].c;
  const ring = blk(world, 'tx', '', parseFloat(c11.style.left) - 8, 292, 116, 116); appear(ring, T('w9', '修改事务') - 0.1);
  classAt(c11, 'sel', T('w9', '二进制') - 0.1, s.end); sfx('chime', T('w9', '一一'), { g: 0.6 });
  const big11 = tx(world, 'lat', '事务 11 → 二进制 11 = 已提交', X3 + 120, 700, { fontSize: '56px', fontWeight: 700 });
  wipe(big11, T('w9', '二进制') - 0.1, { dir: 'l', d: 0.5 });
  // w9a：记录头的事务号对上清单
  const tW9a = T('w9a');
  const hdrTx = bytes(world, ['0b', '00', '00', '00'], X3 + 120, 820, { cw: 80, ch: 70, gap: 6, fs: 34, cls: () => 'hdr' });
  const hdrL = tx(world, 't5', 'Alice 记录头里的事务号 = 11', X3 + 480, 838, { color: C.ink });
  const match = arrow(over, [[X3 + 280, 812], [X3 + 280, 780], [parseFloat(c11.style.left) + 50, 780], [parseFloat(c11.style.left) + 50, 416]], 'fire', { w: 4 });
  F((t) => { big11.style.visibility = t >= tW9a - 0.3 ? 'hidden' : ''; });
  hdrTx.forEach((e, i) => appear(e, tW9a - 0.2 + i * 0.05)); appear(hdrL, tW9a); drawIn(match, T('w9a', '对应') - 0.3, 0.6); sfx('tick', T('w9a', '对应'), { g: 0.5 });
  // w10：强制写
  const tW10 = T('w10');
  const fw = blk(world, 'dark', '', X3 + 1000, 800, 760, 120); fw.dataset.name = '监控表查询';
  tx(fw, 'mono', 'MON$FORCED_WRITES', 30, 24, { fontSize: '34px', color: C.g3 });
  const fwV = tx(fw, 'mono', '1', 640, 24, { fontSize: '52px', color: C.white, fontWeight: 600 });
  const fwL = tx(world, 't5', '强制写：写入要等到物理落盘', X3 + 1000, 748, { color: C.ink });
  wipe(fw, T('w10', '强制写') - 0.3, { dir: 'l', d: 0.45 }); appear(fwL, T('w10', '强制写')); sfx('blip', T('w10', '强制写'), { g: 0.5 });
  F((t) => { const on = t >= tW10 - 0.4; [hdrL, ...hdrTx].forEach((e) => { e.style.opacity = on ? 0.35 : ''; }); match.style.opacity = on ? 0.35 : ''; });

  // ── 站 4：崩溃后重开库：遗留的活动事务标为失败；读到失败版本就沿回溯链往回找 ──
  const X4 = SW * 4;
  const rT = tx(world, 't3', '崩溃后重开库', X4 + 120, 170, { fontWeight: 700 });
  const before = blk(world, 'chip g lat', '00', X4 + 120, 300, 140, 140, { fontSize: '60px', fontWeight: 600 });
  const beforeL = tx(world, 't5', '遗留的活动事务', X4 + 120, 452, { color: C.ink });
  const restart = arrow(over, [[X4 + 290, 370], [X4 + 470, 370]], 'ink', { w: 5 }); const rsL = tx(world, 't5', '重开', X4 + 330, 314);
  const after = blk(world, 'chip lat', '10', X4 + 500, 300, 140, 140, { fontSize: '60px', fontWeight: 600, outline: '5px solid ' + C.fire, outlineOffset: '-5px', background: C.white });
  const afterL = tx(world, 't4 b', '失败', X4 + 500, 452);
  const tW11 = T('w11');
  const tGo4 = tW11 - 0.5;
  wipe(rT, tGo4 + 0.3, { dir: 'l', d: 0.4 }); slide(before, T('w11', '遗留') - 0.3, { x: -50, d: 0.4 }); appear(beforeL, T('w11', '遗留'));
  drawIn(restart, T('w11', '重开') - 0.1, 0.4); appear(rsL, T('w11', '重开'));
  slam(after, T('w11', '失败') - 0.2, { from: 1.3 }); appear(afterL, T('w11', '失败')); sfx('error', T('w11', '失败') - 0.15, { g: 0.55 });
  // w12：读到失败版本 → 回溯链 → 可见的历史记录
  const tW12 = T('w12');
  const dv = blk(world, 'chip cur-rec', '', X4 + 120, 640, 520, 100, { justifyContent: 'flex-start', paddingLeft: '24px', fontSize: '34px', outline: '5px solid ' + C.fire, outlineOffset: '-5px' });
  dv.innerHTML = '版本 · 事务状态：失败';
  const hv = blk(world, 'chip hist-rec', '回溯的历史记录 · 可见', X4 + 860, 640, 520, 100, { fontSize: '34px' });
  const back = arrow(over, [[X4 + 640, 690], [X4 + 852, 690]], 'teal', { w: 5 });
  const skipL = tx(world, 't4', '不返回，继续往回找', X4 + 120, 770, { color: C.g4 });
  wipe(dv, T('w12', '失败') - 0.3, { dir: 'l', d: 0.4 }); appear(skipL, T('w12', '失败') + 0.3);
  drawIn(back, T('w12', '回溯') - 0.2, 0.45); wipe(hv, T('w12', '可见') - 0.2, { dir: 'l', d: 0.4 }); sfx('chime', T('w12', '可见'), { g: 0.55 });

  // ── 镜头 ──
  const moves = [[tGo1, 1], [tGo2, 2], [tGo3, 3], [tGo4, 4]];
  const keysCam = [[c0 + 0.1, { x: 990, z: 1.03 }, moves[0][0] - c0 - 0.25, { ease: 'none', sfx: false }]];
  moves.forEach(([t, k], i) => {
    keysCam.push([t, { x: SW * k + 960, z: 1 }, 1.0, { g: 0.35 }]);
    const nextT = i + 1 < moves.length ? moves[i + 1][0] : s.end;
    keysCam.push([null, { x: SW * k + 985, z: 1.025 }, Math.max(0.5, nextT - t - 1.25), { ease: 'none', sfx: false }]);
  });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keysCam);
});
