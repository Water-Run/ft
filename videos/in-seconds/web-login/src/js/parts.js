// 本集的部件：包豪斯的几何形状与它们在本片里固定的含义。所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。
// 图形语言（全片不破例）：红圆 = 你知道的（密码），蓝方 = 你拥有的（手机、设备），黄三角 = 你本身；黄色也是「关于你的声明」（用户名、权限）。
// 黑框 = 服务器（验证的一方）；盖章的票 = 会话，蓝色票根 = Session ID；三段色条 = JWT；单向压模 = 哈希；带齿的红钥匙 = passkey 的私钥，黑色锁块 = 公钥；
// 斜线 = 不可信的一方（偷来的副本、假网站）。形状的动作按 12 帧/秒步进（STEP），镜头连续。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const STEP = (d) => `steps(${Math.max(1, Math.round(d * 12))})`;      // 12 帧/秒的步进缓动
const zh = () => LANG === 'zh';
const F_ZH = '"Sans SC", "Inter"', F_EN = '"Inter", "Sans SC"';
const fontOf = (w, size) => `${w} ${size}px ${zh() ? F_ZH : F_EN}`;
// 一段文字：字号、字重、颜色一次给全
function word(parent, html, x, y, size, o = {}) {
  const e = txt(parent, o.cls || '', html, x, y);
  css(e, { font: o.font || fontOf(o.w || 800, size), color: o.color || C.ink, letterSpacing: o.ls != null ? o.ls : (size >= 96 ? '-.04em' : '-.01em'), lineHeight: o.lh || '1.05' });
  if (o.name) e.dataset.name = o.name;
  return e;
}
const mono = (parent, html, x, y, size, o = {}) => word(parent, html, x, y, size, { ...o, font: `${o.w || 700} ${size}px "Mono"`, ls: o.ls || '0' });

// ── 形状：SVG 画在一个绝对定位的方盒里，盒子可以整体补间（位移、缩放、旋转） ──
// kind：'circle' | 'square' | 'tri'（尖朝上）| 'half'（左半圆）
function shape(parent, kind, x, y, s, color, o = {}) {
  const e = h('div', 'abs', parent); px(e, x, y, s, s);
  const g = svg('svg', { width: s, height: s, viewBox: `0 0 ${s} ${s}` }, e);
  if (kind === 'circle') svg('circle', { cx: s / 2, cy: s / 2, r: s / 2, fill: color }, g);
  else if (kind === 'square') svg('rect', { x: 0, y: 0, width: s, height: s, fill: color }, g);
  else if (kind === 'tri') svg('polygon', { points: `${s / 2},0 ${s},${s} 0,${s}`, fill: color }, g);
  else if (kind === 'half') svg('path', { d: `M${s / 2},0 A${s / 2},${s / 2} 0 0 0 ${s / 2},${s} Z`, fill: color }, g);
  e.dataset.name = o.name || kind;
  if (o.bleed) e.dataset.bleed = '1';
  return e;
}

// ── 黑框：服务器。上沿外侧写域名（Mono），框内留给它记住的东西 ──
function frame(parent, x, y, w, hh, o = {}) {
  const e = h('div', 'abs', parent); px(e, x, y, w, hh);
  css(e, { border: `${o.bw || 14}px solid ${o.color || C.ink}`, boxSizing: 'border-box', background: o.fill || 'transparent' });
  e.dataset.name = o.name || 'server';
  let lab = null;
  if (o.label) { lab = mono(parent, o.label, x, y - (o.labelSize || 30) - 14, o.labelSize || 30, { color: o.color || C.ink }); }
  return { el: e, lab, x, y, w, h: hh };
}

// ── 斜线块：不可信的一方（偷来的副本、假网站）。用 SVG 线条画，不用渐变 ──
function hatch(parent, x, y, w, hh, color, gap = 18, sw = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  for (let d = -hh; d < w; d += gap) svg('line', { x1: d, y1: hh, x2: d + hh, y2: 0, stroke: color, 'stroke-width': sw }, s);
  s.dataset.name = 'hatch';
  return s;
}

// ── 会话票：米白票面 + 蓝色票根。票面写「谁、能做什么、何时过期」，票根是 Session ID ──
function ticket(parent, x, y, w, hh, o = {}) {
  const e = h('div', 'abs', parent); px(e, x, y, w, hh);
  css(e, { background: C.paper, border: `6px solid ${C.ink}`, boxSizing: 'border-box' });
  e.dataset.name = 'session-ticket';
  const sw = o.stub || Math.round(w * 0.3);
  const stub = blk(e, 'bg-blue', w - 6 - sw, -6, sw, hh); stub.dataset.name = 'session-id-stub';
  return { el: e, stub, w, h: hh, sw };
}

// ── 三段色条：JWT。头部（墨底）、内容（黄底，关于你的声明）、签名（红底，用服务器的秘密算出来）；段与段之间是真正的点 ──
// parts: [[文本, 'ink'|'yel'|'red'], …]；返回各段元素与总宽
function jwtBar(parent, x, y, parts, o = {}) {
  const size = o.size || 30, padX = o.padX || 18, hh = o.h || 64, dot = o.dot || 26;
  const segs = []; let cx = x;
  parts.forEach(([s, col], i) => {
    const bg = col === 'ink' ? C.ink : col === 'yel' ? C.yel : C.red, fg = col === 'yel' ? C.ink : C.paper;
    const e = mono(parent, esc(s), cx, y, size, { color: fg }); css(e, { background: bg, padding: `0 ${padX}px`, height: hh + 'px', lineHeight: hh + 'px' });
    e.dataset.name = ['jwt-header', 'jwt-payload', 'jwt-signature'][i] || 'jwt-part';
    segs.push(e); cx += e.offsetWidth;
    if (i < parts.length - 1) { const d = mono(parent, '.', cx, y, size, { color: C.ink }); css(d, { width: dot + 'px', textAlign: 'center', height: hh + 'px', lineHeight: hh + 'px' }); d.dataset.name = 'jwt-dot'; segs.push(d); cx += dot; }
  });
  return { segs, w: cx - x, h: hh };
}

// ── 压模：哈希。一个黑色压机，顶板落下时把进去的形状压成另一种形状；只有一个方向 ──
function press(parent, x, y, w, hh) {
  const body = frame(parent, x, y, w, hh, { bw: 16, name: 'hash-press' });
  const plate = blk(parent, 'bg-ink', x + 16, y + 16, w - 32, 34); plate.dataset.name = 'press-plate';
  return { body, plate, x, y, w, h: hh };
}
// 顶板在 t 落下、0.25 秒后抬起（步进），同时登记一声木块的实音
function pressDown(p, t, depth) {
  fromTo(p.plate, t, { y: 0 }, { keyframes: [{ y: depth, duration: 0.17, ease: STEP(0.17) }, { y: 0, duration: 0.33, ease: STEP(0.33) }], immediateRender: false });
  sfx('thud', t + 0.16, { g: 0.75 });
}

// ── 红钥匙（passkey 的私钥）：一条带齿的红色键柄；黑色锁块（公钥）是它的反形，拼得上才算验过 ──
// teeth：齿的高度序列（0–1），两者用同一组数，形状互补
function keyShape(parent, x, y, w, hh, teeth, color = C.red) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  const n = teeth.length, tw = w * 0.62 / n, base = hh * 0.55;
  let d = `M0,${hh} L0,${hh * 0.25} L${w * 0.38},${hh * 0.25} `;
  teeth.forEach((k, i) => { const x0 = w * 0.38 + i * tw, top = base - k * (base - hh * 0.05); d += `L${x0},${top} L${x0 + tw},${top} `; });
  d += `L${w},${hh} Z`;
  svg('path', { d, fill: color }, s);
  s.dataset.name = 'private-key';
  return s;
}
function lockShape(parent, x, y, w, hh, teeth, color = C.ink) {
  // 锁块：与钥匙同宽，下沿刻出钥匙的反形
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  const n = teeth.length, tw = w * 0.62 / n, cut = hh * 0.45;
  let d = `M0,0 L${w},0 L${w},${hh} `;
  for (let i = n - 1; i >= 0; i--) { const x0 = w * 0.38 + i * tw, dep = hh - teeth[i] * cut; d += `L${x0 + tw},${dep} L${x0},${dep} `; }
  d += `L${w * 0.38},${hh} L0,${hh} Z`;
  svg('path', { d, fill: color }, s);
  s.dataset.name = 'public-key';
  return s;
}

// ── 一行 HTTP：Mono，方法加粗；可带一张蓝色票根（这一行带着 Cookie） ──
function httpLine(parent, html, x, y, size = 34, o = {}) {
  const e = mono(parent, html, x, y, size, { color: o.color || C.ink, w: o.w || 700 });
  if (o.bg) css(e, { background: o.bg, padding: '6px 14px' });
  e.dataset.name = o.name || 'http';
  return e;
}

// ── 盖章：一个红框的方章，啪地落下（1 帧过冲），登记一声 pop ──
function stamp(parent, html, x, y, size, t, o = {}) {
  const e = mono(parent, html, x, y, size, { color: o.color || C.red, w: 800 });
  css(e, { border: `${o.bw || 6}px solid ${o.color || C.red}`, padding: '6px 16px', transform: `rotate(${o.r != null ? o.r : -8}deg)` });
  e.dataset.name = o.name || 'stamp'; e.dataset.overlapOk = '1';
  tl.fromTo(e, { autoAlpha: 0, scale: 1.6, rotation: o.r != null ? o.r : -8 }, { autoAlpha: 1, scale: 1, rotation: o.r != null ? o.r : -8, duration: 0.17, ease: 'steps(2)', immediateRender: true }, t);
  sfx('pop', t + 0.08, { g: 0.8, p: o.p || 0 });
  return e;
}

// ── 拒绝：形状转 90° 拼不上，留一条黑缝；登记一声 error ──
function reject(e, t, o = {}) {
  to(e, t, { rotation: o.r != null ? o.r : 90, duration: 0.33, ease: STEP(0.33) });
  sfx('error', t + 0.1, { g: o.g != null ? o.g : 0.8, p: o.p || 0 });
}

// ── 区间显隐：到 a 出现、到 b 消失，由 t 直接算（倒着跳也对） ──
function during(e, a, b) {
  let last = null;
  F((t) => { const on = t >= a && t < b; if (on !== last) { e.style.visibility = on ? 'visible' : 'hidden'; last = on; } });
}
