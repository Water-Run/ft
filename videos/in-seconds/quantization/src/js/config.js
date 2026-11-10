// 「XX 秒速通」系列的引擎配置，本片：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角的仪表）、换场。
// 视觉母题是「色带」：紫色的深浅就是一个数的大小（见 quant.js）。换场时一条色带扫过画面，新场景跟在它后面露出来。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调
window.PALETTE = { ink: '#0D0620', paper: '#FFFFFF', ac: '#A855F7', dim: '#CDBDFF', dimp: '#8A7BB5' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在紫色（'ac'）上」
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.5;                                         // 换场用时：一拍

// 右上角的仪表：每一场一个读数（文件多大 / 每个数占几位），按场景的起点切换
const METER = {
  open: ['17 GB', 'Qwen3.8 27B'],
  what: ['55 GB', '每个数 16 位'],
  how: ['4 位', '每个数 16 → 4'],
  cost: ['17 GB', '每个数 4 位'],
  hist: ['2023', 'llama.cpp 首个版本'],
  test: ['6.2 GB', '每个数 1 位'],
  close: ['17 GB', '24 GB 的显卡'],
  outro: ['17 GB', '24 GB 的显卡'],
};

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['300 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成紫色；每 30 秒一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 24 : mid ? 15 : 8, fill: C.dim }, rs));
    }
    const head = svg('path', { d: 'M-7,34 L0,24 L7,34 Z', fill: C.ac }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.ac : C.dim); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下 ──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.28, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：仪表（宽 300，右缘离画面 60px）──
    const right = h('div', 'hud-r', hud);
    window.HUD = { left, right };
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null, lastM = null;
    const meterAt = (t) => { let id = L.scenes[0].id; for (const s of L.scenes) if (t >= s.start - 1e-6) id = s.id; return METER[id] || METER.open; };
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.paper : C.ink; gl = a; }
      if (b !== gr) { right.style.color = b === 'ink' ? C.paper : C.ink; gr = b; }
      const m = meterAt(t), key = m.join('|');
      if (key !== lastM) { right.innerHTML = `<span class="n">${m[0]}</span><span class="m">${m[1]}</span>`; lastM = key; }
    });
  },
  after() {
    // 场景的显隐与换场：新场景从左向右露出来，前面一条色带扫过（母题：色带）
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const hud = document.getElementById('hud');
    const sweep = h('div', 'sweep', hud);
    css(sweep, { position: 'absolute', top: '0px', width: '64px', height: VH + 'px', display: 'none', background: QZ.grad() });
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        const k = vis && i > 0 && t < s.start + WIPE ? ease.io3(clamp((t - s.start) / WIPE)) : 1;
        const clip = vis && i > 0 && t < s.start + WIPE ? `inset(0px ${(1920 * (1 - k)).toFixed(1)}px 0px 0px)` : 'none';
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
      const sw = L.scenes.slice(1).find((s) => t >= s.start - 1e-6 && t < s.start + WIPE);
      if (sw) { sweep.style.display = 'block'; sweep.style.left = (1920 * ease.io3(clamp((t - sw.start) / WIPE)) - 32).toFixed(1) + 'px'; }
      else sweep.style.display = 'none';
    });
    for (const s of L.scenes.slice(1)) sfx('whoosh', s.start - 0.3, { g: 0.7 });
  },
};
