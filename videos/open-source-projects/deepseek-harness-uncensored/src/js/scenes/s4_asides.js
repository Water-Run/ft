// 03 通用增强 · 旁问、随问与输入预测。开头六项增强排成一圈 3D 的卡片转过来（x1、x1b），随后都收进同一条正在跑长任务的会话：
// /btw 随问的卡片浮在输入框上方（x3–x3c）；/side 旁问从右边像一扇门转开（x4–x6b）；关上旁问，镜头推到输入框，演示输入预测（x11–x12）。
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
  const taskbar = h('div', 'abs', app.body); css(taskbar, { left: '174px', bottom: '196px', width: '1040px', display: 'flex', gap: '14px', alignItems: 'center', color: '#5d626c', fontSize: '22px', border: '1px solid var(--line)', borderRadius: '12px', padding: '8px 18px', background: '#fff' });
  taskbar.innerHTML = `${icon('tasks')}<b style="color:var(--ink);font-weight:500">任务</b> 1 已完成 · 1 进行中 · 1 待处理`;
  const foot = footbar(app.body, { turns: '1 轮 2 步 · 449 tok/s', tok: '43.3K tok · 缓存命中 0%', cost: '¥0.09' });
  const tW = T('x2') - 0.7;
  rise3d(wrap, tW, { rx: 14, z: 700, y: 50, d: 1.0 }); sfx('whoosh', tW, { g: 0.5 });
  [...L, run].forEach((e) => appear(e, tW));
  // 主线一直在动：转圈、计时
  const spin = app.sess[0].querySelector('.spin');
  F((t) => { spin.style.transform = `rotate(${((t * 360) % 360).toFixed(1)}deg)`; });

  // ── x3：/btw 随问 ──
  const PH = '发消息或创建任务，/ 调用指令，@ 文件或对话';
  const tT1 = T('x3', '/btw') - 0.6;
  const q1 = '/btw 进度如何';
  const tS1 = typeEnd(tT1, q1, 14);
  sfx('pop', tS1 + 0.3);
  const btw = (q, a) => { const c = h('div', 'abs', app.body); css(c, { left: '174px', bottom: '252px', width: '1040px', border: '1px solid var(--line)', borderRadius: '16px', background: '#fff', boxShadow: '0 12px 36px rgba(0,0,0,.10)', padding: '14px 20px', whiteSpace: 'normal', fontSize: '23px', lineHeight: '1.55' }); c.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span style="display:inline-flex;gap:8px;align-items:center">${icon('plus')} 随问</span>${icon('x')}</div><div style="border-left:3px solid var(--mc);padding-left:12px;color:#5d626b;margin:8px 0">${q}</div><div>${a}</div>`; return c; };
  const b1 = btw('进度如何', '主线正在进行第 2 项“升级并修复失败的测试”：已列出可升级的依赖，刚读完 <code>tests/search.test.mjs</code>，正在分析失败原因。变更说明还没开始写。');
  b1.dataset.name = '随问卡片';
  tl.fromTo(b1, { autoAlpha: 0, y: 30, rotationX: -25, transformOrigin: '50% 100%', transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.5, ease: 'power3.out', immediateRender: true }, tS1 + 0.4);
  // x3b：Claude Code 的 /btw 是什么
  const nCC = note(world, 1110, 392, '<div class="k">CLAUDE CODE /btw</div>问一句当前会话的事，答案不进对话记录', 560);
  fadeIn(nCC, T('x3b', 'Claude') - 0.1, { x: 20 }); fadeOut(nCC, T('x3c') + 0.6, { d: 0.3 });
  // x3c：再问一句，新卡片替换旧卡片
  const q2 = '/btw 这个报错什么意思';
  const tT2 = T('x3c', '简单') - 0.4;
  const tS2 = typeEnd(tT2, q2, 16);
  const b2 = btw('这个报错什么意思', '断言还按旧版本的返回格式在比；升级后字段名变了，所以这条测试失败，不是搜索逻辑本身的问题。');
  flip3d(b1, b2, tS2 + 0.2, 0.6); sfx('pop', tS2 + 0.5);
  fadeOut(b2, T('x4') - 0.2, { y: 20, d: 0.3 });

  // ── x4：/side 旁问，从右边像一扇门转开 ──
  const tT3 = T('x4', 'side') - 0.6;
  const tS3 = typeEnd(tT3, '/side', 12);
  const side = h('div', 'abs', app.main); css(side, { right: '0', top: '0', bottom: '0', width: '660px', background: '#fff', borderLeft: '1px solid var(--line)', whiteSpace: 'normal', zIndex: 4 });
  side.innerHTML = `<div style="height:80px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px;padding:0 22px"><span class="chip" style="background:#f1f2f4">${icon('side')} 旁问 <span style="color:#6b7079">${icon('x', 'style="width:20px;height:20px"')}</span></span><span style="color:#6b7079">${icon('plain')}</span><span style="margin-left:auto;display:inline-flex;gap:18px;color:#646973">${icon('split')}${icon('full')}${icon('panelR')}</span></div>
    <div class="sync" style="color:#5d626b;font-size:22px;padding:12px 24px">每次提问前同步主线已完成的新进展，旁问内容独立保留</div>
    <div class="sc" style="padding:6px 24px;display:flex;flex-direction:column;gap:12px;font-size:23px;line-height:1.55"></div>`;
  const sc = side.querySelector('.sc'), sync = side.querySelector('.sync');
  const sq = h('div', 'bubble', sc, '已完成的那一项里，有没有改了导出名的依赖？'); css(sq, { maxWidth: '520px' });
  const sa = [step(sc, 'inject', '上下文注入', 'runtime-context'), h('div', 'say', sc, '有两个：一个改了默认导出，一个改成只提供 ESM。主线后面修测试时会碰到。')];
  const scomp = composer(side, { ph: '旁问：在这里输入你的问题', pw: 660, w: 600 });
  const tSide = tS3 + 0.3;
  tl.fromTo(side, { rotationY: -80, autoAlpha: 0, transformOrigin: '100% 50%', transformPerspective: P3 }, { rotationY: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', immediateRender: true }, tSide);
  sfx('whoosh', tSide, { g: 0.5 });
  // 主线这一栏挪到左边、收窄，给旁问让位
  fromTo(col, tSide, { left: 174, width: 1040 }, { left: 34, width: 660, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  fromTo(comp.c, tSide, { left: 154, width: 1080 }, { left: 24, width: 680, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  fromTo(taskbar, tSide, { left: 174, width: 1040 }, { left: 34, width: 660, duration: 0.8, ease: 'power3.inOut', immediateRender: false });
  fadeOut(foot.f, tSide, { d: 0.3 });
  // x4b：Codex 的 /side 是什么
  const nCX = note(world, 1290, 430, '<div class="k">CODEX /side</div>不打断主对话的临时旁聊', 500);
  fadeIn(nCX, T('x4b', 'Codex') - 0.1, { y: 14 }); fadeOut(nCX, T('x5') + 0.2, { d: 0.3 });
  // x5、x5b：同步主线已完成的进展——那一行从主线飞进旁问
  ringOn(app.el, sync, T('x5b', '自动') - 0.2, T('x6') - 0.1, { pad: 4 });
  const ghost = h('div', 'chip', world, `${icon('check')} 主线已完成：列出可升级的依赖`); css(ghost, { position: 'absolute', background: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,.35)', fontSize: '22px', color: '#15803D' });
  const gb = box(L[2], world);
  px(ghost, gb.x - 140, gb.y);
  fromTo(ghost, T('x5b', '完成') - 0.4, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, { autoAlpha: 1, x: 940, y: 60, scale: 0.95, duration: 0.9, ease: 'power3.inOut' });
  fadeOut(ghost, T('x5b', '完成') + 0.7, { d: 0.3 });
  sfx('whoosh', T('x5b', '完成') - 0.4, { g: 0.4 });
  slide(sq, T('x5') + 0.1, { y: 20, d: 0.4 }); sa.forEach((e, i) => appear(e, T('x5', '对话') + 0.2 + i * 0.5));
  // x6：/clear 清掉旁问自己的记录
  const tT4 = T('x6', 'clear') - 0.6;
  const tS4 = typeEnd(tT4, '/clear', 12);
  inputTrack(scomp.ph, '旁问：在这里输入你的问题', [[tT4, 'type', '/clear', { cps: 12 }], [tS4 + 0.25, 'text', '旁问：在这里输入你的问题']]);
  [sq, ...sa].forEach((e, i) => fadeOut(e, tS4 + 0.3 + i * 0.06, { y: -16, d: 0.3 })); sfx('whoosh', tS4 + 0.3, { g: 0.3 });
  // x6b：设置 → 通用 里的那个开关（真实界面的文字）
  const st = h('div', 'card3d', world); px(st, 1170, 330, 620, 170); css(st, { padding: '24px 28px', fontSize: '25px', '--mc': MC.def });
  st.innerHTML = '<div style="color:#5d626b;font-size:22px">设置 → 通用</div><div style="display:flex;align-items:center;gap:16px;margin-top:10px"><div style="flex:1">旁问关闭后自动清除上下文</div></div>';
  const tg = toggleEl(st.lastChild);
  rise3d(st, T('x6b') - 0.3, { rx: 24, ry: -20, z: 400, d: 0.6 }); toggleOn(tg, T('x6b', '关掉') - 0.1);
  sink3d(st, T('x11') - 0.6, { d: 0.4 });

  // ── x11–x12：关上旁问，镜头推到输入框，演示输入预测 ──
  const tClose = T('x11') - 0.6;
  tl.fromTo(side, { rotationY: 0, autoAlpha: 1 }, { rotationY: -80, autoAlpha: 0, duration: 0.6, ease: 'power2.in', immediateRender: false }, tClose);
  fromTo(col, tClose, { left: 34, width: 660 }, { left: 174, width: 1040, duration: 0.7, ease: 'power3.inOut', immediateRender: false });
  fromTo(comp.c, tClose, { left: 24, width: 680 }, { left: 154, width: 1080, duration: 0.7, ease: 'power3.inOut', immediateRender: false });
  fromTo(taskbar, tClose, { left: 34, width: 660 }, { left: 174, width: 1040, duration: 0.7, ease: 'power3.inOut', immediateRender: false });
  fadeIn(foot.f, tClose + 0.4, { y: 0 });
  // 任务跑完了：转圈停、按钮回到发送
  keyed(comp.send).at(tClose, { html: icon('up') }); fadeOut(run, tClose, { d: 0.2 }); fadeOut(taskbar, tClose + 0.4, { d: 0.3 });
  const n11 = note(world, 1210, 440, '<div class="k">可选</div>设置 → 通用 里可以关掉；预测调用当前模型，会计费', 560);
  fadeIn(n11, T('x11', '可选') - 0.1, { x: 20 }); fadeOut(n11, T('x11b', '灰色') - 0.6, { d: 0.3 });
  const typed = '把第 3 条写得更具体一些', ghostT = '，补充打开方式和一个使用示例';
  const tT5 = T('x11b', '打字') - 0.2;
  const tE5 = typeEnd(tT5, typed, 9);
  const tG = Math.max(tE5 + 0.8, T('x11b', '灰色') - 0.1);
  sfx('blip', tG, { g: 0.4 });
  // x12：按下 Tab，灰字变成正文
  const key = h('div', 'key', world, 'Tab'); px(key, 1530, 600);
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
    [T('x11') + 0.3, zc, 1.1],
    [s.end - 1.0, { x: 960, y: 540, z: 1 }, 0.9, { sfx: false }],
  ]);
});
