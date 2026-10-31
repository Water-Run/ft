// 07 事务与并发：提交状态、快照与可见性（X1–X3、X12）→ Carol 等 Alice 的事务，锁记在 xmax（X4–X6、X13）→ 读已提交与可重复读（X7、X10、X11）
scene('mvcc', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('m11') + 0.5, tC = Tend('m20') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);
  const M = D.mvcc, X = M.xid;

  // 提交状态条：每个事务一格（两屏共用的画法）
  const xactStrip = (p, y, tIn) => {
    const box = h('div', 'abs', p); px(box, 420, y, 760, 64); box.dataset.name = '提交状态';
    const lab = capt(p, '<b>提交状态</b>（pg_xact）', 72, y + 14); css(lab, { fontSize: '26px' });
    const cell = (x, w, txt, run) => { const c = h('div', 'abs', box, txt); px(c, x, 0, w, 60); css(c, { font: '700 26px "Mono","Sans SC"', textAlign: 'center', lineHeight: '60px', color: '#fff', background: 'var(--pg)' }); if (run) css(c, { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', color: 'var(--warn)', border: '3px solid var(--warn)', lineHeight: '54px' }); return c; };
    const c1 = cell(0, 300, `${D.alice.xmin} 已提交`);
    const dots = h('div', 'abs cap mono', box, '…'); px(dots, 330, 12);
    const c2 = cell(400, 340, `${X} 进行中`, true);
    show(lab, tIn); wipe(box, tIn, { dir: 'l' });
    return { box, c1, c2 };
  };
  // 一个行版本：xmin、xmax 两格行头 + 数据
  const verRow = (p, y, xmin, xmax, data, isNew) => {
    const e = h('div', 'abs', p); px(e, 420, y, 760, 56); e.dataset.name = isNew ? '新版本' : '旧版本';
    const cell = (x, w, html, head) => { const c = h('div', 'abs', e, html); px(c, x, 0, w, 56); css(c, { background: head ? 'var(--navy)' : (isNew ? 'var(--pg)' : 'var(--sky-lt)'), color: head || isNew ? '#fff' : 'var(--navy)', font: `600 ${head ? 24 : 28}px var(--mono)`, lineHeight: '56px', textAlign: 'center', whiteSpace: 'nowrap' }); return c; };
    const r = { e, xmin: cell(0, 210, xmin, true), xmax: cell(214, 210, xmax, true), data: cell(428, 332, data) };
    const l = capt(p, isNew ? '新版本' : '旧版本', 300, y + 12); css(l, { fontSize: '26px', fontWeight: 700, color: isNew ? 'var(--pg)' : 'var(--ink2)' }); r.l = l;
    return r;
  };

  // ── A：Bob 来读，该给哪一个版本？ ──
  hdoc(A, '两个版本，谁看见哪一个', 72, 128);
  const vo = verRow(A, 430, `xmin ${D.alice.xmin}`, `xmax ${X}`, '2050 Alice 42'), vn = verRow(A, 520, `xmin ${X}`, 'xmax 0', '2050 Alice 43', true);
  [vo, vn].forEach((r, i) => { show(r.e, T('m1') + i * 0.15, { x: -20 }); show(r.l, T('m1') + i * 0.15 + 0.1, { x: -20 }); }); sfx('pop', T('m1'), { g: 0.5 });
  // 别人来读：给哪一个？
  const ovA = overlay(A);
  const qq = tagEl(A, '别人来读：给哪一个？', 1220, 470, 'grey'); css(qq, { fontSize: '26px' });
  const q1 = link(ovA, [[1216, 480], [1186, 458]], 'grey', { dashed: true }), q2 = link(ovA, [[1216, 500], [1186, 546]], 'grey', { dashed: true });
  show(qq, T('m1b', '哪一个'), { x: 20 }); arrowIn(q1, T('m1b', '哪一个') + 0.2, 0.3); arrowIn(q2, T('m1b', '哪一个') + 0.3, 0.3);
  [qq, q1, q2].forEach((e) => hide(e, T('m2') + 0.1, { d: 0.25 }));
  // 回到 Alice 还没提交的时候：她的事务号 4856
  const al = tagEl(A, 'Alice 的修改：还没提交', 1220, 528, 'warn'); css(al, { fontSize: '26px' }); show(al, T('m2', '还没提交'), { x: 20 }); sfx('tick', T('m2', '还没提交'), { p: 0.3 });
  [vn.xmin, vo.xmax].forEach((c, i) => to(c, T('m3', String(X)) + i * 0.15, { backgroundColor: '#b8442f', duration: 0.25 })); sfx('tick', T('m3', String(X)));
  keyed(al).at(T('m3', String(X)), { html: `Alice 的事务 ${X}：还没提交` });
  // 每个事务提交了没有，另有一处记着：这时 4856 是「进行中」
  const xs = xactStrip(A, 250, T('m4') - 0.2);
  const toX = curve(ovA, [420 + 214 + 105, 430], [420 + 400 + 170, 316], 'warn', { bend: 372 }); arrowIn(toX, T('m4b', '进行中') - 0.3, 0.5); sfx('tick', T('m4b', '进行中'), { p: 0.4 });   // 从旧版本的 xmax（也是 4856）往上连到提交状态，不穿过别的字
  // Bob 来读，带着一张快照
  const tb = term(A, 72, 660, 860, 3, { name: 'Bob 的会话' });
  const eB = tb.type(T('m5') - 0.1, '<span class="k">SELECT</span> age <span class="k">FROM</span> users <span class="k">WHERE</span> id = 2050;', 'bob=&gt;', 45);
  // Bob 的快照画成一条事务号的轴：4856 处切一刀，右边是「还看不见」。两个版本各是一段可见范围（第三章的画法）：
  // 新版本从 4856 起，整段落在看不见的一边；旧版本到 4856 止，可这个止点也在看不见的一边，作废还不算数，照旧看得见（WaterRun 看 r7：「xmin和xmax是可见事务范围」）
  const snap = h('div', 'abs', A); px(snap, 980, 640, 868, 280); snap.dataset.name = 'Bob 的快照';
  css(snap, { border: '4px solid var(--navy)', background: '#fff' });
  const sn1 = h('div', 'abs cap', snap, '<b>Bob 的快照</b>'); px(sn1, 20, 12);
  const sn2 = h('div', 'abs', snap, `原样：<span class="mono">${M.snapshot}</span>`); px(sn2, 600, 16); css(sn2, { font: '500 22px var(--sans)', color: 'var(--ink2)' });   // 原始格式只作旁证，小字
  const CUT = 470, AX0 = 40, AX1 = 840;
  const fut = h('div', 'abs', snap); px(fut, CUT, 56, AX1 - CUT + 20, 150); css(fut, { background: 'repeating-linear-gradient(135deg,#eef0f2 0 8px,#fff 8px 16px)' });
  const cut = h('div', 'abs', snap); px(cut, CUT - 2, 52, 4, 172); css(cut, { background: 'var(--warn)' });
  const sn3 = h('div', 'abs', snap, `${X} 起：都还看不见`); px(sn3, CUT + 14, 214); css(sn3, { color: 'var(--warn)', font: '700 28px "Sans SC"', whiteSpace: 'nowrap' });
  const ax = h('div', 'abs', snap); px(ax, AX0, 206, AX1 - AX0, 3); css(ax, { background: 'var(--ink2)' });
  const axl = h('div', 'abs', snap, '事务号 →'); px(axl, AX0, 214); css(axl, { font: '600 22px "Sans SC"', color: 'var(--ink2)' });
  const xt = h('div', 'abs', snap, String(X)); px(xt, CUT - 34, 178); css(xt, { font: '700 22px var(--mono)', color: 'var(--warn)', background: '#fff' });
  const vband = (y, x0, x1, txt, cls, fg = '#fff') => { const b = h('div', 'abs', snap, txt); px(b, x0, y, x1 - x0, 40); css(b, { font: '700 22px "Sans SC"', lineHeight: '40px', padding: '0 12px', whiteSpace: 'nowrap', color: fg, background: cls, transformOrigin: '0 50%' }); return b; };
  const bOld = vband(70, AX0 + 20, CUT, `旧版本 42：${D.alice.xmin} → ${X}`, 'var(--sky-lt)', 'var(--navy)'), bNew = vband(124, CUT, AX1, `新版本 43：${X} →`, 'var(--pg)');
  wipe(snap, T('m6', '快照') - 0.2, { dir: 'r' });
  [fut, cut, sn3, xt].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  show(fut, T('m7', '起的事务') - 0.1, { y: 0, d: 0.35 }); show(cut, T('m7', '起的事务') - 0.1, { y: 0, d: 0.2 }); show(xt, T('m7', '起的事务'), { y: 0 });
  show(sn3, T('m7', '看不见') - 0.1, { y: 8 }); sfx('pop', T('m7', '看不见'), { g: 0.5, p: 0.5 });
  set(bOld, 0, { autoAlpha: 0 }); set(bNew, 0, { autoAlpha: 0 });
  tl.fromTo(bNew, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('m8') - 0.1);
  tl.fromTo(bOld, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out', immediateRender: false }, T('m9') - 0.1);
  const snG = glossBox(A, '快照', '<b>快照</b>：查询开始那一刻，记下哪些事务已经结束、哪些还没有', 72, 836, 860);
  show(snG, T('m6', '快照'), { y: 10 }); sfx('pop', T('m6', '快照'), { g: 0.5 });
  [al, toX].forEach((e) => hide(e, T('m6') - 0.1, { d: 0.25 }));
  // 新版本整段在看不见的一边：虚掉；旧版本的止点在看不见的一边：止点不算，这段一直延到右边
  const tNo = T('m8', '看不见');
  set(bNew, tNo, { background: '#fff', color: 'var(--pg)', outline: '3px dashed var(--pg)', outlineOffset: '-3px' });
  set(vn.data, tNo, { background: '#fff', color: 'var(--pg)', border: '3px dashed var(--pg)' }); set(vn.xmin, tNo, { background: '#fff', color: 'var(--warn)', border: '3px dashed var(--warn)' }); set(vn.xmax, tNo, { background: '#fff', color: 'var(--navy)', border: '3px dashed var(--navy)' });
  const xNew = tagEl(A, '✗ 这个版本不算', 1220, 528, 'warn'); css(xNew, { fontSize: '26px' }); show(xNew, tNo, { x: 20 }); sfx('error', tNo + 0.05, { g: 0.4 });
  const tNs = T('m9', '不算数');
  fromTo(bOld, tNs, { width: CUT - AX0 - 20 }, { width: AX1 - AX0 - 20, duration: 0.5, ease: 'power2.inOut' });
  keyed(bOld).at(tNs, { html: `旧版本 42：${D.alice.xmin} 起，止点 ${X} 还不算 →` });
  set(vo.xmax, tNs, { textDecoration: 'line-through' });
  const xOld = tagEl(A, '✓ xmax 还不算数：照旧看得见', 1220, 438, 'ok'); css(xOld, { fontSize: '26px' }); show(xOld, tNs, { x: 20 }); sfx('tick', tNs);
  // 所以 Bob 读到旧版本 42
  fly(A, '读', [540, 650], [900, 436], T('m10') - 0.3, { cls: 'navy', fs: 24, d: 0.5 });
  tb.print(Math.max(eB + 0.2, T('m10', '42') - 0.2), ' age'); tb.print(Math.max(eB + 0.3, T('m10', '42') - 0.1), ` <span class="hi"> ${M.bobReads} </span>`); sfx('blip', T('m10', '42'), { g: 0.6 });
  const nowait = tagEl(A, '读和写互不等待', 72, 604, 'ok'); css(nowait, { fontSize: '28px' }); slam(nowait, T('m11'), { from: 1.15 }); sfx('chime', T('m11', '也不用等'), { g: 0.6 });
  const rA = focusRing(A);
  rA.at(T('m4', '另有一处'), xs.box).at(T('m4b', '进行中'), xs.c2).at(T('m5'), tb.el).off(T('m6', '快照') - 0.2);
  const rA2 = focusRing(A);
  rA2.at(T('m10', '旧版本'), vo.e).at(T('m11', '也不用等'), nowait).off(tB - 0.4);

  // ── B：Carol 也要改这一行：撞上 Alice 的锁，等到她提交 ──
  hdoc(B, 'Carol 也要改这一行', 72, 128);
  const xs2 = xactStrip(B, 250, tB + 0.1);
  const bo = verRow(B, 430, `xmin ${D.alice.xmin}`, `xmax ${X}`, '2050 Alice 42'), bn = verRow(B, 520, `xmin ${X}`, 'xmax 0', '2050 Alice 43', true);
  [bo, bn].forEach((r) => { show(r.e, tB + 0.2, { y: 0 }); show(r.l, tB + 0.2, { y: 0 }); });
  const tc = term(B, 72, 660, 860, 3, { fs: 23, lh: 34, name: 'Carol 的会话' });
  const eC = tc.type(T('m12') - 0.1, '<span class="k">UPDATE</span> users <span class="k">SET</span> age = age + 1 <span class="k">WHERE</span> id = 2050;', 'carol=*&gt;', 50);
  // Carol 的请求撞上被锁的那一行，停住；等待条一直涨
  const creq = tagEl(B, 'Carol：age + 1', 1220, 640, 'warn'); css(creq, { fontSize: '24px' });
  set(creq, 0, { autoAlpha: 0 }); set(creq, eC, { autoAlpha: 1 });
  tl.fromTo(creq, { x: -800, y: 90 }, { x: 0, y: -170, duration: 0.6, ease: 'power2.out', immediateRender: false }, eC);
  const wb = h('div', 'abs', B); px(wb, 72, 820, 860, 30); css(wb, { border: '2px solid var(--warn)' }); wb.dataset.name = '等待';
  const wf = h('div', 'abs', wb); px(wf, 0, 0, 0, 26); css(wf, { background: 'repeating-linear-gradient(135deg,var(--warn) 0 10px,#d9826f 10px 20px)' });
  const wl = capt(B, 'Carol 等待中', 72, 862); css(wl, { fontSize: '26px', color: 'var(--warn)', fontWeight: 700 });
  const tW0 = T('m13', '等'), tW1 = T('m17');
  show(wb, tW0, { y: 0 }); show(wl, tW0, { y: 8 }); fromTo(wf, tW0, { width: 0 }, { width: 856, duration: tW1 - tW0, ease: 'none' }); sfx('error', tW0, { g: 0.35 });
  // 为什么 Bob 不用等、Carol 要等：读只按快照挑一个版本；写要改这一行，撞上 xmax 里还没结束的 4856，得等它有个结果（WaterRun 看 r7：「没反应出来为什么一个可以另一个不可以」）
  const bar = h('div', 'abs', B); px(bar, 1192, 418, 7, 80); css(bar, { background: 'var(--warn)' }); bar.dataset.name = '挡住';
  set(bar, 0, { autoAlpha: 0 }); tl.fromTo(bar, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.25, immediateRender: false }, tW0 - 0.1);
  fromTo(bo.xmax, tW0 - 0.1, { boxShadow: 'inset 0 0 0 0px #b8442f' }, { boxShadow: 'inset 0 0 0 5px #b8442f', duration: 0.25 });
  const why2 = tagEl(B, `写：xmax 里的 ${X} 还没结束 → 只能等`, 1220, 520, 'warn'), why1 = tagEl(B, '读（Bob）：按快照挑一个版本 → 不用等', 1220, 566, 'ok');
  [why1, why2].forEach((e) => css(e, { fontSize: '23px' }));
  show(why2, tW0 + 0.1, { x: 16 }); show(why1, tW0 + 0.9, { x: 16 }); sfx('tick', tW0 + 0.9, { g: 0.4 });
  [why1, why2, bar].forEach((e) => hide(e, T('m15b') - 0.25, { d: 0.25 }));
  // 她等的是 Alice 的事务结束；实测的 pg_locks
  const toX2 = curve(overlay(B), [1220, 466], [420 + 400 + 170, 314], 'warn', { bend: 330 }); arrowIn(toX2, T('m14', '事务结束') - 0.3, 0.5);
  const lk = tableDoc(B, ['连接', '锁的对象', '拿到了吗'],
    M.locks.filter((l) => l[1] === 'transactionid').map((l) => [l[0], `事务 ${l[2]}`, l[4] ? '是' : '<b style="color:#fff;background:var(--warn);padding:0 8px">等待</b>']), 1220, 680);
  css(lk, { fontSize: '23px' });
  const lkl = capt(B, '<b>pg_locks</b>（实测）', 1220, 642); css(lkl, { fontSize: '24px' });
  hide(creq, T('m14') - 0.1, { d: 0.2 });
  show(lkl, T('m14') + 0.3); wipe(lk, T('m14') + 0.3, { dir: 'r' }); sfx('tick', T('m14', '事务结束'), { p: 0.4 });
  // 锁就记在行头的 xmax 里；不占内存，锁多少行都行
  to(bo.xmax, T('m15', 'xmax'), { backgroundColor: '#b8442f', duration: 0.25 }); sfx('pop', T('m15', 'xmax'));
  const here = tagEl(B, '锁就记在这里', 420 + 214, 384, 'warn'); css(here, { fontSize: '24px' }); show(here, T('m15', 'xmax'), { y: 8 });
  const many = h('div', 'abs', B); px(many, 1220, 420, 620, 180); many.dataset.name = '许多行的行头';
  for (let i = 0; i < 4; i++) { const r = h('div', 'abs', many, `xmax ${X}`); px(r, 0, i * 44, 200, 38); css(r, { background: 'var(--navy)', color: '#fff', font: '600 22px var(--mono)', lineHeight: '38px', textAlign: 'center' }); const d = h('div', 'abs', many, '……'); px(d, 210, i * 44, 160, 38); css(d, { background: 'var(--sky-lt)', font: '600 22px var(--mono)', lineHeight: '38px', textAlign: 'center', color: 'var(--navy)' }); }
  const manyL = capt(many, '锁写在每一行自己的行头里，内存里不记 → 锁多少行都行', 0, 180); css(manyL, { fontSize: '24px' });
  [lk, lkl].forEach((e) => hide(e, T('m15b') - 0.2, { d: 0.25 }));
  show(many, T('m15b'), { x: 20 }); sfx('tick', T('m15b'), { g: 0.5 });
  hide(many, T('m17') - 0.1, { d: 0.25 });
  // Alice 提交：状态变成「已提交」，Carol 不再等，改的是 43 这一版
  const ta = term(B, 1220, 642, 628, 1, { name: 'Alice 的会话' });
  ta.type(T('m17') - 0.1, '<span class="k">COMMIT</span>;', 'alice=*&gt;', 30);
  keyed(xs2.c2).at(T('m18', '已提交'), { html: `${X} 已提交` }); set(xs2.c2, T('m18', '已提交'), { background: 'var(--pg)', color: '#fff', border: 'none', lineHeight: '60px' });
  set(bo.xmax, T('m18', '已提交'), { backgroundColor: '#193145' }); hide(here, T('m18', '已提交'), { d: 0.2 });
  sfx('chime', T('m18', '已提交'), { g: 0.6 });
  hide(wb, T('m19') - 0.2, { d: 0.25 }); hide(wl, T('m19') - 0.2, { d: 0.25 });
  fly(B, 'Carol：age + 1', [72, 760], [1000, 520], T('m19', '43') - 0.6, { cls: 'warn', fs: 24, d: 0.55 });
  tc.print(T('m19', '43'), `<span class="d">-- 在 43 上加一：</span><span class="hi"> ${M.carolGot} </span>`); sfx('pop', T('m19', '43'), { p: -0.4 });
  tc.print(T('m19b', '放弃'), '<span class="p">carol=*&gt;</span> <span class="k">ROLLBACK</span>;  <span class="d">-- 放弃，Alice 仍是 43</span>');
  // Bob 再查一次，读到 43
  const bob2 = tagEl(B, `Bob 再查：${M.bobAfter}`, 1220, 760, 'navy'); css(bob2, { fontSize: '28px' }); show(bob2, T('m20', '43'), { y: 8 }); sfx('blip', T('m20', '43'), { g: 0.5 });
  fly(B, '读', [1300, 740], [1000, 526], T('m20') - 0.1, { cls: 'navy', fs: 24, d: 0.5 });
  const rB = focusRing(B);
  rB.at(T('m12', 'Carol'), tc.el).at(T('m13', '等'), wb).at(T('m14', '事务结束'), xs2.c2).at(T('m15', '锁'), bo.e).at(T('m15', 'xmax'), bo.xmax).at(T('m15b'), many).at(T('m17'), ta.el).at(T('m18', '已提交'), xs2.c2).at(T('m19', '43'), bn.e).at(T('m20', '43'), bob2).off(tC - 0.4);

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
  // 每次读，下面摆出 Alice 的两个版本：看得见的那个实心，看不见的虚线淡掉
  const seen = (k, y, val, t) => {
    const box = h('div', 'abs', C); px(box, TX(k) - 80, y + 112, 160, 80); box.dataset.name = '这次看见的版本';
    [['旧版本 42', 42], ['新版本 43', 43]].forEach(([txt, v], i) => {
      const r = h('div', 'tup ' + (v === val ? 'new' : 'ghost'), box, txt); px(r, 0, i * 42, 160); css(r, { textAlign: 'center' });
      if (v !== val) css(r, { opacity: 0.55 });
    });
    show(box, t, { y: 8 }); return box;
  };  // 中间一道竖线：Alice 提交
  const yR = 280, yP = 560;
  const cm = h('div', 'abs', C); px(cm, TX(0.5) - 2, 230, 4, yP + 200 - 230); css(cm, { background: 'var(--warn)' }); cm.dataset.name = 'Alice 提交';
  const cml = tagEl(C, 'Alice 提交', TX(0.5) - 70, 196, 'warn'); css(cml, { fontSize: '24px' });
  // 读已提交：每条语句一张新快照
  const LR = lane(yR, '读已提交（默认）', 'var(--pg)', '读已提交', '<b>读已提交</b>：每条语句开始时，都拿一张新快照', T('m21'));
  show(cm, T('m22') - 0.1, { y: 0 }); show(cml, T('m22') - 0.1, { y: 8 });
  snapAt(0.18, yR - 30, T('m22', '每条语句')); ev(0.18, yR + 60, 'SELECT → 42', 'navy', T('m22', '每条语句') + 0.3); seen(0.18, yR, 42, T('m22', '每条语句') + 0.6);
  snapAt(0.78, yR - 30, T('m22', '新快照')); ev(0.78, yR + 60, `SELECT → ${M.bobAfter}`, '', T('m22', '新快照') + 0.3); seen(0.78, yR, M.bobAfter, T('m22', '新快照') + 0.6);
  sfx('blip', T('m22', '新快照') + 0.3, { g: 0.5 });
  // 可重复读：整个事务只用开头那一张
  const ovC = overlay(C);
  const LP2 = lane(yP, '可重复读', 'var(--navy)', '可重复读', '<b>可重复读</b>：整个事务只用开头那一张快照', T('m23'));
  snapAt(0.08, yP - 30, T('m24', '开头')); ev(0.08, yP + 60, 'BEGIN', 'grey', T('m24', '开头') - 0.2);
  ev(0.3, yP + 60, 'SELECT → 42', 'navy', T('m24', '开头') + 0.4); seen(0.3, yP, 42, T('m24', '开头') + 0.7);
  const back1 = curve(ovC, [TX(0.3), yP + 60], [TX(0.08) + 30, yP + 14], 'navy', { bend: yP - 10, dashed: true }); arrowIn(back1, T('m24', '开头') + 0.5, 0.4);
  ev(0.68, yP + 60, `SELECT → ${M.bobRR}`, 'navy', T('m24b', '42') - 0.2); seen(0.68, yP, M.bobRR, T('m24b', '42') + 0.1);
  const back2 = curve(ovC, [TX(0.68), yP + 60], [TX(0.08) + 40, yP + 14], 'navy', { bend: yP - 50, dashed: true }); arrowIn(back2, T('m24b', '42') - 0.1, 0.5); sfx('blip', T('m24b', '42'), { g: 0.5, p: 0.5 });
  // 再去改 Alice：报错
  ev(0.9, yP + 60, 'UPDATE', 'warn', T('m25', '改') - 0.1);
  const er = h('div', 'abs', C, `<span class="mono">ERROR:  ${esc(M.rrError.message)}</span>`); px(er, L0, yP + 214, 1260); css(er, { font: '700 24px var(--mono)', color: 'var(--warn)', whiteSpace: 'nowrap' });
  show(er, T('m25', '报错'), { y: 8 }); sfx('error', T('m25', '报错') + 0.1, { g: 0.6, p: 0.5 });
  const zh = tagEl(C, '无法串行化：并发修改了同一行（SQLSTATE 40001）', L0, yP + 262, 'warn'); css(zh, { fontSize: '26px' }); show(zh, T('m26'), { y: 8 });
  const inn = noteBox(C, '<b>InnoDB</b>　默认是可重复读', 72, 900, 640, 'grey'); show(inn, T('m27'), { y: 10 });
  const rC = focusRing(C);
  rC.at(T('m21', '读已提交'), LR.hd).at(T('m23', '可重复读'), LP2.hd).at(T('m26', '无法串行化'), zh).at(T('m27', '可重复读'), LP2.hd).off(s.end - 0.6);
});
