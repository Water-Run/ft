// 开场：回顾 MyISAM（两个文件、索引存行的位置、三处做不到）→ 同样三句 SQL 在两张表上回滚，一张撤回、一张撤不回
// → 片名落在 InnoDB 的架构图上 → 架构图里哪些部件补上了那三处。
// 每一段放在自己的容器里，整段退场时动容器（容器里有帧函数管显隐的版本条、播放头，不能对它们单独做退场补间）。
scene('intro', ({ root, s }) => {
  const W = h('div', 'world', root);
  const part = () => { const g = h('div', 'abs', W); px(g, 0, 0, 1920, 1080); css(g, { pointerEvents: 'none' }); return g; };
  const fileSize = (n) => D.files.find((f) => f.file === n).bytes.toLocaleString('en-US').replace(/,/g, ' ');

  // ── 一、MyISAM：两个文件（V1、V2、G7） ──
  const A = part();
  const ovA = overlay(A);
  const myd = h('div', 'box', A); px(myd, 150, 150, 760, 600);
  h('div', 'abs', myd, `<span class="mono" style="font-size:34px;font-weight:700">users.MYD</span>`).style.cssText = 'position:absolute;left:28px;top:22px';
  const mydS = h('div', 'abs t-small num', myd, fileSize('users_myisam.MYD') + ' 字节'); px(mydS, 520, 32);
  const mydTag = h('div', 'tag', myd, '数据'); px(mydTag, 340, 28);
  const age = (i) => (i === 2050 ? 42 : 18 + (i % 63));
  const nm = (i) => (i === 2050 ? 'Alice' : `User${String(i).padStart(5, '0')}-abc…`);
  const ROWS = [1, 2, 3, 4, null, 2048, 2049, 2050, 2051, 2052, null, 4095, 4096];
  const rowEls = [];
  ROWS.forEach((id, k) => {
    const r = h('div', 'abs mono', myd, id == null ? '       ⋮' : `${String(id).padStart(5)}  ${nm(id).padEnd(16)} ${age(id)}`);
    px(r, 34, 100 + k * 36); css(r, { fontSize: '25px', color: id === 2050 ? 'var(--main)' : 'var(--ink2)', fontWeight: id === 2050 ? 700 : 500 });
    rowEls.push(r);
  });
  const myi = h('div', 'box', A); px(myi, 1010, 150, 760, 600);
  h('div', 'abs', myi, `<span class="mono" style="font-size:34px;font-weight:700">users.MYI</span>`).style.cssText = 'position:absolute;left:28px;top:22px';
  const myiS = h('div', 'abs t-small num', myi, fileSize('users_myisam.MYI') + ' 字节'); px(myiS, 520, 32);
  const myiTag = h('div', 'tag', myi, '索引'); px(myiTag, 330, 28);
  // 叶子竖着排在左边、根在右边：叶子项指向数据文件的箭头直接往左走，不穿过别的叶子
  const tRoot = h('div', 'abs', myi, '<div style="text-align:center;font:700 24px \'Sans SC\';color:var(--mainD);padding-top:6px">根</div>'); px(tRoot, 500, 300, 180, 46); css(tRoot, { border: '1.5px solid var(--mainD)', background: 'var(--pale)' });
  const LEAF = [{ y: 100, keys: [1, 2, 3] }, { y: 262, keys: [2049, 2050, 2051] }, { y: 424, keys: [4094, 4095, 4096] }];
  const leafs = LEAF.map((L1) => { const l = h('div', 'abs', myi); px(l, 40, L1.y, 220, 146); css(l, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' }); return l; });
  LEAF.forEach((L1, j) => L1.keys.forEach((kk, i) => { const e = h('div', 'abs mono', leafs[j], `${String(kk).padStart(4)} →`); px(e, 30, 12 + i * 40); css(e, { fontSize: '26px', color: kk === 2050 ? 'var(--main)' : 'var(--ink)' }); }));
  leafs.forEach((l) => { const e = h('div', 'abs mono t-small', l, '⋮'); px(e, 180, 100); });
  const treeLines = LEAF.map((L1) => path(ovA, `M${1010 + 500},${150 + 323} L${1010 + 262},${150 + L1.y + 73}`, 'mainD', { arrow: false, w: 1.8 }));
  const ptr = [2049, 2050, 2051].map((id, i) => {
    const y1 = 150 + 262 + 12 + i * 40 + 17, y2 = 150 + 100 + ROWS.indexOf(id) * 36 + 16;
    return path(ovA, `M${1010 + 40 - 6},${y1} C${960},${y1} ${960},${y2} ${150 + 500},${y2}`, id === 2050 ? 'main' : 'mute', { w: id === 2050 ? 2.6 : 1.8 });
  });
  A.appendChild(ovA);                                          // 线压在两个文件框上面

  // h1：数据文件先出来，一行一行摊开；h2：索引文件出来
  wipe(myd, 0.1, { dir: 'l', d: 0.7 }); sfx('whoosh', 0.1, { g: 0.4 });
  const tRows0 = 0.6, tRows1 = Math.max(tRows0 + 2.5, Tend('h1') - 0.3);
  rowEls.forEach((r, k) => { vanish(r, 0); appear(r, lerp(tRows0, tRows1, k / (rowEls.length - 1))); });
  for (let k = 0; k < rowEls.length; k += 2) sfx('tick', lerp(tRows0, tRows1, k / (rowEls.length - 1)), { g: 0.3 });
  wipe(myi, T('h2', '索引') - 0.3, { dir: 'l', d: 0.6 });
  slam(mydTag, T('h2', '数据'), { from: 1.3 }); slam(myiTag, T('h2', '索引') + 0.3, { from: 1.3 }); sfx('pop', T('h2', '数据'), { g: 0.6 }); sfx('pop', T('h2', '索引') + 0.3, { g: 0.6 });
  // h3：B 树长出来，叶子项指向数据文件里的行
  wipe(tRoot, T('h3', 'B'), { dir: 't', d: 0.4 });
  treeLines.forEach((p, i) => arrowIn(p, T('h3', 'B') + 0.15 + i * 0.08, 0.4));
  leafs.forEach((l, i) => wipe(l, T('h3', 'B') + 0.3 + i * 0.1, { dir: 't', d: 0.45 }));
  ptr.forEach((p, i) => arrowIn(p, T('h3', '位置') - 0.2 + i * 0.12, 0.7)); sfx('blip', T('h3', '位置'), { g: 0.6 });

  // h4–h7：三处做不到：三张小卡，卡里的小图随关键词补全
  const gapY = 790;
  const mk = (x, title, n) => { const c = h('div', 'card', A, `<div class="ct"><span class="num c-acc" style="margin-right:14px">${n}</span>${title}<span class="c-acc" style="margin-left:10px">✕</span></div><div class="cs"></div>`); px(c, x, gapY, 520); return c; };
  const g1 = mk(150, '事务', 1), g2 = mk(700, '表锁', 2), g3 = mk(1250, '日志', 3);
  // 卡里的小图分两步补全：讲到关键词时把那一步的内容换上去（换的是文字本身）
  const steps = (c, a, b, ta, tb) => swaps(c.querySelector('.cs'), [[ta, a], [tb, a + b]]);
  const G1A = '<span class="mono" style="font-size:30px">42 → 43</span>', G1B = '<span class="mono c-acc" style="font-size:30px;margin-left:18px">↶ ✕</span>';
  const G2A = '<span class="mini lk"></span><span class="mono" style="font-size:26px;margin:0 14px 0 8px">users</span><span class="mini b">Carol 写</span>', G2B = '<span class="mini w">Bob 等</span>';
  const G30 = '<span class="mono c-acc" style="font-size:28px;margin-right:12px">⚡</span>', G3A = '<span class="mono" style="font-size:26px">CHECK TABLE</span>', G3B = '<span class="mono" style="font-size:26px"> · REPAIR TABLE</span>';
  slide(g1, T('h5'), { y: 30 }); slide(g2, T('h6'), { y: 30 }); slide(g3, T('h7'), { y: 30 });
  [[g1, 'h5'], [g2, 'h6'], [g3, 'h7']].forEach(([, c]) => sfx('thud', T(c) + 0.1, { g: 0.5 }));
  steps(g1, G1A, G1B, T('h5', '一组'), T('h5', '撤回')); steps(g2, G2A, G2B, T('h6', '在写'), T('h6', '等')); swaps(g3.querySelector('.cs'), [[T('h7', '断电') - 0.2, G30], [T('h7', '检查') - 0.4, G30 + G3A], [T('h7', '修复') - 0.6, G30 + G3A + G3B]]);
  [T('h5', '一组'), T('h5', '撤回'), T('h6', '在写'), T('h6', '等'), T('h7', '断电') - 0.2, T('h7', '检查') - 0.4, T('h7', '修复') - 0.6].forEach((t) => sfx('pop', t, { g: 0.35 }));
  // h4：讲到「三处做不到」时，两个文件稍稍退后，给下面的三张卡让出注意
  [myd, myi].forEach((e) => to(e, T('h4', '三处'), { opacity: 0.4, duration: 0.6 }));
  ptr.forEach((p) => tl.to(p, { opacity: 0.4, duration: 0.6 }, T('h4', '三处')));
  // h8：第一处，一眼就能看见
  lit(g1, 'on', T('h8'));
  [g2, g3].forEach((c) => to(c, T('h8'), { opacity: 0.35, duration: 0.4 }));
  const outA = Tend('h8') + 0.15;
  exit(A, outA, { y: 20, d: 0.4 });

  // ── 二、同样三句，两张表（X2） ──
  const B = part();
  const q1 = sqlLine(B, 160, 150, 'START TRANSACTION;');
  const q2 = sqlLine(B, 160, 205, 'UPDATE users SET age = 43 WHERE id = 2050;');
  const q3 = sqlLine(B, 160, 260, 'ROLLBACK;');
  const tq1 = Math.max(outA + 0.5, T('h9') - 0.1), tq2 = Math.max(tq1 + 0.7, T('h9', '43') - 1.2);
  typeText(q1, q1.innerHTML, tq1, 34, { cursor: false });
  const tq2e = typeText(q2, q2.innerHTML, tq2, 40, { cursor: false });
  typeText(q3, q3.innerHTML, T('h11', 'ROLLBACK'), 26, { cursor: false });
  // 改完的那一行，以及 h10「生日还没到」的那个问号
  const rowChip = h('div', 'pill fill acc', B, 'Alice · 2050 · 42 → 43'); px(rowChip, 1150, 196);
  const qm = h('div', 'abs', B, '<span style="font:900 64px Inter;color:var(--acc)">？</span>'); px(qm, 1480, 176);
  slide(rowChip, tq2e + 0.1, { x: -30 }); sfx('pop', tq2e + 0.1, { g: 0.5 });
  slam(qm, T('h10', '还没到'), { from: 1.6 }); sfx('thud', T('h10', '还没到'), { g: 0.5 });
  // h11：要撤回——那一行的「42 → 43」掉过头来，问号换成撤回的箭头
  swaps(rowChip, [[T('h11', '撤回'), 'Alice · 2050 · 42 ← 43']]);
  swaps(qm, [[T('h11', '撤回'), '<span style="font:900 64px Inter;color:var(--acc)">↶</span>']]);
  [rowChip, qm].forEach((e) => exit(e, T('h12') + 0.6, { y: -10, d: 0.3 }));

  // 两条泳道：MyISAM 的副本与另一张表；横轴是时间，播放头走过 UPDATE 与 ROLLBACK
  const xU = 760, xR = 1260;
  const tP0 = T('h12') + 0.4, tPU = tP0 + 1.3, tPR = Tend('h12') + 0.6, tP1 = Tend('h14') + 0.3;
  const LN = lanes(B, { x: 160, y: 470, w: 1620, gap: 330, rowH: 230, names: ['users_myisam', 'users'], pts: [[tP0, 500], [tPU, xU], [tPR, xR], [tP1, 1740]] });
  LN.els.names.forEach((n) => css(n, { fontFamily: 'Mono', fontSize: '30px' }));
  const eng0 = h('div', 'tag', B, 'MyISAM'); px(eng0, 160, 470 + 30);
  const eng1 = h('div', 'tag', B, '引擎：？'); px(eng1, 160, 700 + 30);
  swaps(eng1, [[T('h15', 'InnoDB'), 'InnoDB']]);
  LN.enter(T('h12')); slide(eng0, T('h12') + 0.2, { x: -30 }); slide(eng1, T('h12') + 0.3, { x: -30 });
  lit(eng1, 'acc', 0, T('h15', 'InnoDB'));
  tl.fromTo(eng1, { scale: 1 }, { scale: 1.25, duration: 0.2, ease: 'power2.out', immediateRender: false }, T('h15', 'InnoDB')); tl.to(eng1, { scale: 1, duration: 0.3 }, T('h15', 'InnoDB') + 0.2);
  sfx('thud', T('h15', 'InnoDB') + 0.05);
  // 版本条：42 → UPDATE → MyISAM 直接成了 43（没有事务，改了就算数）；另一张是未提交的 43（斜纹），ROLLBACK 后回到 42
  const yb = (i) => LN.Y(i) - 22;
  LN.bar(yb(0), tP0, tPU, '42');
  const my43 = LN.bar(yb(0), tPU, tP1, '43');
  LN.bar(yb(1), tP0, tPU, '42');
  LN.bar(yb(1), tPU, tPR, '<span>43</span>', 'unc');
  const in42 = LN.bar(yb(1), tPR, tP1, '42');
  lit(my43, 'bad', T('h13', '43'));
  lit(in42, 'hl', T('h14', '42'));
  LN.event(0, tPU, 'UPDATE', 'ink', -62); LN.event(1, tPU, 'UPDATE', 'ink', -62);
  LN.event(0, tPR, 'ROLLBACK', 'acc', -62); LN.event(1, tPR, 'ROLLBACK', '', -62);
  LN.playhead(tP0, tP1, 400, 760);
  const [w1, w2] = D.warning.split(/(?<=1196) /);
  const warn = h('div', 'echo err', B, `${esc(w1)}\n<span style="font-size:22px">${esc(w2)}</span>`); px(warn, 900, 505);
  const warnZ = h('div', 'gloss', B, '警告 1196：有些不支持事务的表，改动没法撤回'); px(warnZ, 900, 580);
  vanish(warn, 0); appear(warn, T('h13', '警告')); show(warnZ, T('h13', '警告') + 0.2, { y: 8, d: 0.4 }); sfx('error', T('h13', '警告'), { g: 0.5 });
  sfx('pop', T('h14', '42'));
  exit(B, T('hT') - 0.1, { y: -20, d: 0.35 });

  // ── 三、片名落在 InnoDB 的架构图上 ──
  const C = part();
  const zm = zone(C, 120, 330, 600, 550, '内存', 'In-Memory');
  const zd = zone(C, 760, 330, 1040, 550, '磁盘', 'On-Disk');
  const bp = boxEl(zm, 30, 92, 540, 290, '缓冲池');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) sq(bp, 30 + c * 56, 64 + r * 54, null, (r * 9 + c) % 7 === 2 ? 'on' : '');
  const lb = boxEl(zm, 30, 396, 540, 130, '日志缓冲');
  for (let c = 0; c < 9; c++) sq(lb, 30 + c * 56, 66, null);
  const ibd = boxEl(zd, 30, 92, 470, 290, 'users.ibd');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) sq(ibd, 30 + c * 52, 64 + r * 54, null, 'on');
  const undo = boxEl(zd, 530, 92, 480, 135, 'undo');
  for (let c = 0; c < 8; c++) sq(undo, 30 + c * 54, 72, null);
  const redo = boxEl(zd, 530, 247, 480, 135, 'redo 日志');
  for (let c = 0; c < 8; c++) sq(redo, 30 + c * 54, 72, null);
  const dbw = boxEl(zd, 30, 396, 980, 130, 'doublewrite');
  for (let c = 0; c < 16; c++) sq(dbw, 30 + c * 58, 66, null);
  const sup = h('div', 'abs t-note', C, '一个数据库引擎是如何实现的？'); px(sup, 120, 104); css(sup, { fontSize: '38px', color: 'var(--ink2)' });
  const ttl = h('div', 'abs', C, '<span style="font:900 96px \'Sans SC\';color:var(--ink)">事务性与现代化：</span><span style="font:800 104px Inter;color:var(--mainD)">InnoDB</span>'); px(ttl, 112, 152);
  const partTag = h('div', 'tag', C, 'PART 2'); px(partTag, 1620, 130); css(partTag, { fontSize: '34px', padding: '6px 18px', fontFamily: 'Inter' });
  const tT = T('hT');
  wipe(zm, tT, { dir: 'b', d: 0.6 }); wipe(zd, tT + 0.12, { dir: 'b', d: 0.6 });
  wipe(sup, tT + 0.25, { dir: 'l', d: 0.5 }); wipe(ttl, tT + 0.4, { dir: 'l', d: 0.7 }); slam(partTag, tT + 0.9, { from: 1.5 });
  sfx('whoosh', tT, { g: 0.6 }); sfx('thud', tT + 0.95);
  // 片名停留时，缓冲池里的页一格格亮起（引擎在运转）
  const bpSq = [...bp.querySelectorAll('.sq')];
  bpSq.forEach((e, i) => { if (!e.classList.contains('on') && i % 3 === 1) lit(e, 'on', tT + 1.0 + (i / bpSq.length) * 1.4); });

  // 四、三处，各由架构图里的部件补上（M20、M21）
  const callout = (el, html, t) => { const c = h('div', 'tag', el, html); px(c, 12, -18); css(c, { fontSize: '24px' }); slam(c, t, { from: 1.3 }); sfx('pop', t, { g: 0.5 }); return c; };
  const c1 = callout(undo, '事务：回滚', T('h16', '事务'));
  lit(undo, 'on', T('h16', '事务'));
  // undo 里一格格记下旧值；行级锁落在 users.ibd 的一页上；redo 一格格写满
  const undoSq = [...undo.querySelectorAll('.sq')], redoSq = [...redo.querySelectorAll('.sq')], ibdSq = [...ibd.querySelectorAll('.sq')];
  undoSq.forEach((e, i) => lit(e, 'on', T('h16', '事务') + 0.3 + i * Math.max(0.15, (Tend('h16') - T('h16', '事务')) / 9)));
  const c2 = callout(ibd, '行级锁', T('h17', '行级锁'));
  const lk = lockAt(ibd, 30 + 3 * 52 + 4, 64 + 1 * 54 + 6); vanish(lk, 0); slam(lk, T('h17', '行级锁') + 0.15, { from: 1.6 });
  const c3 = callout(redo, '崩溃恢复', T('h17', '崩溃恢复'));
  redoSq.forEach((e, i) => lit(e, 'on', T('h17', '崩溃恢复') + 0.2 + i * 0.12));
  const quote = h('div', 'abs', C, '<div class="mono" style="font-size:22px;color:var(--ink2)">"…transactions featuring commit, rollback, and crash-recovery capabilities…"</div><div class="gloss" style="position:static;margin-top:6px">MySQL 9.7 手册：事务带有提交、回滚和崩溃恢复的能力</div>');
  px(quote, 760, 892); vanish(quote, 0);
  show(quote, T('h16') + 0.4, { y: 10, d: 0.5 });
  exit(quote, T('h18') - 0.2, { y: 10, d: 0.3 });
  // h18：现代的数据库引擎由这些部件组成——讲到「怎样做出来」时各部件依次亮一下，最后停在事务上
  const parts = [bp, lb, ibd, undo, redo, dbw];
  const tParts = T('h18', '怎样');
  // 每个部件里的页依次闪一下（类名 hot，与前面的 on 互不相扰）
  const step = Math.max(0.3, (Tend('h18') - tParts) / (parts.length + 1));
  parts.forEach((b, i) => b.querySelectorAll('.sq').forEach((e) => lit(e, 'hot', tParts + i * step, tParts + i * step + step * 0.9)));
  [lb, ibd, dbw, redo, bp].forEach((b) => to(b, Tend('h18') + 0.1, { opacity: 0.45, duration: 0.5 }));
  to(c1, T('h18', '事务'), { scale: 1.12, duration: 0.4, ease: 'back.out(2)' });
  [c2, c3].forEach((c) => to(c, T('h18', '事务'), { opacity: 0.45, duration: 0.5 }));
});
