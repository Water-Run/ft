// 第 3 章：代码有了、公司还在扯皮 → 社区二十四小时搭好源码树，开上 SourceForge → 开源第六天有了名字 → 烧完还能重生。
scene('fork', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s);
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 代码有了，公司在扯皮，社区不等 ──
  const A = fbSec(pl, true);
  const code = fbCard(A, 70, 40, 480, 400, `<div class="by" style="position:absolute;left:36px;top:28px">InterBase 6.0 源码</div><div class="line" style="position:absolute;left:36px;right:36px;top:82px"></div>`);
  const rc = seeded(5);
  for (let i = 0; i < 7; i++) { const b = h('div', 'bar-l', code); css(b, { left: 36 + (i % 3) * 30 + 'px', top: 110 + i * 38 + 'px', width: 160 + rc() * 220 + 'px', background: ['#cfcdc7', '#b9c9df', '#e6c7a8'][i % 3] }); }
  fbIn(code, T('c1') - 0.1, { y: 70, rotationZ: -3 }, { ease: 'back.out(1.4)', d: 0.4 });
  sfx('pop', T('c1'), { g: 0.6, p: -0.5 });
  // 公司那边：备忘录上写着「待定」，沙漏一遍遍翻
  const memo = fbCard(A, 640, 40, 560, 270, `<img src="/img/logo-borland.svg" style="position:absolute;left:36px;top:30px;width:150px;height:43px"><div class="line" style="position:absolute;left:36px;right:36px;top:96px"></div><div class="head" style="position:absolute;left:36px;top:116px">InterBase 接下来归谁管</div><div class="big" style="position:absolute;left:36px;top:160px;font-size:76px;color:#1c1c1c">待定……</div>`);
  fbIn(memo, T('c1', '公司') - 0.15, { x: 120, rotationZ: 3 }, { ease: 'back.out(1.3)', d: 0.4 });
  const hg = fbAbs(A, 1240, 60, ART.hourglass);
  fbIn(hg, T('c1', '公司') + 0.05, { scale: 0.4 }, { d: 0.3, ease: 'back.out(1.8)' });
  const f1t = T('c1', '扯皮') - 0.15;
  to(hg, f1t, { rotationZ: 180, duration: 0.35, ease: 'power2.inOut' });
  to(hg, f1t + 0.6, { rotationZ: 360, duration: 0.35, ease: 'power2.inOut' });
  sfx('tick', f1t, { g: 0.5, p: 0.5 }); sfx('tick', f1t + 0.6, { g: 0.5, p: 0.5 });
  // 社区：从左下进来，抱走代码
  const crowd = fbAbs(A, 60, 470, artCrowd(5, 84, -14, 4));
  fbIn(crowd, T('c1', '社区') - 0.15, { x: -220 }, { d: 0.4 });
  sfx('pop', T('c1', '社区'), { g: 0.6, p: -0.5 });
  const tGo = T('c1', '不想') - 0.05;
  to(code, tGo, { x: 0, y: -10, rotationZ: -1, scale: 0.9, duration: 0.3, ease: 'power2.out' });
  to(memo, tGo, { x: 220, autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
  to(hg, tGo, { x: 220, autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
  sfx('whoosh', tGo, { g: 0.4, p: 0.5 });
  // 二十四小时：钟面转满一圈，源码树一行行长出来
  const clock = fbAbs(A, 640, 260, ART.tree24);
  fbIn(clock, T('c2') - 0.15, { scale: 0.4 }, { d: 0.32, ease: 'back.out(1.8)' });
  const clockL = fbAbs(A, 668, 470, '24 小时', 'lab-b');
  fbIn(clockL, T('c2', '小时') - 0.1, { y: 10 }, { d: 0.25 });
  to(code, T('c2') - 0.05, { x: 940, y: 60, scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'power2.in' });
  const sweep = clock.querySelector('[data-sweep]'), hand = clock.querySelector('[data-hand]');
  const k0 = T('c2', '搭') - 0.1, k1 = Tend('c2') + 0.1;
  F((t) => {
    const k = clamp((t - k0) / (k1 - k0)), a = k * Math.PI * 2 - Math.PI / 2;
    const x = 100 + Math.cos(a) * 82, y = 100 + Math.sin(a) * 82;
    sweep.setAttribute('d', k <= 0 ? 'M100 100 Z' : k >= 1 ? 'M100 100 m0 -82 a82 82 0 1 1 -0.01 0 Z' : `M100 100 V18 A82 82 0 ${k > 0.5 ? 1 : 0} 1 ${f1(x)} ${f1(y)} Z`);
    hand.setAttribute('d', `M100 100 L${f1(100 + Math.cos(a) * 74)} ${f1(100 + Math.sin(a) * 74)}`);
  });
  const tree = fbCard(A, 950, 40, 580, 520, '');
  fbIn(tree, T('c2') - 0.05, { x: 140, rotationZ: 3 }, { ease: 'back.out(1.3)', d: 0.4 });
  const rows = [['firebird/', 0], ['jrd/', 1], [0, 2], [0, 2], ['burp/', 1], [0, 2], ['alice/', 1], [0, 2], [0, 2]];
  const r = seeded(31);
  rows.forEach(([label, depth], i) => {
    const y = 120 + i * 42, x = 44 + depth * 40;
    let e;
    if (label) { e = h('div', 'mono-dir abs', tree, label); css(e, { left: x + 'px', top: y - 10 + 'px', color: depth === 0 ? '#c2410c' : '#1c1c1c' }); }
    else { e = h('div', 'bar-l', tree); css(e, { left: x + 'px', top: y + 6 + 'px', width: 160 + r() * 240 + 'px' }); }
    wipe(e, k0 + (k1 - k0 - 0.2) * i / rows.length, { dir: 'l', d: 0.14 });
  });
  sfx('blip', k0, { g: 0.4, p: 0.4 });
  // 两个澳大利亚程序员，开上 SourceForge
  const devs = fbAbs(A, 640, 520, `<div style="display:flex;gap:4px;align-items:flex-end">${artHuman({ ...PEOPLE.dev, w: 86 })}${artHuman({ shirt: '#2b7a78', hair: '#c9a26b', w: 86 })}</div>`);
  fbIn(devs, T('c2b', '两个') - 0.1, { x: -100 }, { d: 0.35 });
  const au = fbAbs(A, 830, 560, flagAU);
  fbIn(au, T('c2b', '澳') - 0.05, { scale: 0.4 }, { d: 0.25, ease: 'back.out(2)' });
  sfx('pop', T('c2b', '澳'), { g: 0.6, p: 0.2 });
  const sf = fbLogo(A, 990, 590, 'sourceforge', 420, { pad: 26 });
  fbIn(sf, T('c2b', 'SourceForge') - 0.25, { y: 60 }, { ease: 'back.out(1.5)', d: 0.36 });
  const up = fbAbs(A, 1200, 548, '<svg width="40" height="50" viewBox="0 0 40 50"><path d="M20 46 V8 M6 20 L20 6 L34 20" fill="none" stroke="#F68A21" stroke-width="6" stroke-linecap="round"/></svg>');
  fbIn(up, T('c2b', 'SourceForge') - 0.05, { y: 20 }, { d: 0.25 });
  sfx('chime', T('c2b', 'SourceForge'), { g: 0.6, p: 0.5 });
  const sfCap = fbCap(A, 994, 722, 'SourceForge', '托管开源项目的网站', 520);
  fbCapIn(sfCap, T('c2b', 'SourceForge') + 0.2);

  // ── B 七月三十一号，开源第六天，它有了名字 ──
  const B = fbSec(pl);
  fbScroll(A, B, T('c3') - 0.4);
  const days = [25, 26, 27, 28, 29, 30, 31];
  const cal = fbAbs(B, 110, 70, ''); css(cal, { width: '430px', height: '520px', transformStyle: 'preserve-3d' });
  const f0 = T('c3') + 0.05, fEnd = T('c3', '三十一') + 0.05;
  days.slice().reverse().forEach((d, ri) => {
    const i = days.length - 1 - ri;
    const lf = h('div', 'leaf', cal, `<div class="band">二〇〇〇年七月</div><div class="day">${d}</div><div class="wk">${i === 0 ? '开源当天' : '开源第 ' + i + ' 天'}</div>`);
    init(lf, { x: i * 6, y: i * 8, z: -i * 6 });
    if (i < days.length - 1) {
      const t = f0 + (fEnd - f0) * i / (days.length - 1);
      to(lf, t, { rotationX: 118, y: -160, z: 120, autoAlpha: 0, duration: 0.24, ease: 'power2.in' });
      sfx('tick', t + 0.04, { g: 0.55, p: -0.4 });
    }
  });
  const wk31 = cal.firstChild.querySelector('.wk');
  to(wk31, T('c3', '第六') - 0.08, { color: '#c2410c', scale: 1.25, duration: 0.2, ease: 'back.out(2)' });
  sfx('tick', T('c3', '第六'), { g: 0.6 });
  // 纸圈一层层立起，标志落在「名字」上
  const birth = T('c3', '名字') - 0.05;
  const rw = fbAbs(B, 730, 0, ''); css(rw, { width: '720px', height: '720px', transformStyle: 'preserve-3d' });
  [['#FAAC19', 720], ['#F68A21', 580], ['#EE2B24', 450], ['#ffffff', 340]].forEach(([c, d], i) => {
    const ring = h('div', 'ring', rw); css(ring, { left: 360 - d / 2 + 'px', top: 360 - d / 2 + 'px', width: d + 'px', height: d + 'px', background: c });
    init(ring, { autoAlpha: 0, scale: 0.6, z: i * 40 });
    const tr = birth - (3 - i) * 0.16 - 0.2;
    to(ring, tr, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
    sfx('tick', tr + 0.02, { g: 0.5 + i * 0.1, p: 0.3 });
  });
  const logo = h('img', 'abs', rw); logo.src = '/img/firebird-logo.png'; css(logo, { left: '215px', top: '215px', width: '290px', height: '290px' });
  init(logo, { autoAlpha: 0, z: 200, scale: 1.5 });
  to(logo, birth + 0.05, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
  sfx('chime', birth + 0.12); sfx('thud', birth + 0.1, { g: 0.7 });
  const wm = fbCard(rw, 110, 590, 500, 110, '<img src="/img/firebird-word.png" style="position:absolute;left:40px;top:24px;height:62px">');
  init(wm, { autoAlpha: 0, z: 240, y: 40 });
  to(wm, T('c4') - 0.05, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' });
  sfx('pop', T('c4'), { p: 0.3 });
  // 烧完还能重生：整团火收成一粒灰，再炸开回来
  const burn = T('c4', '烧') - 0.2, again = T('c4', '重') - 0.05;
  init(rw, { transformOrigin: '50% 50%' });
  to(rw, burn, { scale: 0.1, filter: 'grayscale(1) brightness(0.55)', duration: Math.min(0.45, again - burn - 0.04), ease: 'power2.in' });
  to(rw, again, { scale: 1, filter: 'grayscale(0) brightness(1)', duration: 0.5, ease: 'back.out(1.7)' });
  sfx('whoosh', burn, { g: 0.5 }); sfx('thud', again + 0.05, { g: 0.9 }); sfx('chime', again + 0.12, { g: 0.8 });
  const sparks = [];
  for (let i = 0; i < 14; i++) sparks.push(fbAbs(B, 0, 0, `<div style="width:16px;height:16px;border-radius:50%;background:${['#FAAC19', '#F68A21', '#EE2B24'][i % 3]}"></div>`));
  F((t) => sparks.forEach((e, i) => {
    const k = (t - again) / 0.8;
    if (k < 0 || k > 1) { e.style.opacity = 0; return; }
    const a = i / 14 * Math.PI * 2 + 0.3, d = 120 + 300 * Math.sqrt(k);
    e.style.opacity = (1 - k).toFixed(3);
    e.style.transform = `translate(${f1(1082 + Math.cos(a) * d)}px,${f1(352 + Math.sin(a) * d)}px)`;
  }));
});
