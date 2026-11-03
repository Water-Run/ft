// 08 怎么删（第 12 稿）：Alice 这一行的最后一件事——后来编号 1024 以后都注销了，Alice 在其中：文件不变小、空闲链、新用户先用空闲页、VACUUM（J06、D01、D02、G19）。
// 画面是整个 main.db 的长条：用着的页白、空闲页斜纹，长条在原地变化。
scene('drop', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const W = h('div', 'abs', world); px(W, 0, 0, 1920, 1080);
  const ov = overlay(W);
  const panel = (name, x, y, w, hh) => { const p = h('div', 'abs', W); px(p, x, y, w, hh); css(p, { border: `2px solid ${K.ink}`, background: '#fff', boxSizing: 'border-box' }); const n = h('div', 'abs', p, name); px(n, 0, 0, w - 4, 40); css(n, { background: '#dddddd', borderBottom: '1.5px solid #aaaaaa', fontFamily: 'Mono', fontSize: '24px', padding: '4px 14px', boxSizing: 'border-box' }); p.nameEl = n; return p; };
  const title = pageTitle(W, '');
  const R = DATA.reuse, X0 = 120, FULL = 1660, k = FULL / R.before.page_count, Y = 410, H = 120, LABY = Y + H + 14, AVY = LABY + 56, CHY = AVY + 92, GFY = CHY + 112;
  const MAIN = panel('main.db', X0, Y - 40, FULL, H + 40); MAIN.dataset.name = 'main.db 的页';
  const tM = c0 - 0.4;
  wipe(MAIN, c0 + 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', c0 + 0.1, { g: 0.3 });
  // d1：编号 1024 以后的用户都注销了（实验的原句），Alice（2050）也在其中
  const del = codeBlock(W, ['DELETE FROM users WHERE id > 1024;'], X0, 250, { fs: 30 }); wipe(del, T('d1', '注销') - 0.2, { dir: 'l', d: 0.4 }); sfx('tick', T('d1', '注销'), { g: 0.4 });
  const aliceD = tx(W, 'Alice（2050）也在其中', X0 + 700, 258, { fs: 30, css: { background: K.wheat, padding: '2px 14px' } }); show(aliceD, T('d1', 'Alice'), { x: -10, y: 0 }); sfx('pop', T('d1', 'Alice'), { g: 0.35 });
  // 文件长条：用着的页（白）与空闲页（斜纹）
  const frame = MAIN;
  const used = h('div', 'abs', W); px(used, X0 + 2, Y, FULL - 4, H - 2); css(used, { background: '#ffffff', borderRight: `2px solid ${K.ink}`, boxSizing: 'border-box' });
  const free = h('div', 'abs', W); px(free, X0 + FULL - 2, Y, 0, H - 2); css(free, { background: 'repeating-linear-gradient(135deg,#f5deb3 0 8px,#ffffff 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲的页，不是渐变
  const lab = tx(W, '', X0, LABY, { fs: 28 });
  const pagesL = tx(W, '', X0 + FULL - 200, Y - 38, { fs: 26, mono: true });
  show(used, tM + 0.8, { y: 0, d: 0.3 });
  show(lab, c0 + 0.7, { y: 6 }); show(pagesL, c0 + 0.7, { y: 6 });
  keyed(pagesL).at(tM + 0.8, { html: `${R.before.page_count} 页` }).at(T('d7b', '283'), { html: `${R.vacuumed.page_count} 页` });
  keyed(lab).at(tM + 0.8, { html: `${R.before.rows} 个用户 · 空闲 0 页` }).at(T('d2', '1024'), { html: `${R.deleted.rows} 个用户 · 空闲 <b>${R.deleted.freelist_count}</b> 页` }).at(T('d6', '一页没长'), { html: `${R.reused.rows} 个用户 · 空闲 <b>${R.reused.freelist_count}</b> 页` }).at(T('d7b', '一页不剩'), { html: `${R.vacuumed.rows} 个用户 · 空闲 0 页` });
  const UW = FULL - 4, FR = X0 + FULL - 2;
  const seg = (fp, t) => { const w = fp * k; tl.fromTo(used, { width: used._w != null ? used._w : UW }, { width: UW - w, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, t); tl.fromTo(free, { left: FR - (free._w || 0), width: free._w || 0 }, { left: FR - w, width: w, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, t); used._w = UW - w; free._w = w; };
  // d3：4096 删到 1024，文件仍是 553 页
  seg(R.deleted.freelist_count, T('d2', '1024') - 0.1); sfx('whoosh', T('d2', '1024'), { g: 0.3 });
  const same = tx(W, '文件大小没变', X0 + FULL - 200, LABY, { fs: 28, color: K.teal }); show(same, T('d2', '553'), { y: 6 });
  const av = codeBlock(W, ['PRAGMA auto_vacuum;　-- 默认 0（NONE）'], X0, AVY, { fs: 28 }); set(av, 0, { autoAlpha: 0 }); wipe(av, T('d3', '默认') - 0.1, { dir: 'l', d: 0.4 }); sfx('tick', T('d3', '默认'), { g: 0.35 });
  gone(av, T('d4') - 0.2, 0.3); gone(aliceD, T('d3') - 0.2, 0.3);
  // d4：空出的 394 页串成一条空闲链，链头记在文件头里
  const chain = []; for (let i = 0; i < 5; i++) { const b = pageCell(W, X0 + 640 + i * 150, CHY, 100, 70, { fill: K.wheat, bw: 2 }); chain.push(b); }
  const more = tx(W, `… 一共 ${R.deleted.freelist_count} 页`, X0 + 640 + 5 * 150, CHY + 20, { fs: 28 });
  const head = btn(W, '文件头：链头', X0, CHY + 16, 26);
  const cl = [line(ov, [[X0 + 240, CHY + 36], [X0 + 636, CHY + 36]])].concat(chain.slice(0, 4).map((b, i) => line(ov, [[X0 + 740 + i * 150, CHY + 36], [X0 + 786 + i * 150, CHY + 36]])));
  set(head, 0, { autoAlpha: 0 }); slam(head, T('d4', '文件头'), { from: 1.2 });
  chain.forEach((b, i) => show(b, T('d4', '空闲链') - 0.2 + i * 0.08, { x: -10, y: 0, d: 0.3 })); cl.forEach((l, i) => arrowIn(l, T('d4', '空闲链') - 0.25 + i * 0.08, 0.2)); show(more, T('d4', '空闲链') + 0.5, { x: -10, y: 0 });
  const gF = gloss(W, '空闲链', '空出的页一页指向下一页，串成一条链；链头记在文件头里', X0 + 640, GFY, 760); show(gF, T('d4', '空闲链'), { y: 8 }); sfx('pop', T('d4', '空闲链'), { g: 0.4 });
  // d5–d6：再有新用户注册，先用空闲页；再插入 1024 行，文件一页没长，空闲页剩下 260
  const ins = codeBlock(W, ['INSERT INTO users …　-- 再插入 1024 行'], X0, 250, { fs: 26 }); set(ins, 0, { autoAlpha: 0 }); gone(del, T('d5') - 0.2, 0.2); show(ins, T('d5') - 0.1, { y: 0, d: 0.3 });
  set(chain[0], T('d5', '空闲页'), { backgroundColor: '#ffffff' }); set(chain[1], T('d5', '空闲页') + 0.15, { backgroundColor: '#ffffff' });
  seg(R.reused.freelist_count, T('d6', '一页没长') - 0.2); sfx('tick', T('d6', '一页没长'), { g: 0.4 });
  // d7–d7b：VACUUM 把整个库重写一遍：文件缩到 283 页，空闲页一页不剩
  const tV = T('d7', 'vacuum') - 0.2;
  [ins, gF, same, head, more, ...chain, ...cl].forEach((e) => gone(e, tV, 0.3));
  const vac = codeBlock(W, ['VACUUM;'], X0, 250, { fs: 26 }); set(vac, 0, { autoAlpha: 0 }); show(vac, tV + 0.1, { y: 0, d: 0.3 });
  const gV = gloss(W, 'VACUUM', '把整个数据库复制到临时文件再覆盖回来，重建出最小的文件', X0, CHY, 760); show(gV, T('d7', 'vacuum'), { y: 8 });
  tl.fromTo(frame, { width: FULL }, { width: R.vacuumed.page_count * k, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(MAIN.nameEl, { width: FULL - 4 }, { width: R.vacuumed.page_count * k - 4, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(used, { width: UW - R.reused.freelist_count * k }, { width: R.vacuumed.page_count * k - 4, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(free, { left: FR - R.reused.freelist_count * k, width: R.reused.freelist_count * k }, { left: X0 + R.vacuumed.page_count * k - 2, width: 0, duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  tl.fromTo(pagesL, { x: 0 }, { x: -(FULL - R.vacuumed.page_count * k), duration: 0.8, ease: 'power3.inOut', immediateRender: false }, T('d7b', '283') - 0.2);
  sfx('whoosh', T('d7b', '283') - 0.2, { g: 0.35 });
  // 「当前在讲谁」：每句讲到的对象换成选中样式（深青底白字），讲到下一个就移过去
  beats([[T('d1'), del], [T('d1', 'Alice'), aliceD], [T('d2'), lab], [T('d2', '553'), pagesL], [T('d3'), same], [T('d3', '默认'), av], [T('d3', '不会变小'), [frame, pagesL]], [T('d4'), head], [T('d4', '空闲链'), gF], [T('d5'), ins], [T('d6'), lab], [T('d7'), vac], [T('d7b'), pagesL], [T('d7b', '一页不剩'), lab], [T('d1') + 5.45, [frame, del], 1], [T('d2') + 4.27, [frame, lab], 1], [T('d6') + 2.22, [frame, ins], 1], [T('d7b') + 4.20, [frame, pagesL, lab], 1], [T('d3') + 1.56, [frame, same], 1], [T('d7b') + 4.0, [vac, gV], 1]], Tend('d7b'));
  [[T('d4') - 0.2, '空出的页：串成一条空闲链'], [T('d5') - 0.2, '新用户注册：先用空闲页'], [T('d7') - 0.2, 'VACUUM：重写整个数据库文件']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 240, 1800, 880], zmax: 1.2 }]]);
});
