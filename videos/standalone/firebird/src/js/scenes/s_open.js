// 开场：火狐 → 那时它叫 Firebird → 名字早有主人，是个数据库 → 你认识的三个都有，它没有 → 故事从浴室说起。
scene('open', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近
  const g = fbSec(pl, true);

  // 浏览器：今天的火狐
  const br = fbBrowser(g, 100, 30, 980, 620);
  fbIn(br.el, 0.2, { y: 60, scale: 0.94 }, { d: 0.45, ease: 'back.out(1.3)' });
  sfx('pop', 0.25, { g: 0.6 });
  const tFire = T('o2', 'Fire') - 0.04, tRew = T('o2', '二') - 0.05;
  br.icons([[`<img src="/img/logo-firefox.svg">`, 0.3], [`<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#6f6f6f" stroke-width="3"/><path d="M3 18 H33 M18 3 C10 12 10 24 18 33 M18 3 C26 12 26 24 18 33" fill="none" stroke="#6f6f6f" stroke-width="2.4"/></svg>`, tRew]]);
  br.titles([['Mozilla Firefox', 0.3], ['Mozilla Firebird', tFire]]);
  const fx = fbAbs(br.body, 340, 80, '<img src="/img/logo-firefox.svg" style="width:300px;height:300px;display:block">');
  fbIn(fx, T('o1', '火') - 0.05, { scale: 0.5 }, { d: 0.4, ease: 'back.out(1.8)' });
  sfx('chime', T('o1', '火'), { g: 0.5, p: -0.3 });
  // 倒回二〇〇三年：那时还没有这个标志，标题栏写的是 Firebird
  to(fx, tRew, { scale: 0.2, autoAlpha: 0, rotationZ: -90, duration: 0.4, ease: 'power3.in' });
  sfx('whoosh', tRew, { g: 0.5, p: -0.3 });
  const mini = fbMini(g, 1110, 40, '二〇〇三年', '4 月');
  fbIn(mini, tRew, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', tRew + 0.05, { p: 0.3 });
  const name = fbAbs(br.body, 0, 120, '<div class="hl-big" style="text-align:center;width:980px">Firebird</div>');
  fbIn(name, tFire, { scale: 1.3, y: -20 }, { d: 0.3, ease: 'power4.out' });
  sfx('thud', tFire + 0.02, { g: 0.8 });
  const zh = fbAbs(br.body, 0, 290, '<div class="zh-sub" style="width:980px">火鸟</div>');
  fbIn(zh, T('o2', '火') - 0.04, { scale: 1.6 }, { d: 0.14, ease: 'power4.out' });
  // 这个名字：字样被框起来
  const box = fbAbs(br.body, 190, 96, '<div style="width:600px;height:200px;border:10px solid #F68A21"></div>');
  fbIn(box, T('o3', '名字') - 0.08, { scale: 1.25 }, { d: 0.12, ease: 'power4.out' });
  sfx('tick', T('o3', '名字'), { g: 0.6 });

  // 只用了十个月：二〇〇三年四月到二〇〇四年二月，十格一格格填满
  const strip = fbAbs(g, 120, 670, ''); css(strip, { width: '920px', height: '90px' });
  const t10 = T('o3', '十') - 0.05;
  for (let i = 0; i < 10; i++) {
    const c = h('div', 'abs', strip);
    css(c, { left: i * 92 + 'px', top: '0', width: '84px', height: '34px', background: '#2156a5' });
    wipe(c, t10 + i * 0.09, { dir: 'l', d: 0.08 });
    if (i % 2 === 0) sfx('tick', t10 + i * 0.09, { g: 0.3, p: -0.3 });
  }
  const l1 = fbAbs(strip, 0, 44, '2003.4', 'lab-s'), l2 = fbAbs(strip, 828, 44, '2004.2', 'lab-s');
  const l3 = fbAbs(strip, 330, 44, '十个月', 'lab-b');
  fbIn(l1, t10, { y: 8 }); fbIn(l2, t10 + 0.85, { y: 8 }); fbIn(l3, t10 + 0.5, { y: 8 });

  // 名字早有主人：页面上的名字被揭下来，贴到一个数据库上
  const db = fbAbs(g, 1180, 210, fbDbFire(250));
  fbDrop(db, T('o4', '主') - 0.12, -180);
  sfx('thud', T('o4', '主') + 0.25, { g: 0.8 });
  const tag = fbAbs(g, 470, 300, fbTag('Firebird'));
  const tLift = T('o3', '有') - 0.05, tLand = T('o4', '数据') - 0.05;
  to(box, tLift, { autoAlpha: 0, duration: 0.12 }); to(zh, tLift, { autoAlpha: 0, duration: 0.12 });
  init(tag, { autoAlpha: 0, z: 40 });
  to(name, tLift, { autoAlpha: 0, duration: 0.12 });
  to(tag, tLift, { autoAlpha: 1, z: 120, rotationZ: -4, duration: 0.18, ease: 'power2.out' });
  to(tag, tLand - 0.55, { x: 700, y: 228, z: 60, rotationZ: 3, duration: 0.62, ease: 'power2.inOut' });
  sfx('whoosh', tLand - 0.55, { g: 0.5, p: 0.4 });
  sfx('pop', tLand + 0.08, { g: 0.7, p: 0.5 });

  // 你认识的三个：Logo 为主
  const tOut = T('o5') - 0.32;
  fbOut(br.el, tOut, { x: -380, duration: 0.4 }); fbOut(mini, tOut, { x: -380, duration: 0.4 }); fbOut(strip, tOut, { x: -380, duration: 0.4 });
  sfx('whoosh', tOut, { g: 0.4, p: -0.5 });
  const peers = [['mysql', 290, 60, 250, 'MySQL'], ['postgresql', 190, 470, 196, 'PostgreSQL'], ['sqlite', 300, 760, 274, 'SQLite']];
  const cards = peers.map(([k, w, x, y, word], i) => {
    const c = fbLogo(g, x, y, k, w);
    fbIn(c, T('o5', word) - 0.08, { y: 70, rotationZ: i % 2 ? 3 : -3, z: 80 }, { ease: 'back.out(1.5)', d: 0.4 });
    sfx('pop', T('o5', word), { g: 0.8, p: -0.6 + i * 0.3 });
    return c;
  });
  // 这些你都熟：各打一个勾
  const tOk = T('o5', '熟') - 0.25;
  cards.forEach((c, i) => {
    to(c, tOk + i * 0.09, { y: -24, duration: 0.14, ease: 'power3.out' });
    const ok = fbAbs(c, c.offsetWidth - 46, -36, '<svg width="84" height="84" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#54BC4B"/><path d="M18 33 L28 43 L47 22" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    fbIn(ok, tOk + i * 0.09, { scale: 0.2 }, { d: 0.14, ease: 'back.out(2)' });
    sfx('tick', tOk + i * 0.09, { g: 0.6, p: -0.5 + i * 0.3 });
  });

  // 这个让火狐改了名的 Firebird：火狐的标志指向它
  const fxs = fbAbs(g, 1020, 40, '<img src="/img/logo-firefox.svg" style="width:110px;height:110px;display:block">');
  fbIn(fxs, T('o6', '火') - 0.06, { scale: 0.3 }, { d: 0.16, ease: 'back.out(1.8)' });
  const arr = fbAbs(g, 1120, 80, '<svg width="190" height="150" viewBox="0 0 190 150"><path d="M6 14 C80 4 140 30 160 108" fill="none" stroke="#6f6f6f" stroke-width="6" stroke-dasharray="14 10"/><path d="M144 98 L161 128 L176 94" fill="none" stroke="#6f6f6f" stroke-width="6" stroke-linejoin="round"/></svg>');
  fbIn(arr, T('o6', '改') - 0.08, { scaleX: 0, transformOrigin: '0 0' }, { d: 0.3 });
  const arrT = fbAbs(g, 1150, 34, '改了名', 'lab-s');
  fbIn(arrT, T('o6', '改'), { y: 8 }, { d: 0.25 });
  // 你大概率没听说过：熟的三个退后，问号落在它旁边
  const tDim = T('o6', '你') - 0.05;
  cards.forEach((c) => to(c, tDim, { opacity: 0.32, duration: 0.3 }));
  const q = fbAbs(g, 1405, 230, '<div style="font:800 230px/1 Open Sans;color:#1c1c1c">?</div>');
  fbIn(q, T('o6', '没') - 0.06, { scale: 1.8, y: -40 }, { ease: 'back.out(1.6)', d: 0.36 });
  sfx('thud', T('o6', '没'), { g: 0.8, p: 0.6 });

  // 故事从浴室说起：手册页底的下一章链接
  const tStory = T('o7', '故') - 0.05;
  [...cards, fxs, arr, arrT, q].forEach((e) => fbOut(e, tStory, { duration: 0.3 }));
  const nextL = fbAbs(g, 300, 600, '<div class="link-n">下一章　<u>1. 一间浴室</u>　→</div>');
  fbIn(nextL, T('o7', '浴') - 0.1, { x: 40 }, { d: 0.35 });
  const shower = fbAbs(g, 400, 230, '<svg width="260" height="220" viewBox="0 0 260 220"><path d="M240 0 V40 Q240 64 212 64 H150" fill="none" stroke="#8e8c86" stroke-width="14" stroke-linecap="round"/><path fill="#a9a6a0" d="M76 64 h112 l22 36 h-156 z"/><g stroke="#2156a5" stroke-width="6" stroke-linecap="round"><path d="M80 120 l-12 48"/><path d="M118 120 l-6 62"/><path d="M154 120 l5 62"/><path d="M190 120 l12 48"/></g></svg>');
  fbDrop(shower, T('o7', '浴') - 0.05, -160);
  sfx('pop', T('o7', '浴') + 0.2, { g: 0.6, p: 0.4 });
});
