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
    // 每一帧是一张缩小的截图：灰底上一块白纸
    if (!o.plain) { const p = blk(e, 'c-paper', Math.round(fw * 0.1), Math.round(fh * 0.16), Math.round(fw * 0.55), Math.round(fh * 0.68)); p.style.opacity = '0.8'; }
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
