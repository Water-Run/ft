// 「首 Token 延迟」的引擎配置：字体、颜色、拍子（100 BPM）、常驻元素（字幕带与秒尺、剩余秒数、右上角的等待读数）、换场。
// 规格见 src/design/scenes.md；视觉系统见 src/css/style.css 开头。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#0b1210', ink2: '#16211d', paper: '#ece8dc', ac: '#ffb000', dim: '#8e9a94', line: '#2b3a34' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅：makeCamera(world, 1920, VH)
// 节拍网格：配乐 100 拍/分，一拍 0.6 秒，一小节 2.4 秒；画面上的重音吸附到八分音符（0.3 秒）上，与配乐同拍
const BEAT = 0.6;
const Q = (t, g = 0.3) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.3) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在琥珀（'ac'）上」，此时字色改墨色
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.6;                                         // 换场用时：一拍

// ── 示例读数的时钟（open 的 2.00 秒是「实时」的）：第一个 Token 在 o2 开始时出现，读数提前 2.0 秒起走 ──
let _clk = null;
const CLK = () => {
  if (_clk) return _clk;
  const tf = T('o2'), ts = tf - 2.0;
  _clk = { ts, tf, scale: T('s1', '聊天'), close: L.scenes.find((s) => s.id === 'close').start };
  return _clk;
};
// 右上角「等待读数」：纯函数。开头 0 → 2.00（实时），之后保持 2.00；尺度一场起是 0.50；结尾回到 2.00
const METER = (t) => {
  const k = CLK();
  if (t < k.ts) return 0;
  if (t < k.tf) return Math.max(0, t - k.ts);
  if (t < k.scale) return 2;
  if (t < k.close) return 0.5;
  return 2;
};

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成琥珀；每 30 秒一道长刻度 ──
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
    // ── 右上：等待读数 = 一块按拍闪的琥珀光标 + 读数（纯函数 METER(t)）──
    const right = h('div', 'hud-r', hud, `<span class="cur"></span><span class="v">0.00</span><span class="u">${tr('秒', 's')}</span>`);
    const cur = right.querySelector('.cur'), val = right.querySelector('.v');
    let lastV = null, lastB = null;
    F((t) => {
      const v = METER(t).toFixed(2); if (v !== lastV) { val.textContent = v; lastV = v; }
      const on = Math.floor(t / BEAT + 1e-6) % 2 === 0; if (on !== lastB) { cur.style.opacity = on ? 1 : 0; lastB = on; }
    });
    window.HUD = { left, right };
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.classList.toggle('onac', a !== 'ink'); gl = a; }
      if (b !== gr) { right.classList.toggle('onac', b !== 'ink'); gr = b; }
    });
  },
  after() {
    // 场景的显隐与换场：新场景由左向右直刷，一拍刷完（片名卡与常驻元素的反色由各场景自己登记 hudGround）
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        const clip = vis && i > 0 && t < s.start + WIPE ? `inset(0px ${(1920 * (1 - ease.io3(clamp((t - s.start) / WIPE)))).toFixed(1)}px 0px 0px)` : 'none';
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
    });
    for (const s of L.scenes.slice(1)) sfx('whoosh', s.start - 0.3, { g: 0.6 });
  },
};
