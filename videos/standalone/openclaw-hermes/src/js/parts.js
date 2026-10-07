// 本片的部件与图形语言。共同的母题是「像素方块」：一条消息就是一个方块，两个项目的标志也都由方块拼成。
//   珊瑚红（claw）只属于 OpenClaw（像素龙虾取自其仓库）；金色三段（herm / amber / bronze）只属于 Hermes Agent（照其 banner 的像素字）。
//   图形各有一个含义，全片不变：方块 = 消息；圆环 = 智能体循环；横条上的插口 = 适配器；车道 = 会话；折角纸 = Markdown 文件；圆柱 = SQLite。
const W = 1920, H = 1080, M = 120;
const C = { paper: '#ece7da', ink: '#0b0e14', claw: '#ff4f40', claw2: '#ff775f', herm: '#ffd700', amber: '#ffbf00', bronze: '#cd7f32', dim: '#5c5a54', dimi: '#8f939c', line: '#2a2f3a' };
const DT = (s) => Date.parse(s + 'T00:00:00Z');

// ── 舞台：底色 + world（比画面大的画布）+ 镜头 ──
function stageOf(root, ground) {
  root.dataset.ground = ground;
  root.style.background = ground === 'ink' ? C.ink : C.paper;
  const world = h('div', 'world', root);
  return { world, root };
}
const gfx = (world) => svg('svg', { class: 'g', viewBox: '-3000 -2000 12000 6000' }, world);   // 与 style.css 里画布的位置、大小一致
const R = (g, x, y, w, hh, fill, o = {}) => svg('rect', { x, y, width: w, height: hh, fill, ...o }, g);
const Ci = (g, cx, cy, r, fill, o = {}) => svg('circle', { cx, cy, r, fill, ...o }, g);
const Ln = (g, x1, y1, x2, y2, stroke, w = 4, o = {}) => svg('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...o }, g);
const Pa = (g, d, o = {}) => svg('path', { d, fill: 'none', ...o }, g);
// 文字：绝对定位的块。cls 取 style.css 里的字型类，st 为行内样式
function tx(world, cls, x, y, html, st) {
  const e = h('div', 'abs ' + cls, world, html); px(e, x, y);
  if (st) css(e, st);
  return e;
}

// ── 像素字（5×7 位图，每个像素一个方块；自绘，不用字体）──
const BM = {
  H: ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'], E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  R: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'], M: ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'], A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  G: ['.XXXX', 'X....', 'X....', 'X..XX', 'X...X', 'X...X', '.XXXX'], N: ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X', 'X...X'],
  T: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'], ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '0': ['.XXX.', 'X...X', 'X..XX', 'X.X.X', 'XX..X', 'X...X', '.XXX.'], '1': ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  '2': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'], '3': ['XXXXX', '...X.', '..X..', '...X.', '....X', 'X...X', '.XXX.'],
  '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'], '5': ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
  '6': ['..XX.', '.X...', 'X....', 'XXXX.', 'X...X', 'X...X', '.XXX.'], '7': ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
  '8': ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'], '9': ['.XXX.', 'X...X', 'X...X', '.XXXX', '....X', '...X.', '.XX..'],
  '-': ['.....', '.....', '.....', 'XXXXX', '.....', '.....', '.....'],
  ',': ['.....', '.....', '.....', '.....', '..XX.', '...X.', '..X..'], '.': ['.....', '.....', '.....', '.....', '.....', '..XX.', '..XX.'],
};
function pixelText(g, text, x, y, u, fill, gap = 1) {
  const els = []; let cx = x, col = 0;
  for (const ch of text) {
    const rows = BM[ch] || BM[' '];
    rows.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === 'X') els.push({ e: svg('rect', { x: cx + i * u, y: y + j * u, width: u, height: u, fill }, g), col: col + i, row: j }); });
    cx += (5 + gap) * u; col += 5 + gap;
  }
  return { els, w: cx - gap * u - x, h: 7 * u, cols: col - gap };
}
// 逐列出现：每一列一个时刻，dt 为列间隔
function colReveal(els, t, dt) {
  const by = {};
  els.forEach((o) => (by[o.col] = by[o.col] || []).push(o.e));
  Object.keys(by).forEach((c) => fromTo(by[c], t + c * dt, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }));
}
// 像素数字：n 个字位，set('251,451') 按字符点亮；由 F() 逐帧驱动，保持纯函数
function pixelNum(g, x, y, u, fill, n) {
  const cells = [];
  for (let s = 0; s < n; s++) { const a = []; for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) a.push(svg('rect', { x: x + s * 6 * u + i * u, y: y + j * u, width: u, height: u, fill, opacity: 0 }, g)); cells.push(a); }
  let last = null;
  return { w: n * 6 * u - u, set(str) { if (str === last) return; last = str; const s = str.padStart(n, ' '); for (let k = 0; k < n; k++) { const rows = BM[s[k]] || BM[' ']; for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) cells[k][j * 5 + i].setAttribute('opacity', rows[j][i] === 'X' ? 1 : 0); } } };
}
// ── 像素龙虾：OpenClaw 的吉祥物。16×16 点阵逐格取自其仓库的 docs/assets/pixel-lobster.svg（MIT 许可），颜色照原图 ──
// lobster(g, x, y, u)：左上角 (x, y)，每格 u 像素。set(k)：两只钳向外张开 k 格（0–1），由帧函数驱动
const LOB = {
  outline: [[1, 5, 1, 3], [2, 4, 1, 1], [2, 8, 1, 1], [3, 3, 1, 1], [3, 9, 1, 1], [4, 2, 1, 1], [4, 10, 1, 1], [5, 2, 6, 1], [11, 2, 1, 1], [12, 3, 1, 1], [12, 9, 1, 1], [13, 4, 1, 1], [13, 8, 1, 1], [14, 5, 1, 3], [5, 11, 6, 1], [4, 12, 1, 1], [11, 12, 1, 1], [3, 13, 1, 1], [12, 13, 1, 1], [5, 14, 6, 1]],
  body: [[5, 3, 6, 1], [4, 4, 8, 1], [3, 5, 10, 1], [3, 6, 10, 1], [3, 7, 10, 1], [4, 8, 8, 1], [5, 9, 6, 1], [5, 12, 6, 1], [6, 13, 4, 1]],
  clawL: [[1, 6, 2, 1], [2, 5, 1, 1], [2, 7, 1, 1]], clawR: [[13, 6, 2, 1], [13, 5, 1, 1], [13, 7, 1, 1]],
  eyeD: [[6, 5, 1, 1], [9, 5, 1, 1]], eyeW: [[6, 4, 1, 1], [9, 4, 1, 1]],
};
function lobster(g, x, y, u) {
  const grp = svg('g', { transform: `translate(${x} ${y})` }, g);
  const put = (list, fill, parent) => list.map(([a, b, w, hh]) => svg('rect', { x: a * u, y: b * u, width: w * u, height: hh * u, fill }, parent));
  put(LOB.outline, '#3a0a0d', grp); put(LOB.body, '#ff4f40', grp);
  const cl = svg('g', {}, grp), cr = svg('g', {}, grp); put(LOB.clawL, '#ff775f', cl); put(LOB.clawR, '#ff775f', cr);
  put(LOB.eyeD, '#081016', grp); put(LOB.eyeW, '#f5fbff', grp);
  let last = null;
  return { grp, w: 16 * u, set(k) { const v = (k * u).toFixed(1); if (v === last) return; last = v; cl.setAttribute('transform', `translate(${-v} 0)`); cr.setAttribute('transform', `translate(${v} 0)`); } };
}
// ── Hermes Agent 的 banner 字样：像素字分三段色（金、琥珀、古铜），右下带两层描边回声（照其仓库 assets/banner.png 的样子重画）──
function pixelBanner(g, text, x, y, u, o = {}) {
  const els = []; let cx = x, col = 0; const band = (j) => (j < 3 ? '#ffd700' : j < 5 ? '#ffbf00' : '#cd7f32');
  const eg = svg('g', {}, g), mg = svg('g', {}, g), sw = Math.max(1.5, u * 0.08);
  for (const ch of text) {
    const rows = BM[ch] || BM[' '];
    rows.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === 'X') {
      if (o.echo !== false) [1, 2].forEach((k) => els.push({ e: svg('rect', { x: cx + i * u + k * u * 0.3, y: y + j * u + k * u * 0.3, width: u, height: u, fill: 'none', stroke: '#cd7f32', 'stroke-width': sw }, eg), col: col + i, row: j }));
      els.push({ e: svg('rect', { x: cx + i * u, y: y + j * u, width: u, height: u, fill: band(j) }, mg), col: col + i, row: j });
    } });
    cx += 6 * u; col += 6;
  }
  return { els, w: cx - u - x, h: 7 * u };
}

// ── 版面部件 ──
// 芯片：描边的小框，里面是文字。kind: oc 珊瑚红 | hm 金色 | n 墨色（纸白底上）| ni 纸色（墨黑底上）| d 灰
function chip(world, x, y, text, kind = 'n', size = 30, extra = {}) {
  const border = { oc: C.claw, hm: C.herm, n: C.ink, ni: C.paper, d: C.dimi }[kind], color = { oc: C.claw, hm: C.herm, n: C.ink, ni: C.paper, d: C.dimi }[kind];
  const e = h('div', 'abs mono', world, text); px(e, x, y);
  css(e, { fontSize: size + 'px', lineHeight: '1.2', padding: '8px 16px', border: `4px solid ${border}`, color, ...extra });
  return e;
}
// 代码块：每行一个元素，便于逐行出现；hl 为高亮行（朱红底墨字 / 金底墨字）
function codeBlock(world, x, y, lines, o = {}) {
  const size = o.size || 30, lh = o.lh || 1.5, col = o.color || C.ink, dimc = o.dim || C.dim;
  const box = h('div', 'abs', world); px(box, x, y);
  const els = lines.map((l, i) => {
    const e = h('div', 'mono', box, l === '' ? ' ' : l);
    css(e, { fontSize: size + 'px', lineHeight: (size * lh) + 'px', height: (size * lh) + 'px', color: col, paddingLeft: '12px', paddingRight: '12px', marginLeft: '-12px' });
    if (o.hl && o.hl.includes(i)) css(e, { background: o.hlBg || C.claw, color: C.ink });
    return e;
  });
  return { box, els, h: lines.length * size * lh };
}
// 字幕底色：登记某一段时间内的底色（'paper' | 'ink'）
const groundAt = (t0, t1, g) => window.GROUND_AT.push({ t0, t1, g });
// 日期 → 横坐标：t0 日对应 x0，每天 px 像素
const dayX = (iso, d0, x0, ppd) => x0 + (DT(iso) - DT(d0)) / 86400000 * ppd;
// 千分位
const fmtN = (v) => Math.round(v).toLocaleString('en-US');

// ══ 图解部件 ══
const Tw = (id, zh, en, sh = 0) => T(id, { zh, en }, sh);
const D_ = () => window.DATA;
// 引文与源码行：has(key, 片段) 断言片段确在取证数据里（不在时页面日志报警，check.js 会拦下）；srcOf 给出「文件:行号」
const ent = (key) => D_().q[key] || D_().ex[key];
function has(key, sub) { const e = ent(key); if (!e) { console.warn('no quote', key); return sub; } if (sub && !e.text.includes(sub)) console.warn('quote mismatch', key, sub); return sub || e.text; }
function srcOf(key) { const e = ent(key); if (!e) { console.warn('no quote', key); return key; } return e.path + ':' + (e.line != null ? e.line : e.lines[0]); }
// 文字：lab(world, x, y, 文本, { cls, size, c, w, align, lh, wrap })
function lab(world, x, y, text, o = {}) {
  const e = h('div', 'abs ' + (o.cls || 'mono'), world, text); px(e, x, y);
  css(e, { fontSize: (o.size || 28) + 'px', color: o.c || C.paper, ...(o.w ? { width: o.w + 'px' } : {}), ...(o.align ? { textAlign: o.align } : {}), ...(o.lh ? { lineHeight: o.lh } : {}), ...(o.wrap ? { whiteSpace: 'normal' } : {}), ...(o.st || {}) });
  return e;
}
// 出处行：小号灰字
// short：只留最后两级路径（长路径会挤到旁边的图上）
const srcLab = (world, x, y, key, o = {}) => lab(world, x, y, (o.pre || '') + (o.short ? srcOf(key).split('/').slice(-2).join('/') : srcOf(key)), { size: o.size || 22, c: o.c || C.dimi, ...o });
// 描边框
function frame(world, x, y, w, hh, o = {}) {
  const e = h('div', 'abs', world); px(e, x, y, w, hh);
  css(e, { border: `${o.bw != null ? o.bw : 5}px ${o.dash ? 'dashed' : 'solid'} ${o.c || C.paper}`, background: o.fill || 'transparent', borderRadius: (o.r || 0) + 'px', boxSizing: 'border-box' });
  return e;
}
// 实心标签：色块上压深色字（章节内的小节名、状态）
function tag(world, x, y, text, o = {}) {
  const e = h('div', 'abs ' + (o.cls || 'mono7'), world, text); px(e, x, y);
  css(e, { fontSize: (o.size || 26) + 'px', lineHeight: '1.2', padding: (o.pad || '6px 14px'), background: o.bg || C.paper, color: o.c || C.ink });
  return e;
}
// 折线：pts = [[x, y], …]
function wire(g, pts, c, w = 5, o = {}) { return Pa(g, 'M' + pts.map((p) => p[0] + ',' + p[1]).join(' L'), { stroke: c, 'stroke-width': w, 'stroke-linejoin': 'miter', ...(o.dash ? { 'stroke-dasharray': o.dash } : {}), ...(o.o != null ? { opacity: o.o } : {}) }); }
// 箭头（实心三角头）
function arrow(g, x1, y1, x2, y2, c, w = 5) {
  const grp = svg('g', {}, g), a = Math.atan2(y2 - y1, x2 - x1), hl = 20, bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl;
  Ln(grp, x1, y1, bx, by, c, w);
  svg('polygon', { points: `${x2},${y2} ${bx - Math.sin(a) * 11},${by + Math.cos(a) * 11} ${bx + Math.sin(a) * 11},${by - Math.cos(a) * 11}`, fill: c }, grp);
  return grp;
}
// 折线上的位置：k ∈ [0, 1]
function polyAt(pts, k) {
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let d = clamp(k) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const u = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; } d -= seg[i]; }
  return pts[0];
}
// 消息方块：packet(g, 边长, 颜色)。ride(t0, d, pts, { hold, ease })：在 [t0, t0+d] 沿折线走，之后停留 hold 秒（Infinity 表示一直留着）。
// 可多次 ride；位置只由 t 决定。stroke 为空心方块（未放行的消息）。
function packet(g, sz, fill, o = {}) {
  const e = svg('rect', { x: -sz / 2, y: -sz / 2, width: sz, height: sz, fill: o.hollow ? 'none' : fill, ...(o.hollow ? { stroke: fill, 'stroke-width': 4 } : {}), opacity: 0 }, g);
  const legs = []; let last = '';
  F((t) => {
    let on = false, x = 0, y = 0;
    for (const L of legs) if (t >= L.t0 && t < L.t0 + L.d + L.hold) { const k = (L.ease || ease.io3 || ((v) => v))(clamp((t - L.t0) / L.d)); [x, y] = polyAt(L.pts, k); on = true; }
    const key = on ? x.toFixed(1) + ',' + y.toFixed(1) : '';
    if (key === last) return; last = key;
    e.setAttribute('opacity', on ? 1 : 0); if (on) e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  });
  return { e, ride(t0, d, pts, oo = {}) { legs.push({ t0, d, pts, hold: oo.hold != null ? oo.hold : 0, ease: oo.ease }); return t0 + d; }, fill(c) { e.setAttribute(o.hollow ? 'stroke' : 'fill', c); } };
}
// 循环：一个圆环加一个绕行的方块。spin(t0, t1, 每圈秒数, 起始角度)：区间内绕行，区间外停在起始角
function ring(g, cx, cy, r, c, o = {}) {
  const grp = svg('g', {}, g);
  const circ = Ci(grp, cx, cy, r, 'none', { stroke: c, 'stroke-width': o.w || 8 });
  const sz = o.dot || 22, dot = svg('rect', { x: -sz / 2, y: -sz / 2, width: sz, height: sz, fill: o.dotc || c }, grp);
  const spans = [], keys = []; let last = '';
  F((t) => {
    let a = o.rest != null ? o.rest : -90, on = o.idle !== false;
    for (const s of spans) if (t >= s.t0) { a = s.a0 + 360 * (Math.min(t, s.t1) - s.t0) / s.per; on = true; }
    if (keys.length && t >= keys[0][0]) { on = true; a = keys[keys.length - 1][1]; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { a = lerp(keys[i - 1][1], keys[i][1], ease.io3(clamp((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])))); break; } }
    const key = on ? a.toFixed(1) : 'x';
    if (key === last) return; last = key;
    const rad = a * Math.PI / 180;
    dot.setAttribute('transform', `translate(${(cx + r * Math.cos(rad)).toFixed(1)} ${(cy + r * Math.sin(rad)).toFixed(1)})`); dot.setAttribute('opacity', on ? 1 : 0);
  });
  // key([[t, 角度], …])：按关键帧走（每段缓入缓出），用于「走到某一站停一下」
  return { grp, circ, dot, cx, cy, r, spin(t0, t1, per = 2.4, a0 = -90) { spans.push({ t0, t1, per, a0 }); spans.sort((x, y) => x.t0 - y.t0); }, key(list) { keys.push(...list); keys.sort((x, y) => x[0] - y[0]); } };
}
// Markdown 文件：折角纸的轮廓
function fileIcon(g, x, y, w, hh, c, o = {}) {
  const k = Math.min(w, hh) * 0.28;
  return Pa(g, `M${x},${y} L${x + w - k},${y} L${x + w},${y + k} L${x + w},${y + hh} L${x},${y + hh} Z M${x + w - k},${y} L${x + w - k},${y + k} L${x + w},${y + k}`, { stroke: c, 'stroke-width': o.w || 4, fill: o.fill || 'none', 'stroke-linejoin': 'miter' });
}
// SQLite：扁平的圆柱轮廓
function cyl(g, x, y, w, hh, c, o = {}) {
  const ry = Math.min(hh * 0.18, w * 0.2), sw = o.w || 4;
  return Pa(g, `M${x},${y + ry} A${w / 2},${ry} 0 0 1 ${x + w},${y + ry} A${w / 2},${ry} 0 0 1 ${x},${y + ry} L${x},${y + hh - ry} A${w / 2},${ry} 0 0 0 ${x + w},${y + hh - ry} L${x + w},${y + ry}`, { stroke: c, 'stroke-width': sw, fill: o.fill || 'none' });
}
// 时钟：圆加一根指针。run(t0, t1, 每圈秒数)
function clock(g, cx, cy, r, c, o = {}) {
  const grp = svg('g', {}, g); Ci(grp, cx, cy, r, 'none', { stroke: c, 'stroke-width': o.w || 5 });
  const hand = Ln(grp, cx, cy, cx, cy - r * 0.68, c, o.w || 5); Ln(grp, cx, cy, cx + r * 0.42, cy, c, o.w || 5);
  const spans = []; let last = '';
  F((t) => { let a = 0; for (const s of spans) if (t >= s.t0) a = 360 * (Math.min(t, s.t1) - s.t0) / s.per; const k = a.toFixed(1); if (k === last) return; last = k; hand.setAttribute('transform', `rotate(${k} ${cx} ${cy})`); });
  return { grp, run(t0, t1, per = 2) { spans.push({ t0, t1, per }); } };
}
// 引文块：左侧一条色线，正文逐字取自取证数据（key + 片段，片段缺省取全文），出处在下
function quote(world, x, y, w, key, sub, o = {}) {
  const box = h('div', 'abs', world); px(box, x, y, w);
  css(box, { borderLeft: `8px solid ${o.bar || C.paper}`, paddingLeft: '26px', whiteSpace: 'normal' });
  const txt = has(key, sub);
  const t = h('div', o.cls || 'mono', box, o.html ? o.html(esc(txt)) : esc(txt)); css(t, { fontSize: (o.size || 30) + 'px', lineHeight: '1.42', whiteSpace: 'normal', color: o.c || C.paper });
  const n = h('div', 'mono', box, (o.pre || '') + srcOf(key)); css(n, { fontSize: (o.srcSize || 22) + 'px', color: o.srcC || C.dimi, marginTop: '10px' });
  return box;
}
// 一排实心标签：按内容自然排开，不会互相压住（两种语言的字宽不同）。rowOf 建容器，tagIn 往里加标签
function rowOf(world, x, y, gap = 12) { const e = h('div', 'abs', world); px(e, x, y); css(e, { display: 'flex', gap: gap + 'px', alignItems: 'flex-start' }); return e; }
function tagIn(parent, text, o = {}) { const e = h('div', o.cls || 'mono7', parent, text); css(e, { fontSize: (o.size || 26) + 'px', lineHeight: '1.2', padding: (o.pad || '6px 14px'), background: o.bg || C.paper, color: o.c || C.ink, whiteSpace: 'nowrap' }); return e; }
// 依次出现
const seq = (els, t, dt, fn) => els.forEach((e, i) => fn(e, t + i * dt, i));
// 画线：按长度描出
const drawIn = (p, t, d = 0.6) => draw(p, t, d);
// 折线图的逐步描出：curve(g, pts, 颜色, 线宽)。reveal([[t, 点序号], …])：按时间把曲线描到第几个点（可为小数，段内缓入缓出）；
// at(k) 给出序号 k 处的坐标，kAt(t) 给出 t 时刻描到的序号（供计数器与跟随的图形用）
function curve(g, pts, c, w = 8) {
  const path = wire(g, pts, c, w); path.setAttribute('stroke-linejoin', 'round'); path.setAttribute('stroke-linecap', 'round');
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[cum.length - 1], n = pts.length;
  const seg = (k) => Math.min(n - 2, Math.max(0, Math.floor(k)));
  const at = (k) => { const i = seg(k), u = clamp(k - i); return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; };
  const keys = []; let last = null;
  const kAt = (t) => { if (!keys.length || t <= keys[0][0]) return keys.length ? keys[0][1] : 0; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease.io3(clamp((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])))); return keys[keys.length - 1][1]; };
  path.style.strokeDasharray = tot.toFixed(1) + ' ' + (tot + 20).toFixed(1);
  F((t) => { const k = kAt(t); if (k === last) return; last = k; const i = seg(k); const len = lerp(cum[i], cum[i + 1], clamp(k - i)); path.style.strokeDashoffset = (tot - len).toFixed(1); path.setAttribute('opacity', len > 0.5 ? 1 : 0); });
  return { path, at, kAt, reveal(list) { keys.push(...list); keys.sort((a, b) => a[0] - b[0]); } };
}
// 高亮引文里的片段：mark(文本, [片段…], 类名)
const mark = (txt, subs, cls = 'hl') => subs.reduce((s, w) => s.split(w).join(`<span class="${cls}">${w}</span>`), txt);
// 镜头轨迹（代替直接调 cam.track）：保证每一段「缓慢漂移」（sfx: false 的那些段）与相邻两段之间的空档都有足够的位移。
// 线条图比较稀疏，推拉太慢时逐帧的像素变化低于预演的静止检测门限（preview.js），看起来也确实像定住了。
// 做法：漂移段的屏幕位移不足 SPEED × 时长时补一点横移（左右交替）；两段之间空档超过 1.2 秒时插入一段匀速的小幅推近加横移。
function camTrack(cam, startT, start, keys, endT, world) {
  const SPEED = 24, out = []; let cur = { x: 960, y: 540, z: 1, ...start }, sign = 1, prevEnd = startT;
  const travel = (a, b) => (Math.abs(b.x - a.x) + Math.abs(b.y - a.y)) * Math.min(a.z, b.z) + 600 * Math.abs(b.z - a.z);
  const fill = (t0, t1) => { const d = t1 - t0; if (d <= 1.2) return; const nx = { ...cur, x: cur.x + sign * 16 * Math.min(d, 5) / cur.z, z: cur.z * (1 + 0.012 * Math.min(d, 5)) }; out.push([t0, { x: nx.x, z: nx.z }, d, { ease: 'none', sfx: false }]); cur = nx; sign = -sign; };
  for (const [t, v, d = 1.4, o = {}] of keys) {
    // 时间线上不能出现负的起点：GSAP 会把所有补间整体后移，画面就不再只由 t 决定
    const tt = Math.max(startT + 0.02, t == null ? prevEnd + 0.15 : t);
    fill(prevEnd + 0.05, tt - 0.05);
    let next = { ...cur, ...v }, oo = o;
    if (o.sfx === false) { const need = Math.min(SPEED * d, 90), has_ = travel(cur, next); if (has_ < need) { next = { ...next, x: next.x + sign * (need - has_) / Math.min(cur.z, next.z) }; sign = -sign; } oo = { ...o, ease: 'sine.inOut' }; }
    out.push([tt, { x: next.x, y: next.y, z: next.z }, d, oo]); cur = next; prevEnd = tt + d;
  }
  if (endT != null) fill(prevEnd + 0.05, endT);
  cam.track(startT, start, out);
  // 第一个场景从 t = 0 起：各段补间建立时会把镜头状态依次写成自己的起点（有的 GSAP 版本还会推迟到本轮末尾才写），
  // 建完后留下的是最后一段的起点；时间线停在 0 时不会重算，于是第 0 帧的镜头是错的，而从后面跳回 0 又是对的。
  // 在第一段开始之前，由这里把镜头按起始位置直接摆好（world 为场景的画布元素），不依赖补间库在那一刻的状态。
  if (startT <= 0 && world) {
    const p0 = { x: 960, y: 540, z: 1, r: 0, ...start }, t0 = out.length ? out[0][0] : Infinity;
    F((t) => { if (t < t0) { Object.assign(cam.st, p0); world.style.transform = `translate(960px, 540px) scale(${p0.z}) rotate(${p0.r}deg) translate(${-p0.x}px, ${-p0.y}px)`; } });
  }
}
