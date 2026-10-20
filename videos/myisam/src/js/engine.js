// 时间线引擎：整部片子是时间 t 的纯函数。
// - GSAP 时间线（暂停态）负责位移、透明度等补间，逐帧 seek
// - F() 注册的帧函数负责打字机、计数、字幕这类「由 t 直接算出内容」的东西
// 这样任意一帧都能独立渲染，分片并行出帧不会有状态漂移。
const L = layoutScript(window.DUR);
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.7 } });
const FF = [];
const F = (fn) => FF.push(fn);
const SCENE_BUILDERS = {};
// 音效事件：场景里调用 sfx('tick', t) 登记，混音时由 tools/mix.py 合成并铺到时间线上。
// 名称见 mix.py 的 SFX 表；g 为相对音量（1 = 该音效的默认音量），p 为声像（-1 左 … 1 右）
const SFX = [];
const sfx = (name, t, o = {}) => { SFX.push({ n: name, t: +(+t).toFixed(3), g: o.g != null ? o.g : 1, p: o.p || 0 }); };
window.SFX = SFX;
const scene = (id, build) => { SCENE_BUILDERS[id] = build; };

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = {
  out3: (k) => 1 - Math.pow(1 - k, 3),
  io3: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  out5: (k) => 1 - Math.pow(1 - k, 5),
};

// 某句旁白的起点；带 word 时取该词在语音里被读到的时刻（来自 TTS 的词边界）
function T(id, word, shift = 0) {
  const c = L.cues[id];
  if (!c) { console.warn('no cue', id); return 0; }
  if (!word) return c.start + shift;
  const txt = c.tts || '';
  word = ttsNorm(word);
  const idx = txt.indexOf(word);
  if (idx < 0) { console.warn('word not in cue', id, word); return c.start + shift; }
  if (!c.words) return c.start + c.d * (idx / Math.max(1, txt.length)) + shift;
  let cur = 0;
  for (const [off, dur, wt] of c.words) {
    const p = txt.indexOf(wt, cur);
    if (p < 0) continue;
    if (p + wt.length > idx) return c.start + off + (idx > p ? dur * ((idx - p) / wt.length) : 0) + shift;
    cur = p + wt.length;
  }
  return c.end + shift;
}
const Tend = (id, shift = 0) => L.cues[id].end + shift;

// ── DOM 小工具 ──
function h(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
function svg(tag, attrs, parent) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const css = (e, o) => { Object.assign(e.style, o); return e; };
const px = (e, x, y, w, hh) => css(e, { left: x + 'px', top: y + 'px', ...(w != null ? { width: w + 'px' } : {}), ...(hh != null ? { height: hh + 'px' } : {}) });
// 元素相对舞台的盒子。沿 offsetParent 累加，不受 GSAP 变换（入场位移、缩放）影响，构建期任意时刻可量
function box(e, rel) {
  const stage = rel || document.getElementById('stage');
  let x = 0, y = 0, n = e;
  while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  const w = e.offsetWidth, hh = e.offsetHeight;
  return { x, y, w, h: hh, cx: x + w / 2, cy: y + hh / 2, r: x + w, b: y + hh };
}

// ── 补间小工具 ──
function show(e, t, o = {}) {
  const from = { autoAlpha: 0, y: o.y != null ? o.y : 22, x: o.x || 0, scale: o.s != null ? o.s : 1 };
  const to_ = { autoAlpha: o.a != null ? o.a : 1, y: 0, x: 0, scale: 1, duration: o.d || 0.7, ease: o.ease || 'power3.out', stagger: o.stagger || 0, immediateRender: true };
  if (o.blur) { from.filter = `blur(${o.blur}px)`; to_.filter = 'blur(0px)'; }
  tl.fromTo(e, from, to_, t);
  return e;
}
function hide(e, t, o = {}) {
  tl.to(e, { autoAlpha: 0, y: o.y != null ? o.y : -14, x: o.x || 0, duration: o.d || 0.5, ease: o.ease || 'power2.in', stagger: o.stagger || 0, overwrite: 'auto' }, t);
}
const to = (e, t, vars) => tl.to(e, vars, t);
const set = (e, t, vars) => tl.set(e, vars, t);
const fromTo = (e, t, a, b) => tl.fromTo(e, a, { immediateRender: true, ...b }, t);

// 打字机：text 可含 HTML 标签（标签整体出现，不被拆开）
function tokenize(html) {
  const out = []; let i = 0;
  while (i < html.length) {
    if (html[i] === '<') { const j = html.indexOf('>', i); out.push({ tag: html.slice(i, j + 1) }); i = j + 1; }
    else if (html[i] === '&') { const j = html.indexOf(';', i); out.push({ ch: html.slice(i, j + 1) }); i = j + 1; }
    else { out.push({ ch: html[i] }); i++; }
  }
  return out;
}
function typeText(e, html, t0, cps = 30, o = {}) {
  const toks = tokenize(html);
  const n = toks.filter((k) => k.ch).length;
  const dur = n / cps;
  if (o.sfx !== false) { const step = Math.max(1, Math.round(cps / 14)); for (let i = 0; i < n; i += step) sfx('key', t0 + i / cps, { g: o.sfxGain != null ? o.sfxGain : 1 }); }
  const cursor = o.cursor === false ? '' : '<span class="cur"></span>';
  let last = -1;
  F((t) => {
    const k = Math.round(clamp((t - t0) / dur) * n);
    const blink = o.cursor === false ? 0 : ((t < t0 || k >= n) ? (Math.floor(t * 2) % 2 === 0 ? 1 : 0) : 1);
    const hideCur = o.cursorUntil != null && t > o.cursorUntil;
    const key = k * 4 + blink * 2 + (hideCur ? 1 : 0);
    if (key === last) return; last = key;
    let s = '', c = 0; const open = [];
    for (const tk of toks) {
      if (tk.tag) { if (c <= k) { s += tk.tag; if (tk.tag[1] === '/') open.pop(); else open.push(tk.tag); } continue; }
      if (c < k) s += tk.ch; c++;
      if (c > k) break;
    }
    for (let i = open.length - 1; i >= 0; i--) s += '</' + open[i].slice(1).split(/[ >]/)[0] + '>';
    e.innerHTML = s + (hideCur ? '' : (blink ? cursor : cursor.replace('class="cur"', 'class="cur" style="opacity:0"')));
  });
  return t0 + dur;
}
// 数字滚动
function countTo(e, a, b, t0, d, fmt = (v) => Math.round(v).toLocaleString('en-US')) {
  let last = null;
  F((t) => { const v = fmt(lerp(a, b, ease.out5(clamp((t - t0) / d)))); if (v !== last) { e.textContent = v; last = v; } });
}
// 在时刻 t0 把内容从 a 换成 b
function swapAt(e, a, b, t0) {
  let last = null;
  F((t) => { const v = t >= t0 ? b : a; if (v !== last) { e.innerHTML = v; last = v; } });
}
function classAt(e, cls, t0, t1 = Infinity) {
  let last = null;
  F((t) => { const on = t >= t0 && t < t1; if (on !== last) { e.classList.toggle(cls, on); last = on; } });
}
// 一闪而过的强调
function flash(e, t, color = 'rgba(242,145,17,.55)') {
  sfx('blip', t);
  tl.fromTo(e, { boxShadow: `0 0 0 0px ${color}` }, { boxShadow: `0 0 0 10px rgba(242,145,17,0)`, duration: 0.9, ease: 'power2.out', immediateRender: false }, t);
}
// SVG 路径描线
function draw(path, t, d = 0.9, o = {}) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = o.dash ? o.dash : len;
  if (o.dash) { tl.fromTo(path, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, immediateRender: true }, t); return; }
  tl.fromTo(path, { strokeDashoffset: len, autoAlpha: 1 }, { strokeDashoffset: 0, duration: d, ease: o.ease || 'power2.inOut', immediateRender: true }, t);
}

// ── 字幕 / HUD / 背景 ──
function initChrome() {
  const cap = document.querySelector('#caption span');
  const capHtml = (s) => s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const cues = L.order.map((id) => L.cues[id]).filter((c) => c.cap);
  let lastCap = null;
  F((t) => {
    let cur = null, a = 0;
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i];
      const next = cues[i + 1];
      const end = Math.min(c.end + 0.28, next ? next.start - 0.06 : c.end + 0.5);
      if (t >= c.start - 0.08 && t < end) { cur = c; a = Math.min(clamp((t - (c.start - 0.08)) / 0.14), clamp((end - t) / 0.14)); break; }
    }
    if (cur !== lastCap) { cap.innerHTML = cur ? capHtml(cur.cap) : ''; lastCap = cur; }
    cap.style.opacity = cur ? a.toFixed(3) : 0;
  });

  // 顶部章节标记与底部进度
  const no = document.querySelector('.hud-no'), title = document.querySelector('.hud-title'), chapBox = document.querySelector('.hud-chap');
  const fill = document.querySelector('.hud-fill'), ticks = document.querySelector('.hud-ticks');
  for (const s of L.scenes.slice(1)) h('i', '', ticks).style.left = (s.start / L.total * 1920 - 1) + 'px';
  let lastScene = null;
  F((t) => {
    fill.style.width = (clamp(t / L.total) * 1920).toFixed(2) + 'px';
    let s = L.scenes.find((x) => t >= x.start && t < x.end) || L.scenes[L.scenes.length - 1];
    let a = 0;
    if (s.chap) a = Math.min(clamp((t - (s.start + s.lead - 0.5)) / 0.6), clamp((s.end + 0.1 - t) / 0.5));
    if (s !== lastScene) { no.textContent = s.chap ? s.chap[0] : ''; title.textContent = s.chap ? s.chap[1] : ''; lastScene = s; }
    chapBox.style.opacity = a.toFixed(3);
  });
  const brand = document.querySelector('.hud-brand');
  F((t) => { const s0 = L.scenes[1].start; brand.style.opacity = (clamp((t - s0) / 1.2) * clamp((L.total - 2.6 - t) / 0.8)).toFixed(3); });

  // 片头从黑场淡入
  const veil = h('div', '', document.getElementById('stage'));
  css(veil, { position: 'absolute', inset: 0, background: '#020d12', pointerEvents: 'none' });
  F((t) => { const a = 1 - clamp(t / 0.9); veil.style.opacity = a.toFixed(3); veil.style.display = a <= 0 ? 'none' : ''; });

  // 背景缓慢流动
  const b1 = document.querySelector('.b1'), b2 = document.querySelector('.b2'), b3 = document.querySelector('.b3'), grid = document.querySelector('.bg-grid');
  F((t) => {
    b1.style.transform = `translate(${(Math.sin(t * 0.045) * 160).toFixed(1)}px, ${(Math.cos(t * 0.038) * 90).toFixed(1)}px)`;
    b2.style.transform = `translate(${(Math.cos(t * 0.036 + 1) * 190).toFixed(1)}px, ${(Math.sin(t * 0.05 + 2) * 110).toFixed(1)}px)`;
    b3.style.transform = `translate(${(Math.sin(t * 0.03 + 3) * 140).toFixed(1)}px, ${(Math.cos(t * 0.042) * 80).toFixed(1)}px)`;
    grid.style.backgroundPosition = `${(20 + t * 1.2).toFixed(2)}px 20px`;
  });
}

// ── 章节卡：把章节标题排成一张 mysql 结果集 ──
function initChapterCards() {
  const host = document.getElementById('chapcard');
  const probe = h('span', 'mono', host, '0'.repeat(100));
  css(probe, { position: 'absolute', visibility: 'hidden', fontSize: '50px', whiteSpace: 'pre' });
  const ch = probe.getBoundingClientRect().width / 100;
  probe.remove();
  for (const s of L.scenes) {
    if (!s.chap) continue;
    const [no, title] = s.chap;
    const el = h('div', 'chap', host);
    const q = h('div', 'cq', el);
    const tbl = h('div', '', el);
    css(tbl, { fontSize: '50px', lineHeight: '1' });
    const m = h('span', 'ctt', host, title);
    css(m, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', fontSize: '50px', fontFamily: 'var(--sans)', fontWeight: 500, letterSpacing: '0.08em' });
    const n2 = Math.ceil(m.getBoundingClientRect().width / ch) + 2;
    m.remove();
    const n1 = 6;
    const border = () => `<div class="crow"><span class="cb">+${'-'.repeat(n1)}+${'-'.repeat(n2)}+</span></div>`;
    tbl.innerHTML = border() +
      `<div class="crow" style="height:86px"><span class="cb">|</span><span class="cno" style="width:${n1 * ch}px;font-size:50px">${no}</span><span class="cb">|</span>` +
      `<span style="width:${n2 * ch}px;padding-left:${ch}px;font-family:var(--sans);font-weight:500;font-size:50px;letter-spacing:.08em;color:var(--text)">${title}</span><span class="cb">|</span></div>` + border();
    const foot = h('div', 'cfoot', el, '1 row in set (0.00 sec)');
    const t0 = s.start + 0.3, t1 = s.start + s.lead - 0.42;
    typeText(q, `<span class="faint">mysql&gt;</span> SELECT * FROM chapter WHERE no = <b>${+no}</b>;`, t0, 80, { cursorUntil: t0 + 0.62 });
    sfx('whoosh', t0 - 0.25, { g: 0.8 }); sfx('thud', t0 + 0.66, { g: 0.7 });
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: true }, t0);
    const rows = [...tbl.children, foot];
    tl.fromTo(rows, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out', immediateRender: true }, t0 + 0.62);
    tl.to(el, { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' }, t1);
    F((t) => { el.style.display = (t > t0 - 0.1 && t < t1 + 0.6) ? '' : 'none'; });
  }
}

// ── 启动 ──
async function boot() {
  await Promise.all([
    document.fonts.load('400 20px "Sans SC"', '引擎A'), document.fonts.load('700 20px "Serif SC"', '引擎A'), document.fonts.load('400 20px "Mono"', 'A0'),
  ]);
  await document.fonts.ready;
  initChrome();
  initChapterCards();
  const host = document.getElementById('scenes');
  for (const s of L.scenes) {
    const root = h('div', 'scene', host);
    root.id = 'sc-' + s.id;
    const build = SCENE_BUILDERS[s.id];
    const c0 = s.start + (s.chap ? s.lead - 0.35 : 0.1);   // 场景内容可以开始出现的时刻
    if (build) build({ root, s, c0 });
    // 整场淡入淡出；场景外不参与排版
    tl.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', immediateRender: true }, c0);
    if (s !== L.scenes[L.scenes.length - 1]) tl.to(root, { autoAlpha: 0, duration: 0.55, ease: 'power1.in' }, s.end - 0.3);
    F((t) => { root.style.display = (t >= c0 - 0.05 && t <= s.end + 0.4) ? '' : 'none'; });
  }
  tl.set({}, {}, L.total);
  window.seek = (t) => { tl.time(t, false); for (const fn of FF) fn(t); };
  window.TOTAL = L.total;
  const q = new URLSearchParams(location.search);
  if (q.get('clean')) document.getElementById('stage').classList.add('clean');
  window.seek(parseFloat(q.get('t') || '0'));
  document.body.dataset.ready = '1';
  return true;
}
