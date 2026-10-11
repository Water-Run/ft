// 本片的部件：面板、页块、记录条、SQL 条、文件与日志图标、锁、被锁的空隙、标签、文献卡、盖住整张大图的 SVG 画布。
// 画法取自 MySQL 9.7 手册的 InnoDB 架构图（见 css/style.css 开头）。所有部件只在构建期建元素；动作由场景登记，状态只由 t 决定。
const D = window.INNODB_DATA;
// 类名去掉多余空格：classList 切换时会把它规范化，不先规范，顺播与跳播的类名就不一样
const CL = (s) => s.replace(/\s+/g, ' ').trim();
const txt = (p, cls, html, x, y) => { const e = h('div', CL('abs ' + cls), p, html); px(e, x, y); return e; };
const blk = (p, cls, x, y, w, hh) => { const e = h('div', CL('blk ' + cls), p); px(e, x, y, w, hh); return e; };
const Q = (t, g = 0.05) => Math.round(t / g) * g;                // 动作吸附到 0.05 秒的格点
const sp = (n) => '&nbsp;'.repeat(n);
const pad = (s, n) => String(s).padEnd(n, ' ').replace(/ /g, '&nbsp;');

// ── 入场与强调：淡入并上移一点；弹出；一次轻的强调（放大再回落）。不用擦除 ──
const fin = (e, t, o = {}) => fromTo(e, t, { autoAlpha: 0, y: o.y != null ? o.y : 16 }, { autoAlpha: 1, y: 0, duration: o.d || 0.5, ease: o.ease || 'power2.out' });
const pop = (e, t, o = {}) => fromTo(e, t, { autoAlpha: 0, scale: o.from || 0.6 }, { autoAlpha: 1, scale: 1, duration: o.d || 0.4, ease: 'back.out(1.7)', transformOrigin: o.origin || '50% 50%' });
const beat = (e, t, k = 1.06) => tl.fromTo(e, { scale: 1 }, { keyframes: [{ scale: k, duration: 0.18, ease: 'power2.out' }, { scale: 1, duration: 0.32, ease: 'power2.inOut' }], immediateRender: false, transformOrigin: '50% 50%' }, t);
const out = (e, t, d = 0.35) => tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, ease: 'power1.in', immediateRender: false }, t);

// 面板：圆角浅色框，左上是面板标题。o.cls：'hot' 标志蓝描边、'warn' 橙色描边、'sketch' 虚线（示意）
function panel(p, x, y, w, hh, title, o = {}) {
  const el = h('div', CL('panel ' + (o.cls || '')), p); px(el, x, y, w, hh); el.dataset.name = o.name || 'panel';
  const tt = title ? txt(p, 'ptl ' + (o.tcls || ''), title, x + 32, y + 22) : null;
  return { el, tt, x, y, w, h: hh };
}
const showPanel = (P_, t) => { fin(P_.el, t, { y: 24, d: 0.55 }); if (P_.tt) fin(P_.tt, t + 0.15, { y: 10 }); };
const tile = (p, x, y, w, hh, cls = '') => { const e = h('div', CL('tile ' + cls), p); px(e, x, y, w, hh); return e; };
function row(p, x, y, w, html, cls = '') { const e = h('div', CL('row ' + cls), p, html); px(e, x, y, w); return e; }
function sql(p, x, y, w, text) { const e = h('div', 'sql', p, ''); px(e, x, y, w); e._text = text; return e; }
const typeSql = (e, t, cps = 40) => typeText(e, esc(e._text), t, cps, { cursor: false, sfxGain: 0.3 });
// 文件图标：折角的白纸，里面几道短线；label 写在下面
function fileIcon(p, x, y, w, hh, o = {}) {
  const e = h('div', 'file' + (o.inpanel ? ' inpanel' : ''), p); px(e, x, y, w, hh);
  (o.lines || [0.6, 0.75, 0.5]).forEach((k, i) => { const l = h('i', '', e); css(l, { top: (0.3 * hh + i * 26) + 'px', width: Math.round((w - 40) * k) + 'px' }); });
  if (o.tag) h('b', 'tag', e, o.tag);
  const lab = o.label ? txt(p, 'mono t-s dim', o.label, x, y + hh + 14) : null;
  return { e, lab };
}
const lockBadge = (p, x, y) => { const e = h('div', 'lock', p); px(e, x, y); e.dataset.name = 'lock'; return e; };
const gapBox = (p, x, y, w, hh) => { const e = h('div', 'gap', p); px(e, x, y, w, hh); e.dataset.name = 'gap'; return e; };
const tag = (p, x, y, text, cls = '') => txt(p, 'tag ' + cls, text, x, y);
// 文献卡：年份（标志蓝大字）、英文原题（可含 <span class="hl">）、作者与出处；整体放在一块面板里
function litCard(p, x, y, w, o) {
  const P_ = panel(p, x, y, w, o.h || 420, null, { name: 'paper-card' });
  const yr = txt(p, 'yr', o.year, x + 40, y + 36);
  const ti = txt(p, 'ptitle', o.title, x + 44, y + 170); css(ti, { width: (w - 88) + 'px' });
  const me = txt(p, 'pmeta', o.meta, x + 46, y + 170 + (o.titleH || 110)); css(me, { width: (w - 88) + 'px' });
  return { P: P_, yr, ti, me };
}
function showCard(c, t) { showPanel(c.P, t); pop(c.yr, t + 0.15, { from: 0.8 }); fin(c.ti, t + 0.35); fin(c.me, t + 0.55); sfx('thud', t + 0.15, { g: 0.5 }); }

// 一个 SVG 画布：盖住 world 里 [x0, x0+w] × [y0, y0+h] 的范围，坐标与 world 一致
let GS_SEQ = 0;
function gsvg(world, x0, y0, w, hh, z = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `${x0} ${y0} ${w} ${hh}` }, world);
  css(s, { left: x0 + 'px', top: y0 + 'px', overflow: 'visible', zIndex: z, pointerEvents: 'none' });
  s._seq = ++GS_SEQ;
  const defs = svg('defs', {}, s);
  for (const id in C) {
    const m = svg('marker', { id: `gm${s._seq}-${id}`, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M1.5,1.5 L8.5,5 L1.5,8.5', fill: 'none', stroke: C[id], 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
  }
  return s;
}
const gline = (g, d, color = 'ink', o = {}) => svg('path', { d, fill: 'none', stroke: C[color] || color, 'stroke-width': o.w || 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...(o.arrow ? { 'marker-end': `url(#gm${g._seq}-${color})` } : {}), ...(o.dashed ? { 'stroke-dasharray': o.dashed } : {}) }, g);
// 描线：起点之前完全隐藏（引擎的 draw 在起点前就把线设为可见，圆头线帽会留下一个点）；虚线改为淡入
function drawIn(p, t, d = 0.9, o = {}) { if (o.dash) p.setAttribute('stroke-dasharray', o.dash); return arrowIn(p, t, d); }
// 锁住的范围：一圈橙色圆角细框（比方括号更接近架构图的画法）
function gring(g, x, y, w, hh, o = {}) { const r = svg('rect', { x, y, width: w, height: hh, rx: o.r || 14, fill: 'none', stroke: C[o.color || 'or'], 'stroke-width': o.w || 6 }, g); r.dataset.name = o.name || 'lock-ring'; return r; }

// 镜头的第一帧：轨迹第一段开始之前，每帧把镜头放回起点
function camGuard(world, t0, st) {
  F((t) => { if (t < t0) world.style.transform = `translate(960px, ${VH / 2}px) scale(${st.z}) translate(${-st.x}px, ${-st.y}px)`; });
}
// 镜头轨迹：cam.track 的包装。镜头只做两件事：在站与站之间移动；停留时单向、很慢地推近（不左右往复，免得分散注意力）。
// 原来写的慢推（ease 'none'）照原样保留；两段移动之间没有写慢推的空档，补一段每秒推近 rate（默认 0.2%）、最多 4% 的匀速推近。
// 任意 3 秒内的可见变化由内容的节拍（跟着旁白出现的高亮与标注）保证，不靠镜头。
function camTrack(cam, s, start, keys, o = {}) {
  const RATE = o.rate != null ? o.rate : 0.005, ZMAX = o.zmax != null ? o.zmax : 0.04;
  const segs = []; let prevEnd = s.start;
  for (const [t, v, d = 1.4, op = {}] of keys) { const tt = t == null ? prevEnd + 0.15 : t; segs.push({ t: tt, v, d, op }); prevEnd = tt + d; }
  const out = [];
  let now = s.start + 0.02, cur = { ...start };
  const fill = (until) => {
    const span = until - now;
    if (span > 0.6) { const tgt = { z: cur.z + Math.min(ZMAX, RATE * span) }; out.push([now, tgt, span, { ease: 'none', sfx: false }]); cur = { ...cur, ...tgt }; }
    now = Math.max(now, until);
  };
  for (const sg of segs) {
    fill(sg.t);
    const t0 = Math.max(sg.t, now);
    const v = sg.v.z == null ? { ...sg.v, z: start.z } : sg.v;      // 换站时缩放回到起点，停留时的慢推不累积
    out.push([t0, v, sg.d, sg.op]);
    cur = { ...cur, ...v }; now = t0 + sg.d;
  }
  fill(s.end + 0.2);
  cam.track(s.start, start, out);
}
