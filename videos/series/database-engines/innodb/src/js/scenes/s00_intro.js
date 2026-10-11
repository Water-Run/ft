// 开场：上一期的 MyISAM——两个文件、叶子存行位置的 B 树；三条局限。
scene('intro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const g = gsvg(world, -200, -200, 5000, 1400);
  const XB = 2200;
  const at = (id, w, o = 0) => Q(T(id, w)) + o;

  // ── 站 A：MyISAM 的两个文件与 B 树 ──
  const P = panel(world, 96, 140, 1728, 760, '上一期 · MyISAM');
  // 开场面板从第 0 帧起就在
  const fD = fileIcon(world, 200, 230, 190, 240, { inpanel: true, lines: [0.7, 0.85, 0.6, 0.75, 0.5] });
  const fI = fileIcon(world, 200, 560, 190, 240, { inpanel: true, lines: [0.5, 0.65] });
  fD.lab = txt(world, 'mono t-4', '.MYD', 420, 280); fI.lab = txt(world, 'mono t-4', '.MYI', 420, 610);
  pop(fD.e, at('i1') + 0.2); fin(fD.lab, at('i1') + 0.4); pop(fI.e, at('i1', 'MyISAM')); fin(fI.lab, at('i1', 'MyISAM') + 0.2);
  sfx('pop', at('i1') + 0.2, { g: 0.5, p: -0.4 }); sfx('pop', at('i1', 'MyISAM'), { g: 0.5, p: -0.2 });
  const lD = txt(world, 't-4 dim', '数据', 420, 340), lI = txt(world, 't-4 dim', '索引', 420, 670);
  fin(lD, at('i1b', '数据')); fin(lI, at('i1b', '索引')); sfx('tick', at('i1b', '索引'), { g: 0.4 });
  // B 树：根、两层；叶子指回数据文件里行的位置
  const root_ = tile(world, 1180, 430, 170, 64, 't3'); const mids = [0, 1, 2].map((i) => tile(world, 940 + i * 240, 570, 170, 60, 't2'));
  const leaves = [0, 1, 2, 3, 4, 5].map((i) => tile(world, 900 + i * 128, 710, 108, 56, 't1'));
  const inI = gline(g, 'M600 690 L880 600', 'dim', { w: 3, dashed: '8 8' }); const inIl = txt(world, 't-s dim', '索引文件里是一棵 B 树', 960, 360);
  const tB = at('i2', 'B 树');
  pop(root_, tB - 0.3); mids.forEach((e, i) => pop(e, tB - 0.1 + i * 0.08)); leaves.forEach((e, i) => pop(e, tB + 0.2 + i * 0.05)); sfx('pop', tB, { g: 0.5, p: 0.3 });
  [[1265, 494, 1025, 570], [1265, 494, 1265, 570], [1265, 494, 1505, 570], [1025, 630, 954, 710], [1025, 630, 1082, 710], [1265, 630, 1210, 710], [1265, 630, 1338, 710], [1505, 630, 1466, 710], [1505, 630, 1594, 710]]
    .forEach(([a, b, c, d], i) => { const l = gline(g, `M${a} ${b} L${c} ${d}`, 'dim', { w: 3 }); drawIn(l, tB + i * 0.03, 0.3); });
  arrowIn(inI, tB - 0.4, 0.4); fin(inIl, tB - 0.2);
  const tPos = at('i2', '位置');
  [0, 2, 4].forEach((i, k) => { const l = gline(g, `M${954 + i * 128} 710 C ${930 + i * 110} 420, 640 300, 410 330`, 'blue', { w: 4, arrow: true, dashed: '10 8' }); arrowIn(l, tPos - 0.2 + k * 0.15, 0.6); });
  const pl = txt(world, 't-4 blue', '叶子里：行在 .MYD 里的位置', 900, 800); fin(pl, tPos); sfx('tick', tPos, { g: 0.45 });

  // ── 站 B：三条局限 ──
  const ht = txt(world, 't-3', '三条局限', XB + 100, 150); fin(ht, at('i3') - 0.3);
  const cards = [
    ['i4', '没有事务', '一组修改，不能整体撤销'],
    ['i5', '一把表锁', '写入一多，整张表成了瓶颈'],
    ['i6', '没有日志', '崩溃之后，只能检查和修复'],
  ].map(([id, a, b], i) => {
    const x = XB + 96 + i * 584;
    const C_ = panel(world, x, 240, 544, 620, null, { name: 'limit-card' });
    const no = txt(world, '', String(i + 1), x + 36, 274); css(no, { width: '96px', height: '96px', borderRadius: '22px', background: C.blue, color: '#fff', font: '800 58px/96px "Open Sans"', textAlign: 'center' });
    const ta = txt(world, 't-3', a, x + 36, 400), tb = txt(world, 't-n dim wrap', b, x + 38, 470); css(tb, { width: '470px' });
    const tt = at(id) + 0.1;
    const tC = at('i3') + 0.05 + i * 0.12;   // 三张卡与编号先排好，讲到哪一条再填内容
    showPanel(C_, tC); pop(no, tC + 0.1, { from: 0.5 }); beat(no, tt, 1.15); fin(ta, tt + 0.15); fin(tb, Q(T(id, '：')) + 0.35);
    sfx('thud', tt, { g: 0.5, p: -0.4 + i * 0.4 });
    return { x };
  });
  // 小图：1 两行，一改一没改；2 整张表一圈橙框加排队；3 被打断的文件
  const [c1, c2, c3] = cards;
  const r1 = row(world, c1.x + 36, 600, 470, '1' + sp(2) + 'alice' + sp(3) + '<span class="blue">31</span>'), r2 = row(world, c1.x + 36, 672, 470, '1' + sp(2) + 'hello');
  const x1 = tag(world, c1.x + 300, 760, '撤不回', 'or');
  fin(r1, at('i4', '一组修改')); fin(r2, at('i4', '一组修改') + 0.1); pop(x1, at('i4', '撤销')); sfx('error', at('i4', '撤销'), { g: 0.35 });
  const tbl = [0, 1, 2, 3].map((k) => row(world, c2.x + 60, 590 + k * 50, 300, '', ''));
  tbl.forEach((e, k) => { css(e, { height: '40px' }); fin(e, at('i5', '表锁') + k * 0.05); });
  const ring = gring(g, c2.x + 40, 572, 340, 222, { name: 'table-lock' }); drawIn(ring, at('i5', '表锁') + 0.2, 0.5);
  const lk = lockBadge(world, c2.x + 362, 556); pop(lk, at('i5', '表锁') + 0.3); sfx('pop', at('i5', '表锁') + 0.3, { g: 0.5 });
  [0, 1, 2].forEach((k) => { const e = tile(world, c2.x + 420, 600 + k * 66, 70, 52, 't0'); fin(e, at('i5', '写入') + k * 0.15, { y: 0 }); });
  const qq = txt(world, 't-s dim', '排队', c2.x + 420, 800); fin(qq, at('i5', '瓶颈'));
  const f3 = fileIcon(world, c3.x + 60, 570, 180, 230, { inpanel: true });
  const bolt = gline(g, `M${c3.x + 300} 560 L${c3.x + 260} 660 L${c3.x + 320} 660 L${c3.x + 270} 790`, 'or', { w: 8 });
  const fix = tag(world, c3.x + 300, 800, '检查 · 修复');
  pop(f3.e, at('i6', '日志')); drawIn(bolt, at('i6', '崩溃') - 0.1, 0.35); sfx('error', at('i6', '崩溃'), { g: 0.4 }); pop(fix, at('i6', '检查'));

  camGuard(world, s.start + 0.01, { x: 960, y: 484, z: 1 });
  camTrack(cam, s, { x: 960, y: 484, z: 1 }, [
    [at('i3') - 0.4, { x: XB + 960 }, 1.1, { g: 0.4 }],
  ]);
});
