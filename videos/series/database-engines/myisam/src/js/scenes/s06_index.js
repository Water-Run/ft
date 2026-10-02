// 06 索引文件与 B 树。文件头字段、页内容、十万行表的三层结构均取自真实 .MYI
scene('s6', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .ml { font-family:var(--mono); font-size:23px; padding:14px 26px 16px; }
  .ml-r { display:flex; align-items:center; height:50px; border-radius:6px; padding:0 8px; white-space:pre; }
  .ml-r .n { width:70px; color:var(--faint); font-size:18px; font-family:var(--sans); letter-spacing:.06em; }
  .ml-r .a { width:36px; text-align:right; color:var(--cyan); }
  .ml-r .b { margin-left:26px; color:var(--mint); }
  .ml-r .m { margin-left:auto; font-size:20px; color:var(--faint); }
  .q6 { position:absolute; left:96px; top:150px; height:64px; padding:0 26px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); font-family:var(--mono); font-size:28px; line-height:62px; white-space:pre; color:#cfe3e8; }
  .cnt { position:absolute; left:96px; top:330px; display:flex; align-items:baseline; gap:22px; }
  .cnt b { font-family:var(--mono); font-size:150px; font-weight:500; color:var(--orange-hi); line-height:1; width:110px; text-align:center; }
  .cnt span { font-size:34px; letter-spacing:.1em; color:var(--dim); }
  .ext { position:absolute; left:96px; top:560px; font-size:28px; letter-spacing:.08em; color:var(--dim); line-height:1.7; }
  .ext b { font-family:var(--mono); color:var(--text); font-weight:500; letter-spacing:0; }
  .rib { position:absolute; left:96px; top:196px; width:1284px; height:78px; }
  .rib-b { position:absolute; top:0; height:78px; width:424px; border-radius:8px; box-shadow:0 0 0 1px rgba(159,220,234,.35), 0 14px 40px rgba(0,0,0,.4); overflow:hidden; background:rgba(8,44,56,.6); display:flex; align-items:center; }
  .rib-b .hdr { width:164px; height:100%; background:rgba(242,145,17,.42); box-shadow:inset -1px 0 0 rgba(242,145,17,.9); display:flex; align-items:center; justify-content:center; font-size:21px; letter-spacing:.1em; color:#ffe2b8; flex:none; }
  .rib-b .emp { flex:1; height:100%; background:repeating-linear-gradient(135deg, rgba(127,211,230,.09) 0 5px, rgba(127,211,230,.02) 5px 10px); display:flex; align-items:center; justify-content:center; font-size:18px; color:var(--faint); letter-spacing:.1em; }
  .rib-b .pg { flex:1; text-align:center; font-size:21px; letter-spacing:.06em; color:var(--pale); white-space:nowrap; }
  .rib-b .pg small { font-family:var(--mono); font-size:17px; color:var(--dim); margin-left:8px; }
  .rib .tick { top:86px; }
  .dim6 { position:absolute; text-align:center; }
  .dim6 i { display:block; height:12px; border:2px solid var(--blue-hi); border-top:none; border-radius:0 0 6px 6px; opacity:.8; }
  .dim6 span { display:block; margin-top:14px; font-size:22px; letter-spacing:.06em; color:var(--dim); }
  .dim6 b { display:block; margin-top:6px; font-family:var(--mono); font-weight:500; font-size:30px; color:var(--pale); letter-spacing:0; }
  .rib-name { position:absolute; left:96px; top:146px; font-family:var(--mono); font-size:22px; letter-spacing:.04em; color:var(--dim); }
  .rib-name b { color:var(--orange-hi); font-weight:500; }
  .hf { font-family:var(--mono); font-size:23px; padding:12px 22px 16px; }
  .hf-r { display:flex; align-items:center; height:48px; padding:0 10px; border-radius:6px; white-space:pre; }
  .hf-r .o { width:92px; color:var(--faint); font-size:19px; }
  .hf-r .k { width:190px; color:var(--pale); }
  .hf-r .v { width:210px; color:var(--orange-hi); }
  .hf-r .d { font-family:var(--sans); font-size:22px; letter-spacing:.06em; color:var(--dim); }
  .hf-hd { color:var(--faint); font-size:18px; height:34px; font-family:var(--sans); letter-spacing:.1em; }
  .pgc-b { padding:22px 26px; }
  .pgx { display:flex; align-items:flex-start; gap:8px; }
  .pgx .g { display:flex; flex-direction:column; align-items:center; }
  .pgx .cells { display:flex; gap:2px; }
  .pgx .cells span { font-family:var(--mono); font-size:21px; width:32px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:4px; }
  .pgx .lb { margin-top:8px; font-size:18px; letter-spacing:.04em; white-space:nowrap; }
  .pgx .more { font-size:20px; color:var(--faint); height:40px; display:flex; align-items:center; white-space:nowrap; letter-spacing:.06em; margin-left:6px; }
  .chips { display:flex; gap:10px; margin-top:24px; }
  .chip { height:50px; border-radius:8px; display:flex; align-items:center; overflow:hidden; box-shadow:0 0 0 1px var(--line-2); font-family:var(--mono); font-size:22px; flex:none; }
  .chip .ck { width:52px; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(70,203,230,.16); color:var(--cyan); }
  .chip .cp { width:92px; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(242,145,17,.14); color:var(--orange-hi); font-family:var(--sans); font-size:20px; letter-spacing:.04em; }
  .meter { position:absolute; left:26px; right:26px; bottom:22px; height:10px; border-radius:5px; background:rgba(127,211,230,.12); overflow:hidden; }
  .meter i { display:block; height:100%; background:var(--blue-hi); border-radius:5px; }
  .tn { position:absolute; border-radius:8px; background:rgba(8,44,56,.85); box-shadow:0 0 0 1.5px var(--blue-hi), 0 14px 40px rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:22px; color:var(--pale); white-space:nowrap; overflow:hidden; }
  .tn .fill { position:absolute; left:0; top:0; bottom:0; background:rgba(25,169,201,.28); }
  .tn span { position:relative; }
  .tn.sm { border-radius:4px; box-shadow:0 0 0 1.2px var(--blue-hi); }
  .lf { position:absolute; display:grid; grid-template-columns:repeat(8, 6px); gap:3px; }
  .lf i { width:6px; height:6px; border-radius:1.5px; background:rgba(111,224,182,.75); display:block; }
  .lvl { position:absolute; left:96px; font-size:21px; letter-spacing:.08em; color:var(--dim); white-space:nowrap; }
  .lvl b { font-family:var(--mono); font-weight:500; color:var(--text); letter-spacing:0; }
  .big3 { position:absolute; left:0; right:0; top:724px; display:flex; justify-content:center; gap:110px; }
  .big3 div { text-align:center; }
  .big3 b { display:block; font-family:var(--mono); font-size:66px; font-weight:500; line-height:1.1; color:var(--text); }
  .big3 span { font-size:23px; letter-spacing:.14em; color:var(--dim); }
  .btree { position:absolute; left:0; right:0; top:150px; text-align:center; font-family:var(--serif); font-weight:700; font-size:60px; letter-spacing:.12em; color:var(--orange-hi); }
  .ix { position:absolute; width:560px; height:300px; }
  .ix .ml-r .a { width:110px; text-align:left; }
  .same { position:absolute; left:96px; width:1180px; top:760px; text-align:center; font-size:32px; letter-spacing:.12em; }
  .same b { color:var(--orange-hi); font-weight:500; }
  `;
  root.appendChild(st);

  const rows0 = REAL.usersMYD[0].match(/.{32}/g).map(decodeRow);
  // ── 右：数据文件里的 8 行（全场常驻）──
  const lp = h('div', 'panel', root); px(lp, 1444, 128, 380, 484);
  h('div', 'panel-hd', lp, '<span>users.MYD</span><span class="r">8 行</span>');
  const ml = h('div', 'ml', lp);
  const lrows = rows0.map((r, i) => { const e = h('div', 'ml-r', ml, `<span class="n">行 ${i}</span><span class="a">${r.id}</span><span class="b">${r.name}</span><span class="m"></span>`); return e; });
  show(lp, c0 + 0.05, { x: 30, y: 0, d: 0.8 });

  // ════ P1 没有索引：逐行比较 ════
  const q = h('div', 'q6', root, '<span class="c-cyan">SELECT</span> * <span class="c-cyan">FROM</span> users <span class="c-cyan">WHERE</span> <span class="c-orange">id = 5</span>;');
  show(q, c0 + 0.15, { y: 16, d: 0.6 });
  const cnt = h('div', 'cnt', root, '<b>0</b><span>次比较</span>');
  const cntB = cnt.querySelector('b');
  const ext = h('div', 'ext', root, '表里有 <b>100,000</b> 行时<br>平均要比较 <b>50,000</b> 次');
  const tScan = T('f1', '只能') - 0.2;
  show(cnt, tScan - 0.3, { y: 16, d: 0.5 });
  const kc = keyed(cntB);
  lrows.slice(0, 5).forEach((r, i) => {
    const t = tScan + i * 0.42;
    kc.at(t, { html: String(i + 1) });
    tl.to(r, { backgroundColor: i === 4 ? 'rgba(242,145,17,.22)' : 'rgba(70,203,230,.16)', duration: 0.12 }, t);
    if (i < 4) tl.to(r, { backgroundColor: 'rgba(70,203,230,0)', duration: 0.3 }, t + 0.36);
    keyed(r.querySelector('.m')).at(t + 0.1, { html: i === 4 ? '<span class="c-orange">= 5</span>' : '≠ 5' });
  });
  tl.fromTo(cntB, { scale: 1.25 }, { scale: 1, duration: 0.3, immediateRender: false }, tScan + 4 * 0.42);
  show(ext, Tend('f1') - 0.5, { y: 14, d: 0.6 });

  // ════ P2 索引文件：文件头 ════
  const t2 = T('f2', '避免') - 0.45;
  hide([q, cnt, ext], t2, { y: -16, d: 0.4, stagger: 0.04 });
  lrows.forEach((r) => { keyed(r.querySelector('.m')).at(t2 + 0.3, { html: '' }); });
  tl.to(lrows[4], { backgroundColor: 'rgba(242,145,17,0)', duration: 0.4 }, t2);
  const ribName = h('div', 'rib-name', root, 'users<b>.MYI</b> · 3,072 字节');
  const rib = h('div', 'rib', root);
  const b0 = h('div', 'rib-b', rib, '<div class="hdr">文件头</div><div class="emp">未用</div>'); b0.style.left = '0px';
  const b1 = h('div', 'rib-b', rib, '<div class="pg">页<small>PRIMARY</small></div>'); b1.style.left = '430px';
  const b2 = h('div', 'rib-b', rib, '<div class="pg">页<small>idx_name</small></div>'); b2.style.left = '860px';
  const tk = [0, 1024, 2048, 3072].map((v, i) => { const e = h('div', 'tick', rib, String(v)); e.style.left = (i === 3 ? 1284 : i * 430) + 'px'; return e; });
  show(ribName, t2 + 0.35, { y: 10, d: 0.5 });
  fromTo([b0, b1, b2], t2 + 0.45, { autoAlpha: 0, scaleX: 0.3, transformOrigin: '0% 50%' }, { autoAlpha: 1, scaleX: 1, duration: 0.7, stagger: 0.14 });
  fromTo(tk, t2 + 0.7, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.12 });
  const hdrSeg = b0.querySelector('.hdr');
  gsap.set(hdrSeg, { backgroundColor: 'rgba(242,145,17,.12)' });
  tl.to(hdrSeg, { backgroundColor: 'rgba(242,145,17,.5)', duration: 0.4 }, T('f3', '文件头') - 0.1);

  // 文件头里的几个字段（偏移与取值来自真实文件）
  const hp = h('div', 'panel', root); px(hp, 96, 330, 830, 400);
  h('div', 'panel-hd', hp, '<span>文件头 · 396 字节</span><span class="r">state</span>');
  const hf = h('div', 'hf', hp);
  h('div', 'hf-r hf-hd', hf, '<span class="o">偏移</span><span class="k">字段</span><span class="v">值</span><span class="d" style="font-size:18px;color:var(--faint)">含义</span>');
  const F_ = [['0x00', 'file_version', 'fe fe 07 01', '文件标识'], ['0x1c', 'records', '8', '行数'], ['0x24', 'del', '0', '已删除的行数'], ['0x34', 'dellink', 'ff … ff', '空位链的链头（此刻为空）'], ['0x7c', 'key_root[0]', '1024', 'PRIMARY 的根页'], ['0x84', 'key_root[1]', '2048', 'idx_name 的根页']];
  const hr = F_.map(([o, k, v, d]) => h('div', 'hf-r', hf, `<span class="o">${o}</span><span class="k">${k}</span><span class="v">${v}</span><span class="d">${d}</span>`));
  const ov = overlay(root);
  const hpb = { x: 96, y: 330 };
  const lead = path(ov, `M${96 + 82},${196 + 80} L${96 + 82},${330 - 4}`, 'orange', { w: 2 });
  show(hp, T('f3', '文件头') + 0.1, { y: 20, d: 0.6 });
  arrowIn(lead, T('f3', '文件头') + 0.1, 0.4);
  fromTo(hr, T('f3', '记录') - 0.1, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.08 });
  const lit = (els, t0, t1) => { tl.to(els, { backgroundColor: 'rgba(242,145,17,.2)', duration: 0.3 }, t0); tl.to(els, { backgroundColor: 'rgba(242,145,17,0)', duration: 0.4 }, t1); };
  lit([hr[1], hr[2]], T('f4', '一共') - 0.1, T('f4', '空位链') - 0.1);
  lit([hr[3]], T('f4', '空位链') - 0.1, T('f4', '每个') - 0.1);
  lit([hr[4], hr[5]], T('f4', '每个') - 0.1, T('f5') - 0.2);
  // key_root → 条带上的两页
  const k0 = box(hr[4]), k1 = box(hr[5]);
  const pr0 = path(ov, `M${k0.x + 500},${k0.cy} C${1010},${k0.cy} ${96 + 430 + 212},${420} ${96 + 430 + 212},${196 + 84}`, 'orange', { w: 2.2 });
  const pr1 = path(ov, `M${k1.x + 520},${k1.cy} C${1180},${k1.cy} ${96 + 860 + 212},${440} ${96 + 860 + 212},${196 + 84}`, 'orange', { w: 2.2 });
  arrowIn(pr0, T('f4', '每个') + 0.2, 0.7); arrowIn(pr1, T('f4', '每个') + 0.5, 0.7);
  tl.to([b1, b2], { boxShadow: '0 0 0 2px rgba(242,145,17,.9), 0 14px 40px rgba(0,0,0,.4)', duration: 0.4, stagger: 0.3 }, T('f4', '每个') + 0.7);

  // f5 行数直接读文件头
  const t5 = T('f5') - 0.2;
  hide([pr0, pr1], t5, { y: 0, d: 0.3 });
  tl.to([b1, b2], { boxShadow: '0 0 0 1px rgba(159,220,234,.35), 0 14px 40px rgba(0,0,0,.4)', duration: 0.4 }, t5);
  lit([hr[1]], t5 + 0.1, T('f6') - 0.4);
  const ct = terminal(root, { x: 950, y: 330, w: 462, h: 400, title: 'mysql', fs: 21, lh: 1.5 });
  css(ct.bd, { padding: '18px 22px' });
  ct.cmd('<span class="k">SELECT COUNT</span>(*)', T('f5', '统计') - 0.3, 40, { appearAt: t5 + 0.4, hold: 0.02 });
  ct.cmd('<span class="k">FROM</span> users;', T('f5', '统计') + 0.2, 40, { prompt: '    -&gt;', appearAt: T('f5', '统计') + 0.15, hold: 0.2 });
  const cres = ct.out(asciiTable(['COUNT(*)'], [[8]], [1]).map(esc), T('f5', '立即') - 0.15, { stagger: 0.03 });
  const cex = ct.out(['', '<span class="faint">EXPLAIN → Extra:</span>', '<span class="wn">Select tables optimized away</span>'], T('f5', '立即') + 0.5, { stagger: 0.1 });
  show(ct.el, t5 + 0.3, { x: 24, y: 0, d: 0.6 });
  tl.to(lp, { autoAlpha: 0.3, duration: 0.5 }, t5 + 0.2);

  // ════ P3 页与索引项 ════
  const t6 = T('f6') - 0.3;
  hide([hp, ct.el, lead], t6, { y: -14, d: 0.4, stagger: 0.05 });
  tl.to(lp, { autoAlpha: 1, duration: 0.5 }, t6 + 0.3);
  tl.to(hdrSeg, { backgroundColor: 'rgba(242,145,17,.16)', duration: 0.4 }, t6);
  const tCut = T('f6', '切成') - 0.3;
  tl.to([b1, b2], { boxShadow: '0 0 0 2px rgba(70,203,230,.95), 0 0 40px rgba(25,169,201,.35)', backgroundColor: 'rgba(0,117,143,.4)', duration: 0.4, stagger: 0.25 }, tCut);
  tl.to(tk, { color: '#9fdcea', scale: 1.25, duration: 0.3, stagger: 0.12 }, tCut);
  const szTag = h('div', 'tag c-cyan', root, '每页 1024 字节'); px(szTag, 96 + 430 + 140, 146);
  show(szTag, tCut + 0.2, { y: 8, d: 0.4 });
  // 三段等长的尺寸线：文件头所在的一块，加两个索引页
  const dims = [0, 430, 860].map((x, i) => { const e = h('div', 'dim6', root, `<i></i><span>${['文件头占用第一块', 'PRIMARY 的根页', 'idx_name 的根页'][i]}<b>1024 字节</b></span>`); px(e, 96 + x, 330, 424); return e; });
  fromTo(dims, tCut + 0.1, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.22 });
  hide(dims, T('f7') - 0.5, { y: 10, d: 0.3 });

  const pc = h('div', 'panel', root); px(pc, 96, 330, 1284, 372);
  h('div', 'panel-hd', pc, '<span>页 @1024 · PRIMARY KEY (id)</span><span class="r">已用 <b style="color:var(--pale);font-weight:500">82</b> / 1024 字节</span>');
  const pb = h('div', 'pgc-b', pc);
  const pgx = h('div', 'pgx', pb);
  const pg = REAL.usersMYI.page1.match(/../g);
  const g = (hexs, cls, label, lcls) => { const e = h('div', 'g', pgx); h('div', 'cells', e, hexs.map((x) => `<span class="${cls}">${x}</span>`).join('')); h('div', 'lb ' + (lcls || ''), e, label); return e; };
  const gHead = g(pg.slice(0, 2), 'f-ghost', '页头', 'faint');
  const keysG = [], ptrG = [];
  for (let i = 0; i < 3; i++) { keysG.push(g(pg.slice(2 + i * 10, 6 + i * 10), 'f-id', `键 ${i + 1}`, 'c-cyan')); ptrG.push(g(pg.slice(6 + i * 10, 12 + i * 10), 'f-ptr', `行 ${i}`, 'c-orange')); }
  const more = h('div', 'more', pgx, '… 共 8 项');
  const chips = h('div', 'chips', pb);
  const chipEls = rows0.map((r, i) => h('div', 'chip', chips, `<span class="ck">${r.id}</span><span class="cp">行 ${i}</span>`));
  const endian = h('div', 'note', pb, '键按高位字节在前存放（行里的 id 是低位在前：01 00 00 00）'); css(endian, { fontSize: '20px', marginTop: '18px' });
  const meter = h('div', 'meter', pc); const mfill = h('i', '', meter); mfill.style.width = '8%';
  const zl1 = path(ov, `M${96 + 430},${196 + 80} L${96},${330 - 3}`, 'dim', { arrow: false, w: 1.4, dashed: '4 6' });
  const zl2 = path(ov, `M${96 + 430 + 424},${196 + 80} L${96 + 1284},${330 - 3}`, 'dim', { arrow: false, w: 1.4, dashed: '4 6' });
  const t7 = T('f7') - 0.35;
  show(pc, t7, { y: 24, d: 0.6 });
  fromTo([zl1, zl2], t7 + 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  tl.to(b2, { boxShadow: '0 0 0 1px rgba(159,220,234,.35), 0 0 0px rgba(0,0,0,0)', backgroundColor: 'rgba(8,44,56,.6)', autoAlpha: 0.5, duration: 0.4 }, t7);
  fromTo([gHead, ...keysG.flatMap((k, i) => [k, ptrG[i]]), more], t7 + 0.4, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.07 });
  fromTo(chipEls, T('f7', '排好序') - 0.1, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.07 });
  gsap.set([endian, meter], { autoAlpha: 0 });
  // f8 两部分：键 / 位置
  const pulse = (els, t, col) => { tl.fromTo(els, { boxShadow: `0 0 0 0px ${col}` }, { boxShadow: `0 0 0 3px ${col}`, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, t); };
  pulse([...keysG.map((x) => x.querySelector('.cells')), ...chipEls.map((c) => c.querySelector('.ck'))], T('f8', '键的值') - 0.1, 'rgba(70,203,230,.8)');
  tl.to(endian, { autoAlpha: 1, duration: 0.5 }, T('f8', '键的值') + 0.3);
  pulse([...ptrG.map((x) => x.querySelector('.cells')), ...chipEls.map((c) => c.querySelector('.cp'))], T('f8', '位置') - 1.2, 'rgba(242,145,17,.8)');
  // 每个索引项指向数据文件里的一行
  const cb4 = box(chipEls[4]), rb4 = box(lrows[4]);
  const links = [path(ov, `M${cb4.cx + 26},${cb4.b + 2} C${cb4.cx + 26},${cb4.b + 96} ${1400},${rb4.cy + 70} ${rb4.x - 4},${rb4.cy}`, 'orange', { w: 2.6 })];
  chipEls.forEach((c, i) => {
    const t = T('f8', '位置') - 1.1 + i * 0.11;
    tl.fromTo([c, lrows[i]], { backgroundColor: 'rgba(242,145,17,0)' }, { backgroundColor: 'rgba(242,145,17,.3)', duration: 0.16, yoyo: true, repeat: 1, immediateRender: false }, t);
  });
  arrowIn(links[0], T('f8', '位置') - 0.1, 0.7);
  tl.to(lrows[4], { backgroundColor: 'rgba(242,145,17,.2)', duration: 0.3 }, T('f8', '位置'));
  tl.to(chipEls[4], { boxShadow: '0 0 0 2px #f29111, 0 0 30px rgba(242,145,17,.5)', duration: 0.3 }, T('f8', '位置'));
  // f9 一页就放得下
  tl.to(meter, { autoAlpha: 1, duration: 0.3 }, T('f9') - 0.1);
  fromTo(mfill, T('f9'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.8 });

  // ════ P4 分裂 → B 树 → 十万行的真实形状 ════
  const t10 = T('f10') - 0.35;
  hide([pc, rib, ribName, szTag, lp, zl1, zl2, ...links], t10, { y: -16, d: 0.4 });
  const tw = h('div', 'abs', root); css(tw, { left: 0, top: 0, width: '1920px', height: '1080px' });
  const node = (x, y, w, hh, html, cls) => { const e = h('div', 'tn ' + (cls || ''), tw, html); px(e, x, y, w, hh); return e; };
  // 示意：一页装满 → 分裂（与真实文件一致：顺序插入时左页留 101 个键，键 102 上移）
  const L1 = node(680, 470, 560, 70, '<div class="fill"></div><span id="l1t">键 1 … 8</span>');
  const fillEl = L1.querySelector('.fill');
  const l1t = keyed(L1.querySelector('#l1t'));
  show(L1, t10 + 0.35, { y: 20, d: 0.5 });
  const tFull = T('f10', '一页') - 0.1;
  fromTo(fillEl, T('f10') , { width: '8%' }, { width: '100%', duration: tFull - T('f10') + 0.3, ease: 'power1.in' });
  l1t.at(T('f10') + 0.6, { html: '键 1 … 40' }).at(tFull - 0.25, { html: '键 1 … 80' }).at(tFull + 0.3, { html: '键 1 … 101' });
  tl.to(L1, { boxShadow: '0 0 0 2px var(--red), 0 0 40px rgba(238,106,85,.5)', duration: 0.25 }, tFull + 0.3);
  const fullTag = h('div', 'tag c-red', tw, '装满'); px(fullTag, 1260, 490);
  show(fullTag, tFull + 0.3, { x: -10, y: 0, d: 0.3 });
  const tSp = T('f10', '分裂') - 0.15;
  sfx('error', tFull + 0.3, { g: 0.5 }); sfx('whoosh', tSp, { g: 0.7 }); sfx('pop', tSp + 0.5); sfx('pop', T('f10', '上面') + 0.3); sfx('chime', T('f11', 'B') - 0.2);
  hide(fullTag, tSp, { y: 0, d: 0.2 });
  tl.to(L1, { x: -360, boxShadow: '0 0 0 1.5px var(--blue-hi), 0 14px 40px rgba(0,0,0,.45)', duration: 0.8, ease: 'power3.inOut' }, tSp);
  const R1 = node(1040, 470, 560, 70, '<div class="fill" style="width:6%"></div><span>键 103 …</span>');
  fromTo(R1, tSp + 0.2, { autoAlpha: 0, x: -200 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' });
  const tUp = T('f10', '上面') - 0.15;
  const P1 = node(860, 300, 200, 64, '<span>键 102</span>'); css(P1, { boxShadow: '0 0 0 1.5px var(--orange), 0 0 40px rgba(242,145,17,.3)', color: 'var(--orange-hi)' });
  fromTo(P1, tUp, { autoAlpha: 0, y: 150, scale: 0.7 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' });
  const e1 = path(ov, `M${900},${366} C${900},${420} ${600},${410} ${600},${466}`, 'pale', { w: 2 });
  const e2 = path(ov, `M${1020},${366} C${1020},${420} ${1320},${410} ${1320},${466}`, 'pale', { w: 2 });
  arrowIn(e1, tUp + 0.5, 0.5); arrowIn(e2, tUp + 0.6, 0.5);
  const upNote = h('div', 'note abs', tw, '分隔键上移，左右各是一个子页'); px(upNote, 1090, 316);
  show(upNote, tUp + 0.7, { x: -10, y: 0, d: 0.5 });
  const bt = h('div', 'btree', tw, 'B 树');
  fromTo(bt, T('f11', 'B') - 0.25, { autoAlpha: 0, y: 20, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)' });

  // 十万行：真实的三层
  const t12 = T('f12') - 0.45;
  hide([L1, R1, P1, e1, e2, upNote], t12, { y: 20, d: 0.4 });
  tl.to(bt, { autoAlpha: 0, duration: 0.3 }, t12);
  const X0 = 270, PITCH = 74, YR = 176, YN = 360, YL = 452;
  const BT = bigTree(tw, ov, { X0, PITCH, YR, YN, YL });
  const { rootN, mids, leaves, edges } = BT;
  const lv = [['第 1 层', '1 页', YR + 12], ['第 2 层', '21 页', YN - 2], ['第 3 层 · 叶子', '981 页', YL + 22]].map(([a, b, y]) => { const e = h('div', 'lvl', tw, `${a}<br><b>${b}</b>`); e.style.top = y + 'px'; css(e, { lineHeight: '1.45' }); return e; });
  fromTo(rootN, t12 + 0.35, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5 });
  fromTo(edges, t12 + 0.6, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.025 });
  fromTo(mids, t12 + 0.7, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.025 });
  fromTo(leaves, t12 + 1.0, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.03 });
  fromTo(lv, t12 + 0.5, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.3 });
  const b3 = h('div', 'big3', tw, '<div><b id="b3a">0</b><span>行</span></div><div><b class="c-orange">3</b><span>层</span></div><div><b>1,003</b><span>个 1024 字节的页</span></div>');
  css(b3, { top: '640px' });
  fromTo([...b3.children], T('f12', '十万') - 0.1, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.35 });
  countTo(b3.querySelector('#b3a'), 0, 100000, T('f12', '十万') - 0.1, 1.2);
  tl.fromTo(b3.children[1], { scale: 1 }, { scale: 1.25, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, T('f12', '三层'));

  // ════ P5 主键与普通索引：同一种结构 ════
  const t13 = T('f13') - 0.35;
  hide([tw, ...edges], t13, { y: -16, d: 0.4 });
  tl.to(lp, { autoAlpha: 1, y: 0, duration: 0.6 }, t13 + 0.3);
  const mkIx = (x, y, title, sub, items, cls) => {
    const p = h('div', 'panel ix', root); px(p, x, y);
    h('div', 'panel-hd', p, `<span>${title}</span><span class="r">${sub}</span>`);
    const b = h('div', 'ml', p);
    const rs = items.map(([k, r]) => h('div', 'ml-r', b, `<span class="a ${cls}">${k}</span><span class="faint" style="margin:0 20px">→</span><span class="c-orange" style="font-family:var(--sans);font-size:21px;letter-spacing:.06em">行 ${r}</span>`));
    return { p, rs };
  };
  const ixA = mkIx(96, 150, 'PRIMARY KEY (id)', 'B 树', [['4', 3], ['5', 4], ['6', 5]], 'c-cyan');
  const ixB = mkIx(716, 150, 'KEY idx_name (name)', 'B 树', [["'dave'", 3], ["'erin'", 4], ["'frank'", 5]], 'c-mint');
  css(ixA.p, { height: '236px' }); css(ixB.p, { height: '236px' });
  show([ixA.p, ixB.p], t13 + 0.35, { y: 24, d: 0.6, stagger: 0.25 });
  const r4 = box(lrows[4]);
  const a1b = box(ixA.rs[1]), b1b = box(ixB.rs[1]);
  const la = path(ov, `M${a1b.x + 330},${a1b.b + 4} C${a1b.x + 330},${560} ${1300},${r4.cy + 150} ${r4.x - 4},${r4.cy + 6}`, 'orange', { w: 2.6 });
  const lb = path(ov, `M${b1b.x + 380},${b1b.cy} C${1330},${b1b.cy} ${1330},${r4.cy - 6} ${r4.x - 4},${r4.cy - 6}`, 'orange', { w: 2.6 });
  const t14 = T('f14') - 0.1;
  tl.to([ixA.rs[1], ixB.rs[1]], { backgroundColor: 'rgba(242,145,17,.18)', duration: 0.3 }, t14);
  arrowIn(la, t14 + 0.1, 0.8); arrowIn(lb, t14 + 0.3, 0.8);
  const same = h('div', 'same', root, '键 <span class="faint">→</span> <b>行的位置</b><span class="dim" style="font-size:24px;margin-left:36px;letter-spacing:.08em">数据只有一份，留在 .MYD 里</span>');
  css(same, { top: '560px' });
  show(same, T('f14', '位置') - 0.3, { y: 16, d: 0.7 });
});

// 十万行表 PRIMARY 索引的真实形状：1 个根页、21 个中间页、981 个叶子页（06、07 两章共用）
function bigTree(tw, ov, { X0, PITCH, YR, YN, YL }) {
  const big = REAL.big;
  const mk = (x, y, w, hh, html, cls) => { const e = h('div', 'tn ' + (cls || ''), tw, html); px(e, x, y, w, hh); return e; };
  const cx = X0 + (21 * PITCH - 10) / 2;
  const rootN = mk(cx - 130, YR, 260, 52, '<span>根页 · 20 个键</span>');
  const mids = big.fan.map((n, i) => mk(X0 + i * PITCH, YN, PITCH - 10, 26, '', 'sm'));
  const leaves = big.fan.map((n, i) => { const e = h('div', 'lf', tw); px(e, X0 + i * PITCH - 3, YL); e.innerHTML = '<i></i>'.repeat(n); return e; });
  const edges = mids.map((m, i) => { const x = X0 + i * PITCH + (PITCH - 10) / 2; const rx = cx - 110 + i * 11; return path(ov, `M${rx},${YR + 54} C${rx},${YR + 54 + (YN - YR) * 0.45} ${x},${YN - (YN - YR) * 0.4} ${x},${YN - 3}`, 'dim', { arrow: false, w: 1.3, opacity: 0.8 }); });
  return { rootN, mids, leaves, edges, cx };
}
