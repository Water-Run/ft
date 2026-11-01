// 全片常驻的网络图与「地址」窗口（第 6 轮）。开场建好，之后各场都在这张图上演（config.js 的 after() 让它一直留到片尾名单）。
// 布局：上面「网络」窗口——左边你家的网络（你的电脑、手机、家里的路由器，一条家里的网线），中间三台路由器排在一条主干线上，
// 上方挂着另一个网络，下方挂着隔壁一家（它的地址到 s2 才亮出：也是 192.168.1.10），右边远方的网络（6 台电脑挂在一条网线上）；
// 下面「地址」窗口跟着旁白换内容；顶部：网页加载条（数据包送到时走满）与年表（历史一段收起后停在这里，讲到哪年亮哪格）。
// 数据包只沿连线走、停在路由器上，不从别的设备上穿过。
// 地址取自文档示例网段 192.0.2.0/24、203.0.113.0/24、198.51.100.0/24（RFC 5737）与私有网段 192.168.0.0/16（RFC 1918），画面不出现真实地址。
// 引子（o1–o3）：打开网站，数据包出来，下方随读音填上 203.0.113.80 → 四个数一亮，网上的电脑铺满、各自亮出地址，对上的那台描框
// → 「关于 IPv4」窗口（片名卡，只上画面）：大字 IPv4、100 秒速通、互联网协议；读到「第四版」时排出版本来历——
// 最初的 TCP（1974）、TCP 第 2 版（1977）、第 3 版（1978）、拆出 IP 的第 4 版（1978）。历史一段（s1_history.js）接着在这个窗口里往下排。
const M = {};
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const LY = 440;
  Object.assign(M, { world, LY });

  // ── 两个常驻窗口（网络图的全部内容放在 mapG 里：整窗口大的对话框盖住它时，可以把它整层藏掉）──
  const mapG = h('div', 'abs', world);
  M.mapG = mapG;
  const MW = makeWin(mapG, 60, 112, 1800, 560, tr('网络', 'Network'), { sunken: true });
  const IW = makeWin(world, 60, 690, 1800, 262, tr('地址', 'Address'), { sunken: true });
  vanish(MW.el, 0); vanish(IW.el, 0);
  openWin(MW, 0, [880, 420, 160, 120], { sound: 'drive', g: 0.6 });
  openWin(IW, 0.1, [880, 700, 160, 120], { sfx: false });
  const tIn = 0.25;
  Object.assign(M, { MW, IW });

  // ── 网络方框（标题条可以变藏青、可以补上「前一截」）──
  const zone = (parent, x, y, w, hh, title) => {
    const z = h('div', 'zone', parent); px(z, x, y, w, hh);
    const zt = h('div', 'zt', z, `<span class="zn">${title}</span><span class="zp"></span>`);
    return { el: z, zt, name: zt.firstChild, pre: zt.lastChild, x, y, w, hh };
  };
  const gZHome = h('div', 'abs', mapG), gZFar = h('div', 'abs', mapG);
  const HB = zone(gZHome, 90, 194, 410, 449, tr('你家的网络', 'Your home network'));
  const OB = zone(gZFar, 560, 194, 480, 162, tr('另一个网络', 'Another network'));
  const NB = zone(gZFar, 640, 506, 620, 137, tr('隔壁的网络', 'Next door'));
  const DB = zone(gZFar, 1300, 194, 536, 449, tr('远方的网络', 'A far network'));
  appear(gZHome, tIn);
  Object.assign(M, { HB, OB, NB, DB });

  // ── 连线（在图标下面）──
  const ovHome = overlay(mapG), ovFar = overlay(mapG), ovLit = overlay(mapG);
  const wire = (ov, pts) => path(ov, pathD(pts), 'dgray', { w: 5, arrow: false });
  const P = {
    pc: [198, 292], phone: [177, 504], busTop: [300, 292], busBot: [300, 504], busMid: [300, LY], hr: [420, LY],
    r: [660, 940, 1220].map((x) => [x, LY]), dIn: [1300, LY], cols: [1395, 1565, 1735],
    nr: [995, 585], n1: [850, 585], n2: [1110, 585],
  };
  M.P = P; M.ovLit = ovLit;
  [[P.pc, P.busTop], [P.phone, P.busBot], [P.busTop, P.busBot], [P.busMid, [360, LY]]].forEach((pts) => wire(ovHome, pts));
  appear(ovHome, tIn);
  const farWires = [
    [[480, LY], [1735, LY]],                                    // 主干线：家里的路由器 → 路由器 1、2、3 → 远方网络里的网线
    [[627, 338], [947, 338]], [[627, 320], [627, 338]], [[787, 320], [787, 338]], [[947, 320], [947, 338]], [[660, 338], [660, 421]],
    ...P.cols.map((x) => [[x, 392], [x, LY]]), ...P.cols.map((x) => [[x, LY], [x, 488]]),
    [[998, 458], [998, 572]], [[850, 585], [954, 585]], [[1036, 585], [1110, 585]],   // 隔壁一家：挂在路由器 2 下面
  ].map((pts) => wire(ovFar, pts));

  // ── 设备 ──
  const gHome = h('div', 'abs', mapG), gFar = h('div', 'abs', mapG), gLab = h('div', 'abs', mapG), gNbLab = h('div', 'abs', mapG);
  const pc = pcIcon(gHome, 110, 250, 0.8);
  const phone = phoneIcon(gHome, 132, 466, 0.8);
  const hr = routerIcon(gHome, 360, LY - 54, 0.8);
  txt(gHome, 'name', tr('你的电脑', 'Your computer'), 110, 378);
  txt(gHome, 'name', tr('手机', 'Phone'), 110, 590);
  ctxt(gHome, 'name', tr('路由器', 'Router'), 420, 468);
  appear(gHome, tIn);
  const R = P.r.map(([x]) => routerIcon(gFar, x - 60, LY - 54, 0.8));
  R.forEach((r, i) => ctxt(gFar, 'name', tr('路由器 ', 'Router ') + (i + 1), P.r[i][0], 468));
  const opc = [627, 787, 947].map((cx) => pcIcon(gFar, cx - 27.5, 268, 0.5));
  const nr = routerIcon(gFar, 954, 548, 0.55);
  const n1 = pcIcon(gFar, 800, 560, 0.45), n2 = pcIcon(gFar, 1110, 560, 0.45);
  // 远方网络：上排 3 台、下排 3 台，都挂在主干线延伸进来的网线上；目的地 203.0.113.80 在下排最右
  const DH = { top: [20, 57, 131], bot: [41, 102, 80] };
  const dpc = [];
  P.cols.forEach((cx, i) => { dpc.push({ el: pcIcon(gFar, cx - 33, 330, 0.6), cx, row: 'top', host: DH.top[i] }); });
  P.cols.forEach((cx, i) => { dpc.push({ el: pcIcon(gFar, cx - 33, 488, 0.6), cx, row: 'bot', host: DH.bot[i] }); });
  const target = dpc[dpc.length - 1].el;
  Object.assign(M, { pc, phone, hr, R, target, dpc, nr, n1, n2 });

  // ── 地址标签 ──
  const lab = {};
  lab.pc = addrLab(gLab, '192.168.1.', '10', 154, 342, [HB.x + 12, 290]);
  lab.phone = addrLab(gLab, '192.168.1.', '23', 154, 554, [HB.x + 12, 290]);
  lab.other = [7, 15, 33].map((hst, i) => addrLab(gLab, '192.0.2.', String(hst), [627, 787, 947][i], 238, [OB.x + 8, OB.x + OB.w - 8]));
  lab.dest = dpc.map((d) => addrLab(gLab, '203.0.113.', String(d.host), d.cx, d.row === 'top' ? 298 : 558, [DB.x + 8, DB.x + DB.w - 8]));
  lab.target = lab.dest[lab.dest.length - 1];
  lab.nb = [addrLab(gNbLab, '192.168.1.', '10', 825, 611, [NB.x + 8, NB.x + NB.w - 8]), addrLab(gNbLab, '192.168.1.', '23', 1135, 611, [NB.x + 8, NB.x + NB.w - 8])];
  lab.nb.forEach((l) => css(l.el, { fontSize: '26px', lineHeight: '26px' }));
  M.lab = lab; M.gNbLab = gNbLab;
  const allLabs = [lab.pc, lab.phone, ...lab.other, ...lab.dest];
  M.allLabs = allLabs;

  // ── 顶部：网页加载条 + 年表 ──
  const web = h('div', 'webbar raised', world); px(web, 250, 24, 450, 72);
  h('div', 'wl', web, tr('网页', 'Page'));
  const bar = h('div', 'bar sunken', web); css(bar, { width: '226px' });
  const segs = []; for (let i = 0; i < 10; i++) { const e = h('i', '', bar); px(e, 3 + i * 21.8, 3); css(e, { width: '19px' }); segs.push(e); }
  const ws = h('div', 'ws', web, ''); css(ws, { left: '336px' });
  M.web = { el: web, segs, ws };
  const yr = h('div', 'yearbar raised', world); px(yr, 720, 24, 600, 72);
  const YEARS = ['1981', '1983', '1994', '2011', tr('今天', 'Now')];
  const ybox = YEARS.map((y, i) => { const e = h('div', 'yb sunken', yr, y); px(e, 14 + i * 116, 12, 106, 42); return e; });
  M.year = { el: yr, box: ybox, rect: [720, 24, 600, 72] };

  // ── 地址窗口里的大号地址框：o1 随读音填上 203.0.113.80 ──
  const ilab = txt(world, 'ilab', tr('要去', 'To'), 100, 812);
  const big = bigAddr(world, 230, 778, ['', '', '', '']);
  M.ilab = ilab; M.big = big;
  vanish(ilab, 0); vanish(big.el, 0); appear(ilab, tIn + 0.1); appear(big.el, tIn + 0.1);

  // ── 数据包 ──
  const pk = h('div', 'pk', mapG);
  M.pk = pk;

  // ═══ o1：打开网站，数据靠的是 203.0.113.80 这样的地址 ═══
  const tSite = Q(T('o1', '网站'));
  slide(web, tSite - 0.1, { y: -30, d: 0.35 }); sfx('pop', tSite - 0.1, { g: 0.55, p: 0.1 });
  segs.forEach((e, i) => { vanish(e, 0); if (i < 3) appear(e, tSite + 0.3 + i * 0.2); });
  htmlAt(ws, tSite + 0.2, tr('打开中…', 'Loading…'));
  const tData = Q(T('o1', '数据'));
  M.pkRest = [244, 292];
  M.legs = [[tData, tData + 0.5, [[154, 292], M.pkRest]]];
  M.pkShow = tData;
  sfx('tick', tData, { g: 0.7, p: -0.6 });
  const VALS = [203, 0, 113, 80];
  const tFill = [T('o1', '二零三'), T('o1', '零点') + 0.05, T('o1', '一一'), T('o1', '八零')];
  VALS.forEach((v, i) => {
    const t = Q(tFill[i], 0.05);
    htmlAt(big.cells[i], t, String(v));
    pulse(big.cells[i], t, 1.25, 0.25);
    classOn(big.cells[i], 'hl', t, Q(T('o1', '这样')));
    sfx('key', t, { g: 0.6, p: -0.4 + i * 0.25 });
    gauge(t, tr('要去', 'To'), VALS.map((x, j) => (j <= i ? x : '')));
  });

  // ═══ o2：四个数，就能在网上找到一台电脑 ═══
  const tFour = Q(T('o2', '四'));
  big.cells.forEach((c, i) => classOn(c, 'hl', tFour + i * 0.08, Q(T('o2', '找到'))));
  big.dots.forEach((d) => classOn(d, 'on', tFour, Q(T('o2', '找到'))));
  sfx('blip', tFour, { g: 0.5 });
  const tMany = Q(T('o1', '地址'));            // 读到「这样的地址」时网上的电脑就铺满，名字留够读的时间
  appear(gZFar, tMany);
  farWires.forEach((w_) => { vanish(w_, 0); arrowIn(w_, tMany + 0.05, 0.45); });
  appear(ovFar, tMany);
  appear(gFar, tMany);
  [...R, nr].forEach((r, i) => slam(r, tMany + 0.05 + i * 0.08, { from: 1.4, d: 0.3 }));
  [...opc, n1, n2, ...dpc.map((d) => d.el)].forEach((e, i) => slam(e, tMany + 0.1 + i * 0.04, { from: 1.5, d: 0.3 }));
  sfx('drive', tMany, { g: 0.55, p: 0.2 });
  [0, 1, 2, 3].forEach((i) => sfx('tick', tMany + 0.1 + i * 0.12, { g: 0.45, p: 0.4 }));
  // 各自亮出地址（隔壁一家的到 s2 才亮出），刚出现的一批先反白 0.7 秒
  const tLab = Q(T('o2', '找到'));
  const groups = [[[lab.pc, lab.phone, ...lab.other], tLab], [lab.dest, tLab + 0.2]];
  groups.forEach(([ls, t]) => ls.forEach((l) => { vanish(l.el, 0); appear(l.el, t); classOn(l.pre, 'hl', t, t + 0.7); classOn(l.host, 'hl', t, t + 0.7); }));
  vanish(gNbLab, 0);
  sfx('key', tLab, { g: 0.5 }); sfx('key', tLab + 0.2, { g: 0.5, p: 0.5 });
  const tOne = Q(T('o2', '电脑'));
  classOn(target, 'sel', tOne, T('p1', '地址'));
  classOn(lab.target.el, 'sel', tOne, T('p1', '地址'));
  sfx('chime', tOne, { g: 0.45, p: 0.6 });

  // ═══ o3：「关于 IPv4」窗口（片名卡）+ 版本来历 ═══
  const D = makeWin(world, 60, 112, 1800, 560, tr('关于 IPv4', 'About IPv4'));
  const tOpen = Q(T('o3') - 0.15);
  M.tDOpen = tOpen;
  vanish(D.el, 0);
  openWin(D, tOpen, [230, 778, 760, 96], { sound: 'drive', g: 0.55 });
  const b = D.body;
  const big4 = txt(b, 't-big', 'IPv4', 54, 0); css(big4, { fontSize: '200px' });
  // 片名卡：「100 秒速通」只上画面，读到 IPv4 时落下
  const sub = h('div', 'chip', b, tr('100 秒速通', 'in 100 seconds')); px(sub, 66, 210); css(sub, { fontSize: '44px', padding: '6px 18px 4px' });
  vanish(sub, 0); appear(sub, Q(T('o3', 'IPv4'))); sfx('thud', Q(T('o3', 'IPv4')), { g: 0.6, p: -0.3 });
  // 读到「地址」：这就是开头那串数
  const tAddrW = Q(T('o3', '地址'));
  const aw = txt(b, 't-m', tr('IPv4 地址 = <span class="px">203.0.113.80</span> 这样的四个数', 'IPv4 address = four numbers like <span class="px">203.0.113.80</span>'), 660, 190);
  css(aw, { fontSize: '34px' }); css(aw.querySelector('.px'), { fontSize: '44px', color: 'var(--navy)' });
  vanish(aw, 0); appear(aw, tAddrW); span(aw, 0, T('h1'));
  sfx('tick', tAddrW, { g: 0.5 });
  const ipg = h('div', 'abs', b); px(ipg, 660, 34); ipg.dataset.gloss = 'IP';
  const g1 = txt(ipg, 'lat', 'Internet Protocol', 0, 0); css(g1, { font: '500 44px/1 "Inter"' });
  const g2 = txt(ipg, 't-m', tr('互联网协议 IP：按地址送数据的规则', 'IP: the rules for delivering data by address'), 0, 62); css(g2, { fontSize: '38px' });
  vanish(ipg, 0); appear(ipg, Q(T('o3', '互联网')));
  sfx('tick', Q(T('o3', '互联网')), { g: 0.5 });
  // 版本来历：一行年份格，讲到哪里排到哪里（年份与出处见 research/FACTS.md「版本来历」）
  const NODES = [
    ['1974', tr('最初的 TCP', 'first TCP'), 'RFC 675'],
    ['1977', tr('TCP 第 2 版', 'TCP v2'), 'IEN 5'],
    ['1978', tr('TCP 第 3 版', 'TCP v3'), 'IEN 21'],
    ['1978', tr('拆出 IP · 第 4 版', 'IP split out · v4'), 'IEN 40、41'],
    ['1981', tr('RFC 791 定稿', 'RFC 791 final'), tr('地址 32 位', '32-bit address')],
    ['1983', tr('全面改用', 'switch-over'), tr('1 月 1 日', 'Jan 1')],
    [tr('今天', 'Today'), tr('仍在使用', 'still in use'), ''],
  ];
  const nodes = NODES.map(([y, c, sbt], i) => {
    const e = h('div', 'vnode raised', b); px(e, 22 + i * 250, 300, 236, 150);
    h('div', 'vy', e, y); h('div', 'vc', e, c); const s_ = h('div', 'vs', e, sbt);
    return { el: e, sub: s_ };
  });
  const flow = h('div', 'abs bg-navy', b); px(flow, 22, 460, 1736, 10);
  css(flow, { transformOrigin: '0 50%' });
  M.D = D; M.nodes = nodes; M.flow = flow;
  nodes[3].el.dataset.gloss = 'IPv4';
  const tVer = Q(T('o3', '第四'));
  nodes.forEach((n) => vanish(n.el, 0));
  [0, 1, 2].forEach((i) => { appear(nodes[i].el, tVer - 0.6 + i * 0.2); sfx('key', tVer - 0.6 + i * 0.2, { g: 0.5, p: -0.5 + i * 0.3 }); });
  appear(nodes[3].el, tVer + 0.05);
  classOn(nodes[3].el, 'hl', tVer + 0.05, Infinity);
  sfx('thud', tVer + 0.05, { g: 0.7, p: 0 });
  // 年份格下面的藏青条：走到最新亮出的那一格。关键帧 [起始时刻, 从, 到, 时长]，逐帧算（历史一段接着往里加）
  const flowTo = (k) => (22 + k * 250 + 236 - 22) / 1736;
  M.flowTo = flowTo;
  M.flowK = [[tVer - 0.6, 0, flowTo(3), 0.85]];
  let lastF = '';
  F((t) => {
    let v = 0;
    for (const [t0, a0, a1, d] of M.flowK) if (t >= t0) v = lerp(a0, a1, ease.out3(clamp((t - t0) / d)));
    const k = v.toFixed(4);
    if (k !== lastF) { flow.style.transform = 'scaleX(' + k + ')'; lastF = k; }
  });
});
