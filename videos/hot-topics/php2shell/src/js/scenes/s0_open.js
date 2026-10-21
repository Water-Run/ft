// 开场：一排排网站下线 → 首相的帖子 → 「It works!」 → 片名。
// 主画面：一面「网站墙」，卡片一张张被盖上 OFFLINE。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);

  // 第一站：荷兰。四张网站卡片先摆好，随旁白逐张盖章
  const nlHead = h('div', 'abs t-note', world, tr('荷兰 · 10 月 21 日', 'Netherlands · 21 Oct')); px(nlHead, 160, 170);
  const sites = [
    ['DigiD', tr('公民数字身份登录', 'citizen login'), 'o2'],
    ['MijnOverheid', tr('政务门户', 'government portal'), 'o2'],
    ['Tweede Kamer', tr('议会官网', 'House of Representatives'), 'o2'],
    ['NCSC', tr('国家网络安全中心', 'National Cyber Security Centre'), 'o3'],
  ];
  const cards = sites.map(([n, k], i) => {
    const c = h('div', 'card', world, `<div class="k">${k}</div><div class="v">${n}</div>`);
    px(c, 160 + (i % 2) * 820, 250 + Math.floor(i / 2) * 300, 760, 240);
    c.dataset.name = n;
    return c;
  });
  cards.forEach((c, i) => slide(c, s.start + 0.15 + i * 0.12, { y: 40, d: 0.5 }));
  appear(nlHead, s.start + 0.1);
  const stampAt = [T('o2', { zh: '登录', en: 'login' }), T('o2', { zh: '政务', en: 'portal' }), T('o2', { zh: '议会', en: 'House' }), T('o3', { zh: '关掉', en: 'shut' })];
  cards.forEach((c, i) => {
    const st = h('div', 'stamp', world, 'OFFLINE'); px(st, 160 + (i % 2) * 820 + 440, 250 + Math.floor(i / 2) * 300 + 140);
    css(st, { transform: 'rotate(-6deg)' });
    slam(st, stampAt[i], { from: 1.6, d: 0.28 }); sfx('thud', stampAt[i], { g: i === 3 ? 1 : 0.7, p: i % 2 ? 0.4 : -0.4 });
    to(c, stampAt[i], { opacity: 0.45, duration: 0.3 });
  });

  // 第二站：日本首相的帖子（右侧一屏外）
  const jpHead = h('div', 'abs t-note', world, tr('日本 · 同一天', 'Japan · same day')); px(jpHead, 2080, 170);
  const post = h('div', 'post', world, `<div class="who">高市早苗 <span class="dimc">@takaichi_sanae</span></div>
    <div class="ja">皆様に、今夜に対応して頂きたい<br>大至急のお願いです。</div>
    <div class="zh">${tr('「请大家今晚就处理，这是十万火急的请求。」', '“An urgent request for everyone to act on tonight.”')}</div>`);
  px(post, 2080, 250, 1300); post.dataset.name = '首相的帖子';
  const p2 = h('div', 'abs t-body', world, tr('来不及打补丁 → <span class="amber">先把网站停掉</span>', 'Can’t patch in time → <span class="amber">take the site offline</span>')); px(p2, 2080, 700);
  const toJp = Tend('o3') + 0.1;
  appear(jpHead, toJp);
  wipe(post, toJp + 0.3, { dir: 'l', d: 0.5 }); sfx('pop', toJp + 0.3, { p: 0.3 });
  const tonight = h('div', 'abs d-3 amber', world, tr('今晚', 'Tonight')); px(tonight, 3440, 250);
  slam(tonight, T('o5', { zh: '今晚', en: 'tonight' }), { from: 1.5, d: 0.3 }); sfx('thud', T('o5', { zh: '今晚', en: 'tonight' }), { g: 0.6, p: 0.5 });
  slide(p2, Tend('o5') - 0.45, { x: -60, d: 0.4 }); sfx('tick', Tend('o5') - 0.45);

  // 第三站：她自己的网站只剩一行 It works!
  const win = h('div', 'win', world, `<div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span style="margin-left:18px">https://www.sanae.gr.jp/</span></div><div class="body"><div style="font-size:64px;font-weight:700">It works!</div></div>`);
  px(win, 2200, 1340, 1100, 300); win.dataset.name = '浏览器窗口';
  const winNote = h('div', 'abs t-note', world, tr('服务器默认页 · 原因没有公布', 'Server default page · no reason given')); px(winNote, 2200, 1680);
  wipe(win, T('o6a') + 0.2, { dir: 't', d: 0.45 }); sfx('blip', T('o6a') + 0.2);
  show(winNote, T('o6a') + 1.2, { y: 16 });

  // 第四站：两个漏洞 → 片名
  const t1 = h('div', 'abs d-0', world, 'PHP2Shell'); px(t1, 300, 2420); t1.dataset.name = '片名';
  const t0 = h('div', 'abs d-3 red', world, tr('隐藏 14 年的致命 RCE', 'A fatal RCE hidden for 14 years')); px(t0, 310, 2300);
  const tags = h('div', 'abs', world, DATA.cves.map((c) => `<span class="tag red" style="margin-right:24px">${c}</span>`).join('')); px(tags, 310, 2680);
  const lead = h('div', 'abs d-2', world, tr('PHP 的两个漏洞', 'Two flaws in PHP')); px(lead, 310, 2120);
  slide(lead, Tend('o6b') + 0.3, { x: -80, d: 0.5 }); sfx('pop', Tend('o6b') + 0.3);
  slam(t1, T('o8', { zh: '作', en: 'called' }, 0.1), { from: 1.4, d: 0.5 }); sfx('thud', T('o8', { zh: '作', en: 'called' }, 0.15));
  wipe(t0, L.cues.oT.start + 0.1, { dir: 'l', d: 0.4 }); sfx('error', L.cues.oT.start + 0.1, { g: 0.6 });
  slide(tags, T('o7', { zh: '两个', en: 'two' }), { y: 30 }); sfx('tick', T('o7', { zh: '两个', en: 'two' }));

  const toWin = Tend('o6') + 0.2, toTitle = Tend('o6b') + 0.1;
  cam.track(s.start, { x: 960, y: 560, z: 1.06 }, [
    [s.start + 0.1, { z: 1 }, toJp - s.start - 0.2, { ease: 'none', sfx: false }],
    [toJp, { x: 2860, y: 560, z: 1 }, 0.9],
    [null, { x: 2960, z: 1.08 }, toWin - toJp - 1.1, { ease: 'none', sfx: false }],
    [toWin, { x: 2750, y: 1500, z: 1.15 }, 0.9, { sfx: false }],
    [null, { x: 2780, z: 1.24 }, toTitle - toWin - 1.1, { ease: 'none', sfx: false }],
    [toTitle, { x: 1120, y: 2460, z: 1 }, 1.0],
    [null, { x: 1180, z: 1.12 }, s.end - toTitle - 1.2, { ease: 'none', sfx: false }],
  ]);
});
