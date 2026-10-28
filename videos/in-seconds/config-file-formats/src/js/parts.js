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

// ── 本集：构成主义海报的部件 ──
// 巨字：一个字母一个 span，字号按 grow 逐个放大，按基线排开；整组斜放，允许出画（被画框裁掉）
function giant(parent, word, o) {
  const g = h('div', 'abs giant ' + (o.cls || ''), parent); px(g, o.x, o.y);
  const letters = [...word].map((ch, i) => { const e = h('span', '', g, ch === ' ' ? '&nbsp;' : esc(ch)); e.style.fontSize = (o.size * Math.pow(o.grow || 1.22, i)).toFixed(0) + 'px'; return e; });
  gsap.set(g, { rotation: o.rot || 0, transformOrigin: '0% 100%', yPercent: -100 });
  g.dataset.overlapOk = '1';
  return { g, letters };
}
// 巨字逐个砸下：每个字母比上一个晚 gap 秒
function giantIn(G, t, gap = 0.09) {
  G.letters.forEach((e, i) => { slam(e, t + i * gap, { from: 1.6, d: 0.32, ease: 'power4.out' }); });
  sfx('thud', t, { g: 0.9, p: -0.4 }); sfx('thud', t + (G.letters.length - 1) * gap, { g: 0.7, p: -0.2 });
}
// 斜线：一条有宽度的平涂长条，从起点向终点「切」出来
function slash(parent, x1, y1, x2, y2, w, cls) {
  const len = Math.hypot(x2 - x1, y2 - y1), e = blk(parent, cls, x1, y1 - w / 2, len, w);
  gsap.set(e, { rotation: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, transformOrigin: '0% 50%' });
  e.dataset.overlapOk = '1';
  return e;
}
const cut = (e, t, d = 0.35) => { tl.fromTo(e, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: d, ease: 'power4.inOut', immediateRender: true }, t); sfx('whoosh', t, { g: 0.6, p: 0.3 }); return e; };
// 平涂多边形（整幅 SVG）；pts 是 [[x, y], …]
function poly(parent, pts, fill) {
  const s = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, parent); px(s, 0, 0);
  svg('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: COL[fill] || fill }, s);
  s.dataset.overlapOk = '1';
  return s;
}
// 盖印：略放大落下、无过冲，配一声闷响
function stamp(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 0, scale: o.from || 1.18 }, { autoAlpha: 1, scale: 1, duration: o.d || 0.16, ease: 'power2.in', immediateRender: true }, t); sfx(o.sfx || 'thud', t + (o.d || 0.16), { g: o.g || 0.6, p: o.p || 0.2 }); return e; }
// 一组元素整体退场：沿斜线方向收走
const clearOut = (e, t) => { tl.to(e, { autoAlpha: 0, x: -80, duration: 0.3, ease: 'power3.in' }, t); };
// 代码块
const code = (parent, html, x, y, size, cls = '') => { const e = txt(parent, 'code ' + cls, html, x, y); e.style.fontSize = size + 'px'; return e; };
const tag = (parent, cls, html, x, y) => txt(parent, 'tag ' + cls, html, x, y);
// 字数条：n 个字符，每字符 u 像素，从左长出；数字随条一起数上去
function countBar(parent, x, y, n, u, cls, label, t) {
  const b = blk(parent, cls, x, y, n * u, 46);
  const l = txt(parent, 'bar-l', '', x + n * u + 20, y + 2);
  tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.6, ease: 'power3.out', immediateRender: true }, t);
  countTo(l, 0, n, t, 0.6, (v) => label + ' ' + Math.round(v)); appear(l, t);
  return { b, l };
}
// 油墨纸纹：固定种子的噪点与纤维，画一次冻结成图，盖在画面上（正片叠底）
function paperGrain() {
  const c = document.createElement('canvas'); c.width = 1920; c.height = 968; c.className = 'grain';
  const g = c.getContext('2d'), r = seeded(1917);
  for (let i = 0; i < 26000; i++) { const a = r(); g.fillStyle = a < 0.5 ? 'rgba(27,24,22,0.10)' : 'rgba(120,96,60,0.07)'; g.fillRect(r() * 1920, r() * 968, 1 + r() * 2.2, 1 + r() * 2.2); }
  g.strokeStyle = 'rgba(120,96,60,0.06)'; g.lineWidth = 1;
  for (let i = 0; i < 700; i++) { const x = r() * 1920, y = r() * 968, a = r() * Math.PI, l = 6 + r() * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(233,224,204,0.35)'; g.fillRect(r() * 1920, r() * 968, 2 + r() * 10, 1 + r() * 2); }   // 漏墨的白点
  document.getElementById('hud').prepend(c);
  freeze(c).className = 'grain';
}
