// 01 自己写一个（第 12 稿：镜头先停在作者，管道出现时横移过去；Tcl 图注写全称和类型）：上段是来历——作者、军舰上的软件（管道破了，关哪几个阀门）；镜头下移到「应用程序 → Informix 服务器 → 磁盘上的数据」：
// 服务器一停就弹窗、「为什么不能直接从磁盘上读」的虚线、同事那句话、自己写了（服务器退场，SQLite 装进程序里）、Tcl、版本表；
// 再讲取舍：这正是他想要的（不要服务器，直接读磁盘）、不用安装配置、库小于 900 KiB；上方补一排服务进程讲它的好处；最后落到那一个文件。
// 事实：G11（Hipp 本人回忆）、G12、G13、G02、G14、G10、G07、G01。
scene('lib', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const box = (html, x, y, w, hh, o = {}) => { const e = h('div', 'abs', W, html); px(e, x, y, w, hh); css(e, { border: `2px solid ${o.color || K.ink}`, background: o.fill || '#fff', fontSize: (o.fs || 32) + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.3, boxSizing: 'border-box' }); return e; };
  const title = pageTitle(W, 'Richard Hipp：给一艘军舰写软件'); show(title, c0 + 0.1, { y: 8 });

  // ── h1：作者 ──
  const who = tx(W, 'Richard Hipp', 120, 290, { fs: 68, color: K.teal }); who.dataset.name = '作者';
  const whoL = tx(W, 'SQLite 的作者（主导开发者）', 124, 384, { fs: 30, color: K.dim });
  show(whoL, T('h1') + 0.05, { y: 6 }); wipe(who, T('h1', 'Richard') - 0.1, { dir: 'l', d: 0.5 }); sfx('pop', T('h1', 'Richard'), { g: 0.4 });

  // ── h2–h3：军舰上的软件：管道破了，关哪几个阀门 ──
  const facts = ['2000 年前后', '军舰　DDG-79 Oscar Austin', '软件　Automated Common Diagrams'].map((t, i) => tx(W, t, 124, 460 + i * 54, { fs: 32 }));
  [T('h2'), T('h2', '军舰'), T('h2', '写软件')].forEach((t, i) => show(facts[i], t - 0.1, { x: -10, y: 0 }));
  const shipL = tx(W, '管道破了：告诉船员关哪几个阀门、开哪几个', 880, 330, { fs: 32 });
  const pipe = h('div', 'abs', W); px(pipe, 880, 470, 900, 12); css(pipe, { background: K.ink });
  const VX = [1000, 1240, 1480, 1700];
  const valves = VX.map((x) => { const v = h('div', 'abs valve', W); px(v, x - 24, 452, 48, 48); css(v, { border: `2.5px solid ${K.ink}`, background: '#fff', transform: 'rotate(45deg)' }); return v; });
  const crack = h('div', 'abs', W); px(crack, 1356, 440, 14, 72); css(crack, { background: K.red, transform: 'skewX(-20deg)' });
  const vl = [['关', 1240], ['关', 1480], ['开', 1700]].map(([t, x]) => tx(W, t, x - 16, 524, { fs: 32, color: t === '关' ? K.ink : K.teal }));
  show(shipL, T('h3') - 0.1, { y: 8 }); wipe(pipe, T('h2', '写软件'), { dir: 'l', d: 0.6 }); valves.forEach((v, i) => show(v, T('h2', '写软件') + 0.4 + i * 0.1, { y: -10 }));
  slam(crack, T('h3', '管道破了'), { from: 1.6 }); sfx('error', T('h3', '管道破了'), { g: 0.4 });
  [valves[1], valves[2]].forEach((v, i) => set(v, T('h3', '关') + i * 0.15, { backgroundColor: K.ink })); set(valves[3], T('h3', '关') + 0.4, { backgroundColor: K.wheat });
  vl.forEach((e, i) => show(e, T('h3', '关') + i * 0.15, { y: 6 })); sfx('tick', T('h3', '关'), { g: 0.5 });
  const top = [who, whoL, ...facts, shipL, pipe, crack, ...valves, ...vl];

  // ── h4–h8：船上装好的 Informix 服务器；服务器一停就弹窗；为什么不能直接从磁盘上读；同事那句话 ──
  const Y = 800;
  const app = box('应用程序', 120, Y, 320, 110); app.dataset.beat = 'fill';   // 后面会清空文字、名字改由叠在上面的 appL 显示：选中用浅青底
  const srv = box('Informix<br>数据库服务器', 640, Y - 10, 440, 130);
  const disk = h('div', 'abs', W); px(disk, 1300, Y - 5, 270, 172); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', disk); px(r, i * 12, i * 12, 230, 100); }
  const diskL = tx(disk, '管道与阀门的数据', 0, 122, { fs: 28, color: '#444444' });
  const a1 = line(ov, [[440, Y + 55], [638, Y + 55]]), a2 = line(ov, [[1080, Y + 55], [1298, Y + 55]]);
  wipe(app, T('h4') - 0.1, { dir: 'l', d: 0.4 }); slam(srv, T('h4', 'Informix'), { from: 1.15 }); arrowIn(a1, T('h4', 'Informix') + 0.2, 0.4); arrowIn(a2, T('h4', '服务器') + 0.1, 0.4); show(disk, T('h4', '服务器') + 0.2, { x: -12, y: 0 }); disk.dataset.beat = 'fill';   // 叠放的几页：浅青底，不在缝里露出深青
  sfx('thud', T('h4', 'Informix'), { g: 0.4 });
  keyed(title).at(T('h4') - 0.3, { html: '数据在船上的 Informix 服务器里' });
  top.forEach((e) => gone(e, T('h4') - 0.3, 0.3));   // 镜头下移时一起收走
  const tStop = T('h5', '一停');
  set(srv, tStop, { backgroundColor: '#555555', color: '#ffffff' }); sfx('error', tStop + 0.5, { g: 0.5 });   // 服务器停了：深灰底白字
  const dlg = h('div', 'abs', W, '<div class="dlgT">Error</div><div class="dlgB">Can’t connect to database server</div><div class="dlgC">连不上数据库服务器</div>'); px(dlg, 600, 616, 580, 146); dlg.dataset.name = '弹窗';
  css(dlg, { border: `2px solid ${K.ink}`, background: '#fff', fontSize: '28px' });
  set(dlg, 0, { autoAlpha: 0 }); slam(dlg, T('h5', '弹出'), { from: 1.25 });
  keyed(title).at(T('h6') - 0.2, { html: '为什么非要一个服务器？' });
  // 为什么不能直接从磁盘上读：一条虚线从程序直通磁盘
  const dir = line(ov, [[280, Y + 112], [280, Y + 200], [1545, Y + 200], [1545, Y + 124]], { dashed: '9 7' });   // 从文件名的右边进去，不穿过「管道与阀门的数据」
  const qm = tx(W, '？', 830, Y + 126, { fs: 48, color: K.teal });   // 问号放在虚线上方，不被线穿过
  arrowIn(dir, T('h6b', '磁盘') - 0.2, 0.8); show(qm, T('h6b', '直接'), { y: 8 }); sfx('whoosh', T('h6b', '磁盘') - 0.2, { g: 0.3 });
  dim(srv, T('h6', '服务器'), 0.45);
  const none = tx(W, '当时没有这样的 SQL 数据库', 900, Y + 214, { fs: 30, color: K.dim }); show(none, T('h7', '没有') - 0.1, { y: 6 });
  gone(dlg, T('h7') - 0.1, 0.3);
  // h8：同事那句话（访谈原话与中文）
  const quote = h('div', 'abs', W, '“Richard, why don’t you just write one?”<br><span style="font-size:28px;color:#555">那你自己写一个</span>'); px(quote, 1180, 600, 680);
  css(quote, { fontSize: '32px', fontStyle: 'italic', borderLeft: `6px solid ${K.teal}`, paddingLeft: '20px', lineHeight: 1.4, whiteSpace: 'normal' });
  set(quote, 0, { autoAlpha: 0 }); wipe(quote, T('h8') - 0.1, { dir: 'l', d: 0.5 }); sfx('pop', T('h8'), { g: 0.4 });

  // h9–h10：他回忆，那年政府合同停了几个月，就真的自己写了：服务器退场，SQLite 装进程序里，虚线变实线
  const memo = h('div', 'abs', W, '他回忆：<b>2000 年</b>，政府合同停了几个月'); px(memo, 600, 640); css(memo, { fontSize: '32px', fontStyle: 'italic' });
  set(memo, 0, { autoAlpha: 0 }); show(memo, T('h9', '政府') - 0.1, { y: 8 });
  keyed(title).at(T('h9') - 0.2, { html: '他就真的自己写了' });
  const tBuild = T('h10', '自己写了');
  goneFrom(srv, tBuild - 0.3, 0.45); [a1, a2, qm, none].forEach((e) => gone(e, tBuild - 0.3, 0.3)); gone(quote, tBuild - 0.3, 0.3);
  tl.fromTo(app, { width: 320 }, { width: 920, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tBuild - 0.1);
  keyed(app).at(tBuild - 0.1, { html: '' });
  const appL = tx(W, '应用程序', 146, Y + 10, { fs: 30 }); set(appL, 0, { autoAlpha: 0 }); set(appL, tBuild + 0.3, { autoAlpha: 1 });
  const lib = box('SQLite', 620, Y + 26, 380, 70, { fill: K.wheat, color: K.teal, fs: 36 }); lib.dataset.name = 'SQLite 库';
  slam(lib, tBuild + 0.2, { from: 1.3 }); sfx('thud', tBuild + 0.2, { g: 0.5 });
  const solid = line(ov, [[1040, Y + 55], [1298, Y + 55]]); arrowIn(solid, tBuild + 0.6, 0.4);
  tl.fromTo(dir, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, tBuild + 0.5);
  keyed(diskL).at(tBuild + 0.6, { html: 'main.db：一个文件' });
  // h10b、h10c：起初是 Tcl 的一个扩展；主要的测试仍用 Tcl 写
  const tcl = btn(W, 'Tcl 扩展', 620, Y + 128, 28); set(tcl, 0, { autoAlpha: 0 }); slam(tcl, T('h10b', 'T C L'), { from: 1.2 }); sfx('pop', T('h10b', 'T C L'), { g: 0.4 });
  const test = btn(W, '主要的测试：Tcl', 790, Y + 128, 28); set(test, 0, { autoAlpha: 0 }); slam(test, T('h10c', '测试'), { from: 1.2 }); sfx('pop', T('h10c', '测试'), { g: 0.4, p: 0.3 });

  const tclN = tx(W, 'Tcl：Tool Command Language，一种动态编程语言', 620, Y + 186, { fs: 26, color: K.dim }); show(tclN, T('h10b', 'T C L') + 0.3, { y: 6 });
  gone(tclN, T('l0') - 0.2, 0.3);
  // h11–h12：版本表（Release History）
  gone(memo, T('h11') - 0.3, 0.3);
  const rel = docTable(W, [['版本', 170], ['发布', 230], ['', 330]], [['1.0', '2000-08-17', ''], ['3.0.0', '2004-06-18', '今天的文件格式'], ['3.54.1', '2026-10-16', '本片用的版本']], 1110, 560, { fs: 30 });
  rel.t.dataset.name = '版本表';
  show(rel.hr, T('h11') - 0.1, { y: 6 }); show(rel.rs[0], T('h11', '1.0'), { x: -10, y: 0 }); show(rel.rs[1], T('h11b', '3.0'), { x: -10, y: 0 }); show(rel.rs[2], T('h12', '3.54.1'), { x: -10, y: 0 });
  sfx('tick', T('h11', '1.0'), { g: 0.4 }); sfx('tick', T('h11b', '3.0'), { g: 0.4 }); sfx('tick', T('h12', '3.54.1'), { g: 0.4 });
  keyed(title).at(T('h11') - 0.3, { html: '2000 年 1.0，本片用 3.54.1' });

  // ── l0–l4：这正是他想要的；不用安装配置；库很小 ──
  const tW = T('l0') - 0.2;
  [rel.t, tcl, test].forEach((e) => gone(e, tW, 0.3));
  const want = tx(W, '他想要的：不要服务器，直接读磁盘', 120, Y - 56, { fs: 32, color: K.teal });
  show(want, T('l0'), { x: 10, y: 0 }); sfx('pop', T('l0'), { g: 0.3 });
  keyed(title).at(tW, { html: '没有服务进程：好处' });
  const p3 = tx(W, '・不用安装、配置、管理', 140, Y + 136, { fs: 30 }), p4 = tx(W, '・能读写磁盘的程序，就能用', 140, Y + 180, { fs: 30 });
  show(p3, T('l1', '安装'), { x: 10, y: 0 }); show(p4, T('l1b', '磁盘'), { x: 10, y: 0 }); sfx('tick', T('l1', '安装'), { g: 0.35 }); sfx('pop', T('l1b', '磁盘'), { g: 0.3 });
  const size = h('div', 'abs', W); px(size, 640, Y + 140, 380, 40); css(size, { background: K.wheat, border: `2px solid ${K.ink}`, transformOrigin: '0 50%' });
  const sizeL = tx(W, '全部功能都打开，也可以 < 900 KiB', 640, Y + 188, { fs: 28 });
  tl.fromTo(size, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.6, ease: 'power2.out', immediateRender: true }, T('l4', '九百'));
  show(sizeL, T('l4', '全部功能') - 0.1, { y: 6 }); sfx('tick', T('l4', '九百'), { g: 0.4 });

  // ── l6–l10：SQLite 的全部数据，都在那一个文件里；从这个文件看起 ──
  const tF = T('l6') - 0.2;
  gone(want, tF, 0.3);
  tl.fromTo(disk, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: '50% 50%', immediateRender: false }, T('l6', '一个文件'));
  const fileN = tx(W, '所有的表和索引', 1300, Y + 180, { fs: 30, color: K.teal }); show(fileN, T('l6', '一个文件') + 0.1, { y: 6 });
  keyed(title).at(tF, { html: 'SQLite 的全部数据：一个文件' });
  // l10：只留那个文件，镜头推过去（其余的先收走，免得在画面边上被切掉一半）
  const tL = T('l10') - 0.15;
  [app, appL, lib, solid, p3, p4, size, sizeL].forEach((e) => gone(e, tL, 0.3));

  // 镜头：来历 → 程序与服务器 → 版本 → 取舍 → 那个文件
  shots(cam, world, s, [
    [s.start, null, { rect: [110, 280, 860, 640], zmax: 1.5 }],
    [T('h2', '写软件') - 0.3, null, { rect: [110, 280, 1800, 590], d: 1.4 }],
    [T('h4') - 0.3, null, { rect: [110, 600, 1880, 1040] }],
    [T('l0') - 0.2, null, { rect: [110, 730, 1580, 1030], zmax: 1.25 }],
    [T('l10'), null, { rect: [1080, 760, 1620, 1020], zmax: 1.45 }],
  ]);

  // 「当前在讲谁」
  beats([[T('h1', 'Richard'), who], [T('h2'), facts[0]], [T('h2', '军舰'), facts[1]], [T('h2', '写软件'), facts[2]], [T('h3'), shipL], [T('h3', '关'), vl], [T('h4', 'Informix'), srv], [T('h4', '服务器') + 0.2, disk], [T('h5', '弹出'), app], [T('h5', '连不上'), dlg], [T('h5', '数据库服务器'), srv], [T('h6'), app], [T('h6', '非要'), srv], [T('h6b', '磁盘'), disk], [T('h7', '找了一圈'), app], [T('h7', '没有'), qm], [T('h7', 'S Q L'), none], [T('h8'), quote], [T('h9'), memo], [T('h10'), memo], [T('h10', '自己写了') + 0.6, lib], [T('h10b', 'T C L'), [tcl, tclN]], [T('h10c'), app], [T('h10c', '测试'), test],
    [T('h11'), rel.rs[0]], [T('h11b'), rel.rs[1]], [T('h11b', '今天'), rel.rs[1].children[2]], [T('h12'), rel.rs[2]], [T('l0'), want], [T('l0', '直接读磁盘'), disk], [T('l1'), p3], [T('l1b'), p4], [T('l1b', 'S Q Lite'), lib], [T('l4', '全部功能'), sizeL], [T('l4', '九百'), size],
    [T('l6'), lib], [T('l6', '一个文件'), fileN], [T('l10'), disk], [T('h8') + 1.80, [quote, app], 1], [T('h9') + 2.98, [memo, app], 1], [T('h11b') + 2.65, rel.t, 1], [T('h10') + 3.64, disk, 1], [T('h12') + 0.69, rel.t, 1], [T('h12') + 2.42, [app, lib, disk], 1], [T('h10b') + 1.70, [app, tcl, tclN], 1], [T('h10c') + 0.8, [disk, lib], 1], [T('h10c') + 3.3, [test, tclN, app], 1]], Tend('l10'));
});
