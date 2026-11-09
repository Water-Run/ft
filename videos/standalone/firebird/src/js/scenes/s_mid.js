// 第 2 章前半（公司放手）与第 4、5 章后半（后门的后果、改名）。
function buildXmasEarly(pg, s) {
  // 收购
  const a = fbPlane(pg, 8, -6, 0, 2000);
  const ib = fbCard(a, 130, 340, 470, 170, '<div class="plate-b" style="line-height:170px">InterBase</div>');
  fbIn(ib, T('b1') + 0.05, { x: -160 });
  const bor = fbCard(a, 950, 280, 500, 300, '<div class="plate-b" style="line-height:150px;font-size:76px;color:#2156a5">Borland</div>');
  fbIn(bor, T('b1', '收购') - 0.15, { x: 200, z: 90 }, { ease: 'back.out(1.3)' });
  const y91 = fbMini(a, 620, 180, '一九九一年', '10 月');
  fbIn(y91, T('b1', '一九') - 0.05, { scale: 1.5, y: -20 });
  const tBor = T('b1', 'Borland') - 0.05;
  to(ib, tBor - 0.2, { x: 835, y: 82, z: 130, scale: 0.72, duration: 0.5, ease: 'power3.inOut' });
  sfx('thud', tBor + 0.15);
  fbKicks(a, [T('b1', '收购'), tBor + 0.2]);

  // 裁一半、第六版停了
  const b = fbPlane(pg, 8, 6, 0, 2000);
  fbSwap(a, b, T('b2') - 0.28);
  const y99 = fbMini(b, 90, 200, '一九九九年', '12 月');
  fbIn(y99, T('b2', '圣诞') - 0.1, { scale: 1.5, y: -20 });
  sfx('tick', T('b2', '圣诞'), { p: -0.5 });
  const staff = fbAbs(b, 300, 240, '');
  const cut = T('b3', '一半') - 0.08;
  // 39 人（FACTS H12）；裁「至少一半」，这里灰掉并落下 20 个
  for (let i = 0; i < 39; i++) {
    const col = i % 13, row = (i / 13) | 0;
    const p = fbAbs(staff, col * 62, row * 94, fbPerson(52, '#3a3a3a'));
    fbIn(p, T('b2') - 0.18 + (col + row) * 0.03, { y: 14 }, { d: 0.2 });
    if (i % 2 === 0 && i < 40) {
      to(p, cut + i * 0.012, { y: 80, autoAlpha: 0.14, duration: 0.3, ease: 'power2.in' });
    }
  }
  sfx('thud', cut + 0.1);
  const v6 = fbCard(b, 300, 630, 1100, 150, '<div class="v6">第六版</div><div class="v6-b"><div class="v6-f"></div></div>');
  fbIn(v6, T('b3', '第六版') - 0.2, { y: 70, z: 120 });
  const fill = v6.querySelector('.v6-f');
  init(fill, { scaleX: 0, transformOrigin: '0 50%' });
  to(fill, T('b3', '第六版'), { scaleX: 0.62, duration: 0.5, ease: 'power2.out' });
  const stop = fbAbs(v6, 1000, 34, '!', 'adm-mini');
  fbIn(stop, T('b3', '停了') - 0.05, { scale: 1.7 }, { d: 0.18 });
  sfx('error', T('b3', '停了'), { g: 0.8, p: 0.4 });
  const boss = fbCard(b, 1180, 90, 250, 110, `<div style="display:flex;align-items:center;gap:14px;padding:12px 18px">${fbPerson(58, '#2156a5')}<div class="boss-t">赚得<br>不够</div></div>`);
  fbIn(boss, T('b2', '管理层') - 0.1, { x: 160, z: 120 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('b2', '管理层'), { g: 0.7, p: 0.5 });
  fbKicks(b, [T('b2', '圣诞'), T('b2', '管理层'), T('b2', '赚得'), cut + 0.05, T('b3', '第六版'), T('b3', '停了')]);

  // 用户要买下来
  const c = fbPlane(pg, 9, -6, 0, 2000);
  fbSwap(b, c, T('b4') - 0.26);
  const crowd = fbAbs(c, 90, 610, `<div style="transform:scale(1.7);transform-origin:0 100%">${fbCrowd}</div>`);
  fbIn(crowd, T('b4') - 0.08, { x: -240 });
  sfx('pop', T('b4', '急了'), { p: -0.5 });
  const bar = fbAbs(c, 560, 455, '<div class="price-l"></div><div class="price-t">买下 InterBase</div>');
  fbIn(bar, T('b4', '买下') - 0.15, { x: 60 });
  const coins = [];
  const tA = T('b4', '买下') + 0.25, tB = T('b5', '好几回');
  for (let i = 0; i < 14; i++) {
    const coin = fbAbs(c, 920 + (i % 2) * 8, 660 - i * 44, '', 'coin');
    const t = tA + (tB - tA + 0.3) * i / 14;
    fbIn(coin, t, { y: -110 }, { d: 0.18, ease: 'power2.in' });
    if (i % 2 === 0) sfx('tick', t + 0.16, { g: 0.5, p: 0.2 });
    coins.push(coin);
  }
  sfx('thud', tB + 0.2);
  fbKicks(c, [T('b5', '好几回')]);

  // 宣布开源，打算拆分，谈崩
  const d = fbPlane(pg, 6, -6, 0, 2000);
  fbSwap(c, d, T('b6') - 0.26);
  const y00 = fbMini(d, 120, 196, '二〇〇〇年', '1 月');
  fbIn(y00, T('b6', '二') - 0.05, { scale: 1.5, y: -20 });
  const pr = fbCard(d, 330, 220, 760, 320, `<div class="by">Inprise / Borland</div><div class="line" style="margin:14px 0 26px"></div><div class="big gl" style="font-size:150px">开源</div>`, { padding: '36px 50px' });
  const glo = pr.querySelector('.gl'); init(glo, { autoAlpha: 0, scale: 1.5, transformOrigin: '0% 50%' });
  to(glo, T('b6', '开源') - 0.04, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power4.out' });
  const sub = fbCard(d, 420, 540, 620, 120, '<div class="head" style="line-height:120px;text-align:center">InterBase 业务拆成新公司</div>');
  fbIn(sub, T('b6', '开源') - 0.05, { y: 60, z: 140 });
  fbIn(pr, T('b6') - 0.08, { y: 90, z: 130, rotationZ: 4 });
  sfx('pop', T('b6', '开源') - 0.05);
  const scissor = fbAbs(d, 1120, 430, `<svg width="210" height="130" viewBox="0 0 210 130"><g fill="none" stroke="#3a3a3a" stroke-width="11"><circle cx="30" cy="34" r="22"/><circle cx="30" cy="96" r="22"/><path d="M48 44 L198 112 M48 86 L198 18"/></g></svg>`);
  fbIn(scissor, T('b6b', '拆') - 0.2, { x: 160 });
  to(scissor, T('b6b', '拆') + 0.2, { x: -240, duration: 0.5, ease: 'power2.inOut' });
  sfx('tick', T('b6b', '拆'), { p: 0.3 });
  const tBreak = T('b7', '谈崩') - 0.1;
  to(sub, T('b6b', '拆') + 0.5, { x: 500, rotationZ: 5, duration: 0.4, ease: 'power3.inOut' });
  to(sub, tBreak, { rotationZ: 16, y: 420, autoAlpha: 0, duration: 0.42, ease: 'power2.in' });
  to(pr, tBreak, { rotationZ: -13, y: 480, autoAlpha: 0, duration: 0.42, ease: 'power2.in' });
  fbOut(scissor, tBreak); fbOut(y00, T('b8') - 0.35);
  sfx('error', tBreak + 0.1, { g: 0.7 });
  fbKicks(d, [T('b6', '开源'), tBreak]);
  return d;
}

function buildDoorLate(pg, pl, s, pads) {
  // 卡片收小靠上，下半页讲后果
  const tUp = T('d5') - 0.32;
  pads.forEach((p, i) => to(p, tUp, { x: i ? 240 : -30, y: i ? -310 : -130, scale: i ? 0.52 : 0.56, z: 90, duration: 0.34, ease: 'power3.inOut' }));
  const ser = fbCard(pl, 760, 440, 220, 230, `<div style="text-align:center;margin-top:24px">${fbDb(120, false)}</div>`);
  fbIn(ser, T('d4', '服务器') - 0.15, { x: -120, z: 100 }, { ease: 'back.out(1.3)' });
  sfx('pop', T('d4', '服务器'), { p: 0.3 });
  const lock = fbAbs(pl, 1100, 430, `<svg width="210" height="250" viewBox="0 0 120 150"><rect x="14" y="66" width="92" height="76" rx="9" fill="#3a3a3a"/><rect id="kk" x="53" y="94" width="14" height="26" rx="6" fill="#efeee9"/></svg>`);
  const shackle = h('div', 'abs', lock, `<svg width="210" height="130" viewBox="0 0 120 74"><path d="M33 72 V38 a27 27 0 0 1 54 0 V72" fill="none" stroke="#3a3a3a" stroke-width="13"/></svg>`);
  css(shackle, { left: '0px', top: '6px' });
  fbIn(lock, T('d5', '这两个') - 0.2, { x: 120, z: 100 }, { ease: 'back.out(1.3)' });
  const tOpen = T('d5', '就能进') - 0.05;
  to(shackle, tOpen, { y: -66, rotationZ: 22, transformOrigin: '75% 100%', duration: 0.2, ease: 'power4.out' });
  sfx('thud', tOpen + 0.02);
  // 七年的版本
  const tV = T('d6', '七年');
  const row = ['4.x', '5.x', '6.01'];
  const vs = row.map((v, i) => {
    const e = fbCard(pl, 200 + i * 400, 690, 340, 130, `<div class="plate-b" style="line-height:130px;font-size:66px">${v}</div>`);
    const t = tV + i * (60 / 118) * 0.9;
    fbIn(e, t - 0.1, { y: 110, z: 110 }, { ease: 'back.out(1.4)' });
    sfx('pop', t, { g: 0.7, p: -0.3 + i * 0.3 });
    const body = e.querySelector('.plate-b'); to(body, T('d7', '闭源') + 0.1, { autoAlpha: 0, duration: 0.02 }); to(body, T('d7', '公开') - 0.03, { autoAlpha: 1, duration: 0.02 });
    const dot = fbAbs(e, 276, 42, '', 'r-dot');
    fbIn(dot, T('d6', '全带') - 0.05 + i * 0.14, { scale: 2.4 }, { d: 0.15 });
    sfx('tick', T('d6', '全带') + i * 0.14, { g: 0.8 });
    return e;
  });
  fbOut(ser, tV - 0.2, { y: -60 }); fbOut(lock, tV - 0.2, { y: -60 });
  // 闭源时盖着，公开时揭开
  const cover = fbCard(pl, 180, 660, 1250, 186, '<div class="cover-t">闭 源</div>', { background: '#232323', boxShadow: '0 22px 40px rgba(0,0,0,.45)' });
  init(cover, { autoAlpha: 0, x: -1300, z: 170 });
  to(cover, T('d7', '闭源') - 0.25, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' });
  sfx('whoosh', T('d7', '闭源') - 0.25, { g: 0.5 });
  to(cover, T('d7', '公开') - 0.05, { y: -540, rotationX: -50, autoAlpha: 0, duration: 0.38, ease: 'power2.in' });
  sfx('thud', T('d7', '公开') + 0.1);
  fbKicks(pl, [tOpen, tV, T('d7', '公开')]);
}

scene('name', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 10, -7, 0, 2000, '50% 30%');
  // 又是开场那个窗口
  const br = fbBrowser(pl, 90, 196, 880, 520);
  fbIn(br.el, T('e1') - 0.1, { x: -200, rotationZ: -3 });
  const y03 = fbMini(pl, 800, 110, '二〇〇三年', '4 月');
  fbIn(y03, T('e2', '二') - 0.05, { scale: 1.5, y: -20 });
  sfx('tick', T('e2', '二'), { p: 0.3 });
  fbOut(y03, T('e6') - 0.15);
  const y04 = fbMini(pl, 800, 110, '二〇〇四年', '2 月');
  fbIn(y04, T('e6', '二') - 0.06, { scale: 1.5, y: -20 });
  sfx('tick', T('e6', '二'), { p: 0.3 });
  fbOut(y04, T('e7') - 0.1);
  const tBird = T('e3', 'Fire') - 0.05;
  br.titles([['Mozilla Phoenix', T('e1') + 0.1], ['Mozilla Firebird', tBird], ['Mozilla Firefox', T('e6', 'Fire') - 0.05]]);
  sfx('thud', tBird, { g: 0.8 });
  const stamp = fbAbs(br.el, 240, 230, '商标冲突', 'stamp');
  fbIn(stamp, T('e2', '商标') - 0.1, { scale: 1.8, rotationZ: 16 }, { d: 0.18, end: { rotationZ: -5 } });
  fbOut(stamp, tBird - 0.1);
  sfx('tick', T('e2', '商标'), { g: 0.8 });
  const dbX = fbAbs(pl, 1130, 300, fbDb(220, true));
  fbIn(dbX, T('e4', '赞助') + 0.02, { x: 200, z: 80 }, { ease: 'back.out(1.3)' });
  const lg = h('img', 'abs', dbX); lg.src = '/img/firebird-logo.png'; css(lg, { left: '48px', top: '98px', width: '124px', height: '124px' });
  const ibp = fbCard(pl, 1070, 690, 350, 88, '<div class="peer" style="font-size:42px;line-height:88px;text-align:center">IBPhoenix</div>');
  fbIn(ibp, T('e4', '公司') - 0.1, { y: 60, z: 90 }, { ease: 'back.out(1.3)' });
  sfx('pop', T('e4', '公司'), { p: 0.4 });
  const wallet = fbAbs(pl, 1230, 200, `<svg width="150" height="110" viewBox="0 0 120 88"><rect x="3" y="14" width="114" height="70" rx="9" fill="#a9713a"/><rect x="82" y="38" width="36" height="24" rx="7" fill="#d8a15f"/><circle cx="96" cy="50" r="5" fill="#a9713a"/></svg>`);
  fbIn(wallet, T('e4', '打不起') - 0.15, { y: -70 }, { ease: 'bounce.out', d: 0.42 });
  sfx('thud', T('e4', '打不起') + 0.1, { g: 0.7, p: 0.5 });
  // 一封封写信
  const tMail = T('e5', '发动') + 0.1, tMail2 = Tend('e5');
  fbOut(wallet, T('e5') - 0.2);
  const mails = [];
  for (let i = 0; i < 12; i++) {
    const m = fbAbs(pl, 1090 - (i % 3) * 22, 300, `<svg width="124" height="88" viewBox="0 0 104 74"><rect x="2" y="2" width="100" height="70" fill="#dbe6f5" stroke="#2156a5" stroke-width="3.5"/><path d="M3 3 L52 42 L101 3" fill="none" stroke="#2156a5" stroke-width="3.5"/></svg>`);
    mails.push(m);
    const t = tMail + (tMail2 - tMail - 0.3) * i / 12;
    init(m, { autoAlpha: 0, z: 190 });
    to(m, t, { autoAlpha: 1, duration: 0.08 });
    to(m, t + 0.08, { x: -480 - (i % 4) * 60, y: 90 + (i % 3) * 66 - i * 4, rotationZ: -12 + i * 2, duration: 0.42, ease: 'power2.inOut' });
    if (i % 2 === 0) sfx('tick', t + 0.48, { g: 0.55, p: -0.3 });
  }
  const tFox = T('e6', 'Fire') - 0.05;
  sfx('whoosh', tFox - 0.3, { g: 0.4 });
  sfx('chime', tFox + 0.05);
  const q = fbCard(pl, 260, 300, 1100, 380, `<div class="by">Mozilla Brand Name FAQ · Why change the name?</div><div class="line" style="margin:12px 0 18px"></div><div class="head" style="font-size:56px;line-height:1.3">we wanted to be responsive to the concerns of fellow open source developers.</div>`, { padding: '30px 44px' });
  fbIn(q, T('e7') + 0.1, { y: 120, z: 200 }, { ease: 'back.out(1.2)' });
  fbOut(br.el, T('e7') - 0.1, { x: -300 });
  fbOut(ibp, T('e7') - 0.1, { y: 80 }); fbOut(dbX, T('e7') - 0.1, { y: -40 });
  mails.forEach((m) => fbOut(m, tFox - 0.3, { y: 420 }));
  sfx('pop', T('e7') + 0.2);
  fbKicks(pl, [T('e1', '开头'), T('e2', '二'), T('e2', '商标'), T('e2', '换名字'), tBird, T('e4', '公司'), T('e4', '打不起'), T('e5', '发动'), T('e5', '写信'), tFox, T('e7', '关切')]);
});
