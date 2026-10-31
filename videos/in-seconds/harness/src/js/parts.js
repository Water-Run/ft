// 系列共用的部件：小工具、斜线块、字节格、比特格、日历换算。与题目有关的部件（首集的验证码与 30 秒表盘）写在各集自己的 parts.js 里。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const backOut = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

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
    e.style.setProperty('--c', o.color);                                    // 颜色放在变量里：加上类名 hot 即变成朱红，不必换元素
    css(e, c === '1' ? { background: 'var(--c)' } : { border: `${o.bw || 4}px solid var(--c)` });
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
