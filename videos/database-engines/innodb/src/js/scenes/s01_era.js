// 第 01 章：从 MyISAM 到 InnoDB。主画面是一条带年份的时间轴，上面一条「默认引擎」的带子随播放头生长：
// MyISAM 到 2010 年 7 月（5.5.5，H2）为止，之后是 InnoDB，一直到今天的 9.7（M22、G6）。下方三个问题小卡，最后收向「事务」。
scene('s1', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, -1, ['y1', 'y4', 'y6']);             // 镜头只极慢横移（parts.js）
  // 退场：和 exit() 一样，但不带 overwrite（overwrite 会在倒着 seek 时吃掉同一元素先前的显隐补间）
  const s1_out = (e, t, o = {}) => tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y != null ? o.y : -14, duration: o.d || 0.35, ease: 'power2.in' }, t);
  const st = h('style', '', W);
  st.textContent = `
    .s1-band { position: absolute; height: 52px; }
    .s1-band.my { background: #5F686E; }
    .s1-band.inno { background: var(--main); }
    .s1-axis { position: absolute; height: 3px; background: var(--ink); }
    .s1-yr { position: absolute; font: 500 24px "Inter"; color: var(--ink2); font-variant-numeric: tabular-nums; }
    .s1-dot { position: absolute; width: 18px; height: 18px; background: var(--mainD); }
    .s1-stem { position: absolute; width: 2px; background: var(--mainD); }
    .s1-lab { position: absolute; font: 700 30px "Inter", "Sans SC"; color: var(--ink); }
    .s1-lab small { display: block; font: 500 24px "Inter", "Sans SC"; color: var(--ink2); margin-top: 2px; }
    .s1-unc { display: inline-block; vertical-align: middle; padding: 2px 10px; font: 700 24px "Inter"; color: var(--acc); border: 2px solid var(--acc);
      background-color: var(--accL); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Cpath d='M-2,2 l4,-4 M0,14 L14,0 M12,16 l4,-4' stroke='%23B5452E' stroke-width='3'/%3E%3C/svg%3E"); }
    .s1-unc > b { background: #fff; padding: 0 4px; }
    .s1-q .cs { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .s1-big { position: absolute; font: 900 84px "Sans SC"; color: var(--mainD); }
  `;
  const ov = overlay(W);
  // 年份 → 横坐标：2003 到 2027
  const X0 = 200, X1 = 1720, Y0 = 1992, Y1 = 2027;
  const xOf = (yr) => X0 + (yr - Y0) / (Y1 - Y0) * (X1 - X0);
  const yAxis = 480;
  const yDefault = 2010 + 186 / 365;                       // 5.5.5：2010-07-06（H2）
  const yAcq = 2005 + 280 / 365;                           // Oracle 宣布收购：2005 年 10 月（H1）
  const yToday = 2026 + 296 / 365;                         // 本片取证：2026-10-24（FACTS「环境与版本」）

  // 时间轴整组放在一个容器里：只有它在场时（y1–y5）放在画面中部；y6 三张问题卡出来时整组上移，让出下面的位置
  const G = h('div', 'abs', W); px(G, 0, 0, 1920, 1080); css(G, { pointerEvents: 'none' });
  const ovG = overlay(G);
  const axis = h('div', 's1-axis', G); px(axis, X0, yAxis, X1 - X0);
  const years = [1995, 2000, 2005, 2010, 2015, 2020, 2025].map((yr) => { const e = h('div', 's1-yr', G, String(yr)); px(e, xOf(yr) - 26, yAxis + 16); return e; });
  const ticks = [1995, 2000, 2005, 2010, 2015, 2020, 2025].map((yr) => { const e = h('div', 's1-stem', G); px(e, xOf(yr) - 1, yAxis, null, 12); css(e, { background: 'var(--ink)' }); return e; });
  const bandLab = h('div', 'abs t-small', G, 'MySQL 的默认引擎'); px(bandLab, X0, 326);
  // 带子是纯色块，名字是压在上面的另一层（色块随播放头变宽）
  const yMy = 2001;                                        // MyISAM 自 3.23 加入，3.23 正式版 2001 年初（V6）
  const bMy = h('div', 's1-band my', G); px(bMy, xOf(yMy), 362, 0);
  const bIn = h('div', 's1-band inno', G); px(bIn, xOf(yDefault), 362, 0);
  const lMy = h('div', 'abs', G, 'MyISAM'); px(lMy, xOf(yMy) + 16, 371); css(lMy, { font: '700 28px Inter', color: '#fff' });
  const lIn = h('div', 'abs', G, 'InnoDB'); px(lIn, xOf(yDefault) + 16, 371); css(lIn, { font: '700 28px Inter', color: '#fff' });

  // 播放头沿时间轴走：y1 到 1994，源码面板一行行出来时走到 1997，y2 经过 2001 到 2005，y3 到 2010，y4 走到今天
  const P = [[T('y1e'), xOf(Y0 + 0.5)], [T('y1', '1994 年'), xOf(1994.1)], [Tend('y1d') - 0.3, xOf(1997.7)], [T('y2') - 0.2, xOf(yMy)], [T('y2', '2005 年'), xOf(yAcq)], [T('y3', '2010 年'), xOf(yDefault)], [Tend('y4') - 0.2, xOf(yToday)]];
  const xAt = (t) => { if (t <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (t <= P[i][0]) return lerp(P[i - 1][1], P[i][1], ease.io3((t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]))); return P[P.length - 1][1]; };
  const ph = h('div', 'playhead', G); px(ph, 0, 362, null, 138);   // 从带子上沿开始，不穿过「MySQL 的默认引擎」几个字
  let last = null;
  F((t) => {
    const x = Math.round(xAt(t)), on = t >= P[0][0] - 0.3 && t < Tend('y4') + 1.0;
    const xb = t < P[0][0] - 0.3 ? X0 : x;
    const k = (on ? 1 : 0) + ':' + x + ':' + xb; if (k === last) return; last = k;
    ph.style.visibility = on ? 'visible' : 'hidden'; ph.style.left = x + 'px';
    const wMy = Math.max(0, Math.min(xb, xOf(yDefault)) - xOf(yMy)), wIn = Math.max(0, xb - xOf(yDefault));
    bMy.style.width = wMy + 'px'; bIn.style.width = wIn + 'px';
    lMy.style.display = wMy >= 150 ? '' : 'none'; lIn.style.display = wIn >= 140 ? '' : 'none';
  });

  // 节点
  // 节点：竖线分两段，绕开中间的默认引擎带子（标签 → 带子上沿，带子下沿 → 时间轴）
  const node = (yr, html) => {
    const d = h('div', 's1-dot', G); px(d, xOf(yr) - 9, yAxis - 8);
    const sm = h('div', 's1-stem', G); px(sm, xOf(yr) - 1, 230, null, 362 - 230);
    const sm2 = h('div', 's1-stem', G); px(sm2, xOf(yr) - 1, 414, null, yAxis - 414);
    const lab = h('div', 's1-lab', G, html); px(lab, xOf(yr) + 14, 200);
    return { d, sm, sm2, lab };
  };
  // Innobase：没有年份，放在时间轴左上方
  const ib = h('div', 'card', G, '<div class="ct" style="font-family:Inter">Innobase Oy</div><div class="cs">芬兰</div>'); px(ib, X0, 140);
  const nAcq = node(yAcq, 'Oracle<small>2005.10</small>');
  const nDef = node(yDefault, 'MySQL 5.5.5<small>2010-07-06</small>');
  const nNow = node(yToday, '9.7.4<small>今天</small>');
  px(nNow.lab, xOf(yToday) - 150, 200); css(nNow.lab, { textAlign: 'right', width: '136px' });
  const demo = h('div', 'tag', G, '本片演示'); px(demo, xOf(yToday) - 132, 152);
  const ibR = X0 + ib.offsetWidth;
  const acqArrow = path(ovG, `M${xOf(yAcq) + 12},${222} C${xOf(yAcq) - 20},${190} ${ibR + 40},${186} ${ibR + 6},${186}`, 'mainD', { w: 2.2 });

  wipe(axis, c0 + 0.05, { dir: 'l', d: 0.8 });
  years.forEach((e, i) => slide(e, c0 + 0.3 + i * 0.08, { y: 12 }));
  ticks.forEach((e, i) => appear(e, c0 + 0.3 + i * 0.08));
  wipe(bandLab, c0 + 0.5, { dir: 'l', d: 0.5 });
  vanish(bMy, 0); appear(bMy, T('y1') - 0.3); vanish(bIn, 0); appear(bIn, T('y3', '2010 年'));
  slide(ib, T('y1e', 'Innobase') - 0.2, { x: -24 }); sfx('pop', T('y1e', 'Innobase'), { g: 0.4 });
  { const loc = ib.querySelector('.cs'); vanish(loc, 0); show(loc, T('y1e', '芬兰'), { y: 6, d: 0.3 }); }   // 讲到「芬兰」时副标题才出来
  // y1–y1d：InnoDB 自己的来历——轴下方是 9.7.4 源码文件头的原文（K6）：一行一个文件，写下的日期从 1994 到 1997，作者都是 Heikki Tuuri
  const files = D.created.filter((c) => ['page/page0page.cc', 'btr/btr0btr.cc', 'trx/trx0trx.cc', 'lock/lock0lock.cc', 'log/log0recv.cc'].includes(c.file));
  const panel = h('div', 'box', G); px(panel, 930, yAxis + 50, 790, 56 + files.length * 36);
  h('div', 'abs t-small', panel, 'MySQL 9.7.4 源码 · storage/innobase/').style.cssText = 'position:absolute;left:20px;top:10px';
  const fl = files.map((c, i) => { const m = c.text.match(/^Created (\S+) (.+)$/); const e = h('div', 'abs mono', panel, `${c.file.padEnd(20)}<span class="c-main">Created ${m[1].padEnd(10)}</span><span class="s1-who">${m[2]}</span>`); px(e, 20, 46 + i * 36); css(e, { fontSize: '23px' }); return e; });
  wipe(panel, T('y1') - 0.2, { dir: 'l', d: 0.6 });                // 讲 1994 年的这一句一开始，源码面板就在轴下方展开
  const tFl = T('y1', 'InnoDB') + 0.3, stFl = Math.max(0.3, (Tend('y1') - tFl) / files.length);
  fl.forEach((e, i) => { vanish(e, 0); appear(e, tFl + i * stFl); sfx('tick', tFl + i * stFl, { g: 0.3 }); });
  // 轴下方 1994 年：Heikki Tuuri 写下最早的代码
  const dot94 = h('div', 's1-dot', G); px(dot94, xOf(1994) - 9, yAxis - 8); vanish(dot94, 0); slam(dot94, T('y1', '1994 年'), { from: 1.8 }); sfx('tick', T('y1', '1994 年'), { g: 0.4 });
  const hkStem = h('div', 's1-stem', G); px(hkStem, xOf(1994) - 1, yAxis + 6, null, 64); css(hkStem, { background: 'var(--main)' });
  const hk = h('div', 's1-lab', G, 'Heikki Tuuri<small>1994 · 最早的代码</small>'); px(hk, xOf(1994) + 14, yAxis + 52);
  wipe(hkStem, T('y1', 'Heikki') - 0.2, { dir: 't', d: 0.3 }); slide(hk, T('y1', 'Heikki'), { x: -20 }); sfx('pop', T('y1', 'Heikki'), { g: 0.4 });
  // y1d：一行一行把名字框起来（底色也变，扫描能看到这一步）
  st.textContent += '.s1-who { color: var(--main); } .s1-who.s1-hl { color: var(--acc); background: var(--accL); outline: 3px solid var(--acc); outline-offset: 2px; font-weight: 700; } .s1-lab.s1-hl { color: var(--acc); background: var(--accL); outline: 3px solid var(--acc); outline-offset: 4px; }'
    + ' .s1-row.s1-hl { color: var(--mainD); }';
  const tHl0 = T('y1d', '开头'), stHl = Math.max(0.3, (T('y1d', '名字') - tHl0) / (files.length - 1));
  panel.querySelectorAll('.s1-who').forEach((e, i) => { lit(e, 's1-hl', tHl0 + i * stHl); fl[i].classList.add('s1-row'); lit(fl[i], 's1-hl', tHl0 + i * stHl); });
  lit(hk, 's1-hl', T('y1d', '名字'));
  [panel, hkStem, hk, dot94].forEach((e) => s1_out(e, T('y2', '收购'), { y: 12, d: 0.35 }));   // 收购那一下再收走
  for (const [n, t] of [[nAcq, T('y2', '2005 年')], [nDef, T('y3', '2010 年')], [nNow, T('y4', '9.7')]]) {
    slam(n.d, t, { from: 1.8 }); wipe(n.sm2, t + 0.02, { dir: 'b', d: 0.2 }); wipe(n.sm, t + 0.12, { dir: 'b', d: 0.3 }); slide(n.lab, t + 0.2, { y: 16 }); sfx('thud', t, { g: 0.5 });
  }
  arrowIn(acqArrow, T('y2', 'Oracle') + 0.3, 0.7);
  // y3：轴下方一行「默认存储引擎」，讲到「换成」时 MyISAM 划掉、换上 InnoDB（H2）
  const dflt = h('div', 'box', G); px(dflt, 200, 560, 640, 96);
  dflt.innerHTML = '<div class="abs t-small" style="left:24px;top:10px">MySQL 5.5.5 起</div><div class="abs" style="left:24px;top:44px;font:700 30px Inter,&quot;Sans SC&quot;">默认存储引擎：<span class="s1-old">MyISAM</span><span class="s1-new c-main">　InnoDB</span></div>';
  st.textContent += ' .s1-old.s1-x { text-decoration: line-through; text-decoration-thickness: 3px; color: var(--ink2); }';
  wipe(dflt, T('y3', '默认引擎') - 0.2, { dir: 'l', d: 0.6 });
  const dNew = dflt.querySelector('.s1-new'); vanish(dNew, 0); show(dNew, T('y3', '换成'), { x: -10, d: 0.35 });
  lit(dflt.querySelector('.s1-old'), 's1-x', T('y3', '换成')); sfx('tick', T('y3', '换成'), { g: 0.35 });
  s1_out(dflt, T('y6') + 0.2, { y: -12, d: 0.3 });
  // y4：「这一集演示的 MySQL 9.7」——标出本片演示，敲出版本查询
  slam(demo, T('y4', '演示'), { from: 1.4 }); sfx('pop', T('y4', '演示'));
  lit(nNow.lab, 'c-main', T('y4', '演示'));
  // 演示用的服务器自己报的版本（research/lab/out_01.json 的 environment.version）
  const ver = h('div', 'abs mono', G, ''); px(ver, 1290, 560); css(ver, { fontSize: '30px', color: 'var(--ink)' });
  const verOut = h('div', 'abs mono', G, '9.7.4'); px(verOut, 1290, 606); css(verOut, { fontSize: '30px', color: 'var(--main)', fontWeight: 700 });
  const tv = typeText(ver, 'mysql&gt; <span class="c-main">SELECT</span> @@version;', T('y4', '演示') + 0.2, 20, { cursor: false });
  vanish(verOut, 0); appear(verOut, tv + 0.25); sfx('blip', tv + 0.25, { g: 0.5 });
  [ver, verOut].forEach((e) => s1_out(e, T('y6') + 0.2, { y: -12, d: 0.3 }));
  G.appendChild(ovG);
  // 轴下方有了 InnoDB 自己的来历与源码面板，时间轴不再下移居中

  // 三个问题：各带一个小图
  // 三个问题：y6 先摆出 MyISAM 做不到的三处，y7–y9 各自变成一个问题，小图在讲到时动起来
  const Q = [
    { t: 'y7', gap: '没有事务', title: '撤回', x: 200 },
    { t: 'y8', gap: '一把表锁', title: '同时读写', x: 750 },
    { t: 'y9', gap: '没有日志', title: '停下之后', x: 1300 },
  ];
  const cards = Q.map((q, i) => {
    const c = h('div', 'card s1-q', W, `<div class="ct"><span class="num c-mainD" style="margin-right:12px">${i + 1}</span><span class="s1-ti c-ink2" style="font-size:30px">${q.gap}</span></div><div class="cs" style="height:52px"></div>`);
    px(c, q.x, 600, 420, 178); slide(c, T('y6') + 0.2 + i * 0.5, { y: 36 }); sfx('thud', T('y6') + 0.2 + i * 0.5, { g: 0.4 });
    swaps(c.querySelector('.s1-ti'), [[T(q.t), q.title]]);
    lit(c.querySelector('.s1-ti'), 's1-on', T(q.t));
    return c;
  });
  st.textContent += '.s1-ti.s1-on { color: var(--ink) !important; font-size: 40px !important; } .card.s1-act { background: #E9F4F5 !important; border-color: var(--main) !important; }';
  [[0, T('y7', '撤回'), T('y8', '同时')], [1, T('y8', '同时'), T('y9', '停下')], [2, T('y9', '停下'), T('y10')]].forEach(([i, a, b]) => lit(cards[i], 's1-act', a, b));
  // 「MyISAM」只在这一排卡片上方写一次（R13 第 5 条），讲到「三个问题」时换成「三个问题」
  const qHead = h('div', 'abs t-note', W, 'MyISAM 做不到的三处'); px(qHead, 200, 556); wipe(qHead, T('y6') + 0.1, { dir: 'l', d: 0.4 });
  swaps(qHead, [[T('y7') - 0.1, '三个问题']]);
  // 小图：放在卡片下半部分，讲到哪一张就在哪一张里演一遍
  const pic = (i, html, x, t) => { const e = h('div', 'abs', cards[i], html); px(e, x, 96); css(e, { whiteSpace: 'nowrap' }); vanish(e, 0); return e; };
  // 1 撤回：42 → 改成 43（斜纹）→ 想撤回？
  const p1a = pic(0, '<span class="mini b">42</span>', 28), p1b = pic(0, '<span class="s1-unc"><b>43</b></span>', 104), p1c = pic(0, '<span class="mono c-main" style="font-size:34px">↶ ?</span>', 196);
  slide(p1a, T('y7') + 0.1, { x: -20 }); slide(p1b, T('y7', '改') , { x: -30 }); slam(p1c, T('y7', '撤回'), { from: 1.4 });
  // 2 同时读写：Alice 在改的同时，Bob 来读
  const p2a = pic(1, '<span class="mini b">Alice 改</span>', 28), p2b = pic(1, '<span class="mini b" style="background:var(--panel);color:var(--main)">Bob 读</span>', 330), p2c = pic(1, '<span class="mono c-acc" style="font-size:34px">?</span>', 178);
  slide(p2a, T('y8') + 0.1, { x: -40 }); appear(p2b, T('y8', '同时')); fromTo(p2b, T('y8', '同时'), { x: 60 }, { x: -96, duration: 1.4, ease: 'power2.out' }); slam(p2c, T('y8', '干扰'), { from: 1.5 });
  // 3 停下之后：已经提交 → 机器停下 → 还在不在
  const p3a = pic(2, '<span class="mini b">COMMIT</span>', 28), p3b = pic(2, '<span>' + MARK.bolt(34) + '</span>', 170), p3c = pic(2, '<span class="mono c-acc" style="font-size:34px">?</span>', 230);
  slide(p3a, T('y9') + 0.1, { x: -30 }); slam(p3b, T('y9', '停下'), { from: 1.8 }); sfx('error', T('y9', '停下'), { g: 0.35 }); slam(p3c, T('y9', '还在'), { from: 1.5 });

  // 收向「事务」
  const big = h('div', 's1-big', W, '事务'); px(big, 960 - 84, 818);
  const links = cards.map((c, i) => path(ov, `M${Q[i].x + 210},${784} L${960},${818}`, 'mainD', { w: 2.2 }));
  const tT = T('y10', '事务');
  links.forEach((p, i) => arrowIn(p, T('y10') + 0.2 + i * 0.35, 0.9));
  slam(big, tT, { from: 1.5 }); sfx('thud', tT + 0.05);
  cards.forEach((c) => lit(c, 'on', tT));
  cards.forEach((c) => to(c, Tend('y10') + 0.3, { opacity: 0.45, duration: 0.6 }));   // 章末三张卡退后，只留「事务」
  s1_out(G, T('y10') + 0.2, { y: -16, d: 0.4 });                    // 收向「事务」时，上面的年代轴退场（同屏要读的字少）
  W.appendChild(ov);
});
