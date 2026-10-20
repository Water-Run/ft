// 时间线引擎（工具包通用版）：整部片子是时间 t 的纯函数。
// - GSAP 时间线（暂停态）负责位移、透明度等补间，逐帧 seek
// - F() 注册的帧函数负责打字机、计数、字幕这类「由 t 直接算出内容」的东西
// 这样任意一帧都能独立渲染，分片并行出帧不会有状态漂移。
// 约束：不用 CSS animation / transition，不用 setTimeout / requestAnimationFrame 驱动画面，不用 tl.call()；
//       随机数要固定种子。一切状态只由 window.seek(t) 决定。
// 项目侧在 js/config.js 里给出 window.ENGINE = { fonts: [[css 字体串, 样字]…], chrome: () => {…}, sceneFade, sceneCut }
const L = layoutScript(window.DUR);
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.7 } });
const FF = [];
const F = (fn) => FF.push(fn);
const SCENE_BUILDERS = {};
// 音效事件：场景里调用 sfx('tick', t) 登记，混音时由 tools/mix.py 合成并铺到时间线上。
// 名称：tick key blip pop whoosh thud chime error riser beep drive（见 mix.py 的 SFX 表）；g 为相对音量（1 = 默认），p 为声像（-1 左 … 1 右）
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
function flash(e, t, color = 'rgba(255,255,255,.55)') {
  sfx('blip', t);
  tl.fromTo(e, { boxShadow: `0 0 0 0px ${color}` }, { boxShadow: `0 0 0 10px rgba(255,255,255,0)`, duration: 0.9, ease: 'power2.out', immediateRender: false }, t);
}
// SVG 路径描线
function draw(path, t, d = 0.9, o = {}) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = o.dash ? o.dash : len;
  if (o.dash) { tl.fromTo(path, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 0.6, immediateRender: true }, t); return; }
  tl.fromTo(path, { strokeDashoffset: len, autoAlpha: 1 }, { strokeDashoffset: 0, duration: d, ease: o.ease || 'power2.inOut', immediateRender: true }, t);
}

// ── 镜头：内容放进一个 world 容器，镜头运动 = 对 world 做反向变换 ──
// const cam = makeCamera(worldEl);  cam.to(t, { x, y, z, r }, { d, ease })   x/y 为镜头中心在 world 里的坐标，z 为放大倍数
// 连续的推、拉、摇、移比「整屏淡入淡出换面板」有动势得多；配合不同深度的层可做视差
function makeCamera(world, W = 1920, H = 1080) {
  const st = { x: W / 2, y: H / 2, z: 1, r: 0 };
  const apply = () => { world.style.transform = `translate(${W / 2}px, ${H / 2}px) scale(${st.z}) rotate(${st.r}deg) translate(${-st.x}px, ${-st.y}px)`; };
  world.style.transformOrigin = '0 0';
  F(apply); apply();
  return {
    st,
    to(t, v, o = {}) { tl.to(st, { ...v, duration: o.d || 1.4, ease: o.ease || 'power3.inOut' }, t); if (o.sfx !== false) sfx('whoosh', t, { g: o.sfxGain != null ? o.sfxGain : 0.6 }); },
    cut(t, v) { tl.set(st, v, t); },
    // 把镜头对准某个元素（构建期量位置），pad 为四周留白比例
    frame(t, el, o = {}) { const b = box(el, world); const z = Math.min(W / (b.w * (1 + (o.pad != null ? o.pad : 0.4))), H / (b.h * (1 + (o.pad != null ? o.pad : 0.4)))); this.to(t, { x: b.cx, y: b.cy, z: Math.min(o.maxZ || 6, z) }, o); },
  };
}

// ── 字幕：按旁白时间显示；字幕文本里 *词* 表示强调 ──
function initCaptions() {
  const cap = document.querySelector('#caption span');
  if (!cap) return;
  const capHtml = (s) => s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const cues = L.order.map((id) => L.cues[id]).filter((c) => c.cap);
  let lastCap = null;
  F((t) => {
    let cur = null, a = 0;
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i], next = cues[i + 1];
      const end = Math.min(c.end + 0.28, next ? next.start - 0.06 : c.end + 0.5);
      if (t >= c.start - 0.08 && t < end) { cur = c; a = Math.min(clamp((t - (c.start - 0.08)) / 0.14), clamp((end - t) / 0.14)); break; }
    }
    if (cur !== lastCap) { cap.innerHTML = cur ? capHtml(cur.cap) : ''; lastCap = cur; }
    cap.style.opacity = cur ? a.toFixed(3) : 0;
  });
}

// ── 启动 ──
async function boot() {
  const E = window.ENGINE || {};
  await Promise.all((E.fonts || []).map(([font, sample]) => document.fonts.load(font, sample)));
  await document.fonts.ready;
  initCaptions();
  if (E.chrome) E.chrome();                 // 项目自己的常驻元素：章节卡、角标、进度、背景运动
  const host = document.getElementById('scenes');
  for (const s of L.scenes) {
    const root = h('div', 'scene', host);
    root.id = 'sc-' + s.id;
    const build = SCENE_BUILDERS[s.id];
    const c0 = s.start + (s.chap ? s.lead - 0.35 : 0.1);   // 场景内容可以开始出现的时刻（章节卡之后）
    if (build) build({ root, s, c0 });
    if (E.sceneFade !== false) {
      // 默认：整场淡入淡出。想做场间的连续转场（匹配剪辑、镜头穿越）就设 ENGINE.sceneFade = false，自己编排
      tl.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', immediateRender: true }, c0);
      if (s !== L.scenes[L.scenes.length - 1]) tl.to(root, { autoAlpha: 0, duration: 0.55, ease: 'power1.in' }, s.end - 0.3);
      F((t) => { root.style.display = (t >= c0 - 0.05 && t <= s.end + 0.4) ? '' : 'none'; });
    } else {
      // sceneFade = false：场景之间是硬切。每个场景的内容只在「本场开始后 sceneCut 秒」到「下一场开始后 sceneCut 秒」之间显示，
      // 切换那一刻要由常驻层（#hud）里的整屏色块盖住（章节卡或转场色块），观众看到的是色块刷过、底下已换了场景。
      const cut = E.sceneCut != null ? E.sceneCut : 0.45;
      const idx = L.scenes.indexOf(s), nx = L.scenes[idx + 1];
      const a = idx === 0 ? -1 : s.start + cut, b = nx ? nx.start + cut : Infinity;
      F((t) => { root.style.display = (t >= a && t < b) ? '' : 'none'; });
    }
  }
  tl.set({}, {}, L.total);
  window.seek = (t) => { tl.time(t, false); for (const fn of FF) fn(t); };
  window.TOTAL = L.total;
  window.seek(parseFloat(new URLSearchParams(location.search).get('t') || '0'));
  document.body.dataset.ready = '1';
  return true;
}
