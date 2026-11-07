// 结尾：回到纸，再回到片名的两半。
// e1 人算不过来时拿一张纸（正俯视，一张手写的草稿）；e2 模型没有别的纸，只有它自己写下的字（斜俯，旁边一行方块）；
// e3 它能想多远，看它一步一步写下了多少（侧面立面：一薄片「四块」与一座「三百多块」，镜头随柱子长高升上去）；
// e4 先思考，就是先把这些字写下来（回到那一行：前面一长串圈成「先思考」）；e5 再回答，是因为答案只读得到写在它前面的字（行尾的答案向前面每一块拱出一道弧）。
// 静场，片名印在纸上。
// 事实：S14、S3（b1–b3 的依据）；L3 §3（先写过程三百多块）；S7（e3 的概括）；S3 §3.2.3（e5：只读得到前面）。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });

  // ── e1 人的草稿：正俯视，一行一行写出来 ──
  const HX = -1180, HY = -420, HL = 172;
  const HAND = ['92138 = 92000 + 138', '25992 × 92000 = <u>2391264000</u>', '25992 × 138 = <u>3586896</u>', '<u>2391264000</u> + <u>3586896</u> = 2394850896'];
  const handOff = (t) => 1 - ramp(t, T('e2') - 0.4, 0.6);   // 讲模型那一行时，人的纸退开
  HAND.forEach((txt, i) => {
    const e = W.print(`<div class="hand">${txt}</div>`, HX, HY + i * HL);
    const ta = T('e1', '纸') - 0.9 + i * 0.45;
    fade(W, e, (t) => ramp(t, ta, 0.4) * handOff(t));
    sfx('key', ta, { g: 0.2 });
  });
  const hp = W.board('<div class="lbl l g">人的纸</div>', HX, HY, 0, 0, -130);
  fade(W, hp, (t) => ramp(t, T('e2') - 0.3, 0.4) * handOff(t));

  // ── e2 模型写下的字：一行方块；行尾是答案 ──
  const MX = 300, MY = -150;
  const M = para(S, MX, MY, ['92138', '=', '92000', '+', '138', 2, '25992', '×', '92000', '=', '2,391', ',264', ',000', 3, '\n',
    '25992', '×', '138', '=', '3,586', ',896', 2, '…', '答案', '：', '239', '485', '089', '6'], { fs: 46, lh: 120, maxW: 1900, d: 90, h: 26 });
  const NA = 6, ansG = M.slice(-NA), ansT = ansG[2], thinkT = M.slice(0, -NA);
  M.forEach((k, i) => {
    const ta = i < M.length - NA ? lerp(T('e2', '自己') - 0.4, T('e2', '写下') + 0.6, i / (M.length - NA - 1)) : T('e4', '先思考') - 0.6 + (i - M.length + NA) * 0.1;
    const rowF = (t) => 1 - ramp(t, T('e3') - 0.5, 0.5) * (1 - ramp(t, T('e4') - 0.6, 0.5));   // 讲柱子时这一行退开，不横在柱脚前
    place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 30 * (1 - ramp(t, ta, 0.3, ease.out3)), o: ramp(t, ta, 0.2) * rowF(t) }));
    if (i % 3 === 0) sfx('key', ta, { g: 0.14 });
  });
  const mp = W.board('<div class="lbl g">它写下的字</div>', MX, MY, 30, 0, -110);
  fade(W, mp, (t) => ramp(t, T('e2', '写下') - 0.2, 0.4) * (1 - ramp(t, T('e3') - 0.5, 0.4)));

  // ── e3 一薄片（四块）与一座柱子（三百多块）；每块一道淡纹 ──
  const SG = 3, CYc = MY - 360, XS1 = MX + 260, XS2 = MX + 900;
  const colOff = (t) => 1 - ramp(t, T('e4') + 0.1, 0.6);   // 镜头离开以后再淡去
  const c1 = column(W, S, XS1, CYc, { w: 150, d: 100, seg: SG, n: (t) => 4 * ramp(t, T('e3') - 0.4, 0.4), op: colOff });
  const c2 = column(W, S, XS2, CYc, { w: 150, d: 100, seg: SG, n: (t) => 321 * ramp(t, T('e3') + 0.3, 3.0, ease.io3), op: colOff });
  c2.g.classList.add('fine');
  const l1 = W.board('<div class="lbl xl" style="transform:translateX(-50%)">四块 ↓</div>', XS1, CYc, 50, 0, -150);
  const l2 = W.board('<div class="lbl l" style="transform:translateX(-50%)">三百多块</div>', XS2, CYc, 321 * SG + 50, 0, -96);
  fade(W, l1, (t) => ramp(t, T('e3') - 0.3, 0.3) * (1 - ramp(t, T('e3', '一步一步') + 0.2, 0.4))); fade(W, l2, (t) => ramp(t, T('e3', '一步一步') + 0.1, 0.4) * colOff(t));
  sfx('riser', T('e3') + 0.2, { g: 0.12 });

  // ── e4 先思考：前面一长串圈起来 ──
  const thinkOn = (t) => ramp(t, T('e4', '先思考') - 0.2, 0.4) * (1 - ramp(t, T('eT') - 1.2, 0.5));
  const r0 = thinkT.filter((k) => k.line === 0), r1 = thinkT.filter((k) => k.line === 1);
  rectOf(W, S, M, 0, r0.length - 1, thinkOn, 'g');
  rectOf(W, S, M, r0.length, r0.length + r1.length - 1, thinkOn, 'g');
  const tl = W.board('<div class="lbl l" style="transform:translateX(-100%)">先思考</div>', r0[0].x0 - 40, MY, 30, 0, -40);
  fade(W, tl, thinkOn);
  const tl2 = W.board('<div class="lbl l" style="transform:translateX(-100%)">＝ 先写下来</div>', r0[0].x0 - 40, MY, 30, 0, 40);
  fade(W, tl2, (t) => ramp(t, T('e4', '写下来') - 0.3, 0.4) * (1 - ramp(t, T('eT') - 1.2, 0.5)));
  sfx('tick', T('e4', '先思考') - 0.2, { g: 0.2 });

  // ── e5 再回答：行尾的答案向前面每一块拱出一道弧——它只读得到写在它前面的字 ──
  const ansOn = (t) => ramp(t, T('e5', '再回答') - 0.2, 0.4) * (1 - ramp(t, T('eT') - 1.2, 0.5));
  rectOf(W, S, M, M.length - NA, M.length - 1, ansOn, '');
  const al = W.board('<div class="lbl l">再回答</div>', ansG[0].x0, ansT.y, 30, 0, 56);
  fade(W, al, (t) => ramp(t, T('e5', '再回答') - 0.2, 0.4) * (1 - ramp(t, T('eT') - 1.2, 0.5)));
  const al2 = W.board('<div class="lbl l">：只读得到前面的字</div>', ansG[0].x0 + 196, ansT.y, 30, 0, 56);
  fade(W, al2, (t) => ramp(t, T('e5', '只读得到') - 0.3, 0.4) * (1 - ramp(t, T('eT') - 1.2, 0.5)));
  thinkT.slice().reverse().forEach((k, i) => glow(W, k.b, (t) => ramp(t, T('e5', '只读得到') - 0.2 + i * 0.06, 0.25) * (1 - ramp(t, T('eT') - 1.2, 0.5))));
  sfx('tick', T('e5', '只读得到') - 0.2, { g: 0.2 });

  // ── 片名 ──
  const TC = blankCam(-200, 2000);
  const tt = T('eT') - 0.2;
  const tc = W.print('<div class="title-cot" style="transform:translate(-50%,-50%)">CoT</div>', TC.cx, TC.cy - 70);
  const tz = W.print('<div class="title-zh" style="transform:translate(-50%,-50%)">先思考，再回答</div>', TC.cx, TC.cy + 120);
  fade(W, tc, (t) => ramp(t, tt, 0.9)); fade(W, tz, (t) => ramp(t, tt + 0.6, 0.9));

  // ── 镜头：e1 正俯视草稿｜e2 斜俯，草稿与模型的一行字并排｜e3 立面，随柱子长高升上去｜e4、e5 斜俯看那一行（不动）｜片名正俯视 ──
  const B0 = blankCam(HX + 640, HY + 260);
  const shHand = fitCam(W, [[HX - 30, HY - 60, 0], [HX + 1250, HY - 60, 0], [HX - 30, HY + 3 * HL + 80, 0], [HX + 1250, HY + 3 * HL + 80, 0]], { pitch: 6 });
  const rowB = M.map((k) => B(k.x, k.y, k.w, k.d, 26));
  const shBoth = fitCam(W, [...rowB, { el: mp }], { pitch: 30 });
  const shCol0 = fitCam(W, [B(XS1, CYc, 150, 100, 60), B(XS2, CYc, 150, 100, 360), { el: l1 }], { pitch: 86, kmax: 0.9, safe: { l: 700, r: 1820, t: 90, b: 900 } });
  const shCol1 = { ...shCol0, cx: XS2 - (1600 - 960) / shCol0.k, cz: 321 * SG - 200, pitch: 88 };
  const shRow = fitCam(W, [...rowB, { el: tl }, { el: tl2 }, { el: al }, { el: al2 }, [MX + 600, MY, 440]], { pitch: 46, yaw: -6 });
  W.cam([
    [s.start, B0, 0.01],
    [T('e1') - 0.4, shHand, 1.2],
    [T('e2') - 0.5, shBoth, 1.6],
    [T('e3') - 0.9, shCol0, 1.2],
    [T('e3', '一步一步') - 0.5, shCol1, Math.max(1.2, Tend('e3') + 0.4 - T('e3', '一步一步')), ease.io3],
    [T('e4') - 0.6, shRow, 1.5],
    [T('eT') - 1.0, TC, 1.9],
    [null, { ...TC, cy: TC.cy + 22 }, Math.max(0.5, s.end + 0.5 - T('eT') - 1.0), (k) => k],   // 片名停留：只朝一个方向极慢地移
  ]);
  sfx('whoosh', T('e2') - 0.5, { g: 0.18 }); sfx('whoosh', T('e3') - 0.4, { g: 0.16 }); sfx('whoosh', T('e4') - 0.6, { g: 0.18 }); sfx('whoosh', T('eT') - 1.0, { g: 0.22 });
});
