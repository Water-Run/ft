// 收束：一个库一个文件 → 公有领域与源码里的祝福（3.54.1 的 src/btree.c 第 1–9 行原文）→ 全系列总结：事务型 OLTP（MySQL、PostgreSQL、SQLite，按行存）
// → 几十亿行算平均年龄：分析型 OLAP；OLTP 的 T 变成 A → 按行存要读整行 → ClickHouse 每一列单独存 → 从极小到极大。
// 事实：G01、G04、G14、G15、G08、G06。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const t0 = s.start + 0.1;
  // e1：没有服务进程，一个库，一个文件
  const prog = h('div', 'abs', W); px(prog, 420, 300, 640, 150); css(prog, { border: `2px solid ${K.ink}`, background: '#fff' });
  tx(prog, '应用程序', 20, 10, { fs: 24 });
  const lib = h('div', 'abs', prog, 'SQLite'); px(lib, 250, 50, 340, 70); css(lib, { border: `2px solid ${K.teal}`, background: K.wheat, color: K.teal, fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const f = h('div', 'abs', W); px(f, 1260, 320, 220, 110); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', f); px(r, i * 10, i * 10, 190, 80); }
  tx(f, 'main.db', 0, 96, { fs: 24, mono: true });
  const a = line(ov, [[1060, 375], [1258, 375]]);
  wipe(prog, t0, { dir: 'l', d: 0.4 }); show(f, T('e1', '一个文件') - 0.1, { x: -12, y: 0 }); arrowIn(a, T('e1', '一个文件'), 0.4);
  const noS = tx(W, '没有服务进程', 1070, 318, { fs: 24, color: '#555555' }); set(noS, 0, { autoAlpha: 0 }); show(noS, T('e1', '服务进程'), { y: 6 });
  // e2–e2b：代码属于公有领域；每位作者都签了声明
  const tP = T('e2') - 0.2;
  [prog, f, a, noS].forEach((e) => gone(e, tP, 0.3));
  const pd = h('div', 'abs', W, '<div style="font-size:26px;color:#044a64">SQLite Is Public Domain</div><div style="font-size:30px;margin-top:6px">代码与文档都献给公有领域：任何人都可以自由使用</div>'); px(pd, 120, 250); css(pd, { borderLeft: `6px solid ${K.teal}`, paddingLeft: '20px' });
  set(pd, 0, { autoAlpha: 0 }); wipe(pd, T('e2') - 0.1, { dir: 'l', d: 0.45 }); sfx('pop', T('e2'), { g: 0.4 });
  const aff = h('div', 'abs', W, '<div style="font-size:24px">声明</div><div style="font-size:24px;color:#555;margin-top:6px">我把自己写的代码献给公有领域</div><div style="margin-top:14px;border-top:1.5px solid #000;width:240px;font-size:24px;color:#555">签名</div>'); px(aff, 1340, 230, 420, 170);
  css(aff, { border: `2px solid ${K.ink}`, background: '#fff', padding: '14px 20px', boxSizing: 'border-box' }); aff.dataset.name = '作者的声明';
  set(aff, 0, { autoAlpha: 0 }); slam(aff, T('e2b'), { from: 1.15 }); sfx('thud', T('e2b'), { g: 0.4 });
  // e3–e6：源码文件的开头没有版权声明，代替它的是一段祝福（src/btree.c 第 1–9 行原文）
  const SRC = ['/*', '** 2004 April 6', '**', '** The author disclaims copyright to this source code.  In place of', '** a legal notice, here is a blessing:', '**', '**    May you do good and not evil.', '**    May you find forgiveness for yourself and forgive others.', '**    May you share freely, never taking more than you give.', '**'];
  const fname = tx(W, 'src/btree.c　（SQLite 3.54.1）', 120, 410, { fs: 24, mono: true, color: K.dim });
  const code = codeBlock(W, SRC.map(esc), 120, 450, { fs: 24 }); code.dataset.name = '源码开头';
  const lines = [...code.children];
  show(fname, T('e3', '源码') - 0.2, { y: 6 }); set(code, 0, { autoAlpha: 0 }); wipe(code, T('e3', '源码'), { dir: 't', d: 0.5 }); sfx('whoosh', T('e3', '源码'), { g: 0.3 });
  
  const zh = ['愿你行善，不作恶', '愿你宽恕自己，也宽恕他人', '愿你自由分享，所取不多于所予'];
  const cues = ['e4', 'e5', 'e6'];
  const zhEls = zh.map((z, i) => {
    set(lines[6 + i], T(cues[i]) - 0.05, { backgroundColor: K.wheat });
    const g = tx(W, z, 1180, 450 + (6 + i) * 33.6 - 2, { fs: 26, color: K.teal }); show(g, T(cues[i]), { x: -10, y: 0 }); sfx('tick', T(cues[i]), { g: 0.3 });
    return g;
  });

  // ── e7–e8d：回头看：Alice 的每一步只读写几行：事务型 OLTP；前几期的 MySQL、PostgreSQL 和 SQLite 都是事务型，都按行存 ──
  const tO = T('e7') - 0.2;
  [pd, aff, fname, code].forEach((e) => gone(e, tO, 0.4));
  zhEls.forEach((e) => gone(e, tO, 0.4));
  const tbl = h('div', 'abs', W); px(tbl, 120, 300, 720, 400); tbl.dataset.name = '按行存的表';
  const head = h('div', 'abs', tbl); px(head, 0, 0, 720, 50); css(head, { display: 'flex', borderBottom: `1.5px solid ${K.rule}`, fontWeight: 700, fontSize: '26px' });
  ['id', 'name', 'age'].forEach((c, i) => { const e = h('div', '', head, c); css(e, { width: [140, 380, 200][i] + 'px', padding: '8px 12px', fontFamily: 'Mono' }); });
  const rowsData = [['2049', 'User02049-…', '51'], ['2050', 'Alice', '42'], ['2051', 'User02051-…', '53'], ['2052', 'User02052-…', '54'], ['…', '…', '…']];
  const rowEls = rowsData.map((r, i) => { const e = h('div', 'abs', tbl); px(e, 0, 58 + i * 56, 720, 50); css(e, { display: 'flex', border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '26px', fontFamily: 'Mono', boxSizing: 'border-box' }); r.forEach((v, j) => { const c = h('div', '', e, v); css(c, { width: [140, 380, 200][j] + 'px', padding: '8px 12px', borderLeft: j ? '1px solid #bbb' : 'none', boxSizing: 'border-box' }); }); return e; });
  show(head, tO + 0.3, { y: 6 }); rowEls.forEach((e, i) => show(e, tO + 0.4 + i * 0.08, { x: -12, y: 0, d: 0.3 }));
  rowEls.forEach((e) => { e.dataset.beat = 'line'; }); set(rowEls[1], T('e7', '几行'), { backgroundColor: K.wheat }); sfx('tick', T('e7', '几行'), { g: 0.4 });
  // OLTP：四个字母，后面换掉 T
  const L4 = ['O', 'L', 'T', 'P'].map((c, i) => { const e = h('div', 'abs', W, c); px(e, 1000 + i * 120, 300, 110, 140); css(e, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', boxSizing: 'border-box' }); return e; });
  L4.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); slam(e, T('e8', 'O L T P') + i * 0.08, { from: 1.25 }); }); sfx('thud', T('e8', 'O L T P'), { g: 0.5 });
  const exp = tx(W, 'Online <b>Transaction</b> Processing　事务型', 1000, 460, { fs: 30 }); exp.dataset.gloss = 'OLTP';
  show(exp, T('e8', '事务型') - 0.1, { y: 8 });
  const dbs = ['MySQL', 'PostgreSQL', 'SQLite'].map((n, i) => { const b = btn(W, n, 1000 + i * 250, 540, 28); set(b, 0, { autoAlpha: 0 }); slam(b, T('e8b', i === 0 ? 'My S Q L' : i === 1 ? 'Postgres' : 'S Q Lite'), { from: 1.2 }); return b; });
  const allT = tx(W, '都是事务型数据库', 1000, 610, { fs: 28, color: K.teal }); show(allT, T('e8c', '事务型'), { y: 6 });
  const rowNote = tx(W, '按行存：一行的几个值挨在一起，取整行正好', 120, 720, { fs: 26 }); show(rowNote, T('e8d', '按行存'), { y: 6 });
  rowEls.forEach((e, i) => set(e, T('e8d', '取整行') + i * 0.05, { borderColor: K.teal }));

  // ── e9–e10c：几十亿行算平均年龄：分析型 OLAP；从 OLTP 到 OLAP，只换了一个字母 ──
  const tA = T('e9') - 0.2;
  [rowNote, allT, ...dbs].forEach((e) => gone(e, tA, 0.3));
  const avg = codeBlock(W, ['SELECT avg(age) FROM users;　-- 几十亿行'], 120, 250, { fs: 26 }); set(avg, 0, { autoAlpha: 0 }); show(avg, T('e9', '平均年龄') - 0.3, { y: 0, d: 0.3 });
  const many = tx(W, '…… 几十亿行', 140, 640, { fs: 28, color: K.dim }); show(many, T('e9', '几十亿行'), { y: 8 });
  const tMorph = T('e10b', '一个字母');
  const Tl = L4[2], Al = h('div', 'abs', W, 'A'); px(Al, 1000 + 2 * 120, 300, 110, 140); css(Al, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: K.wheat, boxSizing: 'border-box' });
  set(Al, 0, { autoAlpha: 0 });
  tl.fromTo(Tl, { rotationX: 0 }, { rotationX: 90, duration: 0.3, ease: 'power1.in', immediateRender: false }, tMorph - 0.3);
  set(Tl, tMorph, { autoAlpha: 0 }); set(Al, tMorph, { autoAlpha: 1 });
  tl.fromTo(Al, { rotationX: -90 }, { rotationX: 0, duration: 0.35, ease: 'power1.out', immediateRender: false }, tMorph); sfx('pop', tMorph, { g: 0.5 });
  const gA = gloss(W, 'OLAP', '在海量数据上做计算：分析型', 1000, 540, 560); show(gA, T('e10', 'O L A P'), { y: 8 }); sfx('pop', T('e10', 'O L A P'), { g: 0.4 });
  keyed(exp).at(tMorph, { html: 'Online <b style="background:#f5deb3">Analytical</b> Processing　分析型' });
  const tlbl = tx(W, 'T 是事务 Transaction', 1000, 640, { fs: 26 }), albl = tx(W, 'A 是分析 Analytical', 1000, 684, { fs: 26, color: K.teal });
  show(tlbl, T('e10c', 'T 是事务'), { x: -8, y: 0 }); show(albl, T('e10c', 'A 是分析'), { x: -8, y: 0 });
  // e11：按行存，就得把每一行整个读进来，连同用不到的列
  const tR = T('e11') - 0.2;
  [gA, tlbl, albl].forEach((e) => gone(e, tR, 0.3));
  rowEls.forEach((e, i) => set(e, T('e11', '整个读进来') + i * 0.08, { backgroundColor: '#f7e6c4' }));
  const waste = tx(W, '只要 age，却把 id、name 一起读进来', 120, 720, { fs: 26, color: K.red }); show(waste, T('e11', '用不到的列'), { y: 6 });
  // e12–e12b：数据库的另一端是 ClickHouse：每一列单独存放，只读要用的那几列
  const tC = T('e12') - 0.2;
  gone(waste, tC, 0.3); gone(many, tC, 0.3);
  const colX = [1000, 1220, 1560], colW = [190, 310, 190], names = ['id', 'name', 'age'];
  const cols = names.map((n, j) => { const c = h('div', 'abs', W); px(c, colX[j], 520, colW[j], 330); css(c, { border: `2px solid ${K.ink}`, background: j === 2 ? '#fff' : '#fff', boxSizing: 'border-box', fontFamily: 'Mono', fontSize: '24px', padding: '8px 12px' }); c.innerHTML = `<b>${n}</b><br>` + rowsData.slice(0, 4).map((r) => r[j]).join('<br>') + '<br>…'; return c; });
  const ch = tx(W, 'ClickHouse：每一列单独存放', 1000, 470, { fs: 28, color: K.teal });
  show(ch, T('e12', 'Click House'), { y: 6 }); cols.forEach((c, j) => wipe(c, T('e12', 'Click House') + 0.2 + j * 0.12, { dir: 't', d: 0.4 }));
  [L4[0], L4[1], L4[3], Al, exp].forEach((e) => gone(e, tC, 0.3));
  set(cols[2], T('e12b', '要用的'), { backgroundColor: K.wheat, borderColor: K.teal, borderWidth: '3px' });
  [cols[0], cols[1]].forEach((c) => dim(c, T('e12b', '要用的') + 0.1, 0.3));
  const only = tx(W, '只读 age 这一列', colX[2], 860, { fs: 26, color: K.teal }); show(only, T('e12b', '要用的'), { y: 6 }); sfx('chime', T('e12b', '要用的'), { g: 0.45 });
  // e13：从极小，到极大
  const tE = T('e13') - 0.2;
  const small = tx(W, 'SQLite：一个文件，553 页', 120, 860, { fs: 28 }), big = tx(W, '下一期：ClickHouse', 1500, 260, { fs: 34, color: K.teal });
  show(small, T('e13', '极小'), { y: 6 }); show(big, T('e13', '极大'), { y: 6 }); sfx('thud', T('e13', '极大'), { g: 0.5 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('e1', '服务进程'), noS], [T('e1', '一个库'), lib], [T('e1', '一个文件'), f], [T('e2', '公有领域'), pd.children[0]], [T('e2', '自由使用'), pd.children[1]], [T('e2b'), aff.children[0]], [T('e2b', '签了声明'), aff.children[2]], [T('e2b', '献给'), aff.children[1]],
    [T('e3', '源码'), fname], [T('e3', '版权声明'), lines[3]], [T('e3', '祝福'), lines[4]], [T('e4'), zhEls[0]], [T('e5'), zhEls[1]], [T('e6'), zhEls[2]], [T('e7'), head], [T('e7', 'Alice'), rowEls[1].children[1]], [T('e7', '几行'), rowEls], [T('e8', '事务型'), exp], [T('e8b'), dbs[0]], [T('e8b', 'Postgres'), dbs[1]], [T('e8b', 'S Q Lite'), dbs[2]], [T('e8c'), allT], [T('e8d'), rowNote], [T('e9'), avg], [T('e9', '几十亿行'), many], [T('e10'), gA], [T('e10b'), exp], [T('e10c'), tlbl], [T('e10c', 'A 是分析'), albl], [T('e11'), waste], [T('e12'), ch], [T('e12b'), only], [T('e13', '极小'), small], [T('e13', '极大'), big]], Tend('e13') + 1);
  // 补音效（check.js 报的长空档）
  sfx('pop', T('e8b', 'My S Q L'), { g: 0.3 });
  sfx('pop', T('e8b', 'Postgres'), { g: 0.3 });
  sfx('pop', T('e8b', 'S Q Lite'), { g: 0.3 });
  sfx('tick', T('e8c', '事务型'), { g: 0.3 });
  sfx('tick', T('e8d', '取整行'), { g: 0.3 });
  sfx('pop', T('e9', '平均年龄') - 0.3, { g: 0.3 });
  sfx('tick', T('e9', '几十亿行'), { g: 0.3 });
  sfx('tick', T('e10c', 'T 是事务'), { g: 0.3 });
  sfx('tick', T('e10c', 'A 是分析'), { g: 0.3 });
  sfx('tick', T('e11', '整个读进来'), { g: 0.3 });
  sfx('whoosh', T('e12', 'Click House') + 0.2, { g: 0.3 });
  sfx('tick', T('e13', '极小'), { g: 0.3 });
  stay(cam, s, c0, 1);
});
