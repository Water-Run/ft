// 第 03 章 会话（session）：分镜 B11 B12 B13 B14，段落 s1–s6。本片指定的代表段。
// 一个 world，三个站点横向排开（站 i 的左边界 = 2100·i）：
//   站 0 B11 B12 浏览器（左）只存「会话编号」，服务器（右）存「会话内容」；编号随请求回来 → 找到文件 → 读 user_id → 查用户表；
//               销毁会话后，同样的请求找不到内容，被送回登录页（浏览器里的编号还在：FACTS 第 11 行）
//   站 1 B13    网址里的令牌与会话里的令牌并排比较：一致 → 继续；只有 Cookie、缺令牌 → 停在检查处「Invalid token session」
//   站 2 B14    浏览历史与访问日志里留下带令牌的网址（只放占位）；收在 会话 √ 令牌 √ 权限 → 下一章
// 会话编号、令牌一律是明确的占位（REDACTION）；事实：FACTS d2–d13、e1–e5、e11–e12，L10 会话设置，S19-03。
scene('session', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const SX = (i) => 2100 * i;
  const PH = (t) => `<span class="ss-ph">‹${t}›</span>`;

  h('style', '', document.head, `
#sc-session .ss-ph { font-family: "Mono", "Sans SC"; font-weight: 600; color: #7A300A; background: #FBEDE4; border: 2px dashed #C4561C; border-radius: 6px; padding: 0 8px; }
#sc-session .ss-ck { position: absolute; background: #FFFDF2; border: 2px solid #B9A66A; border-radius: 6px; }
#sc-session * { font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0; }
#sc-session .ss-ck.ss-on, #sc-session .sess.ss-on, #sc-session .sess.ss-on2 { box-shadow: inset 0 0 0 5px #C4561C; }
#sc-session .ss-ck > .ckh { position: absolute; left: 0; right: 0; top: 0; height: 56px; background: linear-gradient(180deg, #F7EFCF, #EADFB4); border-bottom: 2px solid #B9A66A; border-radius: 4px 4px 0 0; }
#sc-session .ss-ck .tag { position: absolute; left: 16px; top: 10px; padding: 0 12px; height: 34px; font: 700 24px/34px "Inter"; color: #5B4A12; background: #fff; border: 2px solid #B9A66A; border-radius: 17px; }
#sc-session .ss-ck .nm { position: absolute; left: 130px; top: 8px; font: 700 34px/40px "Sans SC", "Inter"; color: #3D3210; }
#sc-session .ss-ck .row { position: absolute; left: 18px; top: 74px; font: 600 30px/44px "Mono", "Sans SC"; color: #1d1d1d; white-space: nowrap; }
#sc-session .ss-ck .row .ss-ph { font-size: 28px; }
#sc-session .ss-auto { position: absolute; padding: 2px 12px; font: 600 26px/1.3 "Sans SC"; color: #073A5C; background: #E3EEF7; border: 2px solid #0F6193; border-radius: 6px; }
#sc-session .ss-ghost { position: absolute; border: 3px dashed #9AA4AE; border-radius: 4px 22px 4px 4px; background: rgba(255,255,255,.06); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
#sc-session .ss-ghost .a { font: 700 36px/1.2 "Sans SC"; color: #E8EEF3; }
#sc-session .ss-ghost .b { font: 600 26px/1.2 "Mono"; color: #BFD6E8; }
#sc-session .ss-ok { position: absolute; padding: 4px 16px; font: 700 30px/1.3 "Sans SC"; color: #3A6A12; background: #EAF7D9; border: 2px solid #5D9B2A; border-radius: 6px; }
#sc-session .ss-dirn { position: absolute; font: 500 24px/1.2 "Sans SC", "Mono"; color: #BFD6E8; }
#sc-session .ss-gap { position: absolute; font: 600 26px/1.3 "Sans SC"; color: #7A300A; background: #fff; padding: 2px 8px; border: 2px solid #C4561C; border-radius: 6px; }
#sc-session .zone.browser > .addr { font-size: 28px; height: 52px; line-height: 48px; white-space: nowrap; }
#sc-session .ss-tkp { display: inline-block; padding: 0 4px; border-radius: 4px; }
#sc-session .ss-tkp.gone { text-decoration: line-through 3px #C23B3B; color: #9AA4AE; }
#sc-session .ss-tkp.gone .ss-ph { color: #9AA4AE; border-color: #B8C0C8; background: #F3F4F6; }
#sc-session .ss-tkp.hi { background: #FFFFCB; box-shadow: 0 0 0 3px #C4561C; }
#sc-session .ss-cmp { position: absolute; padding: 8px 20px; height: 60px; font: 600 32px/40px "Sans SC", "Inter"; color: #1d1d1d; background: #fff; border: 2px solid #9FB3C4; border-radius: 8px; white-space: nowrap; }
#sc-session .ss-cmp.miss { color: #4A5560; border-style: dashed; }
#sc-session .ss-op { position: absolute; font: 800 46px/60px "Inter", "Sans SC"; color: #1d1d1d; }
#sc-session .ss-op.bad { color: #C23B3B; }
#sc-session .ss-win { position: absolute; background: #fff; border: 2px solid #9AA4AE; border-radius: 8px 8px 0 0; }
#sc-session .ss-win > .wh { height: 56px; padding: 0 20px; font: 700 30px/56px "Sans SC", "Inter"; color: #2C3E50; background: linear-gradient(180deg, #F4F6F8, #D7DDE3); border-bottom: 2px solid #A7B1BB; border-radius: 6px 6px 0 0; }
#sc-session .ss-win .wr { position: absolute; left: 18px; right: 18px; height: 50px; font: 500 24px/50px "Mono", "Sans SC"; color: #333; white-space: nowrap; border-bottom: 1px solid #E3E7EB; }
#sc-session .ss-win .wr .ss-ph { font-size: 22px; padding: 0 4px; }
#sc-session .ss-win .wr .k { color: #7A300A; font-weight: 700; }
#sc-session .ss-pill { position: absolute; height: 64px; padding: 0 26px; font: 700 34px/60px "Sans SC", "Inter"; border-radius: 32px; border: 2px solid #9AA4AE; color: #555; background: #F4F6F8; white-space: nowrap; }
#sc-session .ss-pill.ok { color: #3A6A12; background: #EAF7D9; border-color: #5D9B2A; }
#sc-session .ss-pill.next { color: #7A300A; background: #FBEDE4; border-color: #C4561C; border-style: dashed; }
#sc-session .ss-pill.next.on { background: #FFFFCB; border-style: solid; box-shadow: 0 0 0 3px #C4561C; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const keys = [];
  const drift = (from, to_, z) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z }, d, { ease: 'none', sfx: false }]); };
  const cookieCard = (x, y, wd, hh, name) => {
    const el = h('div', 'ss-ck', w); px(el, x, y, wd, hh); el.dataset.name = 'Cookie';
    h('div', 'ckh', el, `<span class="tag">Cookie</span><span class="nm">${name}</span>`);
    const row = h('div', 'row', el, `PHPSESSID = ${PH('会话编号（示意）')}`);
    return { el, row };
  };

  // ═════ 站 0 · B11 B12 编号在浏览器，内容在服务器；销毁后要重新登录（s1、s2、s3）═════
  const P0 = {};
  {
    const head = h('div', 'abs t-h1', w, '会话：把新请求接到先前的登录上'); px(head, 96, 176);
    stamp(w, 1730, 196, 'demo', '示意');

    // 浏览器：地址栏 + 一页已登录的后台 + Cookie
    const br = zone(w, 'browser', 96, 290, 640, 590, '浏览器');
    br.addr.innerHTML = 'admin/index.php?route=sale/order&amp;…';
    const home = ocBox(w, 116, 420, 600, 190, '控制台', { icon: 'report' });
    const homeT = h('div', 'abs t-note', home.bd, '已登录 · 演示管理员'); css(homeT, { left: '26px', top: '14px' });
    const link = h('div', 'abs t-data', home.bd, '<u style="color:#0F6193">销售 › 订单</u>'); css(link, { left: '26px', top: '60px' });
    const login = ocBox(w, 116, 420, 600, 190, '登录', { icon: 'user' });
    const lgA = h('div', 'abs t-data', login.bd, '请输入登录信息'); css(lgA, { left: '26px', top: '8px', fontWeight: '700' });
    const lgB = h('div', 'abs t-src', login.bd, 'Please enter your login details.'); css(lgB, { left: '26px', top: '58px', fontFamily: 'Inter' });
    const ck = cookieCard(116, 640, 600, 222, '浏览器：会话编号');
    const ckNote = h('div', 'abs t-src wrap', ck.el, '会话销毁后，浏览器里的编号不一定同时删除'); css(ckNote, { left: '18px', top: '138px', width: '560px', color: '#6B5A1E' });

    // 服务器：会话文件 + 用户表查询
    const srv = zone(w, 'server', 1080, 290, 744, 590, '服务器');
    const sLbl = h('div', 'abs callout hiy', w, '服务器：会话内容'); px(sLbl, 1480, 300);
    const dirN = h('div', 'ss-dirn', w, '演示环境：会话文件在 /var/lib/php5'); px(dirN, 1106, 362);
    const sf = sessionFile(w, 1110, 404, 560, `sess_${PH('会话编号（示意）')}`, [
      'currency = USD   <span class="lab">货币</span>',
      'user_id  = 1     <span class="lab">用户编号</span>',
      `token    = ${PH('令牌A')}   <span class="lab">令牌</span>`,
    ]);
    css(sf.el.querySelector('.sh'), { fontSize: '24px' });
    const ghost = h('div', 'ss-ghost', w, '<div class="a">会话已销毁</div><div class="b">session_destroy()</div>'); px(ghost, 1110, 404, 560, 222);
    const q = codeBlock(w, 1110, 648, 560, ["SELECT * FROM oc_user", "WHERE user_id = '1'", "AND status = '1'"], { lang: 'sql', title: '再查用户表' });
    const ok = h('div', 'ss-ok', w, '有效 √'); px(ok, 1684, 760);
    const miss = ocNotice(w, 1110, 660, 690, 'warning', '找不到会话内容<br>→ 受保护页面要求重新登录');

    // 编号从 Cookie 回到服务器：一条锈橙虚线连到同名文件
    const ov = ovl(w, 0, 160, 1920, 760);
    const lnk = svgLine(ov, 'M716,718 L900,718 L900,428 L1104,428', 'req', { w: 4, dash: '12 9' });
    const lnkL = h('div', 'ss-gap', w, '按编号<br>找文件'); px(lnkL, 760, 560);

    const cur = cursor(w, 420, 600);
    const tok = token(w, '新请求 · 订单页', 'req', 0, 0, '身份怎样接上？'); tok.setAttribute('data-overlap-ok', '');
    const ckc = chip(w, 'PHPSESSID', 0, 0); css(ckc, { font: '700 26px/1.2 "Mono"', borderColor: '#C4561C', color: '#7A300A', background: '#FBEDE4' }); ckc.setAttribute('data-overlap-ok', '');
    const tok2 = token(w, '新请求 · 订单页', 'req', 0, 0, '只带着编号'); tok2.setAttribute('data-overlap-ok', '');
    const back = token(w, '登录页', 'res', 0, 0); back.setAttribute('data-overlap-ok', '');

    // 时刻
    const tClick = C('s1_1', '新的请求', -0.5);
    const tSess = C('s1_2', '会话');
    const tCk = C('s1_3', '会话编号', -0.1);
    const tBring = C('s1_4', '带回来', -0.4);
    const tFile = C('s2_1', '文件', -0.3);
    const tGo = C('s2_2', '带回编号', -0.3);
    const tFind = C('s2_2', '找到对应文件');
    const tUid = C('s2_2', '用户编号');
    const tUser = C('s2_3', '用户表', -0.3);
    const tOk = C('s2_3', '有效');
    const tA = C('s3_1', '编号', -0.4), tB = C('s3_2', '服务器', -0.3);
    const tKill = C('s3_3', '销毁', -0.2);
    const tReq2 = Math.max(tKill + 0.7, E('s3_3', -1.0)), tMiss = tReq2 + 0.85, tBack = tMiss + 0.3, tLoad = tBack + 0.75;
    Object.assign(P0, { tA, tKill, tLoad });

    // 建立：两侧一起在场（承接第 02 章末站）
    appear(head, c0 + 0.1); sfx('pop', c0 + 0.12, { g: 0.4 });
    wipe(br.el, c0 + 0.15, { dir: 'l', d: 0.45 });
    slideDown(home.el, c0 + 0.45, { d: 0.4 });
    wipe(srv.el, c0 + 0.3, { dir: 'r', d: 0.45 });
    vanish(login.el, 0);
    // s1_1 新的点击 = 新请求
    appear(cur, c0 + 0.6);
    travel(cur, [[c0 + 0.7, Math.max(0.4, tClick - c0 - 0.9), [[420, 600], [228, 520]]]]);
    click(cur, tClick);
    vanish(cur, tClick + 0.6);
    appear(tok, tClick + 0.15); sfx('blip', tClick + 0.15, { g: 0.5 });
    travel(tok, [
      [tClick + 0.15, 0.8, [[240, 520], [480, 300], [770, 300]]],
      [tGo, 0.9, [[770, 300], [900, 300], [900, 352], [1110, 352]]],
    ]);
    vanish(tok, tGo + 0.9);
    // s1_2 服务器要把它关联到登录：标签先出现
    fadeIn(sLbl, tSess, { d: 0.3 }); sfx('tick', tSess, { g: 0.4 });
    // s1_3 浏览器里的 Cookie：会话编号
    slideDown(ck.el, tCk, { d: 0.4 }); sfx('pop', tCk, { g: 0.55 });
    hl(ck.row, C('s1_3', 'Cookie'), tBring + 0.9);
    // s1_4 编号随请求带回来：PHPSESSID 从 Cookie 贴到请求上
    appear(ckc, tBring);
    travel(ckc, [[tBring, 0.8, [[150, 708], [520, 520], [800, 362]]]]);
    vanish(ckc, tBring + 0.85);
    keyed(tok).at(tBring + 0.85, { html: '新请求 · 订单页<span class="tl">带着 Cookie：会话编号</span>' });
    sfx('tick', tBring + 0.85, { g: 0.5 });
    // s2_1 服务器上的会话文件
    fadeIn(dirN, tFile - 0.2, { d: 0.3 });
    slideDown(sf.el, tFile, { d: 0.4 }); sfx('pop', tFile, { g: 0.55 });
    // s2_2 找到对应文件，读到用户编号
    drawLine(lnk, tGo, 0.9); fadeIn(lnkL, tGo + 0.5, { d: 0.3 });
    classAt(sf.el, 'ss-on', tFind, tUser);
    sfx('blip', tGo + 0.9, { g: 0.45, p: -0.2 });
    hl(sf.lines[1], tUid, E('s2_3', 0.3));
    // s2_3 再查用户表
    slideDown(q.el, tUser, { d: 0.4 }); sfx('pop', tUser, { g: 0.45 });
    q.on(1, tUser + 0.4, E('s2_3', 0.3));
    slam(ok, tOk, { from: 1.25, d: 0.3 }); sfx('tick', tOk, { g: 0.55 });
    // s3_1 浏览器只存寻找会话的编号；s3_2 身份在服务器
    classAt(ck.el, 'ss-on', tA, tB);
    classAt(sf.el, 'ss-on2', tB, E('s3_2', 0.3));
    // s3_3 销毁会话：文件没了，浏览器里的编号还在
    fadeOut(q.el, tKill - 0.1, { d: 0.3 }); fadeOut(ok, tKill - 0.1, { d: 0.3 });
    slideUp(sf.el, tKill, { d: 0.4 }); sfx('thud', tKill + 0.2, { g: 0.5 });
    fadeIn(ghost, tKill + 0.35, { d: 0.3 });
    fadeIn(ckNote, tKill + 0.6, { d: 0.4 });
    // s3_4 下一次请求找不到内容 → 回到登录页
    appear(tok2, tReq2); sfx('blip', tReq2, { g: 0.5 });
    travel(tok2, [[tReq2, 0.85, [[240, 520], [480, 300], [770, 300]]]]);
    slideDown(miss, tMiss, { d: 0.4 }); sfx('error', tMiss, { g: 0.4 });
    appear(back, tBack); vanish(back, tLoad);
    travel(back, [[tBack, 0.75, [[1110, 560], [760, 400], [460, 470]]]]);
    sfx('blip', tBack, { g: 0.45, p: -0.3 });
    reloadFlash(w, 116, 420, 600, 190, tLoad - 0.1, { d: 0.45 });
    vanish(home.el, tLoad); appear(login.el, tLoad);
    keyed(br.addr).at(tLoad, { html: 'admin/index.php?route=common/login' });

    // 镜头
    const tIn = C('s1_3', '会话编号', -0.6), tPan = C('s2_1', '服务器', -0.5), tOut = C('s3_1', null, -0.4);
    keys.push([c0 + 0.1, { z: 1.02 }, Math.max(0.5, tIn - c0 - 0.15), { ease: 'none', sfx: false }]);
    keys.push([tIn, { x: 640, y: 680, z: 1.28 }, 1.0, { sfx: false }]);
    drift(tIn + 1.05, tPan, 1.3);
    keys.push([tPan, { x: 1300, y: 560, z: 1.2 }, 1.0, { g: 0.3 }]);
    drift(tPan + 1.05, tOut, 1.22);
    keys.push([tOut, { x: 960, y: 560, z: 1 }, 0.8, { sfx: false }]);
  }

  // ═════ 站 1 · B13 网址里的令牌 vs 会话里的令牌：一致继续，缺令牌停下（s4、s5）═════
  const X1 = SX(1);
  const tMv1 = C('s4_1', '令牌', -0.6);
  {
    const X = X1;
    const head = h('div', 'abs t-h1', w, '令牌：请求还要带回一个匹配值'); px(head, X + 96, 176);
    stamp(w, X + 1530, 196, 'demo', '示意 · 重新登录后');

    const br = zone(w, 'browser', X + 96, 290, 1000, 270, '浏览器');
    br.addr.innerHTML = 'admin/index.php?route=sale/order<span class="ss-tkp">&amp;token=' + PH('令牌A') + '</span>';
    const tkp = br.addr.querySelector('.ss-tkp');
    const ck = cookieCard(X + 116, 418, 620, 128, '浏览器：会话编号');
    const auto = h('div', 'ss-auto', w, '浏览器自动附上'); px(auto, X + 760, 500);

    const srv = zone(w, 'server', X + 1180, 290, 644, 270, '服务器');
    const sLbl = h('div', 'abs callout hiy', w, '服务器：会话内容'); px(sLbl, X + 1500, 300);
    const sf = sessionFile(w, X + 1210, 372, 580, `sess_${PH('会话编号（示意）')}`, [
      'user_id = 1   <span class="lab">用户编号</span>',
      `token   = ${PH('令牌A')}   <span class="lab">令牌</span>`,
    ]);
    css(sf.el.querySelector('.sh'), { fontSize: '24px' });

    const cmp = ocBox(w, X + 96, 590, 1728, 310, '订单页的令牌比较', { icon: 'code' });
    const R1 = 676, R2 = 772;
    const a1 = h('div', 'ss-cmp', w, `请求中的令牌 ${PH('令牌A')}`); px(a1, X + 126, R1);
    const e1 = h('div', 'ss-op', w, '＝'); px(e1, X + 540, R1);
    const b1 = h('div', 'ss-cmp', w, `会话里的令牌 ${PH('令牌A')}`); px(b1, X + 604, R1);
    const ok1 = ocNotice(w, X + 1060, R1 - 6, 744, 'success', '一致：继续打开订单页');
    const a2 = h('div', 'ss-cmp miss', w, '请求中的令牌（缺少）'); px(a2, X + 126, R2);
    const e2 = h('div', 'ss-op bad', w, '≠'); px(e2, X + 540, R2);
    const b2 = h('div', 'ss-cmp', w, `会话里的令牌 ${PH('令牌A')}`); px(b2, X + 604, R2);
    const no2 = ocNotice(w, X + 1060, R2 - 6, 744, 'warning', '<span style="font:600 28px/1.35 Inter">Invalid token session. Please login again.</span><br>不一致：停在这里，回到登录页');
    const lnkA = callout(w, X + 800, 414, '链接里的令牌', { to: [X + 860, 398], kind: 'req' });
    const only = token(w, '只有 Cookie 的请求', 'req', 0, 0); only.setAttribute('data-overlap-ok', '');

    const tSessTk = C('s4_1', '会话里');
    const tLink = C('s4_2', '链接', -0.2);
    const tBox = C('s4_3', '订单页', -0.3);
    const tA1 = C('s4_3', '请求中的令牌'), tB1 = C('s4_3', '会话里的令牌'), tEq = C('s4_3', '比较');
    const tCk = C('s5_1', 'Cookie', -0.1), tTk = C('s5_2', '匹配值', -0.4);
    const tOnly = C('s5_3', '只有', -0.2), tNo = C('s5_3', '不知道令牌');
    const tDel = C('s5_4', '删掉');

    appear(head, tMv1);
    wipe(br.el, tMv1 + 0.2, { dir: 'l', d: 0.45 }); wipe(srv.el, tMv1 + 0.3, { dir: 'r', d: 0.45 });
    fadeIn(ck.el, tMv1 + 0.5, { d: 0.3 }); fadeIn(sLbl, tMv1 + 0.6, { d: 0.3 }); fadeIn(sf.el, tMv1 + 0.6, { d: 0.3 });
    vanish(tkp, 0);
    // s4_1 令牌的一份在会话里
    hl(sf.lines[1], tSessTk, E('s4_3', 0.2)); sfx('pop', tSessTk, { g: 0.5 });
    // s4_2 另一份附在后台链接上
    wipe(tkp, tLink, { dir: 'l', d: 0.4 }); sfx('key', tLink, { g: 0.5 });
    lnkA.show(tLink + 0.3);
    // s4_3 两份并排比较
    slideDown(cmp.el, tBox, { d: 0.4 }); sfx('tick', tBox, { g: 0.45 });
    slide(a1, tA1, { x: -40, d: 0.35 }); sfx('pop', tA1, { g: 0.45 });
    slide(b1, tB1, { x: 40, d: 0.35 }); sfx('pop', tB1, { g: 0.45 });
    slam(e1, tEq - 0.3, { from: 1.4, d: 0.3 }); sfx('tick', tEq - 0.3, { g: 0.55 });
    slideDown(ok1, tEq + 0.1, { d: 0.35 }); sfx('chime', tEq + 0.15, { g: 0.35 });
    // s5_1 Cookie 由浏览器自动附上；s5_2 令牌要额外带回匹配值
    classAt(ck.el, 'ss-on', tCk, tTk); slide(auto, tCk + 0.1, { x: -30, d: 0.35 }); sfx('tick', tCk + 0.1, { g: 0.45 });
    hl(tkp, tTk, tOnly);
    // s5_3 删掉链接里的令牌：只有 Cookie 的请求 → 停在检查处
    classAt(tkp, 'gone', tOnly);
    appear(only, tOnly + 0.1); sfx('blip', tOnly + 0.1, { g: 0.5 });
    travel(only, [[tOnly + 0.1, 1.0, [[X + 360, 360], [X + 760, 566], [X + 140, R2]]]]);
    vanish(only, tNo - 0.2);
    slide(a2, tNo - 0.2, { x: -40, d: 0.35 }); sfx('pop', tNo - 0.2, { g: 0.45 });
    slide(b2, tNo, { x: 40, d: 0.35 });
    slam(e2, tNo + 0.35, { from: 1.4, d: 0.3 }); sfx('error', tNo + 0.4, { g: 0.4 });
    slideDown(no2, tNo + 0.7, { d: 0.4 });
    // s5_4 结论停留：缺令牌的那一行
    classAt(a2, 'hi', tDel, E('s5_4', 0.3));

    keys.push([tMv1, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tPush = tSessTk - 0.5, tPull = tBox - 0.4;
    keys.push([tPush, { x: X + 960, y: 470, z: 1.1 }, 0.9, { sfx: false }]);
    drift(tPush + 0.95, tPull, 1.115);
    keys.push([tPull, { x: X + 960, y: 560, z: 1 }, 0.8, { sfx: false }]);
  }

  // ═════ 站 2 · B14 网址里的令牌会进历史和访问日志；会话 √ 令牌 √ → 权限（s6）═════
  const X2 = SX(2);
  const tMv2 = E('s5_4', -0.3);
  {
    const X = X2;
    const head = h('div', 'abs t-h1', w, '令牌写在网址里，也会被记下来'); px(head, X + 96, 176);
    stamp(w, X + 1530, 196, 'demo', '示意 · 令牌为占位');
    const tk = `<span class="k">&amp;token=</span>${PH('令牌')}`;
    const win = (x, title, rows) => {
      const el = h('div', 'ss-win', w); px(el, x, 290, 840, 300);
      h('div', 'wh', el, title);
      const rs = rows.map((r, i) => { const e = h('div', 'wr', el, r); css(e, { top: 72 + i * 56 + 'px' }); return e; });
      return { el, rs };
    };
    const hist = win(X + 96, '浏览历史', [
      'admin/index.php?route=common/home' + tk,
      'admin/index.php?route=sale/order' + tk,
      'admin/index.php?route=sale/order' + tk + '&amp;page=2',
      'admin/index.php?route=sale/order&amp;order_id=7' + tk,
    ]);
    const log = win(X + 984, '访问日志（Apache）', [
      'GET /admin/index.php?route=common/home' + tk,
      'GET /admin/index.php?route=sale/order' + tk,
      'GET /admin/index.php?route=sale/order' + tk + '…',
      'GET /admin/index.php?route=sale/order' + tk + '…',
    ]);
    hist.rs.forEach((r) => css(r, { fontSize: '23px' }));
    log.rs.forEach((r) => css(r, { fontSize: '23px' }));
    const hN = h('div', 'abs t-lbl-s', w, '整段网址被记下，令牌也在其中'); px(hN, X + 96, 606);
    const lN = h('div', 'abs t-lbl-s', w, '演示环境：访问日志里 12 行带 token='); px(lN, X + 984, 606);
    const old = ocNotice(w, X + 96, 690, 840, 'attention', '这是 1.5 旧后台的实现方式：<br>令牌放在网址里');
    const chk = ocBox(w, X + 984, 670, 840, 228, '进入订单页之前', { icon: 'user' });
    const pills = [['会话 √', 'ok', 30, '认出是谁'], ['令牌 √', 'ok', 290, '请求带回匹配值'], ['权限 →', 'next', 550, '第 04 章']].map(([t, k, dx, sub]) => {
      const p = h('div', 'ss-pill ' + k, chk.bd, t); css(p, { left: dx + 'px', top: '6px' });
      const sb = h('div', 'abs t-note', chk.bd, sub); css(sb, { left: dx + 6 + 'px', top: '82px' });
      return { p, sb };
    });

    const tHist = C('s6_1', '历史', -0.4), tLog = C('s6_1', '访问日志', -0.3);
    const tOld = C('s6_2', '旧后台', -0.4);
    const tChk = E('s6_2', -0.2), tS = C('s6_3', '身份'), tR = C('s6_3', '请求检查'), tP = C('s6_3', '权限');

    appear(head, tMv2);
    slideDown(hist.el, tHist, { d: 0.4 }); sfx('pop', tHist, { g: 0.5 });
    hist.rs.forEach((r, i) => fadeIn(r, tHist + 0.3 + i * 0.12, { d: 0.2 }));
    fadeIn(hN, tHist + 0.8, { d: 0.3 });
    slideDown(log.el, tLog, { d: 0.4 }); sfx('pop', tLog, { g: 0.5 });
    log.rs.forEach((r, i) => fadeIn(r, tLog + 0.3 + i * 0.12, { d: 0.2 }));
    fadeIn(lN, tLog + 0.8, { d: 0.3 });
    slideDown(old, tOld, { d: 0.4 }); sfx('tick', tOld, { g: 0.5 });
    slideDown(chk.el, tChk, { d: 0.4 });
    pills.forEach(({ p, sb }, i) => { fadeIn(p, tChk + 0.3 + i * 0.1, { d: 0.25 }); fadeIn(sb, tChk + 0.35 + i * 0.1, { d: 0.25 }); });
    sfx('tick', tS, { g: 0.5 }); sfx('tick', tR, { g: 0.5 });
    classAt(pills[2].p, 'on', tP); sfx('pop', tP, { g: 0.5 });
    // 「√」在旁白说到时才落下：先显示为待查，再换成 √
    keyed(pills[0].p).at(0, { html: '会话' }).at(tS, { html: '会话 √' });
    keyed(pills[1].p).at(0, { html: '令牌' }).at(tR, { html: '令牌 √' });
    keyed(pills[0].p).at(0, { cls: 'ss-pill' }).at(tS, { cls: 'ss-pill ok' });
    keyed(pills[1].p).at(0, { cls: 'ss-pill' }).at(tR, { cls: 'ss-pill ok' });

    keys.push([tMv2, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tIn = tHist + 0.2, tBack = tOld - 0.3;
    keys.push([tIn, { x: X + 960, y: 450, z: 1.1 }, 1.0, { sfx: false }]);
    drift(tIn + 1.05, tBack, 1.115);
    keys.push([tBack, { x: X + 960, y: 560, z: 1 }, 0.8, { sfx: false }]);
    drift(tBack + 0.85, s.end - 0.05, 1.02);
  }

  // 站 0 末尾与站 1 内的慢推（填在移动之间）
  // 镜头关键帧按时间排序后一次登记
  const k0 = keys.filter((k) => k[0] < tMv1);
  const lastK = k0[k0.length - 1];
  const fill = (from, to_, z) => { const d = to_ - from - 0.05; return d > 0.3 ? [[from, { z }, d, { ease: 'none', sfx: false }]] : []; };
  const all = [...k0, ...fill(lastK[0] + lastK[2] + 0.05, tMv1, 1.025), ...keys.filter((k) => k[0] >= tMv1 && k[0] < tMv2)];
  const k1last = all[all.length - 1];
  all.push(...fill(k1last[0] + k1last[2] + 0.05, tMv2, 1.02), ...keys.filter((k) => k[0] >= tMv2));
  all.sort((a, b) => a[0] - b[0]);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, all);
  void P0;
});
