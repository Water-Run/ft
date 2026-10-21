// 第 01 章 · 引用计数。主画面：对象 A 展开成 16 个字节，前 8 个字节里的计数随旁白 1→2→3→2→1→0 跳动，
// 归零那一拍整条对象碎掉；之后 X 与 Y 互相牵着，计数卡在 1，成了一座孤岛，直到拆环器把它们一起揪出来。
// 数据：CPython 3.14.3（out_05、out_01）、PHP 8.5.10（out_10）。
scene('count', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const sv = board(world, -400, -300, 4800, 1700);
  bgHeap(sv, -400, -300, 80, 28, 17, 0.22);
  const plate = { bg: C.field, pad: '0 18px 8px' };
  const keyNum = (el) => keyed(el);

  // ── 实时记账：一个对象，三处在用它 ──
  const hd1 = tag(ui, tr('引用计数', 'reference counting'), 124, 140, 34);
  const hd2 = tx(ui, 'ser', tr('实时记账', 'Real-time bookkeeping'), 116, 198, { size: tr(130, 84), ...plate });
  slide(hd1, c0 - 0.3, { x: -40, d: 0.3 }); wipe(hd2, qb(T('a1', { zh: '实时', en: 'real time' })), { dir: 'l', d: 0.45 }); sfx('thud', qb(T('a1', { zh: '实时', en: 'real time' })), { g: 0.7 });
  const tA = h('div', 'abs', world); px(tA, 380, 470, 140, 140); tA.style.background = C.white;
  const tAn = tx(world, 'big', '', 380, 488, { size: 96, color: C.ink }); css(tAn, { width: '140px', textAlign: 'center' });
  const tAl = tx(world, 'big', 'A', 316, 500, { size: 60 });
  slam(tA, c0 - 0.3, { from: 0.5, d: 0.4 }); appear(tAl, c0 - 0.1); sfx('pop', c0 - 0.3, { g: 0.6 });
  const srcs = [[930, 330], [1010, 520], [930, 710]].map(([x, y]) => cell(sv, x, y, 44));
  const tN = [qb(T('a1b', { zh: '数数', en: 'counting' })), qb(T('a1b', { zh: '多少', en: 'how many' })), qb(T('a1b', { zh: '地方', en: 'places' }))];
  const tRet = qb(Tend('a1b') + 0.05);
  const sp = srcs.map((c, k) => { const p = ptr(sv, c.cx - 26, c.cy, 528, 500 + k * 40, { w: 5, head: 20 }); grow(p, tN[k], tRet, { d: 0.25 }); return p; });
  srcs.forEach((c, k) => grow(c, tN[k] - 0.12, tRet + 0.1, { d: 0.18 }));
  const kA = keyNum(tAn); kA.at(tN[0] + 0.2, { html: '1' }).at(tN[1] + 0.2, { html: '2' }).at(tN[2] + 0.2, { html: '3' }).at(tRet, { html: '' });
  tN.forEach((t, k) => { pulse(tAn, t + 0.2); sfx('pop', t, { g: 0.5, p: 0.3 }); });
  for (const e of [hd1, hd2]) exit(e, qb(T('a2', 'C Python')) - 0.2, { x: -100, d: 0.3 });

  // ── 8 字节：A 展开成 16 个字节，前 8 个是计数 ──
  const tU = qb(T('a2', 'C Python'));
  const strip = h('div', 'abs', world); px(strip, 380, 470, 1120, 140); strip.style.background = C.white;
  for (let k = 1; k < 16; k++) { const d = h('div', 'abs', strip); px(d, k * 70 - 2, 0, 4, 140); d.style.background = k === 8 ? C.ink : C.gray; }
  wipe(strip, tU, { dir: 'l', d: 0.7, ease: 'power3.inOut' }); vanish(tA, tU + 0.05); sfx('whoosh', tU, { g: 0.35 });
  const cnt = h('div', 'abs', world); px(cnt, 384, 474, 552, 132); cnt.style.background = C.ink;
  const cntN = tx(world, 'big', '', 384, 476, { size: 118, color: C.white }); css(cntN, { width: '552px', textAlign: 'center' });
  const t8 = qb(Math.min(T('a2b', { zh: '八字节', en: '8 bytes' }) - 0.15, Tend('a2') - 0.5));
  wipe(cnt, t8, { dir: 'l', d: 0.4 }); sfx('thud', t8, { g: 0.6 });
  const b8 = h('div', 'abs', world); px(b8, 384, 440, 552, 6); b8.style.background = C.white;
  const l8 = tx(world, 'sub', tr('前 8 字节', 'first 8 bytes'), 384, 360, { size: 52 }), l8e = tx(world, 'mono', 'ob_refcnt', tr(640, 770), 376, { size: 30, color: C.pale });
  const b16 = h('div', 'abs', world); px(b16, 380, 634, 1120, 6); b16.style.background = C.pale;
  const l16 = tx(world, 'mono', 'sys.getsizeof(object()) = 16 bytes', 380, 650, { size: 28, color: C.pale });
  const lSrc = tx(world, 'src', 'CPython 3.14.3', 1300, 410);
  wipe(b8, t8, { dir: 'l', d: 0.4 }); slide(l8, t8 + 0.05, { y: 20, d: 0.35 }); appear(l8e, t8 + 0.3);
  wipe(b16, tU + 0.5, { dir: 'l', d: 0.5 }); appear(l16, tU + 0.7); appear(lSrc, tU + 0.7);
  const t3 = qb(T('a3', { zh: '刚出生', en: 'born' }) - 0.25);
  const tWide0 = qb(T('a4b', { zh: '全局', en: 'global' })) - 0.4;
  for (const e of [lSrc, tAl]) exit(e, tWide0, { y: -30, d: 0.25 });
  // 「随时读写」：一个金色的读写头在前 8 个字节上来回走，八分音符一格
  const rwHead = h('div', 'abs', world); px(rwHead, 384, 452, 69, 172); css(rwHead, { outline: `6px solid ${C.gold}`, outlineOffset: '-6px' });
  const rwBar = h('div', 'abs', world); px(rwBar, 384, 446, 69, 10); rwBar.style.background = C.gold;   // 框下一条金，跟着走
  const tRW = qb(t8 + 0.7), tRWend = t3 - 0.15;
  F((t) => { const on = t >= tRW && t < tRWend; vis(rwHead, on); vis(rwBar, on); if (on) { const k = Math.floor((t - tRW) / (BEAT / 2)), p = k % 14, i = p < 8 ? p : 14 - p; ss(rwHead, 'left', (384 + i * 69) + 'px'); ss(rwBar, 'left', (384 + i * 69) + 'px'); } });
  for (let t = tRW; t < tRWend - 0.1; t += BEAT) sfx('tick', t, { g: 0.12, p: -0.4 });
  for (const e of [l8, l8e, b8]) exit(e, t3 - 0.1, { y: -30, d: 0.3 });

  // ── 1→2→3→2→1→0：名字一个个指上来，又一个个撤走 ──
  const names = [['a', 420], ['b', 600], ['holder', 780]];
  const tk = [qb(T('a3', { zh: '刚出生', en: 'born' })), qb(T('a3', { zh: '赋给', en: 'assign' })), qb(T('a3b', { zh: '塞进', en: 'into a list' })), qb(T('a3b', { zh: '删掉', en: 'delete' })), qb(T('a3b', { zh: '清空', en: 'clear' })), qb(T('a4', { zh: '抹去', en: 'Erase' }))];
  const tZero = qb(T('a4', { zh: '归零', en: 'zero' })), tFree = qb(T('a4b', { zh: '释放', en: 'freed' }) - 0.1);
  const outT = [tk[5], tk[3], tk[4]];
  const nameEls = names.map(([n, x], k) => {
    const e = wtag(world, n, x, 270, 34); slide(e, tk[k] - 0.1, { y: -24, d: 0.3 }); exit(e, outT[k], { y: -30, d: 0.25 });
    const p = ptr(sv, x + 26, 336, x + 26, 466, { w: 5, head: 20 }); grow(p, tk[k] - 0.05, outT[k], { d: 0.22 });
    return e;
  });
  const vals = ['1', '2', '3', '2', '1', '0'];
  const kc = keyed(cntN);
  vals.forEach((v, k) => { const t = k === 5 ? tZero : tk[k] + 0.12; kc.at(t, { html: v }); pulse(cntN, t, k === 5 ? 1.35 : 1.2); sfx(k === 5 ? 'thud' : 'tick', t, { g: k === 5 ? 0.9 : 0.55 }); });
  classAt(cnt, 'zero', tZero);
  F((t) => { ss(cnt, 'background', t >= tZero ? C.gold : C.ink); ss(cntN, 'color', t >= tZero ? C.ink : C.white); });
  const code = slab(ui, 1330, 680, [
    "a = Node('A')      raw = 1", 'b = a              raw = 2', 'holder = [a]       raw = 3', 'del b              raw = 2', 'holder.clear()     raw = 1',
    'del a  -&gt;   <span class="k">__del__ A</span>'], { size: 26, pad: '18px 28px 20px' });
  wipe(code.el, t3, { dir: 't', d: 0.3 });
  code.ln.forEach((l, k) => { appear(l, k === 5 ? tFree : tk[k]); if (k < 5) classAt(l, 'k', tk[k], k < 4 ? tk[k + 1] : tk[5]); });
  const zTag = tag(world, tr('归零', 'zero'), 960, 500, 44);
  slam(zTag, tZero + 0.05, { from: 1.3, d: 0.35 });
  // 当场释放：16 个字节一起碎掉
  for (const e of [strip, cnt, cntN, b16, l16]) vanish(e, tFree);
  shatter(world, 380, 470, 1120, 140, C.gold, tFree, { n: 8, gap: 6, spread: 70, fall: 90, seed: 9 });
  sfx('thud', tFree, { g: 0.8 }); sfx('pop', tFree + 0.12, { g: 0.5 });
  const tW = qb(T('a5', { zh: '对象', en: 'object' }) - 0.15), tC6 = qb(T('a6', { zh: '代价', en: 'price' }) - 0.4);
  exit(zTag, tW - 0.2, { y: -40, d: 0.3 });
  exit(code.el, tW - 0.2, { y: 80, d: 0.32 });
  // 不劳烦任何人：其余的格子一动不动；对象自己知道什么时候该走
  wonder(ui, tr('对象自己知道<br>什么时候该走', 'The object knows<br>when to leave'), 120, 300, tW, tC6 - 0.1, { plate: true, size: tr(110, 96), h: tr(250, 230) });

  // ── 代价：每次指针变动都得改账本 ──
  const OB = [[2150, 330], [2450, 330], [2750, 330], [2150, 630], [2450, 630], [2750, 630]].map(([x, y]) => ({ x, y }));
  const obEls = OB.map((o, k) => {
    const b = h('div', 'abs', world); px(b, o.x - 70, o.y - 70, 140, 140); b.style.background = C.white;
    const n = tx(world, 'big', '', o.x - 70, o.y - 50, { size: 80, color: C.ink }); css(n, { width: '140px', textAlign: 'center' });
    appear(b, tC6 + 0.4 + k * 0.05); appear(n, tC6 + 0.4 + k * 0.05);
    return { b, n };
  });
  const SR = [330, 480, 630, 780].map((y) => cell(sv, 1880, y - 80, 50));
  const tLoop = qb(Tend('a6') - 0.55);
  // 记账一直演到 X、Y 出场前半秒：之前在 a6 说完前就退场，留下一秒多只有一行小字的空屏（策划者看片指出「刷过去」）
  const rr = seeded(23), steps = [], tS6 = qn(T('a6', { zh: '指针', en: 'pointer' })), tE6 = qb(T('a6b', { zh: '循环引用', en: 'reference cycle' }) - 0.1) - 0.5;
  let tgt = [0, 1, 4, 3];
  const tgtAt = [tgt.slice()];
  for (let t = tS6; t < tE6 - 0.1; t += BEAT / 2) { const k = steps.length % 4; let v; do { v = (rr() * 6) | 0; } while (v === tgt[k]); steps.push({ t, k, from: tgt[k], to: v }); tgt = tgt.slice(); tgt[k] = v; tgtAt.push(tgt); }
  const sps = SR.map((c, k) => ptr(sv, c.cx + 30, c.cy, 0, 0, { w: 4, head: 16, gap2: 74 }));
  SR.forEach((c) => grow(c, tC6 + 0.3, tE6, { d: 0.2 }));
  F((t) => {
    let m = 0; while (m < steps.length && steps[m].t <= t) m++;
    const cur = tgtAt[m], prev = m > 0 ? tgtAt[m - 1] : cur;
    const on = t > tC6 + 0.5 && t < tE6 + 0.2;
    sps.forEach((p, k) => {
      if (!on) return p.set({ f: 0 });
      let tx_ = OB[cur[k]].x, ty_ = OB[cur[k]].y;
      if (m > 0 && steps[m - 1].k === k) { const u = ease.out3(clamp((t - steps[m - 1].t) / 0.14)); tx_ = lerp(OB[prev[k]].x, tx_, u); ty_ = lerp(OB[prev[k]].y, ty_, u); }
      p.set({ f: Math.min(1, (t - tC6 - 0.5) / 0.3), x2: tx_, y2: ty_ });
    });
    OB.forEach((o, i) => { const v = on ? String(cur.filter((x) => x === i).length) : ''; if (obEls[i].n._v !== v) { obEls[i].n._v = v; obEls[i].n.textContent = v; } });
  });
  steps.forEach((st, k) => { sfx('tick', st.t + 0.1, { g: 0.28, p: (OB[st.to].x - 2450) / 600 }); pulse(obEls[st.to].n, st.t + 0.12, 1.25, 0.18); });
  const h6 = tx(ui, 'sub', tr('每改一次指针，记一笔账', 'every pointer change: one more entry'), 120, 820, { size: 52, ...plate });
  wipe(h6, qb(T('a6', { zh: '代价', en: 'price' })), { dir: 'l', d: 0.4 });
  obEls.forEach((o, k) => { exit(o.b, tE6 + k * 0.03, { y: 60, d: 0.3 }); exit(o.n, tE6 + k * 0.03, { y: 60, d: 0.3 }); });
  exit(h6, qb(T('a6b', { zh: '循环引用', en: 'reference cycle' })), { y: 60, d: 0.3 });   // 在底部，与上方的「循环引用」不重叠

  // ── 循环引用：X 牵着 Y，Y 牵着 X ──
  const hLoop = tx(ui, 'ser', tr('循环引用', 'Reference<br>cycles'), 116, 136, { size: tr(110, 88), lh: 1.05, ...plate });
  slam(hLoop, tLoop, { from: 1.2, d: 0.45 }); sfx('thud', tLoop, { g: 0.8 });
  const X = { x: 2900, y: 420 }, Y = { x: 3400, y: 420 }, S = 200;
  const tXY = qb(T('a6b', { zh: '循环引用', en: 'reference cycle' }) - 0.1), tP1 = qb(T('a7', { zh: '牵着', en: 'holds' })), tP2 = qb(T('a7', { zh: '牵着', en: 'holds' }) + 0.95), tDel = qb(T('a7', { zh: '删光', en: 'deleted' }) - 0.1);
  const tScan = qb(T('a9', { zh: '唤醒', en: 'Wake' })), tHit = qb(T('a9', { zh: '出手', en: 'strike' })), tGone = qb(T('a9b', { zh: '清理', en: 'clear' }) - 0.1);
  const mk = (o, name, nx) => {
    const b = h('div', 'abs', world); px(b, o.x, o.y, S, S); b.style.background = C.white;
    const n = tx(world, 'big', '', o.x, o.y + 46, { size: 110, color: C.ink }); css(n, { width: S + 'px', textAlign: 'center' });
    const lb = tx(world, 'big', name, o.x, o.y + S + 14, { size: 48 });
    slam(b, tXY, { from: 0.4, d: 0.4 }); appear(n, tXY); appear(lb, tXY + 0.1);
    F((t) => { const g = t >= tHit && t < tGone; ss(b, 'background', g ? C.gold : C.white); });
    vanish(b, tGone); vanish(n, tGone); exit(lb, tGone, { y: 40, d: 0.3 });
    shatter(world, o.x, o.y, S, S, C.gold, tGone, { n: 3, gap: 6, spread: 110, seed: name === 'X' ? 3 : 4 });
    const t_ = wtag(world, nx, o.x + 70, 214, 34); slide(t_, tXY + 0.15, { y: -20, d: 0.3 }); exit(t_, tDel, { y: -30, d: 0.25 });
    const p = ptr(sv, o.x + 100, 280, o.x + 100, o.y - 6, { w: 5, head: 20 }); grow(p, tXY + 0.2, tDel, { d: 0.25 });
    return { b, n, lb };
  };
  const eX = mk(X, 'X', 'x'), eY = mk(Y, 'Y', 'y');
  const pXY = ptr(sv, X.x + S + 6, X.y + 64, Y.x - 6, Y.y + 64, { w: 6, head: 24 }), pYX = ptr(sv, Y.x - 6, Y.y + 136, X.x + S + 6, X.y + 136, { w: 6, head: 24 });
  // 试减：拆环器把可疑对象之间互相给的计数逐个扣掉（扣的那一刻指针闪金，扣完变淡），出手时整环变金
  const tA8c = T('a8c'), tSub = qb(T('a8d', { zh: '计数', en: 'count' }) - 0.1), tSubs = [tSub, tSub + BEAT, tSub + 2 * BEAT];
  const subCol = (ts) => (t) => t >= tHit ? { col: C.gold } : t >= ts + 0.3 ? { col: C.pale, op: 0.35 } : t >= ts ? { col: C.gold } : { col: C.white };
  grow(pXY, tP1, tGone, { d: 0.35, st: subCol(tSubs[1]) }); grow(pYX, tP2, tGone, { d: 0.35, st: subCol(tSubs[0]) });
  sfx('pop', tXY, { g: 0.6 }); sfx('tick', tP1 + 0.3, { g: 0.5, p: 0.2 }); sfx('tick', tP2 + 0.3, { g: 0.5, p: -0.2 });
  keyed(eX.n).at(tXY + 0.1, { html: '1' }).at(tP2 + 0.3, { html: '2' }).at(tDel + 0.25, { html: '1' }).at(tSubs[0] + 0.15, { html: '0' });
  keyed(eY.n).at(tXY + 0.1, { html: '1' }).at(tP1 + 0.3, { html: '2' }).at(tDel + 0.25, { html: '1' }).at(tSubs[1] + 0.15, { html: '0' });
  pulse(eX.n, tP2 + 0.3); pulse(eY.n, tP1 + 0.3); pulse(eX.n, tDel + 0.25); pulse(eY.n, tDel + 0.25);
  sfx('pop', tDel, { g: 0.45 });
  // 卡在 1：两个 1 随拍子一明一暗
  const tStuck = qb(T('a7b', { zh: '卡在一', en: 'stuck at 1' }) - 0.1);
  // 两根指针都牵上之后，X、Y 互相拉扯：一拍拽一下，你一下我一下，名字删光了也不停，直到「卡在 1」
  const tTugEnd = qb(T('a8b', { zh: '拆环', en: 'break cycles' }) - 0.1) - 0.3;
  // 与计数改变时的那一下（tP2 + 0.3、tDel + 0.25 等）相隔不足 0.35 s 的拍子跳过：同一个 scale 上两个补间重叠，倒着 seek 时结果会不同
  const busyX = [tP2 + 0.3, tDel + 0.25], busyY = [tP1 + 0.3, tDel + 0.25], clear = (t, ts) => ts.every((u) => Math.abs(t - u) >= 0.35);
  for (let t = qb(tP2 + 0.6); t < tTugEnd; t += BEAT) {
    if (clear(t, busyX)) { pulse(eX.b, t, 1.1, 0.26); pulse(eX.n, t, 1.1, 0.26); }
    if (clear(t + BEAT / 2, busyY)) { pulse(eY.b, t + BEAT / 2, 1.1, 0.26); pulse(eY.n, t + BEAT / 2, 1.1, 0.26); }
  }
  // 「卡在 1」：拉扯的脉冲（上面）一直跳到拆环器出手
  const raw = slab(ui, 120, 640, ['with names:    raw X = 2  raw Y = 2', 'after del x,y: raw X = <span class="k">1</span>  raw Y = <span class="k">1</span>'], { size: 26 });
  const rawL = tx(ui, 'src', 'CPython 3.14.3', 124, 604);
  wipe(raw.el, qb(T('a7b', { zh: '拉扯', en: 'pull' })), { dir: 'l', d: 0.35 }); appear(rawL, qb(T('a7b', { zh: '拉扯', en: 'pull' }))); sfx('blip', qb(T('a7b', { zh: '拉扯', en: 'pull' })), { g: 0.5 });
  appear(raw.ln[1], tStuck - 0.2);
  const php = slab(ui, 1000, 640, ['cycle: x.next = y, y.next = x, then unset(x, y):', '(after unset x, y: no destructor ran)'], { size: 24 });
  const phpL = tx(ui, 'src', 'PHP 8.5.10', 1004, 604);
  const tA8 = qb(T('a8', { zh: '谁', en: 'Neither' }));
  wipe(php.el, tA8, { dir: 'r', d: 0.35 }); appear(phpL, tA8); sfx('blip', tA8, { g: 0.5 });
  // 孤岛
  const tIs = qb(T('a8', { zh: '孤岛', en: 'island' }) - 0.15);
  const isl = h('div', 'abs', world); px(isl, 2850, 190, 800, 560); css(isl, { border: `4px dashed ${C.pale}` });
  const islL = tx(world, 'ser', tr('孤岛', 'island'), 3660, 200, { size: 64, color: C.pale });
  wipe(isl, tIs, { dir: 'l', d: 0.5 }); slide(islL, tIs + 0.2, { x: 30, d: 0.35 }); sfx('thud', tIs, { g: 0.55 });
  // 拆环器：从 PHP 与 CPython 的输出里，各收走 2 个
  const tFix = qb(T('a8b', { zh: '拆环', en: 'break cycles' }) - 0.1);
  const cyc = tag(world, tr('拆环器', 'cycle breaker'), 3690, 330, 44);
  slam(cyc, tFix, { from: 1.3, d: 0.35 }); sfx('thud', tFix, { g: 0.6 });
  // 点名：说到 Python、PHP 时，各自的输出标签跳一下
  const tPy = qb(T('a8b', 'Python') - 0.05), tPhp = qb(T('a8b', 'PHP') - 0.05);
  pulse(rawL, tPy, 1.3, 0.3); pulse(phpL, tPhp, 1.3, 0.3);
  const tExact = qb(T('a9b', { zh: '正是', en: 'Exactly' }) - 0.05); sfx('tick', tPy, { g: 0.4, p: -0.4 }); sfx('tick', tPhp, { g: 0.4, p: 0.4 });
  exit(hLoop, tFix, { x: -120, d: 0.3 });
  for (const e of [raw.el, rawL, php.el, phpL]) exit(e, tA8c - 0.1, { y: 60, d: 0.25 });   // 让出下方，给试减

  // ── 拆环器怎么认出孤岛：以 PHP 的「试减」为例 ──
  // 另放一个 Z：Y 指着它，外面还有名字 z 指着它，计数 2。试减扣掉 Y 给的那一下后还剩 1，原样恢复；X、Y 扣到 0，就是孤岛
  const Z = { x: 3820, y: 610 }, SZ = 160, tZin = qb(tA8c + 0.3), tZout = tScan - 0.15;
  const zb = h('div', 'abs', world); px(zb, Z.x, Z.y, SZ, SZ); zb.style.background = C.white;
  const zn = tx(world, 'big', '', Z.x, Z.y + 34, { size: 90, color: C.ink }); css(zn, { width: SZ + 'px', textAlign: 'center' });
  const zl = tx(world, 'big', 'Z', Z.x + 60, Z.y + SZ + 12, { size: 44 });
  const zt = wtag(world, 'z', Z.x + 62, 450, 34), pz = ptr(sv, Z.x + 80, 506, Z.x + 80, Z.y - 6, { w: 5, head: 20 });
  const pYZ = ptr(sv, Y.x + S + 6, Y.y + 170, Z.x - 6, Z.y + 70, { w: 6, head: 24 });
  slam(zb, tZin, { from: 0.4, d: 0.4 }); appear(zn, tZin); appear(zl, tZin + 0.1); slide(zt, tZin + 0.15, { y: -20, d: 0.3 });
  grow(pz, tZin + 0.2, tZout, { d: 0.25, st: (t) => ({ col: t >= qb(T('a8e', { zh: '大于零', en: 'above zero' }) - 0.1) && t < qb(T('a8e', { zh: '恢复', en: 'goes back' }) - 0.1) ? C.gold : C.white, w: t >= qb(T('a8e', { zh: '大于零', en: 'above zero' }) - 0.1) && t < qb(T('a8e', { zh: '恢复', en: 'goes back' }) - 0.1) ? 8 : 5 }) }); grow(pYZ, tZin + 0.3, tZout, { d: 0.35, st: (t) => t >= tSubs[2] + 0.3 && t < qb(T('a8e', { zh: '恢复', en: 'goes back' })) - 0.1 ? { col: C.pale, op: 0.35 } : t >= tSubs[2] && t < tSubs[2] + 0.3 ? { col: C.gold } : { col: C.white } });
  sfx('pop', tZin, { g: 0.5 });
  const tRes = qb(T('a8e', { zh: '恢复', en: 'goes back' }) - 0.1), tAbove = qb(T('a8e', { zh: '大于零', en: 'above zero' }) - 0.1);
  keyed(zn).at(tZin, { html: '2' }).at(tSubs[2] + 0.15, { html: '1' }).at(tRes, { html: '2' });
  for (const e of [zb, zn, zl, zt]) exit(e, tZout, { y: 40, d: 0.3 });
  // 试减：标签，三下扣减
  const tTry = qb(T('a8c', { zh: '试减', en: 'trial' }) - 0.1);
  const tryT = tag(world, tr('试减', 'trial subtraction'), 2870, 790, 44);
  slam(tryT, tTry, { from: 1.3, d: 0.35 }); sfx('thud', tTry, { g: 0.55 }); exit(tryT, tZout, { y: 40, d: 0.3 });
  [eX.n, eY.n, zn].forEach((n, k) => { pulse(n, tSubs[k] + 0.15, 1.3, 0.25); sfx('tick', tSubs[k], { g: 0.5, p: -0.4 + k * 0.4 }); });
  // 大于零：外面有人在用 → 恢复
  pulse(zt, tAbove, 1.3, 0.3); sfx('tick', tAbove, { g: 0.45, p: 0.5 });
  const resT = wtag(world, tr('外面有人用：恢复', 'used outside: restore'), Z.x - 40, Z.y + SZ + 70, 30);
  slide(resT, tRes, { y: 20, d: 0.3 }); pulse(zn, tRes + 0.05, 1.3, 0.25); sfx('chime', tRes, { g: 0.45 }); exit(resT, tZout, { y: 40, d: 0.3 });
  // 扣到零：只剩自己人 → 孤岛的框变金
  const tAt0 = qb(T('a8f', { zh: '扣到零', en: 'Down to zero' }) - 0.1), tIsl2 = qb(T('a8f', { zh: '孤岛', en: 'island' }) - 0.1);
  pulse(eX.n, tAt0, 1.25, 0.25); pulse(eY.n, tAt0 + BEAT / 2, 1.25, 0.25); sfx('tick', tAt0, { g: 0.45 });
  F((t) => ss(isl, 'borderColor', t >= tIsl2 && t < tGone + 0.3 ? C.gold : C.pale));
  pulse(islL, tIsl2, 1.35, 0.3); sfx('thud', tIsl2, { g: 0.6 });
  F((t) => ss(islL, 'color', t >= tIsl2 && t < tGone + 0.3 ? C.gold : C.pale));
  const py2 = slab(ui, 120, 600, ['<span class="hd">baseline gc.collect() -&gt; 21</span>', '  __del__ <span>X</span>', '  __del__ <span>Y</span>', '<span class="k">gc.collect() -&gt; 2</span>'], { size: 26 });
  const py2L = tx(ui, 'src', 'CPython 3.14.3', 124, 564);
  const ph2 = slab(ui, 900, 600, ['<span class="hd">gc_status before: runs=0 collected=0 roots=2</span>', '  __destruct <span>X</span>', '  __destruct <span>Y</span>', '<span class="k">gc_collect_cycles() = 2</span>'], { size: 26 });
  const ph2L = tx(ui, 'src', 'PHP 8.5.10', 904, 564);
  wipe(py2.el, tScan, { dir: 't', d: 0.25 }); wipe(ph2.el, tScan + 0.06, { dir: 't', d: 0.25 }); appear(py2L, tScan); appear(ph2L, tScan);
  [py2, ph2].forEach((sl, j) => sl.ln.forEach((l, k) => { const t = k === 0 ? tScan + 0.1 : tHit + (k - 1) * BEAT / 4 + j * 0.03; appear(l, t); if (k) sfx('blip', t, { g: 0.3, p: j ? 0.4 : -0.4 }); }));
  // 一道金框沿着环走一圈：收集器在找环
  const ring = h('div', 'abs', world); px(ring, 0, 0, 220, 220); css(ring, { border: `8px solid ${C.gold}` });
  FR(tScan - 0.1, tHit + 0.1, (t) => {
    const u = clamp((t - tScan) / (tHit - tScan));
    const path = [[X.x - 10, X.y - 10], [Y.x - 10, Y.y - 10], [X.x - 10, X.y - 10]];
    const seg = u < 0.5 ? 0 : 1, k = ease.io3((u - seg * 0.5) / 0.5);
    vis(ring, t > tScan && t < tHit);
    ss(ring, 'left', lerp(path[seg][0], path[seg + 1][0], k).toFixed(1) + 'px'); ss(ring, 'top', lerp(path[seg][1], path[seg + 1][1], k).toFixed(1) + 'px');
  });
  sfx('whoosh', tScan, { g: 0.4 }); sfx('thud', tHit, { g: 0.7 });
  const t2 = qb(Tend('a9') - 0.35);
  const two = tx(world, 'big', '2<span class="ser" style="font-size:80px;letter-spacing:0">' + tr(' 个', ' objects') + '</span>', 3700, 420, { size: 160, color: C.gold });
  slam(two, t2, { from: 1.35, d: 0.42 }); sfx('chime', t2, { g: 0.6 });
  if (tExact > t2 + 0.5) { pulse(two, tExact, 1.12, 0.3); sfx('tick', tExact, { g: 0.4 }); }   // 「正是 X 和 Y」：数字再跳一下
  sfx('thud', tGone, { g: 0.8 });
  const tIs2 = qb(T('a9b', { zh: '正是', en: 'Exactly' }));
  [py2, ph2].forEach((sl) => [1, 2].forEach((k) => classAt(sl.ln[k].querySelector('span'), 'hl', tIs2)));
  exit(isl, tGone + 0.3, { y: 0, d: 0.4 });

  // ── 镜头 ──
  const tZoom = qb(T('a2b', { zh: '八字节', en: '8 bytes' })) - 0.4, tWide = qb(T('a4b', { zh: '全局', en: 'global' })) - 0.3, tIsl = qb(T('a8', { zh: '孤岛', en: 'island' })) - 0.3;
  cam.track(s.start, { x: 860, y: 540, z: 0.9 }, [
    [s.start + 0.5, { z: 1.0 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { z: 1.03 }, tU - 0.3 - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tU - 0.3, { x: 940, y: 540, z: 1.12 }, 0.9, { sfx: false }],
    [tZoom, { x: 660, y: 520, z: 1.55 }, 0.9, { ease: 'power3.inOut', g: 0.3 }],
    [t3 - 0.4, { x: 940, y: 520, z: 1.0 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 1.03 }, tWide - (t3 + 0.65) - 0.05, { ease: 'none', sfx: false }],
    [tWide, { x: 940, y: 560, z: 0.7 }, 1.1, { ease: 'power2.inOut', sfx: false }],
    [null, { z: 0.73 }, tC6 - (tWide + 1.25) - 0.05, { ease: 'none', sfx: false }],
    // 记账画面压低一点：「循环引用」大字在 a6 说完时就要上画面（逐句对应表），不能压在左上的指针源上
    [tC6, { x: 2450, y: 460, z: 1.0 }, 1.1, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.03 }, tE6 - 0.1 - (tC6 + 1.25) - 0.05, { ease: 'none', sfx: false }],
    [tE6 - 0.1, { x: 3200, y: 640, z: 1.0 }, 1.0, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 1.02 }, tIsl - (tE6 + 1.05) - 0.05, { ease: 'none', sfx: false }],
    [tIsl, { x: 3260, y: 600, z: 0.9 }, 0.8, { ease: 'power2.inOut', sfx: false }],
    [null, { x: 3330, z: 0.93 }, tSubs[0] - 0.35 - (tIsl + 0.95), { ease: 'none', sfx: false }],
    // 试减：镜头跟着扣减走——先看 X、Y 之间，再到 Z（外面还有名字指着它），最后退回整个孤岛
    [tSubs[0] - 0.35, { x: 3240, y: 620, z: 1.08 }, 0.8, { ease: 'power3.inOut', sfx: false }],
    [null, { x: 3300, z: 1.1 }, tAbove - 0.4 - (tSubs[0] + 0.6), { ease: 'none', sfx: false }],
    [tAbove - 0.4, { x: 3640, y: 620, z: 1.05 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { x: 3690, z: 1.07 }, tAt0 - 0.4 - (tAbove + 0.65), { ease: 'none', sfx: false }],
    [tAt0 - 0.4, { x: 3290, y: 600, z: 0.95 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { x: 3340, z: 0.97 }, s.end - (tAt0 + 0.65), { ease: 'none', sfx: false }],
  ]);
});
