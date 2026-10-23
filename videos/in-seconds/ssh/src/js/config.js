// 「XX 秒速通」系列的引擎配置。本片视觉是卡带未来主义：黑底显像管、荧光绿、模块化面板。
// 保留定长时间线、语速、字幕带与秒尺、剩余秒数、右上角仪表的位置。
// 动效按 12 帧一步（0.2 秒）。视觉规范见 research/STYLE.md。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#070807', paper: '#c4b8a4', ac: '#74ff9a', dim: '#1e6b3a', dimp: '#6a6358', amber: '#ffb23e', warn: '#d23b2e' };
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
  fonts: [['20px "Sans SC"', '字A'], ['36px "Sans SC"', '字A'],
    ['28px "Pixel"', 'A0'], ['46px "Pixel"', 'A0'], ['72px "Pixel"', 'SSH'],
    ['36px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成荧光绿；每 30 秒一道长刻度 ──
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
      fromTo(left, sec, { scale: 1 }, { scale: 1.2, duration: 0.2, ease: 'steps(1)', transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：一格一格的条形读数，标当前握手阶段 ──
    const scan = h('div', 'scan', hud);
    for (let y = 0; y < 1080; y += 4) { const line = h('div', 'scan-line', scan); line.style.top = y + 'px'; }
    let seed = 20261023;
    const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 70; i++) {
      const dot = h('div', 'noise', hud);
      dot.style.left = Math.floor(rnd() * 1920) + 'px';
      dot.style.top = Math.floor(rnd() * 1080) + 'px';
    }
    const right = h('div', 'hud-r', hud);
    window.HUD = { left, right };
    const STAGE_IDS = ['kex', 'dh', 'hostkey', 'userauth'];
    const STAGE_NAME = {
      zh: ['算法协商', '密钥交换', '主机认证', '用户认证'],
      en: ['Negotiation', 'Key exchange', 'Host auth', 'User auth'],
    };
    const stageAt = STAGE_IDS.map((id) => { const s = L.scenes.find((x) => x.id === id); return s ? s.start : 0; });
    const stageBox = h('div', 'hud-stage', right);
    const stageFill = h('div', 'hud-stage-fill', stageBox);
    const stageMarks = stageAt.map((at) => { const m = h('i', 'hud-mark', stageBox); m.style.left = (at / TOTAL * 100).toFixed(3) + '%'; return m; });
    const stageLabel = h('div', 'hud-stage-label', right);
    let lastStage = -1, lastPct = -1;
    F((t) => {
      const p = Math.max(0, Math.min(1, t / TOTAL)), pct = p * 100;
      if (Math.abs(pct - lastPct) > 0.05) { stageFill.style.width = pct.toFixed(2) + '%'; lastPct = pct; }
      let k = 0;
      for (let i = 0; i < stageAt.length; i++) if (t >= stageAt[i]) k = i + 1;
      if (k !== lastStage) {
        lastStage = k;
        for (let i = 0; i < stageMarks.length; i++) stageMarks[i].classList.toggle('on', i < k);
        stageLabel.textContent = k ? STAGE_NAME[LANG][k - 1] : (LANG === 'zh' ? '等待握手' : 'waiting');
      }
    });
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.ac : C.ink; gl = a; }
      if (b !== gr) { right.style.color = b === 'ink' ? C.ac : C.ink; gr = b; }
    });
  },
  after() {
    // 场景的显隐与换场：本片全片只用一种换场 —— 斜切平面横扫全屏。
    // 一块 45° 的斜边从左缘扫到右缘：斜边上沿在画左外时新的一章还没露头，下沿在画右外时整屏换完。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const SPAN = 1920 + 968;                               // 画幅宽 + 斜边跨越的高度：45° 斜线
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + WIPE) {
          const p = ease.io3(clamp((t - s.start) / WIPE));
          const xTop = (-968 + p * SPAN).toFixed(1);         // 斜边上沿的 x（像素）
          const xBot = (0 + p * SPAN).toFixed(1);            // 斜边下沿的 x（像素）
          clip = `polygon(0px 0px, ${xTop}px 0px, ${xBot}px 100%, 0px 100%)`;
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    // 换场的声音：斜切平面像一枚钉子敲下去，用 thud（撞击）而不是 whoosh（气流）。
    for (const s of L.scenes.slice(1)) sfx('thud', s.start - 0.3, { g: 0.55, p: 0.2 });
  },
};
