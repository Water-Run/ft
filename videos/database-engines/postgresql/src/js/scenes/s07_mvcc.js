// 07 事务与并发（r10 重做）：前两段是同一个画面——左边三个会话（Alice、Bob、Carol），右边上面是提交状态，中间是 Alice 那一行的几个版本，
// 下面是事务号的数轴和每个版本的可见范围（第三章的画法）。Bob 的快照是数轴上切的一刀；Carol 撞上旧版本 xmax 里的锁，等到 Alice 提交，
// 在 43 上改出 44，又撤回。第三段（两种隔离级别）换成两条时间线（X1–X7、X10–X13）
// （WaterRun 看 r9：「两个版本,谁能看见 再稍微优化一下 动画展现引导和直观性」「整个章节不如前面的好 比起来太廉价了」）
scene('mvcc', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tC = Tend('m20') + 1.1;   // Bob 读到 43 之后多停一会儿再换到隔离级别
  const [A, C] = screens(world, [c0, tC, s.end]);
  drift(world, s, [tC], -1, makeCamera(world));
  const M = D.mvcc, X = M.xid, X0 = D.alice.xmin;
  const ov = overlay(A);

  // ── 布局 ──
  const AX0 = 660, AX1 = 1800, AXY = 888, XA = 800, XB = 1220;     // 事务号的数轴；2809 与 4856 在轴上的位置
  const CX = 640, CY = [360, 452, 544], CH = 60;                     // 版本卡：标签 | xmin | xmax | 数据
  const PX = 72, PW = 470, PH = 176, PY = { alice: 196, bob: 396, carol: 596 };
  const TAGX = 1610;                                                 // 版本卡右边的结论标签

  const head = hdoc(A, '两个版本，谁看见哪一个', 72, 128);
  keyed(head).at(T('m12') - 0.4, { html: 'Carol 也要改这一行' });
  tl.fromTo(head, { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, T('m12') - 0.4);

  // ── 三个会话：名字、在做什么，下面三行是他敲的语句和得到的结果 ──
  const person = (key, name, sub) => {
    const e = h('div', 'abs', A); px(e, PX, PY[key], PW, PH); e.dataset.name = name + ' 的会话';
    css(e, { background: '#fff', border: '3px solid #b9cfe2', borderLeft: '12px solid var(--pg)', boxSizing: 'border-box' });
    const nm = h('div', 'abs', e, name); px(nm, 20, 10); css(nm, { font: '800 32px "Sans SC"', color: 'var(--navy)' });
    const sb = h('div', 'abs', e, sub); px(sb, 132, 18); css(sb, { font: '700 22px "Sans SC"', color: 'var(--ink2)', whiteSpace: 'nowrap' });
    set(e, 0, { autoAlpha: 0 });
    return { e, nm, sb, cur: [] };
  };
  const LS = { font: '500 22px var(--mono)', color: 'var(--ink)', whiteSpace: 'nowrap', fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "calt" 0' };
  const say = (P, i, html, t, st = {}) => {
    const d = h('div', 'abs', P.e, html); px(d, 20, 60 + i * 36); css(d, { ...LS, ...st });
    set(d, 0, { autoAlpha: 0 }); show(d, t, { y: 8, d: 0.3 });
    if (P.cur[i]) gone(P.cur[i], t, 0.15);
    P.cur[i] = d; return d;
  };
  const typeIn = (P, i, html, t, prompt) => {
    const d = h('div', 'abs', P.e, `<span style="color:var(--pg);font-weight:700">${prompt}</span> `); px(d, 20, 60 + i * 36); css(d, LS);
    const sp = h('span', '', d); set(d, 0, { autoAlpha: 0 }); set(d, t - 0.2, { autoAlpha: 1 });
    if (P.cur[i]) gone(P.cur[i], t - 0.2, 0.15);
    P.cur[i] = d;
    return typeText(sp, html, t, 46, { cursorUntil: t + 0.4 + html.replace(/<[^>]+>/g, '').length / 46, sfxGain: 0.4 });
  };
  const K = (w) => `<b style="color:var(--navy)">${w}</b>`;
  const pa = person('alice', 'Alice', '改年龄'), pb = person('bob', 'Bob', '来读'), pc = person('carol', 'Carol', '也要改');

  // ── 提交状态：每个事务一格，摆在它在数轴上的位置上方 ──
  const RUN = { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', color: 'var(--warn)', border: '3px solid var(--warn)', lineHeight: '50px' };   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
  const DONE = { background: 'var(--pg)', color: '#fff', border: '0px solid transparent', lineHeight: '56px' };
  const xLab = capt(A, '<b>提交状态</b>（pg_xact）：每个事务一格', CX, 200); css(xLab, { fontSize: '24px' });
  const xcell = (cx, w, html, st) => { const c = h('div', 'abs', A, html); px(c, cx - w / 2, 236, w, 56); css(c, { font: '700 24px "Mono","Sans SC"', textAlign: 'center', boxSizing: 'border-box', whiteSpace: 'nowrap', ...st }); return c; };
  const xc0 = xcell(XA, 200, `${X0} 已提交`, DONE), xc1 = xcell(XB, 220, `${X} 进行中`, RUN), xc2 = xcell(1560, 220, 'Carol 进行中', RUN);
  xc0.dataset.name = '提交状态'; xc1.dataset.name = '提交状态'; xc2.dataset.name = '提交状态';
  [xLab, xc0, xc1, xc2].forEach((e) => set(e, 0, { autoAlpha: 0 }));

  // ── 版本卡 ──
  const vcard = (i, tag, xmin, xmax, data, kind) => {
    const e = h('div', 'abs', A); px(e, CX, CY[i], 832, CH); e.dataset.name = tag;
    const cell = (x, w, html, st) => { const c = h('div', 'abs', e, html); px(c, x, 0, w, CH); css(c, { font: '600 26px var(--mono)', lineHeight: CH + 'px', textAlign: 'center', whiteSpace: 'nowrap', boxSizing: 'border-box', ...st }); return c; };
    const H = { background: 'var(--navy)', color: '#fff', fontSize: '24px' };
    const DATA = { old: { background: 'var(--sky-lt)', color: 'var(--navy)' }, new: { background: 'var(--pg)', color: '#fff' }, carol: { background: '#fff', color: 'var(--warn)', border: '3px dashed var(--warn)', lineHeight: (CH - 6) + 'px' } }[kind];
    const r = { e, lab: cell(0, 110, tag, { font: '700 24px "Sans SC"', background: '#eef2f5', color: 'var(--navy)' }), xmin: cell(114, 190, xmin, H), xmax: cell(308, 190, xmax, H), data: cell(502, 330, data, DATA) };
    set(e, 0, { autoAlpha: 0 });
    return r;
  };
  const vo = vcard(0, '旧版本', `xmin ${X0}`, 'xmax 0', '2050 Alice 42', 'old');
  const vn = vcard(1, '新版本', `xmin ${X}`, 'xmax 0', '2050 Alice 43', 'new');
  const v3 = vcard(2, 'Carol 的', 'xmin Carol', 'xmax 0', `2050 Alice ${M.carolGot}`, 'carol');
  const XMX = CX + 308 + 95, XMIN = CX + 114 + 95, DATAX = CX + 502 + 165;   // xmax、xmin、数据三格的中心
  // 版本链：旧版本的 t_ctid 指向新版本（第六章的画法），右边一道弯
  const ctid = (i) => { const p = path(ov, `M${CX + 832},${CY[i] + 22} C${CX + 900},${CY[i] + 22} ${CX + 900},${CY[i + 1] + 38} ${CX + 838},${CY[i + 1] + 38}`, 'navy', { w: 3, arrow: true }); return p; };
  const ct1 = ctid(0), ct2 = ctid(1);
  const ctL = capt(A, 't_ctid', CX + 904, CY[0] + 52, 'cap mono'); css(ctL, { fontSize: '22px', color: 'var(--navy)', background: '#fff' }); set(ctL, 0, { autoAlpha: 0 });

  // ── 事务号的数轴与每个版本的可见范围 ──
  const axis = h('div', 'abs', A); px(axis, AX0, AXY, AX1 - AX0, 4); css(axis, { background: 'var(--ink2)', transformOrigin: '0 50%' }); axis.dataset.name = '事务号的数轴';
  const ah = h('div', 'abs', A); px(ah, AX1 - 2, AXY - 8, 0, 0); css(ah, { borderLeft: '16px solid var(--ink2)', borderTop: '10px solid transparent', borderBottom: '10px solid transparent' });
  const axL = capt(A, '事务号 →', AX0 - 4, AXY + 14); css(axL, { fontSize: '22px' });
  const tick = (x, txt) => { const k = h('div', 'abs', A); px(k, x - 1, AXY - 8, 3, 20); css(k, { background: 'var(--ink2)' }); const l = capt(A, txt, x - 28, AXY + 14, 'cap mono'); css(l, { fontSize: '22px', color: 'var(--navy)', fontWeight: 700 }); return [k, l]; };
  const tk = [...tick(XA, String(X0)), ...tick(XB, String(X))];
  const inf = h('div', 'abs', A, '∞'); px(inf, AX1 + 8, AXY - 72); css(inf, { font: '800 44px "Open Sans"', color: 'var(--pg)' });
  const band = (x0, w, y, txt, st) => { const b = h('div', 'abs', A, txt); px(b, x0, y, w, 38); css(b, { font: '700 22px "Sans SC"', lineHeight: '38px', padding: '0 12px', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', ...st }); return b; };
  const bOld = band(XA, XB - XA, 764, `旧版本 42：${X0} → ${X}`, { background: 'var(--sky-lt)', color: 'var(--navy)' });
  const bNew = band(XB, AX1 - XB, 816, `新版本 43：${X} → ∞`, { background: 'var(--pg)', color: '#fff' });
  bOld.dataset.name = '可见范围'; bNew.dataset.name = '可见范围';
  const capO = h('div', 'abs', A); px(capO, XB - 4, 756, 7, 54); css(capO, { background: 'var(--navy)', boxSizing: 'border-box' }); capO.dataset.name = '旧版本的终点';
  [axis, ah, axL, ...tk, inf, bOld, bNew, capO].forEach((e) => set(e, 0, { autoAlpha: 0 }));

  // ── m1：两个版本都在表里；别人来读，给哪一个？ ──
  show(vo.e, T('m1') - 0.1, { x: -30, y: 0 }); show(vn.e, T('m1') + 0.1, { x: -30, y: 0 }); arrowIn(ct1, T('m1') + 0.5, 0.5); show(ctL, T('m1') + 0.8, { y: 0 }); sfx('pop', T('m1'), { g: 0.5 });
  const who = h('div', 'abs', A, '别人来读：<br>给哪一个？'); px(who, PX, PY.bob, PW, PH); who.dataset.name = '别人来读';
  css(who, { border: '3px dashed var(--grey)', color: '#4d565e', font: '700 30px "Sans SC"', padding: '44px 28px', boxSizing: 'border-box', lineHeight: '1.4' });
  const q1 = link(ov, [[PX + PW + 6, PY.bob + 60], [CX - 8, CY[0] + 34]], 'grey', { dashed: true }), q2 = link(ov, [[PX + PW + 6, PY.bob + 100], [CX - 8, CY[1] + 30]], 'grey', { dashed: true });
  set(who, 0, { autoAlpha: 0 }); show(who, T('m1b') - 0.1, { x: -20, y: 0 }); arrowIn(q1, T('m1b', '哪一个') - 0.2, 0.35); arrowIn(q2, T('m1b', '哪一个'), 0.35);
  [who, q1, q2].forEach((e) => gone(e, T('m2') - 0.1, 0.3));
  // 「给哪一个？」：两个版本的数据格一起亮起——两个候选
  set(vo.data, T('m1b', '哪一个') - 0.1, { backgroundColor: '#ffd36b' }); set(vn.data, T('m1b', '哪一个') - 0.1, { backgroundColor: '#ffd36b', color: '#193145' });
  set(vo.data, T('m2') - 0.2, { backgroundColor: '#cfe0ee' }); set(vn.data, T('m2') - 0.2, { backgroundColor: '#336791', color: '#ffffff' });

  // ── m2–m3b：回到 Alice 还没提交的时候；她的事务号 4856 写进两个版本的行头；两个版本各是数轴上的一段范围 ──
  const rew = h('div', 'abs', A); px(rew, CX - 10, CY[0] - 14, 852, 2 * CH + 60); css(rew, { background: 'rgba(255,214,90,.55)' }); rew.dataset.name = '回到那时';
  set(rew, 0, { autoAlpha: 0 }); tl.fromTo(rew, { autoAlpha: 1, x: 500, scaleX: 0.4 }, { x: -500, scaleX: 1, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, T('m2', '改年龄') - 0.1); gone(rew, T('m2', '改年龄') + 0.6, 0.2); sfx('whoosh', T('m2', '改年龄'), { g: 0.3, p: -0.3 });
  show(pa.e, T('m2') - 0.2, { x: -40, y: 0 });
  typeIn(pa, 0, `${K('UPDATE')} … ${K('SET')} age = 43`, T('m2') + 0.1, 'alice=*&gt;');
  say(pa, 1, '<b style="color:#8f2f1e">还没提交</b>', T('m2', '还没提交'), {});   // 深红：卡片亮成浅黄时也够对比度 sfx('tick', T('m2', '还没提交'), { p: 0.3 });
  set(pa.e, T('m3') - 0.1, { backgroundColor: '#ffe9a8' }); set(pa.e, T('m3', String(X)) + 1.0, { backgroundColor: '#ffffff' });   // 讲她的事务号：Alice 的卡亮起
  keyed(pa.sb).at(T('m3', String(X)) - 0.1, { html: `事务号 <b style="color:#8f2f1e">${X}</b>` });
  tl.fromTo(pa.sb, { scale: 1.3, transformOrigin: '0 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, T('m3', String(X)) - 0.1);
  // 4856 从 Alice 那里飞进旧版本的 xmax、新版本的 xmin
  const tX = T('m3', String(X)) + 0.2;
  fly(A, String(X), [PX + 260, PY.alice + 14], [XMX - 40, CY[0] + 12], tX, { cls: 'warn', fs: 24, d: 0.6, sink: true });
  fly(A, String(X), [PX + 260, PY.alice + 14], [XMIN - 40, CY[1] + 12], tX + 0.15, { cls: 'warn', fs: 24, d: 0.6, sink: true });
  keyed(vo.xmax).at(tX + 0.7, { html: `xmax ${X}` }); keyed(vn.xmin).at(tX + 0.85, { html: `xmin ${X}` });
  set(vo.xmax, tX + 0.7, { backgroundColor: '#b8442f' }); set(vn.xmin, tX + 0.85, { backgroundColor: '#b8442f' }); sfx('tick', tX + 0.7); sfx('tick', tX + 0.85, { p: 0.3 });
  // 数轴：先画轴，再按「旧版本……新版本……」长出两段
  const tAx = T('m3b') - 0.5;
  tl.fromTo(axis, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, tAx); show(ah, tAx + 0.5, { x: -10, y: 0, d: 0.2 }); show(axL, tAx + 0.2, { y: 6 });
  tk.forEach((e) => show(e, tAx + 0.3, { y: 6, d: 0.3 }));
  set(bOld, T('m3b', '旧版本') - 0.2, { autoAlpha: 1 }); tl.fromTo(bOld, { width: 0 }, { width: XB - XA, duration: 0.6, ease: 'power2.out', immediateRender: false }, T('m3b', '旧版本') - 0.2);
  show(capO, T('m3b', '为止') - 0.2, { y: 0, s: 1.6, d: 0.3 });
  [[vn.xmin, '#b8442f'], [vn.xmax, '#193145'], [vn.data, '#336791']].forEach(([c, back]) => { set(c, T('m3b', '新版本') - 0.2, { backgroundColor: '#e0a11b' }); set(c, T('m3b', '新版本') + 0.6, { backgroundColor: back }); });   // 新版本整张卡一闪：范围条从它长出来
  const axHi = h('div', 'abs', A); px(axHi, AX0 - 20, 744, AX1 - AX0 + 70, 176); css(axHi, { background: 'rgba(255,205,80,.28)', mixBlendMode: 'multiply' }); axHi.dataset.name = '视线框';   // 讲两段范围时，数轴这一片整块亮起（在原地，不移动）
  set(axHi, 0, { autoAlpha: 0 }); set(axHi, T('m3b', '旧版本') - 0.2, { autoAlpha: 1 }); set(axHi, T('m3b', '开始') + 0.7, { autoAlpha: 0 });
  set(bNew, T('m3b', '新版本') - 0.2, { autoAlpha: 1 }); tl.fromTo(bNew, { width: 0 }, { width: AX1 - XB, duration: 0.8, ease: 'power2.out', immediateRender: false }, T('m3b', '新版本') - 0.2);
  slam(inf, T('m3b', '开始') + 0.2, { from: 1.5 }); sfx('pop', T('m3b', '新版本'), { g: 0.4 });

  // ── m4：提交了没有，另有一处记着：这时 4856 是「进行中」 ──
  show(xLab, T('m4') - 0.2, { y: 8 }); wipe(xc0, T('m4', '另有一处') - 0.2, { dir: 'l' }); wipe(xc1, T('m4', '另有一处'), { dir: 'l' }); sfx('tick', T('m4', '另有一处'), { g: 0.5 });
  const toX = curve(ov, [XMX + 40, CY[0]], [XB - 60, 292], 'warn', { bend: 326 });
  arrowIn(toX, T('m4b', '进行中') - 0.3, 0.5); sfx('tick', T('m4b', '进行中'), { p: 0.4 });
  tl.fromTo(xc1, { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, T('m4b', '进行中') - 0.1);
  gone(toX, T('m6') - 0.2, 0.3);

  // ── m5–m7：Bob 来读，先拍一张快照：数轴上切一刀，4856 起都还看不见 ──
  show(pb.e, T('m5') - 0.2, { x: -40, y: 0 });
  const eB = typeIn(pb, 0, `${K('SELECT')} age … id = 2050`, T('m5'), 'bob=&gt;');
  tl.fromTo(pb.e, { boxShadow: '0 0 0 0px rgba(255,255,255,0)' }, { boxShadow: '0 0 0 14px rgba(255,214,90,.9)', duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, T('m6', '快照') - 0.15);   // 「咔嚓」一下；lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  const snapG = glossBox(A, '快照', '<b>快照</b>：查询开始那一刻，记下哪些事务已经结束、哪些还没有', PX, PY.carol + 14, PW);
  set(snapG, 0, { autoAlpha: 0 }); show(snapG, T('m6', '快照') + 0.1, { y: 10 }); gone(snapG, T('m12') - 0.6, 0.3);
  fly(A, '快照', [PX + PW - 120, PY.bob + 20], [XB - 40, 700], T('m6', '快照'), { cls: 'navy', fs: 24, d: 0.7, sink: true }); sfx('whoosh', T('m6', '快照'), { g: 0.3 });
  const snapT = h('div', 'abs', A, `<b>Bob 的快照</b>　<span class="mono" style="font-size:22px;color:var(--ink2)">${M.snapshot}</span>`); px(snapT, XB - 120, 690); css(snapT, { font: '500 24px "Sans SC"', color: 'var(--navy)', whiteSpace: 'nowrap' });
  const cut = h('div', 'abs', A); px(cut, XB - 3, 728, 6, 172); css(cut, { background: 'var(--warn)', transformOrigin: '50% 0' }); cut.dataset.name = '快照的分界';
  const hatch = h('div', 'abs', A); px(hatch, XB + 3, 758, AX1 - XB - 3, 128); css(hatch, { background: 'repeating-linear-gradient(135deg, rgba(95,106,115,.2) 0 8px, transparent 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
  const ldone = h('div', 'abs', A, '← 已经结束'); px(ldone, XB - 250, 728); css(ldone, { font: '700 22px "Sans SC"', color: 'var(--ok)', whiteSpace: 'nowrap' });
  const lnot = h('div', 'abs', A, '还没结束 →'); px(lnot, XB + 14, 728); css(lnot, { font: '700 22px "Sans SC"', color: 'var(--warn)', whiteSpace: 'nowrap' });
  A.insertBefore(hatch, bOld);   // 斜线区垫在两段范围的下面：不盖住范围条上的字
  [snapT, cut, hatch, ldone, lnot].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  show(snapT, T('m6', '快照') + 0.6, { y: 8 });
  tl.fromTo(cut, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: 'power2.out', immediateRender: false }, T('m6b') - 0.2); sfx('thud', T('m6b'), { g: 0.4 });
  show(ldone, T('m6b', '已经结束') - 0.1, { x: 10, y: 0 }); wipe(hatch, T('m6b', '还没有') - 0.2, { dir: 'l', d: 0.6 }); show(lnot, T('m6b', '还没有'), { x: -10, y: 0 });
  keyed(lnot).at(T('m7', '起的事务') - 0.1, { html: `${X} 起：都还看不见 →` }); keyed(ldone).at(T('m7', '起的事务') - 0.1, { html: '← 已经结束：看得见' });
  tl.fromTo(lnot, { scale: 1.25, transformOrigin: '0 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, T('m7', '起的事务') - 0.1); sfx('pop', T('m7', '看不见'), { g: 0.5, p: 0.5 });

  // ── m8–m9b：新版本的范围整段在「看不见」那边：不算；旧版本的终点也在那边：终点不算，范围一直延下去 ──
  fly(A, `xmin ${X}`, [XMIN - 70, CY[1] + 12], [XB - 40, 822], T('m8') - 0.2, { cls: 'warn', fs: 24, d: 0.7, sink: true }); sfx('whoosh', T('m8'), { g: 0.25 });   // 新版本的起点：行头里的 xmin 落到数轴上
  tl.fromTo(bNew, { boxShadow: '0 0 0 0px rgba(224,161,27,0)' }, { boxShadow: '0 0 0 6px rgba(224,161,27,1)', duration: 0.25, immediateRender: false }, T('m8', String(X)) - 0.2);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  const tNo = T('m8b', '看不见');
  set(bNew, tNo, { background: 'rgba(255,255,255,.6)', color: 'var(--pg)', outline: '3px dashed var(--pg)', outlineOffset: '-3px', boxShadow: '0 0 0 0px rgba(224,161,27,0)' });   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  const dash = (r, on, t) => {
    [r.xmin, r.xmax].forEach((c) => set(c, t, on ? { opacity: 0.35 } : { opacity: 1 }));
    set(r.data, t, on ? { background: '#fff', color: 'var(--pg)', border: '3px dashed var(--pg)', lineHeight: (CH - 6) + 'px' } : { background: 'var(--pg)', color: '#fff', border: '0px solid transparent', lineHeight: CH + 'px' });
  };
  dash(vn, true, tNo);
  const xNew = tagEl(A, '不算：看不见', TAGX, CY[1] + 12, 'warn'); css(xNew, { fontSize: '24px' }); set(xNew, 0, { autoAlpha: 0 }); show(xNew, tNo, { x: 20, y: 0 }); sfx('error', tNo + 0.05, { g: 0.4 });
  tl.fromTo(capO, { scale: 1 }, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, T('m9', '为止') - 0.2);
  const tEnd = T('m9', '也还看不见') - 0.1;
  set(capO, tEnd, { background: 'transparent', border: '3px dashed var(--navy)' });
  const tNs = T('m9b', '还在范围里') - 0.3;
  tl.fromTo(bOld, { width: XB - XA }, { width: AX1 - XA, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, tNs);
  keyed(bOld).at(tNs, { html: `旧版本 42：${X0} 起，终点还没到 →` });
  gone(capO, tNs, 0.3);
  const okOld = tagEl(A, '终点不算：看得见', TAGX, CY[0] + 12, 'ok'); css(okOld, { fontSize: '24px' }); set(okOld, 0, { autoAlpha: 0 }); show(okOld, tNs + 0.2, { x: 20, y: 0 }); sfx('tick', tNs + 0.2);

  // ── m10–m11：Bob 读到旧版本 42；读和写互不等待 ──
  const see = link(ov, [[PX + PW + 6, PY.bob + 40], [CX - 8, CY[0] + 40]], 'navy', { w: 3.5 }); arrowIn(see, T('m10') - 0.2, 0.4);
  fly(A, '42', [DATAX + 80, CY[0] + 12], [PX + 120, PY.bob + 98], T('m10', '42') - 0.6, { cls: 'navy', fs: 24, d: 0.55, sink: true });
  say(pb, 1, `→ <b style="background:var(--hi);padding:0 6px">${M.bobReads}</b>`, Math.max(eB + 0.2, T('m10', '42') - 0.05)); sfx('blip', T('m10', '42'), { g: 0.6 });
  say(pb, 2, '<b style="color:var(--ok)">没等 Alice</b>', T('m11', '不用等'));
  say(pa, 2, '<b style="color:var(--ok)">也没等 Bob</b>', T('m11', '也不用等')); sfx('chime', T('m11', '也不用等'), { g: 0.6 });
  [pa.e, pb.e].forEach((e, i) => tl.fromTo(e, { borderColor: '#b9cfe2' }, { borderColor: '#2f6b26', duration: 0.25, immediateRender: false }, T('m11', i ? '不用等' : '也不用等') - 0.1));

  // ── 换段（同一画面）：Bob 的快照收起，两个版本回到本来的样子；Bob 退到一边 ──
  const tR = T('m12') - 0.6;
  [snapT, cut, hatch, ldone, lnot, xNew, okOld, see].forEach((e) => gone(e, tR, 0.3));
  tl.fromTo(bOld, { width: AX1 - XA }, { width: XB - XA, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tR);
  keyed(bOld).at(tR, { html: `旧版本 42：${X0} → ${X}` });
  set(capO, tR + 0.3, { background: 'var(--navy)', border: '0px solid transparent' }); show(capO, tR + 0.3, { y: 0, d: 0.3 });
  set(bNew, tR, { background: 'var(--pg)', color: '#fff', outline: '0px dashed transparent' }); dash(vn, false, tR);
  [pa.e, pb.e].forEach((e) => set(e, tR, { borderColor: '#b9cfe2' }));
  tl.fromTo(pb.e, { autoAlpha: 1 }, { autoAlpha: 0.4, duration: 0.4, immediateRender: false }, tR);

  // ── m12–m14：Carol 要改：得在最新的版本上改，可那是 Alice 写的、还没提交；提交还是撤回，她得等结果 ──
  show(pc.e, T('m12') - 0.3, { x: -40, y: 0 });
  const eC = typeIn(pc, 0, `${K('SET')} age = age + 1 …`, T('m12'), 'carol=*&gt;');
  const req = tagEl(A, 'Carol：age + 1', PX + 60, PY.carol + 120, 'warn'); css(req, { fontSize: '24px' }); req.dataset.name = 'Carol 的修改';
  set(req, 0, { autoAlpha: 0 }); set(req, eC, { autoAlpha: 1 });
  tl.fromTo(req, { x: 0, y: 0 }, { x: XMX - 100 - (PX + 60), y: 302 - (PY.carol + 120), duration: 0.8, ease: 'power2.inOut', immediateRender: false }, eC);
  sfx('whoosh', eC, { g: 0.3 });
  const latest = tagEl(A, '最新的版本', TAGX, CY[1] + 12, 'navy'); css(latest, { fontSize: '24px' }); set(latest, 0, { autoAlpha: 0 }); show(latest, T('m12b', '最新的版本') - 0.2, { x: 16, y: 0 });
  tl.fromTo(vn.e, { boxShadow: '0 0 0 0px rgba(224,161,27,0)' }, { boxShadow: '0 0 0 6px rgba(224,161,27,1)', duration: 0.25, immediateRender: false }, T('m12b', '最新的版本') - 0.2);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  fly(A, `${X} 写的`, [XMIN - 60, CY[1] + 12], [XB - 80, 244], T('m12c', 'Alice') - 0.3, { cls: 'warn', fs: 24, d: 0.7, sink: true });
  tl.fromTo(vn.xmin, { boxShadow: 'inset 0 0 0 0px #f2c94c' }, { boxShadow: 'inset 0 0 0 5px #f2c94c', duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, T('m12c', 'Alice') - 0.3);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  tl.fromTo(pa.cur[1] || pa.e, { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, transformOrigin: '0 50%', immediateRender: false }, T('m12c', '还没提交') - 0.1);
  tl.fromTo(xc1, { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, T('m12c', '还没提交') - 0.1); sfx('tick', T('m12c', '还没提交'));
  gone(latest, T('m13') + 0.2, 0.25);
  tl.fromTo(vn.e, { boxShadow: '0 0 0 6px rgba(224,161,27,1)' }, { boxShadow: '0 0 0 0px rgba(224,161,27,0)', duration: 0.25, immediateRender: false }, T('m13') + 0.2);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  // 两种结果，从 4856 那一格分出去
  const fkA = tagEl(A, `提交了 → 在 ${M.bobAfter} 上改`, TAGX, 318, 'ok'), fkB = tagEl(A, '撤回了 → 43 作废', TAGX, 374, 'grey');
  [fkA, fkB].forEach((e) => { css(e, { fontSize: '22px' }); set(e, 0, { autoAlpha: 0 }); });
  const fa = curve(ov, [XB + 110, 254], [TAGX - 6, 334], 'grey', { bend: XB + 260, dashed: true }), fb = curve(ov, [XB + 110, 274], [TAGX - 6, 390], 'grey', { bend: XB + 260, dashed: true });
  // curve 的 bend 是纵向的中间点；这里改成横着出去再拐下来
  fa.setAttribute('d', `M${XB + 110},258 C${XB + 300},258 ${TAGX - 140},334 ${TAGX - 6},334`); fb.setAttribute('d', `M${XB + 110},272 C${XB + 300},272 ${TAGX - 140},390 ${TAGX - 6},390`);
  arrowIn(fa, T('m13', '提交') - 0.2, 0.4); show(fkA, T('m13', '提交'), { x: 12, y: 0 });
  arrowIn(fb, T('m13', '撤回') - 0.2, 0.4); show(fkB, T('m13', '撤回'), { x: 12, y: 0 }); sfx('tick', T('m13', '撤回'), { p: 0.3 });
  // 等：Carol 的修改停在旧版本的行头前；她的会话里，等待条一直涨
  const tW0 = T('m13', '等') - 0.1, tW1 = T('m18', '已提交');
  const gate = h('div', 'abs', A); px(gate, XMX - 100, 348, 200, 6); css(gate, { background: 'var(--warn)', transformOrigin: '50% 50%' }); gate.dataset.name = '挡住';
  set(gate, 0, { autoAlpha: 0 }); tl.fromTo(gate, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.25, immediateRender: false }, tW0); sfx('error', tW0 + 0.1, { g: 0.35 });
  const wb = h('div', 'abs', pc.e); px(wb, 20, 138, 420, 22); css(wb, { border: '2px solid var(--warn)', boxSizing: 'border-box' }); wb.dataset.name = '等待';
  const wf = h('div', 'abs', wb); px(wf, 0, 0, 0, 18); css(wf, { background: 'repeating-linear-gradient(135deg,var(--warn) 0 10px,#d9826f 10px 20px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
  set(wb, 0, { autoAlpha: 0 }); show(wb, tW0, { y: 0, d: 0.3 }); fromTo(wf, tW0, { width: 0 }, { width: 416, duration: tW1 - tW0, ease: 'none' });
  const wl = M.locks.find((l) => l[1] === 'transactionid' && !l[4]) || ['carol', 'transactionid', X];
  say(pc, 1, `<b style="color:var(--warn)">等事务 ${wl[2]} 结束</b>　<span style="color:var(--ink2)">pg_locks 实测</span>`, T('m14', '事务结束') - 0.3);

  // ── m15–m15b：挡住她的锁，就记在旧版本行头的 xmax 里；锁写在每一行自己身上，内存里不记，锁多少行都行 ──
  const tLk = T('m15', 'xmax') - 0.2;
  tl.fromTo(gate, { y: 0, scaleX: 1 }, { y: 12, scaleX: 0.95, duration: 0.3, ease: 'power2.in', immediateRender: false }, tLk);
  gone(gate, tLk + 0.3, 0.1);
  const lockOn = (r, t) => { const b = h('div', 'abs', r.e, '锁'); px(b, 308 + 166, -16, 36, 36);   // 挂在整张卡上：xmax 格的文字会被 keyed 整格重写，挂在格子里会被清掉
  css(b, { borderRadius: '50%', background: '#fff', color: 'var(--warn)', border: '3px solid var(--warn)', boxSizing: 'border-box', font: '800 22px "Sans SC"', lineHeight: '30px', textAlign: 'center' }); set(b, 0, { autoAlpha: 0 }); slam(b, t, { from: 1.8 }); return b; };
  const lk0 = lockOn(vo, tLk + 0.3); sfx('thud', tLk + 0.3, { g: 0.6 });
  tl.fromTo(vo.xmax, { boxShadow: 'inset 0 0 0 0px #f2c94c' }, { boxShadow: 'inset 0 0 0 5px #f2c94c', duration: 0.25, immediateRender: false }, tLk + 0.3);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  // 许多行：每一行的行头里都写着 xmax 4856 和一把锁；右边内存里什么都不记
  const rows = [0, 1, 2].map((i) => {
    const r = h('div', 'abs', A); px(r, CX + 114, 624 + i * 36, 718, 30); r.dataset.name = '别的行';
    const a = h('div', 'abs', r, `xmax ${X}`); px(a, 194, 0, 190, 30); css(a, { background: '#b8442f', color: '#fff', font: '600 22px var(--mono)', lineHeight: '30px', textAlign: 'center' });
    const lb = h('div', 'abs', r, '锁'); px(lb, 392, 2, 26, 26); css(lb, { borderRadius: '50%', border: '2px solid var(--warn)', color: 'var(--warn)', font: '800 22px "Sans SC"', lineHeight: '22px', textAlign: 'center', boxSizing: 'border-box' });
    const o = h('div', 'abs', r, '……'); px(o, 0, 0, 190, 30); css(o, { background: 'var(--navy)', color: '#fff', font: '600 22px var(--mono)', lineHeight: '30px', textAlign: 'center' });
    const d2 = h('div', 'abs', r, '这一行的数据……'); px(d2, 428, 0, 290, 30); css(d2, { background: 'var(--sky-lt)', color: 'var(--navy)', font: '600 22px "Sans SC"', lineHeight: '30px', textAlign: 'center' });
    set(r, 0, { autoAlpha: 0 }); show(r, T('m15b', '锁多少行') - 0.4 + i * 0.18, { x: -16, y: 0, d: 0.3 }); gone(r, T('m17') - 0.3, 0.3);
    return r;
  });
  const mem = h('div', 'abs', A); px(mem, TAGX, 624, 238, 102); mem.dataset.name = '内存';
  css(mem, { border: '3px solid var(--grey)', background: '#f6f7f8', boxSizing: 'border-box' });
  const memT = h('div', 'abs', mem, '内存'); px(memT, 14, 6); css(memT, { font: '800 24px "Sans SC"', color: '#4d565e' });
  const memB = h('div', 'abs', mem, '行锁：一个也不记'); px(memB, 14, 52); css(memB, { font: '700 22px "Sans SC"', color: 'var(--ok)', whiteSpace: 'nowrap' });
  set(mem, 0, { autoAlpha: 0 }); show(mem, T('m15b', '不占内存') - 0.2, { x: 16, y: 0 }); gone(mem, T('m17') - 0.3, 0.3); sfx('tick', T('m15b', '不占内存'), { g: 0.5 });
  [fkA, fkB, fa, fb].forEach((e) => tl.fromTo(e, { opacity: 1 }, { opacity: 0.45, duration: 0.3, immediateRender: false }, T('m15b') - 0.2));

  // ── m17–m18：Alice 提交：4856 那一格从「进行中」翻成「已提交」；锁随之没了，等待结束 ──
  typeIn(pa, 2, `${K('COMMIT')};`, T('m17') - 0.1, 'alice=*&gt;');
  const tOk = T('m18', '已提交') - 0.1;
  tl.fromTo(xc1, { rotationX: 0 }, { rotationX: 90, duration: 0.15, ease: 'power1.in', immediateRender: false }, tOk - 0.15);
  keyed(xc1).at(tOk, { html: `${X} 已提交` }); set(xc1, tOk, DONE);
  tl.fromTo(xc1, { rotationX: -90 }, { rotationX: 0, duration: 0.2, ease: 'power1.out', immediateRender: false }, tOk); sfx('chime', tOk + 0.1, { g: 0.6 });
  say(pa, 1, '<b style="color:var(--ok)">已提交</b>', tOk);
  gone(lk0, tOk, 0.2); set(vo.xmax, tOk, { backgroundColor: '#193145', boxShadow: 'inset 0 0 0 0px #f2c94c' }); set(vn.xmin, tOk, { backgroundColor: '#193145' });   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影
  [fkB, fb].forEach((e) => gone(e, tOk, 0.3));
  [fkA, fa].forEach((e) => tl.fromTo(e, { opacity: 0.45 }, { opacity: 1, duration: 0.25, immediateRender: false }, tOk));
  tl.fromTo(fkA, { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, transformOrigin: '0 50%', immediateRender: false }, tOk + 0.1);
  gone(wb, T('m19') - 0.2, 0.25);

  // ── m19–m19b：Carol 接着改的是 43 这一版：43 的 xmax 记上她，她写出 44；后来她撤回，44 那一版作废 ──
  const tGo = T('m19', '43') - 0.7;
  tl.fromTo(req, { x: XMX - 100 - (PX + 60), y: 302 - (PY.carol + 120) }, { x: XMX - 80 - (PX + 60), y: CY[1] + 10 - (PY.carol + 120), duration: 0.5, ease: 'power2.inOut', immediateRender: false }, tGo);
  tl.fromTo(req, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.6, duration: 0.25, immediateRender: false }, tGo + 0.45);
  keyed(vn.xmax).at(tGo + 0.6, { html: 'xmax Carol' }); set(vn.xmax, tGo + 0.6, { backgroundColor: '#b8442f' }); sfx('pop', tGo + 0.6, { p: -0.4 });
  show(v3.e, tGo + 0.75, { x: -30, y: 0 }); arrowIn(ct2, tGo + 0.9, 0.4);
  wipe(xc2, tGo + 0.75, { dir: 'l' });
  [fkA, fa].forEach((e) => gone(e, tGo, 0.25));
  say(pc, 1, `→ <b style="background:var(--hi);padding:0 6px">${M.carolGot}</b>　在 43 上加一`, T('m19', '43'));
  typeIn(pc, 2, `${K('ROLLBACK')};`, T('m19b', '放弃') - 0.3, 'carol=*&gt;');
  const tAb = T('m19b', '放弃') + 0.1;
  keyed(xc2).at(tAb, { html: 'Carol 已中止' }); set(xc2, tAb, { background: '#5f6a73', color: '#fff', border: '0px solid transparent', lineHeight: '56px' });
  tl.fromTo(xc2, { scale: 1 }, { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, tAb); sfx('error', tAb, { g: 0.35, p: 0.3 });
  set(v3.data, tAb, { color: '#6b757e', borderColor: 'var(--grey)', background: 'repeating-linear-gradient(135deg,#eceff1 0 8px,#fff 8px 16px)' }); set(v3.xmin, tAb, { backgroundColor: '#5f6a73' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
  set(vn.xmax, tAb, { backgroundColor: '#5f6a73', textDecoration: 'line-through' });
  const ab = tagEl(A, '已中止：谁都看不见', TAGX, CY[2] + 12, 'grey'); css(ab, { fontSize: '22px' }); set(ab, 0, { autoAlpha: 0 }); show(ab, tAb + 0.1, { x: 12, y: 0 });

  // ── m20：Bob 再查一次：新快照的分界移到右边，4856 已经结束——新版本的起点算数，旧版本的终点也算数：读到 43 ──
  tl.fromTo(pb.e, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, T('m20') - 0.3);
  gone(pb.cur[2], T('m20') - 0.3, 0.2); typeIn(pb, 0, `${K('SELECT')} age … id = 2050`, T('m20') - 0.1, 'bob=&gt;');
  const XS = 1500;
  const cut2 = h('div', 'abs', A); px(cut2, XS - 3, 728, 6, 172); css(cut2, { background: 'var(--warn)', transformOrigin: '50% 0' }); cut2.dataset.name = '快照的分界';
  const hatch2 = h('div', 'abs', A); px(hatch2, XS + 3, 758, AX1 - XS - 3, 128); css(hatch2, { background: 'repeating-linear-gradient(135deg, rgba(95,106,115,.2) 0 8px, transparent 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
  const snap2 = h('div', 'abs', A, '<b>Bob 的新快照</b>：4856 已经结束'); px(snap2, XS - 380, 690); css(snap2, { font: '500 24px "Sans SC"', color: 'var(--navy)', whiteSpace: 'nowrap' });
  A.insertBefore(hatch2, bOld);
  [cut2, hatch2, snap2].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  const tS2 = T('m20', '再查') - 0.1;
  tl.fromTo(cut2, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'power2.out', immediateRender: false }, tS2); wipe(hatch2, tS2 + 0.2, { dir: 'l', d: 0.4 }); show(snap2, tS2, { y: 8 }); sfx('thud', tS2, { g: 0.35 });
  tl.fromTo(bOld, { opacity: 1 }, { opacity: 0.35, duration: 0.3, immediateRender: false }, tS2 + 0.4); tl.fromTo(vo.e, { opacity: 1 }, { opacity: 0.4, duration: 0.3, immediateRender: false }, tS2 + 0.4);
  const see2 = link(ov, [[PX + PW + 6, PY.bob + 140], [CX - 8, CY[1] + 40]], 'navy', { w: 3.5 }); arrowIn(see2, T('m20', '43') - 0.5, 0.4);
  fly(A, String(M.bobAfter), [DATAX + 80, CY[1] + 12], [PX + 330, PY.bob + 132], T('m20', '43') - 0.6, { cls: '', fs: 24, d: 0.5, sink: true });
  say(pb, 1, `→ <b style="background:var(--hi);padding:0 6px">${M.bobAfter}</b>`, T('m20', '43') - 0.05); sfx('blip', T('m20', '43'), { g: 0.5 });
  tl.fromTo(vn.e, { boxShadow: '0 0 0 0px rgba(224,161,27,0)' }, { boxShadow: '0 0 0 6px rgba(224,161,27,1)', duration: 0.25, immediateRender: false }, T('m20', '43') - 0.1);   // lint-ok: 0 模糊的外圈实色描边（box-shadow spread），用于原地指认，不是投影

  // ── C：两种隔离级别：两条时间线，快照在哪里拍 ──
  hdoc(C, '两种隔离级别：快照在什么时候拍', 72, 128);
  const L0 = 520, L1 = 1780, TX = (k) => L0 + k * (L1 - L0);
  const lane = (y, title, color, term_, gloss, tIn) => {
    const hd = h('div', 'abs', C, title); px(hd, 72, y - 20); css(hd, { font: '800 32px "Sans SC"', color });
    const ax = h('div', 'abs', C); px(ax, L0, y + 40, L1 - L0, 4); css(ax, { background: color });
    const g = glossBox(C, term_, gloss, 72, y + 34, 420);
    show(hd, tIn); fromTo(ax, tIn, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6 }); show(g, tIn + 0.1, { y: 10 });
    return { hd, ax, g };
  };
  const ev = (k, y, html, cls, t) => { const e = tagEl(C, html, TX(k) - 60, y, cls); css(e, { fontSize: '24px' }); show(e, t, { y: 10 }); return e; };
  const snapAt = (k, y, t) => { const e = h('div', 'abs', C, '快照'); px(e, TX(k) - 40, y, 80, 44); css(e, { border: '3px solid var(--navy)', background: '#fff', font: '700 22px "Sans SC"', color: 'var(--navy)', textAlign: 'center', lineHeight: '38px' }); slam(e, t, { from: 1.4 }); sfx('tick', t, { g: 0.5 }); return e; };
  // 每次读，下面画一条小数轴（前两段的画法）：两个版本的范围，加上这次快照的分界。分界在 4856 上（Alice 还没提交）：新版本不算，旧版本的终点也不算，看见 42；
  // 分界在 4856 右边（Alice 已提交）：新版本的起点算数，旧版本到此为止，看见 43
  const seen = (k, y, after, t) => {
    const W = 330, MX = 150, cx = after ? 290 : MX;
    const g = h('div', 'abs', C); px(g, TX(k) - W / 2, y + 108, W, 112); g.dataset.name = '这次看见的版本';
    css(g, { background: '#fff', border: '2px solid #b9cfe2', boxSizing: 'border-box' });
    const ht = h('div', 'abs', g); px(ht, cx + 2, 6, W - cx - 10, 96); css(ht, { background: 'repeating-linear-gradient(135deg, rgba(95,106,115,.2) 0 8px, transparent 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲、未提交或作废，不是渐变
    const B = { font: '700 22px "Sans SC"', lineHeight: '36px', padding: '0 8px', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden' };
    const bo = h('div', 'abs', g, '旧版本 42'); px(bo, 12, 12, (after ? MX : W - 20) - 12, 36); css(bo, { ...B, background: 'var(--sky-lt)', color: 'var(--navy)' });
    const bn = h('div', 'abs', g, '新版本 43'); px(bn, MX, 58, W - MX - 8, 36); css(bn, { ...B, background: 'var(--pg)', color: '#fff' });
    if (after) css(bo, { opacity: 0.35 }); else css(bn, { background: '#fff', color: 'var(--pg)', outline: '3px dashed var(--pg)', outlineOffset: '-3px' });
    const cut = h('div', 'abs', g); px(cut, cx - 2, 4, 4, 102); css(cut, { background: 'var(--warn)' });
    show(g, t, { y: 8 }); return g;
  };  // 中间一道竖线：Alice 提交
  const yR = 250, yP = 560;
  const cm = h('div', 'abs', C); px(cm, TX(0.5) - 2, 230, 4, yP + 224 - 230); css(cm, { background: 'var(--warn)' }); cm.dataset.name = 'Alice 提交';
  const cml = tagEl(C, 'Alice 提交', TX(0.5) - 70, 196, 'warn'); css(cml, { fontSize: '24px' });
  // 读已提交：每条语句一张新快照
  const LR = lane(yR, '读已提交（默认）', 'var(--pg)', '读已提交', '<b>读已提交</b>：每条语句开始时，都拿一张新快照', T('m21'));
  show(cm, T('m21') + 0.3, { y: 0 });
  tl.fromTo(cml, { autoAlpha: 1, x: (1220 - 110) - (TX(0.5) - 70), y: 236 - 196, scale: 1.25 }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: true }, tC - 0.3);   // 上一段的「4856 已提交」那一格飞上来，成为两条时间线中间的分界
  snapAt(0.18, yR - 30, T('m22', '每条语句')); ev(0.18, yR + 60, 'SELECT → 42', 'navy', T('m22', '每条语句') + 0.3); seen(0.18, yR, false, T('m22', '每条语句') + 0.6);
  snapAt(0.78, yR - 30, T('m22', '新快照')); ev(0.78, yR + 60, `SELECT → ${M.bobAfter}`, '', T('m22', '新快照') + 0.3); seen(0.78, yR, true, T('m22', '新快照') + 0.6);
  sfx('blip', T('m22', '新快照') + 0.3, { g: 0.5 });
  // 可重复读：整个事务只用开头那一张
  const ovC = overlay(C);
  const LP2 = lane(yP, '可重复读', 'var(--navy)', '可重复读', '<b>可重复读</b>：整个事务只用开头那一张快照', T('m23'));
  snapAt(0.08, yP - 30, T('m24', '开头')); ev(0.08, yP + 60, 'BEGIN', 'grey', T('m24', '开头') - 0.2);
  ev(0.3, yP + 60, 'SELECT → 42', 'navy', T('m24', '开头') + 0.4); seen(0.3, yP, false, T('m24', '开头') + 0.7);
  const back1 = curve(ovC, [TX(0.3), yP + 60], [TX(0.08) + 30, yP + 14], 'navy', { bend: yP - 10, dashed: true }); arrowIn(back1, T('m24', '开头') + 0.5, 0.4);
  ev(0.68, yP + 60, `SELECT → ${M.bobRR}`, 'navy', T('m24b', '42') - 0.2); seen(0.68, yP, false, T('m24b', '42') + 0.1);
  const back2 = curve(ovC, [TX(0.68), yP + 60], [TX(0.08) + 40, yP + 14], 'navy', { bend: yP - 50, dashed: true }); arrowIn(back2, T('m24b', '42') - 0.1, 0.5); sfx('blip', T('m24b', '42'), { g: 0.5, p: 0.5 });
  // 再去改 Alice：报错
  ev(0.9, yP + 60, 'UPDATE', 'warn', T('m25', '改') - 0.1);
  const er = h('div', 'abs', C, `<span class="mono">ERROR:  ${esc(M.rrError.message)}</span>`); px(er, L0, yP + 232, 1260); css(er, { font: '700 24px var(--mono)', color: 'var(--warn)', whiteSpace: 'nowrap' });
  show(er, T('m25', '报错'), { y: 8 }); sfx('error', T('m25', '报错') + 0.1, { g: 0.6, p: 0.5 });
  const zh = tagEl(C, '无法串行化：并发修改了同一行（SQLSTATE 40001）', L0, yP + 276, 'warn'); css(zh, { fontSize: '26px' }); show(zh, T('m26'), { y: 8 });
  const inn = noteBox(C, '<b>InnoDB</b>　默认是可重复读', 72, 900, 640, 'grey'); show(inn, T('m27'), { y: 10 });
  const rC = focusRing(C);
  rC.at(T('m21', '读已提交'), LR.hd).at(T('m23', '可重复读'), LP2.hd).at(T('m26', '无法串行化'), zh).at(T('m27', '可重复读'), LP2.hd).off(s.end - 0.6);
});
