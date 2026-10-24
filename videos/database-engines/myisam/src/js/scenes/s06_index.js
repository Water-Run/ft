// 06 索引文件与 B 树。主画面依次是：逐行扫描找 id = 5；users.MYI 的文件头与 1024 字节一页；主键页里的 8 个索引项
// （4 字节键 + 6 字节行号）各自指向数据文件里的一行；页满分裂、长出一层；十万行的三层树（1 + 21 + 981 页）；
// 普通索引 idx_name 的页结构相同，指向同样的行。数字取自 snap_01 与 snap_05 的 .MYI（FACTS「06」）。
scene('s6', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const ov = overlay(world);
  const users = rowsOf(R.usersMYD[0]).map(decodeUser);
  const S0 = R.state['1_create'], BIG = R.big;

  // ── 第一站：只有数据文件时，逐行比较 ──
  const aT = h('div', 'abs mono', world, 'users.MYD'); px(aT, 300, 150); css(aT, { fontSize: '40px', color: '#F29111' });
  const want = h('div', 'abs mono', world, 'WHERE id = 5'); px(want, 300, 210); css(want, { fontSize: '34px', color: '#3fb4cc' });
  const rowsA = users.map((u, r) => { const e = h('div', 'abs mono', world, `${off4(r * 16)}   id ${String(u.id).padStart(2)}   ${u.name}`); px(e, 300, 290 + r * 66); css(e, { fontSize: '32px', color: '#d9d9d9' }); return e; });
  appear(aT, c0 + 0.1); rowsA.forEach((e, i) => appear(e, c0 + 0.2 + i * 0.04)); appear(want, T('f1', '等于') - 0.2);
  const scan = ring(world, { x: 284, y: 284, w: 760, h: 60 });
  const step = (Tend('f1b') - T('f1', '等于')) / 5;
  const tS = T('f1', '等于');
  appear(scan, tS);
  F((t) => { const k = clamp((t - tS) / step, 0, 4); scan.style.top = (284 + Math.floor(k) * 66 + (k % 1 > 0.75 ? (k % 1 - 0.75) * 4 * 66 : 0)) + 'px'; });
  for (let r = 0; r < 5; r++) {
    const tr_ = tS + r * step + step * 0.5, ok = r === 4;
    const m = h('div', 'abs mono', world, ok ? '= 5，找到' : '≠ 5'); px(m, 1070, 290 + r * 66); css(m, { fontSize: '32px', color: ok ? '#F29111' : '#e5534b' });
    appear(m, tr_); sfx(ok ? 'chime' : 'tick', tr_, { g: ok ? 0.4 : 0.45 });
  }

  // ── 第二站：users.MYI ──
  const BX = 2080;
  const bT = h('div', 'abs mono', world, 'users.MYI'); px(bT, BX, 140); css(bT, { fontSize: '40px', color: '#F29111' });
  const bS = h('div', 'abs mono', world, '3,072 字节'); px(bS, BX + 250, 146); css(bS, { fontSize: '34px', color: '#8a8a8a' });
  appear(bT, T('f2', '索引') - 0.3); appear(bS, T('f2', '索引') - 0.3);
  // 文件条：文件头 396 字节，其后按 1024 字节一页
  const FY = 820, FW = 1700, k = FW / 3072;
  const segs = [[0, 396, '#3fb4cc', '文件头 396'], [396, 1024, '#1d1f22', ''], [1024, 2048, '#2b606c', '页 @1024'], [2048, 3072, '#1f4a54', '页 @2048']];
  const segEl = segs.map(([a, b, c, l]) => { const e = h('div', 'abs', world); px(e, BX + a * k, FY, (b - a) * k - 3, 48); css(e, { background: c }); const lb = l ? tag(world, BX + a * k, FY + 60, l) : null; return [e, lb]; });
  const bar0 = h('div', 'abs', world); px(bar0, BX, FY, FW - 3, 48); css(bar0, { border: '2px solid #4a4a4a' });
  wipe(bar0, T('f2') + 0.4, { dir: 'l', d: 2.6, ease: 'none' }); sfx('drive', T('f2') + 0.4, { g: 0.5 });   // 文件条慢慢铺开：3072 个字节
  wipe(segEl[0][0], T('f3', '文件头') - 0.3, { dir: 'l', d: 0.4 }); appear(segEl[0][1], T('f3', '文件头'));
  const fields = [['records', String(S0.records[2]), '一共多少行'], ['dellink', 'ff…ff', '空位链从哪里开始（现在没有空位）'], ['key_root[0]', String(S0['key_root[0]'][2]), '主键的根页'], ['key_root[1]', String(S0['key_root[1]'][2]), 'idx_name 的根页']];
  const fEl = fields.map(([n, v, d], i) => { const e = h('div', 'abs mono', world, `${n.padEnd(12)}<span class="c-o">${v.padStart(6)}</span>   <span class="c-d" style="font-family:'Sans SC'">${d}</span>`); px(e, BX, 240 + i * 60); css(e, { fontSize: '32px', color: '#d9d9d9' }); return e; });
  const fT = [T('f4', '一共'), T('f4', '空位链'), T('f4', '每个'), T('f4', '每个') + 0.35];
  // 文件头的四个字段一起在场（讲到「文件头」时就摊开）；讲到哪个字段，光标框移到哪一行
  fEl.forEach((e, i) => slide(e, T('f2', '索引') + 0.4 + i * 0.06, { x: -20, d: 0.35 })); sfx('blip', T('f2', '索引') + 0.4, { g: 0.4 });
  const fR = ring(world, { x: BX - 12, y: 240 - 6, w: 1240, h: 56 });
  vanish(fR, 0); appear(fR, fT[0] - 0.15); vanish(fR, T('f5', '统计') - 0.4);
  F((t) => { let k = 0; for (let i = 0; i < fT.length; i++) if (t >= fT[i] - 0.15) k = i; fR.style.top = (240 - 6 + k * 60) + 'px'; });
  fT.forEach((t_) => sfx('tick', t_, { g: 0.4 }));
  // 统计总行数不必扫描
  const cnt = term(world, BX, 520, 1500, 190, '');
  css(cnt.bar, { display: 'none' }); css(cnt.body, { top: '20px' });
  const tC = T('f5', '统计') - 0.4;
  appear(cnt.el, tC - 0.2);
  cnt.cmd('<span class="k">EXPLAIN SELECT COUNT</span>(*) <span class="k">FROM</span> users;', tC, { cps: 44 });
  cnt.line('Extra: <span class="c-o">Select tables optimized away</span>', T('f5', '立即') - 0.3, { snd: 'blip' });
  classAt(fEl[0], 'c-o', T('f5', '行数') - 0.1, Tend('f5') + 0.4);
  // 一页 1024 字节
  segEl.slice(1).forEach(([e, lb], i) => { wipe(e, T('f6', '1024') - 0.3 + i * 0.2, { dir: 'l', d: 0.35 }); if (lb) appear(lb, T('f6', '1024') + i * 0.2); });
  sfx('tick', T('f6', '1024'), { g: 0.5 }); sfx('tick', T('f6', '1024') + 0.4, { g: 0.5 });

  // 离开第二站时收起文件条（镜头经过时不再露出半截标签）
  hide([bar0, ...segEl.map(([e]) => e), ...segEl.map(([, lb]) => lb).filter(Boolean)], T('f7') - 0.7, { y: 0, d: 0.2 });
  // ── 第三站（下方）：主键页 → 数据文件的行 ← 普通索引页 ──
  const CY = 1240, PX = 2040, MX = 2880, QX = 3430, EY = CY + 120, ER = 60;   // 三列在 z = 0.94 时整排放得下
  const p1 = R.usersMYI.page1.match(/../g), ent = [];
  for (let i = 0; i < 8; i++) { const o = 2 + i * 10; ent.push({ key: p1.slice(o, o + 4), row: p1.slice(o + 4, o + 10) }); }
  const page = h('div', 'blk', world); px(page, PX, CY, 640, 720);
  const pageT = h('div', 'abs mono', world, '页 @1024 · 主键 id'); px(pageT, PX + 24, CY + 20); css(pageT, { fontSize: '30px', color: '#8a8a8a' });
  const used = h('div', 'abs mono', world, `页头 ${p1[0]} ${p1[1]}：已用 <span class="c-o">82</span> / 1024 字节`); px(used, PX + 24, CY + 640); css(used, { fontSize: '28px', color: '#8a8a8a' });
  const myd = h('div', 'blk', world); px(myd, MX, CY, 420, 720);
  const mydT = h('div', 'abs mono', world, 'users.MYD'); px(mydT, MX + 24, CY + 20); css(mydT, { fontSize: '30px', color: '#F29111' });
  const mRows = users.map((u, r) => { const e = h('div', 'abs mono', world, `行 ${r}  ${u.name}`); px(e, MX + 30, EY + r * ER); css(e, { fontSize: '30px', lineHeight: '48px', color: '#d9d9d9' }); return e; });
  const eRows = ent.map((en, i) => {
    const kv = parseInt(en.key.join(''), 16), rv = parseInt(en.row.join(''), 16);
    const e = h('div', 'abs mono', world, `<span class="c-t">${en.key.join(' ')}</span>  <span class="c-o">${en.row.join(' ')}</span>  <span class="c-d">${kv}→${rv}</span>`);
    px(e, PX + 24, EY + i * ER); css(e, { fontSize: '26px', lineHeight: '48px', color: '#d9d9d9' }); return e;
  });
  const tP = T('f7') - 0.5;
  wipe(page, tP, { dir: 't', d: 0.45 }); appear(pageT, tP + 0.2); wipe(myd, tP + 0.2, { dir: 't', d: 0.45 }); appear(mydT, tP + 0.4);
  mRows.forEach((e, i) => appear(e, tP + 0.4 + i * 0.03));
  eRows.forEach((e, i) => appear(e, T('f7', '排好') + i * 0.08)); sfx('blip', T('f7', '排好'), { g: 0.45 });
  const kl = lab(world, PX + 24, EY - 52, '键（4 字节）', 'c-t'), rl = lab(world, PX + 230, EY - 52, '行号（6 字节）', 'c-o');
  appear(kl, T('f8', '键的') - 0.1); appear(rl, T('f8', '位置') - 0.3);
  const sweep = ring(world, { x: PX + 14, y: EY - 4, w: 600, h: 56 }, 't');
  const tw0 = T('f8') - 0.1, tw1 = Tend('f8') + 0.3;
  vanish(sweep, 0); appear(sweep, tw0); vanish(sweep, tw1);
  F((t) => { const k = Math.floor(clamp((t - tw0) / (tw1 - tw0)) * 7.99); sweep.style.top = (EY - 4 + k * ER) + 'px'; });
  const lines1 = ent.map((_, i) => { const p = path(ov, `M ${PX + 640} ${EY + i * ER + 24} L ${MX - 6} ${EY + i * ER + 24}`, i === 0 ? 'orange' : 'teal', { w: 2.2 }); arrowIn(p, T('f8', '位置') + i * 0.06, 0.4); return p; });
  sfx('pop', T('f8', '位置'), { g: 0.5 });
  appear(used, T('f8', '位置') - 0.1); sfx('tick', T('f8', '位置') - 0.1, { g: 0.5 });

  // ── 第四站（右边）：页满分裂；十万行的三层树 ──
  const DX = 4400;
  // 这一站的图本来只占画面中间一小块：整组放大 1.45 倍，围绕镜头中心（DX + 460, 560）
  const g4 = h('div', 'abs', world); css(g4, { left: 0, top: 0, width: '1px', height: '1px', transformOrigin: `${DX + 460}px 560px`, transform: 'scale(1.45)' });
  const ov4 = overlay(g4);
  const leaf = h('div', 'blk', g4); px(leaf, DX + 100, 640, 640, 110);
  const fill = h('div', 'abs', leaf); px(fill, 0, 0, 0, 106); css(fill, { background: '#2b606c' });
  const keysL = h('div', 'abs mono', leaf, '键 1 …'); px(keysL, 20, 30); css(keysL, { fontSize: '34px', color: '#d9d9d9' });
  const keysN = h('div', 'abs mono', leaf, ''); px(keysN, 150, 30); css(keysN, { fontSize: '34px', color: '#d9d9d9' });
  const tF = T('f10', '数据多') - 0.3, tSp = T('f10', '分裂') - 0.1;
  // 先是八个键的那一页（已用 82 / 1024），讲到「数据多了」才开始长
  appear(leaf, Tend('f9') + 0.3);
  fromTo(fill, Tend('f9') + 0.3, { width: 0 }, { width: 636 * 82 / 1024, duration: 0.3, ease: 'power2.out' });
  fromTo(fill, tF, { width: 636 * 82 / 1024 }, { width: 636, duration: tSp - tF, ease: 'none', immediateRender: false });
  countTo(keysN, 8, 202, tF, tSp - tF, (v) => String(Math.round(v)));
  sfx('riser', tSp - 1.2, { g: 0.35 });
  // 分裂：左页留 101 个键，分隔键 102 上移，右边一页接着写
  vanish(leaf, tSp);
  const L1 = h('div', 'blk', g4); px(L1, DX + 40, 700, 380, 100); const L2 = h('div', 'blk', g4); px(L2, DX + 460, 700, 380, 100);
  const l1T = h('div', 'abs mono', L1, '1 … 101'); px(l1T, 24, 26); css(l1T, { fontSize: '34px', color: '#d9d9d9' });
  const l2T = h('div', 'abs mono', L2, '102 …'); px(l2T, 24, 26); css(l2T, { fontSize: '34px', color: '#d9d9d9' });
  const top = h('div', 'blk', g4); px(top, DX + 290, 470, 300, 100); css(top, { borderColor: '#F29111' });
  const topT = h('div', 'abs mono', top, '102'); px(topT, 110, 26); css(topT, { fontSize: '36px', color: '#F29111' });
  fromTo(L1, tSp, { x: 60, autoAlpha: 1 }, { x: 0, duration: 0.5, ease: 'power3.out' });
  fromTo(L2, tSp, { x: -380, autoAlpha: 1 }, { x: 0, duration: 0.5, ease: 'power3.out' });
  vanish(L1, 0); vanish(L2, 0); appear(L1, tSp); appear(L2, tSp);
  sfx('thud', tSp + 0.3, { g: 0.6 });
  // 分裂后左页约半满；右页接着写，慢慢满起来
  const fl1 = h('div', 'abs', L1); px(fl1, 0, 0, 0, 96); css(fl1, { background: '#2b606c', zIndex: -1 }); const fl2 = h('div', 'abs', L2); px(fl2, 0, 0, 0, 96); css(fl2, { background: '#2b606c', zIndex: -1 });
  css(L1, { isolation: 'isolate' }); css(L2, { isolation: 'isolate' });
  fromTo(fl1, tSp, { width: 0 }, { width: 190, duration: 0.4, ease: 'power2.out' });
  fromTo(fl2, tSp + 0.3, { width: 0 }, { width: 250, duration: T('f12') - 0.4 - tSp - 0.3, ease: 'none' });
  show(top, T('f10', '上面') - 0.2, { y: 30, d: 0.45 }); sfx('pop', T('f10', '上面'), { g: 0.55 });
  const e1 = path(ov4, `M ${DX + 380} 572 L ${DX + 240} 696`, 'orange', { w: 2.5 }), e2 = path(ov4, `M ${DX + 500} 572 L ${DX + 640} 696`, 'orange', { w: 2.5 });
  arrowIn(e1, T('f10', '一层') - 0.1, 0.4); arrowIn(e2, T('f10', '一层'), 0.4);
  const btree = h('div', 'abs d-2', world, 'B 树'); px(btree, DX - 60, 200); css(btree, { color: '#F29111' });
  show(btree, T('f11', 'B') - 0.15, { y: 16, d: 0.4 }); sfx('thud', T('f11', 'B'), { g: 0.5 });
  // 十万行：1 + 21 + 981 页。镜头移过去之前，分裂的小图收走
  hide([L1, L2, top, btree], T('f12') - 0.3, { y: 0, d: 0.3 }); tl.to([e1, e2], { autoAlpha: 0, duration: 0.3 }, T('f12') - 0.3);
  const TX = DX + 1100, LV = BIG.levels;
  const rootB = h('div', 'blk', world); px(rootB, TX + 330, 200, 360, 96); css(rootB, { borderColor: '#F29111' });
  const rootT = h('div', 'abs mono', rootB, `根 · ${LV[0].keys} 个键`); px(rootT, 22, 24); css(rootT, { fontSize: '32px', color: '#F29111' });
  const mids = [...Array(21)].map((_, i) => { const e = h('div', 'abs', world); px(e, TX + i * 49, 470, 42, 70); css(e, { background: '#2b606c' }); return e; });
  const cv = h('canvas', 'abs', world); cv.width = 1030; cv.height = 90; px(cv, TX, 740, 1030, 90); css(cv, { position: 'absolute' });   // freeze 只拷行内样式
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#1f4a54';
  for (let i = 0; i < LV[2].pages; i++) ctx.fillRect(Math.floor(i * 1030 / LV[2].pages), 0, 1, 90);
  const leaves = freeze(cv);
  const lvL = [[`1 页`, 230], [`${LV[1].pages} 页 · ${LV[1].keys} 个键`, 560], [`${LV[2].pages} 页 · ${LV[2].keys.toLocaleString('en-US')} 个键`, 850]].map(([t_, y]) => { const e = h('div', 'abs mono', world, t_); px(e, TX + 1060, y); css(e, { fontSize: '30px', color: '#8a8a8a' }); return e; });
  const tB = T('f12', '十万') - 0.3;
  show(rootB, tB, { y: 16, d: 0.4 }); appear(lvL[0], tB + 0.1);
  mids.forEach((e, i) => appear(e, tB + 0.5 + i * 0.03)); appear(lvL[1], tB + 0.6);
  wipe(leaves, tB + 1.1, { dir: 'l', d: 0.7 }); appear(lvL[2], tB + 1.2);
  sfx('thud', tB, { g: 0.55 }); sfx('drive', tB + 1.1, { g: 0.5 });
  const three = h('div', 'abs t-big', world, '三层'); px(three, TX + 760, 200); css(three, { color: '#F29111' }); show(three, T('f12', '三层') - 0.15, { y: 12, d: 0.4 });
  // 根页把十万行分成 21 段；每往下一层，范围缩小几十倍
  const fan = mids.map((m, i) => { const p = path(ov, `M ${TX + 510} 298 L ${TX + i * 49 + 21} 466`, 'teal', { w: 1.4, arrow: false }); vanish(p, 0); appear(p, T('f12b', '21') - 0.3 + i * 0.02); draw(p, T('f12b', '21') - 0.3 + i * 0.02, 0.4); return p; });   // 描线之前整条隐藏，免得圆头露成小点
  sfx('tick', T('f12b', '21'), { g: 0.5 });
  // 21 段：一格一格扫过去
  const sweep21 = ring(world, { x: TX - 4, y: 466, w: 50, h: 78 }, 't'); vanish(sweep21, 0); appear(sweep21, T('f12b', '21') + 0.2); vanish(sweep21, T('f12b', '下一层') - 0.15);
  F((t) => { const k = clamp(Math.floor((t - T('f12b', '21') - 0.2) / 0.09), 0, 20); sweep21.style.left = (TX - 4 + k * 49) + 'px'; });
  const pick = 0, sub = [...Array(12)].map((_, j) => { const p = path(ov, `M ${TX + pick * 49 + 21} 542 L ${TX + j * 6 + 4} 736`, 'teal', { w: 1.2, arrow: false }); vanish(p, 0); appear(p, T('f12b', '下一层') + j * 0.03); draw(p, T('f12b', '下一层') + j * 0.03, 0.35); return p; });
  classAt(mids[pick], 'tc-o', T('f12b', '下一层') - 0.1);
  const st = h('style', '', root); st.textContent = '.tc-o { background:#F29111 !important; }';
  const narrow = h('div', 'abs mono', world, ''); px(narrow, TX, 880); css(narrow, { fontSize: '32px', color: '#d9d9d9' });
  keyed(narrow).at(T('f12c') - 0.1, { html: '100,000 行' }).at(T('f12c') + 0.3, { html: '100,000 行 <span class="c-o">÷ 21</span> → 约 4,800' })
    .at(T('f12c') + 0.7, { html: '100,000 行 <span class="c-o">÷ 21</span> → 约 4,800 <span class="c-o">÷ 46</span> → 约 100' })
    .at(T('f12c') + 1.1, { html: '100,000 行 <span class="c-o">÷ 21</span> → 约 4,800 <span class="c-o">÷ 46</span> → 约 100 → <span class="c-o">1 行</span>' });
  sfx('blip', T('f12c') + 0.3, { g: 0.4 }); sfx('blip', T('f12c') + 0.7, { g: 0.4 }); sfx('chime', T('f12c') + 1.1, { g: 0.4 });

  // ── 回到第三站：普通索引 idx_name，结构相同，存的也是行的位置 ──
  const p2 = R.usersMYI.page2.match(/../g), names = [];
  for (let o = 2; o < p2.length;) { const n = parseInt(p2[o], 16); const nm = String.fromCharCode(...p2.slice(o + 1, o + 1 + n).map((x) => parseInt(x, 16))); const rv = parseInt(p2.slice(o + 1 + n, o + 7 + n).join(''), 16); names.push([nm, rv]); o += 7 + n; }
  const page2 = h('div', 'blk', world); px(page2, QX, CY, 480, 720);
  const p2T = h('div', 'abs mono', world, '页 @2048 · idx_name'); px(p2T, QX + 24, CY + 20); css(p2T, { fontSize: '30px', color: '#8a8a8a' });
  const nRows = names.map(([nm, rv], i) => { const e = h('div', 'abs mono', world, `<span class="c-t">${nm.padEnd(6)}</span> → <span class="c-o">行 ${rv}</span>`); px(e, QX + 40, EY + i * ER); css(e, { fontSize: '30px', lineHeight: '48px', color: '#d9d9d9' }); return e; });
  const tQ = T('f13') - 0.3;
  wipe(page2, tQ, { dir: 't', d: 0.45 }); appear(p2T, tQ + 0.2); nRows.forEach((e, i) => appear(e, tQ + 0.35 + i * 0.05)); sfx('blip', tQ + 0.35, { g: 0.45 });
  const lines2 = names.map(([, rv], i) => { const p = path(ov, `M ${QX - 6} ${EY + i * ER + 24} L ${MX + 426} ${EY + rv * ER + 24}`, i === 0 ? 'orange' : 'teal', { w: 2.2 }); arrowIn(p, T('f14', '位置') - 0.3 + i * 0.05, 0.4); return p; });
  sfx('pop', T('f14', '位置'), { g: 0.5 });
  classAt(myd, 'lit', T('f14', '行本身') - 0.2, s.end);   // 行本身只在数据文件里：它的边框亮起来

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, T('f2') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('f2') - 0.3, { x: 2930, y: 520, z: 1 }, 1.1, { g: 0.5 }],
    [null, { x: 2850, y: 540, z: 1.05 }, T('f4') - T('f2') - 1.6, { ease: 'none', sfx: false }],   // 不上移：文件条下面的标签要留在字幕栏上方
    [T('f4') - 0.2, { x: 2700, y: 400, z: 1.22 }, 0.9, { sfx: false }],
    [T('f5') - 0.3, { x: 2840, y: 540, z: 1.1 }, 0.8, { sfx: false }],
    [T('f7') - 0.6, { x: 2670, y: CY + 380, z: 1 }, 1.1, { g: 0.5 }],
    [T('f8') - 0.2, { x: 2620, y: CY + 380, z: 1.12 }, 0.9, { sfx: false }],
    [null, { x: 2720, z: 1.16 }, Tend('f9') - T('f8') - 1.2, { ease: 'none', sfx: false }],
    [Tend('f9') + 0.1, { x: DX + 460, y: 560, z: 1 }, 1.1, { g: 0.5 }],
    [T('f12') - 0.3, { x: TX + 560, y: 560, z: 0.95 }, 1.0, { g: 0.4 }],
    [null, { z: 0.98 }, T('f13') - T('f12') - 1.6, { ease: 'none', sfx: false }],
    [T('f13') - 0.3, { x: 2975, y: CY + 380, z: 0.94 }, 1.1, { g: 0.5 }],
    [null, { z: 0.98 }, s.end - T('f13') - 0.8, { ease: 'none', sfx: false }],
  ]);
});
