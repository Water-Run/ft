// 02 四种模式，逐个看：缺省、网安、逆向、写作。每种模式一扇会话窗口（照 mode-* 截图），场与场之间整扇窗口立方体式转过去，
// 舞台底色随模式换色。窗口里的对话是真实界面的样子；讲到的功能在窗口前面用 3D 的物件或注解展开，讲完收回窗口。

// 一扇模式会话窗口：舞台底色、窗口、对话栏、输入框、底栏；进场从右边转进来，退场朝左转走
function modeScene(world, s, m, o) {
  const bg = stageBg(world, m);
  const wrap = h('div', 'abs', world); css(wrap, { inset: '0' });
  const app = makeApp(wrap, { mode: m, title: o.title, ws: o.ws, sessions: o.sessions, more: o.more });
  if (o.banner) app.banner = h('div', 'banner', app.body, o.banner);
  const col = column(app.body, { top: o.top != null ? o.top : 26 });
  const comp = composer(app.body, { busy: o.busy }); comp.send.classList.toggle('ready', !!o.busy);
  const foot = footbar(app.body, o.foot || {});
  cubeIn(wrap, s.start - 0.25);
  if (o.out !== false) cubeOut(wrap, s.end - 0.35);
  return { bg, wrap, app, col, comp, foot };
}
// 对话栏往上滚：显式起点
function scrollCol(col, t, from, to_, d = 0.6) { tl.fromTo(col, { y: from }, { y: to_, duration: d, ease: 'power2.inOut', immediateRender: false }, t); }
// 一串行依次出现（像流式输出：整行出现）
function streamIn(list, t0, gap, o = {}) { list.forEach((e, i) => { appear(e, t0 + i * gap); if (o.sfx !== false && i % 2 === 0) sfx('tick', t0 + i * gap, { g: 0.3 }); }); return t0 + list.length * gap; }

// ── 缺省 ──
scene('default', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const { app, col, comp } = modeScene(world, s, 'def', { title: '修复搜索结果消失', sessions: [['修复搜索结果消失', 'def', true], ['整理发布说明', 'def'], ['审计上传接口', 'sec']] });
  h('div', 'bubble', col, '搜索框连续提交时，结果有时会变成空的，帮我修一下');
  const L = [
    step(col, 'think', '思考', '先看搜索状态是怎么保存结果的。'),
    h('div', 'say', col, '先确认搜索状态的写法，再用测试复现。'),
    step(col, 'tasks', '更新任务清单', '0/3 已完成 · 定位保存搜索结果的代码 新增 3'),
    step(col, 'search', '搜索文件内容', 'results ='),
    step(col, 'doc', '读取', '<u>src\\search.mjs</u>'),
    step(col, 'think', '思考', '两次请求并发，先发出的慢请求后返回，会覆盖新结果。'),
    h('div', 'say', col, '原因找到了：先提交的请求返回得更慢，会把后一次的结果覆盖掉。'),
    step(col, 'edit', '编辑', '<u>src\\search.mjs</u> 1KB <span style="color:#15803D">+3</span> <span style="color:#DC2626">-1</span>'),
    step(col, 'tasks', '更新任务清单', '3/3 已完成 更新 3'),
  ];
  const fin = h('div', '', col, `<h3>修复完成</h3><div class="tbl" style="margin-top:10px">${[['修改文件', '<code>src/search.mjs</code>'], ['修复方式', '每次提交分配递增序号，只保留最后一次的响应'], ['回归测试', '<code>tests/search.test.mjs</code> 覆盖「慢请求后返回」的场景']].map(([a, b]) => `<div class="tr" style="grid-template-columns:200px 1fr"><span class="th">${a}</span><span>${b}</span></div>`).join('')}</div>`);
  // 开场时前两行已经在，其余跟着 d1b 的「开发、调试」流式出来
  L.slice(0, 2).forEach((e) => appear(e, s.start - 0.3));
  streamIn(L.slice(2), T('d1b', '开发') - 0.3, 0.42);
  // d2：对话往上滚，结果表出来
  set(fin, s.start, { autoAlpha: 0 });
  scrollCol(col, T('d2') - 0.3, 0, -300, 0.7);
  fadeIn(fin, T('d2') + 0.2, { y: 20 });
  // d1：胶囊上贴「默认」；注解说明新会话默认就是它
  const pbx = box(app.pill, world);
  makeRoom(T('d1') - 0.4, col, comp.c);
  const def = note(world, 1300, 170, '<div class="k">默认</div>新会话的模式默认就是缺省，发第一条消息前可以换', 520); css(def, { '--mc': MC.def });
  fadeIn(def, T('d1', '默认') - 0.1, { x: -16 }); fadeOut(def, T('d2') - 0.3, { d: 0.3 }); sfx('pop', T('d1', '默认'));
  ringOn(app.el, app.pill, T('d1') - 0.1, T('d1b') + 0.4, { pad: 6 });
  // d2：能做的事从窗口里浮出来，d2b「选这个就行」时收进胶囊
  const jobs = ['写代码', '修 bug', '查资料', '处理文件'];
  const pos = [[1330, 240], [1520, 340], [1340, 440], [1530, 540]];
  const pb = box(app.pill, world);
  const chips = jobs.map((j, i) => {
    const c = h('div', 'card3d', world); px(c, pos[i][0], pos[i][1]);
    css(c, { padding: '14px 26px', fontSize: '30px', fontWeight: '600', borderRadius: '16px', whiteSpace: 'nowrap', '--mc': MC.def });
    c.innerHTML = `<span style="color:var(--mc);margin-right:10px">${icon('check')}</span>${j}`;
    tl.fromTo(c, { autoAlpha: 0, z: -400, rotationY: -30, rotationX: 10, transformPerspective: P3 }, { autoAlpha: 1, z: 0, rotationY: -12, rotationX: 4, duration: 0.6, ease: 'power3.out', immediateRender: true }, T('d2', '啥都') - 0.1 + i * 0.12);
    return c;
  });
  sfx('whoosh', T('d2', '啥都'), { g: 0.4 });
  const tIn = T('d2b', '选这个') - 0.2;
  chips.forEach((c, i) => {
    const b = box(c, world);
    tl.fromTo(c, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: pb.cx - b.cx, y: pb.cy - b.cy, scale: 0.2, autoAlpha: 0, duration: 0.55, ease: 'power3.in', immediateRender: false }, tIn + i * 0.06);
  });
  fromTo(app.pill, tIn + 0.5, { scale: 1 }, { scale: 1.15, duration: 0.2, ease: 'power2.out', immediateRender: false });
  fromTo(app.pill, tIn + 0.7, { scale: 1.15 }, { scale: 1, duration: 0.3, ease: 'power2.inOut', immediateRender: false }); sfx('pop', tIn + 0.55);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.6, s.end - 0.4, -1)]);
});

// ── 网安 ──
scene('security', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const { app, col, bg } = modeScene(world, s, 'sec', {
    title: '审计上传接口', sessions: [['审计上传接口', 'sec', true]], more: ['router-fw', '雾港'], top: 100,
    banner: `<span class="w">${icon('warn')}</span><b style="font-weight:500">独立代理未开启</b><span style="color:var(--mu)">当前网安对话未使用专用代理</span><span class="r">显示提醒 <span class="toggle on"><i></i></span></span>`,
    foot: { turns: '1 轮 3 步 · 199 tok/s', tok: '65.2K tok · 缓存命中 0%', cost: '¥0.14' },
  });
  css(app.banner, { position: 'absolute', left: '0', right: '0', top: '0', zIndex: 3 });
  const L = [
    step(col, 'think', '思考', '先按交战流程确认范围，再看上传路由。'),
    h('div', 'say', col, '范围确认为本地测试环境。先读取上传路由。'),
    step(col, 'search', '搜索文件内容', 'filename'),
    step(col, 'doc', '读取', '<u>server\\routes\\upload.js</u>'),
    step(col, 'think', '思考', 'filename 直接拼进 path.join，没有规范化校验'),
    step(col, 'edit', '写入', '<u>.security\\acme-upload\\case.json</u> 1KB'),
  ];
  const fd = h('div', '', col, '<h3>发现 F-0001 · 上传文件名路径穿越（高）</h3><ul style="margin-top:6px"><li><b>位置</b>：<code>server/routes/upload.js:6</code>，<code>filename</code> 未经规范化就拼入 <code>/srv/uploads</code></li><li><b>修复建议</b>：用 <code>path.basename()</code> 取文件名，并校验结果仍在上传目录内</li></ul>');
  L.slice(0, 2).forEach((e) => appear(e, s.start - 0.3));
  streamIn(L.slice(2), T('s1', '审计') - 0.2, 0.5);
  set(fd, s.start, { autoAlpha: 0 });

  // s2：七类现场手册，在窗口前排成一列 3D 的书，沿「目标梳理 → 验证 → 修复 → 报告」依次抽出
  const dim = h('div', 'scrim', world); css(dim, { background: 'rgba(6,7,10,.35)' });
  const shelf = h('div', 'abs', world); px(shelf, 250, 240, 1420, 520);
  const books = Array.from({ length: 7 }, (_, i) => {
    const b = h('div', 'card3d', shelf); px(b, 40 + i * 190, 60, 150, 300);
    css(b, { background: `linear-gradient(160deg, #ef4444, #991b1b)`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '26px 0', borderRadius: '14px' });
    b.innerHTML = `${icon('book', 'style="width:46px;height:46px"')}<span style="font:800 44px Inter;opacity:.9">${i + 1}</span><span style="font-size:22px;opacity:.85">现场手册</span>`;
    b.dataset.name = `现场手册 ${i + 1}`;
    return b;
  });
  const axis = h('div', 'abs', shelf); px(axis, 40, 420, 1330);
  css(axis, { display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '30px', borderTop: '3px solid rgba(255,255,255,.35)', paddingTop: '16px' });
  axis.innerHTML = ['目标梳理', '验证', '修复', '报告'].map((x) => `<span>${x}</span>`).join('<span style="opacity:.5">→</span>');
  const tS2 = T('s2') - 0.3;
  set(dim, s.start, { autoAlpha: 0 }); fadeIn(dim, tS2, { y: 0, d: 0.4 }); focusOn(app.el, tS2, 0.5);
  books.forEach((b, i) => tl.fromTo(b, { autoAlpha: 0, rotationY: 70, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: 28, z: 0, duration: 0.6, ease: 'power3.out', immediateRender: true }, tS2 + 0.1 + i * 0.07));
  sfx('whoosh', tS2 + 0.1, { g: 0.5 });
  set(axis, s.start, { autoAlpha: 0 }); wipe(axis, T('s2', '阶段') - 0.4, { dir: 'l', d: 0.8 });
  // 念到「阶段」时，按调查推进依次把书抽出来、转正
  books.forEach((b, i) => {
    const t = T('s2', '阶段') - 0.2 + i * 0.16;
    fromTo(b, t, { rotationY: 28, y: 0 }, { rotationY: 0, y: -34, duration: 0.35, ease: 'power2.out', immediateRender: false });
    if (i % 2 === 0) sfx('tick', t, { g: 0.4 });
  });
  const tS3 = T('s3') - 0.35;
  books.forEach((b, i) => fadeOut(b, tS3 + i * 0.03, { y: 30, d: 0.3 })); fadeOut(axis, tS3, { d: 0.3 });
  // s3：案件文件；目标、证据、发现三个计数跟着词点亮，「报告」时一页报告从案件里抽出来
  const cs = h('div', 'card3d', world); px(cs, 300, 250, 640, 430); css(cs, { padding: '30px 36px', '--mc': MC.sec });
  cs.innerHTML = `<div style="display:flex;gap:14px;align-items:center;color:var(--mc)">${icon('folder', 'style="width:40px;height:40px"')}<b style="font-size:34px;color:var(--ink)">案件 acme-upload</b></div>
    <div class="mono" style="margin-top:10px;font-size:22px;color:#5d626b">.security/acme-upload/case.json</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:30px">${[['目标', 1], ['证据', 2], ['发现', 1]].map(([k, v]) => `<div class="cnt" style="border:1px solid var(--line);border-radius:16px;padding:16px 18px"><div style="color:#5d626b;font-size:24px">${k}</div><div class="n" style="font:700 64px Inter;color:var(--mc)">0</div></div>`).join('')}</div>`;
  cs.dataset.name = '案件文件';
  rise3d(cs, tS3 + 0.1, { rx: 20, ry: 16, z: 500, d: 0.8 }); sfx('whoosh', tS3 + 0.1, { g: 0.5 });
  const cnts = cs.querySelectorAll('.cnt');
  [['目标', 1], ['证据', 2], ['发现', 1]].forEach(([k, v], i) => {
    const t = T('s3', k) - 0.05; countTo(cnts[i].querySelector('.n'), 0, v, t, 0.4);
    fromTo(cnts[i], t, { backgroundColor: 'rgba(220,38,38,0)' }, { backgroundColor: 'rgba(220,38,38,.08)', duration: 0.3 }); sfx('tick', t, { g: 0.6 });
  });
  const rp = h('div', 'card3d', world); px(rp, 1000, 210, 620, 520); css(rp, { padding: '30px 34px', fontSize: '24px', lineHeight: '1.6', '--mc': MC.sec });
  rp.innerHTML = `<div style="color:#5d626b;font-size:22px;letter-spacing:2px">报告</div><div style="font-size:30px;font-weight:700;margin:6px 0 14px">F-0001 上传文件名路径穿越（高）</div>
    <div><b>位置</b>　server/routes/upload.js:6</div><div><b>复现</b>　filename=../../app/config.json</div><div><b>影响</b>　可以覆盖应用配置或静态资源</div><div><b>修复</b>　path.basename() 并校验目录</div><div style="margin-top:14px;color:#5d626b;font-size:22px">证据 E-0001 · 已写入案件</div>`;
  rp.dataset.name = '报告';
  tl.fromTo(rp, { autoAlpha: 0, x: -420, rotationY: -40, z: -200, transformPerspective: P3 }, { autoAlpha: 1, x: 0, rotationY: -10, z: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, T('s3', '报告') - 0.25);
  sfx('pop', T('s3', '报告'));
  // 背后的对话里也写出这个发现（窗口回来时已在）
  appear(fd, T('s3', '报告'));
  scrollCol(col, T('s3', '报告'), 0, -150, 0.6);

  // s4–s5b：独立代理。案件与报告收走，换成一张 3D 流量图：DSHU → 代理 → 目标
  const tS4 = T('s4') - 0.35;
  sink3d(cs, tS4, { d: 0.5 }); sink3d(rp, tS4 + 0.05, { d: 0.5 });
  const flow = h('div', 'abs', world); px(flow, 140, 250, 1640, 520);
  const node = (x, label, sub, ic) => { const n = h('div', 'card3d', flow); px(n, x, 100, 360, 200); css(n, { padding: '26px 30px', '--mc': MC.sec }); n.innerHTML = `<div style="display:flex;gap:12px;align-items:center;font-size:32px;font-weight:700"><span style="color:var(--mc)">${icon(ic, 'style="width:36px;height:36px"')}</span>${label}</div><div style="color:#5d626b;margin-top:10px;font-size:24px">${sub}</div>`; n.dataset.name = label; return n; };
  const nA = node(0, 'DSHU', '网安会话', 'shield'), nP = node(640, '独立代理', '你指定的上游代理', 'globe'), nT = node(1280, '目标', '授权范围内的系统', 'term');
  const wire = h('div', 'abs', flow); px(wire, 360, 196, 920, 8); css(wire, { background: 'linear-gradient(90deg, rgba(220,38,38,.2), rgba(220,38,38,.8), rgba(220,38,38,.2))', borderRadius: '4px', transformOrigin: '0 50%' });
  const pkt = h('div', 'abs', flow); px(pkt, 380, 20); css(pkt, { padding: '8px 16px', borderRadius: '12px', background: '#fff', color: 'var(--ink)', fontSize: '22px', boxShadow: '0 10px 30px rgba(0,0,0,.45)', '--mc': MC.sec, whiteSpace: 'nowrap' });
  pkt.innerHTML = '请求 · 来源：本机';
  [nA, nP, nT].forEach((n, i) => rise3d(n, tS4 + 0.2 + i * 0.12, { rx: 24, z: 400, d: 0.7 }));
  fromTo(wire, tS4 + 0.6, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
  // 设置里的那个开关（真实界面的文字）挂在代理下面，念到「开」时拨开
  const sw = h('div', 'card3d', flow); px(sw, 560, 330, 520, 110); css(sw, { padding: '18px 24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '18px', '--mc': MC.sec });
  sw.innerHTML = '<div style="flex:1"><div>让网安流量经过这个代理</div><div style="color:#5d626b;font-size:22px">默认关闭 · 只影响网安模式</div></div>';
  const tg = toggleEl(sw); rise3d(sw, tS4 + 0.5, { rx: -20, z: 200, d: 0.6 });
  toggleOn(tg, T('s4', '开') - 0.05, MC.sec);
  // 一个请求从 DSHU 出发：经过代理时「来源」换成代理（s5 再套一层马甲）
  const tP = T('s4', '流量') - 0.2;
  set(pkt, s.start, { autoAlpha: 0 });
  fromTo(pkt, tP, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: 300, duration: 1.4, ease: 'power1.inOut' });
  fromTo(pkt, T('s5', '马甲') - 0.6, { x: 300 }, { x: 980, duration: 1.4, ease: 'power1.inOut', immediateRender: false });
  keyed(pkt).at(T('s5', '马甲') - 0.1, { html: '请求 · 来源：<b style="color:var(--mc)">代理</b>' });
  fromTo(nP, T('s5', '马甲') - 0.15, { scale: 1 }, { scale: 1.06, duration: 0.2, ease: 'power2.out', immediateRender: false });
  fromTo(nP, T('s5', '马甲') + 0.05, { scale: 1.06 }, { scale: 1, duration: 0.3, ease: 'power2.inOut', immediateRender: false });
  sfx('blip', T('s5', '马甲'));
  // s5b：实验功能；下面一条虚线绕过代理：还没覆盖的协议
  const exp = h('span', 'chip', nP, '实验功能'); css(exp, { position: 'absolute', right: '-20px', top: '-22px', background: '#fde68a', color: '#78350f', fontSize: '22px', fontWeight: '700', boxShadow: '0 8px 20px rgba(0,0,0,.3)' });
  slam(exp, T('s5b', '实验') - 0.05, { from: 1.6 }); sfx('pop', T('s5b', '实验'));
  const by = h('div', 'abs', flow); px(by, 360, 470, 920, 60);
  by.innerHTML = '<div style="position:absolute;left:0;right:0;top:30px;border-top:3px dashed rgba(255,255,255,.45)"></div><div style="position:absolute;left:50%;transform:translateX(-50%);top:-14px;color:#d6d9df;font-size:24px;white-space:nowrap">其他协议、入站隔离等还没覆盖，不走代理</div>';
  set(by, s.start, { autoAlpha: 0 }); wipe(by, T('s5b', '依赖') - 0.5, { dir: 'l', d: 0.6 });
  // s6：流量图收走；进入网安前的确认对话框（真实界面），按钮倒数
  const tS6 = T('s6') - 0.35;
  [nA, nP, nT, sw].forEach((n, i) => sink3d(n, tS6 + i * 0.04, { d: 0.45 })); fadeOut(wire, tS6, { d: 0.3 }); fadeOut(pkt, tS6, { d: 0.3 }); fadeOut(by, tS6, { d: 0.3 });
  const dl = dialog(world, 520, 110, 880, '进入网安模式前的确认');
  dl.body.innerHTML = `<div class="l1">网安模式会执行真实命令并访问目标系统。你对自己选择的目标和操作负责。</div>
    <div class="l2" style="color:#5d626b;margin-top:14px">只在已获得授权、范围明确的系统上使用。软件不会判断某个目标是否已获授权。</div>
    <div style="margin-top:26px;color:#5d626b">责任声明</div><div class="ta" style="margin-top:8px;border:2px solid #2563EB;border-radius:12px;height:96px;padding:12px 16px;color:#6b7079">我确认已获得相应操作授权，并了解当前保护未启用</div>
    <div style="display:flex;justify-content:flex-end;gap:14px;margin-top:26px"><span class="btn">取消</span><span class="btn grey cdb">阅读并确认（8 秒）</span></div>`;
  rise3d(dl.d, tS6 + 0.15, { rx: 18, z: 500, d: 0.8 }); sfx('whoosh', tS6 + 0.15, { g: 0.5 });
  const cdb = dl.body.querySelector('.cdb');
  const tC = T('s6', '责任') - 0.3;
  F((t) => { const n = Math.max(0, 8 - Math.floor(Math.max(0, t - tC))); const txt = n > 0 ? `阅读并确认（${n} 秒）` : '阅读并确认'; if (cdb.textContent !== txt) cdb.textContent = txt; });
  // s7：两句责任说明被圈出来
  ringOn(world, dl.body.querySelector('.l1'), T('s7', '确保') - 0.15, s.end - 0.6, { pad: 8, c: MC.sec });
  ringOn(world, dl.body.querySelector('.l2'), T('s7', '后果') - 0.2, s.end - 0.6, { pad: 8, c: MC.sec });
  sfx('tick', T('s7', '确保')); sfx('tick', T('s7', '后果'));
  fadeOut(dl.d, s.end - 0.6, { y: 20, d: 0.3 }); fadeOut(dim, s.end - 0.6, { d: 0.3 });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.6, s.end - 0.4, 1)]);
});

// ── 逆向 ──
scene('reverse', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const { app, col, comp } = modeScene(world, s, 'rev', { title: '解析固件头格式', ws: 'router-fw', sessions: [['解析固件头格式', 'rev', true]], more: ['acme-shop', '雾港'], foot: { turns: '1 轮 2 步 · 146 tok/s', tok: '43.8K tok · 缓存命中 0%', cost: '¥0.09' } });
  const L = [
    step(col, 'think', '思考', '先做样本初筛：哈希、魔数、熵和可打印字符串。'),
    h('div', 'say', col, '先做样本初筛，记录哈希与魔数。'),
    step(col, 'doc', '读取', '<u>samples\\router-fw.head.txt</u>'),
  ];
  const tb = h('div', '', col, `<h3>文件头布局（已用样本验证）</h3><div class="tbl" style="margin-top:8px">${[['偏移', '长度', '字段', '样本值', '依据'], ['<code>0x00</code>', '4', '魔数', '<code>DSHF</code>', '固定 ASCII'], ['<code>0x04</code>', '2', '格式版本', '<code>2</code>', '小端序'], ['<code>0x06</code>', '2', '头部长度', '<code>0x10</code>', '与正文起点一致'], ['<code>0x08</code>', '变长', '版本字符串', '<code>firmware-v2.3.1</code>', '以 <code>\\0</code> 结尾']].map((r, i) => `<div class="tr${i ? '' : ' th'}" style="grid-template-columns:130px 100px 170px 270px 1fr">${r.map((c) => `<span>${c}</span>`).join('')}</div>`).join('')}</div>`);
  L.forEach((e) => appear(e, s.start - 0.3));
  const rows = tb.querySelectorAll('.tr');
  set(tb, s.start, { autoAlpha: 0 }); appear(tb, T('r1b') - 0.2);
  rows.forEach((r, i) => fadeIn(r, T('r1b') - 0.2 + i * 0.22, { x: -14, y: 0, d: 0.3 }));
  // r1：内置的 REA 是一块 3D 的模块，从窗口前面立起来
  makeRoom(T('r1', 'REA') - 0.6, col, comp.c);
  const hub = h('div', 'slab', world); px(hub, 1290, 170, 520, 200); css(hub, { padding: '26px 30px', '--mc': MC.rev });
  hub.innerHTML = `<div style="display:flex;gap:14px;align-items:center"><span style="color:#4ade80">${icon('chip', 'style="width:44px;height:44px"')}</span><b style="font:700 40px Inter">REA 6.9.0</b></div><div style="color:#aab0bb;margin-top:12px;font-size:24px">内置 · 装好就有 · 255 个分析工具</div>`;
  hub.dataset.name = 'REA 模块';
  rise3d(hub, T('r1', 'REA') - 0.35, { rx: 30, ry: -20, z: 500, d: 0.8 }); sfx('thud', T('r1', 'REA'), { g: 0.6 });
  fromTo(hub, T('r1', 'REA') + 0.5, { rotationY: 0 }, { rotationY: -10, duration: 2, ease: 'sine.inOut', immediateRender: false });
  // r1b：能拆的四类东西，跟着词亮
  const kinds = ['程序', '二进制', '文件格式', '协议'];
  const kr = h('div', 'abs', world); px(kr, 1290, 400, 540); css(kr, { display: 'flex', flexWrap: 'wrap', gap: '12px' });
  const kc = kinds.map((k) => { const c = h('span', 'chip', kr, k); css(c, { fontSize: '28px', padding: '8px 20px', background: '#15803D', color: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,.35)' }); return c; });
  kinds.forEach((k, i) => { rise3d(kc[i], T('r1b', k) - 0.12, { rx: 40, z: 160, y: 12, d: 0.4 }); sfx('tick', T('r1b', k), { g: 0.6 }); });
  // r5：Ghidra、IDA、Hopper 三块插进 REA 旁边
  const eng = ['Ghidra', 'IDA', 'Hopper'];
  const eb = eng.map((e, i) => { const c = h('div', 'card3d', world); px(c, 1290 + i * 180, 540, 165, 110); css(c, { display: 'grid', placeItems: 'center', font: '700 30px Inter', borderRadius: '18px' }); c.innerHTML = `<div style="text-align:center">${icon('plug', 'style="width:30px;height:30px;color:#15803D"')}<div>${e}</div></div>`; c.dataset.name = e; return c; });
  eng.forEach((e, i) => { tl.fromTo(eb[i], { autoAlpha: 0, y: 160, rotationX: -50, z: -200, transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, z: 0, duration: 0.55, ease: 'back.out(1.5)', immediateRender: true }, T('r5', e) - 0.15); sfx('pop', T('r5', e), { g: 0.6 }); });
  const n5 = note(world, 1290, 680, '外部引擎按需另行配置；每个逆向会话独占一个分析进程', 520); css(n5, { '--mc': MC.rev, fontSize: '24px' });
  fadeIn(n5, T('r5', '接进来') - 0.2, { y: 14 });
  [hub, kr, ...eb, n5].forEach((e) => fadeOut(e, s.end - 0.6, { d: 0.3 }));
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.6, s.end - 0.4, -1)]);
});

// ── 写作 ──
scene('writing', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const { app, col, wrap, comp } = modeScene(world, s, 'wri', {
    title: '《雾港》第七章', ws: '雾港', sessions: [['《雾港》第七章', 'wri', true], ['《雾港》人物小传', 'wri']], more: ['acme-shop', 'router-fw'], out: false,
    foot: { turns: '1 轮 2 步 · 320 tok/s', tok: '43.8K tok · 缓存命中 0%', cost: '¥0.09' },
  });
  const L = [step(col, 'think', '思考', '先读人物设定和文风卡。'), step(col, 'doc', '读取', '<u>story\\bible\\人物.md</u>')];
  const ch = h('div', '', col, '<h3>第七章 · 雾</h3>');
  const paras = ['雾是半夜上来的。林晚醒的时候，窗外已经看不见海。', '她披上外套下楼。周屿坐在值班室的长凳上，测绘包放在脚边，拉链没拉。', '“灯还亮着。”他说。', '“它一直亮着。”林晚把水壶放上炉子，没有回头。“雾天更要亮。”', '水开了。她倒了一杯，放在自己面前。'].map((p) => h('div', 'say', col, p));
  L.forEach((e) => appear(e, s.start - 0.3)); appear(ch, s.start - 0.3);
  paras.forEach((p, i) => fadeIn(p, T('w1') + 0.1 + i * 0.4, { y: 10, d: 0.35 }));
  // w2、w3：写作资料（照「设置 → 模式 → 写作资料」）以 3D 面板浮在右边，勾选「用于写作」
  makeRoom(T('w2', '人物') - 0.7, col, comp.c);
  const mat = h('div', 'card3d', world); px(mat, 1290, 150, 540, 520); css(mat, { padding: '28px 32px', fontSize: '24px', '--mc': MC.wri });
  const rowM = (k, name, path) => `<div style="color:#5d626b;font-size:22px;margin-top:16px">${k}</div><div class="mrow" style="border:1px solid var(--line);border-radius:14px;padding:12px 18px;display:flex;align-items:center;gap:14px;margin-top:8px"><div style="flex:1"><div>${name}</div><div class="mono" style="font-size:22px;color:#5d626b">${path}</div></div><span class="cbx">${icon('check')}</span><span style="font-size:22px">用于写作</span></div>`;
  mat.innerHTML = `<div style="font-size:30px;font-weight:700">写作资料</div><div style="color:#5d626b;font-size:22px;margin-top:4px">只有勾选的资料会随写作请求发送</div>${rowM('文风卡', '文风：冷峻', 'story/style/冷峻.md')}${rowM('设定集', '人物', 'story/bible/人物.md')}`;
  mat.dataset.name = '写作资料';
  tl.fromTo(mat, { autoAlpha: 0, rotationY: -40, x: 200, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: -12, x: 0, z: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, T('w2', '人物') - 0.3);
  sfx('whoosh', T('w2', '人物') - 0.3, { g: 0.5 });
  const mrows = mat.querySelectorAll('.mrow');
  ringOn(mat, mrows[0], T('w2', '文风卡') - 0.1, T('w3') - 0.1, { pad: 4, c: MC.wri });
  const cbs = mat.querySelectorAll('.cbx');
  checkOn(cbs[0], T('w3', '勾上') + 0.05); checkOn(cbs[1], T('w3', '用到') - 0.05);
  fromTo(mat, T('w6') - 0.4, { rotationY: -12, x: 0, autoAlpha: 1 }, { rotationY: -60, x: 300, autoAlpha: 0, duration: 0.6, ease: 'power2.in', immediateRender: false });
  // w6：没有终端、不跑代码——两块工具牌翻过去变灰
  const tools = [['term', '终端'], ['run', '代码执行']].map(([ic, k], i) => {
    const c = h('div', 'card3d', world); px(c, 1300 + i * 270, 300, 240, 160); css(c, { display: 'grid', placeItems: 'center', textAlign: 'center', fontSize: '30px', fontWeight: '600', borderRadius: '20px' });
    c.innerHTML = `<div>${icon(ic, 'style="width:44px;height:44px"')}<div style="margin-top:8px">${k}</div></div><div class="xx" style="position:absolute;inset:0;display:grid;place-items:center;color:#DC2626">${icon('x', 'style="width:120px;height:120px;stroke-width:2.5"')}</div>`;
    c.dataset.name = k; return c;
  });
  tools.forEach((c, i) => rise3d(c, T('w6', i ? '跑代码' : '终端') - 0.25, { rx: 30, z: 300, d: 0.5 }));
  tools.forEach((c, i) => { const x = c.querySelector('.xx'); const t = T('w6', i ? '跑代码' : '终端') + 0.2; set(x, s.start, { autoAlpha: 0 }); slam(x, t, { from: 1.6 }); fromTo(c, t, { opacity: 1, filter: 'grayscale(0)' }, { opacity: 0.85, filter: 'grayscale(1)', duration: 0.3, immediateRender: false }); sfx('thud', t, { g: 0.4 }); });
  tools.forEach((c) => fadeOut(c, T('w7') - 0.5, { d: 0.3 }));
  // w7：哦对了——侧栏里另一条会话右键 → 删除对话（真实界面的菜单与对话框）
  const target = app.sess[1];
  const tb = box(target, app.el);
  const menu = h('div', 'menu', app.el); px(menu, tb.x + 190, tb.y + tb.h - 4, 360); css(menu, { zIndex: 8, fontSize: '24px' });
  const items = [['pin', '置顶会话'], ['edit', '重命名'], ['copy', '复制 Session ID'], ['trash', '删除对话']];
  const mis = items.map(([ic, k]) => h('div', 'mi', menu, `${icon(ic)}<span>${k}</span>`));
  mis.forEach((m) => css(m, { padding: '10px 16px' }));
  const tM = T('w7', '对话') - 0.4;
  ringOn(app.el, target, tM - 0.3, tM + 0.4, { pad: 3 });
  tl.fromTo(menu, { autoAlpha: 0, scale: 0.94, transformOrigin: '0 0' }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power2.out', immediateRender: true }, tM); sfx('pop', tM, { g: 0.5 });
  fromTo(mis[3], tM + 0.35, { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: 'rgba(220,38,38,.10)', duration: 0.2 });
  const scr = h('div', 'scrim', app.el); css(scr, { zIndex: 8 }); set(scr, s.start, { autoAlpha: 0 });
  const dl = dialog(app.el, 760, 250, 700, '删除对话？');
  dl.body.innerHTML = '<div>将永久删除“《雾港》人物小传”及其关联旁问、随问和子会话。</div><div style="margin-top:22px">运行中的任务会先停止，工作区文件保留。此操作无法撤销。</div><div style="display:flex;justify-content:flex-end;gap:14px;margin-top:30px"><span class="btn">取消</span><span class="btn danger del">停止并删除</span></div>';
  css(dl.d, { zIndex: 9 });
  const tD = T('w7', '删掉') - 0.45;
  fadeOut(menu, tD - 0.05, { d: 0.2 });
  rise3d(dl.d, tD, { rx: 16, z: 300, d: 0.5 }); sfx('whoosh', tD, { g: 0.4 }); fadeIn(scr, tD, { y: 0, d: 0.3 });
  const del = dl.body.querySelector('.del');
  fromTo(del, Tend('w7') - 0.1, { scale: 1 }, { scale: 0.92, duration: 0.1, immediateRender: false });
  fromTo(del, Tend('w7'), { scale: 0.92 }, { scale: 1, duration: 0.15, immediateRender: false }); sfx('pop', Tend('w7'));
  sink3d(dl.d, Tend('w7') + 0.15, { d: 0.35 }); fadeOut(scr, Tend('w7') + 0.15, { d: 0.35 });
  // 那一行在侧栏里收起
  fromTo(target, Tend('w7') + 0.35, { autoAlpha: 1, height: 50, x: 0 }, { autoAlpha: 0, height: 0, x: -40, duration: 0.45, ease: 'power2.in', immediateRender: false }); sfx('whoosh', Tend('w7') + 0.35, { g: 0.3 });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.6, s.end, 1)]);
});
