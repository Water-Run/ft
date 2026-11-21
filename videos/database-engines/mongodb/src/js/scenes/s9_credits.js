// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。
// 系列约定：终端里执行一条查询列出名单，末尾给出条数；名单不配旁白。本集不是 SQL，所以用 mongosh：
// db.credits.find() 打出一份份文档（每份一项分工），再用 db.credits.countDocuments() 给出份数。版式照 mongosh 的输出：
// 短文档一行，长文档按字段折成多行。
scene('credits', ({ root, s }) => {
  const C = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  makeCamera(world);                       // 镜头不动
  const items = [[tr('策划', 'Planning'), C.planner || '']];
  for (const m of [...(C.models || []), ...(C.services || [])]) items.push([(m.roles || []).map(label).join(' · '), m.name]);
  items.push([tr('许可', 'License'), (window.PROJECT && window.PROJECT.license) || 'GPL-3.0-or-later']);
  items.push([tr('开源视频', 'Open-source video'), String(C.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);

  const card = h('div', 'card', world); px(card, 120, 90, 1680, 860);
  h('div', 'bar', card, '<span class="lang">mongosh · test</span><span class="copy"></span>');
  const body = h('div', 'abs', card); css(body, { left: '34px', top: '78px', right: '34px', font: '400 27px/42px "Mono", "Sans SC"', whiteSpace: 'pre', color: '#001E2B' });
  const q1 = h('div', '', body, ''); css(q1, { minHeight: '42px' });
  const tq = typeText(q1, '<span class="p">test&gt;</span> db.<span class="k">credits</span>.find()', s.start + 0.3, 30, { cursorUntil: s.start + 1.6 });
  const s_ = (v) => `<span class="s">'${esc(v)}'</span>`;
  const out = [];
  out.push('[');
  items.forEach(([role, name], i) => {
    const tail = i === items.length - 1 ? '' : ',';
    const one = `  { <span class="k">_id</span>: <span class="n">${i + 1}</span>, <span class="k">role</span>: ${s_(role)}, <span class="k">name</span>: ${s_(name)} }${tail}`;
    if ([...role].length + [...name].length < 34) out.push(one);
    else out.push(`  {\n    <span class="k">_id</span>: <span class="n">${i + 1}</span>,\n    <span class="k">role</span>: ${s_(role)},\n    <span class="k">name</span>: ${s_(name)}\n  }${tail}`);
  });
  out.push(']');
  const res = h('div', '', body, out.join('\n'));
  const tOut = Math.max(tq + 0.3, s.start + 1.8);
  show(res, tOut, { y: 8, d: 0.4 }); sfx('tick', tOut, { g: 0.5 });
  const q2 = h('div', '', body, ''); css(q2, { marginTop: '10px', minHeight: '42px' });
  const tq2 = typeText(q2, '<span class="p">test&gt;</span> db.<span class="k">credits</span>.countDocuments()', tOut + 1.2, 30, { cursorUntil: tOut + 2.8 });
  const cnt = h('div', '', body, `<span class="n">${items.length}</span>`);
  show(cnt, tq2 + 0.3, { y: 0, d: 0.3 }); sfx('pop', tq2 + 0.3, { g: 0.5 });
  appear(q2, tOut + 1.2);
  // 卡片按内容收紧，在字幕条之上竖直居中
  const H = 78 + body.offsetHeight + 40;
  css(card, { height: H + 'px', top: Math.max(60, Math.round((960 - H) / 2)) + 'px' });
  show(card, s.start + 0.45, { y: 10, d: 0.35 });
  const nL = out.join('\n').split('\n').length;
  beat(card, tOut + 0.8, 24, 78 + 42 - 4, 1620, 42 * (nL - 2) + 8, 1.4, K.gb);
  beat(card, tq2 + 0.6, 24, 78 + 42 * (nL + 1) + 6, 360, 92, 1.2);
  pt(card, 24, 78 + 42 * (nL - 1) - 4, 1200, 48, s.end - 3.6, s.end - 1.7);
  beat(card, s.end - 1.5, 24, 78 + 42 * nL + 6, 760, 46, 1.2, K.gb);
});
