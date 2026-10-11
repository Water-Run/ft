// 第 10 章：回到三条局限。站 A：一次修改从开始到提交（示意；D05、D03、I12、I13、I42、D12）；站 B：三条局限与 InnoDB 的回答；站 C：代价与下一集（I04、D03、D13）。
scene('s10', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 7000, 1400);
  const XB = 2200, XC = 4400;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;

  // ── 站 A：一次修改的全过程 ──
  const hA = txt(world, 't-3', '一次修改：从开始到提交', 100, 140); fin(hA, at('w1') - 0.35);
  const sk = tag(world, 760, 152, '示意'); pop(sk, at('w1', '提交'));
  const steps = [
    ['w2', '加锁', '先给要改的行加锁', 'lock'],
    ['w3', 'undo', '旧值写进 undo，回滚指针指向它', 'undo'],
    ['w4', '脏页', '在缓冲池里改这一页，成了脏页', 'dirty'],
    ['w5', 'redo', '把这次修改记进 redo', 'redo'],
    ['w6', '提交', '提交：redo 写到磁盘，锁随之释放', 'commit'],
    ['w7', '稍后', '脏页稍后再写回数据文件', 'later'],
  ];
  steps.forEach(([id, w, t_, k], i) => {
    const x = 96 + (i % 3) * 584, y = 250 + Math.floor(i / 3) * 330;
    const P_ = panel(world, x, y, 544, 290, null, { cls: k === 'commit' ? 'hot' : '', name: 'step-' + k });
    const no = txt(world, '', String(i + 1), x + 30, y + 30); css(no, { width: '60px', height: '60px', borderRadius: '15px', background: C.blue, color: '#fff', font: '800 36px/60px "Open Sans"', textAlign: 'center' });
    const tx = txt(world, 't-4 wrap', t_, x + 30, y + 120); css(tx, { width: '480px' });
    const tt = at(id, w) - 0.2;
    const ph = panel(world, x, y, 544, 290, null, { cls: 'sketch', name: 'step-slot' }); fin(ph.el, at('w1', '连起来') + i * 0.12, { y: 0, d: 0.3 }); out(ph.el, tt - 0.1, 0.2);
    showPanel(P_, tt - 0.1); pop(no, tt); fin(tx, tt + 0.1); sfx('tick', tt, { g: 0.45, p: -0.5 + (i % 3) * 0.5 });
    if (k === 'lock') { const l = lockBadge(world, x + 470, y + 40); pop(l, tt + 0.2); }
    if (k === 'dirty') { const d = gapBox(world, x + 400, y + 40, 110, 40); fin(d, tt + 0.2); }
    if (k === 'redo') { const f = fileIcon(world, x + 430, y + 24, 76, 92, { tag: 'LOG', inpanel: true }); pop(f.e, tt + 0.2); }
    if (i < 5 && i !== 2) { const a = gline(g, `M${x + 548} ${y + 145} L${x + 580} ${y + 145}`, 'ink', { w: 4, arrow: true }); arrowIn(a, tt + 0.4, 0.2); }
  });
  const wrap = gline(g, 'M1800 395 C 1860 470, 1860 520, 1700 560 L 300 560 C 160 560, 130 575, 150 580', 'ink', { w: 4, arrow: true, dashed: '10 8' });
  arrowIn(wrap, at('w5') - 0.4, 0.4);

  // ── 站 B：三条局限的回答 ──
  const hB = txt(world, 't-3', '再看 MyISAM 的三条局限', XB + 100, 140); fin(hB, at('k1', '三条局限') - 0.2);
  [['k2', '没有事务', 'undo 实现回滚，读视图实现隔离', ['undo', '读视图']],
   ['k3', '一把表锁', '只锁访问到的行，普通的读不加锁', ['只锁', '不加锁']],
   ['k4', '没有日志', 'redo 补上没写完的修改，undo 撤销没提交的', ['redo', null]]].forEach(([id, a, b, ws], i) => {
    const x = XB + 96 + i * 584;
    const C_ = panel(world, x, 240, 544, 620, null, { name: 'limit-answer' });
    const no = txt(world, '', String(i + 1), x + 36, 274); css(no, { width: '96px', height: '96px', borderRadius: '22px', background: C.blue, color: '#fff', font: '800 58px/96px "Open Sans"', textAlign: 'center' });
    const ta = txt(world, 't-3 dim', a, x + 36, 400);
    const ln = blk(world, 'bg-t1', x + 36, 480, 470, 4);
    const ans = txt(world, 't-s blue', 'InnoDB', x + 36, 520); const tb = txt(world, 't-4 wrap', b, x + 36, 570); css(tb, { width: '470px' });
    const t0 = at('k1') - 0.3 + i * 0.15;
    showPanel(C_, t0); pop(no, t0 + 0.1); fin(ta, t0 + 0.2); fromTo(ln, t0 + 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4 });
    const tt = at(id, ws[0]) - 0.3; fin(ans, tt); fin(tb, tt + 0.1); sfx('pop', tt, { g: 0.5, p: -0.4 + i * 0.4 });
  });
  const ol = tag(world, XB + 100, 890, '所以它适合 OLTP 这样的负载', 'blue'); css(ol, { top: '880px' }); pop(ol, at('k5', 'OLTP'));

  // ── 站 C：代价 ──
  const hC = txt(world, 't-3', '代价也在', XC + 100, 140); fin(hC, at('k6', '代价') - 0.2);
  const costs = [['k6', '13', '每一行多出 13 字节的隐藏字段'], ['k7', '旧版本', '旧版本要一直留着，直到没有事务再需要它'], ['k8', '等待', '锁会带来等待；死锁和超时由应用重新执行']];
  costs.forEach(([id, w, t_], i) => {
    const y = 240 + i * 200;
    const P_ = panel(world, XC + 96, y, 1100, 170, null, { cls: 'warn', name: 'cost' });
    const tx = txt(world, 't-4 wrap', t_, XC + 140, y + 54); css(tx, { width: '1000px' });
    const tt = at(id, w) - 0.3; showPanel(P_, tt); fin(tx, tt + 0.15); sfx('tick', tt, { g: 0.4 });
  });
  const segB = [5, 4, 6, 7, 10, 1].map((n, i) => tile(world, XC + 1240 + [0, 5, 9, 15, 22, 32][i] * 17, 270, n * 17 - 4, 60, i === 2 || i === 3 ? 'or' : 't1'));
  segB.forEach((e, i) => pop(e, at('k6', '13') + i * 0.05));
  const vS = [0, 1, 2].map((k) => { const e = row(world, XC + 1240 + k * 20, 450 + k * 30, 420, '', k ? 'old' : 'on'); css(e, { height: '50px' }); return e; });
  vS.forEach((e, k) => fin(e, at('k7', '旧版本') + k * 0.12));
  const wb = gapBox(world, XC + 1240, 680, 10, 50); const tWb = at('k8', '等待');
  F((t) => { const k = clamp((t - tWb) / 2.5); wb.style.width = (10 + 480 * k).toFixed(0) + 'px'; wb.style.visibility = t >= tWb ? 'visible' : 'hidden'; });
  const nxt = txt(world, 't-3 blue', '下一集：换一个引擎，看同一组问题有怎样不同的实现', XC + 100, 846); fin(nxt, at('k9', '下一集'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('k1') - 0.6, { x: XB + 960 }, 1.1, { g: 0.4 }],
    [at('k6') - 0.6, { x: XC + 960 }, 1.1, { g: 0.4 }],
  ]);
});
