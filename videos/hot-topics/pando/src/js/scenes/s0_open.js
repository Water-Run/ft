// 开场：一条时间轴，左边 10 月 13 日 Anthropic、右边 11 月 2 日 OpenAI，两家的主仓库都指向中间的 Git。
// 旁白先讲 OpenAI（右），再回到三周前的 Anthropic（左）；最后两条箭头标出「换掉」「留下」，片名留在下方。
scene('open', ({ root, s }) => {
  sceneBg(root, 'n');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const LX = 520, RX = 1400, TY = 236;

  // 时间轴：开场即画出
  const axis = h('div', 'abs', world); px(axis, LX, TY, RX - LX, 4); axis.style.background = '#c9c9c4'; axis.style.transformOrigin = '0 50%';
  fromTo(axis, s.start + 0.05, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: true }); sfx('whoosh', s.start + 0.05, { g: 0.35 });
  const dot = (x) => { const d = h('div', 'abs', world); px(d, x - 14, TY - 12, 28, 28); css(d, { borderRadius: '50%', background: 'var(--ink)' }); return d; };
  const dR = dot(RX), dL = dot(LX);
  const dateR = h('div', 'abs mono', world, '11-02'); px(dateR, RX - 62, TY - 74); dateR.style.fontSize = '36px';
  const dateL = h('div', 'abs mono', world, '10-13'); px(dateL, LX - 62, TY - 74); dateL.style.fontSize = '36px';
  const gap = h('div', 'abs t-note', world, '相隔 20 天'); px(gap, 960, TY + 20); gap.style.transform = 'translateX(-50%)';

  // 右：OpenAI 与 Pando
  const nameR = h('div', 'abs d-2', world, 'OpenAI'); px(nameR, RX, 300); nameR.style.transform = 'translateX(-50%)'; nameR.style.fontFamily = 'Inter';
  const madeR = h('div', 'abs t-note', world, '做出 ChatGPT'); px(madeR, RX, 400); madeR.style.transform = 'translateX(-50%)';
  const pando = server(world, RX - 200, 470, 400, 130, 'Pando', '新的 Git 服务器');
  // 左：Anthropic 与主仓库
  const nameL = h('div', 'abs d-2 serif', world, 'Anthropic'); px(nameL, LX, 300); nameL.style.transform = 'translateX(-50%)'; nameL.style.fontWeight = '700';
  const madeL = h('div', 'abs t-note', world, '做出 Claude'); px(madeL, LX, 400); madeL.style.transform = 'translateX(-50%)';
  const repoL = server(world, LX - 200, 470, 400, 130, '主代码仓库', '');
  const tagGit = h('div', 'abs mono', repoL, 'Git'); css(tagGit, { position: 'relative', fontSize: '26px', opacity: 0.8, marginTop: '4px' });
  const tagScion = h('div', 'abs', world, 'Scion'); px(tagScion, LX - 40, 552); css(tagScion, { font: '700 26px Inter', color: 'var(--paper)' });

  const tR = T('o1'), tOpen = T('o1', 'OpenAI'), tPando = T('o1', 'Pando');
  appear(dR, tR); appear(dateR, tR); sfx('tick', tR, { g: 0.5 });
  slam(nameR, tOpen, { from: 1.15 }); sfx('thud', tOpen + 0.1, { g: 0.6 });
  wipe(pando, tPando, { dir: 'l', d: 0.45 }); sfx('pop', tPando);
  const tSrv = T('o2', '服务器');
  fromTo(pando.querySelector('.sub'), tSrv - 0.3, { autoAlpha: 0 }, { autoAlpha: 0.75, duration: 0.3, immediateRender: true });

  const tL = T('o3', '三周'), tAnt = T('o3', 'Anthropic');
  appear(dL, tL); appear(dateL, tL); show(gap, tL + 0.1, { y: 10 }); sfx('tick', tL, { g: 0.5 });
  slam(nameL, tAnt, { from: 1.15 }); sfx('thud', tAnt + 0.1, { g: 0.6 });
  wipe(repoL, T('o4', '主代码'), { dir: 'r', d: 0.45 });
  const tLeave = T('o4', '离开');
  to(tagGit, tLeave, { y: 60, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }); sfx('whoosh', tLeave, { g: 0.3 });
  show(tagScion, Tend('o4') - 0.2, { y: 10, d: 0.35 });

  show(madeR, T('o5', 'ChatGPT'), { y: 12 });
  show(madeL, T('o5', 'Claude'), { y: 12 });

  // 中间：Git
  const git = h('div', 'abs', world, 'Git'); px(git, 960 - 160, 700, 320, 130);
  css(git, { border: '6px solid var(--ink)', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 72px Inter' });
  git.dataset.name = 'Git';
  const tSame = T('o6', '同一样');
  show(git, s.start + 0.5, { y: 0, a: 0.22, d: 0.6 });                     // 主角一开始就在，淡淡的
  fromTo(git, tSame, { opacity: 0.22, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false }); sfx('thud', tSame + 0.12);
  const aL = line(ov, LX + 60, 610, 830, 708, tSame - 0.35, 'ink', { w: 5, d: 0.4 });
  const aR = line(ov, RX - 60, 610, 1090, 708, tSame - 0.35, 'ink', { w: 5, d: 0.4 });
  const age = h('div', 'abs t-note', world, '20 多年'); px(age, 960, 842); age.style.transform = 'translateX(-50%)';
  show(age, T('o7', '二十多年'), { y: 10 });

  // 问题与片名
  const title = h('div', 'abs d-3', world, '为什么 AI 巨头都在重造 Git？'); px(title, 960, 866); title.style.transform = 'translateX(-50%)';
  const tWhy = T('o8', '重造');
  hide(age, tWhy - 0.4, { d: 0.25 });
  wipe(title, tWhy - 0.2, { dir: 'l', d: 0.5 }); sfx('whoosh', tWhy - 0.2, { g: 0.4 });
  const lbL = h('div', 'chip', world, '换掉'); px(lbL, 600, 626); lbL.style.background = 'var(--red)';
  const lbR = h('div', 'chip', world, '留下'); px(lbR, 1222, 626); lbR.style.background = 'var(--blue)';
  slam(lbL, T('o9', '换掉'), { from: 1.3 }); sfx('pop', T('o9', '换掉'));
  slam(lbR, T('o9', '留下'), { from: 1.3 }); sfx('pop', T('o9', '留下'));

  drift(cam, s, 1);
});
