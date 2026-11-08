// 本片的世界（第 10 稿第三次重做）：白色论文感。桌面上一张张印好的纸——新内容是另一张纸插进来，看完抽走。
// 纸上的方块（token）、纸垛（层）是立体的；每条信息都靠动作表达：落下、计数、压住、接力，而不是把字写上去。
// 镜头按内容选：平移、推近、拉远、抬起看高度；停留时不动。
// 每张纸都是一层扁平平面（字、线在纸面内），立体物体在纸面之上，不会互相抢深度。一切状态都由 t 算出。

const INK = '#1c1c1c', GRAY = '#6e6e6e', RED = '#a5402d', PERSP = 3400, OX = 960, OY = 540;

function ramp(t, t0, d, e) { return (e || ease.io3)(clamp((t - t0) / Math.max(1e-6, d))); }
const smooth = (k) => k * k * (3 - 2 * k);
const linear = (k) => k;
const in3 = (k) => k * k * k;
const win = (t, a, b, d = 0.4) => ramp(t, a, d) * (1 - ramp(t, b, d));

function keyed3(s0, keys) {
  const segs = []; let cur = { ...s0 }, prevEnd = -Infinity;
  for (const [t, v, d = 1.8, e] of keys) {
    const tt = t == null ? prevEnd + 0.1 : t, next = { ...cur, ...v };
    segs.push({ t: tt, d, a: cur, b: next, e: e || ease.io3 }); cur = next; prevEnd = tt + d;
  }
  return (t) => {
    let s = s0;
    for (const g of segs) { if (t < g.t) break; const k = g.e(clamp((t - g.t) / g.d)); s = {}; for (const key in g.b) s[key] = lerp(g.a[key], g.b[key], k); }
    return s;
  };
}
// 路点：keys = [[t, x, y, z], …]。在第 i 个路点的时刻到达它；两个路点之间缓动；最后一点之后停住
function pathAt(keys, t, e) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], k = (e || ease.io3)(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0]))); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] || 0, b[3] || 0, k)]; }
  return keys[keys.length - 1].slice(1);
}
const polyD = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

function fade(W, el, fn) { let last = -1; W.up((t) => { const o = +clamp(fn(t)).toFixed(3); if (o === last) return; last = o; el.style.opacity = o; el.style.visibility = o < 0.002 ? 'hidden' : ''; }); }

function makeWorld(root, cam0) {
  const view = h('div', 'view', root);
  const stage = h('div', 'stage', view);
  const base = { cx: 0, cy: 0, cz: 0, pitch: 0, k: 1, sx: 960, sy: 540, ...cam0 };
  const desk = h('div', 'desk2', stage);
  h('div', 'light', root);
  const W = { view, stage, desk, camAt: () => base, ups: [], zs: 0 };
  W.cam = (keys) => { W.camAt = keyed3(base, keys); };
  W.up = (fn) => W.ups.push(fn);
  let lastC = '';
  F((t) => {
    const c0 = W.camAt(t), c = {};
    for (const k_ of ['cx', 'cy', 'cz', 'pitch', 'k', 'sx', 'sy']) c[k_] = +c0[k_].toFixed(3);
    const key = [c.cx, c.cy, c.cz, c.pitch, c.k].join(',');
    if (key !== lastC) { lastC = key; stage.style.transform = `translate3d(${c.sx}px, ${c.sy}px, 0) scale3d(${c.k}, ${c.k}, ${c.k}) rotateX(${c.pitch}deg) translate3d(${-c.cx}px, ${-c.cy}px, ${-c.cz}px)`; }
    for (const u of W.ups) u(t, c);
  });
  // ── 一张纸 ── o: w, h, x, y（静止时的位置）, in:[t, 方向, d], out:[t, 方向, d]。方向 r/l/t/b：从哪一边进、往哪一边抽走
  W.sheet = (o = {}) => makeSheet(W, o);
  return W;
}

function makeSheet(W, o) {
  const w = o.w || 1800, hh = o.h || 1012, X = o.x || 0, Y = o.y || 0, Z = (W.zs += 70), FAR = { r: [2600, 0], l: [-2600, 0], t: [0, -1700], b: [0, 1700] };
  const g = h('div', 'p3', W.stage);
  const paper = h('div', 'paper', g); css(paper, { left: -w / 2 + 'px', top: -hh / 2 + 'px', width: w + 'px', height: hh + 'px' });
  const flat = h('div', 'lay', paper); css(flat, { left: w / 2 + 'px', top: hh / 2 + 'px' });
  const shade = h('div', 'lay', flat);
  const mkS = () => { const s = svg('svg', { width: 1, height: 1 }, flat); css(s, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return s; };
  const under = mkS(), txt = h('div', 'lay', flat), over = mkS();
  const inn = o.in, out = o.out;
  let last = '';
  W.up((t) => {
    let x = X, y = Y;
    if (inn) { const v = FAR[inn[1]], k = 1 - ramp(t, inn[0], inn[2] || 1.1, ease.out3); x += v[0] * k; y += v[1] * k; }
    if (out) { const v = FAR[out[1]], k = ramp(t, out[0], out[2] || 1.0, in3); x += v[0] * k; y += v[1] * k; }
    const vis = (!inn || t >= inn[0] - 0.02) && (!out || t < out[0] + (out[2] || 1.0) + 0.02);
    const key = x.toFixed(1) + '|' + y.toFixed(1) + '|' + vis;
    if (key === last) return; last = key;
    g.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${Z}px)`;
    g.style.visibility = vis ? '' : 'hidden';
  });

  const S = { W, g, flat, txt, shade, under, over, w, h: hh, X, Y, Z };
  // 字：印刷体。a: fs, cls, align(l/c/r), t0, d, off(t), rise(上浮距离), type:[t0, t1] 逐字显出
  S.text = (s, x, y, a = {}) => {
    const fs = a.fs || 56, al = { l: 0, c: 0.5, r: 1 }[a.align || 'l'];
    const el = h('div', 'pt ' + (a.cls || ''), txt); el.style.fontSize = fs + 'px'; el.innerHTML = s;
    const wd = el.offsetWidth, ht = Math.round(fs * 1.34), X0 = x - wd * al;
    css(el, { left: X0 + 'px', top: y - ht / 2 + 'px', height: ht + 'px', lineHeight: ht + 'px' });
    const R = { el, x0: X0, x1: X0 + wd, y, fs, w: wd, pts: [[X0 + X, y - ht / 2 + Y, Z], [X0 + wd + X, y + ht / 2 + Y, Z]] };
    if (a.type) {
      const plain = el.textContent; el.textContent = ''; const sp = [...plain].map((c) => { const q = h('span', 'c', el); q.textContent = c; return q; });
      const live = sp.filter((q) => q.textContent.trim()), n = live.length;
      live.forEach((q, i) => { const ta = lerp(a.type[0], a.type[1], n > 1 ? i / (n - 1) : 0); fade(W, q, (t) => ramp(t, ta, 0.08, linear) * (a.off ? a.off(t) : 1)); });
      R.chars = sp.map((q) => ({ x0: X0 + q.offsetLeft, x1: X0 + q.offsetLeft + q.offsetWidth }));
      R.span = (i, j) => [R.chars[i].x0, R.chars[j].x1];
      let lv = null; W.up((t) => { const v = t >= a.type[0] - 0.01 && (!a.off || a.off(t) > 0.002); if (v !== lv) { lv = v; el.style.visibility = v ? '' : 'hidden'; } });
    } else {
      const rise = a.rise != null ? a.rise : 16, d = a.d || 0.35; let lk = '';
      W.up((t) => { const k = a.t0 == null ? 1 : ramp(t, a.t0, d, ease.out3), o_ = k * (a.off ? clamp(a.off(t)) : 1), key = k.toFixed(3) + o_.toFixed(3); if (key === lk) return; lk = key; el.style.opacity = o_.toFixed(3); el.style.visibility = o_ < 0.002 ? 'hidden' : ''; el.style.transform = `translateY(${((1 - k) * rise).toFixed(1)}px)`; });
    }
    return R;
  };
  // 数字计数：从 from 到 to。suffix 跟在后面
  S.count = (x, y, a) => { const el = h('div', 'pt ' + (a.cls || ''), txt); el.style.fontSize = (a.fs || 90) + 'px'; const ht = Math.round((a.fs || 90) * 1.34), al = { l: 0, c: -50, r: -100 }[a.align || 'l']; css(el, { left: x + 'px', top: y - ht / 2 + 'px', height: ht + 'px', lineHeight: ht + 'px', transform: `translateX(${al}%)` }); let last_ = null; W.up((t) => { const v = lerp(a.from || 0, a.to, ramp(t, a.t0, a.t1 - a.t0, a.ease || linear)).toFixed(a.dec || 0), op = ramp(t, a.t0 - 0.15, 0.2) * (a.off ? clamp(a.off(t)) : 1), key = v + '|' + op.toFixed(3); if (key === last_) return; last_ = key; el.textContent = v + (a.suffix || ''); el.style.opacity = op.toFixed(3); el.style.visibility = op < 0.002 ? 'hidden' : ''; }); return { el, pts: [[x - 180 + X, y - ht / 2 + Y, Z], [x + 180 + X, y + ht / 2 + Y, Z]] }; };
  // 线：干净的直线/折线，从头画到尾。a: t0, d, color, w, off, lay, svg
  S.line = (pts, a = {}) => { const p = svg('path', { d: polyD(pts), fill: 'none', stroke: a.color || INK, 'stroke-width': a.w || 4, 'stroke-linecap': a.cap || 'butt', 'stroke-linejoin': 'round' }, a.svg || (a.lay === 'under' ? under : over)); if (a.dash) p.setAttribute('stroke-dasharray', a.dash); const L = p.getTotalLength(); if (!a.dash) p.style.strokeDasharray = `${L.toFixed(1)} ${(L + 20).toFixed(1)}`; let last_ = ''; W.up((t) => { const k = ramp(t, a.t0, a.d || 0.5, a.ease || smooth), op = a.off ? clamp(a.off(t)) : 1, key = k.toFixed(4) + op.toFixed(3); if (key === last_) return; last_ = key; if (!a.dash) p.style.strokeDashoffset = (L * (1 - k)).toFixed(2); p.style.opacity = (a.dash ? k * op : (k > 0 ? op : 0)).toFixed(3); p.style.visibility = (k <= 0 || op < 0.002) ? 'hidden' : ''; }); return p; };
  S.arrow = (pts, a = {}) => { const n = pts.length, e = pts[n - 1], b = pts[n - 2], ang = Math.atan2(e[1] - b[1], e[0] - b[0]), hs = a.head || 22, m = (a.d || 0.5) * 0.82; S.line(pts, { ...a, d: m }); S.line([[e[0] + Math.cos(ang + 2.62) * hs, e[1] + Math.sin(ang + 2.62) * hs], e, [e[0] + Math.cos(ang - 2.62) * hs, e[1] + Math.sin(ang - 2.62) * hs]], { ...a, t0: a.t0 + m, d: (a.d || 0.5) * 0.18 + 0.05 }); };
  S.ring = (cx, cy, rx, ry, a = {}) => { const pts = []; for (let i = 0; i <= 48; i++) { const q = -1.57 + i / 48 * 6.283; pts.push([cx + Math.cos(q) * rx, cy + Math.sin(q) * ry]); } return S.line(pts, { w: 5, ...a }); };
  S.rect = (x0, y0, x1, y1, a = {}) => S.line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], { w: 4, ...a });
  S.check = (x, y, s, a = {}) => S.line([[x - s * 0.5, y], [x - s * 0.12, y + s * 0.42], [x + s * 0.6, y - s * 0.56]], { w: 7, cap: 'round', d: 0.28, ...a });
  S.cross = (x, y, s, a = {}) => { const c = a.color || RED; S.line([[x - s, y - s], [x + s, y + s]], { w: 9, d: 0.16, ...a, color: c }); S.line([[x + s, y - s], [x - s, y + s]], { w: 9, d: 0.16, ...a, color: c, t0: a.t0 + 0.18 }); };
  // 色块：从 0 长到 wd（数量条、高亮）。a: t0, d, color, off, axis('x'|'y' 向上长)
  S.bar = (x, y, wd, ht, a = {}) => { const e = h('div', 'lay2', a.lay === 'over' ? txt : shade); css(e, { left: x + 'px', top: (a.axis === 'y' ? y - ht : y - ht / 2) + 'px', width: wd + 'px', height: ht + 'px', background: a.color || INK, borderRadius: (a.r != null ? a.r : 4) + 'px', transformOrigin: a.axis === 'y' ? '0 100%' : '0 50%' }); let last_ = ''; W.up((t) => { const k = ramp(t, a.t0, a.d || 0.7, a.ease || ease.out3), op = (a.off ? clamp(a.off(t)) : 1) * (k > 0.001 ? 1 : 0), key = k.toFixed(4) + op.toFixed(3); if (key === last_) return; last_ = key; e.style.transform = a.axis === 'y' ? `scaleY(${k.toFixed(4)})` : `scaleX(${k.toFixed(4)})`; e.style.opacity = op.toFixed(3); e.style.visibility = op < 0.002 ? 'hidden' : ''; }); return e; };
  S.hl = (x0, y0, x1, y1, a = {}) => S.bar(x0, (y0 + y1) / 2, x1 - x0, y1 - y0, { color: '#dcdcdc', d: 0.45, r: 0, ...a });
  // 开关：on(t) 0–1
  S.toggle = (x, y, a) => { const bg = h('div', 'tg', txt), kn = h('div', 'kn', bg); css(bg, { left: x + 'px', top: y - 30 + 'px' }); let last_ = ''; W.up((t) => { const v = clamp(a.on(t)), op = ramp(t, a.t0, 0.35) * (a.off ? clamp(a.off(t)) : 1), key = v.toFixed(3) + op.toFixed(3); if (key === last_) return; last_ = key; kn.style.transform = `translateX(${(4 + v * 64).toFixed(1)}px)`; const c = Math.round(lerp(190, 28, v)); bg.style.background = `rgb(${c},${c},${c})`; bg.style.opacity = op.toFixed(3); bg.style.visibility = op < 0.002 ? 'hidden' : ''; }); return { el: bg, pts: [[x + X, y - 30 + Y, 0], [x + 124 + X, y + 30 + Y, 0]] }; };
  S.logo = (x, y, ht, fn) => { const e = h('img', 'logo', txt); e.src = 'assets/deepseek-logo.png'; css(e, { left: x + 'px', top: y - ht / 2 + 'px', height: ht + 'px' }); fade(W, e, fn); return { el: e, x1: x + ht * 780 / 165, pts: [[x + X, y - ht / 2 + Y, Z], [x + ht * 780 / 165 + X, y + ht / 2 + Y, Z]] }; };

  // 方块（token）：a: w, d, h, fs, cls, keys(路点), t0(出现), off, swap:[[t, 文字], …], bump(t), tint:[颜色, fn]
  S.tok = (s, a = {}) => {
    const bw = a.w || 220, bd = a.d || 130, bh = a.h || 26;
    const b = block(g, s, { w: bw, d: bd, h: bh, fs: a.fs || 64, cls: a.cls });
    const keys = a.keys || [[0, a.x || 0, a.y || 0, 0]];
    let last_ = '';
    W.up((t) => {
      const [x, y, z] = pathAt(keys, t), op = (a.t0 == null ? 1 : ramp(t, a.t0, a.fadeIn || 0.18, linear)) * (a.off ? clamp(a.off(t)) : 1), lift = a.bump ? a.bump(t) : 0;
      const key = x.toFixed(1) + '|' + y.toFixed(1) + '|' + (z + lift).toFixed(1) + '|' + op.toFixed(3);
      if (key === last_) return; last_ = key;
      b.g.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z + lift + 1).toFixed(1)}px)`;
      b.g.style.opacity = op.toFixed(3); b.g.style.visibility = op < 0.002 ? 'hidden' : '';
    });
    if (a.swap) { let cur = null; W.up((t) => { let v = s; for (const [ta, tx] of a.swap) if (t >= ta) v = tx; if (v !== cur) { cur = v; b.top.innerHTML = v; } }); }
    if (a.tint) { let l = -1; W.up((t) => { const k = +clamp(a.tint[1](t)).toFixed(3); if (k === l) return; l = k; b.top.style.color = k > 0.5 ? a.tint[0] : ''; b.top.style.boxShadow = k > 0.5 ? `inset 0 0 0 3px ${a.tint[0]}` : ''; }); }
    return { ...b, w: bw, d: bd, keys };
  };

  // 纸垛：一摞层（实心，五个面）。a: w, d, n, gap, rise(t), fill(t), op(t)
  S.stack = (x, y, a = {}) => {
    const bw = a.w || 300, bd = a.d || 190, n = a.n || 96, gap = a.gap || 7, H = n * gap;
    const G = h('div', 'p3 sk', g); G.style.setProperty('--gp', gap + 'px');
    const mk = (cls, fw, tr) => { const f = h('div', 'f ' + cls, G); css(f, { width: fw + 'px', transformOrigin: '0 0' }); f.dataset.tr = tr; const fl = h('div', 'fl', f), nw = h('div', 'nw', f); return { f, fl, nw }; };
    const faces = [mk('bk', bw, `translate3d(${-bw / 2}px, ${-bd / 2}px, Zpx) rotateX(-90deg)`), mk('sd', bd, `translate3d(${-bw / 2}px, ${-bd / 2}px, Zpx) rotateZ(90deg) rotateX(-90deg)`), mk('sd', bd, `translate3d(${bw / 2}px, ${-bd / 2}px, Zpx) rotateZ(90deg) rotateX(-90deg)`), mk('fr', bw, `translate3d(${-bw / 2}px, ${bd / 2}px, Zpx) rotateX(-90deg)`)];
    const fr = faces[3].f, top = h('div', 'f tp', G); css(top, { width: bw + 'px', height: bd + 'px', left: -bw / 2 + 'px', top: -bd / 2 + 'px' });
    const sh = h('div', 'skshade', shade); css(sh, { left: x - bw / 2 + 'px', top: y - bd / 2 + 'px', width: bw + 'px', height: bd + 'px' });
    const rise = a.rise || (() => 1), fill = a.fill || (() => 0), op = a.op || (() => 1); let last_ = '';
    W.up((t) => {
      const r = clamp(rise(t)) * (out ? 1 - ramp(t, out[0] - 0.45, 0.6) : 1), hh2 = +(H * r).toFixed(1), fp = +(H * clamp(fill(t))).toFixed(1), o_ = +clamp(op(t)).toFixed(3), zz = a.z ? +a.z(t).toFixed(1) : 0, key = [hh2, fp, o_, zz].join('|');
      if (key === last_) return; last_ = key;
      G.style.transform = `translate3d(${x}px, ${y}px, ${1 + zz}px)`; G.style.opacity = o_; G.style.visibility = (o_ < 0.002 || hh2 <= 0.5) ? 'hidden' : '';
      faces.forEach(({ f, fl, nw }) => { f.style.height = hh2 + 'px'; f.style.transform = f.dataset.tr.replace('Z', hh2); fl.style.height = Math.min(fp, hh2) + 'px'; nw.style.bottom = Math.min(fp, hh2) + 'px'; nw.style.opacity = fp > 0.5 && fp < H - 0.5 ? 1 : 0; });
      top.style.transform = `translateZ(${hh2}px)`;
      sh.style.opacity = (a.z ? 0 : o_ * Math.min(1, hh2 / 80)).toFixed(3); sh.style.transform = `translate(${(hh2 * 0.05).toFixed(1)}px, ${(hh2 * 0.03).toFixed(1)}px) scale(${(1 + hh2 / (bw * 8)).toFixed(3)}, ${(1 + hh2 / (bd * 1.6)).toFixed(3)})`;
    });
    const R = { G, H, w: bw, d: bd, x, y, top, fr, faces, box: { box: [x + X, y + Y, bw, bd, H, Z + (a.z ? a.z(1e9) : 0)] }, front: y + bd / 2 };
    // 中间结果：零散的短线，算到哪层亮到哪层，随 fill 消退
    R.marks = (seed, cnt = 22) => { const r = seeded(seed); for (let j = 0; j < cnt; j++) { const fr_ = 0.06 + r() * 0.88, wd = 14 + r() * 58, lf = 14 + r() * (bw - wd - 28); const e = h('div', 'sknote', fr, `<i style="width:${wd.toFixed(0)}px;margin-left:${lf.toFixed(0)}px"></i>`); e.style.bottom = H * fr_ + 'px'; fade(W, e, (t) => clamp((fill(t) - fr_) * 26)); } };
    // 上升的小点：只往上走
    R.flow = (fn, cnt = 16, seed = 5) => { const r = seeded(seed), ds = []; for (let i = 0; i < cnt; i++) { const e = h('div', 'dot', fr); ds.push({ e, x: 20 + r() * (bw - 40), ph: r() }); } W.up((t) => { const o2 = clamp(fn(t)); ds.forEach((d) => { const u = (t * 0.55 + d.ph) % 1; d.e.style.transform = `translate(${d.x.toFixed(1)}px, ${(-u * H).toFixed(1)}px)`; d.e.style.opacity = (o2 * Math.min(1, u * 6, (1 - u) * 6)).toFixed(3); d.e.style.visibility = o2 < 0.002 ? 'hidden' : ''; }); }); };
    // 扫描线：fn(t) 0–1 为高度比例，k(t) 透明度（数层数用）
    R.scan = (fn, op_) => { const e = h('div', 'scanl', fr); W.up((t) => { const v = clamp(fn(t)), o2 = clamp(op_(t)); e.style.bottom = (v * H).toFixed(1) + 'px'; e.style.opacity = o2.toFixed(3); e.style.visibility = o2 < 0.002 ? 'hidden' : ''; }); };
    // 压盖：盖子从上面落下，压在纸垛顶上
    R.lid = (ta, off_) => { const l = h('div', 'p3 lid3', G); css(l, { left: -bw / 2 - 16 + 'px', top: -bd / 2 - 12 + 'px', width: bw + 32 + 'px', height: bd + 24 + 'px' }); let la = ''; W.up((t) => { const k = ramp(t, ta, 0.42, in3), o2 = ramp(t, ta - 0.25, 0.25) * (off_ ? clamp(off_(t)) : 1), key = k.toFixed(3) + o2.toFixed(3); if (key === la) return; la = key; l.style.transform = `translateZ(${(H + 8 + (1 - k) * 300).toFixed(1)}px)`; l.style.opacity = o2.toFixed(3); l.style.visibility = o2 < 0.002 ? 'hidden' : ''; }); };
    return R;
  };
  // 立在纸上的竖直画布：坐标 [x, -z]
  S.wall = (y) => { const q = h('div', 'p3', g); q.style.transform = `translate3d(0px, ${y}px, 2px) rotateX(-90deg)`; const v = svg('svg', { width: 1, height: 1 }, q); css(v, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return { svg: v, g: q }; };
  // 立着的字：面朝镜头，x 为左端，z 为中线高度
  S.wtext = (s, x, y, z, fs, fn, cls = '') => { const e = h('div', 'pt ' + cls, g); e.style.fontSize = fs + 'px'; e.style.transformOrigin = '0 0'; e.textContent = s; e.style.transform = `translate3d(${x}px, ${y}px, ${z + fs * 0.67}px) rotateX(-90deg)`; fade(W, e, fn); return { el: e, pts: [[x + X, y + Y, z + Z]] }; };
  S.p = (x, y, z = 0) => [x + X, y + Y, z + Z];
  S.home = (o2 = {}) => ({ cx: X, cy: Y, cz: Z, pitch: 0, k: 1, ...o2 });
  return S;
}

// 方块：宽 w、深 d、高 hh；字印在顶面。g 以方块中心为原点
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

// 投影与取景：平移 -c，rotateX(pitch)，缩放 k，平移 (sx, sy)；透视 3400，原点 (960, 540)
function proj(p, c) {
  const r = Math.PI / 180, cp = Math.cos(c.pitch * r), sp = Math.sin(c.pitch * r), vx = p[0] - c.cx, vy = p[1] - c.cy, vz = (p[2] || 0) - c.cz;
  const y2 = vy * cp - vz * sp, z2 = vy * sp + vz * cp, X = vx * c.k + (c.sx || 960), Y = y2 * c.k + (c.sy || 540), Z = z2 * c.k, f = PERSP / (PERSP - Z);
  return [OX + (X - OX) * f, OY + (Y - OY) * f, f];
}
function fitCam(items, o = {}) {
  const pitch = o.pitch != null ? o.pitch : 0, S = o.safe || { l: 110, r: 1810, t: 90, b: 930 }, pts = [];
  for (const it of items) { if (Array.isArray(it)) pts.push(it); else if (it.box) { const [x, y, w, d, hh, z0 = 0] = it.box; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const z of [z0, z0 + hh]) pts.push([x + a * w / 2, y + b * d / 2, z]); } else if (it.pts) pts.push(...it.pts); }
  const c = { cx: 0, cy: 0, cz: o.cz != null ? o.cz : Math.min(...pts.map((p) => p[2] || 0)), pitch, k: 1, sx: 960, sy: 540 }, n = pts.length || 1, r = Math.PI / 180;
  c.cx = pts.reduce((a, p) => a + p[0], 0) / n; c.cy = pts.reduce((a, p) => a + p[1], 0) / n;
  for (let it = 0; it < 30; it++) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { const [X, Y] = proj(p, c); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    c.k = clamp(c.k * Math.pow(Math.min((S.r - S.l) / Math.max(1, x1 - x0), (S.b - S.t) / Math.max(1, y1 - y0)), 0.7), 0.12, o.kmax || 1.5);
    c.cx += ((x0 + x1) / 2 - (S.l + S.r) / 2) / c.k; c.cy += ((y0 + y1) / 2 - (S.t + S.b) / 2) / c.k / Math.max(0.25, Math.cos(pitch * r));
  }
  return { cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1), cz: c.cz, pitch, k: +c.k.toFixed(3) };
}
const HOME = { cx: 0, cy: 0, cz: 0, pitch: 0, k: 1 };

// 章首：另一张纸从右边插进来，章号和章名印在上面，停留后抽走
function chapterSheet(W, s, no, title, outAt) {
  const S = W.sheet({ in: [s.start + 0.25, 'r', 1.1], out: [outAt, 'l', 1.0], w: 1500, h: 800 });
  S.text(no, 0, -150, { fs: 76, cls: 'g', align: 'c', t0: s.start + 0.9 });
  S.line([[-90, -76], [90, -76]], { t0: s.start + 1.0, d: 0.5, w: 3 });
  S.text(title, 0, 60, { fs: 168, cls: 'b', align: 'c', type: [s.start + 1.2, s.start + 1.2 + Math.min(1.6, [...title].length * 0.27)] });
  S.bar(-240, 200, 480, 10, { t0: s.start + 2.9, d: Math.max(0.6, outAt - s.start - 3.1), color: INK, ease: linear, r: 0 });
  sfx('whoosh', s.start + 0.25, { g: 0.16 }); sfx('whoosh', outAt, { g: 0.14 });
  return S;
}
