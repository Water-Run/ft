// 本片的部件：文档式标题与表格、psql 会话、文档提示框、标签、页结构图（仿 PostgreSQL 手册「页布局」一图的横向画法）、
// 行版本条、盖住整张大图的 SVG 画布、镜头轨迹。所有部件只在构建期建元素；动作由场景登记，状态只由 t 决定。
const D = window.PG_DATA;
const PH = D.physical, SNAP = PH.snapshots;
const CL = (s) => s.replace(/\s+/g, ' ').trim();
const Q = (t, g = 0.05) => Math.round(t / g) * g;
function txt(p, cls, html, x, y, w) { const e = h('div', CL('abs ' + cls), p, html); px(e, x, y); if (w) css(e, { width: w + 'px', whiteSpace: 'normal' }); else css(e, { whiteSpace: 'nowrap' }); return e; }

// ── 入场、退场与强调。全片不用擦除式的「刷」：淡入上移、弹出、描线、展开 ──
const fin = (e, t, o = {}) => tl.fromTo(e, { autoAlpha: 0, y: o.y != null ? o.y : 18, x: o.x || 0 }, { autoAlpha: 1, y: 0, x: 0, duration: o.d || 0.5, ease: o.ease || 'power2.out', immediateRender: true }, t);
const pop = (e, t, o = {}) => tl.fromTo(e, { autoAlpha: 0, scale: o.from || 0.7 }, { autoAlpha: 1, scale: 1, duration: o.d || 0.4, ease: 'back.out(1.6)', transformOrigin: o.origin || '50% 50%', immediateRender: true }, t);
const grow = (e, t, o = {}) => tl.fromTo(e, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: o.d || 0.6, ease: o.ease || 'power3.inOut', transformOrigin: o.origin || '0% 50%', immediateRender: true }, t);
const growY = (e, t, o = {}) => tl.fromTo(e, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: o.d || 0.6, ease: o.ease || 'power3.inOut', transformOrigin: o.origin || '50% 0%', immediateRender: true }, t);
const out = (e, t, d = 0.4) => tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, ease: 'power1.in', immediateRender: false }, t);
const dim = (e, t, a = 0.3, d = 0.5) => tl.fromTo(e, { opacity: 1 }, { opacity: a, duration: d, ease: 'power1.inOut', immediateRender: false }, t);
const beat = (e, t, k = 1.06) => tl.fromTo(e, { scale: 1 }, { keyframes: [{ scale: k, duration: 0.18, ease: 'power2.out' }, { scale: 1, duration: 0.32, ease: 'power2.inOut' }], immediateRender: false, transformOrigin: '50% 50%' }, t);
// 一段时间内可见（由 t 直接算），用于来回出现的标记
function during(e, a, b, fade = 0.3) {
  let last = null;
  F((t) => { const v = t < a || t >= b ? 0 : Math.min(1, (t - a) / fade, (b - t) / fade); const k = v.toFixed(3); if (k === last) return; last = k; e.style.opacity = k; e.style.visibility = v > 0 ? 'visible' : 'hidden'; });
}

// ── 文档式标题：蓝字，右侧一条装饰横线（postgresql.org 的 h2） ──
function heading(p, x, y, w, html, o = {}) {
  const e = h('div', CL('hd ' + (o.sm ? 'sm' : '')), p, `<span>${html}</span><span class="ln"></span>`); px(e, x, y, w);
  return e;
}
function showHeading(e, t) { const [a, ln] = e.children; fin(a, t, { y: 14 }); grow(ln, t + 0.15, { d: 0.7 }); tl.set(e, { autoAlpha: 1 }, 0); }

// ── 文档表格 ──
function dtable(p, x, y, head, rows, o = {}) {
  const tb = h('table', CL('dt ' + (o.cls || '')), p); px(tb, x, y);
  const thr = h('tr', '', tb); head.forEach((c) => h('th', '', thr, c));
  const trs = rows.map((r) => { const tr = h('tr', '', tb); r.forEach((c, i) => h('td', (o.num || []).includes(i) ? 'n' : '', tr, String(c))); return tr; });
  if (o.w) css(tb, { width: o.w + 'px' });
  return { el: tb, head: thr, trs };
}
function showTable(T_, t, step = 0.12) { fin(T_.el, t, { y: 12 }); T_.trs.forEach((tr, i) => tl.fromTo(tr, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: true }, t + 0.25 + i * step)); }

// ── psql 会话：提示符 postgres=#，回显照 psql 的对齐格式 ──
function psql(p, x, y, lines, o = {}) {
  const el = h('div', 'psql', p); px(el, x, y); if (o.w) css(el, { width: o.w + 'px' });
  el.dataset.name = 'psql';
  const rows = lines.map((ln) => h('div', '', el, ln || '&nbsp;'));
  return { el, rows };
}
const PR = '<span class="pr">postgres=#</span> ';

// ── 文档提示框 ──
const ADM_T = { note: '注意', tip: '提示', warning: '警告', caution: '小心' };
function adm(p, x, y, w, kind, html, title) { const e = h('div', 'adm ' + kind, p, `<span class="at">${title || ADM_T[kind]}</span>${html}`); px(e, x, y, w); return e; }

const tag = (p, x, y, html, cls = '') => txt(p, 'tag ' + cls, html, x, y);
const lbl = (p, x, y, html, cls = '') => txt(p, 'lbl ' + cls, html, x, y);
function blk(p, x, y, w, hh, cls = '', name) { const e = h('div', CL('blk ' + cls), p); px(e, x, y, w, hh); if (name) e.dataset.name = name; return e; }

// ── SVG 画布：盖住 world 里 [x0, x0+w] × [y0, y0+h]，坐标与 world 一致；自带各色箭头 ──
let GS_SEQ = 0;
function gsvg(world, x0, y0, w, hh, z = 0) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `${x0} ${y0} ${w} ${hh}` }, world);
  css(s, { left: x0 + 'px', top: y0 + 'px', overflow: 'visible', zIndex: z, pointerEvents: 'none' });
  s._seq = ++GS_SEQ;
  const defs = svg('defs', {}, s);
  for (const id in PALETTE) {
    const m = svg('marker', { id: `gm${s._seq}-${id}`, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M1,1 L9,5 L1,9 Z', fill: PALETTE[id], stroke: 'none' }, m);
  }
  return s;
}
const gline = (g, d, color = 'pg', o = {}) => { const e = svg('path', { d, fill: 'none', stroke: PALETTE[color] || color, 'stroke-width': o.w || 4, 'stroke-linecap': o.cap || 'butt', 'stroke-linejoin': 'round', ...(o.arrow ? { 'marker-end': `url(#gm${g._seq}-${color})` } : {}), ...(o.dashed ? { 'stroke-dasharray': o.dashed } : {}) }, g); if (o.name) e.dataset.name = o.name; return e; };
const grect = (g, x, y, w, hh, o = {}) => { const e = svg('rect', { x, y, width: w, height: hh, fill: o.fill || 'none', stroke: o.stroke ? (PALETTE[o.stroke] || o.stroke) : 'none', 'stroke-width': o.w || 3, ...(o.dashed ? { 'stroke-dasharray': o.dashed } : {}) }, g); if (o.name) e.dataset.name = o.name; return e; };
const gdot = (g, x, y, r, color = 'pg', o = {}) => { const e = svg('circle', { cx: x, cy: y, r, fill: o.hollow ? '#ffffff' : (PALETTE[color] || color), stroke: PALETTE[color] || color, 'stroke-width': o.w || 4 }, g); if (o.name) e.dataset.name = o.name; return e; };
// 描线：开始之前完全隐藏；虚线淡入
function drawIn(p, t, d = 0.8) {
  if (p.getAttribute('stroke-dasharray')) { tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, immediateRender: true }, t); return p; }
  const len = p.getTotalLength(); p.style.strokeDasharray = len + ' ' + len;
  tl.fromTo(p, { strokeDashoffset: len, autoAlpha: 0 }, { strokeDashoffset: 0, autoAlpha: 1, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
  return p;
}

// ── 页结构图：仿手册「页布局」一图，横向依次是页头、项目指针、空闲空间、行版本（从页尾往前放） ──
// 不按字节比例画（指针只有 4 字节），刻度上标出实测的偏移：0、24、lower、upper、8192。
// slots：画多少个指针/行版本的位置；state 决定哪些先画出来。返回各部分的元素与坐标，供场景登记动作。
const PG_W = { head: 150, lp: 52, tup: 118 };
function pageFig(p, g, x, y, o = {}) {
  const n = o.slots || 9, H = o.h || 132, W = o.w || 1800;
  const base = o.snap || SNAP.before;
  const fr = blk(p, x, y, W, H, '', '堆页 8192 字节');
  const hd = blk(p, x, y, PG_W.head, H, 'fill', '页头 24 字节'); css(hd, { borderColor: 'var(--pg-dk)', background: 'var(--pg-dk)' });
  const hdl = lbl(p, x + 26, y + H / 2 - 20, '页头', 'w');
  const lps = [], tups = [];
  for (let i = 0; i < n; i++) {
    const lx = x + PG_W.head + i * PG_W.lp;
    const e = blk(p, lx + 6, y + 18, PG_W.lp - 12, H - 36, 'fill', `项目指针 ${i + 1}`);
    const t_ = lbl(p, lx + PG_W.lp / 2 - 8, y + H + 14, String(i + 1), 'c'); css(t_, { fontSize: '26px', color: 'var(--pg)' });
    lps.push({ e, l: t_, x: lx + PG_W.lp / 2 });
  }
  // 行版本：第 i 个（lp i+1）的位置从页尾往前排
  for (let i = 0; i < n; i++) {
    const tx = x + W - (i + 1) * PG_W.tup;
    const r = (o.rows || base.rows)[i] || {};
    const e = blk(p, tx + 4, y + 10, PG_W.tup - 8, H - 20, 'wash', `行版本 ${i + 1}`);
    const nm = txt(e, 'lbl c', r.name ? r.name.trim() : '', 0, 22); css(nm, { width: (PG_W.tup - 14) + 'px', fontSize: '26px', fontFamily: '"Open Sans"' });
    const ag = txt(e, 'lbl c', r.age != null ? String(r.age) : '', 0, 62); css(ag, { width: (PG_W.tup - 14) + 'px', fontSize: '30px', fontFamily: '"Open Sans"', color: 'var(--ink)' });
    tups.push({ e, nm, ag, x: tx + PG_W.tup / 2 });
  }
  const freeX0 = x + PG_W.head + (o.lpShown || 8) * PG_W.lp, freeX1 = x + W - (o.tupShown || 8) * PG_W.tup;
  const free = blk(p, freeX0 + 10, y + 34, freeX1 - freeX0 - 20, H - 68, 'dash', '空闲空间'); css(free, { borderColor: 'var(--grey-lt)' });
  const fl = lbl(p, (freeX0 + freeX1) / 2 - 64, y + H / 2 - 20, '空闲空间', 'g');
  // 刻度
  const ticks = {};
  const tk = (key, xx, text) => { const l = txt(p, 'lbl mono', text, xx - 8, y - 46); css(l, { fontSize: '26px', fontWeight: 500, color: 'var(--mute)' }); const m = blk(p, xx - 1, y - 12, 2, 12, 'fill'); css(m, { borderWidth: '0', background: 'var(--grey)' }); ticks[key] = { l, m }; };
  tk('0', x, '0'); tk('24', x + PG_W.head, '24'); tk('lower', freeX0, String(base.lower)); tk('upper', freeX1, String(base.upper)); tk('end', x + W, '8192');
  // 空闲区很窄时，lower 的数字靠左、upper 的数字靠右，免得压在一起
  css(ticks.lower.l, { left: (freeX0 - 8 - 64) + 'px', width: '64px', textAlign: 'right' }); css(ticks.upper.l, { left: (freeX1 + 6) + 'px' });
  css(ticks.end.l, { left: (x + W - 64) + 'px' });
  return { fr, hd, hdl, lps, tups, free, fl, ticks, x, y, W, H, freeX0, freeX1 };
}

// ── 镜头 ──
function camGuard(world, t0, st) {
  F((t) => { if (t < t0) world.style.transform = `translate(960px, 540px) scale(${st.z}) translate(${-st.x}px, ${-st.y}px)`; });
}
// 镜头轨迹：只在站与站之间移动；两段移动之间补一段极慢的单向推近（每秒 0.4%，最多 3%），不左右晃
function camTrack(cam, world, start, keys, o = {}) {
  const RATE = o.rate != null ? o.rate : 0.012, ZMAX = o.zmax != null ? o.zmax : 0.07;
  const segs = []; let prevEnd = start.t;
  for (const [t, v, d = 1.2, op = {}] of keys) { const tt = t == null ? prevEnd + 0.15 : Math.max(t, prevEnd + 0.02); segs.push({ t: tt, v, d, op }); prevEnd = tt + d; }
  const outK = []; let cur = { ...start.v }; const Z0 = o.z || start.v.z || 1;
  { const a = start.t + 0.05, b = (segs.length ? segs[0].t : o.end) - 0.02; if (b - a > 1) { const dz = Math.min(ZMAX, RATE * (b - a)) * cur.z; outK.push([a, { z: cur.z + dz }, b - a, { ease: 'none', sfx: false }]); cur = { ...cur, z: cur.z + dz }; } }
  segs.forEach((sg) => { if (sg.v.z == null) sg.v = { ...sg.v, z: Z0 }; });   // 每次移动回到基准倍数，停留时的慢推不累积
  for (let i = 0; i < segs.length; i++) {
    const sgm = segs[i];
    outK.push([sgm.t, sgm.v, sgm.d, { ease: sgm.op.ease || 'power3.inOut', sfx: sgm.op.sfx === true ? undefined : false }]);
    cur = { ...cur, ...sgm.v };
    const gapStart = sgm.t + sgm.d + 0.02, gapEnd = (segs[i + 1] ? segs[i + 1].t : o.end) - 0.02;
    if (sgm.op.hold !== false && gapEnd - gapStart > 1) {
      const dz = Math.min(ZMAX, RATE * (gapEnd - gapStart)) * cur.z;
      outK.push([gapStart, { z: cur.z + dz }, gapEnd - gapStart, { ease: 'none', sfx: false }]);
      cur = { ...cur, z: cur.z + dz };
    }
  }
  camGuard(world, start.t, { x: 960, y: 540, z: 1, ...start.v });
  cam.track(start.t, start.v, outK);
}

// 章节卡盖着的那几秒，本场已有一条文档式的分隔细线在慢慢展开（扫描的静止检查不看常驻层，场景里要有内容在变）
function sceneRule(world, s) {
  const r = blk(world, 120, 104, 1680, 3, 'fill', '分隔线'); css(r, { borderWidth: '0', background: 'var(--rule)' });
  tl.fromTo(r, { scaleX: 0.05 }, { scaleX: 1, duration: Math.max(1, s.lead), ease: 'none', transformOrigin: '0% 50%', immediateRender: true }, s.start);
  return r;
}
