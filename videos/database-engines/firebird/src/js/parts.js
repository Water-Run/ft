// 本片的部件：按方向 1「官网」的视觉系统写，图形语言见 css/style.css 开头。
const FB = window.FIREBIRD_DATA;
const C = { ink: '#17222B', teal: '#2e6474', flame: '#F68A21', gold: '#FAAC19', fire: '#EE2B24', page: '#FCFCFC', white: '#FFFFFF', g1: '#ECEDEE', g2: '#DCDEDF', g3: '#B9BCBF', g4: '#3A434B' };

// 一个场景的大画布：world 比画面大，镜头在其中移动；两层 SVG（面板之下 / 之上），viewBox 与 world 坐标一致
function stage(root, W = 1920, H = 1080) {
  const world = h('div', 'world', root); px(world, 0, 0, W, H);
  const under = layer(world, W, H, 0), over = layer(world, W, H, 6);
  return { world, under, over, W, H };
}
let LAYER_SEQ = 0;
function layer(parent, W, H, z) {
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, parent);
  css(s, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible', zIndex: z, pointerEvents: 'none' });
  s._seq = ++LAYER_SEQ;
  const defs = svg('defs', {}, s);
  for (const id in C) {
    const m = svg('marker', { id: `fa${s._seq}-${id}`, viewBox: '0 0 10 10', refX: '7', refY: '5', markerWidth: '4.2', markerHeight: '4.2', orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M0,0 L10,5 L0,10 Z', fill: C[id] }, m);
  }
  return s;
}
// 正交折线箭头：pts = [[x, y], …]；color 取 C 的键
function arrow(lay, pts, color = 'ink', o = {}) {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return svg('path', { d, fill: 'none', stroke: C[color] || color, 'stroke-width': o.w || 4, 'stroke-linejoin': 'miter', 'stroke-linecap': 'butt',
    ...(o.head === false ? {} : { 'marker-end': `url(#fa${lay._seq}-${color})` }), ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, lay);
}
// 描线：开始之前整条藏起来（每帧设 display，避免线帽先露出一个点）
function drawIn(p, t, d = 0.7) {
  const len = p.getTotalLength();
  const dashed = p.getAttribute('stroke-dasharray');
  if (dashed) { F((tt) => { p.style.display = tt < t ? 'none' : ''; }); tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: d * 0.6, immediateRender: true }, t); return p; }
  p.style.strokeDasharray = len + ' ' + len;
  F((tt) => { p.style.display = tt < t ? 'none' : ''; });
  tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
  return p;
}
// 文字
function tx(parent, cls, html, x, y, style) { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); if (style) css(e, style); return e; }
// 方角块：带文字的芯片或面板
function blk(parent, cls, html, x, y, w, hh, style) { const e = h('div', ('abs ' + cls).trim(), parent, html); px(e, x, y, w, hh); if (style) css(e, style); return e; }
// 一排字节格：hex 为字符串数组；cls(i) 给每格的类名
function bytes(parent, hex, x, y, o = {}) {
  const cw = o.cw || 52, ch = o.ch || 58, gap = o.gap != null ? o.gap : 4, per = o.per || hex.length;
  return hex.map((v, i) => {
    const e = h('div', ('byte ' + (o.cls ? o.cls(i) : '')).trim(), parent, v);
    px(e, x + (i % per) * cw, y + Math.floor(i / per) * (ch + (o.rowGap || 24)), cw - gap, ch);
    if (o.fs) e.style.fontSize = o.fs + 'px';
    return e;
  });
}
// 字段标注：一段字节下方的墨线与说明
function field(parent, x, y, w, label, o = {}) {
  const ln = blk(parent, '', '', x, y, w, 4, { background: o.color || C.ink });
  const lb = tx(parent, o.cls || 't5', label, x, y + 10, { color: o.textColor || C.g4 });
  return { ln, lb };
}
// 按比例的数据页：每字节一个小格；own(b) 返回该字节归属的键，colors 给颜色。画完冻成图片
function pageGrid(parent, x, y, own, colors, o = {}) {
  const cols = o.cols || 128, cs = o.cs || 6, gap = o.gap != null ? o.gap : 1, n = o.n || 8192;
  const cv = document.createElement('canvas'); cv.width = cols * cs; cv.height = Math.ceil(n / cols) * cs;
  cv.className = 'abs'; css(cv, { left: x + 'px', top: y + 'px' }); parent.appendChild(cv);
  const g = cv.getContext('2d');
  for (let b = 0; b < n; b++) { g.fillStyle = colors[own(b)] || colors.free; g.fillRect((b % cols) * cs, Math.floor(b / cols) * cs, cs - gap, cs - gap); }
  const img = freeze(cv); img.className = 'abs'; img.dataset.name = o.name || '数据页';
  return { img, cols, cs, x, y, at: (b) => ({ x: x + (b % cols) * cs, y: y + Math.floor(b / cols) * cs }) };
}
// 字节区间在页图上的高亮框（一行之内）
function span(parent, pg, b0, len, cls, o = {}) {
  const p = pg.at(b0);
  return blk(parent, cls, '', p.x - 1, p.y - 1, len * pg.cs + 1, pg.cs + 1, o.style);
}
// 平面的文件图标：方框加折角
function fileIcon(parent, x, y, w, hh, name) {
  const g = h('div', 'abs', parent); px(g, x, y, w, hh); g.dataset.name = '文件 ' + name;
  blk(g, '', '', 0, 0, w, hh, { background: C.white, outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  const k = w < 340 ? 56 : 70;
  blk(g, '', '', w - k, 0, k, k, { background: C.page, borderLeft: '4px solid ' + C.ink, borderBottom: '4px solid ' + C.ink });
  tx(g, w < 340 ? 'm3' : 'm2', name, 26, 30, { fontWeight: 600 });
  return g;
}
// 官网文档侧栏式的箭头列表
function alist(parent, x, y, items, o = {}) {
  const l = h('div', 'alist', parent); px(l, x, y); if (o.w) l.style.width = o.w + 'px';
  const els = items.map((t) => h('div', 'it', l, `<span class="ar">→</span>${t}`));
  if (o.fs) els.forEach((e) => { e.style.fontSize = o.fs + 'px'; });
  return { l, els };
}
// 第一个场景的第 0 帧：t 早于轨迹第一段时，每帧把镜头放回起点（见 docs/reference/pitfalls.md）
function pin(cam, world, tFirst, start) {
  F((t) => { if (t < tFirst) { Object.assign(cam.st, start); world.style.transform = `translate(960px, 540px) scale(${cam.st.z}) rotate(0deg) translate(${-cam.st.x}px, ${-cam.st.y}px)`; } });
}
// 区间显隐由 t 直接算出（往回跳时也成立）
function during(e, t0, t1) { F((t) => { const on = t >= t0 && t < t1; e.style.visibility = on ? 'visible' : 'hidden'; }); }
const hex2 = (n, bytes = 2) => Array.from({ length: bytes }, (_, i) => ((n >> (8 * i)) & 255).toString(16).padStart(2, '0'));
