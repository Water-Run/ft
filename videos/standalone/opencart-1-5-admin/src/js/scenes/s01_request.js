// 第 01 章（request）：分镜 B03 B44 B04 B05 B06 B07，段落 a1 a2 a2a a4 a5 a6 a8 a7 a9。
// 一个 world，六个站点横向排开（站心 x = 960 + 2100·i）：
//   站 0 B03 浏览器 / Apache + PHP / MySQL / Linux，请求令牌从浏览器进入 PHP；说到版本时芯片换成实测版本
//   站 1 B44 演示环境（Ubuntu 12.04.5 / Apache 2.2.22 / PHP 5.3.10 / MySQL 5.5.62）对 4.1.0.4 的 PHP ≥ 8.1，只比运行要求
//   站 2 B04 三条后台地址对齐在 index.php（入口文件）；route=sale/order → admin/controller/sale/order.php 的 index()
//   站 3 B05 控制器 → 模型（取数据）、→ 模板 order_list.tpl（生成页面）
//   站 4 B06 入口三步（连库、读 131 项设置、建对象）与 Registry；只高亮当前用到的设置 config_admin_limit = 20、语言
//   站 5 B07 令牌停在登录检查、权限检查之前；两种结果：转去登录页 / 「没有权限」页面
// 同一个请求令牌 route=sale/order 从站 0 一路跟到站 5（FACTS a1–a6、L10、C19-05、b1–b9、b11、b14–b15、a12–a13、S19-01/02/04、g2、c1、f7）。
scene('request', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const mv = (id) => E(id, 0.03);                  // 站间移动：上一站最后一句说完才起步（末句画面完整可读），0.9 秒到站
  const SX = (i) => 2100 * i;
  const st = document.createElement('style');
  st.textContent = `
#sc-request .rq-bracket{position:absolute;border:3px dashed #8E9AA6;border-radius:18px}
#sc-request .rq-bracket.rq-on{border:3px solid #C4561C}
#sc-request .rq-dark{color:#9A3F10}
#sc-request .rq-linux{position:absolute;border-radius:8px;background:linear-gradient(180deg,#4A5058,#2C3036);border:2px solid #1E2125;color:#fff;font:700 34px/76px "Inter","Sans SC";padding-left:24px}
#sc-request .chip.rq-ph{background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.4);color:rgba(255,255,255,.55)}
#sc-request .rq-role{position:absolute;font:500 28px/1.3 "Sans SC";color:#D6E4F0}
#sc-request .rq-row{position:absolute;left:28px;right:28px;height:78px;border-bottom:2px solid #E2E6EA;font:500 34px/78px "Inter","Sans SC";color:#1d1d1d}
#sc-request .rq-row .r{position:absolute;left:0;color:#55606B;font-size:30px}
#sc-request .rq-row .v{position:absolute;left:250px;font-weight:700}
#sc-request .rq-gh{position:absolute;border:3px dashed #A9B4BE;border-radius:10px 10px 0 0;color:#6E7781;font:600 34px/1.3 "Sans SC","Inter";display:flex;align-items:center;justify-content:center}
#sc-request .rq-big{position:absolute;font:800 64px/1.1 "Inter","Sans SC";color:#003A88}
#sc-request .rq-addr{position:absolute;border:3px solid #8E9AA6;border-radius:10px;background:#fff}
#sc-request .rq-addr .bar{position:absolute;left:0;right:0;top:0;height:52px;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#F4F6F8,#D7DDE3);border-bottom:2px solid #A7B1BB;font:600 26px/52px "Sans SC";color:#2C3E50;padding-left:22px}
#sc-request .rq-url{position:absolute;left:28px;font:500 38px/60px "Mono";color:#1d1d1d;white-space:pre;padding:0 10px}
#sc-request .rq-url.dim{color:#6E7781}
#sc-request .rq-url .ix{padding:0 14px}
#sc-request .rq-url .q.on{color:#9A3F10;font-weight:700}
#sc-request .rq-col{position:absolute;border:4px solid #C4561C;border-radius:8px}
#sc-request .rq-mono{font-family:"Mono";font-weight:600}
#sc-request .rq-sub{position:absolute;font:500 28px/1.3 "Sans SC","Inter";color:#4A5560;white-space:nowrap}
#sc-request .rq-duty{position:absolute;left:28px;font:600 34px/1.3 "Sans SC","Inter";color:#1d1d1d}
#sc-request .rq-duty b{color:#9A3F10}
#sc-request .rq-step{position:absolute;left:24px;right:24px;height:118px;border:2px solid #C9D3DC;border-radius:8px;background:#F7F9FB}
#sc-request .rq-step .n{position:absolute;left:18px;top:14px;width:52px;height:52px;border-radius:50%;background:#0F6193;color:#fff;font:800 30px/52px "Inter";text-align:center}
#sc-request .rq-step .a{position:absolute;left:90px;top:10px;font:700 36px/1.3 "Sans SC","Inter";color:#1d1d1d}
#sc-request .rq-step .b{position:absolute;left:90px;top:62px;font:500 27px/1.3 "Inter","Sans SC";color:#4A5560;white-space:nowrap}
#sc-request .rq-step.on{background:#FFFFCB;border-color:#C4561C;box-shadow:inset 0 0 0 2px #C4561C}
#sc-request .chip.rq-slot{background:#fff;border:2px dashed #A9B4BE;color:#6E7781}
#sc-request .chip.rq-fill{background:#EEF4F9;border:2px solid #0F6193;color:#0B3F63}
#sc-request .rq-set{position:absolute;border:2px solid #C4561C;border-radius:6px;background:#fff;padding:8px 18px;font:600 32px/1.3 "Mono","Sans SC";color:#1d1d1d;white-space:nowrap}
#sc-request .rq-set .l{font:600 28px/1.3 "Sans SC";color:#7A300A;margin-left:16px}
#sc-request .rq-gate{position:absolute;border:3px solid #003A88;border-radius:10px 10px 0 0;background:linear-gradient(180deg,#F4F8FC,#DCE7F2)}
#sc-request .rq-gate .a{position:absolute;left:0;right:0;top:34px;text-align:center;font:800 42px/1.2 "Sans SC","Inter";color:#003A88}
#sc-request .rq-gate .b{position:absolute;left:0;right:0;top:98px;text-align:center;font:600 26px/1.2 "Mono";color:#4A5560}
#sc-request .rq-gate.on{background:#FFFFCB;border-color:#C4561C;box-shadow:inset 0 0 0 3px #C4561C}
#sc-request .rq-stop{position:absolute;width:0;border-left:6px solid #C4561C}`;
  document.head.appendChild(st);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const R = (e) => box(e, w);
  const keys = [];
  const drift = (from, to_, z = 1.02) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z }, d, { ease: 'none', sfx: false }]); };
  const tokLegs = [];
  // 关键帧按顺序排成互不重叠的段：某段的起点若早于上一段的终点，就推迟到上一段结束后；慢漂移段相应缩短，太短就略去
  const seqKeys = (ks) => { const out = []; let end = -Infinity; for (const [t, v, d, o = {}] of ks) { let tt = t, dd = d; if (tt < end + 0.02) { const sh = end + 0.02 - tt; tt += sh; if (o.ease === 'none') dd -= sh; } if (dd < 0.25) continue; out.push([tt, v, dd, o]); end = tt + dd; } return out; };

  // ═════ 站 0 · B03 浏览器 / 服务器一侧（Apache + PHP、MySQL、Linux）═════
  const head = h('div', 'abs t-h2', w, '一次请求经过哪些地方'); px(head, 96, 172);
  const br = zone(w, 'browser', 96, 250, 560, 560, '浏览器');
  br.addr.innerHTML = 'index.php?route=sale/order';
  const brRole = h('div', 'abs t-lbl-s', w, '显示页面 · 发出点击和填写'); px(brRole, 96, 828);
  const bracket = h('div', 'rq-bracket', w); px(bracket, 716, 212, 1108, 660); bracket.dataset.name = '服务器一侧';
  const brLbl = h('div', 'abs t-lbl rq-dark', w, '服务器一侧'); px(brLbl, 744, 228);
  const srv = zone(w, 'server', 750, 300, 600, 400, 'Apache + PHP', '网页服务器 · 业务程序');
  const apache = chip(srv.el, 'Apache', 24, 120, 'rq-ph');
  const php = chip(srv.el, 'PHP', 300, 120, 'rq-ph');
  const apR = h('div', 'rq-role', srv.el, '接收网页请求'); px(apR, 24, 190);
  const phR = h('div', 'rq-role', srv.el, '执行业务代码'); px(phR, 300, 190);
  const db = zone(w, 'db', 1420, 320, 380, 380, 'MySQL', '数据库');
  const dbc = chip(db.el, '保存和查询数据', 24, 130, 'rq-ph');
  const linux = h('div', 'rq-linux', w, 'Linux · 操作系统'); px(linux, 750, 730, 1050, 80);
  const tok = token(w, 'route=sale/order', 'req', 130, 384, '请求：打开订单列表');
  tok.setAttribute('data-overlap-ok', ''); css(tok, { zIndex: 40 });

  wipe(head, c0 + 0.1, { dir: 'l', d: 0.5 });
  const tB = C('a1_1', '浏览器', -0.2);
  slideDown(br.el, tB); sfx('pop', tB, { g: 0.5 });
  appear(tok, tB + 0.4);
  wipe(bracket, C('a1_1', '服务器', -0.2), { dir: 'l', d: 0.5 });
  slide(brRole, C('a1_2', '显示页面'), { y: 16, d: 0.4 });
  wipe(srv.el, C('a1_3', 'PHP', -0.2), { dir: 'l', d: 0.5 }); sfx('pop', C('a1_3', 'PHP', -0.2), { g: 0.5 });
  wipe(db.el, C('a1_3', '数据库', -0.2), { dir: 't', d: 0.5 }); sfx('pop', C('a1_3', '数据库', -0.2), { g: 0.5 });
  slam(brLbl, C('a1_4', '服务器一侧'), { from: 1.2, d: 0.35 }); sfx('thud', C('a1_4', '服务器一侧'), { g: 0.4 });
  classAt(bracket, 'rq-on', C('a1_4', '服务器一侧'), C('a2_2', 'Linux'));
  wipe(linux, C('a2_2', 'Linux'), { dir: 'l', d: 0.5 }); sfx('tick', C('a2_2', 'Linux'), { g: 0.6 });
  classAt(apache, 'rq-ph', 0, C('a2_3', 'Apache')); fadeIn(apR, C('a2_3', 'Apache')); classAt(apache, 'on', C('a2_3', 'Apache'), C('a2_4', 'PHP'));
  classAt(php, 'rq-ph', 0, C('a2_4', 'PHP')); fadeIn(phR, C('a2_4', 'PHP')); classAt(php, 'on', C('a2_4', 'PHP'), C('a2_5', 'MySQL'));
  classAt(dbc, 'rq-ph', 0, C('a2_5', 'MySQL'));
  sfx('tick', C('a2_3', 'Apache'), { g: 0.6 }); sfx('tick', C('a2_4', 'PHP'), { g: 0.6 }); sfx('tick', C('a2_5', 'MySQL'), { g: 0.6 });
  // a2a_1：留在全景上，把芯片换成这次演示的实测版本（L10）
  // 版本芯片是盖在原芯片上的新元素（原芯片已有 classAt，不再用 keyed 换类名）
  const phpV = chip(srv.el, 'PHP 5.3.10', 300, 120, ''); appear(phpV, C('a2a_1', '五点三')); vanish(php, C('a2a_1', '五点三'));
  const apV = chip(srv.el, 'Apache 2.2.22', 24, 120, ''); appear(apV, C('a2a_1', '五点三', -0.25)); vanish(apache, C('a2a_1', '五点三', -0.25));
  keyed(db.el.querySelector('.zl')).at(C('a2a_1', '五点五'), { html: 'MySQL 5.5.62' });
  keyed(linux).at(C('a2a_1', '五点五', 0.3), { html: 'Linux · Ubuntu 12.04.5' });
  sfx('tick', C('a2a_1', '五点三'), { g: 0.5 }); sfx('tick', C('a2a_1', '五点五'), { g: 0.5 });
  const tA = C('a2_3', 'Apache', -0.4);
  tokLegs.push([tA, 0.9, [[130, 384], [690, 384], [774, 600]]]);
  tokLegs.push([Math.max(tA + 1, C('a2_4', 'PHP', -0.3)), 0.6, [[774, 600], [1000, 600]]]);
  sfx('blip', tA, { g: 0.5 });

  const tP = C('a2_1', 'Linux', -0.5), tR = C('a2_5', 'MySQL', -0.5);
  keys.push([c0 + 0.1, { z: 1.03 }, Math.max(0.5, tP - c0 - 0.25), { ease: 'none', sfx: false }]);
  keys.push([tP, { x: 1290, y: 560, z: 1.22 }, 1.1, { sfx: false }]);
  drift(tP + 1.15, tR, 1.25);
  keys.push([tR, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
  drift(tR + 0.85, mv('a2a_1'), 1.02);

  // ═════ 站 1 · B44 演示环境对新版要求：只对照运行要求（a2a）═════
  {
    const X = SX(1);
    const t0 = mv('a2a_1');
    const hd = h('div', 'abs t-h1', w, '运行环境：这次演示与新版对照'); px(hd, X + 96, 176);
    const note = h('div', 'abs t-note', w, '只对照运行要求，不比较性能'); px(note, X + 1400, 196);
    const L = ocBox(w, X + 96, 290, 800, 440, '这次演示 · OpenCart 1.5.6.4', { icon: 'setting' });
    const envRows = [['操作系统', 'Ubuntu 12.04.5'], ['网页服务器', 'Apache 2.2.22'], ['业务程序', 'PHP 5.3.10'], ['数据库', 'MySQL 5.5.62']];
    const lr = envRows.map(([r, v], i) => { const e = h('div', 'rq-row', L.bd, `<span class="r">${r}</span><span class="v">${v}</span>`); e.style.top = (24 + i * 82) + 'px'; return e; });
    const ghR = h('div', 'rq-gh', w, '新版对照'); px(ghR, X + 1024, 290, 800, 440);
    const Rb = ocBox(w, X + 1024, 290, 800, 440, '新版对照 · OpenCart 4.1.0.4', { icon: 'code' });
    const rRole = h('div', 'abs t-lbl-s', Rb.bd, '业务程序的要求'); px(rRole, 30, 34);
    const rBig = h('div', 'rq-big', Rb.bd, 'PHP ≥ 8.1'); px(rBig, 30, 100);
    const rSrc = h('div', 'abs t-note', Rb.bd, '项目依赖文件 composer.json 写明'); px(rSrc, 30, 200);
    const rOth = h('div', 'abs t-note', Rb.bd, '其他组件：本片不作对照'); px(rOth, 30, 264);
    const ov = ovl(w, X, 160, 1920, 760);
    const pr = R(lr[2]);
    const bg = R(rBig);
    const arr = svgLine(ov, `M${pr.r - 6},${pr.cy} L${X + 960},${pr.cy} L${X + 960},${bg.cy} L${X + 1016},${bg.cy}`, 'req', { w: 5 });
    const chg = h('div', 'abs callout req', w, '运行环境变了'); px(chg, X + 760, 744);
    const dutyL = h('div', 'abs t-lbl-s', w, '职责仍可分开看：'); px(dutyL, X + 96, 836);
    const duty = ['接收请求 · Apache', '执行程序 · PHP', '取数据 · MySQL'].map((t) => chip(w, t, 0, 0, ''));
    let cx = X + 420; duty.forEach((d) => { px(d, cx, 826); cx += d.offsetWidth + 26; });

    appear(hd, t0);
    slideDown(L.el, t0 + 0.6, { d: 0.4 }); sfx('pop', t0 + 0.6, { g: 0.45 });
    fadeIn(ghR, t0 + 0.8, { d: 0.3 });
    fadeIn(note, t0 + 1.0, { d: 0.3 });
    hl(lr[2], C('a2a_3', '八点一', -0.2), E('a2a_4', 0.1));
    fadeOut(ghR, C('a2a_2', '新版', -0.1), { d: 0.2 });
    slideDown(Rb.el, C('a2a_2', '新版'), { d: 0.4 }); sfx('pop', C('a2a_2', '新版'), { g: 0.5 });
    fadeIn(rRole, C('a2a_2', '四点一', 0.1), { d: 0.3 });
    slam(rBig, C('a2a_3', '八点一'), { from: 1.2, d: 0.35 }); sfx('thud', C('a2a_3', '八点一'), { g: 0.45 });
    hl(rBig, C('a2a_3', '八点一', 0.1), E('a2a_4', 0.1));
    fadeIn(rSrc, C('a2a_3', '八点一', 0.4), { d: 0.3 }); fadeIn(rOth, C('a2a_3', '八点一', 0.6), { d: 0.3 });
    drawLine(arr, C('a2a_4', '运行环境', -0.2), 0.4);
    slide(chg, C('a2a_4', '运行环境'), { y: 16, d: 0.35 }); sfx('tick', C('a2a_4', '运行环境'), { g: 0.5 });
    fadeIn(dutyL, C('a2a_5', '接收请求', -0.3), { d: 0.3 });
    [['接收请求', 0], ['执行程序', 1], ['取数据', 2]].forEach(([wd, i]) => { slideDown(duty[i], C('a2a_5', wd, -0.1), { d: 0.3 }); sfx('tick', C('a2a_5', wd, -0.1), { g: 0.5 }); });

    keys.push([t0, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    drift(t0 + 0.95, mv('a2a_5'), 1.02);
    void lr; void pr;
  }

  // ═════ 站 2 · B04 同一个入口文件；route 选出控制器与方法（a4、a5）═════
  let tokP2;
  {
    const X = SX(2);
    const t0 = mv('a2a_5');
    const hd = h('div', 'abs t-h1', w, '地址里的 route：选出要执行的代码'); px(hd, X + 96, 176);
    const ab = h('div', 'rq-addr', w, '<div class="bar">后台页面的地址（示意）</div>'); px(ab, X + 96, 270, 1728, 300);
    const urls = [['common/home', '控制台'], ['sale/order', '订单列表'], ['sale/customer', '顾客']];
    const U = urls.map(([r, z], i) => {
      const e = h('div', 'rq-url', ab, `/admin/<span class="ix">index.php</span><span class="q">?route=</span><span class="vv">${r}</span>`);
      e.style.top = (74 + i * 72) + 'px';
      const zz = h('div', 'abs t-note', ab, z); px(zz, 1460, 82 + i * 72);
      return { e, zz };
    });
    const ix0 = R(U[0].e.querySelector('.ix')), ix2 = R(U[2].e.querySelector('.ix'));
    const col = h('div', 'rq-col', w); px(col, ix0.x + 4, ix0.y - 2, ix0.w - 8, ix2.b - ix0.y + 4);
    const colL = h('div', 'abs callout req', w, '同一个入口文件 <span class="rq-mono">index.php</span>'); px(colL, ix0.x - 40, 586);
    const v1 = U[1].e.querySelector('.vv');
    const rl = h('div', 'abs t-lbl', w, '<span class="rq-mono">route</span>（路由）：选择这次要执行的代码'); px(rl, X + 96, 662);
    // sale / order → 目录、文件；没有第三段 → index()
    const cS = chip(w, '<span class="rq-mono">sale</span>', X + 96, 760);
    const cO = chip(w, '<span class="rq-mono">order</span>', X + 300, 760);
    const sl = h('div', 'abs t-lbl', w, '/'); px(sl, X + 252, 760);
    const sS = h('div', 'rq-sub', w, '目录'); px(sS, X + 110, 830);
    const sO = h('div', 'rq-sub', w, '文件'); px(sO, X + 316, 830);
    const ctl = chip(w, '<span class="rq-mono">admin/controller/sale/order.php</span>', X + 620, 760, '');
    const ctlS = h('div', 'rq-sub', w, '订单控制器 <span class="rq-mono">ControllerSaleOrder</span>'); px(ctlS, X + 634, 830);
    const met = chip(w, '<span class="rq-mono">index()</span>', 0, 760, '');
    const metS = h('div', 'rq-sub', w, '方法：没写第三段，取缺省'); px(metS, 0, 830);
    const cr = R(ctl);
    px(met, cr.r + 90, 760); px(metS, cr.r + 90, 830);
    const ov = ovl(w, X, 160, 1920, 760);
    const oR = R(cO);
    const a1 = svgLine(ov, `M${oR.r + 12},${oR.cy} L${cr.x - 12},${oR.cy}`, 'req', { w: 5 });
    const a2 = svgLine(ov, `M${cr.r + 12},${oR.cy} L${cr.r + 78},${oR.cy}`, 'req', { w: 5 });

    appear(hd, t0);
    slideDown(ab, t0 + 0.5, { d: 0.4 });
    U.forEach((u, i) => { fadeIn(u.e, C('a4_1', '地址', -0.2 + i * 0.25), { d: 0.25 }); fadeIn(u.zz, C('a4_1', '地址', 0 + i * 0.25), { d: 0.25 }); });
    sfx('tick', C('a4_1', '地址', -0.2), { g: 0.45 });
    wipe(col, C('a4_1', '入口文件', -0.15), { dir: 't', d: 0.35 }); slide(colL, C('a4_1', '入口文件'), { y: 16, d: 0.35 }); sfx('pop', C('a4_1', '入口文件'), { g: 0.5 });
    const tRt = C('a4_2', 'route');
    classAt(U[0].e, 'dim', tRt, Infinity); classAt(U[2].e, 'dim', tRt, Infinity);
    classAt(U[1].e.querySelector('.q'), 'on', tRt, Infinity); sfx('tick', tRt, { g: 0.55 });
    hl(v1, C('a4_3', 'sale/order', -0.1), E('a5_2', 0.2)); sfx('pop', C('a4_3', 'sale/order', -0.1), { g: 0.5 });
    slide(rl, C('a5_1', '路由', -0.1), { y: 16, d: 0.4 }); sfx('thud', C('a5_1', '路由', -0.1), { g: 0.4 });
    slideDown(cS, C('a5_2', '找到', -0.2), { d: 0.25 }); fadeIn(sl, C('a5_2', '找到', -0.1), { d: 0.2 }); slideDown(cO, C('a5_2', '找到', 0.05), { d: 0.25 });
    fadeIn(sS, C('a5_2', '找到', 0.15), { d: 0.25 }); fadeIn(sO, C('a5_2', '找到', 0.25), { d: 0.25 });
    drawLine(a1, C('a5_2', '订单控制器', -0.35), 0.3);
    slam(ctl, C('a5_2', '订单控制器'), { from: 1.15, d: 0.35 }); sfx('thud', C('a5_2', '订单控制器'), { g: 0.45 });
    fadeIn(ctlS, C('a5_2', '订单控制器', 0.3), { d: 0.3 });
    hl(ctl, C('a5_2', '订单控制器', 0.2), E('a5_2', 0.2));
    drawLine(a2, C('a5_2', '方法', -0.3), 0.25);
    slideDown(met, C('a5_2', '方法'), { d: 0.3 }); fadeIn(metS, C('a5_2', '方法', 0.2), { d: 0.3 }); sfx('pop', C('a5_2', '方法'), { g: 0.5 });

    // 令牌：在站 1 时（不在画面里）先移到地址第二行右侧；说到「订单控制器」时落到控制器文件上方
    const tw = tok.offsetWidth;
    const p0 = [X + 1060, 270 + 74 + 72 + 3];
    tokLegs.push([E('a2a_3'), 0.05, [[1000, 600], p0]]);
    tokP2 = [cr.x + 40, 690 - 54 - 4];
    // 落点在 route 标题右侧之上避免压字：先上移到地址框下沿，再左移到控制器上方
    tokP2 = [Math.max(cr.x + 40, R(rl).r + 30), 600];
    tokLegs.push([C('a5_2', '订单控制器', -0.6), 0.8, [p0, [p0[0], 600], tokP2]]);
    void tw;

    keys.push([t0, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    drift(t0 + 0.95, C('a4_2', 'route', -0.5), 1.02);
    keys.push([C('a4_2', 'route', -0.45), { x: X + 900, y: 440, z: 1.15 }, 1.0, { sfx: false }]);
    drift(C('a4_2', 'route', 0.6), C('a5_1', '路由', -0.6), 1.165);
    keys.push([C('a5_1', '路由', -0.55), { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
    drift(C('a5_1', '路由', 0.3), mv('a5_2'), 1.015);
  }

  // ═════ 站 3 · B05 控制器 → 模型（取数据）/ 模板（生成页面）（a6）═════
  let tokP3;
  {
    const X = SX(3);
    const t0 = mv('a5_2');
    const hd = h('div', 'abs t-h1', w, '控制器组织这一次页面工作'); px(hd, X + 96, 176);
    const cb = ocBox(w, X + 96, 300, 760, 470, '控制器 · 订单', { icon: 'code' });
    const cp = h('div', 'abs t-data rq-mono', cb.bd, 'admin/controller/sale/order.php'); px(cp, 28, 22); css(cp, { fontSize: '28px' });
    const cm = h('div', 'abs t-lbl-s', cb.bd, '方法 <span class="rq-mono">index()</span>'); px(cm, 28, 74);
    const du = [['① ', '接收条件', '：筛选、页码'], ['② 安排', '取数据', ''], ['③ 决定怎样', '输出', '']]
      .map(([a, b, c], i) => { const e = h('div', 'rq-duty', cb.bd, `${a}<b>${b}</b>${c}`); e.style.top = (160 + i * 76) + 'px'; return e; });
    const gM = h('div', 'rq-gh', w, '模型'); px(gM, X + 1120, 270, 704, 250);
    const gV = h('div', 'rq-gh', w, '模板'); px(gV, X + 1120, 600, 704, 250);
    const mb = ocBox(w, X + 1120, 270, 704, 250, '模型 · 订单', { icon: 'db' });
    const mp = h('div', 'abs rq-mono', mb.bd, 'admin/model/sale/order.php'); px(mp, 26, 22); css(mp, { fontSize: '28px' });
    const md = h('div', 'abs t-lbl-s', mb.bd, '查询订单的代码'); px(md, 26, 84);
    const vb = ocBox(w, X + 1120, 600, 704, 250, '模板 · 订单列表', { icon: 'report' });
    const vp = h('div', 'abs rq-mono', vb.bd, 'admin/view/template/sale/order_list.tpl'); px(vp, 26, 22); css(vp, { fontSize: '26px' });
    const vd = h('div', 'abs t-lbl-s', vb.bd, '页面的具体排法'); px(vd, 26, 84);
    const ov = ovl(w, X, 160, 1920, 760);
    const lM = svgLine(ov, `M${X + 870},440 L${X + 990},440 L${X + 990},395 L${X + 1106},395`, 'req', { w: 5 });
    const lV = svgLine(ov, `M${X + 870},640 L${X + 990},640 L${X + 990},725 L${X + 1106},725`, 'req', { w: 5 });
    const tM = h('div', 'abs callout req', w, '取数据'); px(tM, X + 900, 300);
    const tV = h('div', 'abs callout req', w, '生成页面'); px(tV, X + 880, 790);
    const ctlBox = R(cb.el);

    appear(hd, t0);
    slideDown(cb.el, t0 + 0.5, { d: 0.4 }); sfx('pop', t0 + 0.5, { g: 0.45 });
    fadeIn(gM, t0 + 0.7, { d: 0.3 }); fadeIn(gV, t0 + 0.8, { d: 0.3 });
    hl(cb.hd, C('a6_1', '控制器'), C('a6_2', '接收条件', -0.1));
    [['接收条件', 0], ['取数据', 1], ['输出', 2]].forEach(([wd, i]) => { slide(du[i], C('a6_2', wd, -0.15), { x: -30, d: 0.35 }); sfx('tick', C('a6_2', wd, -0.15), { g: 0.5 }); });
    const tMo = C('a6_3', '模型'), tTe = C('a6_3', '模板');
    fadeOut(gM, tMo - 0.15, { d: 0.15 }); slideDown(mb.el, tMo - 0.1, { d: 0.4 }); sfx('pop', tMo - 0.1, { g: 0.5 });
    drawLine(lM, tMo - 0.3, 0.35); slide(tM, tMo + 0.1, { y: 16, d: 0.35 });
    fadeOut(gV, tTe - 0.15, { d: 0.15 }); slideDown(vb.el, tTe - 0.1, { d: 0.4 }); sfx('pop', tTe - 0.1, { g: 0.5 });
    drawLine(lV, tTe - 0.3, 0.35); slide(tV, tTe + 0.1, { y: 16, d: 0.35 });
    sfx('chime', E('a6_3', -0.6), { g: 0.35 });

    tokP3 = [X + 120, ctlBox.b + 22];
    tokLegs.push([t0, 0.9, [tokP2, tokP3]]);

    keys.push([t0, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    drift(t0 + 0.95, C('a6_2', '接收条件', -0.5), 1.02);
    keys.push([C('a6_2', '接收条件', -0.45), { x: X + 700, y: 540, z: 1.15 }, 1.0, { sfx: false }]);
    drift(C('a6_2', '接收条件', 0.6), C('a6_3', '模型', -0.9), 1.165);
    keys.push([C('a6_3', '模型', -0.85), { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);   // 拉回后静止：三者一起可读
  }

  // ═════ 站 4 · B06 每次请求重新准备：连库、读设置、建对象；Registry（a8、a7）═════
  let tokP4;
  {
    const X = SX(4);
    const t0 = mv('a6_3');
    const hd = h('div', 'abs t-h1', w, '每次请求，入口先做准备'); px(hd, X + 96, 164);
    const every = h('div', 'abs callout req', w, '每次请求都从头来一遍'); px(every, X + 860, 176);
    const eb = ocBox(w, X + 96, 256, 800, 500, '入口 admin/index.php', { icon: 'code' });
    const steps = [['1', '连接数据库', '连接信息取自 config.php'], ['2', '读入设置', 'oc_setting 表：131 项'], ['3', '建立对象', '设置、语言、计量、会话……']]
      .map(([n, a, b], i) => { const e = h('div', 'rq-step', eb.bd, `<span class="n">${n}</span><span class="a">${a}</span><span class="b">${b}</span>`); e.style.top = (22 + i * 138) + 'px'; return e; });
    const rb = ocBox(w, X + 1024, 256, 800, 500, 'Registry · 共用对象', { icon: 'setting' });
    const slots = [['数据库 <span class="rq-mono">db</span>', 30, 24], ['设置 <span class="rq-mono">config</span>', 30, 104], ['语言 <span class="rq-mono">language</span>', 30, 184],
      ['计量 <span class="rq-mono">weight · length</span>', 30, 264], ['会话 <span class="rq-mono">session</span>', 440, 24], ['货币 <span class="rq-mono">currency</span>', 440, 104]]
      .map(([t, x, y]) => { chip(rb.bd, t, x, y, 'rq-slot'); return chip(rb.bd, t, x, y, 'rq-fill'); });
    const set = h('div', 'rq-set', rb.bd, 'config_admin_limit = 20<span class="l">每页显示条数</span>'); px(set, 30, 360);
    const fromSet = h('div', 'abs t-note', rb.bd, '↑ 这个值来自后台设置'); px(fromSet, 36, 420);
    const lang = h('div', 'abs callout hiy', rb.bd, '界面文字 ← 语言资源'); px(lang, 360, 180);
    const use = h('div', 'abs t-lbl-s', w, '→ 供后面的控制器、模型取用'); px(use, X + 1024, 778);
    const ov = ovl(w, X, 160, 1920, 760);
    const link = svgLine(ov, `M${X + 900},506 L${X + 1016},506`, 'res', { w: 5 });

    appear(hd, t0);
    slideDown(eb.el, t0 + 0.5, { d: 0.4 }); sfx('pop', t0 + 0.5, { g: 0.45 });
    slideDown(rb.el, t0 + 0.7, { d: 0.4 });
    slide(every, C('a8_1', '每次请求'), { y: 16, d: 0.35 }); sfx('thud', C('a8_1', '每次请求'), { g: 0.4 });
    const ts = [C('a8_1', '连接数据库', -0.1), C('a8_2', '读入设置', -0.1), C('a8_2', '对象', -0.3)];
    steps.forEach((e, i) => { slide(e, ts[i], { x: -30, d: 0.35 }); sfx('tick', ts[i], { g: 0.55 }); });
    classAt(steps[0], 'on', ts[0], ts[1]); classAt(steps[1], 'on', ts[1], ts[2]); classAt(steps[2], 'on', ts[2], C('a7_1', '设置', -0.1));
    // 槽位先是虚线，按旁白填实
    const tf = [ts[0] + 0.3, ts[1] + 0.3, C('a7_1', '语言'), C('a7_1', '计量'), ts[2] + 0.2, ts[2] + 0.4];
    slots.forEach((e, i) => slideDown(e, tf[i], { d: 0.25 }));
    [ts[0] + 0.3, ts[1] + 0.3, C('a7_1', '语言'), C('a7_1', '计量')].forEach((t) => sfx('pop', t, { g: 0.4 }));
    drawLine(link, C('a7_2', '后面的代码', -0.3), 0.35); fadeIn(use, C('a7_2', '后面的代码'), { d: 0.3 });
    // 只高亮当前用到的设置
    const tPg = C('a7_3', '每页', -0.1);
    hl(slots[1], tPg, C('a7_4', '语言资源', -0.2));
    slideDown(set, tPg + 0.1, { d: 0.35 }); sfx('pop', tPg + 0.1, { g: 0.5 });
    fadeIn(fromSet, C('a7_3', '后台设置', -0.1), { d: 0.3 }); sfx('tick', C('a7_3', '后台设置', -0.1), { g: 0.4 });
    const tLg = C('a7_4', '语言资源', -0.1);
    hl(slots[2], tLg, s.end); slide(lang, tLg, { y: 16, d: 0.35 }); sfx('tick', tLg, { g: 0.5 });

    tokP4 = [X + 120, 778];
    tokLegs.push([t0, 0.9, [tokP3, tokP4]]);

    keys.push([t0, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    keys.push([C('a8_1', '连接数据库', -0.6), { x: X + 800, y: 520, z: 1.15 }, 1.0, { sfx: false }]);
    drift(C('a8_1', '连接数据库', 0.45), C('a7_1', null, -0.5), 1.165);
    keys.push([C('a7_1', null, -0.45), { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);   // 拉回后静止：入口三步 + 共用对象一起可读
  }

  // ═════ 站 5 · B07 停在登录检查、权限检查之前（a9）═════
  {
    const X = SX(5);
    const t0 = mv('a7_4');
    const hd = h('div', 'abs t-h1', w, '查订单之前：两道检查'); px(hd, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const Y = 400, GH = 200;
    const entry = h('div', 'rq-gate', w, '<span class="a">入口</span><span class="b">index.php</span>'); px(entry, X + 96, Y, 280, GH);
    const g1 = h('div', 'rq-gate', w, '<span class="a">登录检查</span><span class="b">common/home/login</span>'); px(g1, X + 436, Y, 420, GH); g1.dataset.name = '登录检查';
    const g2 = h('div', 'rq-gate', w, '<span class="a">权限检查</span><span class="b">common/home/permission</span>'); px(g2, X + 916, Y, 420, GH); g2.dataset.name = '权限检查';
    const ctl = h('div', 'rq-gh', w, '订单控制器<br>查询订单（暂不进入）'); px(ctl, X + 1396, Y, 428, GH);
    const ov = ovl(w, X, 160, 1920, 760);
    const ln = svgLine(ov, `M${X + 376},${Y + 100} L${X + 1390},${Y + 100}`, 'dim', { w: 4, dash: '12 10' });
    const stop = h('div', 'rq-stop', w); px(stop, X + 420, Y - 116, 6, 108);
    const o1 = ocNotice(w, X + 96, 680, 820, 'warning', '没有登录 → 转去<b>登录页</b><br><span class="rq-mono" style="font-size:28px">common/login</span>');
    const o2 = ocNotice(w, X + 1004, 680, 820, 'warning', '没有权限 → 转去<b>「没有权限」页面</b><br><span style="font:600 28px Inter">Permission Denied!</span>');
    const d1 = svgLine(ov, `M${X + 646},${Y + GH} L${X + 646},676`, 'req', { w: 4 });
    const d2 = svgLine(ov, `M${X + 1126},${Y + GH} L${X + 1126},676`, 'req', { w: 4 });
    const pass = h('div', 'abs t-note', w, '两道都通过，才轮到订单控制器'); px(pass, X + 1396, 620);

    appear(hd, t0);
    wipe(entry, t0 + 0.5, { dir: 'l', d: 0.35 });
    drawLine(ln, t0 + 0.7, 0.5);
    fadeIn(ctl, C('a9_1', '订单控制器', -0.1), { d: 0.3 }); sfx('tick', C('a9_1', '订单控制器', -0.1), { g: 0.45 });
    const tG1 = C('a9_2', '登录', -0.1), tG2 = C('a9_2', '权限检查', -0.1);
    slideDown(g1, tG1, { d: 0.4 }); sfx('pop', tG1, { g: 0.5 });
    slideDown(g2, tG2, { d: 0.4 }); sfx('pop', tG2, { g: 0.5 });
    const tStop = tG1 + 0.55;
    wipe(stop, tStop + 0.5, { dir: 't', d: 0.25 }); sfx('thud', tStop + 0.5, { g: 0.4 });
    classAt(g1, 'on', tStop + 0.5, Infinity);
    classAt(g2, 'on', tG2 + 0.4, Infinity);
    const tO = C('a9_3', '登录页', -0.2), tO2 = C('a9_3', '拒绝访问', -0.2);
    drawLine(d1, tO - 0.2, 0.3); slideDown(o1, tO, { d: 0.4 }); sfx('error', tO, { g: 0.3 });
    drawLine(d2, tO2 - 0.2, 0.3); slideDown(o2, tO2, { d: 0.4 }); sfx('tick', tO2, { g: 0.5 });
    fadeIn(pass, tO2 + 0.5, { d: 0.4 });

    // 令牌：随镜头来到入口上方；说到「检查」时前进，停在登录检查前
    const tw = tok.offsetWidth;
    const pA = [X + 96, Y - 110], pB = [X + 420 - tw - 12, Y - 110];
    tokLegs.push([t0, 0.9, [tokP4, pA]]);
    tokLegs.push([tStop - 0.3, 0.8, [pA, pB]]);
    sfx('blip', tStop - 0.3, { g: 0.45 });

    keys.push([t0, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    drift(t0 + 0.95, C('a9_2', '登录', -0.5), 1.02);
    keys.push([C('a9_2', '登录', -0.45), { x: X + 760, y: 470, z: 1.14 }, 1.0, { sfx: false }]);
    drift(C('a9_2', '登录', 0.6), C('a9_3', null, -0.4), 1.15);
    keys.push([C('a9_3', null, -0.35), { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);   // 拉回后静止：两条结果一起可读
  }

  travel(tok, tokLegs);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, seqKeys(keys));
});
