// 第 03 章 一个文件，两棵树：建一张空表 → 第 4 页一行一行装满 → 第 208 行分裂成两页叶子、第 4 页成了根
// → 一路长到 4096 行、21 页叶子 → 叶子左右相连、范围读顺着走 → B+ 树、聚簇索引、隐藏行号
// → 姓名索引是第二棵树 → 倒回第 2050 行：Alice 同时插进两棵树（主键树最右、姓名索引最左）→ 一百万行也只有三层。
// 树的每一刻都由「此刻插到第几行 n」算出来：页与行数取自一行一行插入的实测（FACTS G1–G4，D.growth）。
// 约定：帧函数只切 display（这一页此刻存不存在），GSAP 只动 opacity / 位移（入场、变淡），两者不碰同一个属性。
scene('s3', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  const ov = overlay(W);
  const disp = (e, on) => { const v = on ? '' : 'none'; if (e.style.display !== v) e.style.display = v; };
  // 同一个元素的几段高亮写成一个帧函数，避免几个 classAt 互相覆盖
  const litWin = (e, cls, wins) => { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } }); };

  // ── 时间 → 已经插了多少行 ──
  const tR0 = T('a6'), tR1 = T('a8', '满了'), tSplit = T('a9', '一分为二');
  const tG0 = T('a13'), tG1 = Tend('a15') - 0.4;
  const tBack0 = T('a24') + 0.1, tBack1 = Math.max(T('a24') + 1.2, Tend('a24') - 0.1), tAlice = T('a25'), tFwd0 = Tend('a27') + 0.2, tFwd1 = tFwd0 + 1.3;
  const nAt = (t) => {
    if (t < tR0) return 0;
    if (t < tR1) return Math.max(1, Math.round(lerp(1, 207, ease.io3(clamp((t - tR0) / (tR1 - tR0))))));
    if (t < tSplit) return 207;
    if (t < tG0) return 208;
    if (t < tG1) return Math.round(lerp(208, 4096, clamp((t - tG0) / (tG1 - tG0))));
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
      if (p === 4 && n > 0) { bg = 'var(--mainD)'; bd = 'var(--mainD)'; }
      else if (p === 5 && n > 0) { bg = named ? 'var(--main)' : 'var(--edge)'; bd = bg; }
      else if (a && PKSET.has(p) && a[p] != null) { bg = 'var(--teal)'; bd = 'var(--mainD)'; }
      else if (b && NMSET.has(p) && b[p] != null) { bg = named ? '#CFE6EB' : 'var(--band)'; bd = named ? 'var(--main)' : 'var(--edge)'; }
      c.style.background = bg; c.style.borderColor = bd;
    });
  });
  cells.forEach((c, i) => wipe(c, c0 + 0.1 + i * 0.012, { dir: 'b', d: 0.25 }));
  const scanF = h('div', 'abs', W); css(scanF, { height: '30px', width: '26px', background: 'var(--main)', opacity: 0.55 });
  const tF0 = T('a2') + 0.3, tF1 = Math.max(tF0 + 1.5, Tend('a2'));
  F((t) => { const on = t >= tF0 && t < tF1; disp(scanF, on); if (on) px(scanF, FX + Math.min(48, Math.floor((t - tF0) / (tF1 - tF0) * 49)) * FP, FY); });
  const ticks = [0, 8, 16, 24, 32, 40, 48].map((p, i) => { const e = h('div', 'abs num', W, String(p)); px(e, FX + p * FP - 10, FY + 34, 46); css(e, { textAlign: 'center', font: '500 22px Inter', color: 'var(--ink2)' }); vanish(e, 0); appear(e, T('a3', '一页') + i * Math.max(0.2, (Tend('a3') - T('a3', '一页')) / 8)); return e; });
  wipe(fileLbl, Math.max(c0 + 0.2, T('a2', '.ibd') - 0.2), { dir: 'l', d: 0.5 }); wipe(fileNote, T('a3', '16') - 0.1, { dir: 'l', d: 0.4 });
  sfx('whoosh', c0 + 0.1, { g: 0.4 });
  // a1：建表语句（与实验同一张表，lab_common.SCHEMA）；KEY idx_name 等第二棵树出现时再提
  const ddl = h('div', 'abs mono', W, ''); px(ddl, 300, 330); css(ddl, { fontSize: '32px', lineHeight: '1.5' });
  const DDL = '<span class="c-main" style="font-weight:700">CREATE TABLE</span> users (\n  id   INT <span class="c-main" style="font-weight:700">PRIMARY KEY</span>,\n  name CHAR(50),\n  age  TINYINT UNSIGNED,\n  KEY idx_name (name),\n  KEY idx_age (age)\n);';
  const tDdl = Math.max(c0 + 0.3, T('a1') - 0.2);
  typeText(ddl, DDL, tDdl, 34, { cursorUntil: Tend('a1') + 0.4 });
  exit(ddl, T('a4') - 0.3, { y: -12, d: 0.35 });
  const pkMark = h('div', 'abs', W); px(pkMark, 290, 330 + 48 - 2, 560, 50); css(pkMark, { border: '3px solid var(--main)' });
  vanish(pkMark, 0); show(pkMark, T('a1', '主键') - 0.1, { s: 1.04, y: 0, d: 0.35 }); exit(pkMark, T('a4') - 0.3, { y: -12, d: 0.35 });
  // a3：一页 16 KB；a4：读进内存一次就是一整页
  const c4 = h('div', 'abs num', W, '4'); px(c4, FX + 4 * FP - 10, FY + 34, 46); css(c4, { textAlign: 'center', font: '700 24px Inter', color: 'var(--mainD)' });
  const cell16 = h('div', 'abs num', W, '16 384 字节 ↓'); px(cell16, FX + 4 * FP - 60, FY - 38); css(cell16, { font: '700 24px Inter', color: 'var(--mainD)' });
  vanish(c4, 0); appear(c4, T('a3', '16')); show(cell16, T('a3', '16'), { y: -6, d: 0.4 }); exit(cell16, T('a5') - 0.2, { y: -6, d: 0.3 });
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
  const rowsBg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='2'%3E%3Crect width='10' height='1.1' fill='%2300758F'/%3E%3C/svg%3E\")";
  const bigRows = h('div', 'abs', big); px(bigRows, 16, 16, 368, 0); css(bigRows, { backgroundImage: rowsBg, backgroundSize: '10px 1.9px' });
  // 页里按编号排：最上面是 1，最下面跟着新插进来的那一行走
  const idTop = h('div', 'abs num', big, '1'); px(idTop, -56, 6, 40); css(idTop, { textAlign: 'right', font: '600 24px Inter', color: 'var(--ink2)' });
  const idBot = h('div', 'abs num', big, ''); px(idBot, -76, 0, 60); css(idBot, { textAlign: 'right', font: '700 24px Inter', color: 'var(--main)' });
  let lastBig = -1;
  F((t) => { const n = Math.min(nAt(t), 207); if (n === lastBig) return; lastBig = n; bigRows.style.height = (n * 1.9).toFixed(1) + 'px'; idBot.textContent = n > 1 ? n : ''; idBot.style.top = (16 + n * 1.9 - 14).toFixed(0) + 'px'; });
  wipe(big, T('a5') - 0.1, { dir: 't', d: 0.5 }); sfx('pop', T('a5'), { g: 0.5 });
  vanish(idTop, 0); appear(idTop, tR0);
  for (let r = 1; r <= 207; r += 23) sfx('tick', lerp(tR0, tR1, ease.io3(r / 207)), { g: 0.25 });
  // 第 208 行放不下：这一页分成两半，各落进一页叶子；第 4 页往上收成根
  const LX = (k) => 236 + k * 72, BW = 56, BY = 300, BH = 190;
  const halfEl = (top, n) => { const e = h('div', 'abs', W); px(e, 776, 256 + top, 368, n * 1.9); css(e, { backgroundColor: 'var(--teal)', backgroundImage: rowsBg, backgroundSize: '10px 1.9px', border: '2px solid var(--mainD)' }); return e; };
  const h1 = halfEl(0, 103), h2 = halfEl(103 * 1.9, 105);
  const fall = (e, k, n, top0) => {
    const hh = BH * n / 207, top1 = BY + BH - hh;
    vanish(e, 0); appear(e, tSplit);                            // 显隐与位移分开：倒着 seek 时起点状态是「不可见」
    fromTo(e, tSplit, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: LX(k) - BW / 2 - 776, y: top1 - top0, scaleX: BW / 368, scaleY: hh / (n * 1.9), duration: 0.6, ease: 'power3.inOut' });
    vanish(e, tSplit + 0.62);
  };
  fall(h1, 0, 103, 256); fall(h2, 1, 105, 256 + 103 * 1.9);
  exit(big, tSplit, { y: -10, d: 0.25 });
  sfx('thud', tSplit + 0.05, { g: 0.7 });

  // ── 主键树：根页 + 21 页叶子（位置固定；此刻有没有、装了多少由 n 决定） ──
  const rootPK = h('div', 'abs', W); px(rootPK, LX(0) - 34, 206, 0, 46); css(rootPK, { border: '1.5px solid var(--mainD)', background: 'var(--pale)' }); rootPK.dataset.name = '根页 4';
  const rootLbl = h('div', 'abs', W, '<span style="font:700 26px Inter;color:var(--mainD)">页 4</span>'); px(rootLbl, LX(0) - 34, 168);
  const rootCells = D.pk.leaves.map((l, k) => { const e = h('div', 'abs num', W, String(l.first)); px(e, LX(k) - 34, 215, 68); css(e, { textAlign: 'center', font: '600 22px Inter', color: 'var(--ink)' }); return e; });
  const leaves = D.pk.leaves.map((l, k) => pageBox(W, LX(k) - BW / 2, BY, BW, BH, l.page, { cnt: true }));
  const drops = D.pk.leaves.map((l, k) => path(ov, `M${LX(k)},253 L${LX(k)},${BY - 40}`, 'mainD', { w: 1.6 }));
  const chain = D.pk.leaves.slice(0, -1).map((l, k) => path(ov, `M${LX(k) + BW / 2 + 1},${BY + BH - 14} C${LX(k) + 36},${BY + BH + 14} ${LX(k) + 36},${BY + BH + 14} ${LX(k + 1) - BW / 2 - 1},${BY + BH - 14}`, 'main', { w: 1.8, arrow: false }));
  chain.forEach((p) => p.setAttribute('opacity', 0));
  const tRoot = tSplit + 0.35;
  vanish(rootPK, 0); vanish(rootLbl, 0); appear(rootPK, tRoot); appear(rootLbl, tRoot);
  let lastTree = '';
  F((t) => {
    const n = nAt(t), a = t >= tSplit + 0.6 ? pkState(n) : null;
    const grow = a ? clamp((t - (tSplit + 0.6)) / 0.9) : 1;     // 分裂刚完成时两页叶子的行数从页里「落」下来
    const key = a ? n + ':' + grow.toFixed(2) : '-';
    if (key === lastTree) return; lastTree = key;
    let k0 = 0;
    D.pk.leaves.forEach((l, k) => {
      const on = !!(a && a[l.page] != null);
      disp(leaves[k], on); disp(rootCells[k], on); disp(drops[k], on); if (k < 20) disp(chain[k], !!(a && a[D.pk.leaves[k + 1].page] != null));
      if (on) { k0 = k + 1; const v = n <= 208 ? Math.round(a[l.page] * ease.out3(grow)) : a[l.page]; leaves[k].fillEl.style.height = (100 * v / 207).toFixed(1) + '%'; leaves[k].cntEl.textContent = v; }
    });
    rootPK.style.width = (k0 ? LX(k0 - 1) - LX(0) + 68 : 0) + 'px'; disp(rootPK, k0 > 0);
  });
  PKE.slice(1).forEach((e) => sfx('tick', lerp(tG0, tG1, (e.row - 208) / (4096 - 208)), { g: 0.35 }));
  // a10：两页各装一半——两页叶子的行数亮起
  [0, 1].forEach((k) => lit(leaves[k].cntEl, 'c-acc', T('a10', '一半') - 0.2 + k * 0.25, Tend('a10') + 0.4));
  // a11：根页里的两项依次亮起，各指向一页叶子
  [0, 1].forEach((k) => { lit(rootCells[k], 'c-main', T('a11', '两项') + k * 0.5, Tend('a11') + 0.3); tl.fromTo(drops[k], { attr: { 'stroke-width': 1.6 } }, { attr: { 'stroke-width': 4 }, duration: 0.25, immediateRender: true }, T('a11', '两项') + k * 0.5); tl.to(drops[k], { attr: { 'stroke-width': 1.6 }, duration: 0.3 }, Tend('a11') + 0.3); });
  // 「根」「叶子」
  const lblRoot = h('div', 'tag', W, '根'); px(lblRoot, LX(0) - 92, 214);
  const lblLeaf = h('div', 'tag', W, '叶子'); px(lblLeaf, LX(0) - 106, BY + 80);
  slam(lblRoot, T('a12', '根'), { from: 1.3 }); slam(lblLeaf, T('a12', '叶子'), { from: 1.3 }); sfx('pop', T('a12', '根'), { g: 0.5 });

  // a16：叶子里放的就是整行——第 27 页拉出来看三行
  const K27 = PK_LEAVES.indexOf(27);
  const call = h('div', 'box', W); px(call, LX(K27) - 300, 600, 600, 200);
  const r27 = D.del.start.records.filter((r) => r.id >= 2049 && r.id <= 2051);
  r27.forEach((r, i) => { const e = h('div', 'abs mono', call, `${String(r.id).padStart(5)}  ${(r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name).padEnd(14)} ${r.age}`); px(e, 26, 22 + i * 46); css(e, { fontSize: '28px', color: r.id === 2050 ? 'var(--main)' : 'var(--ink)', fontWeight: r.id === 2050 ? 700 : 500 }); });
  const callPg = h('div', 'abs t-small', call, '页 27：207 行中的三行'); px(callPg, 330, 160);
  const callLine = path(ov, `M${LX(K27)},${BY + BH + 30} L${LX(K27)},598`, 'main', { w: 2 });
  callLine.setAttribute('opacity', 0);
  wipe(call, T('a16', '整行'), { dir: 't', d: 0.5 }); tl.fromTo(callLine, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, T('a16', '整行'));
  exit(call, T('a17') + 0.05, { y: 10, d: 0.3 }); tl.to(callLine, { opacity: 0, duration: 0.25 }, T('a17') + 0.05);
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
  const tagB = h('div', 'tag', W, 'B+ 树'); px(tagB, 1660, 546); css(tagB, { fontSize: '28px' });
  const tagC = h('div', 'tag', W, '聚簇索引：表本身'); px(tagC, 1390, 546); css(tagC, { fontSize: '28px', background: 'var(--main)' });
  slam(tagB, T('a19', 'B'), { from: 1.4 }); slam(tagC, T('a20', '聚簇索引'), { from: 1.3 });
  [tagB, tagC].forEach((e) => exit(e, T('a21') - 0.1, { y: 8, d: 0.3 })); sfx('pop', T('a19', 'B')); sfx('pop', T('a20', '聚簇索引'));
  const tblFrame = h('div', 'abs', W); px(tblFrame, LX(0) - 50, 196, LX(20) - LX(0) + 100, BY + BH + 60 - 196); css(tblFrame, { border: '3px dashed var(--main)' });
  const tblLbl = h('div', 'tag', W, 'users 表'); px(tblLbl, LX(0) - 50, BY + BH + 66); css(tblLbl, { background: 'var(--main)', fontSize: '26px' });
  vanish(tblFrame, 0); vanish(tblLbl, 0);
  show(tblFrame, T('a20', '表本身') - 0.1, { s: 1.02, y: 0, d: 0.4 }); slam(tblLbl, T('a20', '表本身') + 0.2, { from: 1.3 });
  exit(tblFrame, Tend('a20') + 0.2, { d: 0.3, y: 0 }); exit(tblLbl, Tend('a20') + 0.2, { d: 0.3 });
  // a21：没有主键时的隐藏行号（M29）
  const hid = h('div', 'box', W); px(hid, 140, 600, 700, 250);
  const hidT = h('div', 'abs t-note', hid, '没有主键的表'); px(hidT, 24, 14);
  const hidHead = h('div', 'abs', hid, '<span class="fld hidden" style="display:inline-block;padding:4px 10px"><span class="k">DB_ROW_ID · 6 字节</span></span>'); px(hidHead, 24, 60);
  [['1', 'Erin', '31'], ['2', 'Frank', '27'], ['3', 'Grace', '45']].forEach((r, i) => { const e = h('div', 'abs mono', hid, `<span style="color:var(--mainD);background:var(--pale);padding:0 10px">${r[0].padStart(3)}</span>   ${r[1].padEnd(8)}${r[2]}`); px(e, 24, 112 + i * 42); css(e, { fontSize: '28px' }); slide(e, T('a21') + 0.8 + i * Math.max(0.6, (Tend('a21') - T('a21') - 0.8) / 3.2), { x: -30 }); });
  css(hidHead, { fontSize: '22px' });
  wipe(hid, T('a21'), { dir: 'l', d: 0.5 }); exit(hid, Tend('a21') + 0.3, { y: 10, d: 0.3 });

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
  // a23：叶子里一项是「名字 + 编号」——第 9 页拉开一角
  const nCall = h('div', 'box', W); px(nCall, NX(1) - 20, 852, 620, 100);
  [['Alice', 2050], ['User00001…', 1], ['User00002…', 2]].forEach(([a, b], i) => {
    const e = h('div', 'abs mono', nCall, a); px(e, 20 + i * 196, 12); css(e, { fontSize: '24px', color: i === 0 ? 'var(--main)' : 'var(--ink)' });
    const f = h('div', 'abs mono', nCall, `→ ${b}`); px(f, 20 + i * 196, 52); css(f, { fontSize: '24px', color: 'var(--ink2)' });
  });
  const nCallLine = path(ov, `M${NX(0)},${NBY + NBH + 30} L${NX(1) - 20},${880}`, 'main', { w: 1.8, arrow: false });
  vanish(nCall, 0); nCallLine.setAttribute('opacity', 0);
  show(nCall, T('a23', '名字'), { y: 8, d: 0.4 }); tl.fromTo(nCallLine, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, T('a23', '名字'));
  exit(nCall, T('a24') - 0.1, { y: 8, d: 0.3 }); tl.to(nCallLine, { opacity: 0, duration: 0.25 }, T('a24') - 0.1);

  // ── 倒回第 2050 行：Alice 同时插进两棵树（G4） ──
  // 「已插入的行」计数：长树时与倒回时在场；第 208 行那一下用砖红
  // 两段各用一个计数元素（一个元素只入场一次）
  const counter = (tIn, tOut) => {
    const c = h('div', 'abs', W); px(c, 1600, 520);
    const cn = h('div', 'num', c); css(cn, { font: '800 64px Inter', color: 'var(--main)' });
    h('div', 't-small', c, '已插入的行');
    let last = '';
    F((t) => { const n = nAt(t); const red = t >= T('a9') && t < tSplit + 0.6; const k = n + (red ? 'r' : ''); if (k === last) return; last = k; cn.textContent = n; cn.style.color = red ? 'var(--acc)' : 'var(--main)'; });
    show(c, tIn, { y: 8, d: 0.3 }); exit(c, tOut, { y: 8, d: 0.3 });
  };
  counter(tR0, tG1 + 0.8); counter(tBack0, tFwd1 + 0.3);
  const NK9 = NM_LEAVES.indexOf(9);
  const chip = h('div', 'pill fill', W, 'Alice · 2050 · 42'); px(chip, 830, 530);
  vanish(chip, 0); slam(chip, tAlice - 0.1, { from: 1.4 }); sfx('pop', tAlice);
  const toPK = path(ov, `M${1060},${530} C${1080},${420} ${LX(K27) + 90},${420} ${LX(K27) + BW / 2 + 8},${BY + 110}`, 'main', { w: 2.6 });
  const toNM = path(ov, `M${880},${578} C${640},${640} ${NX(NK9) + 20},${600} ${NX(NK9)},${NBY - 44}`, 'main', { w: 2.6 });
  arrowIn(toPK, T('a25', '两棵树') - 0.2, 0.6); arrowIn(toNM, T('a25', '两棵树') + 0.1, 0.6);
  litWin(leaves[K27], 'hot', [[T('a16'), T('a17')], [tS0, tSx], [T('a26', '主键树'), tFwd0]]);
  lit(nleaves[NK9], 'hot', T('a27', '姓名索引'), tFwd0);
  exit(chip, tFwd0, { y: -8, d: 0.3 });
  [toPK, toNM].forEach((p) => tl.to(p, { autoAlpha: 0, duration: 0.3 }, tFwd0));
  const atPK = h('div', 'abs num', W, '2049 · <b style="color:var(--main)">2050</b>'); px(atPK, LX(K27) + 40, BY + 20); css(atPK, { font: '600 26px Inter', color: 'var(--ink2)', background: 'var(--panel)', border: '1.5px solid var(--main)', padding: '2px 10px' });
  vanish(atPK, 0); show(atPK, T('a26', '2049') - 0.2, { x: -10, y: 0, d: 0.4 }); exit(atPK, tFwd0, { d: 0.3 });
  const atNM = h('div', 'abs mono', W, '<b style="color:var(--main)">Alice</b> · User00001…'); px(atNM, NX(NK9) + 46, NBY + 10); css(atNM, { fontSize: '26px', color: 'var(--ink2)', background: 'var(--panel)', border: '1.5px solid var(--main)', padding: '2px 10px' });
  vanish(atNM, 0); show(atNM, T('a27', '字母') - 0.2, { x: -10, y: 0, d: 0.4 }); exit(atNM, tFwd0, { d: 0.3 });
  swaps(atNM, [[T('a27', '字母') - 0.2, '<b style="color:var(--main)">Alice</b>'], [T('a27', '前面'), '<b style="color:var(--main)">Alice</b> &lt; User00001 &lt; User00002 …']]);
  const lblR = h('div', 'tag', W, '当时最右边'); px(lblR, LX(K27) - 60, 160); vanish(lblR, 0); slam(lblR, T('a26', '最右边'), { from: 1.3 }); exit(lblR, tFwd0, { d: 0.3 });
  const lblL = h('div', 'tag', W, '最左边'); px(lblL, NX(NK9) - 40, 520); vanish(lblL, 0); slam(lblL, T('a27', '最左边'), { from: 1.3 }); exit(lblL, tFwd0, { d: 0.3 });

  // ── a28：一百万行，三层（T5） ──
  const big3 = h('div', 'box', W); px(big3, 420, 300, 1080, 420);
  h('div', 'abs', big3, '<span class="mono" style="font-size:30px;font-weight:700">users_big</span><span class="t-note" style="margin-left:16px">1 000 000 行</span>').style.cssText = 'position:absolute;left:30px;top:24px';
  const lvl = (y, label, w, fill) => {
    const g = h('div', 'abs', big3); px(g, 30, y, 1000, 50);
    const n = h('div', 'abs num', g, label); px(n, 0, 8, 200); css(n, { font: '700 26px Inter', color: 'var(--mainD)' });
    const bar = h('div', 'abs', g); px(bar, 220, 0, w, 46); css(bar, { border: '2px solid var(--mainD)', background: fill });
    return g;
  };
  const L1 = lvl(100, `根 · ${D.big.PRIMARY[0]} 页`, 46, 'var(--pale)'), L2 = lvl(180, `中间 · ${D.big.PRIMARY[1]} 页`, 5 * 46, 'var(--pale)'), L3 = lvl(260, `叶子 · ${D.big.PRIMARY[2].toLocaleString('en-US').replace(',', ' ')} 页`, 780, 'var(--teal)');
  const b3n = h('div', 'abs t-small', big3, `姓名索引：${D.big.idx_name.map((x) => x.toLocaleString('en-US').replace(',', ' ')).join(' + ')} 页，也是三层`); px(b3n, 250, 350);
  const tB = T('a28', '一百万');
  vanish(big3, 0);
  [...leaves, ...rootCells, rootPK, rootNM, rootLbl, rootNMLbl, lblRoot, lblLeaf, tagB, tagC, ...nmGroups].forEach((e) => to(e, tB - 0.2, { opacity: 0.16, duration: 0.4 }));
  [...drops, ...chain].forEach((p) => tl.to(p, { opacity: 0.12, duration: 0.4 }, tB - 0.2));
  to(ndropsOv, tB - 0.2, { opacity: 0.12, duration: 0.4 });
  wipe(big3, tB, { dir: 'b', d: 0.5 });
  [L1, L2, L3].forEach((e, i) => wipe(e, T('a28', '三层') - 0.4 + i * 0.25, { dir: 'l', d: 0.45 }));
  show(b3n, T('a28', '三层') + 0.6, { y: 6, d: 0.4 });
  sfx('thud', T('a28', '三层'), { g: 0.6 });

  W.appendChild(ov);
  W.appendChild(big3);                                        // 三层的小卡压在连线上面
});
