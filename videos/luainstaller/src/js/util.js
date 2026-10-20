// 与具体视觉无关的小工具：关键帧式内容切换、SVG 叠加层与箭头、文本表格。
// 终端、十六进制视图这类带样式的部件不在工具包里，见 myisam-video/src/js/components.js（参考实现）。

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
const COL = window.PALETTE || { ink: '#111111', accent: '#ff5a1f', dim: '#8a8a8a' };   // 箭头可用的颜色名，项目在 config.js 里设 window.PALETTE
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
function path(svgEl, d, color = 'orange', o = {}) {
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
