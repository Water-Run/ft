// 本片的世界（第 10 稿起重做）：一张有纹理的稿纸，一支笔在上面写。
//
// 主轴是「在纸上写」：字、划线、圈注都是笔写在同一张扁平纸面（floor）上的墨迹，纸面只有一层，所以不会互相抢深度而闪烁。
// 立体只用在有含义的地方：一摞层是实心的纸垛（高度＝一趟能连着算的层数），笔立在纸上并投下影子。
// 镜头只有正向的俯仰（yaw 恒为 0）：写字时低头看纸，看高度时抬起来，换段落时沿着纸往前走。
// 一切状态都由 t 算出（ramp / keyed3 / 笔的路径表），不用补间回调，也不依赖播放历史。

const LINE_GAP = 96, TILE = 960, RULES = 30, PERSP = 3400, OX = 960, OY = 540;
const INK = '#17191f', PENCIL = '#6b6e75', RED = '#b5321c';

function ramp(t, t0, d, e) { return (e || ease.io3)(clamp((t - t0) / Math.max(1e-6, d))); }
const smooth = (k) => k * k * (3 - 2 * k);
const linear = (k) => k;
const win = (t, a, b, d = 0.4) => ramp(t, a, d) * (1 - ramp(t, b, d));

// 关键帧：keys = [[t, {分量}, d, ease]]，t 写 null 表示接在上一段之后；每段从上一段的终点走到本段的终点
function keyed3(s0, keys) {
  const segs = []; let cur = { ...s0 }, prevEnd = -Infinity;
  for (const [t, v, d = 1.6, e] of keys) {
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

// 纸的纹理：固定种子，生成一次；四边无缝，TILE 见方，随世界坐标铺开
function paperTile() {
  if (paperTile.url) return paperTile.url;
  const c = document.createElement('canvas'); c.width = c.height = TILE;
  const x = c.getContext('2d'), img = x.createImageData(TILE, TILE), r = seeded(7), P = 2 * Math.PI / TILE;
  for (let j = 0; j < TILE; j++) for (let i = 0; i < TILE; i++) {
    const m = Math.sin(i * P * 3 + j * P * 2) + 0.7 * Math.sin(i * P * 7 - j * P * 5 + 1.3) + 0.5 * Math.sin(i * P * 13 + j * P * 11 + 2.1);
    const v = (r() - 0.5) * 9 + m * 1.5, o = (j * 4) * TILE + i * 4;
    img.data[o] = 250 + v; img.data[o + 1] = 246 + v; img.data[o + 2] = 237 + v * 0.9; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  for (let n = 0; n < 1500; n++) {
    const a = r() * TILE, b = r() * TILE, ang = r() * 6.283, L = 14 + r() * 46, bend = (r() - 0.5) * 16, dark = r() < 0.72;
    x.strokeStyle = dark ? `rgba(118,100,70,${0.05 + r() * 0.07})` : `rgba(255,255,255,${0.2 + r() * 0.25})`; x.lineWidth = 0.6 + r() * 0.6;
    for (const ox of [-TILE, 0, TILE]) for (const oy of [-TILE, 0, TILE]) {
      x.beginPath(); x.moveTo(a + ox, b + oy);
      x.quadraticCurveTo(a + ox + Math.cos(ang) * L / 2 - Math.sin(ang) * bend, b + oy + Math.sin(ang) * L / 2 + Math.cos(ang) * bend, a + ox + Math.cos(ang) * L, b + oy + Math.sin(ang) * L); x.stroke();
    }
  }
  return (paperTile.url = c.toDataURL('image/png'));
}

// ── 笔画 ──
// 把折线变成略带手抖的平滑路径（固定种子）；amp 为抖动幅度
function roughD(pts, amp, seed) {
  const r = seeded(seed), P = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 90));
    for (let j = 0; j < n; j++) { const u = j / n, e = (i === 0 && j === 0) ? 0.3 : 1; P.push([lerp(a[0], b[0], u) + (r() - 0.5) * amp * e, lerp(a[1], b[1], u) + (r() - 0.5) * amp * e]); }
  }
  const z = pts[pts.length - 1]; P.push([z[0] + (r() - 0.5) * amp * 0.3, z[1] + (r() - 0.5) * amp * 0.3]);
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// ── 世界 ──
function makeWorld(root, cam0) {
  const view = h('div', 'view', root);
  const stage = h('div', 'stage', view);
  const base = { cx: 0, cy: 0, cz: 0, pitch: 34, k: 1, sx: 960, sy: 540, ...cam0 };
  const floor = h('div', 'floor', stage);
  const ptex = h('div', 'ptex', floor); ptex.style.backgroundImage = `url(${paperTile()})`;
  const rules = []; for (let i = -RULES; i <= RULES; i++) rules.push(h('div', 'rule', floor));
  const shadowL = h('div', 'lay', floor);
  const mk = () => { const s = svg('svg', { width: 1, height: 1 }, floor); css(s, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return s; };
  const under = mk();
  const inkL = h('div', 'lay', floor);
  const over = mk();
  h('div', 'light', root);
  const W = { view, stage, floor, shadowL, inkL, under, over, camAt: () => base, ups: [], strokes: [], seed: 11 };
  W.cam = (keys) => { W.camAt = keyed3(base, keys); };
  W.up = (fn) => W.ups.push(fn);
  let lastC = '';
  F((t) => {
    const c0 = W.camAt(t), c = {};
    for (const k_ of ['cx', 'cy', 'cz', 'pitch', 'k', 'sx', 'sy']) c[k_] = +c0[k_].toFixed(3);
    const key = [c.cx, c.cy, c.cz, c.pitch, c.k, c.sx, c.sy].join(',');
    if (key !== lastC) {
      lastC = key;
      stage.style.transform = `translate3d(${c.sx}px, ${c.sy}px, 0) scale3d(${c.k}, ${c.k}, ${c.k}) rotateX(${c.pitch}deg) translate3d(${-c.cx}px, ${-c.cy}px, ${-c.cz}px)`;
      ptex.style.transform = `translate(${Math.round(c.cx / TILE) * TILE - 9 * TILE}px, ${Math.round(c.cy / TILE) * TILE - 9 * TILE}px)`;
      const j0 = Math.round(c.cy / LINE_GAP);
      rules.forEach((l, i) => {
        const j = j0 + i - RULES, dy = Math.abs(j * LINE_GAP - c.cy) / (RULES * LINE_GAP);
        l.style.transform = `translate(${(c.cx - 8000).toFixed(1)}px, ${j * LINE_GAP}px)`;
        l.style.opacity = Math.max(0, 1 - dy * dy * 1.1).toFixed(3);
      });
    }
    for (const u of W.ups) u(t, c);
  });

  // ── 写字 ── txt 逐字写出。x, y：起点与行中线；o: fs, cls('red'|'pencil'|'bold'), align('l'|'c'|'r'), t0, t1 或 seg:[[字数, t0, t1], …], off(t), pen(默认 true), hand(默认 true)
  W.write = (txt, x, y, o = {}) => {
    const fs = o.fs || 64, al = { l: 0, c: 0.5, r: 1 }[o.align || 'l'];
    const el = h('div', 'ink ' + (o.cls || ''), inkL); el.style.fontSize = fs + 'px';
    const r = seeded(W.seed += 7);
    const chars = [...txt].map((ch) => { const sp = h('span', 'c', el); sp.textContent = ch; return sp; });
    const w = el.offsetWidth, hh = Math.round(fs * 1.3), X0 = x - w * al;
    css(el, { left: X0 + 'px', top: (y - hh / 2) + 'px', height: hh + 'px', lineHeight: hh + 'px' });
    const live = chars.filter((sp) => sp.textContent.trim() !== '');
    const n = live.length, ta = new Map();
    if (o.seg) { let i = 0; for (const [c_, a, b] of o.seg) for (let j = 0; j < c_; j++, i++) if (live[i]) ta.set(live[i], lerp(a, b, c_ > 1 ? j / (c_ - 1) : 0)); }
    else live.forEach((sp, i) => ta.set(sp, lerp(o.t0, o.t1 != null ? o.t1 : o.t0, n > 1 ? i / (n - 1) : 0)));
    const info = chars.map((sp) => ({ sp, x0: X0 + sp.offsetLeft, x1: X0 + sp.offsetLeft + sp.offsetWidth, ta: ta.get(sp) }));
    const hand = o.hand !== false;
    info.forEach((c) => {
      if (c.ta == null) return;
      if (hand) c.sp.style.transform = `translateY(${((r() - 0.5) * fs * 0.035).toFixed(1)}px) rotate(${((r() - 0.5) * 2.2).toFixed(2)}deg)`;
      const dens = hand ? 0.9 + r() * 0.1 : 1;
      fade(W, c.sp, (t) => ramp(t, c.ta, 0.1, linear) * dens * (o.off ? o.off(t) : 1));
    });
    { const a = Math.min(...[...ta.values()]); let lv = null; W.up((t, c) => { const v = t >= a - 0.01 && (!o.off || o.off(t) > 0.002) && (y - c.cy) * Math.cos(c.pitch * Math.PI / 180) * c.k < 1000; if (v !== lv) { lv = v; el.style.visibility = v ? '' : 'hidden'; } }); }
    const R = { el, chars: info, x0: X0, x1: X0 + w, y, fs, w, t0: Math.min(...[...ta.values()]), t1: Math.max(...[...ta.values()]),
      span(a, b) { return [info[a].x0, info[b].x1]; }, pts: [[X0, y - hh / 2, 0], [X0 + w, y - hh / 2, 0], [X0, y + hh / 2, 0], [X0 + w, y + hh / 2, 0]] };
    if (o.pen !== false) {
      const L = info.filter((c) => c.ta != null), red = o.cls && o.cls.includes('red');
      W.strokes.push({ t0: R.t0, t1: R.t1 + 0.06, red, at: (t) => {
        let i = 0; while (i < L.length - 1 && L[i + 1].ta <= t) i++;
        const c = L[i], nx = L[Math.min(i + 1, L.length - 1)], u = nx === c ? 1 : clamp((t - c.ta) / Math.max(0.02, nx.ta - c.ta));
        return [lerp(c.x0, c.x1, Math.min(1, u * 1.2)), y + fs * 0.32 + Math.sin(u * 9.4) * fs * 0.13];
      } });
    }
    return R;
  };
  // 给写好的字中的第 a–b 个字换色：fn(t) 0–1 为混合比例
  W.tint = (R, a, b, color, fn) => {
    const c0 = [...R.chars.slice(a, b + 1)];
    let last = -1;
    const hex = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16)), A = hex(INK), B = hex(color);
    W.up((t) => { const k = +clamp(fn(t)).toFixed(3); if (k === last) return; last = k; c0.forEach((c) => { c.sp.style.color = `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }); });
  };

  // ── 笔画 ── pts 折线；o: t0, t1, color, w, amp, off(t), pen(默认 true), lay('over'|'under'), op
  W.stroke = (pts, o = {}) => {
    const col = o.color || INK, s = o.svg || ((o.lay === 'under') ? under : over);
    const p = svg('path', { d: o.d || roughD(pts, o.amp != null ? o.amp : 3.2, W.seed += 13), fill: 'none', stroke: col, 'stroke-width': o.w || 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
    if (o.op) p.setAttribute('stroke-opacity', o.op);
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L.toFixed(1)} ${(L + 20).toFixed(1)}`;
    const N = 80, table = []; for (let i = 0; i <= N; i++) { const q = p.getPointAtLength(L * i / N); table.push([q.x, q.y]); }
    let last = '';
    W.up((t) => {
      const k = ramp(t, o.t0, o.t1 - o.t0, o.ease || smooth), op = o.off ? clamp(o.off(t)) : 1, key = k.toFixed(4) + '|' + op.toFixed(3);
      if (key === last) return; last = key;
      p.style.strokeDashoffset = (L * (1 - k)).toFixed(2); p.style.opacity = k > 0 ? op.toFixed(3) : 0; p.style.visibility = (k <= 0 || op < 0.002) ? 'hidden' : '';
    });
    if (o.pen !== false) W.strokes.push({ t0: o.t0, t1: o.t1, red: col === RED, at: (t) => { const k = ramp(t, o.t0, o.t1 - o.t0, o.ease || smooth) * N, i = Math.min(N - 1, Math.floor(k)), u = k - i; return [lerp(table[i][0], table[i + 1][0], u), lerp(table[i][1], table[i + 1][1], u)]; } });
    return p;
  };
  // 立在纸上的竖直画布（面朝镜头）：画布坐标 [x, -z]
  W.wall = (y) => { const g = h('div', 'p3', stage); g.style.transform = `translate3d(0px, ${y}px, 1px) rotateX(-90deg)`; const v = svg('svg', { width: 1, height: 1 }, g); css(v, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); return v; };
  // 立在纸上的字（面朝镜头的竖直面）：x 为左端，z 为高度，fn(t) 透明度
  W.wallText = (txt, x, y, z, fs, fn, cls = '') => { const e = h('div', 'ink ' + cls, stage); e.style.fontSize = fs + 'px'; e.style.transformOrigin = '0 0'; e.textContent = txt; e.style.transform = `translate3d(${x}px, ${y}px, ${z + fs * 0.65}px) rotateX(-90deg)`; fade(W, e, fn); return e; };
  W.line = (x0, y0, x1, y1, o = {}) => W.stroke([[x0, y0], [x1, y1]], o);
  W.under_ = (R, a, b, o = {}) => { const [x0, x1] = R.span(a, b), y = R.y + R.fs * 0.62; return W.line(x0, y, x1, y, o); };
  // 手画的方框（首尾略微出头）
  W.box = (x0, y0, x1, y1, o = {}) => W.stroke([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 - 2, y0 + 6]], { amp: 2.4, ...o });
  // 手画的椭圆圈（多转一点，像随手圈的）
  W.ring = (cx, cy, rx, ry, o = {}) => { const pts = []; for (let i = 0; i <= 30; i++) { const a = -1.9 + i / 30 * 6.283 * 1.08; pts.push([cx + Math.cos(a) * rx * (1 + i * 0.002), cy + Math.sin(a) * ry * (1 + i * 0.002)]); } return W.stroke(pts, { amp: 1.2, ...o }); };
  W.check = (x, y, s, o = {}) => W.stroke([[x - s * 0.5, y], [x - s * 0.12, y + s * 0.42], [x + s * 0.6, y - s * 0.56]], { amp: 1, w: 7, ...o });
  W.cross = (x, y, s, o = {}) => { const m = (o.t0 + o.t1) / 2, base = { amp: 1, w: 8, color: RED, ...o }; W.stroke([[x - s, y - s], [x + s, y + s]], { ...base, t1: m }); return W.stroke([[x + s, y - s], [x - s, y + s]], { ...base, t0: m + 0.03 }); };
  W.arrow = (pts, o = {}) => {
    const n = pts.length, a = pts[n - 2], b = pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hs = o.head || 26, m = lerp(o.t0, o.t1, 0.82), base = { w: 5, ...o };
    W.stroke(pts, { ...base, t1: m });
    W.stroke([[b[0] + Math.cos(ang + 2.6) * hs, b[1] + Math.sin(ang + 2.6) * hs], b, [b[0] + Math.cos(ang - 2.6) * hs, b[1] + Math.sin(ang - 2.6) * hs]], { ...base, amp: 0.6, t0: m + 0.02 });
  };
  // 铅笔排线：在一块区域里来回涂
  W.hatch = (x0, y0, x1, y1, o = {}) => {
    const pts = [], gap = o.gap || 11, H_ = y1 - y0; let up = false;
    for (let x = x0; x <= x1 + H_; x += gap) { const xa = Math.max(x0, x - H_), xb = Math.min(x1, x); const A = [xb, y0 + (x > x1 ? x - x1 : 0)], B = [xa, y0 + Math.min(H_, x - x0)]; pts.push(up ? A : B, up ? B : A); up = !up; }
    return W.stroke(pts, { amp: 1.5, w: o.w || 13, color: o.color || '#8d8f96', op: o.op || 0.55, lay: 'under', ease: linear, ...o, d: undefined });
  };
  // 官方徽标印在纸上：h 为高度，fn(t) 透明度
  W.logo = (x, y, hh, fn) => { const e = h('img', 'logo', inkL); e.src = 'assets/deepseek-logo.png'; css(e, { left: x + 'px', top: (y - hh / 2) + 'px', height: hh + 'px' }); fade(W, e, fn); return { el: e, pts: [[x, y - hh / 2, 0], [x + hh * 780 / 165, y + hh / 2, 0]] }; };

  // ── 一支笔 ──
  const penEl = h('div', 'pen', stage);
  penEl.innerHTML = penSvg('#101116', '#3f434d', 'a') + `<div class="r">${penSvg('#6f1a0d', '#d0543b', 'b')}</div>`;
  const penRed = penEl.querySelector('.r');
  const shade = h('div', 'pshade', shadowL);
  let sorted = null, lastP = '';
  const restAt = (c) => [c.cx + 1450 / c.k, c.cy + 300 / (c.k * Math.cos(c.pitch * Math.PI / 180))];
  W.up((t, c) => {
    if (!sorted) sorted = W.strokes.slice().sort((a, b) => a.t0 - b.t0);
    let i = -1; while (i + 1 < sorted.length && sorted[i + 1].t0 <= t) i++;
    let p, z = 0, red = 0;
    const cur = sorted[i], nx = sorted[i + 1];
    const rest = restAt(c);
    if (cur && t <= cur.t1) { p = cur.at(t); z = 1.5; red = cur.red ? 1 : 0; }
    else {
      const from = cur ? cur.at(cur.t1) : rest, tEnd = cur ? cur.t1 : -1e9, gap = nx ? nx.t0 - tEnd : Infinity;
      const dNext = nx ? nx.at(nx.t0) : rest;
      const rA = cur && cur.red ? 1 : 0, rB = nx && nx.red ? 1 : 0;
      if (gap <= 2.2) { const u = ramp(t, tEnd, gap, ease.io3); p = [lerp(from[0], dNext[0], u), lerp(from[1], dNext[1], u)]; z = 1.5 + Math.sin(u * Math.PI) * Math.min(70, 26 + gap * 26); red = lerp(rA, rB, u); }
      else {
        const out = ramp(t, tEnd, 0.8, ease.io3), inn = nx ? ramp(t, nx.t0 - 0.8, 0.8, ease.io3) : 0;
        const a = [lerp(from[0], rest[0], out), lerp(from[1], rest[1], out)];
        p = [lerp(a[0], dNext[0], inn), lerp(a[1], dNext[1], inn)]; z = 1.5 + 90 * Math.sin(Math.min(1, out + inn) * Math.PI / 2) * (1 - inn) ** 0.5 + 40 * Math.sin(inn * Math.PI);
        red = inn > 0 ? rB : rA;
      }
    }
    const s = Math.pow(1 / Math.max(0.45, c.k), 0.6);
    const key = [p[0].toFixed(1), p[1].toFixed(1), z.toFixed(1), c.pitch, s.toFixed(3), red.toFixed(2)].join('|');
    if (key === lastP) return; lastP = key;
    penEl.style.transform = `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${-c.pitch}deg) rotate(19deg) scale(${s.toFixed(3)})`;
    penRed.style.opacity = red.toFixed(2);
    const sOp = clamp(1 - z / 130);
    shade.style.transform = `translate(${(p[0] + z * 0.5).toFixed(1)}px, ${(p[1] + z * 0.6).toFixed(1)}px) rotate(24deg) scaleX(${s.toFixed(3)})`;
    shade.style.opacity = (0.75 * sOp).toFixed(3);
  });
  return W;
}

// 一支钢笔（SVG），笔尖在 (32, 640)
function penSvg(c0, c1, id) {
  return `<svg width="64" height="640" viewBox="0 0 64 640"><defs>
  <linearGradient id="pb${id}" x1="0" x2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".28" stop-color="${c1}"/><stop offset=".55" stop-color="${c0}"/><stop offset="1" stop-color="${c0}"/></linearGradient>
  <linearGradient id="pm${id}" x1="0" x2="1"><stop offset="0" stop-color="#8b8d92"/><stop offset=".35" stop-color="#f1f1ee"/><stop offset=".7" stop-color="#a5a7ab"/><stop offset="1" stop-color="#6d6f74"/></linearGradient></defs>
  <path d="M32 640 L22 588 Q20 572 24 556 L40 556 Q44 572 42 588 Z" fill="url(#pm${id})"/><path d="M32 638 L32 590" stroke="#3a3b40" stroke-width="1.4"/><circle cx="32" cy="586" r="3" fill="#3a3b40"/>
  <rect x="19" y="498" width="26" height="60" rx="3" fill="url(#pb${id})"/><rect x="16" y="486" width="32" height="14" rx="2" fill="url(#pm${id})"/>
  <path d="M14 486 L14 44 Q14 8 32 6 Q50 8 50 44 L50 486 Z" fill="url(#pb${id})"/><rect x="14" y="150" width="36" height="7" fill="url(#pm${id})"/></svg>`;
}

// 每帧按 fn(t) 摆放一个元素：fn 返回 { x, y, z, o, s }；只在变化时写样式
function place(W, el, fn) {
  let last = '';
  W.up((t) => {
    const s = fn(t), o = s.o == null ? 1 : s.o;
    const tr = `translate3d(${(s.x || 0).toFixed(2)}px, ${(s.y || 0).toFixed(2)}px, ${(s.z || 0).toFixed(2)}px)` + (s.s != null && s.s !== 1 ? ` scale3d(${s.s.toFixed(4)}, ${s.s.toFixed(4)}, 1)` : '');
    const key = tr + '|' + o.toFixed(3);
    if (key === last) return; last = key;
    el.style.transform = tr; el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.002 ? 'hidden' : '';
  });
}

// 只按 fn(t) 改透明度
function fade(W, el, fn) {
  let last = -1;
  W.up((t) => { const o = +clamp(fn(t)).toFixed(3); if (o === last) return; last = o; el.style.opacity = o; el.style.visibility = o < 0.002 ? 'hidden' : ''; });
}

// ── 纸垛：一摞层，实心，只有五个面（层线是面上的纹理，不会闪）──
// x, y：底面中心；o: w, d, n, gap, rise(t) 0–1 升起, fill(t) 0–1 算到多高, op(t), base(t) 整摞离纸面的高度
// 返回 { H, note(txt, frac, fn), pull(frac, fn) }
function stack(W, x, y, o = {}) {
  const w = o.w || 300, d = o.d || 190, n = o.n || 96, gap = o.gap || 7, H = n * gap;
  const g = h('div', 'p3 sk', W.stage); g.style.setProperty('--gp', gap + 'px');
  const mk = (cls, fw, tr) => { const f = h('div', 'f ' + cls, g); css(f, { width: fw + 'px', transformOrigin: '0 0' }); f.dataset.tr = tr; const fl = h('div', 'fl', f), nw = h('div', 'nw', f); return { f, fl, nw }; };
  const faces = [
    mk('bk', w, `translate3d(${-w / 2}px, ${-d / 2}px, Zpx) rotateX(-90deg)`),
    mk('sd', d, `translate3d(${-w / 2}px, ${-d / 2}px, Zpx) rotateZ(90deg) rotateX(-90deg)`),
    mk('sd', d, `translate3d(${w / 2}px, ${-d / 2}px, Zpx) rotateZ(90deg) rotateX(-90deg)`),
    mk('fr', w, `translate3d(${-w / 2}px, ${d / 2}px, Zpx) rotateX(-90deg)`),
  ];
  const fr = faces[3].f;
  const top = h('div', 'f tp', g); css(top, { width: w + 'px', height: d + 'px', left: -w / 2 + 'px', top: -d / 2 + 'px' });
  const sh = h('div', 'skshade', W.shadowL); css(sh, { left: (x - w / 2) + 'px', top: (y - d / 2) + 'px', width: w + 'px', height: d + 'px' });
  const rise = o.rise || (() => 1), fill = o.fill || (() => 0), op = o.op || (() => 1), base = o.base || (() => 0);
  let last = '';
  W.up((t) => {
    const r = clamp(rise(t)), hh = +(H * r).toFixed(1), fp = +(H * clamp(fill(t))).toFixed(1), a = +clamp(op(t)).toFixed(3), z0 = +(0.6 + base(t)).toFixed(1);
    const key = [hh, fp, a, z0].join('|');
    if (key === last) return; last = key;
    g.style.transform = `translate3d(${x}px, ${y}px, ${z0}px)`;
    g.style.opacity = a; const vis = a < 0.002 || hh <= 0.5 ? 'hidden' : ''; g.style.visibility = vis;
    faces.forEach(({ f, fl, nw }) => { f.style.height = hh + 'px'; f.style.transform = f.dataset.tr.replace('Z', hh); fl.style.height = Math.min(fp, hh) + 'px'; nw.style.bottom = Math.min(fp, hh) + 'px'; nw.style.opacity = fp > 0.5 && fp < H - 0.5 ? 1 : 0; });
    top.style.transform = `translateZ(${hh}px)`;
    sh.style.opacity = (a * Math.min(1, hh / 80)).toFixed(3);
    const L = 1 + hh / (d * 1.5); sh.style.transform = `translate(${(hh * 0.06).toFixed(1)}px, ${(hh * 0.03).toFixed(1)}px) scale(${(1 + hh / (w * 8)).toFixed(3)}, ${L.toFixed(3)})`;
  });
  return { g, H, w, d, x, y, top, fr,
    // 写在正面某一高度的字（算到这一层时亮起，一趟算完就消失：下一趟看不到）
    lid(fn) { const e = h('div', 'lid', top); fade(W, e, fn); return e; },
    note(txt, frac, fn, cls = '') { const e = h('div', 'sknote ' + cls, fr, txt); e.style.bottom = (H * frac) + 'px'; fade(W, e, fn); return e; },
    topPt: [x, y + d / 2, H], basePt: [x, y + d / 2, 0],
    box: { box: [x, y, w, d, H] } };
}

// 一道立着的细线（面向镜头）：从 (x, y, z0) 到 (x, y, z1)；用来标纸垛的高度
function vbar(W, x, y, z0, z1, o = {}) {
  const e = h('div', 'vbar', W.stage); css(e, { background: o.color || INK, width: (o.w || 4) + 'px', transformOrigin: '0 0' });
  let last = '';
  W.up((t, c) => {
    const k = clamp(o.draw ? o.draw(t) : 1), a = clamp(o.op ? o.op(t) : 1), hh = (z1 - z0) * k, key = [hh.toFixed(1), a.toFixed(3), c.pitch].join('|');
    if (key === last) return; last = key;
    e.style.height = hh.toFixed(1) + 'px'; e.style.opacity = a; e.style.visibility = a < 0.002 || hh < 0.5 ? 'hidden' : '';
    e.style.transform = `translate3d(${x}px, ${y}px, ${(z0 + hh + 0.8).toFixed(1)}px) rotateX(-90deg)`;
  });
  return e;
}

// 章首：笔把章号和章名写在纸的正中，写完停留，镜头再往前走。n：纸上第几格（镜头 cy = 92 + 960n，与上一章末尾的空白纸对齐）
function chapterHead(W, s, no, title, n, outAt) {
  const t0 = s.start + 0.4, off = (t) => 1 - ramp(t, outAt, 0.6), cy = 92 + TILE * n;
  const a = W.write(no, 0, cy - 150, { fs: 80, cls: 'pencil', align: 'c', t0, t1: t0 + 0.3, off });
  const tc = [...title].length;
  const b = W.write(title, 0, cy + 30, { fs: 176, cls: 'bold', align: 'c', t0: t0 + 0.5, t1: t0 + 0.5 + Math.min(1.15, tc * 0.2), off });
  sfx('tick', t0 + 0.5, { g: 0.12 });
  return { t0, a, b, cam: blankCam(0, cy) };
}

// 空白纸的镜头：章与章之间在这个姿态硬切，纸的纹理与横格都对得上
const BLANK_PITCH = 30;
function blankCam(x, y) { return { cx: Math.round(x / TILE) * TILE, cy: 92 + TILE * Math.round((y - 92) / TILE), cz: 0, pitch: BLANK_PITCH, k: 1 }; }

// ── 投影与取景 ── 投影与 CSS 一致：平移 -c，rotateX(pitch)，缩放 k，平移 (sx, sy)；透视 3400，原点 (960, 540)
function proj(p, c) {
  const r = Math.PI / 180, cp = Math.cos(c.pitch * r), sp = Math.sin(c.pitch * r);
  const vx = p[0] - c.cx, vy = p[1] - c.cy, vz = (p[2] || 0) - c.cz;
  const y2 = vy * cp - vz * sp, z2 = vy * sp + vz * cp;
  const X = vx * c.k + (c.sx || 960), Y = y2 * c.k + (c.sy || 540), Z = z2 * c.k, f = PERSP / (PERSP - Z);
  return [OX + (X - OX) * f, OY + (Y - OY) * f, f];
}
// items：[x, y, z] 点 或 { box: [x, y, w, d, h] }；o: pitch, safe, kmax, cz
function fitCam(W, items, o = {}) {
  const pitch = o.pitch != null ? o.pitch : 36;
  const S = o.safe || { l: 120, r: 1800, t: 96, b: 930 };
  const pts = [];
  for (const it of items.flat ? items.flat(0) : items) {
    if (Array.isArray(it)) pts.push(it);
    else if (it.box) { const [x, y, w, dd, hh] = it.box; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const z of [0, hh]) pts.push([x + a * w / 2, y + b * dd / 2, z]); }
    else if (it.pts) pts.push(...it.pts);
  }
  const c = { cx: 0, cy: 0, cz: 0, pitch, k: 1, sx: 960, sy: 540 }, n = pts.length || 1, r = Math.PI / 180;
  c.cx = pts.reduce((a, p) => a + p[0], 0) / n; c.cy = pts.reduce((a, p) => a + p[1], 0) / n; c.cz = o.cz != null ? o.cz : 0;
  for (let it = 0; it < 30; it++) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { const [X, Y] = proj(p, c); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    c.k = clamp(c.k * Math.pow(Math.min((S.r - S.l) / Math.max(1, x1 - x0), (S.b - S.t) / Math.max(1, y1 - y0)), 0.7), 0.12, o.kmax || 1.6);
    const ex = ((x0 + x1) / 2 - (S.l + S.r) / 2) / c.k, ey = ((y0 + y1) / 2 - (S.t + S.b) / 2) / c.k, cp = Math.cos(pitch * r);
    c.cx += ex; c.cy += ey / Math.max(0.25, cp);
  }
  return { cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1), cz: +c.cz.toFixed(1), pitch, k: +c.k.toFixed(3) };
}
