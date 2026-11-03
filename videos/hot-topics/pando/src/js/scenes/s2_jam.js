// 02 仓库扛不住了：右边一台 Git 服务器全章常驻。
// 先演一个工程师 → 几个智能体 → 几次推送 → 每次推送引来几个测试任务拉取；镜头拉远看见整个公司。
// 再在左边摆两家的数字；最后在服务器两侧演出两条老规矩：左边所有推送排成一队，右边每个拉取者单独现打一个包，越排越长。
scene('jam', ({ root, s, c0 }) => {
  sceneBg(root, 'n');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const SX = 1180, SY = 360, SW = 320, SH = 200, SCX = SX + SW / 2, SCY = SY + SH / 2;
  const srv = server(world, SX, SY, SW, SH, 'Git 服务器', '');
  wipe(srv, c0 + 0.05, { dir: 'l', d: 0.45 }); sfx('whoosh', c0 + 0.05, { g: 0.3 });

  // ── A：一个工程师与他的智能体 ──
  const eng = node(world, 200, 430, '工程师');
  show(eng, T('j1') + 0.05, { y: 20 });
  // AI 写代码：一张代码卡，行随时间写出来
  const card = h('div', 'abs', world); px(card, 300, 330, 300, 210); css(card, { background: '#fff', border: '4px solid var(--ink)', borderRadius: '10px' }); card.dataset.name = 'AI 写的代码';
  const CW = [220, 150, 240, 110, 200, 170];
  const cls = CW.map((w, k) => { const l = h('div', 'abs', card); css(l, { left: '22px', top: (22 + k * 28) + 'px', width: w + 'px', height: '14px', background: k % 3 === 1 ? '#16181d' : '#1f5fd6', borderRadius: '7px', transformOrigin: '0 50%' }); return l; });
  const aiTag = h('div', 'chip', world, 'AI'); px(aiTag, 560, 306); aiTag.style.background = 'var(--blue)'; aiTag.style.fontSize = '24px'; aiTag.dataset.overlapOk = '';
  const tW = T('j1', '写代码'), tAg = T('j2', '智能体');
  show(card, tW - 0.5, { x: -20, d: 0.35 });
  slam(aiTag, T('j1', 'AI'), { from: 1.4 }); sfx('pop', T('j1', 'AI'));
  const wEnd = tAg - 0.5;
  F((t) => {   // 代码行按时间写出：由 t 直接算
    const u = clamp((t - (tW - 0.3)) / Math.max(0.5, wEnd - tW), 0, 1) * CW.length;
    cls.forEach((l, k) => { l.style.transform = 'scaleX(' + clamp(u - k, 0, 1) + ')'; });
  });
  hide([card, aiTag], tAg - 0.35, { d: 0.3 });
  const AY = [170, 330, 490, 650];
  const agents = AY.map((y, i) => { const a = node(world, 560, y, '智能体', 'agent'); slide(a, tAg + i * 0.1, { x: -80, d: 0.4 }); return a; });
  const fan = AY.map((y, i) => line(ov, 290, 470, 490, y + 30, tAg - 0.2 + i * 0.08, 'dim', { w: 3, arrow: false, d: 0.3 }));
  sfx('pop', tAg); sfx('pop', tAg + 0.2, { g: 0.6 });
  // 每项改动一条分支：从智能体长向服务器的粗线，包沿着它推过去
  const tCh = T('j2', '改动');
  const brs = AY.map((y, i) => { const b = h('div', 'abs', world); px(b, 640, y + 24, SX - 60 - 640, 12); css(b, { background: '#7fa4f0', borderRadius: '6px', transformOrigin: '0 50%' }); b.dataset.name = '分支';
    fromTo(b, tCh - 0.3 + i * 0.12, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out', immediateRender: true }); return b; });
  sfx('whoosh', tCh - 0.3, { g: 0.3 });
  const tPush = T('j3', '推送');
  const pk1 = AY.map((y, i) => { const p = h('div', 'pk', world); px(p, 640, y + 8); p.dataset.name = '改动';
    fromTo(p, tCh + 0.2 + i * 0.1, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.25, immediateRender: true });
    to(p, tPush - 0.3 + i * 0.1, { x: SX - 40 - 640 - 44, duration: 0.7, ease: 'power2.inOut' });
    to(p, tPush + 0.45 + i * 0.1, { autoAlpha: 0, duration: 0.2 }); return p; });
  sfx('whoosh', tPush - 0.3, { g: 0.35 });
  const JX = [1680, 1780, 1880], JY = [190, 330, 470, 610];
  const tPull = T('j3', '拉取');
  const jobs = [];
  JY.forEach((y, r) => JX.forEach((x, c) => { const j = node(world, x, y, '', 'job'); jobs.push(j); show(j, T('j3', '测试任务') - 0.1 + (r * 3 + c) * 0.04, { x: 30, d: 0.3 }); }));
  const jl = h('div', 'abs t-small', world, '测试任务'); px(jl, 1700, 740); show(jl, T('j3', '测试任务'), { y: 8 });
  const pulls = [];
  JY.forEach((y, r) => JX.forEach((x, c) => pulls.push(line(ov, SX + SW, SCY, x - 30, y + 26, tPull - 0.1 + (r * 3 + c) * 0.035, 'accent', { w: 2.5, d: 0.35 }))));
  sfx('pop', tPull, { g: 0.5 });

  // 镜头拉远：整个公司（固定种子排出的许多小簇）
  const rnd = seeded(20261103);
  const crowd = h('div', 'abs', world); px(crowd, 0, 0, 1920, 1080); crowd.dataset.name = '整个公司';
  for (let i = 0; i < 110; i++) {
    let x, y;
    do { x = -1500 + rnd() * 4900; y = -900 + rnd() * 2900; } while (x > -140 && x < 2060 && y > 40 && y < 1020);
    const c = h('div', 'abs', crowd); px(c, x, y, 96, 64);
    css(c, { border: '6px solid ' + (rnd() < 0.7 ? '#1f5fd6' : '#16181d'), borderRadius: '8px', background: '#fff' });
  }
  const tJ4 = T('j4'), tJ4e = Tend('j4');
  show(crowd, tJ4 - 0.2, { d: 0.5 });
  hide([jl, ...[eng, ...agents].map((n) => n.querySelector('.nm'))], tJ4 - 0.3, { d: 0.2 });   // 拉远时名字太小，先收起

  // ── B：两家的数字，服务器不动 ──
  const tB = T('j5');
  const groupA = [eng, ...agents, ...jobs, ...brs];
  hide(groupA, tJ4e + 0.05, { d: 0.35 });
  to(ov, tJ4e + 0.05, { opacity: 0, duration: 0.35 });
  hide(crowd, tJ4e + 0.1, { d: 0.5 });
  const pA = h('div', 'abs serif', world, 'Anthropic'); px(pA, 140, 104); css(pA, { font: '700 46px "Serif SC"' });
  const pAs = h('div', 'abs t-note', world, '每天合并的改动 · 每个点 100 次'); px(pAs, 420, 116);
  show(pA, tB - 0.1, { x: -14 }); show(pAs, tB + 0.1, { x: -10 });
  // 点阵：五月 25 个点，九月 300 个点
  const dots = (y0, n, t0, dur) => {
    const wrap = h('div', 'abs', world); px(wrap, 300, y0, 560, Math.ceil(n / 25) * 22); wrap.dataset.name = n * 100 + ' 次';
    const ds = [];
    for (let i = 0; i < n; i++) { const d = h('div', 'abs', wrap); css(d, { left: (i % 25) * 22 + 'px', top: Math.floor(i / 25) * 22 + 'px', width: '16px', height: '16px', borderRadius: '50%', background: n > 100 ? '#1f5fd6' : '#7d828b', visibility: 'hidden' }); ds.push(d); }
    F((t) => { const k = Math.floor(clamp((t - t0) / dur, 0, 1) * n); ds.forEach((d, i) => { d.style.visibility = i < k ? '' : 'hidden'; }); });
    return wrap;
  };
  const tMay = T('j5', '五月'), tSep = T('j6', '九月');
  const lMay = h('div', 'abs t-body', world, '五月'); px(lMay, 140, 172); show(lMay, tMay - 0.2, { x: -10 });
  const dMay = dots(184, 25, tMay, 0.5);
  const vMay = h('div', 'abs', world, '2,500'); px(vMay, 880, 168); css(vMay, { font: '800 44px Inter' }); show(vMay, tMay + 0.4, { x: -10 });
  const lSep = h('div', 'abs t-body', world, '九月'); px(lSep, 140, 230); show(lSep, tSep - 0.2, { x: -10 });
  const dSep = dots(242, 300, tSep, 1.3);
  const vSep = h('div', 'abs', world, '30,000+'); px(vSep, 880, 330); css(vSep, { font: '800 52px Inter', color: 'var(--blue)' }); slam(vSep, T('j6', '三万'), { from: 1.2 });
  sfx('thud', T('j6', '三万'), { g: 0.5 }); sfx('whoosh', tSep, { g: 0.3 });
  const eq1 = h('div', 'abs', world, '<span class="blue">2,500 万</span> 次检出 / 天'); px(eq1, 140, 548); css(eq1, { font: '700 46px "Sans SC"' });
  const eq2 = h('div', 'abs t-note', world, '× 每份压缩后 25 GB 以上'); px(eq2, 140, 612);
  const eq3 = h('div', 'abs', world, '≈ <span style="font:800 64px Inter">600 PB</span> 以上 / 天'); px(eq3, 140, 652); css(eq3, { font: '700 46px "Sans SC"' });
  const eq3n = h('div', 'abs t-small', world, '1 PB = 1000 TB · Anthropic 按「每次完整拉取」估算'); px(eq3n, 140, 738);
  show(eq1, T('j7', '自动测试') - 0.1, { x: -14 });
  countTo(eq1.querySelector('span'), 0, 2500, T('j7', '自动测试'), Math.max(0.6, T('j7', '两千五百万') - T('j7', '自动测试')), (v) => Math.round(v).toLocaleString('en-US') + ' 万');
  show(eq2, T('j8', '完整') - 0.1, { x: -14 });
  slam(eq3, T('j8', '六百'), { from: 1.15 }); sfx('thud', T('j8', '六百') + 0.1);
  show(eq3n, T('j8', '以上'), { y: 8 });
  // OpenAI：贴在服务器下方，服务器随之变红
  const pO = h('div', 'abs', world, 'OpenAI'); px(pO, 1180, 612); css(pO, { font: '700 46px Inter' });
  const pOs = h('div', 'abs t-note', world, '2025 年底起'); px(pOs, 1370, 624);
  const o1 = h('div', 'abs t-body', world, '推送变慢 · 合并失败'); px(o1, 1180, 680);
  const o2 = h('div', 'abs', world, '可靠性 <span style="font:800 64px Inter">&lt; 90%</span>'); px(o2, 1180, 736); css(o2, { font: '700 40px "Sans SC"', color: 'var(--red)' });
  to([dMay, dSep], T('j9') - 0.2, { opacity: 0.35, duration: 0.3 });
  show(pO, T('j9') - 0.1, { x: -14 }); show(pOs, T('j9', '去年'), { x: -10 });
  show(o1, T('j9', '推送'), { y: 10 });
  slam(o2, T('j10', '跌破'), { from: 1.2 }); sfx('thud', T('j10', '跌破') + 0.1);
  fromTo(srv, T('j10', '跌破'), { backgroundColor: '#16181d' }, { backgroundColor: '#b33a24', duration: 0.3, immediateRender: false });
  fromTo(srv, Tend('j10') + 0.3, { backgroundColor: '#b33a24' }, { backgroundColor: '#16181d', duration: 0.4, immediateRender: false });

  // ── C：两条老规矩 ──
  const tC = T('j11');
  const groupB = [pA, pAs, lMay, dMay, vMay, lSep, dSep, vSep, eq1, eq2, eq3, eq3n, pO, pOs, o1, o2];
  hide(groupB, tC - 0.5, { d: 0.35 });
  const qm = h('div', 'abs d-1', world, '？'); px(qm, SCX - 66, SY - 230); qm.style.color = 'var(--blue)';
  slam(qm, T('j11', '卡在哪'), { from: 1.4 }); sfx('pop', T('j11', '卡在哪'));
  fromTo(srv, T('j11', '卡在哪') + 0.1, { scale: 1 }, { scale: 1.16, duration: 0.4, ease: 'power3.out', immediateRender: false });   // 卡在这台服务器上
  fromTo(srv, T('j11', '两个') - 0.1, { scale: 1.16 }, { scale: 1, duration: 0.35, ease: 'power2.inOut', immediateRender: false });
  hide(qm, T('j11', '两个') - 0.2, { d: 0.25 });
  const nb = [[SX - 70, SY - 60, '1'], [SX + SW + 26, SY - 60, '2']].map(([x, y, t]) => { const b = h('div', 'chip', world, t); px(b, x, y); return b; });
  nb.forEach((b, i) => slam(b, T('j11', '两个') + i * 0.25, { from: 1.5 })); sfx('pop', T('j11', '两个'));
  hide(nb, T('j12', '第一') - 0.2, { d: 0.2 });
  const r1 = h('div', 'chip', world, '老规矩一 · 所有推送排一队'); px(r1, 300, 250);
  const r2 = h('div', 'chip', world, '老规矩二 · 每人现打一个包'); px(r2, 1340, 230);
  slam(r1, T('j12', '第一'), { from: 1.2 }); sfx('pop', T('j12', '第一'));
  slam(r2, T('j13', '第二'), { from: 1.2 }); sfx('pop', T('j13', '第二'));
  // 规矩一：分支 a b c d 的推送排成一条队，逐个进服务器；人一多，队尾越拉越长
  const BR = ['a', 'b', 'c', 'd'], BC = ['#1f5fd6', '#16181d', '#7fa4f0', '#9aa1ad'];
  const NQ = 14, STEP = 92, QY = SCY - 22, QX0 = SX - 70;
  const qs = [];
  for (let i = 0; i < NQ; i++) {
    const p = h('div', 'pk', world); css(p, { background: BC[i % 4] }); px(p, QX0 - i * STEP, QY); p.dataset.name = '分支 ' + BR[i % 4] + ' 的推送';
    const lb = h('div', 'abs mono', p, BR[i % 4]); css(lb, { left: '0', top: '50px', width: '44px', textAlign: 'center', fontSize: '24px', color: 'var(--ink)' });
    qs.push(p);
  }
  const tQ = T('j12', '排成一队'), tLong = T('j14', '人一多');
  qs.forEach((p, i) => { const tIn = i < 8 ? tQ - 0.5 + i * 0.07 : tLong + (i - 8) * 0.12; fromTo(p, tIn, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.3, immediateRender: true }); });
  sfx('whoosh', tQ - 0.5, { g: 0.3 });
  const qStart = tQ + 0.6, period = 1.15;
  F((t) => {   // 队首每 period 秒进一个：位置由 t 直接算出
    const k = t < qStart ? 0 : Math.min(9, (t - qStart) / period);
    const whole = Math.floor(k), frac = k - whole, e = frac < 0.5 ? 0 : ease.io3((frac - 0.5) * 2);
    const off = (whole + e) * STEP;
    for (let i = 0; i < NQ; i++) {
      const p = qs[i];
      p.style.left = (QX0 - i * STEP + off) + 'px';
      if (i < whole || (i === whole && e > 0.6)) p.style.visibility = 'hidden'; else p.style.visibility = '';
    }
  });
  const q1n = h('div', 'abs t-small', world, '分支毫不相干，也得等前面的'); px(q1n, 300, 560); show(q1n, T('j12', '一个样子') - 0.4, { y: 8 });
  // 规矩二：右边的拉取者，服务器一个一个现算、现打包
  const RY = [330, 470, 610, 750, 890];
  const readers = RY.map((y, i) => { const r = node(world, 1800, y - 30, '', 'job'); return r; });
  const tR = T('j13', '拉取');
  readers.forEach((r, i) => fromTo(r, i < 3 ? tR - 0.3 + i * 0.1 : tLong + (i - 3) * 0.15, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.3, immediateRender: true }));
  const calc = h('div', 'abs', world, '现算中…'); px(calc, SX + 70, SY + SH + 14); css(calc, { font: '700 30px "Sans SC"', color: 'var(--blue)' });
  show(calc, T('j13', '现算') - 0.1, { y: 8 }); sfx('tick', T('j13', '现算'), { g: 0.5 });
  const tPk = T('j13', '打一个包');
  [0, 1, 2].forEach((i) => packet(world, 'gray', SX + SW, SCY, 1760, RY[i] - 8, tPk - 0.3 + i * 0.9, 0.55, { name: '单独打的包', fadeAt: tPk + 0.6 + i * 0.9 }));
  sfx('pop', tPk, { g: 0.5 });
  const wait = h('div', 'abs t-small', world, '后面的继续等'); px(wait, 1520, 800); show(wait, tLong + 0.4, { y: 8 });
  const neck = h('div', 'chip', world, '瓶颈'); px(neck, SX + 110, SY + SH + 62); neck.style.background = 'var(--red)';
  slam(neck, T('j14', '瓶颈'), { from: 1.4 }); sfx('thud', T('j14', '瓶颈') + 0.1);
  fromTo(srv, T('j14', '瓶颈'), { backgroundColor: '#16181d' }, { backgroundColor: '#b33a24', duration: 0.3, immediateRender: false });

  // 镜头：开头停在原位；「整个公司」时拉远一次，这句说完推回
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [tJ4 - 0.15, { z: 0.55 }, 0.9],
    [tJ4e + 0.1, { z: 1 }, 0.8, { sfx: false }],
    [tJ4e + 1.0, { x: 940 }, Math.max(1, s.end - tJ4e - 1.2), { ease: 'none', sfx: false }],
  ]);
});
