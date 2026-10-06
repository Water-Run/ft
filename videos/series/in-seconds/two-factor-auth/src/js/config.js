// 本片的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、角上的验证码与表盘）、换场。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#0c0d0f', paper: '#f2efe8', ac: '#ff4a1c', dim: '#8a8782', dimp: '#6b6964' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅
const PERIOD = DATA.period;                               // TOTP 的时间步：30 秒。每个场景占一个时间步
const CODES = DATA.windows.map((w) => w.code);
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在纸色（或朱红）上」
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const SWEEP = 0.5;                                        // 换码时指针扫过全屏的时长：一拍
const PIVOT = { x: 1832, y: 76 };                         // 角上表盘的圆心，也是扫屏的轴心

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：全片 120 秒，一秒一格，走过的变成朱红 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % PERIOD === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 24 : mid ? 15 : 8, fill: C.dim }, rs));
    }
    const head = svg('path', { d: 'M-7,34 L0,24 L7,34 Z', fill: C.ac }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.ac : C.dim); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数 ──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    // ── 右上：此刻的验证码与 30 秒表盘 ──
    const right = h('div', 'hud-r', hud);
    const code = makeCode(right, { size: 44, x: 0, y: 14 });
    const dial = makeDial(right, { x: PIVOT.x - 1560, y: PIVOT.y - 40, r: 30, sw: 3, color: C.paper });
    window.HUD = { left, right, code, dial };
    // 字色跟着底色走
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.paper : C.ink; gl = a; }
      if (b !== gr) { right.style.color = b === 'ink' ? C.paper : C.ink; dial.setColor(b === 'ink' ? C.paper : C.ink, b === 'ac' ? C.ink : C.ac); gr = b; }
    });
    // ── 扫屏的指针：换码的那一拍，表盘的指针放大到全屏扫一圈 ──
    const sw = svg('svg', { class: 'ov', viewBox: '0 0 1920 1080' }, hud);
    const hand = svg('line', { x1: PIVOT.x, y1: PIVOT.y, x2: PIVOT.x, y2: PIVOT.y - 2600, stroke: C.ac, 'stroke-width': 12 }, sw);
    hand.dataset.name = 'sweep';
    F((t) => {
      const k = Math.floor((t + 1e-6) / PERIOD), p = (t - k * PERIOD) / SWEEP;
      const on = k >= 1 && k * PERIOD < TOTAL - 1 && p >= 0 && p < 1;
      hand.style.visibility = on ? 'visible' : 'hidden';
      if (on) hand.setAttribute('transform', `rotate(${(sweepEase(p) * 360).toFixed(2)} ${PIVOT.x} ${PIVOT.y})`);
    });
  },
  after() {
    // 场景的显隐与转场。每逢 30 秒换码：新场景从表盘圆心出发，随指针顺时针扫出一个扇形，一拍扫完。
    // 片尾名单不在换码时刻开始，由左向右直刷。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id));
    const sector = (p) => {
      const a1 = sweepEase(p) * 360, pts = [`${PIVOT.x}px ${PIVOT.y}px`];
      for (let a = 0; ; a += 12) { const b = Math.min(a, a1) * Math.PI / 180; pts.push(`${(PIVOT.x + 2700 * Math.sin(b)).toFixed(1)}px ${(PIVOT.y - 2700 * Math.cos(b)).toFixed(1)}px`); if (a >= a1) break; }
      return `polygon(${pts.join(',')})`;
    };
    const lastClip = roots.map(() => null);
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + SWEEP);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + SWEEP) {
          const p = clamp((t - s.start) / SWEEP);
          clip = s.id === 'outro' ? `inset(0px ${(1920 * (1 - ease.io3(p))).toFixed(1)}px 0px 0px)` : sector(p);
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    for (const s of L.scenes.slice(1)) { sfx('whoosh', s.start - 0.3, { g: 0.7 }); if (s.id !== 'outro') sfx('thud', s.start, { g: 0.8 }); }
  },
};
const sweepEase = (p) => ease.io3(clamp(p));
