// 本片的部件：双语取词、遮罩揭示、终端、圆与轨道、表格、字节图、章节卡。视觉规则见 css/style.css 开头。
const ZH = LANG === 'zh';
const tr = (zh, en) => (ZH ? zh : en);
document.documentElement.classList.add(LANG);
const NAVY = '#000080', PAPER = '#f3f2ed';
const W = 1920, H = 1080, M = 120, TOP = 84;
const fmt = (n) => Number(n).toLocaleString('en-US');
const home = (p) => String(p).replace(/\/home\/waterrun\//g, '~/');

// 场景根：底色 + world（镜头在 world 上运动）+ hud（不随镜头动的一层）
function stageOf(root, ground) {
  root.classList.add(ground === 'navy' ? 'on-navy' : 'on-paper');
  root.dataset.ground = ground;
  const world = h('div', 'world', root);
  const hud = h('div', 'hud', root);
  const fg = ground === 'navy' ? PAPER : NAVY, bg = ground === 'navy' ? NAVY : PAPER;
  const dim = ground === 'navy' ? 'rgba(243,242,237,.58)' : 'rgba(0,0,128,.46)';
  const cam = makeCamera(world);
  // 站点式镜头：go 到某一站（左上角对齐版心），hold 在站内做极慢的推近（以版心左上角为锚，边距不漂）
  const anchor = (x0, y0, z) => ({ x: x0 + M + (W / 2 - M) / z, y: y0 + TOP + (H / 2 - TOP) / z, z });
  cam.go = (t, x0, y0, o = {}) => cam.to(t, anchor(x0, y0, o.z || 1), { d: 1.15, ...o });
  cam.hold = (t, x0, y0, d, z = 1.035) => cam.to(t, anchor(x0, y0, z), { d: Math.max(0.5, d), ease: 'sine.inOut', sfx: false });
  cam.at = (t, x0, y0, z = 1) => cam.cut(t, anchor(x0, y0, z));
  return { world, cam, hud, fg, bg, dim, ground };
}
const at = (e, x, y, w, hh) => { e.classList.add('abs'); return px(e, x, y, w, hh); };

// ── 遮罩揭示 ──
function mk(parent, html, cls = '') {
  const m = h('span', 'mask ' + cls, parent);
  m._in = h('span', 'in', m, html);
  return m;
}
function rise(m, t, o = {}) {
  fromTo(m._in, t, { yPercent: o.from != null ? o.from : 140 }, { yPercent: 0, duration: o.d || 0.85, ease: o.ease || 'expo.out' });
  return m;
}
function sink(m, t, o = {}) {
  tl.to(m._in, { yPercent: o.to != null ? o.to : -140, duration: o.d || 0.5, ease: o.ease || 'expo.in' }, t);
}
const fadeIn = (e, t, o = {}) => fromTo(e, t, { autoAlpha: 0, x: o.x || 0, y: o.y || 0 }, { autoAlpha: o.a != null ? o.a : 1, x: 0, y: 0, duration: o.d || 0.5, ease: o.ease || 'power2.out' });
const fadeOut = (e, t, o = {}) => tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y || 0, duration: o.d || 0.35, ease: o.ease || 'power2.in' }, t);
function ruleIn(parent, x, y, w, t, o = {}) {
  const r = h('div', 'rule', parent); px(r, x, y, w); if (o.h) r.style.height = o.h + 'px'; if (o.a) r.style.opacity = o.a;
  fromTo(r, t, { scaleX: 0 }, { scaleX: 1, duration: o.d || 0.9, ease: o.ease || 'expo.inOut' });
  return r;
}
// 文本：一行大字（遮罩）或一段说明
function head(parent, x, y, html, cls, t, o = {}) { const e = mk(parent, html, cls); at(e, x, y); if (o.css) css(e, o.css); if (t != null) rise(e, t, o); return e; }
function note(parent, x, y, html, t, o = {}) { const e = h('div', 'abs ' + (o.cls || 't-note'), parent, html); px(e, x, y); if (o.css) css(e, o.css); if (t != null) fadeIn(e, t, { y: o.y != null ? o.y : 8, x: o.x || 0, d: o.d || 0.45, a: o.a }); return e; }

// ── 终端：只有字。cmd() 逐字打出命令，out() 逐行给出回显；回显取自 data.js（实测原文）──
function makeTerm(parent, x, y, size, o = {}) {
  const el = h('div', 'term', parent); px(el, x, y);
  css(el, { fontSize: size + 'px', lineHeight: String(o.lh || 1.5) });
  const api = {
    el, last: null,
    cmd(t, text, c = {}) {
      const ln = h('span', 'ln', el);
      h('span', 'ps', ln, (c.prompt || '$') + ' ');
      const body = h('span', 'c', ln);
      fromTo(ln, t - 0.3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
      const cps = c.cps || 24, end = t + text.length / cps;
      typeText(body, c.html || esc(text), t, cps, { cursorUntil: end + (c.hold != null ? c.hold : 0.28), sfxGain: c.sfxGain });
      sfx('tick', end + 0.12, { g: 1.1 });
      api.last = ln; ln._body = body;
      return end + 0.3;                       // 回车之后回显可以出现的时刻
    },
    out(t, lines, c = {}) {
      const step = c.step != null ? c.step : 0.05;
      const els = lines.map((s, i) => {
        const ln = h('span', 'ln o ' + (c.cls || ''), el, s === '' ? '&nbsp;' : (c.html ? s : esc(s)));
        fromTo(ln, t + i * step, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 });
        return ln;
      });
      if (c.sfx !== false) sfx(c.sfx || 'blip', t, { g: 0.5 });
      api.last = els[els.length - 1];
      return els;
    },
    gap(em = 0.5) { const g = h('span', 'ln', el, '&nbsp;'); g.style.lineHeight = String(em); return g; },
  };
  return api;
}

// ── Lua 源码 ──
const KW = /\b(local|function|return|if|then|end|or|and|not|for|in|do|nil|true|false)\b/g;
function luaLine(src, marks = []) {
  const ci = src.search(/--(?!\[)/);
  const code = ci >= 0 ? src.slice(0, ci) : src; const com = ci >= 0 ? src.slice(ci) : '';
  const parts = []; let rest = code;
  for (;;) {
    let best = null;
    for (const [sub, key] of marks) { const i = rest.indexOf(sub); if (i >= 0 && (!best || i < best.i)) best = { i, sub, key }; }
    if (!best) break;
    parts.push(esc(rest.slice(0, best.i)).replace(KW, '<b>$1</b>'));
    parts.push(`<span data-m="${best.key}">${esc(best.sub)}</span>`);
    rest = rest.slice(best.i + best.sub.length);
  }
  parts.push(esc(rest).replace(KW, '<b>$1</b>'));
  return parts.join('') + (com ? `<span class="dim">${esc(com)}</span>` : '');
}
function codeBlock(parent, lines, x, y, size, o = {}) {
  const el = h('div', 'abs mono code', parent); px(el, x, y); css(el, { fontSize: size + 'px', lineHeight: String(o.lh || 1.62) });
  el._lines = lines.map((s) => h('div', 'cl', el, s === '' ? '&nbsp;' : (o.plain ? esc(s) : luaLine(s, o.marks || []))));
  el.m = (key) => el.querySelector(`[data-m="${key}"]`);
  el.cascade = (t, o2 = {}) => el._lines.forEach((ln, i) => { fadeIn(ln, t + i * (o2.step || 0.07), { x: o2.x != null ? o2.x : -24, d: 0.45 }); if (o2.sfx !== false) sfx('tick', t + i * (o2.step || 0.07), { g: 0.7 }); });
  return el;
}

// ── 圆与轨道（SVG，坐标即所在层的坐标）──
function gfx(parent) { return svg('svg', { class: 'gfx', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent); }
const disc = (g, cx, cy, r, fill, extra = {}) => svg('circle', { cx, cy, r, fill, ...extra }, g);
const ring = (g, cx, cy, r, stroke, sw = 3, extra = {}) => svg('circle', { cx, cy, r, fill: 'none', stroke, 'stroke-width': sw, ...extra }, g);
const orbit = (g, cx, cy, r, stroke, extra = {}) => ring(g, cx, cy, r, stroke, 2.5, { 'stroke-dasharray': '3 13', 'stroke-linecap': 'round', ...extra });
const seg = (g, x1, y1, x2, y2, stroke, sw = 3, extra = {}) => svg('line', { x1, y1, x2, y2, stroke, 'stroke-width': sw, ...extra }, g);
const popIn = (e, t, cx, cy, o = {}) => fromTo(e, t, { scale: 0, svgOrigin: `${cx} ${cy}` }, { scale: o.to != null ? o.to : 1, duration: o.d || 0.6, ease: o.ease || 'back.out(1.8)' });
// 冲击环：一圈细线从 r0 扩到 r1 并淡出。用在「落定」的时刻（合成、命中、完成）
function impact(g, cx, cy, r0, r1, t, color, o = {}) {
  const c = ring(g, cx, cy, r0, color, o.w || 3); c.style.opacity = 0;
  const st = { k: 0 };
  tl.fromTo(st, { k: 0 }, { k: 1, duration: o.d || 0.75, ease: 'power2.out', immediateRender: true }, t);
  F(() => { const on = st.k > 0 && st.k < 1; c.style.opacity = on ? ((1 - st.k) * (o.a || 0.85)).toFixed(3) : 0; if (on) { c.setAttribute('r', lerp(r0, r1, st.k).toFixed(2)); c.setAttribute('stroke-width', lerp(o.w || 3, 0.6, st.k).toFixed(2)); } });
  return c;
}
// 月相：r 为半径，lit 为被照亮的比例（0..1），waning 为真时亮面在左。亮面用 fg，暗面用 shade。
function moonPhase(g, cx, cy, r, lit, waning, fg, shade) {
  const grp = svg('g', {}, g);
  disc(grp, cx, cy, r, shade);
  const k = Math.abs(2 * lit - 1) * r, big = lit > 0.5, s = waning ? -1 : 1;
  const half = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${s > 0 ? 1 : 0} ${cx} ${cy + r}`;
  const term = `A ${k} ${r} 0 0 ${(big ? s > 0 : s < 0) ? 1 : 0} ${cx} ${cy - r} Z`;
  svg('path', { d: half + ' ' + term, fill: fg }, grp);
  return grp;
}
// 打勾：两段直线依次画出
function tick(g, cx, cy, s, t, color, sw = 5) {
  const p = svg('path', { d: `M ${cx - 0.42 * s} ${cy + 0.02 * s} L ${cx - 0.1 * s} ${cy + 0.32 * s} L ${cx + 0.46 * s} ${cy - 0.3 * s}`, fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const len = p.getTotalLength(); p.style.strokeDasharray = len;
  tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', immediateRender: true }, t);
  fromTo(p, t - 0.02, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 });          // 圆头线帽在画出之前会留下一个点，先藏起来
  return p;
}

// ── 轨道系统：行星（入口脚本）、卫星（模块，可带子卫星）、外环（运行时）。状态都在 st / moons[i] 里，由补间驱动 ──
// moons: [{ name, r, a, hollow, sub: 父卫星下标, orbit: 子轨道半径, speed }]
function orbitSystem(layer, cx, cy, o = {}) {
  const k = o.k || 1, fg = o.fg || PAPER, ink = o.ink || NAVY, dimc = o.dimc || (fg === NAVY ? 'rgba(0,0,128,.5)' : 'rgba(243,242,237,.6)');
  const moons = (o.moons || [{ name: 'moon.phase' }, { name: 'moon.julian' }, { name: 'moon.names' }]).map((m) => ({ ...m }));
  const prim = moons.filter((m) => m.sub == null);
  prim.forEach((m, i) => { if (m.a == null) m.a = i * 2 * Math.PI / prim.length; });
  moons.forEach((m) => { m.s = 0; m.lab = 1; m.f = 0; if (m.r == null) m.r = m.sub == null ? 20 : 13; if (m.sub != null && m.a == null) m.a = 0.6; });
  moons.forEach((m, i) => { if (m.sub != null) moons[m.sub].kid = i; });            // 有子卫星的卫星：名字要让到子轨道之外
  const g = gfx(layer);
  const ro0 = (o.ro || 208) * k;
  const st = { cx, cy, ro: ro0, rr: (o.rr || 440) * k, rp: (o.rp || 100) * k, ring: 0, planet: 0, lab: 1, spin: 0, orb: 0, speed: o.speed != null ? o.speed : 0.22, a0: o.a0 != null ? o.a0 : -0.55, plab: 1 };
  const rg = ring(g, cx, cy, st.rr, fg, 3);
  const ob = orbit(g, cx, cy, st.ro, dimc);
  const subOrbits = moons.map((m) => (m.sub != null ? orbit(g, 0, 0, 1, dimc) : null));
  const planet = disc(g, cx, cy, st.rp, fg);
  const els = moons.map((m) => (m.hollow ? svg('circle', { cx: 0, cy: 0, r: 1, fill: o.bg || 'none', stroke: fg, 'stroke-width': 3.5 }, g) : disc(g, 0, 0, 1, fg)));
  const fills = moons.map((m) => (m.hollow ? disc(g, 0, 0, 0, fg) : null));          // 空心卫星的「填实」层
  const fs = (o.labSize || 30) * k;
  const labs = moons.map((m) => { const e = h('div', 'abs mono', layer, m.name); css(e, { fontSize: (m.sub != null ? fs * 0.88 : fs) + 'px', lineHeight: '36px', color: fg, width: '300px', display: o.labels === false ? 'none' : '' }); return e; });
  const pl = h('div', 'abs mono', layer, o.planetName || 'main.lua'); css(pl, { fontSize: 35 * k + 'px', lineHeight: '52px', textAlign: 'center', color: ink, fontWeight: 600, width: '360px' });
  const rl = h('div', 'abs mono', layer, o.runtime || 'Lua 5.4'); css(rl, { fontSize: fs + 'px', lineHeight: '36px', color: fg });
  const pos = (i, t, s = st) => {
    const m = moons[i];
    if (m.sub == null) { const a = s.a0 + t * s.speed + s.spin + m.a; return [s.cx + s.ro * Math.cos(a), s.cy + s.ro * Math.sin(a), a]; }
    const p = pos(m.sub, t, s), a = m.a + t * (m.speed || 0.55) + s.spin * 1.6, r = (m.orbit || 62) * k * clamp(s.ro / ro0);
    return [p[0] + r * Math.cos(a), p[1] + r * Math.sin(a), a, p];
  };
  F((t) => {
    planet.setAttribute('cx', st.cx); planet.setAttribute('cy', st.cy); planet.setAttribute('r', Math.max(0, st.rp * st.planet).toFixed(2));
    rg.setAttribute('cx', st.cx); rg.setAttribute('cy', st.cy); rg.setAttribute('r', Math.max(0.01, st.rr).toFixed(2)); rg.style.opacity = st.ring;
    ob.setAttribute('cx', st.cx); ob.setAttribute('cy', st.cy); ob.setAttribute('r', Math.max(0.01, st.ro).toFixed(2));
    ob.style.opacity = (Math.max(st.orb, ...prim.map((m) => Math.min(1, m.s))) * clamp(st.ro / (120 * k))).toFixed(3);
    moons.forEach((m, i) => {
      const p = pos(i, t), e = els[i];
      e.setAttribute('cx', p[0].toFixed(2)); e.setAttribute('cy', p[1].toFixed(2)); e.setAttribute('r', Math.max(0, m.r * k * m.s).toFixed(2));
      if (fills[i]) { const f = fills[i]; f.setAttribute('cx', p[0].toFixed(2)); f.setAttribute('cy', p[1].toFixed(2)); f.setAttribute('r', Math.max(0, m.r * k * m.s * m.f).toFixed(2)); }
      if (m.sub != null) { const so = subOrbits[i], r = (m.orbit || 62) * k * clamp(st.ro / ro0); so.setAttribute('cx', p[3][0].toFixed(2)); so.setAttribute('cy', p[3][1].toFixed(2)); so.setAttribute('r', Math.max(0.01, r).toFixed(2)); so.style.opacity = (Math.min(1, m.s) * clamp(st.ro / (120 * k))).toFixed(3); }
      const kid = m.kid != null ? moons[m.kid] : null;
      const right = Math.cos(p[2]) >= -0.15, pad = (kid ? lerp(m.r + 16, (kid.orbit || 62) + kid.r + 12, clamp(kid.s)) : m.r + 16) * k, op = (st.lab * m.lab * clamp(m.s * 1.6 - 0.5)).toFixed(3);
      if (m.sub != null) {          // 子卫星的名字放在子轨道的外侧（上方或下方），不和父卫星的名字抢位置
        const par = p[3], up = Math.sin(par[2]) < 0, r = (m.orbit || 62) * k * clamp(st.ro / ro0);
        css(labs[i], { left: par[0] - 150 + 'px', top: (up ? par[1] - r - 18 * k - 36 : par[1] + r + 18 * k) + 'px', textAlign: 'center', opacity: op });
      } else css(labs[i], { left: (right ? p[0] + pad : p[0] - pad - 300) + 'px', top: p[1] - 18 + 'px', textAlign: right ? 'left' : 'right', opacity: op });
    });
    const ar = -0.62; css(rl, { left: st.cx + (st.rr + 24) * Math.cos(ar) + 'px', top: st.cy + (st.rr + 24) * Math.sin(ar) - 36 + 'px', opacity: (st.ring * st.lab).toFixed(3) });
    css(pl, { left: st.cx - 180 + 'px', top: st.cy - 26 + 'px', opacity: st.planet >= 0.9 ? (st.lab * st.plab).toFixed(3) : 0 });
  });
  const m_r = (i) => moons[i].r * k;
  const api = { st, g, planet, moons, labs, pl, rl, rg, ob, k, pos, ro0,
    showPlanet(t, o2 = {}) { tl.fromTo(st, { planet: 0 }, { planet: 1, duration: 0.7, ease: 'back.out(1.9)', immediateRender: true }, t); if (o2.sfx !== false) sfx('pop', t, { p: 0.4 }); },
    showMoon(i, t, o2 = {}) { tl.fromTo(moons[i], { s: 0 }, { s: 1, duration: o2.d || 0.6, ease: 'back.out(2.2)', immediateRender: true }, t); if (o2.sfx !== false) sfx('pop', t, { g: 0.6, p: 0.3 }); },
    // 空心卫星填实 / 掏空（「被发现」与「没被发现」）
    fill(i, t, on = true, o2 = {}) {
      tl.to(moons[i], { f: on ? 1 : 0, duration: on ? 0.45 : 0.3, ease: on ? 'back.out(2.6)' : 'power2.in' }, t);
      if (on && o2.sfx !== false) { const p = pos(i, t); impact(g, p[0], p[1], m_r(i), m_r(i) * 3.2, t + 0.05, fg, { d: 0.55 }); sfx('pop', t, { g: 0.7, p: 0.4 }); }
    },
    showRing(t) { tl.fromTo(st, { ring: 0, rr: st.rr * 1.22 }, { ring: 1, rr: st.rr, duration: 0.9, ease: 'expo.out', immediateRender: true }, t); sfx('whoosh', t - 0.1, { g: 0.6, p: 0.4 }); },
    // 合成：卫星沿轨道收拢进行星，外环套上去，行星胀成一个实心圆；落定时一圈冲击环
    collapse(t, o2 = {}) {
      const R = o2.r || 176 * k;
      tl.to(st, { lab: 0, duration: 0.3 }, t - 0.1);
      tl.to(st, { ro: st.ro * 1.06, duration: 0.22, ease: 'power2.out' }, t - 0.05);             // 预备：先微微张开
      tl.to(st, { ro: 0, spin: 4.2, duration: 0.85, ease: 'power3.in' }, t + 0.17);
      tl.to(st, { rr: R * 0.8, duration: 0.95, ease: 'power3.in' }, t + 0.07);
      moons.forEach((m) => tl.to(m, { s: 0, duration: 0.05 }, t + 1.02));
      tl.to(st, { ring: 0, orb: 0, duration: 0.05 }, t + 1.02);
      tl.to(st, { rp: R, duration: 0.6, ease: 'back.out(2.6)' }, t + 1.02);
      impact(g, st.cx, st.cy, R, R * 1.9, t + 1.04, fg);
      sfx('riser', t - 0.1, { g: 0.7, p: 0.3 }); sfx('thud', t + 1.02, { g: 1, p: 0.3 });
      return t + 1.02;
    },
  };
  return api;
}

// ── 两色反转的字：文字在圆内取底色、圆外取前景色。圆由 clip(cx, cy, r) 给出（所在层坐标）──
function invText(parent, x, y, html, cls, inside, o = {}) {
  const wrap = h('div', 'abs', parent); px(wrap, x, y);
  const a = mk(wrap, html, cls);
  const over = h('div', 'abs', wrap); css(over, { left: 0, top: 0 });
  const b = mk(over, html, cls); css(b, { color: inside });
  if (o.css) { css(a, o.css); css(b, o.css); }
  const api = { wrap, a, b, over,
    rise(t, oo) { rise(a, t, oo); rise(b, t, oo); }, sink(t, oo) { sink(a, t, oo); sink(b, t, oo); },
    clip(cx, cy, r) { over.style.clipPath = `circle(${Math.max(0, r).toFixed(1)}px at ${(cx - x).toFixed(1)}px ${(cy - y).toFixed(1)}px)`; } };
  api.clip(-9999, -9999, 0);
  return api;
}

// ── 表格：细线分行 ──
function hairlines(parent, x, y, w, n, rh, t, o = {}) {
  for (let i = 0; i <= n; i++) { const r = h('div', 'rule', parent); px(r, x, y + i * rh, w); css(r, { height: '2px', opacity: o.a || 0.16 }); fromTo(r, t + i * 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }); }
}
// 有 / 部分 / 无：实心圆、空心圆、短横
function mark(g, kind, cx, cy, t, color, bg) {
  let e;
  if (kind === 'yes') e = disc(g, cx, cy, 13, color);
  else if (kind === 'part') e = svg('circle', { cx, cy, r: 11.5, fill: bg || 'none', stroke: color, 'stroke-width': 3 }, g);
  else e = seg(g, cx - 12, cy, cx + 12, cy, color, 3, { opacity: 0.5 });
  if (kind === 'no') fromTo(e, t, { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.3 }); else popIn(e, t, cx, cy, { d: 0.4, ease: 'back.out(2.4)' });
  return e;
}
// 由种子决定的伪随机十六进制字符：哈希「逐位定下来」，任意一帧可独立重算
function scramble(el, final, t0, d) {
  const HEX = '0123456789abcdef'; let last = null;
  const rnd = (i, f) => { let x = (i * 374761393 + f * 668265263) | 0; x = (x ^ (x >>> 13)) * 1274126177; return HEX[((x ^ (x >>> 16)) >>> 0) % 16]; };
  F((t) => {
    const k = clamp((t - t0) / d), n = Math.round(k * final.length), f = Math.floor(t * 24);
    let s = t < t0 - 0.02 ? '' : final.slice(0, n);
    if (t >= t0 - 0.02) for (let i = n; i < final.length; i++) s += /[0-9a-f]/.test(final[i]) ? rnd(i, f) : final[i];
    if (s !== last) { el.textContent = s; last = s; }
  });
}
// 数字滚到位（千分位）
function countUp(el, to, t0, d = 0.9, from = 0) { countTo(el, from, to, t0, d, (v) => fmt(Math.round(v))); }

// 画完的 canvas 换成 <img>。渲染机上，canvas 层在场景显隐切换之后偶尔会丢一帧；图片是普通的绘制内容，不会。
// 图片的载入是异步的：承诺放进 window.PENDING，引擎在置 ready 之前等它们全部载入；decoding=sync 让解码与绘制同步，不会晚一帧
window.PENDING = window.PENDING || [];
function freeze(c) {
  const img = new Image(); img.decoding = 'sync'; img.style.cssText = c.style.cssText;
  window.PENDING.push(new Promise((res) => { img.onload = res; img.onerror = res; }));
  img.src = c.toDataURL('image/png');
  c.replaceWith(img);
  return img;
}

// ── 字节图：把一个真实文件的每个字节画成一个点，亮度即数值（0 不画）。用 2 倍像素的画布，镜头推近时仍然清楚 ──
function byteMap(parent, bytes, x, y, cols, cell, color) {
  const rows = Math.ceil(bytes.length / cols), w = cols * cell, hh = rows * cell, S = 2;
  const wrap = h('div', 'abs', parent); px(wrap, x, y, w, hh);
  const mkCanvas = () => { const c = document.createElement('canvas'); c.width = w * S; c.height = hh * S; css(c, { position: 'absolute', left: 0, top: 0, width: w + 'px', height: hh + 'px' }); wrap.appendChild(c); return c; };
  const paint = (c, from, to, alphaMul) => {
    const ctx = c.getContext('2d'); ctx.fillStyle = color;
    for (let i = from; i < to; i++) { const b = bytes[i]; if (!b) continue; ctx.globalAlpha = (0.2 + 0.8 * b / 255) * alphaMul; ctx.beginPath(); ctx.arc(((i % cols) + 0.5) * cell * S, (Math.floor(i / cols) + 0.5) * cell * S, cell * 0.4 * S, 0, 6.2832); ctx.fill(); }
  };
  const b0 = mkCanvas(); paint(b0, 0, bytes.length, 1); const base = freeze(b0);
  const api = { wrap, base, cols, cell, rows, w, h: hh,
    rowOf: (off) => Math.floor(off / cols), yOf: (off) => y + Math.floor(off / cols) * cell, xOf: (off) => x + (off % cols) * cell,
    // 一段字节范围的高亮层（单独一张画布，只画这一段）
    range(from, to) { const c = mkCanvas(); paint(c, from, to, 1); c.style.opacity = 0; return freeze(c); },
    // 自上而下扫出
    reveal(t0, d) { F((t) => { const k = ease.io3(clamp((t - t0) / d)); wrap.style.clipPath = k >= 1 ? 'none' : `inset(0 0 ${(100 * (1 - k)).toFixed(2)}% 0)`; }); },
  };
  return api;
}

// ── 角上的小月亮：标题里那组「行星 + 虚线轨道 + 月亮」的缩小版，全片常驻，持续公转。
// 每次换章，下一场就从它的行星里展开（见 config.js 的 TRANS），所以它用的是「对面」的颜色。
const EMB = { x: 1770, y: 112, r: 12, orbit: 29, moon: 6.5 };
function emblem(stage, s, o = {}) {
  const g = gfx(stage.hud), fg = stage.fg, t0 = o.t0 != null ? o.t0 : s.start + 1.25, t1 = o.t1 != null ? o.t1 : s.end;
  const pl = disc(g, EMB.x, EMB.y, EMB.r, fg), ob = svg('circle', { cx: EMB.x, cy: EMB.y, r: EMB.orbit, fill: 'none', stroke: fg, 'stroke-width': 2, 'stroke-dasharray': '2 7.1', 'stroke-linecap': 'round', opacity: 0.6 }, g), mo = disc(g, 0, 0, EMB.moon, fg);
  popIn(pl, t0, EMB.x, EMB.y, { d: 0.5, ease: 'back.out(2.2)' });
  fromTo(ob, t0 + 0.15, { autoAlpha: 0, rotation: -90, svgOrigin: `${EMB.x} ${EMB.y}` }, { autoAlpha: 0.6, rotation: 0, duration: 0.9, ease: 'power3.out' });
  fromTo(mo, t0 + 0.3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  if (o.exit !== false) tl.to([ob, mo], { autoAlpha: 0, duration: 0.3 }, t1 - 0.32);
  F((t) => { const a = -1.2 + t * 0.42; mo.setAttribute('cx', (EMB.x + EMB.orbit * Math.cos(a)).toFixed(2)); mo.setAttribute('cy', (EMB.y + EMB.orbit * Math.sin(a)).toFixed(2)); });
  return { g, pl, ob, mo };
}

// ── 章节卡：巨大的编号 + 标题，从遮罩后升起；随后让位给内容 ──
function chapter(root, s) {
  const wrap = h('div', 'abs', root); css(wrap, { left: 0, top: 0, width: W + 'px', height: H + 'px', zIndex: 5 });
  const num = mk(wrap, s.chap[0]); at(num, M - 14, 96); css(num, { font: '800 620px/0.86 Inter', letterSpacing: '-0.06em' });
  const ttl = mk(wrap, s.chap[1], 'd-1'); at(ttl, M, 760);
  const t0 = s.start + 0.42, t1 = s.start + s.lead - 0.62;
  const rl = ruleIn(wrap, M, 716, W - 2 * M, t0 - 0.1, { d: 0.8 });
  rise(num, t0, { d: 0.9 }); rise(ttl, t0 + 0.16, { d: 0.8 });
  sink(num, t1, { d: 0.36 }); sink(ttl, t1 + 0.04, { d: 0.34 });
  tl.to(rl, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.38, ease: 'expo.in' }, t1);
  sfx('thud', t0 + 0.08, { g: 0.8 }); sfx('pop', t0 + 0.3, { g: 0.5 }); sfx('whoosh', t1 - 0.05, { g: 0.45 });
  return wrap;
}

// 把一行（块级）里的内容包进一个行内 span，返回这个 span：反白时只盖住文字，不拉满整行
const inl = (ln) => { const sp = document.createElement('span'); sp.dataset.flush = '1'; while (ln.firstChild) sp.appendChild(ln.firstChild); ln.appendChild(sp); return sp; };
// 行内高亮：把一段文字做成可在时刻 t 反白的 span。classAt 由 t 决定，任意 seek 都成立
const hl = (el, t0, t1) => { el.classList.add(el.dataset.flush ? 'hlf' : 'hlb'); classAt(el, 'inv', t0, t1 == null ? Infinity : t1); return el; };
// 把已经渲染好的一行里的某个子串包成 span 并返回它（找不到就返回整行）
const sub = (ln, text) => {
  const html = ln.innerHTML, e = esc(text), i = html.indexOf(e);
  if (i < 0) { console.warn('sub: not found', text); return ln; }
  ln.innerHTML = html.slice(0, i) + '<span data-sub>' + e + '</span>' + html.slice(i + e.length);
  const all = ln.querySelectorAll('span[data-sub]'); return all[all.length - 1];
};
// 终端里的制表符：按 8 列对齐展开
const tabs = (s) => { let o = ''; for (const ch of String(s)) { if (ch === '\t') o += ' '.repeat(8 - (o.length % 8)); else o += ch; } return o; };
// 把一行里的某个子串包成可高亮的 span（返回 [html, 取元素的函数]）
const span = (line, sub, key = 'k') => esc(line).replace(esc(sub), `<span data-${key}>${esc(sub)}</span>`);
