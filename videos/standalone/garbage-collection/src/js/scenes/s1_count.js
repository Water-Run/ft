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
  const hd1 = tag(ui, '引用计数', 124, 140, 34);
  const hd2 = tx(ui, 'ser', '实时记账', 116, 198, { size: 130, ...plate });
  slide(hd1, c0 - 0.3, { x: -40, d: 0.3 }); wipe(hd2, qb(T('a1', '实时')), { dir: 'l', d: 0.45 }); sfx('thud', qb(T('a1', '实时')), { g: 0.7 });
  const tA = h('div', 'abs', world); px(tA, 380, 470, 140, 140); tA.style.background = C.white;
  const tAn = tx(world, 'big', '', 380, 488, { size: 96, color: C.ink }); css(tAn, { width: '140px', textAlign: 'center' });
  const tAl = tx(world, 'big', 'A', 316, 500, { size: 60 });
  slam(tA, c0 - 0.3, { from: 0.5, d: 0.4 }); appear(tAl, c0 - 0.1); sfx('pop', c0 - 0.3, { g: 0.6 });
  const srcs = [[930, 330], [1010, 520], [930, 710]].map(([x, y]) => cell(sv, x, y, 44));
  const tN = [qb(T('a1b', '数数')), qb(T('a1b', '多少')), qb(T('a1b', '地方'))];
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
  const t8 = qb(Math.min(T('a2b', '八字节') - 0.15, Tend('a2') - 0.5));
  wipe(cnt, t8, { dir: 'l', d: 0.4 }); sfx('thud', t8, { g: 0.6 });
  const b8 = h('div', 'abs', world); px(b8, 384, 440, 552, 6); b8.style.background = C.white;
  const l8 = tx(world, 'sub', '前 8 字节', 384, 360, { size: 52 }), l8e = tx(world, 'mono', 'ob_refcnt', 640, 376, { size: 30, color: C.pale });
  const b16 = h('div', 'abs', world); px(b16, 380, 634, 1120, 6); b16.style.background = C.pale;
  const l16 = tx(world, 'mono', 'sys.getsizeof(object()) = 16 bytes', 380, 650, { size: 28, color: C.pale });
  const lSrc = tx(world, 'src', 'CPython 3.14.3', 1300, 410);
  wipe(b8, t8, { dir: 'l', d: 0.4 }); slide(l8, t8 + 0.05, { y: 20, d: 0.35 }); appear(l8e, t8 + 0.3);
  wipe(b16, tU + 0.5, { dir: 'l', d: 0.5 }); appear(l16, tU + 0.7); appear(lSrc, tU + 0.7);
  const t3 = qb(T('a3', '刚出生') - 0.25);
  const tWide0 = qb(T('a4b', '全局')) - 0.4;
  for (const e of [lSrc, tAl]) exit(e, tWide0, { y: -30, d: 0.25 });
  for (const e of [l8, l8e, b8]) exit(e, t3 - 0.1, { y: -30, d: 0.3 });

  // ── 1→2→3→2→1→0：名字一个个指上来，又一个个撤走 ──
  const names = [['a', 420], ['b', 600], ['holder', 780]];
  const tk = [qb(T('a3', '刚出生')), qb(T('a3', '赋给')), qb(T('a3b', '塞进')), qb(T('a3b', '删掉')), qb(T('a3b', '清空')), qb(T('a4', '抹去'))];
  const tZero = qb(T('a4', '归零')), tFree = qb(T('a4b', '释放') - 0.1);
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
  const zTag = tag(world, '归零', 960, 500, 44);
  slam(zTag, tZero + 0.05, { from: 1.3, d: 0.35 });
  // 当场释放：16 个字节一起碎掉
  for (const e of [strip, cnt, cntN, b16, l16]) vanish(e, tFree);
  shatter(world, 380, 470, 1120, 140, C.gold, tFree, { n: 8, gap: 6, spread: 70, fall: 90, seed: 9 });
  sfx('thud', tFree, { g: 0.8 }); sfx('pop', tFree + 0.12, { g: 0.5 });
  const tW = qb(T('a5', '对象') - 0.15), tC6 = qb(T('a6', '代价') - 0.4);
  exit(zTag, tW - 0.2, { y: -40, d: 0.3 });
  exit(code.el, tW - 0.2, { y: 80, d: 0.32 });
  // 不劳烦任何人：其余的格子一动不动；对象自己知道什么时候该走
  wonder(ui, '对象自己知道<br>什么时候该走', 120, 300, tW, tC6 - 0.1, { plate: true, size: 110, h: 250 });

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
  const rr = seeded(23), steps = [], tS6 = qn(T('a6', '指针')), tE6 = tLoop - 0.6;
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
  const h6 = tx(ui, 'sub', '每改一次指针，记一笔账', 120, 820, { size: 52, ...plate });
  wipe(h6, qb(T('a6', '指针') + 0.2), { dir: 'l', d: 0.4 });
  obEls.forEach((o, k) => { exit(o.b, tE6 + k * 0.03, { y: 60, d: 0.3 }); exit(o.n, tE6 + k * 0.03, { y: 60, d: 0.3 }); });
  exit(h6, tE6, { y: 60, d: 0.3 });

  // ── 循环引用：X 牵着 Y，Y 牵着 X ──
  const hLoop = tx(ui, 'ser', '循环引用', 116, 136, { size: 110, ...plate });
  slam(hLoop, tLoop, { from: 1.2, d: 0.45 }); sfx('thud', tLoop, { g: 0.8 });
  const X = { x: 2900, y: 420 }, Y = { x: 3400, y: 420 }, S = 200;
  const tXY = qb(T('a6b', '循环引用') - 0.1), tP1 = qb(T('a7', '牵着')), tP2 = qb(T('a7', '牵着') + 0.95), tDel = qb(T('a7', '删光') - 0.1);
  const tScan = qb(T('a9', '唤醒')), tHit = qb(T('a9', '出手')), tGone = qb(T('a9b', '清理') - 0.1);
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
  const loopCol = (t) => ({ col: t >= tHit ? C.gold : C.white });
  grow(pXY, tP1, tGone, { d: 0.35, st: loopCol }); grow(pYX, tP2, tGone, { d: 0.35, st: loopCol });
  sfx('pop', tXY, { g: 0.6 }); sfx('tick', tP1 + 0.3, { g: 0.5, p: 0.2 }); sfx('tick', tP2 + 0.3, { g: 0.5, p: -0.2 });
  keyed(eX.n).at(tXY + 0.1, { html: '1' }).at(tP2 + 0.3, { html: '2' }).at(tDel + 0.25, { html: '1' });
  keyed(eY.n).at(tXY + 0.1, { html: '1' }).at(tP1 + 0.3, { html: '2' }).at(tDel + 0.25, { html: '1' });
  pulse(eX.n, tP2 + 0.3); pulse(eY.n, tP1 + 0.3); pulse(eX.n, tDel + 0.25); pulse(eY.n, tDel + 0.25);
  sfx('pop', tDel, { g: 0.45 });
  // 卡在 1：两个 1 随拍子一明一暗
  const tStuck = qb(T('a7b', '卡在一') - 0.1);
  // 两根指针都牵上之后，X、Y 互相拉扯：一拍拽一下，你一下我一下，名字删光了也不停，直到「卡在 1」
  for (let t = qb(tP2 + 0.6); t < tStuck - 0.2; t += BEAT) { pulse(eX.b, t, 1.1, 0.26); pulse(eX.n, t, 1.1, 0.26); pulse(eY.b, t + BEAT / 2, 1.1, 0.26); pulse(eY.n, t + BEAT / 2, 1.1, 0.26); }
  for (let k = 0; k < 6; k++) { const t = tStuck + k * BEAT; pulse(eX.n, t, 1.15, 0.2); pulse(eY.n, t + BEAT / 2, 1.15, 0.2); }
  const raw = slab(ui, 120, 640, ['with names:    raw X = 2  raw Y = 2', 'after del x,y: raw X = <span class="k">1</span>  raw Y = <span class="k">1</span>'], { size: 26 });
  const rawL = tx(ui, 'src', 'CPython 3.14.3', 124, 604);
  wipe(raw.el, qb(T('a7b', '拉扯')), { dir: 'l', d: 0.35 }); appear(rawL, qb(T('a7b', '拉扯'))); sfx('blip', qb(T('a7b', '拉扯')), { g: 0.5 });
  appear(raw.ln[1], tStuck - 0.2);
  const php = slab(ui, 1000, 640, ['cycle: x.next = y, y.next = x, then unset(x, y):', '(after unset x, y: no destructor ran)'], { size: 24 });
  const phpL = tx(ui, 'src', 'PHP 8.5.10', 1004, 604);
  const tA8 = qb(T('a8', '谁'));
  wipe(php.el, tA8, { dir: 'r', d: 0.35 }); appear(phpL, tA8); sfx('blip', tA8, { g: 0.5 });
  // 孤岛
  const tIs = qb(T('a8', '孤岛') - 0.15);
  const isl = h('div', 'abs', world); px(isl, 2850, 190, 800, 560); css(isl, { border: `4px dashed ${C.pale}` });
  const islL = tx(world, 'ser', '孤岛', 3660, 200, { size: 64, color: C.pale });
  wipe(isl, tIs, { dir: 'l', d: 0.5 }); slide(islL, tIs + 0.2, { x: 30, d: 0.35 }); sfx('thud', tIs, { g: 0.55 });
  // 拆环器：从 PHP 与 CPython 的输出里，各收走 2 个
  const tFix = qb(T('a8b', '拆环') - 0.1);
  const cyc = tag(world, '拆环器', 3690, 330, 44);
  slam(cyc, tFix, { from: 1.3, d: 0.35 }); sfx('thud', tFix, { g: 0.6 });
  exit(hLoop, tFix, { x: -120, d: 0.3 });
  for (const e of [raw.el, rawL]) exit(e, tScan - 0.15, { y: 60, d: 0.25 });
  exit(php.el, tScan - 0.15, { y: 60, d: 0.25 }); exit(phpL, tScan - 0.15, { y: 60, d: 0.25 });
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
  const two = tx(world, 'big', '2<span class="ser" style="font-size:80px;letter-spacing:0"> 个</span>', 3700, 420, { size: 160, color: C.gold });
  slam(two, t2, { from: 1.35, d: 0.42 }); sfx('chime', t2, { g: 0.6 });
  sfx('thud', tGone, { g: 0.8 });
  const tIs2 = qb(T('a9b', '正是'));
  [py2, ph2].forEach((sl) => [1, 2].forEach((k) => classAt(sl.ln[k].querySelector('span'), 'hl', tIs2)));
  exit(isl, tGone + 0.3, { y: 0, d: 0.4 });

  // ── 镜头 ──
  const tZoom = qb(T('a2b', '八字节')) - 0.4, tWide = qb(T('a4b', '全局')) - 0.3, tIsl = qb(T('a8', '孤岛')) - 0.3;
  cam.track(s.start, { x: 860, y: 540, z: 0.9 }, [
    [s.start + 0.5, { z: 1.0 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { z: 1.03 }, tU - 0.3 - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tU - 0.3, { x: 940, y: 540, z: 1.12 }, 0.9, { sfx: false }],
    [tZoom, { x: 660, y: 520, z: 1.55 }, 0.9, { ease: 'power3.inOut', g: 0.3 }],
    [t3 - 0.4, { x: 940, y: 520, z: 1.0 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 1.03 }, tWide - (t3 + 0.65) - 0.05, { ease: 'none', sfx: false }],
    [tWide, { x: 940, y: 560, z: 0.7 }, 1.1, { ease: 'power2.inOut', sfx: false }],
    [null, { z: 0.73 }, tC6 - (tWide + 1.25) - 0.05, { ease: 'none', sfx: false }],
    [tC6, { x: 2450, y: 560, z: 1.0 }, 1.1, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.03 }, tLoop - 0.6 - (tC6 + 1.25) - 0.05, { ease: 'none', sfx: false }],
    [tLoop - 0.6, { x: 3200, y: 640, z: 1.0 }, 1.0, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 1.02 }, tIsl - (tLoop + 0.55) - 0.05, { ease: 'none', sfx: false }],
    [tIsl, { x: 3260, y: 600, z: 0.9 }, 0.8, { ease: 'power2.inOut', sfx: false }],
    [null, { z: 0.93 }, s.end - (tIsl + 0.95), { ease: 'none', sfx: false }],
  ]);
});
