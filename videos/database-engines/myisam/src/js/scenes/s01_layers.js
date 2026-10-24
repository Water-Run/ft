// 01 引擎的位置。主画面：MySQL 的两层。开场那条查询从上层走过（解析 → 执行计划），经接口落到下层的存储引擎，再到磁盘；
// 下层的「卡带」可以换（引擎列表取自 SHOW ENGINES 实测，FACTS「01」）；最后在版本轴上：3.23 接替 ISAM，5.5 之前一直是默认。
scene('s1', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);

  // ── 上层：理解 SQL ──
  const up = h('div', 'blk', world); px(up, 300, 150, 1320, 236);
  const upL = lab(world, 330, 164, '上层 · SQL');
  const parse = h('div', 'blk', world); px(parse, 560, 250, 300, 96);
  const plan = h('div', 'blk', world); px(plan, 1060, 250, 380, 96);
  for (const [e, s_] of [[parse, '解析语句'], [plan, '选择执行计划']]) { const t_ = h('div', 'abs t-body', e, s_); css(t_, { left: 0, right: 0, top: '20px', textAlign: 'center' }); }
  const aP = path(ov, 'M 870 298 L 1050 298', 'dim', { w: 2.5 });
  // ── 下层：存储引擎 ──
  const lo = h('div', 'blk', world); px(lo, 300, 590, 960, 210);
  const loL = lab(world, 330, 604, '下层');
  const slot = h('div', 'abs', world); px(slot, 520, 664, 400, 96); css(slot, { border: '2px dashed #4a4a4a' });
  const engT = h('div', 'abs t-big', world, '存储引擎'); px(engT, 970, 676); css(engT, { color: '#F29111' });
  // 磁盘
  const disk = h('div', 'abs', world); px(disk, 300, 880, 960, 28);
  for (let i = 0; i < 64; i++) { const c = h('div', 'abs', disk); px(c, i * 15, 0, 13, 28); css(c, { background: i < 8 ? '#F29111' : (Math.floor(i / 8) % 2 ? '#1f4a54' : '#2b606c') }); }
  const diskL = lab(world, 1290, 872, '磁盘');
  const aDown = path(ov, 'M 700 806 L 700 868', 'teal', { w: 2.5 }), aUp = path(ov, 'M 760 868 L 760 806', 'teal', { w: 2.5 });

  wipe(up, c0 + 0.1, { dir: 'l', d: 0.5 }); appear(upL, c0 + 0.3);
  wipe(lo, T('a1', '两层') - 0.1, { dir: 'l', d: 0.5 }); appear(loL, T('a1', '两层') + 0.1); sfx('thud', T('a1', '两层'), { g: 0.5 });
  wipe(parse, T('a2', '解析') - 0.15, { dir: 'l', d: 0.35 }); sfx('pop', T('a2', '解析'), { g: 0.5 });
  arrowIn(aP, T('a2', '选择') - 0.35, 0.35);
  wipe(plan, T('a2', '选择') - 0.1, { dir: 'l', d: 0.35 }); sfx('pop', T('a2', '选择'), { g: 0.5 });
  appear(slot, T('a3') - 0.1);
  wipe(disk, T('a3', '磁盘') - 0.2, { dir: 'l', d: 0.6 }); appear(diskL, T('a3', '磁盘')); sfx('drive', T('a3', '磁盘') - 0.2, { g: 0.6 });
  arrowIn(aDown, T('a3', '写进') - 0.1, 0.4); arrowIn(aUp, T('a3', '读出') - 0.1, 0.4);
  slam(engT, T('a4', '存储'), { from: 1.3 }); sfx('thud', T('a4', '存储'), { g: 0.6 });

  // 开场那条查询：一个小令牌，从左边进来，走过解析与执行计划，落到接口
  const tok = h('div', 'abs mono', world, "SELECT … name = 'alice'"); css(tok, { fontSize: '26px', color: '#F29111', background: '#0b0b0c', padding: '2px 8px', border: '2px solid #F29111' });
  const path0 = [[T('a2') - 0.2, 320, 204], [T('a2', '解析') + 0.1, 600, 204], [T('a2', '选择') + 0.2, 1100, 204]];

  // ── 接口：一组固定的方法，连接两层 ──
  const band = h('div', 'abs', world); px(band, 300, 440, 1320, 96);
  const bandL = lab(world, 300, 400, '接口 · handler');
  const calls = ['write_row()', 'rnd_next()', 'index_read_map()', 'update_row()', 'delete_row()'];
  const chips = []; let cx = 0;
  calls.forEach((c, i) => { const e = h('div', 'blk mono', band, c); const w = c.length * 18 + 44; px(e, cx, 14, w, 66); css(e, { fontSize: '30px', lineHeight: '62px', textAlign: 'center', color: i < 3 ? '#d9d9d9' : '#808080' }); chips.push(e); cx += w + 22; });
  appear(bandL, T('a5', '接口') - 0.2);
  chips.forEach((e, i) => slide(e, T('a5', '接口') - 0.1 + i * 0.1, { y: 18, d: 0.4 }));
  sfx('tick', T('a5', '接口'), { g: 0.5 });
  const lit = [T('a6', '写入'), T('a6', '读下'), T('a6', '按索引')];
  lit.forEach((t_, i) => { classAt(chips[i], 'c-o', t_ - 0.1, i < 2 ? lit[i + 1] - 0.1 : Tend('a6') + 0.6); sfx('blip', t_, { g: 0.45 }); });
  // 令牌：走完上层后，沿 index_read_map 落到下层
  const bIdx = { x: 300 + chips[2].offsetLeft, w: chips[2].offsetWidth };
  const tArr = lit[2] + 0.6;
  path0.push([T('a5', '接口') + 0.4, 1100, 204], [lit[2] - 0.1, bIdx.x + 10, 458], [tArr, 590, 690]);
  F((t) => {
    const P = path0; let x = P[0][1], y = P[0][2];
    if (t >= P[P.length - 1][0]) { x = P[P.length - 1][1]; y = P[P.length - 1][2]; }
    else for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const k = ease.io3(clamp((t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]))); x = lerp(P[i - 1][1], P[i][1], k); y = lerp(P[i - 1][2], P[i][2], k); break; }
    tok.style.left = x + 'px'; tok.style.top = y + 'px';
  });
  show(tok, T('a2') - 0.2, { y: 0, x: -20, d: 0.4 });
  vanish(tok, tArr + 0.05);

  // ── 卡带：引擎可以换 ──
  const names = ['MyISAM', 'InnoDB', 'MEMORY', 'CSV', 'ARCHIVE'];
  const SPX = 1340, SPY = 600, SLX = 530, SLY = 674;
  const carts = names.map((n, i) => { const e = h('div', 'blk mono', world, n); px(e, i === 0 ? SLX : SPX, i === 0 ? SLY : SPY + (i - 1) * 74, 380, 76); css(e, { fontSize: '34px', lineHeight: '72px', textAlign: 'center', color: i === 0 ? '#F29111' : '#808080', borderColor: i === 0 ? '#F29111' : '#2c2e31' }); return e; });
  carts.forEach((e, i) => css(e, { height: (i === 0 ? 76 : 62) + 'px', lineHeight: (i === 0 ? 72 : 58) + 'px', fontSize: (i === 0 ? 34 : 28) + 'px', width: (i === 0 ? 380 : 300) + 'px' }));
  wipe(carts[0], T('a3') + 0.2, { dir: 'l', d: 0.4 });
  classAt(carts[0], 'f-hot', tArr, tArr + 0.6); sfx('pop', tArr, { g: 0.5 });   // 查询落到引擎
  carts.slice(1).forEach((e, i) => slide(e, T('a7', '替换') - 0.5 + i * 0.1, { x: 30, d: 0.4 }));
  // 换一次：MyISAM 出去、InnoDB 进来；再换回来。每段都显式给起止
  const tA = T('a7', '替换'), tB = T('a7', '只要') + 0.1, tC = Tend('a8') - 0.2;
  fromTo(carts[0], tA, { x: 0, y: 0 }, { x: SPX - SLX, y: SPY - SLY, duration: 0.55, ease: 'power3.inOut' });   // 两张卡带对调位置
  fromTo(carts[1], tA + 0.35, { x: 0, y: 0 }, { x: SLX - SPX, y: SLY - SPY, duration: 0.6, ease: 'power3.out' });
  sfx('thud', tA + 0.85, { g: 0.55 });
  // 同一元素的第二段：不立即渲染，否则会把第一段之前的画面也改掉
  fromTo(carts[1], tC, { x: SLX - SPX, y: SLY - SPY }, { x: 0, y: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
  fromTo(carts[0], tC + 0.3, { x: SPX - SLX, y: SPY - SLY }, { x: 0, y: 0, duration: 0.55, ease: 'power3.inOut', immediateRender: false });
  sfx('thud', tC + 0.8, { g: 0.55 });
  // 接口不变：换卡带的时候，接口那一排一起亮一下
  chips.slice(0, 3).forEach((e, i) => classAt(e, 'c-t', tB + i * 0.12, tB + 1.4));
  const keep = lab(world, 330, 340, '不关心数据怎样存放', 'c-t');
  appear(keep, T('a8') + 0.1); sfx('tick', T('a8') + 0.1, { g: 0.4 });

  // ── 版本轴：3.23 接替 ISAM；5.5 之前默认 ──
  const AX = 2120, AW = 1560, AY = 560;
  const vers = ['3.22', '3.23', '4.0', '4.1', '5.0', '5.1', '5.5', '5.6'];
  const vx = (i) => AX + i * (AW / (vers.length - 1));
  const axis = h('div', 'abs', world); px(axis, AX, AY, AW, 3); css(axis, { background: '#4a4a4a' });
  const vt = vers.map((v, i) => { const e = h('div', 'abs mono', world, v); px(e, vx(i) - 30, AY + 22); css(e, { fontSize: '30px', color: '#808080', width: '60px', textAlign: 'center' }); const tk_ = h('div', 'abs', world); px(tk_, vx(i) - 1, AY - 10, 3, 23); css(tk_, { background: '#4a4a4a' }); return [e, tk_]; });
  const isam = h('div', 'abs mono', world, 'ISAM'); px(isam, vx(0), AY - 120, vx(1) - vx(0) - 6, 72); css(isam, { background: '#151618', color: '#8a8a8a', fontSize: '32px', lineHeight: '72px', paddingLeft: '18px', textDecoration: 'line-through' });
  const myi = h('div', 'abs mono', world, 'MyISAM'); px(myi, vx(1), AY - 120, 0, 72); css(myi, { background: '#F29111', color: '#0b0b0c', fontSize: '32px', lineHeight: '72px', paddingLeft: '18px', overflow: 'hidden' });
  const dflt = lab(world, vx(1) + 4, AY - 172, '默认的存储引擎', 'c-o');
  const inno = h('div', 'abs mono', world, 'InnoDB'); px(inno, vx(6) + 6, AY - 120, vx(7) - vx(6) - 6, 72); css(inno, { border: '2px solid #3fb4cc', color: '#3fb4cc', fontSize: '32px', lineHeight: '68px', paddingLeft: '14px' });
  const t9 = T('a9a') - 0.1;
  wipe(axis, t9, { dir: 'l', d: 0.6 }); vt.forEach(([e, k], i) => { appear(e, t9 + 0.2 + i * 0.06); appear(k, t9 + 0.2 + i * 0.06); });
  sfx('tick', t9 + 0.3, { g: 0.5 });
  wipe(isam, T('a9a', 'I SAM') - 0.4, { dir: 'l', d: 0.4 });
  fromTo(myi, T('a9a', '三点') - 0.1, { width: 0 }, { width: 24, duration: 0.35, ease: 'power2.out' });
  sfx('pop', T('a9a', '三点'), { g: 0.6 });
  fromTo(myi, T('a9', '5.5') - 0.2, { width: 24 }, { width: vx(6) - vx(1) - 6, duration: 1.6, ease: 'power2.inOut' });
  appear(dflt, T('a9', '默认'));
  wipe(inno, T('a9', '5.5') + 1.5, { dir: 'l', d: 0.4 }); sfx('thud', T('a9', 'My ISAM'), { g: 0.5 });
  const ast = lab(world, vx(6) - 40, AY + 80, '5.5 起默认改为 InnoDB', 'c-t'); appear(ast, T('a9', 'My ISAM') + 0.3);

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.02 }, T('a2') - c0 - 0.6, { ease: 'none', sfx: false }],
    [T('a2') - 0.4, { x: 960, y: 330, z: 1.22 }, 1.0, { sfx: false }],
    [Tend('a2') + 0.15, { x: 860, y: 700, z: 1.2 }, 0.9, { g: 0.4 }],
    [Tend('a4') + 0.1, { x: 960, y: 520, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.03 }, T('a7') - Tend('a4') - 1.1, { ease: 'none', sfx: false }],
    [T('a7') - 0.3, { x: 1010, y: 600, z: 1.08 }, 1.0, { sfx: false }],
    [Tend('a8') + 0.1, { x: 2900, y: 520, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.05 }, s.end - Tend('a8') - 1.4, { ease: 'none', sfx: false }],
  ]);
});
