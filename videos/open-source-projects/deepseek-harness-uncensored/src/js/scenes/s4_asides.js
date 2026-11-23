// 03 通用增强 · 旁问、随问与输入预测。开头六项增强排成一圈 3D 的卡片转过来（x1、x1b），随后都收进同一条正在跑长任务的会话：
// /btw 随问的卡片浮在输入框上方（x3–x3c）；/side 旁问的一栏从右边展开（x4–x6b）；关上旁问，镜头推到输入框，演示输入预测（x11–x12）。
scene('asides', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const bg = stageBg(world, 'def');

  // ── x1、x1b：六项增强，封面流式的一排 3D 卡片：中间的正对观众，两边的斜着往后退；整排慢慢向左滑过 ──
  const feats = [['side', '旁问', '/side'], ['chat', '随问', '/btw'], ['edit', '输入预测', 'Tab 收下'], ['wallet', '余额与曲线', '侧栏常驻'], ['limit', '额度限制', '六档可选'], ['memory', '跨对话记忆', '按范围检索']];
  const N = feats.length, SP = 330;
  const fc = feats.map(([ic, k, sub]) => {
    const c = h('div', 'card3d', world); px(c, 960 - 160, 330, 320, 300);
    css(c, { padding: '40px 26px', textAlign: 'center', '--mc': MC.def });
    c.innerHTML = `<div style="color:var(--mc)">${icon(ic, 'style="width:64px;height:64px"')}</div><div style="font-size:40px;font-weight:700;margin-top:18px">${k}</div><div style="color:#5d626b;font-size:26px;margin-top:8px" class="${sub.startsWith('/') ? 'mono' : ''}">${sub}</div>`;
    c.dataset.name = k;
    return c;
  });
  const tA = c0 + 0.05, tB = T('x2') - 0.1;
  F((t) => {
    const k = clamp((t - tA) / (tB - tA)), slideX = lerp(1.2, -1.2, ease.io3(k)) * SP;
    const gather = clamp((t - (tB - 0.6)) / 0.6), enter = clamp((t - tA) / 0.9);
    fc.forEach((c, i) => {
      const x0 = (i - (N - 1) / 2) * SP + slideX, u = clamp(x0 / 700, -1, 1);
      const x = x0 * (1 - 0.8 * ease.io3(gather)), ry = -u * 42, z = -Math.abs(u) * 260 - 400 * (1 - ease.out3(enter));
      const y = 50 * (1 - ease.out3(enter)) - 120 * ease.io3(gather);
      c.style.transform = `perspective(${P3}px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${(1 - 0.5 * ease.io3(gather)).toFixed(3)})`;
      c.style.opacity = (Math.min(enter * 1.5, 1) * (1 - gather) * (1 - 0.45 * Math.abs(u))).toFixed(3);
      c.style.visibility = t < tA || gather >= 1 ? 'hidden' : 'visible';
      c.style.zIndex = String(Math.round(1000 - Math.abs(x0)));
    });
  });
  sfx('whoosh', tA, { g: 0.6 }); sfx('chime', T('x1b', '通用') , { g: 0.4 });

  // ── 会话窗口：主线正在跑长任务 ──
  const wrap = h('div', 'abs', world); css(wrap, { inset: '0' });
  const app = makeApp(wrap, { mode: 'def', title: '升级依赖并修复测试', sessions: [['升级依赖并修复测试', 'def', true, true], ['整理发布说明', 'def'], ['审计上传接口', 'sec']] });
  const col = column(app.body, { top: 26 });
  h('div', 'bubble', col, '把项目依赖升级到最新的小版本，修复升级后失败的测试，最后整理一份变更说明。');
  const L = [
    step(col, 'think', '思考', '先列出计划。'),
    h('div', 'say', col, '先列计划，再逐项升级。'),
    step(col, 'tasks', '更新任务清单', '1/3 已完成 · 升级并修复失败的测试 新增 3'),
    step(col, 'search', '搜索文件内容', 'results'),
    step(col, 'doc', '读取', '<u>tests\\search.test.mjs</u>'),
  ];
  const run = h('div', 'step run', col, `<span class="si">${icon('send')}</span><span class="rt">深度求索中，用时 4 秒 …</span>`);
  const rt = run.querySelector('.rt');
  F((t) => { const n = Math.max(1, Math.floor(t - (T('x2') - 3))); const v = `深度求索中，用时 ${n} 秒 …`; if (rt.textContent !== v) rt.textContent = v; });
  const comp = composer(app.body, { busy: true }); comp.send.classList.add('ready');
  const doneStep = step(col, 'tasks', '更新任务清单', '3/3 已完成 更新 3'), doneActs = msgActions(col, '17:33');
  [doneStep, doneActs].forEach((e) => set(e, s.start, { autoAlpha: 0 }));
  const taskbar = h('div', 'abs', app.body); css(taskbar, { left: '174px', bottom: '196px', width: '1040px', display: 'flex', gap: '14px', alignItems: 'center', color: '#5d626c', fontSize: '22px', border: '1px solid var(--line)', borderRadius: '12px', padding: '8px 18px', background: '#fff' });
  taskbar.innerHTML = `${icon('tasks')}<b style="color:var(--ink);font-weight:500">任务</b> 1 已完成 · 1 进行中 · 1 待处理`;
  const foot = footbar(app.body, { turns: '1 轮 2 步 · 449 tok/s', tok: '43.3K tok · 缓存命中 0%', cost: '¥0.09' });
  const tW = T('x2') - 0.7;
  // 主线这一轮在提旁问之前跑完（第 3 项也做完了）：运行行收起，补上任务清单与消息操作行，停止键回到发送键（空输入框时是浅色）
  const tDone = T('x5') - 0.6;
  // 侧栏的峰谷倒计时每秒走一格；spend 场用同一个起点（窗口出现的时刻）接着走，换场时不回跳
  const CD0 = 39 * 3600 + 22 * 60 + 15;
  F((t) => { const v = Math.max(0, CD0 - Math.max(0, Math.floor(t - tW))); const str = `${String(Math.floor(v / 3600)).padStart(2, '0')}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; if (app.cd.textContent !== str) app.cd.textContent = str; });
  rise3d(wrap, tW, { rx: 14, z: 700, y: 50, d: 1.0 }); sfx('whoosh', tW, { g: 0.5 });
  [...L, run].forEach((e) => appear(e, tW));
  // 主线一直在动：转圈、计时
  // 侧栏的转圈由 stateDot 自己按时间驱动（parts.js）

  // ── x3：/btw 随问 ──
  const PH = '发消息或创建任务，/ 调用指令，@ 文件或对话';
  const tT1 = T('x3', '/btw') - 0.6;
  const q1 = '/btw 进度如何';
  const tS1 = typeEnd(tT1, q1, 14);
  sfx('pop', tS1 + 1.1);
  // 随问卡片照 btw-progress 截图与 AsidePanel.module.css：标题栏与内容之间一条细分隔线；打开时从 y 6px 淡入 200ms（ease-out，本片 ×1.8 ≈ 11px）；
  // 提交后内容区先是居中的 20px 加载圈（800ms 一圈），回答到了再换成问答。第二次 /btw 卡片不动，只换内容
  const b1 = h('div', 'abs', app.body); css(b1, { left: '174px', bottom: '252px', width: '1040px', border: '1px solid var(--line)', borderRadius: '16px', background: '#fff', boxShadow: '0 12px 36px rgba(0,0,0,.10)', whiteSpace: 'normal', fontSize: '23px', lineHeight: '1.55', overflow: 'hidden' });
  b1.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:12px 20px;font-weight:500;border-bottom:1px solid #e6e8ec">${icon('plus')} 随问<span style="margin-left:auto;display:inline-flex">${icon('x')}</span></div><div class="bc"></div>`;
  const bc = b1.querySelector('.bc');
  const qa = (q, a) => `<div style="padding:14px 22px 18px"><div style="border-left:3px solid var(--mc);padding-left:12px;color:#5d626b;font-size:22px">${q}</div><div style="margin-top:10px">${a}</div></div>`;
  const SPIN = '<div style="display:flex;justify-content:center;padding:30px 0"><svg class="bspin" width="36" height="36" viewBox="0 0 24 24" style="display:block"><path d="M12 3a9 9 0 1 0 9 9" fill="none" stroke="#5d626b" stroke-width="2.2" stroke-linecap="round"/></svg></div>';
  bc.innerHTML = SPIN;
  b1.dataset.name = '随问卡片';
  const tB1 = tS1 + 0.4;
  tl.fromTo(b1, { autoAlpha: 0, y: 11 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power1.out', immediateRender: true }, tB1);
  keyed(bc).at(tB1 + 0.7, { html: qa('进度如何', '主线正在进行第 2 项“升级并修复失败的测试”：已列出可升级的依赖，刚读完 <code>tests/search.test.mjs</code>，正在分析失败原因。变更说明还没开始写。') });
  F((t) => { const sp = bc.querySelector('.bspin'); if (sp) sp.style.transform = `rotate(${(((t % 0.8) / 0.8) * 360).toFixed(1)}deg)`; });
  // x3b：Claude Code 的 /btw 是什么
  const nCC = note(world, 1110, 392, `<div class="k" style="display:flex;align-items:center;gap:12px;letter-spacing:1px">${LOGO.claude()}<span style="font-size:26px;color:#fff">Claude Code</span><span class="mono" style="font-size:24px">/btw</span></div>问一句当前会话的事，答案不进对话记录`, 560);
  fadeIn(nCC, T('x3b', 'Claude') - 0.1, { x: 20 }); fadeOut(nCC, T('x3c') + 0.6, { d: 0.3 });
  // x3c：再问一句，卡片原地不动，内容先换成加载圈，再换成新的问答
  const q2 = '/btw 这个报错什么意思';
  const tT2 = T('x3c', '简单') - 0.4;
  const tS2 = typeEnd(tT2, q2, 16);
  keyed(bc).at(tS2 + 0.25, { html: SPIN }).at(tS2 + 0.95, { html: qa('这个报错什么意思', '断言还按旧版本的返回格式在比；升级后字段名变了，所以这条测试失败，不是搜索逻辑本身的问题。') });
  sfx('pop', tS2 + 0.95);
  fadeOut(b1, T('x4') - 0.2, { d: 0.15 });
  // 随问卡片占住输入框上方：对话往上滚一段，主线「深度求索中」那一行留在卡片上面看得见（真实窗口更高，不必滚）
  fromTo(col, tB1, { y: 0 }, { y: -78, duration: 0.3, ease: PANEL_EASE });
  fromTo(col, T('x4') - 0.2, { y: -78 }, { y: 0, duration: 0.3, ease: PANEL_EASE, immediateRender: false });

  // ── x4：/side 旁问。照 side-question 截图与 AppFrame.module.css：栏宽 0.3s 缓动，旁问栏贴着右边露出来，中间一栏随之收窄 ──
  const tT3 = T('x4', 'side') - 0.6;
  const tS3 = typeEnd(tT3, '/side', 12);
  const side = h('div', 'abs', app.main); css(side, { right: '0', top: '0', bottom: '0', width: '660px', background: '#fff', borderLeft: '1px solid var(--line)', whiteSpace: 'normal', zIndex: 4 });
  side.innerHTML = `<div style="height:80px;display:flex;align-items:center;gap:14px;padding:0 22px"><span class="chip" style="background:#f1f2f4">${icon('side')} 旁问 <span style="color:#6b7079">${icon('x', 'style="width:20px;height:20px"')}</span></span><span style="color:#6b7079">${icon('plain')}</span><span style="margin-left:auto;display:inline-flex;gap:18px;color:#646973">${icon('split')}${icon('full')}${icon('panelR')}</span></div>
    <div class="sync" style="color:#5d626b;font-size:22px;padding:0 24px 12px;border-bottom:1px solid var(--line)">每次提问同步主线已完成的新进展，旁问内容独立保留</div>
    <div class="sc" style="padding:16px 24px;display:flex;flex-direction:column;gap:12px;font-size:23px;line-height:1.55"></div>`;
  const sc = side.querySelector('.sc'), sync = side.querySelector('.sync');
  const sq = h('div', 'bubble', sc, '已完成的那一项里，有没有改了导出名的依赖？'); css(sq, { maxWidth: '520px' });
  // 旁问作答时，问题下面是同一种运行行（深度求索中 + 计时），回答到了就收起（不占位）
  const srun = h('div', 'step run', sc, `<span class="si">${icon('send')}</span><span class="rt">深度求索中，用时 1 秒 …</span>`); css(srun, { height: '36px', overflow: 'hidden' });
  const sa = [step(sc, 'inject', '上下文注入', 'runtime-context'), h('div', 'say', sc, '有两个：一个改了默认导出，一个改成只提供 ESM。主线后面修测试时会碰到。')];
  const scomp = composer(side, { ph: '旁问：在这里输入你的问题', pw: 660, w: 600 });
  // 旁问自己的底栏（side-question 截图里两栏各有一条）：有了问答才出现，/clear 后随记录一起清掉
  const sfoot = footbar(side, { turns: '1 轮 1 步 · 154 tok/s', tok: '21.6K tok · 缓存命中 0%', cost: '¥0.04' });
  // 栏窄时底栏折成两行居中（side-question 截图里主线那一栏就是这样），输入框随之上移一行
  const FOOT2 = { flexWrap: 'wrap', rowGap: '2px', padding: '0 30px' }, UP = 36;
  css(sfoot.f, FOOT2); css(scomp.c, { bottom: (58 + UP) + 'px' });
  const tSide = tS3 + 0.3;
  appear(side, tSide);
  fromTo(side, tSide, { clipPath: 'inset(0px 0px 0px 660px)' }, { clipPath: 'inset(0px 0px 0px 0px)', duration: PANEL_D, ease: PANEL_EASE });
  sfx('whoosh', tSide, { g: 0.3 });
  // 主线这一栏随栏宽收窄：对话栏、输入框、任务条、底栏在剩下的 728 宽里居中；标题栏的按钮跟着左移，侧栏开关挪进旁问的标题栏
  const PANEL = { ease: PANEL_EASE, duration: PANEL_D, immediateRender: false };
  fromTo(col, tSide, { left: 174, width: 1040 }, { left: 34, width: 660, ...PANEL });
  fromTo(comp.c, tSide, { left: 154, width: 1080 }, { left: 24, width: 680, ...PANEL });
  fromTo(taskbar, tSide, { left: 174, width: 1040 }, { left: 34, width: 660, ...PANEL });
  fromTo(foot.f, tSide, { right: 0 }, { right: 660, ...PANEL });
  fromTo(comp.c, tSide, { bottom: 58 }, { bottom: 58 + UP, ...PANEL });
  fromTo(taskbar, tSide, { bottom: 196 }, { bottom: 196 + UP, ...PANEL });
  fromTo(app.hdr, tSide, { paddingRight: 30 }, { paddingRight: 690, ...PANEL });
  const hic = app.hdr.querySelector('.hic');
  keyed(hic).at(tSide, { html: icon('side') + icon('dots') });
  // x4b：Codex 的 /side 是什么
  const nCX = note(world, 1290, 430, `<div class="k" style="display:flex;align-items:center;gap:12px;letter-spacing:1px">${LOGO.codex()}<span style="font-size:26px;color:#fff">Codex</span><span class="mono" style="font-size:24px">/side</span></div>不打断主对话的临时旁聊`, 500);
  // 主线跑完：运行行淡出，任务清单 3/3 与消息操作行出现，任务条换成「3 已完成」，停止键换回浅色的发送键
  css(run, { height: '36px', overflow: 'hidden' });
  fromTo(run, tDone, { height: 36, marginBottom: 0, autoAlpha: 1 }, { height: 0, marginBottom: -12, autoAlpha: 0, duration: 0.2, ease: 'power1.out', immediateRender: false }); appear(doneStep, tDone + 0.15); fadeIn(doneActs, tDone + 0.35, { y: 0, d: 0.25 });
  keyed(taskbar).at(tDone + 0.15, { html: `${icon('tasks')}<b style="color:var(--ink);font-weight:500">任务</b> 3 已完成` });
  keyed(comp.send).at(tDone, { html: icon('up'), cls: 'send' });
  fadeIn(nCX, T('x4b', 'Codex') - 0.1, { y: 14 }); fadeOut(nCX, T('x5b') - 0.3, { d: 0.3 });
  // x5、x5b：同步主线已完成的进展——一张不透明的小卡片从主线那一行上抬起来（盖住而不是叠在字上），飞到旁问的同步说明上并入
  ringOn(app.el, sync, T('x5b', '自动') - 0.2, T('x6') - 0.1, { pad: 4 });
  const ghost = h('div', 'chip', world, `${icon('check')} 主线已完成：列出可升级的依赖`); css(ghost, { position: 'absolute', background: '#fff', border: '1px solid var(--line)', boxShadow: '0 12px 30px rgba(0,0,0,.30)', fontSize: '22px', color: '#15803D' });
  const gb = box(L[2], world), yb = box(sync, world);
  px(ghost, gb.x - 140, gb.y - 4);
  const tGh = T('x5b', '完成') - 0.5;
  appear(ghost, tGh);
  fromTo(ghost, tGh, { scale: 1, boxShadow: '0 2px 6px rgba(0,0,0,.12)' }, { scale: 1.05, boxShadow: '0 16px 34px rgba(0,0,0,.30)', duration: 0.18, ease: 'power2.out' });
  fromTo(ghost, tGh + 0.18, { x: 0, y: 0, scale: 1.05 }, { x: yb.x + 20 - (gb.x - 140), y: yb.y - 2 - (gb.y - 4), scale: 1, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  vanish(ghost, tGh + 1.02);
  sfx('whoosh', tGh + 0.18, { g: 0.4 }); sfx('tick', tGh + 1.0, { g: 0.5 });
  slide(sq, T('x5') + 0.1, { y: 20, d: 0.4 }); sa.forEach((e, i) => appear(e, T('x5', '对话') + 0.2 + i * 0.5));
  // ── 主线在提旁问之前跑完；旁问作答期间，侧栏这条会话行首的状态环变成 8 段虚线（DSHU 8aba03f：主线停、旁问在跑时用虚线环），答完回到空闲 ──
  const tSq = T('x5') + 0.1, tAns = T('x5', '对话') + 0.7;
  set(srun, s.start, { autoAlpha: 0 }); appear(srun, tSq + 0.35);
  const srt = srun.querySelector('.rt');
  F((t) => { const n = Math.max(1, Math.floor(t - tSq) + 1); const v = `深度求索中，用时 ${n} 秒 …`; if (srt.textContent !== v) srt.textContent = v; });
  fromTo(srun, tAns - 0.5, { height: 36, marginBottom: 0, autoAlpha: 1 }, { height: 0, marginBottom: -12, autoAlpha: 0, duration: 0.2, ease: 'power1.out', immediateRender: false });
  const sdot = app.sess[0].querySelector('.sdot'), sTrack = sdot.querySelector('circle'), sArc = sdot.querySelectorAll('circle')[1];
  let sdLast = null;
  F((t) => {
    const ph = t < tDone ? 'run' : t < tSq ? 'idle' : t < tAns ? 'dash' : 'idle';
    sdot.style.visibility = ph === 'idle' ? 'hidden' : 'visible';
    if (ph === 'dash') { sArc.setAttribute('stroke-dasharray', '3.73 3.73'); sArc.setAttribute('stroke-dashoffset', '0'); sArc.setAttribute('stroke-linecap', 'butt'); }
    else sArc.setAttribute('stroke-linecap', 'round');
    if (ph !== sdLast) { sTrack.setAttribute('opacity', ph === 'dash' ? '0' : '.25'); sdLast = ph; }
  });
  appear(sfoot.f, T('x5', '对话') + 0.7);
  // x6：/clear 清掉旁问自己的记录
  const tT4 = T('x6', 'clear') - 0.6;
  const tS4 = typeEnd(tT4, '/clear', 12);
  inputTrack(scomp.ph, '旁问：在这里输入你的问题', [[tT4, 'type', '/clear', { cps: 12 }], [tS4 + 0.25, 'text', '旁问：在这里输入你的问题']]);
  [sq, ...sa].forEach((e, i) => fadeOut(e, tS4 + 0.3 + i * 0.06, { y: -16, d: 0.3 })); sfx('whoosh', tS4 + 0.3, { g: 0.3 });
  fadeOut(sfoot.f, tS4 + 0.3, { d: 0.2 });
  // x6b：设置 → 通用 里的那个开关（真实界面的标题与说明，ui-commands 的 aside.clearOnClose / clearOnCloseDescription）
  const st = h('div', 'card3d', world); px(st, 1150, 300, 660); css(st, { padding: '26px 30px', fontSize: '25px', '--mc': MC.def });
  st.innerHTML = '<div style="color:#5d626b;font-size:22px">设置 → 通用</div><div style="display:flex;align-items:flex-start;gap:24px;margin-top:12px"><div style="flex:1"><div>旁问关闭后自动清除上下文</div><div style="color:#5d626b;font-size:22px;line-height:1.6;margin-top:6px">默认关闭，重开可接着聊；开启后关闭标签会清理旁问，主对话不受影响。也可在旁问中使用 /clear。</div></div></div>';
  const tg = toggleEl(st.lastChild); tg.style.marginTop = '2px';
  rise3d(st, T('x6b') - 0.3, { rx: 24, ry: -20, z: 400, d: 0.6 }); toggleOn(tg, T('x6b', '关掉') - 0.1);
  sink3d(st, T('x11') - 0.6, { d: 0.4 });

  // ── x11–x12：关上旁问（栏宽 0.3s 收回），镜头推到输入框，演示输入预测 ──
  const tClose = T('x11') - 0.6;
  fromTo(side, tClose, { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: 'inset(0px 0px 0px 660px)', ...PANEL });
  vanish(side, tClose + PANEL_D);
  fromTo(col, tClose, { left: 34, width: 660 }, { left: 174, width: 1040, ...PANEL });
  fromTo(comp.c, tClose, { left: 24, width: 680 }, { left: 154, width: 1080, ...PANEL });
  fromTo(taskbar, tClose, { left: 34, width: 660 }, { left: 174, width: 1040, ...PANEL });
  fromTo(foot.f, tClose, { right: 660 }, { right: 0, ...PANEL });
  fromTo(comp.c, tClose, { bottom: 58 + UP }, { bottom: 58, ...PANEL });
  fromTo(taskbar, tClose, { bottom: 196 + UP }, { bottom: 196, ...PANEL });
  // 主线底栏：分栏期间可以折行（宽度收窄到放不下时自然折成两行），收回后恢复一行
  F((t) => { const on = t >= tSide && t < tClose + PANEL_D; const v = on ? 'wrap' : 'nowrap'; if (foot.f.style.flexWrap !== v) css(foot.f, on ? { ...FOOT2, padding: '0 50px' } : { flexWrap: 'nowrap', padding: '0' }); });
  fromTo(app.hdr, tClose, { paddingRight: 690 }, { paddingRight: 30, ...PANEL });
  keyed(hic).at(tClose + PANEL_D, { html: icon('side') + icon('dots') + icon('panelR') });
  fadeOut(taskbar, tClose + 0.4, { d: 0.3 });
  // x11「可选的」：设置 → 通用 里的那一项（ui-conversation 的 settings.prediction.title / description），缺省是开着的；灰字冒出来之前收走
  const pcd = h('div', 'card3d', world); px(pcd, 1260, 360, 540); css(pcd, { padding: '26px 30px', fontSize: '25px', '--mc': MC.def });
  pcd.innerHTML = '<div style="color:#5d626b;font-size:22px">设置 → 通用</div><div style="display:flex;align-items:flex-start;gap:24px;margin-top:12px"><div style="flex:1"><div>输入预测</div><div style="color:#5d626b;font-size:22px;line-height:1.6;margin-top:6px">使用草稿和上下文预测后续输入，Tab 填入但不发送。预测使用当前模型并计费。</div></div></div>';
  const ptg = toggleEl(pcd.lastChild, true); ptg.style.marginTop = '2px';
  pcd.dataset.name = '输入预测设置';
  rise3d(pcd, T('x11', '可选') - 0.4, { rx: 24, ry: -20, z: 400, d: 0.6 }); sfx('whoosh', T('x11', '可选') - 0.4, { g: 0.3 });
  sink3d(pcd, T('x11b', '灰色') - 0.5, { d: 0.4 });
  const typed = '把第 3 条写得更具体一些', ghostT = '，补充打开方式和一个使用示例';
  const tT5 = T('x11b', '打字') - 0.2;
  const tE5 = typeEnd(tT5, typed, 9);
  keyed(comp.send).at(tT5 + 0.1, { cls: 'send ready' });   // 打进第一个字，发送键变实色
  const tG = Math.max(tE5 + 0.8, T('x11b', '灰色') - 0.1);
  sfx('blip', tG, { g: 0.4 });
  // x12：按下 Tab，灰字变成正文
  const key = h('div', 'key', world, 'Tab'); px(key, 1300, 590); css(key, { position: 'absolute', minWidth: '150px', height: '110px', fontSize: '46px', borderRadius: '20px', background: 'linear-gradient(#3b4049, #22262d)', color: '#fff', boxShadow: '0 6px 0 #14171c, 0 18px 36px rgba(0,0,0,.35)' });   // 深色键帽：落在白色界面上看得出来
  const tTab = T('x12', 'Tab') - 0.1;
  tl.fromTo(key, { autoAlpha: 0, y: -40, rotationX: 40, transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: true }, tTab - 0.3);
  fromTo(key, tTab, { y: 0 }, { y: 8, duration: 0.08, ease: 'power2.in', immediateRender: false });
  fromTo(key, tTab + 0.08, { y: 8 }, { y: 0, duration: 0.18, ease: 'power2.out', immediateRender: false }); sfx('key', tTab, { g: 1.2 });
  inputTrack(comp.ph, PH, [
    [tT1, 'type', q1, { cps: 14 }], [tS1 + 0.35, 'text', PH],
    [tT2, 'type', q2, { cps: 16 }], [tS2 + 0.3, 'text', PH],
    [tT3, 'type', '/side', { cps: 12 }], [tS3 + 0.25, 'text', PH],
    [tT5, 'type', typed, { cps: 9 }], [tG, 'text', `<span class="ty">${typed}</span>${CUR}<span class="ghost">${ghostT}</span>`],
    [tTab + 0.08, 'text', `<span class="ty">${typed}${ghostT}</span>${CUR}`],
  ]);
  fadeOut(key, s.end - 0.5, { d: 0.3 });

  // 镜头：圈卡段停住；会话段先全景，x11 推到输入框，场末拉回
  const zc = { x: 1156, y: 700, z: 1.45 };
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    drift(tW + 1.0, tClose - 0.2, -1),
    [T('x11b', '打字') - 1.0, zc, 1.0],
    [s.end - 1.0, { x: 960, y: 540, z: 1 }, 0.9, { sfx: false }],
  ]);
});
