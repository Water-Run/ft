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
