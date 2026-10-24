// 开场：一条查询 → 一行结果 → 零点零零七秒；查询与磁盘之间的部件叫存储引擎；标题；alice 那一行摊开成 16 个字节。
// 0.007 秒是 9.7.4 上同样 8 行的表实测的客户端回显（FACTS「开场」）；磁盘条是 5.5.62 快照 users.MYD 的 128 个字节。
scene('intro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const rows = rowsOf(R.usersMYD[0]);

  // ── 第一站：终端 ──
  const t = term(world, 120, 128, 1680, 440, '<b>mysql</b>  myisam_demo');
  wipe(t.el, 0.1, { dir: 'l', d: 0.5 });
  const tq = 0.35, tEnd = t.cmd("<span class=\"k\">SELECT</span> * <span class=\"k\">FROM</span> users <span class=\"k\">WHERE</span> name = 'alice';", tq, { cps: 36 });
  const tOut = Math.max(tEnd + 0.15, T('h1', '一行') - 0.1);
  const tab = asciiTable(['id', 'name', 'age'], [[1, 'alice', 30]], [true, false, true]);
  const outRows = t.lines(tab, tOut, { step: 0.03 });
  const res = outRows[3];                                           // | 1 | alice | 30 |
  const sec = t.line('1 row in set (0.007 sec)', T('h1', '零') - 0.15, { snd: 'tick', g: 0.6 });
  classAt(sec, 'c-o', T('h1', '零') - 0.15);
  classAt(res, 'c-o', T('h3') - 0.2, T('h7') - 0.2);

  // ── 查询之下：磁盘上的字节（128 个，一格一个），alice 的 16 个在最前面 ──
  const STRIP_Y = 800, CW = 13, X0 = 128;
  const strip = h('div', 'abs', world); px(strip, X0, STRIP_Y, 128 * CW, 30);
  const small = [];
  for (let i = 0; i < 128; i++) {
    const c = h('div', 'abs', strip); px(c, i * CW, 0, CW - 2, 30);
    css(c, { background: i < 16 ? '#F29111' : (Math.floor(i / 16) % 2 ? '#1f4a54' : '#2b606c') });
    small.push(c);
  }
  const disk = lab(world, 128, STRIP_Y - 52, '磁盘');
  wipe(strip, T('h2', '磁盘') - 0.1, { dir: 'l', d: 0.9 }); sfx('drive', T('h2', '磁盘') - 0.1, { g: 0.7 });
  appear(disk, T('h2', '磁盘') - 0.1);

  // 从结果那一行往下，到磁盘：数据放在哪里，怎样被找到
  const ov = overlay(world);
  const down = path(ov, 'M 960 578 L 960 784', 'dim', { w: 2.5, dashed: '8 8' });
  arrowIn(down, T('h3') - 0.1, 0.6);
  const q1 = lab(world, 996, 600, '放在哪里？', 'c-h'), q2 = lab(world, 996, 652, '怎样找到？', 'c-h');
  slide(q1, T('h3', '放在'), { x: -20, d: 0.4 }); sfx('pop', T('h3', '放在'), { g: 0.5 });
  slide(q2, T('h3', '怎样'), { x: -20, d: 0.4 }); sfx('pop', T('h3', '怎样'), { g: 0.5 });
  // 回答这些问题的部件：存储引擎，夹在查询与磁盘之间
  const eng = h('div', 'blk', world); px(eng, 640, 618, 640, 92);
  const engT = h('div', 'abs t-big', eng, '存储引擎'); css(engT, { left: 0, right: 0, top: '12px', textAlign: 'center', color: '#F29111' });
  hide([q1, q2], T('h4', '存储') - 0.5, { y: 0, d: 0.3 });
  wipe(eng, T('h4', '存储') - 0.2, { dir: 't', d: 0.45 }); sfx('thud', T('h4', '存储'), { g: 0.6 });

  // ── 第二站（上方）：标题 ──
  const kick = h('div', 'abs', world, '一个数据库引擎是如何实现的？'); px(kick, 120, -770); css(kick, { font: '500 56px "Sans SC"', color: '#8a8a8a' });
  const title = h('div', 'abs d-1', world, ''); px(title, 108, -690); css(title, { color: '#F29111', fontSize: '170px' });
  const era = h('div', 'abs mono', world, 'MySQL 5.0 · 5.1 · 5.5'); px(era, 124, -430); css(era, { fontSize: '40px', color: '#3fb4cc' });
  const tT = T('hT');
  show(kick, tT + 0.25, { y: 0, d: 0.5 });
  typeText(title, '从 MyISAM 说起', tT + 0.6, 14, { cursorUntil: Tend('h6'), sfxGain: 0.6 });
  sfx('thud', tT + 0.6, { g: 0.5 });
  wipe(era, T('h6', 'MySQL') - 0.1, { dir: 'l', d: 0.6 }); sfx('tick', T('h6', 'MySQL'), { g: 0.5 });

  // ── 回到磁盘：alice 的 16 个字节摊开 ──
  const BIG_X = 160, BIG_W = 100, BIG_Y = 610;
  const tU = T('h7', '字节') - 0.3;
  hide([eng, q1, q2], tU - 0.5, { y: 0, d: 0.3 });
  tl.to(down, { autoAlpha: 0, duration: 0.3 }, tU - 0.5);
  tl.to(small.slice(16), { opacity: 0.35, duration: 0.6 }, tU);
  const bytes0 = rows[0].match(/../g);
  bytes0.forEach((b, c) => {
    const e = h('div', 'abs mono ' + userCls(c, b), world, b);
    css(e, { textAlign: 'center', lineHeight: '84px', background: '#111214', border: '2px solid #2c2e31', overflow: 'hidden' });
    fromTo(e, tU + c * 0.04, { left: X0 + c * CW, top: STRIP_Y, width: CW - 2, height: 30, fontSize: 0, autoAlpha: 1 },
      { left: BIG_X + c * BIG_W, top: BIG_Y, width: BIG_W - 8, height: 88, fontSize: 40, duration: 0.7, ease: 'power3.inOut' });
    vanish(e, 0); appear(e, tU + c * 0.04);
  });
  sfx('riser', tU - 0.9, { g: 0.35 }); sfx('pop', tU + 0.7, { g: 0.6 });

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [0.2, { z: 1.03 }, T('h1', '零') - 0.6, { ease: 'none', sfx: false }],
    [T('h1', '零') - 0.35, { x: 760, y: 430, z: 1.32 }, 1.0, { sfx: false }],
    [Tend('h1') + 0.25, { x: 960, y: 540, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.025 }, T('hT') - Tend('h1') - 1.4, { ease: 'none', sfx: false }],
    [T('hT') - 0.1, { x: 960, y: -560, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.035 }, Tend('h6') - T('hT') - 1.2, { ease: 'none', sfx: false }],
    [Tend('h6') + 0.1, { x: 960, y: 620, z: 1.06 }, 1.0, { g: 0.45 }],
    [null, { z: 1.1 }, s.end - Tend('h6') - 1.3, { ease: 'none', sfx: false }],
  ]);
});
