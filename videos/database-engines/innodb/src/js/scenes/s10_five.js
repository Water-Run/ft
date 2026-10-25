// 第 10 章 五个问题：一个数据库引擎必须回答的五个问题（与 MyISAM 一集结尾相同，系列每集都要），InnoDB 的回答。
// 照 MyISAM 一集结尾的画法（WaterRun 2026-10-25：「五个问题部分还是直接展现就好, 类似片尾总结, 就和MyISAM一样. 确保直观, 抓重点」）：
// 一屏五块小画面，每块用前面那一章的画法重演一个最小过程；讲到哪一问，哪一块亮起来、动起来，写出一行重点。
// 一 放：.ibd、表就是主键 B+ 树（M1、S8）；二 找：根页到叶子、二级索引再回表（L2、M2）；三 改和删：undo、删除标记与清除（M14、M8）；
// 四 事务与并发：一笔事务的六步在这一块里依次点亮——锁行（X5）→ 旧值进 undo（X1）→ 缓冲池里改页成脏页（M27）→ 记 redo（M12）
//    → 提交：redo 落盘、锁放开（S7、X6）→ 脏页稍后写回（M31）；别人读旧版本、要改就等锁（M9、X3、X5）；五 出错：先 redo 重做，再 undo 撤销（M12、R3）。
scene('s10', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, 1, ['k8b', 'k8c', 'k9', 'k5', 'k10', 'k11']);              // 镜头只极慢横移（parts.js）
  const st = h('style', '', W);
  st.textContent = `
.s10t { position: absolute; background: var(--panel); border: 1.5px solid var(--edge); opacity: .55; }
.s10t.lit { opacity: 1; border-color: var(--main); outline: 1.5px solid var(--main); outline-offset: -3px; }
.s10t .q { position: absolute; left: 22px; top: 14px; font: 800 30px "Sans SC"; color: var(--ink); }
.s10t .n { color: var(--main); margin-right: 10px; font-family: Inter; }
.s10t .a { position: absolute; left: 22px; right: 18px; bottom: 14px; font: 600 24px "Sans SC"; color: var(--mainD); line-height: 1.4; white-space: normal; }
.s10s { position: absolute; font: 500 22px "Sans SC"; color: var(--ink2); white-space: nowrap; }
.s10s.on { color: var(--ink); font-weight: 700; }
.s10s .k { display: inline-block; width: 26px; color: var(--main); font: 700 22px Inter; }
`;
  const hd = h('div', 'abs', W, '<span style="font:800 40px \'Sans SC\';color:var(--ink)">五个问题</span><span class="t-note" style="margin-left:16px">一个数据库引擎必须回答的</span>');
  px(hd, 120, 84); slide(hd, c0 + 0.1, { x: -30 });
  // 五块：上排三块、下排两块（与 MyISAM 一集同一个排法）
  const TW = 540, TH = 340;
  const TILES = [['数据怎么放', 120, 160, 'k8a', 'k8az'], ['怎么找', 690, 160, 'k8b', 'k8bz'], ['改和删', 1260, 160, 'k8c', 'k8cz'], ['事务与并发', 405, 540, 'k9', 'k10z'], ['出错怎么办', 975, 540, 'k11', 'k11z']];
  const tiles = TILES.map(([q, x, y, a, b], i) => {
    const e = h('div', 's10t', W, `<div class="q"><span class="n">${i + 1}</span>${q}</div>`); px(e, x, y, TW, TH);
    const art = h('div', 'abs', e); px(art, 22, 64, TW - 44, TH - 130);
    wipe(e, c0 + 0.3 + i * 0.12, { dir: 't', d: 0.4 }); sfx('tick', c0 + 0.3 + i * 0.12, { g: 0.3 });
    lit(e, 'lit', T(a) - 0.2, Tend(b) + 0.3);
    return { e, art, t0: T(a), t1: T(b) };
  });
  const answer = (i, html, t) => { const e = h('div', 'a', tiles[i].e, html); vanish(e, 0); show(e, t, { y: 8, d: 0.35 }); return e; };
  const box = (par, x, y, w, hh, bg = 'var(--panel)', bd = 'var(--mainD)') => { const e = h('div', 'abs', par); px(e, x, y, w, hh); css(e, { background: bg, border: `1.5px solid ${bd}` }); return e; };
  const txt = (par, x, y, html, css_ = {}) => { const e = h('div', 'abs', par, html); px(e, x, y); css(e, { font: '600 22px Inter', color: 'var(--ink2)', ...css_ }); return e; };

  // 1 数据怎么放：一个 .ibd 文件；表本身就是一棵按主键排好的 B+ 树（根在上，叶子成排相连，行在叶子里）
  { const { art } = tiles[0], ov1 = overlay(art);
    const file = txt(art, 0, 0, 'users.ibd', { fontFamily: 'Mono', color: 'var(--ink)' });
    const root = box(art, 190, 34, 110, 30, 'var(--pale)'); txt(root, 20, 2, '根页');
    const lv = [0, 1, 2, 3].map((k) => { const b = box(art, 20 + k * 118, 110, 96, 70, 'var(--teal)'); for (let r = 0; r < 3; r++) box(b, 8, 10 + r * 18, 78, 10, 'var(--main)', 'var(--main)'); return b; });
    const br = [0, 1, 2, 3].map((k) => path(ov1, `M245,64 L${68 + k * 118},110`, 'mainD', { w: 1.4, arrow: false }));
    const ln = [0, 1, 2].map((k) => path(ov1, `M${116 + k * 118},145 L${138 + k * 118},145`, 'main', { w: 2.4, arrow: false }));
    art.appendChild(ov1);
    const t0 = tiles[0].t0; [root, ...lv].forEach((e, k) => { vanish(e, 0); show(e, t0 + 0.2 + k * 0.12, { y: 10, d: 0.3 }); });
    [...br, ...ln].forEach((p_) => { p_.setAttribute('opacity', 0); tl.to(p_, { opacity: 1, duration: 0.3 }, T('k8az') + 0.1); });
    answer(0, '一个 .ibd 文件；表本身是一棵按主键排好的 B+ 树', T('k8az')); }

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
    answer(1, '从根页走到叶子；按名字找：二级索引 → 回表', T('k8bz')); }

  // 3 改和删：改之前，旧值先进 undo；删掉的行先打标记，没人需要了再清除
  { const { art } = tiles[2];
    const row = box(art, 0, 10, 260, 46); txt(row, 12, 9, '2050 Alice', { color: 'var(--ink)' });
    const age = box(art, 190, 18, 56, 30, 'var(--pale)'); txt(age, 10, 1, '42', { color: 'var(--mainD)' });
    const undo = box(art, 320, 4, 170, 58, 'var(--pale)', 'var(--main)'); txt(undo, 10, 4, 'undo', { fontFamily: 'Mono', fontSize: '22px' });
    const old = box(art, 0, 0, 44, 26, 'var(--main)', 'var(--main)'); txt(old, 8, 0, '42', { color: '#fff', fontSize: '22px' }); px(old, 196, 20);
    swaps(age.firstChild, [[T('k8c', '旧值') + 0.6, '43']]);
    vanish(old, 0); appear(old, T('k8c', '旧值')); fromTo(old, T('k8c', '旧值'), { x: 0, y: 0 }, { x: 330 - 196 + 70, y: 30 - 20, duration: 0.7, ease: 'power2.inOut' });
    const del = box(art, 0, 100, 260, 46); txt(del, 12, 9, '2050 Alice', { color: 'var(--ink2)' });
    const flg = txt(del, 170, 9, '删除标记 1', { fontFamily: '"Sans SC"', color: 'var(--acc)' });
    vanish(del, 0); show(del, T('k8cz') - 0.1, { y: 8, d: 0.3 }); vanish(flg, 0); appear(flg, T('k8cz') + 0.1);
    exit(del, T('k8cz', '清除'), { y: -14, d: 0.5 }); sfx('pop', T('k8cz', '标记'), { g: 0.4 }); sfx('whoosh', T('k8cz', '清除'), { g: 0.35 });
    answer(2, '改：旧值先进 undo；删：先打标记，没人需要了再清除', T('k8cz')); }

  // 4 事务与并发：一笔事务的六步依次点亮（k2–k7），再是两条「别人」（k10、k10z）
  { const { art } = tiles[3];
    const STEPS = [['k2', '锁住要改的行'], ['k3', '旧值写进 undo，回滚指针指向它'], ['k4', '缓冲池里改这一页，成了脏页'], ['k5', '这次修改记进 redo'], ['k6', '提交：redo 写到磁盘，锁放开'], ['k7', '脏页稍后再写回数据文件']];
    STEPS.forEach(([c, t_], k) => { const e = h('div', 's10s', art, `<span class="k">${k + 1}</span>${t_}`); px(e, 0, k * 30); vanish(e, 0); show(e, T(c) - 0.1, { x: -10, y: 0, d: 0.3 }); lit(e, 'on', T(c) - 0.1, Tend(c) + 0.3); sfx('tick', T(c), { g: 0.35 }); });
    const o1 = h('div', 's10s', art, '<b style="color:var(--main)">别人来读</b>：读 undo 里的旧版本'), o2 = h('div', 's10s', art, '<b style="color:var(--acc)">别人要改</b>：等这把锁');
    px(o1, 0, 186); px(o2, 0, 214);
    vanish(o1, 0); show(o1, T('k10') - 0.1, { y: 6, d: 0.3 }); vanish(o2, 0); show(o2, T('k10z') - 0.1, { y: 6, d: 0.3 }); }

  // 5 出错怎么办：重启时先用 redo 重做，再用 undo 撤掉没提交的
  { const { art } = tiles[4];
    const tape = box(art, 0, 20, 490, 34, 'var(--pale)'); txt(art, 0, -4, 'redo', { fontFamily: 'Mono', fontSize: '22px' });
    const scan = box(tape, 0, 0, 0, 30, 'var(--teal)', 'var(--teal)');
    fromTo(scan, T('k11', '重做') - 0.4, { width: 0 }, { width: 486, duration: 1.0, ease: 'power2.inOut' });
    const st1 = txt(art, 0, 70, '① 先重做：提交了的修改回来', { fontFamily: '"Sans SC"', color: 'var(--main)', fontWeight: 700 });
    const st2 = txt(art, 0, 106, '② 再撤销没提交的', { fontFamily: '"Sans SC"', color: 'var(--acc)', fontWeight: 700 });
    vanish(st1, 0); show(st1, T('k11', '重做'), { y: 6, d: 0.3 }); vanish(st2, 0); show(st2, T('k11z', 'undo'), { y: 6, d: 0.3 });
    sfx('pop', T('k11', '重做'), { g: 0.4 }); sfx('pop', T('k11z', 'undo'), { g: 0.4 });
    answer(4, '先 redo 重做，再 undo 撤销', T('k11z')); }

  // 章末：五块都亮一下
  tiles.forEach((tt, i) => lit(tt.e, 'full', s.end - 1.4 + i * 0.1));
  st.textContent += '.s10t.full { opacity: 1; }';
});
