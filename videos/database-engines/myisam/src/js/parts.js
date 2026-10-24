// 本片的部件（D1 终端风格）：终端窗、字节格、users 表的字段配色与解码。数据只取自 data.js（window.REAL）。
const R = window.REAL;

// ── 终端窗 ──
// const t = term(父, x, y, w, h, '标题栏');  t.line(html, 时刻, { row })  整行瞬间出现；t.cmd(sql, 时刻) 打出一条命令，返回打完的时刻
function term(parent, x, y, w, hh, title) {
  const el = h('div', 'term', parent); px(el, x, y, w, hh);
  const bar = h('div', 'bar', el, title || '');
  const body = h('div', 'body', el);
  let n = 0;
  const api = {
    el, bar, body,
    line(html, t, o = {}) {
      if (o.row != null) n = o.row;
      const e = h('div', 'tl', body, html); css(e, { position: 'absolute', left: 0, top: n * 43 + 'px' }); n++;
      if (t != null) { appear(e, t); if (o.sfx !== false) sfx(o.snd || 'blip', t, { g: o.g != null ? o.g : 0.3 }); }
      return e;
    },
    lines(arr, t, o = {}) { return arr.map((s, i) => api.line(s, t + i * (o.step != null ? o.step : 0.04), { ...o, sfx: i === 0 && o.sfx !== false, row: i === 0 ? o.row : undefined })); },
    cmd(sql, t, o = {}) {
      const e = api.line('', null, o);
      h('span', 'p', e, o.prompt || 'mysql&gt; ');
      const s = h('span', '', e);
      appear(e, t - 0.25);
      const cps = o.cps || 30, end = t + tokenize(sql).filter((k) => k.ch).length / cps;
      typeText(s, sql, t, cps, { cursorUntil: o.cursorUntil != null ? o.cursorUntil : end + 0.4, sfxGain: 0.55 });
      return end;
    },
    skip(k = 1) { n += k; },
    row(k) { n = k; },
  };
  return api;
}

// ── users 表：一行 16 字节 = 标志 1 + id 4（低位在前）+ 名字 10（空格补齐）+ 年龄 1 ──
const FIELD = (c) => (c === 0 ? 'flag' : c <= 4 ? 'id' : c <= 14 ? 'name' : 'age');
const userCls = (c, b) => (FIELD(c) === 'name' && b === '20' ? 'f-pad' : 'f-' + FIELD(c));
function decodeUser(hex32) {
  const b = hex32.match(/../g).map((x) => parseInt(x, 16));
  if (b[0] === 0) return { del: true, link: parseInt(hex32.slice(2, 14), 16) };
  return { del: false, id: b[1] | (b[2] << 8) | (b[3] << 16) | (b[4] << 24), name: String.fromCharCode(...b.slice(5, 15)).trim(), age: b[15] };
}
const rowsOf = (hex) => hex.match(/.{32}/g);
const off4 = (n) => n.toString(16).padStart(4, '0');

// ── 字节格 ──
// const g = hexDump(父, x, y, hex, { cw, rh, offW, decX, cls(c, b), dec(row) })
// g.cells[i]、g.rows[r]、g.offs[r]、g.decs[r]；g.poke(i, 新字节, 时刻, 类名)；g.at(i) 给出第 i 格中心在父元素里的坐标
function hexDump(parent, x, y, hex, o = {}) {
  const cw = o.cw || 54, rh = o.rh || 58, offW = o.offW != null ? o.offW : 118, cols = o.cols || 16;
  const el = h('div', 'hx', parent); px(el, x, y);
  const bytes = hex.match(/../g), nRows = Math.ceil(bytes.length / cols);
  const cells = [], rows = [], offs = [], decs = [];
  for (let r = 0; r < (o.rows || nRows); r++) {
    const row = h('div', 'row', el); css(row, { top: r * rh + 'px', width: (offW + cols * cw + 400) + 'px' });
    rows.push(row);
    if (offW) { const of = h('div', 'off', row, off4(r * cols)); css(of, { left: '0px' }); offs.push(of); }
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c, b = bytes[i];
      const e = h('div', 'b ' + (b == null ? '' : (o.cls ? o.cls(c, b) : '')), row, b == null ? '' : b);
      css(e, { left: offW + c * cw + 'px', width: (cw - 4) + 'px' });
      cells.push(e);
    }
    if (o.dec) { const d = h('div', 'dec', row, bytes[r * cols] == null ? '' : o.dec(r)); css(d, { left: (o.decX || offW + cols * cw + 36) + 'px' }); decs.push(d); }
  }
  const api = {
    el, cells, rows, offs, decs, cw, rh, offW,
    poke(i, b, t, cls) { keyed(cells[i]).at(t, { html: b, cls: 'b ' + (cls || '') }); },
    at(i) { const r = Math.floor(i / cols), c = i % cols; return { x: x + offW + c * cw + (cw - 4) / 2, y: y + r * rh + rh / 2, l: x + offW + c * cw, t: y + r * rh }; },
    rowBox(r, c0 = 0, c1 = cols - 1) { return { x: x + offW + c0 * cw - 6, y: y + r * rh - 2, w: (c1 - c0 + 1) * cw + 8, h: rh + 2 }; },
  };
  return api;
}

// 方框：在 (x, y, w, h) 处画一个平涂描边框
function ring(parent, b, cls = '') { const e = h('div', 'ring ' + cls, parent); px(e, b.x, b.y, b.w, b.h); return e; }
// 文字标签
function tag(parent, x, y, html, cls = '') { const e = h('div', 'tag ' + cls, parent, html); px(e, x, y); return e; }
function lab(parent, x, y, html, cls = '') { const e = h('div', 'lab ' + cls, parent, html); px(e, x, y); return e; }

// 镜头轨迹：同 cam.track，但每段的时长截到下一段开始之前（慢漂移的时长按估算给，和下一段重叠会让画面依赖播放历史）
function track(cam, t0, start, keys) {
  const ks = keys.map((k) => k.slice());
  let prevEnd = t0;
  for (let i = 0; i < ks.length; i++) {
    const tt = ks[i][0] == null ? prevEnd + 0.15 : ks[i][0];
    let d = ks[i][2] != null ? ks[i][2] : 1.4;
    const next = ks[i + 1] && ks[i + 1][0] != null ? ks[i + 1][0] : null;
    if (next != null && tt + d > next - 0.05) d = Math.max(0.1, next - 0.05 - tt);
    ks[i][2] = d; prevEnd = tt + d;
  }
  cam.track(t0, start, ks);
}
