// 03 通用增强 · 余额、额度与记忆。仍是那条会话窗口：y1 镜头推到左下角的余额卡片，y2 峰谷时段在卡片上 3D 翻牌、倒计时在走；
// y3 设置 → 额度的余额曲线以 3D 浮到窗口前面，指针沿曲线滑过、读数跟着变；y4 镜头落到底栏这条对话的费用；
// y5–y6b 一块「用量百分比」的表盘飞进底栏，底栏的限额项变成 5h 63%，弹出 5 小时与 7 天两档；y7 六档限额像一叠卡片展开。
// memory：跨对话记忆的管理框（照 memory 截图）立起来，其中一条记忆飞进一条新会话。
scene('spend', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const bg = stageBg(world, 'def');
  const wrap = h('div', 'abs', world); css(wrap, { inset: '0' });
  const app = makeApp(wrap, { mode: 'def', title: '升级依赖并修复测试', sessions: [['升级依赖并修复测试', 'def', true], ['整理发布说明', 'def'], ['审计上传接口', 'sec']] });
  const col = column(app.body, { top: 26 });
  h('div', 'bubble', col, '把项目依赖升级到最新的小版本，修复升级后失败的测试，最后整理一份变更说明。');
  step(col, 'tasks', '更新任务清单', '3/3 已完成 更新 3');
  h('div', '', col, '<h3>变更说明</h3><ul style="margin-top:6px"><li>升级 14 个依赖到最新的小版本</li><li>两处导入方式随新版本调整</li><li>修正 <code>tests/search.test.mjs</code> 里过时的断言</li></ul>');
  const comp = composer(app.body, {});
  const foot = footbar(app.body, { turns: '3 轮 18 步 · 212 tok/s', tok: '128.4K tok · 缓存命中 61%', cost: '¥0.18' });

  // y1：镜头推到左下角的余额卡片
  const balB = box(app.bal, world);
  const zBal = { x: balB.cx + 300, y: balB.cy - 110, z: 1.75 };
  ringOn(app.el, app.bal, T('y1', '左下角') - 0.1, T('y3') - 0.4, { pad: 6 });
  // y2：峰谷翻牌（梁文峰 → 高峰，梁文谷 → 低峰），倒计时一直在走
  const ph = app.phase;
  const phWrap = ph.parentNode; css(phWrap, { position: 'relative', display: 'inline-block' });
  const ph2 = h('span', '', phWrap, '高峰时段'); css(ph2, { position: 'absolute', left: '17px', top: '0' });
  set(ph2, s.start, { autoAlpha: 0 });
  flip3d(ph, ph2, T('y2', '梁文峰') - 0.1, 0.5);
  const ph3 = h('span', '', phWrap, '低峰时段'); css(ph3, { position: 'absolute', left: '17px', top: '0' }); set(ph3, s.start, { autoAlpha: 0 });
  flip3d(ph2, ph3, T('y2', '梁文谷') - 0.1, 0.5);
  sfx('tick', T('y2', '梁文峰')); sfx('tick', T('y2', '梁文谷'));
  const dotEl = app.bal.querySelector('.dot');
  fromTo(dotEl, T('y2', '梁文峰') + 0.15, { backgroundColor: MC.def }, { backgroundColor: '#f59e0b', duration: 0.2, immediateRender: false });
  fromTo(dotEl, T('y2', '梁文谷') + 0.15, { backgroundColor: '#f59e0b' }, { backgroundColor: MC.def, duration: 0.2, immediateRender: false });
  const cd0 = 39 * 3600 + 22 * 60 + 15;
  F((t) => { const v = Math.max(0, cd0 - Math.floor(t - s.start)); const str = `${String(Math.floor(v / 3600)).padStart(2, '0')}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; if (app.cd.textContent !== str) app.cd.textContent = str; });
  ringOn(app.el, app.cd.parentNode, T('y2', '多久') - 0.15, T('y3') - 0.4, { pad: 4, r: 8 });
  const nPk = note(world, balB.r + 40, balB.y - 150, '<div class="k">高峰 / 低峰</div>官网的计价时段：高峰是工作日北京时间 09:00–12:00、14:00–18:00，其余都是低峰', 520);
  fadeIn(nPk, T('y2', '梁文峰') + 0.2, { x: -16 }); fadeOut(nPk, T('y3') - 0.5, { d: 0.3 });

  // y3：设置 → 额度 的余额曲线（照 balance 截图），3D 浮到窗口前
  const st = settings(world, '额度', { x: 160, y: 70, w: 1600, h: 840 });
  const sc = st.content;
  sc.innerHTML = `<h2>额度</h2><div style="display:flex;align-items:center"><h4 style="flex:1">余额与统计</h4><span class="toggle on" style="--mc:#2563EB"><i></i></span></div>
    <div class="sec" style="margin-top:16px;padding:22px 28px;position:relative;height:420px">
      <div style="display:flex;justify-content:space-between"><span class="chip" style="border:1px solid var(--line);background:#fff">API 实时 ⌄</span><span style="display:inline-flex;gap:8px;align-items:center">${icon('refresh')} 刷新</span></div>
      <div style="position:absolute;left:28px;top:96px"><div style="color:#5d626b;font-size:22px">当前总额</div><div style="font:700 56px Inter">¥126.34</div></div>
      <div class="chart" style="position:absolute;left:360px;top:80px;width:800px;height:240px"></div>
      <div style="position:absolute;left:360px;top:340px;color:#5d626b;font-size:22px">横向虚线表示已缩短的余额不变时段 · 悬停或轻触查看采样</div>
    </div>`;
  css(sc, { padding: '40px 60px 0 20px' });
  const chart = sc.querySelector('.chart');
  const W = 800, H = 240;
  const pts = [[0, 0.18], [0.12, 0.16], [0.2, 0.16], [0.36, 0.13], [0.5, 0.1], [0.5, 0.92], [0.58, 0.92], [0.7, 0.9], [0.82, 0.89], [0.92, 0.86], [1, 0.84]];
  const sv = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, chart);
  svg('line', { x1: 0, y1: 20, x2: W, y2: 20, stroke: '#e4e6eb', 'stroke-dasharray': '6 6' }, sv); svg('line', { x1: 0, y1: H - 20, x2: W, y2: H - 20, stroke: '#e4e6eb', 'stroke-dasharray': '6 6' }, sv);
  const P = (p) => [p[0] * W, H - 20 - p[1] * (H - 40)];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + P(p).map((v) => v.toFixed(1)).join(' ')).join(' ');
  const line = svg('path', { d, fill: 'none', stroke: '#2563EB', 'stroke-width': 4, 'stroke-linejoin': 'round' }, sv);
  svg('line', { x1: P(pts[4])[0], y1: P(pts[4])[1], x2: P(pts[5])[0], y2: P(pts[5])[1], stroke: '#2563EB', 'stroke-width': 3, 'stroke-dasharray': '7 6' }, sv);
  const cur = svg('line', { x1: 0, y1: 10, x2: 0, y2: H - 10, stroke: '#6b7079', 'stroke-dasharray': '4 5' }, sv);
  const dotC = svg('circle', { r: 8, fill: '#2563EB', stroke: '#fff', 'stroke-width': 3 }, sv);
  const tip = h('div', 'abs', chart); css(tip, { background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '6px 12px', fontSize: '22px', boxShadow: '0 8px 20px rgba(0,0,0,.12)', whiteSpace: 'nowrap' });
  const tH0 = T('y3', '悬停') - 0.3, tH1 = Tend('y3') + 0.6;
  const yAt = (x) => { for (let i = 1; i < pts.length; i++) { if (x <= pts[i][0] && pts[i][0] > pts[i - 1][0]) { const k = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]); return lerp(pts[i - 1][1], pts[i][1], k); } } return pts[pts.length - 1][1]; };
  let lastTip = '';
  F((t) => {
    const k = 0.25 + 0.55 * ease.io3(clamp((t - tH0) / (tH1 - tH0))), [x, y] = P([k, yAt(k)]);
    cur.setAttribute('x1', x); cur.setAttribute('x2', x); dotC.setAttribute('cx', x); dotC.setAttribute('cy', y);
    const amt = (81.05 + (130.92 - 81.05) * yAt(k)).toFixed(2), hh = 19 + Math.floor(k * 22), mm = Math.floor(k * 997) % 60;
    const txt = `<div style="color:#5d626b">2026/11/${hh < 24 ? 20 : 21} ${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}</div><b>¥${amt}</b>`;
    if (txt !== lastTip) { tip.innerHTML = txt; lastTip = txt; }
    tip.style.left = (x + 16) + 'px'; tip.style.top = (y + 14) + 'px';
    const on = t >= tH0 - 0.1; cur.style.opacity = dotC.style.opacity = tip.style.opacity = on ? 1 : 0;
  });
  const tSet = T('y3') - 0.4;
  rise3d(st.el, tSet, { rx: 18, z: 600, y: 60, d: 0.9 }); sfx('whoosh', tSet, { g: 0.5 }); focusOn(app.el, tSet, 0.4); focusOff(app.el, T('y4') - 0.4, 0.5);
  draw(line, tSet + 0.5, 1.0);
  sink3d(st.el, T('y4') - 0.4, { d: 0.5 });
  // y4：底栏这条对话的费用
  const cB = box(foot.cost, world);
  ringOn(app.el, foot.cost, T('y4', '每个对话') - 0.1, T('y5') - 0.2, { pad: 4 });
  // 点开底栏金额：这个对话的累计费用曲线（README「对话费用」）
  const cp = h('div', 'panel', app.body); css(cp, { left: '700px', bottom: '56px', width: '520px', padding: '20px 24px', whiteSpace: 'normal', fontSize: '24px', zIndex: 5 });
  cp.innerHTML = '<div style="display:flex;justify-content:space-between"><span>本对话费用</span><b>¥0.18</b></div>';
  const cv = svg('svg', { width: 470, height: 120, viewBox: '0 0 470 120' }, cp); cv.style.marginTop = '10px';
  const cpath = svg('path', { d: 'M0 112 L60 104 L120 96 L170 80 L230 72 L290 50 L350 38 L410 20 L470 12', fill: 'none', stroke: '#2563EB', 'stroke-width': 4, 'stroke-linejoin': 'round' }, cv);
  tl.fromTo(cp, { autoAlpha: 0, y: 24, rotationX: -18, transformOrigin: '50% 100%', transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.45, ease: 'power3.out', immediateRender: true }, T('y4', '底部') - 0.2);
  draw(cpath, T('y4', '底部') + 0.1, 0.9); sfx('pop', T('y4', '底部'));
  fadeOut(cp, T('y5') - 0.25, { d: 0.3 });
  // y5、y5b：一块「额度百分比」表盘从右边转进来；底栏的限额项还是「未启用」
  makeRoom(T('y5') - 0.6, col, comp.c);
  const gauge = h('div', 'card3d', world); px(gauge, 1380, 220, 380, 380); css(gauge, { display: 'grid', placeItems: 'center', borderRadius: '30px', '--mc': MC.def });
  gauge.innerHTML = `<svg width="260" height="260" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="none" stroke="#eceef2" stroke-width="12"/><circle class="arc" cx="60" cy="60" r="48" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="301.6" stroke-dashoffset="301.6"/></svg><div style="position:absolute;text-align:center"><div class="pc" style="font:800 64px Inter">0%</div><div style="color:#5d626b;font-size:24px">5 小时额度</div></div>`;
  gauge.dataset.name = '额度表盘';
  const arc = gauge.querySelector('.arc');
  tl.fromTo(gauge, { autoAlpha: 0, rotationY: -60, x: 260, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: -14, x: 0, z: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, T('y5', 'Coding') - 0.4);
  fromTo(arc, T('y5', 'Coding'), { strokeDashoffset: 301.6 }, { strokeDashoffset: 301.6 * (1 - 0.632), duration: 1.0, ease: 'power2.out' });
  countTo(gauge.querySelector('.pc'), 0, 63, T('y5', 'Coding'), 1.0, (v) => Math.round(v) + '%');
  sfx('whoosh', T('y5', 'Coding') - 0.4, { g: 0.4 });
  const limR = ringOn(app.el, foot.lim, T('y5b', '没有') - 0.1, T('y6b', '5 小时') - 0.2, { pad: 4, c: '#f59e0b' });
  // y6b：表盘缩进底栏的限额项，限额项变成 5h 63%，弹出额度限制（照 spend-footer 截图）
  const lB = box(foot.lim, world), gB = box(gauge, world);
  const tG = T('y6b', '5 小时') - 0.4;
  tl.fromTo(gauge, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: lB.cx - gB.cx, y: lB.cy - gB.cy, scale: 0.12, autoAlpha: 0, duration: 0.6, ease: 'power3.in', immediateRender: false }, tG);
  keyed(foot.lim.querySelector('.v')).at(tG + 0.55, { html: '5h 63%' });
  fromTo(foot.lim, tG + 0.55, { backgroundColor: 'rgba(37,99,235,0)' }, { backgroundColor: 'rgba(37,99,235,.10)', duration: 0.3 }); sfx('pop', tG + 0.6);
  const pop = h('div', 'panel', app.body); css(pop, { right: '110px', bottom: '56px', width: '560px', padding: '22px 26px', whiteSpace: 'normal', fontSize: '24px', zIndex: 5 });
  const bar = (k, pc, a, b) => `<div style="display:flex;justify-content:space-between;margin-top:16px"><span>${k}</span><span style="font-size:22px">${pc}% · ¥${a} / ¥${b}</span></div><div class="bar8" style="margin-top:8px"><i style="width:${pc}%"></i></div>`;
  pop.innerHTML = `<div style="font-size:28px">额度限制</div><div style="color:#5d626b;font-size:22px;margin-top:6px">额度保护中</div>${bar('5 小时', '63.2', '12.64', '20.00')}${bar('7 天', '8.4', '12.64', '150.00')}<div style="color:#5d626b;font-size:22px;margin-top:14px">所有对话共用，比例包含已结算估算与在途预留</div>`;
  tl.fromTo(pop, { autoAlpha: 0, y: 30, rotationX: -20, transformOrigin: '50% 100%', transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.5, ease: 'power3.out', immediateRender: true }, T('y6b', '5 小时') + 0.1);
  ringOn(app.el, pop, T('y6b', '周限额') - 0.1, Tend('y6b') + 0.2, { pad: 4 });
  fadeOut(pop, T('y7') - 0.3, { d: 0.3 });
  // y7：六档限额像一叠卡片从景深里展开（照 spend-limits 截图的卡片），默认都关，这里开着 5 小时与 7 天
  const tiers = [['15 分钟', 5, false], ['1 小时', 15, false], ['5 小时', 20, true], ['1 天', 100, false], ['7 天', 150, true], ['30 天', 2000, false]];
  const dim = h('div', 'scrim', world); css(dim, { background: 'rgba(6,7,10,.35)' }); focusOn(app.el, T('y7') - 0.35, 0.4); set(dim, s.start, { autoAlpha: 0 }); fadeIn(dim, T('y7') - 0.35, { y: 0, d: 0.35 });
  const tc = tiers.map(([k, v, on], i) => {
    const c = h('div', 'card3d', world); px(c, 260 + (i % 3) * 480, 230 + Math.floor(i / 3) * 250, 440, 210); css(c, { padding: '24px 28px', fontSize: '26px', '--mc': MC.def, border: on ? '2px solid #a8bef0' : 'none' });
    c.innerHTML = `<div style="display:flex;align-items:center;gap:14px"><span class="toggle${on ? ' on' : ''}"><i></i></span><b style="font-size:32px">${k}</b><span style="margin-left:auto;border:1px solid var(--line);border-radius:10px;padding:4px 14px;font-size:24px">¥ ${v}</span></div>${on ? `<div style="display:flex;justify-content:space-between;color:#5d626b;font-size:22px;margin-top:18px"><span>¥12.64 / ¥${v}.00</span><span>${(1264 / v).toFixed(1)}%</span></div><div class="bar8" style="margin-top:8px"><i style="width:${Math.min(100, 1264 / v)}%"></i></div>` : '<div style="color:#6b7079;font-size:22px;margin-top:18px">默认关闭</div>'}`;
    c.dataset.name = k + '限额';
    tl.fromTo(c, { autoAlpha: 0, z: -900 - i * 120, rotationX: 40, y: 120, transformPerspective: P3 }, { autoAlpha: 1, z: 0, rotationX: 0, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, T('y7', '更多') - 0.5 + i * 0.09);
    return c;
  });
  sfx('whoosh', T('y7', '更多') - 0.5, { g: 0.5 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [T('y1', '左下角') - 0.6, zBal, 1.1],
    [T('y3') - 0.5, { x: 960, y: 540, z: 1 }, 0.9],
    [T('y4', '每个对话') - 0.5, { x: 1156, y: cB.cy - 200, z: 1.3 }, 0.9],
    [T('y5') - 0.3, { x: 960, y: 540, z: 1 }, 0.9],
  ]);
});

scene('memory', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  stageBg(world, 'wri');
  // 设置 → 通用 页面作底，跨对话记忆的管理框立在上面（照 memory 截图）
  const st = settings(world, '通用');
  const scrim = h('div', 'scrim', st.el);
  const dl = dialog(world, 200, 90, 1040, '跨对话记忆');
  dl.body.innerHTML = `<div style="display:flex;gap:14px;align-items:center"><span style="flex:1;border:1px solid var(--line);border-radius:12px;padding:10px 16px;color:#6b7079">搜索已保存的记录</span><span class="chip" style="border:1px solid var(--line);background:#fff">全部范围 ⌄</span><span class="chip" style="border:1px solid var(--line);background:#fff">全部类型 ⌄</span><span class="btn dark">新增记忆</span></div>
    <div style="color:#5d626b;font-size:22px;margin:14px 0 6px">已保存记录：5 · 删除对话不会自动删除已保存的记忆</div>
    <div class="recs" style="display:flex;flex-direction:column;gap:14px"></div>`;
  const recs = dl.body.querySelector('.recs');
  const rec = (tag, scope, title, body) => { const r = h('div', '', recs, `<div style="display:flex;gap:12px;align-items:center;font-size:22px;color:#5d626b"><span class="chip" style="border:1px solid var(--line);background:#fff;font-size:22px">${tag}</span>${scope} · 已启用</div><div style="font-size:27px;margin-top:6px">${title}</div><div style="color:#3b3f46;margin-top:2px">${body}</div>`); css(r, { border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 20px', background: '#fff' }); return r; };
  const r1 = rec('写作设定', '不限工作区 · 写作', '《雾港》视角约定', '林晚视角，第三人称限知；周屿的身份到第九章揭晓。');
  const r2 = rec('项目事实', 'acme-shop · 网安', '案件 acme-upload', '上传接口 F-0001 路径穿越已确认，修复待回归验证。');
  const r3 = rec('操作结论', 'acme-shop · 缺省', '搜索结果消失', '搜索竞态已用递增请求序号修复，回归测试见 tests/search.test.mjs。');
  const tIn = s.start - 0.25;
  fromTo(st.el, tIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  rise3d(dl.d, T('k1', '记忆') - 0.6, { rx: 18, z: 600, y: 60, d: 0.9 }); sfx('whoosh', T('k1', '记忆') - 0.6, { g: 0.5 });
  [r1, r2, r3].forEach((r, i) => fadeIn(r, T('k1', '记忆') + i * 0.18, { y: 18 }));
  // k2：「偏好」「项目约定」两条依次亮起；第一条飞出去，落进一条新会话
  ringOn(world, r1, T('k2', '偏好') - 0.1, T('k2', '以后') - 0.1, { pad: 4, c: MC.wri });
  ringOn(world, r2, T('k2', '项目约定') - 0.1, T('k2', '以后') - 0.1, { pad: 4, c: MC.wri });
  const nw = h('div', 'card3d', world); px(nw, 1290, 520, 560, 300); css(nw, { padding: '22px 26px', fontSize: '24px', '--mc': MC.wri });
  nw.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><b>《雾港》第八章</b><span class="pill" style="padding:4px 12px">${icon('pen')} 写作</span></div><div class="bubble" style="margin-top:16px;max-width:none">接着写第八章：周屿第一次上灯塔</div><div class="got" style="margin-top:14px;color:#5d626b;font-size:22px;display:flex;gap:8px;align-items:center">${icon('memory')} 带上记忆：《雾港》视角约定</div>`;
  nw.dataset.name = '新会话';
  const tNw = T('k2', '以后') - 0.4;
  tl.fromTo(nw, { autoAlpha: 0, rotationY: -50, x: 200, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: -12, x: 0, z: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tNw);
  const got = nw.querySelector('.got'); set(got, s.start, { autoAlpha: 0 });
  const g = h('div', 'chip', world, `${icon('memory')} 《雾港》视角约定`); css(g, { position: 'absolute', background: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,.4)', fontSize: '24px' });
  const rb = box(r1, world), gb = box(got, world);
  px(g, rb.x + 20, rb.y + 50);
  fromTo(g, T('k2', '找') - 0.6, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, x: gb.x - rb.x - 20, y: gb.y - rb.y - 50, duration: 0.8, ease: 'power3.inOut' });
  fadeOut(g, T('k2', '找') + 0.25, { d: 0.2 }); appear(got, T('k2', '找') + 0.25); sfx('pop', T('k2', '找') + 0.25);
  [dl.d, nw].forEach((e) => fadeOut(e, s.end - 0.5, { d: 0.3 }));
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.5, s.end, -1)]);
});
