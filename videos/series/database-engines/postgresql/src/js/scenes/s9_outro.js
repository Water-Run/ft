// 第 09 章：四个问题（文档表格逐行写出），下一集 Firebird，片尾名单（无旁白，完整停留 12 秒以上）。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  sceneRule(world, s);
  const hd = heading(world, 160, 140, 1600, 'PostgreSQL 的回答');
  const rows = [
    ['数据怎么放', '堆里一个个行版本，索引另放', 'z2'],
    ['怎么找', '规划器选路，再判断版本能不能读', 'z3'],
    ['怎么并发', '快照决定读哪个版本，写和写排队', 'z4'],
    ['出错怎么办', '先写日志，崩溃后重做', 'z5'],
  ];
  const T_ = dtable(world, 160, 260, ['问题', 'PostgreSQL'], rows.map((r) => [r[0], r[1]]), { w: 1600 });
  css(T_.el, { fontSize: '42px' });
  showHeading(hd, T('z1') - 0.1);
  fin(T_.el, T('z1') + 0.3, { y: 0 }); tl.set(T_.trs, { autoAlpha: 0 }, 0);
  rows.forEach((r, i) => { tl.fromTo(T_.trs[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, immediateRender: false }, T(r[2]) - 0.1); sfx('tick', T(r[2]) - 0.1);
    tl.fromTo(T_.trs[i].children, { backgroundColor: '#336791', color: '#ffffff' }, { backgroundColor: '#ffffff', color: '#212121', duration: 1.6, ease: 'power1.in', immediateRender: false }, T(r[2]) + 0.4); });
  // 下一集
  const nx = 160, ny = 720;
  const nxT = txt(world, 't-s', '下一集', nx, ny);
  const nxN = txt(world, 't-1', 'Firebird', nx, ny + 44); css(nxN, { fontFamily: '"Open Sans"', color: 'var(--ink2)' });
  const nxS = txt(world, 't-4', '两个开源巨头之外，一个更小众的选择', nx + 470, ny + 80);
  fin(nxT, T('z6') - 0.1); fin(nxN, T('z6a', 'Fi') - 0.2, { y: 20 }); fin(nxS, T('z6') + 0.4); sfx('thud', T('z6a', 'Fi'), { g: 0.4 });

  // ── 片尾名单：右侧一站 ──
  const CX = 2960;
  const logo = pgLogo(world, false); px(logo, CX - 760, 230, 300, 309);
  const cr = [
    ['策划', 'WaterRun'],
    ['事实测绘', '6.1Sol'],
    ['文案', '6.1Sol、Claude Opus 5.5'],
    ['画面、配乐与制作', 'Claude Opus 5.5'],
    ['配音', 'MiniMax speech-2.8-hd'],
  ];
  const crT = dtable(world, CX - 340, 200, ['', ''], cr, { w: 1100 });
  css(crT.el, { fontSize: '40px' }); vanish(crT.head, 0);
  const os = txt(world, 't-3', '开源视频：<span class="pg">github.com/Water-Run/ft</span>', CX - 760, 680);
  const tC = L.cues.zCredit.start;
  pop(logo, tC - 0.9, { from: 0.85 }); fin(crT.el, tC - 0.7, { y: 0 }); fin(os, tC - 0.4);

  camTrack(cam, world, { t: s.start, v: { x: 960, y: 540, z: 1 } }, [
    [tC - 0.9, { x: CX }, 1.0, { sfx: false }],
  ], { end: s.end });
});
