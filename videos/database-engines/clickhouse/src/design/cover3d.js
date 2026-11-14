/* 封面用的小型 3D（只供封面候选，不进正片）：
   透视投影的长方体，画成 SVG 多边形——按面的朝向打光、顶面与棱边高光、拉丝纹理、行刻线、荧光溢出、地面倒影与网格。
   世界坐标：x 向右，y 向上，z 向远处。画面是时间的纯函数这条规则只管正片；封面是静态页，随机数一律用固定种子。 */
(function (G) {
  const NS = 'http://www.w3.org/2000/svg';
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (c, k) => 'rgb(' + c.map((v) => Math.max(0, Math.min(255, Math.round(v * k)))).join(',') + ')';
  let uid = 0;

  function Scene(svg, o) {
    const ya = (o.yaw == null ? -24 : o.yaw) * Math.PI / 180, pa = (o.pitch == null ? 12 : o.pitch) * Math.PI / 180;
    const cyw = Math.cos(ya), syw = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa);
    const f = o.f, D = o.D, cx = o.cx, cy = o.cy;
    const Lraw = o.light || [-0.5, 0.85, -0.45], Ln = Math.hypot(...Lraw), L = Lraw.map((v) => v / Ln);
    const defs = el('defs'); svg.appendChild(defs);
    const layer = {}; for (const n of ['floor', 'refl', 'obj', 'top']) { layer[n] = el('g'); svg.appendChild(layer[n]); }
    function el(tag, a, parent) { const e = document.createElementNS(NS, tag); for (const k in (a || {})) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
    const proj = (x, y, z) => {
      const X = x * cyw + z * syw, Z0 = -x * syw + z * cyw;
      const Y = y * cp + Z0 * sp, Z = -y * sp + Z0 * cp;
      const s = f / (D + Z);
      return [cx + X * s, cy - Y * s, Z];
    };
    const nz = (n) => -n[1] * sp + (-n[0] * syw + n[2] * cyw) * cp;     // 法线在相机里的 z：< 0 朝向相机
    const FACES = [
      { k: 'front', n: [0, 0, -1], c: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
      { k: 'left', n: [-1, 0, 0], c: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]] },
      { k: 'right', n: [1, 0, 0], c: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
      { k: 'top', n: [0, 1, 0], c: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
    ];
    const pts = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    // 纹理滤镜：拉丝（竖向 / 横向）与细颗粒。只作用在传入的多边形内
    const texId = {};
    function tex(kind, seed) {
      const key = kind + seed; if (texId[key]) return texId[key];
      const id = 'tx' + (++uid), bf = kind === 'v' ? '0.9 0.012' : kind === 'h' ? '0.012 0.9' : '0.8';
      const fl = el('filter', { id, x: '0', y: '0', width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }, defs);
      el('feTurbulence', { type: 'fractalNoise', baseFrequency: bf, numOctaves: 2, seed: seed || 3, result: 'n' }, fl);
      el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.3 0 0 0 -0.35', result: 'm' }, fl);
      el('feComposite', { in: 'm', in2: 'SourceGraphic', operator: 'in' }, fl);
      return (texId[key] = id);
    }

    // 画一个长方体。m = { c:[r,g,b] 或 '#hex', emissive, flat, rows, rowColor, tex:'v'|'h'|'n', texAlpha, edge, glow, mirror, seed, top, side }
    function box(x0, y0, z0, w, h, d, m, into) {
      const g = el('g', null, into || layer.obj);
      const c = typeof m.c === 'string' ? hex(m.c) : m.c;
      const mir = !!m.mirror;
      const Y0 = mir ? -(y0 + h) : y0;
      const V = (v) => proj(x0 + v[0] * w, Y0 + v[1] * h, z0 + v[2] * d);
      for (const F of FACES) {
        const n = mir ? [F.n[0], -F.n[1], F.n[2]] : F.n;
        if (nz(n) >= 0) continue;
        if (mir && F.k === 'top') continue;
        const P = F.c.map(V);
        const diff = Math.max(0, F.n[0] * L[0] + F.n[1] * L[1] + F.n[2] * L[2]);
        const base = m.emissive ? 0.9 + 0.2 * diff : 0.32 + 0.9 * diff;
        const tone = F.k === 'top' && m.top ? hex(m.top) : (F.k !== 'top' && m.side ? hex(m.side) : c);
        let fill;
        if (m.flat) fill = mix(tone, base);
        else {
          const id = 'g' + (++uid), gr = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse' }, defs);
          let a, b;
          if (F.k === 'top') { a = mid(P[3], P[2]); b = mid(P[0], P[1]); } else { a = mid(P[2], P[3]); b = mid(P[0], P[1]); }
          if (F.k === 'top') { gr.setAttribute('x1', a[0]); gr.setAttribute('y1', a[1]); gr.setAttribute('x2', b[0]); gr.setAttribute('y2', b[1]); }
          else { gr.setAttribute('x1', a[0]); gr.setAttribute('y1', a[1]); gr.setAttribute('x2', b[0]); gr.setAttribute('y2', b[1]); }
          const k1 = F.k === 'top' ? base * 1.06 : base * (m.emissive ? 1.08 : 1.12), k2 = F.k === 'top' ? base * 0.88 : base * (m.emissive ? 0.92 : 0.6);
          el('stop', { offset: 0, 'stop-color': mix(tone, k1) }, gr); el('stop', { offset: 1, 'stop-color': mix(tone, k2) }, gr);
          fill = 'url(#' + id + ')';
        }
        el('polygon', { points: pts(P), fill, 'shape-rendering': 'geometricPrecision' }, g);
        if (m.tex && !m.flat && !mir) el('polygon', { points: pts(P), fill: '#fff', filter: 'url(#' + tex(F.k === 'top' ? 'n' : m.tex, m.seed || 3) + ')', style: 'mix-blend-mode:overlay;opacity:' + (m.texAlpha == null ? 0.5 : m.texAlpha) }, g);
        if (m.rows && F.k !== 'top' && !mir) {
          const [p0, p1, p2, p3] = P;
          for (let i = 1; i < m.rows; i++) {
            const t = i / m.rows, A = [p0[0] + (p3[0] - p0[0]) * t, p0[1] + (p3[1] - p0[1]) * t], B = [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
            el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: m.rowColor || 'rgba(0,0,0,.28)', 'stroke-width': m.rowW || 1.4 }, g);
          }
        }
      }
      if (m.edge !== false && !mir) {
        const ea = m.edgeA == null ? 1 : m.edgeA;
        const T = [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]].map(V), Fr = [[0, 1, 0], [1, 1, 0]].map(V), Ve = [[ya > 0 ? 1 : 0, 0, 0], [ya > 0 ? 1 : 0, 1, 0]].map(V);
        el('polygon', { points: pts(T), fill: 'none', stroke: 'rgba(255,255,255,' + (0.22 * ea) + ')', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
        el('polyline', { points: pts(Fr), fill: 'none', stroke: 'rgba(255,255,255,' + ((m.emissive ? 0.75 : 0.4) * ea) + ')', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
        el('polyline', { points: pts(Ve), fill: 'none', stroke: 'rgba(255,255,255,' + ((m.emissive ? 0.6 : 0.3) * ea) + ')', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      }
      if (m.glow) g.setAttribute('style', 'filter:drop-shadow(0 0 ' + (m.glowR || 34) + 'px ' + m.glow + ')');
      if (m.filter) g.setAttribute('style', 'filter:' + m.filter);
      return g;
    }

    // 地面倒影：把长方体翻到地面以下，用渐隐的蒙版淡出
    function reflect(x0, y0, z0, w, h, d, m, fade) {
      const id = 'rm' + (++uid), mk = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: o.W || 1920, height: o.H || 1080 }, defs);
      const gid = 'rf' + (++uid), gr = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: fade[0], x2: 0, y2: fade[1] }, defs);
      el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': fade[2] == null ? 0.35 : fade[2] }, gr); el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, gr);
      el('rect', { x: 0, y: 0, width: o.W || 1920, height: o.H || 1080, fill: 'url(#' + gid + ')' }, mk);
      const g = el('g', { mask: 'url(#' + id + ')' }, layer.refl);
      box(x0, y0, z0, w, h, d, Object.assign({}, m, { mirror: true, glow: null }), g);
    }

    // 地面网格：y = 0 的细线，越远越淡
    function grid(a) {
      const g = el('g', { stroke: a.color || 'rgba(255,255,255,.07)', 'stroke-width': a.w || 1.2, fill: 'none' }, layer.floor);
      for (let x = a.x0; x <= a.x1 + 0.1; x += a.gs) { const A = proj(x, 0, a.z0), B = proj(x, 0, a.z1); el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, g); }
      for (let z = a.z0; z <= a.z1 + 0.1; z += a.gs) { const A = proj(a.x0, 0, z), B = proj(a.x1, 0, z); el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, g); }
      if (a.fadeMask) g.setAttribute('mask', 'url(#' + a.fadeMask + ')');
      return g;
    }

    // 地面上的柔光斑（椭圆渐变）
    function pool(x, z, rx, rz, color, alpha) {
      const id = 'pl' + (++uid), gr = el('radialGradient', { id }, defs);
      el('stop', { offset: 0, 'stop-color': color, 'stop-opacity': alpha }, gr); el('stop', { offset: 1, 'stop-color': color, 'stop-opacity': 0 }, gr);
      const P = [proj(x - rx, 0, z - rz), proj(x + rx, 0, z - rz), proj(x + rx, 0, z + rz), proj(x - rx, 0, z + rz)];
      const cxp = (P[0][0] + P[2][0]) / 2, cyp = (P[0][1] + P[2][1]) / 2, rxp = Math.abs(P[1][0] - P[0][0]) / 2 + Math.abs(P[2][0] - P[1][0]) / 2, ryp = Math.abs(P[2][1] - P[0][1]) / 2 + 22;
      el('ellipse', { cx: cxp, cy: cyp, rx: rxp, ry: ryp, fill: 'url(#' + id + ')' }, layer.floor);
    }

    return { proj, box, reflect, grid, pool, el, defs, layer, svg };
  }
  G.C3 = { Scene };
})(window);
