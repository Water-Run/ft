// 第 02 章：什么是事务。
// 一、两句 UPDATE 被一个框捆成整体，分出两条路：COMMIT 那一路修改全部生效、别人也看得到；ROLLBACK 那一路全部撤回（M23）。
// 二、平时每一句自己就是一个事务，执行完自动提交（M24，autocommit = 1，G6）。
// 三、管理员一句 UPDATE 改 4096 行：64×64 的格子一格格变成未提交的斜纹，停在第 258 行（R1，第 08 章用实测回答）。
// 四、ACID 四张小卡（M25、M26、M23），A、I、D 连回三个问题；最后引向「数据放在哪里」。
scene('s2', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  // 退场：和 exit() 一样，但不带 overwrite（overwrite 会在倒着 seek 时吃掉同一元素先前的显隐补间）
  const s2_out = (e, t, o = {}) => tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y != null ? o.y : -14, duration: o.d || 0.35, ease: 'power2.in' }, t);
  const st = h('style', '', W);
  st.textContent = `
    .s2-row { position: absolute; font: 600 30px "Mono"; color: var(--ink); }
    .s2-cell { position: absolute; height: 46px; min-width: 96px; padding: 4px 14px; font: 700 28px "Inter"; text-align: center; border: 2px solid var(--main); background: var(--main); color: #fff; }
    .s2-cell.unc { background-color: var(--accL); color: var(--acc); border-color: var(--acc);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Cpath d='M-2,2 l4,-4 M0,14 L14,0 M12,16 l4,-4' stroke='%23B5452E' stroke-width='3'/%3E%3C/svg%3E"); }
    .s2-cell.unc > b { background: #fff; padding: 0 6px; }
    .s2-arrow { position: absolute; font: 500 30px "Inter"; color: var(--ink2); }
    .s2-mark { position: absolute; font: 800 34px "Inter"; }
    .s2-letter { font: 800 76px "Inter"; color: var(--mainD); line-height: 1; }
    .s2-term { font: 800 36px "Sans SC"; color: var(--ink); margin-top: 6px; }
    .s2-pic { position: absolute; left: 28px; right: 28px; bottom: 34px; height: 92px; }
    .s2-g { position: absolute; display: grid; grid-template-columns: repeat(8, 14px); gap: 3px; }
    .s2-g i { display: block; width: 14px; height: 14px; border: 1.5px solid var(--main); }
    .s2-g.full i { background: var(--main); }
    .s2-g.half i:nth-child(-n+13) { background: var(--accL); border-color: var(--acc); }
    .s2-q .cs { display: flex; align-items: center; gap: 10px; }
  `;
  const ov = overlay(W);
  const TC = (id, w) => T(id, w);

  // ── 一、捆成一个整体，两条路 ──
  const code = boxEl(W, 140, 150, 900, 240); css(code, { borderColor: 'var(--edge)' });
  const l0 = sqlLine(code, 34, 26, '', { size: 30 });
  const l1 = sqlLine(code, 34, 92, 'UPDATE users SET age = 52 WHERE id = 2049;', { size: 30 });
  const l2 = sqlLine(code, 34, 158, 'UPDATE users SET age = 43 WHERE id = 2050;', { size: 30 });
  const brace = h('div', 'abs', W); px(brace, 156, 166, 868, 208); css(brace, { border: '3px solid var(--main)' });
  const braceTag = h('div', 'tag', W, '事务'); px(braceTag, 156, 136); css(braceTag, { fontSize: '26px', background: 'var(--main)' });
  // 表里的两行：原值是已提交的实心；改了还没提交的是斜纹
  const tblLab = h('div', 'abs mono t-small', W, 'users'); px(tblLab, 160, 430);
  const rowsY = [474, 540];
  const ids = [2049, 2050], oldV = [51, 42], newV = [52, 43];       // 年龄 = 18 + id % 63（FACTS「环境与版本」）；2050 是 Alice 42 岁
  const rowEls = rowsY.map((y, i) => {
    const id = h('div', 's2-row', W, String(ids[i])); px(id, 160, y + 4);
    const a = h('div', 's2-cell', W, String(oldV[i])); px(a, 300, y);
    const ar = h('div', 's2-arrow', W, '→'); px(ar, 420, y + 2);
    const b = h('div', 's2-cell unc', W, `<b>${newV[i]}</b>`); px(b, 470, y);
    return { id, a, ar, b };
  });
  // 右边两条路
  const okBox = boxEl(W, 1150, 150, 630, 300); const noBox = boxEl(W, 1150, 500, 630, 230);
  const okMark = h('div', 's2-mark c-main', okBox, '✓'); px(okMark, 586, 14);
  const noMark = h('div', 's2-mark c-acc', noBox, '↶'); px(noMark, 584, 12);
  const pC = h('div', 'pill fill', okBox, 'COMMIT'); px(pC, 28, 22);
  const pR = h('div', 'pill fill acc', noBox, 'ROLLBACK'); px(pR, 28, 22);
  const okRows = rowsY.map((y, i) => { const id = h('div', 's2-row', okBox, String(ids[i])); px(id, 30, 88 + i * 62); const c = h('div', 's2-cell', okBox, String(newV[i])); px(c, 160, 84 + i * 62); return [id, c]; });
  const noRows = rowsY.map((y, i) => { const id = h('div', 's2-row', noBox, String(ids[i])); px(id, 30, 88 + i * 62); const c = h('div', 's2-cell', noBox, String(oldV[i])); px(c, 160, 84 + i * 62); return [id, c]; });
  const bob = h('div', 'abs', okBox, '<span class="lane-name" style="position:static;margin-right:16px">Bob</span><span class="mini" style="border:2px solid var(--main);color:var(--main);font-family:Mono">SELECT</span><span class="mono" style="font-size:28px">→ 52 · 43</span>');
  px(bob, 30, 222);
  const pOk = path(ov, 'M1040,250 C1100,250 1100,300 1144,300', 'main', { w: 3 });
  const pNo = path(ov, 'M1040,330 C1100,330 1100,615 1144,615', 'acc', { w: 3 });

  const tA = c0 + 0.1;
  wipe(code, tA, { dir: 'l', d: 0.6 });
  slide(tblLab, tA + 0.3, { x: -20 });
  rowEls.forEach((r, i) => { slide(r.id, tA + 0.35 + i * 0.1, { x: -20 }); wipe(r.a, tA + 0.45 + i * 0.1, { dir: 'l', d: 0.4 }); });
  const tBind = T('t1', '捆');
  rowEls.forEach((r, i) => { appear(r.ar, T('t1') + 0.1 + i * 0.15); wipe(r.b, T('t1') + 0.2 + i * 0.15, { dir: 'l', d: 0.4 }); });
  wipe(brace, tBind - 0.1, { dir: 'l', d: 0.6 }); sfx('whoosh', tBind - 0.1, { g: 0.4 });
  arrowIn(pOk, T('t2', '全部生效') - 0.15, 0.6); wipe(okBox, T('t2', '全部生效'), { dir: 'l', d: 0.5 }); vanish(okMark, 0); slam(okMark, T('t2', '全部生效') + 0.3);
  arrowIn(pNo, T('t2', '撤回') - 0.15, 0.6); wipe(noBox, T('t2', '撤回'), { dir: 'l', d: 0.5 }); vanish(noMark, 0); slam(noMark, T('t2', '撤回') + 0.3);
  slam(braceTag, T('t3', '事务'), { from: 1.4 }); sfx('thud', T('t3', '事务'));
  typeText(l0, '<span class="kw">START TRANSACTION</span>;', T('t4') - 0.05, 30, { cursor: false });
  // 执行光标：从 START 一行一行往下走，走到两条路的分岔口等 COMMIT 或 ROLLBACK
  const cur = h('div', 'abs', code); px(cur, 14, 18, 872, 54); css(cur, { background: 'var(--pale)' }); code.insertBefore(cur, code.firstChild);
  const tc = T('t4') + 0.6;
  vanish(cur, 0); appear(cur, tc);
  fromTo(cur, tc + 1.0, { y: 0 }, { y: 66, duration: 0.5, ease: 'power2.inOut' });
  tl.fromTo(cur, { y: 66 }, { y: 132, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tc + 2.2);   // 接着的一段不提前渲染起点
  vanish(cur, T('t5', 'COMMIT'));
  // 两条路的结果先淡淡摆出来（要么都成新值，要么都回原值），讲到 COMMIT、ROLLBACK 时各自变实
  const faint = (els, t) => els.forEach((e, i) => fromTo(e, t + i * 0.06, { autoAlpha: 0 }, { autoAlpha: 0.32, duration: 0.4 }));
  faint(okRows.flat(), T('t2', '全部生效') + 0.3); faint(noRows.flat(), T('t2', '撤回') + 0.3);
  slam(pC, T('t5', 'COMMIT'), { from: 1.3 }); sfx('pop', T('t5', 'COMMIT'));
  okRows.forEach(([id, c], i) => { to(id, T('t5', '生效') - 0.2, { opacity: 1, duration: 0.3 }); to(c, T('t5', '生效') - 0.1 + i * 0.12, { opacity: 1, duration: 0.3 }); });
  slide(bob, T('t5', '别人'), { x: -30 }); sfx('blip', T('t5', '别人'), { g: 0.5 });
  slam(pR, T('t6', 'ROLLBACK'), { from: 1.3 }); sfx('pop', T('t6', 'ROLLBACK'));
  noRows.forEach(([id, c], i) => { to(id, T('t6', '撤回') - 0.2, { opacity: 1, duration: 0.3 }); to(c, T('t6', '撤回') - 0.1 + i * 0.12, { opacity: 1, duration: 0.3 }); });
  // 回滚时，左边表里那两格未提交的新值滑回原值底下、淡掉
  const tBack = T('t6', '做过的'), tGone = T('t6', '撤回');
  rowEls.forEach((r, i) => { tl.fromTo(r.b, { x: 0, opacity: 1 }, { x: -170, opacity: 0.15, duration: tGone - tBack, ease: 'power2.inOut', immediateRender: false }, tBack + i * 0.15); to(r.ar, tBack, { opacity: 0.2, duration: 0.4 }); });
  // 两条路各自亮起时，另一条退到背景
  lit(okBox, 'on', T('t5', 'COMMIT'), T('t6', 'ROLLBACK')); lit(noBox, 'on', T('t6', 'ROLLBACK'));

  const out1 = Tend('t6') + 0.25;
  [code, brace, braceTag, tblLab, okBox, noBox, ...rowEls.flatMap((r) => [r.id, r.a, r.ar, r.b])].forEach((e, i) => s2_out(e, out1 + (i % 6) * 0.03, { y: -16, d: 0.3 }));
  [pOk, pNo].forEach((p) => svgOut(p, out1, 0.25));

  // ── 二、平时：每一句自己就是一个事务，执行完自动提交 ──
  const ac = h('div', 'abs mono', W, 'mysql&gt; <span class="c-main" style="font-weight:700">SELECT</span> @@autocommit;\n<b class="c-main">1</b>'); px(ac, 140, 190); css(ac, { fontSize: '36px', lineHeight: '1.5' });
  const t7a = T('t7'), t7b = Tend('t7');
  const LA = lanes(W, { x: 140, y: 560, w: 1640, gap: 200, rowH: 120, names: ['会话'], pts: [[t7a + 0.2, 380], [t7b - 0.2, 1740]] });
  const SQLS = ['SELECT …', 'UPDATE …', 'DELETE …'];
  const xs = [520, 960, 1400];
  const segs = SQLS.map((q, i) => {
    const t = lerp(t7a + 0.4, t7b - 1.4, i / 2);
    const fr = h('div', 'abs', W); px(fr, xs[i] - 180, 560 - 70, 380, 140); css(fr, { border: '3px dashed var(--main)' });
    const p = h('div', 'pill ink', W, q); px(p, xs[i] - 160, 560 - 26); css(p, { fontSize: '28px' });
    const c = h('div', 'pill', W, 'COMMIT'); px(c, xs[i] + 40, 560 - 26); css(c, { borderStyle: 'dashed', fontSize: '28px' });
    wipe(fr, t - 0.05, { dir: 'l', d: 0.35 }); slam(p, t, { from: 1.2 }); slam(c, t + 0.55, { from: 1.2 }); sfx('pop', t + 0.55, { g: 0.4 });
    return [fr, p, c];
  });
  LA.enter(t7a - 0.1); LA.playhead(t7a + 0.2, t7b, 470, 650);
  slide(ac, t7a + 0.3, { y: -20 });
  const out2 = Tend('t7') + 0.2;
  [ac, ...LA.els.names, ...LA.els.lines, ...segs.flat()].forEach((e) => s2_out(e, out2, { y: -16, d: 0.3 }));
  W.querySelectorAll('.playhead').forEach((e) => s2_out(e, out2, { d: 0.2 }));

  // ── 三、一句改 4096 行，改到一半停下 ──
  const admin = h('div', 'lane-name', W, '管理员'); px(admin, 140, 170);
  const big = sqlLine(W, 330, 166, 'UPDATE users SET age = age + 1;', { size: 34 });
  const G = { x: 700, y: 250, c: 8 };                      // 64 × 64 = 4096 格，一格一行
  const grid = svg('svg', { class: 'ov', viewBox: '0 0 1920 1080' }, W);
  grid.innerHTML = `<defs><pattern id="s2cells" width="${G.c}" height="${G.c}" patternUnits="userSpaceOnUse" x="${G.x}" y="${G.y}"><path d="M${G.c},0 L0,0 L0,${G.c}" fill="none" stroke="#9CB7BC" stroke-width="1"/></pattern></defs>`
    + `<rect x="${G.x}" y="${G.y}" width="${64 * G.c}" height="${64 * G.c}" fill="#FFFFFF" stroke="#2D5A68" stroke-width="2"/>`
    + `<rect id="s2full" x="${G.x}" y="${G.y}" width="${64 * G.c}" height="0" fill="url(#hatch)"/>`
    + `<rect id="s2part" x="${G.x}" y="${G.y}" width="0" height="${G.c}" fill="url(#hatch)"/>`
    + `<rect x="${G.x}" y="${G.y}" width="${64 * G.c}" height="${64 * G.c}" fill="url(#s2cells)"/>`;
  const full = grid.querySelector('#s2full'), part = grid.querySelector('#s2part');
  const n4096 = h('div', 'abs', W, '<span style="font:800 64px Inter;color:var(--ink)">4096</span><span class="t-note" style="margin-left:12px">行</span>'); px(n4096, 1270, 250);
  // 计数只放数字（单独一个元素），「已改」是旁边另一个元素：滚动中的数字不算要读的文字
  const cnt = h('div', 'abs', W); px(cnt, 1270, 350);
  const cntN = h('div', 'abs num c-acc', cnt, '0'); px(cntN, 0, 0, 150); css(cntN, { font: '800 64px Inter', textAlign: 'right' });
  const cntL = h('div', 'abs t-note', cnt, '已改'); px(cntL, 162, 26);
  const leg = h('div', 'abs', W, '<span class="s2-cell unc" style="position:relative;display:inline-block;min-width:60px;height:36px;vertical-align:middle"></span><span class="t-note" style="margin-left:12px">改了，还没提交</span>'); px(leg, 1270, 470);
  const stop = h('div', 'abs', W, '<span style="font:800 96px Inter;color:var(--acc)">?</span>'); px(stop, 1280, 560);
  const tg0 = T('t9', 'UPDATE') + 0.5, tStop = T('t10', '停');
  const ROWS_AT_KILL = D.crash.rowsAtKill;                 // 258（R1）
  const kAt = (t) => Math.round(ROWS_AT_KILL * ease.out3(clamp((t - tg0) / (tStop - tg0))));
  let lastK = -1;
  F((t) => {
    const k = t < tg0 ? 0 : kAt(t); if (k === lastK) return; lastK = k;
    const r = Math.floor(k / 64), c = k % 64;
    full.setAttribute('height', r * G.c); part.setAttribute('y', G.y + r * G.c); part.setAttribute('width', c * G.c);
    cntN.textContent = k;
  });
  const t8 = T('t8');
  slide(admin, t8, { x: -30 }); typeText(big, big.innerHTML, t8 + 0.3, 36, { cursor: false });
  svgIn(grid, T('t9', '所有人') - 0.3, 0.5);
  slam(n4096, T('t9', '4096'), { from: 1.4 }); sfx('thud', T('t9', '4096'), { g: 0.5 });
  slide(cnt, tg0 - 0.1, { x: -20 }); slide(leg, tg0 + 0.2, { x: -20 });
  slam(stop, tStop + 0.1, { from: 1.6 }); sfx('error', tStop, { g: 0.6 });
  const out3 = Tend('t10') + 0.4;
  [admin, big, n4096, cnt, leg, stop].forEach((e, i) => s2_out(e, out3 + i * 0.03, { y: -16, d: 0.3 }));
  svgOut(grid, out3, 0.3);

  // ── 四、ACID ──
  const acid = h('div', 'abs', W, '<span style="font:800 104px Inter;color:var(--mainD);letter-spacing:.06em">ACID</span>'); px(acid, 140, 118);
  const quote = h('div', 'abs mono', W, '"…database design principles that emphasize aspects of reliability…"'); css(quote, { fontSize: '22px', color: 'var(--ink2)' });
  px(quote, 560, 150);
  const quoteZ = h('div', 'gloss', W, 'MySQL 9.7 手册：一组数据库设计原则，着眼于可靠性'); px(quoteZ, 560, 184);
  const pics = [
    // A：全成（4096 格都成了）或全不成（一格都没动），不会停在一半
    '<div class="s2-g full" style="left:0;top:8px">' + '<i></i>'.repeat(32) + '</div><div class="t-note" style="position:absolute;left:148px;top:20px">或</div>'
      + '<div class="s2-g" style="left:190px;top:8px">' + '<i></i>'.repeat(32) + '</div>',
    // C：崩溃过后，页仍是完整的
    '<div class="sq on" style="left:0;top:20px;width:56px;height:56px"></div><div class="mono c-acc" style="position:absolute;left:84px;top:18px;font-size:44px">⚡</div><div class="mono c-main" style="position:absolute;left:150px;top:18px;font-size:44px">✓</div>',
    // I：两个会话各走各的
    '<div style="position:absolute;left:0;top:6px;width:250px;height:34px;background:var(--main)"></div><div style="position:absolute;left:0;top:52px;width:250px;height:34px;border:2px solid var(--main);background:var(--pale)"></div><div class="t-small" style="position:absolute;left:262px;top:8px">Alice</div><div class="t-small" style="position:absolute;left:262px;top:54px">Bob</div>',
    // D：提交之后落到磁盘
    '<span class="mini b" style="position:absolute;left:0;top:28px;font-family:Mono">COMMIT</span><div class="mono c-mainD" style="position:absolute;left:132px;top:22px;font-size:36px">→</div><div class="box" style="left:182px;top:4px;width:120px;height:80px"><div class="t-small" style="position:absolute;left:10px;top:24px;font-family:Mono">users.ibd</div></div>',
  ];
  const LET = [['A', '原子性', 'q1'], ['C', '一致性', 'q2'], ['I', '隔离性', 'q3'], ['D', '持久性', 'q4']];
  const cards = LET.map(([l, term, q], i) => {
    const c = h('div', 'card', W, `<div class="s2-letter">${l}</div><div class="s2-term">${term}</div><div class="s2-pic">${pics[i]}</div>`);
    px(c, 140 + i * 418, 330, 386, 330);
    slide(c, T('t11') + 0.3 + i * 0.12, { y: 30 });
    // 亮起的时段：A、I、D 从讲到它起一直亮着；C 只亮到 q5（帧函数一处管，不分两次 lit）
    const a = T(q), b = i === 1 ? T('q5') : Infinity;
    let on0 = null; F((t) => { const on = t >= a && t < b; if (on !== on0) { c.classList.toggle('on', on); on0 = on; } });
    return c;
  });
  // 小图在讲到时演一遍
  const pa = cards[0].querySelectorAll('.s2-g')[0].children;              // A：左边一格格填满（全成），右边一格不动（全不成）
  const tA1 = T('q1') + 0.1, tA2 = T('q1', '全不成'); let lastA = -1;
  F((t) => { const k = Math.round(32 * clamp((t - tA1) / Math.max(0.6, tA2 - tA1 - 0.2))); if (k === lastA) return; lastA = k; for (let i = 0; i < 32; i++) pa[i].style.background = i < k ? 'var(--main)' : ''; });
  cards[0].querySelectorAll('.s2-g')[0].classList.remove('full');
  const [cBolt, cOk] = cards[1].querySelectorAll('.mono');               // C：崩溃来了，页仍完整
  vanish(cBolt, 0); slam(cBolt, T('q2', '崩溃'), { from: 1.8 }); vanish(cOk, 0); slam(cOk, T('q2', '错乱'), { from: 1.5 });
  const iBars = [...cards[2].querySelectorAll('.s2-pic > div')].slice(0, 2); // I：两个会话各自往前走
  iBars.forEach((b, j) => fromTo(b, T('q3') + 0.3 + j * 0.15, { width: 0 }, { width: 250, duration: T('q3', '互不干扰') - T('q3') - 0.3, ease: 'none' }));
  const dBox = cards[3].querySelector('.box'), dArr = cards[3].querySelector('.mono');   // D：提交之后落到磁盘
  vanish(dArr, 0); appear(dArr, T('q4', '提交')); wipe(dBox, T('q4', '提交') + 0.2, { dir: 'l', d: 0.4 });
  const dOk = h('div', 'mono c-main', dBox, '✓'); css(dOk, { position: 'absolute', right: '-2px', top: '-50px', fontSize: '34px' });
  vanish(dOk, 0); slam(dOk, T('q4', '不会丢'), { from: 1.6 }); sfx('pop', T('q4', '不会丢'), { g: 0.5 });
  // A、I、D 连回三个问题；C 退到背景
  const QN = [['撤回', '<span class="mini b">42</span><span class="mini w">43</span><span class="mono c-main" style="font-size:28px">↶</span>'],
    ['同时读写', '<span class="mini b">Alice 改</span><span class="mini b" style="background:var(--panel);color:var(--main)">Bob 读</span>'],
    ['停下之后', '<span class="mini b" style="font-family:Mono">COMMIT</span><span class="mono c-acc" style="font-size:28px">⚡</span>']];
  const map = [0, 2, 3];                                   // A → 撤回，I → 同时读写，D → 停下之后
  const qcards = QN.map(([t, pic], i) => {
    const x = 140 + map[i] * 418;
    const c = h('div', 'card s2-q', W, `<div class="ct" style="font-size:34px">${t}</div><div class="cs">${pic}</div>`); px(c, x, 740, 386);
    const p = path(ov, `M${x + 193},${662} L${x + 193},${736}`, 'main', { w: 3 });
    const tq = T('q5', ['A', 'I', 'D'][i]);
    arrowIn(p, tq - 0.1, 0.35); slide(c, tq, { y: 24 }); sfx('pop', tq, { g: 0.45 });
    return [c, p];
  });
  wipe(acid, T('t11', 'ACID') - 0.1, { dir: 'l', d: 0.5 }); sfx('thud', T('t11', 'ACID'));
  wipe(quote, T('t12') - 0.1, { dir: 'l', d: 0.9 }); show(quoteZ, T('t12', '可靠'), { y: 10, d: 0.5 });
  to(cards[1], T('q5'), { opacity: 0.4, duration: 0.4 });

  // 引向下一章：数据放在哪里
  const out4 = T('q6') + 1.2;
  [acid, quote, quoteZ, ...cards, ...qcards.map((q) => q[0])].forEach((e, i) => s2_out(e, out4 + (i % 4) * 0.04, { y: -16, d: 0.35 }));
  qcards.forEach(([, p]) => svgOut(p, out4, 0.25));
  // 一个 .ibd 文件，一页一页：讲到「放在哪里」时页一格格亮起
  const ibd = boxEl(W, 610, 330, 700, 300, 'users.ibd');
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) cells.push(sq(ibd, 40 + c * 64, 76 + r * 64, null, ''));
  const qm = h('div', 'abs', W, '<span style="font:800 96px Inter;color:var(--mainD)">?</span>'); px(qm, 1340, 380);
  wipe(ibd, out4 + 0.4, { dir: 'b', d: 0.6 }); sfx('whoosh', out4 + 0.4, { g: 0.4 });
  const tc0 = out4 + 1.0, tc1 = Tend('q6'); let lastC = -1;
  F((t) => { const k = Math.round(cells.length * clamp((t - tc0) / (tc1 - tc0))); if (k === lastC) return; lastC = k; cells.forEach((e, i) => e.classList.toggle('on', i < k)); });
  slam(qm, T('q6', '放在哪里'), { from: 1.5 });
  W.appendChild(ov);
});
