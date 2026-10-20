// 「XX 秒速通」第 5 集的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角的路由仪表）、换场。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#0c0d0f', paper: '#f2efe8', red: '#c8231b', yel: '#f3c318', blue: '#1d4d9f', dim: '#8a8782', dimp: '#6b6964' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅：makeCamera(world, 1920, VH)
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在哪种底色上」（'paper' 'ink' 'red' 'blue' 'yel'），缺省是纸色
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.5;                                         // 换场用时：一拍
// 右上角的仪表：OLMoE-1B-7B 第 8 层（编号 7）的 64 个专家，排成 4 行 16 列；每拍换一个 token，点亮路由器实际选中的 8 个。
// 数据来自 research/lab/03_route.py 的实测（演示句 17 个 token，循环）。第几拍对应第几个 token 由 t 直接算出，场景里的大号路由图用同一个函数，两边同步。
const ROUTE = DATA.olmoe.route;
const routeTok = (t) => ((Math.floor((t + 1e-6) / BEAT) % ROUTE.length) + ROUTE.length) % ROUTE.length;

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 换场用的黑色竖条：新场景跟在它后面由左向右刷出（见 after）──
    const xbar = h('div', 'xbar', hud); xbar.dataset.name = 'xbar';
    // ── 字幕带与秒尺：一秒一格，走过的变成红色；每 30 秒一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 24 : mid ? 15 : 8, fill: C.dim }, rs));
    }
    const head = svg('rect', { x: -6, y: 26, width: 12, height: 12, fill: C.yel }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.red : C.dim); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下（片尾场景里登记）──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    // ── 右上：路由仪表。黑底即格线，64 个格子，选中的涂红 ──
    const right = h('div', 'hud-r', hud);
    const g = svg('svg', { width: 300, height: 72, viewBox: '0 0 300 72' }, right); g.dataset.name = 'router-hud';
    svg('rect', { x: 0, y: 0, width: 300, height: 72, fill: C.ink }, g);
    const cw = (300 - 17 * 3) / 16, ch = (72 - 5 * 3) / 4, cells = [];
    for (let e = 0; e < 64; e++) cells.push(svg('rect', { x: 3 + (e % 16) * (cw + 3), y: 3 + Math.floor(e / 16) * (ch + 3), width: cw, height: ch, fill: C.paper }, g));
    let lastK = null;
    F((t) => {
      const k = routeTok(t);
      if (k === lastK) return; lastK = k;
      const on = new Set(ROUTE[k]);
      cells.forEach((c, e) => c.setAttribute('fill', on.has(e) ? C.red : C.paper));
    });
    window.HUD = { left, right, xbar };
    const groundAt = (side, t) => { let gg = 'paper'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) gg = v; return gg; };
    const onDark = (gg) => gg === 'ink' || gg === 'red' || gg === 'blue';
    let gl = null;
    F((t) => { const a = groundAt('L', t); if (a !== gl) { left.style.color = onDark(a) ? C.paper : C.ink; gl = a; } });
  },
  after() {
    // 场景的显隐与换场：一道黑色粗竖线由左向右扫过画面，新场景跟在它后面刷出，一拍扫完。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const xbar = HUD.xbar; let lastX = null;
    F((t) => {
      let bx = null;
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + WIPE) {
          const p = ease.io3(clamp((t - s.start) / WIPE)), x = 1920 * p;
          clip = `inset(0px ${(1920 - x).toFixed(1)}px 0px 0px)`; bx = x - 14;
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
      const v = bx == null ? 'hidden' : bx.toFixed(1);
      if (v !== lastX) { if (bx == null) xbar.style.visibility = 'hidden'; else { xbar.style.visibility = 'visible'; xbar.style.left = v + 'px'; } lastX = v; }
    });
    for (const s of L.scenes.slice(1)) { sfx('whoosh', s.start - 0.15, { g: 0.7 }); sfx('thud', s.start + WIPE, { g: 0.6, p: 0.5 }); }
  },
};
