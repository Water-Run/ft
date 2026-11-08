// 各章的画面。代表段：七月二十五号的两份新闻稿 → 六天的撕页日历与 Firebird 诞生 → 后门账号。
// 其余各章目前只有版面骨架，代表段通过后再铺开。
function stubScene(id) {
  scene(id, ({ root, s, c0 }) => { fbPage(root, s, c0); });
}
['open', 'shower', 'name', 'today', 'end'].forEach(stubScene);

scene('xmas', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 6, -9);
  const t0 = T('b8'), t1 = T('b9'), t2 = T('b10');
  const date = h('div', 'date abs', pl, '2000.07.25'); css(date, { left: '130px', top: '192px', fontSize: '168px' });
  set(date, 0, { autoAlpha: 0, z: -220, y: 26 });
  to(date, t0 - 0.05, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  sfx('thud', t0, { g: 0.8 });
  const mk = (x, y, w, hh, by, big, col, z, rz, tt, fs) => {
    const e = h('div', 'sheet', pl, `<div class="by">${by}</div><div class="line" style="margin:16px 0 30px"></div><div class="big" style="color:${col};font-size:${fs}px">${big}</div>`);
    css(e, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', padding: '36px 48px' });
    set(e, 0, { autoAlpha: 0, z: z + 520, x: 620, y: 200, rotationZ: rz + 16 });
    to(e, tt - 0.08, { autoAlpha: 1, z, x: 0, y: 0, rotationZ: rz, duration: 0.55, ease: 'power3.out' });
    return e;
  };
  mk(70, 400, 660, 530, '新闻稿之一', '这条<br>产品线<br>不卖了', '#1c1c1c', -30, -4, t1, 112);
  sfx('pop', t1 - 0.02, { p: -0.3 });
  mk(800, 450, 740, 460, '新闻稿之二', '源码<br>放出来了', '#EE2B24', 120, 3, t2, 138);
  sfx('thud', t2 + 0.1, { p: 0.3 });
});

scene('fork', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 18, -6, 0, 2000, '40% 35%');
  const days = [25, 26, 27, 28, 29, 30, 31];
  const calBox = h('div', 'abs', pl); css(calBox, { left: '110px', top: '260px', width: '470px', height: '560px', transformStyle: 'preserve-3d' });
  const tSteps = [T('c2'), T('c2b') + 0.25, T('c2b') + 0.75, T('c2b') + 1.25, T('c2b') + 1.75, T('c3')];
  days.slice().reverse().forEach((d, ri) => {
    const i = days.length - 1 - ri;
    const lf = h('div', 'leaf', calBox, `<div class="band">二〇〇〇年七月</div><div class="day">${d}</div><div class="wk">${i === 0 ? '开源当天' : '开源第 ' + i + ' 天'}</div>`);
    set(lf, 0, { x: i * 3, y: i * 4, z: -i * 3 });
    if (i < days.length - 1) {
      const t = tSteps[i];
      to(lf, t, { rotationX: 118, y: -180, z: 120, autoAlpha: 0, duration: 0.34, ease: 'power2.in' });
      sfx('tick', t + 0.06, { g: i === 0 || i === 5 ? 1 : 0.6, p: -0.4 });
    }
  });

  // 公司那边还在扯皮：一页备忘录来回摆，社区不想等，一把推开
  const memo = h('div', 'sheet', pl, `<div class="by">Inprise / Borland</div><div class="line" style="margin:14px 0 24px"></div><div class="big" style="font-size:96px;color:#1c1c1c">待定……</div>`);
  css(memo, { left: '760px', top: '310px', width: '680px', height: '360px', padding: '34px 44px' });
  set(memo, 0, { autoAlpha: 0, x: 120, z: 60 });
  to(memo, T('c1') + 0.25, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' });
  const wob0 = T('c1', '扯皮') - 0.1, wob1 = T('c1', '不想等') - 0.2;
  F((t) => { const k = t > wob0 && t < wob1 ? Math.sin((t - wob0) * 2 * Math.PI * 118 / 60 / 2) : 0; memo.style.rotate = (k * 5).toFixed(2) + 'deg'; });
  to(memo, wob1 + 0.1, { autoAlpha: 0, x: 640, z: 200, duration: 0.3, ease: 'power3.in' });
  sfx('pop', wob1 + 0.12, { g: 0.7, p: 0.5 });
  sfx('tick', T('c1', '扯皮'), { g: 0.5, p: 0.3 });

  const card = h('div', 'sheet', pl); css(card, { left: '720px', top: '230px', width: '780px', height: '640px' });
  set(card, 0, { autoAlpha: 0, z: 90, x: 300, y: 60, rotationZ: 7 });
  to(card, T('c2') + 0.05, { autoAlpha: 1, x: 0, y: 0, rotationZ: 2, duration: 0.5, ease: 'power3.out' });
  const r = seeded(31), rows = 12;
  for (let i = 0; i < rows; i++) {
    const depth = i === 0 ? 0 : (i % 5 === 1 ? 1 : (r() > .5 ? 2 : 1));
    const b = h('div', 'bar-l', card);
    css(b, { left: 50 + depth * 44 + 'px', top: 170 + i * 34 + 'px', width: 190 + r() * 300 + 'px', background: i === 0 ? '#F68A21' : '#cfcdc7' });
    wipe(b, T('c2') + 0.28 + i * 0.09, { dir: 'l', d: 0.14 });
  }
  sfx('blip', T('c2') + 0.3, { g: 0.5, p: 0.3 });
  const sf = h('div', 'card-h abs', card, 'SourceForge'); css(sf, { left: '50px', top: '50px' });
  show(sf, T('c2b'), { y: 10, d: 0.3 });
  const ppl = h('div', 'abs', card, fbPeople); css(ppl, { left: '570px', top: '450px' });
  slam(ppl, T('c2b', '澳大利亚') , { from: 1.4, d: 0.35 });
  sfx('pop', T('c2b', '澳大利亚'), { p: 0.4 });

  const birth = T('c3', '名字') - 0.05;
  to(card, birth - 0.5, { autoAlpha: 0, x: 400, rotationZ: 12, duration: 0.42, ease: 'power2.in' });
  const rw = h('div', 'abs', pl); css(rw, { left: '660px', top: '110px', width: '820px', height: '820px', transformStyle: 'preserve-3d' });
  set(rw, 0, { scale: 0.9 });
  [['#FAAC19', 820], ['#F68A21', 660], ['#EE2B24', 510], ['#ffffff', 390]].forEach(([c, d], i) => {
    const ring = h('div', 'ring', rw); css(ring, { left: 410 - d / 2 + 'px', top: 410 - d / 2 + 'px', width: d + 'px', height: d + 'px', background: c });
    set(ring, 0, { autoAlpha: 0, scale: 0.6, z: i * 50 });
    to(ring, birth - 0.1 + i * 0.09, { autoAlpha: 1, scale: 1, duration: 0.38, ease: 'back.out(1.5)' });
  });
  const logo = h('img', 'abs', rw); logo.src = '/img/firebird-logo.png'; css(logo, { left: '245px', top: '245px', width: '330px', height: '330px' });
  set(logo, 0, { autoAlpha: 0, z: 220, scale: 1.5 });
  to(logo, birth + 0.25, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
  sfx('chime', birth + 0.3);
  sfx('thud', birth + 0.28, { g: 0.7 });
  const wm = h('div', 'sheet', pl); css(wm, { left: '790px', top: '700px', width: '560px', height: '124px', overflow: 'hidden' });
  const wi = h('img', 'abs', wm); wi.src = '/img/logo-firebird-black.png'; css(wi, { left: '-90px', top: '12px', height: '100px', clipPath: 'inset(0 0 0 19%)' });
  set(wm, 0, { autoAlpha: 0, z: 240, y: 40 });
  to(wm, T('c4') - 0.05, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out' });
  sfx('pop', T('c4'), { p: 0.3 });
  // 烧完还能重生：纸圈和标志收成一点，再弹回来
  const burn = T('c4', '烧') - 0.05, again = T('c4', '重') - 0.05;
  to(rw, burn, { scale: 0.08, duration: Math.min(0.5, again - burn - 0.1), ease: 'power2.in' });
  to(rw, again, { scale: 0.9, duration: 0.5, ease: 'back.out(1.8)' });
  sfx('thud', again + 0.05, { g: 0.9 });
  sfx('chime', again + 0.15, { g: 0.8 });
});

scene('door', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);
  const pl = fbPlane(pg, 22, 0, -5, 1500, '50% 30%');
  const code = h('div', 'sheet', pl); css(code, { left: '110px', top: '220px', width: '1420px', height: '640px', overflow: 'hidden' });
  const r = seeded(77), n = 18, hit = 13;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const b = h('div', 'bar-l', code); css(b, { left: 60 + (r() * 3 | 0) * 44 + 'px', top: 26 + i * 33 + 'px', width: 320 + r() * 760 + 'px' });
    lines.push(b);
  }
  show(code, T('d1') - 0.05, { y: 24, d: 0.3 });
  const scan = h('div', 'abs', code); css(scan, { left: '0px', top: '0px', width: '1420px', height: '28px', background: 'rgba(84,188,75,.28)' });
  const t0 = T('d1') + 0.2, t1 = T('d1', '账号') - 0.15;
  F((t) => {
    const k = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    scan.style.opacity = t >= t0 && t < t1 + 0.1 ? 1 : 0;
    scan.style.transform = `translateY(${(hit * 33 + 20) * k}px)`;
  });
  classAt(lines[hit], 'x', 0);
  set(lines[hit], t1, { background: '#bf0000' });
  sfx('error', t1 + 0.05, { g: 0.7 });
  const ic = h('div', 'adm-ic', pg, '!'); css(ic, { left: '1380px', top: '50px' });
  slam(ic, t1 + 0.1, { from: 1.6, d: 0.3 });
  const mk = (label, word, x, y, t) => {
    const pad = h('div', 'sheet', pl); css(pad, { left: x + 'px', top: y + 'px', padding: '22px 50px 30px' });
    pad.innerHTML = `<div class="by" style="font-size:40px">${label}</div><div class="login" style="text-shadow:${fbExt(18, '#F68A21', '#EE2B24', .75, 1)}">${word}</div>`;
    set(pad, 0, { autoAlpha: 0, z: 460, y: -60, rotationZ: -6 });
    to(pad, t - 0.06, { autoAlpha: 1, z: 150, y: 0, rotationZ: 0, duration: 0.3, ease: 'power4.out' });
    sfx('thud', t);
  };
  mk('用户名', 'politically', 180, 300, T('d2', 'politically'));
  mk('密码', 'correct', 560, 590, T('d3', 'correct'));
});
