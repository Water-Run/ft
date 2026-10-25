// 第 05 章：改：undo 与回滚。主画面是 Alice 那一行摊开的字节条（叶页 27，偏移 6184；T7、X1），下面是磁盘上的 undo 与 Alice 的泳道。
// UPDATE：旧值 42 先进 undo → 年龄字节原地 2a → 2b → 事务号 1558 → 2061 → 回滚指针换成指向那条 undo 记录（X1）。
// ROLLBACK：顺着回滚指针取回 42 写回去（X2）。回滚后行头的事务号恢复成什么没有实测，那两格回滚时只淡出、不写数字。最后对照 MyISAM 撤不回（V3）。
scene('s5', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, -1);             // 镜头只极慢横移（parts.js）
  // 退场：和 exit() 一样，但不带 overwrite（overwrite 会在倒着 seek 时吃掉同一元素先前的显隐补间）
  const s5_out = (e, t, o = {}) => tl.to(e, { autoAlpha: 0, x: o.x || 0, y: o.y != null ? o.y : -14, duration: o.d || 0.35, ease: 'power2.in' }, t);
  const st = h('style', '', W);
  st.textContent = `
    .s5-chip { position: absolute; padding: 4px 14px; font: 700 30px "Inter"; color: var(--mainD); background: var(--pale); border: 2px solid var(--main); }
    .s5-rec { position: absolute; padding: 10px 16px; background: var(--pale); border: 2px solid var(--main); font: 600 26px "Mono", "Sans SC"; color: var(--ink); white-space: pre; }
    .s5-pg { position: absolute; border: 1.5px solid var(--mainD); background: var(--panel); }
    .s5-pg i { position: absolute; left: 10px; right: 10px; height: 2px; background: #C9DADC; }
    .s5-pg b { position: absolute; left: 6px; right: 6px; height: 10px; background: var(--main); }
    .fld .v { font-variant-numeric: tabular-nums; }
    .s5-strip .fld { padding: 10px 12px 8px; }
    .s5-strip .fld .k { font-size: 24px; }
    .s5-strip .fld .hx { font-size: 26px; margin-top: 6px; }
    .s5-strip .fld .v { font-size: 34px; margin-top: 4px; }
    .s5-bit { position: absolute; font: 500 23px "Mono", "Sans SC"; color: var(--ink2); white-space: pre; line-height: 1.45; }
    .s5-bit b { color: var(--main); }
    .s5-rec.s5-hit { outline: 2px solid var(--main); outline-offset: -4px; }
  `;
  const A = D.alice;
  const hx = (h0, a, b) => hexSp(h0.slice(a * 2, b * 2));
  const before = A.before.hex, after = A.after.hex;            // id 4 | 事务号 6 | 回滚指针 7 | 名字 50 | 年龄 1（T7）
  const F_ = [
    { k: '记录头 <span class="c-ink2">5</span>', hx: hexSp(A.header), v: '' },
    { k: 'id <span class="c-ink2">4</span>', hx: hx(before, 0, 4), v: '2050' },
    { k: '事务号 <span class="c-ink2">6</span>', hx: hx(before, 4, 10), v: String(A.before.trx_id), cls: '' },
    { k: '回滚指针 <span class="c-ink2">7</span>', hx: hx(before, 10, 17), v: '→ 旧版本', cls: '' },
    { k: '名字 <span class="c-ink2">50</span>', hx: hx(before, 17, 23) + ' … 20', v: 'Alice + 45 个空格' },
    { k: '年龄 <span class="c-ink2">1</span>', hx: hx(before, 67, 68), v: String(A.before.age), w: 110 },
  ];
  const strip = byteStrip(W, 140, 222, F_); strip.classList.add('s5-strip');
  const [fH, fId, fTrx, fRp, fName, fAge] = strip.f;
  const ctx = h('div', 'abs mono t-small', W, `users.ibd · 页 ${A.page} · 偏移 ${A.offset}`); px(ctx, 140, 172);
  const legend = h('div', 'abs t-small', W, '字段名后的数字：字节数'); px(legend, 1500, 172);
  const sql = sqlLine(W, 140, 108, 'UPDATE users SET age = 43 WHERE id = 2050;', { size: 30 }); css(sql, { left: '760px' });

  // 页 27 的缩略：这一行在页里的位置（偏移 6184 / 16384）
  const pg = h('div', 's5-pg', W); px(pg, 140, 450, 230, 320); pg.dataset.name = '页27';
  for (let i = 0; i < 21; i++) { const l = h('i', '', pg); css(l, { top: (12 + i * 14.4) + 'px' }); }
  const mark = h('b', '', pg); css(mark, { top: (320 * A.offset / 16384 - 5).toFixed(0) + 'px' });
  const pgLab = h('div', 'abs t-small', W, `页 ${A.page}`); px(pgLab, 140, 416);
  const offLab = h('div', 'abs mono', W, String(A.offset)); px(offLab, 386, 450 + 320 * A.offset / 16384 - 16); css(offLab, { fontSize: '26px', color: 'var(--main)' });

  // 磁盘上的 undo
  const undo = boxEl(W, 560, 450, 600, 230, 'undo');
  const rec = h('div', 's5-rec', undo, `年龄 <b style="color:var(--main)">42</b>   事务 ${A.before.trx_id}`); px(rec, 40, 92);

  // MyISAM 对照（e12）
  const my = boxEl(W, 1320, 450, 460, 230, 'users.MYD');
  const myRow = h('div', 'abs mono', my, `2050  Alice  <span style="display:inline-block;background:var(--acc);color:#fff;padding:0 6px">2b</span>`); px(myRow, 36, 84); css(myRow, { fontSize: '28px' });
  const myV = h('div', 'abs', my, '<span style="font:800 44px Inter;color:var(--acc)">43</span><span class="mono c-acc" style="font-size:36px;margin-left:22px">↶ ' + MARK.no(32) + '</span>'); px(myV, 36, 140);

  // 泳道：Alice，UPDATE 与 ROLLBACK
  const tU = T('e6', 'UPDATE'), tRb = T('e10', 'ROLLBACK'), tEnd = Tend('e11');
  const LN = lanes(W, { x: 140, y: 850, w: 1640, gap: 170, rowH: 100, names: ['Alice'], pts: [[tU - 0.3, 360], [tU, 520], [tRb, 1180], [tEnd, 1720]] });
  LN.bar(828, tU - 0.3, tU, '42');
  LN.bar(828, tU, tRb, '<span>43</span>', 'unc');
  const b42 = LN.bar(828, tRb, tEnd, '42');
  const pU = LN.event(0, tU, 'UPDATE', 'ink', -60), pR = LN.event(0, tRb, 'ROLLBACK', '', -60);
  LN.playhead(tU - 0.3, tEnd, 776, 880);

  const ov = overlay(W);
  // ── 时刻 ──
  const t1 = c0 + 0.1;
  typeText(sql, sql.innerHTML, T('e1'), 40, { cursor: false });
  wipe(pg, t1, { dir: 'b', d: 0.6 }); appear(pgLab, t1 + 0.2);
  slam(mark, T('e1', '43') - 0.2, { from: 1.6 }); appear(offLab, T('e1', '43'));
  // 字节条：e2 摊开
  appear(ctx, T('e2') - 0.1);
  strip.f.forEach((e, i) => wipe(e, T('e2') + 0.1 + i * 0.12, { dir: 't', d: 0.4 }));
  appear(legend, T('e2') + 0.9);
  // e3：编号、名字、年龄，然后是两个看不见的字段
  [fId, fName, fAge].forEach((e, i) => lit(e, 'hot', T('e3', ['编号', '名字', '年龄'][i]), T('e3', '看不见')));
  [fTrx, fRp].forEach((e) => lit(e, 'hidden', T('e3', '看不见')));
  lit(fTrx, 'hot', T('e4', '事务号'), T('e5'));
  lit(fRp, 'hot', T('e5', '回滚指针'), T('e6'));
  LN.enter(tU - 1.0);

  // undo 先出场再用（R13 第 29 条）：讲到回滚指针「指向改之前的样子」时，磁盘上的 undo 区先空着出来、带注解；e6 再看到旧值写进去
  const tUndo = T('e5', '改之前') - 0.1;
  wipe(undo, tUndo, { dir: 'l', d: 0.5 }); sfx('whoosh', tUndo, { g: 0.35 });
  const empty = h('div', 'abs t-small', undo, '还空着'); px(empty, 40, 104); vanish(empty, 0); appear(empty, tUndo + 0.3); vanish(empty, T('e6', '42'));
  const gUndo = gloss(W, 1190, 460, 'undo', '<b>undo</b>：改一行之前，先把旧值记在这里；回滚、别人读旧版本，都靠它。默认放在两个 undo 表空间文件 undo_001、undo_002 里', { w: 600, src: 'MySQL 9.7 手册（M56、M60）；实验目录里可见（F4）' });
  vanish(gUndo, 0); show(gUndo, tUndo + 0.4, { y: 8, d: 0.4 }); to(gUndo, T('e10'), { autoAlpha: 0, duration: 0.3 });
  // e6：旧值 42 先进 undo（从年龄格飞过去）
  const ageBox = box(fAge, W), recBox = { x: 560 + 40, y: 450 + 92 };
  const chip = h('div', 's5-chip', W, '42'); px(chip, ageBox.x + 12, ageBox.y + 74);
  const tFly = T('e6', '42');
  vanish(chip, 0); appear(chip, tFly - 0.1);
  fromTo(chip, tFly, { x: 0, y: 0 }, { x: recBox.x + 76 - (ageBox.x + 12), y: recBox.y + 6 - (ageBox.y + 74), duration: 1.0, ease: 'power2.inOut' });
  vanish(chip, tFly + 1.05); appear(rec, tFly + 1.0); sfx('blip', tFly + 1.0, { g: 0.6 });
  const keep = h('div', 'abs mono c-main', undo, '↶'); px(keep, 470, 88); css(keep, { fontSize: '40px' });
  vanish(keep, 0); slam(keep, T('e6z', '撤销'), { from: 1.6 });
  // e7：43 原地写进年龄字节（偏移不变）
  const fHx = (f) => f.querySelector('.hx'), fV = (f) => f.querySelector('.v');
  const tW = T('e7', '43');
  swaps(fHx(fAge), [[tW, hx(after, 67, 68)], [T('e10z', '42'), hx(before, 67, 68)]]);
  swaps(fV(fAge), [[tW, String(A.after.age)], [T('e10z', '42'), String(A.before.age)]]);
  lit(fAge, 'unc', tW, T('e10z', '42'));
  lit(fAge, 'hot', T('e10z', '42'), T('e12'));
  to(mark, T('e7', '原来的位置'), { scaleX: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' });
  sfx('tick', tW, { g: 0.6 });
  // e8：事务号换成这一笔；e9：回滚指针指向那条 undo 记录
  const tTx = T('e8', '换成');
  swaps(fHx(fTrx), [[tTx, hx(after, 4, 10)]]); swaps(fV(fTrx), [[tTx, A.trxOpen]]);
  tl.fromTo(fTrx, { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, tTx);
  lit(fTrx, 'unc', tTx, tRb); sfx('tick', tTx, { g: 0.6 });
  const tRp = T('e9', '指向');
  swaps(fHx(fRp), [[tRp, hx(after, 10, 17)]]); swaps(fV(fRp), [[tRp, '→ undo']]);
  lit(fRp, 'unc', tRp, tRb); sfx('tick', tRp, { g: 0.6 });
  const rpBox = box(fRp, W), lx = rpBox.x + 20;
  const link = path(ov, `M${lx},${rpBox.b + 6} L${lx},${recBox.y - 4}`, 'main', { w: 3 });
  arrowIn(link, tRp + 0.1, 0.9);
  lit(rec, 's5-hit', tRp + 1.0, T('e10z', '42') + 0.3);
  // 顺着指针：一个点沿回滚指针走到 undo 记录
  const dot = svg('circle', { r: 9, fill: '#00758F', cx: lx, cy: rpBox.b + 6 }, ov);
  const tD0 = Math.min(T('e10z', '顺着'), tRb + 0.6), tD1 = T('e10z', '找到'), L0 = link.getTotalLength();
  let lastD = null;
  F((t) => { const on = t >= tD0 && t < tD1 + 0.3; const k = on ? Math.round(clamp((t - tD0) / (tD1 - tD0)) * 100) : -1; if (k === lastD) return; lastD = k;
    dot.style.display = on ? '' : 'none'; if (on) { const pt = link.getPointAtLength(L0 * k / 100); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); } });
  // e10：ROLLBACK 顺着指针取回 42
  to(link, tRb + 0.2, { strokeWidth: 5, duration: 0.3 });
  const back = h('div', 's5-chip', W, '42'); px(back, recBox.x + 76, recBox.y + 6);
  const tBack = T('e10z', '找到');
  vanish(back, 0); appear(back, tBack);
  fromTo(back, tBack + 0.05, { x: 0, y: 0 }, { x: ageBox.x + 12 - (recBox.x + 76), y: ageBox.y + 74 - (recBox.y + 6), duration: 1.0, ease: 'power2.inOut' });
  vanish(back, T('e10z', '42') + 0.02); sfx('pop', T('e10z', '42'));
  // 回滚后这两格的新内容没有实测，只淡出
  [fTrx, fRp].forEach((f) => { to(f, T('e10z', '42'), { opacity: 0.45, duration: 0.3 }); to([fHx(f), fV(f)], T('e10z', '42'), { opacity: 0, duration: 0.3 }); });   // 两格变淡、内容淡出
  svgOut(link, T('e10z', '42') + 0.2, 0.4);
  lit(b42, 'hl', T('e11'));
  tl.fromTo(fAge, { scale: 1 }, { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, T('e11', '撤得回'));
  // 回滚指针的最高位：改之前是 1（插入时写的），改之后是 0（这次更新写的）（T7、X1）。注在格子底下、指针线的右边
  const rp0 = A.before.roll_ptr.slice(0, 2), rp1 = A.after.roll_ptr.slice(0, 2);
  const bits = (hh) => parseInt(hh, 16).toString(2).padStart(8, '0');
  const bit = h('div', 's5-bit', W); px(bit, lx + 30, rpBox.b + 12);
  bit.dataset.gloss = '回滚指针';                                  // 注解：第一次出现时先说它是什么，到 e9 再看它的位
  swaps(bit, [[0, '<b>回滚指针</b>：7 字节<br>指向改之前的样子'], [T('e9', 'undo'), `<b>回滚指针</b> ${rp1} = <b>0</b>${bits(rp1).slice(1)}<br>最高位 0：更新，指向那条 undo 记录`]]);
  show(bit, T('e5', '回滚指针') + 0.4, { y: 10, d: 0.4 });
  to(bit, T('e10z', '42'), { autoAlpha: 0, duration: 0.3 });
  // 事务号：1558 是建表时插入这一行的那一笔；2061 在事务进行时 innodb_trx 里查到的也是它（T7、X1）
  const trxBox = box(fTrx, W);
  const tnote = h('div', 's5-bit', W); px(tnote, trxBox.x + 4, trxBox.b + 12);
  tnote.dataset.gloss = '事务号';
  swaps(tnote, [[0, '<b>事务号</b>：6 字节<br>最后改这一行的事务'], [Tend('e8') - 0.4, `<b>事务号</b>：innodb_trx 里<br>也是 ${A.trxOpen}`]]);
  show(tnote, T('e4', '最后') , { y: 10, d: 0.4 });
  to(tnote, T('e10z', '42'), { autoAlpha: 0, duration: 0.3 });
  // e11：开头那两张表，并排看；e12：MyISAM 没有 undo，43 留在文件里
  wipe(my, T('e11') + 0.4, { dir: 'l', d: 0.5 }); sfx('whoosh', T('e11') + 0.4, { g: 0.4 });
  [undo, pg, pgLab, offLab].forEach((e) => to(e, T('e12', 'undo'), { opacity: 0.35, duration: 0.4 }));
  const myByte = myRow.querySelector('span');
  to(myByte, T('e12', '改过的字节'), { scale: 1.3, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' });
  vanish(myV, 0); slam(myV, T('e12', '留在'), { from: 1.3 }); sfx('error', T('e12', '留在'), { g: 0.4 });
  // 章末收场：画面依次退下，下一章的章节卡接上
  const outE = s.end - 1.1;
  [strip, ctx, legend, sql, undo, pg, pgLab, offLab, my].forEach((e, i) => s5_out(e, outE + (i % 5) * 0.06, { y: -14, d: 0.35 }));
  W.appendChild(ov);
});
