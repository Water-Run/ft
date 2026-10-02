// 可复用的画面部件：终端、十六进制视图、括注、箭头、结果集

// ── 终端面板 ──
function terminal(parent, o) {
  const el = h('div', 'panel term', parent);
  px(el, o.x, o.y, o.w, o.h);
  const hd = h('div', 'panel-hd', el, `<span>${o.title || 'mysql'}</span><span class="r">${o.right || ''}</span>`);
  const bd = h('div', 'term-bd', el);
  if (o.fs) bd.style.fontSize = o.fs + 'px';
  if (o.lh) bd.style.lineHeight = o.lh;
  const api = {
    el, hd, bd,
    // 一行输出（HTML）；返回该行元素
    line(html, cls) { return h('div', cls || '', bd, html === '' ? '&nbsp;' : html); },
    // 带提示符的命令行，t0 起逐字敲出；返回 {el, end}
    cmd(html, t0, cps = 34, o2 = {}) {
      const row = h('div', '', bd);
      h('span', 'p', row, (o2.prompt || 'mysql&gt;') + ' ');
      const sp = h('span', '', row);
      const end = typeText(sp, html, t0, cps, { cursorUntil: o2.cursorUntil != null ? o2.cursorUntil : end0(html, t0, cps) + (o2.hold != null ? o2.hold : 0.25) });
      if (o2.appear !== false) tl.fromTo(row, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, immediateRender: true }, o2.appearAt != null ? o2.appearAt : t0 - 0.35);
      return { el: row, end };
    },
    // 一组输出行，t0 起像终端回显那样逐行出现
    out(lines, t0, o2 = {}) {
      const els = lines.map((s) => api.line(s, o2.cls || 'o'));
      tl.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, stagger: o2.stagger != null ? o2.stagger : 0.035, ease: 'none', immediateRender: true }, t0);
      return els;
    },
  };
  return api;
}
function end0(html, t0, cps) { return t0 + tokenize(html).filter((k) => k.ch).length / cps; }

// mysql 客户端风格的结果集（纯文本行）
function asciiTable(head, rows, alignRight = []) {
  const w = head.map((hd, i) => Math.max(String(hd).length, ...rows.map((r) => String(r[i]).length)));
  const sep = '+' + w.map((n) => '-'.repeat(n + 2)).join('+') + '+';
  const fmt = (r) => '| ' + r.map((v, i) => (alignRight[i] ? String(v).padStart(w[i]) : String(v).padEnd(w[i]))).join(' | ') + ' |';
  return [sep, fmt(head), sep, ...rows.map(fmt), sep];
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 十六进制视图 ──
// bytes: 十六进制字符串；o.cls(i) 返回第 i 个字节的着色类
function hexView(parent, hex, o = {}) {
  const cols = o.cols || 16;
  const el = h('div', 'hex abs', parent);
  if (o.x != null) px(el, o.x, o.y);
  if (o.fs) el.style.fontSize = o.fs + 'px';
  const n = hex.length / 2;
  const cells = [], rows = [], asc = [], offs = [];
  for (let r = 0; r * cols < n; r++) {
    const row = h('div', 'hex-row', el);
    if (o.rowH) row.style.height = o.rowH + 'px';
    rows.push(row);
    if (o.offsets !== false) offs.push(h('span', 'hex-off', row, ((o.base || 0) + r * cols).toString(16).padStart(o.offDigits || 8, '0')));
    for (let c = 0; c < cols && r * cols + c < n; c++) {
      const i = r * cols + c;
      const b = h('span', 'hex-b' + (o.gap8 !== false && c === 8 ? ' gap8' : ''), row, hex.substr(i * 2, 2));
      if (o.cw) { b.style.width = o.cw + 'px'; }
      if (o.cls) { const k = o.cls(i); if (k) b.classList.add(k); }
      cells.push(b);
    }
    if (o.ascii !== false) {
      const a = h('span', 'hex-asc', row);
      for (let c = 0; c < cols && r * cols + c < n; c++) {
        const v = parseInt(hex.substr((r * cols + c) * 2, 2), 16);
        asc.push(h('i', '', a, v >= 0x20 && v < 0x7f ? esc(String.fromCharCode(v)) : '·'));
      }
    }
  }
  return { el, cells, rows, asc, offs, n, cols, hex };
}
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
// 把某个字节在 t0 改写成新值（val 为 null 时只换着色），并跳一下
function pokeByte(hv, i, val, t0, cls, o = {}) {
  const cell = hv.cells[i];
  const baseCls = cell.className.replace(/\bf-\w+/g, '').replace(/\s+/g, ' ').trim();
  const kf = keyed(cell);
  kf.at(t0, { ...(val != null ? { html: val } : {}), ...(cls != null ? { cls: baseCls + ' ' + cls } : {}) });
  if (val != null && hv.asc[i]) { const v = parseInt(val, 16); keyed(hv.asc[i]).at(t0, { html: v >= 0x20 && v < 0x7f ? esc(String.fromCharCode(v)) : '·' }); }
  if (val != null && o.sfx !== false) sfx('tick', t0);
  if (o.pop !== false) tl.fromTo(cell, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t0);
}

// ── 括注：一段横向范围 + 文字 ──
function bracket(parent, x1, x2, y, cls, label, o = {}) {
  const g = h('div', 'abs ' + (cls || ''), parent);
  css(g, { left: 0, top: 0 });
  const b = h('div', 'brk' + (o.up ? ' up' : ''), g);
  px(b, x1, y, x2 - x1);
  const tg = h('div', 'tag', g, label);
  css(tg, { left: (x1 + x2) / 2 + 'px', top: (o.up ? y - 40 : y + 16) + 'px', transform: 'translateX(-50%)' });
  if (o.align === 'left') css(tg, { left: x1 + 'px', transform: 'none' });
  return g;
}

// ── SVG 叠加层与箭头 ──
// 每个叠加层自带一套箭头标记（id 带序号）：场景隐藏时其 <defs> 也随之失效，不能跨场景共用
let OV_SEQ = 0;
const COL = { orange: '#f29111', cyan: '#46cbe6', pale: '#9fdcea', red: '#ee6a55', mint: '#6fe0b6', dim: '#5d8794', sand: '#f1d98a' };
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
