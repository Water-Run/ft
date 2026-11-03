// 05 为什么都在重造：回到开场的左右两栏（左 Anthropic、右 OpenAI）。
// 先用两家自己的原话说明它们为什么最先撞墙，再标出路线的不同；中间那条「总队伍」被拆掉、共同的缓存亮起；
// 下方一行写对普通开发者的影响；最后收在信息截止时间。
scene('why', ({ root, s, c0 }) => {
  sceneBg(root, 'n');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const LX = 520, RX = 1400;
  const nL = h('div', 'abs serif', world, 'Anthropic'); px(nL, LX, 120); css(nL, { font: '700 60px "Serif SC"', transform: 'translateX(-50%)' });
  const nR = h('div', 'abs', world, 'OpenAI'); px(nR, RX, 120); css(nR, { font: '800 60px Inter', transform: 'translateX(-50%)' });
  const tBack = T('w1', '开头');
  slide(nL, c0 + 0.05, { x: -60, d: 0.45 }); slide(nR, c0 + 0.12, { x: 60, d: 0.45 }); sfx('whoosh', c0 + 0.05, { g: 0.35 });
  const vs = h('div', 'abs', world); px(vs, 958, 120, 4, 300); vs.style.background = '#c9c9c4'; show(vs, tBack, { y: 0 });

  const askQ = h('div', 'abs d-2', world, '为什么偏偏是这两家？'); px(askQ, 960, 470); askQ.style.transform = 'translateX(-50%)';
  wipe(askQ, T('w1', '为什么') - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', T('w1', '为什么') - 0.1, { g: 0.35 });
  hide(askQ, T('w2') - 0.1, { d: 0.3 });
  // 原话：英文原文 + 中文
  const quote = (x, en, zh, t) => {
    const c = h('div', 'card', world, `<div style="font:500 27px Inter;color:#5d626b;line-height:1.35">“${en}”</div><div style="font:700 34px 'Sans SC';margin-top:12px;line-height:1.35">${zh}</div>`);
    px(c, x, 220); css(c, { width: '760px' }); show(c, t, { y: 16, d: 0.45 }); sfx('pop', t, { g: 0.5 });
    return c;
  };
  const qL = quote(140, 'Anthropic uses Claude to write software far more than almost any other company.', '用 Claude 写软件的量，远超几乎任何公司', T('w2') + 0.1);
  const hlL = h('div', 'abs', world); px(hlL, 158, 330, 728, 52); css(hlL, { background: 'rgba(31, 95, 214, 0.16)', borderRadius: '6px', transformOrigin: '0 50%' }); hlL.dataset.overlapOk = '';
  fromTo(hlL, T('w2', '比几乎') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out', immediateRender: true });
  to(hlL, T('w11') - 0.3, { opacity: 0, duration: 0.4 });
  const qLn = h('div', 'abs t-small', world, '所以常常最先发现：为人的规模设计的工具在哪里吃紧'); px(qLn, 150, 450); css(qLn, { whiteSpace: 'normal', width: '740px' });
  show(qLn, T('w3', '最先'), { y: 8 });
  const qR = quote(1020, 'Codex has changed the scale and pace of development at OpenAI.', 'Codex 改变了 OpenAI 开发软件的规模和速度', T('w4', 'Codex') - 0.3);

  // 路线不同
  const tDiff = T('w5');
  hide(qLn, tDiff - 0.3, { d: 0.25 });
  const cR = h('div', 'chip', world, '问题在服务器 → 换掉服务器'); px(cR, 1020, 470); cR.style.background = 'var(--blue)';
  const cL = h('div', 'chip', world, '问题在 Git 的离线前提 → 换掉 Git'); px(cL, 140, 470); cL.style.background = 'var(--red)';
  slam(cR, T('w5', '服务器'), { from: 1.2 }); sfx('pop', T('w5', '服务器'));
  slam(cL, T('w5', '离线'), { from: 1.2 }); sfx('pop', T('w5', '离线'));

  // 中间：那条总队伍被拆掉；共同的缓存
  const tQ = T('w6', '总队伍');
  const qrow = h('div', 'abs', world); px(qrow, 560, 580, 800, 50); qrow.dataset.name = '那条总队伍';
  const BC = ['#1f5fd6', '#16181d', '#7fa4f0', '#9aa1ad'];
  for (let i = 0; i < 9; i++) { const b = h('div', 'pk', qrow); css(b, { left: (i * 88) + 'px', top: '3px', background: BC[i % 4] }); }
  const qlab = h('div', 'abs t-small', world, '第 02 章：所有推送排一队'); px(qlab, 560, 640);
  show(qrow, tQ - 0.6, { x: -30, d: 0.4 }); show(qlab, tQ - 0.4, { y: 8 });
  strike(world, 540, 601, 840, tQ + 0.15, 'var(--red)'); sfx('tick', tQ + 0.2, { g: 0.6 });
  const tCache = T('w6', '缓存');
  const share = h('div', 'chip', world, '两家都有：存好就不再改的数据 · 层层缓存 · 命中 &gt; 99%'); px(share, 960, 664); share.style.transform = 'translateX(-50%)';
  hide(qlab, tCache - 0.5, { d: 0.25 });
  slam(share, tCache - 0.1, { from: 1.15 }); sfx('thud', tCache, { g: 0.45 });

  // 对普通开发者
  const tDev = T('w7');
  const band = (x, html, t, w = 520) => { const e = h('div', 'card', world, html); px(e, x, 760); css(e, { width: w + 'px', padding: '20px 26px' }); show(e, t, { y: 16, d: 0.4 }); return e; };
  const d1 = band(140, '<div style="font:700 30px \'Sans SC\'">普通开发者</div><div class="mono" style="font-size:28px;margin-top:8px">git push · git fetch 照旧</div>', tDev, 520);
  const d2 = band(700, '<div style="font:700 30px \'Sans SC\'">已进上游 Git 的改进</div><div class="mono" style="font-size:26px;margin-top:8px;color:#5d626b">github.com/openai/git</div>', T('w8', '并入') - 0.3, 520);
  const d3 = band(1260, '<div style="font:800 44px Inter">6–12 个月</div><div style="font:500 26px \'Sans SC\';color:#5d626b;margin-top:4px">Anthropic 预计更多公司会遇到</div>', T('w9', '六到十二'), 520);
  sfx('pop', tDev, { g: 0.5 }); sfx('pop', T('w8', '并入') - 0.3, { g: 0.5 }); sfx('thud', T('w9', '六到十二') + 0.1, { g: 0.5 });
  to(d3, T('w10', '同一堵墙'), { borderColor: '#b33a24', duration: 0.3 });

  // 信息截止时间：其余退淡，居中写明
  const tEnd = T('w11');
  const all = [nL, nR, vs, qL, qR, cR, cL, qrow, share, d1, d2, d3, ...world.querySelectorAll('.xmark')];
  to(all, tEnd - 0.3, { opacity: 0, duration: 0.4 });
  const endL = h('div', 'abs d-3', world, '本片信息截至<br>北京时间 2026 年 11 月 3 日'); px(endL, 960, 400); css(endL, { textAlign: 'center', transform: 'translateX(-50%)', whiteSpace: 'nowrap' });
  show(endL, tEnd, { y: 16, d: 0.45 });
  const endR = h('div', 'abs', world); px(endR, 560, 560, 800, 10); css(endR, { background: 'var(--blue)', transformOrigin: '0 50%' });
  fromTo(endR, T('w11', '二零二六') - 0.2, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut', immediateRender: true });
  fromTo(endL, T('w11', '二零二六'), { color: '#16181d' }, { color: '#1f5fd6', duration: 0.5, immediateRender: false });

  drift(cam, s, 1);
});
