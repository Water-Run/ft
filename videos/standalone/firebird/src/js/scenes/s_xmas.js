// 第 2 章：随收购归了 Borland → 圣诞前裁员、第六版停了 → 用户想买下来 → 宣布开源、打算拆出去、谈崩 → 同一天两份新闻稿。
scene('xmas', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 一九九一年：InterBase 跟着 Ashton-Tate 一起被 Borland 收进来；Borland 留在页首，下面讲它这边的事 ──
  const A = fbSec(pl, true);
  const y91 = fbMini(A, 1380, 16, '一九九一年', '秋');
  fbIn(y91, T('b1', '一九') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('b1', '一九'), { p: 0.5 });
  const ash = fbCard(A, 80, 90, 520, 380, `<img src="/img/logo-ashton.svg" style="position:absolute;left:40px;top:34px;width:440px;height:61px"><div class="line" style="position:absolute;left:40px;right:40px;top:120px"></div><div class="abs" style="left:190px;top:136px">${fbDbPlain(140)}</div><div class="nm" style="position:absolute;left:0;right:0;top:318px">InterBase</div>`);
  fbIn(ash, T('b1', 'InterBase') - 0.2, { x: -120, rotationZ: -3 }, { ease: 'back.out(1.3)', d: 0.4 });
  sfx('pop', T('b1', 'InterBase'), { p: -0.5 });
  const ashCap = fbCap(A, 84, 494, 'Ashton-Tate', '做 dBASE 数据库的软件公司，InterBase 当时归它', 560);
  fbCapIn(ashCap, T('b1', '随') - 0.1);
  const bor = fbCard(A, 820, 70, 560, 560, `<img src="/img/logo-borland.svg" style="position:absolute;left:110px;top:40px;width:340px;height:97px"><div class="abs" style="left:50px;top:180px;width:460px;height:340px;border:4px dashed #d8d6cf"></div>`);
  fbIn(bor, T('b1', '收购') - 0.35, { x: 160, rotationZ: 3, z: 60 }, { ease: 'back.out(1.3)', d: 0.4 });
  sfx('pop', T('b1', '收购') - 0.2, { p: 0.5 });
  // 收购：Ashton-Tate 整个装进 Borland
  const tBuy = T('b1', '归') - 0.3;
  to(ash, tBuy, { x: 760, y: 140, scale: 0.86, z: 40, duration: 0.5, ease: 'power3.inOut' });
  fbOut(ashCap, tBuy);
  sfx('thud', tBuy + 0.45, { g: 0.9, p: 0.4 });
  const borCap = fbCap(A, 824, 650, 'Borland', '美国软件公司，做 Turbo Pascal、Delphi 等编程工具', 600);
  fbCapIn(borCap, T('b1', 'Borland') - 0.05);
  // 收到页首：后面裁员、停版都发生在 Borland
  const tHead = T('b2') - 0.35;
  // 绝对值：Borland 以左上角为轴缩到 0.42 落在 (60, 10)；Ashton-Tate 的中心跟着落到槽位缩小后的位置
  init(bor, { transformOrigin: '0% 0%' });
  to(bor, tHead, { x: -760, y: -60, scale: 0.42, duration: 0.55, ease: 'power3.inOut' });
  to(ash, tHead, { x: -162.4, y: -123, scale: 0.361, duration: 0.55, ease: 'power3.inOut' });
  to(borCap, tHead, { x: 390 - 824, y: 60 - 650, duration: 0.55, ease: 'power3.inOut' });
  fbOut(y91, tHead);
  to(ash.querySelector('.nm'), tHead, { autoAlpha: 0, duration: 0.2 });

  // ── B 一九九九年圣诞前：赚得不够，至少裁一半，第六版停了 ──
  const y99 = fbMini(A, 1380, 16, '一九九九年', '12 月');
  fbIn(y99, T('b2', '一九') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  const holly = fbAbs(A, 1405, 150, ART.holly);
  fbIn(holly, T('b2', '圣诞') - 0.05, { scale: 0.3, rotationZ: -30 }, { d: 0.3, ease: 'back.out(2)' });
  sfx('chime', T('b2', '圣诞'), { g: 0.5, p: 0.5 });
  const boss = fbAbs(A, 1260, 250, artHuman({ ...PEOPLE.boss, w: 120 }));
  fbIn(boss, T('b2', '管理') - 0.15, { x: 120 }, { d: 0.35 });
  const chart = fbCard(A, 940, 250, 280, 220, `<svg width="280" height="220" viewBox="0 0 280 220"><g fill="#8ea6c0"><rect x="40" y="60" width="38" height="130"/><rect x="96" y="90" width="38" height="100"/><rect x="152" y="120" width="38" height="70"/><rect x="208" y="150" width="38" height="40"/></g><path d="M40 50 L230 140" stroke="#bf0000" stroke-width="7"/><path d="M206 146 L236 144 L222 118" fill="none" stroke="#bf0000" stroke-width="7" stroke-linejoin="round"/><path d="M28 190 H262" stroke="#6f6f6f" stroke-width="3"/></svg>`);
  fbIn(chart, T('b2', '这条线') - 0.1, { y: 40, z: 60 }, { d: 0.35, ease: 'back.out(1.4)' });
  const say = fbAbs(A, 1200, 150, '赚得不够', 'bubble');
  fbIn(say, T('b2', '赚') - 0.1, { scale: 0.5, transformOrigin: '20% 100%' }, { d: 0.3, ease: 'back.out(1.8)' });
  sfx('pop', T('b2', '赚'), { g: 0.6, p: 0.6 });
  // 39 个人（FACTS H12），裁掉一半：隔一个走掉一个
  const staff = fbAbs(A, 70, 290, ''); const ppl = [];
  for (let i = 0; i < 39; i++) {
    const col = i % 13, row = (i / 13) | 0;
    const p = fbAbs(staff, col * 60, row * 92, artHuman({ ...CROWD[(i * 5) % CROWD.length], skin: ['#efc39e', '#d9a27a', '#a86f4c', '#f3d2b5'][i % 4], w: 46 }));
    fbIn(p, T('b2', '管理') + 0.2 + (col + row) * 0.025, { y: 16 }, { d: 0.2 });
    ppl.push(p);
  }
  const cut = T('b3', '一半') - 0.1;
  ppl.forEach((p, i) => { if (i % 2 === 0) to(p, cut + (i % 13) * 0.015, { x: -60, y: 30, autoAlpha: 0, duration: 0.42, ease: 'power2.in' }); });
  sfx('whoosh', cut, { g: 0.5, p: -0.5 });
  const v6 = fbCard(A, 70, 600, 860, 120, `<div class="nm" style="position:absolute;left:34px;top:36px">第六版</div><div class="abs" style="left:200px;top:46px;width:560px;height:30px;background:#ece9e3"><div data-f="1" style="width:100%;height:100%;background:#2156a5;transform-origin:0 50%"></div></div>`);
  fbIn(v6, T('b3', '第六版') - 0.25, { y: 70 }, { d: 0.35, ease: 'back.out(1.4)' });
  const fill = v6.querySelector('[data-f]');
  init(fill, { scaleX: 0 });
  to(fill, T('b3', '第六版'), { scaleX: 0.62, duration: 0.5, ease: 'power2.out' });
  to(fill, T('b3', '停') - 0.05, { backgroundColor: '#b5b2ab', duration: 0.2 });
  const stop = fbAbs(A, 700, 576, ART.stop);
  init(stop, { scale: 0.8 });
  fbIn(stop, T('b3', '停') - 0.08, { scale: 2, rotationZ: 20 }, { d: 0.2, end: { scale: 0.8, rotationZ: 0 }, ease: 'power4.out' });
  sfx('error', T('b3', '停'), { g: 0.8, p: 0.3 });

  // ── C 用户急了，要把它买下来：肯出的钱够买好几回 ──
  const C = fbSec(pl);
  fbScroll(A, C, T('b4') - 0.4);
  const crowd = fbAbs(C, 60, 330, artCrowd(7, 92, -16, 1));
  fbIn(crowd, T('b4', '用户') - 0.15, { x: -200 }, { d: 0.45 });
  sfx('pop', T('b4', '急'), { p: -0.5 });
  const banner = fbCard(C, 110, 170, 480, 100, '<div class="nm" style="line-height:100px;font-size:46px;color:#2156a5">买下 InterBase</div>', { borderTop: '8px solid #2156a5' });
  fbIn(banner, T('b4', '买') - 0.2, { y: 60, rotationZ: -3 }, { d: 0.35, ease: 'back.out(1.6)' });
  sfx('pop', T('b4', '买'), { g: 0.7, p: -0.4 });
  // 价格线与硬币堆：越过一回、两回，还在往上摞
  const BASE = 720, U = 200;
  const lines = [1, 2].map((n) => {
    const l = fbAbs(C, 760, BASE - n * U, `<div style="width:620px;border-top:4px dashed ${n === 1 ? '#2156a5' : '#8ea6c0'}"></div><div class="${n === 1 ? 'lab-b' : 'lab-s'}" style="position:absolute;left:300px;top:-48px">${n === 1 ? 'InterBase 的价格' : '两倍'}</div>`);
    return l;
  });
  const tA = T('b4', '买') + 0.1, tB = T('b5', '好几回') + 0.2, NC = 26;
  for (let i = 0; i < NC; i++) {
    const coin = fbAbs(C, 960 + ((i * 7) % 5) * 3, BASE - 52 - i * 21, ART.coin);
    const t = tA + (tB - tA) * i / NC;
    fbIn(coin, t, { y: -120 }, { d: 0.16, ease: 'power2.in' });
    if (i % 2 === 0) sfx('tick', t + 0.14, { g: 0.45, p: 0.2 });
    if (i === 9) fbIn(lines[0], t, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.3 });
    if (i === 19) fbIn(lines[1], t, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.3 });
  }
  const many = fbAbs(C, 1120, BASE - 2 * U - 150, fbTag('好几回'));
  fbIn(many, T('b5', '好几回') - 0.05, { scale: 1.5 }, { d: 0.25, ease: 'back.out(1.8)' });
  sfx('thud', T('b5', '好几回'), { g: 0.8, p: 0.4 });

  // ── D 二〇〇〇年一月宣布开源，还打算把这块业务剪出去；谈了半年，谈崩了，又接回去 ──
  const D = fbSec(pl);
  fbScroll(C, D, T('b6') - 0.4);
  const y00 = fbMini(D, 1380, 16, '二〇〇〇年', '1 月');
  fbIn(y00, T('b6', '二') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('b6', '二'), { p: 0.5 });
  const pr = fbCard(D, 120, 30, 860, 400, `<img src="/img/logo-borland.svg" style="position:absolute;left:46px;top:36px;width:190px;height:54px"><div class="by" style="position:absolute;left:262px;top:46px">Inprise / Borland</div><div class="line" style="position:absolute;left:46px;right:46px;top:116px"></div><div class="big gl" style="position:absolute;left:46px;top:150px;font-size:150px;color:#1c1c1c">开源</div>`);
  fbIn(pr, T('b6') - 0.1, { y: 80, rotationZ: 3, z: 60 }, { ease: 'back.out(1.3)', d: 0.4 });
  const gl = pr.querySelector('.gl');
  init(gl, { autoAlpha: 0, scale: 1.5, transformOrigin: '0% 50%' });
  to(gl, T('b6', '开源') - 0.05, { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'power4.out' });
  sfx('thud', T('b6', '开源'), { g: 0.8 });
  const inCap = fbCap(D, 1010, 200, 'Inprise', '就是 Borland：1998 年起用的名字，2000 年底改回', 520);
  fbCapIn(inCap, T('b6', '公司') - 0.05);
  // 下面这块：InterBase 业务，一条虚线连着
  const piece = fbCard(D, 120, 430, 860, 150, '<div class="nm" style="line-height:150px;font-size:48px">InterBase 业务</div>', { borderTop: '4px dashed #8e8c86', background: '#fbfaf6' });
  fbIn(piece, T('b6') + 0.05, { y: 80, rotationZ: 3, z: 60 }, { ease: 'back.out(1.3)', d: 0.4 });
  const sc = fbAbs(D, 0, 0, ART.scissors);
  const c0 = T('b6b', '把') - 0.1, c1 = T('b6b', '拆') + 0.05;
  init(sc, { autoAlpha: 0, x: 1000, y: 360, scale: 0.8 });
  to(sc, c0 - 0.2, { autoAlpha: 1, duration: 0.2 });
  to(sc, c0, { x: 20, duration: c1 - c0, ease: 'none' });
  to(sc, c1 + 0.05, { autoAlpha: 0, duration: 0.2 });
  const blades = sc.querySelectorAll('path');
  F((t) => { const k = t > c0 && t < c1 ? Math.abs(Math.sin((t - c0) * 18)) : 0; blades[0].setAttribute('transform', `rotate(${(-k * 8).toFixed(2)} 118 75)`); blades[1].setAttribute('transform', `rotate(${(k * 8).toFixed(2)} 118 75)`); });
  sfx('tick', c0 + 0.1, { g: 0.5 }); sfx('tick', c0 + 0.4, { g: 0.5 }); sfx('tick', c0 + 0.7, { g: 0.5 });
  const tOff = T('b6b', '出去') - 0.1;
  to(piece, tOff, { x: 380, y: 90, rotationZ: 4, duration: 0.45, ease: 'power3.inOut' });
  const newco = fbAbs(D, 560, 690, fbTag('新公司', 'blue'));
  fbIn(newco, tOff + 0.3, { y: 20 }, { d: 0.25 });
  sfx('whoosh', tOff, { g: 0.5, p: 0.4 });
  // 谈了半年：月份翻到七月
  const months = ['2 月', '3 月', '4 月', '5 月', '6 月', '7 月'], mEl = y00.querySelector('.m');
  const mt0 = T('b7', '谈') - 0.05, mt1 = T('b7', '这笔') - 0.1;
  months.forEach((m, i) => { keyed(mEl).at(mt0 + (mt1 - mt0) * (i + 1) / months.length, { html: m }); sfx('tick', mt0 + (mt1 - mt0) * (i + 1) / months.length, { g: 0.35, p: 0.5 }); });
  // 谈崩了：剪出去的那块又被推回原处
  const tBreak = T('b7', '谈崩') - 0.1;
  to(piece, tBreak, { x: 0, y: 0, rotationZ: 0, duration: 0.4, ease: 'back.in(1.2)' });
  fbOut(newco, tBreak);
  sfx('thud', tBreak + 0.4, { g: 1 });
  const crack = fbAbs(D, 400, 400, '<svg width="300" height="70" viewBox="0 0 300 70"><path d="M0 34 L40 18 L70 46 L110 14 L150 50 L190 16 L230 46 L262 20 L300 36" fill="none" stroke="#bf0000" stroke-width="9" stroke-linejoin="round"/></svg>');
  fbIn(crack, tBreak + 0.38, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.18 });
  const noSplit = fbAbs(D, 1010, 470, '<span class="lab-o" style="font-size:44px">拆分谈崩</span>');
  fbIn(noSplit, tBreak + 0.4, { x: -30 }, { d: 0.25 });
  sfx('error', tBreak + 0.42, { g: 0.6 });

  // ── E 七月二十五号，同一天两份新闻稿：不卖了；开源了 ──
  const E = fbSec(pl);
  fbScroll(D, E, T('b8') - 0.4);
  const t0 = T('b8'), t1 = T('b9', '不卖'), t2 = T('b10', '放出来'), tIn = T('b8', '两份');
  const date = h('div', 'date abs', E, '2000.07.25'); css(date, { left: '90px', top: '10px', fontSize: '140px' });
  init(date, { autoAlpha: 0, y: 26 });
  to(date, t0 - 0.05, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  sfx('thud', t0, { g: 0.8 });
  const mk = (x, y, w, hh, head, gloss, rz, tt, delay, flame) => {
    const e = h('div', 'sheet', E, `${flame ? '<div class="band-f"></div>' : ''}<div class="by">PRESS RELEASE · JULY 25, 2000</div><div class="line" style="margin:14px 0 22px"></div><div class="head">${head}</div><div class="big gl" style="font-size:100px;margin-top:20px">${gloss}</div>`);
    css(e, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', padding: '34px 44px', boxSizing: 'border-box' });
    init(e, { autoAlpha: 0, x: 1500 - x, y: 80, rotationZ: rz + 8 });
    to(e, tIn - 0.06 + delay, { autoAlpha: 1, x: 0, y: 0, rotationZ: rz, duration: 0.42, ease: 'power3.out' });
    const g = e.querySelector('.gl');
    init(g, { autoAlpha: 0, scale: 1.5, transformOrigin: '0% 50%' });
    to(g, tt - 0.04, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power4.out' });
  };
  mk(70, 200, 700, 520, 'Inprise/Borland Terminates Negotiations to Sell InterBase® Product Line', '不卖了', -3, t1, 0, false);
  mk(820, 196, 720, 520, 'Inprise/Borland Introduces InterBase 6.0 Now Free and Open Source on Linux®, Windows, and Solaris®', '开源了', 2.5, t2, 0.13, true);
  sfx('pop', tIn, { g: 0.7, p: 0.4 }); sfx('pop', tIn + 0.13, { g: 0.6, p: 0.5 });
  sfx('thud', t1, { p: -0.3 }); sfx('thud', t2, { p: 0.3 });
});
