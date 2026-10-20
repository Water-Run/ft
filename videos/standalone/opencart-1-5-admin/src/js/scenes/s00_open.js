// 开场（open）：分镜 B01 B02 B40 B41 B42 B43，段落 o1–o8。本片的参照场景，其他场景照这个写法做。
// 一个 world，七个站点横向排开（站心 x = 960 + 2100·i），镜头沿一条轨迹在站间移动；站内单向慢推。
// 每个揭示都挂在旁白的词上：T('r2_o3_3', '商店')；不写死秒数。配音合成后时间自动重排。
scene('open', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);      // 某句（某词）开始
  const E = (id, sh = 0) => Tend('r2_' + id, sh);                 // 某句结束
  const mv = (id) => E(id, 0.02);                                 // 站间移动：上一站最后一句说完才起步（末句文字须在说完时完整可见），0.9 秒后到站
  const SX = (i) => 2100 * i;                                     // 第 i 站的左边界（站心 = SX(i) + 960）

  const w = h('div', 'world', root);
  // 全片第 0 帧镜头不在起点（pitfalls.md）：轨迹第一段开始前，每帧把镜头放回起点
  let camRef = null;
  F((t) => { if (camRef && t < s.start + 0.1) Object.assign(camRef.st, { x: 960, y: 540, z: 1, r: 0 }); });
  const cam = makeCamera(w); camRef = cam;

  // ═════ 站 1 · B01 今天：托管 / 自行部署；后台的日常（o1）═════
  {
    const head = h('div', 'abs t-h1', w, '今天：开一家网店'); px(head, 120, 176);
    stamp(w, 1530, 196, 'demo', '现代后台示意');
    const ca = h('div', 'mod-card', w, '<div class="abs t-h2" style="left:40px;top:40px">托管服务</div><div class="abs t-data wrap" style="left:40px;top:128px;width:740px">例如 Shopify：平台提供主机和商店程序，商家直接开店</div>');
    px(ca, 120, 300, 820, 300);
    const cb = h('div', 'mod-card', w, '<div class="abs t-h2" style="left:40px;top:40px">自行部署商城软件</div><div class="abs t-data wrap" style="left:40px;top:128px;width:740px">自己准备主机，安装开源商城程序，再按需要修改</div>');
    px(cb, 980, 300, 820, 300);
    const rowLbl = h('div', 'abs t-lbl-s c-dim', w, '登录后台以后'); px(rowLbl, 120, 672);
    const pills = ['上架商品', '查看订单', '安排发货'].map((t, i) => { const e = h('div', 'mod-pill', w, '<b></b>' + t); px(e, 440 + i * 420, 660); return e; });

    wipe(head, s.start + 0.1, { dir: 'l', d: 0.5 }); sfx('pop', s.start + 0.15, { g: 0.5 });
    slide(ca, C('o1_1', 'Shopify', -0.3), { y: 40, d: 0.5, ease: 'power2.out' }); sfx('pop', C('o1_1', 'Shopify', -0.3), { g: 0.6 });
    slide(cb, C('o1_2', '部署', -0.2), { y: 40, d: 0.5, ease: 'power2.out' }); sfx('pop', C('o1_2', '部署', -0.2), { g: 0.6 });
    fadeIn(rowLbl, C('o1_3'));
    [['上架商品', 0], ['查看订单', 1], ['安排发货', 2]].forEach(([wd, i]) => { slide(pills[i], C('o1_3', wd), { x: -40, d: 0.4 }); sfx('tick', C('o1_3', wd), { g: 0.6 }); });
  }

  // ═════ 站 2 · B01 十多年前：上传、数据库、安装（o2）═════
  {
    const X = SX(1);
    const head = h('div', 'abs t-h1', w, '十多年前：自行部署一家网店'); px(head, X + 96, 176);
    stamp(w, X + 1730, 196, 'demo', '示意');
    const yr = h('div', 'abs year', w, '2026'); px(yr, X + 96, 284);
    const yrLbl = h('div', 'abs t-lbl c-dim', w, '从今天拨回 2010 年代'); px(yrLbl, X + 520, 360);
    const t0 = C('o2_1', '拨回'), dY = 1.2;
    let lastY = null;
    F((t) => { const v = Math.round(lerp(2026, 2013, ease.io3(clamp((t - t0) / dY)))); if (v !== lastY) { yr.textContent = String(v); lastY = v; } });
    const steps = [
      ['① 上传程序文件', 'code', '把程序文件上传到主机'],
      ['② 准备数据库', 'db', '准备一个 MySQL 数据库'],
      ['③ 运行安装页面', 'setting', '在安装页面里完成设置'],
    ].map(([title, icon, body], i) => {
      const b = ocBox(w, X + 96 + i * 594, 470, 540, 330, title, { icon });
      h('div', 'abs t-data wrap', b.bd, body).style.cssText += 'left:26px;top:24px;width:480px';
      return b;
    });
    const fileRow = h('div', 'abs mono', steps[0].bd, 'upload/  →  主机'); css(fileRow, { left: '26px', top: '150px', fontSize: '30px', color: '#003A88' });
    const dbRow = h('div', 'abs mono', steps[1].bd, 'CREATE DATABASE …'); css(dbRow, { left: '26px', top: '150px', fontSize: '30px', color: '#003A88' });
    const go = ocButton(steps[2].bd, '继续', 26, 150, 'blue');

    appear(head, mv('o1_4')); appear(yr, mv('o1_4'));
    sfx('riser', t0 - 1.2 > mv('o1_4') ? t0 - 1.2 : mv('o1_4'), { g: 0.4 });
    sfx('thud', t0 + dY, { g: 0.6 });
    slide(yrLbl, t0 + dY, { x: -40, d: 0.4 });
    slideDown(steps[0].el, C('o2_3', '上传'), { d: 0.4 }); sfx('pop', C('o2_3', '上传'), { g: 0.5 });
    slideDown(steps[1].el, C('o2_3', '数据库'), { d: 0.4 }); sfx('pop', C('o2_3', '数据库'), { g: 0.5 });
    slideDown(steps[2].el, C('o2_4', '安装页面'), { d: 0.4 }); sfx('pop', C('o2_4', '安装页面'), { g: 0.5 });
    press(go, C('o2_4', '完成设置'));
  }

  // ═════ 站 3 · B02 OpenCart：商店 + 管理后台（o3）═════
  {
    const X = SX(2);
    const strip = h('div', 'abs', w); px(strip, X + 96, 170, 1728, 96); css(strip, { borderRadius: '10px', overflow: 'hidden' });
    const hd = h('div', 'oc-hdr', strip, '<div class="logo">OpenCart</div>');
    const sp = h('div', 'sep', hd); sp.style.left = '292px';
    const adm = h('div', 'adm', hd, '网店程序 · 其中一套'); adm.style.left = '316px';
    const tags = ['免费（指程序许可）', '开源', 'PHP 网店程序'].map((t, i) => { const e = h('div', 'abs oc-btn gray', w, t); px(e, X + 96 + [0, 330, 470][i], 296); return e; });
    stamp(w, X + 1730, 304, 'demo', '示意');

    const store = ocBox(w, X + 96, 400, 840, 470, '商店 · 顾客浏览、下单', { icon: 'case' });
    ['演示商品 A', '演示商品 B', '演示商品 C'].forEach((n, i) => {
      const tile = h('div', 'abs', store.bd); px(tile, 26 + i * 264, 22, 240, 320);
      const img = h('div', 'abs', tile); px(img, 0, 0, 240, 140); css(img, { background: 'linear-gradient(180deg,#EEF1F4,#DCE2E8)', border: '2px solid #CDD4DB' });
      h('div', 'abs t-data', tile, n).style.cssText += 'left:0;top:152px';
      h('div', 'abs t-data c-title', tile, '$' + (100 + i * 5) + '.00').style.cssText += 'left:0;top:198px;font-weight:700';
      const b = h('div', 'abs oc-btn rust', tile, '加入购物车'); px(b, 0, 250);
    });

    const adminWrap = h('div', 'abs', w); px(adminWrap, X + 984, 400, 840, 470); css(adminWrap, { border: '2px solid #DBDBDB' });
    const fr = adminFrame(adminWrap, { w: 836, h: 466, menu: ['控制台', '商品', '销售', '系统'], active: 2, who: false });
    const tb = ocTable(fr.el, 24, 196, [{ label: '订单', w: 130, align: 'r' }, { label: '顾客', w: 330 }, { label: '状态', w: 300 }],
      [['46', '演示顾客 11', '已完成'], ['45', '演示顾客 02', '已发货'], ['44', '演示顾客 10', '已发货']], { rowH: 54, alt: true });
    const admLbl = h('div', 'abs callout', w, '管理后台 · 商家处理商品和订单'); px(admLbl, X + 1140, 820);

    wipe(strip, mv('o2_4'), { dir: 'l', d: 0.6 });
    sfx('thud', C('o3_1', 'OpenCart'), { g: 0.5 });
    [['免费', 0], ['开源', 1], ['PHP', 2]].forEach(([wd, i]) => { slam(tags[i], C('o3_2', wd), { from: 1.2, d: 0.35 }); sfx('tick', C('o3_2', wd), { g: 0.6 }); });
    slide(store.el, C('o3_3', '商店', -0.4), { x: -80, d: 0.5, ease: 'power2.out' }); sfx('pop', C('o3_3', '商店', -0.4), { g: 0.6 });
    slide(adminWrap, C('o3_4', '管理后台', -0.4), { x: 80, d: 0.5, ease: 'power2.out' }); sfx('pop', C('o3_4', '管理后台', -0.4), { g: 0.6 });
    slide(admLbl, C('o3_4', '管理后台', 0.2), { y: 16, d: 0.35 });
    tb.mark(0, C('o3_4', '订单'), E('o3_4', 0.4));
    void fr;
  }

  // ═════ 站 4 · B40 当时的位置：开源商城及其生态（o4）═════
  {
    const X = SX(3);
    const head = h('div', 'abs t-h1', w, '当时的位置'); px(head, X + 96, 176);
    const sub = h('div', 'abs t-lbl', w, '可以自行部署和修改的<span class="c-req">开源商城</span>'); px(sub, X + 96, 270);
    stamp(w, X + 1290, 196, 'demo', '只列同期有据的例子 · 不表示份额');
    const node = h('div', 'abs oc-btn rust', w, 'OpenCart 1.5'); px(node, X + 760, 370); css(node, { font: '700 40px/72px "Inter"', height: '76px', padding: '0 40px' });
    const CW = 500, GAP = 44, X0 = X + 166;
    const cards = [
      ['安装分发', 'setting', '安装工具提供它的程序包', ['例：Softaculous 2014-04-25 更新到 1.5.6.4']],
      ['主题与扩展', 'report', '开发者为它制作主题和订单扩展', ['主题：官方市场条目，创建于 2014-01-04', '订单扩展：Admin Order Edit，2014-03-22']],
      ['继续改造', 'code', '商家可以在现成的商城上继续改造', ['源码公开，可按需修改']],
    ].map(([title, icon, body, src], i) => {
      const b = ocBox(w, X0 + i * (CW + GAP), 520, CW, 330, title, { icon });
      const p = h('div', 'abs t-data wrap', b.bd, body); css(p, { left: '26px', top: '20px', width: CW - 60 + 'px' });
      const qs = src.map((t, j) => { const q = h('div', 'abs t-src wrap', b.bd, t); css(q, { left: '26px', top: 112 + j * 70 + 'px', width: CW - 60 + 'px' }); return q; });
      return { ...b, p, qs };
    });
    const ov = ovl(w, X, 440, 1920, 90);
    const lines = cards.map((_, i) => svgLine(ov, `M${X + 960},${448} L${X + 960},${480} L${X0 + i * (CW + GAP) + CW / 2},${480} L${X0 + i * (CW + GAP) + CW / 2},${516}`, 'dim', { w: 4 }));

    appear(head, mv('o3_4'));
    wipe(sub, C('o4_2', '开源商城', -0.5), { dir: 'l', d: 0.5 });
    slam(node, C('o4_2', '开源商城'), { from: 1.25, d: 0.4 }); sfx('thud', C('o4_2', '开源商城'), { g: 0.5 });
    const tc = [C('o4_3', '安装工具'), C('o4_4', '主题'), C('o4_5', '继续改造', -0.6)];
    cards.forEach((b, i) => { drawLine(lines[i], tc[i] - 0.25, 0.35); slideDown(b.el, tc[i], { d: 0.4 }); sfx('pop', tc[i], { g: 0.55 }); });
    // 第二张卡：说到「主题」先出主题条目，说到「订单扩展」再出扩展条目
    fadeIn(cards[1].qs[1], C('o4_4', '订单扩展'), { d: 0.3 }); sfx('tick', C('o4_4', '订单扩展'), { g: 0.5 });
    hl(cards[0].el, C('o4_3', '安装工具'), C('o4_4', '主题'));
    hl(cards[1].el, C('o4_4', '主题'), C('o4_5', '继续改造', -0.6));
    hl(cards[2].el, C('o4_5', '继续改造', -0.6), E('o4_5', 0.6));
  }

  // ═════ 站 5 · B41 时间轴：2014 年 4 月 / 1.5.6.4；对照 4.1.0.4（o5）═════
  {
    const X = SX(4);
    const head = h('div', 'abs t-h1', w, '本片的版本'); px(head, X + 96, 176);
    const yx = (yr) => X + 200 + (yr - 2011) * 360;
    const ov = ovl(w, X, 300, 1920, 500);
    const axis = svgLine(ov, `M${X + 120},560 L${X + 1500},560`, 'ink', { w: 5, arrow: false });
    const dash = svgLine(ov, `M${X + 1500},560 L${X + 1700},560`, 'dim', { w: 5, arrow: false, dash: '14 12' });
    const ticks = [2011, 2012, 2013, 2014].map((yr) => svgLine(ov, `M${yx(yr)},546 L${yx(yr)},574`, 'ink', { w: 4, arrow: false }));
    const yl = [2011, 2012, 2013, 2014].map((yr) => { const e = h('div', 'abs t-data', w, String(yr)); px(e, yx(yr) - 40, 590); return e; });
    const band = h('div', 'band', w, '<span class="abs t-lbl-s" style="left:18px;top:14px;color:#8A3510">1.5 系列 · 2011–2014</span>'); px(band, yx(2011), 440, yx(2014.33) - yx(2011), 96);
    const mk = svgLine(ov, `M${yx(2014.33)},560 L${yx(2014.33)},400`, 'req', { w: 5, arrow: false });
    const pill = h('div', 'abs oc-btn rust', w, '2014 年 4 月'); px(pill, yx(2014.33) - 210, 322); css(pill, { font: '700 36px/64px "Inter", "Sans SC"', height: '68px' });
    const today = h('div', 'abs oc-btn', w, '对照：4.1.0.4'); px(today, X + 1500, 640); css(today, { font: '700 36px/64px "Inter", "Sans SC"', height: '68px' });
    const todayDot = svgLine(ov, `M${X + 1760},560 L${X + 1760},636`, 'res', { w: 5, arrow: false });
    const q = ocNotice(w, X + 200, 770, 1500, 'attention', '对照着看：哪些做法变了，哪些分工还在');

    appear(head, mv('o4_5'));
    drawLine(axis, mv('o4_5') + 0.3, 0.8); ticks.forEach((tk, i) => drawLine(tk, mv('o4_5') + 0.5 + i * 0.12, 0.15)); yl.forEach((e, i) => fadeIn(e, mv('o4_5') + 0.5 + i * 0.12, { d: 0.3 }));
    drawLine(mk, C('o5_1', '二零一四年', -0.3), 0.3);
    slam(pill, C('o5_1', '二零一四年'), { from: 1.2, d: 0.35 }); sfx('thud', C('o5_1', '二零一四年'), { g: 0.5 });
    keyed(pill).at(C('o5_1', '1.5.6.4'), { html: '2014 年 4 月 · 1.5.6.4' }); sfx('tick', C('o5_1', '1.5.6.4'), { g: 0.6 });
    wipe(band, C('o5_2', '1.5'), { dir: 'l', d: 0.6 });
    drawLine(dash, C('o5_3', '4.1', -0.5), 0.4); drawLine(todayDot, C('o5_3', '4.1', -0.1), 0.2);
    slide(today, C('o5_3', '4.1'), { x: 40, d: 0.4 }); sfx('pop', C('o5_3', '4.1'), { g: 0.6 });
    slideDown(q, C('o5_4', '做法变了', -0.3), { d: 0.4 });
  }

  // ═════ 站 6 · B42 本片路线：认出人 → 找到数据 → 完成操作 → 匿名案例（o6、o7）═════
  {
    const X = SX(5);
    const head = h('div', 'abs t-h1', w, '本片路线'); px(head, X + 96, 176);
    const BW = 390, BG = 56;
    const R = [
      ['① 认出人', 'user', '身份与权限', '登录 → 认出人 → 分配权限'],
      ['② 找到数据', 'db', '订单与页面', '从数据库变成页面'],
      ['③ 完成操作', 'setting', '状态修改', '程序和数据一起变化'],
      ['④ 匿名案例', 'case', '匿名案例', '接上仓储、查询和导出'],
    ];
    const ghosts = R.map((_, i) => { const g = h('div', 'ghost', w, String(i + 1)); px(g, X + 96 + i * (BW + BG), 290, BW, 400); return g; });
    const boxes = R.map(([title, icon, big, note], i) => {
      const b = ocBox(w, X + 96 + i * (BW + BG), 290, BW, 400, title, { icon });
      const p = h('div', 'abs t-lbl wrap', b.bd, big); css(p, { left: '26px', top: '30px', width: BW - 56 + 'px' });
      const n = h('div', 'abs t-note wrap', b.bd, note); css(n, { left: '26px', top: '110px', width: BW - 56 + 'px' });
      if (i === 3) stamp(b.bd, 26, 230, 'case', '匿名 · 结构示意');
      return b;
    });
    const ov = ovl(w, X, 440, 1920, 100);
    const arrows = [0, 1, 2].map((i) => svgLine(ov, `M${X + 96 + (i + 1) * BW + i * BG + 6},490 L${X + 96 + (i + 1) * (BW + BG) - 8},490`, 'req', { w: 5 }));
    const note = ocNotice(w, X + 96, 740, 1728, 'attention', '官方演示里的账号、客户和订单都是合成数据；案例只展示匿名结构');

    appear(head, mv('o5_4'));
    ghosts.forEach((g, i) => wipe(g, mv('o5_4') + 0.4 + i * 0.12, { dir: 't', d: 0.4 }));
    const tb = [C('o6_2', '认出人', -0.5), C('o6_3', '订单', -0.3), C('o6_4', '改一次状态', -0.3), C('o7_1', '匿名', -0.3)];
    boxes.forEach((b, i) => { slideDown(b.el, tb[i], { d: 0.4 }); vanish(ghosts[i], tb[i] + 0.4); sfx('pop', tb[i], { g: 0.55 }); if (i > 0) drawLine(arrows[i - 1], tb[i] - 0.3, 0.3); });
    slideDown(note, C('o7_3', '合成数据', -0.8), { d: 0.4 }); sfx('tick', C('o7_3', '合成数据', -0.8), { g: 0.6 });
  }

  // ═════ 站 7 · B43 回到旧后台：点开订单列表，请求从点击处出发（o8）═════
  let tabX = 0, tabB = 0, P = {};
  {
    const X = SX(6);
    const fr = adminFrame(w, { x: X, y: 0, w: 1920, h: 1080, active: 0, crumb: '<u>首页</u> :: <u>控制台</u>' });
    const tab = box(fr.menu[3], w); tabX = tab.cx; tabB = tab.b;
    stamp(w, X + 1720, 196, 'demo', '示意');
    const dash = ocBox(w, X + 96, 250, 1728, 600, '控制台', { icon: 'report' });
    const tip = ocNotice(dash.bd, 0, 0, 1000, 'attention', '订单在「销售」菜单里：点击后打开订单列表');
    css(tip, { left: '26px', top: '26px' });
    const sh = shot(w, X + 96, 200, 1728, 680, 'design/img/04_order_list.png', { sx: 60, sy: 258, scale: 1 });
    const real = stamp(w, X + 1060, 216, 'real');
    const lbl = h('div', 'abs callout hiy', w, '订单列表'); px(lbl, X + 300, 212);
    const crumb2 = h('div', 'abs oc-crumb', w, '<u>首页</u> :: <u>订单</u>'); px(crumb2, X + 48, 196); css(crumb2, { background: '#fff', paddingRight: '20px' });

    const srv = zone(w, 'server', X + 1930, 300, 360, 440, '服务器', 'Apache + PHP · MySQL');
    const srvNote = h('div', 'abs t-note', w, '第 01 章展开'); px(srvNote, X + 1950, 760);
    const cur = cursor(w, X + 1100, 720);
    const out = token(w, 'route=sale/order', 'req', 0, 0, '请求：打开订单列表');
    const back = token(w, '记录 → HTML', 'res', 0, 0, '返回：页面');

    const tArrive = mv('o7_4') + 0.9;
    const tClick = C('o8_1', '订单列表');
    const tOut = C('o8_2', '请求', -0.2);
    const tBack = C('o8_2', '送回来', -0.9);
    const tLoad = C('o8_2', '送回来', 0.4);
    P = { tArrive, tClick, tOut, tBack, tLoad };

    appear(cur, tArrive);
    travel(cur, [[C('o8_1', '点开', -0.3), Math.max(0.5, tClick - C('o8_1', '点开', -0.3) - 0.1), [[X + 1100, 720], [tabX - 8, tabB - 34]]]]);
    click(cur, tClick);
    fr.setActive(3, tClick);
    spinner(w, X + 1850, 110, tClick + 0.1, tLoad, { size: 40 });
    appear(out, tOut); vanish(out, tOut + 1.3);
    travel(out, [[tOut, 1.2, [[tabX - 60, tabB + 8], [X + 1500, tabB + 8], [X + 1960, 420]]]]);
    sfx('blip', tOut, { g: 0.6 });
    appear(back, tBack); vanish(back, tLoad + 0.05);
    travel(back, [[tBack, 1.1, [[X + 1960, 560], [X + 1500, 560], [X + 1000, 560]]]]);
    sfx('blip', tBack, { g: 0.5, p: -0.3 });
    reloadFlash(w, X, 160, 1920, 920, tLoad - 0.1, { d: 0.5 });
    vanish(fr.el.querySelector('.oc-crumb'), tLoad); vanish(dash.el, tLoad);
    appear(sh, tLoad); appear(real, tLoad); appear(crumb2, tLoad); appear(lbl, tLoad + 0.5); sfx('chime', tLoad + 0.1, { g: 0.45 });
    wipe(srv.el, tOut + 0.2, { dir: 'l', d: 0.5 }); fadeIn(srvNote, tOut + 0.5);

    const why = callout(w, tabX + 110, 300, '这一下点击 → 一次<span class="c-req">请求</span>', { to: [tabX, tabB + 4], kind: 'req' });
    why.show(C('o8_3', '点击', -0.2));
    void dash;
  }

  // ═════ 镜头：一条轨迹 ═════
  const X6 = SX(6);
  const st = [
    [mv('o1_4'), 1], [mv('o2_4'), 2], [mv('o3_4'), 3], [mv('o4_5'), 4], [mv('o5_4'), 5], [mv('o7_4'), 6],
  ];
  const keys = [[s.start + 0.1, { z: 1.03 }, st[0][0] - s.start - 0.3, { ease: 'none', sfx: false }]];
  const drift = (from, to_, z = 1.03) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z }, d, { ease: 'none', sfx: false }]); };
  for (let i = 0; i < st.length; i++) {
    const [t, k] = st[i];
    keys.push([t, { x: SX(k) + 960, y: 540, z: 1 }, 0.9, { g: 0.4 }]);
    if (k === 3) {                                    // 站 4：推近三张卡片，再拉回看提示
      const tin = C('o4_3', '安装工具', -0.4), tout = C('o4_5', '继续改造', -0.2);
      drift(t + 0.95, tin);
      keys.push([tin, { x: SX(k) + 960, y: 600, z: 1.06 }, 1.0, { sfx: false }]);
      drift(tin + 1.05, tout, 1.08);
      keys.push([tout, { y: 560, z: 1 }, 0.7, { sfx: false }]);
      drift(tout + 0.75, st[i + 1][0]);
    } else if (k === 6) {                             // 站 7：拉远露出服务器，页面回来时推回，最后推近点击处
      const tPull = P.tOut - 0.3, tRet = P.tLoad - 0.2, tPush = C('o8_3', '点击', -0.5);
      drift(t + 0.95, tPull);
      keys.push([tPull, { x: X6 + 1250, z: 0.92 }, 0.8, { sfx: false }]);
      keys.push([tRet, { x: X6 + 960, z: 1 }, 0.7, { sfx: false }]);
      keys.push([tPush, { x: tabX + 260, y: 430, z: 1.3 }, 1.0, { sfx: false }]);
      drift(tPush + 1.05, s.end - 0.1, 1.33);
    } else {
      drift(t + 0.95, st[i + 1][0]);
    }
  }
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
});
