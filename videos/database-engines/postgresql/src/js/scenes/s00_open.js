// 开场：调查里此消彼长（S1–S6）→ 同一张表、同一句 UPDATE：InnoDB 原位改、旧值进 undo；PostgreSQL 另写一个版本（U1、U9）→ 片名
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const tB = Tend('o8') + 0.5, tC = T('oT') - 0.1;
  const [A, B, C] = screens(world, [s.start, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);

  // ── A：调查折线，随旁白一年年长出来（WaterRun：「这个可能折线图或者动态的两条条形图更直观」「开场就定半天观感很差」）──
  const t1 = T('o1');
  const ttl = hdoc(A, 'Stack Overflow 开发者调查 · 数据库', 72, 128); show(ttl, Math.max(0.05, t1 - 0.4), { x: -20 });
  const sub = capt(A, '全部答题者 · 可多选 · 勾选过的比例', 74, 200); show(sub, T('o1', '勾选'), { y: 10 });
  const XS = (yr) => 330 + (yr - 2022) * 330, YS = (v) => 820 - (v - 30) * (540 / 30);   // 横轴 2022–2026，纵轴 30%–60%
  [30, 40, 50, 60].forEach((v, i) => {
    const g = h('div', 'abs', A); px(g, 280, YS(v), 1400, 2); css(g, { background: v === 30 ? 'var(--ink2)' : 'var(--line)' });
    const l = capt(A, v + '%', 196, YS(v) - 16); css(l, { fontSize: '23px' });
    fromTo(g, t1 + 0.3 + i * 0.15, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, ease: 'power2.out' }); show(l, t1 + 0.4 + i * 0.15, { x: -10, y: 0 });
  });
  const yl = {};
  D.survey.forEach((r, i) => { const l = capt(A, String(r.year), XS(r.year) - 34, 836); css(l, { fontSize: '30px', color: 'var(--ink2)', fontWeight: 700 }); show(l, T('o2') + i * 0.1, { y: 10 }); yl[r.year] = l; });
  const note = noteBox(A, '<b>注意</b>　各年是不同的答题者，自报、可多选；比例不是市场份额。', 72, 890, 1160);
  css(note, { fontSize: '23px', padding: '8px 18px' }); show(note, T('o2', '数据库'), { y: 10 });
  // 播放头：讲到哪一年，竖线就走到哪一年
  const ph = h('div', 'abs', A); px(ph, XS(2022) - 2, YS(62), 4, YS(30) - YS(62)); css(ph, { background: 'var(--navy)' }); ph.dataset.name = '播放头';
  show(ph, T('o3'), { y: 0, a: 0.25, d: 0.3 });
  const goYear = (yr, t, d = 0.6, ease = 'power2.inOut') => { to(ph, t, { x: XS(yr) - XS(2022), duration: d, ease }); set(yl[yr], t + d * 0.8, { color: 'var(--navy)' }); };
  set(yl[2022], T('o3'), { color: 'var(--navy)' });
  const ov = overlay(A);
  const PGC = '#336791', MYC = '#8a949c';
  const tO6 = T('o6'), dO6 = Tend('o6') - T('o6');
  // 每一年：线段在 [a, b] 里画到这一年，到 b 时落点、出数
  const span = { 2022: [null, T('o4'), T('o3', 'MySQL')], 2023: [T('o5'), T('o5', '反超') + 0.2], 2024: [tO6, tO6 + dO6 / 2], 2025: [tO6 + dO6 / 2, Tend('o6')], 2026: [T('o7'), T('o7', '58'), T('o8', '35')] };
  const dot = (yr, v, color, t) => { const d = h('div', 'abs', A); px(d, XS(yr) - 11, YS(v) - 11, 22, 22); css(d, { background: '#fff', border: `5px solid ${color}`, borderRadius: '50%' }); slam(d, t, { from: 1.6 }); };
  const val = (yr, v, color, t, above) => { const l = capt(A, `<b style="color:${color}">${v}%</b>`, XS(yr) - 44, YS(v) + (above ? -50 : 16)); css(l, { fontSize: '26px' }); show(l, t + 0.1, { y: above ? 8 : -8 }); };
  const seg = (p, r, key, color, a, d) => draw(path(ov, `M${XS(p.year)},${YS(p[key])} L${XS(r.year)},${YS(r[key])}`, color, { w: 6, arrow: false }), a, d, { ease: 'none' });
  D.survey.forEach((r, i) => {
    const sp = span[r.year], pgAbove = r.pg > r.my;
    let tp, tm;
    if (i === 0) { tp = sp[1]; tm = sp[2]; }
    else {
      const p = D.survey[i - 1];
      if (r.year === 2026) { tp = sp[1]; tm = sp[2]; goYear(2026, sp[0], 0.6); }
      else { tp = tm = sp[1]; goYear(r.year, sp[0], sp[1] - sp[0], r.year === 2023 ? 'power2.inOut' : 'none'); }
      seg(p, r, 'pg', 'accent', sp[0], tp - sp[0]); seg(p, r, 'my', 'grey', sp[0], tm - sp[0]);
    }
    dot(r.year, r.pg, PGC, tp); dot(r.year, r.my, MYC, tm);
    val(r.year, r.pg, PGC, tp, pgAbove); val(r.year, r.my, '#4f5c67', tm, !pgAbove);
    sfx('tick', tp, { g: 0.5 }); if (tm !== tp) sfx('tick', tm, { g: 0.45, p: -0.3 });
  });
  hide(ph, Tend('o8'), { y: 0, d: 0.3 });
  // 线头、线尾的名字
  const last = D.survey[D.survey.length - 1];
  const nP0 = capt(A, '<b style="color:#336791">PostgreSQL</b>', 112, YS(D.survey[0].pg) - 18), nM0 = capt(A, '<b style="color:#4f5c67">MySQL</b>', 170, YS(D.survey[0].my) - 40);
  show(nM0, span[2022][2], { x: 10 }); show(nP0, span[2022][1], { x: 10 });
  hide(nP0, T('o5') - 0.3, { d: 0.3 }); hide(nM0, T('o5') - 0.3, { d: 0.3 });
  const nP = capt(A, '<b style="color:#336791">PostgreSQL</b>', XS(2026) + 36, YS(last.pg) - 18); show(nP, span[2026][1] + 0.3, { x: -10 });
  const nM = capt(A, '<b style="color:#4f5c67">MySQL</b>', XS(2026) + 36, YS(last.my) - 18); show(nM, span[2026][2] + 0.3, { x: -10 });
  const d22 = D.survey[0], gapT = tagEl(A, `差 ${(d22.my - d22.pg).toFixed(1)} 个百分点`, XS(2022) + 34, YS((d22.my + d22.pg) / 2) - 20, 'grey'); css(gapT, { fontSize: '24px' });
  show(gapT, T('o4', '紧随其后'), { x: -10 }); hide(gapT, T('o5') - 0.2, { d: 0.2 });
  // 交叉点：在 2022 与 2023 之间按两年的数值插值
  const a = D.survey[0], b = D.survey[1], kx = (a.my - a.pg) / ((a.my - a.pg) + (b.pg - b.my));
  const cx = XS(a.year) + kx * 330, cy = YS(a.pg + kx * (b.pg - a.pg));
  const ring = h('div', 'abs', A); px(ring, cx - 22, cy - 22, 44, 44); css(ring, { border: '4px solid var(--navy)', borderRadius: '50%' });
  const lead = tagEl(A, 'PostgreSQL 反超', cx + 30, cy + 36);
  slam(ring, T('o5', '反超'), { from: 1.8 }); slam(lead, T('o5', '反超') + 0.1, { from: 1.15 }); sfx('pop', T('o5', '反超'));

  // ── B：同一张表、同一句 UPDATE，两台引擎各自怎么做 ──
  hdoc(B, '同一张表，同一句 UPDATE', 72, 128);
  const tm = term(B, 72, 196, 1776, 4, { name: 'psql 会话' });
  const U = D.update.users;
  // 两台引擎：上面是名字和两个勾，下面是它们存这一行的地方
  const engine = (x, w, name, bg) => {
    const head = h('div', 'abs', B); px(head, x, 390, w, 112); css(head, { background: bg });
    const nm = h('div', 'abs', head, name); px(nm, 30, 12); css(nm, { font: '800 40px "Open Sans","Sans SC"', color: '#fff' });
    const checks = ['关系数据库', '支持事务'].map((t, i) => { const c = h('div', 'abs', head, `<b style="font-size:34px;margin-right:10px">✓</b>${t}`); px(c, 30 + i * 260, 64); css(c, { font: '700 28px "Sans SC"', color: '#fff' }); return c; });
    const body = h('div', 'abs', B); px(body, x, 502, w, 400); css(body, { background: '#fff', border: `3px solid ${bg}`, borderTop: 'none' });
    head.dataset.name = name; body.dataset.name = name + '里存这一行的地方';
    return { head, checks, body };
  };
  const EI = engine(72, 860, 'MySQL · InnoDB', '#5f6a73'), EP = engine(988, 860, 'PostgreSQL', 'var(--pg)');
  wipe(EI.head, T('o9') - 0.2, { dir: 'l', d: 0.4 }); wipe(EP.head, T('o9') - 0.05, { dir: 'r', d: 0.4 });
  show(EI.body, T('o9') + 0.1, { y: 0, d: 0.4 }); show(EP.body, T('o9') + 0.2, { y: 0, d: 0.4 });
  [[0, T('o9', '关系')], [1, T('o9', '支持')]].forEach(([k, t]) => { slam(EI.checks[k], t, { from: 1.4 }); slam(EP.checks[k], t + 0.08, { from: 1.4 }); sfx('tick', t, { p: 0.3 }); });
  // 那张用户表：InnoDB 一集测过的，交给 PostgreSQL
  const chipI = tagEl(B, 'users 表 · 4096 行', 110, 540, 'grey'); css(chipI, { fontSize: '28px' });
  show(chipI, T('o10', 'InnoDB'), { y: 10 });
  const chipP = fly(B, 'users 表 · 4096 行', [110, 540], [1026, 540], T('o10', '交给'), { fs: 28, d: 0.8, stay: true });
  sfx('whoosh', T('o10', '交给'), { g: 0.4 });
  // 先查出 Alice
  const e1 = tm.type(T('o11'), '<span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> id = 2050;');
  const tR = Math.max(e1 + 0.2, T('o11', 'Alice') - 0.3);
  tm.print(tR, '  id  | name  | age'); tm.print(tR + 0.12, '------+-------+-----'); tm.print(tR + 0.24, ' <span class="hi">2050 | Alice |  42 </span>');
  sfx('blip', tR, { g: 0.5 });
  // 两边各把 Alice 所在的页摆出来：InnoDB 是主键树的一页叶子，PostgreSQL 是堆的第 23 页
  const tPg = T('o11', '42');
  hide(chipI, tPg, { d: 0.3 }); hide(chipP, tPg, { d: 0.3 });
  const pageBox = (x, y, w, hh, title, grey) => { const pg = h('div', 'page' + (grey ? ' grey' : ''), B); px(pg, x, y, w, hh); const l = capt(B, title, x, y - 36); css(l, { fontSize: '24px', color: grey ? 'var(--mute)' : 'var(--pg)', fontWeight: 700 }); return { pg, l }; };
  const rowEl = (x, y, w, html, cls = 'tup') => { const r = h('div', cls, B, html); px(r, x, y, w); css(r, { height: '48px', lineHeight: '44px', fontSize: '26px' }); return r; };
  const LI = pageBox(100, 570, 600, 130, 'InnoDB · 主键树的叶子页', true);
  const lrow = rowEl(124, 612, 552, '2050  Alice  <span class="age">42</span>', 'tup grey');
  const P23 = pageBox(1016, 570, 380, 130, `堆 · 第 ${U.old[0]} 页`), P46 = pageBox(1440, 570, 380, 130, `堆 · 第 ${U.new[0]} 页`);
  const prow = rowEl(1036, 612, 340, '2050  Alice  42');
  [LI, P23].forEach((q, i) => { wipe(q.pg, tPg + i * 0.1, { dir: 't', d: 0.4 }); show(q.l, tPg + i * 0.1, { y: 8 }); });
  show(lrow, tPg + 0.25, { y: 10 }); show(prow, tPg + 0.35, { y: 10 });
  // 执行同一句 UPDATE：命令敲出后，分成两份送进两台引擎
  const tU = T('o12');
  tm.clear(tU - 0.3);
  const e2 = tm.type(tU, '<span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;');
  const tSend = Math.max(e2 + 0.1, T('o12', '43') - 0.2);
  fly(B, 'age = 43', [900, 300], [480, 612], tSend, { cls: 'navy', fs: 28, d: 0.75 });
  fly(B, 'age = 43', [900, 300], [1210, 520], tSend + 0.1, { cls: 'navy', fs: 28, d: 0.75 });
  sfx('whoosh', tSend + 0.1, { g: 0.45 });
  tm.print(Tend('o12') + 0.2, '<span class="d">UPDATE 1</span>');
  // InnoDB：原位把 42 改成 43；旧值 42 从这一行飞进 undo（WaterRun r2：「"旧值放入undo"要有动画」）
  const undo = h('div', 'abs', B); px(undo, 100, 772, 600, 118); css(undo, { background: '#f1f3f5', border: '3px dashed var(--grey)' }); undo.dataset.name = 'undo 日志';
  const undoL = capt(undo, 'undo 日志', 18, 10); css(undoL, { fontSize: '24px', color: 'var(--mute)', fontWeight: 700 });
  const tIn = T('o13', '原位');
  keyed(lrow.querySelector('.age')).at(tIn + 0.2, { html: '<b style="color:var(--navy)">43</b>' });
  to(lrow, tIn + 0.2, { backgroundColor: '#cfd5da', duration: 0.15, yoyo: true, repeat: 1 }); sfx('tick', tIn + 0.2, { p: -0.4 });
  const tUndo = T('o13', 'undo') - 0.6;
  wipe(undo, tUndo - 0.4, { dir: 'l', d: 0.35 }); show(undoL, tUndo - 0.3);
  const old42 = fly(B, '旧值 42', [330, 612], [130, 826], tUndo, { cls: 'grey', fs: 28, d: 0.8, stay: true });
  sfx('pop', tUndo + 0.9, { g: 0.55, p: -0.4 });
  // PostgreSQL：不碰原来那一行，另写一个新版本到第 46 页；旧版本记上 xmax，指向新版本
  const tCopy = T('o14', '另写');
  wipe(P46.pg, tCopy - 0.5, { dir: 't', d: 0.4 }); show(P46.l, tCopy - 0.4, { y: 8 });
  const nrow = rowEl(1036, 612, 340, '2050  Alice  42', 'tup new');
  set(nrow, 0, { autoAlpha: 0 }); set(nrow, tCopy, { autoAlpha: 1 });
  to(nrow, tCopy, { x: 424, y: 24, duration: 0.9, ease: 'power2.inOut' });
  keyed(nrow).at(tCopy + 0.5, { html: '2050  Alice  <b>43</b>' }); sfx('whoosh', tCopy, { g: 0.4 }); sfx('pop', tCopy + 0.9, { g: 0.5 });
  const xm = capt(B, `xmax ${U.xid}`, 1040, 664); css(xm, { fontSize: '24px', color: 'var(--warn)', fontWeight: 700 }); show(xm, tCopy + 1.0, { y: -6 });
  const ovB = overlay(B); const arr = curve(ovB, [1376, 636], [1460, 660], 'navy', { bend: 600 }); arrowIn(arr, tCopy + 1.0, 0.4);
  classAt(prow, 'dead', T('o15') - 0.2);
  // 版本数：InnoDB 一个，PostgreSQL 两个
  const vI = tagEl(B, '这一行：1 个版本', 100, 718, 'grey'), vP = tagEl(B, '这一行：2 个版本', 1016, 740);
  css(vI, { fontSize: '26px' }); css(vP, { fontSize: '30px' });
  show(vI, T('o15', '版本') - 0.3, { y: 8 }); slam(vP, T('o15', '版本'), { from: 1.2 }); sfx('thud', T('o15', '版本'), { g: 0.6 });
  // 视线：讲 InnoDB 时 PostgreSQL 一侧压暗；讲 PostgreSQL 时反过来
  const pgSide = [EP.head, EP.body, P23.pg, P23.l, prow], inSide = [EI.head, EI.body, LI.pg, LI.l, lrow, undo, old42];
  pgSide.forEach((e) => { to(e, T('o13') - 0.2, { opacity: 0.35, duration: 0.4 }); to(e, T('o14') - 0.3, { opacity: 1, duration: 0.4 }); });
  inSide.forEach((e) => to(e, T('o14') - 0.3, { opacity: 0.35, duration: 0.4 }));
  // 另一条路：InnoDB 整体退出画面；PostgreSQL 一侧移到中间，上方大字打出它的做法；说完停一停，新版本的蓝块铺满整屏，变成片名卡
  const tW = T('o16') - 0.1;
  inSide.forEach((e) => tl.fromTo(e, { x: 0, autoAlpha: 0.35 }, { x: -260, autoAlpha: 0, duration: 0.7, ease: 'power2.in', immediateRender: false }, tW));
  tl.fromTo(vI, { x: 0, autoAlpha: 1 }, { x: -260, autoAlpha: 0, duration: 0.7, ease: 'power2.in', immediateRender: false }, tW);
  gone(tm.el, tW, 0.4); sfx('whoosh', tW, { g: 0.4 });
  const pgMove = [EP.head, EP.body, P23.pg, P23.l, P46.pg, P46.l, prow, xm, vP, ovB];
  pgMove.forEach((e) => tl.fromTo(e, { x: 0 }, { x: -470, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, tW + 0.2));
  tl.fromTo(nrow, { x: 424 }, { x: 424 - 470, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, tW + 0.2);
  const way = h('div', 'abs', B, '不覆盖，<span style="color:var(--navy)">另写一个版本</span>'); px(way, 518, 224); css(way, { font: '800 72px "Sans SC"', color: 'var(--pg)', whiteSpace: 'nowrap' }); way.dataset.name = '另一条路';
  show(way, T('o16', '另一条路') - 0.2, { y: 30, d: 0.6 }); sfx('thud', T('o16', '另一条路'), { g: 0.6 });
  const tC0 = tC - 0.75;
  const burst = h('div', 'abs', world); css(burst, { background: 'var(--pg-dk)' }); burst.dataset.name = '新版本铺满整屏';
  tl.fromTo(burst, { autoAlpha: 0, left: 1460 - 470, top: 636, width: 340, height: 48 }, { autoAlpha: 1, duration: 0.05, immediateRender: true }, tC0);
  tl.fromTo(burst, { left: 1460 - 470, top: 636, width: 340, height: 48 }, { left: 0, top: 0, width: 1920, height: 1080, duration: 0.75, ease: 'power3.in', immediateRender: false }, tC0 + 0.02);
  sfx('riser', tC0, { g: 0.35 }); gone(burst, tC + 0.1, 0.25);

  // ── C：片名 ──
  const card = h('div', 'abs', C); px(card, 0, 0, 1920, 1080); css(card, { background: 'var(--pg-dk)' });
  const k1 = h('div', 'abs', C, '一个数据库引擎是如何实现的？'); px(k1, 170, 360); css(k1, { font: '700 46px "Sans SC"', color: '#e8f1f8' });
  const k2 = h('div', 'abs', C, '学院派的正统'); px(k2, 164, 440); css(k2, { font: '800 140px "Sans SC"', color: '#fff' });
  const k3 = h('div', 'abs', C, 'PostgreSQL'); px(k3, 164, 620); css(k3, { font: '800 140px "Open Sans"', color: '#50b0f0', letterSpacing: '-2px' });
  wipe(k1, tC + 0.15, { dir: 'l' }); slam(k2, tC + 0.3, { from: 1.08 }); slide(k3, tC + 0.55, { x: -60 });
  sfx('thud', tC + 0.35);
  const part = tagEl(C, 'PART 3', 170, 820, 'navy'); css(part, { fontSize: '30px', padding: '8px 22px' }); show(part, tC + 1.3, { x: -20 });
});
