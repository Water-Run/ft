// 03 页、槽和记录头：数据怎么放。全部画面按实验 08 快照的真实字节（data.js 的 page_map 与 record_layout）。
// 主画面：按字节比例画出的第 231 页（128 × 64 格 = 8192 字节）——页首的槽目录、页尾的记录，0 号槽的四个字节指向页尾的 Alice。
scene('store', ({ root, s, c0 }) => {
  const { world, under, over } = stage(root, 7680, 1080);
  const cam = makeCamera(world);
  const PM = FB.page_map.clean_before, P = PM.data_page_231, R = FB.record_layout;

  // ── 站 0：库文件里的 240 页，按页头第一个字节着色 ──
  const TYPE = { 1: ['库头页', C.g2], 2: ['页清单页', C.g2], 3: ['事务清单页', C.g2], 4: ['指针页', C.g4], 5: ['数据页', C.ink], 6: ['索引根页', C.g3], 7: ['索引页', C.g3], 9: ['生成器页', C.g2], 10: ['SCN 清单页', C.g2], 0: ['未分配', C.white] };
  const GX = 120, GY = 250, TW = 52, TH = 34, GAP = 6, NC = 16;
  const tiles = PM.page_types.map((ty, i) => {
    const e = blk(world, '', '', GX + (i % NC) * (TW + GAP), GY + Math.floor(i / NC) * (TH + GAP), TW, TH, { background: C.g1 });
    e.dataset.name = '第 ' + i + ' 页';
    return e;
  });
  const fileL = tx(world, 'm2', 'users.fdb', GX, 150, { fontWeight: 600 });
  const cntL = tx(world, 't2', '', GX + 1000, 250, { fontWeight: 700 });
  const sizeL = tx(world, 't2 lat', '', GX + 1000, 340, { fontWeight: 700 });
  const sizeU = tx(world, 't4', '每页字节数', GX + 1000, 430, { color: C.g4 });
  const tD1 = T('d1');
  wipe(fileL, c0 + 0.1, { dir: 'l', d: 0.4 });
  tiles.forEach((e, i) => appear(e, c0 + 0.15 + (i % NC) * 0.02 + Math.floor(i / NC) * 0.05));
  sfx('tick', c0 + 0.2, { g: 0.4, p: -0.5 }); sfx('tick', c0 + 0.5, { g: 0.35, p: -0.3 });
  appear(cntL, T('d1', '页') - 0.2); swapAt(cntL, '', '240 页', T('d1', '页') - 0.2);
  appear(sizeL, T('d1', '八千') - 0.2); countTo(sizeL, 0, 8192, T('d1', '八千') - 0.2, 0.9, (v) => Math.round(v) + '');
  appear(sizeU, T('d1', '八千')); sfx('pop', T('d1', '八千') + 0.6, { g: 0.6, p: 0.5 });
  // d2：页头第一个字节 = 页的用途
  const tD2 = T('d2'), tType = T('d2', '用途') - 0.6;
  tiles.forEach((e, i) => { const ty = TYPE[PM.page_types[i]] || TYPE[0]; fromTo(e, tType + (i % NC) * 0.015 + Math.floor(i / NC) * 0.03, { backgroundColor: C.g1 }, { backgroundColor: ty[1], duration: 0.2 });
    if (PM.page_types[i] === 0) css(e, { outline: '2px solid ' + C.g3, outlineOffset: '-2px' }); });
  sfx('blip', tType, { g: 0.45 }); sfx('blip', tType + 0.4, { g: 0.35 });
  const legend = [5, 4, 7, 6, 3, 0].map((k, i) => {
    const sw = blk(world, '', '', GX + 1000, 520 + i * 62, 40, 40, { background: TYPE[k][1], outline: k === 0 ? '2px solid ' + C.g3 : '', outlineOffset: '-2px' });
    const lb = tx(world, 't4', TYPE[k][0], GX + 1060, 512 + i * 62);
    appear(sw, tType + 0.3 + i * 0.1); wipe(lb, tType + 0.3 + i * 0.1, { dir: 'l', d: 0.35 });
    return [sw, lb];
  });
  // 第 231 页被选中：页头第一个字节 05 = 数据页
  const t231 = tiles[231];
  classAt(t231, 'sel', T('d2', '第一') - 0.1, s.end);
  const T231 = { x: GX + (231 % NC) * (TW + GAP), y: GY + Math.floor(231 / NC) * (TH + GAP) };
  const hdr = bytes(world, ['05', '00', '00', '00', '…'], T231.x - 60, T231.y - 70, { cw: 52, ch: 40, gap: 4, fs: 24, cls: (i) => i === 0 ? 'sel' : 'hdr' });

  // ── 站 1：第 231 页按字节画出来 ──
  const X1 = 1920, PX = X1 + 120, PY = 300;
  const own = (b) => { if (b < 16) return 'hdr'; if (b < 24) return 'dph'; if (b < 24 + P.slot_bytes) return 'slot'; for (const sl of P.slots) if (b >= sl.offset && b < sl.offset + sl.length) return sl.line === 0 ? 'alice' : 'rec'; return 'free'; };
  const pg = pageGrid(world, PX, PY, own, { hdr: C.ink, dph: C.ink, slot: C.g4, alice: C.flame, rec: C.g3, free: C.g1 }, { cols: 128, cs: 7, name: '第 231 页（8192 字节）' });
  const pgT = tx(world, 't3', '第 231 页 · 数据页', PX, 150, { fontWeight: 700 });
  const b0 = tx(world, 'm3 dim', '0', PX, PY + 64 * 7 + 12), b1 = tx(world, 'm3 dim', '8191', PX + 128 * 7 + 14, PY + 64 * 7 - 30);
  const slotBox = span(world, pg, 24, P.slot_bytes, '', { style: { outline: '4px solid ' + C.teal, outlineOffset: '-1px' } });
  const recEnd = P.slots[P.slots.length - 1].offset;            // 记录区从这里到页尾
  const recRowA = pg.at(recEnd);
  const recBox = blk(world, '', '', PX - 2, recRowA.y - 2, 128 * 7 + 4, (8192 - Math.floor(recEnd / 128) * 128) / 128 * 7 + 4, { outline: '4px solid ' + C.ink, outlineOffset: '-2px' });
  const slotL = tx(world, 't4', '槽目录', PX, PY - 58, { fontWeight: 700, color: C.teal });
  const recL = tx(world, 't4', '记录', PX + 128 * 7 - 80, PY + 64 * 7 + 60, { fontWeight: 700 });
  const tGo1 = T('d3') - 0.5;
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { x: 990, z: 1.03 }, Math.max(1, T('d2', '第一') - c0 - 0.6), { ease: 'none', sfx: false }],
    [T('d2', '第一') - 0.4, { x: T231.x + 60, y: T231.y - 60, z: 2.1 }, 1.0, { sfx: false }],
    [null, { z: 2.25 }, Math.max(0.4, tGo1 - T('d2', '第一') - 0.75), { ease: 'none', sfx: false }],
    [tGo1, { x: X1 + 960, y: 540, z: 1 }, 1.0, { g: 0.4 }],
  ]);
  hdr.forEach((e, i) => appear(e, T('d2', '第一') + i * 0.06));
  const hdrL = tx(world, '', '页头第 1 字节：05 = 数据页', T231.x - 60, T231.y - 114, { fontSize: '24px', fontWeight: 500 });
  wipe(hdrL, T('d2', '用途') - 0.1, { dir: 'l', d: 0.4 }); sfx('pop', T('d2', '第一') + 0.1, { g: 0.6 });
  // 站 1 入场
  wipe(pgT, tGo1 + 0.3, { dir: 'l', d: 0.45 });
  wipe(pg.img, tGo1 + 0.35, { dir: 't', d: 0.8, ease: 'power2.inOut' }); sfx('drive', tGo1 + 0.4, { g: 0.25 });
  appear(b0, tGo1 + 0.9); appear(b1, tGo1 + 0.9);
  const tSlotD = T('d3', '槽目录') - 0.15, tRecD = T('d3', '记录') - 0.15;
  appear(slotBox, tSlotD); wipe(slotL, tSlotD, { dir: 'l', d: 0.35 }); sfx('tick', tSlotD, { g: 0.5, p: -0.5 });
  appear(recBox, tRecD); wipe(recL, tRecD, { dir: 'l', d: 0.35 }); sfx('tick', tRecD, { g: 0.5, p: 0.3 });
  // 镜头：推近页首的槽目录，再到页尾的记录，然后拉回看槽目录展开
  const tBack1 = T('d4') - 0.6, tLeave1 = Tend('d6') + 0.15 + 0.62;
  cam.track(tGo1 + 1.05, { x: X1 + 960, y: 540, z: 1 }, [
    [tSlotD - 0.35, { x: PX + 200, y: PY + 60, z: 2.2 }, 0.9, { sfx: false }],
    [tRecD - 0.35, { x: PX + 700, y: PY + 400, z: 2.2 }, 0.9, { g: 0.3 }],
    [tBack1, { x: X1 + 960, y: 540, z: 1 }, 0.8, { sfx: false }],
    [null, { x: X1 + 975, z: 1.02 }, Math.max(1, tLeave1 - tBack1 - 1.05), { ease: 'none', sfx: false }],
  ]);

  // 右侧：槽目录逐槽展开（8 槽 × 4 字节）
  const SX = X1 + 1120, SY = 250;
  const sh = tx(world, 't4', '槽号', SX, SY - 56, { color: C.g4 }), so = tx(world, 't4', '偏移', SX + 110, SY - 56, { color: C.g4 }), sl2 = tx(world, 't4', '长度', SX + 260, SY - 56, { color: C.g4 });
  const sdec = tx(world, 't4', '', SX + 420, SY - 56, { color: C.g4 });
  const slotRows = P.slots.map((sl, i) => {
    const y = SY + i * 70;
    const no = blk(world, 'chip g lat', String(sl.line), SX, y, 80, 58, { fontSize: '32px' });
    const bs = bytes(world, [...hex2(sl.offset), ...hex2(sl.length)], SX + 110, y, { cw: 72, ch: 58, gap: 6, cls: () => '' });
    const dec = tx(world, 'lat', `${sl.offset} · ${sl.length}`, SX + 420, y + 4, { fontSize: '36px', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.ink : C.g4 });
    return { no, bs, dec, y };
  });
  const tD4 = T('d4');
  appear(sh, tD4 - 0.2); appear(so, tD4 - 0.2); appear(sl2, tD4 - 0.2);
  slotRows.forEach((r, i) => { const t = tD4 - 0.1 + i * 0.1; slide(r.no, t, { x: 40, d: 0.4, ease: 'power3.out' }); r.bs.forEach((e) => appear(e, t + 0.05)); });
  sfx('tick', tD4, { g: 0.4, p: 0.5 }); sfx('tick', tD4 + 0.4, { g: 0.35, p: 0.5 });
  const brO = blk(world, '', '', SX + 110, SY + 8 * 70 - 6, 138, 4, { background: C.ink }), brLn = blk(world, '', '', SX + 254, SY + 8 * 70 - 6, 138, 4, { background: C.ink });
  const brOL = tx(world, 't5', '2 字节', SX + 110, SY + 8 * 70 + 4), brLL = tx(world, 't5', '2 字节', SX + 254, SY + 8 * 70 + 4);
  const tOff = T('d4a', '偏移'), tLen = T('d4a', '长度'), tNo = T('d4a', '槽号');
  wipe(brO, tOff - 0.1, { dir: 'l', d: 0.3 }); appear(brOL, tOff); wipe(brLn, tLen - 0.1, { dir: 'l', d: 0.3 }); appear(brLL, tLen);
  slotRows.forEach((r) => { classAt(r.bs[0], 'sel', tOff - 0.1, tLen - 0.1); classAt(r.bs[1], 'sel', tOff - 0.1, tLen - 0.1); classAt(r.bs[2], 'sel', tLen - 0.1, tNo - 0.1); classAt(r.bs[3], 'sel', tLen - 0.1, tNo - 0.1); classAt(r.no, 'sel', tNo - 0.1, Tend('d4a') + 0.2); });
  sfx('blip', tOff - 0.1, { g: 0.4, p: 0.5 }); sfx('blip', tLen - 0.1, { g: 0.4, p: 0.5 }); sfx('blip', tNo - 0.1, { g: 0.4, p: 0.4 });
  appear(sdec, tNo + 0.4); swapAt(sdec, '', '偏移 · 长度', tNo + 0.4);
  slotRows.forEach((r, i) => wipe(r.dec, tNo + 0.4 + i * 0.06, { dir: 'l', d: 0.3 }));
  // d5：0 号槽 → 页尾的 Alice
  const tD5 = T('d5');
  const s0 = slotRows[0];
  classAt(s0.no, 'cur-rec', T('d5', '零号') - 0.1, s.end);
  const aliceP = pg.at(P.slots[0].offset);
  const toAlice = arrow(over, [[SX - 10, s0.y + 29], [SX - 60, s0.y + 29], [SX - 60, aliceP.y + 3], [aliceP.x + 32 * 7 + 6, aliceP.y + 3]], 'flame', { w: 5 });
  drawIn(toAlice, T('d5', '指向') - 0.15, 0.6); sfx('pop', T('d5', 'Alice'), { g: 0.7, p: 0.2 });
  const alL = tx(world, 't4 b lat', 'Alice', aliceP.x, PY + 64 * 7 + 6, { color: C.ink });
  wipe(alL, T('d5', 'Alice') - 0.1, { dir: 'l', d: 0.35 });
  // d6：记录在页内搬动，槽里的偏移跟着改（演示：移到 7880，再回到原处）
  const tMv = T('d6', '搬动') - 0.2, tMvB = Tend('d6') + 0.15;
  const mover = blk(world, 'cur-rec', '', aliceP.x, aliceP.y, 32 * 7, 7); mover.dataset.name = 'Alice 的记录';
  const newP = pg.at(7880);
  appear(mover, tMv - 0.05);
  tl.fromTo(mover, { x: 0, y: 0 }, { x: newP.x - aliceP.x, y: newP.y - aliceP.y, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, tMv);
  tl.to(mover, { x: 0, y: 0, duration: 0.6, ease: 'power3.inOut' }, tMvB);
  vanish(mover, tMvB + 0.62);
  F((t) => {
    const k1 = ease.io3(clamp((t - tMv) / 0.8)), k2 = ease.io3(clamp((t - tMvB) / 0.6));
    const v = Math.round(8160 + (7880 - 8160) * (k1 - k2));
    const hx = hex2(v); s0.bs[0].textContent = hx[0]; s0.bs[1].textContent = hx[1];
    s0.dec.textContent = `${v} · 32`;
  });
  classAt(s0.bs[0], 'cur-rec', tMv, tMvB + 0.6); classAt(s0.bs[1], 'cur-rec', tMv, tMvB + 0.6);
  sfx('whoosh', tMv, { g: 0.3, p: 0.1 }); sfx('tick', tMv + 0.8, { g: 0.5, p: 0.5 });
  F((t) => { toAlice.style.opacity = (t > tMv && t < tMvB + 0.6) ? 0.25 : ''; });

  // ── 站 2：指针页 225 → 数据页 231；先找页，再按槽取记录 ──
  const X2 = 3840;
  const tD7 = T('d7');
  const pp = blk(world, 'panel', '', X2 + 160, 260, 520, 520); pp.dataset.name = '第 225 页 · 指针页';
  const ppT = tx(world, 't3', '第 225 页 · 指针页', X2 + 160, 170, { fontWeight: 700 });
  const ppH = blk(pp, 'chip ink', '页头 · 本表数据页的页号数组', 0, 0, 520, 70, { fontSize: '28px' });
  const ent = [['0', '231'], ['1', ''], ['2', ''], ['3', '']].map(([k, v], i) => {
    const r = blk(pp, 'chip w', '', 30, 100 + i * 96, 460, 78, { justifyContent: 'flex-start', paddingLeft: '24px', fontSize: '34px' });
    r.innerHTML = `<span class="lat" style="color:#3A434B;width:90px">[${k}]</span><span class="lat b">${v}</span>`;
    return r;
  });
  const dp = blk(world, 'chip ink lat', '数据页 231', X2 + 1000, 300, 360, 100, { fontSize: '42px' }); dp.dataset.name = '数据页 231';
  const pp2dp = arrow(over, [[X2 + 650, 400], [X2 + 1000, 350]], 'ink');
  const tGo2 = Tend('d6') + 0.15 + 0.62;
  cam.track(tGo2 - 0.05, { x: X1 + 975, y: 540, z: 1.02 }, [[tGo2, { x: X2 + 960, y: 540, z: 1 }, 1.0, { g: 0.4 }], [null, { x: X2 + 990, z: 1.03 }, Math.max(1, T('d9') - tGo2 - 1.75), { ease: 'none', sfx: false }]]);
  wipe(ppT, tGo2 + 0.4, { dir: 'l', d: 0.4 }); wipe(pp, tGo2 + 0.45, { dir: 't', d: 0.5 });
  slide(ent[0], T('d7', '页号') - 0.4, { x: 40, d: 0.4, ease: 'power3.out' }); [1, 2, 3].forEach((i) => appear(ent[i], T('d7', '页号') - 0.2 + i * 0.05));
  drawIn(pp2dp, T('d7', '页号'), 0.5); slam(dp, T('d7', '页号') + 0.35, { from: 1.2 }); sfx('thud', T('d7', '页号') + 0.4, { g: 0.6 });
  // d8：先找到页，再按槽取记录——一条四步的路径，选中块沿路走
  const steps = ['指针页 225 · [0]', '数据页 231', '0 号槽', '记录'];
  const path4 = steps.map((t_, i) => blk(world, 'chip g', t_, X2 + 160 + i * 430, 860 - 40, 380, 80, { fontSize: '34px' }));
  const arr4 = [0, 1, 2].map((i) => arrow(over, [[X2 + 540 + i * 430, 860], [X2 + 590 + i * 430, 860]], 'ink'));
  const tD8 = T('d8');
  path4.forEach((e, i) => wipe(e, tD8 - 0.3 + i * 0.12, { dir: 'l', d: 0.35 })); arr4.forEach((a, i) => drawIn(a, tD8 + i * 0.12, 0.25));
  const tp = T('d8', '页'), ts = T('d8', '按槽'), tr_ = T('d8', '记录');
  classAt(path4[0], 'sel', tp - 0.5, tp + 0.4); classAt(path4[1], 'sel', tp + 0.4, ts); classAt(path4[2], 'sel', ts, tr_); classAt(path4[3], 'cur-rec', tr_, s.end);
  sfx('tick', tp - 0.5, { g: 0.4 }); sfx('tick', tp + 0.4, { g: 0.4 }); sfx('tick', ts, { g: 0.4 }); sfx('pop', tr_, { g: 0.6 });

  // ── 站 3：记录头与列值（32 字节）──
  const X3 = 5760, RX = X3 + 160, RY = 360, CW = 100;
  const st3 = h('div', 'abs', world); px(st3, 0, 0, 0, 0);
  const hexs = R.original.record_hex.match(/../g);
  const recT = tx(st3, 't3', `0 号槽的记录 · 偏移 ${P.slots[0].offset} · ${P.slots[0].length} 字节`, RX, 170, { fontWeight: 700 });
  const cells = bytes(st3, hexs, RX, RY, { cw: CW, ch: 80, gap: 8, per: 16, rowGap: 150, fs: 40,
    cls: (i) => (i < 13 ? 'hdr' : (i >= 22 && i <= 26) || i >= 30 ? 'cur-rec' : '') });
  const tD9 = T('d9');
  const tGo3 = tD9 - 0.4;
  cam.track(tGo3 - 0.05, { x: X2 + 990, y: 540, z: 1.03 }, [[tGo3, { x: X3 + 960, y: 540, z: 1 }, 1.0, { g: 0.4 }], [null, { x: X3 + 980, z: 1.02 }, Math.max(1, s.end - tGo3 - 1.3), { ease: 'none', sfx: false }]]);
  wipe(recT, tGo3 + 0.4, { dir: 'l', d: 0.45 });
  cells.forEach((e, i) => appear(e, tGo3 + 0.5 + i * 0.025)); sfx('tick', tGo3 + 0.6, { g: 0.4 }); sfx('tick', tGo3 + 0.95, { g: 0.35 });
  const hdrBox = blk(st3, '', '', RX - 6, RY - 6, 13 * CW + 4, 92, { outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  const rhL = tx(st3, 't3', '记录头 13 字节', RX, RY - 76, { fontWeight: 700 });
  appear(hdrBox, T('d9', '头') - 0.2); wipe(rhL, T('d9', '头') - 0.2, { dir: 'l', d: 0.4 });
  const fieldAt = (t, i0, i1, label, o = {}) => { const f = field(st3, RX + i0 * CW, RY + 92, (i1 - i0 + 1) * CW - 8, label, { cls: 't4', color: o.color, textColor: o.tc || C.ink }); wipe(f.ln, t, { dir: 'l', d: 0.3 }); wipe(f.lb, t + 0.1, { dir: 'l', d: 0.3 }); return f; };
  const txBox = blk(st3, 'tx', '', RX - 4, RY - 4, 4 * CW, 88); appear(txBox, T('d9', '事务号') - 0.1);
  fieldAt(T('d9', '事务号') - 0.1, 0, 3, '事务号 ' + R.original.transaction, { color: C.fire });
  fieldAt(T('d9', '回溯') - 0.1, 4, 7, '回溯页 ' + R.original.back_page);
  fieldAt(T('d9', '回溯') + 0.15, 8, 9, '回溯槽 ' + R.original.back_line);
  fieldAt(T('d9', '回溯') + 0.4, 10, 11, '标志');
  fieldAt(T('d9', '回溯') + 0.55, 12, 12, '格式');
  sfx('blip', T('d9', '事务号'), { g: 0.5 }); sfx('blip', T('d9', '回溯'), { g: 0.45 });
  // d10：头后面是列值：alice 与 30（压缩存放，dd 20 = 35 个空格）
  const tD10 = T('d10');
  const r2 = RY + 80 + 150;
  const fName = field(st3, RX + 6 * CW, r2 + 92, 5 * CW - 8, '名字 alice', { cls: 't4', textColor: C.ink });
  const fRun = field(st3, RX + 11 * CW, r2 + 92, 2 * CW - 8, '35 个空格', { cls: 't5' });
  const fAge = field(st3, RX + 14 * CW, r2 + 92, 2 * CW - 8, '年龄 30', { cls: 't4', textColor: C.ink });
  [[fName, T('d10', '名字')], [fAge, T('d10', '年龄')], [fRun, T('d10', '年龄') + 0.6]].forEach(([f, t]) => { wipe(f.ln, t - 0.1, { dir: 'l', d: 0.3 }); wipe(f.lb, t, { dir: 'l', d: 0.3 }); });
  const colL = tx(st3, 't3', '列值（压缩存放）', RX, r2 - 76, { fontWeight: 700 });
  wipe(colL, tD10 - 0.1, { dir: 'l', d: 0.4 });
  sfx('pop', T('d10', '名字'), { g: 0.55, p: -0.2 }); sfx('pop', T('d10', '年龄'), { g: 0.55, p: 0.4 });

  // ── 站 4：与前集对照——InnoDB 整行在主键索引叶子里；Firebird 与 PostgreSQL 行与索引分开 ──
  // 复用站 3 右侧：用遮罩换场到对照图
  const cmpVeil = blk(world, '', '', X3 - 40, 84, 2000, 900, { background: C.page }); cmpVeil.dataset.overlapOk = '1'; cmpVeil.style.zIndex = 7;
  const cmp = h('div', 'abs', world); px(cmp, X3, 0, 1920, 1080); cmp.style.zIndex = 8;
  const tD11 = T('d11');
  wipe(cmpVeil, tD11 - 0.45, { dir: 'l', d: 0.5 });
  F((t) => { st3.style.visibility = t >= tD11 + 0.06 ? 'hidden' : ''; });
  const tree = (ox, label, leafRows, tStart) => {
    const lab = tx(cmp, 't3 b', label, ox, 170);
    const rootN = blk(cmp, 'chip ink', '根', ox + 230, 260, 160, 64, { fontSize: '30px' });
    const leaves = [0, 1, 2].map((i) => blk(cmp, 'panel', '', ox + i * 210, 420, 190, leafRows ? 200 : 110));
    const ls = [0, 1, 2].map((i) => arrow(over, [[X3 + ox + 310, 324], [X3 + ox + 310, 370], [X3 + ox + 95 + i * 210, 370], [X3 + ox + 95 + i * 210, 414]], 'ink', { head: false }));
    wipe(lab, tStart, { dir: 'l', d: 0.4 }); appear(rootN, tStart + 0.1); ls.forEach((p) => drawIn(p, tStart + 0.2, 0.3)); leaves.forEach((l, i) => wipe(l, tStart + 0.3 + i * 0.08, { dir: 't', d: 0.35 }));
    return { leaves };
  };
  const inno = tree(120, 'InnoDB', true, tD11 + 0.0);
  inno.leaves.forEach((l, i) => { for (let r = 0; r < 3; r++) { const row = blk(l, '', '', 14, 70 + r * 40, 162, 28, { background: i === 0 && r === 0 ? C.flame : C.g3 }); appear(row, T('d11', '整行') - 0.1 + i * 0.05); } tx(l, 't5', '叶子', 14, 14); });
  const innoL = tx(cmp, 't4', '叶子里装着整行', 120, 660, { fontWeight: 500 }); wipe(innoL, T('d11', '叶子'), { dir: 'l', d: 0.4 });
  // 查找路径：从根沿主键索引走到第一片叶子，整行就在那里
  const pathI = arrow(over, [[X3 + 120 + 310, 328], [X3 + 120 + 310, 374], [X3 + 120 + 95, 374], [X3 + 120 + 95, 412]], 'teal', { w: 6, head: false });
  drawIn(pathI, T('d11', '主键') - 0.2, 0.7);
  const leaf0 = blk(cmp, '', '', 116, 416, 198, 208, { outline: '5px solid ' + C.teal, outlineOffset: '-5px' }); appear(leaf0, T('d11', '叶子') - 0.1);
  sfx('blip', T('d11', '主键'), { g: 0.4, p: -0.5 });
  sfx('tick', T('d11', '整行'), { g: 0.5, p: -0.4 }); sfx('pop', T('d12') + 0.1, { g: 0.45, p: 0.4 }); sfx('tick', T('d12', 'Postgres') + 0.1, { g: 0.4, p: 0.5 });
  const tD12 = T('d12');
  const fbt = tree(1000, 'Firebird · PostgreSQL', false, tD12 - 0.1);
  fbt.leaves.forEach((l, i) => { tx(l, 't5', '键 → 位置', 14, 14); });
  const heap = blk(cmp, 'panel', '', 1000, 640, 610, 150); heap.dataset.name = '数据页（行）';
  const heapT = tx(cmp, 't5', '数据页', 1016, 652);
  const heapRows = [0, 1, 2, 3].map((r) => blk(heap, '', '', 20 + r * 148, 60, 128, 60, { background: r === 0 ? C.flame : C.g3 }));
  const sep = arrow(over, [[X3 + 1095, 530], [X3 + 1095, 640]], 'ink'), sep2 = arrow(over, [[X3 + 1305, 530], [X3 + 1305, 600], [X3 + 1250, 600], [X3 + 1250, 640]], 'ink');
  const tSep = T('d12', '分开');
  wipe(heap, tSep - 0.5, { dir: 'b', d: 0.4 }); appear(heapT, tSep - 0.3); heapRows.forEach((r, i) => appear(r, tSep - 0.3 + i * 0.05));
  drawIn(sep, tSep - 0.1, 0.4); drawIn(sep2, tSep, 0.4); sfx('pop', tSep, { g: 0.55, p: 0.4 });
  const fbL = tx(cmp, 't4', '行与索引分开', 1000, 810, { fontWeight: 500 }); wipe(fbL, tSep + 0.2, { dir: 'l', d: 0.4 });
});
