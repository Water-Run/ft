// 系列共用的部件：小工具、斜线块、字节格、比特格、日历换算。与题目有关的部件（首集的验证码与 30 秒表盘）写在各集自己的 parts.js 里。
// 所有部件的状态都只由 t 决定：用 F() 逐帧算，不存历史。

// ── 小工具 ──
const txt = (parent, cls, html, x, y) => { const e = h('div', 'abs ' + cls, parent, html); px(e, x, y); return e; };
const blk = (parent, cls, x, y, w, hh) => { const e = h('div', 'blk ' + cls, parent); px(e, x, y, w, hh); return e; };
const backOut = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const group3 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ── 斜线块：不可信的一方（泄露的副本、假网站）。用 SVG 线条画，不用渐变 ──
function hatch(parent, x, y, w, hh, color, gap = 18, sw = 5) {
  const s = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, parent); px(s, x, y);
  for (let d = -hh; d < w; d += gap) svg('line', { x1: d, y1: hh, x2: d + hh, y2: 0, stroke: color, 'stroke-width': sw }, s);
  s.dataset.name = 'hatch';
  return s;
}

// ── 字节格：一排（或几排）十六进制字节。返回各格元素 ──
// o: { x, y, pitch, w, h, size, cols（每排几个）, rowGap, cls, idx（在上方标序号）, idxSize }
function byteCells(parent, bytes, o) {
  const cols = o.cols || bytes.length, out = [], idx = [];
  bytes.forEach((b, i) => {
    const cx = o.x + (i % cols) * o.pitch, cy = o.y + Math.floor(i / cols) * (o.rowGap || o.h);
    const e = h('div', 'byte ' + (o.cls || ''), parent, b); px(e, cx, cy, o.w, o.h); css(e, { fontSize: o.size + 'px', lineHeight: o.h + 'px' });
    out.push(e);
    if (o.idx) { const n = h('div', 'idx', parent, String(i)); px(n, cx, cy - (o.idxSize || 28) * 1.5, o.w); n.style.fontSize = (o.idxSize || 28) + 'px'; idx.push(n); }
  });
  out.idx = idx;
  return out;
}

// ── 比特格：实心 = 1，空心 = 0。每 8 个一组 ──
function bitCells(parent, bits, o) {
  const out = [];
  [...bits].forEach((c, i) => {
    const e = h('div', 'blk', parent); px(e, o.x + i * (o.s + o.gap) + Math.floor(i / 8) * (o.group || 0), o.y, o.s, o.s);
    e.style.setProperty('--c', o.color);                                    // 颜色放在变量里：加上类名 hot 即变成朱红，不必换元素
    css(e, c === '1' ? { background: 'var(--c)' } : { border: `${o.bw || 4}px solid var(--c)` });
    e.dataset.name = 'bit' + c;
    out.push(e);
  });
  return out;
}

// ── 日历换算（纯算术，不取系统时间）：公历日期 ↔ 自 1970-01-01 起的天数 ──
function daysFromCivil(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400), yoe = y - era * 400, doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1, doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function civilFromDays(z) {
  z += 719468;
  const era = Math.floor(z / 146097), doe = z - era * 146097, yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)), mp = Math.floor((5 * doy + 2) / 153), d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}
const unixOf = (y, m = 1, d = 1) => daysFromCivil(y, m, d) * 86400;
const two = (n) => String(n).padStart(2, '0');
const clockOf = (u, withSec = true) => { const s = ((u % 86400) + 86400) % 86400; return two(Math.floor(s / 3600)) + ':' + two(Math.floor(s / 60) % 60) + (withSec ? ':' + two(Math.floor(s) % 60) : ''); };

// ── 本集：构成主义海报的部件 ──
// 巨字：一个字母一个 span，字号按 grow 逐个放大，按基线排开；整组斜放，允许出画（被画框裁掉）
function giant(parent, word, o) {
  const g = h('div', 'abs giant ' + (o.cls || ''), parent); px(g, o.x, o.y);
  const letters = [...word].map((ch, i) => { const e = h('span', '', g, ch === ' ' ? '&nbsp;' : esc(ch)); e.style.fontSize = (o.size * Math.pow(o.grow || 1.22, i)).toFixed(0) + 'px'; return e; });
  gsap.set(g, { rotation: o.rot || 0, transformOrigin: '0% 100%', yPercent: -100 });
  g.dataset.overlapOk = '1';
  return { g, letters };
}
// 巨字逐个砸下：每个字母比上一个晚 gap 秒
function giantIn(G, t, gap = 0.09) {
  G.letters.forEach((e, i) => { slam(e, t + i * gap, { from: 1.6, d: 0.32, ease: 'power4.out' }); });
  sfx('thud', t, { g: 0.9, p: -0.4 }); sfx('thud', t + (G.letters.length - 1) * gap, { g: 0.7, p: -0.2 });
}
// 斜线：一条有宽度的平涂长条，从起点向终点「切」出来
function slash(parent, x1, y1, x2, y2, w, cls) {
  const len = Math.hypot(x2 - x1, y2 - y1), e = blk(parent, cls, x1, y1 - w / 2, len, w);
  gsap.set(e, { rotation: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, transformOrigin: '0% 50%' });
  e.dataset.overlapOk = '1';
  return e;
}
const cut = (e, t, d = 0.35) => { tl.fromTo(e, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: d, ease: 'power4.inOut', immediateRender: true }, t); sfx('whoosh', t, { g: 0.6, p: 0.3 }); return e; };
// 平涂多边形（整幅 SVG）；pts 是 [[x, y], …]
function poly(parent, pts, fill) {
  const s = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, parent); px(s, 0, 0);
  svg('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: COL[fill] || fill }, s);
  s.dataset.overlapOk = '1';
  return s;
}
// 盖印：略放大落下、无过冲，配一声闷响
function stamp(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 0, scale: o.from || 1.18 }, { autoAlpha: 1, scale: 1, duration: o.d || 0.16, ease: 'power2.in', immediateRender: true }, t); sfx(o.sfx || 'thud', t + (o.d || 0.16), { g: o.g || 0.6, p: o.p || 0.2 }); return e; }
// 一组元素整体退场：沿斜线方向收走
const clearOut = (e, t) => { tl.to(e, { autoAlpha: 0, x: -80, duration: 0.3, ease: 'power3.in' }, t); };
// 代码块
const code = (parent, html, x, y, size, cls = '') => { const e = txt(parent, 'code ' + cls, html, x, y); e.style.fontSize = size + 'px'; return e; };
const tag = (parent, cls, html, x, y) => txt(parent, 'tag ' + cls, html, x, y);
// 字数条：n 个字符，每字符 u 像素，从左长出；数字随条一起数上去
function countBar(parent, x, y, n, u, cls, label, t) {
  const b = blk(parent, cls, x, y, n * u, 46);
  const l = txt(parent, 'bar-l', '', x + n * u + 20, y + 2);
  tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.6, ease: 'power3.out', immediateRender: true }, t);
  countTo(l, 0, n, t, 0.6, (v) => label + ' ' + Math.round(v)); appear(l, t);
  return { b, l };
}
// 油墨纸纹：固定种子的噪点与纤维，画一次冻结成图，盖在画面上（正片叠底）
function paperGrain() {
  const c = document.createElement('canvas'); c.width = 1920; c.height = 968; c.className = 'grain';
  const g = c.getContext('2d'), r = seeded(1917);
  for (let i = 0; i < 26000; i++) { const a = r(); g.fillStyle = a < 0.5 ? 'rgba(27,24,22,0.10)' : 'rgba(120,96,60,0.07)'; g.fillRect(r() * 1920, r() * 968, 1 + r() * 2.2, 1 + r() * 2.2); }
  g.strokeStyle = 'rgba(120,96,60,0.06)'; g.lineWidth = 1;
  for (let i = 0; i < 700; i++) { const x = r() * 1920, y = r() * 968, a = r() * Math.PI, l = 6 + r() * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(233,224,204,0.35)'; g.fillRect(r() * 1920, r() * 968, 2 + r() * 10, 1 + r() * 2); }   // 漏墨的白点
  document.getElementById('hud').prepend(c);
  freeze(c).className = 'grain';
}

// ── 活的配置文件：全片同一份数据，换格式时语法飞散、数据与键名滑到新位置、新语法飞进来 ──
// 行里写 {host} 之类表示数据；<tag>、</tag>、引号、括号、标点各成一类，其余是键名。等宽字一格宽 0.6em。
const DATA = { host: 'localhost', port: '8080', user: 'app', dbport: '5432' };
const FMT = {
  ini: ['[server]', 'host = {host}', 'port = {port}', '', '[db]', 'user = {user}', 'port = {dbport}'],
  xml: ['<config>', '  <server>', '    <host>{host}</host>', '    <port>{port}</port>', '    <db>', '      <user>{user}</user>', '      <port>{dbport}</port>', '    </db>', '  </server>', '</config>'],
  json: ['{', '  "server": {', '    "host": "{host}",', '    "port": {port},', '    "db": {', '      "user": "{user}",', '      "port": {dbport}', '    }', '  }', '}'],
  yaml: ['server:', '  host: {host}', '  port: {port}', '  db:', '    user: {user}', '    port: {dbport}'],
  toml: ['[server]', 'host = "{host}"', 'port = {port}', '', '[server.db]', 'user = "{user}"', 'port = {dbport}'],
};
FMT.xmlA = FMT.xml.map((l, i) => (i === 1 ? '  <server name="web">' : l));   // XML 一幕加上属性之后的样子
const DOC = { x: 1060, y: 170, size: 46, lh: 64 };        // 文件在画面里的位置：各幕相同，换场时首尾相接
const CWD = DOC.size * 0.6;
function tokLine(s) {
  const out = [], re = /\{(\w+)\}|<\/\w+>|<[^>]+>|"|[\[\]{}]|[=:,.#]|[^{<"\[\]{}=:,.#\s]+|\s+/g;
  let m, col = 0;
  while ((m = re.exec(s))) {
    const w = m[0];
    if (m[1]) { out.push({ s: DATA[m[1]], cls: 'dv', id: m[1], col }); col += DATA[m[1]].length; continue; }
    if (/^\s+$/.test(w)) { col += w.length; continue; }
    const cls = w.startsWith('</') ? 'tc' : w.startsWith('<') ? 'to' : w === '"' ? 'q' : /^[\[\]{}]$/.test(w) ? 'b' : /^[=:,.#]$/.test(w) ? 'p' : 'k';
    out.push({ s: w, cls, col }); col += w.length;
  }
  return out;
}
const docLay = (lines) => lines.flatMap((l, row) => tokLine(l).map((k) => ({ ...k, row, x: Math.round(DOC.x + k.col * CWD), y: DOC.y + row * DOC.lh })));   // 取整：滑动的起止都是整数像素，倒着跳回来也一样
function docMk(d, k) {
  const e = h('span', 'abs tk ' + k.cls, d.el, esc(k.s)); px(e, k.x, k.y); e.style.fontSize = DOC.size + 'px';
  return { ...k, e };
}
// 一张文件：一块黑底（随行数伸缩）+ 一组字块
function makeDoc(parent, lines, rows) {
  const d = { el: h('div', 'abs', parent), toks: [] };
  d.slab = blk(d.el, 'bg-ink', DOC.x - 60, DOC.y - 50, 860, (rows || lines.length) * DOC.lh + 90); d.slab.dataset.overlapOk = '1';
  if (lines) d.toks = docLay(lines).map((k) => docMk(d, k));
  return d;
}
const slabH = (n) => n * DOC.lh + 90;
function docResize(d, n, t, from) { tl.fromTo(d.slab, { height: slabH(from) }, { height: slabH(n), duration: 0.45, ease: 'power3.inOut', immediateRender: false }, t); }
// 逐字打出来（按阅读顺序，cps 个字每秒）
function docType(d, lines, t, cps = 40) {
  let n = 0; const toks = docLay(lines).map((k) => docMk(d, k));
  toks.forEach((k) => { const tk = t + n / cps; n += k.s.length; tl.fromTo(k.e, { autoAlpha: 0, y: -18 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out', immediateRender: true }, tk); });
  for (let i = 0; i < n; i += 3) sfx('key', t + i / cps, { g: 0.5 });
  d.toks = d.toks.concat(toks);
  return t + n / cps;
}
// 换格式：数据与同名键滑过去；其余旧字块向下飞散，新字块从四面砸进来
function docMorph(d, lines, t, o = {}) {
  const lay = docLay(lines), old = d.toks.slice(), used = new Set(), next = [], r = seeded(o.seed || 11);
  const D = o.d || 0.6;
  for (const L of lay) {
    const same = old.find((k) => !used.has(k) && k.cls === L.cls && k.s === L.s && k.row === L.row && k.col === L.col);
    if (same) { used.add(same); next.push(same); continue; }        // 没变的字块原地不动
    let m = null;
    if (L.id) m = old.find((k) => k.id === L.id && !used.has(k));
    else if (L.cls === 'k') m = old.find((k) => !used.has(k) && k.cls === 'k' && k.s === L.s);
    if (m) {
      used.add(m);
      tl.fromTo(m.e, { left: m.x, top: m.y }, { left: L.x, top: L.y, duration: D, ease: 'power3.inOut', immediateRender: false }, t + 0.15 + r() * 0.12);
      next.push({ ...L, e: m.e });
    } else {
      const k = docMk(d, L), a = r() * Math.PI * 2;
      const q = o.quick || 1;                                     // quick < 1：连续快速换格式时压缩飞入的延迟与时长，免得与下一次换格式重叠
      tl.fromTo(k.e, { autoAlpha: 0, x: Math.cos(a) * 420, y: Math.sin(a) * 300, rotation: (r() - 0.5) * 90, scale: 2.2 }, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.42 * q, ease: 'power3.out', immediateRender: true }, t + (0.35 + r() * 0.45) * q);
      next.push(k);
    }
  }
  old.filter((k) => !used.has(k)).forEach((k) => tl.fromTo(k.e, { x: 0, y: 0, rotation: 0, autoAlpha: 1 }, { x: (r() - 0.5) * 1100, y: 380 + r() * 600, rotation: (r() - 0.5) * 160, autoAlpha: 0, duration: 0.55, ease: 'power2.in', immediateRender: false }, t + r() * 0.2));
  sfx('whoosh', t, { g: 0.8 }); sfx('thud', t + 0.75, { g: 0.7, p: -0.2 }); sfx('pop', t + 0.5, { g: 0.5, p: 0.3 });
  d.toks = next;
}
const docFind = (d, pred) => d.toks.filter(pred);
// 冲击：场景整体抖一下
function shake(root, t, a = 12) {
  if (a < 14) return;                       // 只留最重的落点；幅度收到四成（WaterRun 看 r2：「画面有点抖」）
  a *= 0.4;
  tl.fromTo(root, { x: 0, y: 0 }, { keyframes: [{ x: a, y: -a * 0.4, duration: 0.035, ease: 'none' }, { x: -a * 0.7, y: a * 0.3, duration: 0.05, ease: 'none' }, { x: a * 0.35, y: 0, duration: 0.05, ease: 'none' }, { x: 0, y: 0, duration: 0.08, ease: 'power2.out' }], immediateRender: false }, t);
}
// 换场：一块红色斜板从左边压过来盖住左半幅（上一场的最后一刻），下一场开头再抽走；右边的文件不动，首尾相接
function slab(parent) { const e = poly(parent, [[-60, 0], [1040, 0], [900, 968], [-60, 968]], 'ac'); e.style.zIndex = 20; return e; }
function slabIn(root, tEnd) { const e = slab(root); tl.fromTo(e, { xPercent: -110 }, { xPercent: 0, duration: 0.2, ease: 'power4.in', immediateRender: true }, tEnd - 0.2); sfx('whoosh', tEnd - 0.25, { g: 0.8 }); }
function slabOut(root, t0) { const e = slab(root); tl.fromTo(e, { xPercent: 0 }, { xPercent: -110, duration: 0.35, ease: 'power4.in', immediateRender: true }, t0 + 0.12); sfx('thud', t0, { g: 0.9, p: -0.5 }); }
// 进场的镜头：略推近、略斜，随斜板抽走落定
function settle(cam, t0) { cam.track(t0, { x: 960, y: 484, z: 1.06, r: -1.5 }, [[t0 + 0.1, { z: 1, r: 0 }, 0.7, { ease: 'power3.out', sfx: false }]]); }

// ── 服务器：开场在左边放大讲清楚，之后缩到左上角（DOCKED），一根红线连着文件；结尾再放大 ──
const SRV = { x: 120, y: 250, w: 560, h: 400 }, DOCKED = { x: 64, y: 108, s: 0.45 };
function serverBox(parent, port = '8080', docked = true) {
  const b = h('div', 'abs bg-ink srv', parent); px(b, SRV.x, SRV.y, SRV.w, SRV.h);
  txt(b, 'srv-l', '服务器', 40, 34);
  const p = txt(b, 'srv-n', `<span class="u">端口</span><span class="v">${port}</span>`, 40, 120);
  if (docked) gsap.set(b, { x: DOCKED.x - SRV.x, y: DOCKED.y - SRV.y, scale: DOCKED.s, transformOrigin: '0 0' });
  b.dataset.overlapOk = '1';
  return { b, v: p.querySelector('.v') };
}
// 服务器与文件之间的线：从服务器右缘接到文件黑底左缘
function cable(parent, docked = true) {
  const y = docked ? DOCKED.y + SRV.h * DOCKED.s / 2 : SRV.y + 180, x0 = docked ? DOCKED.x + SRV.w * DOCKED.s : SRV.x + SRV.w;
  const e = blk(parent, 'bg-ac', x0, y - 4, DOC.x - 60 - x0, 8); e.dataset.overlapOk = '1';
  return e;
}
// 每一幕的底：纸、镜头、左上角的服务器与连线、开头抽走上一幕的红板
function stage(root, s, o = {}) {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);
  const srv = o.server === false ? null : serverBox(world), wire = o.server === false ? null : cable(world);
  if (o.slab !== false) { slabOut(root, s.start); settle(cam, s.start); }
  return { world, cam, srv, wire };
}

// 从文件左边伸出的指示：一块标签 + 一根红线接到某一行
function pointer(parent, cls, html, row, t, o = {}) {
  const y = DOC.y + row * DOC.lh + 22, e = tag(parent, cls, html, o.x || 560, y - 26);
  const ln = blk(parent, 'bg-ac', (o.x || 560) + (o.w || 300), y - 3, DOC.x - 60 - (o.x || 560) - (o.w || 300) + (o.into || 0), 6); ln.dataset.overlapOk = '1';
  stamp(e, t, { g: 0.5 }); tl.fromTo(ln, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out', immediateRender: true }, t + 0.1);
  return { e, ln };
}
// 在文件上框出一段（行 r0–r1、从第 c 列起）
function docBox(parent, r0, r1, c, cols, t, o = {}) {
  const e = h('div', 'abs', parent); px(e, DOC.x + c * CWD - 14, DOC.y + r0 * DOC.lh - 12, cols * CWD + 28, (r1 - r0 + 1) * DOC.lh - 6);
  css(e, { border: `${o.w || 6}px solid ${o.color || '#F0553F'}` }); e.dataset.overlapOk = '1';
  tl.fromTo(e, { clipPath: 'inset(0% 100% 100% 0%)' }, { clipPath: 'inset(-5% -5% -5% -5%)', duration: 0.4, ease: 'power3.inOut', immediateRender: true }, t);
  sfx('tick', t, { g: 0.6 });
  return e;
}
