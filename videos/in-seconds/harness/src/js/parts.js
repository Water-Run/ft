// 本片的部件：Agent Loop 的环与站卡（一圈 = 问一次模型）、对话栈（整段对话，一条一行）、代码卡。数据取自 data.js（tools/gen_data.py 由实验记录生成）。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const D = window.DATA;
// 一段动作在 t 时刻走到哪里：0…1，缓入缓出
const prog = (t, t0, d, f = ease.io3) => f(clamp((t - t0) / d));
// 由 t 直接算出显隐的区间：[t0, t1) 内可见，前后各 fade 秒渐变
function during(e, t0, t1, fade = 0.25) {
  let last = null;
  F((t) => {
    const a = t < t0 ? 0 : t < t0 + fade ? (t - t0) / fade : t < t1 ? 1 : t < t1 + fade ? 1 - (t - t1) / fade : 0;
    const k = a.toFixed(3);
    if (k !== last) { e.style.opacity = k; e.style.visibility = a > 0 ? 'visible' : 'hidden'; last = k; }
  });
  return e;
}
// 居中放置：外面包一层定宽的 flex 容器，补间只动里面的元素（不靠 transform 居中，见 docs/reference/pitfalls.md）
function centered(parent, cls, html, cx, y, w = 900) {
  const wrap = h('div', 'abs cwrap', parent); px(wrap, cx - w / 2, y, w);
  const e = h('div', cls, wrap, html);
  return e;
}

// ── Agent Loop：环 + 四张站卡。一圈 = 问一次模型；指针走到哪一站，哪张卡亮 ──
// 站：模型（上）→ 工具调用（右）→ Harness 执行（下）→ 结果交回（左）→ 回到模型。刻度与指针在环外，环内留给场景放内容。
// o.cards：{ model|call|exec|back: [x, y, w, h] }；o.bodies：各站卡的初始内容；keys：[[时刻, 角度, 用时]]，角度累计（第 2 圈从 360 起）；
// o.from：这一刻起站卡才跟着指针亮；stopAt：这一刻起指针停下（空心）
const STATIONS = [
  ['model', 0, tr('模型', 'Model'), 'Model'],
  ['call', 90, tr('工具调用', 'Tool call'), 'Tool Call'],
  ['exec', 180, tr('Harness 执行', 'Harness runs it'), ''],
  ['back', 270, tr('结果交回', 'Result back'), 'Result'],
];
function makeLoop(parent, o) {
  const { cx, cy, R } = o;
  const S = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, parent); px(S, 0, 0);
  S.dataset.name = 'Agent Loop';
  svg('circle', { cx, cy, r: R, fill: 'none', stroke: C.paper, 'stroke-width': 4 }, S);
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * Math.PI * 2 - Math.PI / 2, big = i % 15 === 0, r2 = R + (big ? 30 : 14);
    ticks.push(svg('line', { x1: cx + Math.cos(a) * (R + 4), y1: cy + Math.sin(a) * (R + 4), x2: cx + Math.cos(a) * r2, y2: cy + Math.sin(a) * r2, stroke: C.dim, 'stroke-width': big ? 6 : 3 }, S));
  }
  const RA = R + 22;
  const arc = svg('path', { d: '', fill: 'none', stroke: C.ac, 'stroke-width': 10 }, S);
  const dot = svg('circle', { cx, cy: cy - RA, r: 16, fill: C.ac, stroke: C.ac, 'stroke-width': 5 }, S);
  const cards = {};
  STATIONS.forEach(([k, deg, name, en]) => {
    const [x, y, w, hh] = o.cards[k];
    const box = h('div', 'abs node ' + k, parent); px(box, x, y, w, hh);
    box.dataset.name = name;
    const head = h('div', 'nh', box, `<span>${name}</span>${en ? `<span class="en">${en}</span>` : ''}`);
    const body = h('div', 'nb', box, (o.bodies && o.bodies[k]) || '');
    cards[k] = { box, head, body };
  });
  const keys = o.keys || [[0, 0]], stopAt = o.stopAt != null ? o.stopAt : Infinity, from = o.from != null ? o.from : -Infinity, d = o.d || 0.7;
  // 每段起点 = 上一个关键帧的角度：顺序扫一遍，状态只取决于 t
  const angle = (t) => {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [k0, a] = keys[i];
      if (t < k0) break;
      v = lerp(keys[i - 1][1], a, prog(t, k0, keys[i][2] || d));
    }
    return v;
  };
  let last = null;
  F((t) => {
    const deg = Math.round(angle(t) * 100) / 100, inLap = ((deg % 360) + 360) % 360, stopped = t >= stopAt, live = t >= from;   // 先取整到缓存键的精度，键相同则画面相同
    const act = live ? Math.floor(((inLap + 4) % 360) / 90) : -1;
    const key = deg.toFixed(2) + (stopped ? 's' : '') + act;
    if (key === last) return; last = key;
    const a0 = -Math.PI / 2, a1 = inLap / 180 * Math.PI - Math.PI / 2;
    const P = (a) => `${(cx + Math.cos(a) * RA).toFixed(1)} ${(cy + Math.sin(a) * RA).toFixed(1)}`;
    arc.setAttribute('d', inLap > 0.5 ? `M ${P(a0)} A ${RA} ${RA} 0 ${inLap > 180 ? 1 : 0} 1 ${P(a1)}` : '');
    dot.setAttribute('cx', (cx + Math.cos(a1) * RA).toFixed(1)); dot.setAttribute('cy', (cy + Math.sin(a1) * RA).toFixed(1));
    dot.setAttribute('fill', stopped ? C.ink : C.ac);
    ticks.forEach((l, i) => l.setAttribute('stroke', i * 6 <= inLap + 0.5 && inLap > 0.5 ? C.ac : C.dim));
    STATIONS.forEach(([k], i) => cards[k].box.classList.toggle('on', i === act));
  });
  return { S, cards, angle, dot, cx, cy, R };
}

// ── 对话栈：整段对话，一条一行，从下往上摞。rows：[[类别, 角色, 文字, 入场时刻]] ──
// 类别：say（说明、你、回复：空心）、call（工具调用：朱红）、tool（结果：纸色）。行高随条数收紧，状态只由 t 算出
function makeConv(parent, o) {
  const { x, bottom, w } = o, maxH = o.maxH || 650, maxRow = o.maxRow || 76;
  const els = o.rows.map(([k, role, text, t0]) => {
    const e = h('div', 'row ' + k, parent, `<span class="role">${role}</span><span class="tx">${text}</span>`);
    px(e, x, bottom - maxRow, w, maxRow - 8);
    const mark = blk(parent, 'bg-ac', x + w + 12, 0, 10, 10);
    return { e, mark, t0, k };
  });
  const sentKeys = o.sent || [];                    // [[时刻, 条数, 第几次]]：括号括住这一次发出的条数
  const br = h('div', 'abs bracket', parent); px(br, x - 38, 0, 22, 10);
  const brLab = txt(parent, 'conv-lab dim', '', x, 0);
  const head = txt(parent, 'lab dim', tr('对话', 'Conversation'), x, 0);
  const seen = (t) => els.map((r) => clamp((t - r.t0) / 0.45));
  const rowH = (t) => { const n = seen(t).reduce((a, b) => a + b, 0); return Math.min(maxRow, maxH / Math.max(1, n)); };
  const sentAt = (t) => { let s = null; for (const k of sentKeys) if (t >= k[0]) s = k; return s; };
  const newFrom = o.newFrom || (() => 0);
  let last = null;
  F((t) => {
    const p = seen(t), rh = rowH(t), s = sentAt(t), nf = newFrom(t);
    const key = p.map((v) => v.toFixed(2)).join() + rh.toFixed(1) + (s ? s[0] + ':' + prog(t, s[0], 0.5).toFixed(3) : '') + nf;   // 括号伸长的进度也要进缓存键
    if (key === last) return; last = key;
    let top = bottom;
    els.forEach((r, i) => {
      const y = bottom - (i + 1) * rh, k = ease.out3(p[i]);
      css(r.e, { top: y.toFixed(1) + 'px', height: (rh - 8).toFixed(1) + 'px', opacity: k.toFixed(3), visibility: p[i] > 0 ? 'visible' : 'hidden', transform: `translateX(${((1 - k) * 80).toFixed(1)}px)` });
      r.e.classList.toggle('tight', rh < 64);
      const fresh = p[i] > 0 && i >= nf;
      css(r.mark, { top: y.toFixed(1) + 'px', height: (rh - 8).toFixed(1) + 'px', visibility: fresh ? 'visible' : 'hidden', opacity: k.toFixed(3) });
      if (p[i] > 0) top = y;
    });
    // 括号：这一次发出的是哪几条
    if (s) {
      const n = s[1], k = prog(t, s[0], 0.5), hh = n * rh * k;
      css(br, { top: (bottom - hh).toFixed(1) + 'px', height: Math.max(0, hh - 8).toFixed(1) + 'px', visibility: k > 0 ? 'visible' : 'hidden' });
      brLab.innerHTML = s[3] || '';
    } else { br.style.visibility = 'hidden'; brLab.innerHTML = ''; }
    css(head, { top: (top - 74).toFixed(1) + 'px' });
    css(brLab, { top: (top - 68).toFixed(1) + 'px', left: (o.labX || x + 100) + 'px' });
  });
  return { els, br, brLab, head, rowH, topAt: (t) => bottom - seen(t).reduce((a, b) => a + b, 0) * rowH(t) };
}

// ── 代码卡：纸色底、墨色字，左边行号 ──
function codeCard(parent, name, lines, x, y, w, size = 34, lh = 56) {
  const card = h('div', 'abs code-card', parent); px(card, x, y, w, 76 + lines.length * lh);
  txt(card, 'cc-name mono', name, 24, 14);
  const ls = lines.map((l, i) => { const e = txt(card, 'cc-line mono', `<span class="ln">${i + 1}</span>${l}`, 24, 66 + i * lh); e.style.fontSize = size + 'px'; return e; });
  return { card, ls };
}
