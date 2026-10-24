// 它是什么：一盘磁带走过三个年份。1995 第一版 → 2006 RFC 4253 → 今天的 OpenSSH。
scene('what', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const X = [960, 2880, 4800];
  // 一条磁带横贯三站，带上有刻度
  const tape = blk(world, 'bg-chassis', 0, 812, 5800, 26); tape.dataset.name = 'tape';
  for (let x = 40; x < 5800; x += 80) blk(world, 'cell', x, 820, 40, 10);
  // 第 1 站：磁带盒，两只八角卷盘按 12 帧一步转
  const cas = blk(world, 'mod', 120, 250, 640, 420); cas.dataset.name = 'cassette';
  const lab = blk(cas, 'bg-paper', 30, 30, 568, 120);
  { const pl = txt(lab, 'plate', 'SSH', 16, 14); pl.style.background = 'var(--chassis)'; pl.style.color = 'var(--paper)'; }
  txt(lab, 'term', '1995', 16, 62).style.color = 'var(--ink)';
  stripe(cas, 30, 150, 568);
  const win = blk(cas, 'bg-ink', 120, 190, 388, 150);
  const reels = [];
  for (const cx of [190, 438]) {
    const g = svg('svg', { class: 'abs', width: 120, height: 120, viewBox: '-60 -60 120 120' }, cas); px(g, cx - 60, 205);
    const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; pts.push((Math.cos(a) * 56).toFixed(1) + ',' + (Math.sin(a) * 56).toFixed(1)); }
    svg('polygon', { points: pts.join(' '), fill: 'var(--paper)' }, g);
    for (let i = 0; i < 3; i++) svg('rect', { x: -6, y: -40, width: 12, height: 24, fill: 'var(--chassis)', transform: `rotate(${i * 120})` }, g);
    svg('rect', { x: -14, y: -14, width: 28, height: 28, fill: 'var(--chassis)' }, g);
    g.dataset.name = 'reel'; reels.push(g);
  }
  let lastR = null;
  F((t) => { const r = Math.floor(clamp(t - s.start, 0, 60) / STEP) * 30; if (r !== lastR) { reels.forEach((g) => { g.style.transform = `rotate(${r}deg)`; }); lastR = r; } });
  screws(cas, 628, 408, 6);
  // 年份读数（机械计数器）
  const counter = (x, y, text) => {
    const box = blk(world, 'bg-ink', x, y, 0, 0); box.style.border = '8px solid var(--chassis)'; box.style.padding = '8px 24px';
    box.style.width = 'auto'; box.style.height = 'auto';
    const n = txt(box, 'big', text, 0, 0); n.style.position = 'relative'; n.style.fontSize = '220px';
    return box;
  };
  const y1 = counter(860, 150, '1995');
  const who = txt(world, 'big', 'Tatu Ylonen', 880, 460); who.style.fontSize = '96px'; who.style.color = 'var(--paper)';
  const first = txt(world, 'cap-zh ac', tr('公开了第一个版本', 'published the first version'), 884, 580); first.style.fontSize = '52px'; first.style.fontWeight = 700;
  const src1 = txt(world, 'term d', 'RFC 4253 §15.2 · NOVEMBER 1995', 884, 670); src1.style.fontSize = '32px';
  const t1 = T('s10') - 0.05;
  hop(cas, s.start + 0.15, { x: -120, d: 0.4 }); sfx('thud', s.start + 0.2, { g: 0.6, p: -0.5 });
  flick(y1, Q(T('s10', '1995'))); sfx('drive', Q(T('s10', '1995')), { g: 0.5 });
  flick(who, T('s10', 'Tatu') - 0.05); sfx('tick', T('s10', 'Tatu') - 0.05, { g: 0.6 });
  flick(first, T('s10', 'Tatu') + 0.1); flick(src1, T('s10', 'Tatu') + 0.4);
  // 第 2 站：RFC 4253 的纸页
  const y2 = counter(X[1] - 860, 150, '2006');
  const page = fileCard(world, X[1] - 120, 150, 940, 620, 'RFC 4253');
  const rl = [
    ['Request for Comments: 4253', 76], ['Standards Track', 120], ['January 2006', 164],
    ['The Secure Shell (SSH)', 260], ['Transport Layer Protocol', 304],
  ];
  const rEls = rl.map(([s_, y]) => cardLine(page, s_, 36, y));
  rEls[3].style.fontSize = rEls[4].style.fontSize = '44px';
  const zh2 = txt(page, 'lz', tr('传输层协议 · 标准文档', 'transport layer · a standard'), 36, 400); zh2.style.fontSize = '40px';
  const zh2b = txt(page, 'lz', tr('编号 RFC 4253', 'number RFC 4253'), 36, 470); zh2b.style.fontSize = '36px'; zh2b.style.fontWeight = 400;
  const tP = T('s11') - 0.1;
  flick(y2, Q(T('s11', '2006'))); sfx('drive', Q(T('s11', '2006')), { g: 0.5 });
  hop(page, tP + 0.2, { y: 80, d: 0.4 }); sfx('pop', tP + 0.2, { g: 0.7, p: 0.3 });
  rEls.forEach((e, i) => line(e, tP + 0.5 + i * 0.12, { sfx: i === 0, g: 0.4 }));
  flick(zh2, T('s11', '传输层')); sfx('tick', T('s11', '传输层'), { g: 0.6 });
  flick(zh2b, T('s11', 'RFC 4253'));
  // 第 3 站：今天的 OpenSSH
  const y3 = counter(X[2] - 860, 150, tr('今天', 'TODAY'));
  y3.firstChild.style.fontSize = LANG === 'zh' ? '200px' : '220px';
  const osh = txt(world, 'big', 'OpenSSH', X[2] - 40, 170); osh.style.fontSize = '170px';
  const q = txt(world, 'term p', '"developed by a few developers\n of the OpenBSD Project"', X[2] - 36, 360); q.style.fontSize = '40px';
  const zh3 = txt(world, 'cap-zh ac', tr('由 OpenBSD 项目的开发者维护', 'maintained by OpenBSD project developers'), X[2] - 36, 480); zh3.style.fontSize = '48px'; zh3.style.fontWeight = 700;
  const src3 = txt(world, 'term d', 'OPENSSH.COM', X[2] - 36, 560); src3.style.fontSize = '32px';
  const ssh = txt(world, 'term', '<span class="p">&gt;</span> ssh', X[2] - 36, 640); ssh.style.fontSize = '64px';
  flick(y3, Q(T('s12', '今天')) - 0.1); sfx('drive', Q(T('s12', '今天')) - 0.1, { g: 0.5 });
  flick(ssh, T('s12', 'ssh') - 0.1); sfx('key', T('s12', 'ssh') - 0.1);
  slam(osh, T('s12', '程序'), { from: 1.12, d: 0.3, ease: 'steps(3)' }); sfx('thud', T('s12', '程序'), { g: 0.8, p: 0.3 });
  flick(q, T('s12', '程序') + 0.3);
  flick(zh3, T('s12b') - 0.1); sfx('tick', T('s12b') - 0.1, { g: 0.6 });
  flick(src3, T('s12b') + 0.4);
  camPath(cam, s, { x: X[0], y: 484, z: 1.04 }, [
    [s.start + 0.05, { z: 1 }, Math.max(0.6, Tend('s10') - s.start - 0.1), { ease: 'none', sfx: false }],
    [Tend('s10') + 0.6, { x: X[1], z: 1 }, 0.9, { ease: 'power3.inOut', sfx: false }],
    [Tend('s11') + 0.4, { x: X[2], z: 1 }, 0.9, { ease: 'power3.inOut', sfx: false }],
  ]);
  sfx('whoosh', Tend('s10') + 0.6, { g: 0.35 }); sfx('whoosh', Tend('s11') + 0.4, { g: 0.35 });
});
