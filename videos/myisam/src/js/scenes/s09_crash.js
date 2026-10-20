// 09 没有日志的代价。崩溃现场、CHECK / REPAIR 的回显均为仿真机 MySQL 5.5.62 上的真实输出
scene('s9', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .ins9w { position:absolute; left:0; right:0; top:150px; display:flex; justify-content:center; }
  .ins9 { position:relative; height:62px; padding:0 28px; border-radius:10px; background:rgba(2,14,19,.9); border:1px solid var(--line); font-family:var(--mono); font-size:26px; line-height:60px; white-space:pre; color:#cfe3e8; }
  .tg { position:absolute; top:340px; width:372px; height:190px; border-radius:16px; border:1px solid var(--line-2); background:linear-gradient(180deg, rgba(11,52,66,.7), rgba(6,34,44,.74)); box-shadow:0 30px 80px rgba(0,0,0,.42); padding:26px 28px; }
  .tg .f { font-family:var(--mono); font-size:22px; color:var(--faint); letter-spacing:.04em; }
  .tg .w { margin-top:12px; font-size:30px; font-weight:500; letter-spacing:.1em; }
  .tg .d { margin-top:10px; font-size:21px; letter-spacing:.06em; color:var(--dim); }
  .tg .mark { position:absolute; right:22px; top:20px; font-size:22px; letter-spacing:.08em; padding:3px 12px; border-radius:6px; }
  .mark.ok { color:var(--mint); background:rgba(111,224,182,.14); }
  .mark.no { color:var(--red); background:rgba(238,106,85,.14); }
  .nolog { position:absolute; left:0; right:0; top:610px; display:flex; align-items:center; justify-content:center; gap:22px; white-space:nowrap; }
  .nolog .bx9 { height:70px; padding:0 30px; border-radius:12px; border:2px dashed var(--faint); color:var(--faint); font-size:26px; letter-spacing:.12em; display:flex; align-items:center; position:relative; }
  .nolog .bx9::after { content:""; position:absolute; left:8%; right:8%; top:50%; height:2px; background:var(--red); transform:rotate(-9deg); }
  .nolog span { font-size:26px; letter-spacing:.1em; color:var(--dim); }
  .cut { position:absolute; top:300px; width:3px; height:270px; background:var(--red); box-shadow:0 0 26px rgba(238,106,85,.9); }
  .cut b { position:absolute; left:50%; top:282px; transform:translateX(-50%); font-size:28px; font-weight:500; letter-spacing:.2em; color:var(--red); white-space:nowrap; }
  .hx9 .hex-row { height:46px; }
  .fl9 { font-family:var(--mono); font-size:24px; padding:18px 28px; }
  .fl9 div { display:flex; align-items:center; height:52px; border-radius:6px; padding:0 10px; white-space:pre; }
  .fl9 .k { width:250px; color:var(--pale); }
  .fl9 .v { width:90px; color:var(--orange-hi); font-size:28px; }
  .fl9 .d { font-family:var(--sans); font-size:21px; letter-spacing:.05em; color:var(--dim); }
  .fl9 .d b { color:var(--red); font-weight:500; }
  .eng9w { position:absolute; left:0; right:0; top:270px; display:flex; justify-content:center; }
  .eng9 { position:relative; }
  .eng9 .term-bd { font-size:28px; line-height:1.6; padding:26px 34px; }
  `;
  root.appendChild(st);
  const ov = overlay(root);

  // ════ A：一次插入要改四处 ════
  const insw = h('div', 'ins9w', root);
  const ins = h('div', 'ins9', insw, `<span class="c-orange">mysql&gt; </span><span class="c-cyan">INSERT INTO</span> users <span class="c-cyan">VALUES</span> (13,'olivia',31);`);
  show(ins, c0 + 0.1, { y: -14, d: 0.6 });
  const tgs = [
    ['users.MYD', '数据文件', '末尾写入 16 字节的新行'],
    ['users.MYI', 'PRIMARY 的 B 树', '插入键 13'],
    ['users.MYI', 'idx_name 的 B 树', "插入键 'olivia'"],
    ['users.MYI', '文件头', '行数 +1，文件长度更新'],
  ].map(([f, w, d], i) => { const e = h('div', 'tg', root, `<div class="f">${f}</div><div class="w">${w}</div><div class="d">${d}</div><div class="mark"></div>`); e.style.left = (96 + i * 452) + 'px'; return e; });
  const arrows = tgs.map((e, i) => { const x = 96 + i * 452 + 186; return path(ov, `M${960 + (i - 1.5) * 40},${214} C${960 + (i - 1.5) * 40},${280} ${x},${270} ${x},${336}`, 'pale', { w: 2 }); });
  const tIn = [T('m3') - 0.1, T('m3', '每一个') - 0.1, T('m3', '每一个') + 0.35, T('m3', '文件头') - 0.1];
  tgs.forEach((e, i) => { show(e, tIn[i], { y: 26, d: 0.55 }); arrowIn(arrows[i], tIn[i] - 0.15, 0.5); });
  fromTo(ins, T('m2', '好几处') - 0.1, { boxShadow: '0 0 0 0px rgba(242,145,17,0)' }, { boxShadow: '0 0 0 3px rgba(242,145,17,.55)', duration: 0.3, yoyo: true, repeat: 1 });
  // m4 没有日志
  const nolog = h('div', 'nolog', root, '<div class="bx9">日志 · 先记后写</div><span>MyISAM 没有这一步，四处改动各写各的</span>');
  show(nolog, T('m4', '不记') - 0.2, { y: 16, d: 0.6 });
  // m5 断电：只完成了第一处
  const tCut = T('m5', '断电') - 0.15;
  sfx('error', tCut); sfx('thud', tCut, { g: 1.2 });
  const cut = h('div', 'cut', root, '<b>断电</b>'); cut.style.left = (96 + 372 + 40) + 'px';
  fromTo(cut, tCut, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 0%' }, { autoAlpha: 1, scaleY: 1, duration: 0.25, ease: 'power4.out' });
  const flashEl = h('div', 'abs', root); css(flashEl, { inset: 0, background: '#fff', pointerEvents: 'none' });
  fromTo(flashEl, tCut, { autoAlpha: 0.5 }, { autoAlpha: 0, duration: 0.6, ease: 'power2.out', immediateRender: false });
  gsap.set(flashEl, { autoAlpha: 0 });
  const marks = tgs.map((e) => e.querySelector('.mark'));
  keyed(marks[0]).at(tCut + 0.2, { html: '已落盘', cls: 'mark ok' });
  [1, 2, 3].forEach((i) => keyed(marks[i]).at(tCut + 0.35 + i * 0.12, { html: '未完成', cls: 'mark no' }));
  tl.to(tgs.slice(1), { opacity: 0.5, borderColor: 'rgba(238,106,85,.55)', duration: 0.5, stagger: 0.12 }, tCut + 0.35);
  tl.to(tgs[0], { borderColor: 'rgba(111,224,182,.7)', duration: 0.4 }, tCut + 0.2);
  tl.to(arrows.slice(1), { opacity: 0.25, duration: 0.4 }, tCut + 0.3);

  // ════ B：模拟现场 ════
  const tB = T('m6') - 0.4;
  hide([ins, ...tgs, nolog, cut, ...arrows], tB, { y: -16, d: 0.4 });
  const lp = h('div', 'panel', root); px(lp, 96, 138, 1010, 248);
  h('div', 'panel-hd', lp, '<span>users_crashed.MYD</span><span class="r">实际 176 字节</span>');
  const lb = h('div', 'hx9', lp); css(lb, { padding: '22px 28px' });
  const tail = REAL.crashMYD.substr(0x90 * 2, 64);
  const hv = hexView(lb, tail, { cw: 40, rowH: 46, fs: 23, base: 0x90, cls: (i) => 'f-' + fieldOf(i) });
  css(hv.el, { position: 'relative' });
  hv.asc.forEach((a) => { a.style.width = '15px'; });
  const tagNew = h('div', 'tag c-mint', lp, '新行已在磁盘上'); css(tagNew, { right: '28px', top: '196px', fontSize: '20px' });
  const rp = h('div', 'panel', root); px(rp, 1136, 138, 688, 248);
  h('div', 'panel-hd', rp, '<span>users_crashed.MYI · 文件头</span><span class="r">还是旧的</span>');
  const fl = h('div', 'fl9', rp);
  const st9 = REAL.stateCrash;
  const fRec = h('div', '', fl, `<span class="k">records</span><span class="v">${st9.records[2]}</span><span class="d">实际有 <b>11</b> 行</span>`);
  const fLen = h('div', '', fl, `<span class="k">data_file_length</span><span class="v">${st9.data_file_length[2]}</span><span class="d">实际 <b>176</b> 字节</span>`);
  const fOc = h('div', '', fl, `<span class="k">open_count</span><span class="v">${st9.open_count[2]}</span><span class="d">没有正常关闭</span>`);
  gsap.set(fOc, { autoAlpha: 0 });
  show(lp, tB + 0.35, { x: -24, y: 0, d: 0.6 });
  show(rp, T('m6', '索引') - 0.4, { x: 24, y: 0, d: 0.6 });
  gsap.set(tagNew, { autoAlpha: 0 });
  tl.to(hv.rows[1], { backgroundColor: 'rgba(111,224,182,.14)', boxShadow: '0 0 0 2px rgba(111,224,182,.8)', borderRadius: 6, duration: 0.4 }, T('m6', '新行') - 0.1);
  tl.to(tagNew, { autoAlpha: 1, duration: 0.4 }, T('m6', '新行') + 0.2);
  tl.fromTo([fRec, fLen], { backgroundColor: 'rgba(238,106,85,0)' }, { backgroundColor: 'rgba(238,106,85,.16)', duration: 0.4, stagger: 0.2, immediateRender: false }, T('m6', '索引') + 0.3);
  // m7 查不出来
  const t7 = T('m7') - 0.3;
  const tm = terminal(root, { x: 96, y: 416, w: 1728, h: 180, title: 'mysql', right: 'myisam_demo', fs: 21, lh: 1.42 });
  css(tm.bd, { padding: '16px 26px' });
  show(tm.el, t7, { y: 24, d: 0.6 });
  const c1 = tm.cmd('<span class="k">SELECT</span> * <span class="k">FROM</span> users_crashed <span class="k">WHERE</span> id = 13;', t7 + 0.3, 46, { appearAt: t7 + 0.2 });
  const o1 = tm.out(['<span class="wn">Empty set (0.00 sec)</span>'], T('m7', '查不') - 0.1);
  // m8 计数器
  tl.to(fOc, { autoAlpha: 1, duration: 0.4 }, T('m8', '计数器') - 0.4);
  tl.fromTo(fOc, { backgroundColor: 'rgba(242,145,17,0)' }, { backgroundColor: 'rgba(242,145,17,.2)', duration: 0.4, immediateRender: false }, T('m8', '计数器') - 0.2);
  const ocv = keyed(fOc.querySelector('.v')), ocd = keyed(fOc.querySelector('.d'));
  ocv.at(c0, { html: '0' }).at(T('m8', '加一') - 0.05, { html: '1' }).at(T('m8', '减一') - 0.05, { html: '0' }).at(Tend('m8') + 0.25, { html: '1' });
  ocd.at(c0, { html: '修改计数' }).at(T('m8', '加一') - 0.05, { html: '开始修改：+1' }).at(T('m8', '减一') - 0.05, { html: '正常关闭：−1' }).at(Tend('m8') + 0.25, { html: '<b>断电时停在 1</b>' });
  [T('m8', '加一') - 0.05, T('m8', '减一') - 0.05, Tend('m8') + 0.25].forEach((t) => tl.fromTo(fOc.querySelector('.v'), { scale: 1.6 }, { scale: 1, duration: 0.45, immediateRender: false, transformOrigin: '0% 50%' }, t));

  // ════ C：CHECK / REPAIR（真实回显）════
  const t9 = T('m9') - 0.2;
  tl.to([c1.el, ...o1], { autoAlpha: 0, duration: 0.2 }, t9 - 0.3);
  tl.set([c1.el, ...o1], { display: 'none' }, t9 - 0.08);
  tl.to(tm.el, { top: 300, height: 600, duration: 0.6, ease: 'power3.inOut' }, t9 - 0.1);
  tl.to([lp, rp], { y: -6, height: 144, duration: 0.6, ease: 'power3.inOut' }, t9 - 0.1);
  tl.to([lb, fRec, fLen, tagNew], { autoAlpha: 0, duration: 0.3 }, t9 - 0.15);
  tl.to(fOc, { y: -104, duration: 0.6, ease: 'power3.inOut' }, t9 - 0.1);
  const mini = h('div', 'tag c-mint mono', lp, 'ff 0d 00 00 00 6f 6c 69 76 69 61 20 20 20 20 1f<small style="font-family:var(--sans)">olivia 这一行在磁盘上</small>'); css(mini, { left: '28px', top: '78px', fontSize: '22px' });
  fromTo(mini, t9 + 0.3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  const colorize = (ln) => esc(ln)
    .replace(/\| (warning|error|status)( +)\|/, (m, k, sp) => `| <span class="${{ warning: 'wn', error: 'er', status: 'ok' }[k]}">${k}</span>${sp}|`)
    .replace(/Corrupt/, '<span class="er">Corrupt</span>').replace(/\| OK( +)\|$/, '| <span class="ok">OK</span>$1|')
    .replace(/(1 client is using or hasn&#39;t closed the table properly|1 client is using or hasn't closed the table properly|Number of rows changed from 10 to 11)/, '<span class="c-text">$1</span>');
  const chk = asciiTable(['Table', 'Op', 'Msg_type', 'Msg_text'], [
    ['myisam_demo.users_crashed', 'check', 'warning', "1 client is using or hasn't closed the table properly"],
    ['myisam_demo.users_crashed', 'check', 'warning', 'Size of datafile is: 176       Should be: 160'],
    ['myisam_demo.users_crashed', 'check', 'error', 'Record-count is not ok; is 11   Should be: 10'],
    ['myisam_demo.users_crashed', 'check', 'warning', 'Found 11 key parts. Should be: 10'],
    ['myisam_demo.users_crashed', 'check', 'error', 'Corrupt'],
  ]);
  const c2 = tm.cmd('<span class="k">CHECK TABLE</span> users_crashed;', t9 + 0.4, 40, { appearAt: t9 + 0.35 });
  const o2 = tm.out(chk.map(colorize), T('m9', '说明') - 0.3, { stagger: 0.07 });
  tl.fromTo(o2[3], { backgroundColor: 'rgba(242,145,17,0)' }, { backgroundColor: 'rgba(242,145,17,.16)', duration: 0.4, immediateRender: false }, T('m9', '说明') + 0.5);
  tl.fromTo(o2[7], { backgroundColor: 'rgba(238,106,85,0)' }, { backgroundColor: 'rgba(238,106,85,.2)', duration: 0.4, immediateRender: false }, T('m9', '需要检查') - 0.1);
  const rep = asciiTable(['Table', 'Op', 'Msg_type', 'Msg_text'], [
    ['myisam_demo.users_crashed', 'repair', 'warning', 'Number of rows changed from 10 to 11'],
    ['myisam_demo.users_crashed', 'repair', 'status', 'OK'],
  ]);
  const t10 = T('m10') - 0.2;
  const c3 = tm.cmd('<span class="k">REPAIR TABLE</span> users_crashed;', t10, 40, { appearAt: t10 - 0.05 });
  const o3 = tm.out(rep.map(colorize), T('m10', '重新扫描') - 0.2, { stagger: 0.08 });
  sfx('error', T('m9', '需要检查') - 0.1, { g: 0.6 }); sfx('chime', T('m10', '重建') + 0.1, { g: 0.8 });
  tl.fromTo(o3[3], { backgroundColor: 'rgba(111,224,182,0)' }, { backgroundColor: 'rgba(111,224,182,.16)', duration: 0.4, immediateRender: false }, T('m10', '重建') - 0.1);
  // 修复之后文件头恢复一致
  keyed(fOc.querySelector('.v')).at(T('m10', '重建') + 0.4, { html: '0' });
  keyed(fOc.querySelector('.d')).at(T('m10', '重建') + 0.4, { html: '修复后归零 · records = 11' });

  // ════ D：没有事务 ════
  const t11 = T('m11') - 0.4;
  hide([tm.el, lp, rp], t11, { y: -16, d: 0.4 });
  const etw = h('div', 'eng9w', root);
  const et = h('div', 'panel term eng9', etw);
  h('div', 'panel-hd', et, '<span>mysql</span><span class="r">SHOW ENGINES · 节选</span>');
  const eb = h('div', 'term-bd', et);
  const en = asciiTable(['Engine', 'Support', 'Transactions', 'XA', 'Savepoints'], [['MyISAM', 'DEFAULT', 'NO', 'NO', 'NO'], ['InnoDB', 'YES', 'YES', 'YES', 'YES']]);
  const el = en.map((ln, i) => h('div', 'o', eb, esc(ln).replace(/MyISAM/, '<span class="c-orange">MyISAM</span>').replace(/\| (NO)( +)/g, i === 3 ? '| <span class="er no9">NO</span>$2' : '| NO$2').replace(/\| (YES)( +)/g, i === 4 ? '| <span class="ok">YES</span>$2' : '| YES$2')));
  show(et, t11 + 0.35, { y: 24, d: 0.6 });
  css(el[4], { opacity: 0.45 });
  const nos = [...et.querySelectorAll('.no9')];
  [T('m11', '没有事务') , T('m11', '不能回滚') , T('m11', '崩溃')].forEach((t, i) => { if (nos[i]) tl.fromTo(nos[i], { backgroundColor: 'rgba(238,106,85,0)', boxShadow: '0 0 0 0px rgba(238,106,85,0)' }, { backgroundColor: 'rgba(238,106,85,.25)', boxShadow: '0 0 0 6px rgba(238,106,85,.25)', duration: 0.35, immediateRender: false }, t - 0.05); });
  const fin = h('div', 'verdict', root, '没有事务 · 不能回滚 · 崩溃后不保证完整'); css(fin, { position: 'absolute', left: 0, right: 0, top: '690px', textAlign: 'center', fontSize: '34px', letterSpacing: '.14em', color: 'var(--dim)' });
  show(fin, T('m11', '崩溃') + 0.3, { y: 14, d: 0.6 });
});
