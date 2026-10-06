// 开场。TODO: 系列基座的示例场景，整个文件换成本集的内容。结构：现象或问题 → 片名卡（朱红整屏）→ 它是什么。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // 第一帧就要有东西：一道横线先画出来，主体随第一句落下
  const rule = blk(world, 'bg-paper', 120, 300, 900, 8);
  fromTo(rule, s.start + 0.05, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.6, ease: 'power3.inOut' }); sfx('whoosh', s.start + 0.05, { g: 0.5 });
  const what = txt(world, 't-1', tr('现象', 'The hook'), 112, 330);
  slam(what, Q(T('o1')), { from: 1.25, d: 0.35 }); sfx('thud', Q(T('o1')) + 0.1);
  // 片名卡：朱红整屏，墨色字
  const tCard = Qf(T('o2')), tOut = Q(Tend('o2') + 0.35);
  const card = h('div', 'abs bg-ac ink', root); px(card, 0, 0, 1920, VH);
  const big = txt(card, 't-0 ink', tr('主题', 'Topic'), 96, 150);
  const n = txt(card, 'num ink', String(TOTAL), 1196, 170); n.style.fontSize = '290px';
  const u = txt(card, 't-2 ink', tr('秒', 's'), 1196 + String(TOTAL).length * 174 + 16, 342);
  [big, n, u].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.1, { g: 0.8 });
  slam(big, tCard + 0.35, { from: 1.3, d: 0.4 }); sfx('thud', tCard + 0.35);
  slide(n, tCard + 0.2, { x: 120, d: 0.45 }); slide(u, tCard + 0.28, { x: 120, d: 0.45 }); sfx('pop', tCard + 0.2, { g: 0.6, p: 0.4 });
  fromTo(big, tCard + 0.8, { scale: 1 }, { scale: 1.04, transformOrigin: '0% 60%', duration: tOut - tCard - 0.8, ease: 'none', immediateRender: false });
  wipeOut(card, tOut, { dir: 'r', d: 0.4 }); sfx('whoosh', tOut, { g: 0.7 });
  hudGround('L', tCard + 0.2, tOut + 0.3, 'ac'); hudGround('R', tCard + 0.3, tOut + 0.1, 'ac');
  wipeOut(what, tCard + 0.4, { dir: 'l', d: 0.2 });
  const is = txt(world, 't-2', tr('它是什么', 'What it is'), 116, 360);
  wipe(is, Q(T('o3')), { dir: 'l', d: 0.4 }); sfx('pop', Q(T('o3')), { g: 0.7 });
  cam.track(s.start, { x: 960, y: 484, z: 1.05 }, [
    [s.start + 0.02, { z: 1 }, 0.85, { ease: 'power3.out', sfx: false }],
    [s.start + 0.9, { z: 1.04 }, s.end - s.start - 1.0, { ease: 'none', sfx: false }],
  ]);
});
