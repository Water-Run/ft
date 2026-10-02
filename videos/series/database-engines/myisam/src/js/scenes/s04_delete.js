// 04 删除与空位：四个阶段的字节都取自真实文件快照（REAL.usersMYD[0..3]）
scene('s4', ({ root, s, c0 }) => {
  injectMydCss(root);
  const st = document.createElement('style');
  st.textContent = `
  .cmdbar { position:absolute; left:96px; top:716px; width:1240px; height:60px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); display:flex; align-items:center; padding:0 24px; font-family:var(--mono); font-size:25px; white-space:pre; color:#cfe3e8; }
  .cmdbar .p { color:var(--orange); } .cmdbar .k { color:var(--cyan); }
  .chain { position:absolute; left:96px; top:800px; height:84px; display:flex; align-items:center; white-space:nowrap; }
  .cn { height:64px; padding:0 22px; border-radius:10px; border:1px solid var(--line-2); background:rgba(6,34,44,.8); display:flex; flex-direction:column; justify-content:center; gap:3px; overflow:hidden; flex:none; }
  .cn b { font-size:22px; font-weight:500; letter-spacing:.06em; }
  .cn span { font-family:var(--mono); font-size:16px; color:var(--faint); }
  .cn.head { border-color:rgba(242,145,17,.7); } .cn.head b { color:var(--orange-hi); }
  .cn.hole { border-color:rgba(238,106,85,.7); } .cn.hole b { color:var(--red); }
  .ca { width:64px; height:2px; background:var(--dim); position:relative; margin:0 12px; flex:none; }
  .ca::after { content:""; position:absolute; right:0; top:-5px; width:10px; height:10px; border-top:2px solid var(--dim); border-right:2px solid var(--dim); transform:rotate(45deg); }
  .exbar { position:absolute; left:96px; top:796px; width:1240px; height:76px; border-radius:10px; background:rgba(6,34,44,.7); border:1px solid var(--line); display:flex; align-items:center; padding:0 24px; }
  .exbar > div { display:flex; align-items:center; gap:6px; }
  .exbar .eb { font-family:var(--mono); font-size:25px; width:44px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:5px; }
  .exbar .et { font-size:23px; letter-spacing:.06em; color:var(--dim); margin-left:14px; }
  .exbar .et b { color:var(--orange-hi); font-weight:500; }
  .exbar .es { width:46px; }
  .dec-row .dead { color:var(--red); opacity:.75; letter-spacing:.1em; font-family:var(--sans); font-size:20px; padding-left:34px; }
  .ord { position:absolute; left:1368px; top:716px; width:456px; font-size:22px; letter-spacing:.05em; color:var(--dim); line-height:1.6; }
  .ord b { color:var(--orange-hi); font-weight:500; font-family:var(--mono); letter-spacing:0; }
  `;
  root.appendChild(st);

  const [h0, h1, h2, h3] = REAL.usersMYD;
  const G = MYD_GEO;
  const P = mydPanel(root, h0, { rows: 9, colored: true, size: 128 });
  const { hv, dec } = P;
  const rows0 = h0.match(/.{32}/g).map(decodeRow);
  rows0.forEach((r, i) => { dec[i].id.textContent = r.id; dec[i].name.textContent = r.name; dec[i].age.textContent = r.age; });
  hv.cells.forEach((c, i) => { if (fieldOf(i) === 'name' && h0.substr(i * 2, 2) === '20') c.style.opacity = 0.42; });
  hv.asc.forEach((a, i) => { a.style.color = { flag: '#f29111', id: '#46cbe6', name: '#6fe0b6', age: '#f1d98a' }[fieldOf(i)]; a.style.width = '17px'; });
  // 第 9 行开始时不存在：面板先按 8 行的高度显示
  css(P.panel, { height: (P.pH - G.rowH) + 'px', overflow: 'hidden' });
  css(P.dp, { height: (P.pH - G.rowH) + 'px', overflow: 'hidden' });
  gsap.set(dec[8].row, { autoAlpha: 0 });
  gsap.set(hv.rows[8], { autoAlpha: 0 });
  show([P.panel, P.dp], c0 + 0.05, { y: 24, d: 0.7, stagger: 0.08 });
  const size = P.hd.querySelector('.sz');

  // 命令条
  const bar = h('div', 'cmdbar', root); const barIn = h('span', '', bar);
  show(bar, c0 + 0.3, { y: 14, d: 0.6 });
  const cmds = [];
  const cmd = (html, t) => { cmds.push({ t, html }); };
  F((t) => {
    let cur = null; for (const c of cmds) if (t >= c.t) cur = c;
    if (!cur) { if (barIn._k !== 'none') { barIn.innerHTML = '<span class="p">mysql&gt; </span><span class="cur"></span>'; barIn._k = 'none'; } return; }
    const toks = tokenize(cur.html); const n = toks.filter((k) => k.ch).length;
    const k = Math.round(clamp((t - cur.t) / (n / 46)) * n);
    const key = cur.t + ':' + k; if (barIn._k === key) return; barIn._k = key;
    let sOut = '', c = 0; const open = [];
    for (const tk of toks) { if (tk.tag) { if (c <= k) { sOut += tk.tag; if (tk.tag[1] === '/') open.pop(); else open.push(tk.tag); } continue; } if (c < k) sOut += tk.ch; c++; if (c > k) break; }
    for (let i = open.length - 1; i >= 0; i--) sOut += '</span>';
    barIn.innerHTML = '<span class="p">mysql&gt; </span>' + sOut + (k < n ? '<span class="cur"></span>' : '');
  });

  // 行高亮
  const ring = (r, t0, t1, col = '238,106,85') => {
    tl.to(hv.rows[r], { boxShadow: `0 0 0 2px rgba(${col},.9)`, backgroundColor: `rgba(${col},.10)`, borderRadius: 6, duration: 0.3 }, t0);
    tl.to(hv.rows[r], { boxShadow: `0 0 0 0px rgba(${col},0)`, backgroundColor: `rgba(${col},0)`, duration: 0.4 }, t1);
  };
  const cellAt = (r, c) => r * 16 + c;
  const ghostRow = (r, t) => { for (let c = 7; c < 16; c++) { pokeByte(hv, cellAt(r, c), null, t, 'f-ghost', { pop: false }); } };
  const deadRow = (r, t) => { keyed(dec[r].id).at(t, { html: '' }); keyed(dec[r].name).at(t, { html: '已删除', cls: 'b dead' }); keyed(dec[r].age).at(t, { html: '' }); tl.fromTo(dec[r].row, { backgroundColor: 'rgba(238,106,85,.3)' }, { backgroundColor: 'rgba(238,106,85,0)', duration: 0.9, immediateRender: false }, t); };
  const liveRow = (r, hex32, t) => {
    const d = decodeRow(hex32);
    for (let c = 0; c < 16; c++) pokeByte(hv, cellAt(r, c), hex32.substr(c * 2, 2), t + c * 0.022, 'f-' + fieldOf(c));
    keyed(dec[r].id).at(t + 0.3, { html: String(d.id) }); keyed(dec[r].name).at(t + 0.3, { html: d.name, cls: 'b c-mint' }); keyed(dec[r].age).at(t + 0.3, { html: String(d.age) });
    tl.fromTo(dec[r].row, { backgroundColor: 'rgba(111,224,182,.32)' }, { backgroundColor: 'rgba(111,224,182,0)', duration: 1.1, immediateRender: false }, t + 0.3);
    for (let c = 5; c < 15; c++) { const pad = hex32.substr(c * 2, 2) === '20'; tl.to(hv.cells[cellAt(r, c)], { opacity: pad ? 0.42 : 1, duration: 0.2 }, t + c * 0.022); }
  };

  // ── d1 删除 id = 3 ──
  const t1 = T('d1') - 0.2;
  cmd('<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 3;', t1);
  ring(2, T('d1', '删除') + 0.5, T('d5') - 0.3);
  tl.fromTo(size.parentNode, { color: '#4f7682' }, { color: '#ffb347', duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, T('d1', '不会'));
  // ── d2 开头七个字节 ──
  const b0 = box(hv.cells[cellAt(2, 0)], P.body), b6 = box(hv.cells[cellAt(2, 6)], P.body);
  const seven = h('div', 'abs', P.body); css(seven, { left: (b0.x - 3) + 'px', top: (b0.y - 2) + 'px', width: (b6.r - b0.x + 6) + 'px', height: (b0.h + 4) + 'px', border: '2px solid #ee6a55', borderRadius: '7px', boxShadow: '0 0 24px rgba(238,106,85,.5)' });
  fromTo(seven, T('d2', '开头') - 0.1, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 0.45 });
  hide(seven, T('d5') - 0.4, { y: 0, d: 0.3 });
  // ── d3 首字节 → 00 ──
  pokeByte(hv, cellAt(2, 0), '00', T('d3', '写成') + 0.15, 'f-del');
  deadRow(2, T('d3', '已删除'));
  ghostRow(2, T('d3', '已删除'));
  // ── d4 六字节指针 ──
  for (let c = 1; c <= 6; c++) pokeByte(hv, cellAt(2, c), 'ff', T('d4', '六个') + (c - 1) * 0.07, 'f-ptr');
  // 底部说明条：这 7 个字节各是什么
  const ex = h('div', 'exbar', root);
  const exIn = h('div', '', ex);
  const exHtml = (ptr, txt) => `<span class="eb f-del">00</span><span class="et">已删除</span><span class="es"></span>${ptr.map((x) => `<span class="eb f-ptr">${x}</span>`).join('')}<span class="et">${txt}</span>`;
  exIn.innerHTML = '<span class="eb f-del">00</span><span class="et">已删除</span>';
  keyed(exIn).at(T('d4', '六个') - 0.05, { html: exHtml(['ff', 'ff', 'ff', 'ff', 'ff', 'ff'], '指针：上一个空位 <b>无</b>（链到此为止）') });
  show(ex, T('d3', '写成') + 0.3, { y: 12, d: 0.5 });
  // ── d5 再删 id = 6：指针指回行 2 ──
  const t5 = T('d5') - 0.25;
  cmd('<span class="k">DELETE FROM</span> users <span class="k">WHERE</span> id = 6;', t5);
  ring(5, t5 + 0.7, T('d7') - 0.2);
  const tp = T('d5', '新的') - 0.1;
  pokeByte(hv, cellAt(5, 0), '00', tp, 'f-del');
  const p5 = '000000000002'.match(/../g);
  for (let c = 1; c <= 6; c++) pokeByte(hv, cellAt(5, c), p5[c - 1], tp + 0.1 + c * 0.06, 'f-ptr');
  deadRow(5, tp + 0.2); ghostRow(5, tp + 0.2);
  // 从行 5 指回行 2 的箭头（画在偏移列上方）
  const ov = overlay(P.body);
  css(ov, { width: '100%', height: '100%' }); ov.removeAttribute('viewBox');
  const r5 = box(hv.cells[cellAt(5, 0)], P.body), r2 = box(hv.cells[cellAt(2, 0)], P.body);
  const link = path(ov, `M${r5.x - 10},${r5.cy} C${r5.x - 96},${r5.cy} ${r2.x - 96},${r2.cy} ${r2.x - 5},${r2.cy}`, 'orange', { w: 2.8 });
  arrowIn(link, T('d5', '指回') - 0.15, 0.7);
  keyed(exIn).at(tp + 0.2, { html: exHtml(['00', '00', '00', '00', '00', '02'], '指针：上一个空位 <b>行 2</b>') });
  tl.fromTo(ex, { borderColor: 'rgba(242,145,17,.9)' }, { borderColor: 'rgba(127,211,230,.16)', duration: 0.9, immediateRender: false }, tp + 0.2);
  hide(ex, T('d6') - 0.5, { y: 10, d: 0.35 });

  // ── d6 空位链 ──
  const chain = h('div', 'chain', root);
  const nHead = h('div', 'cn head', chain, '<b>链头</b><span>users.MYI · dellink</span>');
  const a1 = h('div', 'ca', chain);
  const n5 = h('div', 'cn hole', chain, '<b>行 5</b><span>偏移 0x50</span>');
  const a2 = h('div', 'ca', chain);
  const n2 = h('div', 'cn hole', chain, '<b>行 2</b><span>偏移 0x20</span>');
  const a3 = h('div', 'ca', chain);
  const nEnd = h('div', 'cn', chain, '<b class="dim">结束</b><span>ff…ff</span>');
  const parts = [nHead, a1, n5, a2, n2, a3, nEnd];
  hide(bar, T('d6') - 0.5, { y: 10, d: 0.35 });
  css(chain, { top: '716px' });
  fromTo(parts, T('d6', '连成') - 0.3, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.13 });
  tl.fromTo(nHead, { boxShadow: '0 0 0px rgba(242,145,17,0)' }, { boxShadow: '0 0 40px rgba(242,145,17,.5)', duration: 0.4, yoyo: true, repeat: 1, immediateRender: false }, T('d6', '链头'));
  // 链随后续插入缩短
  const drop = (node, arrow, t) => { tl.to([node, arrow], { autoAlpha: 0, width: 0, paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0, borderWidth: 0, duration: 0.55, ease: 'power3.inOut' }, t); };

  // ── d7 插入：先填链头 ──
  const cmd2 = h('div', 'cmdbar', root); css(cmd2, { top: '800px' }); const cmd2In = h('span', '', cmd2);
  gsap.set(cmd2, { autoAlpha: 0 });
  tl.to(cmd2, { autoAlpha: 1, duration: 0.4 }, T('d7') - 0.4);
  const ins = (vals, t) => `<span class="p">mysql&gt; </span><span class="k">INSERT INTO</span> users <span class="k">VALUES</span> ${vals};`;
  const tI1 = T('d7', '先取') - 0.2, tI2 = Tend('d7') + 0.05, tI3 = T('d8', '追加') - 0.25;
  keyed(cmd2In).at(T('d7') - 0.4, { html: ins("(9,'ivan',44)") }).at(tI2 - 0.25, { html: ins("(10,'judy',27)") }).at(tI3 - 0.5, { html: ins("(11,'mallory',39)") });
  tl.fromTo(cmd2, { borderColor: 'rgba(111,224,182,.9)' }, { borderColor: 'rgba(127,211,230,.16)', duration: 0.8, immediateRender: false }, tI2 - 0.25);
  tl.fromTo(cmd2, { borderColor: 'rgba(111,224,182,.9)' }, { borderColor: 'rgba(127,211,230,.16)', duration: 0.8, immediateRender: false }, tI3 - 0.5);
  hide(link, tI1, { y: 0, d: 0.3 });
  liveRow(5, h2.substr(5 * 32, 32), tI1); ring(5, tI1, tI1 + 1.0, '111,224,182'); drop(n5, a1, tI1 + 0.1);
  liveRow(2, h3.substr(2 * 32, 32), tI2); ring(2, tI2, tI2 + 1.0, '111,224,182'); drop(n2, a2, tI2 + 0.1);
  // ── d8 没有空位：追加到末尾 ──
  tl.to([P.panel, P.dp], { height: P.pH, duration: 0.6, ease: 'power3.inOut' }, tI3 - 0.35);
  tl.to([bar, chain, cmd2], { y: G.rowH, duration: 0.6, ease: 'power3.inOut' }, tI3 - 0.35);
  tl.to(hv.rows[8], { autoAlpha: 1, duration: 0.25 }, tI3 - 0.05);
  tl.to(hv.offs[8], { opacity: 1, duration: 0.3 }, tI3);
  liveRow(8, h3.substr(8 * 32, 32), tI3); ring(8, tI3, tI3 + 1.1, '111,224,182');
  tl.to(dec[8].row, { autoAlpha: 1, duration: 0.3 }, tI3 + 0.25);
  countTo(size, 128, 144, tI3, 0.8, (v) => Math.round(v));
  tl.fromTo(size.parentNode, { color: '#ffb347' }, { color: '#4f7682', duration: 1.2, immediateRender: false }, tI3);

  // ── d9 物理顺序 ≠ 插入顺序 ──
  const t9 = T('d9') - 0.2;
  hide([chain, cmd2], t9 - 0.2, { y: G.rowH + 10, d: 0.35 });
  const big = h('div', 'cmdbar', root); css(big, { top: (716 + G.rowH) + 'px' });
  big.innerHTML = '<span><span class="p">mysql&gt; </span><span class="k">SELECT</span> id <span class="k">FROM</span> users;   <span class="faint">→</span>  1  2  <span class="c-orange">10</span>  4  5  <span class="c-orange">9</span>  7  8  <span class="c-orange">11</span></span>';
  show(big, t9 + 0.1, { y: 14, d: 0.6 });
  const ord = h('div', 'ord', root, '不带 ORDER BY 的全表扫描<br>按<b>文件里的位置</b>逐行返回'); css(ord, { top: (724 + G.rowH) + 'px' });
  show(ord, T('d9', '顺序') , { y: 14, d: 0.6 });
  [2, 5, 8].forEach((r, i) => { tl.to(dec[r].id, { color: '#ffb347', scale: 1.25, duration: 0.3, yoyo: true, repeat: 1 }, T('d9', '顺序') + i * 0.18); tl.set(dec[r].id, { color: '#ffb347' }, T('d9', '顺序') + i * 0.18 + 0.62); });
});
