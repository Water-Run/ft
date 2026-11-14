// 「XX 秒速通」系列的引擎配置，本片：字体、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角的仪表）、换场。
// 视觉母题是「色阶」：紫色的深浅就是一个数的大小（见 quant.js）。全片分四个连续的画面（引子、历史、机制、成绩），
// 机制画面跨 what/how/cost 三场、成绩画面跨 test/close 两场，场与场之间对象不换、不刷屏（经验规则 F29）。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调
window.PALETTE = { ink: '#0D0620', paper: '#FFFFFF', ac: '#A855F7', dim: '#CDBDFF', dimp: '#8A7BB5' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在紫色（'ac'）上」
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.5;                                         // 换场用时：一拍

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['300 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成紫色；每 30 秒一道长刻度。刻度收在带顶 32px 内，字幕在它下方，互不压 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 32, viewBox: '0 0 1920 32' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 20 : mid ? 12 : 6, fill: C.dim }, rs));
    }
    const head = svg('path', { d: 'M-7,28 L0,18 L7,28 Z', fill: C.ac }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.ac : C.dim); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下（只动 scale，不动透明度，倒跳不闪）──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.28, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：仪表。读数只给「已经讲到的」事实，不提前剧透；语义统一为「当前焦点的量 / 它是什么」──
    const right = h('div', 'hud-r', hud);
    window.HUD = { left, right };
    const groundAt = (side, t) => { let g = 'ink'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) g = v; return g; };
    let gl = null, gr = null, lastM = null;
    // 仪表只走一条线：每个数占几位（讲到「位」之前先显示本片的例子）。不重复主画面上已经大字写着的数；片尾名单时收起
    const SCHEDULE = [
      [0, 'Qwen3.8 27B', '本片的例子'],
      [T('a3', '十六位'), '16 位', '每个数占的 · 原版'],
      [T('b4'), '4 位', '每个数占的 · 量化后'],
      [T('t1'), '16 → 1 位', '五个版本'],
      [T('z3'), '4 位', '每个数占的 · 17 GB'],
      [L.scenes.find((x) => x.id === 'outro').start, '', ''],
    ];
    const meterAt = (t) => { let m = SCHEDULE[0]; for (const row of SCHEDULE) if (t >= row[0] - 1e-6) m = row; return m; };
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = a === 'ink' ? C.paper : C.ink; gl = a; }
      if (b !== gr) { right.style.color = b === 'ink' ? C.paper : C.ink; gr = b; }
      const m = meterAt(t), key = m[1] + '|' + m[2];
      if (key !== lastM) { right.innerHTML = m[1] ? `<span class="n">${m[1]}</span><span class="m">${m[2]}</span>` : ''; lastM = key; }
    });
  },
  after() {
    // 四个连续的画面：画面的根节点是它第一场的根，跨到后面几场仍然显示；后面几场的根是空的。
    // 画面之间硬切：上一个画面在切之前已经把自己的东西收走（各场景文件里写），下一个画面从切的那一刻起自己入场。
    const GROUPS = [['open'], ['hist'], ['what', 'how', 'cost'], ['test', 'close'], ['outro']];
    const byId = Object.fromEntries(L.scenes.map((s) => [s.id, s]));
    const spans = GROUPS.map((g, i) => ({ root: document.getElementById('sc-' + g[0]), a: byId[g[0]].start, b: i + 1 < GROUPS.length ? byId[GROUPS[i + 1][0]].start : Infinity }));
    for (const s of L.scenes) if (!GROUPS.some((g) => g[0] === s.id)) document.getElementById('sc-' + s.id).style.display = 'none';
    const last = spans.map(() => null);
    F((t) => spans.forEach((sp, i) => { const v = t >= sp.a - 1e-6 && t < sp.b - 1e-6; if (v !== last[i]) { sp.root.style.display = v ? '' : 'none'; last[i] = v; } }));
  },
};
