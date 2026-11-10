// 收尾：真小众（DB-Engines 榜）→ 没有大公司，用它的人出钱出力，还在发新版 → 公司放手，用户接住 → 三个之外还有这一个 → 回到火狐。
scene('end', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s, { ry: 0, rx: 5 });
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 真小众：柱高就是得分（FACTS U02，DB-Engines 2026 年 11 月关系数据库榜，线性比例）──
  const A = fbSec(pl, true);
  const cap = fbCap(A, 70, 10, 'DB-Engines', '按网上提及、搜索、问答、招聘等热度给数据库打分的网站', 980);
  fbCapIn(cap, T('g1b') - 0.05);
  const src = fbAbs(A, 70, 62, '关系数据库榜 · 2026 年 11 月 · 流行度得分', 'lab-s');
  fbIn(src, T('g1b', '榜') - 0.1, { y: 10 }, { d: 0.25 });
  const BASE = 600, K = 440 / 823.23;
  const data = [['mysql', 823.23, '第 2', 150, 'MySQL', 'g1b'], ['postgresql', 689.69, '第 4', 470, 'PostgreSQL', 'g1b'], ['sqlite', 94.68, '第 8', 790, 'SQLite', 'g1b'], ['firebird', 18.45, '第 20', 1110, 'Firebird', 'g2']];
  const base = fbAbs(A, 90, BASE + 44, '<div style="width:1400px;height:4px;background:#d8d6cf"></div>');
  fbIn(base, T('g1') + 0.1, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.5 });
  const tops = [];
  data.forEach(([k, score, rank, x, word, cue], i) => {
    const hh = score * K, fl = k === 'firebird', W = 100;
    const o = [W * 0.866, hh + 2];
    const col = fbAbs(A, x + 40, BASE - hh - 2 - W * 0.5 + 44, `<svg width="${f1(2 * W * 0.866 + 2)}" height="${f1(hh + W + 4)}" viewBox="0 0 ${f1(2 * W * 0.866 + 2)} ${f1(hh + W + 4)}">${isoBox(o, 0, 0, 0, W, W, hh, fl ? '#F68A21' : '#8ea6c0', fl ? { top: '#FAAC19', right: '#EE2B24' } : {})}</svg>`);
    const t = cue === 'g1b' ? T('g1b', 'MySQL') - 0.1 + i * 0.25 : T('g2', 'Firebird') - 0.08;
    init(col, { transformOrigin: '50% 100%' });
    fbIn(col, t, { scaleY: 0.02 }, { d: 0.5, ease: 'power3.out' });
    sfx(fl ? 'thud' : 'pop', t + 0.1, { g: 0.7, p: -0.45 + i * 0.3 });
    const lg = fbLogo(A, 0, 0, k, k === 'postgresql' ? 70 : k === 'firebird' ? 80 : 150, { flat: true, pad: 0 });
    css(lg, { left: x + 40 + W * 0.866 - lg.offsetWidth / 2 + 'px', top: BASE + 112 + 'px' });
    // 先把四位摆上台，柱子随后按得分长出来
    fbIn(lg, T('g1') + 0.15 + i * 0.18, { y: 30 }, { d: 0.3, ease: 'back.out(1.5)' });
    sfx('tick', T('g1') + 0.15 + i * 0.18, { g: 0.4, p: -0.45 + i * 0.3 });
    const lab = fbAbs(A, x + 40 + W * 0.866 - 110, BASE - hh - 60 + 44 - 30, `<div class="bar-r" style="width:220px;${fl ? 'color:#c2410c;font-weight:800' : ''}">${rank} · ${score}</div>`);
    fbIn(lab, t + 0.15, { y: 16 }, { d: 0.22 });
    tops.push([x + 40 + W * 0.866, BASE - hh + 44 - W * 0.5]);
  });
  const small = fbAbs(A, 1300, BASE + 130, fbTag('真小众', 'small'));
  fbIn(small, T('g1', '小众') - 0.1, { x: -20 }, { d: 0.3, ease: 'back.out(1.6)' });
  // 差了四十多倍
  const tGap = T('g2', '四十') - 0.15;
  const gap = fbAbs(A, 0, 0, `<svg width="1620" height="900" viewBox="0 0 1620 900"><path d="M${f1(tops[0][0] + 90)} ${f1(tops[0][1])} H${f1(tops[3][0] + 20)}" stroke="#c2410c" stroke-width="4" stroke-dasharray="14 10"/><path d="M${f1(tops[3][0] + 120)} ${f1(tops[0][1] + 8)} V${f1(tops[3][1] - 70)}" stroke="#c2410c" stroke-width="6"/><path d="M${f1(tops[3][0] + 104)} ${f1(tops[0][1] + 28)} L${f1(tops[3][0] + 120)} ${f1(tops[0][1] + 6)} L${f1(tops[3][0] + 136)} ${f1(tops[0][1] + 28)}" fill="none" stroke="#c2410c" stroke-width="6"/></svg>`);
  fbIn(gap, tGap, { y: 20 }, { d: 0.3 });
  const gapT = fbAbs(A, tops[3][0] - 350, (tops[0][1] + tops[3][1]) / 2 - 60, '<div style="font:800 72px Sans SC;color:#c2410c;white-space:nowrap">四十多倍</div>');
  fbIn(gapT, tGap + 0.1, { scale: 1.5 }, { d: 0.25, ease: 'back.out(1.6)' });
  sfx('thud', tGap + 0.1, { g: 0.8, p: 0.5 });

  // ── B 没有大公司；用它的人出钱出力；还在出新版；公司放手以后，是他们接住的 ──
  const B = fbSec(pl);
  fbScroll(A, B, T('g3') - 0.4);
  const bld = fbAbs(B, 70, 60, ART.building);
  fbIn(bld, T('g3', '没有') - 0.15, { y: 60 }, { d: 0.35, ease: 'back.out(1.3)' });
  const xx = fbAbs(B, 60, 110, '<svg width="260" height="260" viewBox="0 0 260 260"><path d="M30 30 L230 230 M230 30 L30 230" stroke="#bf0000" stroke-width="22" stroke-linecap="round"/></svg>');
  fbIn(xx, T('g3', '大公司') - 0.05, { scale: 1.6 }, { d: 0.2, ease: 'power4.out' });
  sfx('error', T('g3', '大公司'), { g: 0.6, p: -0.5 });
  const crowd = fbAbs(B, 400, 470, artCrowd(6, 96, -16, 3));
  fbIn(crowd, T('g3', '用它') - 0.15, { y: 120 }, { d: 0.4, ease: 'back.out(1.3)' });
  sfx('pop', T('g3', '用它'), { p: -0.2 });
  const gifts = [];
  [['coin', '出钱', 430], ['coin', '出钱', 560], ['wrench', '出力', 690], ['wrench', '出力', 800]].forEach(([k, w, x], i) => {
    const e = fbAbs(B, x, 380, ART[k].replace(/width="\d+" height="\d+"/, k === 'coin' ? 'width="80" height="54"' : 'width="80" height="80"'));
    fbIn(e, T('g3', w) - 0.05 + (i % 2) * 0.12, { y: 60, scale: 0.5 }, { d: 0.3, ease: 'back.out(2)' });
    sfx('tick', T('g3', w) + (i % 2) * 0.12, { g: 0.6 });
    gifts.push(e);
  });
  const rel = [['5.0', '2024 年 1 月发布', 1040, false, '第五'], ['6.0', '路线图', 1320, true, '第六']];
  const y24 = fbMini(B, 850, 80, '二〇二四年', '1 月');
  fbIn(y24, T('g4', '二') - 0.05, { scale: 1.6, y: -20 }, { d: 0.16, ease: 'power4.out' });
  sfx('tick', T('g4', '二'), { p: 0.5 });
  const relE = rel.map(([v, sub, x, dash, w]) => {
    const e = fbCard(B, x, 70, 250, 200, `<div class="nm" style="font-size:80px;line-height:130px">${v}</div><div class="lab-s" style="text-align:center">${sub}</div>`, dash ? { border: '4px dashed #b5b2ab', background: '#fbfaf8', boxShadow: 'none' } : {});
    fbIn(e, T('g4', w) - 0.1, { y: 120 }, { ease: 'power3.out', d: 0.22 });
    sfx('pop', T('g4', w), { g: 0.7, p: 0.5 });
    return e;
  });
  fbStamp(B, 1340, 286, '已公布', T('g4', '公布'), { small: true, rz: -6 });
  // 公司放手：Borland 松开，标志落下，被下面的人接住
  const hold = fbAbs(B, 520, 0, `<div style="position:relative;width:300px;height:330px"><div class="sheet" style="left:30px;top:0;width:240px;height:84px"><img src="/img/logo-borland.svg" style="position:absolute;left:30px;top:16px;width:180px;height:51px"></div><div data-str="1" style="position:absolute;left:148px;top:84px;width:4px;height:70px;background:#6f6f6f"></div></div>`);
  const logo = fbAbs(B, 560, 150, '<img src="/img/firebird-logo.png" style="width:220px;height:220px;display:block;filter:drop-shadow(0 14px 16px rgba(0,0,0,.35))">');
  const tShow = T('g5') - 0.1, tLet = T('g5', '放手') - 0.05, tCatch = T('g5', '接住') - 0.3;
  [hold, logo].forEach((e) => fbIn(e, tShow, { y: -200 }, { d: 0.4 }));
  to(hold, tLet, { y: -260, autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
  sfx('whoosh', tLet, { g: 0.5 });
  to(logo, tCatch, { y: 116, duration: 0.42, ease: 'bounce.out' });
  sfx('thud', tCatch + 0.3, { g: 0.9 }); sfx('chime', tCatch + 0.36, { g: 0.8 });
  to(crowd, tCatch + 0.3, { y: 12, duration: 0.1, ease: 'power2.out' });
  to(crowd, tCatch + 0.4, { y: 0, duration: 0.3, ease: 'power2.out' });
  gifts.forEach((e) => fbOut(e, tLet));

  // ── C 三个之外，还有这么一个选择；回到火狐 ──
  const C = fbSec(pl);
  fbScroll(B, C, T('g6') - 0.4);
  const peers = [['mysql', 290, 50, 220, 'MySQL'], ['postgresql', 190, 450, 166, 'PostgreSQL'], ['sqlite', 300, 730, 244, 'SQLite']];
  const cards = peers.map(([k, w, x, y, word], i) => {
    const c = fbLogo(C, x, y, k, w);
    fbIn(c, T('g6', word) - 0.1, { y: 70, rotationZ: i % 2 ? 3 : -3 }, { ease: 'back.out(1.5)', d: 0.36 });
    sfx('pop', T('g6', word), { g: 0.7, p: -0.6 + i * 0.3 });
    return c;
  });
  const slot = fbAbs(C, 1140, 130, '<div style="width:400px;height:400px;border:5px dashed #c9c7c1"></div>');
  fbIn(slot, T('g6', '之外') - 0.1, { scale: 0.9 }, { d: 0.3 });
  const fbc = fbLogo(C, 1180, 150, 'firebird', 260, { pad: 30 });
  fbIn(fbc, T('g6b', '选择') - 0.3, { y: -200, rotationZ: 5, z: 120 }, { ease: 'bounce.out', d: 0.5 });
  sfx('thud', T('g6b', '选择'), { g: 0.9 });
  fbOut(slot, T('g6b', '选择') - 0.1);
  // 下回打开火狐：窗口回来，名字回到主人身上
  const tBack = T('g7', '火狐') - 0.3;
  cards.forEach((c) => fbOut(c, tBack, { y: 80 }));
  const br = fbBrowser(C, 80, 60, 900, 560);
  fbIn(br.el, tBack, { x: -260, rotationZ: -3 }, { d: 0.4, ease: 'back.out(1.3)' });
  br.icons([[`<img src="/img/logo-firefox.svg">`, tBack + 0.05]]);
  br.titles([['Mozilla Firefox', tBack + 0.05]]);
  const fx = fbAbs(br.body, 300, 60, '<img src="/img/logo-firefox.svg" style="width:300px;height:300px;display:block">');
  fbIn(fx, tBack + 0.15, { scale: 0.5 }, { d: 0.4, ease: 'back.out(1.6)' });
  sfx('pop', tBack + 0.05, { p: -0.4 });
  const tag = fbAbs(C, 300, 66, fbTag('Firebird'));
  const tFly = T('g7', '以前') - 0.05;
  init(tag, { autoAlpha: 0, z: 200 });
  to(tag, tFly - 0.15, { autoAlpha: 1, duration: 0.15 });
  to(tag, tFly, { x: 1235 - 300, y: 530 - 66, rotationZ: 3, duration: 0.75, ease: 'power2.inOut' });
  sfx('whoosh', tFly, { g: 0.45, p: 0.3 }); sfx('chime', tFly + 0.75, { g: 0.8, p: 0.5 });
  const rings = fbAbs(C, 1010, 0, ''); css(rings, { width: '660px', height: '660px' });
  C.insertBefore(rings, C.firstChild);
  [['#FAAC19', 540], ['#F68A21', 440], ['#EE2B24', 350]].forEach(([c, d], i) => {
    const r = h('div', 'ring', rings); css(r, { left: 330 - d / 2 + 'px', top: 340 - d / 2 + 'px', width: d + 'px', height: d + 'px', background: c });
    const tr = tFly + 0.7 + i * 0.12;
    fbIn(r, tr, { scale: 0.5 }, { d: 0.26, ease: 'back.out(1.6)' });
    sfx('tick', tr, { g: 0.5 + i * 0.1, p: 0.5 });
  });
});
