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
  const free = h('div', 'abs', W); px(free, X0 + 2, Y, FULL - 4, H - 2); css(free, { background: 'repeating-linear-gradient(135deg,#dddddd 0 8px,#ffffff 8px 16px)' });   // lint-ok: 斜纹由两种平涂色交替组成（repeating-linear-gradient 硬边），表示空闲的页，不是渐变
  const lab = tx(W, '', X0, LABY, { fs: 28 });
  const pagesL = tx(W, '', X0 + FULL - 200, Y - 38, { fs: 26, mono: true });
  show(used, tM + 0.8, { y: 0, d: 0.3 });
  set(free, 0, { autoAlpha: 0 }); set(free, tM + 1.15, { autoAlpha: 1 });
  show(lab, c0 + 0.7, { y: 6 }); show(pagesL, c0 + 0.7, { y: 6 });
  keyed(pagesL).at(tM + 0.8, { html: `${R.before.page_count} 页` }).at(T('d7b', '283'), { html: `${R.vacuumed.page_count} 页` });
  keyed(lab).at(tM + 0.8, { html: `${R.before.rows} 个用户 · 空闲 0 页` }).at(T('d2', '1024'), { html: `${R.deleted.rows} 个用户 · 空闲 <b>${R.deleted.freelist_count}</b> 页` }).at(T('d6', '一页没长'), { html: `${R.reused.rows} 个用户 · 空闲 <b>${R.reused.freelist_count}</b> 页` }).at(T('d7b', '一页不剩'), { html: `${R.vacuumed.rows} 个用户 · 空闲 0 页` });
  const UW = FULL - 4, FR = X0 + FULL - 2;
  // 斜纹铺满整条、不动，白色的「用着的页」盖在上面、只改宽度（原来斜纹块的左边界在动，斜纹跟着爬，看着像闪）
  W.appendChild(used); used.style.zIndex = '1';
  const seg = (fp, t) => { const w = fp * k; tl.fromTo(used, { width: used._w != null ? used._w : UW }, { width: UW - w, duration: 0.6, ease: 'power2.inOut', immediateRender: false }, t); used._w = UW - w; };
  // d3：4096 删到 1024，文件仍是 553 页
  // 注销的那一刻文件里就空出一片（斜纹）；d2 再报数
  seg(R.deleted.freelist_count, T('d1', '注销') + 0.5); sfx('whoosh', T('d1', '注销') + 0.5, { g: 0.3 });
  const same = tx(W, '文件大小没变', X0 + FULL - 200, LABY, { fs: 28, color: K.teal }); show(same, T('d2', '553'), { y: 6 });
  gone(aliceD, T('d4') - 0.2, 0.3);
  // d4：空出的 394 页串成一条空闲链，链头记在文件头里
  const chain = []; for (let i = 0; i < 5; i++) { const b = pageCell(W, X0 + 640 + i * 150, CHY, 100, 70, { fill: '#ffffff', bw: 2 }); b.style.borderStyle = 'dashed'; chain.push(b); }   // 空闲页：白底虚线框（空的）
  const more = tx(W, `… 一共 ${R.deleted.freelist_count} 页`, X0 + 640 + 5 * 150, CHY + 20, { fs: 28 });
  const head = btn(W, '文件头：链头', X0, CHY + 16, 26);
  const cl = [line(ov, [[X0 + 240, CHY + 36], [X0 + 636, CHY + 36]])].concat(chain.slice(0, 4).map((b, i) => line(ov, [[X0 + 740 + i * 150, CHY + 36], [X0 + 786 + i * 150, CHY + 36]])));
  set(head, 0, { autoAlpha: 0 }); slam(head, T('d4', '文件头'), { from: 1.2 });
  chain.forEach((b, i) => show(b, T('d4', '空闲链') - 0.2 + i * 0.08, { x: -10, y: 0, d: 0.3 })); cl.forEach((l, i) => arrowIn(l, T('d4', '空闲链') - 0.25 + i * 0.08, 0.2)); show(more, T('d4', '空闲链') + 0.5, { x: -10, y: 0 });
  const gF = gloss(W, '空闲链', '空出的页串成一条链', X0 + 640, GFY, 760); show(gF, T('d4', '空闲链'), { y: 8 }); sfx('pop', T('d4', '空闲链'), { g: 0.4 });
  // d5–d6：再有新用户注册，先用空闲页；再插入 1024 行，文件一页没长，空闲页剩下 260
  const ins = codeBlock(W, ['INSERT INTO users …　-- 再插入 1024 行'], X0, 250, { fs: 26 }); set(ins, 0, { autoAlpha: 0 }); gone(del, T('d5') - 0.2, 0.2); show(ins, T('d5') - 0.1, { y: 0, d: 0.3 });
  set(chain[0], T('d5', '空闲页'), { backgroundColor: OWN.u }); set(chain[1], T('d5', '空闲页') + 0.15, { backgroundColor: OWN.u });   // 新用户住进去：变成 users 表的浅绿
  seg(R.reused.freelist_count, T('d6', '一页没长') - 0.2); sfx('tick', T('d6', '一页没长'), { g: 0.4 });
  // d6b–d7b（第 16 稿；WaterRun 看 r7d：「VACUUM很突兀, 用户根本不知道什么时候会来 动画也奇怪」）
  // 先交代什么时候会来：自动清理默认关着（J06），要变小得自己执行 VACUUM；
  // 再演它怎么做（J06：复制到临时文件，再覆盖原文件）：读头从左扫到右，用着的页抄进下面的临时文件，空闲页不抄；临时文件升上去盖住原文件，文件缩到 283 页。
  const tC = T('d6b') - 0.25;
  [gF, same, head, more, ...chain, ...cl].forEach((e) => gone(e, tC, 0.45));
  const AY = CHY - 40;
  const sw = h('div', 'abs', W); px(sw, X0, AY, 96, 48); css(sw, { borderRadius: '24px', background: '#d6d6d6', border: `2px solid ${K.ink}`, boxSizing: 'border-box' });
  const knob = h('div', 'abs', sw); px(knob, 4, 4, 36, 36); css(knob, { borderRadius: '50%', background: '#ffffff', border: `2px solid ${K.ink}`, boxSizing: 'border-box' });
  const swL = tx(W, '自动清理', X0 + 116, AY + 4, { fs: 30 });
  const swOff = tx(W, '默认关', X0 + 256, AY + 4, { fs: 30, color: K.teal });
  [sw, swL].forEach((e) => show(e, T('d6b', '自动清理') + 0.05, { y: 8 })); slam(swOff, T('d6b', '关着'), { from: 1.2 }); sfx('tick', T('d6b', '关着'), { g: 0.35 });
  const fw = R.reused.freelist_count * k, hz = h('div', 'abs', W); px(hz, FR - fw, Y, fw, H - 2); hz.dataset.name = '空闲的页';
  const shr = line(ov, [[FR - 10, LABY + 24], [FR - fw + 10, LABY + 24]], { color: 'teal' }); arrowIn(shr, T('d6b', '变小') - 0.1, 0.5);
  gone(ins, T('d6b', 'vacuum') - 0.35, 0.3);
  const vac = codeBlock(W, ['VACUUM;'], X0, 250, { fs: 26 }); set(vac, 0, { autoAlpha: 0 }); wipe(vac, T('d6b', 'vacuum') - 0.15, { dir: 'l', d: 0.35 }); sfx('tick', T('d6b', 'vacuum'), { g: 0.4 });
  const gV = gloss(W, 'VACUUM', '重建数据库文件的命令', X0 + 260, 262, 700); show(gV, T('d6b', 'vacuum') + 0.1, { y: 8 });
  [sw, swL, swOff, shr].forEach((e) => gone(e, T('d7') - 0.3, 0.45));
  // d7：读头扫过整个文件；用着的页一页页抄进临时文件（临时文件随写随长），扫到空闲页时临时文件不再长
  const VW = R.vacuumed.page_count * k, TY = AY + 10, tR = T('d7', '整个') - 0.1, dR = 2.1, uFr = (UW - fw) / UW, dU = dR * uFr;
  const TMP = panel('临时文件', X0, TY, 170, H + 40); TMP.dataset.name = '临时文件'; TMP.style.zIndex = '3'; set(TMP, 0, { autoAlpha: 0 }); show(TMP, T('d7') - 0.1, { y: 10 });
  const tf = h('div', 'abs', W); px(tf, X0 + 2, TY + 40, 0, H - 2); css(tf, { background: '#ffffff', borderRight: `2px solid ${K.ink}`, boxSizing: 'border-box', zIndex: '4' }); set(tf, 0, { autoAlpha: 0 }); set(tf, tR, { autoAlpha: 1 });
  const fillW = (t) => Math.round(Math.max(0, Math.min(1, (t - tR) / dU)) * (VW - 4));
  F((t) => { const f = fillW(t), w = Math.max(170, f + 4); const a = w + 'px', b = (w - 4) + 'px', c = f + 'px'; if (TMP.style.width !== a) TMP.style.width = a; if (TMP.nameEl.style.width !== b) TMP.nameEl.style.width = b; if (tf.style.width !== c) tf.style.width = c; });
  const rh = h('div', 'abs', W); px(rh, X0, Y - 12, 4, H + 22); css(rh, { background: K.teal, zIndex: '3' }); set(rh, 0, { autoAlpha: 0 });
  show(rh, tR - 0.2, { y: 0, d: 0.2 }); tl.fromTo(rh, { left: X0 }, { left: FR, duration: dR, ease: 'none', immediateRender: false }, tR); gone(rh, tR + dR, 0.45); sfx('whoosh', tR, { g: 0.3 });
  // 抄下去的页：四张小页从读头落进临时文件的末尾
  for (let i = 0; i < 4; i++) {
    const ti = tR + dU * (i + 0.5) / 4, x0 = X0 + (UW - fw) * (i + 0.5) / 4, x1 = X0 + 2 + fillW(ti + 0.4);
    const pc = pageCell(W, x0 - 14, Y + H - 34, 28, 28, { fill: '#ffffff', bw: 2 }); pc.style.zIndex = '5'; set(pc, 0, { autoAlpha: 0 });
    tl.fromTo(pc, { autoAlpha: 1, x: 0, y: 0 }, { x: x1 - x0 - 14, y: TY + 40 + 40 - (Y + H - 34), duration: 0.4, ease: 'power1.in', immediateRender: false }, ti);
    tl.set(pc, { autoAlpha: 0 }, ti + 0.4);
  }
  const skip = tx(W, '空闲页不抄', X0 + VW + 40, TY + 76, { fs: 28, color: K.teal }); show(skip, tR + dU + 0.1, { x: -10, y: 0 });
  // d7b：原文件里的内容退掉，临时文件升上去盖住它，文件框跟着缩到 283 页；落定后「临时文件」的名字淡去，露出 main.db
  const tUp = T('d7b', '文件') - 0.15, dUp = 0.8, tLand = tUp + dUp;
  gone(skip, tUp - 0.3, 0.3);
  gone(used, tUp, 0.45); gone(free, tUp, 0.45);
  tl.set(used, { width: VW - 4, autoAlpha: 1 }, tLand - 0.02);
  tl.fromTo([TMP, tf], { y: 0 }, { y: Y - 40 - TY, duration: dUp, ease: 'power2.inOut', immediateRender: false }, tUp);
  tl.fromTo(frame, { width: FULL }, { width: VW, duration: dUp, ease: 'power2.inOut', immediateRender: false }, tUp);
  tl.fromTo(MAIN.nameEl, { width: FULL - 4 }, { width: VW - 4, duration: dUp, ease: 'power2.inOut', immediateRender: false }, tUp);
  tl.fromTo(pagesL, { x: 0 }, { x: -(FULL - VW), duration: dUp, ease: 'power2.inOut', immediateRender: false }, tUp);
  gone(TMP, tLand, 0.45); gone(tf, tLand, 0.45);
  sfx('whoosh', tUp, { g: 0.35 }); sfx('thud', tLand, { g: 0.3 });
  // 「当前在讲谁」：页数、链头、空闲的页、整个文件
  focus(W, [[T('d2', '553'), pagesL, Tend('d2')], [T('d4', '链头'), head, Tend('d4')], [T('d6', '一页没长'), pagesL, Tend('d6')], [T('d6b', '变小'), hz, T('d6b', 'vacuum') - 0.3], [T('d7b', '283'), pagesL, T('d7b', '空闲') - 0.1], [T('d7b', '空闲'), MAIN, Tend('d7b')]], Tend('d7b'));
  [[T('d4') - 0.2, '空出的页：串成一条空闲链'], [T('d5') - 0.2, '新用户注册：先用空闲页'], [T('d6b') - 0.2, 'VACUUM：把文件重写一遍']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 240, 1800, 880], zmax: 1.2 }], [T('d7b', '空闲') - 0.1, null, { rect: [110, 240, 1000, 780], zmax: 1.3, d: 1.5 }]]);
});
