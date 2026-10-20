// 第 05 章 · 谁来买单。主画面：三张账单在全片唯一的黑底上一行一行打出来——引用计数、追踪回收、所有权与手动管理，
// 各自在哪里付钱、钱记在谁头上。之前：内存与 CPU 的跷跷板、Nim 的 --mm 开关、Rust 的所有权、C 与 Zig 的 free。
// 数据：Nim 2.2.12（out_11）、rustc 1.98.1（out_06）、Go GOGC 与 Lua pause（U01、L08）、cppreference 与 Zig 官网（K01、K02）。
scene('cost', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const sv = board(world, -400, -300, 12400, 1700);
  bgHeap(sv, -400, -300, 207, 28, 61, 0.1);
  const plate = { bg: C.field, pad: '0 18px 8px' };

  // ════ S1：收得越勤，内存越少，CPU 越旺 ════
  const tG1 = c0 - 0.3, tKnob = qb(T('g1', '收得越勤') - 0.2), tMem = qb(T('g1b', '内存') - 0.1), tCpu = qb(Math.min(T('g1b', 'C P U'), Tend('g1') - 0.6));
  const free0 = tx(ui, 'ser', '精妙不免费', 110, 130, { size: 110, ...plate });
  wipe(free0, tG1 + 0.2, { dir: 'l', d: 0.45 }); sfx('thud', tG1 + 0.2, { g: 0.6 });
  // 旋钮：一根滑轨，从「收得懒」推到「收得勤」
  const rail = h('div', 'abs', ui); px(rail, 200, 520, 760, 8); rail.style.background = C.white;
  const knob = h('div', 'abs', ui); px(knob, 0, 488, 36, 72); knob.style.background = C.gold;
  const lz = tx(ui, 'note', '收得懒', 190, 580, { size: 34, color: C.white }), lq = tx(ui, 'note', '收得勤', 860, 580, { size: 34, color: C.gold });
  const knobOf = (t) => kf(t, [[tKnob, 0.15], [tKnob + 1.2, 0.85], [tCpu + 0.8, 0.85], [tCpu + 1.8, 0.4], [tCpu + 2.6, 0.75]]);
  for (const e of [rail, lz, lq]) wipe(e, tKnob - 0.3, { dir: 'l', d: 0.35 });
  appear(knob, tKnob - 0.2);
  // 两根柱：内存与 CPU，此消彼长
  const bars = [['内存', 1200, C.white], ['CPU', 1500, C.gold]].map(([n, x, col]) => {
    const b = h('div', 'abs', ui); css(b, { background: col, left: x + 'px', width: '180px' });
    const l = tx(ui, 'big', n, x, 760, { size: 56, color: col });
    appear(b, tKnob - 0.2); appear(l, tKnob - 0.2);
    return { b, l };
  });
  F((t) => {
    const k = knobOf(t); ss(knob, 'left', (200 + k * 760 - 18).toFixed(1) + 'px');
    const mem = 480 * (1 - 0.75 * k), cpu = 480 * (0.15 + 0.8 * k);
    ss(bars[0].b, 'top', (740 - mem).toFixed(1) + 'px'); ss(bars[0].b, 'height', mem.toFixed(1) + 'px');
    ss(bars[1].b, 'top', (740 - cpu).toFixed(1) + 'px'); ss(bars[1].b, 'height', cpu.toFixed(1) + 'px');
  });
  sfx('whoosh', tKnob, { g: 0.35 }); sfx('pop', tMem, { g: 0.5, p: 0.2 }); sfx('thud', tCpu, { g: 0.6, p: 0.5 });
  const knobs = tx(ui, 'src', '真实的旋钮：Go 的 GOGC · Lua 的 pause', 200, 650);
  appear(knobs, tKnob + 0.4);
  const tG3 = qb(T('g3', '既然') - 0.3);
  for (const e of [free0, rail, knob, lz, lq, knobs, ...bars.flatMap((x) => [x.b, x.l])]) exit(e, tG3, { y: -50, d: 0.3 });

  // ════ S2：Nim 的 --mm 开关；ARC 留下的环 ════
  const X2 = 2400;
  const nimH = tx(world, 'big', 'Nim', X2 + 120, 110, { size: 150 }), nimV = tx(world, 'src', 'Nim 2.2.12 · --mm:', X2 + 440, 190);
  slam(nimH, qb(T('g3', 'Nim') - 0.05), { from: 1.25, d: 0.4 }); appear(nimV, qb(T('g3', 'Nim')) + 0.2); sfx('thud', qb(T('g3', 'Nim') - 0.05), { g: 0.8 });
  const MODES = ['orc', 'arc', 'refc', 'markAndSweep', 'boehm', 'go', 'none'];
  const tOrc = qb(T('g3b', '默认') - 0.1), tArc = qb(T('g4', '只留') - 0.1), tNever = qb(T('g4b', '永远') - 0.2), tG5 = qb(T('g5', 'Rust') - 0.35);
  const mEls = MODES.map((m, k) => { const e = tx(world, 'mono', m, X2 + 140, 300 + k * 70, { size: 40, color: C.pale }); appear(e, tG3 + 0.6 + k * 0.06); return e; });
  sfx('tick', tG3 + 0.6, { g: 0.4 });
  const sel = h('div', 'abs', world); css(sel, { border: `5px solid ${C.gold}`, width: '420px', height: '66px' });
  // 「让你自己挑」：选框先沿列表一格一格往下翻（八分音符一格），说到「默认」时落回 orc
  const tScan = qb(tG3 + 1.2), NSCAN = Math.max(0, Math.floor((tOrc - tScan) / (BEAT / 2)));
  F((t) => { const scan = t >= tScan && t < tOrc, k = scan ? Math.floor((t - tScan) / (BEAT / 2)) % MODES.length : t < tArc ? 0 : 1; vis(sel, (scan || t >= tOrc) && t < tG5); ss(sel, 'left', X2 + 120 + 'px'); ss(sel, 'top', (300 + k * 70 - 10) + 'px'); mEls.forEach((e, i) => ss(e, 'color', (scan || t >= tOrc) && i === k ? C.white : C.pale)); });
  for (let i = 0; i < NSCAN; i++) sfx('tick', tScan + i * BEAT / 2, { g: 0.16, p: -0.3 + 0.1 * (i % 7) });
  sfx('tick', tOrc, { g: 0.6 }); sfx('tick', tArc, { g: 0.6 });
  const dflt = tag(world, '默认：引用计数 + 拆环器', X2 + 600, 296, 34); slide(dflt, tOrc + 0.1, { x: -30, d: 0.3 });
  const arcT = tag(world, 'ARC：只留引用计数', X2 + 600, 366, 34); slide(arcT, tArc + 0.1, { x: -30, d: 0.3 });
  const arcBig = tx(world, 'big', 'ARC', X2 + 1180, 440, { size: 150, color: C.gold }); slam(arcBig, qb(Math.min(T('g4', 'A R C'), Tend('g3b') + 0.3)), { from: 1.3, d: 0.4 });
  sfx('thud', qb(Math.min(T('g4', 'A R C'), Tend('g3b') + 0.3)), { g: 0.8 });
  // 那个环：ORC 下收走，ARC 下永远不放
  const RX = X2 + 1200, RY = 690;
  const ring = [0, 1].map((k) => { const b = h('div', 'abs', world); px(b, RX + k * 260, RY, 120, 120); b.style.background = C.white; const l = tx(world, 'big', k ? 'Y' : 'X', RX + k * 260 + 40, RY + 24, { size: 60, color: C.ink }); slam(b, tArc + 0.6 + k * 0.1, { from: 0.4, d: 0.35 }); appear(l, tArc + 0.6 + k * 0.1); return [b, l]; });
  const rsv = board(world, RX - 20, RY - 20, 440, 160);
  const rp1 = ptr(rsv, RX + 126, RY + 40, RX + 254, RY + 40, { w: 5, head: 18 }), rp2 = ptr(rsv, RX + 254, RY + 80, RX + 126, RY + 80, { w: 5, head: 18 });
  grow(rp1, tArc + 0.9, tG5, { d: 0.3 }); grow(rp2, tArc + 1.1, tG5, { d: 0.3 });
  for (let k = 0; k < 6; k++) ring.forEach(([b], j) => pulse(b, tNever + k * BEAT + j * BEAT / 2, 1.1, 0.2));
  const never = tx(world, 'ser', '永远释放不了', RX - 20, RY + 150, { size: 64 }); wipe(never, tNever, { dir: 'l', d: 0.4 }); sfx('error', tNever, { g: 0.35 });
  const nimOut = slab(ui, 1100, 120, ['<span class="hd">--mm:arc</span>  after GC_fullCollect(): destroyed = <span class="k">2</span>', '<span class="hd">--mm:orc</span>    =destroy Y', '<span class="hd">--mm:orc</span>    =destroy X', '<span class="hd">--mm:orc</span>  after GC_fullCollect(): destroyed = <span class="k">4</span>'], { size: 22, pad: '14px 22px 16px' });
  wipe(nimOut.el, tArc + 1.0, { dir: 'r', d: 0.35 }); sfx('blip', tArc + 1.0, { g: 0.4 });
  for (const e of [nimH, nimV, ...mEls, dflt, arcT, arcBig, never, ...ring.flat()]) exit(e, tG5, { y: -40, d: 0.3 });
  exit(nimOut.el, tG5, { x: 80, d: 0.3 });

  // ════ S3：Rust 所有权：一块内存只认一个主人；编译器写好释放 ════
  const X3 = 4800;
  const rustH = tx(world, 'big', 'Rust', X3 + 120, 110, { size: 150 }), rustV = tx(world, 'src', 'rustc 1.98.1', X3 + 520, 190);
  const own = tag(world, '所有权', X3 + 124, 300, 48), ownE = tx(world, 'lat', 'ownership', X3 + 320, 312, { size: 36, color: C.pale });
  const tOwn = qb(Math.min(T('g5b', '所有权'), Tend('g5') - 0.5)), tOne = qb(T('g5b', '一个主人') - 0.2), tMove = qb(T('g6', '编译期') - 0.1);
  slam(rustH, tG5 + 0.35, { from: 1.25, d: 0.4 }); appear(rustV, tG5 + 0.6); sfx('thud', tG5 + 0.35, { g: 0.8 });
  slam(own, tOwn, { from: 1.3, d: 0.35 }); appear(ownE, tOwn + 0.2); sfx('thud', tOwn, { g: 0.6 });
  // 一块内存挂一个主人：主人从 a 换成 c（move），中间从不同时有两个
  const MB = { x: X3 + 1100, y: 420 };
  const blk = h('div', 'abs', world); px(blk, MB.x, MB.y, 200, 200); blk.style.background = C.white;
  const blkL = tx(world, 'big', 'A', MB.x + 70, MB.y + 50, { size: 90, color: C.ink });
  slam(blk, tOne - 0.4, { from: 0.4, d: 0.4 }); appear(blkL, tOne - 0.3); sfx('pop', tOne - 0.4, { g: 0.6 });
  const oA = wtag(world, 'a', X3 + 760, MB.y + 70, 44), oC = wtag(world, 'c', X3 + 760, MB.y + 250, 44);
  const osv = board(world, X3 + 700, MB.y - 40, 600, 400);
  const pa = ptr(osv, X3 + 830, MB.y + 100, MB.x - 6, MB.y + 100, { w: 6, head: 22 }), pc = ptr(osv, X3 + 830, MB.y + 280, MB.x - 6, MB.y + 160, { w: 6, head: 22 });
  slide(oA, tOne, { x: -30, d: 0.3 }); grow(pa, tOne + 0.1, tMove, { d: 0.3 });
  slide(oC, tMove - 0.2, { x: -30, d: 0.3 }); grow(pc, tMove, Infinity, { d: 0.3 });
  F((t) => ss(oA, 'opacity', t >= tMove ? '0.5' : '1'));
  const one = tx(world, 'ser', '只认一个主人', X3 + 1360, 470, { size: 72 }); wipe(one, tOne, { dir: 'l', d: 0.45 }); sfx('tick', tOne, { g: 0.5 });
  const mir = slab(ui, 120, 700, ['_11 = <span class="k">move</span> _1;', '<span class="g">drop</span>(_2) -&gt; [return: bb4, unwind: bb15];', '<span class="g">drop</span>(_11) -&gt; [return: bb10, unwind: bb15];'], { size: 24, pad: '14px 22px 16px' });
  const mirL = tx(ui, 'src', 'rustc --emit=mir', 124, 664);
  const nim2 = slab(ui, 1000, 700, ['`<span class="g">=destroy</span>`(b)', '`<span class="k">=copy</span>`(c, a)', '`<span class="g">=destroy</span>`(c)', '`<span class="g">=destroy</span>`(a)'], { size: 24, pad: '14px 22px 16px' });
  const nim2L = tx(ui, 'src', 'Nim --expandArc', 1004, 664);
  const tComp = qb(Math.min(T('g6', '编译器'), Tend('g5b') + 0.3)), tNimArc = qb(T('g6', 'Nim') - 0.1), tCount = qb(T('g6b', '数数') - 0.2);
  wipe(mir.el, tComp, { dir: 't', d: 0.35 }); appear(mirL, tComp); sfx('blip', tComp, { g: 0.5 });
  wipe(nim2.el, tNimArc, { dir: 't', d: 0.35 }); appear(nim2L, tNimArc); sfx('blip', tNimArc, { g: 0.5 });
  const comp = tag(ui, '编译器写好', 430, 598, 36); slam(comp, tComp + 0.2, { from: 1.3, d: 0.3 });
  const still = tag(ui, '运行时还在数数', 1500, 620, 36); slam(still, tCount, { from: 1.3, d: 0.3 }); sfx('tick', tCount, { g: 0.6 });
  nim2.ln[1].querySelector('.k') && classAt(nim2.ln[1], 'hl', tCount + 0.1);
  const tG7 = qb(T('g7', 'C') - 0.35);
  for (const e of [rustH, rustV, own, ownE, blk, blkL, oA, oC, one, mir.el, mirL, nim2.el, nim2L, comp, still]) exit(e, tG7, { y: -40, d: 0.3 });

  // ════ S4：C 与 Zig：自己 free ════
  const X4 = 7200;
  const cH = tx(world, 'big', 'C', X4 + 160, 160, { size: 220 }), zH = tx(world, 'big', 'Zig', X4 + 560, 160, { size: 220 });
  slam(cH, tG7 + 0.35, { from: 1.3, d: 0.4 }); slam(zH, qb(T('g7', 'Zig') - 0.05), { from: 1.3, d: 0.4 }); sfx('thud', tG7 + 0.35, { g: 0.7 }); sfx('thud', qb(T('g7', 'Zig') - 0.05), { g: 0.7 });
  const freeL = slab(world, X4 + 160, 500, [''], { size: 64, pad: '22px 36px 26px' });
  const tFree = qb(Math.min(T('g7b', '写'), Tend('g7') - 0.9));
  appear(freeL.el, tFree - 0.1); typeText(freeL.ln[0], '<span style="font-weight:700">free</span>(ptr);', tFree, 14);
  const cref = tx(world, 'src', 'C · cppreference：free 释放此前由 malloc 等分配的空间', X4 + 164, 690);
  const zref = paper(world, X4 + 1080, 470, 680, '<div class="pt" style="font-size:40px">Manual memory management</div><div class="pq" style="font-size:28px;margin-top:14px">There is no hidden control flow, no hidden memory allocations …</div><div class="pm" style="font-size:22px;margin-top:14px">ziglang.org</div>');
  appear(cref, tFree + 0.5); slide(zref, qb(T('g7', 'Zig') + 0.4), { x: 80, d: 0.4 });
  const self = tx(world, 'ser', '自己分配，自己还', X4 + 160, 790, { size: 72 }); wipe(self, qb(T('g7b', '还回去') - 0.2), { dir: 'l', d: 0.4 }); sfx('chime', qb(T('g7b', '还回去')), { g: 0.4 });
  const tG8 = qb(T('g8', '计算机') - 0.35);
  for (const e of [cH, zH, freeL.el, cref, zref, self]) exit(e, tG8, { y: -40, d: 0.3 });

  // ════ S5：账单（全片唯一的黑底）════
  const X5 = 9600;
  const dark = h('div', 'abs', world); px(dark, X5 - 600, -400, 3200, 1900); dark.style.background = C.ink;
  wipe(dark, tG8 - 0.2, { dir: 't', d: 0.5, ease: 'power3.inOut' }); sfx('whoosh', tG8 - 0.2, { g: 0.5 });
  const bill = tx(world, 'ser', '没有白吃的午餐', X5 + 120, 110, { size: 96, color: C.white });
  const bill2 = tx(world, 'ser', '账单', X5 + 1280, 80, { size: 170, color: C.gold });
  wipe(bill, tG8 + 0.3, { dir: 'l', d: 0.5 }); slam(bill2, qb(Math.min(T('g8b', '账单'), Tend('g8') - 0.5)), { from: 1.3, d: 0.45 }); sfx('thud', qb(Math.min(T('g8b', '账单'), Tend('g8') - 0.5)), { g: 1 });
  // 三张账单：纸往下吐，一行一行打出来（热敏打印机的节奏：每八分音符一行）
  const RW = 520, RXs = [X5 + 80, X5 + 680, X5 + 1280], RY0 = 320;
  const tR1 = qb(T('g9', '引用计数') - 0.2), tR2 = qb(Math.min(T('g9b', '追踪回收'), Tend('g9') - 0.6)), tR3 = qb(T('g10', '所有权') - 0.2);
  const rec = [
    { x: RXs[0], t: tR1, title: '引用计数', lines: [['改指针', '+1'], ['改指针', '−1'], ['改指针', '+1'], ['改指针', '−1'], ['每次一笔零钱', '']] },
    { x: RXs[1], t: tR2, title: '追踪回收', lines: [['标记', ''], ['停顿', ''], ['屏障', '']], at: [qb(T('g9b', '标记') - 0.1), qb(T('g9b', '停顿') - 0.1), qb(T('g9b', '屏障') - 0.1)] },
    { x: RXs[2], t: tR3, title: '所有权 · 手动', lines: [['运行时的账单', ''], ['付款人', '写代码的人'], ['付款人', '编译器']], at: [qb(T('g10', '运行时') - 0.1), qb(Math.min(T('g10b', '写代码的人'), Tend('g10') - 0.9)), qb(Math.min(T('g10b', '编译器'), Tend('g10') - 0.45))] },
  ];
  const LH = 56;
  rec.forEach((r, i) => {
    const times = r.at || r.lines.map((_, k) => r.t + 0.4 + k * BEAT / 2);
    const paperEl = h('div', 'abs', world); px(paperEl, r.x, RY0, RW, 120); paperEl.style.background = C.white;
    const head = tx(world, 'ser', r.title, r.x + 32, RY0 + 22, { size: 50, color: C.ink });
    const rule = h('div', 'abs', world); px(rule, r.x + 32, RY0 + 100, RW - 64, 0); css(rule, { borderTop: `3px dashed ${C.ink}` });
    appear(paperEl, r.t); appear(head, r.t + 0.05); appear(rule, r.t + 0.1);
    sfx('drive', r.t, { g: 0.3, p: -0.5 + i * 0.5 });
    const n = r.lines.length;
    F((t) => { let k = 0; while (k < n && times[k] <= t) k++; const hgt = 130 + k * LH + (k === n ? 40 : 0); ss(paperEl, 'height', hgt + 'px'); });
    r.lines.forEach(([a, b], k) => {
      const y = RY0 + 120 + k * LH;
      const ln = tx(world, 'mono', `<span>${a}</span><span style="font-weight:700">${b}</span>`, r.x + 32, y, { size: 32, color: C.ink });
      css(ln, { width: RW - 64 + 'px', display: 'flex', justifyContent: 'space-between' });
      appear(ln, times[k]);
      sfx('key', times[k], { g: 0.6, p: -0.5 + i * 0.5 });
    });
  });
  const who = tx(world, 'ser', '递给了写代码的人和编译器', X5 + 120, 830, { size: 72, color: C.gold });
  wipe(who, qb(T('g10b', '递给') - 0.1), { dir: 'l', d: 0.5 }); sfx('chime', qb(T('g10b', '递给')), { g: 0.6 });

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 540, z: 0.92 }, [
    [s.start + 0.5, { z: 1.0 }, c0 - s.start - 0.5, { ease: 'power2.out', sfx: false }],
    [null, { z: 1.02 }, tG3 - 0.3 - (c0 + 0.15) - 0.05, { ease: 'none', sfx: false }],
    [tG3 - 0.3, { x: X2 + 960 }, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 1.04 }, tG5 - 0.3 - (tG3 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tG5 - 0.3, { x: X3 + 960, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 1.03 }, tG7 - 0.3 - (tG5 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tG7 - 0.3, { x: X4 + 960, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 1.03 }, tG8 - 0.4 - (tG7 + 0.85) - 0.05, { ease: 'none', sfx: false }],
    [tG8 - 0.4, { x: X5 + 960, y: 540, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.03 }, s.end - (tG8 + 0.75), { ease: 'none', sfx: false }],
  ]);
});
