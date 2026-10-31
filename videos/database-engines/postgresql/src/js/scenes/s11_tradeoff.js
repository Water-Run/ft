// 11 取舍：与 InnoDB 逐项对照 → 四十年后勾选最多（S8）→ 第二名 SQLite：没有独立的服务进程（B1、B2）
scene('tradeoff', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('t10') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);

  // ── A：两套答案 ──
  hdoc(A, '同一张表，两套答案', 72, 128);
  const hi = tagEl(A, 'InnoDB', 290, 196, 'grey'); css(hi, { fontSize: '34px' });
  const hp = tagEl(A, 'PostgreSQL', 1100, 196); css(hp, { fontSize: '34px' });
  show(hi, T('t1', '两套答案')); show(hp, T('t1', '两套答案') + 0.15);
  const pairs = [
    ['按主键找', '一棵树走到底，叶子里就是整行', '从索引到堆，多走一步', 't2', 't3'],
    ['按名字找', '先拿到主键，再查主键树', '索引直接指向行，不必绕主键', 't4', 't4'],
    ['改一行', '原位改，旧值进 undo', '写新版本；用不上 HOT 就动每个索引', 't5', 't6'],
    ['旧版本', '在 undo 里，purge 收走', '留在表里，靠清理来收；跟不上，死行越积越多', 't5', 't7'],
    ['换来的', '', '读写互不挡路；回滚、崩溃以后都不用撤销', 't9', 't9'],
  ];
  const EA = [], EB = [];
  // 先摆出空格子：一行一个对照项，左边 InnoDB、右边 PostgreSQL，随旁白一格格填上
  pairs.forEach(([, a], i) => {
    const y = 270 + i * 120;
    [[290, 780, a], [1100, 748, true]].forEach(([x, w, has], j) => {
      if (!has) return;
      const ph = h('div', 'abs', A, '&nbsp;'); px(ph, x, y, w, 96); css(ph, { border: '2px dashed #c5d3df', font: '600 26px "Sans SC"', padding: '28px 20px', boxSizing: 'border-box', height: '96px' });
      show(ph, T('t1', '两套答案') + 0.2 + i * 0.08 + j * 0.04, { y: 6, d: 0.25 });
    });
  });
  sfx('tick', T('t1', '两套答案') + 0.2, { g: 0.4 });  pairs.forEach(([k, a, b, ca, cb], i) => {
    const y = 270 + i * 120;
    const kl = h('div', 'abs', A, k); px(kl, 72, y + 22); css(kl, { font: '800 30px "Sans SC"', color: 'var(--ink2)' });
    const ea = h('div', 'abs', A, i === 2 ? a.split('，')[0] : a); px(ea, 290, y, 780, 96); if (i === 2) keyed(ea).at(T('t5', 'undo') - 0.2, { html: a }); css(ea, { background: a ? '#5f6a73' : 'transparent', font: '600 26px "Sans SC"', color: '#fff', padding: '28px 20px' });
    const eb = h('div', 'abs', A, i === 4 ? b.split('；')[0] : b); px(eb, 1100, y, 748, 96); EA[i] = ea; EB[i] = eb; if (i === 4) keyed(eb).at(T('t10'), { html: b.split('；')[0] + '；回滚、崩溃以后' }).at(T('t10', '撤销') - 0.3, { html: b }); css(eb, { background: 'var(--pg)', font: '600 26px "Sans SC"', color: '#fff', padding: '28px 20px' });
    show(kl, T(ca) - 0.1, { x: -10 }); if (a) wipe(ea, ca === 't2' ? T('t2', '按主键找') : i === 3 ? T('t6', '每个索引') : T(ca), { dir: 'l', d: 0.4 }); wipe(eb, T(cb) + (cb === ca ? 0.5 : 0), { dir: 'r', d: 0.4 });
    sfx('tick', T(cb) + (cb === ca ? 0.5 : 0), { g: 0.5, p: 0.4 });
  });
  const tail = tagEl(A, '清理跟不上：死行越积越多', 1100, 880, 'warn'); css(tail, { fontSize: '28px' }); show(tail, T('t8'), { y: 10 }); sfx('error', T('t8'), { g: 0.35 });
  for (let k = 0; k < 4; k++) { const dr = h('div', 'tup dead', A, '死行'); px(dr, 1520 + k * 82, 884, 74); css(dr, { fontSize: '22px', textAlign: 'center' }); show(dr, T('t8', '越积越多') - 0.3 + k * 0.25, { y: -16, d: 0.3 }); }
  const gain = tagEl(A, '换来的', 290, 790, 'ok'); show(gain, T('t9'), { x: -10 }); sfx('chime', T('t10', '撤销'), { g: 0.6 });

  const fA = focusRing(A);
  fA.at(T('t2', '一棵树'), EA[0]).at(T('t3', '索引'), EB[0]).at(Math.max(T('t4', '名字'), T('t4') + 0.9), EB[1]).at(T('t5', '原位改'), EA[2]).at(T('t6', '新版本'), EB[2]).at(T('t6', '每个索引'), EA[3]).at(T('t7', '清理'), EB[3])
    .at(T('t8', '越积越多'), tail).at(T('t9', '读写'), EB[4]).at(T('t10', '撤销'), EB[4]).off(tB - 0.4);
  // ── B：四十年后；第二名是 SQLite ──
  hdoc(B, '2026 年开发者调查 · 勾选最多的数据库', 72, 128);
  const top = D.survey2026top;
  const K = 1100 / 60;
  const bars = top.map((r, i) => {
    const y = 230 + i * 92;
    const n = h('div', 'abs', B, r.response); px(n, 72, y + 8); css(n, { font: '700 28px "Open Sans"', color: i === 0 ? 'var(--pg)' : i === 1 ? 'var(--navy)' : 'var(--ink2)' });
    const b = h('div', 'bar', B); px(b, 420, y, r.percent * K); css(b, { height: '56px', background: i === 0 ? 'var(--pg)' : i === 1 ? 'var(--navy)' : '#aab3bb' });
    const v = capt(B, `<b>${r.percent}%</b>`, 420 + r.percent * K + 16, y + 10);
    return { n, b, v, i };
  });
  const t1 = T('t11') - 0.2;
  bars.forEach(({ n, b, v, i }) => { show(n, t1 + i * 0.12, { x: -10 }); fromTo(b, t1 + i * 0.12, { width: 0 }, { width: top[i].percent * K, duration: 0.8, ease: 'power2.out' }); show(v, t1 + i * 0.12 + 0.6); });
  sfx('tick', t1, { g: 0.5 });
  const first = tagEl(B, '第一：PostgreSQL', 420 + top[0].percent * K + 140, 238); slam(first, T('t12', '最多'), { from: 1.15 }); sfx('thud', T('t12', '最多'), { g: 0.6 });
  const born = capt(B, '1986 年从伯克利开始的研究系统', 72, 700); show(born, T('t11', '伯克利'), { y: 8 });
  const second = tagEl(B, '第二：SQLite', 420 + top[1].percent * K + 140, 330, 'navy'); slam(second, T('t13', 'SQLite'), { from: 1.15 }); sfx('pop', T('t13', 'SQLite'));
  // 服务进程 vs 嵌在程序里
  const pic = h('div', 'abs', B); px(pic, 72, 760, 1776, 170); pic.dataset.name = '服务进程与嵌入';
  const app1 = h('div', 'node', pic, '应用'); px(app1, 0, 60, 160);
  const srv = h('div', 'node hl', pic, 'PostgreSQL 服务进程'); px(srv, 300, 60, 360);
  const ovp = overlay(pic); const ln = path(ovp, 'M160,81 L300,81', 'accent', { w: 3 });
  const proc = h('div', 'abs', pic); px(proc, 900, 20, 560, 130); css(proc, { border: '3px dashed var(--navy)' });
  const procL = h('div', 'abs cap', proc, '一个程序'); px(procL, 14, 6);
  const app2 = h('div', 'node', proc, '应用代码'); px(app2, 20, 60, 220);
  const lite = h('div', 'node', proc, 'SQLite'); px(lite, 300, 60, 220); css(lite, { borderColor: 'var(--navy)', color: 'var(--navy)' });
  const file = h('div', 'node grey', pic, '一个文件'); px(file, 1560, 60, 200);
  const ln2 = path(ovp, 'M1420,81 L1560,81', 'navy', { w: 3 });
  show(app1, T('t14') - 0.2, { x: -10 }); show(srv, T('t14') - 0.1, { x: -10 }); arrowIn(ln, T('t14'), 0.3);
  wipe(proc, T('t14', '嵌进'), { dir: 'l' }); show(procL, T('t14', '嵌进')); show(app2, T('t14', '嵌进') + 0.1); slam(lite, T('t14', '嵌进') + 0.25, { from: 1.2 }); sfx('pop', T('t14', '嵌进') + 0.25);
  show(file, T('t14', '嵌进') + 0.5, { x: 10 }); arrowIn(ln2, T('t14', '嵌进') + 0.4, 0.3);
  hide(born, T('t14') - 0.3, { d: 0.25 });
  const qq = h('div', 'abs', B, '小巧的引擎，怎样做成生产级的关系数据库？'); px(qq, 72, 690); css(qq, { font: '800 40px "Sans SC"', color: 'var(--navy)' });
  show(qq, T('t15'), { y: 10 }); sfx('riser', T('t15') - 0.2, { g: 0.4 });
  const fB = focusRing(B);
  fB.at(T('t11', '伯克利'), born).at(T('t12', '成了'), bars[0].b).at(T('t12', '最多'), first).at(T('t13', '调查'), [72, 230, 1400, 460]).at(T('t13', 'SQLite'), second).at(T('t14', '服务进程'), srv).at(T('t14', '嵌进'), proc).at(T('t15', '小巧'), lite).at(T('t15', '生产级'), qq).off(Tend('t15') + 0.3);
});
