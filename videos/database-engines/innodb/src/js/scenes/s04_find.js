// 第 04 章 怎么找：架构图（内存里的缓冲池 / 磁盘上的两棵树）+ 一条「查询」泳道。
// 按编号找：根页 4 → 叶页 27，第一次从磁盘读进缓冲池（L1）；页 27 里 207 行、52 格目录，先对半找再顺链（P1、S5、M28）；
// 再找一次不读盘；按名字找：页 5 → 页 9 拿到 2050 → 回到主键树取整行（L2）；只要编号时不必回表（E1）；缓冲池满了按 LRU 挪出旧页（M27）。
scene('s4', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  drift3(makeCamera(W), s, 1);            // 缓慢漂移（parts.js）
  const ov = overlay(W);

  // ── 架构图 ──
  const zm = zone(W, 120, 220, 520, 660, '内存', 'In-Memory');
  const zd = zone(W, 670, 220, 1130, 660, '磁盘', 'On-Disk');
  const pool = boxEl(zm, 24, 96, 472, 420, '缓冲池');
  const SLOT = (i) => ({ x: 120 + 24 + 36 + (i % 5) * 84, y: 220 + 96 + 70 + Math.floor(i / 5) * 92 });
  const slots = [];
  for (let i = 0; i < 15; i++) { const p = SLOT(i); const e = h('div', 'abs', W); px(e, p.x, p.y, 62, 62); css(e, { border: '1.5px dashed var(--edge)', background: 'var(--panel)' }); slots.push(e); }
  const ibd = boxEl(zd, 24, 96, 1082, 540, 'users.ibd');
  // 主键树（迷你）：根页 4 + 21 页叶子
  const PKX = (k) => 700 + 18 + k * 50, PKY = 500, NMX = (j) => 700 + 18 + j * 66, NMY = 760;
  const pkRoot = h('div', 'abs', W, '<div style="text-align:center;font:700 24px Inter;color:var(--mainD);padding-top:7px">4</div>'); px(pkRoot, 1180, 380, 70, 44); css(pkRoot, { border: '2px solid var(--mainD)', background: 'var(--pale)' });
  const pkLeaf = PK_LEAVES.map((p, k) => { const e = sq(W, PKX(k), PKY, p, 'on'); css(e, { width: '40px', height: '40px' }); return e; });
  const pkLines = PK_LEAVES.map((p, k) => path(ov, `M1215,424 L${PKX(k) + 20},${PKY}`, 'mute', { arrow: false, w: 1 }));
  const nmRoot = h('div', 'abs', W, '<div style="text-align:center;font:700 24px Inter;color:var(--main);padding-top:7px">5</div>'); px(nmRoot, 1180, 640, 70, 44); css(nmRoot, { border: '2px solid var(--main)', background: '#E6F1F4' });
  const nmLeaf = NM_LEAVES.map((p, j) => { const e = sq(W, NMX(j), NMY, p, 'nm'); css(e, { width: '40px', height: '40px' }); return e; });
  const nmLines = NM_LEAVES.map((p, j) => path(ov, `M1215,684 L${NMX(j) + 20},${NMY}`, 'mute', { arrow: false, w: 1 }));
  const pkT = h('div', 'abs t-small', W, '主键树'); px(pkT, 700, 386);
  const nmT = h('div', 'abs t-small', W, '姓名索引'); px(nmT, 700, 646);
  const K27 = PK_LEAVES.indexOf(27), K9 = NM_LEAVES.indexOf(9);

  [zm, zd].forEach((z, i) => wipe(z, c0 + 0.1 + i * 0.1, { dir: 'b', d: 0.5 }));
  [pkRoot, nmRoot, pkT, nmT].forEach((e, i) => show(e, c0 + 0.4 + i * 0.05, { y: 10, d: 0.4 }));
  [...pkLeaf, ...nmLeaf].forEach((e, i) => show(e, c0 + 0.5 + (i % 21) * 0.02, { y: 10, d: 0.3 }));
  slots.forEach((e, i) => show(e, c0 + 0.3 + i * 0.02, { y: 6, d: 0.3 }));
  sfx('whoosh', c0 + 0.1, { g: 0.4 });
  lit(pool, 'on', T('b2', '缓冲池'), T('b3'));
  // b1：读一行先要把页读进内存——磁盘到内存的粗箭头（手册图的画法）
  const arrMem = bigArrow(ov, 760, 284, 600, 30, '#2D5A68');   // 箭头翼不碰缓冲池的白框
  svgIn(arrMem, T('b1', '内存') - 0.2, 0.4); svgOut(arrMem, T('b3'), 0.3);
  // b2：放读过的页——两页从磁盘那边进来，落在缓冲池最后两格（别的表、别的查询读过的页）；先落靠里的一格，后来的那页不从它上面飞过
  [[13, T('b2', '内存')], [14, T('b2', '读过')]].forEach(([i, t]) => {
    const v = h('div', 'abs', W); { const p = SLOT(i); px(v, p.x, p.y, 62, 62); }
    css(v, { background: 'var(--teal)', border: '2px solid var(--mainD)' });
    vanish(v, 0); appear(v, t); fromTo(v, t, { x: 700 }, { x: 0, duration: 0.8, ease: 'power3.out' });
  });

  // ── 查询泳道（顶上） ──
  const tq1 = T('b3'), tq2 = T('b10'), tq3 = T('b11'), tq4 = T('b15');
  const LN = lanes(W, { x: 120, y: 152, w: 1680, gap: 120, rowH: 0, names: ['查询'], pts: [[tq1 - 0.6, 260], [tq2, 860], [tq3, 1180], [tq4, 1560], [Tend('b16'), 1780]] });
  LN.enter(c0 + 0.2);
  const q1 = LN.event(0, tq1, 'id = 2050', 'ink', -36), q2 = LN.event(0, tq2, 'id = 2050', 'ink', -36), q3 = LN.event(0, tq3, "name = 'Alice'", 'ink', -36), q4 = LN.event(0, tq4, "只要 id · name = 'Alice'", 'ink', -36);   // 框在线上方：播放头停在这一刻时不压框里的字
  LN.playhead(tq1 - 0.6, Tend('b16'), 142, 184);
  const reads = (x, n, t) => { const e = h('div', 'abs num', W, `读盘 ${n} 页`); px(e, x, 186); css(e, { font: '600 22px Inter', color: n ? 'var(--acc)' : 'var(--main)' }); show(e, t, { y: -6, d: 0.3 }); return e; };
  reads(LN.X(tq1) - 50, D.lookup[0].pages.length, T('b5', '磁盘'));
  reads(LN.X(tq2) - 50, D.lookup[1].pages.length, T('b10', '磁盘'));
  reads(LN.X(tq3) - 50, D.lookup[2].pages.length, T('b12', '叶子'));

  // 从磁盘读进缓冲池：页方块飞到缓冲池的格子里
  const fillSlot = (i, label, t, color, instant = false) => {
    const p = SLOT(i);
    const pg = h('div', 'abs', W, `<div style="text-align:center;font:700 26px Inter;color:#fff;padding-top:14px">${label}</div>`); px(pg, p.x, p.y, 62, 62); css(pg, { background: color, border: `2px solid ${color}` });
    if (instant) { vanish(pg, 0); appear(pg, t); } else show(pg, t, { s: 0.6, y: 0, d: 0.35 });
    return pg;
  };
  const flyTo = (srcEl, i, t, color) => {
    const b = box(srcEl), p = SLOT(i);
    const f = h('div', 'abs', W); px(f, b.x, b.y, b.w, b.h); css(f, { background: color, border: `2px solid ${color}` });
    vanish(f, 0); appear(f, t);
    fromTo(f, t, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: p.x - b.x, y: p.y - b.y, scaleX: 62 / b.w, scaleY: 62 / b.h, duration: 0.7, ease: 'power3.inOut' });
    vanish(f, t + 0.72); sfx('pop', t + 0.65, { g: 0.5 });
    return fillSlot(i, srcEl.textContent.trim(), t + 0.7, color, true);
  };
  // b3–b5：按编号找：根页 4 → 叶页 27，两页都从磁盘读
  const pathPK = path(ov, `M1215,424 L${PKX(K27) + 20},${PKY}`, 'main', { w: 4 });
  arrowIn(pathPK, T('b4', '27') - 0.3, 0.5);
  lit(pkRoot, 'hot', T('b3', '2050'), T('b6'));
  const rootPop = h('div', 'abs', W, '<span class="num" style="font:600 24px Inter;color:var(--ink2)">… 1760</span><span class="num" style="font:800 26px Inter;color:var(--main);margin:0 10px">1967 → 27</span><span class="num" style="font:600 24px Inter;color:var(--ink2)">2174 …</span>');
  px(rootPop, 1262, 384); css(rootPop, { background: 'var(--panel)', border: '1.5px solid var(--mainD)', padding: '4px 12px' });
  vanish(rootPop, 0); show(rootPop, T('b4', '根页'), { x: -10, y: 0, d: 0.35 }); exit(rootPop, T('b6') - 0.1, { d: 0.3 });
  const s4 = flyTo(pkRoot, 0, T('b5', '两页') - 0.1, 'var(--mainD)');
  const s27 = flyTo(pkLeaf[K27], 1, T('b5', '磁盘') + 0.1, 'var(--main)');
  lit(pkLeaf[K27], 'hot', T('b4', '27'), T('b6'));

  // ── b6–b9：页 27 里面：207 行按编号成链，页尾 52 格目录；先在目录里对半找，再顺链 ──
  const PG = { x: 700, y: 300, w: 1080, h: 560 };
  const pg27 = boxEl(W, PG.x, PG.y, PG.w, PG.h, '');
  const pgT = h('div', 'abs', pg27, `<span style="font:700 30px Inter;color:var(--mainD)">页 27</span><span class="t-small" style="margin-left:16px">${D.dir.n_recs} 行 · 目录 ${D.dir.n_dir_slots} 格</span>`); px(pgT, 24, 16);
  // 记录：207 行排成 9 列 × 23 行，按编号蛇形走（每一行的头部指向下一行）
  const COLS = 9, ROWS = 23, RX = 30, RY = 104, CW = 92, RH = 18.5;
  const firstId = D.pk.leaves[K27].first;
  const recPos = (i) => { const c = Math.floor(i / ROWS), r = c % 2 === 0 ? i % ROWS : ROWS - 1 - (i % ROWS); return { x: RX + c * CW, y: RY + r * RH }; };
  const recSvg = svg('svg', { width: PG.w, height: PG.h, style: 'position:absolute;left:0;top:0' }, pg27);
  let dChain = '';
  for (let i = 0; i < D.dir.n_recs; i++) { const p = recPos(i); dChain += (i ? ' L' : 'M') + (p.x + 30) + ',' + (p.y + 8); }
  svg('path', { d: dChain, fill: 'none', stroke: '#9FBFC4', 'stroke-width': 1.5 }, recSvg);
  const recEls = [];
  for (let i = 0; i < D.dir.n_recs; i++) {
    const p = recPos(i), id = firstId + i;
    const owner = (i + 1) % 4 === 0 || i === D.dir.n_recs - 1;            // 每 4 行一格目录：一格指向这一组的最后一行（S5、P1）
    const r = svg('rect', { x: p.x + 4, y: p.y + 2, width: 52, height: 13, fill: id === 2050 ? '#00758F' : owner ? '#AED9D7' : '#FFFFFF', stroke: '#2D5A68', 'stroke-width': owner ? 1.4 : 0.8 }, recSvg);
    recEls.push(r);
  }
  const lab = (i, txt, dy = 0) => { const p = recPos(i); const e = h('div', 'abs num', pg27, txt); px(e, p.x - 2, p.y + 16 + dy, 70); css(e, { font: '600 22px Inter', color: 'var(--ink2)', textAlign: 'center' }); return e; };
  lab(0, String(firstId), -44); const iA = 2050 - firstId;
  // 目录：页尾一列 52 格，从下往上
  const DX = PG.w - 120, DY0 = PG.h - 30, DH = 9.4;
  const dirLbl = h('div', 'abs t-small', pg27, '目录'); px(dirLbl, DX - 2, 8);
  const dirCells = [];
  for (let k = 0; k < D.dir.n_dir_slots; k++) { const r = svg('rect', { x: DX, y: DY0 - (k + 1) * DH, width: 46, height: DH - 2, fill: '#D9EEEF', stroke: '#2D5A68', 'stroke-width': 0.8 }, recSvg); dirCells.push(r); }
  // 二分：依次亮起的目录格，旁边写出那一格指向的编号
  const probes = D.dir.binary_search_probes;
  const tP0 = T('b9', '对半'), tPstep = Math.max(0.28, (T('b9', '四行') - tP0) / probes.length);
  const pLbl = probes.map((p, i) => {
    const y = DY0 - (p.slot + 1) * DH;
    const e = h('div', 'abs num', pg27, `${p.key}`); px(e, DX - 92, y - 12, 84); css(e, { font: '700 24px Inter', textAlign: 'right', color: p.key === 2050 ? 'var(--main)' : 'var(--ink2)' });
    vanish(e, 0); appear(e, tP0 + i * tPstep); if (p.key !== 2050) tl.to(e, { autoAlpha: 0, duration: 0.1 }, tP0 + (i + 1) * tPstep - 0.1);   // 下一格亮之前收起，相邻两格的编号不叠在一起
    tl.fromTo(dirCells[p.slot], { attr: { fill: '#D9EEEF' } }, { attr: { fill: p.key === 2050 ? '#00758F' : '#B5452E' }, duration: 0.1, immediateRender: true }, tP0 + i * tPstep);
    if (p.key !== 2050) tl.to(dirCells[p.slot], { attr: { fill: '#D9EEEF' }, duration: 0.15 }, tP0 + (i + 1) * tPstep);
    sfx('tick', tP0 + i * tPstep, { g: 0.4 });
    return e;
  });
  // 落到 2050 那一格：一条线从目录格指回那一行
  const hitY = DY0 - (D.dir.start_slot.slot + 1) * DH + DH / 2, pA = recPos(iA);
  const hit = svg('path', { d: `M${DX},${hitY} C${DX - 160},${hitY} ${pA.x + 200},${pA.y + 8} ${pA.x + 58},${pA.y + 8}`, fill: 'none', stroke: '#00758F', 'stroke-width': 3 }, recSvg);
  const hitLbl = lab(iA, '2050', 6); css(hitLbl, { color: 'var(--main)', fontWeight: 800, fontSize: '26px' });
  const tHit = tP0 + probes.length * tPstep;
  tl.fromTo(hit, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, tHit); vanish(hitLbl, 0); appear(hitLbl, tHit);
  sfx('blip', tHit, { g: 0.6 });
  const rowHit = h('div', 'pill fill', pg27, '2050 · Alice · 42'); px(rowHit, pA.x + 74, pA.y - 6);
  vanish(rowHit, 0); slam(rowHit, tHit + 0.5, { from: 1.3 });
  // 讲到「连成一条链」时，链从第一行描到最后一行；讲到「目录」时目录亮
  const chainPath = recSvg.querySelector('path'); const len = 99999;
  chainPath.style.strokeDasharray = len; tl.fromTo(chainPath, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: Math.max(1.6, Tend('b7z') - T('b7', '链')), ease: 'none', immediateRender: true }, T('b7', '链'));
  tl.fromTo(dirCells, { attr: { fill: '#FFFFFF' } }, { attr: { fill: '#D9EEEF' }, duration: 0.3, stagger: Math.max(0.01, (Tend('b8') - T('b8', '目录')) / 60), immediateRender: true }, T('b8', '目录'));
  wipe(pg27, T('b6'), { dir: 'l', d: 0.5 }); sfx('whoosh', T('b6'), { g: 0.5 });
  const walker = h('div', 'abs', pg27); css(walker, { width: '60px', height: '15px', border: '3px solid var(--acc)' });
  const tW0 = T('b7', '链'), tW1 = Math.max(tW0 + 1.6, Tend('b7z'));
  F((t) => { const on = t >= tW0 && t < tW1 + 0.4; walker.style.display = on ? '' : 'none'; if (on) { const p = recPos(Math.min(D.dir.n_recs - 1, Math.floor(clamp((t - tW0) / (tW1 - tW0)) * D.dir.n_recs))); px(walker, p.x + 1, p.y); } });
  [pkT, nmT].forEach((e) => { tl.to(e, { opacity: 0, duration: 0.2 }, T('b6')); tl.to(e, { opacity: 1, duration: 0.3 }, Tend('b9z') + 0.5); });
  // b6：207 行一组一组地亮出来
  recEls.forEach((r, i) => tl.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: true }, T('b6') + 0.4 + (i / recEls.length) * Math.max(1.2, Tend('b6') - T('b6') - 0.6)));
  wipeOut(pg27, Tend('b9z') + 0.3, { dir: 'r', d: 0.4 });
  svgOut(pathPK, Tend('b9z') + 0.3);

  // b10：再找一次：两页都在缓冲池里
  // 同一个元素的几段高亮合成一个帧函数（几个 classAt 管同一个类名，倒着 seek 时会互相覆盖）
  const litWin = (e, cls, wins) => { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on !== last) { e.classList.toggle(cls, on); last = on; } }); };
  litWin(s4, 'hitpg', [[T('b10', '缓冲池'), T('b11')], [T('b13', '整行'), T('b15')]]); litWin(s27, 'hitpg', [[T('b10', '缓冲池'), T('b11')], [T('b13', '整行'), T('b15')]]);
  const pathPK2 = path(ov, `M1215,424 L${PKX(K27) + 20},${PKY}`, 'main', { w: 4, dashed: '8 6' });
  arrowIn(pathPK2, T('b10'), 0.4); svgOut(pathPK2, T('b11'));

  // b11–b14：按名字找：页 5 → 页 9，拿到 2050；再回主键树：页 4 → 页 27（都已在缓冲池里）
  const pathNM = path(ov, `M1215,684 L${NMX(K9) + 20},${NMY}`, 'main', { w: 4 });
  arrowIn(pathNM, T('b12', '根页'), 0.5);
  lit(nmRoot, 'hot', T('b11', '姓名索引'), T('b15'));
  const s5 = flyTo(nmRoot, 2, T('b12', '叶子') - 0.3, 'var(--main)');
  const s9 = flyTo(nmLeaf[K9], 3, T('b12', '叶子'), 'var(--main)');
  lit(nmLeaf[K9], 'hot', T('b12', '叶子'), T('b16'));
  const got = h('div', 'pill fill', W, 'Alice → 2050'); px(got, NMX(K9) - 10, NMY + 46); vanish(got, 0); slam(got, T('b12', '2050'), { from: 1.3 });
  // 回表：从页 9 回到主键树
  const back = path(ov, `M${NMX(K9) + 40},${NMY + 10} C${980},${730} ${1040},${600} ${1180},${430}`, 'mainD', { w: 3.4 });
  arrowIn(back, T('b13') + 0.1, 0.7);
  const pathPK3 = path(ov, `M1215,424 L${PKX(K27) + 20},${PKY}`, 'mainD', { w: 4 });
  arrowIn(pathPK3, T('b13', '整行') - 0.2, 0.4);
  const row = h('div', 'pill fill', W, '2050 · Alice · 42'); px(row, PKX(K27) - 60, PKY + 56); vanish(row, 0); slam(row, T('b13', '整行'), { from: 1.3 }); sfx('pop', T('b13', '整行'));
  const tagBack = h('div', 'tag', W, '回表'); px(tagBack, 1266, 384); css(tagBack, { fontSize: '28px' }); vanish(tagBack, 0); slam(tagBack, T('b14', '回表'), { from: 1.4 }); sfx('thud', T('b14', '回表'), { g: 0.6 });
  [back, pathPK3].forEach((p) => svgOut(p, T('b15', '回表') + 0.3)); exit(row, tq4 - 0.2, { y: 8, d: 0.3 }); exit(tagBack, T('b15', '回表') + 0.3, { y: 8, d: 0.3 });

  // b15：只要编号：停在页 9，不必回表（E1）
  const exp = h('div', 'abs', W, `<div class="mono" style="font-size:22px;color:var(--ink)">${esc(D.explain.id_only)}</div><div class="gloss" style="position:static;margin-top:4px">执行计划：覆盖索引查找，姓名索引里就有编号</div>`);
  px(exp, 712, 560);
  vanish(exp, 0); show(exp, Math.max(T('b15') + 0.3, T('b15', '回表') + 0.65), { y: 8, d: 0.4 });   // 回表的弧线收走后再出，不让弧线穿过字
  const cov = h('div', 'tag', W, '覆盖索引'); px(cov, 1340, 592); css(cov, { fontSize: '28px' });
  vanish(cov, 0); slam(cov, T('b15b', '覆盖索引'), { from: 1.4 }); exit(cov, T('b16') + 0.1, { d: 0.3 }); sfx('pop', T('b15b', '覆盖索引'), { g: 0.5 });
  const stop = h('div', 'tag', W, '到这里就够了'); px(stop, NMX(K9) + 210, NMY + 54); vanish(stop, 0); slam(stop, T('b15', '本来就有'), { from: 1.3 });
  [stop, got].forEach((e) => exit(e, T('b16') - 0.1, { y: 8, d: 0.3 })); exit(exp, T('b16', '挪出去') - 0.2, { y: 8, d: 0.3 }); svgOut(pathNM, T('b16') - 0.1);

  // b16：缓冲池满了：一页很久没被用到，被挪出去，新读的页放进它的位置（M27）
  const tL = T('b16');
  const more = [];
  for (let i = 4; i < 15; i++) { const p = SLOT(i); const e = h('div', 'abs', W); px(e, p.x, p.y, 62, 62); css(e, { background: 'var(--teal)', border: '2px solid var(--mainD)' }); show(e, tL + 0.1 + (i - 4) * 0.06, { s: 0.6, y: 0, d: 0.25 }); more.push(e); }
  const old = more[6];                                         // 这一页一直没被再用到：慢慢变淡
  const tOut = T('b16', '挪出去');
  to(old, tL + 1.0, { opacity: 0.35, duration: Math.max(0.4, tOut - tL - 1.0), ease: 'none' });
  exit(old, tOut, { y: 40, d: 0.45 });
  const fresh = h('div', 'abs', W); { const p = SLOT(10); px(fresh, p.x, p.y, 62, 62); }
  css(fresh, { background: 'var(--main)', border: '2px solid var(--main)' });
  slam(fresh, T('b16', '腾地方'), { from: 1.4 });
  sfx('whoosh', tOut, { g: 0.4 }); sfx('pop', T('b16', '腾地方'), { g: 0.5 });
  // 章末：缓冲池里的页从左到右轮一遍（一直有页进出）
  { const s4s = h('style', '', W); s4s.textContent = '.s4-pulse { background: var(--main) !important; }'; }
  more.forEach((e, i) => { if (e !== old) lit(e, 's4-pulse', Tend('b16') + 0.3 + i * 0.08, Tend('b16') + 0.7 + i * 0.08); });

  W.appendChild(ov);
  W.appendChild(pg27);                                        // 页 27 的放大图压在树的连线上面
});
