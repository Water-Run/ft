// 01 一个库，一个文件：整章一张图。中间一排「应用程序 → 数据库服务器 → 磁盘上的数据」跟着来历变：军舰上的软件（上方的管道与阀门）、
// Informix 服务器停了弹出「连不上数据库服务器」、「为什么不能直接从磁盘上读」的虚线、同事那句话、SQLite 装进程序里、Tcl；版本表；
// 再与服务型并排比两种做法；最后这一排展开成「SQL → 指令 → 内存 → 文件」。事实：G11（Hipp 本人回忆）、G12、G13、G02、G14、G10、G07、A01、H06、I02。
scene('lib', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const box = (html, x, y, w, hh, o = {}) => { const e = h('div', 'abs', W, html); px(e, x, y, w, hh); css(e, { border: `2px solid ${o.color || K.ink}`, background: o.fill || '#fff', fontSize: (o.fs || 30) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.3, boxSizing: 'border-box' }); return e; };
  const title = pageTitle(W, '一个库，一个文件'); show(title, c0 + 0.1, { y: 8 });

  // ── h1：作者 ──
  const who = tx(W, 'Richard Hipp', 120, 262, { fs: 56, color: K.teal }); who.dataset.name = '作者';
  const whoL = tx(W, 'SQLite 的作者（主导开发者）', 124, 342, { fs: 26, color: K.dim });
  wipe(who, T('h1', 'Richard') - 0.1, { dir: 'l', d: 0.5 }); show(whoL, T('h1', 'Richard') + 0.3, { y: 6 }); sfx('pop', T('h1', 'Richard'), { g: 0.4 });

  // ── h2–h3：军舰上的软件：管道破了，关哪几个阀门 ──
  const shipL = tx(W, '管道破了，告诉船员关哪几个阀门、开哪几个', 960, 262, { fs: 26 });
  const facts = ['2000 年前后', '军舰　DDG-79 Oscar Austin', '软件　Automated Common Diagrams'].map((t, i) => tx(W, t, 124, 400 + i * 46, { fs: 26 }));
  [T('h2'), T('h2', '军舰'), T('h2', '写软件')].forEach((t, i) => show(facts[i], t - 0.1, { x: -10, y: 0 }));
  const pipe = h('div', 'abs', W); px(pipe, 960, 372, 820, 8); css(pipe, { background: K.ink });
  const valves = [1080, 1300, 1560, 1720].map((x) => { const v = h('div', 'abs valve', W); px(v, x - 16, 360, 32, 32); css(v, { border: `2px solid ${K.ink}`, background: '#fff', transform: 'rotate(45deg)' }); return v; });
  const crack = h('div', 'abs', W); px(crack, 1420, 352, 10, 48); css(crack, { background: K.red, transform: 'skewX(-20deg)' });
  const vl = [['关', 1300], ['关', 1560], ['开', 1720]].map(([t, x]) => { const e = tx(W, t, x - 12, 404, { fs: 24, color: t === '关' ? K.ink : K.teal }); return e; });
  show(shipL, T('h3') - 0.1, { y: 8 }); wipe(pipe, T('h2', '写软件'), { dir: 'l', d: 0.6 }); valves.forEach((v, i) => show(v, T('h2', '写软件') + 0.4 + i * 0.1, { y: -10 }));
  slam(crack, T('h3', '管道破了'), { from: 1.6 }); sfx('error', T('h3', '管道破了'), { g: 0.4 });
  [valves[1], valves[2]].forEach((v, i) => set(v, T('h3', '关') + i * 0.15, { backgroundColor: K.ink })); set(valves[3], T('h3', '关') + 0.4, { backgroundColor: K.wheat });
  vl.forEach((e, i) => show(e, T('h3', '关') + i * 0.15, { y: 6 })); sfx('tick', T('h3', '关'), { g: 0.5 });

  // ── h4–h7：船上装好的 Informix 服务器；服务器一停就弹窗；为什么不能直接从磁盘上读 ──
  const app = box('应用程序', 120, 560, 300, 100); app.dataset.beat = 'fill';   // 后面会清空文字、名字改由叠在上面的 appL 显示：选中用浅青底
  const srv = box('Informix<br>数据库服务器', 640, 550, 420, 120);
  const disk = h('div', 'abs', W); px(disk, 1300, 555, 240, 120); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', disk); px(r, i * 10, i * 10, 200, 80); }
  const diskL = tx(disk, '管道与阀门的数据', 0, 100, { fs: 22, color: K.dim });
  const a1 = line(ov, [[420, 610], [640, 610]]), a2 = line(ov, [[1060, 610], [1298, 610]]);
  wipe(app, T('h4') - 0.1, { dir: 'l', d: 0.4 }); slam(srv, T('h4', 'Informix'), { from: 1.15 }); arrowIn(a1, T('h4', 'Informix') + 0.2, 0.4); arrowIn(a2, T('h4', '服务器') + 0.1, 0.4); show(disk, T('h4', '服务器') + 0.2, { x: -12, y: 0 }); disk.dataset.beat = 'text';
  sfx('thud', T('h4', 'Informix'), { g: 0.4 });
  const shipAll = [shipL, pipe, crack, ...valves, ...vl, ...facts];
  shipAll.forEach((e) => dim(e, T('h4') - 0.1, 0.25));
  const tStop = T('h5', '一停');
  set(srv, tStop, { backgroundColor: '#555555', color: '#ffffff' }); sfx('error', tStop + 0.5, { g: 0.5 });   // 服务器停了：深灰底白字
  const dlg = h('div', 'abs', W, '<div class="dlgT">Error</div><div class="dlgB">Can’t connect to database server</div><div class="dlgC">连不上数据库服务器</div>'); px(dlg, 600, 400, 520, 130); dlg.dataset.name = '弹窗';
  css(dlg, { border: `2px solid ${K.ink}`, background: '#fff', fontSize: '24px' });
  set(dlg, 0, { autoAlpha: 0 }); slam(dlg, T('h5', '弹出'), { from: 1.25 });
  // 为什么不能直接从磁盘上读：一条虚线从程序直通磁盘
  const dir = line(ov, [[270, 662], [270, 760], [1400, 760], [1400, 680]], { dashed: '9 7' });
  const qm = tx(W, '？', 820, 712, { fs: 40, color: K.teal });
  arrowIn(dir, T('h6b', '磁盘') - 0.2, 0.8); show(qm, T('h6b', '直接'), { y: 8 }); sfx('whoosh', T('h6b', '磁盘') - 0.2, { g: 0.3 });
  dim(srv, T('h6', '服务器'), 0.45);
  const none = tx(W, '当时没有这样的 SQL 数据库', 880, 720, { fs: 26, color: K.dim }); show(none, T('h7', '找了一圈') + 0.3, { y: 6 });
  // h8：同事那句话（访谈原话与中文）
  const quote = h('div', 'abs', W, '“Richard, why don’t you just write one?”<br><span style="font-size:24px;color:#666">那你自己写一个</span>'); px(quote, 120, 800, 900);
  css(quote, { fontSize: '30px', fontStyle: 'italic', borderLeft: `6px solid ${K.teal}`, paddingLeft: '20px', lineHeight: 1.4 });
  set(quote, 0, { autoAlpha: 0 }); wipe(quote, T('h8') - 0.1, { dir: 'l', d: 0.5 }); sfx('pop', T('h8'), { g: 0.4 });
  gone(dlg, T('h7') - 0.1, 0.3);

  // h9–h10：他回忆，那年政府合同停了几个月，就真的自己写了：服务器退场，SQLite 装进程序里，虚线变实线
  const memo = h('div', 'abs', W, '他回忆：<b>2000 年</b>，政府合同停了几个月'); px(memo, 940, 262); css(memo, { fontSize: '26px', fontStyle: 'italic' });
  shipAll.forEach((e) => goneFrom(e, T('h9') - 0.2, 0.25));   // 已经压到 25%：从 25% 收起
  set(memo, 0, { autoAlpha: 0 }); show(memo, T('h9', '政府') - 0.1, { y: 8 });
  const tBuild = T('h10', '自己写了');
  goneFrom(srv, tBuild - 0.3, 0.45); [a1, a2, qm, none].forEach((e) => gone(e, tBuild - 0.3, 0.3)); gone(quote, tBuild - 0.3, 0.3);
  tl.fromTo(app, { width: 300 }, { width: 920, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tBuild - 0.1);
  keyed(app).at(tBuild - 0.1, { html: '' });
  const appL = tx(W, '应用程序', 146, 572, { fs: 24 }); set(appL, 0, { autoAlpha: 0 }); set(appL, tBuild + 0.3, { autoAlpha: 1 });
  const lib = box('SQLite', 620, 585, 380, 64, { fill: K.wheat, color: K.teal, fs: 32 }); lib.dataset.name = 'SQLite 库';
  slam(lib, tBuild + 0.2, { from: 1.3 }); sfx('thud', tBuild + 0.2, { g: 0.5 });
  const solid = line(ov, [[1040, 610], [1298, 610]]); arrowIn(solid, tBuild + 0.6, 0.4);
  tl.fromTo(dir, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, tBuild + 0.5);
  keyed(diskL).at(tBuild + 0.6, { html: 'main.db：一个文件' });
  // h10b、h10c：起初是 Tcl 的一个扩展；主要的测试仍用 Tcl 写
  const tcl = btn(W, 'Tcl 扩展', 620, 680, 26); set(tcl, 0, { autoAlpha: 0 }); slam(tcl, T('h10b', 'T C L'), { from: 1.2 }); sfx('pop', T('h10b', 'T C L'), { g: 0.4 });
  const test = btn(W, '主要的测试：Tcl', 780, 680, 26); set(test, 0, { autoAlpha: 0 }); slam(test, T('h10c', '测试'), { from: 1.2 }); sfx('pop', T('h10c', '测试'), { g: 0.4, p: 0.3 });

  // h11–h12：版本表（Release History）
  gone(memo, T('h11') - 0.3, 0.3); gone(who, T('h11') - 0.3, 0.3); gone(whoL, T('h11') - 0.3, 0.3);
  const rel = docTable(W, [['版本', 170], ['发布', 230], ['', 380]], [['1.0', '2000-08-17', ''], ['3.0.0', '2004-06-18', '今天的文件格式'], ['3.54.1', '2026-10-16', '本片用的版本']], 940, 250, { fs: 28 });
  rel.t.dataset.name = '版本表';
  show(rel.hr, T('h11') - 0.1, { y: 6 }); show(rel.rs[0], T('h11', '1.0'), { x: -10, y: 0 }); show(rel.rs[1], T('h11b', '3.0'), { x: -10, y: 0 }); show(rel.rs[2], T('h12', '3.54.1'), { x: -10, y: 0 });
  sfx('tick', T('h11', '1.0'), { g: 0.4 }); sfx('tick', T('h11b', '3.0'), { g: 0.4 }); sfx('tick', T('h12', '3.54.1'), { g: 0.4 });

  // ── l1–l2b：两种做法并排：上方补一排服务型 ──
  const tCmp = T('l1') - 0.2;
  [rel.t, tcl, test].forEach((e) => gone(e, tCmp, 0.3));
  const h12 = h2(W, '两种做法', 120, 250, 36); show(h12, tCmp + 0.1, { y: 6 });
  const sApp = box('应用程序', 120, 320, 260, 80, { fs: 26 }), sSrv = box('服务进程', 600, 315, 320, 90, { fs: 28 }), sF = box('数据文件', 1300, 320, 220, 80, { fs: 24 });
  const s1 = line(ov, [[380, 360], [600, 360]], { dashed: '8 6' }), s2 = line(ov, [[920, 360], [1298, 360]]);
  [sApp, sSrv, sF].forEach((e, i) => wipe(e, tCmp + 0.15 + i * 0.12, { dir: 'l', d: 0.4 })); arrowIn(s1, tCmp + 0.5, 0.4); arrowIn(s2, tCmp + 0.6, 0.4);
  const p1 = tx(W, '・所有访问都经过它', 960, 416, { fs: 26 }), p2 = tx(W, '・能把访问安排得更细，多人同时用也更顺', 960, 452, { fs: 26 });
  show(p1, T('l1', '经过它'), { x: 10, y: 0 }); show(p2, T('l1b', '更细'), { x: 10, y: 0 });
  const p3 = tx(W, '・不用安装、配置、管理', 1060, 690, { fs: 26 }), p4 = tx(W, '・能读写磁盘的程序，就能用', 1060, 726, { fs: 26 });
  show(p3, T('l2', '安装'), { x: 10, y: 0 }); show(p4, T('l2b', '磁盘'), { x: 10, y: 0 });
  const xSrv = h('div', 'abs', W); px(xSrv, 600, 480, 420, 3); css(xSrv, { background: K.red }); set(xSrv, 0, { autoAlpha: 0 }); wipe(xSrv, T('l2', '省掉'), { dir: 'l', d: 0.4 });
  const xL = tx(W, '省掉这个进程', 620, 488, { fs: 24, color: K.red }); show(xL, T('l2', '省掉') + 0.2, { y: 6 });
  // l4：库的大小
  const size = h('div', 'abs', W); px(size, 620, 780, 380, 40); css(size, { background: K.wheat, border: `2px solid ${K.ink}`, transformOrigin: '0 50%' });
  const sizeL = tx(W, '全部功能都打开，也可以 < 900 KiB', 620, 830, { fs: 26 });
  tl.fromTo(size, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('l4', '九百'));
  show(sizeL, T('l4', '全部功能') - 0.1, { y: 6 }); sfx('tick', T('l4', '九百'), { g: 0.4 });

  // ── l7–l10：库里怎么走：SQL → 指令 → 取数据；数据都在一个文件里；读过的留在内存里 ──
  const tIn = T('l7') - 0.2;
  [h12, sApp, sSrv, sF, s1, s2, p1, p2, p3, p4, xSrv, xL, size, sizeL].forEach((e) => gone(e, tIn, 0.3));
  const sql = codeBlock(W, ["SELECT * FROM users", "WHERE name = 'Alice';"], 120, 270, { fs: 26 });
  wipe(sql, T('l7', 'S Q L') - 0.1, { dir: 'l', d: 0.4 });
  const ops = DATA.bytecode.map((b) => b.op);
  const opBox = h('div', 'abs', W); px(opBox, 640, 290, 600, 250); css(opBox, { border: `2px solid ${K.ink}`, background: '#fff', padding: '10px 18px', boxSizing: 'border-box' }); opBox.dataset.name = '指令';   // 让开页标题
  const opH = tx(opBox, `编译出的指令：${ops.length} 条`, 18, 8, { fs: 24, color: K.teal });
  const opEls = ops.map((o, i) => tx(opBox, o, 18 + (i % 3) * 192, 50 + Math.floor(i / 3) * 38, { fs: 24, mono: true }));
  const c1 = line(ov, [[470, 330], [636, 330]]);
  arrowIn(c1, T('l7b', '编译') - 0.2, 0.4); wipe(opBox, T('l7b', '编译'), { dir: 't', d: 0.45 }); show(opH, T('l7b', '编译') + 0.2, { y: 6 });
  opEls.forEach((e, i) => show(e, T('l7b', '指令') + i * 0.05, { y: 6, d: 0.25 })); sfx('tick', T('l7b', '指令'), { g: 0.4 });
  const c2 = line(ov, [[900, 542], [900, 582]]); arrowIn(c2, T('l7b', '取数据'), 0.4);
  // l6：所有的数据都在这一个文件里
  tl.fromTo(disk, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: '50% 50%', immediateRender: false }, T('l6', '一个文件'));
  const fileN = tx(W, '所有的表和索引', 1300, 700, { fs: 24, color: K.teal }); show(fileN, T('l6', '一个文件') + 0.1, { y: 6 });
  // l9：读过的部分留在内存里
  const mem = box('内存：读过的页', 1260, 270, 300, 90, { fs: 26, fill: K.wheat });
  const mArrow = line(ov, [[1420, 553], [1420, 362]]);
  wipe(mem, T('l9', '内存') - 0.1, { dir: 'b', d: 0.4 }); arrowIn(mArrow, T('l9', '留在') - 0.1, 0.4); sfx('pop', T('l9', '内存'), { g: 0.4 });
  const miss = tx(W, '没有，才去读文件', 1580, 440, { fs: 24, color: K.dim }); show(miss, T('l9', '才去读文件') - 0.1, { x: -8, y: 0 });

  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('h1', 'Richard'), who], [T('h2'), facts[0]], [T('h2', '军舰'), facts[1]], [T('h2', '写软件'), facts[2]], [T('h3'), shipL], [T('h3', '关'), vl], [T('h4', 'Informix'), srv], [T('h4', '服务器') + 0.2, disk], [T('h5', '弹出'), app], [T('h5', '连不上'), dlg], [T('h5', '数据库服务器'), srv], [T('h6'), app], [T('h7'), none], [T('h8'), quote], [T('h9'), memo], [T('h10'), memo], [T('h10b'), tcl], [T('h10c'), test],
    [T('h11'), rel.rs[0]], [T('h11b'), rel.rs[1]], [T('h12'), rel.rs[2]], [T('l1'), sSrv], [T('l1b'), p2], [T('l2'), lib], [T('l2b'), p4], [T('l2b', '就能用'), lib], [T('l4', '全部功能'), sizeL], [T('l4', '九百'), size], [T('l7'), sql], [T('l7', '程序自己'), [app, lib]], [T('l7b', '编译'), opBox], [T('l6'), fileN], [T('l9'), mem], [T('l10'), lib]], Tend('l10'));
  // 补音效（check.js 报的长空档）
  sfx('pop', T('l1', '经过它'), { g: 0.3 });
  sfx('tick', T('l1b', '更细'), { g: 0.3 });
  sfx('tick', T('l2', '省掉'), { g: 0.35 });
  sfx('pop', T('l2b', '磁盘'), { g: 0.3 });
  sfx('pop', T('l7', 'S Q L'), { g: 0.3 });
  stay(cam, s, c0, 1);
});
