// 本片的部件：窗口、设备图标、数据包、比特格、四格地址框、沿路径移动。所有部件的状态只由 t 决定：用登记函数或 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const bin8 = (n) => n.toString(2).padStart(8, '0');
const bits32 = (octs) => octs.map(bin8).join('');

// ── 窗口：凸起的银灰框、藏青标题栏、右上角关闭钮；body 是内容区（sunken 时为白色凹框）──
function makeWin(parent, x, y, w, hh, title, o = {}) {
  const el = h('div', 'win raised' + (o.idle ? ' idle' : ''), parent); px(el, x, y, w, hh);
  h('div', 'in', el);
  const tb = h('div', 'tb', el, `<span class="tt">${title}</span><span class="x raised">×</span>`);
  const body = h('div', 'body' + (o.sunken ? ' sunken' : ''), el);
  el.dataset.name = '窗口';
  return { el, tb, body, title: tb.firstChild, rect: [x, y, w, hh] };
}
// 打开窗口：外框从 from 放大到窗口的位置（0.25 秒），然后窗口出现
function openWin(win, t, from, o = {}) {
  zoomFx(t, from, win.rect, 0.25);
  appear(win.el, t + 0.25);
  if (o.sfx !== false) sfx(o.sound || 'drive', t, { g: o.g == null ? 0.55 : o.g, p: o.p || 0 });
  return t + 0.25;
}
// 内容区里的坐标 → 舞台坐标（窗口边框 6、标题栏 62）
const inBody = (win, x, y) => [win.rect[0] + 6 + x, win.rect[1] + 62 + y];

// ── 设备图标 ──
function pcIcon(parent, x, y, s = 1) {
  const e = h('div', 'pc', parent); px(e, x, y, 110 * s, 104 * s);
  const mon = h('div', 'mon raised', e); px(mon, 0, 0, 110 * s, 84 * s);
  const scr = h('div', 'scr', mon); px(scr, 10 * s, 9 * s, 84 * s, 58 * s);
  const base = h('div', 'base', e); px(base, 30 * s, 86 * s, 50 * s, 16 * s);
  e.dataset.name = '电脑';
  return e;
}
function routerIcon(parent, x, y, s = 1) {
  const e = h('div', 'rt', parent); px(e, x, y, 150 * s, 90 * s);
  const a1 = h('div', 'ant', e); px(a1, 22 * s, 0, 6 * s, 46 * s);
  const a2 = h('div', 'ant', e); px(a2, 122 * s, 0, 6 * s, 46 * s);
  const b = h('div', 'bodyr raised', e); px(b, 0, 44 * s, 150 * s, 46 * s);
  for (let i = 0; i < 3; i++) { const l = h('div', 'led', b); px(l, (20 + i * 22) * s, 14 * s, 10 * s, 10 * s); }
  e.dataset.name = '路由器';
  return e;
}

// ── 数据包 ──
function packet(parent, html, o = {}) {
  const e = h('div', 'pkt' + (o.light ? ' light' : ''), parent, html);
  e.dataset.name = '数据包';
  return e;
}
// 沿关键点移动：keys = [[t, x, y], …]，两点之间按 io3 缓动；show / hide 之外不显示。位置只由 t 算出
function moveAlong(el, keys, show, hide) {
  let last = '';
  F((t) => {
    const vis = t >= show - 1e-6 && t < hide;
    let x = keys[0][1], y = keys[0][2];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
      if (t >= t1) { x = x1; y = y1; continue; }
      if (t > t0) { const k = ease.io3(clamp((t - t0) / (t1 - t0))); x = lerp(x0, x1, k); y = lerp(y0, y1, k); }
      break;
    }
    const key = vis ? x.toFixed(1) + ',' + y.toFixed(1) : 'none';
    if (key !== last) { if (vis) { el.style.display = ''; el.style.left = x.toFixed(1) + 'px'; el.style.top = y.toFixed(1) + 'px'; } else el.style.display = 'none'; last = key; }
  });
}

// ── 比特格：一行 32 位，每 8 位一组 ──
// o: { w, hh, gap, group, size }
function bitRow(parent, bits, x, y, o = {}) {
  const w = o.w || 26, hh = o.hh || 58, gap = o.gap || 2, group = o.group || 16, out = [];
  [...bits].forEach((b, i) => {
    const e = h('div', 'bit sunken', parent, b);
    px(e, x + i * (w + gap) + Math.floor(i / 8) * group, y, w, hh);
    if (o.size) css(e, { fontSize: o.size + 'px', lineHeight: (hh - 6) + 'px' });
    out.push(e);
  });
  out.groupX = (g) => x + g * 8 * (w + gap) + g * group;          // 第 g 组左缘
  out.groupW = 8 * (w + gap) - gap;
  out.cellX = (i) => x + i * (w + gap) + Math.floor(i / 8) * group;
  out.w = w; out.hh = hh;
  return out;
}

// ── 四格地址框：[192].[168].[1].[10]，可再接一个 /24 ──
function octBox(parent, x, y, octs, o = {}) {
  const e = h('div', 'octbox', parent); px(e, x, y);
  const cells = octs.map((v, i) => { const c = h('span', 'oct sunken', e, v == null ? '' : String(v)); if (i < 3) h('span', 'dot', e, '.'); return c; });
  const pre = o.prefix ? h('span', 'pre', e, o.prefix) : null;
  if (o.w) cells.forEach((c) => css(c, { width: o.w + 'px' }));
  return { el: e, cells, pre };
}

// ── 带序的列表行（关于对话框、私有地址表）──
function listRow(parent, k, v) { return h('div', 'row', parent, `<span class="k">${k}</span>${v}`); }
function phoneIcon(parent, x, y, s = 1) {
  const e = h('div', 'pc', parent); px(e, x, y, 56 * s, 96 * s);
  const mon = h('div', 'mon raised', e); px(mon, 0, 0, 56 * s, 96 * s);
  const scr = h('div', 'scr', mon); px(scr, 6 * s, 8 * s, 38 * s, 64 * s);
  e.dataset.name = '手机';
  return e;
}

// ── 第 5 轮：网络图用的小工具 ──
// 只在 [t0, t1) 内显示（用 display，与 GSAP 管的透明度互不干扰）
function span(el, t0, t1 = Infinity) {
  let last = null;
  F((t) => { const on = t >= t0 - 1e-6 && t < t1; if (on !== last) { el.style.display = on ? '' : 'none'; last = on; } });
  return el;
}
// 沿折线走：legs = [[t0, t1, [[x, y], …]], …]，每段在 [t0, t1] 内按路程匀速走完（两头缓动），段与段之间停在终点。
// (x, y) 是元素中心；show/hide 之外不显示。位置只由 t 算出。
function glide(el, legs, show, hide, w = 40, hh = 30) {
  const LG = legs.map(([t0, t1, pts]) => {
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    return { t0, t1, pts, seg, tot };
  });
  const at = (lg, k) => {
    let s = k * lg.tot;
    for (let i = 0; i < lg.seg.length; i++) {
      if (s <= lg.seg[i] || i === lg.seg.length - 1) { const f = lg.seg[i] ? clamp(s / lg.seg[i]) : 1; return [lerp(lg.pts[i][0], lg.pts[i + 1][0], f), lerp(lg.pts[i][1], lg.pts[i + 1][1], f)]; }
      s -= lg.seg[i];
    }
    return lg.pts[lg.pts.length - 1];
  };
  let last = '';
  F((t) => {
    const vis = t >= show - 1e-6 && t < hide;
    let p = LG[0].pts[0];
    for (const lg of LG) {
      if (t >= lg.t1) { p = lg.pts[lg.pts.length - 1]; continue; }
      if (t > lg.t0) p = at(lg, ease.io3(clamp((t - lg.t0) / (lg.t1 - lg.t0))));
      break;
    }
    const key = vis ? p[0].toFixed(1) + ',' + p[1].toFixed(1) : 'none';
    if (key === last) return; last = key;
    if (!vis) { el.style.display = 'none'; return; }
    el.style.display = ''; el.style.left = (p[0] - w / 2).toFixed(1) + 'px'; el.style.top = (p[1] - hh / 2).toFixed(1) + 'px';
  });
  return el;
}
// 折线 → SVG 路径
const pathD = (pts) => 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ');
// 走过的路亮起来：沿同一条折线描一道藏青粗线，从 t0 描到 t1，到 tOff 收掉
function litPath(ov, pts, t0, t1, tOff = Infinity) {
  const p = path(ov, pathD(pts), 'navy', { w: 8, arrow: false });
  arrowIn(p, t0, Math.max(0.05, t1 - t0));
  if (tOff < Infinity) vanish(p, tOff);
  return p;
}
// 地址标签：前一截与后一截分开的两个 span（前一截可整体反白，后一截可单独标记）
function addrLab(parent, net, host, cx, y, bounds) {
  const e = h('div', 'alab', parent, `<span class="pre">${net}</span><span class="host">${host}</span>`);
  const w = e.offsetWidth || (net.length + host.length) * 14;
  let x = cx - w / 2;
  if (bounds) x = clamp(x, bounds[0], bounds[1] - w);
  px(e, Math.round(x), y);
  return { el: e, pre: e.firstChild, host: e.lastChild, w, x };
}
// 居中放一段文字
function ctxt(parent, cls, html, cx, y) { const e = txt(parent, cls, html, 0, y); px(e, Math.round(cx - e.offsetWidth / 2), y); return e; }
// 大号四格地址：[203].[0].[113].[80]
function bigAddr(parent, x, y, vals, o = {}) {
  const e = h('div', 'ob', parent); px(e, x, y);
  const cells = [], dots = [];
  vals.forEach((v, i) => { cells.push(h('span', 'c sunken', e, String(v))); if (i < 3) dots.push(h('span', 'd', e, '.')); });
  if (o.small) e.classList.add('sm');
  return { el: e, cells, dots };
}
// 类名开关：同一元素的同一类名可以登记好几段时间窗，合在一个逐帧函数里算（分开登记的 classAt 在跳播时会互相抵消）
const CLASS_WIN = new Map();
function classOn(el, cls, t0, t1 = Infinity) {
  let m = CLASS_WIN.get(el); if (!m) { m = {}; CLASS_WIN.set(el, m); }
  if (!m[cls]) {
    const wins = m[cls] = [];
    let last = null;
    F((t) => { const on = wins.some(([a, b]) => t >= a - 1e-6 && t < b); if (on !== last) { el.classList.toggle(cls, on); last = on; } });
  }
  m[cls].push([t0, t1]);
  return el;
}
// 只动缩放的「跳一下」：逐帧算 CSS 的 scale 属性（不经 GSAP，跳播时不会停在起始缩放；也不碰 GSAP 管的 transform 与透明度）
function pulse(el, t0, from = 1.12, d = 0.3) {
  if (!el._pulses) {
    const P = el._pulses = [];
    let last = '';
    F((t) => {
      let sc = 1;
      for (const [a, f, dd] of P) if (t >= a && t < a + dd) sc = 1 + (f - 1) * Math.pow(1 - (t - a) / dd, 3);
      const v = sc === 1 ? '' : sc.toFixed(4);
      if (v !== last) { el.style.scale = v; last = v; }
    });
  }
  el._pulses.push([t0, from, d]);
  return el;
}
// 在若干段时间里藏起来（例如被整窗口大的对话框盖住时，把底下的网络图层藏掉）
function hideWin(el, t0, t1) {
  if (!el._hide) {
    const W = el._hide = [];
    let last = null;
    F((t) => { const off = W.some(([a, b]) => t >= a - 1e-6 && t < b); if (off !== last) { el.style.visibility = off ? 'hidden' : ''; last = off; } });
  }
  el._hide.push([t0, t1]);
  return el;
}
// 只换内容、不碰类名的关键帧（util.js 的 keyed() 换内容时会把类名一并重置，和 classOn 加的类名冲突）
function htmlAt(el, t0, html) {
  if (!el._ht) {
    const fr = el._ht = [], base = el.innerHTML;
    let last = null;
    F((t) => { let v = base; for (const [a, x] of fr) if (t >= a - 1e-6) v = x; if (v !== last) { if (el.innerHTML !== v) el.innerHTML = v; last = v; } });
  }
  el._ht.push([t0, html]); el._ht.sort((a, b) => a[0] - b[0]);
  return el;
}
