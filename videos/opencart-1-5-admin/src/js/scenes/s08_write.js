// 第 08 章（write）：改状态会写下什么。分镜 B31 B32 B33 B34 B35，段落 d1–d9。
// 2×2 世界：Q1 (0,0) 订单 #7 信息页 + 三道检查；Q2 (2100,0) 两条写入语句与两张表；
// Q3 (0,1200) 存储引擎与事务对照；Q4 (2100,1200) 两写之间出错（推断示意）；最后镜头回到 Q1，看返回的 HTML 片段替换历史区，旁边对照自动补全的 JSON。
// 同一个锈橙请求令牌从「添加历史」按钮出发，过三道检查，进入 Q2 的写入。
// 事实：FACTS h1–h15、S19-05、S19-07、S19-11、i13–i15；语句原文取自 lab/out_13_trace.json 的 history_add（POST order_status_id=3、comment=Packed）；
// 事务实验取自 lab/out_16_transaction.txt（MyISAM：1 → 7，回滚后仍 7，Warning 1196；InnoDB 副本：回滚后为 1）。
scene('write', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const QX = 2100, QY = 1200;
  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const st = h('style', '', root);
  st.textContent = `#sc-write .wr-sel{position:absolute;height:52px;border:2px solid #A9A9A9;background:#fff;font:500 28px/48px "Sans SC","Inter";padding:0 44px 0 12px;color:#1d1d1d}
#sc-write .wr-sel::after{content:"▾";position:absolute;right:12px;top:0;color:#555}
#sc-write .wr-sel.hi{background:var(--oc-hi)}
#sc-write .wr-code .ln{font-size:28px;line-height:46px}
#sc-write .oc-table .tr.wr-cur{background:var(--oc-hi);box-shadow:inset 6px 0 0 var(--req)}
#sc-write .wr-gate{position:absolute;background:#F7F9FB;border:2px solid #C9D2DA;border-left:8px solid var(--req);border-radius:6px}
#sc-write .wr-gate .t{position:absolute;left:18px;top:14px;font:700 34px/1.2 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-gate .m{position:absolute;left:18px;top:60px;font:500 24px/1.2 "Mono","Sans SC";color:#0F6193}
#sc-write .wr-ok{position:absolute;font:800 36px/1 "Inter";color:#3A6A12}
#sc-write .wr-no{position:absolute;font:800 36px/1 "Inter";color:#9A1C1C}
#sc-write .token.req{background:linear-gradient(180deg,#BF5822,#A8460F 60%,#8A380B)}
#sc-write .token.ro{background:repeating-linear-gradient(135deg,#5E6A75 0 8px,#46515B 8px 16px);border:2px solid #2E363D}
#sc-write .wr-lane{position:absolute;font:600 28px/1.25 "Sans SC","Inter";color:#1d1d1d;text-align:center}
#sc-write .wr-lane.ro{color:#46515B}
#sc-write .wr-lane .s{display:block;font:500 24px/1.25 "Sans SC","Inter";color:#666}
#sc-write .wr-badge{position:absolute;padding:4px 14px;border:2px solid #5D9B2A;border-radius:6px;background:#EEF6E6;font:600 28px/1.25 "Sans SC","Inter";color:#2F5A0E}
#sc-write .wr-tb .td b{font:600 24px/1.1 "Mono";color:#222;display:block}
#sc-write .wr-tb .td span{font:500 22px/1.2 "Sans SC","Inter";color:#666;display:block}
#sc-write .wr-tb .tr.th .td{flex-direction:column;align-items:flex-start;justify-content:center}
#sc-write .wr-tb .tr.th .td.r{align-items:flex-end}
#sc-write .wr-ttl{position:absolute;font:700 34px/1.25 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-ttl .mono{font:700 32px/1.25 "Mono";color:#003A88}
#sc-write .wr-rel{position:absolute;padding:2px 12px;background:#fff;border:2px solid #2E7D4F;border-radius:6px;font:700 28px/1.3 "Sans SC","Inter";color:#1B5A35}
#sc-write .wr-tag{position:absolute;padding:4px 14px;border-radius:6px;background:var(--oc-hi);border:2px solid #D2A214;font:700 30px/1.25 "Sans SC","Inter";color:#5A4300}
#sc-write .wr-dash{position:absolute;border:3px dashed #9AA4AE;border-radius:8px;padding:8px 18px;font:600 28px/1.3 "Sans SC","Inter";color:#555;background:#fff}
#sc-write .wr-card{position:absolute;background:#fff;border:2px solid #C9D2DA;border-left:8px solid var(--res);border-radius:6px;padding:14px 20px;white-space:normal}
#sc-write .wr-card .t{font:700 36px/1.25 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-card .b{margin-top:8px;font:500 28px/1.35 "Sans SC","Inter";color:#444}
#sc-write .wr-card .b .mono{font:600 30px/1.3 "Mono";color:#003A88}
#sc-write .wr-def{position:absolute;padding:14px 26px;border-left:8px solid var(--res);background:#EEF5FA;font:700 34px/1.3 "Sans SC","Inter";color:#073A5C}
#sc-write .wr-lh{position:absolute;font:700 34px/1.25 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-lh .mono{font:700 32px/1.25 "Mono";color:#003A88}
#sc-write .wr-step{position:absolute;width:262px;height:96px;background:#fff;border:2px solid #C9D2DA;border-top:6px solid #A9B3BD;border-radius:6px}
#sc-write .wr-step.on{background:var(--oc-hi);border-top-color:var(--req)}
#sc-write .wr-step .t{position:absolute;left:14px;top:8px;font:700 30px/1.2 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-step .m{position:absolute;left:14px;top:52px;font:600 22px/1.2 "Mono";color:#0F6193}
#sc-write .wr-val{position:absolute;font:600 30px/52px "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-val .mono{font:600 28px/52px "Mono";color:#222}
#sc-write .wr-num{display:inline-block;min-width:64px;margin-left:12px;padding:0 14px;border:2px solid #9AA4AE;border-radius:6px;background:#fff;font:800 36px/48px "Inter";text-align:center;color:#1d1d1d}
#sc-write .wr-num.chg{background:var(--oc-hi);border-color:var(--req);color:#7A300A}
#sc-write .wr-num.back{background:#E3F0F8;border-color:var(--res);color:#073A5C}
#sc-write .wr-ghostlane{position:absolute;border:3px dashed #A9B3BD;border-radius:8px;background:repeating-linear-gradient(135deg,#fff 0 12px,#F4F6F8 12px 24px);font:600 30px/1.3 "Sans SC","Inter";color:#5E6A75;display:flex;align-items:center;justify-content:center}
#sc-write .wr-src{font:500 22px/1.3 "Inter";color:#7A2222;display:block;margin-top:4px}
#sc-write .wr-wbox{position:absolute;height:146px;background:#fff;border:2px solid #C9D2DA;border-top:8px solid var(--req);border-radius:6px}
#sc-write .wr-wbox .t{position:absolute;left:20px;top:12px;font:700 34px/1.2 "Sans SC","Inter";color:#1d1d1d}
#sc-write .wr-wbox .m{position:absolute;left:20px;top:62px;font:600 26px/1.2 "Mono","Sans SC";color:#0F6193}
#sc-write .wr-wbox .z{position:absolute;left:20px;top:100px;font:500 26px/1.2 "Sans SC","Inter";color:#444}
#sc-write .wr-wbox.hi{background:var(--oc-hi)}
#sc-write .wr-wbox.skip{background:repeating-linear-gradient(135deg,#fff 0 12px,#F1F3F5 12px 24px);border-top-color:#A9B3BD}
#sc-write .wr-wbox.skip .t,#sc-write .wr-wbox.skip .m{color:#5E6A75}
#sc-write .wr-wbox.skip .z{color:#9A1C1C;font-weight:700}
#sc-write .wr-err{position:absolute;font:800 34px/1.2 "Sans SC","Inter";color:#9A1C1C;text-align:center}
#sc-write .wr-ghostrow .td{color:#8A1F1F !important;font-style:italic}
#sc-write .wr-ghostrow{background:repeating-linear-gradient(135deg,#fff 0 10px,#F4F6F8 10px 20px) !important;outline:3px dashed #C23B3B;outline-offset:-3px}
#sc-write .wr-html{position:absolute;background:#FCFCFA;border:2px solid #C9D2DA;border-left:8px solid var(--res);border-radius:6px;overflow:hidden}
#sc-write .wr-html .jh,#sc-write .wr-json .jh{height:52px;padding:0 20px;font:700 26px/52px "Sans SC","Inter"}
#sc-write .wr-html .jh{color:#073A5C;background:linear-gradient(180deg,#F6F6F6,#E4E4E4);border-bottom:2px solid #C9D2DA}
#sc-write .wr-html .jl{padding:0 22px;font:500 26px/40px "Mono";color:#0F6193;white-space:pre}
#sc-write .wr-html .jl i{font-style:normal;color:#8A3A00}
#sc-write .wr-json{position:absolute;background:#1E2A33;border:2px solid #0B141A;border-radius:6px;overflow:hidden}
#sc-write .wr-json .jh{color:#E9F1F7;background:#0F6193;border-bottom:2px solid #0B141A}
#sc-write .wr-json .jl{padding:0 22px;font:500 26px/40px "Mono","Sans SC";color:#D6E2EA;white-space:pre}
#sc-write .wr-json .k{color:#8FD3FF} #sc-write .wr-json .v{color:#FFD58A}
#sc-write .wr-jn{position:absolute;left:22px;bottom:12px;font:500 24px/1.3 "Sans SC","Inter"}
#sc-write .wr-html .wr-jn{color:#555} #sc-write .wr-json .wr-jn{color:#9FB6C6}`;

  const K = []; let tE = s.start;
  const move = (t, to, d, o = { g: 0.4 }) => { K.push([t, to, d, o]); tE = t + d; };
  const drift = (until, z) => { const t0 = tE + 0.15, d = until - t0 - 0.05; if (d > 0.6) { K.push([t0, { z }, d, { ease: 'none', sfx: false }]); tE = t0 + d; } };
  const th = (f, z) => `<b>${f}</b><span>${z}</span>`;

  // ═════ Q1 · B31 订单 #7 信息页 → 添加历史（AJAX）→ 三道检查（d1、d2）═════
  const tLeave1 = E('d2_3', 0.15);
  const offQ1 = tLeave1 + 1.1;                             // 镜头离开 Q1 之后：右侧检查区撤下，回来时换成响应对照
  const tReplace = C('d9_2', '替换');
  let histArea = null;
  {
    const head = h('div', 'abs t-h1', w, '改状态：写入请求要过三道检查'); px(head, 96, 170);
    const box = ocBox(w, 96, 260, 940, 630, '订单 #7 · 演示顾客 07', { icon: 'order' });
    const tabs = ocTabs(w, 120, 358, ['订单详情', '商品', '订单历史'], 0);
    const hist = ocTable(w, 120, 430, [{ label: '记录', w: 160 }, { label: '状态', w: 200 }, { label: '备注', w: 200 }, { label: '通知顾客', w: 200 }], [['第 1 条', '待处理', '', '否']], { rowH: 52, headH: 52 });
    histArea = hist;
    const lS = h('div', 'abs t-data', w, '订单状态：'); px(lS, 120, 716);
    const sel = h('div', 'wr-sel', w, '待处理'); px(sel, 300, 710, 240);
    const lC = h('div', 'abs t-data', w, '备注：'); px(lC, 600, 716);
    const inp = ocInput(w, 700, 710, 300, ''); css(inp, { color: '#1d1d1d', fontFamily: '"Mono"' });
    const btn = ocButton(w, '添加历史', 140, 800);
    const noRe = h('div', 'wr-badge', w, '整页不刷新'); px(noRe, 760, 362);
    const ajax = callout(w, 400, 796, 'AJAX：页面脚本在后台发请求', { kind: 'hiy' });
    const cur = cursor(w, 760, 820);

    // 右侧：三道检查，两条通道（管理员 / 只读用户）
    const G = [['③ 修改权限', 'modify · sale/order', 330], ['② 访问检查', 'access · sale/order', 470], ['① 登录检查', '会话里有用户编号', 610]];
    const gates = G.map(([t, m, y]) => { const e = h('div', 'wr-gate', w, `<span class="t">${t}</span><span class="m">${m}</span>`); px(e, 1080, y, 744, 112); return e; });
    const ov = ovl(w, 1040, 300, 820, 580);
    const sep = [svgLine(ov, 'M1405,320 L1405,790', 'dim', { w: 2, dash: '8 8', arrow: false }), svgLine(ov, 'M1615,320 L1615,790', 'dim', { w: 2, dash: '8 8', arrow: false })];
    const laneA = h('div', 'wr-lane', w, '管理员<span class="s">可修改</span>'); px(laneA, 1410, 806, 200);
    const laneB = h('div', 'wr-lane ro', w, '只读用户<span class="s">只有查看</span>'); px(laneB, 1620, 806, 200);
    const okA = G.map(([, , y]) => { const e = h('div', 'wr-ok', w, '√'); px(e, 1572, y + 38); return e; });
    const okB = [null, ...G.slice(1).map(([, , y]) => { const e = h('div', 'wr-ok', w, '√'); px(e, 1782, y + 38); return e; })];
    const noB = h('div', 'wr-no', w, '×'); px(noB, 1782, 368);
    const warnB = ocNotice(w, 1080, 236, 744, 'warning', '只读用户停在修改权限：不写入');
    const tokA = token(w, 'POST', 'req', 300, 802, ''); tokA.setAttribute('data-overlap-ok', '');
    const tokB = token(w, '只读', 'ro', 1626, 740, ''); tokB.setAttribute('data-overlap-ok', '');
    const right = [...gates, ov, laneA, laneB, ...okA, ...okB.filter(Boolean), noB, warnB, tokB];

    appear(head, c0 + 0.1);
    slideDown(box.el, c0 + 0.1); [tabs.el, hist.el, lS, sel, lC, inp, btn].forEach((e) => appear(e, c0 + 0.5));
    sfx('pop', c0 + 0.1, { g: 0.5 });
    const t7 = C('d1_1', '七号'), tSh = C('d1_1', '已发货');
    hl(box.hd, t7, tSh);
    tabs.select(2, t7 + 0.4);
    appear(cur, c0 + 0.6);
    const tBtn = C('d1_2', '后台请求', -0.2);
    travel(cur, [[tSh - 0.7, 0.6, [[760, 820], [500, 736]]], [tBtn - 0.7, 0.6, [[500, 736], [300, 826]]]]);
    click(cur, tSh - 0.05);
    keyed(sel).at(tSh, { html: '已发货', cls: 'wr-sel hi' }).at(E('d1_3', 0), { cls: 'wr-sel' });
    typeText(inp, 'Packed', tSh + 0.6, 10, { cursorUntil: tBtn - 0.3, sfxGain: 0.5 });
    click(cur, tBtn); press(btn, tBtn);
    vanish(cur, tBtn + 0.5);
    spinner(w, 330, 806, tBtn + 0.1, tReplace, { size: 44 });
    slide(noRe, C('d1_2', '不必刷新'), { y: 12, d: 0.35 }); sfx('pop', C('d1_2', '不必刷新'), { g: 0.45 });
    ajax.show(C('d1_3', 'AJAX', -0.1));
    // 检查区先以虚线占位出现，再随旁白逐道亮起
    gates.forEach((g, i) => wipe(g, C('d1_3', 'AJAX', 0.2 + i * 0.12), { dir: 'l', d: 0.4 }));
    appear(ov, C('d1_3', 'AJAX', 0.5)); fadeIn(laneA, C('d1_3', 'AJAX', 0.6)); fadeIn(laneB, C('d1_3', 'AJAX', 0.6));
    // 令牌 A：按钮 → 通道底部 → 登录 → 访问 → 修改 → 出发去写入（Q2）
    const tL = C('d2_1', '登录'), tAc = C('d2_1', '访问检查'), tMd = C('d2_2', '修改权限');
    const tGo = C('d3_1', '更新', -1.4);
    appear(tokA, tBtn + 0.1); sfx('blip', tBtn + 0.15, { g: 0.55 });
    travel(tokA, [
      [tBtn + 0.15, 1.4, [[300, 802], [1060, 802], [1060, 740], [1418, 740]]],
      [tL - 0.3, 0.5, [[1418, 740], [1418, 640]]],
      [tAc - 0.3, 0.5, [[1418, 640], [1418, 500]]],
      [tMd - 0.3, 0.5, [[1418, 500], [1418, 360]]],
      [E('d2_2', -0.2), 0.7, [[1418, 360], [1418, 262], [1960, 262]]],
      [tGo, 1.3, [[1960, 262], [QX + 40, 262], [QX + 40, 300]]],
    ]);
    fadeIn(okA[2], tAc - 0.3, { d: 0.2 }); sfx('tick', tL, { g: 0.5 });
    fadeIn(okA[1], tMd - 0.3, { d: 0.2 }); sfx('tick', tAc, { g: 0.5 });
    fadeIn(okA[0], E('d2_2', -0.2), { d: 0.2 }); sfx('tick', tMd, { g: 0.55 });
    hl(gates[2], tL - 0.1, tAc - 0.2); hl(gates[1], tAc - 0.1, tMd - 0.2); hl(gates[0], tMd - 0.1, E('d2_3', 0.2));
    // 令牌 B（只读用户）：过登录、访问，停在修改权限
    const tRo = C('d2_3', '查看权限', -0.5), tNo = C('d2_3', '不能');
    appear(tokB, tRo); sfx('blip', tRo, { g: 0.4 });
    travel(tokB, [[tRo, 0.35, [[1626, 740], [1626, 640]]], [tRo + 0.45, 0.35, [[1626, 640], [1626, 500]]], [tRo + 0.9, 0.35, [[1626, 500], [1626, 360]]]]);
    fadeIn(okB[2], tRo + 0.5, { d: 0.2 }); fadeIn(okB[1], tRo + 0.95, { d: 0.2 });
    fadeIn(noB, tNo - 0.1, { d: 0.2 }); sfx('error', tNo - 0.1, { g: 0.45 });
    slideDown(warnB, tNo);
    right.forEach((e) => vanish(e, offQ1));
    vanish(tokA, C('d3_1', '更新', 0.3));
  }
  drift(C('d1_1', '已发货', -0.9), 1.02);
  move(C('d1_1', '已发货', -0.8), { x: 600, y: 600, z: 1.2 }, 0.9, { sfx: false });
  move(C('d1_2', '后台请求', 0.4), { x: 960, y: 540, z: 1 }, 0.8, { sfx: false });
  drift(tLeave1, 1.03);
  move(tLeave1, { x: QX + 960, y: 540, z: 1 }, 1.0);

  // ═════ Q2 · B32 两次写入：先改主表当前状态，再插入历史行（d3）═════
  {
    const X = QX;
    const head = h('div', 'abs t-h1', w, '两次写入：先改当前状态，再记一条历史'); px(head, X + 96, 170);
    const L1 = ['UPDATE `oc_order`', "SET order_status_id = '3', date_modified = NOW()", "WHERE order_id = '7'"];
    const L2 = ['INSERT INTO oc_order_history SET', "order_id = '7', order_status_id = '3',", "notify = '0', comment = 'Packed',", 'date_added = NOW()'];
    const q1 = codeBlock(w, X + 96, 270, 920, L1, { lang: 'sql', title: '写入 1 · 更新订单主表' }); q1.el.classList.add('wr-code');
    const q2 = codeBlock(w, X + 96, 500, 920, L2, { lang: 'sql', title: '写入 2 · 向历史表插入一行' }); q2.el.classList.add('wr-code');
    const src = h('div', 'abs t-src', w, '语句原文：实验记录 out_13_trace（演示环境，状态 3 = 已发货）'); px(src, X + 96, 780);
    const t1 = h('div', 'wr-ttl', w, '<span class="mono">oc_order</span> 订单主表'); px(t1, X + 1080, 262);
    const tb1 = ocTable(w, X + 1080, 312, [{ label: th('order_id', '订单编号'), w: 180, align: 'r' }, { label: th('customer', '顾客'), w: 230 }, { label: th('order_status_id', '当前状态'), w: 330 }],
      [['7', '演示顾客 07', '1 · 待处理']], { rowH: 54, headH: 74 });
    tb1.el.classList.add('wr-tb');
    const t2 = h('div', 'wr-ttl', w, '<span class="mono">oc_order_history</span> 订单历史表'); px(t2, X + 1080, 540);
    const tb2 = ocTable(w, X + 1080, 590, [{ label: th('order_id', '订单编号'), w: 180, align: 'r' }, { label: th('order_status_id', '状态'), w: 260 }, { label: th('comment', '备注'), w: 160 }, { label: th('notify', '通知'), w: 130 }],
      [['7', '1 · 待处理', '', '0']], { rowH: 54, headH: 74 });
    tb2.el.classList.add('wr-tb');
    const ov = ovl(w, X, 160, 2000, 760);
    const rel = svgLine(ov, `M${X + 1060},${440} C${X + 1020},${470} ${X + 1020},${640} ${X + 1060},${700}`, '#2E7D4F', { w: 3, dash: '8 6' });
    const relL = h('div', 'wr-rel', w, '按订单编号关联'); px(relL, X + 1480, 470);
    const tagA = h('div', 'wr-tag', w, '回答：现在是什么状态'); px(tagA, X + 1430, 262);
    const tagB = h('div', 'wr-tag', w, '保留：这次的历史记录'); px(tagB, X + 1430, 820);
    const after = h('div', 'wr-dash', w, '之后还可能有：读取、通知处理（不是这两次写入）'); px(after, X + 96, 826);

    const tA = tLeave1 + 0.1;
    appear(head, tA);
    wipe(t1, tA + 0.3, { dir: 'l', d: 0.4 }); slideDown(tb1.el, tA + 0.4);
    wipe(t2, tA + 0.5, { dir: 'l', d: 0.4 }); slideDown(tb2.el, tA + 0.6);
    const tUp = C('d3_1', '更新'), tCur = C('d3_1', '当前状态'), tIns = C('d3_1', '插入');
    // 写入 1：对象 → 改什么 → 条件
    wipe(q1.el, tUp - 0.3, { dir: 't', d: 0.4 }); sfx('whoosh', tUp - 0.3, { g: 0.3 });
    q1.on(0, tUp - 0.1, tUp + 0.6); q1.on(1, tUp + 0.6, tCur + 0.6); q1.on(2, tCur + 0.6, tIns - 0.2);
    const cS = tb1.cell(0, 2);
    keyed(cS).at(tCur + 0.4, { html: '3 · 已发货' });
    tb1.mark(0, tCur + 0.4, E('d3_2', 0.3), 'wr-cur'); sfx('thud', tCur + 0.4, { g: 0.45 });
    // 写入 2：插入一行
    wipe(q2.el, tIns - 0.4, { dir: 't', d: 0.4 }); sfx('whoosh', tIns - 0.4, { g: 0.3 });
    q2.on(0, tIns - 0.2, tIns + 0.5); q2.on(1, tIns + 0.5, tIns + 1.1); q2.on(2, tIns + 1.1, tIns + 1.7); q2.on(3, tIns + 1.7, E('d3_1', 0.3));
    const nr = tb2.addRow(['7', '3 · 已发货', 'Packed', '0'], tIns + 0.8, { cls: 'wr-cur' }); sfx('pop', tIns + 0.8, { g: 0.55 });
    drawLine(rel, tIns + 1.2, 0.5); fadeIn(relL, tIns + 1.4, { d: 0.3 });
    const tNow = C('d3_2', '现在'), tKeep = C('d3_2', '保留');
    slide(tagA, tNow - 0.1, { y: 12, d: 0.35 }); sfx('pop', tNow - 0.1, { g: 0.45 });
    slide(tagB, tKeep - 0.1, { y: -12, d: 0.35 }); sfx('pop', tKeep - 0.1, { g: 0.45 });
    fadeIn(src, C('d3_3', '两次', -0.2));
    slideDown(after, C('d3_3', '读取', -0.2)); sfx('tick', C('d3_3', '读取', -0.2), { g: 0.45 });
  }
  // 布局已占满画宽，这里不推近（推近会切掉左侧标题与 SQL），只做轻微漂移
  drift(C('d3_3', '两次', -0.45), 1.015);
  move(C('d3_3', '两次', -0.4), { x: QX + 960, y: 540, z: 1 }, 0.7, { sfx: false });

  // ═════ Q3 · B33 存储引擎与事务：开始 → 修改 → 回滚，MyISAM 与 InnoDB 对照（d5、d6、d7）═════
  const tQ3 = E('d3_3', 0.15);
  drift(tQ3, 1.03);
  move(tQ3, { x: 960, y: 540 + QY, z: 1 }, 1.1);
  {
    const Y = QY;
    const head = h('div', 'abs t-h1', w, '存储引擎决定能不能回滚'); px(head, 96, Y + 170);
    const sp = stamp(w, 1420, Y + 190, 'demo', '实验记录 · 同一台 MySQL 5.5');
    const cA = h('div', 'wr-card', w, '<div class="t">官方安装的表</div><div class="b"><span class="mono">ENGINE=MyISAM</span><br>oc_order 等 115 张表全部如此</div>'); px(cA, 96, Y + 262, 520);
    const cB = h('div', 'wr-card', w, '<div class="t">存储引擎</div><div class="b">数据库里负责「表怎样保存、怎样读写」的那一层</div>'); px(cB, 650, Y + 262, 540);
    const engL = h('div', 'abs t-note', w, '实测 · ENGINES 表'); px(engL, 1230, Y + 256);
    const eng = ocTable(w, 1230, Y + 296, [{ label: th('ENGINE', '引擎'), w: 230 }, { label: th('TRANSACTIONS', '支持事务'), w: 330 }], [['MyISAM', 'NO · 不支持']], { rowH: 52, headH: 74 });
    eng.el.classList.add('wr-tb');
    const def = h('div', 'wr-def', w, '事务：把一组修改当作一个整体，要么一起提交，要么一起回滚'); px(def, 96, Y + 452);
    const LN = [[96, 'MyISAM', 'oc_order 原表'], [984, 'InnoDB', '同一行的副本']];
    const steps = [['1 开始', 'START TRANSACTION'], ['2 修改', 'UPDATE … = 7'], ['3 回滚', 'ROLLBACK']];
    const lanes = LN.map(([x, eng_, sub]) => {
      const lh = h('div', 'wr-lh', w, `<span class="mono">${eng_}</span> · ${sub}`); px(lh, x, Y + 548);
      const sb = steps.map(([t, m], i) => { const e = h('div', 'wr-step', w, `<span class="t">${t}</span><span class="m">${m}</span>`); px(e, x + i * 282, Y + 600); return e; });
      const val = h('div', 'wr-val', w, '<span class="mono">order_status_id</span> 状态值'); px(val, x, Y + 714);
      const num = h('span', 'wr-num', val, '1');
      return { lh, sb, val, num, x };
    });
    const ghost = h('div', 'wr-ghostlane', w, 'InnoDB 副本：稍后用同样步骤对照'); px(ghost, 984, Y + 548, 840, 330);
    const warn = ocNotice(w, 96, Y + 786, 840, 'warning', '警告 1196：非事务表的改动没能回滚<span class="wr-src">Some non-transactional changed tables couldn\'t be rolled back</span>');
    const ok = ocNotice(w, 984, Y + 786, 840, 'success', '回滚撤回了修改：值回到 1');
    const arr = [];
    const ov = ovl(w, 0, Y + 160, 1920, 760);
    lanes.forEach((ln) => { for (let i = 0; i < 2; i++) arr.push(svgLine(ov, `M${ln.x + 262 + i * 282},${Y + 648} L${ln.x + 280 + i * 282},${Y + 648}`, 'dim', { w: 3 })); });

    appear(head, tQ3);
    const tMy = C('d5_1', 'MyISAM'), tSe = C('d5_2', '存储引擎'), tNo = C('d5_3', '不支持事务');
    slideDown(cA, tMy - 0.2); sfx('pop', tMy - 0.2, { g: 0.5 });
    slideDown(cB, tSe - 0.1); sfx('pop', tSe - 0.1, { g: 0.5 }); hl(cB, tSe, E('d5_2', 0.2));
    fadeIn(engL, tNo - 0.3); slideDown(eng.el, tNo - 0.3); eng.mark(0, tNo, E('d6_1', 0)); sfx('tick', tNo, { g: 0.55 });
    appear(sp, tNo - 0.3);
    const tTx = C('d6_1', '事务');
    slide(def, tTx, { x: -30, d: 0.45 }); sfx('thud', tTx, { g: 0.4 });
    appear(ghost, tTx + 0.5);
    // MyISAM：开始 → 修改 → 回滚 → 仍是 7
    const M = lanes[0];
    const tOpen = C('d6_2', '开启事务'), tMod = C('d6_2', '修改'), tRb = C('d6_3', '回滚'), tKp = C('d6_4', '保留');
    wipe(M.lh, tOpen - 0.4, { dir: 'l', d: 0.35 }); fadeIn(M.val, tOpen - 0.2);
    slideDown(M.sb[0], tOpen - 0.1); classAt(M.sb[0], 'on', tOpen, tMod - 0.1); sfx('tick', tOpen, { g: 0.5 });
    drawLine(arr[0], tMod - 0.3, 0.25); slideDown(M.sb[1], tMod - 0.1); classAt(M.sb[1], 'on', tMod, tRb - 0.1); sfx('tick', tMod, { g: 0.5 });
    keyed(M.num).at(tMod + 0.3, { html: '7', cls: 'wr-num chg' });
    drawLine(arr[1], tRb - 0.3, 0.25); slideDown(M.sb[2], tRb - 0.1); classAt(M.sb[2], 'on', tRb, tKp); sfx('tick', tRb, { g: 0.5 });
    slideDown(warn, tKp - 0.2); sfx('error', tKp - 0.2, { g: 0.35 });
    // InnoDB：同样三步，回滚后回到 1
    const N = lanes[1];
    const tIn = C('d7_1', 'InnoDB'), tStp = C('d7_1', '这组步骤'), tRb2 = C('d7_2', '回滚'), tBk = C('d7_2', '撤回');
    vanish(ghost, tIn - 0.1);
    wipe(N.lh, tIn - 0.1, { dir: 'l', d: 0.35 }); fadeIn(N.val, tIn);
    eng.addRow(['InnoDB', 'YES · 支持'], tIn + 0.1, { cls: 'hi' }); sfx('pop', tIn + 0.1, { g: 0.5 });
    slideDown(N.sb[0], tIn + 0.4); classAt(N.sb[0], 'on', tIn + 0.4, tStp + 0.2);
    drawLine(arr[2], tStp, 0.25); slideDown(N.sb[1], tStp + 0.2); classAt(N.sb[1], 'on', tStp + 0.2, tRb2 - 0.1); sfx('tick', tStp + 0.2, { g: 0.5 });
    keyed(N.num).at(tStp + 0.5, { html: '7', cls: 'wr-num chg' }).at(tBk, { html: '1', cls: 'wr-num back' });
    drawLine(arr[3], tRb2 - 0.3, 0.25); slideDown(N.sb[2], tRb2 - 0.1); classAt(N.sb[2], 'on', tRb2, tBk + 0.6); sfx('tick', tRb2, { g: 0.5 });
    slideDown(ok, tBk); sfx('chime', tBk, { g: 0.45 });
  }
  drift(C('d6_2', '开启事务', -0.9), 1.03);
  move(C('d6_2', '开启事务', -0.8), { x: 960, y: QY + 620, z: 1.06 }, 0.9, { sfx: false });
  drift(C('d7_1', 'InnoDB', -0.65), 1.1);                 // MyISAM 三步与 InnoDB 之间不能停住
  move(C('d7_1', 'InnoDB', -0.6), { x: 960, y: QY + 540, z: 1 }, 0.7, { sfx: false });

  // ═════ Q4 · B34 两次写入之间出错（推断示意）（d8）═════
  const tQ4 = C('d8_1', '没有', -0.6);
  drift(tQ4, 1.02);
  move(tQ4, { x: QX + 960, y: 540 + QY, z: 1 }, 1.0);
  {
    const X = QX, Y = QY;
    const head = h('div', 'abs t-h1', w, '两次写入之间出错，会怎样？'); px(head, X + 96, Y + 170);
    const sp = stamp(w, X + 1390, Y + 190, 'demo', '推断示意 · 不是故障实录');
    const brL = h('div', 'abs t-lbl-s', w, '没有事务把两次写入绑成一个整体'); px(brL, X + 560, Y + 266); css(brL, { color: '#555' });
    const ov = ovl(w, X, Y + 160, 2000, 760);
    const br = svgLine(ov, `M${X + 110},${Y + 352} L${X + 110},${Y + 330} L${X + 1810},${Y + 330} L${X + 1810},${Y + 352}`, 'dim', { w: 4, dash: '14 10', arrow: false });
    const w1 = h('div', 'wr-wbox', w, '<span class="t">写入 1 · 更新主表</span><span class="m">UPDATE oc_order</span><span class="z">状态改为 3 · 已发货</span>'); px(w1, X + 96, Y + 366, 680);
    const w2 = h('div', 'wr-wbox', w, '<span class="t">写入 2 · 插入历史</span><span class="m">INSERT oc_order_history</span><span class="z">新增一条状态记录</span>'); px(w2, X + 1144, Y + 366, 680);
    const zig = svgLine(ov, `M${X + 800},${Y + 432} L${X + 850},${Y + 400} L${X + 890},${Y + 462} L${X + 940},${Y + 400} L${X + 980},${Y + 462} L${X + 1030},${Y + 400} L${X + 1080},${Y + 462} L${X + 1120},${Y + 432}`, '#C23B3B', { w: 6, arrow: false });
    const err = h('div', 'wr-err', w, '× 中途失败<br><span style="font-size:26px;font-weight:600">（示意）</span>'); px(err, X + 860, Y + 490, 200);
    const tt1 = h('div', 'wr-ttl', w, '<span class="mono">oc_order</span> 当前状态'); px(tt1, X + 96, Y + 560);
    const tb1 = ocTable(w, X + 96, Y + 610, [{ label: '订单编号', w: 180, align: 'r' }, { label: '当前状态', w: 300 }], [['7', '3 · 已发货']], { rowH: 54, headH: 52 });
    const tg1 = h('div', 'wr-tag', w, '已发生的写入保留'); px(tg1, X + 96, Y + 800);
    const tt2 = h('div', 'wr-ttl', w, '<span class="mono">oc_order_history</span> 历史'); px(tt2, X + 1144, Y + 560);
    const tb2 = ocTable(w, X + 1144, Y + 610, [{ label: '订单编号', w: 180, align: 'r' }, { label: '状态', w: 440 }], [['7', '1 · 待处理']], { rowH: 54, headH: 52 });
    const res = ocNotice(w, X + 700, Y + 796, 1124, 'attention', '不会自动一起撤销：状态已改，历史少一条');

    appear(head, tQ4); appear(sp, tQ4);
    slideDown(w1, tQ4 + 0.3); slideDown(w2, tQ4 + 0.45); sfx('tick', tQ4 + 0.3, { g: 0.45 });
    const tBd = C('d8_1', '绑定');
    drawLine(br, tBd - 0.3, 0.6); fadeIn(brL, tBd, { d: 0.35 });
    const tEr = C('d8_2', '出错'), tDn = C('d8_2', '已经发生'), tUn = C('d8_2', '撤销');
    drawLine(zig, tEr - 0.15, 0.3); slam(err, tEr, { from: 1.2, d: 0.35 }); sfx('error', tEr, { g: 0.5 });
    keyed(w2).at(tEr + 0.3, { cls: 'wr-wbox skip', html: '<span class="t">写入 2 · 插入历史</span><span class="m">INSERT oc_order_history</span><span class="z">没有执行</span>' });
    wipe(tt1, tEr + 0.4, { dir: 'l', d: 0.35 }); slideDown(tb1.el, tEr + 0.5);
    wipe(tt2, tEr + 0.4, { dir: 'l', d: 0.35 }); slideDown(tb2.el, tEr + 0.5);
    tb2.addRow(['7', '（缺这一条：3 · 已发货）'], tEr + 0.9, { cls: 'wr-ghostrow' });
    classAt(w1, 'hi', tDn, Infinity); tb1.mark(0, tDn, Infinity); slide(tg1, tDn + 0.1, { y: 12, d: 0.35 }); sfx('pop', tDn + 0.1, { g: 0.45 });
    slideDown(res, tUn - 0.2); sfx('thud', tUn - 0.2, { g: 0.4 });
  }

  // ═════ 回到 Q1 · B35 返回 HTML 片段替换历史区；旁边对照自动补全 JSON（d9）═════
  const tBack = C('d9_1', '服务器', -0.6);
  drift(tBack, 1.02);
  move(tBack, { x: 960, y: 540, z: 1 }, 1.1);
  {
    const hc = h('div', 'wr-html', w); px(hc, 1080, 250, 744, 330);
    h('div', 'jh', hc, '返回：HTML 片段 · 实测 785 字节');
    ['&lt;div class="success"&gt;<i>…</i>&lt;/div&gt;', '&lt;table class="list"&gt;', '  &lt;tr&gt;&lt;td&gt;<i>…</i>&lt;/td&gt; … &lt;/tr&gt;', '&lt;/table&gt;'].forEach((l) => h('div', 'jl', hc, l));
    h('div', 'wr-jn', hc, '带标签的页面片段，浏览器直接放进历史区');
    const jc = h('div', 'wr-json', w); px(jc, 1080, 610, 744, 280);
    h('div', 'jh', jc, '对照：顾客自动补全 · JSON 数据 · 1,972 字节');
    ['[ {<span class="k">"customer_id"</span>:<span class="v">"1"</span>,', '    <span class="k">"name"</span>:<span class="v">"演示顾客 01"</span>, …}, … ]'].forEach((l) => h('div', 'jl', jc, l));
    h('div', 'wr-jn', jc, '只有数据，由页面脚本自己画成建议项');
    const ov = ovl(w, 600, 250, 500, 400);
    const aH = svgLine(ov, 'M1076,420 C1000,420 980,470 900,470', 'res', { w: 4 });
    const tok = token(w, '785 字节 · HTML', 'res', 1400, 300, ''); tok.setAttribute('data-overlap-ok', '');
    // 历史区被替换：成功提示 + 两行的历史表
    const okN = ocNotice(w, 120, 420, 860, 'success', '成功：已修改订单');
    const nh = ocTable(w, 120, 516, [{ label: '记录', w: 160 }, { label: '状态', w: 200 }, { label: '备注', w: 200 }, { label: '通知顾客', w: 200 }], [['第 1 条', '待处理', '', '否'], ['第 2 条', '已发货', 'Packed', '否']], { rowH: 52, headH: 52 });
    const tFr = C('d9_1', '片段', -0.3);
    appear(tok, tFr); sfx('blip', tFr, { g: 0.5 });
    travel(tok, [[tFr, 1.0, [[1400, 300], [1100, 380], [700, 440]]]]);
    vanish(tok, tReplace + 0.1);
    fadeOut(histArea.el, tReplace, { d: 0.2 });
    slideDown(okN, tReplace + 0.15); slideDown(nh.el, tReplace + 0.3); sfx('pop', tReplace + 0.15, { g: 0.55 });
    nh.mark(1, tReplace + 0.5, Infinity, 'hi');
    const tH = C('d9_3', 'HTML');
    slideDown(hc, tH - 0.3, { d: 0.45 }); drawLine(aH, tH + 0.2, 0.4); sfx('pop', tH - 0.3, { g: 0.5 });
        slideDown(jc, C('d9_4', '自动补全', -0.2), { d: 0.45 }); sfx('pop', C('d9_4', '自动补全', -0.2), { g: 0.45 });
  }
  drift(s.end, 1.025);

  cam.track(s.start, { x: 960, y: 540, z: 1 }, K);
});
