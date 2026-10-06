// 本片的部件：验证码（逐位滚动）、30 秒表盘、字节格、比特格、斜线块、时间轴上的日历换算。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const backOut = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const sp3 = (s) => s.slice(0, 3) + ' ' + s.slice(3);                 // 验证码按三位一组读
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ── 验证码：六个数字格。缺省显示「此刻」的验证码，每逢时间步交界逐位向上滚动换成下一个 ──
// o: { size, x, y, gap（两组之间的空，单位 em）, win（固定显示第几个时间步的验证码，不滚动）, color }
function makeCode(parent, o = {}) {
  const el = h('div', 'code', parent); px(el, o.x || 0, o.y || 0);
  css(el, { fontSize: o.size + 'px', height: o.size + 'px', ...(o.color ? { color: o.color } : {}) });
  el.dataset.name = 'code';
  const cells = [];
  for (let i = 0; i < 6; i++) {
    const c = h('div', 'cd', el); if (i === 3) c.style.marginLeft = (o.gap != null ? o.gap : 0.3) + 'em';
    cells.push([h('span', '', c), h('span', '', c)]);
  }
  let last = null;
  F((t) => {
    const k = o.win != null ? o.win : clamp(Math.floor((t + 1e-6) / PERIOD), 0, CODES.length - 1), B = k * PERIOD;
    for (let i = 0; i < 6; i++) {
      const p = o.win != null || k === 0 ? 1 : ease.out3(clamp((t - B - i * 0.035) / 0.28));
      const [a, b] = cells[i];
      if (p >= 1) { const key = k + ':' + i; if (a._k !== key) { a.textContent = CODES[k][i]; a.style.transform = ''; b.textContent = ''; a._k = key; b._k = null; } continue; }
      const key = k + '>' + i;
      if (a._k !== key) { a.textContent = CODES[k - 1][i]; b.textContent = CODES[k][i]; a._k = key; }
      a.style.transform = `translateY(${(-112 * p).toFixed(2)}%)`; b.style.transform = `translateY(${(112 * (1 - p)).toFixed(2)}%)`;
    }
  });
  return { el, cells: cells.map((c) => c[0].parentNode), w: (3.6 + (o.gap != null ? o.gap : 0.3)) * o.size };
}

// ── 30 秒表盘：30 道刻度，指针每秒跳一格（带一点过冲），走过的刻度变成朱红，每个时间步归零 ──
// o: { x, y（圆心，相对 parent）, r, sw（刻度线宽）, color, num（圆心下方显示剩余秒数）, numSize }
const dialAngle = (t) => { const s = Math.floor(t + 1e-6), f = t - s; return (s - 1 + (f >= 0.2 ? 1 : backOut(f / 0.2))) * (360 / PERIOD); };
function makeDial(parent, o) {
  const r = o.r, pad = r * 0.2, size = 2 * (r + pad);
  const s = svg('svg', { class: 'abs', width: size, height: size, viewBox: `${-r - pad} ${-r - pad} ${size} ${size}` }, parent);
  css(s, { left: (o.x - r - pad) + 'px', top: (o.y - r - pad) + 'px', overflow: 'visible' });
  s.dataset.name = 'dial';
  let base = o.color || C.paper, acc = C.ac;
  const sw = o.sw || Math.max(3, r * 0.022), ticks = [];
  for (let i = 0; i < PERIOD; i++) {
    const a = i * 2 * Math.PI / PERIOD, big = i % 5 === 0, r0 = r * (big ? 0.8 : 0.89);
    ticks.push(svg('line', { x1: r0 * Math.sin(a), y1: -r0 * Math.cos(a), x2: r * Math.sin(a), y2: -r * Math.cos(a), stroke: base, 'stroke-width': big ? sw * 1.8 : sw }, s));
  }
  const hand = svg('line', { x1: 0, y1: r * 0.2, x2: 0, y2: -r * 1.08, stroke: acc, 'stroke-width': sw * 1.5 }, s);
  const hub = svg('circle', { cx: 0, cy: 0, r: Math.max(3, r * 0.05), fill: acc }, s);
  let num = null;
  if (o.num) { num = h('div', 'abs num', parent); css(num, { left: (o.x - r) + 'px', top: (o.y + r * 0.2) + 'px', width: 2 * r + 'px', textAlign: 'center', fontSize: (o.numSize || r * 0.36) + 'px', color: base }); }
  let lastN = -1;
  F((t) => {
    hand.setAttribute('transform', `rotate(${dialAngle(t).toFixed(2)})`);
    const n = Math.floor(t + 1e-6) % PERIOD;
    if (n !== lastN) {
      for (let i = 0; i < PERIOD; i++) ticks[i].setAttribute('stroke', i >= 1 && i <= n ? acc : base);
      if (num) num.textContent = String(PERIOD - n);
      lastN = n;
    }
  });
  // 换色立即生效（不等下一帧）：否则换底色的那一帧刻度还是旧颜色，画面就依赖播放历史了
  return { el: s, num, setColor(b, a) { base = b; acc = a; hand.setAttribute('stroke', a); hub.setAttribute('fill', a); if (num) num.style.color = b; for (let i = 0; i < PERIOD; i++) ticks[i].setAttribute('stroke', i >= 1 && i <= lastN ? acc : base); } };
}

// ── 斜线块：不可信的一方（泄露的副本、假网站）。用 SVG 线条画，不用渐变 ──
function hatch(parent, x, y, w, hh, color, gap = 18, sw = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  for (let d = -hh; d < w; d += gap) svg('line', { x1: d, y1: hh, x2: d + hh, y2: 0, stroke: color, 'stroke-width': sw }, s);
  s.dataset.name = 'hatch';
  return s;
}

// ── 字节格：一排（或几排）十六进制字节。返回各格元素 ──
// o: { x, y, pitch, w, h, size, cols（每排几个）, rowGap, cls, idx（在上方标序号）, idxSize }
function byteCells(parent, bytes, o) {
  const cols = o.cols || bytes.length, out = [], idx = [];
  bytes.forEach((b, i) => {
    const cx = o.x + (i % cols) * o.pitch, cy = o.y + Math.floor(i / cols) * (o.rowGap || o.h);
    const e = h('div', 'byte ' + (o.cls || ''), parent, b); px(e, cx, cy, o.w, o.h); css(e, { fontSize: o.size + 'px', lineHeight: o.h + 'px' });
    out.push(e);
    if (o.idx) { const n = h('div', 'idx', parent, String(i)); px(n, cx, cy - (o.idxSize || 28) * 1.5, o.w); n.style.fontSize = (o.idxSize || 28) + 'px'; idx.push(n); }
  });
  out.idx = idx;
  return out;
}

// ── 比特格：实心 = 1，空心 = 0。每 8 个一组 ──
function bitCells(parent, bits, o) {
  const out = [];
  [...bits].forEach((c, i) => {
    const e = h('div', 'blk', parent); px(e, o.x + i * (o.s + o.gap) + Math.floor(i / 8) * (o.group || 0), o.y, o.s, o.s);
    css(e, c === '1' ? { background: o.color } : { border: `${o.bw || 4}px solid ${o.color}` });
    e.dataset.name = 'bit' + c;
    out.push(e);
  });
  return out;
}

// ── 日历换算（纯算术，不取系统时间）：公历日期 ↔ 自 1970-01-01 起的天数 ──
function daysFromCivil(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400), yoe = y - era * 400, doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1, doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function civilFromDays(z) {
  z += 719468;
  const era = Math.floor(z / 146097), doe = z - era * 146097, yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)), mp = Math.floor((5 * doy + 2) / 153), d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}
const unixOf = (y, m = 1, d = 1) => daysFromCivil(y, m, d) * 86400;
const two = (n) => String(n).padStart(2, '0');
const clockOf = (u, withSec = true) => { const s = ((u % 86400) + 86400) % 86400; return two(Math.floor(s / 3600)) + ':' + two(Math.floor(s / 60) % 60) + (withSec ? ':' + two(Math.floor(s) % 60) : ''); };
