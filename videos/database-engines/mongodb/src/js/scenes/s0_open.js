// 开场（第 4 轮重做）。四个画面，同一处换内容，不平移镜头：
// A mongosh 里存进、找回 Alice（右边是 MongoDB 里那一份），下面是同一件事用 SQL 要写的语句——用不上的一条条划掉；
// B 前五集排成一排，每张卡里是同一张 users 小表和一句 SQL；念到「SQL」时三个名字里的 SQL 加粗；ClickHouse 拆成一列一列也还是表；MongoDB 一张卡里是一份文档；
// C 三个加粗的 SQL 飞到中间合成一个，前面推进 No；停一下；No 的两种读法，No 展开成 Not only；
// D Alice 的资料往下走：存进磁盘、找回来、改、注销、两个人同时、进程被杀；右边一条条列出这五个问题。随后片名卡淡入。
// 事实：A01 A12 C07（mongosh 回显）；S04 S01（前五集与 ClickHouse 按列）；N01 V04（两种读法）；环境与版本（年龄 18 + i % 63，9.0.8）。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                       // 镜头不动：四个画面都在同一处换内容
  const ov = overlay(world);
  const ch = chrome(root, s, 'PART 6');

  // ══ A：mongosh ══
  const tA1 = T('o7') - 0.55;               // A 整组退场
  const sh = term(world, 110, 136, 1040, 444, 'mongosh', { fs: 27, lh: 46 });
  fadeIn(sh.c, s.start + 0.15, 0.6);
  sh.cmd(T('o1') - 0.05, 'db.users.insertOne({ <span class="k">name</span>: <span class="s">"Alice"</span>, <span class="k">age</span>: <span class="n">42</span> })', 'lab&gt; ', 34);
  const ack = sh.out(T('o2', '存') + 0.15, '{ <span class="k">acknowledged</span>: <span class="n">true</span>, <span class="k">insertedId</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>) }');
  css(ack, { color: K.gd2, marginBottom: '22px' });
  res(world, 990, 186, '↵ 发送', 'ink', T('o1', '年龄') + 0.1, { fs: 26, lh: 44, out: T('o4') - 0.3 });
  res(world, 1290, 516, '已存入 users', 'new', T('o2', '存') + 0.45, { out: T('o4') - 0.3 });
  sh.cmd(T('o4') - 0.05, 'db.users.findOne({ <span class="k">name</span>: <span class="s">"Alice"</span> })', 'lab&gt; ', 34);
  const resL = sh.out(T('o5', '回来') - 0.1, '{ <span class="k">_id</span>: ObjectId(<span class="s">\'6afa…4e81\'</span>), <span class="k">name</span>: <span class="s">\'Alice\'</span>, <span class="k">age</span>: <span class="n">42</span> }');

  // 右边：MongoDB 里的那一份
  const box = h('div', 'panel', world); px(box, 1250, 136, 560, 444);
  icon(box, 26, 22, 'server', 44, K.forest);
  const bt = h('div', 'abs', box, 'MongoDB'); css(bt, { left: '82px', top: '26px', font: '700 34px "Inter"', color: K.forest });
  const bhr = h('div', 'abs', box); css(bhr, { left: 0, right: 0, top: '86px', height: '1.5px', background: K.gl2 });
  fadeIn(box, s.start + 0.35, 0.6);
  // 存进去：一份 { name, age } 从命令里升起，飞进 MongoDB；落下后多出 _id 一行（驱动生成，A01）
  const D0 = docCard(world, 1290, 236, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 480, fs: 27 });
  const idRow = D0.r._id;
  css(idRow, { overflow: 'hidden', color: K.gd1, fontSize: '24px' });
  const tFly = T('o2', '交给');
  tl.fromTo(D0.c, { autoAlpha: 0, x: -880, y: 90, scale: 1 }, { autoAlpha: 1, x: -880, y: 70, scale: 1, duration: 0.45, immediateRender: true }, T('o1', '名字') - 0.1);
  set(D0.c, s.start, { backgroundColor: K.mint2, borderColor: K.g1 });
  to(D0.c, T('o2', '存') + 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, color: K.ink, duration: 0.45 });
  const braces = [...D0.c.querySelectorAll('.br')];
  to(braces, T('o2', 'JSON') - 0.25, { color: K.forest, duration: 0.35 });
  to(D0.c, T('o2', 'JSON') - 0.25, { backgroundColor: K.forest, borderColor: K.forest, color: '#FFFFFF', duration: 0.35 }); classAt(D0.c, 'inv', T('o2', 'JSON') - 0.25, T('o2', '存') + 0.2);
  to(braces, T('o2', '存') + 0.6, { color: K.ink, duration: 0.4 });
  tl.to(D0.c, { x: 0, y: 0, scale: 1, duration: 1.0, ease: 'power2.inOut' }, tFly);
  tl.fromTo(idRow, { height: 0, autoAlpha: 0 }, { height: 40, autoAlpha: 1, duration: 0.5, ease: 'power2.out', immediateRender: true }, T('o2', '存') + 0.15);
  sfx('pop', tFly + 1.0);

  // 下面：同一件事用 SQL 要写的（关系数据库）
  const sq = h('div', 'card', world); px(sq, 110, 620, 1700, 300);
  h('div', 'bar', sq, '<span class="lang">SQL</span><span class="copy"></span>');
  const sqTag = h('div', 'abs', sq, '同一件事，关系数据库要写'); css(sqTag, { left: '110px', top: '15px', font: '500 24px "Inter", "Sans SC"', color: K.gd1 });
  const sqL = [
    '<span class="kw">CREATE TABLE users</span> <span class="cols">(name VARCHAR(50), age INT)</span>;',
    "<span class='kw'>INSERT INTO users</span> VALUES ('Alice', 42);",
    "<span class='kw'>SELECT * FROM users</span> <span class='wh'>WHERE name = 'Alice'</span>;",
  ].map((x, i) => { const e = h('div', 'abs mono', sq, x); css(e, { left: '30px', top: 80 + i * 66 + 'px', font: '500 29px "Mono"', color: K.gd2 }); return e; });
  const strike = sqL.map((e, i) => { const l = h('div', 'abs', sq); css(l, { left: '22px', top: 80 + i * 66 + 20 + 'px', width: [850, 690, 725][i] + 'px', height: '4px', background: K.gd2, transformOrigin: '0 50%' }); return l; });
  // o3：建表这一句先亮出来，「哪几列」那一段再亮；然后整句划掉——MongoDB 用不上
  fadeIn(sq, T('o3') - 0.1, 0.5);
  show(sqL[0], T('o3', '建表') - 0.35, { y: 10, d: 0.5 });
  const kw0 = sqL[0].querySelector('.kw'), cols0 = sqL[0].querySelector('.cols');
  to(kw0, T('o3', '建表'), { backgroundColor: K.mint2, duration: 0.35 });
  to(cols0, T('o3', '哪几列') - 0.1, { backgroundColor: K.mint2, duration: 0.35 });
  fromTo(strike[0], T('o3', '哪几列') + 0.95, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }); sfx('blip', T('o3', '哪几列') + 0.6);
  res(sq, 900, 66, '用不上', 'del', T('o3', '哪几列') + 1.1, { fs: 26, lh: 46, pad: 16 });
  to([kw0, cols0], T('o3', '哪几列') + 1.1, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 });   // lint-ok: 透明底（取消高亮）
  to(sqL[0], T('o3', '哪几列') + 1.1, { opacity: 0.4, duration: 0.5 });
  // 写入那一句：和 insertOne 并排看，也用不上
  show(sqL[1], T('o3', '也没有') - 0.1, { y: 10, d: 0.5 });
  fromTo(strike[1], T('o6', 'SQL') - 0.35, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' });
  to(sqL[1], T('o6', 'SQL') + 0.2, { opacity: 0.4, duration: 0.5 });

  // o4：查询条件也是一份 { name: "Alice" }，落在那份资料下面；「同样的格式」把两处 name 并排指出来
  const qd = code(world, 1290, 492, '{ <span class="k">name</span>: <span class="s">"Alice"</span> }'); css(qd, { fontSize: '27px', padding: '6px 16px' });
  const tQ = T('o4', '条件');
  tl.fromTo(qd, { autoAlpha: 0, x: -930, y: -170 }, { autoAlpha: 1, x: -930, y: -170, duration: 0.3, immediateRender: true }, tQ - 0.35);
  tl.to(qd, { x: 0, y: 0, duration: 0.95, ease: 'power2.inOut' }, tQ);
  show(sqL[2], T('o4', '找'), { y: 10, d: 0.5 });
  res(world, 830, 296, '↵ 发送', 'ink', T('o4', '条件') - 0.3, { fs: 26, lh: 44, out: T('o6') + 0.6 });
  const tSame = T('o4', '同样的格式');
  solid(qd, tSame, 'new'); classAt(qd, 'inv', tSame);
  solid(D0.r.name, tSame + 0.1, 'new'); classAt(D0.r.name, 'inv', tSame + 0.1, T('o5') - 0.2);
  to(D0.r.name, T('o5') - 0.2, { backgroundColor: 'rgba(0,0,0,0)', color: K.ink, duration: 0.4 });    // lint-ok: 取消
  const nk = [D0.r.name.querySelector('.k'), qd.querySelector('.k')];
  const yName = 236 + D0.r.name.offsetTop + D0.r.name.offsetHeight / 2, yQ = 492 + (qd.offsetHeight || 46) / 2;
  const same = link(ov, [[1284, yQ], [1266, yQ], [1266, yName], [1284, yName]], 'accent', { w: 3 });
  draw(same, tSame - 0.05, 0.5);
  fadeOut(same, T('o5') - 0.2, 0.4);
  const wh = sqL[2].querySelector('.wh');
  // o5：她的资料回到 mongosh；多出来的 _id 两处一起指出来
  to(qd, T('o5') - 0.2, { autoAlpha: 0, y: 12, duration: 0.45 });
  const ghost = docCard(world, 1290, 236, [['_id', OID()], ['name', JS('Alice')], ['age', JN(42)]], { w: 480, fs: 27, cls: 'on' });
  const tBack = T('o5', '回来') - 0.6;
  tl.fromTo(ghost.c, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, { autoAlpha: 0.9, duration: 0.25, immediateRender: true }, tBack);
  tl.to(ghost.c, { x: -1000, y: 110, scale: 0.6, autoAlpha: 0, duration: 0.85, ease: 'power2.inOut' }, tBack + 0.05);
  const resId = resL.querySelector('.k');
  to(idRow, T('o5', '多出') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 }); classAt(idRow, 'inv', T('o5', '多出') - 0.2);
  res(world, 1290, 516, '多出一项 _id', 'new', T('o5', '_id') - 0.1, { out: tA1 });
  res(world, 1540, 700, '0 句 SQL', 'del', T('o6', '没有') - 0.1, { out: tA1 });
  to(resId, T('o5', '_id') - 0.15, { color: K.forest, duration: 0.35 });
  to(idRow, T('o5', '_id') - 0.1, { backgroundColor: K.mint2, color: K.ink, duration: 0.4 });
  // o6：一句 SQL 也没写——SQL 卡里剩下的查询也划掉
  fromTo(strike[2], T('o6', 'SQL') - 0.15, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }); sfx('blip', T('o6', 'SQL'));
  to(sqL[2], T('o6', 'SQL') + 0.35, { opacity: 0.4, duration: 0.5 });
  to(sh.c, T('o6') - 0.1, { borderColor: K.g1, duration: 0.5 });
  fadeOut([sh.c, box, D0.c, sq], tA1, 0.55);

  // ══ B：前五集（S04），每张卡一张同样的 users 小表 + 一句 SQL ══
  const EP = [['MySQL', 'PART 1 · 2'], ['PostgreSQL', 'PART 3'], ['SQLite', 'PART 4'], ['ClickHouse', 'PART 5']];
  const CX0 = 110, CW = 320, CG = 24, CY = 206, CH = 486, RH = 52;
  const ROWS = [['User02049…', MDB.age(2049)], ['Alice', 42], ['User02051…', MDB.age(2051)]];
  function miniTable(parent, x, y) {
    const wrap = h('div', 'abs', parent); px(wrap, x, y, 272, RH * 4);
    const spec = [['name', ROWS.map((r) => r[0]), 196], ['age', ROWS.map((r) => String(r[1])), 76]];
    const cols = spec.map(([hd, vals, w], ci) => {
      const c = h('div', 'abs', wrap); px(c, ci === 0 ? 0 : 196, 0, w, RH * 4);
      const hc = h('div', 'mt h', c, hd); px(hc, 0, 0, w, RH); css(hc, { lineHeight: RH - 3 + 'px' });
      vals.forEach((v, ri) => { const cc = h('div', 'mt' + (ri === 1 ? ' al' : ''), c, v); px(cc, 0, RH * (ri + 1), w, RH); css(cc, { lineHeight: RH - 3 + 'px', fontSize: '22px' }); });
      return c;
    });
    return { wrap, cols, head: cols.map((c) => c.firstChild) };
  }
  const cards = EP.map(([n, p], i) => {
    const c = h('div', 'panel', world); px(c, CX0 + i * (CW + CG), CY, CW, CH);
    label(c, 24, 22, p, 'lab');
    const nm = h('div', 'abs', c, n.replace('SQL', '<span class="sqb">SQL</span>')); css(nm, { left: '24px', top: '60px', font: '500 40px "Inter"', color: K.ink });
    const tb = miniTable(c, 24, 140);
    const q = h('div', 'abs mono', c, '<span class="kw">SELECT</span> * FROM users'); css(q, { left: '24px', top: '400px', font: '500 22px "Mono"', color: K.gd2, padding: '6px 10px', background: K.gl3, border: '1.5px solid ' + K.gl2, borderRadius: '6px' });
    return { c, nm, tb, q, sqb: nm.querySelector('.sqb') };
  });
  cards.forEach((cd, i) => show(cd.c, T('o7') - 0.35 + i * 0.14, { y: 26, d: 0.6 }));
  sfx('pop', T('o7') + 0.15);
  // o8：念到哪一个，绿框滑到哪一张
  const frame = h('div', 'abs', world); px(frame, CX0 - 8, CY - 8, CW + 16, CH + 16); css(frame, { border: '4px solid ' + K.g1, borderRadius: '20px' }); frame.dataset.name = 'focus';
  const nameT = [T('o8', 'MySQL'), T('o8', 'PostgreSQL'), T('o8', 'SQLite'), T('o8', 'ClickHouse')];
  fromTo(frame, nameT[0] - 0.2, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, duration: 0.35 });
  for (let i = 1; i < 4; i++) tl.fromTo(frame, { x: (i - 1) * (CW + CG) }, { x: i * (CW + CG), duration: 0.4, ease: 'power2.inOut', immediateRender: false }, nameT[i] - 0.25);
  fadeOut(frame, Tend('o8') + 0.15, 0.45);
  cards.forEach((cd, i) => cd.tb.head.forEach((hc) => solid(hc, nameT[i] - 0.05, 'ink')));
  // o9：念到 SQL，三个名字里的 SQL 加粗变绿，四句 SQL 一起亮；念到「关系数据库」，下面一道括号把四张卡括起来
  const tSQL = T('o9', 'SQL');
  cards.forEach((cd) => { if (cd.sqb) to(cd.sqb, tSQL - 0.1, { fontWeight: 850, color: K.forest, duration: 0.4 }); });
  cards.forEach((cd) => { solid(cd.q, tSQL - 0.05, 'new'); to(cd.q.querySelector('.kw'), tSQL - 0.05, { color: '#FFFFFF', duration: 0.35 }); });
  const BW = 4 * CW + 3 * CG;
  const brace = h('div', 'abs', world); px(brace, CX0, CY + CH + 26, BW, 18); css(brace, { borderLeft: '3px solid ' + K.forest, borderRight: '3px solid ' + K.forest, borderBottom: '3px solid ' + K.forest });
  const rel = h('div', 'abs', world, '关系数据库 · 表 + SQL'); px(rel, CX0 + BW / 2 - 230, CY + CH + 58, 460); css(rel, { font: '700 38px/70px "Sans SC"', color: '#FFFFFF', background: K.ink, borderRadius: '12px', textAlign: 'center' });
  show(brace, T('o9', '关系') - 0.25, { y: -8, d: 0.45 }); show(rel, T('o9', '关系') - 0.05, { y: 12, d: 0.55 });
  to(cards.slice(0, 3).map((c) => c.c), T('o10', 'ClickHouse') - 0.1, { opacity: 0.4, duration: 0.45 });
  // o10：ClickHouse 那一张，表拆成一列一列（S01），两列之间拉开；随后一道虚线把两列围回一张表
  const chT = cards[3].tb;
  const tSplit = T('o10', '一列一列');
  to(chT.cols[0], tSplit - 0.15, { x: -14, duration: 0.6, ease: 'power2.out' });
  to(chT.cols[1], tSplit - 0.15, { x: 20, duration: 0.6, ease: 'power2.out' });
  const chOut = h('div', 'abs', cards[3].c); px(chOut, 10, 128, 300, RH * 4 + 24); css(chOut, { border: '3px dashed ' + K.forest, borderRadius: '10px' });
  show(chOut, T('o10', '还是表') - 0.1, { y: 0, s: 1.04, d: 0.45 }); to(cards[3].c, T('o10', '还是表') - 0.1, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 });
  const chC = res(cards[3].c, 168, 14, '按列存', 'ink', T('o10', '把表') - 0.1, { fs: 24, lh: 40, pad: 14 });
  textAt(chC, [[0, '按列存'], [T('o10', '还是表') - 0.05, '仍是表']]); to(chC, T('o10', '还是表') - 0.05, { backgroundColor: K.forest, duration: 0.35 });
  // o11：MongoDB：一张卡里是一份文档，查询也是一份文档；四张 SQL 卡退到后面
  const mc = h('div', 'panel', world); px(mc, CX0 + 4 * (CW + CG), CY, CW, CH); css(mc, { borderColor: K.g1, borderWidth: '3px' });
  label(mc, 24, 22, 'PART 6 · 本集', 'lab');
  const mn = h('div', 'abs', mc, 'MongoDB'); css(mn, { left: '24px', top: '60px', font: '700 40px "Inter"', color: K.forest });
  const md = docCard(mc, 20, 140, [['name', JS('Alice')], ['age', JN(42)]], { w: 280, fs: 25 });
  const mq = h('div', 'abs mono', mc, 'db.users.<span class="kw">find</span>()'); css(mq, { left: '24px', top: '400px', font: '500 22px "Mono"', color: K.gd2, padding: '6px 10px', background: K.gl3, border: '1.5px solid ' + K.gl2, borderRadius: '6px' });
  show(mc, T('o11') - 0.05, { x: 50, y: 0, d: 0.65 }); sfx('pop', T('o11'));
  to(cards.map((c) => c.c), T('o11', '既不') - 0.1, { opacity: 0.5, duration: 0.5 });
  to(md.c, T('o11', '不建表') - 0.1, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.4 });
  to(mq, T('o11', '不写') - 0.05, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.4 });
  const tB1 = T('o12') - 0.25;                    // B 退场，SQL 飞向中间
  fadeOut([...cards.map((c) => c.c), mc, brace, rel, chOut], tB1, 0.55);

  // ══ C：SQL 前面加 No ══
  const WY = 196;
  const word = h('div', 'abs', world); px(word, 0, WY, 1920); css(word, { font: '800 200px/1.1 "Inter"', color: K.ink, letterSpacing: '-.02em', textAlign: 'center', whiteSpace: 'nowrap' });
  const wNo = h('span', '', word, 'No'); css(wNo, { color: K.forest, display: 'inline-block' });
  const wMid = h('span', '', word, 't only&nbsp;'); css(wMid, { color: K.forest, display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' });
  const wSQL = h('span', '', word, 'SQL'); css(wSQL, { display: 'inline-block' });
  const noW = wNo.offsetWidth || 300, midW = wMid.offsetWidth || 700;
  css(wMid, { width: '0px' });
  // 三个加粗的 SQL 从名字上飞起，汇到中间那个 SQL
  const tFlyS = T('o12') - 0.15;
  const sqlW = wSQL.offsetWidth || 470, targetX = 960 - sqlW / 2, targetY = WY + 4;
  cards.slice(0, 3).forEach((cd, i) => {
    const fl = h('div', 'abs', world, 'SQL'); css(fl, { font: '850 40px "Inter"', color: K.forest, transformOrigin: '0 0' });
    const sx = CX0 + i * (CW + CG) + 24 + (cd.sqb ? cd.sqb.offsetLeft : 0), sy = CY + 60;
    px(fl, sx, sy);
    tl.fromTo(fl, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tFlyS - 0.2);
    tl.to(fl, { x: targetX - sx, y: targetY - sy, scale: 200 / 40, autoAlpha: 0, duration: 0.85, ease: 'power2.inOut' }, tFlyS + i * 0.06);
  });
  // 中间的 SQL：先独自居中（No 还没进来），No 从左边推进来
  tl.fromTo(word, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, immediateRender: true }, tFlyS + 0.45);
  const tNo = T('o12', 'No') - 0.12;
  tl.fromTo(wNo, { x: -noW / 2 - 260, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.5)', immediateRender: true }, tNo);
  tl.fromTo(wSQL, { x: -noW / 2 }, { x: 0, duration: 0.6, ease: 'back.out(1.5)', immediateRender: true }, tNo);
  sfx('thud', tNo + 0.3);
  // o12b：停顿之后念出 NoSQL，下面一道绿线描出来
  const ulW = noW + sqlW + 40; const ul = h('div', 'abs', world); px(ul, 960 - ulW / 2, WY + 250, ulW, 6); css(ul, { background: K.spring, transformOrigin: '50% 50%' });
  fromTo(ul, T('o12b') - 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' });
  to(wSQL, T('o12b') - 0.05, { color: K.forest, duration: 0.45 });
  tl.to(word, { scale: 1.08, duration: 0.6, ease: 'power2.out' }, T('o12b') - 0.1);
  // o12c：No 有两种读法——从 No 分出两条线
  const RY = 600;
  const brL = link(ov, [[960, WY + 268], [960, RY - 60], [470, RY - 60], [470, RY - 14]], 'accent', { w: 3 });
  const brR = link(ov, [[960, WY + 268], [960, RY - 60], [1450, RY - 60], [1450, RY - 14]], 'accent', { w: 3 });
  draw(brL, T('o12c', '两种') - 0.1, 0.7); draw(brR, T('o12c', '两种') + 0.05, 0.75);
  const rn = [res(world, 386, 516, '1', 'ink', T('o12c', '两种') + 0.3, { pad: 18 }), res(world, 1478, 516, '2', 'ink', T('o12c', '两种') + 0.45, { pad: 18 })];
  fadeOut(rn, T('o13') - 0.45, 0.55);
  const rd = [['No', '不用 SQL', T('o12d', '不用')], ['Not only', '不只用 SQL', T('o12e', '不只')]].map(([en, zh, t], i) => {
    const g = h('div', 'abs', world); px(g, i === 0 ? 170 : 1150, RY, 600, 260); css(g, { textAlign: 'center' });
    const a = h('div', 'abs', g, en); css(a, { left: 0, top: '10px', width: '600px', font: '700 52px "Mono"', color: K.forest });
    const b = h('div', 'abs', g, `<span style="display:inline-block;padding:0 26px;border-radius:14px;color:#FFFFFF;background:${i ? K.forest : K.ink}">${zh.replace('SQL', '<span style="font-family:Inter">SQL</span>')}</span>`); css(b, { left: 0, top: '100px', width: '600px', font: '700 76px "Sans SC"', color: K.ink });
    show(a, T('o12c', '两种') + 0.35 + i * 0.2, { y: 12, d: 0.5 });
    show(b, t - 0.15, { y: 16, d: 0.55 });
    return g;
  });
  // o12e：No 展开成 Not only
  const tOnly = T('o12e', 'Not') - 0.1;
  css(wNo, { borderRadius: '24px' }); to(wNo, T('o12c', 'No') - 0.1, { backgroundColor: K.spring, color: K.ink, duration: 0.35 });
  to(wNo, tOnly, { backgroundColor: 'rgba(0,0,0,0)', color: K.forest, duration: 0.35 });   // lint-ok: 取消高亮
  to(rd[0], tOnly, { opacity: 0.35, duration: 0.5 });
  fromTo(wMid, tOnly, { width: 0 }, { width: midW, duration: 0.85, ease: 'power3.inOut' });
  to(ul, tOnly, { scaleX: (ulW + midW) / ulW, duration: 0.85, ease: 'power3.inOut' });
  const tC1 = T('o13') - 0.45;
  fadeOut([word, ul, ...rd], tC1, 0.55);
  [brL, brR].forEach((p) => fadeOut(p, tC1, 0.55));

  // ══ D：跟着 Alice 往下走（左），五个问题一条条列出（右） ══
  const LX = 200;
  const dd = docCard(world, LX + 210, 186, [['name', JS('Alice')], ['age', JN('<span class="ag">42</span>')]], { w: 360, fs: 30 });
  const ag = dd.c.querySelector('.ag');
  const pBox = h('div', 'panel', world); px(pBox, LX, 446, 780, 136);
  icon(pBox, 30, 44, 'server', 48, K.forest);
  const pT = h('div', 'abs', pBox, 'MongoDB'); css(pT, { left: '96px', top: '46px', font: '700 38px "Inter"', color: K.forest });
  const disk = h('div', 'panel gray', world); px(disk, LX, 680, 780, 230);
  icon(disk, 30, 26, 'disk', 46, K.gd2);
  const dT = h('div', 'abs', disk, '磁盘'); css(dT, { left: '96px', top: '30px', font: '700 34px "Sans SC"', color: K.gd2 });
  const files = [0, 1, 2].map((i) => { const f = h('div', 'abs', disk, '?.wt'); css(f, { left: 96 + i * 220 + 'px', top: '96px', width: '180px', height: '104px', background: '#fff', border: '2px solid ' + K.gl1, borderRadius: '10px', font: '600 34px/100px "Mono"', color: K.gd1, textAlign: 'center' }); return f; });
  const tD = T('o13') - 0.05;
  show(pBox, tD, { y: 16, d: 0.6 }); show(disk, tD + 0.15, { y: 16, d: 0.6 });
  show(dd.c, tD + 0.3, { y: -14, d: 0.6 });
  // o13：存进磁盘——一份副本往下落，穿过 MongoDB，落进一个文件
  const drop = docCard(world, LX + 210, 186, [['name', JS('Alice')], ['age', JN(42)]], { w: 360, fs: 30, cls: 'on' });
  const tIn = T('o13', '存进') - 0.35;
  to(dd.c, tIn, { opacity: 0.2, duration: 0.25 }); to(dd.c, T('o14', '找') + 1.6, { opacity: 1, duration: 0.4 });
  tl.fromTo(drop.c, { autoAlpha: 0, y: 0, scale: 1 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, tIn);
  tl.to(drop.c, { y: 230, scale: 0.85, duration: 0.7, ease: 'power2.in' }, tIn + 0.15);
  tl.to(drop.c, { y: 537, x: -204, scale: 0.35, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, tIn + 0.85);
  to(files[0], tIn + 1.3, { borderColor: K.g1, backgroundColor: K.mint, color: K.forest, duration: 0.4 }); sfx('thud', tIn + 1.35, { g: 0.6 });
  // o14：找回来——一条查询下去，她的资料升上来
  const qq = code(world, LX + 320, 610, '{ <span class="k">name</span>: <span class="s">"Alice"</span> }'); css(qq, { fontSize: '26px' });
  const tFind = T('o14', '找') - 0.5;
  tl.fromTo(qq, { autoAlpha: 0, y: -200 }, { autoAlpha: 1, y: -200, duration: 0.25, immediateRender: true }, tFind - 0.1);
  tl.to(qq, { y: 110, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, tFind + 0.1);
  const up = docCard(world, LX + 210, 186, [['name', JS('Alice')], ['age', JN(42)]], { w: 360, fs: 30, cls: 'on' });
  tl.fromTo(up.c, { autoAlpha: 0, y: 537, x: -204, scale: 0.35 }, { autoAlpha: 1, y: 230, x: 0, scale: 0.85, duration: 0.6, ease: 'power2.out', immediateRender: true }, tFind + 0.85);
  tl.to(up.c, { y: 0, scale: 1, autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' }, tFind + 1.45);
  // o15：改了年龄——磁盘上那个文件打上问号
  const tAge = T('o15', '改了');
  tl.to(ag, { autoAlpha: 0, y: -10, duration: 0.2 }, tAge);
  tl.fromTo(ag, { y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, tAge + 0.22);
  const qm = h('div', 'abs', world, '?'); px(qm, LX + 740, 610, 110); css(qm, { font: '800 130px "Inter"', color: K.forest, textAlign: 'center' });
  solid(dd.r.age, tAge, 'new', [T('o16') - 0.3, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]); classAt(dd.r.age, 'inv', tAge, T('o16') - 0.3);   // 实心时行里的字跟着行变白（class 切换，倒着 seek 也一样）
  show(qm, T('o15', '磁盘') - 0.1, { y: 14, s: 0.8, d: 0.5 });
  res(world, 790, 250, '42 → 43', 'new', T('o15', '改了') + 0.2, { out: T('o16') - 0.3 });
  to(files[0], T('o15', '磁盘') - 0.1, { borderStyle: 'dashed', duration: 0.4 });
  fadeOut(qm, T('o16') - 0.2, 0.4);
  to(files[0], T('o16') - 0.3, { borderStyle: 'solid', duration: 0.4 });
  // o16：一个人在读、一个人在改，同一份资料——谁等谁
  const pr = person(world, LX - 130, 176, '读', K.blued, 60);
  const pw = person(world, LX + 640, 176, '改', K.forest, 60);
  show(pr, T('o16', '读') - 0.2, { x: -20, y: 0, d: 0.5 }); show(pw, T('o16', '改') - 0.2, { x: 20, y: 0, d: 0.5 });
  const a1 = link(ov, [[LX + 30, 216], [LX + 200, 216]], 'blue', { w: 3, arrow: true }), a2 = link(ov, [[LX + 640, 216], [LX + 584, 216]], 'accent', { w: 3, arrow: true });
  arrowIn(a1, T('o16', '读'), 0.45); arrowIn(a2, T('o16', '改'), 0.45);
  const ww = h('div', 'abs', world, '?'); px(ww, LX + 390 - 35, 104, 70); css(ww, { font: '800 60px/84px "Inter"', color: '#FFFFFF', background: K.yeld, borderRadius: '14px', textAlign: 'center' });
  show(ww, T('o16', '谁等谁') - 0.1, { y: 10, d: 0.45 });
  to(dd.c, T('o16', '谁等谁') - 0.1, { backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.4 }); to(dd.c, T('o16b') - 0.15, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.4 });
  res(world, LX - 150, 290, '在读', 'read', T('o16', '读') - 0.1, { out: T('o16b') - 0.15 }); res(world, LX + 626, 290, '在改', 'new', T('o16', '改') - 0.1, { out: T('o16b') - 0.15 });
  fadeOut([pr, pw, ww], T('o16b') - 0.15, 0.45); [a1, a2].forEach((p) => fadeOut(p, T('o16b') - 0.15, 0.45));
  // o16b：进程被杀——MongoDB 那一层熄掉；正往下写的一份变成红色虚线（可能丢了）
  const tKill = T('o16b', '杀') - 0.05;
  tl.fromTo(pBox, { x: 0 }, { x: 10, duration: 0.12, ease: 'power1.inOut', yoyo: true, repeat: 1, immediateRender: false }, tKill);
  to(pBox, tKill + 0.25, { backgroundColor: K.gl2, borderColor: K.gb, duration: 0.45 });
  to(pT, tKill + 0.25, { color: K.gd1, duration: 0.45 });
  const bolt = icon(pBox, 660, 20, 'bolt', 96, K.red, 3); show(bolt, tKill, { y: -10, s: 0.7, d: 0.35 }); sfx('error', tKill + 0.05, { g: 0.7 });
  const lostQ = h('div', 'abs', world, '?'); px(lostQ, LX + 760, 700, 80); css(lostQ, { font: '800 96px "Inter"', color: K.red, textAlign: 'center' });
  show(lostQ, T('o16b', '丢掉') - 0.2, { y: 12, s: 0.8, d: 0.45 });
  to(files, T('o16b', '丢掉') - 0.1, { borderColor: K.red, borderStyle: 'dashed', duration: 0.4 });
  // o16c：进程起来了；Alice 注销——她这一份变成红色虚线、淡下去，磁盘上那个文件打上问号
  const tUp = T('o16c') - 0.2;
  fadeOut([bolt, lostQ], tUp, 0.45);
  to(files, tUp, { borderStyle: 'solid', borderColor: K.gl1, duration: 0.4 });
  to(pBox, tUp, { backgroundColor: '#FFFFFF', borderColor: K.gl2, duration: 0.5 });
  to(pT, tUp, { color: K.forest, duration: 0.5 });
  const tDel = T('o16c', '注销') - 0.05;
  to(dd.c, tDel, { borderStyle: 'dashed', borderColor: K.red, color: K.gd1, opacity: 0.45, duration: 0.6 }); to(dd.c, T('o16c', '资料') - 0.3, { backgroundColor: '#FFC7BC', duration: 0.4 });
  const qDel = h('div', 'abs', world, '?'); px(qDel, LX + 760, 640, 84); css(qDel, { font: '800 80px/104px "Inter"', color: '#FFFFFF', background: K.yeld, borderRadius: '14px', textAlign: 'center' });
  show(qDel, T('o16c', '资料') - 0.1, { y: 14, s: 0.8, d: 0.5 });
  res(world, 790, 250, '注销', 'del', T('o16c', '账号') - 0.1, { out: T('o17') - 0.1 });
  to(files[0], T('o16c', '哪里') - 0.15, { borderStyle: 'dashed', backgroundColor: '#FCE9B0', borderColor: K.yeld, duration: 0.4 });
  // o17：重来一遍，沿着 Alice 这一份往下走的路线
  const tGo = T('o17') - 0.1;
  fadeOut(qDel, tGo, 0.4);
  to(files[0], tGo, { borderStyle: 'solid', backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.4 });
  to(dd.c, tGo, { borderStyle: 'solid', borderColor: K.g1, backgroundColor: K.mint, color: K.ink, opacity: 1, duration: 0.5 });
  to(dd.c, T('o17') + 0.45, { backgroundColor: K.forest, borderColor: K.forest, color: '#FFFFFF', duration: 0.4 }); classAt(dd.c, 'inv', T('o17') + 0.45);
  { let last = null; const t1 = tAge + 0.2, t2 = tGo + 0.25; F((t) => { const v = t >= t1 && t < t2 ? '43' : '42'; if (v !== last) { ag.textContent = v; last = v; } }); }
  tl.to(ag, { autoAlpha: 0, duration: 0.2 }, tGo + 0.05); tl.to(ag, { autoAlpha: 1, duration: 0.3 }, tGo + 0.27);
  const path0 = link(ov, [[LX + 390, 400], [LX + 390, 446]], 'spring', { w: 6 }), path1 = link(ov, [[LX + 390, 582], [LX + 390, 680]], 'spring', { w: 6 });
  draw(path0, T('o17', '往下走') - 0.35, 0.45); draw(path1, T('o17', '往下走') + 0.05, 0.45);
  to(files, T('o17', '往下走') + 0.4, { borderColor: K.g1, duration: 0.4 });
  to(pBox, T('o17', '往下走') - 0.3, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 });
  files.forEach((f, i) => solid(f, T('o17', '往下走') + 0.45 + i * 0.12, 'new'));

  // 右边：五个问题（系列约定），问到哪一条，哪一条出现并亮起
  const QX = 1180, QY = 236, QD = 128;
  const QS = [['放', '怎样存进磁盘', T('o13', '存进')], ['找', '怎样被找出来', T('o14', '找')], ['改和删', '磁盘上变了什么', T('o15', '改了')], ['并发', '谁等谁', T('o16', '读')], ['出错', '丢了什么', T('o16b', '杀')]];
  const qbar = h('div', 'abs', world); px(qbar, QX - 26, QY - 12, 660, 100); css(qbar, { background: K.mint, borderLeft: '6px solid ' + K.g1, borderRadius: '8px' });
  const qItems = QS.map(([k, d, t], i) => {
    const e = h('div', 'abs', world); px(e, QX, QY + i * QD, 620, 80);
    e.innerHTML = `<span style="display:inline-block;width:56px;font:700 30px Mono;color:${K.gb}">${i + 1}</span><span style="font:700 42px 'Sans SC';color:${K.ink}">${k}</span><span style="margin-left:24px;font:500 32px 'Sans SC';color:${K.gd2}">${d}</span>`;
    show(e, t - 0.3, { x: 24, y: 0, d: 0.5 });
    return e;
  });
  fromTo(qbar, QS[0][2] - 0.3, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.4 });
  for (let i = 1; i < 5; i++) tl.fromTo(qbar, { y: (i - 1) * QD }, { y: i * QD, duration: 0.45, ease: 'power2.inOut', immediateRender: false }, QS[i][2] - 0.35);
  tl.fromTo(qbar, { y: 4 * QD }, { y: 2 * QD, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, T('o16c', '注销') - 0.35);
  fadeOut(qbar, T('o17') + 0.2, 0.5);

  // ══ 片名（oT）：系列目录一项项递出，选中条落到 PART 6 ══
  const tOT = T('oT');
  const P = partCard(root, 6, tOT);
  const cr = h('div', 'crumb2', P.main, '文档<i>/</i>数据库引擎<i>/</i>PART 6'); css(cr, { top: '190px' });
  const badge = h('div', 'abs', P.main, 'PART 6'); px(badge, 0, 268); css(badge, { font: '700 52px "Mono"', color: K.spring, background: K.ink, padding: '10px 30px', borderRadius: '12px', letterSpacing: '.06em' });
  const tt = h('div', 'abs', P.main, '不是 SQL'); px(tt, -6, 400); css(tt, { font: '900 190px/1.1 "Sans SC"', color: K.ink });
  const rule = h('div', 'abs', P.main); px(rule, 0, 680, 1000, 5); css(rule, { background: K.spring, transformOrigin: '0 50%' });
  const st = h('div', 'abs', P.main, 'MongoDB 的 WiredTiger'); px(st, 0, 712); css(st, { font: '500 80px "Serif SC"', color: K.forest });
  const vv = chip(P.main, 0, 860, 'MongoDB 9.0.8', '');
  show(cr, tOT + 0.3, { x: -16, y: 0, d: 0.5 }); slam(badge, tOT + 0.5, { from: 1.2 }); slam(tt, tOT + 0.8, { from: 1.12 }); show(st, tOT + 1.9, { y: 20 });
  fromTo(rule, tOT + 1.1, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });
  show(vv, tOT + 2.8, { y: 10 });
  sfx('thud', tOT + 0.85);
  tl.set([world, ch.c], { autoAlpha: 0 }, tOT + 0.45);   // 片名整屏盖住后，下面的内容不再算画面
});
