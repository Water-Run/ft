// 第 02 章 一个集合，三棵树：people 集合（相当于表、没有校验规则、三份文档字段各不相同）→ mongod 的两层，下层 WiredTiger 只认键和值、按键排序
// → 开场的三个「?.wt」揭晓：users 集合与两个索引各一个文件、各一棵树，Alice 在三棵树里各占一项。
// 事实：I05 A12 A04 G00b C02 I01 I02 A13 B01 A06 I06 B03 B05–B07；回显抄自 out_09、out_02。
scene('whole', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const ch = chrome(root, s, '02 一个集合，三棵树');
  ch.sec(c0, '集合');

  // ── 第一站：people 集合 ──
  const coll = gloss(h('div', 'panel', world), '集合'); px(coll, 140, 140, 1100, 580);
  const ct = h('div', 'abs', coll, '集合'); css(ct, { left: '34px', top: '22px', font: '500 50px "Serif SC"', color: '#00684A' });
  const cname = h('div', 'abs mono', coll, 'people'); css(cname, { left: '160px', top: '34px', font: '700 40px "Mono"', color: '#001E2B' });
  show(coll, c0, { y: 20 }); set(cname, s.start, { autoAlpha: 0 }); show(cname, T('a4', 'people'), { x: -16, y: 0 });
  // a1：一份份文档放进来（先只是三份「{ … }」）
  const docs = [
    ['Alice', [['name', '"Alice"'], ['age', '42']]],
    ['Erin', [['name', '"Erin"'], ['email', '"erin@…"'], ['tags', '["db", "go"]']]],
    ['Frank', [['name', '"Frank"'], ['address', '{ city: … }']]],
  ];
  const keyEls = [], dEls = [];
  docs.forEach(([who, fields], i) => {
    const g = h('div', 'abs', coll); px(g, 34 + i * 350, 130, 330, 300);
    css(g, { background: '#C0FAE6', border: '2px solid #00A35C', borderRadius: '12px', font: '500 44px/290px "Mono"', color: '#5C6C75', textAlign: 'center' }); g.textContent = '{ … }';
    show(g, T('a1') + 0.2 + i * 0.25, { y: -50, d: 0.6, ease: 'power2.out' });
    const d = h('div', 'abs', coll); px(d, 34 + i * 350, 130, 330, 300);
    css(d, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '12px', padding: '54px 22px 0', boxSizing: 'border-box', font: '500 26px/44px "Mono"', whiteSpace: 'pre', color: '#001E2B' });
    d.innerHTML = '{<br>' + fields.map(([k, v]) => `  <span class="fk">${k}</span>: <span class="s">${esc(v)}</span>`).join(',<br>') + '<br>}';
    d.querySelectorAll('.fk').forEach((e) => { css(e, { borderRadius: '4px', padding: '0 3px', color: '#1254B7' }); keyEls.push(e); });
    const tag = chip(d, 18, 12, who, 'dk'); css(tag, { fontFamily: '"Inter"' });
    const at = i === 2 ? T('a6', 'Frank') : T('a4b', who);
    show(d, at - 0.15, { y: 16, d: 0.5 }); hide(g, at, { y: 0, d: 0.3 });
    dEls.push(d);
  });
  // a2：相当于关系数据库里的一张表（I05）
  const map = h('div', 'panel gray', world); px(map, 1300, 140, 480, 250);
  map.innerHTML = '<div style="position:absolute;left:28px;top:22px;font:700 28px Inter,\'Sans SC\';color:#001E2B">SQL 与 MongoDB 的说法</div>'
    + '<div style="position:absolute;left:28px;top:84px;font:500 30px Inter,\'Sans SC\';color:#3D4F58">表</div><div style="position:absolute;left:150px;top:84px;font:500 30px Inter;color:#5C6C75">⇄</div><div style="position:absolute;left:230px;top:84px;font:700 30px Inter,\'Sans SC\';color:#00684A">集合</div>'
    + '<div style="position:absolute;left:28px;top:150px;font:500 24px/1.45 Inter,\'Sans SC\';color:#5C6C75">集合不用事先建：<br>第一次存进文档时自动建出来</div>';
  show(map, T('a2') - 0.1, { x: 30, y: 0 });
  // a3：默认不规定文档长什么样 —— 集合的选项是空的（A12，out_09）
  const opt = term(world, 1300, 420, 480, 220, 'mongosh', { fs: 22 });
  show(opt.c, T('a3') - 0.2, { x: 30, y: 0 });
  opt.cmd(T('a3'), 'db.getCollectionInfos(…)\n  [0].options');
  opt.out(T('a3', '不规定') + 0.2, '{}  <span class="c">// 没有校验规则</span>');
  // a7：字段名就存在每份文档里
  to(keyEls, T('a7', '字段名'), { backgroundColor: '#00ED64', color: '#023430', duration: 0.4, stagger: 0.06 });
  const kn = callout(coll, 34, 452, 'tip', '<code>name</code> 出现了 3 次：每份文档都带着自己的字段名', '字段名跟着文档走');
  show(kn, T('a7', '字段名') + 0.4, { y: 10 });
  figs(world, 140, 732, 1100, [[T('a4b') + 0.3, '图 2-1', 'people 集合里的三份文档，字段各不相同', '实测：out_09（MongoDB 9.0.8）']], T('a9') - 0.6);
  // a8–a8b：写进文件（开场的三个 ?.wt），再按名字找出来
  const strip = h('div', 'panel gray', world); px(strip, 140, 780, 1100, 120);
  css(strip, { font: '600 28px/116px "Mono"', color: '#3D4F58', paddingLeft: '28px' }); strip.textContent = 'db/';
  const qs = [0, 1, 2].map((i) => { const f = h('div', 'abs', strip, '?.wt'); css(f, { left: 140 + i * 200 + 'px', top: '22px', width: '160px', height: '72px', background: '#fff', border: '2px solid #C1C7C6', borderRadius: '10px', font: '600 30px/68px "Mono"', color: '#5C6C75', textAlign: 'center' }); return f; });
  show(strip, T('a8', '写进文件') - 0.3, { y: 16 });
  const dn = link(ov, [[690, 722], [690, 776]], 'accent', { arrow: true, w: 3 }); arrowIn(dn, T('a8', '写进文件'), 0.5);
  const fq = code(world, 860, 810, 'find({ name: "Alice" })'); css(fq, { fontSize: '28px' }); show(fq, T('a8b') - 0.5, { x: 20, y: 0 });
  hide([coll, map, opt.c, strip, fq, dn, kn], T('a9') - 0.55, { y: -14, d: 0.45 });

  // ── 第二站：mongod 的两层（G00b C02 I01），下层 WiredTiger 只认键和值（I02 A13 B01） ──
  const X2 = 1920;
  ch.sec(T('a9') - 0.4, 'mongod 与存储引擎');
  const md = h('div', 'panel', world); px(md, X2 + 140, 150, 1640, 740); css(md, { border: '3px solid #001E2B' });
  const mdt = code(world, X2 + 170, 128, 'mongod'); css(mdt, { font: '700 30px "Mono"', background: '#001E2B', color: '#fff', borderColor: '#001E2B' });
  const mds = label(world, X2 + 340, 136, 'MongoDB 的服务端进程', 't-note'); css(mds, { background: '#fff', padding: '0 12px' });
  show(md, T('a9') - 0.3, { y: 20 }); show(mdt, T('a9', 'mongod'), { y: 0, s: 1.2 }); show(mds, T('a9', 'mongod') + 0.4, { y: 6 });
  const up = h('div', 'abs', md); px(up, 30, 50, 1574, 160); css(up, { background: '#F9FBFA', border: '1.5px solid #E8EDEB', borderRadius: '12px' });
  const upt = h('div', 'abs', up, '上层 · 查询'); css(upt, { left: '30px', top: '22px', font: '700 32px "Inter", "Sans SC"', color: '#001E2B' });
  const upq = h('div', 'abs mono', up, 'find({ name: "Alice" })'); css(upq, { left: '30px', top: '90px', font: '500 30px "Mono"', color: '#001E2B' });
  const upa = h('div', 'abs mono', up, '→  计划：用姓名索引 name_1'); css(upa, { left: '470px', top: '90px', font: '600 30px "Mono", "Sans SC"', color: '#00684A' });
  show(up, T('a9', '两层'), { y: 12 }); show(upq, T('a11', '查询') - 0.2, { x: -16, y: 0 }); show(upa, T('a11', '决定'), { x: -16, y: 0 });
  const lo = gloss(h('div', 'abs', md), '存储引擎'); px(lo, 30, 236, 1574, 474); css(lo, { background: '#E3FCF7', border: '2px solid #00A35C', borderRadius: '12px' });
  const lot = h('div', 'abs', lo, '下层 · 存储引擎：管数据在内存和磁盘上怎样存放'); css(lot, { left: '30px', top: '22px', font: '700 32px "Inter", "Sans SC"', color: '#00684A' });
  const wt = h('div', 'abs', lo, 'WiredTiger'); css(wt, { left: '30px', top: '74px', font: '700 68px "Inter"', color: '#001E2B' });
  show(lo, T('a12', '下层'), { y: 12 }); show(wt, T('a13', 'WiredTiger'), { x: -20, y: 0 });
  const ver = term(lo, 900, 70, 640, 150, 'shell', { fs: 24 });
  show(ver.c, T('a15') - 0.4, { x: 20, y: 0 });
  ver.cmd(T('a15') - 0.2, 'mongod --version', '$ '); ver.out(T('a15', '9.0') - 0.4, 'db version <span class="n">v9.0.8</span>');
  hide(ver.c, T('a16') - 0.2, { y: 0, d: 0.35 });
  // a16：Alice 的文档进来，WiredTiger 看到的只是一串字节
  const dIn = code(lo, 900, 90, '{ name: "Alice", age: 42 }'); css(dIn, { fontSize: '30px', background: '#fff' });
  show(dIn, T('a16'), { x: 30, y: 0 });
  const bytes = '2f 00 00 00 07 5f 69 64 00 6a fa 6c a2 6f 27 50 6c fb 0a 4e 81 02 6e 61 6d 65 …';
  // a17–a19：一项一项的键和值；乱序进来、按键排好
  const KV = [['3', '2e 00 00 00 07 5f 69 64 00 6a fa 6c a2 4c 19 …'], ['1', '2e 00 00 00 07 5f 69 64 00 6a fa 6c a2 4b 80 …'], ['k', bytes], ['2', '30 00 00 00 07 5f 69 64 00 6a fa 6c a2 4b e1 …']];
  const RY = 206, RH = 62;
  const rows = KV.map(([k, v], i) => {
    const kk = pg(lo, 30, RY + i * RH, 150, 54, k === 'k' ? 'k' : 'k' + k); css(kk, { font: '700 26px "Mono"', color: '#001E2B' });
    const vv = h('div', 'abs mono', lo, v); px(vv, 200, RY + i * RH, 1340, 54); css(vv, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '8px', font: '500 24px/50px "Mono"', color: '#5C6C75', paddingLeft: '18px', boxSizing: 'border-box', overflow: 'hidden' });
    return [kk, vv];
  });
  const hk = label(lo, 30, RY - 44, '键', 'lab'), hv = label(lo, 200, RY - 44, '值', 'lab');
  // 文档落成第 3 行的值：先出那一行，文档淡出
  to(dIn, T('a16', '不认识') + 0.7, { y: 170, x: -660, autoAlpha: 0, duration: 0.8, ease: 'power2.in' });
  show(rows[2][1], T('a16', '不认识') + 1.3, { y: 0, d: 0.4 });
  show([rows[2][0], hk, hv], T('a17', '键和值') - 0.3, { y: 8 });
  glow(rows[2][1], T('a18', '一串字节'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const fmt = callout(lo, 900, 70, 'note', '集合表 <code>value_format=u</code>：不解释的字节串', '值只是字节');
  show(fmt, T('a18') - 0.1, { x: 20, y: 0 });
  show([...rows[0], ...rows[1], ...rows[3]], T('a19') - 0.1, { y: 14, stagger: 0.06 });
  // 按键排好序：k3、k1、k、k2 → k1、k2、k3（Alice 那一项在最后）
  const order = [2, 0, 3, 1];   // 第 i 行排到 order[i]
  rows.forEach(([kk, vv], i) => to([kk, vv], T('a19', '排好序') - 0.1, { y: (order[i] - i) * RH, duration: 0.8, ease: 'power3.inOut' }));
  swapAt(rows[2][0], 'k', 'k4', T('a19', '排好序') - 0.1);
  hide(fmt, T('a19') - 0.1, { y: 0, d: 0.3 });
  const into = code(lo, 900, 96, '→ 数据目录里的 .wt 文件'); css(into, { fontSize: '28px', color: '#00684A' });
  show(into, T('a19') + 0.2, { x: 20, y: 0 });
  figs(world, X2 + 140, 910, 1640, [[T('a12') + 0.4, '图 2-2', 'mongod 的两层：上层管查询，下层的存储引擎管存放', '出处：MongoDB 9.0 文档 Storage Engines']], T('a20') - 0.6);

  // ── 第三站：开场的三个 ?.wt 揭晓：users 的三个文件，各是一棵树（A06 I06 B03 B06 B07） ──
  const X3 = 3840;
  ch.sec(T('a20') - 0.5, '三个文件');
  const st = term(world, X3 + 140, 130, 1640, 200, 'mongosh', { fs: 24 });
  st.cmd(T('a21') - 0.1, 'db.users.stats({ indexDetails: true })');
  st.out(T('a21', 'users') + 0.2, "  <span class=\"k\">collection</span>: <span class=\"s\">'table:collection-ccaa694c-…'</span>");
  st.out(T('a21b') + 0.1, "  <span class=\"k\">_id_</span>: <span class=\"s\">'table:index-2f328dfc-…'</span>　　<span class=\"k\">name_1</span>: <span class=\"s\">'table:index-adff13f3-…'</span>");
  show(st.c, T('a21') - 0.3, { y: 12 });
  const files = [['collection-ccaa694c-….wt', '集合树', '放文档本身'], ['index-2f328dfc-….wt', '_id 索引', '按 _id 排好序'], ['index-adff13f3-….wt', '姓名索引', '按名字排好序']];
  const fx = files.map(([fn, nm, sub], i) => {
    const f = h('div', 'panel', world); px(f, X3 + 140 + i * 556, 360, 528, 470);
    const a = h('div', 'abs mono', f, '?.wt'); css(a, { left: '26px', top: '20px', font: '500 24px "Mono"', color: '#3D4F58' });
    keyed(a).at(T('a21', 'users') + 0.3 + i * 0.4, { html: fn });
    const b = h('div', 'abs', f, nm); css(b, { left: '26px', top: '56px', font: '500 44px "Serif SC"', color: '#001E2B' });
    const c = h('div', 'abs t-note', f, sub); css(c, { left: '26px', top: '120px', color: '#3D4F58' });
    const nLeaf = [4, 3, 15][i];
    const r = pg(f, 204, 172, 120, 50, '', 'root');
    const lw = Math.min(96, (468 - (nLeaf - 1) * 6) / nLeaf);
    const leaves = [];
    for (let k = 0; k < nLeaf; k++) leaves.push(pg(f, 30 + k * (lw + 6) + (468 - nLeaf * (lw + 6)) / 2, 278, lw, 66));
    const tov = svg('svg', { class: 'ov', viewBox: '0 0 528 470', width: 528, height: 470 }, f); css(tov, { width: '528px', height: '470px' });
    leaves.forEach((l) => svg('path', { d: `M264,222 L${parseFloat(l.style.left) + lw / 2},278`, stroke: '#889397', 'stroke-width': 2, fill: 'none' }, tov));
    const cnt = h('div', 'abs', f, `1 个根页 · ${nLeaf} 个叶页`); css(cnt, { left: '26px', top: '356px', font: '500 22px "Mono", "Sans SC"', color: '#5C6C75' });
    const item = h('div', 'abs', f); css(item, { left: '26px', top: '392px', width: '476px', height: '58px', borderRadius: '8px', background: '#E3FCF7', border: '2px solid #00A35C', font: '600 24px/54px "Mono", "Sans SC"', paddingLeft: '16px', boxSizing: 'border-box', color: '#023430' });
    item.textContent = ['编号 → Alice 的整份文档', 'ObjectId(…) → 编号', '"Alice" + 编号 → （空）'][i];
    return { f, item, cnt };
  });
  fx.forEach((x, i) => show(x.f, T('a20') + 0.1 + i * 0.25, { y: 20 }));
  glow(fx[0].f, T('a22') + 0.1, T('a23') - 0.1, { bg: '#E3FCF7', bd: '#00A35C', rd: '#E8EDEB' });
  glow(fx[1].f, T('a23') + 0.1, T('a24') - 0.1, { bg: '#E3FCF7', bd: '#00A35C', rd: '#E8EDEB' });
  const idxNote = gloss(callout(world, X3 + 760, 842, 'tip', '按某个字段排好序的另一棵树，查的时候不用把集合从头翻', '索引'), '索引');
  show(idxNote, T('a23', '索引') - 0.1, { y: 10 });
  const auto = chip(fx[1].f, 300, 66, '建集合时自带', 'blue'); show(auto, T('a23', '集合一建好') - 0.2, { y: 8 });
  glow(fx[2].f, T('a24') + 0.2, T('a25') - 0.1, { bg: '#E3FCF7', bd: '#00A35C', rd: '#E8EDEB' });
  const made = chip(fx[2].f, 300, 66, '后来另建的', 'yel'); show(made, T('a24', '另外') - 0.2, { y: 8 });
  hide(idxNote, T('a25') - 0.2, { y: 0, d: 0.35 });
  fx.forEach((x, i) => { hide(x.cnt, T('a25', '各占一项') - 0.4 + i * 0.3, { y: 0, d: 0.25 }); show(x.item, T('a25', '各占一项') - 0.3 + i * 0.3, { y: 14 }); });
  glow(fx.map((x) => x.item), T('a26', '注册'), null, { bg: '#00ED64', bd: '#00ED64' });
  sfx('pop', T('a25', '各占一项'));
  figs(world, X3 + 140, 860, 520, [[T('a20') + 0.6, '图 2-3', 'users 的三个文件', '实测：stats() · wt verify']], null);

  // 镜头：三站
  const a = drift(s.start, T('a9') - 0.5, 960, 1), b = drift(T('a9') + 0.9, T('a20') - 0.8, X2 + 960, 1), c = drift(T('a20') + 0.6, s.end, X3 + 960, 1);
  cam.track(s.start, { x: a.from, y: 540, z: 1 }, [
    [s.start + 0.1, { x: a.to }, a.d, { ease: 'none', sfx: false }],
    [T('a9') - 0.5, { x: b.from }, 1.3],
    [null, { x: b.to }, b.d, { ease: 'none', sfx: false }],
    [T('a20') - 0.8, { x: c.from }, 1.3],
    [null, { x: c.to }, c.d, { ease: 'none', sfx: false }],
  ]);
});
