// 09 出错怎么办：WAL 先落盘、数据页晚写（W1–W3）；检查点与整页写（W4、W5、W10）→ 强行停机后重放；没提交的版本本来就看不见（W7–W9）
scene('crash', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('w12b') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);
  const W = D.wal;

  // ── A：先写日志 ──
  hdoc(A, '先写日志，再写数据页', 72, 128);
  const walG = glossBox(A, 'WAL', '<b>WAL</b>（预写日志）：每次修改先写一条日志；<br>数据页写回磁盘之前，描述它的日志必须已经落盘', 1040, 190, 800);
  show(walG, T('w2', 'WAL') + 0.1, { x: 20 }); sfx('pop', T('w2', 'WAL') + 0.1, { g: 0.5 });
  // 问题：提交了，断电，还在吗
  // 问题先在画面中央大字提出，日志带出来时再缩到左上角让位
  const qw = h('div', 'abs', A); px(qw, 0, 0, 1920, 1080); css(qw, { transformOrigin: '72px 206px', pointerEvents: 'none' });
  const qa = tagEl(qw, '已提交的修改', 72, 206, 'navy'), qb = tagEl(qw, '断电', 340, 206, 'warn');
  const qc = tagEl(qw, '还在吗？', 470, 206, 'navy'); css(qc, { fontSize: '34px' });
  set(qw, 0, { x: 470, y: 300, scale: 1.45 }); tl.fromTo(qw, { x: 470, y: 300, scale: 1.45 }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('w2') - 0.5);
  css(qa, { fontSize: '34px' }); css(qb, { fontSize: '34px' });
  show(qa, T('w1', '提交'), { x: -10 }); slam(qb, T('w1', '断电'), { from: 1.25 }); sfx('error', T('w1', '断电'), { g: 0.4 }); show(qc, T('w1', '还在吗'), { y: 8 });
  [qa, qb, qc].forEach((e) => hide(e, T('w8') - 0.2, { d: 0.25 }));
  // 日志带：一格一条记录；蓝底实线 = 已落盘，白底虚线 = 还在内存里
  const tapeL = capt(A, '<b>WAL</b>　一条条日志记录', 72, 330);
  const tape = h('div', 'abs', A); px(tape, 72, 370, 1776, 80); tape.dataset.name = '日志带';
  const recs = ['…', '…', 'Carol 的修改', 'Carol 的修改', 'Alice：LOCK', 'Alice：UPDATE', 'Alice：索引 ×3', 'Alice：COMMIT'];
  const recEls = recs.map((r, i) => { const e = h('div', 'abs', tape, r); px(e, i * 222, 0, 212, 72); css(e, { border: '3px solid var(--pg)', background: i < 2 ? 'var(--pg)' : '#fff', font: '600 22px "Sans SC"', textAlign: 'center', lineHeight: '66px', color: i < 2 ? '#fff' : 'var(--navy)' }); if (i >= 2) css(e, { borderStyle: 'dashed' }); return e; });
  // 一条日志里记着什么：改了哪一页、改成什么（w2b）
  const rec1 = tagEl(A, '一条日志：改了哪一页 · 改成什么', 72 + 2 * 222, 460, 'navy'); css(rec1, { fontSize: '24px' }); show(rec1, T('w2b', '一条日志') - 0.1, { y: -8 }); hide(rec1, T('w4') - 0.2, { d: 0.25 });
  const recAr = link(overlay(A), [[72 + 2 * 222 + 100, 458], [72 + 2 * 222 + 100, 446]], 'navy'); arrowIn(recAr, T('w2b', '一条日志'), 0.2); gone(recAr, T('w4') - 0.2, 0.25);
  show(tapeL, T('w2', '日志') - 0.1); recEls.slice(0, 4).forEach((e, i) => show(e, (i < 2 ? T('w2', '日志') : T('w3') - 0.2) + i * 0.06, { x: -10, d: 0.2 }));
  recEls.slice(4).forEach((e, i) => show(e, T('w4') + i * 0.15, { x: -10, d: 0.2 }));
  sfx('tick', T('w4'), { g: 0.5 });
  const flush = h('div', 'abs', A); px(flush, 72 + 2 * 222 - 3, 350, 6, 120); css(flush, { background: 'var(--warn)' }); flush.dataset.name = '已落盘到这里';
  const flushL = h('div', 'abs', A, '已落盘到这里'); px(flushL, 72 + 2 * 222 - 110, 470); css(flushL, { font: '700 24px "Sans SC"', color: 'var(--warn)', whiteSpace: 'nowrap' });   // 不写日志位置的十六进制：没讲过，观众看不懂
  show(flush, T('w4') - 0.1); show(flushL, T('w4') - 0.1);
  const mem = tagEl(A, '这几条还在内存里', 72 + 4 * 222, 300, 'warn'); show(mem, T('w4', '内存'), { y: 8 });
  const tC = T('w5', '磁盘');
  to(flush, tC, { x: 6 * 222 - 3, duration: 0.6, ease: 'power3.inOut' }); sfx('thud', tC + 0.5, { g: 0.6 });
  to(flushL, tC, { x: 6 * 222 - 150, duration: 0.6, ease: 'power3.inOut' });
  recEls.slice(2).forEach((e) => set(e, tC + 0.5, { borderStyle: 'solid', background: 'var(--pg)', color: '#fff' }));
  hide(mem, tC, { d: 0.25 });
  // 数据页：内存里的已经改了，磁盘上的还是旧的
  const bufP = h('div', 'page', A); px(bufP, 72, 560, 840, 120); bufP.dataset.name = '内存里的第 23 页';
  const bufL = capt(A, '内存里的第 23 页', 72, 520);
  const bufR = h('div', 'tup new', bufP, 'Alice 旧版本　xmax 记上本次事务　→ 指向新版本'); px(bufR, 16, 36, 800);   // 不写这次实验的事务号与新地址：与第六、七章的实测不同，会让人疑惑
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
  // 检查点之前的那几条：它们的修改已经在数据文件里
  const cpb = h('div', 'abs', A); px(cpb, 72, 456, 2 * 222 - 10, 6); css(cpb, { background: 'var(--navy)' });
  const cpbl = capt(A, '这之前的修改：已在数据文件里', 72, 466); css(cpbl, { fontSize: '22px', color: 'var(--navy)', fontWeight: 700 });
  fromTo(cpb, T('w9', '写进') - 0.3, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4 }); show(cpbl, T('w9', '写进') - 0.2, { y: 6 }); sfx('tick', T('w9', '写进'));
  [cpb, cpbl].forEach((e) => hide(e, T('w10') - 0.2, { d: 0.25 }));
  hide(late, T('w10') - 0.2, { d: 0.25 }); hide(cpG, T('w10') - 0.2, { d: 0.25 });
  // 整页写：检查点后第一次改第 23 页，Carol 那条日志记录里带上这一页的原样——就是第三章那张页：页头、指针、行；
  // 中间那 72 字节的空隙不写（实测整页镜像 8120 = 8192 − 72，N3）。原先只是一条写着字节数的蓝条（WaterRun 看 r7：「日志里的整页体现和InnoDB双写缓冲区, 包括其他的关联概念」）
  const fpi1 = W.carolFpi[0][1], G3 = D.page23, kk = 840 / 8192, IY = 806;
  const tF = T('w10', '整页');
  set(recEls[2], tF, { borderColor: '#e0a11b', borderWidth: '5px', lineHeight: '62px' }); keyed(recEls[2]).at(tF, { html: 'Carol 的修改 + 整页' });
  const imgL = capt(A, `这条记录带着第 23 页的原样（${fpi1} 字节）`, 72, IY - 40); css(imgL, { fontSize: '24px', color: 'var(--navy)', fontWeight: 700 });
  const img = h('div', 'abs', A); px(img, 72, IY, 840, 64); css(img, { border: '4px solid #e0a11b', background: '#fff' }); img.dataset.name = '日志里的整页';
  const sg = (a, b, bg) => { const e = h('div', 'abs', img); px(e, a * kk, 0, Math.max(2, (b - a) * kk), 56); css(e, { background: bg }); return e; };
  sg(0, 24, 'var(--navy)'); sg(24, G3.lower, 'var(--sky)'); sg(G3.upper, 8192, 'repeating-linear-gradient(90deg,var(--sky-lt) 0 6px,#fff 6px 7px)');
  const hole = h('div', 'abs', A, `中间的空隙 ${G3.upper - G3.lower} 字节：不写`); px(hole, 72 + G3.lower * kk - 10, IY + 72); css(hole, { font: '700 22px "Sans SC"', color: '#7d5500', whiteSpace: 'nowrap' });
  const holeT = h('div', 'abs', A); px(holeT, 72 + G3.lower * kk + 2, IY + 58, 3, 16); css(holeT, { background: '#7d5500' });
  const small = capt(A, '再改同一页：不再带整页', 560, IY + 72); css(small, { fontSize: '22px' });
  show(imgL, tF - 0.1, { y: 8 }); wipe(img, tF, { dir: 'l', d: 0.5 }); sfx('thud', tF, { g: 0.5 });
  show(hole, tF + 0.8, { y: -6 }); show(holeT, tF + 0.8, { y: 0 }); show(small, Math.max(tF + 1.6, Tend('w10') - 0.3), { x: -10 });
  // 写到一半的页：用日志里的整页恢复（整页从日志那张图飞过去，盖住写坏的下半页）
  const torn = h('div', 'abs', A); px(torn, 1000, 760, 840, 150); torn.dataset.name = '写了一半的页';
  const tTop = h('div', 'abs', torn); px(tTop, 0, 0, 840, 75); css(tTop, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' });
  const tBot = h('div', 'abs', torn); px(tBot, 0, 75, 840, 75); css(tBot, { background: 'repeating-linear-gradient(135deg,var(--warn-lt) 0 10px,#fff 10px 20px)', border: '3px dashed var(--warn)' });
  const tl1 = h('div', 'abs', torn, '磁盘上的第 23 页只写了一半：坏了'); px(tl1, 20, 96); css(tl1, { font: '700 24px "Sans SC"', color: 'var(--warn)' });
  wipe(torn, T('w11', '一半'), { dir: 'l' }); sfx('error', T('w11', '一半') + 0.2, { g: 0.5 });
  const ghost = h('div', 'abs', A); px(ghost, 72, IY, 840, 64); css(ghost, { border: '4px solid #e0a11b', background: 'repeating-linear-gradient(90deg,var(--sky-lt) 0 6px,#fff 6px 7px)' });
  const tRe = T('w12', '整页');
  set(ghost, 0, { autoAlpha: 0 }); tl.fromTo(ghost, { autoAlpha: 1, x: 0, y: 0 }, { x: 928, y: 26, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tRe); gone(ghost, tRe + 0.7, 0.25);
  set(tBot, tRe + 0.6, { background: 'var(--sky-lt)', border: '3px solid var(--pg)' });
  keyed(tl1).at(tRe + 0.6, { html: '用日志里的整页写回：恢复' }); set(tl1, tRe + 0.6, { color: 'var(--navy)' }); sfx('chime', tRe + 0.6, { g: 0.6 });
  // InnoDB 防同一件事：双写缓冲区——页先写进双写缓冲区，再写到数据文件里的原位（W9）。占下面左边这块：整页那张图收起
  const tI = T('w12b');
  [imgL, img, hole, holeT, small].forEach((e) => gone(e, tI - 0.3, 0.3));
  const dwb = h('div', 'abs', A); px(dwb, 72, 740, 880, 180); dwb.dataset.name = 'InnoDB 的双写缓冲区';
  const innL = h('div', 'abs', dwb, '<b>InnoDB</b>：页先写进双写缓冲区，再写到数据文件里的原位'); px(innL, 0, 0); css(innL, { font: '600 24px "Sans SC"', color: 'var(--ink)', whiteSpace: 'nowrap' });
  const bx = (x, txt, bg) => { const e = h('div', 'abs', dwb, txt); px(e, x, 60, 230, 64); css(e, { background: bg, color: '#fff', font: '700 24px "Sans SC"', lineHeight: '64px', textAlign: 'center' }); return e; };
  const ib1 = bx(0, '内存里的页', '#5f6a73'), ib2 = bx(320, '① 双写缓冲区', '#4f5c67'), ib3 = bx(640, '② 原位', '#4f5c67');
  const ovI = overlay(A); const ia1 = link(ovI, [[72 + 236, 832], [72 + 314, 832]], 'grey'), ia2 = link(ovI, [[72 + 556, 832], [72 + 634, 832]], 'grey');
  const innN = h('div', 'abs', dwb, '原位写坏了，就拿双写缓冲区里那份恢复'); px(innN, 0, 138); css(innN, { font: '500 22px "Sans SC"', color: 'var(--ink2)', whiteSpace: 'nowrap' });
  [innL, ib1, ib2, ib3, innN].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  show(innL, tI - 0.1, { y: 8 }); show(ib1, tI + 0.1, { x: -10 }); arrowIn(ia1, T('w12b', '双写') - 0.2, 0.3); show(ib2, T('w12b', '双写'), { x: -10 });
  arrowIn(ia2, T('w12b', '双写') + 0.5, 0.3); show(ib3, T('w12b', '双写') + 0.7, { x: -10 }); show(innN, T('w12b', '双写') + 1.1, { y: 6 }); sfx('pop', T('w12b', '双写'), { g: 0.5 });
  const fA = focusRing(A);
  fA.at(T('w2', 'WAL'), walG).at(T('w3', '落盘'), tape).at(T('w4', '提交之前'), [72 + 4 * 222, 370, 4 * 222, 80]).at(T('w4', '内存'), mem).at(T('w6', '旧的'), dskP).at(T('w7', '晚些'), bufP).at(T('w8', '检查点') + 0.2, cpG).at(T('w9', '之前'), [72, 370, 444, 110])
    .at(T('w10', '第一次改'), recEls[2]).at(T('w11', '断电'), dskP).at(T('w11', '一半'), torn).off(tI - 0.2);

  // ── B：强行停机，再启动 ──
  hdoc(B, '试一次：强行停机', 72, 128);
  const tk = term(B, 72, 196, 900, 4, { fs: 23, lh: 36, name: 'psql 会话' });
  const l1 = `<span class="p">carol=*&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 99 <span class="k">WHERE</span> id = 2049;  <span class="d">-- 不提交</span>`;
  const l2 = `<span class="p">alice=&gt;</span> <span class="k">UPDATE</span> users <span class="k">SET</span> age = 43 <span class="k">WHERE</span> id = 2050;  <span class="d">-- 提交</span>`;
  const l3 = `<span class="er">$ pg_ctl stop -m immediate</span>  <span class="d">-- 强行停掉</span>`;
  const body = (s) => s.replace(/^<span class="p">[^<]*<\/span> /, '');
  tk.type(T('w13') - 0.2, body(l1), 'carol=*&gt;', 45);
  tk.type(T('w14') - 0.1, body(l2), 'alice=&gt;', 45);
  tk.print(T('w15', '停掉') - 0.1, l3);
  const stL = tagEl(B, '停机前，表里的这两行', 1000, 190, 'navy'); css(stL, { fontSize: '28px' });
  const sb = h('div', 'tup', B, 'Bob → 99　没提交'); px(sb, 1000, 250, 520); css(sb, { borderStyle: 'dashed', borderColor: 'var(--warn)' });
  const sa = h('div', 'tup new', B, 'Alice → 43　已提交'); px(sa, 1000, 320, 520);
  const off = tagEl(B, '强行停机', 1000, 380, 'warn'); css(off, { fontSize: '34px' }); slam(off, T('w15', '停掉'), { from: 1.2 });
  show(stL, T('w13') + 0.2, { y: 8 }); show(sb, T('w13', '99'), { x: 20 }); show(sa, T('w14', '提交'), { x: 20 }); sfx('pop', T('w14', '提交'), { g: 0.4 });
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
  // 重放：从检查点起，把日志一条条再做一遍
  const rp = h('div', 'abs', B); px(rp, 72, 724, 1100, 22); css(rp, { border: '2px solid var(--pg)' }); rp.dataset.name = '重放进度';
  const rpf = h('div', 'abs', rp); px(rpf, 0, 0, 0, 18); css(rpf, { background: 'var(--pg)' });
  show(rp, T('w17', '检查点'), { y: 0 }); fromTo(rpf, T('w17', '检查点'), { width: 0 }, { width: 1096, duration: Tend('w17') - T('w17', '检查点'), ease: 'none' });
  const rpl = capt(B, '从检查点起重放日志', 1190, 716); css(rpl, { fontSize: '24px', color: 'var(--pg)', fontWeight: 700 }); show(rpl, T('w17', '检查点'), { x: -10 });
  [rp, rpl].forEach((e) => hide(e, T('w18') - 0.1, { d: 0.25 }));
  // 结果
  const A2 = W.after;
  const res = tableDoc(B, ['', '年龄', ''], [['Alice', String(A2.alice.age), '提交过的：在'], ['Bob', String(A2.bob.age), 'Carol 没提交的 99：不见了']], 72, 760, { mono: [1] });
  css(res, { fontSize: '24px' });
  show(res, T('w18'), { y: 10 }); sfx('chime', T('w18', '都在'), { g: 0.6 }); classAt(res.querySelectorAll('tr')[2], 'hl', T('w19', '不见了'));
  const cv = h('div', 'tup dead', B, 'Carol 写的版本还在页里：99'); px(cv, 1000, 760, 840); keyed(cv).at(T('w21', '没有提交'), { html: 'Carol 写的版本还在页里：99　事务没提交' }).at(T('w21', '已中止'), { html: 'Carol 写的版本还在页里：99　状态「已中止」' });
  show(cv, T('w20', '页里'), { x: 20 }); sfx('pop', T('w20', '页里'), { g: 0.5 });
  const nv = tagEl(B, '谁都看不见', 1000, 820, 'warn'); show(nv, T('w21b'), { y: 8 });
  const inn = noteBox(B, '<b>InnoDB</b>　重启后要用 undo 把没提交的修改撤回去', 1000, 880, 840, 'grey'); show(inn, T('w22'), { y: 10 });
  hide(nv, T('w22') - 0.1, { d: 0.25 });
  const pgT = tagEl(B, 'PostgreSQL：不用撤', 1000, 820); show(pgT, T('w23'), { y: 8 }); sfx('thud', T('w23'), { g: 0.6 });
  const fB = focusRing(B);
  fB.at(T('w16', '没有正常关闭'), logBox).at(T('w17', '重放'), rp).at(T('w18', '43'), res.querySelectorAll('tr')[1]).at(T('w19', '51'), res.querySelectorAll('tr')[2]).at(T('w19', '99'), sb).at(T('w19', '不见了'), res.querySelectorAll('tr')[2]).at(T('w20', '页里'), cv).at(T('w21b'), nv).at(T('w22'), inn).at(T('w23', '不用撤'), pgT).at(T('w23b', '没提交'), cv).at(T('w23b', '看不见'), [1000, 760, 840, 100]).off(Tend('w23b') + 0.6);
});
