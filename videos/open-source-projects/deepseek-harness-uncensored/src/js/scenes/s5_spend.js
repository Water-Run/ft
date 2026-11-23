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
  // 时段圆点：高峰红、低峰蓝，真实界面里是瞬间换色（文字的翻牌是本片的讲解手法，配合双关）
  const dotEl = app.bal.querySelector('.dot');
  fromTo(dotEl, T('y2', '梁文峰') + 0.15, { backgroundColor: MC.def }, { backgroundColor: '#dc2626', duration: 0, immediateRender: false });
  fromTo(dotEl, T('y2', '梁文谷') + 0.15, { backgroundColor: '#dc2626' }, { backgroundColor: MC.def, duration: 0, immediateRender: false });
  // 倒计时每秒走一格，与 asides 场同一个起点（那扇窗口出现的时刻），换场时接着走
  const cd0 = 39 * 3600 + 22 * 60 + 15, cdRef = T('x2') - 0.7;
  F((t) => { const v = Math.max(0, cd0 - Math.max(0, Math.floor(t - cdRef))); const str = `${String(Math.floor(v / 3600)).padStart(2, '0')}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; if (app.cd.textContent !== str) app.cd.textContent = str; });
  ringOn(app.el, app.cd.parentNode, T('y2', '多久') - 0.15, T('y3') - 0.4, { pad: 4, r: 8 });
  // 注解：官网的两个计价时段；念到「梁文峰」亮高峰那一行，念到「梁文谷」换到低峰那一行
  const ROW = 'display:flex;gap:18px;align-items:baseline;padding:6px 12px;margin:4px -12px 0;border-radius:10px;background:rgba(255,255,255,0)';
  const nPk = note(world, balB.r + 40, balB.y - 160, `<div class="k">官网的计价时段 · 工作日北京时间</div><div class="pk" style="${ROW}"><b style="color:#fca5a5;flex:none">高峰</b><span>9–12 点、14–18 点</span></div><div class="lw" style="${ROW}"><b style="color:#a9c1ff;flex:none">低峰</b><span>其余时段</span></div>`, 520);
  fadeIn(nPk, T('y2') + 0.05, { x: -16 }); fadeOut(nPk, T('y3') - 0.5, { d: 0.3 });
  const pkRow = nPk.querySelector('.pk'), lwRow = nPk.querySelector('.lw'), HL0 = 'rgba(255,255,255,0)', HLP = 'rgba(220,38,38,.40)', HLL = 'rgba(37,99,235,.45)';
  const tPk = T('y2', '梁文峰') - 0.05, tLw = T('y2', '梁文谷') - 0.05;
  fromTo(pkRow, tPk, { backgroundColor: HL0 }, { backgroundColor: HLP, duration: 0.2, ease: 'power2.out', immediateRender: false });
  fromTo(pkRow, tLw, { backgroundColor: HLP }, { backgroundColor: HL0, duration: 0.2, ease: 'power2.inOut', immediateRender: false });
  fromTo(lwRow, tLw, { backgroundColor: HL0 }, { backgroundColor: HLL, duration: 0.2, ease: 'power2.out', immediateRender: false });

  // y3：设置 → 额度 的余额曲线（照 balance 截图），3D 浮到窗口前
  const st = settings(world, '额度', { x: 160, y: 70, w: 1600, h: 840 });
  const sc = st.content;
  // 照 balance 截图与 BalanceHistory.tsx / balance-chart.ts：增长画成实线横走 + 竖向虚线；30 分钟以上不变的时段断开、用横向短虚线接上；
  // 三条虚线网格、左侧最高与最低金额、下方首尾时刻、两行说明、统计行。没有描线动画；悬停时十字线、吸附采样点的圆点、跟着指针的读数框
  sc.innerHTML = `<h2>额度</h2><div style="display:flex;align-items:center"><h4 style="flex:1">余额与统计</h4><span class="toggle on" style="--mc:#2563EB"><i></i></span></div>
    <div class="sec" style="margin-top:16px;padding:22px 28px;position:relative;height:610px">
      <div style="display:flex;justify-content:space-between"><span class="chip" style="border:1px solid var(--line);background:#fff">API 实时 ⌄</span><span style="display:inline-flex;gap:8px;align-items:center">${icon('refresh')} 刷新</span></div>
      <div style="position:absolute;left:28px;top:96px"><div style="color:#5d626b;font-size:22px">当前总额</div><div style="font:700 56px Inter">¥126.73</div></div>
      <div class="chart" style="position:absolute;left:330px;top:84px;width:830px;height:300px"></div>
      <div style="position:absolute;left:330px;top:394px;color:#5d626b;font-size:22px;display:grid;row-gap:10px"><div>虚线表示已缩短的余额不变时段，或没有采样的时段</div><div>悬停或轻触查看采样，聚焦后可用方向键逐点查看</div></div>
      <div style="position:absolute;left:28px;right:28px;top:478px;border-top:1px solid var(--line);padding-top:16px;display:grid;grid-template-columns:repeat(3,1fr);font-size:22px">
        <div><div style="color:#5d626b">观测区间变化</div><div style="margin-top:4px">¥40.31</div></div>
        <div><div style="color:#5d626b">已保存采样</div><div style="margin-top:4px">231</div></div>
        <div><div style="color:#5d626b">最近采样时间</div><div style="margin-top:4px">2026/11/21 17:33:57</div></div></div>
      <div style="position:absolute;left:28px;top:572px;color:#5d626b;font-size:22px">余额变化包含充值、赠金和到期扣减，不等同于实际消费或账单。</div>
    </div>
    <div style="margin-top:18px;color:#3b3f46;font-size:24px">▸ 采样设置</div>`;
  css(sc, { padding: '30px 60px 0 20px' });
  const chart = sc.querySelector('.chart');
  // 卡片内容区：.sec 的内边距盒宽 1188，右内边距 28 → 图表从 330 到 1160，宽 830；曲线右端比「17:33」的右缘缩进 14（照 balance 截图）
  const W = 830, H = 300, X0 = 110, X1 = 816, Y0 = 22, Y1 = 232, LO = 81.05, HI = 130.92;
  const PX = (x) => X0 + x * (X1 - X0), PY = (v) => Y1 - v * (Y1 - Y0);
  const sv = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, chart);
  [Y0, (Y0 + Y1) / 2, Y1].forEach((y) => svg('line', { x1: X0, y1: y, x2: X1, y2: y, stroke: '#dfe2e8', 'stroke-width': 1.2, 'stroke-dasharray': '5 7' }, sv));
  const lab = (x, y, t, a = 'start') => { const e = svg('text', { x, y, fill: '#6b7079', 'font-size': 22, 'text-anchor': a, 'font-family': 'Inter' }, sv); e.textContent = t; };
  lab(0, Y0 + 8, '¥130.92'); lab(0, Y1 + 8, '¥81.05'); lab(X0, Y1 + 50, '19:33'); lab(W, Y1 + 50, '17:33', 'end');
  // 实线段（之间是缩短的不变时段），值是在最低与最高之间的比例；末点 = 当前总额 ¥126.73
  // DSHU ac598fa、eb83e00 之后：缩短的不变时段与没有采样的时段都画虚线（5 4，本片 9 7）。缩短段合计不超过横轴的 1/5，
  // 每段 0.05 宽，读得出是虚线而不是断开（策划者 r1：「余额曲线有断点考虑刚更新的横向虚线 对齐样式」）
  const SOLID = [
    [[0, 0.108], [0.12, 0.092]],
    [[0.17, 0.092], [0.28, 0.06]],
    [[0.33, 0.06], [0.50, 0.0], [0.55, 0.0]],
    [[0.55, 1.0], [0.65, 0.985]],
    [[0.70, 0.985], [0.80, 0.95]],
    [[0.85, 0.95], [1, 0.916]],
  ];
  const pathOf = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + PX(p[0]).toFixed(1) + ' ' + PY(p[1]).toFixed(1)).join(' ');
  const LINE = { fill: 'none', stroke: '#2563EB', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  SOLID.forEach((seg) => svg('path', { d: pathOf(seg), ...LINE }, sv));
  [[0.12, 0.17, 0.092], [0.28, 0.33, 0.06], [0.65, 0.70, 0.985], [0.80, 0.85, 0.95]].forEach(([a, b, v]) => svg('path', { d: `M${PX(a)} ${PY(v)} H${PX(b)}`, ...LINE, 'stroke-dasharray': '9 7', 'stroke-linecap': 'butt' }, sv));
  svg('path', { d: `M${PX(0.55)} ${PY(0)} V${PY(1)}`, ...LINE, 'stroke-dasharray': '5 7', 'stroke-linecap': 'butt' }, sv);
  // 采样点：沿实线段取点，悬停时圆点吸附到离指针最近的一个
  const SAMP = [];
  SOLID.forEach((seg) => { for (let i = 1; i < seg.length; i++) { const [a, b] = [seg[i - 1], seg[i]]; const n = Math.max(1, Math.round((b[0] - a[0]) * 60)); for (let j = 0; j <= n; j++) SAMP.push([lerp(a[0], b[0], j / n), lerp(a[1], b[1], j / n)]); } });
  const cur = svg('line', { y1: 10, y2: Y1 + 10, stroke: '#6b7079', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, sv);
  const dotC = svg('circle', { r: 6, fill: '#2563EB' }, sv);
  const tip = h('div', 'abs', chart); css(tip, { background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '8px 14px', fontSize: '22px', boxShadow: '0 8px 20px rgba(0,0,0,.12)', whiteSpace: 'nowrap', lineHeight: 1.5 });
  const ptr = h('div', 'abs', chart, '<svg width="30" height="38" viewBox="0 0 15 19"><path d="M1 1v15l4-4 3 6 2.4-1.1-3-6H13z" fill="#111" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>');
  const tH0 = T('y3', '悬停') - 0.3, tH1 = Tend('y3') + 0.6;
  const T0 = 19 * 3600 + 33 * 60 + 12, SPAN = 22 * 3600;   // 观测区间：2026/11/20 19:33:12 起 22 小时（秒）
  const fmtT = (sec) => { const z = (n) => String(n).padStart(2, '0'); let v = Math.round(sec); const day = 20 + Math.floor(v / 86400); v %= 86400; return `2026/11/${day} ${z(Math.floor(v / 3600))}:${z(Math.floor(v / 60) % 60)}:${z(v % 60)}`; };
  let lastTip = '';
  F((t) => {
    const on = t >= tH0 - 0.3;
    const k = 0.22 + 0.58 * ease.io3(clamp((t - tH0) / (tH1 - tH0)));
    let best = SAMP[0]; for (const p of SAMP) if (Math.abs(p[0] - k) < Math.abs(best[0] - k)) best = p;
    const sx = PX(best[0]), sy = PY(best[1]), mx = PX(k), my = sy + 46;
    cur.setAttribute('x1', sx); cur.setAttribute('x2', sx); dotC.setAttribute('cx', sx); dotC.setAttribute('cy', sy);
    const txt = `<div style="color:#3b3f46">${fmtT(T0 + best[0] * SPAN)}</div><div style="font-weight:500">¥${(LO + (HI - LO) * best[1]).toFixed(2)}</div>`;
    if (txt !== lastTip) { tip.innerHTML = txt; lastTip = txt; }
    // 读数框照 BalanceHistory 的 besidePointer：横竖都放在指针后面 8px（本片 14），放不下就放到前面，始终留在绘图区里（不压到下面的说明）
    const tw = tip.offsetWidth || 260, th = tip.offsetHeight || 72, PH = Y1 + 10;
    const bx = mx + 14 + tw <= W ? mx + 14 : mx - 14 - tw, by = my + 14 + th <= PH ? my + 14 : my - 14 - th;
    tip.style.left = clamp(bx, 0, W - tw) + 'px'; tip.style.top = clamp(by, 0, PH - th) + 'px';
    ptr.style.left = mx + 'px'; ptr.style.top = my + 'px';
    const show = t >= tH0 ? 1 : 0;
    cur.style.opacity = dotC.style.opacity = tip.style.opacity = show; ptr.style.opacity = on ? 1 : 0;
  });
  const tSet = T('y3') - 0.4;
  rise3d(st.el, tSet, { rx: 18, z: 600, y: 60, d: 0.9 }); sfx('whoosh', tSet, { g: 0.5 }); focusOn(app.el, tSet, 0.4); focusOff(app.el, T('y4') - 0.4, 0.5);
  sink3d(st.el, T('y4') - 0.4, { d: 0.5 });
  // y4：底栏这条对话的费用
  const cB = box(foot.cost, world);
  ringOn(app.el, foot.cost, T('y4', '每个对话') - 0.1, T('y4', '底部') - 0.95, { pad: 4 });
  // 点开底栏金额：StatPopover + SessionSpending.tsx。宽 360、内边距 16，本片 ×1.78 → 640 与 28；左缘对齐触发项、在它上方 8px（本片 14），
  // 离窗口边缘至少 12px（本片 21）。只淡入 140ms、淡出 120ms；打开期间触发项是中性灰的悬停底
  const BW = app.body.offsetWidth, BH = app.body.offsetHeight;
  const popAt = (p, trig) => { const b = box(trig, app.body); css(p, { left: Math.max(21, Math.min(b.x, BW - 21 - 640)) + 'px', bottom: (BH - b.y + 14) + 'px' }); };
  const POP = { width: '640px', boxSizing: 'border-box', padding: '28px', whiteSpace: 'normal', fontSize: '22px', lineHeight: '1.5', zIndex: 5, borderRadius: '18px', boxShadow: '0 18px 48px rgba(10,14,30,.16), 0 2px 6px rgba(10,14,30,.06)' };
  const HINT = 'color:#5d626b;font-size:22px;line-height:1.55;margin-top:14px';
  const HOV = 'rgba(15,20,30,.07)', NOH = 'rgba(15,20,30,0)';
  const cp = h('div', 'panel', app.body); css(cp, POP);
  cp.innerHTML = `<div style="font-size:25px;font-weight:500;margin-bottom:21px">本对话费用</div><div style="font:500 42px/1.2 Inter;font-variant-numeric:tabular-nums;margin-bottom:21px">￥0.18</div>
    <div style="display:grid;grid-template-columns:max-content 1fr;gap:14px;height:190px"><div style="display:flex;flex-direction:column;justify-content:space-between;padding:4px 0;color:#5d626b;font-variant-numeric:tabular-nums;line-height:1.3"><span>￥0.18</span><span>￥0.01</span></div><div class="cv" style="min-width:0"></div></div>
    <div style="display:flex;justify-content:space-between;padding-top:6px;color:#5d626b;font-variant-numeric:tabular-nums"><span>17:05</span><span>17:33</span></div>
    <div style="${HINT}">悬停或轻触查看采样，聚焦后可用方向键逐点查看</div><div style="${HINT}">已记录 18 次模型请求</div><div style="${HINT}">按本对话记录的回答与重试用量、当前配置费率估算；不含继承的消息、独立旁问及辅助请求，不作为账单。</div>`;
  popAt(cp, foot.cost);
  // 累计费用曲线：与余额曲线同一个组件（BalanceHistory），这里没有缩短的时段，所以是一条实线；三条虚线网格，左侧最高与最低金额
  const cvEl = cp.querySelector('.cv'), cw = cvEl.offsetWidth, ch = 190;
  const csv = svg('svg', { width: cw, height: ch, viewBox: `0 0 ${cw} ${ch}` }, cvEl); css(csv, { display: 'block', overflow: 'visible' });
  const gy = [12, 55, 98].map((v) => v / 110 * ch);
  gy.forEach((y) => svg('line', { x1: 0, x2: cw, y1: y, y2: y, stroke: '#dfe2e8', 'stroke-width': 1.2, 'stroke-dasharray': '5 7' }, csv));
  const CUM = [[0, 0.01], [0.09, 0.02], [0.2, 0.034], [0.3, 0.05], [0.41, 0.066], [0.52, 0.088], [0.63, 0.105], [0.74, 0.128], [0.86, 0.152], [1, 0.18]];
  const cyOf = (v) => gy[2] - (v - 0.01) / 0.17 * (gy[2] - gy[0]);
  svg('polyline', { points: CUM.map(([x, v]) => `${(cw * 6 / 264 + x * cw * 252 / 264).toFixed(1)},${cyOf(v).toFixed(1)}`).join(' '), fill: 'none', stroke: '#2563EB', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, csv);
  const tCp = T('y4', '底部') - 0.9, tCpX = T('y5') - 0.1;
  popIn(cp, tCp); popOut(cp, tCpX); sfx('pop', tCp);
  fromTo(foot.cost, tCp, { backgroundColor: NOH }, { backgroundColor: HOV, duration: 0, immediateRender: false });
  fromTo(foot.cost, tCpX, { backgroundColor: HOV }, { backgroundColor: NOH, duration: 0, immediateRender: false });
  // y5、y5b：一块「额度百分比」表盘从右边转进来；底栏的限额项还是「未启用」
  makeRoom(T('y5') - 0.6, col, comp.c);
  const gauge = h('div', 'card3d', world); px(gauge, 1380, 220, 380, 380); css(gauge, { display: 'grid', placeItems: 'center', borderRadius: '30px', '--mc': MC.def });
  gauge.innerHTML = `<svg width="260" height="260" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="none" stroke="#eceef2" stroke-width="12"/><circle class="arc" cx="60" cy="60" r="48" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="301.6" stroke-dashoffset="301.6"/></svg><div style="position:absolute;text-align:center"><div class="pc" style="font:800 64px Inter">0%</div><div style="color:#5d626b;font-size:24px">5 小时额度</div></div>`;
  gauge.dataset.name = '额度表盘';
  const arc = gauge.querySelector('.arc');
  tl.fromTo(gauge, { autoAlpha: 0, rotationY: -60, x: 260, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: -14, x: 0, z: 0, duration: 0.8, ease: 'power3.out', immediateRender: true }, T('y5', 'Coding') - 0.4);
  // 表盘：y5 充到 63%；y5b「没有」时清空变灰（官方版里没有这个数）；y6「这种」时重新充满到 63%，y6b 再缩进底栏
  const OFF = 301.6, ON = 301.6 * (1 - 0.632);
  const tFill = T('y5', 'Coding'), tDrain = T('y5b', '没有') - 0.05, tRefill = T('y6', '这种') - 0.1;
  fromTo(arc, tFill, { strokeDashoffset: OFF }, { strokeDashoffset: ON, duration: 1.0, ease: 'power2.out' });
  fromTo(arc, tDrain, { strokeDashoffset: ON, stroke: '#2563EB' }, { strokeDashoffset: OFF, stroke: '#c3c8d2', duration: 0.05, ease: 'none', immediateRender: false });
  // 表盘整块翻过去：转到侧面时换成「没有百分比」的空表（官方版里没有这个数），转回来；y6 再翻一次，转回来时重新充到 63%
  const flipG = (t) => {
    fromTo(gauge, t - 0.25, { rotationY: -14 }, { rotationY: 90, duration: 0.25, ease: 'power2.in', immediateRender: false });
    fromTo(gauge, t, { rotationY: -90 }, { rotationY: -14, duration: 0.35, ease: 'power2.out', immediateRender: false });
    sfx('whoosh', t - 0.25, { g: 0.3 });
  };
  flipG(tDrain); flipG(tRefill);
  fromTo(arc, tRefill, { strokeDashoffset: OFF, stroke: '#c3c8d2' }, { strokeDashoffset: ON, stroke: '#2563EB', duration: 0.9, ease: 'power2.out', immediateRender: false });
  const pc = gauge.querySelector('.pc'); let pcLast = null;
  F((t) => {
    let v;
    if (t < tDrain) v = Math.round(63 * ease.out5(clamp((t - tFill) / 1.0))) + '%';
    else if (t < tRefill) v = '—';
    else v = Math.round(63 * ease.out5(clamp((t - tRefill) / 0.9))) + '%';
    if (v !== pcLast) { pc.textContent = v; pcLast = v; }
  });
  fromTo(pc, tDrain, { color: '#1f2329' }, { color: '#868c97', duration: 0.05, immediateRender: false });
  fromTo(pc, tRefill, { color: '#868c97' }, { color: '#1f2329', duration: 0.5, immediateRender: false });
  sfx('tick', tRefill + 0.1, { g: 0.5 });
  sfx('whoosh', T('y5', 'Coding') - 0.4, { g: 0.4 });
  const limR = ringOn(app.el, foot.lim, T('y5b', '没有') - 0.1, T('y6b') - 0.1, { pad: 4, c: '#f59e0b' });
  // y6b：表盘缩进底栏的限额项，限额项变成 5h 63%，弹出额度限制（照 spend-footer 截图）
  const lB = box(foot.lim, world), gB = box(gauge, world);
  const tG = T('y6b') - 0.1;
  tl.fromTo(gauge, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: lB.cx - gB.cx, y: lB.cy - gB.cy, scale: 0.12, autoAlpha: 0, duration: 0.6, ease: 'power3.in', immediateRender: false }, tG);
  keyed(foot.lim.querySelector('.v')).at(tG + 0.55, { html: '5h 63%' }); sfx('pop', tG + 0.6);
  // 限额项的浮层（照 spend-footer 截图与 SessionSpending.tsx）：同一种 StatPopover，只淡入淡出；进度条 4px（本片 7px）
  const pop = h('div', 'panel', app.body); css(pop, POP);
  const bar = (k, pc, a, b) => `<div style="margin-top:21px"><div style="display:flex;justify-content:space-between;align-items:baseline;font-variant-numeric:tabular-nums"><span>${k}</span><span>${pc}% · ￥${a} / ￥${b}</span></div><div style="margin-top:11px;height:7px;border-radius:4px;background:#e6e8ec;overflow:hidden"><i style="display:block;height:100%;width:${pc}%;background:#2563EB"></i></div></div>`;
  pop.innerHTML = `<div style="font-size:25px;font-weight:500;margin-bottom:7px">额度限制</div><div style="${HINT}">额度保护中</div>${bar('5 小时', '63.2', '12.64', '20.00')}${bar('7 天', '8.4', '12.64', '150.00')}<div style="${HINT}">所有对话共用，比例包含已结算估算与在途预留。可在设置 → 额度调整各窗口。</div>`;
  popAt(pop, foot.lim);
  const tPop = tG + 0.65, tPopX = T('y7') - 0.3;
  popIn(pop, tPop); popOut(pop, tPopX);
  fromTo(foot.lim, tPop, { backgroundColor: NOH }, { backgroundColor: HOV, duration: 0, immediateRender: false });
  fromTo(foot.lim, tPopX, { backgroundColor: HOV }, { backgroundColor: NOH, duration: 0, immediateRender: false });
  ringOn(app.el, pop, T('y6b', '周限额') - 0.1, Tend('y6b') + 0.2, { pad: 4 });
  // y7：六档限额像一叠卡片从景深里展开（照 spend-limits 截图与 SpendingView.tsx 的卡片）：开关、标题、金额输入框；已用 / 限额与比例（关着的写「未启用」）；
  // 进度条（关着的是灰色）；费用估算、在途预留、剩余额度与「重置」。开着 5 小时与 7 天；y7b 再给自己打开「1 小时」和「1 天」。
  // 花费都发生在最近 5 小时、最近 1 小时内没有：1 天与 30 天也是 ¥12.64，15 分钟与 1 小时是 ¥0.00
  const tiers = [['15 分钟', 5, 0, false], ['1 小时', 15, 0, false], ['5 小时', 20, 12.64, true], ['1 天', 100, 12.64, false], ['7 天', 150, 12.64, true], ['30 天', 2000, 12.64, false]];
  const dim = h('div', 'scrim', world); css(dim, { background: 'rgba(238,241,247,.62)' }); focusOn(app.el, T('y7') - 0.35, 0.4); set(dim, s.start, { autoAlpha: 0 }); fadeIn(dim, T('y7') - 0.35, { y: 0, d: 0.35 });
  const money = (v) => '¥' + v.toFixed(2), pctOf = (a, v) => Math.min(100, a / v * 100);
  const ON_B = '#b9c9ef', OFF_B = '#e3e6eb', GREY = '#9aa0ab';
  const CHEV = '<svg width="16" height="28" viewBox="0 0 8 14" style="display:block;flex:none"><path d="M1.6 5 4 2.6 6.4 5M1.6 9 4 11.4 6.4 9" fill="none" stroke="#6b7079" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const GX = 128, GW = 820, GG = 24;
  const head = h('div', 'card3d', world); px(head, GX, 104, 2 * GW + GG); css(head, { boxSizing: 'border-box', padding: '20px 30px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderRadius: '20px' });
  head.innerHTML = '<span style="font-size:29px;font-weight:500">额度限制</span><span class="cnt" style="color:#5d626b;font-size:22px">2 项限额生效</span>';
  const tStack = T('y7', '更多') - 0.5;
  tl.fromTo(head, { autoAlpha: 0, z: -700, rotationX: 30, y: 80, transformPerspective: P3 }, { autoAlpha: 1, z: 0, rotationX: 0, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tStack - 0.12);
  const tc = tiers.map(([k, v, a, on], i) => {
    const c = h('div', 'card3d', world); px(c, GX + (i % 2) * (GW + GG), 204 + Math.floor(i / 2) * 238, GW);
    css(c, { boxSizing: 'border-box', padding: '24px 30px', fontSize: '22px', '--mc': MC.def, borderRadius: '20px', border: `2px solid ${on ? ON_B : OFF_B}` });
    c.innerHTML = `<div style="display:flex;align-items:center;gap:18px"><span class="toggle${on ? ' on' : ''}"><i></i></span><span style="font-size:28px;font-weight:500">${k}</span>
      <span style="margin-left:auto;box-sizing:border-box;width:236px;height:52px;border:1px solid var(--line);border-radius:12px;display:flex;align-items:center;gap:20px;padding:0 12px 0 20px;font-size:25px;font-variant-numeric:tabular-nums"><span style="color:#6b7079">¥</span><span style="flex:1">${v}</span>${CHEV}</span></div>
      <div style="display:flex;justify-content:space-between;color:#5d626b;margin-top:20px;font-variant-numeric:tabular-nums"><span>${money(a)} / ${money(v)}</span><span class="pct">${on ? pctOf(a, v).toFixed(1) + '%' : '未启用'}</span></div>
      <div style="margin-top:12px;height:7px;border-radius:4px;background:#e6e8ec;overflow:hidden"><i class="fill" style="display:block;height:100%;width:${pctOf(a, v)}%;background:${on ? '#2563EB' : GREY}"></i></div>
      <div style="display:flex;align-items:center;justify-content:space-between;color:#5d626b;margin-top:14px;font-variant-numeric:tabular-nums"><span style="display:flex;gap:22px"><span>费用估算 ${money(a)}</span><span>在途预留 ¥0.00</span><span>剩余额度 ${money(v - a)}</span></span><span style="color:#1f2329;padding:0 14px">重置</span></div>`;
    c.dataset.name = k + '限额';
    tl.fromTo(c, { autoAlpha: 0, z: -900 - i * 120, rotationX: 40, y: 120, transformPerspective: P3 }, { autoAlpha: 1, z: 0, rotationX: 0, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tStack + i * 0.09);
    return c;
  });
  sfx('whoosh', tStack, { g: 0.5 });
  // y7b：「防」打开 1 小时、「控」打开 1 天——开关拨过去，卡片描边变蓝，「未启用」换成比例，灰色进度条变成蓝色，上方的生效项数跟着加
  const cnt = keyed(head.querySelector('.cnt'));
  [[1, T('y7b', '防') - 0.1, '3 项限额生效'], [3, T('y7b', '控') - 0.1, '4 项限额生效']].forEach(([i, t, n]) => {
    const c = tc[i], [, v, a] = tiers[i];
    toggleOn(c.querySelector('.toggle'), t, MC.def);
    fromTo(c, t, { borderColor: OFF_B }, { borderColor: ON_B, duration: 0.18, ease: 'power2.inOut', immediateRender: false });
    fromTo(c.querySelector('.fill'), t, { backgroundColor: GREY }, { backgroundColor: '#2563EB', duration: 0.24, ease: 'power2.inOut', immediateRender: false });
    keyed(c.querySelector('.pct')).at(t + 0.05, { html: pctOf(a, v).toFixed(1) + '%' });
    cnt.at(t + 0.05, { html: n });
  });

  // y4 的镜头：让浮层整块与底栏都在画面里
  const cpB = box(cp, world), y4Top = cpB.y - 36, y4Bot = cB.b + 30, zY4 = Math.min(1.3, 1080 / (y4Bot - y4Top));
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [T('y1', '左下角') - 0.6, zBal, 1.7],
    [T('y3') - 0.5, { x: 960, y: 540, z: 1 }, 0.9],
    [T('y3', '曲线') - 0.3, { x: 1120, y: 560, z: 1.15 }, 0.8],   // 推近曲线：读数框看得清，底下的说明不进字幕条
    [T('y4', '每个对话') - 0.5, { x: 1156, y: (y4Top + y4Bot) / 2, z: zY4 }, 0.9],
    [T('y5') - 0.3, { x: 960, y: 540, z: 1 }, 0.9],
  ]);
});

scene('memory', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  stageBg(world, 'wri');
  // 设置 → 通用 页面作底，跨对话记忆的管理框立在上面（照 memory 截图与 ui-settings-memory 的文案）：搜索框与两个下拉框、新增记忆；
  // 已保存记录数与「刷新」；保留说明；「检索上限」折叠项；每条记录：类型、范围、状态、标题、正文、来源、编辑 / 禁用 / 删除。列表在框里滚动，第三条只露出一点
  const st = settings(world, '通用');
  const scrim = h('div', 'scrim', st.el);
  const dl = dialog(world, 200, 66, 1040, '跨对话记忆', { h: 790 });
  css(dl.d, { overflow: 'hidden' }); css(dl.body, { height: '719px', overflow: 'hidden' });
  const CHV = '<svg width="20" height="20" viewBox="0 0 24 24" style="flex:none"><path d="m6 9 6 6 6-6" fill="none" stroke="#5d626b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const FIELD = 'box-sizing:border-box;height:54px;border:1px solid var(--line);border-radius:12px;display:flex;align-items:center;padding:0 16px';
  dl.body.innerHTML = `<div style="display:flex;gap:14px;align-items:center"><span style="${FIELD};width:300px;color:#6b7079">搜索已保存的记录</span><span style="${FIELD};width:230px;justify-content:space-between">全部范围${CHV}</span><span style="${FIELD};width:230px;justify-content:space-between">全部类型${CHV}</span><span class="btn dark" style="box-sizing:border-box;height:54px;padding:0 20px">新增记忆</span></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span style="color:#3b3f46">已保存记录：5</span><span style="font-size:22px;padding-right:8px">刷新</span></div>
    <div style="color:#5d626b;font-size:22px;margin-top:4px">删除对话不会自动删除已保存的记忆；删除记忆会停止后续检索，但不会改写已有对话。</div>
    <div style="display:flex;align-items:center;gap:10px;color:#3b3f46;font-size:22px;margin-top:6px"><svg width="12" height="14" viewBox="0 0 12 14"><path d="M1 1v12l10-6z" fill="#3b3f46"/></svg>检索上限</div>
    <div class="recs" style="display:flex;flex-direction:column;gap:14px;margin-top:10px"></div>`;
  const recs = dl.body.querySelector('.recs');
  const BTN = 'display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:10px;font-size:22px';
  const rec = (tag, scope, title, body) => {
    const r = h('div', '', recs, `<div style="display:flex;gap:14px;align-items:center;font-size:22px;color:#5d626b"><span class="chip" style="border:1px solid var(--line);background:#fff;font-size:22px;color:#3b3f46">${tag}</span><span>${scope}</span><span style="margin-left:4px">已启用</span></div>
      <div class="rt" style="font-size:25px;margin-top:8px;align-self:flex-start">${title}</div><div style="margin-top:4px">${body}</div><div style="color:#5d626b;font-size:22px;margin-top:6px">来源会话仍在会话库中</div>
      <div style="display:flex;gap:8px;margin-top:10px"><span style="${BTN};border:1px solid var(--line)">编辑</span><span style="${BTN}">禁用</span><span style="${BTN}">删除</span></div>`);
    css(r, { border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 22px', background: '#fff', display: 'flex', flexDirection: 'column' }); return r;
  };
  const r1 = rec('写作设定', '不限工作区 · 写作', '《雾港》视角约定', '《雾港》林晚视角，第三人称限知；周屿的身份到第九章揭晓。');
  const r2 = rec('项目事实', 'acme-shop · 网安', '案件 acme-upload', '上传接口 F-0001 路径穿越已确认，修复待回归验证。');
  const r3 = rec('操作结论', 'acme-shop · 缺省', '搜索结果消失', '搜索竞态已用递增请求序号修复，回归测试见 tests/search.test.mjs。');
  const tIn = s.start - 0.25;
  fromTo(st.el, tIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  rise3d(dl.d, T('k1', 'D') - 0.1, { rx: 18, z: 600, y: 60, d: 0.9 }); sfx('whoosh', T('k1', 'D') - 0.1, { g: 0.5 });
  [r1, r2, r3].forEach((r, i) => fadeIn(r, T('k1', '跨') - 0.1 + i * 0.25, { y: 18 }));
  // k2：「偏好」「项目约定」两条依次亮起；第一条的标题被拎起来（不透明的小卡片盖在原来的标题上，不与它叠字），飞进一条新会话、留在那里
  ringOn(world, r1, T('k2', '偏好') - 0.1, T('k2', '以后') - 0.1, { pad: 4, c: MC.wri });
  ringOn(world, r2, T('k2', '项目约定') - 0.1, T('k2', '以后') - 0.1, { pad: 4, c: MC.wri });
  const nw = h('div', 'card3d', world); px(nw, 1290, 540, 560); css(nw, { padding: '24px 28px', fontSize: '24px', '--mc': MC.wri });
  nw.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><b>《雾港》第八章</b><span class="pill" style="padding:4px 12px">${icon('pen')} 写作</span></div><div class="bubble" style="margin-top:16px;max-width:none">接着写第八章：周屿第一次上灯塔</div><div class="got" style="margin-top:16px;height:46px"></div>`;
  nw.dataset.name = '新会话';
  const tNw = T('k2', '以后') - 0.4;
  tl.fromTo(nw, { autoAlpha: 0, rotationY: -50, x: 200, z: -300, transformPerspective: P3 }, { autoAlpha: 1, rotationY: -12, x: 0, z: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tNw);
  const g = h('div', 'chip', world, `${icon('memory')}<span>《雾港》视角约定</span>`); css(g, { position: 'absolute', background: '#fff', border: '1px solid var(--line)', fontSize: '25px', height: '46px', boxSizing: 'border-box', '--mc': MC.wri });
  const tb = box(r1.querySelector('.rt'), world), gb = box(nw.querySelector('.got'), world);
  const gOff = g.querySelector('span').offsetLeft;   // 图标与内边距的宽度：小卡片里的字正好盖在标题上
  const g0x = tb.x - gOff, g0y = tb.y + tb.h / 2 - 23;
  px(g, g0x, g0y);
  const tLift = T('k2', '找') - 0.75;
  appear(g, tLift);
  fromTo(g, tLift, { scale: 1, boxShadow: '0 1px 2px rgba(0,0,0,.08)' }, { scale: 1.06, boxShadow: '0 16px 34px rgba(0,0,0,.35)', duration: 0.18, ease: 'power2.out' });
  fromTo(g, tLift + 0.18, { x: 0, y: 0, scale: 1.06 }, { x: gb.x - g0x, y: gb.y - g0y, scale: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  fromTo(g, tLift + 0.98, { boxShadow: '0 16px 34px rgba(0,0,0,.35)' }, { boxShadow: '0 1px 2px rgba(0,0,0,.08)', duration: 0.25, ease: 'power2.out', immediateRender: false });
  sfx('whoosh', tLift + 0.18, { g: 0.4 }); sfx('pop', tLift + 0.98);
  [dl.d, nw, g].forEach((e) => fadeOut(e, s.end - 0.5, { d: 0.3 }));
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(s.start + 0.5, s.end, -1)]);
});
