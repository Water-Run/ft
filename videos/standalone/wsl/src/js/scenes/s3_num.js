// 第三章 两套版本号（2021–2025）。一张图：横轴是时间（2016–2026），纵轴是数字 0–3。
// 墨色的线是「架构」的代号（2016 起为 1，2019 起为 2），蓝色的线是软件包的主版本号（2021 起，每个发布一个刻度，共 118 个）。
// 镜头沿时间轴由左向右走；背景与年份的字重随年代变（白底细体 → 浅灰半粗 → Mica 粗体）。纵轴的数字不随镜头走。
scene('num', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  const R = DATA.releases, PY = 470, X0 = 300, U = 150, YB = 800, OFF = 9;      // 两条线在同一级上重合时上下各让 9px
  const X = (y) => X0 + (y - 2016) * PY, Y = (v) => YB - v * U;
  const frac = (d) => { const [y, m, dd] = d.split('-').map(Number); return y + (m - 1) / 12 + (dd - 1) / 365; };
  const W = X(2027.6);
  clockAt(s.start + CUT, '2016-03-30');
  // 背景：三个年代三种底
  const bg1 = blk(world, '', -2000, -600, X(2017.4) + 2000, 2200), bg2 = blk(world, '', X(2017.4), -600, X(2021.8) - X(2017.4), 2200), bg3 = blk(world, '', X(2021.8), -600, W - X(2021.8) + 3000, 2200);
  bg1.style.background = '#ffffff'; bg2.style.background = '#f3f2f1'; bg3.style.background = '#f3f3f3';
  [bg1, bg2, bg3].forEach((e) => { e.dataset.name = 'ground'; });
  blobs(world, [['a', X(2022.2), -260, 1000], ['b', X(2023.8), 380, 1000], ['c', X(2025.2), -240, 1100], ['a', X(2026.4), 360, 1000]]);
  // 横线与年份
  const ov = svg('svg', { class: 'ov', width: W, height: VH, viewBox: `0 0 ${W} ${VH}` }, world); css(ov, { width: W + 'px', height: VH + 'px' }); ov.dataset.name = 'chart';
  for (let v = 0; v <= 3; v++) svg('line', { x1: 0, y1: Y(v), x2: W, y2: Y(v), stroke: '#8f8f8f', 'stroke-width': v === 0 ? 3 : 2, 'stroke-dasharray': v === 0 ? '' : '4 12' }, ov);
  for (let y = 2016; y <= 2027; y++) {
    svg('line', { x1: X(y), y1: Y(0), x2: X(y), y2: Y(0) + 18, stroke: '#5c5c5c', 'stroke-width': 3 }, ov);
    const yl = txt(world, 't-4', String(y), X(y) + 10, YB + 24); css(yl, { fontWeight: y < 2018 ? 300 : y < 2022 ? 600 : 700, color: '#5c5c5c' });
  }
  // 纵轴的数字：固定在画面左侧
  const axis = h('div', 'abs', root); px(axis, 0, 0, 150, VH); css(axis, { background: '#fbfbfb', borderRight: '3px solid #1b1b1b' }); axis.dataset.name = 'axis';
  [0, 1, 2, 3].forEach((v) => { const n = txt(axis, 'num', String(v), 46, Y(v) - 44); n.style.fontSize = '84px'; n.style.color = '#1b1b1b'; });
  wipe(axis, c0, { dir: 'l', d: 0.4 });

  // ── 架构的线：2016-03-30 起为 1，2019-05-06 起为 2 ──
  const xa1 = X(frac('2016-03-30')), xa2 = X(frac('2019-05-06')), xEnd = X(2027.3);
  const arch = svg('path', { d: `M${xa1},${Y(1) - OFF} L${xa2},${Y(1) - OFF} L${xa2},${Y(2) - OFF} L${xEnd},${Y(2) - OFF}`, fill: 'none', stroke: '#1b1b1b', 'stroke-width': 12, 'stroke-linejoin': 'miter' }, ov);
  const archLen = arch.getTotalLength(); arch.style.strokeDasharray = archLen;
  const l1 = txt(world, 't-3', 'WSL 1', xa1 + 20, Y(1) - 104), l1s = txt(world, 't-n dim', '2016-03-30', xa1 + 24, Y(1) + 20);
  const l2 = txt(world, 't-3', 'WSL 2', xa2 + 30, Y(2) - 104), l2s = txt(world, 't-n dim', '2019-05-06', xa2 + 34, Y(2) + 20);
  const la = txt(root, 't-3', `<span style="display:inline-block;width:44px;height:14px;background:#1b1b1b;vertical-align:middle;margin-right:18px"></span>${tr('架构', 'Architecture')}`, 200, 44); la.style.color = '#1b1b1b';
  const lad = txt(root, 't-n', tr('发行版运行在哪一种上面', 'what a distribution runs on'), 264, 124); lad.style.color = '#5c5c5c';
  // 蓝线每帧按「镜头右缘之前」画到哪里：线随镜头长出来
  const tA0 = c0 + 0.2, tA1 = T('v1', { zh: '架构', en: 'architecture' }) + 0.6;
  F((t) => { arch.style.strokeDashoffset = archLen * (1 - clamp((t - tA0) / (tA1 - tA0)) * ((xa2 - xa1 + U + 420) / archLen) - clamp((t - tA1) / (s.end - 1.5 - tA1)) * (1 - (xa2 - xa1 + U + 420) / archLen)); });
  wipe(l1, tA0 + 0.1, { dir: 'l', d: 0.35 }); show(l1s, tA0 + 0.3, { y: 0, x: -16, d: 0.3 }); sfx('pop', tA0 + 0.1, { g: 0.6, p: -0.4 });
  wipe(l2, T('v1', { zh: '2', en: '2' }) - 0.1, { dir: 'l', d: 0.35 }); show(l2s, T('v1', { zh: '2', en: '2' }) + 0.2, { y: 0, x: -16, d: 0.3 }); sfx('pop', T('v1', { zh: '2', en: '2' }) - 0.1, { g: 0.6, p: 0.4 });
  [l1, l1s, l2, l2s].forEach((e) => wipeOut(e, T('v2') - 0.25, { dir: 'l', d: 0.3 }));       // 镜头往右走之前收走，免得从纵轴后面露出半截
  clockAt(T('v1', { zh: '2', en: '2' }) - 0.1, '2019-05-06'); clockAt(T('v2'), '2021');
  wipe(la, T('v1', { zh: '架构', en: 'architecture' }) - 0.1, { dir: 'l', d: 0.4 }); show(lad, T('v1', { zh: '发行版', en: 'distribution' }), { y: 0, x: 30, d: 0.35 }); sfx('thud', T('v1', { zh: '架构', en: 'architecture' }), { g: 0.6, p: -0.3 });

  // ── 软件包的线：按发布记录画台阶，每个发布一个刻度 ──
  const rows = R.rows.map(([tag, day, pre, major]) => ({ tag, x: X(frac(day)), pre, major }));
  let d = '', prev = null;
  for (const r of rows) { if (!prev) d += `M${r.x},${Y(r.major) + OFF}`; else if (r.major !== prev.major) d += ` L${r.x},${Y(prev.major) + OFF} L${r.x},${Y(r.major) + OFF}`; prev = r; }
  d += ` L${prev.x + 60},${Y(prev.major) + OFF}`;
  const pkg = svg('path', { d, fill: 'none', stroke: C.ac, 'stroke-width': 12, 'stroke-linejoin': 'miter' }, ov);
  const pkgLen = pkg.getTotalLength(); pkg.style.strokeDasharray = pkgLen;
  const ticks = rows.map((r) => svg('rect', { x: r.x - 3, y: Y(r.major) + OFF + (r.pre ? 12 : 10), width: 6, height: r.pre ? 16 : 30, fill: r.pre ? '#8fb4dd' : C.ac }, ov));
  const firsts = ['0', '1', '2', '3'].map((k) => { const [tag, day] = R.firsts[k]; return { tag, day, x: X(frac(day)), major: +k }; });
  const tP = T('v3', { zh: '软件版本号', en: 'package version' }) - 0.4;
  // 线画到哪里由时间决定：各节点在旁白读到它时到达
  // [时刻, 画到的 x, 是否连同这一处的竖线一起画上]。说到「那时」的那两句里，线停在 2.0.0 的台阶之前
  const stops = [[tP, firsts[0].x, 0], [T('v4', '1.0.0'), firsts[1].x + 2, 1], [Tend('v5'), firsts[2].x - 6, 0], [T('v6', '2.0.0'), firsts[2].x + 2, 1],
    [T('v7', { zh: '往上走', en: 'climbing' }) - 0.5, firsts[3].x - 6, 0], [T('v7', { zh: '往上走', en: 'climbing' }) + 0.1, prev.x + 60, 1]];
  const lenAtX = (x) => { let lo = 0, hi = pkgLen; for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (pkg.getPointAtLength(m).x < x) lo = m; else hi = m; } return hi; };
  const stopLen = stops.map(([t, x, riser], i) => [t, i === stops.length - 1 ? pkgLen : lenAtX(x) + (riser ? U : 0)]);
  F((t) => {
    let len = 0;
    for (let i = 0; i < stopLen.length; i++) { const [t1, l1_] = stopLen[i], [t0, l0] = i ? stopLen[i - 1] : [tP - 0.01, 0]; if (t >= t1) len = l1_; else if (t > t0) { len = lerp(l0, l1_, ease.io3((t - t0) / (t1 - t0))); break; } else break; }
    pkg.style.strokeDashoffset = pkgLen - len;
    const head = len > 0 ? pkg.getPointAtLength(len).x : -1e9;
    ticks.forEach((k, i) => { k.style.visibility = rows[i].x <= head + 1 ? 'visible' : 'hidden'; });
  });
  const lp = txt(root, 't-3', `<span style="display:inline-block;width:44px;height:14px;background:${C.ac};vertical-align:middle;margin-right:18px"></span>${tr('软件包版本', 'Package version')}`, 900, 44); lp.style.color = C.ac;
  const lpd = txt(root, 't-n', tr(`GitHub 上的 ${R.count} 个发布，每个一道刻度`, `${R.count} releases on GitHub, one tick each`), 964, 124); lpd.style.color = '#5c5c5c';
  wipe(lp, T('v3', { zh: '软件版本号', en: 'package version' }) - 0.15, { dir: 'l', d: 0.4 }); show(lpd, T('v3', { zh: '第一个', en: 'starting' }), { y: 0, x: 30, d: 0.35 }); sfx('thud', T('v3', { zh: '软件版本号', en: 'package version' }), { g: 0.6 });
  const sep = card(world, '', X(2020.3), Y(0) - 150, 500, 120, tr('2021：从 Windows 里分离', '2021: split from Windows')); sep.querySelector('.lab').classList.add('solo'); sep.querySelector('.lab').style.fontSize = LANG === 'zh' ? '38px' : '34px';
  slam(sep, T('v2', { zh: '分离', en: 'split' }), { from: 0.7, d: 0.45, ease: 'back.out(1.6)' }); sfx('pop', T('v2', { zh: '分离', en: 'split' }), { p: 0.2 });
  const tagAt = [[firsts[0], T('v3', '0.47.1')], [firsts[1], T('v4', '1.0.0')], [firsts[2], T('v6', '2.0.0')], [firsts[3], T('v7', { zh: '往上走', en: 'climbing' }) - 0.1]];
  tagAt.forEach(([f, t], i) => {
    const lab = h('div', 'chip ac', world, f.tag); px(lab, f.x + 16, Y(f.major) + OFF - 92); lab.style.fontSize = '40px';
    const dt = txt(world, 't-n dim', f.day, f.x + 20, Y(f.major) + OFF + 50); if (i === 0) px(dt, f.x + 200, Y(0) - 70);
    slam(lab, t, { from: 1.5, d: 0.3 }); show(dt, t + 0.2, { y: 0, x: -16, d: 0.3 }); sfx(i === 3 ? 'chime' : 'thud', t, { g: 0.7, p: 0.2 });
    clockAt(t, f.day);
  });
  // 「装的是 1.0.0，跑的是 WSL 2」：两条线之间的一道括线
  const xb = firsts[1].x + 230, br = svg('path', { d: `M${xb},${Y(1) - 2} L${xb},${Y(2) + 2}`, fill: 'none', stroke: C.bad, 'stroke-width': 8 }, ov);
  const b1 = txt(world, 't-4', tr('装的是 <span class="ac">1.0.0</span>', 'installed: <span class="ac">1.0.0</span>'), xb + 26, Y(1) + 56);
  const b2 = txt(world, 't-4', tr('跑的是 WSL 2', 'running: WSL 2'), xb + 26, Y(2) - 78);
  const t5 = T('v5');
  fromTo(br, t5, { strokeDasharray: U, strokeDashoffset: U }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }); appear(br, t5);
  wipe(b1, T('v5', { zh: '装的', en: 'installed' }), { dir: 'l', d: 0.35 }); wipe(b2, T('v5', { zh: '跑的', en: 'ran' }), { dir: 'l', d: 0.35 }); sfx('blip', t5, { g: 0.7 }); sfx('pop', T('v5', { zh: '跑的', en: 'ran' }), { g: 0.7 });
  [b1, b2].forEach((e) => wipeOut(e, T('v6') - 0.35, { dir: 'l', d: 0.3 })); vanish(br, T('v6') - 0.2);      // 2.0.0 的标签到来之前收走
  // 2025-05-19：源代码公开
  const xo = X(frac('2025-05-19')), oss = card(world, '', xo - 230, Y(2) - 250, 470, 120, tr('2025-05-19 · 源代码公开', '2025-05-19 · open source')); oss.querySelector('.lab').classList.add('solo'); oss.querySelector('.lab').style.fontSize = '34px';
  const om = svg('path', { d: `M${xo},${Y(2) - 124} L${xo},${Y(2) - 22}`, fill: 'none', stroke: '#1b1b1b', 'stroke-width': 5 }, ov);
  const tO = T('v6', { zh: '源代码', en: 'open source' });
  slam(oss, tO, { from: 0.7, d: 0.45, ease: 'back.out(1.6)' }); appear(om, tO + 0.2); sfx('pop', tO, { p: 0.3 }); clockAt(tO, '2025-05-19');
  // 结尾：一条停在 2，一条到了 3
  const stay = h('div', 'stamp', world, tr('架构：停在 2', 'architecture: stays at 2')); px(stay, X(2025.7), Y(2) + 70); stay.style.background = '#1b1b1b'; stay.style.fontSize = '40px';
  const up = h('div', 'stamp', world, tr('软件包：到了 3', 'package: reaches 3')); px(up, X(2025.7), Y(3) - 110); up.style.background = C.ac; up.style.fontSize = '40px';
  slam(stay, T('v7', { zh: '停在', en: 'stops' }), { from: 1.5, d: 0.3 }); slam(up, T('v7', { zh: '往上走', en: 'climbing' }) + 0.25, { from: 1.5, d: 0.3 }); sfx('pop', T('v7', { zh: '停在', en: 'stops' }));

  // ── 镜头：沿时间轴由左向右 ──
  const cx = (y) => X(y) - 75;       // 画面左侧 150px 被纵轴占着，画面中心相应右移
  cam.track(s.start, { x: cx(2017.9), y: 484, z: 1 }, [
    [c0, { x: cx(2018.05) }, T('v2') - c0 - 0.2, { ease: 'none', sfx: false }],
    [T('v2') - 0.15, { x: cx(2021.55) }, 1.3, { g: 0.5 }],
    [T('v2') + 1.2, { x: cx(2021.75) }, T('v4') - T('v2') - 1.5, { ease: 'none', sfx: false }],
    [T('v4') - 0.25, { x: cx(2023.0) }, 1.1, { g: 0.5 }],
    [T('v4') + 0.9, { x: cx(2023.25) }, T('v6') - T('v4') - 1.2, { ease: 'none', sfx: false }],
    [T('v6') - 0.25, { x: cx(2024.6) }, 1.3, { g: 0.5 }],
    [T('v6') + 1.1, { x: cx(2024.8) }, T('v7') - T('v6') - 1.4, { ease: 'none', sfx: false }],
    [T('v7') - 0.25, { x: cx(2026.0) }, 1.4, { g: 0.5 }],
    [T('v7') + 1.2, { x: cx(2026.15) }, s.end - T('v7') - 1.25, { ease: 'none', sfx: false }],
  ]);
});
