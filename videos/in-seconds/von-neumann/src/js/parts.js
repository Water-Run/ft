// 本片的部件：纸带、方框图（控制器、运算器、存储器 + 通道 + 三步小环 + 屏幕）、沿路径移动、描线、红铅笔圈。
// 所有状态只由 t 决定：位置用 F() 按关键帧插值，内容切换用 keyed()。

const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
// 构建时就藏起来（tl.set 在 t=0 那一帧不生效）；之后由 wipe / appear 等入场动作显示
const hide0 = (e) => { e.style.visibility = 'hidden'; e.style.opacity = '0'; return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const frameBox = (parent, x, y, w, hh, col = 'var(--red)', bw = 4) => { const e = blk(parent, '', x, y, w, hh); css(e, { border: `${bw}px solid ${col}` }); return e; };

// ── 纸带：一个字。bits 为 8 位字符串（前 4 位动作、后 4 位格号；数据为数值），kind 'i' 指令（蓝）/ 'd' 数据（赭）──
const TAPE_P = 26;                                        // 孔距
function tape(parent, bits, kind, x = 0, y = 0) {
  const w = 22 + bits.length * TAPE_P;
  const e = h('div', 'tape', parent); px(e, x, y, w); e.style.background = kind === 'i' ? 'var(--tape-i)' : 'var(--tape-d)';
  h('div', 'st', e).style.background = kind === 'i' ? 'var(--blue)' : 'var(--ochre)';
  const holes = [];
  [...bits].forEach((b, i) => {
    const xx = 18 + i * TAPE_P;
    const ho = h('div', 'ho' + (b === '1' ? ' on' : ''), e); ho.style.left = xx + 'px'; holes.push(ho);
    h('div', 'sp', e).style.left = (xx + 8) + 'px';
  });
  e.holes = holes; e.w = w; e.dataset.name = (kind === 'i' ? '指令纸带 ' : '数据纸带 ') + bits;
  return e;
}

// ── 沿关键帧移动：keys = [[t, x, y, {s, r, a, e}] …]，相邻两帧之间按后一帧的缓动（缺省 io3）；第一帧之前、最后一帧之后停在端点 ──
// 元素在 [max(from, 第一帧), until) 之外不可见
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

// ── 描线：入场前整条不可见（引擎的 draw() 在入场前留着圆头线帽的点）──
function drawIn(p, t, d = 0.6) {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len + ' ' + len;
  tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut', immediateRender: true }, t);
  return p;
}
// ── 红铅笔圈：在 (x, y, w, h) 外面画一个手绘的椭圆，t 时刻描出 ──
function pencilRing(ov, x, y, w, hh, t, d = 0.5) {
  const cx = x + w / 2, cy = y + hh / 2, rx = w / 2 + 16, ry = hh / 2 + 14, pts = [];
  for (let k = 0; k <= 40; k++) { const a = -2.2 + k / 40 * (Math.PI * 2 + 0.5); const j = 1 + 0.03 * Math.sin(k * 1.7); pts.push(`${(cx + rx * j * Math.cos(a)).toFixed(1)},${(cy + ry * j * Math.sin(a)).toFixed(1)}`); }
  return drawIn(path(ov, 'M' + pts.join(' L'), 'red', { w: 5, arrow: false }), t, d);
}

// ── 方框图的几何（world 坐标，画幅 1920×968）──
const G = {
  CC: { x: 280, y: 150, w: 460, h: 280 },
  CA: { x: 280, y: 500, w: 460, h: 300 },
  M: { x: 1100, y: 130, w: 540, h: 700 },
  busY: 465,                                              // 通道中线；纸带走在 busY - 24
  wheel: { x: 920, y: 285, r: 96 },                       // 三步小环的圆心与半径
  screen: { x: 1676, y: 470, w: 214, h: 170 },
  slot: { x: 310, y: 232 },                               // 控制器里放取来的指令的槽（纸带左上角）
  accTape: { x: 470, y: 560 },                            // 送进运算器的数落在这里
};
const ROW = { y0: 214, h: 68, x: 1100 };                  // 存储格：第 i 格（从 1 起）的上沿
const rowY = (i) => ROW.y0 + (i - 1) * ROW.h;
const rowTape = (i) => [1170, rowY(i) + 10];              // 纸带停在第 i 格里的位置（缩放 0.92）
const laneY = G.busY - 24;
// 两套程序（第 1–4 格）与数据（第 5–9 格）。说明栏是人读的注解
const PROG = {
  calc: [['00011000', '加 第8格'], ['00011001', '加 第9格'], ['00110111', '存 第7格'], ['11110000', '停']],
  game: [['01010101', '画 棋盘'], ['01100110', '读 按键'], ['01110101', '落 一子'], ['10000001', '回 第1格']],
};
const DATA = [['00000000', '0'], ['00000000', '0'], ['00000000', '—'], ['00000101', '5'], ['00000011', '3']];
const fmt = (b) => b.slice(0, 4) + ' ' + b.slice(4);

function box(parent, g, zh) {
  const e = h('div', 'box', parent); px(e, g.x, g.y, g.w, g.h);
  h('div', 'bt', e, zh);
  e.dataset.name = zh;
  return e;
}

// 从第 r 格经通道送到 (x, y) 的路径：先到存储器左沿，再沿通道，最后进目的地。d 为总时长
const route = (r, x, y, t0, d = 1.4) => {
  const [rx, ry] = rowTape(r);
  return [[t0, rx, ry, { s: 0.92 }], [t0 + d * 0.22, 1112, laneY, { s: 0.8 }], [t0 + d * 0.66, 752, laneY, { s: 0.8, e: (k) => k }], [t0 + d, x, y, { s: 0.92 }]];
};

// 建整张方框图。st：{ rows: null|'calc'|'game', acc, r7, screen: null|'calc'|'game' }。返回各部件的引用
function machine(world, st = {}) {
  const M = { world };
  M.wires = overlay(world);
  M.CC = box(world, G.CC, tr('控制器', 'Control'));
  M.CA = box(world, G.CA, tr('运算器', 'Arithmetic'));
  M.M = box(world, G.M, tr('存储器', 'Memory'));
  // 通道：双线
  M.bus = [path(M.wires, `M740,${G.busY - 22} L1100,${G.busY - 22}`, 'ink', { w: 3, arrow: false }), path(M.wires, `M740,${G.busY + 22} L1100,${G.busY + 22}`, 'ink', { w: 3, arrow: false })];
  M.busLabel = txt(world, 'type', tr('通道', 'BUS'), 892, G.busY + 32); M.busLabel.style.fontSize = '24px';
  // 存储格：9 行
  M.rows = [];
  for (let i = 1; i <= 9; i++) {
    const r = h('div', 'abs row', world); px(r, ROW.x, rowY(i), G.M.w, ROW.h);
    const line = blk(r, '', 0, ROW.h - 1, G.M.w, 2); line.style.background = 'var(--ink22)';
    const n = h('div', 'n', r, String(i)); px(n, 24, 12);
    const stripe = blk(r, '', 76, 10, 8, 48);
    const bits = h('div', 'bits', r, ''); px(bits, 98, 14);
    const nt = h('div', 'nt', r, ''); px(nt, 350, 15);
    r.dataset.name = '第' + i + '格';
    M.rows.push({ el: r, n, stripe, bits, nt, line });
  }
  // 行内容：从某时刻起是什么
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
  // 指针：红铅笔的三角，指在某一格左边
  // 指针：和红铅笔圈同一种笔触的线描箭头（不填色），指着控制器正在读的那一格
  M.pc = h('div', 'abs', world, '<svg width="40" height="40" viewBox="0 0 40 40" style="overflow:visible"><path d="M2,21 C12,19 22,20 34,20 M22,8 L35,20 L22,32" fill="none" stroke="#b3311f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>'); M.pc.dataset.name = '指针';
  // 控制器里放取来的指令的槽
  M.slot = blk(world, '', G.slot.x - 8, G.slot.y - 8, 420, 64); css(M.slot, { border: '2px dashed var(--ink45)' }); M.slot.dataset.name = '指令槽';
  // 三步的小环：取（上）→ 拆（右下）→ 做（左下），顺时针
  const W = G.wheel;
  M.wheel = h('div', 'abs', world); px(M.wheel, W.x - W.r - 60, W.y - W.r - 60, 2 * W.r + 120, 2 * W.r + 120); M.wheel.dataset.name = '三步';
  const wo = svg('svg', { width: 2 * W.r + 120, height: 2 * W.r + 120, viewBox: `${-W.r - 60} ${-W.r - 60} ${2 * W.r + 120} ${2 * W.r + 120}` }, M.wheel);
  css(wo, { position: 'absolute', left: '0px', top: '0px', overflow: 'visible' });
  const ang = [-90, 30, 150].map((d) => d * Math.PI / 180);
  M.nodePos = ang.map((a) => [W.x + W.r * Math.cos(a), W.y + W.r * Math.sin(a)]);
  for (let k = 0; k < 3; k++) {                            // 弧形箭头：从一个节点外沿到下一个节点外沿
    const a0 = ang[k] + 0.42, a1 = ang[(k + 1) % 3] + (k === 2 ? 2 * Math.PI : 0) - 0.42;
    const pts = []; for (let j = 0; j <= 16; j++) { const a = a0 + (a1 - a0) * j / 16; pts.push(`${(W.r * Math.cos(a)).toFixed(1)},${(W.r * Math.sin(a)).toFixed(1)}`); }
    svg('path', { d: 'M' + pts.join(' L'), fill: 'none', stroke: C.ink, 'stroke-width': 3 }, wo);
    const ax = W.r * Math.cos(a1), ay = W.r * Math.sin(a1), dir = a1 + Math.PI / 2;
    svg('path', { d: 'M-8,-6 L8,0 L-8,6 Z', transform: `translate(${ax.toFixed(1)},${ay.toFixed(1)}) rotate(${(dir * 180 / Math.PI).toFixed(1)})`, fill: C.ink }, wo);
  }
  M.steps = ['取', '拆', '做'].map((w, k) => {
    const [x, y] = M.nodePos[k];
    const e = h('div', 'abs circ', world, w); px(e, x - 38, y - 38, 76, 76);
    css(e, { border: '3px solid var(--ink)', background: 'var(--paper)', textAlign: 'center', lineHeight: '68px', font: '900 42px "Serif SC"' });
    e.dataset.name = '第' + (k + 1) + '步 ' + w;
    return e;
  });
  // 运算器里：会算的四种运算（报告 §2.2）、累加的数与算式
  M.ops = txt(world, 'mono soft', '+ − × ÷', 560, 520); css(M.ops, { font: '600 40px "Mono"' }); M.ops.dataset.name = '四种运算';
  M.acc = txt(world, 'mono', String(st.acc ?? 0), 310, 620); css(M.acc, { font: '700 130px "Mono"', lineHeight: '1' }); M.acc.dataset.name = '运算器里的数';
  M.expr = txt(world, 'mono', '', 480, 660); css(M.expr, { font: '700 60px "Mono"' }); M.expr.dataset.name = '算式';
  // 屏幕：存储器右边，显示程序的结果（算账得 8；游戏画出棋盘）
  const S = G.screen;
  M.screen = h('div', 'sheet', world); px(M.screen, S.x, S.y, S.w, S.h); M.screen.dataset.name = '屏幕';
  M.screenLab = txt(world, 'type', tr('屏幕', 'SCREEN'), S.x, S.y - 36); M.screenLab.style.fontSize = '24px';
  M.scrCalcBox = h('div', 'abs', M.screen); px(M.scrCalcBox, 18, 56);                 // 外层只管显隐，里层只管文字（可以打字）
  M.scrCalc = h('div', 'abs mono', M.scrCalcBox, '5+3=8'); px(M.scrCalc, 0, 0); css(M.scrCalc, { font: '700 40px "Mono"' });
  M.scrGame = h('div', 'abs', M.screen); px(M.scrGame, 54, 22, 108, 120);
  const sg = svg('svg', { width: 108, height: 120, viewBox: '0 0 108 120' }, M.scrGame);
  M.scrLines = ['M36,6 L36,114', 'M72,6 L72,114', 'M4,42 L104,42', 'M4,78 L104,78'].map((d) => svg('path', { d, stroke: C.ink, 'stroke-width': 4, fill: 'none' }, sg));
  M.scrMarks = [svg('path', { d: 'M8,10 L28,32 M28,10 L8,32', stroke: C.red, 'stroke-width': 4, fill: 'none' }, sg), svg('circle', { cx: 54, cy: 60, r: 12, stroke: C.blue, 'stroke-width': 4, fill: 'none' }, sg), svg('path', { d: 'M80,84 L100,106 M100,84 L80,106', stroke: C.red, 'stroke-width': 4, fill: 'none' }, sg)];
  // 屏幕显示什么：只切换两块内容的显隐，不重写内容（keyed 的 html 会把正在打字的元素整块换掉）
  const scrK = [[-1, st.screen || null]];
  M.screenAt = (t, v) => { scrK.push([t, v]); scrK.sort((x, y) => x[0] - y[0]); };
  let scrLast;
  F((t) => { let v = null; for (const [a, b] of scrK) if (t >= a) v = b; if (v === scrLast) return; scrLast = v;
    M.scrCalcBox.style.visibility = v === 'calc' ? '' : 'hidden'; M.scrGame.style.visibility = v === 'game' ? '' : 'hidden'; });
  M.screenLink = path(M.wires, `M1640,${S.y + S.h / 2} L${S.x},${S.y + S.h / 2}`, 'ink', { w: 3, arrow: true });
  if (!st.screen) { hide0(M.screen); hide0(M.screenLab); hide0(M.screenLink); }
  return M;
}

// 指针按 keys = [[t, 格号] …] 移动，每步用 min(0.35, 间隔 × 0.6) 秒走到；同时更新右上角的读数。from 之前不显示
function pcTo(M, keys, from) {
  const K = [];
  let lastRow = keys.find(([, i]) => i != null)[1];
  keys.forEach(([t, i], k) => {
    const row = i ?? lastRow, a = i == null ? 0 : 1;      // i 为 null：指针收起（右上角显示「—」）
    if (k) { const [pt, pi] = keys[k - 1]; K.push([t - Math.min(0.35, (t - pt) * 0.6), 1062, rowY(pi ?? lastRow) + 14, { a: pi == null ? 0 : 1 }]); }
    K.push([t, 1062, rowY(row) + 14, { a }]); lastRow = row;
  });
  mover(M.pc, K, Infinity, from ?? keys[0][0]);
  keys.forEach(([t, i]) => pcAt(t, i));
}

// 三步小环上的红圈：sched = [[t, 第几步 0–2 或 -1 熄灭] …]；spin = [t0, t1]：这段时间里越转越快
function stepCursor(M, sched, spin) {
  const cur = h('div', 'abs circ', M.world); px(cur, 0, 0, 96, 96); css(cur, { border: '6px solid var(--red)' }); cur.dataset.name = '当前这一步';
  sched.sort((a, b) => a[0] - b[0]);
  let last = null;
  F((t) => {
    let k = -1; for (const [a, b] of sched) if (t >= a) k = b;
    if (spin && t >= spin[0] && t < spin[1]) { const u = t - spin[0]; k = Math.floor(u * (2 + 9 * u)) % 3; }   // 转过的格数 = u·(2 + 9u)：越来越快
    if (k === last) return; last = k;
    cur.style.visibility = k < 0 ? 'hidden' : '';
    if (k >= 0) { const [x, y] = M.nodePos[k]; cur.style.left = (x - 48) + 'px'; cur.style.top = (y - 48) + 'px'; }
  });
  return cur;
}
