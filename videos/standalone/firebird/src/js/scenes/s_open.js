// 开场：火狐改过名 → 这个名字的主人是个数据库 → 你认识的那几个里没有它 → 一间浴室。
scene('open', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 10, -7, 0, 2000, '50% 30%');
  // 前半段窗口在画面中间放大，名字被摘走时退到左边
  const grp = fbAbs(pl, 0, 0, ''); grp.style.transformStyle = 'preserve-3d'; css(grp, { width: '1620px', height: '968px' });
  init(grp, { x: 240, y: 26, scale: 1.1 });
  const br = fbBrowser(grp, 90, 196, 880, 520, T('o1') + 0.05);
  fbIn(br.el, 0.3, { x: -70, y: 36, rotationZ: -2 });
  sfx('pop', 0.3, { g: 0.6 });
  const tName = T('o2', 'Fire') - 0.04;
  br.titles([['Mozilla Firefox', 0.35], ['Mozilla Firebird', tName]]);
  sfx('thud', tName, { g: 0.7 });
  // 那时的名字整个印在页面上
  const big = fbAbs(br.el, 60, 230, 'Firebird', 'big-bird');
  fbIn(big, tName, { scale: 1.35, x: 60 }, { d: 0.24 });
  const mini = fbMini(grp, 800, 110, '二〇〇三年', '4 月');
  fbIn(mini, T('o2', '二') - 0.05, { scale: 1.5, y: -20 });
  sfx('tick', T('o2', '二'), { p: 0.3 });
  // 只用了十个月：十格一格格填满
  const strip = fbAbs(grp, 90, 748, '');
  css(strip, { width: '880px', height: '46px' });
  const t10 = T('o3', '十个月') - 0.1;
  for (let i = 0; i < 10; i++) {
    const c = h('div', 'abs', strip);
    css(c, { left: i * 88 + 4 + 'px', top: '0', width: '80px', height: '30px', background: i < 9 ? '#2156a5' : '#F68A21' });
    wipe(c, t10 + i * 0.1, { dir: 'l', d: 0.09 });
    if (i % 2 === 0) sfx('tick', t10 + i * 0.1, { g: 0.32, p: -0.3 });
  }
  const lab1 = fbAbs(strip, 4, 34, '2003.4', 'lab-s'), lab2 = fbAbs(strip, 780, 34, '2004.2', 'lab-s');
  fbIn(lab1, t10, { y: 8 }); fbIn(lab2, t10 + 0.9, { y: 8 });
  // 名字从标题栏被摘下来，落到数据库上
  const dbW = fbAbs(pl, 1130, 270, fbDb(240, true));
  fbIn(dbW, T('o4', '数据库') - 0.2, { scale: 0.55, y: 70, transformOrigin: '50% 100%' }, { ease: 'back.out(1.4)' });
  const logoOn = h('img', 'abs', dbW); logoOn.src = '/img/firebird-logo.png'; css(logoOn, { left: '52px', top: '106px', width: '136px', height: '136px' });
  const plate = fbCard(pl, 330, 196, 340, 68, '<div class="plate-t">Firebird</div>');
  const tOff = T('o3', '有主') - 0.2;
  fbOut(big, tOff - 0.05);
  to(grp, tOff - 0.3, { x: 0, y: 0, scale: 1, duration: 0.4, ease: 'power3.inOut' });
  init(plate, { autoAlpha: 0, z: 40 });
  to(plate, tOff, { autoAlpha: 1, duration: 0.1 });
  to(plate, tOff + 0.12, { x: 800, y: 40, z: 60, rotationZ: 4, duration: 0.72, ease: 'power2.inOut' });
  sfx('whoosh', tOff + 0.12, { g: 0.5, p: 0.3 });
  sfx('thud', T('o4', '数据库') + 0.08, { g: 0.8 });
  br.titles([['', tOff + 0.1]]);
  fbKicks(pl, [T('o1', '浏览器'), T('o1', '多半'), T('o2', '二'), tName, T('o3', '十个月'), T('o3', '有主'), T('o4', '数据库')]);
  // 你认识的三个，和它
  const tOut = T('o5') - 0.3;
  fbOut(br.el, tOut, { x: -500 }); fbOut(mini, tOut); fbOut(strip, tOut);
  const peers = [['MySQL', 'o5', 'My'], ['PostgreSQL', 'o5', 'Postgre'], ['SQLite', 'o5', 'Lite']];
  const cards = peers.map(([name, c, w], i) => {
    const e = fbCard(pl, 80 + i * 340, 380, 310, 180, `<div class="peer">${name}</div>`);
    fbIn(e, T(c, w) - 0.1, { y: 60, z: 120, rotationZ: i % 2 ? 3 : -3 }, { ease: 'back.out(1.5)' });
    sfx('pop', T(c, w), { g: 0.8, p: -0.4 + i * 0.3 });
    return e;
  });
  const tDim = T('o6', 'Fire') - 0.1;
  cards.forEach((e) => to(e, tDim, { opacity: 0.38, duration: 0.25 }));
  const q = fbAbs(pl, 1420, 160, '?', 'qmark');
  fbIn(q, T('o6', '没听') - 0.05, { scale: 1.8, y: -30 }, { ease: 'back.out(1.5)' });
  sfx('thud', T('o6', '没听'), { g: 0.8, p: 0.4 });
  fbKicks(pl, [T('o5', 'My') + 0.02, T('o5', 'Postgre') + 0.02, T('o5', 'Lite') + 0.02, T('o6', 'Fire'), T('o6', '没听'), T('o7', '故事'), T('o7', '浴室')]);
  // 一间浴室：花洒落下来
  const tBath = T('o7', '浴室') - 0.15;
  fbOut(q, T('o7') - 0.1);
  const shw = fbAbs(pl, 590, 60, `<svg width="320" height="230" viewBox="0 0 320 230"><g fill="none" stroke="#8e8c86" stroke-width="16" stroke-linecap="round"><path d="M300 0 V40 Q300 70 262 70 H160"/></g><path fill="#a9a6a0" d="M92 70 h136 l26 44 h-188 z"/><g stroke="#2156a5" stroke-width="7" stroke-linecap="round"><path d="M96 134 l-14 58"/><path d="M142 134 l-8 74"/><path d="M186 134 l6 74"/><path d="M232 134 l14 58"/></g></svg>`);
  fbIn(shw, tBath, { y: -260 }, { d: 0.4, ease: 'bounce.out' });
  sfx('thud', tBath + 0.28, { g: 0.6, p: 0.5 });
});
