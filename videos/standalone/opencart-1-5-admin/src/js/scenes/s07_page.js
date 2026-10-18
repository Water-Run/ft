// 第 07 章（page）：数据怎样变成页面。分镜 B27 B46 B28 B29 B30，段落 e1–e8。
// 部分完成：站 A（B27 模板 → 表格行）与站 D（B28 实测数值）已做；B46、B29、B30 仍为待制作的占位站。
scene('page', ({ root, s, c0 }) => {
  const C = (id, word, sh = 0) => T('r2_' + id, word, sh);
  const E = (id, sh = 0) => Tend('r2_' + id, sh);
  const SX = (i) => 2100 * i;
  const w = h('div', 'world', root);
  const cam = makeCamera(w);
  const st = h('style', '', root);
  st.textContent = `#sc-page .pg-code .ln{font-size:28px;line-height:48px}
#sc-page .pg-code .hh{color:#0F6193} #sc-page .pg-code .pp,#sc-page .pg-code .pe{color:#6A1B9A}
#sc-page .pg-code.sh-html .hh,#sc-page .pg-code.sh-echo .pe,#sc-page .pg-code.sh-loop .pp{background:var(--oc-hi)}`;

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
  }

  // ═════ 站 B / C · B27 页头页尾组合、B46 PHP 与 Twig（e2、e2a）：TODO ═════
  {
    const X = SX(1);
    const b = ocBox(w, X + 96, 260, 1728, 560, '待制作：页头 + 列表 + 页尾；PHP 模板与 Twig', { icon: 'code' });
    stamp(w, X + 96, 840, 'demo', '占位');
    appear(b.el, E('e1_3', -0.3));
  }

  // ═════ 站 D · B28 开头那次点击的实测（e3、e4）═════
  {
    const X = SX(2);
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
      const l = h('div', 'abs t-lbl', w, lab); px(l, X + 1120, y + 4);
      const n = h('div', 'abs t-note', w, note); px(n, X + 1120, y + 62);
      const t = C(cue, word);
      slam(num, t, { from: 1.2, d: 0.35 }); countTo(num, 0, v, t, 0.8); sfx('thud', t, { g: 0.5 });
      slide(l, t + 0.2, { x: -30, d: 0.4 }); fadeIn(n, t + 0.4);
    });
    const scope = ocNotice(w, X + 96, 780, 1728, 'attention', '口径：以上数值属于同一条演示请求，不是所有页面的固定开销');
    appear(head, E('e2a_3', 0.2));
    appear(sh, C('e3_1', '开头')); appear(real, C('e3_1', '开头'));
    slideDown(scope, C('e4_1', '同一条')); sfx('tick', C('e4_1', '同一条'), { g: 0.6 });
  }

  // ═════ 站 E / F · B29 资源与切片、B30 自动补全 JSON 与收束（e5–e8）：TODO ═════
  {
    const X = SX(3);
    const b = ocBox(w, X + 96, 260, 1728, 560, '待制作：样式 / 脚本 / 图片；5 像素页头切片；JSON 建议项', { icon: 'code' });
    stamp(w, X + 96, 840, 'demo', '占位');
    appear(b.el, E('e4_2', -0.3));
  }

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, Math.max(0.5, C('e1_1', '模板', -0.4) - c0 - 0.2), { ease: 'none', sfx: false }],
    [C('e1_1', '模板', -0.3), { x: 1262, y: 450, z: 1.2 }, 1.0, { sfx: false }],
    [C('e1_2', '循环', -0.4), { x: 960, y: 540, z: 1 }, 0.7, { sfx: false }],
    [E('e1_3', -0.3), { x: SX(1) + 960 }, 0.9, { g: 0.4 }],
    [E('e2a_3', 0.1), { x: SX(2) + 960 }, 0.9, { g: 0.4 }],
    [null, { z: 1.03 }, Math.max(0.5, E('e4_2', -0.4) - E('e2a_3', 1.2)), { ease: 'none', sfx: false }],
    [E('e4_2', -0.3), { x: SX(3) + 960, z: 1 }, 0.9, { g: 0.4 }],
    [null, { z: 1.03 }, Math.max(0.5, s.end - E('e4_2', 0.8)), { ease: 'none', sfx: false }],
  ]);
});
