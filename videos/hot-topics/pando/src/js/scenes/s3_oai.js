// 03 OpenAI：留下 Git。OpenAI 风格：纯白底、纯黑、方角、细线、Inter。
// 全章常驻一张架构图：左边客户端的命令不变，中间的服务器换成 Pando；先演四条分支各排各的队，
// 再演推上来的包原样存进对象存储、原样发给要的人、经各地缓存下发；最后结果排在图下。
scene('oai', ({ root, s, c0 }) => {
  sceneBg(root, 'o');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const hd = h('div', 'abs o-lab', world, 'OpenAI'); px(hd, 120, 84); hd.style.fontSize = '34px'; hd.style.fontWeight = '600';
  show(hd, c0 + 0.05, { y: 10 });
  rule(world, 120, 140, 1680, c0 + 0.05, 'o-rule', 0.7);

  // 问题：两个方框
  const qa = h('div', 'o-box', world, 'Git 本身的极限？'); px(qa, 330, 200, 560, 92);
  const qb = h('div', 'o-box', world, '服务方式的极限？'); px(qb, 1030, 200, 560, 92);
  qa.style.background = '#f0f0f0'; qb.style.background = '#f0f0f0';
  show(qa, T('p1', '先问') + 0.1, { y: 12 }); show(qb, T('p2') + 0.05, { y: 12 });
  const tBet = T('p3', '后者');
  to(qa, tBet, { opacity: 0.28, duration: 0.3 });
  fromTo(qb, tBet, { backgroundColor: '#f0f0f0', color: '#000000' }, { backgroundColor: '#000000', color: '#ffffff', duration: 0.3, immediateRender: false });
  sfx('pop', tBet);

  // 架构图
  const term = h('div', 'o-term', world, '$ git push\n$ git fetch'); px(term, 110, 440); term.dataset.name = '客户端命令';
  const termN = h('div', 'abs t-small', world, '工程师和智能体<br>用法不变'); px(termN, 112, 570); css(termN, { color: '#6b6b6b' });
  const tUse = T('p3', '用法');
  show(term, tUse - 0.3, { x: -20 }); show(termN, T('p3', '不变'), { y: 8 });
  const PX = 900, PY = 370, PW = 280, PH = 380;
  const oldS = h('div', 'o-box', world, '原来的<br>Git 服务器'); px(oldS, PX, PY, PW, PH); css(oldS, { textAlign: 'center', fontSize: '30px' });
  const pando = h('div', 'o-blk', world, '<div style="font:600 52px Inter;color:#fff;letter-spacing:-.02em">Pando</div><div style="font:500 24px \'Sans SC\';color:#bbb;margin-top:6px">新的服务器</div>');
  px(pando, PX, PY, PW, PH); css(pando, { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }); pando.dataset.name = 'Pando';
  wipe(oldS, c0 + 0.3, { dir: 'l', d: 0.5 }); sfx('whoosh', c0 + 0.3, { g: 0.3 });
  const tSw = T('p3', '服务器');
  hide(oldS, tSw - 0.1, { d: 0.25 });
  wipe(pando, tSw, { dir: 'b', d: 0.45 }); sfx('thud', tSw + 0.2, { g: 0.5 });
  hide([qa, qb], T('p4') - 0.4, { d: 0.3 });

  // 分支各排各的队
  const LY = [390, 480, 570, 660], LX0 = 620, LX1 = PX - 10;
  const lanes = LY.map((y, i) => {
    const lb = h('div', 'abs mono', world, 'branch-' + 'abcd'[i]); px(lb, 470, y + 4); lb.style.fontSize = '26px';
    const ln = h('div', 'o-rule', world); px(ln, LX0, y + 22, LX1 - LX0); ln.style.background = '#e0e0e0'; ln.style.height = '4px';
    return [lb, ln];
  });
  const tLane = T('p4', '各排各的');
  lanes.forEach(([lb, ln], i) => { show(lb, tLane - 0.5 + i * 0.08, { x: -10, d: 0.3 }); fromTo(ln, tLane - 0.5 + i * 0.08, { scaleX: 0 }, { scaleX: 1, duration: 0.4, immediateRender: true }); });
  sfx('whoosh', tLane - 0.5, { g: 0.3 });
  // 每条道上的包：由 t 直接算位置；c 道（第 3 条）演两个包撞上同一条，后一个等
  const laneT0 = tLane - 0.1, laneT1 = T('p7', '原样') - 0.3;
  const LEN = LX1 - LX0 - 40, SPEED = 210, PH_ = [0, 0.45, 0.2, 0.7];
  const lp = [];
  LY.forEach((y, i) => { for (let k = 0; k < 2; k++) { const b = h('div', 'o-blk', world); px(b, LX0, y + 4, 40, 40); b.dataset.name = '推送'; b.style.visibility = 'hidden'; lp.push({ b, i, k, y }); } });
  F((t) => {
    const on = t >= laneT0 && t < laneT1;
    for (const { b, i, k } of lp) {
      if (!on || i === 2) { b.style.visibility = 'hidden'; continue; }
      const u = ((t - laneT0) * SPEED / LEN + PH_[i] + k * 0.5) % 1;
      b.style.visibility = ''; b.style.left = (LX0 + u * LEN) + 'px'; b.style.opacity = u > 0.92 ? String((1 - u) / 0.08) : '1';
    }
  });
  // c 道：两个推送撞上同一条分支，前一个先进，后一个在闸口前等，轮到再走
  const tHit = T('p4', '撞上'), tOrd = T('p4', '分先后'), GATE = LX1 - 50;
  const cA = h('div', 'o-blk', world); px(cA, LX0, LY[2] + 4, 40, 40); cA.dataset.name = 'branch-c 的推送';
  const cB = h('div', 'o-blk m', world); px(cB, LX0, LY[2] + 4, 40, 40); cB.dataset.name = 'branch-c 的第二个推送';
  fromTo(cA, laneT0, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: GATE - LX0, duration: tHit - laneT0 - 0.1, ease: 'none', immediateRender: true });
  fromTo(cB, laneT0 + 0.3, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, x: GATE - LX0 - 56, duration: tHit - laneT0 - 0.3, ease: 'none', immediateRender: true });
  fromTo(cA, tOrd, { x: GATE - LX0, autoAlpha: 1 }, { x: LX1 + 30 - LX0, autoAlpha: 0, duration: 0.45, ease: 'power2.in', immediateRender: false });
  fromTo(cB, tOrd + 0.35, { x: GATE - LX0 - 56 }, { x: GATE - LX0, duration: 0.4, ease: 'power2.out', immediateRender: false });
  fromTo(cB, laneT1, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false });
  sfx('tick', tOrd, { g: 0.5 });
  const coll = h('div', 'abs t-small', world, '同一条：分先后'); px(coll, LX0 + 20, LY[2] + 50); css(coll, { color: '#000' });
  show(coll, T('p4', '撞上'), { y: 8 }); hide(coll, T('p5') + 0.2, { d: 0.3 });
  // 代价：同一刻看几条道，位置各不相同
  const scanX = 790;
  const sl = path(ov, `M${scanX},360 L${scanX},700`, 'black', { w: 2, arrow: false, dashed: true });
  draw(sl, T('p5', '同时看') - 0.2, 0.4);
  const scanN = h('div', 'abs t-small', world, '同一刻？未必'); px(scanN, scanX - 90, 712); css(scanN, { color: '#000' });
  show(scanN, T('p5', '未必'), { y: 8 });
  const okN = h('div', 'abs t-small', world, '人和智能体只在乎自己那条分支的先后'); px(okN, 470, 752); css(okN, { color: '#6b6b6b' });
  show(okN, T('p6', '并不在意') - 0.2, { y: 8 });
  to(sl, T('p7') - 0.3, { opacity: 0, duration: 0.3 }); hide([scanN, okN], T('p7') - 0.3, { d: 0.3 });

  // 包原样存好，原样发出
  const SX = 1260, SY = 390;
  const store = h('div', 'o-box', world, ''); px(store, SX, SY, 280, 120); store.dataset.name = '对象存储';
  const storeL = h('div', 'abs t-small', world, '对象存储 · 包原样放着'); px(storeL, SX, SY - 44); css(storeL, { color: '#000' });
  const tKeep = T('p7', '原样');
  show(store, tKeep - 0.5, { x: 20, d: 0.4 }); show(storeL, tKeep - 0.2, { y: 8 });
  const stack = [0, 1, 2].map((k) => { const b = h('div', 'o-blk', world); px(b, SX + 30 + k * 56, SY + 40, 40, 40); b.dataset.name = '存好的包'; return b; });
  stack.forEach((b, k) => fromTo(b, tKeep - 0.2 + k * 0.15, { autoAlpha: 0, x: -260 - k * 56, y: 100 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: true }));
  sfx('pop', tKeep);
  const reader = node(world, 1740, 390, '要的人', 'job');
  const tSend = T('p7', '发过去');
  show(reader, tSend - 0.6, { x: 20, d: 0.3 });
  const cp = h('div', 'o-blk', world); px(cp, SX + 142, SY + 40, 40, 40); cp.dataset.name = '同一个包';
  fromTo(cp, tSend - 0.2, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, x: 1740 - 20 - (SX + 142), y: 390 - (SY + 40), duration: 0.6, ease: 'power2.inOut', immediateRender: true });
  sfx('whoosh', tSend - 0.2, { g: 0.3 });
  const sendN = h('div', 'abs t-small', world, '不重算，同一份字节'); px(sendN, 1580, 500); css(sendN, { color: '#000' });
  show(sendN, tSend + 0.3, { y: 8 });
  // 各地缓存
  const tCache = T('p8', '各地');
  const caches = [0, 1, 2].map((k) => { const c = h('div', 'o-box', world, '缓存'); px(c, SX + k * 100, 620, 84, 70); c.style.fontSize = '24px'; show(c, tCache + k * 0.12, { y: 16, d: 0.35 }); return c; });
  const cacheG = h('div', 'abs t-small', world, '各地就近的副本（OpenAI 内部叫 Express）'); px(cacheG, SX - 20, 736); css(cacheG, { color: '#000' }); cacheG.dataset.gloss = '缓存';
  show(cacheG, T('p8', '缓存'), { y: 8 }); sfx('pop', tCache);
  [0, 1, 2].forEach((k) => line(ov, SX + 140, SY + 120, SX + 42 + k * 100, 616, tCache - 0.2 + k * 0.1, 'black', { w: 2, d: 0.35 }));
  const hit = h('div', 'abs', world, '&gt; 99%'); px(hit, 1580, 608); css(hit, { font: '600 64px Inter' });
  const hitN = h('div', 'abs t-small', world, '缓存命中'); px(hitN, 1584, 686); css(hitN, { color: '#6b6b6b' });
  slam(hit, T('p9', '九成九'), { from: 1.2 }); sfx('thud', T('p9', '九成九') + 0.1, { g: 0.5 }); show(hitN, T('p9', '就地'), { y: 8 });

  // 结果：图下一行
  hide([termN, storeL, sendN, cacheG, hitN], T('p10') - 0.5, { d: 0.3 });
  rule(world, 120, 796, 1680, T('p10') - 0.3, 'o-rule', 0.5);
  const R = (x, big, small, t) => {
    const b = h('div', 'abs', world, big); px(b, x, 812); css(b, { font: '600 84px Inter', letterSpacing: '-.03em' });
    const n = h('div', 'abs t-small', world, small); px(n, x + 4, 912); css(n, { color: '#6b6b6b' });
    slam(b, t, { from: 1.15 }); show(n, t + 0.25, { y: 8 }); sfx('thud', t + 0.1, { g: 0.5 });
    return [b, n];
  };
  R(120, '−80%', '中位推送等待时间', T('p10', '近八成'));
  R(640, '≈1 PB', '每天送出的 Git 数据 · 少量 CPU 核', T('p11', '将近'));
  R(1240, '10 周', '一人设计核心 · Codex 实现', T('p12', '十周'));

  drift(cam, s, 1);
});
