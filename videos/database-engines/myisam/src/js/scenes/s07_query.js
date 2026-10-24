// 07 一次查询的全过程。主画面：在十万行的 users_big 里按主键找 4242。每读一页，就有一块从底下的 .MYI 文件飞上来：
// 根页 @175104（页内二分 9 → 4 → 2 → 1 → 0）→ 中间页 @3072 → 叶子页 @95232 → 行号 4241 → 4241 × 16 = 67856 →
// 从 .MYD 读出 16 个字节，解码，交还上层。读过的三页留在键缓存里，再查一次就不用读磁盘。全部取自 snap_05（FACTS「07」）。
scene('s7', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const B = R.big;

  // 上层：查询与接口调用
  const sql = h('div', 'blk mono', world); px(sql, 120, 124, 1020, 88); css(sql, { fontSize: '30px', lineHeight: '84px', paddingLeft: '24px' });
  const sqlIn = h('span', '', sql);
  appear(sql, c0 + 0.1);
  typeText(sqlIn, '<span class="c-o">mysql&gt;</span> <span class="k">SELECT</span> * <span class="k">FROM</span> users_big <span class="k">WHERE</span> id = 4242;', T('g2', '主键') - 0.6, 40, { cursorUntil: T('g3'), sfxGain: 0.5 });
  const call = h('div', 'blk mono', world, 'index_read_map(4242)'); px(call, 1180, 124, 440, 88); css(call, { fontSize: '30px', lineHeight: '84px', textAlign: 'center', color: '#F29111' });
  slide(call, T('g3', '接口') - 0.2, { x: -24, d: 0.4 }); sfx('pop', T('g3', '接口'), { g: 0.5 });

  // 底下：两个文件
  const myi = h('div', 'abs', world); px(myi, 120, 860, 760, 44); css(myi, { background: '#1f4a54' });
  const myd = h('div', 'abs', world); px(myd, 980, 860, 840, 44); css(myd, { background: '#2b606c' });
  const myiL = tag(world, 120, 914, `users_big.MYI  ${B.keyFileLength.toLocaleString('en-US')} 字节`), mydL = tag(world, 980, 914, `users_big.MYD  ${B.dataFileLength.toLocaleString('en-US')} 字节`);
  wipe(myi, c0 + 0.3, { dir: 'l', d: 0.5 }); wipe(myd, c0 + 0.45, { dir: 'l', d: 0.5 }); appear(myiL, c0 + 0.5); appear(mydL, c0 + 0.6);

  // 三页：根、中间、叶子。每页一行键格，只画用得到的那一段
  const PAGES = [
    { y: 290, at: B.root.pos, name: '根页', keys: B.root.keys.slice(0, 11).map((k) => k[0]), more: true },
    { y: 424, at: B.node.pos, name: '中间页', keys: ['102', '204', '…', '3978', '4080', '4182', '4284', '4386', '…'], more: false },
    { y: 558, at: B.leaf.pos, name: '叶子页', keys: ['4183', '…', '4239', '4240', '4241', '4242', '4243', '4244', '…', '4283'], more: false },
  ];
  const CW = 108, KX = 470;
  const pg = PAGES.map((P) => {
    const box = h('div', 'blk', world); px(box, 120, P.y, 1700, 96);
    const nm = h('div', 'abs mono', box, `${P.name} <span class="c-d">@${P.at}</span>`); px(nm, 20, 26); css(nm, { fontSize: '28px', color: '#d9d9d9' });
    const cells = P.keys.map((k, i) => { const e = h('div', 'abs mono', box, String(k)); px(e, KX - 120 + i * CW, 18, CW - 10, 60); css(e, { fontSize: '28px', lineHeight: '58px', textAlign: 'center', color: '#8a8a8a', border: k === '…' ? '0' : '2px solid #2c2e31' }); return e; });
    if (P.more) { const e = h('div', 'abs mono', box, '… 共 20 个'); px(e, KX - 120 + 11 * CW + 4, 18); css(e, { fontSize: '26px', lineHeight: '58px', color: '#808080' }); cells.push(e); }
    return { box, cells, P };
  });
  // 一次读页：从 .MYI 的对应位置飞上来一块，落成这一页
  const flyFrom = (pos) => 120 + pos / B.keyFileLength * 760;
  const readPage = (i, t, quiet) => {
    const P = pg[i].P, blk = h('div', 'abs', world); css(blk, { background: '#F29111' });
    fromTo(blk, t, { left: flyFrom(P.at), top: 860, width: 14, height: 44, autoAlpha: 1 }, { left: 120, top: P.y, width: 1700, height: 96, duration: 0.55, ease: 'power3.inOut' });
    vanish(blk, 0); appear(blk, t); vanish(blk, t + 0.56);
    appear(pg[i].box, t + 0.55);
    if (!quiet) { sfx('drive', t, { g: 0.55 }); sfx('thud', t + 0.55, { g: 0.4 }); }
  };
  // 文件头给出根页的位置
  const hdr = h('div', 'abs mono', world, `文件头 key_root[0] = <span class="c-o">${B.root.pos}</span>`); px(hdr, 120, 800); css(hdr, { fontSize: '28px', color: '#8a8a8a' });
  appear(hdr, T('g4', '文件头') - 0.1); sfx('tick', T('g4', '文件头'), { g: 0.5 });
  pg.forEach((p) => vanish(p.box, 0));
  readPage(0, T('g4', '读入') - 0.2);
  hide(hdr, T('g5') - 0.2, { y: 0, d: 0.3 });
  // 二分查找：9 → 4 → 2 → 1 → 0；4242 比第一个键 4692 还小，走第 0 个子页
  const probe = ring(world, { x: 0, y: 0, w: CW - 2, h: 66 });
  const order = [9, 4, 2, 1, 0], tB0 = T('g5', '二分') - 0.1, tB1 = T('g5', '确定') - 0.1;
  vanish(probe, 0); appear(probe, tB0);
  F((t) => { const k = Math.min(order.length - 1, Math.max(0, Math.floor((t - tB0) / ((tB1 - tB0) / order.length)))); probe.style.left = (120 + KX - 120 + order[k] * CW - 6) + 'px'; probe.style.top = (290 + 15) + 'px'; });
  order.forEach((ix, j) => sfx('tick', tB0 + j * (tB1 - tB0) / order.length, { g: 0.4 }));
  classAt(pg[0].cells[0], 'c-o', tB1);
  const why = tag(world, 120 + KX - 120, 290 + 102, '4242 < 4692：走第一个子页', 'c-o'); appear(why, tB1 - 0.1);
  vanish(probe, T('g6') - 0.1);
  // 再向下两层
  const tMid = T('g6', '两层') - 0.3;
  readPage(1, tMid);
  classAt(pg[1].cells[5], 'c-o', tMid + 0.7); classAt(pg[1].cells[6], 'c-o', tMid + 0.7);
  const why2 = tag(world, 120 + KX - 120 + 5 * CW, 424 + 102, '4182 ≤ 4242 < 4284', 'c-o'); appear(why2, tMid + 0.8); vanish(why, tMid);
  const tLf = T('g6', '叶子') - 0.2;
  readPage(2, tLf);
  vanish(why2, tLf + 0.6);
  const hit = ring(world, { x: 120 + KX - 120 + 5 * CW - 6, y: 558 + 15, w: CW + 2, h: 66 });
  vanish(hit, 0); appear(hit, T('g6', '4242') - 0.1); classAt(pg[2].cells[5], 'c-o', T('g6', '4242') - 0.1); sfx('chime', T('g6', '4242'), { g: 0.4 });
  // 叶子项：键 4242，旁边记着行号 4241
  const leafE = h('div', 'abs mono', world, '<span class="c-t">00 00 10 92</span>  <span class="c-o">00 00 00 00 10 91</span>   →  键 4242，行号 <span class="c-o">4241</span>'); px(leafE, 120 + KX - 120, 672); css(leafE, { fontSize: '30px', color: '#d9d9d9' });
  slide(leafE, T('g7', '行号') - 0.4, { y: -16, d: 0.4 }); sfx('pop', T('g7', '行号'), { g: 0.5 });
  // 行号 × 16 → 数据文件里的偏移 67856
  const offE = h('div', 'abs mono', world, `4241 × 16 = <span class="c-o">${B.rowOffset}</span>`); px(offE, 980, 800); css(offE, { fontSize: '30px', color: '#d9d9d9' });
  appear(offE, T('g8', '乘以') - 0.2);
  const mx = 980 + B.rowOffset / B.dataFileLength * 840;
  const mark = h('div', 'abs', world); px(mark, mx - 2, 846, 5, 72); css(mark, { background: '#F29111' });
  appear(mark, T('g8', '偏移') - 0.2); sfx('tick', T('g8', '偏移'), { g: 0.5 });
  // 读出 16 个字节，按列解码
  const rb = B.row4242.match(/../g);
  const rowEl = h('div', 'abs', world); px(rowEl, 120, 736, 1700, 60);
  rb.forEach((b, c) => { const e = h('div', 'abs mono ' + userCls(c, b), rowEl, b); px(e, c * 54, 0, 50, 60); css(e, { fontSize: '30px', lineHeight: '60px', textAlign: 'center' }); });
  const dec = h('div', 'abs mono', rowEl, '→  4242 · u592299 · 60'); px(dec, 16 * 54 + 30, 0); css(dec, { fontSize: '30px', lineHeight: '60px', color: '#F29111' });
  const tR = T('g9', '十六') - 0.3;
  const blk = h('div', 'abs', world); css(blk, { background: '#F29111' });
  fromTo(blk, tR, { left: mx - 7, top: 860, width: 14, height: 44 }, { left: 120, top: 736, width: 16 * 54, height: 60, duration: 0.5, ease: 'power3.inOut' });
  vanish(blk, 0); appear(blk, tR); vanish(blk, tR + 0.51); sfx('drive', tR, { g: 0.5 });
  vanish(rowEl, 0); appear(rowEl, tR + 0.5); vanish(dec, 0); appear(dec, T('g9', '解码') - 0.1);
  hide(leafE, tR - 0.2, { y: 0, d: 0.2 });
  // 交还上层
  const back = h('div', 'abs mono', world, '4242 · u592299 · 60'); css(back, { fontSize: '30px', color: '#0b0b0c', background: '#F29111', padding: '4px 12px' });
  const tUp = T('g9', '交还') - 0.2;
  fromTo(back, tUp, { left: 16 * 54 + 150, top: 744, autoAlpha: 1 }, { left: 1190, top: 140, duration: 0.7, ease: 'power3.inOut' });   // 落在接口上：结果经接口交还上层
  vanish(back, 0); appear(back, tUp); vanish(back, tUp + 0.72); sfx('whoosh', tUp, { g: 0.4 });
  keyed(call).at(tUp + 0.7, { html: '4242 · u592299 · 60', cls: 'blk mono f-hot' }); sfx('pop', tUp + 0.7, { g: 0.5 });
  // 三次读页，一次读行
  const tally = h('div', 'abs mono', world, '读页 <span class="c-o">3</span> 次 · 读行 <span class="c-o">1</span> 次'); px(tally, 1190, 228); css(tally, { fontSize: '32px', color: '#d9d9d9' });
  appear(tally, T('g10', '三次') - 0.1); sfx('chime', T('g10', '完成'), { g: 0.45 });

  // 键缓存：三页留在内存里；再查一次，不读磁盘
  const cache = h('div', 'abs', world); px(cache, 104, 276, 1732, 392); css(cache, { border: '3px solid #3fb4cc' });
  const cacheL = h('div', 'abs', world, '键缓存（内存）'); px(cacheL, 1520, 652); css(cacheL, { font: '500 30px "Sans SC"', color: '#3fb4cc', background: '#0b0b0c', padding: '0 10px' });
  wipe(cache, T('g11', '键缓存') - 0.4, { dir: 'l', d: 0.6 }); appear(cacheL, T('g11', '键缓存') - 0.2); sfx('pop', T('g11', '键缓存'), { g: 0.5 });
  hide([rowEl, back], T('g11') - 0.3, { y: 0, d: 0.3 });
  const t2 = T('g11b', '再查') - 0.1;
  const again = ring(world, { x: 112, y: 282, w: 1716, h: 108 }, 't');
  vanish(again, 0); appear(again, t2);
  fromTo(again, t2 + 0.3, { y: 0 }, { y: 268, duration: 1.2, ease: 'power2.inOut' });
  vanish(again, t2 + 1.8);
  keyed(tally).at(t2, { html: '再查一次：从磁盘读页 <span class="c-t">0</span> 次' }); sfx('tick', t2, { g: 0.5 }); sfx('chime', t2 + 1.5, { g: 0.4 });
  // 数据文件交给操作系统缓存
  const os = h('div', 'abs', world); px(os, 964, 846, 872, 72); css(os, { border: '3px dashed #808080' });
  const osL = tag(world, 1500, 800, '操作系统的文件缓存', 'c-d');
  wipe(os, T('g12', '操作系统') - 0.3, { dir: 'l', d: 0.5 }); appear(osL, T('g12', '操作系统')); sfx('pop', T('g12', '操作系统'), { g: 0.45 });
  vanish(offE, T('g12') - 0.4);

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.02 }, T('g4') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('g5') - 0.3, { x: 900, y: 360, z: 1.25 }, 0.9, { g: 0.4 }],
    [T('g6') - 0.2, { x: 960, y: 520, z: 1.05 }, 0.8, { sfx: false }],
    [T('g8') - 0.3, { x: 1100, y: 700, z: 1.2 }, 0.9, { g: 0.4 }],
    [T('g9', '交还') - 0.3, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.02 }, s.end - T('g9', '交还') - 1.3, { ease: 'none', sfx: false }],
  ]);
});
