// 01 Git 怎么用：一个仓库（文件 + 一条修改历史）在原地长出分支、合并回去；改动打成包推送给服务器，同事再拉取。
// 最后服务器上的仓库胀成「巨型主仓库」，带进下一章。
scene('git', ({ root, s, c0 }) => {
  sceneBg(root, 'n');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);

  // 仓库：左侧大框
  const repo = h('div', 'abs', world); px(repo, 150, 150, 880, 370);
  css(repo, { border: '4px solid var(--ink)', borderRadius: '16px', background: '#fff' }); repo.dataset.name = '仓库';
  const rl = h('div', 'chip', world, '仓库'); px(rl, 180, 126);
  const rg = h('div', 'abs t-small', world, 'repository：代码 + 全部修改历史'); px(rg, 196, 462); rg.dataset.gloss = '仓库';
  const files = h('div', 'abs mono', world, 'src/\ndocs/\nREADME.md'); px(files, 200, 230); css(files, { fontSize: '32px', lineHeight: '1.6' });
  // 历史：主线 6 个点
  const Y0 = 300, Y1 = 430, XS = [470, 560, 650, 740, 830, 920];
  const mainLine = h('div', 'abs', world); px(mainLine, XS[0], Y0 - 2, XS[5] - XS[0], 5); css(mainLine, { background: 'var(--ink)', transformOrigin: '0 50%' });
  const dots = XS.map((x, i) => { const d = h('div', 'abs', world); px(d, x - 15, Y0 - 15, 30, 30); css(d, { borderRadius: '50%', background: i < 4 ? 'var(--ink)' : '#fff', border: '5px solid var(--ink)' }); return d; });
  const hist = h('div', 'abs t-small', world, '修改历史'); px(hist, XS[0] - 10, Y0 - 62);

  const t1 = T('g1', '代码');
  wipe(repo, c0 + 0.05, { dir: 'l', d: 0.5 }); sfx('whoosh', c0 + 0.05, { g: 0.3 });
  show(files, t1, { x: -20 });
  fromTo(mainLine, T('g1', '历史') - 0.2, { scaleX: 0 }, { scaleX: 0.6, duration: 0.6, ease: 'power2.out', immediateRender: true });
  dots.slice(0, 4).forEach((d, i) => slam(d, T('g1', '历史') - 0.2 + i * 0.12, { from: 1.6, d: 0.3 }));
  show(hist, T('g1', '历史'), { y: 8 });
  slam(rl, T('g1', '仓库'), { from: 1.2 }); sfx('pop', T('g1', '仓库'));
  show(rg, T('g1', '仓库') + 0.2, { x: -10 });

  // 分支：从第 3 个点分出，两点，再合并回第 6 个点
  const bsvg = (d, t, dur) => { const p = path(ov, d, 'accent', { w: 5, arrow: false }); draw(p, t, dur); return p; };
  const tB = T('g2', '分支');
  bsvg(`M${XS[2]},${Y0} C${XS[2] + 40},${Y1} ${XS[3] - 40},${Y1} ${XS[3]},${Y1} L${XS[4]},${Y1}`, tB - 0.3, 0.6);
  const bd = [XS[3], XS[4]].map((x, i) => { const d = h('div', 'abs', world); px(d, x - 15, Y1 - 15, 30, 30); css(d, { borderRadius: '50%', background: 'var(--blue)' }); slam(d, tB + i * 0.15, { from: 1.6, d: 0.3 }); return d; });
  sfx('pop', tB);
  const bl = h('div', 'abs t-small', world, 'branch'); px(bl, XS[3] - 20, Y1 + 24); bl.dataset.gloss = '分支'; bl.style.color = 'var(--blue)';
  show(bl, tB + 0.2, { y: 8 });
  const tM = T('g3', '合并');
  bsvg(`M${XS[4]},${Y1} C${XS[4] + 50},${Y1} ${XS[5] - 30},${Y0 + 60} ${XS[5]},${Y0}`, tM - 0.35, 0.45);
  to(mainLine, tM - 0.4, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
  slam(dots[4], tM - 0.35, { from: 1.4, d: 0.3 }); slam(dots[5], tM, { from: 1.6, d: 0.3 }); sfx('thud', tM + 0.05, { g: 0.5 });
  to(dots[5], tM + 0.2, { backgroundColor: '#1f5fd6', borderColor: '#1f5fd6', duration: 0.3 });
  const ml = h('div', 'abs t-small', world, 'merge'); px(ml, XS[5] - 28, Y0 + 70); ml.dataset.gloss = '合并'; ml.style.color = 'var(--blue)';
  show(ml, tM + 0.2, { y: 8 });

  // 推送与拉取：右侧服务器、下方两台电脑
  const me = node(world, 590, 640, '你');
  const mate = node(world, 1600, 690, '同事');
  const srv = server(world, 1420, 250, 360, 170, '服务器', '仓库的一份');
  show(me, c0 + 0.3, { y: 20 });
  const tP = T('g4', '推送');
  wipe(srv, T('g4', '打成包') - 0.2, { dir: 't', d: 0.4 });
  packet(world, '', 660, 640, 1440, 420, T('g4', '打成包'), tP - T('g4', '打成包') + 0.3, { name: '改动的包', fadeAt: tP + 0.75 });
  const pa = line(ov, 680, 640, 1400, 430, tP - 0.1, 'accent', { w: 4, d: 0.5 });
  const pl = h('div', 'abs mono blue', world, 'git push'); px(pl, 1060, 424); pl.style.fontSize = '30px'; pl.dataset.gloss = '推送';
  show(pl, tP + 0.1, { y: 10 }); sfx('whoosh', tP, { g: 0.35 });
  const tF = T('g5', '拉取');
  show(mate, T('g5', '别人'), { y: 20 });
  packet(world, '', 1600, 440, 1600, 630, tF - 0.25, 0.5, { name: '拉取的包', fadeAt: tF + 0.7 });
  const fa = line(ov, 1600, 430, 1600, 660, tF - 0.2, 'accent', { w: 4, d: 0.4 });
  const fl = h('div', 'abs mono blue', world, 'git fetch'); px(fl, 1630, 520); fl.style.fontSize = '30px'; fl.dataset.gloss = '拉取';
  show(fl, tF + 0.1, { x: -10 }); sfx('pop', tF);

  // 巨型主仓库：服务器上的仓库胀大，左边的示意退淡
  const tBig = T('g6', '巨型');
  const bigA = h('div', 'abs', world); px(bigA, 160, 150, 760, 640);
  css(bigA, { border: '6px solid var(--ink)', borderRadius: '18px', background: '#fff', overflow: 'hidden' }); bigA.dataset.name = '巨型主仓库';
  for (let i = 0; i < 15; i++) { const r = h('div', 'abs', bigA); css(r, { left: '0', right: '0', top: (100 + i * 36) + 'px', height: '18px', background: '#e9e8e3' }); }
  const bigAL = brand(world, 'anthropic', 200, 182, 30, '主仓库', "700 56px 'Serif SC'", { color: '#141413', name: 'Anthropic 主仓库' });
  const big = h('div', 'abs', world); px(big, 1000, 150, 760, 640);
  css(big, { border: '6px solid var(--ink)', borderRadius: '18px', background: '#fff', overflow: 'hidden' });
  for (let i = 0; i < 15; i++) { const r = h('div', 'abs', big); css(r, { left: '0', right: '0', top: (100 + i * 36) + 'px', height: '18px', background: '#e9e8e3' }); }
  big.dataset.name = '巨型主仓库';
  const bigL = brand(world, 'openai', 1040, 180, 50, '主仓库', "700 56px 'Sans SC'", { color: '#000', name: 'OpenAI 主仓库' });
  const bigN = h('div', 'abs t-note', world, 'Anthropic：main 分支的历史<br>就有近 100 GB'); px(bigN, 200, 660); css(bigN, { whiteSpace: 'normal', width: '520px', color: 'var(--ink)' });
  hide([repo, rl, rg, files, mainLine, hist, bl, ml, pl, fl, me, mate, ...dots, ...bd], tBig - 0.6, { d: 0.4 });
  to(ov, tBig - 0.6, { opacity: 0, duration: 0.4 });
  hide(srv, tBig - 0.3, { d: 0.25 });
  fromTo(big, tBig - 0.3, { autoAlpha: 0, scale: 0.55, transformOrigin: '50% 30%' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out', immediateRender: true });
  fromTo(bigA, tBig - 0.15, { autoAlpha: 0, scale: 0.55, transformOrigin: '50% 30%' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out', immediateRender: true });
  show(bigAL, tBig + 0.25, { y: 10 });
  sfx('thud', tBig + 0.2, { g: 0.6 });
  show(bigL, tBig + 0.1, { y: 10 }); show(bigN, tBig + 0.5, { y: 10 });

  drift(cam, s, -1);
});
