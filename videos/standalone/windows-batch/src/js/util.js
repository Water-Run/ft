// 与具体视觉无关的小工具：关键帧式内容切换、SVG 叠加层与箭头、文本表格。
// 本片的终端（.slab）、文件（.sheet）等部件的样式在 css/style.css，搭法见 design/example_scene.js。

// 关键帧式的内容切换：同一元素可在多个时刻换文本/类名，任意 seek 都取「最近一次」的状态
function keyed(e) {
  if (e._kf) return e._kf;
  const base = { html: e.innerHTML, cls: e.className };
  const frames = [];
  let last = null;
  const api = {
    at(t, o) { frames.push({ t, ...o }); frames.sort((x, y) => x.t - y.t); return api; },
  };
  F((t) => {
    let st = base, k = -1;
    let html = base.html, cls = base.cls;
    for (let i = 0; i < frames.length && frames[i].t <= t; i++) { if (frames[i].html != null) html = frames[i].html; if (frames[i].cls != null) cls = frames[i].cls; k = i; }
    if (k === last) return; last = k;
    if (e.innerHTML !== html) e.innerHTML = html;
    if (e.className !== cls) e.className = cls;
  });
  e._kf = api;
  return api;
}
// 纯文本表格（+---+ 边框），返回逐行字符串
function asciiTable(head, rows, alignRight = []) {
  const w = head.map((hd, i) => Math.max(String(hd).length, ...rows.map((r) => String(r[i]).length)));
  const sep = '+' + w.map((n) => '-'.repeat(n + 2)).join('+') + '+';
  const fmt = (r) => '| ' + r.map((v, i) => (alignRight[i] ? String(v).padStart(w[i]) : String(v).padEnd(w[i]))).join(' | ') + ' |';
  return [sep, fmt(head), sep, ...rows.map(fmt), sep];
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── SVG 叠加层与箭头 ──
// 每个叠加层自带一套箭头标记（id 带序号）：场景隐藏时其 <defs> 也随之失效，不能跨场景共用
let OV_SEQ = 0;
const COL = window.PALETTE || { ink: '#0C0C0C', amber: '#FFB000', dim: '#6B665D' };   // 箭头可用的颜色名，项目在 config.js 里设 window.PALETTE
function overlay(parent) {
  const s = svg('svg', { class: 'ov', viewBox: '0 0 1920 1080' }, parent);
  s._seq = ++OV_SEQ;
  const defs = svg('defs', {}, s);
  for (const id in COL) {
    const m = svg('marker', { id: `ah${s._seq}-${id}`, viewBox: '0 0 10 10', refX: '8.2', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M1,1.2 L9,5 L1,8.8', fill: 'none', stroke: COL[id], 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
  }
  return s;
}
function path(svgEl, d, color = 'ink', o = {}) {
  return svg('path', { d, fill: 'none', stroke: COL[color] || color, 'stroke-width': o.w || 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(o.arrow === false ? {} : { 'marker-end': `url(#ah${svgEl._seq}-${color})` }), ...(o.dashed ? { 'stroke-dasharray': o.dashed } : {}), opacity: o.opacity != null ? o.opacity : 1 }, svgEl);
}
// 显示一条箭头：先描线，箭头随之出现
function arrowIn(p, t, d = 0.8) {
  const len = p.getTotalLength();
  if (p.getAttribute('stroke-dasharray')) { tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, immediateRender: true }, t); return p; }
  p.style.strokeDasharray = len + ' ' + len;
  tl.fromTo(p, { strokeDashoffset: len, autoAlpha: 0 }, { strokeDashoffset: 0, autoAlpha: 1, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
  return p;
}

// ── 入场 / 退场的几种基本动作（平面风格用；不要全片只用 show() 的「淡入 + 上移」）──
// 擦除式揭示：元素从一侧「刷」出来。dir 为起刷的一侧：'l' 左、'r' 右、't' 上、'b' 下
function wipe(e, t, o = {}) {
  const from = { l: 'inset(0% 100% 0% 0%)', r: 'inset(0% 0% 0% 100%)', t: 'inset(0% 0% 100% 0%)', b: 'inset(100% 0% 0% 0%)' }[o.dir || 'l'];
  tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(e, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: o.d || 0.6, ease: o.ease || 'power3.inOut', immediateRender: true }, t);
  return e;
}
// 擦除式退场：朝 dir 一侧收走
function wipeOut(e, t, o = {}) {
  const to_ = { l: 'inset(0% 100% 0% 0%)', r: 'inset(0% 0% 0% 100%)', t: 'inset(0% 0% 100% 0%)', b: 'inset(100% 0% 0% 0%)' }[o.dir || 'r'];
  tl.to(e, { clipPath: to_, duration: o.d || 0.45, ease: o.ease || 'power3.in' }, t);
  tl.set(e, { autoAlpha: 0 }, t + (o.d || 0.45));
}
// 砸入：从放大状态落到位，带过冲。用于大字、大数字、章节号
function slam(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 0, scale: o.from || 1.35 }, { autoAlpha: 1, scale: 1, duration: o.d || 0.45, ease: o.ease || 'back.out(2.2)', immediateRender: true }, t);
  return e;
}
// 滑入：从偏移处滑到位，带过冲。o.x / o.y 为起始偏移（px），例如 { x: -400 } 表示从左边 400px 处进来
function slide(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 0, x: o.x || 0, y: o.y || 0 }, { autoAlpha: 1, x: 0, y: 0, duration: o.d || 0.6, ease: o.ease || 'back.out(1.4)', immediateRender: true }, t);
  return e;
}
// 滑出退场：o.x / o.y 为去向的偏移
function exit(e, t, o = {}) {
  tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y || 0, duration: o.d || 0.4, ease: o.ease || 'power2.in', overwrite: 'auto' }, t);
}
// 瞬间出现 / 消失（终端里新输出的一行、换内容）
const appear = (e, t) => tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
const vanish = (e, t) => tl.set(e, { autoAlpha: 0 }, t);
