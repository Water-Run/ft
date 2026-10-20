// 07 一次查询的全过程：users_big（十万行）里按主键找 id = 4242。
// 路径 根页 @175104 → 中间页 @3072 → 叶子页 @95232 → 行号 4241 → 偏移 67856，全部取自真实文件
scene('s7', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .q7 { position:absolute; left:96px; top:128px; height:60px; padding:0 24px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); font-family:var(--mono); font-size:25px; line-height:58px; white-space:pre; color:#cfe3e8; }
  .call { position:absolute; left:820px; top:128px; height:60px; display:flex; align-items:center; gap:12px; white-space:nowrap; }
  .call .pill { height:44px; font-size:20px; }
  .call .ar { color:var(--faint); font-family:var(--mono); font-size:22px; }
  .ctr { position:absolute; right:96px; top:124px; display:flex; gap:34px; }
  .ctr div { text-align:center; }
  .ctr b { display:block; font-family:var(--mono); font-size:46px; font-weight:500; line-height:1; color:var(--text); }
  .ctr span { font-size:18px; letter-spacing:.14em; color:var(--dim); }
  .insp7 { position:absolute; left:96px; top:520px; width:1728px; height:250px; }
  .st7 { position:absolute; inset:0; }
  .st7-t { font-size:24px; letter-spacing:.08em; color:var(--dim); display:flex; align-items:baseline; gap:16px; white-space:nowrap; }
  .st7-t b { font-family:var(--mono); font-weight:500; color:var(--pale); font-size:24px; letter-spacing:0; }
  .st7-t i { font-style:normal; margin-left:auto; color:var(--faint); font-size:20px; }
  .ks { margin-top:18px; display:flex; gap:5px; align-items:center; }
  .ks span { font-family:var(--mono); font-size:21px; height:50px; min-width:80px; padding:0 6px; display:flex; align-items:center; justify-content:center; border-radius:6px; background:rgba(8,44,56,.8); box-shadow:0 0 0 1px var(--line-2); color:var(--pale); flex:none; }
  .ks span.el { min-width:44px; background:none; box-shadow:none; color:var(--faint); }
  .ks span.cp { min-width:16px; width:16px; padding:0; height:62px; border-radius:4px; background:rgba(242,145,17,.12); box-shadow:0 0 0 1px rgba(242,145,17,.5); }
  .why { margin-top:22px; font-size:25px; letter-spacing:.06em; color:var(--dim); white-space:nowrap; }
  .why b { font-family:var(--mono); font-weight:500; color:var(--text); letter-spacing:0; }
  .why em { font-style:normal; color:var(--orange-hi); }
  .ent { margin-top:20px; display:flex; align-items:center; gap:16px; }
  .ent .cells { display:flex; gap:3px; }
  .ent .cells span { font-family:var(--mono); font-size:25px; width:44px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:5px; }
  .ent .lb { font-size:23px; letter-spacing:.06em; white-space:nowrap; }
  .ent .lb b { font-family:var(--mono); font-weight:500; font-size:28px; }
  .dz { position:absolute; left:96px; top:520px; width:1728px; height:330px; }
  .fm7 { font-family:var(--mono); font-size:44px; display:flex; align-items:center; gap:20px; white-space:nowrap; }
  .fm7 .zh { font-family:var(--sans); font-size:26px; letter-spacing:.08em; color:var(--dim); }
  .fm7 .op { color:var(--faint); }
  .mydr { position:absolute; left:0; top:92px; width:1728px; height:44px; border-radius:6px; background:rgba(111,224,182,.10); box-shadow:0 0 0 1px rgba(111,224,182,.4); }
  .mydr-l { position:absolute; left:0; top:60px; font-family:var(--mono); font-size:19px; color:var(--dim); }
  .mydr-r { position:absolute; right:0; top:60px; font-family:var(--mono); font-size:19px; color:var(--faint); }
  .mk { position:absolute; top:84px; width:3px; height:60px; background:var(--orange); box-shadow:0 0 20px rgba(242,145,17,.9); }
  .mk::after { content:"67856"; position:absolute; left:10px; top:66px; font-family:var(--mono); font-size:19px; color:var(--orange-hi); }
  .rowb { position:absolute; left:0; top:186px; display:flex; align-items:center; gap:26px; }
  .rowb .cells { display:flex; gap:3px; }
  .rowb .cells span { font-family:var(--mono); font-size:25px; width:44px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:5px; }
  .res7 { font-family:var(--mono); font-size:22px; line-height:1.42; white-space:pre; color:#cfe3e8; padding:12px 22px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); }
  .cache { position:absolute; top:540px; height:290px; border-radius:16px; border:1px solid var(--line-2); background:linear-gradient(180deg, rgba(11,52,66,.62), rgba(6,34,44,.62)); padding:26px 30px; }
  .cache h4 { font-size:28px; font-weight:500; letter-spacing:.12em; }
  .cache h4 small { font-family:var(--mono); font-size:19px; letter-spacing:.04em; color:var(--faint); margin-left:14px; font-weight:400; }
  .cache p { margin-top:10px; font-size:22px; letter-spacing:.06em; color:var(--dim); }
  .cache .slots { display:flex; gap:12px; margin-top:26px; }
  .cache .slots span { height:54px; padding:0 18px; border-radius:8px; font-family:var(--mono); font-size:20px; display:flex; align-items:center; white-space:nowrap; }
  .pgchip { background:rgba(8,44,56,.9); box-shadow:0 0 0 1.5px var(--blue-hi); color:var(--pale); }
  .oschip { background:rgba(111,224,182,.12); box-shadow:0 0 0 1.5px rgba(111,224,182,.6); color:var(--mint); }
  `;
  root.appendChild(st);
  const big = REAL.big;
  const ov = overlay(root);

  // ── 顶部：查询、调用、计数 ──
  const q = h('div', 'q7', root);
  typeText(q, '<span class="c-cyan">SELECT</span> * <span class="c-cyan">FROM</span> users_big <span class="c-cyan">WHERE</span> <span class="c-orange">id = 4242</span>;', T('g1') - 0.1, 26, { cursorUntil: T('g2') });
  show(q, c0 + 0.1, { y: 14, d: 0.6 });
  const call = h('div', 'call', root, '<span class="pill" style="font-family:var(--sans)">SQL 层</span><span class="ar">→</span><span class="pill">index_read_map()</span><span class="ar">→</span><span class="pill" style="border-color:rgba(242,145,17,.7);color:var(--orange-hi)">MyISAM · mi_rkey()</span>');
  fromTo([...call.children], T('g3') - 0.1, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.22 });
  const ctr = h('div', 'ctr', root, '<div><b id="cp">0</b><span>读页</span></div><div><b id="cr">0</b><span>读行</span></div>');
  const cp = keyed(ctr.querySelector('#cp')), cr = keyed(ctr.querySelector('#cr'));
  show(ctr, T('g4') - 0.3, { y: 0, d: 0.5 });
  const bump = (kf, el, n, t) => { sfx('pop', t, { g: 0.8, p: 0.6 }); kf.at(t, { html: String(n) }); tl.fromTo(el, { scale: 1.5, color: '#ffb347' }, { scale: 1, color: '#e9f2f4', duration: 0.6, immediateRender: false }, t); };

  // ── 树 ──
  const tw = h('div', 'abs', root); css(tw, { left: 0, top: 0, width: '1920px', height: '1080px' });
  const X0 = 270, PITCH = 74, YR = 222, YN = 356, YL = 418;
  const { rootN, mids, leaves, edges } = bigTree(tw, ov, { X0, PITCH, YR, YN, YL });
  rootN.innerHTML = '<span>根页 @175104</span>';
  const tTree = T('g2') - 0.5;
  fromTo(rootN, tTree, { autoAlpha: 0, y: -12 }, { autoAlpha: 0.55, y: 0, duration: 0.5 });
  fromTo(edges, tTree + 0.15, { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.3, stagger: 0.02 });
  fromTo(mids, tTree + 0.25, { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.3, stagger: 0.02 });
  fromTo(leaves, tTree + 0.45, { autoAlpha: 0 }, { autoAlpha: 0.4, duration: 0.3, stagger: 0.02 });
  const tbl = h('div', 'tag dim', tw, 'users_big.MYI · PRIMARY<small>100,000 个键 · 3 层</small>'); px(tbl, 96, YR + 8);
  css(tbl, { fontSize: '20px' });
  show(tbl, T('g2', '十万') - 0.2, { y: 0, x: -10, d: 0.5 });
  const hot = 'rgba(242,145,17,.95)';
  const leafDots = leaves[0].children; const hit = leafDots[41];

  // ── 页内容检视区 ──
  const insp = h('div', 'insp7', root);
  const stage = (title, sub) => { const e = h('div', 'st7', insp); h('div', 'st7-t', e, title + `<i>${sub}</i>`); gsap.set(e, { autoAlpha: 0, y: 14 }); return e; };
  const sw = (e, t0, t1) => { tl.to(e, { autoAlpha: 1, y: 0, duration: 0.45 }, t0); if (t1) tl.to(e, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power2.in' }, t1); };
  const cells = (e, arr) => { const k = h('div', 'ks', e); return arr.map((v) => h('span', v === '…' ? 'el' : (v === '|' ? 'cp' : ''), k, v === '|' ? '' : String(v))); };

  // ① 根页：20 个键，二分
  const s1 = stage('读入 <b>根页 @175104</b>', '20 个键 · 有序');
  const rk = big.root.keys.map((k) => k[0]);
  const c1 = cells(s1, ['|', ...rk]);
  c1.slice(1).forEach((c) => { c.style.minWidth = '70px'; c.style.fontSize = '19px'; });
  const why1 = h('div', 'why', s1, '');
  const t4 = T('g4', '读入') - 0.2;
  tl.to(rootN, { autoAlpha: 1, boxShadow: `0 0 0 2px ${hot}, 0 0 40px rgba(242,145,17,.45)`, color: '#ffb347', duration: 0.4 }, T('g4', '根页') - 0.2);
  const hk = h('div', 'tag c-orange mono', tw, 'key_root[0] = 175104'); px(hk, 1200, YR + 10); css(hk, { fontSize: '21px' });
  show(hk, T('g4', '文件头') - 0.1, { x: 14, y: 0, d: 0.5 });
  sw(s1, t4, T('g6') - 0.35);
  bump(cp, ctr.querySelector('#cp'), 1, t4 + 0.1);
  // 二分探测：与 _mi_bin_search 的取中方式一致，依次比较下标 9 → 4 → 2 → 1 → 0（都不小于 4242）→ 最左侧的子页
  const tb = T('g5', '二分') - 0.25;
  const probes = [9, 4, 2, 1, 0];
  const kw = keyed(why1);
  probes.forEach((p, i) => {
    const t = tb + i * 0.42;
    const el = c1[p + 1];
    tl.to(el, { backgroundColor: 'rgba(70,203,230,.3)', boxShadow: '0 0 0 2px #46cbe6', duration: 0.15 }, t);
    tl.to(el, { backgroundColor: 'rgba(8,44,56,.8)', boxShadow: '0 0 0 1px rgba(127,211,230,.3)', duration: 0.3 }, t + 0.36);
    tl.to(c1.slice(p + 2, (i ? probes[i - 1] + 1 : 21) + 1), { opacity: 0.25, duration: 0.25 }, t + 0.3);
    kw.at(t, { html: `<b>4242</b> &lt; <b>${rk[p].toLocaleString('en-US').replace(/,/g, '')}</b>　向左` });
  });
  const tCh = Math.max(T('g5', '确定') + 0.3, tb + probes.length * 0.42 + 0.1);
  kw.at(tCh, { html: '<b>4242</b> 比第一个键 <b>4692</b> 还小　→　<em>走最左边的子页 @3072</em>' });
  tl.to(c1[0], { backgroundColor: 'rgba(242,145,17,.6)', boxShadow: '0 0 0 2px #f29111, 0 0 24px rgba(242,145,17,.6)', duration: 0.3 }, tCh);

  // ② 中间页 @3072
  const s2 = stage('读入 <b>中间页 @3072</b>', '45 个键');
  const nk = big.node.keys.map((k) => k[0]);
  const c2 = cells(s2, [nk[0], nk[1], '…', nk[38], nk[39], nk[40], '|', nk[41], nk[42], nk[43], nk[44]]);
  h('div', 'why', s2, '<b>4182</b> &lt; <b>4242</b> &lt; <b>4284</b>　→　<em>两个键之间的子页 @95232</em>');
  const t6 = T('g6') - 0.3;
  tl.to(edges[0], { stroke: '#f29111', strokeWidth: 2.6, autoAlpha: 1, duration: 0.4 }, t6);
  tl.to(mids[0], { autoAlpha: 1, boxShadow: `0 0 0 2px ${hot}, 0 0 30px rgba(242,145,17,.5)`, duration: 0.4 }, t6 + 0.2);
  sw(s2, t6 + 0.1, T('g6', '叶子') - 0.45);
  bump(cp, ctr.querySelector('#cp'), 2, t6 + 0.3);
  tl.to([c2[5], c2[7]], { boxShadow: '0 0 0 2px #46cbe6', backgroundColor: 'rgba(70,203,230,.25)', duration: 0.3 }, t6 + 0.8);
  tl.to(c2[6], { backgroundColor: 'rgba(242,145,17,.6)', boxShadow: '0 0 0 2px #f29111, 0 0 24px rgba(242,145,17,.6)', duration: 0.3 }, t6 + 1.1);

  // ③ 叶子页 @95232：命中
  const s3 = stage('读入 <b>叶子页 @95232</b>', '101 个键：4183 … 4283');
  const c3 = cells(s3, [4183, '…', 4239, 4240, 4241, 4242, 4243, 4244, 4245, '…', 4283]);
  const ent = h('div', 'ent', s3);
  ent.innerHTML = `<span class="lb dim">这一项的 10 个字节</span><div class="cells">${['00', '00', '10', '92'].map((x) => `<span class="f-id">${x}</span>`).join('')}</div><span class="lb c-cyan">键 <b>4242</b></span>` +
    `<div class="cells" style="margin-left:26px">${['00', '00', '00', '00', '10', '91'].map((x) => `<span class="f-ptr">${x}</span>`).join('')}</div><span class="lb c-orange">行号 <b>4241</b></span>`;
  const t6b = T('g6', '叶子') - 0.35;
  const lb = box(leaves[0]);
  const hx = lb.x + (41 % 8) * 9 + 3, hy = lb.y + Math.floor(41 / 8) * 9 + 3;
  const down = path(ov, `M${X0 + (PITCH - 10) / 2},${YN + 28} L${hx},${hy - 6}`, 'orange', { w: 2.2, arrow: false });
  arrowIn(down, t6b, 0.35);
  tl.to(leaves[0], { autoAlpha: 1, duration: 0.3 }, t6b);
  tl.to(hit, { backgroundColor: '#f29111', scale: 2.2, boxShadow: '0 0 16px rgba(242,145,17,1)', duration: 0.4, ease: 'back.out(3)' }, t6b + 0.25);
  sw(s3, t6b + 0.1, T('g8') - 0.4);
  bump(cp, ctr.querySelector('#cp'), 3, t6b + 0.3);
  gsap.set(ent.children, { autoAlpha: 0 });
  sfx('chime', T('g6', '找到') - 0.05);
  tl.to(c3[5], { backgroundColor: 'rgba(242,145,17,.4)', boxShadow: '0 0 0 2px #f29111, 0 0 24px rgba(242,145,17,.6)', color: '#fff', duration: 0.3 }, T('g6', '找到') - 0.05);
  tl.to([ent.children[0], ent.children[1], ent.children[2]], { autoAlpha: 1, duration: 0.35, stagger: 0.12 }, T('g6', '找到') + 0.3);
  tl.to([ent.children[3], ent.children[4]], { autoAlpha: 1, duration: 0.35, stagger: 0.15 }, T('g7', '行号') - 0.5);
  tl.fromTo(ent.children[4], { scale: 1 }, { scale: 1.18, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false, transformOrigin: '0% 50%' }, T('g7', '行号') + 0.2);

  // ── g8 / g9：行号 → 偏移 → 16 字节 → 列值 ──
  const dz = h('div', 'dz', root);
  const fm = h('div', 'fm7', dz, '<span class="zh">偏移</span><span class="op">=</span><span class="c-orange">4241</span><span class="op">×</span><span>16</span><span class="op">=</span><span class="c-orange" id="off">67,856</span><span class="zh" style="margin-left:26px">users_big.MYD 内的字节位置</span>');
  const t8 = T('g8') - 0.3;
  fromTo([...fm.children].slice(0, 5), T('g8', '行号') - 0.2, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.1 });
  fromTo([...fm.children].slice(5), T('g8', '就是') - 0.1, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.12 });
  const rbar = h('div', 'mydr', dz), rl = h('div', 'mydr-l', dz, 'users_big.MYD'), rr = h('div', 'mydr-r', dz, '1,600,000 字节');
  const mk = h('div', 'mk', dz); mk.style.left = (1728 * big.rowOffset / big.dataFileLength).toFixed(1) + 'px';
  fromTo([rbar, rl, rr], T('g8', '数据文件') - 0.5, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  fromTo(rbar, T('g8', '数据文件') - 0.5, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.8, ease: 'power3.out' });
  fromTo(mk, T('g8', '偏移') - 0.2, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.4, ease: 'back.out(2)' });
  // 读出的 16 字节（真实）
  const rowHex = big.row4242.match(/../g);
  const rowb = h('div', 'rowb', dz);
  const rc = h('div', 'cells', rowb, rowHex.map((x, i) => `<span class="f-${fieldOf(i)}">${x}</span>`).join(''));
  const arr = h('span', 'iarrow', rowb, '→'); css(arr, { fontFamily: 'var(--mono)', fontSize: '30px', color: 'var(--faint)' });
  const res = h('div', 'res7', rowb, asciiTable(['id', 'name', 'age'], [[4242, 'u592299', 60]], [1, 0, 1]).map(esc).join('\n') + '\n<span class="o">1 row in set (0.00 sec)</span>');
  const t9 = T('g9', '读出') - 0.25;
  fromTo([...rc.children], t9, { autoAlpha: 0, y: -18 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.035 });
  bump(cr, ctr.querySelector('#cr'), 1, t9 + 0.3);
  fromTo([arr, res], T('g9', '解码') - 0.15, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.15 });
  // g10：三次读页，一次读行
  tl.fromTo(ctr.children[0], { scale: 1 }, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, T('g10', '三次'));
  tl.fromTo(ctr.children[1], { scale: 1 }, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, T('g10', '一次读行') - 0.1);

  // ── g11 / g12：缓存 ──
  const t11 = T('g11') - 0.35;
  hide([dz], t11, { y: -14, d: 0.4 });
  const kc = h('div', 'cache', root, '<h4>键缓存<small>key_buffer_size</small></h4><p>MyISAM 自己管理，只缓存索引页</p><div class="slots"><span class="pgchip">根页 @175104</span><span class="pgchip">中间页 @3072</span><span class="pgchip">叶子页 @95232</span></div>');
  px(kc, 96, 540, 860);
  const oc = h('div', 'cache', root, '<h4>操作系统页缓存</h4><p>.MYD 没有自己的缓存，读写直接经过文件系统</p><div class="slots"><span class="oschip">users_big.MYD · 偏移 67856 附近</span></div>');
  px(oc, 986, 540, 838);
  show(kc, t11 + 0.3, { y: 24, d: 0.6 });
  fromTo([...kc.querySelectorAll('.slots span')], T('g11', '留在') - 0.2, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.16, ease: 'power3.out' });
  show(oc, T('g12') - 0.2, { y: 24, d: 0.6 });
  fromTo([...oc.querySelectorAll('.slots span')], T('g12', '操作系统') - 0.1, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.5 });
});
