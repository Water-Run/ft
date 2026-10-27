// 07 事务与并发：提交状态、快照与可见性（X1–X3、X12）→ Carol 等 Alice 的事务，锁记在 xmax（X4–X6、X13）→ 读已提交与可重复读（X7、X10、X11）
scene('mvcc', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('m11') + 0.5, tC = Tend('m20') + 0.5;
  const [A, B, C] = screens(world, [c0, tB, tC, s.end]);
  drift(world, s, [tB, tC], -1);
  const M = D.mvcc, X = M.xid;

  // 提交状态条（两屏共用的画法）
  const xactStrip = (p, y, tIn, tWho = tIn + 0.3) => {
    const box = h('div', 'abs', p); px(box, 72, y, 1100, 74); box.dataset.name = '提交状态';
    const lab = capt(p, '<b>提交状态</b>（pg_xact）', 72, y - 40);
    const cell = (x, w, txt, cls) => { const c = h('div', 'abs', box, txt); px(c, x, 6, w, 58); css(c, { font: '700 24px "Mono","Sans SC"', textAlign: 'center', lineHeight: '58px', color: '#fff', background: 'var(--pg)' }); if (cls === 'run') css(c, { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', color: 'var(--warn)', border: '3px solid var(--warn)', lineHeight: '52px' }); return c; };
    const c1 = cell(0, 260, `${D.alice.xmin} 已提交`);
    const dots = h('div', 'abs cap mono', box, '…'); px(dots, 300, 14);
    const c2 = cell(380, 300, `${X} 进行中`, 'run');
    const who = tagEl(p, 'Alice 的这次修改', 72 + 700, y + 18, 'warn');
    show(lab, tIn); wipe(box, tIn, { dir: 'l' }); show(who, tWho, { x: -10 });
    return { box, c1, c2, who };
  };

  // ── A：Bob 看见哪一个版本 ──
  hdoc(A, '两个版本，谁看见哪一个', 72, 128);
  const xs = xactStrip(A, 250, T('m4'), T('m4b') + 0.1);
  sfx('tick', T('m4b') + 0.1, { p: 0.4 });
  const vOld = h('div', 'tup', A, `旧版本　2050 Alice 42　xmin ${D.alice.xmin}　xmax ${X}`); px(vOld, 72, 400, 860);
  const vNew = h('div', 'tup new', A, `新版本　2050 Alice 43　xmin ${X}　xmax 0`); px(vNew, 72, 470, 860);
  show(vOld, T('m1'), { x: -20 }); show(vNew, T('m1') + 0.15, { x: -20 }); sfx('pop', T('m1'), { g: 0.5 });
  const which = tagEl(A, '别人来读：给哪一个？', 960, 404, 'grey'); show(which, T('m1b', '哪一个'), { x: -10 }); hide(which, T('m2') + 0.1, { d: 0.25 });
  to(vNew, T('m2', '还没提交'), { boxShadow: '0 0 0 4px #b8442f', duration: 0.3 }); sfx('tick', T('m2', '还没提交'), { p: 0.3 });
  const xid = tagEl(A, '还没提交', 960, 474, 'warn'); show(xid, T('m2', '还没提交'), { x: -10 });
  const xidT = tagEl(A, `Alice 的事务号：${X}`, 960, 540, 'navy'); css(xidT, { fontSize: '30px' }); slam(xidT, T('m3', String(X)), { from: 1.15 }); sfx('tick', T('m3', String(X)));
  // Bob 的快照
  const snap = h('div', 'abs', A); px(snap, 1240, 200, 600, 220); snap.dataset.name = 'Bob 的快照';
  css(snap, { border: '3px solid var(--sky)', background: '#fff' });
  const sn1 = h('div', 'abs cap', snap, '<b>Bob 的快照</b>'); px(sn1, 20, 14);
  const sn2 = h('div', 'abs mono', snap, M.snapshot); px(sn2, 20, 60); css(sn2, { font: '700 46px "Mono"', color: 'var(--pg)' });
  const sn3 = h('div', 'abs cap', snap, `${X} 起的事务：都还看不见`); px(sn3, 20, 140); css(sn3, { color: 'var(--warn)' });
  wipe(snap, T('m5') + 0.2, { dir: 'r' }); show(sn3, T('m7', '看不见'), { y: 8 }); sfx('pop', T('m7', '看不见'), { g: 0.5, p: 0.5 });
  const snG = glossBox(A, '快照', '<b>快照</b>：查询开始那一刻，<br>记下哪些事务已经结束、哪些还没有', 1240, 440, 600);
  show(snG, T('m6', '快照') + 0.1, { x: 20 }); sfx('pop', T('m6', '快照') + 0.1, { g: 0.5 });
  // 两个版本各过一遍
  const chkNew = tagEl(A, `xmin ${X} 看不见 → 这个版本不算`, 72, 600, 'warn');
  const chkOld = tagEl(A, `xmax ${X} 还看不见 → 作废不算数`, 72, 660);
  show(chkNew, T('m8', '看不见'), { y: 8 }); sfx('error', T('m8', '看不见') + 0.05, { g: 0.4 });
  classAt(vNew, 'ghost', T('m8', '看不见'));
  show(chkOld, T('m9', '不算数'), { y: 8 }); sfx('tick', T('m9', '不算数'));
  const bob = psqlBox(A, `<span class="p">bob=&gt;</span> <span class="k">SELECT</span> age <span class="k">FROM</span> users <span class="k">WHERE</span> id = 2050;\n age\n-----\n<span class="hi">  ${M.bobReads} </span>`, 72, 730, 900);
  css(bob, { fontSize: '23px' }); wipe(bob, T('m10'), { dir: 'l' }); sfx('blip', T('m10', '42'), { g: 0.6 });
  const nowait = tagEl(A, '读和写互不等待', 1240, 760, 'ok'); slam(nowait, T('m11'), { from: 1.15 }); sfx('chime', T('m11', '也不用等'), { g: 0.6 });

  // ── B：Carol 也要改 ──
  hdoc(B, 'Carol 也要改这一行', 72, 128);
  const xs2 = xactStrip(B, 250, tB + 0.1);
  const carol = psqlBox(B, `<span class="p">carol=*&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = age + 1\n           <span class="k">WHERE</span> id = 2050;\n<span class="er">（等待中…）</span>`, 72, 380, 900);
  css(carol, { fontSize: '23px' }); wipe(carol, T('m12'), { dir: 'l' }); sfx('blip', T('m12'), { g: 0.5 });
  const lk = tableDoc(B, ['连接', '锁的对象', '模式', '拿到了吗'],
    M.locks.filter((l) => l[1] === 'transactionid').map((l) => [l[0], `事务 ${l[2]}`, l[3], l[4] ? '是' : '<b style="color:#fff;background:var(--warn);padding:0 8px">等待</b>']), 1040, 380, { hl: [2] });
  css(lk, { fontSize: '23px' });
  const lkl = capt(B, '<b>pg_locks</b>（实测）', 1040, 340);
  show(lkl, T('m14')); wipe(lk, T('m14'), { dir: 'r' }); sfx('tick', T('m14', '事务结束'), { p: 0.4 });
  const waitT = tagEl(B, `Carol 等的是事务 ${X} 结束`, 1040, 600, 'warn'); show(waitT, T('m14', '事务结束') + 0.2, { y: 8 });
  const hx = h('div', 'tup', B, `行头　xmax ${X}　← 锁就记在这里`); px(hx, 72, 560, 900);
  show(hx, T('m15', 'xmax'), { x: -20 }); classAt(hx, 'new', T('m15', 'xmax') + 0.3, T('m17')); sfx('pop', T('m15', 'xmax'));
  const nomem = noteBox(B, '<b>行锁不占内存</b>　记在行上，一次锁多少行都行', 72, 630, 900); show(nomem, T('m15b'), { y: 10 });
  // Alice 提交
  const commit = psqlBox(B, `<span class="p">alice=*&gt;</span> <span class="k">COMMIT</span>;`, 1040, 680, 800); css(commit, { fontSize: '23px' });
  wipe(commit, T('m17'), { dir: 'r' }); sfx('blip', T('m17'), { g: 0.6 });
  keyed(xs2.c2).at(T('m18', '已提交'), { html: `${X} 已提交` }); set(xs2.c2, T('m18', '已提交'), { background: 'var(--pg)', color: '#fff', border: 'none', lineHeight: '58px' });
  keyed(xs2.who).at(T('m18', '已提交'), { html: 'Alice 已提交' }); set(xs2.who, T('m18', '已提交'), { background: 'var(--pg)' });
  sfx('chime', T('m18', '已提交'), { g: 0.6 });
  keyed(carol).at(T('m19', '43'), { html: `<span class="p">carol=*&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = age + 1\n           <span class="k">WHERE</span> id = 2050 <span class="k">RETURNING</span> age;\n<span class="hi"> ${M.carolGot} </span><span class="d">← 在 43 上加一</span>` });
  sfx('pop', T('m19', '43'), { p: -0.4 });
  keyed(carol).at(T('m19b', '放弃'), { html: `<span class="p">carol=*&gt;</span> <span class="k">ROLLBACK</span>;\n<span class="d">（放弃了这次修改，Alice 仍是 43）</span>\n ` });
  hide(waitT, T('m17') + 0.2, { d: 0.3 });
  const bob2 = tagEl(B, `Bob 再查：${M.bobAfter}`, 1040, 780, 'navy'); show(bob2, T('m20', '43'), { y: 8 }); sfx('blip', T('m20', '43'), { g: 0.5 });

  // ── C：读已提交与可重复读 ──
  hdoc(C, '两种隔离级别', 72, 128);
  const col = (x, title, cls, lines, term, gloss) => {
    const head = h('div', 'abs', C, title); px(head, x, 210, 840); css(head, { font: '800 34px "Sans SC"', color: cls === 'rr' ? 'var(--navy)' : 'var(--pg)' });
    const g = glossBox(C, term, gloss, x, 270, 840);
    const q = psqlBox(C, '', x, 400, 840); css(q, { fontSize: '23px', height: '400px', whiteSpace: 'pre-wrap' });
    return { head, g, q };
  };
  const rc = col(72, '读已提交（默认）', 'rc', [], '读已提交', '<b>读已提交</b>：每条语句开始时，都拿一张新快照');
  const rr = col(1000, '可重复读', 'rr', [], '可重复读', '<b>可重复读</b>：整个事务只用开头那一张快照');
  show(rc.head, T('m21')); show(rc.g, T('m21', '读已提交') + 0.1, { y: 10 }); sfx('pop', T('m21', '读已提交') + 0.1, { g: 0.5, p: -0.5 });
  const sel = (n) => `<span class="p">bob=&gt;</span> <span class="k">SELECT</span> age …;  <span class="hi"> ${n} </span>`;
  const mid = `<span class="d">—— Alice 提交 ——</span>`;
  const krc = keyed(rc.q);
  appear(rc.q, T('m22') - 0.2);
  krc.at(T('m22'), { html: `${sel(42)}\n${mid}` });
  krc.at(T('m22', '新快照'), { html: `${sel(42)}\n${mid}\n${sel(M.bobAfter)}` }); sfx('blip', T('m22', '新快照'), { g: 0.5, p: -0.5 });
  show(rr.head, T('m23')); show(rr.g, T('m23', '可重复读') + 0.1, { y: 10 }); sfx('pop', T('m23', '可重复读') + 0.1, { g: 0.5, p: 0.5 });
  const krr = keyed(rr.q);
  appear(rr.q, T('m24') - 0.2);
  krr.at(T('m24'), { html: `<span class="p">bob=*&gt;</span> <span class="k">BEGIN ISOLATION LEVEL REPEATABLE READ</span>;\n${sel(42)}\n${mid}` });
  krr.at(T('m24b', '42'), { html: `<span class="p">bob=*&gt;</span> <span class="k">BEGIN ISOLATION LEVEL REPEATABLE READ</span>;\n${sel(42)}\n${mid}\n${sel(M.bobRR)}` }); sfx('blip', T('m24b', '42'), { g: 0.5, p: 0.5 });
  const err = `<span class="p">bob=*&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 50 …;\n<span class="er">ERROR:  ${esc(M.rrError.message)}</span>`;
  krr.at(T('m25', '报错'), { html: `<span class="p">bob=*&gt;</span> <span class="k">BEGIN ISOLATION LEVEL REPEATABLE READ</span>;\n${sel(42)}\n${mid}\n${sel(M.bobRR)}\n${err}` });
  sfx('error', T('m25', '报错') + 0.1, { g: 0.6, p: 0.5 });
  const zh = noteBox(C, '<b>无法串行化</b>　并发修改了同一行（SQLSTATE 40001）', 1000, 820, 840, 'warn'); show(zh, T('m26'), { y: 10 });
  const inn = noteBox(C, '<b>InnoDB</b>　默认是可重复读', 72, 820, 840, 'grey'); show(inn, T('m27'), { y: 10 });
});
