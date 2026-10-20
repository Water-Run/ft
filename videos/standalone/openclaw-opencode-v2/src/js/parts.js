// 本片的部件。三套皮肤（见 css/style.css 开头）：中性 n、OpenClaw cl、OpenCode oc。每个部件只属于一套皮肤，不混用。
const W = 1920, H = 1080, M = 120;
const C = {
  paper: '#f1eee6', ink: '#17181b', ink2: '#5d5b55', rule: '#c9c4b8',
  clBg: '#0e1015', clCard: '#161920', clElev: '#191c24', clHover: '#1f2330', clBorder: '#2e3040', clText: '#bcbcc0', clStrong: '#f4f4f5', clMuted: '#8b8b94', clAccent: '#ff5c5c', clOk: '#22c55e', clWarn: '#f59e0b',
  lobBody: '#ff6d5a', lobShade: '#c2372b', lobEye: '#050810', lobPupil: '#00e5cc',
  ocBg: '#0a0a0a', oc700: '#141414', oc600: '#1e1e1e', ocBorder: '#484848', ocText: '#eeeeee', oc300: '#b5b5b5', ocMuted: '#808080', ocPeach: '#fab283', ocBlue: '#5c9cf5', ocRed: '#e06c75', ocGreen: '#7fd88f',
};
const GROUND = { n: C.paper, cl: C.clBg, oc: C.ocBg };

// ── 舞台：底色 + world（比画面大的画布）+ 一块盖住整张大图的 SVG 画布 ──
function stage(root, skin) {
  root.style.background = GROUND[skin];
  const world = h('div', 'world', root);
  const g = svg('svg', { class: 'g', viewBox: '-3000 -2000 14000 7000' }, world);
  // 上层画布：压在卡片与文字之上的线框、标记（下层画布 g 在所有 div 之下）
  const gt = svg('svg', { class: 'g gt', viewBox: '-3000 -2000 14000 7000' }, world);
  return { world, g, gt };
}
const R = (g, x, y, w, hh, fill, o = {}) => svg('rect', { x, y, width: w, height: hh, fill, ...o }, g);
const Ci = (g, cx, cy, r, fill, o = {}) => svg('circle', { cx, cy, r, fill, ...o }, g);
const Ln = (g, x1, y1, x2, y2, stroke, w = 3, o = {}) => svg('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...o }, g);
const Pa = (g, d, o = {}) => svg('path', { d, fill: 'none', ...o }, g);
function tx(parent, cls, x, y, html, st) {
  const e = h('div', 'abs ' + cls, parent, html); px(e, x, y);
  if (st) css(e, st);
  return e;
}
const fmtN = (v) => Math.round(v).toLocaleString('en-US');
const seq = (els, t, dt, fn) => els.forEach((e, i) => fn(e, t + i * dt, i));
const Tw = (id, zh, en, sh = 0) => T(id, { zh, en }, sh);
// 某一句里的词，但不晚于这句结束前 lim 秒（两种语言里同一个词的位置不同）
const Tc = (id, zh, en, lim = 0.6) => Math.min(Tw(id, zh, en), Tend(id, -lim));

// ── 取证数据：引文与源码行。has() 断言片段确在原文里（不在时页面日志报警，check.js 会拦下） ──
const D_ = () => window.DATA;
const ent = (key) => D_().ex[key];
function has(key, sub) { const e = ent(key); if (!e) { console.warn('no quote', key); return sub || ''; } if (sub && !e.text.includes(sub)) console.warn('quote mismatch', key, sub); return sub || e.text; }
const srcOf = (key, o = {}) => { const e = ent(key); if (!e) { console.warn('no quote', key); return key; } const p = o.short ? e.path.split('/').slice(-2).join('/') : e.path; return (o.ver ? e.ver + '  ' : '') + p + ':' + e.line; };

// ── 镜头轨迹：保证每段缓慢漂移与段间空档都有足够的屏幕位移（稀疏画面上太慢的推拉在预演里像定住了） ──
// 关键帧的选项 room：这一站版面左右还剩多少像素可以让漂移横向借用，默认 60；版面撑满画面宽度的站给更小的值。横移不够的部分用轻微拉远补足，
// 所以全片最小的字用 24 像素（拉远 8% 后约 22.1，仍不低于 check.min_font）
function camTrack(cam, startT, start, keys, endT, world) {
  const SPEED = 30, out = []; let cur = { x: 960, y: 540, z: 1, ...start }, sign = 1, prevEnd = startT, room = 60;
  const travel = (a, b) => (Math.abs(b.x - a.x) + Math.abs(b.y - a.y)) * Math.min(a.z, b.z) + 600 * Math.abs(b.z - a.z);
  const fill = (t0, t1) => { const d = t1 - t0; if (d <= 1.0) return; const nx = { ...cur, x: cur.x + sign * Math.min(26 * Math.min(d, 5), room) / cur.z, z: cur.z * (1 + 0.004 * Math.min(d, 5)) }; out.push([t0, { x: nx.x, z: nx.z }, d, { ease: 'none', sfx: false }]); cur = nx; sign = -sign; };
  for (const [t, v, d = 1.2, o = {}] of keys) {
    const tt = Math.max(startT + 0.02, prevEnd + 0.02, t == null ? prevEnd + 0.15 : t);   // 两段补间不能在时间上重叠
    fill(prevEnd + 0.05, tt - 0.05);
    let next = { ...cur, ...v }, oo = o;
    room = o.room != null ? o.room : 60;
    if (o.sfx === false) {
      // 先横移，幅度不超过这一站的余量 room；还不够的部分改成轻微拉远（最多 8%），拉远不会把字推出画面。
      // 匀速：两头慢的缓动在到站之后的头几秒几乎不动，成片的静止检测会报
      const need = Math.min(SPEED * d, 240), has_ = travel(cur, next);
      if (has_ < need) {
        const lat = Math.min(need - has_, room);
        next = { ...next, x: next.x + sign * lat / Math.min(cur.z, next.z) }; sign = -sign;
        const rest = need - has_ - lat; if (rest > 0) next.z = next.z * (1 - Math.min(rest / 600, 0.08));
      }
      oo = { ...o, ease: 'none' };
    }
    out.push([tt, { x: next.x, y: next.y, z: next.z }, d, oo]); cur = next; prevEnd = tt + d;
  }
  if (endT != null) fill(prevEnd + 0.05, endT);
  cam.track(startT, start, out);
  // 第一个场景从 t = 0 起：轨迹第一段开始之前，由这里直接摆好镜头，不依赖补间库在第 0 帧的状态
  if (startT <= 0.05 && world) {
    const p0 = { x: 960, y: 540, z: 1, r: 0, ...start }, t0 = out.length ? out[0][0] : Infinity;
    F((t) => { if (t < t0) { Object.assign(cam.st, p0); world.style.transform = `translate(960px, 540px) scale(${p0.z}) rotate(0deg) translate(${-p0.x}px, ${-p0.y}px)`; } });
  }
}

// 描线：引擎的 draw() 在开始之前会露出线的端点（一两个小点）。开始之前把整条线用 display 藏起来，每帧按 t 设
function drawH(p, t, d, o) { draw(p, t, d, o); F((tt) => { const v = tt < t ? 'none' : ''; if (p.style.display !== v) p.style.display = v; }); }

// 按关键帧取值：keys = [[t, v], …]，段内缓入缓出；用于由 F() 驱动的数值（计数、进度、位置）
function keysAt(keys, t, e = ease.io3) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], e(clamp((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]))));
  return keys[keys.length - 1][1];
}

// ══════════ 中性皮肤 ══════════
// 一行记录：横贯的细线 + 左侧页边的序号 + 文本。row.in(t) 依次画线、跳出序号、刷出文本
function nRow(world, g, x, y, w, seqNo, html, o = {}) {
  const ln = Ln(g, x, y, x + w, y, C.rule, 2);
  const sq = tx(world, 'seqn', x - 112, y - 34, String(seqNo).padStart(4, '0'), { fontSize: '26px' });
  const el = tx(world, o.cls || 'ser', x, y - (o.lift != null ? o.lift : 12) - (o.size || 72) * 1.12, html, { fontSize: (o.size || 72) + 'px', ...(o.st || {}) });
  return {
    ln, sq, el,
    in(t, dir = 'l') { drawH(ln, t, 0.5); appear(sq, t + 0.08); sfx('tick', t + 0.08, { g: 0.45 }); wipe(el, t + 0.12, { dir, d: 0.55 }); return t + 0.67; },
  };
}
// 页边序号的一整列（只画号，不画线），从 n0 起往下排
function seqCol(world, x, y0, n0, n, step) {
  const els = [];
  for (let i = 0; i < n; i++) els.push(tx(world, 'seqn', x, y0 + i * step, String(n0 + i).padStart(4, '0'), { fontSize: '26px' }));
  return els;
}
// 进程的生命线：一条粗横线从 x1 往右长。grow(t0, t1, x)：在 [t0, t1] 内匀速长到 x；cut(t, x)：在 x 处出现一道斜切口。
// 可见长度由 t 直接算出（keys），与播放历史无关。
function lifeLine(g, x1, y, x2, c = C.ink) {
  const len = x2 - x1, p = Pa(g, `M${x1},${y} L${x2},${y}`, { stroke: c, 'stroke-width': 6 });
  p.style.strokeDasharray = `${len} ${len + 20}`;
  const keys = [[-1, 0]]; let last = null;
  F((t) => { const v = keysAt(keys, t, (k) => k); if (v === last) return; last = v; p.style.strokeDashoffset = (len - v).toFixed(1); p.setAttribute('opacity', v > 0.5 ? 1 : 0); });
  return {
    p,
    grow(t0, t1, x) { keys.push([t0, keys[keys.length - 1][1]], [t1, x - x1]); },
    cut(t, x) {
      const k = Pa(g, `M${x - 24},${y + 44} L${x + 24},${y - 44}`, { stroke: c, 'stroke-width': 6 });
      appear(k, t); sfx('error', t, { g: 0.7 });
      return k;
    },
  };
}
// harness 的循环（示意）：一个圆环，里面是模型；一个方块沿圆环绕行。spin(t0, t1, 每圈秒数)
function loopRing(g, cx, cy, r, o = {}) {
  const grp = svg('g', {}, g), c = o.c || C.ink;
  const circ = Ci(grp, cx, cy, r, 'none', { stroke: c, 'stroke-width': o.w || 6 });
  const sz = o.dot || 26, dot = R(grp, -sz / 2, -sz / 2, sz, sz, o.dotc || c);
  const spans = []; let last = '';
  F((t) => {
    let a = -90, on = false;
    for (const s of spans) if (t >= s.t0) { a = -90 + 360 * (Math.min(t, s.t1) - s.t0) / s.per; on = true; }
    const key = on ? a.toFixed(1) : 'x';
    if (key === last) return; last = key;
    const rad = a * Math.PI / 180;
    dot.setAttribute('transform', `translate(${(cx + r * Math.cos(rad)).toFixed(1)} ${(cy + r * Math.sin(rad)).toFixed(1)})`); dot.setAttribute('opacity', on ? 1 : 0);
  });
  return { grp, circ, dot, spin(t0, t1, per = 2.4) { spans.push({ t0, t1, per }); spans.sort((x, y) => x.t0 - y.t0); } };
}
// 源码（中性皮肤）：每行左侧是行号（占页边序号的位置），正文等宽。lines = [[行号, 文本], …]；hl(i, t0, t1) 某行反白
function nCode(world, x, y, lines, o = {}) {
  const size = o.size || 34, lh = Math.round(size * 1.55);
  const rows = lines.map(([n, s], i) => {
    const no = tx(world, 'seqn', x - 112, y + i * lh + (size - 26) * 0.6, n == null ? '' : String(n), { fontSize: '26px', width: '80px', textAlign: 'right' });
    const el = tx(world, 'nmono', x, y + i * lh, s === '' ? ' ' : esc(s), { fontSize: size + 'px', lineHeight: lh + 'px', height: lh + 'px', padding: '0 14px', margin: '0 -14px' });
    return { no, el };
  });
  return { rows, lh, h: lines.length * lh, hl(i, t0, t1 = Infinity) { classAt(rows[i].el, 'hl-n', t0, t1); } };
}
// 小色块：中性页面上提到某个项目时，用它的颜色作标记（只作色块，不作文字）
const brandDot = (g, x, y, which, s = 22) => (which === 'cl' ? Ci(g, x + s / 2, y + s / 2, s / 2, C.clAccent) : R(g, x, y, s, s, C.ocPeach));

// ══════════ OpenClaw 皮肤 ══════════
// 吉祥物：路径逐笔取自 ui/public/favicon.svg（v2026.8.1，MIT 许可）；动作节奏照该文件注释里写的官方节奏：
// 漂浮 4s（上下 5 个单位）、触角摆动 2s（±3°）、眨眼 3s、两只钳每 4s 合一次（右钳晚 0.2s）。这里写成 t 的函数。
let LOB_N = 0;
function lobsterMascot(g, x, y, size, o = {}) {
  const id = 'lobg' + (++LOB_N);
  const defs = svg('defs', {}, g);
  const lg = svg('linearGradient', { id, x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, defs);   // 品牌标志自带的渐变，照原样保留 lint-ok: 品牌标志
  svg('stop', { offset: '0%', 'stop-color': C.lobBody }, lg); svg('stop', { offset: '100%', 'stop-color': C.lobShade }, lg);
  const k = size / 120;
  const outer = svg('g', { transform: `translate(${x} ${y}) scale(${k})` }, g);
  const bob = svg('g', {}, outer);
  const fill = `url(#${id})`;
  svg('path', { d: 'M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z', fill }, bob);
  const cl = svg('path', { d: 'M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z', fill }, bob);
  const cr = svg('path', { d: 'M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z', fill }, bob);
  const al = svg('path', { d: 'M45 15 Q35 5 30 8', stroke: C.lobBody, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, bob);
  const ar = svg('path', { d: 'M75 15 Q85 5 90 8', stroke: C.lobBody, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, bob);
  Ci(bob, 45, 35, 6, C.lobEye); Ci(bob, 75, 35, 6, C.lobEye);
  const pl = Ci(bob, 46, 34, 2.5, C.lobPupil), pr = Ci(bob, 76, 34, 2.5, C.lobPupil);
  const t0 = o.t0 || 0, sm = (u) => u * u * (3 - 2 * u);
  const snap = (u) => (u < 0.85 ? 0 : u < 0.9 ? -8 * sm((u - 0.85) / 0.05) : u < 0.95 ? -8 * (1 - sm((u - 0.9) / 0.05)) : 0);
  let last = '';
  F((t) => {
    const s = Math.max(0, t - t0);
    const fy = -5 * Math.sin(Math.PI * ((s % 4) / 4)) ** 2;
    const sl = snap((s % 4) / 4), sr = snap((((s - 0.2) % 4) + 4) % 4 / 4) * (s < 0.2 ? 0 : 1);
    const wg = 3 * Math.sin(2 * Math.PI * (s % 2) / 2);
    const bl = ((s % 3) / 3) > 0.9 && ((s % 3) / 3) < 0.95 ? 0.3 : 1;
    const key = [fy, sl, sr, wg, bl].map((v) => v.toFixed(2)).join(',');
    if (key === last) return; last = key;
    bob.setAttribute('transform', `translate(0 ${fy.toFixed(2)})`);
    cl.setAttribute('transform', `rotate(${sl.toFixed(2)} 26 53)`); cr.setAttribute('transform', `rotate(${sr.toFixed(2)} 94 53)`);
    al.setAttribute('transform', `rotate(${wg.toFixed(2)} 37.5 11)`); ar.setAttribute('transform', `rotate(${(-wg).toFixed(2)} 82.5 11)`);
    pl.setAttribute('opacity', bl); pr.setAttribute('opacity', bl);
  });
  return outer;
}
// 圆角卡片（Control UI 的 card：#161920 底、#2e3040 边、14px 圆角）
function clCard(parent, x, y, w, hh, o = {}) {
  const e = h('div', 'abs cl-card', parent); px(e, x, y, w, hh);
  if (o.bg) e.style.background = o.bg;
  if (o.border) e.style.borderColor = o.border;
  if (o.r != null) e.style.borderRadius = o.r + 'px';
  if (o.dash) e.style.borderStyle = 'dashed';
  return e;
}
// 胶囊：kind = acc（珊瑚红底、深色字）| on（#1f2330 底、亮字）| ok（绿描边绿字）| warn（琥珀描边）| out（灰描边灰字）
function clPill(parent, x, y, text, kind = 'on', size = 30) {
  const e = h('div', 'abs cl-pill', parent, text); px(e, x, y);
  const st = { acc: { background: C.clAccent, color: C.clBg }, on: { background: C.clHover, color: C.clStrong }, ok: { border: `2px solid ${C.clOk}`, color: C.clOk }, warn: { border: `2px solid ${C.clWarn}`, color: C.clWarn }, out: { border: `2px solid ${C.clBorder}`, color: C.clMuted } }[kind];
  css(e, { fontSize: size + 'px', lineHeight: '1.25', ...st });
  return e;
}
// 对话气泡：左上角一行发信方，下面是正文
function clBubble(parent, x, y, w, who, text, o = {}) {
  const b = clCard(parent, x, y, w, null, { bg: o.bg || C.clElev, r: 14 });
  css(b, { padding: '18px 26px 22px', whiteSpace: 'normal' });
  const a = h('div', 'cl', b, who); css(a, { fontSize: '24px', fontWeight: 600, color: o.whoC || C.clMuted, marginBottom: '6px' });
  const m = h('div', 'cl', b, text); css(m, { fontSize: (o.size || 34) + 'px', color: C.clStrong, lineHeight: '1.3' });
  return b;
}
// 文档引文卡片：等宽的原文 + 出处
function clQuote(parent, x, y, w, key, sub, o = {}) {
  const b = clCard(parent, x, y, w, null, { bg: C.clCard });
  css(b, { padding: '22px 30px', whiteSpace: 'normal', borderLeft: `6px solid ${o.bar || C.clAccent}` });
  const txt = has(key, sub);
  const q = h('div', 'clm', b, o.html ? o.html(esc(txt)) : esc(txt)); css(q, { fontSize: (o.size || 28) + 'px', lineHeight: '1.45', whiteSpace: 'pre-wrap', color: C.clText });
  const s = h('div', 'clm', b, (o.pre || '') + srcOf(key, { ver: true })); css(s, { fontSize: '24px', color: C.clMuted, marginTop: '12px', whiteSpace: 'normal' });
  return b;
}
// 一排胶囊：按内容自然排开
function clRow(parent, x, y, gap = 14) { const e = h('div', 'abs', parent); px(e, x, y); css(e, { display: 'flex', gap: gap + 'px', alignItems: 'center' }); return e; }

// ══════════ OpenCode 皮肤 ══════════
// 方块字标志：照 packages/tui/src/logo.ts 的字符与 component/logo.tsx 的上色规则逐格画。
// 「open」用弱化色，「code」用正文色；_ 是带阴影底色的空格，^ 是带阴影底色的上半块，~ 是阴影色的上半块；阴影色 = 底色与前景按 25% 混合。
const OC_LOGO = {
  left: ['                   ', '█▀▀█ █▀▀█ █▀▀█ █▀▀▄', '█__█ █__█ █^^^ █__█', '▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀~~▀'],
  right: ['             ▄     ', '█▀▀▀ █▀▀█ █▀▀█ █▀▀█', '█___ █__█ █__█ █^^^', '▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀'],
};
const mix = (a, b, k) => { const p = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
// 每个字符格 cw × ch（ch = 2 × cw，终端的字格比例）；返回每一格的 SVG 元素，便于逐列点亮
function ocLogo(g, x, y, cw, o = {}) {
  const ch = cw * 2, cells = [], bg = o.bg || C.ocBg;
  const draw1 = (lines, x0, fg) => {
    const sh = mix(bg, fg, 0.25);
    lines.forEach((line, row) => [...line].forEach((c, col) => {
      const X = x0 + col * cw, Y = y + row * ch, add = (e) => cells.push({ e, col: (x0 - x) / cw + col, row });
      if (c === ' ') return;
      if (c === '█') add(R(g, X, Y, cw + 0.5, ch + 0.5, fg));
      else if (c === '▀') add(R(g, X, Y, cw + 0.5, ch / 2, fg));
      else if (c === '▄') add(R(g, X, Y + ch / 2, cw + 0.5, ch / 2 + 0.5, fg));
      else if (c === '_') add(R(g, X, Y, cw + 0.5, ch + 0.5, sh));
      else if (c === '^') { add(R(g, X, Y, cw + 0.5, ch + 0.5, sh)); add(R(g, X, Y, cw + 0.5, ch / 2, fg)); }
      else if (c === '~') add(R(g, X, Y, cw + 0.5, ch / 2, sh));
    }));
  };
  draw1(OC_LOGO.left, x, o.muted || C.ocMuted);
  draw1(OC_LOGO.right, x + (OC_LOGO.left[0].length + 1) * cw, o.fg || C.ocText);
  return { cells, w: (OC_LOGO.left[0].length * 2 + 1) * cw, h: 4 * ch };
}
const colIn = (cells, t, dt) => { const by = {}; cells.forEach((c) => (by[c.col] = by[c.col] || []).push(c.e)); Object.keys(by).forEach((k) => appear(by[k], t + (+k) * dt)); };
// 终端面板：直角细边框，标题压在上边框上
function ocPane(parent, x, y, w, hh, title, o = {}) {
  const p = h('div', 'abs oc-pane', parent); px(p, x, y, w, hh);
  if (o.border) p.style.borderColor = o.border;
  if (o.bg) p.style.background = o.bg;
  let tl_ = null;
  if (title) { tl_ = h('div', 'abs oc', p, ' ' + title + ' '); css(tl_, { left: '24px', top: '-21px', fontSize: '28px', lineHeight: '36px', background: o.bg || C.ocBg, color: o.titleC || C.ocMuted }); }
  return { p, title: tl_ };
}
// 等宽的一行：parts = [[文本, 颜色], …]；返回元素
function ocLine(parent, x, y, parts, o = {}) {
  const html = (typeof parts === 'string' ? [[parts, C.ocText]] : parts).map(([s, c, b]) => `<span style="color:${c || C.ocText}${b ? ';background:' + b : ''}">${esc(s)}</span>`).join('');
  const e = tx(parent, o.bold ? 'ocb' : 'oc', x, y, html, { fontSize: (o.size || 30) + 'px', lineHeight: (o.lh || Math.round((o.size || 30) * 1.45)) + 'px' });
  return e;
}
// 反白标签（终端里的选中块）
function ocTag(parent, x, y, text, o = {}) {
  const e = tx(parent, 'ocb', x, y, esc(text), { fontSize: (o.size || 28) + 'px', lineHeight: '1.3', padding: '2px 12px', background: o.bg || C.ocPeach, color: o.c || C.ocBg });
  return e;
}

// ── 通用：折线上的位置，k ∈ [0, 1] ──
function polyAt(pts, k) {
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let d = clamp(k) * tot;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const u = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; } d -= seg[i]; }
  return pts[0];
}
// 行进的小块：OpenClaw 里是一枚圆角的消息气泡，OpenCode 里是一个字格大小的方块。ride(t0, d, pts, { hold })：在 [t0, t0+d] 沿折线走，之后停 hold 秒。
// 位置只由 t 决定；同一时刻只按最后一段生效。
function token(g, w, hh, fill, o = {}) {
  const e = R(g, -w / 2, -hh / 2, w, hh, fill, { rx: o.rx != null ? o.rx : 0, opacity: 0 });
  const legs = []; let last = '';
  F((t) => {
    let on = false, x = 0, y = 0;
    for (const L_ of legs) if (t >= L_.t0 && t < L_.t0 + L_.d + L_.hold) { [x, y] = polyAt(L_.pts, ease.io3(clamp((t - L_.t0) / L_.d))); on = true; }
    const key = on ? x.toFixed(1) + ',' + y.toFixed(1) : '';
    if (key === last) return; last = key;
    e.setAttribute('opacity', on ? 1 : 0); if (on) e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  });
  return { e, ride(t0, d, pts, oo = {}) { legs.push({ t0, d, pts, hold: oo.hold != null ? oo.hold : 0 }); return t0 + d; } };
}

// 面板的刷出：标题压在上边框上、伸出盒子之外，普通的 wipe 结束时的 inset(0) 会把它裁掉。这里的裁剪区四周各多留一点、上方多留标题的高度。
function wipeP(e, t, o = {}) {
  const P = '-40px -8px -8px -8px';
  const from = { l: 'inset(-40px 100% -8px -8px)', r: 'inset(-40px -8px -8px 100%)', t: 'inset(-40px -8px 100% -8px)', b: 'inset(100% -8px -8px -8px)' }[o.dir || 't'];
  tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t);
  tl.fromTo(e, { clipPath: from }, { clipPath: `inset(${P})`, duration: o.d || 0.35, ease: o.ease || 'steps(10)', immediateRender: true }, t);
  return e;
}
