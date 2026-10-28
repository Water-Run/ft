// 第 2 幕：XML。同一份配置换成成对标签 → <port> 与 </port> 夹住 8080 → 一层套一层，长成一棵树 → 属性与校验 → 标签比数据长（完整示例实测：标签 95 字符、数据 20 字符）。
scene('xml', ({ root, s }) => {
  const { world, cam } = stage(root, s);
  const doc = makeDoc(world, FMT.ini);

  // ── b1：XML 巨字；同一份配置换成成对的尖括号标签 ──
  const G = giant(world, 'XML', { x: 90, y: 950, size: 250, grow: 1.28, rot: -6, cls: 'ac' });
  giantIn(G, s.start + 0.3, 0.12); shake(root, s.start + 0.42, 12);
  const yr = tag(world, 'k', '1998 · W3C 推荐标准', 64, 310); stamp(yr, s.start + 0.9);
  const tM = W('b1b', '成对');
  docResize(doc, 10, tM, 7); docMorph(doc, FMT.xml, tM, { seed: 3 }); shake(root, tM + 0.8, 10);

  // ── b2：<port> 与 </port> 拉开，再从两头砸回来夹住 8080 ──
  const po = doc.toks.find((k) => k.cls === 'to' && k.row === 3), pc = doc.toks.find((k) => k.cls === 'tc' && k.row === 3), pv = doc.toks.find((k) => k.id === 'port');
  const t1 = W('b2', '一头'), t2 = W('b2', '一尾'), tClamp = W('b2', '夹');
  tl.fromTo(po.e, { x: 0 }, { x: -170, duration: 0.3, ease: 'power3.out', immediateRender: false }, t1);
  tl.fromTo(pc.e, { x: 0 }, { x: 170, duration: 0.3, ease: 'power3.out', immediateRender: false }, t2);
  tl.to(po.e, { x: 0, duration: 0.18, ease: 'power4.in' }, tClamp); tl.to(pc.e, { x: 0, duration: 0.18, ease: 'power4.in' }, tClamp);
  tl.fromTo(pv.e, { scale: 1 }, { keyframes: [{ scale: 0.7, duration: 0.06 }, { scale: 1.15, duration: 0.12 }, { scale: 1, duration: 0.2 }], immediateRender: false }, tClamp + 0.18);
  sfx('thud', tClamp + 0.18, { g: 1, p: -0.3 }); shake(root, tClamp + 0.18, 14);
  const pH = pointer(world, 'k', '头 &lt;port&gt;', 3, t1, { w: 230 }), pD = pointer(world, 'r', '数据夹在中间', 3, tClamp + 0.3, { w: 300 });
  clearOut(pH.e, tClamp + 0.25); clearOut(pH.ln, tClamp + 0.25);

  // ── b3：大标签里套小标签：框出 db、server、config；左边长出一棵树 ──
  const tBig = W('b3', '大标签'), tSmall = W('b3', '小标签'), tTree = W('b3', '树状');
  [pD.e, pD.ln].forEach((e) => clearOut(e, tBig - 0.1));
  const bxS = docBox(world, 1, 8, 2, 22, tBig), bxD = docBox(world, 4, 7, 4, 20, tSmall, { color: '#E9E0CC' }), bxC = docBox(world, 0, 9, 0, 24, tSmall + 0.4, { w: 4, color: '#B9B0A0' });
  const ov = overlay(world);
  const node = (name, x, y, cls, t) => { const e = tag(world, cls, name, x, y); stamp(e, t, { g: 0.35 }); return { e, x, y }; };
  const N = { c: node('config', 420, 300, 'k', tTree) };
  N.s = node('server', 470, 390, 'k', tTree + 0.15);
  N.h = node('host', 380, 480, 'o', tTree + 0.3); N.p = node('port', 520, 480, 'o', tTree + 0.36); N.d = node('db', 660, 480, 'r', tTree + 0.42);
  N.u = node('user', 600, 570, 'o', tTree + 0.56); N.q = node('port', 740, 570, 'o', tTree + 0.62);
  const edge = (a, b, t) => { const p = path(ov, `M${a.x + 40},${a.y + 50} L${b.x + 40},${b.y}`, 'ink', { arrow: false, w: 5 }); p.setAttribute('stroke-linecap', 'butt'); draw(p, t, 0.25); return p; };
  const edges = [edge(N.c, N.s, tTree + 0.1), edge(N.s, N.h, tTree + 0.25), edge(N.s, N.p, tTree + 0.3), edge(N.s, N.d, tTree + 0.36), edge(N.d, N.u, tTree + 0.5), edge(N.d, N.q, tTree + 0.56)];
  sfx('pop', tTree + 0.42, { g: 0.6 });

  // ── b4：标签里加属性；配上文档类型定义，逐行校验 ──
  const tAt = W('b4', '属性');
  docMorph(doc, FMT.xmlA, tAt - 0.15, { seed: 5, d: 0.35 });
  tl.to(bxS, { width: 26 * CWD + 28, duration: 0.3, ease: 'power3.out' }, tAt);
  const pA = pointer(world, 'r', '属性 name="web"', 1, tAt + 0.3, { w: 330, x: 520 });
  [N.c, N.s, N.h, N.p, N.d, N.u, N.q].forEach((n) => clearOut(n.e, W('b4b', '文档') - 0.2)); edges.forEach((e) => clearOut(e, W('b4b', '文档') - 0.2));
  const dtd = tag(world, 'k', '<span class="mono">&lt;!ELEMENT port (#PCDATA)&gt;</span>', 300, 470); stamp(dtd, W('b4b', '文档'));
  const dl = tag(world, 'o', '文档类型定义：每一项该长什么样', 300, 540); stamp(dl, W('b4b', '文档') + 0.25, { g: 0.3 });
  const tScan = W('b4b', '校验');
  const scan = blk(world, 'bg-ac', DOC.x - 60, DOC.y - 16, 860, 8);
  tl.fromTo(scan, { autoAlpha: 1, y: 0 }, { y: 10 * DOC.lh, duration: 1.0, ease: 'none', immediateRender: true }, tScan);
  vanish(scan, tScan + 1.05);
  for (let i = 0; i < 10; i += 2) sfx('tick', tScan + i * 0.1, { g: 0.5 });
  const ok = tag(world, 'r big', '校验通过', 300, 640); stamp(ok, tScan + 1.05, { g: 0.9 });

  // ── b5：每个数据都得有头有尾 ──
  const tH = W('b5', '有头'), tT = W('b5', '有尾');
  [dtd, dl, ok, pA.e, pA.ln, bxS, bxD, bxC].forEach((e) => clearOut(e, tH - 0.2));
  classAt(doc.el, 'm-heads', tH, W('b6')); classAt(doc.el, 'm-tails', tT, W('b6'));
  docFind(doc, (k) => k.cls === 'to').forEach((k, i) => tl.fromTo(k.e, { x: 0 }, { keyframes: [{ x: -14, duration: 0.06 }, { x: 0, duration: 0.15 }], immediateRender: false }, tH + i * 0.05));
  docFind(doc, (k) => k.cls === 'tc').forEach((k, i) => tl.fromTo(k.e, { x: 0 }, { keyframes: [{ x: 14, duration: 0.06 }, { x: 0, duration: 0.15 }], immediateRender: false }, tT + i * 0.05));
  sfx('pop', tH, { g: 0.6 }); sfx('pop', tT, { g: 0.6, p: 0.3 });

  // ── b6：标签与数据各自飞进黑底，变成方块：一个方块一个字符（完整示例实测：标签 95、数据 20）──
  const tOut = W('b6', '外面'), tIn = W('b6', '里面');
  const tags = docFind(doc, (k) => k.cls === 'to' || k.cls === 'tc'), data = docFind(doc, (k) => k.cls === 'dv'), rest = docFind(doc, (k) => k.cls !== 'to' && k.cls !== 'tc' && k.cls !== 'dv');
  const GX = DOC.x - 20, GY = DOC.y + 40, Q = 36, PER = 20;
  const gridAt = (i, y0) => [GX + (i % PER) * Q, y0 + Math.floor(i / PER) * Q];
  rest.forEach((k) => tl.fromTo(k.e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, tOut - 0.1));
  const fly = (list, t0, y0) => list.forEach((k, i) => { const [x, y] = gridAt(Math.floor(i * (y0 === GY ? 95 : 20) / list.length), y0); tl.fromTo(k.e, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: x - k.x, y: y - k.y, scale: 0.5, autoAlpha: 0, duration: 0.45, ease: 'power3.in', immediateRender: false }, t0 + i * 0.03); });
  const squares = (n, y0, cls, t0) => Array.from({ length: n }, (_, i) => { const [x, y] = gridAt(i, y0); const b = blk(world, cls, x, y, Q - 8, Q - 8); tl.fromTo(b, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.12, ease: 'power3.out', immediateRender: true }, t0 + i * 0.012); return b; });
  fly(tags, tOut, GY); const sqT = squares(95, GY, 'bg-paper', tOut + 0.4);
  fly(data, tIn, GY + 260); const sqD = squares(20, GY + 260, 'bg-ac', tIn + 0.35);
  for (let i = 0; i < 8; i++) sfx('tick', tOut + 0.4 + i * 0.14, { g: 0.5, p: i * 0.05 });
  const n1 = tag(world, 'k', '', GX, GY + 5 * Q + 14), n2 = tag(world, 'r', '', GX, GY + 260 + Q + 14);
  countTo(n1, 0, 95, tOut + 0.4, 1.1, (v) => '标签 ' + Math.round(v) + ' 字符'); appear(n1, tOut + 0.4);
  countTo(n2, 0, 20, tIn + 0.35, 0.3, (v) => '数据 ' + Math.round(v) + ' 字符'); appear(n2, tIn + 0.35);
  n1.style.border = '4px solid var(--paper)';
  const src = tag(world, 'k', '一个方块 = 一个字符（本例去掉空白，实测）', GX, GY + 260 + Q + 70); stamp(src, tOut + 0.6, { g: 0.3 });
  const tBig2 = W('b6', '一大截'); shake(root, tBig2, 14); sfx('thud', tBig2, { g: 1, p: -0.4 });
  sqT.forEach((b, i) => tl.fromTo(b, { scale: 1 }, { keyframes: [{ scale: 1.25, duration: 0.08 }, { scale: 1, duration: 0.2 }], immediateRender: false }, tBig2 + (i % PER) * 0.015));
  // 收尾：方块散掉，字块飞回文件，下一幕接着用
  const tBack = s.end - 0.8;
  [...sqT, ...sqD, n1, n2, src].forEach((e) => clearOut(e, tBack));
  [...tags, ...data].forEach((k) => tl.to(k.e, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power3.inOut' }, tBack + 0.1));
  rest.forEach((k) => tl.to(k.e, { autoAlpha: 1, duration: 0.3 }, tBack + 0.2));
  slabIn(root, s.end);
  hold(cam, s, -1, s.start + 0.9);
});
