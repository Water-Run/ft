// 09 业务怎样沿着它扩展（case）：分镜 B36 B37 B38，段落 f1–f8。
// 顶边固定「匿名案例 · 源码结构示意」（放在场景根元素里，不随镜头动）；三个站点横排（站 i 左边界 = 2100·i）。
// 事实：FACTS A18-02（入口、预动作、分派、模板）、A18-04（订单、采购、称重等业务样本）、A18-05（后续查询、列存 / 关系库归档、导出信号），
// 只用匿名职责名与合成输入；不出现业务文件名、计数之外的私有信息、域名或任何生产状态（REDACTION）。
scene('case', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const mv = (id) => E(id, 0.02);                                 // 站间移动：上一站末句说完再起步
  const SX = (i) => 2100 * i;

  h('style', '', document.head, `
#sc-case .cs-node { position: absolute; background: #fff; border: 2px solid #C9D2DA; border-radius: 8px; }
#sc-case .cs-node .t { position: absolute; left: 20px; top: 12px; font: 700 34px/1.2 "Sans SC", "Inter"; color: #003A88; white-space: nowrap; }
#sc-case .cs-node .b { position: absolute; left: 20px; top: 62px; font: 500 26px/1.3 "Sans SC", "Inter"; color: #555; white-space: nowrap; }
#sc-case .cs-biz { position: absolute; background: #fff; border: 2px solid #C9B7A6; border-top: 8px solid #8A5A36; border-radius: 6px; }
#sc-case .cs-biz.late { border-top-color: var(--req); border-style: dashed; border-top-style: solid; }
#sc-case .cs-biz .t { position: absolute; left: 20px; top: 18px; font: 700 40px/1.2 "Sans SC", "Inter"; color: #3B2414; }
#sc-case .cs-biz .b { position: absolute; left: 20px; top: 84px; font: 500 26px/1.3 "Sans SC", "Inter"; color: #555; white-space: nowrap; }
#sc-case .cs-row { position: absolute; left: 20px; font: 500 26px/40px "Mono", "Sans SC"; color: #1d1d1d; white-space: nowrap; }
#sc-case .cs-swap { position: absolute; left: 20px; top: 112px; width: 316px; height: 112px; border: 3px dashed #9AA4AE; border-radius: 8px; overflow: hidden; }
#sc-case .cs-conn { position: absolute; left: 10px; width: 290px; padding: 8px 14px; border-radius: 6px; font: 600 26px/1.3 "Sans SC", "Inter"; white-space: nowrap; }
#sc-case .cs-conn.a { background: #E4EEF7; color: #073A5C; border: 2px solid #0F6193; }
#sc-case .cs-conn.b { background: #FBE9DF; color: #7A300A; border: 2px solid #C4561C; }
#sc-case .cs-out { position: absolute; left: 20px; width: 236px; padding: 10px 14px; border: 2px solid #C9D2DA; border-radius: 6px; background: #F8F8F8; font: 600 28px/1.25 "Sans SC", "Inter"; color: #1d1d1d; white-space: nowrap; }
#sc-case .cs-mini { position: absolute; padding: 8px 18px; border: 2px solid #C9D2DA; border-radius: 6px; background: #fff; font: 600 28px/1.25 "Sans SC", "Inter"; color: #555; white-space: nowrap; }
#sc-case .cs-arrow { position: absolute; font: 700 30px/1 "Inter"; color: #8E9AA6; }
#sc-case .cs-line { position: absolute; left: 0; right: 0; font: 500 34px/1.4 "Sans SC", "Inter"; color: #1d1d1d; white-space: normal; padding-left: 64px; }
#sc-case .cs-line .n { position: absolute; left: 0; top: 2px; width: 44px; height: 44px; border-radius: 50%; background: #5A3A22; color: #fff; font: 700 26px/44px "Inter"; text-align: center; }
`);

  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  // 顶边条：整章固定，不随镜头
  const strip = caseStrip(root, 96, 168, 1728);
  slideDown(strip, c0 + 0.1, { d: 0.4 }); sfx('pop', c0 + 0.12, { g: 0.45 });

  const node = (parent, x, y, wd, ht, t, b) => {
    const e = h('div', 'cs-node', parent); px(e, x, y, wd, ht);
    h('div', 't', e, t); if (b) h('div', 'b', e, b);
    return e;
  };

  // ═════ 站 1 · B36 官方链路退为背景；案例业务逐项点出（f1、f3）═════
  let S1 = {};
  {
    const lbl = h('div', 'abs t-lbl-s', w, '官方 1.5 的组织方式'); px(lbl, 96, 250);
    const chainWrap = h('div', 'abs', w); px(chainWrap, 0, 0, 1920, 1080);
    const CH = [['入口', 'index.php'], ['预动作', '登录 / 权限'], ['控制器', '组织操作'], ['模型', '取数据'], ['模板', '生成页面']];
    const CW = 300, CG = 57;
    const chain = CH.map(([t, b], i) => node(chainWrap, 96 + i * (CW + CG), 304, CW, 116, t, b));
    const ov = ovl(chainWrap, 0, 300, 1920, 130);
    const chArr = [0, 1, 2, 3].map((i) => svgLine(ov, `M${96 + (i + 1) * CW + i * CG + 6},362 L${96 + (i + 1) * (CW + CG) - 8},362`, 'ink', { w: 4 }));

    const bx = ocBox(w, 96, 470, 1728, 372, 'CASE-A · 一个长期改造的后台', { icon: 'case' });
    const stp = stamp(w, 1500, 486, 'case', '匿名 · 静态测绘');
    const BIZ = [['采购', '采购单据'], ['库存', '出入库'], ['订单', '订单处理'], ['称重', '称重记录'], ['查询', '后来增加'], ['导出', '后来增加']];
    const BW = 250, BG = 30;
    const cards = BIZ.map(([t, b], i) => {
      const e = h('div', 'cs-biz' + (i >= 4 ? ' late' : ''), bx.bd); px(e, 26 + i * (BW + BG), 24, BW, 140);
      h('div', 't', e, t); h('div', 'b', e, b);
      return e;
    });
    const note = ocNotice(bx.bd, 26, 196, 1676, 'attention', '这些都属于案例的<b>后续改造</b>，不能算作官方 1.5 原有的能力');

    // f1：官方链路先完整出现，再退为背景
    fadeIn(lbl, c0 + 0.2, { d: 0.3 });
    chain.forEach((e, i) => slideDown(e, C('f1_1', '官方版本', 0.15 * i), { d: 0.3 }));
    chArr.forEach((a, i) => drawLine(a, C('f1_1', '官方版本', 0.15 * i + 0.25), 0.2));
    sfx('tick', C('f1_1', '官方版本'), { g: 0.5 });
    hl(chain[2], C('f1_1', '组织方式'), C('f1_2', '长期改造'));
    const tDim = C('f1_2', '长期改造');
    tl.fromTo([chainWrap, lbl], { opacity: 1 }, { opacity: 0.32, duration: 0.6, ease: 'sine.inOut', immediateRender: false }, tDim);
    slideDown(bx.el, C('f1_2', '更多工作', -0.3), { d: 0.4 }); sfx('pop', C('f1_2', '更多工作', -0.3), { g: 0.5 });
    slam(stp, C('f1_3', '完全匿名'), { from: 1.25, d: 0.35 }); sfx('thud', C('f1_3', '完全匿名'), { g: 0.4 });
    // f3：业务逐项点出（每次只浅黄一项）
    const tw = [C('f3_1', '采购'), C('f3_1', '库存'), C('f3_1', '订单'), C('f3_1', '称重'), C('f3_2', '查询'), C('f3_2', '导出')];
    cards.forEach((e, i) => {
      slide(e, tw[i] - 0.1, { y: 24, d: 0.35, ease: 'power2.out' });
      sfx(i < 4 ? 'tick' : 'pop', tw[i] - 0.1, { g: 0.5 });
      hl(e, tw[i], i < 5 ? tw[i + 1] : E('f3_2', 0.2));
    });
    slideDown(note, C('f3_3', '长期改造案例', -0.2), { d: 0.4 }); sfx('tick', C('f3_3', '长期改造案例', -0.2), { g: 0.55 });
    S1 = { tDim };
  }

  // ═════ 站 2 · B37 条件 → 控制器 → 连接器（可换）→ 结果 → 列表或导出（f4、f5、f6）═════
  const X2 = SX(1);
  let S2 = {};
  {
    const X = X2;
    const head = h('div', 'abs t-lbl', w, '新功能怎样接进来'); px(head, X + 96, 238);
    const stp = stamp(w, X + 1290, 248, 'demo', '示意 · 合成输入');
    const NY = 340, NH = 290;
    const nCond = node(w, X + 96, NY, 250, NH, '条件', '合成输入');
    const r1 = h('div', 'cs-row', nCond, '日期 第 1–7 天'); css(r1, { top: '120px' });
    const r2 = h('div', 'cs-row', nCond, '状态 已入库'); css(r2, { top: '170px' });
    const nCtl = node(w, X + 410, NY, 290, NH, '控制器', '组织一次操作');
    const ctlR = h('div', 'cs-row', nCtl, '读条件 → 调取数 → 选输出'); css(ctlR, { top: '120px', fontSize: '22px', fontFamily: '"Sans SC"' });
    const nCon = node(w, X + 764, NY, 360, NH, '模型或连接器', '负责取得数据');
    const swap = h('div', 'cs-swap', nCon);
    const conA = h('div', 'cs-conn a', swap, '连接器 A · 关系数据库'); css(conA, { top: '30px' });
    const conB = h('div', 'cs-conn b', swap, '连接器 B · 列存'); css(conB, { top: '30px' });
    const swapL = h('div', 'abs t-src', nCon, '可以更换'); css(swapL, { left: '20px', top: '236px' });
    const nRes = node(w, X + 1188, NY, 290, NH, '结果', '合成记录');
    const rows = ['DEMO-001 演示仓 A', 'DEMO-002 演示仓 A', 'DEMO-003 演示仓 B'].map((t, i) => { const e = h('div', 'cs-row', nRes, t); css(e, { top: 116 + i * 46 + 'px', fontSize: '22px' }); return e; });
    const nOut = node(w, X + 1542, NY, 282, NH, '列表或导出');
    const oList = h('div', 'cs-out', nOut, '列表 · 模板出页面'); css(oList, { top: '80px', fontSize: '24px' });
    const oExp = h('div', 'cs-out', nOut, '导出 · 生成文件'); css(oExp, { top: '150px', fontSize: '24px' });
    const oArc = h('div', 'cs-out', nOut, '归档 · 另存一份'); css(oArc, { top: '220px', fontSize: '24px' });

    const ov = ovl(w, X, 300, 1920, 400);
    const xs = [[346, 410], [700, 764], [1124, 1188], [1478, 1542]];
    const arrs = xs.map(([a, b]) => svgLine(ov, `M${X + a + 4},${NY + 145} L${X + b - 6},${NY + 145}`, 'ink', { w: 4 }));

    // 下方：官方位置仍在（入口 / 权限 / 页面组织）
    const miniL = h('div', 'abs t-note', w, '原有位置'); px(miniL, X + 96, 812);
    const MINI = ['入口', '权限检查', '控制器', '模板 · 页面组织'];
    let mx = X + 250;
    const minis = MINI.map((t, i) => {
      const e = h('div', 'cs-mini', w, t); px(e, mx, 800);
      mx += [130, 190, 160, 260][i] + 56;
      return e;
    });
    const later = stamp(w, X + 764, 640, 'case', '新增数据来源 · 后来的改造');
    const keep = h('div', 'abs callout hiy', w, '不变的组织：条件 → 请求 → 结果'); px(keep, X + 1250, 792);

    const tReq = token(w, '日期 + 状态', 'req', 0, 0, '请求：按条件查询'); tReq.setAttribute('data-overlap-ok', '');
    const tBack = token(w, '3 条记录', 'res', 0, 0, '返回：结果'); tBack.setAttribute('data-overlap-ok', '');

    const tA = mv('f3_3');
    appear(head, tA); appear(stp, tA);
    // f4：控制器、模型或连接器、模板（列表）
    const t41 = C('f4_1', '新功能', -0.2);
    // 先亮出五个空位：新功能要接进的是一条现成的路线
    const slots = [[96, 250], [410, 290], [764, 360], [1188, 290], [1542, 282]].map(([x, sw], i) => {
      const e = h('div', 'abs', w); w.insertBefore(e, w.firstChild); px(e, X + x, NY, sw, NH);
      css(e, { border: '3px dashed #B9C4CE', borderRadius: '6px', background: 'rgba(240,244,247,.6)' });
      fadeIn(e, t41 + 0.5 + i * 0.22, { d: 0.3 }); sfx('tick', t41 + 0.5 + i * 0.22, { g: 0.3 });
      return e;
    });
    slots.forEach(e => fadeOut(e, E('f5_3', 0.2), { d: 0.4 }));
    slideDown(nCtl, C('f4_2', '控制器', -0.2), { d: 0.35 }); sfx('pop', C('f4_2', '控制器', -0.2), { g: 0.5 });
    hl(nCtl, C('f4_2', '控制器'), C('f4_2', '模型或连接器'));
    slideDown(nCon, C('f4_2', '模型或连接器', -0.2), { d: 0.35 }); sfx('pop', C('f4_2', '模型或连接器', -0.2), { g: 0.5 });
    drawLine(arrs[1], C('f4_2', '模型或连接器', 0.1), 0.25);
    hl(nCon, C('f4_2', '模型或连接器'), E('f4_2', 0.1));
    appear(conA, C('f4_2', '模型或连接器', 0.2));
    slideDown(nOut, C('f4_3', '模板', -0.2), { d: 0.35 }); sfx('pop', C('f4_3', '模板', -0.2), { g: 0.5 });
    hl(oList, C('f4_3', '模板'), E('f4_3', 0.3));
    // f5：换连接器；增加归档 / 导出
    const tSw = C('f5_1', '数据连接器', -0.3);
    exit(conA, tSw, { y: -120, d: 0.45, ease: 'power2.in' });
    slide(conB, tSw + 0.25, { y: 120, d: 0.45, ease: 'power2.out' }); sfx('whoosh', tSw, { g: 0.35 });
    appear(swapL, tSw + 0.6);
    slideDown(oArc, C('f5_2', '归档'), { d: 0.3 }); sfx('tick', C('f5_2', '归档'), { g: 0.5 });
    slideDown(oExp, C('f5_2', '导出'), { d: 0.3 }); sfx('tick', C('f5_2', '导出'), { g: 0.5 });
    slideDown(nCond, C('f5_3', '条件', -0.2), { d: 0.35 }); sfx('pop', C('f5_3', '条件', -0.2), { g: 0.5 });
    drawLine(arrs[0], C('f5_3', '请求', -0.2), 0.25);
    slideDown(nRes, C('f5_3', '结果', -0.2), { d: 0.35 }); sfx('pop', C('f5_3', '结果', -0.2), { g: 0.5 });
    drawLine(arrs[2], C('f5_3', '结果'), 0.25); drawLine(arrs[3], C('f5_3', '结果', 0.2), 0.25);
    slide(keep, E('f5_3', -0.6), { y: 16, d: 0.35 });
    // f6：一次合成查询从条件走到输出
    hl(r1, C('f6_1', '日期'), E('f6_1', 0.2)); hl(r2, C('f6_1', '状态'), E('f6_1', 0.2));
    const tGo = E('f6_1', -0.4), tCon = C('f6_2', '数据连接器', -0.3), tRes = C('f6_2', '结果', -0.4);
    appear(tReq, tGo);
    travel(tReq, [[tGo, 0.8, [[X + 120, 660], [X + 430, 660]]], [tCon, 0.8, [[X + 430, 660], [X + 790, 660]]]]);
    vanish(tReq, tRes - 0.05);
    sfx('blip', tGo, { g: 0.5 }); sfx('blip', tCon, { g: 0.45 });
    hl(conB, tCon + 0.5, tRes + 0.4);
    appear(tBack, tRes);
    travel(tBack, [[tRes, 0.7, [[X + 900, 660], [X + 1210, 660]]], [C('f6_2', '列表', -0.2), 0.7, [[X + 1210, 660], [X + 1560, 660]]]]);
    sfx('blip', tRes, { g: 0.45, p: -0.3 });
    rows.forEach((e, i) => appear(e, tRes + 0.5 + i * 0.15));
    hl(oList, C('f6_2', '列表'), C('f6_2', '导出'));
    hl(oExp, C('f6_2', '导出'), E('f6_2', 0.3));
    vanish(tBack, E('f6_2', 0.2));
    // f6_3：入口、权限、页面组织仍有各自位置
    fadeIn(miniL, C('f6_3', '入口', -0.3), { d: 0.3 });
    const tm = [C('f6_3', '入口'), C('f6_3', '权限'), C('f6_3', '权限', 0.3), C('f6_3', '页面组织')];
    minis.forEach((e, i) => { slide(e, tm[i] - 0.1, { x: -24, d: 0.3, ease: 'power2.out' }); sfx('tick', tm[i] - 0.1, { g: 0.4 }); });
    hl(minis[0], tm[0], E('f6_3', 0.2)); hl(minis[3], tm[3], E('f6_3', 0.2));
    // f6_4：新增数据来源 = 后来的改造
    slam(later, C('f6_4', '新增数据来源'), { from: 1.2, d: 0.35 }); sfx('thud', C('f6_4', '新增数据来源'), { g: 0.4 });
    S2 = { tA, tSw, tGo, head };
  }

  // ═════ 站 3 · B38 静态观察结论（f8）═════
  const X3 = SX(2);
  let S3 = {};
  {
    const X = X3;
    const bx = ocBox(w, X + 210, 280, 1500, 520, '静态观察 · 合成示意', { icon: 'case' });
    const L = [
      ['1', '本地源码的<b>静态观察</b>；画面里的数据全部重新构造'],
      ['2', '旧的页面组织方式，可以和后来增加的功能<b>共存</b>'],
    ].map(([n, t], i) => { const e = h('div', 'cs-line', bx.bd); px(e, 40, 40 + i * 110, 1380); e.innerHTML = `<span class="n">${n}</span>${t}`; return e; });
    const warn = ocNotice(bx.bd, 40, 290, 1380, 'attention', '不代表线上每条业务都已经验收');
    const src = h('div', 'abs t-src', bx.bd, '依据：本片 FACTS A18 的匿名静态测绘；未运行业务、未连生产服务'); css(src, { left: '40px', top: '420px' });

    const tA = mv('f6_4');
    slideDown(bx.el, tA + 0.5, { d: 0.4 }); sfx('pop', tA + 0.55, { g: 0.5 });
    slide(L[0], C('f8_1', '静态观察', -0.3), { x: -30, d: 0.4, ease: 'power2.out' }); sfx('tick', C('f8_1', '静态观察', -0.3), { g: 0.5 });
    slide(L[1], C('f8_2', '共存', -0.8), { x: -30, d: 0.4, ease: 'power2.out' }); sfx('tick', C('f8_2', '共存', -0.8), { g: 0.5 });
    fadeIn(src, C('f8_1', '重新构造'), { d: 0.4 });
    slideDown(warn, C('f8_3', '验收', -0.9), { d: 0.4 }); sfx('chime', C('f8_3', '验收', -0.9), { g: 0.4 });
    S3 = { tA };
  }

  // ═════ 镜头 ═════
  const keys = [];
  const drift = (from, to_, z = 1.02, extra = {}) => { const d = to_ - from - 0.05; if (d > 0.3) keys.push([from, { z, ...extra }, d, { ease: 'none', sfx: false }]); };
  // 站 1：全景 → 链路退后时微推向案例框
  drift(c0 + 0.1, S1.tDim, 1.015);
  keys.push([S1.tDim, { x: 960, y: 560, z: 1.04 }, 1.2, { sfx: false }]);
  drift(S1.tDim + 1.25, S2.tA, 1.06, { x: 960, y: 560 });
  // 站 2：到站 → 推近连接器（换连接器）→ 拉回看整条路线
  keys.push([S2.tA, { x: X2 + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
  const pin = S2.tSw - 0.9, pout = C('f5_3', '条件', -0.6);
  drift(S2.tA + 0.95, pin, 1.02);
  fadeOut(S2.head, pin, { d: 0.4 });
  keys.push([pin, { x: X2 + 980, y: 600, z: 1.2 }, 0.9, { sfx: false }]);
  drift(pin + 0.95, pout, 1.22, { x: X2 + 980, y: 600 });
  keys.push([pout, { x: X2 + 960, y: 560, z: 1 }, 0.7, { sfx: false }]);
  drift(pout + 0.75, S3.tA, 1.025, { x: X2 + 960, y: 560 });
  // 站 3：到站，几乎不动地读结论
  keys.push([S3.tA, { x: X3 + 960, y: 540, z: 1 }, 0.9, { g: 0.35 }]);
  drift(S3.tA + 0.95, s.end - 0.1, 1.015);
  keys.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < keys.length; i++) { const p = keys[i - 1]; if (p[0] + p[2] > keys[i][0] - 0.02) p[2] = Math.max(0.12, keys[i][0] - p[0] - 0.02); }
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keys);
});
