// 收束（第 12 稿）：公有领域与作者的声明 → 源码开头（3.54.1 的 src/btree.c 第 1–9 行原文）→ 三句祝福就对着这段注释念：镜头推近整个代码块，念到哪句亮哪行，念完停一停
// → 前几期与这一期都是事务型 OLTP → 几十亿行里算平均年龄：念到 OLAP 时 T 直接翻成 A，全称跟着换（第 14 稿：WaterRun「OLAP出来时动画直接切换(T变成A)」，删 e10b 与说明条）
// → 一行挨着一行换成一列挨着一列 → SQLite 极小（一个库、一个文件）→ 而 ClickHouse 常常面对几十亿、上万亿行（下一集，PART 5）→ 从极小，到极大。
// 事实：G04、G14、G15、G08、G06、G07。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);

  // e2–e2b：代码属于公有领域；每位作者都签了声明
  const pd = h('div', 'abs', W, '<div style="font-size:34px;color:#044a64">SQLite Is Public Domain</div><div style="font-size:42px;margin-top:8px">代码与文档都献给公有领域：任何人都可以自由使用</div>'); px(pd, 120, 258); css(pd, { borderLeft: `6px solid ${K.teal}`, paddingLeft: '20px' });
  set(pd, 0, { autoAlpha: 0 }); wipe(pd, T('e2') - 0.1, { dir: 'l', d: 0.45 }); sfx('pop', T('e2'), { g: 0.4 });
  const aff = h('div', 'abs', W, '<div style="font-size:30px">声明</div><div style="font-size:28px;color:#555;margin-top:8px">我把自己写的代码献给公有领域</div><div style="margin-top:16px;border-top:1.5px solid #000;width:260px;font-size:26px;color:#555">签名</div>'); px(aff, 1310, 236, 470, 196);
  css(aff, { border: `2px solid ${K.ink}`, background: '#fff', padding: '14px 20px', boxSizing: 'border-box' }); aff.dataset.name = '作者的声明';
  set(aff, 0, { autoAlpha: 0 }); slam(aff, T('e2b'), { from: 1.15 }); sfx('thud', T('e2b'), { g: 0.4 });
  // e3：源码文件的开头没有版权声明，代替它的是一段祝福（src/btree.c 第 1–9 行原文）
  const SRC = ['/*', '** 2004 April 6', '**', '** The author disclaims copyright to this source code.  In place of', '** a legal notice, here is a blessing:', '**', '**    May you do good and not evil.', '**    May you find forgiveness for yourself and forgive others.', '**    May you share freely, never taking more than you give.', '**'];
  const fname = tx(W, 'src/btree.c　（SQLite 3.54.1）', 120, 410, { fs: 24, mono: true, color: K.dim });
  const code = codeBlock(W, SRC.map(esc), 120, 450, { fs: 24 }); code.dataset.name = '源码开头';
  const lines = [...code.children];
  show(fname, T('e3', '源码') - 0.2, { y: 6 }); set(code, 0, { autoAlpha: 0 }); wipe(code, T('e3', '源码'), { dir: 't', d: 0.5 }); sfx('whoosh', T('e3', '源码'), { g: 0.3 });
  // e4–e6：三句祝福就在这段注释里——声明退场，镜头推近整个代码块；念到哪一句，那一行注释亮起、左边标一道深青竖线，其余几行压淡；念完停一停（e6 后 2.5 秒）
  const tB = T('e4') - 0.7;
  [pd, aff].forEach((e) => gone(e, tB, 0.6));
  [0, 1, 2, 3, 4, 5, 9].forEach((i) => dim(lines[i], tB + 0.4, 0.35, 1, 0.8));
  const BC = ['e4', 'e5', 'e6'];
  const cb = box(code, world);
  const marks = [6, 7, 8].map((li, k) => { const b = box(lines[li], world); const m = h('div', 'abs', W); px(m, cb.x - 18, b.y + 4, 6, b.h - 8); css(m, { background: K.teal });
    set(m, 0, { autoAlpha: 0 }); tl.fromTo(m, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.5, ease: 'power2.out', immediateRender: false }, T(BC[k]) - 0.1); sfx('tick', T(BC[k]), { g: 0.3 }); return m; });
  const tO = T('e7') - 0.5;
  [fname, code, ...marks].forEach((e) => gone(e, tO, 0.6));

  // e7–e8：前几期的 MySQL、PostgreSQL 和这一期的 SQLite，做的都是同一类工作：每次只读写几行，事务型 OLTP；都按行存
  const tbl = h('div', 'abs', W); px(tbl, 120, 300, 720, 400); tbl.dataset.name = '按行存的表';
  const head = h('div', 'abs', tbl); px(head, 0, 0, 720, 50); css(head, { display: 'flex', borderBottom: `1.5px solid ${K.rule}`, fontWeight: 700, fontSize: '26px' });
  ['id', 'name', 'age'].forEach((c, i) => { const e = h('div', '', head, c); css(e, { width: [140, 380, 200][i] + 'px', padding: '8px 12px', fontFamily: 'Mono' }); });
  const rowsData = [['2049', 'User02049-…', '51'], ['2050', 'Alice', '42'], ['2051', 'User02051-…', '53'], ['2052', 'User02052-…', '54'], ['…', '…', '…']];
  const rowEls = rowsData.map((r, i) => { const e = h('div', 'abs', tbl); px(e, 0, 58 + i * 56, 720, 50); css(e, { display: 'flex', border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '26px', fontFamily: 'Mono', boxSizing: 'border-box' }); r.forEach((v, j) => { const c = h('div', '', e, v); css(c, { width: [140, 380, 200][j] + 'px', padding: '8px 12px', boxSizing: 'border-box' }); }); return e; });
  show(head, tO + 0.5, { y: 6 }); rowEls.forEach((e, i) => show(e, tO + 0.6 + i * 0.08, { x: -12, y: 0, d: 0.3 }));
  rowEls.forEach((e) => { e.dataset.beat = 'line'; });
  const dbs = ['MySQL', 'PostgreSQL', 'SQLite'].map((n, i) => { const b = btn(W, n, 1000 + i * 250, 540, 28); set(b, 0, { autoAlpha: 0 }); slam(b, T('e7', ['My S Q L', 'Postgres', 'S Q Lite'][i]), { from: 1.2 }); sfx('pop', T('e7', ['My S Q L', 'Postgres', 'S Q Lite'][i]), { g: 0.3, p: -0.2 + i * 0.2 }); return b; });
  // 「做的都是同一类工作」：三个名字往中间靠成一组
  dbs.forEach((b, i) => tl.fromTo(b, { x: 0 }, { x: [60, 0, -40][i], duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T('e8', '同一类') - 0.1)); sfx('whoosh', T('e8', '同一类'), { g: 0.25 });
  set(rowEls[1], T('e8b', '几行'), { backgroundColor: K.wheat }); sfx('tick', T('e8b', '几行'), { g: 0.4 });
  const L4 = ['O', 'L', 'T', 'P'].map((c, i) => { const e = h('div', 'abs', W, c); px(e, 1000 + i * 120, 300, 110, 140); css(e, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: '#fff' }); return e; });
  L4.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); slam(e, T('e8b', 'O L T P') + i * 0.08, { from: 1.25 }); }); sfx('thud', T('e8b', 'O L T P'), { g: 0.5 });
  const exp = tx(W, 'Online <b>Transaction</b> Processing　事务型', 1000, 460, { fs: 30 }); exp.dataset.gloss = 'OLTP||OLAP';   // 翻成 A 以后这一行就是 OLAP 的全称
  show(exp, T('e8b', '事务型') - 0.1, { y: 8 });
  rowEls.forEach((e, i) => set(e, T('e8b', 'O L T P') + 1.0 + i * 0.05, { borderColor: K.teal }));

  // e9–e10：几十亿行里算一个平均年龄：分析型 OLAP——念到 OLAP，T 当场翻成 A，全称跟着换（全称只上画面）
  const tA = T('e9') - 0.2;
  dbs.forEach((e) => gone(e, tA, 0.3));
  const avg = codeBlock(W, ['SELECT avg(age) FROM users;'], 120, 222, { fs: 26 }); set(avg, 0, { autoAlpha: 0 }); show(avg, T('e9', '平均年龄') - 0.3, { y: 0, d: 0.3 });
  const many = tx(W, '…… 几十亿行', 140, 640, { fs: 28, color: K.dim }); show(many, T('e9', '几十亿行'), { y: 8 });
  const tMorph = T('e10', 'O L A P') + 0.25;   // 念到 L、A 之间翻过去
  const Tl = L4[2], Al = h('div', 'abs', W, 'A'); px(Al, 1000 + 2 * 120, 300, 110, 140); css(Al, { border: `2.5px solid ${K.teal}`, color: K.teal, fontSize: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: '#fff' });
  set(Al, 0, { autoAlpha: 0 });
  tl.fromTo(Tl, { rotationX: 0 }, { rotationX: 90, duration: 0.22, ease: 'power1.in', immediateRender: false }, tMorph - 0.22);
  set(Tl, tMorph, { autoAlpha: 0 }); set(Al, tMorph, { autoAlpha: 1 });
  tl.fromTo(Al, { rotationX: -90 }, { rotationX: 0, duration: 0.3, ease: 'power1.out', immediateRender: false }, tMorph); sfx('pop', tMorph, { g: 0.5 });
  keyed(exp).at(tMorph + 0.1, { html: 'Online <b>Analytical</b> Processing　分析型' });

  // e11：一行挨着一行的存法，也要换成一列挨着一列——表的几行先亮，再在右边立起三列
  const tR = T('e11') - 0.2;
  // 讲行与列时，上面那条平均年龄的查询已经讲完：收走，只留行和列的对比
  gone(avg, tR, 0.4);
  [L4[0], L4[1], L4[3], Al, exp].forEach((e) => gone(e, tR, 0.4));
  const colX = [1000, 1220, 1560], colW = [190, 310, 190], names = ['id', 'name', 'age'];
  const colV = [['2049', '2050', '2051', '2052', '…'], ['User02049-…', 'Alice', 'User02051-…', 'User02052-…', '…'], ['51', '42', '53', '54', '…']];
  const cols = names.map((n, j) => { const c = h('div', 'abs', W); px(c, colX[j], 520, colW[j], 330); css(c, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box', fontFamily: 'Mono', fontSize: '24px', padding: '8px 12px', transformOrigin: '50% 100%' });
    c.innerHTML = `<div style="font-weight:700;border-bottom:1.5px solid #444;margin-bottom:6px">${n}</div>` + colV[j].map((v) => `<div>${v}</div>`).join(''); return c; });
  cols.forEach((c, j) => wipe(c, T('e11', '一列') + j * 0.15, { dir: 't', d: 0.5 })); sfx('whoosh', T('e11', '一列'), { g: 0.3 });
  const rowNote = tx(W, '按行存', 560, 644, { fs: 28, color: K.dim }), colNote = tx(W, '按列存', 1000, 470, { fs: 28, color: K.dim });
  show(rowNote, T('e11', '一行') + 0.2, { y: 6 }); show(colNote, T('e11', '一列') + 0.3, { y: 6 });

  // e12–e12b：SQLite 把数据库做到了极小（一个小文件）；另一端的 ClickHouse，面对的是几十亿、上万亿行（三列一直往上长）
  const tS = T('e12') - 0.2;
  [tbl, many].forEach((e) => dim(e, tS, 0.25)); gone(rowNote, tS, 0.3);
  const fS = h('div', 'abs', W); px(fS, 140, 790, 120, 90); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', fS); px(r, i * 8, i * 8, 100, 70); }
  const fSL = tx(W, 'SQLite：一个库，一个文件', 290, 810, { fs: 30, color: K.teal });
  show(fS, T('e12', '极小') - 0.1, { s: 0.6, y: 0 }); show(fSL, T('e12', '一个库'), { x: -10, y: 0 }); sfx('pop', T('e12', '极小'), { g: 0.4 });
  const ch = tx(W, 'ClickHouse', 1000, 250, { fs: 44, color: K.teal });
  const p5 = btn(W, 'PART 5', 1262, 258, 26);   // 下一集（系列第 5 集）
  [colNote].forEach((e) => gone(e, T('e12b', 'Click House') - 0.3, 0.3));
  show(ch, T('e12b', 'Click House'), { y: 8 }); set(p5, 0, { autoAlpha: 0 }); show(p5, T('e12b', 'Click House') + 0.5, { x: -12, y: 0 });
  cols.forEach((c, j) => tl.fromTo(c, { top: 520, height: 330 }, { top: 320, height: 530, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, T('e12b', '几十亿') + j * 0.1));
  const bigL = tx(W, '几十亿、上万亿行', 1000, 868, { fs: 30, color: K.teal }); show(bigL, T('e12b', '几十亿') + 0.4, { y: 6 }); sfx('whoosh', T('e12b', '几十亿'), { g: 0.35 });
  // e13：从极小，到极大
  const small = tx(W, '极小', 140, 700, { fs: 56, color: K.teal }), big = tx(W, '极大', 1440, 236, { fs: 60, color: K.teal });   // 让出 ClickHouse 后面的 PART 5
  show(small, T('e13', '极小'), { y: 10, d: 0.9 }); show(big, T('e13', '极大'), { y: 10, d: 1.0 }); sfx('thud', T('e13', '极大'), { g: 0.5 });

  // 焦点框：源码注释里「没有版权声明」「一段祝福」那两行；三句祝福一句一句地框；「一行挨着一行」框住几行，「一列挨着一列」框住三列
  focus(W, [[T('e3', '版权声明'), lines[3]], [T('e3', '祝福'), lines[4], Tend('e3')], [T('e4'), lines[6]], [T('e5'), lines[7]], [T('e6'), lines[8], Tend('e6') + 1.4],
    [T('e11', '一行'), rowEls, T('e11', '一列') - 0.1], [T('e11', '一列'), cols, Tend('e11')]], Tend('e13'));
  // 镜头：声明与源码 → 祝福 → OLTP 到 OLAP、行到列 → 极小到极大
  shots(cam, world, s, [
    [s.start, null, { rect: [110, 240, 1840, 790] }],
    [T('e4') - 0.7, [fname, code], { pad: 24, zmax: 1.9, d: 1.8 }],
    [T('e7') - 0.5, null, { rect: [110, 215, 1600, 770], pad: 0 }],
    [T('e11') - 0.2, null, { rect: [110, 228, 1810, 896], pad: 0 }],
  ]);
});
