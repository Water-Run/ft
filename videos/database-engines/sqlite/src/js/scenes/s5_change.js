// 05 怎么改（第 12 稿）：Alice 改年龄——事务、回滚日志、先写稳日志、删日志即提交（J05、I03、S13）。删除那段拆到第 08 章（s8_drop.js）。
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
  mRows[0].style.background = K.wheat;   // Alice 所在的叶页 130：麦色（全片麦色只给主角——SQLite 库、Alice 的行与她走过的页）
  // j1–j2：42 改成 43；要改的不止一页
  const chg = tx(W, '42 → 43', 760, 300, { fs: 30, color: K.teal }); show(chg, T('j1', '43'), { x: -10, y: 0 });
  sfx('tick', T('j2', '叶页'), { g: 0.4 }); sfx('tick', T('j2', '年龄索引'), { g: 0.35, p: 0.2 });
  // 为什么年龄索引要改好几页：索引按年龄排好，Alice 那一项从「42」那一段搬到「43」那一段（WaterRun 看 r7d：「观众可能不理解为什么年龄索引有好几页」）
  const ixA = tx(W, '42 · 行号 2050', 780, 380, { fs: 26, mono: true, css: { border: `1.5px solid ${K.ink}`, background: K.wheat, padding: '2px 12px' } }), ixB = tx(W, '43 · 行号 2050', 1110, 380, { fs: 26, mono: true, css: { border: `1.5px solid ${K.ink}`, background: K.wheat, padding: '2px 12px' } });
  const ixAr = line(ov, [[1000, 400], [1100, 400]], { w: 2.5, color: 'teal' });
  const ixL = tx(W, '年龄索引按年龄排好：这一项要搬到别处', 780, 436, { fs: 24, color: K.teal });
  [ixA, ixB, ixL].forEach((e) => set(e, 0, { autoAlpha: 0 }));
  show(ixA, T('j2', '年龄索引') - 0.1, { y: 6 }); arrowIn(ixAr, T('j2', '年龄索引') + 0.4, 0.4); show(ixB, T('j2', '年龄索引') + 0.6, { x: -10, y: 0 }); show(ixL, T('j2', '年龄索引') + 0.8, { y: 6 });
  [ixA, ixB, ixL, ixAr].forEach((e) => gone(e, T('j4') - 0.3, 0.4));
  // j3：只写进去一部分就断电：新旧混杂
  const tCut = T('j3', '断电');
  keyed(mRows[0].val).at(T('j3', '一部分') , { html: 'Alice · <b>43</b>' }).at(T('j4b', '从没发生过'), { html: 'Alice · 42' });
  // 写到一半断电：写入光标沿着要改的页往下走，刚改完第一页就断电——光标变红停住，main.db 暗一下再亮回来，没写到的几页描红
  const wcur = h('div', 'abs', MAIN); px(wcur, 4, 56, 10, 56); css(wcur, { background: K.teal }); set(wcur, 0, { autoAlpha: 0 });
  show(wcur, T('j3', '一部分') - 0.5, { y: 0, d: 0.2 });
  tl.fromTo(wcur, { y: 0 }, { y: 68, duration: 0.4, ease: 'power1.inOut', immediateRender: false }, T('j3', '一部分') + 0.1);
  set(wcur, tCut, { backgroundColor: K.red });
  tl.fromTo(MAIN, { opacity: 1 }, { opacity: 0.4, duration: 0.15, immediateRender: false }, tCut); tl.fromTo(MAIN, { opacity: 0.4 }, { opacity: 1, duration: 0.5, immediateRender: false }, tCut + 0.45);
  sfx('error', tCut, { g: 0.5 });
  mRows.slice(1).forEach((r, i) => { set(r, T('j3', '混杂') + i * 0.08, { borderColor: K.red }); set(r, T('j4b', '从没发生过') + i * 0.05, { borderColor: K.ink }); });
  gone(wcur, T('j4b', '从没发生过'), 0.3);
  // j4–j4b：事务
  const gTx = gloss(W, '事务', '一次修改要么全部生效，要么像从没发生过', 760, 470, 420); show(gTx, T('j4', '事务'), { x: 12, y: 0 }); sfx('pop', T('j4', '事务'), { g: 0.4 });
  // j6–j5：改主文件之前，先把要改的页原样抄进旁边一个文件：回滚日志
  const JR = panel('main.db-journal', 1200, 250, 600, 420);
  JR.nameEl.innerHTML = ''; keyed(JR.nameEl).at(T('j5', '回滚日志') - 0.1, { html: 'main.db-journal' });
  const tCp = T('j6', '抄进') - 0.2;
  [chg, gTx].forEach((e) => gone(e, tCp - 0.2, 0.3));
  wipe(JR, tCp, { dir: 'l', d: 0.45 }); sfx('whoosh', tCp, { g: 0.3 });
  const jRows = PAGES.map((pg, i) => rowEl(JR, pg, i, pg === 130 ? 'Alice · 42' : '年龄索引 · 42 岁'));
  jRows[0].style.background = K.wheat;   // 抄进日志的第 130 页仍是 Alice 那一页
  jRows.forEach((r, i) => { set(r, 0, { autoAlpha: 0 }); tl.fromTo(r, { autoAlpha: 1, x: -1080 }, { x: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, tCp + 0.3 + i * 0.12); });
  const gJ = gloss(W, '回滚日志', '改之前的原页，原样抄一份', 760, 690, 560); show(gJ, T('j5', '回滚日志'), { y: 8 }); sfx('pop', T('j5', '回滚日志'), { g: 0.4 });
  jRows.forEach((r) => { r.dataset.beat = 'line'; });   // 选中只描外框：页号同时在变色，不能让 .bt 的白字盖过去（set 会记下白字）
  // j8：日志先写稳到磁盘，再动主文件
  const sync = btn(JR, '已写到磁盘上', 380, 370, 24); set(sync, 0, { autoAlpha: 0 }); slam(sync, T('j8', '磁盘'), { from: 1.2 }); sfx('thud', T('j8', '磁盘'), { g: 0.4 });
  // j9：主文件写好，删掉日志：删掉的那一刻，就是提交
  mRows.forEach((r, i) => keyed(r.val).at(T('j9', '写好') - 0.05 + i * 0.125, { html: i === 0 ? 'Alice · <b>43</b>' : '年龄索引 · <b>43</b> 岁' }));
  sfx('tick', T('j9', '写好'), { g: 0.4 });
  const tDel = T('j9', '删掉');
  wipeOut(JR, tDel, { dir: 'r', d: 0.4 }); sfx('whoosh', tDel, { g: 0.35 });
  const gC = gloss(W, '提交', '修改从这一刻起算数', 1200, 450, 560); show(gC, T('j9', '提交'), { x: 12, y: 0 }); sfx('chime', T('j9', '提交'), { g: 0.45 });
  gone(gJ, tDel, 0.3);

  // 先写什么、再写什么：两个文件下面一排四步，念到哪一步出哪一步，焦点框跟着往右走（WaterRun 看 r7b：「回滚日志那边 缺乏视觉引导 比如写什么再写什么」）
  const SY = 790, SX = [120, 560, 1000, 1440], STXT = ['① 原页抄进日志', '② 日志写到磁盘', '③ 改主文件', '④ 删掉日志：提交'];
  const stps = STXT.map((t, i) => rrBox(W, t, SX[i], SY, { w: 330, fs: 28 }));
  const sArr = [0, 1, 2].map((i) => line(ov, [[SX[i] + 334, SY + 26], [SX[i + 1] - 4, SY + 26]], { w: 2 }));
  const tSt = [T('j6', '抄进') - 0.1, T('j8', '磁盘') - 0.1, T('j9', '写好') - 0.3, T('j9', '删掉') - 0.1];
  stps.forEach((e, i) => { set(e, 0, { autoAlpha: 0 }); show(e, tSt[i], { x: -12, y: 0, d: 0.4 }); if (i) arrowIn(sArr[i - 1], tSt[i] - 0.25, 0.3); sfx('tick', tSt[i] + 0.1, { g: 0.3, p: 0.1 * i }); });
  // ③ 改主文件：一支写入光标沿着要改的页往下走，走到哪页哪页变 43
  const wc2 = h('div', 'abs', MAIN); px(wc2, 4, 56, 10, 56); css(wc2, { background: K.teal }); set(wc2, 0, { autoAlpha: 0 });
  show(wc2, T('j9', '写好') - 0.35, { y: 0, d: 0.2 }); tl.fromTo(wc2, { y: 0 }, { y: 4 * 68, duration: 0.5, ease: 'none', immediateRender: false }, T('j9', '写好') - 0.1); gone(wc2, T('j9', '删掉') - 0.1, 0.3);
  focus(W, [[T('j2', '叶页'), mRows[0]], [T('j2', '年龄索引'), mRows.slice(1), Tend('j2') + 0.3], [tSt[0] + 0.2, stps[0]], [tSt[1] + 0.2, stps[1]], [tSt[2] + 0.2, stps[2]], [tSt[3] + 0.2, stps[3], Tend('j9') + 0.6]], Tend('j9') + 0.6);   // 焦点框：「她所在的叶页」「年龄索引里的几页」
  [[T('j4') - 0.2, '事务：要么全部生效，要么像从没发生过'], [T('j6') - 0.2, '回滚日志：先把原页抄在旁边'], [T('j9') - 0.2, '删掉日志的那一刻：提交']].forEach(([t, x]) => keyed(title).at(t, { html: x }));
  shots(cam, world, s, [[s.start, null, { rect: [110, 244, 1200, 700], zmax: 1.3 }], [T('j6', '抄进') - 0.5, null, { rect: [110, 244, 1810, 896], pad: 0, d: 1.2 }]]);
  }
});
