// 第 02 章：什么是事务。
// 一、两句 UPDATE 被一个框捆成整体，分出两条路：COMMIT 那一路修改全部生效、别人也看得到；ROLLBACK 那一路全部撤回（M23）。
// 二、平时每一句自己就是一个事务，执行完自动提交（M24，autocommit = 1，G6）。
// 三、管理员一句 UPDATE 改 4096 行：64×64 的格子一格格变成未提交的斜纹，停在第 258 行（R1，第 08 章用实测回答）。
// 四、ACID 四张小卡（M25、M26、M23），A、I、D 连回三个问题；最后引向「数据放在哪里」。
scene('s2', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, 1, ['t1', 't5', 't7', 't8', 't11', 't11d', 'q2', 'q4', 'q4b', 'q6']);              // 镜头只极慢横移（parts.js）
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


  // ── 零、事务这个概念的来历：Jim Gray 与 System R（K1、K2：ACM 图灵奖页面原文） ──
  const G0 = h('div', 'abs', W); px(G0, 0, 0, 1920, 1080); css(G0, { pointerEvents: 'none' });
  const who = h('div', 'card', G0, '<div style="font:800 64px Inter;color:var(--ink)">Jim Gray</div>'
    + '<div class="cs" style="margin-top:14px;font-size:30px">IBM 圣何塞研究所 · <span class="num">1972–1980</span></div>'
    + '<div class="cs" style="font-size:30px">关系数据库 <b style="font-family:Inter;color:var(--mainD)">System R</b></div>');
  px(who, 140, 170, 640);
  // t0：事务这个概念，比 InnoDB 早得多——一条短的年代轴：右边 1994 年 InnoDB（K6），左边七十年代
  const era = h('div', 'abs', G0); px(era, 0, 0, 1920, 1080);
  const eAx = h('div', 'abs', era); px(eAx, 240, 660, 1440, 3); css(eAx, { background: 'var(--ink)' });
  const eDot = (x) => { const d = h('div', 'abs', era); px(d, x - 9, 652, 18, 18); css(d, { background: 'var(--mainD)' }); return d; };
  const dIn = eDot(1500), d70 = eDot(420);
  const lIn = h('div', 'abs', era, '<span class="num" style="font:800 40px Inter;color:var(--mainD)">1994</span><span style="font:700 32px Inter;color:var(--ink);margin-left:14px">InnoDB</span>'); px(lIn, 1380, 584);
  const l70 = h('div', 'abs', era, '<span style="font:800 40px \'Sans SC\';color:var(--mainD)">七十年代</span><span style="font:700 32px \'Sans SC\';color:var(--ink);margin-left:14px">事务</span>'); px(l70, 330, 584);
  const eArr = path(ov, 'M1470,700 C1200,760 700,760 450,702', 'main', { w: 2.6 });
  const eGap = h('div', 'abs t-note', era, '早得多'); px(eGap, 900, 750);
  wipe(eAx, c0 + 0.05, { dir: 'l', d: 0.7 });
  vanish(dIn, 0); slam(dIn, T('t0', 'InnoDB') - 0.1, { from: 1.6 }); slide(lIn, T('t0', 'InnoDB'), { y: 12 }); sfx('tick', T('t0', 'InnoDB'), { g: 0.4 });
  arrowIn(eArr, T('t0', '早得多') - 0.4, 0.8); vanish(d70, 0); slam(d70, T('t0', '早得多') + 0.3, { from: 1.6 }); slide(l70, T('t0', '早得多') + 0.4, { y: 12 }); show(eGap, T('t0', '早得多'), { y: 8, d: 0.4 });
  to(era, T('t0b', 'IBM') + 0.6, { opacity: 0.35, duration: 0.5 }); tl.to(eArr, { opacity: 0.35, duration: 0.5 }, T('t0b', 'IBM') + 0.6);
  s2_out(era, Tend('t0b') + 0.3, { y: 12, d: 0.35 }); svgOut(eArr, Tend('t0b') + 0.3, 0.3);
  const qt = h('div', 'abs', G0, '<div class="mono" style="font-size:23px;color:var(--ink2);white-space:normal;width:960px;line-height:1.45">"He defined the transaction as a <span class="s2-uw">unit of work</span>, such as moving money from one bank account to another … either the money moves, or it stays in the original account."</div>'
    + '<div class="gloss" style="position:static;margin-top:10px;white-space:normal;width:960px">ACM 图灵奖页面：他把事务定义成一个工作单位，比如转账——要么钱转过去，要么留在原账户</div>');
  px(qt, 840, 176);
  // 转账：两个账户、一笔钱；成功是钱到了另一边，失败是钱回到原处，不会停在半路
  const acct = (x, name, v) => { const b = boxEl(G0, x, 560, 340, 200, ''); h('div', 'abs t-note', b, name).style.cssText = 'position:absolute;left:24px;top:16px'; const n = h('div', 'abs num', b, v); px(n, 24, 70); css(n, { font: '800 72px Inter', color: 'var(--mainD)' }); return [b, n]; };
  const [aBox, aN] = acct(240, '账户 A', '100'), [bBox, bN] = acct(1340, '账户 B', '0');
  const coin = h('div', 'pill fill', G0, '100'); px(coin, 620, 640); css(coin, { fontSize: '30px' });
  const mid = h('div', 'abs', G0, '<span class="pill acc" style="position:static;font-size:30px">50 ？</span><span style="margin-left:16px">' + MARK.no(40) + '</span>'); px(mid, 860, 800);
  const okL = h('div', 'abs', G0, '<span class="mini b">转过去</span>'); px(okL, 1350, 790);
  const noL = h('div', 'abs', G0, '<span class="mini b">留在原账户</span>'); px(noL, 250, 790);
  // t0b–t0e：Jim Gray 的卡片一行一行出来
  slide(who, T('t0b') - 0.1, { x: -40 }); sfx('pop', T('t0b'), { g: 0.5 });
  const [, whoL2, whoL3] = who.children;
  vanish(whoL2, 0); show(whoL2, T('t0b', 'IBM') - 0.1, { y: 8, d: 0.35 });
  vanish(whoL3, 0); show(whoL3, T('t0e', 'System') - 0.2, { y: 8, d: 0.35 });
  wipe(qt, T('t0c') - 0.2, { dir: 'l', d: 0.8 });
  st.textContent += '.s2-uw.on { background: #DCEFF1; color: var(--mainD); font-weight: 700; }';
  lit(qt.querySelector('.s2-uw'), 'on', T('t0c', '工作单位'));
  const qtZ = qt.querySelector('.gloss'); vanish(qtZ, 0); show(qtZ, T('t0c', '工作单位'), { y: 8, d: 0.4 });
  [aBox, bBox].forEach((b, i) => wipe(b, T('t0cz', '账户') - 0.3 + i * 0.15, { dir: 'l', d: 0.45 }));
  vanish(coin, 0); appear(coin, T('t0cz', '转一笔钱'));
  fromTo(coin, T('t0cz', '转一笔钱') + 0.2, { x: 0 }, { x: 760, duration: 1.4, ease: 'power2.inOut' });
  swaps(aN, [[T('t0cz', '转一笔钱') + 0.2, '0']]); swaps(bN, [[T('t0cz', '转一笔钱') + 1.2, ''], [T('t0cz', '转一笔钱') + 1.6, '100']]); vanish(coin, T('t0cz', '转一笔钱') + 1.6);   // 钱快到时 B 的 0 先收起，不被落下的钱盖住半个
  vanish(okL, 0); slam(okL, T('t0d', '转过去'), { from: 1.3 });
  vanish(noL, 0); slam(noL, T('t0d', '原账户'), { from: 1.3 });
  vanish(mid, 0); slam(mid, T('t0d', '不会'), { from: 1.3 }); sfx('error', T('t0d', '不会'), { g: 0.35 });
  const out0 = Tend('t0d') + 0.8;
  s2_out(G0, out0, { y: -16, d: 0.35 });

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
  const okMark = h('div', 's2-mark c-main', okBox, MARK.ok(40)); px(okMark, 586, 14);
  const noMark = h('div', 's2-mark c-acc', noBox, '↶'); px(noMark, 584, 12);
  const pC = h('div', 'pill fill', okBox, 'COMMIT'); px(pC, 28, 22);
  const pR = h('div', 'pill fill acc', noBox, 'ROLLBACK'); px(pR, 28, 22);
  const okRows = rowsY.map((y, i) => { const id = h('div', 's2-row', okBox, String(ids[i])); px(id, 30, 88 + i * 62); const c = h('div', 's2-cell', okBox, String(newV[i])); px(c, 160, 84 + i * 62); return [id, c]; });
  // 撤回那一支：先摆出改过的新值（斜纹），说到「撤回」时当场退回原值（R13 第 6 条）
  const tRev = T('t2', '撤回');
  const noRows = rowsY.map((y, i) => { const id = h('div', 's2-row', noBox, String(ids[i])); px(id, 30, 88 + i * 62); const c = h('div', 's2-cell', noBox, `<b>${newV[i]}</b>`); px(c, 160, 84 + i * 62);
    lit(c, 'unc', 0, tRev + i * 0.1); swaps(c, [[tRev + i * 0.1, String(oldV[i])]]); tl.fromTo(c, { scale: 1.18 }, { scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, tRev + i * 0.1); return [id, c]; });
  const bob = h('div', 'abs', okBox, '<span class="lane-name" style="position:static;margin-right:16px">Bob</span><span class="mini" style="border:2px solid var(--main);color:var(--main);font-family:Mono">SELECT</span><span class="mono" style="font-size:28px">→ 52 · 43</span>');
  px(bob, 30, 222);
  const pOk = path(ov, 'M1040,250 C1100,250 1100,300 1144,300', 'main', { w: 3 });
  const pNo = path(ov, 'M1040,330 C1100,330 1100,615 1144,615', 'acc', { w: 3 });

  const tA = out0 + 0.3;
  wipe(code, tA, { dir: 'l', d: 0.6 });
  slide(tblLab, tA + 0.3, { x: -20 });
  rowEls.forEach((r, i) => { slide(r.id, tA + 0.35 + i * 0.1, { x: -20 }); wipe(r.a, tA + 0.45 + i * 0.1, { dir: 'l', d: 0.4 }); });
  const tBind = T('t1', '捆');
  rowEls.forEach((r, i) => { appear(r.ar, T('t1', '修改') - 0.2 + i * 0.25); wipe(r.b, T('t1', '修改') - 0.1 + i * 0.25, { dir: 'l', d: 0.4 }); });   // 讲到「几个修改」时每一行改成新值
  css(brace, { background: 'rgba(0, 117, 143, 0.06)' }); wipe(brace, tBind - 0.1, { dir: 'l', d: 0.6 }); sfx('whoosh', tBind - 0.1, { g: 0.4 });
  // 两支各在自己的「要么」一出口就开始画，说到「生效」「撤回」时框已到位（R13 第 6 条）
  const tOk0 = T('t2') + 0.05, tNo0 = T('t2', '要么全部撤回') - 0.05;
  arrowIn(pOk, tOk0, 0.5); wipe(okBox, tOk0 + 0.2, { dir: 'l', d: 0.45 }); vanish(okMark, 0); slam(okMark, T('t2', '生效'));
  arrowIn(pNo, tNo0, 0.5); wipe(noBox, tNo0 + 0.2, { dir: 'l', d: 0.45 }); vanish(noMark, 0); slam(noMark, tRev + 0.15);
  sfx('pop', T('t2', '生效'), { g: 0.4 }); sfx('pop', tRev + 0.15, { g: 0.4 });
  slam(braceTag, T('t3', '整体'), { from: 1.4 }); sfx('thud', T('t3', '整体'));
  typeText(l0, '<span class="kw">START TRANSACTION</span>;', T('t4') - 0.05, 30, { cursor: false });
  // 执行光标：从 START 一行一行往下走，走到两条路的分岔口等 COMMIT 或 ROLLBACK
  const cur = h('div', 'abs', code); px(cur, 14, 18, 872, 54); css(cur, { background: 'var(--pale)' }); code.insertBefore(cur, code.firstChild);
  const tc = T('t4') + 0.6;
  vanish(cur, 0); appear(cur, tc);
  fromTo(cur, tc + 1.0, { y: 0 }, { y: 66, duration: 0.5, ease: 'power2.inOut' });
  tl.fromTo(cur, { y: 66 }, { y: 132, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tc + 2.2);   // 接着的一段不提前渲染起点
  vanish(cur, T('t5', 'COMMIT'));
  // 两条路的结果先淡淡摆出来（要么都成新值，要么都回原值），讲到 COMMIT、ROLLBACK 时各自变实
  // 两条路的结果随框一起出来，是实的（不再先淡后实）
  okRows.flat().forEach((e, i) => { vanish(e, 0); show(e, tOk0 + 0.4 + i * 0.06, { x: -12, y: 0, d: 0.35 }); });
  noRows.flat().forEach((e, i) => { vanish(e, 0); show(e, tNo0 + 0.4 + i * 0.06, { x: -12, y: 0, d: 0.35 }); });
  slam(pC, T('t5', 'COMMIT'), { from: 1.3 }); sfx('pop', T('t5', 'COMMIT'));
  okRows.forEach(([id, c], i) => { to(id, T('t5', '生效') - 0.2, { opacity: 1, duration: 0.3 }); to(c, T('t5', '生效') - 0.1 + i * 0.12, { opacity: 1, duration: 0.3 }); });
  slide(bob, T('t5', '别人'), { x: -30 }); sfx('blip', T('t5', '别人'), { g: 0.5 });
  slam(pR, T('t6', 'ROLLBACK'), { from: 1.3 }); sfx('pop', T('t6', 'ROLLBACK'));
  noRows.forEach(([id, c], i) => { to(id, T('t6', '撤回') - 0.2, { opacity: 1, duration: 0.3 }); to(c, T('t6', '撤回') - 0.1 + i * 0.12, { opacity: 1, duration: 0.3 }); });
  // 回滚时，左边表里那两格未提交的新值滑回原值底下、淡掉
  const tBack = T('t6', '做过的'), tGone = T('t6', '撤回');
  rowEls.forEach((r, i) => { tl.fromTo(r.b, { x: 0, opacity: 1 }, { x: -170, opacity: 0, duration: tGone - tBack, ease: 'power2.inOut', immediateRender: false }, tBack + i * 0.15); to(r.ar, tBack, { opacity: 0.2, duration: 0.4 }); });
  // 两条路各自亮起时，另一条退到背景
  lit(okBox, 'on', T('t5', 'COMMIT'), T('t6', 'ROLLBACK')); lit(noBox, 'on', T('t6', 'ROLLBACK'));

  const out1 = Tend('t6') + 0.25;
  [code, brace, braceTag, tblLab, okBox, noBox, ...rowEls.flatMap((r) => [r.id, r.a, r.ar])].forEach((e, i) => s2_out(e, out1 + (i % 6) * 0.03, { y: -16, d: 0.3 }));
  [pOk, pNo].forEach((p) => svgOut(p, out1, 0.25));

  // ── 二、平时：每一句自己就是一个事务，执行完自动提交 ──
  const ac = h('div', 'abs mono', W, 'mysql&gt; <span class="c-main" style="font-weight:700">SELECT</span> @@autocommit;\n<b class="c-main">1</b>'); px(ac, 140, 190); css(ac, { fontSize: '36px', lineHeight: '1.5' });
  const t7a = T('t7'), t7b = Tend('t7z');
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
  const out2 = Tend('t7z') + 0.2;
  s2_out(ac, out2 - 0.6, { y: -16, d: 0.3 });                        // 先收走 SQL：下一节的语句就打在这个位置
  [...LA.els.names, ...LA.els.lines, ...segs.flat()].forEach((e) => s2_out(e, out2, { y: -16, d: 0.3 }));
  // 播放头的显隐只由 lanes 的帧函数管（t7b 之后自己隐藏），这里不再补间，免得倒着 seek 时两边打架

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
  const tg0 = T('t9z', 'UPDATE') + 0.5, tStop = T('t10', '停');
  const ROWS_AT_KILL = D.crash.rowsAtKill;                 // 258（R1）
  const kAt = (t) => Math.round(ROWS_AT_KILL * ease.out3(clamp((t - tg0) / (tStop - tg0))));
  let lastK = -1;
  F((t) => {
    const k = t < tg0 ? 0 : kAt(t); if (k === lastK) return; lastK = k;
    const r = Math.floor(k / 64), c = k % 64;
    full.setAttribute('height', r * G.c); part.setAttribute('y', G.y + r * G.c); part.setAttribute('width', c * G.c);
    cntN.textContent = k;
  });
  const t8 = Math.min(T('t8'), out2 - 0.25);                         // 第三节在泳道收走之前就进来（SQL 已先收走，不叠字）
  slide(admin, t8, { x: -30 }); typeText(big, big.innerHTML, t8 + 0.1, 14, { cursor: false });   // 打得慢一点，随这两句一路打出来
  st.textContent += ' .sql.s2-this { background: var(--pale); outline: 2px solid var(--main); outline-offset: 8px; }';
  lit(big, 's2-this', T('t9z', '这句') - 0.1, Tend('t9z') + 0.6);   // 「比如这句 UPDATE」：说到「这句」时这一行亮起（R13 第 7 条）
  svgIn(grid, T('t8', '很多行') - 0.1, 0.6);
  tl.fromTo(grid, { opacity: 1 }, { opacity: 0.35, duration: 0.25, immediateRender: false }, T('t9', '所有人')); tl.fromTo(grid, { opacity: 0.35 }, { opacity: 1, duration: 0.35, immediateRender: false }, T('t9', '所有人') + 0.3);   // 「所有人」：4096 格整片闪一下                        // 讲到「很多行」时 4096 格就铺开
  slam(n4096, T('t9z', '4096'), { from: 1.4 }); sfx('thud', T('t9z', '4096'), { g: 0.5 });
  slide(cnt, tg0 - 0.1, { x: -20 }); slide(leg, tg0 + 0.2, { x: -20 });
  slam(stop, tStop + 0.1, { from: 1.6 }); sfx('error', tStop, { g: 0.6 });
  const out3 = Tend('t10') + 0.4;
  [admin, big, n4096, cnt, leg, stop].forEach((e, i) => s2_out(e, out3 + i * 0.03, { y: -16, d: 0.3 }));
  svgOut(grid, out3, 0.3);


  // ── 四之前：1981 年 Gray 的报告写下三个性质；1983 年 Härder 和 Reuter 列出四个性质，合称 ACID（K3、K4：原文） ──
  const GD = h('div', 'abs', W); px(GD, 0, 0, 1920, 1080); css(GD, { pointerEvents: 'none' });
  // 卡片先出题头（年份、标题、作者），原文与译文讲到时再出来
  const doc = (x, head, title, who, quote, gloss) => {
    const c = h('div', 'card', GD, `<div class="t-small" style="font-family:Inter">${head}</div><div style="font:700 30px Inter;color:var(--ink);margin-top:8px;line-height:1.25"><span class="s2-tt">${title}</span></div><div class="t-note" style="font-family:Inter;margin-top:6px">${who}</div>`
      + `<div class="mono s2-q" style="font-size:23px;color:var(--ink2);margin-top:18px;line-height:1.5;white-space:normal">${quote}</div><div class="gloss s2-z" style="position:static;margin-top:12px;white-space:normal">${gloss}</div>`);
    px(c, x, 300, 780); vanish(c.querySelector('.s2-q'), 0); vanish(c.querySelector('.s2-z'), 0); vanish(c.querySelector('.t-note'), 0); return c;
  };
  const fl = (w) => `<b class="s2-fl">${w[0]}</b>${w.slice(1)}`;
  const hl = (w, cls) => `<b class="${cls || 's2-hl'}">${w}</b>`;
  const d81 = doc(140, 'Tandem TR 81.3 · June 1981', 'The Transaction Concept: Virtues and Limitations', 'Jim Gray',
    `"A transaction is a transformation of state which has the properties of ${hl('atomicity')} (all or nothing), ${hl('durability')} (effects survive failures) and ${hl('consistency')} (a correct transformation)."`,
    '事务是一次状态的变换，具有原子性（全有或全无）、持久性（故障后仍在）和一致性（正确的变换）');
  const d83 = doc(1000, 'ACM Computing Surveys 15(4) · December 1983', 'Principles of Transaction-Oriented Database Recovery', 'Theo Härder · Andreas Reuter',
    `"These four properties, ${fl('atomicity')}, ${fl('consistency')}, <b class="s2-hl2">${fl('isolation')}</b>, and ${fl('durability')} ${hl('(ACID)', 's2-hl2')}, describe the major highlights of the transaction paradigm"`,
    '四个性质合称 ACID，概括了事务的要点');
  st.textContent += '.s2-hl { color: var(--ink2); font-weight: 500; } .s2-hl.on { color: var(--main); font-weight: 800; background: #DCEFF1; } .s2-hl2 { color: var(--ink2); font-weight: 500; } .s2-hl2.on { color: var(--acc); font-weight: 800; background: var(--accL); }'
    + ' .s2-tt.on { background: #DCEFF1; } .s2-fl { font-weight: 500; } .s2-fl.on { background: var(--teal); color: var(--ink); font-weight: 800; }';
  // t11：1981 年的报告；t11b 原文出来，三个性质按旁白的顺序标出（原文里的顺序是原子性、持久性、一致性）
  slide(d81, T('t11') + 0.1, { x: -40 }); sfx('pop', T('t11') + 0.2, { g: 0.5 });
  show(d81.querySelector('.t-note'), T('t11', 'Gray') - 0.1, { y: 6, d: 0.35 });
  lit(d81.querySelector('.s2-tt'), 'on', T('t11', '事务的概念'));
  // 讲到哪个性质，卡片下面就出哪个字母：A、C、D 在 1981 年的卡下，I 在 1983 年的卡下（砖红：多出来的那一个）
  const chip = (x, l, w, cls) => { const e = h('div', 'tag' + (cls ? ' ' + cls : ''), GD, `<b style="font:800 30px Inter;margin-right:10px">${l}</b>${w}`); px(e, x, 730); css(e, { fontSize: '26px', padding: '6px 16px' }); vanish(e, 0); return e; };
  const cA = chip(140, 'A', '原子性'), cC = chip(340, 'C', '一致性'), cD = chip(540, 'D', '持久性'), cI = chip(1000, 'I', '隔离性', 'acc');
  [[cA, '原子性'], [cC, '一致性'], [cD, '持久性']].forEach(([e, w]) => { slam(e, T('t11b', w), { from: 1.3 }); sfx('pop', T('t11b', w), { g: 0.35 }); });
  slam(cI, T('t11cz', '隔离性'), { from: 1.3 }); sfx('pop', T('t11cz', '隔离性'), { g: 0.4 });
  st.textContent += ' .tag.s2-c3 { background: var(--main); }';
  [cA, cC, cD].forEach((e, i) => lit(e, 's2-c3', T('t11c', '四个性质') + i * 0.12));
  wipe(d81.querySelector('.s2-q'), T('t11', '写下') - 0.1, { dir: 'l', d: 1.2 }); show(d81.querySelector('.s2-z'), T('t11b', '三个性质') - 0.2, { y: 8, d: 0.4 });   // 讲到「写下」时原文就展开
  const [hA, hD, hC] = d81.querySelectorAll('.s2-hl');
  lit(hA, 'on', T('t11b', '原子性')); lit(hC, 'on', T('t11b', '一致性')); lit(hD, 'on', T('t11b', '持久性'));
  // t11c：1983 年列出四个性质，多出来的隔离性标红
  slide(d83, T('t11c') + 0.1, { x: 40 }); sfx('pop', T('t11c') + 0.2, { g: 0.5 });
  show(d83.querySelector('.t-note'), T('t11c', 'Härder') - 0.1, { y: 6, d: 0.35 });
  wipe(d83.querySelector('.s2-q'), T('t11c', 'Reuter') + 0.1, { dir: 'l', d: 0.7 }); show(d83.querySelector('.s2-z'), T('t11c', 'Reuter'), { y: 8, d: 0.4 });
  const [hI, hAcid] = d83.querySelectorAll('.s2-hl2');
  lit(hI, 'on', T('t11cz', '隔离性'));
  d83.querySelectorAll('.s2-fl').forEach((e, i) => lit(e, 'on', T('t11d', '首字母') + i * 0.3));
  lit(hAcid, 'on', T('t11d', 'ACID'));

  // ── 四、ACID（R13 第 8 条：要有冲击力）──
  // t11d「首字母合起来」：两篇文献里标出的四个词飞出来，长成横跨画面的四个大字母 A C I D（按 ACID 的顺序排好），文献退成背景
  const LX4 = [420, 780, 1140, 1500], LTOP = 120;
  st.textContent += ' .s2-L { position: absolute; width: 300px; text-align: center; } .s2-L .l { font: 800 220px "Inter"; line-height: 1; color: var(--mainD); }'
    + ' .s2-L .w { font: 800 34px "Sans SC"; color: var(--ink); margin-top: 6px; } .s2-L.on .l { color: var(--main); }';
  const LET = [['A', '原子性', cA, 'q1'], ['C', '一致性', cC, 'q2'], ['I', '隔离性', cI, 'q3'], ['D', '持久性', cD, 'q4']];
  const tFly = T('t11d', '首字母');
  const Ls = LET.map(([l, w, ch], i) => {
    const e = h('div', 's2-L', W, `<div class="in"><div class="l">${l}</div><div class="w">${w}</div></div>`); px(e, LX4[i] - 150, LTOP);
    const cx = parseFloat(ch.style.left) + 75, cy = parseFloat(ch.style.top) + 24;      // 从那个词所在的位置长出来
    vanish(e, 0); appear(e, tFly + i * 0.16);
    tl.fromTo(e, { x: cx - LX4[i], y: cy - (LTOP + 130), scale: 0.16 }, { x: 0, y: 0, scale: 1, duration: 0.75, ease: 'power3.inOut', immediateRender: false }, tFly + i * 0.16);
    tl.to(ch, { autoAlpha: 0, duration: 0.12 }, tFly + i * 0.16);
    sfx('thud', tFly + i * 0.16 + 0.7, { g: 0.35 });
    return e;
  });
  [d81, d83].forEach((d) => tl.to(d, { opacity: 0.12, duration: 0.5 }, tFly + 0.9));    // 字母飞出来之后，文献再退成背景
  s2_out(GD, T('t11d', 'ACID') + 0.9, { y: -16, d: 0.35 });
  const gAcid = gloss(W, 560, 56, 'ACID', '<b>ACID</b>：Atomicity、Consistency、Isolation、Durability 四个词的首字母', { w: 1100 });   // 放在字母上方，一直留到合成「可靠」
  vanish(gAcid, 0); show(gAcid, T('t11d', 'ACID') + 0.2, { y: 10, d: 0.4 }); tl.to(gAcid, { autoAlpha: 0, duration: 0.3 }, T('q4r', '合在一起'));
  // 一次只讲一个：讲到的字母亮、名字留着；别的字母退淡、名字收起（同屏要读的字少）
  const wEls = Ls.map((e) => e.querySelector('.w')), inEls = Ls.map((e) => e.querySelector('.in'));   // 帧函数只管里层（外层有入场、移动的补间）
  const QT = [T('q1'), T('q2'), T('q3'), T('q4')], tAll = T('q4r', '合在一起');
  Ls.forEach((e, i) => {
    const a = QT[i] - 0.1, b = i < 3 ? QT[i + 1] - 0.1 : tAll;
    let last = null;
    const tDim = i === 1 ? T('q5', 'A') : Infinity;              // q5：C 不对应开头的问题，退淡
    F((t) => { const st_ = t < QT[0] - 0.1 ? 'all' : t >= tDim ? 'dim' : t >= tAll ? 'all' : t >= a && t < b ? 'on' : 'off'; if (st_ === last) return; last = st_;
      e.classList.toggle('on', st_ === 'on'); inEls[i].style.opacity = st_ === 'off' || st_ === 'dim' ? 0.25 : 1; wEls[i].style.visibility = st_ === 'off' ? 'hidden' : 'visible'; });
    sfx('pop', QT[i], { g: 0.4 });
  });
  // 舞台：每讲一个性质，下面演一遍本片自己的例子；讲完退场，下一个上来
  const stage = (i) => { const g = h('div', 'abs', W); px(g, 160, 430, 1600, 520); vanish(g, 0); show(g, QT[i] - 0.05, { y: 30, d: 0.5 }); tl.to(g, { autoAlpha: 0, y: -20, duration: 0.35 }, (i < 3 ? QT[i + 1] : T('q4r')) - 0.2); return g; };
  const cellAt = (par, x, y, v, cls = '') => { const e = h('div', 's2-cell' + (cls ? ' ' + cls : ''), par, cls === 'unc' ? `<b>${v}</b>` : String(v)); px(e, x, y); return e; };
  const label = (par, x, y, html, cls = 't-note') => { const e = h('div', 'abs ' + cls, par, html); px(e, x, y); return e; };

  // A：一个事务里改两行——要么两行都成新值（全成），要么都回原值（全不成），不会只成一半（M23、M25）
  { const g = stage(0), o = overlay(g);
    const blk = h('div', 'abs', g); px(blk, 20, 70, 520, 210); css(blk, { border: '3px solid var(--main)', background: 'rgba(0,117,143,.05)' });
    const bt = h('div', 'tag', blk, '一个事务'); px(bt, -3, -34); css(bt, { background: 'var(--main)', fontSize: '24px' });
    [[2049, 51, 52], [2050, 42, 43]].forEach(([id, a, b], k) => { label(blk, 26, 46 + k * 78, String(id), 's2-row'); cellAt(blk, 130, 40 + k * 78, a); label(blk, 252, 44 + k * 78, '→', 's2-arrow'); cellAt(blk, 300, 40 + k * 78, b, 'unc'); });
    const out = (x, y, title, vals, cls) => { const b = h('div', 'box', g); px(b, x, y, 330, 170); label(b, 24, 16, title, 't-h' + (cls ? ' ' + cls : '')); vals.forEach((v, k) => cellAt(b, 24 + k * 130, 92, v)); return b; };
    const ok = out(700, 0, '全成', [52, 43], 'c-main'), no = out(700, 230, '全不成', [51, 42], 'c-main');
    const half = h('div', 'box', g); px(half, 1180, 115, 330, 170); css(half, { borderStyle: 'dashed', borderColor: 'var(--acc)' });
    label(half, 24, 16, '只成一半', 't-h c-acc'); cellAt(half, 24, 92, 52); cellAt(half, 154, 92, 42);
    const hx = h('div', 'abs', half, MARK.no(64)); px(hx, 250, 6);
    const p1 = path(o, 'M540,140 C620,140 620,85 696,85', 'main', { w: 3 }), p2 = path(o, 'M540,210 C620,210 620,315 696,315', 'main', { w: 3 });
    const pH = path(o, 'M1034,200 L1176,200', 'acc', { w: 2.4, dashed: '7 6' });
    [ok, no, half].forEach((e) => vanish(e, 0));
    arrowIn(p1, T('q1', '全成') - 0.2, 0.4); show(ok, T('q1', '全成'), { x: -20, y: 0, d: 0.4 }); sfx('pop', T('q1', '全成'), { g: 0.4 });
    arrowIn(p2, T('q1', '全不成') - 0.2, 0.4); show(no, T('q1', '全不成'), { x: -20, y: 0, d: 0.4 }); sfx('pop', T('q1', '全不成'), { g: 0.4 });
    pH.setAttribute('opacity', 0); tl.to(pH, { opacity: 1, duration: 0.3 }, T('q1', '全不成') + 0.35); show(half, T('q1', '全不成') + 0.4, { x: -20, y: 0, d: 0.4 }); sfx('error', Tend('q1') + 0.3, { g: 0.35 });
    const gA = gloss(g, 20, 420, '', '<b>原子性</b>：一组修改不会只成一半', { w: 1100 });
    vanish(gA, 0); show(gA, T('q1') + 0.1, { y: 8, d: 0.4 }); }

  // C：改到一半断电，重启后不留半截（R1：改到第 258 行时结束进程；R4：重启后被改过的 0 行）
  { const g = stage(1);
    const grid = (x, title) => { const b = h('div', 'abs', g); px(b, x, 0); label(b, 0, 0, title, 't-note');
      const s_ = svg('svg', { width: 64 * 6 + 2, height: 64 * 6 + 2, style: 'position:absolute;left:0;top:44px' }, b);
      s_.innerHTML = `<defs><pattern id="s2gC${x}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6,0 L0,0 L0,6" fill="none" stroke="#9CB7BC" stroke-width="1"/></pattern></defs><rect x="1" y="1" width="384" height="384" fill="#FFFFFF" stroke="#2D5A68" stroke-width="2"/><rect class="f" x="1" y="1" width="384" height="0" fill="url(#hatch)"/><rect class="p" x="1" y="1" width="0" height="6" fill="url(#hatch)"/><rect x="1" y="1" width="384" height="384" fill="url(#s2gC${x})"/>`;
      return { b, f: s_.querySelector('.f'), p: s_.querySelector('.p') }; };
    const L = grid(40, '改到第 258 行时断电'), R = grid(820, '重启之后');
    const KILL = D.crash.rowsAtKill, tg0 = T('q2') + 0.15, tg1 = T('q2', '崩溃');
    let lastK = -1;
    F((t) => { const k = t < tg0 ? 0 : Math.round(KILL * ease.out3(clamp((t - tg0) / Math.max(0.4, tg1 - tg0)))); if (k === lastK) return; lastK = k;
      const r = Math.floor(k / 64), c = k % 64; L.f.setAttribute('height', r * 6); L.p.setAttribute('y', 1 + r * 6); L.p.setAttribute('width', c * 6); });
    const bolt = h('div', 'abs', g, MARK.bolt(96)); px(bolt, 480, 170); vanish(bolt, 0); slam(bolt, tg1, { from: 1.8 }); sfx('error', tg1, { g: 0.5 });
    const arr = h('div', 'abs mono c-mainD', g, '→'); px(arr, 640, 190); css(arr, { fontSize: '64px' }); vanish(arr, 0); appear(arr, tg1 + 0.35);
    vanish(R.b, 0); show(R.b, tg1 + 0.25, { x: -20, y: 0, d: 0.4 });
    const ok = h('div', 'abs', g, MARK.ok(72)); px(ok, 1230, 190); vanish(ok, 0); slam(ok, T('q2', '错乱'), { from: 1.5 }); sfx('pop', T('q2', '错乱'), { g: 0.45 });
    const res = label(g, 1230, 290, '被改过的：0 行', 't-note'); vanish(res, 0); show(res, tg1 + 0.5, { y: 8, d: 0.35 });
    const gC = gloss(g, 40, 450, '', '<b>一致性</b>：崩溃也不留半截（实测）', { w: 1300 });
    vanish(gC, 0); show(gC, T('q2') + 0.1, { y: 8, d: 0.4 }); }

  // I：Alice 改了还没提交，Bob 同时来读，读到的仍是 42（X3）
  { const g = stage(2);
    const lane = (y, name) => { label(g, 0, y - 16, name, 'lane-name'); const l = h('div', 'abs', g); px(l, 150, y, 1300, 2); css(l, { background: 'var(--edge)' }); };
    lane(80, 'Alice'); lane(230, 'Bob');
    const tI0 = T('q3') + 0.2, tI1 = T('q3', '互不干扰');
    const aOld = h('div', 'vbar', g, '42'); px(aOld, 160, 58, 200);
    const aU = h('div', 'pill fill acc', g, 'UPDATE 43'); px(aU, 380, -2);
    const aNew = h('div', 'vbar unc', g, '<span>43 · 还没提交</span>'); px(aNew, 370, 58, 0);
    const bR = h('div', 'pill', g, '读'); px(bR, 700, 200);
    const bV = h('div', 's2-cell', g, '42'); px(bV, 780, 196);
    const bOk = h('div', 'abs', g, MARK.ok(52)); px(bOk, 900, 194);
    [aU, aNew, bR, bV, bOk].forEach((e) => vanish(e, 0)); appear(aNew, tI0 + 0.2);
    slam(aU, tI0, { from: 1.3 }); fromTo(aNew, tI0 + 0.2, { width: 0 }, { width: 760, duration: Math.max(0.8, tI1 - tI0), ease: 'none' });
    slam(bR, T('q3', '同时'), { from: 1.3 }); slam(bV, T('q3', '同时') + 0.4, { from: 1.4 }); sfx('blip', T('q3', '同时') + 0.4, { g: 0.4 });
    slam(bOk, tI1, { from: 1.5 }); sfx('pop', tI1, { g: 0.45 });
    const note = label(g, 1000, 206, '看不到 Alice 没提交的 43', 't-note'); vanish(note, 0); show(note, T('q3', '同时') + 0.6, { y: 8, d: 0.35 });
    const gI = gloss(g, 0, 420, '', '<b>隔离性</b>：没提交的修改，别人看不到', { w: 1300 });
    vanish(gI, 0); show(gI, T('q3') + 0.1, { y: 8, d: 0.4 }); }

  // D：提交之后断电，重启后还在（R1、R4：断电前已提交的 Alice 43，重启后仍是 43）
  { const g = stage(3);
    const step = (x, html, w = 240) => { const b = h('div', 'box', g); px(b, x, 60, w, 150); const c = h('div', 'abs', b, html); px(c, 0, 0, w, 150); css(c, { display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }); vanish(b, 0); return b; };
    const s1 = step(0, '<span class="pill fill" style="position:static;font-size:30px">COMMIT</span>');
    const s2 = step(330, '<div><div class="t-small mono">users</div><div class="mono" style="font-size:30px">2050 Alice <b class="c-main">43</b></div></div>', 300);
    const s3 = step(720, MARK.bolt(84), 170);
    const s4 = step(980, '<span class="t-h">重启</span>', 170);
    const s5 = step(1240, '<div><div class="mono" style="font-size:30px">2050 Alice <b class="c-main">43</b></div><div style="margin-top:8px">' + MARK.ok(44) + '</div></div>', 300);
    const arrs = [[240, 330], [630, 720], [890, 980], [1150, 1240]].map(([a, b]) => { const e = h('div', 'abs mono c-mainD', g, '→'); px(e, a + 22, 100); css(e, { fontSize: '48px' }); vanish(e, 0); return e; });
    const tD0 = T('q4', '提交'), tD1 = T('q4', '不会丢');
    show(s1, tD0 - 0.2, { x: -20, y: 0, d: 0.35 }); appear(arrs[0], tD0 + 0.2); show(s2, tD0 + 0.25, { x: -20, y: 0, d: 0.35 });
    appear(arrs[1], tD0 + 0.6); show(s3, tD0 + 0.65, { s: 1.4, y: 0, d: 0.3 }); sfx('error', tD0 + 0.65, { g: 0.45 });
    appear(arrs[2], tD1 - 0.5); show(s4, tD1 - 0.45, { x: -20, y: 0, d: 0.3 });
    appear(arrs[3], tD1 - 0.1); show(s5, tD1, { x: -20, y: 0, d: 0.35 }); sfx('pop', tD1 + 0.1, { g: 0.5 });
    const gD = gloss(g, 0, 420, '', '<b>持久性</b>：提交了的，断电重启后还在', { w: 1300 });
    vanish(gD, 0); show(gD, T('q4') + 0.1, { y: 8, d: 0.4 }); }

  // q4r：四个字母撞到一起合成一块，落下「可靠」（M25 手册原文写在下面）
  const LXc = [748, 914, 1040, 1170];                       // 220px Inter 粗体时四个字母挨着排的中心（A、C 宽，I 窄）
  Ls.forEach((e, i) => { tl.fromTo(e, { x: 0 }, { x: LXc[i] - LX4[i], duration: 0.55, ease: 'power3.in', immediateRender: false }, tAll); });
  wEls.forEach((w) => tl.to(w, { opacity: 0, duration: 0.25 }, tAll));
  sfx('thud', tAll + 0.55, { g: 0.6 });
  const rely = h('div', 'abs', W, '<span style="font:900 120px \'Sans SC\';color:#fff;background:var(--mainD);padding:4px 40px;display:inline-block;line-height:1.15">可靠</span>'); px(rely, 960 - 160, 420);
  vanish(rely, 0); slam(rely, T('q4r', '可靠'), { from: 1.5 }); sfx('thud', T('q4r', '可靠'), { g: 0.6 });
  const gRely = gloss(W, 560, 620, '可靠', '<b>可靠</b>：手册说 ACID「着眼于可靠性」', { w: 800 });
  vanish(gRely, 0); show(gRely, T('q4r', '可靠') + 0.1, { y: 10, d: 0.4 });
  [rely, gRely].forEach((e) => tl.to(e, { autoAlpha: 0, duration: 0.3 }, T('q5') - 0.15));   // 一直留到图灵奖讲完
  // q4b：1998 年图灵奖（K5）
  const tur = h('div', 'abs', W, '<span class="tag s2-tt2" style="position:static;font-size:26px;margin-right:16px">1998 · ACM 图灵奖</span><span class="mono s2-tq" style="font-size:22px;color:var(--ink2)">"For seminal contributions to <span class="s2-hl">database</span></span><span class="mono s2-tq2" style="font-size:22px;color:var(--ink2)"> and <span class="s2-hl">transaction processing</span> research …"</span><div class="gloss s2-tz" style="position:static;margin-top:8px">开创性贡献：数据库与事务处理研究</div>');
  px(tur, 300, 720); vanish(tur, 0); show(tur, T('q4b') + 0.1, { y: 14, d: 0.4 }); tl.fromTo(rely, { opacity: 1 }, { opacity: 0.3, duration: 0.5, immediateRender: false }, T('q4b', '研究')); tl.to(tur, { autoAlpha: 0, duration: 0.3 }, T('q5') - 0.15); sfx('pop', T('q4b') + 0.2, { g: 0.5 });   // 讲到图灵奖这件事时，「可靠」退成背景
  const [turQ, turZ] = [tur.querySelector('.s2-tq'), tur.querySelector('.s2-tz')];
  const turQ2 = tur.querySelector('.s2-tq2');
  vanish(turZ, 0); show(turZ, T('q4b', 'Gray'), { y: 8, d: 0.4 });
  vanish(turQ, 0); wipe(turQ, T('q4b', '数据库') - 0.2, { dir: 'l', d: 0.5 }); vanish(turQ2, 0); wipe(turQ2, T('q4b', '事务处理') - 0.1, { dir: 'l', d: 0.5 });
  const tDb = turQ.querySelector('.s2-hl'), tTp = turQ2.querySelector('.s2-hl');
  lit(tDb, 'on', T('q4b', '数据库')); lit(tTp, 'on', T('q4b', '事务处理'));
  swaps(tur.querySelector('.s2-tt2'), [[T('q4b', 'Gray') - 0.1, '1998 · ACM 图灵奖 · Jim Gray']]);
  // q5：字母散回原位；A、I、D 下面各接回开头的一个问题，C 退淡
  const tQ5 = T('q5');
  Ls.forEach((e, i) => { tl.fromTo(e, { x: LXc[i] - LX4[i] }, { x: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tQ5 - 0.1); });
  const QN = [['撤回', '<span class="mini b">42</span><span class="mini w">43</span><span class="mono c-main" style="font-size:28px">↶</span>'],
    ['同时读写', '<span class="mini b">Alice 改</span><span class="mini b" style="background:var(--panel);color:var(--main)">Bob 读</span>'],
    ['停下之后', '<span class="mini b" style="font-family:Mono">COMMIT</span><span>' + MARK.bolt(28) + '</span>']];
  const map = [0, 2, 3];                                   // A → 撤回，I → 同时读写，D → 停下之后
  const qcards = QN.map(([t, pic], i) => {
    const x = LX4[map[i]] - 170;
    const c = h('div', 'card s2-q', W, `<div class="ct" style="font-size:34px">${t}</div><div class="cs">${pic}</div>`); px(c, x, 480, 340);
    const p = path(ov, `M${LX4[map[i]]},${404} L${LX4[map[i]]},${474}`, 'main', { w: 3 });
    const tq = T('q5', ['A', 'I', 'D'][i]);
    arrowIn(p, tq - 0.1, 0.35); slide(c, tq, { y: 24 }); sfx('pop', tq, { g: 0.45 });
    return [c, p];
  });

  const out4 = T('q6') + 0.25;
  [...Ls, ...qcards.map((q) => q[0])].forEach((e, i) => tl.to(e, { autoAlpha: 0, y: -16, duration: 0.35 }, out4 + (i % 4) * 0.04));
  qcards.forEach(([, p]) => svgOut(p, out4, 0.25));
  const OG = h('div', 'abs', W); px(OG, 0, 0, 1920, 1080); css(OG, { pointerEvents: 'none' }); vanish(OG, 0); show(OG, out4 + 0.1, { y: 0, d: 0.4 });   // 这一屏之前整组藏着
  // ── q6：引向下一章（R14：要契合数据的逻辑结构、有规模、井井有条）——4096 行按逐行插入的实测（D.growth）同时长成两棵树：
  // 主键树按编号、姓名索引按名字，新行都接在最右边那页叶子；页满了就从文件里取下一个空页（T10），所以下面的文件页条里两棵树的页交替出现 ──
  const tS0 = T('q6') + 0.5, tS1 = Tend('q6') + 1.9;
  const nRows = (t) => Math.round(4096 * Math.pow(clamp((t - tS0) / (tS1 - tS0)), 1.7));
  const GE = (ix) => D.growth.filter((e) => e.index === ix);
  const PE = GE('PRIMARY'), NE = GE('idx_name');
  const pkSt = (n) => { if (n < 208) return null; let e = PE[0]; for (const x of PE) if (x.row <= n) e = x;
    const c = { ...e.pages }; delete c[4]; const ex = PK_LEAVES.filter((p) => c[p] != null); c[ex[ex.length - 1]] += n - e.row; return c; };
  const nmSt = (n) => { if (n < 274) return null; let e = NE[0]; for (const x of NE) if (x.row <= n) e = x;
    const c = { ...e.pages }; delete c[5]; const ex = NM_LEAVES.filter((p) => c[p] != null); const al = e.row < 2050 && n >= 2050 ? 1 : 0;
    c[ex[ex.length - 1]] += n - e.row - al; c[9] += al; return c; };
  const LX6 = (k) => 260 + k * 66, LW6 = 54;
  const tree6 = (rootY, leafY, leafH, list, cls) => {
    const root = h('div', 'abs', OG); px(root, LX6(0), rootY, LW6, 40); css(root, { background: cls.root, border: `1.5px solid ${cls.root}` });
    const items = list.map((pg, k) => {
      const stem = h('div', 'abs', OG); px(stem, LX6(k) + LW6 / 2 - 1, rootY + 40, 2, leafY - rootY - 40); css(stem, { background: cls.root });
      const box = h('div', 'abs', OG); px(box, LX6(k), leafY, LW6, leafH); css(box, { border: `1.5px solid ${cls.root}`, background: 'var(--panel)', overflow: 'hidden' });
      const fill = h('div', 'abs', box); css(fill, { left: '0', right: '0', bottom: '0', background: cls.fill });
      const no = h('div', 'abs num', OG, String(pg)); px(no, LX6(k) - 6, leafY + leafH + 6, LW6 + 12); css(no, { textAlign: 'center', font: '600 22px Inter', color: cls.root });
      return { stem, box, fill, no };
    });
    return { root, items };
  };
  const PT = tree6(170, 236, 96, PK_LEAVES, { root: 'var(--mainD)', fill: 'var(--teal)' });
  const NT = tree6(400, 466, 84, NM_LEAVES, { root: 'var(--main)', fill: '#CFE6EB' });
  const tagP = h('div', 'tag', OG, '主键树'); px(tagP, 96, 176); css(tagP, { fontSize: '26px', background: 'var(--mainD)' });
  const tagN = h('div', 'tag', OG, '姓名索引'); px(tagN, 86, 406); css(tagN, { fontSize: '26px', background: 'var(--main)' });
  const sub6 = h('div', 'abs t-small', OG, '按编号排'); px(sub6, 96, 224);
  const sub6n = h('div', 'abs t-small', OG, '按名字排'); px(sub6n, 86, 454);
  // 文件：49 页按页号排成一条
  const fT = h('div', 'abs mono', OG, 'users.ibd'); px(fT, 150, 596); css(fT, { fontSize: '30px', fontWeight: 700 });
  const FX6 = 150, FW6 = 34, FY6 = 640, FH6 = 190;
  const fcs = [...Array(D.file.pages)].map((_, p) => { const c = h('div', 'abs', OG); px(c, FX6 + p * FW6, FY6, FW6 - 4, FH6); css(c, { overflow: 'hidden' }); c.dataset.name = '页' + p; const f = h('div', 'abs', c); css(f, { left: '0', right: '0', bottom: '0', height: '0' }); c.fill = f; return c; });
  const fticks = [0, 8, 16, 24, 32, 40, 48].map((p) => { const e = h('div', 'abs num', OG, String(p)); px(e, FX6 + p * FW6 + 15 - 23, FY6 + FH6 + 8, 46); css(e, { textAlign: 'center', font: '500 22px Inter', color: 'var(--ink2)' }); return e; });
  // 计数：行、页
  const cR = h('div', 'abs', OG); px(cR, 1690, 200); const cRN = h('div', 'num', cR, '0'); css(cRN, { font: '800 60px Inter', color: 'var(--main)' }); h('div', 't-small', cR, '行');
  const cP = h('div', 'abs', OG); px(cP, 1690, 420); const cPN = h('div', 'num', cP, '7'); css(cPN, { font: '800 52px Inter', color: 'var(--mainD)' }); h('div', 't-small', cP, '页');
  // 行：每一行从根页往下落进此刻最右边的那页叶子（编号、名字都是递增插入的，新行总在最右边）
  const DASH = 12, dashes = [...Array(DASH * 2)].map((_, j) => { const e = h('div', 'abs', OG); css(e, { height: '22px', width: '4px', background: j < DASH ? 'var(--mainD)' : 'var(--main)' }); return e; });
  let last6 = '';
  F((t) => {
    const n = t < tS0 ? 0 : nRows(t), on = t >= tS0 && n < 4096, a = pkSt(n), b = nmSt(n), up = n >= 208;
    const key = n + ':' + (on ? Math.round(t * 30) : -1); if (key === last6) return; last6 = key;
    let kP = 0, kN = 0;
    PT.items.forEach((it, k) => { const v = a ? a[PK_LEAVES[k]] : null, vis = v != null; if (vis) kP = k + 1;
      [it.stem, it.box, it.no].forEach((e) => { e.style.visibility = vis ? 'visible' : 'hidden'; }); if (vis) it.fill.style.height = (100 * v / 207).toFixed(1) + '%'; });
    NT.items.forEach((it, k) => { const v = b ? b[NM_LEAVES[k]] : null, vis = v != null; if (vis) kN = k + 1;
      [it.stem, it.box, it.no].forEach((e) => { e.style.visibility = vis ? 'visible' : 'hidden'; }); if (vis) it.fill.style.height = (100 * v / 273).toFixed(1) + '%'; });
    // 根页：分裂之前它自己就是唯一的一页，之后横跨下面的叶子、只记路标
    PT.root.style.width = (kP ? LX6(kP - 1) + LW6 - LX6(0) : LW6) + 'px'; PT.root.style.visibility = t >= tS0 ? 'visible' : 'hidden';
    NT.root.style.width = (kN ? LX6(kN - 1) + LW6 - LX6(0) : LW6) + 'px'; NT.root.style.visibility = t >= tS0 ? 'visible' : 'hidden';
    // 文件页条：0–3 文件自用；4 主键根（分裂前是装行的页）；5 姓名索引的根；6 年龄索引的根（T10）；其余按两棵树此刻占用的页上色
    let maxP = 6, used = 7;
    fcs.forEach((c, p) => { if ((a && a[p] != null) || (b && b[p] != null)) maxP = Math.max(maxP, p); });
    fcs.forEach((c, p) => {
      let bg = 'transparent', bd = 'var(--edge)', st_ = 'dashed', lv = 1;   // lv：页里装了多少（叶子按实测行数，其余整页上色）
      if (p < 4) { bg = 'var(--band)'; st_ = 'solid'; }
      else if (p === 4) { bg = up ? 'var(--mainD)' : 'var(--teal)'; bd = 'var(--mainD)'; st_ = 'solid'; if (!up) lv = n / 207; }
      else if (p === 5) { bg = n < 274 ? '#CFE6EB' : 'var(--main)'; bd = 'var(--main)'; st_ = 'solid'; if (n < 274) lv = n / 273; }
      else if (p === 6) { bg = 'var(--mute)'; bd = bg; st_ = 'solid'; }
      else if (a && a[p] != null) { bg = 'var(--teal)'; bd = 'var(--mainD)'; st_ = 'solid'; lv = a[p] / 207; }
      else if (b && b[p] != null) { bg = '#CFE6EB'; bd = 'var(--main)'; st_ = 'solid'; lv = b[p] / 273; }
      else if (p < maxP || n >= 4096) { bg = 'var(--panel)'; st_ = 'solid'; }
      if (st_ === 'solid') used = Math.max(used, p + 1);
      css(c, { background: st_ === 'solid' ? 'var(--panel)' : 'transparent', border: `2px ${st_} ${bd}` }); c.fill.style.background = bg; c.fill.style.height = (st_ === 'solid' ? Math.min(100, 100 * lv) : 0).toFixed(1) + '%';
    });
    cRN.textContent = n.toLocaleString('en-US').replace(',', ' '); cPN.textContent = n >= 4096 ? D.file.pages : used;
    const xP = LX6(Math.max(0, kP - 1)) + LW6 / 2, xN = LX6(Math.max(0, kN - 1)) + LW6 / 2;
    dashes.forEach((e, j) => { const top = j < DASH, i = top ? j : j - DASH, ph = ((t - tS0) * 1.8 + i / DASH) % 1;
      const x = (top ? xP : xN) + (((i * 37) % 7) - 3) * 5 - 2, y = lerp(top ? 110 : 350, top ? 262 : 488, ph);
      e.style.visibility = on ? 'visible' : 'hidden'; e.style.left = x.toFixed(0) + 'px'; e.style.top = y.toFixed(0) + 'px'; e.style.opacity = (0.3 + 0.7 * Math.sin(Math.PI * ph)).toFixed(2); });
  });
  [tagP, tagN, sub6, sub6n, fT, cR, cP].forEach((e, i) => { vanish(e, 0); show(e, out4 + 0.2 + (i % 4) * 0.08, { y: 8, d: 0.35 }); });
  fticks.forEach((e) => { vanish(e, 0); appear(e, out4 + 0.3); });
  [PE[0].row, NE[0].row, ...PE.slice(1, 4).map((e) => e.row)].forEach((r) => sfx('tick', tS0 + (tS1 - tS0) * Math.pow(r / 4096, 1 / 1.7), { g: 0.35 }));
  // 图例（与第 03 章同一套颜色）
  const chip6 = (bg, bd) => `<span style="display:inline-block;width:20px;height:20px;background:${bg};border:1.5px solid ${bd};vertical-align:-3px;margin:0 6px 0 18px"></span>`;
  const legend = h('div', 'abs t-small', OG, chip6('var(--band)', 'var(--edge)') + '文件自用' + chip6('var(--mainD)', 'var(--mainD)').replace('margin:0 6px 0 18px', 'margin:0 2px 0 18px') + chip6('var(--teal)', 'var(--mainD)') + '主键树'
    + chip6('var(--main)', 'var(--main)').replace('margin:0 6px 0 18px', 'margin:0 2px 0 18px') + chip6('#CFE6EB', 'var(--main)') + '姓名索引' + chip6('var(--mute)', 'var(--mute)') + '别的索引' + chip6('var(--panel)', 'var(--edge)') + '其他');
  px(legend, 132, 880); css(legend, { whiteSpace: 'nowrap' });
  vanish(legend, 0); show(legend, tS0 + 0.4, { y: 8, d: 0.4 });
  W.appendChild(ov);
});
