// 收束：第一次看你拿出的证据（密码、手机、钥匙），之后认你带回的编号或票（Session ID、JWT）→ 服务器认的从来不是你本人，而是你出示的证据。
// 换场时一只黑框从上面落下；e2 时大黑框把这些证据框住，黄三角（你本人）始终在框外。结论两行从 e2 开始一直留到片尾名单（约 6 秒），读得完。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const isZh = zh(), KW = (id, zhw, enw) => T(id, { zh: zhw, en: enw });
  // ── e1：两栏 ──
  const t1 = c0 + 0.05;
  const colA = word(world, tr('第一次', 'The first time'), 760, 190, 48, { w: 900 }), colB = word(world, tr('之后', 'After that'), 1300, 190, 48, { w: 900 });
  const pw = shape(world, 'circle', 760, 280, 130, C.red, { name: 'password' });
  const ph = shape(world, 'square', 920, 280, 130, C.blue, { name: 'phone' });
  const key = keyShape(world, 760, 450, 290, 120, [0.3, 0.9, 0.5, 1, 0.2], C.red);
  const stub = blk(world, 'bg-blue', 1300, 280, 130, 300); stub.dataset.name = 'session-id-stub';
  const stubT = mono(world, DATA.sid.slice(0, 8) + '<br>' + DATA.sid.slice(8), 1310, 360, 26, { color: C.paper, w: 800 }); css(stubT, { lineHeight: '1.5' });
  const jw = h('div', 'abs', world); px(jw, 1470, 280, 300, 80); [C.ink, C.yel, C.red].forEach((c, i) => { const b = blk(jw, '', i * 102, 0, 96, 80); b.style.background = c; }); jw.dataset.name = 'jwt-mini';
  const tA = Math.max(t1, Q(KW('e1', '第一次', 'First')) - 0.1), tB = Math.max(tA + 0.5, Q(KW('e1', '之后', 'after that')) - 0.1);
  wipe(colA, tA, { dir: 'l', d: 0.25 }); [pw, ph, key].forEach((e, i) => slide(e, tA + 0.1 + i * 0.1, { y: -80, d: 0.25, ease: STEP(0.25) })); sfx('tick', tA + 0.1, { g: 0.6, p: -0.2 });
  wipe(colB, tB, { dir: 'l', d: 0.25 }); [stub, jw].forEach((e, i) => slide(e, tB + 0.1 + i * 0.1, { y: -80, d: 0.25, ease: STEP(0.25) })); appear(stubT, tB + 0.35); sfx('tick', tB + 0.1, { g: 0.6, p: 0.3 });
  // ── 你本人：一只大黄三角，从左下角伸进来，始终在框外 ──
  const you = shape(world, 'tri', -80, 360, 620, C.yel, { name: 'you', bleed: true });
  const youL = word(world, tr('你本人', 'You'), 120, 230, 64, { w: 900 });
  slide(you, t1, { x: -300, d: 0.33, ease: STEP(0.33) }); wipe(youL, t1 + 0.2, { dir: 'l', d: 0.25 }); sfx('thud', t1 + 0.2, { g: 0.6, p: -0.6 });
  // ── e2：大黑框落下，把证据框住；结论两行 ──
  const tE = Q(T('e2')) - 0.1;
  const big = frame(world, 700, 160, 1120, 540, { bw: 22, name: 'server' });
  const bigL = word(world, tr('服务器', 'Server'), 1580, 710, 44, { w: 900 });
  fromTo(big.el, tE, { autoAlpha: 0, y: -700 }, { autoAlpha: 1, y: 0, duration: 0.33, ease: STEP(0.33) }); appear(bigL, tE + 0.33);
  sfx('thud', tE + 0.33, { g: 0.95 });
  [colA, colB].forEach((e) => to(e, tE + 0.33, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' }));
  const l1 = word(world, tr('服务器认的从来不是你本人，', 'A server never recognizes you,'), 600, 760, isZh ? 64 : 56, { w: 900 });
  const l2 = word(world, tr('而是你出示的证据。', 'only the proof you present.'), 600, 850, isZh ? 64 : 56, { w: 900 }); css(l2, { background: C.yel, padding: '0 14px' });
  l1.dataset.name = 'conclusion'; l2.dataset.name = 'conclusion';
  slam(l1, tE + 0.15, { from: 1.15, d: 0.25 }); sfx('pop', tE + 0.15, { g: 0.6 });
  const tL2 = Math.max(tE + 0.8, Q(KW('e2', '而是', 'only')) - 0.1); slam(l2, tL2, { from: 1.2, d: 0.25 }); sfx('thud', tL2, { g: 0.8 });
  to(youL, tE + 0.33, { autoAlpha: 0, duration: 0.17, ease: 'steps(2)' });
  cam.track(s.start, { x: 960, y: 484, z: 0.98 }, [
    [c0 + 0.05, { z: 1 }, 0.5, { sfx: false }],
    [c0 + 0.6, { z: 1.035 }, Math.max(0.4, s.end - c0 - 0.65), { ease: 'none', sfx: false }],
  ]);
});
