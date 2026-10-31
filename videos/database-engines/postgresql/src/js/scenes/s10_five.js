// 10 五个问题：放、找、改和删、并发、出错，各一行；五个答案落在同一个做法上
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  drift(world, s, [], 1);
  hdoc(world, 'PostgreSQL 的五个回答', 72, 128);
  const ov = overlay(world);
  const rows = [
    ['怎么放', '行按到达顺序放进堆；每个索引一棵 B 树，指向行的地址', 'z2', 'heap'],
    ['怎么找', '规划器选路；从索引到堆，再看这个版本能不能看见', 'z4', 'path'],
    ['改和删', '不覆盖：写新版本、记下 xmax；旧版本没人要了再回收', 'z6', 'ver'],
    ['怎么并发', '快照决定读哪个版本；读写互不挡路，写和写排队', 'z8', 'snap'],
    ['出错怎么办', '先写 WAL，崩溃后重放；没提交的，本来就看不见', 'z10', 'wal'],
  ];
  const ends = [], AL = [], PIC = [];
  rows.forEach(([q, a, cue, kind], i) => {
    const y = 220 + i * 128;
    const box = h('div', 'abs', world); px(box, 72, y, 1776, 112); css(box, { background: '#fff', border: '2px solid var(--line)', borderLeft: '8px solid var(--pg)' });
    box.dataset.name = q;
    const qc = h('div', 'abs', box); px(qc, 0, 0, 240, 108); css(qc, { background: 'var(--pg)' });
    const ql = h('div', 'abs', box, q); px(ql, 28, 30); css(ql, { font: '800 36px "Sans SC"', color: '#fff' });
    const al = h('div', 'abs', box, a.split('；')[0]); px(al, 290, 36); css(al, { font: '500 28px "Sans SC"', color: 'var(--ink)' });
    keyed(al).at(T('z' + (Number(cue.slice(1)) + 1)), { html: a });
    // 右侧的小图：沿用前面各章的画法
    const pic = h('div', 'abs', box); px(pic, 1460, 14, 290, 84); AL.push([72 + 290, y + 20, 1100, 72]); PIC.push([72 + 1460, y + 14, 290, 84]);
    if (kind === 'heap') for (let k = 0; k < 9; k++) { const p = h('div', 'pg-mini', pic); px(p, k * 32, 10, 26, 64); }
    if (kind === 'path') { ['根', '叶', '堆'].forEach((t, k) => { const n = h('div', 'node' + (k === 2 ? ' hl' : ''), pic, t); px(n, k * 100, 20, 80); }); }
    if (kind === 'ver') { const o = h('div', 'tup dead', pic, '42'); px(o, 0, 20, 120); const n = h('div', 'tup new', pic, '43'); px(n, 150, 20, 120); }
    if (kind === 'snap') { const n = h('div', 'abs mono', pic, '快照'); px(n, 0, 22); css(n, { font: '700 30px "Mono","Sans SC"', color: 'var(--pg)', border: '3px solid var(--sky)', padding: '2px 14px' }); }
    if (kind === 'wal') for (let k = 0; k < 5; k++) { const p = h('div', 'abs', pic); px(p, k * 56, 22, 50, 40); css(p, { background: 'var(--wash)', border: '2px solid var(--pg)' }); }
    // 五个问题先在左边一列亮出来；讲到哪一问，才写出答案，补充那一句时这一行底色变浅蓝
    const t = T(cue), tq = T('z1', '五个问题') + i * 0.15;
    wipe(box, T('z1') + 0.2 + i * 0.1, { dir: 'l', d: 0.45 }); wipe(qc, tq, { dir: 'l', d: 0.3 }); show(ql, tq + 0.1, { x: -20 }); show(al, t + 0.1, { x: -10 }); show(pic, (t + Tend(cue)) / 2, { x: 20 });
    const sub = 'z' + (Number(cue.slice(1)) + 1), nextT = i < 4 ? T(rows[i + 1][2]) - 0.15 : T('z12');
    set(box, T(sub), { background: 'var(--hi)' }); set(box, nextT, { background: '#fff' });
    sfx('thud', t, { g: 0.45 });
    ends.push([72 + 8, y + 56]);
  });
  // 五个答案，同一个做法：改一行，就写一个新版本
  const core = h('div', 'abs', world); px(core, 1240, 870, 600, 70); css(core, { background: 'var(--pg)' }); core.dataset.name = '同一个做法';
  const cl = h('div', 'abs', core, '改一行，就写一个新版本'); px(cl, 24, 12); css(cl, { font: '800 34px "Sans SC"', color: '#fff' });
  const tz = T('z12', '同一个做法');
  rows.forEach((r, i) => { const l = path(ov, `M${72},${220 + i * 128 + 56} C${30},${220 + i * 128 + 56} ${30},905 ${1240},905`, 'dim', { w: 2.5, arrow: false }); draw(l, tz + i * 0.08, 0.6); });
  wipe(core, T('z13') - 0.1, { dir: 'l', d: 0.5 }); sfx('chime', T('z13', '新版本'), { g: 0.7 });
  const fz = focusRing(world);
  fz.at(T('z2') + 0.2, AL[0]).at(T('z3', '地址'), PIC[0]).at(T('z4') + 0.2, AL[1]).at(T('z5', '看见'), PIC[1]).at(T('z6') + 0.2, AL[2]).at(T('z7', '回收'), PIC[2])
    .at(T('z8') + 0.2, AL[3]).at(T('z9', '排队'), PIC[3]).at(T('z10') + 0.2, AL[4]).at(T('z11', '看不见'), PIC[4]).at(T('z13') + 0.2, [1240, 870, 600, 70]).off(T('z13', '新版本') + 0.4);
});
