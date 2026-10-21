// 开场：一块 64×36 格的「堆」。主画面：六千七百万个对象把整块板铺满，撞上 64 MB 的墙；
// 换个活法之后，同一块板只用到最上面六行（11 MB），一道道金线把它扫干净。
// 世界坐标：堆在 (0,0)–(3840,2160)，格距 60，方块 50。字放在不随镜头动的 ui 层里。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const START = { x: 1500, y: 560, z: 1.7 };
  let cam;
  F((t) => { if (cam && t < 0.9) Object.assign(cam.st, START); });   // 全片第 0 帧：镜头放回起点（docs/reference/pitfalls.md）
  cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const P = 60, COLS = 64, ROWS = 36, N = COLS * ROWS;
  const VF = { x: 2356, y: 1151, z: 0.365 };         // 整块板：屏幕 x 100–1502、y 120–908；右边留一栏写字
  const VO = { x: 3360, y: 1360, z: 0.25 };          // 撞墙：板缩到左半边
  const plate = { bg: C.field, pad: '0 20px 8px' };

  // ── 时刻 ──
  const tA0 = qn(T('o1b', { zh: '每造', en: 'every' }));                   // 第一个对象
  const tB0 = qb(T('o2', { zh: '一秒钟', en: 'one second' }) - 0.2), tB1 = qb(Tend('o2b') - 0.25, 4);
  // 开场只用一个比喻（策划者：观众刚进来，要浅显、低认知负载）：只占不还 → 写满；大多数用一下就没用 → 擦掉重用
  const tH0 = qb(T('o3b', { zh: '只占不还', en: 'Never give' }), 4);          // 只占不还：整块板变黑（都还被占着）
  const tO = qb(T('o3b', { zh: '耗尽', en: 'out of memory' }) - 0.05);              // 内存耗尽
  const t5a = qb(T('o5a') - 0.1), tUse = qb(T('o5a', { zh: '没用了', en: 'moment' }) - 0.2);   // 大多数用一下就没用了：黑块一片片变空心
  const tR = qb(T('o5', { zh: '擦掉', en: 'erase' }));                       // 擦掉：一道金线扫空整块板
  const tC0 = qb(T('o5', { zh: '同样', en: 'same' }) - 0.1);               // 擦掉重用：只用最上面六行
  const tP = qb(T('o10b', { zh: '艺术', en: 'trade-offs' }) - 0.15);             // 片名
  const wt0 = qb(T('o4', { zh: '换成', en: 'Try' }) + 0.05);

  // ── 堆 ──
  const gsv = board(world, 0, 0, COLS * P, ROWS * P);
  gridLines(gsv, 0, 0, COLS, ROWS, P);
  wipe(gsv, 0.02, { dir: 't', d: 1.4, ease: 'steps(18)' });
  const tsv = board(world, 0, 0, COLS * P, ROWS * P + 120);
  const FL = field(tsv, 0, 0, COLS, ROWS, P, 50);
  const BASE = 9 * COLS + 24;                          // 第一个对象落在第 9 行第 24 列
  const tb = new Float64Array(N), th = new Float64Array(N), ord = new Int32Array(N);
  for (let k = 0; k < N; k++) {
    const slot = (BASE + k) % N; ord[k] = slot;
    tb[slot] = k < 10 ? tA0 + k * BEAT / 2 : Math.floor((tB0 + (tB1 - tB0) * Math.pow((k - 10) / (N - 10), 0.42)) / (BEAT / 4)) * (BEAT / 4);
    th[slot] = tH0 + Math.floor((slot / N) * 0.9 / (BEAT / 8)) * (BEAT / 8);
  }
  const hash = (a, b) => { let x = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x632BE5AB, 0xC2B2AE35); x ^= x >>> 15; x = Math.imul(x, 0x27D4EB2F); x ^= x >>> 13; return (x >>> 0) / 4294967296; };
  const sweepX = (t, t0, d) => -80 + 4000 * (t - t0) / d;
  const CH = BEAT / 2;                                 // 换个活法以后：每八分音符一道金线扫过最上面六行
  const posterOn = (i, j) => {                         // 片名那一屏：板上留一块空给大字
    const sx = (i * P + 30 - VF.x) * VF.z + 960, sy = (j * P + 30 - VF.y) * VF.z + 540;
    return !(sx < 1240 && sy < 810);
  };
  FR(0, s.end + 0.5, (t) => {
    for (let slot = 0; slot < N; slot++) {
      const c = FL.cells[slot], i = slot % COLS, j = (slot / COLS) | 0;
      let st = null;
      if (t < tR) {
        if (t < tb[slot]) { c.set({ k: 0 }); continue; }
        const u = (t - tb[slot]) / 0.16;
        const k = u < 1 ? 1.14 * Math.sin(Math.min(1, u * 1.25) * Math.PI / 2) - 0.14 * Math.max(0, u * 1.25 - 0.8) : 1;
        const fill = t >= th[slot] ? C.ink : C.white;
        // 「用一下就没用了」：大多数方块从左到右一片片变成空心（没人要了），少数还是黑的
        if (t >= tUse && hash(slot, 3) < 0.88 && t >= tUse + 1.2 * (c.cx / 3840)) { c.set({ st: C.white, sw: 6, k: 1 }); continue; }
        // 撞墙之后板子发灰，直到「好在」那一句
        st = { fill, k: clamp(k, 0, 1.14), op: t > tO && t < t5a ? 0.55 : 1 };
      } else if (t < tP) {
        // 金线扫过之后整块板清空；随后只有最上面六行在生灭
        const gone = tR + 0.8 * (c.cx + 80) / 4000;
        if (t < gone + 0.14 && tb[slot] < tR) {
          const hollow = hash(slot, 3) < 0.88;                   // 没用了的：擦掉之前一直是空心
          st = t > gone - 0.05 ? { fill: C.gold, k: t < gone ? 1 : 1 - (t - gone) / 0.14 } : hollow ? { st: C.white, sw: 6, k: 1 } : { fill: C.ink, k: 1 };
        }
        else if (j < 6 && t >= tC0) {
          const m = Math.floor((t - tC0) / CH);
          for (const mm of [m - 1, m]) {
            if (mm < 0 || hash(slot, mm) > 0.55) continue;
            const born = tC0 + mm * CH + hash(mm, slot) * CH * 0.9;
            const kill = tC0 + (mm + 1) * CH + (c.cx / 3840) * CH;
            if (t >= born && t < kill + 0.07) {
              const near = kill - t < 0.035 && kill > t;
              st = { fill: t >= kill || near ? C.gold : C.white, k: t >= kill ? 1 - (t - kill) / 0.07 : Math.min(1, (t - born) / 0.08) };
            }
          }
        }
      } else {
        // 片名：板上铺满四种颜色的格子，从左上角的字向外长出来
        const d = Math.hypot(i - 10, j - 10) / 60, t1 = tP + d * 1.1;
        if (t >= t1 && posterOn(i, j)) {
          const v = hash(slot, 7);
          if (v < 0.5) st = { fill: v < 0.24 ? C.white : v < 0.37 ? C.ink : v < 0.46 ? C.gray : C.gold, k: Math.min(1, (t - t1) / 0.12) };
        }
      }
      c.set(st || { k: 0 });
    }
  });
  // 金线本身（扫过整块板的一道竖条）
  const bar = h('div', 'abs', world); css(bar, { background: C.gold, width: '40px', height: ROWS * P + 'px', top: '0px', left: '0px' });
  FR(0, s.end + 0.5, (t) => {
    let x = null, w = 40;
    if (t >= tR && t < tR + 0.8) { x = sweepX(t, tR, 0.8); w = 80; }
    if (t >= tC0 && t < tP) { const m = Math.floor((t - tC0) / CH); x = (t - tC0 - m * CH) / CH * 3840; w = 24; }
    vis(bar, x != null); if (x != null) { ss(bar, 'left', (x - w / 2).toFixed(1) + 'px'); ss(bar, 'width', w + 'px'); ss(bar, 'height', (t >= tC0 && t < tP ? 6 * P : ROWS * P) + 'px'); }
  });
  sfx('whoosh', tR, { g: 0.7 }); sfx('chime', tR + 0.75, { g: 0.6 });
  // 分配指针：第一批对象时，下一个空格下面有一道丝印白的短线
  const caret = h('div', 'abs', world); css(caret, { background: C.white, width: '50px', height: '8px' });
  FR(0, tB0 + 1, (t) => {
    const k = clamp(Math.floor((t - tA0) / (BEAT / 2)) + 1, 0, 10), slot = BASE + k;
    vis(caret, t > tA0 - 0.6 && t < tB0); ss(caret, 'left', (slot % COLS) * P + 5 + 'px'); ss(caret, 'top', ((slot / COLS) | 0) * P + 58 + 'px');
  });
  for (let k = 0; k < 10; k++) sfx('pop', tA0 + k * BEAT / 2, { g: 0.55 - k * 0.03, p: -0.1 + k * 0.03 });
  for (let k = 0; k < 9; k++) sfx('tick', tB0 + (tB1 - tB0) * (k / 9) ** 0.6, { g: 0.3 + k * 0.05 });

  // 撞墙时多出来的最后一个对象：落在板外，放不进去
  const extra = cell(tsv, 3840 + 30, 2160 + 60, 50);
  FR(tO - 1, tR + 1, (t) => extra.set(t < tO - 0.3 || t > wt0 ? { k: 0 } : t < tO ? { fill: C.white, k: Math.min(1, (t - tO + 0.3) / 0.12) } : { st: C.white, sw: 6, k: 1, y: 2160 + 60 + Math.min(240, (t - tO) * 300) }));
  sfx('error', tO);

  // ── ui：格子纸 ──
  const eLab = tx(ui, 'note', tr('内存', 'memory'), 124, 250, { size: 40, ...plate });
  const eGz = tx(ui, 'ser', tr('格子纸', 'graph paper'), 110, 300, { size: tr(200, 150), ...plate });
  // 「内存 = 格子纸」在第一拍就给出（字先到）：只有格线的前一秒多，成片的空画面检查判为空（格线细，缩小后看不见）
  wipe(eLab, 0.05, { dir: 'l', d: 0.35 });
  const tGz = 0.1;
  slam(eGz, tGz, { from: 1.18, d: 0.5 }); sfx('thud', tGz, { g: 0.8 });
  const eObj = wtag(world, tr('对象', 'object'), (BASE % COLS) * P - 6, ((BASE / COLS) | 0) * P - 64, 34);
  slide(eObj, tA0 + 0.1, { y: 26, d: 0.4 });
  for (const e of [eLab, eGz]) exit(e, tB0 - 0.1, { x: -160, d: 0.35 });
  exit(eObj, tB0 - 0.1, { y: -30, d: 0.3 });

  // ── ui：六千七百万 ──
  const eHow = tx(ui, 'ser', tr('一秒钟，六千七百万个', '67 million a second'), 120, 600, { size: 76, ...plate });
  const eCnt = tx(ui, 'big', '0', 112, 700, { size: 190, ...plate });
  const eSrc = tx(ui, 'src', tr('实测：.NET 10.0.12 · 1001 ms', 'measured: .NET 10.0.12 · 1001 ms'), 124, 920, plate);
  wipe(eHow, qb(T('o2', { zh: '一秒钟', en: 'one second' })), { dir: 'l', d: 0.4 });
  appear(eCnt, tB0); stepCount(eCnt, tB0, qb(T('o2', { zh: '万', en: 'million' }) + 0.2), 0, 67000000);
  appear(eSrc, tB0 + 0.3);
  sfx('thud', qb(T('o2', { zh: '万', en: 'million' }) + 0.2), { g: 0.7 });
  for (const e of [eHow, eCnt, eSrc]) exit(e, qb(T('o3') - 0.15), { y: 60, d: 0.35 });

  // ── 64 MB：板的边框与上限 ──
  const frame = h('div', 'abs', world); px(frame, -24, -24, COLS * P + 48, ROWS * P + 48); css(frame, { border: `12px solid ${C.white}` });
  slam(frame, qb(T('o3', { zh: '六十四兆', en: '64 MB' })), { from: 1.05, d: 0.4 }); sfx('thud', qb(T('o3', { zh: '六十四兆', en: '64 MB' })), { g: 0.9 });
  const e64 = tx(ui, 'big', '64 MB', 1540, 130, { size: 96 });
  const eLim = tx(ui, 'mono', 'DOTNET_GC<br>HeapHardLimit<br>=0x4000000', 1546, 250, { size: 24, color: C.pale, lh: 1.35 });
  slide(e64, qb(T('o3', { zh: '六十四兆', en: '64 MB' })) + 0.1, { x: 60, d: 0.45 }); appear(eLim, qb(T('o3', { zh: '六十四兆', en: '64 MB' })) + 0.4);
  // 「只占不还」：画面主体上一个大字（策划者：别靠角落的小字，观众看的是画面）
  const eHoard = tx(ui, 'ser', tr('只占<br>不还', 'Never<br>give back'), 1540, 420, { size: tr(110, 64), lh: 1.08, color: C.gold });
  slam(eHoard, tH0 - 0.05, { from: 1.25, d: 0.42 }); sfx('thud', tH0, { g: 0.7 });
  for (const e of [e64, eLim, eHoard]) exit(e, tO - 0.2, { x: 80, d: 0.3 });

  // ── 撞墙：1,048,577 ──
  const eNo = tx(ui, 'big', '1,048,577', 1100, 170, { size: 150 });
  const eNoL = tx(ui, 'sub', tr('放不下了：内存耗尽', 'No room: out of memory'), 1108, 330, { size: 48, color: C.white });
  const eOOM = slab(ui, 1100, 410, ['<span class="k">System.OutOfMemoryException</span>', '(after 1,048,577 objects, 679 ms; gen2 GCs 5)'], { size: 26 });
  slam(eNo, tO, { from: 1.2, d: 0.45 }); appear(eNoL, tO + 0.15);
  wipe(eOOM.el, tO + 0.2, { dir: 'l', d: 0.3 }); sfx('thud', tO + 0.02, { g: 0.7 });
  for (const e of [eNo, eNoL]) exit(e, qb(T('o4', { zh: 'PHP', en: 'PHP' })) - 0.1, { y: -40, d: 0.3 });   // 留到下一块报错石板出现前

  // ── 报错墙：四个运行时撞上同一堵墙 ──
  const wall = [
    ['.NET 10.0.12', ['<span class="k">hoard: System.<span class="mm">OutOfMemory</span>Exception</span>', '(after 1,048,577 objects, 679 ms; gen2 GCs 5)']],
    ['PHP 8.5.10', ['<span class="k">PHP Fatal error:  Allowed <span class="mm">memory</span> size of 67108864 bytes exhausted</span>', '(tried to allocate 4096 bytes)']],
    ['OpenJDK 27', ['<span class="k">Exception in thread "main" java.lang.<span class="mm">OutOfMemory</span>Error: Java heap space</span>']],
    ['Node 24.21.0', ['<span class="k">FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap <span class="mm">out of memory</span></span>']],
  ];
  const wt = [qb(T('o4', { zh: '换成', en: 'Try' }) + 0.05), qb(T('o4', { zh: 'PHP', en: 'PHP' })), qb(T('o4', { zh: 'Java', en: 'Java' })), qb(T('o4b', { zh: '报错', en: 'errors' }))];
  const wy = [130, 330, 530, 680];
  const wallEls = [];
  wall.forEach(([who, lines], k) => {
    const lab = tx(ui, 'mono', who, 140, wy[k], { size: 26, color: C.gold });
    const sl = slab(ui, 120, wy[k] + 40, lines, { size: 27, pad: '16px 26px 18px' });
    if (k === 0) { appear(lab, wt[0]); }
    else { slide(lab, wt[k], { x: -60, d: 0.3 }); wipe(sl.el, wt[k], { dir: k % 2 ? 'l' : 'r', d: 0.32 }); sfx('error', wt[k], { g: 0.45, p: k % 2 ? -0.3 : 0.3 }); }
    if (k === 0) appear(sl.el, wt[0]);
    wallEls.push(lab, sl.el);
  });
  vanish(eOOM.el, wt[0]);
  const tFam = qb(T('o4b', { zh: '眼熟', en: 'familiar' }) - 0.6);
  wallEls.filter((e, k) => k % 2).forEach((e, k) => {
    const t = tFam + k * BEAT / 2, b = box(e), mark = h('div', 'abs', ui); px(mark, 96, b.y, 12, b.h); mark.style.background = C.white;
    classAt(e.querySelector('.mm'), 'hw', t); wipe(mark, t, { dir: 't', d: 0.2 }); exit(mark, t5a - 0.15, { y: 120, d: 0.32 }); sfx('tick', t, { g: 0.45 });
  });
  wallEls.forEach((e, k) => exit(e, t5a - 0.15 + (k >> 1) * 0.06, { y: 120, d: 0.32 }));
  to(world, wt[0], { opacity: 0.22, duration: 0.4, ease: 'power2.out' });
  to(world, t5a, { opacity: 1, duration: 0.5, ease: 'power2.inOut' });

  // ── 好在大多数用一下就没用了 → 擦掉重用：只有最上面六行在用 ──
  const eUse = tx(ui, 'ser', tr('用一下<br>就没用了', 'Needed<br>only briefly'), 1540, 420, { size: tr(76, 60), lh: 1.1, color: C.white });
  const tUseL = qb(T('o5a', { zh: '大多数', en: 'most' }) - 0.1);           // 字在句子开头就上，空心的波在「没用了」时才走
  slam(eUse, tUseL, { from: 1.2, d: 0.4 }); sfx('pop', tUseL, { g: 0.55 }); sfx('whoosh', tUse + 0.1, { g: 0.35 });
  exit(eUse, tR - 0.15, { x: 80, d: 0.3 });
  const eErase = tx(ui, 'ser', tr('擦掉<br>重用', 'Erase<br>&amp; reuse'), 1540, 420, { size: tr(110, 80), lh: 1.08, color: C.gold });
  slam(eErase, tR + 0.05, { from: 1.25, d: 0.42 }); sfx('thud', tR + 0.05, { g: 0.6 });
  const bracket = h('div', 'abs', ui); px(bracket, 1518, 120, 12, 131); css(bracket, { background: C.white });
  const e11 = tx(ui, 'big', '11 MB', 1550, 128, { size: 88 });
  const e64b = tx(ui, 'big', '64 MB', 1550, 840, { size: 52, color: C.pale });
  const t11 = qb(T('o5', { zh: '十一兆', en: '11 MB' }) - 0.1);
  wipe(bracket, t11 - 0.2, { dir: 't', d: 0.4 }); appear(e64b, t11);
  slam(e11, t11, { from: 1.3, d: 0.42 }); sfx('thud', t11, { g: 0.8 });
  const t6 = qb(T('o6', { zh: '一秒', en: 'second' }) - 0.3);
  for (const e of [bracket, e11, e64b, eErase]) exit(e, t6, { x: 80, d: 0.3 });

  // ── 一秒 136 次 ──
  const TIMES = tr(' 次', ' times');
  const e136 = tx(ui, 'big', '136<span class="ser" style="font-size:96px;letter-spacing:0">' + TIMES + '</span>', 112, 120, { size: 190, ...plate });
  const trk = h('div', 'abs', ui); px(trk, 900, 214, 880, 4); css(trk, { background: C.white });
  const tk0 = tx(ui, 'mono', '0 ms', 900, 150, { size: 24, color: C.pale }), tk1 = tx(ui, 'mono', '1001 ms', 1680, 150, { size: 24, color: C.pale });
  const tsv2 = board(ui, 880, 180, 920, 80);
  const ticks = [];
  for (let k = 0; k < 136; k++) ticks.push(svg('rect', { x: 900 + 880 * (k + 0.5) / 136 - 1.5, y: 190, width: 3, height: 52, fill: C.gold, visibility: 'hidden' }, tsv2));
  const t136a = qb(T('o6', { zh: '擦了', en: 'erased' }) - 0.4), t136b = qb(T('o6', { zh: '一百三十六次', en: '136 times' }) + 0.35);
  FR(t136a - 1, s.end, (t) => { const n = t < t136a ? 0 : Math.min(136, Math.floor(136 * clamp((Math.floor((t - t136a) / (BEAT / 4)) * (BEAT / 4)) / (t136b - t136a)))); ticks.forEach((r, k) => sa(r, 'visibility', k < n ? 'visible' : 'hidden')); });
  wipe(e136, t6 + 0.3, { dir: 'b', d: 0.4 }); stepCount(e136, t136a, t136b, 0, 136, (v) => Math.round(v) + '<span class="ser" style="font-size:96px;letter-spacing:0">' + TIMES + '</span>');
  for (const e of [trk, tk0, tk1]) wipe(e, t6 + 0.4, { dir: 'l', d: 0.5 });
  appear(tsv2, t6 + 0.4);
  for (let k = 0; k < 8; k++) sfx('tick', t136a + (t136b - t136a) * k / 8, { g: 0.35, p: -0.5 + k * 0.12 });
  sfx('thud', t136b, { g: 0.8 });
  const eLoop = slab(ui, 120, 760, ['while (sw.ElapsedMilliseconds &lt; 1000)', '    for (int i = 0; i &lt; 10000; i++) <span class="k">Lab.Last = new Node(n++);</span>'], { size: 28 });
  wipe(eLoop.el, qb(T('o6b', { zh: '代码', en: 'write' }) - 0.2), { dir: 't', d: 0.35 }); sfx('blip', qb(T('o6b', { zh: '代码', en: 'write' }) - 0.2), { g: 0.5 });
  const t7 = qb(T('o7', { zh: '这位', en: 'This' }) - 0.25);
  for (const e of [e136, trk, tk0, tk1, tsv2]) exit(e, t7, { y: -60, d: 0.3 });
  exit(eLoop.el, qb(T('o7', { zh: '垃圾回收', en: 'garbage collection' })) - 0.3, { y: 80, d: 0.3 });

  // ── 垃圾回收：把没人要的找出来，腾回去 ──
  const eGC = tx(ui, 'ser', tr('垃圾回收', 'Garbage<br>collection'), 110, 330, { size: tr(220, 150), lh: 1.08, ...plate });
  const eGCe = tx(ui, 'lat', tr('garbage collection', ''), 124, 600, { size: 44, color: C.pale, ...plate });
  slam(eGC, qb(T('o7', { zh: '垃圾回收', en: 'garbage collection' })), { from: 1.22, d: 0.5 }); sfx('thud', qb(T('o7', { zh: '垃圾回收', en: 'garbage collection' })), { g: 1 });
  wipe(eGCe, qb(T('o7', { zh: '垃圾回收', en: 'garbage collection' })) + 0.3, { dir: 'l', d: 0.4 });
  // 一小片对象：一半没人要（空心），金框找出来，再收走，格子空出来
  const CX = 2490, CY = 1050;
  const csv = board(world, CX - 300, CY - 200, 660, 400);
  const clu = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) clu.push({ c: cell(csv, CX - 240 + i * 60, CY - 60 + j * 60, 50), dead: hash(i + 31, j + 7) < 0.45 });
  const tFind = qb(T('o7b', { zh: '找出来', en: 'find' }) - 0.1), tBack = qb(T('o7b', { zh: '腾回去', en: 'hand it back' }) - 0.05), tCl0 = qb(T('o7b', { zh: '把', en: 'find' }) - 0.6);
  FR(tCl0 - 0.5, s.end, (t) => clu.forEach((o, k) => {
    if (t < tCl0 + k * 0.02 || t > t8 + 0.35) return o.c.set({ k: 0 });
    if (!o.dead) return o.c.set({ fill: C.white, k: 1 });
    if (t < tFind) return o.c.set({ st: C.white, sw: 4, k: 1 });
    if (t < tBack) return o.c.set({ st: C.gold, sw: 8, k: 1.12 });
    const u = (t - tBack - (k % 9) * 0.03) / 0.2; o.c.set(u < 0 ? { fill: C.gold, k: 1 } : { fill: C.gold, k: 1 - u });
  }));
  sfx('pop', tFind, { g: 0.6, p: 0.4 }); sfx('whoosh', tBack, { g: 0.45, p: 0.4 });
  const tag1 = tag(world, tr('没人要', 'unwanted'), CX - 250, CY - 150, 36), tag2 = tag(world, tr('腾回去', 'returned'), CX + 100, CY - 150, 36);
  slide(tag1, tFind, { y: 24, d: 0.35 }); slide(tag2, tBack, { y: 24, d: 0.35 });
  const t8 = qb(T('o8', { zh: '难', en: 'hard' }) - 0.2);
  for (const e of [eGC, eGCe]) exit(e, t8, { x: -120, d: 0.32 });
  for (const e of [tag1, tag2]) exit(e, t8 + 0.3, { y: -40, d: 0.3 });

  // ── 只管要，从不交代 ──
  const eAsk = tx(ui, 'sub', tr('只管要', 'only asking'), 140, 286, { ...plate });
  const asks = [];
  for (let k = 0; k < 6; k++) asks.push(tx(ui, 'mono', 'new Node(n++)', 140, 376 + k * 74, { size: 40, bg: C.ink, pad: '6px 18px 8px' }));
  wipe(eAsk, t8 + 0.15, { dir: 'l', d: 0.3 });
  asks.forEach((e, k) => { const tt = qb(T('o8', { zh: '要内存', en: 'ask for memory' }) - 0.4) + k * BEAT / 2; slide(e, tt, { x: -40, d: 0.22 }); sfx('pop', tt, { g: 0.4 - k * 0.03, p: -0.5 }); });
  const dnp = h('div', 'abs', ui); px(dnp, 740, 400, 700, 300); css(dnp, { border: `4px dashed ${C.pale}` });
  const dnpT = tx(ui, 'ser', tr('“我不要了”', '"Done with this."'), 770, tr(480, 506), { size: tr(104, 64), color: C.pale });
  const dnpL = tx(ui, 'mono', tr('从不交代', 'never said'), 744, 352, { size: 28, color: C.pale });
  const tNo = qb(Math.min(T('o8b', { zh: '我不要了', en: 'done with' }) - 0.2, Tend('o8') - 0.5));
  wipe(dnp, tNo - 0.3, { dir: 'l', d: 0.4 }); appear(dnpL, tNo - 0.1);
  wipe(dnpT, tNo, { dir: 'l', d: 0.5 }); sfx('thud', tNo, { g: 0.5 });
  const t9 = qb(T('o9', { zh: '它', en: 'how' }) - 0.25);
  for (const e of [eAsk, ...asks, dnp, dnpT, dnpL]) exit(e, t9, { y: -60, d: 0.3 });

  // ── 两个问题 ──
  const q1n = tx(ui, 'mono', '?1', 124, 250, { size: 30, color: C.pale }), q2n = tx(ui, 'mono', '?2', 124, 500, { size: 30, color: C.pale });
  const q1 = tx(ui, 'ser', tr('它怎么猜出谁没用了？', "How does it guess what's no longer needed?"), 118, 296, { size: tr(104, 70), ...plate });
  const q2 = tx(ui, 'ser', tr('又怎么在程序狂奔时打扫，<br>还不让人察觉？', 'And how does it clean up while the program sprints,<br>without anyone noticing?'), 118, 546, { size: tr(84, 62), ...plate });
  slam(q1, qb(T('o9', { zh: '猜出', en: 'guess' })), { from: 1.12, d: 0.45 }); appear(q1n, qb(T('o9', { zh: '猜出', en: 'guess' })));
  wipe(q2, qb(T('o9b', { zh: '又', en: 'And' })), { dir: 'l', d: 0.6 }); appear(q2n, qb(T('o9b', { zh: '又', en: 'And' })));
  sfx('thud', qb(T('o9', { zh: '猜出', en: 'guess' })), { g: 0.7 }); sfx('pop', qb(T('o9b', { zh: '察觉', en: 'noticing' })), { g: 0.5 });
  const t10 = qb(T('o10', { zh: '从', en: 'From' }) - 0.25);
  for (const e of [q1, q2, q1n, q2n]) exit(e, t10, { x: -140, d: 0.32 });

  // ── 路线：记账、追踪、分代、并发 ──
  const route = [['01', '记账', 'bookkeeping'], ['02', '追踪', 'tracing'], ['03', '分代', 'generations'], ['04', '并发', 'concurrency']];
  const rEls = [];
  route.forEach(([no, w, we], k) => {
    const x = 130 + k * 340, tt = qb(T('o10', { zh: w, en: we }));
    const sk = silk(ui, x, 380, 300, 200, no, { lcol: C.pale });
    const wd = tx(ui, 'ser', tr(w, we), x + tr(30, 18), tr(404, 456), { size: tr(120, 38) });
    wipe(sk.box, tt - 0.1, { dir: 'l', d: 0.25 }); appear(sk.lab, tt - 0.1); slam(wd, tt, { from: 1.25, d: 0.4 });
    sfx('thud', tt, { g: 0.55 + k * 0.08, p: -0.45 + k * 0.3 });
    rEls.push(sk.box, sk.lab, wd);
  });
  const eTrade = tx(ui, 'sub', tr('不是蛮力：妥协与权衡', 'not brute force: compromise and trade-offs'), 140, 660, { size: 60, ...plate });
  wipe(eTrade, qb(T('o10b', { zh: '这不是', en: "this isn't" }) - 0.1), { dir: 'l', d: 0.5 });
  rEls.forEach((e, k) => exit(e, tP - 0.35 + (k / 3 | 0) * 0.04, { y: -80, d: 0.3 }));
  exit(eTrade, tP, { y: 60, d: 0.3 });   // 片名下的英文行 tP + 0.3 才出现，同一高度

  // ── 片名 ──
  const eT1 = tx(ui, 'ser', tr('垃圾回收<br>的艺术', 'The Art of<br>Garbage Collection'), 110, tr(170, 260), { size: tr(200, 104), lh: tr(1.18, 1.1) });
  const eT2 = tx(ui, 'lat', tr('The art of garbage collection', ''), 120, 660, { size: 44, color: C.pale });
  const eT3 = tx(ui, 'note', tr('妥协与权衡', 'compromise and trade-offs'), 124, tr(730, 600), { size: 36 });
  slam(eT1, tP, { from: 1.15, d: 0.6 }); wipe(eT2, tP + 0.3, { dir: 'l', d: 0.45 }); appear(eT3, tP + 0.5);
  sfx('thud', tP, { g: 1 }); sfx('chime', tP + 0.1, { g: 0.7 });

  // ── 镜头 ──
  const tV = qb(T('o10', { zh: '从', en: 'From' }) - 0.3);
  cam.track(0, START, [
    [0.9, { z: 1.0 }, 2.4, { ease: 'power2.inOut', sfx: false }],
    [3.4, { z: 1.04 }, tB0 - 3.55, { ease: 'none', sfx: false }],
    [tB0, VF, 3.0, { ease: 'power2.inOut', sfx: false }],
    [null, { z: 0.375 }, tO - 0.45 - (tB0 + 3.15), { ease: 'none', sfx: false }],
    [tO - 0.45, VO, 0.8, { ease: 'power3.inOut', sfx: false }],
    [null, { x: VO.x + 260, z: 0.27 }, t5a - (tO + 0.5) - 0.05, { ease: 'none', sfx: false }],
    [t5a, VF, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.375 }, t6 - (t5a + 1.05) - 0.05, { ease: 'none', sfx: false }],
    [t6, { x: 1500, y: 200, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.4 }],
    [null, { x: 1560, z: 1.03 }, tCl0 - (t6 + 1.15) - 0.05, { ease: 'none', sfx: false }],
    [tCl0, { x: CX - 354, y: CY - 20, z: 1.35 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [null, { x: CX - 330, z: 1.38 }, t8 - (tCl0 + 1.15) - 0.05, { ease: 'none', sfx: false }],
    [t8, VF, 0.9, { ease: 'power3.inOut', sfx: false }],
    [null, { x: 2500 }, tV - (t8 + 1.05) - 0.05, { ease: 'none', sfx: false }],
    [tV, VF, 1.0, { ease: 'power3.inOut', sfx: false }],
    [null, { z: 0.38 }, s.end - (tV + 1.15), { ease: 'none', sfx: false }],
  ]);
});
