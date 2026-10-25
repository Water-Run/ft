// 第 03 章 一个文件，两棵树：建一张空表 → 第 4 页一行一行装满 → 第 208 行分裂成两页叶子、第 4 页成了根
// → 一路长到 4096 行、21 页叶子 → 叶子左右相连、范围读顺着走 → B+ 树、聚簇索引
// → 姓名索引是第二棵树 → 倒回第 2050 行：Alice 同时插进两棵树（主键树最右、姓名索引最左）→ 一百万行也只有三层。
// 树的每一刻都由「此刻插到第几行 n」算出来：页与行数取自一行一行插入的实测（FACTS G1–G4，D.growth）。
// 约定：帧函数只切 display（这一页此刻存不存在），GSAP 只动 opacity / 位移（入场、变淡），两者不碰同一个属性。
scene('s3', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, -1, ['a3', 'a5', 'a8', 'a10', 'a13', 'a16', 'a19', 'a22', 'a24', 'a26', 'a28']);             // 镜头只极慢横移（parts.js）
  const ov = overlay(W);
  const disp = (e, on) => { const v = on ? '' : 'none'; if (e.style.display !== v) e.style.display = v; };
  // 同一个元素的几段高亮写成一个帧函数，避免几个 classAt 互相覆盖
  const litWin = (e, cls, wins) => { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } }); };

  // ── 时间 → 已经插了多少行 ──
  const tR0 = T('a6'), tR1 = T('a8', '满了'), tSplit = T('a9', '一分为二');
  const tG0 = T('a13'), tG1 = Tend('a15') - 0.4, tGs = T('a15') - 0.2, NSLOW = 760;   // 208 → 760 行慢放（开出叶页 11、13、15），之后加速
  const tBack0 = T('a24') + 0.1, tBack1 = Math.max(T('a24') + 1.2, Tend('a24') - 0.1), tAlice = T('a25'), tFwd0 = Tend('a27z') + 0.2, tFwd1 = tFwd0 + 0.6;
  const nAt = (t) => {
    if (t < tR0) return 0;
    if (t < tR1) return Math.max(1, Math.round(lerp(1, 207, ease.io3(clamp((t - tR0) / (tR1 - tR0))))));
    if (t < tSplit) return 207;
    if (t < tG0) return 208;
    if (t < tG1) return t < tGs ? Math.round(lerp(208, NSLOW, clamp((t - tG0) / (tGs - tG0)))) : Math.round(lerp(NSLOW, 4096, Math.pow(clamp((t - tGs) / (tG1 - tGs)), 2)));
    if (t < tBack0) return 4096;
    if (t < tBack1) return Math.round(lerp(4096, 2049, ease.io3(clamp((t - tBack0) / (tBack1 - tBack0)))));
    if (t < tAlice) return 2049;
    if (t < tFwd0) return 2050;
    if (t < tFwd1) return Math.round(lerp(2050, 4096, ease.io3(clamp((t - tFwd0) / (tFwd1 - tFwd0)))));
    return 4096;
  };
  // 某一行数时两棵树各页的行数：实测事件之间，新行都落进最右边的叶子；第 2050 行（Alice）在姓名索引里落进第 9 页
  const PKE = D.growth.filter((e) => e.index === 'PRIMARY'), NME = D.growth.filter((e) => e.index === 'idx_name');
  function pkState(n) {
    if (n < 208) return null;
    let e = PKE[0]; for (const x of PKE) if (x.row <= n) e = x;
    const c = { ...e.pages }; delete c[4];
    const exist = PK_LEAVES.filter((p) => c[p] != null);
    c[exist[exist.length - 1]] += n - e.row;
    return c;
  }
  function nmState(n) {
    if (n < 274) return null;
    let e = NME[0]; for (const x of NME) if (x.row <= n) e = x;
    const c = { ...e.pages }; delete c[5];
    const exist = NM_LEAVES.filter((p) => c[p] != null);
    const alice = e.row < 2050 && n >= 2050 ? 1 : 0;
    c[exist[exist.length - 1]] += n - e.row - alice;
    c[9] += alice;
    return c;
  }
  { const a = pkState(4096), b = nmState(4096);                 // 与整棵树的实测（T1、T4）对得上
    D.pk.leaves.forEach((l) => { if (a[l.page] !== l.n) console.warn('pk mismatch', l.page); });
    D.nm.leaves.forEach((l) => { if (b[l.page] !== l.n) console.warn('nm mismatch', l.page); }); }

  // ── 文件条：users.ibd 的 49 页 ──
  const fileLbl = h('div', 'abs', W, `<span class="mono" style="font-size:30px;font-weight:700">users.ibd</span>`); px(fileLbl, 120, 100);
  const fileNote = h('div', 'abs t-small num', W, `${D.file.pages} 页 × 16 KB`); px(fileNote, 120, 140);
  const FX = 330, FP = 30, FY = 106;
  const cells = [];
  for (let p = 0; p < D.file.pages; p++) { const c = h('div', 'abs', W); px(c, FX + p * FP, FY, 26, 30); css(c, { border: '1.5px solid var(--edge)', background: 'var(--panel)' }); c.dataset.name = '页' + p; cells.push(c); }
  const PKSET = new Set(PK_LEAVES), NMSET = new Set(NM_LEAVES);
  let lastCells = '';
  F((t) => {
    const n = nAt(t), a = pkState(n), b = nmState(n), named = t >= T('a22', '第二棵树') - 0.8;
    const key = n + (named ? 'n' : '');
    if (key === lastCells) return; lastCells = key;
    cells.forEach((c, p) => {
      let bg = 'var(--panel)', bd = 'var(--edge)';
      if (p < 4) { bg = 'var(--band)'; }
      else if (p === 4 && n > 0) { bg = 'var(--mainD)'; bd = 'var(--mainD)'; }
      else if (p === 5 && n > 0) { bg = named ? 'var(--main)' : 'var(--edge)'; bd = bg; }
      else if (a && PKSET.has(p) && a[p] != null) { bg = 'var(--teal)'; bd = 'var(--mainD)'; }
      else if (b && NMSET.has(p) && b[p] != null) { bg = named ? '#CFE6EB' : 'var(--band)'; bd = named ? 'var(--main)' : 'var(--edge)'; }
      c.style.background = bg; c.style.borderColor = bd;
    });
  });

  // 第几行在什么时刻插进来（长树段的反函数）；每页主键叶子开出来的时刻
  const pkFirst = PK_LEAVES.map((pg) => { let r = Infinity; for (const e of PKE) if (e.pages[pg] != null) r = Math.min(r, e.row); return Math.max(208, r); });
  const tOfRow = (r) => { if (r <= 208) return tG0; if (r <= NSLOW) return lerp(tG0, tGs, (r - 208) / (NSLOW - 208));
    let lo = tGs, hi = tG1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (nAt(m) < r) lo = m; else hi = m; } return hi; };
  const pkT = pkFirst.map(tOfRow);

  // ── a2–a4：页是怎样组织的。a2 文件出现，是一整条；a3 一刀一刀切成 49 页，放大其中一页：16 KB；
  // a4 整条收到画面顶上，成了后面一直留着的文件条（页的位置都和它对得上），第 4 页从那里读进内存 ──
  const BIGY0 = 740, BIGY = 450, BIGH = 110, NP = D.file.pages;
  const tCut0 = T('a3', '一页') - 0.1, tCut1 = Math.max(tCut0 + 1.2, T('a3', '16') - 0.3);
  const tRise = T('a3') + 0.05, tCol0 = T('a4') - 0.1, tCol1 = tCol0 + 0.7;
  const bigF = h('div', 'abs', W); px(bigF, 0, 0, 1920, 1080); css(bigF, { pointerEvents: 'none', transformOrigin: '0 0' });
  const bfName = h('div', 'abs', bigF, '<span class="mono" style="font-size:34px;font-weight:700">users.ibd</span>'); px(bfName, FX, BIGY0 - 54);
  const solid = h('div', 'abs', bigF); css(solid, { border: '2px solid var(--mainD)', background: 'var(--panel)' });
  const bcells = []; for (let p = 0; p < NP; p++) { const c = h('div', 'abs', bigF); px(c, FX + p * FP, BIGY0, 26, BIGH); css(c, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' }); bcells.push(c); }
  const bticks = [0, 8, 16, 24, 32, 40, 48].map((p) => { const e = h('div', 'abs num', bigF, String(p)); px(e, FX + p * FP - 10, BIGY0 + BIGH + 10, 46); css(e, { textAlign: 'center', font: '500 24px Inter', color: 'var(--ink2)' }); vanish(e, 0); appear(e, lerp(tCut0, tCut1, (p + 1) / NP)); return e; });
  // 切：前 k 页已经切开（一格一格），剩下的还是一整条
  let lastK = -1;
  F((t) => {
    const k = Math.round(NP * clamp((t - tCut0) / (tCut1 - tCut0))); if (k === lastK) return; lastK = k;
    bcells.forEach((c, i) => disp(c, i < k));
    disp(solid, k < NP); px(solid, FX + k * FP, BIGY0, (NP - k) * FP - 4, BIGH);
  });
  for (let i = 0; i < 7; i++) sfx('tick', lerp(tCut0, tCut1, i / 7), { g: 0.25 });
  // 整条的位置：a3 开头从下方升到中间，a4 开头收成顶上的文件条（帧函数只管 transform，GSAP 只管显隐）
  const sCol = 30 / BIGH, yCol = FY - sCol * BIGY0;
  let lastBF = '';
  F((t) => {
    const r = ease.io3(clamp((t - tRise) / 0.6)), c = ease.io3(clamp((t - tCol0) / (tCol1 - tCol0)));
    const y = lerp(lerp(0, BIGY - BIGY0, r), yCol, c), sy = lerp(1, sCol, c);
    const k = y.toFixed(1) + ',' + sy.toFixed(4); if (k === lastBF) return; lastBF = k;
    bigF.style.transform = `translateY(${y.toFixed(1)}px) scaleY(${sy.toFixed(4)})`;
  });
  wipe(bigF, T('a2') + 0.2, { dir: 'l', d: 0.7 }); sfx('whoosh', T('a2') + 0.2, { g: 0.4 });
  { const s3f = h('style', '', W); s3f.textContent = '.s3-fn.on { color: var(--main); }'; } bfName.classList.add('s3-fn'); lit(bfName, 'on', T('a2', '.ibd'));
  [bfName, ...bticks].forEach((e) => exit(e, tCol0 - 0.25, { y: 0, d: 0.2 }));
  vanish(bigF, tCol1);
  cells.forEach((c) => { vanish(c, 0); appear(c, tCol1); });
  // 放大一页：16 KB（第 4 页——等一下读进内存、成为表的起点的就是它）
  const hl4 = h('div', 'abs', W); px(hl4, FX + 4 * FP, BIGY, 26, BIGH); css(hl4, { border: '3px solid var(--mainD)', background: 'var(--teal)' });
  const mag = h('div', 'box', W, '<div style="font:800 56px Inter;color:var(--mainD)">16 KB</div><div class="num" style="font:600 26px Inter;color:var(--ink2);margin-top:6px">16 384 字节</div>');
  px(mag, FX + 4 * FP + 13 - 130, 650, 260, 170); css(mag, { padding: '30px 0 0 0', textAlign: 'center', borderColor: 'var(--mainD)', borderWidth: '2px' });
  const magL = path(ov, `M${FX + 4 * FP},${BIGY + BIGH} L${FX + 4 * FP + 13 - 130},650`, 'mainD', { w: 1.6, arrow: false });
  const magR = path(ov, `M${FX + 4 * FP + 26},${BIGY + BIGH} L${FX + 4 * FP + 13 + 130},650`, 'mainD', { w: 1.6, arrow: false });
  const tMag = T('a3', '16') - 0.1;
  vanish(hl4, 0); appear(hl4, tMag); vanish(hl4, tCol0);
  [magL, magR].forEach((e) => { svgIn(e, tMag + 0.1, 0.3); svgOut(e, tCol0 - 0.2, 0.2); });
  vanish(mag, 0); show(mag, tMag + 0.2, { s: 0.9, y: 0, d: 0.4 }); exit(mag, T('a5') - 0.2, { y: 10, d: 0.3 }); sfx('pop', tMag + 0.2, { g: 0.5 });
  const ticks = [0, 8, 16, 24, 32, 40, 48].map((p) => { const e = h('div', 'abs num', W, String(p)); px(e, FX + p * FP - 10, FY + 34, 46); css(e, { textAlign: 'center', font: '500 22px Inter', color: 'var(--ink2)' }); vanish(e, 0); appear(e, tCol1); return e; });
  wipe(fileLbl, tCol1, { dir: 'l', d: 0.4 }); wipe(fileNote, tCol1 + 0.1, { dir: 'l', d: 0.4 });
  // a1：建表语句（与实验同一张表，lab_common.SCHEMA）；KEY idx_name 等第二棵树出现时再提
  const ddl = h('div', 'abs mono', W, ''); px(ddl, 300, 330); css(ddl, { fontSize: '32px', lineHeight: '1.5' });
  const DDL = '<span class="c-main" style="font-weight:700">CREATE TABLE</span> users (\n  id   INT <span class="c-main" style="font-weight:700">PRIMARY KEY</span>,\n  name CHAR(50),\n  age  TINYINT UNSIGNED,\n  KEY idx_name (name),\n  KEY idx_age (age)\n);';
  const tDdl = c0 + 0.05;
  typeText(ddl, DDL, tDdl, 48, { cursorUntil: Tend('a1') + 0.4 });
  exit(ddl, T('a3') - 0.05, { y: -12, d: 0.35 });
  const pkMark = h('div', 'abs', W); px(pkMark, 290, 330 + 48 - 2, 560, 50); css(pkMark, { border: '3px solid var(--main)' });
  vanish(pkMark, 0); show(pkMark, T('a1', '主键') - 0.1, { s: 1.04, y: 0, d: 0.35 }); exit(pkMark, T('a3') - 0.05, { y: -12, d: 0.35 });
  const pkTag = h('div', 'tag', W, '主键'); px(pkTag, 870, 382); css(pkTag, { fontSize: '26px' });
  vanish(pkTag, 0); slam(pkTag, T('a1', '主键'), { from: 1.3 }); exit(pkTag, T('a3') - 0.05, { y: -12, d: 0.35 }); sfx('pop', T('a1', '主键'), { g: 0.4 });
  // a4：读进内存一次就是一整页（第 4 页在文件条上标出来）
  const c4 = h('div', 'abs num', W, '4'); px(c4, FX + 4 * FP - 10, FY + 34, 46); css(c4, { textAlign: 'center', font: '700 24px Inter', color: 'var(--mainD)' });
  vanish(c4, 0); appear(c4, tCol1);
  const mem = h('div', 'box dashed', W, '<div class="bt">内存</div>'); px(mem, 1540, 260, 260, 180);
  const memPg = h('div', 'abs', mem); px(memPg, 102, 80, 54, 60); css(memPg, { border: '2px solid var(--mainD)', background: 'var(--teal)' });
  const fly = h('div', 'abs', W); px(fly, FX + 4 * FP, FY, 26, 30); css(fly, { border: '2px solid var(--mainD)', background: 'var(--teal)' });
  const tMem = T('a4', '内存');
  show(mem, T('a4') - 0.1, { y: 10, d: 0.4 });
  vanish(fly, 0); appear(fly, tMem);
  fromTo(fly, tMem, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: 1540 + 102 - (FX + 4 * FP), y: 260 + 80 - FY, scaleX: 54 / 26, scaleY: 2, duration: 0.8, ease: 'power3.inOut' });
  vanish(fly, tMem + 0.81); vanish(memPg, 0); appear(memPg, tMem + 0.8);
  exit(mem, T('a5') - 0.1, { y: 10, d: 0.3 });

  // ── 第 4 页一行一行装满（放大来看） ──
  const big = h('div', 'abs', W); px(big, 760, 240, 400, 420); css(big, { border: '2px solid var(--mainD)', background: 'var(--panel)' }); big.dataset.name = '页 4';
  const bigNo = h('div', 'abs', big, '<span style="font:700 30px Inter;color:var(--mainD)">页 4</span>'); px(bigNo, 0, -46);
  // 一条记录一个小格：9 列 × 23 排正好 207 条，按编号从左到右、从上到下排（M28）；前 103 条和后 104 条各放一组，分裂时整组落进两页叶子
  const RC = 9, RPX = 41, RPY = 16.8, RW = 37, RH_ = 12;
  const halfG = (r0, r1) => { const g = h('div', 'abs', W); px(g, 776, 256 + r0 * RPY, 369, (r1 - r0) * RPY); css(g, { pointerEvents: 'none' }); return g; };
  const h1 = halfG(0, 12), h2 = halfG(11, 23);                          // 第 12 排（编号 100–108）两组各占一部分
  const recs = [];
  for (let i = 0; i < 207; i++) { const g = i < 103 ? h1 : h2, r = Math.floor(i / RC), c = i % RC, r0 = i < 103 ? 0 : 11;
    const e = h('div', 'abs', g); px(e, c * RPX, (r - r0) * RPY, RW, RH_); css(e, { background: 'var(--main)' }); recs.push(e); }
  // 页里按编号排：最上面是 1，最下面跟着新插进来的那一行走
  const idTop = h('div', 'abs num', big, '1'); px(idTop, -56, 6, 40); css(idTop, { textAlign: 'right', font: '600 24px Inter', color: 'var(--ink2)' });
  const idBot = h('div', 'abs num', big, ''); px(idBot, -76, 0, 60); css(idBot, { textAlign: 'right', font: '700 24px Inter', color: 'var(--main)' });
  let lastBig = -1;
  F((t) => { const n = Math.min(nAt(t), 207); if (n === lastBig) return; lastBig = n; recs.forEach((e, i) => disp(e, i < n)); idBot.textContent = n > 1 ? n : ''; idBot.style.top = (16 + Math.floor((n - 1) / RC) * RPY - 6).toFixed(0) + 'px'; });
  // 容量条：一页 16 KB，随行数涨上去；第 207 行进来时到顶（G1），转成强调色
  const gauge = h('div', 'abs', W); px(gauge, 1196, 256, 26, 386); css(gauge, { border: '2px solid var(--mainD)', background: 'var(--panel)' });
  const gFill = h('div', 'abs', gauge); css(gFill, { left: '0', right: '0', bottom: '0', background: 'var(--teal)' });
  const gLab = h('div', 'abs', W, '<span style="font:800 30px Inter;color:var(--mainD)">16 KB</span><div class="t-small" style="margin-top:4px">一页的容量</div>'); px(gLab, 1240, 252);
  const gRow = h('div', 'abs t-small', W, '一行 73 字节<br>（68 字节的行 + 5 字节记录头）'); px(gRow, 1240, 360);
  let lastG = -1;
  F((t) => { const n = Math.min(nAt(t), 207); if (n === lastG) return; lastG = n; gFill.style.height = (100 * n / 207).toFixed(1) + '%'; gFill.style.background = n >= 207 ? 'var(--acc)' : 'var(--teal)'; });
  const full = h('div', 'tag acc', W, '满了'); px(full, 1240, 600); css(full, { fontSize: '30px' });
  [gauge, gLab, gRow].forEach((e) => { vanish(e, 0); show(e, T('a6') - 0.2, { x: 12, y: 0, d: 0.4 }); });
  vanish(full, 0); slam(full, T('a8', '满了'), { from: 1.4 }); sfx('error', T('a8', '满了'), { g: 0.4 });
  wipe(big, T('a5') - 0.1, { dir: 't', d: 0.5 }); sfx('pop', T('a5'), { g: 0.5 });
  vanish(idTop, 0); appear(idTop, tR0);
  // a5：页 4 是什么——文件条上那一格亮起、引一根线到放大的页；页 0–3 是文件自己的管理页（T1、G1、F1）
  const hl4s = h('div', 'abs', W); px(hl4s, FX + 4 * FP - 4, FY - 4, 34, 38); css(hl4s, { border: '3px solid var(--acc)' });
  const lead4 = path(ov, `M${FX + 4 * FP + 13},${FY + 62} C${FX + 4 * FP + 13},${200} ${820},${180} ${860},${236}`, 'acc', { w: 2 });
  const g4 = gloss(W, 120, 300, '', '<b>页 4</b>：主键树的根页（根页号从 INNODB_INDEXES 查到）；空表时，整棵树就只有这一页', { w: 560, src: '本片实验（T1、G1）' });
  const g03 = gloss(W, 120, 470, '', '<b>页 0–3</b>：文件自己的管理页——空间头、插入缓冲位图、段信息、表结构', { w: 560, src: '本片解析与 innochecksum（F1）' });
  vanish(hl4s, 0); show(hl4s, T('a5', '第 4 页'), { s: 1.3, y: 0, d: 0.3 }); arrowIn(lead4, T('a5', '第 4 页') + 0.2, 0.5);
  [g4, g03].forEach((g, i) => { vanish(g, 0); show(g, T('a5', '起点') + i * 0.6, { y: 8, d: 0.4 }); exit(g, T('a9') - 0.1, { y: 8, d: 0.3 }); });
  exit(hl4s, T('a9') - 0.1, { d: 0.3 }); svgOut(lead4, T('a7') - 0.1, 0.3);
  for (let r = 1; r <= 207; r += 23) sfx('tick', lerp(tR0, tR1, ease.io3(r / 207)), { g: 0.25 });
  // 第 208 行放不下：这一页分成两半，各落进一页叶子；第 4 页往上收成根
  const LX = (k) => 236 + k * 72, BW = 56, BY = 370, BH = 150;
  const RX = (k) => 960 + (k - 10) * 60;                      // 根页里第 k 项的中心：比叶子排得密，往下分叉到各页叶子
  const t208 = T('a9') + 0.05, tCut = tSplit, tFall = tCut + 0.9, tLeaf = tFall + 0.95;
  const r208 = h('div', 'abs', W); px(r208, 776 + 4 * RPX, 200, RW, RH_); css(r208, { background: 'var(--acc)' });
  const r208L = h('div', 'abs num', W, '208'); px(r208L, 776 + 4 * RPX - 6, 166); css(r208L, { font: '700 24px Inter', color: 'var(--acc)' });
  [r208, r208L].forEach((e) => { vanish(e, 0); show(e, t208, { y: -30, d: 0.35 }); });
  tl.fromTo(r208, { x: 0 }, { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: 'none', immediateRender: false }, t208 + 0.4);   // 顶在满页上，进不去
  sfx('error', t208 + 0.4, { g: 0.35 });
  const cutL = h('div', 'abs', W); px(cutL, 756, 256 + 11.5 * RPY - 1, 408, 0); css(cutL, { borderTop: '3px dashed var(--acc)' });
  vanish(cutL, 0); wipe(cutL, tCut - 0.2, { dir: 'l', d: 0.4 }); exit(cutL, tFall, { d: 0.25 });
  tl.to(h1, { y: -14, duration: 0.35, ease: 'power2.out' }, tCut + 0.2); tl.to(h2, { y: 14, duration: 0.35, ease: 'power2.out' }, tCut + 0.2);   // 两半先分开
  sfx('thud', tCut + 0.2, { g: 0.6 });
  [r208, r208L].forEach((e) => exit(e, tCut + 0.2, { y: 10, d: 0.3 }));
  const fall = (e, k, n, top0, h0, y0) => {                    // 落进近景树那一页叶子的「已装」部分
    const hh = 250 * n / 207, top1 = 400 + 250 - hh, lx = [800, 1120][k] - 75;
    tl.fromTo(e, { x: 0, y: y0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: lx - 776, y: top1 - top0, scaleX: 150 / 369, scaleY: hh / h0, duration: 0.95, ease: 'power3.inOut', immediateRender: false }, tFall);
    vanish(e, tLeaf);
  };
  fall(h1, 0, 103, 256, 12 * RPY, -14); fall(h2, 1, 105, 256 + 11 * RPY, 12 * RPY, 14);
  sfx('whoosh', tFall, { g: 0.4 });
  [gauge, gLab, gRow, full, idTop, idBot].forEach((e) => exit(e, tCut, { d: 0.3 }));
  // 第 4 页（空出来的框）留着，a11 讲到「留在上面」时升到上面，变成根
  const tRootIn = tLeaf + 0.4;                                  // 两半落定，第 4 页升到上面成了根（a11 再一项项写进去）
  tl.fromTo(big, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: 810 - 760, y: 210 - 240, scaleX: 300 / 400, scaleY: 64 / 420, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tRootIn - 0.7);
  vanish(big, tRootIn); sfx('whoosh', tRootIn - 0.7, { g: 0.35 });

  // ── 近景树：分裂之后到 a13 之前，根页与两页叶子居中放大，分叉线看得清；a13 收进整棵树的位置，由整棵树接着长 ──
  const tMorph = T('a13') - 0.35, tFullOn = tMorph + 0.7;
  const CU = h('div', 'abs', W); px(CU, 0, 0, 1920, 1080); css(CU, { pointerEvents: 'none' });
  const cuOv = overlay(CU);
  const CUL = [{ x: 800, n: 103, p: 7, first: 1 }, { x: 1120, n: 105, p: 8, first: 104 }], CUY = 400, CUW = 150, CUH = 250, CUR = { x: 810, y: 210, w: 300, h: 64 };
  const cuRoot = h('div', 'abs', CU); px(cuRoot, CUR.x, CUR.y, CUR.w, CUR.h); css(cuRoot, { border: '2px solid var(--mainD)', background: 'var(--pale)' });
  const cuRootNo = h('div', 'abs', CU, '<span style="font:700 30px Inter;color:var(--mainD)">页 4</span>'); px(cuRootNo, CUR.x, CUR.y - 44);
  const cuCells = CUL.map((L, i) => { const e = h('div', 'abs num', cuRoot, `${L.first} → ${L.p}`); px(e, i * 150, 14, 150); css(e, { textAlign: 'center', font: '700 28px Inter', color: 'var(--ink)' }); return e; });
  const cuLeaves = CUL.map((L) => { const g = pageBox(CU, L.x - CUW / 2, CUY, CUW, CUH, L.p, { cnt: true, fill: L.n / 207, n: L.n }); css(g.querySelector('.no'), { fontSize: '30px' }); css(g.cntEl, { fontSize: '30px' }); return g; });
  const cuLines = CUL.map((L, i) => path(cuOv, `M${CUR.x + 75 + i * 150},${CUR.y + CUR.h} L${L.x},${CUY - 46}`, 'mainD', { w: 2.4 }));
  const cuTagR = h('div', 'tag', CU, '根'); px(cuTagR, CUR.x - 110, CUR.y + 14); css(cuTagR, { fontSize: '28px' });
  const cuTagL = h('div', 'tag', CU, '叶子'); px(cuTagL, CUL[0].x - CUW / 2 - 130, CUY + 100); css(cuTagL, { fontSize: '28px' });
  const cuLink = path(cuOv, `M${CUL[0].x + CUW / 2 + 2},${CUY + CUH - 20} C${960},${CUY + CUH + 30} ${960},${CUY + CUH + 30} ${CUL[1].x - CUW / 2 - 2},${CUY + CUH - 20}`, 'main', { w: 2, arrow: false });
  cuLink.setAttribute('opacity', 0);
  vanish(CU, 0); appear(CU, tLeaf);
  cuLeaves.forEach((g) => { vanish(g, 0); appear(g, tLeaf); });
  [cuRoot, cuRootNo].forEach((e) => { vanish(e, 0); appear(e, tRootIn); });
  cuCells.forEach((e, i) => { vanish(e, 0); appear(e, T('a11', '两项') + i * 0.5 - 0.1); });
  cuLines.forEach((l, i) => arrowIn(l, T('a11', '两项') + i * 0.5, 0.45));
  [0, 1].forEach((i) => sfx('tick', T('a11', '两项') + i * 0.5, { g: 0.4 }));
  [cuTagR, cuTagL].forEach((e) => vanish(e, 0));
  // 收进整棵树：整组缩向整棵树前两页叶子所在的位置，同时淡出；整棵树同一刻淡入
  tl.fromTo(CU, { x: 0, y: 0, scale: 1, transformOrigin: '0 0' }, { x: 584, y: 132, scale: 0.42, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, tMorph);   // 缩到整棵树此刻（两页叶子、居中）的位置
  tl.to(CU, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, tMorph + 0.35);
  sfx('whoosh', tMorph, { g: 0.35 });

  // ── 主键树：根页 + 21 页叶子（位置固定；此刻有没有、装了多少由 n 决定） ──
  const rootPK = h('div', 'abs', W); px(rootPK, RX(0) - 34, 206, 0, 46); css(rootPK, { border: '1.5px solid var(--mainD)', background: 'var(--pale)' }); rootPK.dataset.name = '根页 4';
  const rootLbl = h('div', 'abs', W, '<span style="font:700 26px Inter;color:var(--mainD)">页 4</span>'); px(rootLbl, RX(0) - 34, 168);
  const rootCells = D.pk.leaves.map((l, k) => { const e = h('div', 'abs num', W, String(l.first)); px(e, RX(k) - 30, 215, 60); css(e, { textAlign: 'center', font: '600 22px Inter', color: 'var(--ink)' }); return e; });
  const leaves = D.pk.leaves.map((l, k) => pageBox(W, LX(k) - BW / 2, BY, BW, BH, l.page, { cnt: true }));
  const drops = D.pk.leaves.map((l, k) => path(ov, `M${RX(k)},253 L${LX(k)},${BY - 40}`, 'mainD', { w: 1.6 }));
  const chain = D.pk.leaves.slice(0, -1).map((l, k) => path(ov, `M${LX(k) + BW / 2 + 1},${BY + BH - 14} C${LX(k) + 36},${BY + BH + 14} ${LX(k) + 36},${BY + BH + 14} ${LX(k + 1) - BW / 2 - 1},${BY + BH - 14}`, 'main', { w: 1.8, arrow: false }));
  chain.forEach((p) => p.setAttribute('opacity', 0));
  const tRoot = tRootIn;
  vanish(rootPK, 0); vanish(rootLbl, 0); appear(rootPK, tFullOn); appear(rootLbl, tFullOn);
  let lastTree = '';
  F((t) => {
    const n = nAt(t), a = t >= tFullOn ? pkState(n) : null;   // 两页叶子时由近景树演，a13 起整棵树接着长
    const rootOn = t >= tFullOn, cntOn = t < Tend('a15') + 1.0;   // 叶子里的行数长树时才标
    const key = (a ? String(n) : '-') + (rootOn ? 'r' : '') + (cntOn ? 'c' : '');
    if (key === lastTree) return; lastTree = key;
    let k0 = 0;
    D.pk.leaves.forEach((l, k) => {
      const on = !!(a && a[l.page] != null);
      disp(leaves[k], on); disp(rootCells[k], on && rootOn); disp(drops[k], on && rootOn); if (k < 20) disp(chain[k], !!(a && a[D.pk.leaves[k + 1].page] != null));
      if (on) { k0 = k + 1; const v = a[l.page]; leaves[k].fillEl.style.height = (100 * v / 207).toFixed(1) + '%'; leaves[k].cntEl.textContent = cntOn ? v : ''; }
    });
    rootPK.style.width = (k0 ? RX(k0 - 1) - RX(0) + 68 : 0) + 'px'; disp(rootPK, k0 > 0 && rootOn);
  });
  PKE.slice(1).forEach((e) => sfx('tick', tOfRow(e.row), { g: 0.35 }));   // 每开一页叶子一声
  // a10：两页各装一半——两页叶子的行数亮起
  [0, 1].forEach((k) => lit(cuLeaves[k].cntEl, 'c-acc', T('a10', '一半') - 0.2 + k * 0.25, Tend('a10') + 0.4));
  { const sum = h('div', 'abs num', CU, '103 + 105 = 208'); px(sum, 820, 690); css(sum, { font: '800 40px Inter', color: 'var(--acc)' }); vanish(sum, 0); show(sum, T('a10', '一半') + 0.3, { y: 10, d: 0.4 }); exit(sum, T('a11', '两项') - 0.2, { d: 0.3 }); }
  // a11：根页里的两项依次亮起，各指向一页叶子
  [0, 1].forEach((k) => { lit(cuCells[k], 'c-main', T('a11', '两项') + k * 0.5, Tend('a11') + 0.3); });
  // 「根」「叶子」
  const lblRoot = h('div', 'tag', W, '根'); px(lblRoot, RX(0) - 92, 214);
  const lblLeaf = h('div', 'tag', W, '叶子'); px(lblLeaf, LX(0) - 106, BY + 80);
  [0, 1].forEach((k) => litWin(cuLeaves[k], 'hot', [[T('a11', '编号') + k * 0.35, Tend('a11') + 0.3], [T('a12', '叶子') - 0.1 + k * 0.2, Tend('a12') + 0.3]]));   // a11 每页叶子；a12「下面是叶子」再亮一次   // a11：「每一页叶子」——两页叶子各亮一下，对上根页里的两项
  slam(cuTagR, T('a12', '根'), { from: 1.3 }); slam(cuTagL, T('a12', '叶子'), { from: 1.3 }); sfx('pop', T('a12', '根'), { g: 0.5 });
  tl.to(cuLink, { opacity: 1, duration: 0.3 }, T('a12', '叶子') + 0.2);       // 两页叶子之间的链（a17 再细讲）
  [lblRoot, lblLeaf].forEach((e) => { vanish(e, 0); appear(e, tFullOn); });
  // ── 长树时整棵树居中（R13 第 13 条）：此刻有 m 页叶子，整棵树右移 (21 − m) × 36 像素；每开一页新叶子，0.3 秒挪过去 ──
  const mAt = (t) => { if (t >= tG1 + 0.6) return 21; let m = 0; pkT.forEach((tk, k) => { m += k < 2 ? 1 : ease.io3(clamp((t - tk) / 0.3)); }); return m; };
  let lastDx = null;
  F((t) => { const m = Math.round(mAt(t) * 100) / 100; if (m === lastDx) return; lastDx = m;
    const dx = (21 - m) * 36, dr = (21 - m) * 30;
    [lblLeaf, ...leaves].forEach((e) => { e.style.translate = dx ? dx + 'px 0' : ''; });
    [rootPK, rootLbl, lblRoot, ...rootCells].forEach((e) => { e.style.translate = dr ? dr + 'px 0' : ''; });
    chain.forEach((p_) => p_.setAttribute('transform', dx ? `translate(${dx},0)` : ''));
    drops.forEach((p_, k) => p_.setAttribute('d', `M${RX(k) + dr},253 L${LX(k) + dx},${BY - 40}`)); });


  // a16：叶子里放的就是整行——第 27 页拉出来看三行
  const K27 = PK_LEAVES.indexOf(27);
  const call = h('div', 'box', W); px(call, 300, 600, 1320, 250);
  const r27 = D.del.start.records.filter((r) => r.id >= 2049 && r.id <= 2051);
  const callHd = h('div', 'abs mono t-small', call, `${'id'.padEnd(7)}${'name CHAR(50)'.padEnd(52)}age`); px(callHd, 26, 16); css(callHd, { color: 'var(--mainD)', fontWeight: 700 });
  r27.forEach((r, i) => { const e = h('div', 'abs mono', call, `${String(r.id).padEnd(7)}${r.name.padEnd(52)}${r.age}`); px(e, 26, 56 + i * 46); css(e, { fontSize: '24px', color: r.id === 2050 ? 'var(--main)' : 'var(--ink)', fontWeight: r.id === 2050 ? 700 : 500 }); });
  const callPg = h('div', 'abs t-small', call, '页 27：207 行中的三行'); px(callPg, 26, 204);
  const callLine = path(ov, `M${LX(K27)},${BY + BH + 30} L${LX(K27)},596`, 'main', { w: 2 });
  callLine.setAttribute('opacity', 0);
  wipe(call, T('a16', '整行'), { dir: 't', d: 0.5 }); tl.fromTo(callLine, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, T('a16', '整行'));
  exit(call, Tend('a17') - 0.1, { y: 10, d: 0.3 }); tl.to(callLine, { opacity: 0, duration: 0.25 }, Tend('a17') - 0.1);
  // a17–a18：叶子链与范围读：2170…2180 从第 27 页的尾巴顺着链读进第 29 页（T9、S4）
  chain.forEach((p, k) => tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, T('a17', '左右') + k * 0.04));
  sfx('blip', T('a17', '左右'), { g: 0.5 });
  const scan = h('div', 'abs', W); css(scan, { height: '10px', background: 'var(--main)' });
  const xs0 = LX(K27) - 4, xs1 = LX(K27 + 1) + 6;
  px(scan, xs0, BY + BH + 32, 0, 10);
  const scanLbl = h('div', 'abs num', W, '2170 … 2180'); px(scanLbl, xs0 - 20, BY + BH + 52); css(scanLbl, { font: '700 26px Inter', color: 'var(--main)' });
  const tS0 = T('a18', '连续'), tS1 = Tend('a18'), tSx = T('a19') + 0.2;
  F((t) => { const k = clamp((t - tS0) / Math.max(0.1, tS1 - tS0)); scan.style.width = (k * (xs1 - xs0)).toFixed(0) + 'px'; disp(scan, t >= tS0 && t < tSx); });
  vanish(scanLbl, 0); show(scanLbl, tS0, { y: 6, d: 0.3 }); exit(scanLbl, tSx, { y: 6, d: 0.3 });
  lit(leaves[K27 + 1], 'hot', lerp(tS0, tS1, 0.55), tSx);
  tl.fromTo(chain[K27], { attr: { 'stroke-width': 1.8 } }, { attr: { 'stroke-width': 5 }, duration: 0.3, immediateRender: true }, lerp(tS0, tS1, 0.45));
  tl.to(chain[K27], { attr: { 'stroke-width': 1.8 }, duration: 0.3 }, tSx);
  // a19：行都在叶子里——叶子从左到右依次亮一下；路标——根页亮一下
  const tWave = T('a19', '叶子');
  // 叶子上各盖一块闪光层（单独的元素，不动叶子本身的颜色，免得盖住后面 .hot 的高亮）
  leaves.forEach((e, k) => { const f = h('div', 'abs', e); px(f, 0, 0, BW - 3, BH - 3); css(f, { background: 'var(--main)', opacity: 0 }); tl.fromTo(f, { opacity: 0 }, { opacity: 0.85, duration: 0.18, immediateRender: true }, tWave + k * 0.06); tl.to(f, { opacity: 0, duration: 0.4 }, tWave + k * 0.06 + 0.25); });
  tl.fromTo(rootPK, { backgroundColor: '#D9EEEF' }, { backgroundColor: '#AED9D7', duration: 0.3, immediateRender: true }, T('a19', '路标')); tl.to(rootPK, { backgroundColor: '#D9EEEF', duration: 0.5 }, T('a19', '路标') + 0.8);
  // a19–a20：B+ 树、聚簇索引
  const tagB = h('div', 'tag', W, 'B+ 树'); px(tagB, 1660, BY + BH + 62); css(tagB, { fontSize: '28px' });
  const tagC = h('div', 'tag', W, '聚簇索引'); px(tagC, 1390, BY + BH + 62); css(tagC, { fontSize: '28px', background: 'var(--main)' });
  slam(tagB, T('a19', 'B'), { from: 1.4 }); slam(tagC, T('a20', '聚簇索引'), { from: 1.3 });
  exit(tagB, T('a22') - 0.1, { y: 8, d: 0.3 }); exit(tagC, T('a22') + 0.1, { y: 8, d: 0.3 }); sfx('pop', T('a19', 'B')); sfx('pop', T('a20', '聚簇索引'));

  // ── a19：和上一集 MyISAM 的 B 树并排看（R13 第 15 条）——左：索引在 .MYI，每项「键 + 行号」，行在另一个文件 .MYD（V1、V2）；
  // 右：InnoDB 的树就是表，行在叶子里（M1、M36、M37），上层只放「编号 + 页号」（T2、S9），同一层的页左右相连（T9、F3）。三处区别逐个点亮 ──
  const CMPG = h('div', 'abs', W); px(CMPG, 120, 632, 1680, 320); css(CMPG, { pointerEvents: 'none' });
  const cOv = overlay(CMPG);
  const half_ = (x, title) => { const b = h('div', 'box', CMPG); px(b, x, 0, 820, 320); const t_ = h('div', 'abs', b, title); px(t_, 22, 14); css(t_, { font: '800 26px "Sans SC"', color: 'var(--ink)' }); return b; };
  const L_ = half_(0, '上一集 · MyISAM：B 树索引 + 数据文件'), R_ = half_(860, 'InnoDB：树就是表本身');
  const mini = (par, x, y, w, hh, html, bd = 'var(--mainD)', bg = 'var(--panel)') => { const e = h('div', 'abs', par, html); px(e, x, y, w, hh); css(e, { border: `1.5px solid ${bd}`, background: bg, font: '600 22px Inter', color: 'var(--ink2)', textAlign: 'center', lineHeight: hh - 3 + 'px' }); return e; };
  // 左：.MYI 里一棵小树（叶子是「键 → 行号」），箭头指到 .MYD 里的行
  const myiL = h('div', 'abs mono t-small', L_, '.MYI'); px(myiL, 22, 60);
  mini(L_, 120, 70, 120, 34, '键');
  const lfL = [mini(L_, 40, 150, 130, 70, '2049 → 行', 'var(--mainD)'), mini(L_, 190, 150, 130, 70, '2050 → 行', 'var(--mainD)')];
  path(cOv, 'M180,104 L105,150', 'mainD', { w: 1.4, arrow: false }); path(cOv, 'M180,104 L255,150', 'mainD', { w: 1.4, arrow: false });
  const mydL = h('div', 'abs mono t-small', L_, '.MYD'); px(mydL, 470, 60);
  const mydBox = h('div', 'abs', L_); px(mydBox, 470, 92, 320, 140); css(mydBox, { border: '1.5px solid var(--edge)', background: 'var(--pale)' });
  ['2049 User02049…', '2050 Alice', '2051 User02051…'].forEach((t_, k) => { const e = h('div', 'abs mono', mydBox, t_); px(e, 16, 14 + k * 40); css(e, { fontSize: '22px', color: k === 1 ? 'var(--mainD)' : 'var(--ink2)', fontWeight: k === 1 ? 700 : 500 }); });
  path(cOv, 'M320,185 C400,185 400,190 466,174', 'main', { w: 2 }); path(cOv, 'M170,205 C300,250 400,140 466,134', 'mute', { w: 1.6 });
  const nL = h('div', 'abs t-note', L_, '行在另一个文件里，索引只记「行号」'); px(nL, 22, 270);
  // 右：根页只放「编号 + 页号」，叶子里是整行，同一层的页左右相连
  const rootR = mini(R_, 460, 60, 320, 40, '1 → 7 &nbsp; 104 → 8 &nbsp; …', 'var(--mainD)', 'var(--pale)');
  const lfR = [0, 1, 2].map((k) => { const b = h('div', 'abs', R_); px(b, 120 + k * 210, 150, 170, 96); css(b, { border: '1.5px solid var(--mainD)', background: 'var(--teal)' });
    for (let r = 0; r < 4; r++) { const ln = h('div', 'abs', b); px(ln, 10, 12 + r * 20, 148, 12); css(ln, { background: 'var(--main)' }); } return b; });
  [0, 1, 2].forEach((k) => path(cOv, `M${860 + 620},${100} L${860 + 205 + k * 210},${150}`, 'mainD', { w: 1.4, arrow: false }));
  const lnk = [0, 1].map((k) => path(cOv, `M${860 + 290 + k * 210},${198} L${860 + 330 + k * 210},${198}`, 'main', { w: 3 }));
  const badge = (par, x, y, n, txt) => { const e = h('div', 'abs', par, `<span class="tag" style="position:static;font-size:22px;margin-right:8px">${n}</span><span class="t-small" style="color:var(--ink)">${txt}</span>`); px(e, x, y); vanish(e, 0); return e; };
  const b1 = badge(R_, 120, 262, '①', '行就在叶子里'), b2 = badge(R_, 40, 66, '②', '上层只放路标'), b3 = badge(R_, 470, 262, '③', '同层左右相连');
  const gB = gloss(CMPG, 0, -46, 'B+ 树', '<b>B+ 树</b>：源码里叫 B+Tree（手册称 B-tree）<span class="gl-src" style="display:inline;margin-left:14px">S8、M35</span>', { w: 1100 });
  CMPG.appendChild(cOv);                                          // 连线压在小框上面
  vanish(CMPG, 0); show(CMPG, T('a19') - 0.1, { y: 30, d: 0.5 }); sfx('whoosh', T('a19') - 0.1, { g: 0.35 });
  slam(b1, T('a19', '叶子'), { from: 1.3 }); slam(b2, T('a19', '路标'), { from: 1.3 }); slam(b3, T('a19', '路标') + 0.15, { from: 1.3 });
  [T('a19', '叶子'), T('a19', '路标'), T('a19', '路标') + 0.5].forEach((t_) => sfx('pop', t_, { g: 0.4 }));
  lnk.forEach((p_) => { p_.setAttribute('opacity', 0); tl.to(p_, { opacity: 1, duration: 0.3 }, T('a19', '路标') + 0.5); });
  vanish(gB, 0); show(gB, T('a19', 'B') + 0.2, { y: 8, d: 0.4 });
  tl.to(CMPG, { autoAlpha: 0, y: 20, duration: 0.35 }, T('a20') - 0.1);
  // a20：聚簇索引的注解（M1；没有主键时 InnoDB 自己生成一个，M29）
  const gC = gloss(W, 122, 650, '聚簇索引', '<b>聚簇索引</b>：表本身就是这棵主键树，每张表一棵', { w: 1100, src: '手册 M1、M29' });
  vanish(gC, 0); show(gC, T('a20', '聚簇索引') + 0.1, { y: 8, d: 0.4 }); exit(gC, T('a22', '第二棵树') - 0.3, { y: 8, d: 0.3 });
  const tblFrame = h('div', 'abs', W); px(tblFrame, 122, 201, LX(20) + 50 - 122, BY + BH + 52 - 201); css(tblFrame, { border: '3px dashed var(--main)' });   // 上边在「49 页 × 16 KB」与「页 4」之间
  const tblLbl = h('div', 'tag', W, 'users 表'); px(tblLbl, 122, BY + BH + 58); css(tblLbl, { background: 'var(--main)', fontSize: '26px' });
  vanish(tblFrame, 0); vanish(tblLbl, 0);
  show(tblFrame, T('a20', '表本身') - 0.1, { s: 1.02, y: 0, d: 0.4 }); slam(tblLbl, T('a20', '表本身') + 0.2, { from: 1.3 });
  exit(tblFrame, Tend('a20') + 0.2, { d: 0.3, y: 0 }); exit(tblLbl, Tend('a20') + 0.2, { d: 0.3 });

  // ── 姓名索引：第二棵树（16 页叶子）。每页叶子包一层：入场动外层，帧函数切内层 ──
  const NX = (j) => 247 + j * 94.5, NBW = 64, NBY = 700, NBH = 130;
  const rootNM = h('div', 'abs', W); px(rootNM, NX(0) - 50, 600, 0, 44); css(rootNM, { border: '1.5px solid var(--main)', background: '#E6F1F4' }); rootNM.dataset.name = '根页 5';
  const rootNMLbl = h('div', 'abs', W, '<span style="font:700 26px Inter;color:var(--main)">页 5</span><span class="t-small" style="margin-left:14px">姓名 + 编号</span>'); px(rootNMLbl, NX(0) - 44, 562);
  const short = (nm) => 'U' + nm.slice(4, 9);
  const nmGroups = D.nm.leaves.map(() => { const g = h('div', 'abs', W); px(g, 0, 0, 1920, 1080); css(g, { pointerEvents: 'none' }); return g; });
  const nmCells = D.nm.rootEntries.map((r, j) => { const e = h('div', 'abs num', nmGroups[j], short(r.name)); px(e, NX(j) - 47, 609, 94); css(e, { textAlign: 'center', font: '600 22px Inter', color: 'var(--ink)' }); return e; });
  const nleaves = D.nm.leaves.map((l, j) => { const p = pageBox(nmGroups[j], NX(j) - NBW / 2, NBY, NBW, NBH, l.page, { cnt: true }); css(p, { borderColor: 'var(--main)' }); css(p.fillEl, { background: '#CFE6EB' }); css(p.querySelector('.no'), { color: 'var(--main)' }); return p; });
  const ndropsOv = overlay(W);
  const ndrops = D.nm.leaves.map((l, j) => path(ndropsOv, `M${NX(j)},645 L${NX(j)},${NBY - 40}`, 'main', { w: 1.4 }));
  const tN = T('a22', '第二棵树');
  [...leaves, rootPK, ...rootCells].forEach((e) => tl.to(e, { opacity: 0.55, duration: 0.5 }, T('a22') + 0.1));
  [...leaves, rootPK, ...rootCells].forEach((e) => tl.to(e, { opacity: 1, duration: 0.5 }, T('a24') + 0.1));
  const key2 = h('div', 'abs mono', W, '<span class="c-main" style="font-weight:700">KEY</span> idx_name (name)'); px(key2, 1300, 560); css(key2, { fontSize: '30px' });
  vanish(key2, 0); wipe(key2, T('a22', '名字') - 0.2, { dir: 'l', d: 0.5 }); exit(key2, T('a23') + 0.2, { y: -8, d: 0.3 });
  vanish(ndropsOv, 0); show(ndropsOv, tN + 0.3, { y: 0, d: 0.5 });
  [rootNM, rootNMLbl].forEach((e, i) => wipe(e, tN + i * 0.05, { dir: 'l', d: 0.4 }));
  nmGroups.forEach((g, j) => show(g, tN + 0.2 + j * 0.05, { y: 16, d: 0.35 }));
  sfx('whoosh', tN, { g: 0.5 });
  let lastN = '';
  F((t) => {
    const n = nAt(t), b = nmState(n); const key = String(n);
    if (key === lastN) return; lastN = key;
    let j0 = 0;
    D.nm.leaves.forEach((l, j) => {
      const on = !!(b && b[l.page] != null);
      disp(nleaves[j], on); disp(nmCells[j], on); disp(ndrops[j], on);
      if (on) { j0 = j + 1; nleaves[j].fillEl.style.height = (100 * b[l.page] / 273).toFixed(1) + '%'; nleaves[j].cntEl.textContent = b[l.page]; }
    });
    rootNM.style.width = (j0 ? NX(j0 - 1) - NX(0) + 100 : 0) + 'px'; disp(rootNM, j0 > 0);
  });

  // a22：为什么要第二棵树——按名字找 Alice，主键树帮不上：只能把 21 页叶子从头翻到尾（叶子一页页亮过去；画面注解，不加旁白）
  { const tS = T('a22') + 0.15, dt = Math.max(0.05, (tN - 0.5 - tS) / 21);
    const s3x = h('style', '', W); s3x.textContent = '.pg.s3-scan { outline: 3px solid var(--acc); outline-offset: 2px; }';
    leaves.forEach((e, k) => lit(e, 's3-scan', tS + k * dt, tS + k * dt + 0.22));
    const why = h('div', 'tag acc', W, '按名字找：主键树只能一页页翻'); px(why, 700, BY + BH + 24); css(why, { fontSize: '26px' });
    vanish(why, 0); slam(why, tS, { from: 1.2 }); exit(why, tN + 0.3, { y: 8, d: 0.3 }); sfx('tick', tS, { g: 0.35 }); }
  // 两棵树同在时只标要讲的页（同屏要读的字少）：主键树只留页 27 的页号，根页的键收起；姓名索引的键只留头三项与最后一项，行数只留页 9
  { const t0 = tN - 0.2, t1 = Infinity; let last = null;
    F((t) => { const on = t >= t0 && t < t1; if (on === last) return; last = on;
      rootCells.forEach((e) => { e.style.visibility = on ? 'hidden' : ''; });
      leaves.forEach((e, k) => { const no = e.querySelector('.no'); if (no) no.style.visibility = on && PK_LEAVES[k] !== 27 ? 'hidden' : ''; });
      nmCells.forEach((e, j) => { e.style.visibility = on && !(j < 3 || j === nmCells.length - 1) ? 'hidden' : ''; });
      nleaves.forEach((e, j) => { const no = e.querySelector('.no'); if (no) no.style.visibility = on && NM_LEAVES[j] !== 9 ? 'hidden' : ''; if (e.cntEl) e.cntEl.style.visibility = on && NM_LEAVES[j] !== 9 ? 'hidden' : ''; }); }); }
  // a23b：二级索引的注解（M2、T4）
  const g2nd = gloss(W, 1000, 880, '二级索引', '<b>二级索引</b>：按自己的键排，叶子里是「键 + 主键」', { w: 800, src: '手册 M2；实验 T4' });
  vanish(g2nd, 0); show(g2nd, T('a23b', '二级索引') + 0.1, { y: 8, d: 0.4 }); exit(g2nd, T('a25') - 0.1, { y: 8, d: 0.3 });
  // a23：叶子里一项是「名字 + 编号」——第 9 页拉开一角
  const nCall = h('div', 'box', W); px(nCall, NX(1) - 20, 878, 620, 86);
  [['Alice', 2050], ['User00001…', 1], ['User00002…', 2]].forEach(([a, b], i) => {
    const e = h('div', 'abs mono', nCall, a); px(e, 20 + i * 196, 8); css(e, { fontSize: '24px', color: i === 0 ? 'var(--main)' : 'var(--ink)' });
    const f = h('div', 'abs mono', nCall, `→ ${b}`); px(f, 20 + i * 196, 44); css(f, { fontSize: '24px', color: 'var(--ink2)' });
    lit(f, 's3-id', T('a23', '编号') + i * 0.15);                 // 讲到「编号」时，每一项后面的编号标出来
  });
  { const s3s = h('style', '', W); s3s.textContent = '.s3-id { background: #DCEFF1; color: var(--mainD) !important; font-weight: 700; }'; }
  const nCallLine = path(ov, `M${NX(0)},${NBY + NBH + 42} L${NX(1) - 20},${905}`, 'main', { w: 1.8, arrow: false });
  vanish(nCall, 0); nCallLine.setAttribute('opacity', 0);
  show(nCall, T('a23', '名字'), { y: 8, d: 0.4 }); tl.fromTo(nCallLine, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, T('a23', '名字'));
  exit(nCall, T('a24') - 0.1, { y: 8, d: 0.3 });
  // a23b：主键以外的索引叫二级索引
  const tag2 = h('div', 'tag', W, '二级索引'); px(tag2, NX(0) + 250, 560); css(tag2, { fontSize: '26px', background: 'var(--main)' });
  vanish(tag2, 0); slam(tag2, T('a23b', '二级索引'), { from: 1.3 }); exit(tag2, T('a24') + 0.2, { d: 0.3 }); sfx('pop', T('a23b', '二级索引'), { g: 0.5 }); tl.to(nCallLine, { opacity: 0, duration: 0.25 }, T('a24') - 0.1);

  // ── 倒回第 2050 行：Alice 同时插进两棵树（G4） ──
  // 「已插入的行」计数：长树时与倒回时在场；第 208 行那一下用砖红
  // 两段各用一个计数元素（一个元素只入场一次）
  const counter = (tIn, tOut, x = 1600, y = 520, inline = false) => {
    const c = h('div', 'abs', W); px(c, x, y);
    const cn = h('div', 'num', c); css(cn, { font: '800 64px Inter', color: 'var(--main)' });
    const cl = h('div', 't-small', c, '已插入的行');
    if (inline) { css(cn, { lineHeight: '1' }); css(cl, { position: 'absolute', left: '190px', top: '26px' }); }   // 标签放在数字右边，但是单独一块（滚动的数字不算要读的字）
    let last = '';
    F((t) => { const n = nAt(t); const red = t >= T('a9') && t < tSplit + 0.6; const k = n + (red ? 'r' : ''); if (k === last) return; last = k; cn.textContent = n; cn.style.color = red ? 'var(--acc)' : 'var(--main)'; });
    show(c, tIn, { y: 8, d: 0.3 }); exit(c, tOut, { y: 8, d: 0.3 });
  };
  counter(tR0, tG1 + 0.8, 1196, 680, true); counter(tBack0, tFwd1 + 0.3, 1380, 528, true);   // 第一段放在页与容量条下面（离页近）   // 第二段：两棵树都展开时，右边只剩主键树行数与「页 5」之间这一条空当
  const NK9 = NM_LEAVES.indexOf(9);
  const chip = h('div', 'pill fill', W, 'Alice · 2050 · 42'); px(chip, 830, 530);
  vanish(chip, 0); slam(chip, tAlice - 0.1, { from: 1.4 }); sfx('pop', tAlice);
  const toPK = path(ov, `M${1060},${530} C${1080},${420} ${LX(K27) + 90},${420} ${LX(K27) + BW / 2 + 8},${BY + 110}`, 'main', { w: 2.6 });
  const toNM = path(ov, `M${830},${548} C${480},${544} ${168},${540} ${168},${650} S${180},${765} ${NX(NK9) - NBW / 2 - 4},${765}`, 'main', { w: 2.6 });   // 绕过根页 5 的左端，从左边进叶子 9
  arrowIn(toPK, T('a25', '两棵树') - 0.2, 0.6); arrowIn(toNM, T('a25', '两棵树') + 0.1, 0.6);
  litWin(leaves[K27], 'hot', [[T('a16'), Tend('a17') - 0.1], [tS0, tSx], [T('a26', '主键树'), tFwd0]]);
  lit(nleaves[NK9], 'hot', T('a27', '姓名索引'), tFwd0);
  exit(chip, tFwd0, { y: -8, d: 0.3 });
  [toPK, toNM].forEach((p) => tl.to(p, { autoAlpha: 0, duration: 0.3 }, tFwd0));
  const atPK = h('div', 'abs num', W, '2049 · <b style="color:var(--main)">2050</b>'); px(atPK, LX(K27) + 40, BY + 20); css(atPK, { font: '600 26px Inter', color: 'var(--ink2)', background: 'var(--panel)', border: '1.5px solid var(--main)', padding: '2px 10px' });
  vanish(atPK, 0); show(atPK, T('a26', '2049') - 0.2, { x: -10, y: 0, d: 0.4 }); exit(atPK, tFwd0, { d: 0.3 });
  const atNM = h('div', 'abs mono', W, '<b style="color:var(--main)">Alice</b> · User00001…'); px(atNM, NX(NK9) + 46, NBY + 10); css(atNM, { fontSize: '26px', color: 'var(--ink2)', background: 'var(--panel)', border: '1.5px solid var(--main)', padding: '2px 10px' });
  vanish(atNM, 0); show(atNM, T('a27', '字母') - 0.2, { x: -10, y: 0, d: 0.4 }); exit(atNM, tFwd0, { d: 0.3 });
  swaps(atNM, [[T('a27', '字母') - 0.2, '<b style="color:var(--main)">Alice</b>'], [T('a27', '前面'), '<b style="color:var(--main)">Alice</b> &lt; User00001 &lt; User00002 …']]);
  const lblR = h('div', 'tag', W, '当时最右边'); px(lblR, LX(K27) - 60, 160); vanish(lblR, 0); slam(lblR, T('a26', '最右边') - 0.3, { from: 1.3 }); exit(lblR, tFwd0 + 0.3, { d: 0.3 });
  const lblL = h('div', 'tag', W, '最左边'); px(lblL, NX(NK9) - 40, 878); vanish(lblL, 0); slam(lblL, T('a27', '排在'), { from: 1.3 }); exit(lblL, tFwd0 + 0.3, { d: 0.3 });

  // ── a28：一百万行，三层（T5） ──
  const big3 = h('div', 'box', W); px(big3, 420, 300, 1080, 420);
  h('div', 'abs', big3, '<span class="mono" style="font-size:30px;font-weight:700">users_big</span><span class="t-note" style="margin-left:16px">1 000 000 行</span>').style.cssText = 'position:absolute;left:30px;top:24px';
  const b3ov = overlay(big3);
  const node = (par, x, y, w, hh, txt) => { const e = h('div', 'abs', par, txt); px(e, x, y, w, hh); css(e, { border: '2px solid var(--mainD)', background: 'var(--pale)', font: '700 22px Inter', color: 'var(--mainD)', textAlign: 'center', lineHeight: hh - 4 + 'px' }); return e; };
  const MX = (k) => 90 + k * 150;                             // 5 页中间页的位置
  const L1 = node(big3, 370, 96, 120, 40, '根');
  const L2 = h('div', 'abs', big3); px(L2, 0, 0, 1080, 420);
  [0, 1, 2, 3, 4].forEach((k) => node(L2, MX(k) - 50, 176, 100, 36, ''));
  // 每页中间页下面一大片叶子：密排的竖线示意（一共 4 832 页，画不出一页一格）
  const comb = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%275%27 height=%2710%27%3E%3Crect width=%271.2%27 height=%2710%27 fill=%27%232D5A68%27/%3E%3C/svg%3E")';
  const L3 = h('div', 'abs', big3); px(L3, 0, 0, 1080, 420);
  [0, 1, 2, 3, 4].forEach((k) => { const b = h('div', 'abs', L3); px(b, MX(k) - 66, 262, 132, 64); css(b, { border: '1.5px solid var(--mainD)', backgroundColor: 'var(--teal)', backgroundImage: comb }); });
  const linesA = [0, 1, 2, 3, 4].map((k) => path(b3ov, `M430,136 L${MX(k)},176`, 'mainD', { w: 1.6, arrow: false }));
  const linesB = [0, 1, 2, 3, 4].flatMap((k) => [-50, 0, 50].map((d) => path(b3ov, `M${MX(k)},212 L${MX(k) + d},262`, 'mainD', { w: 1.2, arrow: false })));
  const lab = (y, txt) => { const e = h('div', 'abs num', big3, txt); px(e, 800, y); css(e, { font: '700 26px Inter', color: 'var(--mainD)' }); return e; };
  const t1_ = lab(100, `根 · ${D.big.PRIMARY[0]} 页`), t2_ = lab(178, `中间 · ${D.big.PRIMARY[1]} 页`), t3_ = lab(276, `叶子 · ${D.big.PRIMARY[2].toLocaleString('en-US').replace(',', ' ')} 页`);
  big3.appendChild(b3ov);
  const b3n = h('div', 'abs t-small', big3, `姓名索引：${D.big.idx_name.map((x) => x.toLocaleString('en-US').replace(',', ' ')).join(' + ')} 页，也是三层（T5）`); px(b3n, 30, 360);
  const tB = T('a28', '一百万');
  vanish(big3, 0);
  [...leaves, ...rootCells, rootPK, rootNM, rootLbl, rootNMLbl, lblRoot, lblLeaf, tagB, tagC, ...nmGroups].forEach((e) => to(e, tB - 0.2, { opacity: 0, duration: 0.4 }));   // 一百万行这一屏只留它自己（同屏要读的字少）
  [...drops, ...chain].forEach((p) => tl.to(p, { opacity: 0, duration: 0.4 }, tB - 0.2));
  to(ndropsOv, tB - 0.2, { opacity: 0, duration: 0.4 });
  wipe(big3, tB, { dir: 'b', d: 0.5 });
  [[L1, t1_], [L2, t2_], [L3, t3_]].forEach(([e, t_], i) => { const tt = T('a28', '三层') - 0.6 + i * 0.3; wipe(e, tt, { dir: 't', d: 0.4 }); vanish(t_, 0); show(t_, tt + 0.1, { x: -10, y: 0, d: 0.3 }); });
  linesA.forEach((p_) => { p_.setAttribute('opacity', 0); tl.to(p_, { opacity: 1, duration: 0.3 }, T('a28', '三层') - 0.4); });
  linesB.forEach((p_) => { p_.setAttribute('opacity', 0); tl.to(p_, { opacity: 1, duration: 0.3 }, T('a28', '三层') - 0.1); });
  show(b3n, tB + 0.5, { y: 6, d: 0.4 });
  sfx('thud', T('a28', '三层'), { g: 0.6 });

  W.appendChild(ov);
  W.appendChild(big3);                                        // 三层的小卡压在连线上面
});
