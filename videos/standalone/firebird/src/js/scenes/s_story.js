// 各章的画面。代表段：七月二十五号的两份新闻稿 → 六天的撕页日历与 Firebird 诞生 → 后门账号。
// 其余各章目前只有版面骨架，代表段通过后再铺开。
function stubScene(id) {
  scene(id, ({ root, s, c0 }) => { fbPage(root, s, c0); });
}
['open', 'shower', 'name', 'today', 'end'].forEach(stubScene);

scene('xmas', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 6, -9);
  const t0 = T('b8'), t1 = T('b9', '不卖'), t2 = T('b10', '放出来'), tIn = T('b8', '两份');
  const date = h('div', 'date abs', pl, '2000.07.25'); css(date, { left: '130px', top: '186px', fontSize: '160px' });
  set(date, 0, { autoAlpha: 0, z: -220, y: 26 });
  to(date, t0 - 0.05, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  sfx('thud', t0, { g: 0.8 });
  const mk = (x, y, w, hh, head, gloss, z, rz, tt, delay, flame) => {
    const e = h('div', 'sheet', pl, `${flame ? '<div class="band-f"></div>' : ''}<div class="by">PRESS RELEASE · JULY 25, 2000</div><div class="line" style="margin:14px 0 22px"></div><div class="head">${head}</div><div class="big gl" style="font-size:112px;margin-top:22px">${gloss}</div>`);
    css(e, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', padding: '36px 46px' });
    set(e, 0, { autoAlpha: 0, x: 1500 - x, y: 80, rotationZ: rz + 8, z });
    to(e, tIn - 0.06 + delay, { autoAlpha: 1, x: 0, y: 0, rotationZ: rz, duration: 0.42, ease: 'power3.out' });
    const g = e.querySelector('.gl');
    set(g, 0, { autoAlpha: 0, scale: 1.5, transformOrigin: '0% 50%' });
    to(g, tt - 0.04, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power4.out' });
  };
  mk(70, 414, 660, 480, 'Inprise/Borland Terminates Negotiations to Sell InterBase® Product Line', '不卖了', -30, -4, t1, 0, false);
  mk(790, 410, 680, 480, 'Inprise/Borland Introduces InterBase 6.0 Now Free and Open Source on Linux®, Windows, and Solaris®', '开源了', 70, 3, t2, 0.13, true);
  sfx('pop', tIn, { g: 0.7, p: 0.4 });
  sfx('pop', tIn + 0.13, { g: 0.6, p: 0.5 });
  sfx('thud', t1, { p: -0.3 });
  sfx('thud', t2, { p: 0.3 });
  fbKicks(pl, [t0 + 0.02, tIn + 0.42, t1, t2]);
});

scene('fork', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 18, -6, 0, 2000, '40% 35%');
  const days = [25, 26, 27, 28, 29, 30, 31];
  const calBox = h('div', 'abs', pl); css(calBox, { left: '110px', top: '260px', width: '470px', height: '560px', transformStyle: 'preserve-3d' });
  const BEAT = 60 / 118, b0 = s.start + Math.ceil((T('c2b') + 0.12 - s.start) / BEAT) * BEAT;   // 配乐从本章起点按拍走
  const tSteps = [T('c2'), b0, b0 + BEAT, b0 + 2 * BEAT, b0 + 3 * BEAT, T('c3')];
  days.slice().reverse().forEach((d, ri) => {
    const i = days.length - 1 - ri;
    const lf = h('div', 'leaf', calBox, `<div class="txt"><div class="band">二〇〇〇年七月</div><div class="day">${d}</div><div class="wk">${i === 0 ? '开源当天' : '开源第 ' + i + ' 天'}</div></div>`);
    set(lf, 0, { x: i * 7, y: i * 9, z: -i * 7 });
    if (i > 0) { const tx = lf.querySelector('.txt'); set(tx, 0, { autoAlpha: 0 }); set(tx, tSteps[i - 1] + 0.18, { autoAlpha: 1 }); }
    if (i < days.length - 1) {
      const t = tSteps[i];
      to(lf, t, { rotationX: 118, y: -180, z: 120, autoAlpha: 0, duration: 0.34, ease: 'power2.in' });
      sfx('tick', t + 0.06, { g: i === 0 || i === 5 ? 1 : 0.6, p: -0.4 });
    }
  });

  // 公司那边还在扯皮：一页备忘录来回摆，社区不想等，一把推开
  const memo = h('div', 'sheet', pl, `<div class="by">Inprise / Borland</div><div class="line" style="margin:14px 0 20px"></div><div class="head">InterBase 接下来归谁管</div><div class="big" style="font-size:96px;color:#1c1c1c;margin-top:10px">待定……</div>`);
  css(memo, { left: '730px', top: '300px', width: '640px', height: '370px', padding: '34px 44px' });
  set(memo, 0, { autoAlpha: 0, x: 120, z: 60 });
  to(memo, T('c1') + 0.25, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' });
  const wob0 = T('c1', '扯皮') - 0.1, wob1 = T('c1', '不想等') - 0.2;
  F((t) => { const k = t > wob0 && t < wob1 ? Math.sin((t - wob0) * 2 * Math.PI * 118 / 60 / 2) : 0; memo.style.rotate = (k * 5).toFixed(2) + 'deg'; });
  to(memo, wob1 + 0.1, { autoAlpha: 0, x: 640, z: 200, duration: 0.3, ease: 'power3.in' });
  const crowd = h('div', 'abs', pl, fbCrowd); css(crowd, { left: '560px', top: '560px' });
  set(crowd, 0, { autoAlpha: 0, x: -140, z: 90 });
  to(crowd, wob1 - 0.28, { autoAlpha: 1, x: 0, duration: 0.24, ease: 'power3.out' });
  to(crowd, wob1 + 0.1, { x: 130, duration: 0.26, ease: 'power3.in' });
  to(crowd, T('c2') - 0.05, { autoAlpha: 0, duration: 0.2 });
  sfx('pop', wob1 + 0.12, { g: 0.7, p: 0.5 });
  sfx('tick', T('c1', '扯皮'), { g: 0.5, p: 0.3 });

  // 源码树：真实目录名，下面的文件用灰条
  const card = h('div', 'sheet', pl); css(card, { left: '700px', top: '232px', width: '700px', height: '630px' });
  set(card, 0, { autoAlpha: 0, z: 90, x: 300, y: 60, rotationZ: 7 });
  to(card, T('c2') + 0.05, { autoAlpha: 1, x: 0, y: 0, rotationZ: 2, duration: 0.5, ease: 'power3.out' });
  const r = seeded(31);
  const rows = [['firebird/', 0, 1], ['jrd/', 1, 1], [0, 2], [0, 2], [0, 2], ['burp/', 1, 1], [0, 2], [0, 2], ['alice/', 1, 1], [0, 2], [0, 2]];
  rows.forEach(([label, depth, isDir], i) => {
    const y = 150 + i * 40, x = 50 + depth * 44;
    let e;
    if (label) { e = h('div', 'mono-dir abs', card, label); css(e, { left: x + 'px', top: y - 8 + 'px', color: depth === 0 ? '#c2410c' : '#1c1c1c' }); }
    else { e = h('div', 'bar-l', card); css(e, { left: x + 'px', top: y + 6 + 'px', width: 200 + r() * 280 + 'px' }); }
    wipe(e, T('c2') + 0.28 + i * 0.09, { dir: 'l', d: 0.14 });
  });
  sfx('blip', T('c2') + 0.3, { g: 0.5, p: 0.3 });
  const sf = h('div', 'card-h abs', card, 'SourceForge'); css(sf, { left: '50px', top: '44px' });
  show(sf, T('c2b', 'Source') - 0.05, { y: 10, d: 0.25 });
  sfx('blip', T('c2b', 'Source'), { g: 0.5, p: 0.3 });
  const ppl = h('div', 'abs', card, fbPeople); css(ppl, { left: '500px', top: '452px' });
  slam(ppl, T('c2b', '澳大利亚'), { from: 1.4, d: 0.35 });
  sfx('pop', T('c2b', '澳大利亚'), { p: 0.4 });
  to(card, T('c3') - 0.05, { autoAlpha: 0, x: 400, rotationZ: 12, duration: 0.4, ease: 'power2.in' });

  // 七月三十一号：日历推到中间，念到「名字」时让位给标志
  const birth = T('c3', '名字') - 0.05;
  const ringKicks = [];
  const rw = h('div', 'abs', pl); css(rw, { left: '660px', top: '110px', width: '820px', height: '820px', transformStyle: 'preserve-3d' });
  set(rw, 0, { scale: 0.9 });
  [['#FAAC19', 820], ['#F68A21', 660], ['#EE2B24', 510], ['#ffffff', 390]].forEach(([c, d], i) => {
    const ring = h('div', 'ring', rw); css(ring, { left: 410 - d / 2 + 'px', top: 410 - d / 2 + 'px', width: d + 'px', height: d + 'px', background: c });
    set(ring, 0, { autoAlpha: 0, scale: 0.6, z: i * 50 });
    const tr = birth - (3 - i) * BEAT - 0.32;
    to(ring, tr, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
    sfx('tick', tr + 0.02, { g: 0.55 + i * 0.1, p: 0.3 });
    ringKicks.push(tr + 0.05);
  });
  const logo = h('img', 'abs', rw); logo.src = '/img/firebird-logo.png'; css(logo, { left: '245px', top: '245px', width: '330px', height: '330px' });
  set(logo, 0, { autoAlpha: 0, z: 220, scale: 1.5 });
  to(logo, birth + 0.08, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
  sfx('chime', birth + 0.15);
  sfx('thud', birth + 0.12, { g: 0.7 });
  const wm = h('div', 'sheet', rw); css(wm, { left: '130px', top: '600px', width: '560px', height: '124px' });
  const wi = h('img', 'abs', wm); wi.src = '/img/firebird-word.png'; css(wi, { left: '46px', top: '28px', height: '68px' });
  set(wm, 0, { autoAlpha: 0, z: 260, y: 40 });
  to(wm, T('c4') - 0.05, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out' });
  sfx('pop', T('c4'), { p: 0.3 });
  // 烧完还能重生：纸圈和标志收成一点，再弹回来
  const burn = T('c4', '烧') - 0.05, again = T('c4', '重') - 0.05;
  to(rw, burn, { scale: 0.08, duration: Math.min(0.5, again - burn - 0.1), ease: 'power2.in' });
  to(rw, again, { scale: 0.9, duration: 0.5, ease: 'back.out(1.8)' });
  sfx('thud', again + 0.05, { g: 0.9 });
  sfx('chime', again + 0.15, { g: 0.8 });
  fbKicks(pl, [...tSteps, ...ringKicks, birth + 0.15, again + 0.1]);
});

scene('door', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 22, 0, -2.5, 1500, '50% 30%');
  const code = h('div', 'sheet', pl); css(code, { left: '130px', top: '215px', width: '1320px', height: '520px', overflow: 'hidden' });
  const r = seeded(77), n = 14, hit = 10;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const b = h('div', 'bar-l', code); css(b, { left: 60 + (r() * 3 | 0) * 44 + 'px', top: 26 + i * 33 + 'px', width: 320 + r() * 680 + 'px', background: ['#cfcdc7', '#cfcdc7', '#b9c9df', '#e6c7a8'][r() * 4 | 0] });
    lines.push(b);
  }
  show(code, T('d1') - 0.05, { y: 24, d: 0.3 });
  // 日历线索接上：翻到半年后
  const mini = h('div', 'mini abs', pg, '<div class="b">二〇〇一年</div><div class="m">1 月</div>'); css(mini, { left: '1150px', top: '40px' });
  slam(mini, T('d1') + 0.02, { from: 1.5, d: 0.28 });
  sfx('tick', T('d1') + 0.04, { p: 0.4 });
  const de = h('div', 'flag abs', pg, '<i style="background:#000"></i><i style="background:#DD0000"></i><i style="background:#FFCE00"></i>'); css(de, { left: '1340px', top: '62px' });
  slam(de, T('d1', '德国') - 0.04, { from: 1.5, d: 0.28 });
  sfx('pop', T('d1', '德国'), { g: 0.7, p: 0.5 });
  const scan = h('div', 'abs', code); css(scan, { left: '0px', top: '0px', width: '1320px', height: '28px', background: 'rgba(33,86,165,.24)' });
  const t0 = T('d1') + 0.2, t1 = T('d1', '账号') - 0.15;
  F((t) => {
    const k = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    scan.style.opacity = t >= t0 && t < t1 + 0.1 ? 1 : 0;
    scan.style.transform = `translateY(${(hit * 33 + 20) * k}px)`;
  });
  const hitBar = h('div', 'bar-l', code); css(hitBar, { left: lines[hit].style.left, top: lines[hit].style.top, width: lines[hit].style.width, background: '#bf0000' });
  wipe(hitBar, t1, { dir: 'l', d: 0.16 });
  sfx('error', t1 + 0.05, { g: 0.7 });
  const ic = h('div', 'adm-ic', code, '!'); css(ic, { left: parseFloat(lines[hit].style.left) + parseFloat(lines[hit].style.width) + 28 + 'px', top: 26 + hit * 33 - 42 + 'px' });
  slam(ic, t1 + 0.1, { from: 1.6, d: 0.3 });
  to(ic, T('d3') - 0.05, { autoAlpha: 0, duration: 0.15 });
  const hitY = 215 + 26 + hit * 33;
  const mk = (label, word, x, y, cue, spoken) => {
    const pad = h('div', 'sheet', pl); css(pad, { left: x + 'px', top: y + 'px', padding: '22px 50px 34px' });
    pad.innerHTML = `<div class="by" style="font-size:40px">${label}</div><div class="login" style="margin-top:12px;text-shadow:${fbExt(18, '#F68A21', '#EE2B24', .75, 1)}">${word}</div>`;
    // 卡片从红行里弹出来，先空着；读到那个词时砸进去
    set(pad, 0, { autoAlpha: 0, z: 0, x: 210 - x, y: hitY - y - 30, scale: 0.1, rotationZ: -6, transformOrigin: '0% 50%' });
    to(pad, T(cue) - 0.02, { autoAlpha: 1, z: 150, x: 0, y: 0, scale: 1, rotationZ: 0, duration: 0.3, ease: 'back.out(1.5)' });
    sfx('pop', T(cue), { g: 0.7 });
    const w = pad.querySelector('.login');
    set(w, 0, { autoAlpha: 0, y: -46, scale: 1.3, transformOrigin: '0% 50%' });
    to(w, spoken - 0.05, { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power4.out' });
    sfx('thud', spoken);
  };
  // MiniMax 把逗号后第一个词的起点标早约 0.4 秒，这里按音频能量核对过的时刻取（polit 之后的片段、correct 的句末标记）
  const sp1 = T('d2', 'ically', -0.02), sp2 = T('d3', '。。', -0.04);
  mk('用户名', 'politically', 190, 262, 'd2', sp1);
  mk('密码', 'correct', 610, 520, 'd3', sp2);
  to(code, T('d3') - 0.14, { autoAlpha: 0, z: -220, duration: 0.3, ease: 'power2.in' });
  fbKicks(pl, [t1 + 0.05, sp1, sp2]);
});
