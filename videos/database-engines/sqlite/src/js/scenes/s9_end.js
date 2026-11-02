// 收束（第 11 稿）：公有领域与作者的声明 → 源码开头（3.54.1 的 src/btree.c 第 1–9 行原文）→ 三句祝福升华：源码退到背景，中文大字一句句升起，原文在下，念完停一停
// → 前几期与这一期都是事务型 OLTP、按行存 → 几十亿行里算平均年龄：分析型 OLAP；OLTP 的 T 翻成 A（T、A 的全称只上画面）
// → 一行挨着一行换成一列挨着一列 → SQLite 极小（一个库、一个文件）→ ClickHouse 极大（几十亿、上万亿行）→ 从极小，到极大。
// 事实：G04、G14、G15、G08、G06、G07。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);

  // e2–e2b：代码属于公有领域；每位作者都签了声明
  const pd = h('div', 'abs', W, '<div style="font-size:26px;color:#044a64">SQLite Is Public Domain</div><div style="font-size:30px;margin-top:6px">代码与文档都献给公有领域：任何人都可以自由使用</div>'); px(pd, 120, 250); css(pd, { borderLeft: `6px solid ${K.teal}`, paddingLeft: '20px' });
  set(pd, 0, { autoAlpha: 0 }); wipe(pd, T('e2') - 0.1, { dir: 'l', d: 0.45 }); sfx('pop', T('e2'), { g: 0.4 });
  const aff = h('div', 'abs', W, '<div style="font-size:24px">声明</div><div style="font-size:24px;color:#555;margin-top:6px">我把自己写的代码献给公有领域</div><div style="margin-top:14px;border-top:1.5px solid #000;width:240px;font-size:24px;color:#555">签名</div>'); px(aff, 1340, 230, 420, 170);
  css(aff, { border: `2px solid ${K.ink}`, background: '#fff', padding: '14px 20px', boxSizing: 'border-box' }); aff.dataset.name = '作者的声明';
  set(aff, 0, { autoAlpha: 0 }); slam(aff, T('e2b'), { from: 1.15 }); sfx('thud', T('e2b'), { g: 0.4 });
  // e3：源码文件的开头没有版权声明，代替它的是一段祝福（src/btree.c 第 1–9 行原文）
  const SRC = ['/*', '** 2004 April 6', '**', '** The author disclaims copyright to this source code.  In place of', '** a legal notice, here is a blessing:', '**', '**    May you do good and not evil.', '**    May you find forgiveness for yourself and forgive others.', '**    May you share freely, never taking more than you give.', '**'];
  const fname = tx(W, 'src/btree.c　（SQLite 3.54.1）', 120, 410, { fs: 24, mono: true, color: K.dim });
  const code = codeBlock(W, SRC.map(esc), 120, 450, { fs: 24 }); code.dataset.name = '源码开头';
  const lines = [...code.children];
  show(fname, T('e3', '源码') - 0.2, { y: 6 }); set(code, 0, { autoAlpha: 0 }); wipe(code, T('e3', '源码'), { dir: 't', d: 0.5 }); sfx('whoosh', T('e3', '源码'), { g: 0.3 });
  // e4–e6：三句祝福升华——源码与声明退到背景，中文大字居中一句句升起，下面是原文；念完停一停（e6 后 2.5 秒）
  const tB = T('e4') - 0.7;
  [pd, aff, fname, code].forEach((e) => gone(e, tB, 0.8));
  const ZH = ['愿你行善，不作恶', '愿你宽恕自己，也宽恕他人', '愿你自由分享，所取不多于所予'];
  const EN = ['May you do good and not evil.', 'May you find forgiveness for yourself and forgive others.', 'May you share freely, never taking more than you give.'];
  const BC = ['e4', 'e5', 'e6'];
  const bl = ZH.map((z, i) => { const g = h('div', 'abs', W); px(g, 0, 300 + i * 175, 1920); css(g, { textAlign: 'center', whiteSpace: 'normal' });
    g.innerHTML = `<div style="font-size:66px;color:#044a64;letter-spacing:6px">${z}</div><div style="font-size:28px;color:#555555;font-style:italic;margin-top:12px">${EN[i]}</div>`;
    set(g, 0, { autoAlpha: 0 }); show(g, T(BC[i]) - 0.2, { y: 30, d: 1.6, ease: 'power2.out' }); sfx('tick', T(BC[i]), { g: 0.3 }); return g; });
  const tO = T('e7') - 0.5;
  bl.forEach((g) => gone(g, tO, 0.7));

  // e7–e8：前几期的 MySQL、PostgreSQL 和这一期的 SQLite，做的都是同一类工作：每次只读写几行，事务型 OLTP；都按行存
  const tbl = h('div', 'abs', W); px(tbl, 120, 300, 720, 400); tbl.dataset.name = '按行存的表';
  const head = h('div', 'abs', tbl); px(head, 0, 0, 720, 50); css(head, { display: 'flex', borderBottom: `1.5px solid ${K.rule}`, fontWeight: 700, fontSize: '26px' });
  ['id', 'name', 'age'].forEach((c, i) => { const e = h('div', '', head, c); css(e, { width: [140, 380, 200][i] + 'px', padding: '8px 12px', fontFamily: 'Mono' }); });
  const rowsData = [['2049', 'User02049-…', '51'], ['2050', 'Alice', '42'], ['2051', 'User02051-…', '53'], ['2052', 'User02052-…', '54'], ['…', '…', '…']];
  const rowEls = rowsData.map((r, i) => { const e = h('div', 'abs', tbl); px(e, 0, 58 + i * 56, 720, 50); css(e, { display: 'flex', border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '26px', fontFamily: 'Mono', boxSizing: 'border-box' }); r.forEach((v, j) => { const c = h('div', '', e, v); css(c, { width: [140, 380, 200][j] + 'px', padding: '8px 12px', boxSizing: 'border-box' }); }); return e; });
  show(head, tO + 0.5, { y: 6 }); rowEls.forEach((e, i) => show(e, tO + 0.6 + i * 0.08, { x: -12, y: 0, d: 0.3 }));
  rowEls.forEach((e) => { e.dataset.beat = 'line'; });
  const dbs = ['MySQL', 'PostgreSQL', 'SQLite'].map((n, i) => { const b = btn(W, n, 1000 + i * 250, 540, 28); set(b, 0, { autoAlpha: 0 }); slam(b, T('e7', ['My S Q L', 'Postgres', 'S Q Lite'][i]), { from: 1.2 }); sfx('pop', T('e7', ['My S Q L', 'Postgres', 'S Q Lite'][i]), { g: 0.3, p: -0.2 + i * 0.2 }); return b; });
  set(rowEls[1], T('e8b', '几行'), { backgroundColor: K.wheat }); sfx('tick', T('e8b', '几行'), { g: 0.4 });
  const L4 = ['O', 'L', 'T', 'P'].map((c, i) => { const e = h('div', 'abs', W, c); px(e, 1000 + i * 120, 300, 110, 140); css(e, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: '#fff' }); return e; });
  L4.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); slam(e, T('e8b', 'O L T P') + i * 0.08, { from: 1.25 }); }); sfx('thud', T('e8b', 'O L T P'), { g: 0.5 });
  const exp = tx(W, 'Online <b>Transaction</b> Processing　事务型', 1000, 460, { fs: 30 }); exp.dataset.gloss = 'OLTP';
  show(exp, T('e8b', '事务型') - 0.1, { y: 8 });
  const rowNote = tx(W, '按行存：一行的几个值挨在一起', 120, 720, { fs: 28 }); show(rowNote, T('e8b', 'O L T P') + 0.9, { y: 6 });
  rowEls.forEach((e, i) => set(e, T('e8b', 'O L T P') + 1.0 + i * 0.05, { borderColor: K.teal }));

  // e9–e10b：几十亿行里算一个平均年龄：分析型 OLAP；从 OLTP 到 OLAP，只换了一个字母（T 翻成 A，全称只上画面）
  const tA = T('e9') - 0.2;
  [rowNote, ...dbs].forEach((e) => gone(e, tA, 0.3));
  const avg = codeBlock(W, ['SELECT avg(age) FROM users;　-- 几十亿行'], 120, 222, { fs: 26 }); set(avg, 0, { autoAlpha: 0 }); show(avg, T('e9', '平均年龄') - 0.3, { y: 0, d: 0.3 });
  const many = tx(W, '…… 几十亿行', 140, 640, { fs: 28, color: K.dim }); show(many, T('e9', '几十亿行'), { y: 8 });
  const gA = gloss(W, 'OLAP', '在海量数据上做计算：分析型', 1000, 540, 560); show(gA, T('e10', 'O L A P'), { y: 8 }); sfx('pop', T('e10', 'O L A P'), { g: 0.4 });
  const tMorph = T('e10b', '一个字母');
  const Tl = L4[2], Al = h('div', 'abs', W, 'A'); px(Al, 1000 + 2 * 120, 300, 110, 140); css(Al, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: K.wheat });
  set(Al, 0, { autoAlpha: 0 });
  tl.fromTo(Tl, { rotationX: 0 }, { rotationX: 90, duration: 0.3, ease: 'power1.in', immediateRender: false }, tMorph - 0.3);
  set(Tl, tMorph, { autoAlpha: 0 }); set(Al, tMorph, { autoAlpha: 1 });
  tl.fromTo(Al, { rotationX: -90 }, { rotationX: 0, duration: 0.35, ease: 'power1.out', immediateRender: false }, tMorph); sfx('pop', tMorph, { g: 0.5 });
  keyed(exp).at(tMorph, { html: 'Online <b style="background:#f5deb3">Analytical</b> Processing　分析型' });
  const tlbl = tx(W, 'T 是事务 Transaction', 1000, 640, { fs: 28 }), albl = tx(W, 'A 是分析 Analytical', 1000, 684, { fs: 28, color: K.teal });
  show(tlbl, tMorph + 0.5, { x: -8, y: 0 }); show(albl, tMorph + 1.0, { x: -8, y: 0 });

  // e11：一行挨着一行的存法，也要换成一列挨着一列——表的几行先亮，再在右边立起三列
  const tR = T('e11') - 0.2;
  [gA, tlbl, albl].forEach((e) => gone(e, tR, 0.3)); [L4[0], L4[1], L4[3], Al, exp].forEach((e) => gone(e, tR, 0.4));
  rowEls.forEach((e, i) => set(e, T('e11', '一行') + i * 0.1, { backgroundColor: '#f7e6c4' }));
  const colX = [1000, 1220, 1560], colW = [190, 310, 190], names = ['id', 'name', 'age'];
  const colV = [['2049', '2050', '2051', '2052', '…'], ['User02049-…', 'Alice', 'User02051-…', 'User02052-…', '…'], ['51', '42', '53', '54', '…']];
  const cols = names.map((n, j) => { const c = h('div', 'abs', W); px(c, colX[j], 520, colW[j], 330); css(c, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box', fontFamily: 'Mono', fontSize: '24px', padding: '8px 12px', transformOrigin: '50% 100%' });
    c.innerHTML = `<div style="font-weight:700;border-bottom:1.5px solid #444;margin-bottom:6px">${n}</div>` + colV[j].map((v) => `<div>${v}</div>`).join(''); return c; });
  cols.forEach((c, j) => wipe(c, T('e11', '一列') + j * 0.15, { dir: 't', d: 0.5 })); sfx('whoosh', T('e11', '一列'), { g: 0.3 });

  // e12–e12b：SQLite 把数据库做到了极小（一个小文件）；另一端的 ClickHouse，面对的是几十亿、上万亿行（三列一直往上长）
  const tS = T('e12') - 0.2;
  [tbl, avg, many].forEach((e) => dim(e, tS, 0.25));
  const fS = h('div', 'abs', W); px(fS, 140, 790, 120, 90); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', fS); px(r, i * 8, i * 8, 100, 70); }
  const fSL = tx(W, 'SQLite：一个库，一个文件', 290, 810, { fs: 30, color: K.teal });
  show(fS, T('e12', '极小') - 0.1, { s: 0.6, y: 0 }); show(fSL, T('e12', '一个库'), { x: -10, y: 0 }); sfx('pop', T('e12', '极小'), { g: 0.4 });
  const ch = tx(W, 'ClickHouse', 1000, 250, { fs: 44, color: K.teal });
  show(ch, T('e12b', 'Click House'), { y: 8 });
  cols.forEach((c, j) => tl.fromTo(c, { top: 520, height: 330 }, { top: 320, height: 530, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, T('e12b', '几十亿') + j * 0.1));
  const bigL = tx(W, '几十亿、上万亿行', 1000, 868, { fs: 30, color: K.teal }); show(bigL, T('e12b', '几十亿') + 0.4, { y: 6 }); sfx('whoosh', T('e12b', '几十亿'), { g: 0.35 });
  // e13：从极小，到极大
  const small = tx(W, '极小', 140, 700, { fs: 56, color: K.teal }), big = tx(W, '极大', 1290, 236, { fs: 60, color: K.teal });
  show(small, T('e13', '极小'), { y: 10, d: 0.9 }); show(big, T('e13', '极大'), { y: 10, d: 1.0 }); sfx('thud', T('e13', '极大'), { g: 0.5 });

  // 「当前在讲谁」
  const zPd = zone(W, 100, 236, 1000, 140);
  beats([[T('e2', '公有领域'), pd.children[0]], [T('e2', '自由使用'), pd.children[1]], [T('e2b'), aff], [T('e3', '源码'), fname], [T('e3', '版权声明'), lines[3]], [T('e3', '祝福'), lines[4]],
    [T('e7', 'My S Q L'), dbs[0]], [T('e7', 'Postgres'), dbs[1]], [T('e7', 'S Q Lite'), dbs[2]], [T('e8b', '几行'), rowEls], [T('e8b', '事务型'), exp], [T('e9', '几十亿行'), many], [T('e10', 'O L A P'), gA], [T('e10b', '一个字母'), exp],
    [T('e11', '一行'), rowEls], [T('e11', '一列'), cols], [T('e12', '极小'), fSL], [T('e12b', 'Click House'), ch], [T('e12b', '几十亿'), bigL], [T('e2') + 2.37, [pd], 1], [T('e2b') + 2.45, [aff, pd], 1], [T('e2') + 1.67, zPd, 1]], Tend('e12b'));
  // 镜头：声明与源码 → 祝福 → OLTP 到 OLAP、行到列 → 极小到极大
  shots(cam, world, s, [
    [s.start, null, { rect: [110, 240, 1840, 790] }],
    [T('e4') - 0.7, null, { rect: [110, 260, 1810, 870], d: 1.6 }],
    [T('e7') - 0.5, null, { rect: [110, 215, 1600, 770], pad: 0 }],
    [T('e11') - 0.2, null, { rect: [110, 228, 1810, 896], pad: 0 }],
  ]);
});
