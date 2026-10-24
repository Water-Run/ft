// 10 五个问题。主画面：五块小画面，每块重演前面那一章的过程（字节一行接一行、B 树往下走、空位被填、读写排队、检查与修复），
// 讲到哪个问题，哪一块亮起来、动起来；然后是时间轴：2010 年 5.5 把默认引擎换成 InnoDB（行级锁、事务、崩溃恢复），
// 同一句 ROLLBACK 在 InnoDB 的副本上撤回了（9.7.4 实测 out_06）；最后停在这张表的三个文件上。FACTS「10」「新版扩充」n4b、n8b、「时间轴的年份」。
scene('s10', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const ov = overlay(world);

  // ── 第一站：五个问题，五个小画面。每一块重演那一章的过程；讲到哪一块，哪一块亮起来、动起来（答案由旁白说，不再写成一张表）──
  const TW = 540, THt = 330, TILES = [
    ['n3', '数据怎么放', 120, 150], ['n4', '怎么找', 690, 150], ['n4b', '改和删', 1260, 150],
    ['n5', '怎么并发', 405, 530], ['n6', '出错怎么办', 975, 530],
  ];
  const tiles = TILES.map(([cue, q, x, y], i) => {
    const b = h('div', 'blk', world); px(b, x, y, TW, THt);
    const ql = h('div', 'abs', b, q); px(ql, 24, 18); css(ql, { font: '700 34px "Sans SC"', color: '#d9d9d9' });
    const art = h('div', 'abs', b); px(art, 24, 86, TW - 48, THt - 110);
    wipe(b, c0 + 0.15 + i * 0.1, { dir: 't', d: 0.4 }); sfx('tick', c0 + 0.15 + i * 0.1, { g: 0.3 });
    const t0 = T(cue) - 0.2, t1 = Tend(cue) + 0.3;
    classAt(b, 'lit', t0, t1);
    return { b, art, t0, t1, cue };
  });
  const cell = (par, x, y, w, hh, bg) => { const e = h('div', 'abs', par); px(e, x, y, w, hh); css(e, { background: bg }); return e; };
  // 1 数据怎么放：一个数据文件，四行 × 16 字节，一行接一行写进去
  { const { art, t0 } = tiles[0], rows = [];
    for (let r = 0; r < 4; r++) for (let k = 0; k < 16; k++) { const e = cell(art, k * 30, r * 48, 26, 36, k === 0 ? '#3fb4cc' : k === 15 ? '#a6d36b' : '#2b606c'); rows.push([r, e]); }
    rows.forEach(([r, e], j) => { classAt(e, 'dimmed', 0, t0 + 0.3 + r * 0.35 + (j % 16) * 0.015); });
    const cur = ring(art, { x: -6, y: -6, w: 16 * 30 + 8, h: 48 }); vanish(cur, 0); appear(cur, t0 + 1.8);
    F((t) => { const k = clamp(Math.floor((t - t0 - 1.8) / 0.5), 0, 3); cur.style.top = (-6 + k * 48) + 'px'; });
    sfx('drive', t0 + 0.3, { g: 0.35 }); }
  // 2 怎么找：B 树从根往下走到叶子，再落到数据文件里的那一行
  { const { art, t0 } = tiles[1];
    const R0 = cell(art, 200, 0, 92, 34, '#1d1f22'), M = [0, 1, 2].map((k) => cell(art, 40 + k * 150, 70, 92, 30, '#1d1f22')), Lf = [0, 1, 2, 3, 4, 5].map((k) => cell(art, k * 82, 130, 70, 26, '#1d1f22'));
    [R0, ...M, ...Lf].forEach((e) => css(e, { border: '2px solid #4a4a4a' }));
    const strip = [...Array(16)].map((_, k) => cell(art, k * 30, 186, 26, 22, '#2b606c'));
    const lit = [[R0, 0.3], [M[1], 0.8], [Lf[3], 1.3], [strip[9], 1.9]];
    lit.forEach(([e, d]) => { classAt(e, 'lit-cell', t0 + d, Infinity); sfx('tick', t0 + d, { g: 0.35 }); });
    classAt(strip[9], 'hot-cell', t0 + 1.9, Infinity); }
  // 3 改和删：原地覆盖；删掉的留下空位；后来的行填进空位
  { const { art } = tiles[2], cs = [...Array(8)].map((_, k) => cell(art, k * 60, 60, 52, 60, '#2b606c'));
    classAt(cs[1], 'hot-cell', T('n4b', '原地') - 0.1, T('n4b', '删掉') - 0.2);
    classAt(cs[3], 'hole', T('n4b', '空位') - 0.2, T('n4b', '后来') + 0.2); classAt(cs[5], 'hole', T('n4b', '空位'), Infinity);
    const nw = cell(art, 3 * 60, -40, 52, 60, '#F29111'); vanish(nw, 0);
    fromTo(nw, T('n4b', '后来') - 0.2, { y: -40, autoAlpha: 1 }, { y: 100, duration: 0.45, ease: 'power3.in' }); appear(nw, T('n4b', '后来') - 0.2);
    sfx('thud', T('n4b', '空位'), { g: 0.4 }); sfx('pop', T('n4b', '后来') + 0.25, { g: 0.45 }); }
  // 4 怎么并发：两个读一起读，写的那一条排队，等读完才独占
  { const { art, t0, t1 } = tiles[3], LW = 470;
    [0, 1, 2].forEach((k) => cell(art, 0, k * 62 + 54, LW, 2, '#2c2e31'));
    const bars = [[0, 0.05, 0.55, '#3fb4cc'], [1, 0.15, 0.6, '#3fb4cc'], [2, 0.2, 0.6, '#3a3c40'], [2, 0.6, 0.95, '#F29111']].map(([l, a, b, c]) => { const e = cell(art, a * LW, l * 62 + 10, 0, 34, c); return [e, a, b]; });
    const dur = Math.max(2.2, t1 - t0 - 0.3);
    bars.forEach(([e, a, b]) => fromTo(e, t0 + a * dur, { width: 0 }, { width: (b - a) * LW, duration: (b - a) * dur, ease: 'none' }));
    const ph = cell(art, 0, -6, 3, 190, '#d9d9d9'); vanish(ph, 0); appear(ph, t0);
    F((t) => { ph.style.left = (clamp((t - t0) / dur) * 0.95 * LW) + 'px'; });
    sfx('blip', t0, { g: 0.35 }); sfx('pop', t0 + 0.6 * dur, { g: 0.4 }); }
  // 5 出错怎么办：数出 11 行、记着 10 → 检查报错 → 修复后对上
  { const { art } = tiles[4], cs = [...Array(11)].map((_, k) => cell(art, k * 44, 20, 38, 50, k === 10 ? '#F29111' : '#2b606c'));
    const rec = h('div', 'abs mono', art, 'records 10'); px(rec, 0, 110); css(rec, { fontSize: '30px', color: '#d9d9d9' });
    const st = h('div', 'abs mono', art, ''); px(st, 260, 110); css(st, { fontSize: '30px' });
    keyed(st).at(T('n6', '检查') - 0.1, { html: '<span class="c-r">Corrupt</span>' }).at(T('n6', '修复') - 0.15, { html: '<span class="c-t">OK</span>' });
    keyed(rec).at(T('n6', '修复') - 0.15, { html: 'records <span class="c-t">11</span>' });
    classAt(cs[10], 'bad', T('n6', '检查') - 0.1, T('n6', '修复') - 0.15);
    sfx('error', T('n6', '检查'), { g: 0.4 }); sfx('chime', T('n6', '修复') - 0.15, { g: 0.4 }); }

  // ── 第二站：时间轴。2010 年，MySQL 5.5 把默认引擎换成 InnoDB（FACTS「时间轴的年份」「10 收束」）──
  const AX = 2120;
  const TL = timeline(world, AX, 430, 1680);
  const t7 = T('n7') - 0.6;
  // 到站时 2010 年以前那段已经画好（第 01 章讲过）；讲到 InnoDB 时它接过来往后长
  [TL.axis, TL.lane, TL.isam].forEach((e) => appear(e, t7)); TL.years.forEach(([k, lb]) => { appear(k, t7); if (lb) appear(lb, t7); });
  TL.vers.forEach(({ yr, k, lb }) => { appear(k, t7); appear(lb, t7); if (yr <= 2010) classAt(lb, 'c-o', t7, Infinity); });
  appear(TL.my, t7 + 0.3); fromTo(TL.my, t7 + 0.3, { width: 0 }, { width: TL.wMy, duration: 1.8, ease: 'power1.inOut' });   // 到站时 MyISAM 那段重新长一遍：3.23 到 5.5
  const iA = T('n7', 'InnoDB') - 0.3, iB = iA + 2.0;
  appear(TL.inno, iA); fromTo(TL.inno, iA, { width: 0 }, { width: TL.wInno, duration: iB - iA, ease: 'power1.out' });
  fromTo(TL.still, iA + 0.3, { width: 0 }, { width: TL.wStill, duration: iB - iA, ease: 'power1.out' }); appear(TL.stillL, iB - 0.2);
  TL.vers.forEach(({ yr, lb }) => { if (yr > 2010) classAt(lb, 'c-t', iA + (iB - iA) * (yr - 2010) / 17, Infinity); });
  const sw = ring(world, { x: TL.yx(2010) - 50, y: TL.BY - 10, w: 100, h: TL.BH + 20 }, 't'); vanish(sw, 0); appear(sw, T('n7', '5.5') - 0.1); vanish(sw, T('n8') - 0.1);
  sfx('tick', T('n7', '5.5'), { g: 0.5 }); sfx('thud', T('n7', 'InnoDB'), { g: 0.6 });
  // 行级锁、事务、崩溃恢复：挂在 InnoDB 那一段下面
  ['行级锁', '事务', '崩溃恢复'].forEach((f, i) => { const e = h('div', 'blk', world, f); px(e, TL.yx(2010) + i * 230 - 20, 520, 210, 76); css(e, { font: '500 34px "Sans SC"', lineHeight: '72px', textAlign: 'center', color: '#3fb4cc' }); slide(e, T('n8', f) - 0.15, { y: 20, d: 0.4 }); sfx('pop', T('n8', f), { g: 0.5 }); });
  // 撤不回的 ROLLBACK，在它那里能撤回（同样的语句，对 InnoDB 副本）
  const rb = term(world, AX, 650, 1680, 190, '<b>mysql</b>  9.7.4');
  appear(rb.el, T('n8b') - 0.5);
  rb.line('<span class="c-d">users        (MyISAM)  ROLLBACK 之后 age =</span> <span class="c-r">43</span>  <span class="c-r">1196</span>', T('n8b', '撤不回') - 0.3, { snd: 'error' });
  rb.line('<span class="c-d">users_innodb (InnoDB)  ROLLBACK 之后 age =</span> <span class="c-t">42</span>  <span class="c-t">回到原样</span>', T('n8b', '能撤回') - 0.3, { snd: 'chime' });
  // 下一集
  const more = h('div', 'abs mono', world, 'PART 2 · <span class="c-t">InnoDB</span>'); px(more, AX, 880); css(more, { fontSize: '34px', lineHeight: '52px', padding: '0 16px', color: '#3fb4cc', border: '2px solid #3fb4cc' });
  wipe(more, T('n9') - 0.1, { dir: 'l', d: 0.35 }); sfx('tick', T('n9'), { g: 0.5 });

  // ── 第三站：从这三个文件开始 ──
  const FX = 4000;
  const files = [['users.frm', '8,614 B', '#d9d9d9'], ['users.MYD', '128 B', '#F29111'], ['users.MYI', '3,072 B', '#3fb4cc']];
  files.forEach(([n, b, c], i) => {
    const e = h('div', 'blk', world); px(e, FX + 200 + i * 540, 360, 480, 260);
    const t1 = h('div', 'abs mono', e, n); px(t1, 0, 80); css(t1, { width: '480px', textAlign: 'center', fontSize: '48px', color: c });
    const t2 = h('div', 'abs mono', e, b); px(t2, 0, 150); css(t2, { width: '480px', textAlign: 'center', fontSize: '32px', color: '#808080' });
    wipe(e, T('n10') - 0.2 + i * 0.12, { dir: 't', d: 0.4 });   // 文件名与大小随框一起到
    classAt(e, 'lit', T('n10', '三个') - 0.1 + i * 0.18, T('n10', '三个') + 0.9 + i * 0.18); sfx('thud', T('n10', '三个') + i * 0.18, { g: 0.45 });
  });
  const end = h('div', 'abs', world, '一个数据库引擎是如何实现的？——从 MyISAM 说起'); px(end, FX + 200, 700); css(end, { font: '500 40px "Sans SC"', color: '#8a8a8a' });
  appear(end, Tend('n10') + 0.4);
  // 最后：users.MYD 的 128 个字节一格一格写出来（一行 16 个，八行接成两排）
  const ub = R.usersMYD[0].match(/../g);
  ub.forEach((b, i) => { const k = i % 16, e = h('div', 'abs', world); px(e, FX + 200 + (i % 64) * 24, 800 + Math.floor(i / 64) * 34, 20, 26); css(e, { background: k === 0 ? '#3fb4cc' : k === 15 ? '#a6d36b' : i < 16 ? '#F29111' : '#2b606c' }); appear(e, Tend('n10') + 0.7 + i * 0.03); });
  sfx('drive', Tend('n10') + 0.7, { g: 0.4 });

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, T('n7') - c0 - 0.6, { ease: 'none', sfx: false }],
    [T('n7') - 0.4, { x: 2960, y: 540, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.03 }, T('n10') - T('n7') - 1.8, { ease: 'none', sfx: false }],
    [T('n10') - 0.4, { x: FX + 960, y: 540, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.04 }, s.end - T('n10') - 0.8, { ease: 'none', sfx: false }],
  ]);
});
