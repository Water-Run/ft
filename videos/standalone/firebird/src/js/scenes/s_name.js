// 第 5 章：回到开头那件事 → Mozilla 的浏览器撞了商标，选中 Firebird → 赞助方哭穷打不起官司，发动大家写信 → 改名 Firefox → Mozilla 的说法。
scene('name', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近
  const g = fbSec(pl, true);

  // 开头那个窗口回来了：那时它叫 Phoenix
  const br = fbBrowser(g, 80, 40, 900, 560);
  fbIn(br.el, T('e1') - 0.15, { x: -200, rotationZ: -3 }, { d: 0.4, ease: 'back.out(1.3)' });
  sfx('pop', T('e1'), { g: 0.6, p: -0.5 });
  const globe = `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#6f6f6f" stroke-width="3"/><path d="M3 18 H33 M18 3 C10 12 10 24 18 33 M18 3 C26 12 26 24 18 33" fill="none" stroke="#6f6f6f" stroke-width="2.4"/></svg>`;
  const tBird = T('e3', 'Firebird') - 0.05, tFox = T('e6', 'Firefox') - 0.05;
  br.icons([[globe, T('e1') - 0.1], [`<img src="/img/logo-firefox.svg">`, tFox]]);
  br.titles([['Mozilla Phoenix', T('e1') - 0.1], ['Mozilla Firebird', tBird], ['Mozilla Firefox', tFox]]);
  const y03 = fbMini(g, 1380, 16, '二〇〇三年', '4 月');
  fbIn(y03, T('e2', '二') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('e2', '二'), { p: 0.5 });
  const yEl = y03.querySelector('.b'), mEl = y03.querySelector('.m');
  keyed(yEl).at(T('e6', '二') + 0.05, { html: '二〇〇四年' }); keyed(mEl).at(T('e6', '二') + 0.05, { html: '2 月' });
  to(y03, T('e6', '二') - 0.1, { rotationX: 360, duration: 0.32, ease: 'power2.inOut' });
  sfx('tick', T('e6', '二'), { p: 0.5 });
  // Mozilla
  const moz = fbLogo(g, 1030, 30, 'mozilla', 190, { pad: 26 });
  fbIn(moz, T('e2', 'Mozilla') - 0.12, { y: -60, rotationZ: 3 }, { ease: 'back.out(1.5)', d: 0.38 });
  sfx('pop', T('e2', 'Mozilla'), { p: 0.4 });
  const mozCap = fbCap(g, 1034, 300, 'Mozilla', '网景（Netscape）的人 1998 年发起的开源社区，做浏览器', 540);
  fbCapIn(mozCap, T('e2', '浏览器') - 0.1);
  // 撞了商标，要换名字
  const phx = fbAbs(br.body, 0, 110, '<div class="hl-big" style="text-align:center;width:900px;color:#8e8c86">Phoenix</div>');
  fbIn(phx, T('e1') + 0.1, { y: 20 }, { d: 0.3 });
  fbOut(phx, tBird - 0.15);
  const strike = fbAbs(phx, 170, 70, '<div style="width:560px;height:12px;background:#bf0000"></div>');
  fbIn(strike, T('e2', '商标') - 0.05, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.2 });
  const stamp = fbStamp(br.body, 470, 250, '商标冲突', T('e2', '商标'), { rz: -8, small: true });
  fbOut(stamp, tBird - 0.15);
  const name = fbAbs(br.body, 0, 110, '<div class="hl-big" style="text-align:center;width:900px">Firebird</div>');
  fbIn(name, tBird, { scale: 1.3, y: -20 }, { d: 0.3, ease: 'power4.out' });
  sfx('thud', tBird + 0.02, { g: 0.8 });
  fbOut(mozCap, T('e4') - 0.2);
  // 赞助 Firebird 的公司：哭穷，打不起官司
  const db = fbAbs(g, 1300, 360, fbDbFire(200));
  fbDrop(db, T('e4', 'Firebird') - 0.15, -140);
  sfx('thud', T('e4', 'Firebird') + 0.2, { g: 0.7, p: 0.5 });
  const ibp = fbAbs(g, 1240, 618, fbTag('IBPhoenix', 'blue'));
  fbIn(ibp, T('e4', '公司') - 0.1, { y: 20 }, { d: 0.3, ease: 'back.out(1.6)' });
  const ibpL = fbAbs(g, 1240, 700, '赞助 Firebird 的公司', 'lab');
  fbIn(ibpL, T('e4', '公司'), { y: 10 }, { d: 0.25 });
  const wallet = fbAbs(g, 1010, 400, ART.wallet.replace('width="190" height="150"', 'width="260" height="205"'));
  fbIn(wallet, T('e4', '哭穷') - 0.12, { y: -60 }, { d: 0.42, ease: 'bounce.out' });
  sfx('thud', T('e4', '哭穷') + 0.2, { g: 0.6, p: 0.4 });
  const moth = fbAbs(g, 1090, 410, ART.moth);
  const mo0 = T('e4', '打不起') - 0.1;
  init(moth, { autoAlpha: 0 });
  F((t) => { const k = clamp((t - mo0) / 1.2); moth.style.opacity = t > mo0 && k < 1 ? (1 - k * 0.6).toFixed(2) : 0; moth.style.transform = `translate(${f1(k * 60 + Math.sin(k * 20) * 14)}px,${f1(-k * 150)}px)`; });
  sfx('whoosh', mo0, { g: 0.25, p: 0.4 });
  // 发动大家，一封一封给 Mozilla 写信
  const tMail = T('e5', '发动') - 0.1;
  fbOut(wallet, tMail - 0.3);
  const crowd = fbAbs(g, 990, 470, artCrowd(3, 84, -14, 2));
  fbIn(crowd, tMail + 0.05, { x: 160 }, { d: 0.2 });
  const mt0 = T('e5', '一封') - 0.05, mt1 = T('e5', '写信') + 0.1;
  for (let i = 0; i < 12; i++) {
    const m = fbAbs(g, 1060 + (i % 3) * 40, 520, ART.envelope);
    const t = mt0 + (mt1 - mt0) * i / 12;
    init(m, { autoAlpha: 0, scale: 0.9, z: 150 });
    to(m, t, { autoAlpha: 1, duration: 0.06 });
    to(m, t + 0.06, { x: -10 - (i % 3) * 40 + (i % 4) * 26 - 30, y: -186 + (i % 3) * 14 - i * 3, rotationZ: -14 + (i % 5) * 7, duration: 0.26, ease: 'power3.out' });
    if (i % 2 === 0) sfx('tick', t + 0.45, { g: 0.5, p: 0.4 });
  }
  // 信堆到 Mozilla：卡片被撞得一晃，底色闪一下
  const tHit = T('e5', 'Mozilla') - 0.05;
  to(moz, tHit, { x: -22, backgroundColor: '#ffd9d2', duration: 0.1, ease: 'power3.out' });
  to(moz, tHit + 0.1, { x: 0, backgroundColor: '#ffffff', duration: 0.45, ease: 'power2.out' });
  sfx('thud', tHit, { g: 0.6, p: 0.5 });
  // 二〇〇四年二月改名 Firefox
  to(name, T('e6', '改名') - 0.1, { y: 260, rotationZ: 8, autoAlpha: 0, duration: 0.32, ease: 'power2.in' });
  sfx('whoosh', T('e6', '改名') - 0.1, { g: 0.5, p: -0.3 });
  const fx = fbAbs(br.body, 300, 60, '<img src="/img/logo-firefox.svg" style="width:300px;height:300px;display:block">');
  fbIn(fx, tFox, { scale: 0.4, rotationZ: -60 }, { d: 0.45, ease: 'back.out(1.6)' });
  sfx('chime', tFox + 0.05);
  // Mozilla 的说法：品牌问答原文
  const tQ = T('e7') - 0.05;
  [br.el, crowd, db, ibp, ibpL, moz, y03].forEach((e) => fbOut(e, tQ, { duration: 0.25 }));
  g.querySelectorAll('.abs svg[width="130"]').forEach((m) => fbOut(m.parentNode, tQ, { duration: 0.25 }));
  const q = fbCard(g, 230, 150, 1120, 420, `<img src="/img/logo-mozilla.svg" style="position:absolute;left:44px;top:32px;width:70px;height:53px"><div class="by" style="position:absolute;left:136px;top:40px">Mozilla Brand Name FAQ · Why change the name?</div><div class="line" style="position:absolute;left:44px;right:44px;top:104px"></div><div class="head" style="position:absolute;left:44px;right:44px;top:130px;font-size:52px;line-height:1.3">“…we wanted to be responsive to the <span class="hlq">concerns of fellow open source developers</span>.”</div><div class="lab-s" style="position:absolute;left:44px;top:350px;font-size:32px">想回应开源同行的关切</div>`);
  const hq = q.querySelector('.hlq'), zl = q.querySelector('.lab-s');
  init(zl, { autoAlpha: 0 }); to(zl, T('e7', '回应') - 0.1, { autoAlpha: 1, duration: 0.3 });
  to(hq, T('e7', '同行') - 0.1, { backgroundColor: 'rgba(250,172,25,.45)', duration: 0.4 });
  fbIn(q, tQ + 0.05, { y: 120, z: 160 }, { ease: 'back.out(1.2)', d: 0.42 });
  sfx('pop', tQ + 0.15);
});
