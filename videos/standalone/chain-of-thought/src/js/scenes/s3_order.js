// 03 先后：回到第三次。答案写在第一行——写它的时候，前面只有题目，能接力的还是那四趟。
// 过程都在答案之后：后面的字读得到前面（一束弧线都落回答案），反过来不行（从答案伸出去的那道弧够不着，缩回来）。
// 答案写下就擦不掉；过程读着那个数往下写，最后加回了它。一百道：先写答案 36、只报答案 39；答错的 64 道里 38 道落回开头的错数。
// 事实：L1 n5-03 answer_first（第一行是答案，过程最后一行等于它）；S3 §3.2.3（向左的信息流被屏蔽：后写的读得到先写的，反过来不行）；
// L1 汇总（answer_first 20/14/2/0/0 共 36，direct 20/16/3/0/0 共 39）；L3 §4（答错的 64 次中 38 次落回第一行的错答案）。
scene('order', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const mk = chapterMark(W, s, '03', '先后', -1500, 900, T('s1') - 0.2);
  const X0 = -900, QW = 640, QD = 100, XT = X0 + QW + 40, LH = 112;
  const NP = 48, GAP = 10, H = NP * GAP;

  // ── 第三次的回答：题目、第一行的答案、后面六行过程 ──
  const q = block(S, '<span class="tx">25992 × 92138 =</span>', { w: QW, d: QD, h: 30, fs: 52 });
  twoFace(W, q, '25992 × 92138 =', 34);
  cast(q.g, QW * 1.06, QD * 1.5);
  place(W, q.g, (t) => ({ x: X0 + QW / 2, y: 0, z: 40 * (1 - ramp(t, T('s1') - 0.4, 0.5, ease.out3)), o: ramp(t, T('s1') - 0.4, 0.3) }));
  const P = para(S, X0, 0, [
    '答案', '：', '239', '484', '129', '6', '\n',
    4, '\n',
    '25992', '×', '92138', '\n',
    '=', '25992', '×', '(', '92000', '+', '138', ')', '\n',
    '=', '25992', '×', '92000', '+', '25992', '×', '138', '\n',
    '=', '239', '126', '400', '0', '+', '358', '689', '6', '\n',
    '=', '239', '484', '129', '6',
  ], { fs: 46, lh: LH, maxW: 1800, x1st: XT });
  const head = P.slice(0, 6), ans = P.slice(2, 6), proc = P.slice(6), fin = P.slice(-4);
  head.forEach((k) => twoFace(W, k.b, k.txt, 32));
  head.forEach((k, i) => { const ta = T('s1', '第一行') - 0.2 + i * 0.08; place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) })); });
  // 过程：先整段浮现（回到第三次）；讲「写答案的时候」时退成淡影；讲「过程都在答案之后」时一块一块重新写出来
  const tw0 = T('s3') - 0.1, tw1 = T('s3', '答案之后');
  proc.forEach((k, i) => {
    const ta = lerp(tw0, tw1, i / (proc.length - 1));
    place(W, k.b.g, (t) => {
      const ghost = ramp(t, T('s1') + 0.2, 0.6) * (1 - ramp(t, T('s2') - 0.5, 0.5));
      const re = ramp(t, ta, 0.2);
      const focus = 1 - 0.7 * ramp(t, T('s5') - 0.3, 0.5) * (1 - ramp(t, T('s6') - 0.3, 0.5));
      return { x: k.x, y: k.y, z: 30 * (t >= ta - 0.01 ? 1 - ramp(t, ta, 0.3, ease.out3) : 0), o: clamp(Math.max(ghost, re)) * focus };
    });
    if (i % 3 === 0) sfx('key', ta, { g: 0.14 });
  });
  const firstOn = (t) => ramp(t, T('s1', '第一行') - 0.3, 0.4) * (1 - ramp(t, T('s2') - 0.3, 0.4));
  rectOf(W, S, P, 0, 5, firstOn);

  // ── 写答案的那四趟：前面只有题目 ──
  const YR = -118;
  const plan = ans.map((k, i) => { const a = T('s2', '前面') - 0.3 + i * 0.62; return { k, up: a - 0.35, a, b: a + 0.55 }; });
  const reamOff = (t) => 1 - ramp(t, T('s3') - 0.5, 0.5);   // 讲完「只有四趟」就收走，回到纸面时不伸出画面
  plan.forEach((p) => ream(W, S, p.k.x, YR, { w: Math.max(56, p.k.w * 0.8), d: 56, gap: GAP, n: 30,
    rise: (t) => ramp(t, p.up, 0.5, ease.out3), fill: (t) => ramp(t, p.a, p.b - p.a, (k) => k), op: reamOff }));
  plan.forEach((p) => sfx('tick', p.b, { g: 0.2 }));
  // 每一层都往前读：读到的只有题目（和前面几块答案）
  const wl = wall(S, X0 - 40, YR + 41, 2400, H + 80);
  const arcs = [0, 1, 2, 3].map(() => svg('path', { fill: 'none', stroke: '#1c1c1c', 'stroke-width': 1.6, opacity: 0 }, wl.s));
  W.up((t) => {
    let act = -1;
    plan.forEach((p, i) => { if (t >= p.a && t < p.b) act = i; });
    if (act < 0) { arcs.forEach((a) => a.setAttribute('opacity', 0)); return; }
    const p = plan[act], f = clamp((t - p.a) / (p.b - p.a)), z = f * 30 * GAP;
    const targets = [[X0 + QW - 40, 0], ...plan.slice(0, act).map((o) => [o.k.x1 - 8, Math.max(0, z - GAP)])];
    arcs.forEach((a, j) => {
      if (j >= targets.length) { a.setAttribute('opacity', 0); return; }
      const x0 = wl.X(p.k.x0 + 6), y0 = wl.Y(z), x1 = wl.X(targets[j][0]), y1 = wl.Y(targets[j][1]);
      const lift = Math.min(110, Math.abs(x0 - x1) * 0.22);
      a.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} Q ${((x0 + x1) / 2).toFixed(1)} ${(Math.min(y0, y1) - lift).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
      a.setAttribute('opacity', (0.7 * Math.min(1, f * 10, (1 - f) * 10)).toFixed(3));
    });
  });
  const four = W.board('<div class="lbl l">四趟</div>', ans[3].x1 + 40, YR, 30 * GAP * 0.75, 0, -20);
  fade(W, four, (t) => ramp(t, T('s2', '四趟') - 0.2, 0.4) * (1 - ramp(t, T('s3') - 0.2, 0.4)));
  const onlyQ = W.board('<div class="lbl g">前面只有题目</div>', X0 + 40, 0, 40, 0, -110);
  fade(W, onlyQ, (t) => ramp(t, T('s2', '只有题目') - 0.2, 0.4) * (1 - ramp(t, T('s3') - 0.2, 0.4)));

  // ── 过程都在答案之后 ──
  const procOn = (t) => ramp(t, T('s3', '过程') - 0.3, 0.4) * (1 - ramp(t, T('s4') - 0.2, 0.4));
  rect(W, S, X0 - 18, LH - 58, 1836, 5 * LH + 116, procOn, 'g');
  const pl = W.board('<div class="lbl l" style="transform:translate(-100%,-50%)">过程</div>', X0 - 50, 3.5 * LH, 0);
  fade(W, pl, (t) => ramp(t, T('s3', '过程') - 0.3, 0.4) * (1 - ramp(t, T('s7') - 0.4, 0.4)));
  const al = W.board('<div class="lbl l" style="transform:translate(-100%,-50%)">答案</div>', X0 - 50, -110, 0);
  fade(W, al, (t) => ramp(t, T('s1', '答案') - 0.3, 0.4) * (1 - ramp(t, T('s7') - 0.4, 0.4)));

  // ── 后面读得到前面：过程里的字，一道道弧线都落回答案；反过来，从答案伸出去的那道够不着，缩了回来 ──
  // 读得到前面：从过程三行的行尾出发，走线沿右边空白处上去，进到答案——印在纸上，不从字上越过
  const lineEnd = (n) => { const L_ = P.filter((k) => k.line === n); return L_[L_.length - 1]; };
  const mr = Math.max(...P.map((k) => k.x1)) + 60;
  const readOff = (t) => 1 - ramp(t, T('s5') + 0.2, 0.6);
  [2, 4, 6].forEach((n, i) => {
    const src = lineEnd(n), ta = T('s4', '读得到') - 0.5 + i * 0.3, mx = mr + i * 28, ey = -22 + i * 22;
    trace(W, S, [[src.x1 + 14, src.y], [mx, src.y], [mx, ey], [ans[3].x1 + 14, ey]], { w: 4, draw: (t) => ramp(t, ta, 0.8), op: readOff });
  });
  sfx('tick', T('s4', '读得到'), { g: 0.2 });
  // 反过来不行：答案下面一道挡板；从答案往下伸的箭头碰到挡板缩回，打叉
  const wallY = LH / 2, ax = ans[1].x;
  const stopper = seg(S, 'e ww'); stopper.set([ans[0].x0 - 20, wallY, 0.9], [ans[3].x1 + 20, wallY, 0.9]);
  const backOn = (t) => ramp(t, T('s4', '反过来') - 0.3, 0.3) * (1 - ramp(t, T('s5') - 0.2, 0.4));
  fade(W, stopper.e, backOn);
  trace(W, S, [[ax, 40], [ax, wallY - 16]], { color: '#6a6a6a', w: 11, draw: (t) => ramp(t, T('s4', '反过来') - 0.1, 0.5) * (1 - ramp(t, T('s4', '不行') + 0.3, 0.5)), op: backOn });
  const xOn = (t) => ramp(t, T('s4', '不行') - 0.2, 0.2) * (1 - ramp(t, T('s5') - 0.2, 0.4));
  [[[ax - 48, wallY - 48], [ax + 48, wallY + 48]], [[ax + 48, wallY - 48], [ax - 48, wallY + 48]]].forEach(([a, b]) => trace(W, S, [a, b], { color: '#a5402d', w: 11, op: xOn }));
  sfx('error', T('s4', '不行') - 0.2, { g: 0.12 });

  // ── 答案写下就擦不掉：四块描上墨框 ──
  rectOf(W, S, P, 2, 5, (t) => ramp(t, T('s5', '写下') - 0.2, 0.4) * (1 - ramp(t, T('s7') - 0.4, 0.4)));
  sfx('thud', T('s5', '写下'), { g: 0.25 });

  // ── 过程读着那个数往下写，最后加回了它 ──
  const ul = (toks, ta) => { const e = seg(S, 'e w'); e.set([toks[0].x0, toks[0].y + 50, 0.8], [toks[toks.length - 1].x1, toks[0].y + 50, 0.8]); fade(W, e.e, (t) => ramp(t, ta, 0.35) * (1 - ramp(t, T('s7') - 0.4, 0.4))); };
  const mR = mr + 120;
  trace(W, S, [[fin[3].x1 + 14, fin[3].y + 14], [mR, fin[3].y + 14], [mR, 30], [ans[3].x1 + 14, 30]], { color: '#a5402d', w: 6,
    draw: (t) => ramp(t, T('s6', '加回') - 0.5, 1.2, ease.io3), op: (t) => 1 - ramp(t, T('s7') - 0.4, 0.4) });
  ul(fin, T('s6', '加回') - 0.4); ul(ans, T('s6', '加回') + 0.5);
  sfx('tick', T('s6', '加回') + 0.6, { g: 0.3 });

  // ── 一百道：先写答案 36（左），只报答案 39（右）；先写答案答错的 64 道里，38 道落回开头的错数 ──
  const GX = 1700, GY = -60, CW = 66, RH = 100;
  const grid = (ox, ok, lab, ta, labT, cells) => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {
      const good = c < ok[r];
      const b = block(S, '', { w: 54, d: 54, h: good ? 40 : 5, cls: good ? 'cube ok' : 'cube no' });
      const tt = ta + r * 0.22 + c * 0.012;
      place(W, b.g, (t) => ({ x: ox + c * CW, y: GY + r * RH, z: 0, o: ramp(t, tt, 0.25) }));
      if (cells && !good) cells.push({ x: ox + c * CW, y: GY + r * RH });
    }
    const l = W.board(`<div class="lbl l" style="transform:translate(-50%,-100%)">${lab}</div>`, ox + 9.5 * CW, GY - 40, 130, 0, 0); fade(W, l, (t) => ramp(t, labT, 0.4));
  };
  const wrong = [];
  grid(GX, [20, 14, 2, 0, 0], '先写答案　36', T('s7') + 0.1, T('s7', '三十六') - 0.2, wrong);
  grid(GX + 1560, [20, 16, 3, 0, 0], '只报答案　39', T('s7b') - 0.2, T('s7b', '三十九') - 0.2);
  ['三位', '四位', '五位', '六位', '七位'].forEach((d, r) => { const l = W.board(`<div class="lbl l" style="transform:translate(-100%,-50%)">${d}</div>`, GX - 110, GY + r * RH, 0, 0, 0); fade(W, l, (t) => ramp(t, T('s7') + 0.2, 0.4)); });
  // 64 道答错的平躺着；其中 38 道（固定种子挑出）描上朱红的框
  const rnd = seeded(303), order = wrong.map((w, i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const back38 = new Set(order.slice(0, 38));
  wrong.forEach((w, i) => {
    rect(W, S, w.x - 31, w.y - 31, 62, 62, (t) => ramp(t, T('s8', '答错') - 0.2 + i * 0.006, 0.3) * (back38.has(i) ? 1 - ramp(t, T('s8b', '落回') - 0.3 + order.indexOf(i) * 0.012, 0.3) : 1), 'g');
    if (back38.has(i)) rect(W, S, w.x - 31, w.y - 31, 62, 62, (t) => ramp(t, T('s8b', '落回') - 0.3 + order.indexOf(i) * 0.012, 0.3), 'e');
  });
  const l38 = W.board('<div class="lbl l" style="transform:translateX(-100%)">答错 64 道　</div>', GX + 9.5 * CW, GY + 4 * RH + 60, 0, 0, 10);
  const gOff = (t) => 1 - ramp(t, T('s9') - 0.6, 0.4);   // 讲脑补时收走网格的标签
  fade(W, l38, (t) => ramp(t, T('s8', '答错') - 0.2, 0.4) * gOff(t));
  const l6 = W.board('<div class="lbl l g">将近六成</div>', GX + 9.5 * CW, GY + 4 * RH + 60, 0, 0, 90);
  fade(W, l6, (t) => ramp(t, T('s8', '六成') - 0.3, 0.4) * gOff(t));
  const l38b = W.board('<div class="lbl l"><span class="err">38 道落回开头的错数</span></div>', GX + 9.5 * CW, GY + 4 * RH + 60, 0, 0, 10);
  fade(W, l38b, (t) => ramp(t, T('s8b', '落回') - 0.3, 0.4) * gOff(t));
  sfx('tick', T('s8b', '落回'), { g: 0.3 });

  // ── 脑补（类比，S10）：四双一样的丝袜，多半挑最右边那双；问起原因，说的是质量 ──
  const NX = GX + 600, NY = GY + 1300, s9a = T('s9') - 0.2;
  const sock = [0, 1, 2, 3].map((i) => {
    const b = block(S, '', { w: 120, d: 120, h: 70, cls: 'cube' });
    const x = NX - 270 + i * 180;
    place(W, b.g, (t) => ({ x, y: NY, z: 30 * (1 - ramp(t, s9a + i * 0.1, 0.3, ease.out3)), o: ramp(t, s9a + i * 0.1, 0.2) }));
    return { b, x };
  });
  glow(W, sock[3].b, (t) => ramp(t, T('s9', '拿定') - 0.1, 0.3));
  const n1 = W.board('<div class="lbl g" style="transform:translateX(-50%)">1977 年的实验：四双一样的丝袜</div>', NX, NY - 60, 0, 0, -150);
  const n2 = W.board('<div class="lbl" style="transform:translateX(-50%)">挑中的，多是最右边那双</div>', sock[3].x, NY + 60, 0, 0, 40);
  const n3 = W.board('<div class="lbl" style="transform:translateX(-50%)">说出的理由：<span class="err">「质量更好」</span></div>', NX, NY + 60, 0, 0, 110);
  fade(W, n1, (t) => ramp(t, s9a, 0.4)); fade(W, n2, (t) => ramp(t, T('s9', '拿定') - 0.1, 0.4)); fade(W, n3, (t) => ramp(t, T('s9', '理由') - 0.4, 0.4));
  sfx('tick', T('s9', '拿定'), { g: 0.2 }); sfx('tick', T('s9', '理由') - 0.4, { g: 0.2 });

  // ── 镜头：回到第三次、写答案时只有题目、过程在答案之后（一个斜俯机位，四摞直接在画面里立起来）｜
  //    读得到前面、擦不掉、加回了它（一个斜俯固定镜头，三件事在同一画面里依次发生）｜一百道（斜俯，不动）｜脑补（俯看四双丝袜） ──
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const allTok = [B(X0 + QW / 2, 0, QW, QD, 30), ...P.map((k) => B(k.x, k.y, k.w, k.d, 20))];
  const shPage = fitCam(W, [...allTok, ...ans.map((k) => B(k.x, YR, k.w, 56, 330)), { el: al }, { el: pl }, { el: four }, { el: onlyQ }], { pitch: 46, yaw: -6 });
  const shAns = fitCam(W, [B(X0 + QW / 2, 0, QW, QD, 30), ...ans.map((k) => B(k.x, k.y, k.w, k.d, 20)), ...ans.map((k) => B(k.x, YR, k.w, 56, H + 20)), { el: four }, { el: onlyQ }, { el: al }], { pitch: 84 });
  const shRead = fitCam(W, [...allTok, [mr + 160, 0, 0], [mr + 160, fin[0].y, 0], { el: al }, { el: pl }], { pitch: 40, yaw: -4 });
  const shGrid = fitCam(W, [B(GX + 9.5 * CW, GY + 200, 20 * CW, 500, 40), B(GX + 1560 + 9.5 * CW, GY + 200, 20 * CW, 500, 40), [GX - 300, GY + 200, 0], [GX + 9.5 * CW, GY - 170, 130], [GX + 1560 + 9.5 * CW, GY - 170, 130], { el: l38 }, { el: l38b }, { el: l6 }], { pitch: 18 });
  const shSock = fitCam(W, [...sock.map((o) => B(o.x, NY, 120, 120, 130)), { el: n1 }, { el: n2 }, { el: n3 }], { pitch: 34, kmax: 1.3 });
  W.cam([
    [mk.t0, mk.cam, 0.01],
    [T('s1') - 0.9, shPage, 1.7],
    [T('s4') - 0.5, shRead, 1.3],
    [T('s7') - 0.6, shGrid, 1.5],
    [T('s9') - 0.6, shSock, 1.5],
    [Tend('s9') + 0.6, blankCam(NX, NY + 1500), Math.max(0.8, s.end + 0.35 - Tend('s9') - 0.6)],
  ]);
  sfx('whoosh', T('s1') - 0.9, { g: 0.25 }); sfx('whoosh', T('s2') - 0.5, { g: 0.15 }); sfx('whoosh', T('s4') - 0.5, { g: 0.15 }); sfx('whoosh', T('s7') - 0.6, { g: 0.2 }); sfx('whoosh', T('s9') - 0.6, { g: 0.18 }); sfx('whoosh', Tend('s9') + 0.6, { g: 0.18 });
});
