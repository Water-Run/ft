// 本片的部件：屏与镜头、文档部件、堆页条、B 树、页的比例条、字节格。数据只读 window.DATA（tools/gen_data.py 生成）。
const D = window.DATA;
const FRAME = { top: 110, bottom: 940, left: 72, right: 1848 };   // 顶栏以下、字幕以上的可读区
// 按词对齐的画面提前 0.12 秒：动画到位要一点时间，卡在词的起点上看着比声音慢（WaterRun 看 r3b：「画面跟不上动画 比如 支持事务」）
const T_EXACT = T;
T = function (id, word, shift = 0) { return T_EXACT(id, word, shift) - (word ? 0.12 : 0); };

// ── 屏与镜头 ──
// 一章由若干屏组成，在原地换内容。screens(world, [t0, t1, t2, …]) 建 n 个屏：第 i 屏从 marks[i] 出现到 marks[i+1] 换走
function screens(world, marks, opts = {}) {
  const out = [];
  for (let i = 0; i < marks.length - 1; i++) {
    const el = h('div', 'abs', world); px(el, 0, 0, 1920, 1080);
    const a = marks[i], b = marks[i + 1];
    // 原地换屏：旧内容上移淡出，新内容从下方升起（比左右刷屏更像同一张画布换内容）
    if (i === 0) appear(el, a); else tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: true }, a);
    if (i < marks.length - 2) tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in', immediateRender: false }, b - 0.35);
    out.push(el);
  }
  if (opts.sfx !== false) for (let i = 1; i < marks.length - 1; i++) sfx('whoosh', marks[i], { g: 0.35 });
  return out;
}
// 镜头：每屏只朝一个方向极慢横移（每秒不超过 1.2 像素、一屏合计不超过 24 像素），dir 按章交替。
// 换屏时的回位与换屏同步、用 0.65 秒缓动做完（混在新内容升起的动作里）；原先 0.04 秒回位，那一下整屏跳动（WaterRun 看 r3b：「似乎是切画面就触发抖动」）
function drift(world, s, marks, dir = 1) {
  const cam = makeCamera(world);
  const pts = [s.start, ...marks.filter((m) => m > s.start + 0.8 && m < s.end - 0.8), s.end];
  const segs = [];
  let first = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], last = i === pts.length - 2;
    const st = i === 0 ? a + 0.05 : a + 0.3, en = last ? b - 0.05 : b - 0.35, dur = Math.max(0.3, en - st), dx = Math.min(24, 1.2 * dur);
    const x0 = 960 - dir * dx / 2, x1 = 960 + dir * dx / 2;
    if (i === 0) first = { x: x0, y: 540, z: 1 };
    else segs.push([a - 0.35, { x: x0 }, 0.65, { ease: 'power2.inOut', sfx: false }]);
    segs.push([st, { x: x1 }, dur, { ease: 'none', sfx: false }]);
  }
  cam.track(s.start, first, segs);
  return cam;
}
// ── 文档部件 ──
const hdoc = (p, text, x, y, w = 1776) => { const e = h('div', 'h2', p, text); px(e, x, y, w); return e; };
const capt = (p, html, x, y, cls = 'cap') => { const e = h('div', cls, p, html); px(e, x, y); return e; };
const noteBox = (p, html, x, y, w, cls = '') => { const e = h('div', 'note ' + cls, p, html); px(e, x, y, w); return e; };
const glossBox = (p, term, html, x, y, w) => { const e = h('div', 'gloss', p, html); px(e, x, y, w); e.dataset.gloss = term; return e; };
const tagEl = (p, text, x, y, cls = '') => { const e = h('div', 'tag ' + cls, p, text); px(e, x, y); return e; };
const psqlBox = (p, html, x, y, w) => { const e = h('div', 'psql', p, html); px(e, x, y, w); return e; };
function tableDoc(p, head, rows, x, y, opts = {}) {
  const t = h('table', 'doc', p);
  t.innerHTML = '<tr>' + head.map((c) => `<th${opts.monoHead ? ' class="mono"' : ''}>${c}</th>`).join('') + '</tr>' +
    rows.map((r, i) => `<tr${(opts.hl || []).includes(i) ? ' class="hl"' : ''}>` + r.map((c, j) => `<td${(opts.mono || []).includes(j) ? ' class="mono"' : ''}>${c}</td>`).join('') + '</tr>').join('');
  px(t, x, y);
  return t;
}
// ── psql 终端：命令逐字敲出（提示符先在），结果一行行滑入；clear 之后从第一行重新写 ──
// 构建时按时间先后调用；返回的 type/print 各给出这一行写完的时刻
function term(p, x, y, w, rows, o = {}) {
  const lh = o.lh || 38, fs = o.fs || 25;
  const el = h('div', 'psql', p); px(el, x, y, w); css(el, { height: lh * rows + 32 + 'px', padding: '0', overflow: 'hidden' });
  el.dataset.name = o.name || 'psql';
  let n = 0, live = [], shown = false;
  set(el, 0, { autoAlpha: 0 });                                                 // 第一行出现之前，终端不显示（不留空框）
  const reveal = (t) => { if (shown) return; shown = true; tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: false }, t - 0.35); };
  const line = (html) => { const d = h('div', 'abs', el, html); px(d, 24, 16 + n * lh); css(d, { font: `500 ${fs}px var(--mono)`, lineHeight: lh + 'px', whiteSpace: 'pre', color: 'var(--ink)', fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0' }); n++; live.push(d); return d; };
  return {
    el,
    type(t, cmd, prompt = 'postgres=#', cps = 32) {
      reveal(t);
      const d = line(`<span class="p">${prompt}</span> `), sp = h('span', '', d);
      set(d, 0, { autoAlpha: 0 }); set(d, t - 0.25, { autoAlpha: 1 });
      const end = typeText(sp, cmd, t, cps, { cursorUntil: t + 0.01 + tokenize(cmd).filter((k) => k.ch).length / cps + 0.35, sfxGain: 0.5 });
      return end;
    },
    print(t, html, o2 = {}) { reveal(t); const d = line(html); if (o2.cls) d.classList.add(o2.cls); show(d, t, { y: 12, d: 0.35 }); return d; },
    clear(t) { live.forEach((d) => hide(d, t, { d: 0.2, y: -8 })); live = []; n = 0; },
  };
}
// 淡出退场：写明起点（避免「从当前值开始」在跳播时取到不同的起点）
function gone(e, t, d = 0.3) { tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, immediateRender: false }, t); }
// 视线框：一屏一个，讲到哪个东西就移到哪个东西上（at 给元素或 [x, y, w, h]；坐标是屏内坐标）。每一步写明起点，跳播也一样
function focusRing(p, color = '#b8442f') {
  const r = h('div', 'abs', p); css(r, { border: `5px solid ${color}`, pointerEvents: 'none' }); r.dataset.name = '视线框';
  let prev = null;
  set(r, 0, { autoAlpha: 0 });
  const api = {
    at(t, target, pad = 10) {
      const b = Array.isArray(target) ? { x: target[0], y: target[1], w: target[2], h: target[3] } : box(target, p);
      const st = { left: b.x - pad, top: b.y - pad, width: b.w + 2 * pad, height: b.h + 2 * pad };
      if (!prev) { set(r, t, { ...st, autoAlpha: 1 }); } else tl.fromTo(r, { ...prev }, { ...st, duration: 0.35, ease: 'power2.inOut', immediateRender: false }, t);
      prev = st; return api;
    },
    off(t) { gone(r, t, 0.25); return api; },
  };
  return api;
}
// 一个「请求」从 a 飞到 b（屏内坐标），到了以后淡掉；返回元素
function fly(p, html, a, b, t, o = {}) {
  const e = h('div', 'tag ' + (o.cls || ''), p, html); px(e, a[0], a[1]); if (o.fs) css(e, { fontSize: o.fs + 'px' });
  const d = o.d || 0.7;
  set(e, 0, { autoAlpha: 0 });
  tl.fromTo(e, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.18, immediateRender: false }, t);
  tl.to(e, { x: b[0] - a[0], y: b[1] - a[1], duration: d, ease: o.ease || 'power2.inOut' }, t + 0.15);
  // sink：落到目标上时缩小淡去，像被目标吸收，不压住目标上的字
  if (o.sink) tl.fromTo(e, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.55, duration: 0.25, ease: 'power1.in', immediateRender: false }, t + 0.15 + d - 0.2);
  else if (o.stay !== true) tl.to(e, { autoAlpha: 0, duration: 0.2 }, t + 0.15 + d + (o.hold || 0.05));
  return e;
}
// 交叉淡变：同一处的文字换成新的（旧的淡出、新的淡入），不闪
function morphText(p, x, y, cssObj, steps) {
  const els = steps.map(([t, html], i) => { const e = h('div', 'abs', p, html); px(e, x, y); css(e, { whiteSpace: 'nowrap', ...cssObj }); set(e, 0, { autoAlpha: 0 }); return e; });
  steps.forEach(([t], i) => {
    tl.fromTo(els[i], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, t);
    if (i + 1 < steps.length) tl.to(els[i], { autoAlpha: 0, y: -14, duration: 0.3, ease: 'power2.in' }, steps[i + 1][0] - 0.05);
  });
  return els;
}
// 一条带箭头的线（SVG 叠加层上）
function link(ov, pts, color = 'accent', o = {}) {
  const d = 'M' + pts.map((q) => q.join(',')).join(' L');
  return path(ov, d, color, { w: o.w || 3, arrow: o.arrow !== false, dashed: o.dashed, opacity: o.opacity });
}
function curve(ov, a, b, color = 'accent', o = {}) {
  const my = o.bend != null ? o.bend : (a[1] + b[1]) / 2;
  const d = `M${a[0]},${a[1]} C${a[0]},${my} ${b[0]},${my} ${b[0]},${b[1]}`;
  return path(ov, d, color, { w: o.w || 3, arrow: o.arrow !== false, dashed: o.dashed, opacity: o.opacity });
}

// ── 堆页条：47 页一排，每页按真实行数填充 ──
function heapStrip(p, x, y, o = {}) {
  const n = D.heap.pages, gap = o.gap || 4, w = o.w || 34, hgt = o.h || 120;
  const el = h('div', 'abs', p); px(el, x, y, n * (w + gap), hgt + 40);
  el.dataset.name = '堆：47 页';
  const pages = [];
  for (let i = 0; i < n; i++) {
    const pg = h('div', 'pg-mini', el); px(pg, i * (w + gap), 0, w, hgt);
    const fill = h('div', 'abs', pg); const fh = Math.round((hgt - 6) * D.heap.rows[i] / 88);
    css(fill, { left: '2px', right: '2px', bottom: '2px', height: fh + 'px', background: 'var(--sky-lt)' });
    pg.fill = fill;
    pages.push(pg);
  }
  for (const i of o.labels || [0, 23, 46]) {
    const l = h('div', 'cap mono', el, String(i)); px(l, i * (w + gap) + w / 2 - 14, hgt + 6); css(l, { fontSize: '22px' });
  }
  el.pages = pages; el.pw = w + gap;
  return el;
}
// ── 堆的物理样子：一页页 8 KB 的页卡，按在文件里的先后一行行排开 ──
// 每张页卡与真的页一样：顶上一道页头（深蓝），接着是项目指针（从左往右长），行从页底往上放，中间是空隙
function heapGrid(p, x, y, o = {}) {
  const n = D.heap.pages, cols = o.cols || 16, cw = o.cw || 100, ch = o.ch || 112, gx = o.gx || 8, gy = o.gy || 34;
  const el = h('div', 'abs', p); px(el, x, y, cols * (cw + gx) - gx, Math.ceil(n / cols) * (ch + gy)); el.dataset.name = '堆：47 页';
  const pages = [];
  for (let i = 0; i < n; i++) {
    const cx = (i % cols) * (cw + gx), cy = Math.floor(i / cols) * (ch + gy);
    const pg = h('div', 'abs', el); px(pg, cx, cy, cw, ch); css(pg, { border: '2px solid var(--pg)', background: '#fff', overflow: 'hidden' });
    const hd = h('div', 'abs', pg); px(hd, 0, 0, cw - 4, 7); css(hd, { background: 'var(--navy)' });
    const lp = h('div', 'abs', pg); px(lp, 0, 7, cw - 4, 7); css(lp, { background: 'var(--sky)', transformOrigin: '0 50%' });
    const full = (ch - 4 - 16) * D.heap.rows[i] / 88;
    const rows = h('div', 'abs', pg); css(rows, { left: '0px', right: '0px', bottom: '0px', height: full + 'px', background: 'repeating-linear-gradient(0deg,#cfe0ee 0 5px,#fff 5px 6px)', transformOrigin: '50% 100%' });
    const lab = h('div', 'abs cap mono', el, String(i)); px(lab, cx + 2, cy + ch + 2); css(lab, { fontSize: '22px', color: 'var(--ink2)' });
    pg.lp = lp; pg.rows = rows; pg.lab = lab; pg.k = D.heap.rows[i] / 88; pages.push(pg);
  }
  el.pages = pages; el.pos = (i) => ({ x: x + (i % cols) * (cw + gx), y: y + Math.floor(i / cols) * (ch + gy), w: cw, h: ch });
  return el;
}
// 一页里的第 k 行（自下而上，88 行一页）所在的位置，用来指 Alice
function rowSpot(strip, page, row, hgt = 120) {
  const pw = strip.pw, w = pw - 4;
  return { x: page * pw + w / 2, y: hgt - 3 - (hgt - 6) * (row - 0.5) / 88 };
}

// ── B 树：一个根，下面一排叶子，按实测的叶子数画 ──
function btree(p, ov, x, y, w, leafCount, o = {}) {
  const lw = Math.min(o.leafW || 90, (w - (leafCount - 1) * 4) / leafCount), gap = (w - leafCount * lw) / Math.max(1, leafCount - 1);
  const rootW = o.rootW || 220;
  const root = h('div', 'node', p, o.rootText || '根'); px(root, x + w / 2 - rootW / 2, y, rootW);
  const leaves = [];
  for (let i = 0; i < leafCount; i++) {
    const lf = h('div', 'node leaf', p, o.leafText ? o.leafText(i) : ''); px(lf, x + i * (lw + gap), y + (o.dy || 110), lw);
    if (lw < 40) css(lf, { fontSize: '22px' });
    leaves.push(lf);
  }
  const edges = leaves.map((lf, i) => {
    const a = [x + w / 2 + (i - (leafCount - 1) / 2) * Math.min(14, rootW / leafCount), y + 40];
    const b = [x + i * (lw + gap) + lw / 2, y + (o.dy || 110)];
    return path(ov, `M${a[0]},${a[1]} L${b[0]},${b[1]}`, 'dim', { w: 2, arrow: false });
  });
  root.dataset.name = (o.name || 'B 树') + '的根';
  return { root, leaves, edges, lw, gap, leafX: (i) => x + i * (lw + gap) + lw / 2, leafY: y + (o.dy || 110) + 40 };
}

// ── 页的比例条：0 · 页头 · 项目指针 · 空隙 · 行 · 8192 ──
function pageBar(p, x, y, w, hgt = 90) {
  const P = D.page23, k = w / 8192;
  const el = h('div', 'page', p); px(el, x, y, w, hgt);
  const seg = (a, b, bg, name) => { const s = h('div', 'abs', el); px(s, a * k, 0, Math.max(2, (b - a) * k), hgt - 6); css(s, { background: bg }); s.dataset.name = name; return s; };
  const head = seg(0, 24, 'var(--navy)', '页头');
  const lps = seg(24, P.lower, 'var(--sky)', '项目指针');
  const free = seg(P.lower, P.upper, '#fff', '空隙');
  const rows = seg(P.upper, P.special, 'var(--sky-lt)', '行');
  return { el, head, lps, free, rows, k };
}

// ── 字节格：Alice 那一行的 82 字节，按字段分组 ──
function tupleFields() {
  const hh = D.page23.headerHex, dh = D.page23.dataHex;
  const by = (s, a, b) => s.slice(a * 2, b * 2).match(/../g).join(' ');
  return {
    head: [['t_xmin', by(hh, 0, 4), 4], ['t_xmax', by(hh, 4, 8), 4], ['t_cid', by(hh, 8, 12), 4], ['t_ctid', by(hh, 12, 18), 6],
      ['infomask2', by(hh, 18, 20), 2], ['infomask', by(hh, 20, 22), 2], ['t_hoff', by(hh, 22, 23), 1], ['对齐', by(hh, 23, 24), 1]],
    data: [['id', by(dh, 0, 4), 4], ['长度', by(dh, 4, 5), 1], ['name', 'Alice + 45 个空格', 50], ['对齐', by(dh, 55, 56), 1], ['age', by(dh, 56, 58), 2]],
  };
}
const le32 = (hex) => parseInt(hex.split(' ').reverse().join(''), 16);
