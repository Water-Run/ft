// 第 11 章 事务，和它的代价（全片最后一章）：回到开头的三个问题，三样部件合起来就是 InnoDB 的事务；再看代价，引出下一集。
// 一、三个问题各对上架构图里的部件：A 撤回靠 undo（X2）；I 读靠多版本、写靠行级锁（M9、M10）；D 停下之后提交的还在，靠 redo（M12、R4）；合起来就是事务（M20）。
// 二、代价：每行 6 + 7 = 13 字节（T7、S1、S2）；旧版本要留着（M8）；锁要等、可能死锁（X5、X7）。
// 三、引出下一集：另一个更老牌的开源 SQL 数据库把旧版本留在表里（K9、M34）。
scene('s11', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  const ov = overlay(W);
  const A = D.alice;
  const ON = new Map(), onWin = (el, a, b) => { if (!ON.has(el)) ON.set(el, []); ON.get(el).push([a, b]); };
  const NUM = (txt, x, y, parent = W) => { const e = h('div', 'tag s10n', parent, txt); px(e, x, y); return e; };
  h('style', '', document.head, '.s10n { font: 800 26px Inter !important; padding: 0 10px !important; background: var(--panel) !important; color: var(--main) !important; border: 2px solid var(--main); }'
    + ' .s10n.s10act { background: var(--main) !important; color: #fff !important; } .s10flash { background: var(--main) !important; color: #fff !important; }');

  // ── 架构图 ──
  const ZM = zone(W, 120, 110, 640, 470, '内存', 'In-Memory');
  const ZD = zone(W, 800, 110, 1000, 470, '磁盘', 'On-Disk');
  const bp = boxEl(ZM, 20, 84, 600, 236, '缓冲池');
  const lb = boxEl(ZM, 20, 334, 600, 116, '日志缓冲');
  const ibd = boxEl(ZD, 20, 84, 470, 160, 'users.ibd');
  const undo = boxEl(ZD, 510, 84, 470, 160, 'undo');
  const redo = boxEl(ZD, 20, 258, 960, 90, 'redo 日志');
  const dbw = boxEl(ZD, 20, 360, 960, 90, '双写缓冲区');
  // 缓冲池里放大的页 27，Alice 那一行
  const p27 = h('div', 'abs', bp); px(p27, 24, 54, 552, 160); css(p27, { border: '2px solid var(--mainD)', background: 'var(--pale)' }); p27.dataset.name = '页 ' + A.page;
  const p27t = h('div', 'abs', p27, `页 ${A.page}`); px(p27t, 14, 8); css(p27t, { font: '700 24px "Sans SC"', color: 'var(--mainD)' });
  const row = h('div', 'abs mono', p27, ''); px(row, 70, 70, 400, 54); css(row, { background: 'var(--panel)', border: '2px solid var(--mainD)', fontSize: '28px', padding: '8px 14px' });
  row.innerHTML = '2050  Alice   <b style="color:var(--main)">43</b>';               // 这一章从事务提交之后讲起
  const sq10 = (parent, x, y, label, cls = '') => { const e = h('div', 'sq ' + cls, parent, label != null ? `<div class="l">${label}</div>` : ''); px(e, x, y, 40, 40); const l = e.querySelector('.l'); if (l) css(l, { fontSize: '22px', top: '5px' }); return e; };
  const ibdPages = [D.pk.root, ...PK_LEAVES].slice(0, 18);
  const ibdSq = ibdPages.map((p, i) => sq10(ibd, 18 + (i % 9) * 50, 52 + Math.floor(i / 9) * 50, p, 'on'));
  const i27 = ibdPages.indexOf(A.page);
  const lbSq = Array.from({ length: 9 }, (_, i) => sq10(lb, 22 + i * 64, 58, null));
  const dbwSq = Array.from({ length: 16 }, (_, i) => sq10(dbw, 22 + i * 58, 44, null));
  // undo：Alice 改之前的那一版
  const uRec = h('div', 'abs mono', undo, `2050  Alice   <b>${A.before.age}</b>`); px(uRec, 24, 60); css(uRec, { fontSize: '26px', background: 'var(--pale)', border: '2px solid var(--main)', padding: '6px 12px' });
  const uRec2 = h('div', 'abs mono', undo, '旧版本 …'); px(uRec2, 24, 112); css(uRec2, { fontSize: '22px', color: 'var(--ink2)', border: '1.5px dashed var(--edge)', padding: '2px 10px' });
  // redo 带子
  const tape = h('div', 'abs', redo); px(tape, 200, 52, 740, 26); css(tape, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' });
  const tapeFill = h('div', 'abs', redo); px(tapeFill, 200, 52, 420, 26); css(tapeFill, { background: 'var(--pale)' });
  const tapeNew = h('div', 'abs', redo); px(tapeNew, 620, 52, 0, 26); css(tapeNew, { background: 'var(--main)' });
  W.appendChild(ov);

  wipe(ZM, c0 + 0.1, { dir: 'l', d: 0.6 }); wipe(ZD, c0 + 0.2, { dir: 'l', d: 0.6 }); sfx('whoosh', c0 + 0.1, { g: 0.4 });

  // ── 三个问题，对上架构图里的部件 ──
  const QS = [
    { k: 'k21', L: 'A', q: '改到一半，能不能整个撤回', on: [undo] },
    { k: 'k22', L: 'I', q: '好几个人同时读写，会不会互相干扰', on: [undo, p27] },
    { k: 'k23', L: 'D', q: '机器突然停下，提交了的还在不在', on: [redo] },
  ];
  const qCards = QS.map((Q, i) => {
    const c = h('div', 'card', W, `<div class="ct"><span class="num c-main" style="margin-right:16px">${Q.L}</span><span style="font-size:26px">${Q.q}</span></div>`);
    px(c, 120 + i * 570, 650, 540); css(c, { padding: '18px 24px' });
    slide(c, T('k20') + 0.2 + i * 0.12, { y: 30 }); return c;
  });
  const badges = [];
  QS.forEach((Q, i) => {
    const t = T(Q.k);
    lit(qCards[i], 'on', t, Tend(Q.k) + 0.2);
    Q.on.forEach((b, j) => {
      const bd = h('div', 'tag', b, Q.L); px(bd, b === p27 ? 500 : b.offsetWidth - 40 - j * 0, b === p27 ? 8 : 6); css(bd, { font: '800 24px Inter', padding: '1px 9px', background: 'var(--main)' });
      if (b === undo && i > 0) css(bd, { right: (6 + i * 34) + 'px', left: 'auto' });
      vanish(bd, 0); slam(bd, t + 0.2 + j * 0.15, { from: 1.4 }); badges.push(bd);
      onWin(b, t, Tend(Q.k) + 0.2);
    });
    if (Q.L === 'I') { const l2 = lockAt(p27, 500, 88); vanish(l2, 0); appear(l2, T('k22', '行级锁')); exit(l2, Tend(Q.k) + 0.2, { d: 0.2 }); }
  });
  // 读靠多版本、撤销靠 undo：undo 里那一版亮一下；重做靠 redo：带子上扫一遍
  const FL = [[T('k21', 'undo'), T('k21', 'undo') + 0.9], [T('k22', '多版本'), T('k22', '多版本') + 0.9], [T('k15', '多版本'), T('k15', '多版本') + 0.9]];
  { let last = null; F((t) => { const on = FL.some(([a, b]) => t >= a && t < b); if (on === last) return; last = on; uRec.classList.toggle('s10flash', on); }); }
  const rscan = h('div', 'abs', redo); px(rscan, 200, 44, 10, 42); css(rscan, { background: 'var(--main)' });
  { const W2 = [[T('k23', 'redo'), T('k23', 'redo') + 1.2], [T('k15', '日志'), T('k15', '日志') + 1.2]]; let last = null;
    F((t) => { const w = W2.find(([a, b]) => t >= a && t < b); const x = w ? Math.round(lerp(200, 690, ease.io3(clamp((t - w[0]) / (w[1] - w[0]))))) : -1; if (x === last) return; last = x; rscan.style.display = w ? '' : 'none'; rscan.style.left = x + 'px'; }); }
  // 「事务」：行上那把锁再出现一下
  const l3 = lockAt(p27, 500, 88); vanish(l3, 0); appear(l3, T('k15', '事务')); vanish(l3, Tend('k15'));
  // k24：三样合在一起，就是 InnoDB 的事务——三张卡下面一道括线收成「事务」，三样部件一起亮
  const brace3 = h('div', 'abs', W); px(brace3, 120 + 270, 752, 2 * 570, 22); css(brace3, { borderLeft: '3px solid var(--main)', borderRight: '3px solid var(--main)', borderBottom: '3px solid var(--main)' });
  const txTag = h('div', 'tag', W, 'InnoDB 的事务'); px(txTag, 120 + 270 + 570 - 110, 786); css(txTag, { fontSize: '32px', padding: '6px 18px' });
  wipe(brace3, T('k24', '合在一起') - 0.1, { dir: 'l', d: 0.6 }); vanish(txTag, 0); slam(txTag, T('k24', 'InnoDB') - 0.1, { from: 1.4 }); sfx('thud', T('k24', 'InnoDB'), { g: 0.6 });
  [undo, p27, redo].forEach((b) => onWin(b, T('k24', '合在一起'), Tend('k24') + 0.3));
  const out2 = Tend('k24') + 0.9;
  [brace3, txTag].forEach((e) => exit(e, out2, { y: 16, d: 0.3 }));
  qCards.forEach((c, i) => exit(c, out2 + i * 0.05, { y: 20, d: 0.3 }));
  badges.forEach((b) => exit(b, out2, { d: 0.2 }));

  // ── 代价 ──
  // 一行 73 字节：5 字节记录头 + 68 字节字段；其中事务号 6、回滚指针 7（T7、S1、S2）
  const hx = A.before.hex;
  const F10 = [
    { k: '记录头', hx: hexSp(A.header), n: 5 },
    { k: '编号', hx: hexSp(hx.slice(0, 8)), n: 4 },
    { k: '事务号', hx: hexSp(hx.slice(8, 20)), n: 6, cls: 'hidden' },
    { k: '回滚指针', hx: hexSp(hx.slice(20, 34)), n: 7, cls: 'hidden' },
    { k: '名字', hx: hexSp(hx.slice(34, 44)) + ' …', n: 50 },
    { k: '年龄', hx: hx.slice(-2), n: 1 },
  ];
  const strip = byteStrip(W, 120, 640, F10.map((f) => ({ k: `${f.k} <span class="num" style="color:var(--ink2);font-weight:500">${f.n}</span>`, hx: f.hx, cls: f.cls })));
  strip.f.forEach((e, i) => slide(e, T('k12') + 0.1 + i * 0.06, { y: 24 }));
  const plus = h('div', 'abs', W, '<span class="num" style="font:800 64px Inter;color:var(--mainD)">6 + 7 = 13</span><span style="font:700 36px \'Sans SC\';color:var(--mainD);margin-left:12px">字节</span>');
  px(plus, 1290, 790); vanish(plus, 0); slam(plus, T('k12', '13'), { from: 1.3 }); sfx('thud', T('k12', '13'));
  // 旧版本留着：undo 里的旧版本一条条摞着
  const olds = [0, 1, 2].map((k) => { const e = h('div', 'abs mono', undo, '旧版本'); e.dataset.overlapOk = ''; px(e, 170 + k * 16, 104 + k * 8); css(e, { fontSize: '22px', background: 'var(--panel)', border: '1.5px solid var(--main)', padding: '2px 10px' }); vanish(e, 0); appear(e, T('k13') + 0.3 + k * 0.25); return e; });
  onWin(undo, T('k13'), Tend('k13'));
  // 锁要等：一根等锁的虚框条；还可能死锁：两把锁互相指着
  const GW = h('div', 'abs', W); px(GW, 0, 0);
  const waitBar = h('div', 'vbar wait', GW, ''); px(waitBar, 120, 820, 0); css(waitBar, { height: '44px' });
  const tW0 = T('k14');
  let lastW = -1;
  F((t) => { const w = t < tW0 ? 0 : Math.round(520 * clamp((t - tW0) / 1.6)); if (w === lastW) return; lastW = w; waitBar.style.width = w + 'px'; waitBar.style.visibility = w > 2 ? 'visible' : 'hidden'; });
  const dl1 = lockAt(W, 760, 830), dl2 = lockAt(W, 900, 830);
  const dA = path(ov, 'M790,826 C820,790 870,790 896,822', 'acc', { w: 2.4 }), dB = path(ov, 'M896,862 C870,896 820,896 794,866', 'acc', { w: 2.4 });
  [dl1, dl2].forEach((e) => { vanish(e, 0); appear(e, T('k14', '死锁') - 0.2); });
  arrowIn(dA, T('k14', '死锁'), 0.4); arrowIn(dB, T('k14', '死锁') + 0.15, 0.4);
  const out3 = Tend('k14') + 0.5;
  [...strip.f, plus, GW, dl1, dl2, ...olds].forEach((e) => exit(e, out3, { y: 16, d: 0.3 }));
  [dA, dB].forEach((p) => svgOut(p, out3));

  // ── 事务、多版本、日志：三样部件亮一下 ──
  const tK15 = T('k15');
  onWin(undo, T('k15', '多版本'), Tend('k15'));
  onWin(redo, T('k15', '日志'), Tend('k15'));
  onWin(p27, T('k15', '事务'), Tend('k15'));
  // 每个框的「亮」只由一个帧函数管：t 落在它的任一段里就亮
  for (const [el, wins] of ON) { let last = null; F((t) => { const on = wins.some(([a, b]) => t >= a && t < b); if (on === last) return; last = on; el.classList.toggle('on', on); }); }

  // ── 下一集：旧版本留在哪里 ──
  const tN = T('k16') - 0.3;
  exit(ZM, tN, { y: -20, d: 0.4 }); exit(ZD, tN + 0.05, { y: -20, d: 0.4 });
  const pane = (x, title, rowsHtml) => { const b = boxEl(W, x, 300, 760, 360, ''); const t = h('div', 'abs', b, title); px(t, 24, 18); css(t, { font: '800 34px "Sans SC"', color: 'var(--ink)' }); const r = h('div', 'abs', b, rowsHtml); px(r, 24, 90); return b; };
  const rowB = (txt, cls) => `<div class="mono" style="font-size:28px;padding:8px 14px;margin-bottom:14px;border:2px solid ${cls === 'old' ? 'var(--main)' : 'var(--mainD)'};background:${cls === 'old' ? 'var(--pale)' : 'var(--panel)'};width:560px">${txt}</div>`;
  const left = pane(120, 'InnoDB', `<div class="t-small" style="margin-bottom:8px">表（页 ${A.page}）</div>${rowB(`2050  Alice   ${A.after.age}`)}<div class="t-small" style="margin:18px 0 8px">undo</div>${rowB(`2050  Alice   ${A.before.age}`, 'old')}`);
  const right = pane(1040, '更老牌的开源 SQL 数据库', `<div class="t-small" style="margin-bottom:8px">表</div>${rowB(`2050  Alice   ${A.after.age}`)}`);
  const since = h('div', 'abs t-small', right, '前身 POSTGRES：1986 年在伯克利开始实现'); px(since, 24, 316);   // K9
  vanish(since, 0); show(since, T('k16z', '旧版本') - 0.2, { y: 8, d: 0.4 });
  const oldIn = h('div', 'abs', right, rowB(`2050  Alice   ${A.before.age}`, 'old')); px(oldIn, 24, 210);       // 旧版本也留在表里（M34）
  vanish(oldIn, 0); slide(oldIn, T('k16z', '表里') - 0.3, { x: 60 }); sfx('pop', T('k16z', '表里'), { g: 0.5 });
  wipe(left, tN + 0.3, { dir: 'l', d: 0.5 }); wipe(right, T('k16', '开源') - 0.3, { dir: 'l', d: 0.5 }); sfx('whoosh', tN + 0.3, { g: 0.4 });
  const next = h('div', 'tag', W, 'PART 3 · PostgreSQL'); px(next, 1040, 700); css(next, { font: '800 40px Inter', padding: '8px 22px' });
  slam(next, T('k17', '另一条路'), { from: 1.4 }); sfx('thud', T('k17', '另一条路') + 0.05);
  to(left, Tend('k17') + 0.4, { opacity: 0.45, duration: 0.6 });   // 章末 InnoDB 退后，留下下一集的那条路
  // 收干净，留给片尾硬切
  const tEnd = s.end - 0.15;                                  // 退场和片尾硬切几乎同时，片尾名单前不留空屏
  [left, right, next].forEach((e, i) => exit(e, tEnd + i * 0.05, { y: -16, d: 0.35 }));
});
