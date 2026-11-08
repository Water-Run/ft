// 结尾：回到主旨，落到片名。每一摞一样高——层数造好就定了（谁也越不过那道线）；能想多远，看后面还接了多少摞：笔每写下一步，就多接一摞。
// 事实：S4、a7（层数固定）；S7；L3（先写过程）。
scene('end', ({ root, s }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const W = makeWorld(world, blankCam(0, 92 + TILE));
  const XS = [-700, -350, 0, 350, 700], SY = -230, RW = 270, RD = 170, H = 96 * 6, wallY = SY + RD / 2 + 3;
  const tOut = Tend('e6') + 0.35, offT = (t) => 1 - ramp(t, tOut, 0.55);

  // 笔写下的中间步骤：写一行，后面就多接一摞
  const MX = -700, MY = SY + 470, LH = 120;
  const lines = ['25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896 ……'];
  const t50 = T('e5', '回答之前') - 0.15, t51 = T('e5', '中间步骤') + 0.55, tm = (t50 + t51) / 2;
  const TL = [W.write(lines[0], MX, MY, { fs: 82, t0: t50, t1: tm - 0.05, off: offT }), W.write(lines[1], MX, MY + LH, { fs: 82, t0: tm + 0.05, t1: t51, off: offT })];

  // 一摞摞，一样高
  const ups = [T('e3') - 0.7, T('e4') + 0.1, T('e4', '没有定死') - 0.2, tm - 0.2, t51 - 0.2];
  const ST = XS.map((x, i) => { const ta = ups[i], r_ = seeded(80 + i), fill = (t) => ramp(t, ta + 0.35, 0.8, linear); const S = stack(W, x, SY, { w: RW, d: RD, n: 96, gap: 6, rise: (t) => ramp(t, ta, 0.8, ease.out3) * offT(t), fill, op: offT }); for (let j = 0; j < 20; j++) { const fr = 0.06 + r_() * 0.88, wd = 14 + r_() * 56, lf = 14 + r_() * (RW - 100); S.note(`<i style="width:${wd.toFixed(0)}px;margin-left:${lf.toFixed(0)}px"></i>`, fr, (t) => clamp((fill(t) - fr) * 26)); } return S; });
  ups.forEach((a, i) => sfx(i ? 'pop' : 'riser', a, { g: 0.14 }));

  // 那道线：层数造好就定了，谁也越不过去
  const wf = W.wall(wallY);
  W.stroke([[XS[0] - 175, -H - 12], [XS[4] + 175, -H - 12]], { svg: wf, t0: T('e3', '定了') - 0.4, t1: T('e3', '定了') + 0.4, w: 9, pen: false, amp: 1.5, off: offT });
  const l3 = W.wallText('层数：造好就定了', XS[0] - 175, wallY, H + 92, 100, (t) => ramp(t, T('e3', '定了') - 0.5, 0.5) * offT(t), 'bold');
  sfx('tick', T('e3', '定了') - 0.4, { g: 0.2 });

  // 能想多远：一道往后伸的箭头
  const AYf = SY + RD / 2 + 110, tA0 = T('e4') + 0.15;
  W.arrow([[XS[0] - 175, AYf], [XS[4] + 175, AYf]], { t0: tA0, t1: t51 + 0.3, w: 9, head: 40, off: offT, pen: false, ease: linear });
  const l4 = W.write('能想多远：没有定死', 0, AYf + 112, { fs: 104, align: 'c', cls: 'bold', t0: T('e4', '没有定死') - 0.5, t1: T('e4', '没有定死') + 0.3, off: offT, pen: false });

  // 思考就是写下来
  const tT = T('e6', '思考') - 0.15, x0 = Math.min(...TL.map((l) => l.x0)) - 40, x1 = Math.max(...TL.map((l) => l.x1)) + 40;
  W.box(x0, MY - 76, x1, MY + LH + 76, { t0: tT, t1: tT + 0.7, w: 7, off: offT });
  const w6 = W.write('思考 ＝ 写下来', x1 + 70, MY + LH / 2, { fs: 112, cls: 'bold', t0: T('e6', '写下来') - 0.55, t1: T('e6', '写下来') + 0.3, off: offT });
  sfx('tick', tT, { g: 0.2 }); sfx('chime', T('e6', '写下来'), { g: 0.16 });

  // 片名：最后一句
  const TY = -2000, tt0 = T('e7') - 0.05;
  const tc = W.write('CoT', 0, TY - 90, { fs: 320, align: 'c', cls: 'bold', t0: tt0, t1: tt0 + 0.5 });
  const tz = W.write('先思考，再回答', 0, TY + 170, { fs: 112, align: 'c', t0: tt0 + 0.1, t1: Tend('e7') - 0.1 });

  // ── 镜头 ──
  const shEnd = fitCam(W, [...ST.map((q) => q.box), ...TL, w6, l4, [XS[0] - 175, wallY, H + 190]], { pitch: 40, cz: H * 0.4 });
  const shT = fitCam(W, [tc, tz], { pitch: 22, kmax: 1.1, safe: { l: 300, r: 1620, t: 170, b: 900 } });
  W.cam([
    [T('e3') - 0.95, shEnd, 2.0],
    [tOut, shT, 1.7],
    [s.end - 1.0, blankCam(0, -2880), 1.35],
  ]);
  sfx('whoosh', T('e3') - 0.95, { g: 0.14 }); sfx('whoosh', tOut, { g: 0.16 });
});
