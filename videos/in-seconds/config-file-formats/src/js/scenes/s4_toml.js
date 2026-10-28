// 第 5 幕：TOML，然后收尾。INI 的方括号回来 → 加一颗圆点成 [server.db] → 缩进不算数、有注释、有类型 →
// 五种格式按年份排开，落到天平两端：机器好解析 / 人好读写，摆平后停住 → 文件依次变成五种格式，服务器读到的始终是 8080：只需改动配置。
scene('toml', ({ root, s }) => {
  const { world, cam, srv, wire } = stage(root, s);
  const yc = FMT.yaml.map((l, i) => (i === 2 ? l + '  # 对外端口' : l));
  const doc = makeDoc(world, yc);

  // ── e1：TOML 巨字 ──
  const G = giant(world, 'TOML', { x: 90, y: 950, size: 200, grow: 1.22, rot: -12, cls: 'ink' });
  giantIn(G, s.start + 0.3, 0.1); shake(root, s.start + 0.42, 12);
  const yr = tag(world, 'k', '2013', 64, 310); stamp(yr, s.start + 0.9);
  const two = txt(world, 'say', '直观 <span class="ac">+</span> 严谨', 340, 300); wipe(two, W('e1', '直观'), { dir: 'l', d: 0.4 });

  // ── e2：INI 的方括号回来了；一颗红圆点落进去，[db] 变成 [server.db] ──
  const tB = W('e2', '方括号');
  const iniLike = ['[server]', 'host = "{host}"', 'port = {port}', '', '[db]', 'user = "{user}"', 'port = {dbport}'];
  docResize(doc, 7, tB, 6); docMorph(doc, iniLike, tB, { seed: 19 });
  const from = tag(world, 'o', '和 INI 一样的方括号', 340, 380); stamp(from, tB + 0.6, { g: 0.4 });
  const tDot = W('e2b', '圆点');
  const dot = svg('svg', { class: 'abs', width: 60, height: 60, viewBox: '0 0 60 60' }, world); px(dot, DOC.x + 7 * CWD, DOC.y - 300); svg('circle', { cx: 30, cy: 30, r: 30, fill: C.ac }, dot);
  tl.fromTo(dot, { autoAlpha: 1, y: 0 }, { y: 4 * DOC.lh + 290, duration: 0.35, ease: 'power3.in', immediateRender: true }, tDot - 0.1);
  vanish(dot, tDot + 0.27); sfx('thud', tDot + 0.25, { g: 1, p: -0.3 }); shake(root, tDot + 0.25, 12);
  docMorph(doc, FMT.toml, tDot + 0.1, { seed: 23, d: 0.35 });
  const pM = pointer(world, 'r', 'server 里面的 db', 4, W('e2b', '多层'), { w: 290, x: 600 });
  [two, from].forEach((e) => clearOut(e, tDot));

  // ── e3：随便缩进也不改结构；注释；类型 ──
  const tI = W('e3', '缩进');
  clearOut(pM.e, tI - 0.1); clearOut(pM.ln, tI - 0.1);
  const mid = docFind(doc, (k) => k.row === 1 || k.row === 2 || k.row === 5 || k.row === 6);
  mid.forEach((k) => tl.fromTo(k.e, { x: 0 }, { keyframes: [{ x: 4 * CWD, duration: 0.3, ease: 'power3.out' }, { x: 4 * CWD, duration: 0.5 }, { x: 0, duration: 0.3, ease: 'power3.in' }], immediateRender: false }, tI));
  const same = tag(world, 'o', '缩进多少，结构都一样', 340, 380); stamp(same, W('e3', '结构'), { g: 0.4 });
  const tc = FMT.toml.map((l, i) => (i === 2 ? l + '  # 对外端口' : l));
  docMorph(doc, tc, W('e3', '注释'), { seed: 29, d: 0.3 });
  const tT = W('e3', '数据类型');
  const pS = pointer(world, 'r', '字符串', 1, tT, { w: 160, x: 760 }), pI = pointer(world, 'k', '整数', 2, tT + 0.25, { w: 120, x: 800 });

  // ── e4：五种格式按年份排开；天平落下 ──
  const t4 = W('e4');
  [same, pS.e, pS.ln, pI.e, pI.ln, yr, G.g].forEach((e) => clearOut(e, t4 - 0.1));
  tl.to(doc.el, { x: 1100, duration: 0.5, ease: 'power3.in' }, t4 - 0.1);
  tl.to(wire, { autoAlpha: 0, duration: 0.2 }, t4 - 0.1);
  const names = [['INI', 1985], ['XML', 1998], ['JSON', 2001], ['YAML', 2001], ['TOML', 2013]];
  const chips = names.map(([n, y], i) => { const e = txt(world, 'giant ' + (i === 1 || i === 2 ? 'ink' : 'ac'), `${n}<span class="yr">${y}</span>`, 330 + i * 310, 250); e.style.fontSize = '72px'; return e; });
  chips.forEach((e, i) => { stamp(e, t4 + 0.1 + i * 0.22, { g: 0.5 }); });
  const tri = poly(world, [[960, 560], [1150, 860], [770, 860]], 'ac'); wipe(tri, W('e4', '两端'), { dir: 'b', d: 0.3 });
  const beam = h('div', 'abs', world); px(beam, 160, 500, 1600, 60);
  const bar = blk(beam, 'bg-ink', 0, 20, 1600, 40);
  tl.fromTo(beam, { autoAlpha: 0, y: -300 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.in', immediateRender: true }, W('e4', '两端') + 0.1);
  sfx('thud', W('e4', '两端') + 0.45, { g: 1, p: -0.4 }); shake(root, W('e4', '两端') + 0.45, 12);
  const tBal = W('e4', '平衡');
  tl.fromTo(beam, { rotation: 0 }, { keyframes: [{ rotation: -4, duration: 0.45, ease: 'power2.inOut' }, { rotation: 3, duration: 0.55, ease: 'power2.inOut' }, { rotation: 0, duration: 0.5, ease: 'power2.inOut' }], transformOrigin: '50% 100%', immediateRender: false }, tBal);

  // ── e5：XML、JSON 落到左端（机器好解析）；INI、YAML、TOML 落到右端（人好读写）；梁先往左沉，再摆平，停住 ──
  const tM = W('e5', '机器'), tH = W('e5', '人类');
  // 字块挂到梁上：随梁一起转
  const onBeam = (e, bx, t) => { tl.to(e, { autoAlpha: 0, duration: 0.15 }, t); const c = txt(beam, e.className.replace('abs ', ''), e.innerHTML, bx, -110); c.style.fontSize = '80px'; c.dataset.overlapOk = '1'; tl.fromTo(c, { autoAlpha: 0, y: -260 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.in', immediateRender: true }, t); sfx('thud', t + 0.3, { g: 0.8, p: -0.2 }); return c; };
  onBeam(chips[1], 20, tM + 0.1); onBeam(chips[2], 290, tM + 0.3);
  const lm = txt(beam, 'say', '机器好解析', 40, 80); lm.style.fontSize = '52px'; stamp(lm, tM + 0.5, { g: 0.4 });
  tl.to(beam, { rotation: -6, transformOrigin: '50% 100%', duration: 0.5, ease: 'power2.out' }, tM + 0.45);
  onBeam(chips[0], 880, tH + 0.05); onBeam(chips[3], 1100, tH + 0.2); onBeam(chips[4], 1400, tH + 0.35);
  const lh = txt(beam, 'say ac', '人好读写', 1250, 80); lh.style.fontSize = '52px'; stamp(lh, tH + 0.5, { g: 0.4 });
  tl.to(beam, { keyframes: [{ rotation: 4, duration: 0.5, ease: 'power2.out' }, { rotation: -1.5, duration: 0.6, ease: 'power2.inOut' }, { rotation: 0, duration: 0.7, ease: 'power2.inOut' }], transformOrigin: '50% 100%' }, tH + 0.65);
  sfx('pop', tH + 2.4, { g: 0.6, p: 0.3 });

  // ── e6：服务器回到左边；文件回来，依次变成五种格式；服务器读到的始终是 8080：只需改动配置 ──
  const t6 = W('e6');
  [beam, tri].forEach((e) => clearOut(e, t6 - 0.15));
  tl.to(srv.b, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power3.inOut' }, t6);
  tl.fromTo(wire, { autoAlpha: 0, left: SRV.x + SRV.w, top: SRV.y + 172, width: DOC.x - 60 - SRV.x - SRV.w }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, t6 + 0.5);
  tl.to(doc.el, { x: 0, duration: 0.45, ease: 'power3.out' }, t6 + 0.1);
  const tAny = W('e6', '选哪');
  const seq = [['ini', 7], ['xml', 10], ['json', 10], ['yaml', 6], ['toml', 7]];
  let rows = 7;
  seq.forEach(([f, n], i) => { const t = tAny - 0.3 + i * 0.5; docResize(doc, n, t, rows); rows = n; docMorph(doc, FMT[f], t, { seed: 31 + i, d: 0.28, quick: 0.35 }); });
  const tSame = W('e6', '一样');
  const dot2 = blk(world, 'bg-ac', DOC.x - 90, SRV.y + 156, 40, 40);
  gsap.set(dot2, { autoAlpha: 0 });
  tl.fromTo(dot2, { autoAlpha: 1, x: 0 }, { x: SRV.x + SRV.w - DOC.x + 70, duration: 0.4, ease: 'power3.in', immediateRender: false }, tSame);
  vanish(dot2, tSame + 0.41);
  tl.fromTo(srv.v, { scale: 1.4 }, { scale: 1, duration: 0.35, ease: 'power4.out', transformOrigin: '0% 80%', immediateRender: false }, tSame + 0.4);
  sfx('pop', tSame + 0.4, { g: 0.8 });
  const codeNo = tag(world, 'k big', '代码不动', SRV.x, SRV.y + SRV.h + 24); stamp(codeNo, W('e6', '不必'));
  const G6 = giant(world, '只需改动配置', { x: 170, y: 935, size: 100, grow: 1.14, rot: -6, cls: 'cn-giant ac' });
  giantIn(G6, W('e6', '只需'), 0.08); shake(root, W('e6', '只需') + 0.45, 16);
  hold(cam, s, 1, s.start + 0.9);
});
