// 量化：本片共用的数据读取、颜色与小工具。只读 window.DATA（由 tools/gen_data.py 从 research/lab/ 生成），不写任何状态；
// 画面是 t 的纯函数，这里的函数也都只由参数决定。
window.QZ = (function () {
  const D = window.DATA, G = D.group;

  // 紫色的深浅就是一个数的大小：从深靛（最小）经紫到粉白（最大）。色标与 docs 里的设计说明一致。
  const STOPS = [[0, [26, 11, 94]], [0.35, [91, 33, 214]], [0.6, [168, 85, 247]], [0.82, [232, 121, 249]], [1, [255, 227, 255]]];
  const hexOf = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

  // u ∈ [0, 1] 对应的颜色（CSS 串）
  const ramp = (u) => {
    u = Math.min(1, Math.max(0, u));
    let i = 1;
    while (i < STOPS.length - 1 && STOPS[i][0] < u) i++;
    const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], k = (u - a) / (b - a || 1);
    return hexOf(ca.map((c, j) => c + (cb[j] - c) * k));
  };

  // 连续的色带：量化前，每个数占 16 位，颜色没有断点
  const grad = () => 'linear-gradient(90deg,' + STOPS.map(([u, c]) => hexOf(c) + ' ' + (u * 100).toFixed(2) + '%').join(',') + ')';

  // n 段离散的色带：量化后只剩 n 种值，每段一种颜色
  const bands = (n) => {
    const parts = [];
    for (let k = 0; k < n; k++) {
      const c = ramp(n > 1 ? k / (n - 1) : 0);
      parts.push(c + ' ' + (k / n * 100).toFixed(3) + '%', c + ' ' + ((k + 1) / n * 100).toFixed(3) + '%');
    }
    return 'linear-gradient(90deg,' + parts.join(',') + ')';
  };

  // 数值 → 横坐标：第 1000 组的 32 个数都落在 [-0.025, 0.025] 之间
  const VMIN = -0.025, VMAX = 0.025;
  const xOf = (v, x0, w) => x0 + (v - VMIN) / (VMAX - VMIN) * w;

  // 16 位：BF16 就是 32 位浮点数的高 16 位（真实文件里的值正好能无损表示，低 16 位为零）
  const bits16 = (v) => ((new Uint32Array(new Float32Array([v]).buffer)[0] + 0x8000) >>> 16).toString(2).padStart(16, '0');
  const bits4 = (c) => c.toString(2).padStart(4, '0');

  // 16 个格子号 c 还原出的值：(c − 8) × 刻度 d（与 llama.cpp 的 Q4_0 一致，FACTS B2）
  const valueOfCode = (c) => (c - 8) * G.d;

  // 一个元素：绝对定位，带样式与文字。parent 为容器，x、y、w、h 为像素
  const el = (parent, x, y, w, hh, styles = {}, html = '', cls = '') => {
    const e = h('div', 'abs ' + cls, parent, html);
    px(e, x, y, w, hh);
    css(e, styles);
    return e;
  };

  // 同一个文件的 5 个版本（data.js 的 files，顺序：原版、8 位、4 位、2 位、1 位）
  const files = D.files;

  return { D, G, files, ramp, grad, bands, xOf, VMIN, VMAX, bits16, bits4, valueOfCode, el };
})();
