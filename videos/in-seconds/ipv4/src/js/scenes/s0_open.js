// 全片常驻的网络图与「地址」窗口（第 5 轮重做）。开场建好，之后各场都在这张图上演（config.js 的 after() 让它一直留到片尾名单）。
// 布局：上面「网络」窗口——左边你家的网络（你的电脑、手机、家里的路由器，一条家里的网线），中间三台路由器排在一条主干线上，
// 上方挂着另一个网络，右边远方的网络（6 台电脑挂在一条网线上）；下面「地址」窗口跟着旁白换内容；顶部中间一条网页加载条，数据包送到时走满。
// 数据包只沿连线走、停在路由器上，不从别的设备上穿过（策划者看第一版成片：「线不要直接穿过去」）。
// 地址取自文档示例网段 192.0.2.0/24、203.0.113.0/24、198.51.100.0/24（RFC 5737）与私有网段 192.168.0.0/16（RFC 1918），画面不出现真实地址。
// 开场（o1–o2）：打开网站 → 数据包从你的电脑出来，远方一台电脑亮出 → 网上的电脑一下子铺满 → 数据包与下方的地址框打上问号。
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
  openWin(IW, 0.15, [880, 700, 160, 120], { sfx: false });
  const tIn = 0.25;
  Object.assign(M, { MW, IW });

  // ── 网络方框（标题条可以变藏青、可以补上「前一截」）──
  const zone = (parent, x, y, w, hh, title) => {
    const z = h('div', 'zone', parent); px(z, x, y, w, hh);
    const zt = h('div', 'zt', z, `<span class="zn">${title}</span><span class="zp"></span>`);
    return { el: z, zt, name: zt.firstChild, pre: zt.lastChild, x, y, w, hh };
  };
  const gZHome = h('div', 'abs', mapG), gZFar = h('div', 'abs', mapG), gZDest = h('div', 'abs', mapG);
  const HB = zone(gZHome, 90, 194, 410, 449, tr('你家的网络', 'Your home network'));
  const OB = zone(gZFar, 560, 194, 480, 162, tr('另一个网络', 'Another network'));
  const DB = zone(gZDest, 1300, 194, 536, 449, tr('远方的网络', 'A far network'));
  appear(gZHome, tIn);
  Object.assign(M, { HB, OB, DB });

  // ── 连线（在图标下面）──
  const ovHome = overlay(mapG), ovFar = overlay(mapG), ovLit = overlay(mapG);
  const wire = (ov, pts) => path(ov, pathD(pts), 'dgray', { w: 5, arrow: false });
  const P = {
    pc: [198, 292], phone: [177, 504], busTop: [300, 292], busBot: [300, 504], busMid: [300, LY], hr: [420, LY],
    r: [660, 940, 1220].map((x) => [x, LY]), dIn: [1300, LY], cols: [1395, 1565, 1735],
  };
  M.P = P; M.ovLit = ovLit;
  [[P.pc, P.busTop], [P.phone, P.busBot], [P.busTop, P.busBot], [P.busMid, [360, LY]]].forEach((pts) => wire(ovHome, pts));
  appear(ovHome, tIn);
  const farWires = [
    [[480, LY], [1735, LY]],                                    // 主干线：家里的路由器 → 路由器 1、2、3 → 远方网络里的网线
    [[627, 338], [947, 338]], [[627, 320], [627, 338]], [[787, 320], [787, 338]], [[947, 320], [947, 338]], [[660, 338], [660, 421]],
    ...P.cols.map((x) => [[x, 392], [x, LY]]), ...P.cols.map((x) => [[x, LY], [x, 488]]),
  ].map((pts) => wire(ovFar, pts));

  // ── 设备 ──
  const gHome = h('div', 'abs', mapG), gTarget = h('div', 'abs', mapG), gFar = h('div', 'abs', mapG), gLab = h('div', 'abs', mapG);
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
  // 远方网络：上排 3 台、下排 3 台，都挂在主干线延伸进来的网线上；目的地 203.0.113.80 在下排最右
  const DH = { top: [20, 57, 131], bot: [41, 102, 80] };
  const dpc = [];
  P.cols.forEach((cx, i) => { dpc.push({ el: pcIcon(gFar, cx - 33, 330, 0.6), cx, row: 'top', host: DH.top[i] }); });
  P.cols.forEach((cx, i) => { if (i < 2) dpc.push({ el: pcIcon(gFar, cx - 33, 488, 0.6), cx, row: 'bot', host: DH.bot[i] }); });
  const target = pcIcon(gTarget, P.cols[2] - 33, 488, 0.6);
  dpc.push({ el: target, cx: P.cols[2], row: 'bot', host: 80 });
  Object.assign(M, { pc, phone, hr, R, target, dpc });

  // ── 地址标签（a1 时打出）──
  const lab = {};
  lab.pc = addrLab(gLab, '192.168.1.', '10', 154, 342, [HB.x + 12, BUS_RIGHT(HB)]);
  lab.phone = addrLab(gLab, '192.168.1.', '23', 154, 554, [HB.x + 12, BUS_RIGHT(HB)]);
  lab.other = [7, 15, 33].map((hst, i) => addrLab(gLab, '192.0.2.', String(hst), [627, 787, 947][i], 238, [OB.x + 8, OB.x + OB.w - 8]));
  lab.dest = dpc.map((d) => addrLab(gLab, '203.0.113.', String(d.host), d.cx, d.row === 'top' ? 298 : 558, [DB.x + 8, DB.x + DB.w - 8]));
  lab.target = lab.dest[lab.dest.length - 1];
  M.lab = lab;
  const allLabs = [lab.pc, lab.phone, ...lab.other, ...lab.dest];
  M.allLabs = allLabs;

  // ── 顶部的网页加载条 ──
  const web = h('div', 'webbar raised', world); px(web, 600, 24, 720, 72);
  h('div', 'wl', web, tr('网页', 'Page'));
  const bar = h('div', 'bar sunken', web);
  const segs = []; for (let i = 0; i < 16; i++) { const e = h('i', '', bar); px(e, 3 + i * 27, 3); segs.push(e); }
  const ws = h('div', 'ws', web, '');
  M.web = { el: web, segs, ws };

  // ── 地址窗口里的大号地址框：先是问号，a2 填上 203.0.113.80 ──
  const ilab = txt(world, 'ilab', tr('要去', 'To'), 100, 812);
  const big = bigAddr(world, 230, 778, ['', '', '', '']);
  M.ilab = ilab; M.big = big;

  // ── 数据包 ──
  const pk = h('div', 'pk', mapG);
  M.pk = pk;

  // ═══ o1：打开网站 → 数据包出来 → 远方一台电脑 ═══
  const tSite = Q(T('o1', '网站'));
  slide(web, tSite - 0.1, { y: -30, d: 0.35 }); sfx('pop', tSite - 0.1, { g: 0.55, p: 0.1 });
  segs.forEach((e, i) => { vanish(e, 0); if (i < 5) appear(e, tSite + 0.3 + i * 0.18); });
  htmlAt(ws, tSite + 0.2, tr('打开中…', 'Loading…'));

  const tData = Q(T('o1', '数据'));
  // 数据包从电脑里出来，停在电脑与家里网线之间
  M.pkRest = [244, 292];
  sfx('tick', tData, { g: 0.7, p: -0.6 });
  const tFar = Q(T('o1', '远方'));
  slam(gTarget, tFar, { from: 1.5, d: 0.4 }); sfx('thud', tFar, { g: 0.75, p: 0.7 });
  appear(gZDest, tFar);
  css(gTarget, { transformOrigin: `${P.cols[2]}px 520px` });

  // ═══ o2：网上的电脑那么多 → 去哪一台？ ═══
  const tMany = Q(T('o2', '网上'));
  appear(gZFar, tMany);
  farWires.forEach((w_) => { vanish(w_, 0); arrowIn(w_, tMany + 0.05, 0.5); });
  appear(ovFar, tMany);
  appear(gFar, tMany);
  R.forEach((r, i) => slam(r, tMany + 0.1 + i * 0.12, { from: 1.4, d: 0.35 }));
  [...opc, ...dpc.slice(0, -1).map((d) => d.el)].forEach((e, i) => slam(e, tMany + 0.2 + i * 0.06, { from: 1.5, d: 0.3 }));
  sfx('drive', tMany, { g: 0.55, p: 0.2 });
  [0, 1, 2, 3, 4].forEach((i) => sfx('tick', tMany + 0.2 + i * 0.12, { g: 0.45, p: 0.4 }));

  const tWhich = Q(T('o2', '哪'));
  const q = h('div', 'chip', mapG, '?'); css(q, { fontSize: '34px', padding: '2px 12px 0' }); px(q, 226, 234);
  slam(q, tWhich, { from: 1.8, d: 0.35 }); sfx('blip', tWhich, { g: 0.6, p: -0.5 });
  M.q = q;
  // 地址窗口：远方那台电脑出现时先摆出「要去」和四个空格，问到「哪一台」时填上问号
  vanish(ilab, 0); vanish(big.el, 0);
  appear(ilab, tFar); appear(big.el, tFar);
  css(big.el, { transformOrigin: '0% 50%' });
  big.cells.forEach((c, i) => { htmlAt(c, tWhich + i * 0.08, '?'); pulse(c, tWhich + i * 0.08, 1.3, 0.3); });
  // 去哪一台：所有候选的电脑一起描上框，读到「靠地址」时放下
  [...opc, ...dpc.map((d) => d.el)].forEach((e) => classOn(e, 'sel', tWhich, T('a1', '靠')));
  gauge(tWhich, tr('要去', 'To'), ['?', '?', '?', '?']);
  // 问句说完、答案出来之前，四个问号格反白一下：「要去」的地址还不知道
  big.cells.forEach((c, i) => classOn(c, 'hl', Q(Tend('o2') + 0.9) + i * 0.06, T('a1', '靠')));
  sfx('blip', Q(Tend('o2') + 0.9), { g: 0.45, p: 0.3 });

  // 数据包：o1 从电脑出来，停在一旁；之后的路程由各场登记（M.legs），最后在 route 场统一生成
  M.legs = [[tData, tData + 0.5, [[154, 292], M.pkRest]]];
  M.pkShow = tData;
});
// 你家方框里，家里的网线（x = 300）左边可以放标签的范围
function BUS_RIGHT() { return 290; }
