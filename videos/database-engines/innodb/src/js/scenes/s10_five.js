// 第 10 章 五个问题：一个数据库引擎必须回答的五个问题（与 MyISAM 一集结尾相同，系列每集都要），InnoDB 的回答。
// 照 MyISAM 一集结尾的画法（WaterRun 2026-10-25：「五个问题部分还是直接展现就好, 类似片尾总结, 就和MyISAM一样. 确保直观, 抓重点」）：
// 一屏五块小画面，每块用前面那一章的画法重演一个最小过程；讲到哪一问，哪一块亮起来、动起来，写出一行重点。
// 一 放：.ibd、表就是主键 B+ 树（M1、S8）；二 找：根页到叶子、二级索引再回表（L2、M2）；三 改和删：undo、删除标记与清除（M14、M8）；
// 四 事务与并发：一笔事务的六步在这一块里依次点亮——锁行（X5）→ 旧值进 undo（X1）→ 缓冲池里改页成脏页（M27）→ 记 redo（M12）
//    → 提交：redo 落盘、锁放开（S7、X6）→ 脏页稍后写回（M31）；别人读旧版本、要改就等锁（M9、X3、X5）；五 出错：先 redo 重做，再 undo 撤销（M12、R3）。
scene('s10', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  microDrift(makeCamera(W));                  // Continuous 2D micro drift (parts.js)
  const st = h('style', '', W);
  st.textContent = `
.s10t { position: absolute; background: var(--panel); border: 1.5px solid var(--edge); opacity: .55; }
.s10t.lit { opacity: 1; border-color: var(--main); outline: 1.5px solid var(--main); outline-offset: -3px; background: var(--pale); }
.s10t .q { position: absolute; left: 22px; top: 14px; font: 800 30px "Sans SC"; color: var(--ink); }
.s10t .n { color: var(--main); margin-right: 10px; font-family: Inter; }
.s10t .a { position: absolute; left: 22px; right: 18px; bottom: 12px; font: 600 24px "Sans SC"; color: var(--mainD); line-height: 1.35; white-space: nowrap; }
.s10-dirty { border-color: var(--acc) !important; border-width: 2.5px !important; }
.s10-unc { background-color: #FBF1EE !important; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Cpath d='M-2,2 l4,-4 M0,14 L14,0 M12,16 l4,-4' stroke='%23E7B9AD' stroke-width='3'/%3E%3C/svg%3E"); border-color: var(--acc) !important; }
.s10-ok { background: var(--teal) !important; border-style: solid !important; border-color: var(--mainD) !important; }
.s10-gone { opacity: .45; text-decoration: line-through; }
.s10-act { background: var(--mainD) !important; } .s10-act > div:first-child { color: #fff !important; }
.s10-pga { background: var(--teal) !important; }
.s10-pgd { background: var(--acc) !important; } .s10-pgd > div:first-child { color: #fff !important; }
.s10s { position: absolute; font: 500 22px "Sans SC"; color: var(--ink2); white-space: nowrap; }
.s10s.on { color: #fff; background: var(--mainD); font-weight: 700; padding: 0 10px; margin-left: -10px; }
.s10s.on .k { color: var(--teal); }
.s10s .k { display: inline-block; width: 26px; color: var(--main); font: 700 22px Inter; }
`;
  const hd = h('div', 'abs', W, '<span style="font:800 40px \'Sans SC\';color:var(--ink)">五个问题</span><span class="t-note" style="margin-left:16px">一个数据库引擎必须回答的</span>');
  px(hd, 120, 84); slide(hd, c0 + 0.1, { x: -30 });
  // 五块：上排三块、下排两块（与 MyISAM 一集同一个排法）
  const TW = 540, TH = 340;
  const TILES = [['数据怎么放', 120, 160, 'k8a', 'k8az'], ['怎么找', 690, 160, 'k8b', 'k8bz'], ['改和删', 1260, 160, 'k8c', 'k8cz'], ['事务与并发', 405, 540, 'k9', 'k10z'], ['出错怎么办', 975, 540, 'k11', 'k11z']];
  const tiles = TILES.map(([q, x, y, a, b], i) => {
    const e = h('div', 's10t', W, `<div class="q"><span class="n">${i + 1}</span>${q}</div>`); px(e, x, y, TW, TH);
    const art = h('div', 'abs', e); px(art, 22, 64, TW - 44, TH - 150);
    wipe(e, c0 + 0.3 + i * 0.7, { dir: 't', d: 0.5 }); sfx('tick', c0 + 0.3 + i * 0.7, { g: 0.3 });   // 讲「五个问题」时五块一块一块铺开
    lit(e, 'lit', T(a) - 0.2, Tend(b) + 0.3);
    return { e, art, t0: T(a), t1: T(b) };
  });
  const answer = (i, html, t) => { const e = h('div', 'a', tiles[i].e, html); vanish(e, 0); show(e, t, { y: 8, d: 0.35 }); return e; };
  const box = (par, x, y, w, hh, bg = 'var(--panel)', bd = 'var(--mainD)') => { const e = h('div', 'abs', par); px(e, x, y, w, hh); css(e, { background: bg, border: `1.5px solid ${bd}` }); return e; };
  const txt = (par, x, y, html, css_ = {}) => { const e = h('div', 'abs', par, html); px(e, x, y); css(e, { font: '600 22px Inter', color: 'var(--ink2)', ...css_ }); return e; };

  // 1 数据怎么放：一个 .ibd 文件；表本身就是一棵按主键排好的 B+ 树（根在上，叶子成排相连，行在叶子里）
  { const { art } = tiles[0], ov1 = overlay(art);
    const file = txt(art, 0, 0, 'users.ibd', { fontFamily: 'Mono', color: 'var(--ink)' });
    const root = box(art, 190, 30, 110, 36, 'var(--pale)'); const rootT = txt(root, 0, 4, '根页', { fontFamily: '"Sans SC"', lineHeight: '26px' }); css(rootT, { width: '108px', textAlign: 'center' });
    const lv = [0, 1, 2, 3].map((k) => { const b = box(art, 20 + k * 118, 110, 96, 70, 'var(--teal)'); for (let r = 0; r < 3; r++) box(b, 8, 10 + r * 18, 78, 10, 'var(--main)', 'var(--main)'); return b; });
    const br = [0, 1, 2, 3].map((k) => path(ov1, `M245,64 L${68 + k * 118},110`, 'mainD', { w: 1.4, arrow: false }));
    const ln = [0, 1, 2].map((k) => path(ov1, `M${116 + k * 118},145 L${138 + k * 118},145`, 'main', { w: 2.4, arrow: false }));
    art.appendChild(ov1);
    const t0 = tiles[0].t0; [root, ...lv].forEach((e, k) => { vanish(e, 0); show(e, t0 + 0.2 + k * 0.12, { y: 10, d: 0.3 }); });
    [...br, ...ln].forEach((p_) => { p_.setAttribute('opacity', 0); tl.to(p_, { opacity: 1, duration: 0.3 }, T('k8az') + 0.1); });
    answer(0, '一个 .ibd 文件<br>表本身是一棵按主键排好的 B+ 树', T('k8az')); }

  // 2 怎么找：主键树从根页走到叶子；按名字找先走二级索引，拿到编号再回主键树（回表）
  { const { art } = tiles[1], ov2 = overlay(art);
    const mini = (x0, label, col) => { const r = box(art, x0 + 70, 10, 70, 26, col); const ls = [0, 1, 2].map((k) => box(art, x0 + k * 70, 90, 56, 60, col)); txt(art, x0, 160, label, { fontFamily: '"Sans SC"', fontSize: '22px' });
      ls.forEach((l, k) => path(ov2, `M${x0 + 105},36 L${x0 + 28 + k * 70},90`, 'mute', { w: 1.2, arrow: false })); return { r, ls }; };
    const pk = mini(0, '主键树', 'var(--pale)'), nm = mini(270, '姓名索引', '#E6F1F4');
    const hitPk = path(ov2, 'M105,36 L98,90', 'main', { w: 3.4 }), hitNm = path(ov2, 'M375,36 L298,90', 'main', { w: 3.4 });
    const back = path(ov2, 'M298,150 C220,190 120,190 98,150', 'mainD', { w: 3 });
    art.appendChild(ov2);
    arrowIn(hitPk, T('k8b', '根页'), 0.5); lit(pk.ls[1], 'hot', T('k8b', '叶子'), Tend('k8bz') + 0.3);
    arrowIn(hitNm, T('k8bz', '二级索引'), 0.5); lit(nm.ls[0], 'hot', T('k8bz', '二级索引') + 0.4, Tend('k8bz') + 0.3); arrowIn(back, T('k8bz', '回表') - 0.2, 0.6);
    [T('k8b', '叶子'), T('k8bz', '回表')].forEach((t) => sfx('pop', t, { g: 0.4 }));
    answer(1, '从根页走到叶子<br>按名字找：二级索引 → 回表', T('k8bz')); }

  // 3 改和删：改之前，旧值先进 undo；删掉的行先打标记，没人需要了再清除
  { const { art } = tiles[2];
    const row = box(art, 0, 10, 260, 46); txt(row, 12, 9, '2050 Alice', { color: 'var(--ink)' });
    const age = box(art, 190, 18, 56, 30, 'var(--pale)'); txt(age, 10, 1, '42', { color: 'var(--mainD)' });
    const undo = box(art, 320, 4, 170, 58, 'var(--pale)', 'var(--main)'); txt(undo, 10, 4, 'undo', { fontFamily: 'Mono', fontSize: '22px' });
    const old = box(art, 0, 0, 46, 30, 'var(--main)', 'var(--main)'); { const t_ = txt(old, 0, 0, '42', { color: '#fff', fontSize: '22px', lineHeight: '28px' }); css(t_, { width: '44px', textAlign: 'center' }); } px(old, 194, 18);
    swaps(age.firstChild, [[T('k8c', '旧值') + 0.6, '43']]);
    vanish(old, 0); appear(old, T('k8c', '旧值')); fromTo(old, T('k8c', '旧值'), { x: 0, y: 0 }, { x: 330 - 196 + 70, y: 30 - 20, duration: 0.7, ease: 'power2.inOut' });
    const del = box(art, 0, 100, 310, 46); txt(del, 12, 9, '2050 Alice', { color: 'var(--ink2)' });
    const flg = txt(del, 164, 9, '删除标记 1', { fontFamily: '"Sans SC"', color: 'var(--acc)' });
    vanish(del, 0); show(del, T('k8cz') - 0.1, { y: 8, d: 0.3 }); vanish(flg, 0); appear(flg, T('k8cz') + 0.1);
    exit(del, T('k8cz', '清除'), { y: -14, d: 0.5 }); sfx('pop', T('k8cz', '标记'), { g: 0.4 }); sfx('whoosh', T('k8cz', '清除'), { g: 0.35 });
    answer(2, '改：旧值先进 undo<br>删：先打标记，没人需要了再清除', T('k8cz')); }

  // 4 事务与并发：同一张小架构图上演一笔事务（k2–k7）——锁行 → 旧值进 undo、回滚指针 → 改页成脏页 → 记 redo → 提交：redo 落盘、锁放开 → 脏页写回；
  //   再是这期间的别人：读 undo 里的旧版本（k10），要改就等锁（k10z）
  { const { art } = tiles[3], ov4 = overlay(art);
    const lab = (x, y, t_) => txt(art, x, y, t_, { fontFamily: '"Sans SC"', fontSize: '22px', color: 'var(--ink2)' });
    const ttl = (b, t_) => txt(b, 8, 2, t_, { fontFamily: 'Mono', fontSize: '22px', color: 'var(--ink2)' });
    lab(0, -2, '内存'); lab(0, 98, '磁盘');
    const pg = box(art, 56, 0, 186, 88, 'var(--panel)'); ttl(pg, '页 27');
    const rowE = box(pg, 8, 40, 128, 32, 'var(--pale)', 'var(--main)'); const rowT = txt(rowE, 8, 2, '2050 · 42', { fontFamily: 'Mono', color: 'var(--ink)' });
    const dirty = txt(pg, 80, 4, '脏页', { fontFamily: '"Sans SC"', color: 'var(--acc)', fontWeight: 700, background: '#fff', padding: '0 6px' });
    const und = box(art, 262, 0, 104, 88, 'var(--pale)', 'var(--main)'); ttl(und, 'undo');
    const rlog = box(art, 408, 0, 88, 88, 'var(--panel)'); ttl(rlog, 'redo');
    const fileB = box(art, 56, 100, 186, 84, 'var(--band)', 'var(--edge)'); ttl(fileB, 'users.ibd');
    const rfile = box(art, 408, 100, 88, 84, 'var(--band)', 'var(--edge)'); ttl(rfile, 'redo');
    const lk = lockAt(art, 56 + 8 + 128 + 10, 38, '');
    const ptr = path(ov4, 'M200,62 C228,62 240,62 262,62', 'mainD', { w: 2 });
    const old = box(art, 0, 0, 46, 30, 'var(--main)', 'var(--main)'); { const t_ = txt(old, 0, 0, '42', { color: '#fff', fontSize: '22px', lineHeight: '28px' }); css(t_, { width: '44px', textAlign: 'center' }); } px(old, 56 + 8 + 80, 40 + 1);
    const rq = box(art, 0, 0, 30, 30, 'var(--main)', 'var(--main)'); px(rq, 408 + 29, 44);
    const pgCopy = box(art, 56, 0, 186, 88, 'var(--pale)', 'var(--acc)');
    const bob = h('div', 'pill', art, 'Bob 读旧版本'); px(bob, 246, 102); css(bob, { fontFamily: '"Sans SC"', fontSize: '22px', padding: '1px 7px' });
    const carol = h('div', 'pill', art, 'Carol 等锁'); px(carol, 246, 148); css(carol, { fontFamily: '"Sans SC"', fontSize: '22px', padding: '1px 7px', borderStyle: 'dashed', borderColor: 'var(--acc)', color: 'var(--acc)' });
    const bobL = path(ov4, 'M314,102 L314,90', 'main', { w: 2 }), carolL = path(ov4, 'M246,162 C224,162 214,120 206,82', 'acc', { w: 2, dashed: '5 5' });
    art.appendChild(ov4);
    [lk, old, rq, pgCopy, dirty, bob, carol].forEach((e) => vanish(e, 0));
    // k2 锁住要改的行
    slam(lk, T('k2', '锁住'), { from: 1.6 }); sfx('thud', T('k2', '锁住'), { g: 0.4 });
    // k3 旧值进 undo，回滚指针指向它
    appear(old, T('k3', '旧值')); fromTo(old, T('k3', '旧值'), { x: 0, y: 0 }, { x: 262 + 30 - (56 + 8 + 82), y: 46 - 42, duration: 0.7, ease: 'power2.inOut' });
    arrowIn(ptr, T('k3', '回滚指针'), 0.5);
    // k4 改这一页：42 → 43，这一页成了脏页
    swaps(rowT, [[T('k4', '改这一页'), '2050 · 43']]); lit(pg, 's10-dirty', T('k4', '脏页') - 0.1, T('k7', '写回') + 0.7);
    appear(dirty, T('k4', '脏页') - 0.1); vanish(dirty, T('k7', '写回') + 0.7);
    // k5 记进 redo（内存里的日志缓冲）
    slam(rq, T('k5', 'redo'), { from: 1.5 }); sfx('pop', T('k5', 'redo'), { g: 0.4 });
    // k6 提交：redo 写到磁盘上，锁随之放开
    fromTo(rq, T('k6', '磁盘'), { y: 0 }, { y: 100, duration: 0.6, ease: 'power2.inOut' });
    exit(lk, T('k6', '放开'), { y: -12, d: 0.35 }); sfx('chime', T('k6', '提交'), { g: 0.4 });
    // k7 脏页稍后写回数据文件
    appear(pgCopy, T('k7', '写回') - 0.1); fromTo(pgCopy, T('k7', '写回') - 0.1, { y: 0, opacity: 0.9 }, { y: 100, opacity: 0.9, duration: 0.8, ease: 'power2.inOut' }); vanish(pgCopy, T('k7', '写回') + 0.7);
    // k10 别人来读：读 undo 里的旧版本；k10z 别人要改：等这把锁（锁再出现一下，表示「这期间」）
    show(bob, T('k10', '别人'), { y: 6, d: 0.3 }); arrowIn(bobL, T('k10', 'undo') - 0.2, 0.4);
    show(carol, T('k10z', '别人'), { y: 6, d: 0.3 }); arrowIn(carolL, T('k10z', '等'), 0.4);
    const lk2 = lockAt(art, 56 + 8 + 128 + 10, 38, ''); vanish(lk2, 0); slam(lk2, T('k10z', '锁') - 0.1, { from: 1.4 });
    // 讲到哪个部件，哪个部件整块变色（页 27：动它时浅青，成了脏页时砖红；其余深青）
    { const WIN = [[pg, 's10-pga', [[T('k2'), T('k3')], [T('k4', '改这一页'), T('k4', '脏页')], [T('k10z'), Tend('k10z') + 0.3]]], [pg, 's10-pgd', [[T('k4', '脏页'), T('k5')]]],
        [und, 's10-act', [[T('k3'), T('k4')], [T('k10'), T('k10z')]]], [rlog, 's10-act', [[T('k5'), T('k6')]]], [rfile, 's10-act', [[T('k6'), T('k7')]]], [fileB, 's10-act', [[T('k7'), T('k10')]]]];
      WIN.forEach(([e, cls, ws]) => { let last = null; F((t) => { const on = ws.some(([a, b]) => t >= a && t < b); if (on === last) return; last = on; e.classList.toggle(cls, on); }); }); }
    answer(3, '锁行 → undo → redo，提交时 redo 落盘<br>别人读旧版本；要改同一行就等锁', T('k10z')); }

  // 5 出错怎么办：崩溃后重启——redo 带子从头扫一遍，提交了的修改回来；再用 undo 里的旧值，撤掉没提交的
  { const { art } = tiles[4], ov5 = overlay(art);
    const bolt = h('div', 'abs', tiles[4].e, MARK.bolt(34)); px(bolt, 476, 12);
    txt(art, 0, 4, 'redo', { fontFamily: 'Mono', fontSize: '22px', color: 'var(--ink2)' });
    const tape = box(art, 70, 0, 426, 36, 'var(--band)', 'var(--edge)');
    for (let k = 0; k < 6; k++) box(tape, 10 + k * 68, 7, 54, 20, 'var(--pale)', 'var(--main)');
    const head = box(tape, 0, 0, 6, 33, 'var(--main)', 'var(--main)');
    const pg = box(art, 0, 52, 314, 132, 'var(--panel)'); txt(pg, 8, 4, '数据页', { fontFamily: '"Sans SC"', fontSize: '22px', color: 'var(--ink2)' });
    const rC = box(pg, 10, 44, 292, 34, 'var(--panel)', 'var(--edge)'); css(rC, { borderStyle: 'dashed' });
    const rCt = txt(rC, 10, 3, '已提交的修改：还没写回', { fontFamily: '"Sans SC"', color: 'var(--ink2)' });
    const rU = box(pg, 10, 88, 292, 34, 'var(--panel)', 'var(--acc)'); rU.classList.add('s10-unc');
    const rUt = txt(rU, 10, 3, '没提交的修改', { fontFamily: '"Sans SC"', color: 'var(--acc)', fontWeight: 700 });
    const und = box(art, 332, 52, 164, 132, 'var(--pale)', 'var(--main)'); txt(und, 8, 4, 'undo', { fontFamily: 'Mono', fontSize: '22px', color: 'var(--ink2)' });
    const chip = box(art, 0, 0, 66, 34, 'var(--main)', 'var(--main)'); { const t_ = txt(chip, 0, 2, '旧值', { color: '#fff', fontSize: '22px', fontFamily: '"Sans SC"', lineHeight: '28px' }); css(t_, { width: '64px', textAlign: 'center' }); } px(chip, 332 + 50, 52 + 66);
    art.appendChild(ov5);
    vanish(bolt, 0); slam(bolt, T('k11') + 0.1, { from: 1.8 }); sfx('error', T('k11') + 0.1, { g: 0.4 });
    // 重做：读头沿 redo 走一遍；走完，提交了的修改回到页里
    const tR0 = T('k11', '重做') - 0.4, tR1 = tR0 + 1.3;
    let lastH = null;
    F((t) => { const k = clamp((t - tR0) / (tR1 - tR0)), x = Math.round(k * 418), on = t >= tR0 - 0.2; const key = on ? x : -1; if (key === lastH) return; lastH = key; head.style.visibility = on ? 'visible' : 'hidden'; head.style.left = x + 'px'; });
    lit(rC, 's10-ok', tR1, Infinity); swaps(rCt, [[tR1, '已提交的修改：回来了']]); lit(rCt, 'c-ink', tR1); sfx('pop', tR1, { g: 0.4 });
    // 撤销：undo 里的旧值回到页里，没提交的修改撤掉
    const tU = T('k11z', 'undo');
    fromTo(chip, tU, { x: 0, y: 0 }, { x: 10 + 200 - (332 + 50), y: 52 + 88 - (52 + 70), duration: 0.7, ease: 'power2.inOut' }); vanish(chip, tU + 0.75);
    lit(rU, 's10-gone', T('k11z', '撤掉'), Infinity); swaps(rUt, [[T('k11z', '撤掉'), '没提交的修改：撤掉了']]); sfx('whoosh', tU, { g: 0.35 });
    answer(4, '先用 redo 重做：提交了的回来<br>再用 undo 撤掉没提交的', T('k11') + 0.2); }

  // 章末：五块都亮一下
  tiles.forEach((tt, i) => lit(tt.e, 'full', s.end - 1.4 + i * 0.1));
  st.textContent += '.s10t.full { opacity: 1; }';
});
