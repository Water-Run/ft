// 结尾（合）：回到主旨，落到片名。
// e3 它的层数，在造好的那一刻就定了——一摞层，顶上一道「造好就定了」的线；
// e4 可它能想多远，并没有定死——旁边一座塔越过这道线往上长；
// e5 要看回答之前，它写下了多少中间步骤——前面几行字一块块写出来，每写一块，塔就高一截；
// e6 对它来说，思考就是写下来——框出写下的几行，标「思考 ＝ 写下来」，最后一行的答案亮起；
// e7 先思考，再回答——镜头抬成正俯视，片名印在纸上，与这一句同时出现。
// 镜头：e3、e4 只看一摞层和塔（塔往上长是这两句的动作）；e5 开始写字时退一次，把字收进来；片名正俯视。
// 事实：S4、a7（层数固定）；S7（写下的中间步骤越多，能连着算下去的越长）；L3（先写过程三百多块）。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                               // 引擎镜头不动；立体镜头由 makeWorld 完成
  const W = makeWorld(world, { cx: 0, cy: 0, pitch: 0, yaw: 0, k: 1 });
  const S = W.stage;
  const B = (x, y, w, d, hh) => ({ box: [x, y, w, d, hh] });
  const NP = 64, GAP = 7.5, H = NP * GAP, SEG = H + 6;   // 64 张一摞（一张一层），高 480
  const tOut = Tend('e6') + 0.3, fadeOut = (t) => 1 - ramp(t, tOut, 0.5);

  // ── e3：一摞层，层数造好就定了 ──
  const SX0 = -420, SY0 = -260, TXc = SX0 + 520;
  ream(W, S, SX0, SY0, { w: 150, d: 100, gap: GAP, n: NP, rise: (t) => ramp(t, T('e3') - 0.3, 1.2, ease.io3), fill: (t) => ramp(t, T('e3') + 0.6, 1.4, (k) => k) });
  const ceil = seg(S, 'w'); ceil.set([SX0 - 110, SY0 + 51, H + 8], [TXc + 150, SY0 + 51, H + 8]);
  fade(W, ceil.e, (t) => ramp(t, T('e3', '定了') - 0.4, 0.4));
  const l3 = W.board('<div class="lbl l" style="transform:translateX(-100%)">层数：造好就定了</div>', SX0 - 130, SY0 + 51, H + 8, 0, -40);
  fade(W, l3, (t) => ramp(t, T('e3', '定了') - 0.4, 0.4));
  sfx('tick', T('e3', '定了') - 0.4, { g: 0.2 });

  // ── e5 的几行字：回答之前写下的中间步骤，最后一行是答案；写在一摞层和塔的前面 ──
  const MX = SX0 - 160, MY = SY0 + 220;
  const M = para(S, MX, MY, ['92138', '=', '92000', '+', '138', '\n',
    '25992', '×', '92000', '=', '2,391', ',264', ',000', '\n',
    '25992', '×', '138', '=', '3,586', ',896', '…', '\n',
    '答案', '：', '239', '485', '089', '6'], { fs: 52, lh: 124, maxW: 1120, d: 96, h: 26 });
  const NA = 6, ansG = M.slice(-NA), thinkT = M.slice(0, -NA);
  const tw = (i) => lerp(T('e5', '回答之前') - 0.2, T('e5', '中间步骤') + 0.6, i / (thinkT.length - 1));
  thinkT.forEach((k, i) => { const ta = tw(i); place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 26 * (1 - ramp(t, ta, 0.25, ease.out3)), o: ramp(t, ta, 0.18) })); if (i % 2 === 0) sfx('key', ta, { g: 0.12 }); });
  ansG.forEach((k, i) => { const ta = T('e6', '写下来') + 0.1 + i * 0.06; place(W, k.b.g, (t) => ({ x: k.x, y: k.y, z: 26 * (1 - ramp(t, ta, 0.25, ease.out3)), o: ramp(t, ta, 0.18) })); });

  // ── e4、e5：塔越过「定了」那道线往上长；每写下一块，塔就高一截 ──
  const towerN = (t) => 1.2 * ramp(t, T('e4') + 0.2, 1.4, ease.io3) + thinkT.reduce((a, k, i) => a + 0.16 * ramp(t, tw(i), 0.2), 0);
  const tower = column(W, S, TXc, SY0, { w: 150, d: 100, seg: SEG, n: towerN, op: fadeOut });
  tower.g.classList.add('tall');
  const l4 = W.board('<div class="lbl l">能想多远：没有定死　↑</div>', TXc + 110, SY0 + 51, H + 140, 0, -40);
  fade(W, l4, (t) => ramp(t, T('e4', '没有定死') - 0.3, 0.4) * fadeOut(t));
  sfx('riser', T('e4') + 0.2, { g: 0.12 });

  // ── e6：框出写下的几行——先思考＝先写下来；最后一行的答案亮起 ──
  const thinkOn = (t) => ramp(t, T('e6', '思考') - 0.2, 0.4) * fadeOut(t);
  [...new Set(thinkT.map((k) => k.line))].forEach((ln) => {
    const ix = thinkT.filter((k) => k.line === ln).map((k) => k.i);
    rectOf(W, S, M, ix[0], ix[ix.length - 1], thinkOn, 'g');
  });
  const tl = W.board('<div class="lbl l" style="transform:translateX(-100%)">思考</div>', MX - 40, MY + 62, 30, 0, -40);
  const tl2 = W.board('<div class="lbl l" style="transform:translateX(-100%)">＝ 写下来</div>', MX - 40, MY + 62, 30, 0, 40);
  fade(W, tl, thinkOn); fade(W, tl2, (t) => ramp(t, T('e6', '写下来') - 0.3, 0.4) * fadeOut(t));
  ansG.slice(2).forEach((k, i) => glow(W, k.b, (t) => ramp(t, T('e6', '写下来') + 0.5 + i * 0.08, 0.25) * fadeOut(t)));
  sfx('tick', T('e6', '思考') - 0.2, { g: 0.2 }); sfx('chime', T('e6', '写下来') + 0.5, { g: 0.18 });

  // ── 片名 ──
  const TC = blankCam(-200, 2000);
  const tt = T('e7') - 0.15;
  const tc = W.print('<div class="title-cot" style="transform:translate(-50%,-50%)">CoT</div>', TC.cx, TC.cy - 70);
  const tz = W.print('<div class="title-zh" style="transform:translate(-50%,-50%)">先思考，再回答</div>', TC.cx, TC.cy + 120);
  fade(W, tc, (t) => ramp(t, tt, 0.9)); fade(W, tz, (t) => ramp(t, tt + 0.6, 0.9));

  // ── 镜头：从正俯视的空纸倾下来（与上一章末尾对齐）；e3、e4 看一摞层和塔；e5 退一次收进写下的字；片名正俯视 ──
  const B0 = blankCam(SX0 + 300, SY0 + 300);
  const towerBox = [B(SX0, SY0, 150, 100, H + 20), B(TXc, SY0, 150, 100, 1.5 * SEG), [SX0 - 130, SY0 + 51, H + 8], [TXc + 150, SY0 + 51, H + 8], { el: l3 }, { el: l4 }];
  const shTower = fitCam(W, towerBox, { pitch: 48, yaw: -4 });
  const shEnd = fitCam(W, [...towerBox, ...M.map((k) => B(k.x, k.y, k.w, k.d, 26)), { el: tl }, { el: tl2 }], { pitch: 48, yaw: -4 });
  W.cam([
    [s.start, B0, 0.01],
    [T('e3') - 0.9, shTower, 1.6],
    [T('e5') - 0.5, shEnd, 1.4],
    [tOut, TC, 1.3],
    [null, { ...TC, cy: TC.cy + 22 }, Math.max(0.5, s.end + 0.5 - tOut - 1.3), (k) => k],   // 片名停留：只朝一个方向极慢地移
  ]);
  sfx('whoosh', T('e3') - 0.9, { g: 0.18 }); sfx('whoosh', tOut, { g: 0.22 });
});
