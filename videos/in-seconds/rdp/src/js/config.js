// 本片的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角「这一步传了多少字节」的仪表）、换场。
// 视觉系统「磁贴」（Metro）见 css/style.css 开头与 README「设计」。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1b1b1b', fg: '#f2f2f2', dim: '#a8a8a8', rdp: '#1b64c4', rdpl: '#9fd0ff', vid: '#5a5a5a', line: '#3a3a3a',
  fill: '#b23d18', glyph: '#603cba', move: '#00706e', you: '#007a00' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度
// 节拍网格：配乐 112 拍/分（tools/music.py）。画面上的重音吸附到八分音符上
const BEAT = 60 / 112;
const Q = (t, g = BEAT / 2) => Math.round(t / g + 1e-6) * g;
const Qf = (t, g = BEAT / 2) => Math.floor(t / g + 1e-6) * g;
const SLIDE = 0.55;                                       // 换场：新的一屏从右边整屏滑入（开始屏的横向滚动）

// 右上仪表：场景登记「某段时间里，这一步 RDP 与录像各传多少字节」。没有登记的时段仪表收起
const GAUGE = [];
const gauge = (t0, t1, rdp, vid, k) => GAUGE.push({ t0, t1, rdp, vid, k: k || tr('这一步 RDP / 录像', 'This step: RDP / video') });

window.ENGINE = {
  fonts: [['300 20px "Sans SC"', '字A'], ['400 20px "Sans SC"', '字A'], ['600 20px "Sans SC"', '字A'],
    ['200 20px "Inter"', 'Aa0'], ['300 20px "Inter"', 'Aa0'], ['400 20px "Inter"', 'Aa0'], ['600 20px "Inter"', 'Aa0'],
    ['300 20px "Mono"', 'A0'], ['400 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成蓝色；每 30 秒一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 24 : mid ? 15 : 8, fill: C.line }, rs));
    }
    const head = svg('rect', { x: -5, y: 0, width: 10, height: 30, fill: C.rdpl }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.rdp : C.line); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下 ──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.22, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.7, p: -0.6 });
    }
    // ── 右上：这一步 RDP / 录像各传多少字节（数字取自 FACTS G4–G7、L2、L4）──
    const right = h('div', 'hud-r', hud, '<div class="k"></div><div class="v"></div>');
    const rk = right.firstChild, rv = right.lastChild;
    window.HUD = { left, right };
    let lastG = null;
    F((t) => {
      const g = GAUGE.find((x) => t >= x.t0 && t < x.t1);
      // 淡入淡出各 0.4 秒；换到相邻的一步时直接换字
      let a = 0;
      if (g) a = Math.min(1, (t - g.t0) / 0.4, (g.t1 - t) / 0.4);
      const near = g && GAUGE.some((x) => x !== g && (Math.abs(x.t1 - g.t0) < 0.05 || Math.abs(x.t0 - g.t1) < 0.05));
      if (g && near) {
        const prev = GAUGE.find((x) => Math.abs(x.t1 - g.t0) < 0.05), next = GAUGE.find((x) => Math.abs(x.t0 - g.t1) < 0.05);
        a = Math.min(prev ? 1 : (t - g.t0) / 0.4, next ? 1 : (g.t1 - t) / 0.4, 1);
      }
      right.style.opacity = clamp(a, 0, 1).toFixed(3);
      const key = g ? g.k + '|' + g.rdp + '|' + g.vid : '';
      if (key !== lastG) {
        rk.textContent = g ? g.k : '';
        rv.innerHTML = g ? `<b>${esc(g.rdp)}</b> / ${esc(g.vid)}` : '';
        lastG = key;
      }
    });
  },
  after() {
    // 换场：新的一屏从右边整屏滑入，上一屏同时向左让出四分之一屏后被盖住
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), last = roots.map(() => '');
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + SLIDE);
        let tf = 'none';
        if (vis && i > 0 && t < s.start + SLIDE) tf = `translateX(${(1920 * (1 - ease.io3(clamp((t - s.start) / SLIDE)))).toFixed(1)}px)`;
        else if (vis && nx && t >= nx.start) tf = `translateX(${(-480 * ease.io3(clamp((t - nx.start) / SLIDE))).toFixed(1)}px)`;
        const key = (vis ? '1' : '0') + tf;
        if (key !== last[i]) { root.style.display = vis ? '' : 'none'; root.style.transform = tf; root.style.zIndex = String(i); last[i] = key; }
      });
    });
    for (const s of L.scenes.slice(1)) sfx('whoosh', s.start - 0.15, { g: 0.6 });
  },
};
