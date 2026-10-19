// 「XX 秒速通」第 20 集的引擎配置：字体、颜色、节拍网格、常驻元素（字幕带与秒尺、剩余秒数、右上角的「服务器此刻看到的证据」）、换场。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
window.PALETTE = { ink: '#111111', paper: '#F1ECE1', red: '#E2412C', yel: '#F2C230', blue: '#2F57B0', white: '#FFFFFF', dim: '#6E6A61', dimp: '#8A857A' };
const C = window.PALETTE;
const VH = 968;                                           // 字幕带以上的画幅高度；镜头以这块区域为画幅：makeCamera(world, 1920, VH)
// 节拍网格：配乐 120 拍/分，一秒两拍。画面上的重音吸附到八分音符（0.25 秒）上，与配乐同拍
const BEAT = 0.5;
const Q = (t, g = 0.25) => Math.round(t / g + 1e-6) * g;          // 最近的格点
const Qf = (t, g = 0.25) => Math.floor(t / g + 1e-6) * g;         // 不晚于 t 的格点：动作宁早勿晚
// 常驻元素的字色跟着它底下的底色走：场景登记「某一侧在某段时间里压在深色（'ink' 'blue' 'red'）上」，缺省是纸色
const HUDG = { L: [], R: [] };
const hudGround = (side, t0, t1, g) => { HUDG[side].push([t0, t1, g]); };
const WIPE = 0.5;                                         // 换场用时：一拍

// 右上角的仪表：服务器此刻看到的证据。一个小黑框（服务器），框里是证据的形状，右边是它的名字；随旁白换。
// 每条：[时刻, 形状, 中文名, 英文名]。形状：pw 红圆（密码）、sid 蓝色票根（Session ID）、jwt 三段条、sms 蓝方（短信码）、key 红钥匙（passkey 签名）、code 一次性码、idt ID Token、all 三样一起
const PROOF = () => [
  [T('o1', { zh: '密码', en: 'password' }), 'pw', '密码', 'Password'],
  [T('s4', { zh: '编号', en: 'number' }), 'sid', 'Session ID', 'Session ID'],
  [T('j2', { zh: '签名', en: 'sign' }), 'jwt', 'JWT', 'JWT'],
  [T('p2', { zh: '密码', en: 'password' }), 'pw', '密码', 'Password'],
  [T('p5', { zh: '短信码', en: 'SMS' }), 'sms', '短信码', 'SMS code'],
  [T('p7', { zh: '签名', en: 'signs' }), 'key', 'passkey 签名', 'Passkey'],
  [T('a2', { zh: '一次性码', en: 'code' }), 'code', '一次性码', 'One-time code'],
  [T('a6', 'ID Token'), 'idt', 'ID Token', 'ID Token'],
  [T('e1'), 'all', '证据', 'Proof'],
];

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['900 20px "Inter"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    // ── 换场时沿着揭示边缘走的那条形状（见 after）──
    const edge = h('div', 'abs', hud); edge.dataset.name = 'reveal-edge'; css(edge, { visibility: 'hidden', boxSizing: 'border-box' });
    const edge2 = h('div', 'abs', hud); edge2.dataset.name = 'reveal-edge'; css(edge2, { visibility: 'hidden', boxSizing: 'border-box' });
    // ── 字幕带与秒尺：一秒一格，走过的变成红色；每 30 秒一道长刻度。刻度是小方块，读头是一个黄三角 ──
    const band = h('div', 'band', hud);
    const rs = svg('svg', { width: 1920, height: 40, viewBox: '0 0 1920 40' }, band);
    const X = (s) => 8 + s * (1904 / TOTAL), ticks = [];
    for (let i = 0; i <= TOTAL; i++) {
      const big = i % 30 === 0, mid = i % 10 === 0, w = big ? 6 : mid ? 4 : 3;
      ticks.push(svg('rect', { x: X(i) - w / 2, y: 0, width: w, height: big ? 22 : mid ? 14 : 7, fill: C.dimp }, rs));
    }
    const head = svg('polygon', { points: '-8,36 0,24 8,36', fill: C.yel }, rs);
    let lastS = -2;
    F((t) => {
      const s = Math.floor(t + 1e-6);
      if (s !== lastS) { ticks.forEach((e, i) => e.setAttribute('fill', i <= s ? C.red : C.dimp)); lastS = s; }
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
    // ── 右上：服务器此刻看到的证据 ──
    const right = h('div', 'hud-r', hud);
    const cap = h('div', 'abs', right, tr('服务器看到', 'Server sees')); px(cap, 92, 0); css(cap, { font: '700 24px "Sans SC", "Inter"', color: C.dim });
    const name = h('div', 'abs', right, ''); px(name, 92, 30); css(name, { font: zh() ? '800 30px "Sans SC", "Inter"' : '800 28px "Inter"', color: C.ink, whiteSpace: 'nowrap' });
    name.dataset.name = 'proof-name';
    const g = svg('svg', { width: 72, height: 72, viewBox: '0 0 72 72' }, right); css(g, { position: 'absolute', left: '0px', top: '0px' }); g.dataset.name = 'proof-hud';
    svg('rect', { x: 4, y: 4, width: 64, height: 64, fill: 'none', stroke: C.ink, 'stroke-width': 8 }, g);
    const icons = {
      pw: [svg('circle', { cx: 36, cy: 36, r: 17, fill: C.red }, g)],
      sid: [svg('rect', { x: 26, y: 16, width: 20, height: 40, fill: C.blue }, g)],
      jwt: [svg('rect', { x: 15, y: 28, width: 12, height: 16, fill: C.ink }, g), svg('rect', { x: 30, y: 28, width: 12, height: 16, fill: C.yel }, g), svg('rect', { x: 45, y: 28, width: 12, height: 16, fill: C.red }, g)],
      sms: [svg('rect', { x: 20, y: 20, width: 32, height: 32, fill: C.blue }, g)],
      key: [svg('path', { d: 'M16,48 L16,30 L34,30 L34,24 L40,24 L40,30 L46,30 L46,22 L52,22 L52,48 Z', fill: C.red }, g)],
      code: [svg('rect', { x: 14, y: 30, width: 44, height: 12, fill: C.ink }, g)],
      idt: [svg('rect', { x: 15, y: 28, width: 12, height: 16, fill: C.ink }, g), svg('rect', { x: 30, y: 28, width: 12, height: 16, fill: C.yel }, g), svg('rect', { x: 45, y: 28, width: 12, height: 16, fill: C.red }, g)],
      all: [svg('circle', { cx: 24, cy: 26, r: 9, fill: C.red }, g), svg('rect', { x: 38, y: 17, width: 17, height: 17, fill: C.blue }, g), svg('rect', { x: 18, y: 44, width: 36, height: 10, fill: C.yel }, g)],
    };
    const plan = PROOF().sort((a, b) => a[0] - b[0]);
    let lastK = null;
    F((t) => {
      let k = -1;
      for (let i = 0; i < plan.length; i++) if (t >= plan[i][0] - 1e-6) k = i;
      if (t >= L.scenes[L.scenes.length - 1].start) k = -1;           // 片尾不显示
      if (k === lastK) return; lastK = k;
      const kind = k >= 0 ? plan[k][1] : null;
      for (const key in icons) for (const e of icons[key]) e.style.visibility = key === kind ? 'visible' : 'hidden';
      name.textContent = k >= 0 ? (zh() ? plan[k][2] : plan[k][3]) : '';
      right.style.visibility = t < plan[0][0] - 1e-6 || k < 0 ? 'hidden' : 'visible';
    });
    for (const [tt] of plan.slice(1)) sfx('tick', tt, { g: 0.45, p: 0.8 });
    window.HUD = { left, right, edge, edge2 };
    const groundAt = (side, t) => { let gg = 'paper'; for (const [a, b, v] of HUDG[side]) if (t >= a && t < b) gg = v; return gg; };
    const onDark = (gg) => gg === 'ink' || gg === 'red' || gg === 'blue';
    let gl = null, gr = null;
    F((t) => {
      const a = groundAt('L', t), b = groundAt('R', t);
      if (a !== gl) { left.style.color = onDark(a) ? C.paper : C.ink; gl = a; }
      if (b !== gr) { name.style.color = onDark(b) ? C.paper : C.ink; cap.style.color = onDark(b) ? C.dimp : C.dim; gr = b; }
    });
  },
  after() {
    // 换场：新场景从一个形状里长出来，形状就是下一段要讲的那件证据——
    // 会话从一个蓝方展开，JWT 从一条横带展开，第一次认证从红圆展开，第三方登录从中线向两边推开（两个黑框），收束从上落下一只黑框；片尾照系列用直刷。
    const REV = {
      session: { kind: 'square', color: C.blue }, jwt: { kind: 'band', color: C.blue }, authn: { kind: 'circle', color: C.red },
      oauth: { kind: 'doors', color: C.ink }, close: { kind: 'drop', color: C.ink }, outro: { kind: 'wipe', color: C.ink },
    };
    const W = 1920, H = 1080, cx = 960, cy = 484, R = Math.hypot(W, H);
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id)), lastClip = roots.map(() => null);
    const { edge, edge2 } = HUD; let lastE = null;
    F((t) => {
      let es = null;
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const vis = t >= s.start - 1e-6 && (!nx || t < nx.start + WIPE);
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && t < s.start + WIPE) {
          const p = ease.io3(clamp((t - s.start) / WIPE)), rv = REV[s.id] || { kind: 'wipe', color: C.ink };
          if (rv.kind === 'square') { const r = p * 1000; clip = `inset(${Math.max(0, cy - r).toFixed(1)}px ${Math.max(0, W - cx - r).toFixed(1)}px ${Math.max(0, H - cy - r).toFixed(1)}px ${Math.max(0, cx - r).toFixed(1)}px)`; es = ['sq', cx - r, cy - r, 2 * r, 2 * r, rv.color]; }
          else if (rv.kind === 'band') { const r = p * 600; clip = `inset(${Math.max(0, cy - r).toFixed(1)}px 0px ${Math.max(0, H - cy - r).toFixed(1)}px 0px)`; es = ['band', 0, cy - r, W, 2 * r, rv.color]; }
          else if (rv.kind === 'circle') { const r = p * R / 2 * 1.05; clip = `circle(${r.toFixed(1)}px at ${cx}px ${cy}px)`; es = ['circ', cx - r, cy - r, 2 * r, 2 * r, rv.color]; }
          else if (rv.kind === 'doors') { const r = p * 980; clip = `inset(0px ${Math.max(0, cx - r).toFixed(1)}px 0px ${Math.max(0, cx - r).toFixed(1)}px)`; es = ['doors', cx - r, 0, 2 * r, H, rv.color]; }
          else if (rv.kind === 'drop') { const y = p * H; clip = `inset(0px 0px ${(H - y).toFixed(1)}px 0px)`; es = ['drop', 0, y, W, 0, rv.color]; }
          else { const x = p * W; clip = `inset(0px ${(W - x).toFixed(1)}px 0px 0px)`; es = ['wipe', x, 0, 0, H, rv.color]; }
        }
        if (clip !== lastClip[i]) { root.style.clipPath = clip; lastClip[i] = clip; }
      });
      // 揭示的边缘：一条与形状同色的粗边，随形状长大
      const key = es ? es.map((v) => (typeof v === 'number' ? v.toFixed(0) : v)).join(',') : 'off';
      if (key === lastE) return; lastE = key;
      if (!es) { edge.style.visibility = 'hidden'; edge2.style.visibility = 'hidden'; return; }
      const [kind, x, y, w, hh, col] = es, B = 26;
      edge.style.visibility = 'visible'; edge2.style.visibility = 'hidden';
      const base = { border: 'none', borderRadius: '0', background: 'transparent' };
      if (kind === 'sq') css(edge, { ...base, left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', border: `${B}px solid ${col}` });
      else if (kind === 'circ') css(edge, { ...base, left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', border: `${B}px solid ${col}`, borderRadius: '50%' });   // lint-ok: 揭示红圆的边，圆形是本集的图形语言
      else if (kind === 'band') { css(edge, { ...base, left: '0px', top: (y - B / 2) + 'px', width: W + 'px', height: B + 'px', background: col }); css(edge2, { ...base, left: '0px', top: (y + hh - B / 2) + 'px', width: W + 'px', height: B + 'px', background: col }); edge2.style.visibility = 'visible'; }
      else if (kind === 'doors') { css(edge, { ...base, left: (x - B) + 'px', top: '0px', width: B + 'px', height: H + 'px', background: col }); css(edge2, { ...base, left: (x + w) + 'px', top: '0px', width: B + 'px', height: H + 'px', background: col }); edge2.style.visibility = 'visible'; }
      else if (kind === 'drop') css(edge, { ...base, left: '0px', top: (y - B) + 'px', width: W + 'px', height: B + 'px', background: col });
      else css(edge, { ...base, left: (x - B / 2) + 'px', top: '0px', width: B + 'px', height: H + 'px', background: col });
    });
    // 换场的声音：形状长满时一声木块的实音，不用气流声
    for (const s of L.scenes.slice(1)) { sfx('pop', s.start + 0.05, { g: 0.5 }); sfx('thud', s.start + WIPE, { g: 0.65, p: 0.2 }); }
  },
};
