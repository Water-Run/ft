// 本片的部件：小工具、斜线块、Lean 源码与回显、方点阵（逐个的、成片的、极大的三种画法）、镜头的缓慢漂移。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const backOut = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const TS = '<i class="ts"></i>';                                   // 「⊢」
const expo = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));     // 指数插值：缩放与计数按倍数走

// ── 斜线块：还没有验证的。用 SVG 线条画，不用渐变 ──
function hatch(parent, x, y, w, hh, color, gap = 18, sw = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  let d = '';
  for (let k = -hh; k < w; k += gap) d += `M${k},${hh}L${k + hh},0`;
  svg('path', { d, stroke: color, 'stroke-width': sw, fill: 'none' }, s);
  s.dataset.name = 'hatch';
  return s;
}

// ── 打勾的色块：朱红底，墨色的勾。勾是画出来的，不是字 ──
function tickBlock(parent, x, y, size) {
  const e = blk(parent, 'bg-ac', x, y, size, size), g = svg('svg', { width: size, height: size, viewBox: '0 0 60 60' }, e);
  svg('path', { d: 'M14,31 L26,43 L46,19', fill: 'none', stroke: C.ink, 'stroke-width': 8 }, g);
  e.dataset.name = 'tick';
  return e;
}

// ── Lean 源码：一行一个块。关键字加粗，其余原样（已转义）──
const KW = /\b(theorem|def|by|induction|with|rw|grind|rfl|sorry|fun)\b/g;
const leanHtml = (line) => esc(line).replace(KW, '<b>$1</b>');
// o: { x, y, size, lh（行距，像素）, cls }。返回各行元素；空行也占一行
function codeLines(parent, lines, o) {
  return lines.map((ln, i) => { const e = h('div', 'ln ' + (o.cls || ''), parent, leanHtml(ln)); px(e, o.x, o.y + i * o.lh); e.style.fontSize = o.size + 'px'; return e; });
}
// 编译器的回显：整行出现。行首的「文件:行:列: 」去掉后单独变淡显示在行尾之外，这里只留信息本身
const stripLoc = (line) => line.replace(/^SumOdd\/\w+\.lean:\d+:\d+: /, '');
function outLines(parent, lines, o) {
  return lines.map((ln, i) => { const e = h('div', 'out ' + (o.cls || ''), parent, esc(ln).replace(/^⊢ /, TS + ' ')); px(e, o.x, o.y + i * o.lh); e.style.fontSize = o.size + 'px'; return e; });
}

// ── 方点阵之一：逐个画。n×n 个方点按「圈」分组，第 r 圈是 2r + 1 个（r 从 0 起）：右边一列自上而下，再下边一行自右而左 ──
// o: { x, y, pitch, cell }。返回 { el, rings: [<g>…], size }
const ringCells = (r) => { const out = []; for (let i = 0; i <= r; i++) out.push([r, i]); for (let c = r - 1; c >= 0; c--) out.push([c, r]); return out; };
function dotSquare(parent, n, o) {
  const size = n * o.pitch, el = svg('svg', { class: 'abs', width: size, height: size, viewBox: `0 0 ${size} ${size}` }, parent); px(el, o.x, o.y);
  el.dataset.name = 'dots';
  const rings = [];
  for (let r = 0; r < n; r++) {
    const g = svg('g', { class: 'ring' }, el);
    for (const [c, row] of ringCells(r)) svg('rect', { x: c * o.pitch, y: row * o.pitch, width: o.cell, height: o.cell }, g);
    rings.push(g);
  }
  return { el, rings, size };
}

// ── 方点阵之二：成片画。count 个方点按「圈」的顺序排成近似的正方形，各点的颜色由 kindOf(i) 给出；同色的点合成一条路径 ──
// o: { x, y, pitch, cell, colors: { 种类: 颜色 }, kindOf(i) → 种类 }。返回 { el, side（边上的点数）, pos(i) → [x, y]（相对 el）, paths }
function dotField(parent, count, o) {
  const side = Math.ceil(Math.sqrt(count)), size = side * o.pitch;
  const el = svg('svg', { class: 'abs', width: size, height: size, viewBox: `0 0 ${size} ${size}` }, parent); px(el, o.x, o.y);
  el.dataset.name = o.name || 'field';
  const pos = (i) => { const r = Math.floor(Math.sqrt(i)), k = i - r * r, [c, row] = k <= r ? [r, k] : [2 * r - k, r]; return [c * o.pitch, row * o.pitch]; };
  const d = {};
  for (let i = 0; i < count; i++) { const k = o.kindOf ? o.kindOf(i) : 'a', [x, y] = pos(i); d[k] = (d[k] || '') + `M${x},${y}h${o.cell}v${o.cell}h${-o.cell}z`; }
  const paths = {};
  for (const k in d) paths[k] = svg('path', { d: d[k], fill: (o.colors || {})[k] || C.paper }, el);
  return { el, side, size, pos, paths };
}

// ── 方点阵之三：极大的。用 SVG 的图案填充画 n×n 个方点，放大缩小都清晰；n 可以到几百、几千 ──
// o: { x, y, pitch, cell, color, id }。返回 { el, rect, pat, set(n) }
let PAT_SEQ = 0;
function patternField(parent, n, o) {
  const size = n * o.pitch, id = 'pf' + (++PAT_SEQ);
  const el = svg('svg', { class: 'abs', width: size, height: size, viewBox: `0 0 ${size} ${size}` }, parent); px(el, o.x, o.y);
  el.dataset.name = o.name || 'field';
  const defs = svg('defs', {}, el), pat = svg('pattern', { id, patternUnits: 'userSpaceOnUse', width: o.pitch, height: o.pitch }, defs);
  svg('rect', { x: 0, y: 0, width: o.cell, height: o.cell, fill: o.color || C.paper }, pat);
  const rect = svg('rect', { x: 0, y: 0, width: size, height: size, fill: `url(#${id})` }, el);
  return { el, rect, pat, size };
}

// ── 方点阵之四：会「放大视野」的方点阵。视野里是 V×V 个方点，屏幕上的边长是 S，V 可以从 4 一直涨到 10 的十几次方 ──
// 方点小到看不清之后改画格线：每 10 个、每 100 个……一道缝，同时最多看得见三级，视野放大时一级一级地冲向左上角。
// 每逢 10 的整数次幂有一道 L 形的刻度线（那么大的正方形的右边与下边），可带数字标注。
// o: { x, y, max（S 的最大值）, color（方点）, gap（缝）, line（格线的颜色，缺省同缝）, lineW（格线最粗几像素）, fine（格线小于几像素就不画）,
//      back（true 时在方点底下垫一块缝色：盖住它后面的东西）, dec: { max（最大的幂）, color(k), label(k) → 文字或 null, labelColor } }
// 返回 { el, under（压在方点下面的组）, draw(V, S, side, decOn, zoom) }：side 是填实的那一块的边长（缺省等于 S）；
// zoom 是镜头的放大倍数（方点阵放在 world 里、由镜头缩放时传入）：细节的取舍按屏幕上的大小算，线宽按 world 里的尺寸画
function lattice(parent, o) {
  const M = o.max, id = 'lt' + (++PAT_SEQ), FRc = 124 / 140, col = o.color || C.paper, gapc = o.gap || C.ink, linec = o.line || gapc, LW = o.lineW || 6, FINE = o.fine || 5, D = o.dec || { max: 0 };
  const el = svg('svg', { class: 'abs', width: M + 40, height: M + 70, viewBox: `-10 -50 ${M + 40} ${M + 70}` }, parent); px(el, o.x - 10, o.y - 50);
  el.dataset.name = o.name || 'lattice';
  const defs = svg('defs', {}, el), pat = svg('pattern', { id, patternUnits: 'userSpaceOnUse', width: 140, height: 140 }, defs), cell = svg('rect', { x: 0, y: 0, width: 124, height: 124, fill: col }, pat);
  const back = o.back ? svg('rect', { x: 0, y: 0, width: 10, height: 10, fill: gapc }, el) : null;
  const under = svg('g', {}, el);
  const field = svg('rect', { x: 0, y: 0, width: 10, height: 10, fill: `url(#${id})` }, el), solid = svg('rect', { x: 0, y: 0, width: 10, height: 10, fill: col }, el);
  const GRID = [0, 1, 2].map((i) => {
    const gp = svg('pattern', { id: id + 'g' + i, patternUnits: 'userSpaceOnUse', width: 10, height: 10 }, defs);
    const a = svg('rect', { y: 0, fill: linec }, gp), b = svg('rect', { x: 0, fill: linec }, gp);
    return { gp, a, b, r: svg('rect', { x: 0, y: 0, fill: `url(#${id}g${i})` }, el) };
  });
  const DEC = [];
  for (let k = 1; k <= D.max; k++) {
    const g = svg('g', {}, el), line = svg('path', { fill: 'none', stroke: D.color(k), 'stroke-width': 6 }, g), text = D.label ? D.label(k) : null;
    const lab = text ? svg('text', { y: -14, 'text-anchor': 'end', fill: D.labelColor || C.ac, 'font-family': 'Mono', 'font-weight': 700, 'font-size': 30 }, g) : null;
    if (lab) lab.textContent = text;
    DEC.push({ g, line, lab, n: Math.pow(10, k) });
  }
  const set = (e, o2) => { for (const k in o2) e.setAttribute(k, o2[k]); };
  function draw(V, S, side = S, decOn = true, zoom = 1) {
    const p = S / V, ps = p * zoom, a = clamp((7 - ps) / 3), show = side > 0.5;
    if (back) set(back, { width: side.toFixed(2), height: side.toFixed(2) });
    set(pat, { width: p.toFixed(4), height: p.toFixed(4) }); set(cell, { width: (p * FRc).toFixed(4), height: (p * FRc).toFixed(4) });
    set(field, { width: side.toFixed(2), height: side.toFixed(2) }); field.style.display = a < 1 && show ? '' : 'none';
    set(solid, { width: side.toFixed(2), height: side.toFixed(2), opacity: a.toFixed(3) }); solid.style.display = a > 0 && show ? '' : 'none';
    const k0 = Math.max(1, Math.ceil(Math.log10(FINE / ps) - 1e-9));       // 最细的一级：每格在屏幕上不小于 FINE 像素
    GRID.forEach((G, i) => {
      const q = Math.pow(10, k0 + i) * p, qs = q * zoom, on = a > 0 && q < S * 1.2 && side > 4;
      G.r.style.display = on ? '' : 'none';
      if (!on) return;
      const w = clamp(qs * 0.035, 1.2, LW) / zoom;
      set(G.gp, { width: q.toFixed(4), height: q.toFixed(4) });
      set(G.a, { x: (q - w).toFixed(4), width: w.toFixed(3), height: q.toFixed(4) }); set(G.b, { y: (q - w).toFixed(4), height: w.toFixed(3), width: q.toFixed(4) });
      set(G.r, { width: side.toFixed(2), height: side.toFixed(2), opacity: (a * clamp((qs - FINE) / (FINE * 2.8))).toFixed(3) });
    });
    for (const d of DEC) {
      const q = d.n * p, on = decOn && q > 3 && q < S + 2;
      d.g.style.display = on ? '' : 'none';
      if (!on) continue;
      d.line.setAttribute('d', `M${q.toFixed(2)},-8V${q.toFixed(2)}H-8`);
      if (d.lab) set(d.lab, { x: (q + 3).toFixed(2), opacity: clamp((q - 150) / 80).toFixed(3) });
    }
  }
  return { el, under, draw };
}

// ── 镜头：站内的缓慢漂移。每秒二十几个像素的屏幕位移，低清预演里才看得出在动 ──
// 返回一段轨迹关键帧：从 t0 到 t1 匀速漂到 to
const drift = (t0, t1, to) => [t0, to, Math.max(0.2, t1 - t0), { ease: 'none', sfx: false }];
