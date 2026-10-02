// 01 引擎的位置：SQL 层 / handler 接口 / 存储引擎层
scene('s1', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .ly { position:absolute; left:400px; width:1120px; border-radius:18px; border:1px solid var(--line-2); background:linear-gradient(180deg, rgba(11,52,66,.62), rgba(6,34,44,.62)); box-shadow:0 30px 80px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.05) inset; }
  .ly-t { position:absolute; left:34px; top:24px; display:flex; align-items:baseline; gap:18px; }
  .ly-t b { font-size:30px; font-weight:500; letter-spacing:.12em; }
  .ly-t span { font-family:var(--mono); font-size:18px; letter-spacing:.16em; color:var(--faint); }
  .ly-side { position:absolute; left:214px; width:150px; text-align:right; font-size:26px; letter-spacing:.2em; color:var(--dim); }
  .ly-side small { display:block; margin-top:8px; font-family:var(--mono); font-size:16px; letter-spacing:.14em; color:var(--faint); }
  .bx { position:absolute; height:96px; border-radius:12px; border:1px solid var(--line); background:rgba(4,22,29,.55); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; }
  .bx b { font-size:27px; font-weight:500; letter-spacing:.14em; }
  .bx span { font-family:var(--mono); font-size:16px; letter-spacing:.12em; color:var(--faint); }
  .eg { position:absolute; width:188px; height:108px; border-radius:12px; border:1px solid var(--line); background:rgba(4,22,29,.6); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
  .eg b { font-family:var(--mono); font-size:25px; font-weight:500; color:var(--pale); }
  .eg span { font-size:17px; letter-spacing:.06em; color:var(--dim); font-family:var(--mono); }
  .eg .bad { position:absolute; right:-10px; top:-14px; height:28px; padding:0 11px; border-radius:6px; background:var(--orange); color:#1a0f00; font-family:var(--mono); font-size:15px; font-weight:700; letter-spacing:.1em; display:flex; align-items:center; }
  .ifc { position:absolute; left:400px; width:1120px; height:74px; }
  .ifc-line { position:absolute; left:0; right:0; top:36px; height:2px; background:linear-gradient(90deg, transparent, var(--orange) 12%, var(--orange) 88%, transparent); box-shadow:0 0 22px rgba(242,145,17,.7); }
  .ifc-name { position:absolute; left:34px; top:14px; height:46px; padding:0 20px; border-radius:23px; background:#08252f; border:1px solid rgba(242,145,17,.6); display:flex; align-items:center; gap:12px; font-size:22px; letter-spacing:.12em; }
  .ifc-name b { font-family:var(--mono); font-weight:600; color:var(--orange); letter-spacing:.02em; }
  .ifc-ms { position:absolute; left:290px; top:14px; display:flex; gap:14px; }
  .ifc-m { height:46px; padding:0 15px; border-radius:8px; background:#08252f; border:1px solid var(--line-2); font-family:var(--mono); font-size:20px; color:var(--pale); display:flex; align-items:center; white-space:nowrap; }
  .cli { position:absolute; left:50%; top:96px; transform:translateX(-50%); height:50px; padding:0 26px; border-radius:10px; background:rgba(2,14,19,.92); border:1px solid var(--line); font-family:var(--mono); font-size:22px; display:flex; align-items:center; white-space:nowrap; color:#cfe3e8; }
  .disk { position:absolute; left:400px; width:1120px; top:806px; height:64px; display:flex; align-items:center; justify-content:center; gap:14px; }
  .disk i { width:52px; height:8px; border-radius:2px; background:var(--sea-4); display:block; }
  .disk span { font-size:22px; letter-spacing:.3em; color:var(--dim); margin:0 26px; }
  `;
  root.appendChild(st);

  const Y1 = 176, H1 = 208, YI = 398, Y2 = 486, H2 = 232;
  // 客户端
  const cli = h('div', 'cli', root, '<span class="c-orange">mysql&gt;&nbsp;</span><span class="c-cyan">SELECT</span>&nbsp;*&nbsp;<span class="c-cyan">FROM</span>&nbsp;users&nbsp;<span class="c-cyan">WHERE</span>&nbsp;id = 5;');

  // 上层
  const up = h('div', 'ly', root); px(up, 400, Y1, 1120, H1);
  h('div', 'ly-t', up, '<b>SQL 层</b><span>SERVER</span>');
  const sideUp = h('div', 'ly-side', root, '上层<small>理解 SQL</small>'); px(sideUp, 214, Y1 + 70);
  const boxes = [['解析器', 'PARSER'], ['优化器', 'OPTIMIZER'], ['执行器', 'EXECUTOR']].map(([a, b], i) => {
    const e = h('div', 'bx', up, `<b>${a}</b><span>${b}</span>`); px(e, 50 + i * 350, 86, 320); return e;
  });

  // 下层
  const dn = h('div', 'ly', root); px(dn, 400, Y2, 1120, H2);
  const dnT = h('div', 'ly-t', dn, '<b>存储引擎层</b><span>STORAGE ENGINES</span>');
  const sideDn = h('div', 'ly-side', root, '下层<small>存取数据</small>'); px(sideDn, 214, Y2 + 82);
  const engines = [['MyISAM', '.MYD + .MYI'], ['InnoDB', '表空间 ibdata'], ['MEMORY', '内存'], ['CSV', '.CSV 文本'], ['ARCHIVE', '.ARZ 压缩']].map(([a, b], i) => {
    const e = h('div', 'eg', dn, `<b>${a}</b><span>${b}</span>`); px(e, 50 + i * 208, 92); return e;
  });
  const badge = h('div', 'bad', engines[0], 'DEFAULT');

  // 接口
  const ifc = h('div', 'ifc', root); px(ifc, 400, YI);
  const iline = h('div', 'ifc-line', ifc);
  const iname = h('div', 'ifc-name', ifc, '<b>handler</b>接口');
  const msBox = h('div', 'ifc-ms', ifc);
  const ms = ['write_row()', 'rnd_next()', 'index_read_map()', 'update_row()', 'delete_row()'].map((m) => h('div', 'ifc-m', msBox, m));
  css(ms[3], { color: 'var(--faint)' }); css(ms[4], { color: 'var(--faint)' });

  // 磁盘
  const disk = h('div', 'disk', root, '<i></i><i></i><i></i><i></i><span>磁盘</span><i></i><i></i><i></i><i></i>');

  const ov = overlay(root);
  const a0 = path(ov, `M960,150 L960,${Y1 - 4}`, 'pale', { w: 2 });
  const a1 = path(ov, `M770,${Y1 + 134} L${750 + 44},${Y1 + 134}`, 'dim', { w: 2 });
  const a2 = path(ov, `M1120,${Y1 + 134} L${1100 + 44},${Y1 + 134}`, 'dim', { w: 2 });
  const aW = path(ov, `M920,${Y2 + H2 + 6} L920,804`, 'orange', { w: 2.4 });
  const aR = path(ov, `M1000,804 L1000,${Y2 + H2 + 6}`, 'cyan', { w: 2.4 });
  const lw = h('div', 'tag c-orange', root, '写'); px(lw, 876, 744);
  const lr = h('div', 'tag c-cyan', root, '读'); px(lr, 1016, 744);

  // ── a1 两层 ──
  show(up, T('a1', '两层') - 0.5, { y: -30, d: 0.9 });
  show(dn, T('a1', '两层') - 0.25, { y: 30, d: 0.9 });
  show(sideUp, T('a1', '两层') - 0.1, { x: -20, y: 0 });
  show(sideDn, T('a1', '两层') + 0.1, { x: -20, y: 0 });
  // ── a2 上层：解析 → 选择执行计划 ──
  show(cli, T('a2') - 0.3, { y: -16 });
  arrowIn(a0, T('a2') + 0.1, 0.5);
  show(boxes, T('a2') + 0.2, { y: 14, stagger: 0.12, d: 0.6 });
  const lit = (e, t, d = 1.1) => {
    tl.to(e, { borderColor: 'rgba(70,203,230,.95)', backgroundColor: 'rgba(0,117,143,.34)', boxShadow: '0 0 34px rgba(25,169,201,.45)', duration: 0.35 }, t);
    tl.to(e, { borderColor: 'rgba(127,211,230,.16)', backgroundColor: 'rgba(4,22,29,.55)', boxShadow: '0 0 0px rgba(25,169,201,0)', duration: 0.6 }, t + d);
  };
  lit(boxes[0], T('a2', '解析'), 1.0);
  arrowIn(a1, T('a2', '解析') + 0.5, 0.4);
  lit(boxes[1], T('a2', '选择'), 1.2);
  arrowIn(a2, T('a2', '选择') + 0.8, 0.4);
  lit(boxes[2], T('a2', '选择') + 1.0, 0.9);
  // ── a3 下层：写进磁盘，再读出来 ──
  show(disk, T('a3') - 0.1, { y: 16 });
  tl.to(dn, { borderColor: 'rgba(242,145,17,.7)', boxShadow: '0 30px 80px rgba(0,0,0,.4), 0 0 60px rgba(242,145,17,.16)', duration: 0.6 }, T('a3'));
  arrowIn(aW, T('a3', '写进') - 0.1, 0.6); show(lw, T('a3', '写进'), { y: 0, d: 0.4 });
  arrowIn(aR, T('a3', '读出') - 0.1, 0.6); show(lr, T('a3', '读出'), { y: 0, d: 0.4 });
  // ── a4 存储引擎 ──
  tl.to(dnT.querySelector('b'), { color: '#ffb347', duration: 0.4 }, T('a4', '存储'));
  tl.fromTo(dnT, { scale: 1 }, { scale: 1.12, transformOrigin: '0% 50%', duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.inOut', immediateRender: false }, T('a4', '存储'));
  // ── a5 / a6 接口 ──
  fromTo(iline, T('a5', '之间') - 0.2, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.inOut' });
  show(iname, T('a5', '固定') - 0.2, { y: 0, s: 0.9, d: 0.5 });
  show(ms[0], T('a6', '写入') - 0.1, { y: 12, d: 0.45 });
  show(ms[1], T('a6', '读下') - 0.1, { y: 12, d: 0.45 });
  show(ms[2], T('a6', '按索引') - 0.1, { y: 12, d: 0.45 });
  show([ms[3], ms[4]], Tend('a6') + 0.05, { y: 12, d: 0.45, stagger: 0.12 });
  // ── a7 引擎可以替换 ──
  tl.to(dn, { borderColor: 'rgba(127,211,230,.30)', boxShadow: '0 30px 80px rgba(0,0,0,.4), 0 0 0px rgba(242,145,17,0)', duration: 0.6 }, T('a7') - 0.3);
  show(engines, T('a7') - 0.25, { y: 18, stagger: 0.1, d: 0.55 });
  engines.forEach((e) => { gsap.set(e.querySelector('span'), { autoAlpha: 0 }); });
  gsap.set(badge, { autoAlpha: 0 });
  // 一个高亮框依次扫过各引擎：谁都可以插在接口下面
  const tSw = T('a7', '只要');
  engines.forEach((e, i) => {
    const t = tSw + i * 0.34;
    tl.to(e, { borderColor: 'rgba(242,145,17,.95)', y: -8, duration: 0.2, ease: 'power2.out' }, t);
    tl.to(e, { borderColor: 'rgba(127,211,230,.16)', y: 0, duration: 0.35, ease: 'power2.inOut' }, t + 0.3);
  });
  // ── a8 各自的存放方式 ──
  tl.to(engines.map((e) => e.querySelector('span')), { autoAlpha: 1, duration: 0.5, stagger: 0.12 }, T('a8', '数据') - 0.2);
  // ── a9 默认引擎 ──
  const t9 = T('a9', '默认') - 0.1;
  tl.to(engines.slice(1), { autoAlpha: 0.32, duration: 0.6 }, t9);
  tl.to(engines[0], { borderColor: 'rgba(242,145,17,.95)', backgroundColor: 'rgba(242,145,17,.12)', boxShadow: '0 0 50px rgba(242,145,17,.35)', scale: 1.08, duration: 0.6, ease: 'back.out(2)' }, t9);
  tl.to(engines[0].querySelector('b'), { color: '#ffb347', duration: 0.4 }, t9);
  tl.fromTo(badge, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2.4)', immediateRender: false }, T('a9', '默认') + 0.25);
});
