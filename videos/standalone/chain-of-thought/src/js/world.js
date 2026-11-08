// 本片的立体世界（第 5 稿起；替换第 4 稿那张斜放的桌面）
//
// 一整张无边的草稿纸是地面（横格线随镜头铺开，远处淡去）；模型写下的 token 是立在纸上的小方块；
// 正在决定的那一块，上方立着一摞纸——每一张是一层，从下往上一张张算到顶，就是「一趟」；算到顶得出的那一块落回纸上。
// 立体本身就是内容：高度 = 一趟里能连着算的层数；写下的字把上一趟的结果交给下一趟，于是一趟接一趟往上接。
//
// 镜头是一台绕目标点转动的真镜头：目标点 (cx, cy, cz)、方位 yaw（绕纸面的法线转）、俯仰 pitch（0 为正俯视，90 为平视）、远近 k。
// 所有状态都由 t 算出：位置、亮暗、升起的程度都是 t 的函数（ramp / keyed3），不用补间回调，也不依赖播放历史。

const LINE_GAP = 96;                 // 纸上横格的间距
const RULES = 34;                    // 镜头前后各铺几条横格

function ramp(t, t0, d, e) { return (e || ease.io3)(clamp((t - t0) / Math.max(1e-6, d))); }
const smooth = (k) => k * k * (3 - 2 * k);

// 关键帧：keys = [[t, {分量}, d, ease]]，t 写 null 表示接在上一段之后 0.1 秒；每段从上一段的终点走到本段的终点
function keyed3(s0, keys) {
  const segs = []; let cur = { ...s0 }, prevEnd = -Infinity;
  for (const [t, v, d = 1.4, e] of keys) {
    const tt = t == null ? prevEnd + 0.1 : t, next = { ...cur, ...v };
    segs.push({ t: tt, d, a: cur, b: next, e: e || ease.io3 }); cur = next; prevEnd = tt + d;
  }
  return (t) => {
    let s = s0;
    for (const g of segs) {
      if (t < g.t) break;
      const k = g.e(clamp((t - g.t) / g.d)); s = {};
      for (const key in g.b) s[key] = lerp(g.a[key], g.b[key], k);
    }
    return s;
  };
}

// 世界：root 里建透视层、舞台与地面。W.cam(keys) 设镜头轨迹；W.up(fn) 登记每帧更新（fn(t, cam)）
function makeWorld(root, cam0) {
  const view = h('div', 'view', root);
  const stage = h('div', 'stage', view);
  const base = { cx: 0, cy: 0, cz: 0, yaw: 0, pitch: 60, k: 1, sx: 960, sy: 540, ...cam0 };
  const W = { view, stage, camAt: () => base, ups: [], boards: [] };
  const rules = [];
  for (let i = -RULES; i <= RULES; i++) rules.push(h('div', 'rule', stage));
  W.cam = (keys) => { W.camAt = keyed3(base, keys); };
  W.up = (fn) => W.ups.push(fn);
  let lastC = '';
  F((t) => {
    // 先取整再用：写进样式的值与比较用的键完全一致，镜头停住时不会留下上一帧的细微差别（否则画面依赖播放历史）
    const c0 = W.camAt(t), c = {};
    for (const k_ of ['cx', 'cy', 'cz', 'yaw', 'pitch', 'k', 'sx', 'sy']) c[k_] = +c0[k_].toFixed(3);
    const key = [c.cx, c.cy, c.cz, c.yaw, c.pitch, c.k, c.sx, c.sy].join(',');
    if (key !== lastC) {
      lastC = key;
      stage.style.transform = `translate3d(${c.sx}px, ${c.sy}px, 0) scale3d(${c.k}, ${c.k}, ${c.k}) rotateX(${c.pitch}deg) rotateZ(${c.yaw}deg) translate3d(${-c.cx}px, ${-c.cy}px, ${-c.cz}px)`;
      // 横格：只铺镜头附近，越远越淡，看起来无边
      const j0 = Math.round(c.cy / LINE_GAP);
      rules.forEach((l, i) => {
        const j = j0 + i - RULES, dy = Math.abs(j * LINE_GAP - c.cy) / (RULES * LINE_GAP);
        l.style.transform = `translate3d(${(c.cx - 7000).toFixed(1)}px, ${j * LINE_GAP}px, 0)`;
        l.style.opacity = Math.max(0, 1 - dy * dy * 1.15).toFixed(3);
      });
      for (const b of W.boards) b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, ${b.z}px) rotateZ(${-c.yaw}deg) rotateX(${-c.pitch}deg) translate(${b.dx}px, ${b.dy}px)`;
    }
    for (const u of W.ups) u(t, c);
  });
  // 面向镜头的标签：(x, y, z) 是它在世界里的锚点；dx、dy 是相对锚点的屏幕偏移（-宽/2 即居中）
  W.board = (html, x, y, z, dx = 0, dy = 0, cls = '') => {
    const el = h('div', 'bb ' + cls, stage, html); const b = { el, x, y, z, dx, dy }; W.boards.push(b);
    el.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`; return el;
  };
  // 印在纸面上的字（随纸面倾斜，像写在纸上）
  W.print = (html, x, y, cls = '') => { const el = h('div', 'pr ' + cls, stage, html); el.style.transform = `translate3d(${x}px, ${y}px, 0.6px)`; return el; };
  return W;
}

// 每帧按 fn(t) 摆放一个元素：fn 返回 { x, y, z, o, s, rz }；只在变化时写样式
function place(W, el, fn) {
  let last = '';
  W.up((t) => {
    const s = fn(t), o = s.o == null ? 1 : s.o;
    const tr = `translate3d(${(s.x || 0).toFixed(2)}px, ${(s.y || 0).toFixed(2)}px, ${(s.z || 0).toFixed(2)}px)` + (s.rz ? ` rotateZ(${s.rz.toFixed(2)}deg)` : '') + (s.s != null && s.s !== 1 ? ` scale3d(${s.s.toFixed(4)}, ${s.s.toFixed(4)}, ${s.s.toFixed(4)})` : '');
    const key = tr + '|' + o.toFixed(3);
    if (key === last) return; last = key;
    el.style.transform = tr; el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.002 ? 'hidden' : '';
  });
}

// 方块（一个 token）：宽 w（沿 x）、深 d（沿 y）、高 hh；字印在顶面。返回的 g 以方块中心为原点
function block(parent, txt, o = {}) {
  const w = o.w || 120, d = o.d || 84, hh = o.h || 24;
  const g = h('div', 'p3 blk' + (o.cls ? ' ' + o.cls : ''), parent);
  const inner = h('div', 'p3', g); inner.style.transform = `translate3d(${-w / 2}px, ${-d / 2}px, 0)`;
  const face = (cls, fw, fh, tr, html) => { const f = h('div', 'f ' + cls, inner, html); css(f, { width: fw + 'px', height: fh + 'px', transform: tr }); return f; };
  face('sd', d, hh, `translate3d(0px, 0px, ${hh}px) rotateZ(90deg) rotateX(-90deg)`);
  face('bk', w, hh, `translate3d(0px, 0px, ${hh}px) rotateX(-90deg)`);
  face('sd', d, hh, `translate3d(${w}px, 0px, ${hh}px) rotateZ(90deg) rotateX(-90deg)`);
  const fr = face('fr', w, hh, `translate3d(0px, ${d}px, ${hh}px) rotateX(-90deg)`);
  const top = face('tp', w, d, `translate3d(0px, 0px, ${hh}px)`, txt);
  if (o.fs) top.style.fontSize = o.fs + 'px';
  return { g, top, fr, w, d, h: hh };
}

// 投在纸上的淡影
function cast(parent, w, d) { const e = h('div', 'cast', parent); css(e, { left: -w / 2 + 'px', top: -d / 2 + 'px', width: w + 'px', height: d + 'px', transform: 'translateZ(0.4px)' }); return e; }

// 一摞层（一趟）：n 张纸，间距 gap；rise(t) 0–1 为升起的程度，fill(t) 0–1 为算到了多高，z(t) 为整摞离纸面的高度
function ream(W, parent, x, y, o = {}) {
  const n = o.n || 96, w = o.w || 112, dd = o.d || w, gap = o.gap || 5;
  const g = h('div', 'p3 ream', parent);
  const sh = cast(g, w * 1.7, dd * 1.7);
  const plates = [];
  for (let i = 0; i < n; i++) { const p = h('div', 'plate', g); css(p, { left: -w / 2 + 'px', top: -dd / 2 + 'px', width: w + 'px', height: dd + 'px' }); plates.push(p); }
  const R = { g, plates, n, w, d: dd, gap, H: n * gap, x, y, rise: o.rise || (() => 1), fill: o.fill || (() => 0), z: o.z || (() => 0), op: o.op || (() => 1), ink: o.ink || (() => 0), pos: o.pos || (() => [x, y]) };
  const lastZ = new Array(n).fill(-1), lastS = new Array(n).fill(-1);
  let lastG = '';
  W.up((t) => {
    const r = R.rise(t), f = R.fill(t), op = R.op(t), zz = R.z(t), ink = R.ink(t), [px_, py_] = R.pos(t);
    const gk = `${px_.toFixed(2)}|${py_.toFixed(2)}|${zz.toFixed(2)}|${op.toFixed(3)}|${r > 0.001}`;
    if (gk !== lastG) { lastG = gk; g.style.transform = `translate3d(${px_.toFixed(2)}px, ${py_.toFixed(2)}px, ${zz.toFixed(2)}px)`; g.style.opacity = op.toFixed(3); g.style.visibility = (op < 0.002 || r <= 0.001) ? 'hidden' : ''; }
    if (op < 0.002 || r <= 0.001) return;
    sh.style.opacity = (r * 0.9).toFixed(3);
    const front = f * n;
    for (let i = 0; i < n; i++) {
      const z = +((i + 1) * gap * r).toFixed(2);
      const st = ink > 0.5 ? 3 : (front - i >= 1 ? 2 : (front - i > 0 ? 1 : 0));
      if (z !== lastZ[i]) { plates[i].style.transform = `translateZ(${z}px)`; lastZ[i] = z; }
      if (st !== lastS[i]) { plates[i].className = 'plate' + ['', ' now', ' done', ' ink'][st]; lastS[i] = st; }
    }
  });
  return R;
}

// 两点之间的一条细线（世界坐标）；返回 { e, set(p0, p1) }
function seg(parent, cls = '') {
  const e = h('div', 'seg ' + cls, parent);
  return {
    e,
    set(a, b) {
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const L = Math.hypot(dx, dy, dz), hz = Math.hypot(dx, dy);
      const az = Math.atan2(dy, dx) * 180 / Math.PI, el = Math.atan2(dz, hz) * 180 / Math.PI;
      e.style.width = L.toFixed(2) + 'px';
      e.style.transform = `translate3d(${a[0].toFixed(2)}px, ${a[1].toFixed(2)}px, ${a[2].toFixed(2)}px) rotateZ(${az.toFixed(3)}deg) rotateY(${(-el).toFixed(3)}deg)`;
    },
  };
}

// 立在纸上的一块竖直画布（SVG），沿 x 方向，正面朝 +y；用来画读回去的弧线。
// 画布坐标：X = 世界 x - x0，Y = top - 世界 z
function wall(parent, x0, y, w, top) {
  const g = h('div', 'p3', parent);
  g.style.transform = `translate3d(${x0}px, ${y}px, ${top}px) rotateX(-90deg)`;
  const s = svg('svg', { width: w, height: top + 40, viewBox: `0 0 ${w} ${top + 40}` }, g);
  css(s, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  return { g, s, X: (x) => x - x0, Y: (z) => top - z };
}

// 只按 fn(t) 改透明度（标签、细线；不碰它们的变换）
function fade(W, el, fn) {
  let last = -1;
  W.up((t) => { const o = +clamp(fn(t)).toFixed(3); if (o === last) return; last = o; el.style.opacity = o; el.style.visibility = o < 0.002 ? 'hidden' : ''; });
}

// 章名印在纸面上（每章开头，镜头从它的正上方倾下来）；返回章名所在的位置，镜头的第一段由场景自己写
function chapterMark(W, s, no, title, x, y, outAt) {
  const t0 = s.start + 0.45;
  const cn = W.print(no, x, y - 90, 'chap-no');
  const ct = W.print(title, x, y, 'chap-ti');
  const cr = seg(W.stage, ''); cr.set([x, y - 14, 0.6], [x + 130, y - 14, 0.6]);
  const out = (t) => 1 - ramp(t, outAt, 0.8);
  fade(W, cn, (t) => ramp(t, t0 + 0.1, 0.5) * out(t));
  fade(W, cr.e, (t) => ramp(t, t0 + 0.25, 0.4) * out(t));
  fade(W, ct, (t) => ramp(t, t0 + 0.35, 0.6) * out(t));
  return { t0, cam: { cx: x + 380, cy: y - 40, cz: 0, pitch: 0, yaw: 0, k: 1 } };
}

// 一根立柱：很多趟压扁后摞在一起（每趟一段，段与段之间一道深色的接缝＝写下的那一块）。
// seg 是每段的高度；n(t) 是 t 时刻摞了几段。四个侧面用重复的渐变画接缝，所以几百段也只有几个元素
function column(W, parent, x, y, o = {}) {
  const w = o.w || 150, d = o.d || 100, sg = o.seg || 12;
  const g = h('div', 'p3 col', parent); g.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  g.style.setProperty('--sg', sg + 'px');
  const faces = [
    ['fr', w, `translate3d(${-w / 2}px, ${d / 2}px, 0px) rotateX(-90deg)`],
    ['bk', w, `translate3d(${-w / 2}px, ${-d / 2}px, 0px) rotateX(-90deg)`],
    ['sd', d, `translate3d(${-w / 2}px, ${-d / 2}px, 0px) rotateZ(90deg) rotateX(-90deg)`],
    ['sd', d, `translate3d(${w / 2}px, ${-d / 2}px, 0px) rotateZ(90deg) rotateX(-90deg)`],
  ].map(([c, fw, tr]) => { const f = h('div', 'f ' + c, g); css(f, { width: fw + 'px', transformOrigin: '0 0' }); f.dataset.tr = tr; return f; });
  const top = h('div', 'f tp', g); css(top, { width: w + 'px', height: d + 'px', left: -w / 2 + 'px', top: -d / 2 + 'px' });
  const sh = cast(g, w * 1.7, d * 1.7);
  let last = -1;
  W.up((t) => {
    const n = Math.max(0, (o.n || (() => 0))(t)), hh = +(n * sg).toFixed(2), op = (o.op || (() => 1))(t);
    const key = hh * 1000 + op;
    if (key === last) return; last = key;
    // 侧面从 z = hh 往下画到 0（rotateX(-90deg) 把面的 y 轴转成向下的 z 轴）
    faces.forEach((f) => { f.style.height = hh + 'px'; f.style.transform = f.dataset.tr.replace('0px) rotateX', `${hh}px) rotateX`).replace('0px) rotateZ', `${hh}px) rotateZ`); });
    top.style.transform = `translateZ(${hh}px)`;
    g.style.opacity = op; g.style.visibility = (op < 0.002 || hh <= 0) ? 'hidden' : '';
    sh.style.opacity = Math.min(1, hh / 40);
  });
  return { g, w, d, sg };
}

// 一段写在纸上的回答：一串方块从 (x0, y0) 起从左往右排，超过 maxW 换行。
// 字印在 <span class="tx"> 里（退远时可以单独淡去）。o.x1st：第一行从哪里起（前面留给题目）。
// items：字符串＝一块字；数字 n＝看不清的一块（约 n 个字宽，顶面一道淡灰短线）；'\n'＝换行；{ t, cls } 或 { n, cls }＝带样式的一块
function para(S, x0, y0, items, o = {}) {
  const fs = o.fs || 36, lh = o.lh || 118, gap = o.gap || 10, maxW = o.maxW || 1600, d = o.d || 78, hh = o.h || 20;
  const tw = (s) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) < 0x2e80 ? 0.6 : 1) * fs, 0);
  const out = []; let x = o.x1st != null ? o.x1st : x0, line = 0;
  for (const it of items) {
    if (it === '\n') { x = x0; line++; continue; }
    const ob = typeof it === 'object' ? it : (typeof it === 'number' ? { n: it } : { t: it });
    const txt = ob.t != null ? ob.t.trim() : '';
    const w = Math.round(ob.n != null ? ob.n * fs * 0.8 + 24 : Math.max(tw(txt) + 30, fs * 1.6));
    if (x + w > x0 + maxW && x > x0) { x = x0; line++; }
    const b = block(S, ob.n != null ? '' : `<span class="tx">${txt}</span>`, { w, d, h: hh, fs, cls: [ob.n != null ? 'dim' : '', ob.cls || ''].join(' ').trim() });
    if (ob.n != null) { const bar = h('div', 'scrib', b.top); css(bar, { width: (w - 28) + 'px' }); }
    out.push({ b, x: x + w / 2, x0: x, x1: x + w, y: y0 + line * lh, w, d, txt, i: out.length, line });
    x += w + gap;
  }
  out.lines = line + 1;
  return out;
}

// 一道立体的弧线：从 p0 拱到 p1（世界坐标），拱高 hgt；draw(t) 0–1 为画出的比例，op(t) 为透明度
function arc3(W, parent, p0, p1, hgt, o = {}) {
  const n = o.n || 32, segs = [];
  for (let i = 0; i < n; i++) segs.push(seg(parent, o.cls || ''));
  const P = (u) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), lerp(p0[2], p1[2], u) + 4 * hgt * u * (1 - u)];
  segs.forEach((s, i) => s.set(P(i / n), P((i + 1) / n)));
  let last = '';
  W.up((t) => {
    const k = clamp(o.draw ? o.draw(t) : 1), op = clamp(o.op ? o.op(t) : 1), m = k * n;
    const key = m.toFixed(2) + '|' + op.toFixed(3);
    if (key === last) return; last = key;
    segs.forEach((s, i) => {
      const v = clamp(m - i);
      if (v > 0 && v < 1) s.set(P(i / n), P((i + v) / n)); else if (v >= 1) s.set(P(i / n), P((i + 1) / n));
      s.e.style.opacity = v > 0 ? op.toFixed(3) : 0; s.e.style.visibility = v > 0 && op > 0.002 ? '' : 'hidden';
    });
  });
  return segs;
}

// 印在纸上的一个框（圈出一组方块）：x、y 为左上角，w、d 为宽和深
function rect(W, parent, x, y, w, d, fn, cls = '') {
  const e = h('div', 'p3 box3 ' + cls, parent);
  css(e, { width: w + 'px', height: d + 'px', transform: `translate3d(${x}px, ${y}px, 0.8px)` });
  fade(W, e, fn);
  return e;
}

// 一圈方块的外框（paragraph 里第 a 到第 b 块；同一行），留出 pad
function rectOf(W, parent, toks, a, b, fn, cls = '', pad = 14) {
  const A = toks[a], B = toks[b];
  return rect(W, parent, A.x0 - pad, A.y - A.d / 2 - pad, B.x1 - A.x0 + 2 * pad, A.d + 2 * pad, fn, cls);
}

// 章末的镜头：正俯视一片空白的纸。横格的位置与 chapterMark 的开场镜头一致（cy ≡ 92 mod 96，k = 1），所以章与章之间硬切看不出来
function blankCam(x, y) { return { cx: x, cy: 92 + 96 * Math.round((y - 92) / 96), cz: 0, pitch: 0, yaw: 0, k: 1 }; }

// ── 取景：按「这一镜必须看到的东西」算镜头 ──
// 投影与 CSS 一致：先平移 -c，再 rotateZ(yaw)、rotateX(pitch)、缩放 k、平移 (sx, sy)；.view 的透视 2000px，原点 (960, 540)
const PERSP = 2000, OX = 960, OY = 540;
function proj(p, c) {
  const r = Math.PI / 180, cy_ = Math.cos(c.yaw * r), sy_ = Math.sin(c.yaw * r), cp = Math.cos(c.pitch * r), sp = Math.sin(c.pitch * r);
  const vx = p[0] - c.cx, vy = p[1] - c.cy, vz = (p[2] || 0) - c.cz;
  const x1 = vx * cy_ - vy * sy_, y1 = vx * sy_ + vy * cy_;
  const y2 = y1 * cp - vz * sp, z2 = y1 * sp + vz * cp;
  const X = x1 * c.k + (c.sx || 960), Y = y2 * c.k + (c.sy || 540), Z = z2 * c.k;
  const f = PERSP / (PERSP - Z);
  return [OX + (X - OX) * f, OY + (Y - OY) * f, f];
}
// 取景对象：[x, y, z] 点；{ box: [x, y, w, d, h] } 以 (x, y) 为中心的立方体；{ el } 面向镜头的标签（W.board 建的）；{ pr: el, x, y } 印在纸上的字
function fitCam(W, items, o = {}) {
  const pitch = o.pitch != null ? o.pitch : 50, yaw = o.yaw || 0;
  const S = o.safe || { l: 110, r: 1810, t: 90, b: 920 };
  const pts = [], tags = [];
  for (const it of items) {
    if (Array.isArray(it)) pts.push(it);
    else if (it.box) { const [x, y, w, d, hh] = it.box; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const z of [0, hh]) pts.push([x + a * w / 2, y + b * d / 2, z]); }
    else if (it.el && W.boards) {
      const bd = W.boards.find((q) => q.el === it.el); if (!bd) continue;
      const inner = it.el.firstElementChild || it.el, w = inner.offsetWidth, hh = inner.offsetHeight;
      const m = /translate\((-?[\d.]+)%(?:,\s*(-?[\d.]+)%)?\)/.exec(inner.style.transform || '') || /translateX\((-?[\d.]+)%\)/.exec(inner.style.transform || '');
      const tx = m ? +m[1] / 100 : 0, ty = m && m[2] ? +m[2] / 100 : 0;
      tags.push({ p: [bd.x, bd.y, bd.z], u0: bd.dx + tx * w, v0: bd.dy + ty * hh, w, h: hh });
      pts.push([bd.x, bd.y, bd.z]);
    } else if (it.pr) {
      const inner = it.pr.firstElementChild || it.pr, w = inner.offsetWidth, hh = inner.offsetHeight;
      const m = /translate\((-?[\d.]+)%(?:,\s*(-?[\d.]+)%)?\)/.exec(inner.style.transform || '');
      const tx = m ? +m[1] / 100 : 0, ty = m && m[2] ? +m[2] / 100 : 0;
      const x0 = it.x + tx * w, y0 = it.y + ty * hh;
      pts.push([x0, y0, 0], [x0 + w, y0, 0], [x0, y0 + hh, 0], [x0 + w, y0 + hh, 0]);
    }
  }
  let c = { cx: 0, cy: 0, cz: 0, pitch, yaw, k: 1, sx: 960, sy: 540 };
  const n = pts.length || 1;
  c.cx = pts.reduce((a, p) => a + p[0], 0) / n; c.cy = pts.reduce((a, p) => a + p[1], 0) / n; c.cz = o.cz != null ? o.cz : pts.reduce((a, p) => a + (p[2] || 0), 0) / n;
  const r = Math.PI / 180;
  for (let it = 0; it < 24; it++) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { const [X, Y] = proj(p, c); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    for (const tg of tags) { const [X, Y, f] = proj(tg.p, c), s = c.k * f; x0 = Math.min(x0, X + tg.u0 * s); x1 = Math.max(x1, X + (tg.u0 + tg.w) * s); y0 = Math.min(y0, Y + tg.v0 * s); y1 = Math.max(y1, Y + (tg.v0 + tg.h) * s); }
    const fk = Math.min((S.r - S.l) / Math.max(1, x1 - x0), (S.b - S.t) / Math.max(1, y1 - y0));
    c.k = clamp(c.k * Math.pow(fk, 0.7), 0.12, o.kmax || 2.2);
    // 把画面中心移到安全区中心：在镜头平面里挪目标点
    const ex = ((x0 + x1) / 2 - (S.l + S.r) / 2) / c.k, ey = ((y0 + y1) / 2 - (S.t + S.b) / 2) / c.k;
    const cyw = Math.cos(yaw * r), syw = Math.sin(yaw * r), cp = Math.cos(pitch * r), sp = Math.sin(pitch * r);
    // 逆变换：屏幕 (ex, ey, 0) → 世界（先 Rx 的逆，再 Rz 的逆）
    const ux = ex, uy = ey * cp, uz = -ey * sp;
    c.cx += ux * cyw + uy * syw; c.cy += -ux * syw + uy * cyw; c.cz += uz;
  }
  const out = { cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1), cz: +c.cz.toFixed(1), pitch, yaw, k: +c.k.toFixed(3) };
  return out;
}

// 方块的字随镜头换面：俯看时印在顶面，侧面平视时印在正面（两面的字由镜头俯仰决定透明度）
function twoFace(W, b, txt, fs, extra) {
  const span = h('span', 'tx2', b.fr, txt); span.style.fontSize = (fs || Math.round(b.h * 1.1)) + 'px';
  b.fr.classList.add('ftxt');
  const top = b.top.firstChild && b.top.firstChild.nodeType === 1 ? b.top.firstChild : null;
  let last = '';
  W.up((t, c) => {
    const ex = extra ? clamp(extra(t)) : 1, a = clamp((70 - c.pitch) / 10) * ex, f = clamp((c.pitch - 64) / 10) * ex, key = a.toFixed(2) + f.toFixed(2);
    if (key === last) return; last = key;
    if (top) { top.style.opacity = a; top.style.visibility = a < 0.03 ? 'hidden' : ''; }
    span.style.opacity = f; span.style.visibility = f < 0.03 ? 'hidden' : '';
  });
  return span;
}

// 纸上的一条走线：依次经过世界坐标里的点（印在纸面上，不从字上越过）；draw(t) 0–1 为画出的比例，op(t) 为透明度
function trace(W, parent, pts, o = {}) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 30, y0 = Math.min(...ys) - 30, w = Math.max(...xs) - x0 + 60, hh = Math.max(...ys) - y0 + 60;
  const g = h('div', 'p3', parent); g.style.transform = `translate3d(${x0}px, ${y0}px, 0.9px)`;
  const sv = svg('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, g); css(sv, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + (p[0] - x0).toFixed(1) + ' ' + (p[1] - y0).toFixed(1)).join(' ');
  const path = svg('path', { d, fill: 'none', stroke: o.color || '#1c1c1c', 'stroke-width': o.w || 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, sv);
  const L = path.getTotalLength(); path.style.strokeDasharray = `${L.toFixed(1)} ${(L + 10).toFixed(1)}`;
  const tip = svg('circle', { r: (o.w || 4) * 2.2, fill: o.color || '#1c1c1c' }, sv);
  let last = '';
  W.up((t) => {
    const k = clamp(o.draw ? o.draw(t) : 1), op = clamp(o.op ? o.op(t) : 1), key = k.toFixed(3) + op.toFixed(3);
    if (key === last) return; last = key;
    path.style.strokeDashoffset = (L * (1 - k)).toFixed(1); path.style.opacity = (op * (k > 0 ? 1 : 0)).toFixed(3);
    const pt = path.getPointAtLength(Math.max(0.01, L * k));
    tip.setAttribute('cx', pt.x.toFixed(1)); tip.setAttribute('cy', pt.y.toFixed(1)); tip.setAttribute('opacity', (op * (k > 0.01 ? 1 : 0)).toFixed(3));
  });
  return path;
}

// 方块顶面描一圈墨线（与顶面对齐，不会和透视错位）
function glow(W, b, fn, cls = '') {
  const e = h('div', 'glow ' + cls, b.top);
  fade(W, e, fn);
  return e;
}

// 墨块：在方块的某一面（默认顶面）盖一层深底、反白的同样文字；fn(t) 为透明度。cls 'e' 为红底
function inkTop(W, b, html, fn, cls = '', face) {
  const e = h('div', 'inkv' + (cls ? ' ' + cls : ''), face || b.top, html);
  fade(W, e, fn);
  return e;
}
