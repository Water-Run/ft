// 「像一页 sqlite.org 文档」的公用零件：关键帧（keyframes.html）与封面候选（covers.html）共用，正片场景按同一套写。
// 依据：2026-11-01 实看 sqlite.org 首页、lang_select.html、fileformat2.html 的渲染与 sqlite.css（WaterRun：「风格还是不够契合啊, 比如你那个封面, 看看SQLite官网吧」）。
// 官网的样子：白纸、黑色小号正文（Verdana）；页头左边是标志、右边两行斜体标语；深青主菜单小圆角，菜单项是左对齐的白色小字，最右是 Search；
// 页标题居中、深青、常规字重；小节标题带编号、左对齐、深青；术语是深青带下划线的链接；侧栏是 2px 深青边框的盒子；按钮灰底灰边小圆角；
// 代码块 #eee 底 1px #80a796 边；表头左对齐、下面一条 1px #444；TODO 是红色斜体加 1px 红框；语法铁路图：黑细线、白底，关键字用圆头框、其余用方框，分组是浅灰框加竖排灰色斜体名。
// 不放标志（系列约定），页头左边写纯文字；不用标志的羽毛色；强调只用文档自己的悬停麦色（wheat）与已访问链接的紫褐。
// 字体：官网用 Verdana，仓库不带，用 Inter + 思源黑体的常规字重。画面是 1920×1080 的 SVG，纯函数，无随机数。
(function () {
  const C = { ink: '#000000', body: '#1a1a1a', teal: '#044a64', link: '#044a64', visited: '#734559', wheat: '#f5deb3', code: '#eeeeee', codeLine: '#80a796', rule: '#444444', grey: '#dddddd', greyLine: '#aaaaaa', group: '#c8c8c8', dim: '#666666', todo: '#aa3333', paper: '#ffffff' };
  const NS = 'http://www.w3.org/2000/svg';
  const textW = (s, fs) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e80 ? fs : fs * 0.6), 0);   // 估算字宽：汉字一个字号宽，西文与等宽字约 0.6 个字号
  let svg = null;
  const init = (stage) => { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 1920 1080'); stage.appendChild(svg); el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: C.paper }); return svg; };
  function el(tag, a, p) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  function text(x, y, s, a = {}, p) { const t = el('text', { x, y, fill: C.body, 'font-family': 'Inter, "Sans SC"', 'font-weight': 400, ...a }, p); t.textContent = s; return t; }
  // 一行里混排普通字与链接字：parts = ['普通', ['链接'], '普通'…]；链接深青带下划线
  function rich(x, y, parts, fs = 32, a = {}) {
    const t = el('text', { x, y, 'font-size': fs, fill: C.body, 'font-family': 'Inter, "Sans SC"', 'font-weight': 400, ...a });
    for (const p of parts) { const sp = el('tspan', Array.isArray(p) ? { fill: C.link, 'text-decoration': 'underline' } : {}, t); sp.textContent = Array.isArray(p) ? p[0] : p; }
    return t;
  }
  // 页头：左纯文字（不放标志），右两行斜体标语；下面深青主菜单：左对齐的白字菜单项，当前项加下划线，最右一项像官网的 Search
  const CHAPS = ['一个库', '怎么放', '怎么找', '一页里', '回滚日志', 'WAL', '删', '五个问题'];
  function chrome(cur, right = 'PART 4') {
    text(60, 92, 'SQLite 3.54.1', { 'font-size': 44, fill: C.teal });
    text(1860, 58, 'Small. Fast. Reliable.', { 'font-size': 26, 'font-style': 'italic', 'text-anchor': 'end', fill: C.body });
    text(1860, 92, 'Choose any three.', { 'font-size': 26, 'font-style': 'italic', 'text-anchor': 'end', fill: C.body });
    el('rect', { x: 60, y: 112, width: 1800, height: 46, rx: 6, fill: C.teal });
    let x = 86;
    CHAPS.forEach((s, i) => {
      const t = text(x, 144, s, { 'font-size': 25, fill: '#ffffff' });
      if (cur === i + 1) t.setAttribute('text-decoration', 'underline');
      x += s.length * 25 + 46;
    });
    text(1834, 144, right, { 'font-size': 25, fill: '#ffffff', 'text-anchor': 'end' });
  }
  const pageTitle = (s, y = 236, fs = 60) => text(960, y, s, { 'font-size': fs, fill: C.teal, 'text-anchor': 'middle' });
  const h2 = (x, y, s, fs = 44) => text(x, y, s, { 'font-size': fs, fill: C.teal });
  const footer = (s) => text(960, 940, s, { 'font-size': 22, 'font-style': 'italic', fill: C.body, 'text-anchor': 'middle' });
  // 侧栏盒：2px 深青边；标题粗体居中；下面一列圆点 + 链接
  function sidebar(x, y, w, title, items, fs = 26) {
    const hh = 70 + items.length * fs * 1.45 + 24;
    el('rect', { x, y, width: w, height: hh, fill: '#fff', stroke: C.teal, 'stroke-width': 2.5 });
    text(x + w / 2, y + 48, title, { 'font-size': fs + 4, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    items.forEach((s, i) => { const yy = y + 70 + (i + 0.8) * fs * 1.45; el('circle', { cx: x + 36, cy: yy - fs * 0.32, r: 4, fill: C.ink }); const t = text(x + 54, yy, s, { 'font-size': fs, fill: C.link, 'text-decoration': 'underline' }); });
    return hh;
  }
  function button(x, y, s, fs = 24) { const w = textW(s, fs) + 28; el('rect', { x, y: y - fs - 6, width: w, height: fs + 16, rx: 5, fill: C.grey, stroke: C.greyLine, 'stroke-width': 2 }); text(x + w / 2, y + 2, s, { 'font-size': fs, 'text-anchor': 'middle', fill: C.ink }); return w; }
  function codeblock(x, y, lines, fs = 28) {
    const w = Math.max(...lines.map((s) => textW(s, fs))) + 44, hh = lines.length * fs * 1.4 + 26;
    el('rect', { x, y, width: w, height: hh, fill: C.code, stroke: C.codeLine, 'stroke-width': 1.5 });
    lines.forEach((s, i) => text(x + 22, y + 13 + fs * 1.08 + i * fs * 1.4, s, { 'font-family': 'Mono', 'font-size': fs, fill: C.ink }));
    return { w, h: hh };
  }
  function todo(x, y, s, fs = 28) { const w = textW(s, fs) + 40; el('rect', { x, y: y - fs - 10, width: w, height: fs + 24, fill: '#fff', stroke: C.todo, 'stroke-width': 1.5 }); text(x + 20, y + 2, s, { 'font-size': fs, 'font-style': 'italic', fill: C.todo }); return w; }
  // 文档表格：表头左对齐、下面一条 1px #444；每格左对齐
  function table(x, y, cols, rows, fs = 28, rowH = 46) {
    let cx = x; cols.forEach(([h, w]) => { text(cx, y, h, { 'font-size': fs, 'font-weight': 700, fill: C.ink }); cx += w; });
    const W = cols.reduce((a, c) => a + c[1], 0);
    el('rect', { x, y: y + 12, width: W, height: 1.5, fill: C.rule });
    rows.forEach((r, i) => { let xx = x; r.forEach((cell, j) => { const yy = y + 12 + rowH * (i + 1) - 12; if (Array.isArray(cell)) { if (cell[1]) el('rect', { x: xx - 8, y: yy - fs - 4, width: cols[j][1] - 8, height: fs + 16, fill: C.wheat }); text(xx, yy, cell[0], { 'font-size': fs, fill: C.ink, 'font-family': cell[2] || 'Inter, "Sans SC"' }); } else text(xx, yy, cell, { 'font-size': fs, fill: C.ink }); xx += cols[j][1]; }); });
    return W;
  }
  // 铁路图零件：圆头框（关键字）、方框、带实心箭头的线、起点小圆、分组浅灰框与竖排灰色斜体名
  function rrBox(x, y, s, o = {}) {
    const fs = o.fs || 28, w = o.w || Math.max(fs * 2.2, textW(s, fs) + 40), h = fs + 22, r = o.round === false ? 0 : h / 2;
    el('rect', { x, y: y - h / 2, width: w, height: h, rx: r, fill: o.fill || '#fff', stroke: o.stroke || C.ink, 'stroke-width': o.sw || 2 });
    text(x + w / 2, y + fs * 0.36, s, { 'font-size': fs, 'text-anchor': 'middle', fill: C.ink, 'font-family': o.mono ? 'Mono' : 'Inter, "Sans SC"' });
    return { x, y, w, h, r: x + w };
  }
  function arrowHead(x, y, dir = 'r', s = 9) {
    const pts = { r: [[x, y], [x - s * 1.5, y - s * 0.75], [x - s * 1.5, y + s * 0.75]], l: [[x, y], [x + s * 1.5, y - s * 0.75], [x + s * 1.5, y + s * 0.75]], d: [[x, y], [x - s * 0.75, y - s * 1.5], [x + s * 0.75, y - s * 1.5]], u: [[x, y], [x - s * 0.75, y + s * 1.5], [x + s * 0.75, y + s * 1.5]] }[dir];
    el('polygon', { points: pts.map((q) => q.join(',')).join(' '), fill: C.ink });
  }
  function rrLine(d, o = {}) { return el('path', { d, fill: 'none', stroke: o.stroke || C.ink, 'stroke-width': o.sw || 2, 'stroke-linejoin': 'round' }); }
  function rrStart(x, y) { el('circle', { cx: x, cy: y, r: 7, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }); }
  // 组名：官网把它放在没有线经过的地方；这里线从框的左右两边穿过，组名写在框内右上角
  function rrGroup(x, y, w, h, name) { el('rect', { x, y, width: w, height: h, fill: 'none', stroke: C.group, 'stroke-width': 2 }); text(x + w - 12, y + 30, name, { 'font-size': 22, 'font-style': 'italic', fill: '#888', 'text-anchor': 'end' }); }
  // 等轴投影（封面的立体）：x 向右下、y 向左下、z 向上
  let O = [0, 0], S = 1;
  const iso = { set(o, s) { O = o; S = s; }, P: (x, y, z) => [O[0] + (x - y) * 0.866 * S, O[1] + (x + y) * 0.5 * S - z * S] };
  const poly = (pts, a) => el('polygon', { points: pts.map((q) => q.join(',')).join(' '), ...a });
  // 一叠纸（文档纸）：白顶、浅灰两侧、侧面画出一层层纸边；线是黑色细线
  function paperStack(x, y, z, w, d, h, layers, o = {}) {
    const P = iso.P, g = el('g', {});
    const st = { stroke: C.ink, 'stroke-width': o.sw || 1.6, 'stroke-linejoin': 'round' };
    poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], { fill: '#f4f4f4', ...st });
    poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], { fill: '#e6e6e6', ...st });
    for (let i = 1; i < layers; i++) { const zz = z + h * i / layers; el('polyline', { points: [P(x, y + d, zz), P(x + w, y + d, zz), P(x + w, y, zz)].map((q) => q.join(',')).join(' '), fill: 'none', stroke: '#b4b4b4', 'stroke-width': 1 }); }
    poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], { fill: o.top || '#fff', ...st });
    return g;
  }
  window.DOC = { C, init, el, text, rich, chrome, pageTitle, h2, footer, sidebar, button, codeblock, todo, table, rrBox, arrowHead, rrLine, rrStart, rrGroup, iso, poly, paperStack, CHAPS };
})();
