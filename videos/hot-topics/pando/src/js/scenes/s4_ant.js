// 04 Anthropic：换掉 Git。Anthropic 风格：米色暖底、深石板色、陶土橙、衬线、圆角。
// 全章常驻一排五台机器：先各背一份完整仓库（Git 的设计），再缩成小缓存、按需向 Scion 服务器取；
// 提交与合并移到服务器上，推送这一步划掉；中间长出地区缓存，形成三层；结果与边界排在下方。
scene('ant', ({ root, s, c0 }) => {
  sceneBg(root, 'a');
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const hd = h('div', 'abs a-ttl', world, 'Anthropic'); px(hd, 120, 78); hd.style.fontSize = '38px';
  show(hd, c0 + 0.05, { y: 10 });
  const hr = rule(world, 120, 140, 1680, c0 + 0.05, 'o-rule', 0.7); hr.style.background = '#c9c2b0';

  // 五台机器
  const MX = [330, 600, 870, 1140, 1410], MY = 560, MW = 190, MH = 96;
  const kinds = ['智能体', '测试任务', '智能体', '研究任务', '智能体'];
  const machines = MX.map((x, i) => { const m = h('div', 'a-box', world, kinds[i]); px(m, x - MW / 2, MY, MW, MH); m.style.fontSize = '28px'; m.dataset.name = kinds[i]; return m; });
  machines.forEach((m, i) => show(m, c0 + 0.15 + i * 0.07, { y: 20, d: 0.4 }));
  // 每台背着一份完整仓库
  const stacks = MX.map((x) => { const st = h('div', 'abs', world); px(st, x - 70, 320, 140, 220); css(st, { borderRadius: '12px', background: '#e8b9a6', transformOrigin: '50% 100%', overflow: 'hidden' }); st.dataset.name = '完整仓库';
    for (let k = 0; k < 8; k++) { const b = h('div', 'abs', st); css(b, { left: '0', right: '0', top: (k * 28) + 'px', height: '14px', background: '#cc785c' }); }
    return st; });
  const tFull = T('a2', '完整');
  stacks.forEach((st, i) => fromTo(st, tFull - 0.4 + i * 0.06, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.out', immediateRender: true }));
  sfx('thud', tFull, { g: 0.4 });
  const fullN = h('div', 'abs t-small', world, '每台一份完整仓库：断网也能翻历史、切版本'); px(fullN, 210, 268); css(fullN, { fontFamily: '"Serif SC"' });
  show(fullN, T('a2', '离线'), { y: 8 });
  // Anthropic 的原话
  const qa3 = h('div', 'abs', world, '<span style="font:500 28px \'Serif SC\';color:#5e5d59">“nearly all of our clients were agents and jobs that are online by definition”</span><br><span style="font:600 32px \'Serif SC\'">几乎所有使用者都是智能体和任务，天然在线</span>');
  px(qa3, 210, 690); css(qa3, { whiteSpace: 'normal', width: '1300px' }); qa3.dataset.name = 'Anthropic 原文';
  show(qa3, T('a3', 'Anthropic') - 0.1, { y: 14, d: 0.45 }); sfx('pop', T('a3', 'Anthropic'), { g: 0.4 });
  hide(qa3, T('a5') - 0.1, { d: 0.3 });
  // 都在线
  const tOn = T('a4', '永远在线');
  const dots = MX.map((x, i) => { const d = h('div', 'abs', world); px(d, x - MW / 2 + 16, MY + 14, 18, 18); css(d, { borderRadius: '50%', background: '#5b8a3c' }); slam(d, tOn - 0.2 + i * 0.06, { from: 2, d: 0.3 }); return d; });
  const pre = h('div', 'a-box', world, '服务器'); px(pre, 760, 168, 400, 96); pre.style.fontSize = '36px';
  wipe(pre, tOn - 0.5, { dir: 't', d: 0.4 });
  const onL = MX.map((x, i) => line(ov, x, MY - 6, 900 + i * 30, 268, tOn - 0.2 + i * 0.06, 'slate', { w: 3, arrow: false, d: 0.35, opacity: 0.55 }));
  const onN = h('div', 'abs t-small', world, '一直连着服务器'); px(onN, 210, 668); css(onN, { fontFamily: '"Serif SC"' });
  sfx('tick', tOn, { g: 0.5 });              // 连线本身说明「一直连着」，不再另写字
  // 拖累
  const tDrag = T('a5', '拖累');
  stacks.forEach((st) => fromTo(st, tDrag - 0.2, { y: 0 }, { y: 10, duration: 0.3, ease: 'power2.in', immediateRender: false }));
  machines.forEach((m) => fromTo(m, tDrag - 0.2, { scaleY: 1 }, { scaleY: 0.9, duration: 0.3, ease: 'power2.in', transformOrigin: '50% 100%', immediateRender: false }));
  const dragN = h('div', 'abs t-small', world, 'Anthropic 的一份工作副本压缩后就超过 25 GB'); px(dragN, 210, 268); css(dragN, { fontFamily: '"Serif SC"', color: 'var(--a-clay-ink)' });
  hide(fullN, tDrag - 0.3, { d: 0.25 }); show(dragN, tDrag, { y: 8 });

  // Scion：服务器出现，完整仓库缩成小缓存，按需取
  const tSc = T('a6', 'Scion');
  const srv = h('div', 'a-box clay', world, 'Scion 服务器'); px(srv, 760, 168, 400, 96); srv.style.fontSize = '36px';
  wipe(srv, tSc - 0.3, { dir: 't', d: 0.45 }); sfx('thud', tSc, { g: 0.6 });
  hide(pre, tSc + 0.2, { d: 0.2 });
  onL.forEach((l) => to(l, tSc - 0.3, { opacity: 0, duration: 0.3 }));
  hide([dragN, onN], tSc - 0.3, { d: 0.25 });
  const tThin = T('a6', '不存');
  stacks.forEach((st) => fromTo(st, tThin - 0.2, { scaleY: 1, y: 10 }, { scaleY: 0.18, y: 0, duration: 0.6, ease: 'power3.inOut', immediateRender: false }));
  machines.forEach((m) => fromTo(m, tThin - 0.2, { scaleY: 0.9 }, { scaleY: 1, duration: 0.4, transformOrigin: '50% 100%', immediateRender: false }));
  sfx('whoosh', tThin - 0.2, { g: 0.35 });
  const thinN = h('div', 'abs t-small', world, '只留一小块本地缓存'); px(thinN, 210, 668); css(thinN, { fontFamily: '"Serif SC"' });
  show(thinN, tThin + 0.4, { y: 8 });
  const tGet = T('a6', '取什么');
  [1, 3].forEach((i, k) => { const f = h('div', 'abs', world); px(f, 940, 268, 30, 36); css(f, { background: '#141413', borderRadius: '4px' }); f.dataset.name = '要的文件';
    fromTo(f, tGet - 0.3 + k * 0.2, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, x: MX[i] - 955, y: 230, duration: 0.6, ease: 'power2.inOut', immediateRender: true });
    to(f, tGet + 0.5 + k * 0.2, { autoAlpha: 0, duration: 0.3 }); });
  sfx('pop', tGet, { g: 0.5 });
  // 提交与合并在服务器上；推送划掉
  const tSrvWork = T('a7', '服务器');
  const work = h('div', 'abs', world, '记录改动 · 合并改动'); px(work, 1268, 198); css(work, { font: '600 30px "Serif SC"', color: 'var(--a-ink)' });
  fromTo(srv, T('a7', '合并') - 0.1, { width: 400, left: 760 }, { width: 560, left: 680, duration: 0.45, ease: 'power3.out', immediateRender: false });
  show(work, T('a7', '合并') + 0.2, { x: -14 });
  const pushP = path(ov, `M${MX[4]},${MY - 10} L1120,272`, 'slate', { w: 4, dashed: true });
  arrowIn(pushP, tSrvWork - 0.2, 0.4);
  const pushL = h('div', 'a-pill', world, '推送'); px(pushL, 1330, 366); pushL.style.fontSize = '34px';
  show(pushL, tSrvWork - 0.1, { y: 8 });
  const tSave = T('a7', '省了');
  strike(world, 1318, 390, 116, tSave - 0.25, 'var(--a-clay-ink)');
  fromTo(pushL, tSave - 0.25, { backgroundColor: '#141413' }, { backgroundColor: '#b9b2a2', duration: 0.3, immediateRender: false }); sfx('tick', tSave, { g: 0.5 });
  to(pushP, tSave + 0.6, { opacity: 0, duration: 0.3 });
  hide([pushL, thinN], T('a8') - 0.2, { d: 0.3 });

  // 三层缓存
  const tTier = T('a8', '层层');
  const reg = [[470, '地区缓存'], [1110, '地区缓存']].map(([x, t]) => { const c = h('div', 'a-box', world, t); px(c, x, 392, 300, 74); c.style.fontSize = '28px'; c.dataset.name = t; return c; });
  reg.forEach((c, i) => show(c, tTier - 0.3 + i * 0.12, { y: 14, d: 0.4 }));
  const lk = [];
  [[620, 392, 940, 264], [1260, 392, 980, 264]].forEach(([x0, y0, x1, y1], i) => lk.push(line(ov, x0, y0, x1, y1, tTier + i * 0.08, 'slate', { w: 3, arrow: false, d: 0.3 })));
  MX.forEach((x, i) => lk.push(line(ov, x, MY, i < 3 ? 620 : 1260, 466, tTier + 0.2 + i * 0.05, 'slate', { w: 2, arrow: false, d: 0.3, opacity: 0.6 })));
  sfx('pop', tTier, { g: 0.5 });
  const tierL = [['总服务器', 'scion-server', 190], ['每个地区', 'scion-cache', 400], ['每台机器', 'scion-daemon', 570]].map(([a, b, y], i) => {
    const e = h('div', 'abs', world, `<div style="font:600 28px 'Serif SC'">${a}</div><div style="font:500 22px Inter;color:#5e5d59">${b}</div>`); px(e, 1680, y);
    show(e, tTier + 0.2 + i * 0.12, { x: 14, d: 0.35 }); return e; });
  const tHit = T('a9', '九成九');
  const badges = [[1180, 270], [790, 360], [1530, 540]].map(([x, y]) => { const b = h('div', 'a-pill', world, '&gt;99%'); px(b, x, y); b.style.fontSize = '24px'; return b; });
  badges.forEach((b, i) => slam(b, tHit - 0.1 + i * 0.15, { from: 1.3 }));
  sfx('thud', tHit + 0.1, { g: 0.5 });
  const hitN = h('div', 'abs t-small', world, '每一层的缓存命中率'); px(hitN, 1520, 494); css(hitN, { fontFamily: '"Serif SC"' });
  show(hitN, tHit + 0.3, { y: 8 });

  // 结果与边界：下方一行
  hide([...tierL, hitN, work], T('a10') - 0.4, { d: 0.3 });
  const hr2 = rule(world, 120, 712, 1680, T('a10') - 0.3, 'o-rule', 0.5); hr2.style.background = '#c9c2b0';
  const R = (x, big, small, t) => {
    const b = h('div', 'abs', world, big); px(b, x, 736); css(b, { font: '600 76px "Serif SC"', color: 'var(--a-ink)' });
    const n = h('div', 'abs t-small', world, small); px(n, x + 4, 840); css(n, { fontFamily: '"Serif SC"' });
    slam(b, t, { from: 1.12 }); show(n, t + 0.25, { y: 8 }); sfx('thud', t + 0.1, { g: 0.45 });
    return [b, n];
  };
  const r1 = R(150, '1/200', 'CPU 与内存，对比原来的 Git 镜像设施', T('a10', '两百分之一'));
  const r2 = R(800, '分钟 → 秒', '测试与研究任务检出代码', T('a11', '几秒'));
  const r3 = R(1360, '7 人 · 5 个月', '同时做了代码审查工具 Antique', T('a12', '七个人'));
  // 边界：原文一句，配中文
  const tCav = T('a13');
  hide([...r1, ...r2, ...r3], tCav - 0.3, { d: 0.3 });
  const q = h('div', 'abs', world, '<div style="font:500 30px \'Serif SC\';color:#5e5d59">“Scion is by no means a suitable replacement for git for general use.”</div><div style="font:600 36px \'Serif SC\';margin-top:10px">Scion 绝不是适合一般用途的 Git 替代品。</div>');
  px(q, 150, 744); css(q, { whiteSpace: 'normal', width: '1600px' }); q.dataset.name = 'Anthropic 原文';
  show(q, tCav + 0.2, { y: 14, d: 0.5 });

  drift(cam, s, -1);
});
