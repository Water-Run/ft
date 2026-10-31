// 「XX 秒速通」系列的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角本集的仪表）、换场。
// 本集的仪表：这一次请求发出了多少字节（实验记录的 request_bytes，第 1–5 次 1243 → 3724）。发出的时刻由主场登记进 window.SENDS。
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

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成朱红；每 30 秒一道长刻度 ──
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
    // ── 右上：这一次请求发出的字节数；每到「模型」一站（发出请求）跳到新的值，条按最大值 3724 的比例 ──
    const right = h('div', 'hud-r', hud, `<div class="k">${tr('这次发出 · 字节', 'Sent · bytes')}</div><div class="v mono">—</div><div class="bar"><i></i></div>`);
    const rv = right.querySelector('.v'), rb = right.querySelector('.bar i');
    window.SENDS = window.SENDS || [];
    const MAXB = Math.max(...window.DATA.rounds.map((r) => r.bytes));
    let lastR = null;
    F((t) => {
      let b = null, b0 = 0, t0 = 0;
      for (const [ts, v] of window.SENDS) if (t >= ts) { b0 = b == null ? 0 : b; b = v; t0 = ts; }
      const k = b == null ? 0 : ease.out3(clamp((t - t0) / 0.6)), shown = b == null ? null : Math.round(lerp(b0, b, k));
      const key = shown + ':' + k.toFixed(3);
      if (key === lastR) return; lastR = key;
      rv.textContent = shown == null ? '—' : String(shown);
      rb.style.width = (shown == null ? 0 : shown / MAXB * 360).toFixed(1) + 'px';
    });
    window.HUD = { left, right };
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.paper : C.ink; gl = a; }
      if (b !== gr) { right.style.color = b === 'ink' ? C.paper : C.ink; gr = b; }
    });
  },
  after() {
    // 场景的显隐与换场：新场景由左向右直刷，一拍刷完。ask 与 loop 是同一个环上走完的五圈，画面都建在 ask 里，中间不换场。
    const SEG = L.scenes.filter((s) => s.id !== 'loop');
    document.getElementById('sc-loop').style.display = 'none';
    const roots = SEG.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    F((t) => {
      SEG.forEach((s, i) => {
        const nx = SEG[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        const clip = vis && i > 0 && t < s.start + WIPE ? `inset(0px ${(1920 * (1 - ease.io3(clamp((t - s.start) / WIPE)))).toFixed(1)}px 0px 0px)` : 'none';
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    for (const s of SEG.slice(1)) sfx('whoosh', s.start - 0.3, { g: 0.7 });
  },
};
