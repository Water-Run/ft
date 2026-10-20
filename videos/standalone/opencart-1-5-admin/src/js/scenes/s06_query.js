// 第 06 章 列表怎样查出来（query）：分镜 B23 B24 B25 B45 B26，段落 c1–c10。
// 一个 world，六个站点横向排开（站 i 的左边界 = 2100·i）：
//   站 0 B23 筛选行与页码 → 请求 → 控制器算 start = (2−1)×20 = 20、limit = 20 → 订单模型
//   站 1 B23 46 张示意订单按 order_id 倒序：跳过 20、取 20（第 2 页 = 订单 26–7，七号订单是末行）；语句四个分区占位后填实
//   站 2 B24 另一条 COUNT 查询 → 46 → 3 页；三个页码各对应 LIMIT 0,20 / 20,20 / 40,20
//   站 3 B25 示意 PHP：$sql .= 逐段拼接；文本 escape()、数值 (int)（不作全局安全结论）
//   站 4 B25 B45 模型 → 驱动 → MySQL；记录钢蓝返回进 PHP 数组；驱动标注 mysql → MySQLi（4.1.0.4），模型与数据库位置不变
//   站 5 B26 状态名称清单走缓存（未命中 → 查表 → 写入 → 命中；改名清除）；订单记录每次查询；本章结果汇总
// 事实：FACTS g2–g8、g9、g13、g14、g16–g19，S19-08、S19-09、S19-10，L12–L14，C19-05；语句原文见 lab/out_13_trace.json（order_list_p2）。
scene('query', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const SX = (i) => 2100 * i;
  const PH = (t) => `<span class="qy-ph">‹${t}›</span>`;

  h('style', '', document.head, `
#sc-query .qy-ph { font-family: "Mono", "Sans SC"; font-weight: 600; color: #7A300A; background: #FBEDE4; border: 2px dashed #C4561C; border-radius: 6px; padding: 0 8px; }
#sc-query .qy-pager { position: absolute; font: 600 30px/40px "Inter", "Sans SC"; color: #1d1d1d; white-space: nowrap; }
#sc-query .qy-pager u { color: #0F6193; text-decoration: underline; text-underline-offset: 4px; margin: 0 10px; }
#sc-query .qy-pager b { display: inline-block; margin: 0 10px; padding: 0 10px; border-radius: 4px; }
#sc-query .qy-pager b.hi { background: #FFFFCB; box-shadow: 0 0 0 3px #C4561C; }
#sc-query .qy-dk { position: absolute; font: 500 26px/1.25 "Mono", "Sans SC"; color: #BFD6E8; white-space: nowrap; }
#sc-query .qy-sql { position: absolute; background: #FCFCFA; border: 2px solid #DBDBDB; border-radius: 10px 10px 0 0; }
#sc-query .qy-sql > .ct { height: 52px; padding: 0 20px; font: 600 26px/52px "Sans SC", "Mono"; color: #555; background: linear-gradient(180deg, #F6F6F6, #EAEAEA); border-bottom: 2px solid #DBDBDB; border-radius: 8px 8px 0 0; }
#sc-query .qy-row { position: absolute; left: 0; right: 0; height: 64px; }
#sc-query .qy-row .lb { position: absolute; left: 20px; top: 10px; width: 170px; height: 44px; font: 700 30px/44px "Sans SC"; color: #003A88; background: #E9F0F7; border-radius: 6px; text-align: center; }
#sc-query .qy-row .ph { position: absolute; left: 214px; top: 8px; height: 48px; width: 560px; border: 3px dashed #B8C0C8; border-radius: 6px; font: 600 26px/42px "Sans SC"; color: #5B6670; padding-left: 16px; }
#sc-query .qy-row .tx { position: absolute; left: 214px; top: 8px; height: 48px; font: 500 30px/48px "Mono"; color: #1d1d1d; white-space: nowrap; padding: 0 12px; border-radius: 4px; }
#sc-query .qy-row .tx .k { color: #003A88; font-weight: 700; } #sc-query .qy-row .tx .s { color: #8A3A00; }
#sc-query .qy-row .tx.hi { background: #FFFFCB; box-shadow: inset 6px 0 0 #C4561C; }
#sc-query .qy-cell { position: absolute; width: 35px; height: 50px; border: 2px solid #B8C0C8; background: #fff; font: 700 22px/46px "Inter"; text-align: center; color: #333; border-radius: 3px; }
#sc-query .qy-cell.skip { background: #EEF0F2; color: #5B6670; border-color: #D3D8DD; }
#sc-query .qy-cell.take { background: #FBEDE4; border-color: #C4561C; color: #7A300A; }
#sc-query .qy-cell.back { background: #0F6193; border-color: #073A5C; color: #fff; }
#sc-query .qy-cell.me { box-shadow: 0 0 0 4px #FFFFCB, 0 0 0 7px #C4561C; }
#sc-query .qy-br { position: absolute; font: 700 32px/1.2 "Sans SC", "Inter"; white-space: nowrap; }
#sc-query .qy-br.skip { color: #6B7785; } #sc-query .qy-br.take { color: #7A300A; } #sc-query .qy-br.p3 { color: #5B6670; font-size: 26px; }
#sc-query .qy-big { position: absolute; font: 800 52px/1.2 "Inter", "Sans SC"; color: #1d1d1d; white-space: nowrap; }
#sc-query .qy-pg { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-radius: 8px; padding: 14px 20px; }
#sc-query .qy-pg.now { border: 3px solid #C4561C; background: #FFFDF2; }
#sc-query .qy-pg .a { font: 700 36px/1.2 "Sans SC"; color: #003A88; }
#sc-query .qy-pg .b { margin-top: 6px; font: 500 30px/1.3 "Sans SC"; color: #444; }
#sc-query .qy-pg .c { margin-top: 8px; font: 700 32px/1.3 "Mono"; color: #7A300A; }
#sc-query .qy-ex { position: absolute; padding: 10px 18px; background: #fff; border: 2px solid #C9D2DA; border-radius: 8px; font: 600 30px/1.3 "Sans SC", "Mono"; white-space: nowrap; color: #1d1d1d; }
#sc-query .qy-ex .m { font-family: "Mono"; color: #7A300A; }
#sc-query .qy-badge { position: absolute; height: 52px; padding: 0 18px; border-radius: 6px; font: 700 28px/48px "Sans SC", "Inter"; border: 2px solid #9AA4AE; color: #4A5560; background: #F4F6F8; white-space: nowrap; }
#sc-query .qy-badge.on { border-color: #C4561C; color: #7A300A; background: #FFFFCB; box-shadow: 0 0 0 3px #C4561C; }
#sc-query .qy-drv { font: 800 44px/1.2 "Mono"; color: #003A88; }
#sc-query .qy-drvs { margin-top: 8px; font: 500 28px/1.3 "Sans SC", "Mono"; color: #444; white-space: nowrap; }
#sc-query * { font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0; }
#sc-query .oc-box.qy-on { box-shadow: inset 0 0 0 5px #C4561C; background: #FFFFF0; }
#sc-query .code.qy-on { box-shadow: inset 0 0 0 5px #0F6193; }
#sc-query .qy-arr { position: absolute; font: 600 26px/1.25 "Sans SC", "Mono"; padding: 2px 10px; background: #fff; border-radius: 6px; white-space: nowrap; }
#sc-query .qy-arr.req { color: #7A300A; border: 2px solid #C4561C; } #sc-query .qy-arr.res { color: #073A5C; border: 2px solid #0F6193; }
#sc-query .qy-cache { position: absolute; border: 3px dashed #9AA4AE; border-radius: 4px 22px 4px 4px; background: #FAFBFC; }
#sc-query .qy-cache.full { border-style: solid; border-color: #7C8B97; }
#sc-query .qy-cache .hd { height: 50px; padding: 0 16px; font: 600 24px/50px "Mono"; color: #fff; background: #4A5A66; border-radius: 2px 20px 0 0; white-space: nowrap; }
#sc-query .qy-cache .hd .qy-ph { font-size: 22px; padding: 0 4px; color: #fff; background: rgba(255,255,255,.15); border-color: #E5A07A; }
#sc-query .qy-cache .ln { padding: 0 16px; font: 500 28px/44px "Sans SC", "Mono"; color: #1d1d1d; white-space: nowrap; }
#sc-query .qy-cache .emp { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font: 700 32px/1.2 "Sans SC"; color: #5B6670; }
#sc-query .qy-st { position: absolute; padding: 4px 14px; border-radius: 6px; font: 700 28px/1.3 "Sans SC"; white-space: nowrap; }
#sc-query .qy-st.miss { color: #7A300A; background: #FBEDE4; border: 2px solid #C4561C; }
#sc-query .qy-st.hit { color: #3A6A12; background: #EAF7D9; border: 2px solid #5D9B2A; }
#sc-query .qy-st.clr { color: #9A1C1C; background: #FFE3E3; border: 2px solid #C23B3B; }
#sc-query .qy-li { position: absolute; left: 26px; right: 26px; height: 46px; font: 500 30px/46px "Sans SC"; color: #1d1d1d; padding-left: 12px; border-radius: 4px; }
#sc-query .qy-sum { position: absolute; height: 64px; padding: 0 22px; border-radius: 8px; font: 700 30px/60px "Sans SC", "Inter"; color: #3A6A12; background: #EAF7D9; border: 2px solid #5D9B2A; white-space: nowrap; }
#sc-query .qy-next { position: absolute; height: 64px; padding: 0 22px; border-radius: 8px; font: 700 30px/58px "Sans SC"; color: #7A300A; background: #fff; border: 3px dashed #C4561C; white-space: nowrap; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const keys = [];
  const drift = (from, to_, z) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z }, d, { ease: 'none', sfx: false }]); };
  const R = (e) => box(e, w);
  const lbl = (x, y, html, kind = 'req') => { const e = h('div', 'qy-arr ' + kind, w, html); px(e, x, y); return e; };

  // 站间移动时刻
  const mv1 = C('c2_2', null, -0.55);
  const mv2 = E('c3_2', -0.3);
  const mv3 = C('c7_1', '字符串', -0.7);
  const mv4 = E('c7_3', -0.3);
  const mv5 = E('c8a_4', -0.3);

  // ═════ 站 0 · 筛选行与页码 → 控制器算出起点和条数（c1、c2_1）═════
  {
    const head = h('div', 'abs t-h1', w, '列表的输入：筛选条件和页码'); px(head, 96, 176);
    stamp(w, 1730, 196, 'demo', '示意');
    const list = ocBox(w, 96, 270, 1728, 340, '订单', { icon: 'order', buttons: [['筛选', 'blue']] });
    const tb = ocTable(w, 122, 372, [
      { label: '订单编号', w: 200, align: 'r' }, { label: '顾客', w: 420 }, { label: '状态', w: 300 }, { label: '金额', w: 220, align: 'r' }, { label: '添加日期', w: 300 },
    ], [['26', '演示顾客 02', '待处理', '225.00', '…']], { filter: true, rowH: 54 });
    const pager = h('div', 'qy-pager', w, '<u>|‹</u><u>‹</u><u>1</u><b>2</b><u>3</u><u>›</u><u>›|</u>'); px(pager, 122, 560);
    const pg2 = pager.querySelector('b');
    const pgN = h('div', 'abs t-note', w, '当前：第 2 页'); px(pgN, 520, 562);

    const srv = zone(w, 'server', 96, 650, 1728, 240, '服务器 · PHP');
    const ctl = chip(w, '控制器', 126, 722, 'dark');
    const ctlN = h('div', 'qy-dk', w, 'sale/order.php'); px(ctlN, 126, 792);
    const calc = codeBlock(w, 420, 676, 600, ['page  = 2', 'limit = 20', 'start = (2 − 1) × 20 = 20'], { lang: 'text' });
    const ov = ovl(w, 0, 160, 1920, 760);
    const toM = svgLine(ov, 'M1320,748 L1474,748', 'req', { w: 5 });
    const mdl = chip(w, '订单模型', 1480, 722, 'dark');
    const mdlN = h('div', 'qy-dk', w, 'start 20 · limit 20'); px(mdlN, 1480, 792);
    const cur = cursor(w, 900, 520);
    const tok = token(w, 'page=2', 'req', 0, 0, '请求：第 2 页 · 筛选为空'); tok.setAttribute('data-overlap-ok', '');

    const tF = C('c1_1', '筛选条件', -0.2), tP = C('c1_1', '页码', -0.1), tIn = C('c1_1', '输入', -0.2);
    const tCtl = C('c1_2', '控制器', -0.2), tRead = C('c1_2', '读取');
    const tStart = C('c1_3', '从哪条开始', -0.2), tLim = C('c1_3', '最多', -0.2), tM = C('c1_3', '订单模型', -0.3);
    const tPer = C('c2_1', '二十条', -0.4);

    appear(head, c0 + 0.1); sfx('pop', c0 + 0.12, { g: 0.4 });
    slideDown(list.el, c0 + 0.2, { d: 0.4 });
    fadeIn(tb.el, c0 + 0.45, { d: 0.3 }); fadeIn(pager, c0 + 0.55, { d: 0.3 });
    // c1_1 筛选条件与页码 = 请求的输入
    classAt(tb.filt, 'hi', tF, tP); press(list.btns[0], tF + 0.1);
    appear(cur, c0 + 0.6);
    const p2 = R(pg2);
    travel(cur, [[c0 + 0.7, Math.max(0.4, tP - c0 - 0.85), [[900, 520], [p2.cx - 6, p2.cy - 4]]]]);
    click(cur, tP); vanish(cur, tP + 0.7);
    classAt(pg2, 'hi', tP, E('c1_3', 0.2)); fadeIn(pgN, tP + 0.2, { d: 0.3 });
    appear(tok, tIn); sfx('blip', tIn, { g: 0.5 });
    travel(tok, [[tIn, 0.9, [[p2.x - 40, 600], [p2.x - 40, 700], [520, 700]]]]);   // 停在区域标题右侧，不压「服务器 · PHP」
    vanish(tok, tCtl + 0.1);
    // c1_2 控制器读取
    wipe(srv.el, tIn + 0.4, { dir: 't', d: 0.45 });
    slide(ctl, tCtl, { x: -30, d: 0.35 }); sfx('pop', tCtl, { g: 0.5 }); fadeIn(ctlN, tCtl + 0.2, { d: 0.3 });
    slideDown(calc.el, tRead - 0.1, { d: 0.35 });
    vanish(calc.lines[1], 0); vanish(calc.lines[2], 0);
    calc.on(0, tRead, tStart);
    // c1_3 起点、条数 → 交给订单模型
    appear(calc.lines[2], tStart); calc.on(2, tStart, tLim); sfx('key', tStart, { g: 0.45 });
    appear(calc.lines[1], tLim); calc.on(1, tLim, E('c2_1', 0.2)); sfx('key', tLim, { g: 0.45 });
    const n1 = calc.note(0, '网址里的页码', tRead + 0.2, { dx: 24 });
    const n2 = calc.note(1, '设置：每页 20 条', tPer, { dx: 24 });
    const n3 = calc.note(2, '跳过前 20 条', tStart + 0.4, { dx: 24 });
    void n1; void n2; void n3;
    drawLine(toM, tM - 0.2, 0.3);
    slide(mdl, tM, { x: -30, d: 0.35 }); sfx('pop', tM, { g: 0.5 }); fadeIn(mdlN, tM + 0.2, { d: 0.3 });

    const tPush = tCtl - 0.4;
    keys.push([c0 + 0.1, { z: 1.02 }, Math.max(0.5, tPush - c0 - 0.15), { ease: 'none', sfx: false }]);
    keys.push([tPush, { x: 960, y: 610, z: 1.03 }, 0.9, { sfx: false }]);
    drift(tPush + 0.95, mv1, 1.04);
  }

  // ═════ 站 1 · B23 跳过 20、取 20；语句四个分区（c2_2、c2_3、c3）═════
  {
    const X = SX(1);
    const head = h('div', 'abs t-h1', w, '第 2 页：LIMIT 20,20'); px(head, X + 96, 176);
    stamp(w, X + 1560, 196, 'demo', '示意 · 46 张演示订单');
    const sq = h('div', 'qy-sql', w); px(sq, X + 96, 270, 1728, 330);
    h('div', 'ct', sq, '订单模型组成的查询（第 2 页实际语句，节选）');
    const RW = [
      ['查询对象', '从订单表取哪些列', '<span class="k">SELECT</span> o.order_id, …, o.total, o.date_added <span class="k">FROM</span> `oc_order` o'],
      ['条件', '筛选哪些订单', "<span class=\"k\">WHERE</span> o.order_status_id &gt; <span class=\"s\">'0'</span>"],
      ['排序', '按什么顺序', '<span class="k">ORDER BY</span> o.order_id <span class="k">DESC</span>'],
      ['范围', '取出哪一段', '<span class="k">LIMIT</span> 20,20'],
    ].map(([lb, ph, tx], i) => {
      const r = h('div', 'qy-row', sq); css(r, { top: 66 + i * 64 + 'px' });
      h('div', 'lb', r, lb);
      const p = h('div', 'ph', r, '‹' + ph + '›');
      const t = h('div', 'tx', r, tx);
      return { r, p, t };
    });

    const cap = h('div', 'abs t-lbl-s', w, '46 张订单按 order_id（订单编号）从大到小排好'); px(cap, X + 96, 628);
    const X0 = X + 96, CW = 37.5, CY = 684;
    const cells = [];
    for (let i = 0; i < 46; i++) { const c = h('div', 'qy-cell', w, String(46 - i)); px(c, Math.round(X0 + i * CW), CY); cells.push(c); }
    const ov = ovl(w, X, 160, 1920, 760);
    const brk = (i0, i1, col) => svgLine(ov, `M${X0 + i0 * CW + 2},${CY + 60} L${X0 + i0 * CW + 2},${CY + 72} L${X0 + i1 * CW - 4},${CY + 72} L${X0 + i1 * CW - 4},${CY + 60}`, col, { w: 4, arrow: false });
    const bSkip = brk(0, 20, '#8E9AA6'), bTake = brk(20, 40, 'req'), bP3 = brk(40, 46, '#B8C0C8');
    const lSkip = h('div', 'qy-br skip', w, '跳过 20（订单 46–27）'); px(lSkip, X0 + 200, CY + 82);
    const lTake = h('div', 'qy-br take', w, '取 20（订单 26–7）'); px(lTake, X0 + 20 * CW + 220, CY + 82);
    const lP3 = h('div', 'qy-br p3', w, '第 3 页'); px(lP3, X0 + 40 * CW + 60, CY + 86);
    const me = callout(w, X + 1150, 840, '七号演示订单：第 2 页最后一行', { to: [X0 + 39 * CW + 18, CY + 52], kind: 'hiy' });

    const tL = C('c2_2', '第二页', -0.2), tSk = C('c2_3', '跳过', -0.1), tTk = C('c2_3', '再取', -0.1);
    const tBk = C('c2_4', '返回', -0.2), tMe = C('c2_4', '记录');
    const tObj = C('c3_1', '订单表', -0.3), tCond = C('c3_1', '筛选', -0.3), tOrd = C('c3_1', '排序', -0.2), tRng = C('c3_2', '范围', -0.2);

    appear(head, mv1);
    slideDown(sq, mv1 + 0.3, { d: 0.4 });
    RW.forEach(({ t }) => vanish(t, 0));
    // c2_2 先填「范围」：LIMIT 20,20
    vanish(RW[3].p, tL); wipe(RW[3].t, tL, { dir: 'l', d: 0.4 }); sfx('key', tL, { g: 0.5 });
    classAt(RW[3].t, 'hi', tL, tTk + 0.8);
    fadeIn(cap, mv1 + 0.6, { d: 0.3 });
    cells.forEach((c, i) => {
      fadeIn(c, mv1 + 0.7 + i * 0.012, { d: 0.15 });
      const base = 'qy-cell' + (i === 39 ? ' me0' : '');
      const k = keyed(c).at(0, { cls: base });
      if (i < 20) k.at(tSk + i * 0.02, { cls: 'qy-cell skip' });
      else if (i < 40) { k.at(tTk + (i - 20) * 0.02, { cls: 'qy-cell take' }); k.at(tBk + (i - 20) * 0.03, { cls: 'qy-cell back' + (i === 39 ? ' me' : '') }); }
    });
    drawLine(bSkip, tSk, 0.4); fadeIn(lSkip, tSk + 0.2, { d: 0.3 }); sfx('tick', tSk, { g: 0.5 });
    drawLine(bTake, tTk, 0.4); fadeIn(lTake, tTk + 0.2, { d: 0.3 }); sfx('tick', tTk, { g: 0.5 });
    drawLine(bP3, tTk + 0.5, 0.3); fadeIn(lP3, tTk + 0.6, { d: 0.3 });
    sfx('blip', tBk, { g: 0.45, p: -0.3 });
    me.show(tMe);
    // c3 四个分区：对象 → 条件 → 排序；范围已在
    vanish(RW[0].p, tObj); wipe(RW[0].t, tObj, { dir: 'l', d: 0.45 }); sfx('key', tObj, { g: 0.45 });
    vanish(RW[1].p, tCond); wipe(RW[1].t, tCond, { dir: 'l', d: 0.4 }); sfx('key', tCond, { g: 0.45 });
    vanish(RW[2].p, tOrd); wipe(RW[2].t, tOrd, { dir: 'l', d: 0.4 }); sfx('key', tOrd, { g: 0.45 });
    classAt(RW[0].t, 'hi', tObj, tCond); classAt(RW[1].t, 'hi', tCond, tOrd); classAt(RW[2].t, 'hi', tOrd, tRng);
    classAt(RW[3].r.querySelector('.lb'), 'hi', tRng, E('c3_2', 0.3));

    keys.push([mv1, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tz = tSk - 0.5;
    drift(mv1 + 0.95, tz, 1.01);
    keys.push([tz, { x: X + 960, y: 600, z: 1.05 }, 0.9, { sfx: false }]);
    const tz2 = tObj - 0.5;
    drift(tz + 0.95, tz2, 1.055);
    keys.push([tz2, { x: X + 960, y: 520, z: 1.06 }, 0.9, { sfx: false }]);
    drift(tz2 + 0.95, mv2, 1.07);
  }

  // ═════ 站 2 · B24 另一条查询算总数：46 → 3 页（c5）═════
  {
    const X = SX(2);
    const head = h('div', 'abs t-h1', w, '当前页之外：另查总数'); px(head, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const q = codeBlock(w, X + 96, 280, 820, ['SELECT COUNT(*) AS total', 'FROM `oc_order`', "WHERE order_status_id > '0'"], { lang: 'sql', title: '另一条查询：只数总数' });
    const tot = token(w, 'total = 46', 'res', X + 1000, 300, '返回：总数');
    const calc = h('div', 'qy-big', w, '总数 46 ÷ 每页 20 → <span class="c-req">共 3 页</span>'); px(calc, X + 1000, 420);
    const pager = h('div', 'qy-pager', w, '<u>1</u><b>2</b><u>3</u>'); px(pager, X + 840, 560); css(pager, { fontSize: '40px' });
    const pgL = h('div', 'abs t-note', w, '页面上的三个页码'); px(pgL, X + 1000, 566);
    const PG = [['第 1 页', '订单 46–27', 'LIMIT 0,20'], ['第 2 页 · 当前', '订单 26–7', 'LIMIT 20,20'], ['第 3 页', '订单 6–1', 'LIMIT 40,20']];
    const cards = PG.map(([a, b, c], i) => { const e = h('div', 'qy-pg' + (i === 1 ? ' now' : ''), w, `<div class="a">${a}</div><div class="b">${b}</div><div class="c">${c}</div>`); px(e, X + 96 + i * 594, 660, 540); return e; });
    const pgs = [...pager.children];
    const ov = ovl(w, X, 160, 1920, 760);
    const lk = pgs.map((p, i) => { const b = R(p); return svgLine(ov, `M${b.cx},${b.b + 4} L${b.cx},${612} L${X + 96 + i * 594 + 270},${612} L${X + 96 + i * 594 + 270},${654}`, i === 1 ? 'req' : 'dim', { w: 3 }); });

    const tQ = C('c5_2', '另一条查询', -0.3), tT = C('c5_2', '总数');
    const t46 = C('c5_3', '四十六', -0.2), tPer = C('c5_3', '每页', -0.2), tPg = C('c5_4', '三个页码', -0.2);

    appear(head, mv2);
    slideDown(q.el, tQ, { d: 0.4 }); sfx('pop', tQ, { g: 0.5 });
    q.on(0, tQ + 0.4, tT + 0.6);
    slide(tot, tT, { x: -60, d: 0.4, ease: 'power2.out' }); sfx('blip', tT, { g: 0.45, p: -0.3 });
    slam(calc, t46, { from: 1.2, d: 0.35 }); sfx('thud', t46 + 0.1, { g: 0.45 });
    fadeIn(pager, tPer, { d: 0.3 }); fadeIn(pgL, tPer + 0.1, { d: 0.3 });
    lk.forEach((l, i) => drawLine(l, tPer + 0.2 + i * 0.15, 0.35));
    cards.forEach((c, i) => { slideDown(c, tPer + 0.35 + i * 0.15, { d: 0.35 }); sfx('tick', tPer + 0.35 + i * 0.15, { g: 0.4 }); });
    classAt(pgs[1], 'hi', tPg, E('c5_4', 0.6)); sfx('pop', tPg, { g: 0.45 });

    keys.push([mv2, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tz = tQ - 0.3, tb = tPer - 0.5;
    drift(mv2 + 0.95, tz, 1.015);
    keys.push([tz, { x: X + 760, y: 440, z: 1.15 }, 0.9, { sfx: false }]);
    drift(tz + 0.95, tb, 1.165);
    keys.push([tb, { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
    drift(tb + 0.85, mv3, 1.015);
  }

  // ═════ 站 3 · B25 字符串拼出语句：文本 escape()、数值 (int)（c7）═════
  {
    const X = SX(3);
    const head = h('div', 'abs t-h1', w, '拼出语句：文本先转义，数值先转整数'); px(head, X + 96, 176);
    const L = [
      '$sql = "SELECT o.order_id, … FROM `oc_order` o";',
      '$sql .= " WHERE o.order_status_id = \'" . (int)$status . "\'";',
      '$sql .= " AND o.order_id = \'" . (int)$order_id . "\'";',
      '$sql .= " AND … LIKE \'%" . $this->db->escape($customer) . "%\'";',
      '$sql .= " ORDER BY o.order_id DESC";',
      '$sql .= " LIMIT " . (int)$start . "," . (int)$limit;',
    ];
    const cb = codeBlock(w, X + 96, 270, 1350, L.map((l) => esc(l).replace(/(\$[a-zA-Z_]\w*)/g, '<span class="v">$1</span>').replace(/(\(int\)|escape)/g, '<span class="k">$1</span>')), { raw: true, title: 'admin/model/sale/order.php · 示意节选（变量名简化）' });
    const ex1 = h('div', 'qy-ex', w, '文本：<span class="m">Customer 07</span> → escape() → <span class="m">LIKE \'%Customer 07%\'</span>'); px(ex1, X + 96, 700);
    const ex2 = h('div', 'qy-ex', w, '数值：<span class="m">page=2</span> → (int) → <span class="m">2</span>'); px(ex2, X + 1170, 700);
    const nt = ocNotice(w, X + 96, 800, 1728, 'attention', '这里只说明这几处怎样处理输入，不据此判断整个程序没有注入风险');

    const tS = C('c7_1', '字符串'), tEsc = C('c7_2', '转义', -0.2), tInt = C('c7_2', '整数', -0.2), tPos = C('c7_3', '相应位置', -0.3);

    appear(head, mv3);
    slideDown(cb.el, mv3 + 0.3, { d: 0.35 });
    cb.lines.forEach((l, i) => { if (i) { vanish(l, 0); appear(l, tS + 0.1 + i * 0.32); sfx('key', tS + 0.1 + i * 0.32, { g: 0.35 }); } });
    cb.on(3, tEsc, tInt);
    cb.note(3, 'escape()：文本转义', tEsc + 0.1, { dx: 24, w: 340 });
    slide(ex1, tEsc + 0.4, { y: 20, d: 0.35 }); sfx('pop', tEsc + 0.4, { g: 0.45 });
    cb.on(1, tInt, E('c7_3', 0.3)); cb.on(5, tInt, E('c7_3', 0.3));
    cb.note(1, '(int)：数值转整数', tInt + 0.1, { dx: 24, w: 340 });
    cb.note(5, '起点、条数也转整数', tInt + 0.3, { dx: 24, w: 340 });
    slide(ex2, tInt + 0.5, { y: 20, d: 0.35 }); sfx('pop', tInt + 0.5, { g: 0.45 });
    slideDown(nt, tPos, { d: 0.4 }); sfx('tick', tPos, { g: 0.45 });

    keys.push([mv3, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tz = tS + 0.2, tb = tPos - 0.5;
    keys.push([tz, { x: X + 960, y: 500, z: 1.05 }, 0.9, { sfx: false }]);
    drift(tz + 0.95, tb, 1.06);
    keys.push([tb, { x: X + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
    drift(tb + 0.75, mv4, 1.01);
  }

  // ═════ 站 4 · B25 B45 模型 → 驱动 → MySQL；记录列表；mysql → MySQLi（c8、c8a）═════
  {
    const X = SX(4);
    const head = h('div', 'abs t-h1', w, '驱动：发出语句，取回记录'); px(head, X + 96, 176);
    const bOld = h('div', 'qy-badge on', w, '旧：1.5.6.4'); px(bOld, X + 1330, 186);
    const bNew = h('div', 'qy-badge', w, '新：4.1.0.4'); px(bNew, X + 1580, 186);
    const md = ocBox(w, X + 96, 300, 440, 200, '订单模型', { icon: 'code' });
    const mdT = h('div', 'abs t-data wrap', md.bd, '说明查询条件<br>处理返回记录'); css(mdT, { left: '26px', top: '14px', width: '390px' });
    const dv = ocBox(w, X + 660, 300, 600, 200, '数据库驱动', { icon: 'setting' });
    const dvT = h('div', 'abs', dv.bd, '<div class="qy-drv">mysql</div><div class="qy-drvs">PHP mysql 扩展 · mysql_query()</div>'); css(dvT, { left: '26px', top: '8px' });
    const db = zone(w, 'db', X + 1390, 316, 434, 184, 'MySQL', '订单表 oc_order');
    const ov = ovl(w, X, 160, 1920, 760);
    const a1 = svgLine(ov, `M${X + 540},${380} L${X + 654},${380}`, 'req', { w: 5 });
    const a2 = svgLine(ov, `M${X + 1264},${380} L${X + 1384},${380}`, 'req', { w: 5 });
    const r1 = svgLine(ov, `M${X + 1384},${450} L${X + 1264},${450}`, 'res', { w: 5 });
    const r2 = svgLine(ov, `M${X + 960},${504} L${X + 960},${566}`, 'res', { w: 5 });
    const rows = ['[0]  order_id =&gt; 26, total =&gt; 225.00, …', '[1]  order_id =&gt; 25, total =&gt; 220.00, …', '…', '[19] order_id =&gt; 7,  total =&gt; 100.00, …'];
    const arr = codeBlock(w, X + 560, 572, 800, rows, { raw: true, title: '$query-&gt;rows · 记录列表（PHP 数组，20 条）' });
    const tpl = h('div', 'ghost', w, ''); px(tpl, X + 1440, 600, 384, 260); css(tpl, { fontSize: '32px', fontWeight: '700', color: '#5B6670', flexDirection: 'column', gap: '10px', textAlign: 'center' });
    tpl.innerHTML = '<div>模板</div><div style="font-size:26px;font-weight:500">第 07 章：变成屏幕上的表格</div>';
    const r3 = svgLine(ov, `M${X + 1364},${720} L${X + 1434},${720}`, 'res', { w: 5 });
    const qL = lbl(X + 1240, 330, '语句', 'req'); const rL = lbl(X + 1272, 460, '结果', 'res');
    const ret = token(w, '20 条记录', 'res', 0, 0); ret.setAttribute('data-overlap-ok', '');
    const mdN = h('div', 'abs t-note', w, '位置不变'); px(mdN, X + 120, 520);
    const dbN = h('div', 'abs t-note', w, '位置不变'); px(dbN, X + 1414, 520);

    const tGo = mv4 + 0.9, tRec = C('c8_1', '记录列表', -0.6), tTpl = C('c8_2', '模板', -0.3);
    const tExt = C('c8a_1', 'mysql', -0.2), tNew = C('c8a_2', 'MySQLi', -0.2), tCond = C('c8a_3', '查询条件', -0.2), tRet = C('c8a_4', '返回记录', -0.3);

    appear(head, mv4);
    slideDown(md.el, mv4 + 0.3, { d: 0.35 }); fadeIn(bOld, mv4 + 0.5, { d: 0.3 }); fadeIn(bNew, mv4 + 0.6, { d: 0.3 });
    drawLine(a1, tGo, 0.3); slideDown(dv.el, tGo + 0.2, { d: 0.35 }); sfx('pop', tGo + 0.2, { g: 0.45 });
    drawLine(a2, tGo + 0.6, 0.3); wipe(db.el, tGo + 0.8, { dir: 't', d: 0.4 }); fadeIn(qL, tGo + 0.7, { d: 0.25 });
    sfx('blip', tGo + 0.6, { g: 0.45 });
    // c8_1 结果回来：钢蓝记录 → 驱动 → PHP 数组
    appear(ret, C('c8_1', '查询结果', -0.2)); sfx('blip', C('c8_1', '查询结果', -0.2), { g: 0.45, p: -0.3 });
    travel(ret, [[C('c8_1', '查询结果', -0.2), 1.2, [[X + 1420, 420], [X + 1100, 420], [X + 880, 540]]]]);
    vanish(ret, C('c8_1', '查询结果', 1.05));
    drawLine(r1, C('c8_1', '查询结果', -0.1), 0.3); fadeIn(rL, C('c8_1', '查询结果', 0.1), { d: 0.25 });
    drawLine(r2, tRec - 0.3, 0.3);
    slideDown(arr.el, tRec, { d: 0.45 }); sfx('pop', tRec, { g: 0.5 });
    arr.on(3, tRec + 0.5, E('c8_2', 0.3));
    // c8_2 交给模板
    drawLine(r3, tTpl - 0.2, 0.3); wipe(tpl, tTpl, { dir: 'l', d: 0.4 }); sfx('tick', tTpl, { g: 0.45 });
    // c8a 驱动从 mysql 换成 MySQLi；模型与数据库不动
    classAt(dv.el, 'qy-on', tExt, tCond);
    keyed(dvT).at(tNew, { html: '<div class="qy-drv">MySQLi</div><div class="qy-drvs">4.1.0.4 的驱动 · 更新的接口</div>' });
    keyed(bOld).at(tNew, { cls: 'qy-badge' }); keyed(bNew).at(tNew, { cls: 'qy-badge on' });
    sfx('thud', tNew, { g: 0.45 });
    fadeIn(mdN, tNew + 0.4, { d: 0.3 }); fadeIn(dbN, tNew + 0.5, { d: 0.3 });
    classAt(md.el, 'qy-on', tCond, E('c8a_4', 0.3));
    classAt(arr.el, 'qy-on', tRet, E('c8a_4', 0.3));

    keys.push([mv4, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tz = tRec - 0.6, tb = tTpl - 0.6;
    keys.push([tz, { x: X + 1000, y: 620, z: 1.12 }, 0.9, { sfx: false }]);
    drift(tz + 0.95, tb, 1.135);
    keys.push([tb, { x: X + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
    drift(tb + 0.85, mv5, 1.02);
  }

  // ═════ 站 5 · B26 状态名称走缓存；订单记录每次查询；本章结果（c9、c9a、c10）═════
  {
    const X = SX(5);
    const head = h('div', 'abs t-h1', w, '小清单走缓存，订单记录每次查'); px(head, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const st = ocBox(w, X + 96, 270, 440, 290, '订单状态名称', { icon: 'setting' });
    const items = ['待处理', '处理中', '已发货', '已完成'].map((t, i) => { const e = h('div', 'qy-li', st.bd, t); css(e, { top: 4 + i * 48 + 'px' }); return e; });
    const cache = h('div', 'qy-cache', w); px(cache, X + 700, 300, 600, 196);
    const cEmp = h('div', 'emp', cache, '缓存：空');
    const cClr = h('div', 'emp', cache, '缓存已清除 · 下次重新查表');
    const cHd = h('div', 'hd', cache, `cache.order_status.1.${PH('到期时间')}`);
    const cL1 = h('div', 'ln', cache, '1 = 语言编号');
    const cL2 = h('div', 'ln', cache, '到期时间 = 写入时刻 + 3600 秒');
    const cLab = h('div', 'abs t-lbl-s', w, '缓存文件'); px(cLab, X + 700, 250);
    const db = zone(w, 'db', X + 1440, 300, 384, 440, 'MySQL', 'oc_order_status · oc_order');
    const ov = ovl(w, X, 160, 1920, 760);
    const aQ = svgLine(ov, `M${X + 540},${360} L${X + 694},${360}`, 'req', { w: 5 });
    const aMiss = svgLine(ov, `M${X + 1304},${360} L${X + 1434},${360}`, 'req', { w: 5 });
    const aFill = svgLine(ov, `M${X + 1434},${450} L${X + 1304},${450}`, 'res', { w: 5 });
    const aHit = svgLine(ov, `M${X + 694},${450} L${X + 540},${450}`, 'res', { w: 5 });
    const lQ = lbl(X + 548, 312, '先查缓存', 'req');
    const lMiss = lbl(X + 1300, 312, '查表', 'req');
    const lFill = lbl(X + 1300, 462, '写入', 'res');
    const lHit = lbl(X + 556, 462, '复用', 'res');
    const sMiss = h('div', 'qy-st miss', w, '第一次：未命中'); px(sMiss, X + 700, 512);
    const sHit = h('div', 'qy-st hit', w, '下一次：命中，不再查表'); px(sHit, X + 950, 512);
    const sClr = h('div', 'qy-st clr', w, '改名后：缓存清除'); px(sClr, X + 700, 512);
    const edit = h('div', 'abs', w); px(edit, X + 96, 580); edit.innerHTML = '<span class="oc-input" style="width:220px;height:52px;font:500 28px/48px \'Sans SC\';padding:0 12px;color:#333">已发货</span> <span class="oc-btn" style="vertical-align:top">保存</span> <span class="t-note" style="vertical-align:top;line-height:52px">修改状态名称</span>';
    // 下方：订单记录每次查询
    const ord = chip(w, '当前页订单记录 · 第 2 页', X + 96, 676);
    const aOrd = svgLine(ov, `M${X + 560},${706} L${X + 1434},${706}`, 'req', { w: 5 });
    const lOrd = lbl(X + 760, 650, '订单查询：每次按条件和页码 · LIMIT 20,20', 'req');
    const noC = h('div', 'abs t-note', w, '不经过缓存'); px(noC, X + 900, 724);
    const sum = [['当前页记录：20 条 √', 96], ['总数 46 → 3 页 √', 520], ['状态名称缓存 √', 890]].map(([t, x]) => { const e = h('div', 'qy-sum', w, t); px(e, X + x, 806); return e; });
    const nx = h('div', 'qy-next', w, '下一步：放进页面 →'); px(nx, X + 1260, 806);

    const tC = C('c9_1', '缓存', -0.3), tShip = C('c9_2', '已发货', -0.1), tDone = C('c9_2', '已完成', -0.1);
    const tFirst = C('c9_3', '第一次', -0.1), tDb = C('c9_3', '数据库', -0.2), tFill = C('c9_3', '缓存', -0.2), tReuse = C('c9_3', '复用', -0.2);
    const tEdit = C('c9_4', '修改名称', -0.3), tClr = C('c9_4', '清掉', -0.1);
    const tList = C('c9a_1', '状态名称清单', -0.2), tOrd = C('c9a_2', '订单记录', -0.3), tQ = C('c9a_2', '查询', -0.3), tDiff = C('c9a_3', '不同', -0.2);
    const tS1 = C('c10_1', '哪些记录', -0.2), tS2 = C('c10_1', '几页', -0.2), tS3 = C('c10_1', '结果', -0.2), tNx = C('c10_2', '放进页面', -0.3);

    appear(head, mv5);
    slideDown(st.el, tC - 0.4, { d: 0.35 }); items.forEach((e, i) => fadeIn(e, tC - 0.2 + i * 0.08, { d: 0.2 }));
    fadeIn(cLab, tC, { d: 0.3 }); wipe(cache, tC, { dir: 'l', d: 0.4 }); sfx('pop', tC, { g: 0.45 });
    vanish(cHd, 0); vanish(cL1, 0); vanish(cL2, 0);
    drawLine(aQ, tC + 0.2, 0.3); fadeIn(lQ, tC + 0.4, { d: 0.25 });
    hl(items[2], tShip, tDone); hl(items[3], tDone, E('c9_2', 0.3));
    // c9_3 第一次未命中 → 查表 → 写入 → 下次命中
    slide(sMiss, tFirst, { x: -20, d: 0.3 }); sfx('tick', tFirst, { g: 0.45 });
    wipe(db.el, tDb - 0.3, { dir: 't', d: 0.4 }); drawLine(aMiss, tDb, 0.3); fadeIn(lMiss, tDb + 0.15, { d: 0.25 }); sfx('blip', tDb, { g: 0.4 });
    drawLine(aFill, tFill, 0.3); fadeIn(lFill, tFill + 0.15, { d: 0.25 }); sfx('blip', tFill, { g: 0.4, p: -0.3 });
    vanish(cEmp, tFill + 0.3); appear(cHd, tFill + 0.3); fadeIn(cL1, tFill + 0.4, { d: 0.2 }); fadeIn(cL2, tFill + 0.5, { d: 0.2 });
    classAt(cache, 'full', tFill + 0.3, tClr);
    drawLine(aHit, tReuse, 0.3); fadeIn(lHit, tReuse + 0.15, { d: 0.25 });
    slide(sHit, tReuse, { x: -20, d: 0.3 }); sfx('chime', tReuse + 0.1, { g: 0.35 });
    // c9_4 修改名称 → 清掉缓存
    slideDown(edit, tEdit, { d: 0.3 }); press(edit.querySelector('.oc-btn'), tClr - 0.3);
    vanish(sMiss, tClr); vanish(sHit, tClr); appear(sClr, tClr); sfx('error', tClr, { g: 0.3 });
    vanish(cHd, tClr); vanish(cL1, tClr); vanish(cL2, tClr);
    appear(cClr, tClr);
    // c9a_1 这里缓存的只是状态名称清单
    classAt(st.el, 'qy-on', tList, tOrd);
    // c9a_2 当前页订单记录每次查询
    slide(ord, tOrd, { x: -30, d: 0.35 }); sfx('pop', tOrd, { g: 0.45 });
    drawLine(aOrd, tQ, 0.6); fadeIn(lOrd, tQ + 0.3, { d: 0.3 }); fadeIn(noC, tQ + 0.5, { d: 0.3 });
    classAt(ord, 'on', tDiff, E('c9a_3', 0.3));
    // c10 本章结果
    sum.forEach((e, i) => { const t = [tS1, tS2, tS3][i]; slide(e, t, { y: 20, d: 0.35 }); sfx('tick', t, { g: 0.45 }); });
    slide(nx, tNx, { x: -30, d: 0.35 }); sfx('pop', tNx, { g: 0.45 });

    keys.push([mv5, { x: X + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
    const tz = tFirst - 0.5, tb = tOrd - 0.6;
    keys.push([tz, { x: X + 960, y: 520, z: 1.1 }, 0.9, { sfx: false }]);
    drift(tz + 0.95, tb, 1.115);
    keys.push([tb, { x: X + 960, y: 560, z: 1 }, 0.8, { sfx: false }]);
    drift(tb + 0.85, s.end - 0.05, 1.02);
  }

  keys.sort((a, b) => a[0] - b[0]);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
});
