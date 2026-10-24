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
    // 扫描线与噪点：一张 SVG，一像素实线、固定种子的实心点
    const scan = svg('svg', { class: 'scan', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, hud);
    let dpath = ''; for (let y = 0; y < 1080; y += 4) dpath += `M0 ${y + 0.5}H1920`;
    svg('path', { d: dpath, stroke: C.dim, 'stroke-width': 1, opacity: 0.32 }, scan);
    const rnd = seeded(20261023);
    for (let i = 0; i < 70; i++) svg('rect', { x: Math.floor(rnd() * 1920), y: Math.floor(rnd() * 1080), width: 2, height: 2, fill: C.ac }, scan);
    scan.dataset.name = 'scanlines';
    const right = h('div', 'hud-r', hud);
    window.HUD = { left, right };
    // 右上仪表：铭牌 SSH-2.0（取自版本标识串），四道关一格一格点亮；当前这一关琥珀框，走完变绿
    h('div', 'hud-plate', right, 'SSH-2.0');
    const GATES = [['kex', 'kex'], ['dh', 'dh'], ['hostkey', 'edge'], ['userauth', 'userauth']];
    const GATE_NAME = { zh: ['对上算法', '换出密钥', '认明主机', '证明自己'], en: ['Algorithms', 'Key', 'Host', 'You'] };
    const span = GATES.map(([a, b]) => { const s0 = L.scenes.find((x) => x.id === a), s1 = L.scenes.find((x) => x.id === b); return [s0 ? s0.start : 0, s1 ? s1.end : 0]; });
    const cells = GATES.map((g, i) => { const c = h('div', 'hud-gate', right, String(i + 1).padStart(2, '0')); c.style.left = (150 + i * 80) + 'px'; return c; });
    const now = h('div', 'hud-now', right);
    let lastK = null;
    F((t) => {
      let cur = -1, done = 0;
      span.forEach(([a, b], i) => { if (t >= a && t < b) cur = i; if (t >= b) done = i + 1; });
      const k = cur + ':' + done;
      if (k === lastK) return; lastK = k;
      cells.forEach((c, i) => { c.classList.toggle('done', i < done); c.classList.toggle('cur', i === cur); });
      now.textContent = cur >= 0 ? `${String(cur + 1).padStart(2, '0')} · ${GATE_NAME[LANG][cur]}` : done >= 4 ? (LANG === 'zh' ? '四道关已走完' : 'all four passed') : (LANG === 'zh' ? '等待握手' : 'waiting');
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
    // 换场：显像管换台。雪花闪两帧，新画面从中间一条亮线上下展开（12 帧一步的两格）
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const snowBox = h('div', 'abs', document.getElementById('stage')); px(snowBox, 0, 0, 1920, 968); snowBox.style.zIndex = 40;
    const snows = snowFrames(3).map((cv) => { cv.className = 'snow'; snowBox.appendChild(cv); return freeze(cv); });
    const CUT = 0.3;
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + 0.12);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + CUT) {
          const k = Math.floor(clamp((t - s.start - 0.1) / (CUT - 0.1)) * 4) / 4;   // 四格
          const m = (50 * (1 - k)).toFixed(1);
          clip = `inset(${m}% 0% ${m}% 0%)`;
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
      let sn = -1;
      for (const s of L.scenes.slice(1)) if (t >= s.start - 0.05 && t < s.start + 0.12) sn = Math.floor((t - s.start + 0.05) / 0.05) % 3;
      snows.forEach((im, j) => { const v = j === sn ? '1' : '0'; if (im.style.opacity !== v) im.style.opacity = v; });
    });
    for (const s of L.scenes.slice(1)) sfx('drive', s.start - 0.05, { g: 0.6 });
  },
};
