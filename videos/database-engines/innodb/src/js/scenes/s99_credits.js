// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 版式与 MyISAM 一集相同（系列规则，WaterRun 2026-10-25：「结尾要用和MyISAM类似的Select Credit, 整个系列都是如此, 结尾用数据库查询列出贡献」）：
// 在 mysql 客户端里查一张「名单」表，一条分工一行；画法用本片的浅色纸面、白色面板与等宽字。名单不配旁白。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, 1, []);              // 镜头只极慢横移（parts.js）
  const rows = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) for (const r of m.roles || []) rows.push([label(r), m.name]);
  rows.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  rows.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  // 客户端面板：顶上一条标题栏，里面先打出查询语句，再逐行列出结果
  const P = { x: 160, y: 100, w: 1600, h: 160 + rows.length * 58 + 130 };
  const panel = h('div', 'box', W); px(panel, P.x, P.y, P.w, P.h);
  const bar = h('div', 'abs', panel); px(bar, 0, 0, P.w - 3, 44); css(bar, { background: 'var(--band)', borderBottom: '1.5px solid var(--edge)' });
  const ttl = h('div', 'abs mono', panel, 'mysql  ·  innodb_demo'); px(ttl, 24, 8); css(ttl, { fontSize: '24px', color: 'var(--ink2)' });
  const cmd = h('div', 'sql', panel, ''); px(cmd, 36, 70); cmd.style.fontSize = '32px';
  const t0 = s.start + 0.15;
  wipe(panel, t0, { dir: 't', d: 0.45 }); sfx('whoosh', t0, { g: 0.35 });
  const tCmd = typeText(cmd, 'mysql&gt; <span class="kw">SELECT</span> role, name <span class="kw">FROM</span> credits;', t0 + 0.35, 60, { cursor: false });
  // 结果表：两列，表头与分隔线照客户端的样子；一行一行出来
  const X1 = 36, X2 = 560, Y0 = 140, RH = 58;
  const head = h('div', 'abs', panel); px(head, X1, Y0, P.w - 72, RH);
  css(head, { borderTop: '2px solid var(--mainD)', borderBottom: '2px solid var(--mainD)' });
  const hk = h('div', 'abs mono', head, 'role'), hv = h('div', 'abs mono', head, 'name');
  [hk, hv].forEach((e, i) => { px(e, i ? X2 - X1 : 14, 12); css(e, { fontSize: '28px', color: 'var(--mainD)', fontWeight: 700 }); });
  vanish(head, 0); appear(head, tCmd + 0.15);
  const tR = tCmd + 0.3;
  rows.forEach(([k, v], i) => {
    const y = Y0 + RH * (i + 1);
    const kE = h('div', 'abs', panel, esc(k)); px(kE, X1 + 14, y + 10); css(kE, { font: '500 30px "Sans SC"', color: 'var(--ink2)' });
    const vE = h('div', 'abs mono', panel, esc(v)); px(vE, X2, y + 8); css(vE, { fontSize: '32px', color: i === 0 ? 'var(--main)' : 'var(--ink)', fontWeight: i === 0 ? 700 : 500 });
    const ln = h('div', 'abs', panel); px(ln, X1, y + RH - 1, P.w - 72, 1); css(ln, { background: 'var(--edge)' });
    [kE, vE, ln].forEach((e) => { vanish(e, 0); appear(e, tR + i * 0.07); });
  });
  sfx('blip', tR, { g: 0.4 });
  const n = h('div', 'abs mono', panel, `${rows.length} rows in set`); px(n, X1 + 14, Y0 + RH * (rows.length + 1) + 16); css(n, { fontSize: '28px', color: 'var(--ink2)' });
  vanish(n, 0); appear(n, tR + rows.length * 0.07 + 0.1); sfx('tick', tR + rows.length * 0.07 + 0.1, { g: 0.4 });
});
