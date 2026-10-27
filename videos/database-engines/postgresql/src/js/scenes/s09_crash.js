// 09 出错怎么办：WAL 先落盘、数据页晚写（W1–W3）；检查点与整页写（W4、W5、W10）→ 强行停机后重放；没提交的版本本来就看不见（W7–W9）
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('w12') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);
  const W = D.wal;

  // ── A：先写日志 ──
  hdoc(A, '先写日志，再写数据页', 72, 128);
  const walG = glossBox(A, 'WAL', '<b>WAL</b>（预写日志）：每次修改先写一条日志；<br>数据页写回磁盘之前，描述它的日志必须已经落盘', 1040, 190, 800);
  show(walG, T('w2', 'WAL') + 0.1, { x: 20 }); sfx('pop', T('w2', 'WAL') + 0.1, { g: 0.5 });
  // 问题：提交了，断电，还在吗
  const qa = tagEl(A, '已提交的修改', 72, 206, 'navy'), qb = tagEl(A, '断电', 340, 206, 'warn');
  const qc = tagEl(A, '还在吗？', 470, 206, 'navy'); css(qc, { fontSize: '34px' });
  css(qa, { fontSize: '34px' }); css(qb, { fontSize: '34px' });
  show(qa, T('w1', '提交'), { x: -10 }); slam(qb, T('w1', '断电'), { from: 1.25 }); sfx('error', T('w1', '断电'), { g: 0.4 }); show(qc, T('w1', '还在吗'), { y: 8 });
  [qa, qb, qc].forEach((e) => hide(e, T('w8') - 0.2, { d: 0.25 }));
  // 日志带：一格一条记录；蓝底实线 = 已落盘，白底虚线 = 还在内存里
  const tapeL = capt(A, '<b>WAL</b>　一条条日志记录', 72, 330);
  const tape = h('div', 'abs', A); px(tape, 72, 370, 1776, 80); tape.dataset.name = '日志带';
  const recs = ['…', '…', 'Carol 的修改', 'Carol 的修改', 'Alice：LOCK', 'Alice：UPDATE', 'Alice：索引 ×3', 'Alice：COMMIT'];
  const recEls = recs.map((r, i) => { const e = h('div', 'abs', tape, r); px(e, i * 222, 0, 212, 72); css(e, { border: '3px solid var(--pg)', background: i < 2 ? 'var(--pg)' : '#fff', font: '600 22px "Sans SC"', textAlign: 'center', lineHeight: '66px', color: i < 2 ? '#fff' : 'var(--navy)' }); if (i >= 2) css(e, { borderStyle: 'dashed' }); return e; });
  show(tapeL, T('w2', '日志') - 0.1); recEls.slice(0, 4).forEach((e, i) => show(e, (i < 2 ? T('w2', '日志') : T('w3') - 0.2) + i * 0.06, { x: -10, d: 0.2 }));
  recEls.slice(4).forEach((e, i) => show(e, T('w4') + i * 0.15, { x: -10, d: 0.2 }));
  sfx('tick', T('w4'), { g: 0.5 });
  const flush = h('div', 'abs', A); px(flush, 72 + 2 * 222 - 3, 350, 6, 120); css(flush, { background: 'var(--warn)' }); flush.dataset.name = '已落盘到这里';
  const flushL = h('div', 'abs mono', A, `已落盘 ${W.flushBefore.f}`); px(flushL, 72 + 2 * 222 - 110, 470); css(flushL, { font: '700 22px "Mono"', color: 'var(--warn)' });
  show(flush, T('w4') - 0.1); show(flushL, T('w4') - 0.1);
  const mem = tagEl(A, '这几条还在内存里', 72 + 4 * 222, 300, 'warn'); show(mem, T('w4', '内存'), { y: 8 });
  const tC = T('w5', '磁盘');
  to(flush, tC, { x: 6 * 222 - 3, duration: 0.6, ease: 'power3.inOut' }); sfx('thud', tC + 0.5, { g: 0.6 });
  keyed(flushL).at(tC + 0.6, { html: `已落盘 ${W.flushAfter.f}` }); to(flushL, tC, { x: 6 * 222 - 150, duration: 0.6, ease: 'power3.inOut' });
  recEls.slice(2).forEach((e) => set(e, tC + 0.5, { borderStyle: 'solid', background: 'var(--pg)', color: '#fff' }));
  hide(mem, tC, { d: 0.25 });
  // 数据页：内存里的已经改了，磁盘上的还是旧的
  const bufP = h('div', 'page', A); px(bufP, 72, 560, 840, 120); bufP.dataset.name = '内存里的第 23 页';
  const bufL = capt(A, '内存里的第 23 页', 72, 520);
  const bufR = h('div', 'tup new', bufP, `Alice 旧版本　xmax ${W.buffer.alice_xmax}　→ ${W.buffer.alice_ctid}`); px(bufR, 16, 36, 800);
  const dskP = h('div', 'page grey', A); px(dskP, 1000, 560, 840, 120); dskP.dataset.name = '磁盘上的第 23 页';
  const dskL = capt(A, '磁盘上（数据文件里）的第 23 页', 1000, 520);
  const dskR = h('div', 'tup grey', dskP, `Alice　xmax ${W.disk.alice_xmax}　（还是旧的）`); px(dskR, 16, 36, 800);
  wipe(bufP, T('w6') - 0.3, { dir: 'l' }); show(bufL, T('w6') - 0.3); show(bufR, T('w6') - 0.2);
  wipe(dskP, T('w6', '旧的') - 0.2, { dir: 'r' }); show(dskL, T('w6', '旧的') - 0.2); show(dskR, T('w6', '旧的'), { y: 8 }); sfx('tick', T('w6', '旧的'), { p: 0.4 });
  const late = noteBox(A, '数据页晚些再写：提交只等日志落盘', 72, 700, 840); show(late, T('w7'), { y: 10 });
  // 检查点
  const cpG = glossBox(A, '检查点', '<b>检查点</b>：保证在它之前的修改，<br>都已经写进了数据文件', 1000, 700, 840);
  show(cpG, T('w8', '检查点') + 0.1, { x: 20 }); sfx('pop', T('w8', '检查点') + 0.1, { g: 0.5 });
  const cp = h('div', 'abs', A); px(cp, 72 + 2 * 222 - 16, 330, 8, 130); css(cp, { background: 'var(--navy)' }); cp.dataset.name = '检查点';
  const cpl = tagEl(A, '检查点', 72 + 2 * 222 - 120, 290, 'navy');
  show(cp, T('w9'), { y: -10 }); show(cpl, T('w9') + 0.1, { y: 8 }); sfx('tick', T('w9'));
  hide(late, T('w10') - 0.2, { d: 0.25 }); hide(cpG, T('w10') - 0.2, { d: 0.25 });
  // 整页写：检查点后第一次改这一页，日志里带上整页
  const fpi1 = W.carolFpi[0][1];
  const big = h('div', 'abs', A); px(big, 72, 780, 840, 60); css(big, { background: 'var(--pg)' }); big.dataset.name = '带整页的记录';
  const bigL = h('div', 'abs', big, `第一次改第 23 页：日志带上整页 ${fpi1} 字节`); px(bigL, 16, 12); css(bigL, { font: '700 24px "Sans SC"', color: '#fff' });
  const small = h('div', 'abs', A); px(small, 72, 860, 120, 50); css(small, { background: 'var(--sky-lt)', border: '2px solid var(--pg)' });
  const smallL = capt(A, '再改同一页：不带整页', 210, 866);
  fromTo(big, T('w10', '整页'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }); sfx('thud', T('w10', '整页'), { g: 0.5 });
  show(small, T('w10', '整页') + 0.8, { x: -10 }); show(smallL, T('w10', '整页') + 0.9);
  // 写到一半的页：用日志里的整页恢复
  const torn = h('div', 'abs', A); px(torn, 1000, 760, 840, 150); torn.dataset.name = '写了一半的页';
  const tTop = h('div', 'abs', torn); px(tTop, 0, 0, 840, 75); css(tTop, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' });
  const tBot = h('div', 'abs', torn); px(tBot, 0, 75, 840, 75); css(tBot, { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', border: '3px dashed var(--warn)' });
  const tl1 = h('div', 'abs', torn, '只写了一半：页坏了'); px(tl1, 20, 96); css(tl1, { font: '700 24px "Sans SC"', color: 'var(--warn)' });
  wipe(torn, T('w11', '一半'), { dir: 'l' }); sfx('error', T('w11', '一半') + 0.2, { g: 0.5 });
  set(tBot, T('w12', '恢复'), { background: 'var(--sky-lt)', border: '3px solid var(--pg)' });
  keyed(tl1).at(T('w12', '恢复'), { html: '用日志里的整页写回：恢复' }); set(tl1, T('w12', '恢复'), { color: 'var(--navy)' }); sfx('chime', T('w12', '恢复'), { g: 0.6 });

  // ── B：强行停机，再启动 ──
  hdoc(B, '试一次：强行停机', 72, 128);
  const q = psqlBox(B, '', 72, 196, 900); css(q, { fontSize: '23px', height: '210px' });
  const kq = keyed(q);
  const l1 = `<span class="p">carol=*&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 99 <span class="k">WHERE</span> id = 2049;  <span class="d">-- 不提交</span>`;
  const l2 = `<span class="p">alice=&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;  <span class="d">-- 提交</span>`;
  const l3 = `<span class="er">$ pg_ctl stop -m immediate</span>  <span class="d">-- 强行停掉</span>`;
  appear(q, T('w13') - 0.1);
  const l1a = l1.replace(/  <span class="d">.*$/, '');
  kq.at(T('w13'), { html: l1a }); kq.at(T('w13', '不提交'), { html: l1 }); kq.at(T('w14'), { html: l1 + '\n' + l2 }); kq.at(T('w15', '停掉'), { html: l1 + '\n' + l2 + '\n\n' + l3 });
  const stL = capt(B, '停机前', 1000, 200);
  const sb = h('div', 'tup', B, 'Bob → 99　没提交'); px(sb, 1000, 250, 520); css(sb, { borderStyle: 'dashed', borderColor: 'var(--warn)' });
  const sa = h('div', 'tup new', B, 'Alice → 43　已提交'); px(sa, 1000, 320, 520);
  const off = tagEl(B, '强行停机', 1000, 380, 'warn'); css(off, { fontSize: '34px' }); slam(off, T('w15', '停掉'), { from: 1.2 });
  show(stL, T('w13', '99') - 0.1); show(sb, T('w13', '99'), { x: 20 }); show(sa, T('w14', '提交'), { x: 20 }); sfx('pop', T('w14', '提交'), { g: 0.4 });
  sfx('blip', T('w13'), { g: 0.5 }); sfx('blip', T('w14'), { g: 0.5 }); sfx('error', T('w15', '停掉'), { g: 0.7 });
  // 重启日志：逐行出现，旁边给中文释义
  const notes = ['上次运行被中断了', '没有正常关闭：自动恢复', '从这里开始重放日志', '重放完毕', '可以接受连接了'];
  const logBox = h('div', 'abs', B); px(logBox, 72, 440, 1776, 300); logBox.dataset.name = '重启日志';
  const times = [T('w16'), T('w16', '没有正常关闭'), T('w17', '检查点'), T('w17', '重放'), Tend('w17')];
  W.recovery.forEach((ln, i) => {
    const txt = ln.replace(/^LOG:\s+/, '').replace(/ system usage:.*$/, '').replace(/; last known up at .*$/, '');
    const r = h('div', 'abs', logBox, `<span class="mono" style="font:500 22px 'Mono';color:var(--ink)">${esc(txt)}</span>`); px(r, 0, i * 56, 1100);
    const n = h('div', 'abs cap', logBox, notes[i]); px(n, 1140, i * 56); css(n, { color: 'var(--pg)', fontWeight: 700 });
    appear(r, times[i]); show(n, times[i] + 0.1, { x: -10 }); sfx('blip', times[i], { g: 0.35 });
  });
  // 结果
  const A2 = W.after;
  const res = tableDoc(B, ['', '年龄', ''], [['Alice', String(A2.alice.age), '提交过的：在'], ['Bob', String(A2.bob.age), 'Carol 没提交的 99：不见了']], 72, 760, { mono: [1] });
  css(res, { fontSize: '24px' });
  show(res, T('w18'), { y: 10 }); sfx('chime', T('w18', '都在'), { g: 0.6 }); classAt(res.querySelectorAll('tr')[2], 'hl', T('w19', '不见了'));
  const cv = h('div', 'tup dead', B, `Carol 写的版本还在页里：99　状态「已中止」`); px(cv, 1000, 760, 840);
  show(cv, T('w20', '页里'), { x: 20 }); sfx('pop', T('w20', '页里'), { g: 0.5 });
  const nv = tagEl(B, '谁都看不见', 1000, 820, 'warn'); show(nv, T('w21b'), { y: 8 });
  const inn = noteBox(B, '<b>InnoDB</b>　重启后要用 undo 把没提交的修改撤回去', 1000, 880, 840, 'grey'); show(inn, T('w22'), { y: 10 });
  hide(nv, T('w22') - 0.1, { d: 0.25 });
  const pgT = tagEl(B, 'PostgreSQL：不用撤', 1000, 820); show(pgT, T('w23'), { y: 8 }); sfx('thud', T('w23'), { g: 0.6 });
});
