// 本片的部件：格子（对象）、指针、石板（运行时真实输出）、纸（论文）、计数、丝印框。
// 一切状态由 t 算出：密集的格子与指针用帧函数 F 直接按 t 画，属性只在变化时才写；成块的文字用引擎的补间。

// 在 [a, b] 里逐帧计算；区间之外按端点的时刻算一次（直接跳到区间之外的任何时刻，画面都与顺着播过去相同）
function FR(a, b, fn) { let last = null; F((t) => { const tc = clamp(t, a, b); if (tc === last) return; last = tc; fn(tc); }); }
// 写 SVG 属性：值没变就不写
function sa(el, k, v) { const c = el._c || (el._c = {}); if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); } }
function ss(el, k, v) { const c = el._s || (el._s = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } }
// 分段关键帧：keys = [[t0, v0], [t1, v1], …]，段内按 ez 缓动；t 在两端之外取端点值
function kf(t, keys, ez = ease.io3) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) { const k = t1 > t0 ? ez((t - t0) / (t1 - t0)) : 1; return v0 + (v1 - v0) * k; }
  }
  return keys[keys.length - 1][1];
}
const prog = (t, t0, d, ez = ease.out3) => ez(clamp((t - t0) / d));

// ── 文字 ──
// tx(父, 类名, html, x, y, { size, w, color, bg, lh })：绝对定位的一块字
function tx(parent, cls, html, x, y, o = {}) {
  const e = h('div', 'abs ' + cls, parent, html); px(e, x, y);
  if (o.size) e.style.fontSize = o.size + 'px';
  if (o.w) { e.style.width = o.w + 'px'; e.style.whiteSpace = 'normal'; }
  if (o.color) e.style.color = o.color;
  if (o.bg) { e.style.background = o.bg; e.style.padding = o.pad || '4px 14px 8px'; }
  if (o.lh) e.style.lineHeight = o.lh;
  return e;
}
// 金底标签（收集器一方）与丝印白底标签（程序一方）
const tag = (parent, html, x, y, size = 30) => { const e = h('div', 'tag', parent, html); px(e, x, y); e.style.fontSize = size + 'px'; return e; };
const wtag = (parent, html, x, y, size = 30) => { const e = h('div', 'wtag', parent, html); px(e, x, y); e.style.fontSize = size + 'px'; return e; };

// 石板：运行时的真实输出，一行一个 div（终端的行为：整行出现）
function slab(parent, x, y, lines, o = {}) {
  const el = h('div', 'slab', parent); px(el, x, y);
  el.style.fontSize = (o.size || 30) + 'px';
  if (o.w) el.style.width = o.w + 'px';
  if (o.pad) el.style.padding = o.pad;
  const ln = lines.map((s) => h('div', 'ln', el, s));
  return { el, ln };
}
// 纸：论文的版面
function paper(parent, x, y, w, html, o = {}) {
  const el = h('div', 'paper', parent, html); px(el, x, y, w);
  if (o.size) el.style.fontSize = o.size + 'px';
  return el;
}
// 丝印框：电路板上元件的轮廓线与位号。用来圈出「一组东西」并给它名字
function silk(parent, x, y, w, hh, label, o = {}) {
  const box_ = h('div', 'abs', parent); px(box_, x, y, w, hh);
  css(box_, { border: `${o.bw || 3}px solid ${o.col || C.white}` });
  let lab = null;
  if (label) { lab = h('div', 'abs mono', parent, label); px(lab, x, y - (o.lsz || 26) - 14); css(lab, { fontSize: (o.lsz || 26) + 'px', color: o.lcol || C.white, fontWeight: 700 }); }
  return { box: box_, lab };
}

// 按十六分音符一格一格跳的计数：读数的节奏与配乐对齐
function stepCount(el, t0, t1, a, b, fmt = (v) => Math.round(v).toLocaleString('en-US'), o = {}) {
  const st = o.step || BEAT / 4, ez = o.ease || ((k) => k * k * (3 - 2 * k));
  let last = null;
  F((t) => {
    const tq = t0 + Math.floor((t - t0) / st + 1e-6) * st;
    const v = fmt(t < t0 ? a : t >= t1 ? b : lerp(a, b, ez(clamp((tq - t0) / (t1 - t0)))));
    if (v !== last) { el.innerHTML = v; last = v; }
  });
}

// ── SVG 画布：viewBox 与 world 的坐标一致 ──
let BD_SEQ = 0;
function board(parent, x, y, w, hh) {
  const s = svg('svg', { width: w, height: hh, viewBox: `${x} ${y} ${w} ${hh}` }, parent);
  css(s, { position: 'absolute', left: x + 'px', top: y + 'px', overflow: 'visible' });
  s._seq = 'b' + (++BD_SEQ);
  return s;
}
// 一块格子（对象）。set({ fill, k, op, st, sw }) 由帧函数调用：k 是边长的比例，st 是描边色（有描边时不填充）
function cell(sv, cx, cy, size, o = {}) {
  const r = svg('rect', { x: cx - size / 2, y: cy - size / 2, width: size, height: size, fill: o.fill || C.white, visibility: 'hidden' }, sv);
  const api = {
    r, cx, cy, size,
    set(s) {
      const k = s.k == null ? 1 : s.k, op = s.op == null ? 1 : s.op;
      if (k <= 0.002 || op <= 0.002) { sa(r, 'visibility', 'hidden'); return; }
      sa(r, 'visibility', 'visible');
      const w = size * k, x = s.x != null ? s.x : api.cx, y = s.y != null ? s.y : api.cy;
      sa(r, 'x', (x - w / 2).toFixed(1)); sa(r, 'y', (y - w / 2).toFixed(1)); sa(r, 'width', w.toFixed(1)); sa(r, 'height', w.toFixed(1));
      if (s.st) { sa(r, 'fill', 'none'); sa(r, 'stroke', s.st); sa(r, 'stroke-width', s.sw || 4); }
      else { sa(r, 'fill', s.fill || C.white); sa(r, 'stroke', 'none'); }
      sa(r, 'opacity', op >= 0.999 ? '1' : op.toFixed(3));
    },
  };
  return api;
}
// 一片格子：cols × rows，间距 pitch，方块边长 size。返回 { n, cells, at(i) }
function field(sv, x0, y0, cols, rows, pitch, size) {
  const cells = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cells.push(cell(sv, x0 + i * pitch + pitch / 2, y0 + j * pitch + pitch / 2, size));
  return { n: cells.length, cols, rows, pitch, size, x0, y0, cells, w: cols * pitch, h: rows * pitch };
}
// 格纸的线：堆的地址空间（铜线绿）
function gridLines(sv, x0, y0, cols, rows, pitch, o = {}) {
  const g = svg('g', { stroke: o.col || C.line, 'stroke-width': o.w || 2 }, sv);
  for (let i = 0; i <= cols; i++) svg('line', { x1: x0 + i * pitch, y1: y0, x2: x0 + i * pitch, y2: y0 + rows * pitch }, g);
  for (let j = 0; j <= rows; j++) svg('line', { x1: x0, y1: y0 + j * pitch, x2: x0 + cols * pitch, y2: y0 + j * pitch }, g);
  return g;
}

// 指针：一条直线加一个实心箭头。set({ f, x1, y1, x2, y2, col, op, w }) —— f 是从起点长出的比例
function ptr(sv, x1, y1, x2, y2, o = {}) {
  const g = svg('g', { visibility: 'hidden' }, sv);
  const ln = svg('line', { x1, y1, x2, y2, stroke: o.col || C.white, 'stroke-width': o.w || 4, 'stroke-linecap': 'butt' }, g);
  const hd = svg('polygon', { points: '0,0 0,0 0,0', fill: o.col || C.white }, g);
  const api = {
    g, x1, y1, x2, y2, gap1: o.gap1 != null ? o.gap1 : 0, gap2: o.gap2 != null ? o.gap2 : 0, head: o.head || 18,
    set(s) {
      const f = s.f == null ? 1 : s.f, op = s.op == null ? 1 : s.op;
      if (f <= 0.002 || op <= 0.002) { sa(g, 'visibility', 'hidden'); return; }
      sa(g, 'visibility', 'visible');
      const X1 = s.x1 != null ? s.x1 : api.x1, Y1 = s.y1 != null ? s.y1 : api.y1, X2 = s.x2 != null ? s.x2 : api.x2, Y2 = s.y2 != null ? s.y2 : api.y2;
      const L0 = Math.hypot(X2 - X1, Y2 - Y1) || 1, ux = (X2 - X1) / L0, uy = (Y2 - Y1) / L0;
      const sx = X1 + ux * api.gap1, sy = Y1 + uy * api.gap1, full = Math.max(0, L0 - api.gap1 - api.gap2), len = full * f;
      const tx_ = sx + ux * len, ty_ = sy + uy * len, H = api.head, back = Math.min(H, len);
      sa(ln, 'x1', sx.toFixed(1)); sa(ln, 'y1', sy.toFixed(1)); sa(ln, 'x2', (tx_ - ux * back * 0.7).toFixed(1)); sa(ln, 'y2', (ty_ - uy * back * 0.7).toFixed(1));
      const bx = tx_ - ux * back, by = ty_ - uy * back, wv = back * 0.55;
      sa(hd, 'points', `${tx_.toFixed(1)},${ty_.toFixed(1)} ${(bx - uy * wv).toFixed(1)},${(by + ux * wv).toFixed(1)} ${(bx + uy * wv).toFixed(1)},${(by - ux * wv).toFixed(1)}`);
      const col = s.col || o.col || C.white;
      sa(ln, 'stroke', col); sa(hd, 'fill', col); sa(ln, 'stroke-width', s.w || o.w || 4);
      sa(g, 'opacity', op >= 0.999 ? '1' : op.toFixed(3));
    },
  };
  return api;
}
// 指针连两块格子的中心，两端各让出格子的半边
const link = (sv, a, b, o = {}) => ptr(sv, a.cx, a.cy, b.cx, b.cy, { gap1: a.size / 2 + 6, gap2: b.size / 2 + 6, ...o });

// 帧函数里给一个 DOM 元素设可见性（区间显隐，倒着跳也成立）
function vis(el, on, op = 1) { ss(el, 'visibility', on ? 'visible' : 'hidden'); ss(el, 'opacity', on ? String(op) : '0'); }

// 指针与格子的一生：tIn 长出，tOut 收回。o.st(t) 可另给颜色等
function grow(p, tIn, tOut = Infinity, o = {}) {
  const d = o.d || 0.3, dOut = o.dOut || 0.25;
  F((t) => {
    let f = t >= tIn ? ease.out3(clamp((t - tIn) / d)) : 0;
    if (t >= tOut) f = 1 - ease.io3(clamp((t - tOut) / dOut));
    p.set({ f, k: f, ...(o.st ? o.st(t) : {}) });
  });
}
// 碎裂：一个色块在 t0 碎成 n×n 块向外散开并缩没（不碰透明度，只用缩放，避免与显隐的补间抢同一个属性）
function shatter(parent, x, y, w, hh, col, t0, o = {}) {
  const n = o.n || 2, gap = o.gap != null ? o.gap : 4, sp = o.spread || 90, fall = o.fall != null ? o.fall : 70;
  const r = seeded(o.seed || 5), ps = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const p = h('div', 'abs', parent); px(p, x + i * w / n, y + j * hh / n, w / n - gap, hh / n - gap); p.style.background = col;
    const dx = (i - (n - 1) / 2) * sp * (0.7 + 0.6 * r()), dy = (j - (n - 1) / 2) * sp * (0.7 + 0.6 * r()) + fall;
    appear(p, t0);
    tl.fromTo(p, { x: 0, y: 0, rotation: 0, scale: 1 }, { x: dx, y: dy, rotation: (r() - 0.5) * 70, scale: 0, duration: o.d || 0.6, ease: 'power2.out', immediateRender: false }, t0);
    ps.push(p);
  }
  return ps;
}
// 一下脉冲：放大一点再回到原样（多次脉冲互不重叠；不在构建时生效）
function pulse(el, t, s = 1.18, d = 0.22) { tl.fromTo(el, { scale: s }, { scale: 1, duration: d, ease: 'power2.out', immediateRender: false }, t); }
// 「妙处」：每章机制本身的妙处用同一种版式标出——左边一道金线，右边一句大字
function wonder(parent, html, x, y, t0, t1, o = {}) {
  const rule = h('div', 'abs', parent); px(rule, x, y + 8, 12, o.h || 220); rule.style.background = C.gold;
  const tt = tx(parent, 'ser', html, x + 48, y, { size: o.size || 104, lh: 1.18, ...(o.plate ? { bg: C.field, pad: '0 18px 10px' } : {}) });
  wipe(rule, t0, { dir: 't', d: 0.35 }); wipe(tt, t0 + 0.12, { dir: 'l', d: 0.6 });
  if (t1 != null) { wipeOut(rule, t1, { dir: 'b', d: 0.3 }); wipeOut(tt, t1, { dir: 'r', d: 0.35 }); }
  sfx('chime', t0 + 0.2, { g: 0.45 });
  return { rule, tt };
}
// 一片静止的背景格子（堆的其余部分），铜线绿，不抢主体
function bgHeap(sv, x0, y0, cols, rows, seed = 3, dens = 0.32) {
  const r = seeded(seed), g = svg('g', { fill: C.line }, sv);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (r() < dens) svg('rect', { x: x0 + i * 60 + 5, y: y0 + j * 60 + 5, width: 50, height: 50 }, g);
  return g;
}
