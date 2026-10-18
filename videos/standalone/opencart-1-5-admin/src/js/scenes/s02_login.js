// 第 02 章 登录（login）：分镜 B08 B09 B10，段落 b1–b3b。
// 一个 world，五个站点横向排开（站心 x = 960 + 2100·i）：
//   站 0 B08 未登录 → 登录页；表单只填占位；POST 送到服务器的登录代码，再到用户表
//   站 1 B08 登录查询（示意 SQL）分四步出现：对象 / 账号条件 / 口令摘要条件 / 启用条件，每行贴中文作用
//   站 2 B09 新建账号：口令 + 盐 → 摘要，写进用户表；盐让相同口令得到不同存值
//   站 3 B09 登录时：同法计算 → 与保存的摘要比较；三项条件；另一条不匹配分支停在登录页
//   站 4 B10 通过后：服务器会话里只写入演示用户编号 1；下一次请求怎样带上身份（接第 03 章）
// 口令、摘要、盐一律是占位（REDACTION）；SQL 为脱敏示意（FACTS c2–c3、c11、c12、c15；S19-03）。
scene('login', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const mv = (id) => E(id, 0.03);                 // 站间移动：上一站最后一句说完才起步（末句画面完整可读），0.9 秒到站；各段关键帧显式、互不重叠
  const SX = (i) => 2100 * i;
  const PH = (t) => `<span class="lg-ph">‹${t}›</span>`;

  if (!document.getElementById('lg-style')) {
    const st = h('style', '', document.head);
    st.id = 'lg-style';
    st.textContent = `
#sc-login .lg-ph { font-family: "Mono", "Sans SC"; font-weight: 600; color: #7A300A; background: #FBEDE4; border: 2px dashed #C4561C; border-radius: 6px; padding: 0 8px; }
#sc-login .chip .lg-ph { font-size: 30px; }
#sc-login .lg-calc { position: absolute; border: 3px solid #003A88; border-radius: 10px; background: linear-gradient(180deg, #F4F8FC, #DCE7F2); text-align: center; padding: 8px 26px; }
#sc-login .lg-calc .a { font: 800 38px/1.2 "Inter", "Sans SC"; color: #003A88; }
#sc-login .lg-calc .b { font: 500 26px/1.3 "Sans SC", "Inter"; color: #4A5560; }
#sc-login .lg-op { position: absolute; font: 800 46px/62px "Inter", "Sans SC"; color: #1d1d1d; }
#sc-login .chip.ok { background: #EAF7D9; border-color: #5D9B2A; color: #3A6A12; box-shadow: inset 0 0 0 2px #5D9B2A; }
#sc-login .chip.bad { background: #FFE3E3; border-color: #C23B3B; color: #9A1C1C; box-shadow: inset 0 0 0 2px #C23B3B; }
#sc-login .chip.gh { background: #fff; border: 2px dashed #A9B4BE; color: #6E7781; }
#sc-login .lg-en { font-family: "Inter"; font-weight: 600; }
#sc-login .lg-q { position: absolute; font: 800 88px/1 "Inter", "Sans SC"; color: #C4561C; }
#sc-login .lg-sep { position: absolute; height: 0; border-top: 3px dashed #C9CED3; }
`;
  }

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  // 依次横排：按实际宽度把元素一个接一个摆好，返回最右端
  const row = (items, x, y, gap = 22) => { let cx = x; for (const e of items) { e.style.left = cx + 'px'; e.style.top = (y + (e._dy || 0)) + 'px'; cx += e.offsetWidth + gap; } return cx - gap; };
  const op = (txt, dy = 0) => { const e = h('div', 'lg-op', w, txt); e._dy = dy; return e; };
  const calcBox = (a, b) => { const e = h('div', 'lg-calc', w, `<div class="a">${a}</div>` + (b ? `<div class="b">${b}</div>` : '')); e.dataset.name = '摘要计算'; return e; };
  const R = (e) => box(e, w);
  const keys = [];
  const drift = (from, to_, z = 1.02) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z }, d, { ease: 'none', sfx: false }]); };
  // 关键帧按顺序排成互不重叠的段：某段的起点若早于上一段的终点，就推迟到上一段结束后；慢漂移段相应缩短，太短就略去
  const seqKeys = (ks) => { const out = []; let end = -Infinity; for (const [t, v, d, o = {}] of ks) { let tt = t, dd = d; if (tt < end + 0.02) { const sh = end + 0.02 - tt; tt += sh; if (o.ease === 'none') dd -= sh; } if (dd < 0.25) continue; out.push([tt, v, dd, o]); end = tt + dd; } return out; };

  // ═════ 站 0 · B08 未登录：先转到登录页；表单送到服务器（b1）═════
  {
    const br = zone(w, 'browser', 96, 180, 1040, 700, '浏览器');
    stamp(w, 970, 190, 'demo', '示意');
    const redirect = callout(w, 140, 318, '未登录：程序转去执行登录页 <span class="lg-en">common/login</span>', { kind: 'req' });
    const lb = ocBox(w, 156, 404, 920, 446, '请输入登录信息', { icon: 'user' });
    const l1 = h('div', 'abs t-lbl-s', lb.bd, '用户名'); px(l1, 30, 30);
    const in1 = ocInput(lb.bd, 190, 22, 640, '');
    const l2 = h('div', 'abs t-lbl-s', lb.bd, '口令'); px(l2, 30, 120);
    const in2 = ocInput(lb.bd, 190, 112, 640, '');
    const btn = ocButton(lb.bd, '登录', 190, 210, 'blue');
    const hint = h('div', 'abs t-note', lb.bd, '账号与口令均为示意占位'); px(hint, 330, 216);
    void l1; void l2;

    const srv = zone(w, 'server', 1260, 180, 564, 400, '服务器', 'Apache + PHP');
    const code1 = chip(w, '登录代码', 1290, 300, 'dark');
    const code2 = chip(w, '<span class="lg-en">user.php → login()</span>', 1290, 390, 'dark');
    const db = zone(w, 'db', 1260, 660, 564, 220, 'MySQL', '数据库');
    const tbl = chip(w, '用户表 <span class="lg-en">oc_user</span>', 1290, 790, 'dark');
    const ov = ovl(w, 1100, 160, 820, 760);
    const toDb = svgLine(ov, 'M1540,500 L1540,640', 'req', { w: 5 });
    const toDbLbl = h('div', 'abs callout req', w, '核对用户表'); px(toDbLbl, 1560, 540);

    const tOpen = c0 + 0.1;
    wipe(br.el, tOpen, { dir: 'l', d: 0.45 }); sfx('pop', tOpen, { g: 0.45 });
    typeText(br.addr, 'index.php?route=sale/order', C('b1_1', '订单页', -0.9), 34, { cursorUntil: C('b1_1', '订单页', 0.05) });
    spinner(w, 560, 560, C('b1_1', '订单页', 0.1), C('b1_1', '登录页', -0.05), { size: 64 });
    slideDown(lb.el, C('b1_1', '登录页'), { d: 0.4 }); sfx('pop', C('b1_1', '登录页'), { g: 0.55 });
    redirect.show(C('b1_1', '转到', -0.1));

    const tIn1 = C('b1_2', '账号'), tIn2 = C('b1_2', '口令');
    typeText(in1, 'demo_admin', tIn1, 16, { cursorUntil: tIn2 - 0.05 });
    typeText(in2, '••••', tIn2, 9, { cursorUntil: C('b1_2', '送到', -0.4) });
    const tPress = C('b1_2', '送到', -0.3);
    press(btn, tPress);
    wipe(srv.el, C('b1_2', '服务器', -0.6), { dir: 'l', d: 0.45 });
    slide(code1, C('b1_2', '服务器', -0.2), { x: 30, d: 0.35 }); slide(code2, C('b1_3', '登录代码', -0.1), { x: 30, d: 0.35 }); sfx('tick', C('b1_3', '登录代码', -0.1), { g: 0.5 });

    // POST 令牌：从「登录」按钮出发，进服务器停在登录代码旁
    const b0 = R(btn);
    const tok = token(w, 'POST 登录表单', 'req', 0, 0, '带着：账号 + 口令（示意）'); tok.setAttribute('data-overlap-ok', '');
    const tGo = tPress + 0.15, tArr = Math.max(tGo + 0.9, C('b1_2', '服务器', 0.1));
    appear(tok, tGo); vanish(tok, C('b1_3', '核对', -0.2));
    travel(tok, [[tGo, tArr - tGo, [[b0.x + 20, b0.y], [1150, b0.y], [1150, 470], [1500, 470]]]]);
    sfx('blip', tGo, { g: 0.55 });
    classAt(code1, 'on', tArr, E('b1_3', 0.3));

    wipe(db.el, C('b1_3', '核对', -0.5), { dir: 't', d: 0.4 });
    drawLine(toDb, C('b1_3', '核对'), 0.4); fadeIn(toDbLbl, C('b1_3', '核对', 0.2), { d: 0.3 });
    slam(tbl, C('b1_3', '用户表'), { from: 1.15, d: 0.35 }); sfx('thud', C('b1_3', '用户表'), { g: 0.45 });

    keys.push([c0 + 0.1, { z: 1.02 }, Math.max(0.5, C('b1_2', '填写', -0.35) - c0 - 0.2), { ease: 'none', sfx: false }]);
    keys.push([C('b1_2', '填写', -0.3), { x: 640, y: 600, z: 1.28 }, 1.0, { sfx: false }]);
    keys.push([C('b1_2', '服务器', -0.7), { x: 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
    drift(C('b1_2', '服务器', 0.05), mv('b1_3'));
  }

  // ═════ 站 1 · B08 登录查询：四步展开，逐行中文作用（b2）═════
  {
    const X = SX(1);
    const head = h('div', 'abs t-h1', w, '登录代码 → 用户表：一条查询'); px(head, X + 96, 176);
    stamp(w, X + 1460, 196, 'demo', '示意 · 口令与摘要不展示原值');
    const lines = [
      'SELECT * FROM oc_user',
      "WHERE username = 'demo_admin'",
      'AND (password = SHA1(CONCAT(salt,',
      "      SHA1(CONCAT(salt, SHA1('••••')))))",
      "  OR password = '‹旧 MD5 值›')",
      "AND status = '1'",
    ];
    const cb = codeBlock(w, X + 96, 290, 920, lines, { lang: 'sql', title: 'SQL（示意）' });
    const tArr = mv('b1_3') + 0.9;
    wipe(cb.el, mv('b1_3') + 0.3, { dir: 't', d: 0.45 });
    cb.lines.forEach((l) => vanish(l, 0));
    const s1 = C('b2_1', '旧版本'), s2 = C('b2_1', '账号条件'), s3 = C('b2_1', '口令计算'), s4 = C('b2_2', '数据库', -0.2);
    const steps = [[s1, [0]], [s2, [1]], [s3, [2, 3, 4]], [s4, [5]]];
    steps.forEach(([t, ls]) => ls.forEach((i, k) => { appear(cb.lines[i], t + k * 0.12); }));
    steps.forEach(([t], k) => sfx(k === 2 ? 'pop' : 'tick', t, { g: 0.5 }));
    cb.on(0, s1, s2); cb.on(1, s2, s3); cb.on(2, s3, s4); cb.on(3, s3, s4); cb.on(5, s4, E('b2_2', 0.3));
    cb.note(0, '① 对象：查<b>用户表</b>', s1 + 0.15);
    cb.note(1, '② 账号相同', s2 + 0.15);
    cb.note(2, '③ 口令 + 盐 → 摘要，与存值相同', s3 + 0.2);
    cb.note(4, '旧分支：2012 年 8 月前的 MD5 存值', s3 + 0.6);
    cb.note(5, '④ 账号已启用 <span class="lg-en">status</span>', s4 + 0.15);
    const who = callout(w, X + 1044, 712, '<span class="lg-en">SHA1</span> 计算与比较由 MySQL 完成', { kind: 'res' });
    who.show(C('b2_2', '比较', -0.3));
    const def = ocNotice(w, X + 96, 800, 1728, 'attention', '<b>SQL</b>：向数据库提出<b>查询</b>或<b>修改</b>要求的语句');
    slideDown(def, C('b2_3', '查询', -0.6), { d: 0.4 }); sfx('pop', C('b2_3', '查询', -0.6), { g: 0.5 });
    void tArr; void head;

    keys.push([mv('b1_3'), { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    drift(mv('b1_3') + 0.95, C('b2_1', '口令计算', -0.5));
    keys.push([C('b2_1', '口令计算', -0.45), { x: X + 900, y: 470, z: 1.12 }, 1.0, { sfx: false }]);
    drift(C('b2_1', '口令计算', 0.6), C('b2_3', '查询', -0.95), 1.13);
    keys.push([C('b2_3', '查询', -0.9), { x: X + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
    drift(C('b2_3', '查询', -0.15), mv('b2_3'));
  }

  // ═════ 站 2 · B09 新建账号：口令 + 盐 → 摘要，写进用户表（b3）═════
  {
    const X = SX(2);
    const head = h('div', 'abs t-h1', w, '新建账号时：保存的是摘要'); px(head, X + 96, 176);
    stamp(w, X + 1330, 196, 'demo', '示意 · 2012–2014 的历史实现');
    const lbl = h('div', 'abs t-lbl-s c-dim', w, '这次新建的账号'); px(lbl, X + 96, 270);
    const cPw = chip(w, '口令 ' + PH('••••'), 0, 0);
    const plus = op('+', 0);
    const cSalt = chip(w, '盐 <span class="lg-en">salt</span> ' + PH('9 个随机字符'), 0, 0);
    { const ww = cSalt.offsetWidth + 2; cSalt.innerHTML = '随机字符 ' + PH('9 个'); css(cSalt, { boxSizing: 'border-box', width: ww + 'px', textAlign: 'center', whiteSpace: 'nowrap' }); }   // 按改称「盐」后的宽度固定
    const calc = calcBox('<span class="lg-en">SHA1</span> × 3', '中间两次接上随机字符'); calc._dy = -18;
    const cDig = chip(w, '摘要 ' + PH('40 个字符'), 0, 0);
    const gapA = h('div', 'abs', w), gapB = h('div', 'abs', w); px(gapA, 0, 0, 60, 10); px(gapB, 0, 0, 60, 10);
    row([cPw, plus, cSalt, gapA, calc, gapB, cDig], X + 96, 336, 24);
    const ov = ovl(w, X, 160, 1920, 760);
    const ra = R(gapA), rb = R(gapB);
    const arA = svgLine(ov, `M${ra.x - 10},368 L${ra.r + 8},368`, 'req', { w: 5 });
    const arB = svgLine(ov, `M${rb.x - 10},368 L${rb.r + 8},368`, 'req', { w: 5 });

    const cols = [
      { label: '用户编号 <span class="lg-en">user_id</span>', w: 290, align: 'c' },
      { label: '账号 <span class="lg-en">username</span>', w: 330 },
      { label: '口令摘要 <span class="lg-en">password</span>', w: 420 },
      { label: '随机字符 <span class="lg-en">salt</span>', w: 330 },
      { label: '启用 <span class="lg-en">status</span>', w: 280, align: 'c' },
    ];
    const tb = ocTable(w, X + 96, 476, cols, [], { rowH: 64 });
    const tblLbl = h('div', 'abs t-src', w, '用户表 oc_user（示意行）'); px(tblLbl, X + 1500, 440);

    const sb = ocBox(w, X + 96, 660, 1728, 230, '盐：相同口令，也能得到不同的存储值', { icon: 'setting' });
    const r1 = h('div', 'abs t-data', sb.bd, `<b>demo_admin</b>　口令 ${PH('••••')}　+　盐 ${PH('甲')}　→　摘要 ${PH('甲')}`); px(r1, 26, 14);
    const r2 = h('div', 'abs t-data', sb.bd, `<b>另一账号</b>　口令 ${PH('••••')}　+　盐 ${PH('乙')}　→　摘要 ${PH('乙')}`); px(r2, 26, 74);
    const tag = h('div', 'abs oc-btn rust', sb.bd, '口令相同 → 存储值不同'); px(tag, 1260, 44);

    const tArr = mv('b2_3') + 0.9;
    appear(head, mv('b2_3')); fadeIn(lbl, tArr - 0.2, { d: 0.3 });
    slide(cPw, C('b3_1', '口令', -0.1), { x: -40, d: 0.35 }); sfx('pop', C('b3_1', '口令', -0.1), { g: 0.5 });
    fadeIn(plus, C('b3_1', '随机字符', -0.25), { d: 0.2 });
    slide(cSalt, C('b3_1', '随机字符'), { y: -30, d: 0.35 }); sfx('pop', C('b3_1', '随机字符'), { g: 0.5 });
    drawLine(arA, C('b3_1', '计算', -0.3), 0.3);
    slideDown(calc, C('b3_1', '计算'), { d: 0.4 }); sfx('tick', C('b3_1', '计算'), { g: 0.6 });
    drawLine(arB, C('b3_2', '保存', -0.4), 0.3);
    slam(cDig, C('b3_2', '保存'), { from: 1.2, d: 0.35 }); sfx('thud', C('b3_2', '保存'), { g: 0.45 });
    // 摘要落进用户表：先展开表头，再一行
    slideDown(tb.el, C('b3_2', '保存', 0.1), { d: 0.3 }); fadeIn(tblLbl, C('b3_2', '保存', 0.2));
    const tRow = C('b3_2', '摘要', 0.15);
    tb.addRow(['1', 'demo_admin', PH('摘要'), PH('9 个字符'), '1'], tRow, { d: 0.4 }); sfx('pop', tRow, { g: 0.5 });
    tb.mark(0, tRow + 0.3, C('b3_3', '盐', -0.1));
    // 第 3 句：随机字符改称「盐」
    const tSalt = C('b3_3', '盐');
    keyed(cSalt).at(tSalt, { html: '盐 <span class="lg-en">salt</span> ' + PH('9 个随机字符') });
    keyed(tb.head.children[3]).at(tSalt, { html: '盐 <span class="lg-en">salt</span>' });
    hl(cSalt, tSalt, E('b3_3', 0.3)); sfx('tick', tSalt, { g: 0.6 });
    slideDown(sb.el, C('b3_3', '盐', 0.25), { d: 0.4 });
    slide(r1, C('b3_3', '相同口令', -0.1), { x: -30, d: 0.35 });
    slide(r2, C('b3_3', '不同', -0.2), { x: -30, d: 0.35 }); sfx('pop', C('b3_3', '不同', -0.2), { g: 0.5 });
    slam(tag, C('b3_3', '存储值'), { from: 1.2, d: 0.35 }); sfx('thud', C('b3_3', '存储值'), { g: 0.4 });

    keys.push([mv('b2_3'), { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    keys.push([C('b3_1', '口令', -0.4), { x: X + 930, y: 430, z: 1.1 }, 1.0, { sfx: false }]);
    drift(C('b3_1', '口令', 0.65), C('b3_2', '保存', -0.05), 1.115);
    keys.push([C('b3_2', '保存'), { x: X + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
    drift(C('b3_2', '保存', 0.75), mv('b3_3'));
  }

  // ═════ 站 3 · B09 登录时：同法计算 → 比较；三项条件；不匹配分支（b3a）═════
  {
    const X = SX(3);
    const head = h('div', 'abs t-h1', w, '登录时：按相同方法计算，再比较'); px(head, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const lbl = h('div', 'abs t-lbl-s c-dim', w, '输入正确口令'); px(lbl, X + 96, 270);
    const cIn = chip(w, '输入的口令 ' + PH('••••'), 0, 0);
    const plus = op('+');
    const cSalt = chip(w, '表中的盐 ' + PH('甲'), 0, 0);
    const gapA = h('div', 'abs', w), gapB = h('div', 'abs', w); px(gapA, 0, 0, 50, 10); px(gapB, 0, 0, 50, 10);
    const calc = calcBox('<span class="lg-en">SHA1</span> × 3'); calc._dy = -6;
    const cNew = chip(w, '新算出 ' + PH('摘要甲'), 0, 0);
    row([cIn, plus, cSalt, gapA, calc, gapB, cNew], X + 96, 330, 22);
    const rn = R(cNew);
    const cOld = chip(w, '保存的 ' + PH('摘要甲'), rn.x, 446);
    const eq = h('div', 'abs t-lbl', w, '＝ 相同'); css(eq, { color: '#7A300A' }); px(eq, rn.r + 26, 410);
    const ov = ovl(w, X, 160, 1920, 760);
    const ra = R(gapA), rb = R(gapB);
    const arA = svgLine(ov, `M${ra.x - 8},362 L${ra.r + 8},362`, 'req', { w: 5 });
    const arB = svgLine(ov, `M${rb.x - 8},362 L${rb.r + 8},362`, 'req', { w: 5 });
    const brk = svgLine(ov, `M${rn.r + 8},362 L${rn.r + 16},362 L${rn.r + 16},476 L${rn.r + 8},476`, 'ink', { w: 3, arrow: false });

    // 按打勾后的最终宽度固定芯片宽度，换字时不互相挤压
    const ck = ['账号', '口令摘要', '启用状态'].map((t) => { const e = chip(w, t + ' √', 0, 0, 'gh'); const ww = e.offsetWidth + 2; e.innerHTML = t; css(e, { boxSizing: 'border-box', width: ww + 'px', textAlign: 'center', whiteSpace: 'nowrap' }); return e; });
    const ckL = h('div', 'abs t-lbl-s', w, '三项都符合：'); px(ckL, X + 96, 566);
    const ckEnd = row(ck, X + 330, 560, 18);
    const pass = ocNotice(w, ckEnd + 40, 556, 520, 'success', '通过：登录成功');
    const sep = h('div', 'lg-sep', w); px(sep, X + 96, 668, 1728);

    const fL = h('div', 'abs t-lbl-s', w, '口令输错时：'); css(fL, { color: '#7A300A' }); px(fL, X + 96, 704);
    const fNew = chip(w, '新算出 ' + PH('摘要乙'), 0, 0, 'bad');
    const ne = op('≠');
    const fOld = chip(w, '保存的 ' + PH('摘要甲'), 0, 0);
    row([fNew, ne, fOld], X + 330, 696, 26);
    const warn = ocNotice(w, X + 96, 796, 1728, 'warning', '不符合 → 留在登录页并提示错误：<span class="lg-en">No match for Username and/or Password.</span>（账号或口令不符）');

    const tArr = mv('b3_3') + 0.9;
    appear(head, mv('b3_3')); fadeIn(lbl, tArr - 0.2, { d: 0.3 });
    slide(cIn, C('b3a_1', '输入的口令', -0.1), { x: -40, d: 0.35 }); sfx('pop', C('b3a_1', '输入的口令', -0.1), { g: 0.5 });
    fadeIn(plus, C('b3a_1', '相同方法', -0.25), { d: 0.2 });
    slide(cSalt, C('b3a_1', '相同方法'), { y: -30, d: 0.35 }); sfx('pop', C('b3a_1', '相同方法'), { g: 0.45 });
    drawLine(arA, C('b3a_1', '计算', -0.3), 0.3);
    slideDown(calc, C('b3a_1', '计算'), { d: 0.35 }); sfx('tick', C('b3a_1', '计算'), { g: 0.6 });
    drawLine(arB, C('b3a_1', '计算', 0.4), 0.3);
    slide(cNew, C('b3a_1', '计算', 0.7), { x: -30, d: 0.35 }); sfx('pop', C('b3a_1', '计算', 0.7), { g: 0.5 });
    slide(cOld, C('b3a_2', '保存的摘要', -0.1), { y: 30, d: 0.35 }); sfx('pop', C('b3a_2', '保存的摘要', -0.1), { g: 0.5 });
    drawLine(brk, C('b3a_2', '比较', -0.15), 0.3);
    slam(eq, C('b3a_2', '比较'), { from: 1.2, d: 0.35 }); sfx('thud', C('b3a_2', '比较'), { g: 0.45 });
    hl(cNew, C('b3a_2', '比较'), E('b3a_2', 0.3)); hl(cOld, C('b3a_2', '比较'), E('b3a_2', 0.3));

    fadeIn(ckL, C('b3a_3', null, -0.3), { d: 0.3 });
    ck.forEach((c, i) => fadeIn(c, C('b3a_3', null, -0.25 + i * 0.1), { d: 0.25 }));
    [['账号', 0, '账号 √'], ['口令', 1, '口令摘要 √'], ['启用状态', 2, '启用状态 √']].forEach(([wd, i, txt]) => {
      const t = C('b3a_3', wd);
      keyed(ck[i]).at(t, { html: txt, cls: 'chip ok' }); sfx('tick', t, { g: 0.6 });
    });
    slideDown(pass, C('b3a_3', '通过', -0.1), { d: 0.4 }); sfx('chime', C('b3a_3', '通过'), { g: 0.4 });

    wipe(sep, C('b3a_4', null, -0.35), { dir: 'l', d: 0.4 });
    fadeIn(fL, C('b3a_4', '不符合', -0.2), { d: 0.25 });
    slide(fNew, C('b3a_4', '不符合', -0.1), { x: -30, d: 0.35 });
    slide(fOld, C('b3a_4', '不符合', 0.05), { x: -30, d: 0.35 });
    slam(ne, C('b3a_4', '不符合', 0.3), { from: 1.3, d: 0.35 }); sfx('error', C('b3a_4', '不符合', 0.3), { g: 0.4 });
    slideDown(warn, C('b3a_4', '提示错误', -0.4), { d: 0.4 });

    keys.push([mv('b3_3'), { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    keys.push([C('b3a_1', '输入的口令', -0.5), { x: X + 950, y: 440, z: 1.08 }, 1.0, { sfx: false }]);   // 整行计算 + 比较都在画内
    drift(C('b3a_1', '输入的口令', 0.55), C('b3a_3', null, -0.5), 1.09);
    keys.push([C('b3a_3', null, -0.45), { x: X + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);   // 拉回后静止：两条分支一起可读
  }

  // ═════ 站 4 · B10 通过后：服务器会话里只写入用户编号（b3b）═════
  {
    const X = SX(4);
    const head = h('div', 'abs t-h1', w, '通过之后：用户编号写进会话'); px(head, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const br = zone(w, 'browser', X + 96, 290, 620, 560, '浏览器');
    br.addr.innerHTML = '';
    const mini = h('div', 'abs', w); px(mini, X + 99, 418, 614, 429); css(mini, { overflow: 'hidden' });
    const fr = adminFrame(mini, { w: 614, h: 429, menu: ['控制台', '销售', '系统'], active: 0, who: false });
    const brLbl = h('div', 'abs t-note', w, '已登录的后台页面'); px(brLbl, X + 130, 620);
    const srv = zone(w, 'server', X + 900, 290, 924, 560, '服务器', 'PHP 会话 · 内容留在服务器');
    const sLbl = h('div', 'abs callout hiy', w, '服务器：会话内容'); px(sLbl, X + 940, 410);
    const sf = sessionFile(w, X + 940, 500, 470, '会话内容（示意）', ['user_id = 1  <span class="lab">用户编号</span>']);
    const youAre = callout(w, X + 1450, 520, '你是谁 →<br>用户编号 1', { kind: 'hiy' });
    const nextTok = token(w, '下一次请求：订单页', 'req', 0, 0, '身份怎样带过去？'); nextTok.setAttribute('data-overlap-ok', '');
    const q = h('div', 'lg-q', w, '？'); px(q, X + 772, 600);
    const ov = ovl(w, X, 160, 1920, 760);
    const dl = svgLine(ov, `M${X + 720},${720} L${X + 892},${720}`, 'req', { w: 5, dash: '14 10' });

    const tArr = mv('b3a_4') + 0.9;
    appear(head, mv('b3a_4'));
    wipe(br.el, tArr - 0.4, { dir: 'l', d: 0.4 }); fadeIn(mini, tArr - 0.1, { d: 0.3 }); fadeIn(brLbl, tArr + 0.1, { d: 0.3 });
    wipe(srv.el, C('b3b_1', '程序', -0.2), { dir: 'r', d: 0.45 });
    fadeIn(sLbl, C('b3b_1', '会话', -0.4), { d: 0.3 });
    slideDown(sf.el, C('b3b_1', '会话', -0.2), { d: 0.35 });
    const tId = C('b3b_1', '用户编号');
    typeText(sf.lines[0], 'user_id = 1  <span class="lab">用户编号</span>', tId, 18, { cursorUntil: tId + 1.2 });
    hl(sf.lines[0], tId + 0.3, E('b3b_3', 0.6)); sfx('thud', tId + 0.5, { g: 0.4 });
    youAre.show(C('b3b_2', '你是谁', -0.1));
    // 下一次请求：令牌从「销售」菜单出发，停在两侧之间
    const m1 = R(fr.menu[1]);
    const tGo = C('b3b_3', '订单页', -0.3);
    appear(nextTok, tGo); sfx('blip', tGo, { g: 0.5 });
    travel(nextTok, [[tGo, 0.9, [[m1.x - 20, m1.b + 120], [X + 300, 730]]]]);
    drawLine(dl, C('b3b_3', '下一次请求', -0.3), 0.4);
    slam(q, C('b3b_3', '下一次请求'), { from: 1.3, d: 0.35 }); sfx('pop', C('b3b_3', '下一次请求'), { g: 0.5 });
    void fr;

    keys.push([mv('b3a_4'), { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    keys.push([C('b3b_1', '用户编号', -0.5), { x: X + 1300, y: 560, z: 1.3 }, 1.0, { sfx: false }]);
    drift(C('b3b_1', '用户编号', 0.55), C('b3b_3', null, -0.35), 1.32);
    keys.push([C('b3b_3', null, -0.3), { x: X + 960, y: 560, z: 1 }, 0.7, { sfx: false }]);
    drift(C('b3b_3', null, 0.45), s.end - 0.1);
  }

  cam.track(s.start, { x: 960, y: 540, z: 1 }, seqKeys(keys));
});
