// 02 一张表，三个文件
scene('s2', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .tree { font-family:var(--mono); font-size:27px; line-height:1.9; white-space:pre; color:var(--dim); padding:26px 34px; }
  .tree b { font-weight:500; color:var(--text); }
  .tree .sz { color:var(--faint); }
  .tree .ex1 { color:var(--pale); } .tree .ex2 { color:var(--mint); } .tree .ex3 { color:var(--orange-hi); }
  .fc { position:absolute; top:206px; width:470px; height:520px; border-radius:18px; border:1px solid var(--line-2); background:linear-gradient(180deg, rgba(11,52,66,.72), rgba(5,28,37,.8)); box-shadow:0 34px 90px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.05) inset; padding:34px 38px; }
  .fc-ext { font-family:var(--mono); font-size:64px; font-weight:600; letter-spacing:-.01em; line-height:1; }
  .fc-name { margin-top:14px; font-family:var(--mono); font-size:22px; color:var(--faint); letter-spacing:.04em; }
  .fc-name b { color:var(--dim); font-weight:400; }
  .fc-what { margin-top:30px; font-size:34px; font-weight:500; letter-spacing:.14em; }
  .fc-en { margin-top:8px; font-family:var(--mono); font-size:19px; letter-spacing:.1em; color:var(--faint); }
  .fc-en u { text-decoration:none; color:var(--pale); }
  .fc-vis { position:absolute; left:38px; right:38px; bottom:84px; height:150px; }
  .fc-own { position:absolute; left:38px; bottom:30px; height:34px; padding:0 14px; border-radius:6px; font-size:18px; letter-spacing:.12em; display:flex; align-items:center; border:1px solid var(--line-2); color:var(--dim); }
  .fc-own.my { border-color:rgba(242,145,17,.7); color:var(--orange-hi); font-family:var(--mono); letter-spacing:.06em; }
  .fc-sz { position:absolute; right:38px; bottom:34px; font-family:var(--mono); font-size:19px; color:var(--faint); }
  .sch { font-family:var(--mono); font-size:22px; line-height:1.75; color:var(--dim); white-space:pre; }
  .sch b { font-weight:400; color:var(--pale); }
  .mini-row { display:flex; gap:3px; margin-bottom:5px; }
  .mini-row i { width:20px; height:13px; border-radius:2px; display:block; }
  .rule { position:absolute; left:0; right:0; top:800px; text-align:center; font-size:34px; letter-spacing:.14em; color:var(--text); }
  .rule b { color:var(--orange-hi); font-weight:500; }
  .mybr { position:absolute; top:748px; height:16px; border:2px solid var(--orange); border-top:none; border-radius:0 0 10px 10px; }
  `;
  root.appendChild(st);

  // ── 左：建表与写入（真实语句与回显）──
  const term = terminal(root, { x: 110, y: 138, w: 1010, h: 690, title: 'mysql', right: 'myisam_demo', fs: 24, lh: 1.56 });
  const create = [
    '<span class="k">CREATE TABLE</span> users (',
    '  id   <span class="k">INT</span>      NOT NULL,',
    '  name <span class="k">CHAR</span>(10) NOT NULL,',
    '  age  <span class="k">TINYINT</span>  NOT NULL,',
    '  <span class="k">PRIMARY KEY</span> (id),',
    '  <span class="k">KEY</span> idx_name (name)',
    ') <span class="c-orange">ENGINE=MyISAM</span>;',
  ];
  let t = c0 + 0.2;
  create.forEach((ln, i) => {
    const r = term.cmd(ln, t, 120, { prompt: i === 0 ? 'mysql&gt;' : '    -&gt;', appearAt: t - 0.05, hold: 0.02 });
    t = r.end + 0.04;
  });
  const ok1 = term.out(['Query OK, 0 rows affected (0.14 sec)', ''], t + 0.1);
  const tIns = Math.max(t + 0.45, T('b1', '写入') - 1.0);
  const r2 = term.cmd("<span class=\"k\">INSERT INTO</span> users <span class=\"k\">VALUES</span>", tIns, 90, { appearAt: tIns - 0.05, hold: 0.02 });
  const r3 = term.cmd("(1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),", r2.end + 0.04, 150, { prompt: '    -&gt;', appearAt: r2.end, hold: 0.02 });
  const r4 = term.cmd("(5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36);", r3.end + 0.04, 150, { prompt: '    -&gt;', appearAt: r3.end, hold: 0.3 });
  term.out(['Query OK, <span class="ok">8 rows</span> affected (0.00 sec)', 'Records: 8  Duplicates: 0  Warnings: 0'], r4.end + 0.15);
  show(term.el, c0, { x: -30, y: 0, d: 0.8 });

  // ── 右：数据目录 ──
  const dir = h('div', 'panel', root); px(dir, 1170, 138, 640, 470);
  h('div', 'panel-hd', dir, '<span>数据目录</span><span class="r">datadir</span>');
  const tree = h('div', 'tree', dir);
  const lines = [
    'data/',
    '└─ <b>myisam_demo/</b>',
    '   ├─ <b>users<span class="ex1">.frm</span></b>   <span class="sz">8,614 字节</span>',
    '   ├─ <b>users<span class="ex2">.MYD</span></b>   <span class="sz">  128 字节</span>',
    '   └─ <b>users<span class="ex3">.MYI</span></b>   <span class="sz">3,072 字节</span>',
  ].map((x) => h('div', '', tree, x));
  show(dir, T('b2') - 0.5, { x: 30, y: 0, d: 0.8 });
  fromTo(lines.slice(0, 2), T('b2') - 0.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.12 });
  fromTo(lines.slice(2), T('b2', '三个') - 0.25, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.22 });
  const note = h('div', 'note abs', root, '一个数据库是一个目录<br>一张表是目录里的一组同名文件'); px(note, 1204, 640);
  show(note, T('b2', '同名') + 0.1, { y: 12 });

  // ── 三张文件卡 ──
  const tCards = T('b3') - 0.75;
  hide([term.el, dir, note], tCards, { y: -30, d: 0.5, stagger: 0.05 });
  const mk = (x, ext, col, what, en, own, my, size) => {
    const c = h('div', 'fc', root); c.style.left = x + 'px';
    h('div', 'fc-ext', c, ext).style.color = col;
    h('div', 'fc-name', c, `users<b>${ext}</b>`);
    h('div', 'fc-what', c, what);
    h('div', 'fc-en', c, en);
    const vis = h('div', 'fc-vis', c);
    h('div', 'fc-own' + (my ? ' my' : ''), c, own);
    h('div', 'fc-sz', c, size);
    return { c, vis };
  };
  const frm = mk(170, '.frm', 'var(--pale)', '表结构', 'FORMAT', '由 SQL 层维护', false, '8,614 B');
  const myd = mk(725, '.MYD', 'var(--mint)', '数据', '<u>MY</u> <u>D</u>ata', 'MyISAM', true, '128 B');
  const myi = mk(1280, '.MYI', 'var(--orange-hi)', '索引', '<u>MY</u> <u>I</u>ndex', 'MyISAM', true, '3,072 B');
  h('div', 'sch', frm.vis, '<b>id</b>    INT\n<b>name</b>  CHAR(10)\n<b>age</b>   TINYINT\n<span class="faint">ENGINE = MyISAM</span>');
  // .MYD 的缩略图：8 行 × 16 字节，按字段着色（与下一章的十六进制视图同构）
  const fcol = (i) => (i === 0 ? '#f29111' : i < 5 ? '#46cbe6' : i < 15 ? '#6fe0b6' : '#f1d98a');
  const rowsEl = [];
  for (let r = 0; r < 8; r++) { const row = h('div', 'mini-row', myd.vis); rowsEl.push(row); for (let i = 0; i < 16; i++) { const d = h('i', '', row); d.style.background = fcol(i); d.style.opacity = i >= 5 && i < 15 && i - 5 >= [5, 3, 5, 4, 4, 5, 5, 5][r] ? 0.22 : 0.85; } }
  // .MYI 的缩略图：一棵小树
  const tsvg = svg('svg', { width: 394, height: 150, viewBox: '0 0 394 150' }, myi.vis);
  const node = (x, y, w) => svg('rect', { x, y, width: w, height: 26, rx: 5, fill: 'rgba(242,145,17,.16)', stroke: '#f29111', 'stroke-width': 1.6 }, tsvg);
  const edges = [];
  [[40, 96], [150, 96], [260, 96]].forEach(([x], i) => { edges.push(svg('path', { d: `M${150 + 30 + i * 18},38 C${150 + 30 + i * 18},68 ${x + 45},66 ${x + 45},96`, fill: 'none', stroke: '#b9762a', 'stroke-width': 1.5 }, tsvg)); });
  const nodes = [node(150, 12, 96), node(40, 96, 90), node(150, 96, 90), node(260, 96, 90)];

  show([frm.c, myd.c, myi.c], tCards + 0.35, { y: 60, d: 0.9, stagger: 0.12 });
  fromTo(rowsEl, tCards + 0.9, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.05 });
  fromTo(nodes, tCards + 1.0, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08 });
  fromTo(edges, tCards + 1.3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.06 });

  // 逐个点亮
  const focus = (card, t0, t1, col) => {
    tl.to(card, { borderColor: col, y: -14, boxShadow: `0 44px 100px rgba(0,0,0,.55), 0 0 70px ${col.replace('1)', '.22)')}`, duration: 0.5, ease: 'power3.out' }, t0);
    tl.to(card, { borderColor: 'rgba(127,211,230,.30)', y: 0, boxShadow: '0 34px 90px rgba(0,0,0,.5), 0 0 0px rgba(0,0,0,0)', duration: 0.5, ease: 'power2.inOut' }, t1);
  };
  const others = (cards, t0, t1) => { tl.to(cards, { autoAlpha: 0.38, duration: 0.5 }, t0); tl.to(cards, { autoAlpha: 1, duration: 0.5 }, t1); };
  focus(frm.c, T('b3') - 0.1, Tend('b4') + 0.25, 'rgba(159,220,234,1)');
  others([myd.c, myi.c], T('b3') - 0.1, Tend('b4') + 0.25);
  focus(myd.c, T('b5') - 0.1, Tend('b5') + 0.2, 'rgba(111,224,182,1)');
  others([frm.c, myi.c], T('b5') - 0.1, Tend('b5') + 0.2);
  focus(myi.c, T('b6') - 0.1, Tend('b6') + 0.3, 'rgba(242,145,17,1)');
  others([frm.c, myd.c], T('b6') - 0.1, Tend('b6') + 0.3);

  // b7：后两个文件 = MyISAM
  const br = h('div', 'mybr', root); px(br, 725, 748, 1025);
  const brT = h('div', 'tag c-orange mono', root, 'MyISAM'); css(brT, { left: '1237px', top: '776px', transform: 'translateX(-50%)', fontSize: '26px', fontWeight: 600 });
  tl.to(frm.c, { autoAlpha: 0.38, duration: 0.5 }, T('b7') - 0.1);
  fromTo(br, T('b7', '后两个') , { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.7, ease: 'power3.inOut' });
  show(brT, T('b7', '就是') + 0.2, { y: 8, d: 0.5 });
  // b8：规则
  const rule = h('div', 'rule', root, '引擎 <span class="faint">=</span> 这些文件的<b>读写规则</b>');
  hide([br, brT], T('b8') - 0.2, { y: 0, d: 0.35 });
  show(rule, T('b8', '本质') , { y: 16, d: 0.8 });
});
