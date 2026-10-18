// 10 收束（close）：分镜 B39，段落 g1、g2。没有章节卡（config.js 在 s.start 用白色刷新闪屏盖住硬切）。
// 站 1：回到订单列表第 2 页（七号订单在末行），筛选、页码、查看各对应一个请求；入口 → 检查 → 数据 → 页面走一遍，停在返回页面。
// 站 2：同一条路线在上，1.5.6.4 对 4.1.0.4 三项对照在中，结论在下并稳定停留 ≥5 秒。
// 事实：g2–g3（每页 20 条、共 46 条）、a1–a6 / L13（演示环境 PHP 5.3.10）、S19-08（mysql 驱动）、b8–b9（.tpl 模板）、C19-05 / C19-06（4.1.0.4：PHP ≥ 8.1、MySQLi、Twig；仍有控制器 / 模型 / 视图装载）。
scene('close', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const SX = (i) => 2100 * i;

  h('style', '', document.head, `
#sc-close .cl-step { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-left: 8px solid var(--req); border-radius: 6px; }
#sc-close .cl-step .t { position: absolute; left: 20px; top: 12px; font: 700 36px/1.2 "Sans SC", "Inter"; color: #1d1d1d; white-space: nowrap; }
#sc-close .cl-step .b { position: absolute; left: 20px; top: 64px; font: 500 26px/1.3 "Sans SC", "Inter"; color: #555; white-space: nowrap; }
#sc-close .cl-pager { position: absolute; font: 500 28px/1.3 "Inter", "Sans SC"; color: #333; white-space: nowrap; padding: 4px 8px; }
#sc-close .cl-pager b { display: inline-block; padding: 0 12px; margin: 0 4px; background: #003A88; color: #fff; border-radius: 4px; }
#sc-close .cl-pager u { color: #000088; margin: 0 8px; }
#sc-close .cl-sel { display: inline-block; width: 140px; height: 44px; border: 2px solid #A9A9A9; background: #fff; }
#sc-close .cl-final { position: absolute; left: 0; width: 1920px; text-align: center; font: 700 44px/1.3 "Sans SC", "Inter"; color: #1d1d1d; }
#sc-close .cl-final b { color: #9A3E10; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const step = (parent, x, y, wd, ht, t, b) => { const e = h('div', 'cl-step', parent); px(e, x, y, wd, ht); h('div', 't', e, t); const be = h('div', 'b', e, b || ''); return { el: e, b: be }; };

  // ═════ 站 1 · 订单列表：三个请求；沿路线走一遍（g1）═════
  let S1 = {};
  {
    stamp(w, 96, 160, 'demo', '示意 · 演示数据');
    const bx = ocBox(w, 96, 214, 1000, 620, '订单', { icon: 'order', buttons: [['插入', 'blue'], ['删除', 'blue']] });
    const cols = [{ label: '订单号', w: 130, align: 'r' }, { label: '顾客', w: 250 }, { label: '状态', w: 180 }, { label: '合计', w: 150, align: 'r' }, { label: '操作', w: 190, align: 'c' }];
    const filt = ['', '<span class="oc-input" style="width:200px;height:44px"></span>', '<span class="cl-sel"></span>', '', '<span class="oc-btn" style="height:44px;line-height:44px;font-size:26px">筛选</span>'];
    const D = [[10, '演示顾客 10', '待处理', '145.00'], [9, '演示顾客 09', '待处理', '140.00'], [8, '演示顾客 08', '待处理', '135.00'], [7, '演示顾客 07', '待处理', '100.00']];
    const tb = ocTable(bx.bd, 26, 20, cols, D.map((r) => [...r, '[ <u>查看</u> ]']), { rowH: 58, filter: filt, alt: true });
    const pager = h('div', 'cl-pager', bx.bd, '<u>|&lt;</u><u>&lt;</u><u>1</u><b>2</b><u>3</u><u>&gt;</u><u>&gt;|</u>　显示 21 到 40 / 共 46 条（3 页）'); css(pager, { left: '26px', top: '412px' });
    const ROW7 = 3;

    // 三个请求的槽位（中间一列）
    const TX = 1130;
    const tF = token(w, 'filter_status', 'req', TX, 300, '请求：按状态筛选');
    const tP = token(w, 'page=2', 'req', TX, 450, '请求：翻到第 2 页');
    const tV = token(w, 'order/info&amp;id=7', 'req', 0, 0, '请求：查看订单 7');
    [tF, tP, tV].forEach((e) => e.setAttribute('data-overlap-ok', ''));
    const ov = ovl(w, 0, 160, 1920, 760);
    // 源 → 槽位的引线：筛选行、页码、七号订单的「查看」
    const yF = 214 + 78 + 20 + 62 + 33, yP = 214 + 78 + 412 + 20, yV = 214 + 78 + 20 + 62 + 66 + ROW7 * 58 + 29;
    const lF = svgLine(ov, `M${96 + 26 + 900},${yF} L${TX - 8},${327}`, 'req', { w: 3 });
    const lP = svgLine(ov, `M${990},${yP} L${TX - 60},${yP} L${TX - 60},${477} L${TX - 8},${477}`, 'req', { w: 3 });
    const lV = svgLine(ov, `M${96 + 26 + 900},${yV} L${TX - 8},${627}`, 'req', { w: 3 });

    // 路线（右列）
    const PX = 1530, PW = 294;
    const P = [['入口', 'index.php · route'], ['检查', '登录 · 会话 · 权限'], ['数据', '模型 → 数据库'], ['页面', '模板 → HTML']].map(([t, b], i) => step(w, PX, 222 + i * 160, PW, 120, t, b));
    const ovP = ovl(w, 0, 160, 1920, 760);
    const pArr = [0, 1, 2].map((i) => svgLine(ovP, `M${PX + PW / 2},${222 + i * 160 + 124} L${PX + PW / 2},${222 + (i + 1) * 160 - 6}`, 'ink', { w: 4 }));
    const back = token(w, 'HTML', 'res', 0, 0, '返回：页面'); back.setAttribute('data-overlap-ok', '');

    // g1_1 回到订单列表（七号订单在第 2 页末行）
    slideDown(bx.el, c0 + 0.15, { d: 0.4 }); sfx('pop', c0 + 0.2, { g: 0.5 });
    tb.mark(ROW7, C('g1_1', '订单列表'), E('g1_1', 0.3), 'mk');
    // g1_2 筛选 / 页码 / 按钮
    const tw = [C('g1_2', '筛选'), C('g1_2', '页码'), C('g1_2', '按钮')];
    hl(tb.filt, tw[0], tw[1]);
    hl(pager, tw[1], tw[2]);
    hl(tb.cell(ROW7, 4), tw[2], E('g1_3', 0.2));
    drawLine(lF, tw[0] + 0.1, 0.35); slide(tF, tw[0] + 0.3, { x: -30, d: 0.35, ease: 'power2.out' }); sfx('blip', tw[0] + 0.3, { g: 0.45 });
    drawLine(lP, tw[1] + 0.1, 0.4); slide(tP, tw[1] + 0.3, { x: -30, d: 0.35, ease: 'power2.out' }); sfx('blip', tw[1] + 0.3, { g: 0.45 });
    drawLine(lV, tw[2] + 0.1, 0.35); appear(tV, tw[2] + 0.3); sfx('blip', tw[2] + 0.3, { g: 0.45 });
    // g1_4 入口、检查、模型、模板依次出现
    const tp = [C('g1_4', '入口'), C('g1_4', '检查'), C('g1_4', '模型'), C('g1_4', '模板')];
    P.forEach((p, i) => { slideDown(p.el, tp[i] - 0.1, { d: 0.3 }); sfx('tick', tp[i] - 0.1, { g: 0.5 }); if (i) drawLine(pArr[i - 1], tp[i] - 0.25, 0.2); });
    // g1_5 三个请求接入路线：同一条路走一遍，停在返回页面
    const tg = C('g1_5', '请求', -0.2), tw5 = E('g1_5') - tg;
    travel(tV, [[tw[2] + 0.3, 0.01, [[TX, 600], [TX, 600]]], [tg, 0.7, [[TX, 600], [PX - 40, 600], [PX - 40, 250], [PX + 20, 250]]]]);
    vanish(tF, tg + 0.1); vanish(tP, tg + 0.1); vanish(tV, tg + 0.75); fadeOut(ov, tg + 0.1, { d: 0.3 });
    const walk = [0, 1, 2, 3].map((i) => tg + 0.7 + i * Math.max(0.35, (tw5 - 1.4) / 4));
    P.forEach((p, i) => { hl(p.el, walk[i], i < 3 ? walk[i + 1] : E('g1_5', 0.3)); sfx('tick', walk[i], { g: 0.35 }); });
    const tBack = walk[3] + 0.3;
    appear(back, tBack);
    travel(back, [[tBack, 0.7, [[PX + 20, 720], [PX - 40, 720], [1060, 720]]]]);
    vanish(back, tBack + 0.75);
    sfx('blip', tBack, { g: 0.45, p: -0.3 });
    reloadFlash(w, 96, 214, 1000, 620, tBack + 0.65, { d: 0.45 });
    tb.mark(ROW7, tBack + 0.85, E('g1_5', 0.4), 'hi');
    S1 = { tg };
  }

  // ═════ 站 2 · 新旧对照与结论（g2）═════
  const X2 = SX(1);
  let S2 = {};
  {
    const X = X2;
    const SW = 380, SG = 69;
    const R = [['入口', '接住请求'], ['检查', '识别用户 · 判断权限'], ['数据', '组织数据'], ['页面', '返回结果']];
    const P = R.map(([t], i) => step(w, X + 96 + i * (SW + SG), 200, SW, 120, t, ''));
    const ov = ovl(w, X, 160, 1920, 200);
    const pArr = [0, 1, 2].map((i) => svgLine(ov, `M${X + 96 + (i + 1) * SW + i * SG + 6},260 L${X + 96 + (i + 1) * (SW + SG) - 8},260`, 'ink', { w: 4 }));

    const cols = [{ label: '变化的地方', w: 300 }, { label: '1.5.6.4 · 2014 年', w: 560 }, { label: '4.1.0.4 · 新版对照', w: 560 }];
    const rows = [['运行环境', 'PHP 5.3.10（演示环境）', 'PHP ≥ 8.1（项目要求）'], ['数据库接口', '<span class="mono">mysql</span>&nbsp;驱动', '<span class="mono">MySQLi</span>&nbsp;驱动'], ['模板写法', '<span class="mono">.tpl</span>（PHP 模板）', 'Twig 模板']];
    const tb = ocTable(w, X + 250, 380, cols, rows, { rowH: 66, headH: 62, alt: true });
    const src = h('div', 'abs t-src', w, '只比这三项：按两个固定版本的源码对照，未运行新版'); px(src, X + 250, 650);
    const keep = stamp(w, X + 1240, 650, 'demo', '两个版本都要完成这些工作');
    const fin = h('div', 'cl-final', w, '看懂这条请求：<b>入口 → 检查 → 数据 → 页面</b><br>就有了理解这些变化的起点'); px(fin, X, 730);

    const tA = E('g1_5', 0.02);
    P.forEach((p, i) => appear(p.el, tA + 0.1 + i * 0.1));
    pArr.forEach((a, i) => drawLine(a, tA + 0.3 + i * 0.1, 0.2));
    // g2_1 三项对照逐行
    appear(tb.el, C('g2_1', '新版', -0.2));
    const tr = [C('g2_1', '运行环境'), C('g2_1', '数据库接口'), C('g2_1', '模板写法')];
    tb.rows.forEach((r, i) => { slideDown(r, tr[i] - 0.15, { d: 0.3 }); sfx('tick', tr[i] - 0.15, { g: 0.5 }); });
    fadeIn(src, E('g2_1', -0.4), { d: 0.3 });
    // g2_2 四件仍在的工作写进路线
    const tk = [C('g2_2', '识别用户'), C('g2_2', '判断权限'), C('g2_2', '组织数据'), C('g2_2', '返回结果')];
    const sub = [0, 1, 2, 3].map((i) => P[i].b);
    keyed(sub[0]).at(tk[0], { html: R[0][1] });
    keyed(sub[1]).at(tk[0], { html: '识别用户' }).at(tk[1], { html: R[1][1] });
    keyed(sub[2]).at(tk[2], { html: R[2][1] });
    keyed(sub[3]).at(tk[3], { html: R[3][1] });
    tk.forEach((t) => sfx('pop', t, { g: 0.4 }));
    hl(P[1].el, tk[0], tk[2]); hl(P[2].el, tk[2], tk[3]); hl(P[3].el, tk[3], E('g2_2', 0.3));
    // g2_3 两个版本都要做；结论提前到位，稳定停留到片尾前
    slam(keep, C('g2_3', '仍是'), { from: 1.2, d: 0.35 }); sfx('thud', C('g2_3', '仍是'), { g: 0.4 });
    fadeIn(fin, C('g2_3', '后台', -0.2), { d: 0.5 }); sfx('chime', C('g2_3', '后台'), { g: 0.4 });
    S2 = { tA, tr };
  }

  // ═════ 镜头 ═════
  const keys = [];
  const drift = (from, to_, z = 1.02, extra = {}) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z, ...extra }, d, { ease: 'none', sfx: false }]); };
  const p1 = C('g1_2', '筛选', -0.6), p2 = C('g1_4', '入口', -0.7);
  drift(c0 + 0.1, p1, 1.015);
  keys.push([p1, { x: 800, y: 540, z: 1.1 }, 0.8, { sfx: false }]);
  drift(p1 + 0.85, p2, 1.12, { x: 800, y: 540 });
  keys.push([p2, { x: 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(p2 + 0.75, S2.tA, 1.02);
  keys.push([S2.tA, { x: X2 + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
  const q1 = S2.tr[0] - 0.6, q2 = C('g2_2', '识别用户', -0.6);
  drift(S2.tA + 0.95, q1, 1.02);
  keys.push([q1, { x: X2 + 960, y: 560, z: 1.08 }, 0.8, { sfx: false }]);
  drift(q1 + 0.85, q2, 1.09, { x: X2 + 960, y: 560 });
  keys.push([q2, { x: X2 + 960, y: 540, z: 1 }, 0.7, { sfx: false }]);
  drift(q2 + 0.75, s.end - 0.1, 1.012);
  keys.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < keys.length; i++) { const p = keys[i - 1]; if (p[0] + p[2] > keys[i][0] - 0.02) p[2] = Math.max(0.12, keys[i][0] - p[0] - 0.02); }
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
});
