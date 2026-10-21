// 谁发的：镜头从源站里面拉远，源站原来只是一条链路的最后一台：客户端 → 网关（代理）→ 限流层 → 源站。
// 主画面：这条链路。每个码从发出它的那台机器里冒出来，沿线缆回到客户端——从哪一台出来，就是谁发的（F20：位置即发出方）。
// 回显都取自实验：500、429 来自源站端口；经网关的 404 多了网关自己的标记头 X-Gateway，码不变；502（上游连不上）、504（上游 1 秒没回）由网关发出。
const CHAIN = { cli: [60, 300], gw: [470, 380], lim: [950, 130], OX: 1100, OY: 170, k: 0.5 };
CHAIN.MH = ORIGIN.H * CHAIN.k;                             // 机器的高度：与缩小后的源站一样高
CHAIN.CY = CHAIN.OY + ORIGIN.CY * CHAIN.k;                 // 线缆的高度
const LOG_OPT = { slots: [14, 176], sizes: [26, 50, 38] };
function chainMachines(world) {
  const { OX, OY, k, MH } = CHAIN;
  const cab = cable(world, CHAIN.cli[0], CHAIN.CY, OX - CHAIN.cli[0], { name: tr('链路', 'chain') });
  const mk = (x, w, name) => machine(world, x, OY, w, MH, name, { plateH: 50, fs: 32 });
  const cli = mk(CHAIN.cli[0], CHAIN.cli[1], tr('客户端', 'client'));
  const gw = mk(CHAIN.gw[0], CHAIN.gw[1], tr('网关 · 代理', 'gateway · proxy'));
  const lim = mk(CHAIN.lim[0], CHAIN.lim[1], tr('限流', 'limiter'));
  const O = originInside(world, OX, OY, k);
  const oplate = blk(world, 'bg-ink', OX, OY, ORIGIN.W * k, 50); oplate.dataset.name = tr('源站', 'origin');
  const opl = txt(oplate, 'case', tr('源站', 'origin'), 22, 0); css(opl, { font: '700 32px/50px "Sans SC", "Inter"' });
  return { cab, cli, gw, lim, O, oplate, opl };
}
// 镜头：在 [t0, t0 + d] 内从 A 机位移到 B 机位，缩放按指数走、锚点在画面上匀速移动（拉远时不往反方向漂）
function camPath(holder, segs) {
  F((t) => {
    if (!holder.cam) return;
    let st = segs[0].a;
    for (const g of segs) {
      if (t < g.t) break;
      const k = g.ease ? g.ease(clamp((t - g.t) / g.d)) : clamp((t - g.t) / g.d);
      const z = g.a.z * Math.pow(g.b.z / g.a.z, k);
      // 画面中心在 A、B 两个机位之间：先求两者各自把哪一点放在画面中心，再按缩放的对数插值
      const w = Math.abs(Math.log(g.b.z / g.a.z)) < 1e-6 ? k : (1 / z - 1 / g.a.z) / (1 / g.b.z - 1 / g.a.z);
      st = { x: lerp(g.a.x, g.b.x, w), y: lerp(g.a.y, g.b.y, w), z };
    }
    Object.assign(holder.cam.st, st);
  });
}

scene('who', ({ root, s }) => {
  const world = h('div', 'world', root);
  const camH = {};
  const M = chainMachines(world);
  const { OX, OY, k, MH } = CHAIN;
  // 机内的读数：客户端收到的码；网关加的标记头与等上游的计时条；限流层的计数格
  const got = txt(world, 'px amber', '', CHAIN.cli[0] + 24, OY + 80); css(got, { fontSize: '120px', lineHeight: '0.8', background: C.ink, padding: '6px 14px 0', minWidth: '210px', height: '106px' });
  got.dataset.name = tr('收到的码', 'received code');
  const gotK = keyed(got);
  const xg = txt(world, 'mono ink', 'X-Gateway: demo-gateway', CHAIN.gw[0] + 18, OY + 72); css(xg, { fontSize: '24px', fontWeight: 700 });
  const timer = blk(world, 'bg-ink', CHAIN.gw[0] + 18, OY + 150, 280, 26), tfill = blk(world, 'bg-red', CHAIN.gw[0] + 18, OY + 150, 280, 26);
  timer.dataset.name = tr('等上游', 'waiting'); tfill.dataset.name = 'timer';
  const tlab = txt(world, 'mono ink', '1 s', CHAIN.gw[0] + 310, OY + 144); tlab.style.fontSize = '30px';
  const bars = [0, 1, 2, 3, 4].map((i) => blk(world, 'bg-ink', CHAIN.lim[0] + 20, OY + 196 - i * 28, 90, 16));
  const bfill = bars.map((b, i) => blk(world, 'bg-red', CHAIN.lim[0] + 20, OY + 196 - i * 28, 90, 16));
  // 屏：这一次的回显
  const scr = screen(world, 60, 574, 1800, 340, tr('回显', 'echo'));
  const WLOG = [], showEcho = (t, key, extra) => WLOG.push({ t, key, extra });
  const hdr = (k_) => (e) => e.head.find((x) => x.startsWith(k_));

  // 请求包往右走、回来的码往左走。返回到达的时刻
  const PW = 210, PY = CHAIN.CY + 15 - 25;
  const goRight = (label, t0, xTo, d = 0.5) => {
    const p = packet(world, label, 0, PY, PW, 50, 26);
    appear(p, t0); fromTo(p, t0, { x: CHAIN.cli[0] + CHAIN.cli[1] - PW }, { x: xTo - PW - 6, duration: d, ease: 'power1.inOut', immediateRender: false });
    sfx('blip', t0, { g: 0.4, p: -0.7 });
    return p;
  };
  const back = (code, xFrom, t0, tArrive, o = {}) => {
    const c = chip(world, code, 0, PY - 8, 150, 66, 62);
    appear(c, t0);
    fromTo(c, t0, { x: xFrom }, { x: CHAIN.cli[0] + CHAIN.cli[1] - 150, duration: tArrive - t0, ease: 'power2.inOut', immediateRender: false });
    set(c, tArrive + 0.15, { autoAlpha: 0 });
    gotK.at(tArrive, { html: code, cls: 'abs px ' + (isErr(code) ? 'red' : 'amber') });
    sfx('error', tArrive, { g: 0.55, p: -0.7 });
    meter(tArrive, code);
    return c;
  };

  // ── u1：源站崩了 → 源站发 500 ──
  const tA0 = Q(T('u1') + 0.1), tCrash = Q(Math.max(tA0 + 0.75, T('u1', { zh: '崩', en: 'crashes' }) - 0.1));
  const pA = goRight('GET /boom', tA0, OX, tCrash - tA0); set(pA, tCrash, { autoAlpha: 0 });
  classAt(M.oplate, 'bg-red', tCrash, tCrash + 1.3);
  sfx('thud', tCrash, { g: 0.6, p: 0.7 });
  const tA1 = Q(Math.max(tCrash + 0.7, T('u1', '500') - 0.1));
  back('500', OX - 150, tCrash + 0.15, tA1);
  showEcho(tA1, '500');

  // ── u2：刷得太密 → 限流层发 429 ──
  const tB0 = Q(T('u2') + 0.05), tB1 = Q(Math.max(tB0 + 1.5, T('u2', '429') - 0.1));
  for (let i = 0; i < 5; i++) {
    const ti = tB0 + i * 0.22, p = goRight('GET /limited', ti, CHAIN.lim[0], 0.55 - i * 0.03);
    const ta = ti + 0.55 - i * 0.03;
    fromTo(p, ta, { y: 0 }, { y: -i * 14, duration: 0.15, immediateRender: false });
    appear(bfill[i], ta); sfx('tick', ta, { g: 0.4 + i * 0.05, p: 0.1 });
    exit(p, tB1 + 0.1 + i * 0.04, { x: -120, y: 0, d: 0.3 });
  }
  const tLimOff = tB1 + 1.4;
  bfill.forEach((b) => vanish(b, tLimOff));
  classAt(M.lim.plate, 'bg-red', tB1, tB1 + 1.2);
  back('429', CHAIN.lim[0] - 150, tB1, tB1 + 0.7);
  showEcho(tB1 + 0.7, '429', hdr('Retry-After'));

  // ── u3：经网关的 404 —— 网关加上自己的标记头，码不改 ──
  const tC0 = Q(Math.max(tLimOff - 0.2, T('u3') + 0.05));
  const tC1 = Q(Math.max(tC0 + 0.9, T('u3', { zh: '不改', en: 'forwards' }) - 0.6));
  const pC = goRight('GET /missing', tC0, OX, tC1 - tC0); set(pC, tC1, { autoAlpha: 0 });
  const c404 = chip(world, '404', 0, PY - 8, 150, 66, 62);
  const tGw = tC1 + 0.55, tC2 = Q(Math.max(tGw + 0.9, T('u3', { zh: '码', en: 'codes' })));
  appear(c404, tC1);
  fromTo(c404, tC1, { x: OX - 150 }, { x: CHAIN.gw[0] + CHAIN.gw[1] - 150, duration: tGw - tC1, ease: 'power2.out', immediateRender: false });
  fromTo(c404, tGw + 0.45, { x: CHAIN.gw[0] + CHAIN.gw[1] - 150 }, { x: CHAIN.cli[0] + CHAIN.cli[1] - 150, duration: tC2 - tGw - 0.45, ease: 'power2.inOut', immediateRender: false });
  set(c404, tC2 + 0.15, { autoAlpha: 0 });
  // 盖章：标记头贴到码牌上，跟着它走
  const stamp = h('div', 'abs bg-amber ink mono', c404, 'X-Gateway'); css(stamp, { left: '0px', top: '-44px', fontSize: '26px', fontWeight: 700, padding: '2px 8px' });
  appear(stamp, tGw); sfx('pop', tGw, { g: 0.7, p: -0.1 });
  classAt(xg, 'lit-t', tGw, tGw + 1.6);
  gotK.at(tC2, { html: '404', cls: 'abs px red' }); meter(tC2, '404'); sfx('error', tC2, { g: 0.5, p: -0.7 });
  showEcho(tGw, '404b', hdr('X-Gateway'));
  const same = txt(world, 't-4 ink', tr('码不改', 'same code'), CHAIN.gw[0], OY + MH + 26);
  wipe(same, tGw + 0.1, { dir: 'l', d: 0.3 });

  // ── u4：上游连不上 → 网关发 502；上游太慢 → 网关等满 1 秒发 504 ──
  const tD0 = Q(Math.max(tC2 + 0.3, T('u4', { zh: '无效', en: 'bad' }) - 0.9));
  const cut = blk(world, 'bg-red', CHAIN.gw[0] + CHAIN.gw[1] + 40, CHAIN.CY - 14, 60, 58); cut.dataset.name = tr('断开', 'cut');
  const cutx = txt(world, 't-3 ink', '×', CHAIN.gw[0] + CHAIN.gw[1] + 52, CHAIN.CY - 22);
  appear(cut, tD0); appear(cutx, tD0); sfx('error', tD0, { g: 0.45, p: 0.2 });
  const tD1 = tD0 + 0.5, pD = goRight('GET /dead', tD0 + 0.05, CHAIN.gw[0] + CHAIN.gw[1], 0.45);
  const tD2 = Q(Math.max(tD1 + 0.25, T('u4', '502') - 0.05));
  set(pD, tD2, { autoAlpha: 0 });
  wipeOut(same, tD2, { dir: 'l', d: 0.25 });
  back('502', CHAIN.gw[0] + CHAIN.gw[1] - 150, tD2, tD2 + 0.55);
  showEcho(tD2 + 0.55, '502');
  const tFix = tD2 + 0.3;
  vanish(cut, tFix); vanish(cutx, tFix);
  const tE0 = Math.max(tFix + 0.05, T('u4', { zh: '超时', en: 'timeout' }) - 1.6), tE1 = tE0 + 0.4;
  const pE = goRight('GET /slow', tE0, OX, 0.4); set(pE, tE1 + 0.05, { autoAlpha: 0 });
  const tE2 = Math.max(tE1 + 1.0, T('u4', '504') - 0.05);
  fromTo(tfill, tE1, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: tE2 - tE1, ease: 'none' });
  for (let i = 0; i < 4; i++) sfx('tick', tE1 + (tE2 - tE1) * (i / 4), { g: 0.35, p: -0.1 });
  classSpans(M.gw.plate, 'bg-red', [[tD2, tD2 + 0.9], [tE2, tE2 + 1.0]]);
  back('504', CHAIN.gw[0] + CHAIN.gw[1] - 150, tE2, tE2 + 0.45);
  showEcho(tE2 + 0.2, '504');
  vanish(tfill, s.end - 0.05);

  // 屏在第一次回显之前就位；镜头：从源站里面拉远到整条链路，之后极慢地推近
  wipe(scr, s.start + 1.1, { dir: 't', d: 0.45 });
  echoLog(scr, WLOG, LOG_OPT);
  addLine(scr, '<span class="dima">$ </span>' + esc(E('500').cmd), 40, LOG_OPT.slots[1], LOG_OPT.sizes[0], 'dim');
  vanish(scr.lastChild, tA1);
  for (const e of M.O.texts) vanish(e, s.start + 1.0);
  wipe(M.oplate, s.start + 0.95, { dir: 'l', d: 0.3 });
  const A = { x: OX + (ORIGIN.W / 2) * k, y: OY + (ORIGIN.H / 2) * k, z: 1.2 / k }, B = { x: 960, y: 470, z: 1 };
  camPath(camH, [
    { t: s.start, d: 0.01, a: A, b: A },
    { t: s.start + 0.05, d: 1.0, a: A, b: B, ease: ease.io3 },
    { t: s.start + 1.15, d: s.end - s.start - 1.15, a: B, b: { x: 960, y: 474, z: 1.012 } },
  ]);
  camH.cam = makeCamera(world, 1920, VH);                // 帧函数先登记：镜头的位置在同一帧里先算好，再由 makeCamera 套用
  sfx('whoosh', s.start + 0.1, { g: 0.5 });
});
