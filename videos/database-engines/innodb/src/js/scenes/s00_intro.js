// 开场：回顾 MyISAM（两个文件、索引存行的位置、三处做不到）→ 同样三句 SQL 在两张表上回滚，一张撤回、一张撤不回
// → 片名落在 InnoDB 的架构图上 → 架构图里哪些部件补上了那三处。
// 每一段放在自己的容器里，整段退场时动容器（容器里有帧函数管显隐的版本条、播放头，不能对它们单独做退场补间）。
scene('intro', ({ root, s }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, 1, ['h4', 'h8', 'h12', 'hT']);              // 镜头只极慢横移（parts.js）
  const part = () => { const g = h('div', 'abs', W); px(g, 0, 0, 1920, 1080); css(g, { pointerEvents: 'none' }); return g; };

  // ── 一、MyISAM：两个文件（V1、V2、G7） ──
  const A = part();
  const ovA = overlay(A);
  const myd = h('div', 'box', A); px(myd, 150, 150, 760, 600); css(myd, { borderColor: 'var(--mainD)', borderWidth: '2px' });   // 片头第一帧就要看得出这个文件框
  h('div', 'abs', myd, `<span class="mono" style="font-size:34px;font-weight:700">users.MYD</span>`).style.cssText = 'position:absolute;left:28px;top:22px';
  const mydTag = h('div', 'tag', myd, '数据'); px(mydTag, 340, 28);
  const age = (i) => (i === 2050 ? 42 : 18 + (i % 63));
  const nm = (i) => (i === 2050 ? 'Alice' : `User${String(i).padStart(5, '0')}-abc…`);
  // 只摆几行（同屏要读的字少）：省略的部分画成三个点，不写成文字
  const ROWS = [1, null, 2049, 2050, 2051, null, 4096], RP = 64, dots = (par, x, y) => { const g = h('div', 'abs', par); px(g, x, y, 8, 34); for (let i = 0; i < 3; i++) { const d = h('div', 'abs', g); px(d, 0, i * 13, 7, 7); css(d, { background: 'var(--edge)', borderRadius: '50%' }); } return g; };
  const rowEls = [];
  ROWS.forEach((id, k) => {
    const r = id == null ? dots(myd, 80, 106 + k * RP) : h('div', 'abs mono', myd, `${String(id).padStart(5)}  ${nm(id).padEnd(16)} ${age(id)}`);
    if (id != null) { px(r, 34, 100 + k * RP); css(r, { fontSize: '27px', color: id === 2050 ? 'var(--main)' : 'var(--ink2)', fontWeight: id === 2050 ? 700 : 500 }); }
    rowEls.push(r);
  });
  const myi = h('div', 'box', A); px(myi, 1010, 150, 760, 600);
  h('div', 'abs', myi, `<span class="mono" style="font-size:34px;font-weight:700">users.MYI</span>`).style.cssText = 'position:absolute;left:28px;top:22px';
  const myiTag = h('div', 'tag', myi, '索引'); px(myiTag, 330, 28);
  // 叶子竖着排在左边、根在右边：叶子项指向数据文件的箭头直接往左走，不穿过别的叶子
  const tRoot = h('div', 'abs', myi, '<div style="text-align:center;font:700 24px \'Sans SC\';color:var(--mainD);padding-top:6px">根</div>'); px(tRoot, 500, 300, 180, 46); css(tRoot, { border: '1.5px solid var(--mainD)', background: 'var(--pale)' });
  const LEAF = [{ y: 100, keys: [1] }, { y: 262, keys: [2049, 2050, 2051] }, { y: 424, keys: [4096] }];
  const leafs = LEAF.map((L1) => { const l = h('div', 'abs', myi); px(l, 40, L1.y, 220, 146); css(l, { border: '1.5px solid var(--mainD)', background: 'var(--panel)' }); return l; });
  LEAF.forEach((L1, j) => L1.keys.forEach((kk, i) => { const e = h('div', 'abs mono', leafs[j], `${String(kk).padStart(4)} →`); px(e, 30, 12 + i * 40); css(e, { fontSize: '26px', color: kk === 2050 ? 'var(--main)' : 'var(--ink)' }); }));
  [leafs[0], leafs[2]].forEach((l) => dots(l, 60, 62));                // 只写一项，其余画成三个点
  const treeLines = LEAF.map((L1) => path(ovA, `M${1010 + 500},${150 + 323} L${1010 + 262},${150 + L1.y + 73}`, 'mainD', { arrow: false, w: 1.8 }));
  const ptr = [2049, 2050, 2051].map((id, i) => {
    const y1 = 150 + 262 + 12 + i * 40 + 17, y2 = 150 + 100 + ROWS.indexOf(id) * RP + 18;
    return path(ovA, `M${1010 + 40 - 6},${y1} C${960},${y1} ${960},${y2} ${150 + 500},${y2}`, id === 2050 ? 'main' : 'mute', { w: id === 2050 ? 2.6 : 1.8 });
  });
  A.appendChild(ovA);                                          // 线压在两个文件框上面

  // h1：数据文件先出来，一行一行摊开；h2：索引文件出来
  appear(myd, 0); sfx('whoosh', 0.05, { g: 0.4 });                    // 片头第一帧就有数据文件（不留空画面）
  tl.fromTo(myd, { x: -90 }, { x: 0, duration: 1.6, ease: 'power3.out', immediateRender: true }, 0);   // 边摊开边滑到位
  const tRows0 = 0.1, tRows1 = Math.max(tRows0 + 2.5, Tend('h1') - 0.3);
  rowEls.forEach((r, k) => { vanish(r, 0); appear(r, k < 4 ? 0 : lerp(tRows0, tRows1, k / (rowEls.length - 1))); });   // 头两行第一帧就在
  for (let k = 0; k < rowEls.length; k += 2) sfx('tick', lerp(tRows0, tRows1, k / (rowEls.length - 1)), { g: 0.3 });
  wipe(myi, Math.min(T('h2', '两个文件'), 2.6), { dir: 'l', d: 0.9 });   // 索引文件早一点出来（片头这几秒画面要有变化），标签等讲到时再上
  slam(mydTag, T('h2', '两个文件'), { from: 1.3 }); slam(myiTag, T('h2', '两个文件') + 0.15, { from: 1.3 });
  [[mydTag, T('h2', '数据')], [myiTag, T('h2', '索引') - 0.05]].forEach(([e, t]) => { tl.fromTo(e, { scale: 1 }, { scale: 1.3, duration: 0.15, ease: 'power2.out', immediateRender: false }, t); tl.fromTo(e, { scale: 1.3 }, { scale: 1, duration: 0.2, ease: 'power2.in', immediateRender: false }, t + 0.15); }); sfx('pop', T('h2', '数据'), { g: 0.6 }); sfx('pop', T('h2', '索引') - 0.05, { g: 0.6 });
  // 索引文件里的 B 树与指向数据文件的箭头：旁白只说「一个放索引」，细节交给画面（R11 并掉了 h3）
  const tTree = T('h2') + 0.2, tPtr = Math.max(tTree + 1.0, Tend('h2') - 0.3);
  wipe(tRoot, tTree, { dir: 't', d: 0.4 });
  treeLines.forEach((p, i) => arrowIn(p, tTree + 0.15 + i * 0.08, 0.4));
  leafs.forEach((l, i) => wipe(l, tTree + 0.3 + i * 0.1, { dir: 't', d: 0.45 }));
  ptr.forEach((p, i) => arrowIn(p, tPtr + i * 0.12, 0.7)); sfx('blip', tPtr, { g: 0.6 });

  // h4–h7：三处做不到：三张小卡，卡里的小图随关键词补全
  const gapY = 790;
  const mk = (x, title, n) => { const c = h('div', 'card', A, `<div class="ct"><span class="num c-acc" style="margin-right:14px">${n}</span>${title}<span style="margin-left:10px">${MARK.no(30)}</span></div><div class="cs"></div>`); px(c, x, gapY, 520); return c; };
  const g1 = mk(150, '事务', 1), g2 = mk(700, '表锁', 2), g3 = mk(1250, '日志', 3);
  // 卡里的小图分两步补全：讲到关键词时把那一步的内容换上去（换的是文字本身）
  const steps = (c, a, b, ta, tb) => swaps(c.querySelector('.cs'), [[ta, a], [tb, a + b]]);
  const G1A = '<span class="mono" style="font-size:30px">42 → 43</span>', G1B = '<span class="mono c-acc" style="font-size:30px;margin-left:18px">↶ ' + MARK.no(28) + '</span>';
  const G2A = '<span class="mini lk"></span><span class="mono" style="font-size:26px;margin:0 14px 0 8px">users</span><span class="mini b">Carol 写</span>', G2B = '<span class="mini w">Bob 等</span>';
  const G30 = '<span style="margin-right:12px">' + MARK.bolt(30) + '</span>', G3A = '<span class="mono" style="font-size:26px">CHECK TABLE</span>', G3B = '<span class="mono" style="font-size:26px"> · REPAIR TABLE</span>';
  // 三张卡在说「三处」时一起进场、随即变淡；讲到哪一处，哪一张变实
  { const tC0 = T('h4', '三处');
    [g1, g2, g3].forEach((c, i) => slide(c, tC0 + i * 0.2, { y: 30 }));
    [['h5', g1], ['h6', g2], ['h7', g3]].forEach(([c, e]) => lit(e, 'on', T(c), Tend(c) + 0.3));
    [[g1, T('h5', '一组'), T('h5', '撤回')], [g2, T('h6', '表锁'), T('h6', '等')], [g3, T('h7', '断电'), T('h7', '修复')]].forEach(([e, a, b]) => {
      tl.fromTo(e, { y: 0 }, { y: -26, duration: 0.3, ease: 'power2.out', immediateRender: false }, a); tl.fromTo(e, { y: -26 }, { y: 0, duration: 0.3, ease: 'power2.inOut', immediateRender: false }, b + 0.3); }); }
  [[g1, 'h5'], [g2, 'h6'], [g3, 'h7']].forEach(([, c]) => sfx('thud', T(c) + 0.1, { g: 0.5 }));
  steps(g1, G1A, G1B, T('h5', '一组'), T('h5', '撤回')); steps(g2, G2A, G2B, T('h6', '在写'), T('h6', '等')); swaps(g3.querySelector('.cs'), [[T('h7', '断电') - 0.2, G30], [T('h7', '检查') - 0.4, G30 + G3A], [T('h7', '修复') - 0.8, G30 + G3A + G3B]]);
  // 「断电」：整个画面暗一下
  { const bo = h('div', 'abs', A); px(bo, -60, -60, 2040, 1200); css(bo, { background: '#15191C', opacity: 0, pointerEvents: 'none' }); const tb = T('h7', '断电');
    tl.fromTo(bo, { opacity: 0 }, { opacity: 0.6, duration: 0.08, immediateRender: false }, tb); tl.fromTo(bo, { opacity: 0.6 }, { opacity: 0, duration: 0.7, immediateRender: false }, tb + 0.3); }
  [T('h5', '一组'), T('h5', '撤回'), T('h6', '在写'), T('h6', '等'), T('h7', '断电') - 0.2, T('h7', '检查') - 0.4, T('h7', '修复') - 0.6].forEach((t) => sfx('pop', t, { g: 0.35 }));
  // h4：讲到「三处做不到」时，两个文件稍稍退后，给下面的三张卡让出注意
  [myd, myi].forEach((e) => to(e, T('h4') + 0.1, { opacity: 0.4, duration: 0.6 }));
  ptr.forEach((p) => tl.to(p, { opacity: 0.4, duration: 0.6 }, T('h4') + 0.1));
  // h8：先看第一处
  lit(g1, 'on', Tend('h7') + 0.9);
  [g2, g3].forEach((c) => to(c, Tend('h7') + 0.9, { opacity: 0.35, duration: 0.4 }));   // 第三处讲完就把第一处挑出来
  // h8 → h8b：用元素把两屏接起来（R13 第 2 条，不整屏硬切）：第 1 张卡移到右上角当这段实验的题头；索引文件、另两张卡、箭头有去向地退场；
  // 数据文件 users.MYD 收成一张小表，落到 users 那一道上（「同一张 users 表」），下一句再从它复制出副本
  const tM0 = T('h8') + 0.35, outA = Math.max(tM0 + 1.1, T('h8b', 'users') - 0.1);   // 收拢开始、小表落地
  exit(myi, tM0, { x: 80, d: 0.45 }); [g2, g3].forEach((c, i) => exit(c, tM0 + i * 0.06, { y: 50, d: 0.4 }));
  [...ptr, ...treeLines].forEach((p) => tl.to(p, { opacity: 0, duration: 0.3 }, tM0));
  [...myd.children].forEach((c) => tl.to(c, { opacity: 0, duration: 0.35 }, outA - 0.45));   // 框连同里面的行一起缩小，快落地时字才淡掉
  tl.fromTo(myd, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' }, { x: 500 - 150, y: 642 - 150, scaleX: 176 / 760, scaleY: 116 / 600, duration: outA - tM0 - 0.25, ease: 'power3.inOut', immediateRender: false }, tM0 + 0.25);
  vanish(myd, outA);                                                  // 落地那一刻换成泳道上的小表（同一个位置、同样大小）
  tl.fromTo(g1, { x: 0, y: 0, scale: 1, transformOrigin: '0 0' }, { x: 1290 - 150, y: 40 - 790, scale: 0.8, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, tM0);
  sfx('whoosh', tM0, { g: 0.35 }); sfx('tick', outA, { g: 0.4 });
  tl.to(g1, { autoAlpha: 0, duration: 0.35 }, T('hT') - 0.1);       // 题头和实验那一段一起退场

  // ── 二、同样三句，两张表（X2） ──
  const B = part();
  const q1 = sqlLine(B, 160, 150, 'START TRANSACTION;');
  const q2 = sqlLine(B, 160, 205, 'UPDATE users SET age = 43 WHERE id = 2050;');
  const q3 = sqlLine(B, 160, 260, 'ROLLBACK;');
  const tq1 = Math.max(outA + 0.5, T('h8c') + 0.6), tq2 = Math.max(tq1 + 0.7, T('h9', '43') - 1.2);
  typeText(q1, q1.innerHTML, tq1, 34, { cursor: false });
  const tq2e = typeText(q2, q2.innerHTML, tq2, 40, { cursor: false });
  typeText(q3, q3.innerHTML, T('h11', 'ROLLBACK'), 26, { cursor: false });
  // 改完的那一行，以及 h10「生日还没到」的那个问号
  const rowChip = h('div', 'pill fill acc', B, 'Alice · 2050 · 42 → 43'); px(rowChip, 1150, 196);
  const qm = h('div', 'abs', B, '<span style="font:900 64px Inter;color:var(--acc)">？</span>'); px(qm, 1480, 176);
  slide(rowChip, tq2e + 0.1, { x: -30 }); sfx('pop', tq2e + 0.1, { g: 0.5 });
  slam(qm, T('h10', '还没到'), { from: 1.6 }); sfx('thud', T('h10', '还没到'), { g: 0.5 });
  // h11：要撤回——那一行的「42 → 43」掉过头来，问号换成撤回的箭头
  // 要撤回：那一行的标签从红色（改了）换成深青（退回去）
  const rowBack = h('div', 'pill fill', B, 'Alice · 2050 · 42 ← 43'); px(rowBack, 1150 - 30 + 30, 196); css(rowBack, { background: 'var(--mainD)', borderColor: 'var(--mainD)' });
  vanish(rowBack, 0); appear(rowBack, T('h11', 'ROLLBACK')); exit(rowBack, T('h12') + 0.6, { y: -10, d: 0.3 });   // 原标签不动，叠一张深青的新标签
  swaps(qm, [[T('h11', '撤回'), '<span style="font:900 64px Inter;color:var(--acc)">↶</span>']]);
  exit(qm, T('h12') + 0.6, { y: -10, d: 0.3 }); vanish(rowChip, T('h11', 'ROLLBACK') + 0.01);   // 原标签在深青的新标签出现时收起

  // 两条泳道：MyISAM 的副本与另一张表；横轴是时间，播放头走过 UPDATE 与 ROLLBACK
  const xU = 760, xR = 1260;
  const tP0 = T('h12') + 0.4, tPU = tP0 + 1.3, tPR = Tend('h12') + 0.6, tP1 = Tend('h14') + 0.3;
  const LN = lanes(B, { x: 160, y: 470, w: 1620, gap: 330, rowH: 230, names: ['users_myisam', 'users'], pts: [[tP0, 500], [tPU, xU], [tPR, xR], [tP1, 1740]] });
  LN.els.names.forEach((n) => css(n, { fontFamily: 'Mono', fontSize: '30px' }));
  const eng0 = h('div', 'tag', B, 'MyISAM'); px(eng0, 160, 470 + 30);
  const eng1 = h('div', 'tag', B, '引擎：？'); px(eng1, 160, 700 + 30);
  swaps(eng1, [[T('h15', 'InnoDB'), 'InnoDB']]);
  // h8b：同一张 users 表复制一份——先出 users，副本从它那里「复制」上去；各标上用的引擎
  const tCopy = T('h8b', '复制');                                   // 讲到「复制一份」时就复制
  vanish(LN.els.names[1], 0); appear(LN.els.names[1], outA); vanish(LN.els.lines[1], 0); appear(LN.els.lines[1], outA);
  slide(LN.els.names[0], tCopy - 0.2, { y: 230, d: 0.7, ease: 'power3.out' }); wipe(LN.els.lines[0], tCopy + 0.1, { dir: 'l', d: 0.7 });
  slide(eng0, T('h8bz', 'MyISAM'), { x: -30 }); slide(eng1, T('h8c', '另一个引擎'), { x: -30 });
  sfx('pop', tCopy, { g: 0.5 });
  // 讲到哪一张表，哪一道就铺上浅底（副本 → 原表）
  const band = (i, ta, tb) => { const e = h('div', 'abs', B); px(e, 150, 470 + i * 230 - 105, 1640, 210); css(e, { background: 'var(--pale)', opacity: 0 }); B.insertBefore(e, B.firstChild);
    tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, ta); tl.fromTo(e, { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, tb); };
  band(0, T('h8bz') - 0.1, T('h8c') - 0.1); band(1, T('h8c') - 0.1, T('h9') + 0.3);
  // 「复制一份」：users 那一道上先出一张小表，讲到「副本」时它复制出一张，飞到上面一道（只画表头与行，不写字）
  const tbl = (y) => { const g = h('div', 'abs', B); px(g, 500, y - 58, 176, 116); css(g, { border: '2px solid var(--mainD)', background: 'var(--panel)' });
    const hd = h('div', 'abs', g); px(hd, 0, 0, 172, 26); css(hd, { background: 'var(--teal)', borderBottom: '2px solid var(--mainD)' });
    for (let r = 0; r < 3; r++) { const ln = h('div', 'abs', g); px(ln, 10, 44 + r * 22, 152, 10); css(ln, { background: 'var(--pale)' }); }
    return g; };
  const tU = tbl(700), tM = tbl(700);
  vanish(tU, 0); appear(tU, outA);                                   // 数据文件收成的小表落地，泳道同一刻出现
  vanish(tM, 0); appear(tM, tCopy - 0.1); fromTo(tM, tCopy - 0.1, { y: 0 }, { y: -230, duration: 0.8, ease: 'power3.inOut' });
  [tU, tM].forEach((e) => exit(e, tP0 - 0.4, { d: 0.3 }));
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
  LN.playhead(tP0, tP1, 400, 500); LN.playhead(tP0, tP1, 618, 760);   // 每道一段：两道之间是 Warning 1196，播放头不从字上穿过
  // 下面两道走到哪一步，上面三行 SQL 就标出哪一行（R13 第 4 条）：行首一个平涂小三角 + 整行浅底，
  // 播放头起步时在 START TRANSACTION，走到 UPDATE、ROLLBACK 时移过去（0.25 秒滑一行），走完后收起
  const sqlHl = h('div', 'abs', B); css(sqlHl, { background: 'var(--pale)' }); B.insertBefore(sqlHl, q1);
  const tri = h('div', 'abs', B); css(tri, { width: '0', height: '0', borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '17px solid var(--main)' });
  const LY = [150, 205, 260], TS = [tP0, tPU, tPR], tHlOff = tP1 + 0.5;
  let lastHl = '';
  F((t) => {
    const on = t >= tP0 - 0.2 && t < tHlOff; let k = 0; while (k < 2 && t >= TS[k + 1]) k++;
    const y = k > 0 ? lerp(LY[k - 1], LY[k], ease.io3(clamp((t - TS[k]) / 0.25))) : LY[0];
    const key = on ? y.toFixed(1) : '-'; if (key === lastHl) return; lastHl = key;
    sqlHl.style.visibility = tri.style.visibility = on ? 'visible' : 'hidden';
    px(sqlHl, 148, y - 5, 910, 54); px(tri, 124, y + 11);
  });
  [tPU, tPR].forEach((t) => sfx('tick', t + 0.05, { g: 0.3 }));
  const [w1, w2] = D.warning.split(/(?<=1196) /);
  // 警告里的关键词 non-transactional（不支持事务）随后单独标出（R14 第 3 条）
  const warn = h('div', 'echo err', B, `${esc(w1)}\n<span style="font-size:22px">${esc(w2).replace('non-transactional', '<b class="s0-nt">non-transactional</b>')}</span>`); px(warn, 900, 505);
  const warnZ = h('div', 'gloss', B, '警告 1196：有些<b class="s0-nt">不支持事务</b>的表，改动没法撤回'); px(warnZ, 900, 580);
  h('style', '', B).textContent = '.s0-nt { font-weight: 800; padding: 0 4px; } .s0-nt.on { color: #fff; background: var(--acc); }';
  warn.querySelectorAll('.s0-nt').forEach((e) => lit(e, 'on', T('h13', '警告') + 0.7)); warnZ.querySelectorAll('.s0-nt').forEach((e) => lit(e, 'on', T('h13', '警告') + 0.9));
  sfx('tick', T('h13', '警告') + 0.7, { g: 0.4 });
  vanish(warn, 0); appear(warn, T('h13', '警告')); show(warnZ, T('h13', '警告') + 0.2, { y: 8, d: 0.4 }); sfx('error', T('h13', '警告'), { g: 0.5 });
  sfx('pop', T('h14', '42'));
  const gInno = gloss(W, 120, 896, 'InnoDB', '<b>InnoDB</b>：MySQL 的存储引擎；5.5.5 起是默认引擎', { w: 1100 });
  vanish(gInno, 0); show(gInno, T('h15', 'InnoDB') + 0.2, { y: 8, d: 0.4 }); exit(gInno, T('h16', '事务') - 0.1, { y: 8, d: 0.3 });   // 跨过片名那一屏一直留着
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
  const dbw = boxEl(zd, 30, 396, 980, 130, '双写缓冲区');
  for (let c = 0; c < 16; c++) sq(dbw, 30 + c * 58, 66, null);
  const sup = h('div', 'abs t-note', C, '一个数据库引擎是如何实现的？'); px(sup, 120, 104); css(sup, { fontSize: '38px', color: 'var(--ink2)' });
  const ttl = h('div', 'abs', C, '<span style="font:900 96px \'Sans SC\';color:var(--ink)"><span class="s0-tx">事务性</span>与现代化：</span><span style="font:800 104px Inter;color:var(--mainD)">InnoDB</span>'); px(ttl, 112, 152);
  const partTag = h('div', 'tag', C, 'PART 2'); px(partTag, 1620, 130); css(partTag, { fontSize: '34px', padding: '6px 18px', fontFamily: 'Inter' });
  const tT = T('hT');
  h('style', '', C).textContent = '.s0-tx.on { color: var(--main); background: var(--pale); }'; lit(ttl.querySelector('.s0-tx'), 'on', T('h18', '事务') - 0.1);   // 「就从事务开始」：片名里的「事务性」亮起
  wipe(zm, tT, { dir: 'b', d: 0.6 }); wipe(zd, tT + 0.12, { dir: 'b', d: 0.6 });
  wipe(sup, tT + 0.25, { dir: 'l', d: 0.5 }); wipe(ttl, tT + 0.4, { dir: 'l', d: 0.7 }); slam(partTag, tT + 0.9, { from: 1.5 });
  sfx('whoosh', tT, { g: 0.6 }); sfx('thud', tT + 0.95);
  // 片名停留时，缓冲池里的页一格格亮起（引擎在运转）
  const bpSq = [...bp.querySelectorAll('.sq')];
  bpSq.forEach((e, i) => { if (!e.classList.contains('on') && i % 3 === 1) lit(e, 'on', tT + 1.0 + (i / bpSq.length) * 1.4); });

  // 四、撤得回，是因为有事务：架构图里的 undo 亮起（M20）；另外两处留到后面各章再讲（R12 删去 h17）
  const callout = (el, html, t) => { const c = h('div', 'tag', el, html); px(c, 12, -18); css(c, { fontSize: '24px' }); slam(c, t, { from: 1.3 }); sfx('pop', t, { g: 0.5 }); return c; };
  const c1 = callout(undo, '事务：回滚', T('h16', '事务'));
  c1.dataset.gloss = '事务';                                         // 「事务：回滚」这个标注就是画面上的交代（R14 第 5 条：这里不再另加一行事务的注解）
  lit(undo, 'on', T('h16', '事务'));
  // undo 里一格格记下旧值
  const undoSq = [...undo.querySelectorAll('.sq')];
  undoSq.forEach((e, i) => lit(e, 'on', T('h16', '事务') + 0.3 + i * Math.max(0.15, (Tend('h16') - T('h16', '事务')) / 9)));
  // h18：现代的数据库引擎由这些部件组成——讲到「怎样做出来」时各部件依次亮一下，最后停在事务上
  const parts = [bp, lb, ibd, undo, redo, dbw];
  const tParts = T('h18z', '怎样');
  // 每个部件里的页依次闪一下（类名 hot，与前面的 on 互不相扰）
  const step = Math.max(0.3, (Tend('h18z') - tParts) / (parts.length + 1));
  parts.forEach((b, i) => b.querySelectorAll('.sq').forEach((e) => lit(e, 'hot', tParts + i * step, tParts + i * step + step * 0.9)));
  [lb, ibd, dbw, redo, bp].forEach((b) => to(b, Tend('h18z') + 0.1, { opacity: 0.45, duration: 0.5 }));
  to(c1, T('h18', '事务'), { scale: 1.12, duration: 0.4, ease: 'back.out(2)' });
});
