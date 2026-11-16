// 「XX 秒速通」系列的引擎配置，按本集（GitHub 协作）的视觉系统改写：Primer 浅色、字幕带与秒尺、剩余秒数、右上角的「改动状态」仪表、换场。
document.documentElement.classList.add(LANG);
// 画线与箭头可用的颜色名（Primer 浅色令牌，research/MATERIALS.md）
window.PALETTE = { fg: '#1f2328', muted: '#59636e', accent: '#0969da', success: '#1a7f37', done: '#8250df', danger: '#d1242f', attention: '#9a6700', bd: '#d1d9e0', white: '#ffffff' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度
// 节拍网格：配乐 80 拍/分（tools/music.py），一拍 0.75 秒。画面上的重音吸附到 0.25 秒的网格上，与配乐的十六分音符同拍
const BEAT = 0.75;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;
const XF = 0.45;                                          // 换场：下一场整屏淡入用时（两场共用的对象摆在同一位置，淡变时看不出换场）

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['600 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['600 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成绿色（GitHub 的「成功」色）；每 30 秒一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 32, viewBox: '0 0 1920 32' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 22 : mid ? 14 : 7, fill: C.bd }, rs));
    }
    const head = svg('path', { d: 'M-8,31 L0,20 L8,31 Z', fill: C.success }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.success : C.bd); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下 ──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.22, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：本集的仪表。场景用 hudState(t, html) 登记「这一刻起仪表换成什么」，前一个淡出、后一个从右边滑进来 ──
    const right = h('div', 'hud-r', hud);
    window.HUD = { left, right };
  },
  after() {
    // 仪表：按时刻排好，逐个淡变
    const states = (window.HUDS || []).slice().sort((a, b) => a[0] - b[0]);
    states.forEach(([t, html], i) => {
      const e = h('div', '', HUD.right, html);
      const t0 = i === 0 ? t : t;
      fromTo(e, t0, { autoAlpha: 0, x: i === 0 ? 0 : 30 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' });
      const nx = states[i + 1];
      if (nx) fromTo(e, nx[0] - 0.22, { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: -20, duration: 0.2, ease: 'power2.in', immediateRender: false });
      if (i > 0) sfx('pop', t0, { g: 0.55, p: 0.7 });
    });
    // 场景的显隐：下一场在它的起点前后整屏淡入，盖住上一场；淡完之后上一场才隐去
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id));
    L.scenes.forEach((s, i) => {
      if (i > 0) fromTo(roots[i], s.start - 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: XF, ease: 'power1.inOut' });
    });
    const last = roots.map(() => null);
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1];
        const vis = (i === 0 || t >= s.start - 0.12) && (!nx || t < nx.start - 0.1 + XF + 0.05);
        if (vis !== last[i]) { roots[i].style.display = vis ? '' : 'none'; last[i] = vis; }
      });
    });
  },
};
// 仪表的状态：[时刻, html]。在场景构建时登记，after() 统一编排
window.HUDS = [];
const hudState = (t, html) => { window.HUDS.push([t, html]); };
