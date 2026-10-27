// 开场：调查里此消彼长（S1–S6）→ 同一张表、同一句 UPDATE：InnoDB 原位改，PostgreSQL 多出一个版本（U1、U9）→ 片名
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const tB = Tend('o8') + 0.5, tC = T('oT') - 0.1;
  const [A, B, C] = screens(world, [s.start, tB, tC, s.end]);
  drift(world, s, [tB, tC], 1);

  // ── A：调查折线（WaterRun 看过条形版：「这个可能折线图或者动态的两条条形图更直观」）──
  hdoc(A, 'Stack Overflow 开发者调查 · 数据库', 72, 128);
  const sub = capt(A, '全部答题者 · 可多选 · 勾选过的比例', 74, 200);
  const XS = (yr) => 330 + (yr - 2022) * 330, YS = (v) => 820 - (v - 30) * (540 / 30);   // 横轴 2022–2026，纵轴 30%–60%
  [30, 40, 50, 60].forEach((v) => {
    const g = h('div', 'abs', A); px(g, 280, YS(v), 1400, 2); css(g, { background: v === 30 ? 'var(--ink2)' : 'var(--line)' });
    const l = capt(A, v + '%', 196, YS(v) - 16); css(l, { fontSize: '23px' });
    show(g, s.start + 0.1); show(l, s.start + 0.15);
  });
  D.survey.forEach((r) => { const l = capt(A, String(r.year), XS(r.year) - 34, 836); css(l, { fontSize: '30px', color: 'var(--ink)', fontWeight: 700 }); show(l, s.start + 0.2); });
  const ov = overlay(A);
  const tY = { 2022: [T('o4'), T('o3', 'MySQL')], 2023: [T('o5')], 2024: [T('o6')], 2025: [T('o6', '一年比一年') + 0.3], 2026: [T('o7'), T('o8', 'MySQL')] };
  const dot = (yr, v, color, t) => { const d = h('div', 'abs', A); px(d, XS(yr) - 11, YS(v) - 11, 22, 22); css(d, { background: '#fff', border: `5px solid ${color}`, borderRadius: '50%' }); slam(d, t, { from: 1.6 }); return d; };
  const val = (yr, v, color, t, above) => { const l = capt(A, `<b style="color:${color}">${v}%</b>`, XS(yr) - 44, YS(v) + (above ? -50 : 16)); css(l, { fontSize: '26px' }); show(l, t + 0.15, { y: above ? 8 : -8 }); return l; };
  const PGC = '#336791', MYC = '#8a949c';
  D.survey.forEach((r, i) => {
    const tp = tY[r.year][0], tm = tY[r.year][1] != null ? tY[r.year][1] : tp + 0.2;
    const pgAbove = r.pg > r.my;
    if (i > 0) {
      const p = D.survey[i - 1];
      const segP = path(ov, `M${XS(p.year)},${YS(p.pg)} L${XS(r.year)},${YS(r.pg)}`, 'accent', { w: 6, arrow: false });
      const segM = path(ov, `M${XS(p.year)},${YS(p.my)} L${XS(r.year)},${YS(r.my)}`, 'grey', { w: 6, arrow: false });
      draw(segP, tp - 0.45, 0.45); draw(segM, tm - 0.45, 0.45);
    }
    dot(r.year, r.pg, PGC, tp); dot(r.year, r.my, MYC, tm);
    val(r.year, r.pg, PGC, tp, pgAbove); val(r.year, r.my, '#4f5c67', tm, !pgAbove);
    sfx('tick', tp, { g: 0.5 });
  });
  // 线尾的名字
  const last = D.survey[D.survey.length - 1];
  const nP = capt(A, '<b style="color:#336791">PostgreSQL</b>', XS(2026) + 36, YS(last.pg) - 18); show(nP, tY[2026][0] + 0.3, { x: -10 });
  const nM = capt(A, '<b style="color:#4f5c67">MySQL</b>', XS(2026) + 36, YS(last.my) - 18); show(nM, tY[2026][1] + 0.3, { x: -10 });
  const nP0 = capt(A, '<b style="color:#336791">PostgreSQL</b>', 112, YS(D.survey[0].pg) - 18); const nM0 = capt(A, '<b style="color:#4f5c67">MySQL</b>', 170, YS(D.survey[0].my) - 40);
  show(nM0, tY[2022][1], { x: 10 }); show(nP0, tY[2022][0], { x: 10 });
  hide(nP0, T('o5') - 0.3, { d: 0.3 }); hide(nM0, T('o5') - 0.3, { d: 0.3 });
  // 交叉点：在 2022 与 2023 之间按两年的数值插值
  const a = D.survey[0], b = D.survey[1], kx = (a.my - a.pg) / ((a.my - a.pg) + (b.pg - b.my));
  const cx = XS(a.year) + kx * 330, cy = YS(a.pg + kx * (b.pg - a.pg));
  const ring = h('div', 'abs', A); px(ring, cx - 22, cy - 22, 44, 44); css(ring, { border: '4px solid var(--navy)', borderRadius: '50%' });
  const lead = tagEl(A, 'PostgreSQL 反超', cx + 30, cy + 36);
  slam(ring, T('o5', '反超'), { from: 1.8 }); slam(lead, T('o5', '反超') + 0.1, { from: 1.15 }); sfx('pop', T('o5', '反超'));
  const note = noteBox(A, '<b>注意</b>　各年是不同的答题者，自报、可多选；比例不是市场份额。', 72, 890, 1160);
  css(note, { fontSize: '23px', padding: '8px 18px' });
  show(note, T('o2') + 0.4, { y: 10 });
  show(sub, T('o1') + 0.3, { y: 10 });

  // ── B：同一张表、同一句 UPDATE ──
  hdoc(B, '同一张表，同一句 UPDATE', 72, 128);
  const q = psqlBox(B, '', 72, 206, 1776); css(q, { fontSize: '24px', padding: '12px 22px' });
  const k = keyed(q);
  appear(q, T('o10'));
  k.at(T('o10'), { html: '<span class="p">postgres=#</span> <span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> id = 2050;\n  id  | name  | age\n------+-------+-----\n <span class="hi">2050 | Alice |  42 </span>' });
  k.at(T('o12') + 0.3, { html: '<span class="p">postgres=#</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;\n<span class="d">UPDATE 1</span>\n\n ' });
  sfx('blip', T('o12') + 0.3, { g: 0.6 });
  // 两边都是关系数据库、都支持事务
  // 两边都是关系数据库、都支持事务：两张卡，讲到哪一项，两边同时打勾（WaterRun：「画面体现 MySQL Pg 打勾」）
  const mkCard = (x, w, name, bg) => {
    const e = h('div', 'abs', B, name); px(e, x, 470, w, 290); css(e, { background: bg, color: '#fff', font: '800 44px "Open Sans","Sans SC"', padding: '22px 34px' });
    const rows = ['关系数据库', '支持事务'].map((s, i) => { const r = h('div', 'abs', e, `<b style="font-size:44px;margin-right:18px">✓</b>${s}`); px(r, 34, 100 + i * 80); css(r, { font: '700 36px "Sans SC"', color: '#fff' }); return r; });
    return { e, rows };
  };
  const cardI = mkCard(72, 820, 'MySQL · InnoDB', '#5f6a73'), cardP = mkCard(1000, 848, 'PostgreSQL', 'var(--pg)');
  wipe(cardI.e, T('o9') - 0.2, { dir: 'l' }); wipe(cardP.e, T('o9') - 0.05, { dir: 'r' });
  [[0, T('o9', '关系数据库') - 0.3], [1, T('o9', '支持') - 0.2]].forEach(([k, t]) => { slam(cardI.rows[k], t, { from: 1.3 }); slam(cardP.rows[k], t + 0.1, { from: 1.3 }); sfx('tick', t, { p: 0.3 }); });
  hide(cardI.e, T('o11', 'Alice'), { d: 0.3 }); hide(cardP.e, T('o11', 'Alice') + 0.1, { d: 0.3 });
  const tbl = tagEl(B, 'users · 4096 行 · 主键、姓名、年龄三个索引', 1060, 300, 'navy'); show(tbl, T('o11') + 0.2, { x: 20 });

  // 左：InnoDB（中性灰）
  const lt = capt(B, 'InnoDB · 主键树的叶子页', 72, 440); css(lt, { color: 'var(--mute)' });
  const lpg = h('div', 'page grey', B); px(lpg, 72, 484, 820, 300);
  const lrow = h('div', 'tup grey', B, '2050  Alice  42'); px(lrow, 110, 540, 740);
  const undo = h('div', 'tup', B, 'undo：旧值 42'); px(undo, 110, 700, 360); css(undo, { background: '#f1f3f5', borderColor: 'var(--grey)', color: '#46505a' });
  const ltag = tagEl(B, '原位改', 700, 600, 'grey');
  const tI = T('o13');
  wipe(lt, tI - 0.4, { dir: 'l' }); wipe(lpg, tI - 0.35, { dir: 'l' }); show(lrow, tI - 0.3, { y: 10 });
  keyed(lrow).at(T('o13', '改掉'), { html: '2050  Alice  43' }); sfx('tick', T('o13', '改掉'), { p: -0.4 });
  slide(undo, T('o13', 'undo'), { y: 30 }); sfx('pop', T('o13', 'undo'), { g: 0.6, p: -0.4 });
  show(ltag, T('o13', '改掉') + 0.2, { y: -10 });

  // 右：PostgreSQL 的堆（Pg 蓝）：第 23 页的旧版本、第 46 页的新版本
  const U = D.update.users;
  const rt = capt(B, `<b style="color:var(--pg)">PostgreSQL</b> · users 的堆`, 1000, 440);
  const p23 = h('div', 'page', B); px(p23, 1000, 484, 400, 300); const c23 = capt(B, `第 ${U.old[0]} 页`, 1010, 794);
  const p46 = h('div', 'page', B); px(p46, 1448, 484, 400, 300); const c46 = capt(B, `第 ${U.new[0]} 页`, 1458, 794);
  const oldv = h('div', 'tup', B, '2050 Alice 42'); px(oldv, 1024, 560, 352);
  const newv = h('div', 'tup new', B, '2050 Alice 43'); px(newv, 1472, 680, 352);
  const ovB = overlay(B);
  const arr = curve(ovB, [1376, 580], [1472, 700], 'navy', { bend: 640 });
  const xm = h('div', 'cap mono', B, `xmax ${U.xid}`); px(xm, 1028, 610); css(xm, { fontSize: '23px', color: 'var(--warn)' });
  const more = tagEl(B, '表里多了一个版本', 1580, 600);
  const tP = T('o14');
  wipe(rt, tP - 0.4, { dir: 'r' }); wipe(p23, tP - 0.35, { dir: 'r' }); wipe(p46, tP - 0.3, { dir: 'r' }); show(c23, tP - 0.3); show(c46, tP - 0.25);
  show(oldv, tP - 0.25, { y: 10 });
  slide(newv, T('o14', '另写'), { x: 40 }); sfx('pop', T('o14', '另写'), { p: 0.4 });
  arrowIn(arr, T('o14', '另写') + 0.35, 0.5);
  show(xm, T('o14', '另写') + 0.45, { y: 6 });
  classAt(oldv, 'dead', T('o15'));
  slam(more, T('o15', '版本'), { from: 1.15 }); sfx('thud', T('o15', '版本'), { g: 0.7 });

  // ── C：片名 ──
  const card = h('div', 'abs', C); px(card, 0, 0, 1920, 1080); css(card, { background: 'var(--pg-dk)' });
  const k1 = h('div', 'abs', C, '一个数据库引擎是如何实现的？'); px(k1, 170, 360); css(k1, { font: '700 46px "Sans SC"', color: '#e8f1f8' });
  const k2 = h('div', 'abs', C, '学院派的正统'); px(k2, 164, 440); css(k2, { font: '800 140px "Sans SC"', color: '#fff' });
  const k3 = h('div', 'abs', C, 'PostgreSQL'); px(k3, 164, 620); css(k3, { font: '800 140px "Open Sans"', color: '#50b0f0', letterSpacing: '-2px' });
  wipe(k1, tC + 0.15, { dir: 'l' }); slam(k2, tC + 0.3, { from: 1.08 }); slide(k3, tC + 0.55, { x: -60 });
  sfx('thud', tC + 0.35);
});
