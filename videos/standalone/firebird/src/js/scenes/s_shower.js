// 第 1 章：DEC 的程序员在浴室想到多版本 → 读写互不等待 → 客房创业 → 起名 → 不碍事的数据库 → 坦克的梗。
scene('shower', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 八十年代初，DEC 的程序员，浴室里想通了一件事 ──
  const A = fbSec(pl, true);
  const y80 = fbMini(A, 1380, 16, '八十年代', '初');
  fbIn(y80, T('a1', '八') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('a1', '八'), { p: 0.5 });
  const dec = fbLogo(A, 70, 40, 'dec', 300);
  fbIn(dec, T('a1', 'DEC') - 0.1, { x: -80, rotationZ: -3 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('a1', 'DEC'), { p: -0.5 });
  const decCap = fbCap(A, 74, 214, 'DEC', '美国电脑公司，以小型机闻名，1998 年并入康柏', 430);
  fbCapIn(decCap, T('a1', 'DEC') + 0.35);
  const jim = fbAbs(A, 150, 330, artHuman({ ...PEOPLE.jim, w: 150 }));
  fbIn(jim, T('a1', '程序') - 0.15, { x: -90 }, { d: 0.4 });
  const jimN = fbAbs(A, 112, 640, '<div class="nm" style="width:226px">Jim Starkey</div>');
  fbIn(jimN, T('a1', '吉') - 0.05, { y: 14 }, { d: 0.25 });
  sfx('pop', T('a1', '吉'), { g: 0.6, p: -0.5 });
  // 浴室：蓝瓷砖、窗外是树林；水一直在落
  const bath = fbAbs(A, 640, -20, artBathroom(700));
  fbIn(bath, T('a2') - 0.1, { y: 70, scale: 0.96 }, { d: 0.45, ease: 'back.out(1.3)' });
  sfx('thud', T('a2') + 0.15, { g: 0.6, p: 0.3 });
  const water = fbAbs(bath, 0, 0, '<svg width="700" height="658" viewBox="0 0 660 620"><g><g class="rp" fill="none" stroke="#4f86c6" stroke-width="2.5"></g><g class="dr" stroke="#4f86c6" stroke-width="4" stroke-linecap="round"></g></g></svg>');
  const wg = water.querySelector('g'), wl = [], rp = [];
  for (let i = 0; i < 16; i++) { const l = svg('line', {}, wg.querySelector('.dr')); wl.push(l); }
  for (let i = 0; i < 2; i++) rp.push(svg('ellipse', {}, wg.querySelector('.rp')));
  const w0 = T('a2', '洗') - 0.1;
  F((t) => {
    const on = t > w0;
    wg.style.opacity = on ? 1 : 0;
    if (!on) return;
    waterLines(t - w0).forEach(([x1, y1, x2, y2], i) => { wl[i].setAttribute('x1', f1(x1)); wl[i].setAttribute('y1', f1(y1)); wl[i].setAttribute('x2', f1(x2)); wl[i].setAttribute('y2', f1(y2)); });
    waterRipples(t - w0).forEach(([cx, cy, rx, ry, op], i) => { rp[i].setAttribute('cx', f1(cx)); rp[i].setAttribute('cy', f1(cy)); rp[i].setAttribute('rx', f1(rx)); rp[i].setAttribute('ry', f1(ry)); rp[i].setAttribute('opacity', op.toFixed(3)); });
  });
  sfx('whoosh', w0, { g: 0.25, p: 0.4 });
  const bulb = fbAbs(A, 318, 300, ART.bulb);
  fbIn(bulb, T('a2', '想') - 0.02, { scale: 0.2, y: 40 }, { d: 0.35, ease: 'back.out(2)' });
  sfx('chime', T('a2', '想') + 0.05, { g: 0.8, p: -0.4 });

  // ── B 改一条记录，旧的留着：读的人看旧的，写的人写新的 ──
  const B = fbSec(pl);
  fbScroll(A, B, T('a3') - 0.4);
  const VX = 300, VW = 600;
  const ver = (i, val) => {
    const e = h('div', 'sheet ver', B, `<span class="vt">版本 ${i + 1}</span><span class="vk">1</span><span class="vv">${val}</span>`);
    css(e, { left: VX + i * 30 + 'px', top: 520 - i * 140 + 'px', width: VW + 'px' });
    init(e, { z: i * 40 });
    return e;
  };
  const v1 = ver(0, 'phoenix'), v2 = ver(1, 'firebird'), v3 = ver(2, '');
  fbIn(v1, T('a3') - 0.05, { y: 60 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('a3') + 0.05, { g: 0.6 });
  const pen0 = fbAbs(B, 930, 440, ART.pencil);
  fbIn(pen0, T('a3', '改') - 0.05, { x: 60, rotationZ: 20 }, { d: 0.3 });
  sfx('tick', T('a3', '改'), { g: 0.6 });
  // 别把旧的盖掉：新的一版落在旧的上面，旧的不动
  const tV2 = T('a3', '别') + 0.05;
  init(v2, { autoAlpha: 0, y: -120, z: 260 });
  to(v2, tV2, { autoAlpha: 1, y: 0, z: 40, duration: 0.42, ease: 'back.out(1.3)' });
  sfx('thud', tV2 + 0.25, { g: 0.7 });
  to(pen0, tV2, { x: 30, y: -140, duration: 0.42, ease: 'power3.inOut' });
  const keep = fbAbs(B, VX + 640, 548, '旧的留着', 'lab-s');
  fbIn(keep, T('a3', '旧') + 0.1, { x: -20 }, { d: 0.25 });
  fbOut(pen0, T('a4') - 0.2); fbOut(keep, T('a4') - 0.2);
  // 写的人（橙）在上方写新的一版，读的人（蓝）在下方读旧的
  const reader = fbAbs(B, 1220, 440, artHuman({ shirt: '#2156a5', hair: '#2b2b2b', style: 'long', w: 110 }));
  const writer = fbAbs(B, 1330, 40, artHuman({ shirt: '#c2410c', hair: '#6b4a2f', w: 110 }));
  fbIn(reader, T('a4', '读') - 0.12, { x: 90 }, { d: 0.32 });
  fbIn(writer, T('a4', '写') - 0.12, { x: 90 }, { d: 0.32 });
  const eye = fbAbs(B, 1225, 360, ART.eye);
  fbIn(eye, T('a4', '看') - 0.05, { scale: 0.3 }, { d: 0.25, ease: 'back.out(2)' });
  const pen = fbAbs(B, 1235, 40, ART.pencil);
  fbIn(pen, T('a4', '写的人写') + 0.25, { scale: 0.3, rotationZ: 30 }, { d: 0.25, ease: 'back.out(2)' });
  // 读：从旧版本流向读的人（向右）；写：从写的人流向新版本（向左）
  const ov = fbAbs(B, 0, 0, `<svg width="1620" height="900" viewBox="0 0 1620 900">
    <path d="M915 572 H1196" stroke="#2156a5" stroke-width="7" fill="none"/><path d="M1180 556 L1206 572 L1180 588" stroke="#2156a5" stroke-width="7" fill="none" stroke-linejoin="round"/>
    <path d="M1316 160 C1180 160 1100 300 980 300" stroke="#c2410c" stroke-width="7" fill="none"/><path d="M998 284 L972 300 L998 316" stroke="#c2410c" stroke-width="7" fill="none" stroke-linejoin="round"/>
    <g data-r="1" fill="#2156a5"><circle r="9"/><circle r="9"/><circle r="9"/></g><g data-w="1" fill="#c2410c"><circle r="9"/><circle r="9"/><circle r="9"/></g></svg>`);
  const pR = ov.querySelectorAll('path')[0], pW = ov.querySelectorAll('path')[2];
  const aR = ov.querySelectorAll('path')[1], aW = ov.querySelectorAll('path')[3];
  const tR = T('a4', '旧') - 0.05, tW = T('a4', '新') - 0.05;
  [[pR, aR, tR], [pW, aW, tW]].forEach(([p, a, t]) => { arrowIn(p, t, 0.35); init(a, { autoAlpha: 0 }); to(a, t + 0.3, { autoAlpha: 1, duration: 0.08 }); });
  const lR = fbAbs(B, 980, 596, '读旧版本', 'lab-b'), lW = fbAbs(B, 1000, 330, '写新版本', 'lab-o');
  fbIn(lR, tR + 0.15, { y: 10 }, { d: 0.25 }); fbIn(lW, tW + 0.15, { y: 10 }, { d: 0.25 });
  classAt(v1, 'hl-r', tR, Tend('a5') + 0.4);
  init(v3, { autoAlpha: 0, y: -120, z: 300 });
  to(v3, tW - 0.1, { autoAlpha: 1, y: 0, z: 80, duration: 0.42, ease: 'back.out(1.3)' });
  classAt(v3, 'hl-w', tW, Tend('a5') + 0.4);
  const v3v = v3.querySelector('.vv');
  typeText(v3v, 'firefox', tW + 0.1, 14, { cursor: false, sfxGain: 0.4 });
  sfx('pop', tR, { g: 0.6, p: 0.5 }); sfx('pop', tW, { g: 0.6, p: 0.6 });
  // 读的不用等写的：两股同时流动
  const dR = ov.querySelectorAll('[data-r] circle'), dW = ov.querySelectorAll('[data-w] circle');
  const lenW = pW.getTotalLength(), f0 = tR + 0.3, f1_ = Tend('a5') + 0.3;
  F((t) => {
    const on = t > f0 && t < f1_;
    dR.forEach((c, i) => { const k = ((t - f0) * 0.9 + i / 3) % 1; c.setAttribute('cx', f1(915 + 270 * k)); c.setAttribute('cy', 572); c.style.opacity = on ? 1 : 0; });
    dW.forEach((c, i) => { const k = ((t - f0) * 0.9 + i / 3) % 1; const p = on ? pW.getPointAtLength(lenW * k) : { x: 0, y: 0 }; c.setAttribute('cx', f1(p.x)); c.setAttribute('cy', f1(p.y)); c.style.opacity = on && t > tW + 0.3 ? 1 : 0; });
  });
  const nowait = fbAbs(B, 1360, 470, `<div style="display:flex;align-items:center;gap:10px"><svg width="70" height="90" viewBox="0 0 120 170"><path d="M22 18 H98 C98 58 66 70 66 85 C66 100 98 112 98 152 H22 C22 112 54 100 54 85 C54 70 22 58 22 18 Z" fill="#e9f0f7" stroke="#8e98a4" stroke-width="6"/><path d="M8 160 L112 10" stroke="#bf0000" stroke-width="12" stroke-linecap="round"/></svg><span class="lab-b">不用等</span></div>`);
  fbIn(nowait, T('a4', '不用') - 0.05, { scale: 0.4 }, { d: 0.3, ease: 'back.out(2)' });
  sfx('tick', T('a4', '不用'), { g: 0.7, p: 0.5 });
  // 同样的思路：这一套就叫多版本，底下铺一块浅橙色的板标出来
  const mv = fbAbs(B, 270, 210, '<div style="width:690px;height:450px;background:rgba(250,172,25,.18);border:4px solid #F68A21"></div><div class="lab-o" style="position:absolute;left:18px;top:-50px">多版本</div>');
  B.insertBefore(mv, B.firstChild);
  fbIn(mv, T('a5', '思路') - 0.1, { scale: 0.92 }, { d: 0.16, ease: 'power3.out' });
  sfx('tick', T('a5', '思路'), { g: 0.6 });
  // 同样的思路在 PostgreSQL 里也能见到
  const pgc = fbLogo(B, 30, 40, 'postgresql', 170);
  fbIn(pgc, T('a5', 'PostgreSQL') - 0.1, { x: -90, rotationZ: -3 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('a5', 'PostgreSQL'), { g: 0.8, p: -0.5 });
  const pgL = fbAbs(B, 36, 360, '也用多版本', 'lab-b');
  fbIn(pgL, T('a5', '也') - 0.05, { y: 10 }, { d: 0.25 });

  // ── C 一九八四年，三个人，二楼的客房 ──
  const C = fbSec(pl);
  fbScroll(B, C, T('a6') - 0.4);
  const y84 = fbMini(C, 1380, 16, '一九八四年', '9 月');
  fbIn(y84, T('a6', '一九') - 0.05, { scale: 1.5, y: -20 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('a6', '一九'), { p: 0.5 });
  const team = fbAbs(C, 60, 330, `<div style="display:flex;gap:6px;align-items:flex-end">${artHuman({ ...PEOPLE.jim, w: 110 })}${artHuman({ ...PEOPLE.p2, w: 104 })}${artHuman({ ...PEOPLE.p3, w: 110 })}</div>`);
  const teamK = [...team.firstChild.children];
  fbIn(teamK[0], T('a6', '他') - 0.1, { x: -80 }, { d: 0.3 });
  fbIn(teamK[1], T('a6', '伙伴') - 0.25, { x: -80 }, { d: 0.3 });
  fbIn(teamK[2], T('a6', '伙伴') - 0.08, { x: -80 }, { d: 0.3 });
  sfx('pop', T('a6', '伙伴'), { g: 0.6, p: -0.5 });
  const houseG = h('div', 'sec', C);
  const house = fbAbs(houseG, 600, 120, artHouse(470));
  // 先量好二楼那扇窗在镜头坐标里的位置（量的时候本段与房子都放回原位）
  gsap.set(C, { y: 0 });
  const win = house.querySelector('[data-win]');
  const wb = win.getBoundingClientRect(), vb = root.querySelector('.world-p').getBoundingClientRect(), k = 1620 / vb.width;
  const winX = (wb.left + wb.width / 2 - vb.left) * k, winY = (wb.top + wb.height / 2 - vb.top) * k;
  gsap.set(C, { y: SCROLL });
  fbDrop(house, T('a6', '开') - 0.25, -200);
  sfx('thud', T('a6', '开') + 0.15, { g: 0.8 });
  to(win, T('a7', '二楼') - 0.05, { fill: '#FFD66B', duration: 0.2 });
  sfx('tick', T('a7', '二楼'), { g: 0.7, p: 0.2 });
  // 镜头推进二楼的窗，切进客房
  const tPush = T('a7', '客') - 0.35;
  cam.track(s.start, { x: 810, y: 391, z: 1 }, [[tPush, { x: winX, y: winY, z: 3.4 }, 0.55, { ease: 'power2.in', g: 0.5 }]]);
  const tCut = tPush + 0.55;
  cam.cut(tCut, { x: 810, y: 391, z: 1 });
  set(houseG, tCut, { autoAlpha: 0 });
  // 客房：地板、两面墙，家具按旁白一件件落进来
  const roomG = h('div', 'sec', C);
  init(roomG, { autoAlpha: 0 });
  set(roomG, tCut, { autoAlpha: 1 });
  const RW = 950, RH = RW * 0.84;
  const room = fbAbs(roomG, 420, 0, artRoom(RW)); css(room, { width: RW + 'px', height: RH + 'px' });
  init(room, { scale: 1.6, transformOrigin: '42% 30%' });
  to(room, tCut, { scale: 1, duration: 0.5, ease: 'power3.out' });
  const piece = (k_) => { const d = h('div', 'abs', room, artRoomPiece(k_)); css(d, { left: 0, top: 0, width: RW + 'px', height: RH + 'px' }); return d; };
  const cabL = piece('cabL'), cabR = piece('cabR'), door = piece('door'), pc = piece('pc'), chair = piece('chair');
  fbDrop(chair, T('a9', '椅') - 0.22, -160); sfx('thud', T('a9', '椅') + 0.15, { g: 0.6, p: 0.2 });
  fbDrop(cabL, T('a9', '两') - 0.15, -180); sfx('thud', T('a9', '两') + 0.2, { g: 0.7, p: -0.1 });
  fbDrop(cabR, T('a9', '文件') - 0.15, -180); sfx('thud', T('a9', '文件') + 0.2, { g: 0.7, p: 0.1 });
  fbDrop(door, T('a9', '门') - 0.3, -240); sfx('thud', T('a9', '门') + 0.1, { g: 1 });
  const deskT = fbAbs(roomG, 470, 330, fbTag('办公桌', 'blue'));
  fbIn(deskT, T('a9', '办公') - 0.1, { y: -30 }, { d: 0.3, ease: 'back.out(1.6)' });
  fbOut(deskT, T('a10', '维修') - 0.2);
  fbDrop(pc, T('a10') - 0.25, -160); sfx('thud', T('a10') - 0.05, { g: 0.6 });
  const scr = pc.querySelector('[data-screen]');
  to(scr, T('a10', '电脑') - 0.05, { fill: '#2f6b55', duration: 0.2 });
  // 猫跳上显示器蜷着睡
  const cat = fbAbs(roomG, 703, 177, artCat(150));
  fbDrop(cat, T('a10', '猫') - 0.08, -150);
  sfx('pop', T('a10', '猫') + 0.15, { g: 0.6, p: 0.2 });
  const catIn = cat.firstChild;
  F((t) => { catIn.style.transform = `scaleY(${(1 + 0.025 * Math.sin(t * 2.6)).toFixed(4)})`; catIn.style.transformOrigin = '50% 95%'; });
  // 启动资金
  const money = fbCard(C, 40, 60, 420, 200, `<div class="lab-s" style="position:absolute;left:30px;top:24px">启动资金</div><div class="money" style="position:absolute;left:30px;top:72px;font-size:96px">$243.50</div>`);
  fbIn(money, T('a8', '二') - 0.1, { scale: 1.3, rotationZ: -4 }, { d: 0.3, ease: 'back.out(1.6)' });
  sfx('thud', T('a8', '二'), { g: 0.8, p: -0.5 });
  // 维修工每周上门吸一次猫毛
  const fixer = fbAbs(roomG, 1020, 320, artHuman({ ...PEOPLE.fixer, w: 120 }));
  fbIn(fixer, T('a10', '维修') - 0.15, { x: 260 }, { d: 0.45 });
  sfx('whoosh', T('a10', '维修') - 0.15, { g: 0.4, p: 0.6 });
  const vac = fbAbs(roomG, 860, 300, ART.handvac);
  init(vac, { scaleX: -0.8, scaleY: 0.8, rotationZ: -22, transformOrigin: '50% 50%' });
  fbIn(vac, T('a10', '每周') - 0.1, { x: 120 }, { d: 0.3, end: { scaleX: -0.8, scaleY: 0.8 } });
  const wk = fbAbs(roomG, 1170, 250, fbTag('每周一次', 'small'));
  fbIn(wk, T('a10', '每周') + 0.1, { y: -20 }, { d: 0.25 });
  const hairs = [];
  for (let i = 0; i < 9; i++) hairs.push(fbAbs(roomG, 0, 0, '<svg width="22" height="10" viewBox="0 0 22 10"><path d="M1 5 C6 0 10 10 14 4 C17 1 19 6 21 5" stroke="#6e6b65" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>'));
  const h0 = T('a10', '吸') - 0.1, h1 = Tend('a10') + 0.5;
  F((t) => hairs.forEach((d, i) => {
    const kk = (t - h0 - i * 0.12) / 0.7;
    if (kk < 0 || kk > 1 || t > h1) { d.style.opacity = 0; return; }
    d.style.opacity = 1;
    d.style.transform = `translate(${f1(790 + 90 * kk + Math.sin(i * 2.1) * 20 * (1 - kk))}px,${f1(230 + 90 * kk * kk + Math.cos(i * 1.7) * 26 * (1 - kk))}px) rotate(${(i * 40 + kk * 200).toFixed(0)}deg)`;
  }));
  sfx('whoosh', h0, { g: 0.4, p: 0.4 });

  // ── D 起名：商标检索都不过 → Groton → 接电话的念成 Rotten → InterBase ──
  const D = fbSec(pl);
  fbScroll(C, D, T('a12') - 0.4);
  const reg = fbCard(D, 70, 30, 700, 590, `<div class="by" style="position:absolute;left:40px;top:28px">商标检索</div><div class="line" style="position:absolute;left:40px;right:40px;top:82px"></div>`);
  fbIn(reg, T('a12') - 0.1, { x: -100, rotationZ: -3 }, { ease: 'back.out(1.3)' });
  const rg = seeded(12), stamps = [];
  for (let i = 0; i < 6; i++) {
    const row = h('div', 'reg', reg); css(row, { left: '40px', right: '40px', top: 104 + i * 76 + 'px' });
    const nb = h('div', 'bar-l', row); css(nb, { left: '0px', top: '30px', width: 180 + rg() * 200 + 'px' });
    const st = fbAbs(row, 420, 10, '已注册', 'stamp s'); css(st, { fontSize: '40px' }); stamps.push(st);
  }
  const mag = fbAbs(D, 0, 0, ART.magnifier);
  const m0 = T('a12', '别') - 0.1, mEnd = T('a12', '检索') + 0.35;
  init(mag, { autoAlpha: 0, z: 120 });
  to(mag, m0 - 0.15, { autoAlpha: 1, duration: 0.15 });
  to(mag, mEnd, { autoAlpha: 0, duration: 0.2 });
  F((t) => { const kk = clamp((t - m0) / (mEnd - m0)); mag.style.left = f1(470 - 40 * Math.sin(kk * Math.PI * 6)) + 'px'; mag.style.top = f1(70 + kk * 430) + 'px'; });
  stamps.forEach((st, i) => {
    const t = m0 + (mEnd - m0) * (i + 0.6) / 6;
    fbIn(st, t, { scale: 1.8, rotationZ: 10 }, { d: 0.14, end: { rotationZ: -8 }, ease: 'power4.out' });
    sfx('tick', t + 0.05, { g: 0.6, p: -0.4 });
  });
  // 牌子：正面 Groton，翻过来是 InterBase
  const signBox = fbAbs(D, 860, 70, ''); css(signBox, { width: '680px', height: '170px', transformStyle: 'preserve-3d' });
  const sFront = h('div', 'sign', signBox, 'Groton Database Systems'); css(sFront, { left: 0, top: 0, width: '680px', height: '170px', lineHeight: '150px', fontSize: '44px' });
  const sBack = h('div', 'sign', signBox, 'InterBase Software'); css(sBack, { left: 0, top: 0, width: '680px', height: '170px', lineHeight: '150px', fontSize: '60px', transform: 'rotateX(180deg)', color: '#FAAC19' });
  fbDrop(signBox, T('a12b', '小镇') - 0.15, -160);
  sfx('thud', T('a12b', '小镇') + 0.2, { g: 0.8 });
  const grCap = fbCap(D, 866, 262, 'Groton', '马萨诸塞州的小镇，Starkey 家在这里', 720);
  fbCapIn(grCap, T('a12b', 'Groton') + 0.1);
  // 电话：铃响，听筒拿起，那头念成 Rotten
  const phG = fbAbs(D, 860, 470, ''); css(phG, { width: '260px', height: '210px' });
  const cord = fbAbs(phG, 0, 0, '<svg width="420" height="320" viewBox="0 0 420 320" style="overflow:visible"><path fill="none" stroke="#3a3a3a" stroke-width="4"/></svg>');
  const phone = fbAbs(phG, 0, 30, ART.phone);
  const rcv = fbAbs(phG, -5, 40, ART.receiver);
  init(phG, { scale: 1.35, transformOrigin: '0 0' });
  fbIn(phG, T('a13') - 0.3, { y: 60 }, { d: 0.3, end: { scale: 1.35 } });
  const r0 = T('a13') - 0.1, rUp = T('a13', '电话') + 0.05;
  F((t) => { rcv.style.rotate = t > r0 && t < rUp ? (Math.sin((t - r0) * 50) * 6).toFixed(1) + 'deg' : '0deg'; });
  to(rcv, rUp, { y: -70, x: 30, rotationZ: -18, duration: 0.25, ease: 'power3.out' });
  // 线圈：从底座左侧连到听筒左端，听筒拿起来时跟着拉长
  const cp = cord.querySelector('path');
  F(() => {
    const x = +gsap.getProperty(rcv, 'x'), y = +gsap.getProperty(rcv, 'y'), r = (+gsap.getProperty(rcv, 'rotation')) * Math.PI / 180;
    const lx = 30 - 100, ly = 44 - 35, bx = -5 + 100 + x + lx * Math.cos(r) - ly * Math.sin(r), by = 40 + 35 + y + lx * Math.sin(r) + ly * Math.cos(r);
    const ax = 22, ay = 150, n = 9; let d = `M${ax} ${ay}`;
    for (let i = 1; i <= n * 4; i++) { const k = i / (n * 4), px = ax + (bx - ax) * k, py = ay + (by - ay) * k + 30 * Math.sin(k * Math.PI), w = Math.sin(i * Math.PI / 2) * 9; d += ` L${f1(px - w)} ${f1(py)}`; }
    cp.setAttribute('d', d);
  });
  sfx('beep', r0, { g: 0.4, p: 0.4 });
  const bub = fbAbs(D, 880, 345, '“Rrrrotten Database Systems?”', 'bubble');
  css(bub, { position: 'absolute', fontSize: '36px' });
  fbIn(bub, T('a13', 'Rotten') - 0.1, { scale: 0.5, transformOrigin: '10% 100%' }, { d: 0.3, ease: 'back.out(1.8)' });
  sfx('pop', T('a13', 'Rotten'), { g: 0.7, p: 0.5 });
  const rot = fbAbs(D, 1200, 492, '<span class="lab-o">rotten：烂的</span>');
  fbIn(rot, T('a13', '烂') - 0.05, { y: 12 }, { d: 0.25 });
  const tFlip = T('a13b', '改') - 0.1;
  to(signBox, tFlip, { rotationX: 180, duration: 0.55, ease: 'back.out(1.2)' });
  init(sBack, { autoAlpha: 0 }); set(sBack, tFlip + 0.12, { autoAlpha: 1 }); set(sFront, tFlip + 0.12, { autoAlpha: 0 });
  sfx('whoosh', tFlip, { g: 0.6, p: 0.4 }); sfx('chime', tFlip + 0.4, { g: 0.7, p: 0.4 });
  to(rcv, tFlip - 0.05, { x: 0, y: 0, rotationZ: 0, duration: 0.25, ease: 'power2.in' });
  [bub, rot, grCap].forEach((e) => fbOut(e, tFlip - 0.05));

  // ── E 一个不碍事的数据库：好装、几乎不用管、能放进程序里 ──
  const E = fbSec(pl);
  fbScroll(D, E, T('a14') - 0.4);
  const ib = fbAbs(E, 700, -10, fbDbPlain(220));
  const ibL = fbAbs(ib, 0, 138, '<div class="nm" style="width:220px;font-size:38px">InterBase</div>');
  fbDrop(ib, T('a14') - 0.05, -180);
  sfx('thud', T('a14') + 0.3, { g: 0.7 });
  const quiet = fbAbs(E, 930, 70, fbTag('不碍事'));
  fbIn(quiet, T('a14', '碍事') - 0.1, { x: -30 }, { d: 0.3, ease: 'back.out(1.6)' });
  const tile = (x, ic, label, t) => {
    const e = fbCard(E, x, 290, 420, 360, `${ic}<div class="nm" style="position:absolute;left:0;right:0;bottom:26px">${label}</div>`);
    fbIn(e, t - 0.12, { y: 80, rotationZ: -2, z: 60 }, { ease: 'back.out(1.4)', d: 0.38 });
    sfx('pop', t, { g: 0.7, p: -0.5 + x / 1620 });
    return e;
  };
  tile(100, `<div class="abs" style="left:110px;top:56px">${ART.box}</div><div class="abs" style="left:175px;top:14px">${ART.arrowDown}</div>`, '好装', T('a14', '好装'));
  tile(600, `<div class="abs" style="left:120px;top:50px">${ART.gear}</div><div class="abs" style="left:270px;top:40px">${ART.zz}</div>`, '几乎不用管', T('a14', '几乎'));
  const t3 = tile(1100, `<div class="abs" style="left:50px;top:40px">${artApp(320, 210, '应用程序')}</div>`, '放进程序里', T('a15', '放进'));
  const tIn = T('a15', '应用') - 0.15;
  to(ib, tIn, { x: 500, y: 338, scale: 0.36, z: 80, duration: 0.5, ease: 'power3.inOut' });
  sfx('thud', tIn + 0.45, { g: 0.8, p: 0.5 });
  fbOut(quiet, tIn); to(ibL, tIn, { autoAlpha: 0, duration: 0.15 });

  // ── F 一个流传很广的梗：M1 坦克开炮，电涌搞崩车载电脑，重启后 InterBase 接着干活 ──
  const Fs = fbSec(pl);
  fbScroll(E, Fs, T('a16') - 0.4);
  const note = fbAbs(Fs, 60, 10, '<div class="adm"><div class="ic">!</div><div class="ln"></div><div class="tx">坊间流传的梗，未经证实</div></div>');
  fbIn(note, T('a16') + 0.05, { x: -60 }, { d: 0.3 });
  sfx('pop', T('a16') + 0.1, { g: 0.6, p: -0.5 });
  const tankG = h('div', 'sec', Fs);
  const tank = fbAbs(tankG, 40, 300, artTank(1000));
  const tRoll = T('a17') - 0.15;
  init(tank, { x: -1100 });
  to(tank, tRoll, { x: 0, duration: 1.0, ease: 'power2.out' });
  sfx('drive', tRoll, { g: 0.6, p: -0.4 });
  const m1L = fbAbs(tankG, 0, 0, '<svg width="1620" height="900" viewBox="0 0 1620 900"><path d="M690 322 L622 400" stroke="#8e8c86" stroke-width="4"/><circle cx="622" cy="400" r="7" fill="#8e8c86"/></svg>');
  fbIn(m1L, T('a17', 'M') - 0.05, {}, { d: 0.2 });
  const m1 = fbAbs(tankG, 640, 250, fbTag('M1'));
  fbIn(m1, T('a17', 'M') - 0.05, { y: -20 }, { d: 0.25, ease: 'back.out(1.6)' });
  const tFire = T('a17', '开炮') - 0.06;
  to(tank, tFire, { x: -34, duration: 0.07, ease: 'power4.out' });
  to(tank, tFire + 0.08, { x: 0, duration: 0.5, ease: 'power2.inOut' });
  const flash = fbAbs(tankG, 980, 356, '<svg width="220" height="220" viewBox="0 0 100 100"><path fill="#FAAC19" d="M50 0 L60 34 L92 14 L72 44 L100 50 L72 58 L90 86 L60 68 L50 100 L40 68 L10 86 L28 58 L0 50 L28 44 L8 14 L40 34 Z"/><circle cx="50" cy="50" r="18" fill="#EE2B24"/><circle cx="50" cy="50" r="9" fill="#fff6d8"/></svg>');
  init(flash, { autoAlpha: 0, scale: 0.2 });
  to(flash, tFire, { autoAlpha: 1, scale: 1, duration: 0.08, ease: 'power4.out' });
  to(flash, tFire + 0.12, { autoAlpha: 0, scale: 1.3, duration: 0.26 });
  sfx('thud', tFire + 0.01, { g: 1.3, p: 0.4 });
  const smoke = [0, 1, 2, 3].map((i) => fbAbs(tankG, 0, 0, `<svg width="140" height="110" viewBox="0 0 140 110"><g fill="${['#e2e0da', '#d8d6cf', '#ebe9e4', '#d0cec7'][i]}"><circle cx="46" cy="62" r="34"/><circle cx="82" cy="46" r="38"/><circle cx="104" cy="70" r="28"/><circle cx="66" cy="78" r="28"/></g></svg>`));
  F((t) => smoke.forEach((e, i) => {
    const kk = (t - tFire - 0.05 - i * 0.07) / 1.4;
    if (kk < 0 || kk > 1) { e.style.opacity = 0; return; }
    e.style.opacity = (0.75 * (1 - kk)).toFixed(3);
    e.style.transform = `translate(${f1(1054 + kk * (80 + i * 30))}px,${f1(411 - kk * (60 + i * 25))}px) scale(${(0.4 + kk * (1.2 + i * 0.2)).toFixed(3)})`;
  }));
  // 车载电脑：引出框（屏幕放大，状态一眼看得出）
  const crt = fbAbs(tankG, 1120, 20, artCrt(440));
  const crtL = fbAbs(tankG, 1160, 404, '车载电脑', 'lab');
  const lead = fbAbs(tankG, 0, 0, '<svg width="1620" height="900" viewBox="0 0 1620 900"><path d="M640 500 C800 430 980 330 1130 260" stroke="#8e8c86" stroke-width="4" stroke-dasharray="12 9" fill="none"/><path data-bolt="1" d="M640 500 L760 430 L730 418 L860 360 L830 350 L980 290 L955 282 L1130 250" stroke="#FAAC19" stroke-width="12" fill="none" stroke-linejoin="round"/></svg>');
  const tSurge = T('a17', '电涌') - 0.05;
  [crt, crtL].forEach((e) => fbIn(e, tSurge - 0.32, { x: 80 }, { d: 0.22 }));
  const dash = lead.querySelectorAll('path')[0], bolt = lead.querySelectorAll('path')[1];
  init(dash, { autoAlpha: 0 }); to(dash, tSurge - 0.3, { autoAlpha: 1, duration: 0.2 });
  arrowIn(bolt, tSurge, 0.22);
  to(bolt, tSurge + 0.5, { autoAlpha: 0, duration: 0.15 });
  sfx('error', tSurge + 0.05, { g: 0.6, p: 0.5 });
  const scrn = fbAbs(tankG, 1170, 67, ''); css(scrn, { width: '340px', height: '240px', overflow: 'hidden' });
  const face = (bg, html) => { const e = fbAbs(scrn, 0, 0, html); css(e, { width: '340px', height: '240px', background: bg }); init(e, { autoAlpha: 0 }); return e; };
  const sOk = face('#122019', '<div style="padding-top:62px;text-align:center;font:700 50px Mono;color:#54BC4B">InterBase</div><div style="text-align:center;font:500 32px Sans SC;color:#8fd18a;margin-top:8px">运行中</div>');
  const sBad = face('#9b1c1c', '<svg width="340" height="240" viewBox="0 0 340 240"><g stroke="#ffb3ab" stroke-width="7"><path d="M0 40 H170 M60 90 H340 M0 150 H230 M110 200 H340"/></g><path d="M125 65 L215 155 M215 65 L125 155" stroke="#fff" stroke-width="18" stroke-linecap="round"/></svg>');
  const sBoot = face('#050807', '<div style="padding-top:70px;text-align:center;font:500 30px Sans SC;color:#8fd18a">重启中</div><div style="margin:22px auto 0;width:240px;height:26px;border:4px solid #54BC4B"><div data-fill="1" style="width:100%;height:100%;background:#54BC4B;transform-origin:0 50%"></div></div>');
  const sUp = face('#1f5f3a', '<div style="padding-top:62px;text-align:center;font:700 50px Mono;color:#fff">InterBase</div><div style="text-align:center;font:600 32px Sans SC;color:#c9f2c4;margin-top:8px">接着干活</div>');
  const tCrash = T('a17', '搞崩') - 0.05, tBoot = T('a18', '重启') - 0.05, tUp = T('a18', 'InterBase') - 0.05;
  to(sOk, tSurge - 0.15, { autoAlpha: 1, duration: 0.05 }); to(sOk, tCrash, { autoAlpha: 0, duration: 0.03 });
  to(sBad, tCrash, { autoAlpha: 1, duration: 0.03 }); to(sBad, tBoot, { autoAlpha: 0, duration: 0.03 });
  sfx('error', tCrash + 0.02, { g: 0.9, p: 0.6 });
  // 崩溃那一下，整辆车连同引出框一震
  F((t) => { const k = t - tCrash; tankG.style.translate = k > 0 && k < 0.35 ? `${f1(Math.sin(k * 90) * 10 * (1 - k / 0.35))}px 0px` : '0px 0px'; });
  to(sBoot, tBoot, { autoAlpha: 1, duration: 0.03 }); to(sBoot, tUp, { autoAlpha: 0, duration: 0.03 });
  const bf = sBoot.querySelector('[data-fill]');
  init(bf, { scaleX: 0 }); to(bf, tBoot + 0.05, { scaleX: 1, duration: tUp - tBoot - 0.1, ease: 'none' });
  to(sUp, tUp, { autoAlpha: 1, duration: 0.03 });
  sfx('chime', T('a18', '干活') - 0.05, { g: 0.7, p: 0.6 });
  // 传说：画面褪成灰，盖章
  const tLeg = T('a19', '传说') - 0.08;
  // 真假没有证据：一说到这里，整幅画就褪成旧照片的样子
  to(tankG, T('a19', '真假') - 0.05, { filter: 'grayscale(1) opacity(.55)', duration: 0.45 });
  fbOut(m1, T('a19', '真假') - 0.05); fbOut(m1L, T('a19', '真假') - 0.05);
  fbStamp(Fs, 560, 236, '没有证据', T('a19', '证据'), { rz: 6 });
  fbStamp(Fs, 300, 120, '传说', tLeg, { rz: -10 });
});
