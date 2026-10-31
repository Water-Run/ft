// 本片的部件：纸带、方框图（五部分 + 通道 + 编码纸式的存储格）、沿路径移动。
// 所有状态只由 t 决定：位置用 F() 按关键帧插值，内容切换用 keyed()。

const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
// 构建时就藏起来（tl.set 在 t=0 那一帧不生效）；之后由 wipe / appear 等入场动作显示
const hide0 = (e) => { e.style.visibility = 'hidden'; e.style.opacity = '0'; return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };

// ── 纸带：一个字。bits 为 8 位字符串（前 4 位动作、后 4 位格号；数据为数值），kind 'i' 指令（蓝）/ 'd' 数据（赭）──
const TAPE_P = 26;                                        // 孔距
function tape(parent, bits, kind, x, y, o = {}) {
  const w = 22 + bits.length * TAPE_P + (o.gap ? 14 : 0);
  const e = h('div', 'tape', parent); px(e, x, y, w);
  h('div', 'st', e).style.background = kind === 'i' ? 'var(--blue)' : 'var(--ochre)';
  const holes = [];
  [...bits].forEach((b, i) => {
    const xx = 18 + i * TAPE_P + (o.gap && i >= 4 ? 14 : 0);
    const ho = h('div', 'ho' + (b === '1' ? ' on' : ''), e); ho.style.left = xx + 'px'; holes.push(ho);
    h('div', 'sp', e).style.left = (xx + 8) + 'px';
  });
  e.holes = holes; e.w = w; e.dataset.name = (kind === 'i' ? '指令纸带 ' : '数据纸带 ') + bits;
  return e;
}

// ── 沿关键帧移动：keys = [[t, x, y, {s, r, a}] …]，相邻两帧之间用 io3 缓动；第一帧之前、最后一帧之后停在端点 ──
// 元素在 [keys[0].t, until) 之外不可见（until 缺省为无穷）
function mover(el, keys, until = Infinity, from = -Infinity) {
  const K = keys.map(([t, x, y, o = {}]) => ({ t, x, y, s: o.s ?? 1, r: o.r ?? 0, a: o.a ?? 1, e: o.e || ease.io3 }));
  let last = '';
  F((t) => {
    const on = t >= Math.max(from, K[0].t) - 1e-6 && t < until;
    let x = K[0].x, y = K[0].y, s = K[0].s, r = K[0].r, a = K[0].a;
    for (let i = 0; i < K.length - 1; i++) {
      const p = K[i], q = K[i + 1];
      if (t >= q.t) { x = q.x; y = q.y; s = q.s; r = q.r; a = q.a; continue; }
      if (t > p.t) { const k = q.e(clamp((t - p.t) / (q.t - p.t))); x = lerp(p.x, q.x, k); y = lerp(p.y, q.y, k); s = lerp(p.s, q.s, k); r = lerp(p.r, q.r, k); a = lerp(p.a, q.a, k); }
      break;
    }
    const st = on ? `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})|${a.toFixed(3)}` : 'off';
    if (st === last) return; last = st;
    if (!on) { el.style.visibility = 'hidden'; return; }
    const [tf, op] = st.split('|');
    el.style.visibility = ''; el.style.transform = tf; el.style.opacity = op;
  });
  el.style.left = '0px'; el.style.top = '0px'; el.style.transformOrigin = '0 0';
  return el;
}

// ── 方框图的几何（world 坐标，画幅 1920×968）──
const G = {
  I: { x: 96, y: 390, w: 180, h: 190 },
  CC: { x: 330, y: 160, w: 470, h: 310 },
  CA: { x: 330, y: 520, w: 470, h: 290 },
  M: { x: 1080, y: 160, w: 520, h: 650 },
  O: { x: 1648, y: 390, w: 180, h: 190 },
  busY: 495,                                              // 通道中线
};
const ROW = { y0: 268, h: 60, x: 1080 };                  // 存储格：第 i 格（从 1 起）的上沿 = y0 + (i - 1) * h
const rowY = (i) => ROW.y0 + (i - 1) * ROW.h;
// 两套程序（第 1–4 格）与数据（第 5–9 格）。说明栏是人读的注解
const PROG = {
  calc: [['00011000', '加 第8格'], ['00011001', '加 第9格'], ['00110111', '存 第7格'], ['11110000', '停']],
  game: [['01010101', '画 棋盘'], ['01100110', '读 按键'], ['01110101', '落 一子'], ['10000001', '回 第1格']],
};
const DATA = [['00000000', '0'], ['00000000', '0'], ['00000000', '—'], ['00000101', '5'], ['00000011', '3']];
// 开场时纸带落进存储器后堆放的位置（下一场从这里接着整理）：[种类, x, y, 旋转]
const PILE = [['i', 1120, 300, -4], ['i', 1336, 330, 5], ['i', 1150, 420, 3], ['i', 1344, 452, -6],
  ['d', 1110, 566, 6], ['d', 1326, 596, -3], ['d', 1140, 690, -5], ['d', 1350, 712, 4], ['d', 1236, 520, -2]];
const fmt = (b) => b.slice(0, 4) + ' ' + b.slice(4);

function box(parent, g, zh, en) {
  const e = h('div', 'box', parent); px(e, g.x, g.y, g.w, g.h);
  h('div', 'bt', e, zh); h('div', 'be', e, en);
  e.dataset.name = zh;
  return e;
}

// 建整张方框图。st：{ parts: 是否已在场, rows: null|'calc'|'game', pc, acc, r7 }。返回各部件的引用
function machine(world, st = {}) {
  const M = {};
  M.wires = overlay(world);
  const bx = (k, zh, en) => (M[k] = box(world, G[k], zh, en));
  bx('I', tr('输入', 'Input'), 'I'); bx('O', tr('输出', 'Output'), 'O');
  bx('CC', tr('控制器', 'Control'), 'CC · ' + tr('指挥', 'DIRECTS')); bx('CA', tr('运算器', 'Arithmetic'), 'CA · ' + tr('算数', 'COMPUTES'));
  bx('M', tr('存储器', 'Memory'), 'M · ' + tr('记东西', 'REMEMBERS'));
  // 通道：双线；左端一根竖线并入控制器与运算器
  const y = G.busY;
  M.bus = [path(M.wires, `M800,${y - 22} L1080,${y - 22}`, 'ink', { w: 3, arrow: false }), path(M.wires, `M800,${y + 22} L1080,${y + 22}`, 'ink', { w: 3, arrow: false }),
    path(M.wires, `M800,440 L800,550`, 'ink', { w: 3, arrow: false })];
  M.busLabel = txt(world, 'type', tr('通道', 'BUS'), 896, y - 70); M.busLabel.style.fontSize = '24px';
  M.io = [path(M.wires, `M276,485 L330,485`, 'ink', { w: 3, arrow: true }), path(M.wires, `M1600,485 L1648,485`, 'ink', { w: 3, arrow: true })];
  // 存储格：表头 + 9 行
  M.M.lastChild.style.left = '176px'; M.M.lastChild.style.top = '30px';          // 存储器的英文小字挪到标题右边，下面留给表头
  M.head = h('div', 'abs', world, [[22, tr('格', 'CELL')], [92, tr('内容', 'CONTENT')], [330, tr('是什么', 'MEANING')]].map(([x, w]) => `<span class="type" style="position:absolute;left:${x}px;font-size:24px">${w}</span>`).join(''));
  px(M.head, 1080, 224, 520, 30); M.head.dataset.name = '表头';
  M.rule = blk(world, '', 1080, 258, 520, 3); M.rule.style.background = 'var(--ink)';
  M.rows = [];
  for (let i = 1; i <= 9; i++) {
    const r = h('div', 'abs row', world); px(r, 1080, rowY(i), 520, ROW.h);
    const line = blk(r, '', 0, ROW.h - 1, 520, 1); line.style.background = 'var(--ink22)';
    const n = h('div', 'n', r, String(i)); px(n, 22, 9);
    const stripe = blk(r, '', 70, 8, 8, 42);
    const bits = h('div', 'bits', r, ''); px(bits, 92, 11);
    const nt = h('div', 'nt', r, ''); px(nt, 330, 12);
    r.dataset.name = '第' + i + '格';
    M.rows.push({ el: r, n, stripe, bits, nt, line });
  }
  // 行内容：按「从某时刻起是什么」切换。setRow(i, t, bits, note, kind)
  M.setRow = (i, t, b, note, kind) => {
    const R = M.rows[i - 1], col = kind === 'i' ? 'var(--blue)' : 'var(--ochre)';
    keyed(R.bits).at(t, { html: b ? `<span style="color:${col}">${fmt(b)}</span>` : '' });
    keyed(R.nt).at(t, { html: note ? `<span style="color:${col}">${esc(note)}</span>` : '' });
    keyed(R.stripe).at(t, { cls: 'blk' + (b ? (kind === 'i' ? ' s-i' : ' s-d') : '') });
  };
  if (st.rows) {
    PROG[st.rows].forEach(([b, nt], k) => M.setRow(k + 1, -1, b, nt, 'i'));
    DATA.forEach(([b, nt], k) => M.setRow(k + 5, -1, b, nt, 'd'));
    if (st.r7) M.setRow(7, -1, st.r7[0], st.r7[1], 'd');
  }
  // 指针（PC）：红铅笔的三角，指在某一格左边
  M.pc = h('div', 'abs', world, '<svg width="34" height="40" viewBox="0 0 34 40"><path d="M2,2 L32,20 L2,38 Z" fill="#b3311f"/></svg>'); M.pc.dataset.name = 'PC 指针';
  // 控制器里：取来的指令放在这条槽里；拆开后的两半
  M.slot = blk(world, '', 356, 262, 290, 56); css(M.slot, { border: '2px dashed var(--ink45)' });
  M.slotLab = txt(world, 'type', tr('取来的指令', 'FETCHED'), 356, 326); M.slotLab.style.fontSize = '24px';
  // 三步的小环：取 → 拆 → 做
  M.ring = h('div', 'abs', world); px(M.ring, 664, 200, 120, 250);
  M.steps = ['取', '拆', '做'].map((w, k) => {
    const e = h('div', 'abs', M.ring, `<b style="font:900 40px 'Serif SC'">${w}</b>`); px(e, 30, 10 + k * 78, 60, 60);
    e.classList.add('circ'); css(e, { border: '3px solid var(--ink)', textAlign: 'center', lineHeight: '52px' });
    e.dataset.name = '第' + (k + 1) + '步 ' + w;
    return e;
  });
  // 运算器里：累加器的数与算式
  M.acc = txt(world, 'mono', String(st.acc ?? 0), 360, 640); css(M.acc, { font: '700 110px "Mono"', lineHeight: '1' }); M.acc.dataset.name = '运算器里的数';
  M.accLab = txt(world, 'type', tr('运算器里的数', 'ACCUMULATOR'), 360, 762); M.accLab.style.fontSize = '24px';
  M.expr = txt(world, 'mono', '', 520, 668); css(M.expr, { font: '600 48px "Mono"' });
  // 输出：输出框里显示程序的结果（算账得 8；游戏画出棋盘）
  M.out = h('div', 'abs', world); px(M.out, 1668, 498, 140, 76); M.out.dataset.name = '输出的结果';
  M.outNum = h('div', 'abs mono', M.out, '8'); px(M.outNum, 0, 0); css(M.outNum, { font: '700 72px "Mono"', lineHeight: '1' });
  M.outGame = h('div', 'abs', M.out); px(M.outGame, 0, 0, 84, 84);
  const og = svg('svg', { width: 84, height: 84, viewBox: '0 0 84 84' }, M.outGame);
  M.outLines = ['M28,4 L28,80', 'M56,4 L56,80', 'M4,28 L80,28', 'M4,56 L80,56'].map((d) => svg('path', { d, stroke: C.ink, 'stroke-width': 4, fill: 'none' }, og));
  M.outMarks = [svg('path', { d: 'M6,6 L22,22 M22,6 L6,22', stroke: C.red, 'stroke-width': 4, fill: 'none' }, og), svg('circle', { cx: 42, cy: 42, r: 9, stroke: C.blue, 'stroke-width': 4, fill: 'none' }, og)];
  M.outAt = (t, v) => { keyed(M.outNum).at(t, { cls: 'abs mono' + (v === '8' ? '' : ' gone') }); keyed(M.outGame).at(t, { cls: 'abs' + (v === 'game' ? '' : ' gone') }); };
  M.outAt(-1, st.out || null);
  return M;
}

// 指针移到第 i 格（t 时刻起），同时更新右上角的 PC
// keys = [[t, 格号] …]，每一步用 0.22 秒走到；第一步之前不显示（from 缺省为第一步的时刻）。指针与控制器之间连一条红铅笔虚线
function pcTo(M, keys, from, linkUntil = Infinity) {
  const K = [];
  keys.forEach(([t, i], k) => { if (k) K.push([t - Math.min(0.22, (t - keys[k - 1][0]) * 0.6), 1040, rowY(keys[k - 1][1]) + 10]); K.push([t, 1040, rowY(i) + 10]); });
  mover(M.pc, K, Infinity, from ?? keys[0][0]);
  const link = blk(M.pc.parentNode, '', 0, 0, 236, 0); css(link, { borderTop: '3px dashed var(--red)' }); link.dataset.name = 'PC 连线';
  mover(link, K.map(([t, x, y]) => [t, 802, y + 19]), linkUntil, from ?? keys[0][0]);
  keys.forEach(([t, i]) => pcAt(t, i));
  return link;
}

// 描线：入场前整条不可见（引擎的 draw() 在入场前留着圆头线帽的点）
function drawIn(p, t, d = 0.6) {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len + ' ' + len;
  tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
  return p;
}
// 红铅笔圈：在 (x, y, w, h) 处画一个手绘的椭圆，t 时刻描出
function pencilRing(ov, x, y, w, hh, t, d = 0.45) {
  const cx = x + w / 2, cy = y + hh / 2, rx = w / 2 + 14, ry = hh / 2 + 12;
  const pts = [];
  for (let k = 0; k <= 40; k++) { const a = -2.2 + k / 40 * (Math.PI * 2 + 0.5); const j = 1 + 0.03 * Math.sin(k * 1.7); pts.push(`${(cx + rx * j * Math.cos(a)).toFixed(1)},${(cy + ry * j * Math.sin(a)).toFixed(1)}`); }
  const p = path(ov, 'M' + pts.join(' L'), 'red', { w: 4, arrow: false });
  drawIn(p, t, d);
  return p;
}

// 三步小环上的红圈：sched = [[t, 第几步 0–2 或 -1 熄灭] …]；spin = [t0, t1, 周期]：这段时间里飞快地轮转
function stepCursor(M, sched, spin) {
  const cur = h('div', 'abs', M.ring); px(cur, 24, 4, 72, 72); cur.classList.add('circ'); css(cur, { border: '5px solid var(--red)' }); cur.dataset.name = '当前这一步';
  sched.sort((a, b) => a[0] - b[0]);
  let last = null;
  F((t) => {
    let k = -1; for (const [a, b] of sched) if (t >= a) k = b;
    if (spin && t >= spin[0] && t < spin[1]) k = Math.floor((t - spin[0]) / spin[2]) % 3;
    if (k === last) return; last = k;
    cur.style.visibility = k < 0 ? 'hidden' : ''; if (k >= 0) cur.style.top = (4 + k * 78) + 'px';
  });
  return cur;
}
// 三步之间的箭头（取→拆→做，做→回到取）
function ringArrows(M) {
  const o = svg('svg', { width: 160, height: 250, viewBox: '0 0 160 250' }, M.ring); css(o, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
  const a = [];
  for (const d of ['M60,72 L60,86', 'M60,150 L60,164', 'M92,212 C130,200 130,60 92,44']) a.push(svg('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 3, 'marker-end': '' }, o));
  const tri = (x, y, r) => svg('path', { d: 'M-7,-5 L0,6 L7,-5 Z', transform: `translate(${x},${y}) rotate(${r})`, fill: C.ink }, o);
  a.push(tri(60, 88, 0), tri(60, 166, 0), tri(90, 44, 120));
  return a;
}
