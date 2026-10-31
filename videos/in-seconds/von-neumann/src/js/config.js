// 引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、左上剩余秒数、右上「正在读第几格」）、换场。
// 视觉系统「技术手册」见 css/style.css 开头。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1c2633', paper: '#efe7d4', red: '#b3311f', blue: '#234e86', ochre: '#85570c', soft: '#57534a', dim: '#9c9585' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅
// 节拍网格：配乐 104 拍/分（tools/music.py）。画面上的重音吸附到十六分音符上
const BEAT = 60 / 104;
const Q = (t, g = BEAT / 2) => Math.round(t / g + 1e-6) * g;
const Qf = (t, g = BEAT / 2) => Math.floor(t / g + 1e-6) * g;

// 正在读第几格：场景登记「从某时刻起显示某值」；null 显示「—」
const PCK = [];
const pcAt = (t, v) => { PCK.push([t, v]); };

window.ENGINE = {
  fonts: [['500 20px "Serif SC"', '字A'], ['600 20px "Serif SC"', '字A'], ['700 20px "Serif SC"', '字A'], ['900 20px "Serif SC"', '字A'],
    ['500 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'],
    ['500 20px "Mono"', 'A0'], ['600 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成红铅笔色；每 32 秒（每一场）一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    const long = new Set(L.scenes.map((s) => Math.round(s.start)));
    for (let i = 0; i <= TOTAL; i++) {
      const big = long.has(i) || i === TOTAL, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 24 : mid ? 15 : 8, fill: C.dim }, rs));
    }
    const head = svg('path', { d: 'M-7,34 L0,24 L7,34 Z', fill: '#e2694f' }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? '#e2694f' : C.dim); lastS = s; }
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
    // ── 右上：控制器正在读第几格（程序计数器）。指针出现时亮起，跟着指针走 ──
    const right = h('div', 'hud-r', hud, `<div class="k">${tr('正在读', 'READING')}</div><div class="v">—</div>`);
    right.dataset.name = '正在读第几格';
    const val = right.lastChild;
    // 指针在场时才显示；收起后淡出，再出现时淡入。透明度由 t 算出（找最近一次切换的时刻），不存历史
    let lastV = null, lastO = null;
    F((t) => {
      let v = null, tOn = -1e9, tOff = -1e9, prev = null;
      for (const [a, b] of PCK) { if (t < a) break; if ((b == null) !== (prev == null)) { if (b == null) tOff = a; else tOn = a; } prev = b; v = b; }
      const o = v == null ? clamp(1 - (t - tOff) / 0.25) : clamp((t - tOn) / 0.3);
      const s = v == null ? lastV || '' : tr(`第 ${String(v).padStart(2, '0')} 格`, `CELL ${String(v).padStart(2, '0')}`);
      if (s !== lastV) { val.textContent = s; lastV = s; }
      const os = o.toFixed(2); if (os !== lastO) { right.style.opacity = os; lastO = os; }
    });
    window.HUD = { left, right };
  },
  after() {
    PCK.sort((a, b) => a[0] - b[0]);
    // 正片四场共用同一张方框图，场与场之间直接接上（上一场的末态就是下一场的初态）；片尾像翻过一页，从右向左刷入
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const W = 0.6;
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const nxWipe = nx && nx.id === 'credits' ? W : 0;
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + nxWipe);
        root.style.display = vis ? '' : 'none';
        const clip = vis && s.id === 'credits' && t < s.start + W ? `inset(0px 0px 0px ${(1920 * (1 - ease.io3(clamp((t - s.start) / W)))).toFixed(1)}px)` : 'none';
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    const cr = L.scenes.find((s) => s.id === 'credits');
    if (cr) sfx('whoosh', cr.start - 0.1, { g: 0.6 });
  },
};
