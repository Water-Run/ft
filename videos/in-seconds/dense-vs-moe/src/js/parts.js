// 本集的部件：小工具、数字格式、格墙（黑线围出的一格格参数）。所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
// 数字分组：中文用空格，英文用逗号
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, LANG === 'zh' ? ' ' : ',');
// 权重原值：带符号、四位小数，负号用真正的减号
const wfmt = (x) => (x < 0 ? '−' : '+') + Math.abs(x).toFixed(4);
// 一条黑色粗线（水平或垂直），从一端画出来
function rule(parent, x, y, w, hh, t, dir, d = 0.45) {
  const e = blk(parent, 'bg-ink', x, y, w, hh);
  if (t != null) wipe(e, t, { dir, d, ease: 'power3.out' });
  return e;
}

// ── 格墙：一块黑底，上面排开 cols × rows 个纸色格子，黑底从格缝里露出来就是格线 ──
// o: { x, y, cols, rows, cw, ch, line }。返回 { frame, cells, at(c, r), cx(c), cy(r), w, h }
// 每个格子的状态由 state(i, t) 给出：'h' 不显示、'p' 白（存着、没用到）、'r' 红（这个 token 用到）。一帧之内统一刷新，只改变化了的格子。
function makeWall(parent, o) {
  const pitchX = o.cw + o.line, pitchY = o.ch + o.line;
  const W = o.line + o.cols * pitchX, H = o.line + o.rows * pitchY;
  const frame = blk(parent, 'bg-ink', o.x, o.y, o.fw || W, o.fh || H); frame.dataset.name = o.name || 'wall';
  const cells = [];
  for (let r = 0; r < o.rows; r++) for (let c = 0; c < o.cols; c++) {
    const e = blk(parent, 'bg-paper', o.x + o.line + c * pitchX, o.y + o.line + r * pitchY, o.cw, o.ch);
    e.dataset.name = 'cell'; cells.push(e);
  }
  const api = {
    frame, cells, w: W, h: H, pitchX, pitchY,
    cx: (c) => o.x + o.line + c * pitchX, cy: (r) => o.y + o.line + r * pitchY,
    index: (c, r) => r * o.cols + c,
    paint(state) {                         // state(i, c, r, t) → 'h' | 'p' | 'r'
      const last = cells.map(() => null);
      F((t) => {
        for (let i = 0; i < cells.length; i++) {
          const s = state(i, i % o.cols, Math.floor(i / o.cols), t);
          if (s === last[i]) continue; last[i] = s;
          const e = cells[i];
          e.style.visibility = s === 'h' ? 'hidden' : 'visible';
          e.style.background = s === 'r' ? C.red : C.paper;
        }
      });
    },
  };
  return api;
}

// ── token 块：黄底墨字的一格 ──
function tokenBlock(parent, label, x, y, s, size) {
  const e = h('div', 'tk bg-yel ink', parent, esc(label)); px(e, x, y, s, s); css(e, { fontSize: (size || Math.round(s * 0.36)) + 'px', fontFamily: LANG === 'zh' ? '"Sans SC"' : '"Inter"' });
  e.dataset.name = 'token';
  return e;
}
