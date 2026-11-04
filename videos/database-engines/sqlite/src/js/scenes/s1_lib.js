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
  [valves[1], valves[2]].forEach((v, i) => set(v, T('h3', '关') + i * 0.15, { backgroundColor: K.ink })); set(valves[3], T('h3', '关') + 0.4, { borderColor: K.teal });
  vl.forEach((e, i) => show(e, T('h3', '关') + i * 0.15, { y: 6 })); sfx('tick', T('h3', '关'), { g: 0.5 });
  const top = [who, whoL, ...facts, shipL, pipe, crack, ...valves, ...vl];

  // ── h4–h8：船上装好的 Informix 服务器；服务器一停就弹窗；为什么不能直接从磁盘上读；同事那句话 ──
  const Y = 780;
  const app = box('应用程序', 120, Y - 20, 380, 150, { fs: 40 }); app.dataset.beat = 'fill';   // 后面会清空文字、名字改由叠在上面的 appL 显示：选中用浅青底
  const srv = box('Informix<br>数据库服务器', 640, Y - 30, 500, 170, { fs: 40 });
  const disk = h('div', 'abs', W); px(disk, 1300, Y - 25, 330, 212); for (let i = 2; i >= 0; i--) { const r = h('div', 'abs pg', disk); px(r, i * 12, i * 12, 290, 130); }
  const diskL = tx(disk, '管道与阀门的数据', 0, 158, { fs: 30, color: '#444444' });
  const a1 = line(ov, [[500, Y + 55], [638, Y + 55]]), a2 = line(ov, [[1140, Y + 55], [1298, Y + 55]]);
  wipe(app, T('h4') - 0.1, { dir: 'l', d: 0.4 }); slam(srv, T('h4', 'Informix'), { from: 1.15 }); arrowIn(a1, T('h4', 'Informix') + 0.2, 0.4); arrowIn(a2, T('h4', '服务器') + 0.1, 0.4); show(disk, T('h4', '服务器') + 0.2, { x: -12, y: 0 }); disk.dataset.beat = 'fill';   // 叠放的几页：浅青底，不在缝里露出深青
  sfx('thud', T('h4', 'Informix'), { g: 0.4 });
  keyed(title).at(T('h4') - 0.3, { html: '数据在船上的 Informix 服务器里' });
  top.forEach((e) => gone(e, T('h4') - 0.3, 0.3));   // 镜头下移时一起收走
  const tStop = T('h5', '一停');
  set(srv, tStop, { backgroundColor: '#555555', color: '#ffffff' }); sfx('error', tStop + 0.1, { g: 0.5 });   // 服务器停了：深灰底白字
  // 连不上：程序到服务器的那条线从中间断开，两截变红、各自往下耷拉（WaterRun 看 r5b：「连不上服务器 线条应该断了」）
  const a1L = line(ov, [[500, Y + 55], [567, Y + 55]], { arrow: false, color: 'red', w: 3 }), a1R = line(ov, [[571, Y + 55], [638, Y + 55]], { arrow: false, color: 'red', w: 3 });
  [a1L, a1R].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  const tCut = tStop + 0.05;   // 服务器一停，线当场断开（WaterRun 看 r6：「断开的动画略慢」）
  tl.fromTo(a1, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01, immediateRender: false }, tCut);
  [[a1L, '500 ' + (Y + 55), 16], [a1R, '638 ' + (Y + 55), -16]].forEach(([e, o, r]) => { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, tCut);
    tl.fromTo(e, { rotation: 0, svgOrigin: o }, { rotation: r, svgOrigin: o, duration: 0.35, ease: 'power2.out', immediateRender: false }, tCut + 0.02); });
  sfx('thud', tCut, { g: 0.35, p: 0.4 });
  const dlg = h('div', 'abs', W, '<div class="dlgT">Error</div><div class="dlgB">Can’t connect to database server</div><div class="dlgC">连不上数据库服务器</div>'); px(dlg, 600, 588, 580, 146); dlg.dataset.name = '弹窗';
  css(dlg, { border: `2px solid ${K.ink}`, background: '#fff', fontSize: '28px' });
  set(dlg, 0, { autoAlpha: 0 }); slam(dlg, T('h5', '弹出'), { from: 1.25 });
  tl.fromTo(dlg, { x: 0 }, { x: 10, duration: 0.05, yoyo: true, repeat: 5, ease: 'none', immediateRender: false }, T('h5', '数据库') + 0.1);
  keyed(title).at(T('h6') - 0.2, { html: '为什么非要一个服务器？' });
  // 为什么不能直接从磁盘上读：一条虚线从程序直通磁盘
  const dir = line(ov, [[300, Y + 132], [300, Y + 222], [1590, Y + 222], [1590, Y + 136]], { dashed: '9 7' });   // 从文件名的右边进去，不穿过「管道与阀门的数据」
  const qm = tx(W, '？', 830, Y + 154, { fs: 56, color: K.teal });   // 问号最后停在虚线上方，不被线穿过
  arrowIn(dir, T('h6b', '磁盘') - 0.2, 0.8); sfx('whoosh', T('h6b', '磁盘') - 0.2, { g: 0.3 });
  set(qm, 0, { autoAlpha: 0 }); tl.fromTo(qm, { autoAlpha: 0, x: 400, y: -200, scale: 1.6 }, { autoAlpha: 1, x: 400, y: -200, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, T('h6', '为什么') - 0.05);
  tl.fromTo(qm, { x: 400, y: -200 }, { x: 0, y: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('h6b', '直接') - 0.2); sfx('pop', T('h6', '为什么'), { g: 0.35 });
  // 「找了一圈」：一个放大镜圈沿着虚线走到磁盘、再走回来；「没有」：虚线闪红
  const lens = h('div', 'abs', W); px(lens, 284, Y + 206, 32, 32); css(lens, { border: `4px solid ${K.teal}`, borderRadius: '50%', boxSizing: 'border-box', background: '#fff' }); set(lens, 0, { autoAlpha: 0 });
  tl.fromTo(lens, { autoAlpha: 1, x: 0 }, { x: 1290, duration: 1.1, ease: 'power1.inOut', immediateRender: false }, T('h7', '找了') - 0.1);
  tl.fromTo(lens, { x: 1290 }, { x: 0, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, T('h7', '找了') + 1.05);
  tl.fromTo(lens, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, T('h7', '找了') + 1.95); sfx('whoosh', T('h7', '找了'), { g: 0.25 });
  tl.fromTo(dir, { stroke: '#000000' }, { stroke: K.red, duration: 0.15, immediateRender: false }, T('h7', '没有') - 0.05); tl.fromTo(dir, { stroke: K.red }, { stroke: '#000000', duration: 0.4, immediateRender: false }, T('h7', '没有') + 0.8);
  // 连不上：服务器念完就压暗；问「为什么不能直接从磁盘上读」时再淡一层（绕开它）
  dim(srv, Tend('h5') + 0.3, 0.45);
  tl.fromTo(srv, { opacity: 0.45 }, { opacity: 0.15, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, T('h6b', '直接') - 0.1);
  const none = tx(W, '当时没有这样的 SQL 数据库', 900, Y + 232, { fs: 30, color: K.dim }); show(none, T('h7', '没有') - 0.1, { y: 6 });
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
  goneFrom(srv, tBuild - 0.3, 0.15); [a1L, a1R, a2, qm, none].forEach((e) => gone(e, tBuild - 0.3, 0.3)); gone(quote, tBuild - 0.3, 0.3);
  tl.fromTo(app, { width: 380 }, { width: 980, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tBuild - 0.1);
  keyed(app).at(tBuild - 0.1, { html: '' });
  const appL = tx(W, '应用程序', 146, Y - 10, { fs: 34 }); set(appL, 0, { autoAlpha: 0 }); set(appL, tBuild + 0.3, { autoAlpha: 1 });
  const lib = box('SQLite', 640, Y + 16, 400, 84, { fill: K.wheat, color: K.teal, fs: 42 }); lib.dataset.name = 'SQLite 库';
  slam(lib, tBuild + 0.2, { from: 1.3 }); sfx('thud', tBuild + 0.2, { g: 0.5 });
  const solid = line(ov, [[1100, Y + 55], [1298, Y + 55]]); arrowIn(solid, tBuild + 0.6, 0.4);
  tl.fromTo(dir, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, tBuild + 0.5);
  keyed(diskL).at(tBuild + 0.6, { html: 'main.db：一个文件' });
  // h10b、h10c：起初是 Tcl 的一个扩展；主要的测试仍用 Tcl 写
  const tcl = btn(W, 'Tcl 扩展', 640, Y + 144, 28); set(tcl, 0, { autoAlpha: 0 }); slam(tcl, T('h10b', 'T C L'), { from: 1.2 }); sfx('pop', T('h10b', 'T C L'), { g: 0.4 });
  const test = btn(W, '主要的测试：Tcl', 810, Y + 144, 28); set(test, 0, { autoAlpha: 0 }); slam(test, T('h10c', '测试'), { from: 1.2 }); sfx('pop', T('h10c', '测试'), { g: 0.4, p: 0.3 });

  const tclN = tx(W, 'Tcl：Tool Command Language，一种动态编程语言', 640, Y + 200, { fs: 26, color: K.dim }); tclN.dataset.nohl = ''; show(tclN, T('h10b', 'T C L') + 0.3, { y: 6 });   // 注释不铺底
  gone(tclN, T('l0') - 0.2, 0.3);
  // h11–h12：版本表（Release History）
  gone(memo, T('h11') - 0.3, 0.3);
  // 版本：一条时间轴 2000 → 2026，一个深青点沿着它走——h10b 停在 2000（起初），「直到今天」滑到 2026，再按 1.0、3.0、3.54.1 一站一站停，每站弹出版本
  const yr = (y) => 1120 + (y - 2000) * (680 / 26), AY = 600;
  const axis = line(ov, [[1120, AY], [1810, AY]], { w: 2, arrow: false });
  const yrs = [[2000, '2000'], [2004, '2004'], [2026, '2026']].map(([y, s]) => { const e = tx(W, s, yr(y) - 26, AY + 10, { fs: 22, mono: true, color: K.dim }); set(e, 0, { autoAlpha: 0 }); return e; });
  const dot = h('div', 'abs', W); px(dot, yr(2000) - 11, AY - 11, 22, 22); css(dot, { background: K.teal, borderRadius: '50%' }); set(dot, 0, { autoAlpha: 0 });
  const tag = (html, x, y, right) => { const e = tx(W, html, x, y, { fs: 24, css: { background: '#fff', border: `1.5px solid ${K.ink}`, padding: '2px 10px' } }); if (right) { e.style.left = 'auto'; e.style.right = (1920 - x) + 'px'; } set(e, 0, { autoAlpha: 0 }); return e; };
  const v1 = tag('<b>1.0</b> · 2000-08-17', 1100, AY - 66), v3 = tag('<b>3.0</b> · 2004-06-18 · 今天的文件格式', 1200, AY + 44), v354 = tag('<b>3.54.1</b> · 2026-10-16 · 本片用的版本', 1820, AY - 66, true);
  const tA = T('h10b', 'T C L') + 0.2;
  arrowIn(axis, tA - 0.3, 0.5); yrs.forEach((e, i) => show(e, tA - 0.1 + i * 0.08, { y: 6, d: 0.3 })); show(dot, tA + 0.2, { y: 0, s: 0.3, d: 0.3 });
  const hop = (t, from, to, d = 0.9) => { tl.fromTo(dot, { x: yr(from) - yr(2000) }, { x: yr(to) - yr(2000), duration: d, ease: 'power2.inOut', immediateRender: false }, t); sfx('whoosh', t, { g: 0.2 }); };
  hop(T('h10c', '今天') - 0.15, 2000, 2026, 1.2); hop(T('h11') - 0.1, 2026, 2000.6); hop(T('h11b') - 0.1, 2000.6, 2004.5, 0.6); hop(T('h12') - 0.1, 2004.5, 2026, 1.0);
  slam(v1, T('h11', '1.0'), { from: 1.2 }); slam(v3, T('h11b', '3.0'), { from: 1.2 }); slam(v354, T('h12', '3.54.1'), { from: 1.2 });
  sfx('tick', T('h11', '1.0'), { g: 0.4 }); sfx('tick', T('h11b', '3.0'), { g: 0.4 }); sfx('tick', T('h12', '3.54.1'), { g: 0.4 });
  keyed(title).at(T('h11') - 0.3, { html: '2000 年 1.0，本片用 3.54.1' });

  // ── l0–l4：这正是他想要的；不用安装配置；库很小 ──
  const tW = T('l0') - 0.2;
  [tcl, test, axis, ...yrs, dot, v1, v3, v354].forEach((e) => gone(e, tW, 0.3));
  const want = tx(W, '他想要的：不要服务器，直接读磁盘', 120, Y - 76, { fs: 34, color: K.teal });
  show(want, T('l0'), { x: 10, y: 0 }); sfx('pop', T('l0'), { g: 0.3 });
  keyed(title).at(tW, { html: '没有服务进程：好处' });
  // 直接读磁盘：库里取一页到文件、再带回来（和开场的取页一样）
  const pgTok = () => { const e = h('div', 'abs', W); px(e, 1104, Y + 36, 30, 38); css(e, { background: K.wheat, border: `2px solid ${K.teal}`, boxSizing: 'border-box', opacity: 0, visibility: 'hidden' }); set(e, 0, { autoAlpha: 0 }); return e; };
  const trip = (e, t, dx = 186, d = 0.45) => { tl.fromTo(e, { autoAlpha: 1, x: 0 }, { x: dx, duration: d, ease: 'power1.inOut', immediateRender: false }, t); tl.fromTo(e, { x: dx }, { x: 0, duration: d, ease: 'power1.inOut', immediateRender: false }, t + d + 0.1); tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15, immediateRender: false }, t + 2 * d + 0.1); sfx('tick', t + d, { g: 0.3, p: 0.3 }); };
  trip(pgTok(), T('l0', '直接读磁盘'));
  // l1：不用安装、配置、管理——念到哪个出哪块，随即被一道红线划掉
  const chips = [['安装', 140], ['配置', 300], ['管理', 460]].map(([t, x]) => { const c = btn(W, t, x, Y + 150, 30); const k = h('div', 'abs', W); px(k, x - 6, Y + 172, 104, 4); css(k, { background: K.red, transformOrigin: '0 50%' }); set(k, 0, { autoAlpha: 0 }); return [c, k]; });
  chips.forEach(([c, k], i) => { const t = T('l1', ['安装', '配置', '管理'][i]); set(c, 0, { autoAlpha: 0 }); show(c, t - 0.1, { y: 8, d: 0.3 });
    tl.fromTo(k, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power2.out', immediateRender: false }, t + 0.25); sfx('tick', t + 0.25, { g: 0.3, p: 0.1 * i }); });
  // l1b：能读写磁盘的程序就能用——再取一页，库那一块跟着跳一下
  trip(pgTok(), T('l1b', '读写') - 0.05);
  tl.fromTo(lib, { scale: 1 }, { scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, T('l1b', 'S Q Lite')); sfx('pop', T('l1b', 'S Q Lite'), { g: 0.3 });
  // l4：全部功能都打开，库也可以小于 900 KiB——一把量尺：库的大小那一条从 0 长出来，停在 900 KiB 那道线之前
  const ruler = h('div', 'abs', W); px(ruler, 660, Y + 214, 500, 2); css(ruler, { background: K.rule });
  const r0 = tx(W, '0', 652, Y + 220, { fs: 24, mono: true });
  const size = h('div', 'abs', W); px(size, 660, Y + 160, 400, 44); css(size, { background: K.wheat, border: `2px solid ${K.teal}`, boxSizing: 'border-box', transformOrigin: '0 50%', fontSize: '26px', paddingLeft: '12px', lineHeight: '40px', whiteSpace: 'nowrap', overflow: 'hidden' }); size.innerHTML = 'SQLite 库 · 全部功能打开';
  const lim = h('div', 'abs', W); px(lim, 1100, Y + 140, 0, 82); css(lim, { borderLeft: `3px dashed ${K.teal}` });
  const limL = tx(W, '900 KiB', 1060, Y + 220, { fs: 24, mono: true, color: K.teal });
  [ruler, r0].forEach((e) => show(e, T('l4', '全部功能') - 0.15, { y: 0, d: 0.3 }));
  tl.fromTo(size, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 1.6, ease: 'power2.out', immediateRender: true }, T('l4', '全部功能') - 0.1); sfx('whoosh', T('l4', '全部功能'), { g: 0.3 });
  [lim, limL].forEach((e) => { set(e, 0, { autoAlpha: 0 }); tl.fromTo(e, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, T('l4', '九百') - 0.1); }); sfx('tick', T('l4', '九百'), { g: 0.4 });

  // ── l6–l10：SQLite 的全部数据，都在那一个文件里；从这个文件看起 ──
  const tF = T('l6') - 0.2;
  gone(want, tF, 0.3);
  tl.fromTo(disk, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: '50% 50%', immediateRender: false }, T('l6', '一个文件'));
  const fileN = tx(W, '所有的表和索引', 1300, Y + 200, { fs: 32, color: K.teal }); show(fileN, T('l6', '一个文件') + 0.1, { y: 6 });
  keyed(title).at(tF, { html: 'SQLite 的全部数据：一个文件' });
  // l10：只留那个文件，镜头推过去（其余的先收走，免得在画面边上被切掉一半）
  const tL = T('l10') - 0.15;
  [app, appL, lib, solid, ...chips.flat(), ruler, r0, size, lim, limL].forEach((e) => gone(e, tL, 0.3));

  // 镜头：来历 → 程序与服务器 → 版本 → 取舍 → 那个文件
  shots(cam, world, s, [
    [s.start, null, { rect: [110, 280, 860, 640], zmax: 1.5 }],
    [T('h2', '写软件') - 0.3, null, { rect: [110, 280, 1800, 590], d: 1.4 }],
    [T('h4') - 0.3, null, { rect: [110, 510, 1880, 1070] }],
    [T('h7', '找了') - 0.2, null, { rect: [110, 700, 1700, 1060], zmax: 1.3, d: 1.2 }],
    [T('h8') - 0.3, null, { rect: [110, 510, 1880, 1070], d: 1.2 }],
    [T('l0') - 0.2, null, { rect: [110, 690, 1650, 1050], zmax: 1.25 }],
    [T('l10'), null, { rect: [1250, 740, 1680, 1050], zmax: 1.45 }],
  ]);

  // 焦点框：「为什么非要一个服务器」框住服务器，「直接从磁盘上读」框住磁盘上的数据，「都在那一个文件里」框住那个文件
  focus(W, [[T('h6', '服务器'), srv, Tend('h6')], [T('h6b', '磁盘'), disk, Tend('h6b') + 0.3], [T('l6', '一个文件'), disk, Tend('l6')]], Tend('l10'));
});
