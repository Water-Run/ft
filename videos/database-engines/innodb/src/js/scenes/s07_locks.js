// 第 07 章 同时写：锁。
// 主画面：缓冲池里叶页 27 的五条记录（2048–2052，偏移与名字取自 D.del.start，D3 那次实验落盘解析），记录链连着；
// 下方 Alice、Carol 两条泳道。先一闪 MyISAM 的整表锁，再收成 InnoDB 只锁 2050 这一条；Carol 改 2050 在泳道上等到超时，改 2051 直接完成。
// 然后是死锁：Alice 持有 2049 要 2051，Carol 持有 2051 要 2049，两条等待的弧围成一个环，InnoDB 回滚 Carol。
// 锁的模式与状态取自 D.locks（X5 的 performance_schema.data_locks），报错原文取自 D.locks.carolErr / deadErr（X5、X7）。
scene('s7', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  const st = h('style', null, root);
  st.textContent = `
.s7-rec { position: absolute; width: 280px; height: 140px; background: var(--panel); border: 1.5px solid var(--mainD); padding: 10px 16px; }
.s7-rec .o { font: 500 22px "Inter", "Sans SC"; color: var(--ink2); }
.s7-rec .i { font: 700 44px "Inter"; color: var(--ink); line-height: 1.15; }
.s7-rec .n { font: 500 22px "Mono"; color: var(--ink2); }
.s7-rec.me .i { color: var(--main); }
.s7-whole { border: 4px solid var(--acc) !important; }
.s7-hl { border: 3px solid var(--acc) !important; }
.s7-ring { position: absolute; width: 64px; height: 64px; border: 3px solid var(--main); }
.s7-own { position: absolute; font: 700 22px "Inter"; color: #fff; background: var(--mainD); padding: 2px 8px; }
.s7-own.c { background: var(--acc); }
.s7-dl { position: absolute; font: 500 22px "Mono", "Sans SC"; color: var(--ink); white-space: pre; line-height: 1.55; }
.s7-dl .h { color: var(--ink2); }
.s7-dl .g { color: var(--main); font-weight: 700; }
.s7-dl .w { color: var(--acc); font-weight: 700; }
.s7-dl .z { font-family: "Sans SC"; color: var(--ink2); }
.s7-st { position: absolute; padding: 6px 14px 7px; font: 600 24px "Inter", "Sans SC"; white-space: pre; }
.s7-st.hold { background: var(--mainD); color: #fff; }
.s7-st.wait { border: 2px dashed var(--acc); color: var(--acc); }
.s7-st.ok { border: 2px solid var(--main); color: var(--main); }
.s7-st.err { background: var(--acc); color: #fff; }
`;
  const REC = D.del.start.records;                                       // 2048–2052（D3）
  const box = boxEl(W, 120, 100, 1680, 310, '');
  const bt = h('div', 'abs t-small', box, '缓冲池 · 叶页 27 · 按编号连成链的记录'); px(bt, 22, 12);
  const RX = (i) => 160 + i * 330, RY = 210;
  const recs = REC.map((r, i) => {
    const e = h('div', 's7-rec' + (r.id === 2050 ? ' me' : ''), W, `<div class="o">偏移 ${r.offset}</div><div class="i">${r.id}</div><div class="n">${r.name.length > 12 ? r.name.slice(0, 9) + '…' : r.name}</div>`);
    px(e, RX(i), RY); e.dataset.name = '记录' + r.id; return e;
  });
  const idx = (id) => REC.findIndex((r) => r.id === id);
  const cx = (id) => RX(idx(id)) + 140;
  const ov = overlay(W);
  const chain = REC.slice(0, -1).map((r, i) => path(ov, `M${RX(i) + 284},${RY + 70} L${RX(i + 1) - 6},${RY + 70}`, 'mainD', { w: 2 }));

  wipe(box, c0 + 0.1, { dir: 'l', d: 0.5 }); slide(bt, c0 + 0.3, { x: -20 });
  recs.forEach((e, i) => slide(e, c0 + 0.25 + i * 0.08, { y: 24 }));
  chain.forEach((p, i) => arrowIn(p, c0 + 0.6 + i * 0.08, 0.3));
  sfx('whoosh', c0 + 0.1, { g: 0.4 });

  // 泳道（前半段，带播放头）
  const tA = T('g3', '2050'), tCw = T('g4', '2050'), tTo = T('g5', '超时'), tC2 = T('g6', '别的行');
  const LN = lanes(W, { x: 120, y: 540, w: 1680, gap: 200, rowH: 130, names: ['Alice', 'Carol'],
    pts: [[c0, 330], [tA, 430], [tCw, 640], [tTo, 1060], [tC2, 1240], [Tend('g7'), 1400]] });
  LN.enter(c0 + 0.5);

  // g1：两个人要改同一行——两人的 UPDATE 都指向 2050（先只是意图，虚线）
  const want = [0, 1].map((i) => path(ov, `M${330 + i * 30},${LN.Y(i) - 20} C${330 + i * 30},460 ${cx(2050) - 40 + i * 80},440 ${cx(2050) - 20 + i * 40},${RY + 146}`, 'mute', { w: 2, dashed: '6 7' }));
  want.forEach((p, i) => arrowIn(p, T('g1', '同一行') + i * 0.15, 0.6));
  want.forEach((p) => svgOut(p, T('g2') - 0.1, 0.3));

  // g2：MyISAM 锁整张表（大锁罩住整页）→ InnoDB 只锁这一条（大锁收到 2050 上面）
  const big = lockAt(W, cx(2050) - 13, RY + 50);
  const tMy = T('g2', 'MyISAM'), tIn = T('g2', 'InnoDB');
  // 大锁先压在整页的上沿（MyISAM：整张表），再落到 2050 这一条上（InnoDB）
  tl.fromTo(big, { autoAlpha: 0, y: -186, scale: 3.4 }, { autoAlpha: 1, y: -186, scale: 2.4, duration: 0.35, ease: 'back.out(2)', immediateRender: true }, tMy);
  tl.fromTo(big, { y: -186, scale: 2.4 }, { y: -88, scale: 1, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tIn);
  lit(box, 's7-whole', tMy, tIn + 0.2);
  const myTag = h('div', 'tag acc', W, 'MyISAM：整张表'); px(myTag, 1560, 86);
  slam(myTag, tMy, { from: 1.3 }); exit(myTag, tIn, { y: -10, d: 0.3 }); sfx('thud', tMy + 0.1, { g: 0.6 });
  const inTag = h('div', 'tag', W, 'InnoDB：这一条记录'); px(inTag, cx(2050) + 24, RY - 70);
  slam(inTag, tIn + 0.6, { from: 1.3 }); exit(inTag, tA - 0.1, { y: -10, d: 0.3 }); sfx('pop', tIn + 0.65, { g: 0.6 });

  // g3：Alice 改 2050，没提交，这把锁是她的
  LN.event(0, tA, 'UPDATE 2050', 'fill acc', -56);
  LN.bar(LN.Y(0) - 18, tA, Tend('g7'), '<span>未提交</span>', 'unc');
  const aOwn = h('div', 's7-own', W, 'Alice'); px(aOwn, cx(2050) + 22, RY - 72); slam(aOwn, tA + 0.15, { from: 1.4 });
  // data_locks 实时记录（X5）
  const L1 = D.locks.carol.find((l) => l.type === 'RECORD' && l.status === 'GRANTED');
  const L2 = D.locks.carol.find((l) => l.type === 'RECORD' && l.status === 'WAITING');
  const dl = h('div', 's7-dl', W, `<span class="h">performance_schema.data_locks</span>  <span class="z">锁的实时记录</span>
<span>${L1.idx}  ${L1.data}  ${L1.mode}  <span class="g">${L1.status}</span>  </span><span class="z">← Alice：拿到了</span>
<span class="s7-l2">${L2.idx}  ${L2.data}  ${L2.mode}  <span class="w">${L2.status}</span>  <span class="z">← Carol：在等</span></span>`);
  px(dl, 120, 790);
  const l2 = dl.querySelector('.s7-l2');
  wipe(dl, tA + 0.5, { dir: 'l', d: 0.5 }); vanish(l2, 0); appear(l2, tCw + 0.4);

  // g4–g5：Carol 也要改 2050，只能等；等到超时报错
  LN.event(1, tCw, 'UPDATE 2050', 'acc', -56);
  const wbar = LN.bar(LN.Y(1) - 18, tCw, tTo, '等锁', 'wait');
  const block = path(ov, `M${640},${LN.Y(1) - 70} C${640},470 ${cx(2050) + 60},470 ${cx(2050) + 60},${RY + 150}`, 'acc', { w: 2.2, dashed: '8 7' });
  arrowIn(block, tCw + 0.1, 0.6); svgOut(block, tTo, 0.3);
  const err = LN.event(1, tTo, 'ERROR 1205', 'fill acc', -56);
  sfx('error', tTo, { g: 0.5 });
  const errT = h('div', 'abs', W, `<div class="echo err" style="position:static;font-size:22px">${esc(D.locks.carolErr)}</div><div class="gloss" style="position:static;margin-top:4px">等锁超时，事务要重新开始</div><div class="gloss" style="position:static;margin-top:2px">等待上限 innodb_lock_wait_timeout：缺省 50 秒</div>`);
  px(errT, 1020, 690 + 12); vanish(errT, 0); show(errT, tTo + 0.2, { y: 8, d: 0.4 });
  // g6：Carol 改 2051，不受影响
  LN.event(1, tC2, 'UPDATE 2051', 'ok', -56);
  const ok51 = h('div', 'abs t-h c-main', W, '✓'); px(ok51, 1240 + 86, LN.Y(1) - 76); slam(ok51, tC2 + 0.35, { from: 1.6 });
  const to51 = path(ov, `M1240,${LN.Y(1) - 76} C1240,480 ${cx(2051)},480 ${cx(2051)},${RY + 150}`, 'main', { w: 2.2 });
  arrowIn(to51, tC2 + 0.05, 0.5);
  // g7：锁住的只是这一条——锁一跳
  const ring = h('div', 's7-ring', W); px(ring, cx(2050) - 32, RY - 66);
  slam(ring, T('g7', '这一行'), { from: 1.8, d: 0.4 }); exit(ring, T('g7', '这一行') + 1.2, { d: 0.4 });
  LN.playhead(c0 + 0.6, Tend('g7'), 490, 700);

  // ── 后半段：死锁（状态图，不按时间轴排）──
  const tClr = T('g8') - 0.1;
  const clear1 = [aOwn, dl, errT, ok51, ...W.querySelectorAll('.pill, .vbar')];    // ERROR 1205 本身是 .pill，已在其中，不能退场两次          // 播放头由它自己的帧函数在 g7 之后藏起，不再补间
  clear1.forEach((e) => exit(e, tClr, { y: -12, d: 0.3 }));
  exit(big, tClr, { d: 0.3 }); svgOut(to51, tClr, 0.3);

  // g8：互相等待——两条将要争的记录先亮出来
  [2049, 2051].forEach((id, i) => lit(recs[idx(id)], 's7-hl', T('g8', '互相') + i * 0.35, T('g9', '2049')));
  const tA9 = T('g9', '2049'), tAw = T('g9', '又要'), tC10 = T('g10', '2051'), tCwt = T('g10', '又要');
  const tDl = T('g11', '死锁'), tDet = T('g12', '发现'), tRb = T('g12', '回滚'), tGo = T('g12', '继续');
  const lockFor = (id, who, t, cls = '') => {
    const lk = lockAt(W, cx(id) - 13, RY - 38, cls); vanish(lk, 0); slam(lk, t, { from: 2 });
    const tag = h('div', 's7-own' + (cls ? ' c' : ''), W, who); px(tag, cx(id) + 22, RY - 72); slam(tag, t + 0.1, { from: 1.4 }); sfx('thud', t + 0.05, { g: 0.5 });
    return [lk, tag];
  };
  const stAt = (i, x, text, cls, t) => { const e = h('div', 's7-st ' + cls, W, text); px(e, x, LN.Y(i) - 22); slide(e, t, { x: -20 }); return e; };
  // Alice 持有 2049，又要 2051
  const [aLk, aTg] = lockFor(2049, 'Alice', tA9);
  stAt(0, 330, '持有 2049', 'hold', tA9);
  const arcA = path(ov, `M${cx(2049)},${RY - 52} C${cx(2049)},${RY - 108} ${cx(2051) - 90},${RY - 108} ${cx(2051) - 40},${RY - 8}`, 'acc', { w: 3, dashed: '10 8' });
  arrowIn(arcA, tAw, 0.7);
  const aW = stAt(0, 560, '等 2051', 'wait', tAw + 0.2);
  // Carol 持有 2051，又要 2049
  const [cLk, cTg] = lockFor(2051, 'Carol', tC10, 'acc');
  stAt(1, 330, '持有 2051', 'hold', tC10);
  const arcC = path(ov, `M${cx(2051)},${RY + 146} C${cx(2051) - 60},${RY + 196} ${cx(2049) + 60},${RY + 196} ${cx(2049)},${RY + 150}`, 'acc', { w: 3, dashed: '10 8' });
  arrowIn(arcC, tCwt, 0.7);
  const cW = stAt(1, 560, '等 2049', 'wait', tCwt + 0.2);
  // 一颗点沿着环走一圈：Alice 等 Carol，Carol 又等 Alice
  const dot = svg('circle', { r: 9, fill: '#B5452E', cx: -50, cy: -50 }, ov);
  const tD0 = Tend('g10') + 0.05, tD1 = T('g11', '死锁') + 0.2;
  F((t) => {
    if (t < tD0 || t > tD1) { dot.setAttribute('cx', -50); return; }
    const u = (t - tD0) / (tD1 - tD0), pth = u < 0.5 ? arcA : arcC, k = u < 0.5 ? u * 2 : (u - 0.5) * 2;
    const p = pth.getPointAtLength(k * pth.getTotalLength()); dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1));
  });
  // g11：两条等待围成一个环——死锁
  [arcA, arcC].forEach((p) => to(p, tDl, { attr: { 'stroke-width': 5 }, duration: 0.3 }));
  const dTag = h('div', 'tag acc', W, '死锁'); px(dTag, (cx(2049) + cx(2051)) / 2 - 28, RY + 172);
  css(dTag, { fontSize: '30px', padding: '4px 14px' }); slam(dTag, tDl, { from: 1.5 }); sfx('error', tDl, { g: 0.4 });
  // g12：InnoDB 发现死锁，回滚 Carol；Alice 拿到 2051，继续
  const det = h('div', 'tag', W, 'InnoDB 选中回滚：Carol'); px(det, 1150, 450);
  slam(det, tDet, { from: 1.3 });
  [cLk, cTg, cW].forEach((e) => exit(e, tRb, { y: -14, d: 0.35 })); svgOut(arcC, tRb, 0.35); exit(dTag, tRb, { d: 0.3 });
  const cErr = stAt(1, 800, 'ERROR 1213 · 回滚', 'err', tRb + 0.1);
  const dErr = h('div', 'abs', W, `<div class="echo err" style="position:static;font-size:22px">${esc(D.locks.deadErr)}</div><div class="gloss" style="position:static;margin-top:4px">发现死锁：这个事务被回滚，要重新开始</div>`);
  px(dErr, 800, LN.Y(1) + 36); vanish(dErr, 0); show(dErr, tRb + 0.3, { y: 8, d: 0.4 });
  svgOut(arcA, tGo, 0.3); exit(aW, tGo, { d: 0.3 });
  lockFor(2051, 'Alice', tGo + 0.2);
  stAt(0, 560, '拿到 2051 · 完成', 'ok', tGo + 0.3);
  sfx('chime', tGo + 0.3, { g: 0.45 });

  W.appendChild(ov);
});
