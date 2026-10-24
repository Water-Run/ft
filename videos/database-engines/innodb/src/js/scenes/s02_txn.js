// 第 02 章：什么是事务。
// 一、两句 UPDATE 被一个框捆成整体，分出两条路：COMMIT 那一路修改全部生效、别人也看得到；ROLLBACK 那一路全部撤回（M23）。
// 二、平时每一句自己就是一个事务，执行完自动提交（M24，autocommit = 1，G6）。
// 三、管理员一句 UPDATE 改 4096 行：64×64 的格子一格格变成未提交的斜纹，停在第 258 行（R1，第 08 章用实测回答）。
// 四、ACID 四张小卡（M25、M26、M23），A、I、D 连回三个问题；最后引向「数据放在哪里」。
scene('s2', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  drift3(makeCamera(W), s, 1);            // 缓慢漂移（parts.js）
  // 退场：和 exit() 一样，但不带 overwrite（overwrite 会在倒着 seek 时吃掉同一元素先前的显隐补间）
  const s2_out = (e, t, o = {}) => tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y != null ? o.y : -14, duration: o.d || 0.35, ease: 'power2.in' }, t);
  const st = h('style', '', W);
  const drift = (e, t0, t1, k = 1.025) => tl.fromTo(e, { scale: 1 }, { scale: k, duration: Math.max(0.5, t1 - t0), ease: 'none', immediateRender: false }, t0);   // 读卡片时慢慢推近
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
  to(era, Tend('t0b') - 0.2, { opacity: 0.35, duration: 0.5 }); tl.to(eArr, { opacity: 0.35, duration: 0.5 }, Tend('t0b') - 0.2);
  s2_out(era, T('t0c') - 0.4, { y: 12, d: 0.35 }); svgOut(eArr, T('t0c') - 0.4, 0.3);
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
  drift(who, T('t0b') + 0.5, T('t0d'), 1.02);
  wipe(qt, T('t0c') - 0.2, { dir: 'l', d: 0.8 });
  st.textContent += '.s2-uw.on { background: #DCEFF1; color: var(--mainD); font-weight: 700; }';
  lit(qt.querySelector('.s2-uw'), 'on', T('t0c', '工作单位'));
  const qtZ = qt.querySelector('.gloss'); vanish(qtZ, 0); show(qtZ, T('t0c', '工作单位'), { y: 8, d: 0.4 });
  [aBox, bBox].forEach((b, i) => wipe(b, T('t0cz', '账户') - 0.3 + i * 0.15, { dir: 'l', d: 0.45 }));
  vanish(coin, 0); appear(coin, T('t0cz', '转一笔钱'));
  fromTo(coin, T('t0cz', '转一笔钱') + 0.2, { x: 0 }, { x: 760, duration: 1.4, ease: 'power2.inOut' });
  swaps(aN, [[T('t0cz', '转一笔钱') + 0.2, '0']]); swaps(bN, [[T('t0cz', '转一笔钱') + 1.6, '100']]); vanish(coin, T('t0cz', '转一笔钱') + 1.6);
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
  const noRows = rowsY.map((y, i) => { const id = h('div', 's2-row', noBox, String(ids[i])); px(id, 30, 88 + i * 62); const c = h('div', 's2-cell', noBox, String(oldV[i])); px(c, 160, 84 + i * 62); return [id, c]; });
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
  [ac, ...LA.els.names, ...LA.els.lines, ...segs.flat()].forEach((e) => s2_out(e, out2, { y: -16, d: 0.3 }));
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
  const t8 = Math.min(T('t8'), out2 - 0.25);                         // 第三节在第二节收走之前就进来                          // 第三节在第二节收走时就进来
  slide(admin, t8, { x: -30 }); typeText(big, big.innerHTML, t8 + 0.1, 48, { cursor: false });
  svgIn(grid, T('t9', '所有人') - 0.3, 0.5);
  slam(n4096, T('t9', '4096'), { from: 1.4 }); sfx('thud', T('t9', '4096'), { g: 0.5 });
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
  drift(d81, T('t11') + 0.6, T('t11d', 'ACID') + 0.9, 1.02);
  // 讲到哪个性质，卡片下面就出哪个字母：A、C、D 在 1981 年的卡下，I 在 1983 年的卡下（砖红：多出来的那一个）
  const chip = (x, l, w, cls) => { const e = h('div', 'tag' + (cls ? ' ' + cls : ''), GD, `<b style="font:800 30px Inter;margin-right:10px">${l}</b>${w}`); px(e, x, 730); css(e, { fontSize: '26px', padding: '6px 16px' }); vanish(e, 0); return e; };
  const cA = chip(140, 'A', '原子性'), cC = chip(340, 'C', '一致性'), cD = chip(540, 'D', '持久性'), cI = chip(1000, 'I', '隔离性', 'acc');
  [[cA, '原子性'], [cC, '一致性'], [cD, '持久性']].forEach(([e, w]) => { slam(e, T('t11b', w), { from: 1.3 }); sfx('pop', T('t11b', w), { g: 0.35 }); });
  slam(cI, T('t11cz', '隔离性'), { from: 1.3 }); sfx('pop', T('t11cz', '隔离性'), { g: 0.4 });
  st.textContent += ' .tag.s2-c3 { background: var(--main); }';
  [cA, cC, cD].forEach((e, i) => lit(e, 's2-c3', T('t11c', '四个性质') + i * 0.12));
  wipe(d81.querySelector('.s2-q'), T('t11b') - 0.1, { dir: 'l', d: 0.7 }); show(d81.querySelector('.s2-z'), T('t11b', '三个性质') - 0.2, { y: 8, d: 0.4 });
  const [hA, hD, hC] = d81.querySelectorAll('.s2-hl');
  lit(hA, 'on', T('t11b', '原子性')); lit(hC, 'on', T('t11b', '一致性')); lit(hD, 'on', T('t11b', '持久性'));
  // t11c：1983 年列出四个性质，多出来的隔离性标红；t11d 四个首字母、(ACID)
  slide(d83, T('t11c') + 0.1, { x: 40 }); sfx('pop', T('t11c') + 0.2, { g: 0.5 });
  show(d83.querySelector('.t-note'), T('t11c', 'Härder') - 0.1, { y: 6, d: 0.35 });
  wipe(d83.querySelector('.s2-q'), T('t11c', 'Reuter') + 0.1, { dir: 'l', d: 0.7 }); show(d83.querySelector('.s2-z'), T('t11c', 'Reuter'), { y: 8, d: 0.4 });
  drift(d83, T('t11c') + 0.6, T('t11d', 'ACID') + 0.9, 1.02);
  // t11d：四个首字母拼起来
  const acid4 = h('div', 'abs', GD, '<span style="font:800 64px Inter;color:var(--mainD);letter-spacing:.3em">A·C·I·D</span>'); px(acid4, 760, 800);
  vanish(acid4, 0); show(acid4, T('t11d', '首字母') + 0.1, { s: 0.9, y: 0, d: 0.35 }); sfx('thud', T('t11d', '首字母') + 0.1, { g: 0.4 });
  const [hI, hAcid] = d83.querySelectorAll('.s2-hl2');
  lit(hI, 'on', T('t11cz', '隔离性'));
  d83.querySelectorAll('.s2-fl').forEach((e, i) => lit(e, 'on', T('t11d', '首字母') + i * 0.3));
  lit(hAcid, 'on', T('t11d', 'ACID'));
  s2_out(GD, T('t11d', 'ACID') + 0.9, { y: -16, d: 0.35 });

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
    '<div class="sq on" style="left:0;top:20px;width:56px;height:56px"></div><div class="mono c-acc" style="position:absolute;left:84px;top:22px">' + MARK.bolt(44) + '</div><div class="mono c-main" style="position:absolute;left:150px;top:22px">' + MARK.ok(44) + '</div>',
    // I：两个会话各走各的
    '<div style="position:absolute;left:0;top:6px;width:250px;height:34px;background:var(--main)"></div><div style="position:absolute;left:0;top:52px;width:250px;height:34px;border:2px solid var(--main);background:var(--pale)"></div><div class="t-small" style="position:absolute;left:262px;top:8px">Alice</div><div class="t-small" style="position:absolute;left:262px;top:54px">Bob</div>',
    // D：提交之后落到磁盘
    '<span class="mini b" style="position:absolute;left:0;top:28px;font-family:Mono">COMMIT</span><div class="mono c-mainD" style="position:absolute;left:124px;top:22px;font-size:36px">→</div><div class="box" style="left:168px;top:4px;width:156px;height:80px"><div class="t-small" style="position:absolute;left:10px;top:24px;font-family:Mono">users.ibd</div></div>',
  ];
  const LET = [['A', '原子性', 'q1'], ['C', '一致性', 'q2'], ['I', '隔离性', 'q3'], ['D', '持久性', 'q4']];
  const cards = LET.map(([l, term, q], i) => {
    const c = h('div', 'card', W, `<div class="s2-letter">${l}</div><div class="s2-term">${term}</div><div class="s2-pic">${pics[i]}</div>`);
    px(c, 140 + i * 418, 330, 386, 330);
    slide(c, T('t11d', 'ACID') + 1.2 + i * 0.12, { y: 30 });
    // 亮起的时段：A、I、D 从讲到它起一直亮着；C 只亮到 q5（帧函数一处管，不分两次 lit）
    const a = T(q), b = i === 1 ? T('q5') : Infinity;
    let on0 = null; F((t) => { const on = t >= a && t < b; if (on !== on0) { c.classList.toggle('on', on); on0 = on; } });
    return c;
  });
  // 小图在讲到时演一遍
  const pa = cards[0].querySelectorAll('.s2-g')[0].children;              // A：左边一格格填满（全成），右边一格不动（全不成）
  const tA1 = T('q1') + 0.1, tA2 = Tend('q1') + 0.1; let lastA = -1;   // 一格格填满，填到这句说完
  F((t) => { const k = Math.round(32 * clamp((t - tA1) / Math.max(0.6, tA2 - tA1 - 0.2))); if (k === lastA) return; lastA = k; for (let i = 0; i < 32; i++) pa[i].style.background = i < k ? 'var(--main)' : ''; });
  cards[0].querySelectorAll('.s2-g')[0].classList.remove('full');
  // 两种结局各标一句：讲到「全成」「全不成」时出来
  const qA1 = h('div', 'abs t-small', cards[0], '全成'); px(qA1, 82, 282); const qA2 = h('div', 'abs t-small', cards[0], '全不成'); px(qA2, 240, 282);
  vanish(qA1, 0); show(qA1, T('q1', '全成'), { y: 6, d: 0.3 }); vanish(qA2, 0); show(qA2, T('q1', '全不成'), { y: 6, d: 0.3 });
  const [cBolt, cOk] = cards[1].querySelectorAll('.mono');               // C：崩溃来了，页仍完整
  vanish(cBolt, 0); slam(cBolt, T('q2', '崩溃'), { from: 1.8 }); vanish(cOk, 0); slam(cOk, T('q2', '错乱'), { from: 1.5 });
  const iBars = [...cards[2].querySelectorAll('.s2-pic > div')].slice(0, 2); // I：两个会话各自往前走
  iBars.forEach((b, j) => { vanish(b, 0); appear(b, T('q3') + 0.3 + j * 0.15); fromTo(b, T('q3') + 0.3 + j * 0.15, { width: 0 }, { width: 250, duration: T('q3', '互不干扰') - T('q3') - 0.3, ease: 'none' }); });   // 条子开始长之前不露出边框
  const dBox = cards[3].querySelector('.box'), dArr = cards[3].querySelector('.mono');   // D：提交之后落到磁盘
  vanish(dArr, 0); appear(dArr, T('q4', '提交')); wipe(dBox, T('q4', '提交') + 0.2, { dir: 'l', d: 0.4 });
  const dOk = h('div', 'mono c-main', cards[3], MARK.ok(44)); css(dOk, { position: 'absolute', right: '24px', top: '18px', fontSize: '48px' });   // 放在卡片右上角：放进 dBox 会被它擦除用的裁剪区切掉
  vanish(dOk, 0); slam(dOk, T('q4', '不会丢'), { from: 1.6 }); sfx('pop', T('q4', '不会丢'), { g: 0.5 });
  // A、I、D 连回三个问题；C 退到背景
  const QN = [['撤回', '<span class="mini b">42</span><span class="mini w">43</span><span class="mono c-main" style="font-size:28px">↶</span>'],
    ['同时读写', '<span class="mini b">Alice 改</span><span class="mini b" style="background:var(--panel);color:var(--main)">Bob 读</span>'],
    ['停下之后', '<span class="mini b" style="font-family:Mono">COMMIT</span><span>' + MARK.bolt(28) + '</span>']];
  const map = [0, 2, 3];                                   // A → 撤回，I → 同时读写，D → 停下之后
  const qcards = QN.map(([t, pic], i) => {
    const x = 140 + map[i] * 418;
    const c = h('div', 'card s2-q', W, `<div class="ct" style="font-size:34px">${t}</div><div class="cs">${pic}</div>`); px(c, x, 740, 386);
    const p = path(ov, `M${x + 193},${662} L${x + 193},${736}`, 'main', { w: 3 });
    const tq = T('q5', ['A', 'I', 'D'][i]);
    arrowIn(p, tq - 0.1, 0.35); slide(c, tq, { y: 24 }); sfx('pop', tq, { g: 0.45 });
    return [c, p];
  });
  wipe(acid, T('t11d', 'ACID') + 1.0, { dir: 'l', d: 0.5 }); sfx('thud', T('t11d', 'ACID') + 1.0);
  // q4b：1998 年图灵奖（K5）
  const tur = h('div', 'abs', W, '<span class="tag s2-tt2" style="position:static;font-size:26px;margin-right:16px">1998 · ACM 图灵奖</span><span class="mono s2-tq" style="font-size:22px;color:var(--ink2)">"For seminal contributions to <span class="s2-hl">database</span></span><span class="mono s2-tq2" style="font-size:22px;color:var(--ink2)"> and <span class="s2-hl">transaction processing</span> research …"</span><div class="gloss s2-tz" style="position:static;margin-top:8px">开创性贡献：数据库与事务处理研究</div>');
  px(tur, 140, 790); vanish(tur, 0); show(tur, T('q4b') + 0.1, { y: 14, d: 0.4 }); s2_out(tur, T('q5') - 0.1, { y: 10, d: 0.3 }); sfx('pop', T('q4b') + 0.2, { g: 0.5 });
  const [turQ, turZ] = [tur.querySelector('.s2-tq'), tur.querySelector('.s2-tz')];
  const turQ2 = tur.querySelector('.s2-tq2');
  vanish(turZ, 0); show(turZ, T('q4b', 'Gray'), { y: 8, d: 0.4 });
  vanish(turQ, 0); wipe(turQ, T('q4b', '数据库') - 0.2, { dir: 'l', d: 0.5 }); vanish(turQ2, 0); wipe(turQ2, T('q4b', '事务处理') - 0.1, { dir: 'l', d: 0.5 });
  const tDb = turQ.querySelector('.s2-hl'), tTp = turQ2.querySelector('.s2-hl');
  lit(tDb, 'on', T('q4b', '数据库')); lit(tTp, 'on', T('q4b', '事务处理'));
  swaps(tur.querySelector('.s2-tt2'), [[T('q4b', 'Gray') - 0.1, '1998 · ACM 图灵奖 · Jim Gray']]);
  drift(tur, T('q4b') + 0.5, T('q5') - 0.1, 1.02);
  // q4r：四个性质合在一起，为的是数据可靠——四张卡此刻都亮着，下面一道括线收成「可靠」；手册原文写在 ACID 旁边（M25）
  wipe(quote, T('q4r', '一件事') - 0.3, { dir: 'l', d: 0.9 }); show(quoteZ, T('q4r', '可靠'), { y: 10, d: 0.5 });
  const brace4 = h('div', 'abs', W); px(brace4, 140 + 193, 672, 3 * 418, 22); css(brace4, { borderLeft: '3px solid var(--main)', borderRight: '3px solid var(--main)', borderBottom: '3px solid var(--main)' });
  const rely = h('div', 'tag', W, '可靠'); px(rely, 140 + 193 + 3 * 418 / 2 - 44, 704); css(rely, { fontSize: '30px' });
  wipe(brace4, T('q4r', '合在一起'), { dir: 'l', d: 0.6 }); vanish(rely, 0); slam(rely, T('q4r', '可靠'), { from: 1.4 }); sfx('thud', T('q4r', '可靠'), { g: 0.5 });
  [brace4, rely].forEach((e) => s2_out(e, T('q5') - 0.1, { y: 10, d: 0.3 }));
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
