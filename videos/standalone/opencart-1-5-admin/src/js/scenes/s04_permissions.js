// 04 权限怎样分配和执行（permissions）：分镜 B15 B16 B17 B18，段落 p1–p7。
// 一个 world，五个站点横向排开（站 i 的左边界 = 2100·i）。同一个「演示店员 / 演示店员组」贯穿全章；
// 去程请求锈橙，拒绝停在检查处并留下中文说明；浅黄只标本句解释的对象。事实：FACTS S19-03…S19-06、R1 perm f2–f9、case j7。
scene('permissions', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const mv = (id) => E(id, -0.3);                         // 站间移动：上一站最后一句结束前 0.3 秒起步
  const SX = (i) => 2100 * i;

  // 本场局部样式（只作用于 #sc-permissions）
  h('style', '', document.head, `
#sc-permissions .pm-scroll { position: absolute; border: 2px solid #CCCCCC; background: #fff; overflow: hidden; }
#sc-permissions .pm-row { position: relative; height: 56px; padding-left: 64px; font: 500 28px/56px "Mono", "Sans SC"; color: #1d1d1d; white-space: nowrap; }
#sc-permissions .pm-row.odd { background: #E4EEF7; }
#sc-permissions .pm-row .zh { position: absolute; right: 18px; top: 0; font: 500 26px/56px "Sans SC", "Inter"; color: #666; }
#sc-permissions .pm-ck { position: absolute; left: 20px; top: 14px; width: 28px; height: 28px; border: 2px solid #8A8A8A; border-radius: 4px;
  background: linear-gradient(180deg, #fff, #E9E9E9); font: 800 26px/26px "Inter"; text-align: center; color: transparent; }
#sc-permissions .pm-ck.on { color: #003A88; border-color: #003A88; }
#sc-permissions .pm-card { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-radius: 8px; }
#sc-permissions .pm-gate { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-left: 8px solid var(--req); border-radius: 6px; }
#sc-permissions .pm-bar { position: absolute; width: 8px; background: var(--req); border-radius: 4px; }
#sc-permissions .pm-res { position: absolute; font: 600 30px/1.3 "Sans SC", "Inter"; white-space: nowrap; }
#sc-permissions .pm-ok { color: #3A6A12; }
#sc-permissions .pm-no { color: #9A1C1C; }
#sc-permissions .pm-dash { position: absolute; border: 3px dashed #9AA4AE; border-radius: 8px; padding: 8px 18px; font: 600 28px/1.25 "Sans SC", "Inter"; color: #666; background: #fff; }
#sc-permissions .pm-sel { position: absolute; height: 52px; border: 2px solid #A9A9A9; background: #fff; font: 500 28px/48px "Sans SC", "Inter"; padding: 0 44px 0 12px; color: #1d1d1d; }
#sc-permissions .pm-sel::after { content: "▾"; position: absolute; right: 12px; top: 0; color: #555; }
#sc-permissions .pm-deny { position: absolute; border: 2px solid #DDDDDD; background: #F7F7F7; text-align: center; padding: 18px; font: 500 28px/1.4 "Sans SC", "Inter"; color: #1d1d1d; white-space: normal; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const ROUTES = [['catalog/product', '商品'], ['sale/customer', '顾客'], ['sale/order', '订单'], ['user/user', '用户管理'], ['user/user_permission', '用户组']];

  // 1.5 的 .scrollbox：带勾选框的路由清单。返回 { el, rows, cks }
  const scrollbox = (parent, x, y, wd, routes) => {
    const el = h('div', 'pm-scroll', parent); px(el, x, y, wd, routes.length * 56 + 4);
    const rows = [], cks = [];
    routes.forEach(([r, zh], i) => {
      const row = h('div', 'pm-row' + (i % 2 ? '' : ' odd'), el, `${r}<span class="zh">${zh}</span>`);
      const ck = h('span', 'pm-ck', row, '√'); rows.push(row); cks.push(ck);
    });
    return { el, rows, cks };
  };
  const check = (ck, t, g = 0.55) => { keyed(ck).at(t, { cls: 'pm-ck on' }); sfx('tick', t, { g }); };

  // ═════ 站 1 · B15 用户 → 用户组；勾选 access / modify，保存进组记录（p1、p2）═════
  let S1 = {};
  {
    const head = h('div', 'abs t-lbl', w, '权限记在<span class="c-title">用户组</span>上'); px(head, 96, 172);
    stamp(w, 1560, 184, 'demo', '示意 · 演示数据');

    const user = ocBox(w, 96, 250, 520, 290, '后台用户', { icon: 'user' });
    const uName = h('div', 'abs t-data', user.bd, '演示店员'); css(uName, { left: '26px', top: '18px', fontWeight: '700' });
    const uFld = h('div', 'abs', user.bd, '<span class="mono" style="font-size:28px">user_group_id</span>  <span class="t-note">所属用户组</span>'); css(uFld, { left: '26px', top: '84px' });
    const uGrp = chip(user.bd, '演示店员组', 26, 136);

    const form = ocBox(w, 680, 230, 1144, 660, '用户组', { icon: 'user', buttons: [['保存', 'blue'], ['取消', 'blue']] });
    const fName = h('div', 'abs t-data', form.bd, '用户组名称：'); css(fName, { left: '26px', top: '22px' });
    const fIn = ocInput(form.bd, 250, 16, 380, '演示店员组');
    const laA = h('div', 'abs t-lbl-s', form.bd, '访问 <span class="mono">access</span>'); css(laA, { left: '26px', top: '96px', padding: '0 10px' });
    const laM = h('div', 'abs t-lbl-s', form.bd, '修改 <span class="mono">modify</span>'); css(laM, { left: '566px', top: '96px', padding: '0 10px' });
    const sbA = scrollbox(form.bd, 26, 152, 520, ROUTES);
    const sbM = scrollbox(form.bd, 566, 152, 520, ROUTES);
    const ok = ocNotice(form.bd, 26, 460, 1060, 'success', '成功：已修改用户组！');

    const rec = ocBox(w, 96, 590, 520, 300, 'oc_user_group 记录', { icon: 'db' });
    const rF = h('div', 'abs', rec.bd, '<span class="mono" style="font-size:28px">permission</span>  <span class="t-note">权限字段</span>'); css(rF, { left: '26px', top: '12px', padding: '0 8px' });
    const rV = h('div', 'abs mono wrap', rec.bd, 'a:2:{s:6:"access";a:2:{…}s:6:"modify";a:1:{…}}'); css(rV, { left: '26px', top: '62px', width: '460px', fontSize: '24px', lineHeight: '34px', wordBreak: 'break-all', color: '#003A88' });
    const rN = h('div', 'abs t-note wrap', rec.bd, '两份清单序列化后存进这一个字段'); css(rN, { left: '26px', top: '146px', width: '460px' });

    const ov = ovl(w, 0, 160, 1920, 760);
    const lnUG = svgLine(ov, 'M616,412 L676,412', 'ink', { w: 4 });
    const lnSave = svgLine(ov, 'M676,760 L622,760', 'req', { w: 4 });
    const lnRead = svgLine(ov, 'M200,544 L200,586', 'req', { w: 4 });

    const tok = token(w, 'user_group_id', 'req', 0, 0, '新请求：查所属的组'); tok.setAttribute('data-overlap-ok', '');

    // p1
    appear(head, c0 + 0.1);
    slideDown(user.el, c0 + 0.15); sfx('pop', c0 + 0.2, { g: 0.5 });
    slide(form.el, C('p1_1', '用户组', -0.3), { x: 60, d: 0.45, ease: 'power2.out' }); sfx('pop', C('p1_1', '用户组', -0.3), { g: 0.55 });
    drawLine(lnUG, C('p1_1', '用户组'), 0.3);
    hl(uGrp, C('p1_1', '用户组'), E('p1_1', 0.3));
    hl(laA, C('p1_2', 'access'), E('p1_2', 0.1));
    hl(laM, C('p1_3', 'modify'), E('p1_3', 0.2));
    sfx('tick', C('p1_2', 'access'), { g: 0.45 }); sfx('tick', C('p1_3', 'modify'), { g: 0.45 });
    // p2：勾选 → 保存 → 写入记录 → 新请求读回
    const tc = C('p2_1', '勾选');
    check(sbA.cks[1], tc); check(sbA.cks[2], tc + 0.25); check(sbM.cks[2], tc + 0.55);
    const tSave = C('p2_2', '保存');
    press(form.btns[0], tSave);
    spinner(form.hd, 1144 - 330, 14, tSave + 0.1, tSave + 0.6, { size: 44 });
    slideDown(ok, tSave + 0.6, { d: 0.4 });
    drawLine(lnSave, C('p2_2', '写入', -0.2), 0.35);
    slideDown(rec.el, C('p2_2', '写入'), { d: 0.4 }); sfx('pop', C('p2_2', '写入'), { g: 0.55 });
    const tReq = C('p2_3', '新请求', -0.1);
    hl(rF, C('p2_3', '查到', 0.2), E('p2_3', 0.3));
    drawLine(lnRead, tReq + 0.1, 0.3);
    appear(tok, tReq); vanish(tok, tReq + 1.15);
    travel(tok, [[tReq, 1.0, [[250, 400], [250, 596]]]]);
    sfx('blip', tReq, { g: 0.5 });
    keyed(rN).at(C('p2_3', '读出来', -0.4), { html: '<span class="c-res" style="font-weight:600">读出：access / modify 两份清单</span>' });
    sfx('pop', C('p2_3', '读出来', -0.4), { g: 0.45 });
    S1 = { tSave, fIn, uName, uFld, rV, rN };
    void fIn; void fName;
  }

  // ═════ 站 2 · B16 打开订单通过；用户管理停在访问检查（p3、p4）═════
  const X2 = SX(1);
  let S2 = {};
  {
    const X = X2;
    const head = h('div', 'abs t-lbl', w, '检查在<span class="c-title">服务器</span>上做'); px(head, X + 96, 172);
    stamp(w, X + 1560, 184, 'demo', '示意 · 演示数据');

    const br = zone(w, 'browser', X + 96, 230, 660, 330, '浏览器 · 演示店员');
    br.addr.innerHTML = 'route=common/home';
    const menuL = h('div', 'abs t-note', w, '菜单里显示的项'); px(menuL, X + 120, 380);
    const mA = chip(w, '订单', X + 120, 432), mB = chip(w, '顾客', X + 260, 432);
    const mGhost = h('div', 'pm-dash', w, '用户管理（菜单里没有）'); px(mGhost, X + 400, 428);

    const srv = zone(w, 'server', X + 800, 230, 600, 660, '服务器', '每个请求都在这里检查');
    const gate = h('div', 'pm-gate', w); px(gate, X + 830, 330, 540, 110);
    h('div', 'abs t-lbl-s', gate, '访问检查 <span class="mono" style="font-size:30px">access</span>').style.cssText += 'left:20px;top:8px';
    const gNote = h('div', 'abs t-note', gate, '取 route 前两段，到访问清单里找'); css(gNote, { left: '20px', top: '58px' });
    const bar = h('div', 'pm-bar', w); px(bar, X + 1300, 448, 8, 112);
    bar.dataset.name = '检查点';

    const card = h('div', 'pm-card', w); px(card, X + 830, 622, 540, 268);
    h('div', 'abs t-lbl-s', card, '演示店员组').style.cssText += 'left:20px;top:10px';
    const aL = h('div', 'abs t-data', card, '访问 <span class="mono" style="font-size:28px">access</span>'); css(aL, { left: '20px', top: '64px' });
    const rc = (r, zh, x, y) => { const e = chip(card, `<span class="mono" style="font-size:24px">${r}</span> ${zh}`, x, y); css(e, { fontSize: '26px', padding: '6px 12px' }); return e; };
    const aC = [rc('sale/order', '订单', 20, 106), rc('sale/customer', '顾客', 262, 106)];
    const mL = h('div', 'abs t-data', card, '修改 <span class="mono" style="font-size:28px">modify</span>'); css(mL, { left: '20px', top: '168px' });
    const mC = rc('sale/order', '订单', 20, 210);

    const page = ocBox(w, X + 1440, 230, 384, 300, '订单', { icon: 'order' });
    const ptb = ocTable(page.bd, 0, 0, [{ label: '订单', w: 110, align: 'r' }, { label: '状态', w: 216 }], [['8', '待处理'], ['7', '待处理']], { rowH: 50, headH: 52, alt: true });
    void ptb;
    const deny = ocBox(w, X + 1440, 570, 384, 320, '没有权限', { icon: 'setting' });
    const dEn = h('div', 'abs t-src', deny.bd, 'Permission Denied!'); css(dEn, { left: '26px', top: '8px' });
    const dBox = h('div', 'pm-deny', deny.bd); px(dBox, 26, 52, 296); dBox.innerHTML = '<span class="mono" style="font-size:26px">user/user</span><br>不在本组的<br>访问清单里';

    const resOk = h('div', 'pm-res pm-ok', w, '√ 在访问清单里：通过'); px(resOk, X + 840, 580);
    const resNo = h('div', 'pm-res pm-no', w, '× 不在访问清单 → 停在这里'); px(resNo, X + 830, 572);
    css(resOk, { background: '#fff', padding: '0 8px' }); css(resNo, { background: '#fff', padding: '0 8px', fontSize: '28px' });

    const tPass = token(w, 'route=sale/order', 'req', 0, 0, '请求：打开订单');
    const tUser = token(w, 'route=user/user', 'req', 0, 0, '请求：打开用户管理');
    const tUser2 = token(w, 'route=user/user', 'req', 0, 0, '手工输入的地址');
    const ov = ovl(w, X, 160, 1920, 760);
    const look = svgLine(ov, `M${X + 1300},562 L${X + 1300},618`, 'dim', { w: 3, dash: '8 8', arrow: false });
    const srvCall = callout(w, X + 830, 166, '判断在服务器上做', { kind: 'hiy' });
    const menuNote = ocNotice(w, X + 96, 600, 660, 'attention', '菜单显示与否，不是允许的依据；<br>决定在服务器的访问检查');

    const tA = mv('p2_3');
    S2.tA = tA;
    appear(head, tA); appear(br.el, tA); appear(srv.el, tA); appear(gate, tA); appear(bar, tA); appear(card, tA);
    [aL, mL].forEach((e) => vanish(e, 0));
    const typed = h('div', 'abs mono', w); px(typed, X + 116, 302, 620, 46); css(typed, { font: '500 26px/46px "Mono", "Sans SC"', padding: '0 14px', background: '#fff' });
    appear(menuL, tA); appear(mA, tA); appear(mB, tA);
    // p3：两份清单
    appear(aL, C('p3_1', '访问清单', -0.2));
    slide(aC[0], C('p3_1', '订单'), { x: -30, d: 0.35 }); sfx('pop', C('p3_1', '订单'), { g: 0.5 });
    slide(aC[1], C('p3_1', '顾客'), { x: -30, d: 0.35 }); sfx('pop', C('p3_1', '顾客'), { g: 0.5 });
    appear(mL, C('p3_2', '修改清单', -0.2));
    slide(mC, C('p3_2', '订单'), { x: -30, d: 0.35 }); sfx('pop', C('p3_2', '订单'), { g: 0.5 });
    // 打开订单：经过检查点，进入订单页
    const t0 = E('p3_1', -0.6);
    keyed(br.addr).at(t0 - 0.2, { html: 'route=sale/order' })
      .at(C('p3_3', '用户管理', -0.5), { html: 'route=user/user' })
      .at(C('p4_2', '手工输入'), { html: '' });
    appear(tPass, t0); vanish(tPass, t0 + 2.3);
    travel(tPass, [[t0, 0.8, [[X + 420, 460], [X + 940, 460]]], [t0 + 1.4, 0.8, [[X + 940, 460], [X + 1460, 460]]]]);
    sfx('blip', t0, { g: 0.5 });
    classAt(aC[0], 'on', t0 + 0.8, t0 + 1.5);
    appear(resOk, t0 + 0.85); vanish(resOk, t0 + 2.2);
    sfx('tick', t0 + 0.9, { g: 0.6 });
    slideDown(page.el, t0 + 2.2, { d: 0.4 });
    // 打开用户管理：停在检查点
    const tu = C('p3_3', '用户管理', -0.2);
    appear(tUser, tu); vanish(tUser, C('p4_2', '手工输入', -0.2));
    travel(tUser, [[tu, 0.9, [[X + 420, 460], [X + 970, 460]]]]);
    sfx('blip', tu, { g: 0.5 });
    drawLine(look, C('p3_3', '检查'), 0.3);
    hl(card, C('p3_3', '检查'), E('p3_3', 0.2));
    const tNo = C('p3_3', '不在');
    appear(resNo, tNo); sfx('error', tNo, { g: 0.35 });
    reloadFlash(w, X + 1440, 570, 384, 320, C('p3_4', '没有权限', -0.15), { d: 0.4 });
    slideDown(deny.el, C('p3_4', '没有权限'), { d: 0.4 }); sfx('thud', C('p3_4', '没有权限'), { g: 0.4 });
    // p4：服务器判断；手工输入地址也经过同一道检查；菜单不是依据
    srvCall.show(C('p4_1', '服务器', -0.2));
    const tTy = C('p4_2', '手工输入');
    appear(typed, tTy);
    const tTyEnd = typeText(typed, 'route=user/user&amp;token=〈占位〉', tTy, 16, { cursorUntil: tTy + 2.6 });
    const tu2 = Math.max(tTyEnd + 0.1, C('p4_2', '同一道', -0.9));
    appear(tUser2, tu2);
    travel(tUser2, [[tu2, 0.9, [[X + 420, 460], [X + 970, 460]]]]);
    sfx('blip', tu2, { g: 0.5 });
    hl(gate, C('p4_2', '同一道'), E('p4_2', 0.3));
    sfx('error', C('p4_2', '访问检查'), { g: 0.3 });
    slide(mGhost, C('p4_3', '菜单', -0.2), { y: 16, d: 0.35 }); sfx('pop', C('p4_3', '菜单', -0.2), { g: 0.5 });
    slideDown(menuNote, C('p4_3', '依据', -0.5), { d: 0.4 });
    S2 = { tA, tu, tTy };
    void dEn;
  }

  // ═════ 站 3 · B17 只读分支示意：同一张七号订单，写请求停在修改检查（p5）═════
  const X3 = SX(2);
  let S3 = {};
  {
    const X = X3;
    const cA = chip(w, '能看订单 · <span class="mono" style="font-size:30px">access</span>', X + 96, 172);
    const neq = h('div', 'abs t-lbl', w, '≠'); css(neq, { color: '#9A3E10' }); px(neq, X + 480, 172);
    const cM = chip(w, '能改订单 · <span class="mono" style="font-size:30px">modify</span>', X + 540, 172);
    const stp = stamp(w, X + 1360, 184, 'demo', '示意 · 按源码分支构造的只读组');

    const ord = ocBox(w, X + 96, 270, 760, 620, '订单 #7', { icon: 'order' });
    const o1 = h('div', 'abs t-data', ord.bd, '订单号　7'); css(o1, { left: '26px', top: '14px' });
    const o2 = h('div', 'abs t-data', ord.bd, '当前状态　<b>待处理</b>'); css(o2, { left: '26px', top: '62px', padding: '0 8px' });
    const o3 = h('div', 'abs t-note', ord.bd, '没有写入，状态保持不变'); css(o3, { left: '330px', top: '68px' });
    const sec = h('div', 'abs t-lbl-s c-title', ord.bd, '添加订单记录'); css(sec, { left: '26px', top: '140px' });
    const selL = h('div', 'abs t-data', ord.bd, '订单状态：'); css(selL, { left: '26px', top: '206px' });
    const sel = h('div', 'pm-sel', ord.bd, '已发货'); px(sel, 200, 200, 200);
    const btn = ocButton(ord.bd, '添加记录', 26, 280, 'blue');
    const warn = ocNotice(ord.bd, 26, 380, 680, 'warning', '写入被拒：本组修改清单里没有 <span class="mono">sale/order</span>');

    const grp = h('div', 'pm-card', w); px(grp, X + 920, 270, 904, 270);
    h('div', 'abs t-lbl-s', grp, '演示店员组（只读示意）').style.cssText += 'left:22px;top:12px';
    const gA = h('div', 'abs t-data', grp, '访问 <span class="mono">access</span>：<span class="mono">sale/order</span> 订单'); css(gA, { left: '22px', top: '84px', padding: '0 8px' });
    const gM = h('div', 'abs t-data', grp, '修改 <span class="mono">modify</span>：<span class="c-dim">（空）</span>'); css(gM, { left: '22px', top: '156px', padding: '0 8px' });

    const g1 = h('div', 'pm-gate', w); px(g1, X + 920, 590, 420, 120);
    h('div', 'abs t-lbl-s', g1, '访问检查').style.cssText += 'left:20px;top:10px';
    const g1r = h('div', 'pm-res pm-ok', g1, '√ 通过'); css(g1r, { left: '20px', top: '62px' });
    const g2 = h('div', 'pm-gate', w); px(g2, X + 1380, 590, 444, 120);
    h('div', 'abs t-lbl-s', g2, '修改检查 <span class="mono" style="font-size:30px">modify</span>').style.cssText += 'left:20px;top:10px';
    const g2r = h('div', 'pm-res pm-no', g2, '× 写入被拒，停在这里'); css(g2r, { left: '20px', top: '62px' });
    const b1 = h('div', 'pm-bar', w); px(b1, X + 1240, 730, 8, 110); b1.dataset.name = '访问检查点';
    const b2 = h('div', 'pm-bar', w); px(b2, X + 1700, 730, 8, 110); b2.dataset.name = '修改检查点';
    const tk = token(w, 'sale/order/history', 'req', 0, 0, '提交：改为已发货');

    const tA = mv('p4_3');
    appear(cA, tA); appear(ord.el, tA); appear(stp, tA); appear(grp, tA); appear(g1, tA); appear(g2, tA); appear(b1, tA); appear(b2, tA);
    vanish(g1r, 0); vanish(g2r, 0);
    appear(neq, C('p5_1', '不能', -0.1)); sfx('tick', C('p5_1', '不能', -0.1), { g: 0.5 });
    slide(cM, C('p5_1', '改订单', -0.2), { x: -30, d: 0.35 }); sfx('pop', C('p5_1', '改订单', -0.2), { g: 0.5 });
    hl(gA, C('p5_1', '能看'), E('p5_1', 0.1));
    // 提交：经过访问检查，停在修改检查
    const tP = C('p5_2', '提交', -0.1);
    hl(sel, tP - 0.4, E('p5_2', 0));
    press(btn, tP);
    appear(tk, tP + 0.15);
    const tStop = C('p5_2', 'modify', -0.2);
    travel(tk, [[tP + 0.15, 1.0, [[X + 420, 768], [X + 860, 768]]], [Math.max(tP + 1.6, tStop - 1.0), 1.0, [[X + 860, 768], [X + 1320, 768]]]]);
    sfx('blip', tP + 0.15, { g: 0.5 });
    appear(g1r, tP + 1.2); sfx('tick', tP + 1.2, { g: 0.6 });
    hl(gM, C('p5_3', '只有', -0.1), E('p5_3', 0.4));
    appear(g2r, C('p5_3', '挡下', -0.1)); sfx('error', C('p5_3', '挡下', -0.1), { g: 0.4 });
    slideDown(warn, C('p5_3', '挡下', 0.2), { d: 0.4 });
    fadeIn(o3, C('p5_3', '挡下', 0.8), { d: 0.4 });
    S3 = { tA, tP };
  }

  // ═════ 站 4 · B18 新控制器先出现在候选清单；授权与写入检查各在一处（p6）═════
  const X4 = SX(3);
  let S4 = {};
  {
    const X = X4;
    const head = h('div', 'abs t-lbl', w, '新功能：先出现在候选清单里'); px(head, X + 96, 172);
    stamp(w, X + 1560, 184, 'demo', '示意 · 新控制器');
    const dir = codeBlock(w, X + 96, 260, 600, ['catalog/product.php', 'sale/customer.php', 'sale/order.php', 'user/user.php', 'user/user_permission.php', 'demo/new_feature.php'], { lang: 'text', title: 'admin/controller/ · 控制器目录' });
    vanish(dir.lines[5], 0);
    css(dir.lines[5], { color: '#9A3E10', fontWeight: '700' });
    const ov = ovl(w, X, 160, 1920, 760);
    const arr = svgLine(ov, `M${X + 704},420 L${X + 790},420`, 'ink', { w: 4 });
    const arrL = h('div', 'abs t-note', w, '列出'); px(arrL, X + 712, 360);

    const form = ocBox(w, X + 800, 250, 1024, 446, '用户组 · 可选功能', { icon: 'user' });
    const hdA = h('div', 'abs t-lbl-s', form.bd, '访问'); css(hdA, { left: '640px', top: '0px' });
    const hdM = h('div', 'abs t-lbl-s', form.bd, '修改'); css(hdM, { left: '820px', top: '0px' });
    const RR = [...ROUTES, ['demo/new_feature', '新功能（示意）']];
    const list = h('div', 'pm-scroll', form.bd); px(list, 0, 52, 970, 6 * 46 + 4);
    const rows = RR.map(([r, zh], i) => {
      const row = h('div', 'pm-row' + (i % 2 ? '' : ' odd'), list, `${r}<span class="zh" style="right:auto;left:420px">${zh}</span>`);
      css(row, { height: '46px', lineHeight: '46px', paddingLeft: '20px' });
      row.querySelector('.zh').style.lineHeight = '46px';
      const ca = h('span', 'pm-ck', row, '√'); css(ca, { left: '660px', top: '8px' });
      const cm = h('span', 'pm-ck', row, '√'); css(cm, { left: '840px', top: '8px' });
      return { row, ca, cm };
    });
    // 已有功能：沿用前面演示店员组的勾选（订单可访问可修改，顾客只访问）
    keyed(rows[1].ca).at(0, { cls: 'pm-ck on' }); keyed(rows[2].ca).at(0, { cls: 'pm-ck on' }); keyed(rows[2].cm).at(0, { cls: 'pm-ck on' });
    const listed = callout(w, X + 1240, 740, '已列出，<b>不等于</b>已授权', { kind: 'hiy' });

    const code = codeBlock(w, X + 96, 716, 1110, ["if (!$this->user->hasPermission('modify', 'demo/new_feature')) {", "  // 没有修改权限：不写入，返回警告"], { lang: 'php', title: '新控制器的写入动作（示意）' });
    code.lines.forEach((l) => css(l, { fontSize: '26px', lineHeight: '46px' }));

    const tA = mv('p5_3');
    appear(head, tA); appear(dir.el, tA); appear(form.el, tA);
    drawLine(arr, C('p6_1', '列出', -0.3), 0.3); fadeIn(arrL, C('p6_1', '列出', -0.3), { d: 0.3 });
    rows.slice(0, 5).forEach((r, i) => { slideDown(r.row, C('p6_1', '列出', 0.1 * i), { d: 0.2 }); });
    sfx('tick', C('p6_1', '列出'), { g: 0.5 });
    appear(dir.lines[5], C('p6_2', '新的控制器', -0.1)); sfx('pop', C('p6_2', '新的控制器', -0.1), { g: 0.6 });
    slideDown(rows[5].row, C('p6_2', '新的控制器', 0.5), { d: 0.4 });
    listed.show(C('p6_2', '新的控制器', 1.0));
    hl(rows[5].row, C('p6_2', '配置权限', -0.2), E('p6_2', 0.2));
    check(rows[5].ca, C('p6_2', '配置权限', 0.1)); check(rows[5].cm, C('p6_2', '配置权限', 0.35));
    wipe(code.el, C('p6_3', '写入动作', -0.4), { dir: 'l', d: 0.5 });
    code.on(0, C('p6_3', '修改检查', -0.1), E('p7_1', 0));
    sfx('pop', C('p6_3', '修改检查', -0.1), { g: 0.5 });
    S4 = { tA };
    void hdA; void hdM;
  }

  // ═════ 站 5 · B18 收束：登录 / 会话 / 权限；订单请求继续去取数据（p7）═════
  const X5 = SX(4);
  let S5 = {};
  {
    const X = X5;
    const head = h('div', 'abs t-lbl', w, '三个问题，三处代码'); px(head, X + 96, 172);
    const BW = 520, BG = 84;
    const R = [['① 登录', 'user', '核对是谁', '用户表 · 口令摘要'], ['② 会话', 'code', '接续身份', '会话里的用户编号'], ['③ 权限', 'setting', '决定能做什么', 'access / modify 清单']];
    const ghosts = R.map((_, i) => { const g = h('div', 'ghost', w, String(i + 1)); px(g, X + 96 + i * (BW + BG), 260, BW, 330); return g; });
    const boxes = R.map(([title, icon, big, note], i) => {
      const b = ocBox(w, X + 96 + i * (BW + BG), 260, BW, 330, title, { icon });
      const p = h('div', 'abs t-lbl', b.bd, big); css(p, { left: '26px', top: '26px' });
      const n = h('div', 'abs t-note', b.bd, note); css(n, { left: '26px', top: '100px' });
      return b;
    });
    const oks = R.map((_, i) => { const e = h('div', 'pm-res pm-ok', w, '√ 通过'); px(e, X + 96 + i * (BW + BG) + BW / 2 - 50, 606); return e; });
    const lane = ovl(w, X, 600, 1920, 200);
    const laneL = svgLine(lane, `M${X + 96},700 L${X + 1700},700`, 'dim', { w: 3, dash: '10 10' });
    const tk = token(w, 'route=sale/order', 'req', 0, 0, '订单请求');
    const next = h('div', 'pm-dash', w, '下一章：去数据库取数据 →'); px(next, X + 1360, 790);
    css(next, { borderColor: '#C4561C', color: '#7A300A' });

    const tA = mv('p6_3');
    appear(head, tA);
    ghosts.forEach((g, i) => wipe(g, tA + 0.3 + i * 0.12, { dir: 't', d: 0.35 }));
    const tb = [C('p7_1', '登录'), C('p7_2', '会话'), C('p7_2', '权限')];
    boxes.forEach((b, i) => { slideDown(b.el, tb[i], { d: 0.4 }); vanish(ghosts[i], tb[i] + 0.4); sfx('pop', tb[i], { g: 0.55 }); });
    drawLine(laneL, C('p7_3', '订单请求', -0.4), 0.5);
    const tt = C('p7_3', '订单请求');
    appear(tk, tt);
    travel(tk, [[tt, 2.0, [[X + 96, 673], [X + 1300, 673]]]]);
    oks.forEach((e, i) => { const ti = tt + 0.25 + i * 0.5; appear(e, ti); sfx('tick', ti, { g: 0.5 }); });
    slide(next, C('p7_3', '取数据', -0.2), { x: -30, d: 0.4 }); sfx('chime', C('p7_3', '取数据'), { g: 0.4 });
    S5 = { tA, tt };
  }

  // ═════ 镜头：一条轨迹 ═════
  const keys = [];
  const drift = (from, to_, z = 1.03, extra = {}) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z, ...extra }, d, { ease: 'none', sfx: false }]); };
  // 站 1：全景 → 推近两列权限 → 拉回看保存与记录 → 稍移看读回
  const t1in = C('p1_2', 'access', -0.5), t1out = C('p2_2', '保存', -0.3);
  drift(c0 + 0.1, t1in, 1.02);
  keys.push([t1in, { x: 1250, y: 560, z: 1.3 }, 1.0, { sfx: false }]);
  drift(t1in + 1.05, t1out, 1.32, { x: 1250, y: 560 });
  keys.push([t1out, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }]);
  drift(t1out + 0.85, S2.tA, 1.03);
  // 站 2：到站 → 推近检查点 → 拉回 → 推近地址栏 → 拉回读结论
  keys.push([S2.tA, { x: X2 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  const t2in = C('p3_3', '用户管理', -0.6), t2out = C('p4_1', '服务器', -0.4), t2addr = C('p4_2', '手工输入', -0.5), t2back = C('p4_3', '菜单', -0.6);
  drift(S2.tA + 1.05, t2in, 1.03);
  keys.push([t2in, { x: X2 + 1150, y: 560, z: 1.22 }, 1.0, { sfx: false }]);
  drift(t2in + 1.05, t2out, 1.24);
  keys.push([t2out, { x: X2 + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(t2out + 0.75, t2addr, 1.02);
  keys.push([t2addr, { x: X2 + 760, y: 540, z: 1.06 }, 1.0, { sfx: false }]);
  drift(t2addr + 1.05, t2back, 1.07);
  keys.push([t2back, { x: X2 + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(t2back + 0.75, S3.tA, 1.02);
  // 站 3：到站 → 推近两道检查 → 拉回读结论
  keys.push([S3.tA, { x: X3 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  const t3in = S3.tP - 0.3, t3out = Math.min(C('p5_3', '挡下', 0.9), S4.tA - 0.8);
  drift(S3.tA + 1.05, t3in, 1.03);
  keys.push([t3in, { x: X3 + 1290, y: 600, z: 1.25 }, 1.0, { sfx: false }]);
  drift(t3in + 1.05, t3out, 1.26);
  keys.push([t3out, { x: X3 + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(t3out + 0.75, S4.tA, 1.02);
  // 站 4：到站 → 推近新的候选行 → 下移看写入检查
  keys.push([S4.tA, { x: X4 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  const t4in = C('p6_2', '新的控制器', -0.4), t4code = C('p6_3', '写入动作', -0.6);
  drift(S4.tA + 1.05, t4in, 1.03);
  keys.push([t4in, { x: X4 + 1230, y: 560, z: 1.2 }, 1.0, { sfx: false }]);
  drift(t4in + 1.05, t4code, 1.22);
  keys.push([t4code, { x: X4 + 960, y: 600, z: 1.1 }, 0.9, { sfx: false }]);
  drift(t4code + 0.95, S5.tA, 1.12);
  // 站 5：到站，全景收束
  keys.push([S5.tA, { x: X5 + 960, y: 540, z: 1 }, 1.0, { g: 0.35 }]);
  drift(S5.tA + 1.05, S5.tt - 0.3, 1.02);
  keys.push([S5.tt - 0.3, { x: X5 + 1000, y: 560, z: 1.0 }, 1.6, { sfx: false }]);
  drift(S5.tt + 1.4, s.end - 0.1, 1.02, { x: X5 + 1000, y: 560 });
  // 关键帧互不重叠（重叠的补间倒着 seek 会停在旧位置）：前一段若压到下一段，就缩短前一段
  keys.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < keys.length; i++) { const p = keys[i - 1]; if (p[0] + p[2] > keys[i][0] - 0.02) p[2] = Math.max(0.12, keys[i][0] - p[0] - 0.02); }
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
  void S1;
});
