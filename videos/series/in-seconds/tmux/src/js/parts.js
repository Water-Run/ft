// 本集的部件：卡带未来主义的控制室物件。所有状态只由 t 决定：用 F() 逐帧算，不存历史；UI 状态按 12fps 步进（q12）。
// 机架 = server，磁带仓 = session，频道旋钮 = window，CRT = pane，插头/电缆 = client，键帽 = 命令/前缀。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, bg, x, y, w, hh) => { const e = h('div', 'abs', parent); px(e, x, y, w, hh); e.style.background = bg; return e; };
const hash01 = (n) => { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296; };
const swipe = (e, t, dir = 'l', d = 0.42) => wipe(e, t, { dir, d, ease: SE(d) });         // 12fps 的擦除
const sslide = (e, t, o = {}) => slide(e, t, { ...o, d: o.d || 0.34, ease: SE(o.d || 0.34) });

// 面板：tone = cream | olive | char | black | paperp
function panel(parent, tone, x, y, w, hh, o = {}) {
  const p = h('div', 'pnl ' + tone, parent); px(p, x, y, w, hh);
  if (o.screws) { const i = o.screws === true ? 14 : o.screws; [[i, i], [w - i - 18, i], [i, hh - i - 21], [w - i - 18, hh - i - 21]].forEach(([a, b]) => { const s = h('div', 'screw', p); px(s, a, b); }); }
  if (o.name) p.dataset.name = o.name;
  return p;
}
// 压字标签
function tag(parent, text, x, y, o = {}) {
  const e = h('div', 'tag' + (o.zh ? ' zh' : ''), parent, text); px(e, x, y);
  if (o.size) e.style.fontSize = o.size + 'px';
  if (o.dark) css(e, { background: C.ink, color: C.paper });
  return e;
}

// ── CRT：bezel 面板 + 黑屏；内容放 c.inner。开机（亮线 → 闪两下 → 稳定）、断电（压成线 → 点 → 灭）、换台雪花都由一个帧函数按 t 算出 ──
let SL_SEQ = 0;
function crt(parent, x, y, w, hh, o = {}) {
  const pad = o.pad != null ? o.pad : 22;
  const el = o.bare ? h('div', 'crt', parent) : panel(parent, o.bezel || 'cream', x, y, w, hh, { screws: o.screws });
  el.classList.add('crt');
  if (o.bare) px(el, x, y, w, hh);
  const W = w - pad * 2 - (o.bare ? 0 : 6), H = hh - pad * 2 - (o.bare ? 0 : 9);
  const scr = h('div', 'scr', el); px(scr, pad, pad, W, H);
  const inner = h('div', 'inner', scr);
  const beam = h('div', 'beam', scr); px(beam, 0, H / 2 - 2); beam.style.display = 'none';
  // 扫描线：只在 CRT 矩形内部，周期 3px
  const sl = svg('svg', { class: 'sl', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scr);
  const id = 'sl' + (++SL_SEQ);
  const pat = svg('pattern', { id, width: 6, height: 3, patternUnits: 'userSpaceOnUse' }, svg('defs', {}, sl));
  svg('rect', { x: 0, y: 2, width: 6, height: 1, fill: '#000', opacity: 0.42 }, pat);
  svg('rect', { x: 0, y: 0, width: W, height: H, fill: `url(#${id})` }, sl);
  // 雪花：网格方块，灰度由（帧号, 格号）的散列决定
  let nz = null, cells = [];
  const ensureNoise = () => {
    if (nz) return;
    nz = svg('svg', { class: 'nz', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scr); nz.style.display = 'none';
    const cw = Math.max(10, W / 40), ch = Math.max(8, H / 24);
    for (let yy = 0; yy < H; yy += ch) for (let xx = 0; xx < W; xx += cw) cells.push(svg('rect', { x: xx.toFixed(1), y: yy.toFixed(1), width: (cw + 0.5).toFixed(1), height: (ch + 0.5).toFixed(1), fill: '#000' }, nz));
    scr.insertBefore(nz, sl);
  };
  const NZC = ['#0B0D0A', '#2B2D2A', '#5E615A', '#8C8F86', '#C9CCC2', '#E9FFF0'];
  const ev = [];               // { t, k: 'on' | 'off' }
  const noise = [];            // [t0, t1]
  const c = {
    el, scr, inner, W, H, x, y, w, h: hh,
    on(t) { ev.push({ t, k: 'on' }); ev.sort((a, b) => a.t - b.t); return c; },
    off(t) { ev.push({ t, k: 'off' }); ev.sort((a, b) => a.t - b.t); return c; },
    noise(t, d = 0.58) { ensureNoise(); noise.push([t, t + d]); return c; },
  };
  const lit0 = o.lit !== false;
  let last = null;
  F((t0) => {
    const t = q12(t0);
    let e = null; for (const x of ev) if (x.t <= t0 + 1e-6) e = x;
    let vis = lit0, sy = 1, bw = 0, nzOn = false, nf = 0;
    if (e) {
      const f = Math.floor((t0 - e.t) * FPS12 + 1e-6);
      if (e.k === 'on') {
        vis = true;
        if (f === 0) { vis = false; bw = 0.35; } else if (f === 1) { vis = false; bw = 1; } else if (f === 2) { sy = 0.12; } else if (f === 3) { vis = false; } else if (f === 5) { vis = false; }
      } else {
        vis = false;
        if (f === 0) { vis = true; sy = 0.4; } else if (f === 1) { vis = true; sy = 0.05; } else if (f === 2) bw = 0.4; else if (f === 3) bw = 0.08; else if (f === 4) bw = 0.02;
      }
    }
    for (const [a, b] of noise) if (t0 >= a - 1e-6 && t0 < b) { nzOn = true; nf = Math.floor(t * FPS12); }
    const key = `${vis}|${sy}|${bw}|${nzOn}|${nf}`;
    if (key === last) return; last = key;
    inner.style.visibility = vis && !nzOn ? 'visible' : 'hidden';
    inner.style.transform = sy === 1 ? '' : `scaleY(${sy})`;
    inner.style.transformOrigin = '50% 50%';
    beam.style.display = bw > 0 ? '' : 'none';
    if (bw > 0) css(beam, { left: ((1 - bw) * W / 2).toFixed(0) + 'px', width: Math.max(6, bw * W).toFixed(0) + 'px' });
    if (nz) {
      nz.style.display = nzOn ? '' : 'none';
      if (nzOn) cells.forEach((r, i) => r.setAttribute('fill', NZC[Math.floor(hash01(nf * 7919 + i * 131) * NZC.length)]));
    }
  });
  if (o.name) el.dataset.name = o.name;
  return c;
}
// 终端文字块（放进 CRT.inner）
function term(c, html, x, y, o = {}) {
  const e = h('div', 'term', c.inner, html); px(e, x, y);
  if (o.size) e.style.fontSize = o.size + 'px';
  if (o.vt) css(e, { fontFamily: '"VT323", "Mono"', fontWeight: 400, lineHeight: 1 });
  if (o.color) e.style.color = o.color;
  return e;
}

// ── 指示灯：led(parent, x, y, size, 初始状态 'g'|'a'|'r'|'off')；ledAt(el, t, 状态) ──
function led(parent, x, y, size = 26, st = 'off') {
  const e = h('div', 'led' + (st !== 'off' ? ' on-' + st : ''), parent); px(e, x, y, size, size); e.dataset.name = 'LED';
  return e;
}
const ledAt = (e, t, st) => keyed(e).at(t, { cls: 'led' + (st !== 'off' ? ' on-' + st : '') });
// 警示灯闪一次（两格亮、两格灭），最后留在 end 状态
function ledBlink(e, t, st, n = 1, end = 'off') { for (let i = 0; i < n; i++) { ledAt(e, t + i * 4 / FPS12, st); ledAt(e, t + i * 4 / FPS12 + 2 / FPS12, 'off'); } ledAt(e, t + n * 4 / FPS12, end); }

// ── 键帽：按下有 1 格过冲、1 格回弹 ──
function keycap(parent, label, x, y, w = 150, hh = 150, o = {}) {
  const k = h('div', 'key' + (o.dark ? ' dark' : '') + (o.ghost ? ' ghost' : ''), parent, label); px(k, x, y, w, hh);
  if (o.size) k.style.fontSize = o.size + 'px';
  k.dataset.name = 'key ' + label.replace(/<[^>]+>/g, '');
  const P = [];
  let last = null;
  F((t) => {
    let d = 0;
    for (const p of P) { const f = Math.floor((t - p) * FPS12 + 1e-6); if (f >= 0 && f < 6) d = [10, 13, 10, 10, -3, 0][f]; }
    if (d === last) return; last = d;
    k.style.transform = d ? `translateY(${d}px)` : '';
  });
  k.press = (t, o2 = {}) => { P.push(t); if (o2.sfx !== false) sfx('key', t, { g: 1, p: o2.p || 0 }); return k; };
  return k;
}

// ── 电缆与插头：A 端固定（终端），B 端是机架上的插孔。k = 0 插着，1 拔出。rig.move(t, k, d) 登记一段移动 ──
function cableRig(layer, A, B, o = {}) {
  const pull = o.pull || { x: -170, y: 110 }, sag = o.sag != null ? o.sag : 90;
  const g = svg('g', {}, layer);
  const body = svg('path', { d: '', fill: 'none', stroke: C.ink, 'stroke-width': o.w || 16, 'stroke-linecap': 'butt' }, g);
  const hi = svg('path', { d: '', fill: 'none', stroke: '#4A4D46', 'stroke-width': 3, 'stroke-linecap': 'butt', transform: 'translate(0,-4)' }, g);
  const plug = svg('g', {}, g);
  svg('rect', { x: 0, y: -16, width: 30, height: 7, fill: C.steel }, plug);
  svg('rect', { x: 0, y: 9, width: 30, height: 7, fill: C.steel }, plug);
  svg('rect', { x: -84, y: -28, width: 86, height: 56, fill: C.cream }, plug);
  svg('rect', { x: -84, y: 22, width: 86, height: 6, fill: '#8E8670' }, plug);
  svg('rect', { x: -70, y: -28, width: 8, height: 50, fill: '#B9B096' }, plug);
  svg('rect', { x: -54, y: -28, width: 8, height: 50, fill: '#B9B096' }, plug);
  // 插孔面板（画在插头之上，盖住插进去的插脚）
  const jack = svg('g', { transform: `translate(${B.x},${B.y})` }, layer);
  svg('rect', { x: 0, y: -40, width: 46, height: 80, fill: C.ink }, jack);
  svg('rect', { x: 6, y: -20, width: 10, height: 10, fill: '#000' }, jack);
  svg('rect', { x: 6, y: 10, width: 10, height: 10, fill: '#000' }, jack);
  g.dataset.name = o.name || 'cable'; jack.dataset.name = 'jack';
  const segs = [];
  const pulses = [];
  const dots = [];
  for (let i = 0; i < 6; i++) { const d = svg('rect', { x: -9, y: -9, width: 18, height: 18, fill: C.amber, display: 'none' }, layer); dots.push(d); }
  const rig = {
    g, plug, jack,
    move(t, k, d = 0.42) { segs.push({ t, k, d }); segs.sort((a, b) => a.t - b.t); return rig; },
    pulse(t0, t1, dir = 1) { pulses.push({ t0, t1, dir }); return rig; },
    kAt(t) {
      let k = o.k0 || 0;
      for (const s of segs) { if (t < s.t) break; const u = clamp((q12(t) - s.t) / s.d); k = u >= 1 ? s.k : lerp(k, s.k, ease.out3(u)); }
      return k;
    },
  };
  let last = null;
  F((t) => {
    const k = rig.kAt(t);
    const P = { x: B.x + pull.x * k, y: B.y + pull.y * k };
    const my = Math.max(A.y, P.y) + sag * (0.6 + 0.6 * k);
    const d = `M${A.x},${A.y} C${(A.x + (P.x - A.x) * 0.3).toFixed(1)},${my.toFixed(1)} ${(A.x + (P.x - A.x) * 0.72).toFixed(1)},${my.toFixed(1)} ${(P.x - 84).toFixed(1)},${P.y.toFixed(1)}`;
    const ang = -k * (o.tilt != null ? o.tilt : 18);
    let pk = [];
    for (const p of pulses) if (t >= p.t0 && t < p.t1) pk.push(p);
    const key = d + ang + '|' + (pk.length ? q12(t) : 0);
    if (key === last) return; last = key;
    body.setAttribute('d', d); hi.setAttribute('d', d);
    plug.setAttribute('transform', `translate(${P.x.toFixed(1)},${P.y.toFixed(1)}) rotate(${ang.toFixed(1)} -40 0)`);
    dots.forEach((dt) => dt.setAttribute('display', 'none'));
    if (pk.length) {
      const len = body.getTotalLength(); let n = 0;
      for (const p of pk) for (let i = 0; i < 3 && n < dots.length; i++, n++) {
        let u = ((q12(t) - p.t0) * 0.9 + i / 3) % 1; if (p.dir < 0) u = 1 - u;
        const pt = body.getPointAtLength(u * len);
        dots[n].setAttribute('display', ''); dots[n].setAttribute('x', (pt.x - 9).toFixed(1)); dots[n].setAttribute('y', (pt.y - 9).toFixed(1));
      }
    }
  });
  return rig;
}

// ── 磁带仓 = session：带两个卷轴的仓；卷轴按 12fps 匀速转 ──
function cartridge(parent, x, y, w = 440, hh = 270, o = {}) {
  const p = panel(parent, o.tone || 'olive', x, y, w, hh, { screws: 12, name: 'cartridge' });
  const win = blk(p, C.black, 34, 52, w - 74, hh - 120);
  const s = svg('svg', { width: w - 74, height: hh - 120, viewBox: `0 0 ${w - 74} ${hh - 120}` }, win); s.style.position = 'absolute';
  const R = (hh - 120) / 2 - 10, reels = [];
  [(w - 74) * 0.27, (w - 74) * 0.73].forEach((cx) => {
    const g = svg('g', { transform: `translate(${cx},${(hh - 120) / 2})` }, s);
    svg('circle', { r: R, fill: '#3A2C22' }, g);
    svg('circle', { r: R * 0.5, fill: C.cream }, g);
    const sp = svg('g', {}, g);
    for (let i = 0; i < 3; i++) svg('rect', { x: -4, y: -R * 0.5, width: 8, height: R * 0.36, fill: C.ink, transform: `rotate(${i * 120})` }, sp);
    svg('circle', { r: 8, fill: C.ink }, g);
    reels.push(sp);
  });
  svg('rect', { x: (w - 74) * 0.27, y: (hh - 120) / 2 + R - 6, width: (w - 74) * 0.46, height: 6, fill: '#3A2C22' }, s);
  const label = tag(p, o.label || 'SESSION', 34, hh - 58, { size: 26 });
  const spin = o.spin || 90;
  F((t) => { const a = (q12(t) * spin) % 360; reels.forEach((r, i) => r.setAttribute('transform', `rotate(${(a + i * 40).toFixed(1)})`)); });
  return { el: p, label };
}

// ── 频道旋钮 = window：圆形旋钮 + 数字牌；knob.to(t, i) 咔哒跳到第 i 格（1 格过冲）──
function knob(parent, x, y, labels, o = {}) {
  const R = o.r || 78, n = labels.length, step = o.step || 50, a0 = -((n - 1) * step) / 2;
  const s = svg('svg', { width: R * 2 + 220, height: R * 2 + 160, viewBox: `${-R - 110} ${-R - 110} ${R * 2 + 220} ${R * 2 + 160}` }, parent);
  s.style.position = 'absolute'; px(s, x - R - 110, y - R - 110); s.dataset.name = 'channel knob';
  labels.forEach((lb, i) => {
    const a = (a0 + i * step - 90) * Math.PI / 180;
    svg('rect', { x: Math.cos(a) * (R + 22) - 3, y: Math.sin(a) * (R + 22) - 3, width: 6, height: 6, fill: C.steel }, s);
  });
  svg('circle', { r: R, fill: C.charcoal || '#2B2D2A' }, s);
  svg('circle', { r: R - 10, fill: '#3A3C38' }, s);
  const ptr = svg('g', {}, s);
  svg('rect', { x: -6, y: -R + 6, width: 12, height: R * 0.55, fill: C.amber }, ptr);
  svg('circle', { r: 14, fill: '#232522' }, s);
  const cards = labels.map((lb, i) => {
    const a = (a0 + i * step - 90) * Math.PI / 180;
    const e = tag(parent, lb, 0, 0, { size: 28 });
    px(e, x + Math.cos(a) * (R + 62) - 20, y + Math.sin(a) * (R + 62) - 20);
    return e;
  });
  const K = [];
  let last = null;
  F((t) => {
    let ang = a0 + (o.i0 || 0) * step;
    for (const k of K) { const f = Math.floor((t - k.t) * FPS12 + 1e-6); if (f >= 0) ang = a0 + k.i * step + (f === 0 ? 9 : 0); }
    if (ang === last) return; last = ang;
    ptr.setAttribute('transform', `rotate(${ang})`);
  });
  return { svg: s, cards, to(t, i, o2 = {}) { K.push({ t, i }); K.sort((a, b) => a.t - b.t); if (o2.sfx !== false) sfx('tick', t, { g: 0.9, p: o2.p || 0 }); } };
}

// ── 机架：olive 面板 + 顶部电源灯 + 铭牌 ──
function rack(parent, x, y, w, hh, o = {}) {
  const p = panel(parent, o.tone || 'olive', x, y, w, hh, { screws: 16, name: 'rack' });
  const rail = blk(p, C.black, 16, 60, w - 38, 6);
  return { el: p, rail };
}

// 场景的 SVG 画布：坐标与 world 对齐
function svgLayer(parent, w = 1920, hh = 968, x = 0, y = 0) { const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: [x, y, w, hh].join(' ') }, parent); px(s, x, y); s.style.overflow = 'visible'; return s; }
