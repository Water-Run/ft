// 本集（tmux）的引擎配置：字体、颜色、常驻元素与换场。视觉系统「卡带未来主义」见 src/design/STYLE.md。
// 系列的常驻元素保留位置与做法，只换画法：
// - 左上：剩余秒数 → 黑窗里的绿色 VFD 数字，最后 5 秒逐秒跳；
// - 底部：字幕带 → 机架底部的黑铭牌，米白字；上沿的秒尺 → 一条打孔纸带，走过的部分变琥珀；
// - 右上：本集的仪表 → 磁带计数器，三个读数 SES / WIN / PANE（此刻画面上 server 管着几个 session、window、pane）。
// 换场只用三种机械动作：纸带刷过（历史与片尾）、挡板合拢（换一个观察层）、CRT 断电再开机（回到屏幕前）。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#151713', green: '#74FF9A', amber: '#FFB23E', cream: '#D8CFB4', steel: '#8C8F86', red: '#D63A2C', paper: '#E8E1CC', black: '#0B0D0A' };
const C = window.PALETTE;
const VH = 968;
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;
// 12 fps 步进：UI 的状态按 1/12 秒一格更新（60fps 下每 5 帧一格）
const FPS12 = 12;
const q12 = (t) => Math.floor(t * FPS12 + 1e-6) / FPS12;
const SE = (d) => `steps(${Math.max(2, Math.round(d * FPS12))})`;
// 右上角磁带计数器的读数：gauge(t, session, window, pane)。场景里登记，取不晚于 t 的最近一条
const GAUGE = [[0, 1, 1, 1]];
const gauge = (t, s, w, p) => { GAUGE.push([t, s, w, p]); GAUGE.sort((a, b) => a[0] - b[0]); };
// 各场景的换场方式（以「进入」的场景记）
const TRANS = { past: 'tape', model: 'shutter', use: 'crt', impl: 'shutter', edge: 'crt', outro: 'tape' };
const TR_D = { tape: 0.62, shutter: 0.5, crt: 0.5 };

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'],
    ['400 20px "Mono"', 'A0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0'],
    ['400 20px "VT323"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // 换场用的物件放在常驻层最底下：压住场景，但在字幕带与读数之下
    window.TRLAYER = h('div', 'abs', hud); px(TRLAYER, 0, 0, 1920, VH);
    // ── 字幕铭牌与纸带秒尺 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 22, viewBox: '0 0 1920 22' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL);
    svg('rect', { x: 0, y: 0, width: 1920, height: 18, fill: '#3A3C38' }, rs);
    const done = svg('rect', { x: 0, y: 0, width: 0, height: 18, fill: C.amber }, rs);
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0;
      const w = big ? 6 : mid ? 4 : 3, hh = big ? 12 : mid ? 9 : 5;
      svg('rect', { x: X(i) - w / 2, y: big ? 3 : 9 - hh / 2 + 0, width: w, height: hh, fill: C.ink }, rs);
    }
    const head = svg('rect', { x: -2, y: 0, width: 4, height: 22, fill: C.paper }, rs);
    F((t) => {
      const x = X(clamp(q12(t), 0, TOTAL));
      done.setAttribute('width', x.toFixed(1));
      head.setAttribute('x', (x - 2).toFixed(1));
    });
    // ── 左上：剩余秒数（VFD）──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 'SEC')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(num, sec, { scale: 1 }, { keyframes: [{ scale: 1.22, duration: 0.0834, ease: 'none' }, { scale: 1, duration: 0.25, ease: SE(0.25) }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：磁带计数器 ──
    const right = h('div', 'hud-r', hud);
    const drums = ['SES', 'WIN', 'PANE'].map((k) => { const d = h('div', 'dr', right, `<span class="k">${k}</span><span class="v">0</span>`); return d.lastChild; });
    let lastG = null;
    F((t) => {
      let g = GAUGE[0];
      for (const e of GAUGE) if (e[0] <= t + 1e-6) g = e;
      const key = g.join(',');
      if (key === lastG) return; lastG = key;
      drums.forEach((d, i) => { d.textContent = String(g[i + 1]); });
    });
    window.HUD = { left, right };
  },
  after() {
    // 场景的显隐与换场。每个边界 S = 下一场的 start；动作以 S 为中点。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null), lastDisp = roots.map(() => null);
    // 纸带：一条竖着的打孔纸带从左刷到右，新场景跟在它后面
    const strip = h('div', 'abs', TRLAYER); px(strip, 0, 0, 240, VH); css(strip, { background: C.paper, display: 'none' });
    const ss = svg('svg', { width: 240, height: VH, viewBox: `0 0 240 ${VH}` }, strip); ss.style.position = 'absolute';
    for (let y = 14; y < VH; y += 38) { svg('rect', { x: 16, y, width: 14, height: 14, fill: C.ink }, ss); svg('rect', { x: 210, y, width: 14, height: 14, fill: C.ink }, ss); }
    const rr = seeded(23);
    for (let y = 18; y < VH; y += 38) for (let c = 0; c < 6; c++) if (rr() < 0.45) svg('rect', { x: 52 + c * 26, y: y + 2, width: 10, height: 10, fill: C.ink }, ss);
    svg('rect', { x: 0, y: 0, width: 6, height: VH, fill: '#B0A88F' }, ss); svg('rect', { x: 234, y: 0, width: 6, height: VH, fill: '#B0A88F' }, ss);
    strip.dataset.name = 'paper tape wipe';
    // 挡板：上下两块金属板合拢再打开
    const plate = (top) => {
      const p = h('div', 'abs', TRLAYER); px(p, 0, top ? 0 : VH / 2, 1920, VH / 2); css(p, { background: '#3A3C38', display: 'none' });
      const edge = h('div', 'abs', p); px(edge, 0, top ? VH / 2 - 26 : 0, 1920, 26); css(edge, { background: C.ink });
      for (let x = 40; x < 1920; x += 120) { const r = h('div', 'abs', p); px(r, x, top ? VH / 2 - 70 : 44, 60, 10); css(r, { background: '#A8432F' }); }
      for (const x of [60, 1848]) { const sc = h('div', 'screw', p); px(sc, x, top ? 40 : VH / 2 - 52); }
      p.dataset.name = 'shutter'; return p;
    };
    const pTop = plate(true), pBot = plate(false);
    // CRT 开机的亮线
    const beam = h('div', 'abs', TRLAYER); px(beam, 0, VH / 2 - 3, 1920, 6); css(beam, { background: '#E9FFF0', display: 'none' }); beam.dataset.name = 'beam';
    const B = L.scenes.slice(1).map((s) => ({ S: s.start, type: TRANS[s.id] || 'shutter' }));
    for (const b of B) {
      if (b.type === 'tape') sfx('drive', b.S - 0.1, { g: 0.8 });
      if (b.type === 'shutter') { sfx('thud', b.S - 0.02, { g: 0.85 }); sfx('tick', b.S + 0.2, { g: 0.5 }); }
      if (b.type === 'crt') { sfx('blip', b.S - 0.2, { g: 0.6 }); sfx('beep', b.S + 0.12, { g: 0.55 }); }
    }
    let lastT = null;
    F((t0) => {
      const t = q12(t0);
      // 当前处在哪个边界的动作里
      let act = null;
      for (const b of B) { const d = TR_D[b.type], a = b.S - (b.type === 'tape' ? 0.1 : d / 2); if (t >= a - 1e-6 && t < a + d) { act = { ...b, k: (t - a) / d }; break; } }
      const key = act ? act.type + act.S + ':' + act.k.toFixed(3) : 'none';
      // 场景显隐
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1];
        let vis = t0 >= s.start - 1e-6 && (!nx || t0 < nx.start);
        let clip = 'none';
        if (act && act.type === 'tape') {
          const xl = -240 + act.k * (1920 + 480);            // 纸带左缘
          if (nx && Math.abs(nx.start - act.S) < 1e-6) { vis = t0 >= s.start - 1e-6; }   // 旧场景整段可见，被新场景从左边盖住
          if (Math.abs(s.start - act.S) < 1e-6) { vis = true; clip = `inset(0px ${Math.max(0, 1920 - xl).toFixed(0)}px 0px 0px)`; }
        }
        if (act && act.type === 'crt') {
          const half = act.k < 0.5;
          if (Math.abs(s.start - act.S) < 1e-6) { vis = !half; if (!half) { const k = clamp((act.k - 0.56) / 0.44); clip = `inset(${((1 - k) * VH / 2).toFixed(0)}px 0px ${((1 - k) * VH / 2).toFixed(0)}px 0px)`; } }
          else if (nx && Math.abs(nx.start - act.S) < 1e-6) { vis = half; if (half) { const k = clamp(act.k / 0.44); clip = `inset(${(k * VH / 2).toFixed(0)}px 0px ${(k * VH / 2).toFixed(0)}px 0px)`; } }
        }
        const disp = vis ? '' : 'none';
        if (disp !== lastDisp[i]) { roots[i].style.display = disp; lastDisp[i] = disp; }
        if (clip !== lastClip[i]) { roots[i].style.clipPath = clip; lastClip[i] = clip; }
      });
      if (key === lastT) return; lastT = key;
      strip.style.display = act && act.type === 'tape' ? '' : 'none';
      if (act && act.type === 'tape') strip.style.left = (-240 + act.k * (1920 + 480)).toFixed(0) + 'px';
      const sh = act && act.type === 'shutter';
      pTop.style.display = pBot.style.display = sh ? '' : 'none';
      if (sh) { const c = act.k < 0.5 ? clamp(act.k / 0.42) : clamp((1 - act.k) / 0.42); pTop.style.top = ((c - 1) * VH / 2).toFixed(0) + 'px'; pBot.style.top = (VH / 2 + (1 - c) * VH / 2).toFixed(0) + 'px'; }
      const cr = act && act.type === 'crt';
      beam.style.display = cr && act.k > 0.3 && act.k < 0.75 ? '' : 'none';
      if (cr) { const w = act.k < 0.5 ? 1920 * (1 - clamp((act.k - 0.3) / 0.2)) : 1920 * clamp((act.k - 0.5) / 0.15); css(beam, { left: ((1920 - w) / 2).toFixed(0) + 'px', width: Math.max(8, w).toFixed(0) + 'px' }); }
    });
  },
};
