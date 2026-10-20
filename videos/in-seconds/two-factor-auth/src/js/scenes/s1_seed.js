// 第 2 个时间步（30–60 秒）：TOTP 的名字 → 共享密钥（二维码）→ 时间轴（1970、1984、1997、2005、2011）→ 从「年」推到「秒」→ 计数器。
// 站 A：TOTP；站 B：左纸右墨，服务器把密钥交给手机；站 C：一条从 1970 年画起的时间轴，自己缩放，镜头不动。
scene('seed', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const XB = 2400, XC = 5200, W1 = DATA.windows[1];

  // ── 站 A：这种验证码叫 TOTP ──
  const name = txt(world, '', '<span>T</span><span>O</span><span>T</span><span>P</span>', 92, 104);
  css(name, { font: '900 400px "Inter"', letterSpacing: '-.02em', lineHeight: '1' });
  const letters = [...name.children];
  const tName = Q(T('b1', 'TOTP'));
  // 换码的那一拍：刚换上的验证码先占住画面左侧（与开场同一个构图），名字落下时让位
  const hero = makeCode(world, { size: 270, x: 112, y: 190 });
  fromTo(hero.el, tName - 0.3, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.25, ease: 'power3.in' }); vanish(hero.el, tName - 0.05);
  appear(name, tName - 0.02);
  letters.forEach((l, i) => { l.style.display = 'inline-block'; slam(l, tName + i * 0.0625, { from: 1.5, d: 0.3 }); });
  sfx('thud', tName + 0.1, { p: -0.3 });
  const parts = LANG === 'zh'
    ? [['基于时间的', '基于时间', [0]], ['一次性', '一次性', [1, 2]], ['密码', '密码', [3]]]
    : [['Time-based', 'time-based', [0]], ['One-Time', 'one-time', [1, 2]], ['Password', 'password', [3]]];
  const full = txt(world, LANG === 'zh' ? 't-2' : 't-2', parts.map((p) => `<span>${p[0]}</span>`).join(LANG === 'zh' ? '<span> </span>' : ' '), 108, 560);
  if (LANG !== 'zh') full.style.fontSize = '72px';                              // 英文全称较长，缩一级，不压到右侧的表盘
  if (LANG === 'zh') { const en = txt(world, 't-4 dim', 'Time-based One-Time Password', 112, 704); wipe(en, Q(Tend('b1')) - 0.25, { dir: 'l', d: 0.4 }); }
  appear(full, Q(T('b1', parts[0][1])) - 0.02);
  [...full.children].filter((e) => e.textContent.trim()).forEach((sp, i) => {
    const tw = Q(T('b1', parts[i][1]));
    sp.style.display = 'inline-block'; slide(sp, tw, { y: 40, d: 0.35 }); sfx('pop', tw, { g: 0.7, p: -0.4 + i * 0.3 });
    parts[i][2].forEach((k) => classAt(letters[k], 'ac', tw, tw + 0.75));
  });
  makeDial(world, { x: 1540, y: 420, r: 230, color: C.paper, num: true });

  // ── 站 B：开启时，服务器生成一个密钥，放进二维码；手机扫码，存下同一个密钥 ──
  blk(world, 'bg-paper', XB - 240, -400, 1200, 1800);
  txt(world, 't-2 ink', tr('服务器', 'Server'), XB + 92, 130);
  txt(world, 't-2', tr('手机', 'Phone'), XB + 1008, 130);
  const stripGeo = { pitch: 84, w: 76, h: 62, rowGap: 70, size: 44, cols: 5 };
  const kS = txt(world, 't-4 ink', tr('密钥', 'Secret key'), XB + 100, 276), kSn = txt(world, 't-n dimp', tr('20 字节 = 160 位', '20 bytes = 160 bits'), XB + 100, 640);
  const cellsS = byteCells(world, DATA.key, { ...stripGeo, x: XB + 96, y: 350, cls: 'ink' });
  const tGen = Q(T('b3', { zh: '生成', en: 'fresh' }));
  wipe(kS, tGen - 0.15, { dir: 'l', d: 0.3 });
  cellsS.forEach((c, i) => { appear(c, tGen + i * 0.03); if (i % 2 === 0) sfx('key', tGen + i * 0.03, { g: 0.9, p: -0.4 }); });
  wipe(kSn, tGen + 0.65, { dir: 'l', d: 0.3 });
  // 二维码：41×41 个模块，分 16 组先后出现
  const QN = DATA.qr.size, QS = 9, rnd = seeded(41), groups = Array.from({ length: 16 }, () => '');
  DATA.qr.rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '1') groups[Math.floor(rnd() * 16)] += `M${x},${y}h1v1h-1z`; }));
  const qr = svg('svg', { class: 'abs', width: QN * QS, height: QN * QS, viewBox: `0 0 ${QN} ${QN}`, 'shape-rendering': 'crispEdges' }, world); px(qr, XB + 540, 300); qr.dataset.name = 'qr';
  const tQR = Q(T('b3', { zh: '二维码', en: 'QR' })) - 0.25;
  groups.forEach((d, i) => { const p = svg('path', { d, fill: C.ink }, qr); appear(p, tQR + i * 0.045); if (i % 3 === 0) sfx('tick', tQR + i * 0.045, { g: 0.6, p: -0.2 }); });
  const uri = txt(world, 'mono t-n dimp', esc('otpauth://totp/Example:alice@example.com') + '<br>' + esc('?secret=' + DATA.b32) + '<br>' + esc('&issuer=Example'), XB + 100, 730);
  css(uri, { fontSize: '28px', lineHeight: '38px' });
  wipe(uri, tQR + 0.75, { dir: 't', d: 0.4 });
  // 手机一侧：取景框里扫到同一张码，随后存下同样的 20 个字节
  const tScan = Q(T('b4', { zh: '扫码', en: 'scans' }));
  const vf = svg('svg', { class: 'abs', width: 409, height: 409, viewBox: '0 0 409 409' }, world); px(vf, XB + 1011, 280); vf.dataset.name = 'viewfinder';
  for (const [x, y, dx, dy] of [[4, 4, 1, 1], [405, 4, -1, 1], [4, 405, 1, -1], [405, 405, -1, -1]]) svg('path', { d: `M${x + dx * 70},${y} L${x},${y} L${x},${y + dy * 70}`, fill: 'none', stroke: C.ac, 'stroke-width': 8 }, vf);
  slam(vf, tScan - 0.25, { from: 1.25, d: 0.3 }); sfx('pop', tScan - 0.25, { g: 0.7, p: 0.3 });
  const qr2 = svg('svg', { class: 'abs', width: QN * QS, height: QN * QS, viewBox: `0 0 ${QN} ${QN}`, 'shape-rendering': 'crispEdges' }, world); px(qr2, XB + 1031, 300); qr2.dataset.name = 'qr-seen';
  svg('path', { d: groups.join(''), fill: C.paper }, qr2);
  wipe(qr2, tScan, { dir: 't', d: 0.5, ease: 'none' });
  const scan = blk(world, 'bg-ac', XB + 1021, 300, 389, 8);
  appear(scan, tScan); fromTo(scan, tScan, { y: 0 }, { y: 361, duration: 0.5, ease: 'none' }); vanish(scan, tScan + 0.5); sfx('blip', tScan, { g: 0.7, p: 0.3 });
  const kP = txt(world, 't-4', tr('密钥', 'Secret key'), XB + 1456, 276);
  const cellsP = byteCells(world, DATA.key, { ...stripGeo, x: XB + 1452, y: 350 });
  const tStore = Q(T('b4', { zh: '存下', en: 'stores' }));
  wipe(kP, tStore - 0.15, { dir: 'l', d: 0.3 });
  cellsP.forEach((c, i) => { appear(c, tStore + i * 0.03); if (i % 2 === 0) sfx('key', tStore + i * 0.03, { g: 0.9, p: 0.5 }); });
  const tSame = Q(T('b4', { zh: '同一个', en: 'same' }));
  [XB + 96, XB + 1452].forEach((x, i) => { const u = blk(world, 'bg-ac', x, 626, 412, 10); fromTo(u, tSame + i * 0.125, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out' }); });
  to(kSn, tSame, { y: 22, duration: 0.3 });
  sfx('chime', tSame, { g: 0.7 });

  // ── 站 C：另一个输入是时间 ──
  const NOW = (t) => DATA.t0 + t;
  const tArr = Tend('b4') + 0.1, tZ0 = Math.max(Qf(T('b6')) - 0.5, Tend('h2') - 0.1), dZ = 2.75;   // 上一句说完再开始推近
  const kOf = (t) => ease.io3(clamp((t - tZ0) / dZ));
  const S0 = 1640 / (DATA.t0 + 45), S1 = 40;
  const view = (t) => { const k = kOf(t), sc = Math.exp(lerp(Math.log(S0), Math.log(S1), k)), xn = lerp(1780, 960, k); return { k, sc, xn, X: (u) => XC + xn + (u - NOW(t)) * sc }; };
  const AY = 716;
  const lTime = txt(world, 't-3 ac', tr('时间', 'Time'), XC + 112, 122);
  const unix = txt(world, 'num', '', XC + 104, 198); unix.style.fontSize = '150px';
  const lSec = txt(world, 't-2', tr('秒', 's'), XC + 1296, 244);
  const note = txt(world, 't-n dim', tr('自 1970-01-01 00:00:00 UTC 起', 'since 1970-01-01 00:00:00 UTC'), XC + 114, 362);
  let lastU = null;
  F((t) => { const v = group3(Math.floor(NOW(t) + 1e-6)); if (v !== lastU) { unix.textContent = v; lastU = v; } });
  const tTime = Q(T('b5', { zh: '时间', en: 'time' }));
  slam(lTime, tTime, { from: 1.4, d: 0.3 }); sfx('pop', tTime, { p: -0.4 });
  wipe(unix, tArr + 0.35, { dir: 'l', d: 0.5 });
  const tSecs = Q(T('b5', { zh: '秒数', en: 'seconds' }));
  slam(lSec, tSecs, { from: 1.4, d: 0.3 }); wipe(note, Q(T('b5', '1970')), { dir: 'l', d: 0.35 }); sfx('tick', tSecs, { g: 0.8 });
  // 轴线、刻度与刻度上的文字：每帧按当前的缩放重算
  const ax = svg('svg', { class: 'abs', width: 2040, height: 120, viewBox: `${XC - 60} ${AY - 20} 2040 120` }, world); px(ax, XC - 60, AY - 20); ax.dataset.name = 'time-axis';
  svg('line', { x1: XC - 60, y1: AY, x2: XC + 1980, y2: AY, stroke: C.paper, 'stroke-width': 4 }, ax);
  const POOL = 520, lines = Array.from({ length: POOL }, () => svg('line', { y1: AY, stroke: C.paper }, ax));
  const LPOOL = 26, labels = Array.from({ length: LPOOL }, () => { const e = txt(world, 'mono dim', '', 0, AY + 52); css(e, { fontSize: '28px', fontWeight: 500, width: '240px', marginLeft: '-120px', textAlign: 'center' }); return e; });
  const YEAR = 365.2425 * 86400;
  const MON = tr(['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  // 各级刻度：[大致间隔（秒）, 给出 [a, b] 内各刻度时刻的函数, 标注文字]
  const yearsIn = (a, b, step) => { const out = [], y0 = Math.floor(civilFromDays(Math.floor(a / 86400)).y / step) * step; for (let y = y0; unixOf(y) <= b; y += step) if (unixOf(y) >= a) out.push(unixOf(y)); return out; };
  const monthsIn = (a, b) => { const out = []; let { y, m } = civilFromDays(Math.floor(a / 86400)); for (; unixOf(y, m) <= b; m === 12 ? (y++, m = 1) : m++) if (unixOf(y, m) >= a) out.push(unixOf(y, m)); return out; };
  const every = (unit) => (a, b) => { const out = []; for (let u = Math.ceil(a / unit) * unit; u <= b; u += unit) out.push(u); return out; };
  const LEVELS = [
    [10 * YEAR, (a, b) => yearsIn(a, b, 10), (u) => String(civilFromDays(u / 86400).y)],
    [YEAR, (a, b) => yearsIn(a, b, 1), (u) => String(civilFromDays(u / 86400).y)],
    [YEAR / 12, monthsIn, (u) => MON[civilFromDays(u / 86400).m - 1]],
    [86400, every(86400), (u) => { const c = civilFromDays(u / 86400); return tr(`${c.m} 月 ${c.d} 日`, `${MON[c.m - 1]} ${c.d}`); }],
    [3600, every(3600), (u) => clockOf(u, false)],
    [60, every(60), (u) => clockOf(u, false)],
    [10, every(10), (u) => clockOf(u)],
    [1, every(1), null],
  ];
  const tAxis = tArr + 0.15;                                                    // 镜头到站时，轴线与秒数已经在那里
  wipe(ax, tAxis, { dir: 'l', d: 0.7 });
  F((t) => {
    if (t < tArr - 0.2) return;
    const v = view(t), a = NOW(t) + (-60 - v.xn) / v.sc, b = NOW(t) + (1980 - v.xn) / v.sc;
    let n = 0, ln = 0;
    LEVELS.forEach(([unit, gen, fmt], li) => {
      const sp = unit * v.sc; if (sp < 6) return;
      const al = clamp((sp - 6) / 10), len = 12 + 40 * clamp((sp - 6) / 150), finer = LEVELS[li + 1] ? LEVELS[li + 1][0] * v.sc : 0;
      const la = fmt ? clamp((sp - 90) / 60) * (1 - (LEVELS[li + 1] && LEVELS[li + 1][2] ? clamp((finer - 90) / 60) : 0)) : 0;
      for (const u of gen(a, b)) {
        const x = v.X(u);
        if (n < POOL) { const l = lines[n++]; l.setAttribute('x1', x.toFixed(2)); l.setAttribute('x2', x.toFixed(2)); l.setAttribute('y2', (AY + len).toFixed(1)); l.setAttribute('stroke-width', len > 44 ? 4 : 2); l.setAttribute('opacity', al.toFixed(3)); l.style.display = ''; }
        if (la > 0.02 && ln < LPOOL && x > XC + 60 && x < XC + 1830) { const e = labels[ln++]; const s2 = fmt(u); if (e._t !== s2) { e.textContent = s2; e._t = s2; } e.style.left = x.toFixed(1) + 'px'; e.style.opacity = la.toFixed(3); e.style.display = ''; }
      }
    });
    for (let i = n; i < POOL; i++) lines[i].style.display = 'none';
    for (let i = ln; i < LPOOL; i++) labels[i].style.display = 'none';
  });
  for (const e of labels) wipe(e, tAxis + 0.5, { dir: 't', d: 0.3 });
  // 时间轴上的历史节点（出处见 research/FACTS.md）
  const marks = [
    { u: 0, y: '1970', c: tr('Unix 纪元', 'Unix epoch'), hi: 0, t: Q(T('b5', '1970')) },
    { u: unixOf(1984, 11, 30), y: '1984', c: tr('令牌专利申请 US 4,720,860', 'token patent filed · US 4,720,860'), hi: 1, t: Q(T('h1', '1984')) },
    { u: unixOf(1997, 2, 1), y: '1997', c: 'HMAC · RFC 2104', hi: 0, t: Qf(T('h2')) - 0.5 },
    { u: unixOf(2005, 12, 1), y: '2005', c: 'HOTP · RFC 4226', hi: 1, t: Qf(T('h2')) - 0.25 },
    { u: unixOf(2011, 5, 1), y: '2011', c: 'TOTP · RFC 6238', hi: 0, t: Q(T('h2', '2011')) },
  ];
  marks.forEach((m, i) => {
    const g = h('div', 'abs', world); px(g, 0, 0);
    const top = m.hi ? 436 : 566;
    const stem = blk(g, 'bg-paper', -2, top + 116, 4, AY - top - 116), dot = blk(g, 'bg-paper', -9, AY - 9, 18, 18);
    const yr = txt(g, 'num', m.y, 14, top); yr.style.fontSize = '68px';
    const cp = txt(g, 't-n', m.c, 16, top + 74);
    F((t) => { const v = view(t); g.style.left = v.X(m.u).toFixed(1) + 'px'; g.style.opacity = (1 - clamp(v.k / 0.06)).toFixed(3); });
    fromTo(stem, m.t, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.25, ease: 'power3.out' }); appear(dot, m.t);
    slam(yr, m.t + 0.05, { from: 1.4, d: 0.3 }); wipe(cp, m.t + 0.2, { dir: 'l', d: 0.3 });
    sfx(i === 1 || i === 4 ? 'thud' : 'tick', m.t, { g: i === 1 || i === 4 ? 0.8 : 0.9, p: -0.6 + i * 0.25 });
  });
  // 现在：朱红的一道竖线
  const nowG = h('div', 'abs', world); px(nowG, 0, 0);
  const nowBar = blk(nowG, 'bg-ac', -4, 590, 8, 290);
  const nowL = txt(nowG, 't-3 ac', tr('现在', 'now'), 0, 812); css(nowL, { width: '300px', marginLeft: '-322px', textAlign: 'right' });
  F((t) => { nowG.style.left = (XC + view(t).xn).toFixed(1) + 'px'; });
  wipe(nowBar, tAxis + 0.6, { dir: 't', d: 0.3 }); wipe(nowL, tAxis + 0.75, { dir: 'r', d: 0.3 }); sfx('blip', tAxis + 0.6, { g: 0.6, p: 0.6 });
  // 推到「秒」：除以 30，取整
  const tDiv = Q(T('b6', { zh: '除以', en: 'Divide' })), tFloor = Q(T('b6', { zh: '取整', en: 'round' })), tCtr = Q(T('b6', { zh: '计数器', en: 'counter' }));
  wipeOut(lSec, tDiv - 0.1, { dir: 'l', d: 0.2 });
  const div = txt(world, 'num ac', '÷ 30', XC + 1310, 198); div.style.fontSize = '150px';
  slam(div, tDiv, { from: 1.3, d: 0.3 }); sfx('pop', tDiv, { p: 0.3 });
  const eqv = txt(world, 'num', '', XC + 104, 398); eqv.style.fontSize = '150px';
  const frac = txt(world, 'num dim', '', XC + 104 + 12 * 90, 398); frac.style.fontSize = '150px';
  let lastQ = null, lastF = null;
  F((t) => { const q = NOW(t) / PERIOD, a = '= ' + group3(Math.floor(q + 1e-9)), f = '.' + two(Math.floor((q - Math.floor(q + 1e-9)) * 100 + 1e-6)); if (a !== lastQ) { eqv.textContent = a; lastQ = a; } if (f !== lastF) { frac.textContent = f; lastF = f; } });
  wipe(eqv, tDiv + 0.25, { dir: 'l', d: 0.4 }); wipe(frac, tDiv + 0.35, { dir: 'l', d: 0.4 }); sfx('blip', tDiv + 0.25, { g: 0.7 });
  exit(frac, tFloor, { y: 90, d: 0.3 }); sfx('tick', tFloor, { g: 0.9, p: 0.3 });
  wipeOut(note, tDiv, { dir: 'l', d: 0.2 });
  const ctr = txt(world, 't-3 ink bg-ac', tr('计数器', 'counter'), XC + 104 + 12 * 90 + 30, 438); css(ctr, { padding: '6px 22px 10px' });
  slam(ctr, tCtr, { from: 1.35, d: 0.3 }); sfx('thud', tCtr, { g: 0.8, p: 0.3 });
  // 30 秒一格：每格里是它的计数器。当前这一格顶上压一道朱红
  const blocks = h('div', 'abs', world); px(blocks, 0, 0);
  const bEls = [-1, 0, 1, 2, 3].map((d) => {
    const g = h('div', 'abs', blocks); css(g, { top: '606px', height: (AY - 606) + 'px', borderLeft: `4px solid ${C.paper}`, borderTop: `4px solid ${C.paper}` });
    const cur = blk(g, 'bg-ac', 0, -4, 0, 12); cur.style.width = '100%';
    const a = txt(g, 'num', '', 22, 30), b = txt(g, 'num', '', 0, 30);
    for (const e of [a, b]) e.style.fontSize = '46px'; css(b, { right: '26px', left: 'auto' });
    return { g, cur, a, b, d };
  });
  F((t) => {
    const v = view(t), al = clamp((PERIOD * v.sc - 500) / 400);
    blocks.style.opacity = al.toFixed(3); blocks.style.display = al > 0 ? '' : 'none';
    if (al <= 0) return;
    const k0 = Math.floor(NOW(t) / PERIOD + 1e-9);
    for (const e of bEls) {
      const kk = k0 + e.d, x0 = v.X(kk * PERIOD), w = PERIOD * v.sc;
      e.g.style.left = x0.toFixed(1) + 'px'; e.g.style.width = w.toFixed(1) + 'px';
      if (e._k !== kk) { e.a.textContent = String(kk); e.b.textContent = String(kk); e._k = kk; }
      e.cur.style.display = e.d === 0 ? '' : 'none';
      e.a.style.visibility = x0 < XC + 30 ? 'hidden' : 'visible';
    }
  });
  const tPlus = Q(T('b7', { zh: '加一', en: 'adds' }));
  const plus1 = txt(world, 'num ac', '+1', 0, 636); plus1.style.fontSize = '46px';
  F((t) => { plus1.style.left = (view(t).X(DATA.t0 + 60) + 268).toFixed(1) + 'px'; });
  slam(plus1, tPlus, { from: 1.5, d: 0.3 }); sfx('pop', tPlus, { p: 0.3 });
  sfx('riser', s.end - 1.25, { g: 0.8 });

  // ── 常驻元素的底色 ──
  const tB = Tend('b1') + 0.05;
  hudGround('L', tB + 0.45, tArr + 0.2, 'paper');

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [s.start + 0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [s.start + 1.0, { z: 1.03 }, tB - s.start - 1.1, { ease: 'none', sfx: false }],
    [tB, { x: XB + 960, z: 1 }, 0.8],
    [null, { z: 1.03 }, tArr - tB - 1.05, { ease: 'none', sfx: false }],
    [tArr, { x: XC + 960, z: 1 }, 0.9],
    [null, { z: 1.02 }, tZ0 - tArr - 1.2, { ease: 'none', sfx: false }],
    [tZ0, { z: 1 }, 0.5, { sfx: false }],
  ]);
  sfx('whoosh', tZ0 + 0.2, { g: 0.8 });
});
