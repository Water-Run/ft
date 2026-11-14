// 量化：本片共用的数据读取、颜色、数据砖与两件道具（显卡、笔记本）。只读 window.DATA（由 tools/gen_data.py 从 research/lab/ 生成），
// 不写任何状态；画面是 t 的纯函数，这里的函数也都只由参数决定。
window.QZ = (function () {
  const D = window.DATA, G = D.group;

  // 紫色的深浅就是一个数的大小：从深靛（最小）经紫到粉白（最大）
  const STOPS = [[0, [26, 11, 94]], [0.35, [91, 33, 214]], [0.6, [168, 85, 247]], [0.82, [232, 121, 249]], [1, [255, 227, 255]]];
  const hexOf = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  const ramp = (u) => {
    u = Math.min(1, Math.max(0, u));
    let i = 1;
    while (i < STOPS.length - 1 && STOPS[i][0] < u) i++;
    const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], k = (u - a) / (b - a || 1);
    return hexOf(ca.map((c, j) => c + (cb[j] - c) * k));
  };
  const grad = () => 'linear-gradient(90deg,' + STOPS.map(([u, c]) => hexOf(c) + ' ' + (u * 100).toFixed(2) + '%').join(',') + ')';
  // 把 u 压到 n 种值里最近的一种（n 很大时等于不压）
  const post = (u, n) => (n >= 4096 ? u : Math.round(Math.min(1, Math.max(0, u)) * (n - 1)) / (n - 1));

  // ── 数值 ↔ 横坐标：第 1000 组的 32 个数都落在 [-0.025, 0.025] 之间 ──
  const VMIN = -0.025, VMAX = 0.025;
  const xOf = (v, x0, w) => x0 + (v - VMIN) / (VMAX - VMIN) * w;
  const uOf = (v) => (v - VMIN) / (VMAX - VMIN);          // 数 → 颜色位置
  // 16 位：BF16 就是 32 位浮点数的高 16 位（真实文件里的值正好能无损表示）
  const bits16 = (v) => ((new Uint32Array(new Float32Array([v]).buffer)[0] + 0x8000) >>> 16).toString(2).padStart(16, '0');
  const bits4 = (c) => c.toString(2).padStart(4, '0');
  const valueOfCode = (c) => (c - 8) * G.d;               // (编号 − 8) × d，与 llama.cpp 的 Q4_0 一致（FACTS B2）

  const el = (parent, x, y, w, hh, styles = {}, html = '', cls = '') => {
    const e = h('div', 'abs ' + cls, parent, html);
    px(e, x, y, w, hh);
    css(e, styles);
    return e;
  };

  // ── 数据砖的纹理：一片「数」，每格一种紫。这是示意（真实权重的排布没有这种起伏），只用来让深浅与色阶看得见；
  // 一块砖代表 1 GB。种子固定，同一块砖每次构建都一样。levels 为这一档能取的值的个数：65536（原版）、256、16、4、2 ──
  const field = (seed) => {
    const r = seeded(seed * 7919 + 13), P = [];
    for (let i = 0; i < 3; i++) P.push({ fx: [0.3, 0.7, 1.3][i] * (0.7 + r() * 0.6), fy: [0.25, 0.6, 1.1][i] * (0.7 + r() * 0.6), ph: r() * 6.283, pv: r() * 6.283, a: [0.3, 0.12, 0.05][i] });
    const c0 = 0.34 + r() * 0.32;
    return (x, y) => {
      let u = c0;
      for (const p of P) u += p.a * Math.sin(p.fx * x * 6.283 + p.ph) * Math.cos(p.fy * y * 6.283 + p.pv);
      return Math.min(0.98, Math.max(0.02, u));
    };
  };
  const CACHE = {};
  window.PENDING = window.PENDING || [];
  // cw×ch 格，每格 cell 像素；xs/ys 是这片纹理在场里占的跨度（用来让宽窄不同的条带起伏一致）
  function texURL(seed, levels, cw, ch, cell, xs = 1, ys = 1) {
    const key = [seed, levels, cw, ch, cell, xs, ys].join('|');
    if (CACHE[key]) return CACHE[key];
    const c = document.createElement('canvas'); c.width = cw * cell; c.height = ch * cell;
    const g = c.getContext('2d'), f = field(seed);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      g.fillStyle = ramp(post(f((i + 0.5) / cw * xs, (j + 0.5) / ch * ys), levels));
      g.fillRect(i * cell, j * cell, cell, cell);
    }
    return (CACHE[key] = c.toDataURL('image/png'));
  }
  function img(parent, src) {
    const im = new Image(); im.decoding = 'sync'; im.draggable = false;
    window.PENDING.push(new Promise((res) => { im.onload = res; im.onerror = res; }));
    im.src = src; parent.appendChild(im);
    return im;
  }
  // 一块砖：div.tile 里一张纹理图。size 像素见方
  function tile(parent, x, y, size, seed, levels) {
    const e = h('div', 'tile', parent); px(e, x, y, size, size); e.style.zIndex = 5;   // 砖要能飞进显卡的槽里，压在板卡上面
    img(e, texURL(seed, levels, 32, 32, 3));
    e.dataset.name = '数据砖';
    return e;
  }
  // 一组砖排成网格：n 块，每行 cols 块，间距 pitch。返回砖的数组（带各自的 x、y）
  function tiles(parent, n, o) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = o.x + (i % o.cols) * o.pitch, y = o.y + Math.floor(i / o.cols) * o.pitch;
      const e = tile(parent, x, y, o.size, (o.seed || 1) * 100 + i, o.levels);
      e._x = x; e._y = y; out.push(e);
    }
    return out;
  }
  // 一条按体积画的条带：gb 块砖连成一条，每 1 GB 一道细缝（成绩表用）。五个版本用同一片数据（同一个种子、同样的起伏），
  // 只是条带的长短与能取的值的个数不同：各行之间唯一的差别就是精度
  function strip(parent, x, y, gb, unit, hh, seed, levels) {
    const w = Math.round(gb * unit), e = h('div', 'strip', parent); px(e, x, y, w, hh);
    img(e, texURL(seed, levels, Math.max(4, Math.round(gb * 6)), 12, 5, 55 / 16, 0.5));
    const sv = svg('svg', { class: 'abs', width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, e); px(sv, 0, 0);
    for (let k = 1; k < gb; k++) svg('rect', { x: (k * unit - 1).toFixed(1), y: 0, width: 2, height: hh, fill: '#0D0620' }, sv);
    e.dataset.name = '体积条';
    return e;
  }

  // ── 道具：显卡。板卡 + 挡板 + 金手指 + 芯片 + 24 个槽位（8 × 3），一个槽放一块砖 ──
  // 返回 { root, slots: [{x, y}]（相对 parent）, readout（槽位上方的读数元素） }
  function gpu(parent, x, y, o = {}) {
    const S = o.size || 48, P = o.pitch || 56, W = 820, H = 400;
    const root = el(parent, x, y, W, H + 34);
    root.dataset.name = '显卡';
    el(root, 0, 14, 26, H - 28, { background: 'var(--line)', borderRadius: '4px' });
    el(root, 7, 60, 12, 90, { background: 'var(--ink)', borderRadius: '6px' });
    el(root, 7, 250, 12, 90, { background: 'var(--ink)', borderRadius: '6px' });
    const board = el(root, 26, 0, W - 26, H, { background: 'var(--ink2)', border: '3px solid #5B21D6', borderRadius: '18px' });
    el(root, 190, H, 440, 30, { background: 'repeating-linear-gradient(90deg, #8A7BB5 0 12px, transparent 12px 19px)', borderRadius: '0 0 4px 4px' });
    const name = el(board, 40, 30, 400, 50, {}, '显卡', 'hit');
    const cap = el(board, 40, 92, 300, 60, {}, '24 GB', 'mid');
    // 芯片：一块方形，内有细格，表示运算单元
    const chip = el(board, 40, 180, 170, 170, { background: 'var(--line)', borderRadius: '10px' });
    el(chip, 22, 22, 126, 126, { background: 'repeating-linear-gradient(0deg, #5B21D6 0 6px, transparent 6px 14px), repeating-linear-gradient(90deg, #5B21D6 0 6px, transparent 6px 14px)', borderRadius: '6px' });
    const sx = 26 + 260, sy = 128, slots = [];
    for (let i = 0; i < 24; i++) {
      const cx = sx + (i % 8) * P, cy = sy + Math.floor(i / 8) * P;
      el(root, cx, cy, S, S, {}, '', 'slot');
      slots.push({ x: x + cx, y: y + cy });
    }
    const readout = el(board, 260, 30, 450, 60, { textAlign: 'right' }, '', 'mid');
    return { root, slots, readout, name, cap };
  }

  // ── 道具：笔记本电脑（通用造型，不画任何品牌标志）。返回 { root, screen（屏幕内容区，相对 parent 的坐标） } ──
  function laptop(parent, x, y, w = 700) {
    const sh = Math.round(w * 0.62), root = el(parent, x, y, w + 120, sh + 60);
    root.dataset.name = '笔记本电脑';
    const lid = el(root, 60, 0, w, sh, { background: 'var(--line)', borderRadius: '22px 22px 6px 6px' });
    const scr = el(lid, 18, 18, w - 36, sh - 36, { background: 'var(--ink)', borderRadius: '8px', overflow: 'hidden' });
    el(root, 0, sh, w + 120, 26, { background: '#5B21D6', borderRadius: '4px 4px 22px 22px' });
    el(root, 60 + w / 2 - 70, sh, 140, 10, { background: 'var(--line)', borderRadius: '0 0 10px 10px' });
    return { root, scr, sx: x + 60 + 18, sy: y + 18, sw: w - 36, sh: sh - 36 };
  }

  return { D, G, files: D.files, STOPS, ramp, grad, post, xOf, uOf, VMIN, VMAX, bits16, bits4, valueOfCode, el, texURL, img, tile, tiles, strip, gpu, laptop };
})();
