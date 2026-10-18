// 第 09 章：出错怎么办：日志与恢复。站 A：脏页、redo 日志、提交时写盘（I12、I13、I42、术语表 dirty page、redo）；
// 站 B：LSN 与检查点（术语表 LSN、checkpoint；D06）；站 C：一次崩溃与恢复（I14、I37，按恢复日志的顺序）；站 D：双写缓冲（D10，示意）。
scene('s09', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 9000, 1400);
  const XB = 2200, XC = 4400, XD = 6600;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;
  const hv = (v) => `<span style="background:${C.blue};color:#fff;border-radius:6px;padding:0 8px">${v}</span>`;
  const sess = (x, y, label, cls = 'ink') => { const e = txt(world, '', label, x, y); css(e, { padding: '8px 18px', borderRadius: '12px', font: '700 30px "Sans SC", "Open Sans"', background: cls === 'ink' ? C.ink : cls === 'blue' ? C.blue : '#bddcd7', color: cls === 'pale' ? C.ink : '#fff' }); return e; };

  // ── 站 A：脏页与 redo ──
  const q1 = txt(world, 't-n dim', '上一期的第四个问题', 104, 130), q2 = txt(world, 't-2', '出错怎么办', 100, 170);
  fin(q1, at('g1') - 0.35); pop(q2, at('g1') - 0.25, { from: 0.85, origin: '0 50%' }); sfx('thud', at('g1') - 0.25, { g: 0.5 });
  // 上一期的做法：崩溃之后只能检查和修复（讲到 InnoDB 时收走）
  const PMy = panel(world, 1040, 300, 784, 300, '上一期 · MyISAM', { name: 'myisam-repair' });
  const myF = fileIcon(world, 1100, 380, 120, 160, { inpanel: true }); const myB = gline(g, 'M1290 380 L1258 470 L1310 470 L1270 560', 'or', { w: 7 });
  const my = tag(world, 1360, 450, '只能事后检查和修复', 'or');
  showPanel(PMy, at('g1', '出错怎么办') + 0.3); pop(myF.e, at('g1b') + 0.2); drawIn(myB, at('g1b') + 0.4, 0.3); pop(my, at('g1b', '检查和修复')); sfx('error', at('g1b') + 0.4, { g: 0.3 });
  [PMy.el, PMy.tt, myF.e, myB, my].forEach((e) => out(e, at('g2') + 0.3));
  const PB = panel(world, 96, 300, 900, 300, '缓冲池（内存）', { name: 'buffer-pool' });
  const pg = row(world, 140, 400, 812, '第 4 页：1' + sp(2) + 'alice' + sp(2) + '30');
  showPanel(PB, at('g2') - 0.3); fin(pg, at('g2', '改') - 0.1);
  const tMod = at('g2', '页') + 0.4;
  // 正要改的那一页先压暗（同第 02 章的画法，类名交给 keyed 管），读到「页」之后写进 31
  keyed(pg).at(at('g2', '缓冲'), { cls: 'row dk' }).at(tMod, { html: '第 4 页：1' + sp(2) + 'alice' + sp(2) + hv('31'), cls: 'row' }); sfx('pop', tMod, { g: 0.5 });
  const dirty = gapBox(world, 140, 480, 812, 40); const dT = tag(world, 140, 540, '脏页：改过，还没写回磁盘', 'or');
  fromTo(dirty, at('g3', '还没写回') - 0.1, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0 50%', duration: 0.5 }); pop(dT, at('g3', '脏页'));
  const PF = panel(world, 96, 660, 900, 230, '磁盘 · users.ibd', { name: 'data-file' });
  const fr = row(world, 140, 760, 812, '第 4 页：1' + sp(2) + 'alice' + sp(2) + '30');
  showPanel(PF, at('g3b') - 0.3); fin(fr, at('g3b') - 0.1);
  const later = gline(g, 'M546 600 L546 650', 'dim', { w: 4, arrow: true, dashed: '8 6' }); arrowIn(later, at('g3b', '另有安排') - 0.2, 0.3);
  const lt = txt(world, 't-s dim', '什么时候写回：另有安排', 580, 610); fin(lt, at('g3b', '另有安排'));
  const bolt = gline(g, 'M1050 110 L1010 220 L1080 220 L1030 330', 'or', { w: 9 }); bolt.style.zIndex = 9;
  const qq = tag(world, 1130, 140, '提交之后马上崩溃，修改会丢吗？', 'or');
  drawIn(bolt, at('g4', '崩溃') - 0.1, 0.35); pop(qq, at('g4', '丢了') - 0.2); sfx('error', at('g4', '崩溃'), { g: 0.4 });
  out(qq, at('g5') - 0.1); out(bolt, at('g5') - 0.1);
  const PL = panel(world, 1040, 300, 784, 590, 'redo 日志', { cls: 'hot', name: 'redo-log' });
  const lr = row(world, 1084, 400, 696, '第 4 页 · alice 的年龄 → 31', ''); css(lr, { fontFamily: '"Sans SC", "Mono"' });
  const sqlx = row(world, 1084, 500, 696, 'UPDATE users SET age=31 …', 'old'); const sqlT = txt(world, 't-s dim', '不是 SQL 语句', 1084, 570);
  showPanel(PL, at('g5', 'redo') - 0.3); fin(lr, at('g5', 'redo') + 0.1, { y: -16 }); sfx('pop', at('g5', 'redo') + 0.1, { g: 0.5, p: 0.4 });
  const struck = gline(g, 'M1090 528 L1770 528', 'or', { w: 5 });
  fin(sqlx, at('g5b', '改成了什么')); drawIn(struck, at('g5b', '不是'), 0.3); fin(sqlT, at('g5b', '不是') + 0.2);
  const disk = fileIcon(world, 1084, 640, 130, 170, { tag: 'LOG', inpanel: true });
  const cmT = txt(world, 't-4', '提交：日志写到磁盘', 1240, 660), cmS = txt(world, 't-s dim', '默认设置：每次提交都写', 1240, 720);
  const flush = gline(g, 'M1430 450 C 1500 560, 1300 600, 1170 636', 'blue', { w: 5, arrow: true });
  arrowIn(flush, at('g6', '磁盘') - 0.3, 0.5); pop(disk.e, at('g6', '磁盘')); fin(cmT, at('g6', '磁盘') + 0.1); fin(cmS, at('g6', '默认设置')); sfx('chime', at('g6', '磁盘'), { g: 0.35 });
  const fixT = tag(world, 1240, 800, '崩溃了：按日志补上', 'blue'); pop(fixT, at('g7', '补上'));

  // ── 站 B：LSN 与检查点 ──
  const hB = txt(world, 't-3', '日志一直往后写', XB + 100, 140); fin(hB, at('g8') - 0.2);
  const PT = panel(world, XB + 96, 230, 1728, 660, null, { name: 'lsn' });
  showPanel(PT, at('g8') - 0.1);
  const recs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => tile(world, XB + 160 + i * 160, 420, 140, 90, i < 4 ? 't1' : 't2'));
  recs.forEach((e, i) => pop(e, at('g8') + 0.1 + i * 0.12));
  const lsn = ['…', '29 904 896', '29 904 914', '29 905 133', '…', '…', '…', '29 908 032'];
  const nums = [0, 2, 4, 9].map((i, k) => { const e = txt(world, 'mono t-s', ['29 904 896', '29 905 133', '29 906 …', '29 908 032'][k], XB + 160 + i * 160, 530); fin(e, at('g8', 'LSN') + k * 0.1); return e; });
  const lt2 = txt(world, 't-4 blue', 'LSN：只增不减的编号', XB + 160, 300); fin(lt2, at('g8', '只增不减') - 0.2); sfx('tick', at('g8', '只增不减'), { g: 0.4 });
  const ckx = XB + 160 + 2 * 160 + 140 + 10;
  const ck = blk(world, 'bg-or', ckx, 380, 8, 170); ck.style.borderRadius = '4px';
  const ckT = tag(world, ckx - 60, 600, '检查点', 'or');
  fromTo(ck, at('g9', '检查点'), { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.4, ease: 'back.out(2)' }); pop(ckT, at('g9', '检查点') + 0.1); sfx('pop', at('g9', '检查点'), { g: 0.55 });
  const doneS = gapBox(world, XB + 150, 400, ckx - XB - 160, 130); doneS.style.background = 'var(--t0)';
  const doneT = txt(world, 't-n wrap', '检查点之前的修改：已经写进数据文件', XB + 160, 680); css(doneT, { width: '560px' });
  fin(doneS, at('g9b', '数据文件') - 0.2); fin(doneT, at('g9b', '数据文件'));
  const fromHere = gline(g, `M${ckx + 4} 720 L${ckx + 300} 720`, 'blue', { w: 6, arrow: true });
  const fhT = txt(world, 't-4 blue', '恢复从这里开始', ckx + 40, 750);
  arrowIn(fromHere, at('g10', '最近的检查点') - 0.2, 0.5); fin(fhT, at('g10', '最近的检查点')); sfx('tick', at('g10', '最近的检查点'), { g: 0.4 });
  const srcL = txt(world, 't-s dim', '编号取自一次真实恢复的日志', XB + 1380, 840); fin(srcL, at('g8', '只增不减') + 0.5);

  // ── 站 C：一次崩溃 ──
  const PC = panel(world, XC + 96, 140, 1100, 740, '一次崩溃', { name: 'crash' });
  const cA = sess(XC + 140, 230, '会话 A', 'blue'), cB = sess(XC + 140, 330, '会话 B');
  const qa = sql(world, XC + 330, 226, 820, "INSERT INTO users VALUES(90,…); 提交"), qb = sql(world, XC + 330, 326, 820, "INSERT INTO users VALUES(91,…); 未提交");
  showPanel(PC, at('h1') - 0.3); pop(cA, at('h1', '会话 A')); fin(qa, at('h1', '90') - 0.2, { y: 0, d: 0.2 }); typeSql(qa, at('h1', '90') - 0.1, 50);
  pop(cB, at('h2') - 0.1); fin(qb, at('h2', '91') - 0.2, { y: 0, d: 0.2 }); typeSql(qb, at('h2', '91') - 0.1, 50);
  const PP = panel(world, XC + 140, 430, 500, 300, '缓冲池里的页', { name: 'data-page' }), PLg = panel(world, XC + 660, 430, 490, 300, 'redo 日志', { name: 'crash-log' });
  const r90 = row(world, XC + 170, 520, 440, '90 · committed'), r91 = row(world, XC + 170, 600, 440, '91 · pending');
  const lg = [row(world, XC + 690, 520, 430, '插入 90'), row(world, XC + 690, 580, 430, '提交 90', 'on'), row(world, XC + 690, 640, 430, '插入 91')];
  lg.forEach((e) => css(e, { height: '50px', lineHeight: '50px', fontFamily: '"Sans SC", "Mono"' }));
  showPanel(PP, at('h2') + 0.6); showPanel(PLg, at('h1', '提交') - 0.2); fin(r90, at('h2') + 0.8); fin(r91, at('h2', '91') + 0.8);
  fin(lg[0], at('h1', '90') + 0.6); fin(lg[1], at('h1', '提交') + 0.2); fin(lg[2], at('h2', '91') + 0.6);
  // 强行结束：进程停止；画面上的数据页清空（还在内存里的修改没了），日志还在
  const kill = tag(world, XC + 140, 780, '强行结束 MySQL 的进程', 'or'); const tK = at('h3', '强行结束');
  pop(kill, tK); sfx('thud', tK + 0.3, { g: 0.8 });
  const flat = blk(world, 'bg-ink', XC + 96, 860, 0, 6); fromTo(flat, at('hT'), { width: 0 }, { width: 1100, duration: 1.4, ease: 'none' }); sfx('beep', at('hT') + 0.1, { g: 0.3 });
  out(PP.el, at('hT') + 0.1, 0.25); out(PP.tt, at('hT') + 0.1, 0.25); out(r90, at('hT') + 0.1, 0.25); out(r91, at('hT') + 0.1, 0.25); out(kill, at('h4') - 0.2); out(flat, at('h4') - 0.2);
  const PR = panel(world, XC + 1240, 140, 584, 740, '重新启动', { cls: 'hot', name: 'recovery' });
  const st = [['h4', '落后', '数据文件落后于日志'], ['h4b', '崩溃恢复', '开始崩溃恢复'], ['h5', '补上', '① 从检查点起，按 redo 补上修改'], ['h6', '撤销', '② 按 undo 撤销没提交的事务']].map(([id, w, t_], i) => {
    const e = txt(world, 't-4 wrap', t_, XC + 1280, 230 + i * 130); css(e, { width: '510px' }); fin(e, at(id, w) - 0.1); sfx('tick', at(id, w), { g: 0.4 }); return e;
  });
  showPanel(PR, at('h4', '重新启动') - 0.2);
  const PP2 = panel(world, XC + 140, 430, 500, 300, '恢复后的数据页', { name: 'data-page-2' });
  const r90b = row(world, XC + 170, 520, 440, '90 · committed'), r91b = row(world, XC + 170, 600, 440, '91 · pending');
  showPanel(PP2, at('h5') - 0.3);
  const rr = gline(g, `M${XC + 680} 600 L${XC + 620} 560`, 'blue', { w: 5, arrow: true }); arrowIn(rr, at('h5', '补上') - 0.2, 0.3);
  fin(r90b, at('h5', '补上')); fin(r91b, at('h5', '补上') + 0.15); beat(lg[0], at('h5', '补上') - 0.1); beat(lg[2], at('h5', '补上') + 0.05);
  const undo91 = gline(g, `M${XC + 180} 628 L${XC + 600} 628`, 'or', { w: 5 }); drawIn(undo91, at('h6', '撤销'), 0.3); out(r91b, at('h6', '撤销') + 0.4, 0.3); out(undo91, at('h6', '撤销') + 0.4, 0.3);
  const res = txt(world, '', '90 还在 · 91 不见了', XC + 140, 780); css(res, { font: '800 48px/1 "Sans SC"', color: C.blue }); pop(res, at('h7', '91'), { from: 0.85, origin: '0 50%' }); sfx('chime', at('h7', '91'), { g: 0.4 });
  const ad = [tag(world, XC + 1280, 760, '已提交：保留 · 持久性', 'blue'), tag(world, XC + 1280, 820, '没提交：撤销 · 原子性')];
  pop(ad[0], at('h8', '保留')); pop(ad[1], at('h8', '撤销'));

  // ── 站 D：双写缓冲 ──
  const hD = txt(world, 't-3', '一页写到一半，进程就退出了', XD + 100, 140); fin(hD, at('j1') - 0.2);
  const sk = tag(world, XD + 1700, 150, '示意');
  const mk = (x, title, name) => panel(world, x, 260, 480, 420, title, { name });
  const P1 = mk(XD + 96, '缓冲池里的页', 'pool-page'), P2 = mk(XD + 720, '双写缓冲区', 'doublewrite'), P3 = mk(XD + 1344, '数据文件的原位置', 'home');
  const pgA = tile(world, XD + 196, 360, 280, 260, 't4'), pgC = tile(world, XD + 820, 360, 280, 260, 't4'), pgH1 = tile(world, XD + 1444, 360, 280, 130, 't4'), pgH2 = tile(world, XD + 1444, 490, 280, 130, 't1');
  showPanel(P3, at('j1') - 0.1); pop(sk, at('j1')); pop(pgH1, at('j1', '写到一半') - 0.2); pop(pgH2, at('j1', '写到一半') - 0.1);
  const torn = tag(world, XD + 1444, 640, '一半新、一半旧', 'or'); pop(torn, at('j1', '退出')); sfx('error', at('j1', '退出'), { g: 0.4 });
  showPanel(P1, at('j2') - 0.2); pop(pgA, at('j2'));
  showPanel(P2, at('j2b', '双写缓冲区') - 0.3); pop(pgC, at('j2b', '双写缓冲区'));
  const n1 = gline(g, `M${XD + 590} 470 L${XD + 710} 470`, 'blue', { w: 6, arrow: true }), n2 = gline(g, `M${XD + 1214} 470 L${XD + 1334} 470`, 'blue', { w: 6, arrow: true });
  const b1 = txt(world, '', '1', XD + 630, 400), b2 = txt(world, '', '2', XD + 1254, 400);
  [b1, b2].forEach((e) => css(e, { width: '52px', height: '52px', borderRadius: '13px', background: C.blue, color: '#fff', font: '800 32px/52px "Open Sans"', textAlign: 'center' }));
  arrowIn(n1, at('j2b', '双写缓冲区') - 0.1, 0.35); pop(b1, at('j2b', '双写缓冲区')); arrowIn(n2, at('j2b', '原位置') - 0.2, 0.35); pop(b2, at('j2b', '原位置'));
  sfx('tick', at('j2', '写两次'), { g: 0.45 });
  const back = gline(g, `M${XD + 960} 690 C ${XD + 1100} 800, ${XD + 1400} 800, ${XD + 1580} 690`, 'blue', { w: 5, arrow: true, dashed: '12 8' });
  arrowIn(back, at('j3b', '找回') - 0.2, 0.6); classAt(pgH2, 't4', at('j3b', '完好')); out(torn, at('j3b', '完好') - 0.1);
  const okT = tag(world, XD + 1100, 820, '恢复时：取回一份完好的页', 'blue'); pop(okT, at('j3b', '完好')); sfx('chime', at('j3b', '完好'), { g: 0.35 });
  const mid = tag(world, XD + 720, 740, '即使写到一半中断'); pop(mid, at('j3', '中断'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('g8') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('h1') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
    [at('j1') - 0.6, { x: XD + 960 }, 1.1, { g: 0.4 }],
  ]);
});
