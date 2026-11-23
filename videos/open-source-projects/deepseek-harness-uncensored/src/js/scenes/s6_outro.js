// 结尾：f1 一张 3D 的 GitHub 仓库卡片（许可 GPL-3.0-or-later）；f2–f4 Release 的四个平台安装包在 3D 里立成一排，逐个亮起；
// f4a 卡片翻成「语言」与打包命令：DSH 的代码绝大部分是 TypeScript，照打包指南一条命令就能自己出包；f6 一切退到景深里，标志与标语回到中央。
scene('outro', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  stageBg(world, 'def');
  const floor = h('div', 'floor', world); floor.style.top = '760px'; floor.style.setProperty('--mc', MC.def);
  set(floor, s.start, { autoAlpha: 0 }); fadeIn(floor, s.start + 0.6, { y: 0, d: 0.8 });

  // f1：仓库卡片
  const repo = h('div', 'card3d', world); px(repo, 360, 180, 1200, 420); css(repo, { padding: '44px 54px', fontSize: '28px' });
  // 仓库卡片：GitHub 标志、Water-Run 的头像（GitHub 公开头像，策划者 2026-11-23 要求），后面是仓库名
  repo.innerHTML = `<div style="display:flex;gap:18px;align-items:center;font-size:40px">${LOGO.github(56)}<span class="av" style="margin-left:6px"></span><span style="color:#5d626b">Water-Run /</span><b>deepseek-harness-uncensored</b></div>
    <div style="margin-top:22px;color:#3b3f46;font-size:32px">更自由的探索未至之境.</div>
    <div style="display:flex;gap:16px;margin-top:40px"><span class="chip lic" style="font-size:28px;padding:10px 22px;background:#e9efff;color:#1d4ed8">${icon('book')} GPL-3.0-or-later</span></div>`;
  rasterImg(repo.querySelector('.av'), 'design/assets/water-run-avatar.jpg', 52, { borderRadius: '50%', boxShadow: '0 0 0 1px rgba(31,35,41,.15)' });
  repo.dataset.name = 'GitHub 仓库卡片';
  rise3d(repo, s.start + 0.1, { rx: 26, ry: -14, z: 700, y: 80, d: 1.1 }); sfx('whoosh', s.start + 0.1, { g: 0.6 });
  const lic = repo.querySelector('.lic');
  fromTo(lic, T('f1', 'GPL-3.0-or-later') - 0.1, { scale: 1 }, { scale: 1.12, duration: 0.25, ease: 'power2.out', immediateRender: false });
  fromTo(lic, T('f1', 'GPL-3.0-or-later') + 0.15, { scale: 1.12 }, { scale: 1, duration: 0.35, ease: 'power2.inOut', immediateRender: false }); sfx('pop', T('f1', 'GPL-3.0-or-later'));
  fromTo(repo, T('f1', 'GitHub') - 0.2, { rotationY: 0 }, { rotationY: 8, duration: 1.4, ease: 'sine.inOut', immediateRender: false });
  // f2：仓库卡片翻到一边，Release 的四个安装包立成一排
  const tR = T('f2') - 0.3;
  tl.fromTo(repo, { rotationY: 8, x: 0, z: 0, autoAlpha: 1 }, { rotationY: 70, x: -700, z: -600, autoAlpha: 0, duration: 0.8, ease: 'power3.in', immediateRender: false }, tR);
  const head = h('div', 'abs', world); px(head, 0, 150, 1920); css(head, { textAlign: 'center', color: 'var(--ink)', fontSize: '40px', fontWeight: '700' });
  head.innerHTML = `<span style="color:#4a4f58;font-weight:400">GitHub Release · </span>安装包`;
  fadeIn(head, tR + 0.35, { y: 16 });
  // 包格式只画有出处的：Linux x64 出 .deb 与 .rpm（策划者 2026-11-23，FACTS F32）
  const plats = [['windows', 'Windows', 'x64'], ['linux', 'Linux', 'x64', ['.deb', '.rpm']], ['linux', 'Linux', 'ARM64'], ['apple', 'macOS', 'ARM64']];
  const PW = 330, PG = 40, PX0 = 960 - (4 * PW + 3 * PG) / 2;
  const tiles = plats.map(([ic, os, arch, fmts], i) => {
    const c = h('div', 'card3d', world); px(c, PX0 + i * (PW + PG), 300, PW, 420); css(c, { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', '--c': '#5b616d' });
    c.innerHTML = `<div style="color:var(--c);height:110px">${LOGO[ic](ic === 'windows' ? 96 : 110)}</div><div style="font:700 44px Inter">${os}</div><div style="font:600 34px Inter;color:#5d626b">${arch}</div>${fmts ? `<div class="fmts" style="display:flex;gap:12px">${fmts.map((f) => `<span class="mono" style="font-size:24px;padding:4px 14px;border-radius:10px;border:1px solid var(--line);color:#3b3f46;background:#f4f5f7">${f}</span>`).join('')}</div>` : ''}`;
    c.dataset.name = `${os} ${arch}`;
    tl.fromTo(c, { autoAlpha: 0, rotationX: 60, z: -500, y: 120, transformPerspective: P3 }, { autoAlpha: 1, rotationX: 10, rotationY: (i - 1.5) * -8, z: 0, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, tR + 0.5 + i * 0.1);
    return c;
  });
  // f3、f4：念到哪个平台，哪块亮起、往前立正
  const hits = [['f3', 'Windows'], ['f3', 'Linux x64'], ['f4', 'Linux ARM64'], ['f4', 'macOS']];
  hits.forEach(([id, w], i) => {
    const t = T(id, w) - 0.1;
    fromTo(tiles[i], t, { '--c': '#5b616d', rotationX: 10, rotationY: (i - 1.5) * -8, z: 0 }, { '--c': MC.def, rotationX: 0, rotationY: 0, z: 60, duration: 0.45, ease: 'back.out(1.6)', immediateRender: false });
    sfx('pop', t + 0.05, { g: 0.6 });
  });
  const fm = tiles[1].querySelector('.fmts'); set(fm, s.start, { autoAlpha: 0 }); fadeIn(fm, T('f3', 'Linux x64') + 0.2, { y: 10, d: 0.35 });
  // f4a：安装包退下，换成语言占比与一条打包命令
  const tL = T('f4a') - 0.35;
  tiles.forEach((c, i) => sink3d(c, tL + i * 0.05, { d: 0.5 })); fadeOut(head, tL, { d: 0.3 });
  const lang = h('div', 'card3d', world); px(lang, 260, 220, 1400, 470); css(lang, { padding: '40px 50px', fontSize: '28px' });
  lang.innerHTML = `<div style="color:#5d626b;font-size:26px">deepseek-ai/deepseek-harness · 语言</div>
    <div style="display:flex;height:22px;border-radius:11px;overflow:hidden;margin-top:18px"><i class="ts" style="background:#3178c6;width:95.2%"></i><i style="background:#563d7c;width:1.3%"></i><i style="background:#3572A5;width:1.1%"></i><i style="background:#f1e05a;width:0.7%"></i><i style="background:#6b7079;flex:1"></i></div>
    <div style="display:flex;gap:30px;margin-top:14px;font-size:26px"><span><b style="color:#3178c6">●</b> TypeScript <b>95.2%</b></span><span style="color:#5d626b">CSS · Python · JavaScript · 其他</span></div>
    <div class="term" style="margin-top:40px;background:#0d1017;color:#e6e8ec;border-radius:16px;padding:22px 28px;font:26px/1.6 Mono;white-space:pre"></div>`;
  lang.dataset.name = '语言与打包';
  rise3d(lang, tL + 0.3, { rx: 22, ry: 10, z: 600, d: 0.9 }); sfx('whoosh', tL + 0.3, { g: 0.5 });
  const ts = lang.querySelector('.ts');
  fromTo(ts, T('f4a', 'TypeScript') - 0.2, { width: '0%' }, { width: '95.2%', duration: 0.8, ease: 'power3.out' });
  const term = lang.querySelector('.term');
  const cmd = 'pnpm --dir apps/desktop run package:win:x64:unsigned';
  const tC = T('f4a', 'TypeScript') + 0.7;
  inputTrack(term, '<span style="color:#7dd3a0">$</span> ', [[tC, 'type', cmd, { cps: 34, pre: '<span style="color:#7dd3a0">$</span> ', cursorUntil: tC + 1.9 }]]);
  // f6：一切退到景深里，标志与标语回到中央
  const tE = T('f6') - 0.5;
  sink3d(lang, T('f6') - 0.25, { d: 0.6 });
  const L = h('div', 'abs', world); px(L, 960 - 170, 210); shadowPlate(L, 340, 1, '0 40px 90px rgba(0,0,0,.65), 0 0 140px rgba(37,99,235,.3)'); logoDark(340, L); L.dataset.name = 'DSHU 标志';
  rise3d(L, tE + 0.3, { rx: 0, ry: -30, z: 500, y: 0, d: 1.1 });
  const ttl = h('div', 'title', world, '<div class="n" style="color:var(--ink);font-size:64px">DeepSeek Harness <span class="u" style="font-size:52px">UNCENSORED</span></div>'); ttl.style.top = '600px';
  fadeIn(ttl, T('f6', 'De') - 0.15, { y: 16, d: 0.6 });   // f6 先念全名，名字跟着出现
  const sl = h('div', 'title', world, '<div style="color:#2f333a;font-size:40px;letter-spacing:10px">更自由的探索未至之境</div>'); sl.style.top = '700px';
  set(sl, s.start, { autoAlpha: 0 }); wipe(sl, T('f6', '更') - 0.1, { dir: 'l', d: 1.2 }); sfx('chime', T('f6', '更') + 0.2, { g: 0.5 });
  // fT：标志极慢地转回正面
  fromTo(L, T('fT'), { rotationY: 0 }, { rotationY: 6, duration: s.end - T('fT'), ease: 'sine.inOut', immediateRender: false });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.5, tR - 0.1, 1), [tR, { x: 960 }, 0.6, { sfx: false }], drift(tR + 0.8, s.end, 1)]);
});
