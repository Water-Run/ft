// 第 03 章 · 分代。主画面：一整块堆沿着两条缝裂开，长成三层「地层」——上面一窄条是新区（0 代），
// 下面越来越厚的是 1 代、2 代。一个对象熬过回收就往下掉一层；新区一秒被扫 136 次，老区一次没动。
// 最后一个老对象牵住新对象，老区那一块的卡上打了一个勾。数据：.NET 10.0.12（out_09）；Lieberman & Hewitt 1983。
scene('gen', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const sv = board(world, -600, -400, 3200, 1800);
  bgHeap(sv, -600, -400, 53, 30, 41, 0.12);
  const plate = { bg: C.field, pad: '0 18px 8px' };
  const COLS = 26, ROWS = 11, P = 60, TS = 48;
  const rowOff = (r) => (r >= 2 ? 40 : 0) + (r >= 5 ? 40 : 0);          // 分代之后的行偏移：两条缝
  const band = (r) => (r < 2 ? 0 : r < 5 ? 1 : 2);
  const B = [{ y0: 0, y1: 120 }, { y0: 160, y1: 340 }, { y0: 380, y1: 740 }];

  // ── 时刻 ──
  const tSlow = qb(T('d1', '全盘') - 0.2), t83 = qb(Math.min(T('d1b', '一九八三'), Tend('d1') - 0.5));
  const tPap = qb(T('d1b', '利伯曼') - 0.2), tShort = qb(T('d1c', '短命') - 0.4);
  const tSplit = qb(T('d2', '分房') - 0.2), tGen = qb(T('d2', '分代') - 0.1), tNew = qb(T('d2', '新区') - 0.1);
  const tFast = qb(T('d2b', '勤打扫') - 0.6), tW3 = qb(T('d3', '一条') - 0.2);
  const tD4 = qb(T('d4', 'dot net') - 0.3), tBorn = qb(T('d4', '刚出生') - 0.1), tUp1 = qb(T('d4b', '升') - 0.1), tUp2 = qb(T('d4b', '进') - 0.1);
  const tD5 = qb(T('d5', '开头') - 0.2), t136 = qb(T('d5', '一百三十六次') - 0.3), tZero = qb(T('d5b', '一次都没动') - 0.4);
  const tD6 = qb(T('d6', '可万一') - 0.3), tQ = qb(T('d6b', '不能杀') - 0.3);
  const tD8 = qb(T('d8', 'dot net') - 0.2), tCard = qb(T('d8', '卡表') - 0.1), tWrite = qb(T('d8', '改过') - 0.1), tTick = qb(T('d8b', '打个勾') - 0.1), tOnly = qb(T('d8b', '只查') - 0.1);
  const tD9 = qb(T('d9', '暗哨') - 0.2);

  // ── 堆：先是一整块，再裂成三层 ──
  const fsv = board(world, -40, -40, COLS * P + 80, 900);
  const r = seeded(83), tiles = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const v = r();
    tiles.push({ c: cell(fsv, i * P + 30, j * P + 30, TS), i, j, b: band(j), old: v < 0.55, born: c0 - 0.3 + (i + j) * 0.02, h1: r(), h2: r() });
  }
  const split = (t) => ease.io3(clamp((t - tSplit) / 0.7));
  const CH = BEAT / 2;                                          // 新区：每八分音符扫一次
  const sweep0 = (t) => (t >= tFast ? (t - tFast) / CH : -1);
  F((t) => {
    const sp = split(t);
    tiles.forEach((o, k) => {
      if (t < o.born) return o.c.set({ k: 0 });
      const y = o.j * P + 30 + rowOff(o.j) * sp;
      if (o.b === 0 && t >= tShort) {                            // 新区：生生灭灭
        const per = t >= tFast ? CH : BEAT, m = Math.floor((t - tShort) / per), ph = (t - tShort) / per - m;
        const alive = ((k * 7 + m * 13) % 10) < 6, birth = ((k * 3 + m * 5) % 7) / 10;
        if (!alive || ph < birth) return o.c.set({ k: 0, y });
        const end = 0.92, dying = ph > end - 0.08;
        return o.c.set({ fill: dying ? C.gold : C.white, k: dying ? Math.max(0, (end - ph) / 0.08) : Math.min(1, (ph - birth) * 6), y });
      }
      if (t >= tShort && t < tSplit && !o.old) {                 // 短命鬼：大多数刚出生就死
        const ph = (t - tShort - o.h1 * 1.2) / 0.5;
        if (ph < 0) return o.c.set({ fill: C.white, k: 1, y });
        if (o.h2 < 0.82) return o.c.set(ph < 1 ? { fill: C.gold, k: 1 - ph } : { k: 0, y });
        return o.c.set({ fill: C.ink, k: 1, y });
      }
      if (t >= tSplit && !o.old && o.h2 < 0.82) return o.c.set({ k: 0, y });
      o.c.set({ fill: o.old || o.h2 >= 0.82 ? C.ink : C.white, k: Math.min(1, (t - o.born) / 0.15), y });
    });
  });
  // 全盘扫描：一道金线慢慢爬过整块
  const slow = h('div', 'abs', world); css(slow, { background: C.gold, width: '16px', height: '680px', top: '-10px' });
  FR(tSlow - 0.1, tShort, (t) => { vis(slow, t >= tSlow && t < tShort - 0.05); ss(slow, 'left', (-20 + 1600 * clamp((t - tSlow) / 4.6)).toFixed(1) + 'px'); });
  sfx('whoosh', tSlow, { g: 0.3 });
  // 新区的金线：分代之后只扫这一窄条
  const fast = h('div', 'abs', world); css(fast, { background: C.gold, width: '14px', height: '130px', top: '-5px' });
  FR(tFast - 0.1, tD6, (t) => { const u = sweep0(t); vis(fast, u >= 0 && t < tD6 - 0.1); if (u >= 0) ss(fast, 'left', (-20 + 1600 * (u - Math.floor(u))).toFixed(1) + 'px'); });
  for (let k = 0; k < 10; k++) sfx('tick', tFast + k * CH, { g: 0.22, p: -0.4 });
  // 三层的轮廓与名字
  const outl = B.map((b, k) => { const e = h('div', 'abs', world); px(e, -16, b.y0 - 12, COLS * P + 32, b.y1 - b.y0 + 24); css(e, { border: `3px solid ${k === 0 ? C.white : C.pale}` }); wipe(e, tSplit + 0.5 + k * 0.1, { dir: 'l', d: 0.5 }); return e; });
  sfx('thud', tSplit + 0.2, { g: 0.6 }); sfx('thud', tSplit + 0.45, { g: 0.5 });
  const gl = ['0 代', '1 代', '2 代'].map((n, k) => { const e = tx(world, 'big', n, -200, B[k].y0 + (k ? 40 : 20), { size: 64, color: k ? C.pale : C.white }); return e; });
  gl.forEach((e, k) => slide(e, qb(Math.min(T('d4', '三代'), Tend('d4') - 0.6)) + k * BEAT / 2, { x: -40, d: 0.3 }));
  gl.forEach((e) => exit(e, tD8 - 0.35, { x: -60, d: 0.3 }));
  gl.forEach((e, k) => sfx('pop', qb(Math.min(T('d4', '三代'), Tend('d4') - 0.6)) + k * BEAT / 2, { g: 0.45 }));
  const newL = tag(world, '新区', COLS * P + 30, 20, 40);
  slam(newL, tNew, { from: 1.3, d: 0.35 }); sfx('thud', tNew, { g: 0.55 });

  // ── ui：1983、论文、短命鬼、分代 ──
  const e83 = tx(ui, 'big', '1983', 110, 130, { size: 170, ...plate });
  slam(e83, t83, { from: 1.2, d: 0.45 }); sfx('thud', t83, { g: 0.9 });
  const names = tx(ui, 'sub', '利伯曼 · 休伊特', 124, 330, { size: 56, ...plate });
  wipe(names, tPap, { dir: 'l', d: 0.4 });
  const pap = paper(ui, 1000, 150, 780, '<div class="pt" style="font-size:40px;line-height:1.25">A Real-Time Garbage Collector Based on the Lifetimes of Objects</div><div class="pq" style="font-size:28px;margin-top:22px">Henry Lieberman, Carl Hewitt</div><div class="pm" style="font-size:24px;margin-top:10px">Communications of the ACM 26(6), 1983</div>');
  slide(pap, tPap + 0.1, { x: 120, d: 0.45 }); sfx('pop', tPap + 0.1, { g: 0.5 });
  for (const e of [e83, names]) exit(e, tShort - 0.1, { x: -100, d: 0.3 });
  exit(pap, tShort - 0.1, { x: 140, d: 0.3 });
  const eShort = tx(ui, 'ser', '短命鬼', 110, 160, { size: 150, ...plate });
  slam(eShort, qb(T('d1c', '短命') - 0.1), { from: 1.25, d: 0.42 }); sfx('thud', qb(T('d1c', '短命') - 0.1), { g: 0.7 });
  exit(eShort, tSplit - 0.1, { y: -60, d: 0.3 });
  const eGen = tx(ui, 'ser', '分代', 110, 740, { size: 150, ...plate }), eGenE = tx(ui, 'lat', 'generational', 430, 830, { size: 40, color: C.pale, ...plate });
  slam(eGen, tGen, { from: 1.25, d: 0.42 }); wipe(eGenE, tGen + 0.3, { dir: 'l', d: 0.35 }); sfx('thud', tGen, { g: 0.85 });
  for (const e of [eGen, eGenE]) exit(e, tW3 - 0.2, { y: 60, d: 0.3 });
  const w3 = wonder(ui, '一条统计学洞察，<br>长成了堆的形状', 120, 110, tW3, tD4 - 0.1, { size: 92, h: 220 });

  // ── 0 → 1 → 2：一个对象熬过回收，往下掉一层 ──
  const O = { x: 2 * P + 30 };
  const oY = [60, 160 + 90, 380 + 180];
  const ob = h('div', 'abs', world); px(ob, O.x - 30, oY[0] - 30, 60, 60); ob.style.background = C.white;
  const obL = tx(world, 'big', 'o', O.x - 12, oY[0] - 34, { size: 44, color: C.ink });
  slam(ob, tBorn, { from: 2, d: 0.4 }); appear(obL, tBorn); sfx('pop', tBorn, { g: 0.7 });
  // 掉一层：位置由帧函数按 t 算出（带一次落地回弹）
  const drop = (u) => (u < 0.72 ? (u / 0.72) ** 2 : 1 - 0.09 * Math.sin(Math.PI * (u - 0.72) / 0.28));
  F((t) => { const y = t < tUp1 ? oY[0] : t < tUp2 ? lerp(oY[0], oY[1], drop(clamp((t - tUp1) / 0.42))) : lerp(oY[1], oY[2], drop(clamp((t - tUp2) / 0.42))); ss(ob, 'top', (y - 30).toFixed(1) + 'px'); ss(obL, 'top', (y - 34).toFixed(1) + 'px'); });
  sfx('thud', tUp1 + 0.3, { g: 0.7 }); sfx('thud', tUp2 + 0.3, { g: 0.7 });
  // 每次升代之前，那一层先被金线扫一下
  const sw = h('div', 'abs', world); css(sw, { background: C.gold, width: '14px' });
  FR(tUp1 - 0.6, tUp2 + 1.6, (t) => {
    const a = t >= tUp1 - 0.5 && t < tUp1, b = t >= tUp2 - 0.5 && t < tUp2, c = t >= tUp2 + 0.9 && t < tUp2 + 1.4;
    vis(sw, a || b || c);
    const t0 = a ? tUp1 - 0.5 : b ? tUp2 - 0.5 : tUp2 + 0.9, bb = a ? B[0] : b ? B[1] : B[2];
    ss(sw, 'left', (-20 + 1600 * clamp((t - t0) / 0.5)).toFixed(1) + 'px'); ss(sw, 'top', bb.y0 - 6 + 'px'); ss(sw, 'height', bb.y1 - bb.y0 + 12 + 'px');
  });
  const genS = slab(ui, 980, 620, ['gen: new object -&gt; generation 0', 'gen: after a gen0 collection -&gt; generation 1', 'gen: after a gen1 collection -&gt; generation 2', 'gen: after a gen2 collection -&gt; generation 2'], { size: 24 });
  const genL = tx(ui, 'src', '实测：.NET 10.0.12 · GC.GetGeneration', 984, 584);
  wipe(genS.el, tBorn, { dir: 'l', d: 0.3 }); appear(genL, tBorn);
  [tBorn, tUp1 + 0.4, tUp2 + 0.4, tUp2 + 1.45].forEach((t, k) => { appear(genS.ln[k], t); classAt(genS.ln[k], 'k', t); sfx('blip', t, { g: 0.4 }); });
  const old = tx(world, 'ser', '养老', O.x + 60, oY[2] - 46, { size: 64, color: C.pale, ...plate });
  slide(old, qb(T('d4b', '养老') - 0.1), { x: 30, d: 0.3 });
  for (const e of [genS.el, genL]) exit(e, tD5 - 0.1, { y: 60, d: 0.3 });
  exit(old, tD5 - 0.1, { y: 30, d: 0.3 });

  // ── 一秒里：0 代 136 次，1、2 代 0 次 ──
  const c136 = tx(ui, 'big', '0<span class="ser" style="font-size:64px;letter-spacing:0"> 次</span>', 1430, 130, { size: 120, ...plate });
  const c1 = tx(ui, 'big', '0<span class="ser" style="font-size:48px;letter-spacing:0"> 次</span>', 1560, 380, { size: 90, ...plate });
  const c2 = tx(ui, 'big', '0<span class="ser" style="font-size:48px;letter-spacing:0"> 次</span>', 1560, 620, { size: 90, ...plate });
  wipe(c136, tD5, { dir: 'l', d: 0.3 }); stepCount(c136, tD5 + 0.2, t136 + 0.4, 0, 136, (v) => Math.round(v) + '<span class="ser" style="font-size:64px;letter-spacing:0"> 次</span>');
  slam(c1, tZero, { from: 1.3, d: 0.35 }); slam(c2, tZero + BEAT / 2, { from: 1.3, d: 0.35 }); sfx('thud', tZero, { g: 0.6 }); sfx('thud', tZero + BEAT / 2, { g: 0.6 });
  sfx('thud', t136 + 0.4, { g: 0.8 });
  const raw = slab(ui, 120, 800, ['gen0 GCs <span class="k">136</span>, gen1 <span class="k">0</span>, gen2 <span class="k">0</span>'], { size: 28, pad: '14px 26px 16px' });
  const rawL = tx(ui, 'src', '实测：.NET 10.0.12 · 那一秒', 124, 764);
  wipe(raw.el, t136, { dir: 'l', d: 0.3 }); appear(rawL, t136);
  for (const e of [c136, c1, c2, raw.el, rawL]) exit(e, tD6 - 0.1, { y: -40, d: 0.3 });

  // ── 老对象牵着新对象：卡表上打一个勾 ──
  const OLD = { x: 19 * P + 30, y: 380 + 2 * P + 30 }, NEW = { x: 21 * P + 30, y: 30 };
  const oc = h('div', 'abs', world); px(oc, OLD.x - 32, OLD.y - 32, 64, 64); css(oc, { background: C.ink, outline: `5px solid ${C.white}` });
  const nc = h('div', 'abs', world); px(nc, NEW.x - 32, NEW.y - 32, 64, 64); nc.style.background = C.white;
  const psv = board(world, 0, -60, 1700, 900);
  const pon = ptr(psv, OLD.x, OLD.y - 34, NEW.x, NEW.y + 36, { w: 6, head: 22 });
  slam(oc, tD6, { from: 1.4, d: 0.35 }); slam(nc, tD6 + 0.3, { from: 1.4, d: 0.35 });
  const tPtr = qb(T('d6', '牵着') - 0.1);
  grow(pon, tPtr, Infinity, { d: 0.35, st: (t) => ({ col: t >= tWrite && t < tWrite + 0.5 ? C.gold : C.white }) });
  sfx('pop', tD6, { g: 0.5 }); sfx('tick', tPtr + 0.3, { g: 0.5 });
  const lOld = tx(ui, 'ser', '老对象牵着新对象', 110, 860, { size: 76, ...plate });
  wipe(lOld, qb(T('d6', '老对象') - 0.1), { dir: 'l', d: 0.45 });
  const q = tx(world, 'big', '?', NEW.x + 44, NEW.y - 40, { size: 90, color: C.gold });
  slam(q, tQ, { from: 1.5, d: 0.35 }); sfx('error', tQ, { g: 0.35 });
  F((t) => ss(nc, 'background', t >= tOnly + 0.4 ? C.ink : C.white));
  exit(q, tOnly + 0.4, { y: -30, d: 0.25 });
  exit(lOld, tD8 - 0.2, { y: 60, d: 0.3 });
  // 卡表：老区按列分成一张张卡，写入时在那张卡上打勾
  const NCARD = 13, CY0 = 780;
  const cards = [];
  for (let k = 0; k < NCARD; k++) { const e = h('div', 'abs', world); px(e, k * 120 + 4, CY0, 112, 56); css(e, { border: `3px solid ${C.white}` }); wipe(e, tCard + k * 0.03, { dir: 't', d: 0.25 }); cards.push(e); }
  const cardL = tag(world, '卡表', NCARD * 120 + 30, CY0 - 2, 44); slam(cardL, tCard, { from: 1.3, d: 0.35 }); sfx('thud', tCard, { g: 0.6 });
  const ck = 9;                                   // 老对象落在第 9 张卡管的那两列里
  const tickSv = board(world, ck * 120, CY0, 120, 56);
  const tick = svg('polyline', { points: `${ck * 120 + 34},${CY0 + 28} ${ck * 120 + 54},${CY0 + 46} ${ck * 120 + 88},${CY0 + 10}`, fill: 'none', stroke: C.gold, 'stroke-width': 8, 'stroke-linecap': 'square' }, tickSv);
  draw(tick, tTick, 0.3); F((t) => { const v = t < tTick ? 'none' : ''; if (tick._d !== v) { tick._d = v; tick.style.display = v; } }); sfx('tick', tTick, { g: 0.7 }); sfx('chime', tTick + 0.15, { g: 0.45 });
  // 回收只查打勾处：那两列在老区里亮一下，新对象因此被认出是活的
  const look = h('div', 'abs', world); px(look, ck * 120 - 4, 368, 128, 384); css(look, { border: `6px solid ${C.gold}` });
  wipe(look, tOnly, { dir: 't', d: 0.35 }); sfx('whoosh', tOnly, { g: 0.35 });
  const lCard = tx(ui, 'sub', '写入时打勾，回收只查打勾处', 110, 860, { size: 56, ...plate });
  wipe(lCard, tTick, { dir: 'l', d: 0.45 });
  // 暗哨：名字先遮住
  const spy = h('div', 'abs', world); px(spy, ck * 120 + 140, CY0 - 10, 360, 76); spy.style.background = C.gold;
  const spyB = h('div', 'abs', world); px(spyB, ck * 120 + 160, CY0 + 8, 320, 40); spyB.style.background = C.ink;
  slide(spy, tD9, { x: -40, d: 0.35 }); slide(spyB, tD9 + 0.15, { x: -40, d: 0.3 }); sfx('pop', tD9, { g: 0.55 }); sfx('riser', s.end - 1.4, { g: 0.3 });
  exit(lCard, tD9 - 0.1, { y: 60, d: 0.3 });
  const lSpy = tx(ui, 'ser', '这个暗哨，有名字', 110, 860, { size: 76, ...plate });
  wipe(lSpy, tD9 + 0.2, { dir: 'l', d: 0.45 });

  // ── 镜头 ──
  const VW = { x: 780, y: 350, z: 1.0 };
  cam.track(s.start, { x: 780, y: 360, z: 0.9 }, [
    [s.start + 0.5, { z: 1.0 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { x: 800, z: 1.03 }, tSplit - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tSplit, { x: 780, y: 390, z: 0.95 }, 0.8, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.96 }, tW3 - 0.3 - (tSplit + 0.95), { ease: 'none', sfx: false }],
    [tW3 - 0.3, { x: 780, y: 160, z: 0.62 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [null, { z: 0.64 }, tD4 - 0.3 - (tW3 + 0.85), { ease: 'none', sfx: false }],
    [tD4 - 0.3, { x: 640, y: 390, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [null, { x: 660, z: 1.02 }, tD6 - 0.4 - (tD4 + 0.85), { ease: 'none', sfx: false }],
    [tD6 - 0.4, { x: 1000, y: 420, z: 0.98 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 1.02 }, tD8 - 0.3 - (tD6 + 0.65), { ease: 'none', sfx: false }],
    [tD8 - 0.3, { x: 1000, y: 470, z: 0.88 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.9 }, s.end - (tD8 + 0.75), { ease: 'none', sfx: false }],
  ]);
});
