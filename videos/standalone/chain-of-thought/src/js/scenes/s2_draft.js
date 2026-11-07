// 02 草稿：人把一步步的结果写在纸上；模型没有别的纸，只能写进回答里。写下的每个中间结果，交给下一趟接着算——一趟一趟摞起来。
// 事实：S14（scratchpad）；L3 §3（先写过程 321 块，拆成 92000 + 138）；S3、S7（写成字才能接力）；S1 §3.3 与表 6（一串点）；L1（39/100、99/100）。
scene('draft', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const NP = 48, GAP = 10, H = NP * GAP, BW = 150, BD = 100;
  const mk = chapterMark(W, s, '02', '草稿', -1500, 900, T('b1') + 0.6);

  // ── 人的草稿：印在纸上，一行一行写出来；每行的结果，下一行接着用 ──
  const HX = -980, HY = -20, LH = 120;
  const HAND = ['92138 = 92000 + 138', '25992 × 92000 = <u>2391264000</u>', '25992 × 138 = <u>3586896</u>', '<u>2391264000</u> + <u>3586896</u> = 2394850896'];
  const hand = HAND.map((txt, i) => {
    const e = W.print(`<div class="hand">${txt}</div>`, HX, HY + i * LH);
    const ta = T('b1', '纸') + 0.2 + i * 0.9;
    fade(W, e, (t) => ramp(t, ta, 0.35) * (1 - ramp(t, T('b3', '写进') - 0.2, 0.6)));
    sfx('key', ta, { g: 0.25 });
    return e;
  });
  // 「下一步就从纸上这个数接着算」：从第 2、3 行的结果，各连一道弧到第 4 行
  const hp = h('div', 'p3', S); hp.style.transform = `translate3d(${HX}px, ${HY}px, 1px)`;
  const hs = svg('svg', { width: 1400, height: 520, viewBox: '0 0 1400 520' }, hp); css(hs, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  const harc = [['M 760 196 C 900 260, 420 300, 300 352', T('b2', '接着算') - 0.3], ['M 560 316 C 700 360, 820 330, 770 352', T('b2', '接着算')]].map(([d, ta]) => {
    const p = svg('path', { d, fill: 'none', stroke: '#1c1c1c', 'stroke-width': 2.2 }, hs); const L = 700; p.style.strokeDasharray = L;
    W.up((t) => { p.style.strokeDashoffset = (L * (1 - ramp(t, ta, 0.7))).toFixed(1); p.style.opacity = (1 - ramp(t, T('b3', '写进') - 0.2, 0.6)).toFixed(3); });
    return p;
  });

  // ── 模型的回答：一长串方块，从左往右写下去（三百多块；画面上只写出前面一段） ──
  const REPLY = ['92', '138', ' =', ' 92', '000', ' +', ' 138', '\n', '259', '92', ' ×', ' 92', '000', ' =', ' 2', ',391', ',264', ',000', '\n', '259', '92', ' ×', ' 138', ' =', ' 3', ',586', ',896', '\n', '2', ',391', ',264', ',000', ' +', ' 3', ',586', ',896', ' =', ' 2', ',394', ',850', ',896'];
  const RX0 = -900, RY = 0, rows = []; let rx = RX0, ry = RY;
  const KEY1 = 15, KEY2 = 16, KEY3 = 17;           // 2,391,264,000 这一串：下面拿它演接力
  REPLY.forEach((tk, i) => {
    if (tk === '\n') { rx = RX0; ry += 140; return; }
    const w = 30 * tk.trim().length + 44;
    rows.push({ tk: tk.trim(), x: rx + w / 2, y: ry, w, i }); rx += w + 10;
  });
  const tw0 = T('b3', '回答') - 0.2, cps = 9;
  const blocks = rows.map((r, j) => {
    const b = block(S, r.tk, { w: r.w, d: 84, h: 22, fs: 40 });
    const ta = tw0 + j / cps;
    place(W, b.g, (t) => ({ x: r.x, y: r.y, z: 40 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * (1 - 0.7 * ramp(t, T('b8'), 0.8)) * (1 - ramp(t, T('b9') + 0.3, 0.4)) }));
    return b;
  });
  const cnt = W.board('<div class="lbl">答案之前：三百多块</div>', RX0 + 1500, RY + 420, 30, -200, 0);
  fade(W, cnt, (t) => ramp(t, T('b4', '三百多块') - 0.2, 0.4) * (1 - ramp(t, T('b6') - 0.2, 0.4)));
  // 后面还有很多：淡出的一串
  for (let j = 0; j < 14; j++) { const b = block(S, '', { w: 110, d: 84, h: 22, cls: 'dim' }); const bar = h('div', 'scrib', b.top); css(bar, { width: '70px' }); const ta = tw0 + (rows.length + j) / cps; place(W, b.g, (t) => ({ x: RX0 + 130 + j * 120, y: RY + 4 * 140, z: 0, o: (0.9 - j * 0.06) * ramp(t, ta, 0.2) * (1 - ramp(t, T('b6') - 0.2, 0.4)) })); }

  // ── 接力与摞起来：2,391,264,000 后面立起第一摞，下一摞从它写下的字接着往上；又立起四摞；然后六摞依次抬起，一摞摞在上一摞顶上 ──
  const k0 = rows.find((r) => r.i === KEY1), k1 = rows.find((r) => r.i === KEY3);
  const ky = k0.y - 170, NS = 6;
  const hot = (t) => t >= T('b6', '写成字') - 0.1 && t < T('b8') + 0.2;
  [KEY1, KEY2, KEY3].forEach((i) => { const b = blocks[rows.findIndex((r) => r.i === i)]; let last = null; W.up((t) => { const on = hot(t); if (on !== last) { b.g.classList.toggle('hot', on); last = on; } }); });
  const SX = k0.x + 700, SY = ky - 260;            // 摞在这里
  const tS = T('b8', '分给') - 0.1;
  const stackAt = (i) => tS + 0.3 + i * 0.4;
  const squash = () => 1;
  const tCol = Tend('b8') + 1.8;
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
      op: (t) => 1 - ramp(t, T('b9') + 0.5, 0.5) });
    sfx('tick', stackAt(i) + 0.7, { g: 0.2 });
  }
  // 六摞之上，一趟一趟继续往上摞，一直摞出画面（三百多趟，每趟和下面一样高）；旁边是只报答案的四趟
  const SEG = H + 6, base6 = NS * SEG;
  const nUp = (t) => lerp(0, 60, Math.pow(ramp(t, tCol - 0.6, 3.2, (k) => k), 1.6));   // 画到六十多趟就已远远出了画面
  const colUp = column(W, S, SX, SY, { w: 150, d: 100, seg: SEG, n: nUp, op: (t) => 1 - ramp(t, T('b9') + 0.5, 0.5) });
  colUp.g.classList.add('tall');
  colUp.g.style.transform = `translate3d(${SX}px, ${SY}px, ${base6}px)`;
  const stub = column(W, S, SX - 420, SY, { w: 150, d: 100, seg: SEG, n: (t) => 4 * ramp(t, tCol - 0.4, 0.8, ease.out3), op: (t) => 1 - ramp(t, T('b9') + 0.5, 0.5) });
  stub.g.classList.add('tall');
  const l1 = W.board('<div class="lbl xl">只报答案<br>四趟</div>', SX - 420 - 90, SY, 4 * SEG, -420, -120);
  const l2 = W.board('<div class="lbl xl">先写过程<br>三百多趟 ↑</div>', SX + 90, SY, 4 * SEG + 900, 20, -40);
  [l1, l2].forEach((l) => fade(W, l, (t) => ramp(t, tCol + 0.4, 0.5) * (1 - ramp(t, T('b9') + 0.5, 0.5))));

  // ── 一串点：每一摞都从纸面重新算起，摞不起来 ──
  const DX = SX + 900, DY = SY + 600;              // 就在那根立柱的右前方：镜头从立柱一摇就到
  for (let i = 0; i < 9; i++) {
    const x = DX + i * 190;
    const b = block(S, '·', { w: 150, d: 100, h: 24, fs: 64 });
    const ta = T('b9') + 0.4 + i * 0.16;
    place(W, b.g, (t) => ({ x, y: DY, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) }));
    ream(W, S, x, DY - 150, { w: 150, d: 100, gap: GAP, n: NP, rise: (t) => ramp(t, ta + 0.1, 0.6, ease.out3), fill: (t) => ramp(t, ta + 0.4, 0.9) });
  }
  const dq = W.board('<div class="lbl">多出来的每一趟，写下的都是同一个点</div>', DX + 760, DY + 60, 0, -330, 34);
  fade(W, dq, (t) => ramp(t, T('b11') - 0.2, 0.4));
  const dsrc = W.board('<div class="lbl">谷歌 2022：先输出一串点，和算式一样长<br><span class="g">成绩和直接回答差不多</span></div>', DX + 760, DY - 150, H + 40, -360, -110);
  fade(W, dsrc, (t) => ramp(t, T('b10') - 0.3, 0.4));

  // ── 一百道乘法：每种位数一行，每行二十块；答对的立起来，答错的平躺 ──
  const GX = DX + 2600, GY = DY - 100, CW = 66;
  const L1D = [20, 16, 3, 0, 0], L1T = [20, 20, 20, 20, 19];
  const grid = (ox, ok, lab, ta) => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {
      const good = c < ok[r];
      const b = block(S, '', { w: 54, d: 54, h: good ? 96 : 5, cls: good ? 'cube' : 'cube no' });
      const tt = ta + r * 0.25 + c * 0.015;
      place(W, b.g, (t) => ({ x: ox + c * CW, y: GY + r * 100, z: 0, o: ramp(t, tt, 0.25) }));
    }
    const l = W.board(`<div class="lbl">${lab}</div>`, ox + 9.5 * CW, GY - 90, 0, -110, -30); fade(W, l, (t) => ramp(t, ta, 0.4));
  };
  grid(GX, L1D, '只报答案　39', T('b13') - 0.2);
  grid(GX + 1500, L1T, '先写过程　99', T('b13', '先写过程') - 0.2);
  ['三位', '四位', '五位', '六位', '七位'].forEach((d, r) => { const l = W.print(`<div class="lbl s g">${d}</div>`, GX - 140, GY + r * 100 - 24); fade(W, l, (t) => ramp(t, T('b12') + 0.3, 0.4)); });

  // ── 镜头 ──
  W.cam([
    [mk.t0, mk.cam, 0.01],
    [T('b1') - 0.9, { cx: HX + 560, cy: HY + 220, cz: 0, pitch: 34, yaw: 0, k: 1.05 }, 1.6],
    [null, { cx: HX + 600, cy: HY + 230, cz: 0, pitch: 36, yaw: 2, k: 1.08 }, Math.max(0.5, T('b3', '写进') - T('b1') - 1.2), (k) => k],
    [T('b3', '写进') - 0.3, { cx: RX0 + 700, cy: RY + 240, cz: 20, pitch: 52, yaw: -6, k: 0.9 }, 1.8],
    [null, { cx: RX0 + 900, cy: RY + 260, cz: 20, pitch: 54, yaw: -2, k: 0.86 }, Math.max(0.5, T('b6') - T('b3', '写进') - 1.8), (k) => k],
    [T('b6') - 0.3, { cx: k0.x + 120, cy: ky + 80, cz: 220, pitch: 70, yaw: -18, k: 1.05 }, 1.6],
    [T('b7'), { cx: k0.x + 220, cy: ky + 80, cz: 260, pitch: 72, yaw: -6, k: 1.0 }, Math.max(1, T('b8') - T('b7') - 0.3), (k) => smooth(k)],
    // 摞起来：镜头跟着往上升、往后退
    [T('b8') - 0.2, { cx: k0.x + 560, cy: ky - 60, cz: 300, pitch: 76, yaw: -20, k: 0.78 }, Math.max(0.6, tS + 0.2 - T('b8')), (k) => smooth(k)],
    [tS + 0.3, { cx: SX, cy: SY, cz: 1450, pitch: 82, yaw: -30, k: 0.36 }, NS * 0.4 + 1.0, (k) => smooth(k)],
    [tCol - 0.8, { cx: SX - 210, cy: SY, cz: 1500, pitch: 88, yaw: -8, k: 0.36 }, 3.6, (k) => smooth(k)],
    [T('b9') - 0.2, { cx: DX + 760, cy: DY - 60, cz: 220, pitch: 70, yaw: -10, k: 0.78 }, 2.2],
    [null, { cx: DX + 800, cy: DY - 60, cz: 220, pitch: 72, yaw: -4, k: 0.76 }, Math.max(0.5, T('b12') - T('b9') - 2.3), (k) => k],
    [T('b12') - 0.3, { cx: GX + 1250, cy: GY + 200, cz: 40, pitch: 56, yaw: -12, k: 0.56 }, 2.0],
    [null, { cx: GX + 1290, cy: GY + 200, cz: 40, pitch: 58, yaw: -5, k: 0.56 }, Math.max(0.5, s.end - T('b12') - 1.6), (k) => k],
  ]);
  sfx('whoosh', T('b3', '写进') - 0.3, { g: 0.2 }); sfx('whoosh', tS + 0.2, { g: 0.25 }); sfx('whoosh', T('b9') - 0.2, { g: 0.2 }); sfx('whoosh', T('b12') - 0.3, { g: 0.2 });
});
