// 02 四种模式。一个连续的画面：首页的模式菜单（m1、m2）→ 四个菜单项升出窗口，在 3D 里排成一排，下面是同一块「内置破甲提示词」底座，
// 每张卡用一道光柱插进底座（m3）；卡片翻出各自的工具、手册与资料（m4），逐个亮起自己的颜色（m6）→ 卡片落回窗口，窗口跟着换色（m7）→
// 发出第一条消息，首页变成网安会话；模式胶囊点不动，只浮出一条提示（m8、m8b），会话继续往下跑（m9）。
scene('modes', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const bg = stageBg(world, 'def');
  const wrap = h('div', 'abs', world); css(wrap, { inset: '0' });
  const app = makeApp(wrap, { home: true, sessions: HOME_SESS });
  const hp = homePage(app);

  hp.mic.style.color = 'var(--ink)';   // 首页模式按钮的 # 图标是正文色，不随模式变色（AgentPresetSeat .seatIcon）
  app.sess[3].style.display = 'none';  // 本场新建的就是「审计上传接口」，侧栏里不再列一条同名的旧会话

  // ── 模式菜单（AgentPresetSeat 的 Menu：挂在模式按钮下面、左对齐；行 = 灰色小图标 + 名称在上、说明在下，选中的行尾一个 ✓）──
  const HOVER = 'rgba(38,49,72,.06)', HOVER0 = 'rgba(38,49,72,0)';   // --dsw-alias-interactive-bg-hover：菜单行与按钮的悬停底色
  css(hp.mchip, { padding: '4px 12px', margin: '-4px -12px', borderRadius: '10px', backgroundColor: HOVER0 });   // 按钮自带的内边距；用负外边距抵消，文字不挪
  const mb = box(hp.mchip, app.body), RH = 88;
  const menu = h('div', 'menu', app.body); px(menu, mb.x, mb.y + mb.h + 7, 380); css(menu, { padding: '7px', borderRadius: '16px' });
  menu.dataset.overlapOk = '';   // 弹出菜单浮在输入框上面（真实界面就是这样）
  const hl = h('div', 'abs', menu); css(hl, { left: '7px', right: '7px', top: '0', height: RH + 'px', borderRadius: '12px', background: HOVER });
  MODES.forEach((k) => {
    const r = h('div', 'mi', menu, `<span style="display:inline-flex;color:rgb(53,54,56)">${icon(MODE[k].ic)}</span><div style="flex:1;line-height:1.3"><div style="font-size:24px">${MODE[k].zh}</div><div style="font-size:22px;line-height:28px;color:#6b7079;margin-top:3px">${MODE[k].d}</div></div>${k === 'def' ? `<span style="display:inline-flex;color:var(--ink)">${icon('check')}</span>` : ''}`);
    css(r, { height: RH + 'px', position: 'relative', gap: '12px', padding: '0 14px' });
  });
  const tMenu = T('m1', '选模式') - 0.15;
  ringOn(app.el, hp.mchip, T('m1', '输入框') - 0.1, tMenu - 0.3, { pad: 6 });
  // 打开：只改不透明度 140ms（Menu.module.css menuEnter）；按钮在菜单开着时保持悬停底色（.seat[aria-expanded]）
  menuIn(menu, tMenu, 0.14); set(hp.mchip, tMenu, { backgroundColor: HOVER }); sfx('pop', tMenu, { g: 0.6 });
  // m2：念到哪种，指针停在哪一行——行的悬停底色是中性灰、没有过渡，直接跳到那一行
  set(hl, s.start, { autoAlpha: 0 });
  ['缺省', '网安', '逆向', '写作'].forEach((w, i) => {
    const t = T('m2', w) - 0.08;
    set(hl, t, { autoAlpha: 1, y: 7 + i * RH });
    sfx('tick', t + 0.05, { g: 0.7 });
  });

  // ── m3：菜单项升出窗口，排成 3D 里的一排卡片，落在同一块底座上 ──
  const t3 = T('m3') - 0.35;
  sink3d(wrap, t3, { z: 600, rx: 8, d: 0.7 });
  const st3 = h('div', 'abs', world); css(st3, { inset: '0' });
  const CW = 380, CH = 330, GAP = 36, X0 = 960 - (4 * CW + 3 * GAP) / 2, CY = 120;
  const slab = h('div', 'slab', st3); px(slab, X0 - 30, 640, 4 * CW + 3 * GAP + 60, 150);
  css(slab, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', fontSize: '40px', fontWeight: '700', letterSpacing: '2px', transformOrigin: '50% 0%' });
  slab.innerHTML = `<span style="opacity:.9">${whale(44, '#fff')}</span><span>内置破甲提示词</span><span style="font-weight:400;color:#c3c8d2;font-size:30px;letter-spacing:0">四种模式共用</span>`;
  slab.dataset.name = '破甲底座';
  const cards = MODES.map((k, i) => {
    const c = h('div', 'card3d', st3); px(c, X0 + i * (CW + GAP), CY, CW, CH);
    c.style.setProperty('--c', '#5b616d'); css(c, { padding: '28px 30px' });
    c.innerHTML = `<div style="display:flex;gap:16px;align-items:center"><span class="sq" style="width:58px;height:58px;border-radius:14px;display:grid;place-items:center;color:#fff;background:var(--c)">${icon(MODE[k].ic)}</span><b style="font-size:38px">${MODE[k].zh}</b><span style="color:#6b7079;font-size:24px">${MODE[k].en}</span></div>
      <div style="margin-top:14px;color:#3b3f46;font-size:26px">${MODE[k].d}</div>
      <div class="li" style="margin-top:16px;display:flex;flex-direction:column;gap:8px;font-size:25px;color:#4a4f58">${MODE[k].li.map((x) => `<div class="it"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--c);margin-right:12px;vertical-align:3px"></span>${x}</div>`).join('')}</div>
      <div class="edge" style="position:absolute;left:0;right:0;top:0;height:6px;border-radius:24px 24px 0 0;background:var(--c)"></div>`;
    c.dataset.name = MODE[k].zh + '卡片';
    return c;
  });
  const beams = MODES.map((k, i) => { const b = h('div', 'beam', st3); px(b, X0 + i * (CW + GAP) + CW / 2 - 1, CY + CH, null, 640 - CY - CH); b.style.setProperty('--c', '#8fb0ff'); css(b, { transformOrigin: '50% 0%' }); return b; });
  cards.forEach((c, i) => {
    tl.fromTo(c, { autoAlpha: 0, rotationX: 30, rotationY: (i - 1.5) * -14, z: -700, y: 160, transformPerspective: P3 },
      { autoAlpha: 1, rotationX: 8, rotationY: (i - 1.5) * -5, z: 0, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: true }, t3 + 0.15 + i * 0.08);
  });
  sfx('whoosh', t3 + 0.1, { g: 0.6 });
  const tBase = T('m3', '共用') - 0.3;
  tl.fromTo(slab, { autoAlpha: 0, rotationX: 70, y: 60, transformPerspective: P3 }, { autoAlpha: 1, rotationX: 38, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: true }, tBase);
  beams.forEach((b, i) => fromTo(b, tBase + 0.25 + i * 0.07, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.45, ease: 'power2.out' }));
  sfx('thud', tBase + 0.35, { g: 0.6 });
  // m4：工具、手册、资料逐行出现（每张卡的第 1、2、3 行跟着三个词）
  cards.forEach((c) => c.querySelectorAll('.it').forEach((e) => set(e, s.start, { autoAlpha: 0 })));
  ['工具', '手册', '资料'].forEach((w, j) => {
    const t = T('m4', w) - 0.1;
    cards.forEach((c, i) => fadeIn(c.querySelectorAll('.it')[j], t + i * 0.06, { x: -12, y: 0, d: 0.3 }));
    sfx('tick', t + 0.05, { g: 0.6 });
  });
  // m4 说完：破甲从同一块底座沿光柱依次升进四张卡（共用的那一层），卡片接住时亮一下再退回
  const tFlow = T('m4', '资料') + 0.45;
  beams.forEach((b, i) => {
    const t = tFlow + i * 0.22;
    const lit = h('div', 'abs', st3); px(lit, X0 + i * (CW + GAP) + CW / 2 - 4, CY + CH, 8, 640 - CY - CH);
    css(lit, { borderRadius: '4px', background: 'linear-gradient(0deg, #ffffff, #8fb0ff)', boxShadow: '0 0 24px 6px rgba(143,176,255,.75)', transformOrigin: '50% 100%' });
    fromTo(lit, t, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.45, ease: 'power2.in' });
    fadeOut(lit, t + 0.45, { d: 0.5 });
    const glow = h('div', 'abs', cards[i]); css(glow, { inset: '0', borderRadius: 'inherit', boxShadow: '0 0 0 4px rgba(143,176,255,.95), 0 0 70px 14px rgba(143,176,255,.55)', pointerEvents: 'none' });
    set(glow, s.start, { autoAlpha: 0 });
    fromTo(glow, t + 0.4, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'power2.out', immediateRender: false });
    fromTo(glow, t + 0.6, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut', immediateRender: false });
  });
  sfx('riser', tFlow - 0.2, { g: 0.3 });
  // 卡片在 m4 里转正一点，字好读
  cards.forEach((c, i) => fromTo(c, T('m4') - 0.2, { rotationX: 8, rotationY: (i - 1.5) * -5 }, { rotationX: 0, rotationY: (i - 1.5) * -3, duration: 1.2, ease: 'power2.inOut', immediateRender: false }));
  // m6：蓝、红、绿、黄，逐张亮起自己的颜色，光柱也跟着变色
  ['蓝', '红', '绿', '黄'].forEach((w, i) => {
    const t = T('m6', w) - 0.08;
    fromTo(cards[i], t, { '--c': '#5b616d' }, { '--c': MC[MODES[i]], duration: 0.35, ease: 'power2.out', immediateRender: false });
    fromTo(beams[i], t, { '--c': '#8fb0ff' }, { '--c': MC[MODES[i]], duration: 0.35, immediateRender: false });
    fromTo(cards[i], t, { y: 0 }, { y: -18, duration: 0.25, ease: 'power2.out', immediateRender: false });
    fromTo(cards[i], t + 0.25, { y: -18 }, { y: 0, duration: 0.35, ease: 'power2.inOut', immediateRender: false });
    sfx('pop', t + 0.05, { g: 0.6 });
  });

  // ── m7：卡片沉下去，窗口回来；窗口跟着选中的模式换色 ──
  const t7 = T('m7') - 0.45;
  cards.forEach((c, i) => fadeOut(c, t7 + i * 0.05, { y: 40, d: 0.35 }));
  fadeOut(slab, t7 + 0.1, { y: 40, d: 0.35 }); beams.forEach((b) => fadeOut(b, t7, { d: 0.25 }));
  popOut(menu, t7 - 0.1); set(hp.mchip, t7 - 0.1, { backgroundColor: HOVER0 });   // 菜单关上（120ms 淡出），按钮的悬停底色随之去掉
  rise3d(wrap, t7 + 0.25, { rx: -8, z: 500, y: -30, d: 0.8, again: true });
  const cyc = [['def', 'sec', T('m7') + 0.15], ['sec', 'rev', T('m7', '侧栏') - 0.15], ['rev', 'wri', T('m7', '按钮') - 0.15], ['wri', 'sec', Tend('m7') + 0.25]];
  cyc.forEach(([a, b, t]) => {
    modeTo(app.el, t, a, b, 0.45); modeTo(bg, t, a, b, 0.6);
    keyed(hp.mname).at(t + 0.1, { html: MODE[b].zh }); keyed(hp.mic).at(t + 0.1, { html: icon(MODE[b].ic) });
    sfx('blip', t + 0.1, { g: 0.5 });
  });
  // 发送按钮：输入框空着时是浅色（禁用态），打进第一个字 100ms 内变成实色；发出后箭头换成转圈的弧（800ms 一圈），直到会话视图接手
  const snd = hp.comp.send; css(snd, { position: 'relative' });
  snd.innerHTML = `<i style="position:absolute;inset:0;border-radius:50%;background:var(--mc)"></i><span class="ar" style="position:relative;display:grid">${icon('up')}</span>`
    + '<span class="spn" style="position:absolute;inset:0;display:grid;place-items:center"><svg width="24" height="24" viewBox="0 0 16 16"><g><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/><path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg></span>';
  const sndFill = snd.querySelector('i'), sndArrow = snd.querySelector('.ar'), sndSpin = snd.querySelector('.spn'), spinG = sndSpin.querySelector('g');
  // 侧栏里跟着换色的是工作区的文件夹图标与「低峰时段」的圆点（新会话还没有模式，色条仍是灰的）
  const wb = box(app.wsEl, app.el), fold = h('div', 'abs', app.el); px(fold, wb.x + 12, wb.cy - 12, 24, 24);
  ringOn(app.el, app.tagU, T('m7', '标题') - 0.1, T('m7', '侧栏') - 0.1, { pad: 6, r: 8 });
  ringOn(app.el, fold, T('m7', '侧栏') - 0.1, T('m7', '按钮') - 0.1, { pad: 7, r: 10 });
  ringOn(app.el, app.bal.querySelector('.dot'), T('m7', '侧栏') - 0.1, T('m7', '按钮') - 0.1, { pad: 9, r: 14 });
  ringOn(app.el, snd, T('m7', '按钮') - 0.1, Tend('m7') + 0.2, { pad: 6, r: 32 });

  // ── m8：在网安模式下发出第一条消息 → 会话建好 ──
  const msg = '审计上传接口的文件名处理，确认有没有路径穿越';
  const tType = T('m8') - 0.3;
  const tSend = Math.max(typeEnd(tType, msg, 16), T('m8', '发出去'));
  inputTrack(hp.comp.ph, hp.comp.ph.innerHTML, [[tType, 'type', msg, { cps: 16, cursorUntil: tSend }]]);
  fromTo(sndFill, tType + 1 / 16, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: 'none' });
  set(sndSpin, s.start, { autoAlpha: 0 }); set(sndSpin, tSend, { autoAlpha: 1 }); set(sndArrow, tSend, { autoAlpha: 0 }); sfx('pop', tSend);
  F((t) => { spinG.setAttribute('transform', `rotate(${((Math.max(0, t - tSend) / 0.8) % 1 * 360).toFixed(1)} 8 8)`); });
  // 会话视图：同一位置的第二扇窗口（网安），在发送时接手。侧栏里还是原来那一行：先是灰色半高的「新会话」，开始转圈
  const wrap2 = h('div', 'abs', world); css(wrap2, { inset: '0' });
  const app2 = makeApp(wrap2, { mode: 'sec', title: '新会话', sessions: [['新会话', null, true, true], ['整理发布说明', 'def'], ['修复搜索结果消失', 'def']] });
  const col = column(app2.body, { top: 30 });
  const bub = h('div', 'bubble', col, msg);
  const ts = h('div', '', col, '<span style="color:#6b7079;font-size:22px;float:right">17:32</span>');
  const inj = injects(col);
  const later = [
    step(col, 'think', '思考', '先按交战流程确认范围，再看上传路由。'),
    h('div', 'say', col, '范围确认为本地测试环境。先读取上传路由。'),
    step(col, 'search', '搜索文件内容', 'filename'),
    step(col, 'doc', '读取', '<u>server\\routes\\upload.js</u>'),
    step(col, 'think', '思考', 'filename 直接拼进 path.join，没有规范化校验'),
  ];
  const comp2 = composer(app2.body, { busy: true }); comp2.send.classList.add('ready');
  const foot2 = footbar(app2.body, { turns: '1 轮 3 步 · 199 tok/s', tok: '65.2K tok · 缓存命中 0%', cost: '¥0.14' });
  set(wrap2, s.start, { autoAlpha: 0 });
  fromTo(wrap2, tSend + 0.05, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' });
  vanish(wrap, tSend + 0.45);
  slide(bub, tSend + 0.15, { y: 30, d: 0.45 }); fadeIn(ts, tSend + 0.4, { y: 0 });
  inj.forEach((e, i) => appear(e, tSend + 0.7 + i * 0.25));
  later.forEach((e, i) => appear(e, T('m9') + 0.2 + i * 0.55));
  later.forEach((e, i) => sfx('tick', T('m9') + 0.2 + i * 0.55, { g: 0.35 }));
  // 「对话建好」：同一行原地换上标题，色条从半高长满（460ms 略过冲）、灰变红（360ms）、不透明度 .7→1（240ms），带一圈 45% 的光（Rows.module.css .modeStrip）
  const r0 = app2.sess[0], tLit = T('m8', '对话') - 0.1;
  r0.style.setProperty('--c', 'transparent');   // 行自带的 ::before 色条让位给下面这条可补间的
  const strip = h('i', '', r0); css(strip, { position: 'absolute', left: '4px', top: '11px', bottom: '11px', width: '4px', borderRadius: '2px' });
  fromTo(strip, tLit, { scaleY: 0.5 }, { scaleY: 1, duration: 0.46, ease: 'back.out(1.7)' });
  fromTo(strip, tLit, { backgroundColor: 'rgb(129,133,140)' }, { backgroundColor: MC.sec, duration: 0.36, ease: 'power2.inOut' });
  fromTo(strip, tLit, { opacity: 0.7 }, { opacity: 1, duration: 0.24, ease: 'power2.inOut' });
  fromTo(strip, tLit, { boxShadow: '0 0 0px rgba(220,38,38,0)' }, { boxShadow: '0 0 9px rgba(220,38,38,.45)', duration: 0.46, ease: 'power2.inOut' });
  keyed(r0.querySelector('.st')).at(tLit, { html: '审计上传接口' }); keyed(r0.querySelector('small')).at(tLit, { html: '刚刚' });
  keyed(app2.titleEl).at(tLit, { html: '审计上传接口' });
  ringOn(app2.el, r0, T('m8', '对话'), T('m8b') - 0.1, { pad: 4 });

  // ── m8b：模式固定。头部的模式胶囊不带锁、也不弹菜单；点它只在下面浮出一条提示（AgentPresetLabel locked + Tooltip：深灰底白字，150ms 只淡入）──
  const pb = box(app2.pill, app2.el), tTip = T('m8b', '不能') - 0.15;
  ringOn(app2.el, app2.pill, T('m8b', '固定') - 0.15, tTip - 0.3, { pad: 6, r: 16 });
  const tip = tooltip(app2.el, 0, 0, '已有对话默认不能切换模式，可在“设置 → 模式”中临时允许。');
  tip.dataset.overlapOk = ''; css(tip, { zIndex: 6 });
  px(tip, Math.max(12, pb.cx - tip.offsetWidth / 2), pb.b + 8);
  tl.fromTo(tip, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: 'power1.inOut', immediateRender: true }, tTip); sfx('tick', tTip, { g: 0.5 });
  fadeOut(tip, s.end - 0.6, { d: 0.12 });
  const n8 = note(world, 1210, 440, '<div class="k">临时允许</div>这个开关在应用重启后自动关闭', 560);
  css(n8, { '--mc': MC.sec });
  fadeIn(n8, tTip + 0.35, { x: 20 });
  fadeOut(n8, s.end - 0.6, { d: 0.25 });
  // m9：这一轮带着的工具与手册，挂一张上锁的牌子
  const n9 = note(world, 1300, 600, `<div class="k" style="display:flex;gap:8px;align-items:center">${icon('lock')} 这条会话带着</div>七类现场手册 · 案件与报告 · 独立代理`, 520);
  css(n9, { '--mc': MC.sec });
  fadeIn(n9, T('m9') - 0.1, { x: 20 });
  // 换场：整扇窗口立方体式转走，下一场（缺省模式）从右边转进来
  cubeOut(wrap2, s.end - 0.35); fadeOut(n9, s.end - 0.6, { d: 0.25 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(c0, t3 - 0.1, 1), [t3, { x: 960 }, 0.6, { sfx: false }], drift(t7 + 1.0, s.end - 0.4, 1)]);
});
