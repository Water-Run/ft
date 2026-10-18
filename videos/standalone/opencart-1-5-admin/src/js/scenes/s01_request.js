// 第 01 章（request）：分镜 B03 B44 B04 B05 B06 B07，段落 a1 a2 a2a a4 a5 a6 a8 a7 a9。
// 未完成：目前只做了站 1（B03：浏览器 / Apache+PHP / MySQL 三个区域，请求令牌从浏览器进入 PHP）。
// TODO：B44 PHP 5.3 / ≥8.1 对照、B04/B05 route → 控制器 → 模型 / 模板、B06 共用服务、B07 登录 / 权限检查。
scene('request', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const st = document.createElement('style');
  st.textContent = `
#sc-request .rq-bracket{position:absolute;border:3px dashed #8E9AA6;border-radius:18px}
#sc-request .rq-bracket.rq-on{border:3px solid #C4561C}
#sc-request .rq-linux{position:absolute;border-radius:8px;background:linear-gradient(180deg,#4A5058,#2C3036);border:2px solid #1E2125;color:#fff;font:700 34px/76px "Inter","Sans SC";padding-left:24px}
#sc-request .chip.rq-ph{background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.4);color:rgba(255,255,255,.55)}
#sc-request .rq-role{position:absolute;font:500 28px/1.3 "Sans SC";color:#D6E4F0}`;
  document.head.appendChild(st);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);

  // ═════ 站 1 · B03 浏览器 / 服务器一侧（Apache + PHP、MySQL、Linux）═════
  const head = h('div', 'abs t-h2', w, '一次请求经过哪些地方'); px(head, 96, 172);
  const br = zone(w, 'browser', 96, 250, 560, 560, '浏览器');
  br.addr.innerHTML = 'index.php?route=sale/order';
  const brRole = h('div', 'abs t-lbl-s', w, '显示页面 · 发出点击和填写'); px(brRole, 96, 828);
  const bracket = h('div', 'rq-bracket', w); px(bracket, 716, 212, 1108, 660); bracket.dataset.name = '服务器一侧';
  const brLbl = h('div', 'abs t-lbl c-req', w, '服务器一侧'); px(brLbl, 744, 228);
  const srv = zone(w, 'server', 750, 300, 600, 400, 'Apache + PHP', '网页服务器 · 业务程序');
  const apache = chip(srv.el, 'Apache', 24, 120, 'rq-ph');
  const php = chip(srv.el, 'PHP', 300, 120, 'rq-ph');
  const apR = h('div', 'rq-role', srv.el, '接收网页请求'); px(apR, 24, 190);
  const phR = h('div', 'rq-role', srv.el, '执行业务代码'); px(phR, 300, 190);
  const db = zone(w, 'db', 1420, 320, 380, 380, 'MySQL', '数据库');
  const dbc = chip(db.el, '保存和查询数据', 24, 130, 'rq-ph');
  const linux = h('div', 'rq-linux', w, 'Linux · 操作系统'); px(linux, 750, 730, 1050, 80);
  const tok = token(w, 'route=sale/order', 'req', 130, 384, '请求：打开订单列表');

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
  keyed(php).at(C('a2a_1', '五点三'), { html: 'PHP 5.3.10' });
  keyed(db.el.querySelector('.zl')).at(C('a2a_1', '五点五'), { html: 'MySQL 5.5.62' });
  const tA = C('a2_3', 'Apache', -0.4);
  travel(tok, [
    [tA, 0.9, [[130, 384], [690, 384], [774, 600]]],
    [Math.max(tA + 1, C('a2_4', 'PHP', -0.3)), 0.6, [[774, 600], [1000, 600]]],
  ]);
  sfx('blip', tA, { g: 0.5 });

  // ═════ 镜头 ═════
  const tP = C('a2_1', 'Linux', -0.5), tR = C('a2_5', 'MySQL', -0.5);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, Math.max(0.5, tP - c0 - 0.25), { ease: 'none', sfx: false }],
    [tP, { x: 1290, y: 560, z: 1.22 }, 1.1, { sfx: false }],
    [null, { z: 1.25 }, Math.max(0.5, tR - tP - 1.3), { ease: 'none', sfx: false }],
    [tR, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.04 }, Math.max(1, s.end - tR - 1.1), { ease: 'none', sfx: false }],
  ]);
});
