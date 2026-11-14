// 第 01 章 来历：为网站统计造的 → 先汇总的办法与局限 → OLAPServer → ClickHouse 的初衷 → 2014 年的量、2016 年开源 → 更早的分析型数据库与云 → 回到开头那几毫秒。
// 出处：官方文档 history.md、VLDB 2024 论文（research/FACTS.md 的 H01–H10）。
// 一个连续的画面：左边一直在流进来的「原始访问记录」，右边是 Metrica 的报表，中间换着放「汇总」「OLAPServer」「ClickHouse」；
// 底下一条按真实年份比例画的时间轴，讲到哪一年，黄色的游标走到哪一年。没有年份的说法（更早的分析型数据库）只放在时间轴左端的虚线段上。
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const fadeIn = (e, t, d = 0.45) => show(e, t, { y: 14, d });

  // ══ 时间轴（全章常驻） ══
  const AX = 868, X = (yr) => 520 + (yr - 2009) * 70, XNOW = 1760;
  const axis = mk(world, 'abs', 520, AX, XNOW - 520, 4); css(axis, { background: 'var(--g2)' }); wipe(axis, c0 + 0.1, { dir: 'l', d: 0.8 });
  const ticks = [[2009, '2009'], [2014, '2014'], [2016, '2016']].map(([yr, lab]) => {
    const tk = mk(world, 'tick', X(yr) - 1, AX - 10, 2, 24); css(tk, { width: '4px', left: (X(yr) - 2) + 'px' });
    const tx = mk(world, 'mono dim', X(yr) - 60, AX + 22, 120, null, lab); css(tx, { fontSize: '26px', textAlign: 'center' });
    appear(tk, c0 + 0.4); appear(tx, c0 + 0.4); return { tk, tx };
  });
  const nowTk = mk(world, 'tick', XNOW - 2, AX - 10, 4, 24); const nowTx = mk(world, 'mono dim', XNOW - 100, AX + 22, 200, null, '今天 · 26.8'); css(nowTx, { fontSize: '26px', textAlign: 'center' });
  appear(nowTk, c0 + 0.4); appear(nowTx, c0 + 0.4);
  // 游标：一个黄色方块，在讲到的年份之间移动
  const head = mk(world, 'abs', 0, AX - 12, 28, 28); css(head, { background: 'var(--y)' }); vanish(head, 0);
  const tY09 = T('h7', '二〇〇九年'), tY14 = T('h9a', '二〇一四年'), tY16 = T('h10', '二〇一六年'), tNow = T('h10c', '十三万亿');
  const HP = [[tY09, X(2009)], [tY14, X(2014)], [tY16, X(2016)], [tNow, XNOW]];
  appear(head, tY09 - 0.6);
  F((t) => {
    let x = X(2009);
    for (let i = 0; i < HP.length; i++) { const [ti, xi] = HP[i]; if (t >= ti - 0.6) { const k = ease.io3(clamp((t - (ti - 0.6)) / 0.6)); const xp = i ? HP[i - 1][1] : X(2009); x = xp + (xi - xp) * k; } }
    head.style.left = (x - 14) + 'px';
  });
  // 时间轴上方的事件标注（讲到才出现，之后留着）
  const ev = (x, text, t, cls = '') => { const e = mk(world, 'abs lab ' + cls, x - 160, AX - 62, 320, null, text); css(e, { textAlign: 'center', fontSize: '24px' }); fadeIn(e, t); return e; };
  ev(X(2009), 'OLAPServer', T('h7b', 'OLAPServer'));
  ev(X(2014), '约 120 亿次 / 天', T('h9a', '一百二十亿'));
  ev(X(2016), '开源', T('h10', '开源'), 'y');
  ev(XNOW - 40, '13 万亿+ 条记录', T('h10c', '十三万亿'));
  classAt(ticks[0].tx, 'y', tY09); classAt(ticks[1].tx, 'y', tY14); classAt(ticks[2].tx, 'y', tY16); classAt(nowTx, 'y', tNow);

  // ══ 左：原始访问记录，一条一条流进来（一直在流；二〇一四年那段流得更快） ══
  const LOG = mk(world, 'panel', 100, 140, 460, 640);
  mk(LOG, 'lab', 22, 18, null, null, '原始访问记录');
  mk(LOG, 't-note', 22, 56, null, null, '每一次浏览、点击，记一条');
  slide(LOG, c0 + 0.15, { x: -60 });
  const RH = 46, NR = 11;
  const clip = mk(LOG, 'abs', 18, 106, 424, NR * RH); css(clip, { overflow: 'hidden' });
  const pool = []; for (let i = 0; i <= NR; i++) pool.push(mk(clip, 'cell sm', 0, i * RH, 424, RH - 6, ''));
  const tLog = c0 + 0.3;
  const RATE = [[tLog, 1.3], [T('h9a', '一百二十亿'), 7], [T('h9b'), 2.2]];
  const posAt = (t) => { let p = NR + 1; for (let i = 0; i < RATE.length; i++) { const [a, r] = RATE[i]; const b = i + 1 < RATE.length ? RATE[i + 1][0] : Infinity; if (t <= a) break; p += (Math.min(t, b) - a) * r; } return p; };
  const recOf = (k) => ({ page: 'ABC'[k % 3], reg: 1 + ((k * 2) % 4) + (k % 5 === 4 ? 1 : 0), user: 1000 + ((k * 37) % 900) });
  const tHit0 = T('h2c', '某个地方'), tHit1 = T('h4');
  let lastKey = '';
  F((t) => {
    const p = posAt(t), first = Math.floor(p), fr = p - first, hit = t >= tHit0 && t < tHit1;
    const key = first + ':' + Math.round(fr * RH) + ':' + hit;
    if (key === lastKey) return; lastKey = key;
    pool.forEach((c, i) => {
      const k = first - NR + i, r = recOf(k);                            // 新的一条从下面进来，旧的往上走
      c.style.top = Math.round((i - fr) * RH) + 'px';
      c.style.visibility = k >= 0 ? 'visible' : 'hidden';
      const html = `<span>浏览 · 页面 ${r.page} · 地区 ${r.reg}</span><span>${r.user}</span>`;
      if (c._h !== html) { c.innerHTML = html; c._h = html; }
      c.classList.toggle('y', hit && r.page === 'A' && r.reg === 3);
    });
  });
  const logArrow = path(ov, 'M 572 596 L 1222 596', 'accent', { w: 4 });   // 原始记录 → 报表（现场算）
  vanish(logArrow, 0);

  // ══ 一：Yandex · Metrica · 现场生成报表 ══
  const ws = mk(world, 'h1', 640, 170, null, null, '网站统计'); const ws2 = mk(world, 't-note', 644, 250, null, null, '每一次浏览、点击都记下来'); fadeIn(ws, T('h1') + 0.2); fadeIn(ws2, T('h1') + 0.5);
  hide(ws, T('h1b', 'Yandex') - 0.4, { y: -8, d: 0.25 }); hide(ws2, T('h1b', 'Yandex') - 0.4, { y: -8, d: 0.25 });
  const yx = mk(world, 'tile', 640, 140, 520, 190); mk(yx, 'nm', 28, 24, null, null, 'Yandex');
  slide(yx, T('h1b', 'Yandex') - 0.15, { y: -40 }); sfx('pop', T('h1b', 'Yandex'), { g: 0.6 });
  [['搜索', T('h1b', '搜索')], ['电商', T('h1b', '电商')], ['广告', T('h1b', '广告')]].forEach(([n, t2], k) => { const p = mk(yx, 'pill', 28 + k * 150, 100, 130, 56, n); slam(p, t2 - 0.08, { from: 1.15 }); sfx('tick', t2, { g: 0.4 }); });
  const link = mk(world, 'abs', 700, 330, 4, 40); css(link, { background: 'var(--g2)' }); wipe(link, T('h1c', 'Metrica') - 0.2, { dir: 't', d: 0.3 });
  const mx = mk(world, 'tile', 640, 370, 520, 190); mk(mx, 'nm', 28, 24, null, null, 'Metrica'); mk(mx, 'sb', 28, 84, null, null, 'Yandex 的网站统计服务');
  slide(mx, T('h1c', 'Metrica') - 0.1, { y: 40 }); sfx('pop', T('h1c', 'Metrica'), { g: 0.6 });
  classAt(mx, 'y', T('h1c', 'Metrica') + 0.2, T('h4') - 0.3);
  const mxN = mk(mx, 'abs lab y', 28, 128, null, null, '全球第二大的网站统计平台'); css(mxN, { fontSize: '26px' }); fadeIn(mxN, T('h1d', '第二大') - 0.2);
  for (const e of [yx, link, mx]) hide(e, T('h4') - 0.3, { y: -10, d: 0.35 });

  // 报表面板（一直留到二〇一六年那一段）
  const RP = mk(world, 'panel', 1240, 140, 580, 480);
  mk(RP, 'lab', 24, 18, null, null, 'Metrica 的报表');
  slide(RP, T('h2') - 0.2, { x: 60 });
  const cA = mk(RP, 'pill', 24, 76, null, null, '地区：某个地方'), cB = mk(RP, 'pill', 290, 76, null, null, '页面：某个页面');
  slam(cA, T('h2', '划分') - 0.1, { from: 1.15 }); slam(cB, T('h2', '选条件') - 0.1, { from: 1.15 });
  sfx('pop', T('h2', '划分'), { g: 0.5 }); sfx('pop', T('h2', '选条件'), { g: 0.5 });
  classAt(cA, 'y', T('h2c', '某个地方'), T('h4')); classAt(cB, 'y', T('h2c', '某个页面'), T('h4'));
  const rL = mk(RP, 'lab', 24, 168, null, null, '不同的人有多少？');
  const rQ = mk(RP, 'huge y', 24, 210, null, null, '?'); css(rQ, { fontSize: '170px' });
  fadeIn(rL, T('h2c') - 0.1); slam(rQ, T('h2c', '多少'), { from: 1.3 }); sfx('thud', T('h2c', '多少') + 0.1, { g: 0.55 });
  const live = mk(RP, 'pill on', 24, 400, null, null, '现场生成'); slam(live, T('h2b', '现场') - 0.05, { from: 1.2 });
  arrowIn(logArrow, T('h2b', '现场') - 0.2, 0.7); sfx('whoosh', T('h2b', '现场') - 0.2, { g: 0.4 });
  for (const e of [rL, rQ, live]) hide(e, T('h4') - 0.25, { y: -8, d: 0.3 });

  // ══ 二：先汇总，再存汇总的结果 ══
  const tSum = T('h4', '先汇总');
  const SM = mk(world, 'panel', 640, 140, 520, 330);
  mk(SM, 'lab', 22, 18, null, null, '汇总：每个页面、每天的访问量');
  wipe(SM, tSum - 0.2, { dir: 'l', d: 0.5 });
  const smRows = [['页面 A', '第 1 天', 'N'], ['页面 B', '第 1 天', 'N'], ['页面 C', '第 1 天', 'N'], ['页面 A', '第 2 天', 'N']];
  const smR = smRows.map((r, i) => { const rw = rowAt(SM, 22, 70 + i * 62, r, [170, 200, 110], 54, 'w'); wipe(rw.row, tSum + 0.3 + i * 0.2, { dir: 'l', d: 0.35 }); classAt(rw.c[2], 'on', T('h4b', '提前算好') + i * 0.25, T('h4b', '直接取') + 0.6); return rw; });
  const a1 = path(ov, 'M 572 230 L 624 230', 'accent', { w: 4 }), a2 = path(ov, 'M 1172 230 L 1222 230', 'accent', { w: 4 });
  vanish(a1, 0); vanish(a2, 0);
  arrowIn(a1, tSum, 0.4); arrowIn(a2, T('h4b', '直接取') - 0.2, 0.4);
  set(logArrow, T('h4') - 0.2, { autoAlpha: 0 });
  // 报表改从汇总里直接取
  const rpRows = [['页面 A', 'N'], ['页面 B', 'N'], ['页面 C', 'N']].map((r, i) => { const rw = rowAt(RP, 24, 76 + i * 62, r, [300, 230], 54); vanish(rw.row, 0); appear(rw.row, T('h4b', '直接取') + 0.1 + i * 0.15); return rw; });
  for (const e of [cA, cB]) hide(e, T('h4') - 0.25, { y: -8, d: 0.3 });
  // 数据小了很多：两根长短不同的条（示意，不是实测比例）
  const BZ = mk(world, 'abs', 640, 650, 1180, 160); vanish(BZ, 0); appear(BZ, T('h4c') - 0.1);
  const bL1 = mk(BZ, 'lab', 0, 0, null, null, '原始记录'); const bRaw = mk(BZ, 'bar w', 300, 4, 860, 32);
  const bL2 = mk(BZ, 'lab y', 0, 60, null, null, '汇总之后'); const bSum = mk(BZ, 'bar y', 300, 64, 126, 32);
  const bTag = mk(BZ, 't-note', 300, 110, null, null, '示意'); void bL1; void bL2;
  wipe(bRaw, T('h4c') - 0.05, { dir: 'l', d: 0.6 }); wipe(bSum, T('h4c', '小了') - 0.1, { dir: 'l', d: 0.5 }); sfx('tick', T('h4c', '小了'), { g: 0.5 });
  const bg = mk(world, 'pill', 640, 490, null, null, '后台做 · 不赶时间'); slam(bg, T('h4c', '后台') - 0.05, { from: 1.15 }); sfx('pop', T('h4c', '后台'), { g: 0.5 });
  const most = mk(RP, 'note', 24, 300, null, null, '大多数报表\n靠这样的汇总'); fadeIn(most, T('h5', '大多数') - 0.1);
  warm(SM, T('h5'), T('h6') - 0.1);

  // ══ 三：汇总的代价 ══
  const tC = T('h6b', '事先');
  for (const r of rpRows) dimTo(r.row, tC - 0.3, 1, 0.25, 0.4);
  hide(most, tC - 0.3, { y: 0, d: 0.3 });
  const ok1 = mk(RP, 'pill', 24, 290, null, null, '页面 × 日期'), ok2 = mk(RP, 'pill', 230, 290, null, null, '地区 × 日期');
  const want = mk(RP, 'pill y', 24, 370, null, null, '用户自己组合的条件');
  slam(ok1, tC, { from: 1.1 }); slam(ok2, tC + 0.3, { from: 1.1 }); slam(want, T('h6b', '组合') - 0.1, { from: 1.15 });
  classAt(want, 'ghost', T('h6b', '做不到') - 0.05, T('h8b', '不汇总'));
  const noW = mk(RP, 'lab y', 340, 382, null, null, '没有现成的汇总'); fadeIn(noW, T('h6b', '做不到') - 0.05);
  keyed(noW).at(T('h8b', '不汇总'), { html: '从原始数据现场算' });
  // 比如网址：汇总条几乎和原始记录一样长
  const tU = T('h6d', '网址');
  const urlL = mk(BZ, 'lab', 0, 120, null, null, ''); void urlL;
  keyed(bL1).at(tU, { html: '原始记录（按网址）' }); keyed(bL2).at(tU, { html: '按网址汇总之后' });
  tl.fromTo(bSum, { width: 126 }, { width: 630, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, T('h6d', '汇总完'));
  keyed(bTag).at(T('h6d', '汇总完') + 0.4, { html: '不到两倍（官方文档）' });
  sfx('whoosh', T('h6d', '汇总完'), { g: 0.4 });
  hide(BZ, T('h7') + 0.2, { y: 0, d: 0.3 }); hide(bg, T('h7') + 0.2, { y: 0, d: 0.3 });
  for (const e of [ok1, ok2]) hide(e, T('h8') - 0.3, { y: 0, d: 0.3 });
  for (const e of [want, noW]) hide(e, T('h9', '用户') - 0.35, { y: 0, d: 0.3 });
  for (const r of rpRows) hide(r.row, T('h8') - 0.3, { y: 0, d: 0.3 });

  // ══ 四：二〇〇九年起，OLAPServer ══
  const tO = T('h7b', 'OLAPServer');
  dimTo(SM, T('h7') - 0.2, 1, 0.35, 0.5);
  const OS = mk(world, 'panel', 640, 500, 520, 300);
  const osN = mk(OS, 'nm', 22, 18, null, null, 'OLAPServer'); css(osN, { position: 'absolute', font: '800 44px "Inter"' });
  const osS = mk(OS, 't-note', 22, 76, null, null, '存没汇总过的原始数据');
  wipe(OS, T('h7', '分析库') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('h7', '分析库'), { g: 0.5 });
  const a3 = path(ov, 'M 572 650 L 624 650', 'accent', { w: 4 }); vanish(a3, 0); arrowIn(a3, tO - 0.1, 0.4);
  const LIM = [['只认数字', T('h7c', '只认')], ['新数据加不进去', T('h7c', '新数据')], ['每天整个重写一遍', T('h7d', '每天')]];
  const lims = LIM.map(([t, tt], i) => { const c = mk(OS, 'cell', 22, 126 + i * 56, 476, 48, '<span>' + t + '</span><span>限制</span>'); css(c, { fontSize: '26px' }); slide(c, tt - 0.1, { x: -30 }); sfx('tick', tt, { g: 0.5 }); return c; });
  // 「新数据加不进去」：箭头变成虚线；「每天重写」：面板从左到右刷一遍
  const a3d = path(ov, 'M 572 650 L 624 650', 'dim', { w: 4, dashed: '6 8', arrow: false }); vanish(a3d, 0);
  set(a3, T('h7c', '新数据') + 0.3, { autoAlpha: 0 }); set(a3d, T('h7c', '新数据') + 0.3, { autoAlpha: 1 });
  const rew = mk(OS, 'abs', 0, 0, 520, 300); css(rew, { background: 'rgba(250,255,105,.14)', transformOrigin: '0 50%' }); vanish(rew, 0); OS.insertBefore(rew, OS.firstChild);
  tl.fromTo(rew, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'none', immediateRender: false }, T('h7d', '每天'));
  set(rew, T('h7d', '每天') + 1.15, { autoAlpha: 0 });

  // ══ 五：ClickHouse 最初的目标：去掉这些限制 ══
  const tG = T('h8', '最初');
  keyed(osN).at(tG, { html: '<span class="y">ClickHouse</span>' });
  keyed(osS).at(tG, { html: '最初的目标：去掉这些限制' }).at(T('h10b', '通用') - 0.05, { html: '<span class="y">后来：通用的分析型数据库</span>' });
  classAt(OS, 'y', tG);
  const GOAL = [['所有报表，直接从原始数据算', T('h8b', '不汇总')], ['什么类型的数据都能存', T('h8c', '类型')], ['新数据随时能加', T('h8c', '新数据')]];
  lims.forEach((c, i) => {
    keyed(c).at(GOAL[i][1] - 0.05, { html: '<span>' + GOAL[i][0] + '</span><span>目标</span>', cls: 'cell y' });
    sfx('pop', GOAL[i][1], { g: 0.55, p: 0.3 });
  });
  set(a3d, T('h8c', '新数据'), { autoAlpha: 0 }); set(a3, T('h8c', '新数据'), { autoAlpha: 1 });
  // 不汇总：汇总面板退场，报表直接从 ClickHouse 来
  hide(SM, T('h8b', '不汇总'), { y: -10, d: 0.4 }); hide(a1, T('h8b', '不汇总'), { y: 0, d: 0.3 }); hide(a2, T('h8b', '不汇总'), { y: 0, d: 0.3 });
  const a4 = path(ov, 'M 1172 650 C 1206 650 1206 560 1222 500', 'accent', { w: 4 }); vanish(a4, 0); arrowIn(a4, T('h8b', '直接') - 0.1, 0.5);

  // ══ 六：二〇一四年：现场算，要算得极快 ══
  // 中间上方：二〇一四年一天的量；后面换成今天库里的记录数
  const bigN = mk(world, 'big y', 640, 150, null, null, '约 120 亿'); css(bigN, { fontSize: '104px' }); slam(bigN, T('h9a', '一百二十亿') - 0.1, { from: 1.15 }); sfx('thud', T('h9a', '一百二十亿'), { g: 0.5 });
  const bigL = mk(world, 'lab', 646, 272, null, null, '次浏览和点击 / 天 · 二〇一四年四月'); appear(bigL, T('h9a', '一百二十亿') + 0.2);
  keyed(bigN).at(T('h10c') - 0.1, { html: '13 万亿+' }); keyed(bigL).at(T('h10c') - 0.1, { html: 'Metrica 库里的记录（官方文档）' });
  hide(bigN, T('h11') - 0.3, { y: -10, d: 0.4 }); hide(bigL, T('h11') - 0.3, { y: -10, d: 0.4 });
  const pq = mk(RP, 'lab', 24, 76, null, null, '一次查询'); fadeIn(pq, T('h9b', '一次查询') - 0.1);
  const pv = mk(RP, 'h1 y', 24, 116, null, null, '几百毫秒'); fadeIn(pv, T('h9b', '几百毫秒') - 0.1);
  const pr = mk(RP, 'h2', 24, 196, null, null, '扫过几百万行'); fadeIn(pr, T('h9b', '几百万行') - 0.1);
  // 用户在等：一条进度条走到头
  const wl = mk(RP, 'lab', 24, 290, null, null, '用户在等着看结果'); fadeIn(wl, T('h9', '用户') - 0.1);
  const wb0 = mk(RP, 'bar', 24, 340, 530, 24); const wb = mk(RP, 'bar y', 24, 340, 530, 24); css(wb, { transformOrigin: '0 50%' });
  vanish(wb0, 0); appear(wb0, T('h9', '用户')); vanish(wb, 0);
  tl.fromTo(wb, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.out', immediateRender: false }, T('h9', '现场'));
  const fast = mk(RP, 'tag', 24, 386, null, null, '极快'); css(fast, { fontSize: '60px', padding: '8px 26px' });
  slam(fast, T('h9', '极快'), { from: 1.3 }); sfx('thud', T('h9', '极快') + 0.1, { g: 0.6 });

  // ══ 七：二〇一六年开源 → 通用的分析型数据库 → 今天 ══
  sfx('pop', T('h10b', '通用'), { g: 0.5 });

  // ══ 八：分析型数据库，也不是 ClickHouse 才有 ══
  const tE = T('h11') - 0.3;
  for (const e of [LOG, RP, OS]) hide(e, tE, { y: -12, d: 0.4 });
  for (const p of [a3, a4]) hide(p, tE, { y: 0, d: 0.3 });
  // 时间轴左端补一段虚线：「更早」，没有具体年份
  const early = mk(world, 'abs', 100, AX + 1, 400, 2); css(early, { borderTop: '3px dashed var(--g3)' }); wipe(early, T('h11') - 0.1, { dir: 'r', d: 0.6 });
  const earlyTx = mk(world, 'mono dim', 200, AX + 22, 200, null, '更早'); css(earlyTx, { fontSize: '26px', textAlign: 'center' }); appear(earlyTx, T('h11') + 0.2);
  // 三个年代的盒子，各自用一条细线落到时间轴上
  const ERA = (x, w, title, names, foot, t0, x0, cls = '', yEnd = AX, hh = 440) => {
    const b = mk(world, 'panel ' + cls, x, 180, w, hh);
    const tt = mk(b, 'badge', 24, 18, null, null, title); css(tt, { fontSize: '26px', padding: '8px 14px' });
    const cells = names.map((n, i) => { const c = mk(b, 'cell w', 24, 76 + i * 66, w - 48, 56, '<span>' + n + '</span>'); wipe(c, t0 + 0.3 + i * 0.55, { dir: 'l', d: 0.3 }); classAt(c, 'on', t0 + 0.3 + i * 0.55, t0 + 0.75 + i * 0.55); return c; });
    wipe(b, t0, { dir: 'b', d: 0.5 });
    const ln = mk(world, 'abs', x0 - 1, 180 + hh, 3, yEnd - 180 - hh); css(ln, { background: cls ? 'var(--y)' : 'var(--g2)' }); wipe(ln, t0 + 0.2, { dir: 't', d: 0.4 });
    return { b, cells, ln, foot };
  };
  const E1 = ERA(100, 400, '更早的', ['Teradata', 'Vertica', 'Sybase IQ', 'Greenplum'], null, T('h11') + 0.1, 300, '', AX, 520);
  const f1 = [['贵', T('h11b', '又贵')], ['装在自家机房', T('h11b', '机房')], ['数据批量导入', T('h11c', '批量')]].map(([t2, tt], k) => { const p = mk(E1.b, 'pill on', 24, 346 + k * 54, null, null, t2); css(p, { height: '48px', fontSize: '26px' }); slam(p, tt - 0.1, { from: 1.15 }); sfx('tick', tt, { g: 0.5 }); return p; });
  void f1;
  const E2 = ERA(560, 380, '二〇一〇年代初 · 云上', ['Snowflake', 'BigQuery', 'Redshift'], null, T('h11d') - 0.1, 700, '', AX - 8);
  const e2n = mk(E2.b, 'note', 24, 290, null, null, '云数据仓库 · DBaaS\n分析的成本与复杂度\n大大降了下来'); fadeIn(e2n, T('h11d', '云上') + 0.8);
  const cloudBr = mk(world, 'abs', X(2010), AX - 6, X(2013) - X(2010), 14); css(cloudBr, { borderTop: '3px solid var(--g3)', borderLeft: '3px solid var(--g3)', borderRight: '3px solid var(--g3)' }); wipe(cloudBr, T('h11d') + 0.2, { dir: 'l', d: 0.4 });
  const E3 = ERA(1000, 520, 'ClickHouse', [], null, T('h11f', '另一条路') - 0.2, X(2016), 'y', AX - 66);
  const e3a = mk(E3.b, 'h2 y', 24, 90, null, null, '开源'); fadeIn(e3a, T('h11f', '开源') - 0.1);
  const e3b = mk(E3.b, 'h2', 24, 160, null, null, '一个程序就能跑'); fadeIn(e3b, T('h11f', '一个程序') - 0.3);
  const e3c = mk(E3.b, 'note', 24, 250, null, null, '建表、查询\n一个程序全包'); fadeIn(e3c, T('h11f', '开源') + 0.3);
  sfx('chime', T('h11f', '开源'), { g: 0.4 });

  // ══ 九：回到开头那几毫秒 ══
  const tBack = T('h12') + 0.1;
  for (const E of [E1, E2, E3]) { hide(E.b, tBack, { y: -12, d: 0.4 }); hide(E.ln, tBack, { y: 0, d: 0.3 }); }
  hide(cloudBr, tBack, { y: 0, d: 0.3 });
  const g8 = mk(world, 'huge y', 640, 190, null, null, '8 ms'); css(g8, { fontSize: '280px' }); slam(g8, T('h12', '开头'), { from: 1.25 }); sfx('thud', T('h12', '开头') + 0.1, { g: 0.6 });
  const gq = mk(world, 'h1', 640, 500, null, null, '它是怎么存数据的？'); fadeIn(gq, T('h12b') - 0.1);
  const eng = mk(world, 'abs term', 640, 620, 1000, 130);
  eng.innerHTML = '<span class="pr">:) </span>CREATE TABLE users (…)\n   <b>ENGINE</b> = …';
  wipe(eng, T('h12b', '建表') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('h12b', '一个词'), { g: 0.5 });
  for (const e of [g8, gq]) classAt(e, 'fade45', Tend('h12b') + 0.2);
  const engHi = mk(world, 'abs', 708, 676, 113, 50); css(engHi, { border: '4px solid var(--y)' }); vanish(engHi, 0); wipe(engHi, T('h12b', '一个词') - 0.05, { dir: 'l', d: 0.3 });

  drift(cam, s, -1);
});
