// 本片的引擎配置：字体、颜色、节拍网格、常驻元素与换场。视觉系统见 css/style.css 开头的说明。
// 常驻元素按系列约定：底部字幕带上沿是全片秒尺（这里是任务栏上的 100 格分段进度条，一秒一格），左上剩余秒数（最后 5 秒逐秒跳动），
// 右上是本集的「仪表」：一个四格 IP 地址框，显示数据包此刻「要去」的地址。
document.documentElement.classList.add(LANG);
window.PALETTE = { teal: '#008080', silver: '#C0C0C0', white: '#FFFFFF', dgray: '#808080', black: '#000000', navy: '#000080' };
const C = window.PALETTE;
const VH = 968;
// 节拍网格：配乐 120 拍/分（tools/music.py），画面重音吸附到 0.25 秒
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;
// 右上角地址框的内容表：场景登记「从某刻起显示某个标签与四段数字」；四段为空数组时清空
const GAUGE = [];
const gauge = (t, label, octs) => { GAUGE.push([t, label, octs]); };
// 换场时的窗口放大外框：场景登记「某刻从哪个矩形放大到哪个矩形」，由常驻层画
const ZOOMS = [];
const zoomFx = (t, from, to, d = 0.3) => { ZOOMS.push({ t, from, to, d }); };

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['400 20px "Pixel"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 任务栏与分格秒尺：一秒一格，走过的变藏青 ──
    const task = h('div', 'task', hud);
    const ruler = h('div', 'ruler sunken', task);
    const segs = [];
    for (let i = 0; i < TOTAL; i++) segs.push(h('i', '', ruler));
    let lastS = -1;
    F((t) => {
      const s = clamp(Math.floor(t + 1e-6) + 1, 0, TOTAL);
      if (s !== lastS) { segs.forEach((e, i) => { e.className = i < s ? 'done' : ''; }); lastS = s; }
    });
    // ── 左上：剩余秒数；最后五秒逐秒跳一下 ──
    const left = h('div', 'hud-l sunken', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.2, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.8, p: -0.6 });
    }
    // ── 右上：四格 IP 地址框 ──
    const right = h('div', 'hud-r raised', hud);
    const lab = h('span', 'lab', right, '');
    const octs = [0, 1, 2, 3].map((i) => { const o = h('span', 'oct sunken', right, ''); if (i < 3) h('span', 'dot', right, '.'); return o; });
    let lastG = null;
    F((t) => {
      let g = null; for (const e of GAUGE) if (t >= e[0]) g = e;
      const key = g ? g[1] + '|' + g[2].join('.') : '';
      if (key !== lastG) { lab.textContent = g ? g[1] : tr('要去', 'To'); octs.forEach((o, i) => { o.textContent = g && g[2][i] != null ? g[2][i] : ''; }); lastG = key; }
    });
    window.HUD = { left, right };
    // ── 窗口放大外框（两道，后一道晚 0.06 秒）──
    const zl = h('div', 'abs', hud); px(zl, 0, 0, 1920, 1080);
    const z1 = h('div', 'zoom', zl), z2 = h('div', 'zoom', zl);
    const put = (el, z, k) => {
      const a = z.from, b = z.to, e = ease.io3(clamp(k));
      px(el, lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e), lerp(a[3], b[3], e));
    };
    F((t) => {
      let on1 = false, on2 = false;
      for (const z of ZOOMS) {
        if (t >= z.t && t < z.t + z.d) { put(z1, z, (t - z.t) / z.d); on1 = true; }
        if (t >= z.t + 0.06 && t < z.t + z.d + 0.06) { put(z2, z, (t - z.t - 0.06) / z.d); on2 = true; }
      }
      z1.style.display = on1 ? '' : 'none'; z2.style.display = on2 ? '' : 'none';
    });
  },
  after() {
    // 全片一张网络图：开场（open）建好的图一直留到片尾名单；之后各场的根节点叠在它上面，只放临时的对话框。
    // 片尾名单在「本场开始 + 0.3 秒」切进来（之前由放大外框从画面中央放大到名单窗口）。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id));
    const out = L.scenes.find((s) => s.id === 'outro');
    const tOut = out ? out.start + 0.3 : 1e9;
    F((t) => {
      L.scenes.forEach((s, i) => {
        const a = s.id === 'outro' ? tOut : (i === 0 ? -1 : s.start), b = s.id === 'outro' ? 1e9 : tOut;
        roots[i].style.display = t >= a - 1e-6 && t < b ? '' : 'none';
      });
    });
  },
};
