// 关键帧的小工具：建元素、画箭头、画等距立方体。只用于 src/design/ 的静帧，不进成片引擎。
const D = {
  stage: document.getElementById('stage'),
  F: +(new URLSearchParams(location.search).get('f') || 1),
  el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || D.stage).appendChild(e); return e; },
  at(e, x, y, w, h) { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w != null) e.style.width = w + 'px'; if (h != null) e.style.height = h + 'px'; return e; },
  hud(ch, file) {
    const h = D.el('div', 'hud');
    D.el('img', '', h).src = '/img/lua-logo.svg';
    D.el('div', 'ch', h, ch);
    if (file) D.el('div', 'file', h, file);
  },
  caption(text) { D.el('div', 'caption', null, text.replace(/\*(.+?)\*/g, '<b>$1</b>')); },
  // 代码块：lines = [[行号, 文本, 是否高亮], ...]
  code(x, y, lines, cls, w) {
    const box = D.at(D.el('div', 'abs code ' + (cls || '')), x, y, w);
    for (const [n, t, hl] of lines) {
      const r = D.el('span', 'row' + (hl ? ' hl' : ''), box);
      D.el('span', 'ln', r, n == null ? '' : String(n));
      D.el('span', '', r, t.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
    }
    return box;
  },
  svg() { if (!D._svg) { D._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); D._svg.setAttribute('class', 'over'); D._svg.setAttribute('viewBox', '0 0 1920 1080');
    D._svg.innerHTML = '<defs>' + ['navy', 'red', 'ink'].map((k) => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${{ navy: '#000080', red: '#FF0000', ink: '#000' }[k]}"/></marker>`).join('') + '</defs>';
    D.stage.appendChild(D._svg); } return D._svg; },
  path(d, color, width, opts = {}) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('fill', opts.fill || 'none'); p.setAttribute('stroke', color); p.setAttribute('stroke-width', width || 3);
    if (opts.dash) p.setAttribute('stroke-dasharray', opts.dash);
    if (opts.arrow) p.setAttribute('marker-end', `url(#ah-${opts.arrow})`);
    if (opts.dot) { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); const m = d.match(/M\s*([\d.]+)[ ,]([\d.]+)/); c.setAttribute('cx', m[1]); c.setAttribute('cy', m[2]); c.setAttribute('r', 7); c.setAttribute('fill', color); D.svg().appendChild(c); }
    D.svg().appendChild(p); return p;
  },
  poly(pts, fill, stroke, sw) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', pts.map((q) => q.join(',')).join(' ')); p.setAttribute('fill', fill); if (stroke) { p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', sw || 2); p.setAttribute('stroke-linejoin', 'round'); }
    D.svg().appendChild(p); return p;
  },
  text(x, y, s, size, color, anchor, font) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', size); t.setAttribute('fill', color || '#000'); t.setAttribute('text-anchor', anchor || 'start');
    t.setAttribute('font-family', font || 'Mono'); t.textContent = s; D.svg().appendChild(t); return t;
  },
  // 等距投影：x 向右下、y 向左下、z 向上；单位像素
  iso(ox, oy) { const c = Math.cos(Math.PI / 6); return (x, y, z) => [ox + (x - y) * c, oy + (x + y) * 0.5 - z]; },
  // 立方体：三个可见面，顶面最亮
  box(P, x, y, z, w, d, h, top, left, right, stroke) {
    const A = (a, b, c) => P(a, b, c);
    D.poly([A(x, y, z + h), A(x + w, y, z + h), A(x + w, y + d, z + h), A(x, y + d, z + h)], top, stroke, 1.5);
    D.poly([A(x, y + d, z), A(x + w, y + d, z), A(x + w, y + d, z + h), A(x, y + d, z + h)], left, stroke, 1.5);
    D.poly([A(x + w, y, z), A(x + w, y + d, z), A(x + w, y + d, z + h), A(x + w, y, z + h)], right, stroke, 1.5);
  },
  // 斜二测：x 水平、z 竖直，深度 y 朝右上收进去（30°，缩为 0.6）；正面是不变形的矩形，文字写在正面上
  obl(ox, oy) { const k = 0.6; return (x, y, z) => [ox + x + y * k * Math.cos(Math.PI / 6), oy - z - y * k * Math.sin(Math.PI / 6)]; },
  obox(P, x, y, z, w, d, h, front, top, side, stroke) {
    const A = (a, b, c) => P(a, b, c);
    D.poly([A(x, y, z + h), A(x + w, y, z + h), A(x + w, y + d, z + h), A(x, y + d, z + h)], top, stroke, 1.5);
    D.poly([A(x + w, y, z), A(x + w, y + d, z), A(x + w, y + d, z + h), A(x + w, y, z + h)], side, stroke, 1.5);
    D.poly([A(x, y, z), A(x + w, y, z), A(x + w, y, z + h), A(x, y, z + h)], front, stroke, 1.5);
    const [cx, cy] = A(x + w / 2, y, z + h / 2);
    return [cx, cy];
  },
  ready() { document.fonts.ready.then(() => { document.body.dataset.ready = '1'; }); },
};
