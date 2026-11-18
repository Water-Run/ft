// 第 02 章 一个集合，三棵树：集合是什么 → people 集合里三份样子不同的文档 → mongod 的两层与 WiredTiger → 只认键和值、按键排序
// → 数据目录里 users 的三个文件，各是一棵树，Alice 在三棵树里各占一项。
// 事实：I05 A12 A04 G00b C02 I01 I02 I03 V02 A13 B01 A06 I06 B05–B07。
scene('whole', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const xl = (parent, x, y, txt, cls = 'dk') => chip(parent, x, y, txt, cls + ' xl');

  // ── 第一站：集合（I05），people 集合里样子各不相同的文档（A12）──
  const coll = gloss(h('div', 'panel', world), '集合'); px(coll, 140, 120, 1640, 720);
  const ct = h('div', 'abs', coll, '集合'); css(ct, { left: '36px', top: '24px', font: '700 50px "Serif SC"', color: '#00684A' });
  const cname = h('div', 'abs mono', coll, 'people'); css(cname, { left: '170px', top: '36px', font: '700 40px "Mono"', color: '#023430' });
  show(coll, c0, { y: 20 });
  // a1：一份份文档放进来（示意：深色的小文档）
  const ghosts = [0, 1, 2].map((i) => {
    const g = h('div', 'abs', coll); px(g, 60 + i * 250, 150, 220, 170); css(g, { background: '#023430', borderRadius: '12px' });
    for (let k = 0; k < 3; k++) { const b = h('div', 'abs', g); px(b, 26, 34 + k * 40, [150, 110, 130][k], 14); css(b, { background: k === 0 ? '#71F6BA' : '#5C6C75', borderRadius: '7px' }); }
    show(g, T('a1') + 0.2 + i * 0.25, { y: -60, d: 0.6, ease: 'power2.out' }); return g;
  });
  const eq = xl(coll, 860, 160, '≈ 关系数据库里的一张表'); show(eq, T('a2', '一张表') - 0.2, { x: -20, y: 0 });
  const free = xl(coll, 860, 250, '默认不规定文档长什么样', 'dk'); show(free, T('a3', '不规定'), { x: -20, y: 0 });
  set(cname, s.start, { autoAlpha: 0 }); show(cname, T('a4', 'people'), { x: -16, y: 0 });
  fadeOut([...ghosts, eq, free], T('a4', 'people') - 0.1);
  // a4b–a6：三份文档，字段各不相同
  const docs = [
    ['Alice', [['name', '"Alice"'], ['age', '42']], ['a4b', 'Alice']],
    ['Erin', [['name', '"Erin"'], ['email', '"erin@example.com"'], ['tags', '["db", "go"]']], ['a5', 'Erin']],
    ['Frank', [['name', '"Frank"'], ['address', '{ city: "Lisbon" }']], ['a6', 'Frank']],
  ];
  const keyEls = [];
  docs.forEach(([who, fields, at], i) => {
    const d = h('div', 'abs', coll); px(d, 36 + i * 530, 130, 510);
    css(d, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '12px', padding: '26px 26px', boxSizing: 'border-box', font: '500 28px/48px "Mono"', whiteSpace: 'pre' });
    d.innerHTML = '{<br>' + fields.map(([k, v]) => `  <span class="fk">${k}</span>: <span style="color:#3D4F58">${esc(v)}</span>`).join(',<br>') + '<br>}';
    d.querySelectorAll('.fk').forEach((e) => { css(e, { borderRadius: '4px', padding: '0 4px' }); keyEls.push(e); });
    show(d, T(at[0], at[1]), { y: 24 });
    const tag = chip(coll, 36 + i * 530 + 20, 104, who, 'dk xl'); css(tag, { fontFamily: '"Inter"', padding: '6px 22px' }); show(tag, T(at[0], at[1]) - 0.2, { y: 0, s: 1.2 });
  });
  // a7：字段名就存在每份文档里
  to(keyEls, T('a7', '字段名'), { backgroundColor: '#00ED64', color: '#023430', duration: 0.4, stagger: 0.06 });
  const kn = label(coll, 36, 500, '字段名跟着每份文档一起存，各带各的', 't-body'); show(kn, T('a7', '字段名') + 0.3, { y: 8 });
  const w1 = xl(coll, 36, 590, 'MongoDB 照样要把它们写进文件'), w2 = xl(coll, 700, 590, '再按名字找出来');
  show(w1, T('a8', '写进文件') - 0.3, { y: 12 }); show(w2, T('a8b', '找出来') - 0.3, { y: 12 });

  // ── 第二站：mongod 的两层（G00b C02 I01），WiredTiger 的来历（I02 I03 V02），只认键和值（A13 B01）──
  const X2 = 1920;
  const md = h('div', 'abs', world); px(md, X2 + 140, 150, 1640, 710); css(md, { border: '3px solid #061621', borderRadius: '14px' });
  const mdt = xl(world, X2 + 170, 112, 'mongod'); css(mdt, { fontFamily: '"Mono"' });
  const mds = label(world, X2 + 400, 128, 'MongoDB 的服务端进程', 't-note'); css(mds, { background: '#FDFFF5', padding: '0 12px' });
  show(md, T('a9') - 0.3, { y: 20 }); show(mdt, T('a9'), { y: 0, s: 1.2 }); show(mds, T('a9') + 0.4, { y: 6 });
  const up = h('div', 'abs', md); px(up, 30, 50, 1574, 150); css(up, { background: '#F9FBFA', border: '1.5px solid #C1C7C6', borderRadius: '8px' });
  const upt = h('div', 'abs', up, '上层：收下查询，决定怎么执行'); css(upt, { left: '30px', top: '22px', font: '600 34px "Sans SC"' });
  const upq = h('div', 'abs mono', up, 'find({ name: "Alice" })  →  用姓名索引'); css(upq, { left: '30px', top: '84px', font: '600 30px "Mono"', color: '#00684A' });
  show(up, T('a9', '进程'), { y: 12 }); show(upq, T('a11', '决定'), { x: -16, y: 0 });
  const lo = gloss(h('div', 'abs', md), '存储引擎'); px(lo, 30, 230, 1574, 450); css(lo, { background: '#E3FCF7', border: '2px solid #00684A', borderRadius: '8px' });
  const lot = h('div', 'abs', lo, '下层：存储引擎 · 管数据在内存和磁盘上怎样存放'); css(lot, { left: '30px', top: '22px', font: '600 34px "Sans SC"', color: '#023430' });
  const wt = h('div', 'abs', lo, 'WiredTiger'); css(wt, { left: '30px', top: '76px', font: '800 72px "Inter"', color: '#00684A' });
  show(lo, T('a12', '下层'), { y: 12 }); show(wt, T('a13', 'WiredTiger'), { x: -20, y: 0 });
  const hist = [['原本', '一家同名公司的产品', ['a13b', '公司']], ['2014 年底', '被 MongoDB 收购', ['a14', '收购']], ['2015 年初', '3.0 版带上了它', ['a14b', '3.0']], ['如今 9.0', '默认就用它', ['a15', '默认']]];
  const hs = hist.map(([y, t, at], i) => {
    const r = h('div', 'abs', lo); px(r, 700, 84 + i * 50);
    r.innerHTML = `<span style="display:inline-block;min-width:150px;padding:2px 12px;border-radius:999px;background:#023430;color:#fff;font:600 24px 'Mono';text-align:center">${y}</span>　<span style="font:500 28px 'Sans SC'">${t}</span>`;
    show(r, T(at[0], at[1]) - 0.2, { x: -16, y: 0 }); return r;
  });
  // a16：它不认识文档
  const dcard = codeCard(lo, 900, 30, 520, 'Alice 的文档', 180); dcard.line('{ name: "Alice", age: 42 }');
  const noDoc = xl(lo, 1180, 160, '不认识文档', 'dk');
  fadeOut(hs, T('a16') - 0.2); show(dcard.c, T('a16'), { x: 20, y: 0 }); show(noDoc, T('a16', '不认识') + 0.1, { y: 0, s: 1.3 }); sfx('error', T('a16', '不认识') + 0.1, { g: 0.5 });
  // a17–a19：一项一项的键和值，按键排好序
  const KV = [['k1', '2e 00 00 00 07 5f 69 64 00 6a fa 6c a2 …'], ['k2', '2f 00 00 00 07 5f 69 64 00 6a fa 6c a2 6f 27 50 6c fb 0a 4e 81 …'], ['k3', '2e 00 00 00 07 5f 69 64 00 6a fa 6c a2 …'], ['k4', '30 00 00 00 07 5f 69 64 00 6a fa 6c a2 …']];
  const rows = KV.map(([k, v], i) => {
    const kk = pg(lo, 30, 190 + i * 64, 170, 54, k); css(kk, { font: '700 28px "Mono"', color: '#023430' });
    const vv = h('div', 'abs mono', lo, v); px(vv, 220, 190 + i * 64, 1320, 54); css(vv, { background: '#fff', border: '2px solid #C1C7C6', borderRadius: '6px', font: '500 24px/50px "Mono"', color: '#5C6C75', paddingLeft: '18px', boxSizing: 'border-box', overflow: 'hidden' });
    return [kk, vv];
  });
  fadeOut([dcard.c, noDoc], T('a17') - 0.1);
  const kvL = label(lo, 900, 120, '键　→　值', 'h2'); css(kvL, { fontSize: '40px', color: '#023430' });
  show(rows[1], T('a17', '键和值'), { y: 12, stagger: 0.15 }); show(kvL, T('a17', '键和值'), { y: 8 });
  glow(rows[1][1], T('a18', '一串字节'), null, { bg: '#00ED64', bd: '#00ED64', c: '#023430' });
  const vN = label(lo, 1240, 120, '值：装的是什么，它不过问', 't-note'); show(vN, T('a18', '不过问') - 0.2, { y: 8 });
  show([...rows[0], ...rows[2], ...rows[3]], T('a19', '排好序'), { y: 16, stagger: 0.08 });
  fadeOut([kvL, vN], T('a19', '排好序'));
  const sorted = xl(lo, 900, 110, '按键排好序 → 存进数据目录里的文件'); show(sorted, T('a19', '排好序') + 0.4, { y: 10 });

  // ── 第三站：数据目录里 users 的三个文件，各是一棵树（A06 I06 B05–B07）──
  const X3 = 3840;
  const dir = h('div', 'abs mono', world, 'db/'); px(dir, X3 + 160, 110); css(dir, { font: '700 40px "Mono"' });
  const files = [['collection-….wt', '集合树', '放文档本身（键是一个编号，下一章讲）'], ['index-….wt', '_id 索引', '按 _id 排好序'], ['index-….wt', '姓名索引', '按名字排好序']];
  const fx = files.map(([fn, nm, sub], i) => {
    const f = h('div', 'panel', world); px(f, X3 + 140 + i * 556, 180, 520, 600);
    const a = h('div', 'abs mono', f, fn); css(a, { left: '26px', top: '20px', font: '500 26px "Mono"', color: '#5C6C75' });
    const b = h('div', 'abs', f, nm); css(b, { left: '26px', top: '62px', font: '700 44px "Serif SC"', color: '#061621' });
    const c = h('div', 'abs t-note', f, sub); css(c, { left: '26px', top: '126px' });
    // 一棵小树：根 + 一排叶页（叶页数按实测：4、3、15）
    const nLeaf = [4, 3, 15][i];
    pg(f, 200, 200, 120, 60, '', 'root');
    const lw = Math.min(96, (460 - (nLeaf - 1) * 6) / nLeaf);
    const leaves = [];
    for (let k = 0; k < nLeaf; k++) leaves.push(pg(f, 30 + k * (lw + 6) + (460 - nLeaf * (lw + 6)) / 2, 350, lw, 80));
    const tov = svg('svg', { class: 'ov', viewBox: '0 0 520 600', width: 520, height: 600 }, f); css(tov, { width: '520px', height: '600px' });
    leaves.forEach((l) => svg('path', { d: `M260,260 L${parseFloat(l.style.left) + lw / 2},350`, stroke: '#889397', 'stroke-width': 2, fill: 'none' }, tov));
    const item = h('div', 'abs', f); css(item, { left: '26px', top: '470px', width: '468px', height: '90px', borderRadius: '8px', background: '#E3FCF7', border: '2px solid #00684A', font: '600 26px/86px "Mono"', paddingLeft: '18px', boxSizing: 'border-box', color: '#023430' });
    item.textContent = ['编号 → { Alice 的整份文档 }', 'ObjectId(…) → 编号', '"Alice" + 编号 → （空）'][i];
    return { f, item };
  });
  show(dir, T('a20') - 0.3, { y: 10 });
  fx.forEach((x, i) => show(x.f, T('a20') + 0.2 + i * 0.3, { y: 20 }));
  const tq = label(world, X3 + 700, 110, '找起来不用从头翻', 't-body'); show(tq, T('a20', '不用从头翻') - 0.2, { x: -10, y: 0 });
  const usr = xl(world, X3 + 1300, 96, 'users 集合 + 两个索引'); show(usr, T('a21', 'users'), { y: 10 });
  fadeOut(tq, T('a21') - 0.1);
  glow(fx[0].f, T('a22') + 0.2, T('a23') - 0.1, { bg: '#C0FAE6' });
  const idxNote = gloss(note(world, X3 + 140, 800, '<b>索引</b>：按某个字段排好序的另一棵树，查的时候不用把集合从头翻', 'g'), '索引'); css(idxNote, { fontSize: '30px' });
  show(idxNote, T('a23', '索引'), { y: 10 }); glow(fx[1].f, T('a23', '索引'), T('a24') - 0.1, { bg: '#C0FAE6' });
  glow(fx[2].f, T('a24') + 0.3, T('a25') - 0.1, { bg: '#C0FAE6' });
  fadeOut(idxNote, T('a25') - 0.2);
  fx.forEach((x, i) => show(x.item, T('a25', '各占一项') - 0.3 + i * 0.3, { y: 14 }));
  glow(fx.map((x) => x.item), T('a26', '注册'), null, { bg: '#00ED64', bd: '#00ED64' });
  sfx('pop', T('a25', '各占一项'));

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
