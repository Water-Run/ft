// 本片的部件：控制台（CLIENT、SERVER 与中间那条线）、过线的卡带、像素钥匙、关卡模块、文件卡、显像管。
// 视觉语言是卡带未来主义：平涂、方角、12 帧一步。所有状态只由 t 决定：用补间或 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const STEP = 0.2;                                          // 12 帧一步
const stepsOf = (d, step = STEP) => `steps(${Math.max(1, Math.round(d / step))})`;
// 开机闪烁：入场前不可见，0.2 秒内亮、暗、亮
const FLICK = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.2 ? 0.85 : k < 0.4 ? 0.15 : k < 0.6 ? 1 : k < 0.8 ? 0.45 : 1);
function flick(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: o.d || 0.2, ease: FLICK, immediateRender: true }, t);
  return e;
}
// 熄灭：亮、暗两下后消失
function flickOut(e, t, o = {}) {
  tl.to(e, { autoAlpha: 0, duration: o.d || 0.2, ease: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.3 ? 0.4 : k < 0.6 ? 0.9 : 1) }, t);
}
// 步进位移：从偏移处一格一格跳到位
function hop(e, t, o = {}) {
  const d = o.d || 0.6;
  tl.fromTo(e, { autoAlpha: 0, x: o.x || 0, y: o.y || 0 }, { autoAlpha: 1, x: 0, y: 0, duration: d, ease: stepsOf(d, o.step || 0.1), immediateRender: true }, t);
  return e;
}
// 一行回显：整行瞬间出现，配一声 blip
function line(e, t, o = {}) { appear(e, t); if (o.sfx !== false) sfx('blip', t, { g: o.g != null ? o.g : 0.55, p: o.p || 0 }); return e; }
// 一段时间内亮着（灯、格）
const litAt = (e, t0, t1 = Infinity, cls = 'on') => classAt(e, cls, t0, t1);
// 方块闪烁的光标
function blinkCursor(parent, x, y, w, hh, from, to_, color = 'var(--ac)') {
  const c = blk(parent, '', x, y, w, hh); c.style.background = color;
  let last = null;
  F((t) => { const v = t >= from && t < to_ ? (Math.floor((t - from) / 0.4) % 2 === 0 ? 1 : 0) : 0; if (v !== last) { c.style.opacity = v; last = v; } });
  return c;
}
// 螺丝：四角各一颗
function screws(parent, w, hh, inset = 10) {
  for (const [x, y] of [[inset, inset], [w - inset - 14, inset], [inset, hh - inset - 14], [w - inset - 14, hh - inset - 14]]) blk(parent, 'screw', x, y, 14, 14);
}
// 三色条纹
function stripe(parent, x, y, w) {
  const s = h('div', 'stripe', parent, '<i></i><i></i><i></i>'); px(s, x, y, w); return s;
}

// ── 像素钥匙：同一把钥匙的形状，琥珀 = 私钥 / 秘密，绿 = 公钥 ──
const KEY_BITS = [
  '.####.........',
  '#....#........',
  '#....#########',
  '#....#..#.#.#.',
  '.####...#.#...',
];
function pixKey(parent, x, y, s = 8, color = 'var(--amber)', name = 'key') {
  const w = KEY_BITS[0].length * s, hh = KEY_BITS.length * s;
  const g = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(g, x, y);
  KEY_BITS.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') svg('rect', { x: i * s, y: j * s, width: s, height: s, fill: color }, g); }));
  g.dataset.name = name;
  return g;
}
// 像素勾与叉
function pixMark(parent, x, y, s, kind, color) {
  const BITS = kind === 'ok'
    ? ['......#', '.....#.', '#...#..', '.#.#...', '..#....']
    : ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'];
  const w = BITS[0].length * s, hh = BITS.length * s;
  const g = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(g, x, y);
  BITS.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') svg('rect', { x: i * s, y: j * s, width: s, height: s, fill: color }, g); }));
  g.dataset.name = kind === 'ok' ? 'check' : 'cross';
  return g;
}

// ── 控制台：左 CLIENT、右 SERVER、中间一条线 ──
// 返回各部件的元素与坐标，供场景往上放东西
const CON = { cx: 150, sx: 1290, y: 300, w: 480, h: 470, wy: 520 };
function consoleRig(world, o = {}) {
  const r = {};
  const ox = o.ox || 0, oy = o.oy || 0;
  // CLIENT：带显像管的终端机
  const cl = blk(world, 'mod', ox + CON.cx, oy + CON.y, CON.w, CON.h); cl.dataset.name = 'client';
  const clp = txt(cl, 'plate', 'CLIENT', 18, 16);
  const clz = txt(cl, 'plate zh', tr('你的电脑', 'your computer'), 150, 14);
  const scr = blk(cl, 'ink-bg', 18, 64, CON.w - 48, 200); scr.style.border = '6px solid var(--chassis)';
  const vC = blk(cl, 'vault', 18, 284, CON.w - 48, 150);
  const vCl = txt(cl, 'plate amb zh', tr('本机 · 不上线', 'stays here'), 30, 270); vCl.style.fontSize = '24px';
  screws(cl, CON.w - 12, CON.h - 12, 4);
  // SERVER：机架
  const sv = blk(world, 'mod', ox + CON.sx, oy + CON.y, CON.w, CON.h); sv.dataset.name = 'server';
  txt(sv, 'plate', 'SERVER', 18, 16);
  txt(sv, 'plate olv', '127.0.0.1:2222', 168, 16).style.background = 'var(--chassis)';
  const units = [];
  for (let i = 0; i < 4; i++) {
    const u = blk(sv, 'rack', 18, 64 + i * 50, CON.w - 48, 40);
    for (let k = 0; k < 6; k++) blk(u, 'slot', 14 + k * 36, 12, 26, 16);
    const lamp = blk(u, 'lamp', CON.w - 100, 9, 22, 22);
    units.push(lamp);
  }
  const vS = blk(sv, 'vault', 18, 284, CON.w - 48, 150);
  txt(sv, 'plate amb zh', tr('本机 · 不上线', 'stays here'), 30, 270).style.fontSize = '24px';
  screws(sv, CON.w - 12, CON.h - 12, 4);
  // 线：一段一格，卡带按格跳
  const wx0 = ox + CON.cx + CON.w, wx1 = ox + CON.sx, wy = oy + CON.wy;
  const wire = blk(world, 'bg-chassis', wx0, wy - 6, wx1 - wx0, 12); wire.dataset.name = 'wire';
  const ticks = [];
  for (let x = wx0 + 34; x < wx1 - 20; x += 66) { const tk = blk(world, 'cell', x, wy - 3, 30, 6); ticks.push(tk); }
  const wl = txt(world, 'plate zh', tr('网络 · 线上', 'network · the wire'), 0, wy + 26); wl.style.background = 'var(--chassis)'; wl.style.color = 'var(--paper)';
  px(wl, (wx0 + wx1) / 2 - 92, wy + 26);
  Object.assign(r, { cl, sv, scr, vC, vS, vCl, units, wire, ticks, wl, wx0, wx1, wy, ox, oy,
    cxC: ox + CON.cx + CON.w / 2, cxS: ox + CON.sx + CON.w / 2,
    vCx: ox + CON.cx + 18 + 4, vCy: oy + CON.y + 284 + 4, vSx: ox + CON.sx + 18 + 4, vSy: oy + CON.y + 284 + 4 });
  return r;
}
// 线上的格子在一段时间里亮起（有东西在传）
function wireBusy(rig, t0, t1) { rig.ticks.forEach((tk, i) => litAt(tk, t0 + (i % 3) * 0.2, t1)); }
// 加密之后：线上的格子变成实心琥珀块
function wireSealed(rig, t0) {
  rig.ticks.forEach((tk, i) => { const at = t0 + i * 0.1; set(tk, at, { background: 'var(--ac)', height: 12, y: -3 }); });
}
// 一枚卡带沿线跳过去：dir 1 = 从 CLIENT 到 SERVER，-1 反向。返回到达时刻
function travel(world, rig, html, t, o = {}) {
  const dir = o.dir || 1, d = o.d || 1.2, cls = o.cls || '';
  const tk = h('div', 'tok ' + cls, world, html);
  const y = rig.wy - 64 - (o.lane || 0) * 62;
  const w0 = o.w || 200;
  const xA = dir > 0 ? rig.wx0 + 20 : rig.wx1 - 20 - w0, xB = dir > 0 ? rig.wx1 - 20 - w0 : rig.wx0 + 20;
  px(tk, xA, y);
  tk.style.minWidth = w0 + 'px'; tk.style.textAlign = 'center';
  tl.fromTo(tk, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(tk, { x: 0 }, { x: xB - xA, duration: d, ease: stepsOf(d), immediateRender: false }, t + 0.05);
  if (o.stay !== true) tl.to(tk, { autoAlpha: 0, duration: 0.01 }, (o.until != null ? o.until : t + d + 0.6));
  if (o.sfx !== false) sfx('blip', t, { g: 0.5, p: dir > 0 ? -0.4 : 0.4 });
  tk.dataset.overlapOk = '1';
  return { el: tk, end: t + 0.05 + d };
}

// ── 关卡模块 ──
function gateMod(parent, x, y, n, title, o = {}) {
  const w = o.w || 380, hh = o.h || 300;
  const g = blk(parent, 'mod', x, y, w, hh); g.dataset.name = 'gate' + n;
  const num = txt(g, 'big', String(n).padStart(2, '0'), 20, 18); num.style.fontSize = '96px'; num.style.color = 'var(--paper)';
  const lamp = blk(g, 'lamp', w - 64, 30, 30, 30);
  const tag = txt(g, 'plate', 'GATE', 128, 30);
  const ttl = txt(g, 'cap-zh', title, 22, 132); ttl.style.fontSize = (o.fs || 40) + 'px'; ttl.style.fontWeight = 700; ttl.style.color = 'var(--paper)';
  stripe(g, 0, hh - 22, w - 12);
  return { g, num, lamp, ttl, tag, w, h: hh };
}
function gateOn(gm, t, o = {}) {
  litAt(gm.lamp, t);
  set(gm.num, t, { color: 'var(--ac)' });
  if (o.sfx !== false) sfx('pop', t, { g: o.g != null ? o.g : 0.7, p: o.p || 0 });
}

// ── 文件卡（米色纸）──
function fileCard(parent, x, y, w, hh, title) {
  const c = blk(parent, 'card', x, y, w, hh);
  h('div', 'hd', c, title);
  return c;
}
const cardLine = (card, html, x, y, cls = 'ln') => txt(card, cls, html, x, y);

// ── 显像管：厚边框、橄榄内框、黑屏 ──
function crt(parent, x, y, w, hh, label) {
  const c = blk(parent, 'crt', x, y, w, hh);
  const b = blk(c, 'crt-bezel', 0, 0, w - 56, hh - 56);
  const scr = blk(c, '', 10, 10, w - 76, hh - 76);
  if (label) { const l = txt(parent, 'plate', label, x + 40, y - 18); l.dataset.overlapOk = '1'; c._label = l; }
  return { c, scr };
}

// ── 时间码 00:00.000 ──
function timecode(e, t0, t1, v0 = 0, v1 = 1) {
  let last = null;
  F((t) => {
    const k = clamp((t - t0) / Math.max(0.001, t1 - t0));
    const v = v0 + (v1 - v0) * Math.floor(k * 20) / 20;                // 一格 0.05 秒地跳
    const s = '00:' + String(Math.floor(v)).padStart(2, '0') + '.' + String(Math.round((v % 1) * 1000)).padStart(3, '0');
    if (s !== last) { e.textContent = s; last = s; }
  });
}

// ── 一秒的读数：十格依次点亮（只表示「大约一秒」，不写毫秒，免得像实测数据）──
function secondCells(parent, x, y, n, w, hh, gap, t0, t1, color = 'var(--amber)') {
  const cells = [];
  for (let i = 0; i < n; i++) { const c = blk(parent, '', x + i * (w + gap), y, w, hh); c.style.background = 'var(--chassis)'; c.style.outline = '2px solid var(--dimp)'; cells.push(c); }
  let last = -1;
  F((t) => {
    const k = Math.floor(clamp((t - t0) / Math.max(0.001, t1 - t0)) * n + 1e-6);
    if (k === last) return; last = k;
    cells.forEach((c, i) => { c.style.background = i < k ? color : 'var(--chassis)'; });
  });
  return cells;
}

// ── 换台雪花：固定种子画好的几张噪点图 ──
function snowFrames(n = 3) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const cv = document.createElement('canvas'); cv.width = 480; cv.height = 242;
    const g = cv.getContext('2d'), r = seeded(9100 + k);
    g.fillStyle = '#070807'; g.fillRect(0, 0, 480, 242);
    const cols = ['#1e6b3a', '#74ff9a', '#2c312c', '#6a6358', '#c4b8a4'];
    for (let y = 0; y < 242; y++) for (let x = 0; x < 480; x++) { const v = r(); if (v < 0.5) { g.fillStyle = cols[Math.floor(r() * (v < 0.08 ? 5 : 3))]; g.fillRect(x, y, 1, 1); } }
    out.push(cv);
  }
  return out;
}

// ── 斜线块：冒充者。用 SVG 线条画，不用渐变 ──
function hatch(parent, x, y, w, hh, color, gap = 18, sw = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  for (let d = -hh; d < w; d += gap) svg('line', { x1: d, y1: hh, x2: d + hh, y2: 0, stroke: color, 'stroke-width': sw }, s);
  s.dataset.name = 'hatch';
  return s;
}

// 描线入场：线与箭头一起出现（箭头标记不受描线遮罩控制，所以整条路径入场前隐藏）
function drawIn(p, t, d = 0.4, o = {}) {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: o.ease || 'power2.inOut', immediateRender: true }, t);
  tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  return p;
}

// 镜头轨迹：在 cam.track 之上，凡两段明确运动之间空出 0.5 秒以上，就补一段极慢的推近（z × 1.025），
// 场景结尾同样补到 s.end。阅读保持时画面也不死，又不往复晃动。
function camPath(cam, s, start, keys) {
  const out = [];
  let prevEnd = s.start, curZ = start.z != null ? start.z : 1;
  for (const k of keys) {
    const [t, v, d = 1.4, o = {}] = k;
    const tt = t == null ? prevEnd + 0.15 : t;
    if (tt - prevEnd > 0.5) { curZ *= 1.025; out.push([prevEnd + 0.02, { z: +curZ.toFixed(4) }, tt - prevEnd - 0.04, { ease: 'none', sfx: false }]); }
    out.push([tt, v, d, o]);
    if (v.z != null) curZ = v.z;
    prevEnd = tt + d;
  }
  if (s.end - prevEnd > 0.4) out.push([prevEnd + 0.02, { z: +(curZ * 1.03).toFixed(4) }, s.end - prevEnd - 0.04, { ease: 'none', sfx: false }]);
  cam.track(s.start, start, out);
}
