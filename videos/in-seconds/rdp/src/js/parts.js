// 本片的部件：磁贴、屏幕、记事本、帧流、字形位图、按面积画字节的磁贴。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，或登记补间，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// MiniMax 的词时刻：逗号后的第一个字常被提前 0.3–1 秒标出；取词时用它后面那个字的时刻减 0.05 秒更稳（见 README「设计」）
const W = (id, word, off = 0) => T(id, word, off);

// ── 磁贴：纯色方块，左上小标题，左下大字 ──
function tile(parent, color, x, y, w, hh, title = '', big = '', bigCls = '') {
  const e = h('div', 'tile c-' + color, parent); px(e, x, y, w, hh);
  if (title) h('div', 'tl', e, title);
  if (big) h('div', 'bn ' + bigCls, e, big);
  return e;
}

// ── 屏幕：一块带边框的桌面；desk 是里面的画布 ──
function screen(parent, x, y, w, hh, caption) {
  const el = h('div', 'screen', parent); px(el, x, y, w, hh);
  const desk = h('div', 'desk', el);
  if (caption) h('div', 'cap', el, caption);
  return { el, desk, x, y, w, h: hh };
}

// ── 记事本：白纸上若干行 Mono 字。返回 { el, lines[] } ──
function notepad(parent, x, y, w, hh, title, lines, size = 26, lh = 40, top = 52) {
  const el = h('div', 'pad', parent); px(el, x, y, w, hh);
  h('div', 'bar', el, title);
  const out = lines.map((s, i) => { const l = h('div', 'ln', el, esc(s)); css(l, { top: top + i * lh + 'px', fontSize: size + 'px', lineHeight: lh + 'px' }); return l; });
  return { el, lines: out, lh, top, size };
}

// ── 帧流：录像的办法。从 a 点到 b 点，每隔 period 秒发出一帧灰色小方块，走 travel 秒。只在 [t0, t1) 里发帧 ──
// 每一帧的位置都由 t 直接算出（发出时刻 = t0 + k × period）
function frameStream(parent, t0, t1, a, b, o = {}) {
  const period = o.period || 0.22, travel = o.travel || 1.1, fw = o.w || 76, fh = o.h || 48, n = Math.ceil(travel / period) + 2;
  const pool = [];
  for (let i = 0; i < n; i++) {
    const e = h('div', 'blk ' + (o.cls || 'c-vid'), parent); px(e, 0, 0, fw, fh); e.style.opacity = '0'; e.dataset.name = '帧';
    // 每一帧是那边桌面的一张缩略图（灰底上白纸与两块磁贴），整张盖一层灰：录下来的是像素
    if (!o.plain) { thumbFrame(e, fw, fh); const v = blk(e, 'c-vid', 0, 0, fw, fh); v.style.opacity = '0.3'; }
    pool.push(e);
  }
  F((t) => {
    const kNow = Math.floor((t - t0) / period);
    for (let i = 0; i < n; i++) {
      const e = pool[i];
      // 这个池位当前承载的帧号：kNow - j，j 从 0 到 n-1，按 i 取模固定分配
      let k = kNow - (((kNow - i) % n) + n) % n;
      const spawn = t0 + k * period, u = (t - spawn) / travel;
      const on = k >= 0 && spawn < t1 && u >= 0 && u <= 1;
      if (!on) { if (e.style.opacity !== '0') e.style.opacity = '0'; continue; }
      const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) + (o.wave ? Math.sin(k * 1.7) * o.wave : 0);
      e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      e.style.opacity = String(Math.min(1, u * 6, (1 - u) * 6).toFixed(3));
    }
  });
  return pool;
}

// ── 字形位图：规范 [MS-RDPEGDI] 4.6.1 的 1 bpp 位图，宽 w，每行一个字节取高 w 位 ──
function glyphGrid(parent, x, y, cell, bytes, w = 5, gap = 3) {
  const cells = [];
  bytes.forEach((row, r) => { for (let c = 0; c < w; c++) { const e = h('div', 'px' + (row & (0x80 >> c) ? ' on' : ''), parent); px(e, x + c * (cell + gap), y + r * (cell + gap), cell, cell); cells.push(e); } });
  return cells;
}

// ── 按面积画字节：边长 = √(字节数 × k)，面积与字节数成正比 ──
const sideOf = (bytes, k) => Math.max(3, Math.round(Math.sqrt(bytes * k)));

// ── 沿直线把一个元素从 a 搬到 b（用 x/y 变换，起止都写定，与播放历史无关）──
function travel(e, t, d, a, b, ease0 = 'power2.inOut') {
  fromTo(e, t, { x: a.x, y: a.y }, { x: b.x, y: b.y, duration: d, ease: ease0, immediateRender: false });
}

// ── 描线：描之前整条不可见（没描出来的路径，圆头线帽会留下一个点）──
function drawIn(p, t, d = 0.6) {
  tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, t);
  draw(p, t, d);
}

// ── 图标：Metro 风格的单色线框图标（24 单位画布，描边用 currentColor）──
const ICONS = {
  pc: '<rect x="2.5" y="3.5" width="19" height="13" /><path d="M9 20.5h6M12 16.5v4" />',
  server: '<rect x="4" y="3" width="16" height="5" /><rect x="4" y="10" width="16" height="5" /><rect x="4" y="17" width="16" height="4" /><path d="M7 5.5h1M7 12.5h1M7 19h1" />',
  doc: '<path d="M6 2.5h8.5L19 7v14.5H6z" /><path d="M14.5 2.5V7H19M9 11h7M9 14h7M9 17h5" />',
  screen: '<rect x="2.5" y="4.5" width="19" height="13" /><path d="M6 11h12M6 11l2-2M6 11l2 2M18 11l-2-2M18 11l-2 2M9 21h6M12 17.5V21" />',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21M8 10.5h5M10.5 8v5" />',
  keyboard: '<rect x="2" y="6" width="20" height="12" /><path d="M5 9.5h1M8 9.5h1M11 9.5h1M14 9.5h1M17 9.5h2M5 12.5h2M9 12.5h1M12 12.5h1M15 12.5h1M18 12.5h1M7 15.5h10" />',
  clock: '<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />',
  clip: '<rect x="5" y="4" width="14" height="17.5" /><path d="M9 2.5h6V6H9zM8.5 11h7M8.5 14h7M8.5 17h4" />',
  printer: '<path d="M7 9V3h10v6M7 17H3.5V9h17v8H17M7 14h10v7H7z" />',
  speaker: '<path d="M3.5 9.5h4l5-4v13l-5-4h-4z" /><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11" />',
  record: '<rect x="2.5" y="6.5" width="13" height="11" /><path d="M15.5 10.5l6-3.5v10l-6-3.5" /><circle cx="7" cy="10" r="1.2" />',
  game: '<path d="M7 8h10a4.5 4.5 0 014.3 5.8l-1.1 3.7a2.4 2.4 0 01-4 1L14 16h-4l-2.2 2.5a2.4 2.4 0 01-4-1l-1.1-3.7A4.5 4.5 0 017 8z" /><path d="M7.5 11v4M5.5 13h4M15.5 12h.01M17.5 14h.01" />',
  fill: '<path d="M5 11l7-7 7.5 7.5-7 7z" /><path d="M5 11h14.5M20 15.5s1.5 2 1.5 3a1.5 1.5 0 01-3 0c0-1 1.5-3 1.5-3z" />',
  move: '<path d="M12 21V4M12 4l-5 5M12 4l5 5" /><path d="M5 21h14" />',
  link: '<path d="M10 14a4 4 0 005.7 0l3.3-3.3a4 4 0 00-5.7-5.7L12 6.3" /><path d="M14 10a4 4 0 00-5.7 0L5 13.3a4 4 0 005.7 5.7l1.3-1.3" />',
  check: '<path d="M4.5 12.5l5 5 10-11" />',
  cross: '<path d="M6 6l12 12M18 6L6 18" />',
  globe: '<circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />',
  terminal: '<rect x="3" y="4" width="18" height="12" /><path d="M8 20h8M12 16v4" />',
  phone: '<rect x="7" y="2.5" width="10" height="19" /><path d="M11 18.5h2" />',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />',
};
function icon(parent, name, x, y, size = 64, color = 'var(--fg)', sw = 1.6) {
  const e = h('div', 'abs ico', parent); px(e, x, y, size, size); e.style.color = color; e.dataset.name = '图标 ' + name;
  e.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="square" stroke-linejoin="miter">${ICONS[name] || ''}</svg>`;
  return e;
}

// ── 磁贴（Windows 8 开始屏的样子）：图标在中间偏上，标签在左下 ──
function mtile(parent, color, x, y, w, hh, o = {}) {
  const e = h('div', 'tile c-' + color, parent); px(e, x, y, w, hh);
  if (o.icon) { const s = o.iconSize || Math.round(Math.min(w, hh) * 0.42); icon(e, o.icon, o.iconX != null ? o.iconX : Math.round((w - s) / 2), o.iconY != null ? o.iconY : Math.round((hh - s) / 2 - (o.label ? 14 : 0)), s); }
  if (o.big) { const b = h('div', 'abs mt-big', e, o.big); px(b, 20, o.bigY != null ? o.bigY : 14); if (o.bigSize) b.style.fontSize = o.bigSize + 'px'; }
  if (o.label) { const l = h('div', 'abs mt-lab', e, o.label); css(l, { left: '16px', bottom: '10px' }); }
  return e;
}

// ── 标志：官网取得的横版标志（research/MATERIALS.md）。图片载入后引擎才置就绪 ──
const LOGO = { todesk: ['img/todesk.svg', 128 / 28], uu: ['img/uu.png', 256 / 72] };
function logo(parent, which, x, y, w) {
  const [src, ratio] = LOGO[which];
  const im = h('img', 'abs logo', parent); im.src = src; px(im, x, y, w, Math.round(w / ratio)); im.alt = which; im.dataset.name = which === 'todesk' ? 'ToDesk 标志' : '网易 UU 远程标志';
  window.PENDING.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve());
  return im;
}

// ── 翻入：Windows 8 开始屏的「旋转门」入场，绕左边缘从 -80° 转到 0° ──
function turnIn(e, t, o = {}) {
  fromTo(e, t, { rotationY: o.from != null ? o.from : -80, transformPerspective: 1200, transformOrigin: '0% 50%', opacity: 0 },
    { rotationY: 0, opacity: 1, duration: o.d || 0.55, ease: 'power3.out', immediateRender: true });
}
// 一组磁贴依次翻入
const turnAll = (els, t, step = 0.07, o = {}) => els.forEach((e, i) => turnIn(e, t + i * step, o));

// ── 显示器：屏幕下面加一个支架 ──
function monitor(parent, x, y, w, hh, caption) {
  const S = screen(parent, x, y, w, hh, caption);
  const neck = blk(S.el, 'c-tile', Math.round(w / 2 - 30), hh, 60, 34), base = blk(S.el, 'c-tile', Math.round(w / 2 - 110), hh + 34, 220, 12);
  neck.dataset.name = base.dataset.name = '支架';
  return S;
}

// ── 桌面缩略图：录像发出的每一帧画成那边桌面的样子（白纸一页、两块磁贴）──
function thumbFrame(e, fw, fh) {
  blk(e, 'c-paper', Math.round(fw * 0.08), Math.round(fh * 0.12), Math.round(fw * 0.56), Math.round(fh * 0.72));
  [0.28, 0.4, 0.62].forEach((yy) => { const l = blk(e, 'c-vid2', Math.round(fw * 0.13), Math.round(fh * yy), Math.round(fw * 0.36), 3); });
  blk(e, 'c-rdp', Math.round(fw * 0.7), Math.round(fh * 0.12), Math.round(fw * 0.22), Math.round(fh * 0.32));
  blk(e, 'c-you', Math.round(fw * 0.7), Math.round(fh * 0.52), Math.round(fw * 0.22), Math.round(fh * 0.32));
}
