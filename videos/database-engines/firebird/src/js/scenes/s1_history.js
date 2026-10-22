// 01 它从哪里来：一条横向时间轴，镜头沿着它走。
// 主画面：InterBase 的封闭代码块在 2000 年被揭开，交到聚拢起来的社区手里；之后同一份代码被清理、测试、重整，3.0 时三种运行形态的核心合成一块。
scene('history', ({ root, s, c0 }) => {
  const { world, under, over } = stage(root, 5800, 1080);
  const cam = makeCamera(world);
  const AY = 700;                                         // 时间轴的高度
  const axis = blk(world, '', '', 160, AY, 5480, 4, { background: C.ink }); axis.dataset.name = '时间轴';
  const mark = (x, label, t, o = {}) => {
    const tk = blk(world, '', '', x - 2, AY - 14, 4, 32, { background: C.ink });
    const lb = tx(world, 'lat', label, x - 2, AY + 34, { fontSize: o.fs || '48px', fontWeight: 700 });
    appear(tk, t); slam(lb, t, { from: 1.4, d: 0.4 }); sfx('thud', t + 0.05, { g: o.g || 0.6 });
    return lb;
  };
  // 轴随镜头向右长出来
  tl.fromTo(axis, { width: 0 }, { width: 900, duration: 1.0, ease: 'power2.out', immediateRender: true }, c0 + 0.1);

  // ── h1–h2：八十年代的商业数据库 InterBase，后来归 Borland ──
  const ib = blk(world, 'dark', '', 200, 380, 620, 240); ib.dataset.name = 'InterBase（商业、封闭）';
  const ibT = tx(world, 'lat', 'InterBase', 240, 410, { fontSize: '76px', fontWeight: 700, color: C.white });
  const ibS = tx(world, 't4', '商业数据库', 244, 520, { color: C.g3 });
  const tH1 = T('h1'), tH2 = T('h2');
  mark(200, '八十年代', T('h1', '八十'), { fs: '44px' });
  wipe(ib, T('h1', 'Inter') - 0.35, { dir: 'b', d: 0.5 }); wipe(ibT, T('h1', 'Inter') - 0.1, { dir: 'l', d: 0.5 }); appear(ibS, T('h1', 'Inter') + 0.3);
  const own = blk(world, 'chip w lat', 'Borland', 520, 300, 300, 72, { outline: '4px solid ' + C.ink, outlineOffset: '-4px', fontSize: '38px', fontWeight: 700 });
  own.dataset.name = '所有者 Borland';
  const tBor = T('h2', 'Borland');
  slide(own, tBor - 0.25, { y: -50, d: 0.5 }); sfx('pop', tBor, { g: 0.6, p: -0.6 });
  const ownL = arrow(over, [[670, 372], [670, 380]], 'ink', { head: false });

  // ── h3：2000 年公开源码——封闭块的盖子被揭开，露出一行行代码 ──
  const SX = 1150;
  const src = blk(world, 'panel', '', SX, 380, 620, 240); src.dataset.name = '源码';
  const rnd = seeded(2000);
  const lines = [];
  const lw = [];
  for (let i = 0; i < 7; i++) { lw.push(Math.round(220 + rnd() * 320)); lines.push(blk(src, '', '', 28 + (i % 3 === 1 ? 40 : 0), 24 + i * 29, lw[i], 14, { background: C.g3 })); }
  const lid = blk(world, 'dark', '', SX, 380, 620, 240); lid.dataset.name = '封闭的代码';
  const lidT = tx(lid, 'lat', 'InterBase', 40, 30, { fontSize: '76px', fontWeight: 700, color: C.white });
  const tH3 = T('h3');
  wipe(src, tH3 - 0.2, { dir: 'l', d: 0.01 });
  wipe(lid, tH3 - 0.2, { dir: 'l', d: 0.5 });
  mark(SX, '2000', T('h3', '二零') + 0.05);
  const tOpen = T('h3', '公开');
  tl.to(lid, { y: -300, opacity: 0, duration: 0.7, ease: 'power3.in' }, tOpen - 0.1); sfx('riser', tOpen - 1.1, { g: 0.35 });
  sfx('chime', tOpen + 0.5, { g: 0.6 });
  const srcL = tx(world, 't4', '源码公开', SX, 316, { fontWeight: 700 });
  wipe(srcL, tOpen + 0.3, { dir: 'l', d: 0.4 });

  // ── h4–h5：围绕 InterBase 的开发者和用户聚拢，成立独立的开源项目 Firebird ──
  const PX = 2150, people = [];
  for (let i = 0; i < 24; i++) {
    const gx = PX + (i % 6) * 64, gy = 400 + Math.floor(i / 6) * 56;
    const p = blk(world, '', '', gx, gy, 40, 40, { background: i % 5 === 2 ? C.ink : C.g4 }); p.dataset.name = '开发者或用户';
    const fx = (rnd() - 0.5) * 900, fy = (rnd() - 0.5) * 700;
    people.push({ p, fx, fy });
  }
  const tH4 = T('h4'), tH5 = T('h5');
  people.forEach(({ p, fx, fy }, i) => {
    const t = tH4 + 0.15 + i * 0.045;
    tl.fromTo(p, { x: fx, y: fy, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', immediateRender: true }, t);
  });
  sfx('pop', tH4 + 0.4, { g: 0.4, p: 0.3 }); sfx('pop', tH4 + 0.8, { g: 0.35, p: 0.5 });
  const pplL = tx(world, 't4', '开发者和用户', PX, 316, { fontWeight: 700 });
  wipe(pplL, tH4 + 0.3, { dir: 'l', d: 0.45 });
  // 项目：火鸟标志落在轴上
  const proj = blk(world, '', '<img src="img/fb-mark.png" style="width:100%">', PX + 470, 400, 200, 203); proj.dataset.name = 'Firebird 项目';
  const projL = tx(world, 't3', '独立的开源项目', PX + 450, 316, { fontWeight: 700 });
  const projN = tx(world, 'lat', 'Firebird', PX + 470, 620, { fontSize: '56px', fontWeight: 800 });
  const tFb = T('h5', 'Fire');
  wipe(projL, T('h5', '独立') - 0.1, { dir: 'l', d: 0.5 });
  slam(proj, tFb - 0.2, { from: 1.8, d: 0.5 }); sfx('thud', tFb - 0.1, { g: 0.8 });
  wipe(projN, tFb + 0.1, { dir: 'l', d: 0.4 });
  const link = arrow(over, [[PX + 400, 500], [PX + 460, 500]], 'ink');
  drawIn(link, tFb - 0.3, 0.3);

  // ── h6：社区接过的是一套已经发展多年的数据库——源码面板移交到社区一侧 ──
  const WX = 3150;                                       // 社区工作台
  const tH6 = T('h6');
  const dx = WX - SX;
  tl.fromTo(src, { x: 0 }, { x: dx, duration: 1.1, ease: 'power3.inOut', immediateRender: true }, tH6 + 0.1);
  tl.fromTo(srcL, { x: 0 }, { x: dx, duration: 1.1, ease: 'power3.inOut', immediateRender: true }, tH6 + 0.1);
  sfx('whoosh', tH6 + 0.1, { g: 0.4, p: 0.3 });
  const yrs = tx(world, 't4', '已经发展多年的代码', WX, 640, { color: C.g4 });
  wipe(yrs, T('h6', '多年') - 0.1, { dir: 'l', d: 0.5 });

  // ── h7：清理代码、修正问题、大量测试 ──
  const tH7 = T('h7');
  const tClean = T('h7', '清理'), tFix = T('h7', '修正'), tTest = T('h7', '测试');
  [2, 5].forEach((i, k) => { fromTo(lines[i], tClean + k * 0.15, { width: lw[i] }, { width: 0, duration: 0.35, ease: 'power2.in' }); sfx('tick', tClean + k * 0.15, { g: 0.45, p: 0.4 }); });
  const bug = blk(src, '', '', 20, 24 + 3 * 29 - 7, 560, 28, { outline: '4px solid ' + C.fire, outlineOffset: '-4px' }); bug.dataset.name = '问题';
  appear(bug, tFix - 0.25); sfx('error', tFix - 0.2, { g: 0.4 });
  vanish(bug, tFix + 0.45); fromTo(lines[3], tFix + 0.4, { backgroundColor: C.g3 }, { backgroundColor: C.g4, duration: 0.3 }); sfx('pop', tFix + 0.45, { g: 0.5 });
  const tests = [];
  for (let i = 0; i < 10; i++) tests.push(blk(world, '', '', WX + 660, 380 + i * 24, 40, 16, { outline: '3px solid ' + C.g4, outlineOffset: '-3px' }));
  tests.forEach((b, i) => { appear(b, tTest - 0.3 + i * 0.03); fromTo(b, tTest + 0.1 + i * 0.12, { backgroundColor: C.page }, { backgroundColor: C.ink, duration: 0.1 }); });
  for (let i = 0; i < 10; i += 3) sfx('tick', tTest + 0.1 + i * 0.12, { g: 0.35, p: 0.6 });
  const testL = tx(world, 't5', '测试', WX + 720, 380);
  appear(testL, tTest);

  // ── h8：2002 年第一个正式版本 ──
  const RX = 4050;
  const tH8 = T('h8');
  mark(RX, '2002', T('h8', '二零') + 0.05);
  const v1 = blk(world, 'chip ink lat', 'Firebird 1.0', RX, 470, 360, 96, { fontSize: '44px', fontWeight: 700 }); v1.dataset.name = 'Firebird 1.0';
  const v1L = tx(world, 't4', '第一个正式版本', RX, 590);
  slam(v1, T('h8', '第一') - 0.1, { from: 1.3 }); sfx('chime', T('h8', '正式'), { g: 0.6 });
  wipe(v1L, T('h8', '第一') + 0.1, { dir: 'l', d: 0.5 });

  // ── h9–h11：继续改写、重整架构；到 3.0，三种运行形态的核心合成一份 ──
  const MX = 4700;
  const forms = ['Classic', 'SuperServer', '嵌入式'].map((n, i) => {
    const b = blk(world, 'chip g', n, MX, 300 + i * 112, 420, 92, { fontSize: '38px', fontFamily: i < 2 ? 'Heebo' : '' }); b.dataset.name = '运行形态 ' + n;
    return b;
  });
  const tH9 = T('h9'), tH10 = T('h10'), tH11 = T('h11');
  forms.forEach((b, i) => slide(b, tH9 + 0.2 + i * 0.14, { x: 80, d: 0.55, ease: 'power3.out' }));
  sfx('pop', tH9 + 0.25, { g: 0.35, p: 0.5 });
  // 改写重整：三块各自的内部格子错开又对齐
  const reorg = tx(world, 't4', '改写代码 · 重整架构', MX, 236, { color: C.g4 });
  wipe(reorg, T('h9', '改写') - 0.1, { dir: 'l', d: 0.5 });
  const m30 = mark(MX + 210, '3.0', T('h10', '三点零') + 0.05);
  // 合并：三块向中间并拢，换成一块「核心引擎」
  const tMerge = T('h10', '合到') - 0.2;
  forms.forEach((b, i) => tl.to(b, { y: (1 - i) * 112, duration: 0.6, ease: 'power3.in' }, tMerge));
  forms.forEach((b) => vanish(b, tMerge + 0.6));
  const core = blk(world, 'chip w', '<img src="img/fb-mark.png" style="height:60px;margin-right:18px">核心引擎', MX, 380, 420, 120, { fontSize: '46px', fontWeight: 700, outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  core.dataset.name = '核心引擎';
  slam(core, tMerge + 0.55, { from: 1.15, d: 0.45 }); sfx('thud', tMerge + 0.6, { g: 0.9 });
  const toSrv = arrow(over, [[MX + 420, 410], [MX + 560, 410]], 'ink'), toEmb = arrow(over, [[MX + 420, 470], [MX + 560, 470], [MX + 560, 560], [MX + 600, 560]], 'ink');
  const lSrv = tx(world, 't4', '服务端', MX + 580, 386, { fontWeight: 700 }), lEmb = tx(world, 't4', '嵌入式', MX + 620, 536, { fontWeight: 700 });
  drawIn(toSrv, T('h11', '服务端') - 0.2, 0.35); wipe(lSrv, T('h11', '服务端'), { dir: 'l', d: 0.4 });
  drawIn(toEmb, T('h11', '嵌入式') - 0.25, 0.4); wipe(lEmb, T('h11', '嵌入式'), { dir: 'l', d: 0.4 });
  sfx('tick', T('h11', '服务端'), { g: 0.5, p: 0.4 }); sfx('tick', T('h11', '嵌入式'), { g: 0.5, p: 0.5 });

  // ── h12：本集的 5.0.4，延续这套架构——轴的尽头，与导航条上的版本框呼应 ──
  const EX = 5420;
  const tH12 = T('h12');
  const v5 = mark(EX, '5.0.4', T('h12', '五点') + 0.05, { g: 0.8 });
  const v5L = tx(world, 't4', '本集的版本', EX - 120, 600, { color: C.g4 });
  wipe(v5L, T('h12', '五点') + 0.3, { dir: 'l', d: 0.4 });
  const cont = blk(world, '', '', MX + 210, AY - 2, EX - MX - 210, 8, { background: C.teal }); cont.dataset.name = '延续';
  wipe(cont, T('h12', '延续') - 0.2, { dir: 'l', d: 0.7 });
  if (window.BAR) classAt(window.BAR.ver, 'sel', T('h12', '五点'), s.end);

  // ── 镜头 ──
  const y0 = 530;
  cam.track(s.start, { x: 960, y: y0, z: 1.1 }, [
    [c0 + 0.1, { x: 1010, z: 1.13 }, Math.max(1, tH3 - c0 - 1.2), { ease: 'none', sfx: false }],
    [tH3 - 0.9, { x: 1500, z: 1.1 }, 1.0, { g: 0.4 }],
    [null, { x: 1560 }, Math.max(0.6, tH4 - (tH3 + 0.25) - 0.3), { ease: 'none', sfx: false }],
    [tH4 - 0.1, { x: 2380 }, 1.0, { g: 0.4 }],
    [null, { x: 2440, z: 1.13 }, Math.max(0.6, tH6 - tH4 - 1.25), { ease: 'none', sfx: false }],
    [tH6 + 0.1, { x: 3500, z: 1.1 }, 1.1, { sfx: false }],
    [null, { x: 3560 }, Math.max(0.6, tH8 - tH6 - 1.5), { ease: 'none', sfx: false }],
    [tH8 - 0.2, { x: 4300 }, 1.0, { g: 0.4 }],
    [null, { x: 4360 }, Math.max(0.6, tH9 - tH8 - 1.0), { ease: 'none', sfx: false }],
    [tH9 - 0.1, { x: 5000 }, 1.0, { g: 0.4 }],
    [null, { x: 5040, z: 1.13 }, Math.max(0.6, tH12 - tH9 - 1.3), { ease: 'none', sfx: false }],
    [tH12 - 0.1, { x: 4900, z: 1.0 }, 1.0, { sfx: false }],
    [null, { x: 4860 }, Math.max(0.6, s.end - tH12 - 1.2), { ease: 'none', sfx: false }],
  ]);
  tl.fromTo(axis, { width: 900 }, { width: 5480, duration: Math.max(2, tH12 - c0 - 1.2), ease: 'none', immediateRender: false }, c0 + 1.2);
});
