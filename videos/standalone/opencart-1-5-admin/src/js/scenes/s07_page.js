// 第 07 章（page）：数据怎样变成页面。分镜 B27 B46 B28 B29 B30，段落 e1–e8。
// 一个 world，站点横排（站 i 左边界 = 2100·i）；站 E、F 各有一个下层子站（y + 1200），镜头竖向下移。
// A：模板把记录变成表格行（e1）  B：页头 / 列表 / 页尾三组控制器→模板拼成一页（e2）  C：PHP 模板与 Twig（e2a）
// D：开头那次点击的实测（e3、e4）  E：正文引用 19 个资源文件（e5）  E2：5×56 页头切片横向重复（e6）
// F：顾客筛选 → autocomplete → JSON → 建议项（e7）  F2：五步查询路径，收在「查询完成」（e8）
// 事实：FACTS i2–i5、i6–i7、i10–i11、i13–i15、C19-05；资源清单取自 lab/out_15_screens/requests.json 的 04_order_list（2 样式、5 脚本、12 图片）。
scene('page', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const SX = (i) => 2100 * i;
  const DY = 1200;                                         // 下层子站的纵向偏移
  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const st = h('style', '', root);
  st.textContent = `#sc-page .pg-code .ln{font-size:28px;line-height:48px}
#sc-page .pg-code .hh{color:#0F6193} #sc-page .pg-code .pp,#sc-page .pg-code .pe{color:#6A1B9A}
#sc-page .pg-code.sh-html .hh,#sc-page .pg-code.sh-echo .pe,#sc-page .pg-code.sh-loop .pp{background:var(--oc-hi)}
#sc-page .pg-tw{color:#0B7A55} #sc-page .pg-tv{color:#6A1B9A}
#sc-page .pg-ghost{position:absolute;border:3px dashed #A9B3BD;border-radius:6px;background:repeating-linear-gradient(135deg,#fff 0 12px,#F4F6F8 12px 24px);font:600 28px/1.2 "Sans SC","Inter";color:#5E6A75;display:flex;align-items:center;justify-content:center}
#sc-page .pg-frame{position:absolute;border:3px solid #8E9AA6;background:#fff}
#sc-page .pg-frame.on{border-color:var(--res);box-shadow:0 0 0 4px rgba(15,97,147,.18)}
#sc-page .pg-foot{position:absolute;background:linear-gradient(180deg,#F2F2F2,#DCDCDC);border-top:2px solid #C8C8C8;font:500 26px/60px "Sans SC","Inter";color:#555;text-align:center}
#sc-page .pg-tag{position:absolute;padding:2px 12px;border-radius:4px;font:700 28px/1.3 "Sans SC","Inter";color:#fff;background:rgba(0,0,0,.28);border:2px solid rgba(255,255,255,.6)}
#sc-page .pg-badge{position:absolute;padding:4px 14px;border:2px solid var(--req);border-radius:6px;background:#fff;font:700 30px/1.25 "Sans SC","Inter";color:#7A300A}
#sc-page .pg-file{position:absolute;width:196px;height:46px;padding:0 10px;border:2px solid #9FB3C4;border-left:6px solid var(--res);border-radius:4px;background:#fff;font:500 22px/42px "Mono","Sans SC";color:#1d1d1d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#sc-page .pg-grp{position:absolute;font:700 34px/1.2 "Sans SC","Inter";color:#1d1d1d}
#sc-page .pg-grp b{font:700 34px/1 "Inter";color:var(--res);margin-left:10px}
#sc-page .pg-slice{position:absolute;border:2px solid #072A44;
  background-image:linear-gradient(90deg,rgba(255,255,255,.22) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.14) 1px,transparent 1px),repeating-linear-gradient(180deg,rgba(255,255,255,0) 0 30px,rgba(255,255,255,.07) 30px 40px),linear-gradient(180deg,#0D4C76,#0F6193);
  background-size:10px 10px,10px 10px,auto,auto}
#sc-page .pg-rep{position:absolute;border:2px solid #072A44;overflow:hidden;
  background-image:linear-gradient(90deg,rgba(255,255,255,.25) 1px,transparent 1px),repeating-linear-gradient(180deg,rgba(255,255,255,0) 0 6px,rgba(255,255,255,.07) 6px 8px),linear-gradient(180deg,#0D4C76,#0F6193);
  background-size:10px 100%,auto,auto}
#sc-page .pg-tile{position:absolute;border:2px solid #222;background-image:linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:4px 4px,4px 4px}
#sc-page .pg-tile.menu{background-color:#3A3A3A;background-image:linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(180deg,#5A5A5A,#2B2B2B);background-size:4px 4px,4px 4px,auto}
#sc-page .pg-tile.sel{background-image:linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(180deg,var(--oc-on-a) 0%,var(--oc-on-b) 45%,var(--oc-on-c) 85%,var(--oc-on-d) 100%);background-size:4px 4px,4px 4px,auto}
#sc-page .pg-json{position:absolute;background:#1E2A33;border:2px solid #0B141A;border-radius:6px;overflow:hidden}
#sc-page .pg-json .jh{height:52px;padding:0 20px;font:700 26px/52px "Mono","Sans SC";color:#E9F1F7;background:#0F6193;border-bottom:2px solid #0B141A}
#sc-page .pg-json .jl{padding:0 22px;font:500 26px/42px "Mono","Sans SC";color:#D6E2EA;white-space:pre}
#sc-page .pg-json .jl.on{background:rgba(255,255,203,.16)}
#sc-page .pg-json .k{color:#8FD3FF} #sc-page .pg-json .v{color:#FFD58A}
#sc-page .pg-json .jn{position:absolute;left:22px;bottom:14px;font:500 24px/1.3 "Sans SC","Inter";color:#9FB6C6}
#sc-page .pg-mhdr{position:absolute;background:linear-gradient(180deg,#0D4C76,#0F6193);font:800 26px/44px "Inter";color:#fff;padding-left:18px}
#sc-page .pg-mmenu{position:absolute;background:linear-gradient(180deg,var(--oc-menu-a),var(--oc-menu-b));display:flex;padding-left:12px}
#sc-page .pg-mmenu span{font:500 22px/38px "Sans SC","Inter";color:#fff;padding:0 16px}
#sc-page .pg-mmenu span.on{background:linear-gradient(180deg,var(--oc-on-a) 0%,var(--oc-on-b) 45%,var(--oc-on-c) 85%,var(--oc-on-d) 100%)}
#sc-page .pg-ac{position:absolute;background:#fff;border:2px solid #AAAAAA;box-shadow:2px 3px 0 rgba(0,0,0,.12)}
#sc-page .pg-ac div{height:46px;padding:0 14px;font:500 26px/46px "Sans SC","Inter";color:#1d1d1d}
#sc-page .pg-ac div.on{background:#FDF5CE;border:1px solid #FBCB09;color:#7A4300}
#sc-page .pg-step{position:absolute;width:300px;height:236px;background:#fff;border:2px solid #C9D2DA;border-top:8px solid var(--req);border-radius:6px;white-space:normal}
#sc-page .pg-step .n{position:absolute;left:18px;top:16px;width:44px;height:44px;border-radius:50%;background:#A8460F;font:800 28px/44px "Inter";color:#fff;text-align:center}
#sc-page .pg-step .t{position:absolute;left:76px;top:14px;font:800 40px/1.2 "Sans SC","Inter";color:#1d1d1d}
#sc-page .pg-step .m{position:absolute;left:18px;top:86px;right:12px;font:600 24px/1.3 "Mono","Sans SC";color:#0F6193}
#sc-page .pg-step .z{position:absolute;left:18px;top:150px;right:12px;font:600 30px/1.3 "Sans SC","Inter";color:#444}
#sc-page .pg-done{position:absolute;padding:14px 40px;border-radius:8px;background:linear-gradient(180deg,#2C7DB3,#0F6193 60%,#0B4C76);border:2px solid #073A5C;font:800 52px/1.2 "Sans SC","Inter";color:#fff}
#sc-page .pg-next{position:absolute;border:3px dashed var(--req);border-radius:8px;padding:10px 22px;font:700 36px/1.25 "Sans SC","Inter";color:#7A300A;background:#fff}
#sc-page .token.req{background:linear-gradient(180deg,#BF5822,#A8460F 60%,#8A380B)}
#sc-page .pg-mark{position:absolute;border:4px solid var(--req);border-radius:4px}
#sc-page .pg-concl{position:absolute;padding:12px 26px;border-left:8px solid var(--res);background:#EEF5FA;font:700 38px/1.3 "Sans SC","Inter";color:#073A5C}`;

  // 镜头关键帧：move 显式起点；drift 填满两次移动之间的空档（不重叠）
  const K = []; let tE = s.start;
  const move = (t, to, d, o = { g: 0.4 }) => { K.push([t, to, d, o]); tE = t + d; };
  const drift = (until, z) => { const t0 = tE + 0.15, d = until - t0 - 0.05; if (d > 0.6) { K.push([t0, { z }, d, { ease: 'none', sfx: false }]); tE = t0 + d; } };

  // ═════ 站 A · B27 模板：每条记录变成一行（e1）═════
  const recs = [[9, '演示顾客 09'], [8, '演示顾客 08'], [7, '演示顾客 07']];
  {
    const head = h('div', 'abs t-h1', w, '模板：每条记录变成一行'); px(head, 96, 170);
    stamp(w, 1700, 190, 'demo', '示意');
    const data = ocBox(w, 96, 260, 560, 340, '控制器交来的数据', { icon: 'code' });
    h('div', 'abs mono', data.bd, '$orders · 页面数据').style.cssText += 'left:26px;top:20px;font-size:28px;color:#003A88';
    const rows = recs.map(([id, c], i) => { const r = h('div', 'abs t-data', data.bd, `${id} 号 · ${c} · 待处理`); css(r, { left: '20px', top: 76 + i * 56 + 'px', padding: '2px 8px' }); return r; });
    const L = [
      '<span class="pp">&lt;?php foreach ($orders as $order) { ?&gt;</span>',
      '<span class="hh">&lt;tr&gt;&lt;td&gt;</span><span class="pe">&lt;?php echo $order[\'order_id\']; ?&gt;</span><span class="hh">&lt;/td&gt;</span>',
      '<span class="hh">    &lt;td&gt;</span><span class="pe">&lt;?php echo $order[\'customer\']; ?&gt;</span><span class="hh">&lt;/td&gt;</span>',
      '<span class="hh">    &lt;td&gt;</span><span class="pe">&lt;?php echo $order[\'status\']; ?&gt;</span><span class="hh">&lt;/td&gt;&lt;/tr&gt;</span>',
      '<span class="pp">&lt;?php } ?&gt;</span>',
    ];
    const code = codeBlock(w, 700, 260, 1124, L, { raw: true, title: 'order_list.tpl（节选、简化 · 示意）' });
    code.el.classList.add('pg-code');
    const n1 = h('div', 'abs code-note', w, '循环语句：每条订单走一遍'); px(n1, 700, 600);
    const n2 = h('div', 'abs code-note', w, '输出语句：把字段写进格子'); px(n2, 1260, 600);
    const tLbl = h('div', 'abs t-lbl-s', w, '生成的表格行（HTML）'); px(tLbl, 96, 620);
    const tb = ocTable(w, 96, 670, [{ label: '订单编号', w: 220, align: 'r' }, { label: '顾客', w: 380 }, { label: '状态', w: 300 }], [], { rowH: 52, headH: 56 });

    wipe(head, c0 + 0.1, { dir: 'l', d: 0.5 }); sfx('pop', c0 + 0.15, { g: 0.5 });
    slideDown(data.el, C('e1_1', '页面数据', -0.3)); sfx('pop', C('e1_1', '页面数据', -0.3), { g: 0.5 });
    wipe(code.el, C('e1_1', '模板', -0.2), { dir: 't', d: 0.5 }); sfx('whoosh', C('e1_1', '模板', -0.2), { g: 0.3 });
    const tH = C('e1_2', 'HTML'), tO = C('e1_2', '输出'), tLp = C('e1_2', '循环');
    classAt(code.el, 'sh-html', tH, tO); classAt(code.el, 'sh-echo', tO, tLp);
    slide(n2, tO, { x: -30, d: 0.4 }); sfx('tick', tO, { g: 0.6 });
    slide(n1, tLp, { x: -30, d: 0.4 }); sfx('tick', tLp, { g: 0.6 });
    const p = 0.85;
    code.on(0, tLp, tLp + 3 * p);
    fadeIn(tLbl, tLp - 0.2); wipe(tb.el, tLp - 0.2, { dir: 'l', d: 0.4 });
    recs.forEach(([id, c], i) => {
      const ti = tLp + 0.2 + i * p;
      hl(rows[i], ti, ti + p);
      tb.addRow([String(id), c, '待处理'], ti + 0.3);
      sfx('tick', ti + 0.3, { g: 0.6 });
    });
    K.push([c0 + 0.1, { z: 1.03 }, Math.max(0.5, C('e1_1', '模板', -0.4) - c0 - 0.2), { ease: 'none', sfx: false }]);
    move(C('e1_1', '模板', -0.3), { x: 1262, y: 450, z: 1.2 }, 1.0, { sfx: false });
    move(C('e1_2', '循环', -0.4), { x: 960, y: 540, z: 1 }, 0.7, { sfx: false });
  }

  // ═════ 站 B · B27 页头、列表、页尾：三组控制器 → 模板，拼成一页（e2）═════
  const tB = E('e1_3', 0.15);                              // 离开站 A：末句说完后再走
  {
    const X = SX(1);
    const head = h('div', 'abs t-h1', w, '页头、列表、页尾拼成一页'); px(head, X + 96, 170);
    const hC = h('div', 'abs t-lbl-s', w, '控制器'); px(hC, X + 96, 268); css(hC, { padding: '0 10px' });
    const hT = h('div', 'abs t-lbl-s', w, '模板'); px(hT, X + 540, 268); css(hT, { padding: '0 10px' });
    const R = [['common/header', '公共页头', 'header.tpl'], ['sale/order', '订单列表', 'order_list.tpl'], ['common/footer', '公共页尾', 'footer.tpl']];
    const ov = ovl(w, X, 160, 2000, 760);
    const rowEls = R.map(([c, zh, tp], i) => {
      const y = 340 + i * 170;
      const g = h('div', 'abs', w); px(g, X + 96, y, 820, 130);
      chip(g, `<span class="mono" style="font-size:30px">${c}</span>`, 0, 0);
      const n = h('div', 'abs t-note', g, zh); px(n, 6, 70);
      const ln = svgLine(ovl(g, 0, 0, 820, 130), 'M330,32 L430,32', 'ink', { w: 4 });
      chip(g, `<span class="mono" style="font-size:30px">${tp}</span>`, 444, 0);
      h('div', 'abs t-note', g, '模板').style.cssText += 'left:450px;top:70px';
      return { g, ln, y };
    });
    // 右侧：页面框，先是三个虚线占位，再逐块填实
    const FX = X + 1000, FY = 270, FW = 824;
    const frame = h('div', 'pg-frame', w); px(frame, FX, FY, FW, 600);
    const pgL = h('div', 'abs t-lbl-s', w, '发给浏览器的页面 · 一份 HTML'); px(pgL, FX, 212); css(pgL, { color: '#073A5C' });
    const gh = [['页头', 4, 160], ['列表内容', 172, 336], ['页尾', 516, 76]].map(([t, y, hh]) => { const e = h('div', 'pg-ghost', w, t); px(e, FX + 6, FY + y, FW - 12, hh); return e; });
    const hdr = adminFrame(w, { x: FX + 3, y: FY + 3, w: FW - 6, h: 164, menu: ['控制台', '销售', '系统'], active: 1, who: false });
    const tagH = h('div', 'pg-tag', w, '页头 · header.tpl'); px(tagH, FX + FW - 290, FY + 112);
    const list = ocBox(w, FX + 20, FY + 180, FW - 40, 320, '订单 · 列表内容', { icon: 'order' });
    const lt = ocTable(w, FX + 40, FY + 272, [{ label: '订单编号', w: 180, align: 'r' }, { label: '顾客', w: 300 }, { label: '状态', w: 220 }], recs.map(([id, c]) => [String(id), c, '待处理']), { rowH: 50, headH: 52 });
    const foot = h('div', 'pg-foot', w, '页尾 · footer.tpl 的输出'); px(foot, FX + 3, FY + 520, FW - 6, 74);
    // 模板 → 页面块的连线
    const lines = [
      svgLine(ov, `M${X + 820},372 C${X + 900},372 ${X + 920},350 ${FX - 8},350`, 'req', { w: 4 }),
      svgLine(ov, `M${X + 840},542 C${X + 910},542 ${X + 930},560 ${FX + 12},560`, 'req', { w: 4 }),
      svgLine(ov, `M${X + 800},712 C${X + 890},712 ${X + 920},826 ${FX - 8},826`, 'req', { w: 4 }),
    ];

    appear(head, tB); appear(hC, tB); appear(hT, tB);
    appear(rowEls[1].g, tB); appear(rowEls[1].ln, tB);
    appear(frame, tB + 0.3); gh.forEach((e) => appear(e, tB + 0.3));
    const tH = C('e2_1', '页头'), tF = C('e2_1', '页尾');
    slide(rowEls[0].g, tH, { x: -30, d: 0.4 }); sfx('pop', tH, { g: 0.5 });
    slide(rowEls[2].g, tF, { x: -30, d: 0.4 }); sfx('pop', tF, { g: 0.5 });
    hl(hC, C('e2_1', '控制器'), C('e2_1', '模板'));
    hl(hT, C('e2_1', '模板'), E('e2_1', 0.2));
    const tO = C('e2_2', '输出'), tL = C('e2_2', '列表'), tZ = C('e2_2', '组合'), tBr = C('e2_2', '浏览器');
    drawLine(lines[0], tO - 0.1, 0.4); drawLine(lines[2], tO, 0.4);
    vanish(gh[0], tO + 0.3); slideDown(hdr.el, tO + 0.3); appear(tagH, tO + 0.7); sfx('tick', tO + 0.3, { g: 0.55 });
    vanish(gh[2], tO + 0.4); slideDown(foot, tO + 0.4); sfx('tick', tO + 0.45, { g: 0.5 });
    drawLine(lines[1], tL - 0.1, 0.4);
    vanish(gh[1], tL + 0.2); slideDown(list.el, tL + 0.2); slideDown(lt.el, tL + 0.35); sfx('pop', tL + 0.2, { g: 0.55 });
    classAt(frame, 'on', tZ, Infinity);
    slide(pgL, tBr - 0.2, { y: 14, d: 0.4 }); sfx('blip', tBr, { g: 0.5 });
  }
  drift(tB, 1.02);
  move(tB, { x: SX(1) + 960, y: 540, z: 1 }, 0.9);

  // ═════ 站 C · B46 PHP 模板与 Twig：写法不同，职责相同（e2a）═════
  const tC = C('e2a_1', '改用', -0.6);                     // 页面合成稳定约 5 秒后才离开
  drift(tC, 1.03);
  move(tC, { x: SX(2) + 960, y: 540, z: 1 }, 0.9);
  {
    const X = SX(2);
    const head = h('div', 'abs t-h1', w, '模板写法变了，职责没变'); px(head, X + 96, 170);
    const sp = stamp(w, X + 1100, 190, 'demo', '写法示意 · 新版只核对源码，未运行');
    const data = chip(w, '控制器交来的数据 · <span class="mono" style="font-size:28px">7 号 · 演示顾客 07</span>', X + 560, 262);
    const LP = [
      '<span class="pp">&lt;?php foreach ($orders as $order) { ?&gt;</span>',
      '<span class="hh">&lt;td&gt;</span><span class="pe">&lt;?php echo $order[\'customer\']; ?&gt;</span><span class="hh">&lt;/td&gt;</span>',
    ];
    const LT = [
      '<span class="pg-tw">{% for order in orders %}</span>',
      '<span class="hh">&lt;td&gt;</span><span class="pg-tv">{{ order.customer }}</span><span class="hh">&lt;/td&gt;</span>',
    ];
    const cP = codeBlock(w, X + 96, 360, 840, LP, { raw: true, title: 'OpenCart 1.5.6.4 · PHP 模板（.tpl）' }); cP.el.classList.add('pg-code');
    const cT = codeBlock(w, X + 984, 360, 840, LT, { raw: true, title: 'OpenCart 4.1.0.4 · Twig 模板' }); cT.el.classList.add('pg-code');
    const nP = [h('div', 'abs code-note', w, '第 1 行 循环：每条订单走一遍'), h('div', 'abs code-note', w, '第 2 行 输出：顾客名写进格子')];
    const nT = [h('div', 'abs code-note', w, '第 1 行 循环：同样每条走一遍'), h('div', 'abs code-note', w, '第 2 行 输出：同样写进格子')];
    nP.forEach((n, i) => px(n, X + 96, 540 + i * 56)); nT.forEach((n, i) => px(n, X + 984, 540 + i * 56));
    const ov = ovl(w, X, 160, 1920, 760);
    const aIn = [svgLine(ov, `M${X + 700},318 L${X + 516},356`, 'req', { w: 4 }), svgLine(ov, `M${X + 1220},318 L${X + 1404},356`, 'req', { w: 4 })];
    const aOut = [svgLine(ov, `M${X + 516},660 L${X + 760},716`, 'res', { w: 4 }), svgLine(ov, `M${X + 1404},660 L${X + 1160},716`, 'res', { w: 4 })];
    const out = ocTable(w, X + 660, 720, [{ label: '订单编号', w: 160, align: 'r' }, { label: '顾客', w: 280 }, { label: '状态', w: 160 }], [['7', '演示顾客 07', '待处理']], { rowH: 52, headH: 50 });
    const concl = h('div', 'pg-concl', w, '都把控制器交来的数据，组织成要显示的页面'); px(concl, X + 96, 840);

    appear(head, tC); appear(sp, tC);
    wipe(cP.el, tC + 0.3, { dir: 't', d: 0.45 });
    const tTw = Math.max(C('e2a_1', 'Twig'), tC + 0.9);
    wipe(cT.el, tTw, { dir: 't', d: 0.45 }); sfx('whoosh', tTw, { g: 0.3 });
    const tOld = C('e2a_2', '旧版'), tNew = C('e2a_2', '新版');
    classAt(cP.el, 'sh-echo', tOld, tNew);
    nP.forEach((n, i) => { slide(n, tOld + 0.15 + i * 0.35, { x: -30, d: 0.35 }); }); sfx('tick', tOld + 0.15, { g: 0.5 });
    cT.on(0, tNew, E('e2a_2', 0.2)); cT.on(1, tNew + 0.6, E('e2a_2', 0.2));
    nT.forEach((n, i) => { slide(n, tNew + 0.15 + i * 0.6, { x: -30, d: 0.35 }); }); sfx('tick', tNew + 0.15, { g: 0.5 });
    const tD = C('e2a_3', '控制器'), tPg = C('e2a_3', '页面');
    slideDown(data, tD - 0.2); sfx('pop', tD - 0.2, { g: 0.5 });
    drawLine(aIn[0], tD + 0.1, 0.35); drawLine(aIn[1], tD + 0.1, 0.35);
    drawLine(aOut[0], tPg - 0.6, 0.35); drawLine(aOut[1], tPg - 0.6, 0.35);
    slideDown(out.el, tPg - 0.3); sfx('tick', tPg - 0.3, { g: 0.5 });
    slide(concl, tPg, { x: -30, d: 0.45 }); sfx('thud', tPg, { g: 0.4 });
  }

  // ═════ 站 D · B28 开头那次点击的实测（e3、e4）═════
  const tD = E('e2a_3', 0.15);
  drift(tD, 1.03);
  move(tD, { x: SX(3) + 960, y: 540, z: 1 }, 0.9);
  {
    const X = SX(3);
    const head = h('div', 'abs t-h1', w, '开头那次点击：一次实测'); px(head, X + 96, 170);
    const sh = shot(w, X + 96, 270, 640, 420, 'design/img/04_order_list.png', { sx: 0, sy: 0, scale: 0.32 });
    const real = stamp(w, X + 96, 706, 'real');
    const N = [
      [49, '个程序和模板文件', '已载入的路径：46 个 .php + 3 个 .tpl；不等于磁盘读取次数', 'e3_2', '四十九'],
      [16, '条数据库语句', '含 4 条 SET，不全是业务表查询', 'e3_3', '十六'],
      [36751, '字节的页面正文', '这一次返回的 HTML，不是所有页面的大小', 'e3_3', '三万六千'],
    ];
    N.forEach(([v, lab, note, cue, word], i) => {
      const y = 260 + i * 160;
      const num = h('div', 'abs t-hero c-req', w, '0'); px(num, X + 800, y);
      const l = h('div', 'abs t-lbl', w, lab); px(l, X + 1080, y + 4);
      const n = h('div', 'abs t-note', w, note); px(n, X + 1080, y + 62);
      const t = C(cue, word);
      slam(num, t, { from: 1.2, d: 0.35 }); countTo(num, 0, v, t, 0.8); sfx('thud', t, { g: 0.5 });
      slide(l, t + 0.2, { x: -30, d: 0.4 }); fadeIn(n, t + 0.4);
    });
    const scope = ocNotice(w, X + 96, 780, 1728, 'attention', '口径：49 个文件、16 条数据库语句、36,751 字节，都属于同一条演示请求，不是所有页面的固定开销');
    appear(head, tD);
    appear(sh, C('e3_1', '开头')); appear(real, C('e3_1', '开头'));
    slideDown(scope, C('e4_1', '同一条')); sfx('tick', C('e4_1', '同一条'), { g: 0.6 });
  }

  // ═════ 站 E · B29 正文引用的样式、脚本、图片（e5）═════
  const tE5 = E('e4_2', 0.15);
  drift(tE5, 1.03);
  move(tE5, { x: SX(4) + 960, y: 540, z: 1 }, 0.9);
  {
    const X = SX(4);
    const head = h('div', 'abs t-h1', w, '正文之外：样式、脚本、图片'); px(head, X + 96, 170);
    const num = h('div', 'abs t-hero c-res', w, '0'); px(num, X + 1180, 160);
    const numL = h('div', 'abs t-lbl', w, '个文件 · 正文之外 · 本次实测'); px(numL, X + 1300, 184);
    const L = [
      '<span class="hh">&lt;link href="…/stylesheet.css" /&gt;</span>',
      '<span class="hh">&lt;script src="…/jquery-1.7.1.min.js"&gt;</span>',
      '<span class="hh">&lt;img src="…/order.png" /&gt;</span>',
    ];
    const code = codeBlock(w, X + 96, 290, 800, L, { raw: true, title: '正文 HTML 里的引用（节选）' }); code.el.classList.add('pg-code');
    const roles = [['link', '样式表'], ['script', '脚本'], ['img', '图片']].map(([a, b], i) => { const e = h('div', 'abs t-note', w, `<span class="mono" style="color:#0F6193">${a}</span> → ${b}`); px(e, X + 120 + i * 250, 520); return e; });
    const cssNote = ocNotice(w, X + 96, 590, 800, 'attention', '样式表里的 <span class="mono">url(…)</span> 还会再引用图片，例如页头底纹');
    const G = [
      ['样式表', 2, 290, ['stylesheet.css', 'jquery-ui….css']],
      ['脚本', 5, 420, ['jquery-1.7.1.min.js', 'jquery-ui….min.js', 'superfish.js', 'tabs.js', 'common.js']],
      ['图片', 12, 610, ['logo.png', 'lock.png', 'order.png', 'header.png', 'menu.png', 'box.png', 'desc.png', 'background.png', 'ui-bg_….png', 'footer.png', 'split.png', 'selected.png']],
    ];
    const ov = ovl(w, X, 160, 1920, 760);
    const words = [C('e5_2', '样式'), C('e5_2', '脚本'), C('e5_2', '图片')];
    const fileEls = [];
    G.forEach(([name, n, y, files], gi) => {
      const g = h('div', 'pg-grp', w, `${name}<b>${n}</b>`); px(g, X + 1000, y);
      const ln = svgLine(ov, `M${X + 900},${code.lineY(gi) + 24} C${X + 950},${code.lineY(gi) + 24} ${X + 950},${y + 22} ${X + 990},${y + 22}`, 'req', { w: 4 });
      const t = words[gi];
      drawLine(ln, t - 0.25, 0.35); slide(g, t, { x: -20, d: 0.3 }); code.on(gi, t - 0.25, t + 0.9);
      sfx(gi === 2 ? 'pop' : 'tick', t, { g: 0.5 });
      files.forEach((f, k) => {
        const e = h('div', 'pg-file', w, f); px(e, X + 1000 + (k % 4) * 206, y + 50 + Math.floor(k / 4) * 56);
        fileEls.push(e); fadeIn(e, t + 0.15 + k * 0.07, { d: 0.2 });
      });
    });
    const t19 = C('e5_3', '十九');
    appear(head, tE5);
    wipe(code.el, C('e5_1', '引用', -0.3), { dir: 't', d: 0.45 }); sfx('whoosh', C('e5_1', '引用', -0.3), { g: 0.3 });
    roles.forEach((e, i) => fadeIn(e, words[i] + 0.1, { d: 0.3 }));
    slam(num, t19, { from: 1.2, d: 0.35 }); countTo(num, 0, 19, t19, 0.7, (v) => String(Math.round(v))); sfx('thud', t19, { g: 0.5 });
    slide(numL, t19 + 0.2, { x: -30, d: 0.4 });
    slideDown(cssNote, E('e5_3', -0.6)); sfx('tick', E('e5_3', -0.6), { g: 0.45 });
  }

  // ═════ 站 E2 · B29 页头细纹：5×56 的切片横向重复（e6）═════
  const tE6 = E('e5_3', 0.15);
  drift(tE6, 1.03);
  move(tE6, { x: SX(4) + 960, y: 540 + DY, z: 1 }, 0.9);
  {
    const X = SX(4), Y = DY;
    const head = h('div', 'abs t-h1', w, '页头的蓝色细纹：一条很窄的图片'); px(head, X + 96, Y + 170);
    const sp = stamp(w, X + 1500, Y + 190, 'demo', '切片放大示意');
    const recap = h('div', 'abs t-note', w, '19 个文件 = 样式 2 + 脚本 5 + 图片 12；这一站看图片'); px(recap, X + 600, Y + 244);
    const sh = shot(w, X + 600, Y + 290, 1224, 150, 'design/img/04_order_list.png', { sx: 0, sy: 0, scale: 0.8 });
    const real = stamp(w, X + 600, Y + 446, 'real');
    const cal = callout(w, X + 1340, Y + 444, '这一整条蓝色底纹', { to: [X + 1520, Y + 330], kind: 'hiy' });
    const slice = h('div', 'pg-slice', w); px(slice, X + 140, Y + 290, 54, 564);
    const sl1 = h('div', 'abs t-lbl mono', w, 'header.png'); px(sl1, X + 230, Y + 300);
    const sl2 = h('div', 'abs t-data', w, '5 × 56 像素'); px(sl2, X + 230, Y + 360);
    const sl3 = h('div', 'abs t-note', w, '图中放大 10 倍'); px(sl3, X + 230, Y + 408);
    const ov = ovl(w, X, Y + 160, 1920, 760);
    const arr = svgLine(ov, `M${X + 230},${Y + 590} L${X + 580},${Y + 590}`, 'req', { w: 5 });
    const arrL = h('div', 'abs t-lbl-s', w, 'repeat-x'); px(arrL, X + 240, Y + 610);
    const arrZ = h('div', 'abs t-note', w, '横向重复，铺满整行'); px(arrZ, X + 240, Y + 656);
    const rep = h('div', 'pg-rep', w); px(rep, X + 600, Y + 534, 1224, 112);
    const repL = h('div', 'abs t-note', w, '同一条图片一格一格重复（每格 5 像素宽，放大 2 倍）'); px(repL, X + 600, Y + 656);
    // 菜单与选中项的图片
    const tm = h('div', 'pg-tile menu', w); px(tm, X + 600, Y + 726, 76, 136);
    const tmL = h('div', 'abs', w, '<div class="t-lbl-s mono">menu.png</div><div class="t-data">19 × 34 · 菜单栏底纹</div>'); px(tmL, X + 700, Y + 736);
    const ts = h('div', 'pg-tile sel', w); px(ts, X + 1180, Y + 726, 76, 136);
    const tsL = h('div', 'abs', w, '<div class="t-lbl-s mono">selected.png</div><div class="t-data">19 × 34 · 选中的「销售」</div>'); px(tsL, X + 1280, Y + 736);
    // 截图里菜单栏与「销售」选中项的位置（04_order_list.png，2 倍图；页头 112 px、菜单 68 px，按 0.8 缩放）
    const mM = h('div', 'pg-mark', w); px(mM, X + 600, Y + 370, 1224, 60);
    const mS = h('div', 'pg-mark', w); px(mS, X + 1054, Y + 366, 110, 68); css(mS, { borderColor: '#FFD54A' });

    appear(head, tE6); appear(sh, tE6); appear(real, tE6); fadeIn(recap, tE6 + 0.5);
    const tStripe = C('e6_1', '蓝色细纹'), tBig = C('e6_1', '大图');
    cal.show(tStripe);
    slideDown(slice, tBig - 0.1, { d: 0.5 }); sfx('pop', tBig - 0.1, { g: 0.5 }); appear(sp, tBig - 0.1);
    const tNar = C('e6_2', '很窄'), tRep = C('e6_2', '横向重复');
    slide(sl1, tNar - 0.3, { x: -20, d: 0.35 }); fadeIn(sl2, tNar); fadeIn(sl3, tNar + 0.2); hl(sl2, tNar, tRep + 0.3);
    drawLine(arr, tRep - 0.3, 0.4); fadeIn(arrL, tRep - 0.1, { d: 0.3 }); fadeIn(arrZ, tRep + 0.1, { d: 0.3 });
    tl.fromTo(rep, { width: 10, autoAlpha: 1 }, { width: 1224, duration: 1.4, ease: 'none', immediateRender: false }, tRep);
    tl.fromTo(rep, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, tRep);
    rep.style.width = '10px';
    sfx('whoosh', tRep, { g: 0.3 });
    fadeIn(repL, tRep + 1.0);
    const tMn = C('e6_3', '菜单'), tSel = C('e6_3', '选中');
    slideDown(tm, tMn - 0.1); fadeIn(tmL, tMn); fadeIn(mM, tMn + 0.1, { d: 0.25 }); sfx('tick', tMn, { g: 0.5 });
    slideDown(ts, tSel - 0.1); fadeIn(tsL, tSel); fadeIn(mS, tSel + 0.1, { d: 0.25 }); sfx('tick', tSel, { g: 0.5 });
  }

  // ═════ 站 F · B30 顾客筛选 → autocomplete → JSON → 建议项（e7）═════
  const tF = E('e6_3', 0.3);
  drift(tF, 1.03);
  move(tF, { x: SX(5) + 960, y: 540, z: 1 }, 1.1);
  {
    const X = SX(5);
    const head = h('div', 'abs t-h1', w, '页面脚本：局部交互'); px(head, X + 96, 170);
    const br = zone(w, 'browser', X + 96, 250, 920, 640, '浏览器');
    br.addr.innerHTML = 'index.php?route=sale/order&amp;token=‹令牌›';
    const mh = h('div', 'pg-mhdr', w, 'OpenCart'); px(mh, X + 99, 386, 914, 44);
    const mm = h('div', 'pg-mmenu', w, '<span>控制台</span><span>商品目录</span><span class="on">销售</span><span>系统</span>'); px(mm, X + 99, 430, 914, 38);
    const ttl = h('div', 'abs t-lbl-s', w, '订单'); px(ttl, X + 120, 486); css(ttl, { color: '#003A88' });
    const btn = [ocButton(w, '打印发票', X + 440, 482), ocButton(w, '插入', X + 620, 482), ocButton(w, '删除', X + 730, 482)];
    const tb = ocTable(w, X + 118, 552, [{ label: '订单编号', w: 170, align: 'r' }, { label: '顾客', w: 380 }, { label: '状态', w: 200 }],
      recs.slice(0, 2).map(([id, c]) => [String(id), c, '待处理']), { rowH: 52, headH: 52, filter: ['', '', ''] });
    const inp = ocInput(w, X + 310, 610, 330, ''); css(inp, { height: '50px', color: '#1d1d1d' });
    const bM = h('div', 'pg-badge', w, '菜单'); px(bM, X + 900, 432);
    const bB = h('div', 'pg-badge', w, '按钮'); px(bB, X + 860, 540);
    const bT = h('div', 'pg-badge', w, '表格'); px(bT, X + 892, 690);
    const ac = h('div', 'pg-ac', w, '<div class="on">演示顾客 01</div><div>演示顾客 02</div><div>演示顾客 03</div><div>演示顾客 04</div>'); px(ac, X + 310, 662, 330);
    ac.setAttribute('data-overlap-ok', '');
    const acL = h('div', 'abs t-note wrap', w, '← 建议项：脚本读了 JSON，再自己画出来'); px(acL, X + 664, 786, 330); css(acL, { color: '#073A5C', fontWeight: '600' });
    const srv = zone(w, 'server', X + 1120, 250, 704, 180, '服务器', 'sale/customer/autocomplete');
    const js = h('div', 'pg-json', w); px(js, X + 1120, 470, 704, 420);
    h('div', 'jh', js, 'JSON · 实测 1,972 字节');
    const JL = ['[', '  {<span class="k">"customer_id"</span>:<span class="v">"1"</span>,', '   <span class="k">"name"</span>:<span class="v">"演示顾客 01"</span>, …},',
      '  {<span class="k">"customer_id"</span>:<span class="v">"2"</span>,', '   <span class="k">"name"</span>:<span class="v">"演示顾客 02"</span>, …},', '  … ]'];
    const jls = JL.map((l) => h('div', 'jl', js, l));
    h('div', 'jn', js, '只有数据和文本，没有页面标签；节选，名称为演示数据');
    const req = token(w, 'customer/autocomplete', 'req', X + 640, 600, '请求：要一份顾客名单');
    const res = token(w, 'JSON', 'res', X + 1130, 650, '');
    req.setAttribute('data-overlap-ok', ''); res.setAttribute('data-overlap-ok', '');

    appear(head, tF);
    wipe(br.el, tF + 0.2, { dir: 't', d: 0.5 });
    [mh, mm, ttl, tb.el, inp, ...btn].forEach((e) => appear(e, tF + 0.6));
    wipe(srv.el, tF + 0.6, { dir: 'l', d: 0.45 });
    const tMn = C('e7_1', '菜单'), tTb = C('e7_1', '表格'), tBt = C('e7_1', '按钮');
    slide(bM, tMn, { y: 12, d: 0.3 }); hl(mm, tMn, tTb); sfx('pop', tMn, { g: 0.45 });
    slide(bT, tTb, { y: 12, d: 0.3 }); sfx('pop', tTb, { g: 0.45 });
    slide(bB, tBt, { y: 12, d: 0.3 }); sfx('pop', tBt, { g: 0.45 });
    btn.forEach((b) => hl(b, tBt, E('e7_1', 0.2)));
    const tLoc = C('e7_2', '局部交互');
    hl(inp, tLoc, C('e7_3', '输入'));
    const tIn = C('e7_3', '输入');
    typeText(inp, '演示顾客 0', tIn, 7, { cursorUntil: C('e7_5', '建议项') });
    const tRq = C('e7_3', '名单', -0.2);
    appear(req, tRq); sfx('blip', tRq, { g: 0.55 });
    travel(req, [[tRq, 1.0, [[X + 660, 606], [X + 1060, 606], [X + 1160, 344]]]]);
    vanish(req, C('e7_4', 'JSON', 0.1));
    const tJ = C('e7_4', 'JSON');
    slideDown(js, tJ - 0.1, { d: 0.45 }); sfx('pop', tJ, { g: 0.55 });
    const tTx = C('e7_5', '文本');
    jls.forEach((l, i) => { if (i === 2 || i === 4) classAt(l, 'on', tTx, C('e7_5', '页面脚本')); });
    const tPs = C('e7_5', '页面脚本');
    appear(res, tPs - 0.1); sfx('blip', tPs, { g: 0.5 });
    travel(res, [[tPs, 0.9, [[X + 1130, 650], [X + 700, 650]]]]);
    vanish(res, C('e7_5', '建议项', 0.1));
    const tSg = C('e7_5', '建议项');
    slideDown(ac, tSg - 0.1, { d: 0.3 }); sfx('tick', tSg, { g: 0.6 });
    fadeIn(acL, tSg + 0.3);
  }
  move(C('e7_1', '菜单', -0.7), { x: SX(5) + 560, y: 560, z: 1.15 }, 0.9, { sfx: false });
  move(C('e7_3', '输入', -0.6), { x: SX(5) + 960, y: 540, z: 1 }, 0.7, { sfx: false });

  // ═════ 站 F2 · B30 五步查询路径，收在「查询完成」（e8）═════
  const tF2 = E('e7_5', 0.15);
  drift(tF2, 1.03);
  move(tF2, { x: SX(5) + 960, y: 540 + DY, z: 1 }, 0.9);
  {
    const X = SX(5), Y = DY;
    const head = h('div', 'abs t-h1', w, '一次列表查询走过的路'); px(head, X + 96, Y + 170);
    const S = [
      ['地址', 'route=sale/order', '选择处理代码', C('e8_1', '地址')],
      ['检查', '登录 · 权限', '决定能否继续', C('e8_1', '检查')],
      ['模型', 'sale/order 模型', '取得订单数据', C('e8_1', '模型')],
      ['模板', 'order_list.tpl', '拼好页面', C('e8_2', '模板')],
      ['浏览器', 'HTML + 19 个文件', '显示出来', C('e8_2', '浏览器')],
    ];
    const ov = ovl(w, X, Y + 160, 1920, 760);
    const bx = (i) => X + 106 + i * 352;
    const tok = token(w, 'route=sale/order', 'req', bx(0), Y + 262);
    tok.setAttribute('data-overlap-ok', '');
    const legs = [];
    S.forEach(([t1, m, z, t], i) => {
      const gh = h('div', 'pg-ghost', w, String(i + 1)); px(gh, bx(i), Y + 340, 300, 236); appear(gh, tF2 + 0.2 + i * 0.08);
      const b = h('div', 'pg-step', w, `<span class="n">${i + 1}</span><span class="t">${t1}</span><span class="m">${m}</span><span class="z">${z}</span>`); px(b, bx(i), Y + 340);
      vanish(gh, t); slideDown(b, t, { d: 0.35 }); sfx(i === 4 ? 'pop' : 'tick', t, { g: 0.5 });
      if (i > 0) {
        const a = svgLine(ov, `M${bx(i) - 46},${Y + 458} L${bx(i) - 6},${Y + 458}`, 'req', { w: 5 });
        drawLine(a, t - 0.3, 0.25);
        legs.push([t - 0.35, 0.45, [[bx(i - 1) - 10 * (i - 1), Y + 262], [bx(i) - 10 * i, Y + 262]]]);
      }
    });
    appear(tok, S[0][3]);
    travel(tok, legs);
    const tShow = C('e8_2', '显示');
    const done = h('div', 'pg-done', w, '查询完成'); px(done, X + 760, Y + 640);
    const doneN = h('div', 'abs t-note', w, '一次只读的请求；途中的 JSON 顾客建议也只是读取'); px(doneN, X + 600, Y + 750);
    const nx = h('div', 'pg-next', w, '修改订单（下一章）'); px(nx, X + 1410, Y + 660);
    const aN = svgLine(ov, `M${X + 1130},${Y + 683} L${X + 1400},${Y + 683}`, 'req', { w: 4, dash: '12 10' });
    appear(head, tF2);
    slam(done, tShow + 0.1, { from: 1.15, d: 0.4 }); sfx('chime', tShow + 0.1, { g: 0.5 });
    fadeIn(doneN, tShow + 0.5);
    const tNx = C('e8_3', '修改订单');
    drawLine(aN, tNx - 0.3, 0.35); slide(nx, tNx, { x: -24, d: 0.4 }); sfx('pop', tNx, { g: 0.45 });
  }
  drift(s.end, 1.03);

  cam.track(s.start, { x: 960, y: 540, z: 1 }, K);
});
