// 10 四个问题。主画面：一张「问题 → MyISAM 的答案」的表，每一行旁边缩着前面那一章的主画面；
// 然后回到版本轴：2010 年 5.5 把默认引擎换成 InnoDB（行级锁、事务、崩溃恢复），同一句 ROLLBACK 在 InnoDB 的副本上撤回了（9.7.4 实测 out_06）；
// 最后停在这张表的三个文件上。FACTS「10」「新版扩充」n4b、n8b。
scene('s10', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);

  // ── 第一站：问题与答案 ──
  const ttl = h('div', 'abs t-big', world, '一个引擎必须回答的问题'); px(ttl, 140, 130); css(ttl, { color: '#d9d9d9' });
  wipe(ttl, c0 + 0.1, { dir: 'l', d: 0.5 }); sfx('thud', c0 + 0.1, { g: 0.5 });
  const ROWS = [
    ['n3', '数据怎么放', '一个数据文件，一行接一行', 'strip'],
    ['n4', '怎么找', 'B 树索引，加上行的位置', 'tree'],
    ['n4b', '改和删', '原地覆盖；删掉的留下空位', 'hole'],
    ['n5', '怎么并发', '一把表锁', 'lock'],
    ['n6', '出错怎么办', '检查，然后修复', 'fix'],
  ];
  const RY = 240, RH = 128;
  ROWS.forEach(([cue, q, a, icon], i) => {
    const y = RY + i * RH;
    const ln = h('div', 'abs', world); px(ln, 140, y, 1640, 2); css(ln, { background: '#2c2e31' });
    const qe = h('div', 'abs', world, q); px(qe, 140, y + 34); css(qe, { font: '700 40px "Sans SC"', color: '#d9d9d9' });
    const ae = h('div', 'abs', world, a); px(ae, 560, y + 38); css(ae, { font: '500 36px "Sans SC"', color: '#F29111' });
    const ic = h('div', 'abs', world); px(ic, 1380, y + 22, 400, 84);
    if (icon === 'strip') for (let k = 0; k < 16; k++) { const c = h('div', 'abs', ic); px(c, k * 24, 26, 20, 34); css(c, { background: k < 4 ? '#F29111' : '#2b606c' }); }
    if (icon === 'tree') { const r_ = h('div', 'abs', ic); px(r_, 150, 0, 100, 28); css(r_, { border: '2px solid #F29111' }); for (let k = 0; k < 5; k++) { const c = h('div', 'abs', ic); px(c, 40 + k * 66, 56, 52, 26); css(c, { background: '#2b606c' }); } }
    if (icon === 'hole') { for (let k = 0; k < 8; k++) { const c = h('div', 'abs', ic); px(c, k * 48, 26, 42, 34); css(c, k === 2 || k === 5 ? { border: '2px solid #e5534b' } : { background: '#2b606c' }); } }
    if (icon === 'lock') { for (let k = 0; k < 12; k++) { const c = h('div', 'abs', ic); px(c, k * 24, 8, 20, 30); css(c, { background: '#3fb4cc' }); } for (let k = 0; k < 12; k++) { const c = h('div', 'abs', ic); px(c, 96 + k * 24, 48, 20, 30); css(c, { background: k < 4 ? '#2c2e31' : '#F29111' }); } }
    if (icon === 'fix') { const t_ = h('div', 'abs mono', ic, 'CHECK → REPAIR'); px(t_, 0, 22); css(t_, { fontSize: '30px', color: '#3fb4cc' }); }
    const t0 = T(cue) - 0.2;
    // 先摆出空表格，讲到哪一行填哪一行
    appear(ln, T('n1') + i * 0.1); sfx('tick', T('n1') + i * 0.1, { g: 0.3 });
    slide(qe, t0, { x: -24, d: 0.4 }); slide(ae, T(cue) + 0.7, { x: -24, d: 0.4 }); wipe(ic, T(cue) + 0.5, { dir: 'l', d: 0.5 });
    sfx('pop', T(cue) + 0.7, { g: 0.5 });
  });
  const lnE = h('div', 'abs', world); px(lnE, 140, RY + 5 * RH, 1640, 2); css(lnE, { background: '#2c2e31' }); appear(lnE, T('n1') + 0.5);

  // ── 第二站：2010 年，MySQL 5.5 把默认引擎换成 InnoDB ──
  const AX = 2120, AW = 1560, AY = 470;
  const vers = ['3.23', '4.0', '4.1', '5.0', '5.1', '5.5', '5.6', '5.7'];
  const vx = (i) => AX + i * (AW / (vers.length - 1));
  const axis = h('div', 'abs', world); px(axis, AX, AY, AW, 3); css(axis, { background: '#4a4a4a' });
  vers.forEach((v, i) => { const e = h('div', 'abs mono', world, v); px(e, vx(i) - 30, AY + 22); css(e, { fontSize: '30px', color: i === 5 ? '#d9d9d9' : '#808080', width: '60px', textAlign: 'center' }); const k = h('div', 'abs', world); px(k, vx(i) - 1, AY - 10, 3, 23); css(k, { background: '#4a4a4a' }); });
  const my = h('div', 'abs mono', world, 'MyISAM'); px(my, vx(0), AY - 120, vx(5) - vx(0) - 6, 72); css(my, { background: '#F29111', color: '#0b0b0c', fontSize: '32px', lineHeight: '72px', paddingLeft: '18px' });
  const inno = h('div', 'abs mono', world, 'InnoDB'); px(inno, vx(5), AY - 120, 0, 72); css(inno, { background: '#3fb4cc', color: '#0b0b0c', fontSize: '32px', lineHeight: '72px', paddingLeft: '18px', overflow: 'hidden' });
  const lbl = lab(world, AX, AY - 190, '默认的存储引擎'), yr = h('div', 'abs mono', world, '2010 · 5.5'); px(yr, vx(5) - 70, AY + 74); css(yr, { fontSize: '34px', color: '#3fb4cc' });
  const t7 = T('n7') - 0.3;
  wipe(axis, t7, { dir: 'l', d: 0.5 }); wipe(my, t7 + 0.2, { dir: 'l', d: 0.6 }); appear(lbl, t7 + 0.2);
  fromTo(inno, T('n7', 'InnoDB') - 0.3, { width: 0 }, { width: vx(7) - vx(5), duration: 0.9, ease: 'power3.out' });
  appear(yr, T('n7', '5.5') - 0.1); sfx('tick', T('n7', '5.5'), { g: 0.5 }); sfx('thud', T('n7', 'InnoDB'), { g: 0.6 });
  // 行级锁、事务、崩溃恢复
  ['行级锁', '事务', '崩溃恢复'].forEach((f, i) => { const e = h('div', 'blk', world, f); px(e, vx(5) + i * 220 - 120, AY + 150, 200, 76); css(e, { font: '500 34px "Sans SC"', lineHeight: '72px', textAlign: 'center', color: '#3fb4cc' }); slide(e, T('n8', f) - 0.15, { y: 20, d: 0.4 }); sfx('pop', T('n8', f), { g: 0.5 }); });
  // 撤不回的 ROLLBACK，在它那里能撤回（同样的语句，对 InnoDB 副本）
  const rb = term(world, AX, 720, 1560, 190, '<b>mysql</b>  9.7.4');
  appear(rb.el, T('n8b') - 0.5);
  rb.line('<span class="c-d">users        (MyISAM)  ROLLBACK 之后 age =</span> <span class="c-r">43</span>  <span class="c-r">1196</span>', T('n8b', '撤不回') - 0.3, { snd: 'error' });
  rb.line('<span class="c-d">users_innodb (InnoDB)  ROLLBACK 之后 age =</span> <span class="c-t">42</span>  <span class="c-t">回到原样</span>', T('n8b', '能撤回') - 0.3, { snd: 'chime' });
  // 同样的四个问题，更复杂的答案
  const more = lab(world, AX, 140, '同样的问题，更复杂的答案：下一集', 'c-t');
  appear(more, T('n9', '更复杂') - 0.2); sfx('tick', T('n9', '更复杂'), { g: 0.5 });

  // ── 第三站：从这三个文件开始 ──
  const FX = 4000;
  const files = [['users.frm', '8,614 B', '#d9d9d9'], ['users.MYD', '128 B', '#F29111'], ['users.MYI', '3,072 B', '#3fb4cc']];
  files.forEach(([n, b, c], i) => {
    const e = h('div', 'blk', world); px(e, FX + 200 + i * 540, 360, 480, 260);
    const t1 = h('div', 'abs mono', e, n); px(t1, 0, 80); css(t1, { width: '480px', textAlign: 'center', fontSize: '48px', color: c });
    const t2 = h('div', 'abs mono', e, b); px(t2, 0, 150); css(t2, { width: '480px', textAlign: 'center', fontSize: '32px', color: '#808080' });
    wipe(e, T('n10') - 0.2 + i * 0.12, { dir: 't', d: 0.4 }); vanish(t1, 0); vanish(t2, 0);
    appear(t1, T('n10', '三个') - 0.1 + i * 0.18); appear(t2, T('n10', '三个') + i * 0.18); sfx('thud', T('n10', '三个') + i * 0.18, { g: 0.45 });
  });
  const end = h('div', 'abs', world, '一个数据库引擎是如何实现的？——从 MyISAM 说起'); px(end, FX + 200, 700); css(end, { font: '500 40px "Sans SC"', color: '#8a8a8a' });
  appear(end, Tend('n10') + 0.4);

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, T('n7') - c0 - 0.6, { ease: 'none', sfx: false }],
    [T('n7') - 0.4, { x: 2900, y: 540, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.03 }, T('n10') - T('n7') - 1.8, { ease: 'none', sfx: false }],
    [T('n10') - 0.4, { x: FX + 960, y: 540, z: 1 }, 1.1, { g: 0.5 }],
    [null, { z: 1.04 }, s.end - T('n10') - 0.8, { ease: 'none', sfx: false }],
  ]);
});
