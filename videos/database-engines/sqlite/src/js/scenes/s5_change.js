// 05 改和删（第 11 稿）：Alice 改年龄——事务、回滚日志、先写稳日志、删日志即提交（J05、I03、S13）；后来编号 1024 以后都注销了，Alice 在其中——空闲链、复用、VACUUM（J06、D01、D02、G19）。
// 两段各用自己的画面层：前一段在 d1 之前收走。
scene('change', ({ root, s, c0 }) => {
  {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const title = pageTitle(W, '改年龄：要动不止一页'); show(title, c0 + 0.1, { y: 8 });
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
  const PAGES = DATA.wal.frames;                       // 改年龄要动的页：叶页 130 与年龄索引的 4 页
  const MAIN = panel('main.db', 120, 250, 600, 420);
  wipe(MAIN, c0 + 0.15, { dir: 'l', d: 0.45 });
  const rowEl = (p, pg, i, val) => { const r = h('div', 'abs', p); px(r, 20, 56 + i * 68, 556, 56); css(r, { border: `1.5px solid ${K.ink}`, background: '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '20px', boxSizing: 'border-box' }); const a = h('span', '', r, `第 ${pg} 页`); a.style.fontFamily = 'Mono'; const b = h('span', '', r, val); r.val = b; return r; };
  const mRows = PAGES.map((pg, i) => rowEl(MAIN, pg, i, pg === 130 ? 'Alice · 42' : '年龄索引 · 42 岁'));
  mRows.forEach((r, i) => show(r, c0 + 0.4 + i * 0.08, { x: -10, y: 0, d: 0.3 }));
  // j1–j2：42 改成 43；要改的不止一页
  const chg = tx(W, '42 → 43', 760, 300, { fs: 30, color: K.teal }); show(chg, T('j1', '43'), { x: -10, y: 0 });
  mRows.forEach((r, i) => set(r, T('j2', '不止一页') + i * 0.1, { borderColor: K.teal })); sfx('tick', T('j2', '不止一页'), { g: 0.4 });
  // j3：只写进去一部分就断电：新旧混杂
  const tCut = T('j3', '断电');
  keyed(mRows[0].val).at(T('j3', '一部分') , { html: 'Alice · <b>43</b>' }).at(T('j4b', '从没发生过'), { html: 'Alice · 42' });
  const mix = errBox(W, '断电：新旧混杂', 760, 380, 28); set(mix, 0, { autoAlpha: 0 }); slam(mix, tCut, { from: 1.3 }); sfx('error', tCut, { g: 0.5 });
  // j4–j4b：事务
  const gTx = gloss(W, '事务', '一次修改要么全部生效，要么像从没发生过', 760, 470, 420); show(gTx, T('j4', '事务'), { x: 12, y: 0 }); sfx('pop', T('j4', '事务'), { g: 0.4 });
  gone(mix, T('j4b') - 0.1, 0.3);
  // j6–j5：改主文件之前，先把要改的页原样抄进旁边一个文件：回滚日志
  const JR = panel('main.db-journal', 1200, 250, 600, 420);
  const tCp = T('j6', '抄进') - 0.2;
  [chg, gTx].forEach((e) => gone(e, tCp - 0.2, 0.3));
  wipe(JR, tCp, { dir: 'l', d: 0.45 }); sfx('whoosh', tCp, { g: 0.3 });
  const jRows = PAGES.map((pg, i) => rowEl(JR, pg, i, pg === 130 ? 'Alice · 42' : '年龄索引 · 42 岁'));
  jRows.forEach((r, i) => { set(r, 0, { autoAlpha: 0 }); tl.fromTo(r, { autoAlpha: 1, x: -1080 }, { x: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tCp + 0.3 + i * 0.12); });
  const gJ = gloss(W, '回滚日志', '改之前的原页，原样抄在旁边；SQLite 默认就用它', 760, 690, 560); show(gJ, T('j5', '回滚日志'), { y: 8 }); sfx('pop', T('j5', '回滚日志'), { g: 0.4 });
  // j7：每页带着页号；日志开头记着原来的文件有 553 页
  const jh = tx(JR, '日志头：原来 553 页', 330, 6, { fs: 22, color: K.teal }); show(jh, T('j7b', '原来'), { y: 6 });
  jRows.forEach((r, i) => set(r.firstChild, T('j7', '页号') + i * 0.06, { color: K.teal, fontWeight: 700 }));
  jRows.forEach((r) => { r.dataset.beat = 'line'; });   // 选中只描外框：页号同时在变色，不能让 .bt 的白字盖过去（set 会记下白字）
  // j8：日志先写稳到磁盘，再动主文件
  const sync = btn(JR, '已写到磁盘上', 380, 370, 24); set(sync, 0, { autoAlpha: 0 }); slam(sync, T('j8', '磁盘'), { from: 1.2 }); sfx('thud', T('j8', '磁盘'), { g: 0.4 });
  // j9：主文件写好，删掉日志：删掉的那一刻，就是提交
  mRows.forEach((r, i) => keyed(r.val).at(T('j9', '写好') + i * 0.1, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' }));
  sfx('tick', T('j9', '写好'), { g: 0.4 });
  const tDel = T('j9', '删掉');
  wipeOut(JR, tDel, { dir: 'r', d: 0.4 }); sfx('whoosh', tDel, { g: 0.35 });
  const gC = gloss(W, '提交', '回滚日志删掉的那一刻，修改就算生效', 1200, 450, 560); show(gC, T('j9', '提交'), { x: 12, y: 0 }); sfx('chime', T('j9', '提交'), { g: 0.45 });
  gone(gJ, tDel, 0.3);

  gone(world, T('d1') - 0.35, 0.3); gone(title, T('d1') - 0.35, 0.25);
  beats([[T('j1', 'Alice'), mRows[0]], [T('j1', '43'), chg], [T('j2'), MAIN.nameEl], [T('j2', '叶页'), mRows[0]], [T('j2', '年龄索引'), mRows.slice(1)], [T('j3'), mRows[0]], [T('j3', '断电'), mix], [T('j3', '混杂'), mRows.slice(1)], [T('j4'), gTx], [T('j4b', '全部生效'), mRows], [T('j4b', '从没发生过'), mRows[0]], [T('j6'), MAIN.nameEl], [T('j6', '抄进'), jRows], [T('j5'), JR.nameEl], [T('j7', '页号'), jRows], [T('j7b', '原来'), jh], [T('j8'), sync], [T('j9'), MAIN.nameEl], [T('j9', '写好'), mRows], [T('j9', '删掉'), JR], [T('j9', '提交'), gC], [T('j7b', '日志开头'), JR.nameEl], [T('j2') + 0.62, [MAIN, ...mRows], 1], [T('j2') + 4.95, [MAIN, ...mRows], 1], [T('j5') + 3.96, [JR, gJ], 1]], Tend('j9'));
  [[T('j4') - 0.2, '事务：要么全部生效，要么像从没发生过'], [T('j6') - 0.2, '回滚日志：先把原页抄在旁边'], [T('j9') - 0.2, '删掉日志的那一刻：提交']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1810, 896], pad: 0 }]]);
  }
  {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const R = DATA.reuse, X0 = 120, FULL = 1660, k = FULL / R.before.page_count, Y = 360, H = 90;
  const title = pageTitle(W, '编号 1024 以后的用户都注销了'); set(title, 0, { autoAlpha: 0 }); show(title, T('d1') - 0.2, { y: 8 });
  // d1：编号 1024 以后的用户都注销了（实验的原句），Alice（2050）也在其中
  const del = codeBlock(W, ['DELETE FROM users WHERE id > 1024;'], X0, 250, { fs: 30 }); wipe(del, T('d1', '注销') - 0.2, { dir: 'l', d: 0.4 }); sfx('tick', T('d1', '注销'), { g: 0.4 });
  const aliceD = tx(W, 'Alice（2050）也在其中', X0 + 700, 258, { fs: 30, css: { background: K.wheat, padding: '2px 14px' } }); show(aliceD, T('d1', 'Alice'), { x: -10, y: 0 }); sfx('pop', T('d1', 'Alice'), { g: 0.35 });
  // 文件长条：用着的页（白）与空闲页（斜纹）
  const frame = h('div', 'abs', W); px(frame, X0, Y, FULL, H); css(frame, { border: `2px solid ${K.ink}`, boxSizing: 'border-box' }); frame.dataset.name = 'main.db 的页'; frame.dataset.beat = 'line';
  const used = h('div', 'abs', W); px(used, X0, Y, FULL, H); css(used, { background: '#ffffff', borderRight: `2px solid ${K.ink}`, boxSizing: 'border-box' });
  const free = h('div', 'abs', W); px(free, X0 + FULL, Y, 0, H); css(free, { background: 'repeating-linear-gradient(135deg,#f5deb3 0 8px,#ffffff 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲的页，不是渐变
  const lab = tx(W, '', X0, Y + H + 14, { fs: 28 });
  const pagesL = tx(W, '', X0 + FULL - 260, Y - 46, { fs: 28, mono: true });
  wipe(frame, T('d1', '注销') + 0.3, { dir: 'l', d: 0.4 }); show(used, T('d1', '注销') + 0.4, { y: 0, d: 0.3 });
  keyed(pagesL).at(T('d1', '注销') + 0.4, { html: `${R.before.page_count} 页` }).at(T('d7b', '283'), { html: `${R.vacuumed.page_count} 页` });
  keyed(lab).at(T('d1', '注销') + 0.4, { html: `${R.before.rows} 个用户 · 空闲 0 页` }).at(T('d2', '1024'), { html: `${R.deleted.rows} 个用户 · 空闲 <b>${R.deleted.freelist_count}</b> 页` }).at(T('d6b', '260'), { html: `${R.reused.rows} 个用户 · 空闲 <b>${R.reused.freelist_count}</b> 页` }).at(T('d7b', '一页不剩'), { html: `${R.vacuumed.rows} 个用户 · 空闲 0 页` });
  const seg = (fp, t) => { const w = fp * k; tl.fromTo(used, { width: used._w || FULL }, { width: FULL - w, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, t); tl.fromTo(free, { left: X0 + FULL - (free._w || 0), width: free._w || 0 }, { left: X0 + FULL - w, width: w, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, t); used._w = FULL - w; free._w = w; };
  // d3：4096 删到 1024，文件仍是 553 页
  seg(R.deleted.freelist_count, T('d2', '1024') - 0.1); sfx('whoosh', T('d2', '1024'), { g: 0.3 });
  const same = tx(W, '文件大小没变', X0 + FULL - 200, Y + H + 14, { fs: 28, color: K.teal }); show(same, T('d2', '553'), { y: 6 });
  const av = codeBlock(W, ['PRAGMA auto_vacuum;　-- 默认 0（NONE）'], X0, 520, { fs: 28 }); set(av, 0, { autoAlpha: 0 }); wipe(av, T('d3', '默认') - 0.1, { dir: 'l', d: 0.4 }); sfx('tick', T('d3', '默认'), { g: 0.35 });
  gone(av, T('d4') - 0.2, 0.3); gone(aliceD, T('d3') - 0.2, 0.3);
  // d4：空出的 394 页串成一条空闲链，链头记在文件头里
  const chain = []; for (let i = 0; i < 5; i++) { const b = pageCell(W, X0 + 640 + i * 150, 600, 100, 70, { fill: K.wheat, bw: 2 }); chain.push(b); }
  const more = tx(W, `… 一共 ${R.deleted.freelist_count} 页`, X0 + 640 + 5 * 150, 620, { fs: 28 });
  const head = btn(W, '文件头：链头', X0, 616, 26);
  const cl = [line(ov, [[X0 + 240, 636], [X0 + 636, 636]])].concat(chain.slice(0, 4).map((b, i) => line(ov, [[X0 + 740 + i * 150, 636], [X0 + 786 + i * 150, 636]])));
  set(head, 0, { autoAlpha: 0 }); slam(head, T('d4', '文件头'), { from: 1.2 });
  chain.forEach((b, i) => show(b, T('d4', '空闲链') - 0.2 + i * 0.08, { x: -10, y: 0, d: 0.3 })); cl.forEach((l, i) => arrowIn(l, T('d4', '空闲链') - 0.25 + i * 0.08, 0.2)); show(more, T('d4', '394'), { x: -10, y: 0 });
  const gF = gloss(W, '空闲链', '空出的页一页指向下一页，串成一条链；链头记在文件头里', X0 + 640, 720, 760); show(gF, T('d4', '空闲链'), { y: 8 }); sfx('pop', T('d4', '空闲链'), { g: 0.4 });
  // d5–d6：再有新用户注册，先用空闲页；再插入 1024 行，文件一页没长，空闲页剩下 260
  const ins = codeBlock(W, ['INSERT INTO users …　-- 再插入 1024 行'], X0, 250, { fs: 26 }); set(ins, 0, { autoAlpha: 0 }); gone(del, T('d5') - 0.2, 0.2); show(ins, T('d5') - 0.1, { y: 0, d: 0.3 });
  set(chain[0], T('d5', '空闲页'), { backgroundColor: '#ffffff' }); set(chain[1], T('d5', '空闲页') + 0.15, { backgroundColor: '#ffffff' });
  seg(R.reused.freelist_count, T('d6b', '260') - 0.2); sfx('tick', T('d6b', '260'), { g: 0.4 });
  // d7–d7b：VACUUM 把整个库重写一遍：文件缩到 283 页，空闲页一页不剩
  const tV = T('d7', 'vacuum') - 0.2;
  [ins, gF, same, head, more, ...chain, ...cl].forEach((e) => gone(e, tV, 0.3));
  const vac = codeBlock(W, ['VACUUM;'], X0, 250, { fs: 26 }); set(vac, 0, { autoAlpha: 0 }); show(vac, tV + 0.1, { y: 0, d: 0.3 });
  const gV = gloss(W, 'VACUUM', '把整个数据库复制到临时文件再覆盖回来，重建出最小的文件', X0, 600, 760); show(gV, T('d7', 'vacuum'), { y: 8 });
  tl.fromTo(frame, { width: FULL }, { width: R.vacuumed.page_count * k, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(used, { width: FULL - R.reused.freelist_count * k }, { width: R.vacuumed.page_count * k, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(free, { width: R.reused.freelist_count * k }, { width: 0, duration: 0.5, immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(pagesL, { x: 0 }, { x: -(FULL - R.vacuumed.page_count * k), duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  sfx('whoosh', T('d7b', '283') - 0.2, { g: 0.35 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('d1'), del], [T('d1', 'Alice'), aliceD], [T('d2'), lab], [T('d2', '553'), pagesL], [T('d3'), same], [T('d3', '默认'), av], [T('d3', '不会变小'), [frame, pagesL]], [T('d4'), head], [T('d4', '空闲链'), gF], [T('d5'), ins], [T('d6'), lab], [T('d7'), vac], [T('d7b'), pagesL], [T('d7b', '一页不剩'), lab], [T('d1') + 5.45, [frame, del], 1], [T('d2') + 4.27, [frame, lab], 1], [T('d6') + 2.22, [frame, ins], 1], [T('d7b') + 4.20, [frame, pagesL, lab], 1], [T('d3') + 1.56, [frame, same], 1], [T('d7b') + 4.0, [vac, gV], 1]], Tend('d7b'));
  [[T('d4') - 0.2, '空出的页：串成一条空闲链'], [T('d5') - 0.2, '新用户注册：先用空闲页'], [T('d7') - 0.2, 'VACUUM：重写整个数据库文件']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 240, 1800, 820], zmax: 1.2 }]]);
  }
});
