// 一次请求走过的检查：镜头在源站里面。一条线缆穿过五道闸（语法 → 凭据 → 权限 → 资源 → 缓存），最后一格「传内容」。
// 主画面：源站的过检线。六个码从一开始就整组挂在各自那道闸下面（F22）；每一次请求沿线缆跑，停在拒绝它的那道闸，闸灯变红、码牌反白，
// 下面的屏换成这一次的实验回显（命令里带的头、回来的状态行与关键的头字段，都取自 research/lab/out_11_status_codes.txt）。
// 源站内部画成一个函数，下一场（谁发的）用同一个函数画一个缩小的副本，镜头从这里拉远，接上整条链路。
const ORIGIN = { W: 1520, H: 460, GX: [60, 320, 580, 840, 1100], GW: 150, CY: 190, EX: 1340 };
function originInside(parent, x, y, k = 1) {
  const g = h('div', 'abs', parent); px(g, x, y, ORIGIN.W, ORIGIN.H);
  if (k !== 1) css(g, { transform: `scale(${k})`, transformOrigin: '0 0' });
  const box = h('div', 'mach', g); px(box, 0, 0, ORIGIN.W, ORIGIN.H); box.dataset.name = tr('源站', 'origin');
  const plate = h('div', 'plate', box, tr('源站 · 存着资源的那台机器', 'Origin · the server holding the resource'));
  css(plate, { height: '60px', fontSize: '34px' });
  const cab = cable(g, 0, ORIGIN.CY, ORIGIN.W);
  const names = [tr('语法', 'syntax'), tr('凭据', 'credentials'), tr('权限', 'permission'), tr('资源', 'resource'), tr('缓存', 'cache')];
  const codes = ['400', '401', '403', '404', '304'];
  const gates = ORIGIN.GX.map((gx, i) => {
    const b = blk(g, 'bg-case', gx, 90, ORIGIN.GW, 230); b.dataset.name = names[i];
    const nm = txt(g, 'ink', names[i], gx, 100); css(nm, { width: ORIGIN.GW + 'px', textAlign: 'center', font: `800 ${LANG === 'zh' ? 38 : 26}px/1.2 "Sans SC", "Inter"` });
    const l = led(g, gx + ORIGIN.GW / 2 - 15, 146, 30);
    const c = chip(g, codes[i], gx + 10, 340, 130, 76, 72);
    return { b, nm, l, c, x: gx };
  });
  // 资源那道闸里存着一页文件
  const page = blk(g, 'bg-case2', ORIGIN.GX[3] + 15, 236, 120, 70); page.dataset.name = tr('文件', 'file');
  for (let i = 0; i < 3; i++) blk(page, 'bg-ink', 14, 14 + i * 18, i === 2 ? 50 : 92, 8);
  const ex = blk(g, 'bg-case', ORIGIN.EX, 90, 160, 230); ex.dataset.name = tr('传内容', 'send');
  const exn = txt(g, 'ink', tr('传内容', 'send'), ORIGIN.EX, 100); css(exn, { width: '160px', textAlign: 'center', font: `800 ${LANG === 'zh' ? 38 : 30}px/1.2 "Sans SC", "Inter"` });
  const c200 = chip(g, '200', ORIGIN.EX + 15, 340, 130, 76, 72);
  return { g, box, plate, cab, gates, page, ex, exn, c200, texts: [plate, ...gates.map((q) => q.nm), exn] };
}

scene('common', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const OX = 320, OY = 150;
  const O = originInside(world, OX, OY);
  // 客户端一侧：左边一小块，请求从这里出发，回来的文件落在这里
  const cli = h('div', 'mach', world); px(cli, 60, OY, 220, 460); cli.dataset.name = tr('客户端', 'client');
  const cp = h('div', 'plate', cli, tr('客户端', 'client')); css(cp, { height: '60px', fontSize: '34px' });
  cable(world, 60, OY + ORIGIN.CY, 260);
  // 屏：这一次的回显
  const scr = screen(world, 60, 624, 1780, 338, tr('回显', 'echo'));
  const LOG = [];

  // ── 六次请求：从哪里停、回什么、屏上显示哪一段回显 ──
  const gx = (i) => OX + ORIGIN.GX[i];                     // 闸的左缘（world）
  const PW = 250, PY = OY + ORIGIN.CY + 15 - 28;
  const hdr = (e, k) => e.head.find((x) => x.startsWith(k));
  const CASES = [
    { req: 'GET /bad', echo: '400', stop: 0, key: (e) => e.body[0], t: T('c2', '400') },
    { req: 'GET /private', echo: '401', stop: 1, key: (e) => hdr(e, 'WWW-Authenticate'), t: T('c2', '401') },
    { req: 'GET /private', tag: 'Authorization', echo: '403b', stop: 2, key: (e) => e.body[0], t: T('c3', '403'), retry: T('c3', { zh: '重试', en: 'retrying' }) },
    { req: 'GET /missing', echo: '404', stop: 3, key: (e) => e.body[0], t: T('c4', '404') },
    { req: 'GET /ok', echo: '200', stop: 5, key: (e) => hdr(e, 'ETag'), t: T('c5', '200') },
    { req: 'GET /ok', tag: 'If-None-Match: "demo-v1"', echo: '304', stop: 4, key: (e) => hdr(e, 'ETag'), t: T('c6', { zh: '有效', en: 'valid' }) },   // 闸在「仍有效」时就答 304：这条回显的命令很长，要多留读的时间
  ];
  const tEnd = s.end - 0.7;                                  // 收尾：屏收走、灯复位，镜头框住源站，接下一场
  const ledEv = O.gates.map(() => []);
  CASES.forEach((cs, i) => {
    const e = E(cs.echo), code = e.status[e.status.length - 1].split(' ')[1];
    const tHit = Q(cs.t - 0.1), nx = CASES[i + 1], tNext = nx ? Q(nx.t - 0.1) - 0.95 : tEnd;
    const xStop = cs.stop < 5 ? gx(cs.stop) - PW - 12 : OX + ORIGIN.EX - 90;
    const t0 = Math.max(s.start + 0.3, tHit - 0.85), x0 = -PW;
    const p = packet(world, cs.req, 0, PY, PW, 56, 30);
    if (cs.tag) { const tg = h('div', 'abs bg-amber ink mono', p, esc(cs.tag)); css(tg, { left: '0px', top: '-46px', fontSize: '28px', fontWeight: 700, padding: '2px 10px' }); }
    appear(p, t0);
    fromTo(p, t0, { x: x0 }, { x: xStop, duration: tHit - t0, ease: 'none', immediateRender: false });
    sfx('blip', t0, { g: 0.45, p: -0.6 });
    // 经过的闸：灯短亮一下（琥珀）
    for (let j = 0; j < Math.min(cs.stop, 5); j++) {
      const tp = t0 + (tHit - t0) * clamp((gx(j) + ORIGIN.GW / 2 - PW - x0) / (xStop - x0));
      ledEv[j].push([tp, tp + 0.3, 'on']);
    }
    // 停下：闸灯变红（200 是走到底，没有闸拦）、码牌反白、屏换成这一次的回显
    if (cs.stop < 5) ledEv[cs.stop].push([tHit, tNext, isErr(code) ? 'eon' : 'on']);
    const chipEl = cs.stop < 5 ? O.gates[cs.stop].c : O.c200;
    lightChip(chipEl, [[tHit, tNext]]);
    meter(tHit, code);
    sfx(isErr(code) ? 'error' : 'beep', tHit, { g: isErr(code) ? 0.6 : 0.6, p: -0.4 + cs.stop * 0.16 });
    const st = e.status[e.status.length - 1];
    LOG.push({ t: tHit, key: cs.echo, extra: cs.key });
    // 请求包带着结果往回走：牌子换成回来的码，退回客户端
    keyed(p).at(tHit + 0.15, { html: '← ' + code, cls: 'chip' + (isErr(code) ? ' e' : '') });
    const tBack = cs.retry ? Q(cs.retry - 0.05) + 0.55 : tHit + 0.55;
    if (cs.retry) {                                        // 原样重试：往回退一点，再撞一次，还是 403
      const tr1 = Q(cs.retry - 0.05);
      fromTo(p, tHit + 0.25, { x: xStop }, { x: xStop - 160, duration: tr1 - tHit - 0.3, ease: 'power2.out', immediateRender: false });
      fromTo(p, tr1, { x: xStop - 160 }, { x: xStop, duration: 0.25, ease: 'power2.in', immediateRender: false });
      sfx('error', tr1 + 0.25, { g: 0.55, p: -0.1 });
      ledEv[cs.stop].push([tr1 + 0.25, tr1 + 0.32, 'off'], [tr1 + 0.32, tNext, 'eon']);
      const x2 = txt(world, 't-4 red', '×2', gx(cs.stop) + ORIGIN.GW + 10, OY + 340 + 14);
      wipe(x2, tr1 + 0.25, { dir: 'l', d: 0.25 }); wipeOut(x2, tNext - 0.3, { dir: 'l', d: 0.25 });
    }
    fromTo(p, tBack, { x: xStop }, { x: x0 + 40, duration: Math.min(0.9, tNext - tBack), ease: 'power2.in', immediateRender: false });
    set(p, tBack + Math.min(0.9, tNext - tBack), { autoAlpha: 0 });
    cs.tHit = tHit; cs.tNext = tNext; cs.p = p;
  });
  // 闸灯：由 t 直接算
  O.gates.forEach((q, j) => {
    let last = null;
    F((t) => { let c = ''; for (const [a, b, v] of ledEv[j]) if (t >= a && t < b) c = v === 'off' ? '' : v; if (c !== last) { q.l.className = 'led' + (c ? ' ' + c : ''); last = c; } });
  });

  // 屏在第一次回显之前：敲出第一条命令
  echoLog(scr, LOG, { slots: [14, 178], sizes: [26, 50, 38] });
  const L0 = addLine(scr, '', 40, 178, 26, 'dim');
  typeText(L0, '<span class="dima">$ </span>' + esc(E('400').cmd), s.start + 0.4, 34, { cursorUntil: CASES[0].tHit - 0.2, sfxGain: 0.5 });
  vanish(L0, CASES[0].tHit);
  // c1：闸名依次刷出，码牌整组落位
  const tIn = Q(T('c1', { zh: '源站', en: 'origin' }) - 0.1), tSteps = Q(T('c1', { zh: '按步', en: 'checks' }) - 0.1);
  O.gates.forEach((q, i) => { wipe(q.nm, tSteps + i * 0.12, { dir: 'l', d: 0.25 }); sfx('tick', tSteps + i * 0.12, { g: 0.45, p: -0.5 + i * 0.25 }); });
  wipe(O.exn, tSteps + 5 * 0.12, { dir: 'l', d: 0.25 });
  [...O.gates.map((q) => q.c), O.c200].forEach((c, i) => slam(c, tIn + 0.1 + i * 0.07, { from: 1.4, d: 0.28 }));
  sfx('drive', tIn + 0.1, { g: 0.5 });

  // c5：200 —— 文件沿线缆回到客户端，成了「副本」
  const c5 = CASES[4];
  const copy = blk(world, 'bg-case2', 110, OY + 236, 120, 70); copy.dataset.name = tr('副本', 'copy');
  for (let i = 0; i < 3; i++) blk(copy, 'bg-ink', 14, 14 + i * 18, i === 2 ? 50 : 92, 8);
  const fromX = OX + ORIGIN.GX[3] + 15 - 110;
  appear(copy, c5.tHit + 0.1);
  fromTo(copy, c5.tHit + 0.1, { x: fromX }, { x: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  sfx('chime', c5.tHit + 0.9, { g: 0.6, p: -0.7 });
  const cpl = txt(world, 'mono ink', 'ETag "demo-v1"', 70, OY + 316); cpl.style.fontSize = '24px';
  wipe(cpl, c5.tHit + 0.9, { dir: 'l', d: 0.3 });
  // c6：304 —— 没有文件回来，客户端用手里的副本
  const c6 = CASES[5];
  const ok = h('div', 'abs', world); px(ok, 102, OY + 228, 136, 86); css(ok, { border: '5px solid ' + C.amber }); ok.dataset.name = tr('副本有效', 'copy valid');
  const okl = txt(world, 'ink', tr('缓存的<br>副本', 'cached<br>copy'), 76, OY + 360); css(okl, { font: `800 ${LANG === 'zh' ? 40 : 34}px/1.15 "Sans SC", "Inter"` });
  const tCache = Q(T('c6', { zh: '缓存', en: 'cache' }) - 0.1);
  wipe(okl, tCache, { dir: 'l', d: 0.3 }); sfx('tick', tCache, { g: 0.5, p: -0.7 });
  const tSave = Q(c6.tHit + 0.2);
  wipe(ok, tSave, { dir: 't', d: 0.3 }); sfx('pop', tSave, { g: 0.6, p: -0.7 });

  // 收尾：屏往下收、客户端一侧的标注收走，镜头框住源站（下一场从这一帧接着拉远）
  wipeOut(scr, tEnd + 0.05, { dir: 'b', d: 0.4 });
  const fz = 1.2, fx = OX + ORIGIN.W / 2, fy = OY + ORIGIN.H / 2;
  cam.track(s.start, { x: 960, y: 520, z: 1 }, [
    [s.start + 0.2, { y: 500, z: 1.0 }, Math.max(0.3, CASES[0].tHit - s.start - 0.4), { ease: 'none', sfx: false }],
    [CASES[0].tHit - 0.1, { y: 486, z: 1.015 }, Math.max(0.5, CASES[3].tHit - CASES[0].tHit - 0.2), { ease: 'none', sfx: false }],
    [CASES[3].tHit - 0.1, { y: 500, z: 1.0 }, Math.max(0.5, CASES[5].tHit - CASES[3].tHit - 0.2), { ease: 'none', sfx: false }],
    [tEnd, { x: fx, y: fy, z: fz }, 0.6, { g: 0.35 }],
  ]);
  window.ORIGIN_END = { t: s.end, x: fx, y: fy, z: fz, ox: OX, oy: OY };
});
