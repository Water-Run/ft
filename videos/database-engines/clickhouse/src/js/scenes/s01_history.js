// 第 01 章 来历（r8 重画：把事情演出来，少用字）。
// 一个连续的舞台：左上一个网站，访客点一下，左下就多一条访问记录（地点、页面、时间、谁）；右边是 Metrica 的报表窗口；
// 中间依次换：Yandex 的搜索页与几项服务 → 汇总（漏斗；夜里在后台算）→ OLAPServer（只认数字、新数据进不去、每夜重写）→ ClickHouse（三个限制被一个个打掉）。
// 虚线框是 Yandex：二〇二一年 ClickHouse 从框里分出来。底下一条时间轴从 1997 年画起，黄色游标走到讲到的年份。
// 出处：research/FACTS.md 的 H01–H15。记录内容是示意（地点、页面、时间都是编的样子），不是实测。
scene('history', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const at = (e, t) => { vanish(e, 0); appear(e, t); return e; };
  const fadeIn = (e, t, d = 0.45) => show(e, t, { y: 14, d });
  const bz = (P, u) => { const m = 1 - u, [a, b, c, d] = P; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };
  // 一串小方块沿曲线流动（数据在走）：从 t0 起一个接一个出发，t1 之后不再出发，已出发的走完
  const flow = (P, n, t0, t1, per = 1.4, size = 14, cls = '') => {
    const ds = []; for (let i = 0; i < n; i++) { const d = mk(world, 'fdot ' + cls, 0, 0, size, size); d.style.visibility = 'hidden'; ds.push(d); }
    F((t) => ds.forEach((d, i) => {
      const u0 = (t - t0) / per - i / n; let vis = u0 >= 0;
      const c = Math.floor(u0), st = t0 + (c + i / n) * per; if (st > t1) vis = false;
      if (!vis) { if (d.style.visibility !== 'hidden') d.style.visibility = 'hidden'; return; }
      const [x, y] = bz(P, u0 - c); d.style.visibility = 'visible'; d.style.left = (x - size / 2).toFixed(1) + 'px'; d.style.top = (y - size / 2).toFixed(1) + 'px';
    }));
    return ds;
  };

  // ══ 时间轴：1997 → 今天（全章常驻） ══
  const AX = 868, X = (yr) => 200 + (yr - 1997) * 52, XNOW = 1760;
  const axis = mk(world, '', 200, AX, XNOW - 200, 4); css(axis, { background: 'var(--g2)' }); wipe(axis, c0 + 0.1, { dir: 'l', d: 0.8 });
  const tY97 = T('h1b2', '一九九七'), tY09 = T('h7', '二〇〇九'), tY14 = T('h9a', '二〇一四'), tY16 = T('h10', '二〇一六'), tY21 = T('h10a', '二〇二一'), tNow = T('h10c', '十三万亿');
  const YRS = [[1997, tY97], [2009, tY09], [2014, tY14], [2016, tY16], [2021, tY21]];
  YRS.forEach(([yr, ty]) => {
    const tk = mk(world, 'tick', X(yr) - 2, AX - 10, 4, 24); appear(tk, c0 + 0.4);
    const tx = mk(world, 'mono dim', X(yr) - 60, AX + 22, 120, null, String(yr)); css(tx, { fontSize: '26px', textAlign: 'center' }); appear(tx, c0 + 0.4); classAt(tx, 'y', ty - 0.3);
  });
  const nowTk = mk(world, 'tick', XNOW - 2, AX - 10, 4, 24); appear(nowTk, c0 + 0.4);
  const nowTx = mk(world, 'mono dim', XNOW - 180, AX + 22, 200, null, '今天 · 26.8'); css(nowTx, { fontSize: '26px', textAlign: 'right' }); appear(nowTx, c0 + 0.4); classAt(nowTx, 'y', tNow - 0.3);
  // 游标与它头上的一句：讲到哪一年，游标走到哪一年
  const HP = [[tY97, X(1997)], [tY09, X(2009)], [tY14, X(2014)], [tY16, X(2016)], [tY21, X(2021)], [tNow, XNOW]];
  const head = mk(world, '', 0, AX - 12, 28, 28); css(head, { background: 'var(--y)' }); vanish(head, 0); appear(head, tY97 - 0.6);
  const hl = mk(world, 'lab y', 0, AX - 46, 360, null, ''); css(hl, { fontSize: '24px', textAlign: 'center' }); vanish(hl, 0); appear(hl, tY97 - 0.3);
  keyed(hl).at(tY97 - 0.3, { html: 'Yandex 搜索上线' }).at(tY09 - 0.3, { html: 'OLAPServer' }).at(tY14 - 0.3, { html: '一天约 120 亿次' }).at(tY16 - 0.3, { html: '开源' }).at(tY21 - 0.3, { html: '独立成公司' }).at(tNow - 0.3, { html: '13 万亿+ 条记录' });
  F((t) => {
    let x = X(1997);
    for (let i = 0; i < HP.length; i++) { const [ti, xi] = HP[i]; if (t >= ti - 0.6) { const k = ease.io3(clamp((t - (ti - 0.6)) / 0.6)); const xp = i ? HP[i - 1][1] : X(1997); x = xp + (xi - xp) * k; } }
    head.style.left = (x - 14) + 'px'; hl.style.left = clamp(x - 180, 100, 1460) + 'px';
  });

  // ══ 左上：一个网站，访客在点；左下：每点一下，多一条访问记录 ══
  const W = winAt(world, 100, 140, 496, 270, '一个网站');
  slide(W.el, c0 + 0.15, { x: -60 });
  const pg = W.body;
  [[16, 14, 460, 28], [16, 58, 280, 16], [16, 86, 320, 16], [16, 114, 240, 16], [316, 58, 160, 150], [16, 150, 280, 58]].forEach(([x, y, w, hh], i) => { const b = mk(pg, '', x, y, w, hh); css(b, { background: i === 0 || i === 4 ? '#2E2E29' : '#262622' }); });
  const LOG = mk(world, 'panel', 100, 430, 496, 336);
  slide(LOG, c0 + 0.3, { x: -60 });
  const RH = 46, NR = 9;
  const clip = mk(LOG, '', 10, 10, 472, 316); css(clip, { overflow: 'hidden' });   // 正好放下 7 行：只有新的一条滑进来的那一下，最下面一行才被裁半截
  const pool = []; for (let i = 0; i < NR; i++) pool.push(mk(clip, 'rec', 0, 0, 472, RH - 6, ''));
  const tLog = c0 + 0.5;
  const RATE = [[tLog, 1.2], [T('h9a', '一百二十亿') - 0.2, 9], [T('h9b') + 0.2, 2]];
  const posAt = (t) => { let p = 0; for (let i = 0; i < RATE.length; i++) { const [a, r] = RATE[i]; const b = i + 1 < RATE.length ? RATE[i + 1][0] : Infinity; if (t <= a) break; p += (Math.min(t, b) - a) * r; } return p; };
  const PGS = ['/news', '/shop', '/search', '/about', '/news'], CTY = ['莫斯科', '喀山', '索契', '萨马拉', '喀山'];
  const recOf = (k) => {
    const forced = k % 4 === 1;
    const page = forced ? '/news' : PGS[(k * 3 + 2) % 5], city = forced ? '喀山' : CTY[(k * 7 + 3) % 5];
    const uid = forced ? 2000 + ((k >> 2) % 5) * 13 : 1000 + ((k * k * 7 + k * 3) % 41) * 17;
    const ts = 36000 + k * 37;
    return { page, city, uid, url: page + '/' + (100 + ((k * 263) % 900)), time: pad2((ts / 3600) | 0) + ':' + pad2(((ts / 60) | 0) % 60) };
  };
  const isHit = (r) => r.page === '/news' && r.city === '喀山';
  const tHit0 = T('h2c', '某个页面') + 0.2, tHit1 = T('h4') - 0.2;
  const tUrl0 = T('h6d', '网址') - 0.1, tUrl1 = T('h7') + 0.3;
  // 点击：最近三次点击各留一个扩散的圈；光标停在最新一次点击处
  const SPOT = (k) => [40 + ((k * 151) % 380), 20 + ((k * 89) % 160)];
  css(pg, { overflow: 'hidden' });
  const rings = [0, 1, 2].map(() => { const r = mk(pg, '', 0, 0, 10, 10); css(r, { border: '3px solid var(--y)', borderRadius: '50%' }); r.style.visibility = 'hidden'; return r; });
  const curI = ico(pg, 'cursor', 0, 0, 34, 'w', 3.4); curI.style.visibility = 'hidden';
  let lastKey = '';
  F((t) => {
    const p = posAt(t), first = Math.floor(p), fr = p - first, live = t >= tLog;
    const key = first + ':' + Math.round(fr * 40) + ':' + (t >= tHit0 && t < tHit1) + ':' + (t >= tUrl0 && t < tUrl1);
    if (key === lastKey) return; lastKey = key;
    const fast = t >= RATE[1][0] && t < RATE[2][0];
    const e = fast ? fr : ease.out3(clamp(fr / 0.3));          // 点一下，这一条马上进来（和点击的圈同时）
    pool.forEach((c, i) => {
      const k = first - i, y = (i - 1 + e) * RH;                 // 新的一条从上面进来，旧的往下走
      if (!live || k < 0) { c.style.visibility = 'hidden'; return; }
      c.style.visibility = 'visible'; c.style.top = y.toFixed(1) + 'px';
      const r = recOf(k), url = t >= tUrl0 && t < tUrl1;
      const col = (ic, tx, w) => icoTxt(ic, tx).replace('class="it2"', `class="it2" style="width:${w}px"`);
      const html = col('pin', r.city, 100) + (url ? col('doc', r.url, 190) : col('doc', r.page, 124) + col('clock', r.time, 96)) + `<span class="it2 uid">${icoSvg('person', 20, 3.6)}<span>${r.uid}</span></span>`;
      if (c._h !== html) { c.innerHTML = html; c._h = html; }
      c.classList.toggle('y', t >= tHit0 && t < tHit1 && isHit(r));
    });
    rings.forEach((r, j) => {
      const k = first - j, age = j + fr;
      if (!live || k < 0 || age > 2.2 || (fast && j > 0)) { r.style.visibility = 'hidden'; return; }
      const [sx, sy] = SPOT(k), rad = 8 + age * 22;
      r.style.visibility = 'visible'; r.style.left = (sx - rad) + 'px'; r.style.top = (sy - rad) + 'px'; r.style.width = r.style.height = (2 * rad) + 'px'; r.style.opacity = String(Math.max(0, 1 - age / 2.2).toFixed(2));
    });
    const [cx, cy] = SPOT(first); curI.style.visibility = live && !fast ? 'visible' : 'hidden'; curI.style.left = (cx - 6) + 'px'; curI.style.top = (cy - 4) + 'px';
  });
  const fieldsT = T('h1', '网站统计') + 0.3;   // 记录里的四项：地点、页面、时间、谁（图标代替列名）
  const fHi = mk(LOG, '', 6, 6, 480, 44); css(fHi, { border: '3px solid var(--y)' }); vanish(fHi, 0); appear(fHi, fieldsT); vanish(fHi, fieldsT + 1.6);

  // ══ 右：报表窗口（先叫「网站统计」，讲到 Metrica 时换名） ══
  const D = winAt(world, 1250, 170, 570, 470, '网站统计');
  slide(D.el, T('h1', '网站统计') - 0.2, { x: 60 });
  keyed(D.ti).at(T('h1c', 'Metrica') - 0.1, { html: 'Metrica' }).at(T('h1d', '第二大') - 0.1, { html: `<span class="it2">${icoSvg('medal', 28, 3.2)}<span>Metrica · 全球第二大的网站统计平台</span></span>` }).at(T('h2c') - 0.2, { html: 'Metrica · 报表' });
  classAt(D.el, 'y', T('h1c', 'Metrica') - 0.1, T('h2') + 0.2);
  sfx('pop', T('h1d', '第二大'), { g: 0.5 });
  const DB = D.body;
  const grp = (t0, t1) => { const g = mk(DB, '', 0, 0, 566, 426); vanish(g, 0); appear(g, t0); if (t1 != null) vanish(g, t1); return g; };
  // 页面访问量的柱子：按记录流现场数出来（三根柱子随记录涨）
  const barsLive = (g, t0) => {
    const PG3 = ['/news', '/shop', '/search'], bs = [];
    PG3.forEach((pn, i) => {
      const b = mk(g, 'bar w', 70 + i * 160, 0, 110, 10); b.style.top = '340px';
      const l = mk(g, 'mono dim', 60 + i * 160, 356, 130, null, pn); css(l, { fontSize: '24px', textAlign: 'center' });
      bs.push(b);
    });
    let last = '';
    F((t) => {
      const p = Math.floor(posAt(Math.max(t, t0))), cnt = [0, 0, 0];
      for (let k = Math.max(0, p - 60); k < p; k++) { const j = PG3.indexOf(recOf(k).page); if (j >= 0) cnt[j]++; }
      const mx = Math.max(6, ...cnt), key = cnt.join(',');
      if (key === last) return; last = key;
      bs.forEach((b, i) => { const hh = Math.round(20 + 280 * cnt[i] / mx); b.style.height = hh + 'px'; b.style.top = (340 - hh) + 'px'; });
    });
  };
  const tWho = T('h2c', '某个地方') + 0.3;
  const gBars = grp(T('h1', '网站统计') + 0.2, null); hide(gBars, tWho - 0.1, { y: 30, d: 0.4 });
  barsLive(gBars, T('h1', '网站统计'));
  // 记录 → 报表：现场算
  const aLive = path(ov, 'M 572 640 L 1236 640', 'accent', { w: 4 }); vanish(aLive, 0);
  const tLiveA = T('h2b', '现场') - 0.25;
  arrowIn(aLive, tLiveA, 0.6); sfx('whoosh', tLiveA, { g: 0.4 });
  const boltA = ico(world, 'bolt', 880, 576, 56, 'y', 3.4); vanish(boltA, 0); slam(boltA, T('h2b', '现场'), { from: 1.6 });
  const flA = flow([[572, 640], [800, 640], [1000, 640], [1236, 640]], 5, tLiveA + 0.4, T('h4') - 0.6, 1.0);
  void flA;
  for (const e of [aLive, boltA]) hide(e, T('h4') - 0.3, { y: 0, d: 0.3 });
  // 自己划分人群、自己选条件：上面一条筛选栏，两个条件拖进去
  const fb = mk(DB, '', 16, 12, 534, 52); css(fb, { border: '2px dashed var(--g2)' }); vanish(fb, 0); wipe(fb, T('h2', '划分') - 0.2, { dir: 'l', d: 0.4 });
  const fI = ico(DB, 'search', 28, 22, 32, '', 3.4); vanish(fI, 0); appear(fI, T('h2', '划分')); vanish(fI, T('h4') - 0.1); vanish(fb, T('h4') - 0.1);
  const cA = mk(DB, 'chip y', 76, 18, null, null, icoTxt('pin', '喀山', 22)), cB = mk(DB, 'chip y', 236, 18, null, null, icoTxt('doc', '/news', 22));
  const tFb1 = T('h4') - 0.3;
  const dragIn = (c, t) => { motion(c, [[0, { y: 150, a: 0 }], [t - 0.45, { y: 150, a: 0 }], [t - 0.44, { y: 150, a: 1 }], [t, { y: 0 }], [tFb1, { y: 0, a: 1 }], [tFb1 + 0.25, { y: -10, a: 0 }]]); sfx('pop', t, { g: 0.5 }); };
  dragIn(cA, T('h2', '划分') + 0.1); dragIn(cB, T('h2', '选条件') + 0.1);
  const dCur = ico(DB, 'cursor', 0, 0, 34, 'w', 3.4);
  motion(dCur, [[0, { x: 150, y: 220, a: 0 }], [T('h2', '划分') - 0.5, { a: 0 }], [T('h2', '划分') - 0.45, { a: 1 }], [T('h2', '划分') + 0.1, { x: 150, y: 70 }], [T('h2', '选条件') - 0.45, { x: 300, y: 220 }], [T('h2', '选条件') + 0.1, { x: 300, y: 70 }], [T('h2b'), { x: 300, y: 70, a: 1 }], [T('h2b') + 0.3, { a: 0 }]]);
  for (const c of [cA, cB]) classAt(c, 'on', T('h2c', c === cA ? '某个地方' : '某个页面') - 0.05, T('h4') - 0.3);
  // 有多少个不同的人：符合条件的记录在左边亮起，同一个人只算一次
  const gWho = grp(tWho + 0.25, null); hide(gWho, T('h4') - 0.4, { y: -16, d: 0.35 });
  const who = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ico(gWho, 'person', 30 + i * 64, 120, 60, 'y', 3.2));
  const visN = mk(gWho, 'lab', 30, 220, null, null, ''); const visS = mk(gWho, 'lab', 200, 220, null, null, '同一个人只算一次：'); void visS; const whoN = mk(gWho, 'big y', 30, 270, null, null, ''); css(whoN, { fontSize: '110px' });
  let lastW = '';
  F((t) => {
    const p = Math.floor(posAt(Math.min(t, T('h2c', '多少')))), u = new Set(); let n = 0;   // 报表是那一刻现场算的：数到那一刻为止
    for (let k = 0; k < p; k++) { const r = recOf(k); if (isHit(r)) { n++; u.add(r.uid); } }
    const key = n + ':' + u.size; if (key === lastW) return; lastW = key;
    who.forEach((w, i) => { w.style.visibility = i < u.size ? 'visible' : 'hidden'; });
    visN.innerHTML = `${n} 次访问`; whoN.innerHTML = `${u.size} <span style="font-size:56px">人</span>`;
  });
  sfx('thud', T('h2c', '多少') + 0.1, { g: 0.5 });

  // ══ 中：Yandex 的搜索页（俄罗斯最大的搜索引擎，1997 年上线，总部在莫斯科）与几项服务 ══
  const YF = mk(world, 'yfr', 624, 128, 1216, 690); const yfl = mk(YF, 'yl', 0, 0, null, null, 'Yandex'); void yfl;
  vanish(YF, 0); wipe(YF, T('h1b', 'Yandex') - 0.3, { dir: 'l', d: 0.6 });
  const YS = winAt(world, 650, 170, 540, 220, 'yandex.ru');
  slide(YS.el, T('h1b', 'Yandex') - 0.15, { y: -40 }); sfx('pop', T('h1b', 'Yandex'), { g: 0.6 });
  const sbox = mk(YS.body, '', 28, 50, 360, 64); css(sbox, { border: '3px solid var(--y)' });
  const sI = ico(sbox, 'search', 14, 12, 36, 'y', 3.4); void sI;
  const sTx = mk(sbox, 'mono', 64, 14, 280, null, ''); css(sTx, { fontSize: '28px', color: 'var(--w)' });
  typeText(sTx, 'погода', T('h1b', '搜索引擎') - 0.3, 12, { cursor: false, sfxGain: 0.4 });
  const sBtn = mk(YS.body, 'chip on', 398, 50, 112, 64, 'Найти'); css(sBtn, { height: '64px', fontSize: '26px', justifyContent: 'center' });
  classAt(sBtn, 'y', T('h1b', '最大') - 0.05, T('h1b', '最大') + 0.25);
  const sNote = mk(YS.body, 't-note', 28, 128, null, null, '俄罗斯最大的搜索引擎'); css(sNote, { fontSize: '24px' }); fadeIn(sNote, T('h1b', '俄罗斯') - 0.1);
  const pinL = mk(YS.body, 'lab y', 310, 122, null, null, icoTxt('pin', '总部 莫斯科', 30)); css(pinL, { fontSize: '26px' }); vanish(pinL, 0); show(pinL, T('h1b2', '莫斯科') - 0.3, { y: -24, d: 0.35 }); sfx('tick', T('h1b2', '莫斯科'), { g: 0.5 });
  const pinM = pinL;
  // 它的几项服务；其中的统计服务就是 Metrica（一条线连到右边的报表窗口）
  const SV = [['search', '搜索'], ['cart', '电商'], ['ad', '广告'], ['chart', 'Metrica']];
  const tSv = T('h1b2') + 0.9, tMx = T('h1c', 'Metrica');
  const svs = SV.map(([ic, nm], i) => {
    const b = mk(world, 'tile', 650 + i * 138, 430, 124, 124); ico(b, ic, 32, 14, 56, i === 3 ? 'y' : '', 3.2);
    const l = mk(b, 'lab', 0, 80, 120, null, nm); css(l, { fontSize: i === 3 ? '22px' : '24px', textAlign: 'center' });
    slide(b, tSv + i * 0.12, { y: 24 }); sfx('tick', tSv + i * 0.12, { g: 0.35 });
    if (i === 3) classAt(b, 'y', tMx - 0.15);
    return b;
  });
  const aMx = path(ov, 'M 1194 492 L 1242 492', 'accent', { w: 4 }); vanish(aMx, 0); arrowIn(aMx, tMx - 0.1, 0.5);
  const tYout = T('h2') - 0.4;
  for (const e of [YS.el, pinM, pinL, ...svs]) if (e !== pinM) hide(e, tYout, { y: -12, d: 0.35 });
  hide(aMx, tYout, { y: 0, d: 0.3 });

  // ══ 先汇总，再存汇总的结果：记录流进漏斗，出来一张小表；报表从小表里直接取 ══
  const tSum = T('h4', '先汇总');
  const fun = path(ov, 'M 700 196 L 1100 196 L 930 318 L 870 318 Z', 'line', { w: 4, arrow: false }); css(fun, { fill: 'rgba(250,255,105,.06)' });
  vanish(fun, 0); arrowIn(fun, tSum - 0.3, 0.6);
  const funL = mk(world, 'h2', 840, 210, 120, null, 'Σ'); css(funL, { textAlign: 'center', fontSize: '52px' }); at(funL, tSum);
  const P_in = [[608, 600], [700, 600], [640, 236], [728, 236]];
  const aIn = path(ov, 'M 608 600 C 700 600 640 236 728 236', 'line', { w: 4 }); vanish(aIn, 0); arrowIn(aIn, tSum - 0.2, 0.5);
  flow(P_in, 6, tSum, T('h6d', '网址') - 0.4, 1.3);
  flow([[900, 230], [900, 260], [900, 300], [900, 352]], 3, tSum + 0.6, T('h6d', '网址') - 0.4, 0.9, 12);
  // 汇总表：每个页面、每天的访问量（数是示意，用条的长短表示）
  const SM = mk(world, 'panel', 724, 356, 352, 236); at(SM, tSum + 0.3);
  const smHead = mk(SM, '', 14, 10, 320, 34, icoTxt('doc', '页面', 22) + '<span style="margin:0 10px">×</span>' + icoTxt('calendar', '天', 22)); css(smHead, { font: '600 22px/34px "Sans SC"', color: 'var(--g3)' });
  const smLabs = [];
  const SMR = [['/news', 1, 0.8], ['/shop', 1, 0.45], ['/search', 1, 0.62], ['/news', 2, 0.7]];
  const smBars = SMR.map(([pn, d, v], i) => {
    const l = mk(SM, 'mono', 14, 54 + i * 44, 200, null, pn + ' 第' + d + '天'); css(l, { fontSize: '22px', color: 'var(--w)' });
    const b = mk(SM, 'bar y', 200, 58 + i * 44, 130 * v, 22); wipe(b, tSum + 0.6 + i * 0.25, { dir: 'l', d: 0.8 });
    appear(l, tSum + 0.5 + i * 0.25); smLabs.push(l); return b;
  });
  void smBars;
  // 用户来看时直接取：小表 → 报表
  const tTake = T('h4b', '直接取');
  const aTake = path(ov, 'M 1084 470 L 1236 470', 'accent', { w: 4 }); vanish(aTake, 0); arrowIn(aTake, tTake - 0.25, 0.35);
  const gSumB = grp(T('h4') - 0.3, T('h5', '大多数') - 0.1);
  const sBars = [['/news', 0.8], ['/shop', 0.45], ['/search', 0.62]].map(([pn, v], i) => {
    const b = mk(gSumB, 'bar y', 70 + i * 160, 340 - 280 * v, 110, 280 * v); vanish(b, 0); appear(b, tTake + i * 0.06);
    const l = mk(gSumB, 'mono dim', 60 + i * 160, 356, 130, null, pn); css(l, { fontSize: '24px', textAlign: 'center' }); return b;
  });
  void sBars;
  const sumCal = mk(gSumB, 'lab', 30, 20, null, null, icoTxt('calendar', '第 1 天', 26)); appear(sumCal, tTake);
  sfx('blip', tTake);
  // 数据小了很多：原始记录的一大摞，压成一小块（示意）
  const tSmall = T('h4c', '小了');
  const ghost = mk(world, '', 100, 430, 496, 336); css(ghost, { border: '4px solid var(--w)', background: 'rgba(249,249,249,.06)' }); vanish(ghost, 0);
  set(ghost, T('h4c') - 0.1, { autoAlpha: 1 });
  tl.fromTo(ghost, { left: 100, top: 430, width: 496, height: 336 }, { left: 724, top: 356, width: 352, height: 236, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, T('h4c') + 0.1);
  tl.fromTo(ghost, { scale: 1 }, { scale: 0.3, duration: 0.6, ease: 'power3.in', immediateRender: false, transformOrigin: '50% 50%' }, tSmall - 0.1);
  set(ghost, tSmall + 0.55, { autoAlpha: 0 });
  const smallT = mk(world, 't-note', 724, 600, null, null, '示意：一大摞记录，汇总成一小张表'); css(smallT, { fontSize: '24px' }); fadeIn(smallT, tSmall + 0.2); hide(smallT, T('h5', '大多数') - 0.2, { y: 0, d: 0.3 });
  sfx('whoosh', T('h4c') + 0.1, { g: 0.4 });
  // 活儿大半在后台、不赶时间的时候做：天黑了，报表窗口没人看（暗下去），漏斗旁边的服务器慢慢算
  const tNight = T('h4c', '后台') - 0.2, tDay = T('h5') + 0.2;
  const sun = ico(world, 'sun', 1116, 176, 64, 'y', 3.2), moon = ico(world, 'moon', 1116, 176, 60, 'w', 3.2);
  motion(sun, [[0, { a: 0, y: 30 }], [tSum - 0.1, { a: 0, y: 30 }], [tSum + 0.3, { a: 1, y: 0 }], [tNight, { a: 1, y: 0 }], [tNight + 0.6, { a: 0, y: 40 }], [tDay, { a: 0, y: 40 }], [tDay + 0.6, { a: 1, y: 0 }], [T('h6b', '事先'), { a: 1 }], [T('h6b', '事先') + 0.3, { a: 0 }]]);
  motion(moon, [[0, { a: 0, y: -30 }], [tNight + 0.2, { a: 0, y: -30 }], [tNight + 0.8, { a: 1, y: 0 }], [tDay - 0.2, { a: 1, y: 0 }], [tDay + 0.3, { a: 0, y: -30 }]]);
  const srv = ico(world, 'server', 1116, 250, 64, 'w', 3); vanish(srv, 0); appear(srv, tNight + 0.3); vanish(srv, tDay + 0.3);
  const led = mk(world, '', 1131, 265, 6, 5); css(led, { background: 'var(--y)' }); led.style.visibility = 'hidden';
  F((t) => { const on = t >= tNight + 0.3 && t < tDay + 0.3; led.style.visibility = on && Math.floor(t * 3) % 2 === 0 ? 'visible' : 'hidden'; });
  const slowB0 = mk(world, 'bar', 1100, 330, 100, 14), slowB = mk(world, 'bar y', 1100, 330, 100, 14); css(slowB, { transformOrigin: '0 50%' });
  vanish(slowB0, 0); appear(slowB0, tNight + 0.3); vanish(slowB0, tDay + 0.3); vanish(slowB, 0);
  tl.fromTo(slowB, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: tDay - tNight - 0.3, ease: 'none', immediateRender: false }, tNight + 0.3); set(slowB, tDay + 0.3, { autoAlpha: 0 });
  dimTo(D.el, tNight + 0.2, 1, 0.3, 0.5); dimTo(D.el, tDay, 0.3, 1, 0.4);
  // 大多数报表靠这样的汇总：报表窗口里一排小报表，大半都连着汇总表
  const gMany = grp(T('h5', '大多数') - 0.1, T('h6b', '事先') - 0.1);
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    const x = 24 + (i % 3) * 180, y = 24 + Math.floor(i / 3) * 196, on = i !== 4;
    const b = mk(gMany, 'tile' + (on ? ' y' : ''), x, y, 160, 176); ico(b, 'chart', 44, 34, 72, on ? 'y' : '', 3.2);
    const l = mk(b, 'mono', 0, 124, 156, null, on ? 'Σ 汇总' : '……'); css(l, { fontSize: '22px', textAlign: 'center', color: on ? 'var(--y)' : 'var(--g4)' });
    wipe(b, T('h5', '大多数') + i * 0.1, { dir: 't', d: 0.3 });
  });
  sfx('tick', T('h5', '大多数'), { g: 0.5 });

  // ══ 汇总的代价：报表得事先想到；自己组合条件，小表里没有；按网址汇总几乎压不小 ══
  const tPre = T('h6b', '事先');
  keyed(smHead).at(tPre - 0.1, { html: icoTxt('doc', '页面', 22) + '×天<span style="margin-left:22px"></span>' + icoTxt('pin', '地区', 22) + '×天' });
  classAt(smHead, 'y', tPre - 0.1, T('h6b', '组合') - 0.2);
  const gCombo = grp(tPre - 0.1, T('h7') - 0.2);
  const combo = mk(gCombo, 'chip y', 30, 120, null, null, icoTxt('pin', '喀山', 22) + '＋' + icoTxt('doc', '/news', 22) + '＋' + icoTxt('clock', '晚上', 22));
  css(combo, { height: '56px', fontSize: '24px' }); vanish(combo, 0); slam(combo, T('h6b', '组合') - 0.15, { from: 1.2 }); sfx('pop', T('h6b', '组合'), { g: 0.5 });
  // 请求顺着箭头去小表，小表里没有这一种，弹回来
  const ask = mk(world, 'fdot', 0, 0, 18, 18); css(ask, { left: '1230px', top: '461px' });
  const tAsk = T('h6b', '组合') + 0.4, tNo = T('h6b', '做不到');
  motion(ask, [[0, { a: 0 }], [tAsk, { a: 0, x: 0 }], [tAsk + 0.02, { a: 1 }], [tNo - 0.25, { x: -140 }], [tNo + 0.3, { x: 0, y: -20 }], [tNo + 0.5, { a: 0 }]]);
  const xNo = ico(gCombo, 'cross', 230, 210, 110, 'w', 3.6); vanish(xNo, 0); slam(xNo, tNo, { from: 1.5 }); sfx('thud', tNo + 0.05, { g: 0.55 });
  classAt(combo, 'd', tNo + 0.1);
  hide(xNo, T('h6d', '网址') - 0.2, { y: 0, d: 0.3 }); hide(combo, T('h6d', '网址') - 0.2, { y: 0, d: 0.3 });
  // 按网址：几乎每个都不一样，汇总表一行只有 1，跟原始记录差不多大
  const tU = T('h6d', '网址'), tU2 = T('h6d', '汇总完');
  keyed(smHead).at(tU - 0.1, { html: icoTxt('doc', '网址', 22) + '×' + icoTxt('calendar', '天', 22) });
  for (const b of smBars) vanish(b, tU - 0.1);
  for (const l of smLabs) vanish(l, tU - 0.1);
  // 按网址分：几乎每个网址都不一样，每一行的数都是 1
  ['/news/843', '/shop/954', '/search/580', '/news/317'].forEach((u, i) => {
    const t0 = tU + 0.2 + i * 0.3;
    const l = mk(SM, 'mono', 14, 54 + i * 44, 160, null, u); css(l, { fontSize: '22px', color: 'var(--w)' });
    const d = mk(SM, 'mono dim', 184, 54 + i * 44, 80, null, '第1天'); css(d, { fontSize: '22px' });
    const n1 = mk(SM, 'mono y', 300, 54 + i * 44, 40, null, '1'); css(n1, { fontSize: '22px' });
    for (const e of [l, d, n1]) { vanish(e, 0); appear(e, t0); vanish(e, T('h7') - 0.2); }
  });
  // 两根条：原始记录、汇总之后（示意；按网址时，汇总后不到原来的一半）
  const BZ = mk(world, '', 650, 640, 560, 150); vanish(BZ, 0); appear(BZ, tU - 0.1);
  ico(BZ, 'log', 0, 0, 40, '', 3.2); const bRaw = mk(BZ, 'bar w', 60, 6, 480, 30);
  ico(BZ, 'chart', 0, 56, 40, 'y', 3.2); const bSum = mk(BZ, 'bar y', 60, 62, 60, 30);
  const bTag = mk(BZ, 't-note', 60, 106, null, null, '示意'); css(bTag, { fontSize: '24px' });
  wipe(bRaw, tU, { dir: 'l', d: 0.5 }); wipe(bSum, tU + 0.2, { dir: 'l', d: 0.4 });
  tl.fromTo(bSum, { width: 60 }, { width: 300, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, tU2);
  keyed(bTag).at(tU2 + 0.3, { html: '按网址汇总：减不到一半（官方文档）' });
  sfx('whoosh', tU2, { g: 0.4 });
  // 收起汇总这一套，给 OLAPServer 让位（漏斗退后留着，讲到「不汇总」时撤走）
  const tO0 = T('h7') - 0.3;
  for (const e of [SM, aTake]) hide(e, tO0, { y: 0, d: 0.35 }); hide(BZ, T('h7', '分析库') - 0.5, { y: 0, d: 0.35 });
  hide(aIn, tO0, { y: 0, d: 0.3 });
  dimTo(fun, tO0, 1, 0.3, 0.4); dimTo(funL, tO0, 1, 0.3, 0.4);

  // ══ 二〇〇九年起：OLAPServer，存没汇总过的原始数据 ══
  const CX = 760, CY = 380, CW = 300, CH = 300;
  const cyl = mk(world, '', CX, CY, CW, CH);
  cyl.innerHTML = `<svg viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" style="overflow:visible"><path d="M2 24 V${CH - 24} A148 22 0 0 0 ${CW - 2} ${CH - 24} V24" fill="#1F1F1C" stroke="currentColor" stroke-width="4"/><ellipse cx="${CW / 2}" cy="24" rx="${CW / 2 - 2}" ry="22" fill="#1F1F1C" stroke="currentColor" stroke-width="4"/></svg>`;
  css(cyl, { color: 'var(--g3)' });
  const tOS = T('h7', '分析库');
  wipe(cyl, tOS - 0.2, { dir: 't', d: 0.5 }); sfx('pop', tOS, { g: 0.5 });
  const cylN = mk(cyl, 'mono', 0, 56, CW, null, 'OLAPServer'); css(cylN, { fontSize: '34px', fontWeight: '700', color: 'var(--w)', textAlign: 'center' });
  classAt(cyl, 'y', T('h8', '最初'));
  keyed(cylN).at(T('h8', '最初'), { html: '<span class="y">ClickHouse</span>' });
  // 筒里的记录：一行一条，按时间涨；锁上时不涨；夜里整个清空重写；ClickHouse 之后随时涨
  const tIn0 = T('h7b', '原始数据') - 0.2, tLock = T('h7c', '新数据') + 0.1, tRw = T('h7d', '每天'), tFree = T('h8c', '新数据');
  const stripes = []; for (let i = 0; i < 11; i++) { const st = mk(cyl, '', 34, CH - 50 - i * 14, CW - 68, 9); css(st, { background: '#5E5E55' }); st.style.visibility = 'hidden'; stripes.push(st); }
  const fillAt = (t) => {
    if (t < tIn0) return 0;
    if (t < tLock) return Math.min(7, (t - tIn0) * 1.4);
    if (t < tRw) return 7;
    if (t < tRw + 0.7) return 7 * (1 - (t - tRw) / 0.7);
    if (t < tRw + 1.5) return 11 * (t - tRw - 0.7) / 0.8;
    if (t < tFree) return 11;
    return 11;
  };
  F((t) => { const n = fillAt(t); stripes.forEach((st, i) => { const v = i < Math.floor(n + 1e-6) ? 'visible' : 'hidden'; if (st.style.visibility !== v) st.style.visibility = v; }); });
  F((t) => { const ck = t >= T('h8', '最初'); stripes.forEach((st) => { const c = ck ? '#73736A' : '#5E5E55'; if (st.style.background !== c) st.style.background = c; }); });
  const aOS = path(ov, 'M 608 600 C 700 600 760 350 864 372', 'line', { w: 4 }); vanish(aOS, 0); arrowIn(aOS, tIn0 - 0.2, 0.5);
  const P_os = [[608, 600], [700, 600], [760, 350], [868, 374]];
  flow(P_os, 5, tIn0, tLock - 0.3, 1.1);
  flow(P_os, 5, tRw + 0.7, T('h9b') + 1, 1.0);
  // 它好用：报表从筒里现场来
  const aRep = path(ov, 'M 1068 500 L 1236 500', 'accent', { w: 4 }); vanish(aRep, 0); arrowIn(aRep, T('h7c', '好用') - 0.2, 0.4);
  const gOk = grp(T('h7c', '好用') - 0.2, T('h8b', '不汇总') - 0.1);
  barsLive(gOk, T('h7c'));
  const okI = ico(gOk, 'check', 470, 20, 64, 'y', 4); vanish(okI, 0); slam(okI, T('h7c', '好用'), { from: 1.5 }); sfx('blip', T('h7c', '好用'));
  // 只认数字：数字进去，文字弹开
  const tNum = T('h7c', '只认');
  const chipFly = (txt, t0, bounce, cls = 'chip') => {
    const c = mk(world, cls, 600, 560, null, null, txt); css(c, { height: '44px' });
    const k = bounce
      ? [[0, { a: 0 }], [t0, { a: 0, x: 0, y: 0 }], [t0 + 0.02, { a: 1 }], [t0 + 0.55, { x: 220, y: -290, r: 0 }], [t0 + 0.9, { x: 320, y: -360, r: 30 }], [t0 + 1.5, { x: 420, y: 100, r: 80, a: 0 }]]
      : [[0, { a: 0 }], [t0, { a: 0, x: 0, y: 0, s: 1 }], [t0 + 0.02, { a: 1 }], [t0 + 0.55, { x: 220, y: -290 }], [t0 + 0.85, { x: 230, y: -220, s: 0.3, a: 0 }]];
    motion(c, k);
    return c;
  };
  chipFly('1037', tNum - 0.5, false); chipFly(icoTxt('pin', '喀山', 22), tNum - 0.1, true, 'chip w'); chipFly('2004', tNum + 0.3, false); chipFly(icoTxt('doc', '/news', 22), T('h7c', '数字') + 0.1, true, 'chip w');
  sfx('thud', tNum + 0.45, { g: 0.4 }); sfx('thud', T('h7c', '数字') + 0.65, { g: 0.4 });
  const lim1 = mk(world, 'chip on', CX + CW + 24, CY + 186, null, null, '只收 123'); css(lim1, { fontSize: '24px' }); vanish(lim1, 0); slam(lim1, tNum + 0.4, { from: 1.4 });
  // 新数据加不进去：一把锁落在筒口，后来的记录在旁边排队
  const lock = ico(world, 'lock', CX + CW / 2 - 34, CY - 70, 68, 'w', 3.4);
  const qs = [0, 1, 2, 3, 4].map((i) => { const q = mk(world, 'rec', 640, 760 - i * 30, 92, 24, ''); q.style.visibility = 'hidden'; return q; });
  F((t) => { const n = t >= tLock && t < tRw + 1.1 ? Math.min(5, Math.floor((t - tLock) * 2.2) + 1) - (t >= tRw + 0.7 ? Math.floor((t - tRw - 0.7) * 12) : 0) : 0; qs.forEach((q, i) => { const v = i < n ? 'visible' : 'hidden'; if (q.style.visibility !== v) q.style.visibility = v; }); });
  sfx('thud', tLock, { g: 0.55 });
  // 每天整个重写一遍：月亮升起，筒里清空、重新写满（排队的那些这时才进去）
  const moon2 = ico(world, 'moon', CX + CW + 30, CY - 40, 60, 'w', 3.2); vanish(moon2, 0); show(moon2, tRw - 0.3, { y: -20, d: 0.4 }); hide(moon2, tRw + 1.7, { y: -10, d: 0.3 });
  const lim3 = mk(world, 'chip on', CX + CW + 24, CY + 250, null, null, '每夜重写'); css(lim3, { fontSize: '24px' }); vanish(lim3, 0); slam(lim3, tRw + 0.1, { from: 1.4 });
  const sweep = mk(cyl, '', 0, 0, CW, CH); css(sweep, { background: 'rgba(250,255,105,.16)', transformOrigin: '50% 0' }); vanish(sweep, 0);
  tl.fromTo(sweep, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: 'none', immediateRender: false }, tRw);
  set(sweep, tRw + 1.45, { autoAlpha: 0 });
  sfx('whoosh', tRw, { g: 0.45 });

  // ══ ClickHouse 最初的目标：把这三个限制打掉 ══
  const tG = T('h8', '去掉');
  motion(lock, [[0, { a: 0, y: -60 }], [tLock - 0.3, { a: 0, y: -60 }], [tLock - 0.28, { a: 1 }], [tLock, { y: 0 }], [tG + 0.15, { y: 0, r: 0, s: 1 }], [tG + 0.35, { y: -30, s: 1.25, r: -15 }], [tG + 1.2, { y: 420, r: -120, s: 1, a: 0 }]]);
  // 弹掉：先一顿、放大，再翻着落下去
  const knock = (e, t) => { tl.to(e, { scale: 1.25, duration: 0.15, ease: 'power2.out' }, t); tl.to(e, { y: 420, rotation: 110, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, t + 0.18); sfx('pop', t, { g: 0.55, p: 0.3 }); };
  knock(lim1, tG); knock(lim3, tG + 0.4); sfx('pop', tG + 0.2, { g: 0.55, p: 0.3 });
  sfx('thud', tG + 1.1, { g: 0.4 });
  // 不汇总：漏斗撤走，所有报表都连到 ClickHouse
  const tNS = T('h8b', '不汇总');
  hide(fun, tNS, { y: -20, d: 0.4 }); hide(funL, tNS, { y: -20, d: 0.4 });
  const gAll = grp(tNS - 0.1, T('h9b') - 0.3);
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    const x = 24 + (i % 3) * 180, y = 24 + Math.floor(i / 3) * 196;
    const b = mk(gAll, 'tile y', x, y, 160, 176); ico(b, 'chart', 44, 34, 72, 'y', 3.2);
    const l = mk(b, 'mono y', 0, 124, 156, null, '原始数据'); css(l, { fontSize: '22px', textAlign: 'center' });
    wipe(b, T('h8b', '所有报表') + i * 0.08, { dir: 't', d: 0.3 });
  });
  sfx('tick', T('h8b', '所有报表'), { g: 0.5 });
  // 什么类型都能存、新数据随时能加：文字也进去了，旁边不再排队
  chipFly(icoTxt('pin', '喀山', 22), T('h8c', '类型') - 0.4, false, 'chip y'); chipFly(icoTxt('doc', '/news', 22), T('h8c', '类型'), false, 'chip y');
  const okT = ico(world, 'check', CX + CW + 20, CY + 40, 60, 'y', 4); vanish(okT, 0); slam(okT, T('h8c', '类型') + 0.4, { from: 1.5 }); sfx('blip', T('h8c', '类型') + 0.4);
  const okN = ico(world, 'check', CX + CW + 20, CY + 120, 60, 'y', 4); vanish(okN, 0); slam(okN, T('h8c', '随时') , { from: 1.5 }); sfx('blip', T('h8c', '随时'));
  for (const e of [okT, okN]) hide(e, T('h9a') - 0.2, { y: 0, d: 0.3 });

  // ══ 二〇一四年：一天约一百二十亿次；一次查询几百毫秒扫过几百万行；用户在等 ══
  const tBig = T('h9a', '一百二十亿');
  const bigN = mk(world, 'big y', 650, 192, null, null, '约 120 亿'); css(bigN, { fontSize: '96px' }); slam(bigN, tBig - 0.1, { from: 1.15 }); sfx('thud', tBig, { g: 0.5 });
  const bigI = ico(world, 'clock', 1110, 202, 80, 'w', 3.2);
  vanish(bigI, 0); appear(bigI, tBig);
  tl.fromTo(bigI.firstChild, { rotation: 0 }, { rotation: 360, duration: 2.4, ease: 'none', immediateRender: false, transformOrigin: '50% 50%' }, tBig);
  const bigL = mk(world, 'lab', 656, 304, null, null, '次浏览和点击 / 天　（2014 年 4 月）'); appear(bigL, tBig + 0.2);
  hide(bigN, tY16 - 0.4, { y: -10, d: 0.35 }); hide(bigL, tY16 - 0.4, { y: -10, d: 0.35 }); hide(bigI, tY16 - 0.4, { y: -10, d: 0.35 });
  // 报表窗口里：秒表几百毫秒，一摞几百万行被扫过
  const gQ = grp(T('h9b') - 0.3, tY16 - 0.4);
  const sw = ico(gQ, 'stopwatch', 30, 40, 150, 'w', 2.6);
  const hand = mk(gQ, '', 104, 104, 4, 50); css(hand, { background: 'var(--y)', transformOrigin: '50% 100%' }); vanish(hand, 0); appear(hand, T('h9b', '几百毫秒') - 0.3);
  tl.fromTo(hand, { rotation: 0 }, { rotation: 110, duration: 0.7, ease: 'power2.out', immediateRender: false }, T('h9b', '几百毫秒') - 0.3);
  const swL = mk(gQ, 'h2 y', 30, 210, null, null, '几百毫秒'); fadeIn(swL, T('h9b', '几百毫秒') - 0.1);
  void sw;
  const stack = mk(gQ, '', 300, 30, 240, 360); const lines = [];
  for (let i = 0; i < 24; i++) { const l = mk(stack, '', 0, i * 15, 240, 9); css(l, { background: '#4A4A43' }); lines.push(l); }
  const stLab = mk(gQ, 'lab', 300, 396, null, null, '几百万行'); css(stLab, { top: '392px' }); fadeIn(stLab, T('h9b', '几百万行') - 0.1);
  const tScan = T('h9b', '扫过') - 0.1;
  F((t) => { const k = clamp((t - tScan) / 0.8); const n = Math.floor(k * 24); lines.forEach((l, i) => { const c = t >= tScan && i < n ? '#FAFF69' : '#4A4A43'; if (l._c !== c) { l.style.background = c; l._c = c; } }); });
  // 用户在等：沙漏翻转；算得极快：闪电
  const usr = ico(world, 'person', 1150, 660, 76, 'w', 3.2); vanish(usr, 0); show(usr, T('h9', '用户') - 0.2, { y: 16, d: 0.35 });
  const hg = ico(world, 'hourglass', 1232, 668, 60, '', 3.2); vanish(hg, 0); appear(hg, T('h9', '等着') - 0.1);
  tl.fromTo(hg.firstChild, { rotation: 0 }, { rotation: 180, duration: 0.5, ease: 'power2.inOut', immediateRender: false, transformOrigin: '50% 50%' }, T('h9', '等着') + 0.2);
  vanish(hg, T('h9', '极快') - 0.05);
  const bolt = ico(world, 'bolt', 1226, 660, 76, 'y', 3.4); vanish(bolt, 0); slam(bolt, T('h9', '极快') - 0.05, { from: 1.6 }); sfx('thud', T('h9', '极快') + 0.05, { g: 0.6 });
  for (const e of [usr, bolt]) hide(e, tY16 - 0.4, { y: 0, d: 0.3 });

  // ══ 二〇一六年开源 → 二〇二一年从 Yandex 分出来 → 通用的分析型数据库 → 今天 ══
  const tOpen = T('h10', '开源');
  hide(W.el, tY16 - 0.5, { x: -40, y: 0, d: 0.4 }); hide(LOG, tY16 - 0.5, { x: -40, y: 0, d: 0.4 }); hide(aOS, tY16 - 0.5, { y: 0, d: 0.3 });
  const code = ico(world, 'code', CX + CW / 2 - 44, 170, 88, 'y', 3.6); vanish(code, 0); slam(code, tOpen - 0.15, { from: 1.5 }); sfx('chime', tOpen, { g: 0.4 });
  // 源码复制出去：一台台电脑亮起来
  const pcs = [0, 1, 2, 3, 4, 5].map((i) => { const p = ico(world, 'laptop', 140 + (i % 3) * 140, 240 + Math.floor(i / 3) * 150, 84, 'w', 3); vanish(p, 0); slide(p, tOpen + 0.3 + i * 0.12, { x: 30 }); sfx('tick', tOpen + 0.3 + i * 0.12, { g: 0.3 }); return p; });
  flow([[CX + 10, 220], [700, 200], [560, 260], [400, 300]], 6, tOpen + 0.2, T('h10a') - 0.3, 0.9, 12);
  for (const p of pcs) hide(p, T('h10b') - 0.2, { y: 0, d: 0.3 });
  hide(code, T('h10a') - 0.2, { y: -10, d: 0.3 });
  // 二〇二一年：Yandex 的框收到只剩 Metrica，ClickHouse 留在框外，换上自己的框
  const tSplit = T('h10a', '分出来') - 0.3;
  tl.fromTo(YF, { left: 624, width: 1216 }, { left: 1210, width: 630, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, tSplit);
  sfx('whoosh', tSplit, { g: 0.5 });
  const CHF = mk(world, 'yfr', CX - 40, CY - 110, CW + 80, CH + 150); css(CHF, { borderStyle: 'solid', borderColor: 'var(--y)' });
  const chl = mk(CHF, 'yl', 0, 0, null, null, ''); css(chl, { color: 'var(--y)' }); chl.innerHTML = icoSvg('building', 26, 3.4) + ' ClickHouse, Inc.'; css(chl, { display: 'flex', alignItems: 'center', gap: '10px' });
  vanish(CHF, 0); wipe(CHF, T('h10a', '独立') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('h10a', '独立'), { g: 0.55 });
  // 通用：别的各种活儿也接到它身上
  const USE = [['cart', 260], ['phone', 400], ['server', 540], ['chart', 680]];
  USE.forEach(([ic, y], i) => {
    const t0 = T('h10b', '通用') - 0.2 + i * 0.12;
    const b = ico(world, ic, 300, y - 40, 72, 'w', 3.2); slide(b, t0, { x: -30 });
    const a = path(ov, `M 372 ${y - 4} C 520 ${y - 4} 600 ${CY + 150} ${CX - 8} ${CY + 150}`, 'line', { w: 3 }); vanish(a, 0); arrowIn(a, t0 + 0.1, 0.5);
    hide(b, T('h11') - 0.3, { y: -10, d: 0.35 }); hide(a, T('h11') - 0.3, { y: 0, d: 0.3 });
  });
  sfx('tick', T('h10b', '通用'), { g: 0.4 });
  // 今天：Metrica 的库里十三万亿条以上
  const gNow = grp(T('h10c') - 0.2, null);
  const nowN = mk(gNow, 'big y', 30, 110, null, null, '13 万亿+'); css(nowN, { fontSize: '104px' }); slam(nowN, T('h10c', '十三万亿') - 0.1, { from: 1.15 }); sfx('thud', T('h10c', '十三万亿'), { g: 0.5 });
  const nowL = mk(gNow, 'lab', 34, 240, null, null, 'Metrica 库里的记录'); appear(nowL, T('h10c', '十三万亿') + 0.2);
  vanish(gAll, T('h10c') - 0.2);

  // ══ 分析型数据库，也不是 ClickHouse 才有：三个年代，各画一幅 ══
  const tE = T('h11') - 0.3;
  for (const e of [YF, CHF, cyl, aRep]) hide(e, tE, { y: -12, d: 0.4 });
  hide(D.el, T('h11') + 1.0, { y: -12, d: 0.4 });   // 报表窗口在右边，跟左边的「更早的」面板不冲突，多留一会儿让「13 万亿+」读完
  const early = mk(world, '', 100, AX + 1, 96, 2); css(early, { borderTop: '3px dashed var(--g3)' }); wipe(early, T('h11') - 0.1, { dir: 'r', d: 0.5 });
  const earlyTx = mk(world, 'mono dim', 60, AX + 22, 140, null, '更早'); css(earlyTx, { fontSize: '26px', textAlign: 'center' }); appear(earlyTx, T('h11') + 0.2);
  const ERA = (x, w, title, names, t0, x0, cls = '', yEnd = AX) => {
    const b = mk(world, 'panel ' + cls, x, 150, w, 640);
    const tt = mk(b, 'badge', 24, 18, null, null, title); css(tt, { fontSize: '26px', padding: '8px 14px' });
    names.forEach((n, i) => { const c = mk(b, 'chip', 24 + (i % 2) * ((w - 60) / 2 + 12), 84 + Math.floor(i / 2) * 54, (w - 60) / 2, 44, n); css(c, { justifyContent: 'center', fontSize: '22px' }); wipe(c, t0 + 0.3 + i * 0.25, { dir: 'l', d: 0.3 }); const a = t0 + 0.9 + i * 0.6; flashClone(c, a, t0 + 0.9 + names.length * 0.6 + 0.4 - a, 0.6); });
    wipe(b, t0, { dir: 'b', d: 0.5 });
    const ln = mk(world, '', x0 - 1, 790, 3, yEnd - 790); css(ln, { background: cls ? 'var(--y)' : 'var(--g2)' }); wipe(ln, t0 + 0.2, { dir: 't', d: 0.4 });
    return { b, ln };
  };
  const E1 = ERA(100, 440, '更早的', ['Teradata', 'Vertica', 'Sybase IQ', 'Greenplum'], T('h11') + 0.1, 148);
  // 又贵：价签；装在自家机房：一栋楼里的机柜；批量导入：卡车一车一车地送
  // 三行「图标 + 一句话」；讲到哪一项，那一行整条亮起（焦点跟着旁白走），讲下一项时移过去
  const E1R = [['tag', '贵', T('h11b', '又贵')], ['building', '装在自家机房', T('h11b', '机房')], ['truck', '数据批量导入', T('h11c', '批量')]];
  E1R.forEach(([ic, tx, t0], i) => {
    const rb = mk(E1.b, 'chip', 24, 240 + i * 112, 392, 92, icoSvg(ic, 56, 3) + `<span style="margin-left:18px">${tx}</span>`);
    css(rb, { height: '92px', fontSize: '32px', padding: '0 22px' }); vanish(rb, 0); show(rb, t0 - 0.15, { x: -16, d: 0.35 });
    const tNext = i + 1 < E1R.length ? E1R[i + 1][2] - 0.15 : T('h11d') - 0.2;
    flashClone(rb, t0 + 0.2, Math.max(0.4, tNext - t0 - 0.2), 0.5);
    sfx('tick', t0, { g: 0.4 });
  });
  const E2 = ERA(600, 480, '二〇一〇年代初 · 云上', ['Snowflake', 'BigQuery', 'Redshift'], T('h11d') - 0.1, 902, '', AX - 8);
  const cld = ico(E2.b, 'cloud', 110, 230, 260, 'w', 2); vanish(cld, 0); wipe(cld, T('h11d', '云上') - 0.2, { dir: 'b', d: 0.5 });
  [0, 1, 2].forEach((i) => { const d = ico(E2.b, 'db', 160 + i * 56, 360, 48, 'y', 3.4); vanish(d, 0); appear(d, T('h11d', '云上') + 0.2 + i * 0.12); });
  const cloudBr = mk(world, '', X(2010), AX - 6, X(2013) - X(2010), 14); css(cloudBr, { borderTop: '3px solid var(--g3)', borderLeft: '3px solid var(--g3)', borderRight: '3px solid var(--g3)' }); wipe(cloudBr, T('h11d') + 0.2, { dir: 'l', d: 0.4 });
  const E3 = ERA(1140, 680, 'ClickHouse', [], T('h11f', '另一条路') - 0.2, X(2016), 'y', AX - 12);
  const e3a = ico(E3.b, 'code', 60, 110, 120, 'y', 3); vanish(e3a, 0); slam(e3a, T('h11f', '开源') - 0.1, { from: 1.4 });
  const e3aL = mk(E3.b, 'h2 y', 60, 250, null, null, '开源'); fadeIn(e3aL, T('h11f', '开源'));
  const lap = ico(E3.b, 'laptop', 330, 90, 300, 'w', 1.8); vanish(lap, 0); wipe(lap, T('h11f', '一个程序') - 0.4, { dir: 'b', d: 0.5 });
  const one = mk(E3.b, 'tile y', 444, 160, 76, 76); css(one, { background: 'var(--y)' }); vanish(one, 0); slam(one, T('h11f', '一个程序'), { from: 1.6 });
  const oneL = mk(E3.b, 'h2', 330, 400, null, null, '一个程序就能跑'); fadeIn(oneL, T('h11f', '一个程序') - 0.3);
  sfx('chime', T('h11f', '开源'), { g: 0.4 });

  // ══ 回到开头那几毫秒 ══
  const tBack = T('h12') + 0.1;
  for (const E of [E1, E2, E3]) { hide(E.b, tBack, { y: -12, d: 0.4 }); hide(E.ln, tBack, { y: 0, d: 0.3 }); }
  hide(cloudBr, tBack, { y: 0, d: 0.3 });
  const g8 = mk(world, 'huge y', 640, 190, null, null, '8 ms'); css(g8, { fontSize: '280px' }); slam(g8, T('h12', '开头'), { from: 1.25 }); sfx('thud', T('h12', '开头') + 0.1, { g: 0.6 });
  const eng = mk(world, 'term', 640, 620, 1000, 130);
  eng.innerHTML = '<span class="pr">:) </span>CREATE TABLE users (…)\n<span class="pr">:-] </span><b>ENGINE</b> = …';
  wipe(eng, T('h12b', '建表') - 0.2, { dir: 'l', d: 0.5 }); sfx('pop', T('h12b', '一个词'), { g: 0.5 });
  classAt(g8, 'fade45', Tend('h12b') + 0.2);
  const engHi = mk(world, '', 725, 676, 113, 50); css(engHi, { border: '4px solid var(--y)' }); vanish(engHi, 0); wipe(engHi, T('h12b', '一个词') - 0.05, { dir: 'l', d: 0.3 });

  drift(cam, s, -1);
});
