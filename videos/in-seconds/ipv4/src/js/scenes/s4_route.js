// 一站站送（r1–r4）。下方地址窗口改成两行比较：上行「要去」，下行「你的电脑」。
// r1 同网：要去手机 192.168.1.23，两行的前一截一起反白、相同 → 一个白色小数据包沿家里的网线直接到手机，不经过路由器。
// r2 不同网：上行换回 203.0.113.80，前一截不同 → 数据包沿网线交给家里的路由器（注解：路由器）。
// r3 数据包沿主干线一站站走过路由器 1、2、3；地址窗口右边一份查表记录，每到一台添一行「203.0.113 → 下一站」，三行留到这一段结束。
// r4 进了远方的网络，数据包沿网线逐台停一下、对后一截：20、41、57、102、131 变灰，80 对上 → 进到那台电脑，它亮起，顶部网页走满「已打开」。
scene('route', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { P, LY, lab, pk, ovLit, hr, R, phone, target, web, DB } = M;
  const tR1 = M.tSwitch, tS1 = T('s1');

  // ── 地址窗口：两行比较 ──
  const la = txt(world, 'ilab', tr('要去', 'To'), 100, 776);
  const lb = txt(world, 'ilab', tr('你的电脑', 'You'), 100, 870);
  const A = bigAddr(world, 260, 762, [192, 168, 1, 23], { small: true });
  const B = bigAddr(world, 260, 856, [192, 168, 1, 10], { small: true });
  [la, A.el].forEach((e) => { vanish(e, 0); appear(e, tR1); span(e, 0, tS1); });
  zoomFx(tR1 - 0.25, [100, 752, 1260, 120], [260, 762, 494, 154], 0.25);
  [lb, B.el].forEach((e) => { vanish(e, 0); slide(e, tR1 + 0.15, { y: 30, d: 0.4 }); span(e, 0, T('r3')); });
  gauge(tR1, tr('要去', 'To'), [192, 168, 1, 23]);
  classOn(lab.phone.el, 'sel', tR1, T('r2', '不同'));
  classOn(phone, 'sel', tR1, T('r2', '不同'));
  sfx('pop', tR1, { g: 0.5 });

  // r1：先看前一截
  const tCmp = Q(T('r1', '前'));
  B.cells.slice(0, 3).forEach((c, i) => classOn(c, 'hl', tCmp + i * 0.06, T('r3')));   // 上行（A）的前一截反白到 r4「到了」，见下
  sfx('blip', tCmp, { g: 0.55 });
  const vEq = h('div', 'chip', world, tr('= 同一个网络', '= same network')); px(vEq, 800, 812);
  vanish(vEq, 0); slam(vEq, Q(T('r1', '同')) - 0.25, { from: 1.3, d: 0.3 }); span(vEq, 0, T('r2', '不同'));
  sfx('tick', Q(T('r1', '同')), { g: 0.6, p: 0.3 });
  // 直接送过去：白色小数据包 电脑 → 家里的网线 → 手机
  const tGo = Q(T('r1', '直接'));
  const ppk = h('div', 'pk light', world);
  const phPath = [[154, 292], P.pc, P.busTop, P.busBot, P.phone, [154, 504]];
  glide(ppk, [[tGo, tGo + 0.95, phPath]], tGo, tGo + 1.05);
  litPath(ovLit, phPath.slice(1, -1), tGo + 0.05, tGo + 0.85, T('r2', '不同'));
  classOn(phone, 'hot', tGo + 1.0, T('r2', '不同'));
  classOn(M.HB.el, 'on', tGo, T('r3'));            // 送的路程都在你家的网络里
  sfx('whoosh', tGo, { g: 0.4 }); sfx('chime', tGo + 1.0, { g: 0.45, p: -0.5 });

  // r2：不是同一个网络 → 交给家里的路由器
  const tNo = Q(T('r2', '不同'));
  [203, 0, 113, 80].forEach((v, i) => htmlAt(A.cells[i], tNo, String(v)));
  pulse(A.el, tNo); css(A.el, { transformOrigin: '0% 50%' });
  gauge(tNo, tr('要去', 'To'), [203, 0, 113, 80]);
  const vNe = h('div', 'chip', world, tr('≠ 不在同一个网络', '≠ another network')); px(vNe, 800, 812);
  vanish(vNe, 0); slam(vNe, tNo + 0.15, { from: 1.3, d: 0.3 }); span(vNe, 0, Q(T('r3', '按')) - 0.05);
  sfx('error', tNo + 0.15, { g: 0.35 });
  const tHand = Q(T('r2', '交给'));
  const legs = M.legs;
  const toHr = [M.pkRest, P.busTop, P.busMid, P.hr];
  legs.push([tHand, tHand + 0.85, toHr]);
  litPath(ovLit, toHr, tHand, tHand + 0.85, tS1);
  classOn(hr, 'hot', tHand + 0.85, T('r3', '路由'));
  sfx('whoosh', tHand, { g: 0.4 }); sfx('tick', tHand + 0.85, { g: 0.6 });
  const gR = txt(world, 'inote', tr('<b>路由器</b>：转交给下一站', '<b>Router</b>: hands it to the next stop'), 800, 870);
  gR.dataset.gloss = '路由器';
  vanish(gR, 0); appear(gR, Q(T('r2', '交给'))); span(gR, 0, Q(T('r3', '查表')) - 0.2);

  // ── r3：一站站往前送，每台路由器按前一截查表 ──
  const tH1 = Q(T('r3', '路由')), tH2 = Q(T('r3', '一站')), tH3 = Q(T('r3', '往前'));
  const hops = [[tH1, P.hr, P.r[0]], [tH2, P.r[0], P.r[1]], [tH3, P.r[1], P.r[2]]];
  hops.forEach(([t, a, b], i) => {
    legs.push([t, t + 0.55, [a, b]]);
    litPath(ovLit, [a, b], t, t + 0.55, tS1);
    classOn(R[i], 'hot', t + 0.55, i < 2 ? hops[i + 1][0] : T('r4', '到了') + 0.3);
    sfx('whoosh', t, { g: 0.35, p: -0.2 + i * 0.3 }); sfx('tick', t + 0.55, { g: 0.6, p: -0.2 + i * 0.3 });
  });
  // 查表记录：地址窗口右边，每到一台路由器就添一行它查到的结果（按前一截 203.0.113 查出下一站），三行留到这一段结束，读得完
  const tb = h('div', 'tbl sunken', world); px(tb, 1000, 758, 840, 178);
  h('div', 'th', tb, tr('每台路由器查表：只看前一截', 'Each router looks up the first part'));
  const tTab = Q(T('r3', '查表'));
  const tabT = [tTab, tH2 + 0.55, tH3 + 0.55];
  const HOPS = [tr('路由器 2', 'Router 2'), tr('路由器 3', 'Router 3'), tr('送进本网', 'its own network')];
  const tbEnd = Q(Tend('r4')) + 0.7;
  HOPS.forEach((nx, i) => {
    const r = h('div', 'tr', tb, `${tr('路由器 ', 'Router ')}${i + 1}：<span class="px">203.0.113</span>→ ${tr('下一站：', 'next: ')}${nx}`);
    px(r, 6, 42 + i * 44); css(r, { height: '42px', lineHeight: '42px', fontSize: '28px' });
    vanish(r, 0); appear(r, tabT[i]);
    classOn(r, 'hl', tabT[i], i < 2 ? tabT[i + 1] : Q(T('r4', '后')));
    sfx('key', tabT[i], { g: 0.5, p: -0.3 + i * 0.3 });
  });
  vanish(tb, 0); wipe(tb, tTab - 0.15, { dir: 't', d: 0.35 }); span(tb, 0, tbEnd);
  sfx('pop', tTab - 0.15, { g: 0.45 });

  // ── r4：到了那个网络，再按后一截找到那一台 ──
  const tIn = Q(T('r4', '到了'));
  legs.push([tIn, tIn + 0.45, [P.r[2], [1340, LY]]]);
  litPath(ovLit, [P.r[2], [1340, LY]], tIn, tIn + 0.45, tS1);
  classOn(DB.el, 'on', tIn, tS1);
  A.cells.slice(0, 3).forEach((c) => classOn(c, 'hl', tCmp, tIn));          // 上行的前一截在「到了」时放下
  const tHost = Q(T('r4', '后'));
  classOn(A.cells[3], 'hl', tHost, tS1);
  sfx('blip', tHost, { g: 0.5 });
  // 沿网线逐台停一下：前两列都不对，第三列下面那台是 80
  const stops = [[1340, P.cols[0]], [P.cols[0], P.cols[1]], [P.cols[1], P.cols[2]]];
  const dl = M.lab.dest;          // 顺序：上排 20、57、131；下排 41、102；最后是目的地 80
  const colLabs = [[dl[0], dl[3]], [dl[1], dl[4]], [dl[2]]];
  let t = tHost;
  stops.forEach(([a, b], i) => {
    legs.push([t, t + 0.3, [[a, LY], [b, LY]]]);
    litPath(ovLit, [[a, LY], [b, LY]], t, t + 0.3, tS1);
    colLabs[i].forEach((l) => classOn(l.host, 'out', t + 0.32, tS1));
    sfx('tick', t + 0.32, { g: 0.5, p: 0.2 + i * 0.25 });
    t += 0.45;
  });
  const tFound = t - 0.1;
  classOn(lab.target.host, 'hl', tFound, tS1);
  classOn(lab.target.el, 'sel', tFound, tS1);
  const down = [[P.cols[2], LY], [P.cols[2], 519]];
  legs.push([tFound + 0.15, tFound + 0.5, down]);
  litPath(ovLit, [[P.cols[2], LY], [P.cols[2], 488]], tFound + 0.15, tFound + 0.4, tS1);
  const tArr = tFound + 0.5;
  classOn(target, 'hot', tArr, tS1);
  sfx('chime', tArr, { g: 0.6, p: 0.6 });
  // 网页走满
  web.segs.forEach((e, i) => { if (i >= 3) appear(e, tArr + 0.1 + (i - 3) * 0.06); });
  htmlAt(web.ws, tArr + 0.7, tr('已打开', 'Loaded'));
  sfx('chime', tArr + 0.7, { g: 0.4, p: 0.1 });

  // 主数据包：所有路段登记完，一次生成；进到目的电脑后消失
  glide(pk, legs, M.pkShow, tArr);
  M.tArr = tArr;
});
