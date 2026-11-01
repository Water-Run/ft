// 127.0.0.1（s1，策划者要求补回的一句，localhost 只上画面）：图上回到平常的样子；下方地址框随读音填上 127.0.0.1；
// 读到「指的是」时，图上你的电脑旁边和下方的小图里，各有一个白色数据包出门就掉头、回到这台电脑，它亮起；注明 127 开头的地址都绕回本机。
scene('special', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { pc } = M;
  const tS = T('s1'), tE = Q(T('e1', '四')) - 0.05, tE2 = Q(T('e1', '电脑')) - 0.05;   // 地址框收在 e1 的十进制出现之前；右边的说明留到比特出现之前

  // ── 下方：要去 127.0.0.1 ──
  const il = txt(world, 'ilab', tr('要去', 'To'), 100, 812);
  const ad = bigAddr(world, 230, 778, ['', '', '', '']);
  [il, ad.el].forEach((e) => { vanish(e, 0); appear(e, tS); span(e, 0, tE); });
  zoomFx(tS - 0.25, [260, 762, 494, 154], [230, 778, 760, 96], 0.25);
  const ws = ['一二', '七点', '零点', '零点一'];
  [127, 0, 0, 1].forEach((v, i) => {
    const t = Q(T('s1', ws[i]), 0.05);
    htmlAt(ad.cells[i], t, String(v));
    classOn(ad.cells[i], 'hl', t, Q(T('s1', '指')));
    pulse(ad.cells[i], t, 1.25, 0.25);
    sfx('key', t, { g: 0.6, p: -0.4 + i * 0.25 });
    gauge(t, tr('要去', 'To'), [127, 0, 0, 1].map((x, j) => (j <= i ? x : '')));
  });

  // ── 掉头的数据包：图上一个，下方小图里一个 ──
  const tGo = Q(T('s1', '指'));
  const bez = (p0, c1, c2, p3, n = 14) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, a = (1 - k) ** 3, b = 3 * (1 - k) ** 2 * k, c = 3 * (1 - k) * k * k, d = k ** 3;
      out.push([a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1]]);
    }
    return out;
  };
  const ov = overlay(world);
  // 图上：电脑右侧出门，在电脑与家里的网线之间掉头
  const loopMap = bez([196, 276], [262, 256], [262, 330], [196, 310]);
  const lm = path(ov, pathD(loopMap), 'navy', { w: 5 });
  vanish(lm, 0); arrowIn(lm, tGo, 0.9); span(lm, 0, Q(Tend('s1') + 1.0));   // 网络图暗下去时收掉
  const pm = h('div', 'pk light', world);
  glide(pm, [[tGo, tGo + 0.9, loopMap]], tGo, tGo + 0.95, 40, 30);
  // 下方小图：一台电脑、一个掉头的箭头、localhost 标签
  const mini = h('div', 'abs', world);
  const mpc = pcIcon(mini, 1060, 772, 0.9);
  const loopMini = bez([1160, 800], [1300, 760], [1300, 880], [1160, 850]);
  const lmi = path(ov, pathD(loopMini), 'navy', { w: 5 });
  vanish(lmi, 0); arrowIn(lmi, tGo, 0.9); span(lmi, 0, tE2);
  const pmi = h('div', 'pk light', world);
  glide(pmi, [[tGo, tGo + 0.9, loopMini]], tGo, tGo + 0.95, 40, 30);
  vanish(mini, 0); appear(mini, tS + 0.3); span(mini, 0, tE2);
  const tSelf = Q(T('s1', '自己'));
  classOn(mpc, 'hot', tGo + 0.95, tE);
  classOn(pc, 'hot', tGo + 0.95, tE);
  classOn(pc, 'sel', tS, tE);
  sfx('whoosh', tGo, { g: 0.35 }); sfx('chime', tGo + 0.95, { g: 0.5, p: -0.4 });
  const lh = h('div', 'chip w', world, '<span class="px">localhost</span>'); px(lh, 1340, 774);
  vanish(lh, 0); slam(lh, tSelf, { from: 1.3, d: 0.3 }); span(lh, 0, tE2);
  const lhn = txt(world, 'inote', tr('本机的名字', 'this computer\'s name'), 1550, 780);
  vanish(lhn, 0); wipe(lhn, tSelf + 0.2, { d: 0.35 }); span(lhn, 0, tE2);
  const n127 = txt(world, 'inote', tr('<span class="px">127</span> 开头的都绕回本机', 'Addresses starting <span class="px">127</span> loop back inside'), 1340, 856);
  vanish(n127, 0); wipe(n127, Q(T('s1', '指')), { d: 0.45 }); span(n127, 0, tE2);
  sfx('tick', tSelf, { g: 0.5 });
});
