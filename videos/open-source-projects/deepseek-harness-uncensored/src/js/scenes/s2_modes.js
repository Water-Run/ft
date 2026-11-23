// 02 四种模式。一个连续的画面：首页的模式菜单（m1、m2）→ 四个菜单项升出窗口，在 3D 里排成一排，下面是同一块「内置破甲提示词」底座，
// 每张卡用一道光柱插进底座（m3）；卡片翻出各自的工具、手册与资料（m4），逐个亮起自己的颜色（m6）→ 卡片落回窗口，窗口跟着换色（m7）→
// 发出第一条消息，首页变成网安会话，模式胶囊上锁（m8、m8b），会话继续往下跑（m9）。
scene('modes', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const bg = stageBg(world, 'def');
  const wrap = h('div', 'abs', world); css(wrap, { inset: '0' });
  const app = makeApp(wrap, { home: true, sessions: HOME_SESS });
  const hp = homePage(app);

  // ── 模式菜单（挂在模式按钮下面）──
  const mb = box(hp.mchip, app.body);
  const menu = h('div', 'menu', app.body); px(menu, mb.x - 12, mb.y + mb.h + 10, 660);
  const rows = MODES.map((k) => {
    const r = h('div', 'mi', menu, `<span class="sq" style="background:${MC[k]}">${icon(MODE[k].ic)}</span><div><div><b style="font-size:28px">${MODE[k].zh}</b><span class="en">${MODE[k].en}</span></div><div class="ds">${MODE[k].d}</div></div>`);
    return r;
  });
  const hl = h('div', 'abs', menu); css(hl, { left: '10px', right: '10px', height: '96px', borderRadius: '12px', background: 'rgba(37,99,235,.08)', zIndex: '-1' });
  rows.forEach((r) => css(r, { height: '96px', position: 'relative' }));
  const tMenu = T('m1', '选模式') - 0.15;
  ringOn(app.el, hp.mchip, T('m1', '输入框') - 0.1, tMenu + 0.2, { pad: 8 });
  tl.fromTo(menu, { autoAlpha: 0, y: -14, rotationX: -18, transformOrigin: '50% 0%', transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.45, ease: 'power3.out', immediateRender: true }, tMenu);
  sfx('pop', tMenu, { g: 0.6 });
  fromTo(hp.comp.c, tMenu, { opacity: 1 }, { opacity: 0.12, duration: 0.3 });
  // m2：念到哪种，高亮条移到哪一行
  set(hl, s.start, { autoAlpha: 0 });
  let prevY = 10;
  ['缺省', '网安', '逆向', '写作'].forEach((w, i) => {
    const t = T('m2', w) - 0.08, y = 10 + i * 96;
    if (i === 0) fromTo(hl, t, { autoAlpha: 0, y }, { autoAlpha: 1, duration: 0.2 });
    else fromTo(hl, t, { y: prevY }, { y, duration: 0.22, ease: 'power2.out', immediateRender: false });
    fromTo(hl, t, { backgroundColor: i ? `color-mix(in srgb, ${MC[MODES[i - 1]]} 10%, transparent)` : 'rgba(37,99,235,.10)' }, { backgroundColor: `color-mix(in srgb, ${MC[MODES[i]]} 12%, transparent)`, duration: 0.22, immediateRender: false });
    sfx('tick', t + 0.05, { g: 0.7 }); prevY = y;
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
  fadeOut(menu, t7 - 0.1, { d: 0.01 }); fromTo(hp.comp.c, t7, { opacity: 0.12 }, { opacity: 1, duration: 0.3, immediateRender: false });
  rise3d(wrap, t7 + 0.25, { rx: -8, z: 500, y: -30, d: 0.8, again: true });
  app.sess[0].style.setProperty('--c', 'var(--mc)');
  const cyc = [['def', 'sec', T('m7') + 0.15], ['sec', 'rev', T('m7', '侧栏') - 0.15], ['rev', 'wri', T('m7', '按钮') - 0.15], ['wri', 'sec', Tend('m7') + 0.25]];
  cyc.forEach(([a, b, t]) => {
    modeTo(app.el, t, a, b, 0.45); modeTo(bg, t, a, b, 0.6);
    keyed(hp.mname).at(t + 0.1, { html: MODE[b].zh }); keyed(hp.mic).at(t + 0.1, { html: icon(MODE[b].ic) });
    sfx('blip', t + 0.1, { g: 0.5 });
  });
  hp.comp.send.classList.add('ready');
  ringOn(app.el, app.tagU, T('m7', '标题') - 0.1, T('m7', '侧栏') - 0.1, { pad: 6, r: 8 });
  ringOn(app.el, app.sess[0], T('m7', '侧栏') - 0.1, T('m7', '按钮') - 0.1, { pad: 4 });
  ringOn(app.el, hp.comp.send, T('m7', '按钮') - 0.1, Tend('m7') + 0.2, { pad: 6, r: 32 });

  // ── m8：在网安模式下发出第一条消息 → 会话建好 ──
  const msg = '审计上传接口的文件名处理，确认有没有路径穿越';
  const tType = T('m8') - 0.3;
  const tSend = Math.max(typeEnd(tType, msg, 16), T('m8', '发出去'));
  inputTrack(hp.comp.ph, hp.comp.ph.innerHTML, [[tType, 'type', msg, { cps: 16, cursorUntil: tSend }]]);
  fromTo(hp.comp.send, tSend - 0.05, { scale: 1 }, { scale: 0.85, duration: 0.1, immediateRender: false });
  fromTo(hp.comp.send, tSend + 0.05, { scale: 0.85 }, { scale: 1, duration: 0.2, immediateRender: false }); sfx('pop', tSend);
  // 会话视图：同一位置的第二扇窗口（网安），在发送时接手
  const wrap2 = h('div', 'abs', world); css(wrap2, { inset: '0' });
  const app2 = makeApp(wrap2, { mode: 'sec', title: '审计上传接口', sessions: [['审计上传接口', 'sec', true, true], ['整理发布说明', 'def'], ['修复搜索结果消失', 'def']] });
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
  // 「对话建好」：侧栏多出这条会话（红色条、转圈）
  fromTo(app2.sess[0], T('m8', '对话') - 0.1, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'back.out(1.6)' });
  ringOn(app2.el, app2.sess[0], T('m8', '对话'), T('m8b') - 0.1, { pad: 4 });

  // ── m8b：模式胶囊上锁；再点开，其他三种模式是灰的 ──
  const lock = h('span', '', app2.pill, icon('lock')); css(lock, { display: 'inline-flex', marginLeft: '4px' });
  const tLock = T('m8b', '固定') - 0.1;
  slam(lock, tLock, { from: 1.8 }); sfx('thud', tLock + 0.05, { g: 0.6 });
  const pb = box(app2.pill, app2.el);
  const mm = h('div', 'menu', app2.el); px(mm, pb.x, pb.y + pb.h + 12, 460); css(mm, { zIndex: 6 }); mm.dataset.overlapOk = '';
  MODES.forEach((k) => {
    const on = k === 'sec';
    h('div', 'mi', mm, `<span class="sq" style="background:${on ? MC[k] : '#c9ccd2'};width:42px;height:42px">${icon(MODE[k].ic)}</span><span style="color:${on ? 'var(--ink)' : '#6b7079'}">${MODE[k].zh}</span><span style="margin-left:auto;color:${on ? MC[k] : '#7d828b'}">${on ? icon('check') : icon('lock')}</span>`);
  });
  tl.fromTo(mm, { autoAlpha: 0, y: -10, rotationX: -18, transformOrigin: '50% 0%', transformPerspective: P3 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.4, ease: 'power3.out', immediateRender: true }, T('m8b', '不能') - 0.25);
  sfx('error', T('m8b', '不能'), { g: 0.35 });
  const n8 = note(world, 1150, 440, '<div class="k">默认情况下</div>要给已有会话换模式：设置 → 模式，临时打开「允许已有会话切换模式」，重启后自动关闭', 640);
  css(n8, { '--mc': MC.sec });
  fadeIn(n8, T('m8b', '不能') + 0.1, { x: 20 });
  fadeOut(mm, T('m9') + 0.1, { d: 0.3 }); fadeOut(n8, T('m9', '工具') - 0.3, { d: 0.3 });
  // m9：这一轮带着的工具与手册，挂一张上锁的牌子
  const n9 = note(world, 1300, 600, `<div class="k" style="display:flex;gap:8px;align-items:center">${icon('lock')} 这条会话带着</div>七类现场手册 · 案件记录与报告 · 独立代理`, 520);
  css(n9, { '--mc': MC.sec });
  fadeIn(n9, T('m9', '工具') - 0.1, { x: 20 });
  // 换场：整扇窗口立方体式转走，下一场（缺省模式）从右边转进来
  cubeOut(wrap2, s.end - 0.35); fadeOut(n9, s.end - 0.6, { d: 0.25 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(c0, t3 - 0.1, 1), [t3, { x: 960 }, 0.6, { sfx: false }], drift(t7 + 1.0, s.end - 0.4, 1)]);
});
