// 本集的部件：屏、机器、码牌、三色线缆、指示灯、点阵大字。所有部件的状态都只由 t 决定（用补间或 F() 逐帧算，不存历史）。
// 图形的含义全片不变：米色方块 = 机器；墨色屏 = 机器吐出的响应原文；码牌 = 一个状态码（4xx、5xx 用朱红）；三色线缆 = 机器之间的连接。

const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const isErr = (code) => +String(code)[0] >= 4;
const E = (k) => window.ECHO[k];                         // 实验回显：E('404').status[0] → 'HTTP/1.1 404 Not Found'

// ── 屏：墨色矩形。addLine 在里面放一行等宽字（x, y 相对屏的左上） ──
function screen(parent, x, y, w, hh, name) {
  const e = h('div', 'scr', parent); px(e, x, y, w, hh);
  if (name) e.dataset.name = name;
  return e;
}
function addLine(scr, html, x, y, size, cls = '') {
  const e = h('div', 'ln ' + cls, scr, html); px(e, x, y); e.style.fontSize = size + 'px';
  return e;
}

// ── 机器：米色方块，顶上一条墨色铭牌 ──
function machine(parent, x, y, w, hh, name, o = {}) {
  const e = h('div', 'mach', parent); px(e, x, y, w, hh);
  const plateH = o.plateH || 60;
  const p = h('div', 'plate', e, name); css(p, { height: plateH + 'px', fontSize: (o.fs || 34) + 'px' });
  e.dataset.name = o.dname || name;
  e.plate = p;
  return e;
}

// ── 码牌：墨底像素数字；错误两类为朱红字。lit = 反成琥珀底（或朱红底）墨字，表示「此刻回来的就是它」 ──
function chip(parent, code, x, y, w, hh, fs) {
  const e = h('div', 'chip' + (isErr(code) ? ' e' : ''), parent, String(code)); px(e, x, y, w, hh);
  e.style.fontSize = (fs || Math.round(hh * 1.0)) + 'px';
  e.code = String(code);
  return e;
}
// 在 [t0, t1) 内把码牌反白（只换类名，不渐变颜色：底与字同时渐变会出现同色的中间帧）。可给多段：lightChip(e, [[a, b], [c, d]])
function lightChip(e, t0, t1 = Infinity) {
  const spans = Array.isArray(t0) ? t0 : [[t0, t1]], cls = isErr(e.code) ? 'elit' : 'lit';
  let last = null;
  F((t) => { const on = spans.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } });
}

// 同一个元素、同一个类名在几段时间里打开：合成一次登记（分两次 classAt 会互相覆盖，画面依赖播放历史）
function classSpans(e, cls, spans) {
  let last = null;
  F((t) => { const on = spans.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } });
}

// ── 三色线缆：三道平行的色条（琥珀、墨、朱红）。vertical 时竖着走 ──
function cable(parent, x, y, len, o = {}) {
  const e = h('div', 'abs', parent);
  const th = o.th || 8, gap = o.gap || 3, cols = ['bg-amber', 'bg-ink', 'bg-red'];
  if (o.vertical) { px(e, x, y, th * 3 + gap * 2, len); cols.forEach((c, i) => blk(e, c, i * (th + gap), 0, th, len)); }
  else { px(e, x, y, len, th * 3 + gap * 2); cols.forEach((c, i) => blk(e, c, 0, i * (th + gap), len, th)); }
  e.dataset.name = o.name || 'cable';
  return e;
}

// ── 指示灯：圆点。on / eon（朱红）两种亮法 ──
function led(parent, x, y, d = 28) { const e = h('div', 'led', parent); px(e, x, y, d, d); e.dataset.name = 'led'; return e; }

// ── 点阵大字：5×7 的方点阵，画在 SVG 里。返回 { el, chars: [每个字的 <g>] }；字色用 fill，可逐字改 ──
const DOT5x7 = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  x: ['00000', '00000', '10001', '01010', '00100', '01010', '10001'],
};
function dots(parent, str, x, y, cell, color, o = {}) {
  const gap = o.gap != null ? o.gap : Math.max(2, Math.round(cell * 0.14)), adv = 6 * cell;
  const W = str.length * adv - cell, H = 7 * cell;
  const s = svg('svg', { class: 'abs', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent); px(s, x, y, W, H);
  s.style.overflow = 'visible';
  const chars = [];
  [...str].forEach((ch, i) => {
    const g = svg('g', { fill: color, transform: `translate(${i * adv},0)` }, s);
    (DOT5x7[ch] || []).forEach((row, r) => [...row].forEach((b, c) => { if (b === '1') svg('rect', { x: c * cell, y: r * cell, width: cell - gap, height: cell - gap }, g); }));
    chars.push(g);
  });
  s.dataset.name = o.name || ('dots ' + str);
  return { el: s, chars, w: W, h: H, adv };
}
// 点阵字逐行亮起：t0 起每行间隔 dt 秒，一行一行「扫」出来（像点阵屏刷新）。只由 t 决定
function scanIn(d, t0, dt = 0.03) {
  const rows = [];
  d.chars.forEach((g) => [...g.children].forEach((r) => rows.push(r)));
  F((t) => {
    for (const r of rows) {
      const k = +r.getAttribute('y') / (d.h / 7);
      const on = t >= t0 + k * dt;
      if (r._on !== on) { r.style.visibility = on ? 'visible' : 'hidden'; r._on = on; }
    }
  });
}

// ── 区间显隐：[t0, t1) 可见，其余时候不可见。由 t 直接算，倒着跳也成立 ──
function during(e, t0, t1) {
  let last = null;
  F((t) => { const v = t >= t0 && t < t1; if (v !== last) { e.style.visibility = v ? 'visible' : 'hidden'; last = v; } });
}

// ── 回显日志：屏上同时留两条回显，像终端一样——新的一条出现在下面，上一条往上挪，再早的一条滚出屏顶 ──
// entries: [{ t, key, extra }]，t 为这一条出现的时刻；key 是实验回显的键；extra(e) 给出第三行（关键的头字段），缺省是正文
// o: { slots: [上格 y, 下格 y], x, sizes: [命令, 状态行, 第三行] }。位置与显隐都在帧函数里由 t 算出
function echoLog(scr, entries, o = {}) {
  const [yA, yB] = o.slots || [16, 168], x = o.x || 40, [s1, s2, s3] = o.sizes || [26, 50, 36];
  scr.style.overflow = 'hidden';
  const els = entries.map((en, i) => {
    const e = E(en.key), st = e.status[e.status.length - 1], code = st.split(' ')[1];
    const g = h('div', 'abs', scr); px(g, 0, 0, 10, 10);
    addLine(g, '<span class="dima">$ </span>' + esc(e.cmd), x, 0, s1, 'dim');
    addLine(g, esc(st), x, s1 + 12, s2, isErr(code) ? 'err' : '');
    addLine(g, esc(en.extra ? en.extra(e) : (e.body[0] || '')), x, s1 + s2 + 30, s3);
    g.dataset.name = 'echo ' + en.key;
    return g;
  });
  F((t) => {
    entries.forEach((en, i) => {
      const t1 = entries[i + 1] ? entries[i + 1].t : Infinity, t2 = entries[i + 2] ? entries[i + 2].t : Infinity;
      let y = yB, vis = t >= en.t && t < t2 + 0.3;
      if (t >= t1) y = lerp(yB, yA, ease.io3(clamp((t - t1) / 0.25)));
      if (t >= t2) y = lerp(yA, yA - (yB - yA), ease.io3(clamp((t - t2) / 0.3)));
      const g = els[i], v = vis ? 'visible' : 'hidden', tf = `translate(0px,${y.toFixed(1)}px)`;
      if (g._v !== v) { g.style.visibility = v; g._v = v; }
      if (g._tf !== tf) { g.style.transform = tf; g._tf = tf; }
    });
  });
  return els;
}

// ── 一枚在线缆上跑的「包」：墨底琥珀字的小牌子，从 (x0,y) 走到 (x1,y)。返回元素 ──
function packet(parent, html, x, y, w, hh, fs, cls = '') {
  const e = h('div', 'chip ' + cls, parent, html); px(e, x, y, w, hh);
  css(e, { fontFamily: '"Mono", "Sans SC"', fontWeight: 700, fontSize: fs + 'px' });
  e.dataset.name = 'packet';
  return e;
}
