// 第 13 章 SQL 之外：按列存只是把一张表翻个面（还是 SQL）→ 本系列五期都是一张表 → 天生不整齐的 JSON 文档 → ClickHouse 把文档拆成列 → 整份文档原样存：MongoDB，问法不再是 SQL
scene('beyond', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const [gA, gB, gC, gD, gE] = [0, 1, 2, 3, 4].map(() => groupAt(world));

  // ── A 翻个面，还是一张表；SQL ──
  appear(gA, c0 + 0.05);
  tableTag(gA, '表 <b>demo.users8</b> · 8 行', c0 + 0.1);
  const hd = ['编号', '姓名', '年龄'], rowsD = [[1, 'alice', 30], [2, 'bob', 25], [3, 'carol', 41], [4, 'dave', 19]];
  const CW1 = [130, 300, 150], X0 = 100, Y0 = 220, RH = 76;
  // 表格：4 行 × 3 列 → 翻成 3 行 × 4 列
  const cells = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
    const txt = r === 0 ? hd[c] : String(rowsD[r - 1][c]);
    const e = mk(gA, 'cell lg' + (r === 0 ? ' w' : ''), X0 + (c === 0 ? 0 : (c === 1 ? 128 : 426)), Y0 + r * RH, CW1[c], 68, '<span>' + txt + '</span>'); cells.push({ e, r, c });
    wipe(e, c0 + 0.1 + (r * 3 + c) * 0.03, { dir: 'l', d: 0.35 });
  }
  const tF = T('s1', '翻'), FD = 1.2;
  cells.forEach(({ e, r, c }) => {
    const x1 = X0 + r * 170, y1 = Y0 + c * RH, x0 = X0 + (c === 0 ? 0 : (c === 1 ? 128 : 426)), y0 = Y0 + r * RH;
    tl.fromTo(e, { x: 0, y: 0 }, { x: x1 - x0, y: y1 - y0, duration: FD, ease: 'power3.inOut', immediateRender: false }, tF);
    tl.set(e, { width: 160 }, tF + 0.001);
  });
  sfx('whoosh', tF, { g: 0.6 });
  const lt = mk(gA, 'lab y', 1200, 220, null, null, '翻了个面，还是一张表'); wipe(lt, T('s1', '还是一张表') - 0.2, { dir: 'l', d: 0.6 });
  const tmq = termAt(gA, 100, 640, 1000, 90); vanish(tmq.el, 0); appear(tmq.el, T('s1b') - 0.1);
  tmq.line(0, '<span class="pr">:) </span>SELECT avg(age) FROM users;', T('s1b') - 0.05, { type: 34, cursorUntil: T('s1b', 'S Q L') + 1.0 });
  const sql = mk(gA, 'tag', 1200, 640, null, null, 'SQL'); slam(sql, T('s1b', 'S Q L'), { from: 1.3 }); sfx('thud', T('s1b', 'S Q L') + 0.1, { g: 0.5 });
  const g1 = glossAt(gA, 100, 780, 1720, 'SQL', '<b>SQL</b>　用 SELECT、INSERT 这样的语句操作表'); show(g1, T('s1b', 'S Q L') - 0.1, { y: 12, d: 0.35 });
  const pre = mk(gA, 'h1 y', 100, 880, null, null, '前提：数据得是一张表的样子'); css(pre, { fontSize: '56px' }); wipe(pre, T('s1c') - 0.1, { dir: 'l', d: 0.6 });
  const tAB = T('s2') + 0.6;
  vanish(gA, tAB);

  // ── B 五期都是一张表 ──
  appear(gB, tAB);
  const ENG = [['MyISAM', tAB + 0.1], ['InnoDB', tAB + 0.4], ['PostgreSQL', tAB + 0.7], ['SQLite', tAB + 1.0], ['ClickHouse', Math.max(T('s2', '五期') + 0.2, tAB + 1.3)]];
  const tiles = ENG.map(([nm, tt], i) => {
    const x = 100 + i * 346;
    const t = mk(gB, 'tile' + (i === 4 ? ' y' : ''), x, 220, 320, 440); css(t, i === 4 ? { borderColor: 'var(--y)' } : {});
    mk(t, 'nm', 24, 22, null, null, nm); css(t.lastChild, { fontSize: '36px' });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const cell = mk(t, 'cell sm' + (r === 0 ? ' w' : ''), 24 + c * 92, 110 + r * 66, 96, 56, ''); }
    vanish(t, 0); slide(t, tt - 0.1, { y: 40 }); sfx('pop', tt, { g: 0.5 });
    return t;
  });
  const ls = mk(gB, 'h1 y', 100, 720, null, null, '存法各不相同，摆出来的样子却一样：一张表'); css(ls, { fontSize: '54px' }); wipe(ls, T('s3') - 0.1, { dir: 'l', d: 0.8 });
  const ls2 = mk(gB, 'h2', 100, 810, null, null, '每一行的项都一样'); show(ls2, T('s3c') - 0.1, { y: 12 }); tiles.forEach((t, i) => classAt(t, 'y', T('s3c', '每一行') + i * 0.1));
  const tBC = T('s5') + 0.9;
  hide(gB, tBC, { y: 0, d: 0.3 });

  // ── C 天生不整齐的 JSON 文档 ──
  appear(gC, tBC);
  const D1 = '{\n  "name": "alice",\n  "age": 30,\n  "city": "Rome"\n}';
  const D2 = '{\n  "name": "bob",\n  "age": 25,\n  "tags": ["x", "y", "z"],\n  "pets": {\n    "cat": "tom",\n    "dog": "rex"\n  },\n  "phone": "…",\n  …\n}';
  const d1 = mk(gC, 'panel', 100, 230, 760, 330); const d1t = mk(d1, 'mono', 28, 22, null, null, D1); css(d1t, { fontSize: '30px', lineHeight: '1.5' });
  const d2 = mk(gC, 'panel', 960, 230, 860, 640); const d2t = mk(d2, 'mono', 28, 22, null, null, D2); css(d2t, { fontSize: '30px', lineHeight: '1.5' });
  wipe(d1, tBC, { dir: 'l', d: 0.45 }); wipe(d2, T('s5b', '这个人有三项') + 0.6, { dir: 'l', d: 0.5 });
  const l1 = mk(gC, 'lab y', 100, 590, null, null, '这个人有三项'); show(l1, T('s5b', '三项'), { y: 12 }); const l2 = mk(gC, 'lab y', 960, 890, null, null, '那个人有三十项'); show(l2, T('s5b', '三十项'), { y: 12 });
  const nest = mk(gC, 'abs', 972, 424, 836, 194); css(nest, { border: '4px solid var(--y)', pointerEvents: 'none' }); vanish(nest, 0); appear(nest, T('s5c') - 0.1);
  const nl = mk(gC, 'badge', 1500, 632, null, null, '套着别的文档'); css(nl, { fontSize: '28px' }); show(nl, T('s5c') - 0.1, { y: 10 }); sfx('pop', T('s5c', '套着'), { g: 0.5 });
  const jj = mk(gC, 'tag o', 100, 700, null, null, 'JSON'); css(jj, { fontSize: '80px' }); slam(jj, T('s5b', 'Jason') - 0.3, { from: 1.2 });
  const tCD = T('s6') + 0.5;
  vanish(gC, tCD);

  // ── D ClickHouse：拆成列 ──
  appear(gD, tCD);
  const dd = mk(gD, 'panel', 100, 230, 640, 560); const ddt = mk(dd, 'mono', 24, 20, null, null, D2); css(ddt, { fontSize: '26px', lineHeight: '1.5' }); wipe(dd, tCD, { dir: 'l', d: 0.4 });
  const COLS = ['doc.name', 'doc.age', 'doc.pets.cat', 'doc.pets.dog', 'doc.tags', '…'];
  const cf = COLS.map((nm, i) => { const c = mk(gD, 'cell lg', 900, 230 + i * 90, 560, 74, '<span>' + nm + '</span>'); css(c, { fontSize: '30px' }); vanish(c, 0); appear(c, T('s6b', '每一个字段') + i * 0.18); sfx('tick', T('s6b', '每一个字段') + i * 0.18, { g: 0.3 }); return c; });
  const ar = mk(gD, 'h1 y', 760, 460, null, null, '→'); css(ar, { fontSize: '90px' }); appear(ar, Math.max(T('s6', '拆成列'), tCD + 0.3));
  const lcol = mk(gD, 'lab y', 900, 190, null, null, '每个字段，一个自己的列'); appear(lcol, T('s6b'));
  classAt(cf[1], 'on', T('s6c', '读一个字段'), T('s6c', '要整份') - 0.1);
  const q1 = mk(gD, 'badge', 1500, 250, null, null, '很快'); css(q1, { fontSize: '30px' }); show(q1, T('s6c', '读一个字段') + 0.2, { y: 10 });
  cf.forEach((c, i) => classAt(c, 'y', T('s6c', '要整份') + i * 0.12));
  const q2 = mk(gD, 'badge', 1500, 560, null, null, '得拼回来'); css(q2, { fontSize: '30px' }); show(q2, T('s6c', '重新拼') - 0.4, { y: 10 }); sfx('thud', T('s6c', '重新拼') + 0.1, { g: 0.5 });
  const tDE = T('s7') + 0.4;
  vanish(gD, tDE);

  // ── E 整份文档原样存：MongoDB ──
  appear(gE, tDE);
  const q = mk(gE, 'h1', 100, 200, null, null, '应用每次要的，都是一整份文档'); css(q, { fontSize: '56px' }); wipe(q, tDE, { dir: 'l', d: 0.6 });
  const ds = mk(gE, 'panel y', 100, 320, 700, 330); const dst = mk(ds, 'mono', 28, 20, null, null, D1); css(dst, { fontSize: '30px', lineHeight: '1.5' }); wipe(ds, tDE + 0.6, { dir: 'l', d: 0.5 }); warm(ds, tDE + 1.2, T('s8') - 0.2);
  const ke = mk(gE, 'h2 y', 100, 680, null, null, '整份文档，原样存起来'); show(ke, T('s7b', '原样'), { y: 12 });
  const mg = mk(gE, 'tag', 900, 330, null, null, 'MongoDB'); css(mg, { fontSize: '140px' }); slam(mg, T('s8', 'Mongo D B'), { from: 1.25 }); sfx('thud', T('s8', 'Mongo D B') + 0.1, { g: 0.7 });
  const g2 = glossAt(gE, 900, 560, 920, 'MongoDB', '<b>MongoDB</b>　文档数据库：存的是灵活的、类似 JSON 的文档'); show(g2, T('s8', 'Mongo D B') + 0.5, { y: 12 }); g2.dataset.gloss = 'MongoDB';
  const tmm = termAt(gE, 900, 700, 920, 150); vanish(tmm.el, 0); appear(tmm.el, T('s8b', '问法') - 0.3);
  tmm.line(0, '<span class="pr">test&gt; </span>db.users.find({ name: "alice" })', T('s8b', '问法') - 0.2, { type: 30, cursorUntil: T('s8b', 'S Q L') });
  const nosql = mk(gE, 'huge y', 100, 780, null, null, '不再是 SQL'); css(nosql, { fontSize: '90px' }); wipe(nosql, T('s8b', 'S Q L') - 0.9, { dir: 'l', d: 0.8 }); sfx('thud', T('s8b', 'S Q L') - 0.5, { g: 0.6 });
  drift(cam, s, 1);
});
