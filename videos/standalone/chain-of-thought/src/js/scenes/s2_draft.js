// 02 草稿：人把一步步的结果写在纸上；模型没有别的纸，只能写进回答里。写下的每个中间结果，交给下一趟接着算——一趟一趟摞起来。
// 事实：S14（scratchpad）；L3 §3（先写过程 321 块，拆成 92000 + 138）；S3、S7（写成字才能接力）；S1 §3.3 与表 6（一串点）；L1（39/100、99/100）。
scene('draft', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const NP = 64, GAP = 7.5, H = NP * GAP, BW = 150, BD = 100;   // 64 张一摞（一张一层），高 480
  const mk = chapterMark(W, s, '02', '草稿', -1500, 900, T('b1') + 0.6);

  // ── 人的草稿：印在纸上，一行一行写出来；每行的结果，下一行接着用 ──
  const HX = -980, HY = -20, LH = 120;
  const HAND = ['92138 = 92000 + 138', '25992 × 92000 = <u>2391264000</u>', '25992 × 138 = <u>3586896</u>', '<u>2391264000</u> + <u>3586896</u> = 2394850896'];
  const hand = HAND.map((txt, i) => {
    const e = W.print(`<div class="hand">${txt}</div>`, HX, HY + i * LH);
    const ta = T('b1', '纸') + 0.2 + i * 0.9;
    fade(W, e, (t) => ramp(t, ta, 0.35) * (1 - ramp(t, T('b3', '没有别的纸') - 0.1, 0.8)));
    sfx('key', ta, { g: 0.25 });
    return e;
  });
  // 「下一步就从纸上这个数接着算」：页边一道往下的箭头，从写下的第 2 行指到第 4 行
  trace(W, S, [[HX - 46, HY + LH + 20], [HX - 46, HY + 3 * LH + 30]], { color: '#1c1c1c', w: 4, draw: (t) => ramp(t, T('b2', '接着算') - 0.5, 0.8, ease.io3) * (1 - ramp(t, T('b3', '没有别的纸') - 0.1, 0.8)) });
  sfx('tick', T('b2', '接着算') - 0.5, { g: 0.14 });

  // ── 模型的回答：一长串方块，从左往右写下去（三百多块；画面上只写出前面一段） ──
  const REPLY = ['92', '138', ' =', ' 92', '000', ' +', ' 138', '\n', '259', '92', ' ×', ' 92', '000', ' =', ' 2', ',391', ',264', ',000', '\n', '259', '92', ' ×', ' 138', ' =', ' 3', ',586', ',896', '\n', '2', ',391', ',264', ',000', ' +', ' 3', ',586', ',896', ' =', ' 2', ',394', ',850', ',896'];
  const RX0 = -900, RY = 0, rows = []; let rx = RX0, ry = RY;
  const KEY1 = 15, KEY2 = 16, KEY3 = 17;           // 2,391,264,000 这一串：下面拿它演接力
  REPLY.forEach((tk, i) => {
    if (tk === '\n') { rx = RX0; ry += 140; return; }
    const w = 30 * tk.trim().length + 44;
    rows.push({ tk: tk.trim(), x: rx + w / 2, y: ry, w, i }); rx += w + 10;
  });
  const tw0 = T('b3', '打草稿') - 0.2, cps = 9;
  const rowsY1 = RY + 140;
  const k0y = rows.find((r) => r.i === KEY1).y;
  const blocks = rows.map((r, j) => {
    const b = block(S, `<span class="tx">${r.tk}</span>`, { w: r.w, d: 84, h: 22, fs: 40 });
    const farOff = (t) => 1 - ramp(t, T('b4') - 0.3, 0.4) * (1 - ramp(t, T('b5') - 0.5, 0.4));   // 退远看三百块时字太小，先淡去
    if (r.y === rowsY1) twoFace(W, b, r.tk, 26, farOff);   // 接力那一行：侧面平视时字印在正面
    else fade(W, b.top.firstChild, (t) => (1 - ramp(t, T('b6') - 0.4, 0.5)) * farOff(t));
    const ta = tw0 + j / cps;
    if (j % 4 === 0) sfx('key', ta, { g: 0.12 });
    place(W, b.g, (t) => ({ x: r.x, y: r.y, z: 40 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * (r.y === k0y ? 1 - 0.7 * ramp(t, T('b8'), 0.8) : 1 - ramp(t, T('b6') - 0.6, 0.5)) * (1 - ramp(t, T('b12') - 0.4, 0.4)) }));
    return b;
  });
  const stepOff = (t) => 1 - ramp(t, T('b6') - 0.6, 0.4);
  const rowEnd = (y) => Math.max(...rows.filter((r) => r.y === y).map((r) => r.x + r.w / 2));
  const st1 = W.board('<div class="lbl l g">拆开</div>', rowEnd(RY) + 40, RY, 20, 0, -34);
  const st2 = W.board('<div class="lbl l g">分别乘</div>', rowEnd(RY + 140) + 40, RY + 210, 20, 0, -34);
  const st3 = W.board('<div class="lbl l g">再相加</div>', rowEnd(RY + 420) + 40, RY + 420, 20, 0, -34);
  fade(W, st1, (t) => ramp(t, T('b5', '拆成') - 0.2, 0.3) * stepOff(t));
  const st1b = W.board('<div class="lbl l">92000 + 138</div>', rowEnd(RY) + 200, RY, 20, 0, -34); fade(W, st1b, (t) => ramp(t, T('b5', '加一百') - 0.2, 0.3) * stepOff(t)); fade(W, st2, (t) => ramp(t, T('b5b', '分别跟') - 0.2, 0.3) * stepOff(t)); fade(W, st3, (t) => ramp(t, T('b5b', '加起来') - 0.2, 0.3) * stepOff(t));
  sfx('tick', T('b5', '拆成') - 0.2, { g: 0.15 }); sfx('tick', T('b5b', '相乘') - 0.2, { g: 0.15 }); sfx('tick', T('b5b', '加起来') - 0.2, { g: 0.15 });
  // 后面还有很多：一行行写满（约三百块），最后一块是答案。讲「三百多块」时镜头退远看全，讲具体步骤时再回到前四行
  const MR = 12, MC = 22, MY0 = RY + 4 * 140, MLH = 110, many = [];
  const tm0 = T('b4') + 0.1, tm1 = T('b4', '三百多块') + 0.2, manyOff = (t) => 1 - ramp(t, T('b5') - 0.6, 0.5);
  for (let r = 0; r < MR; r++) for (let c = 0; c < MC; c++) {
    const last = r === MR - 1 && c >= MC - 4;
    const b = block(S, last ? '' : '', { w: 70, d: 70, h: 14, cls: last ? '' : 'dim' });
    if (!last) { const bar = h('div', 'scrib', b.top); css(bar, { width: '40px' }); }
    const ta = lerp(tm0, tm1, (r * MC + c) / (MR * MC - 1)), x = RX0 + 35 + c * 80, y = MY0 + r * MLH;
    place(W, b.g, (t) => ({ x, y, z: 0, o: ramp(t, ta, 0.15) * manyOff(t) }));
    many.push({ x, y });
  }
  const ansBig = block(S, '答案', { w: 300, d: 80, h: 20, fs: 44 });
  place(W, ansBig.g, (t) => ({ x: RX0 + 35 + MC * 80 + 140, y: MY0 + (MR - 1) * MLH, z: 30 * (1 - ramp(t, tm1, 0.3, ease.out3)), o: ramp(t, tm1, 0.2) * manyOff(t) }));
  sfx('riser', tm0, { g: 0.12 });
  const cnt = W.board('<div class="lbl xl">答案之前：三百多块</div>', RX0 + 35 + MC * 80 + 40, MY0 + (MR - 1) * MLH / 2, 30, 0, -70);
  fade(W, cnt, (t) => ramp(t, T('b4', '三百多块') - 0.2, 0.4) * (1 - ramp(t, T('b5') - 0.4, 0.4)));

  // ── 接力与摞起来：2,391,264,000 后面立起第一摞，下一摞从它写下的字接着往上；又立起四摞；然后六摞依次抬起，一摞摞在上一摞顶上 ──
  const k0 = rows.find((r) => r.i === KEY1), k1 = rows.find((r) => r.i === KEY3);
  const ky = k0.y - 170, NS = 6;
  const hot = (t) => t >= T('b6', '写成字') - 0.1 && t < T('b8') + 0.2;
  [KEY1, KEY2, KEY3].forEach((i) => { const b = blocks[rows.findIndex((r) => r.i === i)]; let last = null; W.up((t) => { const on = hot(t); if (on !== last) { b.g.classList.toggle('hot', on); last = on; } }); });
  const SX = k0.x + 700, SY = ky - 260;            // 摞在这里
  const tS = T('b8') + 0.3;   // 一开口就开始摞，不让画面空等
  const stackAt = (i) => tS + 0.3 + i * 0.4;
  const squash = () => 1;
  const tCol = T('b8b') - 0.3, tColD = Tend('b8b') + 1.6 - tCol;   // 「接得越高」：塔从这里一直长出画面
  const ups = [[T('b6') - 0.2, T('b6') + 0.3, 1.6], [T('b7') - 0.2, T('b7', '接着') - 0.2, 1.6]];
  for (let i = 2; i < NS; i++) ups.push([T('b8') - 0.3 + (i - 2) * 0.15, T('b8') + (i - 2) * 0.15, 0.7]);
  for (let i = 0; i < NS; i++) {
    const x0 = k0.x + i * 190, y0 = ky;
    const [tu, tf, df] = ups[i];
    ream(W, S, x0, y0, { w: 150, d: 100, gap: GAP, n: NP,
      rise: (t) => ramp(t, tu, 0.7, ease.out3) * squash(t),
      fill: (t) => ramp(t, tf, df, (k) => k),
      pos: (t) => { const k = ramp(t, stackAt(i), 0.75); return [lerp(x0, SX, k), lerp(y0, SY, k)]; },
      z: (t) => { const k = ramp(t, stackAt(i), 0.75); return lerp(0, i * (H + 6), k) * squash(t) + Math.sin(k * Math.PI) * 140; },
      op: (t) => 1 - ramp(t, T('b12') - 0.4, 0.4) });
    sfx('tick', stackAt(i) + 0.7, { g: 0.2 });
  }
  const rwl = wall(S, k0.x - 260, ky + 51, 900, H + 80);
  const rx0 = rwl.X(k0.x), rg = rwl.X(k0.x + 95), rx1 = rwl.X(k0.x + 190), rtop = rwl.Y(H + 18), rbot = rwl.Y(6);
  const rp = [`M${rx0} ${rbot} L${rx0} ${rtop + 14}`, ` Q${rx0} ${rtop} ${rx0 + 14} ${rtop} L${rg - 14} ${rtop} Q${rg} ${rtop} ${rg} ${rtop + 14} L${rg} ${rbot - 14} Q${rg} ${rbot} ${rg + 14} ${rbot} L${rx1 - 14} ${rbot} Q${rx1} ${rbot} ${rx1} ${rbot - 14}`, ` L${rx1} ${rtop + 14}`];
  const rpath = svg('path', { d: rp.join(''), fill: 'none', stroke: '#1c1c1c', 'stroke-width': 3, 'stroke-linejoin': 'round' }, rwl.s);
  const rL = rpath.getTotalLength(), rprobe = svg('path', { d: rp[0] }, rwl.s), rc0 = rprobe.getTotalLength() / rL; rprobe.setAttribute('d', rp[0] + rp[1]); const rc1 = rprobe.getTotalLength() / rL; rprobe.remove();
  rpath.style.strokeDasharray = `${rL.toFixed(1)} ${(rL + 10).toFixed(1)}`;
  const rdot = svg('circle', { r: 9, fill: '#1c1c1c' }, rwl.s);
  const rK = (t) => (t < T('b6', '写成字') - 0.1 ? rc0 * ramp(t, T('b6') + 0.3, Math.max(0.4, T('b6', '写成字') - T('b6') - 0.4), (k) => k)
    : (t < T('b7') ? lerp(rc0, rc1, ramp(t, T('b6', '写成字') - 0.1, 0.8)) : lerp(rc1, 1, ramp(t, T('b7', '读到') - 0.2, 1.6, (k) => k))));
  W.up((t) => {
    const k = rK(t), op = ramp(t, T('b6') + 0.2, 0.3) * (1 - ramp(t, T('b8') - 0.2, 0.4));
    rpath.style.strokeDashoffset = (rL * (1 - k)).toFixed(1); rpath.style.opacity = op.toFixed(3);
    const pt = rpath.getPointAtLength(Math.max(0.01, rL * k)); rdot.setAttribute('cx', pt.x.toFixed(1)); rdot.setAttribute('cy', pt.y.toFixed(1));
    rdot.setAttribute('opacity', (op * (k > 0.002 && k < 0.998 ? 1 : 0)).toFixed(3));
  });
  const rw = W.board('<div class="lbl">写成字</div>', k0.x + 95, k0.y, 0, -60, 36);
  fade(W, rw, (t) => ramp(t, T('b6', '写成字') - 0.1, 0.4) * (1 - ramp(t, T('b8') - 0.2, 0.4)));
  const rr = W.board('<div class="lbl">下一趟从底下读到</div>', k0.x + 190 + 100, ky, H * 0.4, 0, -20);
  fade(W, rr, (t) => ramp(t, T('b7', '读到') - 0.2, 0.4) * (1 - ramp(t, T('b8') - 0.2, 0.4)));

  // 六摞之上，一趟一趟继续往上摞，一直摞出画面（三百多趟，每趟和下面一样高）；旁边是只报答案的四趟
  const SEG = H + 6, base6 = NS * SEG;
  const towerN = (t) => [0, 1, 2, 3, 4, 5].reduce((acc, i) => acc + ramp(t, stackAt(i) + 0.55, 0.2), 0) + nUpF(t);
  const nUp = (t) => lerp(0, 60, Math.pow(ramp(t, tCol, tColD, (k) => k), 1.7));
  function nUpF(t) { return nUp(t); }   // 画到六十多趟就已远远出了画面
  const colUp = column(W, S, SX, SY, { w: 150, d: 100, seg: SEG, n: nUp, op: (t) => 1 - ramp(t, T('b12') - 0.4, 0.4) });
  colUp.g.classList.add('tall');
  colUp.g.style.transform = `translate3d(${SX}px, ${SY}px, ${base6}px)`;
  const stub = column(W, S, SX + 330, SY, { w: 150, d: 100, seg: SEG, n: (t) => 4 * ramp(t, T('b8') + 0.2, 0.8, ease.out3), op: (t) => 1 - ramp(t, T('b12') - 0.4, 0.4) });
  stub.g.classList.add('tall');
  const l1 = W.board('<div class="lbl l" style="transform:translateX(-50%)">只报答案<br>四趟</div>', SX + 330, SY, 4 * SEG + 40, 0, -150);
  const ZEND = 24 * SEG;                         // 升镜停在这个高度
  const l2 = W.board('<div class="lbl xl" style="transform:translateX(-100%)">先写过程<br>三百多趟 ↑</div>', SX - 380, SY, ZEND + 0.6 * SEG, 0, -130);
  // 塔身上的刻度：升镜时一格一格掠过
  [3, 6, 9, 12, 15, 18, 21].forEach((n) => { const z = n * SEG; const tk = seg(S, 'w'); tk.set([SX - 76, SY + 51, z], [SX - 130, SY + 51, z]); const lb = W.board(`<div class="lbl l" style="transform:translateX(-100%)">第 ${n} 趟</div>`, SX - 140, SY + 51, z, 0, -44);
    const on = (t) => clamp(towerN(t) - n + 1.0) * (1 - ramp(t, T('b12') - 0.4, 0.4)); fade(W, tk.e, on); fade(W, lb, on); });
  const l0 = W.board('<div class="lbl l" style="transform:translateX(-100%)">一趟接一趟</div>', SX - 140, SY + 51, 2.6 * SEG, 0, -44);
  fade(W, l0, (t) => ramp(t, stackAt(1) + 0.6, 0.4) * (1 - ramp(t, T('b8b') + 0.4, 0.4)));
  fade(W, l1, (t) => ramp(t, T('b8') + 0.3, 0.5) * (1 - ramp(t, T('b8b') - 0.3, 0.4)));   // 升镜一开始就收走，不滑进字幕区
  fade(W, l2, (t) => ramp(t, T('b8b', '越多') - 0.2, 0.5) * (1 - ramp(t, T('b12') - 0.4, 0.4)));

  // ── 一串点：每一摞都从纸面重新算起，摞不起来 ──
  const DX = SX + 3900, DY = SY + 600;   // 点实验放在一百道的右边（新句序：一百道在前）              // 就在那根立柱的右前方：镜头从立柱一摇就到
  for (let i = 0; i < 9; i++) {
    const x = DX + i * 190;
    const b = block(S, '·', { w: 150, d: 100, h: 24, fs: 110 });
    const ta = T('b9') + 0.2 + i * 0.16, tf = T('b9b') + i * Math.max(0.3, (T('b11', '全是点') - T('b9b')) / 9);
    place(W, b.g, (t) => ({ x, y: DY, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) }));
    const t0_ = T('b11', '全是点') - 0.3, tryK = (t) => (i === 1 ? ramp(t, t0_, 0.8, ease.io3) * (1 - ramp(t, t0_ + 1.8, 0.6, ease.io3)) : 0);
    ream(W, S, x, DY - 150, { w: 150, d: 100, gap: GAP, n: NP, rise: (t) => ramp(t, ta + 0.1, 0.6, ease.out3), fill: (t) => ramp(t, tf, 0.6),
      pos: (t) => [lerp(x, DX + 40, tryK(t)), DY - 150], z: (t) => (H + 30) * tryK(t) });
  }
  const xOn = (t) => ramp(t, T('b11', '全是点') + 2.0, 0.2) * (1 - ramp(t, T('b12') - 0.4, 0.4));
  const XX = DX + 190;   // 叉打在摞不上去、滑回原处的第二摞上
  [[[XX - 90, DY - 98, H - 60], [XX + 90, DY - 98, H + 120]], [[XX + 90, DY - 98, H - 60], [XX - 90, DY - 98, H + 120]]].forEach(([a, b]) => { const e = seg(S, 'e ww'); e.set(a, b); fade(W, e.e, xOn); });
  sfx('error', T('b11', '全是点') + 0.6, { g: 0.14 });
  const dq = W.board('<div class="lbl">多出来的每一趟，写下的都是同一个点</div>', DX + 760, DY + 60, 0, -330, 34);
  fade(W, dq, (t) => ramp(t, T('b11') - 0.2, 0.4));
  const dno = W.board('<div class="lbl l err">摞不起来</div>', DX + 8 * 190 + 100, DY - 150, H * 0.6, 0, -30);
  fade(W, dno, (t) => ramp(t, T('b11', '没东西可接') - 0.3, 0.4));
  const dsrc = W.board('<div class="lbl">谷歌 2022</div>', DX + 760, DY - 150, H + 40, -360, -168);
  fade(W, dsrc, (t) => ramp(t, T('b9b', '谷歌') - 0.2, 0.4));
  const dpt = W.board('<div class="lbl">先输出一串点</div>', DX + 760, DY - 150, H + 40, -360, -110);
  fade(W, dpt, (t) => ramp(t, T('b9b', '一串点') - 0.3, 0.4));
  const dlen = W.board('<div class="lbl">和解题算式一样长</div>', DX + 760, DY - 150, H + 40, -360, -52);
  fade(W, dlen, (t) => ramp(t, T('b9b', '一样长') - 0.3, 0.4));
  const dres = W.board('<div class="lbl g">成绩和直接回答差不多</div>', DX + 760, DY - 150, H + 40, -360, 6);
  fade(W, dres, (t) => ramp(t, T('b10') - 0.2, 0.4));

  // ── 一百道乘法：每种位数一行，每行二十块；答对的立起来，答错的平躺 ──
  const GX = SX + 1100, GY = SY + 500, CW = 66;
  const gridOff = (t) => 1 - ramp(t, T('b9') - 0.6, 0.4);   // 讲点实验时收走一百道   // 一百道紧接在塔之后
  const L1D = [20, 16, 3, 0, 0], L1T = [20, 20, 20, 20, 19];
  // 先铺出一百个平躺的格子（一百道题），讲到成绩时答对的立起来
  const grid = (ox, ok, lab, ta, tb) => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {
      const good = c < ok[r];
      const f = block(S, '', { w: 54, d: 54, h: 5, cls: 'cube no' });
      const t0 = tb + r * 0.12 + c * 0.012;
      place(W, f.g, (t) => ({ x: ox + c * CW, y: GY + r * 100, z: 0, o: ramp(t, t0, 0.25) * gridOff(t) }));
      if (!good) continue;
      const b = block(S, '', { w: 54, d: 54, h: 40, cls: 'cube ok' });
      const tt = ta + r * 0.25 + c * 0.015;
      place(W, b.g, (t) => ({ x: ox + c * CW, y: GY + r * 100, z: 50 * (1 - ramp(t, tt, 0.3, ease.out3)), o: ramp(t, tt, 0.2) * gridOff(t) }));
    }
    const l = W.board(`<div class="lbl l" style="transform:translate(-50%,-100%)">${lab}</div>`, ox + 9.5 * CW, GY - 40, 130, 0, 0); fade(W, l, (t) => ramp(t, ta, 0.4) * gridOff(t));
  };
  grid(GX, L1D, '只报答案　39', T('b13') - 0.2, T('b12', '一百道') - 0.2);
  grid(GX + 1500, L1T, '先写过程　99', T('b13b') - 0.5, T('b12', '一百道') + 0.5);
  // 六位、七位数一道没对：只报答案那一格的最后两行，一圈红框
  rect(W, S, GX - 40, GY + 3 * 100 - 40, 20 * CW + 14, 180, (t) => ramp(t, T('b13', '六位') - 0.2, 0.4) * gridOff(t), 'e');
  sfx('error', T('b13', '六位') - 0.2, { g: 0.1 });
  const g67 = W.board('<div class="lbl l err" style="transform:translateX(-100%)">六位、七位：</div>', GX + 9.5 * CW, GY + 4 * 100 + 60, 0, 0, 10);
  const g67b = W.board('<div class="lbl l err">一道没对</div>', GX + 9.5 * CW, GY + 4 * 100 + 60, 0, 0, 10);
  fade(W, g67, (t) => ramp(t, T('b13', '六位') - 0.2, 0.4) * gridOff(t)); fade(W, g67b, (t) => ramp(t, T('b13', '一道没对') - 0.2, 0.4) * gridOff(t));
  ['三位', '四位', '五位', '六位', '七位'].forEach((d, r) => { const l = W.board(`<div class="lbl l" style="transform:translate(-100%,-50%)">${d}</div>`, GX - 90, GY + r * 100, 0, 0, 0); fade(W, l, (t) => ramp(t, T('b12') + 0.3, 0.4) * gridOff(t)); });

  // ── 先答后写（三句带过）：一行先写答案的回答——只对 36 道；错了的，过程多半顺着错数往回圆；因为答案写下时，后面的过程还没写，接不上 ──
  const VX = DX + 2900, VY = DY, VQW = 520;
  const vq = block(S, '25992 × 92138 =', { w: VQW, d: 90, h: 26, fs: 46 });
  const v0 = T('b14') - 0.3;
  place(W, vq.g, (t) => ({ x: VX + VQW / 2, y: VY, z: 30 * (1 - ramp(t, v0, 0.4, ease.out3)), o: ramp(t, v0, 0.3) }));
  const VP = para(S, VX, VY, ['答案', '：', '239', '484', '129', '6', '\n', '25992', '×', '(', '92000', '+', '138', ')', '\n', '=', '239', '126', '400', '0', '+', '358', '689', '6', '\n', '=', '239', '484', '129', '6'],
    { fs: 42, lh: 112, maxW: 1500, x1st: VX + VQW + 40 });
  const vAns = VP.slice(2, 6), vFin = VP.slice(-4);
  VP.forEach((k, j) => { const ta = j < 6 ? v0 + 0.3 + j * 0.05 : lerp(v0 + 0.8, T('b14') + 1.6, (j - 6) / (VP.length - 7)); place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 24 * (1 - ramp(t, ta, 0.25, ease.out3)), o: ramp(t, ta, 0.18) })); if (j % 3 === 0) sfx('key', ta, { g: 0.12 }); });
  const vl1 = W.board('<div class="lbl l">先写答案：一百道只对 36 道</div>', VX, VY, 30, 0, -140);
  fade(W, vl1, (t) => ramp(t, T('b14b', '三十六') - 0.3, 0.4));
  // 错了的，过程多半顺着错数往回圆：红线印在纸上，从最后一行的行尾沿右边空白回到答案
  const vmr = Math.max(...VP.map((k) => k.x1)) + 70;
  trace(W, S, [[vFin[3].x1 + 14, vFin[3].y], [vmr, vFin[3].y], [vmr, VY], [vAns[3].x1 + 14, VY]], { color: '#a5402d', w: 6, draw: (t) => ramp(t, T('b16') + 0.2, Math.max(1.0, T('b16', '凑回') + 0.4 - T('b16') - 0.2), ease.io3) });
  const vl2 = W.board('<div class="lbl g">算到最后，又凑回错数</div>', vmr + 30, (VY + vFin[3].y) / 2, 20, 0, -20);
  fade(W, vl2, (t) => ramp(t, T('b16', '凑回') - 0.2, 0.4));
  const vl4 = W.board('<div class="lbl l err" style="transform:translateX(-50%)">错数</div>', (vFin[0].x + vFin[3].x) / 2, vFin[0].y + 50, 0, 0, 10);
  fade(W, vl4, (t) => ramp(t, T('b16', '错数') - 0.4, 0.3));
  // 接不上：答案下面一道挡板，往下伸的箭头碰到挡板缩回
  const vwY = VY + 56, vax = vAns[1].x;
  const vstop = seg(S, 'e ww'); vstop.set([vAns[0].x0 - 20, vwY, 0.9], [vAns[3].x1 + 20, vwY, 0.9]);
  const vOn = (t) => ramp(t, T('b15') - 0.2, 0.3);
  fade(W, vstop.e, vOn);
  trace(W, S, [[vax, VY - 20], [vax, vwY - 16]], { color: '#6a6a6a', w: 11, draw: (t) => ramp(t, T('b15', '后面') - 0.2, 0.5) * (1 - ramp(t, T('b15', '接不上') + 0.3, 0.5)), op: vOn });
  const vl3 = W.board('<div class="lbl l err" style="transform:translate(-100%,-100%)">接不上</div>', vAns[3].x1, VY - 50, 20, 0, 0);
  fade(W, vl3, (t) => ramp(t, T('b15', '接不上') - 0.2, 0.3));
  sfx('tick', T('b14b', '三十六') - 0.3, { g: 0.18 }); sfx('error', T('b15', '接不上') - 0.1, { g: 0.12 });

  // ── 镜头：人的草稿正俯视｜模型的回答纸面斜看｜接力侧面立面｜摞起来立面全景，「接得越高」时镜头跟着塔一边升一边仰起来｜一串点立面｜一百道斜俯 ──
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const shHand = fitCam(W, [[HX - 30, HY - 60, 0], [HX + 1250, HY - 60, 0], [HX - 30, HY + 3 * LH + 70, 0], [HX + 1250, HY + 3 * LH + 70, 0]], { pitch: 12 });
  const shReply = fitCam(W, [...rows.map((r) => B(r.x, r.y, r.w, 84, 22)), { el: st1 }, { el: st1b }, { el: st2 }, { el: st3 }], { pitch: 32 });
  const shMany = fitCam(W, [...rows.map((r) => B(r.x, r.y, r.w, 84, 22)), B(RX0 + 35 + (MC - 1) * 40, MY0 + (MR - 1) * MLH / 2, MC * 80, MR * MLH, 14), B(RX0 + 35 + MC * 80 + 140, MY0 + (MR - 1) * MLH, 300, 80, 20), { el: cnt }], { pitch: 30 });
  const keyRow = rows.filter((r) => r.y === k0y);
  const shRelay = fitCam(W, [...keyRow.slice(0, 12).map((r) => B(r.x, r.y, r.w, 84, 22)), B(k0.x, ky, 150, 100, H + 30), B(k0.x + 190, ky, 150, 100, H + 30), { el: rw }, { el: rr }], { pitch: 84 });
  // 升镜：塔放在画面右侧（屏幕 x≈1420），避开居中的字幕；短柱与「四趟」在它左边
  const KR = 0.62, offX = (1560 - 960) / KR;
  const shRise0 = { cx: SX - offX, cy: SY, cz: 3.2 * SEG, pitch: 88, yaw: 0, k: KR };
  const shRise1 = { cx: SX - offX, cy: SY, cz: ZEND, pitch: 90, yaw: 0, k: KR };
  const dotItems = [];
  for (let i = 0; i < 9; i++) dotItems.push(B(DX + i * 190, DY, 150, 100, 24), B(DX + i * 190, DY - 150, 150, 100, H + 20));
  const shDots = fitCam(W, [...dotItems, { el: dq }, { el: dsrc }, { el: dpt }, { el: dres }, { el: dlen }, { el: dno }], { pitch: 84 });
  const shVig = fitCam(W, [B(VX + VQW / 2, VY, VQW, 90, 26), ...VP.map((k) => B(k.x, k.y, k.w, k.d, 20)), [vmr + 40, VY, 0], [vmr + 40, vFin[3].y, 0], { el: vl1 }, { el: vl2 }, { el: vl3 }, { el: vl4 }], { pitch: 40 });
  const shGrid = fitCam(W, [B(GX + 9.5 * CW, GY + 200, 20 * CW, 500, 40), B(GX + 1500 + 9.5 * CW, GY + 200, 20 * CW, 500, 40), [GX - 300, GY + 200, 0], [GX + 9.5 * CW, GY - 170, 130], [GX + 1500 + 9.5 * CW, GY - 170, 130], { el: g67 }, { el: g67b }], { pitch: 18 });
  W.cam([
    [mk.t0, mk.cam, 0.01],
    [T('b1') - 0.9, shHand, 1.6],
    [T('b3', '打草稿') - 0.5, shReply, 1.4],
    [T('b4') - 0.2, shMany, 1.5],                    // 「三百多块」：退远看它写满
    [T('b5') - 0.5, shReply, 1.4],
    [T('b6') - 0.6, shRelay, 1.3],
    // 「一段一段接起来……接得越高」：一路升镜，跟着摞起来的塔往上；塔长得比镜头快，一直长出画面（全片唯一的大运动）
    [T('b8') - 0.5, shRise0, 1.4],                   // b8：看着一摞摞摞上去（旁边是只有四趟的短柱）
    [T('b8b') - 0.3, shRise1, Tend('b8b') + 1.3 - T('b8b'), (k) => k * k * (3 - 2 * k) * 0.3 + k * k * 0.7],   // b8b：一路升上去
    [T('b12') - 0.6, shGrid, 1.9],
    [T('b9') - 0.5, shDots, 1.4],
    [T('b14') - 0.5, shVig, 1.4],
    [Tend('b16b') + 0.6, blankCam(VX + 700, VY + 1800), Math.max(0.8, s.end + 0.35 - Tend('b16b') - 0.6)],
  ]);
  sfx('whoosh', T('b3', '写进') - 0.5, { g: 0.18 }); sfx('whoosh', T('b6') - 0.6, { g: 0.16 }); sfx('whoosh', T('b8') - 0.4, { g: 0.18 }); sfx('riser', T('b8b') - 0.2, { g: 0.16 }); sfx('whoosh', T('b9') - 0.5, { g: 0.2 }); sfx('whoosh', T('b12') - 0.5, { g: 0.18 });
});
