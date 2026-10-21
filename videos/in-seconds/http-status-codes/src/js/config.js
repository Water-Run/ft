// 本集的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、左上剩余秒数、右上「应答表」）、换场。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#14120e', case: '#e4dac4', case2: '#cbbfa3', amber: '#ffb52e', red: '#ef4b28', dima: '#a8874f', mute: '#5f584b' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅：makeCamera(world, 1920, VH)
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 右上的应答表：显示「最近一次回来的状态码」与它首位数字对应的类别灯。场景在码出现的那一刻登记 meter(t, '404')，'' 表示清空
const METER = [];
const meter = (t, code) => { METER.push([t, code]); };
// 换场：push = 新场景从右侧推入、旧场景被推出（中缝是一道三色线缆）；cut = 两场的首尾画面相同，直接切
const SWAP = { what: 'push', history: 'push', common: 'push', who: 'cut', close: 'cut', outro: 'push' };
const PUSH = 0.5;

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['600 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0'], ['400 20px "Pixel"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带与秒尺：一秒一格，走过的变成琥珀；每 10 秒一道长刻度 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const mid = i % 10 === 0, w = mid ? 4 : 2;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: mid ? 18 : 8, fill: C.dima }, rs));
    }
    const head = svg('path', { d: 'M-7,30 L0,20 L7,30 Z', fill: C.amber }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { for (let i = 0; i <= TOTAL; i++) ticks[i].setAttribute('fill', i <= s ? C.amber : C.dima); lastS = s; }
      head.setAttribute('transform', `translate(${X(clamp(t, 0, TOTAL)).toFixed(2)},0)`);
    });
    // ── 左上：剩余秒数，像素字；最后五秒逐秒跳一下 ──
    const left = h('div', 'hud-l', hud, `<span class="n"></span><span class="u">${tr('秒', 's')}</span>`), num = left.firstChild;
    let lastN = null;
    F((t) => { const v = String(Math.max(0, Math.ceil(TOTAL - t - 1e-6))).padStart(3, '0'); if (v !== lastN) { num.textContent = v; lastN = v; } });
    for (let sec = TOTAL - 5; sec < TOTAL; sec++) {
      fromTo(left, sec, { scale: 1 }, { keyframes: [{ scale: 1.28, duration: 0.1, ease: 'power2.out' }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }], transformOrigin: '0% 50%', immediateRender: false });
      sfx('tick', sec, { g: 0.7, p: -0.6 });
    }
    // ── 右上：应答表。像素字的状态码 + 五盏类别灯（1–5）──
    const right = h('div', 'hud-r', hud);
    const m = h('div', 'meter', right);
    const code = h('div', 'code', m, '---');
    const cls = h('div', 'cls', m, '<i></i><i></i><i></i><i></i><i></i>');
    h('div', 'cn', m, '<b>1</b><b>2</b><b>3</b><b>4</b><b>5</b>');
    m.dataset.name = tr('应答表', 'response meter');
    window.HUD = { left, right };
    let lastM = null;
    F((t) => {
      let cur = '';
      for (const [a, c] of METER) if (t >= a) cur = c;           // METER 在 after() 里排好序
      if (cur === lastM) return; lastM = cur;
      code.textContent = cur || '---';
      const d = cur ? +cur[0] : 0;
      code.className = 'code' + (d >= 4 ? ' e' : '');
      [...cls.children].forEach((e, i) => { e.className = i + 1 === d ? (d >= 4 ? 'eon' : 'on') : ''; });
    });
  },
  after() {
    METER.sort((a, b) => a[0] - b[0]);
    for (const [t, c] of METER) if (c) {
      const tt = t, m = HUD.right.firstChild;
      fromTo(m, tt, { y: -8 }, { y: 0, duration: 0.3, ease: 'back.out(3)', immediateRender: false });
    }
    // 场景的显隐与换场。push：旧场景在 [start-PUSH/2, start+PUSH/2] 内被推出画面，新场景跟着推入，中缝一道竖着的三色线缆
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastX = roots.map(() => null), lastD = roots.map(() => null);
    const seam = h('div', 'abs', document.getElementById('hud'));
    px(seam, 0, 0, 30, VH);
    seam.innerHTML = '<i class="blk bg-amber" style="left:0;top:0;width:8px;height:968px"></i><i class="blk bg-ink" style="left:11px;top:0;width:8px;height:968px"></i><i class="blk bg-red" style="left:22px;top:0;width:8px;height:968px"></i>';
    seam.dataset.name = 'seam';
    const win = (i) => {                                    // 场景 i 可见的时段与推入、推出的时段
      const s = L.scenes[i], nx = L.scenes[i + 1];
      const inPush = i > 0 && SWAP[s.id] === 'push', outPush = nx && SWAP[nx.id] === 'push';
      return { a: inPush ? s.start - PUSH / 2 : s.start, b: nx ? (outPush ? nx.start + PUSH / 2 : nx.start) : Infinity, inPush, outPush, s, nx };
    };
    const W = L.scenes.map((_, i) => win(i));
    F((t) => {
      let seamX = null;
      W.forEach((w, i) => {
        const vis = t >= w.a - 1e-6 && t < w.b;
        const disp = vis ? '' : 'none';
        if (disp !== lastD[i]) { roots[i].style.display = disp; lastD[i] = disp; }
        let x = 0;
        if (vis && w.inPush && t < w.s.start + PUSH / 2) { const k = ease.io3(clamp((t - w.a) / PUSH)); x = 1920 * (1 - k); seamX = x - 30; }
        if (vis && w.outPush && t >= w.nx.start - PUSH / 2) { const k = ease.io3(clamp((t - (w.nx.start - PUSH / 2)) / PUSH)); x = -1920 * k; }
        const tf = x ? `translate(${x.toFixed(1)}px,0)` : '';
        if (tf !== lastX[i]) { roots[i].style.transform = tf; lastX[i] = tf; }
      });
      seam.style.display = seamX == null ? 'none' : '';
      if (seamX != null) seam.style.left = seamX.toFixed(1) + 'px';
    });
    for (const s of L.scenes.slice(1)) if (SWAP[s.id] === 'push') sfx('whoosh', s.start - PUSH / 2, { g: 0.45 });
  },
};
