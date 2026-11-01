// 两段特别的地址（s1–s2）。
// s1 127.0.0.1：下方地址框随读音填上 127.0.0.1；读到「指」时，图上你的电脑旁边和下方小图里各有一个白色数据包出门就掉头、回到这台电脑，它亮起；
//    localhost 只作标签（「本机的名字」），注明 127 开头的都绕回本机。
// s2 192.168：你家两台设备地址里的 192.168 反白；图下方隔壁一家亮出地址——也是 192.168.1.10；下方两行对照，注解「私有地址」，
//    读到「各家内网都能用」时两家的标题条一起亮。
scene('special', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world, 1920, VH);
  const { pc, lab, HB, NB } = M;
  const tS = T('s1'), tS2 = T('s2'), tE = Q(Tend('s2') + 0.3);      // s2 说完 0.3 秒收起（网络图同时暗下去，见 s6_limit.js）

  // ═══ s1：127.0.0.1 ═══
  const il = txt(world, 'ilab', tr('要去', 'To'), 100, 812);
  const ad = bigAddr(world, 230, 778, ['', '', '', '']);
  [il, ad.el].forEach((e) => { vanish(e, 0); appear(e, tS - 0.1); span(e, 0, tS2); });
  zoomFx(tS - 0.35, [260, 762, 494, 154], [230, 778, 760, 96], 0.25);
  const ws = [T('s1', '一二'), T('s1', '七点'), T('s1', '零点'), T('s1', '零点一') + 0.25];
  [127, 0, 0, 1].forEach((v, i) => {
    const t = Q(ws[i], 0.05);
    htmlAt(ad.cells[i], t, String(v));
    pulse(ad.cells[i], t, 1.25, 0.25);
    classOn(ad.cells[i], 'hl', t, Q(T('s1', '指')));
    sfx('key', t, { g: 0.6, p: -0.4 + i * 0.25 });
    gauge(t, tr('要去', 'To'), [127, 0, 0, 1].map((x, j) => (j <= i ? x : '')));
  });
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
  const loopMap = bez([196, 276], [262, 256], [262, 330], [196, 310]);
  const lm = path(ov, pathD(loopMap), 'navy', { w: 5 });
  vanish(lm, 0); arrowIn(lm, tGo, 0.8); span(lm, 0, tS2);
  const pm = h('div', 'pk light', world);
  glide(pm, [[tGo, tGo + 0.8, loopMap]], tGo, tGo + 0.85, 40, 30);
  const mini = h('div', 'abs', world);
  const mpc = pcIcon(mini, 1060, 772, 0.9);
  const loopMini = bez([1160, 800], [1300, 760], [1300, 880], [1160, 850]);
  const lmi = path(ov, pathD(loopMini), 'navy', { w: 5 });
  vanish(lmi, 0); arrowIn(lmi, tGo, 0.8); span(lmi, 0, tS2);
  const pmi = h('div', 'pk light', world);
  glide(pmi, [[tGo, tGo + 0.8, loopMini]], tGo, tGo + 0.85, 40, 30);
  vanish(mini, 0); appear(mini, tS + 0.2); span(mini, 0, tS2);
  classOn(mpc, 'hot', tGo + 0.85, tS2);
  classOn(pc, 'hot', tGo + 0.85, tS2);
  classOn(pc, 'sel', tS, tS2);
  sfx('whoosh', tGo, { g: 0.35 }); sfx('chime', tGo + 0.85, { g: 0.5, p: -0.4 });
  const tSelf = Q(T('s1', '自己'));
  const lh = h('div', 'chip w', world, '<span class="px">localhost</span>'); px(lh, 1340, 774);
  vanish(lh, 0); slam(lh, Q(T('s1', '七点')), { from: 1.3, d: 0.3 }); span(lh, 0, tS2);
  const lhn = txt(world, 'inote', tr('本机的名字', 'this computer\'s name'), 1550, 780);
  vanish(lhn, 0); appear(lhn, Q(T('s1', '七点')) + 0.2); span(lhn, 0, tS2);
  const n127 = txt(world, 'inote', tr('<span class="px">127</span> 开头的都绕回本机', 'Addresses starting <span class="px">127</span> loop back'), 1340, 856);
  vanish(n127, 0); appear(n127, Q(T('s1', '一二'))); span(n127, 0, tS2);
  sfx('tick', tSelf, { g: 0.5 });

  // ═══ s2：192.168 开头的是私有地址，各家内网都能用 ═══
  const t192 = Q(T('s2', '一九二'));
  [lab.pc, lab.phone].forEach((l) => classOn(l.pre, 'hl', t192, tE));
  M.gNbLab && (vanish(M.gNbLab, 0), appear(M.gNbLab, t192 + 0.3));
  lab.nb.forEach((l) => { classOn(l.pre, 'hl', t192 + 0.3, tE); });
  htmlAt(NB.pre, t192 + 0.3, '192.168.1');
  classOn(lab.nb[0].el, 'sel', t192 + 0.3, tE); classOn(lab.pc.el, 'sel', t192 + 0.3, tE);
  sfx('key', t192, { g: 0.55 }); sfx('pop', t192 + 0.3, { g: 0.5, p: 0.3 });
  gauge(t192, tr('要去', 'To'), [192, 168, 1, 10]);
  // 下方：两行对照
  const rows = [[tr('你家的电脑', 'Your PC'), 0], [tr('隔壁的电脑', 'Next door'), 1]].map(([n, k]) => {
    const g = h('div', 'abs', world);
    txt(g, 'ilab', n, 100, 772 + k * 84);
    const a = txt(g, 'px', '192.168.1.10', 330, 762 + k * 84); css(a, { fontSize: '56px', padding: '0 8px' });
    classOn(a, 'hl', Q(T('s2', '私有')), tE);
    vanish(g, 0); appear(g, t192 + k * 0.3); span(g, 0, tE);
    return g;
  });
  const eq = h('div', 'chip', world, tr('= 同一个地址，互不冲突', '= same address, no clash')); px(eq, 720, 816);
  vanish(eq, 0); slam(eq, t192 + 0.6, { from: 1.3, d: 0.3 }); span(eq, 0, tE);
  const gP = h('div', 'abs', world); px(gP, 1180, 768); gP.dataset.gloss = '私有地址';
  txt(gP, 'inote', tr('<b>私有地址</b>：只在内网里用', '<b>Private address</b>: used only inside'), 0, 0);
  txt(gP, 'inote', tr('<span class="px">192.168.x.x</span>（还有 <span class="px">10.x</span>、<span class="px">172.16–31.x</span>）', '<span class="px">192.168.x.x</span> (also <span class="px">10.x</span>, <span class="px">172.16–31.x</span>)'), 0, 56);
  vanish(gP, 0); appear(gP, t192 + 0.5); span(gP, 0, tE);
  sfx('tick', Q(T('s2', '私有')), { g: 0.55 });
  const tAll = Q(T('s2', '各'));
  [HB, NB].forEach((z) => classOn(z.el, 'on', tAll, tE));
  sfx('blip', tAll, { g: 0.5 });
});
