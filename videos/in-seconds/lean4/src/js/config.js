// 本片的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角「逐个去试」的读数）、换场。
// 系列的约定见 ../../README.md；本集的仪表是「n² = 前 n 个奇数的和」，每秒把 n 加一，加上的那一圈是一个 L 形；
// 换场取同一个动作：新场景从右、下两边像一圈 L 形那样加上来，一拍盖满全屏。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#0c0d0f', paper: '#f2efe8', ac: '#ff4a1c', dim: '#8a8782', dimp: '#6b6964' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅：makeCamera(world, 1920, VH)
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在纸色（'paper'）或朱红（'ac'）上」
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.5;                                         // 换场用时：一拍
const SUMS = DATA.sums;                                   // 前 n 个奇数的和，n = 0 … 200：由 Lean 算出（research/lab），不在这里现算
const nAt = (t) => clamp(Math.floor(t + 1e-6) + 1, 1, SUMS.length - 1);     // 第 t 秒试到的 n：第 0 秒是 1，最后一秒是 200
const gnomonEase = (p) => ease.io3(clamp(p));

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成朱红；各场景的起点是一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [], starts = new Set(L.scenes.map((s) => Math.round(s.start)).concat([TOTAL]));
    for (let i = 0; i <= TOTAL; i++) {
      const big = starts.has(i), mid = i % 10 === 0, w = big ? 4 : 2;
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
    // ── 右上：逐个去试。一个小方块，每秒在右、下两边加一圈 L 形；旁边是「n² = 和」，n 每秒加一 ──
    const right = h('div', 'hud-r', hud);
    const ic = svg('svg', { class: 'abs', width: 64, height: 64, viewBox: '0 0 64 64' }, right); px(ic, 0, 4); ic.dataset.name = 'gnomon';
    const core = svg('rect', { x: 0, y: 0, width: 44, height: 44, fill: C.paper }, ic);
    const barV = svg('rect', { x: 50, y: 0, width: 12, height: 0, fill: C.ac }, ic), barH = svg('rect', { x: 50, y: 50, width: 0, height: 12, fill: C.ac }, ic);
    const read = h('div', 'read', right), rows = [h('span', '', read), h('span', '', read)];
    const fmt = (n) => `${n}<sup>2</sup> = ${SUMS[n]}`;
    let lastKey = null;
    F((t) => {
      const n = nAt(t), f = t - Math.floor(t + 1e-6), p = clamp(f / 0.3);
      // L 形：先自上而下画右边一条，再自右向左画下边一条；0.3 秒画完
      const a = ease.out3(clamp(p / 0.6)), b = ease.out3(clamp((p - 0.6) / 0.4));
      barV.setAttribute('height', (62 * a).toFixed(2));
      barH.setAttribute('x', (50 - 50 * b).toFixed(2)); barH.setAttribute('width', (50 * b).toFixed(2));
      // 读数：新的一行自下而上顶掉旧的一行
      const r = n > 1 ? ease.out3(clamp(f / 0.25)) : 1, key = n + ':' + (r >= 1 ? 1 : 0);
      if (key !== lastKey) {
        if (r >= 1) { rows[0].innerHTML = fmt(n); rows[1].innerHTML = ''; } else { rows[0].innerHTML = fmt(n - 1); rows[1].innerHTML = fmt(n); }
        lastKey = key;
      }
      rows[0].style.transform = r >= 1 ? '' : `translateY(${(-110 * r).toFixed(2)}%)`;
      rows[1].style.transform = r >= 1 ? '' : `translateY(${(110 * (1 - r)).toFixed(2)}%)`;
    });
    window.HUD = { left, right };
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.paper : C.ink; gl = a; }
      if (b !== gr) { const fg = b === 'ink' ? C.paper : C.ink, ac = b === 'ac' ? C.ink : C.ac; right.style.color = fg; core.setAttribute('fill', fg); barV.setAttribute('fill', ac); barH.setAttribute('fill', ac); gr = b; }
    });
    // ── 换场的 L 形：两条朱红的边，随新场景一起推进 ──
    const sw = svg('svg', { class: 'ov', viewBox: '0 0 1920 1080' }, hud); sw.dataset.name = 'gnomon-sweep';
    const edgeV = svg('rect', { y: 0, width: 14, fill: C.ac }, sw), edgeH = svg('rect', { x: 0, height: 14, fill: C.ac }, sw);
    const cuts = L.scenes.slice(1).filter((s) => s.id !== 'outro').map((s) => s.start);
    F((t) => {
      const c = cuts.find((x) => t >= x && t < x + WIPE), on = c != null;
      sw.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      const p = gnomonEase((t - c) / WIPE), x1 = 1920 * (1 - p), y1 = VH * (1 - p);
      edgeV.setAttribute('x', (x1 - 14).toFixed(1)); edgeV.setAttribute('height', Math.max(0, y1).toFixed(1));
      edgeH.setAttribute('y', (y1 - 14).toFixed(1)); edgeH.setAttribute('width', Math.max(0, x1).toFixed(1));
    });
  },
  after() {
    // 场景的显隐与换场：新场景是一圈 L 形（右边一条、下边一条），内角沿对角线从右下走到左上，一拍盖满。
    // 片尾名单不属于正片的分段，由左向右直刷。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + WIPE) {
          const p = gnomonEase((t - s.start) / WIPE);
          if (s.id === 'outro') clip = `inset(0px ${(1920 * (1 - p)).toFixed(1)}px 0px 0px)`;
          else { const x1 = (1920 * (1 - p)).toFixed(1), y1 = (VH * (1 - p)).toFixed(1); clip = `polygon(${x1}px 0px, 1920px 0px, 1920px 1080px, 0px 1080px, 0px ${y1}px, ${x1}px ${y1}px)`; }
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    for (const s of L.scenes.slice(1)) { sfx('whoosh', s.start - 0.3, { g: 0.7 }); if (s.id !== 'outro') sfx('thud', s.start + 0.25, { g: 0.8 }); }
  },
};
