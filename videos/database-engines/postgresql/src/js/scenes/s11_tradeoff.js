// 11 取舍：与 InnoDB 逐项对照 → 四十年后勾选最多（S8）→ 第二名 SQLite：没有独立的服务进程（B1、B2）
scene('tradeoff', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const tB = Tend('t10') + 0.5;
  const [A, B] = screens(world, [c0, tB, s.end]);
  drift(world, s, [tB], -1);

  // ── A：两套答案 ──
  hdoc(A, '同一张表，两套答案', 72, 128);
  const hi = capt(A, 'InnoDB', 380, 200); css(hi, { fontSize: '34px', color: 'var(--mute)', fontWeight: 800 });
  const hp = capt(A, '<b style="color:var(--pg)">PostgreSQL</b>', 1180, 200); css(hp, { fontSize: '34px', fontWeight: 800 });
  ['放', '找', '改和删', '并发', '出错'].forEach((w, i) => { const c = tagEl(A, w, 700 + i * 150, 136, 'grey'); show(c, T('t1', '五个问题') + i * 0.12, { y: 8 }); });
  sfx('tick', T('t1', '五个问题'), { g: 0.5 });
  show(hi, T('t1', '两套答案')); show(hp, T('t1', '两套答案') + 0.15);
  const pairs = [
    ['按主键找', '一棵树走到底，叶子里就是整行', '从索引到堆，多走一步', 't2', 't3'],
    ['按名字找', '先拿到主键，再查主键树', '索引直接指向行，不必绕主键', 't4', 't4'],
    ['改一行', '原位改，旧值进 undo', '写新版本；用不上 HOT 就动每个索引', 't5', 't6'],
    ['旧版本', '在 undo 里，purge 收走', '留在表里，靠清理来收；跟不上，死行越积越多', 't5', 't7'],
    ['换来的', '', '读写互不挡路；回滚、崩溃以后都不用撤销', 't9', 't9'],
  ];
  pairs.forEach(([k, a, b, ca, cb], i) => {
    const y = 270 + i * 120;
    const kl = h('div', 'abs', A, k); px(kl, 72, y + 22); css(kl, { font: '800 30px "Sans SC"', color: 'var(--ink2)' });
    const ea = h('div', 'abs', A, a); px(ea, 290, y, 780, 96); css(ea, { background: a ? '#5f6a73' : 'transparent', font: '600 26px "Sans SC"', color: '#fff', padding: '28px 20px' });
    const eb = h('div', 'abs', A, b); px(eb, 1100, y, 748, 96); css(eb, { background: 'var(--pg)', font: '600 26px "Sans SC"', color: '#fff', padding: '28px 20px' });
    show(kl, T(ca) - 0.1, { x: -10 }); if (a) wipe(ea, ca === 't2' ? T('t2', '一棵树') : T(ca), { dir: 'l', d: 0.4 }); wipe(eb, T(cb) + (cb === ca ? 0.5 : 0), { dir: 'r', d: 0.4 });
    sfx('tick', T(cb) + (cb === ca ? 0.5 : 0), { g: 0.5, p: 0.4 });
  });
  const tail = noteBox(A, '清理跟不上，死行就越积越多', 1100, 880, 748, 'warn'); show(tail, T('t8'), { y: 10 });
  const gain = tagEl(A, '换来的', 290, 790, 'ok'); show(gain, T('t9'), { x: -10 }); sfx('chime', T('t10', '撤销'), { g: 0.6 });

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
});
