// 出错谁负责：接着上一场的链路（同一帧直接切），下面的屏收走，全片出现过的错误码排成一排。
// 主画面：责任图。先只看首位（后两位暗下去）；4xx 归到客户端一侧「改请求」，5xx 归到源站一侧「等恢复」；
// 502、504 再挪到网关与上游之间——卡在上游。最后整张图一齐亮一遍：码停在哪、该谁负责。
scene('close', ({ root, s }) => {
  const world = h('div', 'world', root);
  const camH = {};
  const M = chainMachines(world);
  const { OX, OY, k, MH } = CHAIN;
  for (const e of M.O.texts) e.style.visibility = 'hidden';
  // 与上一场最后一帧相同：客户端收到 504，屏上是 504 的回显
  const got = txt(world, 'px red', '504', CHAIN.cli[0] + 24, OY + 80); css(got, { fontSize: '120px', lineHeight: '0.8', background: C.ink, padding: '6px 14px 0', minWidth: '210px', height: '106px' });
  const xg = txt(world, 'mono ink', 'X-Gateway: demo-gateway', CHAIN.gw[0] + 18, OY + 72); css(xg, { fontSize: '24px', fontWeight: 700 });
  blk(world, 'bg-ink', CHAIN.gw[0] + 18, OY + 150, 280, 26);
  const tlab = txt(world, 'mono ink', '1 s', CHAIN.gw[0] + 310, OY + 144); tlab.style.fontSize = '30px';
  [0, 1, 2, 3, 4].forEach((i) => blk(world, 'bg-ink', CHAIN.lim[0] + 20, OY + 196 - i * 28, 90, 16));
  const scr = screen(world, 60, 574, 1800, 340, tr('回显', 'echo'));
  echoLog(scr, [{ t: s.start - 3, key: '502' }, { t: s.start - 1, key: '504' }], LOG_OPT);
  const tX = Q(Math.max(T('x1') - 0.1, T('x1', { zh: '第一位', en: 'first' }) - 0.1));
  wipeOut(scr, tX, { dir: 'b', d: 0.4 }); sfx('tick', tX, { g: 0.5 });
  [...M.O.gates.map((q) => q.c), M.O.c200].forEach((c) => wipeOut(c, tX + 0.1, { dir: 'b', d: 0.3 }));   // 源站里的小码牌收起：下面那排大码牌接手

  // x1：一排错误码，只看首位
  const CODES = ['400', '401', '403', '404', '429', '500', '502', '504'], CW = 150, CH = 90, GAP = 24, RY = 620;
  const x0 = (1920 - (CODES.length * (CW + GAP) - GAP)) / 2;
  const chips = CODES.map((c, i) => {
    const e = chip(world, '', x0 + i * (CW + GAP), RY, CW, CH, 84);
    e.innerHTML = `<span>${c[0]}</span><span class="d2">${c.slice(1)}</span>`;
    e.code = c; e.x0 = x0 + i * (CW + GAP);
    return e;
  });
  chips.forEach((e, i) => slam(e, tX + 0.35 + i * 0.06, { from: 1.35, d: 0.28 }));
  sfx('drive', tX + 0.35, { g: 0.55 });
  meter(tX, '');
  const tD = Math.max(Q(T('x1', { zh: '第一位', en: 'first' }) - 0.1), tX + 0.9);
  chips.forEach((e) => classAt(e, 'fd', tD));
  sfx('beep', tD, { g: 0.6 });

  // x2：4xx 归客户端一侧，5xx 归源站一侧
  const t4 = Q(T('x2', '4xx') - 0.1), t5 = Q(T('x2', '5xx') - 0.1);
  const four = chips.slice(0, 5), five = chips.slice(5);
  four.forEach((e, i) => fromTo(e, t4 + i * 0.05, { x: 0 }, { x: 80 + i * (CW + GAP) - e.x0, duration: 0.55, ease: 'power3.inOut', immediateRender: false }));
  five.forEach((e, i) => fromTo(e, t5 + i * 0.05, { x: 0 }, { x: OX + i * (CW + GAP) - e.x0, duration: 0.55, ease: 'power3.inOut', immediateRender: false }));
  sfx('pop', t4, { g: 0.6, p: -0.6 }); sfx('pop', t5, { g: 0.6, p: 0.6 });
  const fix = txt(world, 'ink', tr('改请求', 'fix the request'), 80, RY + CH + 26); css(fix, { font: `900 ${LANG === 'zh' ? 72 : 60}px/1 "Sans SC", "Inter"` });
  const wait = txt(world, 'ink', tr('等恢复', 'wait'), OX, RY + CH + 26); css(wait, { font: `900 ${LANG === 'zh' ? 72 : 60}px/1 "Sans SC", "Inter"` });
  wipe(fix, t4 + 0.45, { dir: 'l', d: 0.35 }); wipe(wait, t5 + 0.45, { dir: 'l', d: 0.35 });
  const fixU = blk(world, 'bg-ink', 80, RY - 22, 5 * (CW + GAP) - GAP, 8), waitU = blk(world, 'bg-ink', OX, RY - 22, 3 * (CW + GAP) - GAP, 8);
  fromTo(fixU, t4 + 0.4, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4 });
  fromTo(waitU, t5 + 0.4, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4 });

  // x3：502、504 挪到网关与上游之间
  const t3 = Q(T('x3', '502') - 0.1);
  const up = [five[1], five[2]], UX = [CHAIN.gw[0] + CHAIN.gw[1] - 170, CHAIN.gw[0] + CHAIN.gw[1] + 4], UY = OY + MH + 34;
  up.forEach((e, i) => fromTo(e, t3 + i * 0.06, { x: OX + (i + 1) * (CW + GAP) - e.x0, y: 0 }, { x: UX[i] - e.x0, y: UY - RY, duration: 0.6, ease: 'power3.inOut', immediateRender: false }));
  sfx('thud', t3 + 0.5, { g: 0.6, p: 0.2 });
  const br = blk(world, 'bg-red', CHAIN.lim[0], OY + MH + 14, OX + ORIGIN.W * k - CHAIN.lim[0], 10); br.dataset.name = tr('上游', 'upstream');
  const upl = txt(world, 'ink', tr('上游', 'upstream'), CHAIN.lim[0] + 300, OY + MH + 40); css(upl, { font: `900 ${LANG === 'zh' ? 64 : 56}px/1 "Sans SC", "Inter"` });
  const tUp = Q(T('x3', { zh: '上游', en: 'upstream' }) - 0.2);
  fromTo(br, tUp, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4 });
  wipe(upl, tUp + 0.15, { dir: 'l', d: 0.35 });
  classAt(M.gw.plate, 'bg-red', tUp, tUp + 1.2);
  sfx('error', tUp, { g: 0.5, p: 0.3 });

  // x4：整张图一齐亮一遍
  const tW = Q(T('x4', { zh: '三位数', en: 'Three' }) - 0.1);
  const order = [...four, five[0], ...up];
  order.forEach((e, i) => { lightChip(e, tW + i * 0.08, tW + i * 0.08 + 0.7); });
  order.forEach((e, i) => { if (i % 2 === 0) sfx('tick', tW + i * 0.08, { g: 0.35, p: -0.6 + i * 0.15 }); });
  const tSum = Q(T('x4', { zh: '停在', en: 'stopped' }) - 0.1);
  chips.forEach((e) => classAt(e, 'nofd', tSum));
  const sum = txt(world, 'mute', tr('停在哪 · 谁负责', 'where it stopped · who acts'), OX, RY + CH + 26 + 112);
  css(sum, { font: `800 ${LANG === 'zh' ? 48 : 40}px/1 "Sans SC", "Inter"` });
  wipe(sum, tSum, { dir: 'l', d: 0.4 });
  sfx('chime', tSum, { g: 0.6 });

  const A = { x: 960, y: 474, z: 1.012 };
  camPath(camH, [
    { t: s.start, d: 0.01, a: A, b: A },
    { t: tX, d: 1.0, a: A, b: { x: 960, y: 490, z: 1.0 }, ease: ease.io3 },
    { t: tX + 1.05, d: Math.max(0.5, s.end - tX - 1.05), a: { x: 960, y: 490, z: 1.0 }, b: { x: 960, y: 496, z: 1.025 } },
  ]);
  camH.cam = makeCamera(world, 1920, VH);
});
