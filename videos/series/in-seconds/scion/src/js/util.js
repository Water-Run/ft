// 与具体视觉无关的小工具：关键帧式内容切换、SVG 叠加层与箭头、文本表格。
// 带样式的部件（终端、代码块、字节图、轨道图……）不在工具包里：每部片子按自己的视觉系统写，可参考已有视频的 src/js/（见 docs/engine.md）。

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
// 固定种子的随机数：const r = seeded(7); r() 得到 [0, 1) 的数。同一个种子每次构建都是同一串数，任意一帧才可复现；不要用 Math.random
function seeded(seed = 1) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

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

// ── 把画好的 canvas 换成 <img> ──
// 渲染时 canvas 层在场景显隐切换之后会丢瓦片，图片是普通的绘制内容，不会。载入是异步的：承诺放进 window.PENDING，
// 引擎在置 ready 之前等它们全部载入；decoding=sync 让解码与绘制同步，不会晚一帧。
window.PENDING = window.PENDING || [];
function freeze(c) {
  const img = new Image(); img.decoding = 'sync'; img.style.cssText = c.style.cssText;
  window.PENDING.push(new Promise((res) => { img.onload = res; img.onerror = res; }));
  img.src = c.toDataURL('image/png');
  c.replaceWith(img);
  return img;
}
