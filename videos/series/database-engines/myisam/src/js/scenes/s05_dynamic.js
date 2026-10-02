// 05 变长行与碎片：notes.MYD 的真实块布局（84 → 136 字节）
scene('s5', ({ root, s, c0 }) => {
  const U = 12;                       // 条带上 1 字节 = 12px；20px 等宽字恰好 1 字符 = 12px
  const RX = 144, RY = 524, RH = 78;  // 条带左上角与高度
  const st = document.createElement('style');
  st.textContent = `
  .nt { font-family:var(--mono); font-size:24px; line-height:1.75; padding:18px 28px; white-space:pre; color:#cfe3e8; }
  .nt .sc { color:var(--faint); font-size:20px; }
  .nt .sc b { color:var(--orange-hi); font-weight:500; }
  .len { position:absolute; right:28px; display:flex; align-items:center; gap:12px; font-size:19px; letter-spacing:.06em; color:var(--dim); white-space:nowrap; }
  .len i { display:block; height:10px; border-radius:3px; background:var(--mint); opacity:.8; }
  .nt i { font-style:normal; color:var(--cyan); display:inline-block; width:44px; }
  .sv { position:absolute; left:1010px; top:128px; width:814px; height:244px; padding:26px 34px; }
  .sv-r { display:flex; align-items:center; gap:18px; height:60px; font-size:24px; letter-spacing:.05em; color:var(--dim); white-space:nowrap; }
  .sv-r b { font-family:var(--mono); font-weight:500; font-size:30px; color:var(--text); width:150px; text-align:right; }
  .sv-bar { height:16px; border-radius:3px; }
  .rb { position:absolute; left:${RX}px; top:${RY}px; height:${RH}px; }
  .blk { position:absolute; top:0; height:${RH}px; display:flex; border-radius:7px; overflow:hidden; box-shadow:0 0 0 1px rgba(159,220,234,.35), 0 14px 40px rgba(0,0,0,.4); }
  .bp { height:100%; display:flex; align-items:center; font-family:var(--mono); font-size:20px; white-space:pre; overflow:hidden; flex:none; }
  .bp.hd { background:rgba(242,145,17,.5); box-shadow:inset -1px 0 0 rgba(242,145,17,.8); }
  .bp.dt { background:rgba(111,224,182,.16); color:#c9f5e3; }
  .bp.dt u { text-decoration:none; color:rgba(111,224,182,.45); }
  .bp.pd { background:repeating-linear-gradient(135deg, rgba(127,211,230,.10) 0 5px, rgba(127,211,230,.03) 5px 10px); }
  .bp.fr { background:rgba(238,106,85,.10); }
  .tick { position:absolute; top:${RH + 8}px; font-family:var(--mono); font-size:17px; color:var(--faint); transform:translateX(-50%); }
  .tick::before { content:""; position:absolute; left:50%; top:-8px; width:1px; height:6px; background:var(--faint); }
  .rlab { position:absolute; top:-34px; font-size:19px; letter-spacing:.06em; color:var(--dim); white-space:nowrap; }
  .lgd { position:absolute; left:${RX}px; top:${RY + RH + 46}px; display:flex; gap:30px; font-size:20px; letter-spacing:.06em; color:var(--dim); align-items:center; }
  .lgd i { display:inline-block; width:22px; height:14px; border-radius:3px; margin-right:9px; vertical-align:-1px; }
  .zm { position:absolute; left:0; right:0; top:716px; display:flex; justify-content:center; }
  .zc { display:flex; flex-direction:column; align-items:center; }
  .zc .cells { display:flex; gap:4px; }
  .zc .cells span { font-family:var(--mono); font-size:27px; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:6px; }
  .zc .lb { margin-top:10px; font-size:20px; letter-spacing:.04em; white-space:nowrap; }
  .zc .lb small { font-family:var(--mono); font-size:16px; opacity:.8; }
  .zg { display:flex; gap:14px; }
  .zsep { width:1px; background:var(--line-2); margin:0 16px; height:50px; }
  .cmd5 { position:absolute; left:${RX}px; top:706px; width:1632px; height:60px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); display:block; line-height:58px; padding:0 24px; font-family:var(--mono); font-size:23px; white-space:pre; color:#cfe3e8; }
  .cmd5 .p { color:var(--orange); } .cmd5 .k { color:var(--cyan); } .cmd5 .s { color:var(--mint); }
  .nbar { position:absolute; height:40px; display:flex; }
  .nbar div { height:100%; background:rgba(111,224,182,.3); box-shadow:inset 0 0 0 1.5px var(--mint); display:flex; align-items:center; font-family:var(--mono); font-size:20px; color:#eafff6; white-space:pre; overflow:hidden; }
  .frag { position:absolute; left:${RX}px; top:736px; height:60px; width:1632px; }
  .frag i { position:absolute; top:0; height:60px; border-radius:5px; display:block; }
  `;
  root.appendChild(st);

  // ── 上：逻辑上的三行 ──
  const tp = h('div', 'panel', root); px(tp, 96, 128, 880, 244);
  const tph = h('div', 'panel-hd', tp, '<span>notes</span><span class="r">Row_format: <span id="rfm" style="color:var(--faint)">?</span></span>');
  const nt = h('div', 'nt', tp);
  h('div', 'sc', nt, 'id INT,  body <b>VARCHAR(200)</b>');
  const r1 = h('div', '', nt, '<i>1</i><span>hello</span>');
  h('div', '', nt, '<i>2</i>MyISAM stores rows in a .MYD file');
  h('div', '', nt, '<i>3</i>short');
  // e1：三行的长度各不相同
  const lens = [[5, 250], [33, 292], [5, 334]].map(([n, y]) => { const e = h('div', 'len', tp, `<i style="width:${n * 5}px"></i>${n} 个字符`); e.style.top = (y - 128 - 9) + 'px'; return e; });
  fromTo(lens, T('e1', '行的长度') - 0.3, { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.14 });
  tl.to(lens, { autoAlpha: 0, duration: 0.4 }, T('e5') - 0.4);
  show(tp, c0 + 0.05, { y: 24, d: 0.7 });
  tl.fromTo(nt.querySelector('.sc b'), { backgroundColor: 'rgba(242,145,17,0)' }, { backgroundColor: 'rgba(242,145,17,.28)', duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, T('e1', 'VARCHAR') - 0.1);
  const rfm = tph.querySelector('#rfm');
  keyed(rfm).at(T('e2', '动态') - 0.05, { html: '<span style="color:var(--orange-hi)">Dynamic</span>' });
  tl.fromTo(rfm, { scale: 1.5 }, { scale: 1, duration: 0.5, immediateRender: false, transformOrigin: '100% 50%' }, T('e2', '动态') - 0.05);

  // ── 条带：文件里的块 ──
  const rb = h('div', 'rb', root);
  const part = (blk, cls, nBytes, text) => { const e = h('div', 'bp ' + cls, blk, text || ''); e.style.width = nBytes * U + 'px'; return e; };
  const mkBlock = (off, parts) => { const b = h('div', 'blk', rb); b.style.left = off * U + 'px'; b.style.width = parts.reduce((a, p) => a + p[1], 0) * U + 'px'; b._p = parts.map(([cls, n, txt]) => part(b, cls, n, txt)); return b; };
  const dots = (n) => `<u>${'·'.repeat(n)}</u>`;
  const A0 = mkBlock(0, [['hd', 4], ['dt', 11, dots(6) + 'hello'], ['pd', 5]]);
  const B = mkBlock(20, [['hd', 4], ['dt', 39, dots(6) + 'MyISAM stores rows in a .MYD file'], ['pd', 1]]);
  const C = mkBlock(64, [['hd', 4], ['dt', 11, dots(6) + 'short'], ['pd', 5]]);
  const A1 = mkBlock(0, [['hd', 13], ['dt', 7, dots(6) + 'h']]);
  const D = mkBlock(84, [['hd', 3], ['dt', 49, 'ello, this row just grew longer than its old slot']]);
  const tick = (off) => { const e = h('div', 'tick', rb, '0x' + off.toString(16).padStart(2, '0')); e.style.left = off * U + 'px'; return e; };
  const ticks = [tick(0), tick(20), tick(64), tick(84)];
  const tickEnd = tick(136);
  const lab = (off, txt) => { const e = h('div', 'rlab', rb, txt); e.style.left = off * U + 'px'; return e; };
  const labs = [lab(0, '行 1 · 20 字节'), lab(20, '行 2 · 44 字节'), lab(64, '行 3 · 20 字节')];
  const rtitle = h('div', 'tag dim mono', root, 'notes.MYD'); px(rtitle, RX, RY - 92); css(rtitle, { fontSize: '20px', letterSpacing: '.06em' });
  const lgd = h('div', 'lgd', root, '<span><i style="background:rgba(242,145,17,.6)"></i>头部</span><span><i style="background:rgba(111,224,182,.4)"></i>数据</span><span><i style="background:repeating-linear-gradient(135deg, rgba(127,211,230,.3) 0 4px, rgba(127,211,230,.08) 4px 8px)"></i>填充</span><span class="faint">宽度按字节数等比例绘制</span>');
  gsap.set([A1, D, tickEnd], { autoAlpha: 0 });
  const t2 = T('e2') - 0.2;
  show(rtitle, t2, { y: 0, d: 0.4 });
  fromTo([A0, B, C], t2 + 0.1, { autoAlpha: 0, scaleX: 0.2, transformOrigin: '0% 50%' }, { autoAlpha: 1, scaleX: 1, duration: 0.7, stagger: 0.16, ease: 'power3.out' });
  fromTo(ticks, t2 + 0.3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.16 });
  fromTo(labs, t2 + 0.45, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.16 });
  // 头部先不显色，e3 才点亮
  const hds = [A0, B, C].map((b) => b._p[0]);
  gsap.set(hds, { backgroundColor: 'rgba(111,224,182,.16)', boxShadow: 'inset -1px 0 0 rgba(242,145,17,0)' });
  const t3 = T('e3', '头部') - 0.25;
  tl.to(hds, { backgroundColor: 'rgba(242,145,17,.5)', boxShadow: 'inset -1px 0 0 rgba(242,145,17,.8)', duration: 0.45, stagger: 0.12 }, t3);
  show(lgd, t3 + 0.2, { y: 8, d: 0.5 });

  // ── e3 放大第一块：20 个字节各是什么 ──
  const zm = h('div', 'zm', root);
  const zg = h('div', 'zg', zm);
  const grp = (hexs, cls, label) => { const g = h('div', 'zc', zg); h('div', 'cells', g, hexs.map((x) => `<span class="${cls}">${x}</span>`).join('')); h('div', 'lb ' + (cls === 'f-ptr' ? 'c-orange' : cls === 'f-ghost' ? 'faint' : 'c-mint'), g, label); return g; };
  const zParts = [
    grp(['03'], 'f-ptr', '块类型'),
    grp(['00', '0b'], 'f-ptr', '数据长 <small>11</small>'),
    grp(['05'], 'f-ptr', '填充 <small>5</small>'),
    h('div', 'zsep', zg),
    grp(['00'], 'f-name', '标志'),
    grp(['01', '00', '00', '00'], 'f-name', 'id = 1'),
    grp(['05'], 'f-name', '串长 <small>5</small>'),
    grp(['68', '65', '6c', '6c', '6f'], 'f-name', "'hello'"),
    h('div', 'zsep', zg),
    grp(['00', '00', '00', '00', '00'], 'f-ghost', '填充到 20 字节'),
  ];
  fromTo(zParts, t3 + 0.5, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.09 });
  // 放大引线
  const ov = overlay(root);
  const zb = box(zg);
  const lead1 = path(ov, `M${RX},${RY + RH + 2} L${zb.x - 6},${zb.y - 6}`, 'dim', { arrow: false, w: 1.4, dashed: '4 6' });
  const lead2 = path(ov, `M${RX + 20 * U},${RY + RH + 2} L${zb.r + 6},${zb.y - 6}`, 'dim', { arrow: false, w: 1.4, dashed: '4 6' });
  fromTo([lead1, lead2], t3 + 0.4, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  tl.to(lgd, { autoAlpha: 0, duration: 0.3 }, t3 + 0.35);
  tl.to(A0, { boxShadow: '0 0 0 2px rgba(242,145,17,.95), 0 14px 40px rgba(0,0,0,.4)', duration: 0.3 }, t3 + 0.4);

  // ── e4 省下的空间（真实数字：定长需 205 字节/行）──
  const sv = h('div', 'panel sv', root);
  sv.innerHTML = `<div class="sv-r"><span style="width:150px">若按定长存</span><b>615</b><span>字节</span><div class="sv-bar" style="width:300px;background:var(--sea-4)"></div></div>` +
    `<div class="sv-r"><span style="width:150px">动态格式</span><b class="c-mint">84</b><span>字节</span><div class="sv-bar" style="width:41px;background:var(--mint)"></div></div>` +
    `<div class="note" style="font-size:20px;margin-top:14px">定长时每行 1 + 4 + 200 = 205 字节，共 3 行</div>`;
  show(sv, T('e4') - 0.2, { x: 30, y: 0, d: 0.7 });
  fromTo(sv.querySelectorAll('.sv-bar'), T('e4'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.8, stagger: 0.25, ease: 'power3.out' });

  // ── e5 改长第一行：56 字节放不进 20 字节的位置 ──
  const t5 = T('e5') - 0.3;
  hide([zm, lead1, lead2], t5 - 0.15, { y: 10, d: 0.3 });
  tl.to(A0, { boxShadow: '0 0 0 1px rgba(159,220,234,.35), 0 14px 40px rgba(0,0,0,.4)', duration: 0.3 }, t5);
  const cmd = h('div', 'cmd5', root, `<span class="p">mysql&gt; </span><span class="k">UPDATE</span> notes <span class="k">SET</span> body = <span class="s">'hello, this row just grew longer than its old slot'</span> <span class="k">WHERE</span> id = 1;`);
  show(cmd, t5, { y: 14, d: 0.5 });
  keyed(r1.querySelector('span')).at(t5 + 0.9, { html: '<span class="c-mint">hello, this row just grew longer than its old slot</span>' });
  css(r1, { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '820px' });
  // 新的行内容：7 + 49 = 56 字节数据
  const nb = h('div', 'nbar', rb); css(nb, { left: '0px', top: '-112px' });
  const n1 = h('div', '', nb, dots(6) + 'h'); n1.style.width = 7 * U + 'px';
  const n2 = h('div', '', nb, 'ello, this row just grew longer than its old slot'); n2.style.width = 49 * U + 'px';
  const nlab = h('div', 'rlab', rb, '新的行 1 · 数据 56 字节'); css(nlab, { top: '-146px', left: '0px', color: 'var(--mint)' });
  const over = h('div', 'abs', rb); css(over, { left: 20 * U + 'px', top: '-118px', width: 36 * U + 'px', height: '52px', border: '2px dashed var(--red)', borderLeft: 'none', borderRadius: '0 7px 7px 0' });
  const olab = h('div', 'rlab c-red', rb, '超出 36 字节'); css(olab, { top: '-146px', left: (20 * U + 14) + 'px', color: 'var(--red)' });
  tl.to(labs, { autoAlpha: 0, duration: 0.3 }, t5 + 0.5);
  fromTo([nb, nlab], T('e5', '改长') , { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.6 });
  fromTo([over, olab], T('e5', '放不下') - 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  tl.fromTo(A0, { x: 0 }, { x: 5, duration: 0.07, yoyo: true, repeat: 5, immediateRender: false }, T('e5', '放不下'));

  // ── e6 拆成两段，用指针接起来 ──
  const t6 = T('e6', '放不下') - 0.2;
  hide([over, olab, nlab], t6, { y: 0, d: 0.3 });
  tl.to(A0, { autoAlpha: 0, duration: 0.4 }, t6 + 0.1);
  tl.to(A1, { autoAlpha: 1, duration: 0.4 }, t6 + 0.1);
  tl.to(n1, { x: 13 * U, y: 112 + (RH - 40) / 2, duration: 0.8, ease: 'power3.inOut' }, t6 + 0.15);
  tl.to(n1, { autoAlpha: 0, duration: 0.25 }, t6 + 0.95);
  const tD = T('e6', '写到') - 0.2;
  tl.to(n2, { x: (87 - 7) * U, y: 112 + (RH - 40) / 2, duration: 1.0, ease: 'power3.inOut' }, tD);
  tl.to(D, { autoAlpha: 1, duration: 0.4 }, tD + 0.7);
  tl.to(n2, { autoAlpha: 0, duration: 0.25 }, tD + 0.95);
  tl.to(ticks[3], { color: '#ffb347', duration: 0.3 }, tD + 0.7);
  tl.to(tickEnd, { autoAlpha: 1, duration: 0.3 }, tD + 0.9);
  // 指针：从第一段的头部指向 0x54
  const ax = RX + 6.5 * U, dx = RX + 84 * U + 4;
  const arc = path(ov, `M${ax},${RY - 6} C${ax + 120},${RY - 120} ${dx - 160},${RY - 120} ${dx},${RY - 8}`, 'orange', { w: 2.8 });
  arrowIn(arc, T('e6', '指针') - 0.2, 0.9);
  const plab = h('div', 'tag c-orange', root, '指针<small>→ 0x54</small>'); px(plab, RX + 38 * U, RY - 142);
  show(plab, T('e6', '指针') + 0.3, { y: 8, d: 0.4 });
  // ── e7 一行，两段 ──
  const t7 = T('e7') - 0.1;
  hide(cmd, t7 - 0.2, { y: 10, d: 0.3 });
  const f1 = h('div', 'rlab', rb, '行 1 · 第 1 段'); css(f1, { top: (RH + 40) + 'px', left: '0px', color: 'var(--orange-hi)', fontSize: '22px' });
  const f2 = h('div', 'rlab', rb, '行 1 · 第 2 段'); css(f2, { top: (RH + 40) + 'px', left: 84 * U + 'px', color: 'var(--orange-hi)', fontSize: '22px' });
  fromTo([f1, f2], T('e7', '两段') - 0.4, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.25 });
  tl.to([A1, D], { boxShadow: '0 0 0 2px rgba(242,145,17,.95), 0 0 40px rgba(242,145,17,.3)', duration: 0.4 }, T('e7', '两段') - 0.4);
  tl.to([B, C], { autoAlpha: 0.4, duration: 0.4 }, T('e7', '两段') - 0.4);

  // ── e8 / e9 碎片越来越多 → OPTIMIZE TABLE（示意）──
  const t8 = T('e8') - 0.2;
  hide([f1, f2], t8, { y: 0, d: 0.3 });
  const fr = h('div', 'frag', root);
  const cols = ['rgba(242,145,17,.75)', 'rgba(70,203,230,.55)', 'rgba(111,224,182,.5)', 'rgba(241,217,138,.5)', 'rgba(159,220,234,.28)'];
  // [行号, 起点, 宽度]（示意数据：同一行的几段散落在文件各处）
  const segs = [[0, 0, 70], [1, 76, 120], [2, 202, 60], [0, 268, 90], [3, 364, 150], [1, 520, 60], [4, 586, 110], [0, 702, 50], [2, 758, 140], [3, 904, 70], [0, 980, 130], [4, 1116, 90], [1, 1212, 160], [2, 1378, 80], [0, 1464, 168]];
  const fe = segs.map(([r, x, w]) => { const e = h('i', '', fr); css(e, { left: x + 'px', width: w + 'px', background: cols[r] }); return e; });
  const flab = h('div', 'tag dim', root, '多次更新之后<small>示意</small>'); px(flab, RX, 812);
  show(flab, t8, { y: 8, d: 0.4 });
  fromTo(fe, t8 + 0.1, { autoAlpha: 0, scaleY: 0.3 }, { autoAlpha: 1, scaleY: 1, duration: 0.35, stagger: 0.04 });
  // 橙色那一行的 5 段之间跳转
  const mine = segs.filter((x) => x[0] === 0);
  const hops = [];
  for (let i = 0; i + 1 < mine.length; i++) {
    const x1 = RX + mine[i][1] + mine[i][2] / 2, x2 = RX + mine[i + 1][1] + mine[i + 1][2] / 2;
    hops.push(path(ov, `M${x1},${732} C${x1 + 40},${732 - 50} ${x2 - 40},${732 - 50} ${x2},${732}`, 'orange', { w: 2.2 }));
  }
  hops.forEach((p, i) => arrowIn(p, T('e8', '读一行') - 0.1 + i * 0.32, 0.4));
  const hopLab = h('div', 'tag c-orange', root, '读这一行：跳转 4 次'); px(hopLab, RX + 1380, 812);
  show(hopLab, T('e8', '跳转') + 0.3, { y: 8, d: 0.4 });
  // e9 整理：同一行的段落排到一起
  const t9 = T('e9', '执行') - 0.2;
  const cmd9 = h('div', 'cmd5', root, '<span class="p">mysql&gt; </span><span class="k">OPTIMIZE TABLE</span> notes;'); css(cmd9, { top: '800px', left: (RX + 1072) + 'px', width: '560px' });
  show(cmd9, T('e9') - 0.1, { y: 12, d: 0.5 });
  hide(hopLab, T('e9') - 0.45, { y: 0, d: 0.3 });
  hide(hops, t9, { y: 0, d: 0.3 });
  const order = [0, 1, 2, 3, 4]; let cur = 0;
  order.forEach((r) => { segs.forEach(([rr, x, w], i) => { if (rr !== r) return; tl.to(fe[i], { x: cur - x, duration: 1.1, ease: 'power3.inOut' }, t9 + 0.35 + r * 0.06); cur += w + (segs.filter((q, j) => q[0] === r && j > i).length ? 0 : 8); }); });
  keyed(flab).at(t9 + 1.3, { html: '整理之后<small>每一行重新连续存放</small>' });
});
