// 05 数据库怎样组织这些数据（database）：分镜 B19 B20 B21 B22，段落 q1–q7。
// 一个 world，三个站点横向排开（站 i 的左边界 = 2100·i）。七号演示订单（demo.json）在站 2 固定不动，明细依次展开；
// 关联线只标「按订单编号关联」，约束说明单独停留（FACTS S19-07：安装表为 MyISAM，定义里没有外键约束）。
// 事实：S19-01（config.php 连接常量）、S19-03、S19-07、S19-08（包装层 → 驱动）、S19-09、L11（表前缀 oc_、驱动 mysql）。
scene('database', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const mv = (id) => E(id, -0.3);
  const SX = (i) => 2100 * i;
  const GRN = '#2E7D4F';                                  // 订单编号的同色标记（只用于 order_id）

  h('style', '', document.head, `
#sc-database .db-hd { display: flex; flex-direction: column; justify-content: center; line-height: 1.15; }
#sc-database .db-hd .f { font: 600 26px/1.15 "Mono", "Sans SC"; color: #222; }
#sc-database .db-hd .z { font: 500 24px/1.2 "Sans SC", "Inter"; color: #666; }
#sc-database .db-oid { display: inline-block; min-width: 56px; padding: 2px 12px; border-radius: 6px; font: 700 30px/1.2 "Mono"; text-align: center; border: 2px solid transparent; }
#sc-database .db-oid.on { background: #DDF0E3; border-color: ${GRN}; color: #1B5A35; }
#sc-database .db-fld { position: absolute; }
#sc-database .db-fld .f { font: 600 28px/1.2 "Mono", "Sans SC"; color: #222; }
#sc-database .db-fld .z { font: 500 26px/1.3 "Sans SC", "Inter"; color: #666; }
#sc-database .db-row { position: absolute; left: 0; right: 0; height: 84px; padding: 0 8px; }
#sc-database .db-val { position: absolute; right: 26px; top: 16px; font: 600 32px/1.3 "Inter", "Sans SC"; color: #1d1d1d; }
#sc-database .db-lbl { position: absolute; padding: 4px 8px; background: #fff; border: 2px solid ${GRN}; border-radius: 6px; font: 700 34px/1.25 "Sans SC", "Inter"; color: #1B5A35; }
#sc-database .db-badge { position: absolute; padding: 4px 14px; background: #DDF0E3; border-radius: 6px; font: 600 28px/1.3 "Sans SC", "Inter"; color: #1B5A35; }
#sc-database .db-card { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-left: 8px solid var(--res); border-radius: 6px; padding: 14px 18px; white-space: normal; }
#sc-database .db-card.me { border-left-color: #D2A214; }
#sc-database .db-card .t { font: 700 34px/1.25 "Sans SC", "Inter"; color: #1d1d1d; }
#sc-database .db-card .b { margin-top: 8px; font: 500 28px/1.35 "Sans SC", "Inter"; color: #444; }
#sc-database .db-ghost td, #sc-database .tr.db-ghost .td { color: #8E9AA6; font-style: italic; }
#sc-database .tr.db-ghost { background: repeating-linear-gradient(135deg, #fff 0 10px, #F4F6F8 10px 20px); }
#sc-database .db-tag { position: absolute; font: 500 26px/1.3 "Sans SC", "Inter"; color: #C9DCCF; }
#sc-database .db-next { position: absolute; border: 3px dashed var(--req); border-radius: 8px; padding: 8px 18px; font: 600 30px/1.25 "Sans SC", "Inter"; color: #7A300A; background: #fff; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const hd2 = (f, z) => `<div class="db-hd"><span class="f">${f}</span><span class="z">${z}</span></div>`;
  const oid = (v) => `<span class="db-oid">${v}</span>`;

  // ═════ 站 1 · B19 表的种类；连接账号在连接线上，后台用户在用户表里（q1、q2）═════
  let S1 = {};
  {
    const head = h('div', 'abs t-lbl', w, '数据库里有哪些表'); px(head, 96, 172);
    stamp(w, 1580, 184, 'demo', '示意 · 部分表');

    const srv = zone(w, 'server', 96, 240, 640, 440, '服务器 · PHP', '入口 admin/index.php');
    const cfgL = h('div', 'abs t-lbl-s', w, 'config.php'); px(cfgL, 120, 344); css(cfgL, { color: '#fff' });
    const cfgN = h('div', 'abs t-src', w, '只列常量名，不列值'); px(cfgN, 410, 352); css(cfgN, { color: '#BFD6E8' });
    const cfg = ocTable(w, 120, 400, [{ label: '连接常量', w: 290 }, { label: '作用', w: 300 }],
      [['<span class="mono" style="font-size:26px">DB_HOSTNAME</span>', '数据库地址'], ['<span class="mono" style="font-size:26px">DB_USERNAME</span>', '连接账号'],
        ['<span class="mono" style="font-size:26px">DB_PASSWORD</span>', '连接口令'], ['<span class="mono" style="font-size:26px">DB_DATABASE</span>', '数据库名']], { rowH: 52, headH: 52 });

    const db = zone(w, 'db', 1040, 250, 784, 630, 'MySQL 数据库', '表前缀 oc_');
    const TB = [['oc_order', '订单'], ['oc_order_product', '订单商品项'], ['oc_order_history', '订单历史'], ['oc_setting', '设置'], ['oc_user', '后台用户'], ['oc_user_group', '用户组']];
    const chips = TB.map(([n, zh], i) => { const e = chip(w, `<span class="mono" style="font-size:28px">${n}</span> ${zh}`, 1070, 360 + i * 80, 'dark'); return e; });
    const tags = [['业务记录', 0, 2], ['设置', 3, 3], ['后台身份', 4, 5]].map(([t, a, b]) => {
      const e = h('div', 'db-tag', w, t); px(e, 1620, 360 + ((a + b) / 2) * 80 + 10); return e;
    });

    const ov = ovl(w, 0, 160, 1920, 760);
    const conn = svgLine(ov, 'M736,300 L1036,300', 'res', { w: 6, arrow: false });
    const connL = h('div', 'abs t-note', w, '数据库连接'); px(connL, 790, 250);
    const cardA = h('div', 'db-card', w, '<div class="t">连接账号</div><div class="b">程序访问数据库时用；写在 config.php</div>'); px(cardA, 760, 330, 256);
    const lnA = svgLine(ov, 'M888,304 L888,326', 'res', { w: 3, arrow: false });
    const cardB = h('div', 'db-card me', w, '<div class="t">后台用户账号 · 演示店员</div><div class="b">一行 oc_user 记录，用来识别操作后台的人</div>'); px(cardB, 96, 712, 620);
    const lnB = svgLine(ov, 'M720,780 L1000,780 L1000,706 L1062,706', 'ink', { w: 4 });
    const lnBL = h('div', 'abs t-note', w, '后台身份'); px(lnBL, 790, 790);

    appear(head, c0 + 0.1);
    wipe(db.el, c0 + 0.15, { dir: 't', d: 0.5 });
    wipe(srv.el, c0 + 0.3, { dir: 'l', d: 0.5 });
    // q1：先是订单，再是其他表
    slide(chips[0], C('q1_1', '订单'), { x: -30, d: 0.35 }); sfx('pop', C('q1_1', '订单'), { g: 0.5 });
    const tq = [C('q1_2', '后台用户'), C('q1_2', '用户组'), C('q1_2', '设置'), C('q1_2', '业务记录'), C('q1_2', '业务记录', 0.15), C('q1_2', '业务记录', 0.3)];
    [4, 5, 3, 1, 2].forEach((ci, k) => { slide(chips[ci], tq[k < 3 ? k : k], { x: -30, d: 0.3 }); sfx('tick', tq[k], { g: 0.45 }); });
    fadeIn(tags[2], tq[1] + 0.2, { d: 0.3 }); fadeIn(tags[1], tq[2] + 0.2, { d: 0.3 }); fadeIn(tags[0], tq[3] + 0.2, { d: 0.3 });
    wipe(cfgL, C('q1_3', '配置', -0.3), { dir: 'l', d: 0.35 }); fadeIn(cfgN, C('q1_3', '配置'), { d: 0.3 });
    slideDown(cfg.el, C('q1_3', '连接信息', -0.2), { d: 0.4 });
    drawLine(conn, C('q1_3', '建立', -0.1), 0.6); fadeIn(connL, C('q1_3', '建立', 0.3), { d: 0.3 });
    sfx('blip', C('q1_3', '建立'), { g: 0.5 });
    // q2：两种账号
    cfg.mark(1, C('q2_1', '连接账号', -0.1), E('q2_1', 0.2));
    drawLine(lnA, C('q2_1', '连接账号'), 0.2);
    slideDown(cardA, C('q2_1', '连接账号'), { d: 0.4 }); sfx('pop', C('q2_1', '连接账号'), { g: 0.55 });
    slide(cardB, C('q2_2', '后台用户账号', -0.2), { y: 30, d: 0.4 }); sfx('pop', C('q2_2', '后台用户账号', -0.2), { g: 0.55 });
    drawLine(lnB, C('q2_2', '识别', -0.3), 0.5); fadeIn(lnBL, C('q2_2', '识别'), { d: 0.3 });
    classAt(chips[4], 'on', C('q2_2', '识别'), E('q2_3', 0.3));
    S1 = {};
  }

  // ═════ 站 2 · B20 B21 七号订单 → 商品项、历史；按订单编号关联；无外键约束（q3、q4、q5）═════
  const X2 = SX(1);
  let S2 = {};
  {
    const X = X2;
    const head = h('div', 'abs t-lbl', w, '七号演示订单在三张表里'); px(head, X + 96, 172);
    stamp(w, X + 1560, 184, 'demo', '示意 · 合成数据');

    const ord = ocBox(w, X + 96, 250, 540, 430, '<span class="mono">oc_order</span> 订单主表', { icon: 'order' });
    const FR = [['order_id', '订单编号', oid(7)], ['order_status_id', '当前状态', '待处理'], ['total', '金额', '100.00']];
    const frows = FR.map(([f, z, v], i) => {
      const r = h('div', 'db-row', ord.bd); css(r, { top: 6 + i * 92 + 'px' });
      const fl = h('div', 'db-fld', r, `<div class="f">${f}</div><div class="z">${z}</div>`); css(fl, { left: '18px', top: '4px' });
      const vl = h('div', 'db-val', r, v);
      return { r, vl };
    });
    const oidMain = frows[0].vl.firstChild;
    const pkN = h('div', 'abs t-src', ord.bd, '主键：order_id'); css(pkN, { left: '26px', top: '290px' });

    const pL = h('div', 'abs t-lbl-s', w, '<span class="mono">oc_order_product</span> 商品明细表'); px(pL, X + 900, 200);
    const pt = ocTable(w, X + 900, 252, [{ label: hd2('order_id', '订单编号'), w: 200, align: 'c' }, { label: hd2('order_product_id', '商品项编号'), w: 250, align: 'r' },
      { label: hd2('name', '商品'), w: 210 }, { label: hd2('quantity', '数量'), w: 150, align: 'r' }, { label: hd2('price', '单价'), w: 114, align: 'r' }],
    [[oid(7), '1', '演示商品 A', '2', '30.00'], [oid(7), '2', '演示商品 B', '1', '40.00']], { rowH: 54, headH: 84 });
    const hL = h('div', 'abs t-lbl-s', w, '<span class="mono">oc_order_history</span> 历史表'); px(hL, X + 900, 484);
    const ht = ocTable(w, X + 900, 536, [{ label: hd2('order_id', '订单编号'), w: 200, align: 'c' }, { label: hd2('order_history_id', '历史编号'), w: 270, align: 'r' },
      { label: hd2('order_status_id', '状态'), w: 300 }],
    [[oid(7), '1', '待处理']], { rowH: 54, headH: 84 });
    const ghostRow = h('div', 'tr db-ghost', ht.el); ghostRow.style.height = '54px';
    [['…', 200, 'c'], ['…', 270, 'r'], ['以后改状态时追加', 300, '']].forEach(([v, wd, a]) => { const td = h('div', 'td' + (a ? ' ' + a : ''), ghostRow, v); td.style.width = wd + 'px'; css(td, { fontSize: '26px' }); });
    const bP = h('div', 'db-badge', w, '1 张订单 → 2 条商品项'); px(bP, X + 1500, 470);
    const bH = h('div', 'db-badge', w, '可以有多条历史记录'); px(bH, X + 1400, 740);

    // 关联线：从主表的 order_id 出发，沿一条竖线分到各行的 order_id
    const yMain = 250 + 78 + 6 + 30, xMain = X + 96 + 540 - 26 - 70;
    const yRows = [252 + 84 + 27, 252 + 84 + 54 + 27, 536 + 84 + 27, 536 + 84 + 54 + 27];
    const BUS = X + 770;
    const ov = ovl(w, X, 160, 1920, 760);
    const mainLn = svgLine(ov, `M${X + 636},${yMain} L${BUS},${yMain}`, GRN, { w: 4 });
    const busP = svgLine(ov, `M${BUS},${yMain} L${BUS},${yRows[1]}`, GRN, { w: 4 });
    const busH = svgLine(ov, `M${BUS},${yRows[1]} L${BUS},${yRows[3]}`, GRN, { w: 4 });
    const br = yRows.map((y, i) => svgLine(ov, `M${BUS},${y} L${X + 896},${y}`, GRN, { w: 4, dash: i === 3 ? '8 8' : null }));
    const relL = h('div', 'db-lbl', w, '按订单编号关联'); px(relL, X + 641, 492);
    const fk = ocNotice(w, X + 96, 790, 1728, 'attention', '<b>无外键约束</b>：这几张安装表（MyISAM）的定义里没有声明外键；关联靠程序按订单编号查找');

    const tA = mv('q2_3');
    appear(head, tA);
    slide(ord.el, C('q3_1', '七号', -0.2), { x: -60, d: 0.45, ease: 'power2.out' }); sfx('pop', C('q3_1', '七号', -0.2), { g: 0.55 });
    hl(frows[1].r, C('q3_2', '状态'), C('q3_2', '金额'));
    hl(frows[2].r, C('q3_2', '金额'), E('q3_2', 0.2));
    wipe(pL, C('q3_3', '商品明细表', -0.3), { dir: 'l', d: 0.35 });
    slideDown(pt.el, C('q3_3', '商品明细表'), { d: 0.4 }); sfx('pop', C('q3_3', '商品明细表'), { g: 0.5 });
    wipe(hL, C('q3_4', '历史表', -0.3), { dir: 'l', d: 0.35 });
    slideDown(ht.el, C('q3_4', '历史表'), { d: 0.4 }); sfx('pop', C('q3_4', '历史表'), { g: 0.5 });
    vanish(ghostRow, 0);
    // q4：同色 order_id → 按编号连线 → 一对多
    const tO = C('q4_1', '订单编号');
    const cells = [oidMain, pt.cell(0, 0).firstChild, pt.cell(1, 0).firstChild, ht.cell(0, 0).firstChild];
    cells.forEach((c, i) => { keyed(c).at(tO + (i ? 0.15 + i * 0.12 : 0), { cls: 'db-oid on' }); });
    sfx('tick', tO, { g: 0.5 }); sfx('tick', tO + 0.4, { g: 0.4 });
    const tL = C('q4_2', '这个编号', -0.2);
    drawLine(mainLn, tL, 0.3); drawLine(busP, tL + 0.3, 0.25); drawLine(busH, tL + 0.55, 0.3);
    drawLine(br[0], tL + 0.5, 0.2); drawLine(br[1], tL + 0.55, 0.2); drawLine(br[2], tL + 0.85, 0.2);
    sfx('blip', tL + 0.3, { g: 0.45 });
    slide(bP, C('q4_3', '多条商品项', -0.2), { x: -30, d: 0.35 }); sfx('pop', C('q4_3', '多条商品项', -0.2), { g: 0.5 });
    slideDown(ghostRow, C('q4_3', '多条历史记录', -0.3), { d: 0.4 });
    drawLine(br[3], C('q4_3', '多条历史记录', 0.1), 0.2);
    slide(bH, C('q4_3', '多条历史记录'), { x: -30, d: 0.35 }); sfx('pop', C('q4_3', '多条历史记录'), { g: 0.5 });
    // q5：线的含义；约束说明单独停留
    slam(relL, C('q5_1', '线'), { from: 1.2, d: 0.35 }); sfx('thud', C('q5_1', '线'), { g: 0.4 });
    slideDown(fk, C('q5_2', '外键约束', -0.4), { d: 0.4 }); sfx('tick', C('q5_2', '外键约束', -0.4), { g: 0.6 });
    hl(fk, C('q5_3', '不能'), E('q5_4', 0.3));
    S2 = { tA };
    void pkN;
  }

  // ═════ 站 3 · B22 模型 → DB 包装层 → 驱动 → MySQL，结果反向回来（q6、q7）═════
  const X3 = SX(2);
  let S3 = {};
  {
    const X = X3;
    const head = h('div', 'abs t-lbl', w, '一次查询经过哪几层'); px(head, X + 96, 172);
    const BW = 300, STEP = 357;
    const L5 = [
      ['控制器', 'code', 'controller/sale/order.php', '要这一页订单'],
      ['模型', 'order', 'model/sale/order.php', '组织业务查询'],
      ['DB 包装层', 'setting', 'library/db.php', '按配置装载驱动，转交 query'],
      ['驱动 mysql', 'code', 'database/mysql.php', '连接、执行语句，整理结果'],
    ];
    const bx = L5.map(([t, ic, f, role], i) => {
      const b = ocBox(w, X + 96 + i * STEP, 260, BW, 330, t, { icon: ic });
      const fe = h('div', 'abs mono wrap', b.bd, f); css(fe, { left: '18px', top: '12px', width: BW - 40 + 'px', fontSize: '22px', lineHeight: '30px', color: '#003A88', wordBreak: 'break-all' });
      const re = h('div', 'abs t-data wrap', b.bd, role); css(re, { left: '18px', top: '84px', width: BW - 40 + 'px', fontSize: '30px' });
      return b;
    });
    const my = zone(w, 'db', X + 96 + 4 * STEP, 276, BW, 314, 'MySQL', '执行 SQL，返回结果');
    const ov = ovl(w, X, 160, 1920, 760);
    const arr = [0, 1, 2, 3].map((i) => svgLine(ov, `M${X + 96 + i * STEP + BW + 6},420 L${X + 96 + (i + 1) * STEP - 8},420`, 'ink', { w: 4 }));
    const laneQ = svgLine(ov, `M${X + 96 + STEP + 40},660 L${X + 96 + 4 * STEP + BW - 20},660`, 'req', { w: 3, dash: '10 10', arrow: false });
    const laneR = svgLine(ov, `M${X + 96 + 4 * STEP + BW - 20},800 L${X + 96 + 40},800`, 'res', { w: 3, dash: '10 10', arrow: false });
    const need = token(w, '第 2 页订单', 'req', X + 116, 630, '控制器要的结果');
    const q = token(w, 'SELECT … FROM oc_order …', 'req', 0, 0, '模型组好的 SQL');
    const rs = token(w, 'row / rows / num_rows', 'res', 0, 0, '驱动整理好的记录');
    const nx = h('div', 'db-next', w, '下一章：翻页时看这条分工 →'); px(nx, X + 1330, 172);

    const tA = mv('q5_4');
    appear(head, tA);
    bx.forEach((b, i) => wipe(b.el, tA + 0.35 + i * 0.12, { dir: 't', d: 0.35 }));
    wipe(my.el, tA + 0.35 + 4 * 0.12, { dir: 't', d: 0.35 });
    arr.forEach((a, i) => drawLine(a, tA + 0.9 + i * 0.1, 0.2));
    // q6：请求一层层往下走
    hl(bx[1].el, C('q6_1', '模型'), E('q6_1', 0.1));
    const tQ = C('q6_2', 'SQL', -0.2);
    drawLine(laneQ, tQ - 0.2, 0.5);
    appear(q, tQ);
    const xq = (i) => X + 96 + i * STEP - 40;
    const tW = C('q6_2', '数据库包装层', -0.3), tD = C('q6_3', '驱动', -0.3), tM = C('q6_3', 'MySQL', -0.4);
    travel(q, [[tQ, 0.3, [[xq(1), 632], [xq(1), 632]]], [tW, 0.8, [[xq(1), 632], [xq(2), 632]]], [tD, 0.8, [[xq(2), 632], [xq(3), 632]]], [tM, 0.6, [[xq(3), 632], [xq(4) - 40, 632]]]]);
    sfx('blip', tW, { g: 0.45 }); sfx('blip', tD, { g: 0.45 }); sfx('blip', tM, { g: 0.5 });
    hl(bx[2].el, tW + 0.3, E('q6_2', 0.1));
    hl(bx[3].el, C('q6_4', '驱动'), E('q6_5', 0.2));
    vanish(q, tM + 0.75);
    // 结果反向回来
    const tR = C('q6_5', '返回结果', -0.3);
    drawLine(laneR, tR - 0.2, 0.5);
    appear(rs, tR);
    travel(rs, [[tR, 0.6, [[xq(4) + 40, 772], [xq(3) + 40, 772]]], [C('q7_1', '模型', -0.3), 0.8, [[xq(3) + 40, 772], [xq(1) + 40, 772]]], [C('q7_1', '这一页订单', 0) > C('q7_1', '模型', 0.6) ? C('q7_1', '模型', 0.6) : C('q7_1', '模型', 0.6), 0.6, [[xq(1) + 40, 772], [X + 116, 772]]]]);
    sfx('blip', tR, { g: 0.45, p: -0.3 });
    // q7：三层各自的事
    appear(need, C('q7_1', '这一页订单', -0.2)); sfx('pop', C('q7_1', '这一页订单', -0.2), { g: 0.5 });
    hl(bx[0].el, C('q7_1', '这一页订单'), C('q7_1', '怎样查'));
    hl(bx[1].el, C('q7_1', '怎样查'), E('q7_1', 0.1));
    slide(nx, C('q7_3', '翻页', -0.2), { x: 30, d: 0.4 }); sfx('chime', C('q7_3', '翻页'), { g: 0.4 });
    S3 = { tA, tW, tD, tR };
  }

  // ═════ 镜头 ═════
  const keys = [];
  const drift = (from, to_, z = 1.03, extra = {}) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z, ...extra }, d, { ease: 'none', sfx: false }]); };
  // 站 1：全景 → 推近表清单 → 拉回看连接与两种账号
  const a1 = C('q1_2', '后台用户', -0.5), a2 = C('q1_3', '配置', -0.6);
  drift(c0 + 0.1, a1, 1.02);
  keys.push([a1, { x: 1400, y: 560, z: 1.25 }, 1.0, { sfx: false }]);
  drift(a1 + 1.05, a2, 1.27, { x: 1400, y: 560 });
  keys.push([a2, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
  drift(a2 + 0.85, S2.tA, 1.03);
  // 站 2：到站 → 推近主表 → 拉回看两张明细 → 推近关联线 → 拉回读约束说明
  keys.push([S2.tA, { x: X2 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  const b1 = C('q3_2', '订单主表', -0.4), b2 = C('q3_3', '商品明细表', -0.5), b3 = C('q5_1', '线', -0.5), b4 = C('q5_2', '外键约束', -0.6);
  drift(S2.tA + 1.05, b1, 1.03);
  keys.push([b1, { x: X2 + 520, y: 500, z: 1.3 }, 1.0, { sfx: false }]);
  drift(b1 + 1.05, b2, 1.32, { x: X2 + 520, y: 500 });
  keys.push([b2, { x: X2 + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
  drift(b2 + 0.85, b3, 1.03);
  keys.push([b3, { x: X2 + 820, y: 500, z: 1.3 }, 1.0, { sfx: false }]);
  drift(b3 + 1.05, b4, 1.32, { x: X2 + 820, y: 500 });
  keys.push([b4, { x: X2 + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(b4 + 0.75, S3.tA, 1.02);
  // 站 3：到站 → 推近模型与包装层 → 摇到驱动与 MySQL → 拉回全景看回程
  keys.push([S3.tA, { x: X3 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  const d1 = S3.tW - 0.6, d2 = S3.tD - 0.5, d3 = S3.tR - 0.4;
  drift(S3.tA + 1.05, d1, 1.03);
  keys.push([d1, { x: X3 + 700, y: 540, z: 1.22 }, 1.0, { sfx: false }]);
  drift(d1 + 1.05, d2, 1.24, { x: X3 + 700, y: 540 });
  keys.push([d2, { x: X3 + 1300, y: 540, z: 1.22 }, 1.0, { sfx: false }]);
  drift(d2 + 1.05, d3, 1.24, { x: X3 + 1300, y: 540 });
  keys.push([d3, { x: X3 + 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
  drift(d3 + 0.85, s.end - 0.1, 1.02);
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
  void S1;
});
