// 第 1 章：多版本的想法 → 客房创业 → 起名 → 放进程序里 → 坦克的梗。
scene('shower', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);

  // ── 第一页：洗澡时想到的事 ──
  const a = fbPlane(pg, 8, -6, 0, 2000);
  const who = fbCard(a, 60, 250, 340, 470, `<div style="text-align:center;margin-top:62px">${fbPerson(170)}</div><div class="who-n">Jim Starkey</div><div class="who-c">DEC</div>`);
  fbIn(who, T('a1', '程序员') - 0.2, { x: -90, rotationZ: -4 });
  sfx('pop', T('a1', '程序员'), { p: -0.5 });
  const showerH = fbAbs(a, 120, 118, `<svg width="220" height="170" viewBox="0 0 320 240"><path fill="#a9a6a0" d="M92 40 h136 l26 44 h-188 z"/><g stroke="#2156a5" stroke-width="8" stroke-linecap="round"><path d="M96 110 l-14 72"/><path d="M142 110 l-8 92"/><path d="M186 110 l6 92"/><path d="M232 110 l14 72"/></g></svg>`);
  fbIn(showerH, T('a2', '洗澡') - 0.1, { y: -130 }, { ease: 'bounce.out', d: 0.42 });
  sfx('tick', T('a2', '洗澡'), { p: -0.5 });
  const spark = fbAbs(a, 318, 190, `<svg width="110" height="110" viewBox="0 0 100 100"><path fill="#FAAC19" d="M50 0 L60 38 L100 50 L60 62 L50 100 L40 62 L0 50 L40 38 Z"/></svg>`);
  fbIn(spark, T('a2', '想通') - 0.04, { scale: 0.2, rotationZ: -80 }, { ease: 'back.out(2)' });
  sfx('chime', T('a2', '想通') + 0.02, { g: 0.7, p: -0.3 });

  const rows = ['phoenix', 'firebird', 'firefox'];
  const vers = rows.map((n, i) => {
    const y = 570 - i * 132, x = 480 + i * 30, z = i * 70;
    const e = fbCard(a, x, y, 830, 120, `<span class="v-tag">版本 ${i + 1}</span><span class="v-row">1 &nbsp; ${n}</span>`);
    css(e, { display: 'flex', alignItems: 'center', padding: '0 34px' });
    init(e, { z });
    return e;
  });
  const tV1 = T('a3', '记录') - 0.12, tV2 = T('a3', '盖掉') - 0.12, tV3 = T('a3', '版本') - 0.2;
  [[0, tV1], [1, tV2], [2, tV3]].forEach(([i, t]) => {
    const z = i * 70;
    init(vers[i], { autoAlpha: 0, y: -90, z: z + 200 });
    to(vers[i], t, { autoAlpha: 1, y: 0, z, duration: 0.36, ease: 'back.out(1.4)' });
    sfx('pop', t + 0.05, { g: 0.7, p: 0.2 });
  });
  fbKicks(a, [T('a1', '程序员'), T('a1', '吉姆'), T('a2', '洗澡'), T('a2', '想通'), tV1 + 0.05, tV2 + 0.05, tV3 + 0.05, T('a4', '读的'), T('a4', '旧的'), T('a4', '新的') - 0.1, T('a4', '不用等') - 0.05, T('a5', '同样'), T('a5', '思路'), T('a5', 'Postgre')], 2.2);
  const reader = fbAbs(a, 1370, 580, fbPerson(76, '#2156a5')), writer = fbAbs(a, 1430, 320, fbPerson(76, '#c2410c'));
  fbIn(reader, T('a4', '读的') - 0.05, { x: 70 });
  fbIn(writer, T('a4', '新的') - 0.12, { x: 70 });
  const dotR = fbAbs(a, 1040, 616, '', 'flow-r'), dotW = fbAbs(a, 1060, 352, '', 'flow-w');
  fbIn(dotR, T('a4', '读的') + 0.05, { scale: 0.3 }); fbIn(dotW, T('a4', '新的'), { scale: 0.3 });
  const t0 = T('a4', '读的'), tEnd = Tend('a5');
  fbOut(dotR, tEnd); fbOut(dotW, tEnd);
  F((t) => {
    const k = t < t0 ? 0 : ((t - t0) * 1.6) % 1;
    dotR.style.left = 1330 - 280 * k + 'px'; dotW.style.left = 1100 + 280 * k + 'px';
  });
  const pgTag = fbCard(a, 1020, 760, 330, 74, '<div class="peer" style="font-size:40px;line-height:74px;text-align:center">PostgreSQL</div>');
  fbIn(pgTag, T('a5', 'Postgre') - 0.1, { y: 40, z: 90 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('a5', 'Postgre'), { p: 0.4 });

  // ── 第二页：客房 ──
  const b = fbPlane(pg, 46, 0, -6, 2000, '50% 20%');
  fbSwap(a, b, T('a6') - 0.28);
  const floor = fbCard(b, 470, 250, 1000, 640, '', { background: '#f4f2ec', boxShadow: 'none', border: '3px solid #e3e0d8' });
  fbIn(floor, T('a7', '客房') - 0.2, { scale: 0.9 }, { d: 0.32 });
  const yr = fbMini(pg, 1250, 56, '一九八四年', '9 月');
  fbIn(yr, T('a6', '一九') - 0.05, { scale: 1.5, y: -20 });
  sfx('tick', T('a6', '一九'), { p: 0.5 });
  const three = fbStand(b, `<div style="display:flex;gap:22px">${fbPerson(104)}${fbPerson(92, '#555')}${fbPerson(104, '#777')}</div>`, 90, 420, 46);
  fbIn(three, T('a6', '伙伴') - 0.15, { y: 40 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('a6', '伙伴'), { p: -0.5 });
  const money = fbStand(b, `<div class="money" style="text-shadow:${fbExt(8, '#FAAC19', '#EE2B24', .9, .9)}">$243.50</div>`, 110, 640, 46);
  fbIn(money, T('a8', '二百') - 0.08, { scale: 1.5 }, { d: 0.26 });
  sfx('thud', T('a8', '二百'), { p: -0.4 });
  to(money.parentNode, T('a10', '猫') - 0.1, { autoAlpha: 0, y: 30, duration: 0.25, ease: 'power2.in' });
  const BX = 760, BY = 470;
  const c1 = fbBox(b, 720, BY + 190, 36, 36, 120, '#3e6f9e', '#2b5075', '#32608a');
  const seat = fbBox(b, 700, BY + 170, 200, 170, 22, '#3e6f9e', '#2b5075', '#32608a');
  const back = fbBox(b, 700, BY + 170, 200, 24, 170, '#3e6f9e', '#2b5075', '#32608a');
  fbDrop(c1, T('a9', '椅子') - 0.25); fbDrop(seat, T('a9', '椅子') - 0.25, 120); fbDrop(back, T('a9', '椅子') - 0.22, 142);
  sfx('thud', T('a9', '椅子') + 0.1, { g: 0.7, p: -0.2 });
  const cabL = fbGrey(b, BX, BY, 130, 150, 190), cabR = fbGrey(b, BX + 430, BY, 130, 150, 190);
  [cabL, cabR].forEach((c0_) => { const f = c0_.children[1]; f.style.background = 'repeating-linear-gradient(#c6c3bc 0 56px,#8e8c86 56px 60px)'; });
  fbDrop(cabL, T('a9', '文件柜') - 0.2); fbDrop(cabR, T('a9', '文件柜') + 0.05);
  sfx('thud', T('a9', '文件柜') + 0.12, { g: 0.7 }); sfx('thud', T('a9', '文件柜') + 0.37, { g: 0.7, p: 0.3 });
  const door = fbBox(b, BX - 40, BY - 20, 640, 190, 26, '#d8a15f', '#a9713a', '#bb8249');
  const dTop = door.children[0];
  [[34, 22, 260, 146], [346, 22, 260, 146]].forEach(([l, tp, w, hh]) => { const pn = h('div', 'abs', dTop); pn.style.cssText += `;left:${l}px;top:${tp}px;width:${w}px;height:${hh}px;border:6px solid #a9713a`; });
  const knob = h('div', 'abs', dTop); knob.style.cssText += ';left:310px;top:84px;width:24px;height:24px;border-radius:50%;background:#FAAC19';
  fbDrop(door, T('a9', '一扇门') - 0.2, 190);
  sfx('thud', T('a9', '一扇门') + 0.12, { g: 1 });
  const pc = fbGrey(b, BX + 170, BY + 10, 240, 120, 150);
  fbDrop(pc, T('a10', '电脑') - 0.25, 216);
  const scr = h('div', 'abs', pc); scr.style.cssText += ';left:0;top:0;width:204px;height:110px;background:#20252b;transform-origin:0 0;transform:translate3d(18px,120.5px,136px) rotateX(-90deg)';
  const cat = fbStand(b, `<svg width="110" height="86" viewBox="0 0 110 86"><path fill="#2a2a2a" d="M6 80 C2 56 14 40 34 36 L30 12 L46 26 C54 24 62 24 70 28 L88 12 L86 36 C100 46 106 62 104 80 Z"/></svg>`, BX + 230, BY - 10, 46);
  css(cat.parentNode, { transform: 'translate3d(0,0,366px) rotateX(-46deg)' });
  fbIn(cat, T('a10', '猫') - 0.05, { y: -60 }, { ease: 'bounce.out', d: 0.42 });
  sfx('pop', T('a10', '猫') + 0.1, { g: 0.7 });
  const fixer = fbStand(b, fbPerson(110, '#2156a5'), 1230, 770, 46);
  fbIn(fixer, T('a10', '维修工') - 0.12, { x: 200 });
  const hairs = [];
  for (let i = 0; i < 6; i++) { const d = fbAbs(pg, 840 + i * 16, 360, '', 'hair'); hairs.push(d); }
  const h0 = T('a10', '吸一次') - 0.1, h1 = Tend('a10') + 0.1;
  F((t) => hairs.forEach((d, i) => {
    const k = (t - h0 - i * 0.14) / 0.75;
    if (k < 0 || k > 1 || t > h1) { d.style.opacity = 0; return; }
    d.style.opacity = 1; d.style.transform = `translate(${k * 330}px,${k * 240 + Math.sin(k * 9 + i) * 16}px)`;
  }));
  sfx('whoosh', h0, { g: 0.35, p: 0.4 });
  fbKicks(b, [T('a8', '二百'), T('a9', '椅子'), T('a9', '文件柜') + 0.1, T('a9', '一扇门'), T('a10', '猫'), T('a10', '电脑'), T('a10', '维修工'), T('a10', '吸一次'), T('a10', '猫毛')], 2);

  // ── 第三页：起名 ──
  const c = fbPlane(pg, 8, 6, 0, 2000);
  fbSwap(b, c, T('a12') - 0.28);
  css(yr, {}); fbOut(yr, T('a12') - 0.28);
  const tStampBase = T('a12', '商标') - 0.25, tPlates = T('a12') - 0.05;
  [0, 1, 2, 3].forEach((i) => {
    const x = 130 + i * 340;
    const e = fbCard(c, x, 250, 300, 130, '<div class="tm-blank">？？？</div>');
    const t = tStampBase + (i + 0.5) * 0.42 - 0.16;
    fbIn(e, tPlates + i * 0.09, { y: -70, z: 120 }, { ease: 'back.out(1.4)' });
    const x2 = fbAbs(e, 92, 2, '✕', 'tm-x');
    fbIn(x2, t + 0.16, { scale: 2 }, { d: 0.14 });
    sfx('tick', t + 0.16, { g: 0.7, p: -0.3 + i * 0.2 });
  });
  // 商标检索：放大镜一路扫过去，扫到哪张哪张作废
  const mg = fbAbs(c, 0, 230, `<svg width="170" height="170" viewBox="0 0 100 100"><circle cx="40" cy="40" r="28" fill="rgba(33,86,165,.14)" stroke="#2156a5" stroke-width="9"/><path d="M60 60 L92 92" stroke="#2156a5" stroke-width="12" stroke-linecap="round"/></svg>`);
  const mg0 = tStampBase - 0.1, mg1 = mg0 + 1.74;
  init(mg, { autoAlpha: 0, z: 200 });
  to(mg, mg0, { autoAlpha: 1, duration: 0.1 }); to(mg, mg1, { autoAlpha: 0, duration: 0.14 });
  F((t) => { const k = Math.min(1, Math.max(0, (t - mg0) / (mg1 - mg0))); mg.style.left = 120 + k * 1250 + 'px'; });
  const plate = fbCard(c, 240, 480, 1160, 200, '');
  const pA = h('div', 'plate-b', plate, 'Groton Database Systems'), pB = h('div', 'plate-b', plate, 'Rrrrotten Database Systems'), pC = h('div', 'plate-b', plate, 'InterBase');
  fbIn(plate, T('a12b', 'Groton') - 0.15, { y: 90, z: 150 }, { ease: 'back.out(1.4)' });
  sfx('thud', T('a12b', 'Groton'), { g: 0.8 });
  const tGr = T('a13', 'Rotten') - 0.05, tIB = T('a13b', 'Inter') - 0.06;
  init(pB, { autoAlpha: 0 }); init(pC, { autoAlpha: 0, color: '#c2410c' });
  to(pA, tGr, { autoAlpha: 0, duration: 0.12 }); to(pB, tGr, { autoAlpha: 1, duration: 0.12 });
  to(pB, tIB, { autoAlpha: 0, duration: 0.12 }); to(pC, tIB, { autoAlpha: 1, duration: 0.12 });
  sfx('thud', tGr, { g: 0.7 }); sfx('chime', tIB + 0.02, { g: 0.7 });
  const phone = fbAbs(c, 110, 720, `<svg width="130" height="130" viewBox="0 0 100 100"><path fill="#2a2a2a" d="M22 8 l18 16 -10 16 c4 14 14 24 28 30 l16-10 18 18 -8 14 c-4 6-12 8-20 6 C30 88 8 62 8 26 c0-8 2-14 14-18z"/></svg>`);
  fbIn(phone, T('a13', '接电话') - 0.1, { x: -70 });
  const ph0 = T('a13', '接电话'), ph1 = tGr + 0.5;
  F((t) => { phone.style.rotate = t > ph0 && t < ph1 ? (Math.sin((t - ph0) * 40) * 7).toFixed(1) + 'deg' : '0deg'; });
  fbKicks(c, [T('a12', '起名'), T('a12', '商标'), T('a12', '检索'), T('a12b', '小镇'), T('a12b', 'Groton'), tGr, tIB]);

  // ── 第四页：不碍事 ──
  const d = fbPlane(pg, 10, -6, 0, 2000);
  fbSwap(c, d, T('a14') - 0.26);
  const dbD = fbAbs(d, 480, 210, fbDb(260, true));
  fbIn(dbD, T('a14') + 0.05, { y: -140, scale: 0.7 }, { ease: 'back.out(1.4)', d: 0.4 });
  sfx('pop', T('a14') + 0.1, { g: 0.7 });
  const tile = (x, y, ic, t) => {
    const e = fbCard(d, x, y, 280, 290, ic, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
    fbIn(e, t - 0.12, { x: -110, z: 140, rotationZ: -3 }, { ease: 'back.out(1.4)' });
    sfx('pop', t, { g: 0.8, p: -0.4 });
    return e;
  };
  tile(90, 220, `<svg width="170" height="170" viewBox="0 0 100 100"><path fill="#d8d6cf" d="M12 36 L50 18 L88 36 V78 L50 96 L12 78 Z"/><path fill="#b5b2ab" d="M12 36 L50 54 L88 36 L50 18 Z"/><path fill="#2156a5" d="M42 2 h16 v22 h12 L50 46 30 24 h12 Z"/></svg>`, T('a14', '好装'));
  tile(90, 540, `<svg width="170" height="170" viewBox="0 0 100 100"><circle cx="46" cy="58" r="30" fill="none" stroke="#8e8c86" stroke-width="12" stroke-dasharray="12 9"/><circle cx="46" cy="58" r="11" fill="#8e8c86"/><text x="74" y="30" font-family="Inter" font-weight="800" font-size="26" fill="#2156a5">z z</text></svg>`, T('a14', '不用管'));
  const win = fbCard(d, 880, 240, 620, 480, '<div class="br-bar" style="height:58px"></div>');
  fbIn(win, T('a15', '放进') - 0.3, { x: 200, z: 100 }, { ease: 'back.out(1.3)' });
  const tDrop = T('a15', '应用') - 0.08;
  to(dbD, tDrop, { x: 590, y: 118, scale: 0.7, z: 40, duration: 0.46, ease: 'power3.inOut' });
  sfx('thud', tDrop + 0.2);
  fbKicks(d, [T('a14', '好装'), T('a14', '不用管'), tDrop + 0.2]);

  // ── 第五页：坦克的梗 ──
  const e = fbPlane(pg, 8, 5, 0, 2000);
  fbSwap(d, e, T('a16') - 0.26);
  const tank = fbAbs(e, 90, 330, `<svg width="1000" height="420" viewBox="0 0 500 210"><g fill="#3b4230"><path d="M60 120 h300 l30 44 h-360 z"/><path d="M140 80 h130 l26 40 h-180 z"/><rect x="262" y="88" width="212" height="13" rx="2"/><rect x="456" y="82" width="28" height="25" rx="3"/></g><g fill="#23291c"><rect x="26" y="164" width="372" height="40" rx="20"/></g><g fill="#7c8368"><circle cx="62" cy="184" r="15"/><circle cx="128" cy="184" r="15"/><circle cx="194" cy="184" r="15"/><circle cx="260" cy="184" r="15"/><circle cx="326" cy="184" r="15"/></g></svg>`);
  fbIn(tank, T('a16') + 0.05, { x: -300 });
  sfx('thud', T('a16') + 0.2, { g: 0.7, p: -0.5 });
  const tFire = T('a17', '开炮') - 0.05;
  const flash = fbAbs(e, 1040, 290, `<svg width="300" height="300" viewBox="0 0 100 100"><path fill="#FAAC19" d="M50 0 L60 34 L92 14 L72 44 L100 50 L72 58 L90 86 L60 68 L50 100 L40 68 L10 86 L28 58 L0 50 L28 44 L8 14 L40 34 Z"/><circle cx="50" cy="50" r="17" fill="#EE2B24"/></svg>`);
  init(flash, { autoAlpha: 0, scale: 0.2 });
  to(flash, tFire, { autoAlpha: 1, scale: 1, duration: 0.12, ease: 'power4.out' });
  to(flash, tFire + 0.16, { autoAlpha: 0, scale: 1.3, duration: 0.3 });
  sfx('thud', tFire + 0.02, { g: 1.2, p: 0.5 });
  to(tank, tFire, { x: -46, duration: 0.07, ease: 'power4.out' });
  to(tank, tFire + 0.08, { x: 0, duration: 0.38, ease: 'power2.inOut' });
  const arc = fbAbs(e, 960, 300, `<svg width="210" height="150" viewBox="0 0 210 150"><path d="M0 150 L52 92 L38 76 L104 40 L92 24 L176 0" fill="none" stroke="#FAAC19" stroke-width="10"/></svg>`);
  const tArc = T('a17', '电涌') - 0.05;
  init(arc, { autoAlpha: 0 });
  to(arc, tArc, { autoAlpha: 1, duration: 0.05 });
  to(arc, tArc + 0.34, { autoAlpha: 0, duration: 0.1 });
  sfx('error', tArc + 0.02, { g: 0.5, p: 0.5 });
  const mon = fbCard(e, 1130, 250, 340, 260, '', { background: '#20252b' });
  fbIn(mon, T('a17') + 0.05, { y: -60, z: 120 });
  const up = h('div', 'mon-t', mon, 'InterBase');
  const tCrash = T('a17', '搞崩') - 0.05, tBoot = T('a18') + 0.3;
  init(up, { autoAlpha: 1, color: '#54BC4B' });
  to(up, tCrash, { autoAlpha: 0, duration: 0.05 });
  const noise = h('div', 'mon-t', mon, '×'); init(noise, { autoAlpha: 0, color: '#ff6b5e' });
  to(noise, tCrash, { autoAlpha: 1, duration: 0.05 });
  to(noise, tBoot, { autoAlpha: 0, duration: 0.05 });
  const up2 = h('div', 'mon-t', mon, 'InterBase'); init(up2, { autoAlpha: 0, color: '#54BC4B' });
  to(up2, tBoot, { autoAlpha: 1, duration: 0.05 });
  sfx('error', tCrash + 0.03, { g: 0.8, p: 0.5 });
  sfx('chime', T('a18', '干活') - 0.05, { g: 0.7, p: 0.5 });
  const legend = fbAbs(e, 420, 200, '传说', 'stamp');
  fbIn(legend, T('a19', '传说') - 0.12, { scale: 2.2, rotationZ: 18 }, { d: 0.2, end: { rotationZ: -8 } });
  const noProof = fbAbs(e, 870, 200, '没有证据', 'stamp-s');
  fbIn(noProof, T('a19', '证据') - 0.12, { scale: 1.8 }, { d: 0.2, end: { rotationZ: 0 } });
  sfx('thud', T('a19', '传说') - 0.02); sfx('tick', T('a19', '证据'), { g: 0.7 });
  fbKicks(e, [tFire, tCrash, tBoot]);
});
